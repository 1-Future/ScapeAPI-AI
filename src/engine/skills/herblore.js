// ══════════════════════════════════════════════════════════════════════════════
// Herblore — Clean + mix potions. Impl: src/data/recipes.js (clean_*/mix_*).
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const { XP_TABLE_99, CATEGORIES, ATTENTION } = require('./_shape');

module.exports = {
  id: 'herblore',
  name: 'Herblore',
  category: CATEGORIES.PROCESSING,
  xpTable: XP_TABLE_99,

  actions: [
    { level:  3, name: 'Clean Guam',           xpPer:   2,   baseTimeMs:  600, region: 'Heartlands', attention: ATTENTION.BACKGROUND, produces: 'Clean guam' },
    { level:  5, name: 'Clean Marrentill',     xpPer:   3,   baseTimeMs:  600, region: 'Heartlands', attention: ATTENTION.BACKGROUND, produces: 'Clean marrentill' },
    { level: 11, name: 'Clean Tarromin',       xpPer:   5,   baseTimeMs:  600, region: 'Veilwood',   attention: ATTENTION.BACKGROUND, produces: 'Clean tarromin' },
    { level: 20, name: 'Clean Harralander',    xpPer:   6,   baseTimeMs:  600, region: 'Veilwood',   attention: ATTENTION.BACKGROUND, produces: 'Clean harralander' },
    { level: 25, name: 'Clean Ranarr',         xpPer:   7,   baseTimeMs:  600, region: 'Inkweald',   attention: ATTENTION.BACKGROUND, produces: 'Clean ranarr' },
    { level:  3, name: 'Mix Attack potion',    xpPer:  25,   baseTimeMs: 1800, region: 'Heartlands', attention: ATTENTION.BACKGROUND, produces: 'Attack potion(4)' },
    { level: 12, name: 'Mix Strength potion',  xpPer:  50,   baseTimeMs: 1800, region: 'Heartlands', attention: ATTENTION.BACKGROUND, produces: 'Strength potion(4)' },
    { level: 30, name: 'Mix Defence potion',   xpPer:  75,   baseTimeMs: 1800, region: 'Heartlands', attention: ATTENTION.BACKGROUND, produces: 'Defence potion(4)' },
    { level: 38, name: 'Mix Prayer potion',    xpPer:  87.5, baseTimeMs: 1800, region: 'Moryskah',   attention: ATTENTION.BACKGROUND, produces: 'Prayer potion(4)' },
    { level: 72, name: 'Mix Saradomin brew',   xpPer: 180,   baseTimeMs: 2400, region: 'Veilwood',   attention: ATTENTION.ACTIVE,     produces: 'Saradomin brew(4)' },
    { level: 77, name: 'Mix Super restore',    xpPer: 142.5, baseTimeMs: 2400, region: 'Veilwood',   attention: ATTENTION.ACTIVE,     produces: 'Super restore(4)' },
    { level: 91, name: 'Mix Extended anti-venom+', xpPer: 140, baseTimeMs: 2400, region: 'Inkweald', attention: ATTENTION.MAX_FOCUS,  produces: 'Anti-venom+(4)' },
  ],

  equipment: [
    { slot: 'weapon', name: 'Pestle and mortar', level:  1 },
    { slot: 'weapon', name: 'Herb sack',         level: 58 },
    { slot: 'cape',   name: 'Herblore cape',     level: 99 },
  ],

  unlocks: {
     3: 'You can now clean Guam.',
    12: 'Strength potion unlocks.',
    38: 'Prayer potion unlocks.',
    72: 'Saradomin brew unlocks.',
    91: 'Anti-venom+ unlocks.',
  },

  capstone: {
    level: 99,
    name: 'Apothecary',
    description: 'Herblore cape grants a 5% chance to double potion output.',
  },
};
