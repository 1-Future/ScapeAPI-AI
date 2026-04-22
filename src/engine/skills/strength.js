// ══════════════════════════════════════════════════════════════════════════════
// Strength — Melee damage (max hit). Implementation: src/combat/combat.js.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const { XP_TABLE_99, CATEGORIES, ATTENTION } = require('./_shape');

module.exports = {
  id: 'strength',
  name: 'Strength',
  category: CATEGORIES.COMBAT,
  xpTable: XP_TABLE_99,

  actions: [
    { level:  1, name: 'Pummel Heartlands training dummy', xpPer: 4, baseTimeMs: 2400, region: 'Heartlands', attention: ATTENTION.ACTIVE },
    { level:  5, name: 'Slam Heartlands Giant rat',        xpPer: 4, baseTimeMs: 2400, region: 'Heartlands', attention: ATTENTION.ACTIVE },
    { level: 20, name: 'Crush Boneyard Skeleton',          xpPer: 4, baseTimeMs: 2400, region: 'Boneyard',   attention: ATTENTION.ACTIVE },
    { level: 40, name: 'Smash Veilwood Spectre',           xpPer: 4, baseTimeMs: 2400, region: 'Veilwood',   attention: ATTENTION.ACTIVE },
    { level: 60, name: 'Crush Inkweald Nightmare husk',    xpPer: 4, baseTimeMs: 2400, region: 'Inkweald',   attention: ATTENTION.MAX_FOCUS },
    { level: 70, name: 'Break a Wilds demon',              xpPer: 4, baseTimeMs: 2400, region: 'Wilds',      attention: ATTENTION.MAX_FOCUS },
  ],

  equipment: [
    { slot: 'weapon', name: 'Granite maul',  level: 50 },
    { slot: 'weapon', name: 'Dragon warhammer', level: 60 },
    { slot: 'body',   name: 'Fighter torso',  level:  1, provides: { melee_strength: 4 } },
  ],

  unlocks: {
    10: 'Your max hit has increased.',
    50: 'Granite weapons usable.',
    60: 'Dragon warhammer usable.',
    99: 'Strength capped — Master of the Fist unlocked.',
  },

  capstone: {
    level: 99,
    name: 'Master of the Fist',
    description: 'The full Strength cape radiates faint heat in the Wilds.',
  },
};
