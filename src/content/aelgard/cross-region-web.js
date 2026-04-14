// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Cross-Region Dependency Web
//
// "The content is timeless because every region imports and exports resources,
//  every monster is a supplier for something unexpected, every shop stocks
//  something that matters in a different region entirely." — The design brief
//
// This file seeds the OBSCURE connections that make area-locked accounts
// (Swampletics-style) compelling. Every region produces items consumed by
// other regions. Every region has unexpected drops. Every item has multiple
// non-obvious uses. And every region has ONE prestige goal.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const rel = require('../../data/relationships');

let sourceCount = 0;
let useCount = 0;
let comboCount = 0;

function src(itemId, opts) { rel.registerItemSource(itemId, opts); sourceCount++; }
function use(itemId, opts) { rel.registerItemUse(itemId, opts); useCount++; }
function combo(id, opts) { rel.defineCombination(id, opts); comboCount++; }

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 1 — REGIONAL UNIQUE EXPORTS
// Each region exports 5-8 items. These are the "trade goods" that make
// cross-region commerce real. Item IDs in 87000-87999 range.
// ══════════════════════════════════════════════════════════════════════════════

// ── Heartlands exports (87000-87099) ──────────────────────────────────────────
src(87001, { type: 'gathering', sourceId: 'heartlands_wheat_field', sourceName: 'Wheat Field', region: 'heartlands', details: 'Farmable. Staple grain for all food recipes.', obscure: false });
src(87002, { type: 'drop', sourceId: 'heartlands_cow', sourceName: 'Cow', region: 'heartlands', details: 'Cowhide. Basic crafting input.', obscure: false });
src(87003, { type: 'gathering', sourceId: 'heartlands_herb_patch', sourceName: 'Ranarr patch', region: 'heartlands', details: 'The money herb. Used in prayer potions.', obscure: false });
src(87004, { type: 'shop', sourceId: 'heartlands_general_store', sourceName: 'Heartlands General Store', region: 'heartlands', details: 'Common hardware: pots, jugs, buckets.', obscure: false });
src(87005, { type: 'gathering', sourceId: 'heartlands_oak_grove', sourceName: 'Oak Grove', region: 'heartlands', details: 'Oak logs. Mid-tier fletching and construction.', obscure: false });
src(87006, { type: 'quest', sourceId: 'the_fencepost_problem', sourceName: "Rancher's Bell", region: 'heartlands', details: 'Summons cows for quick herding. OBSCURE: also works on goats in Sootworks.', obscure: true });

// ── Boneyard Wastes exports (87100-87199) ─────────────────────────────────────
src(87101, { type: 'drop', sourceId: 'desert_phoenix', sourceName: 'Desert Phoenix', region: 'boneyard_wastes', details: 'Phoenix feather. Fire-resistant armor ingredient.', obscure: false });
src(87102, { type: 'gathering', sourceId: 'sandstone_quarry', sourceName: 'Sandstone Quarry', region: 'boneyard_wastes', details: 'Sandstone blocks. Construction material.', obscure: false });
src(87103, { type: 'gathering', sourceId: 'magnetite_deposit', sourceName: 'Magnetite Deposit', region: 'boneyard_wastes', details: 'Magnetite ore. Only source of compass-grade metal.', obscure: false });
src(87104, { type: 'drop', sourceId: 'mummy', sourceName: 'Animated Mummy', region: 'boneyard_wastes', details: 'Mummified wrappings. Used in prayer ceremonies in Moryskah.', obscure: true });
src(87105, { type: 'drop', sourceId: 'desert_scarab', sourceName: 'Giant Scarab', region: 'boneyard_wastes', details: 'Scarab shell. Crafting material for scarab amulets.', obscure: false });
src(87106, { type: 'drop', sourceId: 'desert_cobra', sourceName: 'Desert Cobra', region: 'boneyard_wastes', details: 'Venom gland. Required for Saltbrine blowdart tips. OBSCURE CROSS-REGION.', obscure: true });
src(87107, { type: 'gathering', sourceId: 'fossil_dig_site', sourceName: 'Fossil Dig Site', region: 'boneyard_wastes', details: 'Fossilized bones. Prayer XP AND Sootworks gear ingredient.', obscure: false });

// ── Veilwood exports (87200-87299) ────────────────────────────────────────────
src(87201, { type: 'gathering', sourceId: 'crystal_tree', sourceName: 'Crystal Tree', region: 'veilwood', details: 'Crystal shards. Endgame weapon charges AND crafting.', obscure: false });
src(87202, { type: 'gathering', sourceId: 'moonpetal_grove', sourceName: 'Moonpetal Grove', region: 'veilwood', details: 'Moonpetal. Lycanthropy cure ingredient. Essential for Moryskah quests.', obscure: true });
src(87203, { type: 'drop', sourceId: 'veilwood_spinner', sourceName: 'Elven Spinner', region: 'veilwood', details: 'Elven bowstring. 20% stronger than normal bowstring.', obscure: false });
src(87204, { type: 'gathering', sourceId: 'dreamwood_tree', sourceName: 'Dreamwood Tree', region: 'veilwood', details: 'Dreamwood logs. Required for Inkweald dream-focus crafting.', obscure: false });
src(87205, { type: 'drop', sourceId: 'veilwood_unicorn', sourceName: 'Forest Unicorn', region: 'veilwood', details: 'Unicorn horn dust. Antipoison secondary. OBSCURE: also cures swamp rot in Moryskah.', obscure: true });
src(87206, { type: 'drop', sourceId: 'veilwood_fairy', sourceName: 'Woodland Fairy', region: 'veilwood', details: 'Fairy dust. Inkweald dream potion secondary.', obscure: true });

// ── Sootworks exports (87300-87399) ───────────────────────────────────────────
src(87301, { type: 'gathering', sourceId: 'soot_iron_vein', sourceName: 'Soot-Iron Vein', region: 'sootworks', details: 'Soot-iron ore. Required for Dream-Forged Steel (Inkweald recipe).', obscure: false });
src(87302, { type: 'drop', sourceId: 'clockwork_soldier', sourceName: 'Clockwork Soldier', region: 'sootworks', details: 'Clockwork gear. Crafting component for mechanical pets.', obscure: false });
src(87303, { type: 'drop', sourceId: 'steam_elemental', sourceName: 'Steam Elemental', region: 'sootworks', details: 'Condensed steam. Moryskah bog witches need it for brewing. OBSCURE.', obscure: true });
src(87304, { type: 'gathering', sourceId: 'deep_stone_pit', sourceName: 'Deep-Stone Pit', region: 'sootworks', details: 'Deep-stone brick. Highest construction tier.', obscure: false });
src(87305, { type: 'drop', sourceId: 'sootworks_mimic', sourceName: 'Mimic Chest', region: 'sootworks', details: '1/500 drops Treasure Key — opens Glass Desert vault. OBSCURE.', obscure: true });
src(87306, { type: 'shop', sourceId: 'sootworks_foundry_shop', sourceName: 'Foundry Shop', region: 'sootworks', details: 'Mithril grease. Oils crystal weapons from Veilwood.', obscure: true });

// ── Moryskah exports (87400-87499) ────────────────────────────────────────────
src(87401, { type: 'gathering', sourceId: 'moryskah_swamp', sourceName: 'Moryskah Swamp', region: 'moryskah', details: 'Wolfbane herb. Werewolf repellent AND lycanthropy cure.', obscure: false });
src(87402, { type: 'drop', sourceId: 'moryskah_vampire', sourceName: 'Vampire Thrall', region: 'moryskah', details: 'Blood tithe. Ritual component for Barrows and blood-imbued gear.', obscure: false });
src(87403, { type: 'drop', sourceId: 'moryskah_bat', sourceName: 'Giant Bat', region: 'moryskah', details: 'Bat wing (1/32). HERBLORE secondary for Super Restore. Cross-region critical.', obscure: true });
src(87404, { type: 'drop', sourceId: 'moryskah_tomb_raider', sourceName: 'Tomb Raider', region: 'moryskah', details: 'Tombstone rubble. Smithing flux for enchanted blades.', obscure: false });
src(87405, { type: 'drop', sourceId: 'moryskah_spider', sourceName: 'Giant Swamp Spider', region: 'moryskah', details: 'Spider silk. Required for Saltbrine sail repair.', obscure: true });
src(87406, { type: 'drop', sourceId: 'moryskah_werewolf', sourceName: 'Moryskah Werewolf', region: 'moryskah', details: 'Silver-tinted pelt. Crafts werewolf-kin armor (moon-phase bonuses).', obscure: false });

// ── Inkweald exports (87500-87599) ────────────────────────────────────────────
src(87501, { type: 'gathering', sourceId: 'lucid_well', sourceName: 'Lucid Well', region: 'inkweald', details: 'Lucid essence. Dream potion base. Reveals hidden paths.', obscure: false });
src(87502, { type: 'drop', sourceId: 'dream_stalker', sourceName: 'Dream Stalker', region: 'inkweald', details: 'Dream mote. Ingredient for Dream-Forged Steel.', obscure: false });
src(87503, { type: 'drop', sourceId: 'mirror_shade', sourceName: 'Mirror Shade', region: 'inkweald', details: 'Mirror shard. Reflects magic damage. Prismatic lens ingredient.', obscure: false });
src(87504, { type: 'gathering', sourceId: 'nightglass_bloom', sourceName: 'Nightglass Bloom', region: 'inkweald', details: 'Nightglass. Transparent to scrying. Required for portable telescopes.', obscure: false });
src(87505, { type: 'drop', sourceId: 'nightmare_flitter', sourceName: 'Nightmare Flitter', region: 'inkweald', details: 'Nightmare fragment. Moryskah blood rite component. Cross-region.', obscure: true });

// ── Saltbrine Reach exports (87600-87699) ─────────────────────────────────────
src(87601, { type: 'gathering', sourceId: 'salt_flats', sourceName: 'Salt Flats', region: 'saltbrine_reach', details: 'Sea salt. Food preservation AND curing Moryskah undead.', obscure: true });
src(87602, { type: 'shop', sourceId: 'saltbrine_rigging_shop', sourceName: 'Rigging Shop', region: 'saltbrine_reach', details: 'Pirate rope. Crafting component for Smuggler\'s Compass.', obscure: false });
src(87603, { type: 'gathering', sourceId: 'pearl_bed', sourceName: 'Pearl Bed', region: 'saltbrine_reach', details: 'Pearl. Jewelry AND fishing lure AND Inkweald dream-focus.', obscure: true });
src(87604, { type: 'drop', sourceId: 'reef_crab', sourceName: 'Reef Crab', region: 'saltbrine_reach', details: 'Coral fragment. Construction material for sea-facing structures.', obscure: false });
src(87605, { type: 'drop', sourceId: 'deep_kraken', sourceName: 'Deep Kraken', region: 'saltbrine_reach', details: 'Kraken ink. Required for Blessed Kraken Harpoon.', obscure: false });
src(87606, { type: 'drop', sourceId: 'saltbrine_seagull', sourceName: 'Wharf Seagull', region: 'saltbrine_reach', details: 'Pearl fragments (1/50). Crafted into cross-region teleport jewelry.', obscure: true });

// ── Glass Desert exports (87700-87799) ────────────────────────────────────────
src(87701, { type: 'gathering', sourceId: 'crystal_sand', sourceName: 'Crystal Sand', region: 'glass_desert', details: 'Crystal dust. Refines into endgame rune essence.', obscure: false });
src(87702, { type: 'drop', sourceId: 'prismatic_drake', sourceName: 'Prismatic Drake', region: 'glass_desert', details: 'Prismatic shard. Wyrm-Heart Pendant ingredient.', obscure: false });
src(87703, { type: 'drop', sourceId: 'wyrm_hatchling', sourceName: 'Wyrm Hatchling', region: 'glass_desert', details: 'Wyrm scale. Highest-tier armor scaling.', obscure: false });
src(87704, { type: 'gathering', sourceId: 'sun_bleached_boneyard', sourceName: 'Sun-Bleached Boneyard', region: 'glass_desert', details: 'Sun-bleached bone. 5x prayer XP vs regular bones.', obscure: false });
src(87705, { type: 'drop', sourceId: 'crystal_moth', sourceName: 'Crystal Moth', region: 'glass_desert', details: 'Prismatic dust. Inkweald dream potion top-tier secondary.', obscure: true });

// ── The Wilds exports (87800-87899) ───────────────────────────────────────────
src(87801, { type: 'drop', sourceId: 'wild_revenant', sourceName: 'Revenant', region: 'the_wilds', details: 'Revenant ether. Charges Boneyard pyramid artifacts. PvP risk.', obscure: true });
src(87802, { type: 'gathering', sourceId: 'chaos_rune_essence', sourceName: 'Chaos Rune Essence', region: 'the_wilds', details: 'Chaos rune shards. Wilderness-only RC shortcut.', obscure: false });
src(87803, { type: 'drop', sourceId: 'callisto_cub', sourceName: 'Callisto Cub', region: 'the_wilds', details: 'Wilderness blade fragment. Combine 3 for wilderness-only BiS weapon.', obscure: false });
src(87804, { type: 'drop', sourceId: 'wilds_scorpia_guardian', sourceName: 'Scorpia Guardian', region: 'the_wilds', details: 'Larran\'s key. Unlocks the hidden chest lottery.', obscure: true });

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 2 — CROSS-REGION COMBINATIONS
// Recipes requiring items from 2-3 different regions. The actual WEB.
// Combination IDs 88000-88099.
// ══════════════════════════════════════════════════════════════════════════════

combo(88001, {
  resultName: 'Lycanthropy Cure',
  inputs: [
    { id: 87401, name: 'Wolfbane herb', consumed: true },       // Moryskah
    { id: 87202, name: 'Moonpetal', consumed: true },            // Veilwood
    { id: 88901, name: 'Holy water', consumed: true },           // Heartlands (shop)
  ],
  skill: 'herblore', level: 45, xp: 150,
  description: 'The cure required in The Werewolfs Dilemma. Needs items from 3 regions.',
});

combo(88002, {
  resultName: 'Prismatic Lens',
  inputs: [
    { id: 87201, name: 'Crystal shard', consumed: true },        // Veilwood
    { id: 87504, name: 'Nightglass', consumed: true },            // Inkweald
    { id: 87601, name: 'Sea salt', consumed: true },              // Saltbrine
  ],
  skill: 'crafting', level: 65, xp: 200,
  description: 'Three-region lens. Used for scrying and telescopes.',
});

combo(88003, {
  resultName: 'Clockwork Scarab',
  inputs: [
    { id: 87302, name: 'Clockwork gear', consumed: true },        // Sootworks
    { id: 87105, name: 'Scarab shell', consumed: true },          // Boneyard
  ],
  skill: 'crafting', level: 55, xp: 180,
  description: 'Mechanical pet. Fights small enemies for you.',
});

combo(88004, {
  resultName: 'Blessed Kraken Harpoon',
  inputs: [
    { id: 87605, name: 'Kraken ink', consumed: true },            // Saltbrine
    { id: 87402, name: 'Blood tithe', consumed: true },           // Moryskah
    { id: 87401, name: 'Wolfbane herb', consumed: true },         // Moryskah
  ],
  skill: 'fishing', level: 70, xp: 300,
  description: 'BIS harpoon for cursed Moryskah waters.',
});

combo(88005, {
  resultName: 'Dream-Forged Steel Bar',
  inputs: [
    { id: 87301, name: 'Soot-iron ore', consumed: true },         // Sootworks
    { id: 87502, name: 'Dream mote', consumed: true },            // Inkweald
  ],
  skill: 'smithing', level: 75, xp: 400,
  station: 'furnace',
  description: 'Endgame smithing bar. Only smeltable at Inkweald dream forge.',
});

combo(88006, {
  resultName: 'Phoenix Ember Plate',
  inputs: [
    { id: 87101, name: 'Phoenix feather', consumed: true },       // Boneyard
    { id: 87301, name: 'Soot-iron ore', consumed: true },         // Sootworks
    { id: 87301, name: 'Soot-iron ore', consumed: true },         // Sootworks (×3)
  ],
  skill: 'smithing', level: 70, xp: 350,
  description: 'Fire-resistant body armor. Essential for Glass Desert and Fight Caves.',
});

combo(88007, {
  resultName: 'Wyrm-Heart Pendant',
  inputs: [
    { id: 87703, name: 'Wyrm scale', consumed: true },            // Glass Desert
    { id: 87701, name: 'Crystal dust', consumed: true },          // Glass Desert
    { id: 87501, name: 'Lucid essence', consumed: true },         // Inkweald
  ],
  skill: 'crafting', level: 85, xp: 500,
  description: 'BIS amulet for Glass Desert content. Late-game prestige item.',
});

combo(88008, {
  resultName: 'Smugglers Compass',
  inputs: [
    { id: 87602, name: 'Pirate rope', consumed: true },           // Saltbrine
    { id: 87103, name: 'Magnetite ore', consumed: true },         // Boneyard
  ],
  skill: 'crafting', level: 45, xp: 120,
  description: 'Navigates hidden paths. Unlocks 3 shortcuts across regions.',
});

combo(88009, {
  resultName: 'Super Restore Potion (4)',
  inputs: [
    { id: 12013, name: 'Grimy torstol', consumed: true },         // Any herb region
    { id: 87403, name: 'Bat wing', consumed: true },              // Moryskah ONLY
  ],
  skill: 'herblore', level: 63, xp: 142,
  description: 'The most important potion in the game. Moryskah bats are bottleneck.',
});

combo(88010, {
  resultName: 'Saltbrine Blowdart (tipped)',
  inputs: [
    { id: 87106, name: 'Venom gland', consumed: true },           // Boneyard
    { id: 88910, name: 'Blank blowdart', consumed: true },        // Saltbrine craft
  ],
  skill: 'fletching', level: 52, xp: 95,
  description: 'Venomous ranged ammo. Cross-region ingredient chain.',
});

combo(88011, {
  resultName: 'Enchanted Silver Blade',
  inputs: [
    { id: 87404, name: 'Tombstone rubble', consumed: true },      // Moryskah
    { id: 87401, name: 'Wolfbane herb', consumed: true },         // Moryskah
    { id: 88920, name: 'Silver bar', consumed: true },            // Any smithing region
  ],
  skill: 'smithing', level: 55, xp: 275,
  description: 'Silver-tipped weapon. Werewolf-slaying BIS.',
});

combo(88012, {
  resultName: 'Mummified Prayer Wrap',
  inputs: [
    { id: 87104, name: 'Mummified wrappings', consumed: true },   // Boneyard
    { id: 107, name: 'Dragon bones', consumed: true },            // Any dragon
  ],
  skill: 'prayer', level: 50, xp: 650,
  description: 'Ritual offering. 5x prayer XP for premium consumers.',
});

combo(88013, {
  resultName: 'Scarab Charm Amulet',
  inputs: [
    { id: 87105, name: 'Scarab shell', consumed: true },          // Boneyard
    { id: 87603, name: 'Pearl', consumed: true },                 // Saltbrine
    { id: 88920, name: 'Silver bar', consumed: true },
  ],
  skill: 'crafting', level: 60, xp: 185,
  description: 'Scarab protection charm. Immunity to sandstorms AND seasickness.',
});

combo(88014, {
  resultName: 'Dreamwood Shortbow',
  inputs: [
    { id: 87204, name: 'Dreamwood logs', consumed: true },        // Veilwood
    { id: 87203, name: 'Elven bowstring', consumed: true },       // Veilwood
  ],
  skill: 'fletching', level: 65, xp: 220,
  description: 'Shots phase through walls. Unique to Veilwood + Inkweald PvM.',
});

combo(88015, {
  resultName: 'Crystal Scythe (tainted)',
  inputs: [
    { id: 87201, name: 'Crystal shard', consumed: true },         // Veilwood
    { id: 87201, name: 'Crystal shard', consumed: true },         // ×3
    { id: 87402, name: 'Blood tithe', consumed: true },           // Moryskah
  ],
  skill: 'crafting', level: 80, xp: 450,
  description: 'Crystal scythe corrupted by blood. Hits 3 tiles, degrades.',
});

combo(88016, {
  resultName: 'Spider Silk Sail',
  inputs: [
    { id: 87405, name: 'Spider silk', consumed: true },           // Moryskah
    { id: 87405, name: 'Spider silk', consumed: true },           // ×3
    { id: 87602, name: 'Pirate rope', consumed: true },           // Saltbrine
  ],
  skill: 'crafting', level: 50, xp: 160,
  description: 'Repairs Saltbrine ships. Only way to unlock charter routes.',
});

combo(88017, {
  resultName: 'Bog Witchs Brew',
  inputs: [
    { id: 87303, name: 'Condensed steam', consumed: true },       // Sootworks
    { id: 87401, name: 'Wolfbane herb', consumed: true },         // Moryskah
  ],
  skill: 'herblore', level: 55, xp: 175,
  description: 'Swamp gas antidote. OBSCURE: Sootworks steam + Moryskah herb.',
});

combo(88018, {
  resultName: 'Ectoplasmic Focus',
  inputs: [
    { id: 87505, name: 'Nightmare fragment', consumed: true },    // Inkweald
    { id: 87402, name: 'Blood tithe', consumed: true },           // Moryskah
    { id: 87201, name: 'Crystal shard', consumed: true },         // Veilwood
  ],
  skill: 'crafting', level: 75, xp: 380,
  description: 'Magic focus orb. Enables Ancient + Lunar spellbook switching.',
});

combo(88019, {
  resultName: 'Sun-Bleached Offering',
  inputs: [
    { id: 87704, name: 'Sun-bleached bone', consumed: true },     // Glass Desert
    { id: 87104, name: 'Mummified wrappings', consumed: true },   // Boneyard
  ],
  skill: 'prayer', level: 70, xp: 950,
  description: 'Cross-desert ritual. The best non-Wilds prayer XP.',
});

combo(88020, {
  resultName: 'Revenant Ether Flask',
  inputs: [
    { id: 87801, name: 'Revenant ether', consumed: true },        // Wilds
    { id: 87501, name: 'Lucid essence', consumed: true },         // Inkweald
  ],
  skill: 'herblore', level: 72, xp: 260,
  description: 'Teleport-block potion. Wilds PvP counter item.',
});

combo(88021, {
  resultName: 'Prismatic Dream Robe',
  inputs: [
    { id: 87705, name: 'Prismatic dust', consumed: true },        // Glass Desert
    { id: 87501, name: 'Lucid essence', consumed: true },         // Inkweald
    { id: 87203, name: 'Elven bowstring', consumed: true },       // Veilwood
  ],
  skill: 'crafting', level: 78, xp: 400,
  description: 'Magic-reflecting robe. Body slot BIS for caster PvM.',
});

combo(88022, {
  resultName: 'Werewolf-Kin Helm',
  inputs: [
    { id: 87406, name: 'Silver-tinted pelt', consumed: true },    // Moryskah
    { id: 87401, name: 'Wolfbane herb', consumed: true },         // Moryskah
  ],
  skill: 'crafting', level: 58, xp: 165,
  description: 'Grants wolf senses at night. OBSCURE: hunter XP bonus in Moryskah.',
});

combo(88023, {
  resultName: 'Coral Construction Block',
  inputs: [
    { id: 87604, name: 'Coral fragment', consumed: true },        // Saltbrine
    { id: 87304, name: 'Deep-stone brick', consumed: true },      // Sootworks
  ],
  skill: 'construction', level: 68, xp: 280,
  description: 'Seawater-resistant building material. Unlocks boat-house POH.',
});

combo(88024, {
  resultName: 'Fairy Dust Pouch',
  inputs: [
    { id: 87206, name: 'Fairy dust', consumed: true },            // Veilwood
    { id: 87501, name: 'Lucid essence', consumed: true },         // Inkweald
  ],
  skill: 'runecrafting', level: 65, xp: 150,
  description: 'Holds 3 rune types. Inkweald-only crafting recipe.',
});

combo(88025, {
  resultName: 'Unicorn Salve Remedy',
  inputs: [
    { id: 87205, name: 'Unicorn horn dust', consumed: true },     // Veilwood
    { id: 15007, name: 'Swamp salve recipe', consumed: false },   // Moryskah knowledge
  ],
  skill: 'herblore', level: 48, xp: 130,
  description: 'Cures swamp rot. Required to enter deep Moryskah.',
});

combo(88026, {
  resultName: 'Treasure Vault Key',
  inputs: [
    { id: 87305, name: 'Treasure Key', consumed: true },          // Sootworks mimic
    { id: 87801, name: 'Revenant ether', consumed: true },        // Wilds
  ],
  skill: 'crafting', level: 50, xp: 100,
  description: 'Attuned key. Unlocks Glass Desert vault (prestige loot).',
});

combo(88027, {
  resultName: 'Pearl Teleport Amulet',
  inputs: [
    { id: 87606, name: 'Pearl fragments', consumed: true },       // Saltbrine
    { id: 87606, name: 'Pearl fragments', consumed: true },       // ×3
    { id: 88920, name: 'Silver bar', consumed: true },
  ],
  skill: 'crafting', level: 55, xp: 145,
  description: '4 teleport charges to coastal cities. OBSCURE: ALSO teleports to Inkweald.',
});

combo(88028, {
  resultName: 'Mithril Grease Gel',
  inputs: [
    { id: 88930, name: 'Mithril grease', consumed: true },        // Sootworks shop
    { id: 87201, name: 'Crystal shard', consumed: true },         // Veilwood
  ],
  skill: 'crafting', level: 65, xp: 180,
  description: 'Extends crystal weapon charges by 50%. Two-region essential.',
});

combo(88029, {
  resultName: 'Blood-Bound Bowstring',
  inputs: [
    { id: 87203, name: 'Elven bowstring', consumed: true },       // Veilwood
    { id: 87402, name: 'Blood tithe', consumed: true },           // Moryskah
  ],
  skill: 'crafting', level: 70, xp: 200,
  description: 'Vampiric bowstring. Heals on ranged hit. Niche PvM item.',
});

combo(88030, {
  resultName: 'Scarab-Bone Fossil Tool',
  inputs: [
    { id: 87105, name: 'Scarab shell', consumed: true },          // Boneyard
    { id: 87107, name: 'Fossilized bones', consumed: true },      // Boneyard
  ],
  skill: 'crafting', level: 40, xp: 85,
  description: 'Dig tool. Unlocks all desert fossil dig sites.',
});

combo(88031, {
  resultName: 'Wilderness Blade',
  inputs: [
    { id: 87803, name: 'Wilderness blade fragment', consumed: true },  // Wilds
    { id: 87803, name: 'Wilderness blade fragment', consumed: true },  // ×3
    { id: 88920, name: 'Silver bar', consumed: true },
  ],
  skill: 'smithing', level: 75, xp: 320,
  description: 'BIS in The Wilds ONLY. Useless outside. Niche sidegrade.',
});

combo(88032, {
  resultName: 'Chaos Rune Pouch (imbued)',
  inputs: [
    { id: 87802, name: 'Chaos rune shards', consumed: true },     // Wilds
    { id: 87802, name: 'Chaos rune shards', consumed: true },     // ×3
    { id: 87203, name: 'Elven bowstring', consumed: true },       // Veilwood
  ],
  skill: 'runecrafting', level: 75, xp: 340,
  description: 'Holds 6 rune types. Wilds-sourced RC reward.',
});

combo(88033, {
  resultName: 'Moonpetal Draught',
  inputs: [
    { id: 87202, name: 'Moonpetal', consumed: true },             // Veilwood
    { id: 87202, name: 'Moonpetal', consumed: true },             // ×3
    { id: 87101, name: 'Phoenix feather', consumed: true },       // Boneyard
  ],
  skill: 'herblore', level: 80, xp: 340,
  description: 'Boost all stats by 15% for 3 minutes. Best fight-enabler potion.',
});

combo(88034, {
  resultName: 'Kraken Ink Tattoo',
  inputs: [
    { id: 87605, name: 'Kraken ink', consumed: true },            // Saltbrine
    { id: 87501, name: 'Lucid essence', consumed: true },         // Inkweald
  ],
  skill: 'crafting', level: 70, xp: 210,
  description: 'Permanent cosmetic. Also grants waterbreathing + night vision.',
});

combo(88035, {
  resultName: 'Sun-Glass Crucible',
  inputs: [
    { id: 87701, name: 'Crystal dust', consumed: true },          // Glass Desert
    { id: 87304, name: 'Deep-stone brick', consumed: true },      // Sootworks
    { id: 87704, name: 'Sun-bleached bone', consumed: true },     // Glass Desert
  ],
  skill: 'smithing', level: 88, xp: 550,
  description: 'Endgame forge. Needed to smelt Dream-Forged Steel in any region.',
});

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 3 — OBSCURE DROPS
// Weird, non-obvious drops that reward discovery. Marked obscure:true.
// ══════════════════════════════════════════════════════════════════════════════

// Heartlands obscure drops
src(88100, { type: 'drop_rare', sourceId: 'heartlands_chicken', sourceName: 'Chicken', region: 'heartlands', details: 'Golden egg (1/10000). Only 2 sources of Gold item for a Boneyard offering quest.', obscure: true });
src(88101, { type: 'drop_rare', sourceId: 'heartlands_cow', sourceName: 'Cow', region: 'heartlands', details: 'Enchanted cow bone (1/1000). Only bone that works on Veilwood druid altar.', obscure: true });
src(88102, { type: 'drop_rare', sourceId: 'heartlands_guard', sourceName: 'Heartlands Guard', region: 'heartlands', details: 'Guard whistle (1/512). Summons reinforcements once per hour.', obscure: true });
src(88103, { type: 'drop_rare', sourceId: 'heartlands_rat', sourceName: 'Giant Rat', region: 'heartlands', details: 'Ratbane tooth (1/2048). Ingredient for pest-ward in Farming quest.', obscure: true });

// Boneyard obscure drops
src(88110, { type: 'drop_rare', sourceId: 'boneyard_jackal', sourceName: 'Desert Jackal', region: 'boneyard_wastes', details: 'Jackal pelt (1/256). Only water-repellent hide in Aelgard.', obscure: true });
src(88111, { type: 'drop_rare', sourceId: 'boneyard_mummy_lord', sourceName: 'Mummy Lord', region: 'boneyard_wastes', details: 'Ankh of descent (1/1024). Instantly kills any undead below your combat level.', obscure: true });
src(88112, { type: 'drop_rare', sourceId: 'boneyard_desert_wolf', sourceName: 'Desert Wolf', region: 'boneyard_wastes', details: 'Wolfsbane pup tooth (1/500). Moryskah werewolf slayer buff.', obscure: true });
src(88113, { type: 'drop_rare', sourceId: 'boneyard_scorpion', sourceName: 'Boneyard Scorpion', region: 'boneyard_wastes', details: 'Scorpion tail spike (1/128). Saltbrine blowdart material.', obscure: true });

// Veilwood obscure drops
src(88120, { type: 'drop_rare', sourceId: 'veilwood_treespirit', sourceName: 'Tree Spirit', region: 'veilwood', details: 'Heartwood splinter (1/256). Endgame longbow string.', obscure: true });
src(88121, { type: 'drop_rare', sourceId: 'veilwood_moonhawk', sourceName: 'Moonhawk', region: 'veilwood', details: 'Moonhawk feather (1/128). Stealth cloak crafting.', obscure: true });
src(88122, { type: 'drop_rare', sourceId: 'veilwood_druidic_wolf', sourceName: 'Druidic Wolf', region: 'veilwood', details: 'Druidic fang (1/500). Herblore: +50% potion strength.', obscure: true });
src(88123, { type: 'drop_rare', sourceId: 'veilwood_crystal_butterfly', sourceName: 'Crystal Butterfly', region: 'veilwood', details: 'Crystal wing dust (1/64). Glass Desert potion secondary.', obscure: true });

// Sootworks obscure drops
src(88130, { type: 'drop_rare', sourceId: 'sootworks_smithers', sourceName: 'Master Smith Ghost', region: 'sootworks', details: 'Ghostly hammer (1/1000). 3x smithing XP for 10 min/day.', obscure: true });
src(88131, { type: 'drop_rare', sourceId: 'sootworks_rat_swarm', sourceName: 'Rat Swarm', region: 'sootworks', details: 'Infused rat tooth (1/256). Weird: unlocks Moryskah ratcatcher quest.', obscure: true });
src(88132, { type: 'drop_rare', sourceId: 'sootworks_oil_slick', sourceName: 'Oil Slick', region: 'sootworks', details: 'Tarred cloth (1/128). Firemaking: bonfires last 2x longer.', obscure: true });
src(88133, { type: 'drop_rare', sourceId: 'sootworks_cog_beetle', sourceName: 'Cog Beetle', region: 'sootworks', details: 'Beetle gears (1/256). Clockwork pet upgrade.', obscure: true });

// Moryskah obscure drops
src(88140, { type: 'drop_rare', sourceId: 'moryskah_ghoul', sourceName: 'Moryskah Ghoul', region: 'moryskah', details: 'Ghoul hunger charm (1/500). Food heals 2x in Moryskah.', obscure: true });
src(88141, { type: 'drop_rare', sourceId: 'moryskah_tomb_rat', sourceName: 'Tomb Rat', region: 'moryskah', details: 'Crypt key (1/1024). Opens the lesser Barrows mounds.', obscure: true });
src(88142, { type: 'drop_rare', sourceId: 'moryskah_raven', sourceName: 'Death Raven', region: 'moryskah', details: 'Raven feather (1/128). Only way to craft truth-telling cloaks.', obscure: true });
src(88143, { type: 'drop_rare', sourceId: 'moryskah_swamp_toad', sourceName: 'Swamp Toad', region: 'moryskah', details: 'Slimy toad skin (1/64). Obscure herblore: makes potions stack to 10.', obscure: true });

// Inkweald obscure drops
src(88150, { type: 'drop_rare', sourceId: 'inkweald_dreamwalker', sourceName: 'Dream Walker', region: 'inkweald', details: 'Dream-waking bell (1/2048). Wakes teammates from sleep status.', obscure: true });
src(88151, { type: 'drop_rare', sourceId: 'inkweald_lucid_moth', sourceName: 'Lucid Moth', region: 'inkweald', details: 'Moth-wing map (1/512). Reveals hidden Inkweald corridors.', obscure: true });
src(88152, { type: 'drop_rare', sourceId: 'inkweald_reverie_shade', sourceName: 'Reverie Shade', region: 'inkweald', details: 'Shade mote (1/256). Only source of soul-runes outside RC 90+.', obscure: true });
src(88153, { type: 'drop_rare', sourceId: 'inkweald_paradox_rat', sourceName: 'Paradox Rat', region: 'inkweald', details: 'Paradox tail (1/1000). Doubles next skill action. Weird.', obscure: true });

// Saltbrine obscure drops
src(88160, { type: 'drop_rare', sourceId: 'saltbrine_crab_king', sourceName: 'Crab King', region: 'saltbrine_reach', details: 'Crab king crown (1/500). Fishing guild VIP access.', obscure: true });
src(88161, { type: 'drop_rare', sourceId: 'saltbrine_sea_dog', sourceName: 'Sea Dog', region: 'saltbrine_reach', details: 'Sea dog collar (1/128). Pet cow becomes pet dog (cosmetic, 2x herding speed).', obscure: true });
src(88162, { type: 'drop_rare', sourceId: 'saltbrine_sea_witch', sourceName: 'Sea Witch', region: 'saltbrine_reach', details: 'Witch bottle (1/256). Holds a single spell for later cast.', obscure: true });
src(88163, { type: 'drop_rare', sourceId: 'saltbrine_pirate_captain', sourceName: 'Pirate Captain', region: 'saltbrine_reach', details: 'Treasure map (1/512). Random buried chest in any region.', obscure: true });

// Glass Desert obscure drops
src(88170, { type: 'drop_rare', sourceId: 'glass_desert_crystal_scorpion', sourceName: 'Crystal Scorpion', region: 'glass_desert', details: 'Crystal stinger (1/256). Slayer helm bonus: +8% crit.', obscure: true });
src(88171, { type: 'drop_rare', sourceId: 'glass_desert_shard_hawk', sourceName: 'Shard Hawk', region: 'glass_desert', details: 'Shard hawk talon (1/500). Best fletching material.', obscure: true });
src(88172, { type: 'drop_rare', sourceId: 'glass_desert_wyrm_spawn', sourceName: 'Wyrm Spawn', region: 'glass_desert', details: 'Wyrmling heart (1/128). Herblore: +25% damage vs dragons.', obscure: true });
src(88173, { type: 'drop_rare', sourceId: 'glass_desert_crystal_pup', sourceName: 'Crystal Pup', region: 'glass_desert', details: 'Crystal pup (1/3000). Pet. OBSCURE: boosts mining speed in any region.', obscure: true });

// Wilds obscure drops
src(88180, { type: 'drop_rare', sourceId: 'wilds_ent', sourceName: 'Wilderness Ent', region: 'the_wilds', details: 'Ent heart (1/500). Plant in any farming patch for guaranteed yew.', obscure: true });
src(88181, { type: 'drop_rare', sourceId: 'wilds_chaos_hyena', sourceName: 'Chaos Hyena', region: 'the_wilds', details: 'Hyena howl (1/256). Scares PKers for 10 seconds (once/day).', obscure: true });
src(88182, { type: 'drop_rare', sourceId: 'wilds_fallen_knight', sourceName: 'Fallen Knight', region: 'the_wilds', details: 'Knights honor (1/1000). Gives +1 prayer level in Wilds.', obscure: true });

// Additional cross-region obscure shop stocks
src(88190, { type: 'shop', sourceId: 'saltbrine_rigging_shop', sourceName: 'Rigging Shop restock', region: 'saltbrine_reach', details: 'Crystal seed shard (1/100 restock). Only crafting path to Veilwood seeds outside Veilwood.', obscure: true });
src(88191, { type: 'shop', sourceId: 'heartlands_general_store', sourceName: 'Heartlands General restock', region: 'heartlands', details: 'Lucky charm (1/200 restock). Slight boost to all rare drops.', obscure: true });

// Support items referenced by combos
src(88901, { type: 'shop', sourceId: 'heartlands_church', sourceName: 'Heartlands Chapel', region: 'heartlands', details: 'Holy water. Bottled blessed water.', obscure: false });
src(88910, { type: 'processing', sourceId: 'saltbrine_fletching_table', sourceName: 'Saltbrine Fletching Table', region: 'saltbrine_reach', details: 'Blank blowdart. Carved from mangrove wood.', obscure: false });
src(88920, { type: 'processing', sourceId: 'smithing_silver_bar', sourceName: 'Silver Bar Smelting', region: null, details: 'Silver bar. Smelted from silver ore at any furnace.', obscure: false });
src(88930, { type: 'shop', sourceId: 'sootworks_foundry_shop', sourceName: 'Sootworks Foundry Shop', region: 'sootworks', details: 'Mithril grease. Lubricant for crystal weapons.', obscure: false });

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 4 — MULTI-USE ITEMS (3+ uses each)
// Items with unexpected utility across skills/regions.
// ══════════════════════════════════════════════════════════════════════════════

// Bowstring — the OG multi-use item
use(3000, { type: 'recipe', targetId: 'string_bow', targetName: 'String Bow', region: null, details: 'Obvious: fletching bows.', obscure: false });
use(3000, { type: 'recipe', targetId: 'fishing_net_repair', targetName: 'Saltbrine Net Repair', region: 'saltbrine_reach', details: 'Obscure: repairs fishing nets.', obscure: true });
use(3000, { type: 'recipe', targetId: 'blessed_exorcism_rope', targetName: 'Blessed Exorcism Rope', region: 'moryskah', details: 'Obscure: blessed rope for exorcism rituals.', obscure: true });

// Bones — way more than prayer
use(100, { type: 'offering', targetId: 'bury_bones', targetName: 'Bury Bones', region: null, details: 'Obvious: prayer XP.', obscure: false });
use(100, { type: 'recipe', targetId: 'compost_bin', targetName: 'Compost Bin (Farming)', region: null, details: 'Farming: boost crop yield.', obscure: true });
use(100, { type: 'recipe', targetId: 'bonemeal_flux', targetName: 'Bonemeal Smithing Flux', region: null, details: 'Smithing: flux replacement for bronze bars.', obscure: true });
use(100, { type: 'offering', targetId: 'ectofuntus', targetName: 'Ectofuntus Worship', region: 'moryskah', details: '4x prayer XP. Moryskah-locked method.', obscure: false });

// Pearl — jewelry, fishing, herblore
use(87603, { type: 'recipe', targetId: 'pearl_necklace', targetName: 'Pearl Necklace', region: null, details: 'Obvious: jewelry crafting.', obscure: false });
use(87603, { type: 'recipe', targetId: 'pearl_fishing_lure', targetName: 'Pearl Fishing Lure', region: 'saltbrine_reach', details: 'Doubles anglerfish catch rate.', obscure: true });
use(87603, { type: 'secondary', targetId: 'dream_focus_amulet', targetName: 'Inkweald Dream Focus', region: 'inkweald', details: 'Dream potion secondary.', obscure: true });
use(87603, { type: 'combination', targetId: 'pearl_teleport_amulet', targetName: 'Pearl Teleport Amulet', region: 'saltbrine_reach', details: 'Teleports to coastal cities and Inkweald.', obscure: false });

// Coal — smithing, firemaking, ritual
use(2104, { type: 'recipe', targetId: 'smithing_steel', targetName: 'Steel Bar Smelting', region: null, details: 'Obvious: smithing.', obscure: false });
use(2104, { type: 'recipe', targetId: 'bonfire_high_heat', targetName: 'High-Heat Bonfire', region: null, details: 'Firemaking: coal boosts bonfire XP.', obscure: true });
use(2104, { type: 'offering', targetId: 'moryskah_ritual_offering', targetName: 'Moryskah Blood Ritual', region: 'moryskah', details: 'Obscure: coal as offering to Moryskah altars.', obscure: true });
use(2104, { type: 'charge', targetId: 'sootworks_furnace_fuel', targetName: 'Sootworks Foundry Fuel', region: 'sootworks', details: 'Fuels blast furnace.', obscure: false });

// Ashes — demon drops, multiple uses
use(101, { type: 'offering', targetId: 'ashes_scatter', targetName: 'Scatter Ashes', region: null, details: 'Prayer XP.', obscure: false });
use(101, { type: 'recipe', targetId: 'construction_mortar', targetName: 'Construction Mortar', region: null, details: 'Construction: premium mortar mix.', obscure: true });
use(101, { type: 'recipe', targetId: 'farming_soil_enhancer', targetName: 'Farming Soil Enhancer', region: null, details: 'Farming: prevents crop disease.', obscure: true });
use(101, { type: 'secondary', targetId: 'herblore_serum', targetName: 'Herblore Demon-Bane Serum', region: null, details: 'Herblore: anti-demon potion secondary.', obscure: true });

// Blood runes — multiple uses
use(11358, { type: 'charge', targetId: 'scythe_charge', targetName: 'Scythe of Malachar', region: null, details: 'Obvious: weapon charge.', obscure: false });
use(11358, { type: 'charge', targetId: 'sanguinesti_charge', targetName: 'Sanguinesti Staff', region: null, details: 'Weapon charge.', obscure: false });
use(11358, { type: 'recipe', targetId: 'blood_imbued_gear', targetName: 'Blood-Imbued Crafting', region: 'moryskah', details: 'Crafts vampiric equipment.', obscure: true });
use(11358, { type: 'offering', targetId: 'moryskah_blood_rite', targetName: 'Moryskah Blood Rite', region: 'moryskah', details: 'Quest item component.', obscure: true });

// Wolfbane — herblore, repellent, quest
use(87401, { type: 'secondary', targetId: 'herblore_lycanthropy_cure', targetName: 'Lycanthropy Cure', region: null, details: 'Obvious: herblore secondary.', obscure: false });
use(87401, { type: 'combination', targetId: 'werewolf_repellent', targetName: 'Werewolf Repellent', region: 'moryskah', details: 'Crafts into wolf-repellent charms.', obscure: false });
use(87401, { type: 'quest_req', targetId: 'the_werewolfs_dilemma', targetName: 'The Werewolfs Dilemma', region: 'moryskah', details: 'Quest gate item.', obscure: false });
use(87401, { type: 'recipe', targetId: 'silver_tipped_weapon', targetName: 'Silver-Tipped Weapon', region: null, details: 'Smithing: werewolf-slaying weapons.', obscure: true });

// Spider silk — Moryskah export with Saltbrine demand
use(87405, { type: 'combination', targetId: 'spider_silk_sail', targetName: 'Spider Silk Sail', region: 'saltbrine_reach', details: 'Repairs Saltbrine ships.', obscure: true });
use(87405, { type: 'recipe', targetId: 'silk_bowstring', targetName: 'Silk Bowstring', region: null, details: 'Fletching: lightweight bowstring.', obscure: true });
use(87405, { type: 'recipe', targetId: 'silk_net', targetName: 'Silk Hunting Net', region: null, details: 'Hunter: butterfly/bird trapping.', obscure: true });

// Crystal shard — Veilwood export, many uses
use(87201, { type: 'charge', targetId: 'crystal_weapon_charge', targetName: 'Crystal Weapon Charge', region: null, details: 'Recharges crystal bow/scythe.', obscure: false });
use(87201, { type: 'combination', targetId: 'prismatic_lens', targetName: 'Prismatic Lens', region: null, details: 'Three-region lens crafting.', obscure: false });
use(87201, { type: 'combination', targetId: 'ectoplasmic_focus', targetName: 'Ectoplasmic Focus', region: null, details: 'Magic focus crafting.', obscure: false });
use(87201, { type: 'secondary', targetId: 'herblore_crystal_potion', targetName: 'Crystal Potion', region: 'veilwood', details: 'Boosts crystal gear stats.', obscure: true });

// Phoenix feather — Boneyard export, multi-use
use(87101, { type: 'combination', targetId: 'phoenix_ember_plate', targetName: 'Phoenix Ember Plate', region: null, details: 'Fire-resistant armor.', obscure: false });
use(87101, { type: 'secondary', targetId: 'herblore_fire_immunity', targetName: 'Fire Immunity Potion', region: null, details: 'Glass Desert / Fight Caves prep.', obscure: false });
use(87101, { type: 'offering', targetId: 'boneyard_pyramid_offering', targetName: 'Pyramid Offering', region: 'boneyard_wastes', details: 'Unlocks hidden pyramid chambers.', obscure: true });

// Bat wing — Moryskah ONLY, critical herblore
use(87403, { type: 'secondary', targetId: 'super_restore_potion', targetName: 'Super Restore Potion', region: null, details: 'Most important potion. Moryskah bottleneck.', obscure: false });
use(87403, { type: 'recipe', targetId: 'bat_leather', targetName: 'Bat Leather Armor', region: null, details: 'Silent movement armor (hunter).', obscure: true });
use(87403, { type: 'offering', targetId: 'moryskah_bat_shrine', targetName: 'Moryskah Bat Shrine', region: 'moryskah', details: 'Summons bat familiar for 30 min.', obscure: true });

// Sea salt — Saltbrine, multi-use
use(87601, { type: 'recipe', targetId: 'food_preservation', targetName: 'Food Preservation', region: null, details: 'Cooking: food lasts 2x longer.', obscure: false });
use(87601, { type: 'combination', targetId: 'prismatic_lens', targetName: 'Prismatic Lens', region: null, details: 'Three-region lens ingredient.', obscure: false });
use(87601, { type: 'offering', targetId: 'moryskah_undead_cure', targetName: 'Undead Salt Cure', region: 'moryskah', details: 'Purifies undead-tainted items.', obscure: true });

// Venom gland — Boneyard, Saltbrine dependency
use(87106, { type: 'combination', targetId: 'saltbrine_blowdart', targetName: 'Saltbrine Blowdart', region: 'saltbrine_reach', details: 'Venomous dart tips.', obscure: false });
use(87106, { type: 'secondary', targetId: 'herblore_weapon_poison', targetName: 'Weapon Poison Potion', region: null, details: 'Applies poison to weapons.', obscure: false });
use(87106, { type: 'recipe', targetId: 'glass_desert_antivenom', targetName: 'Antivenom', region: null, details: 'Cures poison. Cross-region.', obscure: true });

// Mummified wrappings — Boneyard, prayer
use(87104, { type: 'combination', targetId: 'mummified_prayer_wrap', targetName: 'Mummified Prayer Wrap', region: null, details: 'Prayer consumable (cross-region).', obscure: false });
use(87104, { type: 'combination', targetId: 'sun_bleached_offering', targetName: 'Sun-Bleached Offering', region: 'glass_desert', details: 'Prayer ritual.', obscure: false });
use(87104, { type: 'recipe', targetId: 'mummy_armor', targetName: 'Mummy-Wrap Armor', region: 'boneyard_wastes', details: 'Sandstorm-resistant armor.', obscure: true });

// Magnetite ore — Boneyard, unique compass material
use(87103, { type: 'combination', targetId: 'smugglers_compass', targetName: 'Smugglers Compass', region: null, details: 'Cross-region navigation tool.', obscure: false });
use(87103, { type: 'recipe', targetId: 'boneyard_compass', targetName: 'Boneyard Compass', region: 'boneyard_wastes', details: 'Sandstorm navigation.', obscure: false });
use(87103, { type: 'recipe', targetId: 'magnetic_pickaxe', targetName: 'Magnetic Pickaxe', region: null, details: 'Mining: attracts nearby ore.', obscure: true });

// Lucid essence — Inkweald, central crafting material
use(87501, { type: 'recipe', targetId: 'dream_potion', targetName: 'Dream Potion', region: 'inkweald', details: 'Enter dream state.', obscure: false });
use(87501, { type: 'combination', targetId: 'wyrm_heart_pendant', targetName: 'Wyrm-Heart Pendant', region: 'glass_desert', details: 'Endgame amulet.', obscure: false });
use(87501, { type: 'combination', targetId: 'ectoplasmic_focus', targetName: 'Ectoplasmic Focus', region: 'moryskah', details: 'Magic focus.', obscure: false });
use(87501, { type: 'combination', targetId: 'prismatic_dream_robe', targetName: 'Prismatic Dream Robe', region: null, details: 'Caster robe.', obscure: false });

// Soot-iron ore — Sootworks, multiple endgame uses
use(87301, { type: 'combination', targetId: 'dream_forged_steel', targetName: 'Dream-Forged Steel', region: 'inkweald', details: 'Endgame bars.', obscure: false });
use(87301, { type: 'combination', targetId: 'phoenix_ember_plate', targetName: 'Phoenix Ember Plate', region: 'sootworks', details: 'Fire armor.', obscure: false });
use(87301, { type: 'recipe', targetId: 'clockwork_parts', targetName: 'Clockwork Parts', region: 'sootworks', details: 'Mechanical item crafting.', obscure: false });

// Dream mote — Inkweald, niche but unique
use(87502, { type: 'combination', targetId: 'dream_forged_steel', targetName: 'Dream-Forged Steel', region: null, details: 'Smithing bar.', obscure: false });
use(87502, { type: 'secondary', targetId: 'herblore_lucid_boost', targetName: 'Lucid Boost Potion', region: 'inkweald', details: 'Doubles magic XP for 30s.', obscure: true });
use(87502, { type: 'quest_req', targetId: 'the_inkweald_door', targetName: 'The Inkweald Door', region: 'inkweald', details: 'Quest item.', obscure: false });

// Kraken ink — Saltbrine, multi-use
use(87605, { type: 'combination', targetId: 'blessed_kraken_harpoon', targetName: 'Blessed Kraken Harpoon', region: 'saltbrine_reach', details: 'Cursed-water fishing BIS.', obscure: false });
use(87605, { type: 'combination', targetId: 'kraken_ink_tattoo', targetName: 'Kraken Ink Tattoo', region: null, details: 'Permanent cosmetic + waterbreathing.', obscure: false });
use(87605, { type: 'secondary', targetId: 'herblore_underwater_breath', targetName: 'Underwater Breath Potion', region: 'saltbrine_reach', details: 'Herblore secondary.', obscure: true });

// Clockwork gear — Sootworks, cross-region uses
use(87302, { type: 'combination', targetId: 'clockwork_scarab', targetName: 'Clockwork Scarab', region: null, details: 'Mechanical pet.', obscure: false });
use(87302, { type: 'recipe', targetId: 'trap_mechanism', targetName: 'Hunter Trap Mechanism', region: null, details: 'Hunter: upgrades trap efficiency.', obscure: true });
use(87302, { type: 'recipe', targetId: 'clockwork_door', targetName: 'Clockwork POH Door', region: 'sootworks', details: 'Construction: automatic doors.', obscure: true });

// Tombstone rubble — Moryskah, construction + smithing
use(87404, { type: 'recipe', targetId: 'construction_rubble_blocks', targetName: 'Tombstone Construction', region: 'moryskah', details: 'Moryskah POH theming.', obscure: false });
use(87404, { type: 'combination', targetId: 'enchanted_silver_blade', targetName: 'Enchanted Silver Blade', region: 'moryskah', details: 'Smithing flux.', obscure: false });
use(87404, { type: 'secondary', targetId: 'herblore_grave_dust', targetName: 'Grave Dust Potion', region: 'moryskah', details: 'Anti-undead secondary.', obscure: true });

// Fossilized bones — Boneyard
use(87107, { type: 'offering', targetId: 'fossil_bone_altar', targetName: 'Fossil Bone Altar', region: 'boneyard_wastes', details: 'Prayer XP (superior tier).', obscure: false });
use(87107, { type: 'combination', targetId: 'scarab_bone_fossil_tool', targetName: 'Scarab-Bone Fossil Tool', region: 'boneyard_wastes', details: 'Dig tool.', obscure: false });
use(87107, { type: 'recipe', targetId: 'sootworks_bone_alloy', targetName: 'Bone Alloy Smithing', region: 'sootworks', details: 'Smithing: +5% strength bonus gear.', obscure: true });

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 5 — PRESTIGE GOALS PER REGION
// The "final objective" for each region that makes area-locked play meaningful.
// ══════════════════════════════════════════════════════════════════════════════

const PRESTIGE_GOALS = {
  heartlands: {
    name: 'The Grand Feast',
    description: 'Host a 10-course feast at the Heartlands Cooking Guild using ONLY Heartlands-sourced ingredients. Serve the Royal Court. Earn the title of Master Chef.',
    requirements: { skills: { cooking: 90, farming: 75, fishing: 70 } },
    bosses: ['evil_chef_boss'],
    uniqueItems: ['master_chef_apron', 'culinaromancer_gloves'],
    flavor: 'social / culinary prestige',
  },
  boneyard_wastes: {
    name: 'The Pharaohs Reckoning',
    description: 'Defile the sealed tomb of Pharaoh Senekhet. Defeat his mummy lord guardians, solve the pyramid puzzles, and claim the Ankh of Rebirth.',
    requirements: { skills: { thieving: 75, agility: 65, magic: 60, prayer: 55 } },
    bosses: ['pharaoh_senekhet', 'three_mummy_lords'],
    uniqueItems: ['ankh_of_rebirth', 'pharaohs_crown'],
    flavor: 'tomb raider / prayer',
  },
  veilwood: {
    name: 'Song of the Elves',
    description: 'Complete the Veilwood ritual. Restore the Great Ash. Walk the path of the Moon Elder. Unlock the Inner Sanctum.',
    requirements: { skills: { agility: 70, construction: 70, farming: 70, herblore: 70, hunter: 70, mining: 70, smithing: 70, woodcutting: 70 } },
    bosses: ['seren_shade', 'corrupted_elder'],
    uniqueItems: ['crystal_halberd', 'elder_crown'],
    flavor: 'ritual / endgame quest',
  },
  sootworks: {
    name: 'The Clockwork Heart',
    description: 'Build and activate the Sootworks Titan — a massive clockwork golem that patrols the foundry. Forge its heart, animate it, and best it in combat.',
    requirements: { skills: { smithing: 85, construction: 75, crafting: 70, mining: 70 } },
    bosses: ['sootworks_titan'],
    uniqueItems: ['clockwork_heart_core', 'steampunk_greataxe'],
    flavor: 'engineering / smithing',
  },
  moryskah: {
    name: 'The Barrows Brothers Challenge',
    description: 'Defeat all 6 Barrows Brothers in a single run. Claim the full set of degradable armor. Lay them to rest permanently.',
    requirements: { skills: { attack: 75, magic: 75, prayer: 43, defence: 70 } },
    bosses: ['dharok', 'guthan', 'verac', 'ahrim', 'karil', 'torag'],
    uniqueItems: ['amulet_of_the_damned', 'all_barrows_sets'],
    flavor: 'combat / prayer-switching',
  },
  inkweald: {
    name: 'Waking the Dreaming One',
    description: 'Navigate the dream labyrinth. Confront the Dreaming One — a primordial entity that gave the Inkweald its surreal nature. Make a choice: wake it or let it slumber.',
    requirements: { skills: { magic: 85, herblore: 75, runecrafting: 70, agility: 60 } },
    bosses: ['the_dreaming_one'],
    uniqueItems: ['dream_talisman', 'lucid_staff'],
    flavor: 'magic / moral choice',
  },
  saltbrine_reach: {
    name: 'The Kraken Hunt',
    description: 'Assemble a crew, charter a ship, and hunt the Deep Kraken in its lair. BIS fishing and combat gear required.',
    requirements: { skills: { fishing: 80, attack: 70, ranged: 75, prayer: 60 } },
    bosses: ['deep_kraken_prime'],
    uniqueItems: ['kraken_tentacle_whip', 'sailors_necklace'],
    flavor: 'naval / fishing boss',
  },
  glass_desert: {
    name: 'Slaying the Crystal Wyrm',
    description: 'The endgame. Defeat Veldrak the Crystal Wyrm — Aelgards ultimate tier 5 boss. Claim the Dragon Hunter Lance components.',
    requirements: { skills: { attack: 90, ranged: 90, magic: 85, prayer: 77, hitpoints: 90, herblore: 80 } },
    bosses: ['veldrak_the_crystal_wyrm'],
    uniqueItems: ['crystal_wyrm_scale_cape', 'dragon_hunter_lance'],
    flavor: 'endgame pinnacle',
  },
  the_wilds: {
    name: 'Coronation of the Revenant King',
    description: 'Defeat the Revenant King deep in the Wilderness. Survive multiple PKer ambushes. Emerge with the Wilderness Crown.',
    requirements: { skills: { attack: 85, ranged: 80, prayer: 75, hitpoints: 85 } },
    bosses: ['revenant_king'],
    uniqueItems: ['wilderness_crown', 'revenant_ether_mace'],
    flavor: 'PvP-risk survival',
  },
};

console.log(`[aelgard] Cross-Region Web loaded: ${sourceCount} sources, ${useCount} uses, ${comboCount} combinations, ${Object.keys(PRESTIGE_GOALS).length} prestige goals`);

module.exports = { PRESTIGE_GOALS };
