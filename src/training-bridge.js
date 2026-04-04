#!/usr/bin/env node
// Training Bridge — headless game engine for RL training
// Communicates via stdin/stdout JSON lines
// No WebSocket, no HTTP, no network latency

const path = require('path');
const readline = require('readline');

const persistence = require('./engine/persistence');

const tick = require('./engine/tick');
const commands = require('./engine/commands');
const npcs = require('./world/npcs');
const tiles = require('./world/tiles');
const walls = require('./world/walls');
const pathfinding = require('./world/pathfinding');
const combat = require('./combat/combat');
const items = require('./data/items');
const events = require('./engine/events');
const actions = require('./engine/actions');
const objects = require('./world/objects');
const player = require('./player/player');
const gameLoop = require('./game-loop');

// Load game data
require('./data/shops');
require('./data/recipes');
require('./data/slayer');

// Load inferno mobs
require('./content/inferno/mobs').registerAll();

// Load world tiles + NPCs
tiles.loadChunks();
npcs.loadNpcSpawns();
objects.loadObjects && objects.loadObjects();

// Don't auto-tick — we drive ticks manually
// Register tick phases that the server normally registers
const serverPath = path.join(__dirname, 'server.js');

// We need the core server functions but can't load the full server (it starts HTTP)
// Instead, register the essential tick handlers manually

// Movement tick for players
tick.onTick('movement', (currentTick) => {
  // Player movement handled inline in step
});

// NPC ticks are registered by npcs module
// Instance ticks are registered by instances module

let currentPlayer = null;
let currentWs = null; // fake ws

// Register game loop tick handlers for the bridge player
let bridgePlayer = null;
let bridgeSendFn = (msg) => messageBuffer.push(msg);

// Register NPC ticks into proper phases (must run BEFORE instanceTick)
tick.registerPhase('preTick', 'bridge_npc_timers', (ct) => {
  npcs.npcTimerTick(ct);  // NPC cooldowns, custom onTick (blob scan phases)
});
tick.registerPhase('npcMovement', 'bridge_npc_movement', (ct) => {
  npcs.npcMovementTick(ct);  // NPC pathfinding
});
tick.onTick('bridge_movement', (ct) => {
  if (bridgePlayer) gameLoop.playerMovementTick(bridgePlayer, ct, bridgeSendFn);
});
tick.onTick('bridge_combat', (ct) => {
  if (bridgePlayer) gameLoop.playerCombatTick(bridgePlayer, ct, bridgeSendFn);
});
tick.onTick('bridge_world', (ct) => {
  if (bridgePlayer) gameLoop.playerWorldTick(bridgePlayer, ct, bridgeSendFn);
});

process.stderr.write('[bridge] Loading world...\n');

// Fake sendText that collects messages
let messageBuffer = [];
function sendText(ws, text) {
  messageBuffer.push(text);
}

// Create a fresh player with inferno loadout
function createFreshPlayer() {
  const p = player.createPlayer(Date.now() % 100000, 'rl_bot');

  // Max stats
  const SKILLS = ['attack','strength','defence','hitpoints','ranged','magic','prayer',
    'runecrafting','construction','agility','herblore','thieving','crafting',
    'fletching','slayer','hunter','mining','smithing','fishing','cooking',
    'firemaking','woodcutting','farming'];
  for (const skill of SKILLS) {
    p.skills[skill] = { level: 99, xp: 13034431 };
  }
  p.hp = 99; p.maxHp = 99;
  p.prayerPoints = 99;
  p.admin = true;
  p.activePrayers = new Set();
  p.running = false;
  p.runEnergy = 10000;
  p.inventory = new Array(28).fill(null);
  p.equipment = {};
  p.boosts = {};
  p.path = [];
  p.combatTarget = null;
  p.busy = false;
  p.autoRetaliate = true;

  // Equip gear
  const equip = (name) => {
    const def = items.find(name);
    if (def && def.equipSlot) {
      p.equipment[def.equipSlot] = { id: def.id, name: def.name, stats: def.stats, count: 1 };
    }
  };
  equip('Armadyl helmet');
  equip("Ava's assembler");
  equip('Necklace of anguish');
  equip('Armadyl crossbow');
  equip('Crystal body');
  equip('Crystal shield');
  equip('Crystal legs');
  equip('Barrows gloves');
  equip('Pegasian boots');
  equip('Archers ring (i)');
  // Equip bolts
  const bolts = items.find('Dragon bolts (e)');
  if (bolts) p.equipment.ammo = { id: bolts.id, name: bolts.name, stats: bolts.stats, count: 500 };

  // Inventory
  const addItem = (name, count) => {
    const def = items.find(name);
    if (!def) return;
    for (let i = 0; i < count; i++) {
      const slot = p.inventory.findIndex(s => s === null);
      if (slot >= 0) p.inventory[slot] = { id: def.id, name: def.name, count: 1 };
    }
  };
  addItem('Saradomin brew(4)', 6);
  addItem('Super restore(4)', 12);
  addItem('Bastion potion(4)', 2);
  addItem('Stamina potion(4)', 1);
  addItem('Toxic blowpipe', 1);
  addItem('Kodai wand', 1);
  addItem('Occult necklace', 1);
  addItem("Ahrim's robe top", 1);
  addItem("Ahrim's robe bottom", 1);
  // Stackable runes
  const addStack = (name, count) => {
    const def = items.find(name);
    if (!def) return;
    const slot = p.inventory.findIndex(s => s === null);
    if (slot >= 0) p.inventory[slot] = { id: def.id, name: def.name, count, stackable: true };
  };
  addStack('Blood rune', 8000);
  addStack('Death rune', 8000);

  return p;
}

// Build state JSON (same as rl command)
function getState(p) {
  const npcMod = npcs;
  const inst = require('./engine/instances').getByPlayer(p.id);
  let wave = 0, mobCount = 0, mobTypes = [], dead = false, complete = false;

  if (inst && inst.type === 'inferno') {
    wave = inst.currentWave;
    if (inst.state === 'failed') dead = true;
    if (inst.state === 'complete') complete = true;
    const alive = npcMod.getNpcsInInstance(inst.id);
    mobCount = alive.length;
    for (const npc of alive) {
      const n = npc.name.split(' ')[0];
      if (!mobTypes.includes(n)) mobTypes.push(n);
    }
  } else if (!inst) {
    dead = true;
  }

  // Build threat list — sorted by danger (maxHit * proximity)
  const currentTick = tick.getTick();
  const threats = [];
  if (inst) {
    const aliveNpcs = npcMod.getNpcsInInstance(inst.id);
    for (const npc of aliveNpcs) {
      if (npc.dead) continue;
      const style = npc.attackStyle || 'melee';
      const rawTick = npc.nextAttackTick === Infinity ? currentTick + 99 : (npc.nextAttackTick || currentTick + 99);
      const ticksToAttack = Math.max(0, rawTick - currentTick);
      threats.push({
        style,
        ticksToAttack,
        maxHit: npc.maxHit || 0,
        dist: Math.max(Math.abs(npc.x - p.x), Math.abs(npc.y - p.y)),
        name: npc.name,
      });
    }
    // Sort by soonest attack, then by maxHit
    threats.sort((a, b) => a.ticksToAttack - b.ticksToAttack || b.maxHit - a.maxHit);
  }

  // Get incoming projectiles targeting the player
  const projectilesMod = require('./combat/projectiles');
  const incoming = [];
  const projs = projectilesMod.getTargeting(p.id);
  for (const proj of projs) {
    incoming.push({
      style: proj.prayerStyle || proj.type || 'unknown',
      ticksToLand: Math.max(0, (proj.landTick || 0) - currentTick),
      damage: proj.damage || 0,
    });
  }
  incoming.sort((a, b) => a.ticksToLand - b.ticksToLand);

  // Count nibblers and pillar health
  let nibCount = 0, pillarHpTotal = 0, pillarHpMax = 0;
  if (inst) {
    for (const npc of npcMod.getNpcsInInstance(inst.id)) {
      if (!npc.dead && npc.defId === 'jal_nib') nibCount++;
    }
    const ents = require('./world/entities').getInInstance(inst.id);
    for (const e of ents) {
      if (e.type === 'pillar' && !e.dead) {
        pillarHpTotal += e.hp;
        pillarHpMax += e.maxHp;
      }
    }
  }

  return {
    hp: p.hp, maxHp: p.maxHp,
    pp: p.prayerPoints, maxPp: 99,
    wave, mobCount, mobTypes, nibCount,
    pillarHp: pillarHpTotal, pillarHpMax: pillarHpMax || 1,
    prayMage: p.activePrayers.has('protect_from_magic') ? 1 : 0,
    prayRange: p.activePrayers.has('protect_from_missiles') ? 1 : 0,
    prayMelee: p.activePrayers.has('protect_from_melee') ? 1 : 0,
    dead, complete,
    target: p.combatTarget ? (npcMod.getNpc(p.combatTarget)?.name || '') : '',
    targetHp: p.combatTarget ? (npcMod.getNpc(p.combatTarget)?.hp || 0) : 0,
    targetMaxHp: p.combatTarget ? (npcMod.getNpc(p.combatTarget)?.maxHp || 0) : 0,
    tick: currentTick,
    threats: threats.slice(0, 3),
    projectiles: incoming.slice(0, 3),
    _debug: threats.slice(0, 3).map(t => `${t.name} style=${t.style} tta=${t.ticksToAttack} dist=${t.dist}`),
  };
}

// Generate ASCII map + rich JSON for spectator (matches server rl command output)
function getSpectateData(p) {
  const inst = require('./engine/instances').getByPlayer(p.id);
  const entities = require('./world/entities');
  const T = tiles.T;
  const { ARENA } = require('./content/inferno/waves');

  const TILE_CHARS = {
    [T.EMPTY]: 'X', [T.GRASS]: '\u00B7', [T.WATER]: '~', [T.TREE]: 'T',
    [T.PATH]: '=', [T.ROCK]: '#', [T.SAND]: 'S', [T.WALL]: '#',
    [T.FLOOR]: '.', [T.DOOR]: 'D', [T.BRIDGE]: '=', [T.FISH_SPOT]: '~',
    [T.FLOWER]: ',', [T.BUSH]: 'b', [T.DARK_GRASS]: '\u00B7', [T.SNOW]: '*',
    [T.LAVA]: '!', [T.SWAMP]: '%',
  };
  const NPC_CHARS = {
    'jal_nib': 'n', 'jal_mejrah': 'b', 'jal_ak': 'o', 'jal_imkot': 'k',
    'jal_xil': 'r', 'jal_zek': 'M', 'jal_tok_jad': 'J', 'tzkal_zuk': 'Z',
    'yt_hur_kot': 'h', 'jal_mej_jak': 'H',
    'jal_ak_rek_xil': 'x', 'jal_ak_rek_mej': 'j', 'jal_ak_rek_ket': 'q',
  };

  // Collect NPC positions
  const npcPositions = new Map();
  const RANGE = 30;
  const nearNpcs = npcs.getNpcsNear(p.x, p.y, RANGE, p.layer, p.instance || undefined);
  for (const n of nearNpcs) {
    const sz = n.size || 1;
    let ch = NPC_CHARS[n.defId] || '!';
    // Blob state coloring: idle=o, scanning/attacking ranged=G (green), scanning/attacking magic=B (blue)
    if (n.defId === 'jal_ak' && n.customState) {
      if (n.customState.phase === 'scanning' || n.customState.phase === 'attacking') {
        if (n.customState.scanResult === 'magic') ch = 'G'; // Scanned mage prayer → will attack ranged (green)
        else if (n.customState.scanResult === 'ranged') ch = 'B'; // Scanned range prayer → will attack magic (blue)
        else ch = 'o'; // No prayer scanned
      }
    }
    for (let sy = 0; sy < sz; sy++) for (let sx = 0; sx < sz; sx++) {
      npcPositions.set(`${n.x+sx},${n.y+sy}`, { ...n, mapChar: ch });
    }
  }

  // Instance entities (pillars, shield)
  const entityPositions = new Map();
  if (p.instance) {
    try {
      const ents = entities.getInInstance(p.instance);
      for (const e of ents) {
        if (e.dead) continue;
        const sz = e.size || 1;
        const ch = e.type === 'pillar' ? 'O' : e.type === 'shield' ? '=' : '*';
        if (e.type === 'pillar' && sz === 3) {
          // Middle row shows HP (3 chars, right-aligned)
          const hpStr = String(e.hp || 0).padStart(3, ' ');
          for (let sy = 0; sy < 3; sy++) for (let sx = 0; sx < 3; sx++) {
            if (sy === 1) {
              entityPositions.set(`${e.x+sx},${e.y+sy}`, { char: hpStr[sx] });
            } else {
              entityPositions.set(`${e.x+sx},${e.y+sy}`, { char: 'O' });
            }
          }
        } else {
          for (let sy = 0; sy < sz; sy++) for (let sx = 0; sx < sz; sx++) {
            entityPositions.set(`${e.x+sx},${e.y+sy}`, { char: ch });
          }
        }
      }
    } catch {}
  }

  // Build attack range overlay — tiles on the EDGE of each mob's attack range
  const rangeOverlay = new Map(); // key → 'melee' | 'ranged' | 'magic'
  for (const n of nearNpcs) {
    if (n.dead) continue;
    const atkRange = n.attackRange || 1;
    const sz = n.size || 1;
    // Blob radius color follows its scan state (what it's about to attack with)
    let style = n.attackStyle || 'melee';
    if (n.defId === 'jal_ak' && n.customState) {
      if (n.customState.scanResult === 'magic') style = 'ranged';   // Scanned mage → attacks ranged
      else if (n.customState.scanResult === 'ranged') style = 'magic'; // Scanned range → attacks magic
    }
    // Mark edge tiles of attack range (chebyshev distance == atkRange from hitbox)
    for (let dy = -atkRange - 1; dy <= sz + atkRange; dy++) {
      for (let dx = -atkRange - 1; dx <= sz + atkRange; dx++) {
        const wx = n.x + dx, wy = n.y + dy;
        // Distance from this tile to closest tile on NPC hitbox
        let cdx = 0, cdy = 0;
        if (dx < 0) cdx = -dx;
        else if (dx >= sz) cdx = dx - sz + 1;
        if (dy < 0) cdy = -dy;
        else if (dy >= sz) cdy = dy - sz + 1;
        const dist = Math.max(cdx, cdy);
        // Only mark the edge (exactly at attack range)
        if (dist === atkRange) {
          const key = `${wx},${wy}`;
          if (!npcPositions.has(key) && !entityPositions.has(key)) {
            rangeOverlay.set(key, style);
          }
        }
      }
    }
  }

  // Build ASCII map — full arena bounds, no wasted X tiles
  let map = '';
  for (let worldY = ARENA.minY; worldY <= ARENA.maxY; worldY++) {
    for (let worldX = ARENA.minX; worldX <= ARENA.maxX; worldX++) {
      const key = `${worldX},${worldY}`;
      if (worldX === p.x && worldY === p.y) {
        map += '@';
      } else if (npcPositions.has(key)) {
        map += npcPositions.get(key).mapChar || '!';
      } else if (entityPositions.has(key)) {
        map += entityPositions.get(key).char;
      } else if (rangeOverlay.has(key)) {
        const style = rangeOverlay.get(key);
        // Melee range = red dot, ranged = green dot, magic = blue dot
        map += style === 'melee' ? ',' : style === 'ranged' ? ';' : ':';
      } else {
        const tile = tiles.tileAt(worldX, worldY, p.layer);
        map += TILE_CHARS[tile] || 'X';
      }
    }
    map += '\n';
  }
  map += '\nLegend: @ You  ! NPC  ? Object  P Player  # Wall/Rock  T Tree';
  map += '\n        ~ Water  . Grass/Floor  = Path  S Sand  D Door  X Unwalkable';
  map += '\nArea: The Inferno';
  map += '\nDirs: N=The Inferno|S=The Inferno|E=The Inferno|W=The Inferno';

  // Rich JSON state
  const prayers = p.activePrayers ? [...p.activePrayers] : [];
  let targetName = '';
  if (p.combatTarget) {
    const tgt = npcs.getNpc(p.combatTarget);
    if (tgt && !tgt.dead) targetName = tgt.name;
  }
  const inv = p.inventory.map(slot => slot ? { n: slot.name, c: slot.count || 1 } : null);
  const weapon = p.equipment?.weapon?.name || 'None';
  let wave = 0, mobCount = 0, mobTypes = [];
  if (inst && inst.type === 'inferno') {
    wave = inst.currentWave;
    const alive = npcs.getNpcsInInstance(inst.id);
    mobCount = alive.length;
    for (const npc of alive) {
      const n = npc.name.split(' ')[0];
      if (!mobTypes.includes(n)) mobTypes.push(n);
    }
  }

  const json = JSON.stringify({
    hp: p.hp, maxHp: p.maxHp,
    pp: p.prayerPoints, maxPp: 99,
    wave, mobCount, mobTypes,
    prayMage: p.activePrayers.has('protect_from_magic') ? 1 : 0,
    prayRange: p.activePrayers.has('protect_from_missiles') ? 1 : 0,
    prayMelee: p.activePrayers.has('protect_from_melee') ? 1 : 0,
    prayers,
    dead: false, complete: false,
    tick: tick.getTick(),
    target: targetName,
    targetHp: p.combatTarget ? (npcs.getNpc(p.combatTarget)?.hp || 0) : 0,
    targetMaxHp: p.combatTarget ? (npcs.getNpc(p.combatTarget)?.maxHp || 0) : 0,
    weapon,
    stats: { atk: 99, str: 99, def: 99, rng: 99, mag: 99, base: { atk: 99, str: 99, def: 99, rng: 99, mag: 99 } },
    run: 100,
    inv,
    invUsed: inv.filter(s => s).length,
  });

  return map + '\n' + json;
}

// Process commands from Python
function handleCommand(cmd) {
  if (cmd.type === 'reset') {
    // Clean up old instance
    if (currentPlayer) {
      const inst = require('./engine/instances').getByPlayer(currentPlayer.id);
      if (inst) require('./engine/instances').destroy(inst.id);
    }

    currentPlayer = createFreshPlayer();
    bridgePlayer = currentPlayer;
    messageBuffer = [];

    // Start inferno challenge
    const inferno = require('./content/inferno/inferno');
    const challenge = cmd.challenge || 'full';
    const challenges = {
      full: { startWave: 1, endWave: 69 },  // Full inferno run
      wave35: { startWave: 35, endWave: 35 },
      wave63: { startWave: 63, endWave: 63 },
      jads: { startWave: 68, endWave: 68 },
      zuk: { startWave: 69, endWave: 69 },
      gauntlet: { startWave: 63, endWave: 69 },
    };
    const cfg = challenges[challenge] || challenges.full;
    cfg.challenge = challenge;
    inferno.startInferno(currentPlayer, (msg) => messageBuffer.push(msg), cfg);

    // Activate prayers
    currentPlayer.activePrayers.add('protect_from_magic');
    currentPlayer.activePrayers.add('rigour');

    return { type: 'state', ...getState(currentPlayer) };
  }

  if (cmd.type === 'step') {
    const p = currentPlayer;
    if (!p) return { type: 'error', msg: 'no player' };

    const actionId = cmd.action || 0;
    const ticks = cmd.ticks || 4;
    const alive = [];
    const inst = require('./engine/instances').getByPlayer(p.id);
    if (inst) {
      const a = npcs.getNpcsInInstance(inst.id);
      alive.push(...a);
    }

    // NO hardcoded behavior — the RL agent controls everything:
    // prayer switching, eating, restoring, movement, targeting, weapons

    // Auto-target nearest
    if (!p.combatTarget || !npcs.getNpc(p.combatTarget) || npcs.getNpc(p.combatTarget).dead) {
      const sorted = [...alive].sort((a, b) => {
        return Math.max(Math.abs(a.x - p.x), Math.abs(a.y - p.y)) -
               Math.max(Math.abs(b.x - p.x), Math.abs(b.y - p.y));
      });
      if (sorted[0]) { p.combatTarget = sorted[0].id; p.busy = true; }
    }

    // Execute RL action
    const rlActions = {
      0: null,
      1: () => commands.execute(p, 'drink saradomin brew'),
      2: () => commands.execute(p, 'drink super restore'),
      3: () => commands.execute(p, 'n'),
      4: () => commands.execute(p, 's'),
      5: () => commands.execute(p, 'e'),
      6: () => commands.execute(p, 'w'),
      7: () => {
        const sorted = [...alive].sort((a, b) =>
          Math.max(Math.abs(a.x - p.x), Math.abs(a.y - p.y)) -
          Math.max(Math.abs(b.x - p.x), Math.abs(b.y - p.y)));
        if (sorted[0]) { p.combatTarget = sorted[0].id; p.busy = true; }
      },
      8: () => commands.execute(p, 'equip toxic blowpipe'),
      9: () => commands.execute(p, 'equip armadyl crossbow'),
      10: () => {
        if (p.prayerPoints <= 0) return; // Can't pray at 0 PP
        p.activePrayers.delete('protect_from_missiles');
        p.activePrayers.delete('protect_from_melee');
        p.activePrayers.add('protect_from_magic');
      },
      11: () => {
        if (p.prayerPoints <= 0) return;
        p.activePrayers.delete('protect_from_magic');
        p.activePrayers.delete('protect_from_melee');
        p.activePrayers.add('protect_from_missiles');
      },
      12: () => {
        if (p.prayerPoints <= 0) return;
        p.activePrayers.delete('protect_from_magic');
        p.activePrayers.delete('protect_from_missiles');
        p.activePrayers.add('protect_from_melee');
      },
    };
    if (rlActions[actionId]) rlActions[actionId]();

    // Advance ticks (stop early if player dies)
    messageBuffer = [];
    for (let i = 0; i < ticks; i++) {
      tick.processTick();
      if (p.hp <= 0) break;
    }

    const state = { type: 'state', ...getState(p), messages: messageBuffer.length };
    // Include spectate data if requested (for live viewer)
    if (cmd.spectate) state.spectate = getSpectateData(p);
    return state;
  }

  return { type: 'error', msg: 'unknown: ' + cmd.type };
}

// stdin/stdout JSON line protocol
const rl = readline.createInterface({ input: process.stdin, terminal: false });
rl.on('line', (line) => {
  try {
    const cmd = JSON.parse(line);
    const result = handleCommand(cmd);
    process.stdout.write(JSON.stringify(result) + '\n');
  } catch (e) {
    process.stdout.write(JSON.stringify({ type: 'error', msg: e.message }) + '\n');
  }
});

process.stderr.write('[bridge] Ready — waiting for commands on stdin\n');
