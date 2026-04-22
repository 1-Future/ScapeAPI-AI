// ══════════════════════════════════════════════════════════════════════════════
// Smithing — Smelt + anvil. Impl: src/skills/processing.js + aelgard/smithing-complete.js.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const { XP_TABLE_99, CATEGORIES, ATTENTION } = require('./_shape');

module.exports = {
  id: 'smithing',
  name: 'Smithing',
  category: CATEGORIES.PROCESSING,
  xpTable: XP_TABLE_99,

  actions: [
    { level:  1, name: 'Smelt Bronze bar',          xpPer:   6.2, baseTimeMs: 3000, region: 'Heartlands', attention: ATTENTION.BACKGROUND, produces: 'Bronze bar' },
    { level: 15, name: 'Smelt Iron bar',            xpPer:  12.5, baseTimeMs: 3000, region: 'Heartlands', attention: ATTENTION.BACKGROUND, produces: 'Iron bar' },
    { level: 25, name: 'Smelt Soot-iron bar',       xpPer:  20,   baseTimeMs: 3000, region: 'Sootworks',  attention: ATTENTION.BACKGROUND, produces: 'Soot-iron bar' },
    { level: 30, name: 'Smelt Steel bar',           xpPer:  17.5, baseTimeMs: 3000, region: 'Sootworks',  attention: ATTENTION.BACKGROUND, produces: 'Steel bar' },
    { level: 50, name: 'Smelt Mithril bar',         xpPer:  30,   baseTimeMs: 3000, region: 'Moryskah',   attention: ATTENTION.BACKGROUND, produces: 'Mithril bar' },
    { level: 70, name: 'Smelt Adamantite bar',      xpPer:  37.5, baseTimeMs: 3600, region: 'Moryskah',   attention: ATTENTION.MULTITASK,  produces: 'Adamantite bar' },
    { level: 85, name: 'Smelt Runite bar',          xpPer:  50,   baseTimeMs: 3600, region: 'Wilds',      attention: ATTENTION.ACTIVE,     produces: 'Runite bar' },
    { level: 90, name: 'Forge Blade of Soot',       xpPer: 120,   baseTimeMs: 4800, region: 'Sootworks',  attention: ATTENTION.ACTIVE,     produces: 'Blade of Soot' },
  ],

  equipment: [
    { slot: 'head', name: 'Smithing goggles',    level: 40 },
    { slot: 'body', name: 'Smithing apron',      level:  1 },
  ],

  unlocks: {
     1: 'Bronze bars.',
    15: 'You can now smelt Iron bars.',
    30: 'You can now smelt Steel bars.',
    50: 'You can now smelt Mithril bars.',
    70: 'You can now smelt Adamant bars.',
    85: 'You can now smelt Rune bars.',
    90: 'Blade of Soot recipe unlocks.',
  },

  capstone: {
    level: 99,
    name: 'Forgesworn',
    description: 'Smithing cape reduces bar-count cost of all anvil recipes by 1 (min 1).',
  },
};
