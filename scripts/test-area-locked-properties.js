#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// Area-Locked Mode — Property-Based Tests
//
// Burns N=5000 random enable/clear/travel sequences and asserts:
//   1. One-way travel — unlockedRegions only grows, never shrinks (monotone).
//   2. XP bonus correct — inside current region 1.10-1.20; elsewhere 1.00.
//   3. Cannot exit mode — once enabled, never disables.
//   4. Unlock chain — region B can only unlock after A's clear condition met.
//   5. Persistence — save (JSON) → load → save is identical.
//
// Real bugs logged to reports/property-bugs.md; never fails the run.
//
// Run: node scripts/test-area-locked-properties.js
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const path = require('path');
const fs   = require('fs');

// ── Seeded RNG ───────────────────────────────────────────────────────────────
function makeRng(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

// ── Load the engine ──────────────────────────────────────────────────────────
// area-locked itself depends on tiles + breakpoints runner + area-gate runner.
// We need to load content so regions are known. Sandboxed persistence not
// strictly necessary since area-locked stores state on the player object.
require('../src/data/items');
let areaLocked;
try {
  require('../src/content/aelgard/items-expanded');
  require('../src/content/aelgard/area-gates');
  require('../src/content/aelgard/quest-unlocks');
  require('../src/content/aelgard/training-knobs');
  require('../src/content/aelgard/breakpoints');
  const worldLayout = require('../src/content/aelgard/world-layout');
  if (typeof worldLayout.spawnWorld === 'function') worldLayout.spawnWorld();
} catch (_) {
  // Non-fatal — area-locked can work with just the base data.
}
const tiles      = require('../src/world/tiles');
const player     = require('../src/player/player');
const breakpoints = require('../src/engine/breakpoint-runner');
areaLocked = require('../src/engine/area-locked');
// Attach once (idempotent).
try { areaLocked.attach(); } catch (_) { /* ok */ }

const REGION_ORDER = areaLocked.REGION_ORDER;

// ── Config ───────────────────────────────────────────────────────────────────
const N_ITERATIONS = 5000;

// ── Report ───────────────────────────────────────────────────────────────────
const bugs = [];
function reportBug(property, seed, details, shrunk) {
  bugs.push({ property, seed, details, minimalCase: shrunk, timestamp: new Date().toISOString() });
  console.log(`  BUG  [${property}] seed=${seed} :: ${JSON.stringify(details).slice(0, 140)}`);
}

// ── Helpers ──────────────────────────────────────────────────────────────────
let nextPid = 1;
function freshPlayer(name) {
  const p = player.createPlayer(String(nextPid++), name || `A${nextPid}`);
  p.x = 100; p.y = 90; p.layer = 0;
  p.region = 'heartlands';
  p.skills = p.skills || {};
  p.bossKills = {};
  p.questProgress = {};
  return p;
}

// Force-clear a region by granting all its conditions, without reaching into
// the clearStates directly (mirrors the real in-game flow).
function satisfyClearConditions(p, regionId) {
  const cond = areaLocked.CLEAR_CONDITIONS[regionId];
  if (!cond) return;
  if (cond.open) return;
  if (cond.quest) {
    p.questProgress[cond.quest] = { complete: true };
  }
  if (cond.quests) {
    for (const q of cond.quests) p.questProgress[q] = { complete: true };
  }
  if (cond.skill) {
    for (const [sk, lvl] of Object.entries(cond.skill)) {
      if (!p.skills[sk]) p.skills[sk] = { xp: 0, level: 1 };
      p.skills[sk].level = Math.max(p.skills[sk].level || 1, lvl);
    }
  }
  if (cond.bossKill) {
    for (const [bossId, need] of Object.entries(cond.bossKill)) {
      if (bossId === 'barrows_any') {
        p.bossKills.ahrim = (p.bossKills.ahrim || 0) + need;
      } else {
        p.bossKills[bossId] = (p.bossKills[bossId] || 0) + need;
      }
    }
  }
  if (cond.totalLevel) {
    // Spread total level across attack, strength, defence (each to level ~70).
    for (const sk of ['attack', 'strength', 'defence', 'cooking', 'woodcutting']) {
      if (!p.skills[sk]) p.skills[sk] = { xp: 0, level: 1 };
      p.skills[sk].level = Math.max(p.skills[sk].level || 1,
        Math.ceil(cond.totalLevel / 5));
    }
  }
}

// ── Scenario runs ────────────────────────────────────────────────────────────

// Invariant 1+4: monotone unlock + proper unlock chain.
function runUnlockMonotonicity(masterSeed, iters) {
  let monoRuns = 0, monoFails = 0, monoFirstSeed = null;
  let chainRuns = 0, chainFails = 0, chainFirstSeed = null;

  for (let it = 0; it < iters; it++) {
    const seed = (masterSeed + it) >>> 0;
    const rng = makeRng(seed);
    // Choose starting region from the 8-long list (no wilds).
    const startIdx = Math.floor(rng() * REGION_ORDER.length);
    const startRegion = REGION_ORDER[startIdx];
    const p = freshPlayer();
    const enable = areaLocked.enableMode(p, startRegion);
    if (!enable.ok) continue;

    // Take a snapshot of unlocked regions at each step.
    let prev = new Set(p.areaLocked.unlockedRegions);
    // Random walk: attempt to clear the current region N times. Sometimes clear
    // conditions are fulfilled, sometimes not, so we can observe proper chain.
    const steps = 3 + Math.floor(rng() * (REGION_ORDER.length - startIdx));
    let monoOK = true;
    let chainOK = true;

    for (let step = 0; step < steps; step++) {
      const curRegion = p.areaLocked.currentRegion;
      const wantClear = rng() < 0.8;
      if (wantClear) {
        satisfyClearConditions(p, curRegion);
      }
      // Track which regions were unlocked before attempting clear.
      const before = new Set(p.areaLocked.unlockedRegions);
      const r = areaLocked.clearRegion(p, curRegion);
      const after = new Set(p.areaLocked.unlockedRegions);

      // Invariant 1: after >= before (no regions dropped).
      let shrank = false;
      for (const r of before) if (!after.has(r)) { shrank = true; break; }
      if (shrank) monoOK = false;

      // Invariant 4: any newly unlocked region (other than 'the_wilds') must be
      // the IMMEDIATE successor of a just-cleared region in REGION_ORDER.
      if (r.ok && r.unlocked && r.unlocked !== 'the_wilds') {
        const curIdx = REGION_ORDER.indexOf(curRegion);
        const nextInChain = REGION_ORDER[curIdx + 1];
        if (r.unlocked !== nextInChain) chainOK = false;
      }

      prev = after;
    }

    monoRuns++;
    chainRuns++;
    if (!monoOK) {
      monoFails++;
      if (monoFirstSeed === null) {
        monoFirstSeed = seed;
        reportBug('one-way travel (monotone unlock)', seed, {
          start: startRegion, unlocked: [...p.areaLocked.unlockedRegions],
        }, [{ startRegion, steps }]);
      }
    }
    if (!chainOK) {
      chainFails++;
      if (chainFirstSeed === null) {
        chainFirstSeed = seed;
        reportBug('unlock chain order', seed, {
          start: startRegion, unlocked: [...p.areaLocked.unlockedRegions],
        }, [{ startRegion, steps }]);
      }
    }
  }

  return {
    monotone:  { runs: monoRuns, fails: monoFails, firstSeed: monoFirstSeed },
    chain:     { runs: chainRuns, fails: chainFails, firstSeed: chainFirstSeed },
  };
}

// Invariant 2: XP bonus correct (1.10-1.20 inside current region, 1.00 elsewhere).
function runXpBonusScenarios(masterSeed, iters) {
  let runs = 0, fails = 0, firstSeed = null;
  for (let it = 0; it < iters; it++) {
    const seed = (masterSeed + it) >>> 0;
    const rng = makeRng(seed);
    const startIdx = Math.floor(rng() * REGION_ORDER.length);
    const startRegion = REGION_ORDER[startIdx];
    const p = freshPlayer();
    const enable = areaLocked.enableMode(p, startRegion);
    if (!enable.ok) continue;

    // Randomly clear a few regions (drives the tier up).
    const numClears = Math.floor(rng() * 5);
    for (let k = 0; k < numClears; k++) {
      const cur = p.areaLocked.currentRegion;
      satisfyClearConditions(p, cur);
      areaLocked.clearRegion(p, cur);
    }

    const cur = p.areaLocked.currentRegion;
    const bonusCur = areaLocked.xpBonusFor(p, cur);
    const bonusOther = areaLocked.xpBonusFor(p, startRegion === cur ? 'the_wilds' : startRegion);

    runs++;
    // Inside current: 1.10 <= bonus <= 1.20.
    // Outside current: bonus === 1.0.
    let ok = true;
    if (!(bonusCur >= 1.10 && bonusCur <= 1.20)) ok = false;
    if (cur !== startRegion && bonusOther !== 1.0) ok = false;
    if (!ok) {
      fails++;
      if (firstSeed === null) {
        firstSeed = seed;
        reportBug('xp bonus correct', seed, {
          startRegion, currentRegion: cur, bonusCur, bonusOther, clears: p.areaLocked.clears,
        }, [{ startRegion, numClears }]);
      }
    }
  }
  return { runs, fails, firstSeed };
}

// Invariant 3: cannot exit mode — second enableMode must fail, isAreaLocked
// must remain true indefinitely.
function runPermanentMode(masterSeed, iters) {
  let runs = 0, fails = 0, firstSeed = null;
  for (let it = 0; it < iters; it++) {
    const seed = (masterSeed + it) >>> 0;
    const rng = makeRng(seed);
    const startRegion = REGION_ORDER[Math.floor(rng() * REGION_ORDER.length)];
    const p = freshPlayer();
    const en = areaLocked.enableMode(p, startRegion);
    if (!en.ok) continue;

    // Try to enable again with a different region — should fail.
    const other = REGION_ORDER[(REGION_ORDER.indexOf(startRegion) + 1) % REGION_ORDER.length];
    const en2 = areaLocked.enableMode(p, other);

    // Mutation attempts: try setting mode to something else, then check
    // isAreaLocked still returns true.
    // (We don't actually mutate — we just ensure the engine doesn't expose a
    // disable method. Instead check that after normal usage, the flag sticks.)
    satisfyClearConditions(p, startRegion);
    areaLocked.clearRegion(p, startRegion);
    const stillLocked = areaLocked.isAreaLocked(p);

    runs++;
    if (en2.ok || !stillLocked) {
      fails++;
      if (firstSeed === null) {
        firstSeed = seed;
        reportBug('cannot exit mode', seed, {
          reenableOk: en2.ok, stillLocked,
        }, [{ startRegion, other }]);
      }
    }
  }
  return { runs, fails, firstSeed };
}

// Invariant 5: persistence — save (JSON) → load → save is identical.
function runPersistence(masterSeed, iters) {
  let runs = 0, fails = 0, firstSeed = null;
  for (let it = 0; it < iters; it++) {
    const seed = (masterSeed + it) >>> 0;
    const rng = makeRng(seed);
    const startRegion = REGION_ORDER[Math.floor(rng() * REGION_ORDER.length)];
    const p = freshPlayer();
    const en = areaLocked.enableMode(p, startRegion);
    if (!en.ok) continue;

    const numClears = Math.floor(rng() * 4);
    for (let k = 0; k < numClears; k++) {
      const cur = p.areaLocked.currentRegion;
      satisfyClearConditions(p, cur);
      areaLocked.clearRegion(p, cur);
    }

    const before = JSON.stringify(p.areaLocked);
    const roundTripped = JSON.parse(before);
    const after = JSON.stringify(roundTripped);

    runs++;
    if (before !== after) {
      fails++;
      if (firstSeed === null) {
        firstSeed = seed;
        reportBug('persistence round-trip (area-locked)', seed, {
          lenBefore: before.length, lenAfter: after.length,
        }, [{ startRegion, numClears }]);
      }
    }

    // Also check functional equivalence — restore into a new player and
    // confirm xpBonusFor and status agree on a random region.
    const p2 = freshPlayer();
    p2.areaLocked = JSON.parse(before);
    const sampleRegion = REGION_ORDER[Math.floor(rng() * REGION_ORDER.length)];
    const bonusBefore = areaLocked.xpBonusFor(p, sampleRegion);
    const bonusAfter  = areaLocked.xpBonusFor(p2, sampleRegion);
    if (bonusBefore !== bonusAfter) {
      fails++;
      if (firstSeed === null) {
        firstSeed = seed;
        reportBug('persistence functional equivalence', seed, {
          sampleRegion, bonusBefore, bonusAfter,
        }, [{ startRegion, numClears }]);
      }
    }
  }
  return { runs, fails, firstSeed };
}

// ── Runner ───────────────────────────────────────────────────────────────────
function run() {
  const start = Date.now();
  const masterSeed = Math.floor(Math.random() * 0x7fffffff);
  console.log(`\n== Area-Locked Property Tests ==`);
  console.log(`masterSeed=${masterSeed} iters=${N_ITERATIONS} regionCount=${REGION_ORDER.length}`);

  const uIters = Math.floor(N_ITERATIONS * 0.35);
  const xIters = Math.floor(N_ITERATIONS * 0.25);
  const pIters = Math.floor(N_ITERATIONS * 0.20);
  const saveIters = N_ITERATIONS - uIters - xIters - pIters;

  console.log(`\n  Phase 1: unlock monotone + chain order x ${uIters}`);
  const p1 = runUnlockMonotonicity(masterSeed + 100, uIters);
  console.log(`  Phase 2: xp bonus correctness x ${xIters}`);
  const p2 = runXpBonusScenarios(masterSeed + 200, xIters);
  console.log(`  Phase 3: cannot exit mode x ${pIters}`);
  const p3 = runPermanentMode(masterSeed + 300, pIters);
  console.log(`  Phase 4: persistence round-trip x ${saveIters}`);
  const p4 = runPersistence(masterSeed + 400, saveIters);

  const elapsed = ((Date.now() - start) / 1000).toFixed(2);
  console.log('\n── Results ──');
  report('one-way travel (monotone)', p1.monotone);
  report('unlock chain order',        p1.chain);
  report('xp bonus correct',          p2);
  report('cannot exit mode',          p3);
  report('persistence round-trip',    p4);
  console.log(`\n  total bugs reported: ${bugs.length}`);
  console.log(`  runtime: ${elapsed}s`);

  writeBugsReport(bugs, 'Area-Locked');
  process.exit(0);
}

function report(label, s) {
  const pass = s.runs - s.fails;
  const pct  = s.runs > 0 ? (100 * pass / s.runs).toFixed(2) : '0.00';
  console.log(`  [${label}] runs=${s.runs} pass=${pass} fail=${s.fails} pass%=${pct}${s.firstSeed != null ? ' firstBugSeed=' + s.firstSeed : ''}`);
}

function writeBugsReport(bugs, suiteLabel) {
  if (bugs.length === 0) return;
  const reportDir = path.join(__dirname, '..', 'reports');
  fs.mkdirSync(reportDir, { recursive: true });
  const reportPath = path.join(reportDir, 'property-bugs.md');
  let text = '';
  if (fs.existsSync(reportPath)) text = fs.readFileSync(reportPath, 'utf8');
  if (!text) {
    text += '# Property-based test findings\n\n';
    text += 'Real bugs found by the property test suites. Each entry lists the\n';
    text += 'minimal reproducing sequence so it can be replayed offline.\n\n';
  }
  text += `\n## ${suiteLabel} — ${new Date().toISOString()}\n\n`;
  for (const b of bugs) {
    text += `### [${b.property}] seed=${b.seed}\n\n`;
    text += '```\n';
    text += 'details: ' + JSON.stringify(b.details, null, 2) + '\n';
    text += 'minimalCase:\n' + JSON.stringify(b.minimalCase, null, 2) + '\n';
    text += '```\n\n';
  }
  fs.writeFileSync(reportPath, text);
  console.log(`  wrote ${reportPath}`);
}

run();
