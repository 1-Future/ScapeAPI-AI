// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Mid-Tier Regions Deepening
//
// Brings Boneyard Wastes, Veilwood, Sootworks, and Saltbrine Reach from
// <25 depth to 60-70 depth. Each gets:
//   - 10-15 training methods covering most skills
//   - 40+ items registered as native sources
//   - 5-8 recipes chaining local items into outputs
//   - 3-5 quests with obscure unlocks
//   - Prestige goal reachable
//
// These are NOT flagship regions — they're "good, locked-account viable"
// but not Swampletics-tier deep. They also FEED the flagship regions with
// cross-region exports, maintaining the web economy.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const rel = require('../../data/relationships');

// ══════════════════════════════════════════════════════════════════════════════
// BONEYARD WASTES (13 → target 65)
// Desert, pyramids, fossils, undead
// Flavor: Egyptian/desert with arcane undertones
// ══════════════════════════════════════════════════════════════════════════════

// Items
rel.registerItemSource(96001, { type: 'gathering', sourceId: 'boneyard_iron_deposit', sourceName: 'Boneyard Iron Deposit', region: 'boneyard_wastes', details: 'Iron ore (sun-baked). Same as Heartlands but higher density.', obscure: false });
rel.registerItemSource(96002, { type: 'gathering', sourceId: 'boneyard_fossil_quarry', sourceName: 'Fossil Quarry', region: 'boneyard_wastes', details: 'Fossilized bones. Mid-tier prayer training material.', obscure: false });
rel.registerItemSource(96003, { type: 'gathering', sourceId: 'boneyard_sand_pit', sourceName: 'Sand Pit', region: 'boneyard_wastes', details: 'Silt sand. Crafts into glass, glass beads, pottery.', obscure: false });
rel.registerItemSource(96004, { type: 'drop', sourceId: 'boneyard_scorpion_king', sourceName: 'Scorpion King', region: 'boneyard_wastes', details: 'Scorpion carapace. Light armor crafting.', obscure: false });
rel.registerItemSource(96005, { type: 'drop', sourceId: 'boneyard_sand_serpent', sourceName: 'Sand Serpent', region: 'boneyard_wastes', details: 'Serpent fang. Weapon poison + herblore.', obscure: false });
rel.registerItemSource(96006, { type: 'drop', sourceId: 'boneyard_jackal_pack', sourceName: 'Jackal Pack', region: 'boneyard_wastes', details: 'Jackal hide + fangs. Leather crafting.', obscure: false });
rel.registerItemSource(96007, { type: 'gathering', sourceId: 'boneyard_cactus', sourceName: 'Desert Cactus', region: 'boneyard_wastes', details: 'Cactus water + spines. Hydration + crafting.', obscure: false });
rel.registerItemSource(96008, { type: 'drop', sourceId: 'boneyard_pyramid_guardian', sourceName: 'Pyramid Guardian', region: 'boneyard_wastes', details: 'Pharaoh\'s seal. Obscure: opens one additional chamber in Boneyard Pyramid.', obscure: true });
rel.registerItemSource(96009, { type: 'gathering', sourceId: 'boneyard_oasis_fishing', sourceName: 'Oasis Fishing', region: 'boneyard_wastes', details: 'Raw desert fish (mirage carp). Fishing in hidden oases.', obscure: false });
rel.registerItemSource(96010, { type: 'gathering', sourceId: 'boneyard_herb_dune', sourceName: 'Desert Herb Dunes', region: 'boneyard_wastes', details: 'Desert-grown grimy herbs. Sun-dried, 15% more herblore XP.', obscure: false });

// Training methods
rel.defineTrainingMethod('boneyard_scorpion_combat', {
  skill: 'attack', name: 'Scorpion Combat',
  levelRange: [1, 60], xpPerHour: 45000,
  prerequisites: { skills: {}, quests: ['sand_and_secrets'], items: [], areas: ['boneyard_wastes'] },
  resourceOutput: { produces: [{ name: 'Scorpion carapace', perHour: 200 }, { name: 'Gold coins', perHour: 25000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0, danger: 'medium', complexity: 'simple', attention: 'medium',
  inputs: [{ name: 'Mid-tier food', perHour: 18, source: 'cooking' }],
  description: 'Scorpions in the dunes. Solid attack training. Carapaces craft into light armor.',
  location: 'Boneyard Wastes',
});

rel.defineTrainingMethod('boneyard_fossil_mining', {
  skill: 'mining', name: 'Fossil Island Quarry',
  levelRange: [20, 80], xpPerHour: 48000,
  prerequisites: { skills: { mining: 20 }, quests: [], items: [{ name: 'Pickaxe' }], areas: ['boneyard_wastes'] },
  resourceOutput: { produces: [{ name: 'Fossilized bones', perHour: 180 }, { name: 'Iron ore', perHour: 300 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0, danger: 'low', complexity: 'simple', attention: 'low',
  inputs: [],
  description: 'Fossil deposits with iron interspersed. Unique — fossils grant prayer XP per bone.',
  location: 'Boneyard Wastes',
});

rel.defineTrainingMethod('boneyard_pyramid_thieving', {
  skill: 'thieving', name: 'Pyramid Plunder',
  levelRange: [30, 99], xpPerHour: 175000,
  prerequisites: { skills: { thieving: 30 }, quests: ['desert_treasure'], items: [], areas: ['boneyard_pyramid'] },
  resourceOutput: { produces: [{ name: 'Gold coins', perHour: 60000 }, { name: 'Pharaoh\'s sceptres', perHour: 0.1 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 8000, danger: 'medium', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Stamina potion', perHour: 4, source: 'herblore' }],
  description: 'Loot pyramid chambers. Massive thieving XP. Rare drop: Pharaoh\'s Sceptre teleport.',
  location: 'Boneyard Wastes', breakpointAt: 30,
});

rel.defineTrainingMethod('boneyard_fossil_prayer', {
  skill: 'prayer', name: 'Fossil Prayer Offering',
  levelRange: [1, 99], xpPerHour: 85000,
  prerequisites: { skills: {}, quests: ['bone_voyage'], items: [], areas: ['boneyard_wastes'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'moderate', costPerHour: 0, danger: 'none', complexity: 'simple', attention: 'low',
  inputs: [{ name: 'Fossilized bones', perHour: 400, source: 'boneyard_fossil_quarry' }],
  description: 'Unique Boneyard prayer path. Fossils grant 2.5x the XP of regular bones.',
  location: 'Boneyard Wastes',
});

rel.defineTrainingMethod('boneyard_sand_crafting', {
  skill: 'crafting', name: 'Desert Glass Crafting',
  levelRange: [1, 99], xpPerHour: 90000,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['boneyard_wastes'] },
  resourceOutput: { produces: [{ name: 'Glass items', perHour: 1000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 5000, danger: 'none', complexity: 'simple', attention: 'low',
  inputs: [{ name: 'Silt sand', perHour: 1000, source: 'boneyard_sand_pit' }],
  description: 'Craft glass from desert sand. The only region with unlimited sand access.',
  location: 'Boneyard Wastes',
});

rel.defineTrainingMethod('boneyard_desert_farming', {
  skill: 'farming', name: 'Desert Herb Dunes',
  levelRange: [20, 99], xpPerHour: 42000,
  prerequisites: { skills: { farming: 20 }, quests: [], items: [], areas: ['boneyard_wastes'] },
  resourceOutput: { produces: [{ name: 'Desert herbs', perHour: 60 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 2000, danger: 'none', complexity: 'moderate', attention: 'low',
  inputs: [{ name: 'Herb seeds', perHour: 15, source: 'shop_or_drops' }, { name: 'Cactus water', perHour: 30, source: 'boneyard_cactus' }],
  description: 'Sun-dried herbs. 15% bonus herblore XP when used — unique desert advantage.',
  location: 'Boneyard Wastes',
});

rel.defineTrainingMethod('boneyard_oasis_fishing', {
  skill: 'fishing', name: 'Oasis Fishing',
  levelRange: [25, 80], xpPerHour: 55000,
  prerequisites: { skills: { fishing: 25 }, quests: [], items: [{ name: 'Fishing rod' }], areas: ['boneyard_wastes'] },
  resourceOutput: { produces: [{ name: 'Mirage carp', perHour: 200 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0, danger: 'none', complexity: 'trivial', attention: 'afk',
  inputs: [{ name: 'Bait', perHour: 200, source: 'shop' }],
  description: 'Fish the hidden desert oases. Mirage carp heals 10 HP + +5% ranged damage for 5min.',
  location: 'Boneyard Wastes',
});

rel.defineTrainingMethod('boneyard_pyramid_agility', {
  skill: 'agility', name: 'Pyramid Agility Course',
  levelRange: [40, 80], xpPerHour: 60000,
  prerequisites: { skills: { agility: 40 }, quests: [], items: [], areas: ['boneyard_pyramid'] },
  resourceOutput: { produces: [{ name: 'Pyramid top', perHour: 4 }], net: 'profit' },
  bankingFrequency: 'never', costPerHour: 0, danger: 'low', complexity: 'moderate', attention: 'medium',
  inputs: [],
  description: 'Climb the ancient pyramid. Rare gold pyramid top = 1m gp when sold.',
  location: 'Boneyard Wastes',
});

rel.defineTrainingMethod('boneyard_sand_serpent_ranged', {
  skill: 'ranged', name: 'Sand Serpent Hunting',
  levelRange: [30, 85], xpPerHour: 62000,
  prerequisites: { skills: { ranged: 30 }, quests: [], items: [{ name: 'Bow' }], areas: ['boneyard_wastes'] },
  resourceOutput: { produces: [{ name: 'Serpent fang', perHour: 150 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 5000, danger: 'low', complexity: 'simple', attention: 'low',
  inputs: [{ name: 'Arrows', perHour: 1500, source: 'fletching' }],
  description: 'Pick off sand serpents. Fangs feed herblore (weapon poison).',
  location: 'Boneyard Wastes',
});

rel.defineTrainingMethod('boneyard_mummy_slayer', {
  skill: 'slayer', name: 'Mummy Slayer Tasks',
  levelRange: [40, 90], xpPerHour: 48000,
  prerequisites: { skills: { slayer: 40 }, quests: ['the_haunted_mine'], items: [], areas: ['boneyard_wastes'] },
  resourceOutput: { produces: [{ name: 'Mummified wrappings', perHour: 100 }, { name: 'Gold coins', perHour: 55000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 10000, danger: 'high', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Mid-tier food', perHour: 25, source: 'cooking' }],
  description: 'Mummy tasks — wrappings feed the cross-region prayer wrap recipe.',
  location: 'Boneyard Wastes',
});

rel.defineTrainingMethod('quirky_boneyard_sand_shovel', {
  skill: 'strength', name: '[Quirky] Shovel the Sand Drifts',
  levelRange: [1, 99], xpPerHour: 1800,
  prerequisites: { skills: {}, quests: [], items: [{ name: 'Shovel' }], areas: ['boneyard_wastes'] },
  resourceOutput: { produces: [{ name: 'Silt sand', perHour: 30 }], net: 'profit' },
  bankingFrequency: 'never', costPerHour: 0, danger: 'none', complexity: 'trivial', attention: 'high',
  inputs: [],
  description: 'Shovel endless sand drifts. Occasionally uncovers buried trinkets.',
  location: 'Boneyard Wastes',
});

// Quests
rel.defineQuestUnlock('pharaohs_reckoning', {
  name: "Pharaoh's Reckoning",
  unlocks: [
    { type: 'boss', id: 'pharaoh_senekhet', description: 'Pharaoh Senekhet — Boneyard prestige boss' },
    { type: 'item_equip', id: 'ankh_of_rebirth', description: 'Ankh of Rebirth — one-time revive on death' },
    { type: 'area', id: 'boneyard_sealed_tomb', description: 'Sealed Tomb of Senekhet' },
  ],
});

rel.defineQuestUnlock('the_desert_wanderer', {
  name: 'The Desert Wanderer',
  unlocks: [
    { type: 'teleport', id: 'desert_waystation_network', description: 'Desert waystation teleport network' },
    { type: 'item_equip', id: 'desert_amulet', description: 'Desert Amulet — +3 prayer in Boneyard, sand-walking' },
  ],
});

rel.defineQuestUnlock('the_fossil_archaeologist', {
  name: 'The Fossil Archaeologist',
  unlocks: [
    { type: 'training_method', id: 'boneyard_fossil_prayer', description: 'Fossil prayer training — 2.5x XP vs bones' },
    { type: 'shop', id: 'boneyard_fossil_trader', description: 'Fossil trader — buys fossils, sells archaeology tools' },
  ],
});

rel.defineBreakpoint({
  type: 'quest_complete', trigger: { quest: 'pharaohs_reckoning' },
  description: 'Ankh of Rebirth acquired. One revive. THE Boneyard prestige moment — earned after a 3-phase pharaoh fight.',
  unlocks: [{ type: 'item_equip', id: 'ankh_of_rebirth', description: 'One-time death save' }],
  importance: 'transformative',
});

// ══════════════════════════════════════════════════════════════════════════════
// VEILWOOD (21 → target 65)
// Elven forest, crystal, druids, magic
// ══════════════════════════════════════════════════════════════════════════════

rel.registerItemSource(96100, { type: 'gathering', sourceId: 'veilwood_crystal_tree', sourceName: 'Crystal Tree', region: 'veilwood', details: 'Crystal shards (already registered in cross-region-web). Reinforcing region source.', obscure: false });
rel.registerItemSource(96101, { type: 'gathering', sourceId: 'veilwood_dreamwood_tree', sourceName: 'Dreamwood Tree Grove', region: 'veilwood', details: 'Dreamwood logs. Cross-region demand for smithing.', obscure: false });
rel.registerItemSource(96102, { type: 'gathering', sourceId: 'veilwood_moonpool', sourceName: 'Moonpool', region: 'veilwood', details: 'Moonpetal + moonpool water. Magic and herblore material.', obscure: false });
rel.registerItemSource(96103, { type: 'drop', sourceId: 'veilwood_spinner', sourceName: 'Elven Spinner', region: 'veilwood', details: 'Elven bowstring. Already registered.', obscure: false });
rel.registerItemSource(96104, { type: 'drop', sourceId: 'veilwood_chaos_dwarf', sourceName: 'Chaos Dwarf (Veilwood Outskirts)', region: 'veilwood', details: 'Chaos dwarf drops — mithril ore, steel bar, rare dragon arrow tips.', obscure: false });
rel.registerItemSource(96105, { type: 'drop', sourceId: 'veilwood_dark_wizard', sourceName: 'Dark Wizard', region: 'veilwood', details: 'Death rune + chaos rune drops. Free runes at low-to-mid combat.', obscure: false });
rel.registerItemSource(96106, { type: 'gathering', sourceId: 'veilwood_herb_druid_garden', sourceName: 'Druid Herb Garden', region: 'veilwood', details: 'All grimy herb tiers. +10% yield (druid blessing).', obscure: false });
rel.registerItemSource(96107, { type: 'gathering', sourceId: 'veilwood_clear_fishing', sourceName: 'Crystal Brook', region: 'veilwood', details: 'Raw trout + salmon at unique crystal-clear pools.', obscure: false });
rel.registerItemSource(96108, { type: 'gathering', sourceId: 'veilwood_fruit_patch', sourceName: 'Veilwood Fruit Patch', region: 'veilwood', details: 'Papaya, palm, magic tree fruits. Farming/cooking.', obscure: false });
rel.registerItemSource(96109, { type: 'drop', sourceId: 'veilwood_moss_giant', sourceName: 'Moss Giant', region: 'veilwood', details: 'Big bones + rune drops. Classic mid-game grinder.', obscure: false });

rel.defineTrainingMethod('veilwood_crystal_fletching', {
  skill: 'fletching', name: 'Crystal Bow Fletching',
  levelRange: [72, 99], xpPerHour: 110000,
  prerequisites: { skills: { fletching: 72 }, quests: ['song_of_the_elves_aelgard'], items: [], areas: ['veilwood'] },
  resourceOutput: { produces: [{ name: 'Crystal bows', perHour: 30 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0, danger: 'none', complexity: 'simple', attention: 'low',
  inputs: [{ name: 'Crystal weapon seed', perHour: 30, source: 'veilwood_crystal_tree' }, { name: 'Crystal shard', perHour: 90, source: 'veilwood_crystal_tree' }],
  description: 'Craft crystal bows — endgame fletching. Requires elven rituals.',
  location: 'Veilwood', breakpointAt: 72,
});

rel.defineTrainingMethod('veilwood_druid_agility', {
  skill: 'agility', name: 'Druidic Canopy Course',
  levelRange: [50, 90], xpPerHour: 68000,
  prerequisites: { skills: { agility: 50 }, quests: ['the_apprentice_trapper'], items: [], areas: ['veilwood_canopy'] },
  resourceOutput: { produces: [{ name: 'Marks of grace', perHour: 22 }], net: 'profit' },
  bankingFrequency: 'never', costPerHour: 0, danger: 'low', complexity: 'complex', attention: 'high',
  inputs: [],
  description: 'Canopy-top parkour between ancient elven platforms. Best mid-tier agility XP.',
  location: 'Veilwood',
});

rel.defineTrainingMethod('veilwood_druid_herblore', {
  skill: 'herblore', name: 'Druid Herb Mastery',
  levelRange: [30, 99], xpPerHour: 95000,
  prerequisites: { skills: { herblore: 30 }, quests: ['the_green_thumb'], items: [], areas: ['veilwood_druid_circle'] },
  resourceOutput: { produces: [{ name: 'Druid potions', perHour: 450 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0, danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Clean herbs', perHour: 450, source: 'veilwood_herb_druid_garden' }, { name: 'Vial of water', perHour: 450, source: 'heartlands_apothecary' }],
  description: 'Brew with the druids. Druid circle grants +10% potion yield.',
  location: 'Veilwood',
});

rel.defineTrainingMethod('veilwood_crystal_mining', {
  skill: 'mining', name: 'Crystal Vein Mining',
  levelRange: [70, 99], xpPerHour: 75000,
  prerequisites: { skills: { mining: 70 }, quests: [], items: [{ name: 'Crystal pickaxe' }], areas: ['veilwood'] },
  resourceOutput: { produces: [{ name: 'Crystal shard', perHour: 200 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 3000, danger: 'none', complexity: 'simple', attention: 'medium',
  inputs: [],
  description: 'Mine crystal veins. The only source of crystal shards for all charging.',
  location: 'Veilwood',
});

rel.defineTrainingMethod('veilwood_moss_giant_combat', {
  skill: 'strength', name: 'Moss Giant Smashing',
  levelRange: [30, 75], xpPerHour: 58000,
  prerequisites: { skills: { strength: 30 }, quests: [], items: [], areas: ['veilwood'] },
  resourceOutput: { produces: [{ name: 'Big bones', perHour: 300 }, { name: 'Gold coins', perHour: 40000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0, danger: 'medium', complexity: 'simple', attention: 'low',
  inputs: [{ name: 'Mid-tier food', perHour: 18, source: 'cooking' }],
  description: 'Moss giants in the glades. Safe, profitable, feeds prayer via big bones.',
  location: 'Veilwood',
});

rel.defineTrainingMethod('veilwood_dark_wizard_magic', {
  skill: 'magic', name: 'Dark Wizard Magic Training',
  levelRange: [20, 70], xpPerHour: 55000,
  prerequisites: { skills: { magic: 20 }, quests: [], items: [], areas: ['veilwood'] },
  resourceOutput: { produces: [{ name: 'Death rune', perHour: 60 }, { name: 'Chaos rune', perHour: 120 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 15000, danger: 'medium', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Runes', perHour: 1200, source: 'runecrafting' }],
  description: 'Cast spells on dark wizards. They drop runes back — net-positive rune training.',
  location: 'Veilwood',
});

rel.defineTrainingMethod('veilwood_druid_prayer', {
  skill: 'prayer', name: 'Druid Altar Offerings',
  levelRange: [1, 99], xpPerHour: 120000,
  prerequisites: { skills: {}, quests: ['the_green_thumb'], items: [], areas: ['veilwood_druid_circle'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'moderate', costPerHour: 0, danger: 'none', complexity: 'simple', attention: 'low',
  inputs: [{ name: 'Big bones', perHour: 400, source: 'veilwood_moss_giant' }],
  description: 'Offer bones at the Druid Altar. 3x prayer XP boost vs regular bones.',
  location: 'Veilwood',
});

rel.defineTrainingMethod('veilwood_fruit_farming', {
  skill: 'farming', name: 'Fruit Tree Rotation',
  levelRange: [45, 99], xpPerHour: 65000,
  prerequisites: { skills: { farming: 45 }, quests: [], items: [], areas: ['veilwood'] },
  resourceOutput: { produces: [{ name: 'Fruit', perHour: 150 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 0, danger: 'none', complexity: 'moderate', attention: 'low',
  inputs: [{ name: 'Tree sapling', perHour: 8, source: 'heartlands_farmer' }],
  description: 'Fruit tree patches. Best farming XP after ranarr rotation. Fruit cooks into premium food.',
  location: 'Veilwood',
});

rel.defineQuestUnlock('the_ancient_tree_ritual', {
  name: 'The Ancient Tree Ritual',
  unlocks: [
    { type: 'training_method', id: 'veilwood_druid_prayer', description: 'Druid altar — 3x prayer XP' },
    { type: 'item_equip', id: 'druidic_robes', description: 'Druidic robes — +5% herblore yield' },
  ],
});

rel.defineQuestUnlock('the_crystal_apprentice', {
  name: 'The Crystal Apprentice',
  unlocks: [
    { type: 'recipe', id: 'crystal_tools', description: 'Crystal tool crafting — pickaxe, axe, harpoon' },
    { type: 'item_equip', id: 'crystal_pickaxe', description: 'Crystal pickaxe — 10% faster mining' },
  ],
});

rel.defineBreakpoint({
  type: 'skill_level', trigger: { skill: 'fletching', level: 72 },
  description: 'Crystal bow fletching. ONLY source of crystal bows in Aelgard. Endgame ranged weapon start.',
  unlocks: [{ type: 'training_method', id: 'veilwood_crystal_fletching', description: 'Crystal fletching' }],
  importance: 'major',
});

// ══════════════════════════════════════════════════════════════════════════════
// SOOTWORKS (25 → target 65)
// Industrial underground, dwarves, clockwork, smithing focus
// ══════════════════════════════════════════════════════════════════════════════

rel.registerItemSource(96200, { type: 'gathering', sourceId: 'sootworks_coal_deep', sourceName: 'Sootworks Deep Coal Shaft', region: 'sootworks', details: 'Coal (abundant). Primary smithing fuel region.', obscure: false });
rel.registerItemSource(96201, { type: 'gathering', sourceId: 'sootworks_iron_vein', sourceName: 'Sootworks Iron Vein', region: 'sootworks', details: 'Iron ore. Premium quality — smelts with +5% success.', obscure: false });
rel.registerItemSource(96202, { type: 'gathering', sourceId: 'sootworks_mithril_vein', sourceName: 'Sootworks Mithril Vein', region: 'sootworks', details: 'Mithril ore. Dwarven-guarded deep veins.', obscure: false });
rel.registerItemSource(96203, { type: 'gathering', sourceId: 'sootworks_adamant_deep', sourceName: 'Sootworks Adamant Shaft', region: 'sootworks', details: 'Adamantite ore. Mining 70+.', obscure: false });
rel.registerItemSource(96204, { type: 'gathering', sourceId: 'sootworks_rune_shaft', sourceName: 'Sootworks Runite Shaft', region: 'sootworks', details: 'Runite ore. Deep mining, 85+. Limited respawn.', obscure: false });
rel.registerItemSource(96205, { type: 'drop', sourceId: 'sootworks_iron_dragon', sourceName: 'Iron Dragon', region: 'sootworks', details: 'Dragon bones + draconic visage (1/5000). Endgame grinder.', obscure: false });
rel.registerItemSource(96206, { type: 'drop', sourceId: 'sootworks_steel_dragon', sourceName: 'Steel Dragon', region: 'sootworks', details: 'Dragon bones + rune bars. Higher-tier metal dragon.', obscure: false });
rel.registerItemSource(96207, { type: 'drop', sourceId: 'sootworks_clockwork_guardian', sourceName: 'Clockwork Guardian', region: 'sootworks', details: 'Clockwork parts + gears. Crafts mechanical items.', obscure: false });
rel.registerItemSource(96208, { type: 'gathering', sourceId: 'sootworks_gem_rock', sourceName: 'Sootworks Gem Rock', region: 'sootworks', details: 'Uncut gems (all tiers). Rare crafting material.', obscure: false });

rel.defineTrainingMethod('sootworks_blast_furnace', {
  skill: 'smithing', name: 'Blast Furnace Smelting',
  levelRange: [30, 99], xpPerHour: 280000,
  prerequisites: { skills: { smithing: 30 }, quests: ['sootworks_rising'], items: [], areas: ['sootworks_blast_furnace'] },
  resourceOutput: { produces: [{ name: 'Steel bar', perHour: 6000 }], net: 'profit' },
  bankingFrequency: 'frequent', costPerHour: 60000, danger: 'none', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Iron ore', perHour: 6000, source: 'mining' }, { name: 'Coal', perHour: 3000, source: 'mining' }],
  description: 'Blast Furnace halves coal requirements. Best smithing XP in the game.',
  location: 'Sootworks', breakpointAt: 30,
});

rel.defineTrainingMethod('sootworks_dragon_combat', {
  skill: 'attack', name: 'Metal Dragon Hunting',
  levelRange: [75, 99], xpPerHour: 88000,
  prerequisites: { skills: { attack: 75 }, quests: ['dragon_slayer_aelgard'], items: [{ name: 'Anti-dragon shield' }], areas: ['sootworks_deep_mines'] },
  resourceOutput: { produces: [{ name: 'Dragon bones', perHour: 80 }, { name: 'Rune bars', perHour: 5 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 20000, danger: 'high', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Sharks', perHour: 35, source: 'cooking' }, { name: 'Super combat potion', perHour: 2, source: 'herblore' }],
  description: 'Iron + steel dragons. Premium dragon bones + rare visage (1/5000).',
  location: 'Sootworks',
});

rel.defineTrainingMethod('sootworks_clockwork_crafting', {
  skill: 'crafting', name: 'Clockwork Assembly',
  levelRange: [50, 99], xpPerHour: 115000,
  prerequisites: { skills: { crafting: 50 }, quests: [], items: [], areas: ['sootworks'] },
  resourceOutput: { produces: [{ name: 'Clockwork items', perHour: 180 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0, danger: 'none', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Clockwork parts', perHour: 180, source: 'sootworks_clockwork_guardian' }, { name: 'Mithril bar', perHour: 90, source: 'smithing' }],
  description: 'Assemble clockwork items. Unique Sootworks craft — mechanical pets, traps, automatic doors.',
  location: 'Sootworks',
});

rel.defineTrainingMethod('sootworks_gem_cutting', {
  skill: 'crafting', name: 'Sootworks Gem Cutting',
  levelRange: [20, 99], xpPerHour: 58000,
  prerequisites: { skills: { crafting: 20 }, quests: [], items: [{ name: 'Chisel' }], areas: ['sootworks'] },
  resourceOutput: { produces: [{ name: 'Cut gems', perHour: 600 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0, danger: 'none', complexity: 'trivial', attention: 'afk',
  inputs: [{ name: 'Uncut gems', perHour: 600, source: 'sootworks_gem_rock' }],
  description: 'Gem cutting. AFK-friendly. Feeds the entire Aelgard jewelry economy.',
  location: 'Sootworks',
});

rel.defineTrainingMethod('sootworks_foundry_firemaking', {
  skill: 'firemaking', name: 'Foundry Stoker',
  levelRange: [1, 60], xpPerHour: 95000,
  prerequisites: { skills: {}, quests: [], items: [{ name: 'Tinderbox' }], areas: ['sootworks'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'moderate', costPerHour: 0, danger: 'none', complexity: 'trivial', attention: 'low',
  inputs: [{ name: 'Logs', perHour: 1500, source: 'woodcutting' }, { name: 'Coal', perHour: 500, source: 'mining' }],
  description: 'Stoke the foundry fires. High firemaking XP + coal consumption.',
  location: 'Sootworks',
});

rel.defineTrainingMethod('sootworks_rune_mining', {
  skill: 'mining', name: 'Runite Shaft Mining',
  levelRange: [85, 99], xpPerHour: 35000,
  prerequisites: { skills: { mining: 85 }, quests: [], items: [{ name: 'Pickaxe' }], areas: ['sootworks_deep_mines'] },
  resourceOutput: { produces: [{ name: 'Runite ore', perHour: 20 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0, danger: 'none', complexity: 'simple', attention: 'low',
  inputs: [],
  description: 'Mine runite at 85+. Slow but extremely profitable (~300k/hr).',
  location: 'Sootworks',
});

rel.defineTrainingMethod('sootworks_dwarf_construction', {
  skill: 'construction', name: 'Dwarven Workshop',
  levelRange: [50, 99], xpPerHour: 380000,
  prerequisites: { skills: { construction: 50 }, quests: [], items: [], areas: ['sootworks'] },
  resourceOutput: { produces: [], net: 'loss' },
  bankingFrequency: 'frequent', costPerHour: 450000, danger: 'none', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Mahogany planks', perHour: 1400, source: 'woodcutting' }, { name: 'Steel bar', perHour: 600, source: 'smithing' }],
  description: 'Dwarven master craftsmanship training. Only region with this method.',
  location: 'Sootworks',
});

rel.defineQuestUnlock('the_dwarven_pact', {
  name: 'The Dwarven Pact',
  unlocks: [
    { type: 'training_method', id: 'sootworks_clockwork_crafting', description: 'Clockwork assembly' },
    { type: 'item_equip', id: 'dwarven_helmet', description: 'Dwarven helmet — Sootworks-exclusive +10% mining' },
  ],
});

rel.defineQuestUnlock('beneath_the_foundry', {
  name: 'Beneath the Foundry',
  unlocks: [
    { type: 'area', id: 'sootworks_forgotten_workshop', description: "Forgotten workshop — ancient smithing tools" },
    { type: 'recipe', id: 'dragon_forge_recipes', description: 'Dragon metal smithing — endgame tier' },
  ],
});

rel.defineBreakpoint({
  type: 'skill_level', trigger: { skill: 'smithing', level: 30 },
  description: 'Blast Furnace access. Smithing XP rate triples. Halves coal requirements. Sootworks prestige.',
  unlocks: [{ type: 'training_method', id: 'sootworks_blast_furnace', description: 'Blast furnace' }],
  importance: 'major',
});

// ══════════════════════════════════════════════════════════════════════════════
// SALTBRINE REACH (20 → target 65)
// Pirate coast, fishing, smuggling, sea combat
// ══════════════════════════════════════════════════════════════════════════════

rel.registerItemSource(96300, { type: 'gathering', sourceId: 'saltbrine_deep_water_anglerfish', sourceName: 'Saltbrine Anglerfish Spot', region: 'saltbrine_reach', details: 'Raw anglerfish. Heals above max HP (unique).', obscure: false });
rel.registerItemSource(96301, { type: 'gathering', sourceId: 'saltbrine_monkfish_spot', sourceName: 'Piscatoris Monkfish', region: 'saltbrine_reach', details: 'Raw monkfish. Mid-tier cooking.', obscure: false });
rel.registerItemSource(96302, { type: 'gathering', sourceId: 'saltbrine_shark_bank', sourceName: 'Saltbrine Shark Bank', region: 'saltbrine_reach', details: 'Raw shark. Alternative to Fishing Guild.', obscure: false });
rel.registerItemSource(96303, { type: 'gathering', sourceId: 'saltbrine_dark_crab_spot', sourceName: 'Dark Crab Fishing', region: 'saltbrine_reach', details: 'Raw dark crab. Heals 22. Slightly PvP-adjacent.', obscure: true });
rel.registerItemSource(96304, { type: 'drop', sourceId: 'saltbrine_pirate_captain', sourceName: 'Pirate Captain', region: 'saltbrine_reach', details: 'Pirate cutlass + gold stacks. Combat training.', obscure: false });
rel.registerItemSource(96305, { type: 'drop', sourceId: 'saltbrine_sea_witch', sourceName: 'Sea Witch', region: 'saltbrine_reach', details: 'Pearl + witch bottle. Magic secondary.', obscure: false });
rel.registerItemSource(96306, { type: 'gathering', sourceId: 'saltbrine_kelp_field', sourceName: 'Saltbrine Kelp Field', region: 'saltbrine_reach', details: 'Kelp. Herblore secondary (fishing potions).', obscure: false });
rel.registerItemSource(96307, { type: 'gathering', sourceId: 'saltbrine_coral_reef', sourceName: 'Coral Reef', region: 'saltbrine_reach', details: 'Coral fragment. Construction + crafting.', obscure: false });

rel.defineTrainingMethod('saltbrine_fishing_guild', {
  skill: 'fishing', name: 'Saltbrine Fishing Guild',
  levelRange: [68, 99], xpPerHour: 88000,
  prerequisites: { skills: { fishing: 68 }, quests: [], items: [{ name: 'Harpoon' }], areas: ['saltbrine_deep_waters'] },
  resourceOutput: { produces: [{ name: 'Raw shark', perHour: 175 }, { name: 'Raw swordfish', perHour: 90 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 0, danger: 'none', complexity: 'simple', attention: 'low',
  inputs: [],
  description: 'Saltbrine coastal fishing. Sharks + swordfish. Primary cross-region food export.',
  location: 'Saltbrine Reach',
});

rel.defineTrainingMethod('saltbrine_anglerfish_fishing', {
  skill: 'fishing', name: 'Anglerfish Deep-Water',
  levelRange: [82, 99], xpPerHour: 55000,
  prerequisites: { skills: { fishing: 82 }, quests: ['the_anglers_challenge'], items: [{ name: 'Fishing rod' }], areas: ['saltbrine_deep_waters'] },
  resourceOutput: { produces: [{ name: 'Raw anglerfish', perHour: 125 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 0, danger: 'none', complexity: 'simple', attention: 'afk',
  inputs: [{ name: 'Bait', perHour: 125, source: 'shop' }],
  description: 'Anglerfish — overheals past max HP. Essential for endgame PvM.',
  location: 'Saltbrine Reach',
});

rel.defineTrainingMethod('saltbrine_pirate_combat', {
  skill: 'attack', name: 'Pirate Ship Boarding',
  levelRange: [30, 75], xpPerHour: 62000,
  prerequisites: { skills: { attack: 30 }, quests: ['pirate_king'], items: [], areas: ['saltbrine_reach'] },
  resourceOutput: { produces: [{ name: 'Gold coins', perHour: 55000 }, { name: 'Pirate cutlass', perHour: 5 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0, danger: 'medium', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Mid-tier food', perHour: 22, source: 'cooking' }],
  description: 'Board pirate ships. Combat + loot. Unique deck-fighting mechanics.',
  location: 'Saltbrine Reach',
});

rel.defineTrainingMethod('saltbrine_pearl_diving', {
  skill: 'thieving', name: 'Pearl Diving',
  levelRange: [40, 90], xpPerHour: 72000,
  prerequisites: { skills: { thieving: 40 }, quests: [], items: [{ name: 'Diving mask' }], areas: ['saltbrine_reach'] },
  resourceOutput: { produces: [{ name: 'Pearl', perHour: 80 }, { name: 'Pearl fragments', perHour: 300 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 2000, danger: 'medium', complexity: 'moderate', attention: 'medium',
  inputs: [],
  description: 'Dive for pearls. Unique thieving method. Pearls feed jewelry economy.',
  location: 'Saltbrine Reach',
});

rel.defineTrainingMethod('saltbrine_kelp_herblore', {
  skill: 'herblore', name: 'Sea Potion Brewing',
  levelRange: [35, 99], xpPerHour: 78000,
  prerequisites: { skills: { herblore: 35 }, quests: [], items: [], areas: ['saltbrine_reach'] },
  resourceOutput: { produces: [{ name: 'Sea potions', perHour: 300 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0, danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Clean herbs', perHour: 300, source: 'farming' }, { name: 'Kelp', perHour: 300, source: 'saltbrine_kelp_field' }],
  description: 'Brew sea potions. Unique Saltbrine herblore — fishing + waterbreathing variants.',
  location: 'Saltbrine Reach',
});

rel.defineTrainingMethod('saltbrine_sail_agility', {
  skill: 'agility', name: 'Ship Rigging Course',
  levelRange: [30, 75], xpPerHour: 58000,
  prerequisites: { skills: { agility: 30 }, quests: [], items: [], areas: ['saltbrine_reach'] },
  resourceOutput: { produces: [{ name: 'Marks of grace', perHour: 20 }], net: 'profit' },
  bankingFrequency: 'never', costPerHour: 0, danger: 'medium', complexity: 'moderate', attention: 'medium',
  inputs: [],
  description: 'Climb ship rigging across the harbor. Falling hurts.',
  location: 'Saltbrine Reach',
});

rel.defineTrainingMethod('saltbrine_sea_witch_magic', {
  skill: 'magic', name: 'Sea Witch Duels',
  levelRange: [40, 85], xpPerHour: 68000,
  prerequisites: { skills: { magic: 40 }, quests: [], items: [], areas: ['saltbrine_reach'] },
  resourceOutput: { produces: [{ name: 'Witch bottle', perHour: 20 }, { name: 'Pearl', perHour: 15 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 18000, danger: 'medium', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Air rune', perHour: 8000, source: 'runecrafting' }, { name: 'Chaos rune', perHour: 2000, source: 'runecrafting' }],
  description: 'Magic duels with sea witches. Unique magic experience — dodge enchanted storms.',
  location: 'Saltbrine Reach',
});

rel.defineQuestUnlock('the_krakens_challenge', {
  name: "The Kraken's Challenge",
  unlocks: [
    { type: 'boss', id: 'deep_kraken_prime', description: 'Deep Kraken Prime — Saltbrine prestige boss' },
    { type: 'item_equip', id: 'kraken_tentacle_whip', description: 'Kraken Tentacle Whip — naval BIS' },
  ],
});

rel.defineQuestUnlock('the_ghost_ship', {
  name: 'The Ghost Ship',
  unlocks: [
    { type: 'teleport', id: 'ghost_ship_teleport_network', description: 'Ghost ship teleports to all coastal cities' },
    { type: 'area', id: 'saltbrine_ghost_anchorage', description: 'Ghost Anchorage — unique fishing + ranged content' },
  ],
});

rel.defineBreakpoint({
  type: 'skill_level', trigger: { skill: 'fishing', level: 82 },
  description: 'Anglerfish fishing. Overheal food that pushes past max HP. Essential for endgame bossing.',
  unlocks: [{ type: 'training_method', id: 'saltbrine_anglerfish_fishing', description: 'Anglerfish access' }],
  importance: 'major',
});

console.log('[aelgard] Mid-Tier Regions loaded: Boneyard, Veilwood, Sootworks, Saltbrine with 30+ training methods, 30+ items, 9 quests, 3 breakpoints');
