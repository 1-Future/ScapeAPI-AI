// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Expanded Quests
// 10 additional quests filling gaps identified in the manifesto audit:
// - Farming quest, fishing quest, crafting quest, slayer unlock quest
// - Wilderness quest, group quest, moral choice quest
// - Multi-region quests that force travel between 3+ regions
// ══════════════════════════════════════════════════════════════════════════════

const quests = require('../../data/quests');

// ── 1. The Green Thumb (Farming introduction) ──────────────────────────────
// Multi-region: Heartlands → Veilwood → Heartlands
quests.define('the_green_thumb', {
  name: 'The Green Thumb',
  description: "A farmer in the Heartlands has lost his prized crop to blight. The cure lies in the enchanted soil of Veilwood, but the elves don't share their secrets easily.",
  difficulty: 'Novice',
  questPoints: 1,
  requirements: { skills: { farming: 10, herblore: 5, woodcutting: 10 } },
  steps: [
    { text: 'Talk to Farmer Aldwin at the Heartlands farm.' },
    { text: 'Examine the blighted crops and collect a sample.' },
    { text: 'Travel to Veilwood and find the Elven Herbalist.' },
    { text: 'Gather 3 Moonpetals and 2 Veilwood bark for the cure (Herblore 5).' },
    { text: 'Chop a sacred branch as a grafting stock (Woodcutting 10).' },
    { text: 'Return to Heartlands and apply the cure to the crops.' },
    { text: 'Wait one game day for the crops to recover.' },
    { text: 'Talk to Farmer Aldwin.' },
  ],
  rewards: {
    xp: { farming: 500, herblore: 200, woodcutting: 200 },
    items: [{ id: 101, name: 'Coins', count: 500 }, { id: 12414, name: 'Ranarr seed', count: 3 }],
    questPoints: 1,
  },
});

// ── 2. The Angler's Challenge (Fishing deep-dive) ─────────────────────────
// Multi-region: Saltbrine → Heartlands → Saltbrine
quests.define('the_anglers_challenge', {
  name: "The Angler's Challenge",
  description: "Fishmonger Mara challenges you to catch one of every fish in Aelgard. A journey across the continent's waterways.",
  difficulty: 'Intermediate',
  questPoints: 2,
  requirements: { skills: { fishing: 30, cooking: 20, agility: 15 } },
  steps: [
    { text: 'Talk to Fishmonger Mara at Saltbrine harbour.' },
    { text: 'Catch a trout from the Heartlands river (Fishing 20).' },
    { text: 'Catch a lobster from the Saltbrine coast (Fishing 40).' },
    { text: 'Catch a swordfish from the deep waters (Fishing 50 — or use bait from Mara).' },
    { text: 'Cook each fish without burning them (Cooking 20).' },
    { text: 'Deliver the cooked fish to Mara.' },
  ],
  rewards: {
    xp: { fishing: 2500, cooking: 1000 },
    items: [{ id: 101, name: 'Coins', count: 3000 }, { id: 13004, name: 'Pearl fishing rod', count: 1 }],
    questPoints: 2,
  },
});

// ── 3. The Jeweller's Eye (Crafting deep-dive) ────────────────────────────
// Multi-region: Heartlands → Sootworks → Heartlands
quests.define('the_jewellers_eye', {
  name: "The Jeweller's Eye",
  description: 'A master jeweller in the Heartlands wants to create the finest amulet Aelgard has ever seen. She needs rare gems, precise cuts, and the heat of the Sootworks furnaces.',
  difficulty: 'Intermediate',
  questPoints: 2,
  requirements: { skills: { crafting: 30, mining: 25, smithing: 20 } },
  steps: [
    { text: 'Talk to Jeweller Esme in the Heartlands market.' },
    { text: 'Mine 3 uncut gems from the Heartlands mine (Mining 25).' },
    { text: 'Cut the gems (Crafting 30).' },
    { text: 'Travel to the Sootworks to use the deep furnace for smelting a gold setting.' },
    { text: 'Smith the gold setting at the Sootworks anvil (Smithing 20).' },
    { text: 'Return to Esme and combine the gems with the setting.' },
  ],
  rewards: {
    xp: { crafting: 2000, mining: 1000, smithing: 800 },
    items: [{ id: 12542, name: 'Amulet of glory', count: 1 }],
    questPoints: 2,
  },
});

// ── 4. Slayer's Gauntlet (Slayer unlock quest) ────────────────────────────
// Unlocks ability to receive tasks from Varrek in Moryskah
quests.define('slayers_gauntlet', {
  name: "Slayer's Gauntlet",
  description: 'Slayer Master Varrek won\'t assign tasks to just anyone. Prove yourself by hunting one creature from each combat style.',
  difficulty: 'Intermediate',
  questPoints: 2,
  requirements: { skills: { attack: 30, ranged: 25, magic: 20, slayer: 10 } },
  steps: [
    { text: 'Talk to Slayer Master Varrek in the Moryskah Slayer Tower.' },
    { text: 'Kill 10 Giant spiders (melee task — weak to crush).' },
    { text: 'Kill 10 Dark wizards (ranged task — weak to ranged).' },
    { text: 'Kill 5 Hill giants (magic task — weak to magic).' },
    { text: 'Bring proof (drops from each) to Varrek.' },
  ],
  rewards: {
    xp: { slayer: 2000, attack: 500, ranged: 500, magic: 500 },
    items: [{ id: 101, name: 'Coins', count: 2000 }],
    questPoints: 2,
    // Unlocks: Varrek as slayer master (access to Moryskah slayer tasks)
  },
});

// ── 5. Into the Wilds (Wilderness introduction) ───────────────────────────
// PvP zone quest — teaches wilderness mechanics
quests.define('into_the_wilds', {
  name: 'Into the Wilds',
  description: 'The Wilds north of Aelgard are lawless and dangerous. A ranger at the border can teach you how to survive — if you dare enter.',
  difficulty: 'Intermediate',
  questPoints: 2,
  requirements: { skills: { attack: 25, defence: 20, ranged: 15, agility: 20 } },
  steps: [
    { text: 'Talk to Ranger Tomas at the Wilds border (north of Heartlands).' },
    { text: 'Enter the Wilds and navigate to the abandoned ruins.' },
    { text: 'Recover the lost supply cache from the ruins.' },
    { text: 'Escape back to safety (Agility 20 shortcut available).' },
    { text: 'Return to Ranger Tomas with the supplies.' },
  ],
  rewards: {
    xp: { attack: 1000, defence: 1000, ranged: 500, agility: 500 },
    items: [{ id: 101, name: 'Coins', count: 3000 }],
    questPoints: 2,
  },
});

// ── 6. The Drifting Market Charter (Group/social quest) ───────────────────
// Requires interaction with other players or NPCs representing a "group"
quests.define('drifting_market_charter', {
  name: 'The Drifting Market Charter',
  description: 'Merchants from all regions want to establish a floating market. Help them negotiate, build, and launch it.',
  difficulty: 'Experienced',
  questPoints: 3,
  requirements: { skills: { crafting: 35, fishing: 25, cooking: 30, woodcutting: 30 } },
  steps: [
    { text: 'Talk to Merchant Hilde in the Heartlands about the market plan.' },
    { text: 'Travel to Saltbrine and recruit Fishmonger Mara.' },
    { text: 'Travel to Veilwood and recruit Fletcher Tarin for wood supplies.' },
    { text: 'Travel to the Sootworks and recruit Engineer Fizz for hull fittings.' },
    { text: 'Chop 20 oak logs for the hull (Woodcutting 30).' },
    { text: 'Catch 10 lobsters for the inaugural feast (Fishing 25).' },
    { text: 'Cook the feast (Cooking 30).' },
    { text: 'Craft the market banner (Crafting 35).' },
    { text: 'Return to Merchant Hilde and launch the market.' },
  ],
  rewards: {
    xp: { crafting: 3000, fishing: 1500, cooking: 1500, woodcutting: 1500 },
    items: [{ id: 101, name: 'Coins', count: 10000 }],
    questPoints: 3,
    // Unlocks: Drifting Market — mobile trade hub that moves weekly
  },
});

// ── 7. The Werewolf's Dilemma (Moral choice quest) ───────────────────────
// Player must choose between curing or empowering a werewolf. Outcome is permanent.
quests.define('the_werewolfs_dilemma', {
  name: "The Werewolf's Dilemma",
  description: 'A young werewolf begs for help. They can be cured — losing their power but regaining their humanity. Or they can be empowered — embracing the beast but never going back. Your choice is final.',
  difficulty: 'Experienced',
  questPoints: 2,
  requirements: { skills: { herblore: 30, prayer: 25, magic: 20, crafting: 20 }, quests: ['the_bog_witchs_bargain'] },
  steps: [
    { text: 'Find the wounded werewolf in the Moryskah forest.' },
    { text: 'Listen to their story.' },
    { text: 'CHOICE A: Brew a lycanthropy cure (Herblore 30 + Wolfbane herb + Holy water). OR' },
    { text: 'CHOICE B: Craft a moonstone amulet to empower the beast (Crafting 20 + Magic 20).' },
    { text: 'Administer your choice. The outcome is permanent.' },
    { text: 'Report to Father Dorin (if cured) or the Werewolf Alpha (if empowered).' },
  ],
  rewards: {
    // Cure path: Prayer + Herblore XP, access to human NPC shopkeeper in werewolf territory
    // Empower path: Strength + Attack XP, access to werewolf ally who fights alongside you
    xp: { herblore: 2000, prayer: 1500, magic: 1000 },
    items: [{ id: 101, name: 'Coins', count: 3000 }],
    questPoints: 2,
  },
});

// ── 8. Echoes of the Deep (Cross-region exploration) ──────────────────────
// 4-region globetrotting quest
quests.define('echoes_of_the_deep', {
  name: 'Echoes of the Deep',
  description: 'Strange vibrations have been felt across Aelgard. Something deep underground connects all the regions. Find the source.',
  difficulty: 'Master',
  questPoints: 3,
  requirements: { skills: { mining: 40, magic: 35, prayer: 30, agility: 30 }, quests: ['sootworks_rising', 'sand_and_secrets'] },
  steps: [
    { text: 'Investigate the vibrations in the Sootworks deep mines.' },
    { text: 'Discover an ancient tunnel leading south to the Boneyard Wastes.' },
    { text: 'Follow the tunnel to a sealed chamber beneath the Boneyard pyramid.' },
    { text: 'Use magic to unseal the chamber (Magic 35).' },
    { text: 'Discover the tunnel extends east to Moryskah.' },
    { text: 'Navigate through the flooded Moryskah section (Prayer 30 to resist undead).' },
    { text: 'Reach the source: an ancient machine beneath the Glass Desert.' },
    { text: 'Shut down the machine (Mining 40 to break the power conduits).' },
    { text: 'Report to Crystal Sage Orin in the Glass Desert.' },
  ],
  rewards: {
    xp: { mining: 5000, magic: 3000, prayer: 2000, agility: 2000 },
    items: [{ id: 101, name: 'Coins', count: 15000 }],
    questPoints: 3,
  },
});

// ── 9. The Fletcher's Trial (Fletching + Ranged quest) ────────────────────
// Fills the Fletching/Ranged gap in quest prereqs
quests.define('the_fletchers_trial', {
  name: "The Fletcher's Trial",
  description: "Fletcher Tarin in Veilwood challenges you to craft the finest bow in Aelgard and prove its worth in combat.",
  difficulty: 'Intermediate',
  questPoints: 2,
  requirements: { skills: { fletching: 30, ranged: 25, woodcutting: 25 } },
  steps: [
    { text: 'Talk to Fletcher Tarin in Veilwood.' },
    { text: 'Chop a maple log from the Veilwood forest (Woodcutting 25).' },
    { text: 'Fletch a maple shortbow (Fletching 30).' },
    { text: 'Travel to the Heartlands archery range.' },
    { text: 'Hit 5 targets in a row using your crafted bow (Ranged 25).' },
    { text: 'Return to Fletcher Tarin with proof of your marksmanship.' },
  ],
  rewards: {
    xp: { fletching: 2000, ranged: 1500, woodcutting: 500 },
    items: [{ id: 6006, name: 'Elven bow', count: 1 }, { id: 6007, name: 'Elven arrow', count: 100 }],
    questPoints: 2,
  },
});

// ── 10. The Last Light of the Old Sun (World quest / endgame epilogue) ────
// Server-affecting quest — changes the world after completion
quests.define('the_last_light', {
  name: 'The Last Light of the Old Sun',
  description: "Aelgard's ancient sun is dying. The Crystal Sage says it can be restored — but the cost may be higher than anyone imagines. This quest affects the entire server.",
  difficulty: 'Grandmaster',
  questPoints: 5,
  requirements: {
    skills: { attack: 70, magic: 65, prayer: 60, hitpoints: 70, mining: 50, herblore: 45, crafting: 40 },
    quests: ['the_last_dragon_p3', 'echoes_of_the_deep', 'the_hollow_choirs_song'],
  },
  steps: [
    { text: 'Talk to Crystal Sage Orin after defeating Veldrak.' },
    { text: 'Travel to the Heartlands observatory to study the dying sun.' },
    { text: 'Gather components from 6 regions: a flame from Sootworks, a tear from Moryskah, a dream from Inkweald, a pearl from Saltbrine, a seed from Veilwood, a crystal from Glass Desert.' },
    { text: 'Combine the components at the central altar (Herblore 45 + Crafting 40).' },
    { text: 'Perform the Sun Restoration ritual (Prayer 60 + Magic 65).' },
    { text: 'CHOICE: Restore the old sun (world stays as-is) OR forge a new sun (world changes — new area unlocks).' },
    { text: 'Witness the outcome. This cannot be undone.' },
  ],
  rewards: {
    xp: { attack: 25000, magic: 20000, prayer: 15000, hitpoints: 10000, mining: 8000, herblore: 5000, crafting: 5000 },
    items: [{ id: 101, name: 'Coins', count: 100000 }],
    questPoints: 5,
  },
});

console.log('[aelgard] 10 expanded quests loaded');
