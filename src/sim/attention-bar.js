// ══════════════════════════════════════════════════════════════════════════════
// Attention bar — cap-based budget for a single bot account within a day.
//
// The bar is the ONLY thing that varies between the 4 simulated archetypes
// (low / medium / high / unlimited). Everything else is universal: drain
// per action, output per action, decision policy.
//
// Session rules:
//   - `bar` starts full each sim-day (refill on day_end).
//   - `drain(cost)` decrements by `cost`, never below 0.
//   - `isExhausted()` returns true when bar === 0. The runner uses this to
//     emit `session_end` with reason `bar depleted`.
//   - The 8-hour wall is enforced by the runner, not the bar.
//
// `cap = Infinity` is supported — that's the `unlimited` bot. isExhausted()
// is never true in that case; only the 8-hour wall ends the session.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const CAPS = Object.freeze({
  low:       200,
  medium:    500,
  high:     1000,
  unlimited: Infinity,
});

function capFor(archetype) {
  if (!(archetype in CAPS)) {
    throw new Error(`unknown archetype: ${archetype}`);
  }
  return CAPS[archetype];
}

class AttentionBar {
  constructor(archetype) {
    this.archetype = archetype;
    this.cap = capFor(archetype);
    this.bar = this.cap;
  }

  /**
   * Spend `cost` attention. Returns the actual amount drained (may be less
   * than requested if the bar was lower than `cost`). The bar never goes
   * negative.
   */
  drain(cost) {
    if (!Number.isFinite(cost) || cost < 0) {
      throw new Error(`invalid drain cost: ${cost}`);
    }
    if (this.cap === Infinity) return cost; // unlimited — pretend it drained
    const actual = Math.min(this.bar, cost);
    this.bar -= actual;
    return actual;
  }

  /**
   * Can the bar afford `cost` right now? Used by the planner's fallback check.
   */
  canAfford(cost) {
    if (this.cap === Infinity) return true;
    return this.bar >= cost;
  }

  /**
   * True when the archetype has finite cap AND bar is 0. The unlimited bot
   * is never exhausted — the 8h wall is what ends its session.
   */
  isExhausted() {
    if (this.cap === Infinity) return false;
    return this.bar <= 0;
  }

  /** Refill to cap at day rollover. */
  refill() {
    this.bar = this.cap;
  }

  /** Snapshot for logs. */
  snapshot() {
    return { bar: this.cap === Infinity ? Infinity : this.bar, cap: this.cap };
  }
}

module.exports = { AttentionBar, CAPS, capFor };
