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

// Auth
const auth = require('./auth');

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

// ── Smart interaction grid — auto-detect surroundings ─────────────────────────
// 1=NW 2=N 3=NE 4=W 5=E 6=SW 7=S 8=SE
// Shows best action for each adjacent tile. Examine only if nothing else.
const GRID_DIRS = [
  { key: '1', dx: -1, dy: -1, label: 'NW' },
  { key: '2', dx: 0, dy: -1, label: 'N' },
  { key: '3', dx: 1, dy: -1, label: 'NE' },
  { key: '4', dx: -1, dy: 0, label: 'W' },
  { key: '5', dx: 1, dy: 0, label: 'E' },
  { key: '6', dx: -1, dy: 1, label: 'SW' },
  { key: '7', dx: 0, dy: 1, label: 'S' },
  { key: '8', dx: 1, dy: 1, label: 'SE' },
];

function getBestAction(x, y, layer, p) {
  // Ground items first
  const item = groundItems.find(i => i.x === x && i.y === y && i.layer === layer);
  if (item) return { cmd: `pickup ${item.name.toLowerCase()}`, desc: `pickup ${item.name}` };

  // NPCs
  const npc = npcs.getNpcsNear(x, y, 0, layer)[0];
  if (npc && !npc.dead) {
    const npcDef = npcs.npcDefs.get(npc.defId);
    if (npc.combat > 0) return { cmd: `attack ${npc.name.toLowerCase()}`, desc: `attack ${npc.name}` };
    if (npcDef?.thieving) return { cmd: `pickpocket ${npc.name.toLowerCase()}`, desc: `pickpocket ${npc.name}` };
    if (npc.dialogue) return { cmd: `talk ${npc.name.toLowerCase()}`, desc: `talk ${npc.name}` };
    return { cmd: `examine ${npc.name.toLowerCase()}`, desc: `examine ${npc.name}` };
  }

  // Objects
  const obj = objects.getObjectAt(x, y, layer);
  if (obj && !obj.depleted) {
    if (obj.skill === 'woodcutting') return { cmd: `chop ${obj.name.toLowerCase()}`, desc: `chop ${obj.name}` };
    if (obj.skill === 'mining') return { cmd: `mine ${obj.name.toLowerCase()}`, desc: `mine ${obj.name}` };
    if (obj.skill === 'fishing') return { cmd: `fish ${obj.name.toLowerCase()}`, desc: `fish ${obj.name}` };
    if (obj.name.toLowerCase().includes('bank')) return { cmd: 'bank', desc: 'bank' };
    if (obj.name.toLowerCase().includes('range') || obj.name.toLowerCase().includes('cooking')) return { cmd: 'cook', desc: 'cook' };
    if (obj.name.toLowerCase().includes('furnace')) return { cmd: 'smelt', desc: 'smelt' };
    if (obj.name.toLowerCase().includes('anvil')) return { cmd: 'smith', desc: 'smith' };
    if (obj.name.toLowerCase().includes('altar')) return { cmd: 'pray at altar', desc: 'pray' };
    if (obj.name.toLowerCase().includes('stair')) return { cmd: 'climbup', desc: 'climb' };
    if (obj.product) return { cmd: `pick ${obj.name.toLowerCase()}`, desc: `pick ${obj.name}` };
    return { cmd: `examine ${obj.name.toLowerCase()}`, desc: `examine ${obj.name}` };
  }

  return null;
}

function showSurroundings(ws, p) {
  const actions = [];
  for (const dir of GRID_DIRS) {
    const tx = p.x + dir.dx, ty = p.y + dir.dy;
    const action = getBestAction(tx, ty, p.layer, p);
    if (action) actions.push({ ...dir, ...action });
  }
  // Also check current tile for ground items
  const here = groundItems.filter(i => i.x === p.x && i.y === p.y && i.layer === p.layer);
  if (here.length) {
    sendText(ws, `On ground: ${here.map(i => `${i.name} x${i.count}`).join(', ')}. \`pickup [name]\``);
  }
  if (actions.length) {
    p._gridActions = {};
    let msg = '';
    for (const a of actions) {
      msg += `[${a.key}] ${a.desc}\n`;
      p._gridActions[a.key] = a.cmd;
    }
    sendText(ws, msg.trimEnd());
  }
}

// ── Movement Tick ─────────────────────────────────────────────────────────────
function movementTick(currentTick) {
  for (const [ws, p] of players) {
    if (p.path.length === 0) continue;

    // Walk 1 tile
    const step = p.path.shift();
    p.x = step.x;
    p.y = step.y;
    if (p._bankOpen) p._bankOpen = false;

    // If running and path still has steps, take a second step
    if (p.running && p.path.length > 0 && p.runEnergy > 0) {
      const step2 = p.path.shift();
      p.x = step2.x;
      p.y = step2.y;
      // Recalculate weight to ensure accuracy (feature 4)
      calcWeight(p, (id) => items.get(id));
      // Drain energy: OSRS formula — floor((67 + weight) * (300 - agility) / 300)
      const agilityLvl = getLevel(p, 'agility');
      const drain = Math.floor((67 + Math.max(0, p.weight)) * (300 - agilityLvl) / 300);
      p.runEnergy = Math.max(0, p.runEnergy - drain);
      if (p.runEnergy <= 0) {
        p.running = false;
        sendText(ws, "You're out of run energy.");
      }
    }

    if (actions.isActive(p)) actions.cancel(p);
    events.emit('player_move', { player: p, ws });

    // Show map on each pathfinding step
    if (cmdCtx.generateMap) {
      sendText(ws, `(${p.x}, ${p.y})${p.path.length ? ` — ${p.path.length} steps left` : ''}\n${cmdCtx.generateMap(p)}`);
    }
    // Auto-show items/objects on current tile
    showSurroundings(ws, p);

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

    // Check wilderness entry (skip if in instance)
    if (p.y <= 55 && !p.instance) {
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
      const regen = Math.floor(agilityLevel / 6) + 8;
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

    // Check range AND line of sight
    const dist = Math.max(Math.abs(p.x - npc.x), Math.abs(p.y - npc.y));
    const los = require('./world/los');
    const hasLoS = los.playerHasLoS(p.x, p.y, npc.x, npc.y, npc.size || 1, p.layer, requiredRange);

    if (dist > requiredRange || !hasLoS) {
      // Walk to get in range AND line of sight (OSRS auto-walks on attack click)
      let blocked = null;
      if (p.instance) {
        try {
          const ents = require('./world/entities').getInInstance(p.instance);
          blocked = new Set();
          for (const e of ents) {
            if (!e.blocksMovement || e.dead) continue;
            const sz = e.size || 1;
            for (let oy = 0; oy < sz; oy++) for (let ox = 0; ox < sz; ox++) blocked.add(`${e.x+ox},${e.y+oy}`);
          }
        } catch {}
      }
      if (isRanged) {
        const path = pathfinding.findPath(p.x, p.y, npc.x, npc.y, p.layer, blocked);
        if (path && path.length > requiredRange) p.path = path.slice(0, -(requiredRange));
        else if (path && path.length > 0) p.path = path.slice(0, -1);
      } else {
        const path = pathfinding.findPath(p.x, p.y, npc.x, npc.y, p.layer, blocked);
        if (path && path.length > 1) p.path = path.slice(0, -1);
      }
      continue;
    }

    // NPC retaliates independently — but must be adjacent to hit
    const npcDist = Math.max(Math.abs(p.x - npc.x), Math.abs(p.y - npc.y));
    if (!npc.dead && npc.combat > 0 && npcDist <= 1) {
      // Initialize attack timer on first combat
      if (npc.nextAttackTick === Infinity) npc.nextAttackTick = currentTick + npc.attackSpeed;
      if (currentTick < npc.nextAttackTick) { /* waiting */ }
      else {
      npc.target = p.id;
      npc.nextAttackTick = currentTick + npc.attackSpeed;
      // OSRS-accurate NPC→player accuracy roll
      const npcAtkLevel = npc.stats?.attack || 1;
      const npcAtkBonus = npc.stats?.atk_bonus || 0;
      const npcAtkRoll = (npcAtkLevel + 9) * (npcAtkBonus + 64);
      const npcStyle = npc.attackStyle || 'slash';
      const playerDefRoll = combat.effectiveLevel(p, 'defence') * (combat.getEquipBonus(p.equipment, `def_${npcStyle}`) + 64);
      const npcHitChance = combat.accuracy(npcAtkRoll, playerDefRoll);
      const npcHit = Math.random() < npcHitChance;
      let npcDmg = npcHit ? Math.floor(Math.random() * (npc.maxHit + 1)) : 0;
      // Protection prayers fully block NPC damage (PvM)
      if (npcDmg > 0 && p.activePrayers && p.activePrayers.size > 0) {
        const prayerMap = { melee: 'protect_from_melee', ranged: 'protect_from_missiles', magic: 'protect_from_magic' };
        const needed = prayerMap[npc.attackStyle || 'melee'];
        if (needed && p.activePrayers.has(needed)) {
          npcDmg = 0;
        }
      }
      p.hp = Math.max(0, p.hp - npcDmg);
      if (npcDmg > 0) sendText(ws, `The ${npc.name} hits you for ${npcDmg} damage. HP: ${p.hp}/${p.maxHp}`);
      if (p.hp <= 0) {
        sendText(ws, 'Oh dear, you are dead!');
        p.hp = p.maxHp; p.x = SPAWN_X; p.y = SPAWN_Y; p.layer = 0;
        p.combatTarget = null; p.busy = false; p.path = [];
        events.emit('player_death', { player: p, ws, killer: npc });
        continue;
      }
      } // end else (attack ready)
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
    const hpBefore = npc.hp;
    npc.hp = Math.max(0, npc.hp - result.damage);

    let msg = result.hit
      ? `You hit the ${npc.name} for ${result.damage} damage.`
      : `You miss the ${npc.name}.`;

    if (npc.hp <= 0) {
      npc.dead = true;
      npc.respawnAt = currentTick + npc.respawnTicks;
      p.combatTarget = null;
      p.busy = false;
      msg += ` The ${npc.name} is dead! (had ${hpBefore} HP)`;

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
      // Auto-retaliate: path to the NPC so we can fight back
      if (p.autoRetaliate) {
        const adjPath = pathfinding.findAdjacentPath(p.x, p.y, npc.x, npc.y, p.layer);
        if (adjPath && adjPath.length > 0) p.path = adjPath;
      }
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
    // If in Inferno instance, show Inferno-specific look
    const instancesModule = require('./engine/instances');
    const inst = instancesModule.getByPlayer(p.id);
    if (inst && inst.type === 'inferno') {
      const infernoModule = require('./content/inferno/inferno');
      return infernoModule.getInfernoLook(inst, p);
    }
    if (inst && inst.type === 'crystal_wyrm') {
      const alive = npcs.getNpcsInInstance(inst.id);
      let msg = '=== Crystal Heart Chamber ===\n';
      msg += 'A vast cavern of living crystal. The air thrums with energy.\n\n';
      for (const npc of alive) {
        const dist = Math.max(Math.abs(npc.x - p.x), Math.abs(npc.y - p.y));
        const phase = npc.customState?.phase ? ` [Phase ${npc.customState.phase}]` : '';
        msg += `  ${npc.name}${phase} — HP: ${npc.hp}/${npc.maxHp} — ${dist} tiles away\n`;
      }
      if (!alive.length) msg += '  The chamber is quiet.\n';
      msg += `\nYou: HP ${p.hp}/${p.maxHp} | Prayer ${p.pp}/${p.maxPp}`;
      return msg;
    }

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
      // Block walking into entities (pillars)
      if (p.instance) {
        try {
          const ents = require('./world/entities').getInInstance(p.instance);
          for (const e of ents) {
            if (!e.blocksMovement || e.dead) continue;
            const sz = e.size || 1;
            if (nx >= e.x && nx < e.x + sz && ny >= e.y && ny < e.y + sz) return `Blocked — ${e.name}.`;
          }
        } catch {}
      }
      p.x = nx; p.y = ny;
      if (p._bankOpen) p._bankOpen = false;
      // Drain run energy when running via direction commands
      if (p.running && p.runEnergy > 0) {
        calcWeight(p, (id) => items.get(id));
        const agilityLvl = getLevel(p, 'agility');
        const drn = Math.floor((67 + Math.max(0, p.weight)) * (300 - agilityLvl) / 300);
        p.runEnergy = Math.max(0, p.runEnergy - drn);
        if (p.runEnergy <= 0) {
          p.running = false;
          let ws; for (const [w, pl] of players) { if (pl === p) { ws = w; break; } }
          if (ws) sendText(ws, "You're out of run energy.");
        }
      }
      if (actions.isActive(p)) actions.cancel(p);
      events.emit('player_move', { player: p });
      let msg = `(${p.x}, ${p.y})`;
      if (cmdCtx.generateMap) msg += '\n' + cmdCtx.generateMap(p);
      // Show items/objects on tile
      let playerWs; for (const [w, pl] of players) { if (pl === p) { playerWs = w; break; } }
      if (playerWs) setTimeout(() => showSurroundings(playerWs, p), 0);
      return msg;
    }
  });
}

commands.register('goto', { help: 'Walk to coordinates: goto [x] [y]', aliases: ['walk', 'moveto'], category: 'Navigation',
  fn: (p, args) => {
    const x = parseInt(args[0]), y = parseInt(args[1]);
    if (isNaN(x) || isNaN(y)) return 'Usage: goto [x] [y]';
    // Build blocked tile set from entities (pillars)
    let blocked = null;
    if (p.instance) {
      try {
        const ents = require('./world/entities').getInInstance(p.instance);
        blocked = new Set();
        for (const e of ents) {
          if (!e.blocksMovement || e.dead) continue;
          const sz = e.size || 1;
          for (let oy = 0; oy < sz; oy++) for (let ox = 0; ox < sz; ox++) blocked.add(`${e.x+ox},${e.y+oy}`);
        }
      } catch {}
    }
    const path = pathfinding.findPath(p.x, p.y, x, y, p.layer, blocked);
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

    const npc = npcs.findNpcByName(name, p.x, p.y, 15, p.layer, p.instance || undefined);
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
    // Merge item def stats onto the item — stackable ammo equips the full stack
    const isStackableAmmo = equipSlot === 'ammo' && def?.stackable;
    const equipCount = isStackableAmmo ? item.count : 1;
    const equipItem = { id: item.id, name: item.name, count: equipCount, equipSlot, stats: def?.stats || item.stats || {}, speed: def?.speed || item.speed };
    p.inventory[slot] = (!isStackableAmmo && item.count > 1) ? { ...item, count: item.count - 1 } : null;
    const old = p.equipment[equipSlot];
    p.equipment[equipSlot] = equipItem;
    calcWeight(p, (id) => items.get(id));
    if (old) { invAdd(p, old.id, old.name, old.count); calcWeight(p, (id) => items.get(id)); return `Equipped ${item.name} x${equipCount} (replaced ${old.name} x${old.count}).`; }
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

    p._lastTalkNpc = npc.defId;

    // Handle structured dialogue types (shop, quest, slayer)
    const dlg = typeof npc.dialogue === 'object' ? npc.dialogue : null;
    if (dlg && dlg.type === 'shop' && dlg.shopId) {
      const shop = shopData.getShop(dlg.shopId);
      if (shop) {
        p._openShop = dlg.shopId;
        const lines = [`${npc.name}: "Take a look at my wares!"\n=== ${shop.name} ===`];
        shop.stock.forEach((s, i) => {
          lines.push(`  ${i + 1}. ${s.name} — ${shopData.buyPrice(shop, i)} gp (stock: ${s.current})`);
        });
        lines.push(`\nType \`buy [item]\` or \`sell [item]\`.`);
        return lines.join('\n');
      }
    }
    if (dlg && dlg.type === 'quest' && dlg.questId) {
      const questData = require('./data/quests');
      const quest = questData.getQuest(dlg.questId);
      if (quest) {
        const status = questData.getStatus(p, dlg.questId);
        if (status.complete) {
          return `${npc.name}: "Thank you for your help, ${p.name}!"`;
        }
        if (!status.started) {
          return `${npc.name}: "${quest.description}"\n\nType \`quest start ${dlg.questId}\` to begin.`;
        }
        const step = quest.steps[status.step];
        return `${npc.name}: "${step?.text || 'Continue your task.'}"`;
      }
    }

    // Canned greeting only — no AI call. Use `r` or `sayto` for AI conversation.
    const fallback = ai.getFallback(npc.defId);
    return `${npc.name}: "${(typeof npc.dialogue === 'string' ? npc.dialogue : null) || fallback}"\n(Type \`r [message]\` to respond)`;
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

    // Check for builder persona first, fall back to hardcoded profiles
    let playerWs; for (const [ws, pl] of players) { if (pl === p) { playerWs = ws; break; } }
    getBuilderPersona(npc.defId).then(persona => {
      let prompt;
      if (persona) {
        prompt = persona + `\n\n${p.name} (combat level ${combatLevel(p)}) at ${area?.name || `(${p.x},${p.y})`} says: "${message}"\nRespond in character. Keep it short (1-2 sentences).`;
      } else {
        prompt = ai.buildSimplePrompt(npc.defId, npc.name, p.name, combatLevel(p), message, area?.name || `(${p.x},${p.y})`);
      }
      addNpcPrompt(npc.name, prompt, (text) => { if (playerWs) sendText(playerWs, `${npc.name}: "${text}"`); });
    });

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

    let playerWs; for (const [ws, pl] of players) { if (pl === p) { playerWs = ws; break; } }
    getBuilderPersona(npc.defId).then(persona => {
      let prompt;
      if (persona) {
        prompt = persona + `\n\n${p.name} (combat level ${combatLevel(p)}) at ${area?.name || `(${p.x},${p.y})`} says: "${message}"\nRespond in character. Keep it short (1-2 sentences).`;
      } else {
        prompt = ai.buildSimplePrompt(npc.defId, npc.name, p.name, combatLevel(p), message, area?.name || `(${p.x},${p.y})`);
      }
      addNpcPrompt(npc.name, prompt, (text) => { if (playerWs) sendText(playerWs, `${npc.name}: "${text}"`); });
    });

    return `You say to ${npc.name}: "${message}"\n(thinking...)`;
  }
});

// examine command registered in commands/all.js (includes examine self)

// ── Gathering (tick-based) ─────────────────────────────────────────────────────
// Tool requirements for gathering skills
const GATHERING_TOOLS = {
  woodcutting: { match: (name) => name.includes('axe') && !name.includes('pickaxe'), label: 'an axe' },
  mining:      { match: (name) => name.includes('pickaxe'), label: 'a pickaxe' },
  fishing:     { match: (name) => name.includes('fishing') || name.includes('net') || name.includes('harpoon') || name.includes('lobster pot'), label: 'a fishing tool' },
};

function hasGatheringTool(p, skillName) {
  const req = GATHERING_TOOLS[skillName];
  if (!req) return true; // No tool requirement for this skill
  // Check equipped weapon
  if (p.equipment.weapon && req.match(p.equipment.weapon.name.toLowerCase())) return true;
  // Check inventory
  for (const slot of p.inventory) {
    if (slot && req.match(slot.name.toLowerCase())) return true;
  }
  return false;
}

function startGathering(p, ws, skillName, verb, obj) {
  if (obj.depleted) return `The ${obj.name} is depleted.`;
  if (getLevel(p, skillName) < obj.levelReq) return `You need ${skillName} level ${obj.levelReq}.`;
  const toolReq = GATHERING_TOOLS[skillName];
  if (toolReq && !hasGatheringTool(p, skillName)) return `You need ${toolReq.label} to ${verb}.`;
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

// General interact — handles any object action (pick, use, open, etc.)
commands.register('pick', { help: 'Pick something: pick [object]', aliases: ['use', 'interact'], category: 'Gathering',
  fn: (p, args) => {
    const name = args.join(' ') || 'wheat';
    const obj = objects.findObjectByName(name, p.x, p.y, 5, p.layer);
    if (!obj) return `No "${name}" nearby.`;
    if (obj.product) {
      if (invFreeSlots(p) < 1) return 'Inventory is full.';
      const itemDef = items.get(obj.product.id);
      invAdd(p, obj.product.id, obj.product.name, obj.product.count || 1, itemDef?.stackable);
      if (obj.skill) {
        const lvl = addXp(p, obj.skill, obj.xp || 1);
        let msg = `You pick the ${obj.name}. Got: ${obj.product.name}.`;
        if (obj.xp) msg += ` +${obj.xp} ${obj.skill} XP.`;
        if (lvl) msg += ` ${obj.skill} level: ${lvl}!`;
        if (obj.depletionChance && Math.random() < obj.depletionChance) {
          obj.depleted = true; obj.respawnAt = tick.getTick() + (obj.respawnTicks || 50);
        }
        return msg;
      }
      return `You pick the ${obj.name}. Got: ${obj.product.name}.`;
    }
    return `You interact with the ${obj.name}. Nothing happens.`;
  }
});

// ── Eating / Food ──────────────────────────────────────────────────────────────
const FOOD_HEALS = {
  'Bread': 5, 'Cooked meat': 3, 'Cooked chicken': 3, 'Shrimps': 3,
  'Trout': 7, 'Salmon': 9, 'Lobster': 12, 'Swordfish': 14, 'Shark': 20,
  'Cactus water': 3,
};
commands.register('eat', { help: 'Eat food from inventory: eat [name]', category: 'Items',
  fn: (p, args) => {
    const name = args.join(' ');
    if (!name) {
      // Eat first available food
      for (let i = 0; i < p.inventory.length; i++) {
        if (p.inventory[i] && FOOD_HEALS[p.inventory[i].name]) {
          return eatFood(p, i);
        }
      }
      return 'No food in inventory.';
    }
    const lower = name.toLowerCase();
    for (let i = 0; i < p.inventory.length; i++) {
      if (p.inventory[i] && p.inventory[i].name.toLowerCase() === lower && FOOD_HEALS[p.inventory[i].name]) {
        return eatFood(p, i);
      }
    }
    return `No "${name}" to eat.`;
  }
});

function eatFood(p, slot) {
  const item = p.inventory[slot];
  const heal = FOOD_HEALS[item.name] || 1;
  const currentTick = tick.getTick();
  if (p._nextEatTick && currentTick < p._nextEatTick) return 'You are eating too quickly.';
  p._nextEatTick = currentTick + 3; // 3-tick eat delay
  p.inventory[slot] = null;
  const before = p.hp;
  p.hp = Math.min(p.maxHp, p.hp + heal);
  const healed = p.hp - before;
  return `You eat the ${item.name}. Healed ${healed} HP (${p.hp}/${p.maxHp}).`;
}

// ── Cooking ────────────────────────────────────────────────────────────────────
const processingSkills = require('./skills/processing');

commands.register('cook', { help: 'Cook raw food: cook [name]', category: 'Processing',
  fn: (p, args) => {
    const name = args.join(' ').toLowerCase();
    // Find matching recipe
    const recipes = processingSkills.listRecipes('cooking');
    let recipe = null;
    if (name) {
      recipe = recipes.find(r => r.inputName.toLowerCase().includes(name) || r.outputName.toLowerCase().includes(name));
    } else {
      // Cook first available raw food
      for (const r of recipes) {
        if (p.inventory.some(s => s && s.id === r.inputId)) { recipe = r; break; }
      }
    }
    if (!recipe) return name ? `No cooking recipe for "${name}".` : 'No raw food to cook.';

    // Start repeating action
    if (p.busy) actions.cancel(p);
    actions.start(p, {
      type: 'cooking', ticks: recipe.ticks || 4, repeat: true,
      data: { recipe, player: p },
      onTick: (data, ticksLeft) => ticksLeft === data.recipe.ticks - 1 ? `You cook the ${data.recipe.inputName}...` : null,
      onComplete: (data) => {
        const result = processingSkills.processAttempt(data.player, data.recipe.id);
        if (result.error === 'missing_input') { actions.cancel(data.player); return 'No more raw food.'; }
        if (result.error === 'inventory_full') { actions.cancel(data.player); return 'Inventory full.'; }
        if (result.error) return result.error;
        if (result.success) {
          let msg = `You cook the ${data.recipe.inputName}. Got: ${result.product.name}.${xpDrop(data.recipe.skill, data.recipe.xp)}`;
          const lvl = getLevel(data.player, data.recipe.skill);
          return msg;
        }
        return `You accidentally burn the ${data.recipe.inputName}.`;
      },
    });
    return `You begin cooking...`;
  }
});

// ── Smelting ───────────────────────────────────────────────────────────────────
commands.register('smelt', { help: 'Smelt ore at a furnace: smelt [bar name]', category: 'Processing',
  fn: (p, args) => {
    const name = args.join(' ').toLowerCase();
    const recipes = processingSkills.listRecipes('smithing');
    let recipe = null;
    if (name) {
      recipe = recipes.find(r => r.outputName.toLowerCase().includes(name) || r.inputName.toLowerCase().includes(name));
    } else {
      // Smelt first available recipe
      for (const r of recipes) {
        if (p.inventory.some(s => s && s.id === r.inputId)) { recipe = r; break; }
      }
    }
    if (!recipe) return name ? `No smelting recipe for "${name}".` : 'No ore to smelt.';

    if (p.busy) actions.cancel(p);
    actions.start(p, {
      type: 'smithing', ticks: recipe.ticks || 4, repeat: true,
      data: { recipe, player: p },
      onTick: (data, ticksLeft) => ticksLeft === data.recipe.ticks - 1 ? `You smelt the ${data.recipe.inputName}...` : null,
      onComplete: (data) => {
        const result = processingSkills.processAttempt(data.player, data.recipe.id);
        if (result.error === 'missing_input' || result.error === 'missing_secondary') { actions.cancel(data.player); return 'Not enough materials.'; }
        if (result.error === 'inventory_full') { actions.cancel(data.player); return 'Inventory full.'; }
        if (result.error) return result.error;
        if (result.success) {
          return `You smelt a ${result.product.name}.${xpDrop(data.recipe.skill, data.recipe.xp)}`;
        }
        return `You fail to smelt the ore.`;
      },
    });
    return `You begin smelting...`;
  }
});

// ── Shop interaction ───────────────────────────────────────────────────────────
const shopData = require('./data/shops');

commands.register('buy', { help: 'Buy from a shop: buy [item]', category: 'Items',
  fn: (p, args) => {
    if (!p._openShop) return 'You are not at a shop. Talk to a shopkeeper first.';
    const shop = shopData.getShop(p._openShop);
    if (!shop) return 'Shop not found.';
    const name = args.join(' ').toLowerCase();
    if (!name) {
      // List shop stock
      const lines = [`=== ${shop.name} ===`];
      shop.stock.forEach((s, i) => {
        lines.push(`  ${i + 1}. ${s.name} — ${shopData.buyPrice(shop, i)} gp (stock: ${s.current})`);
      });
      return lines.join('\n');
    }
    // Find item by name or number
    let idx = parseInt(name) - 1;
    if (isNaN(idx)) {
      idx = shop.stock.findIndex(s => s.name.toLowerCase().includes(name));
    }
    if (idx < 0 || idx >= shop.stock.length) return `Item "${name}" not found in shop.`;
    const stockItem = shop.stock[idx];
    if (stockItem.current <= 0) return `${stockItem.name} is out of stock.`;
    const price = shopData.buyPrice(shop, idx);
    const coinSlot = p.inventory.findIndex(s => s && s.name === 'Coins');
    const coins = coinSlot >= 0 ? p.inventory[coinSlot].count : 0;
    if (coins < price) return `You need ${price} gp but only have ${coins}.`;
    // Deduct coins
    p.inventory[coinSlot].count -= price;
    if (p.inventory[coinSlot].count <= 0) p.inventory[coinSlot] = null;
    // Add item
    if (invFreeSlots(p) < 1) return 'Inventory is full.';
    const itemDef = items.get(stockItem.id);
    invAdd(p, stockItem.id, stockItem.name, 1, itemDef?.stackable);
    stockItem.current--;
    return `Bought ${stockItem.name} for ${price} gp.`;
  }
});

commands.register('sell', { help: 'Sell to a shop: sell [item]', category: 'Items',
  fn: (p, args) => {
    if (!p._openShop) return 'You are not at a shop. Talk to a shopkeeper first.';
    const shop = shopData.getShop(p._openShop);
    if (!shop) return 'Shop not found.';
    const name = args.join(' ').toLowerCase();
    if (!name) return 'What do you want to sell?';
    const slot = p.inventory.findIndex(s => s && s.name.toLowerCase().includes(name));
    if (slot < 0) return `No "${name}" in inventory.`;
    const item = p.inventory[slot];
    const itemDef = items.get(item.id);
    const value = itemDef ? shopData.sellPrice(shop, itemDef.value) : 1;
    p.inventory[slot] = null;
    // Add coins
    const coinSlot = p.inventory.findIndex(s => s && s.name === 'Coins');
    if (coinSlot >= 0) {
      p.inventory[coinSlot].count += value;
    } else {
      invAdd(p, 101, 'Coins', value, true);
    }
    return `Sold ${item.name} for ${value} gp.`;
  }
});

// ── Combining skills (Herblore, Fletching, Crafting, Prayer) ───────────────────
const combiningSkills = require('./skills/combining');

commands.register('clean', { help: 'Clean a grimy herb: clean [herb]', category: 'Herblore',
  fn: (p, args) => {
    const name = args.join(' ').toLowerCase();
    const recipes = combiningSkills.listRecipes('herblore').filter(r => r.id.startsWith('clean'));
    let recipe = name ? recipes.find(r => r.primaryName.toLowerCase().includes(name) || r.outputName.toLowerCase().includes(name)) : recipes.find(r => p.inventory.some(s => s && s.id === r.primaryId));
    if (!recipe) return name ? `No clean recipe for "${name}".` : 'No grimy herbs to clean.';
    const result = combiningSkills.attempt(p, recipe.id);
    if (result.error) return result.error === 'missing_primary' ? 'No grimy herbs.' : result.error;
    return `You clean the herb. Got: ${result.product.name}.${xpDrop(result.skill, recipe.xp)}`;
  }
});

commands.register('mix', { help: 'Mix a potion: mix [potion name]', aliases: ['brew_potion'], category: 'Herblore',
  fn: (p, args) => {
    const name = args.join(' ').toLowerCase();
    const recipes = combiningSkills.listRecipes('herblore').filter(r => r.id.startsWith('mix'));
    let recipe = name ? recipes.find(r => r.outputName.toLowerCase().includes(name) || r.name.toLowerCase().includes(name)) : null;
    if (!recipe) return name ? `No potion recipe for "${name}". Try: mix attack, mix prayer, mix super strength` : 'Usage: mix [potion name]';
    if (p.busy) actions.cancel(p);
    actions.start(p, {
      type: 'herblore', ticks: recipe.ticks || 3, repeat: true,
      data: { recipe, player: p },
      onTick: () => null,
      onComplete: (data) => {
        const result = combiningSkills.attempt(data.player, data.recipe.id);
        if (result.error) { actions.cancel(data.player); return result.error === 'missing_primary' || result.error === 'missing_secondary' ? 'Out of ingredients.' : result.error; }
        return `You mix a ${result.product.name}.${xpDrop(result.skill, data.recipe.xp)}`;
      },
    });
    return `You begin mixing ${recipe.outputName}...`;
  }
});

commands.register('fletch', { help: 'Fletch an item: fletch [item]', category: 'Fletching',
  fn: (p, args) => {
    const name = args.join(' ').toLowerCase();
    const recipes = combiningSkills.listRecipes('fletching');
    let recipe = name ? recipes.find(r => r.outputName.toLowerCase().includes(name) || r.name.toLowerCase().includes(name)) : null;
    if (!recipe) return name ? `No fletching recipe for "${name}".` : 'Usage: fletch [item name]';
    if (p.busy) actions.cancel(p);
    actions.start(p, {
      type: 'fletching', ticks: recipe.ticks || 3, repeat: true,
      data: { recipe, player: p },
      onTick: () => null,
      onComplete: (data) => {
        const result = combiningSkills.attempt(data.player, data.recipe.id);
        if (result.error) { actions.cancel(data.player); return result.error === 'missing_primary' || result.error === 'missing_secondary' ? 'Out of materials.' : result.error; }
        return `You fletch ${result.product.count > 1 ? result.product.count + 'x ' : ''}${result.product.name}.${xpDrop(result.skill, data.recipe.xp)}`;
      },
    });
    return `You begin fletching ${recipe.outputName}...`;
  }
});

commands.register('craft', { help: 'Craft an item: craft [item]', category: 'Crafting',
  fn: (p, args) => {
    const name = args.join(' ').toLowerCase();
    const recipes = combiningSkills.listRecipes('crafting');
    let recipe = name ? recipes.find(r => r.outputName.toLowerCase().includes(name) || r.name.toLowerCase().includes(name)) : null;
    if (!recipe) return name ? `No crafting recipe for "${name}".` : 'Usage: craft [item name]';
    if (p.busy) actions.cancel(p);
    actions.start(p, {
      type: 'crafting', ticks: recipe.ticks || 3, repeat: true,
      data: { recipe, player: p },
      onTick: () => null,
      onComplete: (data) => {
        const result = combiningSkills.attempt(data.player, data.recipe.id);
        if (result.error) { actions.cancel(data.player); return result.error === 'missing_primary' ? 'Out of materials.' : result.error; }
        return `You craft ${result.product.name}.${xpDrop(result.skill, data.recipe.xp)}`;
      },
    });
    return `You begin crafting ${recipe.outputName}...`;
  }
});

commands.register('bury', { help: 'Bury bones for Prayer XP: bury [bones]', category: 'Prayer',
  fn: (p, args) => {
    const name = args.join(' ').toLowerCase();
    const recipes = combiningSkills.listRecipes('prayer');
    let recipe = name ? recipes.find(r => r.primaryName.toLowerCase().includes(name)) : recipes.find(r => p.inventory.some(s => s && s.id === r.primaryId));
    if (!recipe) return name ? `No prayer recipe for "${name}".` : 'No bones to bury.';
    const result = combiningSkills.attempt(p, recipe.id);
    if (result.error) return result.error === 'missing_primary' ? 'No bones.' : result.error;
    return `You bury the ${recipe.primaryName}.${xpDrop('prayer', recipe.xp)}`;
  }
});

// ── Firemaking ─────────────────────────────────────────────────────────────────
const firemakingSkill = require('./skills/firemaking');

commands.register('light', { help: 'Burn logs: light [log type]', aliases: ['burn', 'firemake'], category: 'Skills',
  fn: (p, args) => {
    const name = args.join(' ').toLowerCase();
    // Find log in inventory
    let logSlot = -1;
    if (name) {
      logSlot = p.inventory.findIndex(s => s && s.name.toLowerCase().includes(name) && firemakingSkill.getLog(s.id));
    } else {
      logSlot = p.inventory.findIndex(s => s && firemakingSkill.getLog(s.id));
    }
    if (logSlot < 0) return name ? `No "${name}" to burn.` : 'No logs to burn.';
    const logId = p.inventory[logSlot].id;

    if (p.busy) actions.cancel(p);
    actions.start(p, {
      type: 'firemaking', ticks: 4, repeat: true,
      data: { logId, player: p },
      onTick: () => null,
      onComplete: (data) => {
        const result = firemakingSkill.burnLog(data.player, data.logId);
        if (result.error === 'no_logs') { actions.cancel(data.player); return 'No more logs.'; }
        if (result.error) return result.error;
        return `You light the ${result.log}.${xpDrop('firemaking', result.xp)}`;
      },
    });
    return `You begin lighting fires...`;
  }
});

// ── Runecrafting ───────────────────────────────────────────────────────────────
const runecraftingSkill = require('./skills/runecrafting');

commands.register('craft_runes', { help: 'Craft runes at altar: craft_runes [altar] | craft_runes list', aliases: ['rc', 'runecraft'], category: 'Skills',
  fn: (p, args) => {
    const sub = args.join(' ').toLowerCase();
    if (!sub || sub === 'list') {
      const altars = runecraftingSkill.listAltars();
      return '=== Runecrafting Altars ===\n' + altars.map(a =>
        `  ${a.name} (Level ${a.level}, ${a.region}) → ${a.runeName}`
      ).join('\n');
    }
    const altar = runecraftingSkill.listAltars().find(a =>
      a.id.includes(sub) || a.name.toLowerCase().includes(sub) || a.runeName.toLowerCase().includes(sub)
    );
    if (!altar) return `Unknown altar: "${sub}". Type \`craft_runes list\`.`;
    const result = runecraftingSkill.craftRunes(p, altar.id);
    if (result.error) return result.error;
    return `Crafted ${result.runesCrafted}x ${result.rune} from ${result.essenceUsed} essence${result.multiplier > 1 ? ` (${result.multiplier}x multiplier!)` : ''}.${xpDrop('runecrafting', result.xp)}`;
  }
});

// ── Hunter ──────────────────────────────────────────────────────────────────────
const hunterSkill = require('./skills/hunter');

commands.register('trap', { help: 'Set a trap: trap [creature] | trap list', aliases: ['hunt', 'catch'], category: 'Skills',
  fn: (p, args) => {
    const sub = args.join(' ').toLowerCase();
    if (!sub || sub === 'list') {
      const traps = [...hunterSkill.trapDefs.values()];
      return '=== Hunter Targets ===\n' + traps.map(t =>
        `  ${t.name} (Level ${t.level}, ${t.type}, ${t.region || 'any'})${t.dangerous ? ' [DANGEROUS]' : ''}`
      ).join('\n');
    }
    const trap = [...hunterSkill.trapDefs.values()].find(t =>
      t.id.includes(sub.replace(/\s+/g, '_')) || t.name.toLowerCase().includes(sub)
    );
    if (!trap) return `Unknown target: "${sub}". Type \`trap list\`.`;

    if (p.busy) actions.cancel(p);
    actions.start(p, {
      type: 'hunter', ticks: trap.checkTicks, repeat: true,
      data: { trap, player: p },
      onTick: (data, ticksLeft) => ticksLeft === 1 ? `You check the trap...` : null,
      onComplete: (data) => {
        const result = hunterSkill.attemptCatch(data.player, data.trap.id);
        if (result.error) { actions.cancel(data.player); return result.error; }
        if (!result.success) return 'The creature escaped!';
        let msg = `You catch the ${data.trap.name}!${xpDrop('hunter', result.xp)}`;
        if (result.loot) {
          const { invAdd: ia } = require('./player/player');
          const def = items.get(result.loot.id);
          ia(data.player, result.loot.id, result.loot.name, result.loot.count, def?.stackable);
          msg += ` Got: ${result.loot.count}x ${result.loot.name}.`;
        }
        return msg;
      },
    });
    return `You set a trap for ${trap.name}...`;
  }
});

// ── Construction ───────────────────────────────────────────────────────────────
const constructionSkill = require('./skills/construction');

commands.register('build', { help: 'Build furniture: build [furniture] | build list', category: 'Skills',
  fn: (p, args) => {
    const sub = args.join(' ').toLowerCase();
    if (!sub || sub === 'list') {
      const furniture = [...constructionSkill.furnitureDefs.values()];
      const level = p.skills?.construction?.level || 1;
      return '=== Construction ===\n' + furniture.map(f => {
        const mats = f.materials.map(m => `${m.count}x ${m.name}`).join(', ');
        const locked = f.level > level ? ' [LOCKED]' : '';
        return `  ${f.name} (Level ${f.level}, ${f.xp} XP) — ${mats}${f.effect ? ` [${f.effect}]` : ''}${locked}`;
      }).join('\n');
    }
    const furniture = [...constructionSkill.furnitureDefs.values()].find(f =>
      f.id.includes(sub.replace(/\s+/g, '_')) || f.name.toLowerCase().includes(sub)
    );
    if (!furniture) return `Unknown furniture: "${sub}". Type \`build list\`.`;

    if (p.busy) actions.cancel(p);
    actions.start(p, {
      type: 'construction', ticks: 5, repeat: true,
      data: { furnitureId: furniture.id, player: p },
      onTick: () => null,
      onComplete: (data) => {
        const result = constructionSkill.buildFurniture(data.player, data.furnitureId);
        if (result.error === 'missing_material') { actions.cancel(data.player); return `Need more ${result.need} (have ${result.have}, need ${result.required}).`; }
        if (result.error) { actions.cancel(data.player); return result.error; }
        return `You build a ${result.furniture}.${xpDrop('construction', result.xp)}`;
      },
    });
    return `You begin building ${furniture.name}...`;
  }
});

// ── Agility ────────────────────────────────────────────────────────────────────
const agilitySkill = require('./skills/agility');

commands.register('agility', { help: 'Run agility course: agility [course] | agility list', category: 'Skills',
  fn: (p, args) => {
    const sub = args[0]?.toLowerCase();
    if (!sub || sub === 'list') {
      const courses = agilitySkill.listCourses();
      return '=== Agility Courses ===\n' + courses.map(c => {
        const rate = agilitySkill.computeCourseRate(c.id, p.skills?.agility?.level || 1);
        return `  ${c.name} (Level ${c.level}, ${rate?.xpPerHour || '?'} XP/hr, ${c.attention})`;
      }).join('\n');
    }
    const course = agilitySkill.listCourses().find(c =>
      c.id.includes(sub) || c.name.toLowerCase().includes(sub) || c.region.toLowerCase().includes(sub)
    );
    if (!course) return `Unknown course: "${sub}". Type \`agility list\`.`;

    // Start running the course as a repeating action
    if (p.busy) actions.cancel(p);
    if (!p._agilityObstacle) p._agilityObstacle = 0;
    p._agilityObstacle = 0;
    p._agilityCourse = course.id;

    actions.start(p, {
      type: 'agility', ticks: course.obstacles[0]?.ticks || 5, repeat: true,
      data: { course, player: p },
      onTick: (data, ticksLeft) => {
        if (ticksLeft === 1) {
          const obs = data.course.obstacles[data.player._agilityObstacle];
          return obs ? `You attempt the ${obs.name}...` : null;
        }
        return null;
      },
      onComplete: (data) => {
        const result = agilitySkill.attemptObstacle(data.player, data.player._agilityCourse, data.player._agilityObstacle);
        if (result.error) { actions.cancel(data.player); return result.error; }
        if (!result.success) {
          data.player._agilityObstacle = 0; // Reset to start
          return `You fall off the ${result.obstacle}! (${result.damage} damage) Starting over...`;
        }
        data.player._agilityObstacle = result.nextObstacle;
        let msg = `${result.obstacle} cleared!${xpDrop('agility', result.xp)}`;
        if (result.lapComplete) {
          msg += `\nLap complete! +${result.lapBonus} bonus XP.`;
          if (result.gotMark) {
            const { invAdd } = require('./player/player');
            invAdd(data.player, 14001, 'Mark of grace', 1, true);
            msg += ' You find a Mark of grace!';
          }
        }
        // Update tick count for next obstacle
        const nextObs = data.course.obstacles[result.nextObstacle];
        if (nextObs) actions.setTicks(data.player, nextObs.ticks);
        return msg;
      },
    });
    return `You begin the ${course.name}... (${course.obstacles.length} obstacles)`;
  }
});

// ── Thieving ───────────────────────────────────────────────────────────────────
const thievingSkill = require('./skills/thieving');

commands.register('pickpocket', { help: 'Pickpocket an NPC: pickpocket [target]', aliases: ['pp', 'steal'], category: 'Thieving',
  fn: (p, args) => {
    const name = args.join(' ').toLowerCase();
    const targets = thievingSkill.listTargets('pickpocket');
    let target = name ? targets.find(t => t.name.toLowerCase().includes(name)) : null;
    if (!target && !name) {
      // Try nearest pickpocketable NPC
      target = targets[0]; // fallback to easiest
    }
    if (!target) return name ? `Can't pickpocket "${name}". Try: pickpocket man, pickpocket guard` : 'Who do you want to pickpocket?';

    // Repeating action
    if (p.busy) actions.cancel(p);
    actions.start(p, {
      type: 'thieving', ticks: 3, repeat: true,
      data: { target, player: p },
      onTick: () => null,
      onComplete: (data) => {
        const result = thievingSkill.attemptTheft(data.player, data.target.id);
        if (result.error === 'stunned') return `You are stunned! (${result.remaining} ticks)`;
        if (result.error) { actions.cancel(data.player); return result.error; }
        if (!result.success) {
          return `You fail to pickpocket the ${data.target.name}. Stunned for ${result.stunTicks} ticks! (-${result.stunDamage} HP)`;
        }
        let msg = `You pick the ${data.target.name}'s pocket.${xpDrop('thieving', result.xp)}`;
        if (result.loot) {
          const { invAdd } = require('./player/player');
          const itemDef = items.get(result.loot.id);
          invAdd(data.player, result.loot.id, result.loot.name, result.loot.count, itemDef?.stackable);
          msg += ` Got: ${result.loot.count}x ${result.loot.name}.`;
        }
        return msg;
      },
    });
    return `You attempt to pickpocket the ${target.name}...`;
  }
});

commands.register('thieve', { help: 'Steal from a stall: thieve [stall]', aliases: ['stealfrom'], category: 'Thieving',
  fn: (p, args) => {
    const name = args.join(' ').toLowerCase();
    const targets = thievingSkill.listTargets('stall');
    let target = name ? targets.find(t => t.name.toLowerCase().includes(name)) : targets[0];
    if (!target) return name ? `No "${name}" stall nearby.` : 'No stalls to steal from.';
    const result = thievingSkill.attemptTheft(p, target.id);
    if (result.error) return result.error;
    if (!result.success) return `You fail to steal from the ${target.name}! Stunned.`;
    let msg = `You steal from the ${target.name}.${xpDrop('thieving', result.xp)}`;
    if (result.loot) {
      const { invAdd: ia } = require('./player/player');
      const def = items.get(result.loot.id);
      ia(p, result.loot.id, result.loot.name, result.loot.count, def?.stackable);
      msg += ` Got: ${result.loot.count}x ${result.loot.name}.`;
    }
    return msg;
  }
});

// ── Farming ────────────────────────────────────────────────────────────────────
const farmingSkill = require('./skills/farming');

commands.register('farm', { help: 'Farming: farm plant [patch] [seed] | farm harvest [patch] | farm inspect [patch] | farm patches', category: 'Farming',
  fn: (p, args) => {
    const sub = args[0]?.toLowerCase();
    if (!sub || sub === 'patches') {
      const patches = farmingSkill.listPatches();
      if (!patches.length) return 'No farming patches available.';
      const lines = ['=== Farming Patches ==='];
      for (const patch of patches) {
        farmingSkill.updateGrowth(patch.id);
        const seed = patch.seedId ? farmingSkill.seedDefs.get(patch.seedId) : null;
        let status = 'Empty';
        if (patch.dead) status = 'Dead crop';
        else if (patch.diseased) status = 'Diseased!';
        else if (patch.harvestsRemaining > 0) status = `Ready to harvest (${patch.harvestsRemaining} remaining)`;
        else if (seed) status = `Growing: ${seed.seedName} (stage ${patch.growthStage}/${patch.maxGrowthStage})`;
        const compostTag = patch.supercomposted ? ' [SC]' : patch.composted ? ' [C]' : '';
        lines.push(`  ${patch.id} (${patch.region}, ${patch.type})${compostTag}: ${status}`);
      }
      return lines.join('\n');
    }
    if (sub === 'plant') {
      const patchId = args[1];
      const seedName = args.slice(2).join(' ').toLowerCase();
      if (!patchId || !seedName) return 'Usage: farm plant [patch_id] [seed name]';
      // Find seed in inventory by name
      const seedSlot = p.inventory.findIndex(s => s && s.name.toLowerCase().includes(seedName));
      if (seedSlot < 0) return `No "${seedName}" in inventory.`;
      const seedId = p.inventory[seedSlot].id;
      const result = farmingSkill.plant(p, patchId, seedId);
      if (result.error) return result.error;
      return `Planted ${result.seed}. Growth time: ~${Math.floor(result.growthTicks * 0.6 / 60)} minutes.${xpDrop('farming', result.xp)}`;
    }
    if (sub === 'harvest') {
      const patchId = args[1];
      if (!patchId) return 'Usage: farm harvest [patch_id]';
      // Harvest all available
      let totalXp = 0, totalItems = 0, productName = '';
      while (true) {
        const result = farmingSkill.harvest(p, patchId);
        if (result.error) {
          if (totalItems > 0) return `Harvested ${totalItems}x ${productName}.${xpDrop('farming', totalXp)}`;
          return result.error === 'not_grown' ? `Not ready yet. Stage ${result.stage}/${result.maxStage}. ~${Math.floor(result.ticksRemaining * 0.6 / 60)}min remaining.` : result.error;
        }
        totalXp += result.xp;
        totalItems++;
        productName = result.product;
        if (result.remaining <= 0) break;
        if (p.inventory.findIndex(s => s === null) < 0) { break; } // Inventory full
      }
      return `Harvested ${totalItems}x ${productName}.${xpDrop('farming', totalXp)}`;
    }
    if (sub === 'compost') {
      const patchId = args[1];
      const isSuper = args[2]?.toLowerCase() === 'super';
      if (!patchId) return 'Usage: farm compost [patch_id] [super]';
      // Check for compost in inventory
      const compostId = isSuper ? 12817 : 12816;
      const slot = p.inventory.findIndex(s => s && s.id === compostId);
      if (slot < 0) return `No ${isSuper ? 'supercompost' : 'compost'} in inventory.`;
      p.inventory[slot] = null;
      const result = farmingSkill.compost(p, patchId, isSuper);
      if (result.error) return result.error;
      return `Applied ${result.type} to ${patchId}.`;
    }
    if (sub === 'inspect') {
      const patchId = args[1];
      if (!patchId) return 'Usage: farm inspect [patch_id]';
      farmingSkill.updateGrowth(patchId);
      const patch = farmingSkill.getPatch(patchId);
      if (!patch) return 'Unknown patch.';
      if (!patch.seedId) return `${patchId}: Empty. Use \`farm plant ${patchId} [seed]\`.`;
      const seed = farmingSkill.seedDefs.get(patch.seedId);
      return `${patchId}: ${seed?.seedName || 'Unknown'}, stage ${patch.growthStage}/${patch.maxGrowthStage}${patch.diseased ? ' DISEASED' : ''}${patch.dead ? ' DEAD' : ''}${patch.harvestsRemaining > 0 ? ` READY (${patch.harvestsRemaining} harvests)` : ''}`;
    }
    return 'Usage: farm patches | farm plant [patch] [seed] | farm harvest [patch] | farm compost [patch] | farm inspect [patch]';
  }
});

// ── Quest commands ─────────────────────────────────────────────────────────────
const questData = require('./data/quests');

commands.register('quest', { help: 'Quest commands: quest list | quest start [id] | quest status [id]', category: 'Quests',
  fn: (p, args) => {
    const sub = args[0]?.toLowerCase();
    if (!sub || sub === 'list') {
      const all = questData.listAll();
      if (all.length === 0) return 'No quests available.';
      const lines = ['=== Quests ==='];
      for (const q of all) {
        const status = questData.getStatus(p, q.id);
        const tag = status.complete ? '[DONE]' : status.started ? `[Step ${status.step + 1}/${q.steps.length}]` : '[NOT STARTED]';
        lines.push(`  ${q.name} (${q.difficulty}) ${tag}`);
      }
      return lines.join('\n');
    }
    if (sub === 'start') {
      const qId = args[1];
      if (!qId) return 'Usage: quest start [quest_id]';
      const q = questData.getQuest(qId);
      if (!q) return `Unknown quest: ${qId}`;
      const status = questData.getStatus(p, qId);
      if (status.complete) return `You have already completed ${q.name}.`;
      if (status.started) return `You are already on ${q.name} (step ${status.step + 1}).`;
      if (!questData.meetsRequirements(p, q, getLevel)) return `You don't meet the requirements for ${q.name}.`;
      questData.startQuest(p, qId);
      return `Quest started: ${q.name}\n${q.steps[0]?.text || 'Begin your journey.'}`;
    }
    if (sub === 'status' || sub === 'info') {
      const qId = args[1];
      if (!qId) return 'Usage: quest status [quest_id]';
      const q = questData.getQuest(qId);
      if (!q) return `Unknown quest: ${qId}`;
      const status = questData.getStatus(p, qId);
      if (status.complete) return `${q.name} — COMPLETE (${q.questPoints} QP)`;
      if (!status.started) return `${q.name} — Not started.\n${q.description}`;
      const step = q.steps[status.step];
      return `${q.name} — Step ${status.step + 1}/${q.steps.length}\n${step?.text || 'Continue.'}`;
    }
    if (sub === 'advance') {
      // Debug/admin: manually advance quest step
      const qId = args[1];
      if (!qId) return 'Usage: quest advance [quest_id]';
      const q = questData.getQuest(qId);
      if (!q) return `Unknown quest: ${qId}`;
      const result = questData.advanceStep(p, qId);
      if (!result) return 'Cannot advance.';
      if (result.complete) {
        // Grant rewards
        if (q.rewards.xp) {
          for (const [skill, amount] of Object.entries(q.rewards.xp)) {
            addXp(p, skill, amount);
          }
        }
        if (q.rewards.items) {
          for (const item of q.rewards.items) {
            const def = items.get(item.id);
            invAdd(p, item.id, item.name, item.count || 1, def?.stackable);
          }
        }
        return `Quest complete: ${q.name}! Rewards granted.`;
      }
      return `Quest step advanced. Step ${result.step + 1}/${q.steps.length}: ${q.steps[result.step]?.text || 'Continue.'}`;
    }
    return 'Usage: quest list | quest start [id] | quest status [id] | quest advance [id]';
  }
});

// ── Slayer commands ────────────────────────────────────────────────────────────
const slayerData = require('./data/slayer');

// Add Aelgard slayer master (Moryskah)
slayerData.defineMaster('varrek', {
  name: 'Slayer Master Varrek', combatReq: 40, slayerReq: 15,
  tasks: [
    { monster: 'banshee', weight: 6, min: 40, max: 80, slayerReq: 15 },
    { monster: 'crawling hand', weight: 5, min: 40, max: 80 },
    { monster: 'vampyre juvenile', weight: 5, min: 50, max: 90, slayerReq: 25 },
    { monster: 'werewolf', weight: 4, min: 40, max: 70, slayerReq: 30 },
    { monster: 'aberrant spectre', weight: 4, min: 50, max: 80, slayerReq: 40 },
    { monster: 'dust devil', weight: 3, min: 60, max: 100, slayerReq: 45 },
    { monster: 'mummy', weight: 3, min: 40, max: 70, slayerReq: 35 },
    { monster: 'bone crawler', weight: 4, min: 50, max: 80 },
    { monster: 'fungal mage', weight: 3, min: 50, max: 80, slayerReq: 30 },
    { monster: 'prism wizard', weight: 2, min: 40, max: 60, slayerReq: 55 },
  ],
});

commands.register('slayer', { help: 'Slayer commands: slayer task | slayer info | slayer rewards', aliases: ['task'], category: 'Skills',
  fn: (p, args) => {
    const sub = args[0]?.toLowerCase();
    if (sub === 'task' || (!sub && !p.slayerTask)) {
      // Pick master based on combat level
      const cb = combatLevel(p);
      const masterId = cb >= 40 ? 'varrek' : (cb >= 20 ? 'vannaka' : 'turael');
      const task = slayerData.assignTask(p, masterId, getLevel);
      if (!task) return 'No slayer tasks available at your level.';
      p.slayerTask = { monster: task.monster, count: task.count, remaining: task.remaining };
      const master = slayerData.masters.get(masterId);
      return `New slayer task from ${master?.name || masterId}: Kill ${task.count} ${task.monster}.`;
    }
    if (sub === 'rewards') {
      const lines = ['=== Slayer Reward Shop ===', `Your points: ${p.slayerPoints || 0}`];
      for (const [id, r] of Object.entries(slayerData.SLAYER_REWARDS)) {
        lines.push(`  ${id} (${r.cost} pts) — ${r.desc}`);
      }
      return lines.join('\n');
    }
    const t = p.slayerTask;
    if (!t) return 'You have no slayer task. Type `slayer task` to get one.';
    return `Slayer task: Kill ${t.remaining} more ${t.monster}. (Streak: ${p.slayerStreak || 0}, Points: ${p.slayerPoints || 0})`;
  }
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
    // Broadcast to all players except those who have sender ignored
    for (const [ws2, pl] of players) {
      if (pl.ignoreList && pl.ignoreList.includes(p.name.toLowerCase())) continue;
      send(ws2, { t: 'chat', from: p.name, msg });
    }
    // Overhead chat: nearby players see the message with player name
    for (const [ws2, pl] of players) {
      if (pl !== p && Math.abs(pl.x - p.x) <= 10 && Math.abs(pl.y - p.y) <= 10 && pl.layer === p.layer) {
        if (pl.ignoreList && pl.ignoreList.includes(p.name.toLowerCase())) continue;
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
    // Check if target has sender ignored — silently drop the message
    if (target.ignoreList && target.ignoreList.includes(p.name.toLowerCase())) {
      return `[PM to ${target.name}]: ${args.slice(1).join(' ')}`;
    }
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
    if (!objects.findObjectByName('bank booth', p.x, p.y, 3, p.layer)) { p._bankOpen = false; return 'You are too far from the bank.'; }
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
    if (!objects.findObjectByName('bank booth', p.x, p.y, 3, p.layer)) { p._bankOpen = false; return 'You are too far from the bank.'; }
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

commands.register('tickrate', { help: 'Set tick rate in ms: tickrate [ms]', category: 'Build', admin: true,
  fn: (p, args) => {
    const ms = parseInt(args[0]);
    if (isNaN(ms) || ms < 1) return 'Usage: tickrate [ms] (e.g., tickrate 1 for max speed)';
    tick.setTickRate(ms);
    return `Tick rate set to ${ms}ms.`;
  }
});

commands.register('tick', { help: 'Manually advance N ticks: tick [count]', category: 'Build', admin: true,
  fn: (p, args) => {
    const count = parseInt(args[0]) || 1;
    for (let i = 0; i < count; i++) tick.processTick();
    return `Advanced ${count} tick${count > 1 ? 's' : ''}. Now tick ${tick.getTick()}.`;
  }
});

// RL step: execute action + advance ticks + return JSON state — all in one round-trip
commands.register('rl', { help: 'RL step: rl [action_id] [ticks]', category: 'Build', admin: true,
  fn: (p, args) => {
    const actionId = parseInt(args[0]) || 0;
    const ticks = parseInt(args[1]) || 4;

    // ══ MINIMAL RULES — only universal PvM truth ══
    // One rule: pray against the highest threat. Everything else RL learns.
    const inst_pre = require('./engine/instances').getByPlayer(p.id);
    const npcMod = require('./world/npcs');
    const alive = inst_pre ? npcMod.getNpcsInInstance(inst_pre.id) : [];

    // Threat-based prayer: score each NPC, pray against highest
    const ensurePray = (name) => {
      if (!p.activePrayers.has(name)) commands.execute(p, 'pray ' + name.replace(/_/g, ' '));
    };
    let bestThreat = null, bestScore = -1;
    for (const npc of alive) {
      if (npc.dead) continue;
      const dist = Math.max(Math.abs(npc.x - p.x), Math.abs(npc.y - p.y));
      const style = npc.attackStyle || 'melee';
      const maxHit = npc.maxHit || 1;
      let score = 0;
      if (style === 'magic' || style === 'ranged') score = maxHit * 2 + Math.max(0, 20 - dist) * 3;
      else if (style === 'melee') score = dist <= 1 ? maxHit : 0;
      else if (style === 'typeless') score = maxHit * 3;
      if (score > bestScore) { bestScore = score; bestThreat = npc; }
    }
    if (bestThreat) {
      const style = bestThreat.attackStyle || 'melee';
      if (style === 'magic') ensurePray('protect_from_magic');
      else if (style === 'ranged') ensurePray('protect_from_missiles');
      else if (style === 'melee' && Math.max(Math.abs(bestThreat.x - p.x), Math.abs(bestThreat.y - p.y)) <= 1)
        ensurePray('protect_from_melee');
    }

    // Auto-target: if no target, pick nearest alive mob
    if (!p.combatTarget || !npcMod.getNpc(p.combatTarget) || npcMod.getNpc(p.combatTarget).dead) {
      const sorted = [...alive].sort((a, b) => {
        const da = Math.max(Math.abs(a.x - p.x), Math.abs(a.y - p.y));
        const db = Math.max(Math.abs(b.x - p.x), Math.abs(b.y - p.y));
        return da - db;
      });
      if (sorted[0]) { p.combatTarget = sorted[0].id; p.busy = true; }
    }

    let effectiveAction = actionId;

    // ── RL learns everything else ──
    // 0: continue, 1-2: potions, 3-6: move, 7: atk nearest, 8-9: weapon switch
    const rlActions = {
      0: null, // continue — let rules play
      1: () => commands.execute(p, 'drink saradomin brew'),
      2: () => commands.execute(p, 'drink super restore'),
      3: () => commands.execute(p, 'n'),
      4: () => commands.execute(p, 's'),
      5: () => commands.execute(p, 'e'),
      6: () => commands.execute(p, 'w'),
      7: () => { // attack nearest
        const sorted = [...alive].sort((a, b) => {
          const da = Math.max(Math.abs(a.x - p.x), Math.abs(a.y - p.y));
          const db = Math.max(Math.abs(b.x - p.x), Math.abs(b.y - p.y));
          return da - db;
        });
        if (sorted[0]) { p.combatTarget = sorted[0].id; p.busy = true; }
      },
      8: () => commands.execute(p, 'equip toxic blowpipe'),
      9: () => commands.execute(p, 'equip armadyl crossbow'),
    };
    if (rlActions[effectiveAction]) rlActions[effectiveAction]();

    // Advance ticks
    for (let i = 0; i < ticks; i++) tick.processTick();

    // Build state JSON
    const inst = require('./engine/instances').getByPlayer(p.id);
    let wave = 0, mobCount = 0, mobTypes = [], dead = false, complete = false, shieldSafe = 0, shieldHp = 0;
    if (inst && inst.type === 'inferno') {
      wave = inst.currentWave;
      if (inst.state === 'failed') dead = true;
      if (inst.state === 'complete') complete = true;
      const alive = require('./world/npcs').getNpcsInInstance(inst.id);
      mobCount = alive.length;
      for (const npc of alive) {
        const n = npc.name.split(' ')[0].replace(/[()]/g, '');
        if (!mobTypes.includes(n)) mobTypes.push(n);
      }
      const ents = require('./world/entities').getInInstance(inst.id);
      const shield = ents.find(e => e.type === 'shield');
      if (shield) {
        shieldHp = shield.hp / shield.maxHp;
        shieldSafe = require('./world/entities').isBehindShield(p.x, p.y, shield) ? 1 : 0;
      }
    } else if (!inst) {
      dead = true; // no instance = died or left
    }

    const prayMage = p.activePrayers?.has('protect_from_magic') ? 1 : 0;
    const prayRange = p.activePrayers?.has('protect_from_missiles') ? 1 : 0;
    const prayMelee = p.activePrayers?.has('protect_from_melee') ? 1 : 0;
    const prayers = p.activePrayers ? [...p.activePrayers] : [];

    // Generate map for spectator
    let mapStr = '';
    if (cmdCtx.generateMap) mapStr = cmdCtx.generateMap(p);

    // Current target name
    let targetName = '';
    if (p.combatTarget) {
      const tgt = require('./world/npcs').getNpc(p.combatTarget);
      if (tgt && !tgt.dead) targetName = tgt.name;
    }

    // Full 28-slot inventory for spectator
    const inv = p.inventory.map(slot => slot ? { n: slot.name, c: slot.count || 1 } : null);
    let invUsed = inv.filter(s => s).length;

    // Equipped weapon
    const weapon = p.equipment?.weapon?.name || 'None';

    return mapStr + '\n' + JSON.stringify({
      hp: p.hp, maxHp: p.maxHp,
      pp: p.prayerPoints, maxPp: getLevel(p, 'prayer'),
      wave, mobCount, mobTypes,
      prayMage, prayRange, prayMelee, prayers,
      shieldSafe, shieldHp,
      dead, complete,
      challenge: inst ? inst.challenge : null,
      damageTaken: inst ? ((inst.startHp || 99) - p.hp) : 0,
      tick: tick.getTick(),
      target: targetName,
      targetHp: p.combatTarget ? (npcMod.getNpc(p.combatTarget)?.hp || 0) : 0,
      targetMaxHp: p.combatTarget ? (npcMod.getNpc(p.combatTarget)?.maxHp || 0) : 0,
      weapon,
      stats: {
        atk: getLevel(p, 'attack') + ((p.boosts?.attack?.ticksLeft > 0) ? p.boosts.attack.amount : 0),
        str: getLevel(p, 'strength') + ((p.boosts?.strength?.ticksLeft > 0) ? p.boosts.strength.amount : 0),
        def: getLevel(p, 'defence') + ((p.boosts?.defence?.ticksLeft > 0) ? p.boosts.defence.amount : 0),
        rng: getLevel(p, 'ranged') + ((p.boosts?.ranged?.ticksLeft > 0) ? p.boosts.ranged.amount : 0),
        mag: getLevel(p, 'magic') + ((p.boosts?.magic?.ticksLeft > 0) ? p.boosts.magic.amount : 0),
        base: { atk: getLevel(p, 'attack'), str: getLevel(p, 'strength'), def: getLevel(p, 'defence'), rng: getLevel(p, 'ranged'), mag: getLevel(p, 'magic') },
      },
      run: Math.round(p.runEnergy / 100),
      inv,
      invUsed,
    });
  }
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
  objects.defineObject('wheat', { name: 'Wheat', examine: 'A field of wheat.', actions: ['pick'], product: { id: 750, name: 'Grain', count: 1 }, skill: 'farming', xp: 1, depletionChance: 0.3, respawnTicks: 20 });
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
  // Solid objects — place on WALL tiles so players can't walk through them
  const solidObjects = [
    ['bank_booth', 97, 82], ['bank_booth', 98, 82], ['bank_booth', 99, 82],
    ['range', 109, 82], ['range', 110, 82],
    ['furnace', 103, 82], ['furnace', 104, 82],
    ['anvil', 105, 82], ['anvil', 106, 82],
  ];
  for (const [id, x, y] of solidObjects) {
    objects.placeObject(id, x, y);
    tiles.setTile(x, y, tiles.T.WALL);
  }
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

  // ═══════════════════════════════════════════════════════════════════════════
  // AELGARD — World content packs (define items, NPCs, monsters, shops, quests)
  // ═══════════════════════════════════════════════════════════════════════════
  const heartlands = require('./content/aelgard/heartlands');
  require('./content/aelgard/boneyard-wastes');
  require('./content/aelgard/moryskah');
  require('./content/aelgard/veilwood');
  require('./content/aelgard/sootworks');
  require('./content/aelgard/saltbrine');
  require('./content/aelgard/inkweald');
  require('./content/aelgard/glass-desert');
  require('./content/aelgard/items-expanded'); // Potions, ranged, magic, herbs, seeds, gems, jewellery, tools
  require('./content/aelgard/active-gathering'); // Trawler, Storm Felling, Blast Mining, Feast Cooking, Volcanic Core
  require('./content/aelgard/boss-instances');  // 13 boss instances registered as playable RL content
  require('./content/aelgard/quests-expanded'); // 10 more quests
  require('./content/aelgard/shops-expanded');  // 16 more shops → 30 total
  require('./content/aelgard/monsters-expanded'); // 50+ more monsters across all regions + wilds
  require('./content/aelgard/items-dragon-barrows'); // Dragon tier, Barrows sets, Slayer drops, God Wars, clue rewards
  require('./content/aelgard/quests-series');        // 20 more quests: RFD chain, Desert Treasure, Monkey Business, Lunar, etc
  require('./content/aelgard/spellbooks');           // 3 spellbooks, ~55 spells
  require('./content/aelgard/minigames');            // 6 minigames with unique reward sets
  require('./content/aelgard/slayer-creatures');     // Slayer creatures + full dragon tier (green→KBD)
  require('./content/aelgard/achievement-diaries');  // 8 region diaries × 4 tiers = 32 completions
  require('./content/aelgard/treasure-trails');      // 4-tier clue scroll system with reward tables
  require('./content/aelgard/items-blitz');          // 200+ items: smithing products, food, dragonhide, teleport jewellery, skilling outfits, capes, gloves, boots, shields, amulets
  require('./content/aelgard/monsters-blitz');       // 70+ more monsters: dungeon creatures, expanded slayer tower, dragons, wilderness bosses
  require('./content/aelgard/monsters-blitz2');      // 90+ more monsters: city variants, cave systems, deep dungeons, wilderness bosses
  require('./content/aelgard/droptables-expanded');  // Fill missing drop tables for all monsters
  require('./content/aelgard/items-blitz2');         // 247 items: obsidian, godwars, prayer, slayer equip, potions, farming, treasure trail, utility
  require('./content/aelgard/quests-blitz');          // 30 quests: skill intros, lore chains, multi-region adventures, combat challenges, group quests
  require('./content/aelgard/training-methods');      // Level bracket density: +11 mining, +15 fishing, +7 WC, +11 cooking, +2 smithing
  require('./content/aelgard/pets-collection');       // 45 pets + collection log (27 sections, 100+ uniques)
  require('./content/aelgard/smithing-complete');     // 126 anvil recipes (6 tiers × 21 products)
  require('./content/aelgard/prayer-expansion');     // 29 prayers, bone XP table, altar multipliers
  require('./content/aelgard/slayer-expansion');     // 33 slayer creatures, 10 superior variants, 25 items, endgame slayer master
  require('./content/aelgard/bosses-expanded');      // 12 more bosses: God Wars (4), Zulrah, Vorkath, Corp, Nightmare, DKs (3), Mole, KQ
  require('./content/aelgard/diaries-tasks-detailed'); // 320 specific diary tasks across all regions
  require('./content/aelgard/raids');                 // 2 raids: Chambers of Aelgard (6 rooms) + Theatre of Shadows (5 bosses), 20 items, 20 NPCs
  require('./content/aelgard/quests-mega');            // 50 more quests: novice→grandmaster, all 23 skills, multi-region adventures
  require('./content/aelgard/combat-achievements');   // 100+ combat achievements across 6 tiers (Easy→Grandmaster)
  require('./content/aelgard/clue-scrolls-expanded'); // 85 more clue steps + master tier with 3rd age druidic rewards
  require('./content/aelgard/random-events-daily');   // 10 random events + 10 daily/weekly activities
  require('./content/aelgard/transportation-network'); // 40 fairy rings, 15+ teleports, spirit trees, 20 shortcuts, boats/carts/trams
  require('./content/aelgard/raids-bosses-mega');    // Raid 3 (Tombs of Aelgard) + 15 more bosses + Torva/Virtus/Masori armour
  require('./content/aelgard/raid-prerequisites');   // 11 raid unlock quests + tier structure
  try { require('./content/aelgard/raids-mega1'); } catch(e) { console.warn('[aelgard] raids-mega1 pending:', e.message); }
  try { require('./content/aelgard/raids-mega2'); } catch(e) { console.warn('[aelgard] raids-mega2 pending:', e.message); }
  require('./content/aelgard/dungeon-packs');        // 35+ dungeon monsters across 7 region dungeons
  require('./content/aelgard/combat-challenges');    // 5 wave challenges (Colosseum, Crypt Inferno, Crucible, Sea Gauntlet, Dream Arena) + 5 duo bosses
  require('./content/aelgard/league-modes');         // Seasonal leagues: 6 relic tiers, 540 tasks, 5 league templates, reward shop
  require('./content/aelgard/wilderness-content');   // Wilds weapons, BH system, LMS, chaos altar, wilderness slayer, Larran's chest

  // ── Relationship registry content (engine bridge) ──
  // Loads training methods, area gates, quest unlocks, breakpoints, etc. into
  // the central registry (src/data/relationships.js) so the engine can resolve
  // them at runtime via rel.getTrainingMethod() etc.
  try { require('./content/aelgard/area-gates'); } catch (e) { console.warn('[aelgard:rel] area-gates:', e.message); }
  try { require('./content/aelgard/quest-unlocks'); } catch (e) { console.warn('[aelgard:rel] quest-unlocks:', e.message); }
  try { require('./content/aelgard/item-ecosystem'); } catch (e) { console.warn('[aelgard:rel] item-ecosystem:', e.message); }
  try { require('./content/aelgard/training-knobs'); } catch (e) { console.warn('[aelgard:rel] training-knobs:', e.message); }
  try { require('./content/aelgard/breakpoints'); } catch (e) { console.warn('[aelgard:rel] breakpoints:', e.message); }
  try { require('./content/aelgard/skill-web'); } catch (e) { console.warn('[aelgard:rel] skill-web:', e.message); }
  try { require('./content/aelgard/heartlands-deep'); } catch (e) {}
  try { require('./content/aelgard/heartlands-density'); } catch (e) {}
  try { require('./content/aelgard/moryskah-deep'); } catch (e) {}
  try { require('./content/aelgard/moryskah-density'); } catch (e) {}
  try { require('./content/aelgard/mid-tier-regions'); } catch (e) {}
  try { require('./content/aelgard/special-regions'); } catch (e) {}
  try { require('./content/aelgard/cross-region-web'); } catch (e) {}
  try { require('./content/aelgard/quirky-interactions'); } catch (e) {}
  try { require('./content/aelgard/universal-items'); } catch (e) {}
  {
    const rel = require('./data/relationships');
    const s = rel.stats();
    console.log(`[aelgard:rel] Loaded relationship registry: ${s.trainingMethods} methods, ${s.areaGates} gates, ${s.questUnlocks} quest unlocks, ${s.breakpoints} breakpoints`);
  }

  // ── Forward breakpoint events to the player's WebSocket + Live Narrator ──
  // Spectator/codex/UI can react to these. Format:
  //   { t: 'breakpoint', importance, description, unlocks[], bpKey }
  {
    const breakpoints = require('./engine/breakpoint-runner');
    const narrator = require('./ai/narrator');
    narrator.ensureInitialized(); // create public/events.json if missing
    // Probe Ollama asynchronously; report result when it resolves. Non-blocking.
    narrator.probe().then((reachable) => {
      if (reachable) {
        console.log(`[narrator] connected to Ollama at ${narrator.OLLAMA_URL} (model: ${narrator.MODEL})`);
      } else {
        console.log(`[narrator] ${narrator.disabledReason()} — events.json will still record breakpoints, just without generated text.`);
      }
    });
    breakpoints.subscribe((ev) => {
      for (const [ws, pl] of players) {
        if (pl.id === ev.playerId) {
          send(ws, {
            t: 'breakpoint',
            importance: ev.importance,
            description: ev.description,
            unlocks: ev.unlocks,
            bpKey: ev.bpKey,
            bpType: ev.bpType,
            trigger: ev.trigger,
            tick: ev.tick,
          });
          // Inline text for terminal/debug clients
          const tag = ev.importance === 'transformative' ? '★ TRANSFORMATIVE' :
                      ev.importance === 'major' ? '◆ MAJOR' : '· minor';
          sendText(ws, `[Breakpoint ${tag}] ${ev.description}`);
          break;
        }
      }
      // Fire-and-forget: Claude generates flavor text, appends to events.json.
      // Never blocks the tick loop; errors are logged by the narrator module.
      narrator.handleBreakpoint(ev);
    });
  }

  // ── Forward combat-achievement events to the player's WebSocket ─────────
  // Format (per Combat Achievements spec):
  //   { type: 'combat_achievement', subType, taskId, tier, ... }
  try {
    const combatAch = require('./engine/combat-achievements');
    require('./content/aelgard/combat-achievements-tasks');
    combatAch.registerListener((ev) => {
      for (const [ws, pl] of players) {
        if (pl.id === ev.playerId) {
          send(ws, {
            t: 'combat_achievement',
            subType: ev.subType,
            taskId: ev.taskId,
            taskName: ev.taskName,
            tier: ev.tier,
            bossId: ev.bossId,
            points: ev.points,
            totalPoints: ev.totalPoints,
            perkId: ev.perkId,
            perkName: ev.perkName,
            perkDescription: ev.perkDescription,
            tick: ev.tick,
          });
          if (ev.subType === 'tier_complete') {
            sendText(ws, `[CA ${ev.tier.toUpperCase()} tier] Perk unlocked: ${ev.perkName} — ${ev.perkDescription}`);
          } else {
            sendText(ws, `[CA] ${ev.taskName} (+${ev.points} pts, total ${ev.totalPoints})`);
          }
          break;
        }
      }
    });
  } catch (e) {
    console.warn('[combat-achievements] not wired:', e.message);
  }

  // Spawn Aelgard entities in the world (after tiles are set up)
  if (heartlands.spawnHeartlands) heartlands.spawnHeartlands();
  const worldLayout = require('./content/aelgard/world-layout');
  worldLayout.spawnWorld(); // All 8 regions: terrain, areas, NPCs, monsters, resource nodes, bosses

  // CRYSTAL CAVERNS — Builder content pack (now part of the Glass Desert region)
  // ═══════════════════════════════════════════════════════════════════════════
  const crystalMobs = require('./content/crystal_wyrm/mobs');
  crystalMobs.registerAll();

  // Crystal Caverns area (east of town)
  for (let x = 130; x <= 150; x++) for (let y = 90; y <= 110; y++) tiles.setTile(x, y, T.FLOOR);
  tiles.defineArea('crystal_caverns', { name: 'Crystal Caverns', x1: 130, y1: 90, x2: 150, y2: 110, safe: false, multicombat: false });

  // Elara the Geomancer (quest giver at entrance)
  npcs.defineNpc('elara', {
    name: 'Elara the Geomancer',
    examine: 'A weathered scholar who has spent decades studying crystal formations.',
    combat: 0, maxHp: 50,
    stats: {}, attackSpeed: 0, attackRange: 0, maxHit: 0,
    size: 1, aggressive: false, wanderRadius: 3, respawnTicks: 10,
    dialogue: 'Fascinating! The crystal lattice structures here are unlike anything documented. Have you come to study the tremors too?',
  });
  npcs.spawnNpc('elara', 131, 95);

  // Crystal Forge object (for Crystallurgy skill)
  objects.defineObject('crystal_forge', {
    name: 'Crystal Forge',
    examine: 'An ancient forge powered by crystal energy.',
    actions: ['Use'],
  });
  objects.placeObject('crystal_forge', 135, 93);

  // Crystallite spawns (6 throughout the cavern)
  for (const [x, y] of [[137, 96], [140, 100], [143, 97], [145, 103], [138, 107], [147, 95]]) {
    npcs.spawnNpc('crystallite', x, y);
  }

  // Crystal Altar (deeper in caverns)
  objects.defineObject('crystal_altar', {
    name: 'Crystal Altar',
    examine: 'An altar humming with crystal energy.',
    actions: ['Pray', 'Use'],
  });
  objects.placeObject('crystal_altar', 148, 108);

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
const dbApi = require('./db/api');
const db = require('./db/index');

// Builder persona lookup — check if a custom AI persona exists for this NPC
async function getBuilderPersona(npcDefId) {
  try {
    const result = await db.queryOne(
      `SELECT data FROM builder_entities
       WHERE tab_id = 'npc-personas' AND (data->>'npcId' = $1 OR data->>'name' = $1)
       ORDER BY updated_at DESC LIMIT 1`,
      [npcDefId]
    );
    return result?.data?.systemPrompt || null;
  } catch { return null; }
}

const server = http.createServer(async (req, res) => {
  // Auth API endpoints — handle first
  if (req.url.startsWith('/api/auth/')) {
    try {
      const handled = await auth.handleAuthRequest(req, res);
      if (handled !== false) return;
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
      return;
    }
  }

  // Codex API — read-only endpoints serving engine content (hardcoded + builder)
  if (req.url.startsWith('/api/codex/')) {
    try {
      const codexApi = require('./db/codex-api');
      const handled = codexApi.handleCodexRequest(req, res);
      if (handled) return;
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
      return;
    }
  }

  // Database API endpoints
  if (req.url.startsWith('/api/')) {
    try {
      const handled = await dbApi.handleRequest(req, res);
      if (handled) return;
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
      return;
    }
  }

  const publicDir = require('path').join(__dirname, '..', 'public');

  // Session + role helpers
  const session = auth.getSession(req);
  const requireRole = (minRole) => {
    if (auth.hasRole(session, minRole)) return true;
    res.writeHead(302, { 'Location': '/login?next=' + encodeURIComponent(req.url) });
    res.end();
    return false;
  };

  // Helper to serve an HTML file
  const serveHTML = (filename) => {
    const htmlPath = require('path').join(publicDir, filename);
    if (require('fs').existsSync(htmlPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'no-cache' });
      res.end(require('fs').readFileSync(htmlPath));
      return true;
    }
    return false;
  };

  // Narrator feed — always fresh, never cached. Served from public/events.json.
  if (req.url === '/events.json' || req.url.startsWith('/events.json?')) {
    const eventsPath = require('path').join(publicDir, 'events.json');
    if (require('fs').existsSync(eventsPath)) {
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      });
      res.end(require('fs').readFileSync(eventsPath));
    } else {
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      });
      res.end('{"entries":[]}');
    }
    return;
  }

  // Main page — spectate (the landing page)
  if (req.url === '/' || req.url === '/spectate') {
    if (serveHTML('spectate.html')) return;
  }

  // Play page
  if (req.url === '/play') {
    if (serveHTML('play.html')) return;
  }

  // Codex — browsable encyclopedia (primary human interface)
  // Multi-page structure at public/codex/ — serve any .html file under that path
  // Redirect /codex → /codex/ so relative links (href="regions.html") resolve correctly
  if (req.url === '/codex') {
    res.writeHead(301, { Location: '/codex/' });
    res.end();
    return;
  }
  if (req.url === '/codex/' || req.url.startsWith('/codex?')) {
    if (serveHTML('codex/index.html')) return;
  }
  if (req.url.startsWith('/codex/') && req.url.endsWith('.html')) {
    const codexFile = req.url.substring(1); // strip leading /
    if (serveHTML(codexFile)) return;
  }

  // Guide page
  if (req.url === '/guide') {
    if (serveHTML('guide.html')) return;
  }

  // About page
  if (req.url === '/about') {
    if (serveHTML('about.html')) return;
  }

  // Login page
  if (req.url.startsWith('/login')) {
    if (serveHTML('login.html')) return;
  }

  // Logout
  if (req.url === '/logout') {
    auth.clearSessionCookie(res);
    res.writeHead(302, { 'Location': '/' });
    res.end();
    return;
  }

  // Dashboard — admin only
  if (req.url === '/dashboard') {
    if (!requireRole('admin')) return;
    if (serveHTML('dashboard.html')) return;
  }

  // ── Unified Builder — builder+ role required ──
  if (req.url === '/builder' || req.url.startsWith('/builder?')) {
    if (!requireRole('builder')) return;
    if (serveHTML('builder.html')) return;
  }

  // ── Legacy builders — redirect to unified builder ──
  const LEGACY_BUILDER_TABS = {
    '/boss-builder': 'bosses',
    '/skill-builder': 'skills',
    '/quest-builder': 'quests',
  };
  if (LEGACY_BUILDER_TABS[req.url]) {
    res.writeHead(302, { Location: `/builder?mode=build&tab=${LEGACY_BUILDER_TABS[req.url]}` });
    res.end();
    return;
  }

  // Backwards compat — index.html still serves the original terminal client
  if (req.url === '/index.html') {
    if (serveHTML('index.html')) return;
  }

  // Viewer count
  if (!global._spectateViewers) global._spectateViewers = new Map();
  if (req.url === '/viewers') {
    // Count viewers active in last 10 seconds
    const now = Date.now();
    let count = 0;
    for (const [ip, ts] of global._spectateViewers) {
      if (now - ts < 10000) count++;
      else global._spectateViewers.delete(ip);
    }
    res.writeHead(200, { 'Content-Type': 'text/plain', 'Cache-Control': 'no-cache' });
    res.end(String(count));
    return;
  }

  // Serve live.log for spectator
  if (req.url === '/spectate-data') {
    // Track viewer
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    global._spectateViewers.set(ip, Date.now());
    // Look for live.log — crystal-wyrm-rl first, then inferno-rl
    const home = process.env.HOME || process.env.USERPROFILE || '';
    const logPaths = [
      require('path').join(__dirname, '..', '..', 'ScapeTests', 'crystal-wyrm-rl', 'live.log'),
      require('path').join(home, 'ScapeTests', 'crystal-wyrm-rl', 'live.log'),
      require('path').join(__dirname, '..', '..', 'ScapeTests', 'inferno-rl', 'live.log'),
      require('path').join(home, 'ScapeTests', 'inferno-rl', 'live.log'),
    ];
    for (const logPath of logPaths) {
      if (require('fs').existsSync(logPath)) {
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache', 'Access-Control-Allow-Origin': '*' });
        res.end(require('fs').readFileSync(logPath, 'utf-8'));
        return;
      }
    }
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('');
    return;
  }

  // Challenge status — check crystal-wyrm-rl first, fall back to inferno-rl
  if (req.url === '/challenges') {
    const home = process.env.HOME || process.env.USERPROFILE || '';
    const cPaths = [
      require('path').join(home, 'ScapeTests', 'crystal-wyrm-rl', 'challenges.json'),
      require('path').join(__dirname, '..', '..', 'ScapeTests', 'crystal-wyrm-rl', 'challenges.json'),
      require('path').join(home, 'ScapeTests', 'inferno-rl', 'challenges.json'),
    ];
    for (const cPath of cPaths) {
      try {
        if (require('fs').existsSync(cPath)) {
          res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' });
          res.end(require('fs').readFileSync(cPath, 'utf-8'));
          return;
        }
      } catch {}
    }
    res.writeHead(200, { 'Content-Type': 'application/json' }); res.end('{}'); return;
  }

  // Save flagged tick ranges
  if (req.url === '/flag-tick' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        const flagDir = require('path').join(process.env.HOME || process.env.USERPROFILE || '', 'ScapeTests', 'inferno-rl', 'flags');
        require('fs').mkdirSync(flagDir, { recursive: true });
        const name = 'flag_' + Date.now() + '.json';
        require('fs').writeFileSync(require('path').join(flagDir, name), body);
        res.writeHead(200); res.end('ok');
      } catch { res.writeHead(500); res.end('error'); }
    });
    return;
  }

  // Total attempts — session (from challenges.json)
  if (req.url === '/total-attempts') {
    const cPath = require('path').join(process.env.HOME || process.env.USERPROFILE || '', 'ScapeTests', 'inferno-rl', 'challenges.json');
    try {
      const data = JSON.parse(require('fs').readFileSync(cPath, 'utf-8'));
      const total = Object.values(data).reduce((sum, c) => sum + (c.attempts || 0), 0);
      res.writeHead(200, { 'Content-Type': 'text/plain', 'Cache-Control': 'no-cache' });
      res.end(String(total));
      return;
    } catch {}
    res.writeHead(200, { 'Content-Type': 'text/plain' }); res.end('0'); return;
  }

  // Lifetime attempts — all-time across all sessions
  if (req.url === '/lifetime-attempts') {
    const lPath = require('path').join(process.env.HOME || process.env.USERPROFILE || '', 'ScapeTests', 'inferno-rl', 'lifetime_attempts.txt');
    try {
      res.writeHead(200, { 'Content-Type': 'text/plain', 'Cache-Control': 'no-cache' });
      res.end(require('fs').readFileSync(lPath, 'utf-8').trim());
      return;
    } catch {}
    res.writeHead(200, { 'Content-Type': 'text/plain' }); res.end('0'); return;
  }

  // Serve saved replay by ID (e.g. /replay/A3X9K2)
  const replayMatch = req.url.match(/^\/replay\/([A-Z0-9]+)$/);
  if (replayMatch) {
    const replayPath = require('path').join(process.env.HOME || process.env.USERPROFILE || '', 'ScapeTests', 'inferno-rl', 'replays', `${replayMatch[1]}.log`);
    if (require('fs').existsSync(replayPath)) {
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache', 'Access-Control-Allow-Origin': '*' });
      res.end(require('fs').readFileSync(replayPath, 'utf-8'));
      return;
    }
    res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end('Replay not found'); return;
  }

  // List saved replays
  if (req.url === '/replays') {
    const replayDir = require('path').join(process.env.HOME || process.env.USERPROFILE || '', 'ScapeTests', 'inferno-rl', 'replays');
    try {
      const files = require('fs').readdirSync(replayDir).filter(f => f.endsWith('.log')).sort();
      const ids = files.map(f => f.replace('.log', ''));
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' });
      res.end(JSON.stringify(ids));
      return;
    } catch {}
    res.writeHead(200, { 'Content-Type': 'application/json' }); res.end('[]'); return;
  }

  // List episodes
  if (req.url === '/episodes') {
    const epDir = require('path').join(process.env.HOME || process.env.USERPROFILE || '', 'ScapeTests', 'inferno-rl', 'episodes');
    try {
      const files = require('fs').readdirSync(epDir).filter(f => f.endsWith('.log')).sort();
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' });
      res.end(JSON.stringify(files));
      return;
    } catch {}
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end('[]');
    return;
  }

  // Serve specific episode
  if (req.url.startsWith('/episode/')) {
    const name = req.url.slice(9).replace(/[^a-zA-Z0-9_.\-]/g, '');
    const epPath = require('path').join(process.env.HOME || process.env.USERPROFILE || '', 'ScapeTests', 'inferno-rl', 'episodes', name);
    if (require('fs').existsSync(epPath)) {
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' });
      res.end(require('fs').readFileSync(epPath, 'utf-8'));
      return;
    }
    res.writeHead(404); res.end('Not found');
    return;
  }

  // ── Narrator inject endpoint ──
  // For manual testing and future external triggers. Body is a single entry
  // appended to events.json. Auth via Bearer token matching NARRATOR_TOKEN env.
  if (req.url === '/api/narrator-inject' && req.method === 'POST') {
    const expected = process.env.NARRATOR_TOKEN;
    if (!expected) {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'NARRATOR_TOKEN not configured on server' }));
      return;
    }
    const auth = req.headers.authorization || '';
    const presented = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    // Constant-time comparison — prevents timing side-channels on token guess
    const crypto = require('crypto');
    const a = Buffer.from(presented);
    const b = Buffer.from(expected);
    const authed = a.length === b.length && crypto.timingSafeEqual(a, b);
    if (!authed) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'invalid bearer token' }));
      return;
    }
    let body = '';
    req.on('data', c => { body += c; if (body.length > 8192) req.destroy(); });
    req.on('end', async () => {
      try {
        const entry = JSON.parse(body);
        const narrator = require('./ai/narrator');
        await narrator.injectEntry(entry);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: e.message }));
      }
    });
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Scape — ws://localhost:2223 or open in browser');
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  sendText(ws, 'Welcome to Scape! Type `login [name]` to start.');

  ws.on('message', (data) => {
    let input = data.toString().trim();

    // /? — context-aware action suggestions
    if (input === '/?' || input === '?/') {
      const p = players.get(ws);
      if (p) {
        const suggestions = [];
        const dist = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
        const dir = (a, b) => {
          const dx = b.x - a.x, dy = b.y - a.y;
          if (dx === 0 && dy === 0) return 'here';
          let d = '';
          if (dy < 0) d += 'N'; if (dy > 0) d += 'S';
          if (dx < 0) d += 'W'; if (dx > 0) d += 'E';
          return d;
        };
        const loc = (thing) => { const d = dist(p, thing); return d === 0 ? 'here' : `${d} tiles ${dir(p, thing)}`; };
        const nearNpcs = npcs.getNpcsNear(p.x, p.y, 10, p.layer);
        const nearObjs = objects.getObjectsNear(p.x, p.y, 10, p.layer).filter(o => !o.depleted);
        const nearItems = groundItems.filter(i => Math.abs(i.x - p.x) <= 3 && Math.abs(i.y - p.y) <= 3 && i.layer === p.layer);

        // Ground items
        for (const i of nearItems) {
          const d = Math.max(Math.abs(i.x - p.x), Math.abs(i.y - p.y));
          suggestions.push({ cmd: `pickup ${i.name.toLowerCase()}`, desc: `pickup(${i.name} x${i.count}, ${d === 0 ? 'here' : loc(i)})`, dist: d });
        }
        // Urgent
        if (p.combatTarget) suggestions.push({ cmd: 'flee', desc: 'flee(stop fighting)', dist: 0 });
        if (p.hp < p.maxHp) suggestions.push({ cmd: 'eat', desc: `eat(heal, HP ${p.hp}/${p.maxHp})`, dist: 0 });
        // NPCs
        for (const n of nearNpcs) {
          if (n.dead) continue;
          const d = dist(p, n);
          const l = loc(n);
          if (n.combat > 0) suggestions.push({ cmd: `attack ${n.name.toLowerCase()}`, desc: `attack(${n.name} lvl ${n.combat}, ${l})`, dist: d });
          if (n.dialogue || n.combat === 0) suggestions.push({ cmd: `talk ${n.name.toLowerCase()}`, desc: `talk(${n.name}, ${l})`, dist: d });
          const npcDef = npcs.npcDefs.get(n.defId);
          if (npcDef?.thieving) suggestions.push({ cmd: `pickpocket ${n.name.toLowerCase()}`, desc: `pickpocket(${n.name}, ${l})`, dist: d });
        }
        // Objects
        for (const o of nearObjs) {
          const d = dist(p, o);
          const l = loc(o);
          if (o.skill === 'woodcutting') suggestions.push({ cmd: `chop ${o.name.toLowerCase()}`, desc: `chop(${o.name}, ${l})`, dist: d });
          else if (o.skill === 'mining') suggestions.push({ cmd: `mine ${o.name.toLowerCase()}`, desc: `mine(${o.name}, ${l})`, dist: d });
          else if (o.skill === 'fishing') suggestions.push({ cmd: `fish ${o.name.toLowerCase()}`, desc: `fish(${o.name}, ${l})`, dist: d });
          else if (o.name.toLowerCase().includes('bank')) suggestions.push({ cmd: 'bank', desc: `bank(open bank, ${l})`, dist: d });
          else if (o.name.toLowerCase().includes('range') || o.name.toLowerCase().includes('cooking')) suggestions.push({ cmd: 'cook', desc: `cook(cooking range, ${l})`, dist: d });
          else if (o.name.toLowerCase().includes('furnace')) suggestions.push({ cmd: 'smelt', desc: `smelt(furnace, ${l})`, dist: d });
          else if (o.name.toLowerCase().includes('anvil')) suggestions.push({ cmd: 'smith', desc: `smith(anvil, ${l})`, dist: d });
          else if (o.name.toLowerCase().includes('altar')) suggestions.push({ cmd: 'pray at altar', desc: `pray(altar, ${l})`, dist: d });
          else if (o.name.toLowerCase().includes('stair')) suggestions.push({ cmd: 'climbup', desc: `climb(${o.name}, ${l})`, dist: d });
          else if (o.product) suggestions.push({ cmd: `pick ${o.name.toLowerCase()}`, desc: `pick(${o.name}, ${l})`, dist: d });
          else suggestions.push({ cmd: `examine ${o.name.toLowerCase()}`, desc: `examine(${o.name}, ${l})`, dist: d });
        }

        // Sort by distance (closest first), then deduplicate and limit
        suggestions.sort((a, b) => a.dist - b.dist);
        const seen = new Set();
        const unique = suggestions.filter(s => { if (seen.has(s.cmd)) return false; seen.add(s.cmd); return true; }).slice(0, 9);

        if (!unique.length) {
          sendText(ws, 'Nothing interesting to do here. Try `look` or `nearby`.');
        } else {
          p._suggestions = unique;
          let out = '── What would you like to do? ──\n';
          unique.forEach((s, i) => { out += `  [${i + 1}] ${s.desc}\n`; });
          out += '\nType a number to execute, or any command.';
          sendText(ws, out);
        }
        return;
      }
    }

    // Number selection — grid actions (1-8) or /? suggestions (1-9)
    const p_check = players.get(ws);
    if (p_check && /^[1-9]$/.test(input)) {
      // Grid actions (surrounding interactions)
      if (p_check._gridActions && p_check._gridActions[input]) {
        const cmd = p_check._gridActions[input];
        sendText(ws, `> ${cmd}`);
        const result = commands.execute(p_check, cmd);
        if (result && !result.unknown) sendText(ws, result);
        return;
      }
      // /? suggestions
      if (p_check._suggestions) {
        const idx = parseInt(input) - 1;
        if (idx < p_check._suggestions.length) {
          const cmd = p_check._suggestions[idx].cmd;
          p_check._suggestions = null;
          sendText(ws, `> ${cmd}`);
          const result = commands.execute(p_check, cmd);
          if (result && !result.unknown) sendText(ws, result);
          return;
        }
      }
    }
    if (p_check) p_check._suggestions = null;

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
      if (!parsed || (parsed.verb !== 'login' && parsed.verb !== 'register')) {
        sendText(ws, 'Please type: login [name] [password] or register [name] [password]');
        return;
      }
      const name = parsed.args[0];
      const password = parsed.args[1];
      if (!name || !password) {
        sendText(ws, parsed.verb === 'register'
          ? 'Usage: register [name] [password]'
          : 'Usage: login [name] [password]');
        return;
      }
      if (name.length < 2 || name.length > 20) { sendText(ws, 'Name must be 2-20 characters.'); return; }
      if (password.length < 3) { sendText(ws, 'Password must be at least 3 characters.'); return; }

      const bcrypt = require('bcrypt');
      const authFile = `auth/${name.toLowerCase()}.json`;
      const authData = persistence.load(authFile);

      if (parsed.verb === 'register') {
        if (authData) { sendText(ws, `Account "${name}" already exists. Use: login ${name} [password]`); return; }
        const hash = bcrypt.hashSync(password, 10);
        persistence.save(authFile, { name, hash, created: Date.now() });
        sendText(ws, `Account "${name}" created!`);
        // Fall through to login
      } else {
        // Login
        if (!authData) { sendText(ws, `No account "${name}". Use: register ${name} [password]`); return; }
        if (!bcrypt.compareSync(password, authData.hash)) { sendText(ws, 'Wrong password.'); return; }
      }

      const existing = playersByName.get(name.toLowerCase());
      if (existing) {
        if (existing.httpOnly || !existing.connected) {
          playersByName.delete(name.toLowerCase());
        } else {
          sendText(ws, `"${name}" is already logged in.`);
          return;
        }
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
    const result = commands.execute(p, input, ws);
    if (result && result.unknown) {
      // Try atom engine as fallback for extended mechanics
      try {
        const atomEngine = require('./atoms/atom-server');
        const atomResult = atomEngine.handleCommand(p, input);
        if (atomResult) {
          if (Array.isArray(atomResult)) atomResult.forEach(msg => sendText(ws, msg));
          else sendText(ws, atomResult);
        } else {
          sendText(ws, `Unknown command. Type \`help\` for commands, or \`? [question]\` to ask the guide.`);
        }
      } catch (e) {
        sendText(ws, `Unknown command. Type \`help\` for commands, or \`? [question]\` to ask the guide.`);
      }
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

// Load builder content from Postgres into the engine
const contentLoader = require('./engine/content-loader');
contentLoader.loadAllContent().then(() => {
  console.log('[server] Builder content loaded');
}).catch(err => {
  console.warn('[server] Builder content load skipped:', err.message);
});

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
