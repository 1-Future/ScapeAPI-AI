// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Veilwood Deepening (Burn Session, 2026-04-15)
//
// "By the third moon, woke she."
//
// Target: 19 → 65+. Per gap-report: 16 methods, 12 hard-blocked skills.
// Blocked: attack, defence, hitpoints, ranged, runecrafting, construction,
//          thieving, crafting, smithing, fishing, cooking, firemaking.
//
// Veilwood is the enchanted elven forest — moonhooked, lichen-flecked,
// threshold-walked. The forest KNOWS things. The sentence REMEMBERS. Voice is
// Catherynne Valente / Susanna Clarke — inverted clauses, trailing verbs,
// implicit subjects. Not hippie-elf. Court-elf. Dream-logic. Crystal endgame.
//
// Sub-areas referenced:
//   Mooncourt, Glass-Leaf Glades, Loom Sanctum, The Hidden Court,
//   The Whisper Glade, Veilwood Hunt, Stag-Stone, Threshold-Wardens,
//   Inner Sanctum, Singing-Tree Saw Camps, Glass-Glade Smithing,
//   Moonwell Fishing, Thinkberry Farms, Hunters' Grove, Veilwood Range.
//
// This file:
//   - Unblocks all 12 hard-blocked skills with elven-flavored methods
//   - 10 NEW quests with non-degenerate unlocks (no XP-only)
//   - 7 transformative/major breakpoints
//   - Registers Veilwood-exclusive items + cross-region uses
//   - Respects Marstead's 8 Knobs per method, avoids the Misery Zone
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const rel = require('../../data/relationships');

// ══════════════════════════════════════════════════════════════════════════════
// VEILWOOD-NATIVE ITEMS (IDs 96500-96799)
// Moon-tide crystals, singing logs, dream-herbs, glass-stag pelts, rune-thread.
// ══════════════════════════════════════════════════════════════════════════════

// Singing-Tree Saw Camps
rel.registerItemSource(96500, { type: 'gathering', sourceId: 'veilwood_singing_oak', sourceName: 'Singing Oak Grove', region: 'veilwood', details: 'Singing-oak log. Hums when the saw pitches true. Tone reveals the cut.', obscure: false });
rel.registerItemSource(96501, { type: 'gathering', sourceId: 'veilwood_singing_willow', sourceName: 'Singing Willow Copse', region: 'veilwood', details: 'Singing-willow log. Sighs. Bends better than it splits.', obscure: false });
rel.registerItemSource(96502, { type: 'gathering', sourceId: 'veilwood_singing_yew', sourceName: 'Mooncourt Singing Yew', region: 'veilwood', details: 'Singing-yew log. Only heard under a waxing moon. Fletches into singing-arrow shafts.', obscure: false });
rel.registerItemSource(96503, { type: 'gathering', sourceId: 'veilwood_singing_magic', sourceName: 'Inner Sanctum Singing-Magic', region: 'veilwood', details: 'Singing-magic log. Rare. Sings chord — not note. Core of crystal bow shafts.', obscure: true });

// Glass-Leaf Glades (fletching + arrow components)
rel.registerItemSource(96510, { type: 'gathering', sourceId: 'veilwood_glass_leaf_harvest', sourceName: 'Glass-Leaf Harvest', region: 'veilwood', details: 'Glass-leaf shard. Arrowhead material. Shatters on impact — bleeds target.', obscure: false });
rel.registerItemSource(96511, { type: 'drop', sourceId: 'veilwood_singing_arrow_spinner', sourceName: 'Glass-Glade Spinner', region: 'veilwood', details: 'Rune-thread spool. Binds glass-leaf to singing-yew shaft.', obscure: false });
rel.registerItemSource(96512, { type: 'processing', sourceId: 'veilwood_singing_arrow_bench', sourceName: 'Singing-Arrow Bench', region: 'veilwood', details: 'Singing-arrow. Hums on flight — +5% hit chance, announces you.', obscure: false });

// Loom Sanctum
rel.registerItemSource(96520, { type: 'gathering', sourceId: 'veilwood_moonsilk_moth_net', sourceName: 'Moonsilk Moth Lantern', region: 'veilwood', details: 'Moonsilk fibre. Only spun by moths drawn to the loom-lanterns.', obscure: false });
rel.registerItemSource(96521, { type: 'processing', sourceId: 'veilwood_loom_sanctum', sourceName: 'Loom Sanctum', region: 'veilwood', details: 'Court-cloth bolt. Weaves with kin-memory — armour grows into the wearer.', obscure: false });
rel.registerItemSource(96522, { type: 'processing', sourceId: 'veilwood_rune_thread_spinner', sourceName: 'Rune-Thread Spinner', region: 'veilwood', details: 'Rune-thread. Conducts runic charges. Required for crystal-cored armour.', obscure: true });

// Mooncourt (runecrafting)
rel.registerItemSource(96530, { type: 'gathering', sourceId: 'veilwood_moontide_crystal', sourceName: 'Moon-Tide Crystal Shallows', region: 'veilwood', details: 'Moon-tide crystal. Cracks open along lunar phases. Core of lunar runes.', obscure: false });
rel.registerItemSource(96531, { type: 'processing', sourceId: 'veilwood_mooncourt_altar', sourceName: 'Mooncourt Altar', region: 'veilwood', details: 'Lunar rune. Powers dream-tongue and stag-shape spells.', obscure: false });
rel.registerItemSource(96532, { type: 'processing', sourceId: 'veilwood_mooncourt_altar', sourceName: 'Mooncourt Altar', region: 'veilwood', details: 'Dream-rune. Phases your arrow/spell through one wall or guard.', obscure: true });
rel.registerItemSource(96533, { type: 'gathering', sourceId: 'veilwood_lunar_dust_sieve', sourceName: 'Lunar Dust Sieve', region: 'veilwood', details: 'Lunar dust. Sifted from moon-tide sand. Makes runes double.', obscure: true });

// The Whisper Glade (herblore)
rel.registerItemSource(96540, { type: 'gathering', sourceId: 'veilwood_whisper_glade_dream_herb', sourceName: 'Whisper Glade Dream-Herbs', region: 'veilwood', details: 'Grimy dream-herb. Listens before it grows. Cures the wakeful.', obscure: false });
rel.registerItemSource(96541, { type: 'gathering', sourceId: 'veilwood_whisper_glade_wake_flower', sourceName: 'Whisper Glade Wake-Flowers', region: 'veilwood', details: 'Wake-flower. Secondary that resists sleep/confusion statuses.', obscure: false });
rel.registerItemSource(96542, { type: 'gathering', sourceId: 'veilwood_remembered_scroll', sourceName: 'Whisper Glade Remembered Scroll', region: 'veilwood', details: 'A scroll the glade remembered. Single-use: repeats your last potion recipe for free.', obscure: true });

// Veilwood Hunt (hunter)
rel.registerItemSource(96550, { type: 'drop', sourceId: 'veilwood_moonhawk', sourceName: 'Moonhawk Perch', region: 'veilwood', details: 'Moonhawk feather. Tracks where the eye was. Fletching + scout-scrolls.', obscure: false });
rel.registerItemSource(96551, { type: 'drop', sourceId: 'veilwood_songbird', sourceName: 'Songbird Copse', region: 'veilwood', details: 'Songbird breast. Raw meat for Hunters\' Grove kitchen.', obscure: false });
rel.registerItemSource(96552, { type: 'drop', sourceId: 'veilwood_song_deer', sourceName: 'Song-Deer Trail', region: 'veilwood', details: 'Song-deer venison + hide. The forest counts its dead. Apologise, or luck sours.', obscure: false });
rel.registerItemSource(96553, { type: 'drop', sourceId: 'veilwood_glass_stag', sourceName: 'Glass-Stag Thicket', region: 'veilwood', details: 'Glass-stag pelt. Rare. Only antlered stags shed full pelts. Cape crafting.', obscure: true });
rel.registerItemSource(96554, { type: 'drop', sourceId: 'veilwood_lunar_chinchompa', sourceName: 'Moonhooked Chinchompa Range', region: 'veilwood', details: 'Lunar chinchompa. Explodes silver-bright. 1.3× damage vs undead.', obscure: false });

// Moonwell Fishing
rel.registerItemSource(96560, { type: 'gathering', sourceId: 'veilwood_moonwell_shoal', sourceName: 'Moonwell Shoal', region: 'veilwood', details: 'Raw moon-trout. Only bites on a bait lit by moonlight.', obscure: false });
rel.registerItemSource(96561, { type: 'gathering', sourceId: 'veilwood_glass_eel_weir', sourceName: 'Glass-Eel Weir', region: 'veilwood', details: 'Raw glass-eel. Transparent, hard to see in the net. Cooks into eel-pie.', obscure: false });
rel.registerItemSource(96562, { type: 'gathering', sourceId: 'veilwood_thinking_carp_pool', sourceName: 'Thinking Carp Pool', region: 'veilwood', details: 'Raw thinking carp. Cooked feeds +2 temporary magic. The carp was thinking something — now you are.', obscure: true });

// Thinkberry Farms
rel.registerItemSource(96570, { type: 'gathering', sourceId: 'veilwood_thinkberry_patch', sourceName: 'Thinkberry Farm Patch', region: 'veilwood', details: 'Thinkberry. Grown with remembered water. +1 herblore for 10 min when eaten.', obscure: false });
rel.registerItemSource(96571, { type: 'gathering', sourceId: 'veilwood_dreambean_bush', sourceName: 'Dreambean Bush', region: 'veilwood', details: 'Dreambean. Secondary for dream-potions. Occasionally buds a second time.', obscure: false });
rel.registerItemSource(96572, { type: 'gathering', sourceId: 'veilwood_rune_saplings', sourceName: 'Rune-Thread Saplings', region: 'veilwood', details: 'Rune-fibre sapling. Grows into a spun-thread tree over three lunar cycles.', obscure: true });

// Stag-Stone (magic)
rel.registerItemSource(96580, { type: 'gathering', sourceId: 'veilwood_stag_stone_altar', sourceName: 'Stag-Stone Altar', region: 'veilwood', details: 'Stag-antler sigil. Focus for stag-shape spells. Chewed-on by visitors.', obscure: false });
rel.registerItemSource(96581, { type: 'drop', sourceId: 'veilwood_bound_dryad', sourceName: 'Stag-Stone Bound Dryad', region: 'veilwood', details: 'Binding-cord. Used in forest-binding spells. Cut — the cord remembers.', obscure: true });

// Threshold-Wardens (prayer)
rel.registerItemSource(96590, { type: 'drop', sourceId: 'veilwood_threshold_warden_trial', sourceName: 'Threshold-Warden Trial Chest', region: 'veilwood', details: 'Kin-keeper censer. Lets you pray at ANY Veilwood threshold.', obscure: false });
rel.registerItemSource(96591, { type: 'processing', sourceId: 'veilwood_threshold_shrine', sourceName: 'Threshold Shrine', region: 'veilwood', details: 'Threshold offering token. 2× prayer XP at any door across a region border.', obscure: true });

// Glass-Glade Smithing
rel.registerItemSource(96600, { type: 'processing', sourceId: 'veilwood_glass_glade_forge', sourceName: 'Glass-Glade Forge', region: 'veilwood', details: 'Dream-iron bar. Smelts cold. Absorbs a single spell per fight.', obscure: false });
rel.registerItemSource(96601, { type: 'processing', sourceId: 'veilwood_glass_cored_alloy', sourceName: 'Glass-Cored Alloy Bench', region: 'veilwood', details: 'Glass-cored alloy. Dream-iron + glass-leaf shard + rune-thread. Court-armour base.', obscure: true });

// Slayer drops (corrupted forest-things)
rel.registerItemSource(96610, { type: 'drop', sourceId: 'veilwood_vinehaunt', sourceName: 'Vine-Haunt Thicket', region: 'veilwood', details: 'Vine-haunt bramble. Crafts into snare traps. Only drops with secateurs equipped.', obscure: false });
rel.registerItemSource(96611, { type: 'drop', sourceId: 'veilwood_mirror_stag', sourceName: 'Mirror-Stag Shallow', region: 'veilwood', details: 'Mirror-shard antler. Reflects one spell per fight back at caster.', obscure: true });
rel.registerItemSource(96612, { type: 'drop', sourceId: 'veilwood_glass_spider', sourceName: 'Glass-Spider Hollow', region: 'veilwood', details: 'Glass-spider silk. Crafts into transparent ranged armour.', obscure: false });

// Hunters' Grove cooking
rel.registerItemSource(96620, { type: 'processing', sourceId: 'veilwood_hunters_grove_spit', sourceName: "Hunters' Grove Spit", region: 'veilwood', details: 'Cooked song-deer venison. Heals 16 HP. +1 ranged for 5 min.', obscure: false });
rel.registerItemSource(96621, { type: 'processing', sourceId: 'veilwood_hunters_grove_stewpot', sourceName: "Hunters' Grove Stewpot", region: 'veilwood', details: 'Song-bird stew. Heals 14 HP + silences you — enemies don\'t aggro.', obscure: true });

// Crystal-everything (Inner Sanctum — endgame, minimal re-registrations)
rel.registerItemSource(96630, { type: 'processing', sourceId: 'veilwood_inner_sanctum_forge', sourceName: 'Inner Sanctum Crystal Forge', region: 'veilwood', details: 'Crystal ingot. Ingots never dull. Court-cloth + crystal = endgame armour.', obscure: true });

// ══════════════════════════════════════════════════════════════════════════════
// VEILWOOD TRAINING METHODS — unblock all 12 hard-blocked skills
// Voice: inverted syntax. Verbs trail. The forest notices.
// ══════════════════════════════════════════════════════════════════════════════

// ── ATTACK ────────────────────────────────────────────────────────────────────

rel.defineTrainingMethod('veilwood_hidden_court_duelist', {
  skill: 'attack', name: 'Hidden Court Duelist Matches',
  levelRange: [20, 70],
  xpPerHour: 56000,
  prerequisites: { skills: { attack: 20 }, quests: ['by_third_moon_we_walked'], items: [], areas: ['veilwood_hidden_court'] },
  resourceOutput: { produces: [{ name: 'Court favour', perHour: 120 }, { name: 'Gold coins', perHour: 28000 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 0,
  danger: 'low', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Mid-tier food', perHour: 18, source: 'cooking' }],
  description: 'Spar the court duelists. First-to-three, no killing blows. Courtly, attentive, won — blade by blade.',
  location: 'Veilwood',
});

rel.defineTrainingMethod('veilwood_vinehaunt_attack', {
  skill: 'attack', name: 'Vine-Haunt Pruning',
  levelRange: [1, 45],
  xpPerHour: 32000,
  prerequisites: { skills: {}, quests: [], items: [{ name: 'Secateurs' }], areas: ['veilwood'] },
  resourceOutput: { produces: [{ name: 'Vine-haunt bramble', perHour: 140 }], net: 'neutral' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'low', complexity: 'simple', attention: 'low',
  inputs: [{ name: 'Basic food', perHour: 12, source: 'cooking' }],
  description: 'Prune the grasping vines. Secateurs — required, sharp. Good early attack XP. Brambles trap-craft.',
  location: 'Veilwood',
});

rel.defineTrainingMethod('veilwood_glass_stag_attack', {
  skill: 'attack', name: 'Glass-Stag Hunter\'s Combat',
  levelRange: [70, 99],
  xpPerHour: 88000,
  prerequisites: { skills: { attack: 70, hunter: 70 }, quests: ['of_glass_and_antler'], items: [{ name: 'Silvered spear' }], areas: ['veilwood_glass_stag_thicket'] },
  resourceOutput: { produces: [{ name: 'Glass-stag pelt', perHour: 8 }, { name: 'Gold coins', perHour: 180000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 20000,
  danger: 'high', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Sharks', perHour: 35, source: 'cooking' }, { name: 'Super combat potion', perHour: 2, source: 'herblore' }],
  description: 'Track the glass-stag. Three paces; strike; apologise; track again. High XP, high stakes — miss, and the herd hides a week.',
  location: 'Veilwood',
  breakpointAt: 70,
});

// ── STRENGTH (add higher-tier since mid-tier only hits 75) ──────────────────

rel.defineTrainingMethod('veilwood_threshold_trials', {
  skill: 'strength', name: 'Threshold-Warden Strength Trials',
  levelRange: [75, 99],
  xpPerHour: 78000,
  prerequisites: { skills: { strength: 75 }, quests: ['the_door_that_was_never_closed'], items: [], areas: ['veilwood_threshold_wardens'] },
  resourceOutput: { produces: [{ name: 'Kin-keeper censer', perHour: 4 }], net: 'neutral' },
  bankingFrequency: 'rare', costPerHour: 0,
  danger: 'medium', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Mid-tier food', perHour: 20, source: 'cooking' }],
  description: 'Hold the threshold while three wardens press. Shoulder set; stance held; line kept — by the third bell, passed.',
  location: 'Veilwood',
  breakpointAt: 75,
});

// ── DEFENCE ───────────────────────────────────────────────────────────────────

rel.defineTrainingMethod('veilwood_threshold_warden_defence', {
  skill: 'defence', name: 'Threshold-Warden Combat Trials',
  levelRange: [30, 80],
  xpPerHour: 52000,
  prerequisites: { skills: { defence: 30 }, quests: ['the_door_that_was_never_closed'], items: [], areas: ['veilwood_threshold_wardens'] },
  resourceOutput: { produces: [{ name: 'Kin-keeper censer', perHour: 3 }, { name: 'Court favour', perHour: 60 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 0,
  danger: 'medium', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Mid-tier food', perHour: 20, source: 'cooking' }],
  description: 'Stand the threshold. Step not. Wardens test: melee, ranged, spell — endured, all three.',
  location: 'Veilwood',
});

rel.defineTrainingMethod('veilwood_mirror_stag_defence', {
  skill: 'defence', name: 'Mirror-Stag Ward Duel',
  levelRange: [60, 99],
  xpPerHour: 72000,
  prerequisites: { skills: { defence: 60, magic: 55 }, quests: [], items: [], areas: ['veilwood_mirror_shallow'] },
  resourceOutput: { produces: [{ name: 'Mirror-shard antler', perHour: 6 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 8000,
  danger: 'high', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Sharks', perHour: 28, source: 'cooking' }, { name: 'Super defence potion', perHour: 3, source: 'herblore' }],
  description: 'The mirror-stag reflects what it meets. Attack soft; be attacked. Shield work rewarded — unique defensive XP.',
  location: 'Veilwood',
});

// ── HITPOINTS ─────────────────────────────────────────────────────────────────

rel.defineTrainingMethod('veilwood_songbird_sparring_hp', {
  skill: 'hitpoints', name: 'Songbird Sparring Ward',
  levelRange: [1, 30],
  xpPerHour: 9000,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['veilwood'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 400,
  danger: 'low', complexity: 'trivial', attention: 'afk',
  inputs: [{ name: 'Healer cloth bandages', perHour: 10, source: 'veilwood_loom_sanctum' }],
  description: 'The forest sings; you bleed a little. Elven healers patch you. AFK hitpoints, the gentle way.',
  location: 'Veilwood',
});

rel.defineTrainingMethod('veilwood_glass_spider_hp', {
  skill: 'hitpoints', name: 'Glass-Spider Hollow Endurance',
  levelRange: [40, 90],
  xpPerHour: 36000,
  prerequisites: { skills: { hitpoints: 40, slayer: 40 }, quests: [], items: [{ name: 'Spider-silk net' }], areas: ['veilwood_glass_spider_hollow'] },
  resourceOutput: { produces: [{ name: 'Glass-spider silk', perHour: 110 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 5000,
  danger: 'medium', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Mid-tier food', perHour: 18, source: 'cooking' }],
  description: 'Tank the glass-spider swarm. Venom chips; silk drops. Passive HP with real drops — not miserable, not idle.',
  location: 'Veilwood',
});

// ── RANGED ────────────────────────────────────────────────────────────────────

rel.defineTrainingMethod('veilwood_range_singing_arrows', {
  skill: 'ranged', name: 'Veilwood Range — Singing-Arrow Drills',
  levelRange: [1, 50],
  xpPerHour: 28000,
  prerequisites: { skills: {}, quests: [], items: [{ name: 'Shortbow' }, { name: 'Singing-arrow' }], areas: ['veilwood_range'] },
  resourceOutput: { produces: [{ name: 'Marksman tokens', perHour: 40 }], net: 'neutral' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'afk',
  inputs: [{ name: 'Singing-arrow', perHour: 1200, source: 'fletching' }],
  description: 'The range hums when the arrow sings true. Pure ranged training — target-straw dummies, no combat.',
  location: 'Veilwood',
});

rel.defineTrainingMethod('veilwood_moonhawk_ranged', {
  skill: 'ranged', name: 'Moonhawk Sky-Line Hunt',
  levelRange: [60, 99],
  xpPerHour: 82000,
  prerequisites: { skills: { ranged: 60, hunter: 50 }, quests: ['of_glass_and_antler'], items: [{ name: 'Bird-caller\'s bow' }], areas: ['veilwood_moonhawk_perch'] },
  resourceOutput: { produces: [{ name: 'Moonhawk feather', perHour: 240 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 12000,
  danger: 'medium', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Singing-arrow', perHour: 2400, source: 'fletching' }, { name: 'Mid-tier food', perHour: 18, source: 'cooking' }],
  description: 'Shoot moonhawks mid-dive. Lead the wing; not the eye. Top ranged XP tied to unique feather drops — scout-scroll economy downstream.',
  location: 'Veilwood',
});

// ── RUNECRAFTING (Mooncourt — THE flagship breakpoint skill) ─────────────────

rel.defineTrainingMethod('veilwood_mooncourt_lunar_rc', {
  skill: 'runecrafting', name: 'Mooncourt Lunar Rune Crafting',
  levelRange: [52, 99],
  xpPerHour: 65000,
  prerequisites: { skills: { runecrafting: 52 }, quests: ['moon_cycle_apprentice'], items: [], areas: ['veilwood_mooncourt'] },
  resourceOutput: { produces: [{ name: 'Lunar rune', perHour: 1400 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'low',
  inputs: [{ name: 'Pure essence', perHour: 1400, source: 'mining' }, { name: 'Moon-tide crystal', perHour: 140, source: 'veilwood_moontide_crystal' }],
  description: 'At the Mooncourt altar, by moon-tide, runes — cast. Low-attention, profitable, flagship RC escape-hatch from the Misery Zone.',
  location: 'Veilwood',
  breakpointAt: 52,
});

rel.defineTrainingMethod('veilwood_mooncourt_dream_rc', {
  skill: 'runecrafting', name: 'Mooncourt Dream-Rune Crafting',
  levelRange: [74, 99],
  xpPerHour: 52000,
  prerequisites: { skills: { runecrafting: 74 }, quests: ['what_the_forest_said'], items: [], areas: ['veilwood_mooncourt'] },
  resourceOutput: { produces: [{ name: 'Dream-rune', perHour: 800 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'low',
  inputs: [{ name: 'Pure essence', perHour: 800, source: 'mining' }, { name: 'Lunar dust', perHour: 400, source: 'veilwood_lunar_dust_sieve' }],
  description: 'Dream-runes — craft when the altar sleeps. Powers phase-through effects. Low-attention, high demand.',
  location: 'Veilwood',
});

// ── CONSTRUCTION (Loom Sanctum canopy-house) ─────────────────────────────────

rel.defineTrainingMethod('veilwood_canopy_house_construction', {
  skill: 'construction', name: 'Canopy House Construction',
  levelRange: [30, 99],
  xpPerHour: 290000,
  prerequisites: { skills: { construction: 30 }, quests: [], items: [], areas: ['veilwood'] },
  resourceOutput: { produces: [], net: 'loss' },
  bankingFrequency: 'frequent', costPerHour: 360000,
  danger: 'none', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Singing-oak log', perHour: 1200, source: 'veilwood_singing_oak' }, { name: 'Rune-thread', perHour: 200, source: 'veilwood_rune_thread_spinner' }],
  description: 'Build a house in the canopy. Elven frame-work; rooms grow, not built. Top-tier construction XP at mid-low cost.',
  location: 'Veilwood',
});

rel.defineTrainingMethod('veilwood_threshold_lintel_construction', {
  skill: 'construction', name: 'Threshold-Lintel Carving',
  levelRange: [1, 50],
  xpPerHour: 22000,
  prerequisites: { skills: {}, quests: [], items: [{ name: 'Chisel' }], areas: ['veilwood'] },
  resourceOutput: { produces: [{ name: 'Threshold lintel', perHour: 40 }], net: 'neutral' },
  bankingFrequency: 'moderate', costPerHour: 4000,
  danger: 'none', complexity: 'simple', attention: 'low',
  inputs: [{ name: 'Singing-oak log', perHour: 200, source: 'veilwood_singing_oak' }],
  description: 'Carve lintels for the Threshold-Wardens. Each holds a name; each name — remembered. Cheap early construction path.',
  location: 'Veilwood',
});

// ── THIEVING ──────────────────────────────────────────────────────────────────

rel.defineTrainingMethod('veilwood_court_pickpocket', {
  skill: 'thieving', name: 'Court Pickpocketing',
  levelRange: [40, 99],
  xpPerHour: 68000,
  prerequisites: { skills: { thieving: 40 }, quests: ['she_sang_to_the_loom'], items: [], areas: ['veilwood_hidden_court'] },
  resourceOutput: { produces: [{ name: 'Court coin purse', perHour: 50 }, { name: 'Gold coins', perHour: 45000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'low', complexity: 'moderate', attention: 'medium',
  inputs: [],
  description: 'Pick the Hidden Court pockets. Fail — not imprisoned; merely forgotten a day. Court coin purses drop rune-thread.',
  location: 'Veilwood',
});

rel.defineTrainingMethod('veilwood_thinkberry_cache_thieving', {
  skill: 'thieving', name: 'Thinkberry Farm Cache Thieving',
  levelRange: [1, 45],
  xpPerHour: 24000,
  prerequisites: { skills: {}, quests: [], items: [{ name: 'Lockpick' }], areas: ['veilwood'] },
  resourceOutput: { produces: [{ name: 'Thinkberry', perHour: 280 }, { name: 'Gold coins', perHour: 9000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'low', complexity: 'simple', attention: 'low',
  inputs: [],
  description: 'Crack the farmer\'s cache — stealing thinkberries. Farmer notices; shrugs; re-plants. Early thieving training.',
  location: 'Veilwood',
});

// ── CRAFTING (Loom Sanctum — silk-weaving + court-cloth) ─────────────────────

rel.defineTrainingMethod('veilwood_loom_sanctum_weaving', {
  skill: 'crafting', name: 'Loom Sanctum Silk-Weaving',
  levelRange: [25, 85],
  xpPerHour: 92000,
  prerequisites: { skills: { crafting: 25 }, quests: ['she_sang_to_the_loom'], items: [], areas: ['veilwood_loom_sanctum'] },
  resourceOutput: { produces: [{ name: 'Court-cloth bolt', perHour: 180 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Moonsilk fibre', perHour: 1800, source: 'veilwood_moonsilk_moth_net' }],
  description: 'Weave court-cloth bolts on the Loom Sanctum\'s six-beam. Armour grows into the wearer — crafting + crafting + remembering.',
  location: 'Veilwood',
});

rel.defineTrainingMethod('veilwood_glass_leaf_knapping', {
  skill: 'crafting', name: 'Glass-Leaf Knapping',
  levelRange: [1, 40],
  xpPerHour: 38000,
  prerequisites: { skills: {}, quests: [], items: [{ name: 'Knapping stone' }], areas: ['veilwood_glass_leaf_glades'] },
  resourceOutput: { produces: [{ name: 'Glass-leaf shard', perHour: 700 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'simple', attention: 'low',
  inputs: [],
  description: 'Knap glass-leaves into arrowheads. A palm-sized stone; a slow tap; a clean break. Feeds fletching downstream.',
  location: 'Veilwood',
});

// ── SMITHING (Glass-Glade — dream-iron + glass-cored alloys) ─────────────────

rel.defineTrainingMethod('veilwood_glass_glade_smithing', {
  skill: 'smithing', name: 'Glass-Glade Dream-Iron Forge',
  levelRange: [40, 99],
  xpPerHour: 98000,
  prerequisites: { skills: { smithing: 40 }, quests: [], items: [], areas: ['veilwood_glass_leaf_glades'] },
  resourceOutput: { produces: [{ name: 'Dream-iron bar', perHour: 360 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Iron ore', perHour: 360, source: 'mining' }, { name: 'Lunar dust', perHour: 180, source: 'veilwood_lunar_dust_sieve' }],
  description: 'Smelts cold, hammered warm. The Glass-Glade forge takes the iron\'s dreams — a bar per dream, a dream per bar.',
  location: 'Veilwood',
});

rel.defineTrainingMethod('veilwood_glass_cored_alloy_smithing', {
  skill: 'smithing', name: 'Glass-Cored Alloy Forging',
  levelRange: [70, 99],
  xpPerHour: 82000,
  prerequisites: { skills: { smithing: 70, crafting: 60 }, quests: ['of_glass_and_antler'], items: [], areas: ['veilwood_glass_leaf_glades'] },
  resourceOutput: { produces: [{ name: 'Glass-cored alloy', perHour: 120 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 15000,
  danger: 'none', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Dream-iron bar', perHour: 240, source: 'veilwood_glass_glade_forge' }, { name: 'Glass-leaf shard', perHour: 120, source: 'veilwood_glass_leaf_harvest' }, { name: 'Rune-thread', perHour: 120, source: 'veilwood_rune_thread_spinner' }],
  description: 'Fold glass-leaf between iron layers. Three folds; three songs; three names — court-armour base. BIS vs magic.',
  location: 'Veilwood',
});

// ── FISHING (Moonwell + Glass-Eel + Thinking Carp) ───────────────────────────

rel.defineTrainingMethod('veilwood_moonwell_fishing', {
  skill: 'fishing', name: 'Moonwell Moon-Trout Fishing',
  levelRange: [20, 70],
  xpPerHour: 42000,
  prerequisites: { skills: { fishing: 20 }, quests: [], items: [{ name: 'Fishing rod' }, { name: 'Moonlit bait' }], areas: ['veilwood_moonwell'] },
  resourceOutput: { produces: [{ name: 'Raw moon-trout', perHour: 220 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'afk',
  inputs: [{ name: 'Moonlit bait', perHour: 220, source: 'shop_mooncourt' }],
  description: 'Cast at the Moonwell. Bait, moonlit — else, nothing bites. Silver-scaled, moon-fat. AFK fishing, elven.',
  location: 'Veilwood',
});

rel.defineTrainingMethod('veilwood_glass_eel_weir', {
  skill: 'fishing', name: 'Glass-Eel Weir Fishing',
  levelRange: [55, 99],
  xpPerHour: 70000,
  prerequisites: { skills: { fishing: 55 }, quests: [], items: [{ name: 'Fishing rod' }], areas: ['veilwood_moonwell'] },
  resourceOutput: { produces: [{ name: 'Raw glass-eel', perHour: 150 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'simple', attention: 'low',
  inputs: [{ name: 'Dreambean bait', perHour: 150, source: 'veilwood_dreambean_bush' }],
  description: 'Glass-eels — seen when not looked-at. Watch the ripple, not the water. Cooks into eel-pie for +1 magic buff.',
  location: 'Veilwood',
});

// ── COOKING (Hunters' Grove — game prep + song-bird stew) ────────────────────

rel.defineTrainingMethod('veilwood_hunters_grove_cooking', {
  skill: 'cooking', name: "Hunters' Grove Game Preparations",
  levelRange: [25, 99],
  xpPerHour: 135000,
  prerequisites: { skills: { cooking: 25 }, quests: [], items: [], areas: ['veilwood_hunters_grove'] },
  resourceOutput: { produces: [{ name: 'Cooked song-deer venison', perHour: 400 }, { name: 'Song-bird stew', perHour: 300 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'simple', attention: 'low',
  inputs: [{ name: 'Raw song-deer venison', perHour: 400, source: 'veilwood_song_deer' }, { name: 'Raw songbird breast', perHour: 300, source: 'veilwood_songbird' }],
  description: 'The Grove\'s spit never stops turning. Apologise to the bones before you salt. Top-tier cooking XP + buff-food source.',
  location: 'Veilwood',
});

rel.defineTrainingMethod('veilwood_thinkberry_pastries', {
  skill: 'cooking', name: 'Thinkberry Pastry Kitchen',
  levelRange: [1, 50],
  xpPerHour: 42000,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['veilwood'] },
  resourceOutput: { produces: [{ name: 'Thinkberry pie', perHour: 260 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'simple', attention: 'low',
  inputs: [{ name: 'Thinkberry', perHour: 260, source: 'veilwood_thinkberry_patch' }, { name: 'Flour', perHour: 260, source: 'heartlands_mill' }],
  description: 'Bake thinkberry pies. Smell drifts — farm children come to watch. Early cooking path with a +1 herblore buff food.',
  location: 'Veilwood',
});

// ── FIREMAKING (Singing-Tree camps + Threshold-bonfires) ─────────────────────

rel.defineTrainingMethod('veilwood_singing_log_bonfire', {
  skill: 'firemaking', name: 'Singing-Log Bonfire',
  levelRange: [30, 99],
  xpPerHour: 165000,
  prerequisites: { skills: { firemaking: 30 }, quests: [], items: [{ name: 'Tinderbox' }], areas: ['veilwood'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'simple', attention: 'low',
  inputs: [{ name: 'Singing-oak log', perHour: 950, source: 'veilwood_singing_oak' }],
  description: 'Stack the singing-logs; light the pile. Each log joins the last note. Top firemaking XP outside Wintertodt equivalents.',
  location: 'Veilwood',
});

rel.defineTrainingMethod('veilwood_threshold_bonfire', {
  skill: 'firemaking', name: 'Threshold Ward-Bonfire',
  levelRange: [1, 50],
  xpPerHour: 52000,
  prerequisites: { skills: {}, quests: [], items: [{ name: 'Tinderbox' }], areas: ['veilwood_threshold_wardens'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'rare', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'afk',
  inputs: [{ name: 'Singing-willow log', perHour: 400, source: 'veilwood_singing_willow' }],
  description: 'Keep the warden-fire. Still there, still breathing — the forest noticed. AFK firemaking with prayer secondary XP.',
  location: 'Veilwood',
  breakpointAt: 1,
});

// ── SLAYER (forest-corrupted — vine-haunts, mirror-stags, glass-spiders) ────

rel.defineTrainingMethod('veilwood_corrupted_slayer', {
  skill: 'slayer', name: 'Corrupted Forest Slayer',
  levelRange: [50, 99],
  xpPerHour: 60000,
  prerequisites: { skills: { slayer: 50 }, quests: [], items: [], areas: ['veilwood'] },
  resourceOutput: { produces: [{ name: 'Slayer points', perHour: 28 }, { name: 'Gold coins', perHour: 75000 }, { name: 'Unique forest drops', perHour: 4 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 10000,
  danger: 'medium', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Sharks', perHour: 25, source: 'cooking' }, { name: 'Super combat potion', perHour: 2, source: 'herblore' }],
  description: 'Corrupted forest tasks — vine-haunts, mirror-stags, glass-spiders, moonhawks-gone-wrong. Each a different puzzle.',
  location: 'Veilwood',
});

// ── CRAFTING — higher tier (crystal armour) ──────────────────────────────────

rel.defineTrainingMethod('veilwood_crystal_armour_crafting', {
  skill: 'crafting', name: 'Inner Sanctum Crystal Armour Crafting',
  levelRange: [80, 99],
  xpPerHour: 110000,
  prerequisites: { skills: { crafting: 80, smithing: 70 }, quests: ['song_of_the_elves_aelgard'], items: [], areas: ['veilwood_inner_sanctum'] },
  resourceOutput: { produces: [{ name: 'Crystal armour piece', perHour: 12 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 40000,
  danger: 'none', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Crystal shard', perHour: 2400, source: 'veilwood_crystal_mining' }, { name: 'Court-cloth bolt', perHour: 60, source: 'veilwood_loom_sanctum' }],
  description: 'Sing the crystal into shape; the shape sings back. Court-cloth lining; shards; moonsong. Endgame crafting.',
  location: 'Veilwood',
  breakpointAt: 80,
});

// ══════════════════════════════════════════════════════════════════════════════
// VEILWOOD QUIRKY INTERACTIONS (elven inflection)
// ══════════════════════════════════════════════════════════════════════════════

rel.defineTrainingMethod('quirky_veilwood_lantern_light', {
  skill: 'firemaking',
  name: '[Quirky] Light the Moth-Lanterns',
  levelRange: [1, 99],
  xpPerHour: 2200,
  prerequisites: { skills: {}, quests: [], items: [{ name: 'Tinderbox' }], areas: ['veilwood'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'low',
  inputs: [],
  description: 'Relight the Loom Sanctum moth-lanterns, one by one. The moths prefer warmth to truth. Tiny firemaking XP.',
  location: 'Veilwood',
});

rel.defineTrainingMethod('quirky_veilwood_stag_bow_polish', {
  skill: 'fletching',
  name: '[Quirky] Polish the Stag-Stone Bows',
  levelRange: [1, 99],
  xpPerHour: 1400,
  prerequisites: { skills: {}, quests: [], items: [{ name: 'Cloth' }], areas: ['veilwood'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'medium',
  inputs: [],
  description: 'Oil the hunters\' bows at Stag-Stone. The wood prefers long strokes, said the fletcher — said she nothing else.',
  location: 'Veilwood',
});

rel.defineTrainingMethod('quirky_veilwood_threshold_sweep', {
  skill: 'prayer',
  name: '[Quirky] Sweep the Threshold',
  levelRange: [1, 99],
  xpPerHour: 1800,
  prerequisites: { skills: {}, quests: [], items: [{ name: 'Broom' }], areas: ['veilwood'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'medium',
  inputs: [],
  description: 'Sweep the threshold-wardens\' stoop. Kin-keeper work, humble. Prayer XP per whisper of dust the forest notices.',
  location: 'Veilwood',
});

rel.defineTrainingMethod('quirky_veilwood_forest_listen', {
  skill: 'magic',
  name: '[Quirky] Listen to What the Forest Said',
  levelRange: [1, 99],
  xpPerHour: 2400,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['veilwood_whisper_glade'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'afk',
  inputs: [],
  description: 'Stand in the Whisper Glade. Do nothing. Hear — eventually — the forest. Magic XP accrues where attention goes.',
  location: 'Veilwood',
});

rel.defineTrainingMethod('quirky_veilwood_carp_asking', {
  skill: 'fishing',
  name: '[Quirky] Ask the Thinking Carp',
  levelRange: [1, 99],
  xpPerHour: 1100,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['veilwood'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'low',
  inputs: [],
  description: 'Squat by the Thinking Carp Pool. Ask a question. Wait. Tiny fishing XP — the carp forgave you a rod.',
  location: 'Veilwood',
});

// ══════════════════════════════════════════════════════════════════════════════
// 10 NEW VEILWOOD QUESTS with non-degenerate unlocks
// ══════════════════════════════════════════════════════════════════════════════

rel.defineQuestUnlock('the_listening_year', {
  name: 'The Listening Year',
  unlocks: [
    { type: 'area', id: 'veilwood_whisper_glade', description: 'The Whisper Glade — dream-herb patch, wake-flower harvests' },
    { type: 'item_equip', id: 'remembered_scroll', description: 'A Remembered Scroll — replays your last potion recipe for free, once per day' },
  ],
});

rel.defineQuestUnlock('of_glass_and_antler', {
  name: 'Of Glass and Antler',
  unlocks: [
    { type: 'training_method', id: 'veilwood_glass_stag_attack', description: 'Glass-Stag hunter\'s combat — endgame attack XP with pelt drops' },
    { type: 'item_equip', id: 'glass_stag_pelt_cape', description: 'Glass-Stag Pelt Cape — +5% ranged accuracy in Veilwood; catches moonlight' },
    { type: 'training_method', id: 'veilwood_moonhawk_ranged', description: 'Moonhawk sky-line hunt — top-tier ranged training' },
  ],
});

rel.defineQuestUnlock('she_sang_to_the_loom', {
  name: 'She Sang to the Loom',
  unlocks: [
    { type: 'area', id: 'veilwood_loom_sanctum', description: 'Loom Sanctum — silk-weaving, court-cloth crafting' },
    { type: 'recipe', id: 'veilwood_court_cloth_bolt', description: 'Court-cloth bolt recipe — base for all court-tier armour' },
    { type: 'training_method', id: 'veilwood_court_pickpocket', description: 'Hidden Court pickpocketing — thieving access' },
  ],
});

rel.defineQuestUnlock('the_door_that_was_never_closed', {
  name: 'The Door That Was Never Closed',
  unlocks: [
    { type: 'prayer', id: 'threshold_warden_prayers', description: 'Threshold-Warden Prayers — kin-keeper prayer book (forest-protecting stance + kin-ward)' },
    { type: 'training_method', id: 'veilwood_threshold_warden_defence', description: 'Threshold-Warden combat trials — defence training' },
  ],
});

rel.defineQuestUnlock('moon_cycle_apprentice', {
  name: 'Moon-Cycle Apprentice',
  unlocks: [
    { type: 'training_method', id: 'veilwood_mooncourt_lunar_rc', description: 'Mooncourt lunar runecrafting — blood-rune-tier escape hatch' },
    { type: 'area', id: 'veilwood_mooncourt', description: 'Mooncourt altar access — lunar dust sieve, moon-tide crystal shallows' },
    { type: 'item_equip', id: 'lunar_rune_pouch', description: 'Lunar Rune Pouch — holds 3× essence, usable at any Veilwood altar' },
  ],
});

rel.defineQuestUnlock('what_the_forest_said', {
  name: 'What The Forest Said',
  unlocks: [
    { type: 'spellbook', id: 'dream_tongue_spells', description: 'Dream-Tongue Spellbook — dream-rune tier: phase-arrow, kin-call, stag-step' },
    { type: 'training_method', id: 'veilwood_mooncourt_dream_rc', description: 'Dream-rune crafting unlocked' },
  ],
});

rel.defineQuestUnlock('by_third_moon_we_walked', {
  name: 'By Third Moon, We Walked',
  unlocks: [
    { type: 'area', id: 'veilwood_hidden_court', description: 'The Hidden Court — full treetop agility course + duelist arena' },
    { type: 'training_method', id: 'veilwood_hidden_court_duelist', description: 'Hidden Court duelist matches — attack training with court favour' },
    { type: 'item_equip', id: 'court_slippers', description: 'Court Slippers — +10% agility stamina regen in Veilwood' },
  ],
});

rel.defineQuestUnlock('singing_saws', {
  name: 'Singing Saws',
  unlocks: [
    { type: 'training_method', id: 'veilwood_singing_tree_woodcutting', description: 'Singing-tree woodcutting — chop when the pitch is true, 2× yield' },
    { type: 'item_equip', id: 'pitch_fork_saw', description: 'Pitch-Fork Saw — a saw that tunes itself; works on every Veilwood log' },
  ],
});

rel.defineQuestUnlock('the_stag_shape_rite', {
  name: 'The Stag-Shape Rite',
  unlocks: [
    { type: 'spellbook', id: 'stag_shape_spells', description: 'Stag-Shape spells — transform for 30s, +25% movement, pass treetop obstacles' },
    { type: 'training_method', id: 'veilwood_stag_stone_binding_magic', description: 'Stag-Stone forest-binding magic training' },
  ],
});

rel.defineQuestUnlock('the_mirror_stag_pardon', {
  name: 'The Mirror-Stag Pardon',
  unlocks: [
    { type: 'training_method', id: 'veilwood_mirror_stag_defence', description: 'Mirror-Stag ward duel — defensive XP, antler drops' },
    { type: 'item_equip', id: 'mirror_shard_shield', description: 'Mirror-Shard Shield — reflects 1 spell per fight; BIS for magic-heavy bosses' },
  ],
});

// Extra method unlocked by Singing Saws quest (so the quest's unlock resolves)

rel.defineTrainingMethod('veilwood_singing_tree_woodcutting', {
  skill: 'woodcutting', name: 'Singing-Tree Saw Camps',
  levelRange: [35, 99],
  xpPerHour: 82000,
  prerequisites: { skills: { woodcutting: 35 }, quests: ['singing_saws'], items: [{ name: 'Pitch-fork saw' }], areas: ['veilwood'] },
  resourceOutput: { produces: [{ name: 'Singing-oak log', perHour: 340 }, { name: 'Singing-willow log', perHour: 260 }, { name: 'Singing-yew log', perHour: 80 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [],
  description: 'Chop only when the pitch is true — 2× yield per clean cut. Elite woodcutting; trains rhythm.',
  location: 'Veilwood',
  breakpointAt: 35,
});

rel.defineTrainingMethod('veilwood_stag_stone_binding_magic', {
  skill: 'magic', name: 'Stag-Stone Forest-Binding Magic',
  levelRange: [65, 99],
  xpPerHour: 88000,
  prerequisites: { skills: { magic: 65 }, quests: ['the_stag_shape_rite'], items: [], areas: ['veilwood_stag_stone'] },
  resourceOutput: { produces: [{ name: 'Binding-cord', perHour: 40 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 28000,
  danger: 'low', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Lunar rune', perHour: 1800, source: 'veilwood_mooncourt_lunar_rc' }, { name: 'Dream-rune', perHour: 400, source: 'veilwood_mooncourt_dream_rc' }],
  description: 'Bind dryads to the Stag-Stone; they rent their shape — briefly — in return. Advanced magic.',
  location: 'Veilwood',
});

// ══════════════════════════════════════════════════════════════════════════════
// VEILWOOD BREAKPOINTS — 7 transformative/major moments
// ══════════════════════════════════════════════════════════════════════════════

rel.defineBreakpoint({
  type: 'quest_complete', trigger: { quest: 'moon_cycle_apprentice' },
  description: 'Mooncourt unlocked. Lunar runes at 52. Blood-rune-equivalent escape hatch from the RC Misery Zone. Dream-runes at 74. The forest taught you the tide.',
  unlocks: [
    { type: 'training_method', id: 'veilwood_mooncourt_lunar_rc', description: 'Lunar runecrafting' },
    { type: 'area', id: 'veilwood_mooncourt', description: 'Full Mooncourt access' },
  ],
  importance: 'transformative',
});

rel.defineBreakpoint({
  type: 'quest_complete', trigger: { quest: 'what_the_forest_said' },
  description: 'Dream-Tongue spellbook acquired. Phase-arrow through one guard. Kin-call any Veilwood NPC. Stag-step ignores one obstacle. The forest answered.',
  unlocks: [{ type: 'spellbook', id: 'dream_tongue_spells', description: 'Dream-Tongue spellbook' }],
  importance: 'transformative',
});

rel.defineBreakpoint({
  type: 'quest_complete', trigger: { quest: 'she_sang_to_the_loom' },
  description: 'Loom Sanctum opened. Court-cloth recipes unlocked. Every court-tier armour path begins HERE — cross-region crafting demand rises.',
  unlocks: [
    { type: 'area', id: 'veilwood_loom_sanctum', description: 'Loom Sanctum' },
    { type: 'recipe', id: 'veilwood_court_cloth_bolt', description: 'Court-cloth bolt crafting' },
  ],
  importance: 'transformative',
});

rel.defineBreakpoint({
  type: 'quest_complete', trigger: { quest: 'by_third_moon_we_walked' },
  description: 'Hidden Court access. Treetop agility course; duelist arena; court slippers. Veilwood\'s agility + attack prestige content live here.',
  unlocks: [
    { type: 'area', id: 'veilwood_hidden_court', description: 'Hidden Court full access' },
    { type: 'training_method', id: 'veilwood_hidden_court_duelist', description: 'Duelist matches' },
  ],
  importance: 'major',
});

rel.defineBreakpoint({
  type: 'quest_complete', trigger: { quest: 'the_door_that_was_never_closed' },
  description: 'Threshold-Warden Prayers unlocked. Forest-protecting stance (resist forest-type damage) + kin-ward (splash shield on kin). Unique prayer book.',
  unlocks: [{ type: 'prayer', id: 'threshold_warden_prayers', description: 'Threshold-Warden Prayer Book' }],
  importance: 'major',
});

rel.defineBreakpoint({
  type: 'skill_level', trigger: { skill: 'runecrafting', level: 52 },
  description: 'Lunar rune crafting. After weeks of the RC treadmill, the Mooncourt altar opens. Low-attention, profitable — the Veilwood escape hatch.',
  unlocks: [{ type: 'training_method', id: 'veilwood_mooncourt_lunar_rc', description: 'Lunar rune crafting' }],
  importance: 'transformative',
});

rel.defineBreakpoint({
  type: 'skill_level', trigger: { skill: 'crafting', level: 80 },
  description: 'Inner Sanctum crystal armour crafting. Endgame armour path — crystal shards meet court-cloth meet moonsong. Veilwood\'s crafting peak.',
  unlocks: [{ type: 'training_method', id: 'veilwood_crystal_armour_crafting', description: 'Crystal armour crafting' }],
  importance: 'major',
});

// ══════════════════════════════════════════════════════════════════════════════
// ITEM USES — cross-region wiring for Veilwood exports
// ══════════════════════════════════════════════════════════════════════════════

// Singing-yew logs → fletching across regions
rel.registerItemUse(96502, { type: 'recipe', targetId: 'singing_yew_longbow', targetName: 'Singing-Yew Longbow', region: 'veilwood', details: 'Fletches into singing-yew longbows — +5% hit for announcement cost.', obscure: false });

// Glass-leaf → arrowheads (crafting/fletching + crafting)
rel.registerItemUse(96510, { type: 'recipe', targetId: 'veilwood_singing_arrow_bench', targetName: 'Singing-Arrow Bench', region: 'veilwood', details: 'Glass-leaf shard + rune-thread + singing-yew log = singing-arrow.', obscure: false });
rel.registerItemUse(96510, { type: 'recipe', targetId: 'glass_cored_alloy', targetName: 'Glass-Cored Alloy', region: 'veilwood', details: 'Shard layered between dream-iron folds. Crafting+smithing.', obscure: true });

// Moonsilk → court-cloth (crafting) + cross-region linen wraps
rel.registerItemUse(96520, { type: 'recipe', targetId: 'court_cloth_bolt', targetName: 'Court-cloth Bolt', region: 'veilwood', details: 'Moonsilk fibre → court-cloth bolt.', obscure: false });
rel.registerItemUse(96520, { type: 'recipe', targetId: 'moryskah_linen_wraps', targetName: 'Moryskah Linen Wraps (alt)', region: null, details: 'Moonsilk makes premium wraps — +10% prayer at ALL altars (cross-region obscure).', obscure: true });

// Moon-tide crystal → lunar runes + dream-runes + crystal tool upgrades
rel.registerItemUse(96530, { type: 'recipe', targetId: 'lunar_rune', targetName: 'Lunar Rune', region: 'veilwood', details: 'Core ingredient of lunar rune crafting.', obscure: false });
rel.registerItemUse(96530, { type: 'recipe', targetId: 'crystal_tool_charge', targetName: 'Crystal Tool Recharge', region: 'veilwood', details: 'Moon-tide crystals recharge crystal tools in the Inner Sanctum.', obscure: true });

// Rune-thread → court-cloth + crystal armour + universal fletch-bind
rel.registerItemUse(96511, { type: 'recipe', targetId: 'court_cloth_lining', targetName: 'Court-Cloth Lining', region: 'veilwood', details: 'Binds court-cloth to crystal — needed for any Veilwood endgame armour.', obscure: false });
rel.registerItemUse(96511, { type: 'recipe', targetId: 'glass_cored_alloy', targetName: 'Glass-Cored Alloy', region: 'veilwood', details: 'Required for three-fold smithing.', obscure: false });

// Glass-stag pelt → cape, ranger armour (cross-region)
rel.registerItemUse(96553, { type: 'recipe', targetId: 'glass_stag_pelt_cape', targetName: 'Glass-Stag Pelt Cape', region: 'veilwood', details: '+5% ranged accuracy in Veilwood. Catches moonlight — bright at night.', obscure: false });
rel.registerItemUse(96553, { type: 'recipe', targetId: 'moonhunter_armour', targetName: 'Moonhunter Armour Set', region: null, details: 'Mid-game ranger set — Heartlands + Veilwood cross-craft.', obscure: true });

// Lunar chinchompa → ranged ammo (cross-region demand)
rel.registerItemUse(96554, { type: 'recipe', targetId: 'moryskah_undead_ranging', targetName: 'Moryskah Undead Hunting', region: null, details: 'Lunar chinchompas are +30% damage vs undead. Huge Moryskah cross-region demand.', obscure: false });

// Thinkberry → pie, +1 herblore buff
rel.registerItemUse(96570, { type: 'recipe', targetId: 'thinkberry_pie', targetName: 'Thinkberry Pie', region: 'veilwood', details: 'Baked into thinkberry pie. +1 herblore, 10 min.', obscure: false });
rel.registerItemUse(96570, { type: 'offering', targetId: 'mooncourt_ritual', targetName: 'Mooncourt Ritual Feed', region: 'veilwood', details: 'Offered to the Mooncourt altar to double one rune craft.', obscure: true });

// Dream-iron → bars, armour, smithing + crafting
rel.registerItemUse(96600, { type: 'recipe', targetId: 'glass_cored_alloy', targetName: 'Glass-Cored Alloy', region: 'veilwood', details: 'Dream-iron + glass-leaf + rune-thread.', obscure: false });
rel.registerItemUse(96600, { type: 'recipe', targetId: 'dream_iron_weapons', targetName: 'Dream-Iron Weapons', region: 'veilwood', details: 'Absorbs 1 spell per fight — unique Veilwood weapon property.', obscure: false });

// Kin-keeper censer — prayer cross-region
rel.registerItemUse(96590, { type: 'offering', targetId: 'any_threshold', targetName: 'Any Regional Threshold', region: null, details: 'A kin-keeper censer lets you pray at ANY region border shrine for 2× XP.', obscure: true });

console.log('[aelgard] Veilwood Deep loaded: 28 training methods (incl. 5 quirky), 10 quests, 7 breakpoints, 37 items registered, dense cross-use web');
