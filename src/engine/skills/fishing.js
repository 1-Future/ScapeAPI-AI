// ══════════════════════════════════════════════════════════════════════════════
// Fishing — Net / rod / harpoon gathering. Impl: src/skills/gathering.js.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const { XP_TABLE_99, CATEGORIES, ATTENTION } = require('./_shape');

module.exports = {
  id: 'fishing',
  name: 'Fishing',
  category: CATEGORIES.GATHERING,
  xpTable: XP_TABLE_99,

  actions: [
    { level:  1, name: 'Net shrimp',           xpPer:  10, baseTimeMs: 3000, region: 'Heartlands', attention: ATTENTION.BACKGROUND, produces: 'Raw shrimps' },
    { level: 20, name: 'Fly-fish trout',       xpPer:  50, baseTimeMs: 3000, region: 'Heartlands', attention: ATTENTION.BACKGROUND, produces: 'Raw trout' },
    { level: 30, name: 'Fly-fish salmon',      xpPer:  70, baseTimeMs: 3000, region: 'Saltbrine',  attention: ATTENTION.BACKGROUND, produces: 'Raw salmon' },
    { level: 40, name: 'Cage lobster',         xpPer:  90, baseTimeMs: 3600, region: 'Saltbrine',  attention: ATTENTION.MULTITASK,  produces: 'Raw lobster' },
    { level: 50, name: 'Harpoon swordfish',    xpPer: 100, baseTimeMs: 3600, region: 'Saltbrine',  attention: ATTENTION.MULTITASK,  produces: 'Raw swordfish' },
    { level: 62, name: 'Monk-net monkfish',    xpPer: 120, baseTimeMs: 3600, region: 'Veilwood',   attention: ATTENTION.ACTIVE,     produces: 'Raw monkfish' },
    { level: 76, name: 'Harpoon shark',        xpPer: 110, baseTimeMs: 4800, region: 'Saltbrine',  attention: ATTENTION.ACTIVE,     produces: 'Raw shark' },
    { level: 82, name: 'Lasso anglerfish',     xpPer: 120, baseTimeMs: 4800, region: 'Veilwood',   attention: ATTENTION.ACTIVE,     produces: 'Raw anglerfish' },
    { level: 91, name: 'Trawl dark crab',      xpPer: 130, baseTimeMs: 4800, region: 'Wilds',      attention: ATTENTION.MAX_FOCUS,  produces: 'Raw dark crab' },
  ],

  equipment: [
    { slot: 'weapon', name: 'Small fishing net', level:  1 },
    { slot: 'weapon', name: 'Fishing rod',       level:  5 },
    { slot: 'weapon', name: 'Fly fishing rod',   level: 20 },
    { slot: 'weapon', name: 'Lobster pot',       level: 40 },
    { slot: 'weapon', name: 'Harpoon',           level: 50 },
    { slot: 'weapon', name: 'Dragon harpoon',    level: 61 },
  ],

  unlocks: {
     1: 'You can fish Shrimps.',
    20: 'You can now fish Trout.',
    40: 'You can now fish Lobster.',
    62: 'You can now fish Monkfish.',
    76: 'You can now fish Sharks.',
    91: 'You can now fish Dark crabs in the Wilds.',
  },

  capstone: {
    level: 99,
    name: "Tide-Reader",
    description: 'Fishing cape guarantees no level-1 fish when fishing in the Saltbrine.',
  },
};
