// ══════════════════════════════════════════════════════════════════════════════
// ATOM: Loot Drop
// Generate items from a weighted drop table. Universal for any reward source.
// ══════════════════════════════════════════════════════════════════════════════

class LootDrop {
  /**
   * Roll a drop table.
   * @param {Object[]} table - [{ id, name, weight, min, max, always }]
   * @param {number} [rolls] - number of rolls (default 1)
   * @returns {Object[]} - [{ id, name, quantity }]
   */
  static roll(table, rolls = 1) {
    const drops = [];

    // Always drops (bones, ashes, etc.)
    for (const entry of table) {
      if (entry.always) {
        const qty = entry.min === entry.max ? entry.min : LootDrop.randInt(entry.min || 1, entry.max || 1);
        drops.push({ id: entry.id, name: entry.name, quantity: qty });
      }
    }

    // Weighted rolls
    const weighted = table.filter(e => !e.always);
    const totalWeight = weighted.reduce((sum, e) => sum + (e.weight || 1), 0);

    for (let r = 0; r < rolls; r++) {
      let roll = Math.random() * totalWeight;
      for (const entry of weighted) {
        roll -= (entry.weight || 1);
        if (roll <= 0) {
          const qty = entry.min === entry.max ? entry.min : LootDrop.randInt(entry.min || 1, entry.max || 1);
          drops.push({ id: entry.id, name: entry.name, quantity: qty });
          break;
        }
      }
    }

    return drops;
  }

  /**
   * Roll with a rare drop table chance.
   * @param {Object[]} mainTable   - normal drops
   * @param {Object[]} rareTable   - rare drops
   * @param {number} rareChance    - 1/N chance of hitting rare table
   * @returns {{ drops: Object[], isRare: boolean }}
   */
  static rollWithRare(mainTable, rareTable, rareChance) {
    const isRare = Math.random() < (1 / rareChance);
    const drops = isRare ? LootDrop.roll(rareTable) : LootDrop.roll(mainTable);
    return { drops, isRare };
  }

  static randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

module.exports = LootDrop;
