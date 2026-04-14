// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — The Sootworks
// Clockwork industrial underground. Dwarves, gnomes, smithing focus.
// Mid-to-high level region (combat 35-90).
// ══════════════════════════════════════════════════════════════════════════════

const items = require('../../data/items');
const npcs = require('../../world/npcs');
const shops = require('../../data/shops');
const quests = require('../../data/quests');
const droptables = require('../../data/droptables');

// ── Items ──────────────────────────────────────────────────────────────────

items.define({ id: 7001, name: 'Soot-iron ore', examine: 'A dark ore found only in the Sootworks mines.', value: 60, category: 'mining', weight: 2.5 });
items.define({ id: 7002, name: 'Soot-iron bar', examine: 'A bar of soot-iron. Harder than steel.', value: 180, category: 'smithing', weight: 2 });
items.define({ id: 7003, name: 'Clockwork gear', examine: 'A precision-crafted gear. The dwarves use thousands of these.', value: 80, category: 'crafting', weight: 0.5 });
items.define({ id: 7004, name: 'Steam valve', examine: 'A brass valve for controlling steam pressure.', value: 50, category: 'crafting', weight: 1 });
items.define({ id: 7005, name: 'Blast powder', examine: 'Highly volatile. Handle with care.', value: 100, category: 'mining', weight: 0.3 });
items.define({ id: 7006, name: 'Dwarven stout', examine: 'A strong dwarven brew. Temporarily boosts Mining and Smithing.', value: 30, category: 'food', weight: 0.5 });
items.define({ id: 7007, name: 'Gnome goggles', examine: 'Tinted goggles that protect against sparks and bright light.', value: 200, category: 'armour', equipSlot: 'head', stats: { def_ranged: 3 }, equipReqs: {} });

// Soot-iron tier (between mithril and adamant)
items.define({ id: 7101, name: 'Soot-iron sword', examine: 'A blade forged from soot-iron.', value: 600, category: 'weapon', equipSlot: 'weapon', speed: 4, stats: { slash: 23, melee_strength: 22 }, equipReqs: { attack: 25 } });
items.define({ id: 7102, name: 'Soot-iron scimitar', examine: 'A soot-iron scimitar.', value: 750, category: 'weapon', equipSlot: 'weapon', speed: 4, stats: { slash: 27, melee_strength: 23 }, equipReqs: { attack: 25 } });
items.define({ id: 7110, name: 'Soot-iron platebody', examine: 'A soot-iron platebody. Stained dark.', value: 3200, category: 'armour', equipSlot: 'body', stats: { def_stab: 36, def_slash: 35, def_crush: 24 }, equipReqs: { defence: 25 } });

// Boss uniques — Vorath
items.define({ id: 7050, name: "Vorath's anvil ring", examine: 'A ring forged by the Warden of the Deep Vein. Improves smithing precision.', value: 40000, category: 'jewellery', equipSlot: 'ring', stats: { crush: 4, melee_strength: 5, def_crush: 8 }, equipReqs: { defence: 35 } });
items.define({ id: 7051, name: 'Molten maul', examine: 'A massive hammer that glows with residual heat from the deep forge.', value: 55000, category: 'weapon', equipSlot: 'weapon', speed: 6, stats: { crush: 75, melee_strength: 80 }, equipReqs: { attack: 50, strength: 50 } });

// Soot King uniques
items.define({ id: 7060, name: 'Soot King crown', examine: 'A crown of welded iron and industrial gems. Heavy with authority.', value: 80000, category: 'armour', equipSlot: 'head', stats: { def_stab: 35, def_slash: 38, def_crush: 40, melee_strength: 5, prayer: 2 }, equipReqs: { defence: 50 } });

// ── Monsters ───────────────────────────────────────────────────────────────

npcs.defineNpc('mine_spider', {
  name: 'Mine spider', combat: 35, maxHp: 35, maxHit: 5,
  stats: { attack: 22, strength: 18, defence: 15 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee',
  aggressive: true, aggroRange: 3, wanderRadius: 4, respawnTicks: 35,
  examine: 'A spider adapted to the dark mines.',
  weakness: 'crush', tags: ['beast'],
  poisonDamage: 2,
});

npcs.defineNpc('rock_golem', {
  name: 'Rock golem', combat: 50, maxHp: 80, maxHit: 8,
  stats: { attack: 25, strength: 35, defence: 50 },
  attackSpeed: 6, attackRange: 1, attackStyle: 'melee', size: 2,
  aggressive: false, aggroRange: 2, wanderRadius: 2, respawnTicks: 80,
  examine: 'An animated construct of stone and metal.',
  weakness: 'magic', resistance: 'melee', tags: ['elemental', 'armoured'],
});

npcs.defineNpc('clockwork_sentry', {
  name: 'Clockwork sentry', combat: 55, maxHp: 60, maxHit: 7,
  stats: { attack: 35, strength: 30, defence: 40 },
  attackSpeed: 4, attackRange: 4, attackStyle: 'ranged',
  aggressive: true, aggroRange: 5, wanderRadius: 3, respawnTicks: 60,
  examine: 'An automated sentry that fires crossbow bolts.',
  weakness: 'crush', resistance: 'magic', tags: ['construct', 'armoured'],
});

npcs.defineNpc('lava_beast', {
  name: 'Lava beast', combat: 65, maxHp: 75, maxHit: 10,
  stats: { attack: 40, strength: 45, defence: 35 },
  attackSpeed: 5, attackRange: 2, attackStyle: 'melee', size: 2,
  aggressive: true, aggroRange: 4, wanderRadius: 4, respawnTicks: 70,
  examine: 'A creature made of molten rock. Too hot to touch.',
  weakness: 'ranged', resistance: 'melee', tags: ['elemental'],
});

npcs.defineNpc('rogue_automaton', {
  name: 'Rogue automaton', combat: 70, maxHp: 90, maxHit: 11,
  stats: { attack: 45, strength: 40, defence: 50 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee', size: 2,
  aggressive: true, aggroRange: 4, wanderRadius: 3, respawnTicks: 75,
  examine: 'A dwarven machine gone haywire.',
  weakness: 'magic', resistance: 'ranged', tags: ['construct', 'armoured'],
});

// Bosses
npcs.defineNpc('vorath', {
  name: 'Vorath, Warden of the Deep Vein', combat: 110, maxHp: 280, maxHit: 18,
  stats: { attack: 75, strength: 80, defence: 85 },
  attackSpeed: 5, attackRange: 1, attackStyle: 'melee', size: 3,
  aggressive: false, wanderRadius: 0, respawnTicks: 300,
  examine: 'A dwarven construct that guards the deepest mines. It has forgotten its masters.',
  weakness: 'magic', resistance: 'melee', tags: ['construct', 'boss', 'armoured'],
});

npcs.defineNpc('the_soot_king', {
  name: 'The Soot King', combat: 180, maxHp: 450, maxHit: 25,
  stats: { attack: 110, strength: 100, defence: 120 },
  attackSpeed: 5, attackRange: 3, attackStyle: 'melee', size: 4,
  aggressive: false, wanderRadius: 0, respawnTicks: 500,
  examine: 'A titan of iron and flame. Requires a 3-5 player group.',
  weakness: 'magic', resistance: 'ranged', tags: ['construct', 'boss', 'armoured'],
});

// ── Drop tables ────────────────────────────────────────────────────────────

droptables.define('mine_spider', {
  always: [], main: [
    { id: 101, name: 'Coins', weight: 20, min: 10, max: 30 },
    { id: 7001, name: 'Soot-iron ore', weight: 5, min: 1, max: 1 },
    { id: 0, name: 'Nothing', weight: 20, min: 0, max: 0 },
  ],
});

droptables.define('rock_golem', {
  always: [], main: [
    { id: 7001, name: 'Soot-iron ore', weight: 10, min: 1, max: 3 },
    { id: 2104, name: 'Coal', weight: 10, min: 2, max: 5 },
    { id: 101, name: 'Coins', weight: 10, min: 20, max: 80 },
    { id: 0, name: 'Nothing', weight: 10, min: 0, max: 0 },
  ],
});

droptables.define('clockwork_sentry', {
  always: [], main: [
    { id: 7003, name: 'Clockwork gear', weight: 12, min: 1, max: 2 },
    { id: 7004, name: 'Steam valve', weight: 8, min: 1, max: 1 },
    { id: 101, name: 'Coins', weight: 10, min: 30, max: 100 },
    { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 },
  ],
});

droptables.define('lava_beast', {
  always: [], main: [
    { id: 7001, name: 'Soot-iron ore', weight: 8, min: 2, max: 4 },
    { id: 2113, name: 'Steel bar', weight: 5, min: 1, max: 2 },
    { id: 101, name: 'Coins', weight: 10, min: 40, max: 150 },
    { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 },
  ],
});

droptables.define('vorath', {
  always: [{ id: 106, name: 'Big bones', min: 1, max: 1 }],
  main: [
    { id: 101, name: 'Coins', weight: 8, min: 500, max: 3000 },
    { id: 7002, name: 'Soot-iron bar', weight: 6, min: 3, max: 8 },
    { id: 7003, name: 'Clockwork gear', weight: 5, min: 5, max: 10 },
    { id: 2115, name: 'Adamantite bar', weight: 3, min: 2, max: 4 },
  ],
  tertiary: [
    { id: 7050, name: "Vorath's anvil ring", chance: 64, min: 1, max: 1 },
    { id: 7051, name: 'Molten maul', chance: 128, min: 1, max: 1 },
  ],
});

droptables.define('the_soot_king', {
  always: [{ id: 107, name: 'Dragon bones', min: 1, max: 1 }],
  main: [
    { id: 101, name: 'Coins', weight: 6, min: 5000, max: 15000 },
    { id: 7002, name: 'Soot-iron bar', weight: 5, min: 10, max: 20 },
    { id: 2116, name: 'Runite bar', weight: 3, min: 2, max: 4 },
    { id: 7003, name: 'Clockwork gear', weight: 4, min: 10, max: 25 },
  ],
  tertiary: [
    { id: 7060, name: 'Soot King crown', chance: 256, min: 1, max: 1 },
  ],
});

// ── NPCs ───────────────────────────────────────────────────────────────────

npcs.defineNpc('forgemaster_brun', {
  name: 'Forgemaster Brun', combat: 0, maxHp: 1, size: 1,
  aggressive: false, wanderRadius: 0, canMove: false,
  examine: 'The head dwarf of the Sootworks forges. Permanently covered in soot.',
  dialogue: { type: 'quest', questId: 'sootworks_rising' },
});

npcs.defineNpc('dwarven_smith_hald', {
  name: 'Smith Hald', combat: 0, maxHp: 1, size: 1,
  aggressive: false, wanderRadius: 0, canMove: false,
  examine: 'A dwarven smith who specializes in soot-iron.',
  dialogue: { type: 'shop', shopId: 'sootworks_smithy' },
});

npcs.defineNpc('gnome_engineer_fizz', {
  name: 'Engineer Fizz', combat: 0, maxHp: 1, size: 1,
  aggressive: false, wanderRadius: 0, canMove: false,
  examine: 'A gnome engineer obsessed with clockwork mechanisms.',
  dialogue: { type: 'shop', shopId: 'sootworks_engineer' },
});

// ── Shops ──────────────────────────────────────────────────────────────────

shops.define('sootworks_smithy', {
  name: "Hald's Soot-Iron Forge", npc: 'Smith Hald', type: 'specialty',
  stock: [
    { id: 7101, name: 'Soot-iron sword', base: 3, price: 600 },
    { id: 7102, name: 'Soot-iron scimitar', base: 3, price: 750 },
    { id: 7110, name: 'Soot-iron platebody', base: 2, price: 3200 },
    { id: 7006, name: 'Dwarven stout', base: 10, price: 30 },
  ],
  restockRate: 300,
});

shops.define('sootworks_engineer', {
  name: "Fizz's Contraptions", npc: 'Engineer Fizz', type: 'specialty',
  stock: [
    { id: 7003, name: 'Clockwork gear', base: 20, price: 80 },
    { id: 7004, name: 'Steam valve', base: 10, price: 50 },
    { id: 7005, name: 'Blast powder', base: 5, price: 100 },
    { id: 7007, name: 'Gnome goggles', base: 3, price: 200 },
  ],
  restockRate: 250,
});

// ── Quests ──────────────────────────────────────────────────────────────────

quests.define('sootworks_rising', {
  name: 'Sootworks Rising',
  description: 'The dwarves report machines going rogue in the lower levels. Forgemaster Brun needs someone brave — or foolish — enough to investigate.',
  difficulty: 'Experienced',
  questPoints: 3,
  requirements: { skills: { mining: 30, smithing: 25, crafting: 20, agility: 15 } },
  steps: [
    { text: 'Talk to Forgemaster Brun at the Sootworks main hall.' },
    { text: 'Take the steam tram to the lower levels.' },
    { text: 'Investigate the malfunctioning clockwork sentries.' },
    { text: 'Discover the corrupted control crystal in the engineering bay.' },
    { text: 'Smith a replacement crystal housing from soot-iron (Smithing 25).' },
    { text: 'Replace the control crystal while defending against rogue automatons.' },
    { text: 'Defeat Vorath, Warden of the Deep Vein.' },
    { text: 'Return to Forgemaster Brun.' },
  ],
  rewards: {
    xp: { mining: 3000, smithing: 4000, defence: 1500 },
    items: [{ id: 101, name: 'Coins', count: 8000 }, { id: 7002, name: 'Soot-iron bar', count: 10 }],
    questPoints: 3,
  },
});

quests.define('the_forge_beneath', {
  name: 'The Forge Beneath the City',
  description: "Engineer Fizz has found blueprints for a dwarven weapon cache sealed beneath the Sootworks. The cache is guarded by something enormous.",
  difficulty: 'Master',
  questPoints: 3,
  requirements: { quests: ['sootworks_rising'], skills: { attack: 50, smithing: 40 } },
  steps: [
    { text: 'Talk to Engineer Fizz about the blueprints she found.' },
    { text: 'Assemble 10 Clockwork gears and 5 Steam valves to build the key mechanism.' },
    { text: 'Open the sealed vault beneath the Sootworks.' },
    { text: 'Navigate the trapped corridors (Agility recommended).' },
    { text: 'Defeat the Soot King with a team of 3-5 players.' },
    { text: 'Claim the weapon cache.' },
    { text: 'Return to Forgemaster Brun.' },
  ],
  rewards: {
    xp: { smithing: 8000, attack: 5000, strength: 3000 },
    items: [{ id: 101, name: 'Coins', count: 15000 }],
    questPoints: 3,
  },
});

console.log('[aelgard] Sootworks content loaded');
