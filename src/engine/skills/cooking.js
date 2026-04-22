// ══════════════════════════════════════════════════════════════════════════════
// Cooking — Range + furnace processing. Impl: src/skills/processing.js.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const { XP_TABLE_99, CATEGORIES, ATTENTION } = require('./_shape');

module.exports = {
  id: 'cooking',
  name: 'Cooking',
  category: CATEGORIES.PROCESSING,
  xpTable: XP_TABLE_99,

  actions: [
    { level:  1, name: 'Cook shrimps on range',      xpPer:  30, baseTimeMs: 2400, region: 'Heartlands',   attention: ATTENTION.BACKGROUND, produces: 'Shrimps' },
    { level:  1, name: 'Cook chicken on range',      xpPer:  30, baseTimeMs: 2400, region: 'Heartlands',   attention: ATTENTION.BACKGROUND, produces: 'Cooked chicken' },
    { level: 15, name: 'Cook trout on range',        xpPer:  70, baseTimeMs: 2400, region: 'Heartlands',   attention: ATTENTION.BACKGROUND, produces: 'Trout' },
    { level: 25, name: 'Cook salmon on range',       xpPer:  90, baseTimeMs: 2400, region: 'Saltbrine',    attention: ATTENTION.BACKGROUND, produces: 'Salmon' },
    { level: 40, name: 'Cook lobster on range',      xpPer: 120, baseTimeMs: 2400, region: 'Saltbrine',    attention: ATTENTION.BACKGROUND, produces: 'Lobster' },
    { level: 45, name: 'Cook swordfish on range',    xpPer: 140, baseTimeMs: 2400, region: 'Saltbrine',    attention: ATTENTION.BACKGROUND, produces: 'Swordfish' },
    { level: 80, name: 'Cook shark on range',        xpPer: 210, baseTimeMs: 2400, region: 'Veilwood',     attention: ATTENTION.ACTIVE,     produces: 'Shark' },
    { level: 90, name: 'Boil anglerfish (Feast)',    xpPer: 230, baseTimeMs: 3000, region: 'Veilwood',     attention: ATTENTION.ACTIVE,     produces: 'Anglerfish' },
    { level: 95, name: 'Boil dark crab (Volcanic)',  xpPer: 215, baseTimeMs: 3000, region: 'Wilds',        attention: ATTENTION.MAX_FOCUS,  produces: 'Dark crab' },
  ],

  equipment: [
    { slot: 'head', name: 'Cooking gauntlets',   level: 25, provides: { cooking: '-burn:lobster' } },
    { slot: 'cape', name: 'Cooking cape',        level: 99, provides: { cooking: 'no-burn-anywhere' } },
  ],

  unlocks: {
     1: 'You can cook Shrimps.',
    15: 'You can now cook Trout.',
    30: 'You can now cook Lobster.',
    40: 'You can now cook Swordfish.',
    80: 'You can now cook Sharks.',
  },

  capstone: {
    level: 99,
    name: 'Hearthmaster',
    description: 'Cooking cape prevents all burns.',
  },
};
