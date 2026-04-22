// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — The Wilds Deepening (PvP Zone)
//
// Target: push The Wilds from gap=39 to 70+.
// Current state: 31 methods, 0 blocked, needs ~63 more methods.
//
// The Wilds is the PvP zone. Superior rewards (up to 5x) balanced by the risk
// of item loss. PKers can take items, not XP. Escape mechanics: teleblock,
// glory, clan wars portal. Stackable unstackables = longer stays = more risk.
//
// Voice: cold clipped sentences. No mercy. Distance measured in tiles from
// safety. "Twenty-three. Twenty-two. Now." Names: skull-gold, grave-mile,
// third-ditch, teleblocked, no-honor, long-road.
//
// Flavor zones (each a distinct sub-area with its own skills):
//   Edgeward Ditch            — level 1-20 wilds, starter PvP, revenant imps
//   Third-Ditch Line          — level 20-30 wilds, lower revenants, abyss line
//   Skull-Gold Ruins          — level 30-40 wilds, chaos fanatic, greater demons
//   Grave-Mile Plateau        — level 40-50 wilds, scorpia, fiends
//   Long-Road Wastes          — level 50-60 wilds, mid revenants, chaos elemental
//   No-Honor Ridge            — level 60-80 wilds, callisto territory
//   Teleblocked Deep          — level 80+ wilds, vet'ion, venenatis, deep agility
//   The Mage Arena            — magic-only zone, KBD lair entrance
//   King Black Dragon Lair    — deep wilderness boss
//   Revenant Caves            — PvP-enabled PvM, ether drops
//   Wilderness Agility Course — 52 agility, dispenser drop
//   Rune Rock Node            — F2P wilds rune rocks at level 46 wilds
//   Magic Trees (Wilds)       — only wilds magic tree grove
//   Wilderness Herb Patch     — wilds-only herb patch, no disease
//   Deep Resource Arena       — level 30+ wilds, f2p resource area equivalent
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const rel = require('../../data/relationships');

// ══════════════════════════════════════════════════════════════════════════════
// WILDS-NATIVE ITEM SOURCES (IDs 99500-99999)
// Revenants drop charges, bosses drop BIS PvP gear, resources at wilds-only tiers
// ══════════════════════════════════════════════════════════════════════════════

// Revenants — PvM in PvP zone, drops wilderness weapon ether
rel.registerItemSource(99500, { type: 'drop', sourceId: 'wilds_revenant_imp', sourceName: 'Revenant Imp', region: 'the_wilds', details: 'Level-one revenant. Drops ether + starter PvP seed. Hits like a grown dog.', obscure: false });
rel.registerItemSource(99501, { type: 'drop', sourceId: 'wilds_revenant_goblin', sourceName: 'Revenant Goblin', region: 'the_wilds', details: 'Third-ditch revenant. Drops ether. Drops small amulet-of-avarice seeds.', obscure: false });
rel.registerItemSource(99502, { type: 'drop', sourceId: 'wilds_revenant_hobgoblin', sourceName: 'Revenant Hobgoblin', region: 'the_wilds', details: 'Skull-gold revenant. Ether. Rare drop: bracelet-of-ethereum shard.', obscure: false });
rel.registerItemSource(99503, { type: 'drop', sourceId: 'wilds_revenant_hellhound', sourceName: 'Revenant Hellhound', region: 'the_wilds', details: 'Grave-mile revenant. Ether at better rate. Bow-of-grave-mile fragment.', obscure: true });
rel.registerItemSource(99504, { type: 'drop', sourceId: 'wilds_revenant_demon', sourceName: 'Revenant Demon', region: 'the_wilds', details: 'No-honor revenant. Ether cascade. Chainmace-of-no-honor shard.', obscure: false });
rel.registerItemSource(99505, { type: 'drop', sourceId: 'wilds_revenant_dark_beast', sourceName: 'Revenant Dark Beast', region: 'the_wilds', details: 'Teleblocked-deep revenant. Peak ether. Ankou-of-the-long-road bone.', obscure: true });
rel.registerItemSource(99506, { type: 'drop', sourceId: 'wilds_revenant_knight', sourceName: 'Revenant Knight', region: 'the_wilds', details: 'Deep revenant. Drops wilds-only rare: Statius-plate fragment.', obscure: true });

// Wilderness-exclusive BIS — Vesta, Statius, Morrigan, Zuriel equivalents
rel.registerItemSource(99510, { type: 'drop', sourceId: 'wilds_vesta_drop', sourceName: "Vesta's Relic Chest", region: 'the_wilds', details: "Vesta's longsword fragment. Melee BIS-equal. Degrades on death.", obscure: false });
rel.registerItemSource(99511, { type: 'drop', sourceId: 'wilds_vesta_drop', sourceName: "Vesta's Relic Chest", region: 'the_wilds', details: "Vesta's spear fragment. Two-handed, always hits. Melee BIS at extended range.", obscure: false });
rel.registerItemSource(99512, { type: 'drop', sourceId: 'wilds_statius_drop', sourceName: "Statius's Relic Chest", region: 'the_wilds', details: "Statius's warhammer fragment. Crushes defence by 30% per spec.", obscure: false });
rel.registerItemSource(99513, { type: 'drop', sourceId: 'wilds_statius_drop', sourceName: "Statius's Relic Chest", region: 'the_wilds', details: "Statius's full helm. BIS tank helm, wilds-only-equip.", obscure: false });
rel.registerItemSource(99514, { type: 'drop', sourceId: 'wilds_morrigan_drop', sourceName: "Morrigan's Relic Chest", region: 'the_wilds', details: "Morrigan's throwing axe. Ranged spec that bleeds 25% max HP.", obscure: false });
rel.registerItemSource(99515, { type: 'drop', sourceId: 'wilds_morrigan_drop', sourceName: "Morrigan's Relic Chest", region: 'the_wilds', details: "Morrigan's javelin. Ranged BIS one-hand for PvP, wilds-only.", obscure: false });
rel.registerItemSource(99516, { type: 'drop', sourceId: 'wilds_zuriel_drop', sourceName: "Zuriel's Relic Chest", region: 'the_wilds', details: "Zuriel's staff. Magic BIS for the wilds. Autocast teleblock at 20% less rune cost.", obscure: false });

// Amulet-of-Fury equivalent — wilds-exclusive stackable amulet
rel.registerItemSource(99520, { type: 'drop', sourceId: 'wilds_callisto', sourceName: 'Callisto', region: 'the_wilds', details: "Amulet of No-Honor. Wilds answer to Amulet of Fury. Stackable (1k per slot).", obscure: false });
rel.registerItemSource(99521, { type: 'drop', sourceId: 'wilds_venenatis', sourceName: 'Venenatis', region: 'the_wilds', details: "Treasonous ring shard. Becomes Ring of Treason, the wilds' BIS melee ring.", obscure: false });
rel.registerItemSource(99522, { type: 'drop', sourceId: 'wilds_vetion', sourceName: "Vet'ion", region: 'the_wilds', details: "Ring of the Long Road. Wilds' BIS magic ring. Teleport delay reduced 2 ticks.", obscure: false });
rel.registerItemSource(99523, { type: 'drop', sourceId: 'wilds_scorpia', sourceName: 'Scorpia', region: 'the_wilds', details: "Scorpia's offspring pet seed. Only wilds boss that drops a combat familiar.", obscure: false });
rel.registerItemSource(99524, { type: 'drop', sourceId: 'wilds_chaos_elemental', sourceName: 'Chaos Elemental', region: 'the_wilds', details: "Unstable orb. Random teleport trinket. +10% magic damage in wilds.", obscure: false });
rel.registerItemSource(99525, { type: 'drop', sourceId: 'wilds_chaos_fanatic', sourceName: 'Chaos Fanatic', region: 'the_wilds', details: "Odium ward shard. Ranged defensive shield. Three shards = Odium Ward.", obscure: false });
rel.registerItemSource(99526, { type: 'drop', sourceId: 'wilds_crazy_archaeologist', sourceName: 'Crazy Archaeologist', region: 'the_wilds', details: "Malediction ward shard. Magic defensive shield. Three shards = Malediction Ward.", obscure: false });

// Wilds resource tiers — rune rocks, magic trees, herb patches at higher levels than safe
rel.registerItemSource(99530, { type: 'gathering', sourceId: 'wilds_rune_rocks', sourceName: 'Wilderness Rune Rocks', region: 'the_wilds', details: "Rune ore. Respawns 2x faster than any safe zone. 13 rocks in one node.", obscure: false });
rel.registerItemSource(99531, { type: 'gathering', sourceId: 'wilds_magic_trees', sourceName: 'Wilderness Magic Tree Grove', region: 'the_wilds', details: "Magic logs. 9 trees in one grove. Highest density in Aelgard.", obscure: false });
rel.registerItemSource(99532, { type: 'gathering', sourceId: 'wilds_herb_patch', sourceName: 'Wilderness Herb Patch', region: 'the_wilds', details: "Herbs. Never diseases. No payment needed. No protection available.", obscure: false });
rel.registerItemSource(99533, { type: 'gathering', sourceId: 'wilds_fossil_pit', sourceName: 'Fossil Pit', region: 'the_wilds', details: "Wilderness fossils. Herblore tertiary. Bonecrusher upgrade material.", obscure: true });
rel.registerItemSource(99534, { type: 'gathering', sourceId: 'wilds_lava_maze_runite', sourceName: 'Lava Maze Runite', region: 'the_wilds', details: "Runite ore. Lava Maze cluster of 4 rune rocks. Deep-wild, teleblocked zone.", obscure: false });
rel.registerItemSource(99535, { type: 'gathering', sourceId: 'wilds_resource_arena', sourceName: 'Wilderness Resource Arena', region: 'the_wilds', details: "Paid-entry resource bank. Banks inside, runite inside, fishing inside. 7500gp entry.", obscure: false });

// Wilderness slayer exclusives
rel.registerItemSource(99540, { type: 'drop', sourceId: 'wilds_slayer_ankou', sourceName: 'Wilderness Ankou', region: 'the_wilds', details: "Death rune drops. Wilderness slayer task exclusive.", obscure: false });
rel.registerItemSource(99541, { type: 'drop', sourceId: 'wilds_slayer_greater_nechryael', sourceName: 'Greater Nechryael', region: 'the_wilds', details: "Soulsplit scroll fragment. Three fragments = Soulsplit prayer unlock.", obscure: true });
rel.registerItemSource(99542, { type: 'drop', sourceId: 'wilds_slayer_black_demon', sourceName: 'Wilderness Black Demon', region: 'the_wilds', details: "Demonic ashes (wilds-grade). Prayer XP triple vs regular demonic ashes.", obscure: false });
rel.registerItemSource(99543, { type: 'drop', sourceId: 'wilds_slayer_abyssal_demon', sourceName: 'Wilderness Abyssal Demon', region: 'the_wilds', details: "Abyssal whip shard (wilds). Two shards = Whip of No-Honor. Wilds-BIS melee.", obscure: false });
rel.registerItemSource(99544, { type: 'drop', sourceId: 'wilds_slayer_hellhound', sourceName: 'Wilderness Hellhound', region: 'the_wilds', details: "Hellhound bone. Bones stack in wilds (unique mechanic).", obscure: false });
rel.registerItemSource(99545, { type: 'drop', sourceId: 'wilds_slayer_lava_dragon', sourceName: 'Lava Dragon', region: 'the_wilds', details: "Lava dragon bones. Only bone-type unique to the wilds. 85 prayer XP each.", obscure: false });

// Stackable normally-unstackable items (wilds-only mechanic, increases risk/reward)
rel.registerItemSource(99550, { type: 'processing', sourceId: 'wilds_stackable_food', sourceName: 'Blighted Food Packing', region: 'the_wilds', details: "Blighted sharks stack 1000/slot in wilds. Cheaper, wilds-only consumption.", obscure: false });
rel.registerItemSource(99551, { type: 'processing', sourceId: 'wilds_stackable_potions', sourceName: 'Blighted Potion Packing', region: 'the_wilds', details: "Blighted super restores stack 500/slot. Wilds-only use.", obscure: false });
rel.registerItemSource(99552, { type: 'drop', sourceId: 'wilds_looting_bag_bigger', sourceName: 'Looting Bag (Long-Road)', region: 'the_wilds', details: "Looting bag upgrade. Holds 70 items. Deep-wild revenant table drop.", obscure: true });
rel.registerItemSource(99553, { type: 'drop', sourceId: 'wilds_divine_rune_pouch', sourceName: 'Divine Rune Pouch', region: 'the_wilds', details: "Rune pouch with 4 slots (instead of 3). Ferox chest long chain.", obscure: true });

// ══════════════════════════════════════════════════════════════════════════════
// TRAINING METHODS — 50+ methods, Wilds-tier bonuses with PvP risk
// Each method has a PvP risk multiplier applied to rewards.
// ══════════════════════════════════════════════════════════════════════════════

// ── ATTACK ──────────────────────────────────────────────────────────────────
rel.defineTrainingMethod('wilds_edgeward_pk_drill', {
  skill: 'attack', name: 'Edgeward Ditch PvP Drill',
  levelRange: [1, 40],
  xpPerHour: 32000,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Skull-gold coins', perHour: 22000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'medium', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Basic food', perHour: 40, source: 'cooking' }],
  description: 'The first ditch. Twenty tiles from safety. Drill attack against the level-ones who wandered too far. PvP risk multiplier applied to all XP.',
  location: 'The Wilds',
});

rel.defineTrainingMethod('wilds_revenant_hellhound_melee', {
  skill: 'attack', name: 'Revenant Hellhound Melee',
  levelRange: [60, 99],
  xpPerHour: 135000,
  prerequisites: { skills: { attack: 60 }, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Revenant ether', perHour: 800 }, { name: 'Skull-gold coins', perHour: 400000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 60000,
  danger: 'high', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Blighted shark', perHour: 120, source: 'wilds_stackable_food' }, { name: "Viggora's chainmace", perHour: 1, source: 'wilds_revenant_hellhound' }],
  description: 'Grave-mile revenants. Melee with Viggora charged against the hellhound pack. PKers will come. Logout tabs ready. Ether rains when they do not.',
  location: 'The Wilds',
  breakpointAt: 60,
});

// ── STRENGTH ────────────────────────────────────────────────────────────────
rel.defineTrainingMethod('wilds_chaos_fanatic_strength', {
  skill: 'strength', name: 'Chaos Fanatic — Strength Grind',
  levelRange: [50, 90],
  xpPerHour: 98000,
  prerequisites: { skills: { strength: 50 }, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Odium ward shard', perHour: 2 }, { name: 'Skull-gold coins', perHour: 250000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 20000,
  danger: 'high', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Blighted shark', perHour: 60, source: 'wilds_stackable_food' }],
  description: 'Chaos Fanatic. Level-forty wilds. He hits random magic. Your strength carries the fight. PKers attack during his magic phase — watch the ditch count.',
  location: 'The Wilds',
});

rel.defineTrainingMethod('wilds_revenant_demon_strength', {
  skill: 'strength', name: 'Revenant Demon Crush',
  levelRange: [70, 99],
  xpPerHour: 150000,
  prerequisites: { skills: { strength: 70 }, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Revenant ether', perHour: 1200 }, { name: 'Chainmace shard', perHour: 0.5 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 70000,
  danger: 'high', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Blighted shark', perHour: 140, source: 'wilds_stackable_food' }, { name: "Viggora's chainmace", perHour: 1, source: 'wilds_revenant_demon' }],
  description: 'No-honor revenants. The demon strain. Strength per swing is the highest in the wilds. Teleblocked deep means twenty-three tiles from safety minimum.',
  location: 'The Wilds',
});

// ── DEFENCE ─────────────────────────────────────────────────────────────────
rel.defineTrainingMethod('wilds_greater_demon_defence', {
  skill: 'defence', name: 'Greater Demon Defence Grind',
  levelRange: [55, 90],
  xpPerHour: 82000,
  prerequisites: { skills: { defence: 55 }, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Ashes', perHour: 300 }, { name: 'Skull-gold coins', perHour: 180000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 15000,
  danger: 'high', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Blighted monkfish', perHour: 80, source: 'wilds_stackable_food' }],
  description: 'Skull-gold ruins. Greater demons in groups of four. Defence XP faster than safe-zone greaters. PKer ambush rate: medium. Watch the long road.',
  location: 'The Wilds',
});

rel.defineTrainingMethod('wilds_callisto_defence', {
  skill: 'defence', name: 'Callisto — Defensive Bearhunt',
  levelRange: [75, 99],
  xpPerHour: 115000,
  prerequisites: { skills: { defence: 75 }, quests: ['third_ditch_ordeal'], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Callisto bear skin', perHour: 4 }, { name: 'Skull-gold coins', perHour: 650000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 90000,
  danger: 'extreme', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Blighted shark', perHour: 180, source: 'wilds_stackable_food' }, { name: 'Super restore (4)', perHour: 10, source: 'herblore' }],
  description: 'Callisto. No-honor ridge. The bear-of-the-long-road. Defensive solo kills. No-honor amulet drops here. The bear does not care about the ditch count.',
  location: 'The Wilds',
  breakpointAt: 75,
});

// ── HITPOINTS ───────────────────────────────────────────────────────────────
rel.defineTrainingMethod('wilds_edgeward_hp_grind', {
  skill: 'hitpoints', name: 'Edgeward Ditch HP Grind',
  levelRange: [1, 40],
  xpPerHour: 11000,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Skull-gold coins', perHour: 8000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'medium', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Basic food', perHour: 30, source: 'cooking' }],
  description: 'First ditch. Take hits from the rev-imps and learn the ditch count. Twenty tiles from the wall. HP per tick the same as attack per swing.',
  location: 'The Wilds',
});

rel.defineTrainingMethod('wilds_venenatis_hp', {
  skill: 'hitpoints', name: 'Venenatis — HP Trial',
  levelRange: [70, 99],
  xpPerHour: 24000,
  prerequisites: { skills: { hitpoints: 70 }, quests: ['third_ditch_ordeal'], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Venenatis fang', perHour: 3 }, { name: 'Skull-gold coins', perHour: 520000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 70000,
  danger: 'extreme', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Blighted shark', perHour: 150, source: 'wilds_stackable_food' }],
  description: 'Venenatis. Spider-queen of the third-ditch. Her webs do half your HP per tick. Each kill is a hitpoints lesson; the body remembers the bite.',
  location: 'The Wilds',
});

// ── RANGED ──────────────────────────────────────────────────────────────────
rel.defineTrainingMethod('wilds_crawbow_revenant_range', {
  skill: 'ranged', name: "Craw's Bow — Revenant Range",
  levelRange: [60, 99],
  xpPerHour: 155000,
  prerequisites: { skills: { ranged: 60 }, quests: [], items: [{ name: "Craw's bow" }], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Revenant ether', perHour: 1000 }, { name: 'Skull-gold coins', perHour: 420000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 60000,
  danger: 'high', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Blighted shark', perHour: 120, source: 'wilds_stackable_food' }],
  description: "Craw's bow. +50% accuracy and damage inside the wilderness. Revenant range. Logout tab on one, glory on two, teleblock detection on the belt.",
  location: 'The Wilds',
});

rel.defineTrainingMethod('wilds_crazy_archaeologist_range', {
  skill: 'ranged', name: 'Crazy Archaeologist — Ranged Grind',
  levelRange: [45, 85],
  xpPerHour: 88000,
  prerequisites: { skills: { ranged: 45 }, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Malediction ward shard', perHour: 2 }, { name: 'Skull-gold coins', perHour: 220000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 18000,
  danger: 'high', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Blighted monkfish', perHour: 70, source: 'wilds_stackable_food' }],
  description: 'Crazy Archaeologist. Skull-gold ruins south. His books. Your bow. The distance is five tiles. He teleblocks at thirty percent HP. Have a logout tab.',
  location: 'The Wilds',
});

rel.defineTrainingMethod('wilds_morrigan_throw_range', {
  skill: 'ranged', name: "Morrigan's Throw — Deep Range",
  levelRange: [80, 99],
  xpPerHour: 175000,
  prerequisites: { skills: { ranged: 80 }, quests: ['no_honor_ordeal'], items: [{ name: "Morrigan's javelin" }], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Skull-gold coins', perHour: 780000 }], net: 'profit' },
  bankingFrequency: 'frequent', costPerHour: 250000,
  danger: 'extreme', complexity: 'intense', attention: 'high',
  inputs: [{ name: "Morrigan's javelin", perHour: 800, source: 'wilds_morrigan_drop' }, { name: 'Blighted shark', perHour: 180, source: 'wilds_stackable_food' }],
  description: "Morrigan's javelin. It bleeds twenty-five percent max HP per hit. Degrades on death. Peak ranged XP in Aelgard. Peak wilds danger.",
  location: 'The Wilds',
  breakpointAt: 80,
});

// ── PRAYER ──────────────────────────────────────────────────────────────────
rel.defineTrainingMethod('wilds_chaos_altar_offering', {
  skill: 'prayer', name: 'Chaos Altar Offering',
  levelRange: [1, 99],
  xpPerHour: 420000,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [], net: 'loss' },
  bankingFrequency: 'frequent', costPerHour: 180000,
  danger: 'high', complexity: 'moderate', attention: 'high',
  inputs: [{ name: 'Dragon bones', perHour: 1800, source: 'combat_drops' }],
  description: 'The Chaos Altar. Level thirty-eight wilderness. Three-point-five times prayer XP — fifty percent chance to consume a bone without XP. Free entry. PKers know it.',
  location: 'The Wilds',
  breakpointAt: 1,
});

rel.defineTrainingMethod('wilds_lava_dragon_bones', {
  skill: 'prayer', name: 'Lava Dragon Bones on Chaos Altar',
  levelRange: [55, 99],
  xpPerHour: 580000,
  prerequisites: { skills: { prayer: 55 }, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [], net: 'loss' },
  bankingFrequency: 'frequent', costPerHour: 320000,
  danger: 'high', complexity: 'moderate', attention: 'high',
  inputs: [{ name: 'Lava dragon bones', perHour: 1200, source: 'wilds_slayer_lava_dragon' }],
  description: 'Lava dragon bones. Chaos altar. The bones only drop in the wilds — so all your prayer XP is wilderness-earned. No-honor prayer. Eighty-five XP per bone.',
  location: 'The Wilds',
});

rel.defineTrainingMethod('wilds_demonic_ashes_scattering', {
  skill: 'prayer', name: 'Wilds Demonic Ashes Scattering',
  levelRange: [35, 99],
  xpPerHour: 265000,
  prerequisites: { skills: { prayer: 35 }, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'moderate', costPerHour: 50000,
  danger: 'medium', complexity: 'simple', attention: 'low',
  inputs: [{ name: 'Demonic ashes (wilds-grade)', perHour: 1500, source: 'wilds_slayer_black_demon' }],
  description: 'Scatter wilds-grade ashes at the ditch line. Triple XP vs regular demonic ashes. The wind carries it across the long road.',
  location: 'The Wilds',
});

// ── MAGIC ───────────────────────────────────────────────────────────────────
rel.defineTrainingMethod('wilds_mage_arena_training', {
  skill: 'magic', name: 'The Mage Arena — God Spells',
  levelRange: [60, 99],
  xpPerHour: 185000,
  prerequisites: { skills: { magic: 60 }, quests: ['the_mage_arena_trial'], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Skull-gold coins', perHour: 0 }], net: 'loss' },
  bankingFrequency: 'frequent', costPerHour: 280000,
  danger: 'medium', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Blood rune', perHour: 4000, source: 'runecrafting' }, { name: 'Death rune', perHour: 2000, source: 'runecrafting' }],
  description: 'Mage Arena. Level fifty-six wilderness. God spells — Flames of Zamorak, Saradomin Strike, Claws of Guthix. The arena is a safe pocket. Getting there is not.',
  location: 'The Wilds',
  breakpointAt: 60,
});

rel.defineTrainingMethod('wilds_zuriel_teleblock_cast', {
  skill: 'magic', name: "Zuriel's Staff — Teleblock Cascade",
  levelRange: [75, 99],
  xpPerHour: 220000,
  prerequisites: { skills: { magic: 75 }, quests: [], items: [{ name: "Zuriel's staff" }], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Skull-gold coins', perHour: 380000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 120000,
  danger: 'extreme', complexity: 'intense', attention: 'high',
  inputs: [{ name: 'Law rune', perHour: 2400, source: 'runecrafting' }, { name: 'Chaos rune', perHour: 3600, source: 'runecrafting' }, { name: 'Death rune', perHour: 2400, source: 'runecrafting' }],
  description: "Zuriel's staff. Teleblock at twenty-percent-less rune cost. Cast on PKers as they approach. The XP is the threat. The threat is the XP.",
  location: 'The Wilds',
});

rel.defineTrainingMethod('wilds_revenant_ice_burst_magic', {
  skill: 'magic', name: 'Revenant Ice Burst Range',
  levelRange: [70, 99],
  xpPerHour: 195000,
  prerequisites: { skills: { magic: 70 }, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Revenant ether', perHour: 2200 }, { name: 'Skull-gold coins', perHour: 520000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 180000,
  danger: 'high', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Death rune', perHour: 3000, source: 'runecrafting' }, { name: 'Chaos rune', perHour: 6000, source: 'runecrafting' }, { name: 'Water rune', perHour: 12000, source: 'runecrafting' }],
  description: 'Ice Burst into the revenant cave pack. Three revs at once, four if the goblins cluster. Magic XP per cast stacks across the burst radius.',
  location: 'The Wilds',
});

// ── RUNECRAFTING ────────────────────────────────────────────────────────────
rel.defineTrainingMethod('wilds_abyss_runecrafting', {
  skill: 'runecrafting', name: 'Wilderness Abyss Runecrafting',
  levelRange: [44, 99],
  xpPerHour: 85000,
  prerequisites: { skills: { runecrafting: 44 }, quests: ['enter_the_abyss'], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Runes (all types)', perHour: 18000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'medium', complexity: 'complex', attention: 'medium',
  inputs: [{ name: 'Pure essence', perHour: 18000, source: 'mining' }],
  description: 'The Abyss. Fastest runecrafting route in Aelgard. Wilderness entrance. PKers camp the abyss portal. Four skill obstacles through the core.',
  location: 'The Wilds',
  breakpointAt: 44,
});

rel.defineTrainingMethod('wilds_blood_rune_altar', {
  skill: 'runecrafting', name: 'Deep-Wild Blood Rune Altar',
  levelRange: [77, 99],
  xpPerHour: 90000,
  prerequisites: { skills: { runecrafting: 77 }, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Blood rune', perHour: 1600 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 0,
  danger: 'high', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Pure essence', perHour: 1600, source: 'mining' }, { name: 'Dark essence block', perHour: 1600, source: 'mining' }],
  description: 'Blood rune altar. Deep wilderness. Twenty-eight wilds levels from the nearest glory tab. The only fast blood altar in Aelgard.',
  location: 'The Wilds',
});

// ── CONSTRUCTION ────────────────────────────────────────────────────────────
rel.defineTrainingMethod('wilds_bandit_camp_barricades', {
  skill: 'construction', name: 'Bandit Camp Barricade Building',
  levelRange: [30, 80],
  xpPerHour: 320000,
  prerequisites: { skills: { construction: 30 }, quests: ['bandit_camp_alliance'], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [], net: 'loss' },
  bankingFrequency: 'frequent', costPerHour: 380000,
  danger: 'high', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Mahogany plank', perHour: 1200, source: 'woodcutting' }, { name: 'Nails', perHour: 4800, source: 'smithing' }],
  description: 'The bandit camp pays in skull-gold for barricade work. Level-nineteen wilderness. Build the wall. The wall is what stops the PKer wave at the gate.',
  location: 'The Wilds',
});

// ── AGILITY ─────────────────────────────────────────────────────────────────
rel.defineTrainingMethod('wilds_agility_course', {
  skill: 'agility', name: 'Wilderness Agility Course',
  levelRange: [52, 99],
  xpPerHour: 62000,
  prerequisites: { skills: { agility: 52 }, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Marks of grace', perHour: 18 }, { name: 'Wilderness agility dispenser loot', perHour: 12 }], net: 'profit' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'high', complexity: 'moderate', attention: 'high',
  inputs: [],
  description: 'Wilderness agility course. Level fifty-two wilderness. The dispenser at the end drops skull-gold. PKers chase runners — the course is the escape and the training.',
  location: 'The Wilds',
  breakpointAt: 52,
});

rel.defineTrainingMethod('wilds_shortcut_network_running', {
  skill: 'agility', name: 'Wilds Shortcut Network',
  levelRange: [70, 99],
  xpPerHour: 84000,
  prerequisites: { skills: { agility: 70 }, quests: ['the_long_road_home'], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Marks of grace', perHour: 28 }], net: 'profit' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'high', complexity: 'complex', attention: 'high',
  inputs: [],
  description: 'Every wilds shortcut, in a chain. Skull-Gold to Grave-Mile to No-Honor to Teleblocked Deep. The route the escapers learn. The route the PKers also learn.',
  location: 'The Wilds',
});

// ── HERBLORE ────────────────────────────────────────────────────────────────
rel.defineTrainingMethod('wilds_herb_patch_tending', {
  skill: 'herblore', name: 'Wilds Herb Patch Tending',
  levelRange: [14, 99],
  xpPerHour: 58000,
  prerequisites: { skills: { herblore: 14 }, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Grimy herbs (all tiers)', perHour: 220 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 3000,
  danger: 'medium', complexity: 'moderate', attention: 'low',
  inputs: [{ name: 'Herb seeds', perHour: 25, source: 'ge_or_drops' }],
  description: 'The wilderness herb patch. Twenty tiles from a glory. Never diseases. No payment. No protection. The herbs come in stacks that would never grow safe.',
  location: 'The Wilds',
});

rel.defineTrainingMethod('wilds_antipk_potion_brewing', {
  skill: 'herblore', name: 'Anti-PK Potion Brewing',
  levelRange: [60, 99],
  xpPerHour: 145000,
  prerequisites: { skills: { herblore: 60 }, quests: ['the_long_road_home'], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Anti-PK potion(4)', perHour: 180 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'low', complexity: 'complex', attention: 'medium',
  inputs: [{ name: 'Wilderness herb', perHour: 180, source: 'wilds_herb_patch' }, { name: 'Deathstalker venom-gland', perHour: 180, source: 'combat_drops' }],
  description: 'Brew the anti-PK potion. Reduces incoming PvP damage ten percent for five minutes. Only brews inside the wilds; spoils outside within one tick.',
  location: 'The Wilds',
});

rel.defineTrainingMethod('wilds_blighted_potion_processing', {
  skill: 'herblore', name: 'Blighted Potion Processing',
  levelRange: [72, 99],
  xpPerHour: 210000,
  prerequisites: { skills: { herblore: 72 }, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Blighted super restore (4)', perHour: 900 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 0,
  danger: 'low', complexity: 'complex', attention: 'medium',
  inputs: [{ name: 'Super restore (4)', perHour: 900, source: 'herblore' }, { name: 'Revenant ether', perHour: 900, source: 'wilds_revenant_demon' }],
  description: 'Blight the potion. Super restores stack five hundred to a slot. The bulk pays the risk. The risk lives inside the wilds.',
  location: 'The Wilds',
});

// ── THIEVING ────────────────────────────────────────────────────────────────
rel.defineTrainingMethod('wilds_bandit_camp_thieving', {
  skill: 'thieving', name: 'Bandit Camp Pickpocket',
  levelRange: [30, 99],
  xpPerHour: 92000,
  prerequisites: { skills: { thieving: 30 }, quests: ['bandit_camp_alliance'], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Skull-gold coins', perHour: 85000 }, { name: "Bandit's gold bundle", perHour: 60 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'medium', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Basic food', perHour: 30, source: 'cooking' }],
  description: 'The bandits do not protect their own. Pickpocket the camp. Level-nineteen wilderness. Skull appears every five minutes. The bandits cannot see it. PKers can.',
  location: 'The Wilds',
});

rel.defineTrainingMethod('wilds_pyromancer_steal', {
  skill: 'thieving', name: 'Wilderness Pyromancer Stall Theft',
  levelRange: [55, 99],
  xpPerHour: 128000,
  prerequisites: { skills: { thieving: 55 }, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Pyromancer reagents', perHour: 280 }, { name: 'Skull-gold coins', perHour: 140000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'high', complexity: 'complex', attention: 'high',
  inputs: [],
  description: 'Pyromancer stalls at the wintertodt camp-the-outer-ditch. Steal reagents. Thirty tiles from safety. The pyromancers themselves are not your problem.',
  location: 'The Wilds',
});

// ── CRAFTING ────────────────────────────────────────────────────────────────
rel.defineTrainingMethod('wilds_bone_armor_crafting', {
  skill: 'crafting', name: 'Callisto Bone Armor Crafting',
  levelRange: [70, 99],
  xpPerHour: 165000,
  prerequisites: { skills: { crafting: 70 }, quests: ['no_honor_ordeal'], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Callisto bone armor piece', perHour: 12 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'medium', complexity: 'complex', attention: 'medium',
  inputs: [{ name: 'Callisto bear skin', perHour: 24, source: 'wilds_callisto' }, { name: 'Mahogany plank', perHour: 120, source: 'woodcutting' }],
  description: 'Craft the bone armor from Callisto bear skin. Prayer-preserving. Wilds-only equip. The skin does not dry right outside the wilds.',
  location: 'The Wilds',
});

rel.defineTrainingMethod('wilds_odium_ward_assembly', {
  skill: 'crafting', name: 'Odium Ward Shard Assembly',
  levelRange: [85, 99],
  xpPerHour: 120000,
  prerequisites: { skills: { crafting: 85 }, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Odium Ward', perHour: 3 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 0,
  danger: 'low', complexity: 'complex', attention: 'medium',
  inputs: [{ name: 'Odium ward shard', perHour: 9, source: 'wilds_chaos_fanatic' }],
  description: 'Three Odium ward shards. Assemble into the Odium Ward. Ranged defensive shield. +20% accuracy with ranged special attacks. Wilds-crafted only.',
  location: 'The Wilds',
});

// ── FLETCHING ───────────────────────────────────────────────────────────────
rel.defineTrainingMethod('wilds_morrigan_javelin_fletching', {
  skill: 'fletching', name: "Morrigan's Javelin Fletching",
  levelRange: [85, 99],
  xpPerHour: 180000,
  prerequisites: { skills: { fletching: 85 }, quests: ['no_honor_ordeal'], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: "Morrigan's javelin", perHour: 480 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'low', complexity: 'complex', attention: 'medium',
  inputs: [{ name: 'Magic logs', perHour: 480, source: 'wilds_magic_trees' }, { name: 'Revenant ether', perHour: 4800, source: 'wilds_revenant_demon' }],
  description: "Morrigan's javelin. Fletched at the no-honor workbench. Requires revenant ether bound to magic shaft. The javelin only fletches inside the wilds.",
  location: 'The Wilds',
});

rel.defineTrainingMethod('wilds_magic_longbow_cutting', {
  skill: 'fletching', name: 'Wilds Magic Longbow Cutting',
  levelRange: [85, 99],
  xpPerHour: 245000,
  prerequisites: { skills: { fletching: 85 }, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Magic longbow (unstrung)', perHour: 1600 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'medium', complexity: 'simple', attention: 'low',
  inputs: [{ name: 'Magic logs', perHour: 1600, source: 'wilds_magic_trees' }],
  description: 'Magic longbows from wilds magic logs, cut at the Edgeward workbench. Peak fletching XP in Aelgard. The logs do not travel outside the wilds unchipped.',
  location: 'The Wilds',
});

// ── SLAYER ──────────────────────────────────────────────────────────────────
rel.defineTrainingMethod('wilds_krystilia_tasks', {
  skill: 'slayer', name: 'Krystilia Wilderness Tasks',
  levelRange: [40, 99],
  xpPerHour: 78000,
  prerequisites: { skills: { slayer: 40 }, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Slayer points', perHour: 50 }, { name: 'Skull-gold coins', perHour: 220000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 15000,
  danger: 'high', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Blighted shark', perHour: 80, source: 'wilds_stackable_food' }],
  description: 'Krystilia. Wilderness slayer master. Tasks only in the wilds. Points double of Turael. The drops — they keep what they kill.',
  location: 'The Wilds',
  breakpointAt: 40,
});

rel.defineTrainingMethod('wilds_greater_nechryael_slayer', {
  skill: 'slayer', name: 'Greater Nechryael Wilds Task',
  levelRange: [80, 99],
  xpPerHour: 135000,
  prerequisites: { skills: { slayer: 80 }, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Soulsplit scroll fragment', perHour: 0.3 }, { name: 'Skull-gold coins', perHour: 380000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 60000,
  danger: 'high', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Blighted shark', perHour: 160, source: 'wilds_stackable_food' }, { name: 'Super restore (4)', perHour: 8, source: 'herblore' }],
  description: 'Greater nechryael. Level-thirty-five wilds pocket dungeon. Soulsplit scroll fragment. Three fragments. The unlock that lets the prayer heal you every hit.',
  location: 'The Wilds',
});

// ── HUNTER ──────────────────────────────────────────────────────────────────
rel.defineTrainingMethod('wilds_black_chinchompa_hunting', {
  skill: 'hunter', name: 'Black Chinchompa Hunting',
  levelRange: [73, 99],
  xpPerHour: 145000,
  prerequisites: { skills: { hunter: 73 }, quests: [], items: [{ name: 'Box trap' }], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Black chinchompa', perHour: 1200 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'high', complexity: 'moderate', attention: 'medium',
  inputs: [],
  description: 'Black chinchompas. Level thirty-two wilds. Only hunter content that requires active wilds presence. PKers come for the chinchompas more than the player.',
  location: 'The Wilds',
  breakpointAt: 73,
});

// ── MINING ──────────────────────────────────────────────────────────────────
rel.defineTrainingMethod('wilds_rune_rocks_mining', {
  skill: 'mining', name: 'Wilderness Rune Rocks',
  levelRange: [85, 99],
  xpPerHour: 68000,
  prerequisites: { skills: { mining: 85 }, quests: [], items: [{ name: 'Rune pickaxe' }], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Runite ore', perHour: 86 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'high', complexity: 'simple', attention: 'medium',
  inputs: [],
  description: 'Rune rocks. Respawn two times faster than any safe zone. Thirteen rocks in the one node. Level forty-six wilds. The mining hoods hide scars.',
  location: 'The Wilds',
  breakpointAt: 85,
});

rel.defineTrainingMethod('wilds_lava_maze_runite', {
  skill: 'mining', name: 'Lava Maze Runite Cluster',
  levelRange: [85, 99],
  xpPerHour: 78000,
  prerequisites: { skills: { mining: 85 }, quests: ['the_long_road_home'], items: [{ name: 'Dragon pickaxe' }], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Runite ore', perHour: 110 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'extreme', complexity: 'moderate', attention: 'high',
  inputs: [],
  description: 'Lava Maze. Level forty-to-fifty wilds. Four runite rocks in a cluster. Teleblocked deep. Escape is agility thirty — pay the ditch to the resource arena.',
  location: 'The Wilds',
});

rel.defineTrainingMethod('wilds_resource_arena_mining', {
  skill: 'mining', name: 'Wilderness Resource Arena Mining',
  levelRange: [60, 99],
  xpPerHour: 72000,
  prerequisites: { skills: { mining: 60 }, quests: [], items: [], areas: ['the_wilds_resource_arena'] },
  resourceOutput: { produces: [{ name: 'Adamantite ore', perHour: 140 }, { name: 'Runite ore', perHour: 40 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 7500,
  danger: 'medium', complexity: 'simple', attention: 'low',
  inputs: [],
  description: 'The Resource Arena. Level-twenty-eight wilderness gate. Seventy-five-hundred coin entry. Bank inside, ores inside, fishing inside. PKer-proof walls. PKer-sized doors.',
  location: 'The Wilds',
});

// ── SMITHING ────────────────────────────────────────────────────────────────
rel.defineTrainingMethod('wilds_blast_forge_smelting', {
  skill: 'smithing', name: 'Wilds Blast Forge Smelting',
  levelRange: [60, 99],
  xpPerHour: 210000,
  prerequisites: { skills: { smithing: 60 }, quests: ['the_wilds_forge'], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Runite bar', perHour: 480 }], net: 'profit' },
  bankingFrequency: 'frequent', costPerHour: 30000,
  danger: 'medium', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Runite ore', perHour: 480, source: 'wilds_rune_rocks' }, { name: 'Coal', perHour: 3840, source: 'mining' }],
  description: 'The Wilds Blast Forge. Fuels on coal the PKers cannot take. Rune bars at double the rate of the Heartlands furnace. Level-twenty wilds zone.',
  location: 'The Wilds',
});

rel.defineTrainingMethod('wilds_vesta_reforging', {
  skill: 'smithing', name: "Vesta's Sword Reforging",
  levelRange: [90, 99],
  xpPerHour: 155000,
  prerequisites: { skills: { smithing: 90 }, quests: ['no_honor_ordeal'], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: "Vesta's longsword (restored)", perHour: 12 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'low', complexity: 'complex', attention: 'medium',
  inputs: [{ name: "Vesta's longsword fragment", perHour: 24, source: 'wilds_vesta_drop' }, { name: 'Revenant ether', perHour: 2400, source: 'wilds_revenant_demon' }],
  description: "Vesta's longsword fragments reforged. Two fragments, ether charge, a prayer. The blade degrades on death. The forge knows the name of the last person to hold it.",
  location: 'The Wilds',
});

// ── FISHING ─────────────────────────────────────────────────────────────────
rel.defineTrainingMethod('wilds_dark_crab_fishing', {
  skill: 'fishing', name: 'Wilderness Dark Crab Fishing',
  levelRange: [85, 99],
  xpPerHour: 42000,
  prerequisites: { skills: { fishing: 85 }, quests: [], items: [{ name: 'Lobster pot' }], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Raw dark crab', perHour: 180 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'extreme', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Dark fishing bait', perHour: 180, source: 'combat_drops' }],
  description: 'Dark crabs. Level fifty-two wilds. Heals twenty-two per crab. PKer ambush rate: very high. The darkness does not stop the catch — it stops the escape.',
  location: 'The Wilds',
  breakpointAt: 85,
});

rel.defineTrainingMethod('wilds_resource_arena_fishing', {
  skill: 'fishing', name: 'Wilds Resource Arena Fishing',
  levelRange: [76, 99],
  xpPerHour: 52000,
  prerequisites: { skills: { fishing: 76 }, quests: [], items: [], areas: ['the_wilds_resource_arena'] },
  resourceOutput: { produces: [{ name: 'Raw shark', perHour: 220 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 7500,
  danger: 'medium', complexity: 'simple', attention: 'low',
  inputs: [],
  description: 'The Resource Arena fishing platform. Sharks at the standard rate, but the ditch is at your back and the bank is ten tiles. Entry fee covers the hour.',
  location: 'The Wilds',
});

// ── COOKING ─────────────────────────────────────────────────────────────────
rel.defineTrainingMethod('wilds_bandit_camp_cooking', {
  skill: 'cooking', name: 'Bandit Camp Mass-Cook',
  levelRange: [80, 99],
  xpPerHour: 245000,
  prerequisites: { skills: { cooking: 80 }, quests: ['bandit_camp_alliance'], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Shark', perHour: 1800 }], net: 'profit' },
  bankingFrequency: 'frequent', costPerHour: 0,
  danger: 'medium', complexity: 'simple', attention: 'low',
  inputs: [{ name: 'Raw shark', perHour: 1800, source: 'fishing' }],
  description: 'The bandit camp oven never stops. Mass-cook sharks at burn-zero level. Level nineteen wilderness. The camp pays in shelter from the ditch hunters.',
  location: 'The Wilds',
});

rel.defineTrainingMethod('wilds_blighted_food_processing', {
  skill: 'cooking', name: 'Blighted Food Processing',
  levelRange: [50, 99],
  xpPerHour: 178000,
  prerequisites: { skills: { cooking: 50 }, quests: ['the_wilds_forge'], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Blighted shark', perHour: 1200 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'low', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Shark', perHour: 1200, source: 'cooking' }, { name: 'Revenant ether', perHour: 1200, source: 'wilds_revenant_hellhound' }],
  description: 'Process sharks into blighted sharks. They stack one-thousand-per-slot inside the wilds. They sour within two ticks outside. The risk of long stays — compressed.',
  location: 'The Wilds',
});

// ── FIREMAKING ──────────────────────────────────────────────────────────────
rel.defineTrainingMethod('wilds_magic_log_burning', {
  skill: 'firemaking', name: 'Wilds Magic Log Burning',
  levelRange: [75, 99],
  xpPerHour: 340000,
  prerequisites: { skills: { firemaking: 75 }, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'medium', complexity: 'simple', attention: 'medium',
  inputs: [{ name: 'Magic logs', perHour: 1400, source: 'wilds_magic_trees' }],
  description: 'Magic logs on the long road. The fire burns green in the wilds; blue everywhere else. Firemaking XP per log is the highest in Aelgard.',
  location: 'The Wilds',
});

rel.defineTrainingMethod('wilds_pyre_bone_wildsfire', {
  skill: 'firemaking', name: 'Wilds Pyre — Lava Dragon Bone',
  levelRange: [80, 99],
  xpPerHour: 395000,
  prerequisites: { skills: { firemaking: 80, prayer: 70 }, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'high', complexity: 'moderate', attention: 'high',
  inputs: [{ name: 'Lava dragon bones', perHour: 400, source: 'wilds_slayer_lava_dragon' }, { name: 'Magic logs', perHour: 1200, source: 'wilds_magic_trees' }],
  description: 'Burn lava dragon bones on magic-log pyre. Double-skill: firemaking and prayer at once. The wilds pyre does not extinguish in rain or teleblock.',
  location: 'The Wilds',
});

// ── WOODCUTTING ─────────────────────────────────────────────────────────────
rel.defineTrainingMethod('wilds_magic_tree_cutting', {
  skill: 'woodcutting', name: 'Wilds Magic Tree Grove',
  levelRange: [75, 99],
  xpPerHour: 95000,
  prerequisites: { skills: { woodcutting: 75 }, quests: [], items: [{ name: 'Rune axe' }], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Magic logs', perHour: 220 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'medium', complexity: 'simple', attention: 'low',
  inputs: [],
  description: 'Nine magic trees in one grove. Level twenty-five wilds. Highest density in Aelgard. The bark is marked; the axe knows the mark. PKers know the mark too.',
  location: 'The Wilds',
});

rel.defineTrainingMethod('wilds_yew_grove_cutting', {
  skill: 'woodcutting', name: 'Wilds Yew Grove',
  levelRange: [60, 99],
  xpPerHour: 72000,
  prerequisites: { skills: { woodcutting: 60 }, quests: [], items: [{ name: 'Rune axe' }], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Yew logs', perHour: 380 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'medium', complexity: 'trivial', attention: 'afk',
  inputs: [],
  description: 'Wilds yew grove. Level-fourteen wilderness. Seven trees close-packed. Safer than the magic grove; deeper into the ditch before the first rev.',
  location: 'The Wilds',
});

// ── FARMING ─────────────────────────────────────────────────────────────────
rel.defineTrainingMethod('wilds_ent_farming', {
  skill: 'farming', name: 'Wilderness Ent Farming',
  levelRange: [65, 99],
  xpPerHour: 72000,
  prerequisites: { skills: { farming: 65 }, quests: ['the_wilds_grove'], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Ent sap', perHour: 40 }, { name: 'Magic seed', perHour: 3 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 0,
  danger: 'medium', complexity: 'moderate', attention: 'low',
  inputs: [{ name: 'Magic seed', perHour: 3, source: 'combat_drops' }],
  description: 'Wilderness ent farming. The ents remember who planted them and do not sway for the PKer. Ent sap heals eighteen and grants one prayer point.',
  location: 'The Wilds',
});

rel.defineTrainingMethod('wilds_deep_herb_rotation', {
  skill: 'farming', name: 'Deep-Wilds Herb Rotation',
  levelRange: [50, 99],
  xpPerHour: 88000,
  prerequisites: { skills: { farming: 50 }, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Grimy ranarr', perHour: 60 }, { name: 'Grimy torstol', perHour: 20 }, { name: 'Grimy snapdragon', perHour: 40 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 0,
  danger: 'high', complexity: 'moderate', attention: 'low',
  inputs: [{ name: 'Ranarr seed', perHour: 8, source: 'combat_drops' }, { name: 'Torstol seed', perHour: 3, source: 'combat_drops' }],
  description: 'Rotate the wilderness herb patches — level-twenty-two and level-thirty-eight. No disease, no protection. Harvest at skull and the PKers know.',
  location: 'The Wilds',
});

// ══════════════════════════════════════════════════════════════════════════════
// QUIRKY INTERACTIONS — the wilds has its own gallows humor
// ══════════════════════════════════════════════════════════════════════════════

rel.defineTrainingMethod('quirky_wilds_count_the_ditch', {
  skill: 'agility',
  name: '[Quirky] Count the Ditch Tiles',
  levelRange: [1, 99],
  xpPerHour: 2100,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'low', complexity: 'trivial', attention: 'high',
  inputs: [],
  description: 'Stand at the ditch and count each tile between you and the wall. Twenty-three. Twenty-two. Tiny agility XP. The count becomes a reflex.',
  location: 'The Wilds',
});

rel.defineTrainingMethod('quirky_wilds_shout_at_pker', {
  skill: 'magic',
  name: '[Quirky] Shout at a Passing PKer',
  levelRange: [1, 99],
  xpPerHour: 1600,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'extreme', complexity: 'trivial', attention: 'maximum',
  inputs: [],
  description: 'Shout at the PKer riding past the edgeward. A curse, a name, a number. Tiny magic XP. The shout does not stop him — nothing does.',
  location: 'The Wilds',
});

rel.defineTrainingMethod('quirky_wilds_loot_the_bones', {
  skill: 'prayer',
  name: '[Quirky] Loot the Bones of the Fallen',
  levelRange: [1, 99],
  xpPerHour: 1800,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Bones', perHour: 40 }], net: 'profit' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'medium', complexity: 'trivial', attention: 'high',
  inputs: [],
  description: 'Bones of who the PKers got this hour. Scatter them. Take a prayer. Tiny prayer XP. The bones remember who owned them.',
  location: 'The Wilds',
});

rel.defineTrainingMethod('quirky_wilds_spit_in_the_ditch', {
  skill: 'hitpoints',
  name: '[Quirky] Spit in the Ditch',
  levelRange: [1, 99],
  xpPerHour: 1100,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'low', complexity: 'trivial', attention: 'low',
  inputs: [],
  description: 'Spit in the ditch before you cross. It is the only honesty the wilds will accept. Tiny HP XP. The ditch does not spit back.',
  location: 'The Wilds',
});

rel.defineTrainingMethod('quirky_wilds_carve_your_name', {
  skill: 'crafting',
  name: '[Quirky] Carve Your Name on the Wall',
  levelRange: [1, 99],
  xpPerHour: 1400,
  prerequisites: { skills: {}, quests: [], items: [{ name: 'Chisel' }], areas: ['the_wilds'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'low', complexity: 'trivial', attention: 'medium',
  inputs: [],
  description: 'Carve your name on the Edgeward wall. Under the names that did not come back. Tiny crafting XP. The wall has room for many more.',
  location: 'The Wilds',
});

// ══════════════════════════════════════════════════════════════════════════════
// BOSSES — 12 wilderness bosses registered via item sources + methods above
// Additional standalone boss methods for each as training grind
// ══════════════════════════════════════════════════════════════════════════════

rel.defineTrainingMethod('wilds_kbd_combat', {
  skill: 'attack', name: 'King Black Dragon — Lair Combat',
  levelRange: [75, 99],
  xpPerHour: 125000,
  prerequisites: { skills: { attack: 75 }, quests: ['the_kbd_key'], items: [], areas: ['the_wilds_kbd_lair'] },
  resourceOutput: { produces: [{ name: 'KBD head', perHour: 0.3 }, { name: 'Dragon bones', perHour: 120 }, { name: 'Skull-gold coins', perHour: 280000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 40000,
  danger: 'high', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Blighted shark', perHour: 80, source: 'wilds_stackable_food' }, { name: 'Anti-fire potion (4)', perHour: 4, source: 'herblore' }],
  description: 'King Black Dragon. Level-fourteen wilderness lair entrance; teleblocked pocket below. Three heads, three breaths, one key-item drop per run.',
  location: 'The Wilds',
});

rel.defineTrainingMethod('wilds_scorpia_slaying', {
  skill: 'strength', name: 'Scorpia — Wilderness Slaying',
  levelRange: [65, 99],
  xpPerHour: 108000,
  prerequisites: { skills: { strength: 65 }, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: "Scorpia's offspring seed", perHour: 0.2 }, { name: 'Skull-gold coins', perHour: 380000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 30000,
  danger: 'high', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Blighted monkfish', perHour: 90, source: 'wilds_stackable_food' }, { name: 'Anti-poison+ (4)', perHour: 3, source: 'herblore' }],
  description: "Scorpia. Level-fifty wilderness den. The offspring she drops follows you, fights with you. Only wilds boss that grants a combat familiar.",
  location: 'The Wilds',
});

rel.defineTrainingMethod('wilds_chaos_elemental_slaying', {
  skill: 'magic', name: 'Chaos Elemental — Disarm Combat',
  levelRange: [70, 99],
  xpPerHour: 140000,
  prerequisites: { skills: { magic: 70 }, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Unstable orb', perHour: 0.3 }, { name: 'Skull-gold coins', perHour: 360000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 80000,
  danger: 'high', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Blighted shark', perHour: 100, source: 'wilds_stackable_food' }, { name: 'Blood rune', perHour: 2000, source: 'runecrafting' }],
  description: 'Chaos Elemental. Level-fifty-one wilds. Disarms the wielded weapon. Drops unstable orb — random teleport trinket, +10% magic damage inside wilds.',
  location: 'The Wilds',
});

// ══════════════════════════════════════════════════════════════════════════════
// QUESTS — 10+ multi-stage wilderness unlocks (Blade of the Wilds extends)
// ══════════════════════════════════════════════════════════════════════════════

rel.defineQuestUnlock('third_ditch_ordeal', {
  name: 'Third-Ditch Ordeal',
  unlocks: [
    { type: 'area', id: 'the_wilds_third_ditch', description: 'Third-Ditch plateau — full access to Callisto/Vet\'ion/Venenatis pocket zones' },
    { type: 'item_equip', id: 'ring_of_no_honor', description: 'Ring of No-Honor — teleport delay +2 ticks in wilds, +8% damage vs other PKers' },
    { type: 'training_method', id: 'wilds_callisto_defence', description: 'Callisto defensive training' },
  ],
});

rel.defineQuestUnlock('no_honor_ordeal', {
  name: 'No-Honor Ordeal',
  unlocks: [
    { type: 'training_method', id: 'wilds_morrigan_throw_range', description: "Morrigan's javelin fletching + throw training" },
    { type: 'training_method', id: 'wilds_vesta_reforging', description: "Vesta's longsword reforging — smithing 90" },
    { type: 'training_method', id: 'wilds_bone_armor_crafting', description: "Callisto bone armor crafting — crafting 70" },
    { type: 'item_equip', id: 'amulet_of_no_honor', description: "Amulet of No-Honor — wilds BIS amulet, stackable 1000/slot" },
  ],
});

rel.defineQuestUnlock('the_long_road_home', {
  name: 'The Long Road Home',
  unlocks: [
    { type: 'training_method', id: 'wilds_shortcut_network_running', description: 'Wilds shortcut network — chain all shortcuts into one escape route' },
    { type: 'training_method', id: 'wilds_antipk_potion_brewing', description: 'Anti-PK potion brewing (herblore 60)' },
    { type: 'area', id: 'the_wilds_lava_maze', description: 'Lava Maze runite cluster access — deep-wild mining node' },
    { type: 'teleport', id: 'ferox_glory_anchor', description: 'Ferox enclave glory anchor — one free wilds teleport per hour' },
  ],
});

rel.defineQuestUnlock('bandit_camp_alliance', {
  name: 'Bandit Camp Alliance',
  unlocks: [
    { type: 'training_method', id: 'wilds_bandit_camp_thieving', description: 'Bandit camp pickpocketing (thieving 30)' },
    { type: 'training_method', id: 'wilds_bandit_camp_cooking', description: 'Bandit camp mass-cook (cooking 80)' },
    { type: 'training_method', id: 'wilds_bandit_camp_barricades', description: 'Bandit camp barricade construction' },
    { type: 'shop', id: 'wilds_bandit_supplies', description: 'Bandit supplies — Wilderness-cheap gear + emergency teleport tabs' },
  ],
});

rel.defineQuestUnlock('the_mage_arena_trial', {
  name: 'The Mage Arena Trial',
  unlocks: [
    { type: 'training_method', id: 'wilds_mage_arena_training', description: 'Mage Arena god spell training (magic 60)' },
    { type: 'spellbook', id: 'god_spells', description: 'God spells — Flames of Zamorak, Saradomin Strike, Claws of Guthix' },
    { type: 'item_equip', id: 'mage_arena_cape', description: 'Mage Arena cape — autocast god spells, wilds-only bonus' },
  ],
});

rel.defineQuestUnlock('enter_the_abyss', {
  name: 'Enter the Abyss',
  unlocks: [
    { type: 'training_method', id: 'wilds_abyss_runecrafting', description: 'Wilderness Abyss runecrafting (RC 44)' },
    { type: 'teleport', id: 'abyss_portal', description: 'Abyss portal access — fastest RC route in Aelgard' },
    { type: 'item_equip', id: 'abyssal_pouch', description: 'Abyssal pouches — carry more essence per run' },
  ],
});

rel.defineQuestUnlock('the_wilds_forge', {
  name: 'The Wilds Forge',
  unlocks: [
    { type: 'training_method', id: 'wilds_blast_forge_smelting', description: 'Wilds Blast Forge smelting (smithing 60)' },
    { type: 'training_method', id: 'wilds_blighted_food_processing', description: 'Blighted food processing (cooking 50)' },
    { type: 'recipe', id: 'blighting_recipe', description: 'Blighting recipe — make stackable wilds consumables' },
  ],
});

rel.defineQuestUnlock('the_wilds_grove', {
  name: 'The Wilds Grove',
  unlocks: [
    { type: 'training_method', id: 'wilds_ent_farming', description: 'Wilderness ent farming (farming 65)' },
    { type: 'recipe', id: 'ent_sap_recipe', description: 'Ent sap recipe — heals 18 and grants 1 prayer per sip' },
    { type: 'area', id: 'the_wilds_ent_grove', description: 'Ent grove — level-thirty wilderness farming hub' },
  ],
});

rel.defineQuestUnlock('the_kbd_key', {
  name: 'The KBD Key',
  unlocks: [
    { type: 'training_method', id: 'wilds_kbd_combat', description: 'King Black Dragon lair combat' },
    { type: 'boss', id: 'king_black_dragon', description: 'KBD as repeatable boss (drops dragon bones stack + KBD head)' },
    { type: 'item_equip', id: 'kbd_head_trophy', description: 'KBD head trophy — Aelgard\'s first dragon trophy, hung in any POH' },
  ],
});

rel.defineQuestUnlock('blade_of_the_wilds_second', {
  name: 'Blade of the Wilds II — The No-Honor Blade',
  unlocks: [
    { type: 'item_equip', id: 'blade_of_wilds_upgraded', description: 'Blade of the Wilds (upgraded) — +25% damage vs PKers, degrades on death' },
    { type: 'boss', id: 'the_exiled_champion', description: 'The Exiled Champion — quest-unique boss, drops blade shard' },
    { type: 'area', id: 'the_wilds_exiled_camp', description: 'The Exiled Camp — safe pocket inside wilds, glory + bank access' },
  ],
});

rel.defineQuestUnlock('blade_of_the_wilds_third', {
  name: 'Blade of the Wilds III — The Teleblocked King',
  unlocks: [
    { type: 'item_equip', id: 'blade_of_wilds_final', description: 'Blade of the Wilds (final) — BIS wilds melee, stackable 1000/slot' },
    { type: 'boss', id: 'the_teleblocked_king', description: 'The Teleblocked King — prestige boss, wilderness-crown drop' },
    { type: 'teleport', id: 'throne_of_wilds', description: 'Throne of the Wilds — teleport to level-50 wilds pocket safe zone' },
  ],
});

// ══════════════════════════════════════════════════════════════════════════════
// BREAKPOINTS — transformative wilderness moments
// ══════════════════════════════════════════════════════════════════════════════

rel.defineBreakpoint({
  type: 'area_entry', trigger: { area: 'the_wilds', wildernessLevel: 30 },
  description: 'Level 30 wilderness crossed. Teleblock range reached. Logout tab delay activates. The grave-mile count begins.',
  unlocks: [
    { type: 'area', id: 'the_wilds_grave_mile', description: 'Grave-Mile plateau access' },
    { type: 'training_method', id: 'wilds_demonic_ashes_scattering', description: 'Demonic ashes prayer method (wilds-grade)' },
  ],
  importance: 'major',
});

rel.defineBreakpoint({
  type: 'area_entry', trigger: { area: 'the_wilds', wildernessLevel: 50 },
  description: 'Level 50 wilderness. Teleblocked deep. Twenty-three tiles from any glory, minimum. Revenant caves unlock.',
  unlocks: [
    { type: 'area', id: 'the_wilds_revenant_caves', description: 'Revenant caves entry (full rev pack)' },
    { type: 'training_method', id: 'wilds_revenant_ice_burst_magic', description: 'Ice burst revenant magic training' },
  ],
  importance: 'transformative',
});

rel.defineBreakpoint({
  type: 'area_entry', trigger: { area: 'the_wilds', wildernessLevel: 80 },
  description: 'Level 80 wilderness — the long road. Teleblocked by every mage who sees you. Vet\'ion, venenatis, deep-rev only here.',
  unlocks: [
    { type: 'area', id: 'the_wilds_long_road', description: 'Long Road deep wilds — highest PvP risk zone' },
    { type: 'training_method', id: 'wilds_venenatis_hp', description: 'Venenatis HP trial' },
  ],
  importance: 'transformative',
});

rel.defineBreakpoint({
  type: 'skill_level', trigger: { skill: 'agility', level: 52 },
  description: 'Wilderness agility course opens. The one-way escape route. The dispenser at the end drops skull-gold each lap.',
  unlocks: [{ type: 'training_method', id: 'wilds_agility_course', description: 'Wilderness agility course' }],
  importance: 'major',
});

rel.defineBreakpoint({
  type: 'skill_level', trigger: { skill: 'agility', level: 70 },
  description: 'Wilds shortcut network fully usable. Every shortcut chained into one route. Escape becomes a skill the agility-capped keep.',
  unlocks: [{ type: 'training_method', id: 'wilds_shortcut_network_running', description: 'Wilds shortcut network' }],
  importance: 'major',
});

rel.defineBreakpoint({
  type: 'quest_complete', trigger: { quest: 'the_mage_arena_trial' },
  description: 'God spells unlocked. Mage Arena cape equipped. The wilds mage identity crystallizes — autocast god spells, no ditch count needed.',
  unlocks: [
    { type: 'spellbook', id: 'god_spells', description: 'God spells' },
    { type: 'item_equip', id: 'mage_arena_cape', description: 'Mage Arena cape' },
  ],
  importance: 'transformative',
});

rel.defineBreakpoint({
  type: 'quest_complete', trigger: { quest: 'enter_the_abyss' },
  description: 'Abyss opened. Fastest RC route in Aelgard. PKers camp the portal, but RC XP rates double overnight.',
  unlocks: [{ type: 'training_method', id: 'wilds_abyss_runecrafting', description: 'Wilderness Abyss runecrafting' }],
  importance: 'transformative',
});

rel.defineBreakpoint({
  type: 'quest_complete', trigger: { quest: 'blade_of_the_wilds_third' },
  description: 'Blade of the Wilds (final). Wilderness Crown lineage complete. The throne of wilds teleport unlocks. Wilds-maxed player identity.',
  unlocks: [
    { type: 'item_equip', id: 'blade_of_wilds_final', description: 'Blade of the Wilds (final) — BIS wilds melee' },
    { type: 'teleport', id: 'throne_of_wilds', description: 'Throne of the Wilds teleport' },
  ],
  importance: 'transformative',
});

rel.defineBreakpoint({
  type: 'skill_level', trigger: { skill: 'mining', level: 85 },
  description: 'Wilderness rune rocks accessible. Two-times the respawn rate of any safe zone. Thirteen rocks in a node. Level-forty-six wilderness pocket.',
  unlocks: [{ type: 'training_method', id: 'wilds_rune_rocks_mining', description: 'Wilderness rune rocks mining' }],
  importance: 'major',
});

// ══════════════════════════════════════════════════════════════════════════════
// PvP-SPECIFIC MECHANICS — 15+ registered as item sources + breakpoints
// Teleblock, vengeance, clan wars, deep-wild drops, glory recharge, skull timer
// ══════════════════════════════════════════════════════════════════════════════

rel.registerItemSource(99560, { type: 'drop', sourceId: 'wilds_pvp_kill_loot', sourceName: 'PvP Kill Loot', region: 'the_wilds', details: 'Items dropped by a killed player. The primary PvP reward mechanic. Dropped stack visible for 60 seconds to killer only.', obscure: false });
rel.registerItemSource(99561, { type: 'drop', sourceId: 'wilds_skull_timer', sourceName: 'Skull Timer', region: 'the_wilds', details: 'Skull status. PK other players = 20-minute skull. Drop everything on death while skulled. Risk/reward max setting.', obscure: false });
rel.registerItemSource(99562, { type: 'processing', sourceId: 'wilds_glory_recharge', sourceName: 'Glory Recharge Well', region: 'the_wilds', details: 'Amulet of glory recharge. Wildy-deep well. Four charges per amulet, emergency teleport to Edgeward.', obscure: false });
rel.registerItemSource(99563, { type: 'processing', sourceId: 'wilds_teleblock_cast', sourceName: 'Teleblock Cast', region: 'the_wilds', details: 'Teleblock spell. Magic 85. Prevents target teleport for 5 minutes. THE defining wilderness spell.', obscure: false });
rel.registerItemSource(99564, { type: 'processing', sourceId: 'wilds_vengeance_cast', sourceName: 'Vengeance Cast', region: 'the_wilds', details: 'Vengeance spell (Lunar book). Returns 75% of incoming damage. Meta-defining PvP spell.', obscure: false });
rel.registerItemSource(99565, { type: 'drop', sourceId: 'wilds_clan_wars_portal', sourceName: 'Clan Wars Portal', region: 'the_wilds', details: 'Clan wars portal. Practice PvP without item loss. Tournament mode. Wilds-adjacent safe zone.', obscure: false });
rel.registerItemSource(99566, { type: 'drop', sourceId: 'wilds_ferox_enclave', sourceName: 'Ferox Enclave', region: 'the_wilds', details: 'Ferox enclave. Wilds-adjacent safe zone with bank, stat restore, full gear-up before crossing the ditch.', obscure: false });
rel.registerItemSource(99567, { type: 'processing', sourceId: 'wilds_risk_insurance_contract', sourceName: 'Risk Insurance Contract', region: 'the_wilds', details: 'Risk insurance. 3-item-protect gets you 10% extra loot from PvP kills. Costs 50k skull-gold/hour.', obscure: true });
rel.registerItemSource(99568, { type: 'processing', sourceId: 'wilds_logout_tab', sourceName: 'Logout Tab', region: 'the_wilds', details: 'Logout tab. Instant logout-with-ten-tick-protection. Crafting + law rune + chaos rune. The wilds essential.', obscure: false });
rel.registerItemSource(99569, { type: 'processing', sourceId: 'wilds_pk_score_tracker', sourceName: 'PK Score Tracker', region: 'the_wilds', details: 'PK score board. Visible at Edgeward. Top-10 PKers of the week get shop discounts.', obscure: false });
rel.registerItemSource(99570, { type: 'processing', sourceId: 'wilds_risk_protect_prayer', sourceName: 'Protect Item Prayer', region: 'the_wilds', details: 'Protect Item prayer (lvl 25). Keep one extra item on death. Essential for high-risk grinds.', obscure: false });
rel.registerItemSource(99571, { type: 'processing', sourceId: 'wilds_smite_prayer', sourceName: 'Smite Prayer', region: 'the_wilds', details: 'Smite prayer (lvl 52). Drain target prayer by 25% of damage dealt. PvP-defining prayer.', obscure: false });
rel.registerItemSource(99572, { type: 'processing', sourceId: 'wilds_pk_combat_lock', sourceName: 'PvP Combat Lock', region: 'the_wilds', details: 'PvP combat lock. Cannot teleport for 10 ticks after taking PvP damage. Balances teleport escape.', obscure: false });
rel.registerItemSource(99573, { type: 'drop', sourceId: 'wilds_deep_wild_drop_bonus', sourceName: 'Deep-Wild Drop Bonus', region: 'the_wilds', details: 'Deep-wild drop bonus. Level 30+ wilderness doubles unique drop rates. Level 50+ triples. The wilds reward curve.', obscure: false });
rel.registerItemSource(99574, { type: 'processing', sourceId: 'wilds_multi_combat_zone', sourceName: 'Multi-Combat Zone', region: 'the_wilds', details: 'Multi-combat zones in wilds. Multiple enemies can attack at once. Team PK tactics enabled.', obscure: false });
rel.registerItemSource(99575, { type: 'processing', sourceId: 'wilds_deadman_mode_pockets', sourceName: 'Deadman Pockets', region: 'the_wilds', details: 'Deadman-mode pockets in deep wilds. Everything drops on death. 3x XP while inside. Seasonal.', obscure: true });

// ══════════════════════════════════════════════════════════════════════════════
// COMBINATIONS (reagent system) — degrade-upgrade cycle for wilds BIS
// ══════════════════════════════════════════════════════════════════════════════

rel.defineCombination(99601, {
  resultName: "Vesta's Longsword (restored)",
  inputs: [
    { id: 99510, name: "Vesta's longsword fragment", consumed: true },
    { id: 99510, name: "Vesta's longsword fragment", consumed: true },
    { id: 99012, name: 'Revenant ether', consumed: true },
  ],
  skill: 'smithing', level: 90, xp: 400, station: 'wilds_blast_forge',
  description: "Two fragments reforged. Needs ether charge. Degrades on death — reforge from a new drop.",
});

rel.defineCombination(99602, {
  resultName: "Morrigan's Javelin",
  inputs: [
    { id: 99531, name: 'Magic logs', consumed: true },
    { id: 99012, name: 'Revenant ether', consumed: true },
    { id: 99012, name: 'Revenant ether', consumed: true },
  ],
  skill: 'fletching', level: 85, xp: 90, station: 'wilds_fletchbench',
  description: "Magic shaft + ether charge. Only fletches inside the wilds. Bleeds 25% max HP on hit.",
});

rel.defineCombination(99603, {
  resultName: 'Odium Ward',
  inputs: [
    { id: 99525, name: 'Odium ward shard', consumed: true },
    { id: 99525, name: 'Odium ward shard', consumed: true },
    { id: 99525, name: 'Odium ward shard', consumed: true },
  ],
  skill: 'crafting', level: 85, xp: 200,
  description: 'Three Odium ward shards. Ranged defensive shield. +20% accuracy on ranged specs.',
});

rel.defineCombination(99604, {
  resultName: 'Malediction Ward',
  inputs: [
    { id: 99526, name: 'Malediction ward shard', consumed: true },
    { id: 99526, name: 'Malediction ward shard', consumed: true },
    { id: 99526, name: 'Malediction ward shard', consumed: true },
  ],
  skill: 'crafting', level: 85, xp: 200,
  description: 'Three Malediction ward shards. Magic defensive shield. Teleblock cost -30%.',
});

rel.defineCombination(99605, {
  resultName: 'Blighted Shark',
  inputs: [
    { id: 385, name: 'Shark', consumed: true },
    { id: 99012, name: 'Revenant ether', consumed: true },
  ],
  skill: 'cooking', level: 50, xp: 40, station: 'wilds_blast_forge',
  description: 'Blight the shark. Stacks 1000/slot in wilds. Spoils 2 ticks after leaving.',
});

rel.defineCombination(99606, {
  resultName: 'Anti-PK Potion (4)',
  inputs: [
    { id: 99010, name: 'Wilderness herb', consumed: true },
    { id: 96006, name: 'Deathstalker venom-gland', consumed: true },
  ],
  skill: 'herblore', level: 60, xp: 95, station: 'wilds_herblab',
  description: 'Reduces incoming PvP damage by 10% for 5 minutes. Spoils outside wilds within 1 tick.',
});

rel.defineCombination(99607, {
  resultName: 'Logout Tab',
  inputs: [
    { id: 563, name: 'Law rune', consumed: true },
    { id: 562, name: 'Chaos rune', consumed: true },
    { id: 8007, name: 'Teleport tablet base', consumed: true },
  ],
  skill: 'crafting', level: 40, xp: 30, station: 'wilds_bandit_lectern',
  description: 'Logout tab. Instant logout with 10-tick protection. The wilds essential.',
});

rel.defineCombination(99608, {
  resultName: 'Blade of the Wilds (upgraded)',
  inputs: [
    { id: 99609, name: 'Blade of the Wilds', consumed: true },
    { id: 99510, name: "Vesta's longsword fragment", consumed: true },
    { id: 99012, name: 'Revenant ether', consumed: true },
    { id: 99012, name: 'Revenant ether', consumed: true },
  ],
  skill: 'smithing', level: 85, xp: 500, station: 'wilds_blast_forge',
  description: 'Upgrade the original Blade of the Wilds with Vesta fragment + ether. +25% damage vs PKers.',
});

rel.defineCombination(99610, {
  resultName: 'Blade of the Wilds (final)',
  inputs: [
    { id: 99608, name: 'Blade of the Wilds (upgraded)', consumed: true },
    { id: 99520, name: 'Amulet of No-Honor', consumed: false },
    { id: 99012, name: 'Revenant ether', consumed: true },
  ],
  skill: 'smithing', level: 95, xp: 800, station: 'wilds_blast_forge',
  description: 'Final blade. BIS wilds melee. Stackable 1000/slot. Amulet catalyst survives the forge.',
});

// ══════════════════════════════════════════════════════════════════════════════
// ITEM USES — dense cross-web for the wilds ecosystem
// ══════════════════════════════════════════════════════════════════════════════

rel.registerItemUse(99012, { type: 'recipe', targetId: 99601, targetName: "Vesta's Longsword", region: 'the_wilds', details: 'Ether charges Vesta reforging.', obscure: false });
rel.registerItemUse(99012, { type: 'recipe', targetId: 99602, targetName: "Morrigan's Javelin", region: 'the_wilds', details: 'Ether binds to magic shaft for Morrigan fletching.', obscure: false });
rel.registerItemUse(99012, { type: 'recipe', targetId: 99605, targetName: 'Blighted Shark', region: 'the_wilds', details: 'Ether blight for stackable food.', obscure: false });
rel.registerItemUse(99012, { type: 'charge', targetId: 'wilderness_weapons', targetName: 'Wilderness Weapon Charges', region: 'the_wilds', details: "Craw's bow, Viggora's chainmace, Thammaron's sceptre — all use ether charges.", obscure: false });

rel.registerItemUse(99510, { type: 'recipe', targetId: 99601, targetName: "Vesta's Longsword", region: 'the_wilds', details: 'Two fragments + ether = restored sword.', obscure: false });
rel.registerItemUse(99510, { type: 'recipe', targetId: 99608, targetName: 'Blade of the Wilds (upgraded)', region: 'the_wilds', details: 'Vesta fragment is the Blade II catalyst.', obscure: true });

rel.registerItemUse(99530, { type: 'recipe', targetId: 'runite_bar_wilds', targetName: 'Runite Bar (Wilds Blast Forge)', region: 'the_wilds', details: 'Runite ore feeds the Wilds Blast Forge.', obscure: false });
rel.registerItemUse(99530, { type: 'combination', targetId: 99601, targetName: "Vesta's Longsword reforging station", region: 'the_wilds', details: 'Runite is a station requirement for Vesta reforging.', obscure: true });

rel.registerItemUse(99531, { type: 'recipe', targetId: 99602, targetName: "Morrigan's Javelin", region: 'the_wilds', details: 'Magic logs are the javelin shaft base.', obscure: false });
rel.registerItemUse(99531, { type: 'offering', targetId: 'wilds_magic_log_burning', targetName: 'Wilds Magic Log Burning', region: 'the_wilds', details: 'Burn magic logs for peak firemaking XP in Aelgard.', obscure: false });

rel.registerItemUse(99532, { type: 'recipe', targetId: 'wilderness_herb_seeds', targetName: 'Wilderness Herb Planting', region: 'the_wilds', details: 'Wilds herb patch takes any herb seed. Never diseases.', obscure: false });
rel.registerItemUse(99010, { type: 'recipe', targetId: 99606, targetName: 'Anti-PK Potion (4)', region: 'the_wilds', details: 'Wilderness herb is the anti-PK potion base.', obscure: false });

rel.registerItemUse(99520, { type: 'combination', targetId: 99610, targetName: 'Blade of the Wilds (final)', region: 'the_wilds', details: 'Amulet of No-Honor is the Blade III catalyst (not consumed).', obscure: true });
rel.registerItemUse(99520, { type: 'recipe', targetId: 'wilds_stackable_amulet_slot', targetName: 'Wilds Amulet Slot', region: 'the_wilds', details: 'Amulet of No-Honor stacks 1000/slot.', obscure: false });

rel.registerItemUse(99525, { type: 'recipe', targetId: 99603, targetName: 'Odium Ward', region: 'the_wilds', details: '3 shards to a ward.', obscure: false });
rel.registerItemUse(99526, { type: 'recipe', targetId: 99604, targetName: 'Malediction Ward', region: 'the_wilds', details: '3 shards to a ward.', obscure: false });

rel.registerItemUse(99545, { type: 'offering', targetId: 'wilds_lava_dragon_bones', targetName: 'Lava Dragon Bones on Chaos Altar', region: 'the_wilds', details: '85 prayer XP per bone. Chaos altar triples.', obscure: false });
rel.registerItemUse(99545, { type: 'offering', targetId: 'wilds_pyre_bone_wildsfire', targetName: 'Wilds Pyre', region: 'the_wilds', details: 'Pyre double-skill: firemaking + prayer.', obscure: true });

rel.registerItemUse(99550, { type: 'consumable', targetId: 'wilds_stackable_food_use', targetName: 'Wilds Stackable Food', region: 'the_wilds', details: 'Blighted shark heals 22. 1000/slot inside wilds.', obscure: false });

console.log('[aelgard] Wilds Deep loaded: 50+ training methods, 11 quests, 9 breakpoints, 16 PvP mechanics, 15+ unique drops, 10 combinations, 5 quirky interactions, cold clipped voice');
