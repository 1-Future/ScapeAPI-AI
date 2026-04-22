// ══════════════════════════════════════════════════════════════════════════════
// Woodcutting — Axe-driven log gathering. Impl: src/skills/gathering.js.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const { XP_TABLE_99, CATEGORIES, ATTENTION } = require('./_shape');

module.exports = {
  id: 'woodcutting',
  name: 'Woodcutting',
  category: CATEGORIES.GATHERING,
  xpTable: XP_TABLE_99,

  actions: [
    { level:  1, name: 'Chop Tree',         xpPer:  25,  baseTimeMs: 3000, region: 'Heartlands', attention: ATTENTION.BACKGROUND, produces: 'Logs' },
    { level: 15, name: 'Chop Oak',          xpPer:  37.5, baseTimeMs: 3600, region: 'Heartlands', attention: ATTENTION.BACKGROUND, produces: 'Oak logs' },
    { level: 30, name: 'Chop Willow',       xpPer:  67.5, baseTimeMs: 4800, region: 'Saltbrine',  attention: ATTENTION.BACKGROUND, produces: 'Willow logs' },
    { level: 45, name: 'Chop Maple',        xpPer: 100,   baseTimeMs: 4800, region: 'Inkweald',   attention: ATTENTION.BACKGROUND, produces: 'Maple logs' },
    { level: 60, name: 'Chop Yew',          xpPer: 175,   baseTimeMs: 6000, region: 'Veilwood',   attention: ATTENTION.MULTITASK,  produces: 'Yew logs' },
    { level: 75, name: 'Chop Magic tree',   xpPer: 250,   baseTimeMs: 7200, region: 'Veilwood',   attention: ATTENTION.ACTIVE,     produces: 'Magic logs' },
    { level: 90, name: 'Chop Redwood',      xpPer: 380,   baseTimeMs: 9000, region: 'Wilds',      attention: ATTENTION.MAX_FOCUS,  produces: 'Redwood logs' },
  ],

  equipment: [
    { slot: 'weapon', name: 'Bronze axe',  level:  1 },
    { slot: 'weapon', name: 'Iron axe',    level:  1 },
    { slot: 'weapon', name: 'Steel axe',   level:  6 },
    { slot: 'weapon', name: 'Mithril axe', level: 21 },
    { slot: 'weapon', name: 'Adamant axe', level: 31 },
    { slot: 'weapon', name: 'Rune axe',    level: 41 },
    { slot: 'weapon', name: 'Dragon axe',  level: 61 },
  ],

  unlocks: {
     1: 'You can chop Trees.',
    15: 'You can now chop Oak trees.',
    30: 'You can now chop Willow trees.',
    45: 'You can now chop Maple trees.',
    60: 'You can now chop Yew trees.',
    75: 'You can now chop Magic trees.',
    90: 'You can now chop Redwood trees.',
  },

  capstone: {
    level: 99,
    name: 'Ringsong',
    description: 'Woodcutting cape doubles the nest-drop rate from yew / magic trees.',
  },
};
