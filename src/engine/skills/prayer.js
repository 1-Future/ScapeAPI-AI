// ══════════════════════════════════════════════════════════════════════════════
// Prayer — Bone burying + altar multipliers. Implementation: src/engine/prayer-runner.js.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const { XP_TABLE_99, CATEGORIES, ATTENTION } = require('./_shape');

module.exports = {
  id: 'prayer',
  name: 'Prayer',
  category: CATEGORIES.SUPPORT,
  xpTable: XP_TABLE_99,

  actions: [
    { level:  1, name: 'Bury Bones',                xpPer:  4.5,  baseTimeMs: 1200, region: 'Heartlands', attention: ATTENTION.BACKGROUND },
    { level:  1, name: 'Bury Big bones',            xpPer: 15,    baseTimeMs: 1200, region: 'Heartlands', attention: ATTENTION.BACKGROUND },
    { level:  1, name: 'Bury Dragon bones',         xpPer: 72,    baseTimeMs: 1200, region: 'Boneyard',   attention: ATTENTION.BACKGROUND },
    { level:  1, name: 'Bury Dragon bones @ gilded altar', xpPer: 252, baseTimeMs: 1200, region: 'Moryskah', attention: ATTENTION.ACTIVE },
    { level:  1, name: 'Bury Superior dragon bones @ gilded altar', xpPer: 525, baseTimeMs: 1200, region: 'Moryskah', attention: ATTENTION.ACTIVE },
    { level:  1, name: 'Offer Chaos altar sacrifice (Wilds)', xpPer: 252, baseTimeMs: 1200, region: 'Wilds', attention: ATTENTION.MAX_FOCUS },
  ],

  equipment: [
    { slot: 'cape',   name: 'Ardougne cloak (prayer)', level:  1, provides: { prayer: 1 } },
    { slot: 'neck',   name: 'Holy symbol',             level: 31, provides: { prayer: 2 } },
    { slot: 'head',   name: "Initiate helm",           level: 10, provides: { prayer: 3 } },
    { slot: 'ring',   name: 'Ring of the gods',        level: 80, provides: { prayer: 4 } },
  ],

  unlocks: {
    13: 'You can now use Superhuman Strength.',
    25: 'You can now use Protect from Melee.',
    43: 'You can now use Eagle Eye.',
    70: 'Piety usable.',
    77: 'Rigour usable.',
    95: 'Augury usable.',
  },

  capstone: {
    level: 99,
    name: 'Zealot',
    description: 'Prayer cape halves drain rate when active.',
  },
};
