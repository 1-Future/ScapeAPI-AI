#!/usr/bin/env node
// ── Smoke test for src/engine/housing.js ─────────────────────────────────────
// Exercises the full player-housing runtime: unlock gate, instance creation,
// room building, furniture placement, tier scaling, persistence, and commands.

'use strict';

const path = require('path');
const fs = require('fs');
const os = require('os');

const player = require('../src/player/player');
const commands = require('../src/engine/commands');
const housing = require('../src/engine/housing');
const housingCommands = require('../src/engine/housing-commands');
const rooms = require('../src/content/aelgard/housing-rooms');
const furniture = require('../src/content/aelgard/housing-furniture');

// ── Bootstrap ────────────────────────────────────────────────────────────────
housing.register({ persistence: null });
housingCommands.register({ commands });

function log(label, v) {
  console.log(`[${label}]`, typeof v === 'string' ? v : JSON.stringify(v));
}

let pass = 0, fail = 0;
function check(cond, msg) {
  if (cond) { console.log('PASS:', msg); pass++; }
  else      { console.log('FAIL:', msg); fail++; }
}

housing._resetForTest();

// ══════════════════════════════════════════════════════════════════════════════
// 1. Content catalogue integrity
// ══════════════════════════════════════════════════════════════════════════════

const roomIds = rooms.listRoomIds();
check(roomIds.length === 12, `12 room types defined (got ${roomIds.length})`);
check(roomIds.includes('parlour'),        'parlour defined');
check(roomIds.includes('kitchen'),        'kitchen defined');
check(roomIds.includes('bedroom'),        'bedroom defined');
check(roomIds.includes('chapel'),         'chapel defined');
check(roomIds.includes('portal_chamber'), 'portal_chamber defined');
check(roomIds.includes('workshop'),       'workshop defined');
check(roomIds.includes('dining_room'),    'dining_room defined');
check(roomIds.includes('throne_room'),    'throne_room defined');
check(roomIds.includes('garden'),         'garden defined');
check(roomIds.includes('study'),          'study defined');
check(roomIds.includes('menagerie'),      'menagerie defined');
check(roomIds.includes('costume_room'),   'costume_room defined');

// Every room has 3-6 hotspots.
let hotspotOk = true;
for (const id of roomIds) {
  const hs = rooms.hotspotsFor(id);
  if (hs.length < 3 || hs.length > 6) { hotspotOk = false; log('hotspot check', { room: id, count: hs.length }); }
}
check(hotspotOk, 'every room has 3-6 hotspots');

// Every hotspot has 7 tier options (regular -> crystal).
const tiers = furniture.tiers();
check(tiers.length === 7, `7 tiers defined (got ${tiers.length})`);
check(tiers[0].name === 'regular', 'tier 1 is regular');
check(tiers[tiers.length - 1].name === 'crystal', 'tier 7 is crystal');
check(tiers[6].level === 99, 'crystal tier requires Construction 99');

let tierCoverageOk = true;
for (const rId of roomIds) {
  for (const hs of rooms.hotspotsFor(rId)) {
    const opts = furniture.furnitureForHotspot(rId, hs);
    if (opts.length !== 7) { tierCoverageOk = false; log('tier coverage fail', { room: rId, hotspot: hs, count: opts.length }); }
  }
}
check(tierCoverageOk, 'every hotspot has 7 tier options');

// ══════════════════════════════════════════════════════════════════════════════
// 2. Unlock gate — Construction 10 required
// ══════════════════════════════════════════════════════════════════════════════

const p = player.createPlayer(1, 'Homeowner');
check(p.skills.construction.level === 1, 'fresh player at Construction 1');

const noHouse = housing.createHouse(p);
check(!noHouse.ok, 'cannot create house at Construction 1');
check(/construction 10/i.test(noHouse.reason), 'unlock reason mentions Construction 10');

// Grant XP up to level 10.
player.addXp(p, 'construction', 1500); // should reach >= level 10
log('construction level after xp', p.skills.construction.level);
check(p.skills.construction.level >= 10, 'construction level >= 10 after xp burst');

const ok = housing.createHouse(p);
check(ok.ok, 'createHouse succeeds at Construction 10');
check(!!ok.house, 'house object returned');
check(ok.house.layer === housing.HOUSE_LAYER_BASE + p.id, 'instance layer is HOUSE_LAYER_BASE + playerId');
check(housing.hasHouse(p), 'hasHouse returns true after creation');

// Cannot create twice.
const dupe = housing.createHouse(p);
check(!dupe.ok, 'cannot create a second house');

// ══════════════════════════════════════════════════════════════════════════════
// 3. Room cap scaling
// ══════════════════════════════════════════════════════════════════════════════

check(housing.roomCapForLevel(10) === 3,  'cap at Construction 10 = 3');
check(housing.roomCapForLevel(99) === 32, 'cap at Construction 99 = 32');
check(housing.roomCapForLevel(5)  === 0,  'cap below unlock = 0');
check(housing.roomCapForLevel(50) > 3 && housing.roomCapForLevel(50) < 32, 'cap at 50 is between 3 and 32');

// ══════════════════════════════════════════════════════════════════════════════
// 4. buildRoom
// ══════════════════════════════════════════════════════════════════════════════

const build1 = housing.buildRoom(p, 'parlour', 0);
check(build1.ok, 'build parlour at slot 0');
check(build1.xp === rooms.getRoom('parlour').buildXp, 'parlour build awarded correct XP');

const build2 = housing.buildRoom(p, 'parlour', 0);
check(!build2.ok, 'cannot build twice on same slot');

const build3 = housing.buildRoom(p, 'kitchen', 1);
check(build3.ok, 'build kitchen at slot 1');

const build4 = housing.buildRoom(p, 'workshop', 2);
check(build4.ok, 'build workshop at slot 2');

// Hitting the cap (Construction 10 -> 3 rooms).
const build5 = housing.buildRoom(p, 'kitchen', 3);
check(!build5.ok, 'cannot build past room cap at low construction');
check(/cap/i.test(build5.reason), 'cap reason explains the limit');

// Unknown room
const badRoom = housing.buildRoom(p, 'orgy_room', 4);
check(!badRoom.ok, 'unknown room type rejected');

// Raise Construction to build more rooms.
player.addXp(p, 'construction', 14000000); // crank it up
log('construction after mega xp', p.skills.construction.level);
check(p.skills.construction.level >= 60, 'construction >= 60 after mega xp');

const buildChapel = housing.buildRoom(p, 'chapel', 4);
check(buildChapel.ok, 'build chapel after leveling');

const buildPortal = housing.buildRoom(p, 'portal_chamber', 5);
check(buildPortal.ok, 'build portal chamber after leveling');

// ══════════════════════════════════════════════════════════════════════════════
// 5. Furniture placement + tier scaling
// ══════════════════════════════════════════════════════════════════════════════

// Find a valid regular-tier furniture for kitchen range hotspot.
const kitchenRange1 = 'kitchen_range_t1';
const f1 = furniture.getFurniture(kitchenRange1);
check(!!f1, 'regular tier kitchen range exists');
check(f1.level === 1, 'regular tier level = 1');
check(f1.xp > 0, 'regular tier awards XP');

const placeF1 = housing.addFurniture(p, 1, kitchenRange1);
check(placeF1.ok, 'place regular range in kitchen');

// Test higher tier
const crystalRange = 'kitchen_range_t7';
const fCrystal = furniture.getFurniture(crystalRange);
check(fCrystal.level === 99, 'crystal tier requires level 99');
check(fCrystal.xp > f1.xp, 'crystal tier XP > regular tier XP');

// Remove furniture
const removeF1 = housing.removeFurniture(p, 1, kitchenRange1);
check(removeF1.ok, 'remove furniture succeeds');

// Wrong-room furniture
const wrongRoom = housing.addFurniture(p, 1, 'parlour_telepad_t1');
check(!wrongRoom.ok, 'cannot place parlour furniture in kitchen');

// ══════════════════════════════════════════════════════════════════════════════
// 6. enterHouse / leaveHouse
// ══════════════════════════════════════════════════════════════════════════════

const enter = housing.enterHouse(p);
check(enter.ok, 'enterHouse succeeds');
check(p.layer === enter.layer, 'player layer switched to house layer');
check(p.inHouse === p.id, 'p.inHouse tag set to owner id');
check(p.houseLocation !== null, 'houseLocation saved before entering');

const leave = housing.leaveHouse(p);
check(leave.ok, 'leaveHouse succeeds');
check(p.inHouse === null, 'inHouse cleared after leave');
check(p.houseLocation === null, 'houseLocation cleared after leave');

// Visitor entry
const visitor = player.createPlayer(2, 'Visitor');
const visit = housing.enterHouse(visitor, p);
check(visit.ok, 'visitor can enter friend-permission house');

// ══════════════════════════════════════════════════════════════════════════════
// 7. Portal chamber
// ══════════════════════════════════════════════════════════════════════════════

// Need a portal frame on portal_1 before attuning
const portalFrame1 = housing.addFurniture(p, 5, 'portal_chamber_portal_1_t1');
check(portalFrame1.ok, 'place portal frame on portal_1');

const attune = housing.setPortalDestination(p, 'portal_1', 'heartlands');
check(attune.ok, 'attune portal_1 to heartlands');

const attune2 = housing.setPortalDestination(p, 'portal_1', 'glass_desert');
check(attune2.ok, 're-attune portal_1 to glass_desert');

const portals = housing.listPortals(p);
check(portals.length === 1 && portals[0].region === 'glass_desert', 'listPortals returns current attunement');

// ══════════════════════════════════════════════════════════════════════════════
// 8. Bedroom sleep
// ══════════════════════════════════════════════════════════════════════════════

const noBed = housing.sleep(p);
check(!noBed.ok, 'cannot sleep without a bedroom');

const buildBedroom = housing.buildRoom(p, 'bedroom', 6);
check(buildBedroom.ok, 'build bedroom');

const sleepR = housing.sleep(p);
check(sleepR.ok, 'sleep succeeds with bedroom');
check(p.restBoost && p.restBoost.multiplier === 1.25, 'rest boost set to 1.25x');

const sleepAgain = housing.sleep(p);
check(!sleepAgain.ok, 'cannot sleep twice (daily cooldown)');

// ══════════════════════════════════════════════════════════════════════════════
// 9. Dining / feast
// ══════════════════════════════════════════════════════════════════════════════

const buildDining = housing.buildRoom(p, 'dining_room', 7);
check(buildDining.ok, 'build dining room');

const feast = housing.startFeast(p, ['guest1', 'guest2']);
check(feast.ok, 'start feast with 2 guests');
check(feast.feast.guests.length === 2, 'feast tracks guest list');

const endFeastR = housing.endFeast(p);
check(endFeastR.ok, 'end feast');

// ══════════════════════════════════════════════════════════════════════════════
// 10. Redecorate preview
// ══════════════════════════════════════════════════════════════════════════════

const preview = housing.previewChange(p, { type: 'buildRoom', roomType: 'menagerie' });
check(preview.ok, 'preview menagerie build');
check(preview.projectedXp > 0, 'preview shows projected XP');

// ══════════════════════════════════════════════════════════════════════════════
// 11. destroyRoom
// ══════════════════════════════════════════════════════════════════════════════

const destroyR = housing.destroyRoom(p, 7);
check(destroyR.ok, 'destroy dining room');
check(destroyR.removed.roomId === 'dining_room', 'destroyed room id matches');

// ══════════════════════════════════════════════════════════════════════════════
// 12. Persistence round-trip
// ══════════════════════════════════════════════════════════════════════════════

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'housing-test-'));
const saved = housing.saveHouses(tmpDir);
check(fs.existsSync(saved), 'saveHouses writes houses.json');

const serialized = housing.serializeAll();
check(typeof serialized === 'object' && serialized[p.id], 'serializeAll contains player house');
check(Array.isArray(serialized[p.id].rooms), 'serialized house has rooms array');

housing._resetForTest();
check(!housing.hasHouse(p), 'after reset, no house');

const loaded = housing.loadHouses(tmpDir);
check(loaded >= 1, 'loadHouses restores >= 1 house');
check(housing.hasHouse(p), 'house restored after load');

const restored = housing.getHouse(p);
check(restored.rooms.length > 0, 'restored house has rooms');
check(restored.portalDestinations.portal_1 === 'glass_desert', 'portal attunement survives load');

// ══════════════════════════════════════════════════════════════════════════════
// 13. player.house[] array mirror
// ══════════════════════════════════════════════════════════════════════════════

// After restore, sync by building one more room
housing.buildRoom(p, 'study', 8);
check(Array.isArray(p.house), 'player.house is an array');
check(p.house.length > 0, 'player.house mirrors house.rooms');
check(p.house.every(r => typeof r.type === 'string'), 'each entry has type field');
check(p.house.every(r => typeof r.furniture === 'object'), 'each entry has furniture object');

// ══════════════════════════════════════════════════════════════════════════════
// 14. /house commands round-trip
// ══════════════════════════════════════════════════════════════════════════════

const pCmd = player.createPlayer(3, 'CmdHouse');
player.addXp(pCmd, 'construction', 1500);

const createOut = commands.execute(pCmd, 'house create');
log('/house create', createOut);
check(/House created/i.test(createOut), '/house create works');

const buildOut = commands.execute(pCmd, 'house build parlour 0');
log('/house build parlour 0', buildOut);
check(/parlour/i.test(buildOut), '/house build reports room');

const statusOut = commands.execute(pCmd, 'house status');
log('/house status (snippet)', statusOut.split('\n').slice(0, 4).join(' | '));
check(/parlour/i.test(statusOut), '/house status shows parlour');

const leaveOut = commands.execute(pCmd, 'house leave');
check(/not inside/i.test(leaveOut) || /step outside/i.test(leaveOut), '/house leave responds');

const enterOut = commands.execute(pCmd, 'house enter');
check(/enter the house/i.test(enterOut), '/house enter works');

const leaveOut2 = commands.execute(pCmd, 'house leave');
check(/step outside/i.test(leaveOut2), '/house leave after enter works');

const portalOut = commands.execute(pCmd, 'house portal list');
check(/no portals/i.test(portalOut), '/house portal list on empty');

const redecorateOut = commands.execute(pCmd, 'house redecorate room kitchen');
log('/house redecorate room kitchen', redecorateOut);
check(/Construction/i.test(redecorateOut), '/house redecorate shows projection');

// ══════════════════════════════════════════════════════════════════════════════
// 15. Construction XP is awarded
// ══════════════════════════════════════════════════════════════════════════════

const pXp = player.createPlayer(4, 'XpBuilder');
player.addXp(pXp, 'construction', 1500); // level 10
const beforeXp = pXp.skills.construction.xp;
housing.createHouse(pXp);
housing.buildRoom(pXp, 'parlour', 0);
const afterXp = pXp.skills.construction.xp;
check(afterXp > beforeXp, 'building a room awarded Construction XP');

// Furniture also grants XP
housing.addFurniture(pXp, 0, 'parlour_rug_t1');
const afterFurniture = pXp.skills.construction.xp;
check(afterFurniture > afterXp, 'placing furniture awarded Construction XP');

// ══════════════════════════════════════════════════════════════════════════════
// 16. Invalid inputs
// ══════════════════════════════════════════════════════════════════════════════

const pInv = player.createPlayer(5, 'Invalid');
player.addXp(pInv, 'construction', 1500);
housing.createHouse(pInv);

const invalidSlot = housing.buildRoom(pInv, 'parlour', 999);
check(!invalidSlot.ok, 'invalid slot (999) rejected');

const negSlot = housing.buildRoom(pInv, 'parlour', -1);
check(!negSlot.ok, 'invalid slot (-1) rejected');

const invalidFurnId = housing.addFurniture(pInv, 0, 'NONEXISTENT');
check(!invalidFurnId.ok, 'unknown furniture id rejected');

// Cleanup
try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}

// ══════════════════════════════════════════════════════════════════════════════
// Summary
// ══════════════════════════════════════════════════════════════════════════════
console.log(`\n── Results ── ${pass} passed, ${fail} failed ──`);
process.exit(fail === 0 ? 0 : 1);
