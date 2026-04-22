// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — The Glass Desert
// Crystalline wasteland. Crystal Wyrm lives here. Endgame region.
// High level (combat 80-150+). Prism wizards, glass golems.
// ══════════════════════════════════════════════════════════════════════════════

const items = require('../../data/items');
const npcs = require('../../world/npcs');
const shops = require('../../data/shops');
const quests = require('../../data/quests');
const droptables = require('../../data/droptables');

// ── Items ──────────────────────────────────────────────────────────────────

items.define({ id: 10001, name: 'Crystal shard', examine: 'A sharp fragment of pure crystal.', value: 300, category: 'crafting', weight: 0.3, stackable: true });
items.define({ id: 10002, name: 'Prism lens', examine: 'A perfectly cut lens that splits light into its components.', value: 1000, category: 'crafting', weight: 0.2 });
items.define({ id: 10003, name: 'Glass sand', examine: 'Sand so fine and pure it can be used to craft crystal.', value: 50, category: 'crafting', weight: 1 });
items.define({ id: 10004, name: 'Refracted essence', examine: 'Magic split into its spectral components. Each colour is a different element.', value: 2000, category: 'rune', weight: 0.1 });
items.define({ id: 10005, name: 'Crystal arrowheads', examine: 'Arrowheads carved from pure crystal. Incredibly sharp.', value: 100, category: 'ranged', stackable: true, weight: 0, stats: { ranged_strength: 30 } });

// The Glass Tyrant uniques (top solo boss)
items.define({ id: 10050, name: 'Glass crown', examine: 'A crown of living crystal. Shifts colour with your mood.', value: 150000, category: 'armour', equipSlot: 'head', stats: { magic: 8, ranged: 8, prayer: 6, def_stab: 25, def_slash: 25, def_crush: 25, def_magic: 25, def_ranged: 25 }, equipReqs: { defence: 65 } });
items.define({ id: 10051, name: 'Prismatic blade', examine: 'A sword made of layered crystal. Each swing refracts differently.', value: 130000, category: 'weapon', equipSlot: 'weapon', speed: 4, stats: { slash: 80, melee_strength: 75, magic: 5 }, equipReqs: { attack: 70 } });

// Veldrak, the Last Dragon uniques (endgame world boss)
items.define({ id: 10060, name: 'Dragon shard', examine: 'A fragment of Veldrak\'s crystallized heart. Pulses with ancient fire.', value: 200000, category: 'crafting', weight: 2 });
items.define({ id: 10061, name: "Veldrak's talon", examine: 'The claw of the last dragon. An unparalleled weapon.', value: 250000, category: 'weapon', equipSlot: 'weapon', speed: 4, stats: { slash: 90, melee_strength: 88 }, equipReqs: { attack: 75 } });
items.define({ id: 10062, name: "Veldrak's scale mail", examine: 'Armour crafted from dragon scales fused with crystal.', value: 280000, category: 'armour', equipSlot: 'body', stats: { def_stab: 95, def_slash: 98, def_crush: 90, def_magic: 40, def_ranged: 80, prayer: 3 }, equipReqs: { defence: 75 } });

// ── Monsters ───────────────────────────────────────────────────────────────

npcs.defineNpc('glass_spider', {
  name: 'Glass spider', combat: 65, maxHp: 50, maxHit: 8,
  stats: { attack: 40, strength: 35, defence: 30 },
  attackSpeed: 3, attackRange: 1, attackStyle: 'melee',
  aggressive: true, aggroRange: 4, wanderRadius: 5, respawnTicks: 50,
  examine: 'Transparent and razor-sharp. Hard to see coming.',
  weakness: 'crush', tags: ['beast', 'armoured'], // glass shell shatters from crush
});

npcs.defineNpc('prism_wizard', {
  name: 'Prism wizard', combat: 85, maxHp: 80, maxHit: 14,
  stats: { attack: 55, strength: 30, defence: 45 },
  attackSpeed: 5, attackRange: 7, attackStyle: 'magic',
  aggressive: true, aggroRange: 5, wanderRadius: 3, respawnTicks: 65,
  examine: 'A wizard who channels magic through crystal lenses.',
  weakness: 'ranged', tags: ['human'], resistance: 'magic', // crystal lenses refract incoming spells
});

npcs.defineNpc('glass_golem', {
  name: 'Glass golem', combat: 95, maxHp: 130, maxHit: 15,
  stats: { attack: 60, strength: 55, defence: 70 },
  attackSpeed: 5, attackRange: 1, attackStyle: 'melee', size: 2,
  aggressive: false, aggroRange: 3, wanderRadius: 2, respawnTicks: 90,
  examine: 'A towering construct of fused glass. Reflects projectiles.',
  weakness: 'crush', tags: ['construct', 'armoured'], resistance: 'ranged', // literally reflects arrows
});

npcs.defineNpc('crystal_bat', {
  name: 'Crystal bat', combat: 70, maxHp: 45, maxHit: 7,
  stats: { attack: 42, strength: 38, defence: 25 },
  attackSpeed: 3, attackRange: 3, attackStyle: 'ranged',
  aggressive: true, aggroRange: 5, wanderRadius: 7, respawnTicks: 40,
  examine: 'A bat with crystalline wings. Fast and annoying.',
  weakness: 'magic', tags: ['beast'],
});

npcs.defineNpc('refracted_elemental', {
  name: 'Refracted elemental', combat: 100, maxHp: 110, maxHit: 16,
  stats: { attack: 65, strength: 55, defence: 60 },
  attackSpeed: 4, attackRange: 5, attackStyle: 'magic', size: 2,
  aggressive: true, aggroRange: 5, wanderRadius: 4, respawnTicks: 75,
  examine: 'An elemental composed of refracted light. Changes attack style.',
  weakness: 'crush', tags: ['elemental'], // disrupts the light structure
  // Special: changes its own weakness each phase (slash→ranged→crush cycle)
});

// Bosses
npcs.defineNpc('the_glass_tyrant', {
  name: 'The Glass Tyrant', combat: 200, maxHp: 500, maxHit: 28,
  stats: { attack: 120, strength: 110, defence: 130 },
  attackSpeed: 4, attackRange: 6, attackStyle: 'magic', size: 4,
  aggressive: false, wanderRadius: 0, respawnTicks: 500,
  examine: 'A colossal being of living crystal. Aelgard\'s top solo boss.',
  weakness: 'magic', tags: ['elemental', 'boss'], resistance: 'ranged',
  // Glass reflects physical projectiles. Magic disrupts the crystal lattice.
  // Phases cycle: P1 melee-only (close range), P2 ranged-only (flies), P3 magic-only (shielded)
});

npcs.defineNpc('veldrak', {
  name: 'Veldrak, the Last Dragon', combat: 300, maxHp: 800, maxHit: 40,
  stats: { attack: 180, strength: 170, defence: 200 },
  attackSpeed: 4, attackRange: 8, attackStyle: 'magic', size: 6,
  aggressive: false, wanderRadius: 0, respawnTicks: 1000,
  examine: 'The last dragon of Aelgard. A world boss requiring significant preparation.',
  weakness: 'stab', tags: ['dragon', 'boss'], resistance: 'magic',
  // Dragons have weak underbelly (stab). Scales resist magic. Dragonbane weapons get +30% damage.
  // Phases: P1 fire breath (pray magic), P2 aerial (ranged only), P3 grounded melee (all styles)
});

// ── Drop tables ────────────────────────────────────────────────────────────

droptables.define('glass_spider', {
  always: [], main: [
    { id: 10001, name: 'Crystal shard', weight: 15, min: 1, max: 3 },
    { id: 101, name: 'Coins', weight: 10, min: 30, max: 100 },
    { id: 0, name: 'Nothing', weight: 15, min: 0, max: 0 },
  ],
});

droptables.define('prism_wizard', {
  always: [], main: [
    { id: 10002, name: 'Prism lens', weight: 5, min: 1, max: 1 },
    { id: 10004, name: 'Refracted essence', weight: 3, min: 1, max: 1 },
    { id: 10001, name: 'Crystal shard', weight: 10, min: 2, max: 5 },
    { id: 101, name: 'Coins', weight: 8, min: 80, max: 300 },
    { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 },
  ],
});

droptables.define('glass_golem', {
  always: [], main: [
    { id: 10001, name: 'Crystal shard', weight: 10, min: 3, max: 8 },
    { id: 10003, name: 'Glass sand', weight: 8, min: 5, max: 15 },
    { id: 101, name: 'Coins', weight: 8, min: 100, max: 400 },
    { id: 0, name: 'Nothing', weight: 5, min: 0, max: 0 },
  ],
});

droptables.define('refracted_elemental', {
  always: [], main: [
    { id: 10004, name: 'Refracted essence', weight: 5, min: 1, max: 2 },
    { id: 10001, name: 'Crystal shard', weight: 8, min: 3, max: 6 },
    { id: 10005, name: 'Crystal arrowheads', weight: 4, min: 10, max: 30 },
    { id: 101, name: 'Coins', weight: 6, min: 150, max: 500 },
  ],
});

droptables.define('the_glass_tyrant', {
  always: [{ id: 107, name: 'Dragon bones', min: 2, max: 2 }],
  main: [
    { id: 101, name: 'Coins', weight: 5, min: 10000, max: 30000 },
    { id: 10001, name: 'Crystal shard', weight: 5, min: 20, max: 50 },
    { id: 10004, name: 'Refracted essence', weight: 4, min: 5, max: 10 },
    { id: 10002, name: 'Prism lens', weight: 3, min: 3, max: 5 },
  ],
  tertiary: [
    { id: 10050, name: 'Glass crown', chance: 256, min: 1, max: 1 },
    { id: 10051, name: 'Prismatic blade', chance: 256, min: 1, max: 1 },
  ],
});

droptables.define('veldrak', {
  always: [{ id: 107, name: 'Dragon bones', min: 5, max: 5 }],
  main: [
    { id: 101, name: 'Coins', weight: 3, min: 50000, max: 100000 },
    { id: 10001, name: 'Crystal shard', weight: 4, min: 50, max: 100 },
    { id: 10004, name: 'Refracted essence', weight: 3, min: 10, max: 20 },
  ],
  tertiary: [
    { id: 10060, name: 'Dragon shard', chance: 128, min: 1, max: 1 },
    { id: 10061, name: "Veldrak's talon", chance: 512, min: 1, max: 1 },
    { id: 10062, name: "Veldrak's scale mail", chance: 512, min: 1, max: 1 },
  ],
});

// ── NPCs ───────────────────────────────────────────────────────────────────

npcs.defineNpc('crystal_sage_orin', {
  name: 'Crystal Sage Orin', combat: 0, maxHp: 1, size: 1,
  aggressive: false, wanderRadius: 0, canMove: false,
  examine: 'An old sage who has lived in the Glass Desert for decades. His skin has a crystalline sheen.',
  dialogue: { type: 'quest', questId: 'the_glass_prophecy' },
});

npcs.defineNpc('crystal_merchant_zel', {
  name: 'Merchant Zel', combat: 0, maxHp: 1, size: 1,
  aggressive: false, wanderRadius: 0, canMove: false,
  examine: 'A merchant who trades in crystal goods. Wears protective goggles.',
  dialogue: { type: 'shop', shopId: 'glass_desert_crystal' },
});

// ── Shops ──────────────────────────────────────────────────────────────────

shops.define('glass_desert_crystal', {
  name: "Zel's Crystal Exchange", npc: 'Merchant Zel', type: 'specialty',
  stock: [
    { id: 10001, name: 'Crystal shard', base: 50, price: 300 },
    { id: 10005, name: 'Crystal arrowheads', base: 100, price: 100 },
    { id: 10002, name: 'Prism lens', base: 3, price: 1000 },
    { id: 10003, name: 'Glass sand', base: 30, price: 50 },
  ],
  restockRate: 400,
});

// ── Quests ──────────────────────────────────────────────────────────────────

quests.define('the_glass_prophecy', {
  name: 'The Glass Prophecy',
  description: 'Crystal Sage Orin speaks of a prophecy etched in the oldest crystal in the desert — a prophecy about the Crystal Wyrm and the fate of Aelgard.',
  difficulty: 'Master',
  questPoints: 3,
  requirements: { skills: { attack: 50, magic: 40, mining: 40 } },
  steps: [
    { text: 'Talk to Crystal Sage Orin at the Glass Desert outpost.' },
    { text: 'Mine through the crystal barrier to reach the prophecy cavern (Mining 40).' },
    { text: 'Read the prophecy etched in the oldest crystal.' },
    { text: 'Gather 3 Prism lenses from prism wizards.' },
    { text: 'Use the lenses to decode the prophecy\'s hidden message.' },
    { text: 'Travel to the Crystal Wyrm\'s lair and confirm the prophecy.' },
    { text: 'Return to Orin with the decoded prophecy.' },
  ],
  rewards: {
    xp: { mining: 5000, magic: 4000 },
    items: [{ id: 101, name: 'Coins', count: 10000 }, { id: 10004, name: 'Refracted essence', count: 3 }],
    questPoints: 3,
    unlocks: ["item_unlock:the_glass_prophecy_completion"],
  },
});

quests.define('the_last_dragon_p1', {
  name: 'The Last Dragon — Part 1: Awakening',
  description: 'The prophecy is clear: Veldrak sleeps beneath the Glass Desert. If it wakes, Aelgard burns. Begin the quest to prevent — or cause — the awakening.',
  difficulty: 'Grandmaster',
  questPoints: 3,
  requirements: { quests: ['the_glass_prophecy', 'sootworks_rising', 'blood_rites'], skills: { attack: 60, defence: 55, magic: 50, prayer: 45 } },
  steps: [
    { text: 'Return to Crystal Sage Orin after decoding the prophecy.' },
    { text: 'Travel to the Heartlands to consult the scholars about Veldrak.' },
    { text: 'Travel to the Sootworks to forge a Dragonsbane weapon (Smithing 50).' },
    { text: 'Travel to Moryskah to acquire consecrated materials from Father Dorin.' },
    { text: 'Return to the Glass Desert and locate the Dragon Gate.' },
  ],
  rewards: {
    xp: { attack: 8000, smithing: 5000, prayer: 3000 },
    items: [{ id: 101, name: 'Coins', count: 15000 }],
    questPoints: 3,
    unlocks: ["item_unlock:the_last_dragon_p1_completion"],
  },
});

quests.define('the_last_dragon_p2', {
  name: 'The Last Dragon — Part 2: The Dragon Gate',
  description: 'The Dragon Gate stands before you. Four keys, four regions, one final chance.',
  difficulty: 'Grandmaster',
  questPoints: 3,
  requirements: { quests: ['the_last_dragon_p1'] },
  steps: [
    { text: 'Open the Dragon Gate using the four regional keys.' },
    { text: 'Descend into Veldrak\'s crystal tomb.' },
    { text: 'Navigate the crystal maze (changes with each attempt).' },
    { text: 'Reach the heart chamber.' },
    { text: 'Choose: attempt to keep Veldrak asleep, or wake it for the final fight.' },
  ],
  rewards: {
    xp: { hitpoints: 5000, prayer: 5000 },
    items: [{ id: 101, name: 'Coins', count: 20000 }],
    questPoints: 3,
    unlocks: ["item_unlock:the_last_dragon_p2_completion"],
  },
});

quests.define('the_last_dragon_p3', {
  name: 'The Last Dragon — Part 3: Veldrak',
  description: 'Veldrak is awake. The last dragon of Aelgard rises.',
  difficulty: 'Grandmaster',
  questPoints: 5,
  requirements: { quests: ['the_last_dragon_p2'] },
  steps: [
    { text: 'Veldrak has risen. Rally allies from all regions.' },
    { text: 'Equip the Dragonsbane weapon.' },
    { text: 'Confront Veldrak in the open Glass Desert.' },
    { text: 'Survive Phase 1: Crystal Breath (dodge crystallizing fire).' },
    { text: 'Survive Phase 2: Shattered Wings (aerial bombardment).' },
    { text: 'Defeat Phase 3: Enraged (Veldrak fights grounded, max power).' },
    { text: 'Claim your reward from Crystal Sage Orin.' },
  ],
  rewards: {
    xp: { attack: 20000, strength: 15000, defence: 10000, hitpoints: 10000, prayer: 5000, magic: 5000 },
    items: [{ id: 101, name: 'Coins', count: 50000 }],
    questPoints: 5,
    unlocks: ["item_unlock:dragon_hunter_lance"],
  },
});

console.log('[aelgard] Glass Desert content loaded');
