// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Quest Runner Step Tables (burn-v2)
//
// Machine-checkable step tables for every registered quest. Generated from:
//   1. data/quest-narratives.json (102 narratives — AUTHORED predicates from
//      parsed objective text)
//   2. quest-unlocks.js + quests.js (the rest — SYNTHESIZED 3-step templates
//      using the quest's requirements and unlock name)
//
// Predicate kinds (read by quest-runner.attemptAdvance):
//   { kind: 'dialogue', npc: 'miriam' }         → p.dialoguedWith(npc)
//   { kind: 'item',     itemId, count }         → p has >= count of item
//   { kind: 'kill',     monsterId, count }      → p has >= count kills
//   { kind: 'clickObject', objectId }           → p has interacted with object
//   { kind: 'level',    skill, level }          → skill level threshold
//   { kind: 'visit',    areaId }                → p has visited area
//   { kind: 'flag',     flag }                  → generic questFlags[flag]==true
//
// Every step has `synthesized: true` iff the predicate came from the fallback
// template rather than the narrative text. A human can later improve these.
//
// Sub-system #2 of the Engine Bridge (see ENGINE-BRIDGE-ROADMAP.md).
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const steps = new Map(); // questId → { source, steps: [{ id, objective, predicate, synthesized }] }

function define(questId, opts) {
  steps.set(questId, {
    source: opts.source || 'authored', // 'authored' | 'synthesized' | 'narrative'
    steps: (opts.steps || []).map((s, i) => ({
      id: s.id || `step_${i + 1}`,
      objective: s.objective || '',
      predicate: s.predicate || { kind: 'flag', flag: `${questId}_step_${i + 1}` },
      synthesized: !!s.synthesized,
    })),
  });
}

function getSteps(questId) { return steps.get(questId); }
function listAll() { return [...steps.entries()]; }
function has(questId) { return steps.has(questId); }
function size() { return steps.size; }

module.exports = { define, getSteps, listAll, has, size };
