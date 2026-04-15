#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// Grand Exchange — Engine Tests
//
// Runs the GE runner against the real item registry with an in-memory player
// model, verifying:
//   1.  Buy and matching sell fully fill both sides
//   2.  Partial fills (seller posts 100, buyer posts 60 -> 60 fills, 40 left)
//   3.  Cancel of an unfilled buy returns coins
//   4.  Cancel of an unfilled sell returns items
//   5.  Overbid rule (buyer at 1000 hits resting ask of 800 -> trades at 800,
//       buyer refunded 200 per unit)
//   6.  6-slot cap is enforced
//   7.  Price history records trade prices and getMarketStats reports last/24h
//   8.  Non-tradeable items are rejected
//   9.  Self-match is skipped (no wash trades)
//   10. Insufficient coins / insufficient items rejected
//
// Run: node scripts/test-ge.js
// Exit 0 on all-pass, exit 1 on any failure.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const path = require('path');
const fs = require('fs');

// Sandbox the GE persistence to a temp dir so tests don't touch live data.
const tmpDataDir = path.join(__dirname, '..', '.tmp-ge-test');
if (fs.existsSync(tmpDataDir)) fs.rmSync(tmpDataDir, { recursive: true, force: true });
fs.mkdirSync(tmpDataDir, { recursive: true });

// Monkey-patch persistence DATA_DIR before requiring ge-runner.
const persistence = require('../src/engine/persistence');
// Replace the internal DATA_DIR by hot-patching the save/load methods.
const realSave = persistence.save;
const realLoad = persistence.load;
persistence.save = (filename, data) => {
  const fp = path.join(tmpDataDir, filename);
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, JSON.stringify(data, null, 2));
};
persistence.load = (filename, fallback = null) => {
  const fp = path.join(tmpDataDir, filename);
  if (!fs.existsSync(fp)) return fallback;
  try { return JSON.parse(fs.readFileSync(fp, 'utf8')); }
  catch { return fallback; }
};

const items = require('../src/data/items');
const ge    = require('../src/engine/ge-runner');

// ── Test harness ─────────────────────────────────────────────────────────────
let passed = 0, failed = 0;
const failures = [];

function assert(cond, msg) {
  if (cond) { passed++; }
  else      { failed++; failures.push(msg); console.log(`  FAIL: ${msg}`); }
}

function eq(actual, expected, msg) {
  const ok = actual === expected;
  assert(ok, `${msg} (expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)})`);
}

function group(name, fn) {
  console.log(`\n── ${name} ──`);
  ge.reset();
  // Re-seed each group.
  ge.seedGuidePricesFromItems(items, null);
  fn();
}

// ── In-memory player model ───────────────────────────────────────────────────
// Each player has an inventory keyed by itemId -> count.
let nextPlayerId = 1;
function makePlayer(name, startCoins = 0, startInv = {}) {
  const p = {
    id: nextPlayerId++,
    name,
    inventory: { ...startInv },
    notifications: [],
  };
  if (startCoins > 0) p.inventory[101] = (p.inventory[101] || 0) + startCoins;
  return p;
}

function invCount(p, itemId)        { return p.inventory[itemId] || 0; }
function invRemove(p, itemId, qty)  {
  const have = p.inventory[itemId] || 0;
  if (have < qty) return false;
  p.inventory[itemId] = have - qty;
  if (p.inventory[itemId] === 0) delete p.inventory[itemId];
  return true;
}
function invAdd(p, itemId, _name, qty, _stackable) {
  p.inventory[itemId] = (p.inventory[itemId] || 0) + qty;
  return true;
}

ge.setItemRegistry(items);
ge.setPlayerHooks({ invCount, invRemove, invAdd });

// ── Test items (use real definitions) ────────────────────────────────────────
const LOBSTER  = items.find('Lobster').id;       // 235, tradeable, value 150
const BURNT    = items.find('Burnt shrimps').id; // 240, tradeable: false
const COINS    = 101;

// ── Test 1: matching buy + sell fully fill both sides ───────────────────────
group('Test 1: buy + matching sell fully fill', () => {
  const buyer  = makePlayer('Buyer1',  10_000);
  const seller = makePlayer('Seller1', 0, { [LOBSTER]: 5 });

  const sellRes = ge.placeOffer(seller, { side: 'sell', itemId: LOBSTER, qty: 5, price: 200 });
  assert(sellRes.ok, 'seller place ok');

  const buyRes = ge.placeOffer(buyer, { side: 'buy', itemId: LOBSTER, qty: 5, price: 200 });
  assert(buyRes.ok, 'buyer place ok');

  // Pre-collect: pending should be set.
  const buyerStatus  = ge.status(buyer);
  const sellerStatus = ge.status(seller);
  const buyOffer  = buyerStatus.slots.find(s => s);
  const sellOffer = sellerStatus.slots.find(s => s);
  eq(buyOffer.filled,        5,    'buyer filled 5');
  eq(buyOffer.remaining,     0,    'buyer remaining 0');
  eq(sellOffer.filled,       5,    'seller filled 5');
  eq(sellOffer.remaining,    0,    'seller remaining 0');
  eq(buyOffer.pendingItems,  5,    'buyer has 5 items pending');
  eq(buyOffer.pendingCoins,  0,    'buyer has 0 coins refund (no overbid)');
  eq(sellOffer.pendingCoins, 1000, 'seller has 1000 coins pending (5 * 200)');

  // Collect on both sides.
  ge.collectOffer(buyer,  buyOffer.id);
  ge.collectOffer(seller, sellOffer.id);

  eq(buyer.inventory[LOBSTER], 5,     'buyer received 5 lobsters');
  eq(buyer.inventory[COINS] || 0, 9000, 'buyer paid 1000, has 9000 left');
  eq(seller.inventory[COINS] || 0, 1000, 'seller received 1000 coins');
  eq(seller.inventory[LOBSTER] || 0, 0, 'seller has 0 lobsters left');
});

// ── Test 2: partial fill ────────────────────────────────────────────────────
group('Test 2: partial fill — seller posts 100, buyer posts 60', () => {
  const seller = makePlayer('Seller2', 0, { [LOBSTER]: 100 });
  const buyer  = makePlayer('Buyer2',  60 * 200);

  const sellRes = ge.placeOffer(seller, { side: 'sell', itemId: LOBSTER, qty: 100, price: 200 });
  assert(sellRes.ok, 'seller 100 ok');

  const buyRes = ge.placeOffer(buyer, { side: 'buy', itemId: LOBSTER, qty: 60, price: 200 });
  assert(buyRes.ok, 'buyer 60 ok');

  const buyerStatus  = ge.status(buyer);
  const sellerStatus = ge.status(seller);
  const buyOffer  = buyerStatus.slots.find(s => s);
  const sellOffer = sellerStatus.slots.find(s => s);

  eq(buyOffer.filled,    60, 'buyer fully filled (60/60)');
  eq(buyOffer.remaining, 0,  'buyer 0 remaining');
  eq(sellOffer.filled,   60, 'seller filled 60/100');
  eq(sellOffer.remaining,40, 'seller has 40 remaining');
  eq(sellOffer.status,   'open', 'seller offer still open');
});

// ── Test 3: cancel unfilled buy returns coins ───────────────────────────────
group('Test 3: cancel unfilled BUY returns coins', () => {
  const buyer = makePlayer('Buyer3', 1000);
  const res = ge.placeOffer(buyer, { side: 'buy', itemId: LOBSTER, qty: 5, price: 100 });
  assert(res.ok, 'place buy ok');
  eq(buyer.inventory[COINS] || 0, 500, 'coins escrowed (5 * 100)');

  const cancelRes = ge.cancelOffer(buyer, res.offer.id);
  assert(cancelRes.ok, 'cancel ok');
  eq(cancelRes.refund.coins, 500, 'refund includes 500 coins');
  eq(buyer.inventory[COINS] || 0, 1000, 'all coins returned');
  // Slot freed.
  eq(ge.status(buyer).slots.filter(s => s).length, 0, 'no active offers after cancel');
});

// ── Test 3b: cancel unfilled SELL returns items ─────────────────────────────
group('Test 3b: cancel unfilled SELL returns items', () => {
  const seller = makePlayer('Seller3b', 0, { [LOBSTER]: 7 });
  const res = ge.placeOffer(seller, { side: 'sell', itemId: LOBSTER, qty: 7, price: 250 });
  assert(res.ok, 'place sell ok');
  eq(seller.inventory[LOBSTER] || 0, 0, 'items escrowed');

  const cancelRes = ge.cancelOffer(seller, res.offer.id);
  assert(cancelRes.ok, 'cancel ok');
  eq(cancelRes.refund.items, 7, 'refund includes 7 items');
  eq(seller.inventory[LOBSTER] || 0, 7, 'all items returned');
});

// ── Test 4: overbid rule — buyer at 1000 hits ask of 800 ────────────────────
group('Test 4: overbid rule — buy 1000 vs best ask 800 trades at 800', () => {
  const seller = makePlayer('Seller4', 0, { [LOBSTER]: 1 });
  const buyer  = makePlayer('Buyer4',  1000);

  const sellRes = ge.placeOffer(seller, { side: 'sell', itemId: LOBSTER, qty: 1, price: 800 });
  assert(sellRes.ok, 'seller post 800 ok');

  const buyRes = ge.placeOffer(buyer, { side: 'buy', itemId: LOBSTER, qty: 1, price: 1000 });
  assert(buyRes.ok, 'buyer post 1000 ok');

  const buyOffer = ge.status(buyer).slots.find(s => s);
  const sellOffer= ge.status(seller).slots.find(s => s);

  eq(buyOffer.filled, 1, 'buy filled');
  eq(buyOffer.pendingItems, 1, 'buyer has 1 lobster pending');
  eq(buyOffer.pendingCoins, 200, 'buyer refunded 200 (1000 - 800)');
  eq(sellOffer.pendingCoins, 800, 'seller earned 800 (the resting ask price)');

  // Collect both, verify final balances.
  ge.collectOffer(buyer,  buyOffer.id);
  ge.collectOffer(seller, sellOffer.id);
  // Buyer started with 1000, escrowed 1000, refunded 200 -> 200 left.
  eq(buyer.inventory[COINS] || 0, 200, 'buyer pays the resting ask, not their bid');
  eq(buyer.inventory[LOBSTER] || 0, 1, 'buyer has 1 lobster');
  eq(seller.inventory[COINS] || 0, 800, 'seller earned 800');
});

// ── Test 4b: reverse overbid — seller asks 500 against resting bid of 700 ──
// Standard: trade at the older offer's price. Resting bid (older) = 700, so
// trade at 700. The seller didn't ask for that much, but they're happy.
group('Test 4b: low ask hits high bid trades at the older price', () => {
  const buyer  = makePlayer('Buyer4b', 700);
  const seller = makePlayer('Seller4b', 0, { [LOBSTER]: 1 });

  ge.placeOffer(buyer,  { side: 'buy',  itemId: LOBSTER, qty: 1, price: 700 });
  ge.placeOffer(seller, { side: 'sell', itemId: LOBSTER, qty: 1, price: 500 });

  const buyOffer  = ge.status(buyer).slots.find(s => s);
  const sellOffer = ge.status(seller).slots.find(s => s);
  eq(buyOffer.pendingCoins, 0,   'buyer no refund — paid their bid');
  eq(sellOffer.pendingCoins, 700, 'seller earns 700, not their 500 ask (older offer wins)');
});

// ── Test 5: 6-slot cap ──────────────────────────────────────────────────────
group('Test 5: 6-slot cap enforced', () => {
  const p = makePlayer('SlotCap', 1_000_000);
  for (let i = 0; i < 6; i++) {
    const r = ge.placeOffer(p, { side: 'buy', itemId: LOBSTER, qty: 1, price: 100 + i });
    assert(r.ok, `slot ${i + 1} placed`);
  }
  const overflow = ge.placeOffer(p, { side: 'buy', itemId: LOBSTER, qty: 1, price: 999 });
  assert(!overflow.ok,                              'seventh offer rejected');
  assert(/slots are full/i.test(overflow.error),    `error mentions full slots (got ${overflow.error})`);
  eq(ge.status(p).slots.filter(s => s).length, 6,   'exactly 6 slots used');
});

// ── Test 6: price history + market stats ────────────────────────────────────
group('Test 6: price history records trade prices', () => {
  const seller = makePlayer('HistSeller', 0, { [LOBSTER]: 10 });
  const buyer1 = makePlayer('HistBuyer1', 200);
  const buyer2 = makePlayer('HistBuyer2', 240);
  const buyer3 = makePlayer('HistBuyer3', 100);

  ge.placeOffer(seller, { side: 'sell', itemId: LOBSTER, qty: 10, price: 100 });
  ge.placeOffer(buyer1, { side: 'buy',  itemId: LOBSTER, qty: 2,  price: 100 });
  ge.placeOffer(buyer2, { side: 'buy',  itemId: LOBSTER, qty: 2,  price: 120 }); // overbid -> trades at 100
  ge.placeOffer(buyer3, { side: 'buy',  itemId: LOBSTER, qty: 1,  price: 100 });

  const stats = ge.getMarketStats(LOBSTER);
  eq(stats.vol24h, 5,         'volume = 5 (2 + 2 + 1)');
  eq(stats.lastPrice, 100,    'last trade price is 100');
  eq(stats.low, 100,          '24h low is 100');
  eq(stats.high, 100,         '24h high is 100 (overbid normalises to ask)');
  eq(stats.medianPrice, 100,  'median is 100');

  const hist = ge.getHistory(LOBSTER, '24h');
  eq(hist.length, 3,          '3 trade rows recorded');
  assert(hist.every(t => t.price === 100), 'all trades at 100');
});

// ── Test 7: non-tradeable items are rejected ────────────────────────────────
group('Test 7: non-tradeable items rejected', () => {
  const p = makePlayer('NonTradeable', 0, { [BURNT]: 5 });
  const res = ge.placeOffer(p, { side: 'sell', itemId: BURNT, qty: 1, price: 1 });
  assert(!res.ok, 'sell of burnt item rejected');
  assert(/cannot be traded/i.test(res.error), `error mentions tradeable (got ${res.error})`);
  // Coins themselves cannot be sold.
  const p2 = makePlayer('CoinSeller', 100);
  const res2 = ge.placeOffer(p2, { side: 'sell', itemId: COINS, qty: 1, price: 1 });
  assert(!res2.ok, 'sell of coins rejected');
});

// ── Test 8: self-match is skipped ───────────────────────────────────────────
group('Test 8: self-match prevented', () => {
  const p = makePlayer('SelfMatch', 1000, { [LOBSTER]: 5 });
  ge.placeOffer(p, { side: 'sell', itemId: LOBSTER, qty: 5, price: 100 });
  ge.placeOffer(p, { side: 'buy',  itemId: LOBSTER, qty: 5, price: 100 });
  const slots = ge.status(p).slots.filter(s => s);
  // Both offers should still be open with 0 fills (no self-trade allowed).
  eq(slots.length, 2,           'both offers occupy slots');
  assert(slots.every(o => o.filled === 0), 'no self-fills happened');
});

// ── Test 9: insufficient escrow rejected ────────────────────────────────────
group('Test 9: insufficient escrow rejected', () => {
  const p = makePlayer('Broke', 50);
  const r1 = ge.placeOffer(p, { side: 'buy', itemId: LOBSTER, qty: 1, price: 100 });
  assert(!r1.ok, 'buy with insufficient coins rejected');

  const p2 = makePlayer('NoItems', 0);
  const r2 = ge.placeOffer(p2, { side: 'sell', itemId: LOBSTER, qty: 1, price: 100 });
  assert(!r2.ok, 'sell without items rejected');
});

// ── Test 10: persistence round-trip ─────────────────────────────────────────
group('Test 10: persistence round-trip', () => {
  const seller = makePlayer('PersistSeller', 0, { [LOBSTER]: 3 });
  ge.placeOffer(seller, { side: 'sell', itemId: LOBSTER, qty: 3, price: 175 });
  const before = ge.status(seller).slots.find(s => s);

  const blob = ge.serialize();
  ge.reset();
  ge.deserialize(blob);

  // After reset+restore, seller's status should reflect the same offer.
  // (Slots are tracked by offer.playerId, so the same player object lookup works.)
  const after = ge.status(seller).slots.find(s => s);
  assert(after,                            'offer survived round-trip');
  eq(after.id, before.id,                  'same offer id');
  eq(after.qty, before.qty,                'same qty');
  eq(after.price, before.price,            'same price');
  eq(after.itemId, before.itemId,          'same itemId');
});

// ── Test 11: market stats include guide price for un-traded items ───────────
group('Test 11: guide prices populated for tradeable items', () => {
  const stats = ge.getMarketStats(LOBSTER);
  assert(stats.guidePrice !== null && stats.guidePrice > 0,
    `lobster has a non-zero guide price (got ${stats.guidePrice})`);
  // Burnt shrimp is non-tradeable -> should not be in guide map.
  const burntStats = ge.getMarketStats(BURNT);
  assert(burntStats.guidePrice === null,
    `burnt shrimp has no guide price (got ${burntStats.guidePrice})`);
});

// ── Test 12: best-price-first matching ──────────────────────────────────────
group('Test 12: best-price-first — buyer matches lowest ask first', () => {
  const sellerA = makePlayer('AskHigh', 0, { [LOBSTER]: 1 });
  const sellerB = makePlayer('AskLow',  0, { [LOBSTER]: 1 });
  ge.placeOffer(sellerA, { side: 'sell', itemId: LOBSTER, qty: 1, price: 300 });
  ge.placeOffer(sellerB, { side: 'sell', itemId: LOBSTER, qty: 1, price: 200 });

  const buyer = makePlayer('Buyer12', 500);
  const r = ge.placeOffer(buyer, { side: 'buy', itemId: LOBSTER, qty: 1, price: 500 });
  assert(r.ok);
  const buyOffer = ge.status(buyer).slots.find(s => s);
  eq(buyOffer.filled, 1,            'buyer filled');
  eq(buyOffer.pendingCoins, 300,    'buyer refunded 300 (500 - lowest ask 200)');
  // sellerB (ask 200) should be filled, sellerA still resting at 300.
  const aSlots = ge.status(sellerA).slots.filter(s => s);
  const bSlots = ge.status(sellerB).slots.filter(s => s);
  eq(aSlots[0].filled, 0,           'sellerA (300) untouched');
  eq(bSlots[0].filled, 1,           'sellerB (200) filled — best ask wins');
});

// ── Test 13: FIFO within price ladder ───────────────────────────────────────
group('Test 13: FIFO within same price', () => {
  const sellerEarly = makePlayer('Early', 0, { [LOBSTER]: 1 });
  const sellerLate  = makePlayer('Late',  0, { [LOBSTER]: 1 });
  ge.placeOffer(sellerEarly, { side: 'sell', itemId: LOBSTER, qty: 1, price: 100 });
  // Force a millisecond gap by mutating timestamp — Date.now() resolution can
  // be coarser than execution speed, so the two could end up tied. We force
  // the second offer to be one millisecond newer.
  const earlyOffer = ge.status(sellerEarly).slots.find(s => s);
  ge.placeOffer(sellerLate,  { side: 'sell', itemId: LOBSTER, qty: 1, price: 100 });
  const lateOffer = ge.status(sellerLate).slots.find(s => s);
  if (lateOffer.ts <= earlyOffer.ts) {
    // Re-stamp manually to enforce the ordering for the test.
    const internal = ge._offerIndex.get(lateOffer.id);
    internal.ts = earlyOffer.ts + 1;
  }

  const buyer = makePlayer('FIFOBuyer', 200);
  ge.placeOffer(buyer, { side: 'buy', itemId: LOBSTER, qty: 1, price: 100 });

  // Early seller should be filled first.
  const earlyAfter = ge.status(sellerEarly).slots.find(s => s);
  const lateAfter  = ge.status(sellerLate).slots.find(s => s);
  eq(earlyAfter.filled, 1, 'early seller filled first');
  eq(lateAfter.filled, 0,  'late seller still resting');
});

// ── matchTick() smoke test ──────────────────────────────────────────────────
group('Test 14: matchTick() runs without throwing', () => {
  const seller = makePlayer('TickSell', 0, { [LOBSTER]: 1 });
  const buyer  = makePlayer('TickBuy',  100);
  ge.placeOffer(seller, { side: 'sell', itemId: LOBSTER, qty: 1, price: 100 });
  ge.placeOffer(buyer,  { side: 'buy',  itemId: LOBSTER, qty: 1, price: 100 });
  const matches = ge.matchTick();
  assert(matches >= 0, 'matchTick returns non-negative integer');
});

// ── Summary ──────────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════════════════════');
console.log(`  RESULTS: ${passed} passed, ${failed} failed`);
console.log('══════════════════════════════════════════════════════════════');

// Cleanup tmp dir.
try { fs.rmSync(tmpDataDir, { recursive: true, force: true }); } catch (_) {}

if (failed > 0) {
  console.log('\nFailures:');
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
process.exit(0);
