// ══════════════════════════════════════════════════════════════════════════════
// ATOM: Flinch
// First hit on an idle NPC has no delay. NPC attack timer starts after hit.
// Used in hit-and-run tactics.
//
// The flinch delay = floor(attackSpeed / 2)
// An NPC that hasn't been attacked has attackDelay = Infinity.
// After being hit, attackDelay resets to flinchDelay, then normal speed.
// ══════════════════════════════════════════════════════════════════════════════

class Flinch {
  /**
   * @param {number} attackSpeed - NPC's normal attack speed in ticks
   */
  constructor(attackSpeed) {
    this.attackSpeed = attackSpeed;
    this.flinchDelay = Math.floor(attackSpeed / 2);
    this.attackDelay = Infinity; // idle — hasn't been engaged
    this.inCombat = false;
  }

  /** Call when the NPC gets hit for the first time (or after reset). */
  engage() {
    if (!this.inCombat) {
      this.inCombat = true;
      this.attackDelay = this.flinchDelay;
    }
  }

  /** Call every tick. Returns true on ticks when the NPC should attack. */
  tick() {
    if (!this.inCombat || this.attackDelay === Infinity) return false;

    this.attackDelay--;
    if (this.attackDelay <= 0) {
      this.attackDelay = this.attackSpeed;
      return true; // NPC attacks this tick
    }
    return false;
  }

  /** Reset to idle state (target walked away, NPC de-aggro'd). */
  reset() {
    this.inCombat = false;
    this.attackDelay = Infinity;
  }

  get isEngaged() { return this.inCombat; }
  get canAttack() { return this.inCombat && this.attackDelay <= 0; }
  get ticksUntilAttack() { return this.attackDelay === Infinity ? -1 : this.attackDelay; }
}

module.exports = Flinch;
