// ══════════════════════════════════════════════════════════════════════════════
// ATOM: XP Drop
// Award experience in a skill. Check for level ups. Multiple skills per tick.
// ══════════════════════════════════════════════════════════════════════════════

// OSRS XP table — level N requires this much total XP
const XP_TABLE = [0];
for (let i = 1; i < 127; i++) {
  let xp = 0;
  for (let j = 1; j <= i; j++) {
    xp += Math.floor(j + 300 * Math.pow(2, j / 7));
  }
  XP_TABLE.push(Math.floor(xp / 4));
}

class XpDrop {
  /**
   * Award XP to a skill.
   * @param {Object} player    - player object with skills: { attack: { level, xp }, ... }
   * @param {string} skill     - skill name
   * @param {number} amount    - XP to award
   * @returns {{ skill, amount, newXp, leveled, newLevel, oldLevel }}
   */
  static award(player, skill, amount) {
    if (!player.skills) player.skills = {};
    if (!player.skills[skill]) player.skills[skill] = { level: 1, xp: 0 };

    const s = player.skills[skill];
    const oldLevel = s.level;
    s.xp += amount;

    // Check level up
    const newLevel = XpDrop.levelForXp(s.xp);
    const leveled = newLevel > oldLevel;
    if (leveled) s.level = newLevel;

    return { skill, amount, newXp: s.xp, leveled, newLevel, oldLevel };
  }

  /**
   * Award XP to multiple skills at once (e.g. combat hit = attack + hitpoints).
   * @param {Object} player
   * @param {Object} drops - { attack: 12, hitpoints: 4 }
   * @returns {Object[]} array of results
   */
  static awardMultiple(player, drops) {
    return Object.entries(drops).map(([skill, amount]) => XpDrop.award(player, skill, amount));
  }

  /** Get level for a given XP amount. */
  static levelForXp(xp) {
    for (let i = XP_TABLE.length - 1; i >= 1; i--) {
      if (xp >= XP_TABLE[i]) return i;
    }
    return 1;
  }

  /** Get XP required for a level. */
  static xpForLevel(level) {
    return XP_TABLE[Math.min(level, XP_TABLE.length - 1)] || 0;
  }

  /** Get XP remaining until next level. */
  static xpToNextLevel(currentXp, currentLevel) {
    const nextLevelXp = XpDrop.xpForLevel(currentLevel + 1);
    return Math.max(0, nextLevelXp - currentXp);
  }

  /** Get the XP table. */
  static get table() { return XP_TABLE; }
}

module.exports = XpDrop;
