// ══════════════════════════════════════════════════════════════════════════════
// Attack — Melee weapon accuracy. Pairs with Strength (damage) + Defence (DR).
// Implementation lives in src/combat/combat.js (meleeAttack + attackRoll).
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const { XP_TABLE_99, CATEGORIES, ATTENTION } = require('./_shape');

module.exports = {
  id: 'attack',
  name: 'Attack',
  category: CATEGORIES.COMBAT,
  xpTable: XP_TABLE_99,

  actions: [
    { level:  1, name: 'Swing Bronze scimitar',  xpPer: 4,   baseTimeMs: 2400, region: 'Heartlands',   attention: ATTENTION.ACTIVE },
    { level:  5, name: 'Swing Steel longsword',  xpPer: 4,   baseTimeMs: 2400, region: 'Heartlands',   attention: ATTENTION.ACTIVE },
    { level: 10, name: 'Swing Black 2h',         xpPer: 4,   baseTimeMs: 3000, region: 'Sootworks',    attention: ATTENTION.ACTIVE },
    { level: 20, name: 'Swing Mithril scimitar', xpPer: 4,   baseTimeMs: 2400, region: 'Moryskah',     attention: ATTENTION.ACTIVE },
    { level: 30, name: 'Swing Adamant scimitar', xpPer: 4,   baseTimeMs: 2400, region: 'Glass Desert', attention: ATTENTION.ACTIVE },
    { level: 40, name: 'Swing Rune scimitar',    xpPer: 4,   baseTimeMs: 2400, region: 'Saltbrine',    attention: ATTENTION.ACTIVE },
    { level: 60, name: 'Swing Dragon scimitar',  xpPer: 4,   baseTimeMs: 2400, region: 'Veilwood',     attention: ATTENTION.MAX_FOCUS },
    { level: 75, name: 'Wield Abyssal whip',     xpPer: 4,   baseTimeMs: 2400, region: 'Inkweald',     attention: ATTENTION.MAX_FOCUS },
    { level: 85, name: 'Wield Ghrazi rapier',    xpPer: 4,   baseTimeMs: 2400, region: 'Wilds',        attention: ATTENTION.MAX_FOCUS },
  ],

  // Equipment unlock gates (worn weapons — informational).
  equipment: [
    { slot: 'weapon', name: 'Bronze scimitar',  level:  1 },
    { slot: 'weapon', name: 'Steel longsword',  level:  5 },
    { slot: 'weapon', name: 'Mithril scimitar', level: 20 },
    { slot: 'weapon', name: 'Adamant scimitar', level: 30 },
    { slot: 'weapon', name: 'Rune scimitar',    level: 40 },
    { slot: 'weapon', name: 'Dragon scimitar',  level: 60 },
    { slot: 'weapon', name: 'Abyssal whip',     level: 70 },
    { slot: 'weapon', name: 'Ghrazi rapier',    level: 75 },
  ],

  unlocks: {
     1: 'Bronze weapons.',
     5: 'You can now wield Steel weapons.',
    10: 'You can now wield Black weapons.',
    20: 'You can now wield Mithril weapons.',
    30: 'You can now wield Adamant weapons.',
    40: 'You can now wield Rune weapons.',
    60: 'You can now wield Dragon weapons.',
    70: 'You can now wield the Abyssal whip.',
    85: 'You can now wield the Ghrazi rapier.',
  },

  capstone: {
    level: 99,
    name: 'Master of the Blade',
    description: 'Granted at 13,034,431 XP. Unlocks the Attack cape emote in the Heartlands guild hall.',
  },
};
