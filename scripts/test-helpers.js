// ══════════════════════════════════════════════════════════════════════════════
// Shared test helpers — assertion library + fixture builders
//
// Extracted during the burn-v2 test port so every standalone test file can
// share one assertion style, deterministic fixture helpers, and a reporting
// convention. The upstream ScapeTests/ specs are markdown documents; this
// helper is the common infrastructure that lets us execute them.
//
// Exports:
//   makeReporter()         — returns { check, eq, approx, section, summary, results, failed }
//   makeRng(seed)          — deterministic PRNG (Mulberry32) for property-style tests
//   sandboxPersistence(d)  — override engine/persistence to a temp dir (auto-cleanup)
//   makePlayer(id, name)   — minimal createPlayer wrapper with breakpoint bootstrap
//   freshBreakpoint()      — reset breakpoint history on a player so tests start clean
//   OSRS_XP_MILESTONES     — the 12 checkpoints from spec 14 TEST-1401
//
// CommonJS — matches existing scripts/test-*.js.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const fs = require('fs');
const path = require('path');

// ── Reporter ──────────────────────────────────────────────────────────────────
function makeReporter(opts) {
  const silentPass = opts && opts.silentPass;
  const results = [];
  let failed = 0;

  function check(label, cond, detail) {
    const ok = !!cond;
    results.push({ label, ok, detail });
    if (!ok) failed++;
    const tag = ok ? 'PASS' : 'FAIL';
    if (ok && silentPass) return ok;
    const detailStr = detail !== undefined ? '  ' + safeStringify(detail) : '';
    console.log(`[${tag}] ${label}${detailStr}`);
    return ok;
  }

  function eq(actual, expected, label) {
    const ok = actual === expected;
    return check(label, ok, ok ? undefined : { actual, expected });
  }

  function approx(actual, expected, tolerance, label) {
    const ok = Math.abs(actual - expected) <= tolerance;
    return check(label, ok, ok ? undefined : { actual, expected, tolerance });
  }

  function between(actual, low, high, label) {
    const ok = actual >= low && actual <= high;
    return check(label, ok, ok ? undefined : { actual, low, high });
  }

  function throws(fn, matcher, label) {
    let thrown = null;
    try { fn(); }
    catch (e) { thrown = e; }
    if (!thrown) return check(label, false, { reason: 'did not throw' });
    if (!matcher) return check(label, true);
    if (typeof matcher === 'string') {
      return check(label, thrown.message.includes(matcher), { msg: thrown.message, need: matcher });
    }
    if (matcher instanceof RegExp) {
      return check(label, matcher.test(thrown.message), { msg: thrown.message, need: String(matcher) });
    }
    return check(label, false, { reason: 'bad matcher' });
  }

  function section(title) {
    console.log('\n── ' + title + ' ──');
  }

  function summary() {
    console.log('\n══════ SUMMARY ══════');
    console.log(`${results.length - failed}/${results.length} checks passed`);
    if (failed > 0) {
      console.log('\nFAILURES:');
      for (const r of results.filter(r => !r.ok)) {
        console.log('  - ' + r.label + (r.detail ? ' ' + safeStringify(r.detail) : ''));
      }
    }
    return { total: results.length, passed: results.length - failed, failed };
  }

  function exit() {
    const s = summary();
    process.exit(s.failed > 0 ? 1 : 0);
  }

  return { check, eq, approx, between, throws, section, summary, exit, get results() { return results; }, get failed() { return failed; } };
}

function safeStringify(obj) {
  try { return JSON.stringify(obj); }
  catch (_) { return String(obj); }
}

// ── Deterministic PRNG ───────────────────────────────────────────────────────
// Mulberry32 — short, fast, good enough for property-style tests.
function makeRng(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Sample a distribution: returns { mean, min, max, p95, n }.
function sampleStats(rng, fn, n) {
  const values = new Array(n);
  for (let i = 0; i < n; i++) values[i] = fn(rng);
  values.sort((a, b) => a - b);
  const sum = values.reduce((s, v) => s + v, 0);
  return {
    n,
    min: values[0],
    max: values[values.length - 1],
    mean: sum / n,
    median: values[Math.floor(n / 2)],
    p95: values[Math.floor(n * 0.95)],
    p5: values[Math.floor(n * 0.05)],
  };
}

// ── Persistence sandbox ──────────────────────────────────────────────────────
// Override engine/persistence so tests never write to data/ on disk.
function sandboxPersistence(tag) {
  const persistence = require('../src/engine/persistence');
  const tmpDir = path.join(__dirname, '..', '.tmp-' + (tag || 'test'));
  if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true, force: true });
  fs.mkdirSync(tmpDir, { recursive: true });
  persistence.save = (filename, data) => {
    const fp = path.join(tmpDir, filename);
    fs.mkdirSync(path.dirname(fp), { recursive: true });
    fs.writeFileSync(fp, JSON.stringify(data, null, 2));
  };
  persistence.load = (filename, fallback) => {
    const fp = path.join(tmpDir, filename);
    if (!fs.existsSync(fp)) return fallback === undefined ? null : fallback;
    try { return JSON.parse(fs.readFileSync(fp, 'utf8')); }
    catch (_) { return fallback === undefined ? null : fallback; }
  };
  return {
    dir: tmpDir,
    cleanup: () => { try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {} },
  };
}

// ── Player fixtures ───────────────────────────────────────────────────────────
// Lazy-required so this helper loads even when callers don't touch the engine.
let _playerLib = null;
let _breakpoints = null;
function _getPlayerLib() { if (!_playerLib) _playerLib = require('../src/player/player'); return _playerLib; }
function _getBreakpoints() { if (!_breakpoints) _breakpoints = require('../src/engine/breakpoint-runner'); return _breakpoints; }

let _nextFixtureId = 10000;
function makePlayer(name, opts) {
  const playerLib = _getPlayerLib();
  const id = (opts && opts.id) || String(_nextFixtureId++);
  const p = playerLib.createPlayer(id, name || 'TestPlayer_' + id);
  if (opts && opts.bootstrapBreakpoints !== false) {
    _getBreakpoints().bootstrap(p);
  }
  return p;
}

// Clear a player's breakpoint history so a test can trigger crossings cleanly.
function freshBreakpoint(p) {
  p.breakpointsHit = {};
  p.breakpointHistory = [];
}

// Equip an item directly onto a player (bypassing inventory + level checks).
// Used by formula tests where the point is the math, not the equip pipeline.
function equipDirect(p, slot, item) {
  p.equipment[slot] = item;
}

// ── OSRS reference values ─────────────────────────────────────────────────────
// Level thresholds from spec 14 TEST-1401.
const OSRS_XP_MILESTONES = [
  [2, 83],
  [10, 1154],
  [20, 4470],
  [30, 13363],
  [40, 37224],
  [50, 101333],
  [60, 273742],
  [70, 737627],
  [80, 1986068],
  [90, 5346332],
  [92, 6517253],
  [99, 13034431],
];

// Bone XP values (spec 06 TEST-0611).
const BONE_PRAYER_XP = {
  'Bones':          4.5,
  'Big bones':      15,
  'Dragon bones':   72,
};

// Food heal values (spec 09).
const FOOD_HEAL_REF = {
  shrimps:      3,
  chicken:      3,
  trout:        7,
  salmon:       9,
  lobster:      12,
  swordfish:    14,
  shark:        20,
};

// Weapon attack speeds (spec 16 TEST-1606).
const WEAPON_SPEED_REF = {
  unarmed:       4,
  dagger:        4,
  scimitar:      4,
  whip:          4,
  longsword:     5,
  battleaxe:     6,
  warhammer:     6,
  '2h sword':    7,
  godsword:      7,
  halberd:       7,
  shortbow:      4,
  longbow:       6,
  crossbow:      6,
};

module.exports = {
  makeReporter,
  makeRng, sampleStats,
  sandboxPersistence,
  makePlayer, freshBreakpoint, equipDirect,
  OSRS_XP_MILESTONES, BONE_PRAYER_XP, FOOD_HEAL_REF, WEAPON_SPEED_REF,
};
