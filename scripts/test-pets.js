#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// Test: Pet Companion Runtime
// Run: node scripts/test-pets.js
//
// Verifies:
//   1. Registry: importCollection + REG() → 40+ pets loaded, unique ids.
//   2. unlockPet adds, dedupes, rejects unknown.
//   3. getPets returns summary objects with expected shape.
//   4. summonPet / dismissPet / currentPet state transitions.
//   5. Follower position is placed behind the player.
//   6. feedPet — whitelist bonus, non-whitelisted penalty, inventory consume.
//   7. Affinity leveling + shiny unlock at lv 10.
//   8. Combat hooks: onCombatStart suspends passive pets, onCombatEnd re-summons.
//   9. Combat-eligible pets stay active; damage contribution capped at 1%.
//   10. Boss drop roll (onLootDrop) — pinned RNG → pet awarded and unlocked.
//   11. Skill drop roll (onSkillAction) — pinned RNG → skill pet awarded.
//   12. Hardcore death wipes uninsured pets, halves affinity of insured ones.
//   13. Command wiring: `/pet list`, summon, dismiss, feed, rename, insured.
//   14. tick() drifts the follower back to the player.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const path = require('path');

// Load pets-extended first — it registers every known pet and imports the base
// collection file, so pets-collection.js (with its console.log) is also pulled.
require(path.join(__dirname, '..', 'src', 'content', 'aelgard', 'pets-extended'));

const pets         = require(path.join(__dirname, '..', 'src', 'engine', 'pets'));
const events       = require(path.join(__dirname, '..', 'src', 'engine', 'events'));
const commands     = require(path.join(__dirname, '..', 'src', 'engine', 'commands'));
const petsCommands = require(path.join(__dirname, '..', 'src', 'engine', 'pets-commands'));

// ── Test harness ─────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const failures = [];

function assert(cond, label) {
  if (cond) { passed++; console.log('  PASS  ' + label); }
  else      { failed++; failures.push(label); console.error('  FAIL  ' + label); }
}
function eq(a, b, label) {
  const ok = a === b;
  assert(ok, `${label} (expected ${JSON.stringify(b)}, got ${JSON.stringify(a)})`);
}
function section(title) { console.log('\n=== ' + title + ' ==='); }

function makePlayer(id) {
  return {
    id, name: id,
    x: 100, y: 100, layer: 0,
    facing: 'south',
    combatTarget: null,
    skills: { mining: { level: 50, xp: 0 }, fishing: { level: 1, xp: 0 } },
    inventory: new Array(28).fill(null),
  };
}
function giveItem(p, id, count) {
  for (let i = 0; i < p.inventory.length; i++) {
    if (p.inventory[i] == null) { p.inventory[i] = { id, name: 'food-' + id, count: count || 1 }; return i; }
  }
  return -1;
}

// Install pet commands with a dummy items module (find by numeric id).
petsCommands.register({ commands, pets });

// ══════════════════════════════════════════════════════════════════════════════
// 1. Registry
// ══════════════════════════════════════════════════════════════════════════════
section('Registry / definitions');

const allDefs = pets.listPetDefs();
assert(allDefs.length >= 40, 'At least 40 pets registered (got ' + allDefs.length + ')');

// Unique ids
const idSet = new Set(allDefs.map(d => d.id));
eq(idSet.size, allDefs.length, 'All pet ids are unique');

// Coverage: key pets exist
const required = [80001, 80021, 80013, 80025, 80102, 80103, 80107, 80202, 82001];
for (const id of required) {
  assert(pets.getPetDef(id) != null, `Pet #${id} is registered`);
}

// Categories accounted for
const categories = new Set(allDefs.map(d => d.category));
assert(categories.has('boss'),    'Has boss pets');
assert(categories.has('skill'),   'Has skill pets');
assert(categories.has('quest'),   'Has quest-locked pets');
assert(categories.has('minigame'),'Has minigame pets');
assert(categories.has('clue'),    'Has clue pets');
assert(categories.has('random'),  'Has random-event pets');

// At least one combat-eligible pet, capped at 1% damageShare.
const combatEligible = allDefs.filter(d => d.combatEligible);
assert(combatEligible.length >= 1, 'At least one combat-eligible pet defined');
assert(combatEligible.every(d => d.damageShare <= 0.01), 'No combat pet exceeds 1% damage contribution');

// ══════════════════════════════════════════════════════════════════════════════
// 2. unlockPet
// ══════════════════════════════════════════════════════════════════════════════
section('unlockPet');

const p1 = makePlayer('u1');
const r1 = pets.unlockPet(p1, 80021); // Hellpuppy
assert(r1.ok && r1.added, 'First-time unlock adds pet');
assert(pets.hasPet(p1, 80021), 'hasPet true after unlock');

const r1b = pets.unlockPet(p1, 80021);
assert(r1b.ok && !r1b.added && r1b.reason === 'already_owned', 'Duplicate unlock returns already_owned');

const r1c = pets.unlockPet(p1, 99999);
assert(!r1c.ok && r1c.reason === 'unknown_pet', 'Unknown pet rejected');

// Event fires with player/petId/def
let unlockEvt = null;
events.on('pet_unlocked', 'test-unlock', (data) => { unlockEvt = data; });
pets.unlockPet(p1, 80013); // Wyrm pet
assert(unlockEvt && unlockEvt.petId === 80013 && unlockEvt.player === p1, 'pet_unlocked event fires with correct data');

// ══════════════════════════════════════════════════════════════════════════════
// 3. getPets
// ══════════════════════════════════════════════════════════════════════════════
section('getPets summary');

const list = pets.getPets(p1);
eq(list.length, 2, 'getPets returns 2 pets after two unlocks');
const hellpup = list.find(x => x.id === 80021);
assert(hellpup && hellpup.name === 'Hellpuppy', 'Hellpuppy summary has correct name');
assert(hellpup.combatEligible === true, 'Hellpuppy marked combatEligible in summary');

// ══════════════════════════════════════════════════════════════════════════════
// 4. summon / dismiss / currentPet
// ══════════════════════════════════════════════════════════════════════════════
section('summon / dismiss / currentPet');

const sres = pets.summonPet(p1, 80013);
assert(sres.ok, 'summonPet succeeds');
const cp = pets.currentPet(p1);
assert(cp && cp.petId === 80013, 'currentPet returns the active pet');

// Follower is behind the player
assert(cp.follower && (cp.follower.x === p1.x) && (cp.follower.y === p1.y + 1),
  'Follower is 1 tile behind a south-facing player');

// Summoning another swaps active
const swap = pets.summonPet(p1, 80021);
assert(swap.ok, 'summonPet swap succeeds');
const cp2 = pets.currentPet(p1);
eq(cp2.petId, 80021, 'Active pet switched to Hellpuppy');

const dm = pets.dismissPet(p1);
assert(dm.ok, 'dismissPet succeeds');
eq(pets.currentPet(p1), null, 'currentPet null after dismiss');

const dm2 = pets.dismissPet(p1);
assert(!dm2.ok && dm2.reason === 'no_active', 'dismiss with no active returns no_active');

const sUn = pets.summonPet(p1, 88888);
assert(!sUn.ok && sUn.reason === 'unknown_pet', 'Unknown pet summon rejected');

// ══════════════════════════════════════════════════════════════════════════════
// 5. Feed + affinity + level up + shiny
// ══════════════════════════════════════════════════════════════════════════════
section('feedPet / affinity / level');

const p2 = makePlayer('u2');
pets.unlockPet(p2, 80021); // Hellpuppy — foods: big_bones(106), beef(2142)
pets.summonPet(p2, 80021);

giveItem(p2, 106, 5); // big bones
const f1 = pets.feedPet(p2, 80021, 106);
assert(f1.ok && f1.whitelisted, 'Whitelisted food is flagged');
eq(f1.amount, 25, 'Whitelisted feed grants +25 affinity');

// Non-whitelisted food
giveItem(p2, 999, 2);
const f2 = pets.feedPet(p2, 80021, 999);
assert(f2.ok && !f2.whitelisted, 'Non-whitelisted food still accepted');
eq(f2.amount, 8, 'Non-whitelisted feed grants +8 affinity');

// Try feeding without item in inventory
const f3 = pets.feedPet(p2, 80021, 7777);
assert(!f3.ok && f3.reason === 'food_not_in_inventory', 'Feeding without item returns food_not_in_inventory');

// Force affinity up to trigger level up and shiny
const before = pets.getAffinity(p2, 80021);
assert(before.level >= 1, 'Initial affinity level is >= 1');
pets.bumpAffinity(p2, 80021, 1000);
const after = pets.getAffinity(p2, 80021);
eq(after.level, 10, 'Full affinity reaches level 10');
assert(after.shiny === true, 'Shiny unlocks at level 10');

// ══════════════════════════════════════════════════════════════════════════════
// 6. Combat hooks
// ══════════════════════════════════════════════════════════════════════════════
section('Combat hooks');

// Passive pet suspends follower during combat
const p3 = makePlayer('u3');
pets.unlockPet(p3, 80013); // Passive wyrm
pets.summonPet(p3, 80013);
assert(pets.currentPet(p3).follower, 'Follower present before combat');
pets.onCombatStart(p3);
assert(pets.currentPet(p3).follower == null, 'Follower suspended for passive pet in combat');

pets.onCombatEnd(p3);
assert(pets.currentPet(p3).follower != null, 'Follower re-summoned after combat');

// Combat-eligible pet stays active
const p4 = makePlayer('u4');
pets.unlockPet(p4, 80021); // Hellpuppy — combat-eligible
pets.summonPet(p4, 80021);
pets.onCombatStart(p4);
assert(pets.currentPet(p4).follower != null, 'Combat-eligible pet stays during combat');

// Passive pet cannot be summoned mid-combat
const p5 = makePlayer('u5');
pets.unlockPet(p5, 80013); // Passive
p5.combatTarget = { name: 'goblin' };
const s5 = pets.summonPet(p5, 80013);
assert(!s5.ok && s5.reason === 'in_combat', 'Passive pet summon rejected mid-combat');

// Damage bonus cap
pets.unlockPet(p4, 80021);
const bonus = pets.computePetDamageBonus(p4, 100);
assert(bonus <= 1, 'Pet damage bonus capped at <=1% of 100 damage (got ' + bonus + ')');

// ══════════════════════════════════════════════════════════════════════════════
// 7. Boss drop roll
// ══════════════════════════════════════════════════════════════════════════════
section('onLootDrop (pinned RNG)');

const origRandom = Math.random;
// Force all rolls to succeed
Math.random = () => 0;
const p6 = makePlayer('u6');
const drops = [];
const rolled = pets.onLootDrop(p6, 'forgefather_duran', drops);
Math.random = origRandom;
assert(rolled.awardedPets.includes(80001), 'Forced-roll awards Baby Duran');
assert(pets.hasPet(p6, 80001), 'Baby Duran unlocked on player');
const dropEntry = drops.find(d => d.id === 80001);
assert(dropEntry && dropEntry.meta && dropEntry.meta.pet === true, 'Drop entry tagged with meta.pet');

// Never re-awards the same pet
Math.random = () => 0;
const again = pets.onLootDrop(p6, 'forgefather_duran', []);
Math.random = origRandom;
assert(again.awardedPets.length === 0, 'No pet re-awarded on subsequent rolls');

// Miss roll — no award
Math.random = () => 0.999999;
const p6b = makePlayer('u6b');
const missed = pets.onLootDrop(p6b, 'forgefather_duran', []);
Math.random = origRandom;
eq(missed.awardedPets.length, 0, 'High RNG roll does not award pet');

// ══════════════════════════════════════════════════════════════════════════════
// 8. Skill drop roll
// ══════════════════════════════════════════════════════════════════════════════
section('onSkillAction (pinned RNG)');

Math.random = () => 0;
const p7 = makePlayer('u7');
const skillRes = pets.onSkillAction(p7, 'mining', {});
Math.random = origRandom;
assert(skillRes.awardedPets.includes(80101), 'Mining action awards Rock Golem pet');
assert(pets.hasPet(p7, 80101), 'Rock Golem unlocked on player');

// ══════════════════════════════════════════════════════════════════════════════
// 9. Hardcore death wipe
// ══════════════════════════════════════════════════════════════════════════════
section('onHardcoreDeath');

const p8 = makePlayer('u8');
pets.unlockPet(p8, 80001); // not insured
pets.unlockPet(p8, 80021); // will be insured
pets.setInsured(p8, 80021, true);
pets.bumpAffinity(p8, 80021, 500);
const death = pets.onHardcoreDeath(p8);
assert(death.lost.includes(80001), 'Uninsured pet lost on hardcore death');
assert(death.kept.includes(80021), 'Insured pet kept on hardcore death');
assert(!pets.hasPet(p8, 80001), 'hasPet=false for wiped pet');
const aff = pets.getAffinity(p8, 80021);
assert(aff.value <= 250, 'Insured pet affinity halved (from 500 to <=250)');

// ══════════════════════════════════════════════════════════════════════════════
// 10. Commands
// ══════════════════════════════════════════════════════════════════════════════
section('Command integration');

const p9 = makePlayer('u9');
pets.unlockPet(p9, 80001); // Baby Duran
pets.unlockPet(p9, 80013); // Wyrm

const out1 = commands.execute(p9, 'pet list');
assert(typeof out1 === 'string' && out1.includes('Baby Duran'), '/pet list shows Baby Duran');

const out2 = commands.execute(p9, 'pet summon baby duran');
assert(out2.toLowerCase().includes('baby duran') || out2.includes('appears'), '/pet summon <name> works');
assert(pets.currentPet(p9) && pets.currentPet(p9).petId === 80001, 'Active pet is Baby Duran');

const out3 = commands.execute(p9, 'pet dismiss');
assert(out3.toLowerCase().includes('vanish'), '/pet dismiss prints vanish message');
assert(pets.currentPet(p9) == null, 'No active pet after dismiss command');

const out4 = commands.execute(p9, 'pet rename 80013 Fluffy');
assert(out4.includes('Fluffy'), '/pet rename sets nickname');
const list2 = pets.getPets(p9);
const fluffy = list2.find(x => x.id === 80013);
eq(fluffy.nickname, 'Fluffy', 'Nickname stored on player state');

const out5 = commands.execute(p9, 'pet insured 80001 on');
assert(out5.includes('ON'), '/pet insured on toggles insurance');

const out6 = commands.execute(p9, 'pet affinity');
assert(out6.toLowerCase().includes('baby duran') || out6.toLowerCase().includes('wyrm'), '/pet affinity lists pets');

// ══════════════════════════════════════════════════════════════════════════════
// 11. Tick — follower drift
// ══════════════════════════════════════════════════════════════════════════════
section('tick follower drift');

const pT = makePlayer('tick');
pets.unlockPet(pT, 80013);
pets.summonPet(pT, 80013);
const cpT = pets.currentPet(pT);
const followerY0 = cpT.follower.y;
pT.x = 200; pT.y = 200;
pets.tick(pT, 100);
const cpT2 = pets.currentPet(pT);
assert(cpT2.follower.x === 200 && cpT2.follower.y === 201,
  'Follower relocates when the player teleports away');

// Affinity drip on tick at multiple of 100
const affPre = pets.getAffinity(pT, 80013).value;
pets.tick(pT, 200);
const affPost = pets.getAffinity(pT, 80013).value;
assert(affPost >= affPre, 'Affinity does not regress while summoned');

// ══════════════════════════════════════════════════════════════════════════════
// Summary
// ══════════════════════════════════════════════════════════════════════════════
console.log('\n══════════════════════════════════════════════════════════════════════════════');
console.log('Tests passed: ' + passed);
console.log('Tests failed: ' + failed);
console.log('Registered pets: ' + pets.listPetDefs().length);
if (failed > 0) {
  console.log('Failures:');
  for (const f of failures) console.log('  - ' + f);
  process.exit(1);
}
console.log('All tests passed.');
process.exit(0);
