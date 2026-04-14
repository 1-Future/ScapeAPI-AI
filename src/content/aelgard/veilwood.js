// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Veilwood
// Enchanted forest, elves, druid mysteries. Woodcutting paradise.
// Mid-level region (combat 25-70).
// ══════════════════════════════════════════════════════════════════════════════

const items = require('../../data/items');
const npcs = require('../../world/npcs');
const shops = require('../../data/shops');
const quests = require('../../data/quests');
const droptables = require('../../data/droptables');

// ── Items ──────────────────────────────────────────────────────────────────

items.define({ id: 6001, name: 'Elven silk', examine: 'Gossamer-thin silk spun by elven weavers.', value: 300, category: 'crafting', weight: 0.1 });
items.define({ id: 6002, name: 'Veilwood bark', examine: 'Bark from the ancient Veil trees. Glows faintly.', value: 120, category: 'herblore', weight: 0.5 });
items.define({ id: 6003, name: 'Moonpetal', examine: 'A flower that only blooms at night. Potent in potions.', value: 200, category: 'herblore', weight: 0.1 });
items.define({ id: 6004, name: 'Spirit seed', examine: 'A seed imbued with druidic energy.', value: 500, category: 'farming', weight: 0.1 });
items.define({ id: 6005, name: 'Druid staff', examine: 'A gnarled staff wreathed in living vines.', value: 3000, category: 'weapon', equipSlot: 'weapon', speed: 5, stats: { magic: 12, magic_strength: 6, prayer: 3 }, equipReqs: { magic: 25 } });
items.define({ id: 6006, name: 'Elven bow', examine: 'A bow of extraordinary craftsmanship.', value: 8000, category: 'weapon', equipSlot: 'weapon', speed: 4, stats: { ranged: 48 }, equipReqs: { ranged: 40 } });
items.define({ id: 6007, name: 'Elven arrow', examine: 'An arrow tipped with crystal.', value: 30, category: 'ranged', stackable: true, weight: 0, stats: { ranged_strength: 22 } });
items.define({ id: 6008, name: 'Fungal spore', examine: 'Spores from the deeper parts of the forest. Mildly toxic.', value: 15, category: 'herblore', weight: 0.1 });

// Boss uniques — The Veilmother
items.define({ id: 6050, name: "Veilmother's heartwood", examine: 'A fragment of the Veilmother — the oldest tree in the forest turned to fury.', value: 55000, category: 'crafting', weight: 5 });
items.define({ id: 6051, name: 'Verdant plate', examine: 'Armour grown from living wood. Self-repairing.', value: 65000, category: 'armour', equipSlot: 'body', stats: { def_stab: 60, def_slash: 65, def_crush: 55, def_magic: 20, prayer: 3 }, equipReqs: { defence: 45 } });
items.define({ id: 6052, name: 'Root whip', examine: 'A whip made of razor-sharp living roots.', value: 40000, category: 'weapon', equipSlot: 'weapon', speed: 4, stats: { slash: 50, melee_strength: 48 }, equipReqs: { attack: 45 } });

// ── Monsters ───────────────────────────────────────────────────────────────

npcs.defineNpc('moss_sprite', {
  name: 'Moss sprite', combat: 25, maxHp: 20, maxHit: 3,
  stats: { attack: 12, strength: 10, defence: 15 },
  attackSpeed: 4, attackRange: 3, attackStyle: 'magic',
  aggressive: false, wanderRadius: 5, respawnTicks: 30,
  examine: 'A tiny creature made of moss and mischief.',
  weakness: 'magic', tags: ['spirit', 'elemental'],
});

npcs.defineNpc('timber_wolf', {
  name: 'Timber wolf', combat: 30, maxHp: 30, maxHit: 5,
  stats: { attack: 18, strength: 20, defence: 12 },
  attackSpeed: 3, attackRange: 1, attackStyle: 'melee',
  aggressive: true, aggroRange: 5, wanderRadius: 6, respawnTicks: 35,
  examine: 'A large wolf at home in the dense forest.',
  weakness: 'stab', tags: ['beast'],
});

npcs.defineNpc('ent', {
  name: 'Ent', combat: 45, maxHp: 65, maxHit: 8,
  stats: { attack: 25, strength: 30, defence: 35 },
  attackSpeed: 6, attackRange: 1, attackStyle: 'melee', size: 2,
  aggressive: false, aggroRange: 3, wanderRadius: 3, respawnTicks: 80,
  examine: 'A walking tree. It does not look pleased.',
  weakness: 'slash', tags: ['plant'], resistance: 'crush',
});

npcs.defineNpc('unicorn', {
  name: 'Unicorn', combat: 20, maxHp: 25, maxHit: 3,
  stats: { attack: 8, strength: 10, defence: 12 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee',
  aggressive: false, wanderRadius: 8, respawnTicks: 50,
  examine: 'A majestic creature. Drops a horn.',
  weakness: 'ranged', tags: ['beast'],
});

npcs.defineNpc('fungal_mage', {
  name: 'Fungal mage', combat: 50, maxHp: 55, maxHit: 7,
  stats: { attack: 30, strength: 20, defence: 25 },
  attackSpeed: 5, attackRange: 5, attackStyle: 'magic',
  aggressive: true, aggroRange: 4, wanderRadius: 3, respawnTicks: 55,
  examine: 'A humanoid figure made entirely of fungus. Casts spore clouds.',
  weakness: 'slash', tags: ['plant'], resistance: 'magic',
});

npcs.defineNpc('shadow_panther', {
  name: 'Shadow panther', combat: 55, maxHp: 60, maxHit: 9,
  stats: { attack: 38, strength: 35, defence: 25 },
  attackSpeed: 3, attackRange: 1, attackStyle: 'melee',
  aggressive: true, aggroRange: 6, wanderRadius: 8, respawnTicks: 60,
  examine: 'A panther that moves through shadows. Nearly invisible.',
  weakness: 'magic', tags: ['beast', 'shadow'], resistance: 'melee',
});

npcs.defineNpc('elder_druid', {
  name: 'Elder druid', combat: 65, maxHp: 80, maxHit: 10,
  stats: { attack: 40, strength: 35, defence: 45 },
  attackSpeed: 5, attackRange: 6, attackStyle: 'magic', size: 1,
  aggressive: false, aggroRange: 3, wanderRadius: 2, respawnTicks: 80,
  examine: 'A druid corrupted by the forest. Attacks on sight near the sacred grove.',
  weakness: 'ranged', tags: ['human'], resistance: 'magic',
});

// Boss
npcs.defineNpc('the_veilmother', {
  name: 'The Veilmother', combat: 130, maxHp: 300, maxHit: 16,
  stats: { attack: 85, strength: 75, defence: 100 },
  attackSpeed: 6, attackRange: 4, attackStyle: 'magic', size: 4,
  aggressive: false, wanderRadius: 0, respawnTicks: 350,
  examine: 'The oldest tree in Veilwood. Now awake, and furious.',
  weakness: 'slash', tags: ['plant', 'boss'], resistance: 'ranged',
});

// ── Drop tables ────────────────────────────────────────────────────────────

droptables.define('moss_sprite', {
  always: [], main: [
    { id: 6008, name: 'Fungal spore', weight: 20, min: 1, max: 3 },
    { id: 6003, name: 'Moonpetal', weight: 5, min: 1, max: 1 },
    { id: 0, name: 'Nothing', weight: 20, min: 0, max: 0 },
  ],
});

droptables.define('timber_wolf', {
  always: [{ id: 100, name: 'Bones', min: 1, max: 1 }],
  main: [
    { id: 101, name: 'Coins', weight: 20, min: 10, max: 30 },
    { id: 103, name: 'Raw beef', weight: 10, min: 1, max: 1 },
    { id: 0, name: 'Nothing', weight: 15, min: 0, max: 0 },
  ],
});

droptables.define('ent', {
  always: [{ id: 2201, name: 'Logs', min: 1, max: 3 }],
  main: [
    { id: 2203, name: 'Willow logs', weight: 10, min: 1, max: 3 },
    { id: 2204, name: 'Maple logs', weight: 5, min: 1, max: 2 },
    { id: 6002, name: 'Veilwood bark', weight: 3, min: 1, max: 1 },
    { id: 6004, name: 'Spirit seed', weight: 1, min: 1, max: 1 },
    { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 },
  ],
});

droptables.define('unicorn', {
  always: [{ id: 100, name: 'Bones', min: 1, max: 1 }],
  main: [
    { id: 101, name: 'Coins', weight: 15, min: 10, max: 40 },
    { id: 0, name: 'Nothing', weight: 20, min: 0, max: 0 },
  ],
});

droptables.define('fungal_mage', {
  always: [],
  main: [
    { id: 6008, name: 'Fungal spore', weight: 15, min: 2, max: 5 },
    { id: 101, name: 'Coins', weight: 10, min: 30, max: 100 },
    { id: 6003, name: 'Moonpetal', weight: 5, min: 1, max: 2 },
    { id: 6005, name: 'Druid staff', weight: 1, min: 1, max: 1 },
    { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 },
  ],
});

droptables.define('the_veilmother', {
  always: [{ id: 2206, name: 'Magic logs', min: 5, max: 10 }],
  main: [
    { id: 101, name: 'Coins', weight: 8, min: 1000, max: 5000 },
    { id: 6001, name: 'Elven silk', weight: 5, min: 3, max: 5 },
    { id: 6004, name: 'Spirit seed', weight: 4, min: 2, max: 3 },
    { id: 6002, name: 'Veilwood bark', weight: 6, min: 5, max: 10 },
  ],
  tertiary: [
    { id: 6050, name: "Veilmother's heartwood", chance: 64, min: 1, max: 1 },
    { id: 6051, name: 'Verdant plate', chance: 128, min: 1, max: 1 },
    { id: 6052, name: 'Root whip', chance: 128, min: 1, max: 1 },
  ],
});

// ── NPCs ───────────────────────────────────────────────────────────────────

npcs.defineNpc('elven_ranger_lyris', {
  name: 'Ranger Lyris', combat: 0, maxHp: 1, size: 1,
  aggressive: false, wanderRadius: 0, canMove: false,
  examine: 'An elven ranger who patrols the forest edge.',
  dialogue: { type: 'quest', questId: 'the_veilwood_covenant' },
});

npcs.defineNpc('elven_fletcher_tarin', {
  name: 'Fletcher Tarin', combat: 0, maxHp: 1, size: 1,
  aggressive: false, wanderRadius: 0, canMove: false,
  examine: 'An elven fletcher who sells bows and arrows.',
  dialogue: { type: 'shop', shopId: 'veilwood_fletcher' },
});

// ── Shops ──────────────────────────────────────────────────────────────────

shops.define('veilwood_fletcher', {
  name: "Tarin's Fletching", npc: 'Fletcher Tarin', type: 'specialty',
  stock: [
    { id: 6006, name: 'Elven bow', base: 2, price: 8000 },
    { id: 6007, name: 'Elven arrow', base: 200, price: 30 },
    { id: 6005, name: 'Druid staff', base: 3, price: 3000 },
  ],
  restockRate: 400,
});

// ── Quests ──────────────────────────────────────────────────────────────────

quests.define('the_veilwood_covenant', {
  name: 'The Veilwood Covenant',
  description: 'The elves say the forest is dying from the inside. The druids blame the elves. Someone has to find the truth.',
  difficulty: 'Intermediate',
  questPoints: 2,
  requirements: { skills: { woodcutting: 20, herblore: 10, fletching: 15, ranged: 10 } },
  steps: [
    { text: 'Talk to Ranger Lyris at the Veilwood border.' },
    { text: 'Prove yourself to the elves by passing a ranged test (Ranged 10).' },
    { text: 'Investigate the dying trees in the sacred grove.' },
    { text: 'Collect 3 Moonpetals from the deeper forest.' },
    { text: 'Fletch an elven arrow as a gift for the druids (Fletching 15).' },
    { text: 'Brew a divination potion with the Moonpetals and Veilwood bark (Herblore 10).' },
    { text: 'Use the potion on the dying Veil Tree to reveal the corruption source.' },
    { text: 'Confront the corrupted Elder Druid.' },
    { text: 'Return to Ranger Lyris with proof.' },
  ],
  rewards: {
    xp: { woodcutting: 2000, herblore: 1000, magic: 500 },
    items: [{ id: 101, name: 'Coins', count: 3000 }, { id: 6006, name: 'Elven bow', count: 1 }],
    questPoints: 2,
  },
});

console.log('[aelgard] Veilwood content loaded');
