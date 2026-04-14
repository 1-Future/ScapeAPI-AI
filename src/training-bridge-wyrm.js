#!/usr/bin/env node
// Training Bridge — Crystal Wyrm boss fight
// Headless game engine for RL training. Communicates via stdin/stdout JSON lines.

const path = require('path');
const readline = require('readline');

const persistence = require('./engine/persistence');
const tick = require('./engine/tick');
const commands = require('./engine/commands');
const npcs = require('./world/npcs');
const tiles = require('./world/tiles');
const walls = require('./world/walls');
const combat = require('./combat/combat');
const items = require('./data/items');
const events = require('./engine/events');
const actions = require('./engine/actions');
const objects = require('./world/objects');
const player = require('./player/player');
const gameLoop = require('./game-loop');
const projectiles = require('./combat/projectiles');

// Load game data
require('./data/shops');
require('./data/recipes');
require('./data/slayer');
require('./commands/all');

// Load crystal wyrm mobs
require('./content/crystal_wyrm/mobs').registerAll();

// Load world
tiles.loadChunks();
npcs.loadNpcSpawns();
objects.loadObjects && objects.loadObjects();

// Manual tick control
let bridgePlayer = null;
let messageBuffer = [];

// Register tick phases
tick.registerPhase('preTick', 'bridge_npc_timers', (ct) => { npcs.npcTimerTick(ct); });
tick.registerPhase('npcMovement', 'bridge_npc_movement', (ct) => { npcs.npcMovementTick(ct); });
tick.onTick('bridge_movement', (ct) => { if (bridgePlayer) gameLoop.playerMovementTick(bridgePlayer, ct, (msg) => messageBuffer.push(msg)); });
tick.onTick('bridge_combat', (ct) => { if (bridgePlayer) gameLoop.playerCombatTick(bridgePlayer, ct, (msg) => messageBuffer.push(msg)); });
tick.onTick('bridge_world', (ct) => { if (bridgePlayer) gameLoop.playerWorldTick(bridgePlayer, ct, (msg) => messageBuffer.push(msg)); });

process.stderr.write('[bridge-wyrm] Loading world...\n');

// ── Player Setup — melee loadout for Crystal Wyrm ──

function createFreshPlayer() {
  const p = player.createPlayer(Date.now() % 100000, 'rl_wyrm');

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

  // Hybrid loadout — ranged primary (phases 1+3), melee switch (phase 2)
  const equip = (name) => {
    const def = items.find(name);
    if (def && def.equipSlot) {
      p.equipment[def.equipSlot] = { id: def.id, name: def.name, stats: def.stats, count: 1 };
    }
  };
  // Max ranged setup
  equip('Armadyl helmet');
  equip('Armadyl crossbow');
  equip('Crystal body');
  equip('Crystal legs');
  equip('Barrows gloves');
  equip('Pegasian boots');
  equip('Necklace of anguish');
  equip("Ava's assembler");
  const bolts = items.find('Dragon bolts (e)');
  if (bolts) p.equipment.ammo = { id: bolts.id, name: bolts.name, stats: bolts.stats, count: 500 };

  // Inventory: brews, restores, blowpipe switch
  const addItem = (name, count) => {
    const def = items.find(name);
    if (!def) return;
    for (let i = 0; i < count; i++) {
      const slot = p.inventory.findIndex(s => s === null);
      if (slot >= 0) p.inventory[slot] = { id: def.id, name: def.name, count: 1 };
    }
  };
  addItem('Saradomin brew(4)', 8);
  addItem('Super restore(4)', 8);
  addItem('Toxic blowpipe', 1);
  addItem('Rune scimitar', 1);

  return p;
}

// ── State observation ──

function getState(p) {
  const instances = require('./engine/instances');
  const inst = instances.getByPlayer(p.id);
  let bossHp = 0, bossMaxHp = 1, bossPhase = 0, addCount = 0;
  let dead = false, complete = false;
  let mobCount = 0;

  let healingAddCount = 0, pillarCount = 0, bossDist = 99, scanPhase = 'idle';

  if (inst && inst.type === 'crystal_wyrm') {
    if (inst.state === 'failed') dead = true;
    if (inst.state === 'complete') complete = true;
    const alive = npcs.getNpcsInInstance(inst.id);
    mobCount = alive.length;
    for (const npc of alive) {
      if (npc.defId === 'crystal_wyrm') {
        bossHp = npc.hp;
        bossMaxHp = npc.maxHp;
        bossPhase = npc.customState?.phase || 1;
        scanPhase = npc.customState?.scanPhase || 'idle';
        // Distance to boss center (for AoE slam awareness)
        const cx = npc.x + 2, cy = npc.y + 2;
        bossDist = Math.max(Math.abs(p.x - cx), Math.abs(p.y - cy));
      } else {
        addCount++;
        if (npc.customState?.healMode) healingAddCount++;
      }
    }
    // Count surviving pillars
    const ents = require('./world/entities').getInInstance(inst.id);
    pillarCount = ents.filter(e => e.type === 'pillar' && !e.dead).length;
  } else if (!inst) {
    dead = true;
  }

  // Threats
  const currentTick = tick.getTick();
  const threats = [];
  if (inst) {
    for (const npc of npcs.getNpcsInInstance(inst.id)) {
      if (npc.dead) continue;
      const style = npc.attackStyle || 'melee';
      const rawTick = npc.nextAttackTick === Infinity ? currentTick + 99 : (npc.nextAttackTick || currentTick + 99);
      threats.push({
        style,
        ticksToAttack: Math.max(0, rawTick - currentTick),
        maxHit: npc.maxHit || 0,
        dist: Math.max(Math.abs(npc.x - p.x), Math.abs(npc.y - p.y)),
        name: npc.name,
      });
    }
    threats.sort((a, b) => a.ticksToAttack - b.ticksToAttack || b.maxHit - a.maxHit);
  }

  // Incoming projectiles
  const incoming = [];
  const projs = projectiles.getTargeting(p.id);
  for (const proj of projs) {
    incoming.push({
      style: proj.prayerStyle || proj.type || 'unknown',
      ticksToLand: Math.max(0, (proj.landTick || 0) - currentTick),
      damage: proj.damage || 0,
    });
  }
  incoming.sort((a, b) => a.ticksToLand - b.ticksToLand);

  // Pillar health
  let pillarHpTotal = 0, pillarHpMax = 0;
  if (inst) {
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
    bossHp, bossMaxHp, bossPhase, addCount, mobCount,
    healingAddCount, pillarCount, bossDist, scanPhase,
    pillarHp: pillarHpTotal, pillarHpMax: pillarHpMax || 1,
    prayMage: p.activePrayers.has('protect_from_magic') ? 1 : 0,
    prayRange: p.activePrayers.has('protect_from_missiles') ? 1 : 0,
    prayMelee: p.activePrayers.has('protect_from_melee') ? 1 : 0,
    dead, complete,
    target: p.combatTarget ? (npcs.getNpc(p.combatTarget)?.name || '') : '',
    targetHp: p.combatTarget ? (npcs.getNpc(p.combatTarget)?.hp || 0) : 0,
    targetMaxHp: p.combatTarget ? (npcs.getNpc(p.combatTarget)?.maxHp || 0) : 0,
    tick: currentTick,
    threats: threats.slice(0, 3),
    projectiles: incoming.slice(0, 3),
  };
}

// ── Spectate data — ASCII map + JSON for live viewer ──

function getSpectateData(p) {
  const instances = require('./engine/instances');
  const entities = require('./world/entities');
  const inst = instances.getByPlayer(p.id);
  const T = tiles.T;
  const { ARENA } = require('./content/crystal_wyrm/crystal_wyrm');

  const TILE_CHARS = {
    [T.EMPTY]: 'X', [T.GRASS]: '\u00B7', [T.WATER]: '~', [T.TREE]: 'T',
    [T.PATH]: '=', [T.ROCK]: '#', [T.SAND]: 'S', [T.WALL]: '#',
    [T.FLOOR]: '.', [T.DOOR]: 'D', [T.BRIDGE]: '=',
  };
  const NPC_CHARS = {
    'crystal_wyrm': 'W',
    'crystallite': 'c',
  };

  // NPC positions
  const npcPositions = new Map();
  const nearNpcs = npcs.getNpcsNear(p.x, p.y, 20, p.layer, p.instance || undefined);
  for (const n of nearNpcs) {
    const sz = n.size || 1;
    let ch = NPC_CHARS[n.defId] || '!';
    // Crystal Wyrm phase coloring
    if (n.defId === 'crystal_wyrm' && n.customState) {
      if (n.customState.phase === 3) ch = 'E'; // Enraged
      else if (n.customState.phase === 2) ch = 'S'; // Shattered
    }
    for (let sy = 0; sy < sz; sy++) for (let sx = 0; sx < sz; sx++) {
      npcPositions.set(`${n.x+sx},${n.y+sy}`, { ...n, mapChar: ch });
    }
  }

  // Entities (pillars)
  const entityPositions = new Map();
  if (p.instance) {
    try {
      const ents = entities.getInInstance(p.instance);
      for (const e of ents) {
        if (e.dead) continue;
        const sz = e.size || 1;
        const ch = e.type === 'pillar' ? 'O' : '*';
        if (e.type === 'pillar' && sz === 2) {
          const hpStr = String(e.hp || 0).padStart(2, ' ');
          for (let sy = 0; sy < 2; sy++) for (let sx = 0; sx < 2; sx++) {
            if (sy === 1) entityPositions.set(`${e.x+sx},${e.y+sy}`, { char: hpStr[sx] });
            else entityPositions.set(`${e.x+sx},${e.y+sy}`, { char: 'O' });
          }
        } else {
          for (let sy = 0; sy < sz; sy++) for (let sx = 0; sx < sz; sx++) {
            entityPositions.set(`${e.x+sx},${e.y+sy}`, { char: ch });
          }
        }
      }
    } catch {}
  }

  // Attack range overlay
  const rangeOverlay = new Map();
  for (const n of nearNpcs) {
    if (n.dead) continue;
    const atkRange = n.attackRange || 1;
    const sz = n.size || 1;
    let style = n.attackStyle || 'melee';
    for (let dy = -atkRange - 1; dy <= sz + atkRange; dy++) {
      for (let dx = -atkRange - 1; dx <= sz + atkRange; dx++) {
        const wx = n.x + dx, wy = n.y + dy;
        let cdx = 0, cdy = 0;
        if (dx < 0) cdx = -dx;
        else if (dx >= sz) cdx = dx - sz + 1;
        if (dy < 0) cdy = -dy;
        else if (dy >= sz) cdy = dy - sz + 1;
        const dist = Math.max(cdx, cdy);
        if (dist === atkRange) {
          const key = `${wx},${wy}`;
          if (!npcPositions.has(key) && !entityPositions.has(key)) {
            rangeOverlay.set(key, style);
          }
        }
      }
    }
  }

  // Build ASCII map
  let map = '';
  for (let worldY = ARENA.minY; worldY <= ARENA.maxY; worldY++) {
    for (let worldX = ARENA.minX; worldX <= ARENA.maxX; worldX++) {
      const key = `${worldX},${worldY}`;
      if (worldX === p.x && worldY === p.y) map += '@';
      else if (npcPositions.has(key)) map += npcPositions.get(key).mapChar || '!';
      else if (entityPositions.has(key)) map += entityPositions.get(key).char;
      else if (rangeOverlay.has(key)) {
        const style = rangeOverlay.get(key);
        map += style === 'melee' ? ',' : style === 'ranged' ? ';' : ':';
      } else {
        const tile = tiles.tileAt(worldX, worldY, p.layer);
        map += TILE_CHARS[tile] || 'X';
      }
    }
    map += '\n';
  }
  map += '\nLegend: @ You  W Wyrm  E Enraged  S Shattered  c Crystallite  O Pillar';
  map += '\n        . Floor  # Wall  X Unwalkable  , melee  ; ranged  : magic';
  map += '\nArea: Crystal Heart Chamber';
  map += '\nDirs: N=Chamber|S=Chamber|E=Chamber|W=Chamber';

  // Rich JSON state for spectator HUD
  const inv = p.inventory.map(slot => slot ? { n: slot.name, c: slot.count || 1 } : null);
  const weapon = p.equipment?.weapon?.name || 'None';
  let bossHp = 0, bossMaxHp = 1, bossPhase = 0, addCount = 0;
  if (inst) {
    for (const npc of npcs.getNpcsInInstance(inst.id)) {
      if (npc.defId === 'crystal_wyrm') { bossHp = npc.hp; bossMaxHp = npc.maxHp; bossPhase = npc.customState?.phase || 1; }
      else if (!npc.dead) addCount++;
    }
  }

  const json = JSON.stringify({
    hp: p.hp, maxHp: p.maxHp,
    pp: p.prayerPoints, maxPp: 99,
    wave: bossPhase, mobCount: nearNpcs.filter(n => !n.dead).length,
    mobTypes: [...new Set(nearNpcs.filter(n => !n.dead).map(n => n.name.split(' ')[0]))],
    bossHp, bossMaxHp, bossPhase, addCount,
    prayMage: p.activePrayers.has('protect_from_magic') ? 1 : 0,
    prayRange: p.activePrayers.has('protect_from_missiles') ? 1 : 0,
    prayMelee: p.activePrayers.has('protect_from_melee') ? 1 : 0,
    prayers: [...(p.activePrayers || [])],
    dead: false, complete: false,
    tick: tick.getTick(),
    target: p.combatTarget ? (npcs.getNpc(p.combatTarget)?.name || '') : '',
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

// ── Command handler ──

let currentPlayer = null;

function drinkPotion(p, potionName) {
  const currentTick = tick.getTick();
  if (p.nextDrinkTick && currentTick < p.nextDrinkTick) return;
  const slot = p.inventory.findIndex(s => s && s.name.toLowerCase().includes(potionName));
  if (slot < 0) return;
  const item = p.inventory[slot];
  const doseMatch = item.name.match(/\((\d)\)$/);
  if (!doseMatch) return;
  const dose = parseInt(doseMatch[1]);
  if (dose > 1) {
    p.inventory[slot] = { ...item, name: item.name.replace(/\(\d\)$/, `(${dose - 1})`) };
  } else {
    p.inventory[slot] = { id: 325, name: 'Vial', count: 1 };
  }
  if (potionName.includes('saradomin brew')) {
    p.hp = Math.min(p.maxHp, p.hp + 16);
  } else if (potionName.includes('super restore')) {
    p.prayerPoints = Math.min(99, p.prayerPoints + 32);
  }
  p.nextDrinkTick = currentTick + 3;
}

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

    // Start Crystal Wyrm instance
    const crystalWyrm = require('./content/crystal_wyrm/crystal_wyrm');
    crystalWyrm.startCrystalWyrm(currentPlayer, (msg) => messageBuffer.push(msg));

    // Activate protection prayers
    currentPlayer.activePrayers.add('protect_from_missiles'); // Phase 1 is ranged
    currentPlayer.activePrayers.add('piety'); // Melee boost

    return { type: 'state', ...getState(currentPlayer) };
  }

  if (cmd.type === 'step') {
    const p = currentPlayer;
    if (!p) return { type: 'error', msg: 'no player' };

    const actionId = cmd.action || 0;
    const ticks = cmd.ticks || 4;
    const inst = require('./engine/instances').getByPlayer(p.id);
    const alive = inst ? npcs.getNpcsInInstance(inst.id) : [];

    // Auto-target nearest alive mob and ensure we're fighting
    if (!p.combatTarget || !npcs.getNpc(p.combatTarget) || npcs.getNpc(p.combatTarget).dead) {
      const sorted = [...alive].sort((a, b) =>
        Math.max(Math.abs(a.x - p.x), Math.abs(a.y - p.y)) -
        Math.max(Math.abs(b.x - p.x), Math.abs(b.y - p.y)));
      if (sorted[0]) { p.combatTarget = sorted[0].id; p.busy = true; }
    }
    // Always ensure busy flag is set so combat ticks fire
    if (p.combatTarget && npcs.getNpc(p.combatTarget) && !npcs.getNpc(p.combatTarget).dead) {
      p.busy = true;
    }

    // 13 actions: null, brew, restore, move(4), target boss, target adds, pray mage, pray range, pray melee, equip fang, equip scimitar
    const rlActions = {
      0: null, // no action
      1: () => drinkPotion(p, 'saradomin brew'),
      2: () => drinkPotion(p, 'super restore'),
      3: () => commands.execute(p, 'n'),
      4: () => commands.execute(p, 's'),
      5: () => commands.execute(p, 'e'),
      6: () => commands.execute(p, 'w'),
      7: () => { // Target boss specifically
        const boss = alive.find(n => n.defId === 'crystal_wyrm' && !n.dead);
        if (boss) { p.combatTarget = boss.id; p.busy = true; }
      },
      8: () => { // Target nearest add
        const adds = alive.filter(n => n.defId === 'crystallite' && !n.dead)
          .sort((a, b) => Math.max(Math.abs(a.x - p.x), Math.abs(a.y - p.y)) -
                          Math.max(Math.abs(b.x - p.x), Math.abs(b.y - p.y)));
        if (adds[0]) { p.combatTarget = adds[0].id; p.busy = true; }
      },
      9: () => { // Protect from magic
        if (p.prayerPoints <= 0) return;
        p.activePrayers.delete('protect_from_missiles');
        p.activePrayers.delete('protect_from_melee');
        p.activePrayers.add('protect_from_magic');
      },
      10: () => { // Protect from missiles (ranged)
        if (p.prayerPoints <= 0) return;
        p.activePrayers.delete('protect_from_magic');
        p.activePrayers.delete('protect_from_melee');
        p.activePrayers.add('protect_from_missiles');
      },
      11: () => { // Protect from melee
        if (p.prayerPoints <= 0) return;
        p.activePrayers.delete('protect_from_magic');
        p.activePrayers.delete('protect_from_missiles');
        p.activePrayers.add('protect_from_melee');
      },
      12: () => commands.execute(p, 'equip rune scimitar'), // Melee switch for phase 2
    };
    if (rlActions[actionId]) rlActions[actionId]();

    // Re-assert combat state — actions should not interrupt combat
    if (p.combatTarget && npcs.getNpc(p.combatTarget) && !npcs.getNpc(p.combatTarget).dead) {
      p.busy = true;
    }

    // Advance ticks
    messageBuffer = [];
    for (let i = 0; i < ticks; i++) {
      tick.processTick();
      if (p.hp <= 0) break;
    }

    const state = { type: 'state', ...getState(p), messages: messageBuffer.length };
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

process.stderr.write('[bridge-wyrm] Ready — Crystal Wyrm training bridge\n');
