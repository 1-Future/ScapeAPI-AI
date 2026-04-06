// ══════════════════════════════════════════════════════════════════════════════
// ATOM: Dramatic Countdown
// Per-tick visible countdown before a moment. Creates tension.
// Extends Timer with announcement callbacks at configurable thresholds.
//
// Examples:
//   - GOTR: "10 seconds..." "5 seconds..." "3... 2... 1..." "The rift becomes active!"
//   - Pest Control: "The portal shield will drop in 30 seconds"
//   - Castle Wars: game start countdown
// ══════════════════════════════════════════════════════════════════════════════

const Timer = require('./timer');

class Countdown extends Timer {
  /**
   * @param {Object} opts
   * @param {number} opts.duration        - total ticks
   * @param {Function} opts.onExpire      - called at 0
   * @param {Function} opts.onAnnounce    - called at each announcement threshold: (remaining, message)
   * @param {Object[]} [opts.thresholds]  - [{at: 10, msg: '10 seconds'}, {at: 3, msg: '3...'}]
   *                                        If not provided, defaults to 10, 5, 3, 2, 1
   * @param {number} [opts.ticksPerSecond] - for converting ticks to display seconds (default ~1.67)
   */
  constructor(opts) {
    super(opts);
    this.onAnnounce = opts.onAnnounce || null;
    this.announced = new Set();

    // Default OSRS-style thresholds (in ticks)
    // At 600ms per tick: 10s = ~17 ticks, 5s = ~8, 3/2/1 = 5/3/2
    const tps = opts.ticksPerSecond || 1.667;
    this.thresholds = opts.thresholds || [
      { at: Math.round(10 * tps), msg: 'The event will begin in 10 seconds.' },
      { at: Math.round(5 * tps),  msg: 'The event will begin in 5 seconds.' },
      { at: 5, msg: '3...' },
      { at: 3, msg: '2...' },
      { at: 2, msg: '1...' },
    ];
  }

  start() {
    super.start();
    this.announced.clear();
  }

  reset(newDuration) {
    super.reset(newDuration);
    this.announced.clear();
  }

  tick() {
    if (!this.active || this.expired) return;

    this.remaining--;
    this.totalElapsed++;

    // Check announcement thresholds
    if (this.onAnnounce) {
      for (const t of this.thresholds) {
        if (this.remaining === t.at && !this.announced.has(t.at)) {
          this.announced.add(t.at);
          this.onAnnounce(this.remaining, t.msg);
        }
      }
    }

    if (this.onTick) this.onTick(this.remaining, this.totalElapsed);

    if (this.remaining <= 0) {
      this.expired = true;
      if (this.onExpire) this.onExpire(this.totalElapsed);
      if (this.repeat) {
        this.remaining = this.duration;
        this.expired = false;
        this.announced.clear();
      } else {
        this.active = false;
      }
    }
  }
}

module.exports = Countdown;
