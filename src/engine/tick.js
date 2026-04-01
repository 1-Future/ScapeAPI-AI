// ── Tick System (0.1) ─────────────────────────────────────────────────────────
// The heartbeat. 600ms per tick. OSRS-accurate processing order:
// 1. NPC timers → 2. NPC movement → 3. NPC attacks →
// 4. Projectiles land → 5. Player timers → 6. Player movement →
// 7. Player attacks → 8. Delayed actions → 9. Dead cleanup

const TICK_MS = 600;
let currentTick = 0;

// ── Scheduled actions (backwards-compatible) ──
const tickQueue = []; // { tick, priority, key, fn }
const tickHandlers = new Map(); // id → fn (run every tick)

// ── OSRS tick phases ──
// Each phase is a Set of handler functions called in order each tick.
// Systems register into the appropriate phase.
const phases = {
  preTick: new Map(),       // Prayer drain, status effects, timers
  npcTimers: new Map(),     // NPC cooldown decrements
  npcMovement: new Map(),   // NPC pathfinding/movement
  npcAttacks: new Map(),    // NPC attack execution
  projectiles: new Map(),   // Projectile flight + landing (prayer check here)
  playerTimers: new Map(),  // Player cooldown decrements, regen
  playerMovement: new Map(),// Player walking/running
  playerAttacks: new Map(), // Player attack execution
  midTick: new Map(),       // Mid-tick processing (delayed actions, etc.)
  postTick: new Map(),      // Dead cleanup, ground item despawn, XP drops
};

const PHASE_ORDER = [
  'preTick', 'npcTimers', 'npcMovement', 'npcAttacks',
  'projectiles',
  'playerTimers', 'playerMovement', 'playerAttacks',
  'midTick', 'postTick',
];

function registerPhase(phase, id, fn) {
  if (!phases[phase]) throw new Error(`Unknown tick phase: ${phase}`);
  phases[phase].set(id, fn);
}

function unregisterPhase(phase, id) {
  if (phases[phase]) phases[phase].delete(id);
}

// ── Legacy API (backwards-compatible) ──
function schedule(atTick, priority, key, fn) {
  if (key) {
    for (let i = tickQueue.length - 1; i >= 0; i--) {
      if (tickQueue[i].key === key) { tickQueue.splice(i, 1); break; }
    }
  }
  tickQueue.push({ tick: atTick, priority, key, fn });
}

function cancelScheduled(key) {
  for (let i = tickQueue.length - 1; i >= 0; i--) {
    if (tickQueue[i].key === key) { tickQueue.splice(i, 1); return true; }
  }
  return false;
}

function onTick(id, fn) { tickHandlers.set(id, fn); }
function offTick(id) { tickHandlers.delete(id); }

// ── Delayed Actions ──
// Actions that fire on a specific tick (e.g., projectile damage after N ticks)
const delayedActions = []; // { tick, fn, key? }

function addDelayedAction(atTick, fn, key) {
  if (key) {
    for (let i = delayedActions.length - 1; i >= 0; i--) {
      if (delayedActions[i].key === key) { delayedActions.splice(i, 1); break; }
    }
  }
  delayedActions.push({ tick: atTick, fn, key });
}

function cancelDelayedAction(key) {
  for (let i = delayedActions.length - 1; i >= 0; i--) {
    if (delayedActions[i].key === key) { delayedActions.splice(i, 1); return true; }
  }
  return false;
}

// ── Main tick processor ──
function processTick() {
  currentTick++;

  // Run OSRS-accurate phase order
  for (const phaseName of PHASE_ORDER) {
    const handlers = phases[phaseName];
    for (const [id, fn] of handlers) {
      try { fn(currentTick); } catch (e) { console.error(`[tick:${phaseName}:${id}]`, e.message); }
    }

    // Process delayed actions during the projectiles phase
    if (phaseName === 'projectiles') {
      for (let i = delayedActions.length - 1; i >= 0; i--) {
        if (delayedActions[i].tick <= currentTick) {
          const action = delayedActions.splice(i, 1)[0];
          try { action.fn(currentTick); } catch (e) { console.error(`[tick:delayed]`, e.message); }
        }
      }
    }
  }

  // Run legacy scheduled actions (sorted by priority)
  const due = [];
  for (let i = tickQueue.length - 1; i >= 0; i--) {
    if (tickQueue[i].tick <= currentTick) {
      due.push(tickQueue[i]);
      tickQueue.splice(i, 1);
    }
  }
  due.sort((a, b) => a.priority - b.priority);
  for (const action of due) {
    try { action.fn(); } catch (e) { console.error(`[tick] Error:`, e.message); }
  }

  // Run persistent handlers (legacy)
  for (const [id, fn] of tickHandlers) {
    try { fn(currentTick); } catch (e) { console.error(`[tick:${id}]`, e.message); }
  }
}

let tickInterval = null;
function startTicking() {
  if (tickInterval) return;
  tickInterval = setInterval(processTick, TICK_MS);
  console.log(`[tick] Running at ${TICK_MS}ms — OSRS-accurate phase order`);
}
function stopTicking() {
  if (tickInterval) { clearInterval(tickInterval); tickInterval = null; }
}

module.exports = {
  TICK_MS,
  getTick: () => currentTick,
  schedule, cancelScheduled,
  onTick, offTick,
  startTicking, stopTicking,
  // New OSRS-accurate API
  registerPhase, unregisterPhase,
  addDelayedAction, cancelDelayedAction,
  PHASE_ORDER, phases,
};
