// ── Grand Exchange — Chat Commands ───────────────────────────────────────────
// Player-facing command handlers for the GE. Wires the runner to the chat
// command system without modifying src/commands/all.js or src/server.js.
//
// Usage from the main server bootstrap (do NOT edit this from the test path —
// the server is expected to call register() once on startup):
//
//   const geCommands = require('./engine/ge-commands');
//   geCommands.register({
//     commands,                    // src/engine/commands.js
//     items,                       // src/data/items.js
//     shops,                       // src/data/shops.js (optional, for guide-price seed)
//     invAdd, invRemove, invCount, // inventory hooks (from server bootstrap)
//   });
//
// Commands installed:
//   /ge buy <item> <qty> <price>
//   /ge sell <item> <qty> <price>
//   /ge status
//   /ge cancel <slot>
//   /ge market <item>
//   /ge collect <slot>           // bonus — collect filled offer payouts
//
// Slots are 1-6 (matches OSRS UI) and map to the player's active offer list.

'use strict';

const ge = require('./ge-runner');

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmtCoins(n) {
  if (n >= 10_000_000) return `${Math.floor(n / 1_000_000)}M`;
  if (n >= 100_000)    return `${Math.floor(n / 1_000)}K`;
  return String(n);
}

function findItemFlexible(items, query) {
  // 1) exact name match.
  const exact = items.find(query);
  if (exact) return exact;
  // 2) numeric id.
  const id = parseInt(query, 10);
  if (!isNaN(id)) {
    const def = items.get(id);
    if (def) return def;
  }
  // 3) substring match — pick shortest name to disambiguate.
  if (typeof items.search === 'function') {
    const matches = items.search(query);
    if (matches.length === 1) return matches[0];
    if (matches.length > 1) {
      matches.sort((a, b) => a.name.length - b.name.length);
      return matches[0];
    }
  }
  return null;
}

// Parse `/ge buy bronze sword 5 100` => name="bronze sword" qty=5 price=100.
// The last two args must be integers.
function parseTradeArgs(args) {
  if (args.length < 3) return { ok: false, error: 'Need item, quantity, and price.' };
  const price = parseInt(args[args.length - 1], 10);
  const qty   = parseInt(args[args.length - 2], 10);
  if (isNaN(price) || isNaN(qty)) return { ok: false, error: 'Quantity and price must be integers.' };
  if (qty <= 0 || price <= 0)     return { ok: false, error: 'Quantity and price must be positive.' };
  const name = args.slice(0, -2).join(' ').trim();
  if (!name) return { ok: false, error: 'Need an item name.' };
  return { ok: true, name, qty, price };
}

// ── register({ commands, items, shops, invAdd, invRemove, invCount }) ───────
function register(opts) {
  const commands = opts && opts.commands;
  const items = opts && opts.items;
  if (!commands) throw new Error('ge-commands.register: commands module required');
  if (!items)    throw new Error('ge-commands.register: items module required');

  // Wire the runner to game state.
  ge.setItemRegistry(items);
  ge.setPlayerHooks({
    invCount:  opts.invCount  || ((p, id)              => 0),
    invRemove: opts.invRemove || ((p, id, qty)         => false),
    invAdd:    opts.invAdd    || ((p, id, n, q, st)    => false),
  });
  // Seed guide prices from item.value, optionally overlaid by shop sell prices.
  ge.seedGuidePricesFromItems(items, opts.shops || null);

  // Ironman gate: every placeOffer() call runs through canUseGE first, so
  // ironmen get a clear rejection instead of a silent accept. Lazy-required
  // to avoid circular deps; safe no-op if the ironman module isn't present.
  try {
    const ironman = require('./ironman');
    if (ironman && typeof ironman.installGEHook === 'function') {
      ironman.installGEHook(ge);
    }
  } catch (_) { /* ironman not wired — fine */ }

  // ── /ge ─────────────────────────────────────────────────────────────────
  commands.register('ge', {
    help: 'Grand Exchange: ge buy/sell/status/cancel/market/collect',
    category: 'Economy',
    fn: (p, args) => {
      const sub = (args[0] || '').toLowerCase();

      // ── /ge buy <item> <qty> <price> ─────────────────────────────────────
      if (sub === 'buy' || sub === 'sell') {
        const parsed = parseTradeArgs(args.slice(1));
        if (!parsed.ok) return `Usage: ge ${sub} <item> <quantity> <price>. ${parsed.error}`;
        const def = findItemFlexible(items, parsed.name);
        if (!def) return `Unknown item: "${parsed.name}".`;
        const result = ge.placeOffer(p, {
          side: sub, itemId: def.id, qty: parsed.qty, price: parsed.price,
        });
        if (!result.ok) return result.error;
        const o = result.offer;
        let msg = `${sub === 'buy' ? 'Buy' : 'Sell'} offer placed: ${o.qty}x ${def.name} @ ${o.price} ea`;
        if (o.filled > 0) msg += `\n  Instantly matched ${o.filled}/${o.qty} — collect with: ge collect ${slotIndexOf(p, o.id) + 1}`;
        return msg;
      }

      // ── /ge status ───────────────────────────────────────────────────────
      if (sub === 'status' || sub === 'offers' || !sub) {
        const st = ge.status(p);
        const lines = ['── Grand Exchange ──'];
        for (let i = 0; i < st.slots.length; i++) {
          const o = st.slots[i];
          if (!o) { lines.push(`  [${i + 1}] empty`); continue; }
          let line = `  [${i + 1}] ${o.side.toUpperCase()} ${o.qty}x ${o.itemName} @ ${o.price}ea — ${o.filled}/${o.qty}`;
          if (o.pendingItems > 0 || o.pendingCoins > 0) {
            const bits = [];
            if (o.pendingItems > 0) bits.push(`${o.pendingItems} items`);
            if (o.pendingCoins > 0) bits.push(`${fmtCoins(o.pendingCoins)} coins`);
            line += ` | collect: ${bits.join(', ')}`;
          }
          if (o.status !== 'open') line += ` [${o.status}]`;
          lines.push(line);
        }
        lines.push('Commands: ge buy/sell <item> <qty> <price>, ge cancel <slot>, ge collect <slot>, ge market <item>');
        return lines.join('\n');
      }

      // ── /ge cancel <slot> ────────────────────────────────────────────────
      if (sub === 'cancel') {
        const slot = parseInt(args[1], 10);
        if (isNaN(slot) || slot < 1 || slot > ge.MAX_OFFERS_PER_PLAYER) {
          return `Usage: ge cancel <slot 1-${ge.MAX_OFFERS_PER_PLAYER}>`;
        }
        const offer = offerInSlot(p, slot - 1);
        if (!offer) return `Slot ${slot} is empty.`;
        const result = ge.cancelOffer(p, offer.id);
        if (!result.ok) return result.error;
        const r = result.refund;
        const bits = [];
        if (r.items > 0) bits.push(`${r.items}x ${r.itemName}`);
        if (r.coins > 0) bits.push(`${r.coins} coins`);
        return `Cancelled slot ${slot}. Refunded: ${bits.join(', ') || 'nothing'}`;
      }

      // ── /ge collect <slot> ───────────────────────────────────────────────
      if (sub === 'collect') {
        const slot = parseInt(args[1], 10);
        if (isNaN(slot) || slot < 1 || slot > ge.MAX_OFFERS_PER_PLAYER) {
          return `Usage: ge collect <slot 1-${ge.MAX_OFFERS_PER_PLAYER}>`;
        }
        const offer = offerInSlot(p, slot - 1);
        if (!offer) return `Slot ${slot} is empty.`;
        const result = ge.collectOffer(p, offer.id);
        if (!result.ok) return result.error;
        const bits = [];
        if (result.refund.items > 0) bits.push(`${result.refund.items}x ${result.refund.itemName}`);
        if (result.refund.coins > 0) bits.push(`${result.refund.coins} coins`);
        if (!bits.length) return `Nothing to collect from slot ${slot}.`;
        return `Collected: ${bits.join(', ')}`;
      }

      // ── /ge market <item> ────────────────────────────────────────────────
      if (sub === 'market' || sub === 'price') {
        const name = args.slice(1).join(' ');
        if (!name) return 'Usage: ge market <item>';
        const def = findItemFlexible(items, name);
        if (!def) return `Unknown item: "${name}".`;
        if (def.tradeable === false) return `${def.name} is not tradeable.`;
        const stats = ge.getMarketStats(def.id);
        const guide = stats.guidePrice != null ? `${stats.guidePrice}` : '(none)';
        const last  = stats.lastPrice  != null ? `${stats.lastPrice}`  : '(no trades)';
        const lo    = stats.low        != null ? `${stats.low}`        : '-';
        const hi    = stats.high       != null ? `${stats.high}`       : '-';
        const med   = stats.medianPrice!= null ? `${stats.medianPrice}`: '-';
        return [
          `── ${def.name} ──`,
          `  Guide:   ${guide}`,
          `  Last:    ${last}`,
          `  24h Low: ${lo}     24h High: ${hi}     Median: ${med}     Vol: ${stats.vol24h}`,
          `  Base value: ${def.value}     High alch: ${def.highAlch}`,
        ].join('\n');
      }

      return [
        'Grand Exchange commands:',
        '  ge buy <item> <qty> <price>',
        '  ge sell <item> <qty> <price>',
        '  ge status',
        '  ge cancel <slot>',
        '  ge collect <slot>',
        '  ge market <item>',
      ].join('\n');
    },
  });

  // Drive the matching engine on each game tick. The engine itself runs
  // most matches synchronously inside placeOffer; this catches any cross-book
  // updates that happen between placements (e.g., from background tools).
  if (opts.tick && typeof opts.tick.onTick === 'function') {
    opts.tick.onTick('ge-runner', () => { ge.matchTick(); });
  }
}

// ── Slot helpers (private) ───────────────────────────────────────────────────
function offerInSlot(player, idx) {
  const st = ge.status(player);
  return st.slots[idx];
}

function slotIndexOf(player, offerId) {
  const st = ge.status(player);
  for (let i = 0; i < st.slots.length; i++) {
    if (st.slots[i] && st.slots[i].id === offerId) return i;
  }
  return -1;
}

module.exports = { register };
