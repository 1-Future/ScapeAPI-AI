// ══════════════════════════════════════════════════════════════════════════════
// Firemaking — Log burning, bonfire mode. Impl: src/skills/firemaking.js.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const { XP_TABLE_99, CATEGORIES, ATTENTION } = require('./_shape');

module.exports = {
  id: 'firemaking',
  name: 'Firemaking',
  category: CATEGORIES.SUPPORT,
  xpTable: XP_TABLE_99,

  actions: [
    { level:  1, name: 'Light Logs',           xpPer:  40,  baseTimeMs: 2400, region: 'Heartlands', attention: ATTENTION.BACKGROUND, produces: 'Fire (Logs)' },
    { level: 15, name: 'Light Oak logs',       xpPer:  60,  baseTimeMs: 2400, region: 'Heartlands', attention: ATTENTION.BACKGROUND, produces: 'Fire (Oak)' },
    { level: 30, name: 'Light Willow logs',    xpPer:  90,  baseTimeMs: 2400, region: 'Saltbrine',  attention: ATTENTION.BACKGROUND, produces: 'Fire (Willow)' },
    { level: 45, name: 'Light Maple logs',     xpPer: 135,  baseTimeMs: 2400, region: 'Inkweald',   attention: ATTENTION.BACKGROUND, produces: 'Fire (Maple)' },
    { level: 50, name: 'Storm Felling (Saltbrine wave event)', xpPer: 160, baseTimeMs: 3000, region: 'Saltbrine', attention: ATTENTION.ACTIVE, produces: 'Storm log XP' },
    { level: 60, name: 'Light Yew logs',       xpPer: 202.5, baseTimeMs: 2400, region: 'Veilwood',  attention: ATTENTION.BACKGROUND, produces: 'Fire (Yew)' },
    { level: 75, name: 'Light Magic logs',     xpPer: 303.8, baseTimeMs: 2400, region: 'Veilwood',  attention: ATTENTION.BACKGROUND, produces: 'Fire (Magic)' },
    { level: 95, name: 'Offer Redwood pyre (Wilds)', xpPer: 500, baseTimeMs: 3600, region: 'Wilds', attention: ATTENTION.MAX_FOCUS, produces: 'Redwood ash' },
  ],

  equipment: [
    { slot: 'weapon', name: 'Tinderbox',     level:  1 },
    { slot: 'cape',   name: 'Firemaking cape', level: 99 },
  ],

  unlocks: {
     1: 'You can light Logs.',
    50: 'Bonfire mode unlocks (Heartlands central bonfire).',
    95: 'Redwood pyre unlocks in the Wilds.',
  },

  capstone: {
    level: 99,
    name: 'Emberheart',
    description: 'Firemaking cape makes fires last twice as long.',
  },
};
