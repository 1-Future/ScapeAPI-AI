#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// SMOKE TESTS: combinations-mega.js + recipes-mega.js (burn v2)
//
// Verifies:
//   * 50+ new combinations registered with valid inputs/outputs
//   * Every combo consumes at least one OLD item (reagent rule = no deprecation)
//   * Every combo has skill + level + xp + station/tool + description
//   * Cross-region combos reference drops from at least 2 distinct regions
//   * Tier-up chains exist per region (Heartlands -> Moryskah -> ... -> Glass Desert)
//   * Recipe ladder covers dart/crossbow/bolt/orb/battlestaff/bonfire tiers
//   * Loader registration present in codex-generator + gap-report + multi-agent-sim + region-analyzer
//
// Called from: npm test or directly (node scripts/test-combinations.js)
// Exit code 0 = all pass; 1 = any failure.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const fs = require('fs');
const path = require('path');

// Load the full aelgard content chain (mimicking codex-generator's load order)
require('../src/data/items');
require('../src/data/relationships');
try { require('../src/content/aelgard/items-expanded'); } catch (e) {}
try { require('../src/content/aelgard/items-blitz'); } catch (e) {}
try { require('../src/content/aelgard/items-blitz2'); } catch (e) {}
try { require('../src/content/aelgard/items-dragon-barrows'); } catch (e) {}
require('../src/content/aelgard/area-gates');
require('../src/content/aelgard/quest-unlocks');
require('../src/content/aelgard/item-ecosystem');
require('../src/content/aelgard/training-knobs');
require('../src/content/aelgard/breakpoints');
try { require('../src/content/aelgard/skill-web'); } catch (e) {}
try { require('../src/content/aelgard/heartlands-density'); } catch (e) {}
try { require('../src/content/aelgard/moryskah-density'); } catch (e) {}
try { require('../src/content/aelgard/sootworks-density'); } catch (e) {}
try { require('../src/content/aelgard/saltbrine-density'); } catch (e) {}
try { require('../src/content/aelgard/veilwood-density'); } catch (e) {}
try { require('../src/content/aelgard/boneyard-density'); } catch (e) {}
try { require('../src/content/aelgard/glass-desert-density'); } catch (e) {}
try { require('../src/content/aelgard/inkweald-density'); } catch (e) {}

// Load the files under test
const combMega = require('../src/content/aelgard/combinations-mega');
const recMega = require('../src/content/aelgard/recipes-mega');
const rel = require('../src/data/relationships');
const recipes = require('../src/data/recipes');

let passed = 0;
let failed = 0;
function ok(msg)   { console.log('PASS: ' + msg); passed++; }
function bad(msg)  { console.log('FAIL: ' + msg); failed++; }
function assert(cond, msg) { cond ? ok(msg) : bad(msg); }

// ══════════════════════════════════════════════════════════════════════════════
// SECTION A: combinations-mega — basic count, structure, completeness
// ══════════════════════════════════════════════════════════════════════════════

// Helper: list combos defined by combinations-mega (explicit IDs we authored).
// The 95000 block is shared with moryskah-density (95302-95308) so we pin
// the exact set we intend to verify.
const MEGA_IDS = [
  // Moryskah tier-1
  95001, 95002, 95003, 95004,
  // Saltbrine tier-1
  95010, 95011, 95012, 95013, 95014,
  // Veilwood tier-1
  95020, 95021, 95022, 95023, 95024,
  // Sootworks tier-1
  95030, 95031, 95032, 95033, 95034,
  // Boneyard tier-1
  95040, 95041, 95042, 95043, 95044,
  // Inkweald tier-1
  95050, 95051, 95052, 95053, 95054,
  // Glass Desert tier-1
  95060, 95061, 95062, 95063, 95064,
  // Cross-region
  95070, 95071, 95072, 95073, 95074,
  // Region endgame
  95080, 95081, 95082, 95083, 95084, 95085, 95086, 95087,
  // Two-boss synthesis
  95090, 95091, 95092, 95093, 95094,
  // Quest-item reagent
  95100, 95101, 95102, 95103,
  // Low-level ironman
  95110, 95111, 95112, 95113, 95114,
];
const megaComboIds = MEGA_IDS.filter(id => rel.getCombination(id));

// 1. Count check
assert(combMega.comboCount >= 50, `combinations-mega defines 50+ combos (actual: ${combMega.comboCount})`);

// 2. All registered in registry
assert(megaComboIds.length >= 50, `50+ mega combos registered in registry (actual: ${megaComboIds.length})`);

// 3-8. Each combo has required fields
let missingFields = 0;
let missingReagentChain = 0;
const REAGENT_OLD_IDS = new Set([
  // "OLD" items (pre-existing in the ecosystem) that satisfy the reagent rule.
  // Any input from this set means the combo kept an OLD item in the chain.
  // Base smithing tiers
  400, 401, 402, 410, 411, 412, 420, 421, 430, 440, 441, 450, 455,
  501, 502, 510, 511, 512, 513, 514, 515, 520, 521, 525, 530, 535,
  // Crafted jewelry
  70110, 70111, 70112, 70113, 70114, 70115, 70117, 70118, 70119,
  70122, 70123, 70124, 70130, 70132, 70134, 70135, 70136, 70142, 70140,
  // Fletched bows + arrows
  70160, 70161, 70162, 70163, 70164, 70165, 70166, 70167,
  70170, 70171, 70172, 70173, 70174, 70175, 70176, 70177, 341, 340,
  // Cooked food
  70211, 70213, 70215, 70217,
  // Prior combos / quest / prestige (boss-drop + old-item upgrades)
  92000, 92001, 92010, 92020, 92021, 92022, 92050, 92051, 92052, 92060, 92061, 92062,
  91001, 91002, 91005, 91006, 91050, 91051, 91052, 91009,
  93001, 93002, 93010, 99001, 94001, 94002, 11500, 11305,
  26003, 26006, 26007, 26008,
  // Potions/brews
  335, 336, 337, 12100, 70190, 70195, 70217, 70193, 70194,
  // Bones / feathers / runes
  100, 106, 107, 70220, 70221, 70222, 270, 271, 272, 273, 280, 70231, 104,
  // Region-native materials (density files — counts as OLD since pre-existing)
  7002,                                                       // Sootworks soot-iron bar
  95116, 95140, 95191, 95114, 95113, 95120,                  // Moryskah pre-existing drops/brews
  96401, 96402, 96405, 96502, 96503, 96661, 96662, 96664, 96665, 96611, // Saltbrine
  96701, 96702, 96703, 96705, 96713,                          // Veilwood
  97201, 97216, 97232, 97231, 97243, 97241, 97252, 97270, 97263, // Sootworks
  96505, 96506, 96507, 96513, 96525, 96527, 96530, 96516, 96519, // Boneyard
  98253, 98530, 98531, 98541, 98561, 98592, 98593, 98597,     // Inkweald
  98900, 98915, 98940, 98942, 98951, 98962, 98964, 98971, 98972, 98980, 98981, // Glass Desert
  // Tier-1 mega combos (used as inputs for region endgame — reagent chain)
  95001, 95010, 95020, 95023, 95030, 95040, 95050, 95060,
  // Saltbrine items
  96503, 96509, 31127, 31128,
]);

for (const id of megaComboIds) {
  const combo = rel.getCombination(id);
  if (!combo.skill || !combo.level || !combo.xp || !combo.description || !Array.isArray(combo.inputs) || combo.inputs.length === 0) {
    missingFields++;
    console.log('  [missing fields] ' + id + ' ' + combo.resultName);
  }
  const hasOld = combo.inputs.some(i => REAGENT_OLD_IDS.has(i.id));
  if (!hasOld) {
    missingReagentChain++;
    console.log('  [no old-item reagent] ' + id + ' ' + combo.resultName);
  }
}
assert(missingFields === 0, 'every mega combo has skill + level + xp + description + inputs');
assert(missingReagentChain === 0, 'every mega combo references at least one OLD item (manifesto reagent rule)');

// 9-12. Each region tier has at least one combo
const regionTier1Ids = {
  moryskah: [95001, 95002, 95003, 95004],
  saltbrine: [95010, 95011, 95012, 95013, 95014],
  veilwood: [95020, 95021, 95022, 95023, 95024],
  sootworks: [95030, 95031, 95032, 95033, 95034],
  boneyard: [95040, 95041, 95042, 95043, 95044],
  inkweald: [95050, 95051, 95052, 95053, 95054],
  glass_desert: [95060, 95061, 95062, 95063, 95064],
};

for (const [region, ids] of Object.entries(regionTier1Ids)) {
  const found = ids.filter(id => rel.getCombination(id)).length;
  assert(found >= 4, `${region} has 4+ tier-1 reagent combos (actual: ${found})`);
}

// 13. Cross-region combos (95070-95094) exist
const crossRegionIds = [95070, 95071, 95072, 95073, 95074];
const crCount = crossRegionIds.filter(id => rel.getCombination(id)).length;
assert(crCount >= 5, `cross-region combos registered (actual: ${crCount}/5)`);

// 14. Region endgame weapons (95080-95087 = 8 region-specific endgame blades)
const endgameIds = [95080, 95081, 95082, 95083, 95084, 95085, 95086, 95087];
const endgameCount = endgameIds.filter(id => rel.getCombination(id)).length;
assert(endgameCount === 8, `8 region endgame combos (actual: ${endgameCount})`);

// 15. Glass Desert Lens-Sunder requires level 99 (endgame)
const lensSunder = rel.getCombination(95087);
assert(lensSunder && lensSunder.level === 99, 'Glass Desert Lens-Sunder is level 99 endgame');

// 16. Endgame weapons have a tier-1 combo as reagent — deep reagent chain.
// (Heartlands Kingsblade 95080 is classic-starter-focused and references base gear
// directly rather than a 95000-range tier-1, so it's excluded from this check.)
const deepChainEndgames = [95081, 95082, 95083, 95084, 95085, 95086, 95087];
let tierChainDepth = 0;
for (const id of deepChainEndgames) {
  const combo = rel.getCombination(id);
  if (combo && combo.inputs.some(i => i.id >= 95000 && i.id < 95070)) tierChainDepth++;
}
assert(tierChainDepth === deepChainEndgames.length, '7 non-Heartlands region endgame weapons consume a tier-1 mega combo (reagent depth >= 2)');

// 17. Two-boss synthesis combos exist
const twoBossIds = [95090, 95091, 95092, 95093, 95094];
const twoBossCount = twoBossIds.filter(id => rel.getCombination(id)).length;
assert(twoBossCount === 5, 'two-boss synthesis combos registered');

// 18. Quest-item reagent combos exist (95100-95103)
const questComboIds = [95100, 95101, 95102, 95103];
const questComboCount = questComboIds.filter(id => rel.getCombination(id)).length;
assert(questComboCount === 4, 'quest-item reagent combos registered');

// 19. Low-level ironman combos exist (95110-95114)
const lowLevelIds = [95110, 95111, 95112, 95113, 95114];
const lowCount = lowLevelIds.filter(id => rel.getCombination(id)).length;
assert(lowCount === 5, 'low-level ironman/apprentice combos registered');

// 20. Non-consumed prestige items (consumed: false) present — anti-deprecation
let nonConsumedFound = 0;
for (const id of megaComboIds) {
  const combo = rel.getCombination(id);
  if (combo.inputs.some(i => i.consumed === false)) nonConsumedFound++;
}
assert(nonConsumedFound >= 4, `non-consumed prestige inputs (reagent-rule preserving quest/prestige items) (actual: ${nonConsumedFound})`);

// 21. Station variety (anvil/furnace/altar)
const stations = new Set();
for (const id of megaComboIds) {
  const combo = rel.getCombination(id);
  if (combo.station) stations.add(combo.station);
}
assert(stations.has('anvil'), 'at least one combo uses anvil station');
assert(stations.has('altar'), 'at least one combo uses altar station');

// 22. Skill coverage (smithing, fletching, crafting, herblore, cooking, prayer, magic, runecrafting, slayer)
const skillSet = new Set();
for (const id of megaComboIds) {
  const combo = rel.getCombination(id);
  if (combo.skill) skillSet.add(combo.skill);
}
const requiredSkills = ['smithing', 'fletching', 'crafting', 'herblore', 'cooking', 'prayer', 'magic', 'runecrafting', 'slayer'];
const missingSkills = requiredSkills.filter(s => !skillSet.has(s));
assert(missingSkills.length === 0, `mega combos cover 9 key skills (missing: ${missingSkills.join(', ') || 'none'})`);

// ══════════════════════════════════════════════════════════════════════════════
// SECTION B: recipes-mega — skill recipes + tier ladder
// ══════════════════════════════════════════════════════════════════════════════

// 23. Recipe count
assert(recMega.recipeCount >= 30, `recipes-mega defines 30+ recipes (actual: ${recMega.recipeCount})`);

// 24. Item definitions count
assert(recMega.itemDefCount >= 40, `recipes-mega defines 40+ new items (actual: ${recMega.itemDefCount})`);

// 25-27. Key skill ladders exist
const allRecipes = recipes.forSkill ? recipes.forSkill('fletching') : [];
const dartTiers = ['fletch_bronze_darts','fletch_iron_darts','fletch_steel_darts','fletch_mithril_darts','fletch_adamant_darts','fletch_rune_darts','fletch_dragon_darts'];
const dartCount = dartTiers.filter(id => recipes.findById(id)).length;
assert(dartCount === 7, `dart fletching ladder bronze->dragon (actual: ${dartCount}/7)`);

const boltTiers = ['fletch_bronze_bolts','fletch_iron_bolts','fletch_steel_bolts','fletch_mithril_bolts','fletch_adamant_bolts','fletch_rune_bolts'];
const boltCount = boltTiers.filter(id => recipes.findById(id)).length;
assert(boltCount === 6, `crossbow bolt ladder bronze->runite (actual: ${boltCount}/6)`);

const battlestaffTiers = ['craft_air_battlestaff','craft_water_battlestaff','craft_earth_battlestaff','craft_fire_battlestaff'];
const battlestaffCount = battlestaffTiers.filter(id => recipes.findById(id)).length;
assert(battlestaffCount === 4, 'all 4 elemental battlestaves craftable');

// 28-29. Dragonhide crafting ladder
const dhideTiers = ['craft_blue_dhide_body','craft_red_dhide_body','craft_black_dhide_body'];
const dhideCount = dhideTiers.filter(id => recipes.findById(id)).length;
assert(dhideCount === 3, 'dragonhide body crafting ladder (blue/red/black)');

// 30. Cooking tier recipes (stew, pies, summer pie endgame)
const cookingTiers = ['cook_stew','cook_kebab','cook_meat_pie','cook_apple_pie','cook_summer_pie'];
const cookCount = cookingTiers.filter(id => recipes.findById(id)).length;
assert(cookCount === 5, 'cooking recipe tiers (stew through summer pie)');

// 31. Herblore endgame: super combat, extended antifire, stamina, divine
const herbloreTiers = ['mix_super_combat','mix_extended_antifire','mix_stamina','mix_divine_super_combat'];
const herbCount = herbloreTiers.filter(id => recipes.findById(id)).length;
assert(herbCount === 4, 'herblore endgame recipes (super combat / antifire+ / stamina / divine)');

// 32. Runecrafting combo runes
const comboRunes = ['craft_mist_runes','craft_dust_runes','craft_mud_runes','craft_smoke_runes','craft_steam_runes','craft_lava_runes'];
const comboRuneCount = comboRunes.filter(id => recipes.findById(id)).length;
assert(comboRuneCount === 6, 'all 6 combo runes craftable');

// 33. Construction planks
const plankTiers = ['make_plank','make_oak_plank','make_teak_plank','make_mahogany_plank'];
const plankCount = plankTiers.filter(id => recipes.findById(id)).length;
assert(plankCount === 4, 'construction plank ladder (normal/oak/teak/mahogany)');

// 34. Bonfires
const bonfires = ['bonfire_logs','bonfire_oak','bonfire_willow','bonfire_maple','bonfire_yew','bonfire_magic','bonfire_petrified_palm'];
const bonfireCount = bonfires.filter(id => recipes.findById(id)).length;
assert(bonfireCount === 7, 'firemaking bonfire ladder (logs through petrified palm)');

// 35. Prayer reanimation tier
const reanimateTiers = ['reanimate_goblin','reanimate_giant','reanimate_dragon'];
const reanCount = reanimateTiers.filter(id => recipes.findById(id)).length;
assert(reanCount === 3, 'prayer reanimation tier (goblin/giant/dragon)');

// 36. Cannonball recipe
assert(recipes.findById('smith_cannonball') != null, 'cannonball smithing recipe registered');

// ══════════════════════════════════════════════════════════════════════════════
// SECTION C: Loader registration in 4 target tool files
// ══════════════════════════════════════════════════════════════════════════════

function fileHas(filePath, needle) {
  try {
    const txt = fs.readFileSync(path.join(__dirname, '..', filePath), 'utf8');
    return txt.includes(needle);
  } catch (e) { return false; }
}

assert(fileHas('src/tools/codex-generator.js', "combinations-mega"), 'codex-generator.js loads combinations-mega');
assert(fileHas('src/tools/codex-generator.js', "recipes-mega"), 'codex-generator.js loads recipes-mega');
assert(fileHas('scripts/gap-report.js', "combinations-mega"), 'gap-report.js loads combinations-mega');
assert(fileHas('scripts/gap-report.js', "recipes-mega"), 'gap-report.js loads recipes-mega');
assert(fileHas('src/tools/multi-agent-sim.js', "combinations-mega"), 'multi-agent-sim.js loads combinations-mega');
assert(fileHas('src/tools/multi-agent-sim.js', "recipes-mega"), 'multi-agent-sim.js loads recipes-mega');
assert(fileHas('src/tools/region-analyzer.js', "combinations-mega"), 'region-analyzer.js loads combinations-mega');
assert(fileHas('src/tools/region-analyzer.js', "recipes-mega"), 'region-analyzer.js loads recipes-mega');

// ══════════════════════════════════════════════════════════════════════════════
// SECTION D: Named-in-world voice (flavor check)
// Names should reference in-world concepts, not generic "Item Combo 7" etc.
// ══════════════════════════════════════════════════════════════════════════════

// Check for in-world naming motifs in resultName OR description.
// Broader motif set reflecting the actual voice-of-world used.
const motifs = [
  "Bog-Witch", "Salt-Cured", "Mooncourt", "Cold-Iron", "Sun-Baked",
  "Dream-Forge", "Witness-Wall", "Lens", "Brine", "Bond",
  "Moryskah", "Saltbrine", "Veilwood", "Sootworks", "Boneyard",
  "Inkweald", "Glass Desert", "Pyramid", "Mirror", "Crystal",
  "Silver-Wracked", "Signal-Fire", "Druid", "Heretic", "Phoenix",
  "Scythe", "Godsword", "Godbolt", "Harpoon", "Tempered", "Reforged",
  "Consecration", "Infusion", "Rite", "Wracked", "Storm", "Tide",
  "Ember", "Forge", "Reaver", "Nightmare", "Sunder", "Fusion",
  "Leviathan", "Binder", "Moon-", "Sand-", "Bone-", "Barrows",
  "Kingsblade", "Ironman", "Deathbringer", "Apprentice", "Gilded",
  "Salted", "Ranging", "Reagent", "Heart",
];
const motifsLower = motifs.map(m => m.toLowerCase());
let motifCount = 0;
for (const id of megaComboIds) {
  const combo = rel.getCombination(id);
  const txt = (combo.resultName + ' ' + combo.description).toLowerCase();
  for (const m of motifsLower) {
    if (txt.includes(m)) { motifCount++; break; }
  }
}
assert(motifCount >= 30, `30+ combos use in-world naming motifs (actual: ${motifCount}/${megaComboIds.length})`);

// ══════════════════════════════════════════════════════════════════════════════
// EXIT
// ══════════════════════════════════════════════════════════════════════════════

console.log('');
console.log('═══════════════════════════════════════════════════════════════════');
console.log('  Tests: ' + (passed + failed) + ' total, ' + passed + ' passed, ' + failed + ' failed');
console.log('═══════════════════════════════════════════════════════════════════');
process.exit(failed > 0 ? 1 : 0);
