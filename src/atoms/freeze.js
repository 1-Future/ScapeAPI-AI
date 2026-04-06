// ══════════════════════════════════════════════════════════════════════════════
// ATOM: Freeze/Snare
// Immobilize target for N ticks. Cannot move but can still attack/eat/pray.
// Half duration if already frozen. Immune for N ticks after freeze ends.
// ══════════════════════════════════════════════════════════════════════════════

class Freeze {
  constructor() {
    this.frozenTicks = 0;
    this.immuneTicks = 0;
  }

  /**
   * Apply a freeze.
   * @param {number} ticks - freeze duration
   * @returns {{ applied: boolean, duration: number }}
   */
  apply(ticks) {
    if (this.immuneTicks > 0) return { applied: false, duration: 0, reason: 'immune' };
    if (this.frozenTicks > 0) {
      // Already frozen — half duration
      const half = Math.floor(ticks / 2);
      this.frozenTicks = Math.max(this.frozenTicks, half);
      return { applied: true, duration: half, halved: true };
    }
    this.frozenTicks = ticks;
    return { applied: true, duration: ticks };
  }

  tick() {
    if (this.frozenTicks > 0) {
      this.frozenTicks--;
      if (this.frozenTicks <= 0) {
        // Grant immunity equal to freeze duration / 2
        this.immuneTicks = 3; // Standard 3-tick immunity
      }
    }
    if (this.immuneTicks > 0) {
      this.immuneTicks--;
    }
  }

  /** Can this entity move? */
  get canMove() { return this.frozenTicks <= 0; }
  get isFrozen() { return this.frozenTicks > 0; }
  get isImmune() { return this.immuneTicks > 0; }
  get ticksLeft() { return this.frozenTicks; }
}

// ── FREEZE DURATIONS (in ticks) ─────────────────────────────────────────────
Freeze.DURATIONS = {
  ice_rush: 8,       // 5 seconds
  ice_burst: 17,     // 10 seconds
  ice_blitz: 25,     // 15 seconds
  ice_barrage: 33,   // 20 seconds
  entangle: 25,      // 15 seconds
  snare: 17,         // 10 seconds
  bind: 8,           // 5 seconds
  zamorak_godsword: 33, // 20 seconds
};

module.exports = Freeze;
