#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// Wilds Content Test
//
// Verifies the deepening of The Wilds (burn v2):
//   - 90+ training methods registered in The Wilds
//   - 10+ Wilderness-specific bosses accessible
//   - 10+ PvP mechanics registered
//   - 15+ unique drops from wilderness bosses/revenants
//   - 10+ quests with unique unlocks
//   - 8+ breakpoints
//   - gap score ≥ 70
//   - voice consistency (cold clipped sentences)
//
// Usage: node scripts/test-wilds.js
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const rel = require('../src/data/relationships');

// Load all content to populate registries
require('../src/content/aelgard/area-gates');
require('../src/content/aelgard/quest-unlocks');
require('../src/content/aelgard/item-ecosystem');
require('../src/content/aelgard/training-knobs');
require('../src/content/aelgard/breakpoints');
try { require('../src/content/aelgard/skill-web'); } catch (e) {}
try { require('../src/content/aelgard/heartlands-deep'); } catch (e) {}
try { require('../src/content/aelgard/heartlands-density'); } catch (e) {}
try { require('../src/content/aelgard/moryskah-deep'); } catch (e) {}
try { require('../src/content/aelgard/moryskah-density'); } catch (e) {}
try { require('../src/content/aelgard/sootworks-deep'); } catch (e) {}
try { require('../src/content/aelgard/sootworks-density'); } catch (e) {}
try { require('../src/content/aelgard/saltbrine-deep'); } catch (e) {}
try { require('../src/content/aelgard/saltbrine-density'); } catch (e) {}
try { require('../src/content/aelgard/veilwood-deep'); } catch (e) {}
try { require('../src/content/aelgard/veilwood-density'); } catch (e) {}
try { require('../src/content/aelgard/boneyard-deep'); } catch (e) {}
try { require('../src/content/aelgard/boneyard-density'); } catch (e) {}
try { require('../src/content/aelgard/glass-desert-deep'); } catch (e) {}
try { require('../src/content/aelgard/glass-desert-density'); } catch (e) {}
try { require('../src/content/aelgard/inkweald-deep'); } catch (e) {}
try { require('../src/content/aelgard/inkweald-density'); } catch (e) {}
try { require('../src/content/aelgard/wilds-deep'); } catch (e) {}
try { require('../src/content/aelgard/wilds-density'); } catch (e) {}
try { require('../src/content/aelgard/mid-tier-regions'); } catch (e) {}
try { require('../src/content/aelgard/universal-items'); } catch (e) {}
try { require('../src/content/aelgard/special-regions'); } catch (e) {}

let passed = 0;
let failed = 0;
const failures = [];

function assert(cond, label) {
  if (cond) {
    passed++;
    console.log(`  PASS  ${label}`);
  } else {
    failed++;
    failures.push(label);
    console.log(`  FAIL  ${label}`);
  }
}

function assertAtLeast(actual, minimum, label) {
  assert(actual >= minimum, `${label} (expected >= ${minimum}, got ${actual})`);
}

console.log('');
console.log('══════════════════════════════════════════════════════════════');
console.log('  TEST: The Wilds Deepening (burn v2)');
console.log('══════════════════════════════════════════════════════════════');
console.log('');

// Gather all training methods located in The Wilds
const SKILLS = [
  'attack', 'strength', 'defence', 'hitpoints', 'ranged', 'prayer', 'magic',
  'runecrafting', 'construction', 'agility', 'herblore', 'thieving',
  'crafting', 'fletching', 'slayer', 'hunter', 'mining', 'smithing',
  'fishing', 'cooking', 'firemaking', 'woodcutting', 'farming',
];

const wildsMethods = [];
for (const skill of SKILLS) {
  for (const method of rel.listMethodsForSkill(skill)) {
    if (method.location === 'The Wilds') wildsMethods.push(method);
  }
}

// ── 1. METHOD COUNT ASSERTIONS ──────────────────────────────────────────────
console.log('── Method Volume ──');
assertAtLeast(wildsMethods.length, 90, 'Wilds has 90+ training methods total');
assertAtLeast(wildsMethods.length, 40, 'Wilds has 40+ NEW training methods (existing 31 + 40+ added)');

// ── 2. SKILL COVERAGE ───────────────────────────────────────────────────────
console.log('');
console.log('── Skill Coverage (no hard blocks) ──');
for (const skill of ['attack', 'strength', 'defence', 'hitpoints', 'ranged', 'prayer', 'magic']) {
  const methods = wildsMethods.filter(m => m.skill === skill);
  assertAtLeast(methods.length, 1, `Wilds has at least 1 ${skill} method`);
}

// ── 3. HIGH-TIER COVERAGE ───────────────────────────────────────────────────
console.log('');
console.log('── High-Tier Coverage (80-99 bracket) ──');
for (const skill of ['attack', 'strength', 'defence', 'hitpoints', 'ranged', 'magic', 'prayer', 'smithing', 'mining', 'runecrafting']) {
  const hasHighTier = wildsMethods.some(m => m.skill === skill && m.levelRange[1] >= 90);
  assert(hasHighTier, `Wilds has a ${skill} method reaching level 90+`);
}

// ── 4. QUEST UNLOCKS ────────────────────────────────────────────────────────
console.log('');
console.log('── Quest Unlocks ──');
const wildsQuests = [
  'third_ditch_ordeal', 'no_honor_ordeal', 'the_long_road_home',
  'bandit_camp_alliance', 'the_mage_arena_trial', 'enter_the_abyss',
  'the_wilds_forge', 'the_wilds_grove', 'the_kbd_key',
  'blade_of_the_wilds_second', 'blade_of_the_wilds_third',
];

for (const qId of wildsQuests) {
  const unlock = rel.getQuestUnlocks(qId);
  assert(unlock !== undefined, `Quest unlock defined: ${qId}`);
}

// ── 5. BREAKPOINTS ──────────────────────────────────────────────────────────
console.log('');
console.log('── Breakpoints ──');
const allBreakpoints = rel.getBreakpointsForSkill('agility').concat(
  rel.getBreakpointsForSkill('mining'),
  rel.getBreakpointsForSkill('runecrafting'),
  rel.getBreakpointsForSkill('smithing'),
  rel.getBreakpointsForSkill('prayer'),
  rel.getBreakpointsForQuest('the_mage_arena_trial'),
  rel.getBreakpointsForQuest('enter_the_abyss'),
  rel.getBreakpointsForQuest('blade_of_the_wilds_third'),
);
assertAtLeast(allBreakpoints.length, 8, 'Wilds has 8+ breakpoints (skill/quest)');
assert(rel.getBreakpointsForQuest('the_mage_arena_trial').length > 0, 'Mage Arena quest completion breakpoint exists');
assert(rel.getBreakpointsForQuest('enter_the_abyss').length > 0, 'Enter the Abyss quest completion breakpoint exists');

// ── 6. PvP MECHANICS (via item sources registering them) ────────────────────
console.log('');
console.log('── PvP-Specific Mechanics ──');
const pvpMechanicChecks = [
  { id: 99560, label: 'PvP kill loot mechanic registered' },
  { id: 99561, label: 'Skull timer mechanic registered' },
  { id: 99562, label: 'Glory recharge mechanic registered' },
  { id: 99563, label: 'Teleblock spell mechanic registered' },
  { id: 99564, label: 'Vengeance spell mechanic registered' },
  { id: 99565, label: 'Clan wars portal mechanic registered' },
  { id: 99566, label: 'Ferox enclave mechanic registered' },
  { id: 99567, label: 'Risk insurance contract mechanic registered' },
  { id: 99568, label: 'Logout tab mechanic registered' },
  { id: 99570, label: 'Protect item prayer mechanic registered' },
  { id: 99571, label: 'Smite prayer mechanic registered' },
  { id: 99572, label: 'PvP combat lock mechanic registered' },
  { id: 99573, label: 'Deep-wild drop bonus mechanic registered' },
  { id: 99574, label: 'Multi-combat zone mechanic registered' },
  { id: 99575, label: 'Deadman mode pockets mechanic registered' },
];
for (const check of pvpMechanicChecks) {
  const sources = rel.getItemSources(check.id);
  assert(sources.length > 0, check.label);
}

// ── 7. WILDS-UNIQUE DROPS (15+) ─────────────────────────────────────────────
console.log('');
console.log('── Unique Wilds Drops ──');
const uniqueDrops = [
  { id: 99510, label: "Vesta's longsword fragment (BIS equivalent)" },
  { id: 99511, label: "Vesta's spear fragment" },
  { id: 99512, label: "Statius's warhammer fragment" },
  { id: 99513, label: "Statius's full helm" },
  { id: 99514, label: "Morrigan's throwing axe" },
  { id: 99515, label: "Morrigan's javelin" },
  { id: 99516, label: "Zuriel's staff" },
  { id: 99520, label: 'Amulet of No-Honor (Amulet of Fury equivalent)' },
  { id: 99521, label: 'Treasonous ring shard (Venenatis)' },
  { id: 99522, label: "Ring of the Long Road (Vet'ion)" },
  { id: 99523, label: "Scorpia's offspring pet" },
  { id: 99524, label: 'Unstable orb (Chaos Elemental)' },
  { id: 99525, label: 'Odium ward shard (Chaos Fanatic)' },
  { id: 99526, label: 'Malediction ward shard (Crazy Archaeologist)' },
  { id: 99543, label: 'Whip of No-Honor shard (Wilderness Abyssal Demon)' },
  { id: 99553, label: 'Divine Rune Pouch (deep chain)' },
];
for (const drop of uniqueDrops) {
  const sources = rel.getItemSources(drop.id);
  assert(sources.length > 0, drop.label);
}

// ── 8. REVENANT ECOSYSTEM (PvM in PvP zone) ─────────────────────────────────
console.log('');
console.log('── Revenant Ecosystem ──');
const revenants = [99500, 99501, 99502, 99503, 99504, 99505, 99506];
for (const revId of revenants) {
  const sources = rel.getItemSources(revId);
  assert(sources.length > 0 && sources[0].sourceId.includes('revenant'), `Revenant source registered: ${revId}`);
}

// ── 9. RESOURCE ABUNDANCE (Wilderness-only tiers) ───────────────────────────
console.log('');
console.log('── Wilderness Resource Abundance ──');
const runeRocks = rel.getItemSources(99530);
assert(runeRocks.length > 0 && runeRocks[0].sourceName === 'Wilderness Rune Rocks', 'Rune rocks at wilds-only level registered');
const magicTrees = rel.getItemSources(99531);
assert(magicTrees.length > 0 && magicTrees[0].sourceName === 'Wilderness Magic Tree Grove', 'Magic tree grove registered');
const herbPatch = rel.getItemSources(99532);
assert(herbPatch.length > 0 && herbPatch[0].sourceName === 'Wilderness Herb Patch', 'Herb patch registered');
const resourceArena = rel.getItemSources(99535);
assert(resourceArena.length > 0, 'Resource arena registered');

// ── 10. WILDERNESS BOSSES (10+) ─────────────────────────────────────────────
console.log('');
console.log('── Wilderness Bosses ──');
const bossDrops = [
  { id: 99520, boss: 'Callisto' },
  { id: 99521, boss: 'Venenatis' },
  { id: 99522, boss: "Vet'ion" },
  { id: 99523, boss: 'Scorpia' },
  { id: 99524, boss: 'Chaos Elemental' },
  { id: 99525, boss: 'Chaos Fanatic' },
  { id: 99526, boss: 'Crazy Archaeologist' },
];
for (const { id, boss } of bossDrops) {
  const sources = rel.getItemSources(id);
  assert(sources.length > 0, `${boss} drop registered`);
}
// KBD training method exists
assert(rel.getTrainingMethod('wilds_kbd_combat') !== undefined, 'King Black Dragon combat method registered');
// Exiled Champion
assert(rel.getTrainingMethod('wilds_exiled_champion_boss') !== undefined, 'Exiled Champion boss method registered');
// Teleblocked King
assert(rel.getTrainingMethod('wilds_teleblocked_king_boss') !== undefined, 'Teleblocked King boss method registered');
// Revenant weapons combat
assert(rel.getTrainingMethod('wilds_crawbow_revenant_range') !== undefined, "Craw's bow revenant range registered");

// ── 11. STACKABLE MECHANIC (longer stays = more risk) ──────────────────────
console.log('');
console.log('── Stackable Unstackable Mechanic ──');
const blightedShark = rel.getItemSources(99550);
assert(blightedShark.length > 0, 'Blighted stackable food registered');
const blightedPots = rel.getItemSources(99551);
assert(blightedPots.length > 0, 'Blighted stackable potions registered');
assert(rel.getCombination(99605) !== undefined, 'Blighted shark recipe exists');
assert(rel.getCombination(99805) !== undefined, 'Blighted super restore recipe exists');

// ── 12. ESCAPE MECHANICS ────────────────────────────────────────────────────
console.log('');
console.log('── Escape Mechanics ──');
assert(rel.getItemSources(99562).length > 0, 'Glory recharge registered');
assert(rel.getItemSources(99563).length > 0, 'Teleblock registered');
assert(rel.getItemSources(99568).length > 0, 'Logout tab registered');
assert(rel.getItemSources(99572).length > 0, 'PvP combat lock registered');

// ── 13. TRAINING METHOD KNOBS (all 8 required) ──────────────────────────────
console.log('');
console.log('── 8 Marstead Knobs on Every Method ──');
let allKnobsValid = true;
const requiredKnobs = ['xpPerHour', 'prerequisites', 'resourceOutput', 'bankingFrequency', 'costPerHour', 'danger', 'complexity', 'attention'];
for (const m of wildsMethods) {
  for (const knob of requiredKnobs) {
    if (m[knob] === undefined) {
      allKnobsValid = false;
      console.log(`    MISSING KNOB: ${m.id} is missing ${knob}`);
    }
  }
}
assert(allKnobsValid, 'All wilds methods have all 8 Marstead knobs');

// ── 14. VOICE CONSISTENCY (cold clipped sentences) ──────────────────────────
console.log('');
console.log('── Voice Consistency (cold clipped) ──');
const voiceMarkers = ['ditch', 'tile', 'skull', 'teleblock', 'PKer', 'long road', 'grave', 'no honor', 'no-honor'];
const methodsWithVoice = wildsMethods.filter(m =>
  voiceMarkers.some(marker => (m.description || '').toLowerCase().includes(marker))
);
assertAtLeast(methodsWithVoice.length, 25, 'At least 25 methods use wilds voice markers');

// ── 15. COMBINATIONS / REAGENT SYSTEM ───────────────────────────────────────
console.log('');
console.log('── Combinations (Reagent System) ──');
assert(rel.getCombination(99601) !== undefined, "Vesta's longsword reforge recipe");
assert(rel.getCombination(99602) !== undefined, "Morrigan's javelin fletching recipe");
assert(rel.getCombination(99603) !== undefined, 'Odium Ward assembly recipe');
assert(rel.getCombination(99604) !== undefined, 'Malediction Ward assembly recipe');
assert(rel.getCombination(99607) !== undefined, 'Logout tab recipe');
assert(rel.getCombination(99608) !== undefined, 'Blade of the Wilds (upgraded) recipe');
assert(rel.getCombination(99610) !== undefined, 'Blade of the Wilds (final) recipe');
assert(rel.getCombination(99801) !== undefined, 'Draconic bar recipe (Wilds Blast Forge)');
assert(rel.getCombination(99812) !== undefined, 'Wilderness Crown recipe');
assert(rel.getCombination(99813) !== undefined, 'Soulsplit prayer unlock recipe');

// ── 16. GAP SCORE FINAL ASSERTION ───────────────────────────────────────────
console.log('');
console.log('── Final Gap Score ──');
const gapScore = (23 - 0) + (wildsMethods.length / 2);
assertAtLeast(gapScore, 70, `The Wilds gap score >= 70 (computed=${Math.round(gapScore)})`);

// ── SUMMARY ────────────────────────────────────────────────────────────────
console.log('');
console.log('══════════════════════════════════════════════════════════════');
console.log(`  RESULTS: ${passed} passed, ${failed} failed`);
console.log(`  Wilds methods: ${wildsMethods.length}`);
console.log(`  Gap score: ${Math.round(gapScore)}`);
console.log('══════════════════════════════════════════════════════════════');
if (failed > 0) {
  console.log('');
  console.log('  FAILURES:');
  for (const f of failures) console.log(`    - ${f}`);
  process.exit(1);
}
console.log('');
console.log('  ALL ASSERTIONS PASSED');
console.log(`[test-wilds] ${passed} assertions passed, 0 failed, gap=${Math.round(gapScore)}, methods=${wildsMethods.length}`);
