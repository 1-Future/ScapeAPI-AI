// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Combinations Mega Pack (burn v2)
//
// "New boss drops a reagent. The reagent has to be combined with the OLD
//  version of the item to create the new, more powerful item. Old content
//  stays alive." — Marstead / Manifesto principle 3
//
// 50+ reagent combinations filling the gaps identified in the item web:
//   1. Every boss drop has either a BiS niche OR a reagent use
//   2. Cross-region combinations (boss X drop + boss Y drop + skill Z)
//   3. Tier-up chains (bronze -> iron -> steel -> ... -> region endgame)
//   4. Old items REQUIRED, never strictly replaced
//
// Voice: each combo named in-world — Cold-Iron Reforging, Bog Witch's Infusion,
//        Salt-Cured Edge Temper, Mooncourt Runic Binding, etc.
//
// All IDs in the 95000-95999 block for mega-combo outputs. Reagent inputs
// reference existing boss drops, skill materials, and region-native stock
// from the density files. Nothing new replaces anything — the OLD item is
// always an input (reagent rule) so the content that drops it stays relevant.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const rel = require('../../data/relationships');

let comboCount = 0;
function c(resultId, opts) {
  rel.defineCombination(resultId, opts);
  comboCount++;
}

// ══════════════════════════════════════════════════════════════════════════════
// TIER 1 — MORYSKAH: Bog-Witch Infusions (undead-flavored reagents)
// Moryskah drops: bat wing (95191 ectoplasm / 95116 dragon bones), silver bolts.
// Each combo keeps the OLD weapon alive as a reagent, never discards it.
// ══════════════════════════════════════════════════════════════════════════════

c(95001, {
  resultName: 'Bog-Witch Tempered Scimitar',
  inputs: [
    { id: 430, name: 'Mithril scimitar', consumed: true },         // OLD weapon kept
    { id: 95191, name: 'Ectoplasm', consumed: true },              // Moryskah ghost drop
    { id: 95114, name: 'Silver bar', consumed: true },             // Moryskah silver
  ],
  skill: 'smithing', level: 52, xp: 180, station: 'anvil',
  description: "Bog-Witch's Infusion. Mithril scimitar bathed in ectoplasm and silver. +15% damage vs undead; the old mithril stays in the chain forever.",
});

c(95002, {
  resultName: 'Bog-Witch Prayer Amulet',
  inputs: [
    { id: 70142, name: 'Holy symbol', consumed: true },            // OLD crafted symbol kept
    { id: 95116, name: 'Cursed dragon bones', consumed: true },    // Moryskah wyrm drop
    { id: 95120, name: "Bog Witch's Super Combat Brew", consumed: true },
  ],
  skill: 'prayer', level: 55, xp: 240, station: 'altar',
  description: "Bog-Witch's consecration. Holy symbol bound with wyrm bone ash. +2 prayer bonus stacking with holy symbol.",
});

c(95003, {
  resultName: 'Silver-Wracked Bolts (10)',
  inputs: [
    { id: 70173, name: 'Rune arrowheads', consumed: true },        // OLD smithed heads kept
    { id: 95113, name: 'Moryskah silver bolts', consumed: true },  // Moryskah-forged
    { id: 95191, name: 'Ectoplasm', consumed: true },
  ],
  skill: 'fletching', level: 68, xp: 85,
  description: "Silver-Wracked Ranging. Rune heads alloyed with ectoplasm-silver. +40% vs vampiric slayer targets.",
});

c(95004, {
  resultName: 'Moryskah Death-Binder Staff',
  inputs: [
    { id: 11305, name: 'Mystic staff', consumed: true },           // OLD quest-staff kept
    { id: 95140, name: 'Moryskah death rune', consumed: true },
    { id: 95116, name: 'Cursed dragon bones', consumed: true },
  ],
  skill: 'magic', level: 60, xp: 150, station: 'altar',
  description: "Moryskah Death-Binding. Mystic staff wired with crypt runes. Auto-casts smoke barrage at reduced rune cost.",
});

// ══════════════════════════════════════════════════════════════════════════════
// TIER 2 — SALTBRINE: Salt-Cured Edge Tempers (pirate/sea reagents)
// Saltbrine drops: wreck iron (96401), saltpetre (96402), brine crystal (96405).
// ══════════════════════════════════════════════════════════════════════════════

c(95010, {
  resultName: 'Salt-Cured Cutlass',
  inputs: [
    { id: 450, name: 'Rune scimitar', consumed: true },            // OLD rune weapon kept
    { id: 96401, name: 'Wreck iron', consumed: true },             // Saltbrine salvage
    { id: 96405, name: 'Brine crystal', consumed: true },
  ],
  skill: 'smithing', level: 70, xp: 400, station: 'anvil',
  description: "Salt-Cured Edge Temper. Rune scimitar reforged with wreck-iron and brine. +12% vs sea-creatures; never rusts at sea.",
});

c(95011, {
  resultName: 'Storm-Touched Crossbow',
  inputs: [
    { id: 96661, name: 'Saltbrine crossbow', consumed: true },     // Saltbrine-forged
    { id: 96621, name: 'Saltbrine air rune', consumed: true },     // Storm-altar
    { id: 580, name: 'Bowstring', consumed: true },                // OLD crafted string
  ],
  skill: 'fletching', level: 65, xp: 220,
  description: "Storm-Touched Charging. Cannon-foundry crossbow runed with storm-altar air runes. Auto-crit in thunderstorms.",
});

c(95012, {
  resultName: 'Sea-Shot Godbolts (5)',
  inputs: [
    { id: 96503, name: 'Sea-shot bolts', consumed: true },
    { id: 91050, name: 'Godsword shard 1', consumed: true },       // GWD shard reagent
    { id: 96665, name: 'Sunken coal', consumed: true },
  ],
  skill: 'smithing', level: 82, xp: 320, station: 'anvil',
  description: "Godbolt Casting. Sea-shot bolts tipped with godsword-shard splinters. BiS crossbow ammo vs GWD minions.",
});

c(95013, {
  resultName: "Captain's Diving Cuirass",
  inputs: [
    { id: 515, name: 'Rune platebody', consumed: true },           // OLD rune armor kept
    { id: 96662, name: 'Diving mask', consumed: true },            // Saltbrine-exclusive
    { id: 96664, name: 'Pirate gold bar', consumed: true },
  ],
  skill: 'crafting', level: 78, xp: 420,
  description: "Captain's Reinforcement. Rune platebody fitted with dive-rated sharkhide panels. Immunity to drowning while equipped.",
});

c(95014, {
  resultName: 'Lighthouse-Signal Amulet',
  inputs: [
    { id: 70132, name: 'Ring of dueling(8)', consumed: true },
    { id: 96400, name: 'Tidestone', consumed: true },              // Saltbrine mineral
    { id: 96611, name: "Brewer's Quay prayer potion", consumed: true },
  ],
  skill: 'magic', level: 64, xp: 175,
  description: "Signal-Fire Enchantment. Dueling ring welded into a lighthouse pendant. Teleports you to last-seen lighthouse.",
});

// ══════════════════════════════════════════════════════════════════════════════
// TIER 3 — VEILWOOD: Mooncourt Runic Bindings (elven/moon/crystal reagents)
// Veilwood drops: crystal shards (92052), moonsilk bowstring (96701), thinkberry flour (96702).
// ══════════════════════════════════════════════════════════════════════════════

c(95020, {
  resultName: 'Moonsilk Shortbow',
  inputs: [
    { id: 70162, name: 'Yew shortbow', consumed: true },           // OLD fletched bow kept
    { id: 96701, name: 'Moonsilk bowstring', consumed: true },
    { id: 92052, name: 'Crystal shard', consumed: true },
  ],
  skill: 'fletching', level: 72, xp: 250,
  description: "Mooncourt Runic Binding. Yew shortbow re-strung with moonsilk and crystal-shot. Attacks at night crit for +40%.",
});

c(95021, {
  resultName: 'Mirror-Shard Shield',
  inputs: [
    { id: 535, name: 'Rune full helm', consumed: true },           // OLD rune plate kept
    { id: 98253, name: 'Mirror-hide', consumed: true },            // Inkweald drop
    { id: 92052, name: 'Crystal shard', consumed: true },
    { id: 92052, name: 'Crystal shard', consumed: true },
  ],
  skill: 'smithing', level: 75, xp: 350, station: 'anvil',
  description: "Mirror-Shard Forging. Rune helm-stock reshaped into a reflector. Reflects one spell per combat — BiS vs mage bosses.",
});

c(95022, {
  resultName: 'Thinkberry Pastry (cooked)',
  inputs: [
    { id: 96702, name: 'Thinkberry flour', consumed: true },
    { id: 70215, name: 'Monkfish', consumed: true },               // OLD cooked food kept
    { id: 96703, name: 'Moonlit bait', consumed: true },
  ],
  skill: 'cooking', level: 71, xp: 210, station: 'range',
  description: "Mooncourt Pastry. Thinkberry flour layered over monkfish. Heals 18 + 1 magic level for 10 min.",
});

c(95023, {
  resultName: 'Crystal-Seed Halberd',
  inputs: [
    { id: 92010, name: 'Dragon hunter lance', consumed: true },    // OLD lance kept (reagent chain!)
    { id: 92051, name: 'Crystal weapon seed', consumed: true },
    { id: 92052, name: 'Crystal shard', consumed: true },
    { id: 92052, name: 'Crystal shard', consumed: true },
    { id: 92052, name: 'Crystal shard', consumed: true },
  ],
  skill: 'smithing', level: 88, xp: 560, station: 'anvil',
  description: "Crystal-Seed Halberdry. Dragon hunter lance re-cored with crystal seed. BiS 2H vs dragons AND crystal wyrms.",
});

c(95024, {
  resultName: 'Druid-Song Pendant',
  inputs: [
    { id: 70136, name: 'Skills necklace(4)', consumed: true },
    { id: 96713, name: 'Druid prayer potion', consumed: true },    // Veilwood druid brew
    { id: 96705, name: 'Elven flax', consumed: true },
  ],
  skill: 'crafting', level: 74, xp: 195,
  description: "Druid-Song Weaving. Skills necklace wound in elven flax. +1 to all skill teleport targets; moon-phase bonus.",
});

// ══════════════════════════════════════════════════════════════════════════════
// TIER 4 — SOOTWORKS: Cold-Iron Reforgings (industrial/clockwork reagents)
// Sootworks drops: soot-iron bar (7002), deep coal (97201), clockwork heretic drops.
// ══════════════════════════════════════════════════════════════════════════════

c(95030, {
  resultName: 'Cold-Iron Warhammer',
  inputs: [
    { id: 7002, name: 'Soot-iron bar', consumed: true },
    { id: 7002, name: 'Soot-iron bar', consumed: true },
    { id: 7002, name: 'Soot-iron bar', consumed: true },
    { id: 97252, name: 'Clockwork dragon bones', consumed: true }, // Boss drop as reagent
    { id: 455, name: 'Rune warhammer', consumed: true },           // OLD rune hammer kept
  ],
  skill: 'smithing', level: 80, xp: 450, station: 'anvil',
  description: "Cold-Iron Reforging. Rune warhammer re-forged with soot-iron and clockwork dust. +20% crush; pierces brass-plate.",
});

c(95031, {
  resultName: 'Pressure-Tipped Crossbow Bolts (20)',
  inputs: [
    { id: 97270, name: 'Pressure-tip bolts', consumed: true },
    { id: 70172, name: 'Adamant arrowheads', consumed: true },     // OLD arrowheads kept
    { id: 97201, name: 'Deep coal', consumed: true },
  ],
  skill: 'fletching', level: 70, xp: 175,
  description: "Pressure-Coiling. Pressure bolts capped with adamant heads and coal-rammed. Explode on impact — BiS PvM ammo.",
});

c(95032, {
  resultName: 'Steam-Cured Mithril Platebody',
  inputs: [
    { id: 513, name: 'Mithril platebody', consumed: true },        // OLD mith plate kept
    { id: 97232, name: 'Dwarven stout', consumed: true },
    { id: 97231, name: 'Steam-cured cave-fish', consumed: true },
  ],
  skill: 'smithing', level: 68, xp: 320, station: 'anvil',
  description: "Steam Pressure Forging. Mithril platebody steam-cured and beer-quenched. +1 mining/smithing when worn, mid-game ironman chase.",
});

c(95033, {
  resultName: 'Clockwork Heretic Rune',
  inputs: [
    { id: 97252, name: 'Clockwork dragon bones', consumed: true }, // Boss drop as reagent
    { id: 280, name: 'Blood rune', consumed: true },               // OLD RC rune kept
    { id: 280, name: 'Blood rune', consumed: true },
    { id: 97263, name: 'Soot-cant death scroll', consumed: true },
  ],
  skill: 'runecrafting', level: 82, xp: 400, station: 'altar',
  description: "Heretic-Rune Binding. Clockwork heretic's bone-gear ground and inked into blood runes. 3 auto-casts of Smoke Barrage.",
});

c(95034, {
  resultName: 'Brass-Choir Holy Relic',
  inputs: [
    { id: 97216, name: 'Sootworks silver bar', consumed: true },
    { id: 97216, name: 'Sootworks silver bar', consumed: true },
    { id: 70142, name: 'Holy symbol', consumed: true },            // OLD holy symbol kept
    { id: 97241, name: 'Sootworks super-combat brew', consumed: true },
  ],
  skill: 'prayer', level: 72, xp: 520, station: 'altar',
  description: "Brass-Choir Reliquary. Holy symbol cased in silver pipe-work. +4 prayer, +1 magic defence; works for Ectofuntus too.",
});

// ══════════════════════════════════════════════════════════════════════════════
// TIER 5 — BONEYARD WASTES: Sun-Baked Consecrations (desert/anti-undead reagents)
// Boneyard drops: sand-hawk feather (96502), pyramid dragon bones (96507), silver bolts.
// ══════════════════════════════════════════════════════════════════════════════

c(95040, {
  resultName: 'Sun-Baked Bone Scimitar',
  inputs: [
    { id: 440, name: 'Adamant scimitar', consumed: true },         // OLD adamant kept
    { id: 96506, name: 'Dust-hound bones', consumed: true },
    { id: 96506, name: 'Dust-hound bones', consumed: true },
    { id: 96525, name: 'Boneyard silver ore', consumed: true },
  ],
  skill: 'smithing', level: 66, xp: 280, station: 'anvil',
  description: "Sun-Baked Consecration. Adamant scimitar inlaid with dust-hound bone and silver. +25% vs undead, never rusts.",
});

c(95041, {
  resultName: 'Pyramid Dragon Pendant',
  inputs: [
    { id: 70124, name: 'Diamond amulet (u)', consumed: true },
    { id: 96507, name: 'Pyramid dragon bones', consumed: true },
    { id: 96520, name: 'Boneyard air rune', consumed: true },
    { id: 96520, name: 'Boneyard air rune', consumed: true },
  ],
  skill: 'magic', level: 78, xp: 310,
  description: "Pyramid Sanctification. Diamond amulet set over a pyramid dragon fang. Passive life-steal 3% at desert bosses.",
});

c(95042, {
  resultName: 'Sand-Hawk Arrows (25)',
  inputs: [
    { id: 341, name: 'Headless arrow', consumed: true },           // OLD fletched shaft kept
    { id: 96502, name: 'Sand-hawk feather', consumed: true },
    { id: 70173, name: 'Rune arrowheads', consumed: true },
  ],
  skill: 'fletching', level: 75, xp: 240,
  description: "Sand-Hawk Fletching. Rune arrows fletched with sand-hawk feathers. +15% accuracy; cuts through sandstorms.",
});

c(95043, {
  resultName: 'Salted Super-Combat (4)',
  inputs: [
    { id: 12100, name: 'Super combat potion(4)', consumed: true }, // OLD super combat kept
    { id: 96516, name: "Parched Prophet's super combat", consumed: true },
    { id: 96519, name: 'Sand-jerky', consumed: true },
  ],
  skill: 'herblore', level: 80, xp: 380,
  description: "Salted Super-Combat Brew. Standard super combat cross-steeped with prophet's brew. +1 all combat stats for 12 min.",
});

c(95044, {
  resultName: 'Tomb-Raider Boots',
  inputs: [
    { id: 96513, name: 'Dune-silk bowstring', consumed: true },
    { id: 96527, name: 'Petrified-palm log', consumed: true },
    { id: 96530, name: 'Bone-bound iron nails', consumed: true },
  ],
  skill: 'crafting', level: 62, xp: 160,
  description: "Tomb-Raider Stitchwork. Light desert boots. +10% run energy in Boneyard; +1 thieving when worn. Unique slot use.",
});

// ══════════════════════════════════════════════════════════════════════════════
// TIER 6 — INKWEALD: Dream-Forge Weldings (surreal/magic-heavy reagents)
// Inkweald drops: dream-iron (98530), mirror-hide (98253), unsaid-name (98593).
// ══════════════════════════════════════════════════════════════════════════════

c(95050, {
  resultName: 'Dream-Iron Longsword',
  inputs: [
    { id: 441, name: 'Adamant longsword', consumed: true },        // OLD adamant kept
    { id: 98530, name: 'Dream-iron bar', consumed: true },
    { id: 98530, name: 'Dream-iron bar', consumed: true },
    { id: 98593, name: 'Unsaid-name', consumed: true },
  ],
  skill: 'smithing', level: 82, xp: 490, station: 'anvil',
  description: "Dream-Forge Welding. Adamant longsword re-cored with dream-iron. Damage scales with your current dream-tick stat.",
});

c(95051, {
  resultName: 'Glass-Iron Ghostshield',
  inputs: [
    { id: 98531, name: 'Glass-iron bar', consumed: true },
    { id: 92020, name: 'Dragonfire shield', consumed: true },      // OLD DFS kept
    { id: 98561, name: 'Magpie feather', consumed: true },
    { id: 98561, name: 'Magpie feather', consumed: true },
  ],
  skill: 'smithing', level: 92, xp: 720, station: 'anvil',
  description: "Glass-Iron Plating. DFS core re-housed in glass-iron. Transparent, reflects dreamfire, blocks magpie name-steal.",
});

c(95052, {
  resultName: 'Lucid Prayer Potion (4)',
  inputs: [
    { id: 335, name: 'Prayer potion(4)', consumed: true },         // OLD prayer potion kept
    { id: 98597, name: 'Lucid potion', consumed: true },
    { id: 98593, name: 'Unsaid-name', consumed: true },
  ],
  skill: 'herblore', level: 88, xp: 420,
  description: "Lucid Brewing. Prayer potion dream-infused with unsaid-name. Restores prayer +10 lucidity (ignore phase-shift bosses).",
});

c(95053, {
  resultName: 'Mirror-Memory Dagger',
  inputs: [
    { id: 430, name: 'Mithril scimitar', consumed: true },         // OLD mith kept
    { id: 98253, name: 'Mirror-hide', consumed: true },
    { id: 98592, name: 'Dream drake bones', consumed: true },
  ],
  skill: 'smithing', level: 58, xp: 230, station: 'anvil',
  description: "Mirror-Memory Tempering. Mithril scimitar re-ground against mirror-hide. Special: reverses opponent's last hit.",
});

c(95054, {
  resultName: 'Singing-Soft Longbow',
  inputs: [
    { id: 70166, name: 'Yew longbow', consumed: true },            // OLD yew kept
    { id: 98541, name: 'Singing-soft bowstring', consumed: true },
    { id: 98561, name: 'Magpie feather', consumed: true },
    { id: 98561, name: 'Magpie feather', consumed: true },
  ],
  skill: 'fletching', level: 80, xp: 300,
  description: "Singing-Soft Restring. Yew longbow re-strung with dream-thread. Arrow hums before firing — 1-tile AoE splash.",
});

// ══════════════════════════════════════════════════════════════════════════════
// TIER 7 — GLASS DESERT: Witness-Wall Consecrations (endgame crystal reagents)
// Glass Desert drops: crystal coal (98900), prism-diamond (98980), edge-keeper bones (98951).
// ══════════════════════════════════════════════════════════════════════════════

c(95060, {
  resultName: 'Witness-Wall Crystal Scimitar',
  inputs: [
    { id: 450, name: 'Rune scimitar', consumed: true },            // OLD rune kept
    { id: 98915, name: 'Crystal-lens rune bar', consumed: true },
    { id: 92052, name: 'Crystal shard', consumed: true },
    { id: 92052, name: 'Crystal shard', consumed: true },
    { id: 98951, name: 'Edge-Keeper bones', consumed: true },      // Boss drop reagent
  ],
  skill: 'smithing', level: 94, xp: 820, station: 'anvil',
  description: "Witness-Wall Consecration. Rune scimitar glass-forged under three lenses. BiS vs corruption; cannot be carried past Witness Wall without key.",
});

c(95061, {
  resultName: 'Prism-Shot Crossbow (charged)',
  inputs: [
    { id: 26008, name: 'Armadyl crossbow', consumed: true },       // OLD BIS crossbow kept
    { id: 98972, name: 'Prism-shot bolts', consumed: true },
    { id: 98980, name: 'Uncut prism-diamond', consumed: true },
  ],
  skill: 'crafting', level: 92, xp: 650,
  description: "Prism-Refraction Rigging. Armadyl xbow fitted with a prism lens. Bolts chain between 3 adjacent targets. BiS ranged at GWD-era bosses.",
});

c(95062, {
  resultName: 'Lens-Onyx Amulet of Fury',
  inputs: [
    { id: 70124, name: 'Diamond amulet (u)', consumed: true },     // OLD amulet kept
    { id: 98981, name: 'Uncut lens-onyx', consumed: true },
    { id: 98940, name: 'Crystal super-restore', consumed: true },
  ],
  skill: 'crafting', level: 90, xp: 780,
  description: "Lens-Onyx Setting. Diamond amulet recut with lens-onyx heart. +10% all combat styles; endgame BIS amulet niche.",
});

c(95063, {
  resultName: 'Anti-Corruption Light Arrows (40)',
  inputs: [
    { id: 70177, name: 'Rune arrows', consumed: true },            // OLD rune arrows kept
    { id: 98971, name: 'Light-arrows (unfinished)', consumed: true },
    { id: 98962, name: 'Crystal fire rune', consumed: true },
    { id: 98962, name: 'Crystal fire rune', consumed: true },
  ],
  skill: 'fletching', level: 85, xp: 480,
  description: "Light-Fletching. Rune arrows prism-refractured with crystal fire runes. +50% damage vs Moryskah/Inkweald bestiary.",
});

c(95064, {
  resultName: 'Anti-Corruption Brew (4)',
  inputs: [
    { id: 98942, name: 'Anti-corruption brew', consumed: true },
    { id: 70195, name: 'Saradomin brew(4)', consumed: true },      // OLD sara brew kept
    { id: 98922, name: 'Lens snapdragon', consumed: true },
  ],
  skill: 'herblore', level: 91, xp: 510,
  description: "Witness-Wall Brewing. Saradomin brew lens-steeped with anti-corruption. Negates corruption DoTs for 4 min per dose.",
});

// ══════════════════════════════════════════════════════════════════════════════
// TIER 8 — CROSS-REGION COMBINATIONS (boss X + boss Y + skill Z = new BiS)
// The keystone gap-fillers. These require drops from MULTIPLE regions, forcing
// the player through every biome and keeping every boss valuable forever.
// ══════════════════════════════════════════════════════════════════════════════

c(95070, {
  resultName: 'Tri-Region Slayer Helm',
  inputs: [
    { id: 93010, name: 'Barrows Gloves', consumed: false },        // RFD quest - NOT consumed
    { id: 95116, name: 'Cursed dragon bones', consumed: true },    // Moryskah
    { id: 96507, name: 'Pyramid dragon bones', consumed: true },   // Boneyard
    { id: 98592, name: 'Dream drake bones', consumed: true },      // Inkweald
  ],
  skill: 'slayer', level: 55, xp: 1200,
  description: "Tri-Region Slayer Rite. Three regional dragon bones bound by Barrows glove touch. +10% slayer XP globally; keeps all three bosses relevant.",
});

c(95071, {
  resultName: 'Abyssal Tentacle-of-Dreams Whip',
  inputs: [
    { id: 92001, name: 'Tentacle whip', consumed: true },          // OLD upgraded whip kept
    { id: 98530, name: 'Dream-iron bar', consumed: true },         // Inkweald
    { id: 96405, name: 'Brine crystal', consumed: true },          // Saltbrine
    { id: 92052, name: 'Crystal shard', consumed: true },          // Veilwood
  ],
  skill: 'smithing', level: 95, xp: 950, station: 'anvil',
  description: "Four-Region Whipbinding. Tentacle whip re-wrapped in dream-iron, brine, and crystal. BiS melee DPS in the Wilds.",
});

c(95072, {
  resultName: 'Saradomin-Zamorak Hybrid Godsword',
  inputs: [
    { id: 91001, name: 'Saradomin hilt', consumed: true },         // GWD drop
    { id: 91002, name: 'Zamorak hilt', consumed: true },           // GWD drop
    { id: 91005, name: 'Godsword blade', consumed: true },         // Assembled blade
    { id: 98593, name: 'Unsaid-name', consumed: true },            // Inkweald
  ],
  skill: 'smithing', level: 90, xp: 1500, station: 'anvil',
  description: "Heretic's Godforge. Both god hilts fused by unsaid-name. Special alternates: heal-on-hit AND freeze. Requires Inkweald quest.",
});

c(95073, {
  resultName: 'Phoenix-Ashing Amulet',
  inputs: [
    { id: 70119, name: 'Ruby necklace', consumed: true },          // OLD crafted necklace kept
    { id: 99001, name: 'Fire cape', consumed: false },             // Fight Caves prestige - NOT consumed
    { id: 98951, name: 'Edge-Keeper bones', consumed: true },      // Glass Desert boss
    { id: 97252, name: 'Clockwork dragon bones', consumed: true }, // Sootworks boss
  ],
  skill: 'magic', level: 85, xp: 680, station: 'altar',
  description: "Phoenix-Ashing Consecration. Ruby necklace touched to the Fire Cape. Once-per-day auto-resurrect; keeps Fight Caves forever relevant.",
});

c(95074, {
  resultName: 'Blood-Spiced Crystal Halberd',
  inputs: [
    { id: 95023, name: 'Crystal-seed halberd', consumed: true },   // Veilwood reagent chain!
    { id: 280, name: 'Blood rune', consumed: true },
    { id: 280, name: 'Blood rune', consumed: true },
    { id: 280, name: 'Blood rune', consumed: true },
    { id: 98964, name: 'Crystal blood rune', consumed: true },     // Glass Desert variant
  ],
  skill: 'smithing', level: 97, xp: 1100, station: 'anvil',
  description: "Blood-Spiced Tempering. Crystal halberd recharged with blood runes AND crystal blood. +2 tile reach, heal-on-hit 2HP/swing.",
});

// ══════════════════════════════════════════════════════════════════════════════
// TIER 9 — UPGRADE CHAIN ENDS: Region-Specific Endgame Weapons
// For each region, a single pinnacle weapon requiring deep reagent investment.
// These are the "barrows+" endgame tier per region, per manifesto principle 2.
// ══════════════════════════════════════════════════════════════════════════════

c(95080, {
  resultName: 'Heartlands Kingsblade',
  inputs: [
    { id: 450, name: 'Rune scimitar', consumed: true },            // OLD starter-endgame kept
    { id: 450, name: 'Rune scimitar', consumed: true },
    { id: 91006, name: 'Saradomin godsword', consumed: true },     // OLD GWD gear kept
    { id: 93010, name: 'Barrows Gloves', consumed: false },        // RFD prestige
  ],
  skill: 'smithing', level: 85, xp: 740, station: 'anvil',
  description: "Heartlands Kingsblade Forging. Two rune scimitars and a godsword fused by royal decree. Heartlands prestige weapon; +1 prayer-on-hit.",
});

c(95081, {
  resultName: 'Moryskah Deathbringer',
  inputs: [
    { id: 95001, name: 'Bog-Witch tempered scimitar', consumed: true }, // Moryskah tier-1 reagent chain
    { id: 95116, name: 'Cursed dragon bones', consumed: true },
    { id: 95116, name: 'Cursed dragon bones', consumed: true },
    { id: 95140, name: 'Moryskah death rune', consumed: true },
    { id: 95140, name: 'Moryskah death rune', consumed: true },
  ],
  skill: 'smithing', level: 92, xp: 890, station: 'anvil',
  description: "Moryskah Deathbringer Rite. Bog-witch tempered scim blood-fed on deathrune. BiS vs vampiric slayer tier; sustains Moryskah's reagent chain.",
});

c(95082, {
  resultName: 'Saltbrine Leviathan Harpoon',
  inputs: [
    { id: 95010, name: 'Salt-cured cutlass', consumed: true },     // Saltbrine tier-1 reagent chain
    { id: 96502, name: 'Cannon-ball', consumed: true },
    { id: 96502, name: 'Cannon-ball', consumed: true },
    { id: 96405, name: 'Brine crystal', consumed: true },
    { id: 96664, name: 'Pirate gold bar', consumed: true },
  ],
  skill: 'smithing', level: 90, xp: 860, station: 'anvil',
  description: "Saltbrine Leviathan Rite. Cutlass refitted as a harpoon, cannon-balled for reach. BiS vs sea-giant bosses; charged by cannon-balls.",
});

c(95083, {
  resultName: 'Veilwood Moon-Reaver',
  inputs: [
    { id: 95020, name: 'Moonsilk shortbow', consumed: true },      // Veilwood tier-1 chain
    { id: 92050, name: 'Crystal bow', consumed: true },
    { id: 92052, name: 'Crystal shard', consumed: true },
    { id: 92052, name: 'Crystal shard', consumed: true },
    { id: 92052, name: 'Crystal shard', consumed: true },
  ],
  skill: 'fletching', level: 94, xp: 950,
  description: "Veilwood Moon-Reaver Rite. Crystal bow re-strung through moonsilk bow. BiS ranged at moonrise; degrades — recharge with moonlit bait.",
});

c(95084, {
  resultName: 'Sootworks Boiler-Hammer',
  inputs: [
    { id: 95030, name: 'Cold-iron warhammer', consumed: true },    // Sootworks tier-1 chain
    { id: 7002, name: 'Soot-iron bar', consumed: true },
    { id: 7002, name: 'Soot-iron bar', consumed: true },
    { id: 97252, name: 'Clockwork dragon bones', consumed: true },
    { id: 97243, name: 'Sootworks prayer potion', consumed: true },
  ],
  skill: 'smithing', level: 95, xp: 1020, station: 'anvil',
  description: "Sootworks Boiler Rite. Cold-iron hammer pressurized by steam. BiS crush; splits brass plate. Degrades — recharges with dwarven stout.",
});

c(95085, {
  resultName: 'Boneyard Sun-Flensed Falx',
  inputs: [
    { id: 95040, name: 'Sun-baked bone scimitar', consumed: true }, // Boneyard tier-1 chain
    { id: 96507, name: 'Pyramid dragon bones', consumed: true },
    { id: 96507, name: 'Pyramid dragon bones', consumed: true },
    { id: 96525, name: 'Boneyard silver ore', consumed: true },
    { id: 96525, name: 'Boneyard silver ore', consumed: true },
  ],
  skill: 'smithing', level: 87, xp: 810, station: 'anvil',
  description: "Boneyard Sun-Flensing. Sun-baked scim flensed with pyramid dragon ribs. BiS vs desert wyrms; passive +1 prayer in Boneyard.",
});

c(95086, {
  resultName: 'Inkweald Nightmare-Edge',
  inputs: [
    { id: 95050, name: 'Dream-iron longsword', consumed: true },   // Inkweald tier-1 chain
    { id: 98531, name: 'Glass-iron bar', consumed: true },
    { id: 98531, name: 'Glass-iron bar', consumed: true },
    { id: 98592, name: 'Dream drake bones', consumed: true },
    { id: 98593, name: 'Unsaid-name', consumed: true },
  ],
  skill: 'smithing', level: 96, xp: 1050, station: 'anvil',
  description: "Inkweald Nightmare Rite. Dream-iron sword glass-sheathed with drake bone. BiS vs phase-shift bosses. Never the same blade twice.",
});

c(95087, {
  resultName: 'Glass Desert Lens-Sunder',
  inputs: [
    { id: 95060, name: 'Witness-Wall crystal scimitar', consumed: true }, // Glass Desert tier-1 chain
    { id: 98980, name: 'Uncut prism-diamond', consumed: true },
    { id: 98981, name: 'Uncut lens-onyx', consumed: true },
    { id: 98951, name: 'Edge-Keeper bones', consumed: true },
    { id: 98951, name: 'Edge-Keeper bones', consumed: true },
  ],
  skill: 'smithing', level: 99, xp: 1400, station: 'anvil',
  description: "Glass Desert Lens-Sunder Rite. Witness-Wall scim recut with prism-diamond and lens-onyx. Strictly the highest-tier blade in Aelgard. Degrades — 500 crystal shards per 100 hits.",
});

// ══════════════════════════════════════════════════════════════════════════════
// TIER 10 — TWO-BOSS SYNTHESIS: Cross-boss reagent combos
// Drops from two different bosses — each stays valuable. Classic reagent rule.
// ══════════════════════════════════════════════════════════════════════════════

c(95090, {
  resultName: 'Hydra-Kraken Aspect Ring',
  inputs: [
    { id: 31127, name: 'Hydra leather', consumed: true },          // Alchemical Hydra drop
    { id: 92000, name: 'Kraken tentacle', consumed: true },        // Kraken drop
    { id: 70122, name: 'Diamond ring', consumed: true },           // OLD jewelry kept
  ],
  skill: 'crafting', level: 86, xp: 420,
  description: "Two-Beast Reagent Rite. Hydra leather wound a Kraken tentacle onto diamond ring. +5% melee AND ranged; BiS hybrid ring.",
});

c(95091, {
  resultName: 'Ogre-Troll Compound Bow',
  inputs: [
    { id: 70167, name: 'Magic longbow', consumed: true },          // OLD magic longbow kept
    { id: 31128, name: 'Hydra claw', consumed: true },             // Hydra drop reagent
    { id: 92021, name: 'Draconic visage', consumed: true },        // Dragon visage reagent
  ],
  skill: 'fletching', level: 90, xp: 620,
  description: "Hydra-Wyrm Compound Strung. Magic longbow clawed with hydra and visage-bound. BiS wilderness bow; special: fires 3 arrows/tick.",
});

c(95092, {
  resultName: 'Sanguinesti-Scythe Dual Pendant',
  inputs: [
    { id: 94001, name: 'Scythe of Malachar', consumed: false },    // NOT consumed — still your BiS weapon
    { id: 94002, name: 'Sanguinesti staff', consumed: false },     // NOT consumed — still your BiS weapon
    { id: 70142, name: 'Holy symbol', consumed: true },            // OLD holy symbol kept (consumed)
    { id: 280, name: 'Blood rune', consumed: true },
    { id: 280, name: 'Blood rune', consumed: true },
    { id: 280, name: 'Blood rune', consumed: true },
  ],
  skill: 'prayer', level: 90, xp: 1350, station: 'altar',
  description: "Bloodmark Consecration. Both raid-weapons TOUCHED to an old holy symbol (they are not consumed). Pendant halves charge-costs when wielding either raid weapon. The ultimate endgame efficiency upgrade — keeps both raid drops in play.",
});

c(95093, {
  resultName: "Vorkath's Burial Set (head)",
  inputs: [
    { id: 530, name: 'Bronze full helm', consumed: true },         // OLD bronze helm kept (reagent rule!)
    { id: 70221, name: 'Superior dragon bones', consumed: true },
    { id: 70221, name: 'Superior dragon bones', consumed: true },
    { id: 107, name: 'Dragon bones', consumed: true },
  ],
  skill: 'smithing', level: 78, xp: 560, station: 'anvil',
  description: "Vorkath's Burial Rite. Bronze helm (from day 1) reforged with vorkath bones. Head-slot pet-drop boost +15%; the old bronze helm stays relevant FOREVER as the reagent.",
});

c(95094, {
  resultName: "Kraken's Arclight",
  inputs: [
    { id: 92060, name: 'Arclight', consumed: true },               // OLD Arclight kept
    { id: 92000, name: 'Kraken tentacle', consumed: true },        // Kraken reagent
    { id: 92061, name: 'Ancient shard', consumed: true },
    { id: 92061, name: 'Ancient shard', consumed: true },
    { id: 92061, name: 'Ancient shard', consumed: true },
  ],
  skill: 'magic', level: 88, xp: 520, station: 'altar',
  description: "Kraken Arc-Binding. Arclight re-wired through Kraken tentacle. 25% more damage vs sea-demons; charges still cost ancient shards (keeps slayer relevant).",
});

// ══════════════════════════════════════════════════════════════════════════════
// TIER 11 — QUEST-ITEM REAGENT COMBOS
// Quest reward items combined with boss drops — quests stay valuable forever.
// ══════════════════════════════════════════════════════════════════════════════

c(95100, {
  resultName: 'Enchanted Dragon Slayer Shield',
  inputs: [
    { id: 92022, name: 'Anti-dragon shield', consumed: false },    // Dragon Slayer reward NOT consumed
    { id: 92021, name: 'Draconic visage', consumed: true },
    { id: 96505, name: 'Salt-jackal bones', consumed: true },
    { id: 98592, name: 'Dream drake bones', consumed: true },
  ],
  skill: 'smithing', level: 84, xp: 640, station: 'anvil',
  description: "Dragon Slayer Reinforcement. Anti-dragon shield (QUEST REWARD, kept forever) re-enchanted with three-biome dragon bones. Dragon Slayer quest stays relevant for ALL players at ALL tiers.",
});

c(95101, {
  resultName: 'Fight Caves Ember Necklace',
  inputs: [
    { id: 99001, name: 'Fire cape', consumed: false },             // Prestige — NOT consumed
    { id: 70119, name: 'Ruby necklace', consumed: true },          // OLD jewelry kept
    { id: 70231, name: 'Cosmic rune', consumed: true },
    { id: 273, name: 'Fire rune', consumed: true },
    { id: 273, name: 'Fire rune', consumed: true },
    { id: 273, name: 'Fire rune', consumed: true },
    { id: 273, name: 'Fire rune', consumed: true },
    { id: 273, name: 'Fire rune', consumed: true },
  ],
  skill: 'magic', level: 82, xp: 420, station: 'altar',
  description: "Ember Necklace Enchantment. Fire cape (prestige, kept) touched to ruby necklace. +5% fire spell dmg; 1-hour auto-surge on death.",
});

c(95102, {
  resultName: 'Rune-Crown of the Ironman',
  inputs: [
    { id: 535, name: 'Rune full helm', consumed: true },           // OLD rune helm kept
    { id: 70221, name: 'Superior dragon bones', consumed: true },
    { id: 70221, name: 'Superior dragon bones', consumed: true },
    { id: 91050, name: 'Godsword shard 1', consumed: true },
    { id: 91051, name: 'Godsword shard 2', consumed: true },
    { id: 91052, name: 'Godsword shard 3', consumed: true },
  ],
  skill: 'smithing', level: 93, xp: 980, station: 'anvil',
  description: "Ironman Rune-Crown Rite. Rune helm forged with superior bones AND all three godsword shards. Ironman prestige — requires no GE. +7% XP in all skills while worn (3 hours/day).",
});

c(95103, {
  resultName: 'Barrows-Bandos Reinforced Tassets',
  inputs: [
    { id: 93001, name: "Dharok's greataxe", consumed: false },     // Barrows reward (NOT consumed — still used with repairs)
    { id: 93002, name: "Guthan's warspear", consumed: false },     // Barrows reward (NOT consumed)
    { id: 26003, name: 'Bandos chestplate', consumed: true },      // GWD drop
    { id: 26003, name: 'Bandos chestplate', consumed: true },      // 2nd Bandos piece
  ],
  skill: 'smithing', level: 96, xp: 1200, station: 'anvil',
  description: "Barrows-Bandos Fusion. Two Barrows weapons (NOT consumed) TOUCHED to two Bandos chestplates. Bandos tassets melted, re-formed. Keeps Barrows AND GWD relevant — you need both.",
});

// ══════════════════════════════════════════════════════════════════════════════
// TIER 12 — ECONOMY RUNS: Low-level reagent loops for economy/ironman
// These fill the gap at early tiers. Every beginner item matters.
// ══════════════════════════════════════════════════════════════════════════════

c(95110, {
  resultName: 'Apprentice Bronze-Iron Edge',
  inputs: [
    { id: 400, name: 'Bronze dagger', consumed: true },            // OLD bronze kept
    { id: 410, name: 'Iron dagger', consumed: true },              // OLD iron kept
    { id: 251, name: 'Iron bar', consumed: true },
  ],
  skill: 'smithing', level: 18, xp: 40, station: 'anvil',
  description: "Apprentice Splicing. Bronze + iron dagger edge-welded. +30% dagger stats for low-level ironmen. Replaces nothing — uses both.",
});

c(95111, {
  resultName: 'Steel-Alloy Scimitar',
  inputs: [
    { id: 420, name: 'Steel scimitar', consumed: true },           // OLD steel kept
    { id: 410, name: 'Iron dagger', consumed: true },              // OLD iron kept
    { id: 252, name: 'Steel bar', consumed: true },
  ],
  skill: 'smithing', level: 33, xp: 75, station: 'anvil',
  description: "Steel-Alloy Reworking. Steel scimitar edge-rolled with iron dagger. Bridges the iron-steel dead zone. +15% attack for ironmen 30-50.",
});

c(95112, {
  resultName: 'Silver-Sealed Oak Shortbow',
  inputs: [
    { id: 70160, name: 'Willow shortbow', consumed: true },        // OLD willow kept
    { id: 70140, name: 'Silver tiara', consumed: true },
    { id: 580, name: 'Bowstring', consumed: true },
  ],
  skill: 'fletching', level: 42, xp: 85,
  description: "Silver-Sealed Binding. Willow shortbow tipped with silver tiara filaments. +10% vs werewolves; mid-game slayer helper.",
});

c(95113, {
  resultName: 'Gilded Altar Offering Mix',
  inputs: [
    { id: 106, name: 'Big bones', consumed: true },                // OLD base bones kept
    { id: 107, name: 'Dragon bones', consumed: true },
    { id: 70142, name: 'Holy symbol', consumed: true },
  ],
  skill: 'prayer', level: 50, xp: 440, station: 'altar',
  description: "Gilded Altar Compound Offering. 1 big + 1 dragon bone + 1 symbol = 3x prayer. Ironman early-altar trick.",
});

c(95114, {
  resultName: 'Herb-Wrapped Cooked Karambwan',
  inputs: [
    { id: 70217, name: 'Cooked karambwan', consumed: true },       // OLD cooked fish kept
    { id: 70181, name: 'Clean avantoe', consumed: true },
    { id: 70183, name: 'Clean snapdragon', consumed: true },
  ],
  skill: 'cooking', level: 65, xp: 300, station: 'range',
  description: "Herb-Wrapping. Karambwan wrapped in avantoe/snapdragon. Heals 24 + 1 prayer; combo-eatable. Ironman raid food.",
});

// ══════════════════════════════════════════════════════════════════════════════
// END — Total combo count logged at load
// ══════════════════════════════════════════════════════════════════════════════

console.log('[aelgard] Combinations mega-pack (burn v2): ' + comboCount + ' new reagent combinations loaded');

module.exports = { comboCount };
