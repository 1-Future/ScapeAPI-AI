// ══════════════════════════════════════════════════════════════════════════════
// ATOM: Attack Style
// Controls XP distribution, invisible level boosts, and weapon speed modifiers.
// Accurate/Aggressive/Defensive/Controlled + Rapid/Longrange for ranged.
// ══════════════════════════════════════════════════════════════════════════════

class AttackStyle {
  /**
   * Get the XP distribution for an attack style.
   * @param {string} style - 'accurate', 'aggressive', 'defensive', 'controlled',
   *                         'rapid', 'longrange', 'autocast', 'defensive_autocast'
   * @param {number} damage - damage dealt
   * @param {string} weaponType - 'melee', 'ranged', 'magic'
   * @returns {Object} - { skill: xpAmount, ... }
   */
  static getXpDistribution(style, damage, weaponType = 'melee') {
    const base = damage * 4;
    const hpXp = Math.floor(damage * 1.33);

    if (weaponType === 'ranged') {
      switch (style) {
        case 'accurate':  return { ranged: base, hitpoints: hpXp };
        case 'rapid':     return { ranged: base, hitpoints: hpXp };
        case 'longrange': return { ranged: Math.floor(base / 2), defence: Math.floor(base / 2), hitpoints: hpXp };
        default:          return { ranged: base, hitpoints: hpXp };
      }
    }

    if (weaponType === 'magic') {
      switch (style) {
        case 'autocast':           return { magic: base, hitpoints: hpXp };
        case 'defensive_autocast': return { magic: Math.floor(base * 0.67), defence: Math.floor(base * 0.33), hitpoints: hpXp };
        default:                   return { magic: base, hitpoints: hpXp };
      }
    }

    // Melee
    switch (style) {
      case 'accurate':   return { attack: base, hitpoints: hpXp };
      case 'aggressive': return { strength: base, hitpoints: hpXp };
      case 'defensive':  return { defence: base, hitpoints: hpXp };
      case 'controlled': return {
        attack: Math.floor(base / 3),
        strength: Math.floor(base / 3),
        defence: Math.floor(base / 3),
        hitpoints: hpXp
      };
      default: return { attack: base, hitpoints: hpXp };
    }
  }

  /**
   * Get the invisible level boost for an attack style.
   * @param {string} style
   * @returns {Object} - { attack: N, strength: N, defence: N, ranged: N, magic: N }
   */
  static getBoost(style) {
    switch (style) {
      case 'accurate':   return { attack: 3 };
      case 'aggressive': return { strength: 3 };
      case 'defensive':  return { defence: 3 };
      case 'controlled': return { attack: 1, strength: 1, defence: 1 };
      case 'rapid':      return {};  // no boost, but -1 tick speed
      case 'longrange':  return { defence: 3 }; // +2 range
      default: return {};
    }
  }

  /**
   * Get weapon speed modifier for style.
   * @param {string} style
   * @returns {number} - ticks to add/subtract from base speed
   */
  static getSpeedMod(style) {
    if (style === 'rapid') return -1; // 1 tick faster
    return 0;
  }

  /**
   * Get attack range modifier.
   * @param {string} style
   * @returns {number} - tiles to add to base range
   */
  static getRangeMod(style) {
    if (style === 'longrange') return 2;
    return 0;
  }
}

module.exports = AttackStyle;
