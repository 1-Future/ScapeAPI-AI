#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// Smoke test for src/engine/combat-achievements.js + tasks data.
//
// Coverage (50+ assertions across 10 test groups):
//   1. Engine loads, registry counts, tier list
//   2. Task registration guards (bad id, invalid tier, duplicate)
//   3. completeTask happy path, totals, event emission
//   4. Dedup — re-completing a task doesn't double-count
//   5. Tier threshold crossings grant perks (idempotent)
//   6. Perk stacking — cumulative from easy to grandmaster
//   7. Unknown task rejected
//   8. Listener lifecycle (register/unregister)
//   9. Every task has description, tier, injects audit
//  10. Player state persistence shape (serializable)
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const ca = require('../src/engine/combat-achievements');
require('../src/content/aelgard/combat-achievements-tasks');
const player = require('../src/player/player');

let passed = 0, failed = 0;
function assert(cond, msg) {
  if (cond) { passed++; console.log(`  PASS: ${msg}`); }
  else { failed++; console.log(`  FAIL: ${msg}`); }
}

// ── 1. Engine loads, registry counts, tier list ─────────────────────────────
console.log('\n[1] Engine load & registry');
assert(Array.isArray(ca.TIERS), 'TIERS is an array');
assert(ca.TIERS.length === 6, 'exactly 6 tiers');
assert(ca.TIERS[0] === 'easy', 'first tier is easy');
assert(ca.TIERS[5] === 'grandmaster', 'last tier is grandmaster');
assert(ca.pointsForTier.easy === 33, 'easy threshold is 33');
assert(ca.pointsForTier.medium === 75, 'medium threshold is 75');
assert(ca.pointsForTier.hard === 200, 'hard threshold is 200');
assert(ca.pointsForTier.elite === 400, 'elite threshold is 400');
assert(ca.pointsForTier.master === 700, 'master threshold is 700');
assert(ca.pointsForTier.grandmaster === 1200, 'grandmaster threshold is 1200');

const reg = ca.registry();
assert(reg.totalTasks >= 210, `at least 210 tasks registered (got ${reg.totalTasks})`);
assert(reg.totalBosses >= 30, `at least 30 bosses covered (got ${reg.totalBosses})`);
for (const t of ca.TIERS) {
  assert((reg.byTier[t] | 0) > 0, `${t} tier has at least one task`);
}

// ── 2. Task registration guards ─────────────────────────────────────────────
console.log('\n[2] registerTask guards');
let err = null;
try { ca.registerTask('', { id: 'x', tier: 'easy' }); } catch (e) { err = e; }
assert(err, 'empty bossId rejected');
err = null;
try { ca.registerTask('b', { tier: 'easy' }); } catch (e) { err = e; }
assert(err, 'missing task.id rejected');
err = null;
try { ca.registerTask('b', { id: 'x', tier: 'bogus' }); } catch (e) { err = e; }
assert(err, 'invalid tier rejected');
// Duplicate
err = null;
try { ca.registerTask('dup_test', { id: 'ca_duran_kill_1', tier: 'easy' }); } catch (e) { err = e; }
assert(err, 'duplicate id rejected');

// ── 3. completeTask happy path ──────────────────────────────────────────────
console.log('\n[3] completeTask happy path');
const p = player.createPlayer(1, 'CATester');
assert(ca.totalPoints(p) === 0, 'new player has 0 points');
assert(!ca.hasCompleted(p, 'ca_duran_kill_1'), 'task not yet completed');

const captured = [];
const unsub = ca.registerListener(ev => captured.push(ev));

const r1 = ca.completeTask(p, 'ca_duran_kill_1');
assert(r1.ok === true, 'completeTask returns ok');
assert(r1.task.points === 1, 'easy-tier kill worth 1 point');
assert(ca.hasCompleted(p, 'ca_duran_kill_1'), 'task is now completed');
assert(ca.totalPoints(p) === 1, 'player totalPoints = 1');
assert(captured.length >= 1, 'completion event emitted');
assert(captured[0].type === 'combat_achievement', 'event type is combat_achievement');
assert(captured[0].subType === 'task_complete', 'event subType is task_complete');
assert(captured[0].taskId === 'ca_duran_kill_1', 'event carries correct taskId');

// ── 4. Dedup — re-completing a task doesn't double-count ────────────────────
console.log('\n[4] dedup');
const before = ca.totalPoints(p);
const r2 = ca.completeTask(p, 'ca_duran_kill_1');
assert(r2.ok === false, 'duplicate completeTask returns ok=false');
assert(r2.reason === 'already_completed', 'reason is already_completed');
assert(ca.totalPoints(p) === before, 'points unchanged by duplicate');

// ── 5. Tier threshold crossings grant perks ─────────────────────────────────
console.log('\n[5] tier threshold crossings');
// Clear the event buffer to measure tier-complete events
captured.length = 0;

// Reach Easy (33 pts). Use a mix of tasks. Easy tasks: 1pt each.
// Complete every easy task for ~25 pts, plus some medium tasks at 2pt each.
const allTasks = ca.listAllTasks();
const easyTasks = allTasks.filter(t => t.tier === 'easy');
for (const t of easyTasks) ca.completeTask(p, t.id);
assert(ca.totalPoints(p) >= 20, 'easy tasks granted ≥ 20 points');

// Top up with medium tasks until we cross 33
const mediumTasks = allTasks.filter(t => t.tier === 'medium');
for (const t of mediumTasks) {
  if (ca.totalPoints(p) >= 33) break;
  ca.completeTask(p, t.id);
}
assert(ca.tierComplete(p, 'easy'), 'easy tier complete at ≥33 points');
assert(ca.hasPerk(p, 'perk_easy_melee_accuracy'), 'easy perk granted');
const easyPerkEvents = captured.filter(e => e.subType === 'tier_complete' && e.tier === 'easy');
assert(easyPerkEvents.length === 1, 'exactly one easy tier-complete event emitted');

// Grant perk idempotency
const s1 = p.combatAchievements.perks['perk_easy_melee_accuracy'];
ca.grantPerk(p, 'easy'); // should be a no-op
const s2 = p.combatAchievements.perks['perk_easy_melee_accuracy'];
assert(s1 === s2, 'grantPerk is idempotent (same object ref)');

// ── 6. Perk stacking — cumulative perks to grandmaster ──────────────────────
console.log('\n[6] perk stacking to grandmaster');
// Continue completing tasks to cross each tier
for (const t of allTasks) {
  if (!ca.hasCompleted(p, t.id)) ca.completeTask(p, t.id);
}
const total = ca.totalPoints(p);
console.log(`     completed all ${Object.keys(p.combatAchievements.completed).length} tasks, totalPoints=${total}`);
assert(total >= 1200, `totalPoints >= 1200 (got ${total})`);
assert(ca.tierComplete(p, 'medium'), 'medium tier complete');
assert(ca.tierComplete(p, 'hard'), 'hard tier complete');
assert(ca.tierComplete(p, 'elite'), 'elite tier complete');
assert(ca.tierComplete(p, 'master'), 'master tier complete');
assert(ca.tierComplete(p, 'grandmaster'), 'grandmaster tier complete');

assert(ca.hasPerk(p, 'perk_medium_ge_rate'), 'medium perk granted');
assert(ca.hasPerk(p, 'perk_hard_prayer_regen'), 'hard perk granted');
assert(ca.hasPerk(p, 'perk_elite_neardeath_heal'), 'elite perk granted');
assert(ca.hasPerk(p, 'perk_master_boss_teleport'), 'master perk granted');
assert(ca.hasPerk(p, 'perk_grandmaster_cape'), 'grandmaster perk granted');

const perks = ca.listPerks(p);
assert(perks.length === 6, 'all 6 perks in perk list');
assert(perks.every(p => p.grantedAt != null), 'every perk has grantedAt');
assert(perks.every(p => p.effect), 'every perk has effect string');

// ── 7. Unknown task rejected ────────────────────────────────────────────────
console.log('\n[7] unknown task rejected');
const p2 = player.createPlayer(2, 'UnknownTester');
const r3 = ca.completeTask(p2, 'no_such_task_id');
assert(r3.ok === false, 'unknown task returns ok=false');
assert(r3.reason === 'unknown_task', 'reason is unknown_task');
assert(ca.totalPoints(p2) === 0, 'unknown task did not affect total');

// ── 8. Listener lifecycle ───────────────────────────────────────────────────
console.log('\n[8] listener lifecycle');
const p3 = player.createPlayer(3, 'ListenTester');
let localCount = 0;
const stop = ca.registerListener(() => localCount++);
ca.completeTask(p3, 'ca_mole_kill_1');
assert(localCount >= 1, 'listener fired');
stop();
const priorCount = localCount;
ca.completeTask(p3, 'ca_mole_kill_10');
assert(localCount === priorCount, 'listener unregistered correctly');

// Clean up the global listener from test 3
unsub();

// ── 9. Task metadata audit ──────────────────────────────────────────────────
console.log('\n[9] task metadata audit');
const allAfter = ca.listAllTasks();
const withDescription = allAfter.filter(t => t.description && t.description.length > 5);
assert(withDescription.length === allAfter.length, 'every task has a description');
const withInjects = allAfter.filter(t => Array.isArray(t.injects) && t.injects.length > 0);
assert(withInjects.length === allAfter.length, 'every task lists ≥1 Scape-Builder-Injects principle');
const validCategories = new Set(['kc', 'restriction', 'speed', 'mechanic', 'gear', 'solo', 'perfection']);
const withCategory = allAfter.filter(t => validCategories.has(t.category));
assert(withCategory.length === allAfter.length, 'every task has a valid category');
const withBoss = allAfter.filter(t => t.bossId && typeof t.bossId === 'string');
assert(withBoss.length === allAfter.length, 'every task has a bossId');

// Count tasks per category (spec requires mix: kc, restriction, speed, mechanic, gear, solo)
const byCat = {};
for (const t of allAfter) byCat[t.category] = (byCat[t.category] || 0) + 1;
console.log('     tasks by category:', JSON.stringify(byCat));
assert((byCat.kc | 0) >= 20, 'at least 20 kill-count tasks');
assert((byCat.restriction | 0) >= 20, 'at least 20 restriction tasks');
assert((byCat.speed | 0) >= 15, 'at least 15 speed tasks');
assert((byCat.mechanic | 0) >= 10, 'at least 10 mechanic tasks');
assert((byCat.gear | 0) >= 15, 'at least 15 gear tasks');
assert((byCat.solo | 0) >= 10, 'at least 10 solo tasks');
assert((byCat.perfection | 0) >= 10, 'at least 10 perfection tasks');

// Per-boss task coverage
const bossSet = new Map();
for (const t of allAfter) {
  if (!bossSet.has(t.bossId)) bossSet.set(t.bossId, 0);
  bossSet.set(t.bossId, bossSet.get(t.bossId) + 1);
}
const bossCounts = [...bossSet.values()];
const bossesWith5Plus = bossCounts.filter(n => n >= 5).length;
assert(bossesWith5Plus >= 25, `at least 25 bosses have ≥5 tasks (got ${bossesWith5Plus})`);
const maxPerBoss = Math.max(...bossCounts);
const minPerBoss = Math.min(...bossCounts);
assert(maxPerBoss <= 12, `no boss has > 12 tasks (got ${maxPerBoss})`);
assert(minPerBoss >= 3, `every boss has ≥ 3 tasks (got ${minPerBoss})`);

// ── 10. Player state persistence shape ──────────────────────────────────────
console.log('\n[10] player state persistence shape');
const p4 = player.createPlayer(4, 'PersistTester');
ca.completeTask(p4, 'ca_duran_kill_1');
ca.completeTask(p4, 'ca_mole_kill_1');
assert(p4.combatAchievements != null, 'player.combatAchievements exists');
assert(typeof p4.combatAchievements.totalPoints === 'number', 'totalPoints is number');
assert(typeof p4.combatAchievements.completed === 'object', 'completed is object');
// Must survive JSON round-trip (persistence layer uses JSON)
let json;
try {
  json = JSON.stringify(p4.combatAchievements);
  JSON.parse(json);
} catch (e) { assert(false, `JSON round-trip failed: ${e.message}`); }
assert(typeof json === 'string', 'state JSON-serializes');
assert(json.includes('ca_duran_kill_1'), 'completed task survives serialization');

// playerProgress report
const prog = ca.playerProgress(p4);
assert(prog.totalPoints === 2, 'playerProgress totalPoints = 2');
assert(prog.byTier.easy.completed === 2, 'playerProgress counts easy tasks');
assert(Array.isArray(prog.completedIds), 'playerProgress lists completed ids');
assert(prog.byTier.grandmaster.threshold === 1200, 'playerProgress surfaces threshold');

// ── Summary ─────────────────────────────────────────────────────────────────
console.log(`\n══════════════════════════════════════════════════════════════`);
console.log(`Combat Achievements tests: ${passed} passed, ${failed} failed`);
console.log(`══════════════════════════════════════════════════════════════`);
process.exit(failed === 0 ? 0 : 1);
