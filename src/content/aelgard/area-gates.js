// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Area Gates (Lock-and-Key System)
//
// "RuneScape is structured like a Metroidvania. Hundreds of unique progression
//  locks opened by hundreds of unique progression keys." — Marstead
//
// Every area beyond the Heartlands requires something to enter.
// Areas within regions have sub-gates creating progressive unlocking.
// The Wilds is always accessible but PvP-enabled (risk is the gate).
// ══════════════════════════════════════════════════════════════════════════════

const rel = require('../../data/relationships');

// ══════════════════════════════════════════════════════════════════════════════
// REGION GATES — Top-level access to each of the 8 regions
// These are the big Metroidvania doors. Each requires a specific quest chain
// AND skill levels, forcing players down multiple progression roads.
// ══════════════════════════════════════════════════════════════════════════════

// 1. The Heartlands — Starter region, no gate
rel.defineAreaGate('heartlands', {
  name: 'The Heartlands',
  description: 'The safe starter kingdom. All players begin here. Medieval towns, farms, guilds, a river.',
  region: 'heartlands',
  requires: {}, // No requirements — this is where everyone starts
});

// 2. Boneyard Wastes — Desert region, moderate gate
rel.defineAreaGate('boneyard_wastes', {
  name: 'The Boneyard Wastes',
  description: 'Post-apocalyptic desert. Pyramids, fossils, sand elementals. Hot climate damages unprepared players.',
  region: 'boneyard_wastes',
  requires: {
    quests: ['sand_and_secrets'],          // Intro quest from Heartlands NPC
    skills: { mining: 15, firemaking: 10 },
    items: [{ id: 15009, name: 'Boneyard compass', consumed: false }], // From Boneyard Compass quest
  },
});

// 3. Veilwood — Elven forest, moderate gate
rel.defineAreaGate('veilwood', {
  name: 'Veilwood',
  description: 'Enchanted elven forest. Dense canopy, hidden paths, druid circles. Requires agility to navigate.',
  region: 'veilwood',
  requires: {
    quests: ['the_green_thumb'],            // Farming intro quest crosses into Veilwood
    skills: { agility: 15, woodcutting: 10 },
  },
});

// 4. The Sootworks — Industrial underground, moderate-hard gate
rel.defineAreaGate('sootworks', {
  name: 'The Sootworks',
  description: 'Clockwork industrial underground. Dwarven forges, steam vents, mechanical puzzles.',
  region: 'sootworks',
  requires: {
    quests: ['foundations_of_the_fallen'],   // Construction intro quest leads to Sootworks
    skills: { mining: 25, smithing: 15, construction: 10 },
  },
});

// 5. Moryskah — Gothic horror, hard gate (like Priest in Peril)
rel.defineAreaGate('moryskah', {
  name: 'Moryskah',
  description: 'Gothic horror swamp. Undead, werewolves, vampires. Holy items provide protection.',
  region: 'moryskah',
  requires: {
    quests: ['the_bog_witchs_bargain'],     // Must complete the Moryskah intro chain
    skills: { prayer: 20, attack: 25, magic: 15 },
  },
});

// 6. The Inkweald — Surreal dream forest, hard gate
rel.defineAreaGate('inkweald', {
  name: 'The Inkweald',
  description: 'Surreal dream forest. Reality bends. Magic-heavy region — melee is unreliable here.',
  region: 'inkweald',
  requires: {
    quests: ['the_inkweald_door'],          // Requires Moryskah + Veilwood access first
    skills: { magic: 40, herblore: 30, runecrafting: 20 },
  },
});

// 7. Saltbrine Reach — Pirate coast, moderate gate
rel.defineAreaGate('saltbrine_reach', {
  name: 'Saltbrine Reach',
  description: 'Pirate coast. Ships, smugglers, deep-sea fishing. Water travel hub.',
  region: 'saltbrine_reach',
  requires: {
    quests: ['pirate_king'],                // Saltbrine intro quest
    skills: { fishing: 20, cooking: 15, agility: 10 },
  },
});

// 8. The Glass Desert — Endgame, very hard gate
rel.defineAreaGate('glass_desert', {
  name: 'The Glass Desert',
  description: 'Crystalline wasteland. The hardest region. Crystal Wyrm lives here. Endgame bosses and resources.',
  region: 'glass_desert',
  requires: {
    quests: ['echoes_of_the_deep'],         // 4-region globetrotting quest
    skills: { mining: 50, magic: 45, prayer: 35, agility: 30, hitpoints: 50 },
    combatLevel: 70,
  },
});

// Cross-region: The Wilds (PvP zone) — No gate, but PvP enabled everywhere.
// The "gate" is risk itself. Per Marstead: danger justifies turning up reward knobs.
rel.defineAreaGate('the_wilds', {
  name: 'The Wilds',
  description: 'Lawless PvP zone north of Aelgard. No requirements to enter, but anything you carry can be taken. Superior training methods and rare resources justify the risk.',
  region: 'the_wilds',
  requires: {}, // Accessible to all — risk IS the gate
});

// Cross-region: The Drifting Market — Requires quest to unlock
rel.defineAreaGate('drifting_market', {
  name: 'The Drifting Market',
  description: 'Player-accessible mobile trade hub. Moves between regions weekly. The GE alternative.',
  region: null,
  requires: {
    quests: ['drifting_market_charter'],    // Group/social quest spanning 4 regions
    skills: { crafting: 35 },
  },
});

// ══════════════════════════════════════════════════════════════════════════════
// SUB-AREA GATES — Progressive unlocking within regions
// This creates depth. You can access a region but not all of it immediately.
// ══════════════════════════════════════════════════════════════════════════════

// ── Heartlands sub-areas ──────────────────────────────────────────────────────
rel.defineAreaGate('heartlands_champions_guild', {
  name: "Champions' Guild",
  description: 'Requires quest points to enter. Sells rune platebody. Gateway to Dragon Slayer equivalent.',
  region: 'heartlands',
  requires: {
    skills: {},
    quests: [],
    // Quest points check handled by engine: need 32 QP
  },
});

rel.defineAreaGate('heartlands_mining_guild', {
  name: 'Heartlands Mining Guild',
  description: 'Rich ore deposits. Mithril and adamant rocks. Invisible +7 mining level boost.',
  region: 'heartlands',
  requires: { skills: { mining: 60 } },
});

rel.defineAreaGate('heartlands_cooking_guild', {
  name: 'Heartlands Cooking Guild',
  description: 'Best cooking range in the game (lower burn rate). Rare ingredient shop.',
  region: 'heartlands',
  requires: { skills: { cooking: 32 } },
});

rel.defineAreaGate('heartlands_crafting_guild', {
  name: 'Heartlands Crafting Guild',
  description: 'Spinning wheel, pottery oven, and gem cutting station all in one building.',
  region: 'heartlands',
  requires: { skills: { crafting: 40 } },
});

rel.defineAreaGate('heartlands_warriors_guild', {
  name: "Warriors' Guild",
  description: 'Earn warrior guild tokens. Buy defenders — crucial off-hand for melee.',
  region: 'heartlands',
  requires: {
    // Combined attack + strength >= 130 (handled by engine)
    skills: { attack: 65 },
  },
});

// ── Veilwood sub-areas ────────────────────────────────────────────────────────
rel.defineAreaGate('veilwood_canopy', {
  name: 'Veilwood Canopy Hunting Grounds',
  description: 'High-level hunter area above the forest floor. Rare chinchompas and moonhawks.',
  region: 'veilwood',
  requires: {
    quests: ['the_apprentice_trapper'],
    skills: { hunter: 20, agility: 15 },
  },
});

rel.defineAreaGate('veilwood_druid_circle', {
  name: 'Veilwood Druid Circle',
  description: 'Sacred grove. Herblore and farming training with elven bonuses.',
  region: 'veilwood',
  requires: {
    quests: ['roots_of_the_old_growth'],
    skills: { farming: 25, herblore: 20 },
  },
});

rel.defineAreaGate('veilwood_inner_sanctum', {
  name: 'Veilwood Inner Sanctum',
  description: 'Heart of the elven forest. Crystal-enhanced magic training. Prerequisite for Prifddinas equivalent.',
  region: 'veilwood',
  requires: {
    quests: ['song_of_the_elves_aelgard'],
    skills: { agility: 70, construction: 70, farming: 70, herblore: 70, hunter: 70, mining: 70, smithing: 70, woodcutting: 70 },
  },
});

// ── Sootworks sub-areas ───────────────────────────────────────────────────────
rel.defineAreaGate('sootworks_blast_furnace', {
  name: 'Sootworks Blast Furnace',
  description: 'Halves coal requirements for smelting. Best smithing XP/hr but requires constant attention.',
  region: 'sootworks',
  requires: {
    quests: ['sootworks_rising'],
    skills: { smithing: 30 },
  },
});

rel.defineAreaGate('sootworks_deep_mines', {
  name: 'Sootworks Deep Mines',
  description: 'Runite ore deposits, gem rocks, and the entrance to the metal dragon den.',
  region: 'sootworks',
  requires: {
    skills: { mining: 55, defence: 40 },
    quests: ['dragon_slayer_aelgard'],
  },
});

// ── Moryskah sub-areas ───────────────────────────────────────────────────────
rel.defineAreaGate('moryskah_slayer_tower', {
  name: 'Moryskah Slayer Tower',
  description: 'Multi-floor slayer dungeon. Aberrant spectres, gargoyles, nechryaels, abyssal demons.',
  region: 'moryskah',
  requires: {
    quests: ['slayers_gauntlet'],
    skills: { slayer: 10 },
  },
});

rel.defineAreaGate('moryskah_barrows', {
  name: 'The Barrows',
  description: 'Six ancient warrior tombs. Repeatable boss encounters. Drops degradable set equipment.',
  region: 'moryskah',
  requires: {
    quests: ['blood_rites'],
    skills: { prayer: 43, magic: 50 },
  },
});

rel.defineAreaGate('moryskah_castle_malachar', {
  name: 'Castle Malachar',
  description: 'Vampire stronghold. Late-game Moryskah content. Theatre of Blood equivalent raid.',
  region: 'moryskah',
  requires: {
    quests: ['sins_of_malachar'],
    skills: { attack: 70, prayer: 60, agility: 50 },
  },
});

// ── Boneyard sub-areas ────────────────────────────────────────────────────────
rel.defineAreaGate('boneyard_pyramid', {
  name: 'Boneyard Pyramid Interior',
  description: 'Ancient pyramid dungeon. Agility course, prayer training, and access to Ancient Magicks.',
  region: 'boneyard_wastes',
  requires: {
    quests: ['desert_treasure'],
    skills: { agility: 30, thieving: 25 },
  },
});

// ── Saltbrine sub-areas ──────────────────────────────────────────────────────
rel.defineAreaGate('saltbrine_deep_waters', {
  name: 'Saltbrine Deep Waters',
  description: 'High-level fishing. Anglerfish, dark crabs. Accessed by charter ship.',
  region: 'saltbrine_reach',
  requires: {
    skills: { fishing: 62, cooking: 45 },
    quests: ['the_anglers_challenge'],
  },
});

rel.defineAreaGate('saltbrine_smugglers_cove', {
  name: "Smuggler's Cove",
  description: 'Black market shop. Higher sell prices but requires Thieving to access.',
  region: 'saltbrine_reach',
  requires: {
    skills: { thieving: 40 },
    quests: ['the_counterfeit_ring'],
  },
});

// ── Glass Desert sub-areas ────────────────────────────────────────────────────
rel.defineAreaGate('glass_desert_crystal_caverns', {
  name: 'Crystal Caverns',
  description: 'Crystal Wyrm lair. Tier 5 endgame boss. The hardest solo encounter in Aelgard.',
  region: 'glass_desert',
  requires: {
    quests: ['the_last_dragon_p3'],
    skills: { attack: 80, ranged: 80, magic: 75, prayer: 70, hitpoints: 80 },
    combatLevel: 100,
  },
});

rel.defineAreaGate('glass_desert_fight_caves', {
  name: 'The Fight Caves',
  description: '63 waves of combat. Fire Cape reward. The prestige challenge of Aelgard.',
  region: 'glass_desert',
  requires: {
    skills: { ranged: 60, prayer: 45, hitpoints: 60 },
  },
});

rel.defineAreaGate('glass_desert_inferno', {
  name: 'The Inferno',
  description: '69 waves. The hardest content in the game. Infernal Cape. Requires Fire Cape to enter.',
  region: 'glass_desert',
  requires: {
    quests: ['fight_caves'],               // Must have beaten Fight Caves
    skills: { ranged: 90, magic: 85, prayer: 75, hitpoints: 90 },
    items: [{ id: 99001, name: 'Fire cape', consumed: true }], // Sacrificed to enter
  },
});

// ── Wilderness sub-areas ──────────────────────────────────────────────────────
// Wilderness is tiered by depth (combat level range), not by gates.
// Deeper = higher-level PKers can attack you = more danger = better rewards.

rel.defineAreaGate('wilds_revenant_caves', {
  name: 'Revenant Caves',
  description: 'Multi-combat PvP dungeon. Revenants drop unique PvP weapons. Extremely dangerous.',
  region: 'the_wilds',
  requires: {
    // No hard gate — but effectively requires decent combat to survive
    skills: { hitpoints: 40 },
  },
});

rel.defineAreaGate('wilds_resource_area', {
  name: 'Wilderness Resource Area',
  description: 'Dark crabs, runite ore, magic trees. 7,500gp entry fee. Deep wilderness.',
  region: 'the_wilds',
  requires: {
    // Entry fee handled by engine
  },
});

console.log(`[aelgard] ${rel.listAreaGates().length} area gates loaded`);
