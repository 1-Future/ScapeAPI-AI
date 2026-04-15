#!/usr/bin/env node
// ==============================================================================
// PROGRESSION SIMULATOR — Supply Chain Economy Edition
//
// Simulates a player walking through the entire game graph with a REAL economy:
// training methods consume and produce items, gold, and resources. The agent
// must balance producer skills (mining, fishing, woodcutting) against consumer
// skills (prayer, herblore, smithing) — just like a real OSRS player.
//
// The critical fix: methods now have input dependencies. You cannot train prayer
// at the Chaos Altar if you have no bones. You cannot cook sharks if you have
// no raw sharks. The sim models WHERE those inputs come from.
//
// Reports:
//   1. Dead zones — stretches of 5+ hours with no breakpoints
//   2. Dead content — training methods no rational agent would ever pick
//   3. Dangling prereqs — quests/areas referencing things that don't exist
//   4. Orphaned items — items with sources but no uses (or vice versa)
//   5. Degenerate methods — one method strictly better than another in same bracket
//   6. Missing coverage — level brackets with <2 methods or no AFK option
//   7. Progression bottlenecks — skills that block everything but have no good methods
//   8. Routing diversity — how many viable paths exist at each decision point
//   9. Supply chain flow — resources produced/consumed and bottlenecks
//  10. Skill diversity score — how many skills trained, time distribution
//  11. Resource deficits — times the agent wanted X but lacked inputs
//
// Usage: node src/tools/progression-sim.js [--verbose] [--hours H]
// ==============================================================================

'use strict';

// -- Load the relationship layer -----------------------------------------------
const rel = require('../data/relationships');

// Load all content files that populate the relationship registries
require('../content/aelgard/area-gates');
require('../content/aelgard/quest-unlocks');
require('../content/aelgard/item-ecosystem');
require('../content/aelgard/training-knobs');
require('../content/aelgard/breakpoints');

// Try to load skill-web (recipes) — may fail if recipe module isn't available standalone
let recipesLoaded = false;
try {
  require('../content/aelgard/skill-web');
  recipesLoaded = true;
} catch (e) {
  console.log('[sim] skill-web.js skipped (requires recipe module): ' + e.message);
}
try { require('../content/aelgard/heartlands-deep'); } catch (e) { /* optional */ }
try { require('../content/aelgard/heartlands-density'); } catch (e) { /* optional */ }
try { require('../content/aelgard/moryskah-deep'); } catch (e) { /* optional */ }
try { require('../content/aelgard/moryskah-density'); } catch (e) { /* optional */ }
try { require('../content/aelgard/sootworks-deep'); } catch (e) { /* optional */ }
try { require('../content/aelgard/sootworks-density'); } catch (e) { /* optional */ }
try { require('../content/aelgard/saltbrine-deep'); } catch (e) { /* optional */ }
try { require('../content/aelgard/saltbrine-density'); } catch (e) { /* optional */ }
try { require('../content/aelgard/veilwood-deep'); } catch (e) { /* optional */ }
try { require('../content/aelgard/veilwood-density'); } catch (e) { /* optional */ }
try { require('../content/aelgard/boneyard-deep'); } catch (e) { /* optional */ }
try { require('../content/aelgard/boneyard-density'); } catch (e) { /* optional */ }
try { require('../content/aelgard/glass-desert-deep'); } catch (e) { /* optional */ }
try { require('../content/aelgard/glass-desert-density'); } catch (e) { /* optional */ }
try { require('../content/aelgard/inkweald-deep'); } catch (e) { /* optional */ }
try { require('../content/aelgard/inkweald-density'); } catch (e) { /* optional */ }
try { require('../content/aelgard/wilds-deep'); } catch (e) { /* optional */ }
try { require('../content/aelgard/wilds-density'); } catch (e) { /* optional */ }
try { require('../content/aelgard/mid-tier-regions'); } catch (e) { /* optional */ }
try { require('../content/aelgard/universal-items'); } catch (e) { /* optional */ }
try { require('../content/aelgard/special-regions'); } catch (e) { /* optional */ }
try { require('../content/aelgard/cross-region-web'); } catch (e) { /* optional */ }
try { require('../content/aelgard/quirky-interactions'); } catch (e) { /* optional */ }

// -- XP Table (OSRS-accurate) --------------------------------------------------
const XP_TABLE = [0];
for (let lvl = 1; lvl < 99; lvl++) {
  XP_TABLE.push(Math.floor(XP_TABLE[lvl - 1] + Math.floor(lvl + 300 * Math.pow(2, lvl / 7)) / 4));
}
function xpForLevel(lvl) { return XP_TABLE[Math.min(lvl, 99) - 1] || 0; }
function levelForXp(xp) {
  for (let l = 98; l >= 1; l--) { if (xp >= XP_TABLE[l]) return l + 1; }
  return 1;
}

// -- Skills --------------------------------------------------------------------
const SKILLS = [
  'attack', 'strength', 'defence', 'hitpoints', 'ranged', 'prayer', 'magic',
  'runecrafting', 'construction', 'agility', 'herblore', 'thieving',
  'crafting', 'fletching', 'slayer', 'hunter', 'mining', 'smithing',
  'fishing', 'cooking', 'firemaking', 'woodcutting', 'farming',
];

// -- Skill Categories ----------------------------------------------------------
// Producer skills ADD items to inventory. Consumer skills REMOVE items.
// Combat skills consume food but produce drops.
const PRODUCER_SKILLS = new Set(['mining', 'woodcutting', 'fishing', 'farming', 'thieving', 'hunter']);
const CONSUMER_SKILLS = new Set(['prayer', 'herblore', 'cooking', 'smithing', 'crafting', 'fletching', 'construction', 'firemaking', 'runecrafting']);
const COMBAT_SKILLS = new Set(['attack', 'strength', 'defence', 'hitpoints', 'ranged']);
const UTILITY_SKILLS = new Set(['agility', 'slayer', 'magic']);

// -- Base Item Values (for buy/sell via gold) -----------------------------------
// Simplified pricing. The sim can "buy" items at market price if it has gold.
const ITEM_PRICES = {
  // Bones
  'Bones': 50,
  'Big bones': 200,
  'Dragon bones': 2500,
  'Ensouled head': 1500,
  // Raw fish
  'Raw shrimp': 5,
  'Raw sardine': 10,
  'Raw herring': 15,
  'Raw trout': 25,
  'Raw pike': 50,
  'Raw tuna': 80,
  'Raw lobster': 150,
  'Raw bass': 200,
  'Raw monkfish': 400,
  'Raw karambwan': 500,
  'Raw shark': 700,
  'Raw anglerfish': 1200,
  'Raw dark crab': 1500,
  'Raw manta ray': 1800,
  // Cooked food
  'Cooked shrimp': 10,
  'Trout': 30,
  'Lobster': 200,
  'Monkfish': 500,
  'Shark': 800,
  'Anglerfish': 1500,
  'Dark crab': 1800,
  'Karambwan': 600,
  'Tuna': 100,
  'Bass': 250,
  'Sardine': 15,
  'Herring': 20,
  'Cooked food': 300,
  // Ore
  'Copper ore': 10,
  'Tin ore': 10,
  'Iron ore': 50,
  'Coal': 120,
  'Silver ore': 60,
  'Gold ore': 200,
  'Mithril ore': 150,
  'Adamantite ore': 800,
  'Runite ore': 11000,
  'Ore (varied)': 100,
  // Bars
  'Bronze bar': 30,
  'Iron bar': 100,
  'Steel bar': 350,
  'Mithril bar': 500,
  'Adamantite bar': 2000,
  'Rune bar': 12000,
  'Gold bar': 300,
  'Silver bar': 80,
  // Logs
  'Logs': 20,
  'Oak logs': 40,
  'Willow logs': 8,
  'Maple logs': 15,
  'Yew logs': 200,
  'Magic logs': 800,
  'Teak logs': 150,
  'Mahogany logs': 400,
  'Redwood logs': 500,
  'Achey tree logs': 5,
  'Arctic pine logs': 20,
  'Noted logs (varied)': 100,
  // Herbs
  'Grimy herb (low)': 100,
  'Grimy herb (mid)': 500,
  'Grimy herb (high)': 2000,
  'Clean herb (low)': 120,
  'Clean herb (mid)': 600,
  'Clean herb (high)': 2200,
  'Clean herbs': 500,
  'Herbs (varied)': 800,
  'Grimy herb': 600,
  // Potions
  'Attack potion': 100,
  'Prayer potion': 5000,
  'Super combat potion': 20000,
  'Potions': 3000,
  // Runes
  'Air rune': 4,
  'Water rune': 5,
  'Earth rune': 5,
  'Fire rune': 5,
  'Chaos rune': 90,
  'Nature rune': 200,
  'Death rune': 300,
  'Blood rune': 400,
  'Runes': 100,
  // Pure essence
  'Pure essence': 3,
  'Dense essence block': 50,
  'Daeyalt essence': 100,
  // Seeds
  'Herb seed (low)': 50,
  'Herb seed (mid)': 2000,
  'Herb seed (high)': 30000,
  // Hides
  'Cowhide': 100,
  'Green dragonhide': 1500,
  'Dragonhide (varied)': 2000,
  'Tanned dragonhide': 2500,
  'Leather items': 50,
  // Combat drops
  'Raw chicken': 5,
  'Feather': 3,
  'Raw beef': 10,
  'Limpwurt root': 500,
  // Misc
  'Arrow shaft': 5,
  'Broad bolt': 50,
  'Yew longbow (u)': 300,
  'Dragon dart': 5000,
  'Cannonball': 200,
  'Gold coins': 1,
  'Gold jewelry': 200,
  'Glass items': 30,
  'Dragonhide body': 5000,
  'Platebody': 1000,
  'Smithed item': 500,
  'Javelin': 100,
  'Enchanted bolts': 200,
  'Bird nest': 5000,
  'Red chinchompa': 1500,
  'Black chinchompa': 3000,
  'Sulliuscep cap': 100,
  'Numulite': 10,
  'Fruit': 5,
  'Vegetables': 10,
  'Jug of wine': 5,
  'Grapes': 30,
  'Jug of water': 3,
  'Shade remains': 200,
  'Plank (oak)': 250,
  'Plank (mahogany)': 1300,
  'Plank (teak)': 500,
  'Volcanic ash': 50,
};

// -- Supply Chain: Input Requirements per Training Method -----------------------
// This is the KEY innovation. Every consumer method now declares what it eats.
// The sim matches item NAMES from resourceOutput.produces against these inputs.
//
// Format: { resource: 'item name', perHour: N, source: 'hint' }
// If the player lacks the resource AND lacks gold to buy it, the method is blocked.

const METHOD_INPUTS = {
  // PRAYER — consumes bones
  'prayer_bones_altar': [
    { resource: 'Bones', perHour: 300, source: 'combat_drops' },
  ],
  'prayer_dragon_bones_gilded': [
    { resource: 'Dragon bones', perHour: 300, source: 'combat_drops' },
  ],
  'prayer_ectofuntus': [
    { resource: 'Bones', perHour: 200, source: 'combat_drops' },
  ],
  'prayer_wilds_chaos_altar': [
    { resource: 'Dragon bones', perHour: 500, source: 'combat_drops' },
  ],
  'prayer_ensouled_heads': [
    { resource: 'Ensouled head', perHour: 150, source: 'combat_drops' },
    { resource: 'Nature rune', perHour: 150, source: 'runecrafting' },
  ],

  // COOKING — consumes raw fish
  'cooking_shrimp_basic': [
    { resource: 'Raw shrimp', perHour: 800, source: 'fishing' },
  ],
  'cooking_wines': [
    { resource: 'Grapes', perHour: 3000, source: 'shop' },
    { resource: 'Jug of water', perHour: 3000, source: 'shop' },
  ],
  'cooking_sharks': [
    { resource: 'Raw shark', perHour: 1200, source: 'fishing' },
  ],
  'cooking_karambwan_1tick': [
    { resource: 'Raw karambwan', perHour: 3500, source: 'fishing' },
  ],
  'cooking_wilds_campfire': [
    { resource: 'Raw fish (any)', perHour: 1500, source: 'fishing' },
  ],

  // SMITHING — consumes ore/bars
  'smithing_bronze_bars': [
    { resource: 'Copper ore', perHour: 400, source: 'mining' },
    { resource: 'Tin ore', perHour: 400, source: 'mining' },
  ],
  'smithing_gold_blast_furnace': [
    { resource: 'Gold ore', perHour: 5000, source: 'mining' },
  ],
  'smithing_platebodies': [
    { resource: 'Iron bar', perHour: 1250, source: 'smithing' },
  ],
  'smithing_cannonballs': [
    { resource: 'Steel bar', perHour: 600, source: 'smithing' },
  ],
  'smithing_wilds_anvil': [
    { resource: 'Iron bar', perHour: 300, source: 'mining' },
  ],

  // HERBLORE — consumes herbs + secondaries
  'herblore_attack_potions': [
    { resource: 'Grimy herb (low)', perHour: 350, source: 'farming' },
  ],
  'herblore_prayer_potions': [
    { resource: 'Grimy herb (mid)', perHour: 700, source: 'farming' },
  ],
  'herblore_super_combat': [
    { resource: 'Grimy herb (high)', perHour: 900, source: 'farming' },
  ],
  'herblore_cleaning_herbs': [
    { resource: 'Grimy herb (low)', perHour: 5000, source: 'farming' },
  ],
  'herblore_wilds_potions': [
    // Self-sufficient: gathers herbs on-site, so lighter input requirement
    { resource: 'Grimy herb (low)', perHour: 100, source: 'farming' },
  ],

  // CRAFTING — consumes hides/bars/materials
  'crafting_leather': [
    { resource: 'Cowhide', perHour: 700, source: 'combat_drops' },
  ],
  'crafting_gold_jewelry': [
    { resource: 'Gold bar', perHour: 1400, source: 'smithing' },
  ],
  'crafting_dhide_bodies': [
    { resource: 'Green dragonhide', perHour: 900, source: 'combat_drops' },
  ],
  // Glassblowing has no external input requirement (self-gathered sand+seaweed)
  'crafting_wilds_dragonhide_tanning': [
    { resource: 'Green dragonhide', perHour: 1200, source: 'combat_drops' },
  ],

  // FLETCHING — consumes logs/materials
  'fletching_arrow_shafts': [
    { resource: 'Logs', perHour: 400, source: 'woodcutting' },
  ],
  'fletching_yew_longbows': [
    { resource: 'Yew logs', perHour: 1400, source: 'woodcutting' },
  ],
  'fletching_broad_bolts': [
    // Broad bolts bought from slayer master, cost captured in costPerHour
  ],
  'fletching_dragon_darts': [
    // Dragon dart tips bought/dropped, cost captured in costPerHour
  ],
  'fletching_wilds_javelin_shafts': [
    { resource: 'Logs', perHour: 600, source: 'woodcutting' },
  ],

  // CONSTRUCTION — consumes planks (modeled as logs + gold)
  'construction_crude_chairs': [
    { resource: 'Logs', perHour: 200, source: 'woodcutting' },
  ],
  'construction_oak_larders': [
    { resource: 'Oak logs', perHour: 2000, source: 'woodcutting' },
  ],
  'construction_mahogany_tables': [
    { resource: 'Mahogany logs', perHour: 3000, source: 'woodcutting' },
  ],
  'construction_teak_benches': [
    { resource: 'Teak logs', perHour: 2000, source: 'woodcutting' },
  ],
  'construction_wilds_fortifications': [
    { resource: 'Logs', perHour: 500, source: 'woodcutting' },
  ],
  // Sawmill contracts produce gold, no external input
  'construction_sawmill_contracts': [],

  // FIREMAKING — consumes logs
  'firemaking_normal_logs': [
    { resource: 'Logs', perHour: 500, source: 'woodcutting' },
  ],
  'firemaking_maple_logs': [
    { resource: 'Maple logs', perHour: 800, source: 'woodcutting' },
  ],
  // Wintertodt is self-contained (chop + burn inside the boss)
  'firemaking_wintertodt': [],
  'firemaking_redwood_pyre': [
    { resource: 'Redwood logs', perHour: 600, source: 'woodcutting' },
  ],
  'firemaking_wilds_bonfires': [
    { resource: 'Logs', perHour: 400, source: 'woodcutting' },
  ],
  'firemaking_shade_burning': [
    { resource: 'Shade remains', perHour: 200, source: 'combat_drops' },
    { resource: 'Logs', perHour: 200, source: 'woodcutting' },
  ],

  // RUNECRAFTING — consumes pure essence / dense essence
  'runecrafting_air_runes': [
    { resource: 'Pure essence', perHour: 1200, source: 'mining' },
  ],
  'runecrafting_lava_runes': [
    { resource: 'Pure essence', perHour: 3000, source: 'mining' },
  ],
  'runecrafting_blood_runes': [
    // Self-sufficient: mines dense essence at the altar
  ],
  'runecrafting_daeyalt_essence': [
    { resource: 'Daeyalt essence', perHour: 600, source: 'mining' },
  ],
  'runecrafting_wilds_abyss': [
    { resource: 'Pure essence', perHour: 2500, source: 'mining' },
  ],

  // MAGIC — consumes runes
  'magic_wind_strike': [
    { resource: 'Air rune', perHour: 600, source: 'runecrafting' },
  ],
  'magic_high_alch': [
    { resource: 'Nature rune', perHour: 1200, source: 'runecrafting' },
  ],
  'magic_burst_spells': [
    { resource: 'Death rune', perHour: 3000, source: 'runecrafting' },
    { resource: 'Blood rune', perHour: 1500, source: 'runecrafting' },
  ],
  'magic_enchanting_bolts': [
    { resource: 'Chaos rune', perHour: 2700, source: 'runecrafting' },
  ],
  'magic_wilds_god_spells': [
    { resource: 'Blood rune', perHour: 2000, source: 'runecrafting' },
  ],

  // COMBAT — consumes food (for dangerous methods)
  'attack_slayer_tasks': [
    { resource: 'food', perHour: 15, source: 'cooking' },
  ],
  'attack_nightmare_zone': [
    // Uses absorption potions (modeled as gold cost, no item input)
  ],
  'attack_wilds_revenants': [
    { resource: 'food', perHour: 40, source: 'cooking' },
  ],
  'strength_hill_giants': [
    { resource: 'food', perHour: 5, source: 'cooking' },
  ],
  'strength_wilderness_bosses': [
    { resource: 'food', perHour: 50, source: 'cooking' },
  ],
  'defence_slayer_def': [
    { resource: 'food', perHour: 15, source: 'cooking' },
  ],
  'defence_chinchompa_stacking': [
    { resource: 'Red chinchompa', perHour: 3000, source: 'hunter' },
  ],
  'defence_wilds_abyss_training': [
    { resource: 'food', perHour: 20, source: 'cooking' },
  ],
  'hitpoints_slayer_hp': [
    { resource: 'food', perHour: 15, source: 'cooking' },
  ],
  'hitpoints_wilds_green_dragons': [
    { resource: 'food', perHour: 25, source: 'cooking' },
  ],
  'hitpoints_raids_hp': [
    { resource: 'food', perHour: 60, source: 'cooking' },
  ],
  'ranged_sand_crabs_ranged': [],  // crabs don't hit hard
  'slayer_konar_tasks': [
    { resource: 'food', perHour: 15, source: 'cooking' },
  ],
  'slayer_nieve_tasks': [
    { resource: 'food', perHour: 20, source: 'cooking' },
  ],
  'slayer_boss_tasks': [
    { resource: 'food', perHour: 40, source: 'cooking' },
  ],
  'slayer_wilds_tasks': [
    { resource: 'food', perHour: 30, source: 'cooking' },
  ],
};

// -- Combat Drop Tables --------------------------------------------------------
// What combat methods PRODUCE (beyond the resourceOutput already defined).
// This supplements the existing produces[] data to track specific item types.
const COMBAT_DROPS = {
  'attack_chickens': { bones: 'Bones', bonesPerHour: 120 },
  'attack_cows': { bones: 'Bones', bonesPerHour: 100, hides: 'Cowhide', hidesPerHour: 100 },
  'attack_slayer_tasks': { bones: 'Big bones', bonesPerHour: 50, goldPerHour: 40000 },
  'attack_wilds_revenants': { goldPerHour: 80000 },
  'strength_hill_giants': { bones: 'Big bones', bonesPerHour: 80 },
  'strength_wilderness_bosses': { bones: 'Dragon bones', bonesPerHour: 30, goldPerHour: 120000 },
  'strength_obsidian_training': {},
  'strength_sand_crabs': {},
  'defence_sand_crabs_def': {},
  'defence_slayer_def': { bones: 'Big bones', bonesPerHour: 40, goldPerHour: 30000 },
  'defence_chinchompa_stacking': {},
  'defence_pest_control': {},
  'defence_wilds_abyss_training': {},
  'hitpoints_passive_combat': { bones: 'Bones', bonesPerHour: 30 },
  'hitpoints_nmz_absorption': {},
  'hitpoints_slayer_hp': { bones: 'Big bones', bonesPerHour: 40, goldPerHour: 30000 },
  'hitpoints_wilds_green_dragons': { bones: 'Dragon bones', bonesPerHour: 80, hides: 'Green dragonhide', hidesPerHour: 80 },
  'hitpoints_raids_hp': { goldPerHour: 100000 },
  'ranged_safe_spot_ogres': { bones: 'Big bones', bonesPerHour: 20 },
  'ranged_sand_crabs_ranged': {},
  'slayer_turael_tasks': { bones: 'Bones', bonesPerHour: 30 },
  'slayer_konar_tasks': { bones: 'Big bones', bonesPerHour: 40, goldPerHour: 30000 },
  'slayer_nieve_tasks': { bones: 'Big bones', bonesPerHour: 50, goldPerHour: 50000 },
  'slayer_boss_tasks': { bones: 'Dragon bones', bonesPerHour: 20, goldPerHour: 200000 },
  'slayer_wilds_tasks': { bones: 'Big bones', bonesPerHour: 40, goldPerHour: 100000 },
};

// -- Food Abstraction ----------------------------------------------------------
// For combat food consumption, the sim tracks "food" as a generic resource.
// When the agent needs food, it checks what cooked food is in inventory and
// consumes from the best available tier downward.
const FOOD_TIERS = [
  { name: 'Dark crab', heal: 22, cookLevel: 90, rawName: 'Raw dark crab' },
  { name: 'Anglerfish', heal: 22, cookLevel: 84, rawName: 'Raw anglerfish' },
  { name: 'Shark', heal: 20, cookLevel: 80, rawName: 'Raw shark' },
  { name: 'Monkfish', heal: 16, cookLevel: 62, rawName: 'Raw monkfish' },
  { name: 'Karambwan', heal: 18, cookLevel: 30, rawName: 'Raw karambwan' },
  { name: 'Bass', heal: 13, cookLevel: 43, rawName: 'Raw bass' },
  { name: 'Tuna', heal: 10, cookLevel: 30, rawName: 'Raw tuna' },
  { name: 'Lobster', heal: 12, cookLevel: 40, rawName: 'Raw lobster' },
  { name: 'Trout', heal: 7, cookLevel: 15, rawName: 'Raw trout' },
  { name: 'Herring', heal: 5, cookLevel: 5, rawName: 'Raw herring' },
  { name: 'Sardine', heal: 3, cookLevel: 1, rawName: 'Raw sardine' },
  { name: 'Cooked shrimp', heal: 3, cookLevel: 1, rawName: 'Raw shrimp' },
];

// -- Simulated Player ----------------------------------------------------------
function createSimPlayer() {
  const skills = {};
  for (const s of SKILLS) skills[s] = { xp: 0, level: 1 };
  skills.hitpoints = { xp: xpForLevel(10), level: 10 };

  return {
    skills,
    gold: 0,
    inventory: {},           // itemName -> quantity
    questsComplete: new Set(),
    areasUnlocked: new Set(['heartlands']),
    itemsOwned: new Set(),
    totalHours: 0,
    breakpointsHit: [],
    methodsUsed: new Set(),
    log: [],
    // Tracking
    skillHours: {},          // skill -> hours spent
    resourcesProduced: {},   // itemName -> total produced
    resourcesConsumed: {},   // itemName -> total consumed
    resourceDeficits: [],    // [{ hour, method, resource, needed, had }]
    goldEarned: 0,
    goldSpent: 0,
  };
}

function getLevel(player, skill) { return player.skills[skill]?.level || 1; }

function addXp(player, skill, amount) {
  const s = player.skills[skill];
  if (!s) return;
  s.xp += amount;
  const newLvl = levelForXp(s.xp);
  if (newLvl > s.level) {
    const oldLvl = s.level;
    s.level = newLvl;
    return { skill, oldLvl, newLvl };
  }
  return null;
}

// -- Inventory Operations -------------------------------------------------------
function addItem(player, name, qty) {
  if (qty <= 0) return;
  player.inventory[name] = (player.inventory[name] || 0) + qty;
  player.resourcesProduced[name] = (player.resourcesProduced[name] || 0) + qty;
}

function removeItem(player, name, qty) {
  if (qty <= 0) return true;
  const have = player.inventory[name] || 0;
  if (have >= qty) {
    player.inventory[name] = have - qty;
    if (player.inventory[name] <= 0) delete player.inventory[name];
    player.resourcesConsumed[name] = (player.resourcesConsumed[name] || 0) + qty;
    return true;
  }
  return false;
}

function hasItem(player, name, qty) {
  return (player.inventory[name] || 0) >= qty;
}

function addGold(player, amount) {
  if (amount <= 0) return;
  player.gold += amount;
  player.goldEarned += amount;
}

function spendGold(player, amount) {
  if (amount <= 0) return true;
  if (player.gold >= amount) {
    player.gold -= amount;
    player.goldSpent += amount;
    return true;
  }
  return false;
}

// Buy items from the "GE" using gold.
function buyItem(player, name, qty) {
  const price = ITEM_PRICES[name] || 100;
  const cost = price * qty;
  if (player.gold >= cost) {
    spendGold(player, cost);
    addItem(player, name, qty);
    return true;
  }
  return false;
}

// Sell items for gold.
function sellItem(player, name, qty) {
  const have = player.inventory[name] || 0;
  const toSell = Math.min(have, qty);
  if (toSell <= 0) return 0;
  const price = ITEM_PRICES[name] || 50;
  removeItem(player, name, toSell);
  addGold(player, Math.floor(price * toSell * 0.95));  // 5% GE tax
  return toSell;
}

// Consume food: eat from best available tier. Returns number consumed.
function consumeFood(player, qty) {
  let remaining = qty;
  for (const tier of FOOD_TIERS) {
    if (remaining <= 0) break;
    const have = player.inventory[tier.name] || 0;
    if (have > 0) {
      const eat = Math.min(have, remaining);
      removeItem(player, tier.name, eat);
      remaining -= eat;
    }
  }
  // Also check generic "Cooked food" bucket
  if (remaining > 0) {
    const have = player.inventory['Cooked food'] || 0;
    if (have > 0) {
      const eat = Math.min(have, remaining);
      removeItem(player, 'Cooked food', eat);
      remaining -= eat;
    }
  }
  return qty - remaining; // amount actually consumed
}

function totalFoodCount(player) {
  let count = 0;
  for (const tier of FOOD_TIERS) {
    count += (player.inventory[tier.name] || 0);
  }
  count += (player.inventory['Cooked food'] || 0);
  return count;
}

// -- Check if a method's inputs are available -----------------------------------
// Returns { available: bool, missing: [{ resource, needed, had }], canBuy: bool, buyCost: N }
function checkMethodInputs(player, method) {
  const inputs = METHOD_INPUTS[method.id] || [];
  if (inputs.length === 0) return { available: true, missing: [], canBuy: false, buyCost: 0 };

  const missing = [];
  let totalBuyCost = 0;
  let allBuyable = true;

  for (const input of inputs) {
    // Special case: 'food' means any cooked food
    if (input.resource === 'food') {
      const foodCount = totalFoodCount(player);
      if (foodCount < input.perHour) {
        // Can we buy food?
        const deficit = input.perHour - foodCount;
        const foodPrice = 300; // average food cost
        const cost = deficit * foodPrice;
        totalBuyCost += cost;
        if (player.gold < totalBuyCost) {
          allBuyable = false;
        }
        missing.push({ resource: 'food', needed: input.perHour, had: foodCount });
      }
      continue;
    }

    // Special case: 'Raw fish (any)' matches any raw fish
    if (input.resource === 'Raw fish (any)') {
      let totalRaw = 0;
      for (const tier of FOOD_TIERS) {
        totalRaw += (player.inventory[tier.rawName] || 0);
      }
      if (totalRaw < input.perHour) {
        const deficit = input.perHour - totalRaw;
        const cost = deficit * 200;
        totalBuyCost += cost;
        if (player.gold < totalBuyCost) allBuyable = false;
        missing.push({ resource: input.resource, needed: input.perHour, had: totalRaw });
      }
      continue;
    }

    const have = player.inventory[input.resource] || 0;
    if (have < input.perHour) {
      const deficit = input.perHour - have;
      const price = ITEM_PRICES[input.resource] || 100;
      const cost = deficit * price;
      totalBuyCost += cost;
      if (player.gold < totalBuyCost) {
        allBuyable = false;
      }
      missing.push({ resource: input.resource, needed: input.perHour, had: have });
    }
  }

  return {
    available: missing.length === 0,
    missing,
    canBuy: allBuyable && missing.length > 0,
    buyCost: totalBuyCost,
  };
}

// -- Apply method effects: consume inputs, produce outputs ----------------------
function applyMethodEffects(player, method) {
  const inputs = METHOD_INPUTS[method.id] || [];

  // Consume inputs
  for (const input of inputs) {
    if (input.resource === 'food') {
      const ate = consumeFood(player, input.perHour);
      if (ate < input.perHour) {
        // Buy remaining food
        const deficit = input.perHour - ate;
        buyItem(player, 'Lobster', deficit);
        consumeFood(player, deficit);
      }
      continue;
    }
    if (input.resource === 'Raw fish (any)') {
      // Consume from lowest tier raw fish first
      let remaining = input.perHour;
      for (let i = FOOD_TIERS.length - 1; i >= 0 && remaining > 0; i--) {
        const raw = FOOD_TIERS[i].rawName;
        const have = player.inventory[raw] || 0;
        if (have > 0) {
          const take = Math.min(have, remaining);
          removeItem(player, raw, take);
          remaining -= take;
        }
      }
      if (remaining > 0) buyItem(player, 'Raw shrimp', remaining);
      continue;
    }

    const have = player.inventory[input.resource] || 0;
    if (have >= input.perHour) {
      removeItem(player, input.resource, input.perHour);
    } else {
      // Use what we have, buy the rest
      if (have > 0) removeItem(player, input.resource, have);
      const deficit = input.perHour - have;
      buyItem(player, input.resource, deficit);
      removeItem(player, input.resource, deficit);
    }
  }

  // Produce outputs from resourceOutput.produces
  const produces = method.resourceOutput?.produces || [];
  for (const p of produces) {
    if (p.perHour > 0 && p.name) {
      addItem(player, p.name, p.perHour);
    }
  }

  // Combat drops: bones, hides, gold
  const drops = COMBAT_DROPS[method.id];
  if (drops) {
    if (drops.bones && drops.bonesPerHour) {
      addItem(player, drops.bones, drops.bonesPerHour);
    }
    if (drops.hides && drops.hidesPerHour) {
      addItem(player, drops.hides, drops.hidesPerHour);
    }
    if (drops.goldPerHour) {
      addGold(player, drops.goldPerHour);
    }
  }

  // Gold from costPerHour
  const cost = method.costPerHour || 0;
  if (cost < 0) {
    // Profitable method: generate gold
    addGold(player, Math.abs(cost));
  } else if (cost > 0) {
    // Costly method: spend gold (or go into "debt" — the sim is lenient)
    spendGold(player, cost);
  }
}

// -- Agent Strategy (Supply-Chain Aware) ----------------------------------------
// The agent now considers:
//   1. What skill would unlock the most downstream content? (existing)
//   2. Do I have the inputs to train this skill? (new constraint)
//   3. Should I train a producer skill to supply a consumer skill? (new routing)

function findAccessibleAreas(player) {
  const newAreas = [];
  for (const [areaId, gate] of rel.listAreaGates()) {
    if (player.areasUnlocked.has(areaId)) continue;
    const reqs = gate.requires;
    let canAccess = true;
    for (const [skill, lvl] of Object.entries(reqs.skills || {})) {
      if (getLevel(player, skill) < lvl) { canAccess = false; break; }
    }
    if (canAccess) {
      for (const qId of (reqs.quests || [])) {
        if (!player.questsComplete.has(qId)) { canAccess = false; break; }
      }
    }
    if (canAccess) newAreas.push(areaId);
  }
  return newAreas;
}

function findAvailableMethods(player) {
  const methods = [];
  for (const skill of SKILLS) {
    const lvl = getLevel(player, skill);
    const available = rel.listMethodsInRange(skill, lvl);
    for (const m of available) {
      let canUse = true;
      const prereqs = m.prerequisites || {};
      for (const [sk, req] of Object.entries(prereqs.skills || {})) {
        if (getLevel(player, sk) < req) { canUse = false; break; }
      }
      if (canUse) {
        for (const qId of (prereqs.quests || [])) {
          if (!player.questsComplete.has(qId)) { canUse = false; break; }
        }
      }
      if (canUse) {
        for (const aId of (prereqs.areas || [])) {
          if (!player.areasUnlocked.has(aId)) { canUse = false; break; }
        }
      }
      if (canUse) methods.push(m);
    }
  }
  return methods;
}

function scoreMethod(player, method) {
  const skill = method.skill;
  const currentLvl = getLevel(player, skill);
  const xpPerHour = Array.isArray(method.xpPerHour)
    ? (method.xpPerHour[0] + method.xpPerHour[1]) / 2
    : method.xpPerHour;

  // Skip skills already at 99
  if (currentLvl >= 99) return -1;

  // -- Downstream content value (existing logic) --
  const nearBreakpoints = rel.getBreakpointsForSkill(skill)
    .filter(bp => bp.trigger.level > currentLvl && bp.trigger.level <= currentLvl + 10);

  let gatesNeedingSkill = 0;
  for (const [, gate] of rel.listAreaGates()) {
    const req = gate.requires.skills?.[skill];
    if (req && req > currentLvl && !player.areasUnlocked.has(gate.name)) {
      gatesNeedingSkill++;
    }
  }

  const attentionScore = { afk: 0.8, low: 0.9, medium: 1.0, high: 1.1, maximum: 1.0 };

  // -- Supply chain check --
  const inputCheck = checkMethodInputs(player, method);
  let supplyPenalty = 0;
  let supplyBonus = 0;

  if (!inputCheck.available && !inputCheck.canBuy) {
    // Hard block: cannot do this at all
    supplyPenalty = 10000;
  } else if (!inputCheck.available && inputCheck.canBuy) {
    // Can buy inputs -- penalize proportional to cost, making self-supply attractive
    supplyPenalty = Math.min(200, inputCheck.buyCost / 10000);
  }

  // -- Producer bonus: if consumers are starved, boost producer score --
  if (PRODUCER_SKILLS.has(skill)) {
    const produces = method.resourceOutput?.produces || [];
    for (const p of produces) {
      // Is any consumer method waiting for this resource?
      for (const [, inputs] of Object.entries(METHOD_INPUTS)) {
        for (const inp of inputs) {
          if (inp.resource === p.name && (player.inventory[p.name] || 0) < inp.perHour * 3) {
            supplyBonus += 25;  // Strong bonus for feeding a starved consumer
          }
        }
      }
    }
    // General producer bonus: gathering skills should always feel attractive
    if ((player.inventory['Logs'] || 0) < 1000 && skill === 'woodcutting') supplyBonus += 15;
    if ((player.inventory['Copper ore'] || 0) + (player.inventory['Iron ore'] || 0) < 500 && skill === 'mining') supplyBonus += 15;
  }

  // -- Combat methods get bonus if they produce needed resources --
  if (COMBAT_SKILLS.has(skill) || skill === 'slayer') {
    const drops = COMBAT_DROPS[method.id];
    if (drops) {
      if (drops.bones) {
        const boneCount = player.inventory[drops.bones] || 0;
        if (boneCount < 1000) supplyBonus += 20;
      }
      if (drops.hides) {
        const hideCount = player.inventory[drops.hides] || 0;
        if (hideCount < 500) supplyBonus += 15;
      }
      if (drops.goldPerHour && player.gold < 1000000) {
        supplyBonus += 25;
      }
    }
  }

  // -- Gold urgency: if gold is low and this method is profitable --
  if (method.costPerHour < 0 && player.gold < 500000) {
    supplyBonus += 40;
  }

  // -- Diversification: STRONG bonus for untrained/undertrained skills --
  // A real OSRS player naturally diversifies. The sim should too.
  const hoursOnSkill = player.skillHours?.[skill] || 0;
  const totalHours = Math.max(player.totalHours, 1);
  let diversityBonus = 0;

  // Phase 1 (hours 0-100): Strong push to try every skill at least once
  // Phase 2 (hours 100-300): Balance between diversification and depth
  // Phase 3 (hours 300+): Let the best methods win, but keep nudging neglected skills
  if (hoursOnSkill === 0) {
    // Never trained: BIG bonus that stays strong throughout the simulation.
    // A real OSRS player would feel bad seeing a skill at level 1 forever.
    // Early game: 100 points. By hour 300: 70 points. By hour 500: 50.
    diversityBonus = Math.max(50, 100 - totalHours * 0.1);
  } else {
    // Trained but undertrained: bonus inversely proportional to time spent
    const shareOfTime = hoursOnSkill / totalHours;
    const fairShare = 1 / SKILLS.length;  // ~4.3%
    if (shareOfTime < fairShare * 0.5) {
      // This skill has less than half its fair share of time
      diversityBonus = 30;
    } else if (shareOfTime < fairShare) {
      diversityBonus = 15;
    }
    // Penalty for hogging: skill with >20% of total time gets reduced priority
    if (shareOfTime > 0.20) {
      supplyPenalty += 30;
    }
  }

  // -- Skill-level milestone bonus: nudge toward round numbers --
  // Getting a skill to 10, 20, 30... feels good and often unlocks new methods
  const nextMilestone = Math.ceil(currentLvl / 10) * 10;
  if (nextMilestone <= 50 && currentLvl < nextMilestone) {
    const hoursToMilestone = (xpForLevel(nextMilestone) - xpForLevel(currentLvl)) / (xpPerHour || 1);
    if (hoursToMilestone < 5) {
      diversityBonus += 20;  // Close to a milestone, push for it
    }
  }

  // -- Food urgency: if low on food and this produces food --
  const foodCount = totalFoodCount(player);
  if (foodCount < 200) {
    if (skill === 'fishing') supplyBonus += 35;
    if (skill === 'cooking') supplyBonus += 30;
  }

  // -- Consumer skills need their supply chain to be established --
  // Penalize consumers if their producers haven't been trained at all
  if (CONSUMER_SKILLS.has(skill)) {
    const inputs = METHOD_INPUTS[method.id] || [];
    for (const inp of inputs) {
      const sourceSkill = inp.source;
      if (sourceSkill && player.skillHours?.[sourceSkill] === 0) {
        // The source skill hasn't been trained at all -- penalize trying to consume
        supplyPenalty += 15;
      }
    }
  }

  return (
    (nearBreakpoints.length * 50) +
    (gatesNeedingSkill * 30) +
    Math.min(xpPerHour / 1000, 100) +  // Cap XP influence so it doesn't dominate
    (attentionScore[method.attention] || 1) * 10 +
    (method.costPerHour < 0 ? 15 : 0) +
    supplyBonus +
    diversityBonus -
    supplyPenalty
  );
}

// -- Simplified Quest Completion ------------------------------------------------
// The sim doesn't model full quest content, but we auto-complete quests when
// the player meets the approximate skill requirements. This unlocks downstream
// content (training methods, areas) that are quest-gated.
//
// We maintain a registry of known quests with their simplified requirements.
// These are extracted from training method prerequisites and area gates.

const QUEST_REQS = {
  // Core progression quests
  'druidic_ritual': { skills: { herblore: 1 }, description: 'Unlocks Herblore skill' },
  'rune_mysteries': { skills: { mining: 1 }, description: 'Unlocks Runecrafting altars' },
  'enter_the_abyss': { skills: { mining: 5, runecrafting: 1 }, description: 'Unlocks Abyss RC route' },
  'desert_treasure': { skills: { magic: 50, thieving: 53, mining: 10 }, description: 'Unlocks Ancient Magicks' },
  'moryskah_requiem': { skills: { magic: 40, attack: 30 }, description: 'Unlocks Moryskah content' },
  'moryskah_haunting': { skills: { cooking: 10, crafting: 10 }, description: 'Unlocks Ectofuntus' },
  'bone_voyage': { skills: { mining: 20, farming: 15 }, description: 'Unlocks Fossil Island' },
  'mage_arena': { skills: { magic: 60 }, description: 'Unlocks God spells' },
  'swan_song': { skills: { fishing: 62, cooking: 62, magic: 66 }, description: 'Unlocks Monkfish' },
  'tai_bwo_wannai_trio': { skills: { cooking: 30, fishing: 30, agility: 15 }, description: 'Unlocks Karambwan' },
  'the_green_thumb': { skills: { farming: 30 }, description: 'Unlocks Farming guild' },
  'dwarf_cannon_quest': { skills: { smithing: 30 }, description: 'Unlocks Cannonballs' },
  'feud_quest': { skills: { thieving: 30 }, description: 'Unlocks Blackjacking' },
  'sins_of_the_father': { skills: { mining: 60, attack: 50, magic: 50 }, description: 'Unlocks Daeyalt essence' },
  'shades_of_mortton': { skills: { firemaking: 20, crafting: 20 }, description: 'Unlocks Shade cremation' },
  // Generic quests referenced by area gates
  'tidal_passage': { skills: { fishing: 30, agility: 20 }, description: 'Unlocks Saltbrine areas' },
  'moryskah_gates': { skills: { magic: 20, prayer: 15 }, description: 'Unlocks Moryskah' },
  'roots_of_the_old_growth': { skills: { farming: 40, woodcutting: 30 }, description: 'Unlocks Veilwood Druid Circle' },
  'the_anglers_challenge': { skills: { fishing: 50, cooking: 40 }, description: 'Unlocks Saltbrine Deep Waters' },
  'crystal_of_seren': { skills: { agility: 50, mining: 50, construction: 50 }, description: 'Unlocks crystal city' },
};

function tryCompleteQuests(player, hour, report, verbose) {
  for (const [questId, reqs] of Object.entries(QUEST_REQS)) {
    if (player.questsComplete.has(questId)) continue;
    let canComplete = true;
    for (const [skill, lvl] of Object.entries(reqs.skills || {})) {
      if (getLevel(player, skill) < lvl) { canComplete = false; break; }
    }
    if (canComplete) {
      player.questsComplete.add(questId);
      report.timeline.push({
        hour, type: 'quest_complete', id: questId,
        description: reqs.description,
      });
      if (verbose) {
        console.log(`[${hour}h] QUEST COMPLETE: ${questId} -- ${reqs.description}`);
      }
    }
  }
}

// -- Main Simulation Loop -------------------------------------------------------

function simulate(maxHours = 500, verbose = false) {
  const player = createSimPlayer();
  for (const s of SKILLS) player.skillHours[s] = 0;

  const report = {
    deadZones: [],
    deadMethods: new Set(),
    danglingPrereqs: [],
    degenerateMethods: [],
    missingCoverage: [],
    bottlenecks: [],
    routingSnapshots: [],
    timeline: [],
    totalHours: 0,
    finalLevels: {},
    areasUnlocked: [],
    questsComplete: [],
    breakpointsHit: [],
    // New supply chain reports
    supplyChainFlow: { produced: {}, consumed: {} },
    skillDiversity: {},
    resourceDeficits: [],
    goldSummary: { earned: 0, spent: 0, final: 0 },
    inventorySummary: {},
  };

  let lastBreakpointHour = 0;
  let allMethodIds = new Set();

  for (const skill of SKILLS) {
    for (const m of rel.listMethodsForSkill(skill)) {
      allMethodIds.add(m.id);
    }
  }

  // -- Tick loop (1 tick = 1 simulated hour) --
  for (let hour = 0; hour < maxHours; hour++) {
    player.totalHours = hour;

    // 1. Unlock any newly accessible areas
    const newAreas = findAccessibleAreas(player);
    for (const areaId of newAreas) {
      player.areasUnlocked.add(areaId);
      const gate = rel.getAreaGate(areaId);
      const entry = { hour, type: 'area_unlock', id: areaId, name: gate?.name || areaId };
      report.timeline.push(entry);
      if (verbose) console.log(`[${hour}h] AREA UNLOCKED: ${gate?.name || areaId}`);
    }

    // 2. Auto-complete quests whose skill prereqs are met
    //    Simplified: if we know a quest exists (referenced in method prereqs or area gates),
    //    we check if the player meets minimum skill reqs and auto-complete it.
    //    This unlocks downstream content that is quest-gated.
    tryCompleteQuests(player, hour, report, verbose);

    // 3. Periodically sell excess inventory to convert to gold
    if (hour % 10 === 0 && hour > 0) {
      for (const [item, qty] of Object.entries(player.inventory)) {
        if (qty > 2000 && ITEM_PRICES[item]) {
          const excess = qty - 1000;
          sellItem(player, item, excess);
        }
      }
    }

    // 4. Pick best training method (supply-chain aware)
    const available = findAvailableMethods(player);
    if (available.length === 0) {
      report.timeline.push({ hour, type: 'stuck', description: 'No training methods available' });
      if (verbose) console.log(`[${hour}h] STUCK: No training methods available!`);
      break;
    }

    // Score and sort
    const scored = available.map(m => ({ method: m, score: scoreMethod(player, m) }));
    scored.sort((a, b) => b.score - a.score);

    // Filter out hard-blocked methods (score === -1 or extremely negative)
    const viable = scored.filter(s => s.score > -100);
    if (viable.length === 0) {
      // Everything is blocked. Force a producer/money-maker.
      // Find the simplest AFK method that requires no inputs.
      const fallback = scored.find(s => {
        const inputs = METHOD_INPUTS[s.method.id] || [];
        return inputs.length === 0 && s.score > -1;
      });
      if (fallback) {
        viable.push(fallback);
      } else {
        // Absolute fallback: do whatever is at the top
        viable.push(scored[0]);
      }
    }

    // Record routing diversity
    const topScore = viable[0].score;
    const nearTop = viable.filter(s => s.score >= topScore * 0.8);
    if (hour % 50 === 0) {
      report.routingSnapshots.push({
        hour,
        viableOptions: nearTop.length,
        topMethods: nearTop.slice(0, 5).map(s =>
          `${s.method.skill}/${s.method.name} (${s.score.toFixed(0)})`),
        gold: player.gold,
        foodCount: totalFoodCount(player),
      });
    }

    // Pick top method
    const chosen = viable[0].method;
    player.methodsUsed.add(chosen.id);
    player.skillHours[chosen.skill] = (player.skillHours[chosen.skill] || 0) + 1;

    // Check and record supply chain deficits
    const inputCheck = checkMethodInputs(player, chosen);
    if (!inputCheck.available) {
      for (const m of inputCheck.missing) {
        player.resourceDeficits.push({
          hour,
          method: chosen.name,
          skill: chosen.skill,
          resource: m.resource,
          needed: m.needed,
          had: m.had,
          boughtWithGold: inputCheck.canBuy,
        });
      }
    }

    // Apply method effects (consume inputs, produce outputs)
    applyMethodEffects(player, chosen);

    // Apply XP
    const xpPerHour = Array.isArray(chosen.xpPerHour)
      ? (chosen.xpPerHour[0] + chosen.xpPerHour[1]) / 2
      : chosen.xpPerHour;

    const levelUp = addXp(player, chosen.skill, xpPerHour);

    if (verbose) {
      console.log(`[${hour}h] ${chosen.skill.padEnd(14)} via ${chosen.name.padEnd(30)} | ` +
        `Gold: ${(player.gold / 1000).toFixed(0)}k | Food: ${totalFoodCount(player)} | ` +
        `Bones: ${(player.inventory['Bones'] || 0) + (player.inventory['Big bones'] || 0) + (player.inventory['Dragon bones'] || 0)} | ` +
        `Ore: ${(player.inventory['Copper ore'] || 0) + (player.inventory['Iron ore'] || 0) + (player.inventory['Gold ore'] || 0)}`);
    }

    if (levelUp) {
      if (verbose && levelUp.newLvl % 10 === 0) {
        console.log(`  >> ${chosen.skill} ${levelUp.oldLvl} -> ${levelUp.newLvl} (via ${chosen.name})`);
      }

      const bps = rel.getBreakpointsForSkill(chosen.skill)
        .filter(bp => bp.trigger.level > levelUp.oldLvl && bp.trigger.level <= levelUp.newLvl);

      for (const bp of bps) {
        player.breakpointsHit.push({ hour, ...bp });
        report.breakpointsHit.push({ hour, ...bp });
        report.timeline.push({
          hour, type: 'breakpoint',
          skill: chosen.skill, level: bp.trigger.level,
          description: bp.description,
          importance: bp.importance,
        });

        if (verbose && bp.importance !== 'minor') {
          const tag = bp.importance === 'transformative' ? '***' : '**';
          console.log(`  ${tag} BREAKPOINT: ${chosen.skill} ${bp.trigger.level} -- ${bp.description}`);
        }

        const gap = hour - lastBreakpointHour;
        if (gap > 5 && lastBreakpointHour > 0) {
          report.deadZones.push({
            fromHour: lastBreakpointHour,
            toHour: hour,
            gapHours: gap,
            description: `${gap} hours between breakpoints (${chosen.skill} ${levelUp.oldLvl}->${levelUp.newLvl})`,
          });
        }
        lastBreakpointHour = hour;
      }
    }

    // Check if all skills hit 99
    const allMaxed = SKILLS.every(s => getLevel(player, s) >= 99);
    if (allMaxed) {
      report.timeline.push({ hour, type: 'maxed', description: 'All skills level 99!' });
      if (verbose) console.log(`[${hour}h] *** ALL SKILLS MAXED ***`);
      break;
    }
  }

  // -- Post-simulation analysis -------------------------------------------------

  report.totalHours = player.totalHours;
  report.areasUnlocked = [...player.areasUnlocked];
  report.questsComplete = [...player.questsComplete];
  for (const s of SKILLS) report.finalLevels[s] = getLevel(player, s);

  // Dead methods
  for (const mId of allMethodIds) {
    if (!player.methodsUsed.has(mId)) {
      const m = rel.getTrainingMethod(mId);
      if (m) report.deadMethods.add(`${m.skill}/${m.name} (${m.attention}, ${m.xpPerHour} xp/hr)`);
    }
  }

  // Missing coverage
  for (const skill of SKILLS) {
    const methods = rel.listMethodsForSkill(skill);
    for (let bracket = 1; bracket <= 90; bracket += 10) {
      const inBracket = methods.filter(m =>
        m.levelRange[0] <= bracket + 9 && m.levelRange[1] >= bracket
      );
      if (inBracket.length < 2) {
        report.missingCoverage.push({
          skill, bracket: `${bracket}-${bracket + 9}`,
          methodCount: inBracket.length,
          methods: inBracket.map(m => m.name),
        });
      }
      const hasAfk = inBracket.some(m => m.attention === 'afk' || m.attention === 'low');
      if (!hasAfk && inBracket.length > 0) {
        report.missingCoverage.push({
          skill, bracket: `${bracket}-${bracket + 9}`,
          issue: 'No AFK/low-attention method',
          methods: inBracket.map(m => `${m.name} (${m.attention})`),
        });
      }
    }
  }

  // Degenerate methods
  for (const skill of SKILLS) {
    const methods = rel.listMethodsForSkill(skill);
    for (let i = 0; i < methods.length; i++) {
      for (let j = i + 1; j < methods.length; j++) {
        const a = methods[i], b = methods[j];
        if (a.levelRange[1] < b.levelRange[0] || b.levelRange[1] < a.levelRange[0]) continue;
        const aXp = Array.isArray(a.xpPerHour) ? a.xpPerHour[1] : a.xpPerHour;
        const bXp = Array.isArray(b.xpPerHour) ? b.xpPerHour[1] : b.xpPerHour;
        const attRank = { afk: 1, low: 2, medium: 3, high: 4, maximum: 5 };
        const danRank = { none: 1, low: 2, medium: 3, high: 4, extreme: 5 };
        if (aXp >= bXp && a.costPerHour <= b.costPerHour &&
            attRank[a.attention] <= attRank[b.attention] &&
            danRank[a.danger] <= danRank[b.danger] &&
            (aXp > bXp || a.costPerHour < b.costPerHour || attRank[a.attention] < attRank[b.attention])) {
          report.degenerateMethods.push({
            skill,
            better: `${a.name} (${a.xpPerHour} xp, ${a.attention}, ${a.costPerHour} gp)`,
            worse: `${b.name} (${b.xpPerHour} xp, ${b.attention}, ${b.costPerHour} gp)`,
          });
        }
      }
    }
  }

  // Dangling prereqs
  for (const [areaId, gate] of rel.listAreaGates()) {
    for (const qId of (gate.requires.quests || [])) {
      const unlock = rel.getQuestUnlocks(qId);
      if (!unlock) {
        report.danglingPrereqs.push({
          type: 'area_gate_quest',
          areaId,
          areaName: gate.name,
          missingQuest: qId,
          description: `Area "${gate.name}" requires quest "${qId}" which has no unlock entry`,
        });
      }
    }
  }

  // Bottleneck analysis
  const skillBlockCount = {};
  for (const s of SKILLS) skillBlockCount[s] = 0;
  for (const [, gate] of rel.listAreaGates()) {
    for (const [skill] of Object.entries(gate.requires.skills || {})) {
      skillBlockCount[skill] = (skillBlockCount[skill] || 0) + 1;
    }
  }
  const sortedBlockers = Object.entries(skillBlockCount)
    .filter(([, c]) => c > 0)
    .sort((a, b) => b[1] - a[1]);
  report.bottlenecks = sortedBlockers.map(([skill, count]) => ({ skill, gatesBlocked: count }));

  // -- NEW: Supply Chain Flow --
  report.supplyChainFlow = {
    produced: { ...player.resourcesProduced },
    consumed: { ...player.resourcesConsumed },
  };

  // -- NEW: Skill Diversity --
  report.skillDiversity = {};
  let skillsActuallyTrained = 0;
  for (const s of SKILLS) {
    const hours = player.skillHours[s] || 0;
    if (hours > 0) skillsActuallyTrained++;
    report.skillDiversity[s] = {
      hours,
      percentage: player.totalHours > 0 ? ((hours / player.totalHours) * 100).toFixed(1) : '0.0',
    };
  }
  report.skillDiversity._totalSkillsTrained = skillsActuallyTrained;

  // -- NEW: Resource Deficits --
  // Deduplicate and summarize
  const deficitMap = {};
  for (const d of player.resourceDeficits) {
    const key = `${d.skill}/${d.method}/${d.resource}`;
    if (!deficitMap[key]) {
      deficitMap[key] = { ...d, count: 1 };
    } else {
      deficitMap[key].count++;
    }
  }
  report.resourceDeficits = Object.values(deficitMap).sort((a, b) => b.count - a.count);

  // -- NEW: Gold Summary --
  report.goldSummary = {
    earned: player.goldEarned,
    spent: player.goldSpent,
    final: player.gold,
  };

  // Inventory summary (top items)
  report.inventorySummary = {};
  const sortedInv = Object.entries(player.inventory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30);
  for (const [item, qty] of sortedInv) {
    report.inventorySummary[item] = qty;
  }

  return report;
}

// -- Report Printer -------------------------------------------------------------

function printReport(report) {
  console.log('\n==============================================================');
  console.log('  SCAPE PROGRESSION SIMULATOR -- SUPPLY CHAIN REPORT');
  console.log('==============================================================\n');

  // Summary
  console.log(`Total simulated hours: ${report.totalHours}`);
  console.log(`Areas unlocked: ${report.areasUnlocked.length}/${rel.listAreaGates().length}`);
  console.log(`Breakpoints hit: ${report.breakpointsHit.length}`);
  console.log(`Skills trained: ${report.skillDiversity._totalSkillsTrained}/${SKILLS.length}`);
  console.log(`Gold earned: ${(report.goldSummary.earned / 1000000).toFixed(1)}M | ` +
    `spent: ${(report.goldSummary.spent / 1000000).toFixed(1)}M | ` +
    `final: ${(report.goldSummary.final / 1000000).toFixed(1)}M`);
  console.log(`Relationship data: ${JSON.stringify(rel.stats())}`);
  console.log('');

  // Final levels
  console.log('-- Final Skill Levels -----------------------------------------------');
  const lvlEntries = Object.entries(report.finalLevels).sort((a, b) => b[1] - a[1]);
  for (const [skill, lvl] of lvlEntries) {
    const bar = '#'.repeat(Math.floor(lvl / 5)) + '.'.repeat(20 - Math.floor(lvl / 5));
    console.log(`  ${skill.padEnd(14)} ${String(lvl).padStart(2)} ${bar}`);
  }
  console.log('');

  // Skill diversity (NEW)
  console.log('-- Skill Diversity Score --------------------------------------------');
  console.log(`  Skills trained: ${report.skillDiversity._totalSkillsTrained}/${SKILLS.length}`);
  const divEntries = Object.entries(report.skillDiversity)
    .filter(([k]) => k !== '_totalSkillsTrained')
    .sort((a, b) => b[1].hours - a[1].hours);
  for (const [skill, data] of divEntries) {
    if (data.hours > 0) {
      const pctBar = '#'.repeat(Math.floor(parseFloat(data.percentage) / 5));
      console.log(`  ${skill.padEnd(14)} ${String(data.hours).padStart(4)}h (${data.percentage.padStart(5)}%) ${pctBar}`);
    }
  }
  const unused = divEntries.filter(([, d]) => d.hours === 0);
  if (unused.length > 0) {
    console.log(`  UNTRAINED: ${unused.map(([s]) => s).join(', ')}`);
  }
  console.log('');

  // Supply chain flow (NEW)
  console.log('-- Supply Chain Flow ------------------------------------------------');
  const produced = Object.entries(report.supplyChainFlow.produced)
    .sort((a, b) => b[1] - a[1]);
  const consumed = Object.entries(report.supplyChainFlow.consumed)
    .sort((a, b) => b[1] - a[1]);
  console.log('  TOP PRODUCED:');
  for (const [item, qty] of produced.slice(0, 15)) {
    console.log(`    + ${item.padEnd(25)} ${qty.toLocaleString()}`);
  }
  console.log('  TOP CONSUMED:');
  for (const [item, qty] of consumed.slice(0, 15)) {
    console.log(`    - ${item.padEnd(25)} ${qty.toLocaleString()}`);
  }
  // Bottleneck items: consumed more than produced
  console.log('  SUPPLY BOTTLENECKS (consumed > produced):');
  const allItems = new Set([...Object.keys(report.supplyChainFlow.produced), ...Object.keys(report.supplyChainFlow.consumed)]);
  const bottleneckItems = [];
  for (const item of allItems) {
    const prod = report.supplyChainFlow.produced[item] || 0;
    const cons = report.supplyChainFlow.consumed[item] || 0;
    if (cons > prod && cons > 100) {
      bottleneckItems.push({ item, produced: prod, consumed: cons, deficit: cons - prod });
    }
  }
  bottleneckItems.sort((a, b) => b.deficit - a.deficit);
  if (bottleneckItems.length === 0) {
    console.log('    None! All resources balanced.');
  } else {
    for (const b of bottleneckItems.slice(0, 10)) {
      console.log(`    ${b.item.padEnd(25)} produced: ${b.produced.toLocaleString().padStart(8)} consumed: ${b.consumed.toLocaleString().padStart(8)} deficit: ${b.deficit.toLocaleString()}`);
    }
  }
  console.log('');

  // Resource deficits (NEW)
  console.log('-- Resource Deficits (agent wanted X but lacked inputs) --------------');
  if (report.resourceDeficits.length === 0) {
    console.log('  No deficits! Agent always had what it needed.');
  } else {
    for (const d of report.resourceDeficits.slice(0, 15)) {
      const buyTag = d.boughtWithGold ? ' [bought with gold]' : ' [BLOCKED]';
      console.log(`  [${d.count}x] ${d.skill}/${d.method}: needed ${d.needed} ${d.resource}, had ${d.had}${buyTag}`);
    }
  }
  console.log('');

  // Inventory snapshot
  console.log('-- Final Inventory (top items) --------------------------------------');
  for (const [item, qty] of Object.entries(report.inventorySummary)) {
    console.log(`  ${item.padEnd(25)} ${qty.toLocaleString()}`);
  }
  console.log('');

  // Dead zones
  console.log('-- Dead Zones (5+ hours between breakpoints) ------------------------');
  if (report.deadZones.length === 0) {
    console.log('  None found! Breakpoints are well-distributed.');
  } else {
    report.deadZones.sort((a, b) => b.gapHours - a.gapHours);
    for (const dz of report.deadZones.slice(0, 15)) {
      const severity = dz.gapHours > 20 ? 'CRITICAL' : dz.gapHours > 10 ? 'WARNING' : 'MINOR';
      console.log(`  [${severity}] ${dz.gapHours}h gap (hours ${dz.fromHour}-${dz.toHour}): ${dz.description}`);
    }
  }
  console.log('');

  // Degenerate methods
  console.log('-- Degenerate Methods (one strictly better than another) -------------');
  if (report.degenerateMethods.length === 0) {
    console.log('  None found! All methods have meaningful tradeoffs.');
  } else {
    for (const dm of report.degenerateMethods.slice(0, 15)) {
      console.log(`  [${dm.skill}] "${dm.better}" strictly dominates "${dm.worse}"`);
    }
  }
  console.log('');

  // Missing coverage
  console.log('-- Missing Coverage (brackets with <2 methods or no AFK) -------------');
  if (report.missingCoverage.length === 0) {
    console.log('  Full coverage! Every bracket has 2+ methods with AFK options.');
  } else {
    for (const mc of report.missingCoverage.slice(0, 20)) {
      if (mc.issue) {
        console.log(`  [${mc.skill}] ${mc.bracket}: ${mc.issue} -- has: ${mc.methods.join(', ')}`);
      } else {
        console.log(`  [${mc.skill}] ${mc.bracket}: only ${mc.methodCount} method(s) -- ${mc.methods.join(', ')}`);
      }
    }
  }
  console.log('');

  // Dangling prereqs
  console.log('-- Dangling Prerequisites -------------------------------------------');
  if (report.danglingPrereqs.length === 0) {
    console.log('  None found! All references are valid.');
  } else {
    for (const dp of report.danglingPrereqs) {
      console.log(`  [${dp.type}] ${dp.description}`);
    }
  }
  console.log('');

  // Dead methods
  console.log('-- Dead Training Methods (never chosen by agent) --------------------');
  const deadArr = [...report.deadMethods];
  if (deadArr.length === 0) {
    console.log('  All methods were used at some point!');
  } else {
    console.log(`  ${deadArr.length} methods never chosen:`);
    for (const dm of deadArr.slice(0, 20)) {
      console.log(`    - ${dm}`);
    }
    if (deadArr.length > 20) console.log(`    ... and ${deadArr.length - 20} more`);
  }
  console.log('');

  // Bottlenecks
  console.log('-- Skill Bottlenecks (most gates blocked by this skill) --------------');
  for (const b of report.bottlenecks.slice(0, 10)) {
    console.log(`  ${b.skill.padEnd(14)} blocks ${b.gatesBlocked} area gates`);
  }
  console.log('');

  // Routing diversity
  console.log('-- Routing Diversity Snapshots ---------------------------------------');
  for (const snap of report.routingSnapshots.slice(0, 10)) {
    console.log(`  [${snap.hour}h] ${snap.viableOptions} viable methods | ` +
      `Gold: ${(snap.gold / 1000).toFixed(0)}k | Food: ${snap.foodCount}`);
    console.log(`         Top: ${snap.topMethods.slice(0, 3).join(', ')}`);
  }
  console.log('');

  // Transformative breakpoints timeline
  console.log('-- Transformative Breakpoints Timeline -------------------------------');
  const transformative = report.breakpointsHit.filter(b => b.importance === 'transformative');
  for (const bp of transformative) {
    console.log(`  [${bp.hour}h] ${bp.trigger.skill} ${bp.trigger.level}: ${bp.description}`);
  }
  console.log('');

  console.log('==============================================================');
}

// -- CLI -----------------------------------------------------------------------

const args = process.argv.slice(2);
const verbose = args.includes('--verbose') || args.includes('-v');
const hoursIdx = args.indexOf('--hours');
const maxHours = hoursIdx >= 0 ? parseInt(args[hoursIdx + 1]) || 500 : 500;

console.log(`\nRunning progression simulation (${maxHours} hours, verbose=${verbose})...\n`);

const report = simulate(maxHours, verbose);
printReport(report);
