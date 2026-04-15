#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// Ranged + Magic Combat — ported from ScapeTests/tests/04-combat-ranged.md and
// ScapeTests/tests/05-combat-magic.md
//
// Exercises the ranged and magic combat paths in src/combat/combat.js:
//   hasRangedSetup()          — weapon + ammo compat check
//   maxHitRanged()            — ranged max hit formula
//   rangedAttack()            — weakness-aware ranged attack (stochastic)
//   rangedCombatXp()          — 4 xp/dmg ranged, 1.33 xp/dmg HP
//   getRangedRange()          — tile reach per bow type
//   COMBAT_SPELLS             — spell table (wind strike → fire blast)
//   magicAttackRoll()         — effective magic × (equip + 64)
//   magicAttack()             — stochastic attack with spell max hit
//   magicCombatXp()           — 2 xp/dmg magic + baseXp per cast, 1.33 xp/dmg HP
//
// Mapping:
//   TEST-0401..0403 → max hit ranges for shortbow / longbow / crossbow
//   TEST-0404      → ammo-slot requirement (hasRangedSetup)
//   TEST-0411      → attack range (tiles) per weapon type
//   TEST-0501..0506 → spell table (max hit, base XP, level requirement)
//   TEST-0507..0509 → magic attack roll formula
//
// Run: node scripts/test-ranged-magic.js
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const { makeReporter, makePlayer, equipDirect, freshBreakpoint, makeRng } = require('./test-helpers');

const player = require('../src/player/player');
const combat = require('../src/combat/combat');

const r = makeReporter();

// ── Ranged setup check (TEST-0404) ──────────────────────────────────────────
r.section('hasRangedSetup requires bow + ammo (TEST-0404)');

function fresh(name) {
  const p = makePlayer(name);
  freshBreakpoint(p);
  return p;
}

const pBare = fresh('BareRange');
r.eq(combat.hasRangedSetup(pBare), false, 'no weapon = no ranged setup');

const pBow = fresh('BowOnly');
equipDirect(pBow, 'weapon', { name: 'Magic longbow', stats: {} });
r.eq(combat.hasRangedSetup(pBow), false, 'bow without ammo = no setup');

const pFull = fresh('FullRanged');
equipDirect(pFull, 'weapon', { name: 'Magic shortbow', stats: {} });
equipDirect(pFull, 'ammo', { name: 'Rune arrow', stats: {} });
r.eq(combat.hasRangedSetup(pFull), true, 'bow + arrows = valid ranged setup');

// Crossbow + bolts.
const pCbow = fresh('Cbow');
equipDirect(pCbow, 'weapon', { name: 'Rune crossbow', stats: {} });
equipDirect(pCbow, 'ammo', { name: 'Rune bolts', stats: {} });
r.eq(combat.hasRangedSetup(pCbow), true, 'crossbow + bolts = valid setup');

// Blowpipe + darts.
const pBlow = fresh('Blow');
equipDirect(pBlow, 'weapon', { name: 'Toxic blowpipe', stats: {} });
equipDirect(pBlow, 'ammo', { name: 'Rune dart', stats: {} });
r.eq(combat.hasRangedSetup(pBlow), true, 'blowpipe + darts = valid setup');

// Melee weapon is not a ranged setup.
const pMelee = fresh('Melee');
equipDirect(pMelee, 'weapon', { name: 'Rune scimitar', stats: {} });
equipDirect(pMelee, 'ammo', { name: 'Rune arrow', stats: {} });
r.eq(combat.hasRangedSetup(pMelee), false, 'scim + arrows is not a ranged setup');

// Mismatched ammo: bow + bolts.
const pMix = fresh('Mix');
equipDirect(pMix, 'weapon', { name: 'Magic longbow', stats: {} });
equipDirect(pMix, 'ammo', { name: 'Rune bolts', stats: {} });
// Engine allows this: only the ammo name needs to include arrow/bolt/dart.
r.eq(combat.hasRangedSetup(pMix), true, 'engine currently permits bow+bolts (doc)');

// ── Max hit ranged (TEST-0401..0403) ────────────────────────────────────────
r.section('Ranged max hit formula (TEST-0401..0403)');

function mkRanger(rangedLevel, prayer, potion, ammoStr) {
  const p = fresh('Ranger_' + rangedLevel);
  p.skills.ranged.xp = player.xpForLevel(rangedLevel);
  p.skills.ranged.level = rangedLevel;
  if (prayer) p.activePrayers.add(prayer);
  if (potion) p.boosts.ranged = { amount: potion, ticksLeft: 1000 };
  if (ammoStr) equipDirect(p, 'ammo', { name: 'Rune arrow', stats: { ranged_strength: ammoStr } });
  return p;
}

// 50 ranged, no bonus: eff = 58, max = floor(0.5 + 58*64/640) = floor(6.3) = 6
r.eq(combat.maxHitRanged(mkRanger(50, null, 0, 0)), 6,
  '50 ranged + no bonus = 6 max hit');

// 75 ranged + ammo strength 50: eff = 83, max = floor(0.5 + 83*114/640) = floor(15.29) = 15
r.eq(combat.maxHitRanged(mkRanger(75, null, 0, 50)), 15,
  '75 ranged + 50 ammo str = 15 max hit');

// 99 ranged + Rigour (1.23) + 80 ammo str: eff = floor(99*1.23)+8 = 121+8=129
// max = floor(0.5 + 129 * 144 / 640) = floor(29.525) = 29
r.eq(combat.maxHitRanged(mkRanger(99, 'rigour', 0, 80)), 29,
  '99 ranged + rigour + 80 ammo str = 29 max hit');

// Ranging potion (+13 at 99): eff = floor((99+13)*1.23) + 8 = floor(137.76) + 8 = 137+8 = 145
// max = floor(0.5 + 145 * 144 / 640) = floor(33.125) = 33
r.eq(combat.maxHitRanged(mkRanger(99, 'rigour', 13, 80)), 33,
  '99 ranged + rigour + pot + 80 ammo str = 33 max hit');

// ── Ranged combat XP routing ────────────────────────────────────────────────
r.section('rangedCombatXp routes 4 xp/dmg → ranged, 1.33 → HP');

function rngXpFor(skill, dmg) {
  const p = fresh('RngXp_' + skill);
  const before = player.getXp(p, skill);
  combat.rangedCombatXp(p, dmg);
  return player.getXp(p, skill) - before;
}
r.eq(rngXpFor('ranged', 10),    40, '10 dmg = 40 ranged XP');
r.eq(rngXpFor('hitpoints', 10), 13, '10 dmg = 13 HP XP (floor(13.3))');
r.eq(rngXpFor('attack', 10),    0,  'no attack XP from ranged');
r.eq(rngXpFor('strength', 10),  0,  'no strength XP from ranged');

// ── getRangedRange (TEST-0411) ──────────────────────────────────────────────
r.section('getRangedRange by weapon type');

function range(name) {
  const p = fresh('R_' + name);
  equipDirect(p, 'weapon', { name, stats: {} });
  return combat.getRangedRange(p);
}
r.eq(range('Magic longbow'), 10, 'longbow range = 10 tiles');
r.eq(range('Magic shortbow'), 7, 'shortbow range = 7 tiles');
r.eq(range('Rune crossbow'), 7,  'crossbow range = 7 tiles');
r.eq(range('Toxic blowpipe'), 5, 'blowpipe range = 5 tiles');
r.eq(range('Rune dart'), 4,      'dart range = 4 tiles');
r.eq(range('Mithril thrownaxe'), 4, 'thrownaxe range = 4 tiles');
r.eq(range('Any unknown weapon'), 7, 'unknown weapon default range = 7');

const pNoWeap = fresh('NoWeap');
r.eq(combat.getRangedRange(pNoWeap), 1, 'no weapon = 1 tile range');

// ── rangedAttack smoke (TEST-0401 stochastic check) ─────────────────────────
r.section('rangedAttack damage bounded by max hit');

// Seed RNG for a deterministic sample.
const rng = makeRng(12345);
const oldRandom = Math.random;
Math.random = rng;

const ranger = mkRanger(75, null, 0, 40);
equipDirect(ranger, 'weapon', { name: 'Rune crossbow', stats: { ranged: 60 } });
equipDirect(ranger, 'ammo', { name: 'Rune bolts', stats: { ranged_strength: 40 } });

const target = { stats: { defence: 10, def_ranged: 0 } };
const maxForTarget = combat.maxHitRanged(ranger);
let maxSeen = 0;
let hits = 0, misses = 0;
for (let i = 0; i < 500; i++) {
  const res = combat.rangedAttack(ranger, target);
  if (res.hit) hits++; else misses++;
  if (res.damage > maxSeen) maxSeen = res.damage;
  if (res.damage > maxForTarget) {
    r.check('damage exceeded max hit', false, { dmg: res.damage, max: maxForTarget });
    break;
  }
}
Math.random = oldRandom;

r.check('no damage exceeded max hit in 500 attacks', maxSeen <= maxForTarget, { maxSeen, maxForTarget });
r.check('some attacks landed (hits > 0)', hits > 0, { hits, misses });
r.check('some attacks missed (misses > 0)', misses > 0, { hits, misses });

// ── Magic spells (TEST-0501..0506) ──────────────────────────────────────────
r.section('Combat spell table (TEST-0501..0506)');

r.check('wind strike defined', !!combat.COMBAT_SPELLS['wind strike']);
r.check('fire blast defined',  !!combat.COMBAT_SPELLS['fire blast']);

const expectedSpells = [
  ['wind strike',  { maxHit: 2,  baseXp: 5.5,  levelReq: 1 }],
  ['water strike', { maxHit: 4,  baseXp: 7.5,  levelReq: 5 }],
  ['earth strike', { maxHit: 6,  baseXp: 9.5,  levelReq: 9 }],
  ['fire strike',  { maxHit: 8,  baseXp: 11.5, levelReq: 13 }],
  ['wind bolt',    { maxHit: 9,  baseXp: 13.5, levelReq: 17 }],
  ['water bolt',   { maxHit: 10, baseXp: 16.5, levelReq: 23 }],
  ['earth bolt',   { maxHit: 11, baseXp: 19.5, levelReq: 29 }],
  ['fire bolt',    { maxHit: 12, baseXp: 22.5, levelReq: 35 }],
  ['wind blast',   { maxHit: 13, baseXp: 25.5, levelReq: 41 }],
  ['water blast',  { maxHit: 14, baseXp: 28.5, levelReq: 47 }],
  ['earth blast',  { maxHit: 15, baseXp: 31.5, levelReq: 53 }],
  ['fire blast',   { maxHit: 16, baseXp: 34.5, levelReq: 59 }],
];

for (const [name, props] of expectedSpells) {
  const s = combat.COMBAT_SPELLS[name];
  r.check(`${name} defined`, !!s);
  if (!s) continue;
  r.eq(s.maxHit,   props.maxHit,   `${name} maxHit = ${props.maxHit}`);
  r.eq(s.baseXp,   props.baseXp,   `${name} baseXp = ${props.baseXp}`);
  r.eq(s.levelReq, props.levelReq, `${name} levelReq = ${props.levelReq}`);
  r.check(`${name} has runes list`, Array.isArray(s.runes) && s.runes.length > 0);
}

// Spell ladder: each tier has strictly higher maxHit, baseXp, levelReq.
for (let i = 1; i < expectedSpells.length; i++) {
  const prev = combat.COMBAT_SPELLS[expectedSpells[i - 1][0]];
  const cur  = combat.COMBAT_SPELLS[expectedSpells[i][0]];
  r.check(`${expectedSpells[i][0]} maxHit > ${expectedSpells[i - 1][0]}`, cur.maxHit > prev.maxHit);
  r.check(`${expectedSpells[i][0]} baseXp > ${expectedSpells[i - 1][0]}`, cur.baseXp > prev.baseXp);
  r.check(`${expectedSpells[i][0]} levelReq > ${expectedSpells[i - 1][0]}`, cur.levelReq > prev.levelReq);
}

// ── Magic attack roll (TEST-0507..0509) ─────────────────────────────────────
r.section('magicAttackRoll formula (TEST-0507..0509)');

function mkMage(level, magicBonus, prayer) {
  const p = fresh('Mage_' + level);
  p.skills.magic.xp = player.xpForLevel(level);
  p.skills.magic.level = level;
  if (magicBonus) equipDirect(p, 'body', { name: 'Mystic robe top', stats: { magic: magicBonus } });
  if (prayer) p.activePrayers.add(prayer);
  return p;
}

// 75 magic + 22 magic bonus, no prayer: eff = 83, roll = 83 × 86 = 7138
r.eq(combat.magicAttackRoll(mkMage(75, 22, null)), 7138,
  '75 magic + 22 bonus = 7138 attack roll');

// 99 magic + 50 bonus + augury (1.25): eff = floor(99*1.25) + 8 = 123+8 = 131
// roll = 131 × 114 = 14,934
r.eq(combat.magicAttackRoll(mkMage(99, 50, 'augury')), 131 * 114,
  '99 magic + 50 bonus + augury = 14,934 roll');

// 1 magic + 0 bonus: eff = 9, roll = 9 × 64 = 576
r.eq(combat.magicAttackRoll(mkMage(1, 0, null)), 576, 'base L1 mage = 576 roll');

// ── magicAttack stochastic (TEST-0502 shape) ────────────────────────────────
r.section('magicAttack respects spell max hit');

const rng2 = makeRng(4242);
const old = Math.random;
Math.random = rng2;

const mage = mkMage(75, 22, null);
const magicTarget = { stats: { magic: 30, def_magic: 0 } };
let mMax = 0, mHits = 0;
for (let i = 0; i < 300; i++) {
  const res = combat.magicAttack(mage, magicTarget, 'fire blast');
  if (res && res.hit) mHits++;
  if (res && res.damage > mMax) mMax = res.damage;
}
Math.random = old;

r.check('fire blast damage <= 16', mMax <= 16, { mMax });
r.check('fire blast landed some hits', mHits > 0, { mHits });

// Unknown spell returns null.
const nullRes = combat.magicAttack(mage, magicTarget, 'not_a_spell');
r.eq(nullRes, null, 'unknown spell → magicAttack returns null');

// ── Magic combat XP (TEST-0507) ─────────────────────────────────────────────
r.section('magicCombatXp = 2 xp/dmg + baseXp (TEST-0507)');

// Fire blast: baseXp 34.5. 10 dmg = 20 + 34 = 54 magic xp (floor baseXp).
// Engine floors per call, so each call adds floor(2*dmg + baseXp).
const xpMage = mkMage(75, 22, null);
const xpBefore = player.getXp(xpMage, 'magic');
combat.magicCombatXp(xpMage, 10, 34.5);
const xpAfter = player.getXp(xpMage, 'magic');
r.eq(xpAfter - xpBefore, 54, '10 dmg + baseXp 34.5 = 54 magic xp');

// HP xp: 1.33 × 10 = 13.
const hpBefore = player.getXp(xpMage, 'hitpoints');
combat.magicCombatXp(xpMage, 10, 34.5);
r.eq(player.getXp(xpMage, 'hitpoints') - hpBefore, 13, '10 dmg = 13 HP xp');

// Splash (0 dmg): only baseXp applies.
const pSplash = fresh('Splash');
const mBefore = player.getXp(pSplash, 'magic');
combat.magicCombatXp(pSplash, 0, 22.5); // wind bolt splash
const mAfter = player.getXp(pSplash, 'magic');
r.eq(mAfter - mBefore, 22, 'splash grants floor(baseXp) magic XP only (22)');

// ── Summary ─────────────────────────────────────────────────────────────────
r.exit();
