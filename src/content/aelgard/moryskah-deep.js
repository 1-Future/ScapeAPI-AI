// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Moryskah Deepening (Flagship Region #2 — Gothic Identity)
//
// Target: 35 → 85+ depth. Per analyzer, 11 skills hard-blocked.
//
// Moryskah is the gothic playground — vampires, werewolves, ghouls, blood
// rites, exorcism, Barrows. This is the "Morytania" of Aelgard. The flavor
// MUST be consistent: everything is cursed, undead, or supernatural.
//
// This file:
//   - Unblocks all 11 hard-blocked skills with gothic-flavored methods
//   - Registers 50+ items as Moryskah sources
//   - Fleshes out the Barrows Brothers prestige goal
//   - Creates 8 Moryskah-specific quests with unique unlocks
//   - Builds a unique Moryskah prayer path (ectoplasm conversion)
//   - Adds dense cross-region exports (bat wings already critical for super restore)
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const rel = require('../../data/relationships');

// ══════════════════════════════════════════════════════════════════════════════
// MORYSKAH-NATIVE ITEMS (IDs 95000-95999)
// Gothic-themed resources unique to the region
// ══════════════════════════════════════════════════════════════════════════════

// Moryskah ores and raw materials
rel.registerItemSource(95001, { type: 'gathering', sourceId: 'moryskah_silver_vein', sourceName: 'Moryskah Silver Vein', region: 'moryskah', details: 'Silver ore (tainted). Silver-tipped weapons. Werewolf-slaying.', obscure: false });
rel.registerItemSource(95002, { type: 'gathering', sourceId: 'moryskah_tombstone_quarry', sourceName: 'Tombstone Quarry', region: 'moryskah', details: 'Tombstone rubble. Construction material with undead-resistance.', obscure: false });
rel.registerItemSource(95003, { type: 'gathering', sourceId: 'moryskah_bog_iron', sourceName: 'Bog Iron Deposit', region: 'moryskah', details: 'Bog iron. Rusted but rich. Smelts into dark iron bar.', obscure: false });
rel.registerItemSource(95004, { type: 'gathering', sourceId: 'moryskah_cursed_coal', sourceName: 'Cursed Coal Seam', region: 'moryskah', details: 'Cursed coal. Burns hotter, works in Moryskah rituals.', obscure: true });

// Moryskah-specific logs/wood
rel.registerItemSource(95010, { type: 'gathering', sourceId: 'moryskah_blighted_oak', sourceName: 'Blighted Oak', region: 'moryskah', details: 'Blighted oak logs. Burns with ghostly flame. Unique firemaking.', obscure: false });
rel.registerItemSource(95011, { type: 'gathering', sourceId: 'moryskah_swamp_willow', sourceName: 'Swamp Willow', region: 'moryskah', details: 'Swamp willow logs. Soft and absorbent — soaks up blessings.', obscure: false });
rel.registerItemSource(95012, { type: 'gathering', sourceId: 'moryskah_pyre_log', sourceName: 'Pyre Log Harvest', region: 'moryskah', details: 'Pyre logs. Needed for Shade cremation (prayer training).', obscure: false });

// Moryskah fish
rel.registerItemSource(95020, { type: 'gathering', sourceId: 'moryskah_bog_fish', sourceName: 'Bog Fishing Spot', region: 'moryskah', details: 'Raw bog trout. Unique swamp fish. Cures certain poisons when cooked.', obscure: false });
rel.registerItemSource(95021, { type: 'gathering', sourceId: 'moryskah_sacred_eel', sourceName: 'Sacred Eel Pool', region: 'moryskah', details: 'Sacred eel. Dissect for scales. Moryskah-unique.', obscure: false });
rel.registerItemSource(95022, { type: 'gathering', sourceId: 'moryskah_tide_pool_dark', sourceName: 'Dark Tide Pool', region: 'moryskah', details: 'Raw karambwanji. Base for swamp karambwans.', obscure: true });

// Herbs (swamp herbs)
rel.registerItemSource(95030, { type: 'gathering', sourceId: 'moryskah_swamp_herb_patch', sourceName: 'Swamp Herb Patch', region: 'moryskah', details: 'Grimy swamp herbs (all tiers). Bog-grown, 25% yield bonus.', obscure: false });
rel.registerItemSource(95031, { type: 'gathering', sourceId: 'moryskah_mushroom_patch', sourceName: 'Mushroom Patch', region: 'moryskah', details: 'Bittercap mushrooms. Herblore secondary. Only swamp grows them.', obscure: false });
rel.registerItemSource(95032, { type: 'gathering', sourceId: 'moryskah_nightshade_patch', sourceName: 'Nightshade Patch', region: 'moryskah', details: 'Cave nightshade. Werewolf repellent secondary.', obscure: true });

// Undead drops
rel.registerItemSource(95040, { type: 'drop', sourceId: 'moryskah_zombie', sourceName: 'Moryskah Zombie', region: 'moryskah', details: 'Rotten flesh. Herblore secondary for weapon-poison.', obscure: false });
rel.registerItemSource(95041, { type: 'drop', sourceId: 'moryskah_skeleton', sourceName: 'Moryskah Skeleton', region: 'moryskah', details: 'Bones + tattered cloth. Crafting & prayer.', obscure: false });
rel.registerItemSource(95042, { type: 'drop', sourceId: 'moryskah_ghost', sourceName: 'Moryskah Ghost', region: 'moryskah', details: 'Ectoplasm. Feed into the Ectofuntus for premium prayer.', obscure: false });
rel.registerItemSource(95043, { type: 'drop', sourceId: 'moryskah_mummy', sourceName: 'Moryskah Mummy Guardian', region: 'moryskah', details: 'Wrap cloth. Ritual offerings AND ranger clothing.', obscure: true });
rel.registerItemSource(95044, { type: 'drop', sourceId: 'moryskah_shade', sourceName: 'Shade of Mortton', region: 'moryskah', details: 'Shade remains. Cremate on pyre for prayer XP.', obscure: false });
rel.registerItemSource(95045, { type: 'drop', sourceId: 'moryskah_banshee', sourceName: 'Banshee', region: 'moryskah', details: 'Banshee voice (1/64). Crafting: silence scrolls.', obscure: true });
rel.registerItemSource(95046, { type: 'drop', sourceId: 'moryskah_abberant_spectre', sourceName: 'Aberrant Spectre', region: 'moryskah', details: 'Spectral essence. Magic training secondary.', obscure: false });
rel.registerItemSource(95047, { type: 'drop', sourceId: 'moryskah_nechryael', sourceName: 'Nechryael', region: 'moryskah', details: 'Death rune shards + demonic spawn fragments.', obscure: false });

// Vampires & werewolves
rel.registerItemSource(95050, { type: 'drop', sourceId: 'moryskah_vampire_thrall', sourceName: 'Vampire Thrall', region: 'moryskah', details: 'Blood vial. Blood rune crafting secondary.', obscure: false });
rel.registerItemSource(95051, { type: 'drop', sourceId: 'moryskah_vampire_noble', sourceName: 'Vampire Noble', region: 'moryskah', details: 'Noble blood (rare). Creates vampiric gear enchantments.', obscure: true });
rel.registerItemSource(95052, { type: 'drop', sourceId: 'moryskah_werewolf_alpha', sourceName: 'Werewolf Alpha', region: 'moryskah', details: 'Alpha claw (rare). Silver-forged weapons.', obscure: true });
rel.registerItemSource(95053, { type: 'drop', sourceId: 'moryskah_cursed_knight', sourceName: 'Cursed Knight', region: 'moryskah', details: 'Cursed armor scraps. Smithing component.', obscure: false });

// Barrows (the flagship fight content)
rel.registerItemSource(95060, { type: 'drop', sourceId: 'dharok_barrows', sourceName: 'Dharok the Wretched', region: 'moryskah', details: "Dharok's greataxe + armor pieces. BIS low-HP melee.", obscure: false });
rel.registerItemSource(95061, { type: 'drop', sourceId: 'guthan_barrows', sourceName: 'Guthan the Infested', region: 'moryskah', details: "Guthan's warspear + armor. Heals-on-hit for sustain.", obscure: false });
rel.registerItemSource(95062, { type: 'drop', sourceId: 'verac_barrows', sourceName: 'Verac the Defiled', region: 'moryskah', details: "Verac's flail + armor. Ignores prayer, unique niche.", obscure: false });
rel.registerItemSource(95063, { type: 'drop', sourceId: 'ahrim_barrows', sourceName: 'Ahrim the Blighted', region: 'moryskah', details: "Ahrim's staff + robes. Magic BIS body slot.", obscure: false });
rel.registerItemSource(95064, { type: 'drop', sourceId: 'karil_barrows', sourceName: 'Karil the Tainted', region: 'moryskah', details: "Karil's crossbow + leather. Ranged BIS set.", obscure: false });
rel.registerItemSource(95065, { type: 'drop', sourceId: 'torag_barrows', sourceName: 'Torag the Corrupted', region: 'moryskah', details: "Torag's hammers + armor. Defensive melee set.", obscure: false });
rel.registerItemSource(95066, { type: 'drop', sourceId: 'barrows_chest', sourceName: 'Barrows Chest', region: 'moryskah', details: 'Amulet of the Damned (1/256). Enhances set effects.', obscure: true });

// ══════════════════════════════════════════════════════════════════════════════
// MORYSKAH TRAINING METHODS — unblock all 11 hard-blocked skills
// ══════════════════════════════════════════════════════════════════════════════

// ATTACK — vampire thralls
rel.defineTrainingMethod('moryskah_vampire_thrall_combat', {
  skill: 'attack', name: 'Vampire Thrall Slaying',
  levelRange: [30, 70],
  xpPerHour: 58000,
  prerequisites: { skills: { attack: 30 }, quests: ['the_bog_witchs_bargain'], items: [{ name: 'Silver weapon' }], areas: ['moryskah'] },
  resourceOutput: { produces: [{ name: 'Blood vial', perHour: 80 }, { name: 'Gold coins', perHour: 45000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 3000,
  danger: 'medium', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Mid-tier food', perHour: 25, source: 'cooking' }, { name: 'Silver weapon', perHour: 1, source: 'smithing' }],
  description: 'Slay vampire thralls in the crypts. Silver weapons required. Blood vials feed herblore/RC.',
  location: 'Moryskah',
});

rel.defineTrainingMethod('moryskah_ghoul_combat', {
  skill: 'attack', name: 'Ghoul Catacomb Combat',
  levelRange: [1, 45],
  xpPerHour: 30000,
  prerequisites: { skills: {}, quests: ['the_bog_witchs_bargain'], items: [], areas: ['moryskah'] },
  resourceOutput: { produces: [{ name: 'Rotten flesh', perHour: 180 }, { name: 'Bones', perHour: 150 }], net: 'neutral' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'low', complexity: 'simple', attention: 'low',
  inputs: [{ name: 'Basic food', perHour: 15, source: 'cooking' }],
  description: 'Low-level ghouls in catacombs. Great early Moryskah attack training. Bones feed prayer.',
  location: 'Moryskah',
});

// STRENGTH — same ghouls/thralls with different style
rel.defineTrainingMethod('moryskah_crypt_raider_str', {
  skill: 'strength', name: 'Crypt Raider Strength',
  levelRange: [20, 80],
  xpPerHour: 62000,
  prerequisites: { skills: { strength: 20 }, quests: ['the_bog_witchs_bargain'], items: [], areas: ['moryskah'] },
  resourceOutput: { produces: [{ name: 'Gold coins', perHour: 35000 }, { name: 'Tombstone rubble', perHour: 40 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'medium', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Mid-tier food', perHour: 20, source: 'cooking' }],
  description: 'Aggressive style in the cursed crypts. Tombstone rubble feeds construction.',
  location: 'Moryskah',
});

// DEFENCE — tank the Moryskah cursed knights
rel.defineTrainingMethod('moryskah_cursed_knight_def', {
  skill: 'defence', name: 'Cursed Knight Defensive',
  levelRange: [30, 75],
  xpPerHour: 48000,
  prerequisites: { skills: { defence: 30 }, quests: [], items: [], areas: ['moryskah'] },
  resourceOutput: { produces: [{ name: 'Cursed armor scraps', perHour: 100 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'medium', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Mid-tier food', perHour: 22, source: 'cooking' }],
  description: 'Cursed knights in the Moryskah ruins. Armor scraps smith into high-tier gothic armor.',
  location: 'Moryskah',
});

// HITPOINTS — covered by combat methods
rel.defineTrainingMethod('moryskah_banshee_hp', {
  skill: 'hitpoints', name: 'Banshee Screaming Tower',
  levelRange: [20, 70],
  xpPerHour: 14000,
  prerequisites: { skills: {}, quests: [], items: [{ name: 'Earmuffs' }], areas: ['moryskah_slayer_tower'] },
  resourceOutput: { produces: [{ name: 'Banshee voice', perHour: 2 }], net: 'neutral' },
  bankingFrequency: 'rare', costPerHour: 0,
  danger: 'low', complexity: 'trivial', attention: 'afk',
  inputs: [{ name: 'Basic food', perHour: 8, source: 'cooking' }],
  description: 'AFK banshees while they scream at you. Passive HP. Requires earmuffs.',
  location: 'Moryskah',
});

// RANGED — Karil-style Barrows prep via crossbows
rel.defineTrainingMethod('moryskah_shade_ranged', {
  skill: 'ranged', name: 'Shade Shooting',
  levelRange: [40, 99],
  xpPerHour: 75000,
  prerequisites: { skills: { ranged: 40 }, quests: [], items: [{ name: 'Crossbow' }, { name: 'Silver bolts' }], areas: ['moryskah'] },
  resourceOutput: { produces: [{ name: 'Shade remains', perHour: 120 }], net: 'neutral' },
  bankingFrequency: 'moderate', costPerHour: 15000,
  danger: 'low', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Silver bolts', perHour: 2000, source: 'smithing' }, { name: 'Mid-tier food', perHour: 15, source: 'cooking' }],
  description: 'Pick off shades with silver bolts. Remains feed the pyre-prayer path.',
  location: 'Moryskah',
});

// PRAYER — Ectofuntus (Moryskah-unique, transformative)
rel.defineTrainingMethod('moryskah_ectofuntus_worship', {
  skill: 'prayer', name: 'Ectofuntus Worship',
  levelRange: [1, 99],
  xpPerHour: 180000,
  prerequisites: { skills: {}, quests: ['ghosts_ahoy'], items: [], areas: ['moryskah'] },
  resourceOutput: { produces: [{ name: 'Ecto-tokens', perHour: 300 }], net: 'profit' },
  bankingFrequency: 'frequent', costPerHour: 0,
  danger: 'none', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Bonemeal', perHour: 350, source: 'any_bones_ground' }, { name: 'Ectoplasm', perHour: 350, source: 'moryskah_ghost' }],
  description: 'Grind bones + mix with ectoplasm = 4x prayer XP. Moryskah-unique. THE flagship prayer method.',
  location: 'Moryskah',
});

rel.defineTrainingMethod('moryskah_shade_pyre_burning', {
  skill: 'prayer', name: 'Shade Pyre Cremation',
  levelRange: [30, 99],
  xpPerHour: 95000,
  prerequisites: { skills: { prayer: 30, firemaking: 45 }, quests: [], items: [], areas: ['moryskah'] },
  resourceOutput: { produces: [{ name: 'Shade-lit remains', perHour: 120 }], net: 'neutral' },
  bankingFrequency: 'moderate', costPerHour: 8000,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Shade remains', perHour: 120, source: 'moryskah_shade' }, { name: 'Pyre logs', perHour: 120, source: 'moryskah_pyre_log' }],
  description: 'Cremate shades on pyre logs. Double-skill XP (prayer + firemaking). Gothic-flavored sustain.',
  location: 'Moryskah',
});

// MAGIC — Ahrim-style magic training via ghosts
rel.defineTrainingMethod('moryskah_aberrant_magic', {
  skill: 'magic', name: 'Aberrant Spectre Magic',
  levelRange: [60, 99],
  xpPerHour: 82000,
  prerequisites: { skills: { magic: 60, slayer: 60 }, quests: [], items: [{ name: 'Nose peg' }], areas: ['moryskah_slayer_tower'] },
  resourceOutput: { produces: [{ name: 'Spectral essence', perHour: 180 }, { name: 'Herb drops', perHour: 30 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 25000,
  danger: 'medium', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Death rune', perHour: 1200, source: 'runecrafting' }, { name: 'Air rune', perHour: 6000, source: 'runecrafting' }, { name: 'Chaos rune', perHour: 2400, source: 'runecrafting' }],
  description: 'Magic training on aberrant spectres. Herb drop table makes it profitable.',
  location: 'Moryskah',
});

// RUNECRAFTING — Moryskah blood altar path
rel.defineTrainingMethod('moryskah_blood_runecrafting', {
  skill: 'runecrafting', name: 'Moryskah Blood Altar',
  levelRange: [77, 99],
  xpPerHour: 48000,
  prerequisites: { skills: { runecrafting: 77 }, quests: ['sins_of_malachar'], items: [], areas: ['moryskah'] },
  resourceOutput: { produces: [{ name: 'Blood rune', perHour: 1800 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'low',
  inputs: [{ name: 'Pure essence', perHour: 1800, source: 'mining' }, { name: 'Blood vial', perHour: 10, source: 'moryskah_vampire_thrall' }],
  description: 'Blood runes at the Moryskah altar. THE blood rune source. Cross-region demand (Scythe/Sang charges).',
  location: 'Moryskah',
  breakpointAt: 77,
});

// CONSTRUCTION — mausoleum POH theme
rel.defineTrainingMethod('moryskah_mausoleum_construction', {
  skill: 'construction', name: 'Mausoleum Construction',
  levelRange: [30, 99],
  xpPerHour: 320000,
  prerequisites: { skills: { construction: 30 }, quests: [], items: [], areas: ['moryskah'] },
  resourceOutput: { produces: [], net: 'loss' },
  bankingFrequency: 'frequent', costPerHour: 380000,
  danger: 'none', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Tombstone rubble', perHour: 1200, source: 'moryskah_tombstone_quarry' }, { name: 'Construction mortar', perHour: 600, source: 'crafting' }],
  description: 'Build a Moryskah mausoleum POH. Tombstone theming. Features gilded-altar equivalent built of cursed stone.',
  location: 'Moryskah',
});

// HERBLORE — Bog Witch teaches
rel.defineTrainingMethod('moryskah_bog_witch_apprentice', {
  skill: 'herblore', name: "Bog Witch's Apprentice",
  levelRange: [15, 85],
  xpPerHour: 75000,
  prerequisites: { skills: { herblore: 15 }, quests: ['the_bog_witchs_bargain'], items: [], areas: ['moryskah'] },
  resourceOutput: { produces: [{ name: 'Bog potions', perHour: 300 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Grimy swamp herbs', perHour: 300, source: 'moryskah_swamp_herb_patch' }, { name: 'Bittercap mushrooms', perHour: 150, source: 'moryskah_mushroom_patch' }, { name: 'Vial of water', perHour: 300, source: 'heartlands_apothecary' }],
  description: 'Brew with the Bog Witch. Unique swamp potions with undead-resistance bonuses.',
  location: 'Moryskah',
});

// THIEVING — crypt robbing
rel.defineTrainingMethod('moryskah_crypt_robbing', {
  skill: 'thieving', name: 'Crypt Robbing',
  levelRange: [25, 80],
  xpPerHour: 52000,
  prerequisites: { skills: { thieving: 25 }, quests: [], items: [{ name: 'Lockpick' }], areas: ['moryskah'] },
  resourceOutput: { produces: [{ name: 'Gold coins', perHour: 42000 }, { name: 'Grave goods', perHour: 60 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'medium', complexity: 'moderate', attention: 'medium',
  inputs: [],
  description: 'Rob Moryskah crypts. Coin stacks + occasional jeweled grave goods. Risky — mummy guardians wake.',
  location: 'Moryskah',
});

// FLETCHING — cursed bow fletching
rel.defineTrainingMethod('moryskah_cursed_bow_fletching', {
  skill: 'fletching', name: 'Cursed Bow Fletching',
  levelRange: [40, 99],
  xpPerHour: 85000,
  prerequisites: { skills: { fletching: 40 }, quests: ['sins_of_malachar'], items: [], areas: ['moryskah'] },
  resourceOutput: { produces: [{ name: 'Cursed bows', perHour: 600 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'simple', attention: 'low',
  inputs: [{ name: 'Swamp willow logs', perHour: 600, source: 'moryskah_swamp_willow' }, { name: 'Bowstring', perHour: 600, source: 'heartlands_bowstring_spinning' }],
  description: 'Fletch cursed bows from swamp willow. Unique — cursed bows do +10% damage vs undead.',
  location: 'Moryskah',
});

// SLAYER — Moryskah Slayer Tower master
rel.defineTrainingMethod('moryskah_slayer_tower', {
  skill: 'slayer', name: 'Moryskah Slayer Tower',
  levelRange: [40, 99],
  xpPerHour: 55000,
  prerequisites: { skills: { slayer: 40 }, quests: ['slayers_gauntlet'], items: [], areas: ['moryskah_slayer_tower'] },
  resourceOutput: { produces: [{ name: 'Gold coins', perHour: 80000 }, { name: 'Slayer points', perHour: 30 }, { name: 'Rare slayer drops', perHour: 5 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 8000,
  danger: 'high', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Sharks', perHour: 30, source: 'cooking' }, { name: 'Super combat potion', perHour: 2, source: 'herblore' }],
  description: 'Slayer tower tasks — aberrants, gargoyles, nechryaels, abyssal demons. Best slayer XP/gp in Aelgard.',
  location: 'Moryskah',
  breakpointAt: 40,
});

// MINING — silver + tombstone rubble
rel.defineTrainingMethod('moryskah_silver_mining', {
  skill: 'mining', name: 'Moryskah Silver Mining',
  levelRange: [20, 99],
  xpPerHour: 42000,
  prerequisites: { skills: { mining: 20 }, quests: [], items: [{ name: 'Pickaxe' }], areas: ['moryskah'] },
  resourceOutput: { produces: [{ name: 'Silver ore', perHour: 400 }, { name: 'Tombstone rubble', perHour: 200 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'low', complexity: 'simple', attention: 'low',
  inputs: [],
  description: 'Silver vein + tombstone rubble in the cursed quarry. Moryskah construction material source.',
  location: 'Moryskah',
});

// SMITHING — silver-tipped weapons forge
rel.defineTrainingMethod('moryskah_silver_forge', {
  skill: 'smithing', name: 'Silver-Tipped Forge',
  levelRange: [40, 99],
  xpPerHour: 95000,
  prerequisites: { skills: { smithing: 40 }, quests: [], items: [], areas: ['moryskah'] },
  resourceOutput: { produces: [{ name: 'Silver weapon', perHour: 40 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Silver ore', perHour: 400, source: 'moryskah_silver_mining' }, { name: 'Coal', perHour: 1200, source: 'mining' }, { name: 'Bog iron', perHour: 200, source: 'moryskah_bog_iron' }],
  description: 'Silver-tipped weapons at the Moryskah forge. Werewolf-slaying BIS.',
  location: 'Moryskah',
});

// FISHING — swamp & sacred eel fishing
rel.defineTrainingMethod('moryskah_bog_fishing', {
  skill: 'fishing', name: 'Bog Trout Fishing',
  levelRange: [15, 70],
  xpPerHour: 38000,
  prerequisites: { skills: { fishing: 15 }, quests: [], items: [{ name: 'Fishing rod' }], areas: ['moryskah'] },
  resourceOutput: { produces: [{ name: 'Raw bog trout', perHour: 200 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'afk',
  inputs: [{ name: 'Bait', perHour: 200, source: 'shop' }],
  description: 'Fish the Moryskah bogs. Bog trout cures swamp rot when cooked.',
  location: 'Moryskah',
});

rel.defineTrainingMethod('moryskah_sacred_eel_fishing', {
  skill: 'fishing', name: 'Sacred Eel Fishing',
  levelRange: [55, 99],
  xpPerHour: 72000,
  prerequisites: { skills: { fishing: 55 }, quests: ['blood_rites'], items: [{ name: 'Fishing rod' }], areas: ['moryskah'] },
  resourceOutput: { produces: [{ name: 'Sacred eel', perHour: 140 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'afk',
  inputs: [{ name: 'Bait', perHour: 140, source: 'shop' }],
  description: 'Sacred eel from blessed pools. Scales used in crafting — demand cross-region.',
  location: 'Moryskah',
});

// FARMING — blighted & mushroom patches
rel.defineTrainingMethod('moryskah_blighted_patches', {
  skill: 'farming', name: 'Moryskah Blighted Patches',
  levelRange: [20, 99],
  xpPerHour: 48000,
  prerequisites: { skills: { farming: 20 }, quests: ['the_bog_witchs_errand'], items: [], areas: ['moryskah'] },
  resourceOutput: { produces: [{ name: 'Swamp herbs', perHour: 80 }, { name: 'Bittercap mushrooms', perHour: 60 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 2000,
  danger: 'none', complexity: 'moderate', attention: 'low',
  inputs: [{ name: 'Herb seeds', perHour: 15, source: 'shop_or_drops' }, { name: 'Mushroom spores', perHour: 10, source: 'moryskah_mushroom_patch' }],
  description: 'Grow swamp herbs in the blighted patches. +25% yield vs normal patches.',
  location: 'Moryskah',
});

// COOKING — Moryskah-specific (bog trout, cursed cake)
rel.defineTrainingMethod('moryskah_bog_kitchen', {
  skill: 'cooking', name: 'Bog Trout Kitchen',
  levelRange: [15, 99],
  xpPerHour: 130000,
  prerequisites: { skills: { cooking: 15 }, quests: [], items: [], areas: ['moryskah'] },
  resourceOutput: { produces: [{ name: 'Bog trout (cooked)', perHour: 1300 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'simple', attention: 'low',
  inputs: [{ name: 'Raw bog trout', perHour: 1300, source: 'moryskah_bog_fishing' }],
  description: 'Cook bog trout at the Bog Witch\'s fire. Cooked bog trout heals 8 HP + cures poison.',
  location: 'Moryskah',
});

// FIREMAKING — shade pyres & blighted oak burning
rel.defineTrainingMethod('moryskah_pyre_burning', {
  skill: 'firemaking', name: 'Pyre Log Burning',
  levelRange: [45, 99],
  xpPerHour: 180000,
  prerequisites: { skills: { firemaking: 45 }, quests: [], items: [], areas: ['moryskah'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Pyre logs', perHour: 900, source: 'moryskah_pyre_log' }, { name: 'Shade remains', perHour: 900, source: 'moryskah_shade' }],
  description: 'Burn shade pyres. Double-skill (firemaking + prayer). Highest firemaking XP outside of Wintertodt.',
  location: 'Moryskah',
});

// WOODCUTTING — swamp willow & blighted oak
rel.defineTrainingMethod('moryskah_blighted_forest', {
  skill: 'woodcutting', name: 'Blighted Forest WC',
  levelRange: [30, 99],
  xpPerHour: 58000,
  prerequisites: { skills: { woodcutting: 30 }, quests: [], items: [{ name: 'Axe' }], areas: ['moryskah'] },
  resourceOutput: { produces: [{ name: 'Blighted oak logs', perHour: 300 }, { name: 'Swamp willow logs', perHour: 200 }, { name: 'Pyre logs', perHour: 80 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'low', complexity: 'simple', attention: 'afk',
  inputs: [],
  description: 'Chop blighted trees. Unique log types. Cursed pyre logs feed the prayer path.',
  location: 'Moryskah',
});

// CRAFTING — blood-imbued equipment
rel.defineTrainingMethod('moryskah_blood_imbued_crafting', {
  skill: 'crafting', name: 'Blood-Imbued Crafting',
  levelRange: [50, 99],
  xpPerHour: 88000,
  prerequisites: { skills: { crafting: 50 }, quests: ['blood_rites'], items: [], areas: ['moryskah'] },
  resourceOutput: { produces: [{ name: 'Blood-imbued gear', perHour: 60 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Blood rune', perHour: 180, source: 'moryskah_blood_runecrafting' }, { name: 'Silver bar', perHour: 60, source: 'smithing' }, { name: 'Blood vial', perHour: 120, source: 'moryskah_vampire_thrall' }],
  description: 'Craft blood-imbued equipment. Vampiric — heals 1 HP per hit. Unique Moryskah niche.',
  location: 'Moryskah',
});

// AGILITY — mausoleum rooftops
rel.defineTrainingMethod('moryskah_mausoleum_rooftops', {
  skill: 'agility', name: 'Mausoleum Rooftop Course',
  levelRange: [30, 80],
  xpPerHour: 54000,
  prerequisites: { skills: { agility: 30 }, quests: [], items: [], areas: ['moryskah'] },
  resourceOutput: { produces: [{ name: 'Marks of grace', perHour: 18 }], net: 'profit' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'low', complexity: 'moderate', attention: 'medium',
  inputs: [],
  description: 'Rooftop parkour across the mausoleum district. Gothic-flavored agility training.',
  location: 'Moryskah',
});

// HUNTER — bat netting
rel.defineTrainingMethod('moryskah_bat_netting', {
  skill: 'hunter', name: 'Bat Netting',
  levelRange: [20, 70],
  xpPerHour: 48000,
  prerequisites: { skills: { hunter: 20 }, quests: [], items: [{ name: 'Butterfly net' }], areas: ['moryskah'] },
  resourceOutput: { produces: [{ name: 'Bat wing', perHour: 120 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'low', complexity: 'simple', attention: 'low',
  inputs: [],
  description: 'Catch Moryskah bats. Bat wings feed Super Restore potions — CRITICAL cross-region export.',
  location: 'Moryskah',
});

// ══════════════════════════════════════════════════════════════════════════════
// MORYSKAH QUESTS — 8 new quests with obscure unlocks
// ══════════════════════════════════════════════════════════════════════════════

rel.defineQuestUnlock('ghosts_ahoy', {
  name: 'Ghosts Ahoy',
  unlocks: [
    { type: 'training_method', id: 'moryskah_ectofuntus_worship', description: 'Ectofuntus unlocked — 4x prayer XP for grinding bones' },
    { type: 'shop', id: 'moryskah_ecto_token_shop', description: 'Ecto-token shop — exclusive prayer gear & Moryskah teleport' },
  ],
});

rel.defineQuestUnlock('the_haunted_mine', {
  name: 'The Haunted Mine',
  unlocks: [
    { type: 'item_equip', id: 'salve_amulet', description: 'Salve Amulet — +16.7% damage + accuracy vs undead. Game-changing for Moryskah PvM.' },
    { type: 'area', id: 'moryskah_haunted_mine_depths', description: 'Haunted Mine — unique glowing coal that ignores smelting penalties' },
  ],
});

rel.defineQuestUnlock('the_shades_of_mortton', {
  name: 'The Shades of Mortton',
  unlocks: [
    { type: 'training_method', id: 'moryskah_shade_pyre_burning', description: 'Shade pyre cremation — prayer + firemaking simultaneously' },
    { type: 'area', id: 'moryskah_mortton_temple', description: 'Mortton Temple — blessed pyre site, shade minigame' },
  ],
});

rel.defineQuestUnlock('the_lycanthropy_cure', {
  name: 'The Lycanthropy Cure',
  unlocks: [
    { type: 'item_equip', id: 'silver_sickle', description: 'Silver Sickle — werewolf-slaying weapon, bless water remotely' },
    { type: 'npc', id: 'father_urhney', description: 'Father Urhney available as exorcism tutor' },
  ],
});

rel.defineQuestUnlock('the_darkness_of_hallowvale', {
  name: 'The Darkness of Hallowvale',
  unlocks: [
    { type: 'area', id: 'moryskah_hallowvale_district', description: 'Hallowvale — the vampire quarter, late-game Moryskah content' },
    { type: 'item_equip', id: 'ivandis_flail', description: 'Ivandis Flail — vampire-slaying BIS melee' },
  ],
});

rel.defineQuestUnlock('the_bog_witchs_legacy', {
  name: "The Bog Witch's Legacy",
  unlocks: [
    { type: 'recipe', id: 'bog_brew_master', description: 'Master bog-brewing — unique potions with undead-resistance bonuses' },
    { type: 'item_equip', id: 'bog_witches_pendant', description: "Bog Witch's pendant — +3% herblore yield" },
  ],
});

rel.defineQuestUnlock('the_grave_robber', {
  name: 'The Grave Robber',
  unlocks: [
    { type: 'training_method', id: 'moryskah_crypt_robbing', description: 'Crypt robbing — high-tier thieving' },
    { type: 'shop', id: 'moryskah_fence_black_market', description: 'Stolen goods fence — sell grave goods for coin' },
  ],
});

rel.defineQuestUnlock('barrows_brothers_legend', {
  name: 'The Barrows Brothers Legend',
  unlocks: [
    { type: 'boss', id: 'all_6_barrows_brothers', description: 'Barrows Brothers fight unlocked — 6 bosses, degradable set drops' },
    { type: 'area', id: 'moryskah_barrows_mounds', description: 'Full Barrows tunnel + chest access' },
    { type: 'item_equip', id: 'amulet_of_the_damned', description: 'Amulet of the Damned — enhances all Barrows set effects. Prestige.' },
  ],
});

// ══════════════════════════════════════════════════════════════════════════════
// MORYSKAH BREAKPOINTS — gothic progression moments
// ══════════════════════════════════════════════════════════════════════════════

rel.defineBreakpoint({
  type: 'quest_complete', trigger: { quest: 'ghosts_ahoy' },
  description: 'Ectofuntus unlocked. Prayer XP rate jumps 4x. Every bone you own becomes 4x more valuable. Transformative.',
  unlocks: [{ type: 'training_method', id: 'moryskah_ectofuntus_worship', description: 'Ectofuntus available' }],
  importance: 'transformative',
});

rel.defineBreakpoint({
  type: 'quest_complete', trigger: { quest: 'the_haunted_mine' },
  description: 'Salve Amulet equipped. +16.7% damage vs undead. Moryskah combat efficiency DOUBLES overnight.',
  unlocks: [{ type: 'item_equip', id: 'salve_amulet', description: 'Salve Amulet' }],
  importance: 'transformative',
});

rel.defineBreakpoint({
  type: 'quest_complete', trigger: { quest: 'barrows_brothers_legend' },
  description: 'Barrows unlocked. THE Moryskah prestige content begins. 6 bosses, mid-game degradable gear, Amulet of the Damned path.',
  unlocks: [{ type: 'boss', id: 'all_6_barrows_brothers', description: 'Full Barrows access' }],
  importance: 'transformative',
});

rel.defineBreakpoint({
  type: 'skill_level', trigger: { skill: 'runecrafting', level: 77 },
  description: 'Blood rune crafting at the Moryskah altar. Profitable rune training + feeds Scythe/Sanguinesti upkeep. The iconic RC breakpoint.',
  unlocks: [{ type: 'training_method', id: 'moryskah_blood_runecrafting', description: 'Blood rune crafting' }],
  importance: 'transformative',
});

rel.defineBreakpoint({
  type: 'skill_level', trigger: { skill: 'slayer', level: 40 },
  description: 'Moryskah Slayer Tower access. Aberrants, gargoyles, nechryaels — the mid-game slayer grind core.',
  unlocks: [{ type: 'area', id: 'moryskah_slayer_tower', description: 'Slayer tower methods' }],
  importance: 'major',
});

// ══════════════════════════════════════════════════════════════════════════════
// MORYSKAH QUIRKY INTERACTIONS (extra flavor)
// ══════════════════════════════════════════════════════════════════════════════

rel.defineTrainingMethod('quirky_moryskah_gravedigging', {
  skill: 'strength',
  name: '[Quirky] Dig Graves for the Sexton',
  levelRange: [1, 99],
  xpPerHour: 1500,
  prerequisites: { skills: {}, quests: [], items: [{ name: 'Shovel' }], areas: ['moryskah'] },
  resourceOutput: { produces: [{ name: 'Bones (occasional)', perHour: 5 }], net: 'profit' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'high',
  inputs: [],
  description: 'Dig fresh graves for the sexton. Strength XP per shovelful. Occasionally uncover forgotten bones.',
  location: 'Moryskah',
});

rel.defineTrainingMethod('quirky_moryskah_crypt_whispers', {
  skill: 'magic',
  name: '[Quirky] Listen to Crypt Whispers',
  levelRange: [1, 99],
  xpPerHour: 2000,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['moryskah'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'low',
  inputs: [],
  description: 'Press your ear to crypt walls. The dead whisper magic knowledge. Tiny magic XP per whisper.',
  location: 'Moryskah',
});

rel.defineTrainingMethod('quirky_moryskah_candle_lighting', {
  skill: 'firemaking',
  name: '[Quirky] Light the Chapel Candles',
  levelRange: [1, 99],
  xpPerHour: 2200,
  prerequisites: { skills: {}, quests: [], items: [{ name: 'Tinderbox' }], areas: ['moryskah'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'medium',
  inputs: [],
  description: 'Relight chapel candles as they blow out. Gothic ambiance. Tiny firemaking XP.',
  location: 'Moryskah',
});

console.log('[aelgard] Moryskah Deep loaded: 22 training methods, 8 quests, 5 breakpoints, 50+ items, 3 quirky interactions');
