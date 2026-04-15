#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// Narrator smoke test — exercises the narrator module end-to-end.
//
// 1. Without ANTHROPIC_API_KEY: verifies events.json gets a structured entry
//    with narration=null and narrationError="ANTHROPIC_API_KEY not set".
// 2. With ANTHROPIC_API_KEY set: actually calls Claude, asserts non-empty
//    narration text. Skips if key is missing from env.
//
// 3. Verifies the events.json rotation (> NARRATION_WINDOW).
//
// Run: node scripts/test-narrator.js
// Run with real Claude: ANTHROPIC_API_KEY=sk-... node scripts/test-narrator.js
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const fs = require('fs');
const path = require('path');

// Ensure a clean events.json before we start
const EVENTS_FILE = path.join(__dirname, '..', 'public', 'events.json');
fs.writeFileSync(EVENTS_FILE, JSON.stringify({ entries: [] }, null, 2));

// Require AFTER cleaning — narrator reads file lazily
const narrator = require('../src/ai/narrator');

let failed = 0;
function check(label, cond, detail) {
  const tag = cond ? 'PASS' : 'FAIL';
  console.log(`[${tag}] ${label}${detail ? '  ' + JSON.stringify(detail) : ''}`);
  if (!cond) failed++;
}

function readEntries() {
  const raw = fs.readFileSync(EVENTS_FILE, 'utf8');
  return JSON.parse(raw).entries;
}

(async () => {
  // ── Test 1: fire a breakpoint ────────────────────────────────────────────
  const ev = {
    tick: 1234,
    playerId: 42,
    playerName: 'Thorne',
    bpKey: 'skill_level:prayer:43',
    bpType: 'skill_level',
    trigger: { skill: 'prayer', level: 43 },
    importance: 'transformative',
    description: 'All three protection prayers. This is THE breakpoint. Bosses that were impossible become farmable. The game permanently changes.',
    unlocks: [
      { type: 'prayer', id: 'protect_from_melee', description: 'Protect from Melee prayer' },
      { type: 'prayer', id: 'protect_from_missiles', description: 'Protect from Missiles prayer' },
    ],
  };

  await narrator.narrate(ev);
  const entries1 = readEntries();
  check('events.json has one entry after narrate()', entries1.length === 1, { count: entries1.length });

  const entry = entries1[0];
  check('entry preserves breakpoint metadata',
    entry.bpKey === ev.bpKey && entry.importance === 'transformative' && entry.playerName === 'Thorne',
    { bpKey: entry.bpKey, importance: entry.importance, playerName: entry.playerName });

  if (narrator.isEnabled()) {
    // Real Claude call — assert non-empty narration
    check('narration text produced by Claude',
      typeof entry.narration === 'string' && entry.narration.length >= 20,
      { narration: entry.narration ? entry.narration.slice(0, 100) + '...' : null,
        error: entry.narrationError });
    console.log('\n=== GENERATED NARRATION ===');
    console.log(entry.narration || '(none)');
    console.log('===========================\n');
  } else {
    check('disabled mode records structured entry with error',
      entry.narration === null && typeof entry.narrationError === 'string',
      { narration: entry.narration, error: entry.narrationError });
    console.log(`[info] ANTHROPIC_API_KEY not set — skipped live Claude call. Set it to test end-to-end generation.`);
  }

  // ── Test 2: rotation — fire 55 breakpoints, expect events.json trimmed to 50 ──
  // Use injectEntry (synchronous-ish, no Claude call) so we don't spam the API.
  const baseEntries = readEntries().length;
  const toFire = 55;
  for (let i = 0; i < toFire; i++) {
    await narrator.injectEntry({
      tick: 2000 + i,
      playerId: 1,
      playerName: 'Rot',
      bpKey: `skill_level:mining:${i}`,
      importance: 'minor',
      description: `synthetic #${i}`,
      narration: `Line ${i}.`,
    });
  }
  const entries2 = readEntries();
  check('rotation: events.json capped at 50',
    entries2.length === 50,
    { length: entries2.length });
  check('rotation: oldest entries rotated out',
    !entries2.some(e => e.bpKey === 'skill_level:prayer:43'),
    { keptFirst: entries2[0]?.bpKey });
  check('rotation: newest entry retained',
    entries2[entries2.length - 1].bpKey === `skill_level:mining:${toFire - 1}`,
    { keptLast: entries2[entries2.length - 1]?.bpKey });

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log(`\n${failed === 0 ? 'ALL CHECKS PASSED' : 'FAILED: ' + failed + ' check(s)'}`);
  process.exit(failed === 0 ? 0 : 1);
})();
