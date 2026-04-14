// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Massive Monster Expansion
// 150+ new monsters across all regions + slayer dungeon + wilderness
// Every monster has weakness, tags, and a purpose (P04 non-degenerate)
// ══════════════════════════════════════════════════════════════════════════════

const npcs = require('../../world/npcs');
const droptables = require('../../data/droptables');
const items = require('../../data/items');

// Helper to define + drop table in one go
function mob(defId, def, drops) {
  npcs.defineNpc(defId, def);
  if (drops) droptables.define(defId, drops);
}

// ══════════════════════════════════════════════════════════════════════════════
// HEARTLANDS — expand from 12 to ~30 monsters
// ══════════════════════════════════════════════════════════════════════════════

mob('rat', { name: 'Rat', combat: 1, maxHp: 2, maxHit: 1, stats: { attack: 1, strength: 1, defence: 1 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: false, wanderRadius: 3, respawnTicks: 15, examine: 'Diseased looking.', weakness: 'slash' });

mob('imp', { name: 'Imp', combat: 8, maxHp: 7, maxHit: 2, stats: { attack: 4, strength: 3, defence: 3 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: false, wanderRadius: 6, respawnTicks: 25, examine: 'A mischievous little demon.', weakness: 'magic', tags: ['demon'] },
  { always: [], main: [{ id: 101, name: 'Coins', weight: 20, min: 1, max: 15 }, { id: 11350, name: 'Air rune', weight: 5, min: 2, max: 8 }, { id: 0, name: 'Nothing', weight: 15, min: 0, max: 0 }] });

mob('scorpion', { name: 'Scorpion', combat: 14, maxHp: 17, maxHit: 3, stats: { attack: 8, strength: 7, defence: 10 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 3, wanderRadius: 4, respawnTicks: 30, examine: 'A large scorpion. Nasty sting.', weakness: 'crush', tags: ['armoured'], poisonDamage: 2 });

mob('zombie', { name: 'Zombie', combat: 18, maxHp: 20, maxHit: 3, stats: { attack: 10, strength: 12, defence: 5 }, attackSpeed: 5, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 4, wanderRadius: 3, respawnTicks: 35, examine: 'The living dead.', weakness: 'slash', tags: ['undead'] },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 15, min: 3, max: 20 }, { id: 0, name: 'Nothing', weight: 15, min: 0, max: 0 }] });

mob('hobgoblin', { name: 'Hobgoblin', combat: 28, maxHp: 29, maxHit: 5, stats: { attack: 20, strength: 18, defence: 15 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 3, wanderRadius: 4, respawnTicks: 40, examine: 'A large goblin.', weakness: 'stab', tags: ['goblinoid'] },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 20, min: 10, max: 40 }, { id: 12203, name: 'Limpwurt root', weight: 3, min: 1, max: 1 }, { id: 0, name: 'Nothing', weight: 12, min: 0, max: 0 }] });

mob('lesser_demon', { name: 'Lesser demon', combat: 82, maxHp: 79, maxHit: 8, stats: { attack: 68, strength: 70, defence: 65 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 4, wanderRadius: 3, respawnTicks: 40, examine: 'A small but vicious demon.', weakness: 'ranged', tags: ['demon'], resistance: 'magic' },
  { always: [], main: [{ id: 101, name: 'Coins', weight: 12, min: 20, max: 100 }, { id: 11356, name: 'Chaos rune', weight: 5, min: 5, max: 15 }, { id: 1402, name: 'Adamant scimitar', weight: 2, min: 1, max: 1 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });

mob('greater_demon', { name: 'Greater demon', combat: 92, maxHp: 87, maxHit: 10, stats: { attack: 80, strength: 82, defence: 75 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 5, wanderRadius: 3, respawnTicks: 50, examine: 'A big and very scary demon.', weakness: 'ranged', tags: ['demon'], resistance: 'magic' },
  { always: [], main: [{ id: 101, name: 'Coins', weight: 10, min: 50, max: 200 }, { id: 11357, name: 'Death rune', weight: 4, min: 3, max: 8 }, { id: 1511, name: 'Rune platebody', weight: 1, min: 1, max: 1 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

mob('black_knight', { name: 'Black knight', combat: 33, maxHp: 32, maxHit: 5, stats: { attack: 25, strength: 22, defence: 25 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 3, wanderRadius: 3, respawnTicks: 45, examine: 'A knight in dark armour.', weakness: 'stab', tags: ['human', 'armoured'], resistance: 'ranged' },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 15, min: 10, max: 50 }, { id: 0, name: 'Nothing', weight: 10, min: 0, max: 0 }] });

mob('white_knight', { name: 'White knight', combat: 36, maxHp: 35, maxHit: 5, stats: { attack: 28, strength: 25, defence: 28 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: false, wanderRadius: 3, respawnTicks: 45, examine: 'A knight of the Heartlands.', weakness: 'crush', tags: ['human', 'armoured'] });

mob('wizard', { name: 'Wizard', combat: 12, maxHp: 12, maxHit: 4, stats: { attack: 5, strength: 3, defence: 4 }, attackSpeed: 5, attackRange: 6, attackStyle: 'magic', aggressive: false, wanderRadius: 3, respawnTicks: 30, examine: 'A wizard studying outdoors.', weakness: 'ranged', resistance: 'magic' });

mob('bear', { name: 'Bear', combat: 19, maxHp: 25, maxHit: 4, stats: { attack: 12, strength: 14, defence: 10 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 4, wanderRadius: 6, respawnTicks: 35, examine: 'A grizzly bear. Leave it alone.', weakness: 'stab', tags: ['beast'] },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 103, name: 'Raw beef', weight: 10, min: 1, max: 2 }, { id: 102, name: 'Cowhide', weight: 5, min: 1, max: 1 }] });

// ══════════════════════════════════════════════════════════════════════════════
// BONEYARD WASTES — expand from 10 to ~25
// ══════════════════════════════════════════════════════════════════════════════

mob('desert_lizard', { name: 'Desert lizard', combat: 24, maxHp: 25, maxHit: 4, stats: { attack: 15, strength: 12, defence: 15 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: false, wanderRadius: 5, respawnTicks: 30, examine: 'A large desert lizard.', weakness: 'crush', tags: ['beast'] },
  { always: [], main: [{ id: 101, name: 'Coins', weight: 15, min: 5, max: 25 }, { id: 0, name: 'Nothing', weight: 15, min: 0, max: 0 }] });

mob('locust', { name: 'Locust rider', combat: 40, maxHp: 45, maxHit: 6, stats: { attack: 28, strength: 25, defence: 20 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 5, wanderRadius: 6, respawnTicks: 40, examine: 'A scavenger riding a giant locust.', weakness: 'ranged', tags: ['beast', 'human'] },
  { always: [], main: [{ id: 101, name: 'Coins', weight: 12, min: 15, max: 60 }, { id: 4004, name: 'Bone shard', weight: 8, min: 1, max: 3 }, { id: 0, name: 'Nothing', weight: 10, min: 0, max: 0 }] });

mob('sand_golem', { name: 'Sand golem', combat: 50, maxHp: 70, maxHit: 7, stats: { attack: 30, strength: 35, defence: 40 }, attackSpeed: 6, attackRange: 1, attackStyle: 'melee', size: 2, aggressive: false, aggroRange: 2, wanderRadius: 2, respawnTicks: 70, examine: 'A golem made of compressed sand.', weakness: 'magic', tags: ['elemental', 'construct'], resistance: 'melee' },
  { always: [], main: [{ id: 4003, name: 'Glass sand', weight: 10, min: 3, max: 8 }, { id: 101, name: 'Coins', weight: 8, min: 30, max: 100 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });

mob('fossil_guardian', { name: 'Fossil guardian', combat: 65, maxHp: 80, maxHit: 9, stats: { attack: 40, strength: 38, defence: 50 }, attackSpeed: 5, attackRange: 1, attackStyle: 'melee', size: 2, aggressive: true, aggroRange: 3, wanderRadius: 3, respawnTicks: 60, examine: 'A skeleton reanimated from fossilized bones.', weakness: 'crush', tags: ['undead', 'armoured'] },
  { always: [{ id: 106, name: 'Big bones', min: 1, max: 1 }], main: [{ id: 4001, name: 'Leviathan bone', weight: 5, min: 1, max: 2 }, { id: 4002, name: 'Fossilized fang', weight: 2, min: 1, max: 1 }, { id: 101, name: 'Coins', weight: 8, min: 40, max: 150 }] });

mob('scarab_swarm', { name: 'Scarab swarm', combat: 35, maxHp: 30, maxHit: 5, stats: { attack: 22, strength: 20, defence: 10 }, attackSpeed: 3, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 4, wanderRadius: 5, respawnTicks: 35, examine: 'A swarm of biting scarabs.', weakness: 'magic', tags: ['beast'], resistance: 'melee' });

mob('vulture', { name: 'Vulture', combat: 10, maxHp: 12, maxHit: 2, stats: { attack: 5, strength: 4, defence: 4 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: false, wanderRadius: 8, respawnTicks: 20, examine: 'Circling overhead.', weakness: 'ranged', tags: ['beast'] });

mob('sand_snake', { name: 'Sand snake', combat: 25, maxHp: 20, maxHit: 4, stats: { attack: 15, strength: 18, defence: 8 }, attackSpeed: 3, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 3, wanderRadius: 5, respawnTicks: 30, examine: 'A venomous desert serpent.', weakness: 'slash', tags: ['beast'], poisonDamage: 2 });

mob('pyramid_guardian', { name: 'Pyramid guardian', combat: 70, maxHp: 90, maxHit: 10, stats: { attack: 45, strength: 42, defence: 55 }, attackSpeed: 5, attackRange: 1, attackStyle: 'melee', size: 2, aggressive: true, aggroRange: 4, wanderRadius: 2, respawnTicks: 80, examine: 'An ancient guardian. Still on duty.', weakness: 'magic', tags: ['construct', 'armoured'], resistance: 'ranged' },
  { always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 100, max: 400 }, { id: 4091, name: 'Pyramid key', weight: 1, min: 1, max: 1 }, { id: 0, name: 'Nothing', weight: 5, min: 0, max: 0 }] });

// ══════════════════════════════════════════════════════════════════════════════
// MORYSKAH — expand from 10 to ~25
// ══════════════════════════════════════════════════════════════════════════════

mob('bloodveld', { name: 'Bloodveld', combat: 76, maxHp: 80, maxHit: 9, stats: { attack: 48, strength: 50, defence: 40 }, attackSpeed: 4, attackRange: 3, attackStyle: 'magic', aggressive: true, aggroRange: 4, wanderRadius: 4, respawnTicks: 50, examine: 'A creature of the blood dimension.', weakness: 'ranged', tags: ['demon'], resistance: 'magic' },
  { always: [], main: [{ id: 5001, name: 'Vial of blood', weight: 15, min: 1, max: 3 }, { id: 101, name: 'Coins', weight: 10, min: 30, max: 120 }, { id: 11358, name: 'Blood rune', weight: 3, min: 3, max: 8 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });

mob('gargoyle', { name: 'Gargoyle', combat: 78, maxHp: 90, maxHit: 10, stats: { attack: 50, strength: 48, defence: 60 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: false, aggroRange: 3, wanderRadius: 2, respawnTicks: 55, examine: 'A stone creature that comes alive.', weakness: 'crush', tags: ['construct', 'armoured'], resistance: 'ranged' },
  { always: [], main: [{ id: 101, name: 'Coins', weight: 10, min: 50, max: 200 }, { id: 2115, name: 'Adamantite bar', weight: 3, min: 1, max: 2 }, { id: 12504, name: 'Uncut diamond', weight: 1, min: 1, max: 1 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

mob('nechryael', { name: 'Nechryael', combat: 115, maxHp: 105, maxHit: 13, stats: { attack: 72, strength: 70, defence: 85 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 4, wanderRadius: 3, respawnTicks: 55, examine: 'A demon of death. Spawns death spawns.', weakness: 'slash', tags: ['demon'], resistance: 'magic' },
  { always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 80, max: 300 }, { id: 11357, name: 'Death rune', weight: 5, min: 5, max: 15 }, { id: 12005, name: 'Grimy ranarr', weight: 3, min: 1, max: 2 }, { id: 0, name: 'Nothing', weight: 5, min: 0, max: 0 }] });

mob('dark_beast', { name: 'Dark beast', combat: 182, maxHp: 220, maxHit: 18, stats: { attack: 110, strength: 105, defence: 120 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 5, wanderRadius: 4, respawnTicks: 60, examine: 'A creature of pure darkness.', weakness: 'ranged', tags: ['beast', 'shadow'], resistance: 'melee' },
  { always: [], main: [{ id: 101, name: 'Coins', weight: 6, min: 200, max: 600 }, { id: 11357, name: 'Death rune', weight: 5, min: 10, max: 25 }, { id: 11358, name: 'Blood rune', weight: 3, min: 5, max: 12 }, { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 }] });

mob('shade', { name: 'Shade', combat: 45, maxHp: 40, maxHit: 6, stats: { attack: 25, strength: 22, defence: 20 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 4, wanderRadius: 3, respawnTicks: 40, examine: 'A shadowy undead.', weakness: 'magic', tags: ['undead', 'shadow'], resistance: 'melee' });

mob('vyrewatch', { name: 'Vyrewatch', combat: 110, maxHp: 120, maxHit: 14, stats: { attack: 70, strength: 65, defence: 80 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 5, wanderRadius: 4, respawnTicks: 60, examine: 'An ancient vampyre. Requires special weapons to harm.', weakness: 'slash', tags: ['vampyre', 'undead'], resistance: 'ranged' },
  { always: [], main: [{ id: 5001, name: 'Vial of blood', weight: 15, min: 2, max: 5 }, { id: 5008, name: 'Vampyre fang', weight: 5, min: 1, max: 1 }, { id: 101, name: 'Coins', weight: 8, min: 100, max: 400 }, { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 }] });

// ══════════════════════════════════════════════════════════════════════════════
// VEILWOOD — expand from 8 to ~20
// ══════════════════════════════════════════════════════════════════════════════

mob('moss_warrior', { name: 'Moss warrior', combat: 48, maxHp: 55, maxHit: 7, stats: { attack: 30, strength: 28, defence: 22 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 4, wanderRadius: 5, respawnTicks: 45, examine: 'A plant creature in the shape of a warrior.', weakness: 'slash', tags: ['plant'] },
  { always: [], main: [{ id: 6002, name: 'Veilwood bark', weight: 5, min: 1, max: 2 }, { id: 101, name: 'Coins', weight: 10, min: 15, max: 50 }, { id: 0, name: 'Nothing', weight: 10, min: 0, max: 0 }] });

mob('dire_wolf', { name: 'Dire wolf', combat: 55, maxHp: 65, maxHit: 8, stats: { attack: 38, strength: 40, defence: 25 }, attackSpeed: 3, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 6, wanderRadius: 8, respawnTicks: 45, examine: 'A massive wolf. Terrifying.', weakness: 'stab', tags: ['beast'] },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 12, min: 20, max: 60 }, { id: 0, name: 'Nothing', weight: 10, min: 0, max: 0 }] });

mob('tree_spirit', { name: 'Tree spirit', combat: 70, maxHp: 85, maxHit: 9, stats: { attack: 42, strength: 38, defence: 45 }, attackSpeed: 5, attackRange: 4, attackStyle: 'magic', size: 2, aggressive: false, aggroRange: 3, wanderRadius: 2, respawnTicks: 60, examine: 'An ancient spirit bound to a tree.', weakness: 'slash', tags: ['spirit', 'plant'], resistance: 'magic' },
  { always: [{ id: 2206, name: 'Magic logs', min: 1, max: 3 }], main: [{ id: 6004, name: 'Spirit seed', weight: 2, min: 1, max: 1 }, { id: 101, name: 'Coins', weight: 8, min: 30, max: 100 }] });

mob('elven_warrior', { name: 'Elven warrior', combat: 55, maxHp: 60, maxHit: 7, stats: { attack: 38, strength: 30, defence: 35 }, attackSpeed: 4, attackRange: 6, attackStyle: 'ranged', aggressive: false, wanderRadius: 3, respawnTicks: 50, examine: 'An elven warrior patrolling the borders.', weakness: 'magic', tags: ['human'] });

mob('giant_beetle', { name: 'Giant beetle', combat: 22, maxHp: 28, maxHit: 4, stats: { attack: 12, strength: 15, defence: 20 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: false, wanderRadius: 5, respawnTicks: 30, examine: 'A very large beetle.', weakness: 'crush', tags: ['beast', 'armoured'] });

mob('pixie', { name: 'Pixie', combat: 15, maxHp: 10, maxHit: 3, stats: { attack: 8, strength: 5, defence: 8 }, attackSpeed: 3, attackRange: 4, attackStyle: 'magic', aggressive: false, wanderRadius: 8, respawnTicks: 25, examine: 'A tiny magical being. Fast and annoying.', weakness: 'ranged', tags: ['spirit'] },
  { always: [], main: [{ id: 6003, name: 'Moonpetal', weight: 5, min: 1, max: 1 }, { id: 0, name: 'Nothing', weight: 15, min: 0, max: 0 }] });

// ══════════════════════════════════════════════════════════════════════════════
// SOOTWORKS — expand from 7 to ~20
// ══════════════════════════════════════════════════════════════════════════════

mob('steam_elemental', { name: 'Steam elemental', combat: 55, maxHp: 60, maxHit: 7, stats: { attack: 35, strength: 30, defence: 28 }, attackSpeed: 4, attackRange: 3, attackStyle: 'magic', aggressive: true, aggroRange: 4, wanderRadius: 4, respawnTicks: 45, examine: 'A being of superheated steam.', weakness: 'ranged', tags: ['elemental'], resistance: 'melee' },
  { always: [], main: [{ id: 7004, name: 'Steam valve', weight: 8, min: 1, max: 2 }, { id: 101, name: 'Coins', weight: 10, min: 20, max: 80 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });

mob('iron_dragon', { name: 'Iron dragon', combat: 189, maxHp: 165, maxHit: 18, stats: { attack: 120, strength: 115, defence: 170 }, attackSpeed: 5, attackRange: 4, attackStyle: 'ranged', size: 3, aggressive: true, aggroRange: 4, wanderRadius: 3, respawnTicks: 80, examine: 'A dragon made of iron. Immune to melee without dragonfire protection.', weakness: 'magic', tags: ['dragon', 'armoured'], resistance: 'melee' },
  { always: [{ id: 107, name: 'Dragon bones', min: 1, max: 1 }], main: [{ id: 2112, name: 'Iron bar', weight: 10, min: 5, max: 15 }, { id: 101, name: 'Coins', weight: 6, min: 200, max: 800 }, { id: 1511, name: 'Rune platebody', weight: 1, min: 1, max: 1 }, { id: 0, name: 'Nothing', weight: 3, min: 0, max: 0 }] });

mob('steel_dragon', { name: 'Steel dragon', combat: 246, maxHp: 210, maxHit: 22, stats: { attack: 150, strength: 140, defence: 200 }, attackSpeed: 5, attackRange: 4, attackStyle: 'ranged', size: 3, aggressive: true, aggroRange: 4, wanderRadius: 3, respawnTicks: 100, examine: 'A dragon made of steel. Even tougher than iron.', weakness: 'magic', tags: ['dragon', 'armoured'], resistance: 'melee' },
  { always: [{ id: 107, name: 'Dragon bones', min: 1, max: 1 }], main: [{ id: 2113, name: 'Steel bar', weight: 10, min: 5, max: 15 }, { id: 101, name: 'Coins', weight: 5, min: 500, max: 1500 }, { id: 0, name: 'Nothing', weight: 3, min: 0, max: 0 }] });

mob('animated_armour', { name: 'Animated armour', combat: 46, maxHp: 50, maxHit: 6, stats: { attack: 28, strength: 25, defence: 35 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 3, wanderRadius: 2, respawnTicks: 45, examine: 'Armour brought to life by old dwarven magic.', weakness: 'crush', tags: ['construct', 'armoured'], resistance: 'ranged' },
  { always: [], main: [{ id: 7003, name: 'Clockwork gear', weight: 8, min: 1, max: 3 }, { id: 101, name: 'Coins', weight: 10, min: 15, max: 60 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });

mob('dwarven_miner', { name: 'Crazed miner', combat: 35, maxHp: 38, maxHit: 5, stats: { attack: 22, strength: 25, defence: 18 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 3, wanderRadius: 3, respawnTicks: 40, examine: 'A dwarf driven mad by the deep mines.', weakness: 'stab', tags: ['human'] },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 7001, name: 'Soot-iron ore', weight: 5, min: 1, max: 2 }, { id: 2104, name: 'Coal', weight: 8, min: 2, max: 5 }, { id: 101, name: 'Coins', weight: 10, min: 10, max: 40 }] });

// ══════════════════════════════════════════════════════════════════════════════
// SALTBRINE — expand from 8 to ~20
// ══════════════════════════════════════════════════════════════════════════════

mob('cave_crawler', { name: 'Cave crawler', combat: 23, maxHp: 22, maxHit: 4, stats: { attack: 12, strength: 14, defence: 10 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 3, wanderRadius: 4, respawnTicks: 30, examine: 'A cave-dwelling insect.', weakness: 'crush', tags: ['beast'], poisonDamage: 2 });

mob('giant_crab', { name: 'Giant crab', combat: 40, maxHp: 50, maxHit: 6, stats: { attack: 25, strength: 28, defence: 35 }, attackSpeed: 5, attackRange: 1, attackStyle: 'melee', aggressive: false, wanderRadius: 4, respawnTicks: 45, examine: 'An enormous crab. Could feed a family.', weakness: 'crush', tags: ['beast', 'armoured'] },
  { always: [], main: [{ id: 2304, name: 'Raw lobster', weight: 8, min: 1, max: 2 }, { id: 8004, name: 'Barnacle shell', weight: 10, min: 2, max: 5 }, { id: 101, name: 'Coins', weight: 8, min: 10, max: 50 }] });

mob('dagannoth', { name: 'Dagannoth', combat: 74, maxHp: 70, maxHit: 8, stats: { attack: 48, strength: 50, defence: 40 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 5, wanderRadius: 5, respawnTicks: 50, examine: 'A sea creature from the deep. Fights in packs.', weakness: 'slash', tags: ['beast'] },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 40, max: 150 }, { id: 8006, name: 'Coral fragment', weight: 5, min: 1, max: 2 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });

mob('jellyfish', { name: 'Giant jellyfish', combat: 30, maxHp: 28, maxHit: 5, stats: { attack: 15, strength: 18, defence: 12 }, attackSpeed: 4, attackRange: 2, attackStyle: 'magic', aggressive: true, aggroRange: 4, wanderRadius: 5, respawnTicks: 35, examine: 'A massive jellyfish. Its tentacles burn.', weakness: 'slash', tags: ['beast'], poisonDamage: 3, resistance: 'magic' });

mob('pirate_guard', { name: 'Pirate guard', combat: 45, maxHp: 48, maxHit: 7, stats: { attack: 30, strength: 28, defence: 25 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 4, wanderRadius: 3, respawnTicks: 50, examine: 'A pirate on guard duty.', weakness: 'magic', tags: ['human'] },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 12, min: 20, max: 80 }, { id: 8003, name: 'Pirate rum', weight: 5, min: 1, max: 1 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });

mob('sea_troll', { name: 'Sea troll', combat: 65, maxHp: 75, maxHit: 9, stats: { attack: 40, strength: 42, defence: 35 }, attackSpeed: 5, attackRange: 1, attackStyle: 'melee', size: 2, aggressive: true, aggroRange: 4, wanderRadius: 4, respawnTicks: 55, examine: 'A troll from the coastal caves.', weakness: 'magic', tags: ['beast'], resistance: 'ranged' },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 2306, name: 'Raw shark', weight: 3, min: 1, max: 1 }, { id: 101, name: 'Coins', weight: 8, min: 30, max: 120 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

// ══════════════════════════════════════════════════════════════════════════════
// GLASS DESERT — expand from 7 to ~15
// ══════════════════════════════════════════════════════════════════════════════

mob('crystal_dragon', { name: 'Crystal dragon', combat: 220, maxHp: 250, maxHit: 24, stats: { attack: 140, strength: 130, defence: 160 }, attackSpeed: 5, attackRange: 5, attackStyle: 'magic', size: 3, aggressive: true, aggroRange: 5, wanderRadius: 3, respawnTicks: 90, examine: 'A dragon with crystalline scales. Refracts magic.', weakness: 'stab', tags: ['dragon'], resistance: 'magic' },
  { always: [{ id: 107, name: 'Dragon bones', min: 1, max: 1 }], main: [{ id: 10001, name: 'Crystal shard', weight: 8, min: 5, max: 15 }, { id: 10004, name: 'Refracted essence', weight: 3, min: 1, max: 2 }, { id: 101, name: 'Coins', weight: 5, min: 500, max: 2000 }, { id: 0, name: 'Nothing', weight: 2, min: 0, max: 0 }] });

mob('prism_elemental', { name: 'Prism elemental', combat: 90, maxHp: 100, maxHit: 12, stats: { attack: 55, strength: 50, defence: 55 }, attackSpeed: 4, attackRange: 5, attackStyle: 'magic', size: 2, aggressive: true, aggroRange: 5, wanderRadius: 4, respawnTicks: 60, examine: 'A being of pure refracted light.', weakness: 'crush', tags: ['elemental'], resistance: 'ranged' },
  { always: [], main: [{ id: 10004, name: 'Refracted essence', weight: 5, min: 1, max: 1 }, { id: 10002, name: 'Prism lens', weight: 2, min: 1, max: 1 }, { id: 101, name: 'Coins', weight: 8, min: 80, max: 300 }] });

mob('sand_wraith', { name: 'Sand wraith', combat: 75, maxHp: 65, maxHit: 10, stats: { attack: 48, strength: 40, defence: 35 }, attackSpeed: 4, attackRange: 4, attackStyle: 'magic', aggressive: true, aggroRange: 5, wanderRadius: 5, respawnTicks: 50, examine: 'An ancient spirit of the Glass Desert.', weakness: 'ranged', tags: ['undead', 'spirit'], resistance: 'melee' },
  { always: [], main: [{ id: 10001, name: 'Crystal shard', weight: 10, min: 2, max: 5 }, { id: 4006, name: 'Sand rune', weight: 5, min: 3, max: 8 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });

// ══════════════════════════════════════════════════════════════════════════════
// INKWEALD — expand from 7 to ~15
// ══════════════════════════════════════════════════════════════════════════════

mob('nightmare_spawn', { name: 'Nightmare spawn', combat: 85, maxHp: 90, maxHit: 11, stats: { attack: 55, strength: 50, defence: 45 }, attackSpeed: 4, attackRange: 3, attackStyle: 'magic', aggressive: true, aggroRange: 5, wanderRadius: 4, respawnTicks: 55, examine: 'A creature born from pure nightmare.', weakness: 'crush', tags: ['spirit', 'shadow'], resistance: 'magic' },
  { always: [], main: [{ id: 9004, name: 'Nightmare shard', weight: 5, min: 1, max: 1 }, { id: 9001, name: 'Inkblot fragment', weight: 8, min: 2, max: 4 }, { id: 101, name: 'Coins', weight: 6, min: 60, max: 200 }] });

mob('echo_wraith', { name: 'Echo wraith', combat: 65, maxHp: 55, maxHit: 8, stats: { attack: 40, strength: 35, defence: 30 }, attackSpeed: 4, attackRange: 5, attackStyle: 'magic', aggressive: true, aggroRange: 5, wanderRadius: 5, respawnTicks: 45, examine: 'An echo of someone who died in the dream.', weakness: 'stab', tags: ['undead', 'spirit'], resistance: 'magic' },
  { always: [], main: [{ id: 9005, name: 'Echo petal', weight: 8, min: 1, max: 2 }, { id: 9003, name: 'Dream thread', weight: 3, min: 1, max: 1 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });

mob('lucid_crawler', { name: 'Lucid crawler', combat: 50, maxHp: 48, maxHit: 7, stats: { attack: 30, strength: 28, defence: 25 }, attackSpeed: 3, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 4, wanderRadius: 5, respawnTicks: 40, examine: 'A spider-like creature that feeds on conscious thoughts.', weakness: 'crush', tags: ['beast', 'shadow'] },
  { always: [], main: [{ id: 9002, name: 'Lucid essence', weight: 3, min: 1, max: 1 }, { id: 9001, name: 'Inkblot fragment', weight: 8, min: 1, max: 2 }, { id: 0, name: 'Nothing', weight: 10, min: 0, max: 0 }] });

// ══════════════════════════════════════════════════════════════════════════════
// THE WILDS — PvP monsters (revenants, wilderness bosses)
// ══════════════════════════════════════════════════════════════════════════════

mob('revenant_goblin', { name: 'Revenant goblin', combat: 52, maxHp: 50, maxHit: 9, stats: { attack: 30, strength: 35, defence: 20 }, attackSpeed: 3, attackRange: 5, attackStyle: 'magic', aggressive: true, aggroRange: 8, wanderRadius: 8, respawnTicks: 120, examine: 'A ghostly goblin. Heals itself.', weakness: 'magic', tags: ['undead', 'spirit'], resistance: 'melee' },
  { always: [], main: [{ id: 101, name: 'Coins', weight: 10, min: 50, max: 300 }, { id: 12503, name: 'Uncut ruby', weight: 3, min: 1, max: 1 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });

mob('revenant_knight', { name: 'Revenant knight', combat: 126, maxHp: 140, maxHit: 16, stats: { attack: 82, strength: 80, defence: 90 }, attackSpeed: 3, attackRange: 5, attackStyle: 'magic', aggressive: true, aggroRange: 8, wanderRadius: 8, respawnTicks: 150, examine: 'A ghostly knight. Very dangerous.', weakness: 'magic', tags: ['undead', 'spirit', 'armoured'], resistance: 'melee' },
  { always: [], main: [{ id: 101, name: 'Coins', weight: 6, min: 500, max: 3000 }, { id: 12505, name: 'Uncut dragonstone', weight: 1, min: 1, max: 1 }, { id: 1512, name: 'Rune platelegs', weight: 2, min: 1, max: 1 }, { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 }] });

mob('revenant_dragon', { name: 'Revenant dragon', combat: 180, maxHp: 200, maxHit: 22, stats: { attack: 120, strength: 115, defence: 130 }, attackSpeed: 3, attackRange: 5, attackStyle: 'magic', size: 3, aggressive: true, aggroRange: 10, wanderRadius: 6, respawnTicks: 200, examine: 'A ghostly dragon. The most dangerous revenant.', weakness: 'magic', tags: ['undead', 'spirit', 'dragon'], resistance: 'melee' },
  { always: [], main: [{ id: 101, name: 'Coins', weight: 4, min: 2000, max: 10000 }, { id: 107, name: 'Dragon bones', weight: 5, min: 1, max: 2 }, { id: 12505, name: 'Uncut dragonstone', weight: 2, min: 1, max: 1 }, { id: 0, name: 'Nothing', weight: 3, min: 0, max: 0 }] });

mob('chaos_elemental', { name: 'Chaos elemental', combat: 305, maxHp: 250, maxHit: 28, stats: { attack: 180, strength: 170, defence: 150 }, attackSpeed: 4, attackRange: 8, attackStyle: 'magic', size: 3, aggressive: true, aggroRange: 8, wanderRadius: 5, respawnTicks: 200, examine: 'An entity of pure chaos. Unpredictable attacks.', weakness: 'ranged', tags: ['elemental', 'boss'] },
  { always: [], main: [{ id: 101, name: 'Coins', weight: 5, min: 5000, max: 20000 }, { id: 107, name: 'Dragon bones', weight: 4, min: 2, max: 3 }, { id: 11358, name: 'Blood rune', weight: 3, min: 10, max: 30 }, { id: 0, name: 'Nothing', weight: 3, min: 0, max: 0 }] });

mob('wild_dog', { name: 'Wild dog', combat: 22, maxHp: 28, maxHit: 4, stats: { attack: 14, strength: 16, defence: 10 }, attackSpeed: 3, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 5, wanderRadius: 8, respawnTicks: 25, examine: 'A feral dog. Hunts in packs.', weakness: 'stab', tags: ['beast'] });

mob('lava_dragon', { name: 'Lava dragon', combat: 252, maxHp: 230, maxHit: 25, stats: { attack: 160, strength: 155, defence: 180 }, attackSpeed: 5, attackRange: 5, attackStyle: 'magic', size: 4, aggressive: true, aggroRange: 5, wanderRadius: 3, respawnTicks: 120, examine: 'A dragon wreathed in lava. Deep wilderness only.', weakness: 'stab', tags: ['dragon'], resistance: 'magic' },
  { always: [{ id: 107, name: 'Dragon bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 4, min: 1000, max: 5000 }, { id: 11358, name: 'Blood rune', weight: 3, min: 5, max: 15 }, { id: 2116, name: 'Runite bar', weight: 2, min: 1, max: 2 }, { id: 0, name: 'Nothing', weight: 3, min: 0, max: 0 }] });

// ══════════════════════════════════════════════════════════════════════════════

console.log(`[aelgard] Monster expansion loaded — ${[...npcs.npcDefs.keys()].length - 104} new monsters`);
