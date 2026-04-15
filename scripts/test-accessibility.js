#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// Accessibility — Engine Tests
//
// Covers:
//   1.  Defaults: every pref is off/standard (no behavior change by default).
//   2.  getPrefs fills missing keys from defaults; never throws.
//   3.  setPrefs validation rejects bad values atomically.
//   4.  setPrefs accepts every valid colorblind mode.
//   5.  Text size bounds are enforced [1.0, 2.0].
//   6.  Boolean toggles coerce / reject correctly.
//   7.  Key remap: valid actions accepted, unknown actions rejected.
//   8.  resetPrefs restores defaults but preserves enabledAt.
//   9.  decorateOutgoing: no extra frames when prefs off; adds audio when TTS
//       on; adds aria when screenReader on; never speaks HUD / map frames.
//   10. ANSI mapping: deuteranopia remaps the npc role to a different code
//       than base; all modes produce at least one visibly different role.
//   11. CSS palette: deuteranopia differs from base on at least 3 role keys;
//       every mode produces a valid hex string for every role.
//   12. Persistence round-trip: toJSON -> fromJSON preserves every pref.
//   13. Events: prefs_changed fires exactly once per setPrefs call.
//   14. getTranslatedText falls back gracefully.
//   15. /accessibility commands: prefs, set, keymap, preview, reset all
//       return non-empty strings and mutate player.accessibility as expected.
//   16. HTML surfaces (play.html + spectate.html) contain the colorblind CSS
//       blocks and reduced-motion media query.
//
// Run: node scripts/test-accessibility.js
// Exit 0 on all-pass, exit 1 on any failure.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const path = require('path');
const fs = require('fs');

const events = require('../src/engine/events');
const commands = require('../src/engine/commands');
const accessibility = require('../src/engine/accessibility');
const a11yCommands = require('../src/engine/accessibility-commands');

// ── Test harness ────────────────────────────────────────────────────────────
let passed = 0, failed = 0;
const failures = [];
function assert(cond, label) {
  if (cond) { passed++; console.log('  PASS  ' + label); }
  else      { failed++; failures.push(label); console.log('  FAIL  ' + label); }
}
function eq(actual, expected, label) {
  assert(actual === expected,
    `${label} (expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)})`);
}
function section(title) { console.log('\n=== ' + title + ' ==='); }

// Minimal player fixture — accessibility never needs skills/inventory/etc.
let nextPid = 1;
function makePlayer(name) {
  return { id: String(nextPid++), name: name || 'T' + nextPid };
}

let currentTick = 42;
accessibility.setTickSource(() => currentTick);

// Capture prefs_changed events.
const changedEvents = [];
events.on('accessibility:prefs_changed', 'test-capture',
  (e) => changedEvents.push(e));

// ── 1. Defaults ─────────────────────────────────────────────────────────────
section('Defaults are off / standard');

{
  const p = makePlayer('Default');
  const prefs = accessibility.getPrefs(p);
  eq(prefs.colorblind, 'none', 'colorblind defaults to none');
  eq(prefs.textSize, 1.0, 'textSize defaults to 1.0');
  eq(prefs.highContrast, false, 'highContrast defaults to false');
  eq(prefs.reducedMotion, false, 'reducedMotion defaults to false');
  eq(prefs.tts, false, 'tts defaults to false');
  eq(prefs.screenReader, false, 'screenReader defaults to false');
  eq(prefs.locale, 'en', 'locale defaults to en');
  assert(typeof prefs.keyRemap === 'object', 'keyRemap is an object');
  eq(prefs.keyRemap.move_north, 'w', 'default move_north key is w');
  eq(prefs.keyRemap.move_south, 's', 'default move_south key is s');
  eq(prefs.keyRemap.move_west, 'a', 'default move_west key is a');
  eq(prefs.keyRemap.move_east, 'd', 'default move_east key is d');
  eq(prefs.keyRemap.rotate_left, 'q', 'default rotate_left key is q');
  eq(prefs.keyRemap.rotate_right, 'e', 'default rotate_right key is e');
}

// getPrefs on null is safe.
{
  const p = accessibility.getPrefs(null);
  assert(p && typeof p === 'object', 'getPrefs(null) returns default bundle');
  eq(p.colorblind, 'none', 'getPrefs(null).colorblind == none');
}

// ── 2. setPrefs / validation ────────────────────────────────────────────────
section('setPrefs validation');

{
  const p = makePlayer('Validate');

  // Unknown key rejected.
  const r1 = accessibility.setPrefs(p, { whatever: true });
  eq(r1.ok, false, 'unknown pref key rejected');
  assert(r1.reason.indexOf('Unknown') >= 0, 'unknown key reason mentions "Unknown"');

  // Bad type rejected.
  const r2 = accessibility.setPrefs(p, { highContrast: 'yes-please' });
  eq(r2.ok, false, 'non-boolean highContrast rejected');

  // Bad colorblind rejected.
  const r3 = accessibility.setPrefs(p, { colorblind: 'rainbow' });
  eq(r3.ok, false, 'unknown colorblind mode rejected');

  // Atomic: even though colorblind is valid, the bad highContrast should
  // block every change.
  const before = accessibility.getPrefs(p);
  const r4 = accessibility.setPrefs(p, {
    colorblind: 'deuteranopia',
    highContrast: 'maybe',
  });
  eq(r4.ok, false, 'atomic: mixed valid+invalid patch rejected');
  const after = accessibility.getPrefs(p);
  eq(after.colorblind, before.colorblind, 'atomic: colorblind NOT applied when patch had errors');
}

// ── 3. Valid colorblind modes ───────────────────────────────────────────────
section('Every colorblind mode is accepted');

for (const mode of accessibility.COLORBLIND_MODES) {
  const p = makePlayer('CB_' + mode);
  const r = accessibility.setPrefs(p, { colorblind: mode });
  eq(r.ok, true, `setPrefs colorblind=${mode} accepted`);
  eq(accessibility.getPrefs(p).colorblind, mode, `colorblind read-back == ${mode}`);
}

// ── 4. Text size bounds ─────────────────────────────────────────────────────
section('Text size bounds [1.0, 2.0]');

{
  const p = makePlayer('TextSize');
  eq(accessibility.setPrefs(p, { textSize: 1.0 }).ok, true, 'textSize=1.0 ok (min)');
  eq(accessibility.setPrefs(p, { textSize: 1.5 }).ok, true, 'textSize=1.5 ok');
  eq(accessibility.setPrefs(p, { textSize: 2.0 }).ok, true, 'textSize=2.0 ok (max)');
  eq(accessibility.setPrefs(p, { textSize: 0.5 }).ok, false, 'textSize=0.5 rejected');
  eq(accessibility.setPrefs(p, { textSize: 2.5 }).ok, false, 'textSize=2.5 rejected');
  eq(accessibility.setPrefs(p, { textSize: 'big' }).ok, false, 'textSize=string rejected');
}

// ── 5. Key remap ────────────────────────────────────────────────────────────
section('Key remap');

{
  const p = makePlayer('Remap');
  const r1 = accessibility.setPrefs(p, { keyRemap: { move_north: 'i' } });
  eq(r1.ok, true, 'remap move_north=i accepted');
  eq(accessibility.getPrefs(p).keyRemap.move_north, 'i', 'move_north read-back == i');
  // Other actions still have defaults.
  eq(accessibility.getPrefs(p).keyRemap.move_south, 's', 'other defaults preserved');

  const r2 = accessibility.setPrefs(p, { keyRemap: { fly: 'x' } });
  eq(r2.ok, false, 'unknown action rejected');

  const r3 = accessibility.setPrefs(p, { keyRemap: { interact: '' } });
  eq(r3.ok, false, 'empty key rejected');
}

// ── 6. Reset ────────────────────────────────────────────────────────────────
section('resetPrefs restores defaults but keeps enabledAt');

{
  const p = makePlayer('Reset');
  accessibility.setPrefs(p, { colorblind: 'tritanopia', tts: true });
  const before = p.accessibility.enabledAt;
  assert(typeof before === 'number', 'enabledAt set after first setPrefs');
  currentTick = 99;
  const after = accessibility.resetPrefs(p);
  eq(after.colorblind, 'none', 'reset returned to none');
  eq(after.tts, false, 'reset returned tts to false');
  eq(p.accessibility.enabledAt, before, 'enabledAt preserved on reset');
}

// ── 7. decorateOutgoing ─────────────────────────────────────────────────────
section('decorateOutgoing fan-out for TTS / screen reader');

{
  const prefsOff = accessibility.defaultPrefs();
  const prefsTts = Object.assign(accessibility.defaultPrefs(), { tts: true });
  const prefsSR  = Object.assign(accessibility.defaultPrefs(), { screenReader: true });
  const prefsBoth= Object.assign(accessibility.defaultPrefs(), { tts: true, screenReader: true });

  const chat = { type: 'chat', text: 'Hello there.' };
  const hud  = { type: 'hud', hp: 10 };
  const ui   = { type: 'ui-update', alt_text: 'Inventory opened.' };

  {
    const out = accessibility.decorateOutgoing(chat, prefsOff);
    eq(out.length, 1, 'no extras when all prefs off');
  }
  {
    const out = accessibility.decorateOutgoing(chat, prefsTts);
    eq(out.length, 2, 'TTS adds one sibling frame');
    eq(out[1].type, 'audio', 'TTS sibling is type=audio');
    eq(out[1].role, 'tts', 'TTS sibling role=tts');
    eq(out[1].text, 'Hello there.', 'TTS sibling carries the text');
  }
  {
    const out = accessibility.decorateOutgoing(chat, prefsSR);
    eq(out.length, 2, 'screen-reader adds one sibling frame');
    eq(out[1].type, 'aria', 'screen-reader sibling is type=aria');
  }
  {
    const out = accessibility.decorateOutgoing(chat, prefsBoth);
    eq(out.length, 3, 'TTS + screen-reader both fire');
  }
  {
    const out = accessibility.decorateOutgoing(hud, prefsBoth);
    eq(out.length, 1, 'HUD frame is NOT spoken or announced');
  }
  {
    const out = accessibility.decorateOutgoing(ui, prefsSR);
    eq(out.length, 2, 'alt_text UI frame IS announced to screen reader');
    eq(out[1].text, 'Inventory opened.', 'alt_text propagates to aria frame');
  }
}

// ── 8. Palettes: colorblind remap ───────────────────────────────────────────
section('Colorblind palettes differ visibly from base');

{
  const base = accessibility.cssPalette('none');
  for (const mode of ['deuteranopia', 'protanopia', 'tritanopia', 'achromatopsia']) {
    const alt = accessibility.cssPalette(mode);
    let diffs = 0;
    for (const role of ['error', 'success', 'npc', 'gold']) {
      if (alt[role] !== base[role]) diffs++;
    }
    assert(diffs >= 3, `${mode} differs from base on >=3 roles (diffs=${diffs})`);
    // Hex validity.
    for (const role of Object.keys(alt)) {
      assert(/^#[0-9a-fA-F]{6}$/.test(alt[role]),
        `${mode}.${role} is a valid 6-digit hex (${alt[role]})`);
    }
  }
}

// ── 9. ANSI mapping ─────────────────────────────────────────────────────────
section('ANSI codes remap under colorblind modes');

{
  const baseNpc = accessibility.ansiFor('npc', 'none');
  const deutNpc = accessibility.ansiFor('npc', 'deuteranopia');
  assert(baseNpc !== deutNpc, 'npc ANSI code differs under deuteranopia');

  const wrapBase = accessibility.ansiWrap('hi', 'magic', 'none');
  const wrapTrit = accessibility.ansiWrap('hi', 'magic', 'tritanopia');
  assert(wrapBase.indexOf('\x1b[') === 0, 'ansiWrap starts with ESC');
  assert(wrapBase !== wrapTrit, 'ansiWrap output differs under tritanopia (magic role)');
  assert(wrapBase.indexOf('hi') > 0 && wrapTrit.indexOf('hi') > 0,
    'ansiWrap preserves the raw text');

  // Achromatopsia remaps everything to greyscale ANSI (30, 37, 90, 97).
  const achroCodes = new Set();
  for (const role of Object.keys(accessibility.ANSI_PALETTES.achromatopsia)) {
    achroCodes.add(accessibility.ansiFor(role, 'achromatopsia'));
  }
  for (const code of achroCodes) {
    assert([30, 37, 90, 97, 39].indexOf(code) >= 0,
      `achromatopsia code ${code} is a greyscale ANSI code`);
  }
}

// ── 10. Persistence round-trip ──────────────────────────────────────────────
section('toJSON/fromJSON round-trip preserves every pref');

{
  const p = makePlayer('Persist');
  accessibility.setPrefs(p, {
    colorblind: 'deuteranopia',
    textSize: 1.75,
    highContrast: true,
    reducedMotion: true,
    tts: true,
    screenReader: true,
    keyRemap: { move_north: 'i', rotate_left: 'z' },
  });
  const snapshot = accessibility.toJSON(p);
  const json = JSON.stringify(snapshot);
  const revived = JSON.parse(json);

  const q = makePlayer('Revived');
  accessibility.fromJSON(q, revived);
  const prefs = accessibility.getPrefs(q);
  eq(prefs.colorblind, 'deuteranopia', 'round-trip colorblind');
  eq(prefs.textSize, 1.75, 'round-trip textSize');
  eq(prefs.highContrast, true, 'round-trip highContrast');
  eq(prefs.reducedMotion, true, 'round-trip reducedMotion');
  eq(prefs.tts, true, 'round-trip tts');
  eq(prefs.screenReader, true, 'round-trip screenReader');
  eq(prefs.keyRemap.move_north, 'i', 'round-trip custom key');
  eq(prefs.keyRemap.rotate_left, 'z', 'round-trip second custom key');
  eq(prefs.keyRemap.move_south, 's', 'round-trip default key preserved');
}

// ── 11. prefs_changed events ────────────────────────────────────────────────
section('prefs_changed events fire once per setPrefs');

{
  changedEvents.length = 0;
  const p = makePlayer('EventSpy');
  accessibility.setPrefs(p, { colorblind: 'tritanopia' });
  eq(changedEvents.length, 1, 'one event on setPrefs');
  eq(changedEvents[0].type, 'accessibility:prefs_changed',
    'event type is prefs_changed');
  eq(changedEvents[0].playerId, p.id, 'event carries playerId');
  accessibility.setPrefs(p, { tts: true });
  eq(changedEvents.length, 2, 'another event on second setPrefs');
  accessibility.resetPrefs(p);
  eq(changedEvents.length, 3, 'reset also emits event');
}

// ── 12. i18n stub ───────────────────────────────────────────────────────────
section('getTranslatedText stub');

{
  const p = makePlayer('Lang');
  const msg = accessibility.getTranslatedText(p, 'accessibility.reset');
  assert(typeof msg === 'string' && msg.length > 0, 'reset string translates');
  const fb = accessibility.getTranslatedText(p, 'missing.key', 'fallback!');
  eq(fb, 'fallback!', 'missing key returns fallback');
  const raw = accessibility.getTranslatedText(p, 'completely.unknown');
  eq(raw, 'completely.unknown', 'no fallback -> returns key as-is');
}

// ── 13. Commands: prefs, set, keymap, preview, reset ────────────────────────
section('/accessibility commands');

{
  // Install commands into a fresh copy of the registry. We can't easily
  // isolate the registry but re-registering is a no-op for our test.
  a11yCommands.register({ commands, accessibility, getTick: () => currentTick });

  const p = makePlayer('CmdUser');

  const prefsOut = commands.execute(p, 'accessibility prefs');
  assert(prefsOut.indexOf('Colorblind:') >= 0, '/accessibility prefs shows colorblind row');
  assert(prefsOut.indexOf('Text size:') >= 0, '/accessibility prefs shows text size row');

  const previewOut = commands.execute(p, 'accessibility preview');
  assert(previewOut.indexOf('deuteranopia') >= 0, '/accessibility preview mentions deuteranopia');
  assert(previewOut.indexOf('Text size') >= 0 || previewOut.indexOf('textSize') >= 0,
    '/accessibility preview mentions text size');

  const setOut = commands.execute(p, 'accessibility set colorblind deuteranopia');
  assert(setOut.indexOf('Set colorblind') >= 0 || setOut.indexOf('deuteranopia') >= 0,
    '/accessibility set colorblind deuteranopia confirms');
  eq(accessibility.getPrefs(p).colorblind, 'deuteranopia', 'command applied colorblind');

  const setBool = commands.execute(p, 'accessibility set highContrast on');
  assert(setBool.indexOf('Set highContrast') >= 0, '/accessibility set highContrast on confirms');
  eq(accessibility.getPrefs(p).highContrast, true, 'command applied highContrast');

  const setBoolOff = commands.execute(p, 'accessibility set highContrast off');
  eq(accessibility.getPrefs(p).highContrast, false, 'command turned highContrast off');

  const setBad = commands.execute(p, 'accessibility set colorblind rainbow');
  assert(setBad.toLowerCase().indexOf('rejected') >= 0, 'bad colorblind rejected by command');

  const kmOut = commands.execute(p, 'accessibility keymap move_north i');
  assert(kmOut.indexOf('Bound') >= 0, '/accessibility keymap confirms');
  eq(accessibility.getPrefs(p).keyRemap.move_north, 'i', 'command applied keymap');

  const kmBad = commands.execute(p, 'accessibility keymap fly x');
  assert(kmBad.indexOf('Unknown action') >= 0, 'unknown action rejected by keymap command');

  const resetOut = commands.execute(p, 'accessibility reset');
  eq(accessibility.getPrefs(p).colorblind, 'none', 'reset command cleared colorblind');
  eq(accessibility.getPrefs(p).keyRemap.move_north, 'w', 'reset command cleared keymap override');
  assert(resetOut.indexOf('restored') >= 0 || resetOut.indexOf('Accessibility') >= 0,
    '/accessibility reset returns confirmation');

  // Aliases.
  const alias1 = commands.execute(p, 'a11y prefs');
  assert(alias1.indexOf('Colorblind:') >= 0, 'alias /a11y works');
  const alias2 = commands.execute(p, 'access prefs');
  assert(alias2.indexOf('Colorblind:') >= 0, 'alias /access works');
}

// ── 14. HTML surfaces contain the accessibility CSS ─────────────────────────
section('play.html and spectate.html carry accessibility CSS');

{
  const playHtml = fs.readFileSync(
    path.join(__dirname, '..', 'public', 'play.html'), 'utf8');
  const specHtml = fs.readFileSync(
    path.join(__dirname, '..', 'public', 'spectate.html'), 'utf8');

  for (const [name, html] of [['play.html', playHtml], ['spectate.html', specHtml]]) {
    assert(html.indexOf('data-colorblind="deuteranopia"') >= 0,
      `${name}: deuteranopia palette defined`);
    assert(html.indexOf('data-colorblind="protanopia"') >= 0,
      `${name}: protanopia palette defined`);
    assert(html.indexOf('data-colorblind="tritanopia"') >= 0,
      `${name}: tritanopia palette defined`);
    assert(html.indexOf('data-theme="high-contrast"') >= 0,
      `${name}: high-contrast theme defined`);
    assert(html.indexOf('prefers-reduced-motion') >= 0,
      `${name}: reduced-motion media query present`);
    assert(html.indexOf('--a11y-text-scale') >= 0,
      `${name}: text scale CSS variable present`);
    assert(html.indexOf('scapeA11y') >= 0,
      `${name}: client bootstrap script present`);
  }
}

// ── 15. Visibility check: deuteranopia CSS palette is visibly different ─────
section('Deuteranopia palette visibly changes 3 key UI surfaces');

{
  const base = accessibility.cssPalette('none');
  const deut = accessibility.cssPalette('deuteranopia');

  // Three key UI surfaces per the task brief: error (damage/alerts), success
  // (XP/level-up), and gold/parchment (HUD/backdrop).
  assert(base.error !== deut.error,
    'deuteranopia CHANGES the error color (surface 1: alerts/damage)');
  assert(base.success !== deut.success,
    'deuteranopia CHANGES the success color (surface 2: XP / level-up)');
  assert(base.gold !== deut.gold,
    'deuteranopia CHANGES the gold color (surface 3: HUD accent)');
}

// ── Summary ─────────────────────────────────────────────────────────────────
console.log('\n════════════════════════════════════════════');
console.log(`Accessibility tests:  PASS ${passed}  FAIL ${failed}`);
console.log('════════════════════════════════════════════');
if (failed) {
  console.log('\nFailures:');
  for (const f of failures) console.log('  - ' + f);
  process.exit(1);
}
process.exit(0);
