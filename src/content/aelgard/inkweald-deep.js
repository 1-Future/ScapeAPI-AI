// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Inkweald Deepening (Weird-Unique, Dream-Blur Voice)
//
// Target: push Inkweald from gap score 12 to 48+. Unblock all 16 skills.
//
// The Inkweald is what's left of the old gods' sleep. The forest dreams the
// player. Sentences fold back on themselves. A door opens last. A name goes
// missing. This region's voice is dream-blur — Borges, Calvino, VanderMeer —
// and every method, every quest, every item should read as if the world
// is still almost-remembering-itself.
//
// Sub-zones referenced in this file:
//   - The Lunar Plane (runecrafting, already established)
//   - Mirror Glades (magic, strength/defence/hp combat trials)
//   - Memory Brooks (fishing)
//   - The Backwards Garden (herblore)
//   - Inkweald Hunt (hunter)
//   - The Library That Reads Back (magic + thieving)
//   - Chime Markets (thieving)
//   - Dream Forge (smithing)
//   - Pageturn Court (agility)
//   - Cradlewood (woodcutting)
//   - Sleeper Trails (slayer)
//   - Echo Vaults (runecrafting mid-tier)
//   - Half-Light Range (ranged)
//   - Backseam Camps (construction)
//   - Half-Forgotten Farms (farming)
//   - Vigil Lights (firemaking)
//   - Page-Cap Cookery (cooking)
//   - The Threshold of Names (prayer)
//   - Crystal Mining (mining, Lunar adjacent)
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const rel = require('../../data/relationships');

// ══════════════════════════════════════════════════════════════════════════════
// NEW INKWEALD SOURCES — sub-zones as item origins
// The forest remembers what the forest was holding. The players do the rest.
// ══════════════════════════════════════════════════════════════════════════════

rel.registerItemSource(98250, { type: 'gathering', sourceId: 'inkweald_memory_brook', sourceName: 'Memory Brooks', region: 'inkweald', details: 'Memory-trout. Cooked: restores a skill you forgot you had. Cross-region food.', obscure: false });
rel.registerItemSource(98251, { type: 'gathering', sourceId: 'inkweald_glass_eel_run', sourceName: 'Glass-Eel Run', region: 'inkweald', details: 'Glass-eel. Translucent. Cooks into what-was-promised; heals the last hit you should have dodged.', obscure: false });
rel.registerItemSource(98252, { type: 'gathering', sourceId: 'inkweald_backwards_garden', sourceName: 'The Backwards Garden', region: 'inkweald', details: 'Dream-mint, forget-me-nut, reverse-sage. Grow in reverse; harvest before you plant.', obscure: false });
rel.registerItemSource(98253, { type: 'gathering', sourceId: 'inkweald_hunt_mirror_stag', sourceName: 'Inkweald Hunt — Mirror Stag Tracks', region: 'inkweald', details: 'Answered antler, mirror-hide. Only the stag you already saw lets itself be caught.', obscure: false });
rel.registerItemSource(98254, { type: 'gathering', sourceId: 'inkweald_hunt_ink_fox', sourceName: 'Inkweald Hunt — Ink-Fox Prints', region: 'inkweald', details: 'Ink-fox pelt. Prints fade as you follow. The third turn is where you catch one.', obscure: false });
rel.registerItemSource(98255, { type: 'drop', sourceId: 'inkweald_name_stealing_magpie', sourceName: 'Name-Stealing Magpie', region: 'inkweald', details: 'Stolen name. Thieving secondary. Drop fades if you say it out loud.', obscure: true });
rel.registerItemSource(98256, { type: 'gathering', sourceId: 'inkweald_cradlewood_singing_soft', sourceName: 'Cradlewood — Singing-Soft Logs', region: 'inkweald', details: 'Singing-soft logs. Hum when chopped; quiet when stacked. Fletching/construction.', obscure: false });
rel.registerItemSource(98257, { type: 'gathering', sourceId: 'inkweald_cradlewood_hum_cedar', sourceName: 'Cradlewood — Hum-Cedars', region: 'inkweald', details: 'Hum-cedar. Burns at the pitch of the last song you heard. Dream-firemaking.', obscure: false });
rel.registerItemSource(98258, { type: 'gathering', sourceId: 'inkweald_cradlewood_dream_oak', sourceName: 'Cradlewood — Dream-Oak Clearing', region: 'inkweald', details: 'Dream-oak. High-tier woodcutting; planks hold an idea for one night.', obscure: false });
rel.registerItemSource(98259, { type: 'drop', sourceId: 'inkweald_page_spawn', sourceName: 'Sleeper Trails — Page-Spawn', region: 'inkweald', details: 'Torn page. Slayer drop. Reads different each time you read it.', obscure: false });
rel.registerItemSource(98260, { type: 'drop', sourceId: 'inkweald_ink_shaped', sourceName: 'Sleeper Trails — Ink-Shaped', region: 'inkweald', details: 'Ink-shaped mote. Slayer task monster. Becomes whatever your weapon expects.', obscure: false });
rel.registerItemSource(98261, { type: 'gathering', sourceId: 'inkweald_dream_iron_seam', sourceName: 'Dream Forge — Dream-Iron Seam', region: 'inkweald', details: 'Dream-iron ore. Holds one idea when smelted; the idea is what you forge into it.', obscure: false });
rel.registerItemSource(98262, { type: 'gathering', sourceId: 'inkweald_glass_iron_seam', sourceName: 'Dream Forge — Glass-Iron Seam', region: 'inkweald', details: 'Glass-iron ore. Transparent bar. Works at the Dream Forge only.', obscure: false });
rel.registerItemSource(98263, { type: 'gathering', sourceId: 'inkweald_crystal_mine_lunar', sourceName: 'Lunar-Adjacent Crystal Mine', region: 'inkweald', details: 'Moon-touched crystal shard. Higher-tier than Veilwood crystal. Cycle-day bonus.', obscure: false });
rel.registerItemSource(98264, { type: 'gathering', sourceId: 'inkweald_vigil_lights', sourceName: 'Vigil Lights Field', region: 'inkweald', details: 'Dream-light sap. Rendered into lantern oil that holds one wish.', obscure: false });
rel.registerItemSource(98265, { type: 'drop', sourceId: 'inkweald_library_that_reads_back', sourceName: 'The Library That Reads Back', region: 'inkweald', details: 'Scribe-from-self parchment. Thieving + magic drop. Reads your thoughts; you read its reply.', obscure: true });
rel.registerItemSource(98266, { type: 'gathering', sourceId: 'inkweald_chime_market_lift', sourceName: 'Chime Markets', region: 'inkweald', details: 'Chime-tone. Thieving reward. Not the coin, just the sound of it.', obscure: false });
rel.registerItemSource(98267, { type: 'gathering', sourceId: 'inkweald_half_forgotten_farm', sourceName: 'Half-Forgotten Farms', region: 'inkweald', details: 'Dream-fennel, sleep-cabbage, midnight-melon. Farm at dusk; harvest before you remember planting.', obscure: false });
rel.registerItemSource(98268, { type: 'gathering', sourceId: 'inkweald_threshold_of_names', sourceName: 'The Threshold of Names', region: 'inkweald', details: 'Unsaid-name, sleeper\'s-blessing. Prayer secondary. Cannot be carried across the threshold twice.', obscure: true });

// ══════════════════════════════════════════════════════════════════════════════
// INKWEALD TRAINING METHODS — one-per-blocked-skill, plus redundancy & top tiers
// Dream-blur voice. No method is strictly-better. Every knob leaks into another.
// ══════════════════════════════════════════════════════════════════════════════

// ATTACK — Mirror Glades combat trial (you fight your own reflection)
rel.defineTrainingMethod('inkweald_mirror_glade_trial_attack', {
  skill: 'attack', name: 'Mirror Glade — Fighting What You Were',
  levelRange: [40, 99], xpPerHour: 72000,
  prerequisites: { skills: { attack: 40 }, quests: ['mirror_stag'], items: [], areas: ['inkweald_mirror_glades'] },
  resourceOutput: { produces: [{ name: 'Answered antler', perHour: 6 }, { name: 'Mirror-hide', perHour: 18 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 4000,
  danger: 'medium', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Mid-tier food', perHour: 25, source: 'inkweald_page_cap_cookery' }],
  description: 'You fight your reflection. It knows your openings before you do. Marstead — you must be everything.',
  location: 'Inkweald',
});

rel.defineTrainingMethod('inkweald_sleeper_trails_attack', {
  skill: 'attack', name: 'Sleeper Trails — Named-Things-That-Shouldn\'t-Be-Named',
  levelRange: [1, 60], xpPerHour: 45000,
  prerequisites: { skills: {}, quests: ['what_was_at_the_third_turn'], items: [], areas: ['inkweald'] },
  resourceOutput: { produces: [{ name: 'Torn page', perHour: 140 }, { name: 'Gold coins', perHour: 28000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'low', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Basic food', perHour: 18, source: 'cooking' }],
  description: 'Walk the trail. Kill what the forest names at you. Forget it immediately. Pages pile in your bag.',
  location: 'Inkweald',
});

// STRENGTH — Mirror Glade same trial, different stance
rel.defineTrainingMethod('inkweald_mirror_glade_trial_strength', {
  skill: 'strength', name: 'Mirror Glade — Overpowering What You Were',
  levelRange: [40, 99], xpPerHour: 76000,
  prerequisites: { skills: { strength: 40 }, quests: ['mirror_stag'], items: [], areas: ['inkweald_mirror_glades'] },
  resourceOutput: { produces: [{ name: 'Mirror-hide', perHour: 18 }, { name: 'Answered antler', perHour: 4 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 4000,
  danger: 'medium', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Mid-tier food', perHour: 26, source: 'inkweald_page_cap_cookery' }],
  description: 'You out-lift the version of you who hasn\'t slept well. It doesn\'t go easy. Neither do you.',
  location: 'Inkweald',
});

rel.defineTrainingMethod('inkweald_cradlewood_hauling_strength', {
  skill: 'strength', name: 'Cradlewood Log Hauling',
  levelRange: [1, 70], xpPerHour: 32000,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['inkweald_cradlewood'] },
  resourceOutput: { produces: [{ name: 'Hum-cedar logs', perHour: 90 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'afk',
  inputs: [],
  description: 'Carry singing-soft logs to the clearing. They grow heavier the longer you remember the song.',
  location: 'Inkweald',
});

// DEFENCE — Mirror Glade, defensive stance
rel.defineTrainingMethod('inkweald_mirror_glade_trial_defence', {
  skill: 'defence', name: 'Mirror Glade — Refusing What You Were',
  levelRange: [40, 99], xpPerHour: 68000,
  prerequisites: { skills: { defence: 40 }, quests: ['mirror_stag'], items: [], areas: ['inkweald_mirror_glades'] },
  resourceOutput: { produces: [{ name: 'Mirror-hide', perHour: 24 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 4000,
  danger: 'medium', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Mid-tier food', perHour: 20, source: 'inkweald_page_cap_cookery' }],
  description: 'You refuse the hit your reflection was always going to land. Every block teaches you something.',
  location: 'Inkweald',
});

rel.defineTrainingMethod('inkweald_sleepwalker_defence', {
  skill: 'defence', name: 'Sleepwalker Ward-Stance',
  levelRange: [1, 50], xpPerHour: 28000,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['inkweald'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'low', complexity: 'simple', attention: 'low',
  inputs: [{ name: 'Basic food', perHour: 15, source: 'cooking' }],
  description: 'Stand between the sleepwalkers and the waking. Let them walk through you. Learn what doesn\'t wake them.',
  location: 'Inkweald',
});

// HITPOINTS — covered by mirror trial + a dream-soaked AFK method
rel.defineTrainingMethod('inkweald_dreamless_rest_hp', {
  skill: 'hitpoints', name: 'Dreamless Rest at the Threshold',
  levelRange: [1, 50], xpPerHour: 11000,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['inkweald_threshold_of_names'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'afk',
  inputs: [],
  description: 'Sleep without dreaming on the threshold stones. Your body remembers how to be a body.',
  location: 'Inkweald',
});

rel.defineTrainingMethod('inkweald_mirror_glade_trial_hp', {
  skill: 'hitpoints', name: 'Mirror Glade — Being Hit by Yourself',
  levelRange: [40, 99], xpPerHour: 24000,
  prerequisites: { skills: { hitpoints: 40 }, quests: ['mirror_stag'], items: [], areas: ['inkweald_mirror_glades'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'moderate', costPerHour: 4000,
  danger: 'medium', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Mid-tier food', perHour: 22, source: 'inkweald_page_cap_cookery' }],
  description: 'Take the hits you always land. Your reflection knows how. You\'re going to learn.',
  location: 'Inkweald',
});

// RANGED — Half-Light Range (dream-arrows, mirror-bows)
rel.defineTrainingMethod('inkweald_half_light_range_basic', {
  skill: 'ranged', name: 'Half-Light Range Practice',
  levelRange: [1, 60], xpPerHour: 42000,
  prerequisites: { skills: {}, quests: [], items: [{ name: 'Shortbow' }], areas: ['inkweald_half_light_range'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'moderate', costPerHour: 3000,
  danger: 'none', complexity: 'simple', attention: 'medium',
  inputs: [{ name: 'Bronze arrow', perHour: 1800, source: 'fletching' }],
  description: 'Aim at what-was-aimed-at. The target is always half-missed; the XP is full.',
  location: 'Inkweald',
});

rel.defineTrainingMethod('inkweald_dream_arrow_volley', {
  skill: 'ranged', name: 'Dream-Arrow Volley',
  levelRange: [60, 99], xpPerHour: 88000,
  prerequisites: { skills: { ranged: 60, fletching: 40 }, quests: ['halflit_vigil'], items: [{ name: 'Mirror-bow' }], areas: ['inkweald_half_light_range'] },
  resourceOutput: { produces: [{ name: 'Stolen name', perHour: 14 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 14000,
  danger: 'low', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Dream-arrow', perHour: 1500, source: 'inkweald_fletching_dream_shafts' }],
  description: 'Loose dream-arrows at the Half-Light targets. They land where you meant to aim, even when you didn\'t.',
  location: 'Inkweald',
});

// CONSTRUCTION — Backseam Camps (dream-frame, half-true walls)
rel.defineTrainingMethod('inkweald_backseam_camp_construction', {
  skill: 'construction', name: 'Backseam Camp — Dream-Frame Raising',
  levelRange: [1, 60], xpPerHour: 58000,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['inkweald_backseam_camps'] },
  resourceOutput: { produces: [], net: 'loss' },
  bankingFrequency: 'frequent', costPerHour: 28000,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Singing-soft logs', perHour: 500, source: 'inkweald_cradlewood_singing_soft' }, { name: 'Dream-iron nails', perHour: 800, source: 'inkweald_dream_forge' }],
  description: 'Raise a half-true wall. It\'s there until someone really looks. Then you raise it again.',
  location: 'Inkweald',
});

rel.defineTrainingMethod('inkweald_dream_oak_pavilion', {
  skill: 'construction', name: 'Dream-Oak Pavilion Construction',
  levelRange: [60, 99], xpPerHour: 260000,
  prerequisites: { skills: { construction: 60, woodcutting: 75 }, quests: ['the_door_that_opens_last'], items: [], areas: ['inkweald'] },
  resourceOutput: { produces: [], net: 'loss' },
  bankingFrequency: 'frequent', costPerHour: 340000,
  danger: 'none', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Dream-oak plank', perHour: 900, source: 'inkweald_cradlewood_dream_oak' }, { name: 'Glass-iron hinges', perHour: 300, source: 'inkweald_dream_forge' }],
  description: 'Build a pavilion that holds a single idea overnight. POH-tier XP with dream-flavored rooms.',
  location: 'Inkweald',
});

// HERBLORE — The Backwards Garden (reverse-decay, dream-mints, forget-me-nut)
rel.defineTrainingMethod('inkweald_backwards_garden_herblore', {
  skill: 'herblore', name: 'The Backwards Garden — Reverse-Decay Brewing',
  levelRange: [15, 80], xpPerHour: 82000,
  prerequisites: { skills: { herblore: 15 }, quests: ['the_backwards_garden'], items: [], areas: ['inkweald_backwards_garden'] },
  resourceOutput: { produces: [{ name: 'Reverse-decay potion', perHour: 280 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Dream-mint', perHour: 280, source: 'inkweald_backwards_garden' }, { name: 'Forget-me-nut', perHour: 140, source: 'inkweald_backwards_garden' }, { name: 'Vial of water', perHour: 280, source: 'heartlands_apothecary' }],
  description: 'The potion undoes the last ten seconds. You drink it before you need it. The herbs were harvested before you planted them.',
  location: 'Inkweald',
});

rel.defineTrainingMethod('inkweald_lucid_bloom_brewing', {
  skill: 'herblore', name: 'Lucid Bloom Brewing',
  levelRange: [50, 99], xpPerHour: 115000,
  prerequisites: { skills: { herblore: 50 }, quests: ['the_paradox_philosopher'], items: [], areas: ['inkweald'] },
  resourceOutput: { produces: [{ name: 'Lucid potion', perHour: 200 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Lucid essence', perHour: 200, source: 'inkweald_lucid_bloom' }, { name: 'Echo petal', perHour: 200, source: 'inkweald_lucid_bloom' }],
  description: 'Brew lucidity. Two minutes of perfect clarity. You forget what you thought about.',
  location: 'Inkweald',
});

// FLETCHING — Dream-arrow and mirror-bow crafting
rel.defineTrainingMethod('inkweald_fletching_dream_shafts', {
  skill: 'fletching', name: 'Dream-Arrow Fletching',
  levelRange: [20, 80], xpPerHour: 92000,
  prerequisites: { skills: { fletching: 20 }, quests: [], items: [], areas: ['inkweald'] },
  resourceOutput: { produces: [{ name: 'Dream-arrow', perHour: 1400 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'simple', attention: 'low',
  inputs: [{ name: 'Singing-soft logs', perHour: 200, source: 'inkweald_cradlewood_singing_soft' }, { name: 'Magpie feather', perHour: 1400, source: 'inkweald_name_stealing_magpie' }],
  description: 'Fletch arrows whose shafts still half-remember the tree. They hum before they leave the bow.',
  location: 'Inkweald',
});

rel.defineTrainingMethod('inkweald_mirror_bow_fletching', {
  skill: 'fletching', name: 'Mirror-Bow Fletching',
  levelRange: [55, 99], xpPerHour: 110000,
  prerequisites: { skills: { fletching: 55 }, quests: ['mirror_stag'], items: [], areas: ['inkweald'] },
  resourceOutput: { produces: [{ name: 'Mirror-bow', perHour: 120 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Dream-oak plank', perHour: 120, source: 'inkweald_cradlewood_dream_oak' }, { name: 'Bowstring', perHour: 120, source: 'heartlands_bowstring_spinning' }, { name: 'Mirror-hide', perHour: 120, source: 'inkweald_hunt_mirror_stag' }],
  description: 'Shape the bow so it catches the shot back. Mirror-bows fire what-was-aimed-at. +10% vs dream-kind.',
  location: 'Inkweald',
});

// SLAYER — Sleeper Trails, dream-tier tasks
rel.defineTrainingMethod('inkweald_sleeper_trails_slayer', {
  skill: 'slayer', name: 'Sleeper Trails Slayer Tasks',
  levelRange: [40, 99], xpPerHour: 62000,
  prerequisites: { skills: { slayer: 40 }, quests: ['what_was_at_the_third_turn'], items: [], areas: ['inkweald'] },
  resourceOutput: { produces: [{ name: 'Gold coins', perHour: 95000 }, { name: 'Slayer points', perHour: 34 }, { name: 'Stolen name', perHour: 8 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 10000,
  danger: 'high', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Memory-trout (cooked)', perHour: 35, source: 'inkweald_page_cap_cookery' }, { name: 'Super combat potion', perHour: 2, source: 'herblore' }],
  description: 'Slay the named-things-that-shouldn\'t-be-named. Ink-shaped. Page-spawn. Tasks pay in what the forest forgot.',
  location: 'Inkweald',
  breakpointAt: 40,
});

// HUNTER — Inkweald Hunt (mirror-stags, ink-foxes, name-stealing magpies)
rel.defineTrainingMethod('inkweald_hunt_fox_snare', {
  skill: 'hunter', name: 'Ink-Fox Snaring',
  levelRange: [20, 70], xpPerHour: 58000,
  prerequisites: { skills: { hunter: 20 }, quests: [], items: [{ name: 'Snare' }], areas: ['inkweald'] },
  resourceOutput: { produces: [{ name: 'Ink-fox pelt', perHour: 110 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [],
  description: 'Snare ink-foxes at the third turn. Prints fade if you look straight at them. Go sideways.',
  location: 'Inkweald',
});

rel.defineTrainingMethod('inkweald_hunt_mirror_stag_route', {
  skill: 'hunter', name: 'Mirror-Stag Route',
  levelRange: [70, 99], xpPerHour: 96000,
  prerequisites: { skills: { hunter: 70 }, quests: ['mirror_stag'], items: [{ name: 'Answered antler' }], areas: ['inkweald'] },
  resourceOutput: { produces: [{ name: 'Mirror-hide', perHour: 40 }, { name: 'Answered antler', perHour: 8 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'low', complexity: 'complex', attention: 'high',
  inputs: [],
  description: 'Hunt what you already saw. Only the stag you\'ve already met lets itself be caught. Mirror-hide feeds BIS cape.',
  location: 'Inkweald',
});

rel.defineTrainingMethod('inkweald_magpie_netting', {
  skill: 'hunter', name: 'Name-Stealing Magpie Netting',
  levelRange: [45, 90], xpPerHour: 72000,
  prerequisites: { skills: { hunter: 45 }, quests: [], items: [{ name: 'Butterfly net' }], areas: ['inkweald'] },
  resourceOutput: { produces: [{ name: 'Magpie feather', perHour: 180 }, { name: 'Stolen name', perHour: 12 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'low', complexity: 'moderate', attention: 'medium',
  inputs: [],
  description: 'Catch magpies that steal the names of small things. Don\'t speak their take aloud — the names fade.',
  location: 'Inkweald',
});

// MINING — Dream-iron, glass-iron, lunar-adjacent crystal
rel.defineTrainingMethod('inkweald_dream_iron_mining', {
  skill: 'mining', name: 'Dream Forge — Dream-Iron Mining',
  levelRange: [30, 99], xpPerHour: 52000,
  prerequisites: { skills: { mining: 30 }, quests: [], items: [{ name: 'Pickaxe' }], areas: ['inkweald_dream_forge'] },
  resourceOutput: { produces: [{ name: 'Dream-iron ore', perHour: 320 }, { name: 'Glass-iron ore', perHour: 60 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'low', complexity: 'simple', attention: 'low',
  inputs: [],
  description: 'Mine dream-iron. The ore fades if you set it down and walk off. Keep moving. Keep holding it.',
  location: 'Inkweald',
});

rel.defineTrainingMethod('inkweald_crystal_mine_lunar', {
  skill: 'mining', name: 'Lunar-Adjacent Crystal Mining',
  levelRange: [75, 99], xpPerHour: 78000,
  prerequisites: { skills: { mining: 75 }, quests: ['lunar_diplomacy'], items: [{ name: 'Crystal pickaxe' }], areas: ['inkweald_lunar_plane'] },
  resourceOutput: { produces: [{ name: 'Moon-touched crystal shard', perHour: 140 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'low', complexity: 'simple', attention: 'low',
  inputs: [],
  description: 'Mine crystal where the Lunar Plane leaks into the Inkweald. Cycle days yield +50%. Higher tier than Veilwood.',
  location: 'Inkweald',
  breakpointAt: 75,
});

// SMITHING — Dream Forge (metal that holds an idea)
rel.defineTrainingMethod('inkweald_dream_forge_smithing', {
  skill: 'smithing', name: 'Dream Forge — Idea-Holding Smithing',
  levelRange: [30, 85], xpPerHour: 105000,
  prerequisites: { skills: { smithing: 30 }, quests: [], items: [], areas: ['inkweald_dream_forge'] },
  resourceOutput: { produces: [{ name: 'Dream-iron bar', perHour: 200 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Dream-iron ore', perHour: 400, source: 'inkweald_dream_iron_mining' }, { name: 'Coal', perHour: 600, source: 'mining' }],
  description: 'Smelt the idea into the bar. Whatever you were thinking when you struck — that\'s what the bar remembers.',
  location: 'Inkweald',
});

rel.defineTrainingMethod('inkweald_glass_iron_smithing', {
  skill: 'smithing', name: 'Dream Forge — Glass-Iron Working',
  levelRange: [70, 99], xpPerHour: 132000,
  prerequisites: { skills: { smithing: 70 }, quests: ['the_door_that_opens_last'], items: [], areas: ['inkweald_dream_forge'] },
  resourceOutput: { produces: [{ name: 'Glass-iron bar', perHour: 160 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Glass-iron ore', perHour: 160, source: 'inkweald_dream_iron_mining' }, { name: 'Coal', perHour: 800, source: 'mining' }],
  description: 'Glass-iron. Transparent bars. You can see what the metal was going to become before you made it.',
  location: 'Inkweald',
});

// FISHING — Memory Brooks + Glass-Eel Run
rel.defineTrainingMethod('inkweald_memory_brook_fishing', {
  skill: 'fishing', name: 'Memory Brook Fishing',
  levelRange: [15, 70], xpPerHour: 44000,
  prerequisites: { skills: { fishing: 15 }, quests: ['memory_brooks_apprentice'], items: [{ name: 'Fishing rod' }], areas: ['inkweald'] },
  resourceOutput: { produces: [{ name: 'Raw memory-trout', perHour: 220 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'afk',
  inputs: [{ name: 'Feathers', perHour: 220, source: 'heartlands_chicken' }],
  description: 'Fish what was promised. The brook returns the memory you fed it. Trout taste like a summer you almost had.',
  location: 'Inkweald',
});

rel.defineTrainingMethod('inkweald_glass_eel_fishing', {
  skill: 'fishing', name: 'Glass-Eel Run',
  levelRange: [55, 99], xpPerHour: 74000,
  prerequisites: { skills: { fishing: 55 }, quests: ['memory_brooks_apprentice'], items: [], areas: ['inkweald'] },
  resourceOutput: { produces: [{ name: 'Raw glass-eel', perHour: 150 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'simple', attention: 'low',
  inputs: [],
  description: 'The glass-eel runs when the moon is not looking. You catch them by not watching the line.',
  location: 'Inkweald',
});

// COOKING — Page-Cap Cookery (recipes you forget halfway)
rel.defineTrainingMethod('inkweald_page_cap_cookery', {
  skill: 'cooking', name: 'Page-Cap Cookery',
  levelRange: [1, 85], xpPerHour: 145000,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['inkweald'] },
  resourceOutput: { produces: [{ name: 'Memory-trout (cooked)', perHour: 1400 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Raw memory-trout', perHour: 1400, source: 'inkweald_memory_brook_fishing' }],
  description: 'Cook at the Page-Cap fire. You\'ll forget the recipe halfway through. The dish finishes anyway.',
  location: 'Inkweald',
});

rel.defineTrainingMethod('inkweald_midnight_melon_baking', {
  skill: 'cooking', name: 'Midnight-Melon Baking',
  levelRange: [35, 99], xpPerHour: 92000,
  prerequisites: { skills: { cooking: 35 }, quests: [], items: [], areas: ['inkweald'] },
  resourceOutput: { produces: [{ name: 'Midnight-melon slice', perHour: 320 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'simple', attention: 'low',
  inputs: [{ name: 'Midnight-melon', perHour: 320, source: 'inkweald_half_forgotten_farm' }],
  description: 'Bake at midnight, exactly. The melons taste like what you wanted to say in a dream.',
  location: 'Inkweald',
});

// WOODCUTTING — Cradlewood (singing-soft, hum-cedar, dream-oak)
rel.defineTrainingMethod('inkweald_cradlewood_singing_soft_wc', {
  skill: 'woodcutting', name: 'Cradlewood — Singing-Soft Chopping',
  levelRange: [15, 60], xpPerHour: 52000,
  prerequisites: { skills: { woodcutting: 15 }, quests: [], items: [{ name: 'Axe' }], areas: ['inkweald_cradlewood'] },
  resourceOutput: { produces: [{ name: 'Singing-soft logs', perHour: 300 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'afk',
  inputs: [],
  description: 'Chop what the forest hums. Each log holds the last line of the song. Quiet when stacked.',
  location: 'Inkweald',
});

rel.defineTrainingMethod('inkweald_dream_oak_wc', {
  skill: 'woodcutting', name: 'Cradlewood — Dream-Oak Felling',
  levelRange: [75, 99], xpPerHour: 68000,
  prerequisites: { skills: { woodcutting: 75 }, quests: ['the_door_that_opens_last'], items: [{ name: 'Crystal axe' }], areas: ['inkweald_cradlewood'] },
  resourceOutput: { produces: [{ name: 'Dream-oak logs', perHour: 110 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'simple', attention: 'low',
  inputs: [],
  description: 'Fell dream-oak. The tree gives you one log and one night of the idea it was holding.',
  location: 'Inkweald',
  breakpointAt: 75,
});

// FARMING — Half-Forgotten Farms (dream-fennel, sleep-cabbage, midnight-melon)
rel.defineTrainingMethod('inkweald_half_forgotten_farming', {
  skill: 'farming', name: 'Half-Forgotten Farms',
  levelRange: [25, 99], xpPerHour: 62000,
  prerequisites: { skills: { farming: 25 }, quests: ['the_backwards_garden'], items: [], areas: ['inkweald'] },
  resourceOutput: { produces: [{ name: 'Dream-fennel', perHour: 90 }, { name: 'Sleep-cabbage', perHour: 60 }, { name: 'Midnight-melon', perHour: 40 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 3000,
  danger: 'none', complexity: 'moderate', attention: 'low',
  inputs: [{ name: 'Dream-seed', perHour: 12, source: 'inkweald_seed_keeper' }],
  description: 'Plant at dusk. Harvest before you remember planting. The crops grow in the direction of yesterday.',
  location: 'Inkweald',
});

// Extra firemaking tier (the existing firemaking caps at 60 elsewhere) —
// push to 99 via Vigil Lights / hum-cedar
rel.defineTrainingMethod('inkweald_vigil_lights_firemaking', {
  skill: 'firemaking', name: 'Vigil Lights — Lantern of the Dreamless',
  levelRange: [35, 99], xpPerHour: 175000,
  prerequisites: { skills: { firemaking: 35 }, quests: ['halflit_vigil'], items: [], areas: ['inkweald'] },
  resourceOutput: { produces: [{ name: 'Dream-light sap', perHour: 180 }], net: 'neutral' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Hum-cedar logs', perHour: 900, source: 'inkweald_cradlewood_hum_cedar' }],
  description: 'Light the Vigil Lanterns. Each lantern burns at the pitch of the last song you heard. Highest firemaking outside Wintertodt.',
  location: 'Inkweald',
});

// PRAYER — The Threshold of Names (dream-warding, sleeper's blessing)
rel.defineTrainingMethod('inkweald_threshold_prayer', {
  skill: 'prayer', name: 'Threshold of Names — Dream-Warding',
  levelRange: [40, 99], xpPerHour: 140000,
  prerequisites: { skills: { prayer: 40 }, quests: ['by_page_by_margin_by_self'], items: [], areas: ['inkweald_threshold_of_names'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'rare', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'low',
  inputs: [{ name: 'Dragon bones', perHour: 200, source: 'combat_drops' }, { name: 'Unsaid-name', perHour: 20, source: 'inkweald_threshold_of_names' }],
  description: 'Name what you will not name. Each unsaid name burns one bone. Prayer XP climbs at the rate of silence.',
  location: 'Inkweald',
});

// MAGIC — The Library That Reads Back (mind/illusion/dreambinding spells)
rel.defineTrainingMethod('inkweald_library_that_reads_back', {
  skill: 'magic', name: 'The Library That Reads Back',
  levelRange: [55, 99], xpPerHour: 135000,
  prerequisites: { skills: { magic: 55 }, quests: ['the_library_that_reads_back'], items: [], areas: ['inkweald'] },
  resourceOutput: { produces: [{ name: 'Scribe-from-self parchment', perHour: 90 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 28000,
  danger: 'low', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Astral rune', perHour: 1400, source: 'runecrafting' }, { name: 'Mind rune', perHour: 2800, source: 'runecrafting' }, { name: 'Water rune', perHour: 2800, source: 'runecrafting' }],
  description: 'Cast dreambinding + illusion from shelves that rearrange your thoughts. Elite Lunar-tier methodology.',
  location: 'Inkweald',
});

// AGILITY — Pageturn Court (run the index of the year)
rel.defineTrainingMethod('inkweald_pageturn_court_agility', {
  skill: 'agility', name: 'Pageturn Court — Page-Vault Course',
  levelRange: [40, 80], xpPerHour: 66000,
  prerequisites: { skills: { agility: 40 }, quests: ['the_door_that_opens_last'], items: [], areas: ['inkweald'] },
  resourceOutput: { produces: [{ name: 'Marks of grace', perHour: 24 }], net: 'profit' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'low', complexity: 'complex', attention: 'high',
  inputs: [],
  description: 'Run the index of the year. Page-vault; margin-walk. The court re-foliates behind you. Don\'t look back.',
  location: 'Inkweald',
  breakpointAt: 40,
});

// THIEVING — Chime Markets (lift the chime, not the coin) + Library stealing
rel.defineTrainingMethod('inkweald_chime_markets_thieving', {
  skill: 'thieving', name: 'Chime Markets — Lift the Chime',
  levelRange: [35, 99], xpPerHour: 98000,
  prerequisites: { skills: { thieving: 35 }, quests: [], items: [], areas: ['inkweald'] },
  resourceOutput: { produces: [{ name: 'Gold coins', perHour: 85000 }, { name: 'Chime-tone', perHour: 40 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 0,
  danger: 'low', complexity: 'complex', attention: 'high',
  inputs: [],
  description: 'Lift the chime, not the coin. The merchant notices what\'s missing, not what\'s taken. Iconic Inkweald thieving.',
  location: 'Inkweald',
});

rel.defineTrainingMethod('inkweald_library_steal_thieving', {
  skill: 'thieving', name: 'Steal-From-Shelf Thieving',
  levelRange: [65, 99], xpPerHour: 115000,
  prerequisites: { skills: { thieving: 65 }, quests: ['the_library_that_reads_back'], items: [], areas: ['inkweald'] },
  resourceOutput: { produces: [{ name: 'Scribe-from-self parchment', perHour: 60 }, { name: 'Gold coins', perHour: 70000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'medium', complexity: 'complex', attention: 'high',
  inputs: [],
  description: 'Steal from the Library that reads back. The shelves remember you. Don\'t come back the same way.',
  location: 'Inkweald',
});

// RUNECRAFTING — Echo Vaults (dream-rune, name-rune)
rel.defineTrainingMethod('inkweald_echo_vaults_rc', {
  skill: 'runecrafting', name: 'Echo Vaults — Dream-Rune Crafting',
  levelRange: [55, 90], xpPerHour: 42000,
  prerequisites: { skills: { runecrafting: 55 }, quests: [], items: [], areas: ['inkweald'] },
  resourceOutput: { produces: [{ name: 'Dream rune', perHour: 1500 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'low',
  inputs: [{ name: 'Pure essence', perHour: 1500, source: 'mining' }],
  description: 'Dream runes at the Echo Vaults. Mid-tier Lunar-kin. Feeds every Lunar spell in Aelgard.',
  location: 'Inkweald',
});

rel.defineTrainingMethod('inkweald_name_rune_rc', {
  skill: 'runecrafting', name: 'Echo Vaults — Name-Rune Crafting',
  levelRange: [72, 99], xpPerHour: 52000,
  prerequisites: { skills: { runecrafting: 72 }, quests: ['by_page_by_margin_by_self'], items: [], areas: ['inkweald'] },
  resourceOutput: { produces: [{ name: 'Name rune', perHour: 1200 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'complex', attention: 'medium',
  inputs: [{ name: 'Pure essence', perHour: 1200, source: 'mining' }, { name: 'Unsaid-name', perHour: 40, source: 'inkweald_threshold_of_names' }],
  description: 'Craft runes that call a thing by what it almost was. Required for dreambinding prayers.',
  location: 'Inkweald',
  breakpointAt: 72,
});

// CRAFTING — redundant Inkweald crafting (glass-iron jewelry, mirror-hide capes)
rel.defineTrainingMethod('inkweald_glass_iron_jewelry', {
  skill: 'crafting', name: 'Glass-Iron Jewelry Crafting',
  levelRange: [50, 99], xpPerHour: 88000,
  prerequisites: { skills: { crafting: 50 }, quests: [], items: [], areas: ['inkweald_dream_forge'] },
  resourceOutput: { produces: [{ name: 'Glass-iron ring', perHour: 80 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Glass-iron bar', perHour: 80, source: 'inkweald_glass_iron_smithing' }, { name: 'Moon-touched crystal shard', perHour: 40, source: 'inkweald_crystal_mine_lunar' }],
  description: 'Craft glass-iron rings at the Dream Forge. Transparent; they show the ring you wanted to be wearing.',
  location: 'Inkweald',
});

// ══════════════════════════════════════════════════════════════════════════════
// INKWEALD QUESTS — 10 new quests, every one a Metroidvania key
// Dream-blur titles. Unique non-degenerate unlocks.
// ══════════════════════════════════════════════════════════════════════════════

rel.defineQuestUnlock('the_door_that_opens_last', {
  name: 'The Door That Opens Last',
  unlocks: [
    { type: 'training_method', id: 'inkweald_pageturn_court_agility', description: 'Pageturn Court — full page-vault course, marks of grace run' },
    { type: 'area', id: 'inkweald_pageturn_court', description: 'Pageturn Court opens. The door was always last. Now it opens.' },
    { type: 'item_equip', id: 'index_keystone', description: 'Index Keystone — indexes any book you own; scrolls you\'ve read become teleports' },
  ],
});

rel.defineQuestUnlock('memory_brooks_apprentice', {
  name: "Memory Brook's Apprentice",
  unlocks: [
    { type: 'training_method', id: 'inkweald_memory_brook_fishing', description: 'Memory Brook fishing + glass-eel run' },
    { type: 'item_equip', id: 'remembered_line', description: 'A Remembered Line — fishing line that catches what-was-promised; never tangles' },
  ],
});

rel.defineQuestUnlock('what_was_at_the_third_turn', {
  name: 'What Was At The Third Turn',
  unlocks: [
    { type: 'training_method', id: 'inkweald_sleeper_trails_slayer', description: 'Sleeper Trails slayer tasks — dream-tier' },
    { type: 'npc', id: 'third_turn_slayer_master', description: 'The Slayer Master Who Is Not There Until You Walk Past Her' },
    { type: 'item_equip', id: 'third_turn_compass', description: 'Third-Turn Compass — always points to what you were looking for two steps ago' },
  ],
});

rel.defineQuestUnlock('halflit_vigil', {
  name: 'Halflit Vigil',
  unlocks: [
    { type: 'training_method', id: 'inkweald_vigil_lights_firemaking', description: 'Dream-light firemaking at the Vigil Lanterns' },
    { type: 'item_equip', id: 'lantern_of_the_dreamless', description: 'Lantern of the Dreamless — holds a single wish for one night; burns no fuel while held by a sleeper' },
  ],
});

rel.defineQuestUnlock('the_backwards_garden', {
  name: 'The Backwards Garden',
  unlocks: [
    { type: 'training_method', id: 'inkweald_backwards_garden_herblore', description: 'Reverse-decay potion brewing' },
    { type: 'recipe', id: 'reverse_decay_potion', description: 'Reverse-decay potion — undoes the last ten seconds of damage taken' },
    { type: 'area', id: 'inkweald_backwards_garden', description: 'Backwards Garden herb patches (grow in reverse; harvest before planting)' },
  ],
});

rel.defineQuestUnlock('the_library_that_reads_back', {
  name: 'The Library That Reads Back',
  unlocks: [
    { type: 'training_method', id: 'inkweald_library_that_reads_back', description: 'Library-tier magic training' },
    { type: 'spellbook', id: 'dreambinding_spellbook', description: 'Dreambinding spellbook — three random spell scrolls per character (non-degenerate, player-varied)' },
    { type: 'area', id: 'inkweald_library_upper_stacks', description: 'The upper stacks open. The shelves rearrange when you\'re not looking.' },
  ],
});

rel.defineQuestUnlock('by_page_by_margin_by_self', {
  name: 'By Page, By Margin, By Self',
  unlocks: [
    { type: 'spellbook', id: 'dream_warding_prayer_book', description: 'Dream-warding prayer book — new prayers: Sleeper\'s Blessing, True-Name Binding, Margin-Walk' },
    { type: 'training_method', id: 'inkweald_name_rune_rc', description: 'Name-rune crafting at the Echo Vaults' },
  ],
});

rel.defineQuestUnlock('mirror_stag', {
  name: 'Mirror Stag',
  unlocks: [
    { type: 'training_method', id: 'inkweald_hunt_mirror_stag_route', description: 'Mirror-stag hunter route' },
    { type: 'item_equip', id: 'answered_antler_cape', description: 'Answered Antler Cape — BIS prayer-switch cape in dream-kind combat; reflects a single hit per minute' },
    { type: 'training_method', id: 'inkweald_mirror_glade_trial_attack', description: 'Mirror Glade combat trials (attack/str/def/hp simultaneously)' },
  ],
});

rel.defineQuestUnlock('the_chime_that_did_not_sound', {
  name: 'The Chime That Did Not Sound',
  unlocks: [
    { type: 'shop', id: 'inkweald_chime_black_market', description: 'Chime Market fence — buys chime-tones and stolen names at fair rates' },
    { type: 'item_equip', id: 'silent_lifter', description: 'Silent Lifter — thieving gloves; your target never hears the chime' },
  ],
});

rel.defineQuestUnlock('the_forge_that_remembers_a_hammer', {
  name: 'The Forge That Remembers a Hammer',
  unlocks: [
    { type: 'training_method', id: 'inkweald_glass_iron_smithing', description: 'Glass-iron smithing — transparent bars' },
    { type: 'item_equip', id: 'dream_anvil_hammer', description: 'Dream-Anvil Hammer — forges ideas into metal; +5% smithing XP in Inkweald' },
  ],
});

rel.defineQuestUnlock('the_midnight_cousin', {
  name: 'The Midnight Cousin',
  unlocks: [
    { type: 'training_method', id: 'inkweald_half_forgotten_farming', description: 'Half-Forgotten Farm patches (dream-fennel, sleep-cabbage, midnight-melon)' },
    { type: 'npc', id: 'seed_keeper_the_midnight_cousin', description: 'Seed-Keeper — your midnight-cousin; gives dream-seeds nightly' },
    { type: 'item_equip', id: 'midnight_cousins_pendant', description: "Midnight-Cousin's Pendant — one dream-farming run per day auto-succeeds" },
  ],
});

// ══════════════════════════════════════════════════════════════════════════════
// BREAKPOINTS — Inkweald threshold moments (transformative identity shifts)
// ══════════════════════════════════════════════════════════════════════════════

rel.defineBreakpoint({
  type: 'quest_complete', trigger: { quest: 'the_door_that_opens_last' },
  description: 'The door opens last. Pageturn Court unlocked. The forest\'s geometry starts reading like a bound volume. Transformative moment.',
  unlocks: [
    { type: 'area', id: 'inkweald_pageturn_court', description: 'Pageturn Court full course' },
    { type: 'item_equip', id: 'index_keystone', description: 'Index Keystone — book-to-teleport chain' },
  ],
  importance: 'transformative',
});

rel.defineBreakpoint({
  type: 'quest_complete', trigger: { quest: 'mirror_stag' },
  description: 'Answered Antler Cape equipped. Mirror-Glade combat trials open. You can fight yourself now. You begin to win.',
  unlocks: [
    { type: 'item_equip', id: 'answered_antler_cape', description: 'Answered Antler Cape' },
    { type: 'training_method', id: 'inkweald_mirror_glade_trial_attack', description: 'Mirror Glade combat' },
  ],
  importance: 'transformative',
});

rel.defineBreakpoint({
  type: 'quest_complete', trigger: { quest: 'the_library_that_reads_back' },
  description: 'Dreambinding spellbook. Three random scrolls per character — no two players the same. Non-degenerate variety baked in.',
  unlocks: [{ type: 'spellbook', id: 'dreambinding_spellbook', description: 'Dreambinding — per-character randomized spells' }],
  importance: 'transformative',
});

rel.defineBreakpoint({
  type: 'quest_complete', trigger: { quest: 'by_page_by_margin_by_self' },
  description: 'Dream-warding prayer book. True-Name Binding and Margin-Walk change how you move through the forest. Identity shift.',
  unlocks: [{ type: 'spellbook', id: 'dream_warding_prayer_book', description: 'Dream-warding prayers' }],
  importance: 'transformative',
});

rel.defineBreakpoint({
  type: 'skill_level', trigger: { skill: 'runecrafting', level: 72 },
  description: 'Name-rune crafting. Mid-tier Lunar-kin RC. Feeds Dream-warding prayers and Library magic simultaneously.',
  unlocks: [{ type: 'training_method', id: 'inkweald_name_rune_rc', description: 'Name-rune crafting' }],
  importance: 'major',
});

rel.defineBreakpoint({
  type: 'skill_level', trigger: { skill: 'mining', level: 75 },
  description: 'Lunar-adjacent crystal mining. Moon-cycle bonus yield. Higher tier than Veilwood. Inkweald becomes the crystal king.',
  unlocks: [{ type: 'training_method', id: 'inkweald_crystal_mine_lunar', description: 'Lunar-adjacent crystal mining' }],
  importance: 'major',
});

rel.defineBreakpoint({
  type: 'item_acquired', trigger: { item: 'lantern_of_the_dreamless' },
  description: 'Lantern of the Dreamless. Holds a single wish for one night. Burns no fuel while held by a sleeper. A small miracle; it changes travel.',
  unlocks: [{ type: 'item_equip', id: 'lantern_of_the_dreamless', description: 'Lantern of the Dreamless' }],
  importance: 'major',
});

// ══════════════════════════════════════════════════════════════════════════════
// INKWEALD QUIRKY INTERACTIONS (dream-blur flavor at the edges)
// ══════════════════════════════════════════════════════════════════════════════

rel.defineTrainingMethod('quirky_inkweald_forget_a_name', {
  skill: 'prayer',
  name: '[Quirky] Forget Your Own Name at the Threshold',
  levelRange: [1, 99], xpPerHour: 2400,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['inkweald'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'low',
  inputs: [],
  description: 'Stand at the Threshold. Say your name. Forget it. Remember it. Small prayer XP, substantial unease.',
  location: 'Inkweald',
});

rel.defineTrainingMethod('quirky_inkweald_read_a_page_back', {
  skill: 'magic',
  name: '[Quirky] Read a Page, Then Read It Back',
  levelRange: [1, 99], xpPerHour: 2100,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['inkweald'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'low',
  inputs: [],
  description: 'Open the book. Read one line. Close it. Read it back aloud. The book laughs — or you laugh, hard to say.',
  location: 'Inkweald',
});

rel.defineTrainingMethod('quirky_inkweald_stack_the_chimes', {
  skill: 'thieving',
  name: '[Quirky] Stack the Chimes',
  levelRange: [1, 99], xpPerHour: 1800,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['inkweald'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'medium',
  inputs: [],
  description: 'Stack market chimes in silence. Tiny thieving XP per stack. The merchant never looks up.',
  location: 'Inkweald',
});

rel.defineTrainingMethod('quirky_inkweald_walk_the_margin', {
  skill: 'agility',
  name: '[Quirky] Walk the Margin',
  levelRange: [1, 99], xpPerHour: 1600,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['inkweald'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'medium',
  inputs: [],
  description: 'Step along the edge of what is written. Do not fall into the sentence. Small agility XP; the margin is narrow.',
  location: 'Inkweald',
});

rel.defineTrainingMethod('quirky_inkweald_hum_a_cedar', {
  skill: 'firemaking',
  name: '[Quirky] Hum a Hum-Cedar',
  levelRange: [1, 99], xpPerHour: 2000,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['inkweald'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'low',
  inputs: [],
  description: 'Hum the pitch the cedar wants. The log lights itself. The tiny firemaking XP is an embarrassment to the forest.',
  location: 'Inkweald',
});

rel.defineTrainingMethod('quirky_inkweald_untie_your_shoes', {
  skill: 'crafting',
  name: '[Quirky] Untie Your Shoes Slowly',
  levelRange: [1, 99], xpPerHour: 1200,
  prerequisites: { skills: {}, quests: [], items: [{ name: 'Boots' }], areas: ['inkweald'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'high',
  inputs: [],
  description: 'Untie both boots, without looking. Retie them with the other hand. The forest makes note. Tiny crafting XP.',
  location: 'Inkweald',
});

console.log('[aelgard] Inkweald Deep loaded: 30 training methods, 11 quests, 7 breakpoints, dream-blur voice, all 16 blocked skills opened');
