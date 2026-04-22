// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Saltbrine Reach
// Pirate coast, sea villages, fishing hub. Sailing content.
// Mid-level region (combat 20-65).
// ══════════════════════════════════════════════════════════════════════════════

const items = require('../../data/items');
const npcs = require('../../world/npcs');
const shops = require('../../data/shops');
const quests = require('../../data/quests');
const droptables = require('../../data/droptables');

// ── Items ──────────────────────────────────────────────────────────────────

items.define({ id: 8001, name: 'Saltbrine pearl', examine: 'A pearl from the Saltbrine oyster beds. Valuable.', value: 500, category: 'crafting', weight: 0.1 });
items.define({ id: 8002, name: 'Sea glass', examine: 'Smooth glass worn by the ocean. Used in jewellery.', value: 30, category: 'crafting', weight: 0.1 });
items.define({ id: 8003, name: 'Pirate rum', examine: 'Strong enough to strip barnacles.', value: 20, category: 'food', weight: 0.5 });
items.define({ id: 8004, name: 'Barnacle shell', examine: 'A hard shell encrusted with salt.', value: 10, category: 'crafting', weight: 0.3 });
items.define({ id: 8005, name: 'Anchor chain link', examine: 'A heavy iron link from a ship anchor.', value: 40, category: 'crafting', weight: 3 });
items.define({ id: 8006, name: 'Coral fragment', examine: 'A piece of living coral. Warm to the touch.', value: 80, category: 'crafting', weight: 0.5 });
items.define({ id: 8007, name: 'Harpoon', examine: 'A sturdy harpoon for large fish.', value: 250, category: 'weapon', equipSlot: 'weapon', speed: 5, stats: { stab: 30, melee_strength: 25 }, equipReqs: { attack: 20 } });
items.define({ id: 8008, name: 'Cutlass', examine: 'A curved pirate blade. Fast and deadly.', value: 1500, category: 'weapon', equipSlot: 'weapon', speed: 3, stats: { slash: 32, melee_strength: 28 }, equipReqs: { attack: 30 } });

// Boss uniques — Kraken of Saltbrine
items.define({ id: 8050, name: 'Kraken tentacle', examine: 'A severed tentacle still twitching with dark energy.', value: 50000, category: 'weapon', equipSlot: 'weapon', speed: 4, stats: { slash: 62, melee_strength: 58, magic: 5 }, equipReqs: { attack: 50 } });
items.define({ id: 8051, name: 'Tidal amulet', examine: 'An amulet that surges with ocean power.', value: 45000, category: 'jewellery', equipSlot: 'neck', stats: { magic: 10, magic_strength: 5, prayer: 3 }, equipReqs: { magic: 45 } });
items.define({ id: 8052, name: 'Abyssal trident', examine: 'A trident pulled from the depths. Channels water magic.', value: 60000, category: 'weapon', equipSlot: 'weapon', speed: 4, stats: { magic: 25, magic_strength: 18 }, equipReqs: { magic: 50 } });

// ── Monsters ───────────────────────────────────────────────────────────────

npcs.defineNpc('seagull', {
  name: 'Seagull', combat: 1, maxHp: 2, maxHit: 1,
  stats: { attack: 1, strength: 1, defence: 1 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee',
  aggressive: false, wanderRadius: 8, respawnTicks: 15,
  examine: 'Noisy and persistent.',
  weakness: 'ranged', tags: ['beast'],
});

npcs.defineNpc('rock_crab_coastal', {
  name: 'Rock crab', combat: 13, maxHp: 50, maxHit: 1,
  stats: { attack: 1, strength: 1, defence: 30 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee',
  aggressive: true, aggroRange: 1, wanderRadius: 0, respawnTicks: 40,
  examine: 'Looks like a rock until you step on it.',
  weakness: 'crush', tags: ['armoured', 'beast'],
});

npcs.defineNpc('pirate', {
  name: 'Pirate', combat: 35, maxHp: 35, maxHit: 5,
  stats: { attack: 22, strength: 20, defence: 18 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee',
  aggressive: true, aggroRange: 3, wanderRadius: 4, respawnTicks: 45,
  examine: 'A cutlass-wielding scoundrel.',
  weakness: 'stab', tags: ['human'],
});

npcs.defineNpc('pirate_captain', {
  name: 'Pirate captain', combat: 55, maxHp: 65, maxHit: 8,
  stats: { attack: 35, strength: 32, defence: 30 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee',
  aggressive: false, aggroRange: 3, wanderRadius: 3, respawnTicks: 80,
  examine: 'The leader of a pirate crew. Well-armed.',
  weakness: 'magic', tags: ['human'], resistance: 'melee', // armoured captain, magic bypasses plate
});

npcs.defineNpc('sea_snake', {
  name: 'Sea snake', combat: 30, maxHp: 25, maxHit: 5,
  stats: { attack: 15, strength: 18, defence: 10 },
  attackSpeed: 3, attackRange: 1, attackStyle: 'melee',
  aggressive: true, aggroRange: 3, wanderRadius: 5, respawnTicks: 35,
  examine: 'A venomous sea serpent.',
  poisonDamage: 3,
  weakness: 'slash', tags: ['beast'],
});

npcs.defineNpc('lobstrosity', {
  name: 'Lobstrosity', combat: 45, maxHp: 60, maxHit: 7,
  stats: { attack: 28, strength: 30, defence: 35 },
  attackSpeed: 5, attackRange: 1, attackStyle: 'melee', size: 2,
  aggressive: true, aggroRange: 4, wanderRadius: 4, respawnTicks: 60,
  examine: 'An enormous lobster. Pinches hurt.',
  weakness: 'crush', tags: ['beast', 'armoured'],
});

npcs.defineNpc('siren', {
  name: 'Siren', combat: 50, maxHp: 40, maxHit: 8,
  stats: { attack: 30, strength: 15, defence: 20 },
  attackSpeed: 5, attackRange: 6, attackStyle: 'magic',
  aggressive: true, aggroRange: 6, wanderRadius: 3, respawnTicks: 55,
  examine: 'A beautiful and deadly creature that sings from the rocks.',
  weakness: 'ranged', tags: ['spirit'], resistance: 'melee', // ethereal, hard to hit up close
});

// Boss
npcs.defineNpc('kraken_saltbrine', {
  name: 'Kraken of Saltbrine', combat: 140, maxHp: 320, maxHit: 20,
  stats: { attack: 90, strength: 85, defence: 95 },
  attackSpeed: 4, attackRange: 5, attackStyle: 'magic', size: 5,
  aggressive: false, wanderRadius: 0, respawnTicks: 350,
  examine: 'A colossal kraken that lurks beneath the Saltbrine harbour.',
  weakness: 'slash', tags: ['beast', 'boss'], resistance: 'magic', // tentacles are physical, cut them
});

// ── Drop tables ────────────────────────────────────────────────────────────

droptables.define('pirate', {
  always: [{ id: 100, name: 'Bones', min: 1, max: 1 }],
  main: [
    { id: 101, name: 'Coins', weight: 20, min: 10, max: 50 },
    { id: 8003, name: 'Pirate rum', weight: 10, min: 1, max: 1 },
    { id: 8008, name: 'Cutlass', weight: 2, min: 1, max: 1 },
    { id: 0, name: 'Nothing', weight: 15, min: 0, max: 0 },
  ],
});

droptables.define('pirate_captain', {
  always: [{ id: 100, name: 'Bones', min: 1, max: 1 }],
  main: [
    { id: 101, name: 'Coins', weight: 12, min: 50, max: 200 },
    { id: 8008, name: 'Cutlass', weight: 5, min: 1, max: 1 },
    { id: 8001, name: 'Saltbrine pearl', weight: 2, min: 1, max: 1 },
    { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 },
  ],
});

droptables.define('lobstrosity', {
  always: [], main: [
    { id: 2304, name: 'Raw lobster', weight: 15, min: 1, max: 2 },
    { id: 8004, name: 'Barnacle shell', weight: 10, min: 1, max: 3 },
    { id: 101, name: 'Coins', weight: 10, min: 20, max: 80 },
    { id: 0, name: 'Nothing', weight: 10, min: 0, max: 0 },
  ],
});

droptables.define('siren', {
  always: [], main: [
    { id: 101, name: 'Coins', weight: 10, min: 30, max: 120 },
    { id: 8001, name: 'Saltbrine pearl', weight: 3, min: 1, max: 1 },
    { id: 8006, name: 'Coral fragment', weight: 5, min: 1, max: 2 },
    { id: 0, name: 'Nothing', weight: 10, min: 0, max: 0 },
  ],
});

droptables.define('kraken_saltbrine', {
  always: [{ id: 107, name: 'Dragon bones', min: 1, max: 1 }],
  main: [
    { id: 101, name: 'Coins', weight: 6, min: 3000, max: 10000 },
    { id: 8001, name: 'Saltbrine pearl', weight: 5, min: 3, max: 6 },
    { id: 8006, name: 'Coral fragment', weight: 4, min: 5, max: 10 },
    { id: 2306, name: 'Raw shark', weight: 5, min: 5, max: 10 },
  ],
  tertiary: [
    { id: 8050, name: 'Kraken tentacle', chance: 128, min: 1, max: 1 },
    { id: 8051, name: 'Tidal amulet', chance: 128, min: 1, max: 1 },
    { id: 8052, name: 'Abyssal trident', chance: 256, min: 1, max: 1 },
  ],
});

// ── NPCs ───────────────────────────────────────────────────────────────────

npcs.defineNpc('harbourmaster_cole', {
  name: 'Harbourmaster Cole', combat: 0, maxHp: 1, size: 1,
  aggressive: false, wanderRadius: 0, canMove: false,
  examine: 'Manages the Saltbrine docks. Perpetually stressed.',
  dialogue: { type: 'quest', questId: 'pirate_king' },
});

npcs.defineNpc('fishmonger_mara', {
  name: 'Fishmonger Mara', combat: 0, maxHp: 1, size: 1,
  aggressive: false, wanderRadius: 0, canMove: false,
  examine: 'Sells fresh fish and fishing supplies.',
  dialogue: { type: 'shop', shopId: 'saltbrine_fish' },
});

// ── Shops ──────────────────────────────────────────────────────────────────

shops.define('saltbrine_fish', {
  name: "Mara's Fish & Tackle", npc: 'Fishmonger Mara', type: 'specialty',
  stock: [
    { id: 8007, name: 'Harpoon', base: 5, price: 250 },
    { id: 2004, name: 'Trout', base: 20, price: 20 },
    { id: 2005, name: 'Salmon', base: 15, price: 40 },
    { id: 2006, name: 'Lobster', base: 10, price: 150 },
    { id: 8003, name: 'Pirate rum', base: 10, price: 20 },
  ],
  restockRate: 150,
});

// ── Quests ──────────────────────────────────────────────────────────────────

quests.define('pirate_king', {
  name: 'Pirate King',
  description: 'Pirates have blockaded Saltbrine harbour. Harbourmaster Cole needs someone to infiltrate their flagship and end the blockade.',
  difficulty: 'Intermediate',
  questPoints: 2,
  requirements: { skills: { attack: 25, agility: 20, thieving: 15 } }, // Agility for ship climbing, Thieving to steal disguise
  steps: [
    { text: 'Talk to Harbourmaster Cole about the blockade.' },
    { text: 'Steal a pirate disguise from the beach camp (Thieving 15).' },
    { text: 'Board the pirate flagship using the disguise.' },
    { text: 'Climb the rigging to reach the captain\'s quarters (Agility 20).' },
    { text: 'Defeat the Pirate captain in ship-board combat.' },
    { text: 'Signal the harbour guard to retake the ship.' },
    { text: 'Return to Harbourmaster Cole.' },
  ],
  rewards: {
    xp: { attack: 2000, strength: 1500, agility: 500 },
    items: [{ id: 101, name: 'Coins', count: 4000 }, { id: 8008, name: 'Cutlass', count: 1 }],
    questPoints: 2,
    unlocks: ["item_unlock:captains_hook", "teleport:charter_ships"],
    chain_next: 'the_pirate_kings_gold',
  },
});

quests.define('whispers_from_the_depths', {
  name: 'Whispers from the Depths',
  description: 'Fishermen report hearing singing from beneath the waves. Something ancient stirs in the deep waters off Saltbrine.',
  difficulty: 'Experienced',
  questPoints: 3,
  requirements: { quests: ['pirate_king'], skills: { fishing: 40, magic: 30, herblore: 25, prayer: 20 } }, // Herblore for waterbreathing potion, Prayer to resist siren's call
  steps: [
    { text: 'Talk to Fishmonger Mara about the singing.' },
    { text: 'Travel to Moryskah to ask the Bog Witch about siren magic.' },
    { text: 'Brew a waterbreathing potion using ingredients from Moryskah swamp (Herblore 25).' },
    { text: 'Return to Saltbrine and investigate the singing by fishing at the deep water point.' },
    { text: 'Pray at the harbour shrine to resist the siren\'s call (Prayer 20).' },
    { text: 'Follow the siren call to the underwater cave entrance.' },
    { text: 'Navigate the flooded tunnels.' },
    { text: 'Discover the Kraken\'s lair.' },
    { text: 'Weaken the Kraken by destroying its 4 anchor points.' },
    { text: 'Defeat the Kraken of Saltbrine.' },
    { text: 'Return to Mara with proof of the kill.' },
  ],
  rewards: {
    xp: { fishing: 4000, magic: 3000, hitpoints: 2000 },
    items: [{ id: 101, name: 'Coins', count: 8000 }],
    questPoints: 3,
    unlocks: ["item_unlock:whispers_from_the_depths_completion"],
    chain_next: 'sunken_temple_key',
  },
});

console.log('[aelgard] Saltbrine Reach content loaded');
