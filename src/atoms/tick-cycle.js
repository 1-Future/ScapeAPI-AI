// ══════════════════════════════════════════════════════════════════════════════
// ATOM: Tick Cycle
// Something happens every N ticks automatically. The heartbeat pattern.
// Supports counter-based accumulation (like prayer drain).
//
// Examples:
//   - Prayer drain: accumulate drain rate, fire when counter > resistance
//   - HP regen: +1 HP every 100 ticks
//   - Run energy restore: regen based on agility level
//   - Boost decay: stats decrease toward base every 100 ticks
//   - Poison damage: hit every 30 ticks, decreasing
// ══════════════════════════════════════════════════════════════════════════════

class TickCycle {
  /**
   * @param {Object} opts
   * @param {number} [opts.interval]     - fire every N ticks (simple mode)
   * @param {number} [opts.rate]         - amount to accumulate per tick (counter mode)
   * @param {number} [opts.threshold]    - fire when counter reaches this (counter mode)
   * @param {Function} opts.onFire       - called when cycle fires
   * @param {boolean} [opts.autoStart]   - start immediately (default true)
   */
  constructor(opts) {
    this.interval = opts.interval || 0;
    this.rate = opts.rate || 0;
    this.threshold = opts.threshold || 0;
    this.onFire = opts.onFire;
    this.active = opts.autoStart !== false;

    // Simple interval mode
    this.tickCount = 0;

    // Counter accumulation mode (like prayer drain)
    this.counter = 0;

    // Which mode
    this.mode = this.interval > 0 ? 'interval' : 'counter';
  }

  tick() {
    if (!this.active) return;

    if (this.mode === 'interval') {
      this.tickCount++;
      if (this.tickCount >= this.interval) {
        this.tickCount = 0;
        if (this.onFire) this.onFire();
      }
    } else {
      // Counter mode: accumulate rate, fire when threshold reached
      this.counter += this.rate;
      while (this.counter >= this.threshold) {
        this.counter -= this.threshold;
        if (this.onFire) this.onFire();
      }
    }
  }

  /** Update the rate (e.g. prayer drain changes when prayers toggle). */
  setRate(newRate) {
    this.rate = newRate;
  }

  /** Update threshold (e.g. equipment prayer bonus changes). */
  setThreshold(newThreshold) {
    this.threshold = newThreshold;
  }

  start() { this.active = true; }
  stop() { this.active = false; this.counter = 0; this.tickCount = 0; }
  pause() { this.active = false; }
  resume() { this.active = true; }
  reset() { this.counter = 0; this.tickCount = 0; }
}

module.exports = TickCycle;
