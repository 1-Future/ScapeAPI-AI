// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Special Regions (Phase 5)
//
// Inkweald (weird-unique, target 55-60 — intentionally small)
// Glass Desert (endgame pinnacle, target 55-65)
// The Wilds (PvP risk zone, target 55-60)
//
// These regions have distinct purposes and shouldn't try to be flagships.
// Inkweald is the eerie/surreal niche. Glass Desert is the "beat the game" zone.
// The Wilds is the lawless PvP-enabled risk arena.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const rel = require('../../data/relationships');

// ══════════════════════════════════════════════════════════════════════════════
// INKWEALD (25 → 60) — Weird Small Unique
// Dream-based surreal region. Magic-heavy. Moral-choice content.
// ══════════════════════════════════════════════════════════════════════════════

rel.registerItemSource(98200, { type: 'gathering', sourceId: 'inkweald_lucid_bloom', sourceName: 'Lucid Bloom Field', region: 'inkweald', details: 'Lucid essence (cross-region critical).', obscure: false });
rel.registerItemSource(98201, { type: 'drop', sourceId: 'inkweald_dream_drake', sourceName: 'Dream Drake', region: 'inkweald', details: 'Dream scale. Unique dragon-tier drops without combat level requirement.', obscure: false });
rel.registerItemSource(98202, { type: 'gathering', sourceId: 'inkweald_mirror_pond', sourceName: 'Mirror Pond', region: 'inkweald', details: 'Quicksilver. Alchemical secondary — transmutes metals briefly.', obscure: true });
rel.registerItemSource(98203, { type: 'drop', sourceId: 'inkweald_paradox_rabbit', sourceName: 'Paradox Rabbit', region: 'inkweald', details: 'Paradox fur (1/64). Any method affected doubles XP once.', obscure: true });
rel.registerItemSource(98204, { type: 'gathering', sourceId: 'inkweald_rune_spire', sourceName: 'Rune Spire', region: 'inkweald', details: 'Soul essence. Only soul runecrafting path outside RC 90+ altar.', obscure: false });
rel.registerItemSource(98205, { type: 'drop', sourceId: 'inkweald_reverie_shade', sourceName: 'Reverie Shade', region: 'inkweald', details: 'Shade-mote. Crafting: invisibility cloak components.', obscure: false });
rel.registerItemSource(98206, { type: 'gathering', sourceId: 'inkweald_scribe_grove', sourceName: 'Scribe Grove', region: 'inkweald', details: 'Inkweald parchment. Only region that produces enchanted paper.', obscure: false });

rel.defineTrainingMethod('inkweald_lunar_magic', {
  skill: 'magic', name: 'Lunar Spellbook Training',
  levelRange: [65, 99], xpPerHour: 125000,
  prerequisites: { skills: { magic: 65 }, quests: ['lunar_diplomacy'], items: [], areas: ['inkweald_lunar_plane'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'moderate', costPerHour: 45000, danger: 'none', complexity: 'complex', attention: 'medium',
  inputs: [{ name: 'Astral rune', perHour: 1500, source: 'runecrafting' }, { name: 'Air rune', perHour: 2500, source: 'runecrafting' }],
  description: 'Lunar spells: cure, vengeance, heal group, NPC contact. Best magic XP + utility.',
  location: 'Inkweald', breakpointAt: 65,
});

rel.defineTrainingMethod('inkweald_dream_stalker_combat', {
  skill: 'magic', name: 'Dream Stalker Burst',
  levelRange: [80, 99], xpPerHour: 185000,
  prerequisites: { skills: { magic: 80 }, quests: ['the_inkweald_door'], items: [], areas: ['inkweald'] },
  resourceOutput: { produces: [{ name: 'Dream mote', perHour: 120 }, { name: 'Gold coins', perHour: 150000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 180000, danger: 'high', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Blood rune', perHour: 2400, source: 'moryskah_blood_runecrafting' }, { name: 'Death rune', perHour: 3600, source: 'runecrafting' }],
  description: 'Burst/Barrage dream stalkers. Highest magic XP in the game. Tied for XP/hr record.',
  location: 'Inkweald',
});

rel.defineTrainingMethod('inkweald_soul_runecrafting', {
  skill: 'runecrafting', name: 'Soul Rune Crafting',
  levelRange: [90, 99], xpPerHour: 38000,
  prerequisites: { skills: { runecrafting: 90 }, quests: ['the_inkweald_door'], items: [], areas: ['inkweald'] },
  resourceOutput: { produces: [{ name: 'Soul rune', perHour: 1200 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0, danger: 'none', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Dark essence fragment', perHour: 1200, source: 'inkweald_rune_spire' }],
  description: 'Soul runes at the Inkweald spire. Highest-tier RC. Ultra-profitable.',
  location: 'Inkweald', breakpointAt: 90,
});

rel.defineTrainingMethod('inkweald_moral_choice_prayer', {
  skill: 'prayer', name: 'Mirror Pond Meditation',
  levelRange: [50, 99], xpPerHour: 95000,
  prerequisites: { skills: { prayer: 50 }, quests: [], items: [], areas: ['inkweald'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'rare', costPerHour: 0, danger: 'none', complexity: 'moderate', attention: 'low',
  inputs: [{ name: 'Dragon bones', perHour: 250, source: 'combat_drops' }, { name: 'Quicksilver', perHour: 50, source: 'inkweald_mirror_pond' }],
  description: 'Meditate at the Mirror Pond. Your reflection grants prayer insight. Obscure method.',
  location: 'Inkweald',
});

rel.defineTrainingMethod('inkweald_dream_crafting', {
  skill: 'crafting', name: 'Dream Crafting',
  levelRange: [70, 99], xpPerHour: 105000,
  prerequisites: { skills: { crafting: 70 }, quests: ['the_inkweald_door'], items: [], areas: ['inkweald'] },
  resourceOutput: { produces: [{ name: 'Dream robes', perHour: 80 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0, danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Lucid essence', perHour: 150, source: 'inkweald_lucid_bloom' }, { name: 'Shade-mote', perHour: 80, source: 'inkweald_reverie_shade' }],
  description: 'Craft dream-stuff into cloaks. Each robe has a random enchantment.',
  location: 'Inkweald',
});

rel.defineTrainingMethod('inkweald_paradox_thieving', {
  skill: 'thieving', name: 'Paradox Pickpocketing',
  levelRange: [60, 99], xpPerHour: 95000,
  prerequisites: { skills: { thieving: 60 }, quests: [], items: [], areas: ['inkweald'] },
  resourceOutput: { produces: [{ name: 'Gold coins', perHour: 95000 }, { name: 'Paradox fur', perHour: 20 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 0, danger: 'low', complexity: 'complex', attention: 'high',
  inputs: [],
  description: 'Pickpocket the paradox rabbits. They sometimes rob you back.',
  location: 'Inkweald',
});

rel.defineQuestUnlock('waking_the_dreaming_one', {
  name: 'Waking the Dreaming One',
  unlocks: [
    { type: 'boss', id: 'the_dreaming_one', description: 'The Dreaming One — Inkweald prestige boss' },
    { type: 'item_equip', id: 'lucid_staff', description: 'Lucid Staff — randomly casts free spells' },
    { type: 'item_equip', id: 'dream_talisman', description: 'Dream Talisman — switch spellbooks anywhere' },
  ],
});

rel.defineQuestUnlock('the_paradox_philosopher', {
  name: 'The Paradox Philosopher',
  unlocks: [
    { type: 'recipe', id: 'paradox_potion', description: 'Paradox potion — doubles next skill action' },
    { type: 'item_equip', id: 'philosophers_robes', description: 'Philosopher Robes — daily free magic teleport' },
  ],
});

rel.defineBreakpoint({
  type: 'skill_level', trigger: { skill: 'runecrafting', level: 90 },
  description: 'Soul rune crafting in Inkweald. Most profitable RC method. Cross-region endgame magic demand.',
  unlocks: [{ type: 'training_method', id: 'inkweald_soul_runecrafting', description: 'Soul runes' }],
  importance: 'transformative',
});

// ══════════════════════════════════════════════════════════════════════════════
// GLASS DESERT (9 → 55) — Endgame Pinnacle
// Crystal Wyrm, Fight Caves, Inferno, Dragon Hunter Lance chain
// ══════════════════════════════════════════════════════════════════════════════

rel.registerItemSource(98300, { type: 'gathering', sourceId: 'glass_desert_crystal_shard_pit', sourceName: 'Crystal Shard Pit', region: 'glass_desert', details: 'Crystal shards (endgame variant).', obscure: false });
rel.registerItemSource(98301, { type: 'drop', sourceId: 'glass_desert_crystal_wyrm', sourceName: 'Crystal Wyrm', region: 'glass_desert', details: 'Crystal wyrm scale + Dragon Hunter Lance components.', obscure: false });
rel.registerItemSource(98302, { type: 'drop', sourceId: 'glass_desert_tzhaar_warrior', sourceName: 'TzHaar Warrior', region: 'glass_desert', details: 'Obsidian shards. Obsidian weapon/armor crafting.', obscure: false });
rel.registerItemSource(98303, { type: 'drop', sourceId: 'glass_desert_jad', sourceName: 'TzTok-Jad', region: 'glass_desert', details: 'Fire Cape (prestige item). Single drop from Fight Caves wave 63.', obscure: false });
rel.registerItemSource(98304, { type: 'drop', sourceId: 'glass_desert_zuk', sourceName: 'TzKal-Zuk', region: 'glass_desert', details: 'Infernal Cape. The hardest single-drop content in Aelgard.', obscure: false });
rel.registerItemSource(98305, { type: 'drop', sourceId: 'glass_desert_sun_elemental', sourceName: 'Sun Elemental', region: 'glass_desert', details: 'Sun essence. Endgame RC material.', obscure: false });
rel.registerItemSource(98306, { type: 'gathering', sourceId: 'glass_desert_prism_garden', sourceName: 'Prism Garden', region: 'glass_desert', details: 'Prismatic herbs. All herbs in one patch, 2x yield.', obscure: true });

rel.defineTrainingMethod('glass_desert_wyrm_combat', {
  skill: 'attack', name: 'Crystal Wyrm Grinding',
  levelRange: [85, 99], xpPerHour: 95000,
  prerequisites: { skills: { attack: 85, prayer: 70 }, quests: ['the_last_dragon_p3'], items: [{ name: 'Dragon Hunter Lance' }], areas: ['glass_desert_crystal_caverns'] },
  resourceOutput: { produces: [{ name: 'Wyrm scale', perHour: 8 }, { name: 'Gold coins', perHour: 400000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 50000, danger: 'extreme', complexity: 'complex', attention: 'maximum',
  inputs: [{ name: 'Sharks', perHour: 70, source: 'cooking' }, { name: 'Super combat potion', perHour: 4, source: 'herblore' }],
  description: 'Crystal Wyrm. Tier-5 prestige boss. Best endgame melee XP + profit.',
  location: 'Glass Desert', breakpointAt: 85,
});

rel.defineTrainingMethod('glass_desert_fight_caves', {
  skill: 'ranged', name: 'Fight Caves Progression',
  levelRange: [70, 99], xpPerHour: 52000,
  prerequisites: { skills: { ranged: 70, prayer: 45 }, quests: [], items: [], areas: ['glass_desert_fight_caves'] },
  resourceOutput: { produces: [{ name: 'Fire cape', perHour: 1 }], net: 'profit' },
  bankingFrequency: 'never', costPerHour: 40000, danger: 'extreme', complexity: 'intense', attention: 'maximum',
  inputs: [{ name: 'Sharks', perHour: 60, source: 'cooking' }, { name: 'Prayer potion (4)', perHour: 8, source: 'herblore' }],
  description: 'The Fight Caves. 63 waves. Earns Fire Cape — prestige item, also entry to Inferno.',
  location: 'Glass Desert', breakpointAt: 70,
});

rel.defineTrainingMethod('glass_desert_inferno', {
  skill: 'ranged', name: 'Inferno Progression',
  levelRange: [90, 99], xpPerHour: 38000,
  prerequisites: { skills: { ranged: 90, magic: 85, prayer: 77, hitpoints: 90 }, quests: ['fight_caves'], items: [{ name: 'Fire Cape' }], areas: ['glass_desert_inferno'] },
  resourceOutput: { produces: [{ name: 'Infernal cape', perHour: 0.25 }], net: 'profit' },
  bankingFrequency: 'never', costPerHour: 150000, danger: 'extreme', complexity: 'intense', attention: 'maximum',
  inputs: [{ name: 'Sharks', perHour: 120, source: 'cooking' }, { name: 'Super restore (4)', perHour: 16, source: 'herblore' }],
  description: 'The Inferno. 69 waves. Hardest content in Aelgard. Infernal Cape = ultimate prestige.',
  location: 'Glass Desert', breakpointAt: 90,
});

rel.defineTrainingMethod('glass_desert_crystal_mining', {
  skill: 'mining', name: 'Crystal Endgame Mining',
  levelRange: [92, 99], xpPerHour: 80000,
  prerequisites: { skills: { mining: 92 }, quests: ['echoes_of_the_deep'], items: [{ name: 'Crystal pickaxe' }], areas: ['glass_desert'] },
  resourceOutput: { produces: [{ name: 'Crystal dust', perHour: 180 }, { name: 'Prismatic shard', perHour: 2 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0, danger: 'low', complexity: 'simple', attention: 'medium',
  inputs: [],
  description: 'Endgame crystal mining. Lv 92 mining breakpoint. Feeds all crystal gear maintenance.',
  location: 'Glass Desert', breakpointAt: 92,
});

rel.defineTrainingMethod('glass_desert_sun_rc', {
  skill: 'runecrafting', name: 'Sun Rune Crafting',
  levelRange: [95, 99], xpPerHour: 52000,
  prerequisites: { skills: { runecrafting: 95 }, quests: ['the_last_light'], items: [], areas: ['glass_desert'] },
  resourceOutput: { produces: [{ name: 'Wrath rune', perHour: 1800 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0, danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Pure essence', perHour: 1800, source: 'mining' }],
  description: 'Wrath runes at the Sun Altar. Post-endgame RC. Only source of Wrath spells.',
  location: 'Glass Desert', breakpointAt: 95,
});

rel.defineTrainingMethod('glass_desert_tzhaar_smithing', {
  skill: 'smithing', name: 'Obsidian Smithing',
  levelRange: [60, 99], xpPerHour: 95000,
  prerequisites: { skills: { smithing: 60 }, quests: [], items: [], areas: ['glass_desert'] },
  resourceOutput: { produces: [{ name: 'Obsidian items', perHour: 50 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0, danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Obsidian shards', perHour: 1200, source: 'glass_desert_tzhaar_warrior' }],
  description: 'TzHaar obsidian smithing. Obsidian gear is BIS in specific niches.',
  location: 'Glass Desert',
});

rel.defineTrainingMethod('glass_desert_herb_garden', {
  skill: 'herblore', name: 'Prism Garden Herblore',
  levelRange: [70, 99], xpPerHour: 105000,
  prerequisites: { skills: { herblore: 70 }, quests: [], items: [], areas: ['glass_desert'] },
  resourceOutput: { produces: [{ name: 'Premium potions', perHour: 400 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0, danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Clean herbs', perHour: 400, source: 'glass_desert_prism_garden' }, { name: 'Vial of water', perHour: 400, source: 'shop' }],
  description: 'Prism garden grows all herb types. 2x yield means Glass Desert can self-sustain herblore.',
  location: 'Glass Desert',
});

rel.defineQuestUnlock('slaying_the_crystal_wyrm', {
  name: 'Slaying the Crystal Wyrm',
  unlocks: [
    { type: 'boss', id: 'veldrak_the_crystal_wyrm', description: 'Crystal Wyrm — endgame prestige boss' },
    { type: 'item_equip', id: 'crystal_wyrm_scale_cape', description: 'Crystal Wyrm Scale Cape — BIS prayer-switching cape' },
    { type: 'item_equip', id: 'dragon_hunter_lance', description: 'Dragon Hunter Lance fully assembled' },
  ],
});

rel.defineQuestUnlock('the_sun_priest', {
  name: 'The Sun Priest',
  unlocks: [
    { type: 'training_method', id: 'glass_desert_sun_rc', description: 'Sun (wrath) runecrafting' },
    { type: 'spellbook', id: 'wrath_spellbook', description: 'Wrath spellbook — post-endgame magic' },
  ],
});

rel.defineBreakpoint({
  type: 'skill_level', trigger: { skill: 'mining', level: 92 },
  description: 'Crystal endgame mining. Post-mastery mining. Crystal dust feeds all endgame crystal gear.',
  unlocks: [{ type: 'training_method', id: 'glass_desert_crystal_mining', description: 'Crystal mining' }],
  importance: 'major',
});

rel.defineBreakpoint({
  type: 'item_acquired', trigger: { item: 'infernal_cape' },
  description: 'Infernal Cape. The ultimate prestige item. Proves you beat the hardest content in Aelgard.',
  unlocks: [],
  importance: 'transformative',
});

// ══════════════════════════════════════════════════════════════════════════════
// THE WILDS (49 → 60) — PvP Risk Zone
// Lawless arena with boosted XP in exchange for constant danger
// ══════════════════════════════════════════════════════════════════════════════

rel.registerItemSource(98400, { type: 'drop', sourceId: 'wilds_greater_revenant', sourceName: 'Greater Revenant', region: 'the_wilds', details: 'Revenant weapon drops. Best PvP gear. High risk.', obscure: false });
rel.registerItemSource(98401, { type: 'drop', sourceId: 'wilds_chaos_elemental', sourceName: 'Chaos Elemental', region: 'the_wilds', details: 'Chaos orbs. Wilderness-only magic ammo.', obscure: false });
rel.registerItemSource(98402, { type: 'drop', sourceId: 'wilds_callisto', sourceName: 'Callisto', region: 'the_wilds', details: 'Callisto bear skin. Prayer-preserving armor.', obscure: false });
rel.registerItemSource(98403, { type: 'drop', sourceId: 'wilds_venenatis', sourceName: 'Venenatis', region: 'the_wilds', details: 'Venenatis fangs. Treasonous ring materials.', obscure: false });
rel.registerItemSource(98404, { type: 'drop', sourceId: 'wilds_vetion', sourceName: "Vet'ion", region: 'the_wilds', details: 'Skeletal champion drops. Barrows-tier weapons from PvP zone.', obscure: false });

rel.defineTrainingMethod('wilds_revenant_combat', {
  skill: 'attack', name: 'Revenant Weapon Hunting',
  levelRange: [75, 99], xpPerHour: 110000,
  prerequisites: { skills: { attack: 75 }, quests: [], items: [], areas: ['wilds_revenant_caves'] },
  resourceOutput: { produces: [{ name: 'Revenant weapons', perHour: 0.3 }, { name: 'Revenant ether', perHour: 180 }, { name: 'Gold coins', perHour: 500000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 80000, danger: 'extreme', complexity: 'intense', attention: 'maximum',
  inputs: [{ name: 'Sharks', perHour: 80, source: 'cooking' }, { name: 'Super restore (4)', perHour: 8, source: 'herblore' }],
  description: 'Revenant caves. Extreme PKer threat. Highest combat profit + XP. Revenant weapons are BIS in wilds.',
  location: 'The Wilds',
});

rel.defineTrainingMethod('wilds_boss_hunting', {
  skill: 'strength', name: 'Wilderness Boss Hunting',
  levelRange: [80, 99], xpPerHour: 85000,
  prerequisites: { skills: { strength: 80 }, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Wilderness boss drops', perHour: 3 }, { name: 'Gold coins', perHour: 600000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 100000, danger: 'extreme', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Sharks', perHour: 50, source: 'cooking' }, { name: 'Super combat potion', perHour: 2, source: 'herblore' }],
  description: 'Callisto / Venenatis / Vetion. Wilderness bosses. Extreme risk — PKers hunt you while you hunt bosses.',
  location: 'The Wilds',
});

rel.defineTrainingMethod('wilds_chaos_altar_prayer', {
  skill: 'prayer', name: 'Chaos Altar Prayer',
  levelRange: [1, 99], xpPerHour: 380000,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'moderate', costPerHour: 0, danger: 'extreme', complexity: 'moderate', attention: 'maximum',
  inputs: [{ name: 'Dragon bones', perHour: 420, source: 'combat_drops' }],
  description: 'Chaos Altar gives 7x prayer XP. Highest in the game. PKers patrol the altar — you WILL be attacked.',
  location: 'The Wilds',
});

rel.defineTrainingMethod('wilds_ent_farming', {
  skill: 'farming', name: 'Wilderness Ent Farming',
  levelRange: [65, 99], xpPerHour: 75000,
  prerequisites: { skills: { farming: 65 }, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Yew logs', perHour: 300 }, { name: 'Magic logs', perHour: 60 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 0, danger: 'extreme', complexity: 'moderate', attention: 'high',
  inputs: [{ name: 'Tree sapling', perHour: 12, source: 'heartlands_farmer' }],
  description: 'Plant tree saplings in the wilds. PKers can steal your logs — high risk, high reward.',
  location: 'The Wilds',
});

rel.defineTrainingMethod('wilds_rune_essence', {
  skill: 'runecrafting', name: 'Wilderness Pure Essence',
  levelRange: [1, 99], xpPerHour: 68000,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Pure essence', perHour: 1500 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 0, danger: 'extreme', complexity: 'simple', attention: 'medium',
  inputs: [],
  description: 'Pure essence mines in the wilderness — 3x yield vs safe regions. PKer threat.',
  location: 'The Wilds',
});

rel.defineTrainingMethod('wilds_abyss_runecrafting', {
  skill: 'runecrafting', name: 'Wilderness Abyss RC',
  levelRange: [44, 99], xpPerHour: 58000,
  prerequisites: { skills: { runecrafting: 44 }, quests: ['enter_the_abyss'], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Nature rune', perHour: 2000 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 0, danger: 'high', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Pure essence', perHour: 2000, source: 'mining' }],
  description: 'Abyss shortcut to all altars. Wilderness route is fastest RC. Danger from PKers.',
  location: 'The Wilds',
});

rel.defineTrainingMethod('wilds_mage_bank_magic', {
  skill: 'magic', name: 'Mage of Zamorak Battles',
  levelRange: [60, 99], xpPerHour: 95000,
  prerequisites: { skills: { magic: 60 }, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Death rune', perHour: 180 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 30000, danger: 'high', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Air rune', perHour: 6000, source: 'runecrafting' }, { name: 'Death rune', perHour: 1200, source: 'runecrafting' }],
  description: 'Fight Zamorakian mages in the wilderness. They drop runes. PvP-enabled.',
  location: 'The Wilds',
});

rel.defineTrainingMethod('wilds_dark_crab_fishing', {
  skill: 'fishing', name: 'Dark Crab Pirate Coast',
  levelRange: [85, 99], xpPerHour: 45000,
  prerequisites: { skills: { fishing: 85 }, quests: [], items: [{ name: 'Lobster pot' }], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Raw dark crab', perHour: 150 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 0, danger: 'extreme', complexity: 'simple', attention: 'medium',
  inputs: [],
  description: 'Dark crabs = premium food (heals 22). Wilderness-only. Extreme PKer threat.',
  location: 'The Wilds',
});

rel.defineQuestUnlock('coronation_of_the_revenant_king', {
  name: 'Coronation of the Revenant King',
  unlocks: [
    { type: 'boss', id: 'revenant_king', description: 'Revenant King — Wilds prestige boss' },
    { type: 'item_equip', id: 'wilderness_crown', description: 'Wilderness Crown — BIS in wilds, 20% damage bonus' },
    { type: 'item_equip', id: 'revenant_ether_mace', description: 'Revenant Ether Mace — vampiric in wilds only' },
  ],
});

rel.defineQuestUnlock('the_rogue_chef', {
  name: 'The Rogue Chef',
  unlocks: [
    { type: 'training_method', id: 'wilds_ent_farming', description: 'Wilderness tree farming' },
    { type: 'recipe', id: 'wilderness_feast', description: 'Wilderness feast — +2 HP healing on all foods' },
  ],
});

rel.defineBreakpoint({
  type: 'quest_complete', trigger: { quest: 'coronation_of_the_revenant_king' },
  description: 'Wilderness Crown equipped. Risk king of Aelgard. Transformative identity shift.',
  unlocks: [{ type: 'item_equip', id: 'wilderness_crown', description: 'Wilderness Crown' }],
  importance: 'transformative',
});

rel.defineBreakpoint({
  type: 'skill_level', trigger: { skill: 'prayer', level: 1 },
  description: 'Chaos Altar is accessible at ANY prayer level. 7x XP. THE wilderness economy of prayer training.',
  unlocks: [{ type: 'training_method', id: 'wilds_chaos_altar_prayer', description: 'Chaos altar' }],
  importance: 'minor',
});

console.log('[aelgard] Special Regions loaded: Inkweald + Glass Desert + Wilds with 20+ training methods, 20+ items, 6 quests, 4 breakpoints');
