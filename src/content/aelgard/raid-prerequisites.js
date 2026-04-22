// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Raid Prerequisite Chains
// Every raid needs quest/skill requirements to access. This creates
// natural progression: you can't just jump to endgame raids.
// The JOURNEY to unlock each raid is content itself.
//
// Manifesto P08: Each raid unlock is a breakpoint
// Manifesto P09: Raid prereqs require multiple skills
// ══════════════════════════════════════════════════════════════════════════════

const quests = require('../../data/quests');

// ── Raid unlock quests — each raid has a quest chain to access it ──────────

// Chambers of Aelgard unlock
quests.define('coa_key', {
  name: 'The Crystal Key',
  description: 'The Chambers of Aelgard are sealed. Find the crystal key fragments scattered across the Glass Desert.',
  difficulty: 'Master', questPoints: 3,
  requirements: { skills: { attack: 65, mining: 60, magic: 55, agility: 50, prayer: 45 }, quests: ['the_glass_prophecy'] },
  steps: [
    { text: 'Talk to Crystal Sage Orin about the sealed Chambers.' },
    { text: 'Mine 3 crystal key fragments from nodes across the Glass Desert (Mining 60).' },
    { text: 'Navigate the crystal canyon to the entrance (Agility 50).' },
    { text: 'Use magic to unseal the outer door (Magic 55).' },
    { text: 'Pray at the ancient altar to attune the key (Prayer 45).' },
    { text: 'Defeat the Chamber Guardian to prove worthiness.' },
    { text: 'The Chambers are now open.' },
  ],
  rewards: {
    xp: { mining: 5000, magic: 3000, agility: 2000, prayer: 2000 },
    questPoints: 3,
    unlocks: ["raid:chambers_of_aelgard"],
  },
});

// Theatre of Shadows unlock
quests.define('tos_key', {
  name: 'A Taste of Hope',
  description: "Gain entry to the Theatre of Shadows beneath Castle Malachar. The vampyres' darkest secret.",
  difficulty: 'Master', questPoints: 3,
  requirements: { skills: { attack: 65, herblore: 50, thieving: 45, agility: 45, crafting: 40 }, quests: ['blood_rites'] },
  steps: [
    { text: "Investigate rumours of the Theatre from Moryskah villagers." },
    { text: "Infiltrate the vampyre camp using a disguise (Thieving 45, Crafting 40)." },
    { text: "Steal the Theatre invitation from a vampyre noble." },
    { text: "Brew an anti-vampyre potion to survive the entrance wards (Herblore 50)." },
    { text: "Navigate the catacombs beneath Castle Malachar (Agility 45)." },
    { text: "Defeat the entrance guardian." },
    { text: "The Theatre of Shadows is now accessible." },
  ],
  rewards: {
    xp: { attack: 5000, herblore: 3000, thieving: 2000, agility: 2000, crafting: 1500 },
    questPoints: 3,
    unlocks: ["raid:theatre_of_shadows"],
  },
});

// Tombs of Aelgard unlock
quests.define('toa_key', {
  name: 'Beneath the Pyramid',
  description: 'The Tombs of Aelgard lie beneath the Boneyard pyramid. Find the entrance and survive the trials.',
  difficulty: 'Master', questPoints: 3,
  requirements: { skills: { attack: 70, mining: 55, prayer: 50, agility: 50, thieving: 40 }, quests: ['sand_and_secrets', 'desert_treasure'] },
  steps: [
    { text: "Return to Archaeologist Veris at the Boneyard excavation." },
    { text: "Mine through the sealed tomb entrance (Mining 55)." },
    { text: "Navigate the trapped corridors (Agility 50)." },
    { text: "Disarm the scarab sentinel (Thieving 40)." },
    { text: "Pray at the pharaoh's altar for passage (Prayer 50)." },
    { text: "Defeat the tomb guardian." },
    { text: "The Tombs of Aelgard are now open." },
  ],
  rewards: {
    xp: { attack: 5000, mining: 3000, prayer: 3000, agility: 2000, thieving: 1500 },
    questPoints: 3,
    unlocks: ["raid:tombs_of_aelgard"],
  },
});

// The Gauntlet unlock
quests.define('gauntlet_key', {
  name: 'Song of the Elves',
  description: 'The elves of Veilwood guard a secret challenge — The Gauntlet. Earn their trust to access it.',
  difficulty: 'Grandmaster', questPoints: 4,
  requirements: { skills: { attack: 70, ranged: 70, magic: 70, agility: 65, herblore: 70, woodcutting: 65, mining: 60, smithing: 60, crafting: 60, farming: 55, hunter: 55, construction: 55 }, quests: ['the_veilwood_covenant', 'lunar_diplomacy'] },
  steps: [
    { text: "Talk to the Elven Elder in the Veilwood village." },
    { text: "Prove mastery of combat by defeating 3 elven champions (all combat styles)." },
    { text: "Prove mastery of gathering by collecting materials from Veilwood, Sootworks, and Saltbrine." },
    { text: "Prove mastery of crafting by smithing an elven weapon (Smithing 60, Crafting 60)." },
    { text: "Navigate the lost elven ruins (Agility 65)." },
    { text: "Complete the trial of the crystal seed (all gathering + processing skills tested)." },
    { text: "The Gauntlet is now available." },
  ],
  rewards: {
    xp: { agility: 10000, herblore: 5000, mining: 5000, smithing: 5000, crafting: 5000, woodcutting: 3000 },
    questPoints: 4,
    unlocks: ["raid:the_gauntlet"],
  },
});

// King's Crypt unlock
quests.define('kings_crypt_key', {
  name: 'The Restless Dead',
  description: 'Ghosts stir beneath the Heartlands castle. Investigate the royal crypt.',
  difficulty: 'Intermediate', questPoints: 2,
  requirements: { skills: { attack: 40, prayer: 30, magic: 25, crafting: 20 }, quests: ['forge_of_duran'] },
  steps: [
    { text: "Talk to the castle steward about strange noises from the basement." },
    { text: "Enter the castle basement and find the sealed crypt door." },
    { text: "Craft a ghostly key from silver and enchant it (Crafting 20, Magic 25)." },
    { text: "Pray at the shrine to prepare for the undead (Prayer 30)." },
    { text: "Enter the King's Crypt." },
  ],
  rewards: {
    xp: { prayer: 2000, magic: 1000, crafting: 500 },
    questPoints: 2,
    unlocks: ["raid:king_s_crypt"],
  },
});

// Blood Sanctum unlock
quests.define('blood_sanctum_key', {
  name: 'Sins of the Father',
  description: 'The Blood Sanctum lies beneath the oldest vampyre cathedral in Moryskah.',
  difficulty: 'Master', questPoints: 3,
  requirements: { skills: { attack: 60, defence: 55, prayer: 50, herblore: 45, crafting: 40 }, quests: ['blood_rites'] },
  steps: [
    { text: "Return to Father Dorin after defeating Malachar." },
    { text: "Learn about the Blood Archon — a vampyre lord older than Malachar." },
    { text: "Gather sacred water from 3 Moryskah shrines." },
    { text: "Brew the vampyre repellent (Herblore 45)." },
    { text: "Craft a blessed chain to bind the Sanctum door (Crafting 40)." },
    { text: "Descend into the Blood Sanctum." },
  ],
  rewards: {
    xp: { attack: 5000, prayer: 3000, herblore: 2000, crafting: 1500 },
    questPoints: 3,
    unlocks: ["raid:blood_sanctum"],
  },
});

// The Crucible unlock
quests.define('crucible_key', {
  name: "The Forgemaster's Challenge",
  description: 'Forgemaster Brun challenges the greatest smiths to enter The Crucible.',
  difficulty: 'Experienced', questPoints: 2,
  requirements: { skills: { smithing: 60, mining: 55, firemaking: 50, agility: 40 }, quests: ['sootworks_rising'] },
  steps: [
    { text: "Talk to Forgemaster Brun about The Crucible." },
    { text: "Smith a masterwork ingot from soot-iron (Smithing 60)." },
    { text: "Mine volcanic materials from the deep vein (Mining 55)." },
    { text: "Light the ceremonial forge flame (Firemaking 50)." },
    { text: "Navigate the steam pipe entrance (Agility 40)." },
    { text: "Enter The Crucible." },
  ],
  rewards: {
    xp: { smithing: 4000, mining: 2000, firemaking: 1500, agility: 1000 },
    questPoints: 2,
    unlocks: ["raid:crucible"],
  },
});

// Sunken Temple unlock
quests.define('sunken_temple_key', {
  name: 'Depths of Despair',
  description: 'The Sunken Temple lies beneath the Saltbrine waters. Find the entrance.',
  difficulty: 'Experienced', questPoints: 2,
  requirements: { skills: { fishing: 50, magic: 45, agility: 40, prayer: 35 }, quests: ['whispers_from_the_depths'] },
  steps: [
    { text: "Talk to Captain Reed about the underwater ruins." },
    { text: "Dive to the temple entrance (requires waterbreathing potion)." },
    { text: "Navigate the kelp maze (Agility 40)." },
    { text: "Unseal the temple door with water magic (Magic 45)." },
    { text: "Pray at the submerged altar (Prayer 35)." },
    { text: "The Sunken Temple is now accessible." },
  ],
  rewards: {
    xp: { fishing: 3000, magic: 2000, agility: 1500, prayer: 1000 },
    questPoints: 2,
    unlocks: ["raid:sunken_temple"],
  },
});

// Lucid Nightmare unlock
quests.define('lucid_nightmare_key', {
  name: "Into the Deep Dream",
  description: 'Access the deepest layer of the Inkweald — the Lucid Nightmare.',
  difficulty: 'Master', questPoints: 3,
  requirements: { skills: { magic: 70, prayer: 60, herblore: 55, runecrafting: 50, hitpoints: 70 }, quests: ['the_hollow_choirs_song'] },
  steps: [
    { text: "Talk to Lucid Keeper Yara about going deeper." },
    { text: "Brew a deep sleep potion (Herblore 55) using nightmare shards and lucid essence." },
    { text: "Craft dream runes at the soul altar (Runecrafting 50)." },
    { text: "Enter the deep dream while protected by prayer (Prayer 60)." },
    { text: "Navigate the 3 trial rooms to reach the Nightmare core." },
    { text: "The Lucid Nightmare is now accessible." },
  ],
  rewards: {
    xp: { magic: 8000, prayer: 5000, herblore: 3000, runecrafting: 3000 },
    questPoints: 3,
    unlocks: ["raid:lucid_nightmare"],
  },
});

// Prism Labyrinth unlock
quests.define('prism_labyrinth_key', {
  name: 'Shattered Light',
  description: 'The Prism Labyrinth appears only when light hits the Glass Desert at a specific angle.',
  difficulty: 'Experienced', questPoints: 2,
  requirements: { skills: { magic: 55, mining: 50, crafting: 45, firemaking: 40 }, quests: ['the_glass_prophecy'] },
  steps: [
    { text: "Talk to Crystal Sage Orin about the light phenomenon." },
    { text: "Mine 3 prism lenses from crystal nodes (Mining 50)." },
    { text: "Craft a light redirector (Crafting 45)." },
    { text: "Use firemaking to ignite the beacon (Firemaking 40)." },
    { text: "Aim the light at the correct crystal to reveal the labyrinth entrance (Magic 55)." },
    { text: "The Prism Labyrinth appears." },
  ],
  rewards: {
    xp: { magic: 3000, mining: 2000, crafting: 1500, firemaking: 1000 },
    questPoints: 2,
    unlocks: ["raid:prism_labyrinth"],
  },
});

// The Exodus unlock (final raid)
quests.define('exodus_key', {
  name: 'The Final Threshold',
  description: 'The portal to another world opens in the Glass Desert. This is the endgame of Aelgard.',
  difficulty: 'Grandmaster', questPoints: 5,
  requirements: {
    skills: { attack: 80, ranged: 80, magic: 80, prayer: 70, hitpoints: 80, mining: 70, smithing: 65, herblore: 70, agility: 65, construction: 60 },
    quests: ['the_last_light', 'coa_key', 'tos_key', 'toa_key'],
  },
  steps: [
    { text: "Complete all 3 base raids at least once." },
    { text: "Talk to Crystal Sage Orin about the corruption spreading." },
    { text: "Travel to each region and collect a corruption sample (8 samples from 8 regions)." },
    { text: "Bring the samples to the Heartlands scholars for analysis." },
    { text: "Travel to the Sootworks to forge a corruption-resistant weapon (Smithing 65)." },
    { text: "Brew anti-corruption elixirs (Herblore 70)." },
    { text: "Build a portal frame at the Glass Desert (Construction 60)." },
    { text: "Activate the portal. The Exodus awaits." },
  ],
  rewards: {
    xp: { attack: 15000, magic: 15000, ranged: 10000, prayer: 10000, mining: 5000, smithing: 5000, herblore: 5000, agility: 5000, construction: 5000 },
    questPoints: 5,
    unlocks: ["raid:the_exodus"],
  },
});

// ── Raid difficulty tier structure ─────────────────────────────────────────

const raidTiers = [
  { tier: 'Entry', raids: ["King's Crypt", "Siege of Heartlands"], combatReq: '40-60', description: 'Learn raid mechanics. Forgiving.' },
  { tier: 'Intermediate', raids: ["Pharaoh's Sanctum", "Sunken Temple", "Crucible", "Mushroom Grotto", "Prism Labyrinth"], combatReq: '60-80', description: 'Real raid mechanics. Punishing mistakes.' },
  { tier: 'Advanced', raids: ["Chambers of Aelgard", "Blood Sanctum", "Root of the World Tree", "Deep Engine", "Tempest", "Tidal Fortress", "Volcanic Depths", "Frost Citadel"], combatReq: '80-100', description: 'Requires mastery. Group coordination essential.' },
  { tier: 'Expert', raids: ["Theatre of Shadows", "Tombs of Aelgard", "Leviathan's Spine", "Catacombs of the Damned", "Revenant Caves", "Grand Hunt", "Consciousness Rift", "Dream Colosseum", "Iron Gauntlet"], combatReq: '90+', description: 'The hardest content. Peak PvM.' },
  { tier: 'Ultimate', raids: ["The Gauntlet", "ToS Hard Mode", "Lucid Nightmare", "Calamity Protocol", "Wilderness Fortress", "Abyssal Nexus", "The Exodus", "Colosseum"], combatReq: 'Max stats', description: 'The absolute pinnacle. Legends only.' },
];

console.log(`[aelgard] Raid prerequisites: ${11} unlock quests + tier structure defined`);

module.exports = { raidTiers };
