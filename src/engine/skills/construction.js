// ══════════════════════════════════════════════════════════════════════════════
// Construction — House building. Impl: src/skills/construction.js + engine/housing.js.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const { XP_TABLE_99, CATEGORIES, ATTENTION } = require('./_shape');

module.exports = {
  id: 'construction',
  name: 'Construction',
  category: CATEGORIES.SUPPORT,
  xpTable: XP_TABLE_99,

  actions: [
    { level:  1, name: 'Build Crude wooden chair',   xpPer:  58,   baseTimeMs: 3000, region: 'Heartlands', attention: ATTENTION.ACTIVE, produces: 'Chair (room)' },
    { level:  8, name: 'Build Bookcase',             xpPer: 115,   baseTimeMs: 3600, region: 'Heartlands', attention: ATTENTION.ACTIVE, produces: 'Bookcase (study)' },
    { level: 15, name: 'Build Oak larder',           xpPer: 228,   baseTimeMs: 3600, region: 'Heartlands', attention: ATTENTION.ACTIVE, produces: 'Oak larder (kitchen)' },
    { level: 25, name: 'Build Crystal of power',     xpPer: 500,   baseTimeMs: 4800, region: 'Veilwood',   attention: ATTENTION.ACTIVE, produces: 'Altar (chapel)' },
    { level: 40, name: 'Build Altar',                xpPer: 500,   baseTimeMs: 4800, region: 'Heartlands', attention: ATTENTION.ACTIVE, produces: 'Altar (chapel)' },
    { level: 50, name: 'Build Gilded altar',         xpPer: 1031,  baseTimeMs: 6000, region: 'Heartlands', attention: ATTENTION.ACTIVE, produces: 'Gilded altar' },
    { level: 65, name: 'Build Oak teleport throne',  xpPer: 625,   baseTimeMs: 4800, region: 'Heartlands', attention: ATTENTION.ACTIVE, produces: 'Teleport throne' },
    { level: 80, name: 'Build Dungeon room',         xpPer: 1600,  baseTimeMs: 7200, region: 'Boneyard',   attention: ATTENTION.ACTIVE, produces: 'Dungeon (portal)' },
    { level: 96, name: 'Build Boss lair',            xpPer: 3200,  baseTimeMs: 9600, region: 'Wilds',      attention: ATTENTION.MAX_FOCUS, produces: 'Boss-room portal' },
  ],

  equipment: [
    { slot: 'weapon', name: 'Saw',               level:  1 },
    { slot: 'weapon', name: 'Hammer',            level:  1 },
    { slot: 'weapon', name: 'Crystal saw',       level: 86 },
    { slot: 'cape',   name: 'Construction cape', level: 99 },
  ],

  unlocks: {
     1: 'Unlock your house (Seers Village estate agent).',
    25: 'Crystal of power (portal room).',
    40: 'Altar (chapel).',
    50: 'Gilded altar + prayer XP x3.5.',
    65: 'Teleport thrones.',
    80: 'Dungeons.',
    96: 'Boss lair (stage fights in your house).',
  },

  capstone: {
    level: 99,
    name: 'Hearthmason',
    description: 'Construction cape halves plank requirements for any build.',
  },
};
