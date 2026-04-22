// ══════════════════════════════════════════════════════════════════════════════
// Fletching — Bow + arrow + bolt + dart production. Impl: src/skills/combining.js.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const { XP_TABLE_99, CATEGORIES, ATTENTION } = require('./_shape');

module.exports = {
  id: 'fletching',
  name: 'Fletching',
  category: CATEGORIES.PROCESSING,
  xpTable: XP_TABLE_99,

  actions: [
    { level:  1, name: 'Fletch arrow shaft from Logs', xpPer:  5,    baseTimeMs: 1200, region: 'Heartlands', attention: ATTENTION.BACKGROUND, produces: 'Arrow shaft' },
    { level:  5, name: 'String shortbow',              xpPer: 10,    baseTimeMs: 1800, region: 'Heartlands', attention: ATTENTION.BACKGROUND, produces: 'Shortbow' },
    { level: 20, name: 'String oak shortbow',          xpPer: 16.5,  baseTimeMs: 1800, region: 'Heartlands', attention: ATTENTION.BACKGROUND, produces: 'Oak shortbow' },
    { level: 35, name: 'String willow longbow',        xpPer: 33.5,  baseTimeMs: 1800, region: 'Saltbrine',  attention: ATTENTION.BACKGROUND, produces: 'Willow longbow' },
    { level: 50, name: 'String maple longbow',         xpPer: 58,    baseTimeMs: 1800, region: 'Inkweald',   attention: ATTENTION.BACKGROUND, produces: 'Maple longbow' },
    { level: 65, name: 'String yew longbow',           xpPer: 82.5,  baseTimeMs: 1800, region: 'Veilwood',   attention: ATTENTION.BACKGROUND, produces: 'Yew longbow' },
    { level: 80, name: 'String magic longbow',         xpPer: 91.5,  baseTimeMs: 1800, region: 'Veilwood',   attention: ATTENTION.BACKGROUND, produces: 'Magic longbow' },
    { level: 90, name: 'Fletch Redwood shield',        xpPer: 120,   baseTimeMs: 2400, region: 'Wilds',      attention: ATTENTION.ACTIVE,     produces: 'Redwood shield' },
  ],

  equipment: [
    { slot: 'weapon', name: 'Knife',            level:  1 },
    { slot: 'cape',   name: 'Fletching cape',   level: 99 },
  ],

  unlocks: {
     1: 'Fletch arrow shafts.',
     5: 'Shortbow (unstrung).',
    20: 'Oak shortbow.',
    65: 'Yew longbow.',
    80: 'Magic longbow.',
    90: 'Redwood shield.',
  },

  capstone: {
    level: 99,
    name: 'Bowyer',
    description: 'Fletching cape doubles the arrow yield when fletching feathers.',
  },
};
