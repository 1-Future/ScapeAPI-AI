// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Sootworks Tertiary (500-hour content)
//
// Voice: short, soot-mouthed, tool-noun-heavy. Dwarven industrial. Craft-cant.
// Labor history. Pratchett's Low King crossed with Ted Hughes. "Forge here.
// Quench there. Mind the cinder." The guilds argue over who invented the rivet.
//
// Specific landmarks:
//   - The Forge Cathedral (communal smithing, Forgemaster Brun)
//   - Pump Eight (agility course — pipes + valves)
//   - The Soot-Library (runecrafting from forge-crystal scrolls)
//   - The Brass Choir (prayer — industrial sermons)
//   - The Deep Stone Alloy Works (smithing endgame)
//   - Cinder King's Graveyard (slayer — clockwork constructs gone wrong)
//   - The Beggars' Gallery (thieving)
//
// Target: push Sootworks gap score 49 → 90+ by adding obscure, tool-specific,
// guild-argued tertiary content — the stuff 500-hour dwarves whisper about.
//
// This file adds:
//   - 26 top-tier training methods (caps to 99)
//   - 15 obscure maximum-attention methods (3x XP/hr w/ oddly specific reqs)
//   - 15 quirky interactions (industrial flavor XP trickles)
//   - 10 guild-reagent combinations (rivets, stamps, pins)
//
// All methods carry the Marstead 8 knobs. No XP-only quests.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const rel = require('../../data/relationships');

// ══════════════════════════════════════════════════════════════════════════════
// SOOTWORKS TERTIARY EXPORTS — items only tertiary methods produce
// Item IDs in the 97700-97899 range (clean tertiary block).
// ══════════════════════════════════════════════════════════════════════════════

rel.registerItemSource(97701, { type: 'gathering', sourceId: 'sootworks_forgemaster_slag', sourceName: 'Forgemaster Brun Quench-Trough', region: 'sootworks', details: "Forgemaster's slag-scurf. Scraped from Brun's quench trough between shift-bells. Master-smith reagent.", obscure: true });
rel.registerItemSource(97702, { type: 'gathering', sourceId: 'sootworks_pump_eight_rivet', sourceName: 'Pump Eight Rivet Bucket', region: 'sootworks', details: 'Pump Eight rivets. Only salvageable between valve-cycles. Guilds argue over who invented them first.', obscure: true });
rel.registerItemSource(97703, { type: 'gathering', sourceId: 'sootworks_brass_choir_ember', sourceName: 'Brass Choir Pipe-Ember', region: 'sootworks', details: 'Pipe-embers from the Brass Choir organ. Glow while the hymn is sung. Prayer reagent.', obscure: true });
rel.registerItemSource(97704, { type: 'gathering', sourceId: 'sootworks_deep_stone_alloyworks', sourceName: 'Deep Stone Alloy Works Scale', region: 'sootworks', details: 'Deep-stone scale. Flakes off the alloy-works crucible. Endgame smithing flux.', obscure: true });
rel.registerItemSource(97705, { type: 'gathering', sourceId: 'sootworks_cinder_king_graveyard', sourceName: "Cinder King's Graveyard Cog-Bone", region: 'sootworks', details: 'Cog-bone. Skeletal clockwork remains. Slayer-exclusive. Rattles when the furnace hums.', obscure: true });
rel.registerItemSource(97706, { type: 'gathering', sourceId: 'sootworks_beggars_gallery_brass', sourceName: "Beggars' Gallery Brass Button", region: 'sootworks', details: 'Pickpocketed brass buttons. The Gallery beggars sew them into hem-lines. Thieving reagent.', obscure: true });
rel.registerItemSource(97707, { type: 'gathering', sourceId: 'sootworks_soot_library_ink', sourceName: 'Soot-Library Forge-Crystal Ink', region: 'sootworks', details: 'Ground forge-crystal in oil-moss oil. Library archivist mixes it in silence. Scroll-ink reagent.', obscure: true });
rel.registerItemSource(97708, { type: 'gathering', sourceId: 'sootworks_cathedral_bell_soot', sourceName: 'Forge Cathedral Bell-Soot', region: 'sootworks', details: "Bell-soot scraped from the Cathedral's shift-bell. Rings three times a day. Rare between rings.", obscure: true });
rel.registerItemSource(97709, { type: 'gathering', sourceId: 'sootworks_pump_eight_grease', sourceName: 'Pump Eight Valve Grease', region: 'sootworks', details: 'Old grease from Pump Eight valve-collars. Dark amber. Fletching + crafting reagent.', obscure: true });
rel.registerItemSource(97710, { type: 'gathering', sourceId: 'sootworks_cinder_king_ash', sourceName: "Cinder King's Ash-Pit", region: 'sootworks', details: "Ash from the Cinder King's own pit. Only smouldering on anniversary of his fall. Once per game-year.", obscure: true });
rel.registerItemSource(97711, { type: 'gathering', sourceId: 'sootworks_deep_stone_flux', sourceName: 'Deep Stone Flux Crucible', region: 'sootworks', details: 'Poured flux. The Deep Stone works use it to seal master-bars. Smithing endgame consumable.', obscure: true });
rel.registerItemSource(97712, { type: 'gathering', sourceId: 'sootworks_brass_choir_lung', sourceName: 'Brass Choir Lung-Bellows', region: 'sootworks', details: 'Lung-bellow sinew. Only cut from retired organ pipes. Prayer reagent stacks with ember.', obscure: true });
rel.registerItemSource(97713, { type: 'drop', sourceId: 'sootworks_heretic_cog', sourceName: 'Heretic Cog', region: 'sootworks', details: "Cog stamped with the Heretic's mark. Drops from runaway golems. Fletching + smithing reagent.", obscure: true });
rel.registerItemSource(97714, { type: 'shop', sourceId: 'sootworks_forgemaster_stamp_shop', sourceName: 'Forgemaster Stamp Shop', region: 'sootworks', details: 'Forgemaster stamp. Brun sells one per in-game week. Stamp presses a bar into master-grade.', obscure: true });
rel.registerItemSource(97715, { type: 'gathering', sourceId: 'sootworks_pump_eight_whistle', sourceName: 'Pump Eight Whistle-Brass', region: 'sootworks', details: 'Whistle-brass. Collected from spent whistle-shells along the Pump Eight course. Agility reagent.', obscure: true });

// ══════════════════════════════════════════════════════════════════════════════
// TOP-TIER TRAINING METHODS — cap at 99 across the guild-anchored skills
// ══════════════════════════════════════════════════════════════════════════════

rel.defineTrainingMethod('sootworks_deep_stone_alloyworks_smithing', {
  skill: 'smithing', name: 'Deep Stone Alloy Works',
  levelRange: [85, 99],
  xpPerHour: 175000,
  prerequisites: { skills: { smithing: 85 }, quests: ['the_quenchmasters_last_order', 'the_deep_stone_charter'], items: [{ name: 'Forgemaster stamp' }], areas: ['sootworks_deep_stone_works'] },
  resourceOutput: { produces: [{ name: 'Deep-stone master bar', perHour: 14 }, { name: 'Alloy-works commendation', perHour: 1 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 42000,
  danger: 'none', complexity: 'complex', attention: 'medium',
  inputs: [{ name: 'Cinderbar bar', perHour: 140, source: 'smithing' }, { name: 'Deep-stone flux', perHour: 70, source: 'sootworks_deep_stone_flux' }],
  description: 'Stamp master bars at the Deep Stone Alloy Works. Brun watches. Flux in the seam. Mind the cinder.',
  location: 'Sootworks',
  breakpointAt: 85,
});

rel.defineTrainingMethod('sootworks_forge_cathedral_commission', {
  skill: 'smithing', name: 'Forge Cathedral Commissions',
  levelRange: [80, 99],
  xpPerHour: 165000,
  prerequisites: { skills: { smithing: 80 }, quests: ['the_forgemaster_contract'], items: [], areas: ['sootworks_forge_cathedral'] },
  resourceOutput: { produces: [{ name: 'Cathedral-stamped platebody', perHour: 10 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 28000,
  danger: 'none', complexity: 'moderate', attention: 'low',
  inputs: [{ name: 'Gear-train steel', perHour: 50, source: 'smithing' }, { name: 'Clockwork gear', perHour: 120, source: 'sootworks_clockwork_sentry' }],
  description: 'Take commissions at the Cathedral. Brun stamps the good ones. The apprentices keep time on the anvil.',
  location: 'Sootworks',
  breakpointAt: 80,
});

rel.defineTrainingMethod('sootworks_pump_eight_elite', {
  skill: 'agility', name: 'Pump Eight Elite Circuit',
  levelRange: [80, 99],
  xpPerHour: 95000,
  prerequisites: { skills: { agility: 80 }, quests: ['pump_eight_stops', 'the_whistle_and_the_valve'], items: [{ name: "Pumpman's wrench" }], areas: ['sootworks_pump_station'] },
  resourceOutput: { produces: [{ name: 'Marks of grace', perHour: 44 }, { name: 'Whistle-brass', perHour: 60 }], net: 'profit' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'high', complexity: 'complex', attention: 'high',
  inputs: [],
  description: "Eight pumps, eight valves, eight whistles. One missed beat scalds a shin. Pumpman's wrench gets you past the gate.",
  location: 'Sootworks',
  breakpointAt: 80,
});

rel.defineTrainingMethod('sootworks_soot_library_archive', {
  skill: 'runecrafting', name: 'Soot-Library Archive Etching',
  levelRange: [77, 99],
  xpPerHour: 58000,
  prerequisites: { skills: { runecrafting: 77 }, quests: ['the_soot_library_keys', 'the_archivists_ledger'], items: [], areas: ['sootworks_library_stacks'] },
  resourceOutput: { produces: [{ name: 'Archive scroll', perHour: 2400 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Forge-crystal', perHour: 2400, source: 'sootworks_forge_crystal_vein' }, { name: 'Forge-crystal ink', perHour: 400, source: 'sootworks_soot_library_ink' }],
  description: "The archive bench. Crystal on the left, ink on the right. Archivist doesn't talk; the pipes do.",
  location: 'Sootworks',
  breakpointAt: 77,
});

rel.defineTrainingMethod('sootworks_brass_choir_grand_sermon', {
  skill: 'prayer', name: 'Brass Choir Grand Sermon',
  levelRange: [75, 99],
  xpPerHour: 345000,
  prerequisites: { skills: { prayer: 75 }, quests: ['the_iron_tongue_heresy', 'the_organ_mass'], items: [{ name: 'Pipe-ember censer' }], areas: ['sootworks_brass_choir'] },
  resourceOutput: { produces: [], net: 'loss' },
  bankingFrequency: 'frequent', costPerHour: 14000,
  danger: 'none', complexity: 'simple', attention: 'medium',
  inputs: [{ name: 'Dragon bones', perHour: 820, source: 'slayer' }, { name: 'Pipe-ember', perHour: 220, source: 'sootworks_brass_choir_ember' }],
  description: "The organ thunders. Embers lit, bones on the pipe-altar. Fastest Sootworks prayer. Industrial. Loud. Clean.",
  location: 'Sootworks',
  breakpointAt: 75,
});

rel.defineTrainingMethod('sootworks_cinder_king_slayer', {
  skill: 'slayer', name: "Cinder King's Graveyard Contracts",
  levelRange: [85, 99],
  xpPerHour: 72000,
  prerequisites: { skills: { slayer: 85, defence: 75 }, quests: ['the_cinder_kings_fall'], items: [{ name: 'Cog-bone charm' }], areas: ['sootworks_cinder_graveyard'] },
  resourceOutput: { produces: [{ name: 'Cog-bone', perHour: 280 }, { name: 'Clockwork heart', perHour: 0.4 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 27000,
  danger: 'high', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Sootworks super-restore', perHour: 6, source: 'herblore' }, { name: 'Steam-cured cave-fish', perHour: 40, source: 'cooking' }],
  description: "The Cinder King's rusted subjects walk at night. Iron-Tongue issues the task. Cog-bone charm against their chant.",
  location: 'Sootworks',
  breakpointAt: 85,
});

rel.defineTrainingMethod('sootworks_beggars_gallery_master_lift', {
  skill: 'thieving', name: "Beggars' Gallery Master Lift",
  levelRange: [80, 99],
  xpPerHour: 290000,
  prerequisites: { skills: { thieving: 80 }, quests: ['beggars_gallery_after_hours', 'the_quartermasters_accounts'], items: [{ name: 'Quartermaster lockpick' }], areas: ['sootworks_beggars_gallery'] },
  resourceOutput: { produces: [{ name: 'Gold coins', perHour: 165000 }, { name: 'Brass button', perHour: 80 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 0,
  danger: 'medium', complexity: 'complex', attention: 'high',
  inputs: [],
  description: "The real Gallery route: clerk, quartermaster, factor, banker. The beggars watch. No one gets pinched twice.",
  location: 'Sootworks',
  breakpointAt: 80,
});

rel.defineTrainingMethod('sootworks_heretic_shot_caster_range', {
  skill: 'ranged', name: 'Heretic Shot-Caster Range',
  levelRange: [80, 99],
  xpPerHour: 115000,
  prerequisites: { skills: { ranged: 80, smithing: 60 }, quests: ['the_clockwork_heretic'], items: [{ name: "Heretic's shot-caster" }], areas: ['sootworks_tinker_yards'] },
  resourceOutput: { produces: [{ name: 'Heretic cog', perHour: 35 }, { name: 'Gold coins', perHour: 48000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 38000,
  danger: 'medium', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Shot munitions', perHour: 2400, source: 'smithing' }, { name: 'Steam-cured cave-fish', perHour: 25, source: 'cooking' }],
  description: "The Heretic's own bore. Higher rate of fire, cog feed. Pay the munitions bill. Tinker Yards endgame ranged.",
  location: 'Sootworks',
  breakpointAt: 80,
});

rel.defineTrainingMethod('sootworks_imbue_hall_magic', {
  skill: 'magic', name: 'Imbue Hall Master Press',
  levelRange: [82, 99],
  xpPerHour: 285000,
  prerequisites: { skills: { magic: 82, smithing: 70 }, quests: ['the_clockwork_heretic', 'the_master_press_ledger'], items: [], areas: ['sootworks_imbue_hall'] },
  resourceOutput: { produces: [{ name: 'Master imbue-token', perHour: 52 }, { name: 'Gold coins', perHour: 145000 }], net: 'profit' },
  bankingFrequency: 'frequent', costPerHour: 88000,
  danger: 'low', complexity: 'complex', attention: 'maximum',
  inputs: [{ name: 'Archive scroll', perHour: 1400, source: 'sootworks_soot_library_archive' }, { name: 'Cinderbar bar', perHour: 52, source: 'smithing' }],
  description: "The Imbue Hall. Press cycles every ten ticks. Archive scrolls, not field scrolls. Master-stamped. Best sootworks magic.",
  location: 'Sootworks',
  breakpointAt: 82,
});

rel.defineTrainingMethod('sootworks_cathedral_crafting_bench', {
  skill: 'crafting', name: 'Forge Cathedral Master Bench',
  levelRange: [80, 99],
  xpPerHour: 255000,
  prerequisites: { skills: { crafting: 80 }, quests: ['the_forgemaster_contract'], items: [{ name: 'Forgemaster stamp' }], areas: ['sootworks_forge_cathedral'] },
  resourceOutput: { produces: [{ name: 'Cathedral-stamped ornament', perHour: 720 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 8000,
  danger: 'none', complexity: 'moderate', attention: 'low',
  inputs: [{ name: 'Gold bar', perHour: 720, source: 'smithing' }, { name: 'Sapphire', perHour: 240, source: 'mining' }],
  description: "The Cathedral master bench. Never a queue. Brun stamps the ornament when you pass. The light's fine.",
  location: 'Sootworks',
  breakpointAt: 80,
});

rel.defineTrainingMethod('sootworks_rust_pits_master_still', {
  skill: 'herblore', name: 'Rust-Pits Master Still',
  levelRange: [85, 99],
  xpPerHour: 320000,
  prerequisites: { skills: { herblore: 85 }, quests: ['the_clockwork_heretic', 'the_master_brewers_charter'], items: [], areas: ['sootworks_rust_pits'] },
  resourceOutput: { produces: [{ name: 'Master pipe-brew (4)', perHour: 180 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 52000,
  danger: 'none', complexity: 'complex', attention: 'medium',
  inputs: [{ name: 'Vent-bloom', perHour: 180, source: 'sootworks_vent_bloom' }, { name: 'Lung-bellow sinew', perHour: 180, source: 'sootworks_brass_choir_lung' }],
  description: "The Rust-Pits master still. Vent-bloom with brass-pipe lung. Sootworks super-combat tier. Old recipe. Older still.",
  location: 'Sootworks',
  breakpointAt: 85,
});

rel.defineTrainingMethod('sootworks_lantern_mine_master_seam', {
  skill: 'mining', name: 'Lantern Mine Master Seam',
  levelRange: [85, 99],
  xpPerHour: 145000,
  prerequisites: { skills: { mining: 85 }, quests: ['the_quenchmasters_last_order'], items: [{ name: "Pumpman's wrench" }], areas: ['sootworks_lantern_mines'] },
  resourceOutput: { produces: [{ name: 'Runite ore', perHour: 75 }, { name: 'Lantern-coal', perHour: 260 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'low', complexity: 'simple', attention: 'low',
  inputs: [],
  description: "Master-seam runite. Only cuts when the lantern-mine seam is lit by a warranted fire-caster. Forgemaster signs the pass.",
  location: 'Sootworks',
  breakpointAt: 85,
});

rel.defineTrainingMethod('sootworks_deepwell_harpoon_fishing', {
  skill: 'fishing', name: 'Deepwell Harpoon Line',
  levelRange: [82, 99],
  xpPerHour: 118000,
  prerequisites: { skills: { fishing: 82 }, quests: ['geyser_bridge', 'the_deepwell_warrant'], items: [{ name: 'Master harpoon' }], areas: ['sootworks_deepwell'] },
  resourceOutput: { produces: [{ name: 'Deepwell cave-shark', perHour: 160 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'low', complexity: 'moderate', attention: 'medium',
  inputs: [],
  description: "Master harpoon line in the deep. The cave-shark is pale. The line sings. Heals 24 when cured on the Boil-Floor.",
  location: 'Sootworks',
  breakpointAt: 82,
});

rel.defineTrainingMethod('sootworks_pressure_pot_feast', {
  skill: 'cooking', name: 'Pressure-Pot Feast Kitchen',
  levelRange: [80, 99],
  xpPerHour: 440000,
  prerequisites: { skills: { cooking: 80 }, quests: ['geyser_bridge', 'the_guild_feast'], items: [], areas: ['sootworks_feast_kitchen'] },
  resourceOutput: { produces: [{ name: 'Guild feast dish', perHour: 380 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 18000,
  danger: 'none', complexity: 'moderate', attention: 'low',
  inputs: [{ name: 'Deepwell cave-shark', perHour: 380, source: 'sootworks_deepwell_harpoon_fishing' }],
  description: "The guild feast kitchen. Pressure-pot rotation. The steward calls the plates. Nobody burns a dish here.",
  location: 'Sootworks',
  breakpointAt: 80,
});

rel.defineTrainingMethod('sootworks_deep_coal_master_burn', {
  skill: 'firemaking', name: 'Deep-Coal Master Burn (Gilded)',
  levelRange: [85, 99],
  xpPerHour: 385000,
  prerequisites: { skills: { firemaking: 85 }, quests: ['the_clockwork_heretic', 'the_gilded_bellows'], items: [{ name: "Heretic's bellows (gilded)" }], areas: ['sootworks_deep_furnace'] },
  resourceOutput: { produces: [{ name: 'Gilded furnace-token', perHour: 340 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'medium', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Blackroot logs', perHour: 1600, source: 'sootworks_blackroot_stand' }, { name: 'Deep coal', perHour: 520, source: 'sootworks_lantern_seam' }],
  description: "The deep furnace, gilded. Bellows upgraded, the burn goes white. Peak firemaking XP in Aelgard, just past Heretic's Bellows.",
  location: 'Sootworks',
  breakpointAt: 85,
});

rel.defineTrainingMethod('sootworks_blackroot_master_cutting', {
  skill: 'woodcutting', name: 'Blackroot Master Copse',
  levelRange: [75, 99],
  xpPerHour: 135000,
  prerequisites: { skills: { woodcutting: 75 }, quests: ['the_foresters_warrant'], items: [{ name: 'Forgemaster stamp' }], areas: ['sootworks_master_copse'] },
  resourceOutput: { produces: [{ name: 'Blackroot logs', perHour: 220 }, { name: 'Lantern-sap', perHour: 110 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'simple', attention: 'low',
  inputs: [],
  description: "The master copse. Stamped trees only. Lantern-sap runs heavier here. The forester counts rings.",
  location: 'Sootworks',
  breakpointAt: 75,
});

rel.defineTrainingMethod('sootworks_steamfield_master_rotation', {
  skill: 'farming', name: 'Steam-Field Master Rotation',
  levelRange: [80, 99],
  xpPerHour: 155000,
  prerequisites: { skills: { farming: 80 }, quests: ['the_tray_keepers_list'], items: [], areas: ['sootworks_steamfield'] },
  resourceOutput: { produces: [{ name: 'Master lantern-lichen', perHour: 85 }, { name: 'Steam-field harvest mark', perHour: 22 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 7500,
  danger: 'none', complexity: 'moderate', attention: 'low',
  inputs: [{ name: 'Tray seeds', perHour: 20, source: 'shop' }],
  description: "The tray-keeper hands over the master rotation. Three-crop cycle, steam kept even. Yield jumps when the rotation's right.",
  location: 'Sootworks',
  breakpointAt: 80,
});

rel.defineTrainingMethod('sootworks_tinker_master_fletching', {
  skill: 'fletching', name: 'Tinker Yards Master Assembly',
  levelRange: [80, 99],
  xpPerHour: 275000,
  prerequisites: { skills: { fletching: 80 }, quests: ['the_tinkers_charter'], items: [], areas: ['sootworks_tinker_yards'] },
  resourceOutput: { produces: [{ name: 'Master shot-caster', perHour: 240 }], net: 'profit' },
  bankingFrequency: 'frequent', costPerHour: 25000,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Blackroot logs', perHour: 960, source: 'sootworks_blackroot_stand' }, { name: 'Cinderbar bar', perHour: 240, source: 'smithing' }],
  description: "The master assembly line. Tinker-Charter stamped. Every piece signed. Best fletching in Sootworks.",
  location: 'Sootworks',
  breakpointAt: 80,
});

rel.defineTrainingMethod('sootworks_clockbeetle_master_runs', {
  skill: 'hunter', name: 'Clockbeetle Master Runs',
  levelRange: [80, 99],
  xpPerHour: 245000,
  prerequisites: { skills: { hunter: 80 }, quests: ['the_beetlekeepers_signet'], items: [{ name: "Beetlekeeper's signet" }], areas: ['sootworks_clockbeetle_warrens'] },
  resourceOutput: { produces: [{ name: 'Clockbeetle master shell', perHour: 120 }, { name: 'Gold coins', perHour: 32000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'complex', attention: 'high',
  inputs: [],
  description: "The Beetlekeeper marks your circuit at shift-bell. By third bell you know every warren. Master shells feed the best plate inlay.",
  location: 'Sootworks',
  breakpointAt: 80,
});

rel.defineTrainingMethod('sootworks_heat_temper_master_defence', {
  skill: 'defence', name: 'Heat-Temper Master Plate',
  levelRange: [80, 99],
  xpPerHour: 195000,
  prerequisites: { skills: { defence: 80 }, quests: ['the_forgemaster_contract'], items: [{ name: 'Forgemaster stamp' }], areas: ['sootworks_forge_cathedral'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'rare', costPerHour: 0,
  danger: 'low', complexity: 'moderate', attention: 'low',
  inputs: [{ name: 'Steam-cured cave-fish', perHour: 22, source: 'cooking' }],
  description: "Stand under the master drop-forge. The plate learns deeper. Brun nods when it quenches right. Best passive Sootworks defence.",
  location: 'Sootworks',
  breakpointAt: 80,
});

rel.defineTrainingMethod('sootworks_cinder_graveyard_wardens', {
  skill: 'defence', name: "Cinder Graveyard Warden Wall",
  levelRange: [82, 99],
  xpPerHour: 210000,
  prerequisites: { skills: { defence: 82 }, quests: ['the_cinder_kings_fall'], items: [{ name: 'Cog-bone charm' }], areas: ['sootworks_cinder_graveyard'] },
  resourceOutput: { produces: [{ name: 'Cog-bone', perHour: 90 }], net: 'neutral' },
  bankingFrequency: 'moderate', costPerHour: 28000,
  danger: 'high', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Steam-cured cave-fish', perHour: 25, source: 'cooking' }],
  description: "Stand the warden wall at the Graveyard gate. Clockwork revenants break on you in waves. Charm at neck. Shield heats. The walls listen.",
  location: 'Sootworks',
  breakpointAt: 82,
});

rel.defineTrainingMethod('sootworks_forge_apprentice_hitpoints', {
  skill: 'hitpoints', name: 'Forge Apprentice Heat-Bath',
  levelRange: [75, 99],
  xpPerHour: 68000,
  prerequisites: { skills: { hitpoints: 75 }, quests: ['the_forgemaster_contract'], items: [{ name: 'Forgemaster stamp' }], areas: ['sootworks_forge_cathedral'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 2000,
  danger: 'low', complexity: 'trivial', attention: 'low',
  inputs: [{ name: 'Wet cloth', perHour: 8, source: 'sootworks_apothecary' }],
  description: "The apprentice heat-bath at the Cathedral. Steam off the quench-trough. Wrap in wet cloth. AFK HP. Brun won't notice unless you snore.",
  location: 'Sootworks',
  breakpointAt: 75,
});

rel.defineTrainingMethod('sootworks_library_rune_imbue_combo', {
  skill: 'runecrafting', name: 'Library-Imbue Combination',
  levelRange: [85, 99],
  xpPerHour: 285000,
  prerequisites: { skills: { runecrafting: 85, magic: 70 }, quests: ['the_archivists_ledger', 'the_master_press_ledger'], items: [], areas: ['sootworks_library_stacks'] },
  resourceOutput: { produces: [{ name: 'Master imbue-stock', perHour: 420 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'complex', attention: 'medium',
  inputs: [{ name: 'Forge-crystal', perHour: 2100, source: 'sootworks_forge_crystal_vein' }, { name: 'Cinderbar bar', perHour: 70, source: 'smithing' }],
  description: "The archivist and the press-master share a bench once a week. Craft and imbue in one motion. Best runecrafting in Sootworks.",
  location: 'Sootworks',
  breakpointAt: 85,
});

rel.defineTrainingMethod('sootworks_deep_mines_master', {
  skill: 'mining', name: 'Deep Mines Master Tunnel',
  levelRange: [85, 99],
  xpPerHour: 165000,
  prerequisites: { skills: { mining: 85 }, quests: ['the_quenchmasters_last_order'], items: [{ name: "Pumpman's master wrench" }], areas: ['sootworks_deep_mines'] },
  resourceOutput: { produces: [{ name: 'Runite ore', perHour: 95 }, { name: 'Deep coal', perHour: 320 }, { name: 'Cinderbar ore', perHour: 140 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'low', complexity: 'moderate', attention: 'medium',
  inputs: [],
  description: "The master tunnel. Only open to wrenches signed by Brun. Runite, deep coal, cinderbar all in one circuit. Best Sootworks mining.",
  location: 'Sootworks',
  breakpointAt: 85,
});

rel.defineTrainingMethod('sootworks_tinker_workshop_attack', {
  skill: 'attack', name: 'Tinker Workshop Combat Drills',
  levelRange: [80, 99],
  xpPerHour: 125000,
  prerequisites: { skills: { attack: 80 }, quests: ['the_tinkers_charter'], items: [], areas: ['sootworks_tinker_yards'] },
  resourceOutput: { produces: [{ name: 'Training dummy scrap', perHour: 220 }], net: 'neutral' },
  bankingFrequency: 'rare', costPerHour: 0,
  danger: 'low', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Steam-cured cave-fish', perHour: 20, source: 'cooking' }],
  description: "The Tinker Workshop runs combat drills against clockwork dummies. Scrap piles up. Attack only. The dummies learn each shift.",
  location: 'Sootworks',
  breakpointAt: 80,
});

rel.defineTrainingMethod('sootworks_alloyworks_strength', {
  skill: 'strength', name: 'Alloy Works Hammer Rota',
  levelRange: [85, 99],
  xpPerHour: 155000,
  prerequisites: { skills: { strength: 85 }, quests: ['the_deep_stone_charter'], items: [{ name: 'Deep Stone apron' }], areas: ['sootworks_deep_stone_works'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'rare', costPerHour: 5000,
  danger: 'low', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Dwarven stout', perHour: 6, source: 'cooking' }],
  description: "The Alloy Works hammer rota. Heaviest sledge in Sootworks. Apron on. Swing rotates every three ticks. Arms burn clean.",
  location: 'Sootworks',
  breakpointAt: 85,
});

// ══════════════════════════════════════════════════════════════════════════════
// OBSCURE METHODS — 3x XP/hr, maximum attention, extremely specific reqs
// These are the ones 500-hour dwarves whisper about.
// ══════════════════════════════════════════════════════════════════════════════

rel.defineTrainingMethod('sootworks_shift_bell_chorus', {
  skill: 'strength', name: 'The Shift-Bell Chorus',
  levelRange: [70, 99],
  xpPerHour: 545000,
  prerequisites: {
    skills: { strength: 70 },
    quests: ['the_forgemaster_contract', 'the_shift_bell_pact'],
    items: [{ name: 'Forge Cathedral bell-soot' }, { name: 'Forgemaster stamp' }, { name: 'Bell-rope coil' }],
    areas: ['sootworks_forge_cathedral'],
  },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'intense', attention: 'maximum',
  inputs: [{ name: 'Bell-soot', perHour: 90, source: 'sootworks_cathedral_bell_soot' }],
  description: "Pull the shift-bell with soot on your wrists, stamp on your belt, coil against your chest. ONLY works at 06:00, 14:00, and 22:00 in-game. Miss the bell, miss the day.",
  location: 'Sootworks',
  breakpointAt: 70,
});

rel.defineTrainingMethod('sootworks_organ_mass_prayer', {
  skill: 'prayer', name: 'The Organ Mass',
  levelRange: [60, 99],
  xpPerHour: 1020000,
  prerequisites: {
    skills: { prayer: 60 },
    quests: ['the_iron_tongue_heresy', 'the_organ_mass'],
    items: [{ name: 'Dragon bones' }, { name: 'Pipe-ember censer' }, { name: 'Lung-bellow sinew' }],
    areas: ['sootworks_brass_choir'],
  },
  resourceOutput: { produces: [], net: 'loss' },
  bankingFrequency: 'never', costPerHour: 90000,
  danger: 'none', complexity: 'intense', attention: 'maximum',
  inputs: [{ name: 'Dragon bones', perHour: 600, source: 'slayer' }, { name: 'Pipe-ember', perHour: 600, source: 'sootworks_brass_choir_ember' }, { name: 'Lung-bellow sinew', perHour: 1, source: 'sootworks_brass_choir_lung' }],
  description: "The organ mass runs from 03:30 to 04:30 in-game. Censer lit, sinew braided, bones on the pipe-altar. The organ does the rest. Sprint the hour.",
  location: 'Sootworks',
  breakpointAt: 60,
});

rel.defineTrainingMethod('sootworks_pump_eight_shift_change', {
  skill: 'agility', name: 'Pump Eight Shift-Change Sprint',
  levelRange: [75, 99],
  xpPerHour: 285000,
  prerequisites: {
    skills: { agility: 75, strength: 60 },
    quests: ['pump_eight_stops', 'the_whistle_and_the_valve'],
    items: [{ name: "Pumpman's wrench" }, { name: 'Whistle-brass' }],
    areas: ['sootworks_pump_station'],
  },
  resourceOutput: { produces: [{ name: 'Marks of grace', perHour: 180 }], net: 'profit' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'high', complexity: 'intense', attention: 'maximum',
  inputs: [],
  description: "Pump Eight only opens between shifts — 05:55 to 06:05 in-game. Wrench in hand, whistle-brass on lanyard. The valves do not wait. One attempt.",
  location: 'Sootworks',
  breakpointAt: 75,
});

rel.defineTrainingMethod('sootworks_cinder_king_anniversary_slayer', {
  skill: 'slayer', name: "The Cinder King's Anniversary",
  levelRange: [85, 99],
  xpPerHour: 195000,
  prerequisites: {
    skills: { slayer: 85 },
    quests: ['the_cinder_kings_fall'],
    items: [{ name: "Cinder King's ash" }, { name: 'Cog-bone charm' }, { name: 'Archive scroll (ash-imbued)' }],
    areas: ['sootworks_cinder_graveyard'],
  },
  resourceOutput: { produces: [{ name: 'Cog-bone', perHour: 640 }, { name: 'Clockwork heart', perHour: 2.5 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 45000,
  danger: 'high', complexity: 'intense', attention: 'maximum',
  inputs: [{ name: "Cinder King's ash", perHour: 1, source: 'sootworks_cinder_king_ash' }, { name: 'Sootworks super-restore', perHour: 12, source: 'herblore' }],
  description: "The Cinder King's ash-pit smoulders once per in-game year. Ash on the charm, scroll ash-imbued. One full day of triple rate. Then the ash cools for a year.",
  location: 'Sootworks',
  breakpointAt: 85,
});

rel.defineTrainingMethod('sootworks_beggars_gallery_payday', {
  skill: 'thieving', name: "Beggars' Gallery Payday Lift",
  levelRange: [80, 99],
  xpPerHour: 870000,
  prerequisites: {
    skills: { thieving: 80 },
    quests: ['beggars_gallery_after_hours', 'the_quartermasters_accounts'],
    items: [{ name: 'Beggar-hem coat' }, { name: 'Quartermaster lockpick' }, { name: 'Brass button string' }],
    areas: ['sootworks_beggars_gallery'],
  },
  resourceOutput: { produces: [{ name: 'Gold coins', perHour: 245000 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 0,
  danger: 'medium', complexity: 'intense', attention: 'maximum',
  inputs: [],
  description: "Payday is the last in-game day of the month. Wear the coat AND the button-string AND carry the pick. The quartermasters are drunk. The banker is not. Move.",
  location: 'Sootworks',
  breakpointAt: 80,
});

rel.defineTrainingMethod('sootworks_archive_bench_midshift', {
  skill: 'runecrafting', name: 'Archive Mid-Shift Etching',
  levelRange: [80, 99],
  xpPerHour: 175000,
  prerequisites: {
    skills: { runecrafting: 80 },
    quests: ['the_soot_library_keys', 'the_archivists_ledger'],
    items: [{ name: 'Forge-crystal ink' }, { name: 'Archivist gauntlets' }, { name: 'Bell-soot sachet' }],
    areas: ['sootworks_library_stacks'],
  },
  resourceOutput: { produces: [{ name: 'Archive scroll', perHour: 3600 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'intense', attention: 'maximum',
  inputs: [{ name: 'Forge-crystal', perHour: 3600, source: 'sootworks_forge_crystal_vein' }],
  description: "The bench only sings between the second and third shift-bells (13:40 - 14:00 in-game). Ink, gauntlets, sachet, all on. The archivist opens the cabinet without a word.",
  location: 'Sootworks',
  breakpointAt: 80,
});

rel.defineTrainingMethod('sootworks_cathedral_quench_master', {
  skill: 'smithing', name: 'Cathedral Quench-Master Hour',
  levelRange: [85, 99],
  xpPerHour: 465000,
  prerequisites: {
    skills: { smithing: 85 },
    quests: ['the_quenchmasters_last_order', 'the_forgemaster_contract'],
    items: [{ name: "Quenchmaster's tongs" }, { name: 'Slag-scurf jar' }, { name: 'Forgemaster stamp' }],
    areas: ['sootworks_forge_cathedral'],
  },
  resourceOutput: { produces: [{ name: 'Master-grade platebody', perHour: 42 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 68000,
  danger: 'none', complexity: 'intense', attention: 'maximum',
  inputs: [{ name: 'Deep-stone master bar', perHour: 180, source: 'smithing' }, { name: 'Slag-scurf', perHour: 180, source: 'sootworks_forgemaster_slag' }],
  description: "Brun opens the quench-master hour once a day at 08:00 in-game. Tongs in left hand, jar in right. Every piece stamped. Pause once, lose the hour.",
  location: 'Sootworks',
  breakpointAt: 85,
});

rel.defineTrainingMethod('sootworks_deep_coal_dawn_fm', {
  skill: 'firemaking', name: 'Deep-Coal Dawn Burn',
  levelRange: [70, 99],
  xpPerHour: 1050000,
  prerequisites: {
    skills: { firemaking: 70, mining: 50 },
    quests: ['the_clockwork_heretic', 'the_gilded_bellows'],
    items: [{ name: "Heretic's bellows (gilded)" }, { name: 'Bell-soot sachet' }, { name: 'Master tinderbox' }],
    areas: ['sootworks_deep_furnace'],
  },
  resourceOutput: { produces: [{ name: 'Gilded furnace-token', perHour: 900 }], net: 'profit' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'medium', complexity: 'intense', attention: 'maximum',
  inputs: [{ name: 'Blackroot logs', perHour: 2200, source: 'sootworks_blackroot_stand' }, { name: 'Deep coal', perHour: 800, source: 'sootworks_lantern_seam' }],
  description: "The deep furnace only burns true from 04:30 to 05:15 in-game. Gilded bellows, bell-soot sachet on your belt, master tinderbox. Everything must be lit in sequence. Miss one: back of the queue for a day.",
  location: 'Sootworks',
  breakpointAt: 70,
});

rel.defineTrainingMethod('sootworks_imbue_hall_press_perfect', {
  skill: 'magic', name: 'Imbue Hall Press-Perfect Hour',
  levelRange: [85, 99],
  xpPerHour: 505000,
  prerequisites: {
    skills: { magic: 85, smithing: 70 },
    quests: ['the_clockwork_heretic', 'the_master_press_ledger'],
    items: [{ name: 'Forgemaster stamp' }, { name: 'Bell-soot sachet' }, { name: 'Heretic cog' }],
    areas: ['sootworks_imbue_hall'],
  },
  resourceOutput: { produces: [{ name: 'Master imbue-token', perHour: 140 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 145000,
  danger: 'low', complexity: 'intense', attention: 'maximum',
  inputs: [{ name: 'Archive scroll', perHour: 3500, source: 'sootworks_soot_library_archive' }, { name: 'Cinderbar bar', perHour: 140, source: 'smithing' }],
  description: "The Imbue Hall runs perfect only between 18:00 and 19:00 in-game. Stamp on the press, sachet on the dial, heretic cog seated. Tick-perfect. Skip a beat — press jams.",
  location: 'Sootworks',
  breakpointAt: 85,
});

rel.defineTrainingMethod('sootworks_deepwell_blood_moon_fishing', {
  skill: 'fishing', name: 'Deepwell Blood-Moon Line',
  levelRange: [85, 99],
  xpPerHour: 370000,
  prerequisites: {
    skills: { fishing: 85 },
    quests: ['geyser_bridge', 'the_deepwell_warrant'],
    items: [{ name: 'Master harpoon' }, { name: 'Deepwell warrant' }, { name: 'Pipe-ember lure' }],
    areas: ['sootworks_deepwell'],
  },
  resourceOutput: { produces: [{ name: 'Blood-moon cave-shark', perHour: 260 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'low', complexity: 'intense', attention: 'maximum',
  inputs: [{ name: 'Pipe-ember', perHour: 260, source: 'sootworks_brass_choir_ember' }],
  description: "Once per in-game month, the deepwell runs blood-moon red. Master harpoon, warrant on belt, lure in hand. Fish only bite when the deep-lamp dims. Ten-minute window.",
  location: 'Sootworks',
  breakpointAt: 85,
});

rel.defineTrainingMethod('sootworks_pressure_pot_feast_night', {
  skill: 'cooking', name: 'Pressure-Pot Feast Night',
  levelRange: [80, 99],
  xpPerHour: 920000,
  prerequisites: {
    skills: { cooking: 80 },
    quests: ['geyser_bridge', 'the_guild_feast'],
    items: [{ name: "Steward's ladle" }, { name: 'Guild feast apron' }, { name: 'Brass button string' }],
    areas: ['sootworks_feast_kitchen'],
  },
  resourceOutput: { produces: [{ name: 'Guild feast banquet', perHour: 640 }, { name: 'Steward commendation', perHour: 8 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 28000,
  danger: 'none', complexity: 'intense', attention: 'maximum',
  inputs: [{ name: 'Deepwell cave-shark', perHour: 640, source: 'sootworks_deepwell_harpoon_fishing' }],
  description: "The guild feast only runs on in-game Saturday nights. Ladle, apron, button-string all on. The steward calls the plates and the pot whistles every four ticks.",
  location: 'Sootworks',
  breakpointAt: 80,
});

rel.defineTrainingMethod('sootworks_tinker_master_dawn_fletching', {
  skill: 'fletching', name: 'Tinker Master Dawn Assembly',
  levelRange: [85, 99],
  xpPerHour: 560000,
  prerequisites: {
    skills: { fletching: 85, smithing: 60 },
    quests: ['the_tinkers_charter', 'the_dawn_assembly'],
    items: [{ name: 'Forgemaster stamp' }, { name: 'Tinker master-pin' }, { name: 'Grease-pot (Pump Eight)' }],
    areas: ['sootworks_tinker_yards'],
  },
  resourceOutput: { produces: [{ name: 'Master shot-caster (dawn-stamp)', perHour: 480 }], net: 'profit' },
  bankingFrequency: 'frequent', costPerHour: 38000,
  danger: 'none', complexity: 'intense', attention: 'maximum',
  inputs: [{ name: 'Blackroot logs', perHour: 1920, source: 'sootworks_blackroot_stand' }, { name: 'Cinderbar bar', perHour: 480, source: 'smithing' }, { name: 'Valve grease', perHour: 100, source: 'sootworks_pump_eight_grease' }],
  description: "Dawn assembly only signs off between first and second shift-bell. Stamp in left, pin in right, grease-pot at your elbow. Every piece dawn-stamped.",
  location: 'Sootworks',
  breakpointAt: 85,
});

rel.defineTrainingMethod('sootworks_cinderhall_hunter_dusk', {
  skill: 'hunter', name: 'Cinderhall Dusk Circuit',
  levelRange: [85, 99],
  xpPerHour: 495000,
  prerequisites: {
    skills: { hunter: 85 },
    quests: ['the_beetlekeepers_signet', 'the_cinderhall_vigil'],
    items: [{ name: "Beetlekeeper's signet" }, { name: 'Cog-bone charm' }, { name: 'Lantern-sap flask' }],
    areas: ['sootworks_cinderhall_warrens'],
  },
  resourceOutput: { produces: [{ name: 'Cinderhall master shell', perHour: 240 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'medium', complexity: 'intense', attention: 'maximum',
  inputs: [{ name: 'Lantern-sap', perHour: 60, source: 'sootworks_blackroot_stand' }],
  description: "Cinderhall beetles only break cover at dusk — 19:30-20:00 in-game. Signet displayed, charm at neck, sap-flask uncapped. Half-hour window. Every night.",
  location: 'Sootworks',
  breakpointAt: 85,
});

rel.defineTrainingMethod('sootworks_steamfield_new_moon_farming', {
  skill: 'farming', name: 'Steam-Field New-Moon Planting',
  levelRange: [80, 99],
  xpPerHour: 465000,
  prerequisites: {
    skills: { farming: 80 },
    quests: ['the_tray_keepers_list', 'the_new_moon_rotation'],
    items: [{ name: 'Tray-keeper token' }, { name: 'Lantern-lichen spore pouch' }, { name: 'Seed of the Foundry' }],
    areas: ['sootworks_steamfield'],
  },
  resourceOutput: { produces: [{ name: 'Foundry-grown harvest', perHour: 110 }], net: 'profit' },
  bankingFrequency: 'frequent', costPerHour: 6500,
  danger: 'none', complexity: 'intense', attention: 'maximum',
  inputs: [{ name: 'Seed of the Foundry', perHour: 1, source: 'sootworks_foundry_seed' }, { name: 'Lantern-lichen spore', perHour: 110, source: 'sootworks_steamfield_lichen' }],
  description: "Only plants on in-game new-moon nights (1st of each in-game month). Token on belt, pouch at hip, Foundry Seed in the left palm. One rotation per month. Do not be late.",
  location: 'Sootworks',
  breakpointAt: 80,
});

rel.defineTrainingMethod('sootworks_brass_choir_silent_hour', {
  skill: 'magic', name: 'Brass Choir Silent-Hour Enchanting',
  levelRange: [85, 99],
  xpPerHour: 420000,
  prerequisites: {
    skills: { magic: 85, prayer: 70 },
    quests: ['the_iron_tongue_heresy', 'the_silent_hour_pact'],
    items: [{ name: 'Forge-crystal ink' }, { name: 'Lung-bellow sinew' }, { name: 'Pipe-ember censer' }, { name: 'Bell-soot sachet' }],
    areas: ['sootworks_brass_choir'],
  },
  resourceOutput: { produces: [{ name: 'Enchanted brass chalice', perHour: 320 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 72000,
  danger: 'none', complexity: 'intense', attention: 'maximum',
  inputs: [{ name: 'Archive scroll', perHour: 2000, source: 'sootworks_soot_library_archive' }, { name: 'Onyx', perHour: 320, source: 'mining' }],
  description: "The silent hour: the pipes go quiet from 02:00 to 03:00 in-game. Ink, sinew, censer, sachet: all four, all placed. The choir listens. You chant under the organ.",
  location: 'Sootworks',
  breakpointAt: 85,
});

// ══════════════════════════════════════════════════════════════════════════════
// QUIRKY WORLD OBJECTS — Sootworks flavor XP trickles
// 15 discoverable ambient interactions. Industrial. Tool-noun-heavy.
// ══════════════════════════════════════════════════════════════════════════════

rel.defineTrainingMethod('quirky_sootworks_rivet_bucket', {
  skill: 'crafting', name: '[Quirky] Sort the Rivet Bucket',
  levelRange: [1, 99],
  xpPerHour: 1400,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['sootworks'] },
  resourceOutput: { produces: [{ name: 'Sorted rivets', perHour: 80 }], net: 'profit' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'medium',
  inputs: [],
  description: "Forge Cathedral keeps a bucket of spilled rivets near the door. The guilds argue over which one invented the rivet. Sorting them earns a crumb of crafting.",
  location: 'Sootworks',
});

rel.defineTrainingMethod('quirky_sootworks_soot_sweeping', {
  skill: 'firemaking', name: '[Quirky] Sweep the Furnace Flue',
  levelRange: [1, 99],
  xpPerHour: 1800,
  prerequisites: { skills: {}, quests: [], items: [{ name: 'Flue-brush' }], areas: ['sootworks'] },
  resourceOutput: { produces: [{ name: 'Flue soot', perHour: 30 }], net: 'profit' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'low',
  inputs: [],
  description: "The Cathedral flue sheds soot after every shift. Forgemaster Brun lets anyone who brings a brush sweep it. Tiny firemaking trickle. The soot weighs nothing.",
  location: 'Sootworks',
});

rel.defineTrainingMethod('quirky_sootworks_pump_whistle_tune', {
  skill: 'agility', name: '[Quirky] Tune the Pump Whistles',
  levelRange: [1, 99],
  xpPerHour: 1600,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['sootworks'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'medium',
  inputs: [],
  description: "Pump Eight whistles go flat over the shift. Turn the brass one quarter-tick. Agility flutter. The pumpmen nod without looking.",
  location: 'Sootworks',
});

rel.defineTrainingMethod('quirky_sootworks_choir_pipe_polish', {
  skill: 'prayer', name: '[Quirky] Polish the Brass Choir Pipes',
  levelRange: [1, 99],
  xpPerHour: 2100,
  prerequisites: { skills: {}, quests: [], items: [{ name: 'Polish rag' }], areas: ['sootworks'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'medium',
  inputs: [],
  description: "The Brass Choir's low pipes tarnish between masses. Rub one and the note sharpens. Tiny prayer trickle. The organist never turns her head.",
  location: 'Sootworks',
});

rel.defineTrainingMethod('quirky_sootworks_library_dust', {
  skill: 'runecrafting', name: '[Quirky] Dust the Soot-Library Shelves',
  levelRange: [1, 99],
  xpPerHour: 1200,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['sootworks'] },
  resourceOutput: { produces: [{ name: 'Forge-crystal dust', perHour: 25 }], net: 'profit' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'low',
  inputs: [],
  description: "Forge-crystal dust settles on the lower shelves. The archivist lets you brush it into a jar. Tiny runecrafting. The dust smells like flint.",
  location: 'Sootworks',
});

rel.defineTrainingMethod('quirky_sootworks_gallery_beggar_coin', {
  skill: 'thieving', name: "[Quirky] Toss a Coin to the Gallery Beggars",
  levelRange: [1, 99],
  xpPerHour: 1300,
  prerequisites: { skills: {}, quests: [], items: [{ name: 'Gold coin' }], areas: ['sootworks'] },
  resourceOutput: { produces: [{ name: 'Brass button', perHour: 6 }], net: 'profit' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'low',
  inputs: [{ name: 'Gold coin', perHour: 60, source: 'shop' }],
  description: "The Gallery beggars don't beg — they trade. A coin for a button. The button rattles in your pocket and nobody frisks a button.",
  location: 'Sootworks',
});

rel.defineTrainingMethod('quirky_sootworks_cinder_graveyard_rubbings', {
  skill: 'crafting', name: "[Quirky] Make Rubbings of the Cog-Graves",
  levelRange: [1, 99],
  xpPerHour: 1100,
  prerequisites: { skills: {}, quests: [], items: [{ name: 'Paper' }, { name: 'Charcoal' }], areas: ['sootworks'] },
  resourceOutput: { produces: [{ name: 'Cog-grave rubbing', perHour: 10 }], net: 'profit' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'low', complexity: 'trivial', attention: 'medium',
  inputs: [{ name: 'Paper', perHour: 10, source: 'shop' }, { name: 'Charcoal', perHour: 10, source: 'firemaking' }],
  description: "Every cog-grave in the Graveyard names a guild-master. Rub them in charcoal. Collectors pay. The Cinder King's stone does not take a rub.",
  location: 'Sootworks',
});

rel.defineTrainingMethod('quirky_sootworks_alloyworks_sweepings', {
  skill: 'smithing', name: '[Quirky] Sweep the Alloy Works Floor',
  levelRange: [1, 99],
  xpPerHour: 2000,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['sootworks'] },
  resourceOutput: { produces: [{ name: 'Alloy-works sweepings', perHour: 40 }], net: 'profit' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'low',
  inputs: [],
  description: "The Deep Stone floor collects bar-scale. Sweep a pan, take it home, smelt it down. Tiny smithing trickle. The apprentices pretend they don't see.",
  location: 'Sootworks',
});

rel.defineTrainingMethod('quirky_sootworks_steamfield_weeding', {
  skill: 'farming', name: '[Quirky] Weed the Steam-Field Rows',
  levelRange: [1, 99],
  xpPerHour: 1500,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['sootworks'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'low',
  inputs: [],
  description: "The Steam-Field tray-keeper is short a hand every Tuesday. Pulling fungus creepers from the row-gaps gives a flutter of farming. She leaves a stout on the trellis.",
  location: 'Sootworks',
});

rel.defineTrainingMethod('quirky_sootworks_pipehound_feeding', {
  skill: 'hunter', name: '[Quirky] Feed the Kennel Pipehounds',
  levelRange: [1, 99],
  xpPerHour: 1700,
  prerequisites: { skills: {}, quests: [], items: [{ name: 'Raw ironfin' }], areas: ['sootworks'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'low', complexity: 'trivial', attention: 'medium',
  inputs: [{ name: 'Raw ironfin', perHour: 40, source: 'fishing' }],
  description: "The kennel-master keeps a line of pipehounds for the tunnels. Toss an ironfin each. They settle. You learn how a hound marks its door.",
  location: 'Sootworks',
});

rel.defineTrainingMethod('quirky_sootworks_cathedral_apprentice_bucket', {
  skill: 'strength', name: "[Quirky] Carry the Apprentice Water-Buckets",
  levelRange: [1, 99],
  xpPerHour: 1900,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['sootworks'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'medium',
  inputs: [],
  description: "Forge Cathedral apprentices have too few hands at quench-time. Carry a bucket; you fetch a pinch of strength. Brun nods from the master anvil.",
  location: 'Sootworks',
});

rel.defineTrainingMethod('quirky_sootworks_gallery_patched_hem', {
  skill: 'crafting', name: "[Quirky] Patch a Gallery Beggar's Hem",
  levelRange: [1, 99],
  xpPerHour: 1300,
  prerequisites: { skills: {}, quests: [], items: [{ name: 'Needle' }, { name: 'Thread' }], areas: ['sootworks'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'medium',
  inputs: [],
  description: "The Gallery beggars sew brass buttons into their hems. If you bring a needle and thread they let you patch a seam. Tiny crafting. Afterward, they remember your face.",
  location: 'Sootworks',
});

rel.defineTrainingMethod('quirky_sootworks_boil_floor_kettle', {
  skill: 'cooking', name: '[Quirky] Mind the Boil-Floor Kettle',
  levelRange: [1, 99],
  xpPerHour: 1800,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['sootworks'] },
  resourceOutput: { produces: [{ name: 'Tea (hot)', perHour: 6 }], net: 'profit' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'low', complexity: 'trivial', attention: 'medium',
  inputs: [],
  description: "The Boil-Floor kettle never stops. If you lift and pour when it whistles, the cook gives you a tin mug. Tiny cooking trickle. The tea's too hot on purpose.",
  location: 'Sootworks',
});

rel.defineTrainingMethod('quirky_sootworks_lantern_mine_hoist', {
  skill: 'strength', name: '[Quirky] Work the Lantern Mine Hoist',
  levelRange: [1, 99],
  xpPerHour: 2100,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['sootworks'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'high',
  inputs: [],
  description: "The hoist-chain is long and the apprentices are small. Haul on the rope when the bell rings up. Tiny strength. Your shoulders learn the tempo.",
  location: 'Sootworks',
});

rel.defineTrainingMethod('quirky_sootworks_tinker_yard_scrap', {
  skill: 'fletching', name: '[Quirky] Pick Scrap at the Tinker Yard',
  levelRange: [1, 99],
  xpPerHour: 1500,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['sootworks'] },
  resourceOutput: { produces: [{ name: 'Tinker-yards scrap', perHour: 35 }], net: 'profit' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'low',
  inputs: [],
  description: "The Tinker Yards leave a pile of bent springs and broken cogs by the gate. Nobody minds if you sort them. Tiny fletching. The gnomes whistle while they work.",
  location: 'Sootworks',
});

// ══════════════════════════════════════════════════════════════════════════════
// GUILD REAGENT COMBINATIONS (Sootworks-native rivets, stamps, pins)
// 10 industrial reagents that 500-hour dwarves collect.
// ══════════════════════════════════════════════════════════════════════════════

rel.defineCombination(97801, {
  resultName: 'Guild Rivet of the Forge',
  inputs: [
    { id: 97701, name: 'Slag-scurf', consumed: true },
    { id: 97702, name: 'Pump Eight rivet', consumed: true },
    { id: 2116, name: 'Runite bar', consumed: true },
  ],
  skill: 'smithing', level: 80, xp: 360, station: 'master_anvil',
  description: 'A rivet stamped with three guilds. Wear on the apron, forge-doors open for you.',
});

rel.defineCombination(97802, {
  resultName: 'Guild Stamp of the Choir',
  inputs: [
    { id: 97703, name: 'Pipe-ember', consumed: true },
    { id: 97712, name: 'Lung-bellow sinew', consumed: true },
    { id: 97205, name: 'Silver ore', consumed: true },
  ],
  skill: 'crafting', level: 82, xp: 380, station: 'brass_choir_bench',
  description: "The Choir's stamp. Pressed at the pipe-altar. Brun's signature on the back.",
});

rel.defineCombination(97803, {
  resultName: 'Guild Pin of the Pump',
  inputs: [
    { id: 97702, name: 'Pump Eight rivet', consumed: true },
    { id: 97715, name: 'Whistle-brass', consumed: true },
    { id: 97709, name: 'Valve grease', consumed: true },
  ],
  skill: 'crafting', level: 78, xp: 340, station: 'workbench',
  description: 'The pump pin. Only struck when the whistle sings B-flat. Pumpmen nod as you pass.',
});

rel.defineCombination(97804, {
  resultName: 'Forgemaster Seal (Lesser)',
  inputs: [
    { id: 97701, name: 'Slag-scurf', consumed: true },
    { id: 97701, name: 'Slag-scurf', consumed: true },
    { id: 97701, name: 'Slag-scurf', consumed: true },
    { id: 2116, name: 'Runite bar', consumed: true },
  ],
  skill: 'smithing', level: 75, xp: 310, station: 'forgemaster_anvil',
  description: "Three scurfs and a runite bar, pressed under Brun's hammer. Counts as a forge-warrant for a week.",
});

rel.defineCombination(97805, {
  resultName: 'Forgemaster Seal (Greater)',
  inputs: [
    { id: 97804, name: 'Forgemaster Seal (Lesser)', consumed: true },
    { id: 97704, name: 'Deep-stone scale', consumed: true },
    { id: 97801, name: 'Guild Rivet of the Forge', consumed: false },
  ],
  skill: 'smithing', level: 90, xp: 540, station: 'forgemaster_anvil',
  description: "The greater seal. Lasts the quarter. Deep-stone scale seals it. The Forge Rivet shown, not spent.",
});

rel.defineCombination(97806, {
  resultName: 'Archive Ink-Pot',
  inputs: [
    { id: 97707, name: 'Forge-crystal ink', consumed: true },
    { id: 97707, name: 'Forge-crystal ink', consumed: true },
    { id: 97707, name: 'Forge-crystal ink', consumed: true },
    { id: 97205, name: 'Silver ore', consumed: true },
  ],
  skill: 'runecrafting', level: 80, xp: 390, station: 'soot_library_bench',
  description: "Three inks and a silver ore. The archivist sets the wick. Ink lasts a full shift at the archive bench.",
});

rel.defineCombination(97807, {
  resultName: 'Beetlekeeper Signet',
  inputs: [
    { id: 97090, name: 'Clockbeetle carapace', consumed: true },
    { id: 97090, name: 'Clockbeetle carapace', consumed: true },
    { id: 97090, name: 'Clockbeetle carapace', consumed: true },
    { id: 97204, name: 'Gold ore', consumed: true },
  ],
  skill: 'crafting', level: 82, xp: 400, station: 'hunter_bench',
  description: "Three carapaces and a gold ore. The Beetlekeeper etches your name. Unlocks the master-runs warrens.",
});

rel.defineCombination(97808, {
  resultName: "Quartermaster's Key-String",
  inputs: [
    { id: 97706, name: 'Brass button', consumed: true },
    { id: 97706, name: 'Brass button', consumed: true },
    { id: 97706, name: 'Brass button', consumed: true },
    { id: 97706, name: 'Brass button', consumed: true },
    { id: 97706, name: 'Brass button', consumed: true },
  ],
  skill: 'thieving', level: 80, xp: 420, station: 'gallery_back_room',
  description: "Five buttons threaded on catgut. Worn inside the coat. Every lock in the Gallery knows the rattle.",
});

rel.defineCombination(97809, {
  resultName: 'Cog-Bone Charm',
  inputs: [
    { id: 97705, name: 'Cog-bone', consumed: true },
    { id: 97705, name: 'Cog-bone', consumed: true },
    { id: 97713, name: 'Heretic cog', consumed: true },
  ],
  skill: 'crafting', level: 85, xp: 450, station: 'cinder_graveyard_altar',
  description: "Two cog-bones and a heretic's cog. The charm keeps clockwork dead things dead a beat longer. Hum faintly.",
});

rel.defineCombination(97810, {
  resultName: "Pump Eight Wrench (Master)",
  inputs: [
    { id: 97111, name: "Pumpman's wrench", consumed: true },
    { id: 97702, name: 'Pump Eight rivet', consumed: true },
    { id: 97715, name: 'Whistle-brass', consumed: true },
    { id: 2116, name: 'Runite bar', consumed: true },
  ],
  skill: 'smithing', level: 85, xp: 500, station: 'master_anvil',
  description: "Upgrade the wrench. Rivet-stamped. Whistle-brass handle. Opens every Pump Eight gate in one ratchet.",
});

// ══════════════════════════════════════════════════════════════════════════════
// ITEM USES — register so the density score picks these up
// ══════════════════════════════════════════════════════════════════════════════

rel.registerItemUse(97701, { type: 'recipe', targetId: 97801, targetName: 'Guild Rivet of the Forge', region: 'sootworks', details: 'Slag-scurf is the core of the Forge Rivet.', obscure: true });
rel.registerItemUse(97701, { type: 'recipe', targetId: 97804, targetName: 'Forgemaster Seal (Lesser)', region: 'sootworks', details: 'Three scurfs press a seal.', obscure: true });
rel.registerItemUse(97702, { type: 'recipe', targetId: 97801, targetName: 'Guild Rivet of the Forge', region: 'sootworks', details: 'Pump Eight rivets bind the Forge Rivet.', obscure: true });
rel.registerItemUse(97702, { type: 'recipe', targetId: 97803, targetName: 'Guild Pin of the Pump', region: 'sootworks', details: 'Pump Eight rivets are the pin core.', obscure: true });
rel.registerItemUse(97702, { type: 'recipe', targetId: 97810, targetName: 'Pump Eight Wrench (Master)', region: 'sootworks', details: 'Pump Eight rivet is the wrench upgrade stamp.', obscure: true });
rel.registerItemUse(97703, { type: 'recipe', targetId: 97802, targetName: 'Guild Stamp of the Choir', region: 'sootworks', details: 'Pipe-embers ignite the Choir stamp.', obscure: true });
rel.registerItemUse(97704, { type: 'recipe', targetId: 97805, targetName: 'Forgemaster Seal (Greater)', region: 'sootworks', details: 'Deep-stone scale seals the greater Forgemaster Seal.', obscure: true });
rel.registerItemUse(97705, { type: 'recipe', targetId: 97809, targetName: 'Cog-Bone Charm', region: 'sootworks', details: 'Cog-bones are the charm body.', obscure: true });
rel.registerItemUse(97706, { type: 'recipe', targetId: 97808, targetName: "Quartermaster's Key-String", region: 'sootworks', details: 'Brass buttons thread the key-string.', obscure: true });
rel.registerItemUse(97707, { type: 'recipe', targetId: 97806, targetName: 'Archive Ink-Pot', region: 'sootworks', details: 'Forge-crystal ink is the ink-pot reserve.', obscure: true });
rel.registerItemUse(97708, { type: 'other', targetId: 'sootworks_shift_bell_chorus', targetName: 'Shift-Bell Chorus', region: 'sootworks', details: 'Bell-soot on the wrists is part of the Shift-Bell Chorus.', obscure: true });
rel.registerItemUse(97709, { type: 'recipe', targetId: 97803, targetName: 'Guild Pin of the Pump', region: 'sootworks', details: 'Valve grease is the pin fixative.', obscure: true });
rel.registerItemUse(97710, { type: 'other', targetId: 'sootworks_cinder_king_anniversary_slayer', targetName: "Cinder King's Anniversary", region: 'sootworks', details: "Cinder King's ash is the anniversary contract reagent.", obscure: true });
rel.registerItemUse(97711, { type: 'other', targetId: 'sootworks_deep_stone_alloyworks_smithing', targetName: 'Deep Stone Alloy Works', region: 'sootworks', details: 'Deep-stone flux seals the master bars.', obscure: true });
rel.registerItemUse(97712, { type: 'recipe', targetId: 97802, targetName: 'Guild Stamp of the Choir', region: 'sootworks', details: 'Lung-bellow sinew binds the Choir stamp.', obscure: true });
rel.registerItemUse(97713, { type: 'recipe', targetId: 97809, targetName: 'Cog-Bone Charm', region: 'sootworks', details: 'Heretic cogs complete the Cog-Bone Charm.', obscure: true });
rel.registerItemUse(97714, { type: 'other', targetId: 'sootworks_cathedral_quench_master', targetName: 'Cathedral Quench-Master Hour', region: 'sootworks', details: 'Forgemaster stamp opens the quench-master hour.', obscure: true });
rel.registerItemUse(97715, { type: 'recipe', targetId: 97803, targetName: 'Guild Pin of the Pump', region: 'sootworks', details: 'Whistle-brass is the pin crown.', obscure: true });

// ══════════════════════════════════════════════════════════════════════════════
// BREAKPOINTS for tertiary top-tier methods
// ══════════════════════════════════════════════════════════════════════════════

rel.defineBreakpoint({
  type: 'skill_level', trigger: { skill: 'smithing', level: 85 },
  description: 'Deep Stone Alloy Works opens. 175k smithing XP/hr. Brun stamps master-grade bars. The Cathedral echo changes.',
  unlocks: [{ type: 'training_method', id: 'sootworks_deep_stone_alloyworks_smithing', description: 'Deep Stone Alloy Works' }],
  importance: 'transformative',
});

rel.defineBreakpoint({
  type: 'skill_level', trigger: { skill: 'prayer', level: 75 },
  description: 'Brass Choir Grand Sermon unlocks. 345k prayer XP/hr with pipe-embers. The organ thunders the whole Cathedral.',
  unlocks: [{ type: 'training_method', id: 'sootworks_brass_choir_grand_sermon', description: 'Brass Choir Grand Sermon' }],
  importance: 'transformative',
});

rel.defineBreakpoint({
  type: 'quest_complete', trigger: { quest: 'the_forgemaster_contract' },
  description: "Forgemaster Brun signs the contract. Cathedral commissions, Master Bench crafting, heat-temper master defence all come online together.",
  unlocks: [
    { type: 'training_method', id: 'sootworks_forge_cathedral_commission', description: 'Cathedral commissions' },
    { type: 'training_method', id: 'sootworks_cathedral_crafting_bench', description: 'Master crafting bench' },
    { type: 'training_method', id: 'sootworks_heat_temper_master_defence', description: 'Master heat-temper defence' },
  ],
  importance: 'transformative',
});

rel.defineBreakpoint({
  type: 'quest_complete', trigger: { quest: 'the_cinder_kings_fall' },
  description: "The Cinder King has fallen. His Graveyard opens to slayer masters. Contracts stack with the ash-pit anniversary.",
  unlocks: [
    { type: 'area', id: 'sootworks_cinder_graveyard', description: "Cinder King's Graveyard" },
    { type: 'training_method', id: 'sootworks_cinder_king_slayer', description: 'Graveyard contracts' },
    { type: 'training_method', id: 'sootworks_cinder_king_anniversary_slayer', description: "Anniversary slayer (yearly)" },
  ],
  importance: 'transformative',
});

console.log('[aelgard] Sootworks Tertiary loaded: 26 top-tier methods, 15 obscure methods, 15 quirky interactions, 10 guild combinations, 15 tertiary items, 4 breakpoints');

module.exports = {
  tertiaryMethodCount: 41,  // 26 top-tier + 15 obscure
  quirkyInteractionCount: 15,
  guildCombinations: 10,
  tertiaryItems: 15,
};
