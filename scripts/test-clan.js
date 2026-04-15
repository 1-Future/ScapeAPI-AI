#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// Clan System — Engine Tests
//
// Exercises:
//   1.  Clan creation + duplicate-name rejection
//   2.  Invite / accept / leave
//   3.  Rank gates (invite, kick, promote, demote)
//   4.  Anti-grief two-vote gate for promotion to General+
//   5.  Transfer ownership
//   6.  Auto-ownership on Owner leaving
//   7.  Donate / withdraw (rank-gated) with treasury bookkeeping
//   8.  Contribution points awarded for donations + bingo claims
//   9.  Hall upgrade / build / upgrade-room with construction gating
//   10. Bingo start/claim/win (line + full house)
//   11. Territory claim / release / war declaration / war resolution
//   12. Territory XP bonus
//   13. Serialize / deserialize round trip
//
// Run: node scripts/test-clan.js
// Exit 0 on all-pass, exit 1 on any failure.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const path = require('path');
const fs = require('fs');

// Sandbox persistence to a temp dir.
const tmpDataDir = path.join(__dirname, '..', '.tmp-clan-test');
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
  try { return JSON.parse(fs.readFileSync(fp, 'utf8')); } catch { return fallback; }
};

const clan = require('../src/engine/clan');
const hall = require('../src/engine/clan-hall');
const bingo = require('../src/engine/clan-bingo');
const territory = require('../src/engine/clan-territory');

// ── Test harness ─────────────────────────────────────────────────────────────
let passed = 0, failed = 0;
const failures = [];

function assert(cond, msg) {
  if (cond) { passed++; }
  else { failed++; failures.push(msg); console.log(`  FAIL: ${msg}`); }
}
function eq(actual, expected, msg) {
  const ok = actual === expected;
  assert(ok, `${msg} (expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)})`);
}
function group(name, fn) {
  console.log(`\n── ${name} ──`);
  clan.reset();
  territory.reset();
  fn();
}

let nextId = 1;
function makePlayer(name) {
  return { id: nextId++, name };
}

// ── Test 1: Clan creation ────────────────────────────────────────────────────
group('Test 1: create clan', () => {
  const a = makePlayer('Alice');
  const res = clan.createClan(a, 'The Ravens', 'Strike from above');
  assert(res.ok, 'create ok');
  assert(res.clan.id > 0, 'clan has id');
  eq(res.clan.name, 'The Ravens', 'name set');
  eq(res.clan.motto, 'Strike from above', 'motto set');
  eq(res.clan.founder, a.id, 'founder set');
  eq(res.clan.members.length, 1, 'one member (owner)');
  eq(res.clan.members[0].rank, 'Owner', 'founder is Owner');
  eq(res.clan.hall.tier, 1, 'hall tier starts at 1');
  eq(res.clan.treasury.coins, 0, 'treasury starts empty');

  // Duplicate name rejected.
  const b = makePlayer('Bob');
  const dup = clan.createClan(b, 'the ravens', 'x');
  assert(!dup.ok, 'duplicate name rejected');
  assert(/taken/i.test(dup.error || ''), 'duplicate error message');

  // Too-short name.
  const tooShort = clan.createClan(b, 'AB', '');
  assert(!tooShort.ok, 'short name rejected');

  // Already in a clan.
  const already = clan.createClan(a, 'Second Clan', '');
  assert(!already.ok, 'cannot create second clan');
});

// ── Test 2: Invite / accept / leave ──────────────────────────────────────────
group('Test 2: invite, accept, leave', () => {
  const a = makePlayer('Alice');
  const b = makePlayer('Bob');
  const c = makePlayer('Carol');
  const { clan: c1 } = clan.createClan(a, 'Clan Alpha', '');

  // Recruit cannot invite.
  const notRanked = clan.invite(c1, b.id, 99999);
  assert(!notRanked.ok, 'non-member cannot invite');

  // Owner invites Bob.
  const inv = clan.invite(c1, b.id, a.id);
  assert(inv.ok, 'owner invite ok');
  assert(!!c1.invites[b.id], 'invite recorded');

  // Bob accepts.
  const acc = clan.accept(b, c1.id);
  assert(acc.ok, 'accept ok');
  eq(c1.members.length, 2, 'two members');
  eq(c1.members[1].rank, 'Recruit', 'new member is Recruit');
  assert(!c1.invites[b.id], 'invite cleared');

  // Bob (Recruit) cannot invite Carol.
  const badInv = clan.invite(c1, c.id, b.id);
  assert(!badInv.ok, 'Recruit cannot invite (rank gate)');

  // Bob leaves.
  const leave = clan.leave(b);
  assert(leave.ok, 'leave ok');
  eq(c1.members.length, 1, 'back to one member');

  // Accept with no invite rejected (clan is Invite-Only).
  const noInvite = clan.accept(c, c1.id);
  assert(!noInvite.ok, 'no invite rejection');
});

// ── Test 3: Rank gates ───────────────────────────────────────────────────────
group('Test 3: rank gates on kick, promote, demote', () => {
  const a = makePlayer('Alice');   // Owner
  const b = makePlayer('Bob');     // Recruit -> Member
  const c = makePlayer('Carol');   // Recruit
  const { clan: c1 } = clan.createClan(a, 'Guardians', '');
  clan.invite(c1, b.id, a.id); clan.accept(b, c1.id);
  clan.invite(c1, c.id, a.id); clan.accept(c, c1.id);

  // Owner promotes Bob to Member.
  const p1 = clan.promote(c1, b.id, a.id);
  assert(p1.ok && p1.rank === 'Member', 'promote to Member');

  // Member (Bob) cannot kick Carol (Sergeant gate).
  const kick1 = clan.kick(c1, c.id, b.id);
  assert(!kick1.ok, 'Member cannot kick');

  // Owner kicks Carol.
  const kick2 = clan.kick(c1, c.id, a.id);
  assert(kick2.ok, 'Owner kick ok');
  eq(c1.members.length, 2, 'two members after kick');

  // Cannot kick self.
  const kickSelf = clan.kick(c1, a.id, a.id);
  assert(!kickSelf.ok, 'cannot kick self');

  // Demote Bob (Member -> Recruit).
  const d = clan.demote(c1, b.id, a.id);
  assert(d.ok && d.rank === 'Recruit', 'demote to Recruit');

  // Cannot demote below Recruit.
  const d2 = clan.demote(c1, b.id, a.id);
  assert(!d2.ok, 'cannot demote lowest rank');
});

// ── Test 4: Two-vote gate for General+ promotion ─────────────────────────────
group('Test 4: anti-grief two-vote gate for General+', () => {
  const a = makePlayer('Alice');   // Owner
  const o = makePlayer('Officer'); // Will become General
  const t = makePlayer('Target');  // Will be promoted through ranks
  const { clan: c1 } = clan.createClan(a, 'Sentinels', '');
  clan.invite(c1, o.id, a.id); clan.accept(o, c1.id);
  clan.invite(c1, t.id, a.id); clan.accept(t, c1.id);

  // Elevate Officer to General (multiple promotes).
  for (const r of ['Member', 'Corporal', 'Sergeant', 'Lieutenant', 'Captain']) {
    const res = clan.promote(c1, o.id, a.id);
    assert(res.ok, `elevate Officer to ${r}`);
  }
  // Captain -> General needs two votes.
  const v1 = clan.promote(c1, o.id, a.id);
  assert(v1.ok && v1.pending, 'first vote pending');
  eq(v1.needsVotes, 1, 'needs 1 more vote');
  // Owner cannot vote twice.
  const same = clan.promote(c1, o.id, a.id);
  assert(!same.ok, 'same voter rejected');

  // Elevate Target to Captain first.
  for (const _ of [1, 2, 3, 4, 5]) clan.promote(c1, t.id, a.id);
  eq(clan.findMember(c1, t.id).rank, 'Captain', 'Target elevated to Captain');

  // Still only one vote on Officer's pending promotion. Need another General+ voter
  // but none exists yet. Use admin (raise Officer via direct mutation to finalize).
  clan.findMember(c1, o.id).rank = 'General';
  delete c1.pendingPromotions[o.id];

  // Now Officer is General. Try to promote Target (Captain -> General).
  const firstVote = clan.promote(c1, t.id, a.id);
  assert(firstVote.ok && firstVote.pending, 'owner initiates General promotion');
  const secondVote = clan.promote(c1, t.id, o.id);
  assert(secondVote.ok && secondVote.promoted, 'second vote promotes');
  eq(clan.findMember(c1, t.id).rank, 'General', 'target is now General');
});

// ── Test 5: Transfer ownership ───────────────────────────────────────────────
group('Test 5: transfer ownership', () => {
  const a = makePlayer('Alice');
  const b = makePlayer('Bob');
  const { clan: c1 } = clan.createClan(a, 'Old Guard', '');
  clan.invite(c1, b.id, a.id); clan.accept(b, c1.id);

  // Only Owner can transfer.
  const notOwner = clan.transferOwnership(c1, a.id, b.id);
  assert(!notOwner.ok, 'non-owner cannot transfer');

  const t = clan.transferOwnership(c1, b.id, a.id);
  assert(t.ok, 'transfer ok');
  eq(clan.findMember(c1, a.id).rank, 'Admin', 'old owner is Admin');
  eq(clan.findMember(c1, b.id).rank, 'Owner', 'new owner');
});

// ── Test 6: Auto-ownership on Owner leave ────────────────────────────────────
group('Test 6: owner leaving transfers or disbands', () => {
  const a = makePlayer('Alice');
  const b = makePlayer('Bob');
  const { clan: c1 } = clan.createClan(a, 'Twilight', '');
  clan.invite(c1, b.id, a.id); clan.accept(b, c1.id);
  clan.promote(c1, b.id, a.id); // b -> Member
  clan.promote(c1, b.id, a.id); // Corporal
  clan.promote(c1, b.id, a.id); // Sergeant
  // Owner leaves.
  const res = clan.leave(a);
  assert(res.ok, 'owner leave ok');
  assert(!res.disbanded, 'not disbanded (successor exists)');
  eq(clan.findMember(c1, b.id).rank, 'Owner', 'Bob auto-promoted to Owner');

  // Now Bob leaves — disbands.
  const res2 = clan.leave(b);
  assert(res2.ok, 'last-member leave ok');
  assert(res2.disbanded, 'clan disbanded');
});

// ── Test 7: Donate / withdraw with rank gate ────────────────────────────────
group('Test 7: donate and withdraw', () => {
  const a = makePlayer('Alice');   // Owner
  const b = makePlayer('Bob');     // Will be Captain
  const c = makePlayer('Carol');   // Will stay Recruit
  const { clan: c1 } = clan.createClan(a, 'Merchants', '');
  clan.invite(c1, b.id, a.id); clan.accept(b, c1.id);
  clan.invite(c1, c.id, a.id); clan.accept(c, c1.id);
  for (let i = 0; i < 5; i++) clan.promote(c1, b.id, a.id); // Bob -> Captain

  // Carol donates 5000 coins.
  const d1 = clan.donate(c, { coins: 5000 });
  assert(d1.ok, 'Carol donates');
  eq(c1.treasury.coins, 5000, 'treasury has 5000');
  assert(clan.findMember(c1, c.id).contributionPoints > 0, 'Carol gains contribution points');
  eq(c1.donationTotals[c.id], 5000, 'donation total recorded');

  // Bob donates an item.
  const d2 = clan.donate(b, { item: { id: 42, name: 'Dragon longsword', qty: 1 } });
  assert(d2.ok, 'Bob donates item');
  eq(c1.treasury.items.length, 1, 'item added to treasury');

  // Carol (Recruit) cannot withdraw (Captain gate).
  const w1 = clan.withdraw(c, { coins: 1000 });
  assert(!w1.ok, 'Recruit cannot withdraw');

  // Bob (Captain) can withdraw.
  const w2 = clan.withdraw(b, { coins: 3000 });
  assert(w2.ok, 'Captain withdraws');
  eq(w2.payout.coins, 3000, 'payout 3000');
  eq(c1.treasury.coins, 2000, 'treasury reduced');

  // Overdraw rejected.
  const w3 = clan.withdraw(b, { coins: 99999 });
  assert(!w3.ok, 'overdraw rejected');

  // Withdraw item by index.
  const w4 = clan.withdraw(b, { itemIndex: 0 });
  assert(w4.ok, 'item withdraw ok');
  eq(w4.payout.items.length, 1, 'one item paid out');
  eq(c1.treasury.items.length, 0, 'treasury item list empty');
});

// ── Test 8: Hall upgrades and rooms ─────────────────────────────────────────
group('Test 8: hall upgrades, build, upgrade room', () => {
  const a = makePlayer('Alice');
  const { clan: c1 } = clan.createClan(a, 'Architects', '');
  // Seed treasury.
  c1.treasury.coins = 10_000_000;

  // Owner upgrades hall.
  const u = hall.upgradeHall(c1, a.id);
  assert(u.ok, 'hall upgrade ok');
  eq(u.tier, 2, 'hall at tier 2');
  assert(c1.treasury.coins < 10_000_000, 'coins deducted');

  // Build treasury room — construction level too low rejected.
  const lowLvl = hall.buildRoom(c1, 'treasury', a.id, { constructionLevel: 1 });
  assert(!lowLvl.ok, 'low construction rejected');

  // Build treasury room with sufficient construction.
  const bt = hall.buildRoom(c1, 'treasury', a.id, { constructionLevel: 50 });
  assert(bt.ok, 'treasury built');
  eq(bt.room.type, 'treasury', 'room type');
  eq(bt.room.tier, 1, 'treasury tier 1');

  // Cannot build the same room twice.
  const dup = hall.buildRoom(c1, 'treasury', a.id, { constructionLevel: 50 });
  assert(!dup.ok, 'dup build rejected');

  // Build training ground.
  c1.treasury.coins += 2_000_000;
  const tr = hall.buildRoom(c1, 'training', a.id, { constructionLevel: 99 });
  assert(tr.ok, 'training built');
  eq(hall.getXPBoost(c1), 1, 'XP boost from tier 1 training');

  // Upgrade training to tier 2.
  c1.treasury.coins += 2_000_000;
  const ur = hall.upgradeRoom(c1, 'training', a.id, { constructionLevel: 99 });
  assert(ur.ok, 'training upgrade ok');
  eq(ur.room.tier, 2, 'training tier 2');
  eq(hall.getXPBoost(c1), 2, 'XP boost scales with tier');

  // Unknown room type rejected.
  const unknown = hall.buildRoom(c1, 'dungeon', a.id, { constructionLevel: 99 });
  assert(!unknown.ok, 'unknown room rejected');

  // List rooms shows state.
  const list = hall.listRooms(c1);
  assert(Array.isArray(list) && list.length > 0, 'listRooms returns array');
  const treasuryRow = list.find(r => r.type === 'treasury');
  assert(treasuryRow && treasuryRow.built, 'treasury listed as built');
});

// ── Test 9: Bingo line + full house ─────────────────────────────────────────
group('Test 9: bingo line + full house', () => {
  const a = makePlayer('Alice');   // Owner, starts bingo
  const b = makePlayer('Bob');     // Member, claims tiles
  const { clan: c1 } = clan.createClan(a, 'Bingo Club', '');
  clan.invite(c1, b.id, a.id); clan.accept(b, c1.id);

  // Start with a 3x3 board for easy testing (manual tiles).
  const tiles = [];
  for (let i = 0; i < 9; i++) tiles.push({ id: `t${i}`, name: `Task ${i}` });
  const st = bingo.startBingo(c1, a.id, { size: 3, tiles, prize: { coins: 10_000 } });
  assert(st.ok, 'bingo started');
  eq(c1.bingo.size, 3, 'size 3');

  // Claim row 0: t0, t1, t2.
  bingo.claimBingoTile(c1, b, 't0');
  bingo.claimBingoTile(c1, b, 't1');
  const r = bingo.claimBingoTile(c1, b, 't2');
  assert(r.ok && r.line, 'line win detected');
  eq(r.line.kind, 'row', 'win is a row');
  eq(c1.wins.bingo, 1, 'bingo win counted');
  eq(c1.treasury.coins, 10_000, 'line prize paid');

  // Claim the rest for full house.
  bingo.claimBingoTile(c1, b, 't3');
  bingo.claimBingoTile(c1, b, 't4');
  bingo.claimBingoTile(c1, b, 't5');
  bingo.claimBingoTile(c1, b, 't6');
  bingo.claimBingoTile(c1, b, 't7');
  const last = bingo.claimBingoTile(c1, b, 't8');
  assert(last.ok, 'last claim ok');
  assert(last.full, 'full house detected');
  assert(!c1.bingo.active, 'bingo deactivated after full house');
  assert(c1.treasury.coins >= 30_000, 'full house prize doubles');

  // Claim on inactive bingo rejected.
  const st2 = bingo.bingoStatus(c1);
  assert(!st2.active, 'status shows inactive');

  // Starting a second bingo after the first ended (full house deactivated it) should work.
  const st3 = bingo.startBingo(c1, a.id, { size: 3, tiles, prize: { coins: 100 } });
  assert(st3.ok, 'second bingo allowed once prior is inactive');
});

// ── Test 10: Territory control and wars ─────────────────────────────────────
group('Test 10: territory claim, release, war', () => {
  const a = makePlayer('Alice');   // Clan Red owner
  const general = makePlayer('Gen');
  const b = makePlayer('Bob');     // Clan Blue owner
  const general2 = makePlayer('Gen2');
  const { clan: red } = clan.createClan(a, 'Red Clan', '');
  const { clan: blue } = clan.createClan(b, 'Blue Clan', '');
  clan.invite(red, general.id, a.id); clan.accept(general, red.id);
  clan.invite(blue, general2.id, b.id); clan.accept(general2, blue.id);

  // Manually elevate the generals (skip the two-vote dance for test speed).
  clan.findMember(red, general.id).rank = 'General';
  clan.findMember(blue, general2.id).rank = 'General';

  // Red claims region "forest_01".
  const claim1 = territory.claimTerritory(red, 'forest_01', a.id);
  assert(claim1.ok, 'red claims forest_01');
  eq(territory.getTerritoryOwner('forest_01'), red.id, 'red owns forest_01');

  // Red tries to claim same region — rejected.
  const claimDup = territory.claimTerritory(red, 'forest_01', a.id);
  assert(!claimDup.ok, 'dup self-claim rejected');

  // Blue tries to claim same region — rejected (declare war instead).
  const claimContested = territory.claimTerritory(blue, 'forest_01', b.id);
  assert(!claimContested.ok, 'contested claim rejected');

  // Territory XP bonus for red in forest_01 (hall tier 1 = 1%).
  eq(territory.getXPBonus(red, 'forest_01'), 1, 'XP bonus tier 1 = 1%');
  eq(territory.getXPBonus(blue, 'forest_01'), 0, 'blue gets no bonus in red territory');

  // Declare war.
  const war = territory.declareTerritoryWar(blue, 'forest_01', red.id, b.id);
  assert(war.ok, 'war declared');
  assert(war.war.scheduledStart > Date.now(), 'war scheduled in future');

  // Can't declare a second war on same region.
  const war2 = territory.declareTerritoryWar(blue, 'forest_01', red.id, b.id);
  assert(!war2.ok, 'second war blocked');

  // Fast-forward: manually set the war window to NOW and past.
  war.war.scheduledStart = Date.now() - 1000;
  war.war.scheduledEnd = Date.now() - 500;
  // Record kills (out of window — should fail).
  const kill = territory.recordWarKill(war.war.id, blue.id);
  assert(!kill.ok, 'out-of-window kill rejected');

  // Open window and record kills.
  war.war.scheduledStart = Date.now() - 1000;
  war.war.scheduledEnd = Date.now() + 60_000;
  const k1 = territory.recordWarKill(war.war.id, blue.id);
  assert(k1.ok, 'blue kill recorded');
  const k2 = territory.recordWarKill(war.war.id, blue.id);
  assert(k2.ok, 'second kill recorded');
  const k3 = territory.recordWarKill(war.war.id, red.id);
  assert(k3.ok, 'red kill recorded');
  eq(war.war.capturePoints.attacker, 2, 'attacker (blue) 2 points');
  eq(war.war.capturePoints.defender, 1, 'defender (red) 1 point');

  // Close window and resolve.
  war.war.scheduledEnd = Date.now() - 500;
  const resolve = territory.resolveWar(war.war.id);
  assert(resolve.ok, 'war resolved');
  eq(resolve.war.winnerId, blue.id, 'blue wins with more capture points');
  eq(territory.getTerritoryOwner('forest_01'), blue.id, 'blue now owns region');
  assert(!red.territory.includes('forest_01'), 'red loses from territory list');
  assert(blue.territory.includes('forest_01'), 'blue gains in territory list');
  eq(blue.wins.wars, 1, 'blue war win counted');

  // Release region.
  const rel = territory.releaseTerritory(blue, 'forest_01', b.id);
  assert(rel.ok, 'release ok');
  eq(territory.getTerritoryOwner('forest_01'), null, 'region unclaimed');
});

// ── Test 11: Serialize / deserialize round trip ─────────────────────────────
group('Test 11: serialize round trip', () => {
  const a = makePlayer('Alice');
  const b = makePlayer('Bob');
  const { clan: c1 } = clan.createClan(a, 'Sage Order', 'Knowledge is power');
  clan.invite(c1, b.id, a.id); clan.accept(b, c1.id);
  clan.donate(a, { coins: 1234 });
  // Add enough for trophy room tier 1 (150_000 coins).
  c1.treasury.coins += 150_000;
  const rb = hall.buildRoom(c1, 'trophy', a.id, { constructionLevel: 50 });
  assert(rb.ok, 'trophy room built');
  // After build, treasury should be 1234 + 150_000 - 150_000 = 1234.

  const snapshot = clan.serialize();
  clan.reset();
  eq(clan.listClans().length, 0, 'after reset: no clans');
  clan.deserialize(snapshot);
  const roundTrip = clan.getById(c1.id);
  assert(roundTrip, 'clan restored by id');
  eq(roundTrip.name, 'Sage Order', 'name preserved');
  eq(roundTrip.motto, 'Knowledge is power', 'motto preserved');
  eq(roundTrip.members.length, 2, 'members preserved');
  eq(roundTrip.treasury.coins, 1234, 'coins preserved');
  eq(roundTrip.hall.rooms.length, 1, 'rooms preserved');
  eq(roundTrip.hall.rooms[0].type, 'trophy', 'room type preserved');

  // Player index rebuilt.
  eq(clan.getByPlayer(a.id).id, c1.id, 'playerIndex rebuilt for owner');
  eq(clan.getByPlayer(b.id).id, c1.id, 'playerIndex rebuilt for member');
});

// ── Test 12: Manifesto-10 — solo player unaffected ──────────────────────────
group('Test 12: solo play unaffected by clan absence', () => {
  const solo = makePlayer('Solo');
  // A solo player is not in any clan.
  eq(clan.getByPlayer(solo.id), null, 'solo player has no clan');
  // Clan APIs reject cleanly (no crash).
  const l = clan.leave(solo);
  assert(!l.ok, 'leave with no clan rejected cleanly');
  const d = clan.donate(solo, { coins: 10 });
  assert(!d.ok, 'donate with no clan rejected cleanly');
  const w = clan.withdraw(solo, { coins: 10 });
  assert(!w.ok, 'withdraw with no clan rejected cleanly');
});

// ── Done ────────────────────────────────────────────────────────────────────
console.log(`\n─────────────────────────────────────────────`);
console.log(`Clan tests — passed: ${passed}, failed: ${failed}`);
if (failed > 0) {
  console.log('FAILURES:');
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
process.exit(0);
