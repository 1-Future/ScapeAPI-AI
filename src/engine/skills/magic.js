// ══════════════════════════════════════════════════════════════════════════════
// Magic — Spellcasting across 3 books. Implementation: src/engine/magic-runner.js.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const { XP_TABLE_99, CATEGORIES, ATTENTION } = require('./_shape');

module.exports = {
  id: 'magic',
  name: 'Magic',
  category: CATEGORIES.COMBAT,
  xpTable: XP_TABLE_99,

  actions: [
    { level:  1, name: 'Wind strike',          xpPer:  5.5, baseTimeMs: 1800, region: 'Heartlands',   attention: ATTENTION.ACTIVE },
    { level:  5, name: 'Water strike',         xpPer:  7.5, baseTimeMs: 1800, region: 'Heartlands',   attention: ATTENTION.ACTIVE },
    { level: 13, name: 'Fire strike',          xpPer: 11.5, baseTimeMs: 1800, region: 'Sootworks',    attention: ATTENTION.ACTIVE },
    { level: 25, name: 'Varrock teleport',     xpPer: 35,   baseTimeMs: 3000, region: 'Heartlands',   attention: ATTENTION.MULTITASK },
    { level: 35, name: 'Superheat item',       xpPer: 53,   baseTimeMs: 2400, region: 'Sootworks',    attention: ATTENTION.ACTIVE },
    { level: 55, name: 'High alchemy',         xpPer: 65,   baseTimeMs: 1800, region: 'Heartlands',   attention: ATTENTION.BACKGROUND },
    { level: 75, name: 'Ice barrage',          xpPer: 52,   baseTimeMs: 1800, region: 'Veilwood',     attention: ATTENTION.MAX_FOCUS },
    { level: 94, name: 'Ancient magicks raid', xpPer: 400,  baseTimeMs: 2400, region: 'Wilds',        attention: ATTENTION.MAX_FOCUS },
  ],

  equipment: [
    { slot: 'weapon', name: 'Staff of air',      level:  1, provides: { magic_attack: 10 } },
    { slot: 'weapon', name: 'Mystic staff',      level: 40, provides: { magic_attack: 15 } },
    { slot: 'weapon', name: "Ahrim's staff",     level: 70, provides: { magic_attack: 20 } },
    { slot: 'weapon', name: 'Kodai wand',        level: 80, provides: { magic_attack: 28 } },
    { slot: 'body',   name: 'Mystic robe top',   level: 40, provides: { magic_defence: 15 } },
    { slot: 'body',   name: 'Ancestral robe top', level: 75, provides: { magic_attack: 35 } },
  ],

  unlocks: {
     1: 'Wind Strike.',
    25: 'You can now cast Varrock Teleport.',
    31: 'You can now cast Lumbridge Teleport.',
    55: 'You can now use High Alchemy.',
    75: 'You can now cast Charge.',
    95: 'You can now cast Ice barrage.',
  },

  capstone: {
    level: 99,
    name: 'Arch-Mage',
    description: 'Magic cape halves rune costs for utility spells (alch / teleport).',
  },
};
