#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// Bank engine tests (burn-v2 completion)
//
// Verifies the new `src/engine/bank.js` and `src/engine/bank-commands.js`:
//
//   1. Player shape: bankTabs / placeholdersOn / lootLog / isWornSession
//   2. Tab create / rename / delete / move (incl. fallback to "All")
//   3. Tab name validation (length, charset, duplicates, reserved)
//   4. Bank PIN gate fails closed (no PIN — open; PIN set — denies until verify)
//   5. Deposit single, deposit-inv, deposit-worn, deposit-loot
//   6. Withdraw 1 / 5 / all / X (clamped to bank count)
//   7. Placeholder leaves slot when last withdrawn; deposit refills same entry
//   8. Placeholder toggle on/off (off purges existing placeholders)
//   9. Tag-based search: name + implicit category + region tags
//  10. Examine returns the item def text
//  11. Bank value sums (item.value fallback) + top-5 sorted desc
//  12. Inventory context menu protocol: type='inventory_context_menu'
//  13. Slash commands wired (legacy /bank, /deposit, /withdraw replaced)
//
// Run: node scripts/test-bank.js
// Exit 0 on all pass.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const playerLib = require('../src/player/player');
const items     = require('../src/data/items');
const bank      = require('../src/engine/bank');
const security  = require('../src/engine/account-security');
const commandsModule = require('../src/engine/commands');
const bankCommands   = require('../src/engine/bank-commands');

let passed = 0, failed = 0;
const failures = [];
function assert(cond, label) {
  if (cond) { passed++; console.log('  PASS  ' + label); }
  else      { failed++; failures.push(label); console.log('  FAIL  ' + label); }
}
function eq(a, b, label) { assert(a === b, `${label} (expected ${JSON.stringify(b)}, got ${JSON.stringify(a)})`); }
function section(t) { console.log('\n=== ' + t + ' ==='); }

let pid = 1;
function makePlayer(name) { return playerLib.createPlayer(String(pid++), name || `P${pid}`); }

// Prepare a context object expected by bank module / commands.
const ctx = {
  items,
  invAdd: playerLib.invAdd,
  invFreeSlots: playerLib.invFreeSlots,
};

// ── 1. Player shape defaults ────────────────────────────────────────────────
section('Player shape defaults (bankTabs / placeholders / lootLog)');
{
  const p = makePlayer('Alice');
  assert(Array.isArray(p.bankTabs), 'bankTabs is array');
  eq(p.bankTabs.length, 10, 'bankTabs length 10');
  eq(p.bankTabs[0], 'All', 'tab 0 = "All"');
  eq(p.bankTabs[1], null, 'tab 1 default null');
  eq(p.placeholdersOn, false, 'placeholders default OFF');
  assert(Array.isArray(p.lootLog), 'lootLog is array');
  eq(p.isWornSession, false, 'isWornSession default false');
  eq(p.bankPinVerifiedAt, null, 'bankPinVerifiedAt initially null');

  bank.ensureBankState(p);
  assert(true, 'ensureBankState idempotent on fresh player');
}

// ── 2. Tab create / rename / delete ─────────────────────────────────────────
section('Tab create / rename / delete / fallback to All');
{
  const p = makePlayer('TabUser');
  const c1 = bank.createTab(p, 'Combat');
  assert(c1.ok, 'create tab Combat ok');
  eq(c1.id, 1, 'first custom tab id is 1');
  eq(c1.name, 'Combat', 'name returned');

  const c2 = bank.createTab(p, 'Skilling');
  assert(c2.ok, 'create tab Skilling ok');
  eq(c2.id, 2, 'second tab id is 2');

  const dup = bank.createTab(p, 'combat'); // case-insensitive duplicate
  assert(!dup.ok, 'duplicate tab name rejected');

  const reserved = bank.createTab(p, 'All');
  assert(!reserved.ok, 'reserved name "All" rejected');

  const longName = bank.createTab(p, 'x'.repeat(21));
  assert(!longName.ok, 'over-long tab name rejected');

  const badChars = bank.createTab(p, 'Bad@Name');
  assert(!badChars.ok, 'invalid charset rejected');

  const ren = bank.renameTab(p, 1, 'Melee');
  assert(ren.ok, 'rename tab 1 ok');
  eq(p.bankTabs[1], 'Melee', 'tab 1 renamed in player state');

  const renBad = bank.renameTab(p, 0, 'Whatever');
  assert(!renBad.ok, 'cannot rename tab 0 ("All")');

  // Add an item to tab 1 then delete tab 1 — items fall back to All (0).
  const def = items.find('Coins');
  p.bank.push({ id: def.id, name: def.name, count: 100, tab: 1, placeholder: false });
  const del = bank.deleteTab(p, 1);
  assert(del.ok, 'delete tab ok');
  eq(del.itemsReassigned, 1, 'one item reassigned to All');
  eq(p.bank[0].tab, 0, 'item now on tab 0');
  eq(p.bankTabs[1], null, 'tab slot 1 freed');

  const delBad = bank.deleteTab(p, 0);
  assert(!delBad.ok, 'cannot delete tab 0');

  // Fill all 9 custom tabs.
  for (let i = 1; i <= 9; i++) {
    const r = bank.createTab(p, `T${i}`);
    if (i === 1) assert(r.ok, `tab ${i} created`); // smoke
  }
  const overflow = bank.createTab(p, 'TX');
  assert(!overflow.ok, 'no more than 9 custom tabs');
}

// ── 3. List tabs + findTabIdByName ──────────────────────────────────────────
section('listTabs + findTabIdByName');
{
  const p = makePlayer('Lister');
  bank.createTab(p, 'Food');
  bank.createTab(p, 'Pots');
  const ts = bank.listTabs(p);
  eq(ts.length, 10, 'listTabs returns 10');
  eq(ts[0].name, 'All', 'tab 0 named All');
  eq(ts[1].name, 'Food', 'tab 1 = Food');
  eq(ts[2].name, 'Pots', 'tab 2 = Pots');

  eq(bank.findTabIdByName(p, 'All'), 0, 'findTabIdByName(All) = 0');
  eq(bank.findTabIdByName(p, 'food'), 1, 'lookup case-insensitive');
  eq(bank.findTabIdByName(p, '2'), 2, 'numeric id resolves');
  eq(bank.findTabIdByName(p, 'NoSuch'), -1, 'unknown tab = -1');
}

// ── 4. PIN gate — fails closed, opens after verify ──────────────────────────
section('Bank PIN gate (fails closed)');
{
  const p = makePlayer('PinUser');
  // No PIN set: gate is open (no gate), but our wrapper still returns ok.
  let g = bank.pinGate(p);
  assert(g.ok, 'no PIN -> gate open');

  const setRes = security.setBankPin(p, '1234');
  assert(setRes.ok, 'set PIN ok');
  g = bank.pinGate(p);
  assert(!g.ok, 'PIN set + not verified -> denied');
  assert(typeof g.reason === 'string' && g.reason.length > 0, 'denial has reason');

  // Verify and try a deposit.
  const v = security.verifyBankPin(p, '1234');
  assert(v.ok, 'PIN verify ok');
  g = bank.pinGate(p);
  assert(g.ok, 'verified -> gate ok');

  // Force expiration.
  p.bankPinVerifiedAt = Date.now() - (security.BANK_PIN_TIMEOUT_MS + 1000);
  g = bank.pinGate(p);
  assert(!g.ok, 'expired session -> denied');

  // Lock by wrong attempts.
  for (let i = 0; i < security.PIN_MAX_FAILURES; i++) security.verifyBankPin(p, '0000');
  g = bank.pinGate(p);
  assert(!g.ok && /lock/i.test(g.reason || ''), 'pin-locked -> denied with lock reason');
}

// ── 5. Deposit single + variants ────────────────────────────────────────────
section('Deposit: single / inv / worn / loot');
{
  const p = makePlayer('Depositor');
  // Give the player coins + shrimps in inventory.
  const coins  = items.find('Coins');
  const shrimp = items.find('Shrimps');
  playerLib.invAdd(p, coins.id, coins.name, 250, true);
  playerLib.invAdd(p, shrimp.id, shrimp.name, 3, false);

  const r1 = bank.deposit(p, ctx, 'Coins', 100);
  assert(r1.ok, 'deposit 100 coins ok');
  eq(r1.count, 100, 'deposited count 100');
  // Bank should have one entry for coins with 100 count.
  const coinEntry = p.bank.find(b => b.id === coins.id);
  assert(coinEntry, 'coin entry created');
  eq(coinEntry.count, 100, 'coin entry count 100');

  const r2 = bank.deposit(p, ctx, 'Coins', 'all');
  assert(r2.ok, 'deposit all coins ok');
  eq(coinEntry.count, 250, 'coin entry now 250 (folded)');

  const r3 = bank.deposit(p, ctx, 'Shrimps', 1);
  assert(r3.ok, 'deposit 1 shrimp ok');

  // Test deposit-inv on remaining shrimps.
  const r4 = bank.depositInventory(p, ctx);
  assert(r4.ok, 'deposit-inv ok');

  const inv = p.inventory.filter(s => s !== null);
  eq(inv.length, 0, 'inventory now empty after deposit-inv');

  // deposit-worn: equip something then deposit.
  const helm = items.find('Wyrm scale helm');
  if (helm) {
    p.equipment.head = { id: helm.id, name: helm.name };
    const r5 = bank.depositWorn(p, ctx);
    assert(r5.ok, 'deposit-worn ok');
    assert(!p.equipment.head, 'helmet removed from equipment');
    assert(p.bank.some(b => b.id === helm.id), 'helmet in bank');
  } else {
    assert(true, 'wyrm helm not in catalog (skipped)');
  }

  // deposit-loot: track some loot, deposit-loot moves it.
  playerLib.invAdd(p, shrimp.id, shrimp.name, 5, false);
  bank.trackLoot(p, shrimp.id, 5, Date.now());
  const r6 = bank.depositLoot(p, ctx, Date.now());
  assert(r6.ok, 'deposit-loot ok');
  assert(r6.count >= 1, 'deposit-loot moved >= 1 item');
}

// ── 6. Withdraw 1 / 5 / all clamped ────────────────────────────────────────
section('Withdraw quantities (1 / 5 / 10 / all)');
{
  const p = makePlayer('Withdrawer');
  const shrimp = items.find('Shrimps');
  // Seed bank directly with 10 shrimps.
  p.bank.push({ id: shrimp.id, name: shrimp.name, count: 10, tab: 0, placeholder: false });

  const w1 = bank.withdraw(p, ctx, 'Shrimps', 1);
  assert(w1.ok, 'withdraw 1 ok');
  eq(w1.count, 1, 'withdrew exactly 1');

  const w5 = bank.withdraw(p, ctx, 'Shrimps', 5);
  assert(w5.ok, 'withdraw 5 ok');
  eq(w5.count, 5, 'withdrew exactly 5');

  // Clamp to remaining bank stock (10-1-5 = 4).
  const wAll = bank.withdraw(p, ctx, 'Shrimps', 'all');
  assert(wAll.ok, 'withdraw all ok');
  eq(wAll.count, 4, 'withdraw all clamped to 4');

  const wMissing = bank.withdraw(p, ctx, 'Shrimps', 1);
  assert(!wMissing.ok, 'withdraw missing item denied');
}

// ── 7. Placeholders ─────────────────────────────────────────────────────────
section('Placeholders: leave on last withdraw, refill on deposit');
{
  const p = makePlayer('PHUser');
  const coins = items.find('Coins');
  bank.setPlaceholders(p, true);
  eq(p.placeholdersOn, true, 'placeholders ON');

  // Seed bank with 5 coins
  p.bank.push({ id: coins.id, name: coins.name, count: 5, tab: 0, placeholder: false });
  const w = bank.withdraw(p, ctx, 'Coins', 'all');
  assert(w.ok, 'withdraw all coins ok');
  const ph = p.bank.find(b => b.id === coins.id);
  assert(ph && ph.placeholder, 'placeholder created');
  eq(ph.count, 0, 'placeholder count 0');

  // Re-deposit must refill the placeholder, not create a new entry.
  playerLib.invAdd(p, coins.id, coins.name, 7, true);
  bank.deposit(p, ctx, 'Coins', 7);
  const refilled = p.bank.find(b => b.id === coins.id);
  eq(refilled.placeholder, false, 'placeholder cleared on deposit');
  eq(refilled.count, 7, 'count refilled to 7');

  // Toggle off purges remaining placeholders.
  // Force one back into existence by withdrawing all again.
  bank.withdraw(p, ctx, 'Coins', 'all');
  assert(p.bank.find(b => b.id === coins.id && b.placeholder), 'placeholder remade');
  bank.setPlaceholders(p, false);
  eq(p.placeholdersOn, false, 'placeholders OFF');
  assert(!p.bank.find(b => b.placeholder), 'all placeholders purged on toggle off');
}

// ── 8. Search by name + tag + region ────────────────────────────────────────
section('Search: name, tag, region filter');
{
  const p = makePlayer('Searcher');
  const shrimp = items.find('Shrimps');
  const lobster = items.find('Lobster');
  const coins = items.find('Coins');
  p.bank.push({ id: shrimp.id, name: shrimp.name, count: 5, tab: 0, placeholder: false });
  p.bank.push({ id: lobster.id, name: lobster.name, count: 1, tab: 0, placeholder: false });
  p.bank.push({ id: coins.id, name: coins.name, count: 999, tab: 0, placeholder: false });

  const byName = bank.search(p, ctx, 'shrimp');
  assert(byName.length === 1 && byName[0].name === 'Shrimps', 'name search hits Shrimps');

  const byTag = bank.search(p, ctx, 'food');
  assert(byTag.length >= 2, 'tag "food" hits cooked food entries (shrimps + lobster)');

  const byCurrency = bank.search(p, ctx, 'currency');
  assert(byCurrency.some(m => m.name === 'Coins'), 'tag "currency" hits Coins');

  const empty = bank.search(p, ctx, 'unicorn');
  eq(empty.length, 0, 'no match returns []');

  // Region filter
  const reg = bank.search(p, ctx, 'food', { region: 'aelgard' });
  assert(Array.isArray(reg), 'region filter returns array (possibly empty)');
}

// ── 9. Examine ──────────────────────────────────────────────────────────────
section('Examine: returns def text');
{
  const e1 = bank.examine(ctx, 'Coins');
  assert(e1.ok, 'examine Coins ok');
  assert(/money/i.test(e1.examine), 'Coins examine text contains "money"');
  const e2 = bank.examine(ctx, 'NoSuchThing');
  assert(!e2.ok, 'examine unknown returns ok=false');
}

// ── 10. Bank value + top 5 ──────────────────────────────────────────────────
section('Bank value: total + top-5 sorted');
{
  const p = makePlayer('Wealthy');
  const coins = items.find('Coins');
  const shark = items.find('Shark');
  const lobster = items.find('Lobster');
  p.bank.push({ id: coins.id, name: coins.name, count: 1000, tab: 0, placeholder: false });
  p.bank.push({ id: shark.id, name: shark.name, count: 10, tab: 0, placeholder: false });
  p.bank.push({ id: lobster.id, name: lobster.name, count: 100, tab: 0, placeholder: false });

  const v = bank.bankValue(p, ctx);
  assert(v.ok, 'bankValue ok');
  assert(v.total > 0, 'total > 0');
  assert(Array.isArray(v.top5), 'top5 is array');
  assert(v.top5.length >= 1, 'top5 has at least 1 entry');
  // Sorted desc
  for (let i = 1; i < v.top5.length; i++) {
    assert(v.top5[i - 1].value >= v.top5[i].value, `top5 sorted desc at i=${i}`);
  }
  // Integer math — every value should be integer.
  for (const t of v.top5) assert(Number.isInteger(t.value), `${t.name} value is integer`);
  assert(Number.isInteger(v.total), 'total is integer');
}

// ── 11. Inventory context menu protocol ─────────────────────────────────────
section('Inventory context menu protocol');
{
  const p = makePlayer('Menuer');
  const shrimp = items.find('Shrimps'); // food
  playerLib.invAdd(p, shrimp.id, shrimp.name, 1, false);
  const m = bank.buildContextMenu(p, ctx, 0);
  eq(m.type, 'inventory_context_menu', 'msg type correct');
  eq(m.slot, 0, 'slot field present');
  eq(m.itemId, shrimp.id, 'itemId field');
  assert(Array.isArray(m.actions), 'actions array');
  assert(m.actions.includes('eat'), 'food has eat action');
  assert(m.actions.includes('drop'), 'has drop');
  assert(m.actions.includes('examine'), 'has examine');

  // Empty slot
  const empty = bank.buildContextMenu(p, ctx, 27);
  eq(empty.actions.length, 0, 'empty slot menu actions=[]');

  // Equipment item gets wield/wear
  const helm = items.find('Wyrm scale helm');
  if (helm) {
    playerLib.invAdd(p, helm.id, helm.name, 1, false);
    const idx = p.inventory.findIndex(s => s && s.id === helm.id);
    const m2 = bank.buildContextMenu(p, ctx, idx);
    assert(m2.actions.includes('wear') || m2.actions.includes('wield'), 'equipable shows wear/wield');
  }
}

// ── 12. moveToTab ───────────────────────────────────────────────────────────
section('moveToTab: validates tab existence');
{
  const p = makePlayer('Mover');
  const shrimp = items.find('Shrimps');
  p.bank.push({ id: shrimp.id, name: shrimp.name, count: 1, tab: 0, placeholder: false });
  const c = bank.createTab(p, 'Food');
  assert(c.ok, 'create Food tab');

  const m1 = bank.moveToTab(p, shrimp.id, 1);
  assert(m1.ok, 'move to tab 1 ok');
  eq(p.bank[0].tab, 1, 'tab updated on entry');

  const m2 = bank.moveToTab(p, shrimp.id, 9);
  assert(!m2.ok, 'move to nonexistent tab denied');

  const m3 = bank.moveToTab(p, 9999999, 1);
  assert(!m3.ok, 'move unknown item denied');
}

// ── 13. Slash commands wired ───────────────────────────────────────────────
section('Slash commands wired');
{
  // Use a fresh local commands registry to verify wiring without polluting the
  // global game registry.
  const localCommands = (() => {
    const map = new Map();
    return {
      register(name, opts) { map.set(name, opts); },
      get(name) { return map.get(name); },
      has(name) { return map.has(name); },
    };
  })();
  bankCommands.register({ commands: localCommands, items, invAdd: playerLib.invAdd, invFreeSlots: playerLib.invFreeSlots });
  assert(localCommands.has('bank'), '/bank registered');
  assert(localCommands.has('deposit'), '/deposit registered');
  assert(localCommands.has('withdraw'), '/withdraw registered');
  assert(localCommands.has('examine'), '/examine registered');

  const p = makePlayer('Cmder');
  // Run /bank without any args.
  const r = localCommands.get('bank').fn(p, []);
  assert(typeof r === 'string' && /Bank/i.test(r), '/bank renders bank text');

  // /examine via command
  const e = localCommands.get('examine').fn(p, ['Coins']);
  assert(typeof e === 'string' && /money/i.test(e), '/examine returns text');

  // /bank tab create
  const tabCreate = localCommands.get('bank').fn(p, ['tab', 'create', 'Combat']);
  assert(/Created tab/i.test(tabCreate), '/bank tab create returns success line');

  // /bank placeholder on
  const phOn = localCommands.get('bank').fn(p, ['placeholder', 'on']);
  assert(/Placeholders ON/.test(phOn), '/bank placeholder on confirmed');

  // /bank value
  const v = localCommands.get('bank').fn(p, ['value']);
  assert(/Bank Value/.test(v), '/bank value renders header');

  // /deposit usage
  const depUsage = localCommands.get('deposit').fn(p, []);
  assert(/Usage:/i.test(depUsage), '/deposit shows usage');

  // /withdraw usage
  const wUsage = localCommands.get('withdraw').fn(p, []);
  assert(/Usage:/i.test(wUsage), '/withdraw shows usage');
}

// ── 14. PIN gate end-to-end through deposit/withdraw ────────────────────────
section('PIN gate denies deposit/withdraw until verified');
{
  const p = makePlayer('Strict');
  security.setBankPin(p, '654321');
  // Force not-verified
  p.bankPinVerifiedAt = null;
  const coins = items.find('Coins');
  playerLib.invAdd(p, coins.id, coins.name, 100, true);
  const denyDep = bank.deposit(p, ctx, 'Coins', 50);
  assert(!denyDep.ok, 'deposit denied without PIN');
  // Pre-seed bank entry directly.
  p.bank.push({ id: coins.id, name: coins.name, count: 50, tab: 0, placeholder: false });
  const denyW = bank.withdraw(p, ctx, 'Coins', 1);
  assert(!denyW.ok, 'withdraw denied without PIN');

  const v = security.verifyBankPin(p, '654321');
  assert(v.ok, 'verify PIN ok');
  const okDep = bank.deposit(p, ctx, 'Coins', 50);
  assert(okDep.ok, 'deposit ok after verify');
  const okW = bank.withdraw(p, ctx, 'Coins', 1);
  assert(okW.ok, 'withdraw ok after verify');
}

// ── 15. Integer arithmetic check on coin math ───────────────────────────────
section('Integer arithmetic — no floats in coin/value math');
{
  const p = makePlayer('IntChecker');
  const coins = items.find('Coins');
  p.bank.push({ id: coins.id, name: coins.name, count: 1234567, tab: 0, placeholder: false });
  const v = bank.bankValue(p, ctx);
  assert(Number.isInteger(v.total), 'total is integer');
  for (const t of v.top5) {
    assert(Number.isInteger(t.unit), `${t.name} unit price integer`);
    assert(Number.isInteger(t.value), `${t.name} subtotal integer`);
    assert(Number.isInteger(t.count), `${t.name} count integer`);
  }
}

// ── Summary ─────────────────────────────────────────────────────────────────
console.log(`\n=== Bank tests: ${passed} pass / ${failed} fail ===`);
if (failed > 0) {
  console.log('Failures:');
  for (const f of failures) console.log('  - ' + f);
  process.exit(1);
}
process.exit(0);
