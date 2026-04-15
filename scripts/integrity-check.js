#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// INTEGRITY CHECK
//
// Runs the region analyzer and the multi-agent divergence sim, writes a
// timestamped JSON report to reports/, and diffs against the most recent
// previous report. Prints a human-readable summary with regressions flagged.
//
// Called by Claude Code Routine #1 (GitHub push trigger).
//
// Exit codes:
//   0 — all checks passed, no regressions
//   1 — regressions detected (region dropped >5 pts, divergence flipped, etc.)
//   2 — script failure (analyzer/sim errored)
//
// Usage: node scripts/integrity-check.js [--json]
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPORTS_DIR = path.join(__dirname, '..', 'reports');
const REGRESSION_THRESHOLD = 5; // region depth points

if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

const jsonOnly = process.argv.includes('--json');
function log(msg) { if (!jsonOnly) console.log(msg); }

// ── Run the analyzer and parse output ─────────────────────────────────────────
function runAnalyzer() {
  log('Running region analyzer...');
  const out = execSync('node src/tools/region-analyzer.js --compare', { cwd: path.join(__dirname, '..'), encoding: 'utf8' });
  const regions = {};
  let avg = 0, best = 0, worst = 100;
  for (const line of out.split('\n')) {
    // Rows look like: "Heartlands          91      65     15      23/23   18/23    + OK       68/100"
    const m = line.match(/^(\S.+?)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+\/23)\s+(\d+\/23)\s+([^\s].+?)\s+(\d+)\/100/);
    if (m) {
      regions[m[1].trim()] = {
        methods: parseInt(m[2]),
        items: parseInt(m[3]),
        recipes: parseInt(m[4]),
        skills: m[5],
        selfSuff: m[6],
        goal: m[7].trim(),
        score: parseInt(m[8]),
      };
    }
    const overall = line.match(/avg=(\d+), best=(\d+), worst=(\d+)/);
    if (overall) {
      avg = parseInt(overall[1]);
      best = parseInt(overall[2]);
      worst = parseInt(overall[3]);
    }
  }
  return { regions, summary: { avg, best, worst } };
}

// ── Run the multi-agent sim and parse divergence verdict ──────────────────────
function runMultiAgentSim() {
  log('Running multi-agent sim...');
  const out = execSync('node src/tools/multi-agent-sim.js --hours 1500', { cwd: path.join(__dirname, '..'), encoding: 'utf8', timeout: 120000 });
  let verdict = 'unknown', avgSim = 0, mostSimilar = 0, mostDifferent = 1;
  for (const line of out.split('\n')) {
    const avgM = line.match(/Average similarity:\s*([\d.]+)%/);
    if (avgM) avgSim = parseFloat(avgM[1]);
    const simM = line.match(/Most similar pair:\s*([\d.]+)%/);
    if (simM) mostSimilar = parseFloat(simM[1]);
    const diffM = line.match(/Most different pair:\s*([\d.]+)%/);
    if (diffM) mostDifferent = parseFloat(diffM[1]);
    if (line.includes('VERDICT:')) {
      if (line.includes('non-degenerate')) verdict = 'non-degenerate';
      else if (line.includes('Moderate')) verdict = 'moderate';
      else if (line.includes('degenerate')) verdict = 'degenerate';
    }
  }
  return { verdict, avgSim, mostSimilar, mostDifferent };
}

// ── Relationship stats from a quick node invocation ───────────────────────────
function gatherStats() {
  const code = `
    const rel = require('./src/data/relationships');
    require('./src/content/aelgard/area-gates');
    require('./src/content/aelgard/quest-unlocks');
    require('./src/content/aelgard/item-ecosystem');
    require('./src/content/aelgard/training-knobs');
    require('./src/content/aelgard/breakpoints');
    try { require('./src/content/aelgard/skill-web'); } catch (e) {}
    try { require('./src/content/aelgard/heartlands-deep'); } catch (e) {}
    try { require('./src/content/aelgard/heartlands-density'); } catch (e) {}
    try { require('./src/content/aelgard/moryskah-deep'); } catch (e) {}
    try { require('./src/content/aelgard/moryskah-density'); } catch (e) {}
    try { require('./src/content/aelgard/mid-tier-regions'); } catch (e) {}
    try { require('./src/content/aelgard/universal-items'); } catch (e) {}
    try { require('./src/content/aelgard/special-regions'); } catch (e) {}
    try { require('./src/content/aelgard/cross-region-web'); } catch (e) {}
    try { require('./src/content/aelgard/quirky-interactions'); } catch (e) {}
    console.log(JSON.stringify(rel.stats()));
  `;
  const out = execSync(`node -e "${code.replace(/\"/g, '\\"').replace(/\n/g, ' ')}"`, { cwd: path.join(__dirname, '..'), encoding: 'utf8' });
  const jsonLine = out.split('\n').filter(l => l.startsWith('{')).pop() || '{}';
  return JSON.parse(jsonLine);
}

// ── Main ──────────────────────────────────────────────────────────────────────

const stats = gatherStats();
const { regions, summary } = runAnalyzer();
const sim = runMultiAgentSim();

const report = {
  timestamp: new Date().toISOString(),
  git: {
    commit: (execSync('git rev-parse HEAD', { cwd: path.join(__dirname, '..'), encoding: 'utf8' }).trim()),
    branch: (execSync('git rev-parse --abbrev-ref HEAD', { cwd: path.join(__dirname, '..'), encoding: 'utf8' }).trim()),
  },
  relationship_stats: stats,
  regions,
  summary,
  sim,
};

// ── Find previous report ──────────────────────────────────────────────────────
const existing = fs.readdirSync(REPORTS_DIR)
  .filter(f => f.match(/^\d{4}-\d{2}-\d{2}T.*\.json$/))
  .sort();
const previousFile = existing[existing.length - 1];
const previous = previousFile ? JSON.parse(fs.readFileSync(path.join(REPORTS_DIR, previousFile), 'utf8')) : null;

// ── Diff ──────────────────────────────────────────────────────────────────────
const regressions = [];
const improvements = [];

if (previous) {
  for (const [region, cur] of Object.entries(regions)) {
    const prev = previous.regions[region];
    if (!prev) continue;
    const delta = cur.score - prev.score;
    if (delta <= -REGRESSION_THRESHOLD) {
      regressions.push({ region, from: prev.score, to: cur.score, delta });
    } else if (delta >= REGRESSION_THRESHOLD) {
      improvements.push({ region, from: prev.score, to: cur.score, delta });
    }
  }
  if (previous.sim.verdict !== sim.verdict && sim.verdict === 'degenerate') {
    regressions.push({ type: 'divergence_flip', from: previous.sim.verdict, to: sim.verdict });
  }
}

report.diff = {
  previous_file: previousFile || null,
  regressions,
  improvements,
};

// ── Write new report ──────────────────────────────────────────────────────────
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const reportFile = `${stamp}_${report.git.commit.substring(0, 7)}.json`;
const reportPath = path.join(REPORTS_DIR, reportFile);
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

// ── Also write latest.json for quick access ───────────────────────────────────
fs.writeFileSync(path.join(REPORTS_DIR, 'latest.json'), JSON.stringify(report, null, 2));

// ── Output ────────────────────────────────────────────────────────────────────
if (jsonOnly) {
  console.log(JSON.stringify(report, null, 2));
} else {
  log('\n══════════════════════════════════════════════════════════════');
  log('  INTEGRITY CHECK REPORT');
  log('══════════════════════════════════════════════════════════════');
  log(`  Commit: ${report.git.commit.substring(0, 7)} on ${report.git.branch}`);
  log(`  Timestamp: ${report.timestamp}`);
  log(`  Saved to: reports/${reportFile}`);
  log('');
  log(`  Region depth avg: ${summary.avg}/100 (best ${summary.best}, worst ${summary.worst})`);
  log(`  Divergence verdict: ${sim.verdict} (avg similarity ${sim.avgSim}%)`);
  log(`  Relationship stats: ${JSON.stringify(stats)}`);
  log('');

  if (previous) {
    log(`Comparison to ${previousFile}:`);
    if (regressions.length === 0 && improvements.length === 0) {
      log('  No meaningful score changes.');
    }
    for (const i of improvements) log(`  + ${i.region}: ${i.from} -> ${i.to} (+${i.delta})`);
    for (const r of regressions) {
      if (r.type === 'divergence_flip') log(`  ! DIVERGENCE FLIPPED: ${r.from} -> ${r.to}`);
      else log(`  ! ${r.region}: ${r.from} -> ${r.to} (${r.delta})`);
    }
  } else {
    log('  (no previous report — this is the baseline)');
  }
  log('');
}

// ── Exit code ─────────────────────────────────────────────────────────────────
if (regressions.length > 0) {
  if (!jsonOnly) console.error(`REGRESSIONS DETECTED: ${regressions.length}`);
  process.exit(1);
}
process.exit(0);
