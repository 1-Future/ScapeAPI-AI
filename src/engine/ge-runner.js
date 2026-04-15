// ── Grand Exchange Runner (GE Core) ──────────────────────────────────────────
// OSRS-style server-mediated player-to-player auction system.
// Buyer's coins and seller's items are escrowed by the server until match.
// FIFO within price ladder, best-price-first, partial fills allowed.
// Overbid rule: buy at X always converges to lowest ask <= X (no "pay more
// than you had to"). Sell at X always converges to highest bid >= X.
//
// Integer arithmetic only. Amounts are clamped to MAX_COIN_STACK to mirror
// OSRS-style 32-bit positive int overflow protection.

'use strict';

const persistence = require('./persistence');
const events = require('./events');

// ── Constants ────────────────────────────────────────────────────────────────
const MAX_OFFERS_PER_PLAYER = 6;     // OSRS slot count
const MAX_COIN_STACK = 2147483647;   // 2^31 - 1, OSRS coin cap
const MAX_QTY_PER_OFFER = 2147483647;
const TAX_BPS = 0;                   // basis points (0 = no tax for v1; OSRS has 1% on sell only)
const HISTORY_KEEP_MS = 30 * 24 * 60 * 60 * 1000; // 30 days of trade history
const TICK_MAX_MATCHES = 256;        // cap matches per tick to avoid runaway loops

// ── State ────────────────────────────────────────────────────────────────────
// Order books are arrays kept sorted by (price, ts) at insertion time.
// books[itemId] = { buys: [...], sells: [...] }
const books = new Map();
// trades[itemId] = [{ ts, qty, price, buyerId, sellerId, buyOfferId, sellOfferId }]
const trades = new Map();
// guidePrices[itemId] = integer guide price (sticky reference price)
const guidePrices = new Map();
// nontradeable items: read on demand from itemRegistry.tradeable === false
let nextOfferId = 1;
// playerSlots[playerId] = Set<offerId> for O(1) slot count
const playerSlots = new Map();
// offerIndex[offerId] = offer (fast lookup for cancel/status)
const offerIndex = new Map();

// ── Item registry adapter ────────────────────────────────────────────────────
// The runner accepts a pluggable item lookup so it can be tested in isolation.
// In production this is wired to src/data/items.js.
let itemRegistry = null; // { get(id), find(name) }

function setItemRegistry(reg) { itemRegistry = reg; }
function getItemRegistry() { return itemRegistry; }

// ── Player state adapter ─────────────────────────────────────────────────────
// Production: hooks are wired to invAdd/invRemove/invCount in commands/all.js.
// Tests: the test script provides its own simple in-memory player records.
let playerHooks = {
  invCount: (player, itemId) => 0,
  invRemove: (player, itemId, qty) => false,
  invAdd: (player, itemId, name, qty, stackable) => false,
  notifyPlayer: (player, channel, payload) => {},
};

function setPlayerHooks(h) {
  playerHooks = { ...playerHooks, ...h };
}

// ── Integer helpers ──────────────────────────────────────────────────────────
function clampPositiveInt(n, max) {
  n = n | 0; // coerce to int32; non-numeric or negative => 0
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > max) return max;
  return n;
}

function safeAdd(a, b, max) {
  // Cap-on-overflow add (OSRS-style: never exceed max stack).
  if (a >= max) return max;
  if (b >= max) return max;
  const sum = a + b;
  return sum > max ? max : sum;
}

function safeMul(a, b, max) {
  if (a === 0 || b === 0) return 0;
  if (a > max / b) return max; // avoid float by div, but b > 0 here
  return a * b;
}

// ── Tradeable check ──────────────────────────────────────────────────────────
function isTradeable(itemId) {
  if (!itemRegistry) return true;
  const def = itemRegistry.get(itemId);
  if (!def) return false;
  // Coins (id 101) are obviously not tradeable on the GE.
  if (def.id === 101) return false;
  return def.tradeable !== false;
}

// ── Book accessors ───────────────────────────────────────────────────────────
function getBook(itemId) {
  let b = books.get(itemId);
  if (!b) {
    b = { buys: [], sells: [] };
    books.set(itemId, b);
  }
  return b;
}

// Sort order:
//   buys:  highest price first (best bid first), then earliest timestamp.
//   sells: lowest price first  (best ask first), then earliest timestamp.
function insertBuy(book, offer) {
  let i = 0;
  while (i < book.buys.length) {
    const o = book.buys[i];
    if (o.price < offer.price) break;
    if (o.price === offer.price && o.ts > offer.ts) break;
    i++;
  }
  book.buys.splice(i, 0, offer);
}
function insertSell(book, offer) {
  let i = 0;
  while (i < book.sells.length) {
    const o = book.sells[i];
    if (o.price > offer.price) break;
    if (o.price === offer.price && o.ts > offer.ts) break;
    i++;
  }
  book.sells.splice(i, 0, offer);
}

function removeFromBook(book, offer) {
  const arr = offer.side === 'buy' ? book.buys : book.sells;
  const idx = arr.indexOf(offer);
  if (idx >= 0) arr.splice(idx, 1);
}

// ── Player slot tracking ─────────────────────────────────────────────────────
function getPlayerSlots(playerId) {
  let s = playerSlots.get(playerId);
  if (!s) { s = new Set(); playerSlots.set(playerId, s); }
  return s;
}

function activeOfferCount(playerId) {
  // A slot is occupied as long as the offer is not fully collected.
  // An offer can be fully filled but still occupy a slot until collected.
  const s = playerSlots.get(playerId);
  return s ? s.size : 0;
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * placeOffer(player, { side, itemId, qty, price })
 * Escrows coins (buy) or items (sell) and inserts the order, then runs an
 * immediate match pass.
 *
 * Returns { ok: true, offer } or { ok: false, error: string }.
 */
function placeOffer(player, opts) {
  if (!player || player.id == null) return { ok: false, error: 'No player.' };
  const side = opts && opts.side;
  if (side !== 'buy' && side !== 'sell') return { ok: false, error: 'Side must be buy or sell.' };

  const itemId = opts.itemId | 0;
  const qty = clampPositiveInt(opts.qty, MAX_QTY_PER_OFFER);
  const price = clampPositiveInt(opts.price, MAX_COIN_STACK);

  if (qty <= 0) return { ok: false, error: 'Quantity must be positive.' };
  if (price <= 0) return { ok: false, error: 'Price must be positive.' };
  if (!isTradeable(itemId)) return { ok: false, error: 'That item cannot be traded.' };

  if (activeOfferCount(player.id) >= MAX_OFFERS_PER_PLAYER) {
    return { ok: false, error: `All ${MAX_OFFERS_PER_PLAYER} GE slots are full.` };
  }

  // Escrow.
  if (side === 'buy') {
    const totalCost = safeMul(qty, price, MAX_COIN_STACK);
    if (totalCost === MAX_COIN_STACK && qty * price !== MAX_COIN_STACK) {
      return { ok: false, error: 'Total cost exceeds coin cap.' };
    }
    if (playerHooks.invCount(player, 101) < totalCost) {
      return { ok: false, error: `Need ${totalCost} coins.` };
    }
    if (!playerHooks.invRemove(player, 101, totalCost)) {
      return { ok: false, error: 'Failed to escrow coins.' };
    }
  } else {
    if (playerHooks.invCount(player, itemId) < qty) {
      return { ok: false, error: `You do not have ${qty} of that item.` };
    }
    if (!playerHooks.invRemove(player, itemId, qty)) {
      return { ok: false, error: 'Failed to escrow items.' };
    }
  }

  const itemName = (itemRegistry && itemRegistry.get(itemId) && itemRegistry.get(itemId).name) || `item:${itemId}`;
  const offer = {
    id: nextOfferId++,
    side,
    playerId: player.id,
    playerName: player.name || `player:${player.id}`,
    itemId,
    itemName,
    qty,                  // original quantity requested
    remaining: qty,       // unfilled portion
    price,                // limit price (per unit)
    filled: 0,            // units traded so far
    paidOrEarned: 0,      // total coins moved (gross, ignoring tax which is 0 in v1)
    pendingItems: 0,      // items waiting to be collected (buy side)
    pendingCoins: 0,      // coins waiting to be collected (sell side, plus refund on buy)
    ts: Date.now(),       // for FIFO ordering
    status: 'open',       // open | filled | cancelled
  };

  const book = getBook(itemId);
  if (side === 'buy') insertBuy(book, offer);
  else insertSell(book, offer);

  offerIndex.set(offer.id, offer);
  getPlayerSlots(player.id).add(offer.id);

  events.emit('ge:offer_placed', { player, offer: snapshotOffer(offer) });

  // Immediate match pass.
  matchOffer(offer, player);

  return { ok: true, offer: snapshotOffer(offer) };
}

/**
 * cancelOffer(player, offerId)
 * Refunds remaining escrow plus any uncollected partial fills.
 * Returns { ok, refund: { items, coins, itemId, itemName } } or { ok: false, error }.
 */
function cancelOffer(player, offerId) {
  const offer = offerIndex.get(offerId);
  if (!offer) return { ok: false, error: 'Offer not found.' };
  if (offer.playerId !== player.id) return { ok: false, error: 'That is not your offer.' };
  if (offer.status === 'cancelled') return { ok: false, error: 'Already cancelled.' };

  // Refund unfilled portion of escrow.
  if (offer.side === 'buy' && offer.remaining > 0) {
    const refund = safeMul(offer.remaining, offer.price, MAX_COIN_STACK);
    offer.pendingCoins = safeAdd(offer.pendingCoins, refund, MAX_COIN_STACK);
  } else if (offer.side === 'sell' && offer.remaining > 0) {
    offer.pendingItems = safeAdd(offer.pendingItems, offer.remaining, MAX_COIN_STACK);
  }
  offer.remaining = 0;
  offer.status = 'cancelled';

  // Remove from order book.
  const book = getBook(offer.itemId);
  removeFromBook(book, offer);

  // Auto-collect on cancel: pay out everything pending.
  const refund = collectPending(player, offer);

  events.emit('ge:cancelled', { player, offer: snapshotOffer(offer), refund });

  // Free the slot.
  getPlayerSlots(player.id).delete(offer.id);
  offerIndex.delete(offer.id);

  return { ok: true, offer: snapshotOffer(offer), refund };
}

/**
 * status(player) -> { slots: [...6 slots, null for empty] }
 */
function status(player) {
  const ids = [...getPlayerSlots(player.id)];
  const slots = [];
  for (let i = 0; i < MAX_OFFERS_PER_PLAYER; i++) {
    const offer = ids[i] ? offerIndex.get(ids[i]) : null;
    slots.push(offer ? snapshotOffer(offer) : null);
  }
  return { slots };
}

/**
 * matchTick() — runs once per server tick.
 * Walks every order book and tries to cross spreads. Most matching happens
 * synchronously inside placeOffer(), but a tick pass picks up edge cases
 * (e.g., cross-book updates from external sources) and also sweeps stuck
 * pending-collect notifications.
 *
 * Returns total trades executed this tick.
 */
function matchTick() {
  let total = 0;
  for (const [itemId, book] of books) {
    let safety = 0;
    while (book.buys.length && book.sells.length) {
      const bestBuy = book.buys[0];
      const bestSell = book.sells[0];
      if (bestBuy.price < bestSell.price) break; // no cross
      if (bestBuy.playerId === bestSell.playerId) {
        // Self-match: skip the older one to avoid wash trading.
        if (bestBuy.ts <= bestSell.ts) {
          // Skip this pair: we need to look past one of them. Pop the later
          // and re-push at end — but we never actually want to match these.
          // Easiest correct behaviour: break the inner loop and rely on a
          // later cancel/expiry. v1 acceptable.
          break;
        }
        break;
      }
      executeTrade(bestBuy, bestSell);
      total++;
      safety++;
      if (safety > TICK_MAX_MATCHES) break;
      if (bestBuy.remaining <= 0) {
        // bestBuy will have been pulled by executeTrade if filled.
      }
    }
  }
  return total;
}

/**
 * getMarketStats(itemId) -> { lastPrice, low, high, vol24h, medianPrice, guidePrice }
 */
function getMarketStats(itemId) {
  const list = trades.get(itemId) || [];
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const recent = list.filter(t => t.ts >= cutoff);
  let low = null, high = null, vol = 0, sum = 0;
  for (const t of recent) {
    if (low === null || t.price < low) low = t.price;
    if (high === null || t.price > high) high = t.price;
    vol += t.qty;
    sum += t.price * t.qty;
  }
  // Median (volume-weighted by trade row, not by qty — good enough for v1).
  let median = null;
  if (recent.length) {
    const sorted = recent.map(t => t.price).sort((a, b) => a - b);
    median = sorted[Math.floor(sorted.length / 2)] | 0;
  }
  return {
    itemId,
    lastPrice: list.length ? list[list.length - 1].price : (guidePrices.get(itemId) || null),
    low, high,
    vol24h: vol,
    medianPrice: median,
    guidePrice: guidePrices.get(itemId) || null,
  };
}

/**
 * getHistory(itemId, window='24h') -> [{ ts, qty, price }]
 */
function getHistory(itemId, window) {
  const list = trades.get(itemId) || [];
  let ms;
  if (window === '1h') ms = 60 * 60 * 1000;
  else if (window === '7d') ms = 7 * 24 * 60 * 60 * 1000;
  else if (window === '30d') ms = 30 * 24 * 60 * 60 * 1000;
  else if (window === 'all') ms = null;
  else ms = 24 * 60 * 60 * 1000; // default 24h
  if (ms === null) return list.slice();
  const cutoff = Date.now() - ms;
  return list.filter(t => t.ts >= cutoff);
}

// ── Internal: matching ───────────────────────────────────────────────────────

/**
 * Match a freshly placed offer against the book.
 * Buy at limit X consumes asks where ask.price <= X, cheapest first.
 * Sell at limit X consumes bids where bid.price >= X, highest first.
 * The trade price is always the resting offer's price (price-time priority).
 * For a buy that hits a cheaper ask, the buyer pays the resting ask price —
 * the price difference goes back to the buyer as a coin refund (overbid rule).
 */
function matchOffer(newOffer, player) {
  const book = getBook(newOffer.itemId);
  let safety = 0;
  while (newOffer.remaining > 0) {
    const opposing = newOffer.side === 'buy' ? book.sells : book.buys;
    if (!opposing.length) break;
    let candidateIdx = -1;
    for (let i = 0; i < opposing.length; i++) {
      const c = opposing[i];
      if (c.playerId === newOffer.playerId) continue; // no self-match
      if (newOffer.side === 'buy') {
        if (c.price > newOffer.price) break; // sells sorted asc; rest are too expensive
      } else {
        if (c.price < newOffer.price) break; // buys sorted desc; rest are too low
      }
      candidateIdx = i;
      break;
    }
    if (candidateIdx < 0) break;
    const resting = opposing[candidateIdx];
    // The resting offer is by definition older; trade at its price (overbid rule).
    executeTrade(
      newOffer.side === 'buy' ? newOffer : resting,
      newOffer.side === 'sell' ? newOffer : resting,
      resting.price,
    );
    safety++;
    if (safety > TICK_MAX_MATCHES) break;
  }
  if (newOffer.remaining === 0 && newOffer.status === 'open') {
    newOffer.status = 'filled';
  }
}

/**
 * executeTrade(buyOffer, sellOffer, explicitPrice?)
 * Trade qty = min(buy.remaining, sell.remaining).
 * Trade price (in priority order):
 *   1. explicitPrice if provided (call site already knows the resting price)
 *   2. older offer's limit price (FIFO/price-time priority on cross-book sweep)
 *   3. tie-break: lower offer.id (monotonic, so deterministic)
 * Updates both offers, records trade, fires events. Removes empty offers from
 * the book (but keeps them in the offer index until collected — a filled offer
 * still occupies a slot until the player collects).
 */
function executeTrade(buyOffer, sellOffer, explicitPrice) {
  const tradeQty = Math.min(buyOffer.remaining, sellOffer.remaining);
  if (tradeQty <= 0) return;

  let tradePrice;
  if (typeof explicitPrice === 'number') {
    tradePrice = explicitPrice;
  } else if (buyOffer.ts < sellOffer.ts) {
    tradePrice = buyOffer.price;
  } else if (sellOffer.ts < buyOffer.ts) {
    tradePrice = sellOffer.price;
  } else {
    // Tie on timestamp -> lowest id is older.
    tradePrice = (buyOffer.id < sellOffer.id) ? buyOffer.price : sellOffer.price;
  }

  // Buyer always pays the trade price; if buy.price > tradePrice, refund diff.
  const refundPerUnit = buyOffer.price - tradePrice;
  const totalTrade = safeMul(tradeQty, tradePrice, MAX_COIN_STACK);
  const totalRefund = safeMul(tradeQty, Math.max(0, refundPerUnit), MAX_COIN_STACK);

  // Update offers.
  buyOffer.remaining -= tradeQty;
  buyOffer.filled += tradeQty;
  buyOffer.paidOrEarned = safeAdd(buyOffer.paidOrEarned, totalTrade, MAX_COIN_STACK);
  buyOffer.pendingItems = safeAdd(buyOffer.pendingItems, tradeQty, MAX_COIN_STACK);
  buyOffer.pendingCoins = safeAdd(buyOffer.pendingCoins, totalRefund, MAX_COIN_STACK);

  sellOffer.remaining -= tradeQty;
  sellOffer.filled += tradeQty;
  sellOffer.paidOrEarned = safeAdd(sellOffer.paidOrEarned, totalTrade, MAX_COIN_STACK);
  sellOffer.pendingCoins = safeAdd(sellOffer.pendingCoins, totalTrade, MAX_COIN_STACK);

  // Mark filled.
  if (buyOffer.remaining === 0) buyOffer.status = 'filled';
  if (sellOffer.remaining === 0) sellOffer.status = 'filled';

  // Remove fully filled offers from their order books.
  const book = getBook(buyOffer.itemId);
  if (buyOffer.remaining === 0) removeFromBook(book, buyOffer);
  if (sellOffer.remaining === 0) removeFromBook(book, sellOffer);

  // Record trade.
  const trade = {
    ts: Date.now(),
    qty: tradeQty,
    price: tradePrice,
    buyerId: buyOffer.playerId,
    sellerId: sellOffer.playerId,
    buyOfferId: buyOffer.id,
    sellOfferId: sellOffer.id,
  };
  let list = trades.get(buyOffer.itemId);
  if (!list) { list = []; trades.set(buyOffer.itemId, list); }
  list.push(trade);
  // Trim history.
  const cutoff = Date.now() - HISTORY_KEEP_MS;
  while (list.length && list[0].ts < cutoff) list.shift();

  // Fire match events to both sides (private, per-socket).
  const buyEvent = buyOffer.remaining === 0 ? 'ge:complete' : 'ge:partial_match';
  const sellEvent = sellOffer.remaining === 0 ? 'ge:complete' : 'ge:partial_match';
  events.emit(buyEvent, { side: 'buy', offer: snapshotOffer(buyOffer), trade });
  events.emit(sellEvent, { side: 'sell', offer: snapshotOffer(sellOffer), trade });
}

/**
 * collectPending(player, offer)
 * Pays out pending items and coins to the player's inventory. Called from
 * cancelOffer (auto-collect on cancel) and exposed for completeness.
 */
function collectPending(player, offer) {
  const refund = { items: 0, coins: 0, itemId: offer.itemId, itemName: offer.itemName };
  if (offer.pendingItems > 0) {
    const def = itemRegistry && itemRegistry.get(offer.itemId);
    const stackable = def ? def.stackable : false;
    playerHooks.invAdd(player, offer.itemId, offer.itemName, offer.pendingItems, stackable);
    refund.items = offer.pendingItems;
    offer.pendingItems = 0;
  }
  if (offer.pendingCoins > 0) {
    playerHooks.invAdd(player, 101, 'Coins', offer.pendingCoins, true);
    refund.coins = offer.pendingCoins;
    offer.pendingCoins = 0;
  }
  return refund;
}

/**
 * collectOffer(player, offerId)
 * Pays out any pending items/coins on a specific offer. If the offer is filled
 * AND there is nothing left pending, the slot is freed.
 */
function collectOffer(player, offerId) {
  const offer = offerIndex.get(offerId);
  if (!offer) return { ok: false, error: 'Offer not found.' };
  if (offer.playerId !== player.id) return { ok: false, error: 'Not your offer.' };
  const refund = collectPending(player, offer);
  if ((offer.status === 'filled' || offer.status === 'cancelled') &&
      offer.pendingItems === 0 && offer.pendingCoins === 0) {
    getPlayerSlots(player.id).delete(offer.id);
    offerIndex.delete(offer.id);
  }
  return { ok: true, offer: snapshotOffer(offer), refund };
}

// ── Snapshots and serialization ──────────────────────────────────────────────
function snapshotOffer(o) {
  return {
    id: o.id,
    side: o.side,
    playerId: o.playerId,
    playerName: o.playerName,
    itemId: o.itemId,
    itemName: o.itemName,
    qty: o.qty,
    remaining: o.remaining,
    filled: o.filled,
    price: o.price,
    pendingItems: o.pendingItems,
    pendingCoins: o.pendingCoins,
    paidOrEarned: o.paidOrEarned,
    ts: o.ts,
    status: o.status,
  };
}

// ── Guide prices ─────────────────────────────────────────────────────────────
function setGuidePrice(itemId, price) {
  guidePrices.set(itemId | 0, clampPositiveInt(price, MAX_COIN_STACK));
}
function getGuidePrice(itemId) { return guidePrices.get(itemId | 0) || null; }

/**
 * seedGuidePricesFromItems(itemRegistry, shopRegistry?)
 * Walks the item registry and seeds a guide price for every tradeable item.
 *   - Default = item.value (the "base value" / High Alch baseline).
 *   - If shopRegistry is provided, NPC sell prices override item.value when
 *     the shop is the canonical source.
 */
function seedGuidePricesFromItems(reg, shopReg) {
  let count = 0;
  if (reg && reg.items) {
    for (const item of reg.items.values()) {
      if (item.tradeable === false) continue;
      if (item.id === 101) continue;
      const v = item.value || 1;
      setGuidePrice(item.id, v);
      count++;
    }
  }
  if (shopReg && shopReg.shops) {
    for (const shop of shopReg.shops.values()) {
      for (const s of (shop.stock || [])) {
        if (!s || !s.id) continue;
        // Shop price is a hard floor on the guide; don't downgrade an existing
        // item.value-derived guide.
        const cur = guidePrices.get(s.id) || 0;
        if (s.price && s.price > cur) setGuidePrice(s.id, s.price);
      }
    }
  }
  return count;
}

// ── Persistence ──────────────────────────────────────────────────────────────
function serialize() {
  const offers = [];
  for (const o of offerIndex.values()) offers.push(o);
  const tradesObj = {};
  for (const [k, v] of trades) tradesObj[k] = v;
  const guidesObj = {};
  for (const [k, v] of guidePrices) guidesObj[k] = v;
  return { version: 2, nextOfferId, offers, trades: tradesObj, guidePrices: guidesObj };
}

function deserialize(data) {
  reset();
  if (!data) return;
  // V2 format — rebuild books and indexes from offer list.
  if (data.version === 2 && Array.isArray(data.offers)) {
    nextOfferId = data.nextOfferId || 1;
    for (const o of data.offers) {
      offerIndex.set(o.id, o);
      getPlayerSlots(o.playerId).add(o.id);
      const book = getBook(o.itemId);
      if (o.status === 'open' || o.remaining > 0) {
        if (o.side === 'buy') insertBuy(book, o);
        else insertSell(book, o);
      }
    }
    if (data.trades) {
      for (const k of Object.keys(data.trades)) {
        trades.set(parseInt(k, 10) || k, data.trades[k]);
      }
    }
    if (data.guidePrices) {
      for (const k of Object.keys(data.guidePrices)) {
        guidePrices.set(parseInt(k, 10) || k, data.guidePrices[k]);
      }
    }
    return;
  }
  // V1 legacy format (data/ge.json from src/data/ge.js) — best-effort import.
  if (Array.isArray(data.offers)) {
    nextOfferId = data.nextOfferId || 1;
    for (const old of data.offers) {
      const offer = {
        id: old.id,
        side: old.type === 'buy' ? 'buy' : 'sell',
        playerId: old.playerId,
        playerName: old.playerName || `player:${old.playerId}`,
        itemId: old.itemId,
        itemName: old.itemName || `item:${old.itemId}`,
        qty: old.quantity,
        remaining: old.remaining || 0,
        filled: (old.quantity | 0) - (old.remaining | 0),
        price: old.price,
        pendingItems: old.collected || 0,
        pendingCoins: old.collectedCoins || 0,
        paidOrEarned: 0,
        ts: old.timestamp || Date.now(),
        status: (old.remaining || 0) > 0 ? 'open' : 'filled',
      };
      offerIndex.set(offer.id, offer);
      getPlayerSlots(offer.playerId).add(offer.id);
      if (offer.remaining > 0) {
        const book = getBook(offer.itemId);
        if (offer.side === 'buy') insertBuy(book, offer);
        else insertSell(book, offer);
      }
    }
  }
}

function reset() {
  books.clear();
  trades.clear();
  guidePrices.clear();
  playerSlots.clear();
  offerIndex.clear();
  nextOfferId = 1;
}

function save() {
  persistence.save('ge.json', serialize());
}

function load() {
  const data = persistence.load('ge.json', null);
  deserialize(data);
}

// Auto-register save handler. The persistence layer has its own auto-save
// timer; we just provide the callback.
persistence.onSave('ge', save);

// ── Exports ──────────────────────────────────────────────────────────────────
module.exports = {
  // Main API.
  placeOffer, cancelOffer, status, matchTick,
  collectOffer, getMarketStats, getHistory,

  // Configuration.
  setItemRegistry, getItemRegistry, setPlayerHooks,
  setGuidePrice, getGuidePrice, seedGuidePricesFromItems,

  // Persistence.
  save, load, serialize, deserialize, reset,

  // Constants.
  MAX_OFFERS_PER_PLAYER, MAX_COIN_STACK, MAX_QTY_PER_OFFER,

  // Internal accessors (for tests and the chat command layer).
  _books: books, _trades: trades, _offerIndex: offerIndex, _playerSlots: playerSlots,
  snapshotOffer,
};
