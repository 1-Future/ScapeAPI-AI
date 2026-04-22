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

module.exports = { BotState, XP_TABLE, levelForXp, buildXpTable, DEFAULT_TOUCH_WINDOW };
