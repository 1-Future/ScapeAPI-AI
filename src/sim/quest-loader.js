// ══════════════════════════════════════════════════════════════════════════════
// Quest loader — pulls all quest definitions from the Aelgard content packs
// into a read-only snapshot the planner / report scripts can consume.
//
// Why this file exists
// --------------------
// The `intensity-catalog.json` only contains training methods; it has zero
// "do-quest-X" activities. Before v0.9 wave C the planner couldn't see quest
// rewards at all, which is why the diagnostic showed 0/220 quests completed.
//
// Every quest pack registers itself into `src/data/quests.js` via
// `quests.define(...)`. Requiring the packs is idempotent and cheap — each
// module is a registry write, not a side-effect on world state. We require
// them once, snapshot the quest list, and hand it to the planner.
//
// Packs are wrapped in try/catch so the sim never explodes if one pack is
// broken — we just log and continue with the rest.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const path = require('path');

// List of every quest pack that calls `quests.define(...)`. Mirrors the boot
// list in `src/server.js` but skips anything that would need the engine to be
// running (e.g. quest-runner-steps which hooks into the step registry).
const QUEST_PACKS = [
  '../content/aelgard/quests-blitz',
  '../content/aelgard/quests-expanded',
  '../content/aelgard/quests-series',
  '../content/aelgard/quests-series-extensions',
  '../content/aelgard/quests-mega',
  '../content/aelgard/quests-v0.8-chain-1',
  '../content/aelgard/quests-v0.8-chain-2',
  '../content/aelgard/quests-v0.8-chain-3',
  '../content/aelgard/quests-v0.8-chain-4',
  '../content/aelgard/quests-v0.8-chain-5',
  '../content/aelgard/quests-burn-wave3',
  '../content/aelgard/quests-burn-wave3-part2',
  '../content/aelgard/quests-burn-wave3-part3',
  '../content/aelgard/raid-prerequisites',
  // Region packs register both content and quests:
  '../content/aelgard/heartlands',
  '../content/aelgard/saltbrine',
  '../content/aelgard/sootworks',
  '../content/aelgard/veilwood',
  '../content/aelgard/inkweald',
  '../content/aelgard/glass-desert',
  '../content/aelgard/boneyard-wastes',
  '../content/aelgard/moryskah',
  '../content/aelgard/active-gathering',
];

let _cachedSnapshot = null;

/**
 * Returns an array of quest records in the shape:
 *   {
 *     id,
 *     name,
 *     difficulty,
 *     questPoints,
 *     requirements: { skills?: {}, quests?: [...], items?: [...] },
 *     rewards:      { xp?: {}, items?: [...], questPoints?, unlocks?: [...], chain_next? }
 *   }
 *
 * The result is cached — subsequent calls return the same array.
 */
function loadQuests({ silent = true } = {}) {
  if (_cachedSnapshot) return _cachedSnapshot;

  // Swallow per-pack console noise while we require.
  const origLog = console.log;
  if (silent) console.log = () => {};

  let questsModule;
  try {
    questsModule = require('../data/quests');
  } catch (e) {
    console.log = origLog;
    if (!silent) console.error('[quest-loader] could not require src/data/quests:', e.message);
    return [];
  }

  const loaded = [];
  const failed = [];
  for (const pack of QUEST_PACKS) {
    try {
      require(pack);
      loaded.push(pack);
    } catch (e) {
      failed.push({ pack, err: e.message });
    }
  }

  console.log = origLog;
  if (!silent && failed.length) {
    for (const f of failed) console.error(`[quest-loader] pack failed: ${f.pack} — ${f.err}`);
  }

  const all = questsModule.listAll();
  // Return a plain-object snapshot (strip the Map handle).
  _cachedSnapshot = all.map(q => ({
    id:           q.id,
    name:         q.name,
    difficulty:   q.difficulty,
    questPoints:  q.questPoints || 1,
    requirements: q.requirements || {},
    rewards:      q.rewards || {},
  }));
  return _cachedSnapshot;
}

/**
 * Reset the cache — testing hook.
 */
function _resetCache() { _cachedSnapshot = null; }

module.exports = { loadQuests, QUEST_PACKS, _resetCache };
