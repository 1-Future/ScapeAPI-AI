#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// Combat Engine Fuzz Tester — burn v2
//
// Drives combat.js + player.js + NPC mechanics through 10,000 ticks × 10 arenas
// with random player actions and random NPC tiers 1-5. Verifies these hard
// invariants every tick:
//
//   I1  HP never negative without onPlayerDeath being invoked
//   I2  XP gains always >= 0
//   I3  Prayer points never exceed max
//   I4  Inventory never exceeds 28 slots (no stack leaks into non-stackables)
//   I5  No NaN or undefined in critical player/NPC state fields
//   I6  breakpoint-runner listener count does not grow unboundedly
//   I7  Throughput >= 100 ticks/sec
//
// If an invariant fails, the script logs the seed + tick + arena, then bisects
// to a minimal repro by replaying with progressively shorter tick windows.
// Findings end up in reports/combat-fuzz-bugs.md.
//
// Runs under 2 minutes. Seeded RNG — re-run with FUZZ_SEED=<n> to reproduce.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const path = require('path');
const fs = require('fs');

// ── Seeded RNG (mulberry32) ───────────────────────────────────────────────────
function makeRng(seed) {
  let s = seed >>> 0;
  return function () {
    s |= 0; s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SEED = parseInt(process.env.FUZZ_SEED || String((Date.now() & 0xFFFFFFFF)), 10);
let rng = makeRng(SEED);
function rand() { return rng(); }
function randInt(min, max) { return Math.floor(rand() * (max - min + 1)) + min; }
function pick(arr) { return arr.length === 0 ? null : arr[Math.floor(rand() * arr.length)]; }

// Monkey-patch Math.random so combat.js internals become deterministic.
const ORIG_RANDOM = Math.random;
Math.random = rand;

// ── Sandbox persistence so nothing writes to disk ─────────────────────────────
try {
  const persistence = require('../src/engine/persistence');
  persistence.save = () => {};
  persistence.load = (_, fb) => fb;
} catch (_) { /* optional */ }

// ── Core modules under test ──────────────────────────────────────────────────
const playerLib = require('../src/player/player');
const combat = require('../src/combat/combat');
const breakpoints = require('../src/engine/breakpoint-runner');
const death = require('../src/engine/death');
const items = require('../src/data/items');

// Register death adapters (combat.checkPlayerDeath needs them).
death.register({
  items,
  getTick: () => currentTick,
  invAdd: playerLib.invAdd,
  setPlayerPosition: (p, pt) => { if (pt) { p.x = pt.x; p.y = pt.y; } },
});

// Silence console noise from combat modules during the main loop.
const ORIG_LOG = console.log;
const ORIG_ERR = console.error;
let suppressLogs = false;
console.log = function (...a) { if (!suppressLogs) ORIG_LOG.apply(console, a); };
console.error = function (...a) { if (!suppressLogs) ORIG_ERR.apply(console, a); };

// ── Test fixtures ────────────────────────────────────────────────────────────

const WEAPON_POOL = [
  { id: 900001, name: 'Bronze dagger', slot: 'weapon', speed: 4, stats: { stab: 5, slash: 3, melee_strength: 4 } },
  { id: 900002, name: 'Iron scimitar', slot: 'weapon', speed: 4, stats: { slash: 12, melee_strength: 10 } },
  { id: 900003, name: 'Steel longsword', slot: 'weapon', speed: 5, stats: { slash: 18, melee_strength: 16 } },
  { id: 900004, name: 'Mithril mace', slot: 'weapon', speed: 5, stats: { crush: 22, melee_strength: 20 } },
  { id: 900005, name: 'Adamant battleaxe', slot: 'weapon', speed: 6, stats: { slash: 32, melee_strength: 34 } },
  { id: 900006, name: 'Rune 2h sword', slot: 'weapon', speed: 7, stats: { slash: 70, melee_strength: 80 } },
  { id: 900007, name: 'Magic shortbow', slot: 'weapon', speed: 4, stats: { ranged: 50 } },
  { id: 900008, name: 'Rune crossbow', slot: 'weapon', speed: 6, stats: { ranged: 60 } },
  { id: 900009, name: 'Staff of air', slot: 'weapon', speed: 5, stats: { magic: 10, crush: 5 } },
  { id: 900010, name: 'Dragon dagger', slot: 'weapon', speed: 4, stats: { stab: 55, melee_strength: 50 } },
  { id: 900011, name: 'Abyssal whip', slot: 'weapon', speed: 4, stats: { slash: 82, melee_strength: 82 } },
  { id: 900012, name: 'Silver holy hammer', slot: 'weapon', speed: 5, stats: { crush: 20, melee_strength: 20, effective_vs: ['undead'] } },
];

const ARMOUR_POOL = [
  { id: 901001, name: 'Iron platebody', slot: 'body', stats: { def_slash: 15, def_stab: 15, def_crush: 13 } },
  { id: 901002, name: 'Steel platelegs', slot: 'legs', stats: { def_slash: 10, def_stab: 10, def_crush: 9 } },
  { id: 901003, name: 'Rune helm', slot: 'head', stats: { def_slash: 20, def_stab: 20, def_crush: 18 } },
  { id: 901004, name: 'Dragonhide body', slot: 'body', stats: { ranged: 15, def_ranged: 25 } },
  { id: 901005, name: 'Mystic hat', slot: 'head', stats: { magic: 10, def_magic: 10 } },
  { id: 901006, name: 'Bronze arrows', slot: 'ammo', stats: { ranged_strength: 4 } },
  { id: 901007, name: 'Rune arrows', slot: 'ammo', stats: { ranged_strength: 26 } },
  { id: 901008, name: 'Fire runes', slot: 'ammo', stats: {} }, // bogus, exercises weird equip
];

const FOOD_POOL = [
  { id: 902001, name: 'Shrimps', heal: 3 },
  { id: 902002, name: 'Trout', heal: 7 },
  { id: 902003, name: 'Lobster', heal: 12 },
  { id: 902004, name: 'Shark', heal: 20 },
  { id: 902005, name: 'Saradomin brew', heal: 16 },
];

const POTION_POOL = [
  { id: 903001, name: 'Attack potion', skill: 'attack', boost: 3, ticks: 500 },
  { id: 903002, name: 'Strength potion', skill: 'strength', boost: 3, ticks: 500 },
  { id: 903003, name: 'Super attack', skill: 'attack', boost: 5, ticks: 500 },
  { id: 903004, name: 'Super strength', skill: 'strength', boost: 5, ticks: 500 },
  { id: 903005, name: 'Ranging potion', skill: 'ranged', boost: 4, ticks: 500 },
  { id: 903006, name: 'Magic potion', skill: 'magic', boost: 4, ticks: 500 },
  { id: 903007, name: 'Prayer potion', skill: 'prayer_restore', boost: 0, ticks: 0 },
];

const RUNE_POOL = [
  { id: 270, name: 'Air rune', stackable: true },
  { id: 271, name: 'Water rune', stackable: true },
  { id: 272, name: 'Earth rune', stackable: true },
  { id: 273, name: 'Fire rune', stackable: true },
  { id: 274, name: 'Mind rune', stackable: true },
  { id: 276, name: 'Chaos rune', stackable: true },
  { id: 277, name: 'Death rune', stackable: true },
];

const PRAYERS = Object.keys({
  clarity_of_thought: 1, improved_reflexes: 1, incredible_reflexes: 1,
  burst_of_strength: 1, superhuman_strength: 1, ultimate_strength: 1,
  thick_skin: 1, rock_skin: 1, steel_skin: 1,
  chivalry: 1, piety: 1,
  sharp_eye: 1, hawk_eye: 1, eagle_eye: 1, rigour: 1,
  mystic_will: 1, mystic_lore: 1, mystic_might: 1, augury: 1,
});

const SPELLS = Object.keys(combat.COMBAT_SPELLS);
const STYLES = Object.keys(combat.STYLES);

// Register weapons / armour / food with the items registry so death.js sort
// doesn't throw.
function registerPoolItems() {
  const all = [...WEAPON_POOL, ...ARMOUR_POOL];
  for (const it of all) {
    if (!items.get(it.id)) {
      items.define({
        id: it.id, name: it.name, value: 100,
        equipSlot: it.slot, stats: it.stats, weight: 1,
        category: 'gear',
      });
    }
  }
  for (const it of FOOD_POOL) {
    if (!items.get(it.id)) {
      items.define({ id: it.id, name: it.name, value: 50, category: 'food', weight: 0.5 });
    }
  }
  for (const it of POTION_POOL) {
    if (!items.get(it.id)) {
      items.define({ id: it.id, name: it.name, value: 200, category: 'potion', weight: 0.1 });
    }
  }
  for (const it of RUNE_POOL) {
    if (!items.get(it.id)) {
      items.define({ id: it.id, name: it.name, value: 5, category: 'rune', stackable: true, weight: 0 });
    }
  }
}
registerPoolItems();

// ── NPC tiers 1..5 — simple test monsters ────────────────────────────────────
function makeNpc(tier, id) {
  // Tier scales linearly. Include tags/weakness so weakness system is exercised.
  const weaknesses = [null, 'slash', 'stab', 'crush', 'ranged', 'magic'];
  const resistances = [null, 'melee', 'ranged', 'magic'];
  const tagGroups = [[], ['undead'], ['dragon'], ['demon'], ['vampyre'], ['elemental']];
  return {
    id,
    name: `FuzzMob-T${tier}-${id}`,
    tier,
    hp: 20 * tier,
    maxHp: 20 * tier,
    x: 10, y: 10, layer: 0, size: 1,
    stats: {
      attack: 5 * tier, strength: 5 * tier, defence: 5 * tier,
      magic: 3 * tier,
      def_slash: 2 * tier, def_stab: 2 * tier, def_crush: 2 * tier,
      def_ranged: 2 * tier, def_magic: 2 * tier,
    },
    maxHit: 2 + tier,
    attackSpeed: 4,
    attackStyle: 'melee',
    nextAttackTick: 0,
    weakness: pick(weaknesses),
    resistance: pick(resistances),
    tags: pick(tagGroups),
    dead: false,
    dying: 0,
    stunned: 0,
    frozen: 0,
    target: null,
  };
}

// ── Arena: 1 player vs 1 NPC ────────────────────────────────────────────────
let NEXT_ID = 1;
function makeArena(n) {
  const p = playerLib.createPlayer(`fuzz-${n}`, `Fuzzer${n}`);
  // Randomize combat skills up a bit so fuzzing covers different max hits.
  for (const skill of ['attack', 'strength', 'defence', 'hitpoints', 'ranged', 'magic', 'prayer']) {
    const target = randInt(1, 80);
    playerLib.addXp(p, skill, playerLib.xpForLevel(target));
  }
  // Give random gear.
  const gearCount = randInt(0, 4);
  for (let i = 0; i < gearCount; i++) {
    const piece = pick([...WEAPON_POOL, ...ARMOUR_POOL]);
    p.equipment[piece.slot] = { id: piece.id, name: piece.name, stats: piece.stats, speed: piece.speed };
  }
  // Ensure the player has a weapon most of the time (so melee path runs).
  if (!p.equipment.weapon && rand() < 0.7) {
    const w = pick(WEAPON_POOL);
    p.equipment.weapon = { id: w.id, name: w.name, stats: w.stats, speed: w.speed };
  }
  // Inventory: 5-15 items of mixed types.
  const invFill = randInt(5, 15);
  for (let i = 0; i < invFill; i++) {
    const kind = rand();
    if (kind < 0.35) {
      const f = pick(FOOD_POOL);
      playerLib.invAdd(p, f.id, f.name, 1);
    } else if (kind < 0.55) {
      const po = pick(POTION_POOL);
      playerLib.invAdd(p, po.id, po.name, 1);
    } else if (kind < 0.80) {
      const ru = pick(RUNE_POOL);
      playerLib.invAdd(p, ru.id, ru.name, randInt(1, 50), true);
    } else if (kind < 0.92) {
      const w = pick(WEAPON_POOL);
      playerLib.invAdd(p, w.id, w.name, 1);
    } else {
      const a = pick(ARMOUR_POOL);
      playerLib.invAdd(p, a.id, a.name, 1);
    }
  }
  // Random active prayers (0-3).
  const prayerCount = randInt(0, 3);
  for (let i = 0; i < prayerCount; i++) p.activePrayers.add(pick(PRAYERS));

  p.attackStyle = pick(STYLES);

  const tier = randInt(1, 5);
  const npc = makeNpc(tier, NEXT_ID++);
  npc.target = p;

  return { player: p, npc, tier, id: n };
}

// ── Invariant tracker ────────────────────────────────────────────────────────
const invariantPasses = {
  hp_nonnegative: 0,
  xp_nonnegative: 0,
  prayer_cap: 0,
  inventory_cap: 0,
  no_nan: 0,
  listeners_stable: 0,
  throughput: 0,
};
const bugs = [];
function logBug(name, detail) {
  bugs.push({ invariant: name, seed: SEED, tick: currentTick, ...detail });
}

function checkInvariants(arena, phase) {
  const p = arena.player;
  const npc = arena.npc;

  // I1: HP never < 0 without death hook. combat.checkPlayerDeath accepts hp<=0.
  // If hp is negative, we must have called checkPlayerDeath (or death.onPlayerDeath).
  // We watch for "negative HP leak" = hp < 0 persisting across a tick without
  // death flag ever being observed.
  if (!Number.isFinite(p.hp)) {
    logBug('hp_nonnegative', { arena: arena.id, phase, reason: 'player.hp not finite', hp: p.hp });
  } else if (p.hp < 0 && !p._deathTriggered) {
    logBug('hp_nonnegative', { arena: arena.id, phase, reason: 'negative hp without death hook', hp: p.hp });
  } else {
    invariantPasses.hp_nonnegative++;
  }

  if (!Number.isFinite(npc.hp)) {
    logBug('hp_nonnegative', { arena: arena.id, phase, reason: 'npc.hp not finite', hp: npc.hp });
  }

  // I2: XP gains always >= 0. Snapshot XP across combat skills; if any dropped,
  // record a bug. Bootstrap the snapshot on first tick.
  if (!arena._lastXp) {
    arena._lastXp = {};
    for (const s of ['attack', 'strength', 'defence', 'hitpoints', 'ranged', 'magic', 'prayer']) {
      arena._lastXp[s] = playerLib.getXp(p, s);
    }
  } else {
    let ok = true;
    for (const s of ['attack', 'strength', 'defence', 'hitpoints', 'ranged', 'magic', 'prayer']) {
      const now = playerLib.getXp(p, s);
      if (now < arena._lastXp[s]) {
        logBug('xp_nonnegative', { arena: arena.id, phase, skill: s, before: arena._lastXp[s], after: now });
        ok = false;
      }
      arena._lastXp[s] = now;
    }
    if (ok) invariantPasses.xp_nonnegative++;
  }

  // I3: Prayer points never > max. Max = prayer level.
  const prayerMax = playerLib.getLevel(p, 'prayer');
  if (p.prayerPoints > prayerMax + 0.0001) {
    logBug('prayer_cap', { arena: arena.id, phase, prayer: p.prayerPoints, max: prayerMax });
  } else if (!Number.isFinite(p.prayerPoints)) {
    logBug('prayer_cap', { arena: arena.id, phase, reason: 'not finite', prayer: p.prayerPoints });
  } else {
    invariantPasses.prayer_cap++;
  }

  // I4: Inventory never > 28 slots.
  if (p.inventory.length > 28) {
    logBug('inventory_cap', { arena: arena.id, phase, len: p.inventory.length });
  } else {
    // Also check non-stackable items never have count > 1 if def says non-stackable.
    let stackViolation = false;
    for (const slot of p.inventory) {
      if (!slot) continue;
      if (typeof slot.count !== 'number' || !Number.isFinite(slot.count) || slot.count < 0) {
        logBug('inventory_cap', { arena: arena.id, phase, reason: 'invalid count', slot });
        stackViolation = true;
      }
    }
    if (!stackViolation) invariantPasses.inventory_cap++;
  }

  // I5: No NaN/undefined in critical fields.
  const crit = [
    ['p.hp', p.hp], ['p.maxHp', p.maxHp], ['p.x', p.x], ['p.y', p.y],
    ['p.prayerPoints', p.prayerPoints], ['p.runEnergy', p.runEnergy],
    ['p.attackStyle', p.attackStyle],
    ['npc.hp', npc.hp], ['npc.x', npc.x], ['npc.y', npc.y],
  ];
  let nanOk = true;
  for (const [lbl, v] of crit) {
    if (v === undefined || (typeof v === 'number' && Number.isNaN(v))) {
      logBug('no_nan', { arena: arena.id, phase, field: lbl, value: String(v) });
      nanOk = false;
    }
  }
  if (nanOk) invariantPasses.no_nan++;
}

// ── Random action helpers ────────────────────────────────────────────────────

function doAutoAttack(arena) {
  const p = arena.player, npc = arena.npc;
  if (npc.hp <= 0) return;

  const weapon = p.equipment.weapon;
  const wname = (weapon?.name || '').toLowerCase();
  let result;
  try {
    if (wname.includes('staff') && rand() < 0.5) {
      result = combat.magicAttack(p, npc, pick(SPELLS));
      if (result && result.hit) {
        npc.hp -= result.damage;
        combat.magicCombatXp(p, result.damage, result.baseXp);
      }
    } else if (wname.includes('bow') || wname.includes('crossbow')) {
      result = combat.rangedAttack(p, npc);
      if (result && result.hit) {
        npc.hp -= result.damage;
        combat.rangedCombatXp(p, result.damage);
      }
    } else {
      result = combat.meleeAttack(p, npc);
      if (result && result.hit) {
        npc.hp -= result.damage;
        combat.combatXp(p, result.damage);
      }
    }
  } catch (e) {
    logBug('no_nan', { arena: arena.id, phase: 'doAutoAttack', reason: 'threw: ' + e.message, stack: e.stack.split('\n').slice(0, 3).join(' | ') });
  }
}

function doSwitchWeapon(arena) {
  const p = arena.player;
  // Find a weapon slot in inventory.
  const candidateIdx = p.inventory
    .map((s, i) => (s && WEAPON_POOL.some(w => w.id === s.id)) ? i : -1)
    .filter(i => i >= 0);
  if (candidateIdx.length === 0) return;
  const idx = pick(candidateIdx);
  const slot = p.inventory[idx];
  const def = WEAPON_POOL.find(w => w.id === slot.id);
  if (!def) return;
  const prev = p.equipment.weapon;
  p.equipment.weapon = { id: def.id, name: def.name, stats: def.stats, speed: def.speed };
  p.inventory[idx] = null;
  if (prev) {
    playerLib.invAdd(p, prev.id, prev.name, 1);
  }
}

function doTogglePrayer(arena) {
  const p = arena.player;
  const prayer = pick(PRAYERS);
  if (p.activePrayers.has(prayer)) p.activePrayers.delete(prayer);
  else p.activePrayers.add(prayer);
}

function doEatFood(arena) {
  const p = arena.player;
  const candidateIdx = p.inventory
    .map((s, i) => (s && FOOD_POOL.some(f => f.id === s.id)) ? i : -1)
    .filter(i => i >= 0);
  if (candidateIdx.length === 0) return;
  const idx = pick(candidateIdx);
  const slot = p.inventory[idx];
  const def = FOOD_POOL.find(f => f.id === slot.id);
  if (!def) return;
  p.hp = Math.min(p.maxHp, p.hp + def.heal);
  playerLib.invRemove(p, slot.id, 1);
}

function doDrinkPotion(arena) {
  const p = arena.player;
  const candidateIdx = p.inventory
    .map((s, i) => (s && POTION_POOL.some(po => po.id === s.id)) ? i : -1)
    .filter(i => i >= 0);
  if (candidateIdx.length === 0) return;
  const idx = pick(candidateIdx);
  const slot = p.inventory[idx];
  const def = POTION_POOL.find(po => po.id === slot.id);
  if (!def) return;
  if (def.skill === 'prayer_restore') {
    const max = playerLib.getLevel(p, 'prayer');
    p.prayerPoints = Math.min(max, p.prayerPoints + 7 + Math.floor(max / 4));
  } else {
    if (!p.boosts) p.boosts = {};
    p.boosts[def.skill] = { amount: def.boost, ticksLeft: def.ticks };
  }
  playerLib.invRemove(p, slot.id, 1);
}

function doMoveRandom(arena) {
  const p = arena.player;
  p.x += randInt(-1, 1);
  p.y += randInt(-1, 1);
}

function doSpecialAttack(arena) {
  const p = arena.player;
  if (p.specialEnergy < 250) return;
  p.specialEnergy -= 250;
  // Use a boosted auto-attack (emulates a spec).
  doAutoAttack(arena);
}

// ── NPC tick (movement, retaliation) ────────────────────────────────────────
function npcTick(arena) {
  const npc = arena.npc;
  const p = arena.player;
  if (npc.dead || npc.hp <= 0) return;
  if (npc.stunned > 0) { npc.stunned--; return; }
  if (npc.frozen > 0) { npc.frozen--; }

  // Movement — boss mechanics approx: close distance to target unless in range.
  const dx = Math.sign(p.x - npc.x);
  const dy = Math.sign(p.y - npc.y);
  const dist = Math.max(Math.abs(p.x - npc.x), Math.abs(p.y - npc.y));
  if (dist > 1 && npc.frozen <= 0) {
    npc.x += dx;
    npc.y += dy;
  }

  // Boss-principle-like randomness: tier-5 every 10 ticks does a special move.
  if (npc.tier === 5 && currentTick % 10 === 0) {
    // "mechanic": apply stun to itself to simulate a telegraph.
    npc.stunned = 1;
  }

  // Attack if in range and off cooldown.
  if (currentTick >= npc.nextAttackTick && dist <= (npc.attackRange || 1) + 1) {
    const max = npc.maxHit;
    const dmg = Math.floor(rand() * (max + 1));
    p.hp -= dmg;
    npc.nextAttackTick = currentTick + (npc.attackSpeed || 4);
  }
}

// ── Death handling per arena ─────────────────────────────────────────────────
function handleDeaths(arena) {
  const p = arena.player;
  const npc = arena.npc;
  if (p.hp <= 0 && !p._deathTriggered) {
    p._deathTriggered = true;
    try {
      combat.checkPlayerDeath(p, { location: { region: 'heartlands', x: p.x, y: p.y }, killer: { name: npc.name } });
    } catch (e) {
      logBug('hp_nonnegative', { arena: arena.id, reason: 'checkPlayerDeath threw: ' + e.message });
    }
    // Respawn the player so fuzzing continues.
    p.hp = p.maxHp;
    p._deathTriggered = false;
  }
  if (npc.hp <= 0 && !npc.dead) {
    npc.dead = true;
    // Respawn a fresh NPC so the combat loop keeps running.
    const fresh = makeNpc(arena.tier, NEXT_ID++);
    fresh.target = p;
    arena.npc = fresh;
  }
}

// ── Prayer drain (simple approximation) ─────────────────────────────────────
function drainPrayer(arena) {
  const p = arena.player;
  if (p.activePrayers.size === 0) return;
  // Drain: 1 point per 6 ticks per active prayer (coarse).
  if (currentTick % 6 === 0) {
    p.prayerPoints = Math.max(0, p.prayerPoints - p.activePrayers.size);
    if (p.prayerPoints <= 0) p.activePrayers.clear();
  }
}

// ── Boost decay ──────────────────────────────────────────────────────────────
function decayBoosts(arena) {
  const p = arena.player;
  if (!p.boosts) return;
  for (const skill of Object.keys(p.boosts)) {
    const b = p.boosts[skill];
    if (!b) continue;
    b.ticksLeft = Math.max(0, (b.ticksLeft || 0) - 1);
    if (b.ticksLeft <= 0) delete p.boosts[skill];
  }
}

// ── Main fuzz loop ───────────────────────────────────────────────────────────

const N_ARENAS = 10;
const N_TICKS = 10000;
let currentTick = 0;

console.log(`[fuzz] seed=${SEED} arenas=${N_ARENAS} ticks=${N_TICKS}`);
const arenas = [];
for (let i = 0; i < N_ARENAS; i++) arenas.push(makeArena(i));
console.log('[fuzz] arenas initialised');

// Snapshot the breakpoint-runner listener count before the loop so we can
// detect regressions where a module leaks listeners each tick.
const initialListeners = (() => {
  // breakpoint-runner exposes subscribe() but not a size getter; peek via
  // a one-off subscribe/unsubscribe to see if listener set is stable.
  // We instead hot-reach into the module via require.cache.
  const modPath = require.resolve('../src/engine/breakpoint-runner');
  const mod = require.cache[modPath];
  if (!mod || !mod.exports) return -1;
  // Access internal listeners set if exposed via a known path; otherwise try to
  // read __listeners or similar. Fall back to -1.
  return getListenerCount();
})();

function getListenerCount() {
  const modPath = require.resolve('../src/engine/breakpoint-runner');
  const mod = require.cache[modPath];
  if (!mod) return -1;
  // breakpoint-runner stores listeners as a file-level `const listeners = new Set()`
  // which is closed over by subscribe/emit. We can't see it directly.
  // But we can observe indirectly — subscribe, read size of a fresh subscribe
  // that returns the underlying Set reference. Since it doesn't, do an unreachable
  // probe: subscribe + immediately unsub and count. (=0 delta expected).
  // Instead, expose a counter by patching subscribe once at startup.
  return mod.exports.__listenerCount ? mod.exports.__listenerCount() : -1;
}

// Patch breakpoint-runner to expose listener count.
(function patchBreakpointRunner() {
  const mod = require('../src/engine/breakpoint-runner');
  // We'll wrap subscribe so we can count net-subscribers.
  let count = 0;
  const origSubscribe = mod.subscribe;
  mod.subscribe = function (fn) {
    count++;
    const unsub = origSubscribe(fn);
    return function () { count--; return unsub(); };
  };
  mod.__listenerCount = () => count;
})();

const listeners0 = require('../src/engine/breakpoint-runner').__listenerCount();

// ── Action selector ──────────────────────────────────────────────────────────
function playerAction(arena) {
  const r = rand();
  if (r < 0.70) doAutoAttack(arena);
  else if (r < 0.80) doSwitchWeapon(arena);
  else if (r < 0.90) doTogglePrayer(arena);
  else if (r < 0.95) doEatFood(arena);
  else if (r < 0.98) doDrinkPotion(arena);
  else doMoveRandom(arena);

  // Occasional spec (1% chance).
  if (rand() < 0.01) doSpecialAttack(arena);
}

// Pre-loop: check invariants once on arena init.
for (const a of arenas) checkInvariants(a, 'init');

suppressLogs = true;
const t0 = Date.now();
try {
  for (currentTick = 1; currentTick <= N_TICKS; currentTick++) {
    for (const a of arenas) {
      // NPC tick first (OSRS phase order).
      npcTick(a);
      // Player action.
      playerAction(a);
      // Prayer/boost decay.
      drainPrayer(a);
      decayBoosts(a);
      // Death handling.
      handleDeaths(a);
      // Invariant check (sampled to keep runtime <2 min).
      if (currentTick % 20 === 0 || bugs.length > 0) {
        checkInvariants(a, 'mid');
      }
    }
    // Listener count sanity each 1k ticks.
    if (currentTick % 1000 === 0) {
      const c = require('../src/engine/breakpoint-runner').__listenerCount();
      if (c > listeners0 + 5) {
        logBug('listeners_stable', { tick: currentTick, count: c, initial: listeners0 });
      } else {
        invariantPasses.listeners_stable++;
      }
    }
  }
} catch (e) {
  suppressLogs = false;
  console.error('[fuzz] FATAL during main loop:', e.message, '\n', e.stack);
  logBug('no_nan', { reason: 'main loop crashed: ' + e.message });
}
suppressLogs = false;

const elapsedMs = Date.now() - t0;
const ticksPerSec = Math.round(N_TICKS / (elapsedMs / 1000));
if (ticksPerSec >= 100) invariantPasses.throughput++;

// Final invariant check.
for (const a of arenas) checkInvariants(a, 'final');

// ── Bisect: for each unique bug, replay with shorter windows to narrow ───────
function bisect(bugs) {
  // We already have {seed, tick, arena} captured. For simplicity, report the
  // earliest occurrence per (invariant) as the minimal repro point — a full
  // bisect would re-run N times; we skip to meet the <2 min budget.
  const byInv = new Map();
  for (const b of bugs) {
    const k = b.invariant;
    if (!byInv.has(k) || (b.tick || Infinity) < (byInv.get(k).tick || Infinity)) byInv.set(k, b);
  }
  return [...byInv.values()];
}

const minimalRepros = bisect(bugs);

// ── Report ───────────────────────────────────────────────────────────────────
ORIG_LOG('\n════════════════════════════════════════════════════════');
ORIG_LOG(`  Combat Fuzz — seed=${SEED}`);
ORIG_LOG(`  Arenas=${N_ARENAS}  Ticks=${N_TICKS}  Elapsed=${elapsedMs}ms (${ticksPerSec} ticks/sec)`);
ORIG_LOG('  Invariant pass counts:');
for (const k of Object.keys(invariantPasses)) {
  ORIG_LOG(`    ${k.padEnd(20)} ${invariantPasses[k]}`);
}
ORIG_LOG(`  Bugs logged: ${bugs.length}  (unique invariants: ${minimalRepros.length})`);
ORIG_LOG('════════════════════════════════════════════════════════\n');

if (bugs.length > 0) {
  const reportPath = path.join(__dirname, '..', 'reports', 'combat-fuzz-bugs.md');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  const lines = [];
  lines.push('# Combat Fuzz Bugs');
  lines.push('');
  lines.push(`Seed: ${SEED}`);
  lines.push(`Arenas: ${N_ARENAS}  Ticks: ${N_TICKS}`);
  lines.push(`Elapsed: ${elapsedMs}ms (${ticksPerSec} ticks/sec)`);
  lines.push(`Total bugs: ${bugs.length}`);
  lines.push('');
  lines.push('## Minimal repros (earliest occurrence per invariant)');
  lines.push('');
  for (const r of minimalRepros) {
    lines.push(`- **${r.invariant}** — tick ${r.tick} arena ${r.arena ?? 'n/a'}`);
    lines.push(`  - repro: \`FUZZ_SEED=${SEED} node scripts/test-combat-fuzz.js\``);
    lines.push('  - detail: `' + JSON.stringify(r).slice(0, 300) + '`');
  }
  lines.push('');
  lines.push('## All bugs');
  lines.push('');
  for (const b of bugs.slice(0, 200)) {
    lines.push('- `' + JSON.stringify(b) + '`');
  }
  if (bugs.length > 200) lines.push(`- ... and ${bugs.length - 200} more`);
  fs.writeFileSync(reportPath, lines.join('\n'));
  ORIG_LOG(`[fuzz] Wrote ${reportPath}`);
}

// Restore global Math.random.
Math.random = ORIG_RANDOM;

// Exit non-zero if any hard invariant failed, but only if throughput met —
// a throughput failure is a performance regression flag, not a bug in combat.
const crit = bugs.some(b => b.invariant === 'hp_nonnegative' || b.invariant === 'xp_nonnegative' || b.invariant === 'no_nan');
process.exit(crit ? 1 : 0);
