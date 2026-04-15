#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// Prayer + Combat Interaction — ported from ScapeTests/tests/06-combat-prayer.md
//
// Verifies every prayer-related multiplier in src/combat/combat.js against the
// OSRS-accurate values documented in PRAYER_BOOSTS. Also exercises the
// Scape-specific bury flow via commands/all.js (prayer-XP-per-bone from the
// BONE_PRAYER_XP table).
//
// Mapping:
//   TEST-0603  → drain formulas are documented; engine models them via p.prayerPoints
//   TEST-0604  → multiple prayers active simultaneously
//   TEST-0605  → overhead prayers are independent Set entries (no auto-exclusion yet)
//   TEST-0609  → Piety: +20% atk, +23% str, +25% def
//   TEST-0610  → Eagle Eye: +15% ranged
//   TEST-0611  → Bone burying XP table
//
// Note: the overhead-prayer mutual-exclusion (spec TEST-0605) is not yet in
// the engine and appears in reports/test-port-gaps.md.
//
// Run: node scripts/test-prayer-combat.js
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const { makeReporter, makePlayer, freshBreakpoint, BONE_PRAYER_XP } = require('./test-helpers');

const player = require('../src/player/player');
const combat = require('../src/combat/combat');

const r = makeReporter();

// ── OSRS prayer values from the wiki ────────────────────────────────────────
const EXPECTED_PRAYER = {
  // Attack
  clarity_of_thought:  { attack: 1.05 },
  improved_reflexes:   { attack: 1.10 },
  incredible_reflexes: { attack: 1.15 },
  // Strength
  burst_of_strength:   { strength: 1.05 },
  superhuman_strength: { strength: 1.10 },
  ultimate_strength:   { strength: 1.15 },
  // Defence
  thick_skin:          { defence: 1.05 },
  rock_skin:           { defence: 1.10 },
  steel_skin:          { defence: 1.15 },
  // Combined melee
  chivalry:            { attack: 1.15, strength: 1.18, defence: 1.20 },
  piety:               { attack: 1.20, strength: 1.23, defence: 1.25 },
  // Ranged
  sharp_eye:           { ranged: 1.05 },
  hawk_eye:            { ranged: 1.10 },
  eagle_eye:           { ranged: 1.15 },
  rigour:              { ranged: 1.23 },
  // Magic
  mystic_will:         { magic: 1.05, defence: 1.05 },
  mystic_lore:         { magic: 1.10, defence: 1.10 },
  mystic_might:        { magic: 1.15, defence: 1.15 },
  augury:              { magic: 1.25, defence: 1.25 },
};

// ── TEST-0601..0605: Per-prayer multipliers ─────────────────────────────────
r.section('Prayer multipliers match OSRS values');

for (const [prayer, boosts] of Object.entries(EXPECTED_PRAYER)) {
  for (const [stat, expected] of Object.entries(boosts)) {
    const actual = combat.getPrayerMultiplier(new Set([prayer]), stat);
    r.eq(actual, expected, `${prayer} × ${stat} = ${expected}`);
  }
  // Non-buffed stat returns 1.0.
  const irrelevantStat = 'runecrafting';
  const noOp = combat.getPrayerMultiplier(new Set([prayer]), irrelevantStat);
  r.eq(noOp, 1.0, `${prayer} no effect on ${irrelevantStat}`);
}

// ── TEST-0604: Two prayers — takes the max, not sum ─────────────────────────
r.section('Multiple prayers active (TEST-0604)');

// Two strength prayers → max beats sum.
const twoStr = combat.getPrayerMultiplier(
  new Set(['burst_of_strength', 'superhuman_strength']),
  'strength'
);
r.eq(twoStr, 1.10, 'burst (1.05) + superhuman (1.10) → max = 1.10');

// Strength prayer + piety on strength: piety wins.
const strPiety = combat.getPrayerMultiplier(
  new Set(['superhuman_strength', 'piety']),
  'strength'
);
r.eq(strPiety, 1.23, 'superhuman + piety strength → 1.23');

// Orthogonal: piety attack + ultimate strength → each stat takes its own max.
const pietyUlt = new Set(['piety', 'ultimate_strength']);
r.eq(combat.getPrayerMultiplier(pietyUlt, 'attack'),   1.20, 'piety attack 1.20 (ultimate has no attack)');
r.eq(combat.getPrayerMultiplier(pietyUlt, 'strength'), 1.23, 'piety strength 1.23 wins over ultimate 1.15');

// Empty set.
r.eq(combat.getPrayerMultiplier(new Set(), 'attack'), 1.0, 'empty set → 1.0');

// ── TEST-0609: Piety effective level calculation ────────────────────────────
r.section('Piety effective level bump (TEST-0609)');

// 70 strength + piety (no pot, no style bonus because attack style = defensive)
// Effective: floor(70 * 1.23) + 0 + 8 = floor(86.1) + 8 = 86 + 8 = 94
const pPiety = makePlayer('Piety70');
freshBreakpoint(pPiety);
pPiety.skills.strength.xp = player.xpForLevel(70); pPiety.skills.strength.level = 70;
pPiety.attackStyle = 'defensive';
pPiety.activePrayers.add('piety');
r.eq(combat.effectiveLevel(pPiety, 'strength'), 94,
  '70 str + piety + defensive = 94 eff str');

// Aggressive adds +3 → 97.
pPiety.attackStyle = 'aggressive';
r.eq(combat.effectiveLevel(pPiety, 'strength'), 97,
  '70 str + piety + aggressive = 97 eff str');

// Without piety, 70 str + aggressive: 70 + 3 + 8 = 81.
pPiety.activePrayers.clear();
r.eq(combat.effectiveLevel(pPiety, 'strength'), 81,
  '70 str + aggressive (no prayer) = 81 eff str');

// ── TEST-0610: Eagle Eye ranged boost ────────────────────────────────────────
r.section('Eagle Eye ranged boost (TEST-0610)');

// 80 ranged + Eagle Eye (1.15): floor(80 * 1.15) + 8 = 92 + 8 = 100
const pEagle = makePlayer('Eagle');
freshBreakpoint(pEagle);
pEagle.skills.ranged.xp = player.xpForLevel(80);
pEagle.skills.ranged.level = 80;
pEagle.activePrayers.add('eagle_eye');

// effectiveRangedLevel is not exported directly, but we can verify through
// maxHitRanged. Without any ranged_strength bonus, max hit = floor(0.5 + 100 * 64 / 640)
//   = floor(0.5 + 10) = 10
r.eq(combat.maxHitRanged(pEagle), 10, '80 ranged + eagle eye + no str bonus = 10 max hit');

// Without eagle eye: eff = 88, max = floor(0.5 + 88 * 64 / 640) = floor(0.5 + 8.8) = 9
pEagle.activePrayers.clear();
r.eq(combat.maxHitRanged(pEagle), 9, '80 ranged + no prayer + no str bonus = 9 max hit');

// Rigour is stronger (1.23).
pEagle.activePrayers.add('rigour');
// floor(80 * 1.23) = 98, +8 = 106, max = floor(0.5 + 106 * 64 / 640) = floor(0.5 + 10.6) = 11
r.eq(combat.maxHitRanged(pEagle), 11, '80 ranged + rigour = 11 max hit');

// ── TEST-0611: Bone burying XP ───────────────────────────────────────────────
r.section('Bone burying XP via commands/all.js (TEST-0611)');

// Set up the commands context the way server.js does.
const tick = require('../src/engine/tick');
const events = require('../src/engine/events');
const objects = require('../src/world/objects');
const actionsModule = require('../src/engine/actions');
const tiles = require('../src/world/tiles');
require('../src/data/items');

const engineCommands = require('../src/engine/commands');

const ctx = {
  players: new Map(),
  playersByName: new Map(),
  groundItems: [],
  tick,
  events,
  persistence: { save: () => {}, saveQueued: () => {} },
  tiles,
  walls: { get: () => null },
  npcs: { spawn: () => null, despawn: () => {}, list: () => [], find: () => null, get: () => null, all: () => [] },
  objects,
  pathfinding: { findPath: () => [] },
  combat,
  actions: actionsModule,
  getLevel: player.getLevel,
  getXp: player.getXp,
  addXp: player.addXp,
  totalLevel: player.totalLevel,
  combatLevel: player.combatLevel,
  getBoostedLevel: player.getBoostedLevel,
  calcWeight: () => {},
  invAdd: player.invAdd,
  invRemove: player.invRemove,
  invCount: player.invCount,
  invFreeSlots: player.invFreeSlots,
  send: () => {}, sendText: () => {}, broadcast: () => {},
  findPlayer: () => null,
  nextItemId: () => Date.now(),
  getLevelUpMessage: player.getLevelUpMessage,
  clans: { get: () => null, list: () => [] },
};

let registerOk = false;
try { require('../src/commands/all')(ctx); registerOk = true; } catch (e) { console.log('register error', e.message); }
r.check('commands/all.js registers against ctx', registerOk);

// Bury a Bones (id 100) — expect 4.5 XP (engine floors to 4).
const buryP = makePlayer('Burier');
freshBreakpoint(buryP);
buryP.inventory[0] = { id: 100, name: 'Bones', count: 1 };
const before = player.getXp(buryP, 'prayer');
const out = engineCommands.execute(buryP, 'bury bones');
const after = player.getXp(buryP, 'prayer');
r.check('bury bones returned a message', typeof out === 'string' && out.length > 0);
r.check('bury bones granted Prayer XP',
  after >= before + 4 && after <= before + 5,
  { gained: after - before });

// Dragon bones = 72 XP.
const buryP2 = makePlayer('DragonBurier');
freshBreakpoint(buryP2);
buryP2.inventory[0] = { id: 107, name: 'Dragon bones', count: 1 };
const bb = player.getXp(buryP2, 'prayer');
engineCommands.execute(buryP2, 'bury bones');
const ba = player.getXp(buryP2, 'prayer');
r.eq(ba - bb, 72, 'dragon bones = 72 XP');

// Big bones = 15 XP.
const buryP3 = makePlayer('BigBurier');
freshBreakpoint(buryP3);
buryP3.inventory[0] = { id: 106, name: 'Big bones', count: 1 };
const b3 = player.getXp(buryP3, 'prayer');
engineCommands.execute(buryP3, 'bury bones');
const b3a = player.getXp(buryP3, 'prayer');
r.eq(b3a - b3, 15, 'big bones = 15 XP');

// ── Prayer points are tied to prayer level ──────────────────────────────────
r.section('Prayer points track prayer level');

const pPray = makePlayer('PrayTracker');
freshBreakpoint(pPray);
r.eq(pPray.prayerPoints, 1, 'new player has 1 prayer point (L1)');

player.addXp(pPray, 'prayer', player.xpForLevel(43));
r.eq(player.getLevel(pPray, 'prayer'), 43, 'prayer level = 43');
r.eq(pPray.prayerPoints, 43, 'prayer points synced to 43 after level up');

player.addXp(pPray, 'prayer', player.xpForLevel(70) - player.xpForLevel(43));
r.eq(player.getLevel(pPray, 'prayer'), 70, 'prayer level = 70');
r.eq(pPray.prayerPoints, 70, 'prayer points synced to 70');

// ── Effective level step order (TEST-0801 cross-check) ──────────────────────
r.section('Effective level step order: potion then prayer then floor');

// 75 atk + super attack (16 boost) + piety on attack (1.20)
// Step 1: (75 + 16) * 1.20 = 109.2 → floor = 109
// Step 2: + 3 (accurate) + 8 = 120
const pOrder = makePlayer('StepOrder');
freshBreakpoint(pOrder);
pOrder.skills.attack.xp = player.xpForLevel(75); pOrder.skills.attack.level = 75;
pOrder.attackStyle = 'accurate';
pOrder.activePrayers.add('piety');
pOrder.boosts.attack = { amount: 16, ticksLeft: 1000 };
r.eq(combat.effectiveLevel(pOrder, 'attack'), 120,
  '75 atk + super + piety + accurate: step order yields 120');

// Boost expires: ticksLeft = 0 → boost not applied.
pOrder.boosts.attack.ticksLeft = 0;
// floor(75 * 1.20) = 90, + 3 + 8 = 101
r.eq(combat.effectiveLevel(pOrder, 'attack'), 101,
  'expired boost not applied');

// ── Summary ─────────────────────────────────────────────────────────────────
r.exit();
