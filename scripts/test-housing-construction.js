#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// burn-v2: test-housing-construction
//
// Verifies the cross-link between Construction training and player housing:
//   1.  XP from non-housing sources ticks housing progress and fires unlock
//       notifications for room types crossed
//   2.  Housing actions (build/addFurniture/upgrade/repair) grant Construction
//       XP and apply tier multipliers (demonic = 5x, crystal = 8x)
//   3.  Planks + nails supply chain is consumed on buildRoom
//   4.  Sawmill recipes register cleanly and are dispatchable via the recipe
//       runner (/craft plank)
//   5.  Trophy room unlocks on first Grandmaster quest completion
//   6.  Costume room unlocks at 500 total level
//   7.  Feast consumes pantry food, applies +25% buff to clan members, and
//       enforces the 24-hour cooldown
//
// Runs in isolation. No server, no websocket.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

// Load the sawmill-recipes module up front so the recipe-runner can resolve
// /craft plank dispatches when this test exercises it.
require('../src/content/aelgard/sawmill-recipes');

const player = require('../src/player/player');
const housing = require('../src/engine/housing');
const rooms = require('../src/content/aelgard/housing-rooms');
const furniture = require('../src/content/aelgard/housing-furniture');
const events = require('../src/engine/events');
const quests = require('../src/data/quests');
const recipes = require('../src/data/recipes');
const recipeRunner = require('../src/engine/recipe-runner');

housing.register({ persistence: null });

let pass = 0, fail = 0;
function check(cond, msg) {
  if (cond) { console.log('PASS:', msg); pass++; }
  else      { console.log('FAIL:', msg); fail++; }
}

function log(label, v) {
  console.log(`[${label}]`, typeof v === 'string' ? v : JSON.stringify(v));
}

function seedMaterials(p) {
  player.invAdd(p, 700, 'Plank', 500, true);
  player.invAdd(p, 701, 'Oak plank', 500, true);
  player.invAdd(p, 702, 'Teak plank', 500, true);
  player.invAdd(p, 703, 'Mahogany plank', 500, true);
  player.invAdd(p, 705, 'Steel nails', 5000, true);
}

housing._resetForTest();

// ══════════════════════════════════════════════════════════════════════════════
// 1. Catalogue integrity: costume_room + trophy_room gated correctly
// ══════════════════════════════════════════════════════════════════════════════
console.log('\n── Section 1: Catalogue integrity ──');

const costume = rooms.getRoom('costume_room');
check(!!costume, 'costume_room exists');
check(costume.buildLevel === 42, 'costume_room build level is 42');
check(Array.isArray(costume.unlockConditions), 'costume_room has unlockConditions array');
check(costume.unlockConditions.includes('total_level_500'), 'costume_room gated on 500 total level');

const trophy = rooms.getRoom('trophy_room');
check(!!trophy, 'trophy_room exists');
check(trophy.buildLevel === 70, 'trophy_room build level is 70');
check(trophy.unlockConditions.includes('grandmaster_quest'), 'trophy_room gated on grandmaster quest');

check(rooms.getRoom('parlour').buildLevel === 1,  'parlour buildLevel = 1 per spec');
check(rooms.getRoom('kitchen').buildLevel === 5,  'kitchen buildLevel = 5 per spec');
check(rooms.getRoom('chapel').buildLevel === 25,  'chapel buildLevel = 25 per spec');
check(rooms.getRoom('portal_chamber').buildLevel === 50, 'portal_chamber buildLevel = 50 per spec');

// ══════════════════════════════════════════════════════════════════════════════
// 2. Cross-link: non-housing Construction XP ticks housing progress + fires
//    a 'house_room_unlocked' event on level crossings
// ══════════════════════════════════════════════════════════════════════════════
console.log('\n── Section 2: XP cross-link ──');

const p1 = player.createPlayer(101, 'Trainee');
player.addXp(p1, 'construction', 1500); // -> level 10-11
seedMaterials(p1);
const createRes = housing.createHouse(p1);
check(createRes.ok, 'player can create house at Construction 10');
const house1 = housing.getHouse(p1);
check(typeof house1.progressXp === 'number', 'house tracks progressXp counter');
check(house1.progressXp > 0, 'progressXp seeded from current Construction XP');

const unlockEvents = [];
events.on('house_room_unlocked', 'test-housing', (e) => { unlockEvents.push(e); });

// Simulate XP gain from a training method: raise construction to level 30+
// so chapel (25), dining_room (15), bedroom (20), garden (25) all cross.
const beforeLvl = p1.skills.construction.level;
player.addXp(p1, 'construction', 100000); // -> level ~35
housing.notifyConstructionXp(p1, 100000, { source: 'sawmill_mahogany_planking' });

const chapelUnlock = unlockEvents.find(e => e.roomType === 'chapel');
check(!!chapelUnlock, 'crossing Construction 25 fires house_room_unlocked for chapel');
const diningUnlock = unlockEvents.find(e => e.roomType === 'dining_room');
check(!!diningUnlock, 'crossing 15 fires unlock for dining_room');
const bedroomUnlock = unlockEvents.find(e => e.roomType === 'bedroom');
check(!!bedroomUnlock, 'crossing 20 fires unlock for bedroom');

check(p1.skills.construction.level > beforeLvl, 'non-housing XP raised Construction level');
check(house1.progressXp >= 100000, 'house progressXp accumulated non-housing XP');

// onConstructionXpGained listener
const seen = [];
const unsub = housing.onConstructionXpGained((e) => { seen.push(e); });
housing.notifyConstructionXp(p1, 500, { source: 'anvil' });
check(seen.length === 1, 'onConstructionXpGained listener fires for external XP');
check(seen[0].xp === 500, 'listener receives correct xp amount');
check(seen[0].meta.source === 'anvil', 'listener receives caller-provided meta');
unsub();

// ══════════════════════════════════════════════════════════════════════════════
// 3. Per-action XP: build / addFurniture / upgrade / repair + tier multipliers
// ══════════════════════════════════════════════════════════════════════════════
console.log('\n── Section 3: Per-action XP and tier multipliers ──');

check(housing.tierXpMultiplier('regular') === 1, 'regular tier XP multiplier = 1');
check(housing.tierXpMultiplier('demonic') === 5, 'demonic tier XP multiplier = 5');
check(housing.tierXpMultiplier('crystal') === 8, 'crystal tier XP multiplier = 8');

const p2 = player.createPlayer(102, 'TierMaster');
player.addXp(p2, 'construction', 14000000); // max out construction
seedMaterials(p2);
housing.createHouse(p2);
const built = housing.buildRoom(p2, 'parlour', 0);
check(built.ok, 'build parlour at max construction');
check(built.xp === rooms.getRoom('parlour').buildXp, 'build XP equals parlour buildXp');

// Furniture IDs in the catalogue follow <room>_<hotspot>_t<tierId>. The rug
// hotspot exists on the parlour.
const rugT1Id = 'parlour_rug_t1';
const rugT6Id = 'parlour_rug_t6';   // demonic
const rugT7Id = 'parlour_rug_t7';   // crystal
const rugT3Id = 'parlour_rug_t3';   // teak (lower than demonic)

const rugT1 = housing.addFurniture(p2, 0, rugT1Id);
check(rugT1.ok, 'place tier-1 rug in parlour');
const rugT1Xp = rugT1.xp;
check(rugT1Xp === furniture.getFurniture(rugT1Id).xp, 'tier-1 XP = base xp (multiplier 1)');

// Upgrade to demonic (tier 6) — must be 5x base
const upgraded = housing.upgradeFurniture(p2, 0, rugT6Id);
check(upgraded.ok, 'upgrade rug from tier-1 to demonic (tier-6)');
const expectedDemonicXp = Math.floor(furniture.getFurniture(rugT6Id).xp * 5);
check(upgraded.xp === expectedDemonicXp, 'demonic upgrade awards 5x base XP');

// Upgrade to crystal (tier 7) — 8x base
const upgraded2 = housing.upgradeFurniture(p2, 0, rugT7Id);
check(upgraded2.ok, 'upgrade rug from demonic to crystal (tier-7)');
const expectedCrystalXp = Math.floor(furniture.getFurniture(rugT7Id).xp * 8);
check(upgraded2.xp === expectedCrystalXp, 'crystal upgrade awards 8x base XP');

// Same-or-lower tier rejected
const downgradeAttempt = housing.upgradeFurniture(p2, 0, rugT3Id);
check(!downgradeAttempt.ok, 'cannot downgrade to lower tier');

// Repair: damage then repair
housing.damageRoom(p2, 0, 30);
const rep = housing.repairRoom(p2, 0);
check(rep.ok, 'repair damaged room');
check(rep.xp > 0, 'repair grants XP');
check(rep.restoredFrom === 70, 'repair restored from 70% condition');

// Repairing undamaged room rejected
const rep2 = housing.repairRoom(p2, 0);
check(!rep2.ok, 'cannot repair undamaged room');

// ══════════════════════════════════════════════════════════════════════════════
// 4. Plank/nail supply chain
// ══════════════════════════════════════════════════════════════════════════════
console.log('\n── Section 4: Planks + nails supply chain ──');

const costParlour = housing.plankCostForRoom(rooms.getRoom('parlour'));
check(costParlour.planks === 0, 'parlour (level 1) has 0 plank cost');

const costKitchen = housing.plankCostForRoom(rooms.getRoom('kitchen'));
check(costKitchen.planks === 6, 'kitchen (level 5) requires 6 planks');
check(costKitchen.plankTier === 'plank', 'kitchen uses basic planks');

const costChapel = housing.plankCostForRoom(rooms.getRoom('chapel'));
check(costChapel.planks >= 15, 'chapel requires 15+ planks');
check(costChapel.plankTier === 'oak_plank', 'chapel uses oak planks');

const costPortal = housing.plankCostForRoom(rooms.getRoom('portal_chamber'));
check(costPortal.plankTier === 'teak_plank', 'portal_chamber uses teak planks');

// Player with no planks: build fails
const p3 = player.createPlayer(103, 'NoPlanks');
player.addXp(p3, 'construction', 1500);
housing.createHouse(p3);
const buildNoMat = housing.buildRoom(p3, 'kitchen', 0);
check(!buildNoMat.ok, 'buildRoom without planks fails');
check(/plank/i.test(buildNoMat.reason), 'failure reason mentions planks');

// After seeding, it succeeds and planks are consumed
seedMaterials(p3);
const planksBefore = p3.inventory.filter(s => s && s.id === 700).reduce((a, s) => a + (s.count || 1), 0);
const nailsBefore = p3.inventory.filter(s => s && s.id === 705).reduce((a, s) => a + (s.count || 1), 0);
const buildKitchen = housing.buildRoom(p3, 'kitchen', 0);
check(buildKitchen.ok, 'buildRoom succeeds with planks');
const planksAfter = p3.inventory.filter(s => s && s.id === 700).reduce((a, s) => a + (s.count || 1), 0);
const nailsAfter = p3.inventory.filter(s => s && s.id === 705).reduce((a, s) => a + (s.count || 1), 0);
check(planksBefore - planksAfter === 6, 'building kitchen consumed exactly 6 planks');
check(nailsBefore - nailsAfter === 6, 'building kitchen consumed exactly 6 nails');
check(buildKitchen.consumed.planks === 6, 'build result reports 6 planks consumed');

// ══════════════════════════════════════════════════════════════════════════════
// 5. Sawmill recipes: /craft plank dispatches through recipe-runner
// ══════════════════════════════════════════════════════════════════════════════
console.log('\n── Section 5: Sawmill recipes registered ──');

check(!!recipes.findById('make_plank'),           'make_plank recipe registered');
check(!!recipes.findById('make_oak_plank'),       'make_oak_plank recipe registered');
check(!!recipes.findById('make_teak_plank'),      'make_teak_plank recipe registered');
check(!!recipes.findById('make_mahogany_plank'),  'make_mahogany_plank recipe registered');
check(!!recipes.findById('make_yew_plank'),       'make_yew_plank recipe registered');
check(!!recipes.findById('make_magic_plank'),     'make_magic_plank recipe registered');
check(!!recipes.findById('make_marble_plank'),    'make_marble_plank recipe registered');
check(!!recipes.findById('make_planks_bulk_basic'), 'make_planks_bulk_basic registered');
check(!!recipes.findById('make_planks_bulk_oak'),   'make_planks_bulk_oak registered');
check(!!recipes.findById('redeem_sawmill_contract'), 'redeem_sawmill_contract registered');

// Dispatch via recipe-runner. The recipe-runner checks station and inputs;
// in this isolated test environment there is no sawmill object so we expect
// the station check to fail gracefully.
const p4 = player.createPlayer(104, 'SawmillRunner');
player.addXp(p4, 'construction', 14000000);
player.invAdd(p4, 205, 'Magic logs', 5, false); // for magic plank

const craftRes = recipeRunner.craft(p4, 'make_magic_plank');
check(!craftRes.ok, 'craft make_magic_plank without sawmill rejected');
check(/sawmill/i.test(craftRes.reason || ''), 'rejection mentions sawmill station');

// ══════════════════════════════════════════════════════════════════════════════
// 6. Costume room unlock: requires 500 total level
// ══════════════════════════════════════════════════════════════════════════════
console.log('\n── Section 6: Costume room gated on 500 total level ──');

const p5 = player.createPlayer(105, 'PartialTotal');
player.addXp(p5, 'construction', 14000000); // level 99 construction
seedMaterials(p5);
housing.createHouse(p5);
const preCostume = housing.buildRoom(p5, 'costume_room', 10);
check(!preCostume.ok, 'costume_room rejected below 500 total');
check(/total level/i.test(preCostume.reason), 'rejection mentions total level');

// Crank every skill to lvl > 23 so total = 500+ (23 skills × 22 = 506).
const skills = Object.keys(p5.skills);
for (const s of skills) {
  if (s === 'construction' || s === 'hitpoints') continue;
  player.addXp(p5, s, 15000); // pushes to ~level 33
}
check(player.totalLevel(p5) >= 500, `total level now >= 500 (${player.totalLevel(p5)})`);

const postCostume = housing.buildRoom(p5, 'costume_room', 10);
check(postCostume.ok, 'costume_room succeeds at 500+ total level');

// ══════════════════════════════════════════════════════════════════════════════
// 7. Trophy room unlock: requires a Grandmaster-difficulty quest
// ══════════════════════════════════════════════════════════════════════════════
console.log('\n── Section 7: Trophy room gated on grandmaster quest ──');

const p6 = player.createPlayer(106, 'QuestlessHero');
player.addXp(p6, 'construction', 14000000);
seedMaterials(p6);
housing.createHouse(p6);
const preTrophy = housing.buildRoom(p6, 'trophy_room', 10);
check(!preTrophy.ok, 'trophy_room rejected with no grandmaster quest completed');
check(/grandmaster/i.test(preTrophy.reason), 'rejection mentions grandmaster');

// Define a cheap Grandmaster quest + mark complete
quests.define('test_gm_quest', {
  name: 'Test Grandmaster Trial', difficulty: 'Grandmaster',
  questPoints: 1, requirements: {}, steps: [{ text: 'Do the thing.' }],
  rewards: {},
});
p6.questProgress = p6.questProgress || {};
p6.questProgress['test_gm_quest'] = { started: true, step: 1, complete: true, completedAt: 0 };

check(housing.hasGrandmasterQuestCompleted(p6), 'player now has a completed grandmaster quest');

const postTrophy = housing.buildRoom(p6, 'trophy_room', 10);
check(postTrophy.ok, 'trophy_room unlocks after grandmaster quest completed');

// Trophy room unlock also fires via notify
housing._resetForTest();
const p6b = player.createPlayer(107, 'GmUnlock');
player.addXp(p6b, 'construction', 14000000);
seedMaterials(p6b);
housing.createHouse(p6b);
const events2 = [];
events.on('house_room_unlocked', 'test-gm', (e) => events2.push(e));
// Mark gm complete *after* house creation, then tick XP to re-evaluate.
p6b.questProgress = p6b.questProgress || {};
p6b.questProgress['test_gm_quest'] = { started: true, step: 1, complete: true, completedAt: 0 };
housing.notifyConstructionXp(p6b, 1, { source: 'recompute' });
const trophyFired = events2.find(e => e.roomType === 'trophy_room');
check(!!trophyFired, 'trophy_room unlock event fires when grandmaster completion is detected');

// ══════════════════════════════════════════════════════════════════════════════
// 8. Feast: +25% XP buff, 30-min duration, 24h cooldown, food consumption
// ══════════════════════════════════════════════════════════════════════════════
console.log('\n── Section 8: Feast mechanics ──');

housing._resetForTest();
const host = player.createPlayer(201, 'FeastHost');
player.addXp(host, 'construction', 14000000);
seedMaterials(host);
host.clan = 'Ironfist';
housing.createHouse(host);
housing.buildRoom(host, 'parlour', 0);
housing.buildRoom(host, 'dining_room', 1);

// No pantry yet → feast fails
const feastNoFood = housing.startFeast(host, []);
check(!feastNoFood.ok, 'feast rejected with empty pantry');
check(/food/i.test(feastNoFood.reason), 'rejection mentions food');

// Stock pantry with sharks (id 237)
housing._stockPantryRaw(host, 237, 10);

// Clan guests
const guest1 = player.createPlayer(202, 'ClanBuddy1');
guest1.clan = 'Ironfist';
const guest2 = player.createPlayer(203, 'ClanBuddy2');
guest2.clan = 'Ironfist';
const stranger = player.createPlayer(204, 'Rival');
stranger.clan = 'OtherClan';

const feast = housing.startFeast(host, [guest1, guest2, stranger]);
check(feast.ok, 'feast starts with pantry stocked');
check(feast.buff.multiplier === 1.25, 'feast buff is +25%');
check(feast.buff.expiresAt - Date.now() > 29 * 60 * 1000, 'buff lasts ~30 minutes');
check(host.feastBuff && host.feastBuff.multiplier === 1.25, 'host got the buff');
check(guest1.feastBuff && guest1.feastBuff.multiplier === 1.25, 'clan guest 1 got the buff');
check(guest2.feastBuff && guest2.feastBuff.multiplier === 1.25, 'clan guest 2 got the buff');
check(!stranger.feastBuff, 'non-clan stranger did NOT get the buff');

const hostHouse = housing.getHouse(host);
const sharksLeft = hostHouse.pantry[237] || 0;
check(sharksLeft === 0, 'feast consumed all 10 sharks from pantry');

// Second feast blocked by 24h cooldown
housing._stockPantryRaw(host, 237, 10);
const cooldownFeast = housing.startFeast(host, []);
check(!cooldownFeast.ok, 'feast blocked by 24h cooldown');
check(/cooldown/i.test(cooldownFeast.reason), 'rejection mentions cooldown');

check(housing.feastBuffActive(host), 'feastBuffActive reports true during buff');

// ══════════════════════════════════════════════════════════════════════════════
// 9. Room unlock recompute for existing houses after XP injection
// ══════════════════════════════════════════════════════════════════════════════
console.log('\n── Section 9: Unlock state recompute ──');

housing._resetForTest();
const p7 = player.createPlayer(301, 'Recomputer');
player.addXp(p7, 'construction', 1500); // level 10-11
seedMaterials(p7);
housing.createHouse(p7);
const unlocked10 = housing.computeUnlockedRooms(p7);
check(unlocked10.parlour.unlocked, 'parlour unlocked at level 10');
check(unlocked10.kitchen.unlocked, 'kitchen unlocked at level 10');
check(!unlocked10.chapel.unlocked, 'chapel NOT unlocked at level 10');
check(!unlocked10.portal_chamber.unlocked, 'portal_chamber NOT unlocked at level 10');

player.addXp(p7, 'construction', 90000); // -> level ~30+
housing.notifyConstructionXp(p7, 90000, { source: 'training-runner' });
const unlocked30 = housing.computeUnlockedRooms(p7);
check(unlocked30.chapel.unlocked, 'chapel unlocked after XP injection');
check(unlocked30.garden.unlocked, 'garden unlocked after XP injection');

// costume_room still locked because total level < 500
check(!unlocked30.costume_room.unlocked, 'costume_room still locked at 500-total gate');

// ══════════════════════════════════════════════════════════════════════════════
// 10. Persistence: progressXp + pantry + feast cooldown survive save/load
// ══════════════════════════════════════════════════════════════════════════════
console.log('\n── Section 10: Persistence of burn-v2 fields ──');

const serialized = housing.serializeAll();
const keys = Object.keys(serialized);
check(keys.length > 0, 'serializeAll has entries');
const firstKey = keys[0];
const rec = serialized[firstKey];
check(typeof rec.progressXp === 'number', 'progressXp serialized');
check(typeof rec.feastCooldownUntil === 'number', 'feastCooldownUntil serialized');
check(typeof rec.pantry === 'object', 'pantry serialized');
check(typeof rec.unlockedRoomTypes === 'object', 'unlockedRoomTypes serialized');

// round-trip
housing._resetForTest();
housing.restoreAll(serialized);
const restored = housing.getHouse({ id: Number(firstKey) });
check(!!restored, 'restore round-trip finds house');
check(typeof restored.progressXp === 'number', 'restored house has progressXp');

// ══════════════════════════════════════════════════════════════════════════════
// 11. Invariants: notifyConstructionXp safe without a house
// ══════════════════════════════════════════════════════════════════════════════
console.log('\n── Section 11: Safety invariants ──');

housing._resetForTest();
const pNoHouse = player.createPlayer(401, 'NoHouse');
const newUnlocks = housing.notifyConstructionXp(pNoHouse, 100, { source: 'any' });
check(Array.isArray(newUnlocks) && newUnlocks.length === 0, 'notify without house returns []');
check(!housing.hasHouse(pNoHouse), 'no house is created as a side-effect');

// Zero/negative XP is ignored
const zeroUnlocks = housing.notifyConstructionXp(pNoHouse, 0, { source: 'zero' });
check(Array.isArray(zeroUnlocks) && zeroUnlocks.length === 0, 'zero XP is a no-op');

// ══════════════════════════════════════════════════════════════════════════════
// Summary
// ══════════════════════════════════════════════════════════════════════════════
console.log(`\n── Results ── ${pass} passed, ${fail} failed ──`);
process.exit(fail === 0 ? 0 : 1);
