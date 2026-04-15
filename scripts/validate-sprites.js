#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// validate-sprites.js
//
// Walks all entity / tile / landmark references in the codebase and reports:
//   - Entities that have no matching sprite in the manifest (to-draw list)
//   - Manifest entries that no live entity references (dead entries)
//
// Exits non-zero only on hard errors (missing manifest, broken loads).
// Missing sprites are warnings — they're the artist's todo list.
//
//   node scripts/validate-sprites.js
//   node scripts/validate-sprites.js --json > sprite-gap.json
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const path = require('path');

const WANT_JSON = process.argv.includes('--json');
const VERBOSE = process.argv.includes('--verbose');

function main() {
  let registry;
  try {
    registry = require(path.resolve(__dirname, '..', 'src', 'world', 'sprite-registry.js'));
  } catch (e) {
    console.error('[validate-sprites] Could not load src/world/sprite-registry.js');
    console.error(e.message);
    process.exit(1);
  }

  let report;
  try {
    report = registry.validateAllEntities();
  } catch (e) {
    console.error('[validate-sprites] validateAllEntities threw:', e.message);
    process.exit(1);
  }

  if (WANT_JSON) {
    process.stdout.write(JSON.stringify(report, null, 2) + '\n');
    process.exit(0);
  }

  const { missing, dead, stats } = report;

  console.log('─── Sprite Registry Validation ────────────────────────────────────');
  console.log(`Total manifest entries : ${stats.total}`);
  console.log(`Matched by live content: ${stats.matched}`);
  console.log(`Missing (to draw)      : ${stats.missing}`);
  console.log(`Dead (orphan entries)  : ${stats.dead}`);
  console.log('');

  if (missing.length) {
    console.log('── Missing sprites (entities without manifest coverage) ──');
    const byKind = groupBy(missing, 'kind');
    for (const [kind, list] of Object.entries(byKind)) {
      console.log(`  ${kind}: ${list.length}`);
      if (VERBOSE) {
        for (const m of list.slice(0, 25)) {
          console.log(`    - ${m.defId || m.name} (${m.name || ''})`);
        }
        if (list.length > 25) console.log(`    ... and ${list.length - 25} more`);
      }
    }
    if (!VERBOSE) console.log('  (pass --verbose to list)');
    console.log('');
  } else {
    console.log('No missing sprites. All live entities have manifest coverage.');
    console.log('');
  }

  if (dead.length) {
    console.log('── Dead manifest entries (no live entity references) ──');
    const byKind = groupBy(dead, 'kind');
    for (const [kind, list] of Object.entries(byKind)) {
      console.log(`  ${kind}: ${list.length}`);
      if (VERBOSE) {
        for (const d of list.slice(0, 25)) {
          console.log(`    - ${d.spriteId} (${d.name || d.defId})`);
        }
        if (list.length > 25) console.log(`    ... and ${list.length - 25} more`);
      }
    }
    if (!VERBOSE) console.log('  (pass --verbose to list)');
    console.log('');
  } else {
    console.log('No dead manifest entries.');
    console.log('');
  }

  console.log('─── Done ──────────────────────────────────────────────────────────');
  // Missing / dead are warnings, not errors.
  process.exit(0);
}

function groupBy(arr, key) {
  const out = {};
  for (const item of arr) {
    const k = item[key] || 'unknown';
    (out[k] = out[k] || []).push(item);
  }
  return out;
}

main();
