// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Boneyard Wastes Deepening
//
// Target: push Boneyard from gap=18 to 65+.
// Analyzer flags 12 hard-blocked skills:
//   defence, hitpoints, magic, runecrafting, construction, herblore,
//   fletching, hunter, smithing, cooking, firemaking, woodcutting
// Plus attack is capped at 60 (needs 70-99 tier).
//
// Voice: parched prophet. Long sentences. Biblical cadence. Water-as-currency.
// "The wind has a number." The desert remembers names. Salt-chapped, sun-blackened,
// sand-warden, prayer-stone. Cormac McCarthy + Frank Herbert. Not Mad Max.
//
// Flavor zones (each a distinct sub-area with its own skills):
//   The Bone Pyramid     — slayer (sand-mummy, glass-scarab, salt-jackal, dust-hound)
//   Salt Cisterns        — runecrafting (desiccated rune-salts)
//   The Singing Dunes    — agility (dune-vault, wind-shift running)
//   The Burnt Library    — magic (sun-burned scrolls, prayer-binding spells)
//   The Veiled Grave     — prayer (anti-undead chants, water-blessing rites)
//   The Hyena Markets    — thieving (sand-caches, cipher-tongue, disappeared-trade)
//   The Boil Pits        — herblore (heat-distilled tinctures, salt-cured potions)
//   Dust-Dwellers        — hunter (sand-hawk falconry, deathstalker traps)
//   Quarrymaster's Camp  — mining (sandstone, granite, salt-crystal)
//   Smelter's Bones      — smithing (sun-tempered alloys, bone-bound iron)
//   Salted Cookery       — cooking (sand-jerky, bone-broth, dry-cure)
//   Sun-Bleach Pits      — firemaking (sun-fire, magnifier-bow)
//   The Splinter         — fletching (bone-shaft arrows, scorpion-fletching)
//   The Salt Sea Range   — ranged (boomerang-class throwing in dune chains)
//   Bones of Fallen Kings— strength/defence/hp (combat trials)
//   Dry-Cure Field       — farming (cactus-fruit, dry-corn, salt-rooted barley)
//   Desert-Temple Yard   — construction (sand-glass walls, temple framing)
//   Bone Jewelry Room    — crafting (chitin armor, sand-glass beadwork)
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const rel = require('../../data/relationships');

// ══════════════════════════════════════════════════════════════════════════════
// BONEYARD-NATIVE ITEM SOURCES (IDs 96000-96999)
// Every method below produces or consumes at least one of these.
// ══════════════════════════════════════════════════════════════════════════════

// Bone Pyramid — slayer drops
rel.registerItemSource(96001, { type: 'drop', sourceId: 'boneyard_sand_mummy', sourceName: 'Sand-Mummy', region: 'boneyard_wastes', details: 'Sun-bleached wrap. Sand-mummy linen — prayer-wraps + ranger cloth.', obscure: false });
rel.registerItemSource(96002, { type: 'drop', sourceId: 'boneyard_glass_scarab', sourceName: 'Glass-Scarab', region: 'boneyard_wastes', details: 'Chitin-glass plate. Fuses into sand-glass armor at the Bone Jewelry Room.', obscure: false });
rel.registerItemSource(96003, { type: 'drop', sourceId: 'boneyard_salt_jackal', sourceName: 'Salt-Jackal', region: 'boneyard_wastes', details: 'Salt-cured pelt. Base for the sand-warden cloak. Also: jackal-tooth fletching tip.', obscure: false });
rel.registerItemSource(96004, { type: 'drop', sourceId: 'boneyard_dust_hound', sourceName: 'Dust-Hound', region: 'boneyard_wastes', details: 'Dust-hound fang. Herblore secondary — binds the thirst-cure tincture.', obscure: true });
rel.registerItemSource(96005, { type: 'drop', sourceId: 'boneyard_ghost_camel', sourceName: 'Ghost-Camel', region: 'boneyard_wastes', details: 'Ghost-camel bone. Rare — the pyre-bones that the Veiled Grave burns for deep prayer.', obscure: true });
rel.registerItemSource(96006, { type: 'drop', sourceId: 'boneyard_deathstalker', sourceName: 'Deathstalker Scorpion', region: 'boneyard_wastes', details: 'Deathstalker venom-gland. Strong poison secondary + fletching-tip venom.', obscure: false });

// Salt Cisterns — runecrafting inputs
rel.registerItemSource(96010, { type: 'gathering', sourceId: 'boneyard_salt_cistern', sourceName: 'Salt Cistern', region: 'boneyard_wastes', details: 'Rune-salt (desiccated essence). Runecrafting. Does not chip; tastes of ash.', obscure: false });
rel.registerItemSource(96011, { type: 'gathering', sourceId: 'boneyard_prayer_stone_quarry', sourceName: 'Prayer-Stone Vein', region: 'boneyard_wastes', details: 'Prayer-stone. A grey talc carved into wind-numbers. Crafting + prayer offering.', obscure: false });
rel.registerItemSource(96012, { type: 'gathering', sourceId: 'boneyard_salt_crystal_bed', sourceName: 'Salt-Crystal Bed', region: 'boneyard_wastes', details: 'Salt-crystal. Mining, smithing flux, cooking dry-cure, and herblore salt-binding.', obscure: false });

// Quarrymaster's Camp — mining
rel.registerItemSource(96020, { type: 'gathering', sourceId: 'boneyard_sandstone_slab', sourceName: 'Sandstone Slab', region: 'boneyard_wastes', details: 'Sandstone. Construction for desert-temple walls. Smelts into sand-glass.', obscure: false });
rel.registerItemSource(96021, { type: 'gathering', sourceId: 'boneyard_granite_face', sourceName: 'Granite Face', region: 'boneyard_wastes', details: 'Granite. Construction capstone. Heavy — limits banking frequency.', obscure: false });
rel.registerItemSource(96022, { type: 'gathering', sourceId: 'boneyard_bone_iron_vein', sourceName: 'Bone-Iron Vein', region: 'boneyard_wastes', details: 'Bone-iron ore. The old kings\' bones fused into iron. Smelter\'s Bones forge only.', obscure: true });

// Dry-Cure Field — farming outputs
rel.registerItemSource(96030, { type: 'gathering', sourceId: 'boneyard_cactus_fruit_patch', sourceName: 'Cactus-Fruit Patch', region: 'boneyard_wastes', details: 'Cactus-fruit. Farming output. Cooks into salt-sweet jerky. Also a thirst-cure secondary.', obscure: false });
rel.registerItemSource(96031, { type: 'gathering', sourceId: 'boneyard_dry_corn_row', sourceName: 'Dry-Corn Row', region: 'boneyard_wastes', details: 'Dry-corn. Farming. The sand-warden\'s staple. Grinds into sand-meal for bone-broth.', obscure: false });
rel.registerItemSource(96032, { type: 'gathering', sourceId: 'boneyard_salt_barley_plot', sourceName: 'Salt-Rooted Barley Plot', region: 'boneyard_wastes', details: 'Salt-barley. Farming. Brews into the prophet\'s bitter beer — herblore secondary.', obscure: false });
rel.registerItemSource(96033, { type: 'gathering', sourceId: 'boneyard_desert_herb_dryrack', sourceName: 'Desert Herb Dryrack', region: 'boneyard_wastes', details: 'Sun-dried herbs (all tiers). 15% herblore XP bonus vs wet-grown herbs.', obscure: false });

// Hyena Markets — thieving outputs
rel.registerItemSource(96040, { type: 'drop', sourceId: 'boneyard_hyena_fence', sourceName: 'Hyena Market Fence', region: 'boneyard_wastes', details: 'Cipher-script scrap. Thieving drop. Read sand-script after Hyena Market Apprentice.', obscure: true });
rel.registerItemSource(96041, { type: 'drop', sourceId: 'boneyard_sand_stash', sourceName: 'Sand-Hidden Cache', region: 'boneyard_wastes', details: 'Disappeared-goods bundle. Thieving — gold, gems, or rarely a caravan ledger.', obscure: false });

// Burnt Library — scrolls and magic
rel.registerItemSource(96050, { type: 'gathering', sourceId: 'boneyard_burnt_library_stacks', sourceName: 'Burnt Library Stacks', region: 'boneyard_wastes', details: 'Sun-burned scroll fragment. The Burnt Library\'s tokens. Read as random spell draw.', obscure: true });
rel.registerItemSource(96051, { type: 'gathering', sourceId: 'boneyard_prayer_binding_ink', sourceName: 'Prayer-Binding Inkpot', region: 'boneyard_wastes', details: 'Prayer-binding ink. Magic secondary. Binds anti-undead chants to scroll paper.', obscure: true });

// Salt Sea Range & Splinter — ranged/fletching inputs and outputs
rel.registerItemSource(96060, { type: 'gathering', sourceId: 'boneyard_bone_shaft_heap', sourceName: 'Bone-Shaft Heap', region: 'boneyard_wastes', details: 'Bone arrow-shafts. Fletching base. Splintered from the Kings\' pile at the Splinter.', obscure: false });
rel.registerItemSource(96061, { type: 'gathering', sourceId: 'boneyard_scorpion_fletching_pile', sourceName: 'Scorpion-Fletching Pile', region: 'boneyard_wastes', details: 'Scorpion-fletching. Lighter than feather — +2 range, ignores desert crosswind.', obscure: false });
rel.registerItemSource(96062, { type: 'processing', sourceId: 'boneyard_splinter_fletchbench', sourceName: 'The Splinter Fletch-Bench', region: 'boneyard_wastes', details: 'Bone-shaft arrows. Fletched at the Splinter from bone-shafts + scorpion-fletching.', obscure: false });
rel.registerItemSource(96063, { type: 'processing', sourceId: 'boneyard_salt_sea_throw', sourceName: 'Salt Sea Throwing Range', region: 'boneyard_wastes', details: 'Bone-boomerang. Ranged ammo — returns 80% of the time. Chains between dune targets.', obscure: true });

// Sun-Bleach Pits & fire
rel.registerItemSource(96070, { type: 'gathering', sourceId: 'boneyard_driftwood_wash', sourceName: 'Salt-Driftwood Wash', region: 'boneyard_wastes', details: 'Salt-driftwood logs. Only wood the desert grants. Burns with blue flame.', obscure: false });
rel.registerItemSource(96071, { type: 'gathering', sourceId: 'boneyard_magnifier_shard_bed', sourceName: 'Magnifier-Shard Bed', region: 'boneyard_wastes', details: 'Magnifier-shard. Focuses sun into fire. Sun-fire firemaking + sand-glass crafting.', obscure: false });

// Boil Pits — herblore
rel.registerItemSource(96080, { type: 'processing', sourceId: 'boneyard_boil_pit', sourceName: 'Boil Pit Still', region: 'boneyard_wastes', details: 'Heat-distilled tincture. Herblore output. Heals + one minute of heat-stroke immunity.', obscure: false });
rel.registerItemSource(96081, { type: 'processing', sourceId: 'boneyard_salt_cure_trough', sourceName: 'Salt-Cure Trough', region: 'boneyard_wastes', details: 'Salt-cured tincture. Herblore. Three-day stable in inventory; stacks of 10.', obscure: true });

// Bone Pyramid boss uniques
rel.registerItemSource(96090, { type: 'drop', sourceId: 'salted_king', sourceName: 'The Salted King', region: 'boneyard_wastes', details: 'Sun-king cape. Prayer cape with +12% damage vs undead. The Pyramid\'s reward.', obscure: false });
rel.registerItemSource(96091, { type: 'drop', sourceId: 'salted_king', sourceName: 'The Salted King', region: 'boneyard_wastes', details: 'Bone-bound iron lump. Smithing reagent. Combine with old iron weapons at the Smelter.', obscure: false });

// ══════════════════════════════════════════════════════════════════════════════
// TRAINING METHODS — all 12 blocked skills covered + depth across 20+ more
// ══════════════════════════════════════════════════════════════════════════════

// ── DEFENCE ────────────────────────────────────────────────────────────────
rel.defineTrainingMethod('boneyard_sand_warden_drill', {
  skill: 'defence', name: 'Sand-Warden Drill',
  levelRange: [1, 45],
  xpPerHour: 22000,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['boneyard_wastes'] },
  resourceOutput: { produces: [{ name: 'Warden stipend', perHour: 1500 }], net: 'profit' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'low', complexity: 'trivial', attention: 'afk',
  inputs: [{ name: 'Basic food', perHour: 6, source: 'cooking' }],
  description: 'Stand the watch at the sand-warden post where the wind has a number. Salt-chapped but steady. The drills that teach a body to hold its ground before the dunes.',
  location: 'Boneyard Wastes',
});

rel.defineTrainingMethod('boneyard_bones_of_fallen_kings_def', {
  skill: 'defence', name: 'Bones of Fallen Kings — Defensive Trial',
  levelRange: [40, 85],
  xpPerHour: 62000,
  prerequisites: { skills: { defence: 40 }, quests: ['pyramid_of_the_salted_king'], items: [], areas: ['boneyard_bone_pyramid'] },
  resourceOutput: { produces: [{ name: 'King-bone shard', perHour: 40 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'medium', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Mid-tier food', perHour: 20, source: 'cooking' }],
  description: 'Defensive trials among the bones of kings long-fallen, where every name is still spoken by the wind. Shards smith into bone-bound iron.',
  location: 'Boneyard Wastes',
});

// ── HITPOINTS ──────────────────────────────────────────────────────────────
rel.defineTrainingMethod('boneyard_veiled_grave_meditation', {
  skill: 'hitpoints', name: 'Veiled Grave Meditation Ward',
  levelRange: [1, 40],
  xpPerHour: 9000,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['boneyard_wastes'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 400,
  danger: 'low', complexity: 'trivial', attention: 'afk',
  inputs: [{ name: 'Cactus water', perHour: 12, source: 'boneyard_cactus_fruit_patch' }],
  description: 'Lie down inside the Veiled Grave and let the chapped lips of the desert teach the body to endure. Pure HP training. The keepers ask for one jar of water per hour.',
  location: 'Boneyard Wastes',
});

rel.defineTrainingMethod('boneyard_bones_of_fallen_kings_hp', {
  skill: 'hitpoints', name: 'Bones of Fallen Kings — Hitpoints Trial',
  levelRange: [30, 90],
  xpPerHour: 18000,
  prerequisites: { skills: { hitpoints: 30 }, quests: ['pyramid_of_the_salted_king'], items: [], areas: ['boneyard_bone_pyramid'] },
  resourceOutput: { produces: [{ name: 'King-bone shard', perHour: 20 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 0,
  danger: 'medium', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Mid-tier food', perHour: 24, source: 'cooking' }],
  description: 'Endure the king-ghosts\' measured blows among the prayer-stones. Each strike is a lesson the body does not forget.',
  location: 'Boneyard Wastes',
});

// ── MAGIC ──────────────────────────────────────────────────────────────────
rel.defineTrainingMethod('boneyard_burnt_library_reading', {
  skill: 'magic', name: 'Burnt Library Scroll-Reading',
  levelRange: [15, 70],
  xpPerHour: 58000,
  prerequisites: { skills: { magic: 15 }, quests: ['the_burnt_library_index'], items: [], areas: ['boneyard_burnt_library'] },
  resourceOutput: { produces: [{ name: 'Read-fragments', perHour: 120 }], net: 'neutral' },
  bankingFrequency: 'rare', costPerHour: 6000,
  danger: 'none', complexity: 'moderate', attention: 'low',
  inputs: [{ name: 'Sun-burned scroll fragment', perHour: 240, source: 'boneyard_burnt_library_stacks' }, { name: 'Prayer-binding ink', perHour: 60, source: 'boneyard_prayer_binding_ink' }],
  description: 'Decipher sun-burned scroll fragments. The ink binds the chant to the paper before the wind takes it. Three spell-scrolls per character — which three, the library chooses.',
  location: 'Boneyard Wastes',
});

rel.defineTrainingMethod('boneyard_prayer_binding_spellcasting', {
  skill: 'magic', name: 'Prayer-Binding Spellcasting',
  levelRange: [50, 99],
  xpPerHour: 92000,
  prerequisites: { skills: { magic: 50, prayer: 40 }, quests: ['the_burnt_library_index'], items: [], areas: ['boneyard_burnt_library'] },
  resourceOutput: { produces: [{ name: 'Prayer-bound sigil', perHour: 60 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 28000,
  danger: 'none', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Air rune', perHour: 6000, source: 'runecrafting' }, { name: 'Rune-salt', perHour: 600, source: 'boneyard_salt_cistern' }, { name: 'Prayer-binding ink', perHour: 200, source: 'boneyard_prayer_binding_ink' }],
  description: 'Weave prayer and flame together until the two cannot be separated again. Prayer-bound sigils unlock the anti-undead chant at the Veiled Grave.',
  location: 'Boneyard Wastes',
  breakpointAt: 50,
});

// ── RUNECRAFTING ───────────────────────────────────────────────────────────
rel.defineTrainingMethod('boneyard_salt_cistern_runecrafting', {
  skill: 'runecrafting', name: 'Salt-Cistern Runecrafting',
  levelRange: [1, 85],
  xpPerHour: 42000,
  prerequisites: { skills: { runecrafting: 1 }, quests: [], items: [], areas: ['boneyard_salt_cisterns'] },
  resourceOutput: { produces: [{ name: 'Salt rune (desiccated)', perHour: 1800 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'low',
  inputs: [{ name: 'Rune-salt', perHour: 1800, source: 'boneyard_salt_cistern' }],
  description: 'Cut rune-salt from the cistern wall and press it into the desiccated rune. No running, no chipping. The desert does the work and the wind signs it.',
  location: 'Boneyard Wastes',
});

rel.defineTrainingMethod('boneyard_rune_salt_binding', {
  skill: 'runecrafting', name: 'Rune-Salt Double-Binding',
  levelRange: [77, 99],
  xpPerHour: 54000,
  prerequisites: { skills: { runecrafting: 77 }, quests: ['the_water_numbered_wind'], items: [], areas: ['boneyard_salt_cisterns'] },
  resourceOutput: { produces: [{ name: 'Salt rune', perHour: 1200 }, { name: 'Water rune', perHour: 1200 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'complex', attention: 'medium',
  inputs: [{ name: 'Rune-salt', perHour: 1200, source: 'boneyard_salt_cistern' }, { name: 'Cactus water', perHour: 1200, source: 'boneyard_cactus_fruit_patch' }],
  description: 'Bind salt and water together on the same stone. The prophet calls it the only honest rune. The only one the desert will accept as its own.',
  location: 'Boneyard Wastes',
  breakpointAt: 77,
});

// ── CONSTRUCTION ───────────────────────────────────────────────────────────
rel.defineTrainingMethod('boneyard_desert_temple_framing', {
  skill: 'construction', name: 'Desert-Temple Framing',
  levelRange: [30, 99],
  xpPerHour: 285000,
  prerequisites: { skills: { construction: 30 }, quests: ['bones_in_the_bone_pile'], items: [], areas: ['boneyard_wastes'] },
  resourceOutput: { produces: [], net: 'loss' },
  bankingFrequency: 'frequent', costPerHour: 320000,
  danger: 'none', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Sandstone slab', perHour: 900, source: 'boneyard_sandstone_slab' }, { name: 'Construction mortar', perHour: 600, source: 'crafting' }],
  description: 'Raise a desert-temple frame the old way, with sandstone laid so the shadows cross at noon. The framing is the first thing the sun-warden will see when he dreams of home.',
  location: 'Boneyard Wastes',
});

rel.defineTrainingMethod('boneyard_sand_glass_wall_craft', {
  skill: 'construction', name: 'Sand-Glass Wall-Craft',
  levelRange: [50, 99],
  xpPerHour: 340000,
  prerequisites: { skills: { construction: 50 }, quests: [], items: [], areas: ['boneyard_wastes'] },
  resourceOutput: { produces: [], net: 'loss' },
  bankingFrequency: 'frequent', costPerHour: 410000,
  danger: 'none', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Sand-glass pane', perHour: 700, source: 'crafting' }, { name: 'Granite', perHour: 400, source: 'boneyard_granite_face' }],
  description: 'Mount sand-glass panes into granite. The light that enters at sunset casts every wall of the house in the color of dry blood — and yet the dwelling is cool inside.',
  location: 'Boneyard Wastes',
});

// ── HERBLORE ───────────────────────────────────────────────────────────────
rel.defineTrainingMethod('boneyard_boil_pit_distillation', {
  skill: 'herblore', name: 'Boil Pit Heat-Distillation',
  levelRange: [10, 70],
  xpPerHour: 68000,
  prerequisites: { skills: { herblore: 10 }, quests: [], items: [], areas: ['boneyard_boil_pits'] },
  resourceOutput: { produces: [{ name: 'Heat-distilled tincture', perHour: 280 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'low', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Sun-dried herbs', perHour: 280, source: 'boneyard_desert_herb_dryrack' }, { name: 'Cactus water', perHour: 280, source: 'boneyard_cactus_fruit_patch' }],
  description: 'The boil pits work the potion by heat alone — no fire needed, the sun is enough. The tinctures they produce are also a one-minute heat-stroke immunity.',
  location: 'Boneyard Wastes',
});

rel.defineTrainingMethod('boneyard_salt_cured_tincture', {
  skill: 'herblore', name: 'Salt-Cured Tincture Brewing',
  levelRange: [45, 99],
  xpPerHour: 88000,
  prerequisites: { skills: { herblore: 45 }, quests: [], items: [], areas: ['boneyard_boil_pits'] },
  resourceOutput: { produces: [{ name: 'Salt-cured tincture', perHour: 220 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 0,
  danger: 'none', complexity: 'complex', attention: 'medium',
  inputs: [{ name: 'Sun-dried herbs', perHour: 220, source: 'boneyard_desert_herb_dryrack' }, { name: 'Salt-crystal', perHour: 440, source: 'boneyard_salt_crystal_bed' }, { name: 'Deathstalker venom-gland', perHour: 60, source: 'boneyard_deathstalker' }],
  description: 'Cure the tincture with salt so it keeps. The sand-warden carries stacks of ten into the deep dunes and does not fear the spoil of the wineskin.',
  location: 'Boneyard Wastes',
});

// ── FLETCHING ──────────────────────────────────────────────────────────────
rel.defineTrainingMethod('boneyard_splinter_bone_shaft', {
  skill: 'fletching', name: 'The Splinter — Bone-Shaft Arrows',
  levelRange: [1, 60],
  xpPerHour: 48000,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['boneyard_the_splinter'] },
  resourceOutput: { produces: [{ name: 'Bone-shaft arrow', perHour: 2400 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'afk',
  inputs: [{ name: 'Bone arrow-shafts', perHour: 2400, source: 'boneyard_bone_shaft_heap' }, { name: 'Jackal-tooth tip', perHour: 2400, source: 'boneyard_salt_jackal' }],
  description: 'Splinter the shaft from the heap, seat the jackal-tooth tip, whisper the old words. The arrow knows who it was meant for before the fletcher does.',
  location: 'Boneyard Wastes',
});

rel.defineTrainingMethod('boneyard_scorpion_fletching', {
  skill: 'fletching', name: 'Scorpion-Fletching Binding',
  levelRange: [40, 99],
  xpPerHour: 92000,
  prerequisites: { skills: { fletching: 40 }, quests: [], items: [], areas: ['boneyard_the_splinter'] },
  resourceOutput: { produces: [{ name: 'Scorpion-fletched arrow', perHour: 1500 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'low', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Bone arrow-shafts', perHour: 1500, source: 'boneyard_bone_shaft_heap' }, { name: 'Scorpion-fletching', perHour: 1500, source: 'boneyard_scorpion_fletching_pile' }],
  description: 'Bind the scorpion-fletching at the quill. Lighter than feather, heavier in intent. Ignores the desert crosswind, which is more than most men can say.',
  location: 'Boneyard Wastes',
});

rel.defineTrainingMethod('boneyard_bone_boomerang_carving', {
  skill: 'fletching', name: 'Bone-Boomerang Carving',
  levelRange: [55, 99],
  xpPerHour: 62000,
  prerequisites: { skills: { fletching: 55 }, quests: [], items: [], areas: ['boneyard_the_splinter'] },
  resourceOutput: { produces: [{ name: 'Bone-boomerang', perHour: 180 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'King-bone shard', perHour: 360, source: 'boneyard_bones_of_fallen_kings_def' }, { name: 'Salt-driftwood logs', perHour: 180, source: 'boneyard_driftwood_wash' }],
  description: 'Carve the boomerang from king-bone so it returns to the hand that threw it. Chains between dune targets in the Salt Sea Range.',
  location: 'Boneyard Wastes',
});

// ── HUNTER ─────────────────────────────────────────────────────────────────
rel.defineTrainingMethod('boneyard_sand_hawk_falconry', {
  skill: 'hunter', name: 'Sand-Hawk Falconry',
  levelRange: [25, 75],
  xpPerHour: 72000,
  prerequisites: { skills: { hunter: 25 }, quests: ['where_the_caravans_dont_come_back'], items: [{ name: 'Falconry glove' }], areas: ['boneyard_wastes'] },
  resourceOutput: { produces: [{ name: 'Sand-hawk catch', perHour: 140 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'low', complexity: 'moderate', attention: 'medium',
  inputs: [],
  description: 'The sand-hawk knows the name of its quarry before the falconer does. Release, wait, receive. The bird is older than the hand that flies it.',
  location: 'Boneyard Wastes',
});

rel.defineTrainingMethod('boneyard_deathstalker_traps', {
  skill: 'hunter', name: 'Deathstalker Trap-Line',
  levelRange: [40, 99],
  xpPerHour: 85000,
  prerequisites: { skills: { hunter: 40 }, quests: ['where_the_caravans_dont_come_back'], items: [{ name: 'Box trap' }], areas: ['boneyard_wastes'] },
  resourceOutput: { produces: [{ name: 'Deathstalker venom-gland', perHour: 200 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'medium', complexity: 'moderate', attention: 'medium',
  inputs: [],
  description: 'Lay traps along the dry-arroyo where the deathstalker walks at dawn. Venom-glands feed the herblore tinctures and the fletcher\'s tip-venom.',
  location: 'Boneyard Wastes',
});

rel.defineTrainingMethod('boneyard_ghost_camel_chase', {
  skill: 'hunter', name: 'Ghost-Camel Chase',
  levelRange: [65, 99],
  xpPerHour: 105000,
  prerequisites: { skills: { hunter: 65 }, quests: ['where_the_caravans_dont_come_back'], items: [], areas: ['boneyard_wastes'] },
  resourceOutput: { produces: [{ name: 'Ghost-camel bone', perHour: 30 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 0,
  danger: 'low', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Cactus water', perHour: 60, source: 'boneyard_cactus_fruit_patch' }],
  description: 'The ghost-camels run the dune chain at the hour the wind has a number but no name. Chase them only with water; the dry chase will take you, not the other way.',
  location: 'Boneyard Wastes',
});

// ── SMITHING ───────────────────────────────────────────────────────────────
rel.defineTrainingMethod('boneyard_smelter_bones_forge', {
  skill: 'smithing', name: 'Smelter\'s Bones Forge',
  levelRange: [1, 70],
  xpPerHour: 78000,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['boneyard_smelters_bones'] },
  resourceOutput: { produces: [{ name: 'Sun-tempered alloy bar', perHour: 300 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'simple', attention: 'low',
  inputs: [{ name: 'Bone-iron ore', perHour: 300, source: 'boneyard_bone_iron_vein' }, { name: 'Salt-crystal', perHour: 600, source: 'boneyard_salt_crystal_bed' }],
  description: 'Temper the bar in the sun the way the old kings did. No flame needed above the bones — the light that killed them still lives in the stones.',
  location: 'Boneyard Wastes',
});

rel.defineTrainingMethod('boneyard_bone_bound_iron_smithing', {
  skill: 'smithing', name: 'Bone-Bound Iron Smithing',
  levelRange: [55, 99],
  xpPerHour: 112000,
  prerequisites: { skills: { smithing: 55 }, quests: ['smelter_without_bones'], items: [], areas: ['boneyard_smelters_bones'] },
  resourceOutput: { produces: [{ name: 'Bone-bound iron weapon', perHour: 50 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Sun-tempered alloy bar', perHour: 200, source: 'boneyard_smelter_bones_forge' }, { name: 'Bone-bound iron lump', perHour: 50, source: 'salted_king' }, { name: 'King-bone shard', perHour: 100, source: 'boneyard_bones_of_fallen_kings_def' }],
  description: 'Bind the bone into the iron, not upon it. The old kings come back into the weapon and walk again, briefly, each time it is swung.',
  location: 'Boneyard Wastes',
});

// ── COOKING ────────────────────────────────────────────────────────────────
rel.defineTrainingMethod('boneyard_salted_cookery_dry_cure', {
  skill: 'cooking', name: 'Salted Cookery — Dry-Cure',
  levelRange: [1, 65],
  xpPerHour: 130000,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['boneyard_salted_cookery'] },
  resourceOutput: { produces: [{ name: 'Sand-jerky', perHour: 1400 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'simple', attention: 'low',
  inputs: [{ name: 'Raw beef', perHour: 1400, source: 'heartlands_cow' }, { name: 'Salt-crystal', perHour: 1400, source: 'boneyard_salt_crystal_bed' }],
  description: 'Dry-cure the strip of meat until it keeps. Sand-jerky heals six and does not spoil — the caravan food. The cure is simple; the waiting is the craft.',
  location: 'Boneyard Wastes',
});

rel.defineTrainingMethod('boneyard_bone_broth_kitchen', {
  skill: 'cooking', name: 'Bone-Broth Kitchen',
  levelRange: [30, 99],
  xpPerHour: 145000,
  prerequisites: { skills: { cooking: 30 }, quests: [], items: [], areas: ['boneyard_salted_cookery'] },
  resourceOutput: { produces: [{ name: 'Bone-broth bowl', perHour: 900 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Ghost-camel bone', perHour: 30, source: 'boneyard_ghost_camel' }, { name: 'Dry-corn', perHour: 1800, source: 'boneyard_dry_corn_row' }, { name: 'Cactus water', perHour: 900, source: 'boneyard_cactus_fruit_patch' }],
  description: 'Boil the bones all night, add the dry-corn at dawn, let the sun finish the stock. Bone-broth heals twelve and grants one prayer point back per bowl.',
  location: 'Boneyard Wastes',
});

// ── FIREMAKING ─────────────────────────────────────────────────────────────
rel.defineTrainingMethod('boneyard_sun_fire_burning', {
  skill: 'firemaking', name: 'Sun-Fire — Magnifier Bow Ignition',
  levelRange: [1, 80],
  xpPerHour: 165000,
  prerequisites: { skills: {}, quests: [], items: [{ name: 'Magnifier bow' }], areas: ['boneyard_sun_bleach_pits'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'simple', attention: 'medium',
  inputs: [{ name: 'Salt-driftwood logs', perHour: 1200, source: 'boneyard_driftwood_wash' }, { name: 'Magnifier-shard', perHour: 60, source: 'boneyard_magnifier_shard_bed' }],
  description: 'Focus the sun through the shard until the driftwood takes. The fire that the wind knows the name of. No tinderbox in the waste — the sun is your tinderbox.',
  location: 'Boneyard Wastes',
});

rel.defineTrainingMethod('boneyard_pyre_bone_burning', {
  skill: 'firemaking', name: 'Pyre-Bone Burning',
  levelRange: [55, 99],
  xpPerHour: 210000,
  prerequisites: { skills: { firemaking: 55, prayer: 50 }, quests: ['the_water_numbered_wind'], items: [], areas: ['boneyard_veiled_grave'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Ghost-camel bone', perHour: 200, source: 'boneyard_ghost_camel' }, { name: 'Salt-driftwood logs', perHour: 800, source: 'boneyard_driftwood_wash' }],
  description: 'Burn the camel-bone on the driftwood pyre. The smoke goes up in the direction the wind remembers. Double-skill — firemaking and prayer at once.',
  location: 'Boneyard Wastes',
});

// ── WOODCUTTING ────────────────────────────────────────────────────────────
rel.defineTrainingMethod('boneyard_driftwood_wash_cutting', {
  skill: 'woodcutting', name: 'Salt-Driftwood Wash — Cutting',
  levelRange: [1, 70],
  xpPerHour: 44000,
  prerequisites: { skills: {}, quests: [], items: [{ name: 'Axe' }], areas: ['boneyard_wastes'] },
  resourceOutput: { produces: [{ name: 'Salt-driftwood logs', perHour: 320 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'afk',
  inputs: [],
  description: 'There are no trees in the waste, but the old sea left its bones on the long dry shore. Cut the salt-driftwood from the wash. The only wood the desert allows.',
  location: 'Boneyard Wastes',
});

rel.defineTrainingMethod('boneyard_petrified_palm_felling', {
  skill: 'woodcutting', name: 'Petrified-Palm Felling',
  levelRange: [60, 99],
  xpPerHour: 68000,
  prerequisites: { skills: { woodcutting: 60 }, quests: [], items: [{ name: 'Adamant axe' }], areas: ['boneyard_wastes'] },
  resourceOutput: { produces: [{ name: 'Petrified-palm log', perHour: 150 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'low', complexity: 'moderate', attention: 'medium',
  inputs: [],
  description: 'The oasis-palms that did not make it are mostly stone now. Felling is slow and the chips taste of ash. But the logs burn longer than anything else in Aelgard.',
  location: 'Boneyard Wastes',
});

// ── HIGHER-TIER ATTACK ─────────────────────────────────────────────────────
rel.defineTrainingMethod('boneyard_salted_king_combat', {
  skill: 'attack', name: 'Salted King — Trial Combat',
  levelRange: [70, 99],
  xpPerHour: 92000,
  prerequisites: { skills: { attack: 70, prayer: 43 }, quests: ['pyramid_of_the_salted_king'], items: [], areas: ['boneyard_bone_pyramid'] },
  resourceOutput: { produces: [{ name: 'King-bone shard', perHour: 60 }, { name: 'Gold coins', perHour: 350000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 30000,
  danger: 'high', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Sand-jerky', perHour: 30, source: 'boneyard_salted_cookery_dry_cure' }, { name: 'Salt-cured tincture', perHour: 8, source: 'boneyard_salt_cured_tincture' }],
  description: 'The Salted King comes back every hour at the prayer-stone. He does not fight like a man. He fights like the memory of one. The bone-bound iron is what he fears.',
  location: 'Boneyard Wastes',
  breakpointAt: 70,
});

// ── PRAYER (deepen existing coverage — Veiled Grave) ──────────────────────
rel.defineTrainingMethod('boneyard_veiled_grave_chants', {
  skill: 'prayer', name: 'Veiled Grave — Anti-Undead Chants',
  levelRange: [30, 99],
  xpPerHour: 135000,
  prerequisites: { skills: { prayer: 30 }, quests: ['the_water_numbered_wind'], items: [], areas: ['boneyard_veiled_grave'] },
  resourceOutput: { produces: [{ name: 'Anti-undead charge', perHour: 120 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Sand-mummy linen', perHour: 240, source: 'boneyard_sand_mummy' }, { name: 'Prayer-stone', perHour: 120, source: 'boneyard_prayer_stone_quarry' }],
  description: 'Chant the anti-undead rites over the sand-mummy linen. Each chant binds one prayer-stone. The keepers grant water-blessing at the end.',
  location: 'Boneyard Wastes',
});

rel.defineTrainingMethod('boneyard_water_blessing_rites', {
  skill: 'prayer', name: 'Water-Blessing Rites',
  levelRange: [45, 99],
  xpPerHour: 90000,
  prerequisites: { skills: { prayer: 45 }, quests: ['the_water_numbered_wind'], items: [], areas: ['boneyard_veiled_grave'] },
  resourceOutput: { produces: [{ name: 'Water-blessed vial', perHour: 240 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'low',
  inputs: [{ name: 'Cactus water', perHour: 240, source: 'boneyard_cactus_fruit_patch' }, { name: 'Prayer-stone', perHour: 60, source: 'boneyard_prayer_stone_quarry' }],
  description: 'Bless the cactus-water at the grave with a prayer-stone held over the mouth. One vial cures any poison and halts sand-mummy attacks for fifteen ticks.',
  location: 'Boneyard Wastes',
});

// ── SLAYER (Bone Pyramid) ─────────────────────────────────────────────────
rel.defineTrainingMethod('boneyard_bone_pyramid_slayer', {
  skill: 'slayer', name: 'Bone Pyramid Slayer Lodge',
  levelRange: [30, 99],
  xpPerHour: 62000,
  prerequisites: { skills: { slayer: 30 }, quests: ['pyramid_of_the_salted_king'], items: [], areas: ['boneyard_bone_pyramid'] },
  resourceOutput: { produces: [{ name: 'Slayer points', perHour: 28 }, { name: 'Gold coins', perHour: 82000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 8000,
  danger: 'high', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Sand-jerky', perHour: 28, source: 'boneyard_salted_cookery_dry_cure' }],
  description: 'The Pyramid master gives four tasks: sand-mummy, glass-scarab, salt-jackal, dust-hound. Each demands a different weapon. Each leaves a different bone.',
  location: 'Boneyard Wastes',
  breakpointAt: 30,
});

// ── THIEVING (Hyena Markets) ─────────────────────────────────────────────
rel.defineTrainingMethod('boneyard_hyena_market_gauntlet', {
  skill: 'thieving', name: 'Hyena Market Gauntlet',
  levelRange: [20, 80],
  xpPerHour: 68000,
  prerequisites: { skills: { thieving: 20 }, quests: ['hyena_market_apprentice'], items: [], areas: ['boneyard_hyena_markets'] },
  resourceOutput: { produces: [{ name: 'Gold coins', perHour: 55000 }, { name: 'Cipher-script scrap', perHour: 20 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'low', complexity: 'moderate', attention: 'medium',
  inputs: [],
  description: 'Work the Hyena Markets where the traders deal in the disappeared. Pickpocket the fencemasters. Read the script only if the cipher-tongue is yours. The wind will know if you steal.',
  location: 'Boneyard Wastes',
});

rel.defineTrainingMethod('boneyard_sand_cache_theft', {
  skill: 'thieving', name: 'Sand-Hidden Cache Theft',
  levelRange: [50, 99],
  xpPerHour: 96000,
  prerequisites: { skills: { thieving: 50 }, quests: ['hyena_market_apprentice'], items: [], areas: ['boneyard_hyena_markets'] },
  resourceOutput: { produces: [{ name: 'Gold coins', perHour: 120000 }, { name: 'Caravan ledger', perHour: 2 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'medium', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Cipher-script scrap', perHour: 30, source: 'boneyard_hyena_fence' }],
  description: 'Read the sand-script on the dune, dig where it tells you. The caches the fence-kings forgot. The caravan ledgers unlock the sand-warden\'s lost supply routes.',
  location: 'Boneyard Wastes',
});

// ── AGILITY (Singing Dunes) ───────────────────────────────────────────────
rel.defineTrainingMethod('boneyard_singing_dunes_course', {
  skill: 'agility', name: 'Singing Dunes — Full Course',
  levelRange: [25, 99],
  xpPerHour: 78000,
  prerequisites: { skills: { agility: 25 }, quests: ['singing_dunes_walked'], items: [], areas: ['boneyard_singing_dunes'] },
  resourceOutput: { produces: [{ name: 'Marks of grace', perHour: 28 }], net: 'profit' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'low', complexity: 'moderate', attention: 'medium',
  inputs: [],
  description: 'The dunes sing when the wind crosses them at the right angle. Run the course between the songs — vault, crest, slide, vault. Miss the tempo and the sand takes you one ankle at a time.',
  location: 'Boneyard Wastes',
  breakpointAt: 25,
});

rel.defineTrainingMethod('boneyard_dune_vault_run', {
  skill: 'agility', name: 'Dune-Vault Speed Run',
  levelRange: [60, 99],
  xpPerHour: 98000,
  prerequisites: { skills: { agility: 60 }, quests: ['singing_dunes_walked'], items: [], areas: ['boneyard_singing_dunes'] },
  resourceOutput: { produces: [{ name: 'Marks of grace', perHour: 45 }], net: 'profit' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'medium', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Cactus water', perHour: 30, source: 'boneyard_cactus_fruit_patch' }],
  description: 'The dune-vault against the clock. Wind-shift every twelve ticks. No hand-holds. The sand does not forgive a missed beat.',
  location: 'Boneyard Wastes',
});

// ── MINING (Quarrymaster's Camp) ─────────────────────────────────────────
rel.defineTrainingMethod('boneyard_quarrymaster_sandstone', {
  skill: 'mining', name: 'Quarrymaster Sandstone',
  levelRange: [30, 70],
  xpPerHour: 52000,
  prerequisites: { skills: { mining: 30 }, quests: [], items: [{ name: 'Pickaxe' }], areas: ['boneyard_quarrymaster_camp'] },
  resourceOutput: { produces: [{ name: 'Sandstone slab', perHour: 260 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'simple', attention: 'low',
  inputs: [],
  description: 'Quarry sandstone slabs from the old face. Each slab weighs a man down; the camp offers a lift-cart at a per-hour fee. The mortar at the Desert-Temple Yard wants this.',
  location: 'Boneyard Wastes',
});

rel.defineTrainingMethod('boneyard_quarrymaster_granite', {
  skill: 'mining', name: 'Quarrymaster Granite',
  levelRange: [60, 99],
  xpPerHour: 72000,
  prerequisites: { skills: { mining: 60 }, quests: [], items: [{ name: 'Rune pickaxe' }], areas: ['boneyard_quarrymaster_camp'] },
  resourceOutput: { produces: [{ name: 'Granite', perHour: 140 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 0,
  danger: 'none', complexity: 'simple', attention: 'low',
  inputs: [],
  description: 'Granite pays the wall-craft. The slab is heavy and the bank is far. The Quarrymaster pays in the sense that you can eat what you carry out.',
  location: 'Boneyard Wastes',
});

rel.defineTrainingMethod('boneyard_salt_crystal_mining', {
  skill: 'mining', name: 'Salt-Crystal Bed Mining',
  levelRange: [15, 85],
  xpPerHour: 48000,
  prerequisites: { skills: { mining: 15 }, quests: [], items: [{ name: 'Pickaxe' }], areas: ['boneyard_salt_cisterns'] },
  resourceOutput: { produces: [{ name: 'Salt-crystal', perHour: 700 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'afk',
  inputs: [],
  description: 'Pick salt-crystal from the bed below the cistern. The cook wants it, the herbalist wants it, the smelter wants it. The sand-warden wants it last.',
  location: 'Boneyard Wastes',
});

// ── RANGED (Salt Sea Range) ───────────────────────────────────────────────
rel.defineTrainingMethod('boneyard_salt_sea_boomerang_range', {
  skill: 'ranged', name: 'Salt Sea Boomerang Range',
  levelRange: [50, 99],
  xpPerHour: 88000,
  prerequisites: { skills: { ranged: 50 }, quests: [], items: [{ name: 'Bone-boomerang' }], areas: ['boneyard_wastes'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'moderate', costPerHour: 12000,
  danger: 'low', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Bone-boomerang', perHour: 60, source: 'boneyard_splinter_fletchbench' }],
  description: 'Throwing at the Salt Sea Range, where the targets walk the dune chain and the boomerang chains between them. Returns eighty of a hundred. The other twenty the sand keeps.',
  location: 'Boneyard Wastes',
});

// ── FARMING (Dry-Cure Field) ──────────────────────────────────────────────
rel.defineTrainingMethod('boneyard_dry_cure_field_rotation', {
  skill: 'farming', name: 'Dry-Cure Field — Three-Row Rotation',
  levelRange: [30, 99],
  xpPerHour: 62000,
  prerequisites: { skills: { farming: 30 }, quests: [], items: [], areas: ['boneyard_wastes'] },
  resourceOutput: { produces: [{ name: 'Cactus-fruit', perHour: 220 }, { name: 'Dry-corn', perHour: 160 }, { name: 'Salt-barley', perHour: 120 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 2400,
  danger: 'none', complexity: 'moderate', attention: 'low',
  inputs: [{ name: 'Desert seeds', perHour: 40, source: 'shop_or_drops' }, { name: 'Salt-crystal', perHour: 200, source: 'boneyard_salt_crystal_bed' }],
  description: 'Rotate cactus-fruit, dry-corn, salt-barley. Each returns water to the next row. Fifteen percent more yield than wet-grown. The sand pays its debts.',
  location: 'Boneyard Wastes',
  breakpointAt: 30,
});

// ── CRAFTING (Bone Jewelry Room) ──────────────────────────────────────────
rel.defineTrainingMethod('boneyard_bone_jewelry_work', {
  skill: 'crafting', name: 'Bone Jewelry Room',
  levelRange: [20, 99],
  xpPerHour: 82000,
  prerequisites: { skills: { crafting: 20 }, quests: [], items: [], areas: ['boneyard_wastes'] },
  resourceOutput: { produces: [{ name: 'Bone-jewelry piece', perHour: 200 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'King-bone shard', perHour: 200, source: 'boneyard_bones_of_fallen_kings_def' }, { name: 'Sand-glass pane', perHour: 200, source: 'crafting' }],
  description: 'Work king-bone and sand-glass together at the jewelry bench. The rings the sand-warden marries in. The pendants the prophet buries when the wind forgets.',
  location: 'Boneyard Wastes',
});

rel.defineTrainingMethod('boneyard_chitin_armor_assembly', {
  skill: 'crafting', name: 'Chitin-Armor Assembly',
  levelRange: [45, 99],
  xpPerHour: 98000,
  prerequisites: { skills: { crafting: 45 }, quests: [], items: [], areas: ['boneyard_wastes'] },
  resourceOutput: { produces: [{ name: 'Chitin-plate armor', perHour: 32 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'complex', attention: 'medium',
  inputs: [{ name: 'Chitin-glass plate', perHour: 160, source: 'boneyard_glass_scarab' }, { name: 'Salt-cured pelt', perHour: 80, source: 'boneyard_salt_jackal' }],
  description: 'Rivet chitin-plate to the salt-cured pelt. Light as linen, hard as granite. Only the scarab-keeper knows how the plates marry — and he is old now.',
  location: 'Boneyard Wastes',
});

// ══════════════════════════════════════════════════════════════════════════════
// QUESTS — 10 new quests with unique unlocks
// ══════════════════════════════════════════════════════════════════════════════

rel.defineQuestUnlock('the_water_numbered_wind', {
  name: 'The Water-Numbered Wind',
  unlocks: [
    { type: 'training_method', id: 'boneyard_veiled_grave_chants', description: 'Veiled Grave anti-undead chants — the prayer path that the desert remembers' },
    { type: 'prayer', id: 'water_blessing', description: 'Water-Blessing — cures poison in one tick, halts sand-mummy attacks for fifteen' },
    { type: 'area', id: 'boneyard_veiled_grave', description: 'The Veiled Grave as a training altar + Moryskah-equivalent prayer hub' },
  ],
});

rel.defineQuestUnlock('pyramid_of_the_salted_king', {
  name: 'Pyramid of the Salted King',
  unlocks: [
    { type: 'area', id: 'boneyard_bone_pyramid', description: 'Bone Pyramid full slayer lodge access + four Pyramid tasks' },
    { type: 'item_equip', id: 'sun_king_cape', description: 'Sun-King Cape — prayer cape with +12% damage vs undead, worn over the shoulders of the Salted King\'s killer' },
    { type: 'boss', id: 'salted_king_repeat', description: 'The Salted King — repeatable hourly attack training boss' },
  ],
});

rel.defineQuestUnlock('hyena_market_apprentice', {
  name: 'Hyena Market Apprentice',
  unlocks: [
    { type: 'training_method', id: 'boneyard_hyena_market_gauntlet', description: 'Hyena Market thieving gauntlet — read sand-script, rob the fencemasters' },
    { type: 'prayer', id: 'cipher_tongue', description: 'Cipher-Tongue — passive: read sand-script on all walls and caches in the Boneyard' },
    { type: 'shop', id: 'boneyard_hyena_fence', description: 'Hyena Fence — buys stolen goods at markup, sells caravan ledgers' },
  ],
});

rel.defineQuestUnlock('the_burnt_library_index', {
  name: 'The Burnt Library Index',
  unlocks: [
    { type: 'training_method', id: 'boneyard_burnt_library_reading', description: 'Burnt Library scroll-reading + random three-spell draw per character (non-degenerate: your three spells are not your neighbor\'s)' },
    { type: 'spellbook', id: 'prayer_binding_spells', description: 'Prayer-Binding Spells — magic chants that consume prayer-points for damage' },
    { type: 'training_method', id: 'boneyard_prayer_binding_spellcasting', description: 'Advanced prayer-binding at 50 magic + 40 prayer' },
  ],
});

rel.defineQuestUnlock('bones_in_the_bone_pile', {
  name: 'Bones in the Bone-Pile',
  unlocks: [
    { type: 'training_method', id: 'boneyard_desert_temple_framing', description: 'Desert-temple framing construction technique' },
    { type: 'recipe', id: 'boneyard_sand_glass_pane', description: 'Sand-glass pane recipe — crafting input for walls, jewelry, and magnifier lenses' },
  ],
});

rel.defineQuestUnlock('where_the_caravans_dont_come_back', {
  name: "Where The Caravans Don't Come Back",
  unlocks: [
    { type: 'training_method', id: 'boneyard_sand_hawk_falconry', description: 'Sand-hawk falconry — hunter method unique to Boneyard, works anywhere after the training completes' },
    { type: 'training_method', id: 'boneyard_deathstalker_traps', description: 'Deathstalker trap-lines' },
    { type: 'training_method', id: 'boneyard_ghost_camel_chase', description: 'Ghost-camel chase — level 65+ hunter' },
    { type: 'item_equip', id: 'falconry_glove_boneyard', description: 'Sand-Hawk Falconry Glove — required for falconry method' },
  ],
});

rel.defineQuestUnlock('singing_dunes_walked', {
  name: 'Singing Dunes Walked',
  unlocks: [
    { type: 'training_method', id: 'boneyard_singing_dunes_course', description: 'Singing Dunes — full agility course' },
    { type: 'training_method', id: 'boneyard_dune_vault_run', description: 'Dune-vault speed run at 60+' },
    { type: 'item_equip', id: 'wind_numbered_anklet', description: 'Wind-Numbered Anklet — tells you the hour the wind has its number (reduces stamina drain in Boneyard by 50%)' },
  ],
});

rel.defineQuestUnlock('smelter_without_bones', {
  name: 'Smelter Without Bones',
  unlocks: [
    { type: 'training_method', id: 'boneyard_bone_bound_iron_smithing', description: 'Bone-bound iron smithing recipe — old iron weapons rebuilt with king-bone' },
    { type: 'recipe', id: 'boneyard_bone_bound_iron_weapon', description: 'Bone-bound iron weapon recipe — upgrade ANY iron weapon to bone-bound tier' },
  ],
});

rel.defineQuestUnlock('the_prophet_and_the_number', {
  name: 'The Prophet and the Number',
  unlocks: [
    { type: 'npc', id: 'parched_prophet', description: 'The Parched Prophet — dialogue hub, daily riddles that reward desert teleports' },
    { type: 'teleport', id: 'boneyard_prophet_circuit', description: 'Prophet Circuit — teleport between the seven named places the wind still knows' },
    { type: 'item_equip', id: 'prophet_waterskin', description: 'Prophet\'s Waterskin — holds 50 cactus waters, never loses a drop to the sun' },
  ],
});

rel.defineQuestUnlock('the_salted_kings_last_name', {
  name: "The Salted King's Last Name",
  unlocks: [
    { type: 'boss', id: 'salted_king_hard_mode', description: 'Salted King Hard Mode — extreme attention, drops the Sun-King Cape (i)' },
    { type: 'item_equip', id: 'sun_king_cape_i', description: 'Sun-King Cape (i) — imbued prestige cape, +18% vs undead, one prayer restore per minute' },
    { type: 'area', id: 'boneyard_kings_crypt', description: 'Crypt of Kings — advanced slayer + all 3 Bones of Fallen Kings trial rooms unlocked at once' },
  ],
});

// ══════════════════════════════════════════════════════════════════════════════
// BREAKPOINTS — transformative moments in the wastes
// ══════════════════════════════════════════════════════════════════════════════

rel.defineBreakpoint({
  type: 'quest_complete', trigger: { quest: 'the_water_numbered_wind' },
  description: 'The Veiled Grave opens. Prayer-points become something the desert understands. Water-blessing cures poison in one tick. The single most important Boneyard moment.',
  unlocks: [
    { type: 'prayer', id: 'water_blessing', description: 'Water-Blessing prayer' },
    { type: 'training_method', id: 'boneyard_veiled_grave_chants', description: 'Anti-undead chants prayer training' },
  ],
  importance: 'transformative',
});

rel.defineBreakpoint({
  type: 'quest_complete', trigger: { quest: 'pyramid_of_the_salted_king' },
  description: 'The Bone Pyramid opens. The Salted King can be called hour by hour. Sun-King Cape unlocks the region\'s slayer cap. The desert names you killer.',
  unlocks: [
    { type: 'boss', id: 'salted_king_repeat', description: 'Salted King as repeatable training boss' },
    { type: 'item_equip', id: 'sun_king_cape', description: 'Sun-King Cape' },
  ],
  importance: 'transformative',
});

rel.defineBreakpoint({
  type: 'quest_complete', trigger: { quest: 'the_burnt_library_index' },
  description: 'Three scroll-spells unique to your character. Your neighbor has three others. Non-degenerate: the Library chooses. Prayer-binding spellcasting becomes the Boneyard mage identity.',
  unlocks: [{ type: 'spellbook', id: 'prayer_binding_spells', description: 'Prayer-binding spellbook' }],
  importance: 'transformative',
});

rel.defineBreakpoint({
  type: 'skill_level', trigger: { skill: 'runecrafting', level: 77 },
  description: 'Rune-salt double-binding at the Salt Cistern. The only honest rune in the game, the prophet says. The Boneyard runecrafter\'s ascension.',
  unlocks: [{ type: 'training_method', id: 'boneyard_rune_salt_binding', description: 'Double-binding rune-salt + water rune' }],
  importance: 'major',
});

rel.defineBreakpoint({
  type: 'skill_level', trigger: { skill: 'hunter', level: 65 },
  description: 'Ghost-camel chase unlocks. The dune chain at the hour the wind has no name. The camels drop pyre-bones, which burn for prayer.',
  unlocks: [{ type: 'training_method', id: 'boneyard_ghost_camel_chase', description: 'Ghost-camel chase hunter method' }],
  importance: 'major',
});

rel.defineBreakpoint({
  type: 'quest_complete', trigger: { quest: 'hyena_market_apprentice' },
  description: 'Cipher-tongue acquired. Sand-script on every wall becomes readable. The disappeared-trade opens. Thieving XP rates double overnight in the Boneyard.',
  unlocks: [
    { type: 'prayer', id: 'cipher_tongue', description: 'Cipher-tongue passive' },
    { type: 'training_method', id: 'boneyard_hyena_market_gauntlet', description: 'Hyena Market gauntlet' },
  ],
  importance: 'transformative',
});

rel.defineBreakpoint({
  type: 'skill_level', trigger: { skill: 'agility', level: 60 },
  description: 'Dune-vault speed run opens. The sand becomes a musical instrument. The marks of grace rain down if the tempo holds.',
  unlocks: [{ type: 'training_method', id: 'boneyard_dune_vault_run', description: 'Dune-vault speed run' }],
  importance: 'major',
});

// ══════════════════════════════════════════════════════════════════════════════
// RECIPES / COMBINATIONS — chain the items so the web is dense
// ══════════════════════════════════════════════════════════════════════════════

rel.defineCombination(96301, {
  resultName: 'Sun-Tempered Alloy Bar',
  inputs: [
    { id: 96022, name: 'Bone-iron ore', consumed: true },
    { id: 96012, name: 'Salt-crystal', consumed: true },
    { id: 96012, name: 'Salt-crystal', consumed: true },
  ],
  skill: 'smithing', level: 20, xp: 18, station: 'boneyard_sun_forge',
  description: 'Temper bone-iron in sun + salt. Smelter\'s Bones forge exclusive.',
});

rel.defineCombination(96302, {
  resultName: 'Sand-Glass Pane',
  inputs: [
    { id: 96020, name: 'Sandstone slab', consumed: true },
    { id: 96071, name: 'Magnifier-shard', consumed: true },
  ],
  skill: 'crafting', level: 25, xp: 24, station: 'boneyard_sun_furnace',
  description: 'Melt sandstone through a magnifier-shard. The light does the melting. Pane cools into glass that holds the desert\'s color.',
});

rel.defineCombination(96303, {
  resultName: 'Heat-Distilled Tincture',
  inputs: [
    { id: 96033, name: 'Sun-dried herbs', consumed: true },
    { id: 96030, name: 'Cactus-fruit', consumed: true },
    { id: 96012, name: 'Salt-crystal', consumed: true },
  ],
  skill: 'herblore', level: 15, xp: 40,
  description: 'Distilled by heat alone. Heals six and grants sixty ticks of heat-stroke immunity.',
});

rel.defineCombination(96304, {
  resultName: 'Salt-Cured Tincture',
  inputs: [
    { id: 96303, name: 'Heat-distilled tincture', consumed: true },
    { id: 96006, name: 'Deathstalker venom-gland', consumed: true },
    { id: 96012, name: 'Salt-crystal', consumed: true },
  ],
  skill: 'herblore', level: 45, xp: 96,
  description: 'Cure for three-day stability. Stacks of ten. The sand-warden\'s pack staple.',
});

rel.defineCombination(96305, {
  resultName: 'Water-Blessed Vial',
  inputs: [
    { id: 96030, name: 'Cactus-fruit', consumed: true },
    { id: 96011, name: 'Prayer-stone', consumed: true },
  ],
  skill: 'prayer', level: 45, xp: 35, station: 'boneyard_veiled_grave_altar',
  description: 'Bless cactus-water at the grave with a prayer-stone over the mouth. One vial cures any poison, halts sand-mummy attacks fifteen ticks.',
});

rel.defineCombination(96306, {
  resultName: 'Bone-Shaft Arrow',
  inputs: [
    { id: 96060, name: 'Bone arrow-shaft', consumed: true },
    { id: 96003, name: 'Jackal-tooth tip', consumed: true },
  ],
  skill: 'fletching', level: 1, xp: 3,
  description: 'The Splinter\'s starter arrow. Shaft + tip, one whispered word. The arrow knows who it was meant for.',
});

rel.defineCombination(96307, {
  resultName: 'Scorpion-Fletched Arrow',
  inputs: [
    { id: 96060, name: 'Bone arrow-shaft', consumed: true },
    { id: 96061, name: 'Scorpion-fletching', consumed: true },
  ],
  skill: 'fletching', level: 40, xp: 9,
  description: 'Ignores desert crosswind. +2 effective range. The Splinter\'s mid-tier arrow.',
});

rel.defineCombination(96308, {
  resultName: 'Bone-Boomerang',
  inputs: [
    { id: 96070, name: 'Salt-driftwood log', consumed: true },
    { id: 96005, name: 'Ghost-camel bone', consumed: true },
    { id: 96005, name: 'Ghost-camel bone', consumed: true },
  ],
  skill: 'fletching', level: 55, xp: 48,
  description: 'Carve the boomerang from king-bone. Returns 80% of throws. Chains between dune targets at the Salt Sea Range.',
});

rel.defineCombination(96309, {
  resultName: 'Bone-Bound Iron Weapon',
  inputs: [
    { id: 96301, name: 'Sun-tempered alloy bar', consumed: true },
    { id: 96091, name: 'Bone-bound iron lump', consumed: true },
    { id: 99999, name: 'Iron weapon (any)', consumed: true },
  ],
  skill: 'smithing', level: 55, xp: 180, station: 'boneyard_sun_forge',
  description: 'Rebuild an old iron weapon with king-bone inside it. The old kings walk briefly when the weapon is swung.',
});

rel.defineCombination(96310, {
  resultName: 'Sand-Jerky',
  inputs: [
    { id: 2132, name: 'Raw beef', consumed: true },
    { id: 96012, name: 'Salt-crystal', consumed: true },
  ],
  skill: 'cooking', level: 1, xp: 45, station: 'boneyard_dry_cure_rack',
  description: 'Dry-cure the strip until it keeps. Heals six. Does not spoil. Caravan food.',
});

rel.defineCombination(96311, {
  resultName: 'Bone-Broth Bowl',
  inputs: [
    { id: 96005, name: 'Ghost-camel bone', consumed: true },
    { id: 96031, name: 'Dry-corn', consumed: true },
    { id: 96030, name: 'Cactus-fruit', consumed: true },
  ],
  skill: 'cooking', level: 30, xp: 120, station: 'range',
  description: 'Boil all night, add dry-corn at dawn, finish in the sun. Heals twelve. Restores one prayer point per bowl.',
});

rel.defineCombination(96312, {
  resultName: 'Desert-Temple Mortar',
  inputs: [
    { id: 96020, name: 'Sandstone slab', consumed: true },
    { id: 96012, name: 'Salt-crystal', consumed: true },
    { id: 90002, name: 'Clay', consumed: true },
  ],
  skill: 'crafting', level: 20, xp: 14,
  description: 'Desert-temple mortar. Salt-crystal replaces the Heartlands lime. Holds sandstone through a thousand years of wind.',
});

// ══════════════════════════════════════════════════════════════════════════════
// ITEM USES — cross-link everything into the web
// ══════════════════════════════════════════════════════════════════════════════

rel.registerItemUse(96001, { type: 'recipe', targetId: 'sand_mummy_linen_wrap', targetName: 'Sand-Mummy Linen Wrap', region: 'boneyard_wastes', details: 'Prayer wrap — binds to Veiled Grave chants.', obscure: false });
rel.registerItemUse(96001, { type: 'recipe', targetId: 'mummy_ranger_robe', targetName: 'Mummy Ranger Robe', region: 'boneyard_wastes', details: 'Crafting: desert ranger body armor.', obscure: true });

rel.registerItemUse(96005, { type: 'offering', targetId: 'pyre_bone_burning', targetName: 'Pyre-Bone Burning', region: 'boneyard_wastes', details: 'Ghost-camel bone is THE Boneyard pyre-bone. Double-skill firemaking + prayer.', obscure: false });
rel.registerItemUse(96005, { type: 'recipe', targetId: 96308, targetName: 'Bone-Boomerang', region: 'boneyard_wastes', details: 'Two bones + one driftwood log.', obscure: false });
rel.registerItemUse(96005, { type: 'recipe', targetId: 96311, targetName: 'Bone-Broth Bowl', region: 'boneyard_wastes', details: 'Bone-broth ingredient — restores prayer per bowl.', obscure: false });

rel.registerItemUse(96010, { type: 'recipe', targetId: 'salt_rune', targetName: 'Salt Rune', region: 'boneyard_wastes', details: 'The Salt Cistern runecraft. Single or double-bound.', obscure: false });
rel.registerItemUse(96010, { type: 'secondary', targetId: 'boneyard_prayer_binding_spellcasting', targetName: 'Prayer-binding spellcasting', region: 'boneyard_wastes', details: 'Rune-salt is a magic secondary for prayer-binding.', obscure: true });

rel.registerItemUse(96011, { type: 'offering', targetId: 'bury_prayer_stone', targetName: 'Bury Prayer-Stone', region: 'boneyard_wastes', details: '25 prayer XP per stone. Unique to the Boneyard.', obscure: false });
rel.registerItemUse(96011, { type: 'recipe', targetId: 96305, targetName: 'Water-Blessed Vial', region: 'boneyard_wastes', details: 'Prayer-stone is required for blessing.', obscure: false });

rel.registerItemUse(96012, { type: 'recipe', targetId: 96301, targetName: 'Sun-Tempered Alloy', region: 'boneyard_wastes', details: 'Smithing flux.', obscure: false });
rel.registerItemUse(96012, { type: 'recipe', targetId: 96310, targetName: 'Sand-Jerky', region: 'boneyard_wastes', details: 'Dry-cure salt.', obscure: false });
rel.registerItemUse(96012, { type: 'recipe', targetId: 96303, targetName: 'Heat-Distilled Tincture', region: 'boneyard_wastes', details: 'Herblore salt-binding.', obscure: false });
rel.registerItemUse(96012, { type: 'recipe', targetId: 96312, targetName: 'Desert-Temple Mortar', region: 'boneyard_wastes', details: 'Construction mortar binder.', obscure: true });

rel.registerItemUse(96020, { type: 'recipe', targetId: 'construction_temple_frame', targetName: 'Desert-Temple Framing', region: 'boneyard_wastes', details: 'Sandstone is the temple frame.', obscure: false });
rel.registerItemUse(96020, { type: 'recipe', targetId: 96302, targetName: 'Sand-Glass Pane', region: 'boneyard_wastes', details: 'Sandstone melts under magnifier-shard into pane.', obscure: false });

rel.registerItemUse(96030, { type: 'recipe', targetId: 96303, targetName: 'Heat-Distilled Tincture', region: 'boneyard_wastes', details: 'Cactus-fruit is the water-base.', obscure: false });
rel.registerItemUse(96030, { type: 'recipe', targetId: 96305, targetName: 'Water-Blessed Vial', region: 'boneyard_wastes', details: 'Cactus-water base for all blessings.', obscure: false });
rel.registerItemUse(96030, { type: 'recipe', targetId: 96311, targetName: 'Bone-Broth', region: 'boneyard_wastes', details: 'Bone-broth wets the dry-corn.', obscure: true });

rel.registerItemUse(96050, { type: 'recipe', targetId: 'random_spell_draw', targetName: 'Burnt Library Random Spell Draw', region: 'boneyard_wastes', details: 'Three scrolls per character, randomly selected — non-degenerate: your three are not your neighbor\'s.', obscure: true });

rel.registerItemUse(96060, { type: 'recipe', targetId: 96306, targetName: 'Bone-Shaft Arrow', region: 'boneyard_wastes', details: 'Fletching shaft base.', obscure: false });
rel.registerItemUse(96060, { type: 'recipe', targetId: 96307, targetName: 'Scorpion-Fletched Arrow', region: 'boneyard_wastes', details: 'Fletching shaft for advanced tier.', obscure: false });

rel.registerItemUse(96070, { type: 'recipe', targetId: 96308, targetName: 'Bone-Boomerang', region: 'boneyard_wastes', details: 'Driftwood forms the boomerang core.', obscure: false });
rel.registerItemUse(96070, { type: 'offering', targetId: 'sun_fire_burning', targetName: 'Sun-Fire Burning', region: 'boneyard_wastes', details: 'Firemaking fuel under the magnifier-shard.', obscure: false });

// ══════════════════════════════════════════════════════════════════════════════
// QUIRKY INTERACTIONS — desert flavor, trivial XP, rich flavor
// ══════════════════════════════════════════════════════════════════════════════

rel.defineTrainingMethod('quirky_boneyard_speak_the_wind_number', {
  skill: 'magic',
  name: '[Quirky] Speak the Wind\'s Number',
  levelRange: [1, 99],
  xpPerHour: 1900,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['boneyard_wastes'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'low',
  inputs: [],
  description: 'Stand at the prayer-stone and speak each hour\'s number into the wind. Tiny magic XP. The wind writes it down somewhere.',
  location: 'Boneyard Wastes',
});

rel.defineTrainingMethod('quirky_boneyard_empty_the_dry_well', {
  skill: 'strength',
  name: '[Quirky] Empty the Dry Well',
  levelRange: [1, 99],
  xpPerHour: 1700,
  prerequisites: { skills: {}, quests: [], items: [{ name: 'Bucket' }], areas: ['boneyard_wastes'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'high',
  inputs: [],
  description: 'Haul buckets of sand from the dry well. It has been dry for a hundred years. The hermit insists that one day it will come back.',
  location: 'Boneyard Wastes',
});

rel.defineTrainingMethod('quirky_boneyard_read_the_bone_pile', {
  skill: 'prayer',
  name: '[Quirky] Read the Bone-Pile',
  levelRange: [1, 99],
  xpPerHour: 2100,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['boneyard_wastes'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'low',
  inputs: [],
  description: 'Read the names on the bones in the bone-pile. Each name you speak is a tiny prayer. The wind collects what you drop.',
  location: 'Boneyard Wastes',
});

rel.defineTrainingMethod('quirky_boneyard_count_the_vultures', {
  skill: 'hunter',
  name: '[Quirky] Count the Vultures',
  levelRange: [1, 99],
  xpPerHour: 1400,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['boneyard_wastes'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'low',
  inputs: [],
  description: 'Count the vultures circling overhead. Hunter XP for attention paid. The prophet says if there are ever none, the desert has moved on.',
  location: 'Boneyard Wastes',
});

rel.defineTrainingMethod('quirky_boneyard_salt_chapped_lips', {
  skill: 'hitpoints',
  name: '[Quirky] Endure Salt-Chapped Lips',
  levelRange: [1, 99],
  xpPerHour: 1200,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['boneyard_wastes'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'afk',
  inputs: [],
  description: 'Sit at the noon bell with the sun on your mouth. Salt-chapped, sun-blackened, and the body learns what it can take. Tiny HP XP.',
  location: 'Boneyard Wastes',
});

console.log('[aelgard] Boneyard Deep loaded: 30 training methods, 10 quests, 7 breakpoints, 12 recipes, 30+ items, 5 quirky interactions');
