// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Heartlands Tertiary (500-hour content)
//
// Voice: plain warmth. Neither grim nor twee. Farmers, guards, Inns, the bell
// at noon. Wind in the Willows meets Susanna Clarke. Specific institutions:
//   - The Lamplighters Guild (voss, tinderboxes, dusk routes)
//   - The Chapel of the Last Light (Father Dorin, dawn candles)
//   - The hedge-wise women (who remember birth-names)
//   - The Rancher's Bell (noon, dusk, whatever else the herd needs)
//
// Target: push Heartlands gap score 66 → 85+ by adding obscure, weird,
// easter-egg-rich tertiary content — the stuff 500-hour players discover.
//
// This file adds:
//   - 16 top-tier training methods (caps to 99)
//   - 10 obscure maximum-attention methods (3x XP/hr w/ oddly specific reqs)
//   - 10 courtly reagent combinations (crests, seals, badges)
//
// All methods carry the Marstead 8 knobs. No XP-only quests.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const rel = require('../../data/relationships');

// ══════════════════════════════════════════════════════════════════════════════
// HEARTLANDS TERTIARY EXPORTS — items only these tertiary methods produce
// Item IDs in the 91000-91999 range (clean tertiary block).
// ══════════════════════════════════════════════════════════════════════════════

rel.registerItemSource(91001, { type: 'gathering', sourceId: 'heartlands_dawn_chapel', sourceName: 'Chapel of the Last Light at Dawn', region: 'heartlands', details: 'Dawn wax — collected from the last light candles between 05:00-06:30 in-game. Used for dawn-blessed reagents.', obscure: true });
rel.registerItemSource(91002, { type: 'gathering', sourceId: 'heartlands_hedge_row', sourceName: 'The Old Hedge', region: 'heartlands', details: 'Hedge-thorn. Only picked by someone whose birth-name the hedge-wise women have recorded.', obscure: true });
rel.registerItemSource(91003, { type: 'drop', sourceId: 'heartlands_tithe_barn_mouse', sourceName: 'Tithe Barn Mouse', region: 'heartlands', details: 'Barn-mouse whiskers. Enchanter secondary. Mice are harmless; you catch them with crumbs.', obscure: true });
rel.registerItemSource(91004, { type: 'gathering', sourceId: 'heartlands_bell_tower', sourceName: 'The Rancher Bell', region: 'heartlands', details: 'Bell-rope fibers. Frayed from the noon ringing. A small bundle per day.', obscure: true });
rel.registerItemSource(91005, { type: 'gathering', sourceId: 'heartlands_lamplighter_route', sourceName: "Lamplighter's Route", region: 'heartlands', details: 'Dusk soot. Scraped from the lanterns after an evening round. Courtly crests require it.', obscure: true });
rel.registerItemSource(91006, { type: 'gathering', sourceId: 'heartlands_kings_forest', sourceName: "The King's Forest (Royal Warrant)", region: 'heartlands', details: 'King-oak bark. Only harvested under Royal Warrant. The forester watches.', obscure: true });
rel.registerItemSource(91007, { type: 'drop', sourceId: 'heartlands_crown_courier', sourceName: 'Crown Courier', region: 'heartlands', details: 'Wax-sealed document fragments. Dropped during courier escort missions.', obscure: true });
rel.registerItemSource(91008, { type: 'shop', sourceId: 'heartlands_hedge_wise_cottage', sourceName: 'Hedge-Wise Cottage', region: 'heartlands', details: "Birth-name ink. The hedge-wise women dip a quill in a pot they won't let you see.", obscure: true });
rel.registerItemSource(91009, { type: 'gathering', sourceId: 'heartlands_inn_hearth', sourceName: 'Inn Hearth Ash', region: 'heartlands', details: 'Hearth ash from the Heartlands Inn fireplace. Gathered after closing.', obscure: true });
rel.registerItemSource(91010, { type: 'gathering', sourceId: 'heartlands_fallen_bell', sourceName: 'Fallen Bell Fragment', region: 'heartlands', details: 'Bronze fragment from a bell that cracked decades ago. Sings when struck.', obscure: true });

// ══════════════════════════════════════════════════════════════════════════════
// TOP-TIER TRAINING METHODS — cap at 99 across all the classic skills
// ══════════════════════════════════════════════════════════════════════════════

rel.defineTrainingMethod('heartlands_royal_armoury', {
  skill: 'smithing', name: 'Royal Armoury Commissions',
  levelRange: [85, 99],
  xpPerHour: 155000,
  prerequisites: { skills: { smithing: 85 }, quests: ['the_blacksmiths_apprentice', 'the_royal_commission'], items: [], areas: ['heartlands_royal_district'] },
  resourceOutput: { produces: [{ name: 'Rune armour (commissioned)', perHour: 12 }, { name: 'Royal commendation', perHour: 1 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 30000,
  danger: 'none', complexity: 'complex', attention: 'medium',
  inputs: [{ name: 'Runite bar', perHour: 60, source: 'heartlands_deep_mines' }, { name: 'Coal', perHour: 240, source: 'mining' }],
  description: 'Forge ceremonial rune armour for the Crown. Heavy concentration, steady pace. Each piece stamped by the master smith.',
  location: 'Heartlands',
  breakpointAt: 85,
});

rel.defineTrainingMethod('heartlands_royal_orchard', {
  skill: 'farming', name: 'Royal Orchard Stewardship',
  levelRange: [75, 99],
  xpPerHour: 135000,
  prerequisites: { skills: { farming: 75 }, quests: ['the_royal_warrant'], items: [], areas: ['heartlands_royal_district'] },
  resourceOutput: { produces: [{ name: 'Palm fruit', perHour: 18 }, { name: 'Dragonfruit', perHour: 6 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 8000,
  danger: 'none', complexity: 'moderate', attention: 'low',
  inputs: [{ name: 'Palm sapling', perHour: 4, source: 'farming' }],
  description: 'Tend the crown orchards. The head gardener notes your technique. Slow rotation but premium yields.',
  location: 'Heartlands',
  breakpointAt: 75,
});

rel.defineTrainingMethod('heartlands_grand_cathedral', {
  skill: 'prayer', name: 'Grand Cathedral Offerings',
  levelRange: [70, 99],
  xpPerHour: 330000,
  prerequisites: { skills: { prayer: 70 }, quests: ['the_last_light_vigil'], items: [{ name: 'Gilded altar access' }], areas: ['heartlands_grand_cathedral'] },
  resourceOutput: { produces: [], net: 'loss' },
  bankingFrequency: 'frequent', costPerHour: 12000,
  danger: 'none', complexity: 'simple', attention: 'medium',
  inputs: [{ name: 'Dragon bones', perHour: 800, source: 'slayer' }, { name: 'Dawn wax', perHour: 200, source: 'heartlands_dawn_chapel' }],
  description: 'Offer bones on the gilded altar of the Grand Cathedral. Dawn wax amplifies the blessing. Fastest prayer in Aelgard.',
  location: 'Heartlands',
  breakpointAt: 70,
});

rel.defineTrainingMethod('heartlands_guild_masters_bench', {
  skill: 'crafting', name: "Guild Master's Bench",
  levelRange: [80, 99],
  xpPerHour: 240000,
  prerequisites: { skills: { crafting: 80 }, quests: ['the_guild_trials'], items: [{ name: 'Guild medallion' }], areas: ['heartlands_all_guilds'] },
  resourceOutput: { produces: [{ name: 'Crafted ornament', perHour: 900 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 6000,
  danger: 'none', complexity: 'moderate', attention: 'low',
  inputs: [{ name: 'Gold bar', perHour: 900, source: 'heartlands_smithing_table' }, { name: 'Sapphire', perHour: 300, source: 'mining' }],
  description: 'Work the private bench reserved for masters. Never a queue. The light is perfect.',
  location: 'Heartlands',
  breakpointAt: 80,
});

rel.defineTrainingMethod('heartlands_capital_agility', {
  skill: 'agility', name: 'Capital Rooftop Course',
  levelRange: [75, 99],
  xpPerHour: 85000,
  prerequisites: { skills: { agility: 75 }, quests: ['the_tiled_rooftops'], items: [], areas: ['heartlands_capital_rooftops'] },
  resourceOutput: { produces: [{ name: 'Marks of grace', perHour: 70 }], net: 'profit' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'low', complexity: 'moderate', attention: 'high',
  inputs: [],
  description: "Capital's chimneys, clotheslines, and copper gutters. The guard below applauds when you stick the landing.",
  location: 'Heartlands',
  breakpointAt: 75,
});

rel.defineTrainingMethod('heartlands_master_thieves_circuit', {
  skill: 'thieving', name: "Master Thieves' Circuit",
  levelRange: [80, 99],
  xpPerHour: 275000,
  prerequisites: { skills: { thieving: 80 }, quests: ['the_missing_deeds', 'the_crown_courier_affair'], items: [], areas: ['heartlands_royal_district'] },
  resourceOutput: { produces: [{ name: 'Gold coins', perHour: 120000 }, { name: 'Wax-sealed document', perHour: 8 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 0,
  danger: 'medium', complexity: 'complex', attention: 'high',
  inputs: [],
  description: 'The route the real thieves work: alderman, envoy, banker, chancellor. No one catches you twice.',
  location: 'Heartlands',
  breakpointAt: 80,
});

rel.defineTrainingMethod('heartlands_deepkeep_wyverns', {
  skill: 'slayer', name: 'Deepkeep Wyvern Hunts',
  levelRange: [85, 99],
  xpPerHour: 68000,
  prerequisites: { skills: { slayer: 85, defence: 80 }, quests: ['the_dragons_tithe'], items: [{ name: 'Elemental shield' }], areas: ['heartlands_deep_keep'] },
  resourceOutput: { produces: [{ name: 'Dragon bones', perHour: 320 }, { name: 'Wyvern visage', perHour: 0.2 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 25000,
  danger: 'high', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Prayer potion (4)', perHour: 8, source: 'heartlands_apothecary_mixing' }, { name: 'Super combat (4)', perHour: 4, source: 'herblore' }],
  description: 'The Heartlands keep has a frostwyvern vault. Very few know the door. The master slayer gives the task herself.',
  location: 'Heartlands',
  breakpointAt: 85,
});

rel.defineTrainingMethod('heartlands_cathedral_windows', {
  skill: 'construction', name: 'Cathedral Window Restoration',
  levelRange: [75, 99],
  xpPerHour: 220000,
  prerequisites: { skills: { construction: 75, crafting: 60 }, quests: ['the_last_light_vigil'], items: [], areas: ['heartlands_grand_cathedral'] },
  resourceOutput: { produces: [{ name: 'Stained glass panel', perHour: 24 }], net: 'loss' },
  bankingFrequency: 'frequent', costPerHour: 45000,
  danger: 'none', complexity: 'complex', attention: 'medium',
  inputs: [{ name: 'Mahogany plank', perHour: 400, source: 'heartlands_sawmill' }, { name: 'Molten sand', perHour: 300, source: 'glass_desert' }],
  description: "Rebuild the chapel's stained windows pane by pane. The monks sing while you work. Time loses its grip.",
  location: 'Heartlands',
  breakpointAt: 75,
});

rel.defineTrainingMethod('heartlands_royal_herbalist', {
  skill: 'herblore', name: 'Royal Herbalist Laboratory',
  levelRange: [80, 99],
  xpPerHour: 310000,
  prerequisites: { skills: { herblore: 80 }, quests: ['the_royal_warrant', 'the_culinaromancers_curse'], items: [], areas: ['heartlands_royal_district'] },
  resourceOutput: { produces: [{ name: 'Royal tonic (4)', perHour: 200 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 48000,
  danger: 'none', complexity: 'complex', attention: 'medium',
  inputs: [{ name: 'Grimy torstol', perHour: 200, source: 'heartlands_torstol_patch' }, { name: 'Barn-mouse whisker', perHour: 200, source: 'heartlands_tithe_barn_mouse' }],
  description: "The Court Herbalist's bench, under royal license. Nothing waits, nothing spoils. Torstol and whisker make the tonic that keeps the king fit.",
  location: 'Heartlands',
  breakpointAt: 80,
});

rel.defineTrainingMethod('heartlands_hedge_runecrafting', {
  skill: 'runecrafting', name: 'Hedge Ley-line Runecrafting',
  levelRange: [77, 99],
  xpPerHour: 46000,
  prerequisites: { skills: { runecrafting: 77 }, quests: ['the_hedge_wise_gift'], items: [], areas: ['heartlands_old_hedge'] },
  resourceOutput: { produces: [{ name: 'Wrath rune', perHour: 2100 }], net: 'profit' },
  bankingFrequency: 'frequent', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Pure essence', perHour: 2100, source: 'mining' }],
  description: 'The old hedge runs along a natural ley line. The hedge-wise women let you craft here if you remember your name.',
  location: 'Heartlands',
  breakpointAt: 77,
});

rel.defineTrainingMethod('heartlands_capital_longbow', {
  skill: 'fletching', name: "Capital Bowyer's Longbows",
  levelRange: [85, 99],
  xpPerHour: 290000,
  prerequisites: { skills: { fletching: 85 }, quests: ['the_royal_falconer'], items: [], areas: ['heartlands_capital'] },
  resourceOutput: { produces: [{ name: 'Magic longbow (u)', perHour: 1800 }], net: 'loss' },
  bankingFrequency: 'frequent', costPerHour: 22000,
  danger: 'none', complexity: 'simple', attention: 'medium',
  inputs: [{ name: 'Magic logs', perHour: 1800, source: 'heartlands_yew_copse' }],
  description: "The capital bowyer's shop, after hours. She leaves the lathe running and a note: 'Pay what's fair.' No one has ever paid unfairly.",
  location: 'Heartlands',
  breakpointAt: 85,
});

rel.defineTrainingMethod('heartlands_palace_kitchen', {
  skill: 'cooking', name: 'Palace Kitchen Service',
  levelRange: [70, 99],
  xpPerHour: 420000,
  prerequisites: { skills: { cooking: 70 }, quests: ['the_culinaromancers_curse'], items: [], areas: ['heartlands_grand_hall'] },
  resourceOutput: { produces: [{ name: 'Palace feast dish', perHour: 400 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 15000,
  danger: 'none', complexity: 'moderate', attention: 'low',
  inputs: [{ name: 'Raw shark', perHour: 400, source: 'heartlands_fishing_guild' }],
  description: 'Cook for the court. Never a burned dish at the palace range. The sous chef nods when you plate.',
  location: 'Heartlands',
  breakpointAt: 70,
});

rel.defineTrainingMethod('heartlands_wind_in_the_reeds', {
  skill: 'firemaking', name: 'The Wind in the Reeds',
  levelRange: [80, 99],
  xpPerHour: 365000,
  prerequisites: { skills: { firemaking: 80 }, quests: ['the_paper_forge'], items: [{ name: 'Voss tinderbox' }], areas: ['heartlands'] },
  resourceOutput: { produces: [{ name: 'Reed-ash', perHour: 150 }], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'simple', attention: 'low',
  inputs: [{ name: 'Magic logs', perHour: 1800, source: 'heartlands_yew_copse' }, { name: 'Papyrus reed', perHour: 200, source: 'heartlands_lakeside_reed' }],
  description: 'Burn magic logs with reeds along the lakeshore. The smoke carries the reeds with it; nothing smells finer.',
  location: 'Heartlands',
  breakpointAt: 80,
});

rel.defineTrainingMethod('heartlands_last_light_magic', {
  skill: 'magic', name: 'The Last Light Altar',
  levelRange: [82, 99],
  xpPerHour: 270000,
  prerequisites: { skills: { magic: 82, prayer: 60 }, quests: ['the_last_light_vigil'], items: [], areas: ['heartlands_chapel_inner'] },
  resourceOutput: { produces: [], net: 'loss' },
  bankingFrequency: 'frequent', costPerHour: 140000,
  danger: 'none', complexity: 'complex', attention: 'maximum',
  inputs: [{ name: 'Astral rune', perHour: 6000, source: 'magic' }, { name: 'Dawn wax', perHour: 600, source: 'heartlands_dawn_chapel' }],
  description: "Cast sunlit spells on the Chapel's inner altar. The phrase list is a page long; the air tastes of the candles you were raised on.",
  location: 'Heartlands',
  breakpointAt: 82,
});

rel.defineTrainingMethod('heartlands_master_huntsman', {
  skill: 'hunter', name: 'Master Huntsman Circuit',
  levelRange: [85, 99],
  xpPerHour: 225000,
  prerequisites: { skills: { hunter: 85 }, quests: ['the_royal_falconer'], items: [{ name: 'Royal falcon' }], areas: ['heartlands_royal_forest'] },
  resourceOutput: { produces: [{ name: 'Ermine pelt', perHour: 40 }, { name: 'Red kebbit tooth', perHour: 60 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 0,
  danger: 'none', complexity: 'complex', attention: 'high',
  inputs: [],
  description: "The Master of the King's Hunt marks your circuit in the morning. By dusk you know every thicket.",
  location: 'Heartlands',
  breakpointAt: 85,
});

rel.defineTrainingMethod('heartlands_forest_ranger_woodcutting', {
  skill: 'woodcutting', name: "The King's Forest Rangership",
  levelRange: [75, 99],
  xpPerHour: 125000,
  prerequisites: { skills: { woodcutting: 75 }, quests: ['the_royal_warrant'], items: [{ name: 'Royal warrant' }], areas: ['heartlands_kings_forest'] },
  resourceOutput: { produces: [{ name: 'Magic logs', perHour: 110 }, { name: 'King-oak bark', perHour: 30 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'simple', attention: 'low',
  inputs: [],
  description: "The king's forester tolerates your axe only if your warrant is current. She checks the seal every morning.",
  location: 'Heartlands',
  breakpointAt: 75,
});

// ══════════════════════════════════════════════════════════════════════════════
// OBSCURE METHODS — 3x XP/hr, maximum attention, extremely specific reqs
// These are the ones 500-hour players whisper about.
// ══════════════════════════════════════════════════════════════════════════════

rel.defineTrainingMethod('heartlands_noon_bell_chorus', {
  skill: 'strength', name: 'The Noon Bell Chorus',
  levelRange: [70, 99],
  xpPerHour: 540000,
  prerequisites: {
    skills: { strength: 70 },
    quests: ['the_fencepost_problem'],
    items: [{ name: "Rancher's Bell" }, { name: 'Bell-rope fiber bundle' }, { name: 'Hearth ash sachet' }],
    areas: ['heartlands_bell_tower'],
  },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'intense', attention: 'maximum',
  inputs: [{ name: 'Bell-rope fiber', perHour: 120, source: 'heartlands_bell_tower' }],
  description: 'Ring the fallen bell with the Rancher Bell tied against it, fresh fibers in hand, sachet of ash at your neck. ONLY works from 11:55 to 12:05 in-game time. Miss the chorus, waste the day.',
  location: 'Heartlands',
  breakpointAt: 70,
});

rel.defineTrainingMethod('heartlands_dawn_vigil', {
  skill: 'prayer', name: 'The Dawn Vigil',
  levelRange: [60, 99],
  xpPerHour: 990000,
  prerequisites: {
    skills: { prayer: 60 },
    quests: ['the_last_light_vigil'],
    items: [{ name: 'Dragon bones' }, { name: 'Dawn wax' }, { name: 'Birth-name ink vial' }],
    areas: ['heartlands_chapel'],
  },
  resourceOutput: { produces: [], net: 'loss' },
  bankingFrequency: 'never', costPerHour: 80000,
  danger: 'none', complexity: 'intense', attention: 'maximum',
  inputs: [{ name: 'Dragon bones', perHour: 600, source: 'slayer' }, { name: 'Dawn wax', perHour: 600, source: 'heartlands_dawn_chapel' }, { name: 'Birth-name ink vial', perHour: 1, source: 'heartlands_hedge_wise_cottage' }],
  description: 'Light dawn candles from 04:45 to 05:15 in-game, sign the ledger in birth-name ink, offer dragon bones on each candle. The hedge-wise women must have written your name first. Sprint through it.',
  location: 'Heartlands',
  breakpointAt: 60,
});

rel.defineTrainingMethod('heartlands_lamplighter_dusk_run', {
  skill: 'firemaking', name: 'Lamplighter Dusk Run',
  levelRange: [65, 99],
  xpPerHour: 890000,
  prerequisites: {
    skills: { firemaking: 65, agility: 50 },
    quests: ['lamplighters_apprentice'],
    items: [{ name: 'Voss tinderbox' }, { name: "Lamplighter's apron" }, { name: 'Dusk soot sachet' }],
    areas: ['heartlands'],
  },
  resourceOutput: { produces: [{ name: 'Dusk soot', perHour: 40 }], net: 'profit' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'low', complexity: 'intense', attention: 'maximum',
  inputs: [{ name: 'Magic logs', perHour: 200, source: 'heartlands_yew_copse' }],
  description: "Light every lantern in the capital in one circuit. Dusk window: 19:30-20:15 in-game. The Voss tinderbox, the apron, and soot from last night's run all required. Miss a lantern, restart.",
  location: 'Heartlands',
  breakpointAt: 65,
});

rel.defineTrainingMethod('heartlands_first_rain_farming', {
  skill: 'farming', name: 'First Rain Planting',
  levelRange: [70, 99],
  xpPerHour: 480000,
  prerequisites: {
    skills: { farming: 70 },
    quests: ['the_grain_rot', 'the_hedge_wise_gift'],
    items: [{ name: 'Heartlands fertilizer' }, { name: 'Hedge-thorn sprig' }, { name: 'Seed of the year' }],
    areas: ['heartlands'],
  },
  resourceOutput: { produces: [{ name: 'First-rain grain', perHour: 80 }], net: 'profit' },
  bankingFrequency: 'frequent', costPerHour: 5000,
  danger: 'none', complexity: 'intense', attention: 'maximum',
  inputs: [{ name: 'Heartlands fertilizer', perHour: 80, source: 'heartlands_farming_rotation' }, { name: 'Hedge-thorn sprig', perHour: 10, source: 'heartlands_old_hedge' }],
  description: 'Plant during the first rain of the in-game day (weather must roll fresh). Seed of the Year is distributed each game-week by the hedge-wise women. Hedge-thorn sprig broken into the soil. Once per day.',
  location: 'Heartlands',
  breakpointAt: 70,
});

rel.defineTrainingMethod('heartlands_thursday_market_thieving', {
  skill: 'thieving', name: "Thursday Market Pulling",
  levelRange: [75, 99],
  xpPerHour: 825000,
  prerequisites: {
    skills: { thieving: 75 },
    quests: ['the_missing_deeds'],
    items: [{ name: "Noble's coat" }, { name: 'Borrowed wedding ring' }, { name: "Lamplighter's apron" }],
    areas: ['heartlands_market_square'],
  },
  resourceOutput: { produces: [{ name: 'Gold coins', perHour: 220000 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 0,
  danger: 'medium', complexity: 'intense', attention: 'maximum',
  inputs: [],
  description: 'Thieve the Thursday market when it runs on the common. Three disguises must be worn together: noble coat, wedding ring, apron. Only runs on in-game Thursdays. Guards hate this one trick.',
  location: 'Heartlands',
  breakpointAt: 75,
});

rel.defineTrainingMethod('heartlands_midnight_runecraft', {
  skill: 'runecrafting', name: 'Midnight Ley-Weave',
  levelRange: [80, 99],
  xpPerHour: 165000,
  prerequisites: {
    skills: { runecrafting: 80 },
    quests: ['the_hedge_wise_gift', 'the_stolen_runes'],
    items: [{ name: "Ruven's rune pouch" }, { name: 'Hedge-thorn sprig' }, { name: 'Birth-name ink vial' }],
    areas: ['heartlands_old_hedge'],
  },
  resourceOutput: { produces: [{ name: 'Wrath rune', perHour: 3300 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'intense', attention: 'maximum',
  inputs: [{ name: 'Pure essence', perHour: 3300, source: 'mining' }],
  description: 'The ley line only shimmers from 00:00 to 00:45 in-game. Sprig held in left hand, pouch in right, ink blot on the forehead. The hedge-wise women call this "weaving proper."',
  location: 'Heartlands',
  breakpointAt: 80,
});

rel.defineTrainingMethod('heartlands_crown_courier_escort', {
  skill: 'defence', name: 'Crown Courier Escort',
  levelRange: [75, 99],
  xpPerHour: 180000,
  prerequisites: {
    skills: { defence: 75, agility: 60 },
    quests: ['the_crown_courier_affair'],
    items: [{ name: 'Royal warrant' }, { name: 'Courier sashes (set of three)' }],
    areas: ['heartlands'],
  },
  resourceOutput: { produces: [{ name: 'Wax-sealed document', perHour: 20 }, { name: 'Royal commendation', perHour: 2 }], net: 'profit' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'medium', complexity: 'intense', attention: 'maximum',
  inputs: [],
  description: 'Courier circuits only start once per hour on the half. All three sashes must be worn in order (innermost red, middle white, outer blue). Ambushers strike twice a run. Keep moving.',
  location: 'Heartlands',
  breakpointAt: 75,
});

rel.defineTrainingMethod('heartlands_bell_tower_agility', {
  skill: 'agility', name: 'Bell Tower Free-Climb',
  levelRange: [80, 99],
  xpPerHour: 255000,
  prerequisites: {
    skills: { agility: 80, strength: 70 },
    quests: ['the_tiled_rooftops'],
    items: [{ name: 'Bell-rope fiber bundle' }, { name: 'Chalk pouch' }],
    areas: ['heartlands_bell_tower'],
  },
  resourceOutput: { produces: [{ name: 'Marks of grace', perHour: 210 }], net: 'profit' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'high', complexity: 'intense', attention: 'maximum',
  inputs: [],
  description: 'Free-climb the bell tower between the 11 and 12 chimes. The bell itself must NOT ring during your ascent or you fall. One attempt per in-game hour.',
  location: 'Heartlands',
  breakpointAt: 80,
});

rel.defineTrainingMethod('heartlands_rainy_sunday_fishing', {
  skill: 'fishing', name: 'Rainy Sunday Lakeside',
  levelRange: [80, 99],
  xpPerHour: 295000,
  prerequisites: {
    skills: { fishing: 80 },
    quests: ['the_drowned_miller'],
    items: [{ name: 'Old Miller rod' }, { name: "Father's tackle box" }, { name: 'Spirit bait' }],
    areas: ['heartlands_old_mill'],
  },
  resourceOutput: { produces: [{ name: 'Spirit trout', perHour: 240 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'intense', attention: 'maximum',
  inputs: [{ name: 'Spirit bait', perHour: 240, source: 'heartlands_old_mill' }],
  description: 'The Old Mill pool only runs spirit trout on Sundays when it is raining. Three items from the drowned miller quest must be equipped. Five-hour window per in-game week.',
  location: 'Heartlands',
  breakpointAt: 80,
});

rel.defineTrainingMethod('heartlands_hedgewise_enchanting', {
  skill: 'magic', name: "Hedge-Wise Enchanting",
  levelRange: [85, 99],
  xpPerHour: 390000,
  prerequisites: {
    skills: { magic: 85 },
    quests: ['the_hedge_wise_gift'],
    items: [{ name: 'Birth-name ink vial' }, { name: 'Barn-mouse whisker' }, { name: 'Hedge-thorn sprig' }, { name: "Ruven's rune pouch" }],
    areas: ['heartlands_hedge_wise_cottage'],
  },
  resourceOutput: { produces: [{ name: 'Enchanted amulet', perHour: 360 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 65000,
  danger: 'none', complexity: 'intense', attention: 'maximum',
  inputs: [{ name: 'Cosmic rune', perHour: 1800, source: 'magic' }, { name: 'Onyx amulet', perHour: 360, source: 'crafting' }],
  description: 'At the hedge-wise cottage, whisker on the left side of the desk, sprig on the right, vial uncorked, pouch open. She will not tell you why the whisker must be on the left.',
  location: 'Heartlands',
  breakpointAt: 85,
});

// ══════════════════════════════════════════════════════════════════════════════
// COURTLY REAGENT COMBINATIONS
// Crests, seals, badges — these are the treasures a 500-hour player collects.
// ══════════════════════════════════════════════════════════════════════════════

rel.defineCombination(91501, {
  resultName: 'Courtly Crest of the Lamplighters',
  inputs: [
    { id: 91005, name: 'Dusk soot', consumed: true },
    { id: 91009, name: 'Hearth ash', consumed: true },
    { id: 1510, name: 'Rune full helm', consumed: true },
  ],
  skill: 'crafting', level: 80, xp: 340, station: 'guild_bench',
  description: "Stamped with the Voss sigil. Wear the crest, the lamplighters will let you into any door after dusk.",
});

rel.defineCombination(91502, {
  resultName: 'Courtly Crest of the Chapel',
  inputs: [
    { id: 91001, name: 'Dawn wax', consumed: true },
    { id: 91010, name: 'Fallen bell fragment', consumed: true },
    { id: 90114, name: 'Gold ore', consumed: true },
  ],
  skill: 'crafting', level: 82, xp: 360, station: 'guild_bench',
  description: 'Crest of the Last Light. Wear it, Father Dorin nods as you pass. Pays off at the altar.',
});

rel.defineCombination(91503, {
  resultName: 'Courtly Crest of the Hedge',
  inputs: [
    { id: 91002, name: 'Hedge-thorn sprig', consumed: true },
    { id: 91008, name: 'Birth-name ink vial', consumed: true },
    { id: 90181, name: 'Big bones', consumed: true },
  ],
  skill: 'crafting', level: 78, xp: 330, station: 'guild_bench',
  description: 'Crest of the Hedge-Wise. The only crest worked without fire — only thorn, ink, and bone.',
});

rel.defineCombination(91504, {
  resultName: 'Royal Seal (Lesser)',
  inputs: [
    { id: 91007, name: 'Wax-sealed document fragment', consumed: true },
    { id: 91007, name: 'Wax-sealed document fragment', consumed: true },
    { id: 91007, name: 'Wax-sealed document fragment', consumed: true },
    { id: 90114, name: 'Gold ore', consumed: true },
  ],
  skill: 'crafting', level: 75, xp: 280, station: 'palace_study',
  description: 'Three fragments and a gold ore pressed in the palace study. Counts as a Royal Warrant for seven in-game days.',
});

rel.defineCombination(91505, {
  resultName: 'Royal Seal (Greater)',
  inputs: [
    { id: 91504, name: 'Royal Seal (Lesser)', consumed: true },
    { id: 91006, name: 'King-oak bark', consumed: true },
    { id: 91501, name: 'Courtly Crest of the Lamplighters', consumed: false },
  ],
  skill: 'crafting', level: 90, xp: 520, station: 'palace_study',
  description: 'The greater seal lasts the year. King-oak bark and the Lamplighter crest required (crest not consumed — shown to the Chancellor).',
});

rel.defineCombination(91506, {
  resultName: 'Guild Badge: Master Smith',
  inputs: [
    { id: 2116, name: 'Runite bar', consumed: true },
    { id: 91006, name: 'King-oak bark', consumed: true },
    { id: 90181, name: 'Big bones', consumed: true },
  ],
  skill: 'smithing', level: 85, xp: 450, station: 'master_anvil',
  description: 'Stamped on the master anvil. Worn by the oldest smiths. Runite, king-oak ash, and big bones charred together.',
});

rel.defineCombination(91507, {
  resultName: 'Guild Badge: Master Herbalist',
  inputs: [
    { id: 90142, name: 'Grimy torstol', consumed: true },
    { id: 91003, name: 'Barn-mouse whisker', consumed: true },
    { id: 91009, name: 'Hearth ash', consumed: true },
  ],
  skill: 'herblore', level: 82, xp: 410, station: 'palace_herbalist',
  description: 'A pin on the Royal Herbalist lapel. Wearers get free cure-salves at the Apothecary.',
});

rel.defineCombination(91508, {
  resultName: 'Guild Badge: Master Lamplighter',
  inputs: [
    { id: 91005, name: 'Dusk soot', consumed: true },
    { id: 91005, name: 'Dusk soot', consumed: true },
    { id: 91005, name: 'Dusk soot', consumed: true },
    { id: 2116, name: 'Runite bar', consumed: true },
  ],
  skill: 'firemaking', level: 80, xp: 395, station: 'lamplighter_forge',
  description: 'Three sachets of dusk soot fused to a runite pin. Only struck at the Lamplighter forge. Badge worn on the apron.',
});

rel.defineCombination(91509, {
  resultName: 'Guild Badge: Master Ranger',
  inputs: [
    { id: 91006, name: 'King-oak bark', consumed: true },
    { id: 2206, name: 'Magic logs', consumed: true },
    { id: 91001, name: 'Dawn wax', consumed: true },
  ],
  skill: 'fletching', level: 85, xp: 470, station: 'bowyer_shop',
  description: 'Carved from king-oak. Hung on a magic-bow string. Waxed at dawn. The Royal Bowyer makes these in silence.',
});

rel.defineCombination(91510, {
  resultName: "Rancher's Bell (Great)",
  inputs: [
    { id: 91004, name: 'Bell-rope fiber bundle', consumed: true },
    { id: 91010, name: 'Fallen bell fragment', consumed: true },
    { id: 2111, name: 'Bronze bar', consumed: true },
    { id: 2111, name: 'Bronze bar', consumed: true },
  ],
  skill: 'smithing', level: 78, xp: 390, station: 'forge',
  description: 'A fuller-voiced version of the bell. Rings the herds in from twice the distance.',
});

// ══════════════════════════════════════════════════════════════════════════════
// ITEM USES — register so the density score picks these up
// ══════════════════════════════════════════════════════════════════════════════

rel.registerItemUse(91001, { type: 'recipe', targetId: 91502, targetName: 'Courtly Crest of the Chapel', region: 'heartlands', details: 'Dawn wax is the chapel crest base.', obscure: true });
rel.registerItemUse(91001, { type: 'recipe', targetId: 91509, targetName: 'Guild Badge: Master Ranger', region: 'heartlands', details: 'Dawn wax finishes the ranger badge.', obscure: true });
rel.registerItemUse(91002, { type: 'recipe', targetId: 91503, targetName: 'Courtly Crest of the Hedge', region: 'heartlands', details: 'Hedge-thorn is only for the Hedge crest.', obscure: true });
rel.registerItemUse(91003, { type: 'recipe', targetId: 91507, targetName: 'Guild Badge: Master Herbalist', region: 'heartlands', details: 'Whiskers are the only source of Master Herbalist pins.', obscure: true });
rel.registerItemUse(91004, { type: 'recipe', targetId: 91510, targetName: "Rancher's Bell (Great)", region: 'heartlands', details: 'The only path to the Great Bell.', obscure: true });
rel.registerItemUse(91005, { type: 'recipe', targetId: 91501, targetName: 'Courtly Crest of the Lamplighters', region: 'heartlands', details: 'Dusk soot is the core of the Lamplighter crest.', obscure: true });
rel.registerItemUse(91006, { type: 'recipe', targetId: 91505, targetName: 'Royal Seal (Greater)', region: 'heartlands', details: 'King-oak bark is only harvested with a warrant.', obscure: true });
rel.registerItemUse(91007, { type: 'recipe', targetId: 91504, targetName: 'Royal Seal (Lesser)', region: 'heartlands', details: 'Three fragments assemble the Lesser Seal.', obscure: true });
rel.registerItemUse(91008, { type: 'recipe', targetId: 91503, targetName: 'Courtly Crest of the Hedge', region: 'heartlands', details: 'Birth-name ink signs the Hedge crest.', obscure: true });
rel.registerItemUse(91009, { type: 'recipe', targetId: 91501, targetName: 'Courtly Crest of the Lamplighters', region: 'heartlands', details: 'Hearth ash bonds the Lamplighter crest.', obscure: true });
rel.registerItemUse(91010, { type: 'recipe', targetId: 91502, targetName: 'Courtly Crest of the Chapel', region: 'heartlands', details: 'Fallen bell fragment tempers the Chapel crest.', obscure: true });
rel.registerItemUse(91010, { type: 'recipe', targetId: 91510, targetName: "Rancher's Bell (Great)", region: 'heartlands', details: 'Fallen bell fragment tempers the Great Bell.', obscure: true });

// ══════════════════════════════════════════════════════════════════════════════
// BREAKPOINTS for the tertiary top-tier methods
// ══════════════════════════════════════════════════════════════════════════════

rel.defineBreakpoint({
  type: 'skill_level', trigger: { skill: 'prayer', level: 70 },
  description: 'Grand Cathedral offerings unlock. Prayer training speed triples. The gilded altar is the fastest prayer XP in Aelgard.',
  unlocks: [{ type: 'training_method', id: 'heartlands_grand_cathedral', description: 'Gilded altar prayer offerings' }],
  importance: 'transformative',
});

rel.defineBreakpoint({
  type: 'skill_level', trigger: { skill: 'cooking', level: 70 },
  description: 'Palace Kitchen service opens. Court food is never burned. The palace range cooks perfectly every time.',
  unlocks: [{ type: 'training_method', id: 'heartlands_palace_kitchen', description: 'Palace Kitchen Service' }],
  importance: 'major',
});

rel.defineBreakpoint({
  type: 'quest_complete', trigger: { quest: 'the_hedge_wise_gift' },
  description: 'The hedge-wise women have written your name. Ley-line crafting opens. The hedge answers to you.',
  unlocks: [
    { type: 'training_method', id: 'heartlands_hedge_runecrafting', description: 'Hedge ley-line runecrafting' },
    { type: 'training_method', id: 'heartlands_midnight_runecraft', description: 'Midnight weaving at the hedge' },
    { type: 'training_method', id: 'heartlands_hedgewise_enchanting', description: 'Hedge-wise enchanting' },
  ],
  importance: 'transformative',
});

rel.defineBreakpoint({
  type: 'quest_complete', trigger: { quest: 'the_royal_warrant' },
  description: "The King's Forest opens. A royal orchard steward's role becomes available. Warrant revalidates weekly.",
  unlocks: [
    { type: 'area', id: 'heartlands_kings_forest', description: "The King's Forest" },
    { type: 'training_method', id: 'heartlands_royal_orchard', description: 'Royal Orchard Stewardship' },
    { type: 'training_method', id: 'heartlands_forest_ranger_woodcutting', description: "King's Forest Rangership" },
  ],
  importance: 'transformative',
});

console.log('[aelgard] Heartlands Tertiary loaded: 16 top-tier methods, 10 obscure methods, 10 courtly combinations, 10 tertiary items, 4 breakpoints');

module.exports = {
  tertiaryMethodCount: 26,  // 16 top-tier + 10 obscure
  courtlyCombinations: 10,
  tertiaryItems: 10,
};
