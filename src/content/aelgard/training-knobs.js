// ==============================================================================
// Aelgard -- Training Knobs for All 23 Skills
//
// Marstead's 8 Balance Knobs applied to every training method in the game.
// This is the backbone of the attention calibration system.
//
// Design Rules (from "RuneScape is Awesome"):
//   1. Every 10-level bracket needs 2+ methods with DIFFERENT attention levels
//   2. AFK XP is the baseline. More attention = more XP/hr (never free speed)
//   3. No method is strictly better -- every one trades off across the 8 knobs
//   4. Resource-producing methods justify lower XP/hr
//   5. Money-costing methods justify higher XP/hr
//   6. Dangerous areas get reward bonuses to justify risk
//   7. No misery zones: high attention MUST be rewarding
//
// Attention: afk (5+ min), low (30-60s), medium (active), high (full focus), maximum (harder than raids)
//
// Supply Chain (inputs field):
//   Each method declares what it CONSUMES via inputs: [{ name, perHour, source }]
//   source hints: 'combat_drops', 'fishing', 'mining', 'farming', 'shop', 'ge',
//                 'fishing_cooking', 'woodcutting', 'crafting', 'smithing', 'hunter'
//   Producers (mining, wc, fishing) have inputs: [] -- they GENERATE items.
//   Activity skills (agility, thieving, hunter) have inputs: [] -- no consumption.
// ==============================================================================

'use strict';

const rel = require('../../data/relationships');

// ==============================================================================
// ATTACK (1/23)
// ==============================================================================

rel.defineTrainingMethod('attack_chickens', {
  skill: 'attack', name: 'Chicken Slaughter',
  levelRange: [1, 20],
  xpPerHour: 8000,
  prerequisites: { skills: {}, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Raw chicken', perHour: 120 }, { name: 'Feather', perHour: 600 }], net: 'profit' },
  inputs: [],
  bankingFrequency: 'moderate',
  costPerHour: 0,
  danger: 'none',
  complexity: 'trivial',
  attention: 'afk',
  description: 'Auto-retaliate on chickens. Feathers sell to fletchers. The gentlest start.',
  location: 'Heartlands',
  breakpointAt: 1,
});

rel.defineTrainingMethod('attack_cows', {
  skill: 'attack', name: 'Cow Field Training',
  levelRange: [1, 30],
  xpPerHour: 14000,
  prerequisites: { skills: {}, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Cowhide', perHour: 100 }, { name: 'Raw beef', perHour: 100 }], net: 'profit' },
  inputs: [{ name: 'Trout', perHour: 5, source: 'fishing_cooking' }],
  bankingFrequency: 'moderate',
  costPerHour: 0,
  danger: 'none',
  complexity: 'simple',
  attention: 'low',
  description: 'Cows near the bank. Hides are valuable early on for crafting.',
  location: 'Heartlands',
  breakpointAt: null,
});

rel.defineTrainingMethod('attack_sand_crabs', {
  skill: 'attack', name: 'Sand Crab AFKing',
  levelRange: [10, 60],
  xpPerHour: 30000,
  prerequisites: { skills: { attack: 10 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [], net: 'neutral' },
  inputs: [],
  bankingFrequency: 'never',
  costPerHour: 0,
  danger: 'none',
  complexity: 'trivial',
  attention: 'afk',
  description: 'AFK multi-combat crabs. Reset aggro every 10 minutes. Zero profit, pure XP.',
  location: 'Saltbrine Reach',
  breakpointAt: 10,
});

rel.defineTrainingMethod('attack_slayer_tasks', {
  skill: 'attack', name: 'Slayer Task Melee',
  levelRange: [20, 99],
  xpPerHour: 40000,
  prerequisites: { skills: { attack: 20, slayer: 15 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Slayer loot', perHour: 1 }], net: 'profit' },
  inputs: [{ name: 'Lobster', perHour: 15, source: 'fishing_cooking' }],
  bankingFrequency: 'frequent',
  costPerHour: 5000,
  danger: 'medium',
  complexity: 'moderate',
  attention: 'medium',
  description: 'Train attack on slayer assignments. Varied tasks keep it interesting and profitable.',
  location: 'Heartlands',
  breakpointAt: 20,
});

rel.defineTrainingMethod('attack_nightmare_zone', {
  skill: 'attack', name: 'Nightmare Zone Melee',
  levelRange: [70, 99],
  xpPerHour: 90000,
  prerequisites: { skills: { attack: 70 }, quests: ['desert_treasure', 'the_green_thumb'], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'NMZ points', perHour: 50000 }], net: 'neutral' },
  inputs: [{ name: 'Absorption potion', perHour: 8, source: 'shop' }],
  bankingFrequency: 'never',
  costPerHour: 20000,
  danger: 'low',
  complexity: 'simple',
  attention: 'low',
  description: 'Absorption potions and overloads turn this into semi-AFK high XP. Costs entry fee.',
  location: 'Heartlands',
  breakpointAt: 70,
});

rel.defineTrainingMethod('attack_wilds_revenants', {
  skill: 'attack', name: 'Revenant Hunting (Melee)',
  levelRange: [60, 99],
  xpPerHour: 55000,
  prerequisites: { skills: { attack: 60, hitpoints: 70 }, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Revenant ether', perHour: 200 }, { name: 'Rare drops', perHour: 1 }], net: 'profit' },
  inputs: [{ name: 'Shark', perHour: 30, source: 'fishing_cooking' }, { name: 'Prayer potion', perHour: 4, source: 'herblore' }],
  bankingFrequency: 'rare',
  costPerHour: -80000,
  danger: 'extreme',
  complexity: 'complex',
  attention: 'maximum',
  description: 'High profit revenants in deep Wilds. PKers are the real threat. Bring 3-item risk.',
  location: 'The Wilds',
  breakpointAt: 60,
});

// ==============================================================================
// STRENGTH (2/23)
// ==============================================================================

rel.defineTrainingMethod('strength_sand_crabs', {
  skill: 'strength', name: 'Sand Crab Strength',
  levelRange: [1, 60],
  xpPerHour: 28000,
  prerequisites: { skills: {}, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [], net: 'neutral' },
  inputs: [],
  bankingFrequency: 'never',
  costPerHour: 0,
  danger: 'none',
  complexity: 'trivial',
  attention: 'afk',
  description: 'AFK crabs on aggressive style. Pure XP, zero engagement, zero profit.',
  location: 'Saltbrine Reach',
  breakpointAt: null,
});

rel.defineTrainingMethod('strength_hill_giants', {
  skill: 'strength', name: 'Hill Giant Bashing',
  levelRange: [10, 40],
  xpPerHour: 18000,
  prerequisites: { skills: { strength: 10 }, quests: [], items: [{ id: 15050, name: 'Brass key', consumed: false }], areas: [] },
  resourceOutput: { produces: [{ name: 'Big bones', perHour: 100 }, { name: 'Limpwurt root', perHour: 15 }], net: 'profit' },
  inputs: [{ name: 'Trout', perHour: 8, source: 'fishing_cooking' }],
  bankingFrequency: 'frequent',
  costPerHour: -15000,
  danger: 'low',
  complexity: 'simple',
  attention: 'low',
  description: 'Big bone drops fund prayer training. A classic early grind with real output. The resource advantage over crabs.',
  location: 'Heartlands',
  breakpointAt: null,
});

rel.defineTrainingMethod('strength_obsidian_training', {
  skill: 'strength', name: 'Obsidian Sword Training',
  levelRange: [60, 99],
  xpPerHour: 80000,
  prerequisites: { skills: { strength: 60 }, quests: [], items: [{ id: 16001, name: 'Toktz-xil-ak', consumed: false }], areas: [] },
  resourceOutput: { produces: [], net: 'neutral' },
  inputs: [{ name: 'Absorption potion', perHour: 8, source: 'shop' }],
  bankingFrequency: 'never',
  costPerHour: 15000,
  danger: 'low',
  complexity: 'simple',
  attention: 'low',
  description: 'Full obsidian with berserker necklace. Semi-AFK training at NMZ or crabs.',
  location: 'Heartlands',
  breakpointAt: 60,
});

rel.defineTrainingMethod('strength_wilderness_bosses', {
  skill: 'strength', name: 'Wilderness Boss Grinding',
  levelRange: [70, 99],
  xpPerHour: 60000,
  prerequisites: { skills: { strength: 70, hitpoints: 80 }, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Boss uniques', perHour: 1 }], net: 'profit' },
  inputs: [{ name: 'Shark', perHour: 40, source: 'fishing_cooking' }, { name: 'Super combat potion', perHour: 3, source: 'herblore' }],
  bankingFrequency: 'rare',
  costPerHour: -120000,
  danger: 'extreme',
  complexity: 'complex',
  attention: 'high',
  description: 'Wilderness bosses hit hard and PKers lurk. Huge profit justifies extreme risk.',
  location: 'The Wilds',
  breakpointAt: 70,
});

rel.defineTrainingMethod('strength_barbarian_assault', {
  skill: 'strength', name: 'Barbarian Assault (Attacker)',
  levelRange: [40, 99],
  xpPerHour: 50000,
  prerequisites: { skills: { strength: 40, attack: 40 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Honour points', perHour: 300 }], net: 'neutral' },
  inputs: [],
  bankingFrequency: 'never',
  costPerHour: 0,
  danger: 'medium',
  complexity: 'complex',
  attention: 'high',
  description: 'Team minigame with role-based combat. High engagement, unique rewards, free.',
  location: 'Heartlands',
  breakpointAt: 40,
});

// ==============================================================================
// DEFENCE (3/23)
// ==============================================================================

rel.defineTrainingMethod('defence_sand_crabs_def', {
  skill: 'defence', name: 'Sand Crab Defence',
  levelRange: [1, 60],
  xpPerHour: 22000,
  prerequisites: { skills: {}, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [], net: 'neutral' },
  inputs: [],
  bankingFrequency: 'never',
  costPerHour: 0,
  danger: 'none',
  complexity: 'trivial',
  attention: 'afk',
  description: 'Defensive style on crabs. Slowest combat XP but completely AFK.',
  location: 'Saltbrine Reach',
  breakpointAt: null,
});

rel.defineTrainingMethod('defence_castle_wars_def', {
  skill: 'defence', name: 'Castle Wars Defence Training',
  levelRange: [1, 40],
  xpPerHour: 15000,
  prerequisites: { skills: {}, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Castle wars ticket', perHour: 4 }], net: 'neutral' },
  inputs: [],
  bankingFrequency: 'never',
  costPerHour: 0,
  danger: 'low',
  complexity: 'simple',
  attention: 'afk',
  description: 'AFK at Castle Wars on defensive. Free, earns tickets, no food needed. Low-level AFK defence option.',
  location: 'Heartlands',
  breakpointAt: 1,
});

rel.defineTrainingMethod('defence_slayer_def', {
  skill: 'defence', name: 'Slayer on Defensive',
  levelRange: [20, 99],
  xpPerHour: 35000,
  prerequisites: { skills: { defence: 20, slayer: 15 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Slayer loot', perHour: 1 }], net: 'profit' },
  inputs: [{ name: 'Lobster', perHour: 18, source: 'fishing_cooking' }],
  bankingFrequency: 'frequent',
  costPerHour: 5000,
  danger: 'medium',
  complexity: 'moderate',
  attention: 'medium',
  description: 'Slayer tasks on defensive. Slower kills but profitable and varied.',
  location: 'Heartlands',
  breakpointAt: 20,
});

rel.defineTrainingMethod('defence_chinchompa_stacking', {
  skill: 'defence', name: 'Chinchompa Defence Stacking',
  levelRange: [45, 99],
  xpPerHour: 120000,
  prerequisites: { skills: { defence: 45, ranged: 65 }, quests: ['moryskah_requiem'], items: [], areas: [] },
  resourceOutput: { produces: [], net: 'neutral' },
  inputs: [{ name: 'Red chinchompa', perHour: 1200, source: 'hunter' }, { name: 'Prayer potion', perHour: 4, source: 'herblore' }],
  bankingFrequency: 'frequent',
  costPerHour: 350000,
  danger: 'medium',
  complexity: 'complex',
  attention: 'high',
  description: 'Chin monkey stacking on long-range. Absurdly fast but costs a fortune per hour.',
  location: 'Moryskah',
  breakpointAt: 45,
});

rel.defineTrainingMethod('defence_pest_control', {
  skill: 'defence', name: 'Pest Control (Defence)',
  levelRange: [40, 99],
  xpPerHour: 55000,
  prerequisites: { skills: { defence: 40 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Void knight commendation', perHour: 30 }], net: 'neutral' },
  inputs: [],
  bankingFrequency: 'never',
  costPerHour: 0,
  danger: 'low',
  complexity: 'moderate',
  attention: 'medium',
  description: 'Team minigame. Medium engagement, free, earns void knight equipment.',
  location: 'Saltbrine Reach',
  breakpointAt: 40,
});

rel.defineTrainingMethod('defence_wilds_abyss_training', {
  skill: 'defence', name: 'Abyss Defence Training',
  levelRange: [60, 99],
  xpPerHour: 70000,
  prerequisites: { skills: { defence: 60, hitpoints: 60 }, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [], net: 'neutral' },
  inputs: [{ name: 'Lobster', perHour: 25, source: 'fishing_cooking' }],
  bankingFrequency: 'never',
  costPerHour: 8000,
  danger: 'high',
  complexity: 'moderate',
  attention: 'medium',
  description: 'Multi-combat abyss creatures. Good XP, skull risk entering. Bring cheap gear.',
  location: 'The Wilds',
  breakpointAt: 60,
});

// ==============================================================================
// HITPOINTS (4/23)
// ==============================================================================

rel.defineTrainingMethod('hitpoints_passive_combat', {
  skill: 'hitpoints', name: 'Passive Combat HP',
  levelRange: [1, 99],
  xpPerHour: 12000,
  prerequisites: { skills: {}, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [], net: 'neutral' },
  inputs: [],
  bankingFrequency: 'never',
  costPerHour: 0,
  danger: 'none',
  complexity: 'trivial',
  attention: 'afk',
  description: 'HP XP comes free with any combat. AFK anything and HP ticks up.',
  location: 'Heartlands',
  breakpointAt: null,
});

rel.defineTrainingMethod('hitpoints_nmz_absorption', {
  skill: 'hitpoints', name: 'NMZ Absorption HP',
  levelRange: [50, 99],
  xpPerHour: 30000,
  prerequisites: { skills: { hitpoints: 50 }, quests: ['desert_treasure'], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'NMZ points', perHour: 50000 }], net: 'neutral' },
  inputs: [{ name: 'Absorption potion', perHour: 8, source: 'shop' }],
  bankingFrequency: 'never',
  costPerHour: 20000,
  danger: 'none',
  complexity: 'simple',
  attention: 'low',
  description: 'Absorption potions soak damage while you accumulate passive HP XP.',
  location: 'Heartlands',
  breakpointAt: 50,
});

rel.defineTrainingMethod('hitpoints_slayer_hp', {
  skill: 'hitpoints', name: 'Slayer HP Training',
  levelRange: [20, 99],
  xpPerHour: 25000,
  prerequisites: { skills: { slayer: 15 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Slayer loot', perHour: 1 }], net: 'profit' },
  inputs: [{ name: 'Lobster', perHour: 15, source: 'fishing_cooking' }],
  bankingFrequency: 'frequent',
  costPerHour: 0,
  danger: 'medium',
  complexity: 'moderate',
  attention: 'medium',
  description: 'HP XP from slayer tasks. Profitable and varied, standard mid-game path.',
  location: 'Heartlands',
  breakpointAt: null,
});

rel.defineTrainingMethod('hitpoints_raids_hp', {
  skill: 'hitpoints', name: 'Raid Boss HP',
  levelRange: [75, 99],
  xpPerHour: 45000,
  prerequisites: { skills: { hitpoints: 75, attack: 80, strength: 80 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Raid rewards', perHour: 1 }], net: 'profit' },
  inputs: [{ name: 'Shark', perHour: 50, source: 'fishing_cooking' }, { name: 'Super restore', perHour: 6, source: 'herblore' }, { name: 'Super combat potion', perHour: 2, source: 'herblore' }],
  bankingFrequency: 'rare',
  costPerHour: 50000,
  danger: 'high',
  complexity: 'intense',
  attention: 'maximum',
  description: 'Raid bosses demand maximum focus. HP XP is a byproduct of the real challenge.',
  location: 'Moryskah',
  breakpointAt: 75,
});

rel.defineTrainingMethod('hitpoints_wilds_green_dragons', {
  skill: 'hitpoints', name: 'Green Dragons (HP)',
  levelRange: [40, 70],
  xpPerHour: 35000,
  prerequisites: { skills: { hitpoints: 40 }, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Dragon bones', perHour: 80 }, { name: 'Green dragonhide', perHour: 80 }], net: 'profit' },
  inputs: [{ name: 'Lobster', perHour: 20, source: 'fishing_cooking' }],
  bankingFrequency: 'frequent',
  costPerHour: -60000,
  danger: 'high',
  complexity: 'moderate',
  attention: 'high',
  description: 'Great profit from bones and hides. PKer risk keeps most people away.',
  location: 'The Wilds',
  breakpointAt: 40,
});

// ==============================================================================
// RANGED (5/23)
// ==============================================================================

rel.defineTrainingMethod('ranged_safe_spot_ogres', {
  skill: 'ranged', name: 'Ogre Safespot',
  levelRange: [1, 30],
  xpPerHour: 12000,
  prerequisites: { skills: {}, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [], net: 'neutral' },
  inputs: [{ name: 'Iron arrow', perHour: 600, source: 'shop' }],
  bankingFrequency: 'moderate',
  costPerHour: 2000,
  danger: 'none',
  complexity: 'simple',
  attention: 'low',
  description: 'Safespot ogres behind a fence. Arrow cost is the only expense. Relaxed.',
  location: 'Heartlands',
  breakpointAt: 1,
});

rel.defineTrainingMethod('ranged_sand_crabs_ranged', {
  skill: 'ranged', name: 'Sand Crab Ranging',
  levelRange: [10, 60],
  xpPerHour: 30000,
  prerequisites: { skills: { ranged: 10 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [], net: 'neutral' },
  inputs: [{ name: 'Iron arrow', perHour: 900, source: 'shop' }],
  bankingFrequency: 'never',
  costPerHour: 5000,
  danger: 'none',
  complexity: 'trivial',
  attention: 'afk',
  description: 'Iron arrows on crabs. AFK ranged with minor ammo cost.',
  location: 'Saltbrine Reach',
  breakpointAt: 10,
});

rel.defineTrainingMethod('ranged_nmz_blowpipe', {
  skill: 'ranged', name: 'NMZ Blowpipe AFK',
  levelRange: [60, 99],
  xpPerHour: 65000,
  prerequisites: { skills: { ranged: 60 }, quests: ['desert_treasure'], items: [{ id: 16150, name: 'Toxic blowpipe', consumed: false }], areas: [] },
  resourceOutput: { produces: [{ name: 'NMZ points', perHour: 40000 }], net: 'neutral' },
  inputs: [{ name: 'Zulrah scale', perHour: 1800, source: 'combat_drops' }, { name: 'Mithril dart', perHour: 1800, source: 'smithing' }, { name: 'Absorption potion', perHour: 8, source: 'shop' }],
  bankingFrequency: 'never',
  costPerHour: 120000,
  danger: 'none',
  complexity: 'simple',
  attention: 'low',
  description: 'Blowpipe at NMZ with absorption potions. AFK ranged training at 60+. Scale cost adds up.',
  location: 'Heartlands',
  breakpointAt: 60,
});

rel.defineTrainingMethod('ranged_chinchompas', {
  skill: 'ranged', name: 'Chinchompa Stacking',
  levelRange: [45, 99],
  xpPerHour: 350000,
  prerequisites: { skills: { ranged: 45 }, quests: ['moryskah_requiem'], items: [], areas: [] },
  resourceOutput: { produces: [], net: 'neutral' },
  inputs: [{ name: 'Red chinchompa', perHour: 2000, source: 'hunter' }, { name: 'Prayer potion', perHour: 6, source: 'herblore' }],
  bankingFrequency: 'frequent',
  costPerHour: 800000,
  danger: 'medium',
  complexity: 'complex',
  attention: 'high',
  description: 'AoE chinchompas on stacked monkeys. The fastest ranged XP in the game. Extremely expensive.',
  location: 'Moryskah',
  breakpointAt: 45,
});

rel.defineTrainingMethod('ranged_slayer_cannon', {
  skill: 'ranged', name: 'Cannon + Slayer',
  levelRange: [30, 99],
  xpPerHour: 60000,
  prerequisites: { skills: { ranged: 30, slayer: 20 }, quests: [], items: [{ id: 16100, name: 'Dwarf multicannon', consumed: false }], areas: [] },
  resourceOutput: { produces: [{ name: 'Slayer loot', perHour: 1 }], net: 'profit' },
  inputs: [{ name: 'Cannonball', perHour: 2500, source: 'smithing' }, { name: 'Lobster', perHour: 10, source: 'fishing_cooking' }],
  bankingFrequency: 'frequent',
  costPerHour: 200000,
  danger: 'medium',
  complexity: 'moderate',
  attention: 'medium',
  description: 'Cannon accelerates slayer kills. Expensive but profitable from drops. The balanced path.',
  location: 'Heartlands',
  breakpointAt: 30,
});

rel.defineTrainingMethod('ranged_wilds_black_chins', {
  skill: 'ranged', name: 'Black Chin Hunting + Ranging',
  levelRange: [70, 99],
  xpPerHour: 150000,
  prerequisites: { skills: { ranged: 70, hunter: 73 }, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Black chinchompa', perHour: 120 }], net: 'profit' },
  inputs: [{ name: 'Shark', perHour: 10, source: 'fishing_cooking' }],
  bankingFrequency: 'rare',
  costPerHour: -200000,
  danger: 'extreme',
  complexity: 'complex',
  attention: 'maximum',
  description: 'Hunt and use black chins in the Wilds. Massive profit but PKers camp the spot.',
  location: 'The Wilds',
  breakpointAt: 73,
});

// ==============================================================================
// PRAYER (6/23)
// ==============================================================================

rel.defineTrainingMethod('prayer_bones_altar', {
  skill: 'prayer', name: 'Regular Bones at Altar',
  levelRange: [1, 30],
  xpPerHour: 15000,
  prerequisites: { skills: {}, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [], net: 'neutral' },
  inputs: [{ name: 'Bones', perHour: 350, source: 'combat_drops' }],
  bankingFrequency: 'frequent',
  costPerHour: 10000,
  danger: 'none',
  complexity: 'simple',
  attention: 'low',
  description: 'Buy bones, use on altar. The cheapest entry into prayer. Repetitive but safe.',
  location: 'Heartlands',
  breakpointAt: 1,
});

rel.defineTrainingMethod('prayer_dragon_bones_gilded', {
  skill: 'prayer', name: 'Dragon Bones on Gilded Altar',
  levelRange: [30, 99],
  xpPerHour: 300000,
  prerequisites: { skills: { prayer: 30, construction: 50 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [], net: 'neutral' },
  inputs: [{ name: 'Dragon bones', perHour: 300, source: 'combat_drops' }],
  bankingFrequency: 'constant',
  costPerHour: 1500000,
  danger: 'none',
  complexity: 'simple',
  attention: 'medium',
  description: 'Gilded altar gives 350% XP. Fast but drains the bank. The money method.',
  location: 'Heartlands',
  breakpointAt: 30,
});

rel.defineTrainingMethod('prayer_ectofuntus', {
  skill: 'prayer', name: 'Ectofuntus Worship',
  levelRange: [1, 99],
  xpPerHour: 100000,
  prerequisites: { skills: {}, quests: ['moryskah_haunting'], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Ecto-token', perHour: 200 }], net: 'neutral' },
  inputs: [{ name: 'Dragon bones', perHour: 200, source: 'combat_drops' }],
  bankingFrequency: 'frequent',
  costPerHour: 300000,
  danger: 'none',
  complexity: 'moderate',
  attention: 'high',
  description: 'Grind bones, worship. Better XP per bone than gilded but slower per hour. Earns tokens.',
  location: 'Moryskah',
  breakpointAt: null,
});

rel.defineTrainingMethod('prayer_wilds_chaos_altar', {
  skill: 'prayer', name: 'Chaos Altar (Wilderness)',
  levelRange: [1, 99],
  xpPerHour: 350000,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [], net: 'neutral' },
  inputs: [{ name: 'Dragon bones', perHour: 350, source: 'combat_drops' }],
  bankingFrequency: 'never',
  costPerHour: 700000,
  danger: 'extreme',
  complexity: 'simple',
  attention: 'maximum',
  description: '50% chance bones are saved. Best XP/gp in the game. Bring one inventory at a time.',
  location: 'The Wilds',
  breakpointAt: null,
});

rel.defineTrainingMethod('prayer_ensouled_heads', {
  skill: 'prayer', name: 'Ensouled Head Reanimation',
  levelRange: [20, 99],
  xpPerHour: 60000,
  prerequisites: { skills: { prayer: 20, magic: 40 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [], net: 'neutral' },
  inputs: [{ name: 'Ensouled head', perHour: 180, source: 'combat_drops' }, { name: 'Nature rune', perHour: 180, source: 'runecrafting' }, { name: 'Soul rune', perHour: 180, source: 'runecrafting' }],
  bankingFrequency: 'moderate',
  costPerHour: 150000,
  danger: 'low',
  complexity: 'moderate',
  attention: 'medium',
  description: 'Reanimate heads and kill them for prayer XP. Cheaper than bones, needs magic levels.',
  location: 'Inkweald',
  breakpointAt: 20,
});

// ==============================================================================
// MAGIC (7/23)
// ==============================================================================

rel.defineTrainingMethod('magic_wind_strike', {
  skill: 'magic', name: 'Strike Spells',
  levelRange: [1, 20],
  xpPerHour: 10000,
  prerequisites: { skills: {}, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [], net: 'neutral' },
  inputs: [{ name: 'Mind rune', perHour: 500, source: 'shop' }, { name: 'Air rune', perHour: 500, source: 'runecrafting' }],
  bankingFrequency: 'moderate',
  costPerHour: 5000,
  danger: 'none',
  complexity: 'trivial',
  attention: 'afk',
  description: 'Auto-cast strikes on safe monsters. Rune cost is minimal. Gentle start.',
  location: 'Heartlands',
  breakpointAt: 1,
});

rel.defineTrainingMethod('magic_curse_alching', {
  skill: 'magic', name: 'Curse / Low Alchemy',
  levelRange: [19, 40],
  xpPerHour: 35000,
  prerequisites: { skills: { magic: 19 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [], net: 'neutral' },
  inputs: [{ name: 'Nature rune', perHour: 800, source: 'runecrafting' }, { name: 'Fire rune', perHour: 800, source: 'runecrafting' }],
  bankingFrequency: 'moderate',
  costPerHour: 30000,
  danger: 'none',
  complexity: 'simple',
  attention: 'low',
  description: 'Cast curse on NPCs or low alch items. Bridges the gap between strikes and high alch.',
  location: 'Heartlands',
  breakpointAt: 19,
});

rel.defineTrainingMethod('magic_bolt_spells', {
  skill: 'magic', name: 'Bolt Spells on Slayer',
  levelRange: [29, 50],
  xpPerHour: 45000,
  prerequisites: { skills: { magic: 29, slayer: 15 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Slayer loot', perHour: 1 }], net: 'neutral' },
  inputs: [{ name: 'Chaos rune', perHour: 700, source: 'runecrafting' }, { name: 'Air rune', perHour: 700, source: 'runecrafting' }],
  bankingFrequency: 'frequent',
  costPerHour: 25000,
  danger: 'low',
  complexity: 'moderate',
  attention: 'medium',
  description: 'Cast bolt spells on slayer tasks. Trains magic and slayer together. Decent loot offsets rune cost.',
  location: 'Heartlands',
  breakpointAt: 29,
});

rel.defineTrainingMethod('magic_high_alch', {
  skill: 'magic', name: 'High Alchemy',
  levelRange: [55, 99],
  xpPerHour: 78000,
  prerequisites: { skills: { magic: 55 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Gold coins', perHour: 60000 }], net: 'profit' },
  inputs: [{ name: 'Nature rune', perHour: 1200, source: 'runecrafting' }, { name: 'Alchable item', perHour: 1200, source: 'ge' }],
  bankingFrequency: 'moderate',
  costPerHour: -20000,
  danger: 'none',
  complexity: 'trivial',
  attention: 'low',
  description: 'Alch items for gold. Profitable with the right items. Can be done anywhere.',
  location: 'Heartlands',
  breakpointAt: 55,
});

rel.defineTrainingMethod('magic_burst_spells', {
  skill: 'magic', name: 'Burst/Barrage Stacking',
  levelRange: [50, 99],
  xpPerHour: 250000,
  prerequisites: { skills: { magic: 50 }, quests: ['moryskah_requiem'], items: [], areas: [] },
  resourceOutput: { produces: [], net: 'neutral' },
  inputs: [{ name: 'Death rune', perHour: 3000, source: 'runecrafting' }, { name: 'Blood rune', perHour: 1500, source: 'runecrafting' }, { name: 'Water rune', perHour: 6000, source: 'runecrafting' }],
  bankingFrequency: 'frequent',
  costPerHour: 500000,
  danger: 'medium',
  complexity: 'complex',
  attention: 'high',
  description: 'AoE spells on stacked undead. Fastest magic XP. Burns through runes fast.',
  location: 'Moryskah',
  breakpointAt: 50,
});

rel.defineTrainingMethod('magic_enchanting_bolts', {
  skill: 'magic', name: 'Bolt Enchanting',
  levelRange: [7, 99],
  xpPerHour: 100000,
  prerequisites: { skills: { magic: 7 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Enchanted bolts', perHour: 2700 }], net: 'profit' },
  inputs: [{ name: 'Cosmic rune', perHour: 2700, source: 'runecrafting' }, { name: 'Bolt (varied)', perHour: 2700, source: 'smithing' }],
  bankingFrequency: 'frequent',
  costPerHour: -50000,
  danger: 'none',
  complexity: 'simple',
  attention: 'medium',
  description: 'Enchant bolts for profit. Decent XP and money. Scales with bolt type.',
  location: 'Heartlands',
  breakpointAt: 7,
});

rel.defineTrainingMethod('magic_wilds_god_spells', {
  skill: 'magic', name: 'God Spell PKing',
  levelRange: [60, 99],
  xpPerHour: 80000,
  prerequisites: { skills: { magic: 60 }, quests: ['mage_arena'], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'PK loot', perHour: 1 }], net: 'profit' },
  inputs: [{ name: 'Blood rune', perHour: 400, source: 'runecrafting' }, { name: 'Fire rune', perHour: 800, source: 'runecrafting' }, { name: 'Shark', perHour: 15, source: 'fishing_cooking' }],
  bankingFrequency: 'rare',
  costPerHour: -100000,
  danger: 'extreme',
  complexity: 'intense',
  attention: 'maximum',
  description: 'Cast god spells on other players. Requires Mage Arena. Profit depends on kills.',
  location: 'The Wilds',
  breakpointAt: 60,
});

// ==============================================================================
// RUNECRAFTING (8/23)
// ==============================================================================

rel.defineTrainingMethod('runecrafting_air_runes', {
  skill: 'runecrafting', name: 'Air Rune Running',
  levelRange: [1, 44],
  xpPerHour: 8000,
  prerequisites: { skills: {}, quests: ['rune_mysteries'], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Air rune', perHour: 1200 }], net: 'profit' },
  inputs: [{ name: 'Pure essence', perHour: 1200, source: 'mining' }],
  bankingFrequency: 'constant',
  costPerHour: -3000,
  danger: 'none',
  complexity: 'simple',
  attention: 'medium',
  description: 'Bank, fill pouches, run to altar, craft. The classic RC grind. Slow but free.',
  location: 'Heartlands',
  breakpointAt: 1,
});

rel.defineTrainingMethod('runecrafting_guardians_of_rift', {
  skill: 'runecrafting', name: 'Guardians of the Rift',
  levelRange: [1, 30],
  xpPerHour: 40000,
  prerequisites: { skills: {}, quests: ['rune_mysteries'], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Runes (varied)', perHour: 400 }], net: 'profit' },
  inputs: [],
  bankingFrequency: 'never',
  costPerHour: 0,
  danger: 'low',
  complexity: 'simple',
  attention: 'low',
  description: 'Minigame provides essence and altars. Low attention entry to runecrafting. Earns runes and outfit pieces.',
  location: 'Heartlands',
  breakpointAt: 1,
});

rel.defineTrainingMethod('runecrafting_lava_runes', {
  skill: 'runecrafting', name: 'Lava Rune Crafting',
  levelRange: [23, 99],
  xpPerHour: 60000,
  prerequisites: { skills: { runecrafting: 23, magic: 40 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [], net: 'neutral' },
  inputs: [{ name: 'Pure essence', perHour: 2400, source: 'mining' }, { name: 'Earth rune', perHour: 2400, source: 'runecrafting' }, { name: 'Binding necklace', perHour: 60, source: 'crafting' }],
  bankingFrequency: 'constant',
  costPerHour: 100000,
  danger: 'none',
  complexity: 'complex',
  attention: 'maximum',
  description: 'Fastest RC XP. Binding necklace + magic imbue + precise banking. Costs a fortune.',
  location: 'Heartlands',
  breakpointAt: 23,
});

rel.defineTrainingMethod('runecrafting_blood_runes', {
  skill: 'runecrafting', name: 'Blood Rune Crafting',
  levelRange: [77, 99],
  xpPerHour: 35000,
  prerequisites: { skills: { runecrafting: 77, mining: 38, crafting: 38 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Blood rune', perHour: 250 }], net: 'profit' },
  inputs: [],
  bankingFrequency: 'never',
  costPerHour: -200000,
  danger: 'none',
  complexity: 'simple',
  attention: 'afk',
  description: 'Mine dense essence, chisel, craft at blood altar. AFK and profitable. The endgame chill.',
  location: 'Inkweald',
  breakpointAt: 77,
});

rel.defineTrainingMethod('runecrafting_daeyalt_essence', {
  skill: 'runecrafting', name: 'Daeyalt Essence RC',
  levelRange: [1, 99],
  xpPerHour: 65000,
  prerequisites: { skills: { mining: 60 }, quests: ['sins_of_the_father'], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Runes', perHour: 600 }], net: 'profit' },
  inputs: [{ name: 'Daeyalt essence', perHour: 2000, source: 'mining' }],
  bankingFrequency: 'frequent',
  costPerHour: -50000,
  danger: 'none',
  complexity: 'moderate',
  attention: 'medium',
  description: 'Mine daeyalt first (AFK), then craft for 50% bonus XP. Split attention over two sessions.',
  location: 'Moryskah',
  breakpointAt: null,
});

rel.defineTrainingMethod('runecrafting_wilds_abyss', {
  skill: 'runecrafting', name: 'Abyss Runecrafting',
  levelRange: [1, 99],
  xpPerHour: 75000,
  prerequisites: { skills: {}, quests: ['enter_the_abyss'], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Runes', perHour: 800 }], net: 'profit' },
  inputs: [{ name: 'Pure essence', perHour: 2000, source: 'mining' }],
  bankingFrequency: 'constant',
  costPerHour: -80000,
  danger: 'high',
  complexity: 'moderate',
  attention: 'high',
  description: 'Run through Wilds to the Abyss portal. Skull risk every trip. Best general RC XP/profit.',
  location: 'The Wilds',
  breakpointAt: null,
});

// ==============================================================================
// CONSTRUCTION (9/23)
// ==============================================================================

rel.defineTrainingMethod('construction_crude_chairs', {
  skill: 'construction', name: 'Crude Wooden Chairs',
  levelRange: [1, 19],
  xpPerHour: 20000,
  prerequisites: { skills: {}, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [], net: 'neutral' },
  inputs: [{ name: 'Plank', perHour: 200, source: 'woodcutting' }, { name: 'Steel nails', perHour: 200, source: 'smithing' }],
  bankingFrequency: 'frequent',
  costPerHour: 5000,
  danger: 'none',
  complexity: 'simple',
  attention: 'medium',
  description: 'Build, remove, repeat. The introductory grind. Cheap planks.',
  location: 'Heartlands',
  breakpointAt: 1,
});

rel.defineTrainingMethod('construction_oak_larders', {
  skill: 'construction', name: 'Oak Larders',
  levelRange: [33, 74],
  xpPerHour: 300000,
  prerequisites: { skills: { construction: 33 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [], net: 'neutral' },
  inputs: [{ name: 'Oak plank', perHour: 1800, source: 'woodcutting' }],
  bankingFrequency: 'frequent',
  costPerHour: 200000,
  danger: 'none',
  complexity: 'moderate',
  attention: 'high',
  description: 'Butler brings planks, build larder, remove. Fast but expensive. Requires focus.',
  location: 'Heartlands',
  breakpointAt: 33,
});

rel.defineTrainingMethod('construction_mahogany_tables', {
  skill: 'construction', name: 'Mahogany Tables',
  levelRange: [52, 99],
  xpPerHour: 700000,
  prerequisites: { skills: { construction: 52 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [], net: 'neutral' },
  inputs: [{ name: 'Mahogany plank', perHour: 2400, source: 'woodcutting' }],
  bankingFrequency: 'frequent',
  costPerHour: 1200000,
  danger: 'none',
  complexity: 'moderate',
  attention: 'high',
  description: 'The fastest construction XP. Mahogany planks are brutal on the wallet.',
  location: 'Heartlands',
  breakpointAt: 52,
});

rel.defineTrainingMethod('construction_teak_benches', {
  skill: 'construction', name: 'Teak Garden Benches',
  levelRange: [66, 99],
  xpPerHour: 450000,
  prerequisites: { skills: { construction: 66 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [], net: 'neutral' },
  inputs: [{ name: 'Teak plank', perHour: 2000, source: 'woodcutting' }],
  bankingFrequency: 'frequent',
  costPerHour: 400000,
  danger: 'none',
  complexity: 'moderate',
  attention: 'medium',
  description: 'Cheaper than mahogany tables but slower. The budget high-level option.',
  location: 'Heartlands',
  breakpointAt: 66,
});

rel.defineTrainingMethod('construction_wilds_fortifications', {
  skill: 'construction', name: 'Wilderness Fortifications',
  levelRange: [30, 99],
  xpPerHour: 500000,
  prerequisites: { skills: { construction: 30 }, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [], net: 'neutral' },
  inputs: [{ name: 'Oak plank', perHour: 1500, source: 'woodcutting' }, { name: 'Steel nails', perHour: 500, source: 'smithing' }],
  bankingFrequency: 'moderate',
  costPerHour: 100000,
  danger: 'high',
  complexity: 'moderate',
  attention: 'high',
  description: 'Build fortifications at Wilds outposts. Cheaper materials but PKers patrol the area.',
  location: 'The Wilds',
  breakpointAt: 30,
});

rel.defineTrainingMethod('construction_sawmill_contracts', {
  skill: 'construction', name: 'Sawmill Contracts',
  levelRange: [20, 70],
  xpPerHour: 80000,
  prerequisites: { skills: { construction: 20 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Gold coins', perHour: 100000 }], net: 'profit' },
  inputs: [{ name: 'Plank (varied)', perHour: 400, source: 'woodcutting' }],
  bankingFrequency: 'moderate',
  costPerHour: -100000,
  danger: 'none',
  complexity: 'moderate',
  attention: 'low',
  description: 'Fill NPC construction orders for profit. Slower XP but actually makes money.',
  location: 'Sootworks',
  breakpointAt: 20,
});

// ==============================================================================
// AGILITY (10/23)
// ==============================================================================

rel.defineTrainingMethod('agility_gnome_course', {
  skill: 'agility', name: 'Gnome Stronghold Course',
  levelRange: [1, 20],
  xpPerHour: 8000,
  prerequisites: { skills: {}, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [], net: 'neutral' },
  inputs: [],
  bankingFrequency: 'never',
  costPerHour: 0,
  danger: 'none',
  complexity: 'simple',
  attention: 'medium',
  description: 'The starter agility course. Click through obstacles. Free and straightforward.',
  location: 'Veilwood',
  breakpointAt: 1,
});

rel.defineTrainingMethod('agility_canifis_course', {
  skill: 'agility', name: 'Canifis Rooftop Course',
  levelRange: [40, 60],
  xpPerHour: 20000,
  prerequisites: { skills: { agility: 40 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Mark of grace', perHour: 12 }], net: 'profit' },
  inputs: [],
  bankingFrequency: 'never',
  costPerHour: 0,
  danger: 'none',
  complexity: 'simple',
  attention: 'low',
  description: 'Short laps, decent marks of grace. Easy money via graceful set pieces.',
  location: 'Moryskah',
  breakpointAt: 40,
});

rel.defineTrainingMethod('agility_seers_course', {
  skill: 'agility', name: 'Seers Rooftop Course',
  levelRange: [60, 80],
  xpPerHour: 46000,
  prerequisites: { skills: { agility: 60 }, quests: ['inkweald_archives'], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Mark of grace', perHour: 15 }], net: 'profit' },
  inputs: [],
  bankingFrequency: 'never',
  costPerHour: 0,
  danger: 'none',
  complexity: 'moderate',
  attention: 'medium',
  description: 'Teleport to start shortcut makes this the best mid-level course. Requires diary.',
  location: 'Inkweald',
  breakpointAt: 60,
});

rel.defineTrainingMethod('agility_ardougne_course', {
  skill: 'agility', name: 'Ardougne Rooftop Course',
  levelRange: [90, 99],
  xpPerHour: 56000,
  prerequisites: { skills: { agility: 90 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Mark of grace', perHour: 20 }], net: 'profit' },
  inputs: [],
  bankingFrequency: 'never',
  costPerHour: 0,
  danger: 'none',
  complexity: 'moderate',
  attention: 'medium',
  description: 'Best standard agility XP. Consistent course with no fail points at 90+.',
  location: 'Heartlands',
  breakpointAt: 90,
});

rel.defineTrainingMethod('agility_hallowed_sepulchre', {
  skill: 'agility', name: 'Hallowed Sepulchre',
  levelRange: [52, 99],
  xpPerHour: 80000,
  prerequisites: { skills: { agility: 52 }, quests: ['sins_of_the_father'], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Hallowed mark', perHour: 10 }, { name: 'Ring of endurance', perHour: 0.01 }], net: 'profit' },
  inputs: [],
  bankingFrequency: 'moderate',
  costPerHour: 0,
  danger: 'medium',
  complexity: 'intense',
  attention: 'maximum',
  description: 'Dodge traps in a crypt. The fastest agility XP by far but demands perfection.',
  location: 'Moryskah',
  breakpointAt: 52,
});

rel.defineTrainingMethod('agility_wilds_course', {
  skill: 'agility', name: 'Wilderness Agility Course',
  levelRange: [52, 99],
  xpPerHour: 62000,
  prerequisites: { skills: { agility: 52 }, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [], net: 'neutral' },
  inputs: [],
  bankingFrequency: 'never',
  costPerHour: 0,
  danger: 'extreme',
  complexity: 'moderate',
  attention: 'high',
  description: 'Free, fast, dangerous. PKers patrol the course. Bring nothing you cannot lose. Higher XP than Ardougne justifies the risk.',
  location: 'The Wilds',
  breakpointAt: 52,
});

// ==============================================================================
// HERBLORE (11/23)
// ==============================================================================

rel.defineTrainingMethod('herblore_attack_potions', {
  skill: 'herblore', name: 'Attack Potions',
  levelRange: [3, 25],
  xpPerHour: 30000,
  prerequisites: { skills: { herblore: 3 }, quests: ['druidic_ritual'], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Attack potion', perHour: 350 }], net: 'loss' },
  inputs: [{ name: 'Guam leaf', perHour: 350, source: 'farming' }, { name: 'Eye of newt', perHour: 350, source: 'shop' }],
  bankingFrequency: 'frequent',
  costPerHour: 20000,
  danger: 'none',
  complexity: 'trivial',
  attention: 'low',
  description: 'Clean herbs, mix potions. Simple but costs money from buying secondaries.',
  location: 'Heartlands',
  breakpointAt: 3,
});

rel.defineTrainingMethod('herblore_prayer_potions', {
  skill: 'herblore', name: 'Prayer Potions',
  levelRange: [38, 72],
  xpPerHour: 80000,
  prerequisites: { skills: { herblore: 38 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Prayer potion', perHour: 700 }], net: 'profit' },
  inputs: [{ name: 'Ranarr weed', perHour: 700, source: 'farming' }, { name: 'Snape grass', perHour: 700, source: 'farming' }],
  bankingFrequency: 'frequent',
  costPerHour: -30000,
  danger: 'none',
  complexity: 'simple',
  attention: 'low',
  description: 'Ranarr + snape grass. One of the few profitable herblore methods. Always in demand.',
  location: 'Heartlands',
  breakpointAt: 38,
});

rel.defineTrainingMethod('herblore_super_combat', {
  skill: 'herblore', name: 'Super Combat Potions',
  levelRange: [90, 99],
  xpPerHour: 350000,
  prerequisites: { skills: { herblore: 90 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Super combat potion', perHour: 900 }], net: 'loss' },
  inputs: [{ name: 'Super attack', perHour: 900, source: 'herblore' }, { name: 'Super strength', perHour: 900, source: 'herblore' }, { name: 'Super defence', perHour: 900, source: 'herblore' }, { name: 'Torstol', perHour: 900, source: 'farming' }],
  bankingFrequency: 'frequent',
  costPerHour: 500000,
  danger: 'none',
  complexity: 'simple',
  attention: 'medium',
  description: 'Combine super attack, strength, defence. Massive XP, massive cost. Endgame money sink.',
  location: 'Heartlands',
  breakpointAt: 90,
});

rel.defineTrainingMethod('herblore_cleaning_herbs', {
  skill: 'herblore', name: 'Herb Cleaning',
  levelRange: [1, 99],
  xpPerHour: 60000,
  prerequisites: { skills: {}, quests: ['druidic_ritual'], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Clean herbs', perHour: 5000 }], net: 'profit' },
  inputs: [{ name: 'Grimy herb', perHour: 5000, source: 'farming' }],
  bankingFrequency: 'frequent',
  costPerHour: -100000,
  danger: 'none',
  complexity: 'trivial',
  attention: 'afk',
  description: 'Click and clean. Profitable, brain-dead, scales with herb type. The AFK path.',
  location: 'Heartlands',
  breakpointAt: null,
});

rel.defineTrainingMethod('herblore_wilds_potions', {
  skill: 'herblore', name: 'Wilderness Herb Gathering + Mixing',
  levelRange: [30, 99],
  xpPerHour: 70000,
  prerequisites: { skills: { herblore: 30, farming: 30 }, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Potions', perHour: 400 }], net: 'profit' },
  inputs: [{ name: 'Vial of water', perHour: 400, source: 'shop' }],
  bankingFrequency: 'moderate',
  costPerHour: -80000,
  danger: 'high',
  complexity: 'moderate',
  attention: 'high',
  description: 'Gather Wilds herbs and brew on-site. Free materials but PK risk. Self-sufficient path.',
  location: 'The Wilds',
  breakpointAt: 30,
});

// ==============================================================================
// THIEVING (12/23)
// ==============================================================================

rel.defineTrainingMethod('thieving_man_pickpocket', {
  skill: 'thieving', name: 'Man Pickpocketing',
  levelRange: [1, 20],
  xpPerHour: 10000,
  prerequisites: { skills: {}, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Gold coins', perHour: 3000 }], net: 'profit' },
  inputs: [],
  bankingFrequency: 'rare',
  costPerHour: -3000,
  danger: 'none',
  complexity: 'trivial',
  attention: 'low',
  description: 'Pickpocket men for coins. Pathetic profit, but it is a start.',
  location: 'Heartlands',
  breakpointAt: 1,
});

rel.defineTrainingMethod('thieving_fruit_stalls', {
  skill: 'thieving', name: 'Fruit Stall Theft',
  levelRange: [25, 50],
  xpPerHour: 35000,
  prerequisites: { skills: { thieving: 25 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Fruit', perHour: 1200 }], net: 'neutral' },
  inputs: [],
  bankingFrequency: 'moderate',
  costPerHour: 0,
  danger: 'none',
  complexity: 'trivial',
  attention: 'afk',
  description: 'Spam-click a stall. Completely braindead. Fruit is nearly worthless.',
  location: 'Heartlands',
  breakpointAt: 25,
});

rel.defineTrainingMethod('thieving_blackjacking', {
  skill: 'thieving', name: 'Blackjacking',
  levelRange: [45, 99],
  xpPerHour: 240000,
  prerequisites: { skills: { thieving: 45 }, quests: ['feud_quest'], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Gold coins', perHour: 150000 }], net: 'profit' },
  inputs: [],
  bankingFrequency: 'rare',
  costPerHour: -150000,
  danger: 'none',
  complexity: 'complex',
  attention: 'maximum',
  description: 'Knock out, pickpocket, repeat. Fastest thieving XP. Demands perfect timing.',
  location: 'Boneyard Wastes',
  breakpointAt: 45,
});

rel.defineTrainingMethod('thieving_ardy_knights', {
  skill: 'thieving', name: 'Ardougne Knight Pickpocket',
  levelRange: [55, 99],
  xpPerHour: 120000,
  prerequisites: { skills: { thieving: 55 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Gold coins', perHour: 60000 }], net: 'profit' },
  inputs: [],
  bankingFrequency: 'rare',
  costPerHour: -60000,
  danger: 'low',
  complexity: 'simple',
  attention: 'low',
  description: 'Trap a knight, click repeatedly. Semi-AFK with coin pouches. The relaxed money maker.',
  location: 'Heartlands',
  breakpointAt: 55,
});

rel.defineTrainingMethod('thieving_wilds_rogues_chest', {
  skill: 'thieving', name: 'Rogues Castle Chests',
  levelRange: [84, 99],
  xpPerHour: 100000,
  prerequisites: { skills: { thieving: 84 }, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Dragon dagger', perHour: 10 }, { name: 'Rare loot', perHour: 1 }], net: 'profit' },
  inputs: [],
  bankingFrequency: 'rare',
  costPerHour: -300000,
  danger: 'extreme',
  complexity: 'moderate',
  attention: 'high',
  description: 'Loot chests in deep Wilderness. Best thieving gp/hr but PKers camp the castle.',
  location: 'The Wilds',
  breakpointAt: 84,
});

// ==============================================================================
// CRAFTING (13/23)
// ==============================================================================

rel.defineTrainingMethod('crafting_leather', {
  skill: 'crafting', name: 'Leather Crafting',
  levelRange: [1, 30],
  xpPerHour: 25000,
  prerequisites: { skills: {}, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Leather items', perHour: 700 }], net: 'loss' },
  inputs: [{ name: 'Leather', perHour: 700, source: 'combat_drops' }],
  bankingFrequency: 'frequent',
  costPerHour: 15000,
  danger: 'none',
  complexity: 'trivial',
  attention: 'low',
  description: 'Cut leather into gloves, boots, bodies. Cheap and simple. The first taste.',
  location: 'Heartlands',
  breakpointAt: 1,
});

rel.defineTrainingMethod('crafting_gold_jewelry', {
  skill: 'crafting', name: 'Gold Jewelry',
  levelRange: [5, 60],
  xpPerHour: 55000,
  prerequisites: { skills: { crafting: 5 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Gold jewelry', perHour: 1400 }], net: 'loss' },
  inputs: [{ name: 'Gold bar', perHour: 1400, source: 'smithing' }, { name: 'Gem (varied)', perHour: 700, source: 'mining' }],
  bankingFrequency: 'frequent',
  costPerHour: 80000,
  danger: 'none',
  complexity: 'simple',
  attention: 'low',
  description: 'Smelt gold bars into jewelry at a furnace. Costly but fast for the level.',
  location: 'Sootworks',
  breakpointAt: 5,
});

rel.defineTrainingMethod('crafting_dhide_bodies', {
  skill: 'crafting', name: "Dragonhide Bodies",
  levelRange: [63, 99],
  xpPerHour: 150000,
  prerequisites: { skills: { crafting: 63 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Dragonhide body', perHour: 900 }], net: 'loss' },
  inputs: [{ name: 'Green dragonhide', perHour: 2700, source: 'combat_drops' }],
  bankingFrequency: 'frequent',
  costPerHour: 300000,
  danger: 'none',
  complexity: 'simple',
  attention: 'medium',
  description: 'Cut dragonhides into bodies. Fast XP, moderate cost. The standard path.',
  location: 'Heartlands',
  breakpointAt: 63,
});

rel.defineTrainingMethod('crafting_glassblowing', {
  skill: 'crafting', name: 'Glassblowing',
  levelRange: [1, 99],
  xpPerHour: 45000,
  prerequisites: { skills: {}, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Glass items', perHour: 800 }], net: 'neutral' },
  inputs: [{ name: 'Molten glass', perHour: 800, source: 'crafting' }],
  bankingFrequency: 'frequent',
  costPerHour: 0,
  danger: 'none',
  complexity: 'trivial',
  attention: 'afk',
  description: 'Blow glass from sand and seaweed. Free if you gather materials. True AFK crafting.',
  location: 'Glass Desert',
  breakpointAt: null,
});

rel.defineTrainingMethod('crafting_wilds_dragonhide_tanning', {
  skill: 'crafting', name: 'Wilderness Tannery',
  levelRange: [40, 99],
  xpPerHour: 100000,
  prerequisites: { skills: { crafting: 40 }, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Tanned dragonhide', perHour: 1200 }], net: 'profit' },
  inputs: [{ name: 'Green dragonhide', perHour: 1200, source: 'combat_drops' }],
  bankingFrequency: 'frequent',
  costPerHour: -120000,
  danger: 'high',
  complexity: 'moderate',
  attention: 'high',
  description: 'Wilds tanner charges nothing. Tan hides for profit, but watch your back.',
  location: 'The Wilds',
  breakpointAt: 40,
});

// ==============================================================================
// FLETCHING (14/23)
// ==============================================================================

rel.defineTrainingMethod('fletching_arrow_shafts', {
  skill: 'fletching', name: 'Arrow Shaft Cutting',
  levelRange: [1, 20],
  xpPerHour: 15000,
  prerequisites: { skills: {}, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Arrow shaft', perHour: 6000 }], net: 'profit' },
  inputs: [{ name: 'Logs', perHour: 400, source: 'woodcutting' }],
  bankingFrequency: 'frequent',
  costPerHour: -5000,
  danger: 'none',
  complexity: 'trivial',
  attention: 'afk',
  description: 'Cut logs into arrow shafts. AFK, profitable, brain-dead. Great while watching TV.',
  location: 'Heartlands',
  breakpointAt: 1,
});

rel.defineTrainingMethod('fletching_yew_longbows', {
  skill: 'fletching', name: 'Yew Longbow Stringing',
  levelRange: [70, 99],
  xpPerHour: 120000,
  prerequisites: { skills: { fletching: 70 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Yew longbow (u)', perHour: 1400 }], net: 'loss' },
  inputs: [{ name: 'Yew logs', perHour: 1400, source: 'woodcutting' }, { name: 'Bowstring', perHour: 1400, source: 'crafting' }],
  bankingFrequency: 'frequent',
  costPerHour: 40000,
  danger: 'none',
  complexity: 'simple',
  attention: 'low',
  description: 'String yew longbows. Fast, low attention. Slight loss per bow.',
  location: 'Heartlands',
  breakpointAt: 70,
});

rel.defineTrainingMethod('fletching_broad_bolts', {
  skill: 'fletching', name: 'Broad Bolt Fletching',
  levelRange: [55, 99],
  xpPerHour: 500000,
  prerequisites: { skills: { fletching: 55, slayer: 55 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Broad bolt', perHour: 10000 }], net: 'profit' },
  inputs: [{ name: 'Broad bolt tip', perHour: 10000, source: 'shop' }, { name: 'Unfinished bolt', perHour: 10000, source: 'smithing' }],
  bankingFrequency: 'frequent',
  costPerHour: -30000,
  danger: 'none',
  complexity: 'trivial',
  attention: 'low',
  description: 'Attach broad tips to bolts. Insanely fast XP AND profit. Requires slayer unlock.',
  location: 'Heartlands',
  breakpointAt: 55,
});

rel.defineTrainingMethod('fletching_dragon_darts', {
  skill: 'fletching', name: 'Dragon Dart Tips',
  levelRange: [95, 99],
  xpPerHour: 1000000,
  prerequisites: { skills: { fletching: 95 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Dragon dart', perHour: 15000 }], net: 'loss' },
  inputs: [{ name: 'Dragon dart tip', perHour: 15000, source: 'combat_drops' }, { name: 'Feather', perHour: 15000, source: 'combat_drops' }],
  bankingFrequency: 'frequent',
  costPerHour: 2000000,
  danger: 'none',
  complexity: 'trivial',
  attention: 'medium',
  description: 'Fastest fletching XP in the game. Dragon dart tips cost a fortune.',
  location: 'Heartlands',
  breakpointAt: 95,
});

rel.defineTrainingMethod('fletching_wilds_javelin_shafts', {
  skill: 'fletching', name: 'Wilderness Javelin Crafting',
  levelRange: [35, 99],
  xpPerHour: 200000,
  prerequisites: { skills: { fletching: 35 }, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Javelin', perHour: 3000 }], net: 'profit' },
  inputs: [{ name: 'Javelin shaft', perHour: 3000, source: 'woodcutting' }],
  bankingFrequency: 'moderate',
  costPerHour: -50000,
  danger: 'high',
  complexity: 'moderate',
  attention: 'high',
  description: 'Wilds-only javelin wood. Good XP and profit but you are a sitting target.',
  location: 'The Wilds',
  breakpointAt: 35,
});

// ==============================================================================
// SLAYER (15/23)
// ==============================================================================

rel.defineTrainingMethod('slayer_turael_tasks', {
  skill: 'slayer', name: 'Turael Tasks (Easy)',
  levelRange: [1, 30],
  xpPerHour: 5000,
  prerequisites: { skills: {}, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Slayer points', perHour: 5 }], net: 'neutral' },
  inputs: [{ name: 'Trout', perHour: 5, source: 'fishing_cooking' }],
  bankingFrequency: 'moderate',
  costPerHour: 0,
  danger: 'none',
  complexity: 'trivial',
  attention: 'low',
  description: 'Baby tasks from the easiest master. Low XP but introduces the system.',
  location: 'Heartlands',
  breakpointAt: 1,
});

rel.defineTrainingMethod('slayer_konar_tasks', {
  skill: 'slayer', name: 'Konar Tasks (Varied)',
  levelRange: [20, 80],
  xpPerHour: 20000,
  prerequisites: { skills: { slayer: 20 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Brimstone key', perHour: 3 }, { name: 'Slayer loot', perHour: 1 }], net: 'profit' },
  inputs: [{ name: 'Lobster', perHour: 12, source: 'fishing_cooking' }],
  bankingFrequency: 'frequent',
  costPerHour: -30000,
  danger: 'medium',
  complexity: 'moderate',
  attention: 'medium',
  description: 'Location-locked tasks. Forces you to explore. Brimstone keys add profit.',
  location: 'Heartlands',
  breakpointAt: 20,
});

rel.defineTrainingMethod('slayer_nieve_tasks', {
  skill: 'slayer', name: 'Nieve/Duradel Tasks (Efficient)',
  levelRange: [50, 99],
  xpPerHour: 35000,
  prerequisites: { skills: { slayer: 50 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Slayer loot', perHour: 1 }], net: 'profit' },
  inputs: [{ name: 'Shark', perHour: 15, source: 'fishing_cooking' }, { name: 'Prayer potion', perHour: 3, source: 'herblore' }],
  bankingFrequency: 'frequent',
  costPerHour: -50000,
  danger: 'medium',
  complexity: 'moderate',
  attention: 'medium',
  description: 'Best XP masters. Skip bad tasks, extend good ones. The efficient grinder path.',
  location: 'Veilwood',
  breakpointAt: 50,
});

rel.defineTrainingMethod('slayer_boss_tasks', {
  skill: 'slayer', name: 'Boss Slayer Tasks',
  levelRange: [75, 99],
  xpPerHour: 25000,
  prerequisites: { skills: { slayer: 75 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Boss uniques', perHour: 1 }], net: 'profit' },
  inputs: [{ name: 'Shark', perHour: 40, source: 'fishing_cooking' }, { name: 'Super restore', perHour: 5, source: 'herblore' }],
  bankingFrequency: 'rare',
  costPerHour: -200000,
  danger: 'high',
  complexity: 'complex',
  attention: 'high',
  description: 'Kill bosses as slayer assignments. Lower slayer XP/hr but massive drops.',
  location: 'Heartlands',
  breakpointAt: 75,
});

rel.defineTrainingMethod('slayer_wilds_tasks', {
  skill: 'slayer', name: 'Wilderness Slayer',
  levelRange: [1, 99],
  xpPerHour: 30000,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Larran key', perHour: 2 }, { name: 'Mysterious emblem', perHour: 1 }], net: 'profit' },
  inputs: [{ name: 'Lobster', perHour: 20, source: 'fishing_cooking' }],
  bankingFrequency: 'rare',
  costPerHour: -100000,
  danger: 'extreme',
  complexity: 'moderate',
  attention: 'high',
  description: 'Slayer tasks in the Wilds with bonus drop table. PKers are the real boss.',
  location: 'The Wilds',
  breakpointAt: null,
});

// ==============================================================================
// HUNTER (16/23)
// ==============================================================================

rel.defineTrainingMethod('hunter_birdhouse_runs', {
  skill: 'hunter', name: 'Birdhouse Runs',
  levelRange: [5, 99],
  xpPerHour: 100000,
  prerequisites: { skills: { hunter: 5, crafting: 5 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Bird nest', perHour: 10 }], net: 'profit' },
  inputs: [{ name: 'Logs', perHour: 40, source: 'woodcutting' }, { name: 'Hop seeds', perHour: 40, source: 'farming' }],
  bankingFrequency: 'moderate',
  costPerHour: -20000,
  danger: 'none',
  complexity: 'simple',
  attention: 'afk',
  description: 'Set birdhouses, come back in 50 min. Best hunter XP per time spent. Passive income. Requires crafting and hunter levels.',
  location: 'Veilwood',
  breakpointAt: 5,
});

rel.defineTrainingMethod('hunter_red_chins', {
  skill: 'hunter', name: 'Red Chinchompa Trapping',
  levelRange: [63, 80],
  xpPerHour: 120000,
  prerequisites: { skills: { hunter: 63 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Red chinchompa', perHour: 200 }], net: 'profit' },
  inputs: [],
  bankingFrequency: 'moderate',
  costPerHour: -300000,
  danger: 'none',
  complexity: 'moderate',
  attention: 'medium',
  description: 'Set box traps for red chins. Good XP and great profit from ranged trainers buying them.',
  location: 'Veilwood',
  breakpointAt: 63,
});

rel.defineTrainingMethod('hunter_herbiboar', {
  skill: 'hunter', name: 'Herbiboar Tracking',
  levelRange: [80, 99],
  xpPerHour: 150000,
  prerequisites: { skills: { hunter: 80, herblore: 31 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Herbs (varied)', perHour: 200 }], net: 'profit' },
  inputs: [],
  bankingFrequency: 'moderate',
  costPerHour: -80000,
  danger: 'none',
  complexity: 'moderate',
  attention: 'medium',
  description: 'Track herbiboar through the forest. Best safe hunter XP. Herbs as bonus.',
  location: 'Veilwood',
  breakpointAt: 80,
});

rel.defineTrainingMethod('hunter_butterfly_netting', {
  skill: 'hunter', name: 'Butterfly Netting',
  levelRange: [1, 50],
  xpPerHour: 30000,
  prerequisites: { skills: {}, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Implings', perHour: 50 }], net: 'neutral' },
  inputs: [],
  bankingFrequency: 'never',
  costPerHour: 0,
  danger: 'none',
  complexity: 'trivial',
  attention: 'low',
  description: 'Chase butterflies through meadows. Free, no requirements, no setup. Not fast but zero-cost entry to hunter.',
  location: 'Heartlands',
  breakpointAt: 1,
});

rel.defineTrainingMethod('hunter_wilds_black_chins', {
  skill: 'hunter', name: 'Black Chinchompa Trapping',
  levelRange: [73, 99],
  xpPerHour: 180000,
  prerequisites: { skills: { hunter: 73 }, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Black chinchompa', perHour: 300 }], net: 'profit' },
  inputs: [],
  bankingFrequency: 'rare',
  costPerHour: -500000,
  danger: 'extreme',
  complexity: 'complex',
  attention: 'maximum',
  description: 'Best hunter XP and profit. Wilds-only. PKers will find you. Bring escape tools.',
  location: 'The Wilds',
  breakpointAt: 73,
});

// ==============================================================================
// MINING (17/23)
// ==============================================================================

rel.defineTrainingMethod('mining_copper_tin', {
  skill: 'mining', name: 'Copper/Tin Mining',
  levelRange: [1, 15],
  xpPerHour: 8000,
  prerequisites: { skills: {}, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Copper ore', perHour: 100 }, { name: 'Tin ore', perHour: 100 }], net: 'profit' },
  inputs: [],
  bankingFrequency: 'moderate',
  costPerHour: -2000,
  danger: 'none',
  complexity: 'trivial',
  attention: 'afk',
  description: 'Starter ores next to a bank. Sell or smelt into bronze. The first pick swing.',
  location: 'Heartlands',
  breakpointAt: 1,
});

rel.defineTrainingMethod('mining_iron_powermining', {
  skill: 'mining', name: 'Iron Powermining',
  levelRange: [15, 99],
  xpPerHour: 55000,
  prerequisites: { skills: { mining: 15 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [], net: 'neutral' },
  inputs: [],
  bankingFrequency: 'never',
  costPerHour: 0,
  danger: 'none',
  complexity: 'simple',
  attention: 'high',
  description: 'Drop ore as you mine. Fast XP, zero resources. The pure XP method.',
  location: 'Heartlands',
  breakpointAt: 15,
});

rel.defineTrainingMethod('mining_motherlode', {
  skill: 'mining', name: 'Motherlode Mine',
  levelRange: [30, 99],
  xpPerHour: 32000,
  prerequisites: { skills: { mining: 30 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Ore (varied)', perHour: 80 }, { name: 'Golden nugget', perHour: 5 }], net: 'profit' },
  inputs: [],
  bankingFrequency: 'moderate',
  costPerHour: -25000,
  danger: 'none',
  complexity: 'simple',
  attention: 'afk',
  description: 'AFK mine paydirt, wash it. Random ore output. Nuggets buy prospector outfit.',
  location: 'Sootworks',
  breakpointAt: 30,
});

rel.defineTrainingMethod('mining_granite_3tick', {
  skill: 'mining', name: 'Granite 3-Tick Mining',
  levelRange: [45, 99],
  xpPerHour: 100000,
  prerequisites: { skills: { mining: 45 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [], net: 'neutral' },
  inputs: [],
  bankingFrequency: 'never',
  costPerHour: 0,
  danger: 'low',
  complexity: 'intense',
  attention: 'maximum',
  description: 'Tick-manipulate granite in the desert. Fastest mining XP. Demands perfect rhythm.',
  location: 'Glass Desert',
  breakpointAt: 45,
});

rel.defineTrainingMethod('mining_volcanic_mine', {
  skill: 'mining', name: 'Volcanic Mine',
  levelRange: [50, 99],
  xpPerHour: 75000,
  prerequisites: { skills: { mining: 50 }, quests: ['bone_voyage'], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Volcanic ash', perHour: 200 }], net: 'profit' },
  inputs: [],
  bankingFrequency: 'moderate',
  costPerHour: -15000,
  danger: 'medium',
  complexity: 'complex',
  attention: 'medium',
  description: 'Team mining in an active volcano. Good XP, unique rewards. Requires coordination.',
  location: 'Boneyard Wastes',
  breakpointAt: 50,
});

rel.defineTrainingMethod('mining_wilds_runite', {
  skill: 'mining', name: 'Wilderness Runite Mining',
  levelRange: [85, 99],
  xpPerHour: 15000,
  prerequisites: { skills: { mining: 85 }, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Runite ore', perHour: 8 }], net: 'profit' },
  inputs: [],
  bankingFrequency: 'rare',
  costPerHour: -200000,
  danger: 'extreme',
  complexity: 'simple',
  attention: 'high',
  description: 'Runite spawns in deep Wilds. Extremely profitable per ore but slow and dangerous.',
  location: 'The Wilds',
  breakpointAt: 85,
});

// ==============================================================================
// SMITHING (18/23)
// ==============================================================================

rel.defineTrainingMethod('smithing_bronze_bars', {
  skill: 'smithing', name: 'Bronze Bar Smelting',
  levelRange: [1, 15],
  xpPerHour: 12000,
  prerequisites: { skills: {}, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Bronze bar', perHour: 400 }], net: 'loss' },
  inputs: [{ name: 'Copper ore', perHour: 400, source: 'mining' }, { name: 'Tin ore', perHour: 400, source: 'mining' }],
  bankingFrequency: 'frequent',
  costPerHour: 5000,
  danger: 'none',
  complexity: 'trivial',
  attention: 'low',
  description: 'Smelt copper and tin at a furnace. Simple introduction to smithing.',
  location: 'Heartlands',
  breakpointAt: 1,
});

rel.defineTrainingMethod('smithing_gold_blast_furnace', {
  skill: 'smithing', name: 'Gold Bars at Blast Furnace',
  levelRange: [40, 99],
  xpPerHour: 300000,
  prerequisites: { skills: { smithing: 40 }, quests: [], items: [{ id: 16200, name: 'Goldsmith gauntlets', consumed: false }], areas: [] },
  resourceOutput: { produces: [{ name: 'Gold bar', perHour: 5000 }], net: 'loss' },
  inputs: [{ name: 'Gold ore', perHour: 5000, source: 'mining' }],
  bankingFrequency: 'constant',
  costPerHour: 400000,
  danger: 'none',
  complexity: 'moderate',
  attention: 'high',
  description: 'Goldsmith gauntlets triple XP. Fastest smithing method. Bank-furnace sprinting.',
  location: 'Sootworks',
  breakpointAt: 40,
});

rel.defineTrainingMethod('smithing_platebodies', {
  skill: 'smithing', name: 'Platebody Smithing',
  levelRange: [33, 99],
  xpPerHour: 130000,
  prerequisites: { skills: { smithing: 33 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Platebody', perHour: 250 }], net: 'loss' },
  inputs: [{ name: 'Steel bar', perHour: 750, source: 'mining' }],
  bankingFrequency: 'frequent',
  costPerHour: 200000,
  danger: 'none',
  complexity: 'simple',
  attention: 'medium',
  description: 'Hammer bars into platebodies at an anvil. Straightforward, moderate cost.',
  location: 'Heartlands',
  breakpointAt: 33,
});

rel.defineTrainingMethod('smithing_cannonballs', {
  skill: 'smithing', name: 'Cannonball Smithing',
  levelRange: [35, 99],
  xpPerHour: 14000,
  prerequisites: { skills: { smithing: 35 }, quests: ['dwarf_cannon_quest'], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Cannonball', perHour: 2400 }], net: 'profit' },
  inputs: [{ name: 'Steel bar', perHour: 600, source: 'mining' }],
  bankingFrequency: 'frequent',
  costPerHour: -100000,
  danger: 'none',
  complexity: 'trivial',
  attention: 'afk',
  description: 'Smelt steel bars into cannonballs. Extremely AFK, always profitable. Slowest XP.',
  location: 'Heartlands',
  breakpointAt: 35,
});

rel.defineTrainingMethod('smithing_wilds_anvil', {
  skill: 'smithing', name: 'Wilderness Anvil Smithing',
  levelRange: [50, 99],
  xpPerHour: 180000,
  prerequisites: { skills: { smithing: 50 }, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Smithed item', perHour: 300 }], net: 'loss' },
  inputs: [{ name: 'Steel bar', perHour: 900, source: 'mining' }],
  bankingFrequency: 'moderate',
  costPerHour: 100000,
  danger: 'high',
  complexity: 'moderate',
  attention: 'high',
  description: 'Wilds anvil gives 20% XP bonus. Bring bars, smith fast, escape faster.',
  location: 'The Wilds',
  breakpointAt: 50,
});

// ==============================================================================
// FISHING (19/23)
// ==============================================================================

rel.defineTrainingMethod('fishing_shrimp', {
  skill: 'fishing', name: 'Shrimp Netting',
  levelRange: [1, 20],
  xpPerHour: 8000,
  prerequisites: { skills: {}, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Raw shrimp', perHour: 200 }], net: 'profit' },
  inputs: [],
  bankingFrequency: 'moderate',
  costPerHour: -2000,
  danger: 'none',
  complexity: 'trivial',
  attention: 'afk',
  description: 'Net shrimp on the coast. The classic start. Nearly free and fully AFK.',
  location: 'Heartlands',
  breakpointAt: 1,
});

rel.defineTrainingMethod('fishing_barbarian_fishing', {
  skill: 'fishing', name: 'Barbarian Fishing',
  levelRange: [48, 99],
  xpPerHour: 65000,
  prerequisites: { skills: { fishing: 48, strength: 15, agility: 15 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [], net: 'neutral' },
  inputs: [{ name: 'Feather', perHour: 600, source: 'combat_drops' }],
  bankingFrequency: 'never',
  costPerHour: 0,
  danger: 'none',
  complexity: 'moderate',
  attention: 'medium',
  description: 'Drop fish, gain fishing + agility + strength XP. The efficient 3-skill method.',
  location: 'Heartlands',
  breakpointAt: 48,
});

rel.defineTrainingMethod('fishing_monkfish_chill', {
  skill: 'fishing', name: 'Monkfish Fishing',
  levelRange: [62, 99],
  xpPerHour: 35000,
  prerequisites: { skills: { fishing: 62 }, quests: ['swan_song'], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Raw monkfish', perHour: 250 }], net: 'profit' },
  inputs: [],
  bankingFrequency: 'moderate',
  costPerHour: -60000,
  danger: 'none',
  complexity: 'simple',
  attention: 'low',
  description: 'Relaxed fishing with decent profit. Bank is close. The chill money maker.',
  location: 'Saltbrine Reach',
  breakpointAt: 62,
});

rel.defineTrainingMethod('fishing_tempoross', {
  skill: 'fishing', name: 'Tempoross (Fishing Boss)',
  levelRange: [35, 99],
  xpPerHour: 50000,
  prerequisites: { skills: { fishing: 35 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Reward permits', perHour: 8 }, { name: 'Raw fish (varied)', perHour: 400 }], net: 'profit' },
  inputs: [],
  bankingFrequency: 'never',
  costPerHour: 0,
  danger: 'medium',
  complexity: 'moderate',
  attention: 'medium',
  description: 'Skilling boss. Cook, fish, douse fires, dodge waves. Unique rewards plus raw fish output.',
  location: 'Saltbrine Reach',
  breakpointAt: 35,
});

rel.defineTrainingMethod('fishing_wilds_dark_crabs', {
  skill: 'fishing', name: 'Dark Crab Fishing (Wilds)',
  levelRange: [85, 99],
  xpPerHour: 40000,
  prerequisites: { skills: { fishing: 85 }, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Raw dark crab', perHour: 200 }], net: 'profit' },
  inputs: [],
  bankingFrequency: 'rare',
  costPerHour: -150000,
  danger: 'extreme',
  complexity: 'simple',
  attention: 'high',
  description: 'Best food fish, Wilds-only spot. Extremely profitable. PKer magnet.',
  location: 'The Wilds',
  breakpointAt: 85,
});

// ==============================================================================
// COOKING (20/23)
// ==============================================================================

rel.defineTrainingMethod('cooking_shrimp_basic', {
  skill: 'cooking', name: 'Shrimp Cooking',
  levelRange: [1, 20],
  xpPerHour: 30000,
  prerequisites: { skills: {}, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Cooked shrimp', perHour: 800 }], net: 'loss' },
  inputs: [{ name: 'Raw shrimp', perHour: 1000, source: 'fishing' }],
  bankingFrequency: 'frequent',
  costPerHour: 5000,
  danger: 'none',
  complexity: 'trivial',
  attention: 'low',
  description: 'Cook shrimp on a range. Burns often at low levels. Cheap to practice.',
  location: 'Heartlands',
  breakpointAt: 1,
});

rel.defineTrainingMethod('cooking_wines', {
  skill: 'cooking', name: 'Wine Making',
  levelRange: [35, 99],
  xpPerHour: 400000,
  prerequisites: { skills: { cooking: 35 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Jug of wine', perHour: 3000 }], net: 'loss' },
  inputs: [{ name: 'Jug of water', perHour: 3000, source: 'shop' }, { name: 'Grapes', perHour: 3000, source: 'farming' }],
  bankingFrequency: 'frequent',
  costPerHour: 100000,
  danger: 'none',
  complexity: 'simple',
  attention: 'medium',
  description: 'Fastest cooking XP. Add grapes to jugs, ferment. High failure rate below 68.',
  location: 'Heartlands',
  breakpointAt: 35,
});

rel.defineTrainingMethod('cooking_sharks', {
  skill: 'cooking', name: 'Shark Cooking',
  levelRange: [80, 99],
  xpPerHour: 220000,
  prerequisites: { skills: { cooking: 80 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Shark', perHour: 1200 }], net: 'profit' },
  inputs: [{ name: 'Raw shark', perHour: 1300, source: 'fishing' }],
  bankingFrequency: 'frequent',
  costPerHour: -60000,
  danger: 'none',
  complexity: 'simple',
  attention: 'low',
  description: 'Buy raw, cook, sell. Profitable and fast. The premier endgame money method.',
  location: 'Heartlands',
  breakpointAt: 80,
});

rel.defineTrainingMethod('cooking_karambwan_1tick', {
  skill: 'cooking', name: 'Karambwan 1-Tick Cooking',
  levelRange: [30, 99],
  xpPerHour: 500000,
  prerequisites: { skills: { cooking: 30 }, quests: ['tai_bwo_wannai_trio'], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Cooked karambwan', perHour: 3500 }], net: 'loss' },
  inputs: [{ name: 'Raw karambwan', perHour: 3500, source: 'fishing' }],
  bankingFrequency: 'frequent',
  costPerHour: 200000,
  danger: 'none',
  complexity: 'moderate',
  attention: 'maximum',
  description: 'Spam-click karambwan for 1-tick cooking. Fastest possible XP. Wrist-breaking.',
  location: 'Heartlands',
  breakpointAt: 30,
});

rel.defineTrainingMethod('cooking_wilds_campfire', {
  skill: 'cooking', name: 'Wilderness Campfire Cooking',
  levelRange: [1, 99],
  xpPerHour: 250000,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Cooked food', perHour: 1500 }], net: 'neutral' },
  inputs: [{ name: 'Raw fish (varied)', perHour: 1500, source: 'fishing' }],
  bankingFrequency: 'never',
  costPerHour: 0,
  danger: 'high',
  complexity: 'simple',
  attention: 'high',
  description: 'Wilds campfires give 20% bonus XP. Bring your own fish. Keep an eye out.',
  location: 'The Wilds',
  breakpointAt: null,
});

// ==============================================================================
// FIREMAKING (21/23)
// ==============================================================================

rel.defineTrainingMethod('firemaking_normal_logs', {
  skill: 'firemaking', name: 'Normal Log Burning',
  levelRange: [1, 15],
  xpPerHour: 20000,
  prerequisites: { skills: {}, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [], net: 'neutral' },
  inputs: [{ name: 'Logs', perHour: 500, source: 'woodcutting' }],
  bankingFrequency: 'frequent',
  costPerHour: 2000,
  danger: 'none',
  complexity: 'trivial',
  attention: 'low',
  description: 'Light logs in a line. Walk, click, repeat. The simplest grind in the game.',
  location: 'Heartlands',
  breakpointAt: 1,
});

rel.defineTrainingMethod('firemaking_maple_logs', {
  skill: 'firemaking', name: 'Maple Log Burning',
  levelRange: [45, 60],
  xpPerHour: 130000,
  prerequisites: { skills: { firemaking: 45 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [], net: 'neutral' },
  inputs: [{ name: 'Maple logs', perHour: 900, source: 'woodcutting' }],
  bankingFrequency: 'frequent',
  costPerHour: 10000,
  danger: 'none',
  complexity: 'trivial',
  attention: 'low',
  description: 'Cheap logs, decent XP. The budget mid-range option.',
  location: 'Heartlands',
  breakpointAt: 45,
});

rel.defineTrainingMethod('firemaking_wintertodt', {
  skill: 'firemaking', name: 'Wintertodt (Skilling Boss)',
  levelRange: [50, 99],
  xpPerHour: 250000,
  prerequisites: { skills: { firemaking: 50 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Supply crate', perHour: 5 }], net: 'profit' },
  inputs: [{ name: 'Cake', perHour: 8, source: 'fishing_cooking' }],
  bankingFrequency: 'never',
  costPerHour: -30000,
  danger: 'medium',
  complexity: 'moderate',
  attention: 'medium',
  description: 'Group boss. Chop, fletch, feed braziers, heal. Unique rewards and fun.',
  location: 'Inkweald',
  breakpointAt: 50,
});

rel.defineTrainingMethod('firemaking_redwood_pyre', {
  skill: 'firemaking', name: 'Redwood Pyre Burning',
  levelRange: [90, 99],
  xpPerHour: 400000,
  prerequisites: { skills: { firemaking: 90 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [], net: 'neutral' },
  inputs: [{ name: 'Redwood logs', perHour: 1200, source: 'woodcutting' }],
  bankingFrequency: 'frequent',
  costPerHour: 200000,
  danger: 'none',
  complexity: 'simple',
  attention: 'low',
  description: 'Most expensive logs but highest FM XP. Line-burning for the wealthy.',
  location: 'Heartlands',
  breakpointAt: 90,
});

rel.defineTrainingMethod('firemaking_wilds_bonfires', {
  skill: 'firemaking', name: 'Wilderness Bonfires',
  levelRange: [30, 99],
  xpPerHour: 310000,
  prerequisites: { skills: { firemaking: 30 }, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [], net: 'neutral' },
  inputs: [{ name: 'Maple logs', perHour: 1000, source: 'woodcutting' }],
  bankingFrequency: 'never',
  costPerHour: 15000,
  danger: 'extreme',
  complexity: 'trivial',
  attention: 'high',
  description: 'Communal bonfires give 40% bonus XP. Bring your own logs. Free-ish but deadly. Beats Wintertodt XP if you survive.',
  location: 'The Wilds',
  breakpointAt: 30,
});

rel.defineTrainingMethod('firemaking_shade_burning', {
  skill: 'firemaking', name: 'Shade Cremation',
  levelRange: [1, 99],
  xpPerHour: 80000,
  prerequisites: { skills: {}, quests: ['shades_of_mortton'], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Shade key', perHour: 30 }], net: 'profit' },
  inputs: [{ name: 'Shade remains', perHour: 200, source: 'combat_drops' }, { name: 'Pyre logs', perHour: 200, source: 'woodcutting' }],
  bankingFrequency: 'frequent',
  costPerHour: -40000,
  danger: 'low',
  complexity: 'moderate',
  attention: 'medium',
  description: 'Burn shade remains on pyres. Keys unlock chests with unique rewards. Profitable.',
  location: 'Moryskah',
  breakpointAt: null,
});

// ==============================================================================
// WOODCUTTING (22/23)
// ==============================================================================

rel.defineTrainingMethod('woodcutting_normal_trees', {
  skill: 'woodcutting', name: 'Normal Tree Chopping',
  levelRange: [1, 15],
  xpPerHour: 7000,
  prerequisites: { skills: {}, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Logs', perHour: 100 }], net: 'profit' },
  inputs: [],
  bankingFrequency: 'moderate',
  costPerHour: -1000,
  danger: 'none',
  complexity: 'trivial',
  attention: 'afk',
  description: 'Chop trees near a bank. Logs sell for fletching. The gentlest start.',
  location: 'Heartlands',
  breakpointAt: 1,
});

rel.defineTrainingMethod('woodcutting_willows', {
  skill: 'woodcutting', name: 'Willow Chopping',
  levelRange: [30, 60],
  xpPerHour: 35000,
  prerequisites: { skills: { woodcutting: 30 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Willow logs', perHour: 300 }], net: 'neutral' },
  inputs: [],
  bankingFrequency: 'never',
  costPerHour: 0,
  danger: 'none',
  complexity: 'trivial',
  attention: 'afk',
  description: 'Powerdrop willows. AFK XP staple. Logs are nearly worthless.',
  location: 'Heartlands',
  breakpointAt: 30,
});

rel.defineTrainingMethod('woodcutting_teak_1_5tick', {
  skill: 'woodcutting', name: 'Teak 1.5-Tick Chopping',
  levelRange: [35, 99],
  xpPerHour: 100000,
  prerequisites: { skills: { woodcutting: 35 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [], net: 'neutral' },
  inputs: [],
  bankingFrequency: 'never',
  costPerHour: 0,
  danger: 'none',
  complexity: 'intense',
  attention: 'maximum',
  description: 'Tick-manipulate teak trees. Fastest WC XP. Demands frame-perfect clicking.',
  location: 'Veilwood',
  breakpointAt: 35,
});

rel.defineTrainingMethod('woodcutting_redwoods', {
  skill: 'woodcutting', name: 'Redwood Chopping',
  levelRange: [90, 99],
  xpPerHour: 60000,
  prerequisites: { skills: { woodcutting: 90 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Redwood logs', perHour: 120 }], net: 'profit' },
  inputs: [],
  bankingFrequency: 'moderate',
  costPerHour: -50000,
  danger: 'none',
  complexity: 'trivial',
  attention: 'afk',
  description: 'Chop massive redwoods. Extremely AFK, high XP per log. The endgame chill.',
  location: 'Veilwood',
  breakpointAt: 90,
});

rel.defineTrainingMethod('woodcutting_sulliusceps', {
  skill: 'woodcutting', name: 'Sulliuscep Chopping',
  levelRange: [65, 99],
  xpPerHour: 80000,
  prerequisites: { skills: { woodcutting: 65 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Sulliuscep cap', perHour: 100 }, { name: 'Numulite', perHour: 500 }], net: 'profit' },
  inputs: [],
  bankingFrequency: 'moderate',
  costPerHour: -20000,
  danger: 'low',
  complexity: 'moderate',
  attention: 'medium',
  description: 'Run between mushroom spawns in the swamp. Good XP, fossils, moderate attention.',
  location: 'Moryskah',
  breakpointAt: 65,
});

rel.defineTrainingMethod('woodcutting_wilds_ents', {
  skill: 'woodcutting', name: 'Wilderness Ent Chopping',
  levelRange: [40, 99],
  xpPerHour: 70000,
  prerequisites: { skills: { woodcutting: 40 }, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Noted logs (varied)', perHour: 200 }], net: 'profit' },
  inputs: [],
  bankingFrequency: 'never',
  costPerHour: -40000,
  danger: 'high',
  complexity: 'moderate',
  attention: 'high',
  description: 'Ents drop noted logs, no banking needed. Good profit if you survive the PKers.',
  location: 'The Wilds',
  breakpointAt: 40,
});

// ==============================================================================
// FARMING (23/23)
// ==============================================================================

rel.defineTrainingMethod('farming_allotment_patches', {
  skill: 'farming', name: 'Allotment Patch Runs',
  levelRange: [1, 40],
  xpPerHour: 20000,
  prerequisites: { skills: {}, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Vegetables', perHour: 300 }], net: 'profit' },
  inputs: [{ name: 'Potato seed', perHour: 20, source: 'combat_drops' }],
  bankingFrequency: 'moderate',
  costPerHour: -5000,
  danger: 'none',
  complexity: 'simple',
  attention: 'afk',
  description: 'Plant seeds, come back later, harvest. Passive XP between other activities.',
  location: 'Heartlands',
  breakpointAt: 1,
});

rel.defineTrainingMethod('farming_herb_runs', {
  skill: 'farming', name: 'Herb Patch Runs',
  levelRange: [9, 99],
  xpPerHour: 50000,
  prerequisites: { skills: { farming: 9 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Herbs (varied)', perHour: 60 }], net: 'profit' },
  inputs: [{ name: 'Herb seed', perHour: 10, source: 'combat_drops' }],
  bankingFrequency: 'moderate',
  costPerHour: -200000,
  danger: 'none',
  complexity: 'simple',
  attention: 'afk',
  description: 'Best farming money. 5-minute runs every 80 minutes. Passive wealth engine.',
  location: 'Heartlands',
  breakpointAt: 9,
});

rel.defineTrainingMethod('farming_tree_runs', {
  skill: 'farming', name: 'Tree Patch Runs',
  levelRange: [15, 99],
  xpPerHour: 500000,
  prerequisites: { skills: { farming: 15 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [], net: 'neutral' },
  inputs: [{ name: 'Tree sapling', perHour: 5, source: 'farming' }, { name: 'Payment (varied)', perHour: 5, source: 'ge' }],
  bankingFrequency: 'moderate',
  costPerHour: 600000,
  danger: 'none',
  complexity: 'simple',
  attention: 'low',
  description: 'Plant saplings, pay farmer, check health. Fastest farming XP. Extremely expensive.',
  location: 'Heartlands',
  breakpointAt: 15,
});

rel.defineTrainingMethod('farming_tithe_farm', {
  skill: 'farming', name: 'Tithe Farm',
  levelRange: [34, 99],
  xpPerHour: 90000,
  prerequisites: { skills: { farming: 34 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Tithe farm points', perHour: 50 }], net: 'neutral' },
  inputs: [{ name: 'Tithe seed', perHour: 100, source: 'shop' }],
  bankingFrequency: 'never',
  costPerHour: 0,
  danger: 'none',
  complexity: 'complex',
  attention: 'high',
  description: 'Active farming minigame. Plant, water, harvest on timers. Free but demands focus.',
  location: 'Heartlands',
  breakpointAt: 34,
});

rel.defineTrainingMethod('farming_hespori', {
  skill: 'farming', name: 'Hespori Boss',
  levelRange: [65, 99],
  xpPerHour: 200000,
  prerequisites: { skills: { farming: 65 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ name: 'Anima seed', perHour: 1 }, { name: 'Bottomless bucket', perHour: 0.01 }], net: 'profit' },
  inputs: [{ name: 'Hespori seed', perHour: 1, source: 'farming' }],
  bankingFrequency: 'rare',
  costPerHour: 0,
  danger: 'medium',
  complexity: 'moderate',
  attention: 'medium',
  description: 'Farming boss. Grows over time, fight it when ready. Unique seed rewards.',
  location: 'Veilwood',
  breakpointAt: 65,
});

rel.defineTrainingMethod('farming_wilds_herb_patches', {
  skill: 'farming', name: 'Wilderness Herb Patches',
  levelRange: [30, 99],
  xpPerHour: 60000,
  prerequisites: { skills: { farming: 30 }, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Grimy herb', perHour: 80 }], net: 'profit' },
  inputs: [{ name: 'Herb seed', perHour: 5, source: 'combat_drops' }],
  bankingFrequency: 'rare',
  costPerHour: -250000,
  danger: 'high',
  complexity: 'simple',
  attention: 'high',
  description: 'Wilds patches yield 50% more herbs. Extremely profitable if you survive the run.',
  location: 'The Wilds',
  breakpointAt: 30,
});

// ==============================================================================
// LOAD CONFIRMATION
// ==============================================================================

const allMethods = [...require('../../data/relationships').listMethodsForSkill('attack'),
  ...require('../../data/relationships').listMethodsForSkill('strength'),
  ...require('../../data/relationships').listMethodsForSkill('defence'),
  ...require('../../data/relationships').listMethodsForSkill('hitpoints'),
  ...require('../../data/relationships').listMethodsForSkill('ranged'),
  ...require('../../data/relationships').listMethodsForSkill('prayer'),
  ...require('../../data/relationships').listMethodsForSkill('magic'),
  ...require('../../data/relationships').listMethodsForSkill('runecrafting'),
  ...require('../../data/relationships').listMethodsForSkill('construction'),
  ...require('../../data/relationships').listMethodsForSkill('agility'),
  ...require('../../data/relationships').listMethodsForSkill('herblore'),
  ...require('../../data/relationships').listMethodsForSkill('thieving'),
  ...require('../../data/relationships').listMethodsForSkill('crafting'),
  ...require('../../data/relationships').listMethodsForSkill('fletching'),
  ...require('../../data/relationships').listMethodsForSkill('slayer'),
  ...require('../../data/relationships').listMethodsForSkill('hunter'),
  ...require('../../data/relationships').listMethodsForSkill('mining'),
  ...require('../../data/relationships').listMethodsForSkill('smithing'),
  ...require('../../data/relationships').listMethodsForSkill('fishing'),
  ...require('../../data/relationships').listMethodsForSkill('cooking'),
  ...require('../../data/relationships').listMethodsForSkill('firemaking'),
  ...require('../../data/relationships').listMethodsForSkill('woodcutting'),
  ...require('../../data/relationships').listMethodsForSkill('farming'),
];

console.log(`[aelgard] Training knobs loaded -- ${allMethods.length} methods across 23 skills`);
