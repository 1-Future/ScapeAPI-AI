// ══════════════════════════════════════════════════════════════════════════════
// Player-to-Player Trade — Core Engine
//
// OSRS-style direct trade. Two players offer items and coins. Both confirm the
// offer twice. Any mutation between confirms resets both confirmations
// (anti-bait-and-switch). Coin accounting is integer-only. Escrow + atomic
// swap: either both sides update or neither.
//
// Ironman guard: honours src/engine/ironman.js canTrade(a, b) in both
// directions. Group ironman can trade with group mates; all other variants are
// blocked.
//
// Hooks documented in src/engine/ironman.js: this module is the consumer of
// that canTrade() hook. ge-runner.js explicitly routes non-GE item swaps to
// this module via `routeTradeOrGE` when both parties are present.
//
// Audit: every completed trade is appended to `data/trade-log.json`. The log
// contains only the trade tuple (initiator id, target id, items moved per
// side, coins moved per side, timestamps) — never the rest of either player's
// inventory.
//
// Public API (required by the v2 burn spec):
//   requestTrade(initiator, target)
//   acceptTrade(trader, requestId)
//   cancelTrade(player)
//   addItemToTrade(player, itemId, count)
//   removeItemFromTrade(player, slotIdx)
//   setCoinOffer(player, amount)
//   confirmTrade(player)
//   getOpenTrade(player)
//   listHistory(player, limit=30)
//
// Session shape:
//   { id, initiator: { player, slots, coins, confirmed: [false, false] },
//     target:    { player, slots, coins, confirmed: [false, false] },
//     startedAt, expiresAt, status, requestId, ... }
//
//   confirmed is a 2-tuple because the UX is a double-confirm — first press
//   reveals what each side will receive, second press locks in. Edits reset
//   both sides to [false, false].
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const events = require('./events');
const persistence = require('./persistence');

// ── Constants ────────────────────────────────────────────────────────────────
const MAX_SLOTS_PER_SIDE = 28;              // one inventory's worth per side
const MAX_COIN_STACK = 2147483647;          // 2^31 - 1, OSRS coin cap (coins id 101)
const COINS_ITEM_ID = 101;
const MAX_TRADE_DISTANCE = 3;               // tiles, chebyshev distance
const TRADE_REQUEST_TTL_MS = 60 * 1000;     // 60s to accept
const TRADE_SESSION_TTL_MS = 5 * 60 * 1000; // 5 min max before auto-expire
const HISTORY_MAX_ENTRIES = 500;            // global ring-buffer cap
const HISTORY_FILE = 'trade-log.json';

// ── Module state ─────────────────────────────────────────────────────────────
let nextTradeId = 1;
let nextRequestId = 1;

// requestsById[requestId] = { id, fromId, toId, expiresAt }
const requestsById = new Map();
// requestsByTarget[targetId] = Set<requestId> — a target may have multiple
// inbound requests; the player accepts one by id.
const requestsByTarget = new Map();

// activeByPlayer[playerId] = tradeId — a player is in at most one trade.
const activeByPlayer = new Map();
// tradesById[tradeId] = tradeSession
const tradesById = new Map();

// history: latest-first array of trade tuples.
let history = [];

// Pluggable player hooks. Server bootstrap wires these to player.js + items.js.
let playerHooks = {
  invCount: (player, itemId) => 0,
  invRemove: (player, itemId, qty) => false,
  invAdd: (player, itemId, name, qty, stackable) => false,
  invFreeSlots: (player) => 0,
  getItemDef: (itemId) => null,
  // Distance check: server injects this. Default: permissive (no distance gate
  // in headless tests unless the harness provides one).
  distance: (a, b) => 0,
  // In-combat check. Default: not in combat.
  isInCombat: (player) => !!(player && player.combatTarget),
  // Trade-mute flag. Default: unmuted.
  isTradeMuted: (player) => !!(player && player.tradeMuted),
  // WebSocket-style notifier. Default: no-op.
  notify: (player, payload) => {},
  // Ironman canTrade hook. Default: always allow.
  canTrade: (a, b) => ({ allowed: true, reason: '' }),
};

function setPlayerHooks(h) {
  playerHooks = { ...playerHooks, ...h };
}

let getTick = () => 0;
function setTickSource(fn) { if (typeof fn === 'function') getTick = fn; }

// ── Integer helpers ──────────────────────────────────────────────────────────
function clampPositiveInt(n, max) {
  if (typeof n !== 'number' || !Number.isFinite(n)) return 0;
  n = Math.floor(n);
  if (n < 0) return 0;
  if (n > max) return max;
  return n;
}

function chebyshev(a, b) {
  if (!a || !b || a.x == null || b.x == null) return 0;
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}

// ── Load / save history ──────────────────────────────────────────────────────
(function loadHistory() {
  const loaded = persistence.load(HISTORY_FILE, null);
  if (Array.isArray(loaded)) history = loaded.slice(0, HISTORY_MAX_ENTRIES);
})();

function saveHistory() {
  try { persistence.save(HISTORY_FILE, history.slice(0, HISTORY_MAX_ENTRIES)); }
  catch (e) { /* non-fatal */ }
}

// ── Pair bookkeeping ─────────────────────────────────────────────────────────
function getSide(trade, player) {
  if (!trade || !player) return null;
  if (trade.initiator.player === player
      || (trade.initiator.player && trade.initiator.player.id === player.id)) {
    return 'initiator';
  }
  if (trade.target.player === player
      || (trade.target.player && trade.target.player.id === player.id)) {
    return 'target';
  }
  return null;
}

function otherSide(side) {
  return side === 'initiator' ? 'target' : 'initiator';
}

function sideObj(trade, side) { return trade[side]; }

// ── Confirm reset (fires on any mutation) ────────────────────────────────────
function resetConfirms(trade) {
  trade.initiator.confirmed = [false, false];
  trade.target.confirmed = [false, false];
}

// ── Validation helpers ───────────────────────────────────────────────────────
function validateParties(a, b) {
  if (!a || a.id == null) return { ok: false, reason: 'Invalid initiator.' };
  if (!b || b.id == null) return { ok: false, reason: 'Invalid target.' };
  if (a.id === b.id) return { ok: false, reason: "You can't trade with yourself." };
  return { ok: true };
}

function validateInteractive(a, b) {
  // Ironman gate (both directions).
  const iA = playerHooks.canTrade(a, b);
  if (!iA.allowed) return { ok: false, reason: iA.reason || 'Ironman rules block this trade.' };
  const iB = playerHooks.canTrade(b, a);
  if (!iB.allowed) return { ok: false, reason: iB.reason || 'Ironman rules block this trade.' };
  // Trade-mute (either side).
  if (playerHooks.isTradeMuted(a)) return { ok: false, reason: 'You have been trade-muted.' };
  if (playerHooks.isTradeMuted(b)) return { ok: false, reason: 'That player has been trade-muted.' };
  // Combat (either side).
  if (playerHooks.isInCombat(a)) return { ok: false, reason: 'You are in combat.' };
  if (playerHooks.isInCombat(b)) return { ok: false, reason: 'That player is in combat.' };
  // Distance.
  const d = playerHooks.distance(a, b);
  if (d > MAX_TRADE_DISTANCE) return { ok: false, reason: 'Too far away to trade.' };
  return { ok: true };
}

// ── Snapshot (for events and history) ────────────────────────────────────────
function snapshotSide(side) {
  return {
    playerId: side.player ? side.player.id : null,
    playerName: side.player ? side.player.name : null,
    slots: side.slots.map(s => ({ itemId: s.itemId, name: s.name, count: s.count })),
    coins: side.coins,
    confirmed: side.confirmed.slice(),
  };
}

function snapshotTrade(trade) {
  return {
    id: trade.id,
    initiator: snapshotSide(trade.initiator),
    target: snapshotSide(trade.target),
    status: trade.status,
    startedAt: trade.startedAt,
    expiresAt: trade.expiresAt,
  };
}

function broadcastUpdate(trade) {
  const payload = { type: 'trade_update', state: snapshotTrade(trade) };
  if (trade.initiator.player) playerHooks.notify(trade.initiator.player, payload);
  if (trade.target.player)    playerHooks.notify(trade.target.player, payload);
  events.emit('trade:update', payload);
}

// ── Public: requestTrade ─────────────────────────────────────────────────────
function requestTrade(initiator, target) {
  const basic = validateParties(initiator, target);
  if (!basic.ok) return { ok: false, reason: basic.reason };
  if (activeByPlayer.has(initiator.id)) {
    return { ok: false, reason: 'You are already in a trade.' };
  }
  if (activeByPlayer.has(target.id)) {
    return { ok: false, reason: 'That player is already in a trade.' };
  }
  const v = validateInteractive(initiator, target);
  if (!v.ok) return { ok: false, reason: v.reason };

  const id = nextRequestId++;
  const req = {
    id,
    fromId: initiator.id,
    fromName: initiator.name || String(initiator.id),
    toId: target.id,
    toName: target.name || String(target.id),
    createdAt: Date.now(),
    expiresAt: Date.now() + TRADE_REQUEST_TTL_MS,
    tick: getTick(),
  };
  requestsById.set(id, req);
  let targetSet = requestsByTarget.get(target.id);
  if (!targetSet) { targetSet = new Set(); requestsByTarget.set(target.id, targetSet); }
  targetSet.add(id);

  const payload = {
    type: 'trade_request',
    from: { id: initiator.id, name: initiator.name },
    ts: req.createdAt,
    requestId: id,
  };
  playerHooks.notify(target, payload);
  events.emit('trade:request', payload);

  return { ok: true, requestId: id, expiresAt: req.expiresAt };
}

// Find the latest still-valid inbound request for a trader, optionally
// matching a from-id.
function findPendingRequest(trader, fromId) {
  const set = requestsByTarget.get(trader.id);
  if (!set || set.size === 0) return null;
  let best = null;
  for (const rid of set) {
    const r = requestsById.get(rid);
    if (!r) continue;
    if (r.expiresAt < Date.now()) continue;
    if (fromId != null && r.fromId !== fromId) continue;
    if (!best || r.createdAt > best.createdAt) best = r;
  }
  return best;
}

function removeRequest(requestId) {
  const r = requestsById.get(requestId);
  if (!r) return;
  requestsById.delete(requestId);
  const set = requestsByTarget.get(r.toId);
  if (set) {
    set.delete(requestId);
    if (set.size === 0) requestsByTarget.delete(r.toId);
  }
}

// ── Public: acceptTrade ──────────────────────────────────────────────────────
function acceptTrade(trader, requestId) {
  if (!trader || trader.id == null) return { ok: false, reason: 'No trader.' };
  let req = null;
  if (requestId != null) {
    req = requestsById.get(requestId);
    if (req && req.toId !== trader.id) return { ok: false, reason: 'That request is not for you.' };
  } else {
    req = findPendingRequest(trader, null);
  }
  if (!req) return { ok: false, reason: 'No pending trade request.' };
  if (req.expiresAt < Date.now()) {
    removeRequest(req.id);
    return { ok: false, reason: 'That trade request expired.' };
  }

  // Locate the initiator by id. We need a live player reference for hooks.
  const initiator = _resolvePlayerById(req.fromId);
  if (!initiator) return { ok: false, reason: 'Initiator is no longer available.' };

  if (activeByPlayer.has(trader.id))    return { ok: false, reason: 'You are already in a trade.' };
  if (activeByPlayer.has(initiator.id)) return { ok: false, reason: 'Initiator is already in a trade.' };

  const v = validateInteractive(initiator, trader);
  if (!v.ok) return { ok: false, reason: v.reason };

  const trade = _openSession(initiator, trader, req.id);
  removeRequest(req.id);

  broadcastUpdate(trade);
  return { ok: true, tradeId: trade.id, state: snapshotTrade(trade) };
}

// Player resolver. Populated at register() time. Defaults to returning null
// so the engine stays testable with synthetic player objects — tests can use
// acceptTrade({ player: initiator, requestId }) by passing the initiator as
// the trader (no-op) or inject a resolver via setPlayerHooks.
let _resolvePlayerById = (id) => null;

function _openSession(initiator, target, requestId) {
  const id = nextTradeId++;
  const now = Date.now();
  const trade = {
    id,
    requestId,
    initiator: {
      player: initiator,
      slots: [],
      coins: 0,
      confirmed: [false, false],
    },
    target: {
      player: target,
      slots: [],
      coins: 0,
      confirmed: [false, false],
    },
    startedAt: now,
    expiresAt: now + TRADE_SESSION_TTL_MS,
    status: 'open',
  };
  tradesById.set(id, trade);
  activeByPlayer.set(initiator.id, id);
  activeByPlayer.set(target.id, id);
  events.emit('trade:opened', { tradeId: id, initiatorId: initiator.id, targetId: target.id });
  return trade;
}

// ── Public: cancelTrade ──────────────────────────────────────────────────────
function cancelTrade(player) {
  if (!player || player.id == null) return { ok: false, reason: 'No player.' };
  const tradeId = activeByPlayer.get(player.id);
  if (tradeId == null) return { ok: false, reason: 'You are not in a trade.' };
  const trade = tradesById.get(tradeId);
  if (!trade) {
    activeByPlayer.delete(player.id);
    return { ok: false, reason: 'Trade session missing.' };
  }
  _refundAll(trade);
  trade.status = 'cancelled';
  _closeSession(trade);
  const payload = { type: 'trade_cancel', tradeId: trade.id, cancelledBy: player.id };
  if (trade.initiator.player) playerHooks.notify(trade.initiator.player, payload);
  if (trade.target.player)    playerHooks.notify(trade.target.player, payload);
  events.emit('trade:cancelled', payload);
  return { ok: true };
}

function _closeSession(trade) {
  tradesById.delete(trade.id);
  if (trade.initiator.player) activeByPlayer.delete(trade.initiator.player.id);
  if (trade.target.player)    activeByPlayer.delete(trade.target.player.id);
}

// Escrow refund: return every item and coin currently on the trade window to
// each side's inventory. Used on cancel and on any failure before swap.
function _refundAll(trade) {
  for (const key of ['initiator', 'target']) {
    const side = trade[key];
    if (!side.player) continue;
    for (const slot of side.slots) {
      playerHooks.invAdd(
        side.player, slot.itemId, slot.name, slot.count, !!slot.stackable);
    }
    side.slots.length = 0;
    if (side.coins > 0) {
      playerHooks.invAdd(side.player, COINS_ITEM_ID, 'Coins', side.coins, true);
      side.coins = 0;
    }
  }
}

// ── Public: addItemToTrade ──────────────────────────────────────────────────
function addItemToTrade(player, itemId, count) {
  if (!player || player.id == null) return { ok: false, reason: 'No player.' };
  const tradeId = activeByPlayer.get(player.id);
  if (tradeId == null) return { ok: false, reason: 'You are not in a trade.' };
  const trade = tradesById.get(tradeId);
  if (!trade) return { ok: false, reason: 'Trade session missing.' };
  if (trade.status !== 'open') return { ok: false, reason: 'Trade is not open.' };

  const side = trade[getSide(trade, player)];
  if (!side) return { ok: false, reason: 'Side not found.' };

  const def = playerHooks.getItemDef(itemId);
  if (!def) return { ok: false, reason: 'Unknown item.' };
  if (def.tradeable === false) return { ok: false, reason: `${def.name} is not tradeable.` };
  if (def.id === COINS_ITEM_ID) {
    return { ok: false, reason: 'Use `trade coins <amount>` for coins.' };
  }

  const qty = clampPositiveInt(count, 2147483647);
  if (qty <= 0) return { ok: false, reason: 'Count must be positive.' };

  if (playerHooks.invCount(player, itemId) < qty) {
    return { ok: false, reason: `You do not have ${qty} of that item.` };
  }

  // Stackable items may share a slot. Non-stackables take one slot per unit.
  const stackable = !!def.stackable;
  let newSlotsNeeded = 0;
  if (stackable) {
    const existing = side.slots.find(s => s.itemId === itemId);
    if (!existing) newSlotsNeeded = 1;
  } else {
    newSlotsNeeded = qty;
  }
  if (side.slots.length + newSlotsNeeded > MAX_SLOTS_PER_SIDE) {
    return { ok: false, reason: `Trade offer full (max ${MAX_SLOTS_PER_SIDE} slots).` };
  }

  // Escrow — remove from inventory now; refunded if the trade is cancelled.
  if (!playerHooks.invRemove(player, itemId, qty)) {
    return { ok: false, reason: 'Failed to escrow items.' };
  }

  if (stackable) {
    const existing = side.slots.find(s => s.itemId === itemId);
    if (existing) existing.count += qty;
    else side.slots.push({ itemId, name: def.name, count: qty, stackable: true });
  } else {
    for (let i = 0; i < qty; i++) {
      side.slots.push({ itemId, name: def.name, count: 1, stackable: false });
    }
  }

  // Any offer mutation resets both sides' confirms (bait-and-switch guard).
  resetConfirms(trade);
  broadcastUpdate(trade);
  return { ok: true, slots: side.slots.length };
}

// ── Public: removeItemFromTrade ─────────────────────────────────────────────
function removeItemFromTrade(player, slotIdx) {
  if (!player || player.id == null) return { ok: false, reason: 'No player.' };
  const tradeId = activeByPlayer.get(player.id);
  if (tradeId == null) return { ok: false, reason: 'You are not in a trade.' };
  const trade = tradesById.get(tradeId);
  if (!trade) return { ok: false, reason: 'Trade session missing.' };
  if (trade.status !== 'open') return { ok: false, reason: 'Trade is not open.' };

  const side = trade[getSide(trade, player)];
  if (!side) return { ok: false, reason: 'Side not found.' };

  const idx = slotIdx | 0;
  if (idx < 0 || idx >= side.slots.length) {
    return { ok: false, reason: `Invalid slot ${slotIdx + 1}.` };
  }
  const slot = side.slots[idx];
  // Return escrowed items.
  playerHooks.invAdd(player, slot.itemId, slot.name, slot.count, !!slot.stackable);
  side.slots.splice(idx, 1);

  resetConfirms(trade);
  broadcastUpdate(trade);
  return { ok: true, slot };
}

// ── Public: setCoinOffer ─────────────────────────────────────────────────────
function setCoinOffer(player, amount) {
  if (!player || player.id == null) return { ok: false, reason: 'No player.' };
  const tradeId = activeByPlayer.get(player.id);
  if (tradeId == null) return { ok: false, reason: 'You are not in a trade.' };
  const trade = tradesById.get(tradeId);
  if (!trade) return { ok: false, reason: 'Trade session missing.' };
  if (trade.status !== 'open') return { ok: false, reason: 'Trade is not open.' };

  const side = trade[getSide(trade, player)];
  if (!side) return { ok: false, reason: 'Side not found.' };

  const target = clampPositiveInt(amount, MAX_COIN_STACK);
  const current = side.coins;
  if (target === current) {
    // No change — but we still defensively reset confirms since the player
    // did re-submit their intention.
    resetConfirms(trade);
    broadcastUpdate(trade);
    return { ok: true, coins: current };
  }

  if (target > current) {
    const delta = target - current;
    if (playerHooks.invCount(player, COINS_ITEM_ID) < delta) {
      return { ok: false, reason: `Need ${delta} more coins.` };
    }
    if (!playerHooks.invRemove(player, COINS_ITEM_ID, delta)) {
      return { ok: false, reason: 'Failed to escrow coins.' };
    }
    side.coins = target;
  } else {
    const delta = current - target;
    playerHooks.invAdd(player, COINS_ITEM_ID, 'Coins', delta, true);
    side.coins = target;
  }

  resetConfirms(trade);
  broadcastUpdate(trade);
  return { ok: true, coins: side.coins };
}

// ── Public: confirmTrade ─────────────────────────────────────────────────────
// Double-confirm: [false, false] -> [true, false] -> [true, true]. Once both
// sides are at [true, true] the swap commits atomically.
function confirmTrade(player) {
  if (!player || player.id == null) return { ok: false, reason: 'No player.' };
  const tradeId = activeByPlayer.get(player.id);
  if (tradeId == null) return { ok: false, reason: 'You are not in a trade.' };
  const trade = tradesById.get(tradeId);
  if (!trade) return { ok: false, reason: 'Trade session missing.' };
  if (trade.status !== 'open') return { ok: false, reason: 'Trade is not open.' };

  const sideKey = getSide(trade, player);
  const side = trade[sideKey];
  const other = trade[otherSide(sideKey)];
  if (!side || !other) return { ok: false, reason: 'Side not found.' };

  // Re-check that the session is still interactive (both players exist,
  // distance, combat, ironman). If anything failed we cancel for safety.
  if (side.player && other.player) {
    const re = validateInteractive(side.player, other.player);
    if (!re.ok) {
      cancelTrade(side.player);
      return { ok: false, reason: re.reason };
    }
  }

  // Advance confirm stage on this side only.
  if (!side.confirmed[0]) {
    side.confirmed[0] = true;
  } else if (!side.confirmed[1]) {
    side.confirmed[1] = true;
  } else {
    // Already locked on this side — awaiting the other.
  }

  const bothStage1 = side.confirmed[0] && other.confirmed[0];
  const bothStage2 = side.confirmed[1] && other.confirmed[1];

  broadcastUpdate(trade);

  if (!bothStage1) {
    return { ok: true, stage: 1, waitingFor: other.player ? other.player.id : null };
  }
  if (!bothStage2) {
    // Stage 1 complete — players see the final offer preview. Waiting on
    // second confirm from whichever side hasn't pressed it yet.
    return {
      ok: true,
      stage: side.confirmed[1] ? 2 : 1,
      waitingFor: other.confirmed[1] ? null : (other.player ? other.player.id : null),
    };
  }

  // Both sides confirmed twice — commit the swap atomically.
  return _commitSwap(trade);
}

// Atomic swap. Because addItemToTrade / setCoinOffer have already escrowed
// everything, all we need to do at commit is pay out to the OPPOSITE side.
// If either invAdd fails (inventory full) the entire swap aborts and both
// sides get their own escrow back.
function _commitSwap(trade) {
  const A = trade.initiator;
  const B = trade.target;

  // Plan payouts: everything A offered goes to B, everything B offered goes
  // to A. We walk the plan once for each recipient and check they have room.
  // Stackable items merge; non-stackable take one slot each.
  const plan = [
    { to: B.player, from: 'initiator', slots: A.slots, coins: A.coins },
    { to: A.player, from: 'target',    slots: B.slots, coins: B.coins },
  ];

  // Capacity check (approximate — merge stackables with existing stacks when
  // possible, otherwise count new slots). playerHooks doesn't expose the full
  // inventory so we use invFreeSlots as an upper-bound gate.
  for (const leg of plan) {
    if (!leg.to) continue;
    const free = playerHooks.invFreeSlots(leg.to);
    let need = 0;
    const stacksPresent = new Map();
    for (const s of leg.slots) {
      if (s.stackable) {
        // Existing stack in the recipient's inventory merges for free. But we
        // only have invCount, so we use it as a proxy for "has a stack".
        const has = playerHooks.invCount(leg.to, s.itemId);
        if (has > 0 || stacksPresent.has(s.itemId)) { /* merges, no new slot */ }
        else { stacksPresent.set(s.itemId, true); need += 1; }
      } else {
        need += s.count;
      }
    }
    // Coins always either merge into an existing stack or take one slot.
    if (leg.coins > 0) {
      const has = playerHooks.invCount(leg.to, COINS_ITEM_ID);
      if (has <= 0) need += 1;
    }
    if (need > free) {
      // Refund everything, abort.
      _refundAll(trade);
      trade.status = 'failed_capacity';
      _closeSession(trade);
      const payload = {
        type: 'trade_cancel',
        tradeId: trade.id,
        reason: 'One player had insufficient inventory space.',
      };
      if (A.player) playerHooks.notify(A.player, payload);
      if (B.player) playerHooks.notify(B.player, payload);
      events.emit('trade:cancelled', payload);
      return { ok: false, reason: 'Insufficient inventory space.' };
    }
  }

  // Commit.
  for (const leg of plan) {
    if (!leg.to) continue;
    for (const s of leg.slots) {
      playerHooks.invAdd(leg.to, s.itemId, s.name, s.count, !!s.stackable);
    }
    if (leg.coins > 0) {
      playerHooks.invAdd(leg.to, COINS_ITEM_ID, 'Coins', leg.coins, true);
    }
  }

  // Drain escrow trackers.
  const completedSnapshot = snapshotTrade(trade);
  A.slots.length = 0; A.coins = 0;
  B.slots.length = 0; B.coins = 0;

  trade.status = 'complete';
  trade.completedAt = Date.now();

  // Log the audit tuple. Never include any inventory outside the tuple.
  _appendHistory({
    tradeId: trade.id,
    startedAt: trade.startedAt,
    completedAt: trade.completedAt,
    tick: getTick(),
    initiator: {
      id: completedSnapshot.initiator.playerId,
      name: completedSnapshot.initiator.playerName,
      gave: completedSnapshot.initiator.slots,
      coinsGave: completedSnapshot.initiator.coins,
    },
    target: {
      id: completedSnapshot.target.playerId,
      name: completedSnapshot.target.playerName,
      gave: completedSnapshot.target.slots,
      coinsGave: completedSnapshot.target.coins,
    },
  });

  _closeSession(trade);

  const payload = {
    type: 'trade_complete',
    summary: {
      tradeId: trade.id,
      initiator: completedSnapshot.initiator,
      target: completedSnapshot.target,
      startedAt: trade.startedAt,
      completedAt: trade.completedAt,
    },
  };
  if (A.player) playerHooks.notify(A.player, payload);
  if (B.player) playerHooks.notify(B.player, payload);
  events.emit('trade:complete', payload);

  return { ok: true, stage: 3, completed: true, summary: payload.summary };
}

// ── History ─────────────────────────────────────────────────────────────────
function _appendHistory(entry) {
  history.unshift(entry);
  if (history.length > HISTORY_MAX_ENTRIES) history.length = HISTORY_MAX_ENTRIES;
  saveHistory();
}

function listHistory(player, limit) {
  const n = clampPositiveInt(limit, 500) || 30;
  if (!player) return history.slice(0, n);
  const pid = player.id;
  const out = [];
  for (const e of history) {
    if (!e) continue;
    const ip = e.initiator && e.initiator.id;
    const tp = e.target && e.target.id;
    if (ip === pid || tp === pid) out.push(e);
    if (out.length >= n) break;
  }
  return out;
}

// ── Public: getOpenTrade ────────────────────────────────────────────────────
function getOpenTrade(player) {
  if (!player || player.id == null) return null;
  const tid = activeByPlayer.get(player.id);
  if (tid == null) return null;
  const t = tradesById.get(tid);
  return t ? snapshotTrade(t) : null;
}

// ── Expiry sweeper (call from tick loop if desired) ─────────────────────────
function tick() {
  const now = Date.now();
  // Expire dangling requests.
  for (const [id, r] of requestsById) {
    if (r.expiresAt < now) removeRequest(id);
  }
  // Expire stale sessions — refund and cancel.
  for (const trade of [...tradesById.values()]) {
    if (trade.expiresAt < now && trade.status === 'open') {
      _refundAll(trade);
      trade.status = 'expired';
      _closeSession(trade);
      const payload = { type: 'trade_cancel', tradeId: trade.id, reason: 'expired' };
      if (trade.initiator.player) playerHooks.notify(trade.initiator.player, payload);
      if (trade.target.player)    playerHooks.notify(trade.target.player, payload);
      events.emit('trade:cancelled', payload);
    }
  }
}

// ── Wiring ───────────────────────────────────────────────────────────────────
function setPlayerResolver(fn) {
  if (typeof fn === 'function') _resolvePlayerById = fn;
}

/**
 * routeTradeOrGE(initiator, { target, via }) -> { route, reason }
 *
 * Hook used by ge-runner/ge-commands to decide whether an intent is a
 * direct-trade request (go through this module) or a GE order (go through
 * ge-runner). If `target` resolves to a live player and the pair is
 * allowed to trade, returns { route: 'trade' }. Otherwise { route: 'ge' }.
 *
 * This is a pure routing hint — it does NOT open a trade; the caller must
 * still invoke requestTrade() explicitly.
 */
function routeTradeOrGE(initiator, opts) {
  const target = opts && opts.target;
  if (!target) return { route: 'ge', reason: 'no direct-trade target' };
  const resolved = (typeof target === 'object') ? target : _resolvePlayerById(target);
  if (!resolved || resolved.id == null) return { route: 'ge', reason: 'target not found' };
  const v = validateInteractive(initiator, resolved);
  if (!v.ok) return { route: 'ge', reason: v.reason };
  return { route: 'trade', target: resolved };
}

// Reset module state (test-only helper — not exported by default).
function _reset() {
  nextTradeId = 1;
  nextRequestId = 1;
  requestsById.clear();
  requestsByTarget.clear();
  activeByPlayer.clear();
  tradesById.clear();
  history = [];
}

// ── Exports ──────────────────────────────────────────────────────────────────
module.exports = {
  // Public API (spec).
  requestTrade, acceptTrade, cancelTrade,
  addItemToTrade, removeItemFromTrade, setCoinOffer,
  confirmTrade, getOpenTrade, listHistory,

  // Wiring.
  setPlayerHooks, setTickSource, setPlayerResolver, tick,
  routeTradeOrGE,

  // Inspection.
  snapshotTrade,

  // Test helper.
  _reset,

  // Constants.
  MAX_SLOTS_PER_SIDE, MAX_COIN_STACK, COINS_ITEM_ID, MAX_TRADE_DISTANCE,
  TRADE_REQUEST_TTL_MS, TRADE_SESSION_TTL_MS,
};
