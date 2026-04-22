// ══════════════════════════════════════════════════════════════════════════════
// Bot state — all persistent fields for one simulated account.
//
// The state is intentionally small. The diagnostic only cares about what
// affects feasibility + goal scoring:
//   - skills    { <id>: xp }       XP per skill → level derived via xpTable
//   - inventory { <itemId>: qty }  consumables for processing actions
//   - gp                           currency
//   - quests    Set of completed quest ids
//   - area      current Aelgard region (free travel between adjacent, no cost)
//   - unlocks   Set of progression-DAG node ids reached
//
// v0.9 Wave C adds:
//   - touchHistory  ring buffer of last N action_ids
//   - touchCounts   action_id → occurrences in the current window
//
// Touch tracking feeds the planner's novelty/diversity bonus (C9): an action
// scores higher the less it has been chosen in the last window. Window size
// is passed in at construction (default 100, matches the roadmap).
//
// The state object is mutated in place by `apply()` and `recordTouch()`. Use
// `snapshot()` to get a plain JSON-safe copy for event-log state_snapshot.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const fs   = require('fs');
const path = require('path');

// OSRS XP table — duplicated from _shape.js to keep src/sim decoupled from
// the engine module graph. Same numbers, same 99 levels.
function buildXpTable(maxLevel = 99) {
  const table = [0];
  let acc = 0;
  for (let level = 1; level <= maxLevel; level++) {
    table[level] = Math.floor(acc / 4);
    acc += Math.floor(level + 300 * Math.pow(2, level / 7));
  }
  return table;
}

const XP_TABLE = buildXpTable(99);

function levelForXp(xp) {
  for (let lvl = XP_TABLE.length - 1; lvl >= 1; lvl--) {
    if (xp >= XP_TABLE[lvl]) return lvl;
  }
  return 1;
}

const DEFAULT_TOUCH_WINDOW = 100;

// ─── Burn-out thresholds (v0.9 Wave D — real-commitment calibration) ────────
//
// Real OSRS hiscores show players quit a boss well before mathematical
// average-luck drops trigger. `burnoutThreshold[bossKey]` = KC ceiling past
// which this bot refuses to attempt the boss again. When the planner sees
// that state.bossKc[bossKey] >= burnoutThreshold[bossKey], the action is
// filtered out — the bot "moves on".
//
// Ceilings are archetype-dependent fractions of p99_kc (the realistic
// dedicated-player commitment, sampled from OSRS hiscores rank 50):
//   - low        5%   (50-250 KC max per boss — casual)
//   - medium     20%  (200-1000 KC — serious)
//   - high       60%  (600-4000 KC — completionist)
//   - unlimited  200% (commits past any realistic human — mathematical control)
//
// Burnout thresholds are loaded from data/burnout-thresholds.json. If the
// file is absent the bot has no boss gate (undefined threshold → no limit).
const BURNOUT_FRACTIONS = Object.freeze({
  low:       0.05,
  medium:    0.20,
  high:      0.60,
  unlimited: 2.00,
});

// Module-level cache so we only parse the JSON once across all bots.
let _cachedBurnoutData = null;
function loadBurnoutData() {
  if (_cachedBurnoutData !== null) return _cachedBurnoutData;
  const p = path.join(__dirname, '..', '..', 'data', 'burnout-thresholds.json');
  try {
    if (fs.existsSync(p)) {
      _cachedBurnoutData = JSON.parse(fs.readFileSync(p, 'utf8'));
    } else {
      _cachedBurnoutData = { bosses: {} };
    }
  } catch (_e) {
    _cachedBurnoutData = { bosses: {} };
  }
  return _cachedBurnoutData;
}

// Test hook — reset the module cache (useful when tests inject a custom data
// object via opts.burnoutData).
function _resetBurnoutCache() { _cachedBurnoutData = null; }

// ─── Boss-key detection ──────────────────────────────────────────────────
//
// An action is a "boss kill" when:
//   - activity.boss_key is set explicitly (authoritative), OR
//   - activity.id matches kill_<something> / fight_<something> / kc_<something>
//     where <something> is one of the known boss keys in burnout-thresholds.
//
// The list of known keys is derived from the loaded burnout data at module
// init. Actions referencing unknown bosses fall through (no KC credit).
//
// Why id-pattern and not a dedicated field on every catalog entry? The
// intensity catalog (2309 activities) was generated before burn-out was a
// concept. Re-annotating every entry would touch generated data; pattern
// detection is scoped to the sim and survives catalog regeneration.
const ACTION_ID_BOSS_RE = /^(?:kill|fight|kc|boss)[_-]([a-z0-9_]+)$/i;

function knownBossKeys() {
  const data = loadBurnoutData();
  if (!data || !data.bosses) return new Set();
  return new Set(Object.keys(data.bosses));
}

function detectBossKey(activity) {
  if (!activity) return null;
  if (activity.boss_key) return activity.boss_key;   // explicit takes precedence

  const id = activity.id || activity.activity_id;
  if (!id || typeof id !== 'string') return null;
  const m = id.match(ACTION_ID_BOSS_RE);
  if (!m) return null;
  const candidate = m[1].toLowerCase();
  const known = knownBossKeys();
  if (known.has(candidate)) return candidate;
  // Try collapsed variants — e.g. `kill_king_black_dragon` → `king_black_dragon`
  // is already the key; but e.g. `kill_kreearra` matches `kreearra` directly.
  // Also accept nightmare / phantom_muspah etc. as-is.
  return null;
}

// Compute per-boss thresholds for this archetype. Returns a plain object
// { bossKey → integer KC ceiling }. Values are Math.max(1, …) so the low
// archetype still has at least 1-KC commitment for low-p99 bosses like
// hespori (1829 × 0.05 = 91 KC — fine).
function computeBurnoutThresholds(archetype, burnoutData) {
  const frac = BURNOUT_FRACTIONS[archetype];
  if (frac === undefined) return Object.create(null);
  const data = burnoutData || loadBurnoutData();
  const out = Object.create(null);
  if (!data || !data.bosses) return out;
  for (const [bossKey, info] of Object.entries(data.bosses)) {
    if (!info || typeof info.p99_kc !== 'number') continue;
    out[bossKey] = Math.max(1, Math.round(info.p99_kc * frac));
  }
  return out;
}

class BotState {
  constructor(archetype, opts = {}) {
    this.archetype = archetype;
    this.skills = Object.create(null);
    this.inventory = Object.create(null);
    this.gp = 0;
    this.quests = new Set();
    this.area = 'Heartlands';
    this.unlocks = new Set(['start']);
    this.day_ms = 0;
    this.sim_day = 0;
    this.tick = 0;

    // ─── Novelty tracking (C9) ────────────────────────────────────────────
    // Ring buffer + counter map so we can ask "how many times was action X
    // chosen in the last N decisions?" in O(1).
    this.touchWindow  = opts.touchWindow || DEFAULT_TOUCH_WINDOW;
    this.touchHistory = [];                          // ring buffer of action_ids
    this.touchCounts  = Object.create(null);         // action_id → count in window

    // ─── Burn-out calibration (Wave D) ────────────────────────────────────
    // bossKc: count of attempts at each boss this bot has made.
    // burnoutThreshold: per-boss KC ceiling. When bossKc[k] >= threshold[k]
    // the planner filters that boss's actions out.
    //
    // Callers can override the threshold fraction via opts.burnoutFraction
    // (0-2) or pass a pre-computed threshold map via opts.burnoutThreshold.
    // Tests use this to isolate burn-out behaviour from real p99 values.
    this.bossKc = Object.create(null);
    if (opts.burnoutThreshold) {
      this.burnoutThreshold = Object.assign(Object.create(null), opts.burnoutThreshold);
    } else {
      const fracOverride = (typeof opts.burnoutFraction === 'number')
        ? opts.burnoutFraction : null;
      if (fracOverride !== null) {
        // Compute against data but with a custom fraction.
        const data = opts.burnoutData || loadBurnoutData();
        const out = Object.create(null);
        if (data && data.bosses) {
          for (const [k, v] of Object.entries(data.bosses)) {
            if (!v || typeof v.p99_kc !== 'number') continue;
            out[k] = Math.max(1, Math.round(v.p99_kc * fracOverride));
          }
        }
        this.burnoutThreshold = out;
      } else {
        this.burnoutThreshold = computeBurnoutThresholds(archetype, opts.burnoutData);
      }
    }
  }

  /** Is this bot at/over the burn-out ceiling for `bossKey`? */
  isBurntOut(bossKey) {
    if (!bossKey) return false;
    const cap = this.burnoutThreshold[bossKey];
    if (cap === undefined) return false;        // no ceiling → never burnt out
    return (this.bossKc[bossKey] || 0) >= cap;
  }

  /** Increment boss-kill counter for `bossKey`. No-op for null/undefined. */
  creditBossKill(bossKey) {
    if (!bossKey) return;
    this.bossKc[bossKey] = (this.bossKc[bossKey] || 0) + 1;
  }

  /** Current KC for `bossKey`. */
  kcFor(bossKey) {
    if (!bossKey) return 0;
    return this.bossKc[bossKey] || 0;
  }

  /**
   * Record that `action_id` was just chosen. Evicts the oldest entry if the
   * window is full so `touchCounts` stays accurate for the last N picks.
   */
  recordTouch(action_id) {
    if (action_id == null) return;
    this.touchHistory.push(action_id);
    this.touchCounts[action_id] = (this.touchCounts[action_id] || 0) + 1;
    while (this.touchHistory.length > this.touchWindow) {
      const evicted = this.touchHistory.shift();
      if (evicted == null) continue;
      this.touchCounts[evicted] -= 1;
      if (this.touchCounts[evicted] <= 0) delete this.touchCounts[evicted];
    }
  }

  /** How many times was `action_id` chosen in the last N picks? */
  touchCount(action_id) {
    return this.touchCounts[action_id] || 0;
  }

  /**
   * Derived level for a skill (0 xp → level 1).
   */
  level(skillId) {
    const xp = this.skills[skillId] || 0;
    return levelForXp(xp);
  }

  /**
   * Does the bot satisfy the `requires` block of an activity?
   *
   * `requires` shape accepts both the catalog shape
   *   { level: {...}, items: [...], quest: 'id', area: '...' }
   * and the multi-quest shape used by synthesised quest actions
   *   { quests: ['id1', 'id2'], level: {...} }
   */
  satisfies(requires) {
    if (!requires) return true;

    if (requires.level) {
      for (const [skill, need] of Object.entries(requires.level)) {
        if (this.level(skill) < need) return false;
      }
    }
    if (requires.items) {
      for (const { id, qty } of requires.items) {
        if ((this.inventory[id] || 0) < (qty || 1)) return false;
      }
    }
    if (requires.quest) {
      if (!this.quests.has(requires.quest)) return false;
    }
    if (Array.isArray(requires.quests)) {
      for (const q of requires.quests) {
        if (!this.quests.has(q)) return false;
      }
    }
    if (requires.area) {
      // Area check is soft — bots auto-travel in the stub. Ignore for now.
    }
    return true;
  }

  /**
   * Apply the outputs of an activity. Consumes required items; credits XP,
   * GP, and produced items; flips quest flags.
   */
  apply(activity) {
    // Consume inputs
    if (activity.requires && activity.requires.items) {
      for (const { id, qty } of activity.requires.items) {
        this.inventory[id] = (this.inventory[id] || 0) - (qty || 1);
        if (this.inventory[id] <= 0) delete this.inventory[id];
      }
    }

    const out = activity.base_output || {};

    // Credit XP
    if (out.xp) {
      for (const [skill, xp] of Object.entries(out.xp)) {
        this.skills[skill] = (this.skills[skill] || 0) + xp;
      }
    }

    // Credit GP
    if (typeof out.gp === 'number') this.gp += out.gp;

    // Credit produced items
    if (Array.isArray(out.items)) {
      for (const { id, qty } of out.items) {
        this.inventory[id] = (this.inventory[id] || 0) + (qty || 1);
      }
    }

    // Quest flip
    if (out.quest) this.quests.add(out.quest);

    // DAG unlocks credit — used by synthesised quest actions so their
    // downstream rewards register immediately.
    if (Array.isArray(out.unlocks)) {
      for (const id of out.unlocks) this.unlocks.add(id);
    }

    // Area update if the action has a region property
    if (activity.region) this.area = activity.region;

    // Burn-out KC tracking — credit the boss if the activity is a boss kill.
    // Detection is id-pattern based (kill_*, fight_*) or explicit .boss_key.
    const bossKey = detectBossKey(activity);
    if (bossKey) this.creditBossKill(bossKey);
  }

  /** JSON-safe snapshot for event log. Only includes primitives. */
  snapshot() {
    return {
      archetype: this.archetype,
      skills:    { ...this.skills },
      gp:        this.gp,
      quests:    [...this.quests],
      area:      this.area,
      unlocks:   [...this.unlocks],
      day_ms:    this.day_ms,
      sim_day:   this.sim_day,
      tick:      this.tick,
      levels:    this._derivedLevels(),
      bossKc:    { ...this.bossKc },
    };
  }

  _derivedLevels() {
    const out = Object.create(null);
    for (const skill of Object.keys(this.skills)) {
      out[skill] = this.level(skill);
    }
    return out;
  }

  /** Highest skill level currently reached. */
  highestLevel() {
    let best = 1;
    for (const skill of Object.keys(this.skills)) {
      const lvl = this.level(skill);
      if (lvl > best) best = lvl;
    }
    return best;
  }

  /** Total XP across all skills. */
  totalXp() {
    let sum = 0;
    for (const xp of Object.values(this.skills)) sum += xp;
    return sum;
  }
}

module.exports = {
  BotState, XP_TABLE, levelForXp, buildXpTable, DEFAULT_TOUCH_WINDOW,
  BURNOUT_FRACTIONS, computeBurnoutThresholds, loadBurnoutData,
  detectBossKey, ACTION_ID_BOSS_RE, _resetBurnoutCache,
};
