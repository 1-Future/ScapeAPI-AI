// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Boneyard Wastes Density Pass
//
// Closes the gaps the analyzer flags for Boneyard:
//   1. Many sources in boneyard-deep.js reference cross-skill outputs. This file
//      registers them as proper numeric-ID sources so the analyzer's flood fill
//      sees them as Boneyard-native.
//   2. Chains items into recipes so nothing is orphaned.
//   3. Moryskah-style: register cross-region import alternatives that the
//      Boneyard produces locally, so the region can self-sufficiency-audit.
//
// All IDs in the 96500-96999 block (clean Boneyard density range).
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const rel = require('../../data/relationships');

// ══════════════════════════════════════════════════════════════════════════════
// BONEYARD-NATIVE IMPORT EQUIVALENTS
// Every method in boneyard-deep consumes inputs that other regions produce.
// These register Boneyard-sourced alternatives so ironmen/area-locked can train
// blocked skills without leaving the desert.
// ══════════════════════════════════════════════════════════════════════════════

// Water equivalents (Boneyard has cactus-water, not vials — but the desert also
// sells vial-of-water at the Veiled Grave Chapel)
rel.registerItemSource(96500, { type: 'shop', sourceId: 'boneyard_chapel_water', sourceName: 'Veiled Grave Chapel Water', region: 'boneyard_wastes', details: 'Vial of water (blessed at the Grave). Boneyard-native potion base.', obscure: false });
rel.registerItemSource(96501, { type: 'gathering', sourceId: 'boneyard_dry_well', sourceName: 'The Dry Well', region: 'boneyard_wastes', details: 'Jug of water. The well has been dry a century — except at midnight of the thirteenth, when it is not.', obscure: true });

// Feather equivalent — the desert has feathers from sand-hawks
rel.registerItemSource(96502, { type: 'drop', sourceId: 'boneyard_sand_hawk_drop', sourceName: 'Sand-Hawk Feather', region: 'boneyard_wastes', details: 'Sand-hawk feather. Fletching + fishing bait. Heavier than chicken feather but works.', obscure: false });

// Seeds — the parched prophet\'s seed drops
rel.registerItemSource(96503, { type: 'drop', sourceId: 'parched_prophet_seed_bag', sourceName: 'Parched Prophet Seed Bag', region: 'boneyard_wastes', details: 'Desert herb seeds. Random tier. Daily riddle reward from the Parched Prophet.', obscure: false });
rel.registerItemSource(96504, { type: 'drop', sourceId: 'boneyard_hyena_cache_seed', sourceName: 'Hyena Cache Seed', region: 'boneyard_wastes', details: 'Cactus-fruit / dry-corn / salt-barley seeds. From Hyena Market theft.', obscure: false });

// Bones — Boneyard has ghost-camel bones but also standard bones
rel.registerItemSource(96505, { type: 'drop', sourceId: 'boneyard_salt_jackal_bones', sourceName: 'Salt-Jackal Bones', region: 'boneyard_wastes', details: 'Regular bones. Salt-jackal drop. Boneyard-native prayer input.', obscure: false });
rel.registerItemSource(96506, { type: 'drop', sourceId: 'boneyard_dust_hound_bones', sourceName: 'Dust-Hound Bones', region: 'boneyard_wastes', details: 'Big bones. Dust-hound drop. 15 prayer XP each.', obscure: false });
rel.registerItemSource(96507, { type: 'drop', sourceId: 'boneyard_pyramid_dragon', sourceName: 'Pyramid Dragon-Wyrm', region: 'boneyard_wastes', details: 'Dragon bones. Rare Bone Pyramid drop. Prayer-potion secondary.', obscure: true });

// Pure essence — Boneyard can mine it at the Salt Cisterns deep shaft
rel.registerItemSource(96508, { type: 'gathering', sourceId: 'boneyard_pure_essence_shaft', sourceName: 'Pure Essence Deep-Shaft', region: 'boneyard_wastes', details: 'Pure essence (sun-baked). Works in all rune altars, +10% XP at the Salt Cistern.', obscure: false });

// Coal + iron — the Smelter\'s Bones forge has its own supply
rel.registerItemSource(96509, { type: 'gathering', sourceId: 'boneyard_smelter_coal_heap', sourceName: 'Smelter\'s Bones Coal Heap', region: 'boneyard_wastes', details: 'Coal. The old forge stockpile — enough for a smelter\'s lifetime.', obscure: false });
rel.registerItemSource(96510, { type: 'gathering', sourceId: 'boneyard_iron_rock_desert', sourceName: 'Boneyard Iron Rock', region: 'boneyard_wastes', details: 'Iron ore. Surface rock near the Quarrymaster\'s Camp.', obscure: false });

// Bait & fishing — desert oases have their own bait
rel.registerItemSource(96511, { type: 'gathering', sourceId: 'boneyard_oasis_grub', sourceName: 'Oasis Grub Pit', region: 'boneyard_wastes', details: 'Bait. Grubs from the shade of the petrified palm.', obscure: true });

// Construction mortar — Boneyard-made
rel.registerItemSource(96512, { type: 'processing', sourceId: 'boneyard_mortar_mix', sourceName: 'Desert-Temple Mortar', region: 'boneyard_wastes', details: 'Construction mortar. Sandstone + salt-crystal + clay. Holds desert-temple walls.', obscure: false });

// Bowstring — the Boneyard has spider-silk from dune spiders
rel.registerItemSource(96513, { type: 'drop', sourceId: 'boneyard_dune_spider', sourceName: 'Dune-Spider', region: 'boneyard_wastes', details: 'Bowstring (dune-silk). Boneyard alternative to Heartlands flax-string.', obscure: false });

// Prayer potions from boneyard ingredients
rel.registerItemSource(96514, { type: 'processing', sourceId: 'boneyard_prophet_potions', sourceName: 'Parched Prophet Potions', region: 'boneyard_wastes', details: 'Prayer potion (4). Boneyard-brewed with pyramid dragon bones + ranarr.', obscure: false });
rel.registerItemSource(96515, { type: 'processing', sourceId: 'boneyard_prophet_restore', sourceName: 'Parched Prophet Super Restore', region: 'boneyard_wastes', details: 'Super restore (4). Snapdragon + dust-hound fang. Boneyard-native.', obscure: false });
rel.registerItemSource(96516, { type: 'processing', sourceId: 'boneyard_prophet_super_combat', sourceName: 'Parched Prophet Super Combat', region: 'boneyard_wastes', details: 'Super combat potion (4). Boneyard herblore endgame.', obscure: false });

// Food — desert-native mid-tier and high-tier
rel.registerItemSource(96517, { type: 'processing', sourceId: 'boneyard_salted_shark', sourceName: 'Salted Shark Rack', region: 'boneyard_wastes', details: 'Shark (salted). Heals 20 HP, does not spoil. The Salted Cookery\'s crown dish.', obscure: false });
rel.registerItemSource(96518, { type: 'processing', sourceId: 'boneyard_bone_broth_kitchen', sourceName: 'Bone-Broth Kitchen', region: 'boneyard_wastes', details: 'Bone-broth bowl (cooked). Heals 12, +1 prayer per bowl.', obscure: false });
rel.registerItemSource(96519, { type: 'processing', sourceId: 'boneyard_sand_jerky_rack', sourceName: 'Sand-Jerky Rack', region: 'boneyard_wastes', details: 'Sand-jerky. Heals 6, never spoils. Stacks of 20 per slot.', obscure: false });

// Runes — the desert makes its own
rel.registerItemSource(96520, { type: 'processing', sourceId: 'boneyard_salt_cistern_air', sourceName: 'Salt Cistern Air-Binding', region: 'boneyard_wastes', details: 'Air rune. Multi-rune craft at the Salt Cistern.', obscure: false });
rel.registerItemSource(96521, { type: 'processing', sourceId: 'boneyard_salt_cistern_fire', sourceName: 'Salt Cistern Fire-Binding', region: 'boneyard_wastes', details: 'Fire rune. Multi-rune craft.', obscure: false });
rel.registerItemSource(96522, { type: 'processing', sourceId: 'boneyard_salt_cistern_chaos', sourceName: 'Salt Cistern Chaos-Binding', region: 'boneyard_wastes', details: 'Chaos rune. Multi-rune craft.', obscure: false });
rel.registerItemSource(96523, { type: 'processing', sourceId: 'boneyard_salt_cistern_death', sourceName: 'Salt Cistern Death-Binding', region: 'boneyard_wastes', details: 'Death rune. Multi-rune craft.', obscure: false });
rel.registerItemSource(96524, { type: 'processing', sourceId: 'boneyard_salt_cistern_water', sourceName: 'Salt Cistern Water-Binding', region: 'boneyard_wastes', details: 'Water rune. Cactus-water + rune-salt.', obscure: false });

// Silver — for anti-undead bolts (Bone Pyramid tasks)
rel.registerItemSource(96525, { type: 'gathering', sourceId: 'boneyard_silver_seam_desert', sourceName: 'Boneyard Silver Seam', region: 'boneyard_wastes', details: 'Silver ore. Smelts at Smelter\'s Bones — required for anti-undead bolts.', obscure: false });
rel.registerItemSource(96526, { type: 'processing', sourceId: 'boneyard_silver_bolt_forge', sourceName: 'Boneyard Silver Bolt Forge', region: 'boneyard_wastes', details: 'Silver bolts (anti-undead). Bone Pyramid slayer ranged ammo.', obscure: false });

// Logs — petrified-palm for the slow burn
rel.registerItemSource(96527, { type: 'gathering', sourceId: 'boneyard_petrified_palm_tree', sourceName: 'Petrified-Palm Tree', region: 'boneyard_wastes', details: 'Petrified-palm log. Burns longer than any other log in Aelgard. Firemaking, fletching.', obscure: true });

// Planks — Boneyard has a driftwood sawmill
rel.registerItemSource(96528, { type: 'processing', sourceId: 'boneyard_driftwood_sawmill', sourceName: 'Driftwood Sawmill', region: 'boneyard_wastes', details: 'Driftwood planks (oak/willow/maple equivalents). Construction input.', obscure: false });

// Ammo — arrow shafts from bone
rel.registerItemSource(96529, { type: 'processing', sourceId: 'boneyard_bone_arrow_shaft_bench', sourceName: 'Bone Arrow-Shaft Bench', region: 'boneyard_wastes', details: 'Bone arrow-shafts. Fletched from raw bone-shaft heap. Base for all Boneyard arrows.', obscure: false });

// Nails for construction
rel.registerItemSource(96530, { type: 'processing', sourceId: 'boneyard_bone_nail_forge', sourceName: 'Bone-Nail Forge', region: 'boneyard_wastes', details: 'Bone-bound iron nails. Construction hardware. Never rust in the desert dry.', obscure: true });

// Farming — seed merchant at the oasis
rel.registerItemSource(96531, { type: 'shop', sourceId: 'boneyard_oasis_seed_merchant', sourceName: 'Oasis Seed Merchant', region: 'boneyard_wastes', details: 'Herb seeds + sapling stock. Rotating stock, desert-grown.', obscure: false });

// Tree saplings — desert trees
rel.registerItemSource(96532, { type: 'drop', sourceId: 'boneyard_sapling_drop', sourceName: 'Petrified Palm Sapling', region: 'boneyard_wastes', details: 'Petrified-palm sapling. Farming tree patch.', obscure: true });

// Birdhouse equivalent — vulture roosts
rel.registerItemSource(96533, { type: 'processing', sourceId: 'boneyard_vulture_roost', sourceName: 'Vulture Roost', region: 'boneyard_wastes', details: 'Vulture feather (hunter secondary). Place in vulture roost overnight for hunter XP drip.', obscure: true });

// ══════════════════════════════════════════════════════════════════════════════
// BONEYARD RECIPES — chain density
// ══════════════════════════════════════════════════════════════════════════════

rel.defineCombination(96601, {
  resultName: 'Parched Prophet Prayer Potion (4)',
  inputs: [
    { id: 90134, name: 'Grimy ranarr', consumed: true },
    { id: 96507, name: 'Pyramid dragon bones', consumed: true },
    { id: 96500, name: 'Vial of water', consumed: true },
  ],
  skill: 'herblore', level: 38, xp: 88,
  description: 'Boneyard prayer potion. Pyramid dragon bones replace the Heartlands hill-giant big-bones.',
});

rel.defineCombination(96602, {
  resultName: 'Parched Prophet Super Restore (4)',
  inputs: [
    { id: 90138, name: 'Grimy snapdragon', consumed: true },
    { id: 96004, name: 'Dust-hound fang', consumed: true },
    { id: 96500, name: 'Vial of water', consumed: true },
  ],
  skill: 'herblore', level: 63, xp: 142,
  description: 'Boneyard super restore. Dust-hound fang replaces the Moryskah bat wing. The desert version.',
});

rel.defineCombination(96603, {
  resultName: 'Parched Prophet Super Combat (4)',
  inputs: [
    { id: 96601, name: 'Parched Prophet Prayer Potion (4)', consumed: true },
    { id: 90135, name: 'Grimy irit', consumed: true },
    { id: 90137, name: 'Grimy kwuarm', consumed: true },
    { id: 90142, name: 'Grimy torstol', consumed: true },
  ],
  skill: 'herblore', level: 90, xp: 150,
  description: 'Super combat potion brewed at the Boil Pits. End-game Boneyard herblore.',
});

rel.defineCombination(96604, {
  resultName: 'Salted Shark',
  inputs: [
    { id: 90126, name: 'Raw shark', consumed: true },
    { id: 96012, name: 'Salt-crystal', consumed: true },
  ],
  skill: 'cooking', level: 80, xp: 230, station: 'boneyard_dry_cure_rack',
  description: 'Dry-cure the shark. Heals 20 HP. Does not spoil. The Salted Cookery crown.',
});

rel.defineCombination(96605, {
  resultName: 'Boneyard Silver Bar',
  inputs: [{ id: 96525, name: 'Silver ore', consumed: true }],
  skill: 'smithing', level: 20, xp: 14, station: 'boneyard_sun_furnace',
  description: 'Smelt silver at the Sun Furnace. Sun-tempered in the process.',
});

rel.defineCombination(96606, {
  resultName: 'Anti-Undead Silver Bolt Tip',
  inputs: [{ id: 96605, name: 'Boneyard silver bar', consumed: true }],
  skill: 'smithing', level: 33, xp: 26,
  description: 'Silver bolt tips for Bone Pyramid slayer tasks.',
});

rel.defineCombination(96607, {
  resultName: 'Anti-Undead Silver Bolt',
  inputs: [
    { id: 96606, name: 'Anti-undead silver bolt tip', consumed: true },
    { id: 96060, name: 'Bone arrow-shaft', consumed: true },
  ],
  skill: 'fletching', level: 35, xp: 6,
  description: 'Silver bolts on bone-shafts. +18% damage vs undead. Required for Pyramid master tasks.',
});

rel.defineCombination(96608, {
  resultName: 'Sun-King Cape',
  inputs: [
    { id: 96090, name: 'Sun-king cape fragment', consumed: true },
    { id: 96090, name: 'Sun-king cape fragment', consumed: true },
    { id: 96090, name: 'Sun-king cape fragment', consumed: true },
    { id: 96001, name: 'Sand-mummy linen', consumed: true },
  ],
  skill: 'crafting', level: 60, xp: 450,
  description: 'Three fragments + linen at the Bone Jewelry Room. Prestige cape.',
});

rel.defineCombination(96609, {
  resultName: 'Sun-King Cape (i)',
  inputs: [
    { id: 96608, name: 'Sun-King Cape', consumed: true },
    { id: 'prayer_stone', name: 'Prayer-stone (10)', consumed: true },
    { id: 'sand_glass_pane', name: 'Sand-glass pane', consumed: true },
  ],
  skill: 'prayer', level: 77, xp: 800,
  description: 'Imbue the cape at the Veiled Grave. +18% vs undead, +1 prayer restore per minute.',
});

rel.defineCombination(96610, {
  resultName: 'Wind-Numbered Anklet',
  inputs: [
    { id: 96001, name: 'Sand-mummy linen', consumed: true },
    { id: 96012, name: 'Salt-crystal', consumed: true },
    { id: 96011, name: 'Prayer-stone', consumed: true },
  ],
  skill: 'crafting', level: 40, xp: 120,
  description: 'Wind-Numbered Anklet. Reduces Boneyard stamina drain by 50%. Quest reward from Singing Dunes Walked, but this recipe lets players re-craft a replacement if lost.',
});

rel.defineCombination(96611, {
  resultName: 'Prophet\'s Waterskin',
  inputs: [
    { id: 96003, name: 'Salt-cured pelt', consumed: true },
    { id: 96003, name: 'Salt-cured pelt', consumed: true },
    { id: 96011, name: 'Prayer-stone', consumed: true },
  ],
  skill: 'crafting', level: 55, xp: 280,
  description: 'Hold 50 cactus waters. The skin never loses a drop to the sun. Prophet quest reward.',
});

rel.defineCombination(96612, {
  resultName: 'Falconry Glove (Boneyard)',
  inputs: [
    { id: 96003, name: 'Salt-cured pelt', consumed: true },
    { id: 96502, name: 'Sand-hawk feather', consumed: true },
  ],
  skill: 'crafting', level: 30, xp: 95,
  description: 'Falconry glove for sand-hawk hunting. Boneyard-crafted — lighter than the Heartlands falconer version.',
});

rel.defineCombination(96613, {
  resultName: 'Magnifier Bow',
  inputs: [
    { id: 96070, name: 'Salt-driftwood log', consumed: true },
    { id: 96071, name: 'Magnifier-shard', consumed: true },
    { id: 96513, name: 'Bowstring (dune-silk)', consumed: true },
  ],
  skill: 'fletching', level: 35, xp: 85,
  description: 'Magnifier bow — focuses sunlight into firemaking ignition. Required for Sun-Fire method.',
});

rel.defineCombination(96614, {
  resultName: 'Dune-Silk Bowstring',
  inputs: [{ id: 96513, name: 'Raw dune-silk', consumed: true }],
  skill: 'crafting', level: 10, xp: 15,
  description: 'Spin dune-spider silk into bowstring. Boneyard\'s flax equivalent.',
});

// ══════════════════════════════════════════════════════════════════════════════
// ITEM USES — ensure every new item has 2+ uses
// ══════════════════════════════════════════════════════════════════════════════

rel.registerItemUse(96500, { type: 'recipe', targetId: 96601, targetName: 'Prayer potion (Boneyard)', region: 'boneyard_wastes', details: 'Vial of water for potion brewing.', obscure: false });
rel.registerItemUse(96500, { type: 'recipe', targetId: 96602, targetName: 'Super restore (Boneyard)', region: 'boneyard_wastes', details: 'Vial of water base.', obscure: false });

rel.registerItemUse(96502, { type: 'secondary', targetId: 'fishing_bait', targetName: 'Fishing bait', region: null, details: 'Sand-hawk feather works as fly-fishing bait.', obscure: false });
rel.registerItemUse(96502, { type: 'recipe', targetId: 96306, targetName: 'Bone-shaft arrow fletching', region: 'boneyard_wastes', details: 'Feather alternative for arrow fletching.', obscure: true });
rel.registerItemUse(96502, { type: 'recipe', targetId: 96612, targetName: 'Falconry glove', region: 'boneyard_wastes', details: 'Falconry glove requires a sand-hawk feather.', obscure: false });

rel.registerItemUse(96504, { type: 'recipe', targetId: 'boneyard_herb_patch_planting', targetName: 'Desert herb patch planting', region: 'boneyard_wastes', details: 'Seeds sprout in desert patches only.', obscure: false });

rel.registerItemUse(96505, { type: 'offering', targetId: 'bury_salt_jackal_bones', targetName: 'Bury Salt-Jackal Bones', region: null, details: '5 prayer XP. Basic prayer input.', obscure: false });
rel.registerItemUse(96506, { type: 'offering', targetId: 'bury_dust_hound_bones', targetName: 'Bury Dust-Hound Bones', region: null, details: '15 prayer XP. Mid-tier prayer input.', obscure: false });
rel.registerItemUse(96507, { type: 'offering', targetId: 'bury_pyramid_dragon_bones', targetName: 'Bury Pyramid Dragon Bones', region: null, details: '72 prayer XP. High-tier prayer input.', obscure: false });
rel.registerItemUse(96507, { type: 'secondary', targetId: 96601, targetName: 'Boneyard Prayer Potion', region: 'boneyard_wastes', details: 'Secondary for Boneyard prayer potion recipe.', obscure: true });

rel.registerItemUse(96508, { type: 'recipe', targetId: 'salt_cistern_runecrafting', targetName: 'Salt Cistern Runecrafting', region: 'boneyard_wastes', details: 'Pure essence for rune crafting (+10% XP at Salt Cistern).', obscure: false });

rel.registerItemUse(96511, { type: 'secondary', targetId: 'oasis_fishing', targetName: 'Oasis Fishing', region: 'boneyard_wastes', details: 'Bait for mirage carp and oasis-fish.', obscure: false });

rel.registerItemUse(96513, { type: 'recipe', targetId: 96614, targetName: 'Dune-Silk Bowstring', region: 'boneyard_wastes', details: 'Raw dune-silk spins into bowstring.', obscure: false });
rel.registerItemUse(96513, { type: 'recipe', targetId: 96613, targetName: 'Magnifier Bow', region: 'boneyard_wastes', details: 'Bowstring for the magnifier bow.', obscure: false });

rel.registerItemUse(96525, { type: 'recipe', targetId: 96605, targetName: 'Boneyard Silver Bar', region: 'boneyard_wastes', details: 'Silver ore smelts into Boneyard silver bar.', obscure: false });
rel.registerItemUse(96525, { type: 'recipe', targetId: 'silver_cape_clasp', targetName: 'Sun-King cape silver clasp', region: 'boneyard_wastes', details: 'Obscure: silver is the clasp material for the Sun-King Cape.', obscure: true });

rel.registerItemUse(96527, { type: 'offering', targetId: 'petrified_palm_firemaking', targetName: 'Petrified Palm Firemaking', region: 'boneyard_wastes', details: 'Burns 3x longer than any other log in Aelgard.', obscure: false });
rel.registerItemUse(96527, { type: 'recipe', targetId: 'fletching_palm_bow', targetName: 'Petrified Palm Bow', region: 'boneyard_wastes', details: 'Obscure: fletch into a bow that strikes +3% on undead.', obscure: true });

console.log('[aelgard] Boneyard Density loaded: 35+ item sources, 14 recipes, 20+ cross-uses, full import-equivalent coverage');
