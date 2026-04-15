// ══════════════════════════════════════════════════════════════════════════════
// Training Runner — bridges relationship-registry training methods → engine
//
// Every method registered via rel.defineTrainingMethod has 8 abstract knobs
// expressed as hourly rates (xpPerHour, resourceOutput.produces[].perHour,
// inputs[].perHour). The runner converts those into per-tick drips:
//   - 6000 ticks/hour → each tick produces xpPerHour/6000 XP, etc.
//   - Fractional units accumulate in player.activeTraining; whole items
//     are emitted when the accumulator crosses 1.0
//   - Method stops when an input is depleted, inventory is full, or the
//     player exits the level range.
//
// This is the FIRST sub-system of the Engine Bridge (see ENGINE-BRIDGE-ROADMAP.md).
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const rel = require('../data/relationships');
const items = require('../data/items');
const player = require('../player/player');
const tick = require('./tick');
const actions = require('./actions');
const breakpoints = require('./breakpoint-runner');

const TICKS_PER_HOUR = 6000; // 600ms ticks

// ── Prerequisite check ────────────────────────────────────────────────────────
// Returns { ok, reason } so the caller can give the player a useful message.

function checkPrerequisites(p, method) {
  if (!method) return { ok: false, reason: 'unknown method' };

  const lvl = player.getLevel(p, method.skill);
  if (lvl < method.levelRange[0]) {
    return { ok: false, reason: `requires ${method.skill} level ${method.levelRange[0]}` };
  }
  if (lvl > method.levelRange[1]) {
    return { ok: false, reason: `your ${method.skill} level (${lvl}) exceeds this method's max (${method.levelRange[1]})` };
  }

  const pr = method.prerequisites || {};
  for (const [skill, req] of Object.entries(pr.skills || {})) {
    if (player.getLevel(p, skill) < req) {
      return { ok: false, reason: `requires ${skill} level ${req}` };
    }
  }
  for (const qId of (pr.quests || [])) {
    if (!p.questProgress?.[qId]?.complete) {
      return { ok: false, reason: `requires quest: ${qId}` };
    }
  }
  for (const item of (pr.items || [])) {
    const has = p.inventory?.some(s => s && (s.name === item.name || s.id === item.id));
    if (!has) return { ok: false, reason: `requires item: ${item.name || item.id}` };
  }

  return { ok: true };
}

// ── Resolve XP/hour to a flat number ──────────────────────────────────────────
// Methods may declare xpPerHour as a number OR a [low, high] range (depends on
// player attention). Use midpoint for the range case — the agent's "attention"
// modeling is out of scope for the runner.

function resolveXpPerHour(method) {
  const v = method.xpPerHour;
  if (Array.isArray(v)) return (v[0] + v[1]) / 2;
  return v || 0;
}

// ── Item lookup with graceful fallback ────────────────────────────────────────
// Some methods produce/consume items by display name only. If items.find()
// can't resolve, we keep the name and use a synthetic id so the inventory
// system can still stack and display them.

function resolveItem(name) {
  if (!name) return null;
  const def = items.find(name);
  if (def) return { id: def.id, name: def.name, stackable: def.stackable };
  return { id: null, name, stackable: false };
}

// ── Per-tick step ─────────────────────────────────────────────────────────────
// Called every tick the action is alive. Returns a string message when something
// notable happens (whole XP gained, item produced, depletion); otherwise null.

function step(p, method, sendFn) {
  const at = p.activeTraining;
  if (!at) return null;

  // ── XP ──
  const xpThisTick = resolveXpPerHour(method) / TICKS_PER_HOUR;
  at.xpAccum += xpThisTick;
  let leveledTo = null;
  if (at.xpAccum >= 1) {
    const whole = Math.floor(at.xpAccum);
    at.xpAccum -= whole;
    leveledTo = breakpoints.addXpWithBreakpoints(p, method.skill, whole);
    // burn-v2: forward any Construction XP to the housing progress ticker so
    // non-housing training methods visibly advance the player's house.
    if (method.skill === 'construction') {
      try {
        const housing = require('./housing');
        if (typeof housing.notifyConstructionXp === 'function') {
          housing.notifyConstructionXp(p, whole, { source: 'training_runner', methodId: method.id });
        }
      } catch (_) { /* housing unavailable */ }
    }
  }

  // Stop if player exceeded the method's max level
  const lvl = player.getLevel(p, method.skill);
  if (lvl > method.levelRange[1]) {
    return finish(p, sendFn, `Your ${method.skill} level outgrew this method.`);
  }

  // ── Inputs (consumption) ──
  const produces = (method.resourceOutput?.produces) || [];
  const inputs = method.inputs || [];

  for (const inp of inputs) {
    const key = inp.name;
    at.consumeAccum[key] = (at.consumeAccum[key] || 0) + (inp.perHour / TICKS_PER_HOUR);
    if (at.consumeAccum[key] >= 1) {
      const need = Math.floor(at.consumeAccum[key]);
      const ref = resolveItem(inp.name);
      if (ref.id == null) {
        // Unknown item — can't enforce consumption; treat as available (sim-style)
        at.consumeAccum[key] -= need;
      } else {
        const removed = player.invRemove(p, ref.id, need);
        at.consumeAccum[key] -= removed;
        if (removed < need) {
          return finish(p, sendFn, `Out of ${inp.name}. Training stopped.`);
        }
      }
    }
  }

  // ── Outputs (production) ──
  let producedMsg = null;
  for (const out of produces) {
    const key = out.name;
    at.produceAccum[key] = (at.produceAccum[key] || 0) + (out.perHour / TICKS_PER_HOUR);
    if (at.produceAccum[key] >= 1) {
      const want = Math.floor(at.produceAccum[key]);
      const ref = resolveItem(out.name);
      if (ref.id == null) {
        // Unknown item — drop on floor metaphorically (just decrement, no inv add)
        at.produceAccum[key] -= want;
      } else {
        const ok = player.invAdd(p, ref.id, ref.name, want, ref.stackable);
        if (!ok) {
          return finish(p, sendFn, `Inventory full. Training stopped.`);
        }
        at.produceAccum[key] -= want;
        producedMsg = `+${want} ${out.name}`;
      }
    }
  }

  // Surface notable events
  if (leveledTo) {
    return `${method.skill} level ${leveledTo}!${producedMsg ? ' ' + producedMsg : ''}`;
  }
  return null;
}

// ── Stop helper ───────────────────────────────────────────────────────────────

function finish(p, sendFn, message) {
  p.activeTraining = null;
  if (sendFn && message) sendFn(message);
  return false; // tells actions.processTick not to repeat
}

// ── Public API ────────────────────────────────────────────────────────────────

function start(p, methodId, sendFn) {
  const method = rel.getTrainingMethod(methodId);
  if (!method) return { ok: false, reason: `unknown method: ${methodId}` };

  const check = checkPrerequisites(p, method);
  if (!check.ok) return check;

  // Cancel any in-flight action
  if (actions.isActive(p)) actions.cancel(p);

  p.activeTraining = {
    methodId,
    startedTick: tick.getTick(),
    lastTick: tick.getTick(),
    xpAccum: 0,
    produceAccum: {},
    consumeAccum: {},
  };

  actions.start(p, {
    type: 'train',
    ticks: 1,
    repeat: true,
    onTick: () => null, // step runs in onComplete each tick (ticks: 1 + repeat = every tick)
    onComplete: () => {
      const m = rel.getTrainingMethod(p.activeTraining?.methodId);
      if (!m) return finish(p, sendFn, 'Training method vanished.');
      return step(p, m, sendFn);
    },
    onCancel: () => { p.activeTraining = null; },
  });

  return { ok: true, method };
}

function stop(p) {
  if (!p.activeTraining) return false;
  actions.cancel(p);
  p.activeTraining = null;
  return true;
}

function status(p) {
  if (!p.activeTraining) return null;
  const m = rel.getTrainingMethod(p.activeTraining.methodId);
  if (!m) return null;
  return {
    methodId: p.activeTraining.methodId,
    name: m.name,
    skill: m.skill,
    elapsedTicks: tick.getTick() - p.activeTraining.startedTick,
    xpPerHour: resolveXpPerHour(m),
  };
}

module.exports = { start, stop, status, checkPrerequisites };
