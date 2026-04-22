// ══════════════════════════════════════════════════════════════════════════════
// Ranged — Bows, crossbows, thrown. Implementation: src/combat/combat.js.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const { XP_TABLE_99, CATEGORIES, ATTENTION } = require('./_shape');

module.exports = {
  id: 'ranged',
  name: 'Ranged',
  category: CATEGORIES.COMBAT,
  xpTable: XP_TABLE_99,

  actions: [
    { level:  1, name: 'Shortbow + Bronze arrows',    xpPer: 4,   baseTimeMs: 3000, region: 'Heartlands',   attention: ATTENTION.ACTIVE },
    { level: 20, name: 'Oak shortbow + Steel arrows', xpPer: 4,   baseTimeMs: 3000, region: 'Heartlands',   attention: ATTENTION.ACTIVE },
    { level: 40, name: 'Maple longbow + Rune arrows', xpPer: 4,   baseTimeMs: 3000, region: 'Saltbrine',    attention: ATTENTION.ACTIVE },
    { level: 50, name: 'Magic shortbow',              xpPer: 4,   baseTimeMs: 3000, region: 'Veilwood',     attention: ATTENTION.ACTIVE },
    { level: 61, name: 'Rune crossbow + bolts',       xpPer: 4,   baseTimeMs: 3600, region: 'Glass Desert', attention: ATTENTION.ACTIVE },
    { level: 70, name: 'Blowpipe + Zulrah scales',    xpPer: 4,   baseTimeMs: 1800, region: 'Inkweald',     attention: ATTENTION.MAX_FOCUS },
    { level: 82, name: 'Dragon crossbow',             xpPer: 4,   baseTimeMs: 3600, region: 'Wilds',        attention: ATTENTION.MAX_FOCUS },
    { level: 85, name: 'Twisted bow',                 xpPer: 4,   baseTimeMs: 3000, region: 'Wilds',        attention: ATTENTION.MAX_FOCUS },
  ],

  equipment: [
    { slot: 'weapon', name: 'Shortbow',        level:  1 },
    { slot: 'weapon', name: 'Oak shortbow',    level:  5 },
    { slot: 'weapon', name: 'Willow shortbow', level: 20 },
    { slot: 'weapon', name: 'Maple shortbow',  level: 30 },
    { slot: 'weapon', name: 'Yew shortbow',    level: 40 },
    { slot: 'weapon', name: 'Magic shortbow',  level: 50 },
    { slot: 'weapon', name: 'Rune crossbow',   level: 61 },
    { slot: 'weapon', name: 'Blowpipe',        level: 75 },
    { slot: 'weapon', name: 'Twisted bow',     level: 85 },
  ],

  unlocks: {
     1: 'Bronze arrows.',
    20: 'You can now use Steel arrows.',
    40: 'You can now use Rune arrows.',
    70: 'Blowpipe unlocked.',
    85: 'Twisted bow unlocked.',
  },

  capstone: {
    level: 99,
    name: 'Far Shot',
    description: 'Ranged cape grants +5 accuracy when worn against all non-boss NPCs.',
  },
};
