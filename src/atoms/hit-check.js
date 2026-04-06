// ══════════════════════════════════════════════════════════════════════════════
// ATOM: Hit Check
// Roll accuracy, determine hit/miss, calculate damage. The core combat roll.
// OSRS-accurate formulas.
//
// Examples:
//   - Melee attack: accuracy vs defence roll, then damage 0-maxHit
//   - Ranged attack: same formula, different bonuses
//   - Magic attack: magic accuracy vs magic defence
//   - Thieving: success roll (same pattern, different stats)
//   - Cooking: burn chance (inverse hit check)
// ══════════════════════════════════════════════════════════════════════════════

class HitCheck {
  /**
   * Perform a standard OSRS accuracy + damage roll.
   *
   * @param {Object} attacker - { level, bonus, prayerMult, styleMod }
   * @param {Object} defender - { level, bonus, prayerMult }
   * @param {number} maxHit   - maximum damage
   * @returns {{ hit: boolean, damage: number, accuracy: number }}
   */
  static roll(attacker, defender, maxHit) {
    const atkEffective = Math.floor((attacker.level + (attacker.styleMod || 0)) * (attacker.prayerMult || 1)) + 8;
    const atkRoll = atkEffective * ((attacker.bonus || 0) + 64);

    const defEffective = Math.floor((defender.level) * (defender.prayerMult || 1)) + 8;
    const defRoll = defEffective * ((defender.bonus || 0) + 64);

    const accuracy = HitCheck.accuracy(atkRoll, defRoll);
    const hit = Math.random() < accuracy;
    const damage = hit ? Math.floor(Math.random() * (maxHit + 1)) : 0;

    return { hit, damage, accuracy, atkRoll, defRoll };
  }

  /**
   * OSRS accuracy formula.
   * @param {number} atkRoll - attacker's max roll
   * @param {number} defRoll - defender's max roll
   * @returns {number} 0-1 hit chance
   */
  static accuracy(atkRoll, defRoll) {
    if (atkRoll > defRoll) {
      return 1 - (defRoll + 2) / (2 * (atkRoll + 1));
    } else {
      return atkRoll / (2 * (defRoll + 1));
    }
  }

  /**
   * Calculate OSRS max hit for melee.
   * @param {number} strengthLevel - effective strength level
   * @param {number} strengthBonus - equipment strength bonus
   * @param {number} prayerMult    - prayer multiplier (1.0 = none, 1.23 = piety)
   * @param {number} styleMod      - attack style modifier (0-3)
   * @returns {number} max hit
   */
  static maxHitMelee(strengthLevel, strengthBonus, prayerMult = 1, styleMod = 0) {
    const effective = Math.floor((strengthLevel + styleMod) * prayerMult) + 8;
    return Math.floor(0.5 + effective * (strengthBonus + 64) / 640);
  }

  /**
   * Calculate OSRS max hit for ranged.
   * @param {number} rangedLevel     - effective ranged level
   * @param {number} rangedStrength  - equipment ranged strength
   * @param {number} prayerMult      - prayer multiplier
   * @returns {number} max hit
   */
  static maxHitRanged(rangedLevel, rangedStrength, prayerMult = 1) {
    const effective = Math.floor(rangedLevel * prayerMult) + 8;
    return Math.floor(0.5 + effective * (rangedStrength + 64) / 640);
  }

  /**
   * Simple success/fail roll (used for skilling, thieving, etc.)
   * @param {number} chance - 0-1 success chance
   * @returns {{ success: boolean }}
   */
  static simpleRoll(chance) {
    return { success: Math.random() < chance };
  }
}

module.exports = HitCheck;
