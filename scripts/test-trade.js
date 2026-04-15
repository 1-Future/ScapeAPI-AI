#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// Trade — Engine Tests (50+ assertions)
//
// Covers the burn-v2 spec:
//   1.  requestTrade / acceptTrade happy path
//   2.  acceptTrade rejects expired or wrong-target requests
//   3.  cancelTrade refunds escrow on both sides
//   4.  addItemToTrade escrows items; rejects non-tradeable; rejects coins
//   5.  removeItemFromTrade returns items, resets confirms
//   6.  setCoinOffer: increase escrows, decrease refunds
//   7.  Double-confirm flow: [F,F] -> [T,F] -> [T,T]
//   8.  Any mutation after first confirm RESETS both sides' confirms
//   9.  Both-sides-[T,T] commits a swap and closes the session
//   10. Swap aborts if recipient lacks inventory room (atomic — no partial)
//   11. Ironman guard: non-group ironman rejected in both directions
//   12. Group ironman CAN trade with group member
//   13. Distance guard: > 3 tiles rejects request
//   14. Combat guard: combatTarget set -> reject
//   15. Trade-mute guard: tradeMuted flag -> reject
//   16. Slot cap: 28 items per side enforced
//   17. Coin cap clamps at MAX_COIN_STACK
//   18. getOpenTrade returns the session for both parties
//   19. listHistory returns only the caller's trades
//   20. Audit log entries contain ONLY the trade tuple
//   21. Commands register cleanly (basic smoke)
//
// Run: node scripts/test-trade.js
// Exit 0 on all-pass, exit 1 on any failure.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const path = require('path');
const fs = require('fs');

// Sandbox persistence so tests never touch real data.
const tmpDataDir = path.join(__dirname, '..', '.tmp-trade-test');
if (fs.existsSync(tmpDataDir)) fs.rmSync(tmpDataDir, { recursive: true, force: true });
fs.mkdirSync(tmpDataDir, { recursive: true });

const persistence = require('../src/engine/persistence');
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

const items   = require('../src/data/items');
const trade   = require('../src/engine/trade');
const ironman = require('../src/engine/ironman');
const events  = require('../src/engine/events');
const commands = require('../src/engine/commands');
const tradeCommands = require('../src/engine/trade-commands');

// ── Test harness ────────────────────────────────────────────────────────────
let passed = 0, failed = 0;
const failures = [];
function section(title) { console.log('\n── ' + title + ' ──'); }
function assert(cond, label) {
  if (cond) { passed++; console.log('  PASS  ' + label); }
  else      { failed++; failures.push(label); console.log('  FAIL  ' + label); }
}
function eq(actual, expected, label) {
  assert(actual === expected, `${label} (expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)})`);
}

// ── Minimal player model (matches real player.js shape where hooks matter) ──
let nextPid = 1;
const allPlayers = new Map();
function makePlayer(name, startInv = {}, pos = { x: 100, y: 100, layer: 0 }) {
  const p = {
    id: nextPid++,
    name,
    inventory: { ...startInv },
    x: pos.x, y: pos.y, layer: pos.layer,
    combatTarget: null,
    tradeMuted: false,
    invMax: 28,
    notifications: [],
  };
  allPlayers.set(p.id, p);
  return p;
}
function findPlayer(key) {
  for (const p of allPlayers.values()) {
    if (p.id === key) return p;
    if (p.name === key) return p;
  }
  return null;
}

// Player-side inventory helpers (simple object-based).
function invCount(p, itemId) { return p.inventory[itemId] || 0; }
function invRemove(p, itemId, qty) {
  const have = p.inventory[itemId] || 0;
  if (have < qty) return 0;
  p.inventory[itemId] = have - qty;
  if (p.inventory[itemId] === 0) delete p.inventory[itemId];
  return qty;
}
function invAdd(p, itemId, name, qty, _stackable) {
  p.inventory[itemId] = (p.inventory[itemId] || 0) + qty;
  return true;
}
function invFreeSlots(p) {
  // Each non-stackable item in our test model occupies one slot per unit;
  // stackable items (coins, etc.) occupy one slot per type. The test model
  // approximates: slotsUsed = number of distinct keys, since we treat
  // everything as "unlimited per stack" for math simplicity.
  return p.invMax - Object.keys(p.inventory).length;
}

// Wire engine hooks.
trade._reset();
trade.setPlayerHooks({
  invCount,
  invRemove: (p, id, qty) => invRemove(p, id, qty) === qty,
  invAdd,
  invFreeSlots,
  getItemDef: (id) => items.get(id),
  distance: (a, b) => {
    if (!a || !b) return 0;
    if (a.layer !== b.layer) return 1e9;
    return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
  },
  isInCombat: (p) => !!(p && p.combatTarget),
  isTradeMuted: (p) => !!(p && p.tradeMuted),
  notify: (p, payload) => { p.notifications.push(payload); },
  canTrade: (a, b) => ironman.canTrade(a, b),
});
trade.setPlayerResolver((key) => findPlayer(key));

// ── 1. Request + accept happy path ──────────────────────────────────────────
section('1. requestTrade + acceptTrade happy path');

{
  const a = makePlayer('Alice', { 230: 5 }); // 5 cooked shrimps
  const b = makePlayer('Bob',   { 235: 2 }); // 2 lobsters

  const reqRes = trade.requestTrade(a, b);
  eq(reqRes.ok, true, 'requestTrade ok');
  assert(reqRes.requestId > 0, 'requestId issued');
  assert(b.notifications.some(n => n.type === 'trade_request'),
    'target received trade_request notification');

  const acc = trade.acceptTrade(b, reqRes.requestId);
  eq(acc.ok, true, 'acceptTrade ok');
  assert(acc.state && acc.state.id > 0, 'trade session opened');
  assert(a.notifications.some(n => n.type === 'trade_update'),
    'initiator received trade_update on open');

  // Both parties should resolve to the same session.
  const ta = trade.getOpenTrade(a);
  const tb = trade.getOpenTrade(b);
  assert(ta && tb, 'getOpenTrade finds session for both');
  eq(ta.id, tb.id, 'both players see the same trade id');

  trade.cancelTrade(a);
  eq(trade.getOpenTrade(a), null, 'cancel clears active trade (cleanup)');
}

// ── 2. Expired / wrong-target request rejection ─────────────────────────────
section('2. acceptTrade rejects expired/wrong-target requests');

{
  const a = makePlayer('Alice2');
  const b = makePlayer('Bob2');
  const c = makePlayer('Carol');

  const req = trade.requestTrade(a, b);
  eq(req.ok, true, 'request issued');
  // Wrong target.
  const wrong = trade.acceptTrade(c, req.requestId);
  eq(wrong.ok, false, 'wrong-target accept rejected');

  // Forge expiry by monkey-patching Date.now briefly.
  const realNow = Date.now;
  Date.now = () => realNow() + 10 * 60 * 1000;
  try {
    const late = trade.acceptTrade(b, req.requestId);
    eq(late.ok, false, 'expired request rejected');
    assert(/expired/i.test(late.reason), 'expiry reason mentions expired');
  } finally { Date.now = realNow; }
}

// ── 3. cancelTrade refunds both sides ───────────────────────────────────────
section('3. cancelTrade refunds escrow on both sides');

{
  const a = makePlayer('Alice3', { 230: 10, 101: 500 });
  const b = makePlayer('Bob3',   { 235: 3 });
  const req = trade.requestTrade(a, b);
  trade.acceptTrade(b, req.requestId);
  trade.addItemToTrade(a, 230, 5);
  eq(invCount(a, 230), 5, 'A invCount reduced by escrow');
  trade.setCoinOffer(a, 400);
  eq(invCount(a, 101), 100, 'A coins reduced by escrow');
  trade.addItemToTrade(b, 235, 2);
  eq(invCount(b, 235), 1, 'B invCount reduced by escrow');

  const cancelRes = trade.cancelTrade(a);
  eq(cancelRes.ok, true, 'cancelTrade ok');
  eq(invCount(a, 230), 10, 'A shrimps refunded');
  eq(invCount(a, 101), 500, 'A coins refunded');
  eq(invCount(b, 235), 3, 'B lobsters refunded');
  eq(trade.getOpenTrade(a), null, 'A no longer in trade');
  eq(trade.getOpenTrade(b), null, 'B no longer in trade');
}

// ── 4. addItemToTrade rules ─────────────────────────────────────────────────
section('4. addItemToTrade rules');

{
  const a = makePlayer('Alice4', { 240: 5, 230: 2, 101: 10 }); // 240 = Burnt shrimps (non-tradeable)
  const b = makePlayer('Bob4');
  trade.acceptTrade(b, trade.requestTrade(a, b).requestId);

  // Non-tradeable rejected.
  const nt = trade.addItemToTrade(a, 240, 1);
  eq(nt.ok, false, 'non-tradeable item rejected');

  // Unknown item rejected.
  const unk = trade.addItemToTrade(a, 999999, 1);
  eq(unk.ok, false, 'unknown item rejected');

  // Coins rejected (must use setCoinOffer).
  const coins = trade.addItemToTrade(a, 101, 5);
  eq(coins.ok, false, 'coins rejected via addItemToTrade');

  // Zero/negative count rejected.
  const zero = trade.addItemToTrade(a, 230, 0);
  eq(zero.ok, false, 'zero count rejected');
  const neg  = trade.addItemToTrade(a, 230, -3);
  eq(neg.ok, false, 'negative count rejected');

  // Quantity larger than inventory.
  const tooMany = trade.addItemToTrade(a, 230, 99);
  eq(tooMany.ok, false, 'insufficient inventory rejected');

  // Happy add.
  const good = trade.addItemToTrade(a, 230, 2);
  eq(good.ok, true, 'valid add ok');
  eq(invCount(a, 230), 0, 'all shrimps escrowed');

  trade.cancelTrade(a);
}

// ── 5. removeItemFromTrade returns items and resets confirms ────────────────
section('5. removeItemFromTrade returns items, resets confirms');

{
  const a = makePlayer('Alice5', { 230: 3 });
  const b = makePlayer('Bob5');
  trade.acceptTrade(b, trade.requestTrade(a, b).requestId);
  trade.addItemToTrade(a, 230, 3); // 3 non-stackable slots
  trade.confirmTrade(a); // stage 1 on A
  trade.confirmTrade(b); // stage 1 on B
  const snap1 = trade.getOpenTrade(a);
  assert(snap1.initiator.confirmed[0] && snap1.target.confirmed[0],
    'both sides stage-1 confirmed');

  // Non-stackable items take one slot each — removing slot 0 returns 1 item.
  const rem = trade.removeItemFromTrade(a, 0);
  eq(rem.ok, true, 'remove ok');
  eq(invCount(a, 230), 1, '1 item returned on remove (non-stackable = 1/slot)');

  const snap2 = trade.getOpenTrade(a);
  eq(snap2.initiator.confirmed[0], false, 'A confirm[0] reset after remove');
  eq(snap2.target.confirmed[0],    false, 'B confirm[0] reset after remove');

  // Bad slot index.
  const bad = trade.removeItemFromTrade(a, 99);
  eq(bad.ok, false, 'bad slot index rejected');

  trade.cancelTrade(a);
}

// ── 6. setCoinOffer escrows / refunds correctly ─────────────────────────────
section('6. setCoinOffer: increase escrows, decrease refunds');

{
  const a = makePlayer('Alice6', { 101: 1000 });
  const b = makePlayer('Bob6');
  trade.acceptTrade(b, trade.requestTrade(a, b).requestId);

  eq(trade.setCoinOffer(a, 300).ok, true, 'set 300 ok');
  eq(invCount(a, 101), 700, 'A inv shows 700 after escrowing 300');

  eq(trade.setCoinOffer(a, 500).ok, true, 'increase to 500 ok');
  eq(invCount(a, 101), 500, 'A inv shows 500 after escrowing 500 total');

  eq(trade.setCoinOffer(a, 100).ok, true, 'decrease to 100 ok');
  eq(invCount(a, 101), 900, 'A inv shows 900 after partial refund');

  eq(trade.setCoinOffer(a, 0).ok, true, 'drop to 0 ok');
  eq(invCount(a, 101), 1000, 'A inv back to full after zeroing offer');

  // Overdraft rejected.
  const over = trade.setCoinOffer(a, 99999);
  eq(over.ok, false, 'over-draft rejected');

  trade.cancelTrade(a);
}

// ── 7–8. Double-confirm flow + mutation reset ──────────────────────────────
section('7-8. Double-confirm flow + mutation reset');

{
  const a = makePlayer('Alice78', { 230: 5 });
  const b = makePlayer('Bob78',   { 235: 1 });
  trade.acceptTrade(b, trade.requestTrade(a, b).requestId);
  trade.addItemToTrade(a, 230, 3);
  trade.addItemToTrade(b, 235, 1);

  const c1 = trade.confirmTrade(a);
  eq(c1.ok, true, 'A first confirm ok');
  eq(c1.stage, 1, 'A first confirm at stage 1 (waiting on B)');

  const c2 = trade.confirmTrade(b);
  eq(c2.ok, true, 'B first confirm ok');
  // Now both stage[0]==true -> may report stage 1 still, expecting stage 2 next.
  const snap = trade.getOpenTrade(a);
  assert(snap.initiator.confirmed[0] && snap.target.confirmed[0],
    'both sides at confirm[0]=true');

  // Mutation: A adds one more item. Both confirms should reset.
  trade.addItemToTrade(a, 230, 1);
  const snap2 = trade.getOpenTrade(a);
  eq(snap2.initiator.confirmed[0], false, 'A confirm reset after mutation');
  eq(snap2.target.confirmed[0],    false, 'B confirm also reset (bait-and-switch guard)');

  // Re-confirm both, then both second-confirm -> commit.
  trade.confirmTrade(a);
  trade.confirmTrade(b);
  const first2 = trade.confirmTrade(a);
  eq(first2.ok, true, 'A second confirm ok');
  const final = trade.confirmTrade(b);
  eq(final.ok, true, 'B second confirm ok');
  eq(final.completed, true, 'trade completed on both-side double-confirm');
  eq(trade.getOpenTrade(a), null, 'session closed after completion');

  // Post-swap inventories.
  eq(invCount(a, 235), 1, 'A received lobster');
  eq(invCount(b, 230), 4, 'B received shrimps (3 + mutation 1)');
  eq(invCount(a, 230), 1, 'A retains 1 shrimp (5 - 4 traded)');
}

// ── 9. Audit log has tuple only (never full inventory) ─────────────────────
section('9. Audit log recorded, tuple-only');

{
  const hist = trade.listHistory(null, 5);
  assert(hist.length >= 1, 'global history has an entry');
  const e = hist[0];
  assert(!!e.tradeId, 'entry has tradeId');
  assert(!!e.initiator && !!e.target, 'entry has both sides');
  assert(Array.isArray(e.initiator.gave), 'entry records initiator.gave');
  assert(typeof e.initiator.coinsGave === 'number', 'entry records initiator.coinsGave');
  // Tuple should NOT leak anything outside the trade (no `inventory` key).
  assert(!('inventory' in e.initiator), 'no inventory leak on initiator');
  assert(!('inventory' in e.target),    'no inventory leak on target');
}

// ── 10. Per-player listHistory filters correctly ───────────────────────────
section('10. listHistory filters to caller');

{
  const a = findPlayer('Alice78');
  const b = findPlayer('Bob78');
  const c = makePlayer('Carol10');
  const mine = trade.listHistory(a, 5);
  assert(mine.length >= 1, 'Alice sees her completed trade');
  assert(mine.every(e => e.initiator.id === a.id || e.target.id === a.id),
    'only Alice-involved entries returned');
  const none = trade.listHistory(c, 5);
  eq(none.length, 0, 'Carol (uninvolved) sees no history');
}

// ── 11. Swap aborts if recipient is at full inventory ──────────────────────
section('11. Atomic swap: full-inventory recipient aborts swap');

{
  // Make B's inventory fill up so there's no room for A's items.
  const a = makePlayer('Alice11', { 230: 3 });
  const b = makePlayer('Bob11', {});
  // Fill B with 28 distinct item keys.
  for (let i = 0; i < 28; i++) b.inventory[2000 + i] = 1;
  trade.acceptTrade(b, trade.requestTrade(a, b).requestId);
  trade.addItemToTrade(a, 230, 3);
  trade.confirmTrade(a); trade.confirmTrade(b);
  trade.confirmTrade(a);
  const res = trade.confirmTrade(b);
  eq(res.ok, false, 'swap rejected when recipient is full');
  // Both sides should have their escrow refunded.
  eq(invCount(a, 230), 3, 'A refunded after aborted swap');
}

// ── 12. Ironman guard blocks non-group ironman ─────────────────────────────
section('12. Ironman guard blocks non-group ironman');

{
  const a = makePlayer('AliceIM');
  const b = makePlayer('BobNormal');
  ironman.enableMode(a, 'ironman');
  const res = trade.requestTrade(a, b);
  eq(res.ok, false, 'ironman A cannot initiate trade');
  assert(/ironman/i.test(res.reason) || /trade/i.test(res.reason),
    'reason mentions ironman/trade');

  const n = makePlayer('Normie12');
  const i = makePlayer('IronTarget');
  ironman.enableMode(i, 'ironman');
  const r2 = trade.requestTrade(n, i);
  eq(r2.ok, false, 'normal player cannot trade WITH an ironman');
}

// ── 13. Group ironman CAN trade with group mate ────────────────────────────
section('13. Group ironman trades with group mate');

{
  const a = makePlayer('GroupA');
  const b = makePlayer('GroupB');
  ironman.enableMode(a, 'group_ironman');
  ironman.enableMode(b, 'group_ironman');
  ironman.groupAdd(a, b.id);
  ironman.groupAdd(b, a.id);
  const req = trade.requestTrade(a, b);
  eq(req.ok, true, 'GIM A -> GIM B request ok (group mate)');
  const acc = trade.acceptTrade(b, req.requestId);
  eq(acc.ok, true, 'GIM B accepts GIM A');
  trade.cancelTrade(a);

  // Non-group GIM is rejected.
  const c = makePlayer('GroupC_Outsider');
  ironman.enableMode(c, 'group_ironman');
  const req2 = trade.requestTrade(a, c);
  eq(req2.ok, false, 'GIM A cannot trade with non-group GIM C');
}

// ── 14. Distance gate ──────────────────────────────────────────────────────
section('14. Distance > 3 tiles rejects');

{
  const a = makePlayer('FarA', {}, { x: 100, y: 100, layer: 0 });
  const b = makePlayer('FarB', {}, { x: 110, y: 100, layer: 0 });
  const res = trade.requestTrade(a, b);
  eq(res.ok, false, 'distance 10 rejected');
  assert(/far/i.test(res.reason) || /distance/i.test(res.reason),
    'reason mentions distance');

  // Cross-layer is effectively infinite.
  const c = makePlayer('LayerC', {}, { x: 100, y: 100, layer: 0 });
  const d = makePlayer('LayerD', {}, { x: 100, y: 100, layer: 3 });
  const res2 = trade.requestTrade(c, d);
  eq(res2.ok, false, 'cross-layer rejected');
}

// ── 15. Combat gate ────────────────────────────────────────────────────────
section('15. In-combat rejects');

{
  const a = makePlayer('FightA');
  const b = makePlayer('FightB');
  a.combatTarget = 'some_npc';
  const res = trade.requestTrade(a, b);
  eq(res.ok, false, 'combat-engaged A rejected');
  a.combatTarget = null;

  b.combatTarget = 'some_npc';
  const res2 = trade.requestTrade(a, b);
  eq(res2.ok, false, 'combat-engaged B rejected');
  b.combatTarget = null;
}

// ── 16. Trade-mute gate ────────────────────────────────────────────────────
section('16. Trade-muted rejects');

{
  const a = makePlayer('MutedA');
  const b = makePlayer('MutedB');
  a.tradeMuted = true;
  const res = trade.requestTrade(a, b);
  eq(res.ok, false, 'muted A rejected');
  a.tradeMuted = false;

  b.tradeMuted = true;
  const res2 = trade.requestTrade(a, b);
  eq(res2.ok, false, 'muted B rejected');
  b.tradeMuted = false;
}

// ── 17. Slot cap at 28 ─────────────────────────────────────────────────────
section('17. Slot cap at 28 items per side');

{
  const a = makePlayer('CapA', { 230: 50 }); // 50 shrimps (non-stackable in our model — actually they're not declared stackable in items.js so they'd need 50 slots)
  const b = makePlayer('CapB');
  trade.acceptTrade(b, trade.requestTrade(a, b).requestId);

  // Cooked shrimps aren't stackable (per items.js), so each adds one slot.
  // 28 should succeed, 29th rejected.
  const ok28 = trade.addItemToTrade(a, 230, 28);
  eq(ok28.ok, true, 'can add 28 non-stackable items');
  const fail29 = trade.addItemToTrade(a, 230, 1);
  eq(fail29.ok, false, '29th item rejected (cap)');

  trade.cancelTrade(a);
  eq(invCount(a, 230), 50, 'full refund after cap test');
}

// ── 18. Coin cap clamp ─────────────────────────────────────────────────────
section('18. Coin cap clamps / rejects insane values');

{
  const a = makePlayer('CoinA', { 101: 100 });
  const b = makePlayer('CoinB');
  trade.acceptTrade(b, trade.requestTrade(a, b).requestId);

  // Negative clamps to 0.
  const neg = trade.setCoinOffer(a, -5);
  eq(neg.ok, true, 'negative clamped (no throw)');
  eq(neg.coins, 0, 'negative coin offer -> 0');

  // Non-integer is coerced.
  const frac = trade.setCoinOffer(a, 10.9);
  eq(frac.ok, true, 'fractional accepted (floored)');
  eq(frac.coins, 10, '10.9 coins floored to 10');

  trade.cancelTrade(a);
}

// ── 19. Second/simultaneous trade rejected ─────────────────────────────────
section('19. Cannot be in two trades at once');

{
  const a = makePlayer('TwoA');
  const b = makePlayer('TwoB');
  const c = makePlayer('TwoC');
  trade.acceptTrade(b, trade.requestTrade(a, b).requestId);
  const bad = trade.requestTrade(a, c);
  eq(bad.ok, false, 'A in-trade cannot request second trade');
  const bad2 = trade.requestTrade(c, b);
  eq(bad2.ok, false, 'cannot request trade with already-busy B');
  trade.cancelTrade(a);
}

// ── 20. Self-trade rejected ────────────────────────────────────────────────
section('20. Self-trade rejected');

{
  const a = makePlayer('SoloA');
  const res = trade.requestTrade(a, a);
  eq(res.ok, false, 'self-trade rejected');
}

// ── 21. Commands register ──────────────────────────────────────────────────
section('21. Commands register cleanly');

{
  const fakeRegistry = {
    _cmds: new Map(),
    register(name, opts) { this._cmds.set(name, opts); },
  };
  const playerLib = require('../src/player/player');
  tradeCommands.register({
    commands: fakeRegistry,
    items,
    playerLib,
    findPlayer,
    getTick: () => 0,
    notify: () => {},
    ironman,
  });
  assert(fakeRegistry._cmds.has('trade'), 'trade command registered');
  const cmd = fakeRegistry._cmds.get('trade');
  assert(typeof cmd.fn === 'function', 'trade fn is a function');

  // Status when no trade.
  const p = makePlayer('CmdTester');
  const out1 = cmd.fn(p, ['status']);
  assert(/No active trade/.test(out1), 'status with no trade mentions "No active trade"');

  // Help via a bad sub-command token (unknown verb).
  const p2 = makePlayer('CmdTester2');
  const help = cmd.fn(p2, ['pigeon_bad_cmd_xyz']);
  // Unknown verb is treated as a player name for request; should say "no such player".
  assert(typeof help === 'string' && help.length > 0, 'unknown sub produces a string response');
}

// ── 21b. routeTradeOrGE hook ───────────────────────────────────────────────
section('21b. routeTradeOrGE hook routes correctly');

{
  const a = makePlayer('RouteA');
  const b = makePlayer('RouteB');
  const far = makePlayer('RouteFar', {}, { x: 200, y: 200, layer: 0 });

  const direct = trade.routeTradeOrGE(a, { target: b });
  eq(direct.route, 'trade', 'adjacent pair routes to trade');

  const none = trade.routeTradeOrGE(a, {});
  eq(none.route, 'ge', 'no target routes to ge');

  const unreachable = trade.routeTradeOrGE(a, { target: far });
  eq(unreachable.route, 'ge', 'far target falls back to ge');
}

// ── 22. Audit log persisted to data/trade-log.json ─────────────────────────
section('22. Audit log persisted');

{
  const fp = path.join(tmpDataDir, 'trade-log.json');
  assert(fs.existsSync(fp), 'trade-log.json written');
  const parsed = JSON.parse(fs.readFileSync(fp, 'utf8'));
  assert(Array.isArray(parsed), 'log is a JSON array');
  assert(parsed.length >= 1, 'log has at least one entry');
  // Entries only contain the tuple (no inventory dump).
  for (const e of parsed) {
    assert(!!e.initiator && !!e.target, 'entry has both sides');
    assert(!('inventory' in e.initiator) && !('inventory' in e.target),
      'entry has no inventory leak');
  }
}

// ── Summary ─────────────────────────────────────────────────────────────────
console.log(`\n── Results ──`);
console.log(`  ${passed} passed, ${failed} failed`);
if (failures.length) {
  console.log('\nFAILURES:');
  for (const f of failures) console.log('  - ' + f);
  process.exit(1);
}
process.exit(0);
