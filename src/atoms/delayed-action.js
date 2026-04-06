// ══════════════════════════════════════════════════════════════════════════════
// ATOM: Delayed Action
// Action starts now, resolves N ticks later. Projectile flight, spell cast.
//
// Examples:
//   - Ranged projectile: fires tick 0, lands tick 2-3
//   - Magic spell: cast tick 0, hits tick 1-3 based on distance
//   - Prayer check happens when projectile LANDS, not when it fires
//   - Healer spark: 3 arc projectiles, each with different delay
// ══════════════════════════════════════════════════════════════════════════════

class DelayedAction {
  /**
   * @param {Object} opts
   * @param {number} opts.delay       - ticks until resolution
   * @param {Function} opts.onResolve - called when delay reaches 0
   * @param {Function} [opts.onStart] - called when created
   * @param {Object} [opts.data]      - arbitrary data carried with the action
   */
  constructor(opts) {
    this.delay = opts.delay;
    this.remaining = opts.delay;
    this.onResolve = opts.onResolve;
    this.onStart = opts.onStart || null;
    this.data = opts.data || {};
    this.resolved = false;
    this.cancelled = false;

    if (this.onStart) this.onStart(this.data);
  }

  tick() {
    if (this.resolved || this.cancelled) return false;

    this.remaining--;
    if (this.remaining <= 0) {
      this.resolved = true;
      if (this.onResolve) this.onResolve(this.data);
      return true; // just resolved
    }
    return false;
  }

  cancel() {
    this.cancelled = true;
  }

  get isResolved() { return this.resolved; }
  get isCancelled() { return this.cancelled; }
  get isDone() { return this.resolved || this.cancelled; }
  get ticksLeft() { return this.remaining; }
  get percent() { return this.delay > 0 ? 1 - (this.remaining / this.delay) : 1; }
}

/** Manage a collection of delayed actions, tick them all, clean up resolved ones. */
class DelayedActionQueue {
  constructor() {
    this.actions = [];
  }

  add(opts) {
    const action = new DelayedAction(opts);
    this.actions.push(action);
    return action;
  }

  tick() {
    const resolved = [];
    for (const action of this.actions) {
      if (action.tick()) resolved.push(action);
    }
    // Remove completed actions
    this.actions = this.actions.filter(a => !a.isDone);
    return resolved;
  }

  cancelAll() {
    for (const a of this.actions) a.cancel();
    this.actions = [];
  }

  get pending() { return this.actions.length; }
  get all() { return [...this.actions]; }
}

module.exports = DelayedAction;
module.exports.Queue = DelayedActionQueue;
