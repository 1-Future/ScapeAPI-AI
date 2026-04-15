#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// Benchmark threshold regression test
//
// Consumes reports/benchmarks.json (produced by scripts/benchmark.js) and
// asserts a set of LOOSE thresholds that shouldn't regress. These thresholds
// are intentionally lax — 5-10x slacker than the primary targets in
// benchmark.js — so day-to-day perf variance doesn't flap CI. They exist to
// catch genuine 10x+ regressions.
//
// Run: node scripts/test-bench-thresholds.js
// Exit 0 on all-pass, 1 on any fail.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const fs = require('fs');
const path = require('path');

const REPO_ROOT = process.cwd();
const REPORT_PATH = path.join(REPO_ROOT, 'reports', 'benchmarks.json');

// ── Harness ──────────────────────────────────────────────────────────────────
let passed = 0, failed = 0;
const failures = [];

function assert(cond, msg) {
  if (cond) { passed++; console.log(`  ok   ${msg}`); }
  else      { failed++; failures.push(msg); console.log(`  FAIL ${msg}`); }
}

function assertLE(actual, bound, label) {
  assert(actual <= bound, `${label}: ${actual} <= ${bound}`);
}
function assertGE(actual, bound, label) {
  assert(actual >= bound, `${label}: ${actual} >= ${bound}`);
}
function assertEq(actual, expected, label) {
  assert(actual === expected, `${label}: ${JSON.stringify(actual)} === ${JSON.stringify(expected)}`);
}

// ── Load report ──────────────────────────────────────────────────────────────
if (!fs.existsSync(REPORT_PATH)) {
  console.error(`FAIL: ${REPORT_PATH} not found. Run scripts/benchmark.js first.`);
  process.exit(1);
}
const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'));
const { ge, players, persist, bp } = report.data;

console.log(`== Checking thresholds against ${REPORT_PATH}`);
console.log(`   Generated: ${report.generatedAt}`);
console.log('');

// ── GE thresholds (loose: 10x the 20ms target, 0.1x the 1k matches/s target) ──
console.log('Bench 1 — Grand Exchange');
assertLE(ge.avgTick, 200, 'GE avg matchTick (ms, loose)');                 // 1
assertLE(ge.p95, 400, 'GE p95 matchTick (ms, loose)');                     // 2
assertLE(ge.p99, 600, 'GE p99 matchTick (ms, loose)');                     // 3
assertGE(ge.matchesPerSec, 100, 'GE hot matches/second (loose)');          // 4
assertGE(ge.totalOpen, 19000, 'GE open offers after placement');           // 5
assertLE(ge.placeMs, 10_000, 'GE placeOffer × 20000 total time (ms)');     // 6
assertEq(ge.placeFails, 0, 'GE place failures');                           // 7
console.log('');

// ── Tick thresholds ──
console.log('Bench 2 — Tick loop');
assertLE(players.avg, 100, 'Tick avg (ms, loose budget)');                 // 8
assertLE(players.p50, 100, 'Tick p50 (ms, loose)');                        // 9
assertLE(players.p95, 200, 'Tick p95 (ms, loose)');                        // 10
assertLE(players.p99, 300, 'Tick p99 (ms, loose)');                        // 11
assertLE(players.maxTick, 600, 'Tick max (ms — never exceed budget)');     // 12
assertEq(players.overBudget, 0, 'Tick over-budget count');                 // 13
console.log('');

// ── Persistence thresholds (very loose: 10x target) ──
console.log('Bench 3 — Persistence');
assertLE(persist.saveMs, 30_000, 'Persistence save (ms, loose)');          // 14
assertLE(persist.loadMs, 30_000, 'Persistence load (ms, loose)');          // 15
assertLE(persist.totalMB, 500, 'Persistence disk footprint (MB, loose)');  // 16
assertEq(persist.geOrders, 20_000, 'GE orders roundtrip');                 // 17
assertEq(persist.clanCount, 50, 'Clan count roundtrip');                   // 18
assertEq(persist.graveCount, 500, 'Grave count roundtrip');                // 19
assertEq(persist.playerCount, 100, 'Player count roundtrip');              // 20
console.log('');

// ── Breakpoints ──
console.log('Bench 4 — Breakpoints');
assertGE(bp.evsPerSec, 10_000, 'Breakpoint events/sec (loose: 10k)');      // 21
assertLE(bp.memPerSub, 10, 'Breakpoint KB per subscriber (loose)');        // 22
assertEq(bp.listenersAfterLeak, bp.baseline, 'No listener leak');          // 23
assertEq(bp.noLeak, true, 'noLeak flag');                                  // 24
assertEq(bp.hits, 10_000_000, 'Breakpoint listener invocations');          // 25
assertEq(bp.listenersAfterSub, 1000, 'Listener count after 1000 subs');    // 26
console.log('');

// ── Overall ──
console.log('Summary');
assertLE(report.runtimeMs, 60_000, 'Benchmark total runtime (ms, loose)'); // 27
assertEq(Array.isArray(report.perfBugs) ? report.perfBugs.length : 0, 0, 'No perf bugs logged'); // 28

console.log('');
console.log(`Passed: ${passed}  Failed: ${failed}  Total: ${passed + failed}`);
if (failed) {
  console.log('\nFailures:');
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
process.exit(0);
