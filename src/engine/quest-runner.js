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
// Sub-system #2 of the Engine Bridge (see ENGINE-BRIDGE-ROADMAP.md).
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const quests = require('../data/quests');
const items = require('../data/items');
const player = require('../player/player');
const rel = require('../data/relationships');
const tick = require('./tick');
const breakpoints = require('./breakpoint-runner');

// ── Helpers ───────────────────────────────────────────────────────────────────

function ensureProgress(p) {
  if (!p.questProgress) p.questProgress = {};
  return p.questProgress;
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

// ── Public API ────────────────────────────────────────────────────────────────

function start(p, questId) {
  const quest = quests.getQuest(questId);
  // Allow starting registry-only quests (no engine def yet)
  const unlocks = rel.getQuestUnlocks(questId);
  if (!quest && !unlocks) return { ok: false, reason: `unknown quest: ${questId}` };

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
  status.step++;

  if (quest && status.step >= quest.steps.length) {
    return complete(p, questId);
  }

  ensureProgress(p)[questId] = status;
  return { ok: true, step: status.step, totalSteps: quest?.steps.length };
}

function complete(p, questId) {
  const status = progressFor(p, questId);
  if (status.complete) return { ok: false, reason: 'already complete' };

  const quest = quests.getQuest(questId);
  const unlockData = rel.getQuestUnlocks(questId);
  if (!quest && !unlockData) return { ok: false, reason: `unknown quest: ${questId}` };

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

  ensureProgress(p)[questId] = {
    ...status,
    started: true,
    step: quest?.steps.length || status.step,
    complete: true,
    completedAt: tick.getTick(),
  };

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
    return {
      questId, name: quest?.name || questId,
      ...s,
      totalSteps: quest?.steps.length || null,
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

module.exports = {
  start, advanceStep, complete, status, listAvailable,
  getQuestPoints, meetsRequirements, progressFor,
};
