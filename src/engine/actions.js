// ── Tick-Based Action System ───────────────────────────────────────────────────
// Actions take multiple ticks. Player is busy while performing.
// Used by gathering, processing, combat approach, etc.

const tick = require('./tick');

// Active actions: playerId → { type, ticksLeft, onTick, onComplete, onCancel, data }
const activeActions = new Map();

function start(player, opts) {
  cancel(player); // Cancel any existing action
  const action = {
    type: opts.type || 'action',
    ticksLeft: opts.ticks || 4,
    totalTicks: opts.ticks || 4,
    repeat: opts.repeat || false, // Keep doing after completion (e.g., fishing)
    onTick: opts.onTick || null, // Called each tick (return string to send message)
    onComplete: opts.onComplete, // Called when done (return string)
    onCancel: opts.onCancel || null,
    data: opts.data || {},
  };
  activeActions.set(player.id, action);
  player.busy = true;
  player.busyAction = action.type;
}

function cancel(player) {
  const action = activeActions.get(player.id);
  if (action) {
    if (action.onCancel) action.onCancel(player, action.data);
    activeActions.delete(player.id);
  }
  player.busy = false;
  player.busyAction = null;
}

function isActive(player) {
  return activeActions.has(player.id);
}

function getAction(player) {
  return activeActions.get(player.id);
}

// Called every game tick — processes all active actions
// Returns Map<playerId, message> for messages to send
function processTick() {
  const messages = new Map();

  for (const [playerId, action] of activeActions) {
    // Call onTick if defined
    if (action.onTick) {
      const msg = action.onTick(action.data, action.ticksLeft);
      if (msg) {
        const existing = messages.get(playerId) || [];
        existing.push(msg);
        messages.set(playerId, existing);
      }
    }

    action.ticksLeft--;

    if (action.ticksLeft <= 0) {
      const result = action.onComplete(action.data);
      if (result) {
        const existing = messages.get(playerId) || [];
        existing.push(result);
        messages.set(playerId, existing);
      }

      if (action.repeat && result !== false) {
        // Reset for another cycle
        action.ticksLeft = action.totalTicks;
      } else {
        activeActions.delete(playerId);
        // Player busy state cleared by caller (needs player ref)
      }
    }
  }

  return messages;
}

module.exports = { start, cancel, isActive, getAction, processTick, activeActions };
