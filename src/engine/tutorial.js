// ══════════════════════════════════════════════════════════════════════════════
// Tutorial Engine — new-player curriculum runner
//
// The tutorial is a linear sequence of steps drawn from
// src/content/aelgard/tutorial-steps.js. This module owns the player-facing
// state machine:
//
//   initPlayer(p)              — seed p.tutorialStep / p.tutorialComplete
//   currentStep(p)             — return the current step descriptor (or null)
//   advanceStep(p, trigger)    — match an event against the current step and
//                                advance if it fits. Returns an object
//                                describing what happened (advanced, reward,
//                                completed) so the server can print/notify.
//   completeTutorial(p)        — mark the tutorial done (skip or final step)
//   hint(p)                    — the current step's in-game hint text
//   skip(p)                    — permanent skip, awards a modest bundle
//   replay(p)                  — ungated curiosity replay (resets to 0)
//   status(p)                  — structured status used by /tutorial status
//
// Design notes:
//   - Step matching is by trigger type. Each trigger shape is listed in the
//     step file. See advanceStep() below for the canonical matcher.
//   - Rewards are applied via the host's addXp / invAdd if provided on
//     configure(). We do NOT reach into other modules directly — this keeps
//     the engine decoupled (same pattern as area-locked, ironman).
//   - Distance steps track cumulative tile count via p.tutorialDistance. On
//     step exit the counter resets.
//   - Replay is intentionally "for curiosity" — rewards are suppressed on
//     replay runs (p.tutorialReplay = true) so players cannot farm it.
//   - Rules: no emojis. Parchment-style hint copy lives in the step data.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const STEPS_MODULE = require('../content/aelgard/tutorial-steps');

// ── Host bindings (populated by configure) ───────────────────────────────────
// The server wires concrete implementations. If unset we fall back to no-ops
// so unit tests can exercise pure state transitions.
let _addXp = (_p, _skill, _amount) => {};
let _invAdd = (_p, _id, _name, _count, _stackable) => true;
let _getItem = (_id) => null;

function configure(opts) {
  if (opts && typeof opts.addXp === 'function') _addXp = opts.addXp;
  if (opts && typeof opts.invAdd === 'function') _invAdd = opts.invAdd;
  if (opts && typeof opts.getItem === 'function') _getItem = opts.getItem;
}

// ── Player state accessors ───────────────────────────────────────────────────

function initPlayer(p) {
  if (!p) return;
  if (typeof p.tutorialStep !== 'number') p.tutorialStep = 0;
  if (typeof p.tutorialComplete !== 'boolean') p.tutorialComplete = false;
  if (typeof p.tutorialDistance !== 'number') p.tutorialDistance = 0;
  if (typeof p.tutorialSkipped !== 'boolean') p.tutorialSkipped = false;
  if (typeof p.tutorialReplay !== 'boolean') p.tutorialReplay = false;
  if (!Array.isArray(p.tutorialHistory)) p.tutorialHistory = [];
  return p;
}

function totalSteps() {
  return STEPS_MODULE.count();
}

function currentStep(p) {
  if (!p) return null;
  if (p.tutorialComplete) return null;
  return STEPS_MODULE.at(p.tutorialStep) || null;
}

function hint(p) {
  if (!p) return '';
  if (p.tutorialComplete) return 'The tutorial is complete. Type `/tutorial replay` to revisit it.';
  const step = currentStep(p);
  if (!step) return 'No active tutorial step.';
  return `Tutorial [${p.tutorialStep + 1}/${totalSteps()}] ${step.title}\n  ${step.hint}`;
}

// ── Trigger matcher ──────────────────────────────────────────────────────────
//
// trigger is the incoming event: { type: 'command', verb: 'look' } etc.
// step.trigger is what the step expects. Returns true if they match.

function matchTrigger(step, trigger) {
  if (!step || !step.trigger || !trigger || !trigger.type) return false;
  const st = step.trigger;
  if (st.type !== trigger.type) {
    // A 'breakpoint' fires a generic match; a 'level' step accepts either.
    // A 'distance' step has its own handler.
    return false;
  }

  switch (st.type) {
    case 'command': {
      const incomingVerb = String(trigger.verb || '').toLowerCase();
      if (!incomingVerb) return false;
      if (incomingVerb === st.verb) return true;
      if (Array.isArray(st.aliases) && st.aliases.includes(incomingVerb)) return true;
      return false;
    }

    case 'distance': {
      // Distance matches once the cumulative walked tiles reaches st.amount.
      return (trigger.amount || 0) >= (st.amount || 1);
    }

    case 'xp': {
      if (st.skill && trigger.skill !== st.skill) return false;
      return (trigger.amount || 0) >= (st.amount || 1);
    }

    case 'level': {
      // st.amount is a threshold; skill may be restricted or "any".
      if (st.skill && trigger.skill && trigger.skill !== st.skill) return false;
      return (trigger.level || 0) >= (st.amount || 1);
    }

    case 'total_level': {
      return (trigger.total || 0) >= (st.amount || 1);
    }

    case 'item_acquired': {
      if (st.itemId != null && trigger.itemId === st.itemId) return true;
      if (st.itemName && trigger.itemName &&
          String(trigger.itemName).toLowerCase() === String(st.itemName).toLowerCase()) return true;
      return false;
    }

    case 'item_cooked':
    case 'fire_lit':
    case 'tree_chopped':
    case 'pickup':
    case 'bank_opened':
    case 'ge_opened':
    case 'prayer_toggled':
    case 'combat_style':
    case 'save':
    case 'codex_opened':
    case 'dialogue':
    case 'breakpoint':
    case 'clan_joined':
    case 'ironman_set':
    case 'arealocked_set': {
      return true;
    }

    case 'npc_kill': {
      if (!st.name) return true;
      const expect = String(st.name).toLowerCase();
      const got = String(trigger.name || '').toLowerCase();
      return got === expect || got.endsWith(expect);
    }

    case 'quest_started':
    case 'quest_complete': {
      if (!st.questId) return true;
      return trigger.questId === st.questId;
    }

    case 'manual': {
      // Manual steps don't auto-advance from generic events. They may
      // opt-in via auto_advance_on_ironman / auto_advance_on_arealocked
      // short-circuit checks in advanceStep().
      return false;
    }

    default:
      return false;
  }
}

// ── Reward application ───────────────────────────────────────────────────────

function applyReward(p, step) {
  if (!step || !step.reward) return { xp: {}, items: [] };
  if (p.tutorialReplay) return { xp: {}, items: [], suppressed: true };
  const applied = { xp: {}, items: [] };

  if (step.reward.xp && typeof step.reward.xp === 'object') {
    for (const [skill, amount] of Object.entries(step.reward.xp)) {
      try { _addXp(p, skill, amount); } catch (_) { /* no-op */ }
      applied.xp[skill] = amount;
    }
  }

  if (step.reward.item && step.reward.item.id != null) {
    const id = step.reward.item.id;
    const count = step.reward.item.count || 1;
    const def = _getItem(id);
    const name = (def && def.name) || `item_${id}`;
    const stackable = !!(def && def.stackable);
    try { _invAdd(p, id, name, count, stackable); } catch (_) { /* no-op */ }
    applied.items.push({ id, name, count });
  }

  return applied;
}

// ── Advance ──────────────────────────────────────────────────────────────────
//
// Returns:
//   { advanced: false }                          — no match, no change
//   { advanced: true, step, reward, completed }  — advanced (or completed)

function advanceStep(p, trigger) {
  if (!p || p.tutorialComplete) return { advanced: false, reason: 'complete' };

  const step = currentStep(p);
  if (!step) return { advanced: false, reason: 'no_step' };

  // Distance accumulator: any 'player_move' raw trigger contributes.
  if (trigger && trigger.type === 'player_move') {
    p.tutorialDistance = (p.tutorialDistance || 0) + (trigger.tiles || 1);
    // If the active step is a distance step, synthesize a distance trigger.
    if (step.trigger && step.trigger.type === 'distance') {
      return advanceStep(p, { type: 'distance', amount: p.tutorialDistance });
    }
    return { advanced: false, reason: 'move_counted', distance: p.tutorialDistance };
  }

  // Auto-advance manual steps when the player picks a mode.
  if (step.trigger && step.trigger.type === 'manual') {
    if (trigger.type === 'ironman_set' && step.trigger.auto_advance_on_ironman) {
      return doAdvance(p, step);
    }
    if (trigger.type === 'arealocked_set' && step.trigger.auto_advance_on_arealocked) {
      return doAdvance(p, step);
    }
  }

  if (!matchTrigger(step, trigger)) {
    return { advanced: false, reason: 'no_match' };
  }

  return doAdvance(p, step);
}

function doAdvance(p, step) {
  const reward = applyReward(p, step);
  p.tutorialHistory.push({ id: step.id, at: Date.now() });
  p.tutorialStep += 1;
  p.tutorialDistance = 0;

  if (p.tutorialStep >= totalSteps()) {
    completeTutorial(p);
    return { advanced: true, step, reward, completed: true };
  }
  return { advanced: true, step, reward, completed: false };
}

// ── Lifecycle ────────────────────────────────────────────────────────────────

function completeTutorial(p) {
  if (!p) return;
  p.tutorialStep = totalSteps();
  p.tutorialComplete = true;
  p.tutorialReplay = false;
  p.tutorialDistance = 0;
}

function skip(p) {
  if (!p) return { ok: false, reason: 'no_player' };
  if (p.tutorialComplete) return { ok: false, reason: 'already_complete' };
  p.tutorialSkipped = true;
  completeTutorial(p);
  // Modest bundle so a skipping player is not left with an empty pack.
  try { _addXp(p, 'hitpoints', 500); } catch (_) {}
  return { ok: true, message: 'Tutorial skipped. +500 hitpoints XP granted.' };
}

function replay(p) {
  if (!p) return { ok: false, reason: 'no_player' };
  p.tutorialStep = 0;
  p.tutorialComplete = false;
  p.tutorialDistance = 0;
  p.tutorialReplay = true;
  return { ok: true, message: 'Tutorial replay started. Rewards suppressed.' };
}

function status(p) {
  if (!p) return { active: false };
  const total = totalSteps();
  if (p.tutorialComplete) {
    return {
      active: false,
      complete: true,
      step: total,
      total,
      percent: 100,
      skipped: !!p.tutorialSkipped,
      replay: !!p.tutorialReplay,
    };
  }
  const step = currentStep(p);
  return {
    active: true,
    complete: false,
    step: p.tutorialStep,
    total,
    percent: Math.floor((p.tutorialStep / total) * 100),
    current: step ? { id: step.id, title: step.title, hint: step.hint } : null,
    replay: !!p.tutorialReplay,
  };
}

function progressBar(p, width = 24) {
  const s = status(p);
  const filled = Math.round(((s.step || 0) / (s.total || 1)) * width);
  const empty = Math.max(0, width - filled);
  return `[${'#'.repeat(filled)}${'-'.repeat(empty)}] ${s.step}/${s.total}`;
}

module.exports = {
  configure,
  initPlayer,
  currentStep,
  advanceStep,
  completeTutorial,
  hint,
  skip,
  replay,
  status,
  progressBar,
  totalSteps,
  matchTrigger,       // exported for tests
  applyReward,        // exported for tests
  STEPS: STEPS_MODULE.STEPS,
};
