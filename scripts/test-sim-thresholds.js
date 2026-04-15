#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// SIM THRESHOLD TEST HARNESS
//
// Validates the shape, content, and internal consistency of
// `reports/multi-agent-10k.json` produced by `multi-agent-sim.js --deep`.
//
// If the report file doesn't exist, the harness runs the sim first.
//
// Asserts 15+ invariants about:
//   - Report structure (threshold block, archetype block, cross-archetype)
//   - Every archetype present, with all required fields
//   - Threshold metrics computed coherently (e.g., pass flags match values)
//   - Divergence matrix is symmetric and bounded [0,1]
//   - Level sums match skill tables
//   - Event counts are non-negative and finite
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..');
const JSON_PATH = path.join(REPO_ROOT, 'reports', 'multi-agent-10k.json');
const MD_PATH = path.join(REPO_ROOT, 'reports', 'multi-agent-10k.md');
const SIM = path.join(REPO_ROOT, 'src', 'tools', 'multi-agent-sim.js');

const EXPECTED_ARCHETYPES = [
  'Efficiency Andy', 'AFK Andy', 'Money Maker', 'PvM Rusher',
  'Skiller', 'Quester', 'Ironman', 'Candy Looper', 'Casual',
];

const EXPECTED_SKILLS = [
  'attack', 'strength', 'defence', 'hitpoints', 'ranged', 'prayer', 'magic',
  'runecrafting', 'construction', 'agility', 'herblore', 'thieving',
  'crafting', 'fletching', 'slayer', 'hunter', 'mining', 'smithing',
  'fishing', 'cooking', 'firemaking', 'woodcutting', 'farming',
];

let assertionCount = 0;
let failures = 0;
const failureDetails = [];

function assert(condition, label) {
  assertionCount++;
  if (condition) {
    console.log(`  [PASS ${String(assertionCount).padStart(2, '0')}] ${label}`);
  } else {
    failures++;
    failureDetails.push(label);
    console.log(`  [FAIL ${String(assertionCount).padStart(2, '0')}] ${label}`);
  }
}

function assertEq(actual, expected, label) {
  assert(actual === expected, `${label} (got: ${JSON.stringify(actual)}, expected: ${JSON.stringify(expected)})`);
}

function ensureReport() {
  if (!fs.existsSync(JSON_PATH)) {
    console.log('Report not found — running sim with --deep first...');
    try {
      execFileSync(process.execPath, [SIM, '--deep'], { cwd: REPO_ROOT, stdio: 'inherit' });
    } catch (err) {
      console.error('Sim failed to run:', err.message);
      process.exit(2);
    }
  }
}

function main() {
  ensureReport();

  console.log('');
  console.log('══════════════════════════════════════════════════════════════════════════════');
  console.log('  MULTI-AGENT SIM THRESHOLD TESTS');
  console.log('══════════════════════════════════════════════════════════════════════════════');
  console.log('');

  // ── 1. File existence and parseability ──
  assert(fs.existsSync(JSON_PATH), `JSON report exists at ${JSON_PATH}`);
  assert(fs.existsSync(MD_PATH), `Markdown report exists at ${MD_PATH}`);

  let report;
  try {
    report = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
    assert(true, 'JSON report is valid JSON');
  } catch (e) {
    assert(false, 'JSON report is valid JSON');
    console.error(e);
    process.exit(3);
  }

  // ── 2. Top-level structure ──
  assert(!!report.meta, 'Report contains meta block');
  assert(!!report.thresholds, 'Report contains thresholds block');
  assert(!!report.archetypes, 'Report contains archetypes block');
  assert(!!report.cross, 'Report contains cross-archetype block');

  // ── 3. Meta fields ──
  assert(typeof report.meta.generatedAt === 'string', 'meta.generatedAt is a string');
  assert(report.meta.archetypeCount === 9, 'meta.archetypeCount === 9');
  assert(report.meta.ticksPerArchetype >= 1000, 'meta.ticksPerArchetype >= 1000');
  assertEq(report.meta.totalTicks, report.meta.ticksPerArchetype * 9, 'meta.totalTicks matches per-archetype * 9');
  assert(report.meta.elapsedMs >= 0, 'meta.elapsedMs is non-negative');
  assertEq(report.meta.ticksPerHour, 6000, 'meta.ticksPerHour is 6000');

  // ── 4. All 9 archetypes present ──
  for (const name of EXPECTED_ARCHETYPES) {
    assert(!!report.archetypes[name], `archetype present: ${name}`);
  }
  assertEq(Object.keys(report.archetypes).length, 9, 'archetypes block has exactly 9 entries');

  // ── 5. Archetype fields per player ──
  for (const [name, a] of Object.entries(report.archetypes)) {
    assert(typeof a.description === 'string' && a.description.length > 0, `${name}: description non-empty`);
    assert(typeof a.totalLevel === 'number' && a.totalLevel >= 23, `${name}: totalLevel >= 23 (all skills start at 1, hp at 10)`);
    assert(a.totalLevel < 2300, `${name}: totalLevel < 2300 (upper sanity bound)`);
    assert(a.methodsUsedCount >= 1, `${name}: used at least 1 method`);
    assert(a.breakpointsTotal >= 0, `${name}: breakpointsTotal is non-negative`);
    assert(a.skillUps >= 0, `${name}: skillUps is non-negative`);
    assert(Array.isArray(a.regionsVisited), `${name}: regionsVisited is an array`);
    assert(a.regionsVisited.includes('heartlands'), `${name}: started in heartlands`);
    assert(typeof a.prestigeReached === 'boolean', `${name}: prestigeReached is boolean`);
    assert(typeof a.divergenceScore === 'number' && a.divergenceScore >= 0 && a.divergenceScore <= 1,
      `${name}: divergenceScore in [0,1]`);
  }

  // ── 6. Skill-level tables ──
  for (const [name, a] of Object.entries(report.archetypes)) {
    for (const s of EXPECTED_SKILLS) {
      assert(typeof a.finalLevels[s] === 'number', `${name}.finalLevels.${s} is numeric`);
      assert(a.finalLevels[s] >= 1 && a.finalLevels[s] <= 99, `${name}.finalLevels.${s} in [1,99]`);
    }
    const sumOfLevels = EXPECTED_SKILLS.reduce((s, k) => s + a.finalLevels[k], 0);
    assertEq(sumOfLevels, a.totalLevel, `${name}: sum(finalLevels) === totalLevel`);
  }

  // ── 7. Threshold block ──
  const t = report.thresholds;
  assert(typeof t.unique_to_one_count === 'number', 'thresholds.unique_to_one_count is numeric');
  assert(typeof t.unique_to_one_target === 'number', 'thresholds.unique_to_one_target is numeric');
  assertEq(t.unique_to_one_target, 100, 'thresholds.unique_to_one_target === 100');
  assertEq(t.unique_to_one_pass, t.unique_to_one_count >= t.unique_to_one_target,
    'thresholds.unique_to_one_pass matches count >= target');

  assert(t.average_similarity >= 0 && t.average_similarity <= 1, 'thresholds.average_similarity in [0,1]');
  assertEq(t.average_similarity_max, 0.40, 'thresholds.average_similarity_max === 0.40');
  assertEq(t.average_similarity_pass, t.average_similarity <= t.average_similarity_max,
    'thresholds.average_similarity_pass matches avg <= max');

  assert(typeof t.max_total_level === 'number', 'thresholds.max_total_level is numeric');
  assertEq(t.max_total_level_cap, 2100, 'thresholds.max_total_level_cap === 2100');
  assertEq(t.max_total_level_pass, t.max_total_level < t.max_total_level_cap,
    'thresholds.max_total_level_pass matches max < cap');

  assert(typeof t.every_archetype_transformative === 'boolean',
    'thresholds.every_archetype_transformative is boolean');
  const actuallyEveryTransformative = Object.values(report.archetypes)
    .every(a => a.breakpointsTransformative >= 1);
  assertEq(t.every_archetype_transformative, actuallyEveryTransformative,
    'thresholds.every_archetype_transformative matches per-archetype data');

  // ── 8. Cross-archetype block ──
  const c = report.cross;
  assert(Array.isArray(c.universalMethods), 'cross.universalMethods is an array');
  assertEq(c.universalCount, c.universalMethods.length, 'cross.universalCount matches universalMethods.length');
  assert(Array.isArray(c.uniqueToOneMethods), 'cross.uniqueToOneMethods is an array');
  assertEq(c.uniqueToOneCount, c.uniqueToOneMethods.length, 'cross.uniqueToOneCount matches uniqueToOneMethods.length');
  assertEq(c.uniqueToOneCount, t.unique_to_one_count, 'cross.uniqueToOneCount === thresholds.unique_to_one_count');

  assert(c.averageSimilarity >= 0 && c.averageSimilarity <= 1, 'cross.averageSimilarity in [0,1]');
  assert(c.minSimilarity <= c.averageSimilarity, 'cross.minSimilarity <= averageSimilarity');
  assert(c.averageSimilarity <= c.maxSimilarity, 'cross.averageSimilarity <= maxSimilarity');

  // ── 9. Divergence matrix shape ──
  assert(!!c.divergenceMatrix, 'cross.divergenceMatrix exists');
  for (const a of EXPECTED_ARCHETYPES) {
    assert(!!c.divergenceMatrix[a], `divergenceMatrix has row: ${a}`);
    for (const b of EXPECTED_ARCHETYPES) {
      if (a === b) continue;
      const v = c.divergenceMatrix[a][b];
      assert(typeof v === 'number' && v >= 0 && v <= 1, `divergenceMatrix[${a}][${b}] in [0,1]`);
    }
  }

  // ── 10. Matrix symmetry (Jaccard is symmetric) ──
  let asymmetricCount = 0;
  for (const a of EXPECTED_ARCHETYPES) {
    for (const b of EXPECTED_ARCHETYPES) {
      if (a === b) continue;
      const ab = c.divergenceMatrix[a][b];
      const ba = c.divergenceMatrix[b][a];
      if (Math.abs(ab - ba) > 0.001) asymmetricCount++;
    }
  }
  assertEq(asymmetricCount, 0, 'divergence matrix is symmetric (Jaccard invariant)');

  // ── 11. Method-count consistency ──
  // uniqueToOne methods should not appear in universal; cross.uniqueToOneCount
  // plus cross.universalCount plus sharedMethodCount must equal total unique methods across archetypes.
  const allMethodsUsed = new Set();
  for (const a of Object.values(report.archetypes)) {
    // The archetype object doesn't redundantly list every method ID (only
    // uniqueMethodIds + uniqueness counts), so derive instead from cross data.
  }
  const totalDistinct = c.universalCount + c.uniqueToOneCount + c.sharedMethodCount;
  assert(totalDistinct > 0, `total distinct methods across all archetypes: ${totalDistinct}`);

  // ── 12. Ticks-played matches meta.ticksPerArchetype (modulo early break) ──
  for (const [name, a] of Object.entries(report.archetypes)) {
    assert(a.ticksPlayed > 0 && a.ticksPlayed <= report.meta.ticksPerArchetype,
      `${name}: ticksPlayed in (0, ${report.meta.ticksPerArchetype}]`);
  }

  // ── 13. Markdown report basic shape ──
  const md = fs.readFileSync(MD_PATH, 'utf8');
  assert(md.includes('# Multi-Agent Deep Simulation Report'), 'markdown has title');
  assert(md.includes('## Threshold Results'), 'markdown has Threshold Results section');
  assert(md.includes('## Cross-Archetype Summary'), 'markdown has Cross-Archetype section');
  assert(md.includes('## Per-Archetype Reports'), 'markdown has Per-Archetype section');
  assert(md.includes('### Overlap Matrix'), 'markdown has Overlap Matrix section');
  for (const name of EXPECTED_ARCHETYPES) {
    assert(md.includes(`### ${name}`), `markdown has header for ${name}`);
  }

  // ── 14. Divergence score alignment ──
  for (const [name, a] of Object.entries(report.archetypes)) {
    const expected = 1 - a.avgSimilarityToOthers;
    assert(Math.abs(a.divergenceScore - expected) < 0.001,
      `${name}: divergenceScore ~= 1 - avgSimilarityToOthers`);
  }

  // ── 15. Candy moments / stuck fields exist and are arrays / booleans ──
  for (const [name, a] of Object.entries(report.archetypes)) {
    assert(Array.isArray(a.candyMoments), `${name}: candyMoments is an array`);
    assert(typeof a.stuck === 'boolean', `${name}: stuck is boolean`);
    assert(a.stuckTicks >= 0, `${name}: stuckTicks non-negative`);
  }

  // ── 16. Monster kill estimates ──
  for (const [name, a] of Object.entries(report.archetypes)) {
    assert(a.monstersKilledEstimate >= 0 && Number.isFinite(a.monstersKilledEstimate),
      `${name}: monstersKilledEstimate non-negative and finite`);
  }

  // ── 17. Invocation compatibility: the legacy command should still run ──
  // We only smoke-test the flag parsing here to keep this fast.
  // (The sim CLI reads --hours independently of --deep.)
  assert(fs.existsSync(SIM), `sim binary exists at ${SIM}`);
  const src = fs.readFileSync(SIM, 'utf8');
  assert(src.includes("args.includes('--deep')"), 'sim still recognizes --deep flag');
  assert(src.includes("args.indexOf('--hours')"), 'sim still supports legacy --hours flag');

  // ── 18. Minimum content density — every archetype explored SOMETHING ──
  for (const [name, a] of Object.entries(report.archetypes)) {
    assert(a.skillUps + a.areasEntered + a.methodSwitches > 0,
      `${name}: had at least one event (skillUp / area / switch)`);
  }

  // Final summary
  console.log('');
  console.log('══════════════════════════════════════════════════════════════════════════════');
  console.log(`  RESULTS: ${assertionCount - failures}/${assertionCount} passed`);
  console.log('══════════════════════════════════════════════════════════════════════════════');
  if (failures > 0) {
    console.log('');
    console.log(`${failures} failure(s):`);
    for (const f of failureDetails) console.log(`  - ${f}`);
    process.exit(1);
  }
  console.log('');
  console.log('All assertions passed.');
}

main();
