// ══════════════════════════════════════════════════════════════════════════════
// Hitpoints — Health pool. XP gained as a byproduct of combat (1/3 split).
// Player starts at level 10 (OSRS canon).
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const { XP_TABLE_99, CATEGORIES, ATTENTION } = require('./_shape');

module.exports = {
  id: 'hitpoints',
  name: 'Hitpoints',
  category: CATEGORIES.COMBAT,
  xpTable: XP_TABLE_99,

  actions: [
    { level:  1, name: 'Take damage while training any combat skill', xpPer: 1.33, baseTimeMs: 2400, region: 'any', attention: ATTENTION.BACKGROUND },
  ],

  equipment: [],

  unlocks: {
    10: 'Starting Hitpoints level — every player begins at 10 HP.',
    70: 'Regen bracelet halves tick interval.',
    99: 'Max HP 99 — unlocks the Hitpoints cape emote.',
  },

  capstone: {
    level: 99,
    name: 'Indomitable',
    description: 'HP cape passively regenerates +1 HP per tick while in combat.',
  },
};
