// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — The Boneyard Wastes
// Post-apocalyptic desert. Ancient bones, ruins, nomad camps, pyramid dungeon.
// Mid-level region (combat 15-60).
// ══════════════════════════════════════════════════════════════════════════════

const items = require('../../data/items');
const npcs = require('../../world/npcs');
const shops = require('../../data/shops');
const quests = require('../../data/quests');
const droptables = require('../../data/droptables');

// ── Items: Boneyard unique ─────────────────────────────────────────────────

items.define({ id: 4001, name: 'Leviathan bone', examine: 'A fragment of an ancient leviathan skeleton.', value: 350, category: 'crafting', weight: 3 });
items.define({ id: 4002, name: 'Fossilized fang', examine: 'A perfectly preserved fang from a prehistoric beast.', value: 1200, category: 'crafting', weight: 1 });
items.define({ id: 4003, name: 'Desert amulet', examine: 'An amulet carved from sandstone.', value: 800, category: 'jewellery', equipSlot: 'neck', stats: { prayer: 3, def_magic: 5 }, equipReqs: {} });
items.define({ id: 4004, name: 'Bone shard', examine: 'A sharp fragment of ancient bone.', value: 25, category: 'crafting', weight: 0.5 });
items.define({ id: 4005, name: 'Dustweave cloth', examine: 'Cloth woven from desert spider silk. Surprisingly sturdy.', value: 200, category: 'crafting', weight: 0.3 });
items.define({ id: 4006, name: 'Sand rune', examine: 'A rune formed from compressed desert sand. Warm to the touch.', value: 50, category: 'rune', stackable: true, weight: 0 });
items.define({ id: 4007, name: 'Scarab shell', examine: 'The iridescent shell of a giant scarab.', value: 150, category: 'crafting', weight: 0.8 });
items.define({ id: 4008, name: 'Cactus water', examine: 'Water squeezed from a desert cactus. Tastes terrible.', value: 15, category: 'food', weight: 0.3 });
items.define({ id: 4009, name: 'Embalming salts', examine: 'Salts used to preserve the dead. Or the living, if desperate.', value: 100, category: 'herblore', weight: 0.5 });

// Boss uniques
items.define({ id: 4050, name: "Azhmari's crown", examine: "The Sand Prince's golden crown. It hums with buried power.", value: 45000, category: 'armour', equipSlot: 'head', stats: { magic: 8, prayer: 4, def_stab: 10, def_slash: 8, def_crush: 12, def_magic: 12 }, equipReqs: { magic: 40, defence: 30 } });
items.define({ id: 4051, name: 'Sandstorm staff', examine: 'A staff that crackles with desert lightning.', value: 30000, category: 'weapon', equipSlot: 'weapon', speed: 5, stats: { magic: 20, magic_strength: 12 }, equipReqs: { magic: 45 } });
items.define({ id: 4052, name: 'Bone cleaver', examine: 'A brutal axe carved from a leviathan jawbone.', value: 25000, category: 'weapon', equipSlot: 'weapon', speed: 5, stats: { slash: 52, melee_strength: 56 }, equipReqs: { attack: 40 } });

// Bog Hydra uniques
items.define({ id: 4060, name: 'Hydra scale', examine: 'A tough, acid-resistant scale from a bog hydra.', value: 8000, category: 'crafting', weight: 1.5 });
items.define({ id: 4061, name: 'Hydra leather body', examine: 'Armour crafted from hydra scales. Resists poison.', value: 35000, category: 'armour', equipSlot: 'body', stats: { def_stab: 45, def_slash: 50, def_crush: 40, ranged: 10 }, equipReqs: { defence: 40, ranged: 30 } });

// Quest items
items.define({ id: 4090, name: 'Excavation journal', examine: "An archaeologist's field journal. The last entry seems panicked.", value: 0, category: 'quest', tradeable: false });
items.define({ id: 4091, name: 'Pyramid key', examine: 'A key shaped like a scarab. Fits a very specific lock.', value: 0, category: 'quest', tradeable: false });
items.define({ id: 4092, name: 'Ancient tablet', examine: 'A stone tablet covered in pre-cataclysm writing.', value: 0, category: 'quest', tradeable: false });

// ══════════════════════════════════════════════════════════════════════════════
// MONSTERS — Boneyard Wastes
// ══════════════════════════════════════════════════════════════════════════════

npcs.defineNpc('sand_crab', {
  name: 'Sand crab', combat: 15, maxHp: 60, maxHit: 1,
  stats: { attack: 1, strength: 1, defence: 40 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee',
  aggressive: true, aggroRange: 1, wanderRadius: 0, respawnTicks: 40,
  examine: 'A crab disguised as a pile of sand.',
  weakness: 'crush', tags: ['armoured'], // hard shell
});

npcs.defineNpc('desert_wolf', {
  name: 'Desert wolf', combat: 22, maxHp: 25, maxHit: 4,
  stats: { attack: 14, strength: 12, defence: 8 },
  attackSpeed: 3, attackRange: 1, attackStyle: 'melee',
  aggressive: true, aggroRange: 5, wanderRadius: 8, respawnTicks: 35,
  examine: 'A lean, sun-bleached wolf.',
  weakness: 'stab', tags: ['beast'],
});

npcs.defineNpc('skeleton', {
  name: 'Skeleton', combat: 25, maxHp: 22, maxHit: 4,
  stats: { attack: 18, strength: 15, defence: 10 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee',
  aggressive: true, aggroRange: 4, wanderRadius: 4, respawnTicks: 40,
  examine: 'The remains of something that was once alive.',
  weakness: 'crush', tags: ['undead'], // bones shatter from crush
});

npcs.defineNpc('skeleton_mage', {
  name: 'Skeleton mage', combat: 35, maxHp: 30, maxHit: 6,
  stats: { attack: 22, strength: 10, defence: 15 },
  attackSpeed: 5, attackRange: 6, attackStyle: 'magic',
  aggressive: true, aggroRange: 4, wanderRadius: 3, respawnTicks: 45,
  examine: 'A skeleton wreathed in fading enchantments.',
  weakness: 'ranged', tags: ['undead'], resistance: 'magic', // magical defences, but ranged bypasses
});

npcs.defineNpc('giant_scarab', {
  name: 'Giant scarab', combat: 30, maxHp: 40, maxHit: 5,
  stats: { attack: 20, strength: 18, defence: 25 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee',
  aggressive: false, aggroRange: 3, wanderRadius: 6, respawnTicks: 50,
  examine: 'An enormous beetle with a gleaming shell.',
  weakness: 'crush', tags: ['armoured', 'beast'],
});

npcs.defineNpc('dust_devil', {
  name: 'Dust devil', combat: 45, maxHp: 55, maxHit: 7,
  stats: { attack: 30, strength: 25, defence: 20 },
  attackSpeed: 4, attackRange: 4, attackStyle: 'magic',
  aggressive: true, aggroRange: 5, wanderRadius: 5, respawnTicks: 50,
  examine: 'A whirling column of sand with malicious intent.',
  weakness: 'magic', tags: ['elemental'], resistance: 'melee', // made of sand, melee passes through
});

npcs.defineNpc('mummy', {
  name: 'Mummy', combat: 55, maxHp: 70, maxHit: 8,
  stats: { attack: 35, strength: 32, defence: 30 },
  attackSpeed: 5, attackRange: 1, attackStyle: 'melee', size: 1,
  aggressive: true, aggroRange: 4, wanderRadius: 3, respawnTicks: 70,
  examine: 'An ancient embalmed corpse that still walks.',
  poisonDamage: 3,
  weakness: 'slash', tags: ['undead'], // cut through the wrappings
});

npcs.defineNpc('bone_crawler', {
  name: 'Bone crawler', combat: 38, maxHp: 50, maxHit: 6,
  stats: { attack: 25, strength: 22, defence: 28 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee', size: 2,
  aggressive: true, aggroRange: 4, wanderRadius: 5, respawnTicks: 55,
  examine: 'A creature made of fused bone fragments. It skitters.',
  weakness: 'crush', tags: ['undead', 'armoured'], // bones fused into armour, crush shatters
});

// ── Bosses ─────────────────────────────────────────────────────────────────

npcs.defineNpc('azhmari', {
  name: 'Azhmari, The Sand Prince', combat: 120, maxHp: 250, maxHit: 18,
  stats: { attack: 80, strength: 70, defence: 90 },
  attackSpeed: 5, attackRange: 6, attackStyle: 'magic', size: 3,
  aggressive: false, wanderRadius: 0, respawnTicks: 300,
  examine: 'A prince of the old world who refused to stay buried.',
  weakness: 'ranged', tags: ['undead', 'boss'], resistance: 'melee', // ancient magic shields against melee, ranged pierces
});

npcs.defineNpc('bog_hydra', {
  name: 'The Bog Hydra', combat: 75, maxHp: 180, maxHit: 12,
  stats: { attack: 55, strength: 50, defence: 45 },
  attackSpeed: 4, attackRange: 3, attackStyle: 'ranged', size: 3,
  aggressive: false, wanderRadius: 0, respawnTicks: 250,
  examine: 'A three-headed reptile rising from the swamp pools at the edge of the wastes.',
  poisonDamage: 4,
  weakness: 'magic', tags: ['beast', 'boss'], resistance: 'ranged', // thick hide deflects arrows, magic burns
});

// ══════════════════════════════════════════════════════════════════════════════
// DROP TABLES — Boneyard Wastes
// ══════════════════════════════════════════════════════════════════════════════

droptables.define('sand_crab', {
  always: [],
  main: [
    { id: 101, name: 'Coins', weight: 30, min: 1, max: 5 },
    { id: 0, name: 'Nothing', weight: 40, min: 0, max: 0 },
  ],
});

droptables.define('desert_wolf', {
  always: [{ id: 100, name: 'Bones', min: 1, max: 1 }],
  main: [
    { id: 101, name: 'Coins', weight: 25, min: 5, max: 20 },
    { id: 103, name: 'Raw beef', weight: 10, min: 1, max: 1 },
    { id: 0, name: 'Nothing', weight: 20, min: 0, max: 0 },
  ],
});

droptables.define('skeleton', {
  always: [{ id: 100, name: 'Bones', min: 1, max: 1 }],
  main: [
    { id: 101, name: 'Coins', weight: 20, min: 5, max: 30 },
    { id: 4004, name: 'Bone shard', weight: 15, min: 1, max: 3 },
    { id: 1201, name: 'Steel sword', weight: 3, min: 1, max: 1 },
    { id: 0, name: 'Nothing', weight: 15, min: 0, max: 0 },
  ],
});

droptables.define('skeleton_mage', {
  always: [{ id: 100, name: 'Bones', min: 1, max: 1 }],
  main: [
    { id: 101, name: 'Coins', weight: 15, min: 10, max: 50 },
    { id: 4006, name: 'Sand rune', weight: 10, min: 2, max: 5 },
    { id: 4004, name: 'Bone shard', weight: 12, min: 1, max: 2 },
    { id: 0, name: 'Nothing', weight: 10, min: 0, max: 0 },
  ],
});

droptables.define('giant_scarab', {
  always: [],
  main: [
    { id: 4007, name: 'Scarab shell', weight: 20, min: 1, max: 1 },
    { id: 101, name: 'Coins', weight: 15, min: 10, max: 40 },
    { id: 0, name: 'Nothing', weight: 15, min: 0, max: 0 },
  ],
});

droptables.define('dust_devil', {
  always: [],
  main: [
    { id: 101, name: 'Coins', weight: 15, min: 30, max: 100 },
    { id: 4005, name: 'Dustweave cloth', weight: 5, min: 1, max: 1 },
    { id: 4006, name: 'Sand rune', weight: 10, min: 3, max: 8 },
    { id: 4003, name: 'Desert amulet', weight: 1, min: 1, max: 1 },
    { id: 0, name: 'Nothing', weight: 10, min: 0, max: 0 },
  ],
});

droptables.define('mummy', {
  always: [],
  main: [
    { id: 101, name: 'Coins', weight: 12, min: 50, max: 200 },
    { id: 4009, name: 'Embalming salts', weight: 8, min: 1, max: 2 },
    { id: 4001, name: 'Leviathan bone', weight: 4, min: 1, max: 1 },
    { id: 1301, name: 'Mithril sword', weight: 2, min: 1, max: 1 },
    { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 },
  ],
});

droptables.define('bone_crawler', {
  always: [],
  main: [
    { id: 4004, name: 'Bone shard', weight: 20, min: 2, max: 5 },
    { id: 4001, name: 'Leviathan bone', weight: 5, min: 1, max: 1 },
    { id: 101, name: 'Coins', weight: 15, min: 20, max: 80 },
    { id: 0, name: 'Nothing', weight: 10, min: 0, max: 0 },
  ],
});

droptables.define('azhmari', {
  always: [{ id: 106, name: 'Big bones', min: 1, max: 1 }],
  main: [
    { id: 101, name: 'Coins', weight: 10, min: 500, max: 2000 },
    { id: 4006, name: 'Sand rune', weight: 8, min: 20, max: 50 },
    { id: 4001, name: 'Leviathan bone', weight: 5, min: 2, max: 5 },
    { id: 4002, name: 'Fossilized fang', weight: 3, min: 1, max: 1 },
    { id: 1411, name: 'Adamant platebody', weight: 2, min: 1, max: 1 },
  ],
  tertiary: [
    { id: 4050, name: "Azhmari's crown", chance: 64, min: 1, max: 1 },
    { id: 4051, name: 'Sandstorm staff', chance: 64, min: 1, max: 1 },
    { id: 4052, name: 'Bone cleaver', chance: 64, min: 1, max: 1 },
  ],
});

droptables.define('bog_hydra', {
  always: [{ id: 106, name: 'Big bones', min: 1, max: 1 }],
  main: [
    { id: 101, name: 'Coins', weight: 10, min: 200, max: 800 },
    { id: 4009, name: 'Embalming salts', weight: 5, min: 2, max: 4 },
    { id: 1402, name: 'Adamant scimitar', weight: 3, min: 1, max: 1 },
  ],
  tertiary: [
    { id: 4060, name: 'Hydra scale', chance: 32, min: 1, max: 1 },
    { id: 4061, name: 'Hydra leather body', chance: 128, min: 1, max: 1 },
  ],
});

// ══════════════════════════════════════════════════════════════════════════════
// NPCs (non-combat) — Boneyard Wastes
// ══════════════════════════════════════════════════════════════════════════════

npcs.defineNpc('nomad_trader_razak', {
  name: 'Razak', combat: 0, maxHp: 1, size: 1,
  aggressive: false, wanderRadius: 0, canMove: false,
  examine: 'A nomadic trader who travels the wastes.',
  dialogue: { type: 'shop', shopId: 'wasteland_supplies' },
});

npcs.defineNpc('archaeologist_veris', {
  name: 'Archaeologist Veris', combat: 0, maxHp: 1, size: 1,
  aggressive: false, wanderRadius: 0, canMove: false,
  examine: 'A researcher cataloging leviathan fossils.',
  dialogue: { type: 'quest', questId: 'sand_and_secrets' },
});

npcs.defineNpc('hermit_old_sun', {
  name: 'Hermit of the Old Sun', combat: 0, maxHp: 1, size: 1,
  aggressive: false, wanderRadius: 0, canMove: false,
  examine: 'An old man who claims to remember the world before the cataclysm.',
  dialogue: { type: 'lore' },
});

// ══════════════════════════════════════════════════════════════════════════════
// SHOPS — Boneyard Wastes
// ══════════════════════════════════════════════════════════════════════════════

shops.define('wasteland_supplies', {
  name: "Razak's Desert Supplies", npc: 'Razak', type: 'specialty',
  stock: [
    { id: 4008, name: 'Cactus water', base: 20, price: 15 },
    { id: 2001, name: 'Bread', base: 10, price: 15 },
    { id: 1005, name: 'Bronze pickaxe', base: 3, price: 18 },
    { id: 4003, name: 'Desert amulet', base: 1, price: 800 },
    { id: 4009, name: 'Embalming salts', base: 3, price: 100 },
  ],
  restockRate: 300,
});

// ══════════════════════════════════════════════════════════════════════════════
// QUESTS — Boneyard Wastes
// ══════════════════════════════════════════════════════════════════════════════

quests.define('sand_and_secrets', {
  name: 'Sand and Secrets',
  description: "Archaeologist Veris has found something beneath the leviathan graveyard. Help her excavate before the sandstorm buries it forever.",
  difficulty: 'Intermediate',
  questPoints: 2,
  requirements: { skills: { mining: 20, agility: 15, crafting: 10 } }, // Agility for pyramid traps, Crafting to decode tablet
  steps: [
    { text: 'Talk to Archaeologist Veris at the excavation camp.' },
    { text: 'Mine through 3 rubble walls in the dig site (Mining 20).' },
    { text: 'Discover the buried pyramid entrance.' },
    { text: 'Navigate the pyramid traps to reach the inner chamber.' },
    { text: 'Retrieve the Ancient tablet from the sarcophagus.' },
    { text: 'Defeat the Mummy guardian (combat 55).' },
    { text: 'Return the Ancient tablet to Veris.' },
  ],
  rewards: {
    xp: { mining: 1500, prayer: 500 },
    items: [{ id: 101, name: 'Coins', count: 3000 }, { id: 4002, name: 'Fossilized fang', count: 1 }],
    questPoints: 2,
  },
});

quests.define('relics_of_the_old_world', {
  name: 'Relics of the Old World',
  description: 'The Hermit of the Old Sun speaks of artifacts scattered across the wastes — pieces of a weapon that could slay Azhmari.',
  difficulty: 'Experienced',
  questPoints: 2,
  requirements: { quests: ['sand_and_secrets'], skills: { attack: 30, mining: 30, ranged: 20, fletching: 15 } }, // Ranged to fight from distance in ruins, Fletching to craft relic binding
  steps: [
    { text: 'Talk to the Hermit of the Old Sun.' },
    { text: 'Find the first relic fragment near the Bone Reef.' },
    { text: 'Find the second relic fragment inside the pyramid.' },
    { text: 'Find the third relic fragment in the sand devil territory.' },
    { text: 'Combine the fragments at the Hermit\'s altar.' },
    { text: 'Confront Azhmari in his buried throne room.' },
  ],
  rewards: {
    xp: { attack: 3000, strength: 2000, mining: 1000 },
    items: [{ id: 101, name: 'Coins', count: 5000 }],
    questPoints: 2,
  },
});

// ══════════════════════════════════════════════════════════════════════════════

console.log('[aelgard] Boneyard Wastes content loaded');
