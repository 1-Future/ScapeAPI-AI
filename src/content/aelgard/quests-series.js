// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Quest Series Expansion
// 20 more quests bringing total to 54.
// Includes: Recipe for Disaster chain (5 sub-quests), multi-region epics,
// skill-gated challenge quests, miniquests.
// ══════════════════════════════════════════════════════════════════════════════

const quests = require('../../data/quests');

// ══════════════════════════════════════════════════════════════════════════════
// RECIPE FOR DISASTER — 5-part chain requiring all skills
// Aelgard's equivalent of OSRS's longest quest. Locks BIS gloves behind it.
// ══════════════════════════════════════════════════════════════════════════════

quests.define('rfd_start', {
  name: 'Recipe for Disaster — Prologue',
  description: "The Drifting Market's inaugural feast has been cursed. The guests are frozen in time. Free them — one by one.",
  difficulty: 'Intermediate', questPoints: 1,
  requirements: { skills: { cooking: 10 }, quests: ['drifting_market_charter'] },
  steps: [
    { text: 'Attend the feast at the Drifting Market.' },
    { text: 'Witness the curse strike all guests.' },
    { text: 'Talk to the Culinaromancer (a rogue chef trapped between dimensions).' },
    { text: 'Learn that each guest requires a specific dish to be freed.' },
  ],
  rewards: {
    xp: { cooking: 500 },
    questPoints: 1,
    unlocks: [],
    chain_next: 'rfd_heartlands',
  },
});

quests.define('rfd_heartlands', {
  name: 'Recipe for Disaster — The Captain',
  description: 'Free Captain Alden by cooking his childhood meal: a Heartlands meat pie.',
  difficulty: 'Intermediate', questPoints: 1,
  requirements: { skills: { cooking: 30, farming: 15, crafting: 10 }, quests: ['rfd_start'] },
  steps: [
    { text: 'Learn that Captain Alden needs a Heartlands meat pie.' },
    { text: 'Grow potatoes and onions at the Heartlands allotment (Farming 15).' },
    { text: 'Craft a pie dish from clay (Crafting 10).' },
    { text: 'Cook the pie without burning it (Cooking 30).' },
    { text: 'Serve the pie to free Captain Alden.' },
  ],
  rewards: {
    xp: { cooking: 1500, farming: 500, crafting: 300 },
    questPoints: 1,
    unlocks: [],
    chain_next: 'rfd_moryskah',
  },
});

quests.define('rfd_moryskah', {
  name: 'Recipe for Disaster — The Priest',
  description: 'Free Father Dorin by brewing a sanctified stew — with ingredients from the swamp.',
  difficulty: 'Experienced', questPoints: 1,
  requirements: { skills: { cooking: 45, herblore: 30, prayer: 25, fishing: 20 }, quests: ['rfd_start', 'the_bog_witchs_bargain'] },
  steps: [
    { text: 'Father Dorin needs a sanctified stew blessed with swamp herbs.' },
    { text: 'Fish raw karambwan from Moryskah swamp waters (Fishing 20).' },
    { text: 'Brew the sanctification agent with Wolfbane herbs (Herblore 30).' },
    { text: 'Cook the stew on a blessed range (Prayer 25).' },
    { text: 'Serve the stew to free Father Dorin.' },
  ],
  rewards: {
    xp: { cooking: 2000, herblore: 1000, prayer: 800, fishing: 500 },
    questPoints: 1,
    unlocks: [],
    chain_next: 'rfd_sootworks',
  },
});

quests.define('rfd_sootworks', {
  name: 'Recipe for Disaster — The Engineer',
  description: "Free Engineer Fizz by creating a mechanically perfect cake — baked in a clockwork oven.",
  difficulty: 'Experienced', questPoints: 1,
  requirements: { skills: { cooking: 55, smithing: 40, crafting: 35, construction: 20 }, quests: ['rfd_start', 'sootworks_rising'] },
  steps: [
    { text: 'Engineer Fizz needs a clockwork cake baked to exact specifications.' },
    { text: 'Smith a precision cake tin from soot-iron (Smithing 40).' },
    { text: 'Craft the decorative frosting mold (Crafting 35).' },
    { text: 'Build a temperature-controlled oven (Construction 20).' },
    { text: 'Cook the cake at exactly the right temperature (Cooking 55).' },
    { text: 'Serve the cake to free Engineer Fizz.' },
  ],
  rewards: {
    xp: { cooking: 3000, smithing: 1500, crafting: 1000, construction: 800 },
    questPoints: 1,
    unlocks: [],
    chain_next: 'rfd_finale',
  },
});

quests.define('rfd_finale', {
  name: 'Recipe for Disaster — The Culinaromancer',
  description: "All guests freed. Now defeat the Culinaromancer himself to lift the curse permanently.",
  difficulty: 'Master', questPoints: 5,
  requirements: { skills: { cooking: 70, attack: 50, magic: 45, ranged: 40, agility: 30, thieving: 25 }, quests: ['rfd_heartlands', 'rfd_moryskah', 'rfd_sootworks'] },
  steps: [
    { text: 'Return to the Drifting Market for the final confrontation.' },
    { text: 'The Culinaromancer attacks. Phase 1: dodge food projectiles (Agility 30).' },
    { text: 'Phase 2: steal his recipe book while he casts (Thieving 25).' },
    { text: 'Phase 3: fight him with all three combat styles (he switches weaknesses).' },
    { text: 'Defeat the Culinaromancer to lift the curse.' },
  ],
  rewards: {
    xp: { cooking: 10000, attack: 5000, magic: 3000, ranged: 3000, agility: 1500, thieving: 1000 },
    items: [{ id: 101, name: 'Coins', count: 20000 }],
    questPoints: 5,
    // Unlocks: Barrows gloves (BIS melee hands) from the Culinaromancer's chest
    unlocks: ["item_unlock:barrows_gloves", "shop:culinaromancers_chest"],
  },
});

// ══════════════════════════════════════════════════════════════════════════════
// MULTI-REGION EPICS
// ══════════════════════════════════════════════════════════════════════════════

quests.define('desert_treasure', {
  name: 'Desert Treasure',
  description: 'An ancient magician speaks of four diamonds hidden across Aelgard. Each guards access to a forgotten spell — the Ancient Magicks.',
  difficulty: 'Master', questPoints: 3,
  requirements: { skills: { magic: 50, firemaking: 50, thieving: 53, slayer: 10, mining: 45 }, quests: ['sand_and_secrets'] },
  steps: [
    { text: 'Talk to the archaeologist in the Boneyard about the Diamonds of Azzanadra.' },
    { text: 'Find the Ice Diamond in the Glasswake passage north of the Glass Desert (survive cold).' },
    { text: 'Find the Shadow Diamond in the Inkweald dream labyrinth.' },
    { text: 'Find the Blood Diamond in Castle Malachar (defeat a blood guardian).' },
    { text: 'Find the Smoke Diamond in the Sootworks deep furnace (survive heat).' },
    { text: 'Combine the four diamonds at the ancient altar in the Boneyard pyramid.' },
    { text: 'Defeat the final guardian to unlock the Ancient Magicks spellbook.' },
  ],
  rewards: {
    xp: { magic: 15000, firemaking: 3000, thieving: 3000, mining: 2000 },
    questPoints: 3,
    // Unlocks: Ancient Magicks spellbook (ice barrage, blood barrage, etc)
    unlocks: ["spell_unlock:ancient_magicks"],
  },
});

quests.define('monkey_business', {
  name: 'Monkey Business',
  description: "Saltbrine sailors speak of an island where monkeys walk and talk. Getting there requires courage, a ship, and a willingness to get very, very confused.",
  difficulty: 'Master', questPoints: 3,
  requirements: { skills: { attack: 50, agility: 40, crafting: 30, prayer: 30, thieving: 20 }, quests: ['pirate_king'] },
  steps: [
    { text: 'Talk to Harbourmaster Cole about the monkey island rumours.' },
    { text: 'Charter a ship to the uncharted island south of Saltbrine.' },
    { text: 'Crash-land on the island. Your ship is wrecked.' },
    { text: 'Navigate the monkey city disguised as a monkey (Thieving 20 + Crafting 30 for disguise).' },
    { text: 'Earn the monkey elder\'s trust through an agility trial (Agility 40).' },
    { text: 'Discover the monkey temple and its connection to the Heartlands gods (Prayer 30).' },
    { text: 'Defeat the monkey demon guardian (Attack 50).' },
    { text: 'Return to Saltbrine with the monkey talisman.' },
  ],
  rewards: {
    xp: { attack: 8000, agility: 5000, crafting: 3000, prayer: 2000 },
    questPoints: 3,
    // Unlocks: Monkey talisman (teleport to monkey island), Dragon scimitar shop access
    unlocks: ["item_unlock:dragon_scimitar_equip", "shop:dragon_scimitar_shop", "teleport:monkey_talisman"],
  },
});

quests.define('lunar_diplomacy', {
  name: 'Lunar Diplomacy',
  description: 'The Inkweald scholars speak of a Lunar spellbook — magic focused on support and utility rather than combat. Reach the Lunar Isle through the dream.',
  difficulty: 'Master', questPoints: 2,
  requirements: { skills: { magic: 65, herblore: 45, crafting: 60, mining: 55, woodcutting: 50, firemaking: 49 }, quests: ['the_inkweald_door'] },
  steps: [
    { text: 'Talk to Lucid Keeper Yara about the Lunar path.' },
    { text: 'Brew a dream potion using Lucid essence and Moonpetals (Herblore 45).' },
    { text: 'Enter the dream and navigate to the Lunar Plane.' },
    { text: 'Pass the trials: mine a lunar rock (Mining 55), light a sacred flame (Firemaking 49).' },
    { text: 'Craft a lunar staff using dreamwood and crystal (Crafting 60, Woodcutting 50).' },
    { text: 'Convince the Lunar elders to share their spellbook.' },
    { text: 'Return to the waking world with the Lunar spellbook.' },
  ],
  rewards: {
    xp: { magic: 10000, herblore: 3000, crafting: 5000, mining: 3000 },
    questPoints: 2,
    // Unlocks: Lunar spellbook (cure, vengeance, heal group, NPC contact, etc)
    unlocks: ["area:inkweald_lunar_plane", "spell_unlock:lunar_spellbook"],
  },
});

quests.define('underground_pass', {
  name: 'The Underground Pass',
  description: 'A massive underground passage connects the Heartlands to the Inkweald. It is full of traps, puzzles, and an ancient evil. One of the hardest quests in Aelgard.',
  difficulty: 'Experienced', questPoints: 3,
  requirements: { skills: { agility: 25, ranged: 25, attack: 20 } },
  steps: [
    { text: 'Talk to the guard at the underground pass entrance (west of Heartlands).' },
    { text: 'Enter the pass. Navigate the first section of traps (Agility 25).' },
    { text: 'Cross the pit of despair using the rope bridge.' },
    { text: 'Solve the three orb puzzle (unique to each player).' },
    { text: 'Navigate the maze of fear. The walls shift every 30 seconds.' },
    { text: 'Reach the Temple of Light at the bottom.' },
    { text: 'Defeat the demon of the pass (Ranged 25 recommended — melee is risky).' },
    { text: 'Find the exit to the Inkweald boundary.' },
    { text: 'Return to the guard with proof of passage.' },
  ],
  rewards: {
    xp: { agility: 4000, ranged: 2000, attack: 2000, hitpoints: 1000 },
    items: [{ id: 101, name: 'Coins', count: 5000 }],
    questPoints: 3,
    // Unlocks: shortcut between Heartlands and Inkweald
    unlocks: [],
  },
});

// ══════════════════════════════════════════════════════════════════════════════
// SKILL-GATED CHALLENGE QUESTS
// ══════════════════════════════════════════════════════════════════════════════

quests.define('the_fremennik_trials', {
  name: 'Trials of the Frost',
  description: 'The warriors of the northern Wilds will only respect you if you pass their trials — one for each combat style, plus a trial of honour.',
  difficulty: 'Intermediate', questPoints: 2,
  requirements: { skills: { attack: 30, ranged: 25, magic: 25, construction: 10, crafting: 25 } },
  steps: [
    { text: 'Travel to the Frost Camp at the north edge of the Wilds.' },
    { text: 'Complete the Trial of Strength (melee combat challenge).' },
    { text: 'Complete the Trial of the Bow (ranged accuracy challenge).' },
    { text: 'Complete the Trial of Wisdom (magic puzzle challenge).' },
    { text: 'Complete the Trial of Honour (build a monument for the fallen — Construction 10).' },
    { text: 'Craft a Frost amulet as proof of completion (Crafting 25).' },
  ],
  rewards: {
    xp: { attack: 2000, ranged: 2000, magic: 2000, construction: 1000, crafting: 1000 },
    items: [{ id: 101, name: 'Coins', count: 5000 }],
    questPoints: 2,
    // Unlocks: Frost warrior helmet (cosmetic + defence)
    unlocks: [],
  },
});

quests.define('dragon_slayer_aelgard', {
  name: 'Dragon Slayer of Aelgard',
  description: 'The Sootworks metal dragons are becoming aggressive. Someone must slay the leader — an adamant dragon in the deepest forge.',
  difficulty: 'Experienced', questPoints: 2,
  requirements: { skills: { attack: 40, defence: 35, mining: 30, smithing: 30 } },
  steps: [
    { text: 'Talk to Forgemaster Brun about the dragon problem.' },
    { text: 'Mine 5 pieces of dragonbane ore from the restricted shaft (Mining 30).' },
    { text: 'Smith a dragonbane sword (Smithing 30).' },
    { text: 'Navigate to the dragon den in the deepest Sootworks.' },
    { text: 'Defeat the Iron dragon boss.' },
    { text: 'Return to Brun with the dragon\'s core.' },
  ],
  rewards: {
    xp: { attack: 3000, defence: 2000, mining: 2000, smithing: 2000 },
    items: [{ id: 101, name: 'Coins', count: 8000 }],
    questPoints: 2,
    // Unlocks: anti-dragon shield access, dragonfire shield crafting
    unlocks: ["item_unlock:anti_dragon_shield", "recipe:dragonfire_shield"],
  },
});

quests.define('poison_trail', {
  name: 'The Poison Trail',
  description: 'Someone is poisoning the water supply of the Heartlands. Follow the trail from river to source — it leads through three regions.',
  difficulty: 'Intermediate', questPoints: 2,
  requirements: { skills: { herblore: 25, fishing: 20, mining: 15, thieving: 15 } },
  steps: [
    { text: 'Investigate the poisoned well in the Heartlands.' },
    { text: 'Collect a water sample and analyse it (Herblore 25).' },
    { text: 'Follow the river upstream to the Sootworks mining outflow.' },
    { text: 'Discover the outflow is contaminated by a rogue miner\'s operation.' },
    { text: 'Steal the miner\'s logbook (Thieving 15) to find the true source.' },
    { text: 'Follow the trail to a secret laboratory in the Moryskah border.' },
    { text: 'Neutralise the poison agent and confront the saboteur.' },
    { text: 'Return to the Heartlands with proof.' },
  ],
  rewards: {
    xp: { herblore: 2000, fishing: 1000, mining: 800, thieving: 800 },
    items: [{ id: 101, name: 'Coins', count: 4000 }],
    questPoints: 2,
    unlocks: [],
  },
});

// ══════════════════════════════════════════════════════════════════════════════
// MINIQUESTS — shorter, no quest points, but unlock useful things
// ══════════════════════════════════════════════════════════════════════════════

quests.define('barrows_brothers', {
  name: 'The Barrows Brothers',
  description: 'Six ancient warriors are buried beneath the Moryskah mounds. Defeat their spirits to loot their crypts. This is a repeatable miniquest.',
  difficulty: 'Experienced', questPoints: 2,
  requirements: { skills: { attack: 50, magic: 50, prayer: 45 }, quests: ['blood_rites'] },
  steps: [
    { text: 'Travel to the Barrows mounds in southern Moryskah.' },
    { text: 'Open each mound and defeat the brother inside (6 brothers).' },
    { text: 'Each brother uses a different combat style — adapt your prayers.' },
    { text: 'After defeating all 6, enter the central crypt for loot.' },
    { text: 'Solve the puzzle door to access the chest.' },
    { text: 'Loot the chest. Contents vary based on brothers killed.' },
  ],
  rewards: {
    xp: { attack: 20000, magic: 15000, prayer: 12000, defence: 8000, strength: 8000 },
    items: [
      { id: 'dharoks_greataxe', name: "Dharok's greataxe", count: 1 },
      { id: 'ahrims_staff', name: "Ahrim's staff", count: 1 },
      { id: 'karils_crossbow', name: "Karil's crossbow", count: 1 },
    ],
    questPoints: 2,
    // Drops: Barrows equipment sets (Dharok, Guthan, Verac, Ahrim, Karil, Torag)
    unlocks: ["training_method:barrows_farming", "area:moryskah_barrows"],
  },
});

quests.define('wilderness_sword', {
  name: 'Blade of the Wilds',
  description: 'Forge a wilderness-specific weapon by collecting fragments from across the PvP zone. The blade is useless outside the Wilds but devastating within.',
  difficulty: 'Experienced', questPoints: 0,
  requirements: { skills: { smithing: 50, mining: 45, attack: 40 } },
  steps: [
    { text: 'Talk to Ranger Tomas at the Wilds border.' },
    { text: 'Collect 3 wilderness fragments: one from the ruins, one from the lava pit, one from the revenant caves.' },
    { text: 'Smith the fragments into a blade at the Sootworks forge (Smithing 50).' },
    { text: 'Return to Tomas to consecrate the blade.' },
  ],
  rewards: {
    xp: { smithing: 3000, mining: 2000, attack: 1000 },
    items: [],
    questPoints: 0,
    // Unlocks: Wilderness blade (BIS in Wilds only)
    unlocks: ["item_unlock:wilderness_blade"],
  },
});

quests.define('herb_run_mastery', {
  name: 'The Perfect Herb Run',
  description: 'Master herbalist Syl challenges you to complete a perfect herb run — all 7 patches, no diseased crops, in under 5 minutes.',
  difficulty: 'Experienced', questPoints: 0,
  requirements: { skills: { farming: 50, herblore: 40, agility: 30 } },
  steps: [
    { text: 'Talk to Herbalist Syl in Veilwood.' },
    { text: 'Plant ranarr seeds at all 7 herb patches (one per region).' },
    { text: 'Wait for growth.' },
    { text: 'Harvest all 7 patches in a single run without disease.' },
    { text: 'Return to Syl with 7 grimy ranarrs as proof.' },
  ],
  rewards: {
    xp: { farming: 5000, herblore: 2000 },
    items: [],
    questPoints: 0,
    // Unlocks: Master Farmer title, +10% herb yield permanently
    unlocks: ["achievement:master_farmer_title"],
  },
});

quests.define('fight_caves', {
  name: 'The Fight Caves',
  description: 'A legendary combat challenge in the Glass Desert. 63 waves of increasingly difficult monsters, ending with a final boss. Completing this earns the Fire Cape — the most prestigious item in Aelgard.',
  difficulty: 'Grandmaster', questPoints: 1,
  requirements: { skills: { attack: 70, ranged: 70, prayer: 55, hitpoints: 70 } },
  steps: [
    { text: 'Enter the Fight Caves in the Glass Desert.' },
    { text: 'Survive waves 1-62 of increasingly difficult monsters.' },
    { text: 'Defeat the final boss on wave 63 (pray switches required).' },
    { text: 'Claim the Fire Cape from the reward chest.' },
  ],
  rewards: {
    xp: { ranged: 45000, prayer: 20000, hitpoints: 20000, attack: 12000 },
    items: [
      { id: 'fire_cape', name: 'Fire cape', count: 1 },
      { id: 101, name: 'Coins', count: 50000 },
    ],
    questPoints: 1,
    // Drops: Fire Cape (BIS melee cape)
    unlocks: ["item_unlock:fire_cape", "area:glass_desert_fight_caves"],
    chain_next: 'infernal_challenge',
  },
});

quests.define('infernal_challenge', {
  name: 'The Infernal Challenge',
  description: 'The ultimate test. 69 waves. Harder than anything else in Aelgard. The Infernal Cape awaits — if you survive.',
  difficulty: 'Grandmaster', questPoints: 2,
  requirements: { skills: { attack: 90, ranged: 90, magic: 85, prayer: 75, hitpoints: 90 }, quests: ['fight_caves'] },
  steps: [
    { text: 'Enter the Infernal Challenge in the deepest Glass Desert cave.' },
    { text: 'Survive waves 1-68 with prayer switching, positioning, and resource management.' },
    { text: 'Defeat the final boss on wave 69.' },
    { text: 'Claim the Infernal Cape.' },
  ],
  rewards: {
    xp: { ranged: 75000, magic: 40000, prayer: 30000, hitpoints: 30000, attack: 20000 },
    items: [
      { id: 'infernal_cape', name: 'Infernal cape', count: 1 },
      { id: 101, name: 'Coins', count: 200000 },
    ],
    questPoints: 2,
    // Drops: Infernal Cape (BIS cape in the game)
    unlocks: ["item_unlock:infernal_cape", "area:glass_desert_inferno", "raid:colosseum"],
  },
});

// ══════════════════════════════════════════════════════════════════════════════

console.log('[aelgard] 20 quest series loaded');
