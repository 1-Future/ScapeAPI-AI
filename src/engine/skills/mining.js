// ══════════════════════════════════════════════════════════════════════════════
// Mining — Pickaxe-driven ore gathering. Impl: src/skills/gathering.js.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const { XP_TABLE_99, CATEGORIES, ATTENTION } = require('./_shape');

module.exports = {
  id: 'mining',
  name: 'Mining',
  category: CATEGORIES.GATHERING,
  xpTable: XP_TABLE_99,

  actions: [
    { level:  1, name: 'Mine Copper rock',      xpPer: 17.5, baseTimeMs: 3000, region: 'Heartlands',   attention: ATTENTION.BACKGROUND, produces: 'Copper ore' },
    { level:  1, name: 'Mine Tin rock',         xpPer: 17.5, baseTimeMs: 3000, region: 'Heartlands',   attention: ATTENTION.BACKGROUND, produces: 'Tin ore' },
    { level: 15, name: 'Mine Iron rock',        xpPer: 35,   baseTimeMs: 2400, region: 'Sootworks',    attention: ATTENTION.BACKGROUND, produces: 'Iron ore' },
    { level: 25, name: 'Mine Soot-iron rock',   xpPer: 45,   baseTimeMs: 3000, region: 'Sootworks',    attention: ATTENTION.MULTITASK,  produces: 'Soot-iron ore' },
    { level: 30, name: 'Mine Coal rock',        xpPer: 50,   baseTimeMs: 3600, region: 'Sootworks',    attention: ATTENTION.MULTITASK,  produces: 'Coal' },
    { level: 55, name: 'Mine Mithril rock',     xpPer: 80,   baseTimeMs: 4800, region: 'Moryskah',     attention: ATTENTION.ACTIVE,     produces: 'Mithril ore' },
    { level: 70, name: 'Mine Adamantite rock',  xpPer: 95,   baseTimeMs: 6000, region: 'Moryskah',     attention: ATTENTION.ACTIVE,     produces: 'Adamantite ore' },
    { level: 70, name: 'Mine Crystal shard',    xpPer: 100,  baseTimeMs: 4800, region: 'Veilwood',     attention: ATTENTION.ACTIVE,     produces: 'Crystal shard' },
    { level: 85, name: 'Mine Runite rock',      xpPer: 125,  baseTimeMs: 7200, region: 'Wilds',        attention: ATTENTION.MAX_FOCUS,  produces: 'Runite ore' },
  ],

  equipment: [
    { slot: 'weapon', name: 'Bronze pickaxe',  level:  1 },
    { slot: 'weapon', name: 'Iron pickaxe',    level:  1 },
    { slot: 'weapon', name: 'Steel pickaxe',   level:  6 },
    { slot: 'weapon', name: 'Mithril pickaxe', level: 21 },
    { slot: 'weapon', name: 'Adamant pickaxe', level: 31 },
    { slot: 'weapon', name: 'Rune pickaxe',    level: 41 },
    { slot: 'weapon', name: 'Dragon pickaxe',  level: 61 },
  ],

  unlocks: {
     1: 'You can mine Copper and Tin.',
    15: 'You can now mine Iron ore.',
    30: 'You can now mine Coal.',
    40: 'You can now mine Gold ore.',
    55: 'You can now mine Mithril ore.',
    70: 'You can now mine Adamantite ore.',
    85: 'You can now mine Runite ore.',
  },

  capstone: {
    level: 99,
    name: 'Lodemaster',
    description: 'Mining cape grants a 25% chance to not deplete non-runite rocks.',
  },
};
