// ══════════════════════════════════════════════════════════════════════════════
// ATOM: Protection Check
// Check if target has matching protection, reduce/negate damage.
// Protection is checked at RESOLUTION time, not at attack time.
//
// Examples:
//   - Prayer: protect from melee/range/mage negates 100% (PvM) or 40% (PvP)
//   - Shield: Elysian has 70% chance to reduce damage by 25%
//   - Set effect: Justiciar reduces damage proportional to defence
// ══════════════════════════════════════════════════════════════════════════════

class ProtectionCheck {
  /**
   * Check protection and modify damage.
   *
   * @param {Object} opts
   * @param {string} opts.attackStyle        - 'melee', 'ranged', 'magic'
   * @param {number} opts.damage             - incoming damage
   * @param {Set|string[]} opts.activeProtections - active protection effects
   * @param {boolean} [opts.isPvP]           - PvP reduces instead of negates
   * @param {number} [opts.pvpReduction]     - PvP reduction factor (default 0.6 = 40% reduction)
   * @returns {{ damage: number, blocked: boolean, reduced: boolean }}
   */
  static check(opts) {
    const styleMap = {
      melee: 'protect_from_melee',
      ranged: 'protect_from_missiles',
      magic: 'protect_from_magic',
      slash: 'protect_from_melee',
      stab: 'protect_from_melee',
      crush: 'protect_from_melee',
    };

    const needed = styleMap[opts.attackStyle] || null;
    if (!needed) return { damage: opts.damage, blocked: false, reduced: false };

    const protections = opts.activeProtections instanceof Set
      ? opts.activeProtections
      : new Set(opts.activeProtections || []);

    if (!protections.has(needed)) {
      return { damage: opts.damage, blocked: false, reduced: false };
    }

    if (opts.isPvP) {
      const reduction = opts.pvpReduction || 0.6;
      const reduced = Math.floor(opts.damage * reduction);
      return { damage: reduced, blocked: false, reduced: true };
    }

    // PvM: full block
    return { damage: 0, blocked: true, reduced: false };
  }
}

module.exports = ProtectionCheck;
