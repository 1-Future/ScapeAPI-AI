// ══════════════════════════════════════════════════════════════════════════════
// ATOM: Cooldown
// Block an action for N ticks after use. The universal rate limiter.
//
// Examples:
//   - Attack speed: can't attack for N ticks after attacking
//   - Eat delay: 3 ticks after eating food
//   - Potion cooldown: 3 ticks after drinking
//   - Special attack: energy recharges over time
// ══════════════════════════════════════════════════════════════════════════════

class Cooldown {
  /**
   * @param {number} duration - ticks of cooldown
   */
  constructor(duration) {
    this.duration = duration;
    this.remaining = 0;
  }

  /** Trigger the cooldown. Returns false if already on cooldown. */
  trigger() {
    if (this.remaining > 0) return false;
    this.remaining = this.duration;
    return true;
  }

  /** Try to perform an action. Returns true if allowed (not on cooldown). */
  tryUse() {
    if (this.remaining > 0) return false;
    this.remaining = this.duration;
    return true;
  }

  /** Call every tick to decrement. */
  tick() {
    if (this.remaining > 0) this.remaining--;
  }

  /** Force reset the cooldown (e.g. special attack restore). */
  reset() {
    this.remaining = 0;
  }

  /** Change the cooldown duration (e.g. weapon speed change). */
  setDuration(d) {
    this.duration = d;
  }

  get isReady() { return this.remaining <= 0; }
  get isOnCooldown() { return this.remaining > 0; }
  get ticksLeft() { return this.remaining; }
  get percent() { return this.duration > 0 ? this.remaining / this.duration : 0; }
}

module.exports = Cooldown;
