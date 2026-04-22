// ══════════════════════════════════════════════════════════════════════════════
// Crafting — Leather, gems, pottery, glass. Impl: src/skills/combining.js.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const { XP_TABLE_99, CATEGORIES, ATTENTION } = require('./_shape');

module.exports = {
  id: 'crafting',
  name: 'Crafting',
  category: CATEGORIES.PROCESSING,
  xpTable: XP_TABLE_99,

  actions: [
    { level:  1, name: 'Tan leather',             xpPer:   5,    baseTimeMs: 2400, region: 'Heartlands',   attention: ATTENTION.BACKGROUND, produces: 'Leather' },
    { level: 14, name: 'Craft leather body',      xpPer:  25,    baseTimeMs: 2400, region: 'Heartlands',   attention: ATTENTION.BACKGROUND, produces: 'Leather body' },
    { level: 20, name: 'Cut Sapphire',            xpPer:  50,    baseTimeMs: 1800, region: 'Glass Desert', attention: ATTENTION.BACKGROUND, produces: 'Sapphire' },
    { level: 27, name: 'Cut Emerald',             xpPer:  67.5,  baseTimeMs: 1800, region: 'Glass Desert', attention: ATTENTION.BACKGROUND, produces: 'Emerald' },
    { level: 40, name: 'Cut Ruby',                xpPer:  85,    baseTimeMs: 1800, region: 'Glass Desert', attention: ATTENTION.BACKGROUND, produces: 'Ruby' },
    { level: 43, name: 'Cut Diamond',             xpPer: 107.5,  baseTimeMs: 1800, region: 'Glass Desert', attention: ATTENTION.BACKGROUND, produces: 'Diamond' },
    { level: 55, name: 'Cut Dragonstone',         xpPer: 137.5,  baseTimeMs: 1800, region: 'Glass Desert', attention: ATTENTION.BACKGROUND, produces: 'Dragonstone' },
    { level: 77, name: 'Craft Onyx amulet',       xpPer: 200,    baseTimeMs: 2400, region: 'Glass Desert', attention: ATTENTION.ACTIVE,     produces: 'Amulet of fury (uncharged)' },
    { level: 89, name: 'Craft Zenyte amulet',     xpPer: 300,    baseTimeMs: 2400, region: 'Inkweald',     attention: ATTENTION.ACTIVE,     produces: 'Amulet of torture' },
  ],

  equipment: [
    { slot: 'weapon', name: 'Chisel',    level:  1 },
    { slot: 'weapon', name: 'Needle',    level:  1 },
    { slot: 'cape',   name: 'Crafting cape', level: 99 },
  ],

  unlocks: {
     1: 'Basic crafting.',
    20: 'You can cut sapphires.',
    43: 'You can cut diamonds.',
    77: 'Onyx jewellery unlocks.',
    89: 'Zenyte jewellery unlocks.',
  },

  capstone: {
    level: 99,
    name: 'Gilder',
    description: 'Crafting cape grants +1 extra cut gem per dragonstone.',
  },
};
