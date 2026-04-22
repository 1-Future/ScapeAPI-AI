// ══════════════════════════════════════════════════════════════════════════════
// Slayer — Combat-adjacent. Task masters assign monster kill targets.
// Impl: src/data/slayer.js + aelgard/slayer-expansion.js.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const { XP_TABLE_99, CATEGORIES, ATTENTION } = require('./_shape');

module.exports = {
  id: 'slayer',
  name: 'Slayer',
  category: CATEGORIES.COMBAT,
  xpTable: XP_TABLE_99,

  actions: [
    { level:  1, name: 'Get task from Turael (Heartlands)',    xpPer: 0,  baseTimeMs: 6000, region: 'Heartlands', attention: ATTENTION.ACTIVE,     produces: 'Task' },
    { level: 20, name: 'Get task from Mazchna (Saltbrine)',    xpPer: 0,  baseTimeMs: 6000, region: 'Saltbrine',  attention: ATTENTION.ACTIVE,     produces: 'Task' },
    { level: 40, name: 'Get task from Vannaka (Moryskah)',     xpPer: 0,  baseTimeMs: 6000, region: 'Moryskah',   attention: ATTENTION.ACTIVE,     produces: 'Task' },
    { level: 50, name: 'Get task from Chaeldar (Veilwood)',    xpPer: 0,  baseTimeMs: 6000, region: 'Veilwood',   attention: ATTENTION.ACTIVE,     produces: 'Task' },
    { level: 75, name: 'Get task from Nieve (Wilds)',          xpPer: 0,  baseTimeMs: 6000, region: 'Wilds',      attention: ATTENTION.ACTIVE,     produces: 'Task' },
    { level: 92, name: 'Get task from Duradel/Dorgeshuun grandmaster', xpPer: 0, baseTimeMs: 6000, region: 'Wilds', attention: ATTENTION.MAX_FOCUS, produces: 'Task' },
    { level: 41, name: 'Kill Abyssal demon task',              xpPer: 150, baseTimeMs: 2400, region: 'Inkweald',   attention: ATTENTION.ACTIVE },
    { level: 58, name: 'Kill Greater nechryael task',          xpPer: 200, baseTimeMs: 2400, region: 'Inkweald',   attention: ATTENTION.MAX_FOCUS },
    { level: 85, name: 'Kill Dark beasts task',                xpPer: 250, baseTimeMs: 2400, region: 'Inkweald',   attention: ATTENTION.MAX_FOCUS },
  ],

  equipment: [
    { slot: 'head',   name: 'Slayer helm',          level: 55, provides: { slayer: '+15% dmg vs task' } },
    { slot: 'weapon', name: 'Leaf-bladed battleaxe', level: 65, provides: { slayer: 'required for Kurask' } },
    { slot: 'cape',   name: 'Slayer cape',          level: 99 },
  ],

  unlocks: {
     1: 'Turael gives easy tasks.',
    55: 'Slayer helm (craft from full slayer helmet + gem).',
    75: 'Nieve tasks in the Wilds.',
    92: 'Grandmaster tasks from Duradel.',
  },

  capstone: {
    level: 99,
    name: 'Monster Purge',
    description: 'Slayer cape lets you skip any task without the 30-task streak penalty.',
  },
};
