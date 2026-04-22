// ══════════════════════════════════════════════════════════════════════════════
// Defence — Reduces incoming damage. Gear tier gating lives here.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const { XP_TABLE_99, CATEGORIES, ATTENTION } = require('./_shape');

module.exports = {
  id: 'defence',
  name: 'Defence',
  category: CATEGORIES.COMBAT,
  xpTable: XP_TABLE_99,

  actions: [
    { level:  1, name: 'Absorb hits in Bronze',   xpPer: 4, baseTimeMs: 2400, region: 'Heartlands', attention: ATTENTION.ACTIVE },
    { level: 20, name: 'Tank Mithril set',        xpPer: 4, baseTimeMs: 2400, region: 'Moryskah',   attention: ATTENTION.ACTIVE },
    { level: 40, name: 'Tank Rune set',           xpPer: 4, baseTimeMs: 2400, region: 'Saltbrine',  attention: ATTENTION.ACTIVE },
    { level: 60, name: 'Tank Dragon / Barrows',   xpPer: 4, baseTimeMs: 2400, region: 'Boneyard',   attention: ATTENTION.ACTIVE },
    { level: 75, name: 'Tank Torva',              xpPer: 4, baseTimeMs: 2400, region: 'Wilds',      attention: ATTENTION.MAX_FOCUS },
  ],

  equipment: [
    { slot: 'body', name: 'Bronze platebody',   level:  1 },
    { slot: 'body', name: 'Steel platebody',    level:  5 },
    { slot: 'body', name: 'Mithril platebody',  level: 20 },
    { slot: 'body', name: 'Adamant platebody',  level: 30 },
    { slot: 'body', name: 'Rune platebody',     level: 40 },
    { slot: 'body', name: 'Dragon chainbody',   level: 60 },
    { slot: 'body', name: 'Barrows chestplate', level: 70 },
    { slot: 'body', name: 'Torva platebody',    level: 80 },
  ],

  unlocks: {
     1: 'Bronze armour.',
     5: 'You can now wear Steel armour.',
    10: 'You can now wear Black armour.',
    20: 'You can now wear Mithril armour.',
    30: 'You can now wear Adamant armour.',
    40: 'You can now wear Rune armour.',
    60: 'You can now wear Dragon armour.',
    70: 'You can now wear Barrows armour.',
    80: 'You can now wear Torva armour.',
  },

  capstone: {
    level: 99,
    name: 'Unbroken',
    description: 'Defence cape grants +3 to all defensive style bonuses when worn.',
  },
};
