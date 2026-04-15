// ══════════════════════════════════════════════════════════════════════════════
// Clue-Scroll Runner — activates treasure trails.
//
// The content in src/content/aelgard/treasure-trails.js and
// src/content/aelgard/clue-scrolls-expanded.js defines step + reward tables
// for 5 tiers. Nothing was wired up — player.activeClue was declared but
// never advanced. This runner closes that gap.
//
// Public API:
//   startClue(player, tier)         — roll a chain from the step registry
//   currentStep(player)             — peek the current step (or null)
//   attemptSolve(player, input)     — advance if input solves the step
//   giveReward(player)              — claim once all steps are solved
//   abandonClue(player)             — scrap the trail
//   dropClue(player, tier, opts)    — roll a scroll drop, deterministic under seededRng
//
// Step types supported (task spec §2):
//   coord          : { x, y } — dig exactly (±tolerance)
//   anagram        : { solution } — submit descrambled NPC name
//   cryptic        : { solution | target } — free-text location/NPC
//   sextant        : { degNorth, minNorth, degEast, minEast }
//   emote          : { emote, area | x,y } — walk + emote at location
//   hot-cold       : { x, y } — temperature hint, "solve" when on tile
//   hallowed       : { x, y, direction } — dig after compass rose
//   item-placement : { itemId, x, y } — place item at coord
//   map            : { x, y } — image hint; dig at location
//   puzzle         : { answer } — slide/lockbox/cipher, submit solution
//
// Legacy content types (coordinate, riddle, combat) are normalised into
// { coord, cryptic, combat } so existing step definitions still work.
//
// Manifesto P02/P03: clues are background-to-active, self-directed.
// Manifesto P06: completed clue unique items flow into collection log.
// Manifesto P08: master tier = breakpoint event (bloodhound pet chance).
//
// Sub-system of the Engine Bridge.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

// ── Seeded RNG (deterministic tests, live randomness in prod) ────────────────
// Classic mulberry32 — 32-bit state, cheap, good enough for loot rolls.
function makeSeededRng(seed) {
  let t = (seed | 0) || 1;
  return function rng() {
    t = (t + 0x6D2B79F5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

let _rng = Math.random;
function setRng(fn) { _rng = typeof fn === 'function' ? fn : Math.random; }
function resetRng() { _rng = Math.random; }
function rand() { return _rng(); }
function randInt(min, max) { return Math.floor(rand() * (max - min + 1)) + min; }

// ── Tier aliases (task spec §1 uses easy/medium/hard/elite/master; content
// uses beginner/...). Canonicalise externally-visible APIs. ──────────────────
const TIER_ALIAS = { easy: 'beginner', novice: 'beginner' };
const TIERS = ['beginner', 'medium', 'hard', 'elite', 'master'];

function canonTier(tier) {
  if (!tier) return null;
  const t = String(tier).toLowerCase();
  if (TIER_ALIAS[t]) return TIER_ALIAS[t];
  return TIERS.includes(t) ? t : null;
}

// ── Step type normalisation ──────────────────────────────────────────────────
// Content types (legacy) → runner types (spec).
const TYPE_ALIAS = {
  coordinate: 'coord',
  riddle: 'cryptic',
};

const SUPPORTED_TYPES = new Set([
  'coord', 'anagram', 'cryptic', 'sextant', 'emote',
  'hot-cold', 'hallowed', 'item-placement', 'map', 'puzzle',
  'combat', // existing content uses this — keep solvable
]);

function normType(t) {
  const lowered = String(t || '').toLowerCase();
  return TYPE_ALIAS[lowered] || lowered;
}

// ── Reward table defaults (filled in lazily from content) ────────────────────
// Task spec §3 roll counts per tier.
const ROLL_COUNTS = {
  beginner: [3, 5],   // min, max
  medium:   [5, 7],
  hard:     [7, 10],
  elite:    [10, 12],
  master:   [12, 15],
};

// Unique-drop odds per tier (task spec §3): 1/N.
const UNIQUE_ODDS = {
  beginner: 200,   // not specified — gentle default
  medium:   100,
  hard:     50,
  elite:    25,
  master:   10,
};

// Items considered "unique" for the per-tier collection-log source.
// Pulled from data/collection-log.json at register time.
// We track a per-tier Set so any item in it counts as the unique roll.
const UNIQUE_ITEMS = {
  beginner: new Set([12501]),                         // Uncut sapphire (placeholder)
  medium:   new Set([23020, 23021, 23003]),           // ranger/wizard boots, black (t)
  hard:     new Set([23001, 23002, 23022, 23010, 23011]), // rune (t/g), Robin Hood, books
  elite:    new Set([23030, 23031, 23032, 23033, 23034]), // third-age set
  master:   new Set([34001, 34002, 34003, 34004, 34005, 34006, 34007, 34008, 34009, 34010]),
};

// Chain length per tier — taken from content when possible, else defaulted.
const CHAIN_LENGTH = {
  beginner: 3,
  medium:   5,
  hard:     8,
  elite:    12,
  master:   15,
};

// ── Content-adapter: treasure-trails registry ────────────────────────────────
// Module is optional (test isolation). Attach or resolve lazily.
let _trails = null;
let _items = null;
let _collectionLog = null;

function getTrails() {
  if (_trails) return _trails;
  try { _trails = require('../content/aelgard/treasure-trails'); } catch (_) { _trails = null; }
  return _trails;
}

function getItems() {
  if (_items) return _items;
  try { _items = require('../data/items'); } catch (_) { _items = null; }
  return _items;
}

function getCollectionLog() {
  if (_collectionLog) return _collectionLog;
  try { _collectionLog = require('./collection-log'); } catch (_) { _collectionLog = null; }
  return _collectionLog;
}

function setDeps(deps) {
  deps = deps || {};
  if (deps.trails) _trails = deps.trails;
  if (deps.items) _items = deps.items;
  if (deps.collectionLog) _collectionLog = deps.collectionLog;
}

// ── Step catalogue access ────────────────────────────────────────────────────
// Runner-local step map so tests can seed directly without loading content.
const _overrideSteps = new Map(); // tier → [step, ...]

function registerStep(tier, step) {
  const t = canonTier(tier);
  if (!t) throw new Error(`registerStep: unknown tier ${tier}`);
  if (!_overrideSteps.has(t)) _overrideSteps.set(t, []);
  _overrideSteps.get(t).push(step);
}

function _stepsFor(tier) {
  const t = canonTier(tier);
  if (!t) return [];
  const out = [];
  if (_overrideSteps.has(t)) out.push(..._overrideSteps.get(t));
  const trails = getTrails();
  if (trails && trails.clueSteps) {
    const arr = trails.clueSteps.get(t) || [];
    out.push(...arr);
  }
  return out;
}

// ── Player-state helpers ─────────────────────────────────────────────────────

function ensureState(p) {
  if (!p.cluesCompleted || typeof p.cluesCompleted !== 'object') p.cluesCompleted = {};
  if (!p.collectionLog || typeof p.collectionLog !== 'object') p.collectionLog = {};
  return p;
}

function _clueLogKey(tier) { return `clue_${tier}`; }

function _markUnique(p, tier, itemId) {
  const cl = getCollectionLog();
  const sourceId = _clueLogKey(tier);
  // Register through the catalogue if present (keeps completion-reward flow).
  if (cl && cl.registerEntry) {
    const res = cl.registerEntry(p, sourceId, itemId);
    if (res && res.added) return { added: true, justCompleted: !!res.justCompleted, reward: res.reward || null };
  }
  // Fallback: maintain the per-source array directly.
  ensureState(p);
  if (!p.collectionLog[sourceId]) p.collectionLog[sourceId] = [];
  if (!p.collectionLog[sourceId].some(id => id === itemId || String(id) === String(itemId))) {
    p.collectionLog[sourceId].push(itemId);
    return { added: true, justCompleted: false, reward: null };
  }
  return { added: false };
}

// Normalise the content-step into a runner-step; injects puzzle answers,
// coord targets, etc., so attemptSolve can compare cleanly.
function _materialise(step) {
  const type = normType(step.type);
  const out = {
    id: step.id || null,
    type,
    description: step.description || step.hint || '',
    region: step.region || null,
    solution: step.solution != null ? String(step.solution).toLowerCase() : null,
    solved: false,
  };

  // Coord-like: content descriptions carry "Dig at X, Y" — try to infer if
  // explicit x/y are absent. Keeps the existing content data usable.
  const coordTypes = new Set(['coord', 'hot-cold', 'hallowed', 'map', 'item-placement']);
  if (coordTypes.has(type)) {
    if (typeof step.x === 'number' && typeof step.y === 'number') {
      out.x = step.x; out.y = step.y;
    } else if (out.description) {
      const m = out.description.match(/\(?\s*(\d{1,4})\s*[,\s]\s*(\d{1,4})\s*\)?/);
      if (m) { out.x = parseInt(m[1], 10); out.y = parseInt(m[2], 10); }
    }
  }

  // Type-specific extras.
  if (type === 'combat') out.combatLevel = step.combatLevel || 0;
  if (type === 'emote') {
    out.emote = (step.emote || '').toLowerCase() || null;
    if (!out.emote && out.description) {
      // Sniff an emote from "Wave at ..." / "Dance ..."
      const emotes = ['wave', 'bow', 'dance', 'clap', 'yawn', 'cry', 'jig', 'panic', 'cheer',
        'spin', 'beckon', 'stomp', 'flex', 'jump'];
      for (const e of emotes) {
        if (out.description.toLowerCase().includes(e)) { out.emote = e; break; }
      }
    }
  }
  if (type === 'sextant') {
    out.degNorth = step.degNorth || 0;
    out.minNorth = step.minNorth || 0;
    out.degEast  = step.degEast  || 0;
    out.minEast  = step.minEast  || 0;
    if (typeof step.x !== 'number' || typeof step.y !== 'number') {
      // Degrees/minutes → world coord (trivial mapping for v1)
      out.x = out.degEast * 8 + Math.floor(out.minEast / 8);
      out.y = out.degNorth * 8 + Math.floor(out.minNorth / 8);
    } else {
      out.x = step.x; out.y = step.y;
    }
  }
  if (type === 'item-placement') {
    out.itemId = step.itemId || null;
  }
  if (type === 'anagram') {
    // Anagram content steps have { solution } (npc name). Keep as-is.
    if (step.anagram) out.anagram = step.anagram;
  }
  if (type === 'puzzle') {
    // Puzzles are client-driven; the runner accepts any answer the content
    // defines (slide puzzle = "solved", lockbox = N-digit code, cipher = word).
    out.answer = step.answer != null ? String(step.answer).toLowerCase() : 'solved';
  }
  return out;
}

// ── Public API ───────────────────────────────────────────────────────────────

// Start a clue. Picks a random chain of steps from the tier catalogue.
// Returns { ok, reason?, tier, steps }
function startClue(p, tier) {
  ensureState(p);
  if (p.activeClue) return { ok: false, reason: 'clue_in_progress' };

  const t = canonTier(tier);
  if (!t) return { ok: false, reason: `unknown tier: ${tier}` };

  const pool = _stepsFor(t);
  if (!pool.length) return { ok: false, reason: `no steps defined for ${t}` };

  const want = CHAIN_LENGTH[t] || 3;
  const count = Math.min(want, pool.length);

  // Seeded shuffle — deterministic under setRng()
  const shuffled = pool.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = tmp;
  }
  const picked = shuffled.slice(0, count).map(_materialise);

  p.activeClue = {
    tier: t,
    steps: picked,
    currentStep: 0,
    startedAt: Date.now(),
    solved: false,
  };
  return { ok: true, tier: t, stepCount: picked.length, firstHint: picked[0] ? picked[0].description : null };
}

function currentStep(p) {
  if (!p || !p.activeClue) return null;
  const idx = p.activeClue.currentStep;
  if (idx >= p.activeClue.steps.length) return null;
  return p.activeClue.steps[idx];
}

// Advance the clue. Returns { ok, solved, complete, reason? }.
// `input` shape varies by step type:
//   coord / map / hallowed / hot-cold / sextant : { x, y } or "dig" using p.x,p.y
//   anagram / cryptic / puzzle                  : { answer }
//   emote                                       : { emote } at p.x,p.y
//   item-placement                              : { itemId } at p.x,p.y
//   combat                                      : { kill: true }
function attemptSolve(p, input) {
  if (!p || !p.activeClue) return { ok: false, reason: 'no_active_clue' };
  if (p.activeClue.solved) return { ok: false, reason: 'awaiting_reward' };

  const step = currentStep(p);
  if (!step) return { ok: false, reason: 'no_step' };

  input = input || {};
  let solved = false;

  switch (step.type) {
    case 'coord':
    case 'map':
    case 'hot-cold':
    case 'hallowed':
    case 'sextant': {
      const x = (input.x != null) ? input.x : p.x;
      const y = (input.y != null) ? input.y : p.y;
      if (step.x == null || step.y == null) return { ok: false, reason: 'step_missing_coords' };
      // Tolerance: coord=0 (exact), map/hot-cold/hallowed/sextant=1 (generous)
      const tol = (step.type === 'coord') ? 0 : 1;
      solved = Math.abs(x - step.x) <= tol && Math.abs(y - step.y) <= tol;
      break;
    }

    case 'anagram':
    case 'cryptic':
    case 'puzzle': {
      const answer = (input.answer != null ? String(input.answer) : '').trim().toLowerCase();
      const target = (step.type === 'puzzle')
        ? (step.answer || 'solved')
        : (step.solution || '');
      if (!target) return { ok: false, reason: 'step_has_no_solution' };
      solved = answer === target.toLowerCase();
      break;
    }

    case 'emote': {
      const emote = (input.emote != null ? String(input.emote) : '').trim().toLowerCase();
      if (!step.emote) return { ok: false, reason: 'step_has_no_emote' };
      let at = true;
      if (step.x != null && step.y != null) {
        at = Math.abs(p.x - step.x) <= 2 && Math.abs(p.y - step.y) <= 2;
      }
      solved = emote === step.emote && at;
      break;
    }

    case 'item-placement': {
      if (!step.itemId) return { ok: false, reason: 'step_has_no_item' };
      const itemId = Number(input.itemId || 0);
      const x = (input.x != null) ? input.x : p.x;
      const y = (input.y != null) ? input.y : p.y;
      const at = (step.x == null || step.y == null)
        ? true
        : Math.abs(x - step.x) <= 1 && Math.abs(y - step.y) <= 1;
      solved = itemId === Number(step.itemId) && at;
      break;
    }

    case 'combat': {
      // Content-level combat steps just require a confirm from the combat system.
      solved = !!input.kill;
      break;
    }

    default:
      return { ok: false, reason: `unknown_step_type: ${step.type}` };
  }

  if (!solved) return { ok: true, solved: false, reason: 'wrong' };

  step.solved = true;
  p.activeClue.currentStep++;
  const complete = p.activeClue.currentStep >= p.activeClue.steps.length;
  if (complete) p.activeClue.solved = true;

  return {
    ok: true,
    solved: true,
    complete,
    nextStep: complete ? null : (currentStep(p) ? currentStep(p).description : null),
    remaining: complete ? 0 : (p.activeClue.steps.length - p.activeClue.currentStep),
  };
}

// Roll the reward table, award items, register uniques, clear the clue.
// Returns { ok, reason?, tier, coins, items, uniqueRolled, completed }.
function giveReward(p) {
  if (!p || !p.activeClue) return { ok: false, reason: 'no_active_clue' };
  if (!p.activeClue.solved) return { ok: false, reason: 'not_complete' };

  ensureState(p);

  const tier = p.activeClue.tier;
  const trails = getTrails();
  const table = trails && trails.rewardTables && trails.rewardTables.get
    ? trails.rewardTables.get(tier)
    : null;

  const [minRolls, maxRolls] = ROLL_COUNTS[tier] || [3, 5];
  const rolls = randInt(minRolls, maxRolls);

  const drops = [];
  const items = getItems();

  // ── Coins: every clue completion pays out a coin range. ────────────────────
  let coins = 0;
  if (table && table.coinRange) {
    coins = randInt(table.coinRange[0], table.coinRange[1]);
    if (coins > 0) {
      drops.push({ id: 101, name: 'Coins', count: coins });
      _tryInvAdd(p, 101, 'Coins', coins, true);
    }
  }

  // ── Unique roll: 1/N chance to force a unique drop off the table. ──────────
  let uniqueRolled = null;
  const odds = UNIQUE_ODDS[tier] || 1000;
  const hitUnique = table && randInt(1, odds) === 1;
  if (hitUnique) {
    const uniques = _uniquePool(table, tier);
    if (uniques.length) {
      const u = _weightedPick(uniques);
      if (u) {
        const count = randInt(u.min || 1, u.max || 1);
        drops.push({ id: u.id, name: u.name, count });
        _tryInvAdd(p, u.id, u.name, count, false);
        uniqueRolled = { id: u.id, name: u.name };
        const reg = _markUnique(p, tier, u.id);
        if (reg && reg.justCompleted) {
          drops.push({ collectionLogCompleted: true, reward: reg.reward });
        }
      }
    }
  }

  // ── Main rolls from the reward table. ──────────────────────────────────────
  if (table && table.items && table.items.length) {
    for (let i = 0; i < rolls; i++) {
      const r = _weightedPick(table.items);
      if (!r) continue;
      const count = randInt(r.min || 1, r.max || 1);
      if (count <= 0) continue;
      drops.push({ id: r.id, name: r.name, count });
      const def = items && items.get ? items.get(r.id) : null;
      _tryInvAdd(p, r.id, r.name, count, def ? !!def.stackable : false);
      // Uniques that slipped through the regular rolls still count.
      if (UNIQUE_ITEMS[tier] && UNIQUE_ITEMS[tier].has(r.id)) {
        const reg = _markUnique(p, tier, r.id);
        if (reg && reg.justCompleted) {
          drops.push({ collectionLogCompleted: true, reward: reg.reward });
        }
      }
    }
  }

  // ── Master-tier pet chance (task spec §3): 1/50 bloodhound inside master. ─
  if (tier === 'master' && randInt(1, 50) === 1) {
    drops.push({ id: 34001, name: 'Bloodhound', count: 1, pet: true });
    _tryInvAdd(p, 34001, 'Bloodhound', 1, false);
    const reg = _markUnique(p, tier, 34001);
    if (reg && reg.justCompleted) {
      drops.push({ collectionLogCompleted: true, reward: reg.reward });
    }
  }

  p.cluesCompleted[tier] = (p.cluesCompleted[tier] || 0) + 1;
  const completed = p.cluesCompleted[tier];
  p.activeClue = null;

  return { ok: true, tier, coins, items: drops, uniqueRolled, completed };
}

function abandonClue(p) {
  if (!p || !p.activeClue) return { ok: false, reason: 'no_active_clue' };
  const tier = p.activeClue.tier;
  p.activeClue = null;
  return { ok: true, tier };
}

// Drop a clue scroll on mob kill / skilling action.
// `opts` may include mobLevel (for combat) or resourceTier (for skilling).
// Returns { dropped, tier } or { dropped: false }.
function dropClue(p, tier, opts) {
  opts = opts || {};
  ensureState(p);

  // Explicit-tier path: always drops when forced (used by boss drops, tests).
  if (tier && opts.force) {
    const t = canonTier(tier);
    if (!t) return { dropped: false };
    return _tryGiveScroll(p, t) ? { dropped: true, tier: t } : { dropped: false, reason: 'already_holding' };
  }

  // Derive tier from mob level or resource tier.
  let t = canonTier(tier);
  if (!t) {
    const lvl = opts.mobLevel || 0;
    const res = (opts.resourceTier || '').toLowerCase();
    if (lvl >= 300 || res === 'master') t = 'master';
    else if (lvl >= 150 || res === 'elite') t = 'elite';
    else if (lvl >= 80  || res === 'hard')  t = 'hard';
    else if (lvl >= 30  || res === 'medium' || res === 'adamant' || res === 'rune') t = 'medium';
    else t = 'beginner';
  }

  // Drop rate by tier — tuned loosely to OSRS intent (1/N per roll).
  const RATES = { beginner: 50, medium: 100, hard: 200, elite: 500, master: 1000 };
  const rate = opts.rate || RATES[t] || 100;
  if (randInt(1, rate) !== 1) return { dropped: false };
  // Already holding a scroll of this tier? Skip (OSRS rule).
  return _tryGiveScroll(p, t) ? { dropped: true, tier: t } : { dropped: false, reason: 'already_holding' };
}

// ── Internal helpers ─────────────────────────────────────────────────────────

const SCROLL_IDS = {
  beginner: 33001, medium: 33002, hard: 33003, elite: 33004, master: 33005,
};
const SCROLL_NAMES = {
  beginner: 'Clue scroll (beginner)',
  medium:   'Clue scroll (medium)',
  hard:     'Clue scroll (hard)',
  elite:    'Clue scroll (elite)',
  master:   'Clue scroll (master)',
};

function _tryGiveScroll(p, tier) {
  const id = SCROLL_IDS[tier];
  if (!id) return false;
  // One-per-tier rule — don't double-hold.
  if (p.inventory && Array.isArray(p.inventory)) {
    if (p.inventory.some(s => s && s.id === id)) return false;
  }
  return _tryInvAdd(p, id, SCROLL_NAMES[tier], 1, false);
}

function _tryInvAdd(p, id, name, count, stackable) {
  if (!p) return false;
  // Prefer the engine's invAdd (inventory + bank-ready).
  try {
    const plr = require('../player/player');
    if (plr && plr.invAdd) return !!plr.invAdd(p, id, name, count, stackable);
  } catch (_) { /* fall through */ }
  // Minimal fallback for tests that don't load the full player module.
  if (!Array.isArray(p.inventory)) p.inventory = new Array(28).fill(null);
  if (stackable) {
    const idx = p.inventory.findIndex(s => s && s.id === id);
    if (idx >= 0) { p.inventory[idx].count += count; return true; }
  }
  const free = p.inventory.findIndex(s => s == null);
  if (free < 0) return false;
  p.inventory[free] = { id, name, count };
  return true;
}

function _weightedPick(arr) {
  if (!arr || !arr.length) return null;
  let total = 0;
  for (const e of arr) total += (e.weight || 1);
  let r = rand() * total;
  for (const e of arr) {
    r -= (e.weight || 1);
    if (r <= 0) return e;
  }
  return arr[arr.length - 1];
}

function _uniquePool(table, tier) {
  if (!table || !table.items) return [];
  const set = UNIQUE_ITEMS[tier] || new Set();
  return table.items.filter(i => set.has(i.id));
}

// ── Integration hooks (combat + skilling) ────────────────────────────────────
// These can be wired from the main bootstrap without importing the whole
// engine at test time.

function onMobKilled(p, opts) {
  return dropClue(p, null, {
    mobLevel: (opts && opts.mobLevel) || 0,
    rate: opts && opts.rate,
  });
}

function onSkillingAction(p, opts) {
  return dropClue(p, null, {
    resourceTier: (opts && opts.resourceTier) || 'beginner',
    rate: opts && opts.rate,
  });
}

// ── Register: opts = { events, combatEvents } ────────────────────────────────
// Optional event wiring; most callers use onMobKilled/onSkillingAction directly.
function register(opts) {
  opts = opts || {};
  const events = opts.events || (() => { try { return require('./events'); } catch (_) { return null; } })();
  if (events && events.on) {
    events.on('mob_killed', 'clue-runner', (d) => {
      if (!d || !d.player) return;
      onMobKilled(d.player, { mobLevel: d.mobLevel || d.combatLevel || 0 });
    });
    events.on('skilling_action', 'clue-runner', (d) => {
      if (!d || !d.player) return;
      onSkillingAction(d.player, { resourceTier: d.resourceTier || 'beginner' });
    });
  }
  return module.exports;
}

// ── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  // public surface
  startClue, currentStep, attemptSolve, giveReward, abandonClue, dropClue,
  // wiring
  onMobKilled, onSkillingAction, register,
  // test / content hooks
  registerStep, setRng, resetRng, makeSeededRng, setDeps,
  // constants (handy for other modules + tests)
  TIERS, UNIQUE_ITEMS, ROLL_COUNTS, CHAIN_LENGTH, SCROLL_IDS, SCROLL_NAMES,
  // normalisers
  canonTier, normType,
};
