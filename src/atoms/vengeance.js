// ══════════════════════════════════════════════════════════════════════════════
// ATOM: Vengeance / Recoil / Reflect
// Damage reflection mechanics. Vengeance, ring of recoil, phoenix necklace.
// ══════════════════════════════════════════════════════════════════════════════

class Reflect {
  constructor() {
    this.vengeanceActive = false;
    this.vengeanceCooldown = 0;    // 30 second cooldown (50 ticks)
    this.recoilCharges = 0;        // Ring of recoil: 40 charges
    this.phoenixActive = false;    // Phoenix necklace: heals at low HP
  }

  /** Cast vengeance. 30-second cooldown. Reflects 75% of next hit. */
  castVengeance() {
    if (this.vengeanceCooldown > 0) return { success: false, reason: 'cooldown', ticksLeft: this.vengeanceCooldown };
    this.vengeanceActive = true;
    this.vengeanceCooldown = 50; // 30 seconds
    return { success: true };
  }

  /** Equip ring of recoil. 40 charges, reflects 10% +1. */
  equipRecoil() {
    this.recoilCharges = 40;
  }

  /** Equip phoenix necklace. */
  equipPhoenix() {
    this.phoenixActive = true;
  }

  /**
   * Called when this entity takes damage. Returns reflect damage.
   * @param {number} damageTaken
   * @param {number} currentHp
   * @param {number} maxHp
   * @returns {{ vengDamage, recoilDamage, phoenixHeal, recoilBroke }}
   */
  onDamageTaken(damageTaken, currentHp, maxHp) {
    const result = { vengDamage: 0, recoilDamage: 0, phoenixHeal: 0, recoilBroke: false };

    // Vengeance: reflect 75% of damage, one-time
    if (this.vengeanceActive && damageTaken > 0) {
      result.vengDamage = Math.floor(damageTaken * 0.75);
      this.vengeanceActive = false;
    }

    // Ring of recoil: reflect 10% +1, uses charges
    if (this.recoilCharges > 0 && damageTaken > 0) {
      result.recoilDamage = Math.floor(damageTaken * 0.10) + 1;
      this.recoilCharges--;
      if (this.recoilCharges <= 0) {
        result.recoilBroke = true;
      }
    }

    // Phoenix necklace: if HP drops below 20%, heal 30% of max HP, consume necklace
    if (this.phoenixActive && currentHp > 0) {
      const threshold = Math.floor(maxHp * 0.20);
      if (currentHp - damageTaken <= threshold) {
        result.phoenixHeal = Math.floor(maxHp * 0.30);
        this.phoenixActive = false;
      }
    }

    return result;
  }

  tick() {
    if (this.vengeanceCooldown > 0) this.vengeanceCooldown--;
  }

  get hasVengeance() { return this.vengeanceActive; }
  get vengCooldownLeft() { return this.vengeanceCooldown; }
}

module.exports = Reflect;
