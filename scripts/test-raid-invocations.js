#!/usr/bin/env node
// ── Smoke test for src/engine/raid-invocations.js ────────────────────────────
//
// Validates the Raid Invocation system end-to-end:
//   1. Data loading    -- 75+ invocations across 5 raids
//   2. Per-raid API    -- availableInvocations, toggleInvocation, reset
//   3. Level math      -- currentInvocationLevel, including positive inv
//   4. Scaling         -- scaledDifficulty returns correct multipliers
//   5. Raid lifecycle  -- onRaidStart locks, onRaidComplete unlocks
//   6. Points formula  -- kc, deaths, hp loss, beat-par apply correctly
//   7. Loot buckets    -- 0/1000/2000/3000 thresholds resolve as specified
//   8. Manifesto 17    -- every invocation has a trade-off cost
//   9. Manifesto 12    -- higher level yields elite unique bucket
//
// Run: node scripts/test-raid-invocations.js

'use strict';

// Load invocation data (raid files not loaded -- engine is pure)
require('../src/content/aelgard/invocations-data');
const invocations = require('../src/engine/raid-invocations');
const invocationData = require('../src/content/aelgard/invocations-data');

let passed = 0;
let failed = 0;
const failures = [];

function assert(name, cond, extra) {
  if (cond) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failed++;
    const msg = extra ? `${name} | ${extra}` : name;
    failures.push(msg);
    console.log(`  FAIL  ${msg}`);
  }
}

function makePlayer(id, name) {
  // Lightweight test player (no need to pull full engine)
  return { id: id || 1, name: name || 'InvTester' };
}

const RAIDS = invocationData.getAllRaidIds();

// ══════════════════════════════════════════════════════════════════════════════
// SECTION A -- DATA COVERAGE
// ══════════════════════════════════════════════════════════════════════════════
console.log('\n[A] Data coverage');

assert('A01  all 5 raids registered',
  RAIDS.length === 5,
  `got ${RAIDS.length}: ${RAIDS.join(', ')}`);

assert('A02  chambers_of_aelgard registered', RAIDS.includes('chambers_of_aelgard'));
assert('A03  theatre_of_shadows registered',   RAIDS.includes('theatre_of_shadows'));
assert('A04  tombs_of_aelgard registered',     RAIDS.includes('tombs_of_aelgard'));
assert('A05  inferno registered',              RAIDS.includes('inferno'));
assert('A06  the_gauntlet registered',         RAIDS.includes('the_gauntlet'));

let totalInvocations = 0;
for (const raidId of RAIDS) {
  const list = invocations.availableInvocations(raidId);
  totalInvocations += list.length;
  assert(`A07  ${raidId} has 15+ invocations`,
    list.length >= 15,
    `got ${list.length}`);
}
assert('A08  total invocations >= 75', totalInvocations >= 75, `got ${totalInvocations}`);

// ══════════════════════════════════════════════════════════════════════════════
// SECTION B -- API BASICS
// ══════════════════════════════════════════════════════════════════════════════
console.log('\n[B] API basics');

const p = makePlayer(1, 'Tester');

assert('B01  availableInvocations returns list', Array.isArray(invocations.availableInvocations('tombs_of_aelgard')));
assert('B02  unknown raid returns empty list',    invocations.availableInvocations('not_a_raid').length === 0);
assert('B03  unknown raid toggle returns !ok',    invocations.toggleInvocation(p, 'not_a_raid', 'x').ok === false);
assert('B04  unknown invocation returns !ok',     invocations.toggleInvocation(p, 'tombs_of_aelgard', 'not_real').ok === false);

// ══════════════════════════════════════════════════════════════════════════════
// SECTION C -- TOGGLE LIFECYCLE
// ══════════════════════════════════════════════════════════════════════════════
console.log('\n[C] Toggle lifecycle');

// Fresh player: positive invocations default ON
const state0 = invocations.getState(p, 'tombs_of_aelgard');
assert('C01  positive invocations default ON',
  state0.enabled.includes('toa_normal_health') && state0.enabled.includes('toa_standard_damage'));

// Disable positives so enabling a combat-scaling invocation raises level above 0
invocations.toggleInvocation(p, 'tombs_of_aelgard', 'toa_normal_health');
invocations.toggleInvocation(p, 'tombs_of_aelgard', 'toa_standard_damage');

// Toggle ON a combat scaling invocation
let r = invocations.toggleInvocation(p, 'tombs_of_aelgard', 'toa_tougher_monsters');
assert('C02  toggle ON combat_scaling ok',     r.ok === true && r.state === 'on');
assert('C03  toggled level > 0',               invocations.currentInvocationLevel(p, 'tombs_of_aelgard') > 0,
  `level=${invocations.currentInvocationLevel(p, 'tombs_of_aelgard')}`);

// Toggle it OFF
r = invocations.toggleInvocation(p, 'tombs_of_aelgard', 'toa_tougher_monsters');
assert('C04  toggle OFF works',                r.ok === true && r.state === 'off');

// Conflict: enable softcore then try hardcore -- should conflict
invocations.toggleInvocation(p, 'tombs_of_aelgard', 'toa_softcore');
const conflictR = invocations.toggleInvocation(p, 'tombs_of_aelgard', 'toa_no_deaths');
assert('C05  conflicting invocations rejected',
  conflictR.ok === false && typeof conflictR.reason === 'string' && conflictR.reason.startsWith('conflicts_with:'));

// Remove softcore, hardcore should now enable
invocations.toggleInvocation(p, 'tombs_of_aelgard', 'toa_softcore');
const hcOk = invocations.toggleInvocation(p, 'tombs_of_aelgard', 'toa_no_deaths');
assert('C06  invocation enables once conflict cleared', hcOk.ok === true);

// Reset
const resetR = invocations.resetInvocations(p, 'tombs_of_aelgard');
assert('C07  reset succeeds', resetR.ok === true);
assert('C08  reset keeps positives ON',
  invocations.getState(p, 'tombs_of_aelgard').enabled.includes('toa_normal_health'));

// ══════════════════════════════════════════════════════════════════════════════
// SECTION D -- LEVEL MATH
// ══════════════════════════════════════════════════════════════════════════════
console.log('\n[D] Level math');

const p2 = makePlayer(2, 'LevelTester');
// Start from a clean slate: disable positives so level starts at 0
invocations.toggleInvocation(p2, 'tombs_of_aelgard', 'toa_normal_health');
invocations.toggleInvocation(p2, 'tombs_of_aelgard', 'toa_standard_damage');
const cleanLevel = invocations.currentInvocationLevel(p2, 'tombs_of_aelgard');
assert('D01  level 0 with positives disabled', cleanLevel === 0);

// Enable a known-weight invocation
invocations.toggleInvocation(p2, 'tombs_of_aelgard', 'toa_tougher_monsters');
const l1 = invocations.currentInvocationLevel(p2, 'tombs_of_aelgard');
assert('D02  level equals invocation weight', l1 === 25, `got ${l1}`);

// Stack another
invocations.toggleInvocation(p2, 'tombs_of_aelgard', 'toa_harder_hits');
const l2 = invocations.currentInvocationLevel(p2, 'tombs_of_aelgard');
assert('D03  stacking adds weights', l2 === 50, `got ${l2}`);

// Enable a high-weight invocation
invocations.toggleInvocation(p2, 'tombs_of_aelgard', 'toa_warden_enrage');
const l3 = invocations.currentInvocationLevel(p2, 'tombs_of_aelgard');
assert('D04  level stacking to triple digits', l3 === 110, `got ${l3}`);

// Max-level-ish: enable many invocations
const all = invocations.availableInvocations('tombs_of_aelgard');
for (const inv of all) {
  if (!invocations.getState(p2, 'tombs_of_aelgard').enabled.includes(inv.id)) {
    const t = invocations.toggleInvocation(p2, 'tombs_of_aelgard', inv.id);
    // conflicts & already-on OK; we just want to push level high
    void t;
  }
}
const maxLevel = invocations.currentInvocationLevel(p2, 'tombs_of_aelgard');
assert('D05  max invocations reach 300+ (OSRS expert+)', maxLevel >= 300, `got ${maxLevel}`);
assert('D06  max invocations reach 500+ on ToA',         maxLevel >= 500, `got ${maxLevel}`);

// ══════════════════════════════════════════════════════════════════════════════
// SECTION E -- SCALED DIFFICULTY
// ══════════════════════════════════════════════════════════════════════════════
console.log('\n[E] Scaled difficulty');

const p3 = makePlayer(3, 'ScaleTester');
// Disable positives
invocations.toggleInvocation(p3, 'chambers_of_aelgard', 'coa_normal_health');
invocations.toggleInvocation(p3, 'chambers_of_aelgard', 'coa_standard_damage');

// Enable combat scaling
invocations.toggleInvocation(p3, 'chambers_of_aelgard', 'coa_toughened_up');      // 1.25x HP
invocations.toggleInvocation(p3, 'chambers_of_aelgard', 'coa_harder_hits');       // 1.15x dmg
invocations.toggleInvocation(p3, 'chambers_of_aelgard', 'coa_acceleration');      // 1.10x atk speed

const state3 = invocations.getState(p3, 'chambers_of_aelgard');
const rawState3 = { enabled: new Set(state3.enabled) };
const diff = invocations.scaledDifficulty('chambers_of_aelgard', rawState3);
assert('E01  hpMultiplier stacks correctly',
  Math.abs(diff.hpMultiplier - 1.25) < 1e-6, `got ${diff.hpMultiplier}`);
assert('E02  damageMultiplier stacks correctly',
  Math.abs(diff.damageMultiplier - 1.15) < 1e-6, `got ${diff.damageMultiplier}`);
assert('E03  bossAttackSpeedMultiplier stacks',
  Math.abs(diff.bossAttackSpeedMultiplier - 1.10) < 1e-6, `got ${diff.bossAttackSpeedMultiplier}`);
assert('E04  level matches sum of weights',
  diff.level === 20 + 25 + 25, `got ${diff.level}`);
assert('E05  approximation flag is false',  diff.approximation === false);

// Test boolean toggles: enable prayer disabled + no-food
invocations.toggleInvocation(p3, 'chambers_of_aelgard', 'coa_no_distraction');
invocations.toggleInvocation(p3, 'chambers_of_aelgard', 'coa_no_food_drops');
const state3b = invocations.getState(p3, 'chambers_of_aelgard');
const diff2 = invocations.scaledDifficulty('chambers_of_aelgard', { enabled: new Set(state3b.enabled) });
assert('E06  prayerDisabled boolean wins',   diff2.prayerDisabled === true);
assert('E07  suppressFoodDrops boolean wins', diff2.suppressFoodDrops === true);

// Test failOnDeath via hardcore
invocations.toggleInvocation(p3, 'chambers_of_aelgard', 'coa_hardcore_run');
const state3c = invocations.getState(p3, 'chambers_of_aelgard');
const diff3 = invocations.scaledDifficulty('chambers_of_aelgard', { enabled: new Set(state3c.enabled) });
assert('E08  hardcore sets failOnDeath',     diff3.failOnDeath === true);
assert('E09  hardcore reduces freeDeaths to 0', diff3.freeDeaths === 0);

// Approximation path (level int only)
const approx = invocations.scaledDifficulty('chambers_of_aelgard', 300);
assert('E10  approximation returns flagged result',   approx.approximation === true);
assert('E11  approximation scales hp by level',       approx.hpMultiplier > 1.2);

// ══════════════════════════════════════════════════════════════════════════════
// SECTION F -- RAID LIFECYCLE
// ══════════════════════════════════════════════════════════════════════════════
console.log('\n[F] Raid lifecycle');

const p4 = makePlayer(4, 'LifecycleTester');
// Disable positives first so invocation level is actually > 0 after toggles
invocations.toggleInvocation(p4, 'chambers_of_aelgard', 'coa_normal_health');
invocations.toggleInvocation(p4, 'chambers_of_aelgard', 'coa_standard_damage');
// Configure some invocations
invocations.toggleInvocation(p4, 'chambers_of_aelgard', 'coa_toughened_up');
invocations.toggleInvocation(p4, 'chambers_of_aelgard', 'coa_harder_hits');

const snap = invocations.onRaidStart(p4, 'chambers_of_aelgard', 100);
assert('F01  onRaidStart returns snapshot',       typeof snap === 'object' && snap !== null);
assert('F02  snapshot has level',                 typeof snap.level === 'number' && snap.level > 0);
assert('F03  snapshot has startedAt tick',        snap.startedAt === 100);
assert('F04  snapshot has raidId',                snap.raidId === 'chambers_of_aelgard');

// Invocations locked during raid
const lockR = invocations.toggleInvocation(p4, 'chambers_of_aelgard', 'coa_acceleration');
assert('F05  toggle during raid is rejected',
  lockR.ok === false && lockR.reason === 'raid_in_progress');
const resetLockR = invocations.resetInvocations(p4, 'chambers_of_aelgard');
assert('F06  reset during raid is rejected',
  resetLockR.ok === false && resetLockR.reason === 'raid_in_progress');

// Complete the raid -- clean run, no deaths, beat par
const complete = invocations.onRaidComplete(p4, 'chambers_of_aelgard', {
  deaths: 0,
  hpLostPct: 0,
  ticksTaken: 5000,
  beatParTime: true,
  kc: 10,
  success: true,
});
assert('F07  onRaidComplete returns points',     typeof complete.points === 'number' && complete.points > 0);
assert('F08  onRaidComplete returns rewards',    typeof complete.rewards === 'object');
assert('F09  onRaidComplete unlocks invocations',
  invocations.toggleInvocation(p4, 'chambers_of_aelgard', 'coa_acceleration').ok === true);

// ══════════════════════════════════════════════════════════════════════════════
// SECTION G -- POINTS FORMULA
// ══════════════════════════════════════════════════════════════════════════════
console.log('\n[G] Points formula');

const base = 1500;

// Clean run at level 0
const p5 = makePlayer(5, 'PointTester');
invocations.toggleInvocation(p5, 'chambers_of_aelgard', 'coa_normal_health');
invocations.toggleInvocation(p5, 'chambers_of_aelgard', 'coa_standard_damage');
invocations.onRaidStart(p5, 'chambers_of_aelgard', 0);
const cleanRun = invocations.onRaidComplete(p5, 'chambers_of_aelgard', {
  deaths: 0, hpLostPct: 0, ticksTaken: 7000, beatParTime: false, kc: 50, success: true,
});
assert('G01  level-0, clean, full kc gives base',
  cleanRun.points === base, `got ${cleanRun.points}`);

// KC 0: +25% mod
const p6 = makePlayer(6, 'KcTester');
invocations.toggleInvocation(p6, 'chambers_of_aelgard', 'coa_normal_health');
invocations.toggleInvocation(p6, 'chambers_of_aelgard', 'coa_standard_damage');
invocations.onRaidStart(p6, 'chambers_of_aelgard', 0);
const freshRun = invocations.onRaidComplete(p6, 'chambers_of_aelgard', {
  deaths: 0, hpLostPct: 0, ticksTaken: 7000, beatParTime: false, kc: 0, success: true,
});
assert('G02  kc 0 grants 1.25 modifier',
  freshRun.points === Math.floor(base * 1.25), `got ${freshRun.points}`);

// Deaths apply penalty
const p7 = makePlayer(7, 'DeathTester');
invocations.toggleInvocation(p7, 'chambers_of_aelgard', 'coa_normal_health');
invocations.toggleInvocation(p7, 'chambers_of_aelgard', 'coa_standard_damage');
invocations.onRaidStart(p7, 'chambers_of_aelgard', 0);
const diedOnce = invocations.onRaidComplete(p7, 'chambers_of_aelgard', {
  deaths: 1, hpLostPct: 0, ticksTaken: 7000, beatParTime: false, kc: 50, success: true,
});
assert('G03  one death drops points 20%',
  diedOnce.points === Math.floor(base * 0.80), `got ${diedOnce.points}`);

// HP lost applies step penalty
const p8 = makePlayer(8, 'HpTester');
invocations.toggleInvocation(p8, 'chambers_of_aelgard', 'coa_normal_health');
invocations.toggleInvocation(p8, 'chambers_of_aelgard', 'coa_standard_damage');
invocations.onRaidStart(p8, 'chambers_of_aelgard', 0);
const hpLoss = invocations.onRaidComplete(p8, 'chambers_of_aelgard', {
  deaths: 0, hpLostPct: 50, ticksTaken: 7000, beatParTime: false, kc: 50, success: true,
});
// 50% / 25% = 2 steps of -10%, so 1.0 * 0.9 * 0.9 = 0.81
assert('G04  50% hp lost drops points ~19%',
  hpLoss.points === Math.floor(base * 0.81), `got ${hpLoss.points}`);

// Beat par time grants +10%
const p9 = makePlayer(9, 'SpeedTester');
invocations.toggleInvocation(p9, 'chambers_of_aelgard', 'coa_normal_health');
invocations.toggleInvocation(p9, 'chambers_of_aelgard', 'coa_standard_damage');
invocations.onRaidStart(p9, 'chambers_of_aelgard', 0);
const speedRun = invocations.onRaidComplete(p9, 'chambers_of_aelgard', {
  deaths: 0, hpLostPct: 0, ticksTaken: 1000, beatParTime: true, kc: 50, success: true,
});
assert('G05  beat par time grants +10%',
  speedRun.points === Math.floor(base * 1.10), `got ${speedRun.points}`);

// Invocation level multiplies
const pA = makePlayer(10, 'InvTester');
invocations.toggleInvocation(pA, 'chambers_of_aelgard', 'coa_toughened_up'); // +25
invocations.onRaidStart(pA, 'chambers_of_aelgard', 0);
const invMod = invocations.onRaidComplete(pA, 'chambers_of_aelgard', {
  deaths: 0, hpLostPct: 0, ticksTaken: 7000, beatParTime: false, kc: 50, success: true,
});
// level is (25 - 50 - 40) clamped to 0 because toughened_up is 25 but positives still count as -90
// Actually positives are ON by default, so level = 25 - 50 - 40 = -65, clamped to 0.
// Let's inspect.
const levelNow = invocations.currentInvocationLevel(pA, 'chambers_of_aelgard');
assert('G06  level clamped at 0 when negatives exceed positives',
  levelNow === 0,
  `got ${levelNow}`);
// Therefore invMod.points should equal base (since level=0)
assert('G07  level 0 gives base points',
  invMod.points === base, `got ${invMod.points}`);

// Test with positives disabled and meaningful level
const pB = makePlayer(11, 'BigLevelTester');
invocations.toggleInvocation(pB, 'chambers_of_aelgard', 'coa_normal_health');    // -50 off
invocations.toggleInvocation(pB, 'chambers_of_aelgard', 'coa_standard_damage');  // -40 off
invocations.toggleInvocation(pB, 'chambers_of_aelgard', 'coa_toughened_up');     // +25
invocations.toggleInvocation(pB, 'chambers_of_aelgard', 'coa_harder_hits');      // +25
invocations.toggleInvocation(pB, 'chambers_of_aelgard', 'coa_acceleration');     // +20
const lvlB = invocations.currentInvocationLevel(pB, 'chambers_of_aelgard');
assert('G08  summed level matches', lvlB === 70, `got ${lvlB}`);
invocations.onRaidStart(pB, 'chambers_of_aelgard', 0);
const highRun = invocations.onRaidComplete(pB, 'chambers_of_aelgard', {
  deaths: 0, hpLostPct: 0, ticksTaken: 7000, beatParTime: false, kc: 50, success: true,
});
// Level 70 means multiplier 1.70
assert('G09  invocation-70 gives 1.70x points',
  highRun.points === Math.floor(base * 1.70), `got ${highRun.points}`);

// Failure floor
const pC = makePlayer(12, 'FailTester');
invocations.onRaidStart(pC, 'chambers_of_aelgard', 0);
const failRun = invocations.onRaidComplete(pC, 'chambers_of_aelgard', {
  deaths: 5, hpLostPct: 300, ticksTaken: 12000, beatParTime: false, kc: 0, success: false,
});
assert('G10  failure gives 5% floor',
  failRun.points === Math.floor(base * 0.05), `got ${failRun.points}`);

// ══════════════════════════════════════════════════════════════════════════════
// SECTION H -- LOOT BUCKETS
// ══════════════════════════════════════════════════════════════════════════════
console.log('\n[H] Loot buckets');

const bkt0 = invocations.pointsTable('chambers_of_aelgard', 0, 500);
assert('H01  0-999 is "low" bucket',            bkt0.bucket === 'low');
assert('H02  low: 1 standard roll',             bkt0.standardRolls === 1);
assert('H03  low: no unique',                   bkt0.uniqueChance === 0 && bkt0.guaranteedUnique === false);

const bkt1 = invocations.pointsTable('chambers_of_aelgard', 100, 1500);
assert('H04  1000-1999 is "mid" bucket',        bkt1.bucket === 'mid');
assert('H05  mid: 2 standard rolls',            bkt1.standardRolls === 2);

const bkt2 = invocations.pointsTable('chambers_of_aelgard', 200, 2500);
assert('H06  2000-2999 is "high" bucket',       bkt2.bucket === 'high');
assert('H07  high: 3 standard rolls + chance',  bkt2.standardRolls === 3 && bkt2.uniqueChance > 0);
assert('H08  high: not guaranteed',             bkt2.guaranteedUnique === false);

const bkt3 = invocations.pointsTable('chambers_of_aelgard', 600, 3500);
assert('H09  3000+ is "elite" bucket',          bkt3.bucket === 'elite');
assert('H10  elite: 4 standard rolls',          bkt3.standardRolls === 4);
assert('H11  elite: guaranteed unique',         bkt3.guaranteedUnique === true && bkt3.uniqueChance === 1.0);

// Level affects unique chance in high bucket
const bktHighLevel = invocations.pointsTable('chambers_of_aelgard', 500, 2500);
const bktLowLevel  = invocations.pointsTable('chambers_of_aelgard', 0,   2500);
assert('H12  high-bucket unique chance scales with level',
  bktHighLevel.uniqueChance > bktLowLevel.uniqueChance);

assert('H13  pointsTable returns drop table ids',
  bkt3.standardTable === 'coa_standard_loot' && bkt3.uniqueTable === 'coa_unique_loot');

// ══════════════════════════════════════════════════════════════════════════════
// SECTION I -- MANIFESTO COMPLIANCE
// ══════════════════════════════════════════════════════════════════════════════
console.log('\n[I] Manifesto compliance');

// Manifesto 17 -- every invocation has a trade-off. Either:
//   - raidLevel > 0 with a cost (mechanic or worse stats)
//   - raidLevel < 0 on a positive (disabling loses points)
// We check: every combat_scaling / mechanic has raidLevel > 0.
//           every positive invocation has raidLevel < 0 (disabling drops points).
let tradeoffViolations = 0;
for (const raidId of RAIDS) {
  const list = invocations.availableInvocations(raidId);
  for (const inv of list) {
    if (inv.category === 'positive' && inv.raidLevel >= 0) tradeoffViolations++;
    if ((inv.category === 'combat_scaling' || inv.category === 'mechanic') && inv.raidLevel <= 0) tradeoffViolations++;
  }
}
assert('I01  Manifesto 17: every invocation has a tradeoff',
  tradeoffViolations === 0,
  `${tradeoffViolations} invocations break tradeoff rule`);

// Manifesto 12 -- higher invocation unlocks encounter-specific BiS. We check
// that the elite (3000+) bucket exposes unique-table loot rolls (which only
// invocation-boosted runs can reasonably reach).
const eliteBucket = invocations.pointsTable('tombs_of_aelgard', 600, 5000);
assert('I02  Manifesto 12: elite bucket grants unique table access',
  eliteBucket.guaranteedUnique === true && typeof eliteBucket.uniqueTable === 'string');

// For each raid, confirm that at high level the unique chance is strictly
// better than at level 0 (this is the encounter-itemization hook).
let levelBenefitsOk = 0;
for (const raidId of RAIDS) {
  const low  = invocations.pointsTable(raidId, 0,   2500);
  const high = invocations.pointsTable(raidId, 500, 2500);
  if (high.uniqueChance > low.uniqueChance) levelBenefitsOk++;
}
assert('I03  Manifesto 12: raid level strictly improves unique chance',
  levelBenefitsOk === RAIDS.length,
  `only ${levelBenefitsOk}/${RAIDS.length} raids showed level benefit`);

// ══════════════════════════════════════════════════════════════════════════════
// SECTION J -- CROSS-RAID API PARITY
// ══════════════════════════════════════════════════════════════════════════════
console.log('\n[J] Cross-raid parity');

// Each raid should support the full API surface without crashing.
let raidParityOk = 0;
for (const raidId of RAIDS) {
  const pp = makePlayer(100 + raidId.length, `Parity-${raidId}`);
  try {
    const list = invocations.availableInvocations(raidId);
    if (!list.length) continue;
    // Toggle the first non-positive invocation
    const firstScaling = list.find(i => i.category !== 'positive');
    if (firstScaling) invocations.toggleInvocation(pp, raidId, firstScaling.id);
    invocations.currentInvocationLevel(pp, raidId);
    invocations.onRaidStart(pp, raidId, 0);
    const cr = invocations.onRaidComplete(pp, raidId, { deaths: 0, hpLostPct: 0, ticksTaken: 1000, beatParTime: true, kc: 1, success: true });
    if (typeof cr.points === 'number' && cr.points > 0) raidParityOk++;
  } catch (e) {
    console.log(`  [parity] ${raidId} threw: ${e.message}`);
  }
}
assert('J01  all 5 raids support full API', raidParityOk === RAIDS.length, `${raidParityOk}/${RAIDS.length}`);

// ══════════════════════════════════════════════════════════════════════════════
// Result summary
// ══════════════════════════════════════════════════════════════════════════════

console.log('\n' + '='.repeat(70));
console.log(`  RESULT: ${passed} passed, ${failed} failed (${passed + failed} assertions)`);
console.log('='.repeat(70));
if (failed > 0) {
  console.log('  Failures:');
  for (const f of failures) console.log(`    - ${f}`);
  process.exit(1);
}
process.exit(0);
