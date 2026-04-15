#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// Tick System — ported from ScapeTests/tests/01-tick-system.md
//
// Exercises the core tick engine (src/engine/tick.js) without running real
// timers: processTick() is called synchronously, which is how every production
// test harness drives the engine.
//
// Mapping:
//   TEST-0101  → TICK_MS = 600 (base tick rate)
//   TEST-0111  → schedule() with last-input-wins key replacement
//   TEST-0112  → phase processing order matches OSRS
//   (helper)   → addDelayedAction / cancelDelayedAction
//   (helper)   → onTick / offTick (legacy handlers)
//   (helper)   → registerPhase / unregisterPhase
//
// Also exercises src/engine/actions.js (tick-based action queue).
//
// Run: node scripts/test-tick-system.js
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const { makeReporter, makePlayer, freshBreakpoint } = require('./test-helpers');

const tick = require('../src/engine/tick');
const actions = require('../src/engine/actions');

const r = makeReporter();

// ── TEST-0101: Base tick rate ────────────────────────────────────────────────
r.section('Tick constants (TEST-0101)');

r.eq(tick.TICK_MS, 600, 'TICK_MS = 600 (0.6 seconds, OSRS tick rate)');
r.eq(tick.PHASE_ORDER.length, 10, 'PHASE_ORDER has exactly 10 phases');

// Phase order must match OSRS processing.
r.eq(tick.PHASE_ORDER[0], 'preTick',       'phase 1: preTick');
r.eq(tick.PHASE_ORDER[1], 'npcTimers',     'phase 2: npcTimers');
r.eq(tick.PHASE_ORDER[2], 'npcMovement',   'phase 3: npcMovement');
r.eq(tick.PHASE_ORDER[3], 'npcAttacks',    'phase 4: npcAttacks');
r.eq(tick.PHASE_ORDER[4], 'projectiles',   'phase 5: projectiles');
r.eq(tick.PHASE_ORDER[5], 'playerTimers',  'phase 6: playerTimers');
r.eq(tick.PHASE_ORDER[6], 'playerMovement','phase 7: playerMovement');
r.eq(tick.PHASE_ORDER[7], 'playerAttacks', 'phase 8: playerAttacks');
r.eq(tick.PHASE_ORDER[8], 'midTick',       'phase 9: midTick');
r.eq(tick.PHASE_ORDER[9], 'postTick',      'phase 10: postTick');

// ── Tick counter advances on processTick ─────────────────────────────────────
r.section('processTick() increments the counter');

const startTick = tick.getTick();
tick.processTick();
r.eq(tick.getTick(), startTick + 1, 'tick counter increments by 1');
tick.processTick();
tick.processTick();
r.eq(tick.getTick(), startTick + 3, 'tick counter increments each call');

// ── Scheduled actions fire at the right tick ─────────────────────────────────
r.section('schedule() fires at the target tick');

let fired = 0;
let firedAtTick = -1;
const targetTick = tick.getTick() + 5;
tick.schedule(targetTick, 10, 'test-sched-1', () => {
  fired++;
  firedAtTick = tick.getTick();
});

// Advance 4 ticks — should not fire yet.
for (let i = 0; i < 4; i++) tick.processTick();
r.eq(fired, 0, 'not fired before targetTick');

tick.processTick(); // this is targetTick
r.eq(fired, 1, 'fired exactly once at target tick');
r.eq(firedAtTick, targetTick, 'fired when currentTick matched target');

// Does not fire again.
tick.processTick();
r.eq(fired, 1, 'scheduled action is one-shot');

// ── TEST-0111: Last-input-wins key replacement ──────────────────────────────
r.section('schedule() key replacement (TEST-0111 style)');

let winner = null;
tick.schedule(tick.getTick() + 2, 10, 'k1', () => { winner = 'first'; });
tick.schedule(tick.getTick() + 2, 10, 'k1', () => { winner = 'second'; });
tick.schedule(tick.getTick() + 2, 10, 'k1', () => { winner = 'third'; });

for (let i = 0; i < 3; i++) tick.processTick();
r.eq(winner, 'third', 'last schedule() with same key wins');

// Cancel works.
let cancelled = false;
tick.schedule(tick.getTick() + 2, 10, 'k2', () => { cancelled = true; });
const cancelResult = tick.cancelScheduled('k2');
r.eq(cancelResult, true, 'cancelScheduled returned true');
for (let i = 0; i < 3; i++) tick.processTick();
r.eq(cancelled, false, 'cancelled schedule did not fire');

// Cancel of unknown key returns false.
r.eq(tick.cancelScheduled('no-such-key'), false, 'cancelScheduled unknown key → false');

// ── Delayed actions (projectile-style) ───────────────────────────────────────
r.section('addDelayedAction() fires during projectiles phase');

let delayedFired = 0;
tick.addDelayedAction(tick.getTick() + 3, () => { delayedFired++; }, 'd1');
for (let i = 0; i < 2; i++) tick.processTick();
r.eq(delayedFired, 0, 'delayed action not fired early');
tick.processTick();
r.eq(delayedFired, 1, 'delayed action fired on target tick');
tick.processTick();
r.eq(delayedFired, 1, 'delayed action is one-shot');

// Cancel.
let delayedCancelled = false;
tick.addDelayedAction(tick.getTick() + 2, () => { delayedCancelled = true; }, 'd2');
r.eq(tick.cancelDelayedAction('d2'), true, 'cancelDelayedAction returned true');
for (let i = 0; i < 3; i++) tick.processTick();
r.eq(delayedCancelled, false, 'cancelled delayed action did not fire');

// ── onTick persistent handlers ───────────────────────────────────────────────
r.section('onTick() persistent handlers run every tick');

let persistentCount = 0;
tick.onTick('persist-1', () => { persistentCount++; });
for (let i = 0; i < 5; i++) tick.processTick();
r.eq(persistentCount, 5, 'persistent handler fired 5 times in 5 ticks');

// offTick removes it.
tick.offTick('persist-1');
const beforeOff = persistentCount;
for (let i = 0; i < 5; i++) tick.processTick();
r.eq(persistentCount, beforeOff, 'offTick stopped the handler');

// ── Phase registration ───────────────────────────────────────────────────────
r.section('registerPhase / unregisterPhase');

const phaseCounts = {
  preTick: 0, playerMovement: 0, postTick: 0,
};
tick.registerPhase('preTick',        'pt-a', () => { phaseCounts.preTick++; });
tick.registerPhase('playerMovement', 'pm-a', () => { phaseCounts.playerMovement++; });
tick.registerPhase('postTick',       'po-a', () => { phaseCounts.postTick++; });

for (let i = 0; i < 3; i++) tick.processTick();
r.eq(phaseCounts.preTick, 3,        'preTick phase handler fired 3 times');
r.eq(phaseCounts.playerMovement, 3, 'playerMovement phase handler fired 3 times');
r.eq(phaseCounts.postTick, 3,       'postTick phase handler fired 3 times');

tick.unregisterPhase('preTick',        'pt-a');
tick.unregisterPhase('playerMovement', 'pm-a');
tick.unregisterPhase('postTick',       'po-a');

const before = { ...phaseCounts };
for (let i = 0; i < 3; i++) tick.processTick();
r.eq(phaseCounts.preTick,        before.preTick,        'preTick handler unregistered');
r.eq(phaseCounts.playerMovement, before.playerMovement, 'playerMovement handler unregistered');
r.eq(phaseCounts.postTick,       before.postTick,       'postTick handler unregistered');

// Unknown phase throws.
r.throws(() => tick.registerPhase('not-a-phase', 'x', () => {}),
  /Unknown tick phase/, 'registerPhase throws on unknown phase');

// ── Phase order is observed ─────────────────────────────────────────────────
r.section('Phases execute in declared order within one tick');

const order = [];
tick.registerPhase('preTick',        'order-1', () => order.push('preTick'));
tick.registerPhase('playerMovement', 'order-2', () => order.push('playerMovement'));
tick.registerPhase('playerAttacks',  'order-3', () => order.push('playerAttacks'));
tick.registerPhase('postTick',       'order-4', () => order.push('postTick'));

tick.processTick();
r.eq(order[0], 'preTick',        'preTick first');
r.eq(order[1], 'playerMovement', 'playerMovement second');
r.eq(order[2], 'playerAttacks',  'playerAttacks third');
r.eq(order[3], 'postTick',       'postTick last');

// preTick < playerMovement < playerAttacks < postTick in the order array.
r.check('preTick index < playerMovement index',
  order.indexOf('preTick') < order.indexOf('playerMovement'));
r.check('playerMovement < playerAttacks',
  order.indexOf('playerMovement') < order.indexOf('playerAttacks'));
r.check('playerAttacks < postTick',
  order.indexOf('playerAttacks') < order.indexOf('postTick'));

tick.unregisterPhase('preTick',        'order-1');
tick.unregisterPhase('playerMovement', 'order-2');
tick.unregisterPhase('playerAttacks',  'order-3');
tick.unregisterPhase('postTick',       'order-4');

// ── Action queue integration (src/engine/actions.js) ────────────────────────
r.section('actions.start/cancel + processTick');

const actionP = makePlayer('ActionTester');
freshBreakpoint(actionP);

let completeFired = 0;
let lastResult = null;
actions.start(actionP, {
  type: 'chop',
  ticks: 3,
  onComplete: () => { completeFired++; return 'done chopping'; },
});

r.eq(actions.isActive(actionP), true, 'action is active');
r.eq(actionP.busy, true, 'player.busy = true during action');
r.eq(actionP.busyAction, 'chop', 'busyAction tag set to "chop"');

const messages1 = actions.processTick();
r.eq(completeFired, 0, 'action not complete after 1 tick');
const messages2 = actions.processTick();
r.eq(completeFired, 0, 'action not complete after 2 ticks');
const messages3 = actions.processTick();
r.eq(completeFired, 1, 'action completed on tick 3');
const msgs = messages3.get(actionP.id) || [];
r.check('onComplete message delivered',
  msgs.some(m => typeof m === 'string' && m.includes('done chopping')));

// Non-repeat action is removed after completion.
r.eq(actions.isActive(actionP), false, 'non-repeat action removed after completion');

// Cancel fires onCancel hook.
let cancelCbFired = 0;
actions.start(actionP, {
  type: 'fish',
  ticks: 10,
  onComplete: () => { return 'done'; },
  onCancel: () => { cancelCbFired++; },
});
r.eq(actions.isActive(actionP), true, 'fish action active');
actions.cancel(actionP);
r.eq(actions.isActive(actionP), false, 'cancel removes action');
r.eq(cancelCbFired, 1, 'onCancel callback fired');

// Repeat action continues after completion.
let repeatCount = 0;
actions.start(actionP, {
  type: 'loop',
  ticks: 2,
  repeat: true,
  onComplete: () => { repeatCount++; return null; },
});
for (let i = 0; i < 6; i++) actions.processTick();
r.eq(repeatCount, 3, 'repeat action completed 3 cycles in 6 ticks');
r.eq(actions.isActive(actionP), true, 'repeat action still active');

// Returning false from onComplete stops a repeat action.
actions.cancel(actionP);
let stopNext = false;
actions.start(actionP, {
  type: 'stopper',
  ticks: 1,
  repeat: true,
  onComplete: () => {
    if (stopNext) return false;
    stopNext = true;
    return 'continuing';
  },
});
actions.processTick(); // first completion — returns 'continuing', continues
actions.processTick(); // second completion — returns false, stops
r.eq(actions.isActive(actionP), false, 'returning false from onComplete stops a repeat');

// Starting a new action cancels any existing one.
let firstCancelled = 0;
actions.start(actionP, {
  type: 'first',
  ticks: 10,
  onComplete: () => {},
  onCancel: () => { firstCancelled++; },
});
actions.start(actionP, {
  type: 'second',
  ticks: 1,
  onComplete: () => {},
});
r.eq(firstCancelled, 1, 'starting new action cancelled previous one');
r.eq(actionP.busyAction, 'second', 'busyAction now "second"');
actions.cancel(actionP);

// ── Determinism smoke test ──────────────────────────────────────────────────
r.section('processTick is deterministic (no external state leak)');

const pA = makePlayer('A');
freshBreakpoint(pA);
let countA = 0;
tick.registerPhase('preTick', 'det-a', () => { countA++; });
for (let i = 0; i < 100; i++) tick.processTick();
tick.unregisterPhase('preTick', 'det-a');
r.eq(countA, 100, '100 ticks → 100 handler firings exactly');

// ── Summary ──────────────────────────────────────────────────────────────────
r.exit();
