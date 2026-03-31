// ── ScapeAPI Server ───────────────────────────────────────────────────────
// Command-based game engine. The game is the API.

const WebSocket = require('ws');
const http = require('http');

// Engine
const tick = require('./engine/tick');
const events = require('./engine/events');
const commands = require('./engine/commands');
const persistence = require('./engine/persistence');
const plugins = require('./engine/plugins');

// World
const tiles = require('./world/tiles');
const walls = require('./world/walls');
const pathfinding = require('./world/pathfinding');
const npcs = require('./world/npcs');
const objects = require('./world/objects');

// Player
const { createPlayer, combatLevel, getLevel, getXp, addXp, totalLevel,
  getBoostedLevel, calcWeight,
  invAdd, invRemove, invCount, invFreeSlots, SKILLS, EQUIP_SLOTS,
  SPAWN_X, SPAWN_Y, INV_SIZE, xpForLevel, levelForXp,
  getLevelUpMessage } = require('./player/player');

// Combat
const combat = require('./combat/combat');

// AI
const ai = require('./ai/dialogue');
const ollama = require('./ai/ollama');

// Data systems
const items = require('./data/items');
const recipes = require('./data/recipes');
const shopSystem = require('./data/shops');
const questSystem = require('./data/quests');
const droptables = require('./data/droptables');
const slayerSystem = require('./data/slayer');
const ge = require('./data/ge');
const actions = require('./engine/actions');
const registerAllCommands = require('./commands/all');

// ── State ─────────────────────────────────────────────────────────────────────
const PORT = 2223;
const players = new Map(); // ws → player
const playersByName = new Map(); // name → player
const groundItems = []; // [{ id, name, x, y, layer, count, owner, despawnTick }]
let nextItemId = 1;
const clans = new Map(); // clanName → { owner, members: Set, name }
// Load clans from persistence on startup
const clansFile = persistence.load('clans.json');
if (clansFile) {
  for (const [name, data] of Object.entries(clansFile)) {
    clans.set(name.toLowerCase(), { owner: data.owner, members: new Set(data.members), name: data.name });
  }
}

// ── Session Logger ────────────────────────────────────────────────────────────
const fs = require('fs');
const path = require('path');
const LOGS_DIR = path.join(__dirname, '..', 'data', 'logs');
const sessionLogs = new Map(); // ws → { file, stream }

function startSessionLog(ws, playerName) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${playerName}_${ts}.jsonl`;
  const filepath = path.join(LOGS_DIR, filename);
  const stream = fs.createWriteStream(filepath, { flags: 'a' });
  const startTick = tick.getTick();
  sessionLogs.set(ws, { file: filename, stream, startTick });
  console.log(`[log] Recording session → ${filename}`);
}

function logEntry(ws, type, text) {
  const session = sessionLogs.get(ws);
  if (!session) return;
  const t = tick.getTick();
  const tickOffset = t - session.startTick;
  session.stream.write(JSON.stringify({ tick: tickOffset, type, text }) + '\n');
}

function endSessionLog(ws) {
  const session = sessionLogs.get(ws);
  if (!session) return;
  const t = tick.getTick();
  session.stream.write(JSON.stringify({ tick: t - session.startTick, type: 'end', text: 'Session ended' }) + '\n');
  session.stream.end();
  sessionLogs.delete(ws);
}

// ── XP drop helper (feature 11) ──────────────────────────────────────────────
const SKILL_SHORT = {
  attack: 'Att', strength: 'Str', defence: 'Def', hitpoints: 'HP',
  ranged: 'Range', prayer: 'Prayer', magic: 'Magic', runecrafting: 'RC',
  construction: 'Con', agility: 'Agil', herblore: 'Herb', thieving: 'Thieving',
  crafting: 'Craft', fletching: 'Fletch', slayer: 'Slay', hunter: 'Hunter',
  mining: 'Mining', smithing: 'Smith', fishing: 'Fish', cooking: 'Cook',
  firemaking: 'FM', woodcutting: 'WC', farming: 'Farm',
};
function xpDrop(skill, xp) {
  return ` (+${typeof xp === 'number' && xp % 1 !== 0 ? xp.toFixed(1) : xp} ${SKILL_SHORT[skill] || skill})`;
}

// ── Helper ────────────────────────────────────────────────────────────────────
function send(ws, msg) {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg));
}

function sendText(ws, text) {
  send(ws, { t: 'msg', text });
  logEntry(ws, 'out', text);
}

function broadcast(msg) {
  for (const [ws] of players) send(ws, msg);
}

function findPlayer(name) {
  return playersByName.get(name.toLowerCase());
}

// ── Movement Tick ─────────────────────────────────────────────────────────────
function movementTick(currentTick) {
  for (const [ws, p] of players) {
    if (p.path.length === 0) continue;

    // Walk 1 tile
    const step = p.path.shift();
    p.x = step.x;
    p.y = step.y;

    // If running and path still has steps, take a second step
    if (p.running && p.path.length > 0 && p.runEnergy > 0) {
      const step2 = p.path.shift();
      p.x = step2.x;
      p.y = step2.y;
      // Recalculate weight to ensure accuracy (feature 4)
      calcWeight(p, (id) => items.get(id));
      // Drain energy: 67 + floor(67 × weight / 64) per tile while running
      const drain = 67 + Math.floor(67 * Math.max(0, p.weight) / 64);
      p.runEnergy = Math.max(0, p.runEnergy - drain);
      if (p.runEnergy <= 0) {
        p.running = false;
        sendText(ws, "You're out of run energy.");
      }
    }

    if (actions.isActive(p)) actions.cancel(p);
    events.emit('player_move', { player: p, ws });

    // ── Music system: unlock tracks on area entry ──
    const moveArea = tiles.getArea(p.x, p.y, p.layer);
    if (moveArea) {
      const trackMap = {
        spawn: 'Newbie Melody', town: 'Harmony', fields: 'Autumn Voyage',
        forest: 'Flute Salad', hunting_grounds: 'Country Jig', mines: 'Dwarven Domain',
        dock: 'Sea Shanty 2', goblin_village: 'Goblin Game', giant_plains: 'Scape Main',
        wilderness_border: 'Wilderness', wilderness: 'Dark Wilderness',
        kbd_lair: 'Dragon Slayer', mole_den: 'Subterranea', barrows: 'Barrows',
        duel_arena: 'Duel Arena', air_altar: 'Rune Essence',
        water_altar: 'Waterfall', earth_altar: 'Crystal Cave', fire_altar: 'Volcanic',
      };
      const track = trackMap[moveArea.id];
      if (track) {
        if (!p.unlockedTracks) p.unlockedTracks = [];
        if (!p.unlockedTracks.includes(track)) {
          p.unlockedTracks.push(track);
          sendText(ws, `Music unlocked: ${track}`);
        }
        if (p.currentTrack !== track) {
          p.currentTrack = track;
        }
      }
    }

    // Check wilderness entry
    if (p.y <= 55) {
      const wildyLevel = 55 - p.y;
      const wasInWildy = (p._lastWildyCheck || false);
      if (!wasInWildy) {
        sendText(ws, `Warning: You are entering the Wilderness! (Level ${wildyLevel}) PvP is enabled here.`);
      }
      p._lastWildyCheck = true;
    } else {
      p._lastWildyCheck = false;
    }

    // If path is now empty and we have a pending gather, start it
    if (p.path.length === 0 && p._pendingGather) {
      const pg = p._pendingGather;
      delete p._pendingGather;
      const obj = objects.objects.get(pg.objKey);
      if (obj && !obj.depleted) {
        const dist = Math.max(Math.abs(p.x - obj.x), Math.abs(p.y - obj.y));
        if (dist <= 1) {
          const result = startGathering(p, ws, pg.skill, pg.verb, obj);
          if (result) sendText(ws, result);
        }
      }
    }
  }

  // Regen run energy for stationary players
  for (const [ws, p] of players) {
    if (p.path.length === 0 && p.runEnergy < 10000) {
      const agilityLevel = getLevel(p, 'agility');
      const regen = Math.floor(agilityLevel * 0.45) + 8;
      p.runEnergy = Math.min(10000, p.runEnergy + regen);
    }
  }
}

// ── Combat Tick ───────────────────────────────────────────────────────────────
function combatTick(currentTick) {
  // PvP combat
  for (const [ws, p] of players) {
    if (!p.pvpTarget) continue;
    // Find target player
    let targetWs = null, target = null;
    for (const [tw, tp] of players) {
      if (tp.id === p.pvpTarget) { targetWs = tw; target = tp; break; }
    }
    if (!target || !target.connected) { p.pvpTarget = null; p.busy = false; continue; }
    const dist = Math.max(Math.abs(p.x - target.x), Math.abs(p.y - target.y));
    if (dist > 1) {
      const adjPath = pathfinding.findAdjacentPath(p.x, p.y, target.x, target.y, p.layer);
      if (adjPath && adjPath.length > 0) p.path = adjPath;
      continue;
    }
    if (currentTick < p.nextAttackTick) continue;
    p.nextAttackTick = currentTick + combat.getAttackSpeed(p);
    const result = combat.meleeAttack(p, target);
    target.hp = Math.max(0, target.hp - result.damage);
    let msg = result.hit ? `You hit ${target.name} for ${result.damage} damage.` : `You miss ${target.name}.`;
    combat.combatXp(p, result.damage);
    sendText(ws, msg);
    if (result.damage > 0) sendText(targetWs, `${p.name} hits you for ${result.damage}. HP: ${target.hp}/${target.maxHp}`);
    if (target.hp <= 0) {
      p.pvpTarget = null; p.busy = false;
      sendText(ws, `You have defeated ${target.name}!`);
      // Target dies — same death mechanics
      target.deathCount = (target.deathCount || 0) + 1;
      sendText(targetWs, `Oh dear, you are dead! Killed by ${p.name}. Total deaths: ${target.deathCount}`);
      target.hp = target.maxHp; target.x = SPAWN_X; target.y = SPAWN_Y; target.layer = 0;
      target.combatTarget = null; target.pvpTarget = null; target.busy = false; target.path = [];
      target.prayerPoints = getLevel(target, 'prayer'); target.activePrayers.clear(); target.runEnergy = 10000;
    }
    // Auto retaliate
    if (target.hp > 0 && target.autoRetaliate && !target.pvpTarget && !target.combatTarget) {
      target.pvpTarget = p.id; target.busy = true;
      if (!target.skull) target.skull = 0; // Don't skull on retaliation
    }
  }

  // NPC combat
  for (const [ws, p] of players) {
    if (!p.combatTarget) continue;
    const npc = npcs.getNpc(p.combatTarget);
    if (!npc || npc.dead) { p.combatTarget = null; p.busy = false; continue; }

    // Determine combat type: ranged if bow+arrows equipped
    const isRanged = combat.hasRangedSetup(p);
    const requiredRange = isRanged ? combat.getRangedRange(p) : 1;

    // Check range
    const dist = Math.max(Math.abs(p.x - npc.x), Math.abs(p.y - npc.y));
    if (dist > requiredRange) {
      // Path to target — for ranged, get within range; for melee, adjacent
      if (isRanged) {
        const path = pathfinding.findPath(p.x, p.y, npc.x, npc.y, p.layer);
        if (path && path.length > requiredRange) p.path = path.slice(0, -(requiredRange));
      } else {
        const path = pathfinding.findPath(p.x, p.y, npc.x, npc.y, p.layer);
        if (path && path.length > 1) p.path = path.slice(0, -1); // Walk to adjacent
      }
      continue;
    }

    // NPC retaliates independently — runs even when player is on cooldown
    if (!npc.dead && npc.combat > 0 && currentTick >= npc.nextAttackTick) {
      npc.target = p.id;
      npc.nextAttackTick = currentTick + npc.attackSpeed;
      const npcHit = Math.random() < 0.5;
      const npcDmg = npcHit ? Math.floor(Math.random() * (npc.maxHit + 1)) : 0;
      p.hp = Math.max(0, p.hp - npcDmg);
      if (npcDmg > 0) sendText(ws, `The ${npc.name} hits you for ${npcDmg} damage. HP: ${p.hp}/${p.maxHp}`);
      if (p.hp <= 0) {
        sendText(ws, 'Oh dear, you are dead!');
        p.hp = p.maxHp; p.x = SPAWN_X; p.y = SPAWN_Y; p.layer = 0;
        p.combatTarget = null; p.busy = false; p.path = [];
        events.emit('player_death', { player: p, ws, killer: npc });
        continue;
      }
    }

    // Player attack on cooldown — skip player attack but NPC already attacked above
    if (currentTick < p.nextAttackTick) continue;
    p.nextAttackTick = currentTick + combat.getAttackSpeed(p);

    let result, combatType = 'melee';
    if (isRanged) {
      // Consume 1 arrow
      const ammo = p.equipment.ammo;
      if (!ammo || ammo.count < 1) {
        sendText(ws, 'You have no arrows left!');
        p.combatTarget = null; p.busy = false;
        continue;
      }
      ammo.count = (ammo.count || 1) - 1;
      if (ammo.count <= 0) delete p.equipment.ammo;
      result = combat.rangedAttack(p, npc);
      combatType = 'ranged';
    } else {
      result = combat.meleeAttack(p, npc);
    }
    npc.hp = Math.max(0, npc.hp - result.damage);

    let msg = result.hit
      ? `You hit the ${npc.name} for ${result.damage} damage.`
      : `You miss the ${npc.name}.`;

    if (npc.hp <= 0) {
      npc.dead = true;
      npc.respawnAt = currentTick + npc.respawnTicks;
      p.combatTarget = null;
      p.busy = false;
      msg += ` The ${npc.name} is dead!`;

      // ── Kill count tracking (feature 6) ──
      if (!p.killCounts) p.killCounts = {};
      const kcKey = npc.name.toLowerCase();
      p.killCounts[kcKey] = (p.killCounts[kcKey] || 0) + 1;
      events.emit('npc_kill', { player: p, ws, npc, killCount: p.killCounts[kcKey] });

      // ── Boss KC tracking ──
      const BOSS_IDS = ['king_black_dragon', 'giant_mole', 'dharok', 'verac', 'guthan', 'ahrim', 'karil', 'torag'];
      if (BOSS_IDS.includes(npc.defId)) {
        if (!p.bossKills) p.bossKills = {};
        p.bossKills[npc.defId] = (p.bossKills[npc.defId] || 0) + 1;
        msg += `\n  Boss KC: ${npc.name} — ${p.bossKills[npc.defId]}`;
      }

      // Drop loot (use drop tables if defined, fallback to NPC inline drops)
      const drops = droptables.tables.has(npc.defId) ? droptables.roll(npc.defId) : npcs.rollDrops(npc);
      for (const drop of drops) {
        groundItems.push({ id: nextItemId++, ...drop, x: npc.x, y: npc.y, layer: npc.layer, owner: p.id, despawnTick: currentTick + 200 });
        msg += `\n  Loot: ${drop.name} x${drop.count}`;
        // ── Loot tracker (feature 8) ──
        if (!p.lootTracker) p.lootTracker = {};
        if (!p.lootTracker[kcKey]) p.lootTracker[kcKey] = [];
        const dropDef = items.get(drop.id);
        const dropValue = (dropDef?.value || 0) * drop.count;
        p.lootTracker[kcKey].push({ id: drop.id, name: drop.name, count: drop.count, value: dropValue });
        p.lootTrackerTotal = (p.lootTrackerTotal || 0) + dropValue;
        // ── Collection log (feature 2) ──
        if (!p.collectionLog) p.collectionLog = {};
        const clogCat = dropDef?.category === 'clue' ? 'clue_rewards' : dropDef?.category === 'boss' ? 'boss_drops' : 'monster_drops';
        if (!p.collectionLog[clogCat]) p.collectionLog[clogCat] = [];
        if (!p.collectionLog[clogCat].includes(drop.id) && drop.id !== 0 && drop.id !== 100 && drop.id !== 101) {
          p.collectionLog[clogCat].push(drop.id);
        }
      }

      // Slayer task tracking
      if (p.slayerTask && npc.name.toLowerCase() === p.slayerTask.monster.toLowerCase()) {
        p.slayerTask.remaining--;
        if (p.slayerTask.remaining <= 0) {
          const slayResult = slayerSystem.completeTask(p);
          addXp(p, 'slayer', npc.maxHp); // slayer XP = monster HP
          msg += `\n  Slayer task complete! +${slayResult.points} points (streak: ${slayResult.streak})`;
          // Track slayer tasks for achievement
          if (!p.achievementProgress) p.achievementProgress = {};
          p.achievementProgress._slayer_tasks = (p.achievementProgress._slayer_tasks || 0) + 1;
        } else {
          addXp(p, 'slayer', npc.maxHp);
          msg += `\n  Slayer: ${p.slayerTask.remaining} remaining`;
        }
      }

      // Combat XP
      const xpResult = combatType === 'ranged' ? combat.rangedCombatXp(p, result.damage) : combat.combatXp(p, result.damage);
      if (xpResult.levelUp) {
        const sk = xpResult.levelUp.skill;
        const lv = xpResult.levelUp.level;
        const skCap = sk.charAt(0).toUpperCase() + sk.slice(1);
        const unlock = getLevelUpMessage(sk, lv);
        msg += `\n  Congratulations! ${skCap} level ${lv}!`;
        if (unlock) msg += ` ${unlock}`;
      }
      if (xpResult.hpLevelUp) {
        const lv = xpResult.hpLevelUp.level;
        const unlock = getLevelUpMessage('hitpoints', lv);
        msg += `\n  Congratulations! Hitpoints level ${lv}!`;
        if (unlock) msg += ` ${unlock}`;
      }
    } else {
      // Combat XP even on non-kill hits
      if (combatType === 'ranged') combat.rangedCombatXp(p, result.damage);
      else combat.combatXp(p, result.damage);
    }

    sendText(ws, msg);

    // TODO: Boss special mechanics (KBD dragonfire, Mole dig, Barrows effects)
    // will be re-added cleanly — basic NPC retaliation now handled above
  }
}

// ── World Tick ────────────────────────────────────────────────────────────────
function worldTick(currentTick) {
  // Track what was dead/depleted before tick for respawn messages
  const wasDeadNpcs = [];
  for (const npc of npcs.npcs.values()) {
    if (npc.dead && currentTick >= npc.respawnAt) wasDeadNpcs.push(npc);
  }
  const wasDepleted = [];
  for (const obj of objects.objects.values()) {
    if (obj.depleted && currentTick >= obj.respawnAt) wasDepleted.push(obj);
  }

  npcs.npcTick(currentTick);
  objects.objectTick(currentTick);

  // Monster respawn messages (feature 10)
  for (const npc of wasDeadNpcs) {
    if (!npc.dead) { // It respawned
      for (const [ws, p] of players) {
        if (Math.abs(p.x - npc.x) <= 10 && Math.abs(p.y - npc.y) <= 10 && p.layer === npc.layer) {
          sendText(ws, `A ${npc.name} appears.`);
        }
      }
    }
  }
  // Resource respawn messages (feature 10)
  for (const obj of wasDepleted) {
    if (!obj.depleted) { // It respawned
      for (const [ws, p] of players) {
        if (Math.abs(p.x - obj.x) <= 10 && Math.abs(p.y - obj.y) <= 10 && p.layer === obj.layer) {
          const type = obj.skill === 'mining' ? 'rock' : obj.skill === 'woodcutting' ? 'tree' : obj.name.toLowerCase();
          sendText(ws, `The ${type} is ready to harvest again.`);
        }
      }
    }
  }

  // Process tick-based actions (gathering, processing)
  const actionMsgs = actions.processTick();
  for (const [playerId, msgs] of actionMsgs) {
    // Find player's ws
    for (const [ws, p] of players) {
      if (p.id === playerId) {
        for (const msg of msgs) sendText(ws, msg);
        // Clear busy if action completed
        if (!actions.isActive(p)) { p.busy = false; p.busyAction = null; }
        break;
      }
    }
  }

  // Despawn ground items
  for (let i = groundItems.length - 1; i >= 0; i--) {
    if (currentTick >= groundItems[i].despawnTick) groundItems.splice(i, 1);
  }

  // HP regen every 100 ticks (60 seconds)
  if (currentTick % 100 === 0) {
    for (const [ws, p] of players) {
      if (p.hp < p.maxHp && !p.combatTarget) {
        p.hp = Math.min(p.maxHp, p.hp + 1);
      }
    }
  }

  // Stun tick decay
  for (const [ws, p] of players) {
    if (p.stunTicks > 0) {
      p.stunTicks--;
      if (p.stunTicks === 0) sendText(ws, 'You are no longer stunned.');
    }
  }

  // Potion boost decay (every tick)
  for (const [ws, p] of players) {
    if (p.boosts) {
      for (const [skill, boost] of Object.entries(p.boosts)) {
        if (boost.ticksLeft > 0) {
          boost.ticksLeft--;
          if (boost.ticksLeft <= 0) {
            delete p.boosts[skill];
            sendText(ws, `Your ${skill} boost has worn off.`);
          }
        }
      }
    }
  }

  // Skull decay
  for (const [ws, p] of players) {
    if (p.skull > 0) {
      p.skull--;
      if (p.skull === 0) sendText(ws, 'Your skull has faded.');
    }
  }

  // Prayer drain
  for (const [ws, p] of players) {
    if (p.activePrayers.size > 0 && currentTick % 3 === 0) {
      p.prayerPoints = Math.max(0, p.prayerPoints - p.activePrayers.size);
      if (p.prayerPoints <= 0) {
        p.activePrayers.clear();
        sendText(ws, 'You have run out of prayer points.');
      }
    }
  }

  // Poison tick (every 20 ticks)
  if (currentTick % 20 === 0) {
    for (const [ws, p] of players) {
      if (p.poison && p.poison.damage > 0) {
        const dmg = p.poison.damage;
        p.hp = Math.max(0, p.hp - dmg);
        sendText(ws, `You are poisoned! ${dmg} damage. HP: ${p.hp}/${p.maxHp}`);
        p.poison.damage = Math.max(0, p.poison.damage - 1);
        if (p.poison.damage <= 0) {
          p.poison = null;
          sendText(ws, 'The poison has worn off.');
        }
        if (p.hp <= 0) {
          sendText(ws, 'Oh dear, you are dead! Killed by poison.');
          p.hp = p.maxHp; p.x = SPAWN_X; p.y = SPAWN_Y; p.layer = 0;
          p.combatTarget = null; p.busy = false; p.path = [];
          p.prayerPoints = getLevel(p, 'prayer'); p.activePrayers.clear();
          p.runEnergy = 10000; p.poison = null;
        }
      }
    }
  }

  // NPC aggression tick
  for (const [ws, p] of players) {
    if (p.combatTarget || p.pvpTarget || p.hp <= 0) continue;
    const nearNpcs = npcs.getNpcsNear(p.x, p.y, 8, p.layer);
    for (const npc of nearNpcs) {
      if (!npc.aggressive || npc.dead || npc.target || npc.combat === 0) continue;
      const dist = Math.max(Math.abs(npc.x - p.x), Math.abs(npc.y - p.y));
      if (dist > npc.aggroRange) continue;
      // Check 10 minute (1000 tick) aggro timer
      if (!p.aggroTimers) p.aggroTimers = {};
      const timerKey = `${npc.defId}_${Math.floor(npc.spawnX / 20)}_${Math.floor(npc.spawnY / 20)}`;
      if (!p.aggroTimers[timerKey]) p.aggroTimers[timerKey] = currentTick;
      if (currentTick - p.aggroTimers[timerKey] > 1000) continue; // Aggro expired
      // Start attacking
      npc.target = p.id;
      p.combatTarget = npc.id;
      p.busy = true;
      sendText(ws, `The ${npc.name} attacks you!`);
      break; // Only one NPC aggros at a time
    }
  }

  // Farming tick (growth every 500 ticks = ~5 min)
  if (currentTick % 500 === 0) {
    for (const [ws, p] of players) {
      if (!p.farmingPatches) continue;
      for (const [key, patch] of Object.entries(p.farmingPatches)) {
        if (!patch || patch.stage >= patch.maxStage) continue;
        // Disease chance (10% per stage)
        if (!patch.diseased && Math.random() < 0.1) {
          patch.diseased = true;
          continue;
        }
        if (patch.diseased) continue; // Diseased patches don't grow
        patch.stage++;
        if (patch.stage >= patch.maxStage) {
          // Notify player if nearby
          const [layer, x, y] = key.split('_').map(Number);
          if (Math.abs(p.x - x) <= 15 && Math.abs(p.y - y) <= 15 && p.layer === layer) {
            sendText(ws, `Your ${patch.seedName} patch is fully grown and ready to harvest!`);
          }
        }
      }
    }
  }

  // Random events tick
  for (const [ws, p] of players) {
    if (!p.nextRandomEvent) p.nextRandomEvent = currentTick + 500 + Math.floor(Math.random() * 500);
    if (currentTick >= p.nextRandomEvent && !p.pendingEvent && !p.combatTarget && !p.busy) {
      const eventRoll = Math.floor(Math.random() * 4);
      if (eventRoll === 0) {
        p.pendingEvent = { type: 'genie' };
        sendText(ws, 'A genie appears! Type `accept genie` for an XP lamp.');
      } else if (eventRoll === 1) {
        const a = 1 + Math.floor(Math.random() * 10);
        const b = 1 + Math.floor(Math.random() * 10);
        p.pendingEvent = { type: 'quiz', answer: String(a + b), question: `${a}+${b}` };
        sendText(ws, `A mysterious old man asks: What is ${a}+${b}? Type \`answer [number]\``);
      } else if (eventRoll === 2) {
        p.pendingEvent = { type: 'evil_chicken' };
        sendText(ws, 'An evil chicken attacks! Type `flee` or `attack chicken`.');
      } else {
        p.pendingEvent = { type: 'gift' };
        const giftItems = [
          { id: 101, name: 'Coins', count: 50 + Math.floor(Math.random() * 200), stackable: true },
          { id: 200, name: 'Logs', count: 5 },
          { id: 210, name: 'Copper ore', count: 5 },
          { id: 104, name: 'Feather', count: 20, stackable: true },
        ];
        const gift = giftItems[Math.floor(Math.random() * giftItems.length)];
        p.pendingEvent = null; // Gift event is instant — no need to track
        groundItems.push({ id: nextItemId++, name: gift.name, count: gift.count, x: p.x, y: p.y, layer: p.layer, owner: p.id, despawnTick: currentTick + 200 });
        sendText(ws, `A strange box appears at your feet and bursts open! ${gift.name} x${gift.count} dropped. Type \`pickup ${gift.name.toLowerCase()}\`.`);
      }
      p.nextRandomEvent = currentTick + 500 + Math.floor(Math.random() * 500);
    }
  }

  // Hunter trap check (every 50 ticks)
  if (currentTick % 50 === 0) {
    for (const [ws, p] of players) {
      if (!p.traps || !p.traps.length) continue;
      for (const trap of p.traps) {
        if (trap.caught) continue;
        let catchChance = 0;
        let catchName = '';
        let xp = 0;
        if (trap.type === 'bird snare') {
          catchChance = 0.3 + getLevel(p, 'hunter') * 0.005;
          catchName = 'a bird';
          xp = 34;
        } else if (trap.type === 'box trap') {
          if (getLevel(p, 'hunter') < 53) continue;
          catchChance = 0.2 + (getLevel(p, 'hunter') - 53) * 0.005;
          catchName = 'a chinchompa';
          xp = 198;
        }
        if (Math.random() < catchChance) {
          trap.caught = catchName;
          trap.xp = xp;
          // Notify if nearby
          if (Math.abs(p.x - trap.x) <= 15 && Math.abs(p.y - trap.y) <= 15 && p.layer === trap.layer) {
            sendText(ws, `Your ${trap.type} at (${trap.x}, ${trap.y}) has caught something!`);
          }
        }
      }
    }
  }
}

// ── Register Commands ─────────────────────────────────────────────────────────

// General
// ── Command help examples for `help [command]` ──
const COMMAND_EXAMPLES = {
  attack: { usage: 'attack [name]', examples: ['attack chicken', 'attack goblin', 'attack guard'] },
  chop: { usage: 'chop [tree]', examples: ['chop tree', 'chop oak', 'chop willow'] },
  mine: { usage: 'mine [rock]', examples: ['mine copper rock', 'mine iron rock', 'mine coal rock'] },
  fish: { usage: 'fish [spot]', examples: ['fish', 'fish fishing spot', 'fish fly fishing spot'] },
  cook: { usage: 'cook [item]', examples: ['cook raw shrimps', 'cook raw trout', 'cook'] },
  eat: { usage: 'eat [food]', examples: ['eat shrimps', 'eat lobster'] },
  shop: { usage: 'shop [npc]', examples: ['shop shopkeeper', 'shop weapon master', 'shop'] },
  buy: { usage: 'buy [slot] [amount]', examples: ['buy 0 1', 'buy 3 10'] },
  sell: { usage: 'sell [item]', examples: ['sell cowhide', 'sell iron ore'] },
  equip: { usage: 'equip [item]', examples: ['equip bronze sword', 'equip iron platebody'] },
  bank: { usage: 'bank', examples: ['bank'] },
  deposit: { usage: 'deposit [item] or deposit all', examples: ['deposit logs', 'deposit all'] },
  withdraw: { usage: 'withdraw [item] [count]', examples: ['withdraw coins 100', 'withdraw logs'] },
  goto: { usage: 'goto [x] [y]', examples: ['goto 100 90', 'goto 80 100'] },
  say: { usage: 'say [message]', examples: ['say hello everyone!'] },
  pm: { usage: 'pm [player] [message]', examples: ['pm Steve hello there'] },
  yell: { usage: 'yell [message]', examples: ['yell Selling logs 50gp each!'] },
  pickup: { usage: 'pickup [item]', examples: ['pickup bones', 'pickup coins'] },
  drop: { usage: 'drop [item]', examples: ['drop logs', 'drop bones'] },
  examine: { usage: 'examine [target]', examples: ['examine chicken', 'examine self', 'examine tree'] },
  cast: { usage: 'cast [spell] or cast [spell] on [npc]', examples: ['cast home teleport', 'cast wind strike on goblin'] },
  tutorial: { usage: 'tutorial or tutorial skip', examples: ['tutorial', 'tutorial skip'] },
  actions: { usage: 'actions [target]', examples: ['actions chicken', 'actions tree', 'actions man'] },
  restore: { usage: 'restore (near a bank)', examples: ['restore'] },
  uselamp: { usage: 'uselamp [skill]', examples: ['uselamp attack', 'uselamp woodcutting'] },
  clan: { usage: 'clan create/invite/kick/chat/leave/info [args]', examples: ['clan create Warriors', 'clan invite Steve', 'clan chat hello team'] },
  grave: { usage: 'grave', examples: ['grave'] },
  deaths: { usage: 'deaths', examples: ['deaths'] },
};

commands.register('?', {
  help: 'Ask the AI guide a question: ? [question]',
  aliases: ['ask', 'guide'],
  category: 'General',
  fn: (p, args) => {
    const question = args.join(' ');
    if (!question) return 'Usage: ? [your question]. Example: ? how do i train woodcutting';
    if (!ollama.isEnabled()) return 'AI guide is offline. Start Ollama with: ollama serve';

    // Find player's ws for async response
    let playerWs; for (const [ws2, pl] of players) { if (pl === p) { playerWs = ws2; break; } }
    const area = tiles.getArea(p.x, p.y, p.layer);
    const guidePrompt = `You are a helpful guide for a text-based MMORPG called Scape (similar to RuneScape/OSRS).
The player "${p.name}" (combat level ${combatLevel(p)}, at ${area?.name || `(${p.x},${p.y})`}) asks: "${question}"

Available commands: look, n/s/e/w, goto, attack, chop, mine, fish, cook, smelt, smith, craft, fletch, clean, mix, light, eat, drink, equip, unequip, inv, bank, shop, buy, sell, talk, sayto, r, pickpocket, bury, pray, cast, skills, map, nearby, status, help

Respond helpfully in 1-3 sentences. If they're trying to do something, suggest the right command.`;
    ollama.generate(guidePrompt).then(text => {
      if (text && playerWs) sendText(playerWs, `Guide: ${text}`);
    }).catch(() => {});
    return '(thinking...)';
  }
});

commands.register('help', {
  help: 'Show commands or help for a specific command',
  aliases: ['commands'],
  category: 'General',
  fn: (p, args) => {
    if (args[0]) {
      // Check if it's a specific command first
      const cmdName = args[0].toLowerCase();
      const cmd = commands.commands.get(cmdName);
      if (cmd) {
        let out = `── ${cmdName} ──\n  ${cmd.help}\n`;
        const ex = COMMAND_EXAMPLES[cmdName];
        if (ex) {
          out += `  Usage: ${ex.usage}\n`;
          out += `  Examples:\n`;
          for (const e of ex.examples) out += `    ${e}\n`;
        }
        if (cmd.aliases && cmd.aliases.length) out += `  Aliases: ${cmd.aliases.join(', ')}\n`;
        out += `  Category: ${cmd.category}`;
        return out;
      }
      // Otherwise treat as category
      const lines = commands.getHelp(args[0]);
      return lines.length ? `${args[0]}:\n${lines.join('\n')}` : 'No commands in that category. Try `help [command name]`.';
    }
    const cats = commands.getCategories();
    let out = 'Categories: ' + cats.join(', ') + '\nType `help [category]` or `help [command]` for details.\n\n';
    for (const cat of cats) {
      const lines = commands.getHelp(cat);
      out += `── ${cat} ──\n${lines.join('\n')}\n\n`;
    }
    return out;
  }
});

commands.register('tick', { help: 'Show current tick', category: 'General', fn: () => `Tick: ${tick.getTick()}` });
commands.register('whoami', { help: 'Show your info', category: 'General', fn: (p) => {
  const modeIcon = p.accountMode === 'ironman' ? ' [IM]' : p.accountMode === 'hcim' ? ' [HCIM]' : p.accountMode === 'uim' ? ' [UIM]' : '';
  return `${p.name}${modeIcon} | Combat: ${combatLevel(p)} | Pos: (${p.x}, ${p.y}) | Layer: ${p.layer} | HP: ${p.hp}/${p.maxHp}`;
}});
commands.register('players', { help: 'List online players', category: 'General', fn: () => {
  const list = [...playersByName.values()].map(p => `  ${p.name} (combat ${combatLevel(p)}) at (${p.x}, ${p.y})`);
  return `Online: ${list.length}\n${list.join('\n')}`;
}});

// Navigation
commands.register('pos', { help: 'Show position', aliases: ['coords', 'where'], category: 'Navigation',
  fn: (p) => {
    const area = tiles.getArea(p.x, p.y, p.layer);
    return `Position: (${p.x}, ${p.y}) Layer: ${p.layer}${area ? ` — ${area.name}` : ''}`;
  }
});

commands.register('look', { help: 'Look around', aliases: ['l'], category: 'Navigation',
  fn: (p) => {
    const tile = tiles.getTileName(tiles.tileAt(p.x, p.y, p.layer));
    const area = tiles.getArea(p.x, p.y, p.layer);
    const nearby = npcs.getNpcsNear(p.x, p.y, 5, p.layer);
    const objs = objects.getObjectsNear(p.x, p.y, 3, p.layer);
    const items = groundItems.filter(i => Math.abs(i.x - p.x) <= 3 && Math.abs(i.y - p.y) <= 3 && i.layer === p.layer);
    const nearbyPlayers = [...playersByName.values()].filter(o => o !== p && Math.abs(o.x - p.x) <= 10 && Math.abs(o.y - p.y) <= 10 && o.layer === p.layer);

    let out = `You are at (${p.x}, ${p.y}). Ground: ${tile}.`;
    if (area) out += ` Area: ${area.name}.`;
    // Walls
    const w = walls.getWallEdge(p.x, p.y, p.layer);
    if (w) {
      const sides = [];
      if (w & 1) sides.push('north');
      if (w & 2) sides.push('east');
      if (w & 4) sides.push('south');
      if (w & 8) sides.push('west');
      out += `\nWalls: ${sides.join(', ')}`;
    }
    // Doors
    const d = walls.getDoorEdge(p.x, p.y, p.layer);
    if (d) {
      const sides = [];
      if (d & 1) sides.push('north' + (walls.isDoorOpen(p.x, p.y, 1, p.layer) ? ' (open)' : ' (closed)'));
      if (d & 2) sides.push('east' + (walls.isDoorOpen(p.x, p.y, 2, p.layer) ? ' (open)' : ' (closed)'));
      if (d & 4) sides.push('south' + (walls.isDoorOpen(p.x, p.y, 4, p.layer) ? ' (open)' : ' (closed)'));
      if (d & 8) sides.push('west' + (walls.isDoorOpen(p.x, p.y, 8, p.layer) ? ' (open)' : ' (closed)'));
      out += `\nDoors: ${sides.join(', ')}`;
    }
    if (nearby.length) out += '\nNPCs: ' + nearby.map(n => `${n.name} (lvl ${n.combat}, HP ${n.hp}/${n.maxHp})`).join(', ');
    if (objs.length) out += '\nObjects: ' + objs.filter(o => !o.depleted).map(o => o.name).join(', ');
    if (items.length) out += '\nItems: ' + items.map(i => `${i.name} x${i.count}`).join(', ');
    if (nearbyPlayers.length) out += '\nPlayers: ' + nearbyPlayers.map(o => o.name).join(', ');
    return out;
  }
});

// Shared context (populated by registerAllCommands later)
let cmdCtx = {};

// Direction shortcuts
const DIR_MAP = { n: [0,-1], s: [0,1], e: [1,0], w: [-1,0], ne: [1,-1], nw: [-1,-1], se: [1,1], sw: [-1,1] };
for (const [dir, [dx, dy]] of Object.entries(DIR_MAP)) {
  commands.register(dir, { help: `Walk ${dir}`, category: 'Navigation',
    fn: (p) => {
      const nx = p.x + dx, ny = p.y + dy;
      if (!tiles.isWalkable(nx, ny, p.layer)) return `Blocked — ${tiles.getTileName(tiles.tileAt(nx, ny, p.layer))} is not walkable.`;
      if (walls.isEdgeBlocked(p.x, p.y, nx, ny, p.layer)) return 'Blocked — there\'s a wall in the way.';
      p.x = nx; p.y = ny;
      if (actions.isActive(p)) actions.cancel(p);
      events.emit('player_move', { player: p });
      let msg = `(${p.x}, ${p.y})`;
      if (cmdCtx.generateMap) msg += '\n' + cmdCtx.generateMap(p);
      return msg;
    }
  });
}

commands.register('goto', { help: 'Walk to coordinates: goto [x] [y]', aliases: ['walk', 'moveto'], category: 'Navigation',
  fn: (p, args) => {
    const x = parseInt(args[0]), y = parseInt(args[1]);
    if (isNaN(x) || isNaN(y)) return 'Usage: goto [x] [y]';
    const path = pathfinding.findPath(p.x, p.y, x, y, p.layer);
    if (!path) return `No path to (${x}, ${y}).`;
    p.path = path;
    return `Walking to (${x}, ${y}) — ${path.length} tiles.`;
  }
});

commands.register('run', { help: 'Toggle run / run to coords', aliases: ['toggle_run'], category: 'Navigation',
  fn: (p, args) => {
    if (args.length >= 2) {
      const x = parseInt(args[0]), y = parseInt(args[1]);
      if (!isNaN(x) && !isNaN(y)) {
        const path = pathfinding.findPath(p.x, p.y, x, y, p.layer);
        if (!path) return `No path to (${x}, ${y}).`;
        p.path = path;
        p.running = true;
        return `Running to (${x}, ${y}) — ${path.length} tiles. Energy: ${(p.runEnergy / 100).toFixed(0)}%`;
      }
    }
    p.running = !p.running;
    return `Running: ${p.running ? 'ON' : 'OFF'}. Energy: ${(p.runEnergy / 100).toFixed(0)}%`;
  }
});

commands.register('energy', { help: 'Show run energy', category: 'Navigation',
  fn: (p) => `Run energy: ${(p.runEnergy / 100).toFixed(0)}%`
});

commands.register('teleport', { help: 'Teleport to coords: teleport [x] [y]', aliases: ['tp'], category: 'Navigation',
  fn: (p, args) => {
    const x = parseInt(args[0]), y = parseInt(args[1]);
    if (isNaN(x) || isNaN(y)) return 'Usage: teleport [x] [y]';
    p.x = x; p.y = y; p.path = [];
    return `Teleported to (${x}, ${y}).`;
  }
});

commands.register('layer', { help: 'Show/change layer', category: 'Navigation',
  fn: (p, args) => {
    if (args[0] !== undefined) {
      p.layer = parseInt(args[0]) || 0;
      return `Layer: ${p.layer}`;
    }
    return `Layer: ${p.layer}`;
  }
});

// Doors
commands.register('open', { help: 'Open a door: open [n/e/s/w]', category: 'Navigation',
  fn: (p, args) => {
    const dir = (args[0] || '').toLowerCase();
    const edge = { n: 1, e: 2, s: 4, w: 8 }[dir];
    if (!edge) return 'Usage: open [n/e/s/w]';
    if (!(walls.getDoorEdge(p.x, p.y, p.layer) & edge)) return 'No door there.';
    if (walls.isDoorOpen(p.x, p.y, edge, p.layer)) return 'Already open.';
    walls.toggleDoor(p.x, p.y, edge, p.layer);
    return `Opened ${dir} door.`;
  }
});

commands.register('close', { help: 'Close a door: close [n/e/s/w]', category: 'Navigation',
  fn: (p, args) => {
    const dir = (args[0] || '').toLowerCase();
    const edge = { n: 1, e: 2, s: 4, w: 8 }[dir];
    if (!edge) return 'Usage: close [n/e/s/w]';
    if (!(walls.getDoorEdge(p.x, p.y, p.layer) & edge)) return 'No door there.';
    if (!walls.isDoorOpen(p.x, p.y, edge, p.layer)) return 'Already closed.';
    walls.toggleDoor(p.x, p.y, edge, p.layer);
    return `Closed ${dir} door.`;
  }
});

// Combat
commands.register('attack', { help: 'Attack an NPC or player: attack [name]', aliases: ['fight', 'kill'], category: 'Combat',
  fn: (p, args) => {
    const name = args.join(' ');
    if (!name) return 'Usage: attack [npc name]';

    // Check for PvP: try to find a player first if in wilderness
    const area = tiles.getArea(p.x, p.y, p.layer);
    if (area && area.pvp) {
      const target = findPlayer(name);
      if (target && target !== p && Math.abs(target.x - p.x) <= 15 && Math.abs(target.y - p.y) <= 15) {
        // PvP attack
        const dist = Math.max(Math.abs(p.x - target.x), Math.abs(p.y - target.y));
        if (dist > 1) {
          const adjPath = pathfinding.findAdjacentPath(p.x, p.y, target.x, target.y, p.layer);
          if (!adjPath) return `Can't reach ${target.name}.`;
          if (adjPath.length > 0) p.path = adjPath;
        }
        p.combatTarget = null;
        p.pvpTarget = target.id;
        p.busy = true;
        if (!p.skull) p.skull = 3000; // Skull for 30 minutes
        return `Attacking ${target.name} (combat ${combatLevel(target)})! You are now skulled.`;
      }
    }

    const npc = npcs.findNpcByName(name, p.x, p.y, 15, p.layer);
    if (!npc) return `No "${name}" nearby.`;
    if (npc.combat === 0) return `You can't attack the ${npc.name}.`;
    // Auto-walk to adjacent tile if not adjacent
    const dist = Math.max(Math.abs(p.x - npc.x), Math.abs(p.y - npc.y));
    if (dist > 1) {
      const adjPath = pathfinding.findAdjacentPath(p.x, p.y, npc.x, npc.y, p.layer);
      if (!adjPath) return `Can't reach the ${npc.name}.`;
      if (adjPath.length > 0) p.path = adjPath;
    }
    p.combatTarget = npc.id;
    p.pvpTarget = null;
    p.busy = true;
    return `Attacking ${npc.name} (lvl ${npc.combat}, HP ${npc.hp}/${npc.maxHp}).`;
  }
});

commands.register('flee', { help: 'Stop fighting', aliases: ['retreat'], category: 'Combat',
  fn: (p) => { p.combatTarget = null; p.pvpTarget = null; p.busy = false; p.path = []; return 'You stop fighting.'; }
});

commands.register('style', { help: 'Set attack style: style [accurate/aggressive/defensive/controlled]', category: 'Combat',
  fn: (p, args) => {
    if (!args[0]) return `Attack style: ${p.attackStyle}`;
    const style = args[0].toLowerCase();
    if (!combat.STYLES[style]) return 'Styles: accurate, aggressive, defensive, controlled';
    p.attackStyle = style;
    return `Attack style: ${style}`;
  }
});

commands.register('hp', { help: 'Show HP', category: 'Combat',
  fn: (p) => `HP: ${p.hp}/${p.maxHp}`
});

commands.register('combat', { help: 'Show combat level', category: 'Combat',
  fn: (p) => `Combat level: ${combatLevel(p)}` });

commands.register('maxhit', { help: 'Show max hit', category: 'Combat',
  fn: (p) => `Max hit: ${combat.maxHitMelee(p)}` });

commands.register('retaliate', { help: 'Toggle auto-retaliate', category: 'Combat',
  fn: (p) => { p.autoRetaliate = !p.autoRetaliate; return `Auto-retaliate: ${p.autoRetaliate ? 'ON' : 'OFF'}`; }
});

// pray command registered in commands/all.js (includes altar support)

// Skills
commands.register('skills', { help: 'Show all skills', aliases: ['stats'], category: 'Skills',
  fn: (p) => {
    let out = `Total level: ${totalLevel(p)} | Combat: ${combatLevel(p)}\n`;
    for (const skill of SKILLS) {
      const lvl = getLevel(p, skill);
      const xp = getXp(p, skill);
      const next = xpForLevel(lvl + 1);
      out += `  ${skill.padEnd(14)} ${String(lvl).padStart(3)} | ${xp.toLocaleString()} XP${lvl < 99 ? ` (${(next - xp).toLocaleString()} to ${lvl + 1})` : ''}\n`;
    }
    return out;
  }
});

commands.register('skill', { help: 'Show specific skill: skill [name]', category: 'Skills',
  fn: (p, args) => {
    const name = (args[0] || '').toLowerCase();
    if (!p.skills[name]) return `Unknown skill: ${name}. Skills: ${SKILLS.join(', ')}`;
    const lvl = getLevel(p, name);
    const xp = getXp(p, name);
    const next = xpForLevel(lvl + 1);
    return `${name}: Level ${lvl} | ${xp.toLocaleString()} XP${lvl < 99 ? ` | ${(next - xp).toLocaleString()} to level ${lvl + 1}` : ' (MAX)'}`;
  }
});

// Inventory
commands.register('inventory', { help: 'Show inventory', aliases: ['inv', 'i'], category: 'Items',
  fn: (p) => {
    const items = p.inventory.filter(s => s !== null);
    if (!items.length) return 'Inventory is empty.';
    let out = `Inventory (${items.length}/${INV_SIZE}):\n`;
    for (let i = 0; i < INV_SIZE; i++) {
      const s = p.inventory[i];
      if (s) out += `  [${i}] ${s.name}${s.count > 1 ? ` x${s.count}` : ''}\n`;
    }
    return out;
  }
});

commands.register('pickup', { help: 'Pick up an item: pickup [name]', aliases: ['take', 'get'], category: 'Items',
  fn: (p, args) => {
    const name = args.join(' ').toLowerCase();
    if (!name) return 'Usage: pickup [item name]';
    const idx = groundItems.findIndex(i =>
      i.name.toLowerCase() === name && i.x === p.x && i.y === p.y && i.layer === p.layer
    );
    if (idx < 0) return `No "${name}" here.`;
    // Ironman restriction: can't pick up other players' drops (feature 3)
    if (p.accountMode && (p.accountMode === 'ironman' || p.accountMode === 'hcim' || p.accountMode === 'uim')) {
      const gItem = groundItems[idx];
      if (gItem.owner && gItem.owner !== p.id) return "As an ironman, you can't pick up other players' drops.";
    }
    if (invFreeSlots(p) < 1) return 'Inventory is full.';
    const item = groundItems.splice(idx, 1)[0];
    invAdd(p, item.id, item.name, item.count);
    calcWeight(p, (id) => items.get(id));
    return `Picked up: ${item.name} x${item.count}`;
  }
});

commands.register('drop', { help: 'Drop an item: drop [name]', category: 'Items',
  fn: (p, args) => {
    const name = args.join(' ').toLowerCase();
    const slot = p.inventory.findIndex(s => s && s.name.toLowerCase() === name);
    if (slot < 0) return `You don't have "${name}".`;
    const item = p.inventory[slot];
    p.inventory[slot] = null;
    groundItems.push({ id: nextItemId++, name: item.name, count: item.count, x: p.x, y: p.y, layer: p.layer, owner: p.id, despawnTick: tick.getTick() + 200 });
    calcWeight(p, (id) => items.get(id));
    return `Dropped: ${item.name} x${item.count}`;
  }
});

commands.register('equip', { help: 'Equip an item: equip [name]', aliases: ['wear', 'wield'], category: 'Items',
  fn: (p, args) => {
    const name = args.join(' ').toLowerCase();
    const slot = p.inventory.findIndex(s => s && s.name.toLowerCase() === name);
    if (slot < 0) return `You don't have "${name}".`;
    const item = p.inventory[slot];
    // Look up item definition for equip slot and stats
    const def = items.get(item.id) || items.find(item.name);
    const equipSlot = item.equipSlot || def?.equipSlot;
    if (!equipSlot) return `${item.name} is not equippable.`;
    // Check requirements
    if (def?.equipReqs) {
      for (const [skill, level] of Object.entries(def.equipReqs)) {
        if (getLevel(p, skill) < level) return `You need ${skill} level ${level} to equip ${item.name}.`;
      }
    }
    // Merge item def stats onto the item
    const equipItem = { id: item.id, name: item.name, count: 1, equipSlot, stats: def?.stats || item.stats || {}, speed: def?.speed || item.speed };
    p.inventory[slot] = item.count > 1 ? { ...item, count: item.count - 1 } : null;
    const old = p.equipment[equipSlot];
    p.equipment[equipSlot] = equipItem;
    calcWeight(p, (id) => items.get(id));
    if (old) { invAdd(p, old.id, old.name, 1); calcWeight(p, (id) => items.get(id)); return `Equipped ${item.name} (replaced ${old.name}).`; }
    return `Equipped ${item.name}.`;
  }
});

commands.register('unequip', { help: 'Unequip a slot: unequip [slot]', aliases: ['remove'], category: 'Items',
  fn: (p, args) => {
    const slot = (args[0] || '').toLowerCase();
    if (!p.equipment[slot]) return `Nothing equipped in ${slot}. Slots: ${EQUIP_SLOTS.join(', ')}`;
    if (invFreeSlots(p) < 1) return 'Inventory is full.';
    const item = p.equipment[slot];
    delete p.equipment[slot];
    invAdd(p, item.id, item.name, 1);
    calcWeight(p, (id) => items.get(id));
    return `Unequipped ${item.name}.`;
  }
});

commands.register('equipment', { help: 'Show equipment', aliases: ['gear'], category: 'Items',
  fn: (p) => {
    let out = 'Equipment:\n';
    for (const slot of EQUIP_SLOTS) {
      const item = p.equipment[slot];
      out += `  ${slot.padEnd(8)} ${item ? item.name : '—'}\n`;
    }
    return out;
  }
});

// NPCs
commands.register('npcs', { help: 'List nearby NPCs', category: 'World',
  fn: (p) => {
    const nearby = npcs.getNpcsNear(p.x, p.y, 15, p.layer);
    if (!nearby.length) return 'No NPCs nearby.';
    return 'NPCs:\n' + nearby.map(n => `  ${n.name} (lvl ${n.combat}) at (${n.x}, ${n.y}) HP: ${n.hp}/${n.maxHp}`).join('\n');
  }
});

commands.register('talk', { help: 'Talk to an NPC: talk [name] (or just `talk` for nearest)', category: 'World',
  fn: (p, args) => {
    let npc;
    if (args.length === 0) {
      const nearby = npcs.getNpcsNear(p.x, p.y, 10, p.layer).filter(n => n.dialogue || !n.combat);
      if (!nearby.length) return 'Nobody nearby to talk to.';
      nearby.sort((a, b) => (Math.abs(a.x - p.x) + Math.abs(a.y - p.y)) - (Math.abs(b.x - p.x) + Math.abs(b.y - p.y)));
      npc = nearby[0];
    } else {
      const name = args.join(' ');
      npc = npcs.findNpcByName(name, p.x, p.y, 10, p.layer);
      if (!npc) return `No "${name}" nearby. Type \`npcs\` to see who's around.`;
    }

    // Canned greeting only — no AI call. Use `r` or `sayto` for AI conversation.
    p._lastTalkNpc = npc.defId;
    const fallback = ai.getFallback(npc.defId);
    return `${npc.name}: "${npc.dialogue || fallback}"\n(Type \`r [message]\` to respond)`;
  }
});

// Freeform NPC conversation — say something specific to an NPC
commands.register('sayto', { help: 'Say something to an NPC: sayto [npc] [message]', aliases: ['tell npc', 'ask'], category: 'World',
  fn: (p, args) => {
    if (args.length < 2) return 'Usage: sayto [npc name] [your message]';
    // Find where NPC name ends and message begins — try longest NPC name match
    let npc = null;
    let message = '';
    for (let i = args.length - 1; i >= 1; i--) {
      const npcName = args.slice(0, i).join(' ');
      npc = npcs.findNpcByName(npcName, p.x, p.y, 10, p.layer);
      if (npc) { message = args.slice(i).join(' '); break; }
    }
    if (!npc) return `No NPC by that name nearby. Type \`npcs\` to see who's around.`;
    if (!message) return 'What do you want to say?';

    const area = tiles.getArea(p.x, p.y, p.layer);
    const prompt = ai.buildSimplePrompt(npc.defId, npc.name, p.name, combatLevel(p), message, area?.name || `(${p.x},${p.y})`);

    let playerWs; for (const [ws, pl] of players) { if (pl === p) { playerWs = ws; break; } }
    addNpcPrompt(npc.name, prompt, (text) => { if (playerWs) sendText(playerWs, `${npc.name}: "${text}"`); });

    p._lastTalkNpc = npc.defId; // Remember for /r replies
    return `You say to ${npc.name}: "${message}"\n(thinking...)`;
  }
});

// Quick reply to last NPC talked to
commands.register('r', { help: 'Reply to last NPC: r [message]', aliases: ['reply'], category: 'World',
  fn: (p, args) => {
    if (!p._lastTalkNpc) return 'No recent NPC conversation. Use `talk [npc]` or `sayto [npc] [message]` first.';
    const message = args.join(' ');
    if (!message) return 'Usage: r [your message]';
    const npc = npcs.findNpcByName(p._lastTalkNpc, p.x, p.y, 15, p.layer) ||
                npcs.getNpcsNear(p.x, p.y, 15, p.layer).find(n => n.defId === p._lastTalkNpc);
    if (!npc) return `${p._lastTalkNpc} is no longer nearby.`;

    const area = tiles.getArea(p.x, p.y, p.layer);
    const prompt = ai.buildSimplePrompt(npc.defId, npc.name, p.name, combatLevel(p), message, area?.name || `(${p.x},${p.y})`);

    let playerWs; for (const [ws, pl] of players) { if (pl === p) { playerWs = ws; break; } }
    addNpcPrompt(npc.name, prompt, (text) => { if (playerWs) sendText(playerWs, `${npc.name}: "${text}"`); });

    return `You say to ${npc.name}: "${message}"\n(thinking...)`;
  }
});

// examine command registered in commands/all.js (includes examine self)

// ── Gathering (tick-based) ─────────────────────────────────────────────────────
function startGathering(p, ws, skillName, verb, obj) {
  if (obj.depleted) return `The ${obj.name} is depleted.`;
  if (getLevel(p, skillName) < obj.levelReq) return `You need ${skillName} level ${obj.levelReq}.`;
  if (invFreeSlots(p) < 1) return 'Your inventory is full.';
  if (p.busy) actions.cancel(p);

  actions.start(p, {
    type: skillName,
    ticks: obj.ticks || 4,
    repeat: true,
    data: { obj, skillName, verb, ws, player: p },
    onTick: (data, ticksLeft) => {
      if (ticksLeft === data.obj.ticks - 1) return `You ${data.verb} the ${data.obj.name}...`;
      return null;
    },
    onComplete: (data) => {
      if (data.obj.depleted) { actions.cancel(data.player); return `The ${data.obj.name} is depleted.`; }
      if (invFreeSlots(data.player) < 1) { actions.cancel(data.player); return 'Your inventory is full. You stop.'; }

      // Success roll: higher level = higher chance
      const levelDiff = getLevel(data.player, data.skillName) - data.obj.levelReq;
      const successChance = Math.min(0.95, 0.4 + levelDiff * 0.03);
      if (Math.random() > successChance) return null; // Silent fail, keep trying

      if (data.obj.product) {
        const itemDef = items.get(data.obj.product.id);
        invAdd(data.player, data.obj.product.id, data.obj.product.name, data.obj.product.count || 1, itemDef?.stackable);
      }
      const lvl = addXp(data.player, data.skillName, data.obj.xp);
      if (Math.random() < data.obj.depletionChance) {
        data.obj.depleted = true;
        data.obj.respawnAt = tick.getTick() + data.obj.respawnTicks;
        actions.cancel(data.player);
      }
      let msg = `You get some ${data.obj.product?.name || 'resources'}.${xpDrop(data.skillName, data.obj.xp)}`;
      if (lvl) {
        const skillCapital = data.skillName.charAt(0).toUpperCase() + data.skillName.slice(1);
        const unlock = getLevelUpMessage(data.skillName, lvl);
        msg += `\nCongratulations! ${skillCapital} level ${lvl}!`;
        if (unlock) msg += ` ${unlock}`;
      }
      if (data.obj.depleted) msg += ` The ${data.obj.name} is depleted.`;
      // Track skilling action for achievements/dailies
      events.emit('skill_action', { player: data.player, skill: data.skillName });
      return msg;
    },
  });
  return `You begin to ${verb} the ${obj.name}...`;
}

// Helper: find object within 15 tiles, auto-walk if not adjacent, then start gathering
function gatherWithWalk(p, name, skill, verb, defaultName) {
  const targetName = name || defaultName;
  const obj = objects.findObjectByName(targetName, p.x, p.y, 15, p.layer);
  if (!obj) return `No "${targetName}" nearby.`;
  if (obj.skill !== skill) return `You can't ${verb} the ${obj.name}.`;
  let ws; for (const [w, pl] of players) { if (pl === p) { ws = w; break; } }
  // Check if adjacent (Chebyshev distance <= 1)
  const dist = Math.max(Math.abs(p.x - obj.x), Math.abs(p.y - obj.y));
  if (dist > 1) {
    // Pathfind to adjacent tile
    const adjPath = pathfinding.findAdjacentPath(p.x, p.y, obj.x, obj.y, p.layer);
    if (!adjPath) return `Can't reach the ${obj.name}.`;
    if (adjPath.length > 0) {
      p.path = adjPath;
      // Schedule gathering to start when we arrive
      p._pendingGather = { skill, verb, objKey: `${obj.layer}_${obj.x}_${obj.y}` };
      return `Walking to ${obj.name}... (${adjPath.length} tiles)`;
    }
  }
  return startGathering(p, ws, skill, verb, obj);
}

commands.register('chop', { help: 'Chop a tree (repeating)', category: 'Gathering',
  fn: (p, args) => gatherWithWalk(p, args.join(' '), 'woodcutting', 'chop', 'tree')
});

commands.register('mine', { help: 'Mine a rock (repeating)', category: 'Gathering',
  fn: (p, args) => gatherWithWalk(p, args.join(' '), 'mining', 'mine', 'rock')
});

commands.register('fish', { help: 'Fish at a spot (repeating)', category: 'Gathering',
  fn: (p, args) => gatherWithWalk(p, args.join(' '), 'fishing', 'fish at', 'fishing spot')
});

// ── Game Time (feature 10) ───────────────────────────────────────────────────
commands.register('time', { help: 'Show in-game time', category: 'General',
  fn: () => {
    const t = tick.getTick();
    const DAY_TICKS = 2400; // 1 game day = 2400 ticks (24 minutes real time)
    const dayNumber = Math.floor(t / DAY_TICKS) + 1;
    const tickInDay = t % DAY_TICKS;
    // Map 2400 ticks to 24 hours: each 100 ticks = 1 hour
    const totalMinutes = Math.floor(tickInDay * 24 * 60 / DAY_TICKS);
    let hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const isNight = hours >= 21 || hours < 6;
    return `In-game time: ${displayHour}:${String(minutes).padStart(2, '0')} ${ampm} (Day ${dayNumber})${isNight ? ' [Night]' : ' [Day]'}`;
  }
});

// ── Yell (broadcast to all players) ──
commands.register('yell', { help: 'Broadcast to all players: yell [message]', category: 'Social',
  fn: (p, args, raw) => {
    const msg = raw.replace(/^yell\s+/i, '');
    if (!msg) return 'Usage: yell [message]';
    for (const [ws2] of players) {
      sendText(ws2, `[YELL] ${p.name}: ${msg}`);
    }
    return '';
  }
});

// ── Tutorial command ──
commands.register('tutorial', { help: 'Show tutorial progress or skip', category: 'General',
  fn: (p, args) => {
    if (args[0] === 'skip') {
      p.tutorialStep = 10;
      p.tutorialComplete = true;
      addXp(p, 'hitpoints', 500);
      return 'Tutorial skipped. +500 hitpoints XP. Type `help` for commands.';
    }
    if (p.tutorialComplete) return 'Tutorial complete! You finished all steps.';
    const steps = [
      "Step 0: Type `look` to see your surroundings.",
      "Step 1: Type `n` to walk north.",
      "Step 2: Type `skills` to see your stats.",
      "Step 3: Find a chicken and type `attack chicken`.",
      "Step 4: Type `inv` to check your inventory for loot.",
      "Step 5: Try `chop tree` near a tree to gather logs.",
      "Step 6: Try `mine copper rock` near some rocks.",
      "Step 7: Use `nearby` to see what's around you.",
      "Step 8: Head to town with `goto 100 90` and visit the shops.",
      "Step 9: Tutorial nearly done!",
    ];
    return `── Tutorial (${p.tutorialStep}/9) ──\n${steps[p.tutorialStep] || 'Complete!'}\nType \`tutorial skip\` to skip.`;
  }
});

// ── Deaths command ──
commands.register('deaths', { help: 'Show death count', category: 'General',
  fn: (p) => `Total deaths: ${p.deathCount || 0}`
});

// ── Gravestone command ──
commands.register('grave', { help: 'Show gravestone location', aliases: ['gravestone'], category: 'General',
  fn: (p) => {
    if (!p.gravestone) return 'You have no active gravestone.';
    const currentTick = tick.getTick();
    const ticksLeft = p.gravestone.despawnTick - currentTick;
    if (ticksLeft <= 0) {
      p.gravestone = null;
      return 'Your gravestone has crumbled. The items are gone.';
    }
    const secondsLeft = Math.floor(ticksLeft * 0.6);
    const minutesLeft = Math.floor(secondsLeft / 60);
    const secsLeft = secondsLeft % 60;
    return `Your gravestone is at (${p.gravestone.x}, ${p.gravestone.y}) Layer ${p.gravestone.layer}.\nTime remaining: ${minutesLeft}m ${secsLeft}s (${ticksLeft} ticks).\nHurry back to reclaim your items!`;
  }
});

// ── Restore command (at bank) ──
commands.register('restore', { help: 'Restore HP, prayer, energy at a bank', category: 'General',
  fn: (p) => {
    const booth = objects.findObjectByName('bank booth', p.x, p.y, 3, p.layer);
    if (!booth) return 'You need to be near a bank booth to restore your stats.';
    p.hp = p.maxHp;
    p.prayerPoints = getLevel(p, 'prayer');
    p.runEnergy = 10000;
    p.poison = null;
    p.stunTicks = 0;
    p.boosts = {};
    return `Stats restored! HP: ${p.hp}/${p.maxHp}, Prayer: ${p.prayerPoints}/${getLevel(p, 'prayer')}, Energy: 100%. Poison cleared.`;
  }
});

// ── Actions command (context menu) ──
commands.register('actions', { help: 'Show available actions for a target: actions [target]', category: 'World',
  fn: (p, args) => {
    const name = args.join(' ').toLowerCase();
    if (!name) return 'Usage: actions [target]. E.g., actions chicken';
    // Check NPCs
    const npc = npcs.findNpcByName(name, p.x, p.y, 15, p.layer);
    if (npc) {
      const npcDef = npcs.npcDefs.get(npc.defId);
      const actionsList = ['examine'];
      if (npc.combat > 0) actionsList.unshift('attack');
      if (npc.dialogue) actionsList.push('talk');
      if (npcDef?.thieving) actionsList.push('pickpocket');
      const shop = require('./data/shops').findByNpc(npc.name);
      if (shop) actionsList.push('shop');
      return `── ${npc.name} ──\nActions: ${actionsList.join(', ')}`;
    }
    // Check objects
    const obj = objects.findObjectByName(name, p.x, p.y, 15, p.layer);
    if (obj) {
      const objDef = objects.objectDefs.get(obj.defId);
      const actionsList = ['examine'];
      if (objDef?.actions) actionsList.push(...objDef.actions);
      return `── ${obj.name} ──\nActions: ${actionsList.join(', ')}`;
    }
    // Check players
    const target = findPlayer(name);
    if (target && target !== p) {
      const actionsList = ['examine', 'trade', 'pm', 'friend add'];
      const area = tiles.getArea(p.x, p.y, p.layer);
      if (area && area.pvp) actionsList.push('attack');
      return `── ${target.name} ──\nActions: ${actionsList.join(', ')}`;
    }
    // Check ground items
    const gItem = groundItems.find(i => i.name.toLowerCase() === name && Math.abs(i.x - p.x) <= 3 && Math.abs(i.y - p.y) <= 3 && i.layer === p.layer);
    if (gItem) return `── ${gItem.name} ──\nActions: pickup, examine`;
    return `Nothing called "${name}" nearby.`;
  }
});

// ── Dismiss random event ──
commands.register('dismiss', { help: 'Dismiss a random event', category: 'General',
  fn: (p) => {
    if (!p.pendingEvent) return 'No random event to dismiss.';
    p.pendingEvent = null;
    return 'You dismiss the random event.';
  }
});

// ── Answer random event quiz ──
commands.register('answer', { help: 'Answer a quiz random event: answer [number]', category: 'General',
  fn: (p, args) => {
    if (!p.pendingEvent || p.pendingEvent.type !== 'quiz') return 'There is no quiz to answer.';
    const answer = args.join('').trim();
    if (answer === p.pendingEvent.answer) {
      const reward = 50 + Math.floor(Math.random() * 200);
      invAdd(p, 101, 'Coins', reward, true);
      p.pendingEvent = null;
      return `Correct! The old man rewards you with ${reward} coins.`;
    }
    p.pendingEvent = null;
    return 'Wrong answer! The old man vanishes.';
  }
});

// ── Accept random event (genie) ──
commands.register('accept', { help: 'Accept a random event reward: accept genie', category: 'General',
  fn: (p, args) => {
    const what = args.join(' ').toLowerCase();
    if (what !== 'genie') return 'Usage: accept genie';
    if (!p.pendingEvent || p.pendingEvent.type !== 'genie') return 'There is no genie to accept.';
    // Give XP lamp based on player level
    const lampId = 950; // small lamp
    invAdd(p, lampId, 'XP lamp (small)', 1);
    p.pendingEvent = null;
    return 'The genie grants you an XP lamp! Use it with `uselamp [skill]`.';
  }
});

// ── Clan system ──
commands.register('clan', { help: 'Clan commands: clan create/invite/kick/chat/leave/info [args]', category: 'Social',
  fn: (p, args) => {
    const sub = args[0]?.toLowerCase();
    if (!sub) {
      if (!p.clan) return 'You are not in a clan. Type `clan create [name]` to create one.';
      const clan = clans.get(p.clan.toLowerCase());
      if (!clan) { p.clan = null; return 'Your clan no longer exists.'; }
      let out = `── Clan: ${clan.name} ──\n`;
      out += `Owner: ${clan.owner}\n`;
      out += `Members (${clan.members.size}): ${[...clan.members].join(', ')}`;
      return out;
    }

    if (sub === 'create') {
      const clanName = args.slice(1).join(' ');
      if (!clanName) return 'Usage: clan create [name]';
      if (p.clan) return 'You are already in a clan. Leave first with `clan leave`.';
      if (clans.has(clanName.toLowerCase())) return 'A clan with that name already exists.';
      const members = new Set([p.name]);
      clans.set(clanName.toLowerCase(), { owner: p.name, members, name: clanName });
      p.clan = clanName;
      saveClanData();
      return `Clan "${clanName}" created! You are the owner.`;
    }

    if (sub === 'invite') {
      const targetName = args.slice(1).join(' ');
      if (!targetName) return 'Usage: clan invite [player]';
      if (!p.clan) return 'You are not in a clan.';
      const clan = clans.get(p.clan.toLowerCase());
      if (!clan) return 'Your clan no longer exists.';
      if (clan.owner !== p.name) return 'Only the clan owner can invite players.';
      const target = findPlayer(targetName);
      if (!target) return `Player "${targetName}" not found online.`;
      if (target.clan) return `${target.name} is already in a clan.`;
      clan.members.add(target.name);
      target.clan = clan.name;
      saveClanData();
      // Notify target
      for (const [ws2, pl] of players) {
        if (pl === target) { sendText(ws2, `You have been invited to clan "${clan.name}" by ${p.name}.`); break; }
      }
      return `${target.name} has been added to the clan.`;
    }

    if (sub === 'kick') {
      const targetName = args.slice(1).join(' ');
      if (!targetName) return 'Usage: clan kick [player]';
      if (!p.clan) return 'You are not in a clan.';
      const clan = clans.get(p.clan.toLowerCase());
      if (!clan) return 'Your clan no longer exists.';
      if (clan.owner !== p.name) return 'Only the clan owner can kick players.';
      if (targetName.toLowerCase() === p.name.toLowerCase()) return "You can't kick yourself.";
      const removed = [...clan.members].find(m => m.toLowerCase() === targetName.toLowerCase());
      if (!removed) return `${targetName} is not in your clan.`;
      clan.members.delete(removed);
      // Clear their clan reference if online
      const target = findPlayer(removed);
      if (target) {
        target.clan = null;
        for (const [ws2, pl] of players) {
          if (pl === target) { sendText(ws2, `You have been kicked from clan "${clan.name}".`); break; }
        }
      }
      saveClanData();
      return `${removed} has been kicked from the clan.`;
    }

    if (sub === 'chat' || sub === 'c') {
      const msg = args.slice(1).join(' ');
      if (!msg) return 'Usage: clan chat [message]';
      if (!p.clan) return 'You are not in a clan.';
      const clan = clans.get(p.clan.toLowerCase());
      if (!clan) return 'Your clan no longer exists.';
      for (const [ws2, pl] of players) {
        if (pl.clan && pl.clan.toLowerCase() === p.clan.toLowerCase()) {
          sendText(ws2, `[Clan] ${p.name}: ${msg}`);
        }
      }
      return '';
    }

    if (sub === 'leave') {
      if (!p.clan) return 'You are not in a clan.';
      const clan = clans.get(p.clan.toLowerCase());
      if (clan) {
        if (clan.owner === p.name) {
          // Owner leaving disbands the clan
          for (const member of clan.members) {
            const pl = findPlayer(member);
            if (pl) {
              pl.clan = null;
              for (const [ws2, p2] of players) {
                if (p2 === pl && pl !== p) sendText(ws2, `The clan "${clan.name}" has been disbanded.`);
              }
            }
          }
          clans.delete(p.clan.toLowerCase());
        } else {
          clan.members.delete(p.name);
        }
        saveClanData();
      }
      const clanName = p.clan;
      p.clan = null;
      return `You left the clan "${clanName}".`;
    }

    if (sub === 'info') {
      const clanName = args.slice(1).join(' ');
      if (!clanName && !p.clan) return 'Usage: clan info [name]';
      const lookupName = clanName || p.clan;
      const clan = clans.get(lookupName.toLowerCase());
      if (!clan) return `Clan "${lookupName}" not found.`;
      let out = `── Clan: ${clan.name} ──\n`;
      out += `Owner: ${clan.owner}\n`;
      out += `Members (${clan.members.size}): ${[...clan.members].join(', ')}`;
      return out;
    }

    return 'Clan commands: create, invite, kick, chat, leave, info';
  }
});

function saveClanData() {
  const data = {};
  for (const [key, clan] of clans) {
    data[key] = { owner: clan.owner, members: [...clan.members], name: clan.name };
  }
  persistence.save('clans.json', data);
}

commands.register('stop', { help: 'Stop current action', aliases: ['cancel'], category: 'General',
  fn: (p) => {
    if (!p.busy && !actions.isActive(p) && !p.combatTarget && !p.pvpTarget) return 'You aren\'t doing anything.';
    if (p.combatTarget) { p.combatTarget = null; }
    if (p.pvpTarget) { p.pvpTarget = null; }
    actions.cancel(p);
    p.path = [];
    return 'You stop what you\'re doing.';
  }
});

// Chat
commands.register('say', { help: 'Public chat: say [message]', aliases: ['chat'], category: 'Social',
  fn: (p, args, raw) => {
    const msg = raw.replace(/^(say|chat)\s+/i, '');
    broadcast({ t: 'chat', from: p.name, msg });
    // Overhead chat: nearby players see the message with player name
    for (const [ws2, pl] of players) {
      if (pl !== p && Math.abs(pl.x - p.x) <= 10 && Math.abs(pl.y - p.y) <= 10 && pl.layer === p.layer) {
        sendText(ws2, `[${p.name}]: ${msg}`);
      }
    }
    return `You say: ${msg}`;
  }
});

commands.register('pm', { help: 'Private message: pm [player] [message]', aliases: ['whisper', 'tell'], category: 'Social',
  fn: (p, args) => {
    if (args.length < 2) return 'Usage: pm [player] [message]';
    const target = findPlayer(args[0]);
    if (!target) return `Player "${args[0]}" not found.`;
    const msg = args.slice(1).join(' ');
    // Find target's ws
    for (const [ws, pl] of players) {
      if (pl === target) { sendText(ws, `[PM from ${p.name}]: ${msg}`); break; }
    }
    return `[PM to ${target.name}]: ${msg}`;
  }
});

// Admin / World Building
commands.register('paint', { help: 'Paint tile: paint [x] [y] [type]', category: 'Build', admin: true,
  fn: (p, args) => {
    const x = parseInt(args[0]), y = parseInt(args[1]);
    const typeName = (args[2] || '').toUpperCase();
    if (isNaN(x) || isNaN(y)) return 'Usage: paint [x] [y] [type]';
    const tile = tiles.T[typeName];
    if (tile === undefined) return `Unknown tile type: ${typeName}. Types: ${Object.keys(tiles.T).join(', ')}`;
    tiles.setTile(x, y, tile, p.layer);
    return `Painted (${x}, ${y}) → ${typeName}`;
  }
});

commands.register('fill', { help: 'Fill area: fill [x1] [y1] [x2] [y2] [type]', category: 'Build', admin: true,
  fn: (p, args) => {
    const [x1, y1, x2, y2] = args.slice(0, 4).map(Number);
    const typeName = (args[4] || '').toUpperCase();
    if ([x1,y1,x2,y2].some(isNaN)) return 'Usage: fill [x1] [y1] [x2] [y2] [type]';
    const tile = tiles.T[typeName];
    if (tile === undefined) return `Unknown tile: ${typeName}`;
    let count = 0;
    for (let x = Math.min(x1,x2); x <= Math.max(x1,x2); x++) {
      for (let y = Math.min(y1,y2); y <= Math.max(y1,y2); y++) {
        tiles.setTile(x, y, tile, p.layer);
        count++;
      }
    }
    return `Filled ${count} tiles with ${typeName}.`;
  }
});

commands.register('wall', { help: 'Place wall: wall [x] [y] [n/e/s/w]', category: 'Build', admin: true,
  fn: (p, args) => {
    const x = parseInt(args[0]) || p.x, y = parseInt(args[1]) || p.y;
    const dir = (args[2] || args[0] || '').toLowerCase();
    const edge = { n: 1, e: 2, s: 4, w: 8 }[dir];
    if (!edge) return 'Usage: wall [x] [y] [n/e/s/w] or wall [n/e/s/w]';
    const current = walls.getWallEdge(x, y, p.layer);
    walls.setWallEdge(x, y, current | edge, p.layer);
    return `Wall placed at (${x}, ${y}) ${dir}.`;
  }
});

commands.register('door', { help: 'Place door: door [x] [y] [n/e/s/w]', category: 'Build', admin: true,
  fn: (p, args) => {
    const x = parseInt(args[0]) || p.x, y = parseInt(args[1]) || p.y;
    const dir = (args[2] || args[0] || '').toLowerCase();
    const edge = { n: 1, e: 2, s: 4, w: 8 }[dir];
    if (!edge) return 'Usage: door [x] [y] [n/e/s/w]';
    const current = walls.getDoorEdge(x, y, p.layer);
    walls.setDoorEdge(x, y, current | edge, p.layer);
    return `Door placed at (${x}, ${y}) ${dir}.`;
  }
});

commands.register('spawn_npc', { help: 'Spawn NPC: spawn_npc [defId] [x] [y]', category: 'Build', admin: true,
  fn: (p, args) => {
    const defId = args[0];
    const x = parseInt(args[1]) || p.x, y = parseInt(args[2]) || p.y;
    const npc = npcs.spawnNpc(defId, x, y, p.layer);
    if (!npc) return `Unknown NPC definition: ${defId}. Defined: ${[...npcs.npcDefs.keys()].join(', ')}`;
    return `Spawned ${npc.name} at (${x}, ${y}).`;
  }
});

commands.register('place', { help: 'Place object: place [defId] [x] [y]', category: 'Build', admin: true,
  fn: (p, args) => {
    const defId = args[0];
    const x = parseInt(args[1]) || p.x, y = parseInt(args[2]) || p.y;
    const obj = objects.placeObject(defId, x, y, p.layer);
    if (!obj) return `Unknown object: ${defId}. Defined: ${[...objects.objectDefs.keys()].join(', ')}`;
    return `Placed ${obj.name} at (${x}, ${y}).`;
  }
});

commands.register('give', { help: 'Give yourself an item: give [name] [count]', category: 'Build', admin: true,
  fn: (p, args) => {
    // Parse: last arg might be count
    let count = parseInt(args[args.length - 1]);
    let name;
    if (!isNaN(count) && args.length > 1) {
      name = args.slice(0, -1).join(' ');
    } else {
      name = args.join(' ');
      count = 1;
    }
    if (!name) return 'Usage: give [item name] [count]';
    // Look up in item database
    const def = items.find(name);
    if (def) {
      invAdd(p, def.id, def.name, count, def.stackable);
      return `Added ${def.name} x${count} to inventory.`;
    }
    // Fuzzy search
    const results = items.search(name);
    if (results.length) return `Item not found. Did you mean: ${results.slice(0, 5).map(i => i.name).join(', ')}`;
    return `Unknown item: "${name}". Use exact name from item database.`;
  }
});

// ── Banking ───────────────────────────────────────────────────────────────────
commands.register('bank', { help: 'Open bank (near bank booth)', category: 'Items',
  fn: (p) => {
    // UIM restriction (feature 3)
    if (p.accountMode === 'uim') return "As an Ultimate Ironman, you can't use the bank.";
    const booth = objects.findObjectByName('bank booth', p.x, p.y, 3, p.layer);
    if (!booth) return 'You need to be near a bank booth.';
    if (!p.bank) p.bank = [];
    let out = `── Bank (${p.bank.length}/816) ──\n`;
    if (!p.bank.length) out += '  (empty)\n';
    for (let i = 0; i < p.bank.length; i++) {
      const b = p.bank[i];
      out += `  [${i}] ${b.name}${b.count > 1 ? ` x${b.count}` : ''}\n`;
    }
    out += '\nCommands: deposit [item], deposit all, withdraw [item] [count]';
    p._bankOpen = true;
    return out;
  }
});

commands.register('deposit', { help: 'Deposit item: deposit [item] or deposit all', category: 'Items',
  fn: (p, args) => {
    if (!p._bankOpen) return 'Open the bank first with `bank`.';
    if (!p.bank) p.bank = [];
    if (args[0] === 'all') {
      let deposited = 0;
      for (let i = 0; i < p.inventory.length; i++) {
        if (p.inventory[i]) {
          const item = p.inventory[i];
          const existing = p.bank.find(b => b.id === item.id);
          if (existing) existing.count += item.count;
          else if (p.bank.length < 816) p.bank.push({ id: item.id, name: item.name, count: item.count });
          else { return `Bank full. Deposited ${deposited} items.`; }
          p.inventory[i] = null;
          deposited++;
        }
      }
      return `Deposited ${deposited} items.`;
    }
    const name = args.join(' ').toLowerCase();
    const slot = p.inventory.findIndex(s => s && s.name.toLowerCase() === name);
    if (slot < 0) return `You don't have "${name}".`;
    const item = p.inventory[slot];
    const existing = p.bank.find(b => b.id === item.id);
    if (existing) existing.count += item.count;
    else if (p.bank.length < 816) p.bank.push({ id: item.id, name: item.name, count: item.count });
    else return 'Bank is full.';
    p.inventory[slot] = null;
    return `Deposited ${item.name} x${item.count}.`;
  }
});

commands.register('withdraw', { help: 'Withdraw item: withdraw [item] [count]', category: 'Items',
  fn: (p, args) => {
    if (!p._bankOpen) return 'Open the bank first with `bank`.';
    if (!p.bank) p.bank = [];
    if (invFreeSlots(p) < 1) return 'Inventory is full.';
    const count = parseInt(args[args.length - 1]);
    const name = (!isNaN(count) && args.length > 1 ? args.slice(0, -1) : args).join(' ').toLowerCase();
    const amt = !isNaN(count) && args.length > 1 ? count : 1;
    const bankIdx = p.bank.findIndex(b => b.name.toLowerCase() === name);
    if (bankIdx < 0) return `"${name}" not in bank.`;
    const bankItem = p.bank[bankIdx];
    const withdrawAmt = Math.min(amt, bankItem.count);
    const def = items.get(bankItem.id);
    invAdd(p, bankItem.id, bankItem.name, withdrawAmt, def?.stackable);
    bankItem.count -= withdrawAmt;
    if (bankItem.count <= 0) p.bank.splice(bankIdx, 1);
    return `Withdrew ${bankItem.name} x${withdrawAmt}.`;
  }
});

// ── Grand Exchange ────────────────────────────────────────────────────────────
commands.register('ge', { help: 'Grand Exchange: ge buy/sell/offers/collect/price', category: 'Economy',
  fn: (p, args) => {
    const sub = args[0]?.toLowerCase();
    if (sub === 'buy') {
      const name = args.slice(1, -2).join(' ');
      const qty = parseInt(args[args.length - 2]);
      const price = parseInt(args[args.length - 1]);
      if (!name || isNaN(qty) || isNaN(price)) return 'Usage: ge buy [item] [quantity] [price per item]';
      const def = items.find(name);
      if (!def) return `Unknown item: "${name}"`;
      const totalCost = qty * price;
      if (invCount(p, 101) < totalCost) return `You need ${totalCost} coins. You have ${invCount(p, 101)}.`;
      invRemove(p, 101, totalCost);
      const offer = ge.createOffer('buy', p.id, p.name, def.id, def.name, qty, price);
      if (!offer) return 'You have too many GE offers (max 8).';
      let msg = `Buy offer placed: ${qty}x ${def.name} at ${price} each (${totalCost} total).`;
      if (offer.collected > 0) msg += `\n  Instantly matched: ${offer.collected} items ready to collect.`;
      return msg;
    }
    if (sub === 'sell') {
      const name = args.slice(1, -2).join(' ');
      const qty = parseInt(args[args.length - 2]);
      const price = parseInt(args[args.length - 1]);
      if (!name || isNaN(qty) || isNaN(price)) return 'Usage: ge sell [item] [quantity] [price per item]';
      const def = items.find(name);
      if (!def) return `Unknown item: "${name}"`;
      if (invCount(p, def.id) < qty) return `You only have ${invCount(p, def.id)}x ${def.name}.`;
      invRemove(p, def.id, qty);
      const offer = ge.createOffer('sell', p.id, p.name, def.id, def.name, qty, price);
      if (!offer) return 'You have too many GE offers (max 8).';
      let msg = `Sell offer placed: ${qty}x ${def.name} at ${price} each.`;
      if (offer.collectedCoins > 0) msg += `\n  Instantly sold: ${offer.collectedCoins} coins ready to collect.`;
      return msg;
    }
    if (sub === 'offers') {
      const myOffers = ge.getPlayerOffers(p.id);
      if (!myOffers.length) return 'No active GE offers.';
      let out = '── Grand Exchange ──\n';
      for (const o of myOffers) {
        const filled = o.quantity - o.remaining;
        out += `  [${o.id}] ${o.type.toUpperCase()} ${o.quantity}x ${o.itemName} @ ${o.price}ea — ${filled}/${o.quantity} filled`;
        if (o.collected > 0) out += ` | ${o.collected} items to collect`;
        if (o.collectedCoins > 0) out += ` | ${o.collectedCoins} coins to collect`;
        out += '\n';
      }
      out += '\nCommands: ge collect [id], ge cancel [id]';
      return out;
    }
    if (sub === 'collect') {
      const id = parseInt(args[1]);
      if (isNaN(id)) return 'Usage: ge collect [offer id]';
      const result = ge.collectOffer(id);
      if (!result) return 'Offer not found.';
      let msg = 'Collected:';
      if (result.items > 0) {
        const offer = ge.offers.find(o => o.id === id) || ge.getPlayerOffers(p.id).find(o => o.id === id);
        const itemName = offer?.itemName || 'items';
        const def = items.find(itemName);
        invAdd(p, def?.id || 0, itemName, result.items, def?.stackable);
        msg += ` ${result.items}x ${itemName}`;
      }
      if (result.coins > 0) {
        invAdd(p, 101, 'Coins', result.coins, true);
        msg += ` ${result.coins} coins`;
      }
      return msg;
    }
    if (sub === 'cancel') {
      const id = parseInt(args[1]);
      if (isNaN(id)) return 'Usage: ge cancel [offer id]';
      const result = ge.cancelOffer(id);
      if (!result) return 'Offer not found.';
      if (result.refund.items > 0) invAdd(p, result.offer.itemId, result.offer.itemName, result.refund.items, items.get(result.offer.itemId)?.stackable);
      if (result.refund.coins > 0) invAdd(p, 101, 'Coins', result.refund.coins, true);
      return `Cancelled. Refunded: ${result.refund.items > 0 ? result.refund.items + 'x ' + result.offer.itemName + ' ' : ''}${result.refund.coins > 0 ? result.refund.coins + ' coins' : ''}`;
    }
    if (sub === 'price') {
      const name = args.slice(1).join(' ');
      const def = items.find(name);
      if (!def) return `Unknown item: "${name}"`;
      const price = ge.getPrice(def.id);
      return `${def.name}: ${price ? price + ' coins (last trade)' : 'No trades yet'} | Base value: ${def.value} | High alch: ${def.highAlch}`;
    }
    return 'Grand Exchange commands:\n  ge buy [item] [qty] [price]\n  ge sell [item] [qty] [price]\n  ge offers\n  ge collect [id]\n  ge cancel [id]\n  ge price [item]';
  }
});

commands.register('setlevel', { help: 'Set skill level: setlevel [skill] [level]', category: 'Build', admin: true,
  fn: (p, args) => {
    const skill = (args[0] || '').toLowerCase();
    const level = parseInt(args[1]);
    if (!p.skills[skill]) return `Unknown skill: ${skill}`;
    if (isNaN(level) || level < 1 || level > 99) return 'Level must be 1-99.';
    p.skills[skill].xp = xpForLevel(level);
    p.skills[skill].level = level;
    if (skill === 'hitpoints') { p.maxHp = level; p.hp = level; }
    if (skill === 'prayer') p.prayerPoints = level;
    return `${skill} set to level ${level}.`;
  }
});

commands.register('admin', { help: 'Toggle admin mode', category: 'Build',
  fn: (p) => { p.admin = !p.admin; return `Admin: ${p.admin ? 'ON' : 'OFF'}`; }
});

commands.register('replays', { help: 'List session recordings', category: 'General',
  fn: () => {
    if (!fs.existsSync(LOGS_DIR)) return 'No recordings yet.';
    const files = fs.readdirSync(LOGS_DIR).filter(f => f.endsWith('.jsonl')).sort().reverse();
    if (!files.length) return 'No recordings yet.';
    return 'Session recordings:\n' + files.map((f, i) => {
      const lines = fs.readFileSync(path.join(LOGS_DIR, f), 'utf8').trim().split('\n');
      const last = JSON.parse(lines[lines.length - 1]);
      const ticks = last.tick;
      const secs = (ticks * 0.6).toFixed(0);
      return `  [${i}] ${f} (${ticks} ticks, ~${secs}s)`;
    }).join('\n') + '\n\nType `replay [number]` for real-time playback.';
  }
});

// Step-through replays: ws → { entries, idx, currentTick }
const activeReplays = new Map();

function replayNext(ws) {
  const replay = activeReplays.get(ws);
  if (!replay) return;

  const { entries } = replay;
  if (replay.idx >= entries.length) {
    sendText(ws, '\n── Replay complete ──');
    activeReplays.delete(ws);
    return;
  }

  // Show all entries for the current tick
  const currentTick = entries[replay.idx].tick;
  while (replay.idx < entries.length && entries[replay.idx].tick === currentTick) {
    const e = entries[replay.idx];
    if (e.type === 'in') {
      sendText(ws, `[tick ${e.tick}] > ${e.text}`);
    } else if (e.type === 'out') {
      sendText(ws, `[tick ${e.tick}]   ${e.text}`);
    } else if (e.type === 'end') {
      sendText(ws, '\n── Replay complete ──');
      activeReplays.delete(ws);
      return;
    }
    replay.idx++;
  }

  // Show progress
  if (replay.idx < entries.length) {
    const remaining = entries.length - replay.idx;
    sendText(ws, `    ── [${remaining} entries left — press Enter to continue, type "q" to stop] ──`);
  } else {
    sendText(ws, '\n── Replay complete ──');
    activeReplays.delete(ws);
  }
}

commands.register('replay', { help: 'Step-through replay: replay [number]', category: 'General',
  fn: (p, args) => {
    if (!fs.existsSync(LOGS_DIR)) return 'No recordings yet.';
    const files = fs.readdirSync(LOGS_DIR).filter(f => f.endsWith('.jsonl')).sort().reverse();
    const idx = parseInt(args[0]);
    if (isNaN(idx) || idx < 0 || idx >= files.length) return `Usage: replay [0-${files.length - 1}]`;

    let playerWs = null;
    for (const [ws, pl] of players) { if (pl === p) { playerWs = ws; break; } }
    if (!playerWs) return 'Error finding connection.';

    // Stop any active replay
    activeReplays.delete(playerWs);

    // Parse recording
    const lines = fs.readFileSync(path.join(LOGS_DIR, files[idx]), 'utf8').trim().split('\n');
    const entries = lines.map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
    if (!entries.length) return 'Empty recording.';

    const lastTick = entries[entries.length - 1].tick;
    sendText(playerWs, `── Replay: ${files[idx]} ── (${lastTick} ticks, ~${(lastTick * 0.6).toFixed(0)}s)`);
    sendText(playerWs, '    Press Enter to step through. Type "q" to stop.\n');

    activeReplays.set(playerWs, { entries, idx: 0 });
    replayNext(playerWs);
    return '';
  }
});

commands.register('stopreplay', { help: 'Stop active replay', category: 'General',
  fn: (p) => {
    for (const [ws, pl] of players) {
      if (pl === p && activeReplays.has(ws)) {
        activeReplays.delete(ws);
        return 'Replay stopped.';
      }
    }
    return 'No replay active.';
  }
});

commands.register('save', { help: 'Save world', category: 'Build', admin: true,
  fn: () => { persistence.saveAll(); return 'World saved.'; }
});

// ── Default content ───────────────────────────────────────────────────────────
function createDefaultContent() {
  const T = tiles.T;

  // ── NPC Definitions ────────────────────────────────────────────────────────
  npcs.defineNpc('goblin', { name: 'Goblin', examine: 'An ugly green creature.', combat: 2, maxHp: 5, stats: { attack: 1, strength: 1, defence: 1 }, maxHit: 1, attackSpeed: 4, aggressive: true, aggroRange: 3, wanderRadius: 4, respawnTicks: 25,
    drops: [{ id: 100, name: 'Bones', weight: 10, min: 1, max: 1 }, { id: 101, name: 'Coins', weight: 8, min: 1, max: 5 }],
    thieving: { level: 1, xp: 10, loot: [{ id: 101, name: 'Coins', min: 1, max: 5 }], stunDamage: 1 }
  });
  npcs.defineNpc('cow', { name: 'Cow', examine: 'Moo.', combat: 2, maxHp: 8, stats: { attack: 1, strength: 1, defence: 1 }, maxHit: 1, attackSpeed: 5, wanderRadius: 6, respawnTicks: 20,
    drops: [{ id: 102, name: 'Cowhide', weight: 10, min: 1, max: 1 }, { id: 103, name: 'Raw beef', weight: 8, min: 1, max: 1 }, { id: 100, name: 'Bones', weight: 10, min: 1, max: 1 }] });
  npcs.defineNpc('chicken', { name: 'Chicken', examine: 'Cluck.', combat: 1, maxHp: 3, stats: { attack: 1, strength: 1, defence: 1 }, maxHit: 1, attackSpeed: 4, wanderRadius: 3, respawnTicks: 15,
    drops: [{ id: 104, name: 'Feather', weight: 10, min: 5, max: 15 }, { id: 105, name: 'Raw chicken', weight: 8, min: 1, max: 1 }, { id: 100, name: 'Bones', weight: 10, min: 1, max: 1 }] });
  npcs.defineNpc('guard', { name: 'Guard', examine: 'A town guard.', combat: 21, maxHp: 22, stats: { attack: 18, strength: 14, defence: 18, def_slash: 24 }, maxHit: 3, attackSpeed: 4, wanderRadius: 3, respawnTicks: 30,
    drops: [{ id: 100, name: 'Bones', weight: 10, min: 1, max: 1 }, { id: 101, name: 'Coins', weight: 6, min: 10, max: 30 }],
    thieving: { level: 40, xp: 46, loot: [{ id: 101, name: 'Coins', min: 15, max: 50 }], stunDamage: 2 }
  });
  npcs.defineNpc('hans', { name: 'Hans', examine: 'A man walking around the castle.', combat: 0, maxHp: 1, wanderRadius: 10, dialogue: 'Hello adventurer! Welcome to Scape.',
    thieving: { level: 1, xp: 8, loot: [{ id: 101, name: 'Coins', min: 1, max: 3 }], stunDamage: 1 }
  });
  npcs.defineNpc('man', { name: 'Man', examine: 'A man.', combat: 2, maxHp: 7, stats: { attack: 1, strength: 1, defence: 1 }, maxHit: 1, attackSpeed: 4, wanderRadius: 5, respawnTicks: 20,
    drops: [{ id: 100, name: 'Bones', weight: 10, min: 1, max: 1 }],
    thieving: { level: 1, xp: 8, loot: [{ id: 101, name: 'Coins', min: 1, max: 3 }], stunDamage: 1 }
  });
  npcs.defineNpc('woman', { name: 'Woman', examine: 'A woman.', combat: 2, maxHp: 7, stats: { attack: 1, strength: 1, defence: 1 }, maxHit: 1, attackSpeed: 4, wanderRadius: 5, respawnTicks: 20,
    drops: [{ id: 100, name: 'Bones', weight: 10, min: 1, max: 1 }],
    thieving: { level: 1, xp: 8, loot: [{ id: 101, name: 'Coins', min: 1, max: 3 }], stunDamage: 1 }
  });
  npcs.defineNpc('farmer', { name: 'Farmer', examine: 'A farmer tending crops.', combat: 7, maxHp: 10, stats: { attack: 5, strength: 3, defence: 4 }, maxHit: 1, attackSpeed: 4, wanderRadius: 4, respawnTicks: 20,
    drops: [{ id: 100, name: 'Bones', weight: 10, min: 1, max: 1 }],
    thieving: { level: 10, xp: 14, loot: [{ id: 101, name: 'Coins', min: 3, max: 9 }], stunDamage: 1 }
  });
  npcs.defineNpc('warrior', { name: 'Warrior', examine: 'A warrior.', combat: 18, maxHp: 20, stats: { attack: 12, strength: 10, defence: 14 }, maxHit: 3, attackSpeed: 4, wanderRadius: 4, respawnTicks: 25,
    drops: [{ id: 100, name: 'Bones', weight: 10, min: 1, max: 1 }, { id: 101, name: 'Coins', weight: 6, min: 5, max: 20 }],
    thieving: { level: 25, xp: 26, loot: [{ id: 101, name: 'Coins', min: 10, max: 25 }], stunDamage: 2 }
  });
  npcs.defineNpc('knight', { name: 'Knight', examine: 'A White Knight.', combat: 36, maxHp: 34, stats: { attack: 30, strength: 25, defence: 30 }, maxHit: 4, attackSpeed: 4, wanderRadius: 3, respawnTicks: 30,
    drops: [{ id: 100, name: 'Bones', weight: 10, min: 1, max: 1 }, { id: 101, name: 'Coins', weight: 6, min: 20, max: 60 }],
    thieving: { level: 55, xp: 84, loot: [{ id: 101, name: 'Coins', min: 30, max: 80 }], stunDamage: 3 }
  });
  npcs.defineNpc('hill_giant', { name: 'Hill Giant', examine: 'A very large humanoid.', combat: 28, maxHp: 35, stats: { attack: 18, strength: 22, defence: 26, def_slash: 18 }, maxHit: 4, attackSpeed: 4, aggressive: true, aggroRange: 4, wanderRadius: 4, respawnTicks: 30,
    drops: [{ id: 106, name: 'Big bones', weight: 10, min: 1, max: 1 }, { id: 101, name: 'Coins', weight: 6, min: 10, max: 50 }] });
  npcs.defineNpc('lesser_demon', { name: 'Lesser Demon', examine: 'A demon from the underworld.', combat: 82, maxHp: 79, stats: { attack: 68, strength: 67, defence: 71, def_slash: 42 }, maxHit: 8, attackSpeed: 4, wanderRadius: 3, respawnTicks: 30,
    drops: [{ id: 100, name: 'Bones', weight: 10, min: 1, max: 1 }] });
  npcs.defineNpc('green_dragon', { name: 'Green Dragon', examine: 'A green dragon.', combat: 79, maxHp: 75, stats: { attack: 68, strength: 66, defence: 64, def_slash: 40 }, maxHit: 8, attackSpeed: 4, aggressive: true, aggroRange: 5, wanderRadius: 3, respawnTicks: 40, poisonDamage: 4,
    drops: [{ id: 107, name: 'Dragon bones', weight: 10, min: 1, max: 1 }] });
  npcs.defineNpc('moss_giant', { name: 'Moss Giant', examine: 'A large moss-covered humanoid.', combat: 42, maxHp: 60, stats: { attack: 30, strength: 30, defence: 30, def_slash: 20 }, maxHit: 5, attackSpeed: 4, wanderRadius: 4, respawnTicks: 30,
    drops: [{ id: 106, name: 'Big bones', weight: 10, min: 1, max: 1 }, { id: 101, name: 'Coins', weight: 6, min: 20, max: 80 }] });
  npcs.defineNpc('dark_wizard', { name: 'Dark Wizard', examine: 'A wizard of the dark arts.', combat: 20, maxHp: 19, stats: { attack: 15, strength: 12, defence: 10 }, maxHit: 4, aggressive: true, aggroRange: 5, attackSpeed: 5, wanderRadius: 3, respawnTicks: 25,
    drops: [{ id: 100, name: 'Bones', weight: 10, min: 1, max: 1 }, { id: 274, name: 'Mind rune', weight: 6, min: 5, max: 15 }] });
  npcs.defineNpc('skeleton', { name: 'Skeleton', examine: 'A reanimated skeleton.', combat: 22, maxHp: 23, stats: { attack: 16, strength: 14, defence: 16 }, maxHit: 3, aggressive: true, aggroRange: 4, attackSpeed: 4, wanderRadius: 4, respawnTicks: 25,
    drops: [{ id: 100, name: 'Bones', weight: 10, min: 1, max: 1 }, { id: 101, name: 'Coins', weight: 6, min: 5, max: 20 }] });
  npcs.defineNpc('zombie', { name: 'Zombie', examine: 'The undead.', combat: 24, maxHp: 25, stats: { attack: 17, strength: 16, defence: 15 }, maxHit: 3, aggressive: true, aggroRange: 4, attackSpeed: 4, wanderRadius: 3, respawnTicks: 25,
    drops: [{ id: 100, name: 'Bones', weight: 10, min: 1, max: 1 }] });
  npcs.defineNpc('greater_demon', { name: 'Greater Demon', examine: 'A powerful demon.', combat: 92, maxHp: 87, stats: { attack: 78, strength: 80, defence: 75, def_slash: 50 }, maxHit: 10, aggressive: true, aggroRange: 5, attackSpeed: 4, wanderRadius: 3, respawnTicks: 35,
    drops: [{ id: 100, name: 'Bones', weight: 10, min: 1, max: 1 }, { id: 101, name: 'Coins', weight: 6, min: 30, max: 100 }] });
  npcs.defineNpc('giant_spider', { name: 'Giant Spider', examine: 'A very large spider.', combat: 2, maxHp: 4, stats: { attack: 1, strength: 1, defence: 1 }, maxHit: 1, attackSpeed: 4, wanderRadius: 5, respawnTicks: 15, drops: [] });
  npcs.defineNpc('poison_spider', { name: 'Poison Spider', examine: 'A venomous spider.', combat: 64, maxHp: 56, stats: { attack: 50, strength: 48, defence: 44, def_slash: 30 }, maxHit: 6, attackSpeed: 4, aggressive: true, aggroRange: 4, wanderRadius: 4, respawnTicks: 25, poisonDamage: 5, drops: [] });
  npcs.defineNpc('scorpion', { name: 'Scorpion', examine: 'A dangerous scorpion.', combat: 14, maxHp: 17, stats: { attack: 10, strength: 8, defence: 8 }, maxHit: 2, aggressive: true, aggroRange: 3, attackSpeed: 4, wanderRadius: 3, respawnTicks: 20, drops: [] });

  // Shop/NPC definitions
  npcs.defineNpc('shopkeeper', { name: 'Shopkeeper', examine: 'A general store shopkeeper.', combat: 0, maxHp: 1, wanderRadius: 2, dialogue: 'Want to see my wares? Type `shop shopkeeper`.' });
  npcs.defineNpc('weapon_master', { name: 'Weapon Master', examine: 'A weapon dealer.', combat: 0, maxHp: 1, wanderRadius: 1, dialogue: 'Looking for a weapon? Type `shop weapon master`.' });
  npcs.defineNpc('armour_seller', { name: 'Armour Seller', examine: 'An armour dealer.', combat: 0, maxHp: 1, wanderRadius: 1, dialogue: 'Need some protection? Type `shop armour seller`.' });
  npcs.defineNpc('fishing_tutor', { name: 'Fishing Tutor', examine: 'A fishing instructor.', combat: 0, maxHp: 1, wanderRadius: 1, dialogue: 'Need supplies? Type `shop fishing tutor`.' });
  npcs.defineNpc('mining_instructor', { name: 'Mining Instructor', examine: 'A mining instructor.', combat: 0, maxHp: 1, wanderRadius: 1, dialogue: 'Need a pickaxe? Type `shop mining instructor`.' });
  npcs.defineNpc('aubury', { name: 'Aubury', examine: 'A rune shop owner.', combat: 0, maxHp: 1, wanderRadius: 1, dialogue: 'Interested in runes? Type `shop aubury`.' });
  npcs.defineNpc('slayer_master', { name: 'Turael', examine: 'A slayer master.', combat: 0, maxHp: 1, wanderRadius: 1, dialogue: 'Need a task? Type `slayer turael`.' });
  npcs.defineNpc('cook_npc', { name: 'Cook', examine: 'The castle cook.', combat: 0, maxHp: 1, wanderRadius: 2, dialogue: 'I need help with a cake! Type `startquest cook`.' });
  npcs.defineNpc('banker', { name: 'Banker', examine: 'A bank employee.', combat: 0, maxHp: 1, wanderRadius: 1, dialogue: 'Type `bank` to access your bank.' });
  npcs.defineNpc('tanner', { name: 'Tanner', examine: 'A leather worker.', combat: 0, maxHp: 1, wanderRadius: 1, dialogue: 'Type `craft leather` to tan hides.' });
  npcs.defineNpc('herbalist', { name: 'Herbalist', examine: 'A herb shop owner.', combat: 0, maxHp: 1, wanderRadius: 1, dialogue: 'Need potion supplies? Type `shop herbalist`.' });

  // ── Boss NPC Definitions ──────────────────────────────────────────────────
  npcs.defineNpc('king_black_dragon', { name: 'King Black Dragon', examine: 'The king of all black dragons.', combat: 276, maxHp: 255, stats: { attack: 240, strength: 240, defence: 240, def_slash: 120 }, maxHit: 25, attackSpeed: 4, aggressive: true, aggroRange: 6, wanderRadius: 3, respawnTicks: 100 });
  npcs.defineNpc('giant_mole', { name: 'Giant Mole', examine: 'An enormous mole.', combat: 230, maxHp: 200, stats: { attack: 190, strength: 180, defence: 200, def_slash: 80 }, maxHit: 18, attackSpeed: 4, aggressive: true, aggroRange: 5, wanderRadius: 4, respawnTicks: 80 });
  npcs.defineNpc('dharok', { name: 'Dharok the Wretched', examine: 'A Barrows brother.', combat: 115, maxHp: 100, stats: { attack: 100, strength: 105, defence: 95 }, maxHit: 15, attackSpeed: 4, wanderRadius: 1, respawnTicks: 60 });
  npcs.defineNpc('verac', { name: 'Verac the Defiled', examine: 'A Barrows brother.', combat: 115, maxHp: 100, stats: { attack: 100, strength: 95, defence: 100 }, maxHit: 13, attackSpeed: 4, wanderRadius: 1, respawnTicks: 60 });
  npcs.defineNpc('guthan', { name: 'Guthan the Infested', examine: 'A Barrows brother.', combat: 115, maxHp: 100, stats: { attack: 95, strength: 95, defence: 95 }, maxHit: 12, attackSpeed: 4, wanderRadius: 1, respawnTicks: 60 });
  npcs.defineNpc('ahrim', { name: 'Ahrim the Blighted', examine: 'A Barrows brother.', combat: 115, maxHp: 100, stats: { attack: 70, strength: 70, defence: 70 }, maxHit: 14, attackSpeed: 5, wanderRadius: 1, respawnTicks: 60 });
  npcs.defineNpc('karil', { name: 'Karil the Tainted', examine: 'A Barrows brother.', combat: 115, maxHp: 100, stats: { attack: 70, strength: 70, defence: 70 }, maxHit: 14, attackSpeed: 3, wanderRadius: 1, respawnTicks: 60 });
  npcs.defineNpc('torag', { name: 'Torag the Corrupted', examine: 'A Barrows brother.', combat: 115, maxHp: 100, stats: { attack: 95, strength: 90, defence: 105 }, maxHit: 11, attackSpeed: 5, wanderRadius: 1, respawnTicks: 60 });

  // ── Object Definitions ─────────────────────────────────────────────────────
  objects.defineObject('tree', { name: 'Tree', examine: 'A tree.', actions: ['chop'], skill: 'woodcutting', levelReq: 1, xp: 25, ticks: 4, product: { id: 200, name: 'Logs', count: 1 }, depletionChance: 0.5, respawnTicks: 15 });
  objects.defineObject('oak', { name: 'Oak tree', examine: 'An oak tree.', actions: ['chop'], skill: 'woodcutting', levelReq: 15, xp: 37, ticks: 4, product: { id: 201, name: 'Oak logs', count: 1 }, depletionChance: 0.35, respawnTicks: 20 });
  objects.defineObject('willow', { name: 'Willow tree', examine: 'A willow tree.', actions: ['chop'], skill: 'woodcutting', levelReq: 30, xp: 67, ticks: 4, product: { id: 202, name: 'Willow logs', count: 1 }, depletionChance: 0.25, respawnTicks: 25 });
  objects.defineObject('maple', { name: 'Maple tree', examine: 'A maple tree.', actions: ['chop'], skill: 'woodcutting', levelReq: 45, xp: 100, ticks: 4, product: { id: 203, name: 'Maple logs', count: 1 }, depletionChance: 0.2, respawnTicks: 30 });
  objects.defineObject('yew', { name: 'Yew tree', examine: 'A yew tree.', actions: ['chop'], skill: 'woodcutting', levelReq: 60, xp: 175, ticks: 4, product: { id: 204, name: 'Yew logs', count: 1 }, depletionChance: 0.15, respawnTicks: 50 });
  objects.defineObject('copper_rock', { name: 'Copper rock', examine: 'A rock containing copper ore.', actions: ['mine'], skill: 'mining', levelReq: 1, xp: 17, ticks: 4, product: { id: 210, name: 'Copper ore', count: 1 }, depletionChance: 1.0, respawnTicks: 4 });
  objects.defineObject('tin_rock', { name: 'Tin rock', examine: 'A rock containing tin ore.', actions: ['mine'], skill: 'mining', levelReq: 1, xp: 17, ticks: 4, product: { id: 211, name: 'Tin ore', count: 1 }, depletionChance: 1.0, respawnTicks: 4 });
  objects.defineObject('iron_rock', { name: 'Iron rock', examine: 'A rock containing iron ore.', actions: ['mine'], skill: 'mining', levelReq: 15, xp: 35, ticks: 4, product: { id: 212, name: 'Iron ore', count: 1 }, depletionChance: 1.0, respawnTicks: 9 });
  objects.defineObject('coal_rock', { name: 'Coal rock', examine: 'A rock containing coal.', actions: ['mine'], skill: 'mining', levelReq: 30, xp: 50, ticks: 4, product: { id: 213, name: 'Coal', count: 1 }, depletionChance: 1.0, respawnTicks: 49 });
  objects.defineObject('gold_rock', { name: 'Gold rock', examine: 'A rock containing gold.', actions: ['mine'], skill: 'mining', levelReq: 40, xp: 65, ticks: 4, product: { id: 214, name: 'Gold ore', count: 1 }, depletionChance: 1.0, respawnTicks: 100 });
  objects.defineObject('mithril_rock', { name: 'Mithril rock', examine: 'A rock containing mithril.', actions: ['mine'], skill: 'mining', levelReq: 55, xp: 80, ticks: 4, product: { id: 215, name: 'Mithril ore', count: 1 }, depletionChance: 1.0, respawnTicks: 200 });
  objects.defineObject('fishing_spot', { name: 'Fishing spot', examine: 'A good spot to fish.', actions: ['fish'], skill: 'fishing', levelReq: 1, xp: 10, ticks: 5, product: { id: 220, name: 'Raw shrimps', count: 1 } });
  objects.defineObject('fly_fishing_spot', { name: 'Fly fishing spot', examine: 'A trout/salmon spot.', actions: ['fish'], skill: 'fishing', levelReq: 20, xp: 50, ticks: 5, product: { id: 221, name: 'Raw trout', count: 1 } });
  objects.defineObject('cage_fishing_spot', { name: 'Cage/Harpoon spot', examine: 'A lobster/swordfish spot.', actions: ['fish'], skill: 'fishing', levelReq: 40, xp: 90, ticks: 5, product: { id: 223, name: 'Raw lobster', count: 1 } });
  objects.defineObject('range', { name: 'Cooking range', examine: 'A range for cooking.', actions: ['cook'] });
  objects.defineObject('furnace', { name: 'Furnace', examine: 'A furnace for smelting.', actions: ['smelt'] });
  objects.defineObject('anvil', { name: 'Anvil', examine: 'An anvil for smithing.', actions: ['smith'] });
  objects.defineObject('bank_booth', { name: 'Bank booth', examine: 'A bank booth.', actions: ['bank'] });
  objects.defineObject('spinning_wheel', { name: 'Spinning wheel', examine: 'A spinning wheel.', actions: ['spin'] });
  objects.defineObject('wheat', { name: 'Wheat', examine: 'A field of wheat.', actions: ['pick'] });
  objects.defineObject('warning_sign', { name: 'Warning sign', examine: 'DANGER: Wilderness ahead! PvP is enabled beyond this point.' });
  objects.defineObject('agility_log', { name: 'Balancing log', examine: 'A narrow log to balance on.' });
  objects.defineObject('agility_net', { name: 'Obstacle net', examine: 'A net to climb.' });
  objects.defineObject('agility_wall', { name: 'Low wall', examine: 'A wall to climb over.' });
  objects.defineObject('agility_rooftop', { name: 'Rooftop edge', examine: 'A roof edge to cross.' });
  objects.defineObject('agility_gap', { name: 'Gap', examine: 'A gap to jump across.' });
  objects.defineObject('agility_ladder', { name: 'Ladder', examine: 'A ladder to climb.' });
  objects.defineObject('altar', { name: 'Altar', examine: 'An altar for prayer.', actions: ['pray'] });
  objects.defineObject('herb_patch', { name: 'Herb patch', examine: 'A patch for growing herbs.', actions: ['plant', 'harvest', 'inspect'] });

  // ── Staircase objects ──────────────────────────────────────────────────────
  objects.defineObject('staircase', { name: 'Staircase', examine: 'A staircase leading up and down.', actions: ['climb up', 'climb down'] });
  objects.defineObject('staircase_up', { name: 'Staircase up', examine: 'A staircase leading up.', actions: ['climb up'] });
  objects.defineObject('staircase_down', { name: 'Staircase down', examine: 'A staircase leading down.', actions: ['climb down'] });

  // ── Runecrafting altars ────────────────────────────────────────────────────
  objects.defineObject('air_altar', { name: 'Air altar', examine: 'An altar for crafting air runes.', actions: ['craft runes'] });
  objects.defineObject('water_altar', { name: 'Water altar', examine: 'An altar for crafting water runes.', actions: ['craft runes'] });
  objects.defineObject('earth_altar', { name: 'Earth altar', examine: 'An altar for crafting earth runes.', actions: ['craft runes'] });
  objects.defineObject('fire_altar', { name: 'Fire altar', examine: 'An altar for crafting fire runes.', actions: ['craft runes'] });

  // ── Helper functions ───────────────────────────────────────────────────────
  function fillArea(x1, y1, x2, y2, tile) {
    for (let x = x1; x <= x2; x++) for (let y = y1; y <= y2; y++) tiles.setTile(x, y, tile);
  }
  // Draw a 1-tile-wide L-shaped path (horizontal first at y1, then vertical at x2)
  function pathLine(x1, y1, x2, y2) {
    if (x1 !== x2) { const s = x1 < x2 ? 1 : -1; for (let x = x1; x !== x2 + s; x += s) tiles.setTile(x, y1, T.PATH); }
    if (y1 !== y2) { const s = y1 < y2 ? 1 : -1; for (let y = y1; y !== y2 + s; y += s) tiles.setTile(x2, y, T.PATH); }
  }
  // Draw a 3-tile-wide path between two points for reliable pathfinding
  function widePath(x1, y1, x2, y2) {
    pathLine(x1, y1, x2, y2);
    // Widen by 1 tile on each side perpendicular to the path direction
    if (x1 === x2) {
      // Vertical path — widen left and right
      pathLine(x1 - 1, y1, x2 - 1, y2);
      pathLine(x1 + 1, y1, x2 + 1, y2);
    } else if (y1 === y2) {
      // Horizontal path — widen up and down
      pathLine(x1, y1 - 1, x2, y2 - 1);
      pathLine(x1, y1 + 1, x2, y2 + 1);
    } else {
      // L-shaped — widen both segments
      pathLine(x1, y1 - 1, x2, y1 - 1); pathLine(x1, y1 + 1, x2, y1 + 1); // horizontal segment
      pathLine(x2 - 1, y1, x2 - 1, y2); pathLine(x2 + 1, y1, x2 + 1, y2); // vertical segment
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SPAWN ISLAND (95-105, 95-105)
  // ═══════════════════════════════════════════════════════════════════════════
  tiles.createSpawn();
  tiles.defineArea('spawn', { name: 'Spawn Island', x1: 95, y1: 95, x2: 105, y2: 105, safe: true });
  npcs.spawnNpc('hans', 100, 100);
  npcs.spawnNpc('chicken', 104, 103);
  npcs.spawnNpc('chicken', 105, 104);
  npcs.spawnNpc('chicken', 103, 104);
  const spawnTrees = [[93, 95], [94, 93], [107, 95], [108, 97], [95, 107], [93, 106]];
  for (const [x, y] of spawnTrees) { tiles.setTile(x, y, T.TREE); objects.placeObject('tree', x, y); }
  const spawnRocks = [[106, 106], [107, 107], [108, 106]];
  for (const [x, y] of spawnRocks) { tiles.setTile(x, y, T.ROCK); objects.placeObject('copper_rock', x, y); }
  tiles.setTile(109, 106, T.ROCK); objects.placeObject('tin_rock', 109, 106);
  // Fishing spot is WATER (unwalkable), adjacent tile (97,104) is grass/sand so player can fish from there
  tiles.setTile(96, 104, T.WATER); objects.placeObject('fishing_spot', 96, 104);
  tiles.setTile(97, 104, T.SAND); // Ensure adjacent tile is walkable for fishing

  // ═══════════════════════════════════════════════════════════════════════════
  // TOWN (90-115, 80-95) — shops, bank, crafting stations
  // ═══════════════════════════════════════════════════════════════════════════
  fillArea(90, 80, 115, 95, T.PATH);
  tiles.defineArea('town', { name: 'Town', x1: 90, y1: 80, x2: 115, y2: 95, safe: true });
  fillArea(96, 86, 100, 90, T.FLOOR);   // General store
  fillArea(102, 86, 106, 90, T.FLOOR);  // Weapon shop
  fillArea(108, 86, 112, 90, T.FLOOR);  // Armour shop
  fillArea(96, 81, 100, 84, T.FLOOR);   // Bank
  fillArea(102, 81, 106, 84, T.FLOOR);  // Smithy
  fillArea(108, 81, 112, 84, T.FLOOR);  // Kitchen
  fillArea(90, 86, 94, 90, T.FLOOR);    // Herb shop
  objects.placeObject('bank_booth', 97, 82);
  objects.placeObject('bank_booth', 98, 82);
  objects.placeObject('bank_booth', 99, 82);
  objects.placeObject('range', 109, 82);
  objects.placeObject('range', 110, 82);
  objects.placeObject('furnace', 103, 82);
  objects.placeObject('furnace', 104, 82);
  objects.placeObject('anvil', 105, 82);
  objects.placeObject('anvil', 106, 82);
  objects.placeObject('spinning_wheel', 112, 88);
  npcs.spawnNpc('shopkeeper', 98, 88);
  npcs.spawnNpc('weapon_master', 104, 88);
  npcs.spawnNpc('armour_seller', 110, 88);
  npcs.spawnNpc('aubury', 114, 88);
  npcs.spawnNpc('slayer_master', 113, 82);
  npcs.spawnNpc('cook_npc', 109, 83);
  npcs.spawnNpc('banker', 98, 83);
  npcs.spawnNpc('tanner', 92, 88);
  npcs.spawnNpc('herbalist', 91, 87);
  npcs.spawnNpc('mining_instructor', 103, 83);
  npcs.spawnNpc('man', 95, 92);
  npcs.spawnNpc('man', 100, 93);
  npcs.spawnNpc('woman', 105, 93);
  npcs.spawnNpc('woman', 110, 92);
  npcs.spawnNpc('farmer', 92, 93);
  npcs.spawnNpc('warrior', 108, 85);
  npcs.spawnNpc('knight', 114, 85);
  npcs.spawnNpc('guard', 95, 85);
  npcs.spawnNpc('guard', 112, 85);
  // Altars in town
  objects.placeObject('altar', 114, 82);
  objects.placeObject('altar', 114, 83);

  // ═══════════════════════════════════════════════════════════════════════════
  // LUMBRIDGE FIELDS (75-90, 95-115) — cows, chickens, wheat
  // ═══════════════════════════════════════════════════════════════════════════
  fillArea(75, 95, 90, 115, T.GRASS);
  tiles.defineArea('fields', { name: 'Lumbridge Fields', x1: 75, y1: 95, x2: 90, y2: 115 });
  npcs.spawnNpc('cow', 82, 98); npcs.spawnNpc('cow', 84, 99); npcs.spawnNpc('cow', 86, 100);
  npcs.spawnNpc('cow', 83, 101); npcs.spawnNpc('cow', 85, 97);
  npcs.spawnNpc('chicken', 77, 97); npcs.spawnNpc('chicken', 78, 98);
  npcs.spawnNpc('chicken', 77, 99); npcs.spawnNpc('chicken', 79, 97);
  fillArea(76, 105, 85, 113, T.FLOWER);
  for (let x = 77; x <= 84; x += 2) for (let y = 106; y <= 112; y += 2) objects.placeObject('wheat', x, y);
  npcs.spawnNpc('farmer', 80, 110); npcs.spawnNpc('farmer', 84, 108);
  // Herb patches near the farm area
  objects.placeObject('herb_patch', 78, 102);
  objects.placeObject('herb_patch', 80, 102);
  objects.placeObject('herb_patch', 82, 102);

  // ═══════════════════════════════════════════════════════════════════════════
  // FOREST (70-90, 70-95) — normal, oak, willow, maple, yew trees
  // ═══════════════════════════════════════════════════════════════════════════
  fillArea(70, 70, 90, 94, T.DARK_GRASS);
  tiles.defineArea('forest', { name: 'Forest', x1: 70, y1: 70, x2: 90, y2: 94 });
  const forestTrees = [[72,72],[74,73],[76,74],[78,71],[73,76],[75,78],[71,80],[77,82],[79,84],[72,86],[74,88],[76,90],[71,92],[73,94]];
  for (const [x, y] of forestTrees) { tiles.setTile(x, y, T.TREE); objects.placeObject('tree', x, y); }
  const oakTrees = [[80,72],[82,74],[84,76],[81,78],[83,80],[85,82],[80,84],[82,86],[84,88],[86,90]];
  for (const [x, y] of oakTrees) { tiles.setTile(x, y, T.TREE); objects.placeObject('oak', x, y); }
  const willowTrees = [[88,72],[89,74],[88,76],[87,78],[86,80],[89,82],[88,84],[87,86],[89,88]];
  for (const [x, y] of willowTrees) { tiles.setTile(x, y, T.TREE); objects.placeObject('willow', x, y); }
  const mapleTrees = [[72,82],[74,84],[76,86]];
  for (const [x, y] of mapleTrees) { tiles.setTile(x, y, T.TREE); objects.placeObject('maple', x, y); }
  tiles.setTile(71, 75, T.TREE); objects.placeObject('yew', 71, 75);
  tiles.setTile(73, 90, T.TREE); objects.placeObject('yew', 73, 90);
  npcs.spawnNpc('giant_spider', 75, 75); npcs.spawnNpc('giant_spider', 82, 78); npcs.spawnNpc('giant_spider', 78, 85);

  // ═══════════════════════════════════════════════════════════════════════════
  // HUNTING GROUNDS (91-105, 70-80) — east of forest
  // ═══════════════════════════════════════════════════════════════════════════
  fillArea(91, 70, 105, 79, T.GRASS);
  tiles.defineArea('hunting_grounds', { name: 'Hunting Grounds', x1: 91, y1: 70, x2: 105, y2: 79 });
  // Connect hunting grounds to town/forest
  widePath(95, 80, 95, 79);
  widePath(91, 75, 90, 75);

  // ═══════════════════════════════════════════════════════════════════════════
  // MINING SITE (115-130, 100-115) — copper, tin, iron, coal, gold, mithril
  // ═══════════════════════════════════════════════════════════════════════════
  fillArea(115, 100, 130, 115, T.GRASS);
  tiles.defineArea('mines', { name: 'Mining Site', x1: 115, y1: 100, x2: 130, y2: 115 });
  for (const [x, y] of [[117,102],[118,103],[119,102]]) { tiles.setTile(x, y, T.ROCK); objects.placeObject('copper_rock', x, y); }
  for (const [x, y] of [[121,102],[122,103],[123,102]]) { tiles.setTile(x, y, T.ROCK); objects.placeObject('tin_rock', x, y); }
  for (const [x, y] of [[117,106],[118,107],[119,106],[120,107]]) { tiles.setTile(x, y, T.ROCK); objects.placeObject('iron_rock', x, y); }
  for (const [x, y] of [[123,106],[124,107],[125,106],[126,107],[127,106]]) { tiles.setTile(x, y, T.ROCK); objects.placeObject('coal_rock', x, y); }
  tiles.setTile(128, 110, T.ROCK); objects.placeObject('gold_rock', 128, 110);
  tiles.setTile(129, 111, T.ROCK); objects.placeObject('gold_rock', 129, 111);
  tiles.setTile(128, 113, T.ROCK); objects.placeObject('mithril_rock', 128, 113);
  tiles.setTile(129, 114, T.ROCK); objects.placeObject('mithril_rock', 129, 114);
  npcs.spawnNpc('scorpion', 125, 110); npcs.spawnNpc('scorpion', 120, 112);
  npcs.spawnNpc('mining_instructor', 116, 101);

  // ═══════════════════════════════════════════════════════════════════════════
  // FISHING DOCK (85-95, 115-125) — multiple fishing spots
  // ═══════════════════════════════════════════════════════════════════════════
  fillArea(85, 115, 95, 120, T.SAND);
  fillArea(85, 121, 95, 125, T.WATER);
  fillArea(88, 120, 92, 122, T.FLOOR); // dock walkway
  tiles.defineArea('dock', { name: 'Fishing Dock', x1: 85, y1: 115, x2: 95, y2: 125 });
  // Fishing spots are WATER tiles (unwalkable) — player fishes from adjacent walkable tiles
  tiles.setTile(88, 123, T.WATER); objects.placeObject('fishing_spot', 88, 123);
  tiles.setTile(89, 123, T.WATER); objects.placeObject('fishing_spot', 89, 123);
  tiles.setTile(90, 123, T.WATER); objects.placeObject('fishing_spot', 90, 123);
  tiles.setTile(91, 123, T.WATER); objects.placeObject('fly_fishing_spot', 91, 123);
  tiles.setTile(92, 123, T.WATER); objects.placeObject('fly_fishing_spot', 92, 123);
  tiles.setTile(88, 124, T.WATER); objects.placeObject('cage_fishing_spot', 88, 124);
  // Ensure dock walkway extends to be adjacent to all fishing spots
  fillArea(87, 120, 93, 122, T.FLOOR); // Extend dock walkway so all fishing spots are reachable
  // Add sand tiles beside the cage spot so it's reachable from the west
  tiles.setTile(87, 124, T.SAND);
  tiles.setTile(87, 123, T.SAND);
  npcs.spawnNpc('fishing_tutor', 90, 118);

  // ═══════════════════════════════════════════════════════════════════════════
  // GOBLIN VILLAGE (70-80, 60-70) — many goblins, guard
  // ═══════════════════════════════════════════════════════════════════════════
  fillArea(70, 60, 80, 70, T.GRASS);
  fillArea(73, 63, 77, 67, T.FLOOR);
  tiles.defineArea('goblin_village', { name: 'Goblin Village', x1: 70, y1: 60, x2: 80, y2: 70 });
  npcs.spawnNpc('goblin', 73, 63); npcs.spawnNpc('goblin', 75, 64); npcs.spawnNpc('goblin', 77, 65);
  npcs.spawnNpc('goblin', 74, 66); npcs.spawnNpc('goblin', 76, 67); npcs.spawnNpc('goblin', 72, 65);
  npcs.spawnNpc('goblin', 78, 63); npcs.spawnNpc('goblin', 71, 68);
  npcs.spawnNpc('guard', 75, 70);

  // ═══════════════════════════════════════════════════════════════════════════
  // GIANT PLAINS (120-135, 85-100) — hill giants, moss giants
  // ═══════════════════════════════════════════════════════════════════════════
  fillArea(120, 85, 135, 100, T.GRASS);
  tiles.defineArea('giant_plains', { name: 'Giant Plains', x1: 120, y1: 85, x2: 135, y2: 100 });
  npcs.spawnNpc('hill_giant', 124, 90); npcs.spawnNpc('hill_giant', 126, 92);
  npcs.spawnNpc('hill_giant', 128, 88); npcs.spawnNpc('hill_giant', 130, 94); npcs.spawnNpc('hill_giant', 132, 90);
  npcs.spawnNpc('moss_giant', 125, 96); npcs.spawnNpc('moss_giant', 130, 98); npcs.spawnNpc('moss_giant', 134, 95);

  // ═══════════════════════════════════════════════════════════════════════════
  // WILDERNESS BORDER (60-140, 40-55) — aggressive monsters, PvP
  // ═══════════════════════════════════════════════════════════════════════════
  fillArea(60, 55, 140, 58, T.DARK_GRASS);
  fillArea(60, 40, 140, 54, T.DARK_GRASS);
  tiles.defineArea('wilderness_border', { name: 'Wilderness Border', x1: 60, y1: 55, x2: 140, y2: 58 });
  tiles.defineArea('wilderness', { name: 'Wilderness', x1: 60, y1: 40, x2: 140, y2: 54, pvp: true });
  objects.placeObject('warning_sign', 80, 56);
  objects.placeObject('warning_sign', 100, 56);
  objects.placeObject('warning_sign', 120, 56);
  npcs.spawnNpc('skeleton', 80, 50); npcs.spawnNpc('skeleton', 85, 48); npcs.spawnNpc('skeleton', 90, 52);
  npcs.spawnNpc('zombie', 95, 45); npcs.spawnNpc('zombie', 100, 48); npcs.spawnNpc('zombie', 105, 50);
  npcs.spawnNpc('dark_wizard', 110, 46); npcs.spawnNpc('dark_wizard', 115, 50);
  npcs.spawnNpc('greater_demon', 100, 42); npcs.spawnNpc('lesser_demon', 120, 44);
  npcs.spawnNpc('green_dragon', 130, 45); npcs.spawnNpc('green_dragon', 135, 48);
  npcs.spawnNpc('poison_spider', 88, 48); npcs.spawnNpc('poison_spider', 92, 46);

  // ═══════════════════════════════════════════════════════════════════════════
  // PATH NETWORK — connect all areas with continuous walkable tiles
  // ═══════════════════════════════════════════════════════════════════════════
  // Widen spawn exits so circular island connects cleanly to rectangular areas
  // North exit: spawn (100, 95) to town top (100, 80)
  widePath(100, 95, 100, 80);
  // West exit: spawn (95, 100) to fields (75, 100)
  widePath(95, 100, 75, 100);
  // East exit: spawn (105, 100) to mining (115, 100)
  widePath(105, 100, 115, 100);
  // South exit: spawn (100, 105) to dock area (100, 115)
  widePath(100, 105, 100, 115);

  // Area-to-area connections
  pathLine(90, 100, 90, 95);        // Fields to Town SW corner
  pathLine(89, 100, 89, 95);        // widen
  pathLine(91, 100, 91, 95);        // widen
  pathLine(115, 100, 115, 115);     // Mining path south
  pathLine(90, 115, 100, 115);      // Dock to spawn path (east-west)
  pathLine(90, 116, 100, 116);      // widen dock connection
  widePath(90, 85, 80, 85);         // Town to Forest
  pathLine(80, 85, 80, 95);         // Forest path south to fields
  pathLine(79, 85, 79, 95);         // widen
  pathLine(81, 85, 81, 95);         // widen
  widePath(115, 90, 120, 90);       // Town to Giant Plains
  widePath(75, 70, 75, 60);         // Forest to Goblin Village
  pathLine(70, 70, 80, 70);         // Goblin Village east-west path
  pathLine(70, 69, 80, 69);         // widen
  widePath(100, 80, 100, 56);       // Town to Wilderness Border
  pathLine(80, 56, 120, 56);        // Wilderness border east-west
  pathLine(80, 57, 120, 57);        // widen wilderness border path
  pathLine(85, 110, 85, 115);       // Fields to Dock
  pathLine(86, 110, 86, 115);       // widen
  pathLine(120, 100, 120, 90);      // Mining to Giant Plains
  pathLine(121, 100, 121, 90);      // widen

  // Fill in any remaining gap tiles around spawn circle edges
  // Ensure spawn has walkable tiles at all cardinal exits
  for (let d = -2; d <= 2; d++) {
    tiles.setTile(100 + d, 95, T.PATH);   // North exit
    tiles.setTile(100 + d, 105, T.PATH);  // South exit
    tiles.setTile(95, 100 + d, T.PATH);   // West exit
    tiles.setTile(105, 100 + d, T.PATH);  // East exit
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // AGILITY COURSE — rooftop course in Town
  // ═══════════════════════════════════════════════════════════════════════════
  objects.placeObject('agility_wall', 95, 80);
  objects.placeObject('agility_rooftop', 95, 82);
  objects.placeObject('agility_gap', 98, 80);
  objects.placeObject('agility_net', 101, 80);
  objects.placeObject('agility_log', 104, 80);
  objects.placeObject('agility_ladder', 107, 80);

  // ═══════════════════════════════════════════════════════════════════════════
  // BOSS LAIRS
  // ═══════════════════════════════════════════════════════════════════════════

  // KBD Lair (140-155, 40-55) — deep wilderness
  fillArea(140, 40, 155, 55, T.DARK_GRASS);
  fillArea(144, 44, 151, 51, T.FLOOR);
  tiles.setTile(147, 47, T.LAVA); tiles.setTile(148, 47, T.LAVA);
  tiles.defineArea('kbd_lair', { name: 'King Black Dragon Lair', x1: 140, y1: 40, x2: 155, y2: 55, pvp: false });
  npcs.spawnNpc('king_black_dragon', 147, 48);
  widePath(135, 48, 140, 48); // connect from wilderness

  // Giant Mole Den (60-75, 120-135) — underground, layer -1
  fillArea(60, 120, 75, 135, T.FLOOR);
  tiles.defineArea('mole_den', { name: 'Giant Mole Den', x1: 60, y1: 120, x2: 75, y2: 135 });
  npcs.spawnNpc('giant_mole', 67, 127);

  // Barrows (140-155, 60-75) — east of wilderness
  fillArea(140, 60, 155, 75, T.DARK_GRASS);
  fillArea(144, 64, 151, 71, T.FLOOR);
  tiles.defineArea('barrows', { name: 'Barrows', x1: 140, y1: 60, x2: 155, y2: 75 });
  npcs.spawnNpc('dharok', 145, 65); npcs.spawnNpc('verac', 147, 65);
  npcs.spawnNpc('guthan', 149, 65); npcs.spawnNpc('ahrim', 145, 69);
  npcs.spawnNpc('karil', 147, 69); npcs.spawnNpc('torag', 149, 69);
  widePath(135, 60, 140, 60); // connect from giant plains area
  widePath(140, 55, 140, 60); // connect from KBD area

  // ═══════════════════════════════════════════════════════════════════════════
  // DUEL ARENA (115, 70-80) — east of hunting grounds
  // ═══════════════════════════════════════════════════════════════════════════
  fillArea(110, 70, 125, 80, T.SAND);
  fillArea(113, 73, 122, 77, T.FLOOR);
  tiles.defineArea('duel_arena', { name: 'Duel Arena', x1: 110, y1: 70, x2: 125, y2: 80, safe: true, duel: true });
  widePath(105, 75, 110, 75); // connect from hunting grounds

  // ═══════════════════════════════════════════════════════════════════════════
  // RUNECRAFTING ALTARS — scattered around the world
  // ═══════════════════════════════════════════════════════════════════════════
  // Air altar — near spawn
  fillArea(108, 95, 112, 99, T.GRASS);
  objects.placeObject('air_altar', 110, 97);
  tiles.defineArea('air_altar', { name: 'Air Altar', x1: 108, y1: 95, x2: 112, y2: 99 });

  // Water altar — near fishing dock
  objects.placeObject('water_altar', 93, 118);
  tiles.defineArea('water_altar', { name: 'Water Altar', x1: 92, y1: 117, x2: 94, y2: 119 });

  // Earth altar — near mining site
  objects.placeObject('earth_altar', 116, 108);
  tiles.defineArea('earth_altar', { name: 'Earth Altar', x1: 115, y1: 107, x2: 117, y2: 109 });

  // Fire altar — near giant plains
  objects.placeObject('fire_altar', 122, 98);
  tiles.defineArea('fire_altar', { name: 'Fire Altar', x1: 121, y1: 97, x2: 123, y2: 99 });

  // ═══════════════════════════════════════════════════════════════════════════
  // STAIRCASES — town ground floor to upper floor
  // ═══════════════════════════════════════════════════════════════════════════
  objects.placeObject('staircase', 96, 86); // In town general store area
  // Create upper floor (layer 1) floor tiles
  for (let x = 94; x <= 100; x++) for (let y = 84; y <= 88; y++) tiles.setTile(x, y, T.FLOOR, 1);
  objects.placeObject('staircase', 96, 86, 1); // Matching stairs on layer 1

  console.log(`[init] Default world created with ${npcs.npcs.size} NPCs, ${objects.objects.size} objects`);
}

// ── HTTP + WebSocket Server ───────────────────────────────────────────────────
const { setupHttpApi, queueEvent, addNpcPrompt: _addNpcPrompt } = require('./http-api');

// If Ollama is running, generate responses locally. Otherwise queue for external AI.
function addNpcPrompt(npcName, prompt, sendFn) {
  if (ollama.isEnabled()) {
    // Local AI — generate response directly
    ollama.generate(prompt).then(text => {
      if (text) {
        sendFn(text);
        console.log(`[ollama] ${npcName}: ${text.slice(0, 80)}`);
      } else {
        // Fallback to canned
        sendFn(ai.getFallback(npcName) || 'Hmm...');
      }
    }).catch(() => {
      sendFn(ai.getFallback(npcName) || 'Hmm...');
    });
  } else {
    // Queue for OpenClaw or external AI
    _addNpcPrompt(npcName, prompt, sendFn);
  }
}
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('ScapeAPI+AI v0.1.0 — WebSocket or HTTP API');
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  sendText(ws, 'Welcome to Scape! Type `login [name]` to start.');

  ws.on('message', (data) => {
    let input = data.toString().trim();

    // /? suffix — AI auto-executes the intent
    if (input.endsWith('/?') && input.length > 2) {
      const intent = input.slice(0, -2).trim();
      if (intent && ollama.isEnabled()) {
        const p = players.get(ws);
        if (p) {
          sendText(ws, `(figuring out: "${intent}"...)`);
          const area = tiles.getArea(p.x, p.y, p.layer);
          const autoPrompt = `You are a command translator for a text MMORPG called Scape.
The player wants to: "${intent}"
They are at ${area?.name || `(${p.x},${p.y})`}, combat level ${combatLevel(p)}.

Available commands: look, n, s, e, w, ne, nw, se, sw, goto [x] [y], attack [npc], chop, mine, fish, cook [item], smelt [bar], smith [item], craft [item], fletch [item], clean [herb], mix [potion], light [logs], eat [item], drink [potion], equip [item], unequip [slot], inv, bank, deposit [item], withdraw [item], shop, buy [slot], sell [item], talk [npc], sayto [npc] [message], r [message], pickpocket [npc], bury [bones], pray, cast [spell], skills, map, nearby, status, help, home, goto [x] [y], flee, stop

Respond with ONLY the exact game command to execute. Nothing else. No explanation. Just the command.`;
          ollama.generate(autoPrompt).then(cmd => {
            if (cmd) {
              cmd = cmd.replace(/^[`"']|[`"']$/g, '').trim().split('\n')[0];
              sendText(ws, `> ${cmd}`);
              const result = commands.execute(p, cmd);
              if (result && !result.unknown) sendText(ws, result);
              else if (result && result.unknown) sendText(ws, `Couldn't figure that out. Try \`help\`.`);
            }
          }).catch(() => sendText(ws, 'AI unavailable.'));
        }
        return;
      }
    }

    // If in replay mode, any input advances (Enter/space), "q" stops
    if (activeReplays.has(ws)) {
      if (input === 'q' || input === 'quit' || input === 'stopreplay') {
        activeReplays.delete(ws);
        sendText(ws, 'Replay stopped.');
      } else {
        replayNext(ws);
      }
      return;
    }

    if (!input) return;

    let p = players.get(ws);

    // Must login first
    if (!p) {
      const parsed = commands.parse(input);
      if (!parsed || parsed.verb !== 'login') {
        sendText(ws, 'Please login first: login [name]');
        return;
      }
      const name = parsed.args[0] || `Player${Math.floor(Math.random() * 9999)}`;
      if (playersByName.has(name.toLowerCase())) {
        sendText(ws, `Name "${name}" is taken. Try another.`);
        return;
      }
      p = createPlayer(players.size + 1, name);

      // Load saved player data
      const saved = persistence.load(`players/${name.toLowerCase()}.json`);
      let isNewPlayer = true;
      if (saved) {
        isNewPlayer = false;
        Object.assign(p, saved);
        p.connected = true;
        p.path = [];
        p.busy = false;
        p.busyAction = null;
        p.combatTarget = null;
        p.pvpTarget = null;
        // Restore Sets from arrays after JSON load
        if (Array.isArray(p.activePrayers)) p.activePrayers = new Set(p.activePrayers);
        else if (!(p.activePrayers instanceof Set)) p.activePrayers = new Set();
        // Restore collectionLog arrays
        if (p.collectionLog) {
          for (const key of Object.keys(p.collectionLog)) {
            if (p.collectionLog[key] instanceof Set) {
              // Already a set somehow, convert back
            } else if (!Array.isArray(p.collectionLog[key])) {
              p.collectionLog[key] = [];
            }
          }
        }
        // Restore agilityLap Set
        if (p.agilityLap && Array.isArray(p.agilityLap.obstaclesDone)) {
          p.agilityLap.obstaclesDone = new Set(p.agilityLap.obstaclesDone);
        }
      }

      // Initialize new feature fields if missing (for existing saves)
      if (!p.killCounts) p.killCounts = {};
      if (!p.achievementProgress) p.achievementProgress = {};
      if (!p.achievementsComplete) p.achievementsComplete = {};
      if (!p.collectionLog) p.collectionLog = {};
      if (!p.lootTracker) p.lootTracker = {};
      p.lootTrackerTotal = 0; // Reset session loot tracker on login
      if (p.deathCount === undefined) p.deathCount = 0;
      if (p.tutorialStep === undefined) p.tutorialStep = 0;
      if (p.tutorialComplete === undefined) p.tutorialComplete = false;
      if (!p.friends) p.friends = [];
      // Initialize new feature fields
      if (!p.house) p.house = [];
      if (!p.bossKills) p.bossKills = {};
      if (!p.unlockedTracks) p.unlockedTracks = [];
      if (!p.diaryProgress) p.diaryProgress = {};
      if (!p.diaryComplete) p.diaryComplete = {};
      if (!p.diaryRewards) p.diaryRewards = {};
      if (p.duelWins === undefined) p.duelWins = 0;
      if (p.duelLosses === undefined) p.duelLosses = 0;
      if (p.bhKills === undefined) p.bhKills = 0;
      if (p.bhDeaths === undefined) p.bhDeaths = 0;
      // Initialize random event timer
      p.nextRandomEvent = tick.getTick() + 500 + Math.floor(Math.random() * 500);
      p.pendingEvent = null;

      p.admin = true; // Everyone is admin for now (build mode)
      p.loginTick = tick.getTick();
      players.set(ws, p);
      playersByName.set(name.toLowerCase(), p);
      console.log(`[join] ${name} connected`);
      startSessionLog(ws, name);
      logEntry(ws, 'in', `login ${name}`);
      const modeIcon = p.accountMode === 'ironman' ? ' [Ironman]' : p.accountMode === 'hcim' ? ' [Hardcore Ironman]' : p.accountMode === 'uim' ? ' [Ultimate Ironman]' : '';
      sendText(ws, `Logged in as ${name}${modeIcon}. Combat level: ${combatLevel(p)}. Type \`help\` for commands.\nYou are at (${p.x}, ${p.y}).`);
      if (!p.modeSet) sendText(ws, 'Tip: Set your account mode with `mode ironman/hcim/uim` (one-time choice).');
      // Tutorial for new players
      if (!p.tutorialComplete && p.tutorialStep === 0) {
        sendText(ws, '── Tutorial ──\nWelcome! Type `look` to see your surroundings. (Type `tutorial skip` to skip the tutorial.)');
      }
      sendText(ws, commands.execute(p, 'look'));
      events.emit('player_login', { player: p, ws });

      // ── Daily challenge generation (feature 7) ──
      const now = Date.now();
      if (!p.dailyChallenge || (now - (p.dailyChallenge.generatedAt || 0)) > 86400000) {
        // Generate a new daily challenge
        const DAILY_TEMPLATES = [
          { type: 'kill', targetName: 'goblin', goal: 10, reward: 500, rewardType: 'coins' },
          { type: 'kill', targetName: 'cow', goal: 8, reward: 300, rewardType: 'coins' },
          { type: 'kill', targetName: 'chicken', goal: 15, reward: 200, rewardType: 'coins' },
          { type: 'cook', targetName: 'shrimps', target: 230, goal: 20, reward: 1000, rewardType: 'xp', rewardSkill: 'cooking' },
          { type: 'cook', targetName: 'trout', target: 233, goal: 10, reward: 2000, rewardType: 'xp', rewardSkill: 'cooking' },
          { type: 'mine', targetName: 'copper ore', target: 210, goal: 15, reward: 800, rewardType: 'xp', rewardSkill: 'mining' },
          { type: 'mine', targetName: 'iron ore', target: 212, goal: 10, reward: 1500, rewardType: 'xp', rewardSkill: 'mining' },
          { type: 'chop', targetName: 'logs', target: 200, goal: 30, reward: 1000, rewardType: 'xp', rewardSkill: 'woodcutting' },
          { type: 'chop', targetName: 'oak logs', target: 201, goal: 15, reward: 1500, rewardType: 'xp', rewardSkill: 'woodcutting' },
          { type: 'fish', targetName: 'raw shrimps', target: 220, goal: 20, reward: 800, rewardType: 'xp', rewardSkill: 'fishing' },
          { type: 'kill', targetName: 'guard', goal: 5, reward: 1000, rewardType: 'coins' },
          { type: 'kill', targetName: 'hill giant', goal: 5, reward: 2000, rewardType: 'coins' },
        ];
        const template = DAILY_TEMPLATES[Math.floor(Math.random() * DAILY_TEMPLATES.length)];
        p.dailyChallenge = { ...template, progress: 0, generatedAt: now };
        sendText(ws, `Daily Challenge: ${template.type === 'kill' ? 'Kill' : template.type === 'cook' ? 'Cook' : template.type === 'mine' ? 'Mine' : template.type === 'chop' ? 'Chop' : template.type} ${template.goal} ${template.targetName}. Reward: ${template.rewardType === 'coins' ? template.reward + ' coins' : template.reward + ' ' + (template.rewardSkill || '') + ' XP'}`);
      }
      return;
    }

    // Execute command
    logEntry(ws, 'in', input);
    // Check stun
    if (p.stunTicks > 0) {
      const parsed = commands.parse(input);
      // Allow non-action commands while stunned
      const safeCommands = ['help', 'skills', 'stats', 'inventory', 'inv', 'i', 'equipment', 'gear', 'hp', 'pos', 'whoami', 'look', 'l'];
      if (parsed && !safeCommands.includes(parsed.verb)) {
        sendText(ws, `You are stunned! (${p.stunTicks} ticks remaining)`);
        return;
      }
    }
    const result = commands.execute(p, input);
    if (result && result.unknown) {
      sendText(ws, `Unknown command. Type \`help\` for commands, or \`? [question]\` to ask the guide.`);
    } else if (result) {
      sendText(ws, result);
    }

    // ── Tutorial step tracking ──
    if (!p.tutorialComplete && p.tutorialStep < 10) {
      const parsed = commands.parse(input);
      if (parsed) {
        const verb = parsed.verb;
        let advanced = false;
        if (p.tutorialStep === 0 && (verb === 'look' || verb === 'l')) advanced = true;
        else if (p.tutorialStep === 1 && verb === 'n') advanced = true;
        else if (p.tutorialStep === 2 && (verb === 'skills' || verb === 'stats')) advanced = true;
        else if (p.tutorialStep === 3 && (verb === 'attack' || verb === 'fight' || verb === 'kill')) advanced = true;
        else if (p.tutorialStep === 4 && (verb === 'inventory' || verb === 'inv' || verb === 'i')) advanced = true;
        else if (p.tutorialStep === 5 && verb === 'chop') advanced = true;
        else if (p.tutorialStep === 6 && verb === 'mine') advanced = true;
        else if (p.tutorialStep === 7 && verb === 'nearby') advanced = true;
        else if (p.tutorialStep === 8 && (verb === 'goto' || verb === 'shop')) advanced = true;
        if (advanced) {
          p.tutorialStep++;
          // Award small XP reward per step
          const tutorialXpRewards = [
            { skill: 'hitpoints', amount: 25 },   // step 0->1: look
            { skill: 'agility', amount: 25 },      // step 1->2: walk
            null,                                   // step 2->3: skills (no xp)
            { skill: 'attack', amount: 50 },        // step 3->4: attack
            null,                                   // step 4->5: inv (no xp)
            { skill: 'woodcutting', amount: 50 },   // step 5->6: chop
            { skill: 'mining', amount: 50 },        // step 6->7: mine
            null,                                   // step 7->8: nearby (no xp)
            { skill: 'hitpoints', amount: 100 },    // step 8->9: goto/shop
          ];
          const reward = tutorialXpRewards[p.tutorialStep - 1];
          let rewardMsg = '';
          if (reward) {
            addXp(p, reward.skill, reward.amount);
            rewardMsg = ` (+${reward.amount} ${reward.skill} XP)`;
          }
          const tutorialMessages = [
            null, // step 0 (handled on login)
            "Great! Now type `n` to walk north.",
            "You moved! Type `skills` to see your stats.",
            "Now find a chicken and type `attack chicken`.",
            "Nice! Type `inv` to check your inventory for loot.",
            "Try `chop tree` near a tree to gather logs.",
            "Now try `mine copper rock` near some rocks.",
            "Use `nearby` to see what's around you.",
            "Head to town with `goto 100 90` and visit the shops with `shop shopkeeper`.",
            "Tutorial complete! Type `help` anytime. Explore the world!",
          ];
          if (p.tutorialStep >= 9) {
            p.tutorialStep = 10;
            p.tutorialComplete = true;
            addXp(p, 'hitpoints', 200);
            sendText(ws, `Tutorial complete! Type \`help\` anytime. Explore the world! (+200 hitpoints XP)`);
          } else {
            sendText(ws, `[Tutorial]${rewardMsg} ${tutorialMessages[p.tutorialStep]}`);
          }
        }
      }
    }
  });

  ws.on('close', () => {
    const p = players.get(ws);
    if (p) {
      endSessionLog(ws);
      // Save player
      const saveData = { ...p };
      delete saveData.path;
      delete saveData.connected;
      // Session-only fields — don't persist loot tracker or pending events
      delete saveData.lootTracker;
      delete saveData.lootTrackerTotal;
      delete saveData.pendingEvent;
      delete saveData._bankOpen;
      delete saveData._currentShop;
      delete saveData._pendingGather;
      delete saveData._lastWildyCheck;
      delete saveData.pvpTarget;
      delete saveData.combatTarget;
      delete saveData.busy;
      delete saveData.busyAction;
      // Convert Sets to arrays for JSON serialization
      if (saveData.activePrayers instanceof Set) saveData.activePrayers = [...saveData.activePrayers];
      // Convert collectionLog arrays (ensure they're plain arrays)
      if (saveData.collectionLog) {
        for (const key of Object.keys(saveData.collectionLog)) {
          if (saveData.collectionLog[key] instanceof Set) {
            saveData.collectionLog[key] = [...saveData.collectionLog[key]];
          }
        }
      }
      // Convert agilityLap Set
      if (saveData.agilityLap && saveData.agilityLap.obstaclesDone instanceof Set) {
        saveData.agilityLap.obstaclesDone = [...saveData.agilityLap.obstaclesDone];
      }
      persistence.save(`players/${p.name.toLowerCase()}.json`, saveData);
      playersByName.delete(p.name.toLowerCase());
      players.delete(ws);
      console.log(`[leave] ${p.name} disconnected`);
      events.emit('player_logout', { player: p });
    }
  });
});

// ── Init ──────────────────────────────────────────────────────────────────────
tiles.loadChunks();
tiles.loadAreas();
walls.loadWalls();
npcs.loadNpcSpawns();
objects.loadObjects();

// If world is empty or objects didn't load, recreate default content
if (tiles.tileAt(SPAWN_X, SPAWN_Y) === tiles.T.EMPTY || objects.objects.size === 0) {
  console.log('[init] Creating default world...');
  createDefaultContent();
}

// Register tick handlers
tick.onTick('movement', movementTick);
tick.onTick('combat', combatTick);
tick.onTick('world', worldTick);
tick.onTick('shops', (t) => shopSystem.restockTick(t));

// Register all Tier 6-18 commands
cmdCtx = {
  players, playersByName, groundItems, tick, events, persistence,
  tiles, walls, npcs, objects, pathfinding, combat, actions,
  getLevel, getXp, addXp, totalLevel, combatLevel,
  getBoostedLevel, calcWeight,
  invAdd, invRemove, invCount, invFreeSlots,
  send, sendText, broadcast, findPlayer, nextItemId,
  getLevelUpMessage, clans,
};
registerAllCommands(cmdCtx);

// Persistence
persistence.onSave('chunks', () => tiles.saveChunks());
persistence.onSave('areas', () => tiles.saveAreas());
persistence.onSave('walls', () => walls.saveWalls());
persistence.onSave('npcs', () => npcs.saveNpcSpawns());
persistence.onSave('objects', () => objects.saveObjects());
persistence.onSave('ge', () => ge.saveGE());
persistence.onSave('clans', () => saveClanData());
ge.loadGE();
persistence.startAutoSave();

// HTTP API for Claude Code / external tools
setupHttpApi(server, { players, playersByName, commands, sendText, createPlayer, combatLevel, getLevel, totalLevel, tick, tiles, npcs, invFreeSlots });

// Start
tick.startTicking();
ollama.checkOllama(); // Check if Ollama is running for local AI
server.listen(PORT, () => {
  console.log(`[server] ScapeAPI+AI running on ws://localhost:${PORT}`);
  console.log(`[server] WebSocket: wscat -c ws://localhost:${PORT}`);
  console.log(`[server] HTTP API: curl -X POST http://localhost:${PORT}/cmd -d '{"player":"Name","command":"look"}'`);
  console.log(`[server] Claude Code: /scape look`);
});

// Graceful shutdown
process.on('SIGINT', () => { persistence.saveAll(); tick.stopTicking(); process.exit(); });
process.on('SIGTERM', () => { persistence.saveAll(); tick.stopTicking(); process.exit(); });
