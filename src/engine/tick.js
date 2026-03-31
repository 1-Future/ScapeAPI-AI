// ── Tick System (0.1) ─────────────────────────────────────────────────────────
// The heartbeat. 600ms per tick. All game actions happen on ticks.
// Priority: 0=movement, 1=player, 2=NPC, 3=world

const TICK_MS = 600;
let currentTick = 0;
const tickQueue = []; // { tick, priority, key, fn }
const tickHandlers = new Map(); // id → fn (run every tick)

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

function processTick() {
  currentTick++;
  // Run scheduled actions
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
  // Run persistent handlers
  for (const [id, fn] of tickHandlers) {
    try { fn(currentTick); } catch (e) { console.error(`[tick:${id}]`, e.message); }
  }
}

let tickInterval = null;
function startTicking() {
  if (tickInterval) return;
  tickInterval = setInterval(processTick, TICK_MS);
  console.log(`[tick] Running at ${TICK_MS}ms`);
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
};
