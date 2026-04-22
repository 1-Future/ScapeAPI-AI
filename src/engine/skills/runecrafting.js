// ══════════════════════════════════════════════════════════════════════════════
// Runecrafting — Altar crafting + combo runes. Impl: src/skills/runecrafting.js.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const { XP_TABLE_99, CATEGORIES, ATTENTION } = require('./_shape');

module.exports = {
  id: 'runecrafting',
  name: 'Runecrafting',
  category: CATEGORIES.PROCESSING,
  xpTable: XP_TABLE_99,

  actions: [
    { level:  1, name: 'Craft Air runes',      xpPer:   5,   baseTimeMs: 1800, region: 'Heartlands',   attention: ATTENTION.ACTIVE, produces: 'Air rune' },
    { level:  5, name: 'Craft Mind runes',     xpPer:   5.5, baseTimeMs: 1800, region: 'Heartlands',   attention: ATTENTION.ACTIVE, produces: 'Mind rune' },
    { level:  9, name: 'Craft Water runes',    xpPer:   6,   baseTimeMs: 1800, region: 'Saltbrine',    attention: ATTENTION.ACTIVE, produces: 'Water rune' },
    { level: 14, name: 'Craft Earth runes',    xpPer:   6.5, baseTimeMs: 1800, region: 'Heartlands',   attention: ATTENTION.ACTIVE, produces: 'Earth rune' },
    { level: 20, name: 'Craft Fire runes',     xpPer:   7,   baseTimeMs: 1800, region: 'Sootworks',    attention: ATTENTION.ACTIVE, produces: 'Fire rune' },
    { level: 27, name: 'Craft Body runes',     xpPer:   7.5, baseTimeMs: 1800, region: 'Heartlands',   attention: ATTENTION.ACTIVE, produces: 'Body rune' },
    { level: 35, name: 'Craft Cosmic runes',   xpPer:   8,   baseTimeMs: 1800, region: 'Glass Desert', attention: ATTENTION.ACTIVE, produces: 'Cosmic rune' },
    { level: 44, name: 'Craft Chaos runes',    xpPer:   8.5, baseTimeMs: 1800, region: 'Wilds',        attention: ATTENTION.ACTIVE, produces: 'Chaos rune' },
    { level: 54, name: 'Craft Nature runes',   xpPer:   9,   baseTimeMs: 1800, region: 'Veilwood',     attention: ATTENTION.ACTIVE, produces: 'Nature rune' },
    { level: 65, name: 'Craft Law runes',      xpPer:   9.5, baseTimeMs: 1800, region: 'Inkweald',     attention: ATTENTION.ACTIVE, produces: 'Law rune' },
    { level: 77, name: 'Craft Death runes',    xpPer:  10,   baseTimeMs: 1800, region: 'Boneyard',     attention: ATTENTION.ACTIVE, produces: 'Death rune' },
    { level: 85, name: 'Craft Blood runes',    xpPer:  10.5, baseTimeMs: 1800, region: 'Moryskah',     attention: ATTENTION.ACTIVE, produces: 'Blood rune' },
    { level: 95, name: 'Craft Wrath runes',    xpPer:  11,   baseTimeMs: 1800, region: 'Wilds',        attention: ATTENTION.MAX_FOCUS, produces: 'Wrath rune' },
  ],

  equipment: [
    { slot: 'weapon', name: 'Rune pouch',    level:  1 },
    { slot: 'cape',   name: 'RC cape',       level: 99 },
  ],

  unlocks: {
     1: 'Air altar in the Heartlands.',
    44: 'Chaos altar accessible (Wilds level 3).',
    77: 'Death altar accessible via Temple Trekking.',
    91: 'Double-blood runes per essence at altar.',
    95: 'Wrath runes craftable.',
  },

  capstone: {
    level: 99,
    name: 'Altarweaver',
    description: 'Runecrafting cape doubles essence capacity on every craft.',
  },
};
