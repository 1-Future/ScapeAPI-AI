// ══════════════════════════════════════════════════════════════════════════════
// ATOM: Bolt Enchant Proc
// Enchanted crossbow bolts have a chance to trigger special effects on hit.
// Kandarin headgear increases proc rate.
// ══════════════════════════════════════════════════════════════════════════════

class BoltProc {
  /**
   * Check if an enchanted bolt procs on this hit.
   * @param {string} boltType - which enchanted bolt
   * @param {Object} context - { damage, targetHp, targetMaxHp, attackerHp, attackerMaxHp }
   * @param {boolean} [kandarinBoost] - wearing kandarin headgear (10% higher proc rate)
   * @returns {{ procced: boolean, effect: Object }}
   */
  static check(boltType, context, kandarinBoost = false) {
    const bolt = BoltProc.BOLTS[boltType];
    if (!bolt) return { procced: false };

    const rate = kandarinBoost ? bolt.rate * 1.1 : bolt.rate;
    if (Math.random() >= rate) return { procced: false };

    return { procced: true, effect: bolt.effect(context) };
  }
}

BoltProc.BOLTS = {
  opal: {
    rate: 0.05,
    effect(ctx) { return { type: 'lightning', extraDamage: Math.floor(ctx.damage * 0.1), desc: 'Lucky Lightning — 10% extra damage as lightning' }; }
  },
  jade: {
    rate: 0.06,
    effect(ctx) { return { type: 'knockdown', desc: 'Earth Fury — chance to knock target down (stun 1 tick)' }; }
  },
  pearl: {
    rate: 0.06,
    effect(ctx) { return { type: 'water', extraDamage: Math.floor(ctx.damage * 0.1), desc: 'Sea Curse — extra water damage' }; }
  },
  topaz: {
    rate: 0.04,
    effect(ctx) { return { type: 'magic_drain', drain: 1, desc: 'Down to Earth — lowers target magic by 1' }; }
  },
  sapphire: {
    rate: 0.05,
    effect(ctx) { return { type: 'prayer_drain', drain: Math.floor(ctx.damage * 0.05), restore: Math.floor(ctx.damage * 0.05), desc: 'Clear Mind — drain target prayer, restore own' }; }
  },
  emerald: {
    rate: 0.55, // very high rate but applies poison
    effect(ctx) { return { type: 'poison', poisonDamage: 5, desc: 'Magical Poison — poison target for 5' }; }
  },
  ruby: {
    rate: 0.06,
    effect(ctx) {
      // Removes 20% of target current HP, costs 10% of attacker HP
      const targetDmg = Math.min(100, Math.floor(ctx.targetHp * 0.20));
      const selfDmg = Math.floor(ctx.attackerHp * 0.10);
      return { type: 'blood_forfeit', damage: targetDmg, selfDamage: selfDmg, desc: `Blood Forfeit — ${targetDmg} to target, ${selfDmg} to self` };
    }
  },
  diamond: {
    rate: 0.10,
    effect(ctx) {
      // Ignores ranged defence, +15% damage
      return { type: 'armour_piercing', damageMod: 1.15, ignoreDefence: true, desc: 'Armour Piercing — ignore defence, +15% damage' };
    }
  },
  dragonstone: {
    rate: 0.06,
    effect(ctx) {
      // Extra fire damage (dragonfire)
      const extra = Math.floor(Math.random() * 20) + 5;
      return { type: 'dragon_breath', extraDamage: extra, desc: `Dragon's Breath — ${extra} extra fire damage` };
    }
  },
  onyx: {
    rate: 0.11,
    effect(ctx) {
      // Extra 20% damage, heal 25% of total damage
      const extra = Math.floor(ctx.damage * 0.20);
      const heal = Math.floor((ctx.damage + extra) * 0.25);
      return { type: 'life_leech', extraDamage: extra, healAmount: heal, desc: `Life Leech — +${extra} damage, heal ${heal}` };
    }
  },
};

module.exports = BoltProc;
