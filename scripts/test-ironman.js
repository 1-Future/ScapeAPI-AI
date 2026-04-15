#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// Ironman Account Mode — Engine Tests
//
// Verifies:
//   1.  enableMode sets each of the four variants and is one-way (permanent)
//   2.  isIronman is true for all variants, false for a normal player
//   3.  canTrade:
//        - false + reason for ironman vs non-ironman
//        - true for group members in group_ironman
//        - false for non-group members in group_ironman
//   4.  canUseGE is false for every ironman variant
//   5.  canLoot:
//        - denied when dropOwnerId belongs to a stranger
//        - allowed when dropOwnerId == player.id (killing blow)
//        - allowed within a group_ironman group
//        - allowed for unowned drops
//   6.  canBank:
//        - ultimate_ironman -> false
//        - others -> true
//   7.  canAcceptInvite:
//        - denied without a qualifying raid
//        - allowed when raid.contributionEqual === true
//        - allowed for an all-group raid
//   8.  onDeath:
//        - hardcore_ironman -> variant downgrades to ironman, hardcoreDied=true
//        - regular ironman/uim/gim -> untouched
//        - emits `hardcore_died` event exactly once
//   9.  save/load round-trip preserves variant + group (via JSON.stringify)
//   10. group_ironman cap at 4 members (GROUP_CAP = 4)
//   11. group invite + leave flow (leave downgrades to ironman permanently)
//   12. Real GE integration: placeOffer is rejected for an ironman via the
//       installGEHook wrapper
//
// Run: node scripts/test-ironman.js
// Exit 0 on all-pass, exit 1 on any failure.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const path = require('path');
const fs = require('fs');

// Sandbox persistence so tests never touch real data.
const tmpDataDir = path.join(__dirname, '..', '.tmp-ironman-test');
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

const events   = require('../src/engine/events');
const playerLib = require('../src/player/player');
const ironman  = require('../src/engine/ironman');
const commands = require('../src/engine/commands');
const ironmanCommands = require('../src/engine/ironman-commands');

// ── Test harness ────────────────────────────────────────────────────────────
let passed = 0, failed = 0;
const failures = [];

function assert(cond, label) {
  if (cond) { passed++; console.log('  PASS  ' + label); }
  else      { failed++; failures.push(label); console.log('  FAIL  ' + label); }
}
function eq(actual, expected, label) {
  assert(actual === expected,
    `${label} (expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)})`);
}
function section(title) { console.log('\n=== ' + title + ' ==='); }

// ── Fixture ─────────────────────────────────────────────────────────────────
let nextPid = 1;
function makePlayer(name) {
  const p = playerLib.createPlayer(String(nextPid++), name);
  return p;
}

// Hook a fake tick source so enabledAt is deterministic.
let currentTick = 100;
ironman.setTickSource(() => currentTick);

// Capture the hardcore_died events for test 8.
const hardcoreEvents = [];
events.on('hardcore_died', 'test-capture', (e) => hardcoreEvents.push(e));

// ── 1. enableMode (all four variants, one-way) ──────────────────────────────
section('enableMode sets each variant, is permanent');

for (const v of ['ironman', 'hardcore_ironman', 'ultimate_ironman', 'group_ironman']) {
  const p = makePlayer(`Enable_${v}`);
  const res = ironman.enableMode(p, v);
  eq(res.ok, true, `enableMode(${v}) ok`);
  eq(ironman.getVariant(p), v, `variant == ${v}`);
  eq(p.modeSet, true, `modeSet=true after enable (${v})`);
  assert(!!p.ironman.enabledAt, `enabledAt set (${v})`);
  // Legacy field kept in sync.
  const expectedLegacy = v === 'hardcore_ironman' ? 'hcim'
    : (v === 'ultimate_ironman' ? 'uim' : 'ironman');
  eq(p.accountMode, expectedLegacy, `legacy accountMode mirrors variant (${v} -> ${expectedLegacy})`);
  // Cannot change once set.
  const res2 = ironman.enableMode(p, 'ironman');
  eq(res2.ok, false, `enableMode is permanent (cannot re-set ${v})`);
}

// Unknown variant rejected.
{
  const p = makePlayer('BadVariant');
  const res = ironman.enableMode(p, 'pigeonman');
  eq(res.ok, false, 'Unknown variant rejected');
  eq(ironman.isIronman(p), false, 'Bad variant leaves player normal');
}

// ── 2. isIronman ────────────────────────────────────────────────────────────
section('isIronman detects every variant');

const normal = makePlayer('Normie');
eq(ironman.isIronman(normal), false, 'normal player is not ironman');

for (const v of ['ironman', 'hardcore_ironman', 'ultimate_ironman', 'group_ironman']) {
  const p = makePlayer(`IM_${v}`);
  ironman.enableMode(p, v);
  eq(ironman.isIronman(p), true, `isIronman true for ${v}`);
}

// ── 3. canTrade ─────────────────────────────────────────────────────────────
section('canTrade: ironman denied, group members allowed');

const tradeIronman = makePlayer('TradeIM');
ironman.enableMode(tradeIronman, 'ironman');
const someoneElse = makePlayer('SomeoneElse');
{
  const r = ironman.canTrade(tradeIronman, someoneElse);
  eq(r.allowed, false, 'ironman cannot trade with stranger');
  assert(typeof r.reason === 'string' && r.reason.length > 0, 'canTrade reason is non-empty');
}

const tradeGroup = makePlayer('TradeGIM');
ironman.enableMode(tradeGroup, 'group_ironman');
const groupMate = makePlayer('GroupMate');
const strangerOutside = makePlayer('OutsiderGIM');
ironman.groupAdd(tradeGroup, groupMate.id);
{
  const allowed = ironman.canTrade(tradeGroup, groupMate);
  eq(allowed.allowed, true, 'group_ironman CAN trade with group member');
  const denied = ironman.canTrade(tradeGroup, strangerOutside);
  eq(denied.allowed, false, 'group_ironman CANNOT trade with outsider');
}

// Normal player always allowed.
{
  const normie = makePlayer('NormalTrader');
  const r = ironman.canTrade(normie, someoneElse);
  eq(r.allowed, true, 'normal player can trade freely');
}

// ── 4. canUseGE ─────────────────────────────────────────────────────────────
section('canUseGE is false for every ironman variant');

for (const v of ['ironman', 'hardcore_ironman', 'ultimate_ironman', 'group_ironman']) {
  const p = makePlayer(`GE_${v}`);
  ironman.enableMode(p, v);
  const r = ironman.canUseGE(p);
  eq(r.allowed, false, `${v} denied GE access`);
  assert(r.reason.length > 0, `${v} GE denial has a reason`);
}
{
  const n = makePlayer('GENormal');
  const r = ironman.canUseGE(n);
  eq(r.allowed, true, 'normal player can use GE');
}

// ── 5. canLoot ──────────────────────────────────────────────────────────────
section('canLoot: killer allowed, stranger denied, group mates allowed');

const looter = makePlayer('Looter');
ironman.enableMode(looter, 'ironman');
{
  const r = ironman.canLoot(looter, 'stranger_id');
  eq(r.allowed, false, "ironman denied looting stranger's drop");
}
{
  const r = ironman.canLoot(looter, looter.id);
  eq(r.allowed, true, 'ironman allowed looting own drop (killing blow)');
}
{
  const r = ironman.canLoot(looter, null);
  eq(r.allowed, true, 'ironman allowed looting unowned drop');
}

const looterGim = makePlayer('LooterGIM');
ironman.enableMode(looterGim, 'group_ironman');
const gmate1 = makePlayer('GMate1');
ironman.groupAdd(looterGim, gmate1.id);
{
  const r = ironman.canLoot(looterGim, gmate1.id);
  eq(r.allowed, true, 'group_ironman allowed looting group mate drop');
}
{
  const r = ironman.canLoot(looterGim, 'outsider_id');
  eq(r.allowed, false, 'group_ironman denied looting outsider drop');
}

// ── 6. canBank ──────────────────────────────────────────────────────────────
section('canBank: uim false, others true');

for (const [v, expected] of [
  ['ironman', true],
  ['hardcore_ironman', true],
  ['ultimate_ironman', false],
  ['group_ironman', true],
]) {
  const p = makePlayer(`Bank_${v}`);
  ironman.enableMode(p, v);
  eq(ironman.canBank(p), expected, `canBank(${v}) == ${expected}`);
}
{
  const n = makePlayer('BankNormal');
  eq(ironman.canBank(n), true, 'normal player can bank');
}

// ── 7. canAcceptInvite ──────────────────────────────────────────────────────
section('canAcceptInvite: denied by default, allowed when contributionEqual');

const raider = makePlayer('Raider');
ironman.enableMode(raider, 'ironman');
{
  const r = ironman.canAcceptInvite(raider, null);
  eq(r.allowed, false, 'no raid -> denied');
}
{
  const r = ironman.canAcceptInvite(raider, { contributionEqual: false });
  eq(r.allowed, false, 'unequal contribution -> denied');
}
{
  const r = ironman.canAcceptInvite(raider, { contributionEqual: true });
  eq(r.allowed, true, 'contributionEqual=true -> allowed');
}
{
  const r = ironman.canAcceptInvite(raider, {
    members: [{ playerId: raider.id, contributionEqual: true }],
  });
  eq(r.allowed, true, 'per-member contributionEqual -> allowed');
}
// group_ironman: allowed if all members are group mates.
const raiderGim = makePlayer('RaiderGIM');
ironman.enableMode(raiderGim, 'group_ironman');
const groupMate2 = makePlayer('GroupMate2');
ironman.groupAdd(raiderGim, groupMate2.id);
{
  const raid = { members: [{ playerId: raiderGim.id }, { playerId: groupMate2.id }] };
  const r = ironman.canAcceptInvite(raiderGim, raid);
  eq(r.allowed, true, 'group_ironman all-mates raid -> allowed');
}
{
  const raid = { members: [{ playerId: raiderGim.id }, { playerId: 'outsider' }] };
  const r = ironman.canAcceptInvite(raiderGim, raid);
  eq(r.allowed, false, 'group_ironman with outsider -> denied');
}
// Normal player always allowed.
{
  const n = makePlayer('RaidNormal');
  const r = ironman.canAcceptInvite(n, null);
  eq(r.allowed, true, 'normal player can accept raid items');
}

// ── 8. onDeath (hardcore downgrade) ─────────────────────────────────────────
section('onDeath: hardcore_ironman -> ironman, event fires once');

hardcoreEvents.length = 0;

const hcPlayer = makePlayer('Hardcore');
ironman.enableMode(hcPlayer, 'hardcore_ironman');
eq(ironman.getVariant(hcPlayer), 'hardcore_ironman', 'variant starts as hardcore_ironman');

const res = ironman.onDeath(hcPlayer);
assert(!!res, 'onDeath returned a payload');
eq(ironman.getVariant(hcPlayer), 'ironman', 'variant downgraded to ironman after death');
eq(hcPlayer.ironman.hardcoreDied, true, 'hardcoreDied flag is set');
eq(hcPlayer.ironman.downgradedFrom, 'hardcore_ironman', 'downgradedFrom recorded');
eq(hcPlayer.accountMode, 'ironman', 'legacy accountMode downgraded as well');
eq(hardcoreEvents.length, 1, 'hardcore_died event fired exactly once');
eq(hardcoreEvents[0].playerId, hcPlayer.id, 'event playerId matches');

// Second death must NOT fire again.
const res2 = ironman.onDeath(hcPlayer);
eq(res2, null, 'second onDeath call is a no-op');
eq(hardcoreEvents.length, 1, 'hardcore_died event still fired only once');

// Non-hardcore variants untouched.
for (const v of ['ironman', 'ultimate_ironman', 'group_ironman']) {
  const p = makePlayer(`NonHC_${v}`);
  ironman.enableMode(p, v);
  ironman.onDeath(p);
  eq(ironman.getVariant(p), v, `onDeath no-op for ${v}`);
}

// ── 9. Save/load round-trip ─────────────────────────────────────────────────
section('Save/load round-trip preserves variant + group');

{
  const p = makePlayer('Roundtrip');
  ironman.enableMode(p, 'group_ironman');
  const m1 = makePlayer('Member1');
  const m2 = makePlayer('Member2');
  ironman.groupAdd(p, m1.id);
  ironman.groupAdd(p, m2.id);

  // Serialize: mirror how server.js saves players (strip transient fields,
  // convert Sets to arrays, JSON.stringify).
  const saveData = { ...p };
  if (saveData.activePrayers instanceof Set) saveData.activePrayers = [...saveData.activePrayers];
  const json = JSON.stringify(saveData);
  const restored = JSON.parse(json);

  eq(restored.ironman.variant, 'group_ironman', 'variant survives JSON round-trip');
  eq(restored.ironman.group.length, 2, 'group size preserved');
  assert(restored.ironman.group.includes(m1.id), 'member1 present');
  assert(restored.ironman.group.includes(m2.id), 'member2 present');
  // isIronman works on the restored shape.
  eq(ironman.isIronman(restored), true, 'restored player is still an ironman');
  eq(ironman.canBank(restored), true, 'restored group_ironman can bank');
  // canTrade still respects the group.
  const fakeGroupMate = { id: m1.id };
  eq(ironman.canTrade(restored, fakeGroupMate).allowed, true, 'restored can trade with group mate');
}

// ── 10. group_ironman cap at 4 members ──────────────────────────────────────
section('group_ironman cap at 4 members');

{
  const leader = makePlayer('GroupLeader');
  ironman.enableMode(leader, 'group_ironman');
  for (let i = 1; i <= 4; i++) {
    const r = ironman.groupAdd(leader, `member_${i}`);
    eq(r.ok, true, `groupAdd member ${i} ok`);
  }
  eq((leader.ironman.group || []).length, ironman.GROUP_CAP, `group size == ${ironman.GROUP_CAP}`);
  const overflow = ironman.groupAdd(leader, 'member_5');
  eq(overflow.ok, false, '5th member rejected (cap enforced)');
  // Adding a duplicate is rejected.
  const dup = ironman.groupAdd(leader, 'member_1');
  eq(dup.ok, false, 'duplicate member rejected');
  // Non-group variant rejected.
  const solo = makePlayer('SoloIron');
  ironman.enableMode(solo, 'ironman');
  const soloRes = ironman.groupAdd(solo, 'whoever');
  eq(soloRes.ok, false, 'groupAdd rejected for non-group_ironman');
}

// ── 11. group invite + leave ────────────────────────────────────────────────
section('group invite + leave (leave downgrades to ironman)');

{
  const p = makePlayer('Leaver');
  ironman.enableMode(p, 'group_ironman');
  ironman.groupAdd(p, 'pal');
  eq((p.ironman.group || []).length, 1, 'before leave: 1 group member');
  const r = ironman.groupLeave(p);
  eq(r.ok, true, 'groupLeave ok');
  eq(ironman.getVariant(p), 'ironman', 'variant downgraded to ironman after leave');
  eq((p.ironman.group || []).length, 0, 'group cleared');
  eq(p.ironman.downgradedFrom, 'group_ironman', 'downgradedFrom = group_ironman');
  // Once downgraded, cannot add more group members.
  const r2 = ironman.groupAdd(p, 'another');
  eq(r2.ok, false, 'cannot re-group after leave (regular ironman now)');
  // Leave again is a no-op.
  const r3 = ironman.groupLeave(p);
  eq(r3.ok, false, 'second leave is a no-op');
}

// Group remove.
{
  const p = makePlayer('Kicker');
  ironman.enableMode(p, 'group_ironman');
  ironman.groupAdd(p, 'keep');
  ironman.groupAdd(p, 'kick');
  const r = ironman.groupRemove(p, 'kick');
  eq(r.ok, true, 'groupRemove ok');
  eq((p.ironman.group || []).length, 1, 'group size 1 after kick');
  assert(!p.ironman.group.includes('kick'), 'kicked member gone');
}

// ── 12. Real GE integration (installGEHook rejects ironman offers) ─────────
section('GE placeOffer rejects ironman via installGEHook');

{
  // Use a stub GE runner to avoid touching real item data.
  let originalCalled = false;
  const fakeGE = {
    placeOffer: (player, opts) => {
      originalCalled = true;
      return { ok: true, offer: { id: 1, side: opts.side } };
    },
  };
  const installed = ironman.installGEHook(fakeGE);
  eq(installed, true, 'installGEHook returns true on first install');
  // Second install is a no-op.
  const dup = ironman.installGEHook(fakeGE);
  eq(dup, false, 'installGEHook idempotent (second call no-ops)');

  const normalBuyer = makePlayer('NormalBuyer');
  const r1 = fakeGE.placeOffer(normalBuyer, { side: 'buy', itemId: 1, qty: 1, price: 1 });
  eq(r1.ok, true, 'normal player can placeOffer');
  assert(originalCalled, 'original placeOffer was called for normal player');

  originalCalled = false;
  const ironBuyer = makePlayer('IronBuyer');
  ironman.enableMode(ironBuyer, 'ironman');
  const r2 = fakeGE.placeOffer(ironBuyer, { side: 'buy', itemId: 1, qty: 1, price: 1 });
  eq(r2.ok, false, 'ironman placeOffer rejected');
  assert(r2.error && r2.error.length > 0, 'rejection has an error message');
  assert(!originalCalled, 'original placeOffer was NOT called for ironman');
}

// ── 13. Commands register cleanly ───────────────────────────────────────────
section('Chat commands register cleanly');

{
  // Use a fresh fake commands registry.
  const fakeRegistry = {
    _cmds: new Map(),
    register(name, opts) { this._cmds.set(name, opts); },
  };
  ironmanCommands.register({
    commands: fakeRegistry,
    ironman,
    getTick: () => currentTick,
  });
  assert(fakeRegistry._cmds.has('ironman'), 'ironman command registered');
  const cmd = fakeRegistry._cmds.get('ironman');
  assert(typeof cmd.fn === 'function', 'ironman.fn is a function');

  const p = makePlayer('CmdTester');
  const statusOut = cmd.fn(p, ['status']);
  assert(typeof statusOut === 'string' && statusOut.length > 0,
    'ironman status returns a string for normal player');
  assert(/Normal/i.test(statusOut), 'normal player status mentions Normal');

  const startOut = cmd.fn(p, ['start', 'ironman']);
  assert(/Ironman/.test(startOut), 'ironman start ironman announces the mode');
  eq(ironman.getVariant(p), 'ironman', 'command enabled ironman variant');

  // Re-enable should fail.
  const reStart = cmd.fn(p, ['start', 'hardcore']);
  assert(/already/i.test(reStart) || /cannot/i.test(reStart),
    'ironman start again warns about permanence');

  // ironman group invite on non-group variant should error.
  const invOut = cmd.fn(p, ['group', 'invite', 'somebody']);
  assert(/Group Ironmen/.test(invOut) || /Only Group/.test(invOut),
    'group invite rejected on non-group variant');
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
