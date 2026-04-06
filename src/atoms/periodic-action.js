// ══════════════════════════════════════════════════════════════════════════════
// ATOM: Periodic Action
// Repeat an action every N ticks: attempt, succeed/fail, give reward.
// The core of ALL skilling in the game.
//
// Examples:
//   - Mining: attempt every 3 ticks, roll success based on level vs rock
//   - Fishing: attempt every 5 ticks
//   - Cooking: process every 4 ticks, roll burn chance
//   - Smithing: smith every 3 ticks
//   - Woodcutting: chop every 4-8 ticks based on axe
// ══════════════════════════════════════════════════════════════════════════════

class PeriodicAction {
  /**
   * @param {Object} opts
   * @param {number} opts.interval        - ticks between attempts
   * @param {Function} opts.onAttempt     - called each interval: returns {success, xp, loot, message}
   * @param {Function} [opts.onSuccess]   - called on successful attempt
   * @param {Function} [opts.onFail]      - called on failed attempt (burn, miss, etc.)
   * @param {Function} [opts.canContinue] - returns false to stop (no more resources, inventory full)
   * @param {number} [opts.successRate]   - 0-1 chance of success (if onAttempt not provided)
   */
  constructor(opts) {
    this.interval = opts.interval;
    this.onAttempt = opts.onAttempt || null;
    this.onSuccess = opts.onSuccess || null;
    this.onFail = opts.onFail || null;
    this.canContinue = opts.canContinue || (() => true);
    this.successRate = opts.successRate || 1;
    this.tickCount = 0;
    this.active = false;
    this.totalAttempts = 0;
    this.totalSuccesses = 0;
  }

  start() {
    this.active = true;
    this.tickCount = 0;
  }

  stop() {
    this.active = false;
    this.tickCount = 0;
  }

  tick() {
    if (!this.active) return null;
    if (!this.canContinue()) {
      this.active = false;
      return { stopped: true, reason: 'cannot_continue' };
    }

    this.tickCount++;
    if (this.tickCount < this.interval) return null;
    this.tickCount = 0;
    this.totalAttempts++;

    // Attempt the action
    let result;
    if (this.onAttempt) {
      result = this.onAttempt(this.totalAttempts);
    } else {
      // Simple success/fail roll
      const success = Math.random() < this.successRate;
      result = { success };
    }

    if (result.success !== false) {
      this.totalSuccesses++;
      if (this.onSuccess) this.onSuccess(result);
    } else {
      if (this.onFail) this.onFail(result);
    }

    return result;
  }

  get isActive() { return this.active; }
  get rate() { return this.totalAttempts > 0 ? this.totalSuccesses / this.totalAttempts : 0; }
}

module.exports = PeriodicAction;
