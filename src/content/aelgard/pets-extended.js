// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Pet Companion Extended Registry (burn v2)
//
// The base pet data lives in src/content/aelgard/pets-collection.js (~45 pets
// with display-only metadata). This file is the RUNTIME extension: every pet
// here is registered with the engine's pet runtime (src/engine/pets.js) with
// full metadata — boss sourceId, skill tag, foods, combat eligibility, tier,
// and the shiny variant id.
//
// Anything in pets-collection.js that doesn't appear here gets a sensible
// default via importCollection at the bottom — so a skeleton pet (id+name+rate)
// still participates in unlocks, just with passive/combat_ineligible defaults.
//
// Total pets after this module: 45+ (28 boss/slayer pets + 11 skilling pets +
// 6 minigame/clue pets + adds: quest-locked pets + random-event pets).
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

// Load the base collection so its data (pets, collectionLog) is available.
const base = require('./pets-collection');
const pets = require('../../engine/pets');
const items = require('../../data/items');

// Food item ids used across pet diets. These are the 'cooked_' and raw food
// ids already present in the item database.
const FOOD = {
  shrimps: 317, sardine: 325, trout: 333, lobster: 379, swordfish: 373, shark: 385,
  bread: 2309, cake: 1891, stew: 2003, chicken: 2140, beef: 2142,
  // fruits/veg/herbs for herbivores
  carrot: 1963, cabbage: 1965, onion: 1957, banana: 1963, tomato: 1982,
  // exotica — used by rarer pets
  manta_ray: 391, seaweed: 401, raw_bones: 100, big_bones: 106, dragon_bones: 107,
  coal: 453, iron_ore: 212, gold_ore: 444, runite_ore: 256, limpwurt: 322,
  // phoenix / fire / magic
  fire_rune: 554, blood_rune: 565, feather: 314, logs: 200, magic_logs: 207,
  chocolate_bar: 1973, cheese: 1985, ale: 1911,
};

// Helper: mark a pet def as coming from this extended file so the base
// importer doesn't clobber it.
function REG(def) {
  const d = pets.registerPetDef(def);
  d._fromExtended = true;
  return d;
}

// ══════════════════════════════════════════════════════════════════════════════
// BOSS PETS — bossId links to the NPC defId used in droptables/boss-instances
// ══════════════════════════════════════════════════════════════════════════════

REG({ id: 80001, name: 'Baby Duran', source: 'Forgefather Duran', sourceId: 'forgefather_duran',
  bossId: 'forgefather_duran', category: 'boss', rarity: 3000, tier: 2,
  foods: [FOOD.coal, FOOD.iron_ore], combatEligible: false });

REG({ id: 80002, name: 'Sand Prince Jr.', source: 'Azhmari, The Sand Prince', sourceId: 'azhmari',
  bossId: 'azhmari', category: 'boss', rarity: 3000, tier: 3, foods: [FOOD.beef, FOOD.onion] });

REG({ id: 80003, name: 'Hydra cub', source: 'Bog Hydra', sourceId: 'bog_hydra',
  bossId: 'bog_hydra', category: 'boss', rarity: 4000, tier: 3, foods: [FOOD.swordfish, FOOD.shark] });

REG({ id: 80004, name: 'Count Malachar Jr.', source: 'Count Malachar', sourceId: 'count_malachar',
  bossId: 'count_malachar', category: 'boss', rarity: 3000, tier: 3,
  foods: [FOOD.chocolate_bar, FOOD.cheese] });

REG({ id: 80005, name: 'Veil sprout', source: 'The Veilmother', sourceId: 'veilmother',
  bossId: 'veilmother', category: 'boss', rarity: 3000, tier: 3,
  foods: [FOOD.carrot, FOOD.cabbage] });

REG({ id: 80006, name: 'Mini anvil', source: 'Vorath, Warden of the Deep Vein', sourceId: 'vorath',
  bossId: 'vorath', category: 'boss', rarity: 3000, tier: 3, foods: [FOOD.iron_ore, FOOD.coal] });

REG({ id: 80007, name: 'Soot golem', source: 'The Soot King', sourceId: 'soot_king',
  bossId: 'soot_king', category: 'boss', rarity: 5000, tier: 4, foods: [FOOD.coal] });

REG({ id: 80008, name: 'Baby kraken', source: 'Kraken of Saltbrine', sourceId: 'kraken_saltbrine',
  bossId: 'kraken_saltbrine', category: 'boss', rarity: 3000, tier: 3,
  foods: [FOOD.shark, FOOD.manta_ray, FOOD.seaweed] });

REG({ id: 80009, name: 'Dream wisp pet', source: 'Inkweald Muse', sourceId: 'inkweald_muse',
  bossId: 'inkweald_muse', category: 'boss', rarity: 4000, tier: 4, foods: [FOOD.blood_rune] });

REG({ id: 80010, name: 'Harmonic note', source: 'Hollow Choir Conductor', sourceId: 'hollow_choir',
  bossId: 'hollow_choir', category: 'boss', rarity: 5000, tier: 5, foods: [FOOD.blood_rune] });

REG({ id: 80011, name: 'Glass shard pet', source: 'The Glass Tyrant', sourceId: 'glass_tyrant',
  bossId: 'glass_tyrant', category: 'boss', rarity: 4000, tier: 4, foods: [FOOD.gold_ore, FOOD.runite_ore] });

REG({ id: 80012, name: 'Veldrak hatchling', source: 'Veldrak, the Last Dragon', sourceId: 'veldrak',
  bossId: 'veldrak', category: 'boss', rarity: 5000, tier: 5,
  foods: [FOOD.dragon_bones], shinyVariant: 80012 });

REG({ id: 80013, name: 'Baby Crystal Wyrm', source: 'Crystal Wyrm', sourceId: 'crystal_wyrm',
  bossId: 'crystal_wyrm', category: 'boss', rarity: 3000, tier: 4,
  foods: [FOOD.dragon_bones, FOOD.runite_ore] });

REG({ id: 80014, name: 'Chaos blob', source: 'Chaos Elemental', sourceId: 'chaos_elemental',
  bossId: 'chaos_elemental', category: 'boss', rarity: 3000, tier: 3, foods: [FOOD.blood_rune] });

REG({ id: 80015, name: 'Scorpia offspring', source: 'Scorpia', sourceId: 'scorpia',
  bossId: 'scorpia', category: 'boss', rarity: 3000, tier: 3, foods: [FOOD.beef] });

REG({ id: 80016, name: "Vet'ion skull", source: "Vet'ion", sourceId: 'vetion',
  bossId: 'vetion', category: 'boss', rarity: 3000, tier: 3, foods: [FOOD.big_bones] });

REG({ id: 80017, name: 'Callisto cub', source: 'Callisto', sourceId: 'callisto',
  bossId: 'callisto', category: 'boss', rarity: 3000, tier: 3, foods: [FOOD.beef, FOOD.chicken] });

REG({ id: 80018, name: 'Venenatis spiderling', source: 'Venenatis', sourceId: 'venenatis',
  bossId: 'venenatis', category: 'boss', rarity: 3000, tier: 3, foods: [FOOD.chicken] });

REG({ id: 80019, name: 'Noon', source: 'Grotesque Guardians', sourceId: 'grotesque_guardians',
  bossId: 'grotesque_guardians', category: 'boss', rarity: 3000, tier: 3, foods: [FOOD.coal] });

REG({ id: 80020, name: 'Skotos', source: 'Dark beast (superior)', sourceId: 'dark_beast',
  bossId: 'dark_beast', category: 'boss', rarity: 3000, tier: 3, foods: [FOOD.beef] });

REG({ id: 80021, name: 'Hellpuppy', source: 'Cerberus', sourceId: 'cerberus',
  bossId: 'cerberus', category: 'boss', rarity: 3000, tier: 4,
  foods: [FOOD.big_bones, FOOD.beef],
  // Hellpuppy is combat-eligible — tiny bite, capped at 1% of player damage.
  combatEligible: true, damageShare: 0.01 });

REG({ id: 80022, name: 'Kraken pet', source: 'Cave Kraken (boss)', sourceId: 'cave_kraken',
  bossId: 'cave_kraken', category: 'boss', rarity: 3000, tier: 3, foods: [FOOD.shark] });

REG({ id: 80023, name: 'Pet Smoke devil', source: 'Thermonuclear smoke devil', sourceId: 'thermy',
  bossId: 'thermy', category: 'boss', rarity: 3000, tier: 3, foods: [FOOD.fire_rune] });

REG({ id: 80024, name: 'Iron baby dragon', source: 'Iron dragon', sourceId: 'iron_dragon',
  bossId: 'iron_dragon', category: 'boss', rarity: 5000, tier: 4, foods: [FOOD.iron_ore] });

REG({ id: 80025, name: 'Jal-nib-rek', source: 'Infernal Challenge (wave 69)', sourceId: 'inferno',
  bossId: 'inferno', category: 'boss', rarity: 100, tier: 5, foods: [FOOD.fire_rune],
  combatEligible: true, damageShare: 0.01 });

REG({ id: 80026, name: 'TzRek-Jad', source: 'Fight Caves (wave 63)', sourceId: 'fight_caves',
  bossId: 'fight_caves', category: 'boss', rarity: 200, tier: 5, foods: [FOOD.fire_rune] });

REG({ id: 80027, name: 'Prince Black Dragon', source: 'King Black Dragon', sourceId: 'king_black_dragon',
  bossId: 'king_black_dragon', category: 'boss', rarity: 3000, tier: 3,
  foods: [FOOD.dragon_bones] });

// ── God wars — pets added here (tied to the sourceId used in bosses-expanded.js)
REG({ id: 82001, name: 'Zilyana Jr.', source: 'Commander Zilyana', sourceId: 'commander_zilyana',
  bossId: 'commander_zilyana', category: 'boss', rarity: 5000, tier: 5,
  foods: [FOOD.blood_rune], combatEligible: false });

REG({ id: 82002, name: 'General Graardor Jr.', source: 'General Graardor', sourceId: 'general_graardor',
  bossId: 'general_graardor', category: 'boss', rarity: 5000, tier: 5,
  foods: [FOOD.beef, FOOD.chicken] });

// ══════════════════════════════════════════════════════════════════════════════
// SKILLING PETS — skill linked for onSkillAction rolls
// ══════════════════════════════════════════════════════════════════════════════

REG({ id: 80101, name: 'Rock golem (pet)', source: 'Mining', sourceId: 'mining',
  category: 'skill', skill: 'mining', rarity: 250000, tier: 2,
  foods: [FOOD.coal, FOOD.iron_ore, FOOD.gold_ore] });

REG({ id: 80102, name: 'Heron', source: 'Fishing', sourceId: 'fishing',
  category: 'skill', skill: 'fishing', rarity: 250000, tier: 2,
  foods: [FOOD.shrimps, FOOD.trout, FOOD.sardine] });

REG({ id: 80103, name: 'Beaver', source: 'Woodcutting', sourceId: 'woodcutting',
  category: 'skill', skill: 'woodcutting', rarity: 250000, tier: 2,
  foods: [FOOD.logs, FOOD.magic_logs] });

REG({ id: 80104, name: 'Giant squirrel', source: 'Agility', sourceId: 'agility',
  category: 'skill', skill: 'agility', rarity: 30000, tier: 2, foods: [FOOD.bread] });

REG({ id: 80105, name: 'Tangleroot', source: 'Farming', sourceId: 'farming',
  category: 'skill', skill: 'farming', rarity: 7000, tier: 3,
  foods: [FOOD.limpwurt, FOOD.carrot, FOOD.cabbage] });

REG({ id: 80106, name: 'Rocky', source: 'Thieving', sourceId: 'thieving',
  category: 'skill', skill: 'thieving', rarity: 250000, tier: 2,
  foods: [FOOD.cake, FOOD.bread] });

REG({ id: 80107, name: 'Rift guardian', source: 'Runecrafting', sourceId: 'runecrafting',
  category: 'skill', skill: 'runecrafting', rarity: 250000, tier: 3,
  foods: [FOOD.blood_rune, FOOD.fire_rune] });

REG({ id: 80108, name: 'Herbi', source: 'Herblore', sourceId: 'herblore',
  category: 'skill', skill: 'herblore', rarity: 7000, tier: 2, foods: [FOOD.limpwurt] });

REG({ id: 80109, name: 'Phoenix', source: 'Firemaking (Spirit Pyre minigame)', sourceId: 'firemaking',
  category: 'skill', skill: 'firemaking', rarity: 5000, tier: 3,
  foods: [FOOD.feather, FOOD.logs, FOOD.fire_rune] });

REG({ id: 80110, name: 'Chompy chick', source: 'Hunter', sourceId: 'hunter',
  category: 'skill', skill: 'hunter', rarity: 250000, tier: 2,
  foods: [FOOD.chicken, FOOD.beef] });

REG({ id: 80111, name: 'Nexling', source: 'Construction', sourceId: 'construction',
  category: 'skill', skill: 'construction', rarity: 250000, tier: 3, foods: [FOOD.logs] });

// Additional skill pets (cooking, smithing, prayer, slayer) — fill gaps.
REG({ id: 80112, name: 'Prayer Spirit', source: 'Prayer (bone burial)', sourceId: 'prayer',
  category: 'skill', skill: 'prayer', rarity: 200000, tier: 3,
  foods: [FOOD.big_bones, FOOD.dragon_bones] });
REG({ id: 80113, name: 'Pet Snakeling', source: 'Slayer (Zulrah)', sourceId: 'slayer',
  category: 'skill', skill: 'slayer', rarity: 4000, tier: 4, foods: [FOOD.shark] });
REG({ id: 80114, name: 'Golem Child', source: 'Smithing (Blast Furnace)', sourceId: 'smithing',
  category: 'skill', skill: 'smithing', rarity: 200000, tier: 3,
  foods: [FOOD.iron_ore, FOOD.coal, FOOD.gold_ore] });
REG({ id: 80115, name: 'Chinchompa Cub', source: 'Hunter (chinchompa catch)', sourceId: 'hunter',
  category: 'skill', skill: 'hunter', rarity: 98000, tier: 3, foods: [FOOD.chicken] });
REG({ id: 80116, name: 'Cooking Cat', source: 'Cooking', sourceId: 'cooking',
  category: 'skill', skill: 'cooking', rarity: 200000, tier: 2, foods: [FOOD.shrimps, FOOD.shark] });
REG({ id: 80117, name: 'Fletching Owl', source: 'Fletching', sourceId: 'fletching',
  category: 'skill', skill: 'fletching', rarity: 200000, tier: 2, foods: [FOOD.feather] });
REG({ id: 80118, name: 'Crafting Spider', source: 'Crafting', sourceId: 'crafting',
  category: 'skill', skill: 'crafting', rarity: 200000, tier: 2, foods: [FOOD.logs] });
REG({ id: 80119, name: 'Defence Turtle', source: 'Defence (tankers)', sourceId: 'defence',
  category: 'skill', skill: 'defence', rarity: 500000, tier: 3,
  foods: [FOOD.seaweed], combatEligible: true, damageShare: 0 });

// ══════════════════════════════════════════════════════════════════════════════
// MINIGAME + CLUE + RANDOM EVENT PETS
// ══════════════════════════════════════════════════════════════════════════════

REG({ id: 80201, name: 'Lil creator', source: 'Pest Control (1/5000 games)', sourceId: 'pest_control',
  category: 'minigame', rarity: 5000, tier: 3, foods: [FOOD.bread] });

REG({ id: 80202, name: 'Bloodhound', source: 'Master clue scroll (1/1000)', sourceId: 'master_clue',
  category: 'clue', rarity: 1000, tier: 4, foods: [FOOD.beef, FOOD.chicken] });

// Additional clue / minigame pets filling out the collection.
REG({ id: 80203, name: 'Baby Mole', source: 'Giant Mole', sourceId: 'giant_mole',
  bossId: 'giant_mole', category: 'boss', rarity: 3000, tier: 3,
  foods: [FOOD.carrot, FOOD.limpwurt] });
REG({ id: 80204, name: 'Olmlet', source: 'Chambers of Xeric', sourceId: 'cox',
  bossId: 'cox', category: 'boss', rarity: 65, tier: 5, foods: [FOOD.shark] });
REG({ id: 80205, name: "Lil' Zik", source: 'Theatre of Blood', sourceId: 'tob',
  bossId: 'tob', category: 'boss', rarity: 650, tier: 5, foods: [FOOD.shark] });
REG({ id: 80206, name: "Ori", source: 'The Nightmare of Ashihama', sourceId: 'nightmare',
  bossId: 'nightmare', category: 'boss', rarity: 4000, tier: 5, foods: [FOOD.blood_rune] });
REG({ id: 80207, name: 'Clue wisp', source: 'Elite clue scroll', sourceId: 'clue_elite',
  category: 'clue', rarity: 1600, tier: 4, foods: [FOOD.blood_rune] });
REG({ id: 80208, name: 'Clue ember', source: 'Hard clue scroll', sourceId: 'clue_hard',
  category: 'clue', rarity: 1000, tier: 3, foods: [FOOD.feather] });

// Random-event pets — from random-events-daily.js system
REG({ id: 80301, name: 'Genie wisp', source: 'Genie random event', sourceId: 'random_genie',
  category: 'random', rarity: 2500, tier: 3, foods: [FOOD.cake] });
REG({ id: 80302, name: 'Drunken dwarf', source: 'Drunken dwarf event', sourceId: 'random_dwarf',
  category: 'random', rarity: 2500, tier: 2, foods: [FOOD.ale, FOOD.bread] });
REG({ id: 80303, name: 'Sandwich lady pet', source: 'Sandwich lady event', sourceId: 'random_sandwich',
  category: 'random', rarity: 3000, tier: 2, foods: [FOOD.bread, FOOD.cheese] });

// ══════════════════════════════════════════════════════════════════════════════
// QUEST-LOCKED PETS — awarded on quest completion
// ══════════════════════════════════════════════════════════════════════════════

REG({ id: 80401, name: 'Pet rock', source: "Monk's Friend quest", sourceId: 'monks_friend',
  questId: 'monks_friend', category: 'quest', rarity: 1, tier: 1, foods: [FOOD.coal] });

REG({ id: 80402, name: 'Runaway golem mini', source: 'The Runaway Golem quest', sourceId: 'the_runaway_golem',
  questId: 'the_runaway_golem', category: 'quest', rarity: 1, tier: 2,
  foods: [FOOD.iron_ore, FOOD.coal] });

REG({ id: 80403, name: 'Herbiboar cub', source: 'The Green Thumb quest', sourceId: 'the_green_thumb',
  questId: 'the_green_thumb', category: 'quest', rarity: 1, tier: 2, foods: [FOOD.limpwurt] });

REG({ id: 80404, name: 'Dragon hatchling', source: 'Dragon Slayer of Aelgard', sourceId: 'dragon_slayer_aelgard',
  questId: 'dragon_slayer_aelgard', category: 'quest', rarity: 1, tier: 3,
  foods: [FOOD.dragon_bones], combatEligible: true, damageShare: 0.01 });

REG({ id: 80405, name: 'Cat (Ardougne)', source: 'Ratcatchers quest', sourceId: 'ratcatchers',
  questId: 'ratcatchers', category: 'quest', rarity: 1, tier: 1, foods: [FOOD.beef] });

// ══════════════════════════════════════════════════════════════════════════════
// FINAL SWEEP — import anything from pets-collection.js that we didn't already
// register. Gives skeleton defs with passive defaults so they still work.
// ══════════════════════════════════════════════════════════════════════════════

const importedExtra = pets.importCollection(base.pets);

console.log('[aelgard] Pet runtime: '
  + pets.listPetDefs().length + ' pets registered ('
  + importedExtra + ' auto-imported from base collection)');

module.exports = {
  FOOD,
  totalPetsRegistered: pets.listPetDefs().length,
};
