// ══════════════════════════════════════════════════════════════════════════════
// Farming — Plant + tend + harvest. Impl: src/skills/farming.js.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const { XP_TABLE_99, CATEGORIES, ATTENTION } = require('./_shape');

module.exports = {
  id: 'farming',
  name: 'Farming',
  category: CATEGORIES.GATHERING,
  xpTable: XP_TABLE_99,

  actions: [
    { level:  1, name: 'Plant Potato seed',       xpPer:   8,   baseTimeMs: 1800, region: 'Heartlands', attention: ATTENTION.MULTITASK, produces: 'Potato (9 harvested)' },
    { level:  9, name: 'Plant Guam seed',         xpPer:  11,   baseTimeMs: 1800, region: 'Heartlands', attention: ATTENTION.MULTITASK, produces: 'Guam herb' },
    { level: 14, name: 'Plant Marrentill seed',   xpPer:  13.5, baseTimeMs: 1800, region: 'Heartlands', attention: ATTENTION.MULTITASK, produces: 'Marrentill herb' },
    { level: 20, name: 'Plant Onion seed',        xpPer:  10.5, baseTimeMs: 1800, region: 'Heartlands', attention: ATTENTION.MULTITASK, produces: 'Onion' },
    { level: 32, name: 'Plant Ranarr seed',       xpPer:  27,   baseTimeMs: 1800, region: 'Heartlands', attention: ATTENTION.MULTITASK, produces: 'Ranarr herb' },
    { level: 36, name: 'Plant Willow sapling',    xpPer:  33,   baseTimeMs: 3600, region: 'Heartlands', attention: ATTENTION.BACKGROUND, produces: 'Willow tree' },
    { level: 60, name: 'Plant Yew sapling',       xpPer:  81,   baseTimeMs: 3600, region: 'Veilwood',   attention: ATTENTION.BACKGROUND, produces: 'Yew tree' },
    { level: 75, name: 'Plant Magic sapling',     xpPer: 145.5, baseTimeMs: 3600, region: 'Veilwood',   attention: ATTENTION.BACKGROUND, produces: 'Magic tree' },
    { level: 85, name: 'Plant Torstol seed',      xpPer: 199.5, baseTimeMs: 1800, region: 'Inkweald',   attention: ATTENTION.MULTITASK, produces: 'Torstol herb' },
  ],

  equipment: [
    { slot: 'weapon', name: 'Seed dibber',       level:  1 },
    { slot: 'weapon', name: 'Rake',              level:  1 },
    { slot: 'weapon', name: 'Secateurs',         level:  1 },
    { slot: 'weapon', name: 'Magic secateurs',   level: 40 },
  ],

  unlocks: {
     1: 'Allotments + potatoes.',
     9: 'You can now plant Guam seeds.',
    14: 'You can now plant Marrentill seeds.',
    32: 'You can now plant Ranarr seeds.',
    36: 'Willow saplings.',
    75: 'Magic saplings.',
    85: 'Torstol seeds.',
  },

  capstone: {
    level: 99,
    name: "Earthsinger",
    description: 'Farming cape grants a chance for an extra harvest per patch.',
  },
};
