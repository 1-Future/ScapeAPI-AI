// ══════════════════════════════════════════════════════════════════════════════
// ATOM: Dose System
// Consumable with N charges. Each use decrements. Empty leaves container.
// ══════════════════════════════════════════════════════════════════════════════

class DoseSystem {
  /**
   * Use one dose of a multi-dose item.
   * @param {Object} item        - { id, name, count }
   * @param {Object} [opts]
   * @param {string} [opts.emptyItem] - name of empty container (default 'Vial')
   * @param {number} [opts.emptyId]   - id of empty container (default 325)
   * @returns {{ success, newName, doses, isEmpty, emptyItem }}
   */
  static use(item, opts = {}) {
    if (!item || !item.name) return { success: false };

    const doseMatch = item.name.match(/\((\d)\)$/);
    if (!doseMatch) return { success: false }; // not a dosed item

    const dose = parseInt(doseMatch[1]);
    if (dose <= 0) return { success: false };

    if (dose > 1) {
      const newName = item.name.replace(/\(\d\)$/, `(${dose - 1})`);
      return {
        success: true,
        newName,
        doses: dose - 1,
        isEmpty: false,
      };
    } else {
      // Last dose — return empty container
      return {
        success: true,
        newName: opts.emptyItem || 'Vial',
        newId: opts.emptyId || 325,
        doses: 0,
        isEmpty: true,
      };
    }
  }

  /** Check how many doses remain. */
  static getDoses(item) {
    if (!item || !item.name) return 0;
    const match = item.name.match(/\((\d)\)$/);
    return match ? parseInt(match[1]) : 0;
  }

  /** Check if an item is a dosed consumable. */
  static isDosed(item) {
    return item && item.name && /\(\d\)$/.test(item.name);
  }
}

module.exports = DoseSystem;
