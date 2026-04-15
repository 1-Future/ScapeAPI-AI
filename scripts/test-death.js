#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// Death + Respawn — Engine Tests
//
// Verifies:
//   1.  HP to 0 via combat.checkPlayerDeath triggers death.onPlayerDeath
//   2.  Top 3 items kept by value, the rest are dropped into a grave
//   3.  Protect Item prayer keeps 4 items
//   4.  Grave is created at the death location
//   5.  Claiming within 60 min returns items to the player's inventory
//   6.  Claiming after 60 min fails; items are gone
//   7.  Ironman mode: other players cannot loot the grave
//   8.  Hardcore mode: death sets hardcoreDead and leaves a memorial grave
//   9.  Respawn point is honored (set via setRespawnPoint)
//   10. A 'death' event is emitted with the expected payload
//   11. /claim, /graves and /sethome chat commands work end-to-end
//   12. Value fallback chain: ge.getMarketStats -> item.value -> 1
//
// Run: node scripts/test-death.js
// Exit 0 on all-pass, exit 1 on any failure.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const path = require('path');
const fs = require('fs');

// Sandbox persistence so tests never touch real data/graves.json.
const tmpDataDir = path.join(__dirname, '..', '.tmp-death-test');
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

const events = require('../src/engine/events');
const items = require('../src/data/items');
const playerLib = require('../src/player/player');
const combat = require('../src/combat/combat');
const death = require('../src/engine/death');
const deathCommands = require('../src/engine/death-commands');
const commands = require('../src/engine/commands');

// ── Test harness ──────────────────────────────────────────────────────────
let passed = 0, failed = 0;
const failures = [];

function assert(cond, label) {
  if (cond) { passed++; console.log('  PASS  ' + label); }
  else      { failed++; failures.push(label); console.log('  FAIL  ' + label); }
}
function eq(actual, expected, label) {
  assert(actual === expected, `${label} (expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)})`);
}
function section(title) { console.log('\n=== ' + title + ' ==='); }

// ── Fake tick ─────────────────────────────────────────────────────────────
let currentTick = 100;
function getTick() { return currentTick; }

// Register death with adapters.
death.register({
  items,
  getTick,
  invAdd: (player, itemId, name, count, stackable) => playerLib.invAdd(player, itemId, name, count, stackable),
  setPlayerPosition: (player, pt) => { player.x = pt.x; player.y = pt.y; player.region = pt.region; },
});

deathCommands.register({ commands, death, getTick });

// ── Fixture ───────────────────────────────────────────────────────────────
let nextPid = 1000;
function makePlayer(name, opts) {
  opts = opts || {};
  const p = playerLib.createPlayer(String(nextPid++), name);
  p.x = opts.x || 100;
  p.y = opts.y || 90;
  p.region = opts.region || 'heartlands';
  p.hp = p.maxHp = 10;
  return p;
}

// Pick a few known items with distinct values.
// Bones(100)=1, Coins(101)=1, Cowhide(102)=5, Raw beef(103)=2,
// Raw chicken(105)=2, Big bones(106)=15, Dragon bones(107)=1500,
// Leather(108)=10, Raw shrimps(220)=5, Raw trout(221)=20,
// Raw lobster(223)=100, Raw shark(225)=500.
function fillInvByValue(p) {
  // Values in ascending order so sort logic is exercised.
  playerLib.invAdd(p, 100, 'Bones', 1);       // value 1
  playerLib.invAdd(p, 101, 'Coins', 3, true); // stackable
  playerLib.invAdd(p, 103, 'Raw beef', 1);    // value 2
  playerLib.invAdd(p, 102, 'Cowhide', 1);     // value 5
  playerLib.invAdd(p, 108, 'Leather', 1);     // value 10
  playerLib.invAdd(p, 106, 'Big bones', 1);   // value 15
  playerLib.invAdd(p, 221, 'Raw trout', 1);   // value 20
  playerLib.invAdd(p, 223, 'Raw lobster', 1); // value 100
  playerLib.invAdd(p, 225, 'Raw shark', 1);   // value 500
  playerLib.invAdd(p, 107, 'Dragon bones', 1);// value 1500
}

// ── 1. HP=0 via combat hook triggers death ────────────────────────────────
section('Combat hook routes HP=0 into death');

death._resetForTests();

let deathEventPayload = null;
events.on('death', 'test-capture-1', (e) => { deathEventPayload = e; });

const p1 = makePlayer('Alice');
fillInvByValue(p1);
p1.hp = 0;
const r1 = combat.checkPlayerDeath(p1, { location: { region: 'heartlands', x: 50, y: 60 }, killer: { name: 'goblin' } });
assert(!!r1, 'combat.checkPlayerDeath returned a result');
assert(!!r1.grave, 'a grave was created');
events.off('death', 'test-capture-1');

// ── 2. Top 3 kept by value, rest dropped ──────────────────────────────────
section('Top 3 items kept by value');

eq(r1.keptItems.length, 3, 'exactly 3 items kept');
const keptIds = r1.keptItems.map(k => k.id);
assert(keptIds.includes(107), 'kept Dragon bones (value 1500)');
assert(keptIds.includes(225), 'kept Raw shark (value 500)');
assert(keptIds.includes(223), 'kept Raw lobster (value 100)');
assert(!keptIds.includes(100), 'Bones (value 1) was NOT kept');
assert(r1.lostItems.length >= 5, 'several items were lost to the grave');
assert(r1.grave.items.some(it => it.id === 100), 'Bones ended up in the grave');

// ── 3. Protect Item keeps 4 ───────────────────────────────────────────────
section('Protect Item prayer keeps 4');

death._resetForTests();
const p2 = makePlayer('Bob');
fillInvByValue(p2);
p2.activePrayers.add('protect_item');
p2.hp = 0;
const r2 = death.onPlayerDeath(p2, { location: { region: 'heartlands', x: 55, y: 60 } });
eq(r2.keptItems.length, 4, 'Protect Item: 4 items kept');
const kept2Ids = r2.keptItems.map(k => k.id);
assert(kept2Ids.includes(221), 'Protect Item: also kept Raw trout (value 20) as 4th');

// ── 4. Grave placed at the death location ─────────────────────────────────
section('Grave is placed at the death location');

death._resetForTests();
const p3 = makePlayer('Carol');
fillInvByValue(p3);
const deathLoc = { region: 'heartlands', x: 77, y: 88 };
p3.hp = 0;
const r3 = death.onPlayerDeath(p3, { location: deathLoc });
eq(r3.grave.location.x, 77, 'grave at x=77');
eq(r3.grave.location.y, 88, 'grave at y=88');
eq(r3.grave.location.region, 'heartlands', 'grave in heartlands');
eq(r3.grave.placedAt, currentTick, 'grave.placedAt == currentTick');
eq(r3.grave.expiresAt, currentTick + death.GRAVE_TTL_TICKS, 'grave expires after GRAVE_TTL_TICKS');

// ── 5. Claim within 60 min returns items ──────────────────────────────────
section('Claim within 60 min returns items');

const p3b = makePlayer('Carol2'); // Fresh claimant - pretend same player returns
p3b.id = p3.id; // Same owner for test
p3b.x = deathLoc.x;
p3b.y = deathLoc.y;
const lostCount = r3.grave.items.length;
const claimResult = death.claimGrave(p3b, r3.grave.id);
assert(claimResult.ok, 'claim succeeded');
eq(claimResult.items.length, lostCount, `${lostCount} items returned to inventory`);
assert(death.getGrave(r3.grave.id) === null, 'grave removed after full claim');

// Claiming from too far away fails.
death._resetForTests();
const p3c = makePlayer('Carol3');
fillInvByValue(p3c);
const loc3c = { region: 'heartlands', x: 200, y: 200 };
p3c.hp = 0;
const r3c = death.onPlayerDeath(p3c, { location: loc3c });
// After death p3c is respawned at home (100,90), which is >1 tile from the grave.
const tooFar = death.claimGrave(p3c, r3c.grave.id);
assert(!tooFar.ok && tooFar.reason === 'too_far', 'cannot claim when more than 1 tile away');

// ── 6. Claim after expiry fails ───────────────────────────────────────────
section('Claim after 60 min fails; items are gone');

death._resetForTests();
const p4 = makePlayer('Dan');
fillInvByValue(p4);
p4.hp = 0;
const r4 = death.onPlayerDeath(p4, { location: { region: 'heartlands', x: 100, y: 90 } });
const graveId4 = r4.grave.id;
currentTick += death.GRAVE_TTL_TICKS + 1;
// Tick graves to prune.
const prunedCount = death.tickGraves();
assert(prunedCount >= 1, 'tickGraves pruned at least one expired grave');
assert(death.getGrave(graveId4) === null, 'expired grave is gone');
const expiredClaim = death.claimGrave(p4, graveId4);
assert(!expiredClaim.ok, 'claim fails after expiry');
eq(expiredClaim.reason, 'not_found', 'reason is not_found (already pruned)');

// Also verify the on-the-fly expiry check (claim without tickGraves having run).
death._resetForTests();
currentTick = 100;
const p4b = makePlayer('Dan2');
fillInvByValue(p4b);
p4b.hp = 0;
const r4b = death.onPlayerDeath(p4b, { location: { region: 'heartlands', x: 100, y: 90 } });
const g4b = r4b.grave.id;
currentTick += death.GRAVE_TTL_TICKS + 1;
p4b.x = r4b.grave.location.x;
p4b.y = r4b.grave.location.y;
const lateClaim = death.claimGrave(p4b, g4b);
assert(!lateClaim.ok && lateClaim.reason === 'expired', 'late claim returns reason=expired');
assert(death.getGrave(g4b) === null, 'claimGrave cleaned up the expired grave');

// ── 7. Ironman mode: only owner can loot ──────────────────────────────────
section('Ironman: only owner can loot');

death._resetForTests();
currentTick = 200;
const iron = makePlayer('Ironman');
iron.accountMode = 'ironman';
fillInvByValue(iron);
iron.hp = 0;
const ironR = death.onPlayerDeath(iron, { location: { region: 'heartlands', x: 100, y: 90 } });
eq(ironR.grave.mode, 'ironman', 'grave.mode === ironman');

const scavenger = makePlayer('Scavenger');
scavenger.x = ironR.grave.location.x;
scavenger.y = ironR.grave.location.y;
const scavResult = death.claimGrave(scavenger, ironR.grave.id);
assert(!scavResult.ok, 'non-owner cannot claim ironman grave');
eq(scavResult.reason, 'ironman_owner_only', 'reason is ironman_owner_only');

// Owner (same id) still can.
const ownerBack = makePlayer('IronBack');
ownerBack.id = iron.id;
ownerBack.x = ironR.grave.location.x;
ownerBack.y = ironR.grave.location.y;
const ownerResult = death.claimGrave(ownerBack, ironR.grave.id);
assert(ownerResult.ok, 'owner CAN claim their ironman grave');

// ── 8. Hardcore permadeath ────────────────────────────────────────────────
section('Hardcore: permadeath sets flag and creates memorial');

death._resetForTests();
currentTick = 300;
const hc = makePlayer('Hardcore');
hc.isHardcore = true;
hc.accountMode = 'hcim';
fillInvByValue(hc);
hc.hp = 0;
const hcR = death.onPlayerDeath(hc, { location: { region: 'veilwood', x: 60, y: 80 } });
assert(hc.hardcoreDead === true, 'player.hardcoreDead = true');
assert(hc.accountMode === null, 'accountMode reverted (hcim dropped)');
assert(hc.isHardcore === false, 'isHardcore flag cleared');
assert(hcR.grave.memorial === true, 'grave is a memorial');
assert(hcR.grave.expiresAt === Infinity, 'memorial never expires');
const memClaim = death.claimGrave(hc, hcR.grave.id);
assert(!memClaim.ok && memClaim.reason === 'memorial', 'memorial cannot be looted');

// Second death on the same (now-reverted) account behaves as normal.
const hc2 = hc;
// Re-populate inventory since the first death stripped it and the hardcore
// branch doesn't respawn the player.
fillInvByValue(hc2);
hc2.hp = 0;
hc2.x = 100; hc2.y = 90;
const hcR2 = death.onPlayerDeath(hc2, { location: { region: 'heartlands', x: 100, y: 90 } });
assert(hcR2.grave.memorial === false, 'second death is NOT a memorial');
assert(hcR2.grave.expiresAt !== Infinity, 'second death has a normal TTL');

// ── 9. Respawn point is honored ───────────────────────────────────────────
section('Respawn point');

death._resetForTests();
currentTick = 400;
const spawner = makePlayer('Spawner');
death.setRespawnPoint(spawner, { region: 'veilwood', x: 50, y: 80 });
fillInvByValue(spawner);
spawner.hp = 0;
const spawnR = death.onPlayerDeath(spawner, { location: { region: 'heartlands', x: 5, y: 6 } });
eq(spawnR.respawnPoint.region, 'veilwood', 'respawn region honored');
eq(spawnR.respawnPoint.x, 50, 'respawn x honored');
eq(spawnR.respawnPoint.y, 80, 'respawn y honored');
eq(spawner.x, 50, 'player moved to respawn x');
eq(spawner.y, 80, 'player moved to respawn y');

// Default respawn (no custom point).
const defSpawner = makePlayer('DefaultSpawner');
fillInvByValue(defSpawner);
defSpawner.hp = 0;
const defR = death.onPlayerDeath(defSpawner, { location: { region: 'heartlands', x: 5, y: 6 } });
eq(defR.respawnPoint.region, 'heartlands', 'default region');
eq(defR.respawnPoint.x, 100, 'default x');
eq(defR.respawnPoint.y, 90, 'default y');

// ── 10. Death event emitted with correct payload ──────────────────────────
section('Death event emission');

let captured = null;
events.on('death', 'test-capture-10', (e) => { captured = e; });
death._resetForTests();
const p10 = makePlayer('Emitter');
fillInvByValue(p10);
p10.hp = 0;
const r10 = death.onPlayerDeath(p10, { location: { region: 'heartlands', x: 42, y: 42 }, killer: { name: 'wolf' } });
events.off('death', 'test-capture-10');
assert(captured !== null, 'death event fired');
eq(captured.type, 'death', 'event type is "death"');
eq(captured.playerId, p10.id, 'event has the player id');
eq(captured.location.x, 42, 'event location.x');
eq(captured.location.y, 42, 'event location.y');
eq(captured.graveId, r10.grave.id, 'event carries the grave id');
eq(captured.killer, 'wolf', 'event carries the killer name');
assert(Array.isArray(captured.keptItemIds) && captured.keptItemIds.length === 3, 'event has 3 keptItemIds');
assert(Array.isArray(captured.lostItemIds) && captured.lostItemIds.length >= 5, 'event has lostItemIds');

// grave:expired event
let expiredEvt = null;
events.on('grave:expired', 'test-exp', (e) => { expiredEvt = e; });
currentTick += death.GRAVE_TTL_TICKS + 10;
death.tickGraves();
events.off('grave:expired', 'test-exp');
assert(expiredEvt !== null, 'grave:expired event fired');
eq(expiredEvt.type, 'grave:expired', 'expired event type');
assert(Array.isArray(expiredEvt.lostItemIds) && expiredEvt.lostItemIds.length >= 1, 'expired event carries item ids');

// ── 11. Chat commands ─────────────────────────────────────────────────────
section('Chat commands (/claim, /graves, /sethome)');

death._resetForTests();
currentTick = 500;
const cmdP = makePlayer('Commander');
cmdP.visitedRegions = new Set(['veilwood', 'heartlands']);
fillInvByValue(cmdP);
cmdP.hp = 0;
const cmdR = death.onPlayerDeath(cmdP, { location: { region: 'heartlands', x: 100, y: 90 } });

// /graves lists
const gravesList = commands.execute(cmdP, 'graves');
assert(typeof gravesList === 'string' && gravesList.includes(cmdR.grave.id), '/graves lists the grave by id');
assert(gravesList.includes('heartlands'), '/graves shows the region');

// /claim claims most recent (no id) — but player must be adjacent.
cmdP.x = cmdR.grave.location.x;
cmdP.y = cmdR.grave.location.y;
const claimMsg = commands.execute(cmdP, 'claim');
assert(typeof claimMsg === 'string' && claimMsg.includes('Reclaimed'), '/claim reports items reclaimed');
assert(death.getGrave(cmdR.grave.id) === null, '/claim actually removed the grave');

// /sethome requires visited region
const sethomeOk = commands.execute(cmdP, 'sethome veilwood');
assert(typeof sethomeOk === 'string' && sethomeOk.includes('veilwood'), '/sethome veilwood succeeded');
const cur = death.getRespawnPoint(cmdP);
eq(cur.region, 'veilwood', '/sethome updated respawn region');

const sethomeFail = commands.execute(cmdP, 'sethome glass_desert');
assert(typeof sethomeFail === 'string' && sethomeFail.toLowerCase().includes('visit'), '/sethome requires visit');

const sethomeUnknown = commands.execute(cmdP, 'sethome narnia');
assert(typeof sethomeUnknown === 'string' && sethomeUnknown.toLowerCase().includes('unknown'), '/sethome rejects unknown region');

// /claim without any graves
death._resetForTests();
const emptyP = makePlayer('EmptyHands');
const noGrave = commands.execute(emptyP, 'claim');
assert(typeof noGrave === 'string' && noGrave.toLowerCase().includes('no unclaimed'), '/claim reports no graves');

// ── 12. Value fallback chain ──────────────────────────────────────────────
section('Value lookup fallback chain');

// No GE wired -> falls back to item.value.
const dragonValue = death.getItemValue(107);
assert(dragonValue >= 100, `dragon bones value via items.js (got ${dragonValue})`);

// Unknown item -> falls back to 1.
const unknownValue = death.getItemValue(9999999);
eq(unknownValue, 1, 'unknown item defaults to value 1');

// Wire a fake GE and confirm it takes precedence.
death.setAdapters({
  ge: { getMarketStats: (id) => (id === 107 ? { medianPrice: 99999 } : null) },
});
const spikedValue = death.getItemValue(107);
eq(spikedValue, 99999, 'GE median price takes precedence over items.value');
// Reset the GE adapter so later tests aren't affected.
death.setAdapters({ ge: null });

// ── Result ────────────────────────────────────────────────────────────────
console.log('\n════════════════════════════════════════════════════════');
console.log(`  Passed: ${passed}`);
console.log(`  Failed: ${failed}`);
if (failed > 0) {
  console.log('\nFailures:');
  for (const f of failures) console.log('  - ' + f);
}
console.log('════════════════════════════════════════════════════════\n');

// Clean up sandboxed data dir.
try { fs.rmSync(tmpDataDir, { recursive: true, force: true }); } catch (_) {}

process.exit(failed > 0 ? 1 : 0);
