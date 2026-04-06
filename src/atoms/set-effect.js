// ══════════════════════════════════════════════════════════════════════════════
// ATOM: Set Effect
// Equipment set bonuses. Checks if player has all pieces, applies effect.
// Barrows, void knight, obsidian, crystal, inquisitor, etc.
// ══════════════════════════════════════════════════════════════════════════════

class SetEffect {
  /**
   * Check if a set is active and return the effect.
   * @param {Object} equipment - player equipment slots { head, body, legs, weapon, ... }
   * @param {string} setId - which set to check
   * @returns {{ active: boolean, effect: Object }}
   */
  static check(equipment, setId) {
    const set = SetEffect.SETS[setId];
    if (!set) return { active: false };

    // Check all required pieces
    const hasAll = set.pieces.every(piece => {
      const slot = piece.slot;
      const item = equipment[slot];
      return item && piece.names.some(n => item.name?.toLowerCase().includes(n.toLowerCase()));
    });

    return { active: hasAll, effect: hasAll ? set.effect : null };
  }

  /**
   * Apply set effect to a combat result.
   * @param {string} setId
   * @param {Object} context - { damage, attackerHp, attackerMaxHp, targetPrayer }
   * @returns {Object} - modified result
   */
  static apply(setId, context) {
    const set = SetEffect.SETS[setId];
    if (!set || !set.onHit) return context;
    return set.onHit(context);
  }
}

SetEffect.SETS = {
  dharok: {
    pieces: [
      { slot: 'head', names: ["dharok's helm"] },
      { slot: 'body', names: ["dharok's platebody"] },
      { slot: 'legs', names: ["dharok's platelegs"] },
      { slot: 'weapon', names: ["dharok's greataxe"] },
    ],
    effect: { name: 'Wretched Strength', desc: 'Damage increases as HP decreases' },
    onHit(ctx) {
      // Max hit = base * (1 + (maxHP - currentHP) / 100 * maxHP / 100)
      const hpMissing = ctx.attackerMaxHp - ctx.attackerHp;
      const mult = 1 + (hpMissing * ctx.attackerMaxHp) / 10000;
      ctx.damage = Math.floor(ctx.damage * mult);
      return ctx;
    }
  },

  guthan: {
    pieces: [
      { slot: 'head', names: ["guthan's helm"] },
      { slot: 'body', names: ["guthan's platebody"] },
      { slot: 'legs', names: ["guthan's chainskirt"] },
      { slot: 'weapon', names: ["guthan's warspear"] },
    ],
    effect: { name: 'Infestation', desc: '25% chance to heal damage dealt' },
    onHit(ctx) {
      if (Math.random() < 0.25 && ctx.damage > 0) {
        ctx.healAmount = ctx.damage;
      }
      return ctx;
    }
  },

  verac: {
    pieces: [
      { slot: 'head', names: ["verac's helm"] },
      { slot: 'body', names: ["verac's brassard"] },
      { slot: 'legs', names: ["verac's plateskirt"] },
      { slot: 'weapon', names: ["verac's flail"] },
    ],
    effect: { name: 'Defiler', desc: '25% chance to ignore defence and prayer' },
    onHit(ctx) {
      if (Math.random() < 0.25) {
        ctx.ignoreDefence = true;
        ctx.ignorePrayer = true;
        // Guaranteed hit with at least 1 damage
        if (ctx.damage === 0) ctx.damage = 1;
      }
      return ctx;
    }
  },

  karil: {
    pieces: [
      { slot: 'head', names: ["karil's coif"] },
      { slot: 'body', names: ["karil's leathertop"] },
      { slot: 'legs', names: ["karil's leatherskirt"] },
      { slot: 'weapon', names: ["karil's crossbow"] },
    ],
    effect: { name: 'Tainted Shot', desc: '25% chance to lower target agility by 20%' },
    onHit(ctx) {
      if (Math.random() < 0.25 && ctx.damage > 0) {
        ctx.agilityDrain = 0.20;
      }
      return ctx;
    }
  },

  ahrim: {
    pieces: [
      { slot: 'head', names: ["ahrim's hood"] },
      { slot: 'body', names: ["ahrim's robe top"] },
      { slot: 'legs', names: ["ahrim's robe skirt"] },
      { slot: 'weapon', names: ["ahrim's staff"] },
    ],
    effect: { name: 'Blighted Aura', desc: '25% chance to lower target strength by 5' },
    onHit(ctx) {
      if (Math.random() < 0.25 && ctx.damage > 0) {
        ctx.strengthDrain = 5;
      }
      return ctx;
    }
  },

  void_melee: {
    pieces: [
      { slot: 'head', names: ['void melee helm'] },
      { slot: 'body', names: ['void knight top', 'elite void top'] },
      { slot: 'legs', names: ['void knight robe', 'elite void robe'] },
      { slot: 'gloves', names: ['void knight gloves'] },
    ],
    effect: { name: 'Void Melee', desc: '+10% accuracy and damage' },
    onHit(ctx) {
      ctx.accuracyMod = (ctx.accuracyMod || 1) * 1.10;
      ctx.damageMod = (ctx.damageMod || 1) * 1.10;
      return ctx;
    }
  },

  void_range: {
    pieces: [
      { slot: 'head', names: ['void ranger helm'] },
      { slot: 'body', names: ['void knight top', 'elite void top'] },
      { slot: 'legs', names: ['void knight robe', 'elite void robe'] },
      { slot: 'gloves', names: ['void knight gloves'] },
    ],
    effect: { name: 'Void Ranged', desc: '+10% accuracy, +12.5% damage (+2.5% elite)' },
    onHit(ctx) {
      ctx.accuracyMod = (ctx.accuracyMod || 1) * 1.10;
      ctx.damageMod = (ctx.damageMod || 1) * 1.125;
      return ctx;
    }
  },

  void_mage: {
    pieces: [
      { slot: 'head', names: ['void mage helm'] },
      { slot: 'body', names: ['void knight top', 'elite void top'] },
      { slot: 'legs', names: ['void knight robe', 'elite void robe'] },
      { slot: 'gloves', names: ['void knight gloves'] },
    ],
    effect: { name: 'Void Mage', desc: '+45% accuracy' },
    onHit(ctx) {
      ctx.accuracyMod = (ctx.accuracyMod || 1) * 1.45;
      return ctx;
    }
  },

  obsidian: {
    pieces: [
      { slot: 'head', names: ['obsidian helm'] },
      { slot: 'body', names: ['obsidian platebody'] },
      { slot: 'legs', names: ['obsidian platelegs'] },
    ],
    effect: { name: 'Obsidian', desc: '+10% accuracy and strength with obsidian weapons' },
    onHit(ctx) {
      if (ctx.weaponIsObsidian) {
        ctx.accuracyMod = (ctx.accuracyMod || 1) * 1.10;
        ctx.damageMod = (ctx.damageMod || 1) * 1.10;
      }
      return ctx;
    }
  },

  inquisitor: {
    pieces: [
      { slot: 'head', names: ["inquisitor's great helm"] },
      { slot: 'body', names: ["inquisitor's hauberk"] },
      { slot: 'legs', names: ["inquisitor's plateskirt"] },
    ],
    effect: { name: 'Inquisitor', desc: '+2.5% accuracy and damage per piece with crush' },
    onHit(ctx) {
      if (ctx.attackStyle === 'crush') {
        ctx.accuracyMod = (ctx.accuracyMod || 1) * 1.025; // per piece, full set = 1.025^3
        ctx.damageMod = (ctx.damageMod || 1) * 1.025;
      }
      return ctx;
    }
  },

  crystal: {
    pieces: [
      { slot: 'head', names: ['crystal helm'] },
      { slot: 'body', names: ['crystal body'] },
      { slot: 'legs', names: ['crystal legs'] },
    ],
    effect: { name: 'Crystal', desc: '+6% accuracy +3% damage per piece with crystal bow/bowfa' },
    onHit(ctx) {
      if (ctx.weaponIsCrystal) {
        ctx.accuracyMod = (ctx.accuracyMod || 1) * 1.06;
        ctx.damageMod = (ctx.damageMod || 1) * 1.03;
      }
      return ctx;
    }
  },
};

module.exports = SetEffect;
