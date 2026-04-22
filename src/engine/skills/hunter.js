// ══════════════════════════════════════════════════════════════════════════════
// Hunter — Trapping, tracking, bird-house-ing. Impl: src/skills/hunter.js.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const { XP_TABLE_99, CATEGORIES, ATTENTION } = require('./_shape');

module.exports = {
  id: 'hunter',
  name: 'Hunter',
  category: CATEGORIES.GATHERING,
  xpTable: XP_TABLE_99,

  actions: [
    { level:  1, name: 'Bird snare — Crimson swift',      xpPer:  34,  baseTimeMs: 3000, region: 'Heartlands',   attention: ATTENTION.MULTITASK, produces: 'Crimson feather' },
    { level:  9, name: 'Bird snare — Golden warbler',     xpPer:  47,  baseTimeMs: 3000, region: 'Saltbrine',    attention: ATTENTION.MULTITASK, produces: 'Golden feather' },
    { level: 27, name: 'Box trap — Ferret',               xpPer:  80,  baseTimeMs: 3600, region: 'Heartlands',   attention: ATTENTION.MULTITASK, produces: 'Ferret' },
    { level: 43, name: 'Box trap — Spotted kebbit',       xpPer: 100,  baseTimeMs: 3600, region: 'Glass Desert', attention: ATTENTION.ACTIVE,    produces: 'Spotted fur' },
    { level: 53, name: 'Box trap — Dark kebbit',          xpPer: 132,  baseTimeMs: 3600, region: 'Moryskah',     attention: ATTENTION.ACTIVE,    produces: 'Dark kebbit fur' },
    { level: 60, name: 'Deadfall — Kyatt',                xpPer: 168,  baseTimeMs: 4800, region: 'Inkweald',     attention: ATTENTION.ACTIVE,    produces: 'Kyatt fur' },
    { level: 73, name: 'Track — Grenwall',                xpPer: 169,  baseTimeMs: 3600, region: 'Veilwood',     attention: ATTENTION.ACTIVE,    produces: 'Grenwall spikes' },
    { level: 80, name: 'Implings (Puro-Puro-ish)',        xpPer: 280,  baseTimeMs: 2400, region: 'Inkweald',     attention: ATTENTION.MAX_FOCUS, produces: 'Impling jar' },
    { level: 83, name: 'Black salamander (net)',          xpPer: 319,  baseTimeMs: 3600, region: 'Wilds',        attention: ATTENTION.MAX_FOCUS, produces: 'Black salamander' },
  ],

  equipment: [
    { slot: 'head',  name: "Larupia hat",   level: 31 },
    { slot: 'body',  name: "Larupia top",   level: 31 },
    { slot: 'legs',  name: "Larupia legs",  level: 31 },
    { slot: 'head',  name: "Graahk hood",   level: 41 },
    { slot: 'cape',  name: 'Hunter cape',   level: 99 },
  ],

  unlocks: {
     1: 'Bird snares.',
    27: 'Box traps.',
    53: 'You can now use Box traps for dark kebbit.',
    80: 'Impling hunting.',
    83: 'Black salamander.',
  },

  capstone: {
    level: 99,
    name: 'Pathfinder',
    description: 'Hunter cape grants one extra trap slot when deployed alone.',
  },
};
