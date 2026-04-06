// ══════════════════════════════════════════════════════════════════════════════
// ATOM: Combat Level Calculation
// OSRS-accurate combat level formula.
// ══════════════════════════════════════════════════════════════════════════════

class CombatLevel {
  /**
   * Calculate combat level from skill levels.
   * @param {Object} skills - { attack, strength, defence, hitpoints, prayer, ranged, magic }
   * @returns {number} combat level
   */
  static calculate(skills) {
    const attack = skills.attack || 1;
    const strength = skills.strength || 1;
    const defence = skills.defence || 1;
    const hitpoints = skills.hitpoints || 10;
    const prayer = skills.prayer || 1;
    const ranged = skills.ranged || 1;
    const magic = skills.magic || 1;

    const base = 0.25 * (defence + hitpoints + Math.floor(prayer / 2));
    const melee = 0.325 * (attack + strength);
    const range = 0.325 * Math.floor(ranged * 1.5);
    const mage = 0.325 * Math.floor(magic * 1.5);

    return Math.floor(base + Math.max(melee, range, mage));
  }

  /**
   * Determine combat class based on highest combat style.
   * @param {Object} skills
   * @returns {string} 'melee', 'ranged', or 'magic'
   */
  static combatClass(skills) {
    const melee = (skills.attack || 1) + (skills.strength || 1);
    const range = Math.floor((skills.ranged || 1) * 1.5);
    const mage = Math.floor((skills.magic || 1) * 1.5);

    if (melee >= range && melee >= mage) return 'melee';
    if (range >= mage) return 'ranged';
    return 'magic';
  }

  /**
   * Get wilderness combat level range for PvP.
   * @param {number} combatLevel
   * @param {number} wildernessLevel - deeper = wider range
   * @returns {{ min: number, max: number }}
   */
  static wildernessRange(combatLevel, wildernessLevel) {
    return {
      min: Math.max(3, combatLevel - wildernessLevel),
      max: combatLevel + wildernessLevel,
    };
  }
}

module.exports = CombatLevel;
