// ══════════════════════════════════════════════════════════════════════════════
// Unified Skill Manifest Shape
//
// A Scape skill manifest has a single consistent export shape so the RL
// environment, codex generator, admin dashboard, and breakpoint engine can all
// introspect any skill the same way. The underlying implementation of each
// action (the tick hook, the success roll, the item mutation) lives in its
// dedicated module under src/skills/ or in the combat/prayer/magic runners.
// This manifest is ONLY the declarative surface — the "what" — not the "how".
//
// Shape:
//   {
//     id:          'mining'                     (string, lowercase, matches SKILLS[])
//     name:        'Mining'                     (display string)
//     category:    'gathering' | 'processing' | 'support' | 'combat' | 'exploration'
//     xpTable:     [0, 0, 83, 174, ..., 13034431]   (length 100; index = level)
//                  or
//                  [0, 0, ..., 104273167, 111945003, ..., 200000000]  (length 127)
//     actions:     [{ level, name, xpPer, baseTimeMs, requirements, produces, region }]
//     equipment:   [{ slot, name, level, provides }]  (optional, worn gear)
//     unlocks:     { <level>: 'description' }         (player-facing messages)
//     capstone:    { level: 99|120, name, description, rewards }
//   }
//
// Regions map to the 9 Aelgard realms:
//   Heartlands | Sootworks | Moryskah | Boneyard | Glass Desert | Saltbrine
//   Veilwood | Inkweald | Wilds
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

// OSRS XP table (identical to src/player/player.js — re-exported here so the
// skills/ sub-package is self-contained).
function buildXpTable(maxLevel = 99) {
  const table = [0];
  let acc = 0;
  for (let level = 1; level <= maxLevel; level++) {
    table[level] = Math.floor(acc / 4);
    acc += Math.floor(level + 300 * Math.pow(2, level / 7));
  }
  return table;
}

const XP_TABLE_99 = buildXpTable(99);

// Action categories (informational; matches breakpoint-runner conventions).
const CATEGORIES = Object.freeze({
  GATHERING:   'gathering',
  PROCESSING:  'processing',
  SUPPORT:     'support',
  COMBAT:      'combat',
  EXPLORATION: 'exploration',
});

// Attention-profile taxonomy (manifesto P02). Every action declares its
// expected attention profile so the training-method builder can label it.
const ATTENTION = Object.freeze({
  BACKGROUND: 'Background',
  MULTITASK:  'Multitask',
  ACTIVE:     'Active',
  MAX_FOCUS:  'Max Focus',
});

module.exports = {
  XP_TABLE_99,
  CATEGORIES,
  ATTENTION,
  buildXpTable,
};
