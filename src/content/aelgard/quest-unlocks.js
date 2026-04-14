// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Quest Unlock Registry
//
// "If a quest gives you access to a new sword, then that quest is often the
//  ONLY source of that sword in the game." — Marstead
//
// "The 139-some quests in RuneScape all provide wildly different rewards."
//
// Every quest is a Metroidvania key. It doesn't just give XP — it opens
// something that nothing else opens. Areas, training methods, shops, items,
// teleports, spellbooks, prayers, shortcuts, bosses, minigames.
//
// If a quest only gives XP and coins, it's WORTHLESS. Delete it.
// ══════════════════════════════════════════════════════════════════════════════

const rel = require('../../data/relationships');

// ══════════════════════════════════════════════════════════════════════════════
// NOVICE QUESTS — Each teaches a skill and unlocks a concrete thing
// ══════════════════════════════════════════════════════════════════════════════

rel.defineQuestUnlock('the_runaway_golem', {
  name: 'The Runaway Golem',
  unlocks: [
    { type: 'shortcut', id: 'sootworks_border_mine', description: 'Shortcut between Heartlands and Sootworks border mine' },
    { type: 'item_equip', id: 'golem_repair_manual', description: 'Golem Repair Manual — used to control golems in later quests' },
  ],
});

rel.defineQuestUnlock('the_tide_pool_collector', {
  name: 'The Tide Pool Collector',
  unlocks: [
    { type: 'training_method', id: 'tide_pool_fishing', description: 'Tide pool fishing spots — unique early-game fish for cooking XP' },
    { type: 'item_equip', id: 'tide_pool_net', description: 'Tide Pool Net — catches unique fish not available elsewhere' },
  ],
});

rel.defineQuestUnlock('lamplighters_apprentice', {
  name: "Lamplighter's Apprentice",
  unlocks: [
    { type: 'teleport', id: 'moryskah_border_lanterns', description: 'Moryskah border lantern network — fast travel between border posts' },
    { type: 'item_equip', id: 'voss_tinderbox', description: "Voss's Tinderbox — 10% faster firemaking, works on blessed wood" },
  ],
});

rel.defineQuestUnlock('the_apprentice_trapper', {
  name: 'The Apprentice Trapper',
  unlocks: [
    { type: 'area', id: 'veilwood_canopy', description: 'Veilwood canopy hunting grounds — rare chinchompas and moonhawks' },
    { type: 'item_equip', id: 'canopy_hunting_permit', description: 'Canopy Hunting Permit — required to set traps in canopy zone' },
  ],
});

rel.defineQuestUnlock('the_stolen_runes', {
  name: 'The Stolen Runes',
  unlocks: [
    { type: 'shop', id: 'heartlands_rune_shop_discount', description: 'Permanent 10% discount at Heartlands Rune Shop' },
    { type: 'item_equip', id: 'ruvens_rune_pouch', description: "Ruven's Rune Pouch — holds 3 types of runes in one inventory slot" },
  ],
});

rel.defineQuestUnlock('the_fencepost_problem', {
  name: 'The Fencepost Problem',
  unlocks: [
    { type: 'teleport', id: 'heartlands_ranch', description: 'Heartlands ranch as a teleport destination' },
    { type: 'item_equip', id: 'ranchers_bell', description: "Rancher's Bell — summons pet cow (cosmetic + farming timer)" },
  ],
});

rel.defineQuestUnlock('the_bog_witchs_errand', {
  name: "The Bog Witch's Errand",
  unlocks: [
    { type: 'training_method', id: 'moryskah_herb_patch', description: 'Moryskah herb patch — unique swamp herbs not found elsewhere' },
    { type: 'recipe', id: 'swamp_salve', description: 'Swamp Salve recipe — potion that provides undead protection' },
  ],
});

rel.defineQuestUnlock('target_practice', {
  name: 'Target Practice',
  unlocks: [
    { type: 'training_method', id: 'archery_range_daily', description: 'Heartlands archery range — daily ranged XP bonus (low attention)' },
    { type: 'item_equip', id: 'militia_archers_badge', description: "Militia Archer's Badge — +5% ranged accuracy at the range" },
  ],
});

rel.defineQuestUnlock('the_boneyard_compass', {
  name: 'The Boneyard Compass',
  unlocks: [
    { type: 'area', id: 'boneyard_deep_dunes', description: 'Immunity to Boneyard sandstorm disorientation — access deep dunes' },
    { type: 'item_equip', id: 'boneyard_compass_item', description: 'Boneyard Compass — navigate desert without water loss' },
  ],
});

rel.defineQuestUnlock('the_slayers_first_mark', {
  name: "The Slayer's First Mark",
  unlocks: [
    { type: 'npc', id: 'slayer_apprentice_kael', description: 'Novice slayer task assignments from Slayer Apprentice Kael' },
    { type: 'training_method', id: 'novice_slayer_tasks', description: 'Novice slayer tasks — kills give slayer XP, structured combat training' },
  ],
});

// ══════════════════════════════════════════════════════════════════════════════
// INTERMEDIATE QUESTS — Multi-region, bigger unlocks
// ══════════════════════════════════════════════════════════════════════════════

rel.defineQuestUnlock('the_counterfeit_ring', {
  name: 'The Counterfeit Ring',
  unlocks: [
    { type: 'area', id: 'saltbrine_smugglers_cove', description: "Saltbrine Smuggler's Cove — black market with better sell prices" },
    { type: 'item_equip', id: 'inspectors_loupe', description: "Inspector's Loupe — identify fake items, bonus thieving success" },
  ],
});

rel.defineQuestUnlock('sand_and_secrets', {
  name: 'Sand and Secrets',
  unlocks: [
    { type: 'area', id: 'boneyard_wastes', description: 'Full access to the Boneyard Wastes region' },
    { type: 'training_method', id: 'sandstone_quarrying', description: 'Sandstone quarrying — AFK mining method in the desert' },
  ],
});

rel.defineQuestUnlock('the_green_thumb', {
  name: 'The Green Thumb',
  unlocks: [
    { type: 'area', id: 'veilwood', description: 'Full access to Veilwood region' },
    { type: 'recipe', id: 'elven_soil_restoration', description: 'Elven soil restoration potion — prevents crop disease for 1 hour' },
  ],
});

rel.defineQuestUnlock('foundations_of_the_fallen', {
  name: 'Foundations of the Fallen',
  unlocks: [
    { type: 'area', id: 'sootworks', description: 'Full access to the Sootworks region' },
    { type: 'recipe', id: 'sootworks_joint', description: 'Sootworks joint technique — 15% bonus construction XP' },
    { type: 'area', id: 'heartlands_hidden_crypt', description: 'Hidden crypt beneath the Chapel of the Last Light' },
  ],
});

rel.defineQuestUnlock('the_bog_witchs_bargain', {
  name: "The Bog Witch's Bargain",
  unlocks: [
    { type: 'area', id: 'moryskah', description: 'Full access to Moryskah region' },
    { type: 'recipe', id: 'wolfbane_incense', description: 'Wolfbane incense — repels werewolves for 10 minutes' },
    { type: 'npc', id: 'bog_witch', description: 'Bog Witch available as herblore tutor (unique swamp potions)' },
  ],
});

rel.defineQuestUnlock('pirate_king', {
  name: 'Pirate King',
  unlocks: [
    { type: 'area', id: 'saltbrine_reach', description: 'Full access to Saltbrine Reach region' },
    { type: 'teleport', id: 'charter_ships', description: 'Charter ship network — travel between all coastal areas' },
    { type: 'item_equip', id: 'captains_hook', description: "Captain's Hook — cosmetic weapon + 5% fishing speed on boats" },
  ],
});

rel.defineQuestUnlock('slayers_gauntlet', {
  name: "Slayer's Gauntlet",
  unlocks: [
    { type: 'npc', id: 'slayer_master_varrek', description: 'Slayer Master Varrek — intermediate+ slayer tasks in Moryskah' },
    { type: 'area', id: 'moryskah_slayer_tower', description: 'Access to the Moryskah Slayer Tower' },
    { type: 'item_equip', id: 'enchanted_gem', description: 'Enchanted gem — check slayer task remotely' },
  ],
});

rel.defineQuestUnlock('sootworks_rising', {
  name: 'Sootworks Rising',
  unlocks: [
    { type: 'area', id: 'sootworks_blast_furnace', description: 'Blast Furnace — halves coal for smelting, best smithing XP' },
    { type: 'recipe', id: 'deep_stone_alloy', description: 'Deep-stone alloy smithing — higher-tier bars with less coal' },
    { type: 'training_method', id: 'blast_furnace_smithing', description: 'Blast Furnace smithing — high attention, high XP, high profit' },
  ],
});

rel.defineQuestUnlock('into_the_wilds', {
  name: 'Into the Wilds',
  unlocks: [
    { type: 'training_method', id: 'wilderness_agility', description: 'Wilderness Agility Course — best XP/hr but in PvP zone' },
    { type: 'item_equip', id: 'rangers_survival_kit', description: "Ranger's Survival Kit — one-click teleport to Wilds border (one use)" },
  ],
});

// ══════════════════════════════════════════════════════════════════════════════
// EXPERIENCED / MASTER QUESTS — Big keys for endgame content
// ══════════════════════════════════════════════════════════════════════════════

rel.defineQuestUnlock('the_inkweald_door', {
  name: 'The Inkweald Door',
  unlocks: [
    { type: 'area', id: 'inkweald', description: 'Full access to The Inkweald — surreal dream forest' },
    { type: 'spellbook', id: 'dream_magic', description: 'Dream Magic — utility spellbook (NPC contact, dream teleport, lucid ward)' },
  ],
});

rel.defineQuestUnlock('desert_treasure', {
  name: 'Desert Treasure',
  unlocks: [
    { type: 'spellbook', id: 'ancient_magicks', description: 'Ancient Magicks spellbook — ice barrage, blood barrage, smoke barrage' },
    { type: 'area', id: 'boneyard_pyramid', description: 'Full Boneyard Pyramid interior access' },
  ],
});

rel.defineQuestUnlock('lunar_diplomacy', {
  name: 'Lunar Diplomacy',
  unlocks: [
    { type: 'spellbook', id: 'lunar_spellbook', description: 'Lunar spellbook — cure, vengeance, heal group, NPC contact, humidify' },
    { type: 'area', id: 'inkweald_lunar_plane', description: 'Lunar Plane — accessible from Inkweald, unique runecrafting' },
  ],
});

rel.defineQuestUnlock('echoes_of_the_deep', {
  name: 'Echoes of the Deep',
  unlocks: [
    { type: 'area', id: 'glass_desert', description: 'Full access to The Glass Desert — endgame region' },
    { type: 'teleport', id: 'underground_tunnel_network', description: 'Underground tunnel network connecting Sootworks → Boneyard → Moryskah → Glass Desert' },
    { type: 'training_method', id: 'crystal_mining', description: 'Crystal mining — highest-tier ore, Glass Desert only' },
  ],
});

rel.defineQuestUnlock('dragon_slayer_aelgard', {
  name: 'Dragon Slayer of Aelgard',
  unlocks: [
    { type: 'item_equip', id: 'anti_dragon_shield', description: 'Anti-dragon shield — required to fight any dragon without taking massive damage' },
    { type: 'recipe', id: 'dragonfire_shield', description: 'Dragonfire shield crafting — BIS shield for dragon encounters' },
    { type: 'area', id: 'sootworks_deep_mines', description: 'Deep mines access (metal dragons, runite ore)' },
  ],
});

rel.defineQuestUnlock('blood_rites', {
  name: 'Blood Rites',
  unlocks: [
    { type: 'area', id: 'moryskah_barrows', description: 'The Barrows — repeatable boss encounter, degradable set equipment' },
    { type: 'prayer', id: 'protect_from_undead', description: 'Protect from Undead prayer — critical for Moryskah content' },
  ],
});

rel.defineQuestUnlock('the_last_dragon_p3', {
  name: 'The Last Dragon Part 3',
  unlocks: [
    { type: 'area', id: 'glass_desert_crystal_caverns', description: 'Crystal Caverns — Crystal Wyrm lair, tier 5 endgame boss' },
    { type: 'item_equip', id: 'dragon_hunter_lance', description: 'Can now equip Dragon Hunter Lance — BIS against all dragons' },
  ],
});

rel.defineQuestUnlock('sins_of_malachar', {
  name: 'Sins of Malachar',
  unlocks: [
    { type: 'area', id: 'moryskah_castle_malachar', description: 'Castle Malachar — Theatre of Blood equivalent raid' },
    { type: 'boss', id: 'lord_malachar', description: 'Lord Malachar boss fight — drops Scythe of Malachar' },
  ],
});

rel.defineQuestUnlock('monkey_business', {
  name: 'Monkey Business',
  unlocks: [
    { type: 'teleport', id: 'monkey_talisman', description: 'Monkey Talisman — teleport to monkey island' },
    { type: 'shop', id: 'dragon_scimitar_shop', description: 'Dragon scimitar shop — BIS melee weapon for the mid game' },
    { type: 'item_equip', id: 'dragon_scimitar_equip', description: 'Can now equip dragon scimitar (requires quest completion, not just level)' },
  ],
});

// ══════════════════════════════════════════════════════════════════════════════
// GRANDMASTER QUESTS — Transformative game-changers
// ══════════════════════════════════════════════════════════════════════════════

rel.defineQuestUnlock('the_last_light', {
  name: 'The Last Light of the Old Sun',
  unlocks: [
    { type: 'area', id: 'glass_desert_new_sun_zone', description: 'New Sun Zone — unlocked only if player chose to forge a new sun' },
    { type: 'boss', id: 'eclipse_guardian', description: 'Eclipse Guardian — post-game boss with unique drop table' },
    { type: 'prayer', id: 'solar_blessing', description: 'Solar Blessing prayer — passive HP regeneration during the day' },
  ],
});

rel.defineQuestUnlock('song_of_the_elves_aelgard', {
  name: 'Song of the Elves (Aelgard)',
  unlocks: [
    { type: 'area', id: 'veilwood_inner_sanctum', description: 'Veilwood Inner Sanctum — crystal-enhanced everything, the best anvil in the game' },
    { type: 'training_method', id: 'crystal_crafting', description: 'Crystal crafting — high-level crafting method with crystal tools' },
    { type: 'shop', id: 'crystal_shop', description: 'Crystal equipment shop — buyable but expensive crystal gear' },
    { type: 'training_method', id: 'inner_sanctum_mining', description: 'Crystal mining nodes — best mining XP but requires maximum attention' },
  ],
});

rel.defineQuestUnlock('rfd_finale', {
  name: 'Recipe for Disaster — Finale',
  unlocks: [
    { type: 'item_equip', id: 'barrows_gloves', description: 'Barrows Gloves — BIS melee hand slot, the iconic mid-game achievement' },
    { type: 'shop', id: 'culinaromancers_chest', description: "Culinaromancer's Chest — buys food items and gloves at all tiers" },
  ],
});

rel.defineQuestUnlock('the_werewolfs_dilemma', {
  name: "The Werewolf's Dilemma",
  unlocks: [
    // BRANCHING: player choice determines which unlock they get. Both are useful.
    // Cure path:
    { type: 'npc', id: 'cured_werewolf_shopkeeper', description: 'CURE PATH: Human NPC shopkeeper in werewolf territory (herblore supplies)' },
    // Empower path:
    { type: 'npc', id: 'werewolf_ally', description: 'EMPOWER PATH: Werewolf combat ally for Moryskah bosses (summonable once/day)' },
  ],
});

rel.defineQuestUnlock('drifting_market_charter', {
  name: 'The Drifting Market Charter',
  unlocks: [
    { type: 'area', id: 'drifting_market', description: 'The Drifting Market — mobile trade hub, moves between regions weekly' },
    { type: 'shop', id: 'drifting_market_shops', description: 'Multi-region specialty shops on one platform' },
  ],
});

// ══════════════════════════════════════════════════════════════════════════════
// MINIQUEST / COMBAT CHALLENGE UNLOCKS
// ══════════════════════════════════════════════════════════════════════════════

rel.defineQuestUnlock('fight_caves', {
  name: 'The Fight Caves',
  unlocks: [
    { type: 'item_equip', id: 'fire_cape', description: 'Fire Cape — BIS melee cape until Infernal Cape. The prestige item.' },
    { type: 'area', id: 'glass_desert_inferno', description: 'The Inferno becomes accessible (requires sacrificing Fire Cape to enter)' },
  ],
});

rel.defineQuestUnlock('infernal_challenge', {
  name: 'The Infernal Challenge',
  unlocks: [
    { type: 'item_equip', id: 'infernal_cape', description: 'Infernal Cape — BIS cape in the entire game. Ultimate prestige.' },
  ],
});

rel.defineQuestUnlock('barrows_brothers', {
  name: 'The Barrows Brothers',
  unlocks: [
    // Repeatable — the unlock is the LOOT TABLE, not a one-time reward
    { type: 'training_method', id: 'barrows_farming', description: 'Barrows runs — repeatable combat for degradable set equipment' },
  ],
});

rel.defineQuestUnlock('herb_run_mastery', {
  name: 'The Perfect Herb Run',
  unlocks: [
    { type: 'diary_perk', id: 'master_farmer_title', description: 'Master Farmer title + permanent 10% herb yield bonus' },
  ],
});

rel.defineQuestUnlock('wilderness_sword', {
  name: 'Blade of the Wilds',
  unlocks: [
    { type: 'item_equip', id: 'wilderness_blade', description: 'Wilderness Blade — BIS in the Wilds only, useless outside. Niche sidegrade.' },
  ],
});

console.log(`[aelgard] Quest unlock registry loaded`);
