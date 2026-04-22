// ══════════════════════════════════════════════════════════════════════════════
// Agility — Rooftop courses + obstacles. Impl: src/skills/agility.js.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const { XP_TABLE_99, CATEGORIES, ATTENTION } = require('./_shape');

module.exports = {
  id: 'agility',
  name: 'Agility',
  category: CATEGORIES.EXPLORATION,
  xpTable: XP_TABLE_99,

  actions: [
    { level:  1, name: 'Heartlands Rooftop Course',  xpPer:  40,  baseTimeMs: 3600, region: 'Heartlands', attention: ATTENTION.MULTITASK },
    { level: 20, name: 'Saltbrine Harbour Course',   xpPer: 100,  baseTimeMs: 4200, region: 'Saltbrine',  attention: ATTENTION.ACTIVE },
    { level: 50, name: 'Sootworks Pipe Network',     xpPer: 190,  baseTimeMs: 5400, region: 'Sootworks',  attention: ATTENTION.ACTIVE },
    { level: 70, name: 'Inkweald Dreamwalk',         xpPer: 310,  baseTimeMs: 5400, region: 'Inkweald',   attention: ATTENTION.MAX_FOCUS },
    { level: 90, name: 'Wildsgate Gauntlet',         xpPer: 450,  baseTimeMs: 6000, region: 'Wilds',      attention: ATTENTION.MAX_FOCUS },
  ],

  equipment: [
    { slot: 'head',  name: 'Graceful hood',   level: 50 },
    { slot: 'body',  name: 'Graceful top',    level: 50 },
    { slot: 'legs',  name: 'Graceful legs',   level: 50 },
    { slot: 'hands', name: 'Graceful gloves', level: 50 },
    { slot: 'feet',  name: 'Graceful boots',  level: 50 },
    { slot: 'cape',  name: 'Graceful cape',   level: 50 },
  ],

  unlocks: {
     1: 'Town Rooftop Course.',
    10: 'Wall shortcuts unlock.',
    30: 'Run energy regen x2.',
    50: 'Graceful armour available.',
    70: 'Elite rooftops unlock.',
    90: 'Wildsgate Gauntlet unlocks.',
  },

  capstone: {
    level: 99,
    name: 'Rooftop Ghost',
    description: 'Agility cape restores full run energy when worn.',
  },
};
