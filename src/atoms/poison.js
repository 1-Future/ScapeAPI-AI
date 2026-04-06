// ══════════════════════════════════════════════════════════════════════════════
// ATOM: Poison / Venom
// Damage over time. Poison starts high and decreases. Venom starts low and increases.
// Curable by antipoison/anti-venom. Different immunity durations.
// ══════════════════════════════════════════════════════════════════════════════

class Poison {
  constructor() {
    this.damage = 0;          // current poison damage per hit
    this.tickCounter = 0;
    this.hitInterval = 30;    // ticks between poison hits (18 seconds)
    this.type = null;         // 'poison' or 'venom'
    this.immuneTicks = 0;
  }

  /**
   * Apply poison.
   * @param {number} startDamage - initial damage (e.g. 6 for dragon dagger poison)
   * @returns {{ applied: boolean }}
   */
  applyPoison(startDamage) {
    if (this.immuneTicks > 0) return { applied: false, reason: 'immune' };
    if (this.type === 'venom') return { applied: false, reason: 'venom_overrides' };
    this.damage = startDamage;
    this.type = 'poison';
    this.tickCounter = 0;
    return { applied: true, damage: startDamage };
  }

  /**
   * Apply venom (stronger, increases over time).
   * @returns {{ applied: boolean }}
   */
  applyVenom() {
    if (this.immuneTicks > 0) return { applied: false, reason: 'immune' };
    this.damage = 6;
    this.type = 'venom';
    this.tickCounter = 0;
    return { applied: true, damage: 6 };
  }

  /**
   * Tick. Returns damage dealt this tick (0 if not a damage tick).
   */
  tick() {
    if (this.immuneTicks > 0) { this.immuneTicks--; return 0; }
    if (!this.type || this.damage <= 0) return 0;

    this.tickCounter++;
    if (this.tickCounter < this.hitInterval) return 0;
    this.tickCounter = 0;

    const dmg = this.damage;

    if (this.type === 'poison') {
      // Poison decreases by 1 every 4 hits
      this.damage = Math.max(0, this.damage - 1);
      if (this.damage <= 0) this.type = null;
    } else if (this.type === 'venom') {
      // Venom increases by 2 every hit, caps at 20
      this.damage = Math.min(20, this.damage + 2);
    }

    return dmg;
  }

  /** Cure poison (antipoison). */
  curePoison() {
    if (this.type === 'poison') {
      this.type = null;
      this.damage = 0;
    }
    // Regular antipoison doesn't cure venom
  }

  /** Cure venom (anti-venom). Also cures poison. */
  cureVenom() {
    this.type = null;
    this.damage = 0;
  }

  /** Grant immunity. */
  grantImmunity(ticks) {
    this.immuneTicks = Math.max(this.immuneTicks, ticks);
    this.cureVenom();
  }

  get isPoisoned() { return this.type === 'poison' && this.damage > 0; }
  get isVenomed() { return this.type === 'venom' && this.damage > 0; }
  get isAffected() { return this.isPoisoned || this.isVenomed; }
  get isImmune() { return this.immuneTicks > 0; }
  get currentDamage() { return this.damage; }
}

// Immunity durations
Poison.IMMUNITY = {
  antipoison: 90,          // 54 seconds
  super_antipoison: 200,   // 2 minutes
  antidote_plus: 300,      // 3 minutes
  antidote_plusplus: 600,   // 6 minutes (also cures venom → poison)
  anti_venom: 200,         // 2 minutes (cures venom)
  anti_venom_plus: 500,    // 5 minutes (cures venom + immunity)
  serpentine_helm: 0,      // passive venom immunity while worn
};

module.exports = Poison;
