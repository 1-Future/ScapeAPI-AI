// ══════════════════════════════════════════════════════════════════════════════
// Thieving — Pickpocket, stall theft, safe-cracking. Impl: src/skills/thieving.js.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const { XP_TABLE_99, CATEGORIES, ATTENTION } = require('./_shape');

module.exports = {
  id: 'thieving',
  name: 'Thieving',
  category: CATEGORIES.EXPLORATION,
  xpTable: XP_TABLE_99,

  actions: [
    { level:  1, name: 'Pickpocket Man',           xpPer:   8,   baseTimeMs: 3000, region: 'Heartlands',   attention: ATTENTION.ACTIVE },
    { level: 25, name: 'Pickpocket Farmer',        xpPer:  14.5, baseTimeMs: 3000, region: 'Heartlands',   attention: ATTENTION.ACTIVE },
    { level: 40, name: 'Pickpocket Guard',         xpPer:  46.8, baseTimeMs: 3000, region: 'Heartlands',   attention: ATTENTION.ACTIVE },
    { level: 55, name: 'Pickpocket Knight',        xpPer:  84.3, baseTimeMs: 3000, region: 'Heartlands',   attention: ATTENTION.ACTIVE },
    { level: 65, name: 'Pickpocket Paladin',       xpPer: 151.7, baseTimeMs: 3000, region: 'Heartlands',   attention: ATTENTION.ACTIVE },
    { level: 75, name: 'Pickpocket Gnome',         xpPer: 198.5, baseTimeMs: 3000, region: 'Veilwood',     attention: ATTENTION.ACTIVE },
    { level: 81, name: 'Pickpocket Hero',          xpPer: 275,   baseTimeMs: 3000, region: 'Heartlands',   attention: ATTENTION.ACTIVE },
    { level: 91, name: 'Pickpocket Elf',           xpPer: 353,   baseTimeMs: 3000, region: 'Veilwood',     attention: ATTENTION.MAX_FOCUS },
    { level: 50, name: 'Ink-Baron vault heist',    xpPer: 420,   baseTimeMs: 9000, region: 'Inkweald',     attention: ATTENTION.MAX_FOCUS },
  ],

  equipment: [
    { slot: 'body', name: 'Rogue equipment set', level:  1, provides: { thieving: 'double-loot-5%' } },
    { slot: 'hands', name: 'Gloves of silence', level: 54, provides: { thieving: '+10% success' } },
    { slot: 'cape', name: 'Thieving cape',       level: 99 },
  ],

  unlocks: {
     1: 'Pickpocket Men.',
    40: 'You can now pickpocket Guards.',
    55: 'You can now pickpocket Knights.',
    81: 'Pickpocket Heroes.',
    91: 'Pickpocket Elves.',
  },

  capstone: {
    level: 99,
    name: 'Shadow Hand',
    description: 'Thieving cape prevents all stun and damage on failed pickpockets.',
  },
};
