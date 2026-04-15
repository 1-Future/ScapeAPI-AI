// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Sootworks Deepening (Flagship Region #3 — Clockwork Industrial)
//
// Target: 12 → 65+ depth. Per analyzer, 17 skills hard-blocked + firemaking
// capped at 60. Only 11 methods total. The thinnest region in Aelgard.
//
// Sootworks is dwarves, gnomes, steam, soot, and stamped iron. Voice is short.
// Tool-noun-heavy. Soot-mouthed craft-cant. Compound names: Iron-Tongue,
// Cinderbar, Coal-Throat. Tolkien craftsman with a labor history.
//
// Landmarks introduced here:
//   - The Forge Cathedral (AFK communal smithing)
//   - The Boil-Floor (geothermal cooking)
//   - The Lantern Mines (firemaking + mining)
//   - The Pump Station (agility)
//   - The Soot-Library (runecrafting from forge-crystal scrolls)
//   - The Brass Choir (industrial sermons, prayer)
//   - The Tinker Yards (fletching, ranged from scrap)
//   - The Slag Tunnels (slayer — rogue clockwork)
//   - The Rust Pits (herblore from pipe-fungus)
//   - The Beggars' Gallery (thieving)
//   - The Steam-Field (farming — fungus, lichen, barley)
//   - The Sap-Wells (woodcutting — deep-stone fungus pylons)
//   - The Shaft Hunters (hunter)
//   - The Furnace-Chant (combat — heat-tempering)
//
// This file ADDS content. The existing sootworks.js stays intact.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const rel = require('../../data/relationships');

// ══════════════════════════════════════════════════════════════════════════════
// SOOTWORKS-NATIVE ITEMS (IDs 97000-97999)
// Industrial-themed resources unique to the region
// ══════════════════════════════════════════════════════════════════════════════

// Ores and smelt stock
rel.registerItemSource(97001, { type: 'gathering', sourceId: 'sootworks_lantern_seam', sourceName: 'Lantern Mine Seam', region: 'sootworks', details: 'Lantern-coal. Burns brighter. Feeds the Boil-Floor and the foundry.', obscure: false });
rel.registerItemSource(97002, { type: 'gathering', sourceId: 'sootworks_cinder_shaft', sourceName: 'Cinderbar Shaft', region: 'sootworks', details: 'Cinderbar ore. Alloys into gear-train steel. Smiths call it "Iron-Tongue bread".', obscure: false });
rel.registerItemSource(97003, { type: 'gathering', sourceId: 'sootworks_slag_drip', sourceName: 'Slag-Drip Basin', region: 'sootworks', details: 'Slag gravel. Ballast. Tip it. Mix it. The Boil-Floor takes it as packing.', obscure: true });

// Tinker scrap
rel.registerItemSource(97010, { type: 'gathering', sourceId: 'sootworks_tinker_yards', sourceName: 'Tinker Yards Scrap', region: 'sootworks', details: 'Bent gears, broken cogs, pipe offcuts. Feeds Tinker Yards crafts.', obscure: false });
rel.registerItemSource(97011, { type: 'drop', sourceId: 'sootworks_rogue_automaton', sourceName: 'Rogue Automaton', region: 'sootworks', details: 'Spring-coils. Crossbow limbs. Ranged fletching input.', obscure: false });
rel.registerItemSource(97012, { type: 'drop', sourceId: 'sootworks_clockwork_sentry', sourceName: 'Clockwork Sentry', region: 'sootworks', details: 'Pressure-tip bolts. Drop-cast. Ranged ammunition.', obscure: false });

// Fungus / moss (herblore)
rel.registerItemSource(97020, { type: 'gathering', sourceId: 'sootworks_rust_pits', sourceName: 'Rust Pits', region: 'sootworks', details: 'Pipe-fungus. Moryskah-dark, grows in condensation pools. Herblore primary.', obscure: false });
rel.registerItemSource(97021, { type: 'gathering', sourceId: 'sootworks_oilmoss_lichen', sourceName: 'Oil-Moss Lichen', region: 'sootworks', details: 'Oil-moss. Slick. Scraped off pump collars. Herblore secondary.', obscure: false });
rel.registerItemSource(97022, { type: 'gathering', sourceId: 'sootworks_vent_bloom', sourceName: 'Vent-Bloom Patch', region: 'sootworks', details: 'Vent-bloom. Steam-grown. Aspirant herb — prayer-potion equivalent.', obscure: true });

// Wood / fungus-pylons
rel.registerItemSource(97030, { type: 'gathering', sourceId: 'sootworks_sapwells', sourceName: 'Sap-Wells Fungus Pylon', region: 'sootworks', details: 'Deep-stone fungus-wood. Woodcutting. Burns in the lantern-chain.', obscure: false });
rel.registerItemSource(97031, { type: 'gathering', sourceId: 'sootworks_blackroot_stand', sourceName: 'Blackroot Stand', region: 'sootworks', details: 'Blackroot logs. Lantern-fired. Fletches into shot-casters and bolt shafts.', obscure: false });

// Fish
rel.registerItemSource(97040, { type: 'gathering', sourceId: 'sootworks_aquifer_ironfin', sourceName: 'Ironfin Aquifer Pool', region: 'sootworks', details: 'Raw ironfin. Aquifer cave-fish. Slow-draw line fishing.', obscure: false });
rel.registerItemSource(97041, { type: 'gathering', sourceId: 'sootworks_geyser_skitter', sourceName: 'Geyser Skitter Pool', region: 'sootworks', details: 'Geyser-skitter. Boils off heat. Fishing + cooking combo.', obscure: false });
rel.registerItemSource(97042, { type: 'gathering', sourceId: 'sootworks_deepwell_cavefish', sourceName: 'Deepwell Cave-Fish', region: 'sootworks', details: 'Cave-fish. Pale, no eyes. Endgame sootworks fish. Heals like monkfish.', obscure: false });

// Farming crops
rel.registerItemSource(97050, { type: 'gathering', sourceId: 'sootworks_steamfield_barley', sourceName: 'Steam-Field Barley Tray', region: 'sootworks', details: "Brewer's barley. Heated-tray grown. Stout feedstock.", obscure: false });
rel.registerItemSource(97051, { type: 'gathering', sourceId: 'sootworks_steamfield_fungus', sourceName: 'Steam-Field Fungus Bed', region: 'sootworks', details: 'Mine-cap fungus. Farming mid-tier. Eaten cooked; sold raw.', obscure: false });
rel.registerItemSource(97052, { type: 'gathering', sourceId: 'sootworks_steamfield_lichen', sourceName: 'Steam-Field Lichen Plate', region: 'sootworks', details: 'Lantern-lichen. Slow. Endgame farming plant. Glows faintly.', obscure: false });

// Prayer relics
rel.registerItemSource(97060, { type: 'drop', sourceId: 'sootworks_brass_choir', sourceName: 'Brass Choir Relic', region: 'sootworks', details: 'Machine-saint brass token. Offered at the pipe-altar for prayer.', obscure: false });
rel.registerItemSource(97061, { type: 'drop', sourceId: 'sootworks_gearbound_pilgrim', sourceName: 'Gearbound Pilgrim Medallion', region: 'sootworks', details: 'Pilgrim medallion. Rare (1/48). Stacks with Brass Choir offerings.', obscure: true });

// Runes / scroll stock
rel.registerItemSource(97070, { type: 'gathering', sourceId: 'sootworks_forge_crystal_vein', sourceName: 'Forge-Crystal Vein', region: 'sootworks', details: 'Forge-crystal. Industrial essence. Crafted at the Soot-Library.', obscure: false });
rel.registerItemSource(97071, { type: 'processing', sourceId: 'sootworks_soot_library', sourceName: 'Soot-Library Scroll Bench', region: 'sootworks', details: 'Soot-cant scrolls. Industrial runes. Gear-bound cast tokens.', obscure: false });

// Slayer uniques
rel.registerItemSource(97080, { type: 'drop', sourceId: 'sootworks_golem_spawn', sourceName: 'Golem-Spawn', region: 'sootworks', details: 'Slag-gut stone. Slayer-only drop. Crafts into heat-tempered talismans.', obscure: false });
rel.registerItemSource(97081, { type: 'drop', sourceId: 'sootworks_pipehound', sourceName: 'Pipehound', region: 'sootworks', details: 'Pipe-fang (rare). Silver-piercing claw. Slayer loot.', obscure: true });

// Hunter catches
rel.registerItemSource(97090, { type: 'gathering', sourceId: 'sootworks_clockbeetle_trap', sourceName: 'Clockwork Beetle Trap', region: 'sootworks', details: 'Clockbeetle carapace. Armor inlay. Unique hunter catch.', obscure: false });
rel.registerItemSource(97091, { type: 'gathering', sourceId: 'sootworks_glowmoth_net', sourceName: 'Glowmoth Net Spot', region: 'sootworks', details: 'Glowmoth scales. Lantern dust. Fletching + crafting.', obscure: false });
rel.registerItemSource(97092, { type: 'gathering', sourceId: 'sootworks_depthtrout_snare', sourceName: 'Depth-Trout Snare', region: 'sootworks', details: 'Depth-trout. Hunter-only — not fishing. Rare bonus meat.', obscure: true });

// Thieving loot
rel.registerItemSource(97100, { type: 'drop', sourceId: 'sootworks_trade_clerk', sourceName: 'Trade-Clerk Pocket', region: 'sootworks', details: 'Clerk-script notes. Pickpocket yield. Trades for coin at the fence.', obscure: false });
rel.registerItemSource(97101, { type: 'drop', sourceId: 'sootworks_strongbox', sourceName: 'Coal-Throat Strongbox', region: 'sootworks', details: 'Strongbox loot. Lockpicked. Sometimes a cinderbar ingot.', obscure: false });

// Quest-relevant
rel.registerItemSource(97110, { type: 'quest', sourceId: 'the_iron_tongue_heresy', sourceName: 'Iron-Tongue Heresy Reward', region: 'sootworks', details: 'Brass Choir thurible. Prayer training focus.', obscure: false });
rel.registerItemSource(97111, { type: 'quest', sourceId: 'pump_eight_stops', sourceName: 'Pump Eight Stops Reward', region: 'sootworks', details: "Pumpman's wrench. Agility-specific permit.", obscure: false });
rel.registerItemSource(97112, { type: 'quest', sourceId: 'beggars_gallery_after_hours', sourceName: "Beggars' Gallery After Hours Reward", region: 'sootworks', details: 'Quartermaster lockpick. Master thieving tool.', obscure: false });

// ══════════════════════════════════════════════════════════════════════════════
// SOOTWORKS TRAINING METHODS — unblock all 17 skills + raise firemaking cap
// Every method carries all 8 Marstead knobs.
// ══════════════════════════════════════════════════════════════════════════════

// ── STRENGTH ────────────────────────────────────────────────────────────────
rel.defineTrainingMethod('sootworks_furnace_chant_strength', {
  skill: 'strength', name: 'Furnace-Chant Hammer Drills',
  levelRange: [1, 50],
  xpPerHour: 22000,
  prerequisites: { skills: {}, quests: [], items: [{ name: 'Hammer' }], areas: ['sootworks'] },
  resourceOutput: { produces: [{ name: 'Cinder scale', perHour: 60 }], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'simple', attention: 'low',
  inputs: [{ name: 'Basic food', perHour: 8, source: 'cooking' }],
  description: 'Beat the chant-anvil until the Cinderbar sings. Dwarven strength drill. Warm. Safe. AFK.',
  location: 'Sootworks',
});

rel.defineTrainingMethod('sootworks_slag_tunnel_strength', {
  skill: 'strength', name: 'Slag-Tunnel Haul',
  levelRange: [30, 80],
  xpPerHour: 58000,
  prerequisites: { skills: { strength: 30 }, quests: [], items: [], areas: ['sootworks'] },
  resourceOutput: { produces: [{ name: 'Slag gravel', perHour: 220 }, { name: 'Gold coins', perHour: 18000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'medium', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Mid-tier food', perHour: 15, source: 'cooking' }],
  description: 'Haul slag ore carts up the tunnel. Push, brace, lock the wheel. Strength + haulage pay.',
  location: 'Sootworks',
});

// ── DEFENCE ─────────────────────────────────────────────────────────────────
rel.defineTrainingMethod('sootworks_heat_temper_defence', {
  skill: 'defence', name: 'Heat-Temper Plate Drills',
  levelRange: [10, 70],
  xpPerHour: 38000,
  prerequisites: { skills: { defence: 10 }, quests: [], items: [], areas: ['sootworks'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'rare', costPerHour: 0,
  danger: 'low', complexity: 'simple', attention: 'low',
  inputs: [{ name: 'Basic food', perHour: 10, source: 'cooking' }],
  description: 'Stand under the drop-forge while it quenches. The plate learns. You learn. Forge Cathedral.',
  location: 'Sootworks',
});

rel.defineTrainingMethod('sootworks_golem_spawn_defence', {
  skill: 'defence', name: 'Golem-Spawn Wardening',
  levelRange: [40, 90],
  xpPerHour: 62000,
  prerequisites: { skills: { defence: 40 }, quests: ['the_foundling_in_the_slag'], items: [], areas: ['sootworks'] },
  resourceOutput: { produces: [{ name: 'Slag-gut stone', perHour: 80 }, { name: 'Gold coins', perHour: 42000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'medium', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Mid-tier food', perHour: 18, source: 'cooking' }],
  description: 'Ward the Slag Tunnels while golem-spawn hammer your shield. Block. Stance. Hold.',
  location: 'Sootworks',
});

// ── HITPOINTS ───────────────────────────────────────────────────────────────
rel.defineTrainingMethod('sootworks_boilfloor_hpbath', {
  skill: 'hitpoints', name: 'Boil-Floor Heat Bath',
  levelRange: [1, 45],
  xpPerHour: 10000,
  prerequisites: { skills: {}, quests: [], items: [{ name: 'Wet cloth' }], areas: ['sootworks'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 400,
  danger: 'low', complexity: 'trivial', attention: 'afk',
  inputs: [{ name: 'Wet cloth', perHour: 4, source: 'sootworks_apothecary' }],
  description: 'Sit on the Boil-Floor while the steam works your lungs. Passive HP. Mind the cinder.',
  location: 'Sootworks',
});

rel.defineTrainingMethod('sootworks_pipehound_hp', {
  skill: 'hitpoints', name: 'Pipehound Grappling Pit',
  levelRange: [30, 80],
  xpPerHour: 16000,
  prerequisites: { skills: { hitpoints: 30 }, quests: [], items: [], areas: ['sootworks'] },
  resourceOutput: { produces: [{ name: 'Pipe-fang', perHour: 3 }], net: 'neutral' },
  bankingFrequency: 'rare', costPerHour: 0,
  danger: 'medium', complexity: 'simple', attention: 'low',
  inputs: [{ name: 'Mid-tier food', perHour: 10, source: 'cooking' }],
  description: 'Wrestle pipehounds in the grappling pit. They bite shallow. Cinderbar-handled leash required.',
  location: 'Sootworks',
});

// ── RANGED ──────────────────────────────────────────────────────────────────
rel.defineTrainingMethod('sootworks_tinker_crossbow_range', {
  skill: 'ranged', name: 'Tinker-Yard Crossbow Range',
  levelRange: [20, 70],
  xpPerHour: 56000,
  prerequisites: { skills: { ranged: 20 }, quests: [], items: [{ name: 'Crossbow' }], areas: ['sootworks'] },
  resourceOutput: { produces: [{ name: 'Spring-coils', perHour: 45 }], net: 'neutral' },
  bankingFrequency: 'moderate', costPerHour: 6000,
  danger: 'low', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Pressure-tip bolts', perHour: 2000, source: 'sootworks_clockwork_sentry' }, { name: 'Basic food', perHour: 15, source: 'cooking' }],
  description: 'Drop-cast crossbow drills at the Tinker Yards. Bolts come off stamped. Crack. Wind. Fire.',
  location: 'Sootworks',
});

rel.defineTrainingMethod('sootworks_shotcast_munitions_range', {
  skill: 'ranged', name: 'Shot-Cast Munitions Line',
  levelRange: [60, 99],
  xpPerHour: 90000,
  prerequisites: { skills: { ranged: 60, smithing: 45 }, quests: ['pump_eight_stops'], items: [{ name: 'Crossbow' }], areas: ['sootworks'] },
  resourceOutput: { produces: [{ name: 'Spent shot-casings', perHour: 80 }, { name: 'Gold coins', perHour: 35000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 22000,
  danger: 'medium', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Shot munitions', perHour: 1800, source: 'smithing' }, { name: 'Cave-fish', perHour: 20, source: 'cooking' }],
  description: 'Feed the shot-cast line. Rate-of-fire drills. Extreme ranged XP but the munitions bill is real.',
  location: 'Sootworks',
  breakpointAt: 60,
});

// ── PRAYER ──────────────────────────────────────────────────────────────────
rel.defineTrainingMethod('sootworks_brass_choir_prayer', {
  skill: 'prayer', name: 'Brass Choir Sermons',
  levelRange: [1, 99],
  xpPerHour: 140000,
  prerequisites: { skills: {}, quests: ['the_iron_tongue_heresy'], items: [], areas: ['sootworks'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'frequent', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Brass Choir relic', perHour: 400, source: 'sootworks_brass_choir' }, { name: 'Bones (any)', perHour: 300, source: 'any_bones' }],
  description: 'Offer relics at the pipe-altar while the machine-saint sings. 3x prayer per offering. Industrial prayer flagship.',
  location: 'Sootworks',
});

rel.defineTrainingMethod('sootworks_pilgrim_watchfire', {
  skill: 'prayer', name: 'Pilgrim Watchfire Vigil',
  levelRange: [30, 99],
  xpPerHour: 72000,
  prerequisites: { skills: { prayer: 30 }, quests: [], items: [], areas: ['sootworks'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'simple', attention: 'low',
  inputs: [{ name: 'Pilgrim medallion', perHour: 30, source: 'sootworks_gearbound_pilgrim' }, { name: 'Blackroot logs', perHour: 200, source: 'sootworks_blackroot_stand' }],
  description: 'Tend the pilgrim watchfire. AFK prayer. Log-fed. Mid-rate, mid-cost, no supervision.',
  location: 'Sootworks',
});

// ── MAGIC ───────────────────────────────────────────────────────────────────
rel.defineTrainingMethod('sootworks_gearbound_magic', {
  skill: 'magic', name: 'Gear-Bound Soot-Cant',
  levelRange: [30, 80],
  xpPerHour: 72000,
  prerequisites: { skills: { magic: 30 }, quests: [], items: [], areas: ['sootworks'] },
  resourceOutput: { produces: [{ name: 'Scorched gear-plate', perHour: 60 }], net: 'neutral' },
  bankingFrequency: 'moderate', costPerHour: 18000,
  danger: 'low', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Soot-cant scroll', perHour: 800, source: 'sootworks_soot_library' }, { name: 'Cinderbar ore', perHour: 60, source: 'sootworks_cinder_shaft' }],
  description: 'Cast gear-bound enchantments on raw plate stock. Industrial magic. Loud. Bright. Noisy.',
  location: 'Sootworks',
});

rel.defineTrainingMethod('sootworks_rune_imbue_magic', {
  skill: 'magic', name: 'Rune-Imbue Press',
  levelRange: [70, 99],
  xpPerHour: 105000,
  prerequisites: { skills: { magic: 70, smithing: 55 }, quests: ['the_clockwork_heretic'], items: [], areas: ['sootworks'] },
  resourceOutput: { produces: [{ name: 'Imbued gear-token', perHour: 40 }, { name: 'Gold coins', perHour: 120000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 60000,
  danger: 'low', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Soot-cant scroll', perHour: 1200, source: 'sootworks_soot_library' }, { name: 'Cinderbar bar', perHour: 40, source: 'smithing' }],
  description: 'Press imbue-runes into gear-tokens at the industrial stamp. Peak Sootworks magic.',
  location: 'Sootworks',
  breakpointAt: 70,
});

// ── RUNECRAFTING ────────────────────────────────────────────────────────────
rel.defineTrainingMethod('sootworks_soot_library_rc', {
  skill: 'runecrafting', name: 'Soot-Library Industrial Runes',
  levelRange: [25, 99],
  xpPerHour: 44000,
  prerequisites: { skills: { runecrafting: 25 }, quests: ['the_soot_library_keys'], items: [], areas: ['sootworks'] },
  resourceOutput: { produces: [{ name: 'Soot-cant scroll', perHour: 2100 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'low',
  inputs: [{ name: 'Forge-crystal', perHour: 2100, source: 'sootworks_forge_crystal_vein' }],
  description: 'Etch industrial runes from forge-crystal at the Soot-Library. Scrolls feed Sootworks magic.',
  location: 'Sootworks',
  breakpointAt: 25,
});

// ── AGILITY ─────────────────────────────────────────────────────────────────
rel.defineTrainingMethod('sootworks_pump_station_course', {
  skill: 'agility', name: 'Pump Station Pipe-Vault Course',
  levelRange: [20, 75],
  xpPerHour: 52000,
  prerequisites: { skills: { agility: 20 }, quests: ['pump_eight_stops'], items: [], areas: ['sootworks'] },
  resourceOutput: { produces: [{ name: 'Marks of grace', perHour: 22 }], net: 'profit' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'medium', complexity: 'moderate', attention: 'medium',
  inputs: [],
  description: 'Pipe-vault, valve-spin, gear-walk, repeat. Eight stops. Miss a beat, scald a shin. Decent XP + marks.',
  location: 'Sootworks',
});

rel.defineTrainingMethod('sootworks_gearwalk_elite', {
  skill: 'agility', name: 'Deep Gearwalk Elite Run',
  levelRange: [75, 99],
  xpPerHour: 80000,
  prerequisites: { skills: { agility: 75 }, quests: ['pump_eight_stops'], items: [], areas: ['sootworks'] },
  resourceOutput: { produces: [{ name: 'Marks of grace', perHour: 32 }, { name: 'Pumpman seal', perHour: 2 }], net: 'profit' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'high', complexity: 'complex', attention: 'high',
  inputs: [],
  description: 'Elite gearwalk deep below the pump station. Tick-perfect. Falls scald for real. Best Sootworks agility.',
  location: 'Sootworks',
  breakpointAt: 75,
});

// ── HERBLORE ────────────────────────────────────────────────────────────────
rel.defineTrainingMethod('sootworks_rust_pits_apothecary', {
  skill: 'herblore', name: 'Rust-Pits Pipe-Brewing',
  levelRange: [15, 75],
  xpPerHour: 70000,
  prerequisites: { skills: { herblore: 15 }, quests: [], items: [], areas: ['sootworks'] },
  resourceOutput: { produces: [{ name: 'Pipe-brews', perHour: 280 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Pipe-fungus', perHour: 280, source: 'sootworks_rust_pits' }, { name: 'Oil-moss', perHour: 140, source: 'sootworks_oilmoss_lichen' }, { name: 'Vial of water', perHour: 280, source: 'heartlands_apothecary' }],
  description: 'Brew pipe-fungus in oil-moss tonics. Stout-style potions. Soot-Cough cure is Sootworks-native.',
  location: 'Sootworks',
});

rel.defineTrainingMethod('sootworks_ventbloom_master', {
  skill: 'herblore', name: 'Vent-Bloom Master Apothecary',
  levelRange: [70, 99],
  xpPerHour: 105000,
  prerequisites: { skills: { herblore: 70 }, quests: ['the_clockwork_heretic'], items: [], areas: ['sootworks'] },
  resourceOutput: { produces: [{ name: 'Vent-bloom brew', perHour: 160 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 14000,
  danger: 'none', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Vent-bloom', perHour: 160, source: 'sootworks_vent_bloom' }, { name: 'Pilgrim medallion', perHour: 20, source: 'sootworks_gearbound_pilgrim' }, { name: 'Vial of water', perHour: 160, source: 'heartlands_apothecary' }],
  description: 'Distil vent-bloom with pilgrim brass into prayer-restore brews. Sootworks super-restore analog.',
  location: 'Sootworks',
});

// ── THIEVING ────────────────────────────────────────────────────────────────
rel.defineTrainingMethod('sootworks_beggars_gallery_pickpocket', {
  skill: 'thieving', name: "Beggars' Gallery Clerk-Lifting",
  levelRange: [15, 60],
  xpPerHour: 48000,
  prerequisites: { skills: { thieving: 15 }, quests: [], items: [], areas: ['sootworks'] },
  resourceOutput: { produces: [{ name: 'Gold coins', perHour: 28000 }, { name: 'Clerk-script', perHour: 120 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 0,
  danger: 'low', complexity: 'simple', attention: 'low',
  inputs: [],
  description: 'Lift pockets off trade-clerks at shift-change. Gallery after hours has no guards. Quiet work.',
  location: 'Sootworks',
});

rel.defineTrainingMethod('sootworks_strongbox_lockpick', {
  skill: 'thieving', name: 'Coal-Throat Strongbox Lockpicking',
  levelRange: [50, 99],
  xpPerHour: 78000,
  prerequisites: { skills: { thieving: 50 }, quests: ['beggars_gallery_after_hours'], items: [{ name: 'Lockpick' }], areas: ['sootworks'] },
  resourceOutput: { produces: [{ name: 'Gold coins', perHour: 140000 }, { name: 'Cinderbar ingot', perHour: 8 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'medium', complexity: 'complex', attention: 'high',
  inputs: [],
  description: 'Crack strongboxes at the Coal-Throat vaults. Tumbler-sequence minigame. Master-thief work.',
  location: 'Sootworks',
  breakpointAt: 50,
});

// ── FLETCHING ───────────────────────────────────────────────────────────────
rel.defineTrainingMethod('sootworks_tinker_bolt_fletching', {
  skill: 'fletching', name: 'Tinker-Yard Bolt Fletching',
  levelRange: [10, 60],
  xpPerHour: 54000,
  prerequisites: { skills: { fletching: 10 }, quests: [], items: [], areas: ['sootworks'] },
  resourceOutput: { produces: [{ name: 'Pressure-tip bolts', perHour: 2400 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'simple', attention: 'afk',
  inputs: [{ name: 'Blackroot logs', perHour: 400, source: 'sootworks_blackroot_stand' }, { name: 'Spring-coils', perHour: 240, source: 'sootworks_rogue_automaton' }],
  description: 'Shape blackroot shafts, crimp pressure tips. Sootworks-unique bolts for crossbow drills.',
  location: 'Sootworks',
});

rel.defineTrainingMethod('sootworks_shotcaster_fletching', {
  skill: 'fletching', name: 'Shot-Caster Assembly',
  levelRange: [60, 99],
  xpPerHour: 95000,
  prerequisites: { skills: { fletching: 60, smithing: 40 }, quests: [], items: [], areas: ['sootworks'] },
  resourceOutput: { produces: [{ name: 'Shot-caster', perHour: 180 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Blackroot logs', perHour: 720, source: 'sootworks_blackroot_stand' }, { name: 'Cinderbar bar', perHour: 180, source: 'smithing' }, { name: 'Spring-coils', perHour: 180, source: 'sootworks_rogue_automaton' }],
  description: 'Assemble shot-casters on the Tinker line. Part fletch, part smith. Industrial ranged weapon.',
  location: 'Sootworks',
});

// ── SLAYER ──────────────────────────────────────────────────────────────────
rel.defineTrainingMethod('sootworks_slag_tunnels_slayer', {
  skill: 'slayer', name: 'Slag Tunnels Clockwork Contracts',
  levelRange: [35, 99],
  xpPerHour: 50000,
  prerequisites: { skills: { slayer: 35 }, quests: ['the_foundling_in_the_slag'], items: [], areas: ['sootworks'] },
  resourceOutput: { produces: [{ name: 'Gold coins', perHour: 65000 }, { name: 'Slayer points', perHour: 28 }, { name: 'Slag-gut stone', perHour: 18 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 7000,
  danger: 'high', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Cave-fish', perHour: 25, source: 'sootworks_deepwell_cavefish' }, { name: 'Pipe-brews', perHour: 4, source: 'sootworks_rust_pits_apothecary' }],
  description: 'Slayer contracts from the Iron-Tongue foundling. Clockwork gone wrong, golem-spawn swarms, pipehounds.',
  location: 'Sootworks',
  breakpointAt: 35,
});

// ── HUNTER ──────────────────────────────────────────────────────────────────
rel.defineTrainingMethod('sootworks_clockbeetle_trapping', {
  skill: 'hunter', name: 'Clockbeetle Trapping',
  levelRange: [20, 65],
  xpPerHour: 60000,
  prerequisites: { skills: { hunter: 20 }, quests: [], items: [{ name: 'Box trap' }], areas: ['sootworks'] },
  resourceOutput: { produces: [{ name: 'Clockbeetle carapace', perHour: 140 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'simple', attention: 'low',
  inputs: [],
  description: 'Trap clockbeetles where the pipes run warm. Winding carapaces. Armor inlay material.',
  location: 'Sootworks',
});

rel.defineTrainingMethod('sootworks_glowmoth_netting', {
  skill: 'hunter', name: 'Glowmoth Lantern Netting',
  levelRange: [45, 85],
  xpPerHour: 78000,
  prerequisites: { skills: { hunter: 45 }, quests: [], items: [{ name: 'Butterfly net' }], areas: ['sootworks'] },
  resourceOutput: { produces: [{ name: 'Glowmoth scales', perHour: 220 }, { name: 'Glowmoth dust', perHour: 80 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'low', complexity: 'moderate', attention: 'medium',
  inputs: [],
  description: 'Net glowmoths in the Lantern Mines after the seam lights. Scales feed fletching, dust feeds crafting.',
  location: 'Sootworks',
});

rel.defineTrainingMethod('sootworks_depthtrout_snare', {
  skill: 'hunter', name: 'Depth-Trout Snare Line',
  levelRange: [70, 99],
  xpPerHour: 95000,
  prerequisites: { skills: { hunter: 70 }, quests: ['geyser_bridge'], items: [], areas: ['sootworks'] },
  resourceOutput: { produces: [{ name: 'Depth-trout', perHour: 120 }, { name: 'Gold coins', perHour: 50000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'low', complexity: 'complex', attention: 'high',
  inputs: [],
  description: 'Run the snare line across the deep geyser. Each snare is bait-timed. Hunter-caught fish, not fishing.',
  location: 'Sootworks',
  breakpointAt: 70,
});

// ── FISHING ─────────────────────────────────────────────────────────────────
rel.defineTrainingMethod('sootworks_ironfin_line', {
  skill: 'fishing', name: 'Aquifer Ironfin Line Fishing',
  levelRange: [15, 60],
  xpPerHour: 36000,
  prerequisites: { skills: { fishing: 15 }, quests: [], items: [{ name: 'Fishing rod' }], areas: ['sootworks'] },
  resourceOutput: { produces: [{ name: 'Raw ironfin', perHour: 190 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'afk',
  inputs: [{ name: 'Bait', perHour: 190, source: 'shop' }],
  description: 'Slow-draw line in the aquifer pool. Ironfin bite when the pressure settles. AFK-friendly.',
  location: 'Sootworks',
});

rel.defineTrainingMethod('sootworks_geyser_skitter_fishing', {
  skill: 'fishing', name: 'Geyser-Skitter Catching',
  levelRange: [50, 85],
  xpPerHour: 64000,
  prerequisites: { skills: { fishing: 50 }, quests: ['geyser_bridge'], items: [], areas: ['sootworks'] },
  resourceOutput: { produces: [{ name: 'Geyser-skitter', perHour: 160 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'low', complexity: 'moderate', attention: 'medium',
  inputs: [],
  description: 'Time the geyser. Net the skitter. Boils its own meat. Scald a hand, eat hot.',
  location: 'Sootworks',
});

rel.defineTrainingMethod('sootworks_deepwell_cavefishing', {
  skill: 'fishing', name: 'Deepwell Cave-Fishing',
  levelRange: [75, 99],
  xpPerHour: 78000,
  prerequisites: { skills: { fishing: 75 }, quests: ['geyser_bridge'], items: [{ name: 'Harpoon' }], areas: ['sootworks'] },
  resourceOutput: { produces: [{ name: 'Cave-fish', perHour: 140 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'low', complexity: 'simple', attention: 'low',
  inputs: [],
  description: 'Harpoon the deepwell cave-fish. Endgame sootworks fish. Pale. Heavy. Heals strong.',
  location: 'Sootworks',
});

// ── COOKING ─────────────────────────────────────────────────────────────────
rel.defineTrainingMethod('sootworks_boilfloor_steamcure', {
  skill: 'cooking', name: 'Boil-Floor Steam-Cure Kitchen',
  levelRange: [15, 85],
  xpPerHour: 145000,
  prerequisites: { skills: { cooking: 15 }, quests: [], items: [], areas: ['sootworks'] },
  resourceOutput: { produces: [{ name: 'Steam-cured ironfin', perHour: 1400 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'simple', attention: 'low',
  inputs: [{ name: 'Raw ironfin', perHour: 1400, source: 'sootworks_ironfin_line' }],
  description: 'Steam-cure ironfin on the Boil-Floor. No flames. No burn risk above 35. Forge-heat does the work.',
  location: 'Sootworks',
});

rel.defineTrainingMethod('sootworks_pressurepot_cooking', {
  skill: 'cooking', name: 'Pressure-Pot Stout Kitchen',
  levelRange: [45, 99],
  xpPerHour: 185000,
  prerequisites: { skills: { cooking: 45 }, quests: ['geyser_bridge'], items: [], areas: ['sootworks'] },
  resourceOutput: { produces: [{ name: 'Dwarven stout', perHour: 900 }, { name: 'Cave-fish (cooked)', perHour: 500 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: "Brewer's barley", perHour: 900, source: 'sootworks_steamfield_barley' }, { name: 'Cave-fish', perHour: 500, source: 'sootworks_deepwell_cavefishing' }],
  description: 'Pressure-pot stout and cave-fish together. Highest cooking XP in Sootworks. Gears up the combat eaters.',
  location: 'Sootworks',
});

// ── WOODCUTTING ─────────────────────────────────────────────────────────────
rel.defineTrainingMethod('sootworks_sapwells_woodcutting', {
  skill: 'woodcutting', name: 'Sap-Wells Fungus-Wood Cutting',
  levelRange: [20, 70],
  xpPerHour: 44000,
  prerequisites: { skills: { woodcutting: 20 }, quests: [], items: [{ name: 'Axe' }], areas: ['sootworks'] },
  resourceOutput: { produces: [{ name: 'Deep-stone fungus-wood', perHour: 340 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'simple', attention: 'afk',
  inputs: [],
  description: 'Fell fungus-pylons at the Sap-Wells. Soft inside, hard rind. Burns long when lit. AFK hack-and-lift.',
  location: 'Sootworks',
});

rel.defineTrainingMethod('sootworks_blackroot_cutting', {
  skill: 'woodcutting', name: 'Blackroot Lantern-Stand Cutting',
  levelRange: [55, 99],
  xpPerHour: 68000,
  prerequisites: { skills: { woodcutting: 55 }, quests: [], items: [{ name: 'Axe' }], areas: ['sootworks'] },
  resourceOutput: { produces: [{ name: 'Blackroot logs', perHour: 280 }, { name: 'Lantern-sap', perHour: 70 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'low', complexity: 'simple', attention: 'low',
  inputs: [],
  description: 'Cut blackroot stands by lantern-light. Sap bottles feed firemaking. Logs feed fletching.',
  location: 'Sootworks',
});

// ── FARMING ─────────────────────────────────────────────────────────────────
rel.defineTrainingMethod('sootworks_steamfield_farming', {
  skill: 'farming', name: 'Steam-Field Heated Trays',
  levelRange: [20, 99],
  xpPerHour: 52000,
  prerequisites: { skills: { farming: 20 }, quests: [], items: [], areas: ['sootworks'] },
  resourceOutput: { produces: [{ name: "Brewer's barley", perHour: 180 }, { name: 'Mine-cap fungus', perHour: 100 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 2500,
  danger: 'none', complexity: 'moderate', attention: 'low',
  inputs: [{ name: 'Tray seeds', perHour: 12, source: 'shop_or_drops' }],
  description: 'Rotate heated trays through barley, fungus, lichen. Steam-field stays warm. Yield +20% vs surface.',
  location: 'Sootworks',
  breakpointAt: 20,
});

rel.defineTrainingMethod('sootworks_lantern_lichen_farming', {
  skill: 'farming', name: 'Lantern-Lichen Plate Tending',
  levelRange: [65, 99],
  xpPerHour: 85000,
  prerequisites: { skills: { farming: 65 }, quests: ['the_clockwork_heretic'], items: [], areas: ['sootworks'] },
  resourceOutput: { produces: [{ name: 'Lantern-lichen', perHour: 60 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 4000,
  danger: 'none', complexity: 'moderate', attention: 'low',
  inputs: [{ name: 'Lichen spore', perHour: 8, source: 'sootworks_steamfield_lichen' }],
  description: 'Tend the lichen plates. Glows faint. Sells to herblorists and magic-inkers alike.',
  location: 'Sootworks',
});

// ── FIREMAKING (raise cap past 60) ──────────────────────────────────────────
rel.defineTrainingMethod('sootworks_lantern_mine_firemaking', {
  skill: 'firemaking', name: 'Lantern Mine Seam-Lighting',
  levelRange: [40, 90],
  xpPerHour: 165000,
  prerequisites: { skills: { firemaking: 40, mining: 30 }, quests: [], items: [{ name: 'Tinderbox' }], areas: ['sootworks'] },
  resourceOutput: { produces: [{ name: 'Lantern-coal', perHour: 380 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'low', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Blackroot logs', perHour: 900, source: 'sootworks_blackroot_stand' }],
  description: 'Light the seam. Mining + firemaking in one rhythm. Ignite the wall, ore cracks free. Dual-skill.',
  location: 'Sootworks',
  breakpointAt: 40,
});

rel.defineTrainingMethod('sootworks_deepcoal_furnace_fm', {
  skill: 'firemaking', name: 'Deep-Coal Furnace Master Burn',
  levelRange: [70, 99],
  xpPerHour: 245000,
  prerequisites: { skills: { firemaking: 70 }, quests: ['the_clockwork_heretic'], items: [{ name: 'Tinderbox' }], areas: ['sootworks'] },
  resourceOutput: { produces: [{ name: 'Furnace-tokens', perHour: 220 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'medium', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Blackroot logs', perHour: 1300, source: 'sootworks_blackroot_stand' }, { name: 'Lantern-coal', perHour: 400, source: 'sootworks_lantern_seam' }],
  description: 'Master-burn the deep-coal furnace. Temperature-minigame. Peak firemaking XP in Aelgard.',
  location: 'Sootworks',
  breakpointAt: 70,
});

// ══════════════════════════════════════════════════════════════════════════════
// SOOTWORKS QUESTS — 10 new quests with non-degenerate Metroidvania unlocks
// ══════════════════════════════════════════════════════════════════════════════

rel.defineQuestUnlock('the_iron_tongue_heresy', {
  name: 'The Iron-Tongue Heresy',
  unlocks: [
    { type: 'training_method', id: 'sootworks_brass_choir_prayer', description: 'Brass Choir sermons — industrial prayer, 3x per relic offered' },
    { type: 'prayer', id: 'sootworks_iron_tongue_chant', description: 'Iron-Tongue Chant prayer — +10% damage vs golems and constructs' },
    { type: 'shop', id: 'sootworks_brass_choir_shop', description: 'Brass Choir reliquary — trade relics for Sootworks-unique prayer gear' },
  ],
});

rel.defineQuestUnlock('pump_eight_stops', {
  name: 'Pump Eight Stops',
  unlocks: [
    { type: 'training_method', id: 'sootworks_pump_station_course', description: 'Pump Station agility course — 8 stops, pipe-vault minigame, marks of grace' },
    { type: 'shortcut', id: 'sootworks_pump_tunnel_link', description: "Pumpman's shortcut — bypass the lift queue between surface and deep mines" },
    { type: 'item_equip', id: 'pumpmans_wrench', description: "Pumpman's Wrench — permanent +2 agility on any Sootworks course" },
  ],
});

rel.defineQuestUnlock('beggars_gallery_after_hours', {
  name: "Beggars' Gallery After Hours",
  unlocks: [
    { type: 'training_method', id: 'sootworks_strongbox_lockpick', description: 'Strongbox lockpicking — master thieving, tumbler-sequence minigame' },
    { type: 'npc', id: 'master_thief_quartermaster', description: 'Master Thief Quartermaster — sells thieving-exclusive tools and lockpick sets' },
    { type: 'shop', id: 'sootworks_fence', description: "Coal-Throat fence — sells stolen clerk-script for silver" },
  ],
});

rel.defineQuestUnlock('the_foundling_in_the_slag', {
  name: 'The Foundling in the Slag',
  unlocks: [
    { type: 'npc', id: 'slayer_master_iron_tongue', description: 'Iron-Tongue slayer master — issues clockwork-construct contracts' },
    { type: 'training_method', id: 'sootworks_slag_tunnels_slayer', description: 'Slag Tunnels contracts — construct slayer with unique task list' },
    { type: 'area', id: 'sootworks_slag_tunnels', description: 'Slag Tunnels access — golem-spawn, pipehounds, deep-foundry monsters' },
  ],
});

rel.defineQuestUnlock('geyser_bridge', {
  name: 'Geyser Bridge',
  unlocks: [
    { type: 'area', id: 'sootworks_geyser_dock', description: 'Geyser Dock — deepwell fishing spot + pressure-pot cooking station adjacent' },
    { type: 'training_method', id: 'sootworks_pressurepot_cooking', description: 'Pressure-pot cooking — stout + cave-fish, highest cooking XP in Sootworks' },
    { type: 'shortcut', id: 'sootworks_geyser_bridge_link', description: 'Geyser bridge — one-way drop from pump station to aquifer level' },
  ],
});

rel.defineQuestUnlock('the_soot_library_keys', {
  name: 'The Soot-Library Keys',
  unlocks: [
    { type: 'training_method', id: 'sootworks_soot_library_rc', description: 'Soot-Library industrial runecrafting — forge-crystal to soot-cant scrolls' },
    { type: 'spellbook', id: 'soot_cant_spellbook', description: 'Soot-Cant spellbook — industrial magic branch, gear-bound enchantments' },
    { type: 'area', id: 'sootworks_library_stacks', description: 'Library stacks — forge-crystal vein, scroll bench, archivist shop' },
  ],
});

rel.defineQuestUnlock('the_clockwork_heretic', {
  name: 'The Clockwork Heretic',
  unlocks: [
    { type: 'boss', id: 'the_clockwork_heretic', description: 'The Clockwork Heretic boss — rogue master-smith, mid-game Sootworks prestige' },
    { type: 'training_method', id: 'sootworks_deepcoal_furnace_fm', description: 'Deep-coal furnace master burn — 245k firemaking XP/hr' },
    { type: 'item_equip', id: 'heretics_bellows', description: "Heretic's Bellows — +8% firemaking XP in Sootworks permanently" },
  ],
});

rel.defineQuestUnlock('the_lantern_that_found_you', {
  name: 'The Lantern That Found You',
  unlocks: [
    { type: 'teleport', id: 'sootworks_lantern_network', description: 'Lantern-network teleports — move between lit Sootworks landmarks instantly' },
    { type: 'item_equip', id: 'foundling_lantern', description: "Foundling's Lantern — light source + passive hunter bonus in the dark" },
  ],
});

rel.defineQuestUnlock('the_quenchmasters_last_order', {
  name: "The Quenchmaster's Last Order",
  unlocks: [
    { type: 'recipe', id: 'sootworks_cinderbar_alloy', description: 'Cinderbar alloy — unique smithing bar, between mithril and adamant tier' },
    { type: 'training_method', id: 'sootworks_rune_imbue_magic', description: 'Rune-imbue press — 105k magic XP/hr + imbued gear-token profit' },
    { type: 'item_equip', id: 'quenchmasters_tongs', description: "Quenchmaster's Tongs — +5% smithing XP at Sootworks forges" },
  ],
});

rel.defineQuestUnlock('the_pilgrim_gear', {
  name: 'The Pilgrim Gear',
  unlocks: [
    { type: 'item_equip', id: 'gearbound_pilgrim_cassock', description: 'Gearbound Pilgrim Cassock — +2 prayer, prayer bonuses stack at Brass Choir' },
    { type: 'training_method', id: 'sootworks_pilgrim_watchfire', description: 'Pilgrim watchfire vigil — AFK prayer with medallion offerings' },
    { type: 'area', id: 'sootworks_pilgrim_cloister', description: 'Pilgrim cloister — rest + prayer restore spot, Brass Choir side chapel' },
  ],
});

// ══════════════════════════════════════════════════════════════════════════════
// SOOTWORKS BREAKPOINTS — transformative industrial-progression moments
// ══════════════════════════════════════════════════════════════════════════════

rel.defineBreakpoint({
  type: 'skill_level', trigger: { skill: 'firemaking', level: 70 },
  description: 'Deep-coal furnace unlocked. 245k firemaking XP/hr. Sootworks becomes the fastest firemaking region in Aelgard.',
  unlocks: [{ type: 'training_method', id: 'sootworks_deepcoal_furnace_fm', description: 'Deep-coal furnace master burn' }],
  importance: 'transformative',
});

rel.defineBreakpoint({
  type: 'skill_level', trigger: { skill: 'runecrafting', level: 25 },
  description: 'Soot-Library opens. Industrial runes (soot-cant scrolls) craft 2x per forge-crystal. Sootworks magic comes online.',
  unlocks: [{ type: 'training_method', id: 'sootworks_soot_library_rc', description: 'Soot-Library industrial runes' }],
  importance: 'major',
});

rel.defineBreakpoint({
  type: 'skill_level', trigger: { skill: 'agility', level: 75 },
  description: 'Deep gearwalk unlocked. 80k agility XP/hr + pumpman seals. The tick-perfect endgame Sootworks course.',
  unlocks: [{ type: 'training_method', id: 'sootworks_gearwalk_elite', description: 'Deep Gearwalk elite run' }],
  importance: 'major',
});

rel.defineBreakpoint({
  type: 'quest_complete', trigger: { quest: 'the_iron_tongue_heresy' },
  description: 'Brass Choir open. Industrial prayer XP — 140k/hr with relics. Sootworks prayer becomes the best outside Moryskah.',
  unlocks: [
    { type: 'training_method', id: 'sootworks_brass_choir_prayer', description: 'Brass Choir sermons' },
    { type: 'prayer', id: 'sootworks_iron_tongue_chant', description: 'Iron-Tongue Chant — anti-construct damage boost' },
  ],
  importance: 'transformative',
});

rel.defineBreakpoint({
  type: 'quest_complete', trigger: { quest: 'the_clockwork_heretic' },
  description: 'Clockwork Heretic defeated. Deep-coal furnace, vent-bloom master brewing, and rune-imbue press all unlock together.',
  unlocks: [
    { type: 'training_method', id: 'sootworks_deepcoal_furnace_fm', description: 'Deep-coal furnace firemaking' },
    { type: 'training_method', id: 'sootworks_ventbloom_master', description: 'Vent-bloom master herblore' },
    { type: 'training_method', id: 'sootworks_rune_imbue_magic', description: 'Rune-imbue press magic' },
    { type: 'item_equip', id: 'heretics_bellows', description: "Heretic's Bellows" },
  ],
  importance: 'transformative',
});

rel.defineBreakpoint({
  type: 'quest_complete', trigger: { quest: 'geyser_bridge' },
  description: 'Geyser Bridge built. Deep aquifer fishing + pressure-pot cooking + depth-trout hunter all unlock. Sootworks food economy matures.',
  unlocks: [
    { type: 'training_method', id: 'sootworks_geyser_skitter_fishing', description: 'Geyser-skitter fishing' },
    { type: 'training_method', id: 'sootworks_deepwell_cavefishing', description: 'Deepwell cave-fishing' },
    { type: 'training_method', id: 'sootworks_pressurepot_cooking', description: 'Pressure-pot kitchen' },
    { type: 'training_method', id: 'sootworks_depthtrout_snare', description: 'Depth-trout snare line' },
  ],
  importance: 'major',
});

rel.defineBreakpoint({
  type: 'skill_level', trigger: { skill: 'thieving', level: 50 },
  description: "Coal-Throat strongboxes open. 140k/hr coin + cinderbar ingots. The iconic Sootworks thieving money grind.",
  unlocks: [{ type: 'training_method', id: 'sootworks_strongbox_lockpick', description: 'Strongbox lockpicking' }],
  importance: 'major',
});

// ══════════════════════════════════════════════════════════════════════════════
// SOOTWORKS RECIPES — gear-train alloys, piston assemblies, industrial brews
// Using rel.defineCombination (analyzer pattern).
// ══════════════════════════════════════════════════════════════════════════════

rel.defineCombination(97501, {
  resultName: 'Cinderbar bar',
  inputs: [
    { id: 97002, name: 'Cinderbar ore', consumed: true },
    { id: 97001, name: 'Lantern-coal', consumed: true },
    { id: 97001, name: 'Lantern-coal', consumed: true },
  ],
  skill: 'smithing', level: 45, xp: 32, station: 'furnace',
  description: 'Smelt cinderbar bar. Between mithril and adamant tier. Sootworks-unique alloy.',
});

rel.defineCombination(97502, {
  resultName: 'Gear-train steel',
  inputs: [
    { id: 97501, name: 'Cinderbar bar', consumed: true },
    { id: 7003, name: 'Clockwork gear', consumed: true },
    { id: 7003, name: 'Clockwork gear', consumed: true },
  ],
  skill: 'smithing', level: 55, xp: 60, station: 'anvil',
  description: 'Alloy cinderbar with clockwork gears. Feeds shot-caster and master-forge projects.',
});

rel.defineCombination(97503, {
  resultName: 'Piston assembly',
  inputs: [
    { id: 7004, name: 'Steam valve', consumed: true },
    { id: 7004, name: 'Steam valve', consumed: true },
    { id: 97010, name: 'Tinker-yards scrap', consumed: true },
    { id: 97501, name: 'Cinderbar bar', consumed: true },
  ],
  skill: 'crafting', level: 50, xp: 42, station: 'workbench',
  description: 'Bolt two steam valves into a piston housing. Pump Station upkeep + quest items.',
});

rel.defineCombination(97504, {
  resultName: 'Shot-caster (assembled)',
  inputs: [
    { id: 97031, name: 'Blackroot logs', consumed: true },
    { id: 97501, name: 'Cinderbar bar', consumed: true },
    { id: 97011, name: 'Spring-coils', consumed: true },
  ],
  skill: 'fletching', level: 60, xp: 50,
  description: 'Assemble shot-caster. Part fletch, part smith. Industrial ranged weapon.',
});

rel.defineCombination(97505, {
  resultName: 'Soot-cant scroll',
  inputs: [{ id: 97070, name: 'Forge-crystal', consumed: true }],
  skill: 'runecrafting', level: 25, xp: 14,
  description: 'Etch a soot-cant scroll at the Soot-Library. Industrial rune equivalent.',
});

rel.defineCombination(97506, {
  resultName: 'Pipe-brew',
  inputs: [
    { id: 97020, name: 'Pipe-fungus', consumed: true },
    { id: 97021, name: 'Oil-moss', consumed: true },
    { id: 90005, name: 'Vial of water', consumed: true },
  ],
  skill: 'herblore', level: 18, xp: 46,
  description: 'Rust-Pits herblore. Pipe-brew cures soot-cough and gives +2 mining temporarily.',
});

rel.defineCombination(97507, {
  resultName: 'Vent-bloom brew',
  inputs: [
    { id: 97022, name: 'Vent-bloom', consumed: true },
    { id: 97061, name: 'Pilgrim medallion', consumed: true },
    { id: 90005, name: 'Vial of water', consumed: true },
  ],
  skill: 'herblore', level: 70, xp: 110,
  description: 'Distil vent-bloom with pilgrim brass. Prayer-restore brew. Sootworks super-restore analog.',
});

rel.defineCombination(97508, {
  resultName: 'Dwarven stout (4)',
  inputs: [
    { id: 97050, name: "Brewer's barley", consumed: true },
    { id: 97050, name: "Brewer's barley", consumed: true },
    { id: 90002, name: 'Clay', consumed: true },
  ],
  skill: 'cooking', level: 45, xp: 80, station: 'pressure_pot',
  description: 'Brew dwarven stout in the pressure-pot. +1 mining / smithing stat boost.',
});

rel.defineCombination(97509, {
  resultName: 'Steam-cured cave-fish',
  inputs: [{ id: 97042, name: 'Cave-fish', consumed: true }],
  skill: 'cooking', level: 65, xp: 170, station: 'boil_floor',
  description: 'Steam-cure cave-fish on the Boil-Floor. Heals 20 HP. Endgame sootworks food.',
});

rel.defineCombination(97510, {
  resultName: 'Imbued gear-token',
  inputs: [
    { id: 97501, name: 'Cinderbar bar', consumed: true },
    { id: 97071, name: 'Soot-cant scroll', consumed: true },
    { id: 97071, name: 'Soot-cant scroll', consumed: true },
    { id: 97071, name: 'Soot-cant scroll', consumed: true },
  ],
  skill: 'magic', level: 70, xp: 95,
  description: 'Press imbue-runes into cinderbar. Gear-bound charm. Premium Sootworks magic output.',
});

// ══════════════════════════════════════════════════════════════════════════════
// SOOTWORKS QUIRKY INTERACTIONS (low-XP, high-flavor)
// ══════════════════════════════════════════════════════════════════════════════

rel.defineTrainingMethod('quirky_sootworks_bellows_pump', {
  skill: 'strength',
  name: '[Quirky] Pump the Cathedral Bellows',
  levelRange: [1, 99],
  xpPerHour: 2200,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['sootworks'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'high',
  inputs: [],
  description: 'Work the Forge Cathedral bellows. Arm burns. The smiths nod. Tiny strength XP.',
  location: 'Sootworks',
});

rel.defineTrainingMethod('quirky_sootworks_chantbook_reading', {
  skill: 'prayer',
  name: '[Quirky] Read the Chantbook',
  levelRange: [1, 99],
  xpPerHour: 1900,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['sootworks'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'low',
  inputs: [],
  description: 'Read the Brass Choir chantbook. Soft prayer ticks. The pipes mutter along.',
  location: 'Sootworks',
});

rel.defineTrainingMethod('quirky_sootworks_lantern_lighting', {
  skill: 'firemaking',
  name: '[Quirky] Relight the Shaft Lanterns',
  levelRange: [1, 99],
  xpPerHour: 2400,
  prerequisites: { skills: {}, quests: [], items: [{ name: 'Tinderbox' }], areas: ['sootworks'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'medium',
  inputs: [],
  description: 'Walk the shaft and relight the lanterns one by one. Soot-smoke work. Tiny firemaking XP.',
  location: 'Sootworks',
});

rel.defineTrainingMethod('quirky_sootworks_valve_spin', {
  skill: 'agility',
  name: '[Quirky] Spin the Pump Valves',
  levelRange: [1, 99],
  xpPerHour: 1800,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['sootworks'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'medium',
  inputs: [],
  description: 'Spin the surface valves for the pump-boys. Arms and legs both. Tiny agility XP.',
  location: 'Sootworks',
});

rel.defineTrainingMethod('quirky_sootworks_gear_grease', {
  skill: 'crafting',
  name: '[Quirky] Grease the Tinker Yard Gears',
  levelRange: [1, 99],
  xpPerHour: 1600,
  prerequisites: { skills: {}, quests: [], items: [{ name: 'Oil-moss' }], areas: ['sootworks'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'low',
  inputs: [],
  description: 'Grease the Tinker Yard gears with oil-moss. Tiny crafting XP. The gnomes thank you in silence.',
  location: 'Sootworks',
});

console.log('[aelgard] Sootworks Deep loaded: 30 training methods, 10 quests, 7 breakpoints, 10 recipes, 5 quirky interactions');
