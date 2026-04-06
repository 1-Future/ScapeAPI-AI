// ══════════════════════════════════════════════════════════════════════════════
// ATOM: Timer
// Count down N ticks then trigger a callback.
// Optionally repeats forever (interval mode).
//
// Examples:
//   - GOTR round: 200 tick timer, fires "creatures attack" on expire
//   - Zuk set timer: 350 ticks, spawns mobs on expire
//   - Gravestone: 15 min timer, items lost on expire
//   - Shop restock: periodic timer, adds stock every N ticks
// ══════════════════════════════════════════════════════════════════════════════

class Timer {
  /**
   * @param {Object} opts
   * @param {number} opts.duration     - ticks until trigger
   * @param {Function} opts.onExpire   - called when timer hits 0
   * @param {Function} [opts.onTick]   - called every tick with remaining ticks
   * @param {boolean} [opts.repeat]    - restart after expiring (interval mode)
   * @param {boolean} [opts.autoStart] - start immediately (default true)
   */
  constructor(opts) {
    this.duration = opts.duration;
    this.remaining = opts.duration;
    this.onExpire = opts.onExpire;
    this.onTick = opts.onTick || null;
    this.repeat = opts.repeat || false;
    this.active = opts.autoStart !== false;
    this.expired = false;
    this.totalElapsed = 0;
  }

  start() {
    this.active = true;
    this.expired = false;
    this.remaining = this.duration;
    this.totalElapsed = 0;
  }

  stop() {
    this.active = false;
  }

  pause() {
    this.active = false;
  }

  resume() {
    this.active = true;
  }

  reset(newDuration) {
    if (newDuration !== undefined) this.duration = newDuration;
    this.remaining = this.duration;
    this.expired = false;
    this.totalElapsed = 0;
  }

  tick() {
    if (!this.active || this.expired) return;

    this.remaining--;
    this.totalElapsed++;

    if (this.onTick) this.onTick(this.remaining, this.totalElapsed);

    if (this.remaining <= 0) {
      this.expired = true;
      if (this.onExpire) this.onExpire(this.totalElapsed);
      if (this.repeat) {
        this.remaining = this.duration;
        this.expired = false;
      } else {
        this.active = false;
      }
    }
  }

  get percent() {
    return 1 - (this.remaining / this.duration);
  }

  get isActive() { return this.active; }
  get isExpired() { return this.expired; }
}

module.exports = Timer;
