// ══════════════════════════════════════════════════════════════════════════════
// ATOM: Special Attack Bar
// Energy pool that regenerates over time. Specs consume energy.
// Supports spec stacking (gmaul combo), spec-tab, and energy manipulation.
// ══════════════════════════════════════════════════════════════════════════════

class SpecBar {
  /**
   * @param {Object} [opts]
   * @param {number} [opts.max]        - max energy (default 100)
   * @param {number} [opts.regenRate]  - energy per 30 seconds (default 10)
   * @param {number} [opts.regenTicks] - ticks between regen (default 50)
   */
  constructor(opts = {}) {
    this.max = opts.max || 100;
    this.energy = this.max;
    this.regenRate = opts.regenRate || 10;
    this.regenTicks = opts.regenTicks || 50;
    this.tickCounter = 0;
    this.doubleRegen = false; // lightbearer effect
  }

  /**
   * Try to use a special attack.
   * @param {number} cost - energy cost (25, 50, 55, 65, 75, 100)
   * @returns {boolean} - true if spec fired
   */
  use(cost) {
    if (this.energy < cost) return false;
    this.energy -= cost;
    return true;
  }

  /** Tick — handles natural regen. */
  tick() {
    this.tickCounter++;
    const interval = this.doubleRegen ? Math.floor(this.regenTicks / 2) : this.regenTicks;
    if (this.tickCounter >= interval) {
      this.tickCounter = 0;
      this.energy = Math.min(this.max, this.energy + this.regenRate);
    }
  }

  /** Restore energy (e.g. spec restore pool in Clan Wars). */
  restore(amount) {
    this.energy = Math.min(this.max, this.energy + amount);
  }

  /** Full restore. */
  fill() {
    this.energy = this.max;
  }

  /** Set double regen (Lightbearer ring effect). */
  setDoubleRegen(enabled) {
    this.doubleRegen = enabled;
  }

  get percent() { return this.energy; }
  get canSpec25() { return this.energy >= 25; }
  get canSpec50() { return this.energy >= 50; }
  get canSpec100() { return this.energy >= 100; }
}

module.exports = SpecBar;
