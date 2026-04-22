#!/usr/bin/env node
// ═════════════════════════════════════════════════════════════════════════════
// Derive burn-out curves from the OSRS hiscores snapshot.
//
// For each boss, map sample ranks to percentiles of the player population that
// ever tried the boss:
//   rank 1      → p99.9 (top-of-ladder; usually a bot or ultra-grinder)
//   rank 50     → p99
//   rank 200    → p95
//   rank 1000   → p90
//   rank 5000   → median (50th percentile — "typical dedicated player")
//   rank 25000  → p10  (casual / lapsed)
//   rank 100000 → p1   (one-and-done or legacy)
//
// We treat KC as commitment signal. The 99th-percentile KC is our "realistic
// dedicated player ceiling" — any Scape drop whose expected-kills value
// exceeds this ceiling is mathematically unobtainable by all but the top 1%.
//
// Some bosses have fewer than 100k ranked players (e.g. Phosani's Nightmare,
// Theatre of Blood). For those we detect `rank_100000 > rank_25000` (monotonic
// violation) and treat the later ranks as missing — the rank-tail is noise.
//
// Output: data/burnout-thresholds.json
// ═════════════════════════════════════════════════════════════════════════════

'use strict';

const fs = require('fs');
const path = require('path');

const snap = require(path.join(__dirname, '..', 'data', 'osrs-hiscores-snapshot.json'));

function monotoneFilter(samples) {
  // Walk from rank 1 down. A later rank must have KC <= earlier rank KC.
  // As soon as we see an increase, everything after is noise (boss truncated).
  const order = ['rank_1','rank_50','rank_200','rank_1000','rank_5000','rank_25000','rank_100000'];
  const clean = {};
  let lastKc = Infinity;
  let truncated = false;
  for (const r of order) {
    const s = samples[r];
    const kc = (s && typeof s.kc === 'number') ? s.kc : null;
    if (kc == null) { clean[r] = null; continue; }
    if (truncated) { clean[r] = null; continue; }
    if (kc > lastKc) {
      // monotonic violation — truncate here and mark all later ranks null
      clean[r] = null;
      truncated = true;
      continue;
    }
    clean[r] = kc;
    lastKc = kc;
  }
  return { clean, truncated };
}

function deriveCurves() {
  const out = {
    $schema: 'scape.burnout-thresholds.v1',
    generated: new Date().toISOString(),
    source: 'data/osrs-hiscores-snapshot.json',
    sampleRankMap: {
      rank_1:      'p99_9',
      rank_50:     'p99',
      rank_200:    'p95',
      rank_1000:   'p90',
      rank_5000:   'median',
      rank_25000:  'p10',
      rank_100000: 'p1',
    },
    notes: 'KC per sample rank after monotonic-filter. `median_kc` = rank_5000, `p90_kc` = rank_1000, `p99_kc` = rank_50, `p99_9_kc` = rank_1. Null values indicate the rank is below the boss-ladder cutoff (not enough players ranked).',
    bosses: {},
  };

  for (const [key, boss] of Object.entries(snap.bosses)) {
    const { clean, truncated } = monotoneFilter(boss.samples);
    out.bosses[key] = {
      name:       boss.name,
      tableId:    boss.tableId,
      median_kc:  clean.rank_5000,
      p90_kc:     clean.rank_1000,
      p95_kc:     clean.rank_200,
      p99_kc:     clean.rank_50,
      p99_9_kc:   clean.rank_1,
      p10_kc:     clean.rank_25000,
      p1_kc:      clean.rank_100000,
      truncatedAt: truncated,
    };
  }

  return out;
}

function main() {
  const out = deriveCurves();
  const outPath = path.join(__dirname, '..', 'data', 'burnout-thresholds.json');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log(`[burnout] wrote ${outPath} — ${Object.keys(out.bosses).length} bosses`);

  // Also print a quick summary table
  console.log('\nBoss                    median   p90     p99     p99.9');
  for (const [k, b] of Object.entries(out.bosses)) {
    console.log(
      `${k.padEnd(23)}`
      + ` ${String(b.median_kc ?? '-').padStart(6)}`
      + ` ${String(b.p90_kc ?? '-').padStart(6)}`
      + ` ${String(b.p99_kc ?? '-').padStart(6)}`
      + ` ${String(b.p99_9_kc ?? '-').padStart(6)}`
    );
  }
}

main();
