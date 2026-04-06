// ══════════════════════════════════════════════════════════════════════════════
// ATOM: Consume
// Use an item to modify player state. HP, prayer, stats, buffs.
// Handles the effect, not the cooldown (Cooldown atom handles that).
// ══════════════════════════════════════════════════════════════════════════════

class Consume {
  /**
   * Apply a consumable effect to a player.
   * @param {Object} player - { hp, maxHp, prayerPoints, stats, boosts }
   * @param {Object} effect - defines what this consumable does
   * @param {number} [effect.healHp]        - heal this much HP
   * @param {number} [effect.healPercent]    - heal % of max HP
   * @param {number} [effect.restorePrayer]  - restore this much PP
   * @param {number} [effect.restorePrayerPercent] - restore % of max PP
   * @param {Object} [effect.boosts]         - { attack: 5, strength: 5 } stat boosts
   * @param {Object} [effect.drains]         - { attack: 2, ranged: 2 } stat drains
   * @param {number} [effect.boostDuration]  - ticks boost lasts
   * @param {number} [effect.curePoison]     - true to cure poison
   * @param {number} [effect.runEnergy]      - restore run energy
   * @returns {{ effects: string[] }} - list of effects applied
   */
  static apply(player, effect) {
    const effects = [];

    if (effect.healHp) {
      const heal = Math.min(effect.healHp, (player.maxHp || 99) - player.hp);
      player.hp = Math.min(player.maxHp || 99, player.hp + effect.healHp);
      if (heal > 0) effects.push(`HP +${heal}`);
    }

    if (effect.healPercent) {
      const heal = Math.floor((player.maxHp || 99) * effect.healPercent);
      player.hp = Math.min(player.maxHp || 99, player.hp + heal);
      if (heal > 0) effects.push(`HP +${heal}`);
    }

    if (effect.restorePrayer) {
      const restore = Math.min(effect.restorePrayer, 99 - player.prayerPoints);
      player.prayerPoints = Math.min(99, player.prayerPoints + effect.restorePrayer);
      if (restore > 0) effects.push(`Prayer +${restore}`);
    }

    if (effect.restorePrayerPercent) {
      const base = Math.floor(99 * effect.restorePrayerPercent);
      player.prayerPoints = Math.min(99, player.prayerPoints + base);
      effects.push(`Prayer +${base}`);
    }

    if (effect.boosts) {
      if (!player.boosts) player.boosts = {};
      for (const [stat, amount] of Object.entries(effect.boosts)) {
        player.boosts[stat] = {
          amount,
          ticksLeft: effect.boostDuration || 90,
        };
        effects.push(`${stat} +${amount}`);
      }
    }

    if (effect.drains) {
      if (!player.boosts) player.boosts = {};
      for (const [stat, amount] of Object.entries(effect.drains)) {
        const current = player.boosts[stat]?.amount || 0;
        player.boosts[stat] = {
          amount: current - amount,
          ticksLeft: effect.boostDuration || 90,
        };
        effects.push(`${stat} -${amount}`);
      }
    }

    if (effect.curePoison) {
      player.poison = null;
      effects.push('Cured poison');
    }

    if (effect.runEnergy) {
      player.runEnergy = Math.min(10000, (player.runEnergy || 0) + effect.runEnergy);
      effects.push(`Run +${effect.runEnergy}`);
    }

    return { effects };
  }
}

// ── Common consumable definitions ────────────────────────────────────────────
Consume.EFFECTS = {
  lobster:        { healHp: 12 },
  swordfish:      { healHp: 14 },
  monkfish:       { healHp: 16 },
  shark:          { healHp: 20 },
  manta_ray:      { healHp: 22 },
  dark_crab:      { healHp: 22 },
  anglerfish:     { healPercent: 0.13, healHp: 2 }, // 13% + 2, can overheal
  sara_brew:      { healHp: 16, boosts: { defence: 2 }, drains: { attack: 2, strength: 2, magic: 2, ranged: 2 } },
  super_restore:  { restorePrayer: 32 }, // 8 + floor(level * 0.25) at 99
  prayer_potion:  { restorePrayer: 31 }, // 7 + floor(level * 0.25) at 99
  super_attack:   { boosts: { attack: 19 } },  // 5 + floor(level * 0.15)
  super_strength: { boosts: { strength: 19 } },
  super_defence:  { boosts: { defence: 19 } },
  ranging_potion: { boosts: { ranged: 13 } },  // 4 + floor(level * 0.10)
  stamina:        { runEnergy: 2000 }, // + 70% reduced drain
  antipoison:     { curePoison: true },
};

module.exports = Consume;
