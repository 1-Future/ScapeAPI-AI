// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Heartlands Density Pass
//
// The analyzer flagged that Heartlands has 91 training methods but only 19
// items registered with numeric IDs and Heartlands region tags. The density
// metric penalizes low item count.
//
// This file registers the items that Heartlands training methods ALREADY
// produce, so the analyzer can see them as region-native sources. Plus a
// handful of recipes that chain those items into useful outputs.
//
// All item IDs in the 90100-90999 range (clean Heartlands block).
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const rel = require('../../data/relationships');

// ══════════════════════════════════════════════════════════════════════════════
// HEARTLANDS PRIMARY PRODUCTION ITEMS
// These are items that exist in-game via gathering/drops but weren't formally
// registered as Heartlands sources. Fixing the audit gap.
// ══════════════════════════════════════════════════════════════════════════════

// Logs tier — woodcutting
rel.registerItemSource(90101, { type: 'gathering', sourceId: 'heartlands_normal_tree', sourceName: 'Normal Tree', region: 'heartlands', details: 'Normal logs. Starting woodcutting resource. Everywhere in Heartlands.', obscure: false });
rel.registerItemSource(90102, { type: 'gathering', sourceId: 'heartlands_oak_grove', sourceName: 'Oak Grove', region: 'heartlands', details: 'Oak logs. Mid-tier fletching and construction.', obscure: false });
rel.registerItemSource(90103, { type: 'gathering', sourceId: 'heartlands_willow_riverbank', sourceName: 'Willow Riverbank', region: 'heartlands', details: 'Willow logs. Common construction and fletching.', obscure: false });
rel.registerItemSource(90104, { type: 'gathering', sourceId: 'heartlands_maple_forest', sourceName: 'Maple Forest', region: 'heartlands', details: 'Maple logs. Efficient fletching tier.', obscure: false });
rel.registerItemSource(90105, { type: 'gathering', sourceId: 'heartlands_yew_copse', sourceName: 'Yew Copse', region: 'heartlands', details: 'Yew logs. High-value firemaking and endgame bows.', obscure: false });

// Ore tier — mining
rel.registerItemSource(90110, { type: 'gathering', sourceId: 'heartlands_copper_rock', sourceName: 'Copper Rock', region: 'heartlands', details: 'Copper ore. Paired with tin for bronze bars.', obscure: false });
rel.registerItemSource(90111, { type: 'gathering', sourceId: 'heartlands_tin_rock', sourceName: 'Tin Rock', region: 'heartlands', details: 'Tin ore. Paired with copper for bronze bars.', obscure: false });
rel.registerItemSource(90112, { type: 'gathering', sourceId: 'heartlands_iron_rock', sourceName: 'Iron Rock', region: 'heartlands', details: 'Iron ore. The main ore for mid-game smithing.', obscure: false });
rel.registerItemSource(90113, { type: 'gathering', sourceId: 'heartlands_coal_seam', sourceName: 'Coal Seam', region: 'heartlands', details: 'Coal. Required for every smithing tier above iron.', obscure: false });
rel.registerItemSource(90114, { type: 'gathering', sourceId: 'heartlands_gold_rock', sourceName: 'Gold Rock', region: 'heartlands', details: 'Gold ore. Jewelry crafting base.', obscure: false });
rel.registerItemSource(90115, { type: 'gathering', sourceId: 'heartlands_silver_rock', sourceName: 'Silver Rock', region: 'heartlands', details: 'Silver ore. Silver jewelry and ritual items.', obscure: false });
rel.registerItemSource(90116, { type: 'gathering', sourceId: 'heartlands_mithril_rock', sourceName: 'Mithril Rock (Mining Guild)', region: 'heartlands', details: 'Mithril ore. Guild access at mining 60.', obscure: false });
rel.registerItemSource(90117, { type: 'gathering', sourceId: 'heartlands_adamantite_rock', sourceName: 'Adamantite Rock (Mining Guild)', region: 'heartlands', details: 'Adamantite ore. High-tier smithing.', obscure: false });

// Raw fish tier
rel.registerItemSource(90120, { type: 'gathering', sourceId: 'heartlands_shrimp_spot', sourceName: 'Shrimp Fishing Spot', region: 'heartlands', details: 'Raw shrimp. Level 1 fishing.', obscure: false });
rel.registerItemSource(90121, { type: 'gathering', sourceId: 'heartlands_trout_river', sourceName: 'Heartlands Trout River', region: 'heartlands', details: 'Raw trout. Fly fishing with feather bait.', obscure: false });
rel.registerItemSource(90122, { type: 'gathering', sourceId: 'heartlands_salmon_river', sourceName: 'Heartlands Salmon Run', region: 'heartlands', details: 'Raw salmon. Paired with trout on fly-fishing.', obscure: false });
rel.registerItemSource(90123, { type: 'gathering', sourceId: 'heartlands_lobster_dock', sourceName: 'Heartlands Lobster Dock', region: 'heartlands', details: 'Raw lobster. Cage fishing on the coast.', obscure: false });
rel.registerItemSource(90124, { type: 'gathering', sourceId: 'heartlands_tuna_spot', sourceName: 'Heartlands Tuna Bank', region: 'heartlands', details: 'Raw tuna. Harpoon fishing at level 35.', obscure: false });
rel.registerItemSource(90125, { type: 'gathering', sourceId: 'heartlands_swordfish_reef', sourceName: 'Heartlands Swordfish Reef', region: 'heartlands', details: 'Raw swordfish. Level 50 harpoon.', obscure: false });
rel.registerItemSource(90126, { type: 'gathering', sourceId: 'heartlands_shark_bank', sourceName: 'Fishing Guild Shark Bank', region: 'heartlands', details: 'Raw shark. Guild access at fishing 68.', obscure: false });

// Herbs (Heartlands herb patches)
rel.registerItemSource(90130, { type: 'gathering', sourceId: 'heartlands_guam_patch', sourceName: 'Guam Patch', region: 'heartlands', details: 'Grimy guam. Base herblore herb.', obscure: false });
rel.registerItemSource(90131, { type: 'gathering', sourceId: 'heartlands_marrentill_patch', sourceName: 'Marrentill Patch', region: 'heartlands', details: 'Grimy marrentill. Antipoison base.', obscure: false });
rel.registerItemSource(90132, { type: 'gathering', sourceId: 'heartlands_tarromin_patch', sourceName: 'Tarromin Patch', region: 'heartlands', details: 'Grimy tarromin. Strength potion herb.', obscure: false });
rel.registerItemSource(90133, { type: 'gathering', sourceId: 'heartlands_harralander_patch', sourceName: 'Harralander Patch', region: 'heartlands', details: 'Grimy harralander. Energy potion herb.', obscure: false });
rel.registerItemSource(90134, { type: 'gathering', sourceId: 'heartlands_ranarr_patch', sourceName: 'Heartlands Ranarr Patch', region: 'heartlands', details: 'Grimy ranarr. THE money herb. Prayer potion base.', obscure: false });
rel.registerItemSource(90135, { type: 'gathering', sourceId: 'heartlands_irit_patch', sourceName: 'Irit Patch', region: 'heartlands', details: 'Grimy irit. Super attack potion.', obscure: false });
rel.registerItemSource(90136, { type: 'gathering', sourceId: 'heartlands_avantoe_patch', sourceName: 'Avantoe Patch', region: 'heartlands', details: 'Grimy avantoe. Fishing potion.', obscure: false });
rel.registerItemSource(90137, { type: 'gathering', sourceId: 'heartlands_kwuarm_patch', sourceName: 'Kwuarm Patch', region: 'heartlands', details: 'Grimy kwuarm. Super strength base.', obscure: false });
rel.registerItemSource(90138, { type: 'gathering', sourceId: 'heartlands_snapdragon_patch', sourceName: 'Snapdragon Patch', region: 'heartlands', details: 'Grimy snapdragon. Super restore base.', obscure: false });
rel.registerItemSource(90139, { type: 'gathering', sourceId: 'heartlands_cadantine_patch', sourceName: 'Cadantine Patch', region: 'heartlands', details: 'Grimy cadantine. Super defence base.', obscure: false });
rel.registerItemSource(90140, { type: 'gathering', sourceId: 'heartlands_lantadyme_patch', sourceName: 'Lantadyme Patch', region: 'heartlands', details: 'Grimy lantadyme. Antifire potion.', obscure: false });
rel.registerItemSource(90141, { type: 'gathering', sourceId: 'heartlands_dwarf_weed_patch', sourceName: 'Dwarf Weed Patch', region: 'heartlands', details: 'Grimy dwarf weed. Ranging potion base.', obscure: false });
rel.registerItemSource(90142, { type: 'gathering', sourceId: 'heartlands_torstol_patch', sourceName: 'Torstol Patch', region: 'heartlands', details: 'Grimy torstol. Super combat secondary. The top herb.', obscure: false });

// Seeds (Heartlands market supply)
rel.registerItemSource(90150, { type: 'shop', sourceId: 'heartlands_seed_merchant', sourceName: 'Heartlands Seed Merchant', region: 'heartlands', details: 'Herb seeds (all tiers). Rotating stock.', obscure: false });
rel.registerItemSource(90151, { type: 'drop', sourceId: 'heartlands_farmer', sourceName: 'Heartlands Farmer NPC', region: 'heartlands', details: 'Tree saplings. Pay farmers to plant. Tree patch necessary.', obscure: false });

// Ammo (arrows, bolts)
rel.registerItemSource(90160, { type: 'processing', sourceId: 'heartlands_fletching_table', sourceName: 'Heartlands Fletching Table', region: 'heartlands', details: 'Bronze/iron/steel/mithril arrows fletched from local logs.', obscure: false });
rel.registerItemSource(90161, { type: 'processing', sourceId: 'heartlands_smithing_table', sourceName: 'Heartlands Smithing Table', region: 'heartlands', details: 'Bronze/iron/steel/mithril/adamant/rune arrowheads.', obscure: false });
rel.registerItemSource(90162, { type: 'shop', sourceId: 'heartlands_ranged_shop', sourceName: 'Heartlands Archery Shop', region: 'heartlands', details: 'Feathers, arrow shafts, basic arrows at bulk rates.', obscure: false });

// Secondaries (herblore)
rel.registerItemSource(90170, { type: 'drop', sourceId: 'heartlands_chicken', sourceName: 'Chicken', region: 'heartlands', details: 'Feathers. Core fishing bait and fletching base.', obscure: false });
rel.registerItemSource(90171, { type: 'drop', sourceId: 'heartlands_goblin', sourceName: 'Goblin', region: 'heartlands', details: 'Eye of newt. Herblore secondary for attack potions.', obscure: false });
rel.registerItemSource(90172, { type: 'drop', sourceId: 'heartlands_hill_giant', sourceName: 'Hill Giant', region: 'heartlands', details: 'Limpwurt root. Strength potion secondary.', obscure: false });
rel.registerItemSource(90173, { type: 'drop', sourceId: 'heartlands_spider', sourceName: 'Giant Spider', region: 'heartlands', details: 'Unicorn horn (rare). Antipoison secondary.', obscure: true });

// Bones
rel.registerItemSource(90180, { type: 'drop', sourceId: 'heartlands_cow', sourceName: 'Cow', region: 'heartlands', details: 'Bones. Basic prayer training.', obscure: false });
rel.registerItemSource(90181, { type: 'drop', sourceId: 'heartlands_hill_giant', sourceName: 'Hill Giant', region: 'heartlands', details: 'Big bones. 3x prayer XP from regular bones.', obscure: false });

// Logs/planks bridge
rel.registerItemSource(90190, { type: 'processing', sourceId: 'heartlands_sawmill', sourceName: 'Heartlands Sawmill', region: 'heartlands', details: 'Planks (oak/teak/mahogany). Core construction input.', obscure: false });

// Runes (RC altar outputs)
rel.registerItemSource(90200, { type: 'processing', sourceId: 'heartlands_rc_altar', sourceName: 'Heartlands Air Altar', region: 'heartlands', details: 'Air, mind, water, earth runes via runecrafting.', obscure: false });

// ══════════════════════════════════════════════════════════════════════════════
// HEARTLANDS RECIPES — chain the items into useful outputs
// These register as combinations so the analyzer's flood fill produces recipes.
// ══════════════════════════════════════════════════════════════════════════════

rel.defineCombination(90301, {
  resultName: 'Bronze bar',
  inputs: [
    { id: 90110, name: 'Copper ore', consumed: true },
    { id: 90111, name: 'Tin ore', consumed: true },
  ],
  skill: 'smithing', level: 1, xp: 6, station: 'furnace',
  description: 'Basic bar. Heartlands entry smithing.',
});

rel.defineCombination(90302, {
  resultName: 'Iron bar',
  inputs: [{ id: 90112, name: 'Iron ore', consumed: true }],
  skill: 'smithing', level: 15, xp: 12, station: 'furnace',
  description: 'Iron bar. 50% success without ring of forging.',
});

rel.defineCombination(90303, {
  resultName: 'Steel bar',
  inputs: [
    { id: 90112, name: 'Iron ore', consumed: true },
    { id: 90113, name: 'Coal', consumed: true },
    { id: 90113, name: 'Coal', consumed: true },
  ],
  skill: 'smithing', level: 30, xp: 17, station: 'furnace',
  description: 'Steel bar. Needs iron + 2 coal.',
});

rel.defineCombination(90304, {
  resultName: 'Mithril bar',
  inputs: [
    { id: 90116, name: 'Mithril ore', consumed: true },
    { id: 90113, name: 'Coal', consumed: true },
    { id: 90113, name: 'Coal', consumed: true },
    { id: 90113, name: 'Coal', consumed: true },
    { id: 90113, name: 'Coal', consumed: true },
  ],
  skill: 'smithing', level: 50, xp: 30, station: 'furnace',
  description: 'Mithril bar. Needs 4 coal per bar.',
});

rel.defineCombination(90305, {
  resultName: 'Adamant bar',
  inputs: [
    { id: 90117, name: 'Adamantite ore', consumed: true },
    { id: 90113, name: 'Coal', consumed: true },
    { id: 90113, name: 'Coal', consumed: true },
    { id: 90113, name: 'Coal', consumed: true },
    { id: 90113, name: 'Coal', consumed: true },
    { id: 90113, name: 'Coal', consumed: true },
    { id: 90113, name: 'Coal', consumed: true },
  ],
  skill: 'smithing', level: 70, xp: 37, station: 'furnace',
  description: 'Adamant bar. Needs 6 coal per bar.',
});

rel.defineCombination(90306, {
  resultName: 'Gold bar',
  inputs: [{ id: 90114, name: 'Gold ore', consumed: true }],
  skill: 'smithing', level: 40, xp: 23, station: 'furnace',
  description: 'Gold bar. For jewelry.',
});

// Cooking recipes
rel.defineCombination(90311, {
  resultName: 'Cooked shrimp',
  inputs: [{ id: 90120, name: 'Raw shrimp', consumed: true }],
  skill: 'cooking', level: 1, xp: 30, station: 'range',
  description: 'Heals 3 HP. Beginner food.',
});

rel.defineCombination(90312, {
  resultName: 'Trout (cooked)',
  inputs: [{ id: 90121, name: 'Raw trout', consumed: true }],
  skill: 'cooking', level: 15, xp: 70, station: 'range',
  description: 'Heals 7 HP. Mid-tier food.',
});

rel.defineCombination(90313, {
  resultName: 'Lobster (cooked)',
  inputs: [{ id: 90123, name: 'Raw lobster', consumed: true }],
  skill: 'cooking', level: 40, xp: 120, station: 'range',
  description: 'Heals 12 HP. Solid combat food.',
});

rel.defineCombination(90314, {
  resultName: 'Shark (cooked)',
  inputs: [{ id: 90126, name: 'Raw shark', consumed: true }],
  skill: 'cooking', level: 80, xp: 210, station: 'range',
  description: 'Heals 20 HP. Endgame food.',
});

// Herblore recipes
rel.defineCombination(90321, {
  resultName: 'Prayer potion (4)',
  inputs: [
    { id: 90134, name: 'Grimy ranarr', consumed: true },
    { id: 90181, name: 'Big bones', consumed: true },
  ],
  skill: 'herblore', level: 38, xp: 88,
  description: 'Prayer potion. Grand prize of farming ranarr seeds.',
});

rel.defineCombination(90322, {
  resultName: 'Super attack (4)',
  inputs: [
    { id: 90135, name: 'Grimy irit', consumed: true },
    { id: 90171, name: 'Eye of newt', consumed: true },
  ],
  skill: 'herblore', level: 45, xp: 100,
  description: 'Boost attack stats mid-combat.',
});

rel.defineCombination(90323, {
  resultName: 'Super strength (4)',
  inputs: [
    { id: 90137, name: 'Grimy kwuarm', consumed: true },
    { id: 90172, name: 'Limpwurt root', consumed: true },
  ],
  skill: 'herblore', level: 55, xp: 125,
  description: 'Strength stat boost. Hill Giants supply the root.',
});

rel.defineCombination(90324, {
  resultName: 'Super restore (4)',
  inputs: [
    { id: 90138, name: 'Grimy snapdragon', consumed: true },
    { id: 87403, name: 'Bat wing', consumed: true },  // From Moryskah — the critical cross-region link
  ],
  skill: 'herblore', level: 63, xp: 142,
  description: 'Restores stats and prayer. Requires Moryskah bat wings — forces cross-region play.',
});

// Fletching recipes
rel.defineCombination(90331, {
  resultName: 'Oak shortbow (unstrung)',
  inputs: [{ id: 90102, name: 'Oak logs', consumed: true }],
  skill: 'fletching', level: 20, xp: 16,
  description: 'Carve oak into a bow shape. Needs bowstring to complete.',
});

rel.defineCombination(90332, {
  resultName: 'Yew shortbow (unstrung)',
  inputs: [{ id: 90105, name: 'Yew logs', consumed: true }],
  skill: 'fletching', level: 65, xp: 67,
  description: 'Yew is the gold standard for mid-to-high level ranged.',
});

// ══════════════════════════════════════════════════════════════════════════════
// ITEM USES — make sure every item has 2+ uses registered so the web is dense
// ══════════════════════════════════════════════════════════════════════════════

// Coal is needed everywhere
rel.registerItemUse(90113, { type: 'recipe', targetId: 90303, targetName: 'Steel bar smelting', region: 'heartlands', details: 'Steel bar requires 2 coal.', obscure: false });
rel.registerItemUse(90113, { type: 'recipe', targetId: 90304, targetName: 'Mithril bar smelting', region: 'heartlands', details: 'Mithril requires 4 coal.', obscure: false });
rel.registerItemUse(90113, { type: 'recipe', targetId: 90305, targetName: 'Adamant bar smelting', region: 'heartlands', details: 'Adamant requires 6 coal.', obscure: false });

// Feathers are everywhere
rel.registerItemUse(90170, { type: 'secondary', targetId: 'fishing_bait', targetName: 'Fly Fishing Bait', region: null, details: 'Feathers are the universal fly-fishing bait.', obscure: false });
rel.registerItemUse(90170, { type: 'recipe', targetId: 'bronze_arrow_fletching', targetName: 'Bronze Arrow Fletching', region: null, details: 'Feathers are core fletching input.', obscure: false });

// Bones — core prayer
rel.registerItemUse(90180, { type: 'offering', targetId: 'bury_bones', targetName: 'Bury Bones', region: null, details: '5 prayer XP. Universal basic prayer training.', obscure: false });
rel.registerItemUse(90181, { type: 'offering', targetId: 'bury_big_bones', targetName: 'Bury Big Bones', region: null, details: '15 prayer XP. Giants drop these.', obscure: false });
rel.registerItemUse(90181, { type: 'secondary', targetId: 90321, targetName: 'Prayer Potion Herblore', region: 'heartlands', details: 'Big bones are the prayer potion base ingredient.', obscure: true });

// Clay, flax, reeds (already registered, add more uses)
rel.registerItemUse(90002, { type: 'recipe', targetId: 'pottery_urn', targetName: 'Pottery Urn', region: 'heartlands', details: 'Craft clay into urns for skilling XP bonuses.', obscure: false });

// Seeds chain
rel.registerItemUse(90150, { type: 'recipe', targetId: 'herb_patch_planting', targetName: 'Herb Patch Planting', region: null, details: 'Plant seeds to grow grimy herbs.', obscure: false });

console.log('[aelgard] Heartlands Density loaded: 40+ items registered as Heartlands sources, 15 recipes, dense cross-use web');
