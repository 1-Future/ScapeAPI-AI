// ── Event System (0.5) ────────────────────────────────────────────────────────
// Pub/sub for game events. Decouples systems.

const handlers = new Map(); // event → [{ id, fn, priority }]

function on(event, id, fn, priority = 0) {
  if (!handlers.has(event)) handlers.set(event, []);
  const list = handlers.get(event);
  // Replace if same id exists
  const idx = list.findIndex(h => h.id === id);
  if (idx >= 0) list[idx] = { id, fn, priority };
  else list.push({ id, fn, priority });
  list.sort((a, b) => a.priority - b.priority);
}

function off(event, id) {
  const list = handlers.get(event);
  if (!list) return;
  const idx = list.findIndex(h => h.id === id);
  if (idx >= 0) list.splice(idx, 1);
}

function emit(event, data) {
  const list = handlers.get(event);
  if (!list) return;
  for (const h of list) {
    try { h.fn(data); } catch (e) { console.error(`[event:${event}:${h.id}]`, e.message); }
  }
}

module.exports = { on, off, emit };
