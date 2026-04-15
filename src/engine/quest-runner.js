// ══════════════════════════════════════════════════════════════════════════════
// Quest Runner — bridges quest definitions + quest-unlocks → engine
//
// Two parallel sources for any quest:
//   1. src/data/quests.js (engine schema): name, description, steps, rewards
//   2. src/data/relationships.js → defineQuestUnlock: Metroidvania unlock effects
//
// A single questId may exist in either, both, or neither. The runner is tolerant.
// On complete:
//   - apply rewards.xp via player.addXp (triggers level-up handling)
//   - apply rewards.items via player.invAdd
//   - mark p.questProgress[id] = { complete: true, completedAt: tick }
//   - return the unlocks list so the caller (command, RL agent) can react
//
// Burn-v2 addition: step tables (content/aelgard/quest-runner-steps.js) define
// machine-checkable predicates per step. `attemptAdvance(p, questId)` evaluates
// the current step's predicate; if satisfied, the player advances. Quests that
// only exist in the unlock registry (no engine quest def) now have runnable
// paths via synthesized 3-step templates.
//
// Sub-system #2 of the Engine Bridge (see ENGINE-BRIDGE-ROADMAP.md).
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const quests = require('../data/quests');
const items = require('../data/items');
const player = require('../player/player');
const rel = require('../data/relationships');
const tick = require('./tick');
const breakpoints = require('./breakpoint-runner');
const stepTables = require('../content/aelgard/quest-runner-steps');

// ── Helpers ───────────────────────────────────────────────────────────────────

function ensureProgress(p) {
  if (!p.questProgress) p.questProgress = {};
  return p.questProgress;
}

function ensureFlags(p) {
  if (!p.questFlags) {
    p.questFlags = {
      dialogues: {},       // { npcId: true } — NPCs the player has talked to
      clickedObjects: {},  // { objectId: true } — objects interacted with
      visitedAreas: {},    // { areaId: true } — areas visited
      generic: {},         // { flagName: true } — generic named flags
    };
  }
  // Defensive — old save-games may have a partial shape.
  if (!p.questFlags.dialogues) p.questFlags.dialogues = {};
  if (!p.questFlags.clickedObjects) p.questFlags.clickedObjects = {};
  if (!p.questFlags.visitedAreas) p.questFlags.visitedAreas = {};
  if (!p.questFlags.generic) p.questFlags.generic = {};
  return p.questFlags;
}

function progressFor(p, questId) {
  const all = ensureProgress(p);
  return all[questId] || { started: false, step: 0, complete: false };
}

function meetsRequirements(p, quest) {
  if (!quest) return { ok: true };
  const req = quest.requirements || {};
  for (const [skill, lvl] of Object.entries(req.skills || {})) {
    if (player.getLevel(p, skill) < lvl) {
      return { ok: false, reason: `requires ${skill} level ${lvl}` };
    }
  }
  for (const qId of (req.quests || [])) {
    if (!progressFor(p, qId).complete) {
      return { ok: false, reason: `requires quest: ${qId}` };
    }
  }
  return { ok: true };
}

// ── Player-state helpers (used by the step-table predicates) ──────────────────
// Keep these on the runner module so step tables can be declarative data.

function markDialogue(p, npcId) {
  ensureFlags(p).dialogues[npcId] = true;
}

function hasDialogued(p, npcId) {
  return !!ensureFlags(p).dialogues[npcId];
}

function markClickedObject(p, objectId) {
  ensureFlags(p).clickedObjects[objectId] = true;
}

function hasClickedObject(p, objectId) {
  return !!ensureFlags(p).clickedObjects[objectId];
}

function markVisitedArea(p, areaId) {
  ensureFlags(p).visitedAreas[areaId] = true;
}

function hasVisitedArea(p, areaId) {
  return !!ensureFlags(p).visitedAreas[areaId];
}

function setFlag(p, flag) {
  ensureFlags(p).generic[flag] = true;
}

function hasFlag(p, flag) {
  return !!ensureFlags(p).generic[flag];
}

function hasItem(p, itemId, count) {
  const need = count || 1;
  // Support both numeric item ids (engine-registered items) and symbolic
  // string ids (narrative-parsed synthesised item names). String ids match
  // against slot.name directly.
  if (typeof itemId === 'string') {
    let have = 0;
    for (const slot of (p.inventory || [])) {
      if (slot && slot.name === itemId) have += slot.count;
    }
    return have >= need;
  }
  return player.invCount(p, itemId) >= need;
}

function hasKilled(p, monsterId, count) {
  const need = count || 1;
  return (p.killCounts && p.killCounts[monsterId] || 0) >= need;
}

// ── Predicate evaluator ───────────────────────────────────────────────────────

function evalPredicate(p, pred) {
  if (!pred) return true;
  switch (pred.kind) {
    case 'dialogue':     return hasDialogued(p, pred.npc);
    case 'item':         return hasItem(p, pred.itemId, pred.count || 1);
    case 'kill':         return hasKilled(p, pred.monsterId, pred.count || 1);
    case 'clickObject':  return hasClickedObject(p, pred.objectId);
    case 'visit':        return hasVisitedArea(p, pred.areaId);
    case 'level':        return player.getLevel(p, pred.skill) >= (pred.level || 1);
    case 'flag':         return hasFlag(p, pred.flag);
    case 'or':
      return (pred.any || []).some(child => evalPredicate(p, child));
    case 'and':
      return (pred.all || []).every(child => evalPredicate(p, child));
    default: return false;
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

function start(p, questId) {
  const quest = quests.getQuest(questId);
  // Allow starting registry-only quests (no engine def yet)
  const unlocks = rel.getQuestUnlocks(questId);
  const table = stepTables.getSteps(questId);
  if (!quest && !unlocks && !table) return { ok: false, reason: `unknown quest: ${questId}` };

  const status = progressFor(p, questId);
  if (status.complete) return { ok: false, reason: 'already complete' };
  if (status.started) return { ok: false, reason: 'already started' };

  if (quest) {
    const check = meetsRequirements(p, quest);
    if (!check.ok) return check;
  }

  ensureProgress(p)[questId] = {
    started: true,
    startedAt: tick.getTick(),
    step: 0,
    complete: false,
    completedAt: null,
  };
  return { ok: true, quest: quest || { id: questId, name: unlocks?.name || questId } };
}

function advanceStep(p, questId) {
  const status = progressFor(p, questId);
  if (!status.started) return { ok: false, reason: 'not started' };
  if (status.complete) return { ok: false, reason: 'already complete' };

  const quest = quests.getQuest(questId);
  const table = stepTables.getSteps(questId);
  status.step++;

  // Prefer the step-table's authoritative step count when present; fall back
  // to the engine quest steps[] length; if neither exists, treat as single-step.
  const total = table?.steps.length ?? quest?.steps.length ?? 1;

  if (status.step >= total) {
    return complete(p, questId);
  }

  ensureProgress(p)[questId] = status;
  return { ok: true, step: status.step, totalSteps: total };
}

// Attempt to advance based on the current step's predicate. If satisfied,
// advance. Otherwise report what the player still needs to do.
function attemptAdvance(p, questId) {
  const status = progressFor(p, questId);
  if (!status.started) return { ok: false, reason: 'not started' };
  if (status.complete) return { ok: false, reason: 'already complete' };

  const table = stepTables.getSteps(questId);
  if (!table) {
    // No step-table — fall back to legacy unconditional advance
    return advanceStep(p, questId);
  }

  const step = table.steps[status.step];
  if (!step) {
    // Past end of table — auto-complete
    return complete(p, questId);
  }

  if (evalPredicate(p, step.predicate)) {
    return advanceStep(p, questId);
  }
  return {
    ok: false,
    reason: 'step predicate not satisfied',
    step: status.step,
    objective: step.objective,
    predicate: step.predicate,
    synthesized: !!step.synthesized,
  };
}

function currentStep(p, questId) {
  const status = progressFor(p, questId);
  const table = stepTables.getSteps(questId);
  if (!table) return null;
  const step = table.steps[status.step];
  if (!step) return null;
  return {
    index: status.step,
    total: table.steps.length,
    source: table.source,
    id: step.id,
    objective: step.objective,
    predicate: step.predicate,
    synthesized: !!step.synthesized,
    satisfied: evalPredicate(p, step.predicate),
  };
}

function complete(p, questId) {
  const status = progressFor(p, questId);
  if (status.complete) return { ok: false, reason: 'already complete' };

  const quest = quests.getQuest(questId);
  const unlockData = rel.getQuestUnlocks(questId);
  const table = stepTables.getSteps(questId);
  if (!quest && !unlockData && !table) return { ok: false, reason: `unknown quest: ${questId}` };

  const xpAwarded = {};
  const itemsAwarded = [];
  const skipped = [];

  if (quest && quest.rewards) {
    for (const [skill, amount] of Object.entries(quest.rewards.xp || {})) {
      const newLvl = breakpoints.addXpWithBreakpoints(p, skill, amount);
      xpAwarded[skill] = amount;
      if (newLvl) xpAwarded[`${skill}_level`] = newLvl;
    }
    for (const reward of (quest.rewards.items || [])) {
      const def = items.get(reward.id) || (reward.name ? items.find(reward.name) : null);
      if (!def) {
        skipped.push(reward.name || reward.id);
        continue;
      }
      const ok = player.invAdd(p, def.id, def.name, reward.count || 1, def.stackable);
      if (ok) itemsAwarded.push({ id: def.id, name: def.name, count: reward.count || 1 });
      else skipped.push(`${def.name} (inv full)`);
    }
  }

  const totalSteps = table?.steps.length ?? quest?.steps.length ?? status.step;

  ensureProgress(p)[questId] = {
    ...status,
    started: true,
    step: totalSteps,
    complete: true,
    completedAt: tick.getTick(),
  };

  // Mark the canonical reward flag for any step tables whose last step is a
  // "return for reward" predicate — defensive for callers who complete() early.
  setFlag(p, `${questId}_reward_claimed`);

  // Quest-completion breakpoints (e.g., Dragon Slayer unlocks rune armour gear)
  breakpoints.checkQuestComplete(p, questId);

  return {
    ok: true,
    questId,
    name: quest?.name || unlockData?.name || questId,
    xpAwarded,
    itemsAwarded,
    itemsSkipped: skipped,
    unlocks: unlockData?.unlocks || [],
  };
}

function status(p, questId) {
  if (questId) {
    const s = progressFor(p, questId);
    const quest = quests.getQuest(questId);
    const table = stepTables.getSteps(questId);
    return {
      questId, name: quest?.name || questId,
      ...s,
      totalSteps: table?.steps.length ?? quest?.steps.length ?? null,
      source: table?.source || null,
    };
  }
  // All quests in progress or completed
  const all = ensureProgress(p);
  return Object.entries(all).map(([id, s]) => ({
    questId: id,
    name: quests.getQuest(id)?.name || id,
    ...s,
  }));
}

function listAvailable(p) {
  // All quests the player meets requirements for and hasn't completed
  return quests.listAll().filter(q => {
    const s = progressFor(p, q.id);
    if (s.complete) return false;
    return meetsRequirements(p, q).ok;
  });
}

function getQuestPoints(p) {
  return quests.getQuestPoints(p);
}

// ── Coverage report ──────────────────────────────────────────────────────────
// For the coverage test & report: count how many quests have a runnable step
// table, split by source (authored / narrative / synthesized).

function coverage() {
  const report = { total: 0, narrative: 0, synthesized: 0, authored: 0, missing: 0 };
  for (const [, table] of stepTables.listAll()) {
    report.total++;
    report[table.source] = (report[table.source] || 0) + 1;
  }
  return report;
}

module.exports = {
  start, advanceStep, attemptAdvance, currentStep, complete,
  status, listAvailable,
  getQuestPoints, meetsRequirements, progressFor,
  // Player-state helpers (public so tests + command handlers can drive them)
  markDialogue, hasDialogued,
  markClickedObject, hasClickedObject,
  markVisitedArea, hasVisitedArea,
  setFlag, hasFlag,
  hasItem, hasKilled,
  evalPredicate,
  coverage,
};
