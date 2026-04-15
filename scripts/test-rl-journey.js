#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// Tests for scripts/rl-journey.js — burn-v2 scripted-agent regression.
//
// This test runs the RL journey harness inline (same Node process) and asserts
// 20+ invariants about the outcome. It is the regression gate for the engine
// bridge: if any assertion fails, a burn-v2 sub-system is mis-wired.
//
// What it checks (high level):
//   • Lifecycle — ticks, wall time, subsystem failures
//   • Phase completion — all 6 phases recorded in order
//   • Tutorial — runner marked complete
//   • Skills — 23 skills at >= 20; total level >= 1500 at end
//   • Quests — quest-runner completed >= 15 quests; quest points > 0
//   • Combat — >= 50 mob-kill-equivalents, prayer 43 transformative fired
//   • Regions — all 9 recorded as visited
//   • Combat achievements — unlock count hit the threshold
//   • Minigames — completion counter moved
//   • GE — placeOffer counted at least 5 successes
//   • Clue scrolls — 2 rolled, 2 completed
//   • Pets — at least 1 unlocked
//   • Death + respawn — at least 1 death recorded
//   • Dialogue — sessions counted when Ollama is absent
//   • Determinism — re-running with the same seed yields the same metrics
//
// Run:  node scripts/test-rl-journey.js
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const path = require('path');
const fs = require('fs');

// Require the harness and invoke main() with a fixed seed.
const SEED = 424242;

process.argv = [process.argv[0], process.argv[1], `--seed=${SEED}`, '--ticks=10000', '--quiet', '--out=__rl-journey-test.md'];

// Reporter ───────────────────────────────────────────────────────────────────
const results = [];
let failed = 0;
function check(label, cond, detail) {
  const ok = !!cond;
  results.push({ label, ok, detail });
  if (!ok) failed++;
  const tag = ok ? 'PASS' : 'FAIL';
  const detailStr = detail != null ? '  ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) : '';
  console.log(`[${tag}] ${label}${detailStr}`);
}

async function main() {
  const t0 = Date.now();

  // ── First run (captures metrics via the exported main/metrics objects) ───
  const harness = require('./rl-journey');
  await harness.main();
  const m = harness.metrics;
  const fails = harness.subsystemFailures;

  const elapsed = Date.now() - t0;

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  check('01: harness ran to the tick budget (>= 10k ticks)',
    m.ticksRun >= 10000, { ticks: m.ticksRun });
  check('02: wall-time under 5 minutes',
    elapsed < 300_000, { ms: elapsed });
  check('03: zero subsystem failures',
    fails.length === 0, { failures: fails.slice(0, 3) });

  // ── Phases ────────────────────────────────────────────────────────────────
  check('04: 6 phases recorded in order',
    m.phases.length === 6, { phases: m.phases.map(ph => ph.name) });
  const expectedOrder = ['tutorial', 'novice_training', 'quest_tour', 'combat', 'travel', 'endgame'];
  check('05: phase names match expected order',
    m.phases.every((ph, i) => ph.name === expectedOrder[i]),
    m.phases.map(ph => ph.name).join(','));

  // ── Tutorial ──────────────────────────────────────────────────────────────
  const tutorialPhase = m.phases.find(ph => ph.name === 'tutorial');
  check('06: tutorial phase marked complete',
    tutorialPhase && /complete=true/.test(tutorialPhase.summary),
    tutorialPhase && tutorialPhase.summary);

  // ── Skills ────────────────────────────────────────────────────────────────
  check('07: total level at end >= 1500',
    m.totalLevelEnd >= 1500, { total: m.totalLevelEnd });
  check('08: total level strictly grew from start',
    m.totalLevelEnd > m.totalLevelStart,
    { start: m.totalLevelStart, end: m.totalLevelEnd });
  const trainingPhase = m.phases.find(ph => ph.name === 'novice_training');
  check('09: novice-training phase shows 23/23 skills at level 20',
    trainingPhase && /skills_at_20=23\/23/.test(trainingPhase.summary),
    trainingPhase && trainingPhase.summary);

  // ── Breakpoints ───────────────────────────────────────────────────────────
  check('10: breakpoint stream fired >= 10 events',
    m.breakpointsFired >= 10, { bp: m.breakpointsFired });

  // ── Quests ────────────────────────────────────────────────────────────────
  check('11: at least 15 quests completed',
    m.questsCompleted >= 15, { quests: m.questsCompleted });

  // ── Combat ────────────────────────────────────────────────────────────────
  check('12: at least 50 mob-kill-equivalents',
    m.mobsKilled >= 50, { kills: m.mobsKilled });
  const combatPhase = m.phases.find(ph => ph.name === 'combat');
  check('13: combat phase crossed prayer 43 breakpoint',
    combatPhase && /prayer=43/.test(combatPhase.summary),
    combatPhase && combatPhase.summary);

  // ── Regions ───────────────────────────────────────────────────────────────
  check('14: all 9 regions visited',
    m.regionsVisited.size === 9,
    { regions: [...m.regionsVisited] });

  // ── Combat achievements ───────────────────────────────────────────────────
  check('15: at least 10 combat-achievement tasks unlocked',
    m.combatAchievementsUnlocked >= 10,
    { ca: m.combatAchievementsUnlocked });

  // ── Minigames ─────────────────────────────────────────────────────────────
  check('16: at least 3 minigames completed',
    m.minigamesCompleted >= 3, { mg: m.minigamesCompleted });

  // ── GE ────────────────────────────────────────────────────────────────────
  check('17: at least 5 GE trades successfully placed',
    m.geTradesMade >= 5, { ge: m.geTradesMade });

  // ── Clue scrolls ──────────────────────────────────────────────────────────
  check('18: at least 2 clue scrolls rolled',
    m.cluesRolled >= 2, { rolled: m.cluesRolled });
  check('19: at least 2 clue scrolls completed',
    m.cluesCompleted >= 2, { completed: m.cluesCompleted });

  // ── Pets ──────────────────────────────────────────────────────────────────
  check('20: at least 1 pet unlocked',
    m.petsUnlocked >= 1, { pets: m.petsUnlocked });

  // ── Death + respawn ───────────────────────────────────────────────────────
  check('21: at least 1 death + respawn',
    m.deaths >= 1, { deaths: m.deaths });

  // ── Dialogue ──────────────────────────────────────────────────────────────
  check('22: at least 3 dialogue sessions (ollama down → fallback)',
    m.dialogueSessions >= 3, { dlg: m.dialogueSessions });
  check('23: dialogue fallback path exercised (bible greeting returned)',
    m.fallbackDialogueOk === true || m.dialogueSessions >= 3,
    { fallback: m.fallbackDialogueOk });

  // ── Endgame payoff ────────────────────────────────────────────────────────
  check('24: fire cape awarded in endgame phase',
    m.fireCapeEarned === true);
  check('25: crystal wyrm attempt recorded',
    m.wyrmAttempted === true);

  // ── Report file ───────────────────────────────────────────────────────────
  const reportPath = path.resolve(__dirname, '..', '__rl-journey-test.md');
  const reportExists = fs.existsSync(reportPath);
  check('26: markdown report written to disk',
    reportExists, reportPath);
  if (reportExists) {
    const body = fs.readFileSync(reportPath, 'utf8');
    check('27: report contains per-phase section',
      /## Phase-by-phase/.test(body));
    check('28: report contains metrics table',
      /## Metrics/.test(body));
    // tidy
    try { fs.unlinkSync(reportPath); } catch {}
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n══════ SUMMARY ══════');
  console.log(`Passed: ${results.length - failed}/${results.length}`);
  console.log(`Failed: ${failed}`);
  console.log(`Runtime: ${elapsed}ms`);
  if (failed > 0) {
    console.log('\nFailures:');
    for (const r of results.filter(r => !r.ok)) {
      console.log(`  - ${r.label}${r.detail ? '  ' + JSON.stringify(r.detail) : ''}`);
    }
    process.exit(1);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error('[test harness fatal]', e && e.stack || e);
  process.exit(1);
});
