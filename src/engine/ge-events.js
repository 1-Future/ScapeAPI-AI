// ── Grand Exchange — WebSocket Event Wiring ──────────────────────────────────
// Subscribes to ge-runner internal events and routes them to the correct
// player's WebSocket connection. Privacy: no global broadcast — GE activity is
// always private to the buyer and seller.
//
// Event channels (sent as JSON {type, ...payload} over the player's socket):
//   ge:offer_placed    {offer}                       // confirmation echo
//   ge:partial_match   {offer, trade}                // partial fill
//   ge:complete        {offer, trade}                // final fill
//   ge:cancelled       {offer, refund}               // cancel ack
//
// Usage in server.js:
//   const geEvents = require('./engine/ge-events');
//   geEvents.attach({ socketFor: (playerId) => sockets.get(playerId), send });
// Then ge-runner emits will be routed to the right player.

'use strict';

const events = require('./events');

// Default routing functions (no-ops until wired).
let socketFor = (_playerId) => null;
let sender = (ws, payload) => {
  if (!ws) return;
  try {
    if (typeof ws.send === 'function') ws.send(JSON.stringify(payload));
  } catch (_) { /* swallow — broken socket */ }
};

function dispatch(type, ev) {
  // Buyer or seller — figure out which player should be notified.
  // For offer_placed and cancelled: the `player` carries the recipient.
  // For partial_match / complete: the `offer.playerId` is the recipient.
  let recipientId = null;
  if (ev.player && ev.player.id != null) recipientId = ev.player.id;
  else if (ev.offer && ev.offer.playerId != null) recipientId = ev.offer.playerId;
  if (recipientId == null) return;
  const ws = socketFor(recipientId);
  if (!ws) return;
  sender(ws, { type, ...ev });
}

function attach(opts) {
  if (opts && typeof opts.socketFor === 'function') socketFor = opts.socketFor;
  if (opts && typeof opts.send === 'function') sender = opts.send;

  events.on('ge:offer_placed', 'ge-events',  ev => dispatch('ge:offer_placed', ev));
  events.on('ge:partial_match', 'ge-events', ev => dispatch('ge:partial_match', ev));
  events.on('ge:complete', 'ge-events',      ev => dispatch('ge:complete', ev));
  events.on('ge:cancelled', 'ge-events',     ev => dispatch('ge:cancelled', ev));
}

function detach() {
  events.off('ge:offer_placed', 'ge-events');
  events.off('ge:partial_match', 'ge-events');
  events.off('ge:complete', 'ge-events');
  events.off('ge:cancelled', 'ge-events');
}

module.exports = { attach, detach };
