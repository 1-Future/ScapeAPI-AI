// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Monster Blitz Round 2
// 150+ more monsters. Dungeons, cave systems, city variants, underwater,
// rare spawns, boss minions, skilling area creatures.
// Target: bring total to 400+
// ══════════════════════════════════════════════════════════════════════════════

const npcs = require('../../world/npcs');
const droptables = require('../../data/droptables');

function mob(defId, def, drops) {
  npcs.defineNpc(defId, def);
  if (drops) droptables.define(defId, drops);
}

// ══════════════════════════════════════════════════════════════════════════════
// HEARTLANDS — city variants, underground, countryside
// ══════════════════════════════════════════════════════════════════════════════

mob('mugger', { name: 'Mugger', combat: 6, maxHp: 7, maxHit: 2, stats: { attack: 3, strength: 3, defence: 2 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 3, wanderRadius: 4, respawnTicks: 20, examine: 'He wants your money.', weakness: 'slash', tags: ['human'] },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 6, max: 30 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
mob('highwayman', { name: 'Highwayman', combat: 15, maxHp: 18, maxHit: 3, stats: { attack: 9, strength: 8, defence: 7 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 4, wanderRadius: 5, respawnTicks: 30, examine: 'Stand and deliver!', weakness: 'stab', tags: ['human'] },
  { always: [], main: [{ id: 101, name: 'Coins', weight: 15, min: 5, max: 25 }, { id: 0, name: 'Nothing', weight: 10, min: 0, max: 0 }] });
mob('thief', { name: 'Thief', combat: 22, maxHp: 24, maxHit: 4, stats: { attack: 14, strength: 12, defence: 10 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 3, wanderRadius: 4, respawnTicks: 30, examine: 'A common thief.', weakness: 'slash', tags: ['human'] },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 22, max: 66 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
mob('paladin', { name: 'Paladin', combat: 55, maxHp: 58, maxHit: 7, stats: { attack: 38, strength: 35, defence: 35 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: false, wanderRadius: 3, respawnTicks: 50, examine: 'A holy warrior.', weakness: 'crush', tags: ['human', 'armoured'] },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 30, max: 100 }, { id: 11356, name: 'Chaos rune', weight: 3, min: 2, max: 5 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
mob('hero', { name: 'Hero', combat: 63, maxHp: 65, maxHit: 8, stats: { attack: 42, strength: 40, defence: 38 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: false, wanderRadius: 3, respawnTicks: 50, examine: 'An adventurer in fine armour.', weakness: 'stab', tags: ['human'] },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 8, min: 50, max: 200 }, { id: 12503, name: 'Uncut ruby', weight: 2, min: 1, max: 1 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });
mob('sheep', { name: 'Sheep', combat: 0, maxHp: 5, maxHit: 0, stats: {}, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: false, wanderRadius: 5, respawnTicks: 15, examine: 'Baa!', weakness: 'slash' },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }, { id: 1737, name: 'Wool', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 6, min: 1, max: 5 }, { id: 0, name: 'Nothing', weight: 10, min: 0, max: 0 }] });
mob('duck', { name: 'Duck', combat: 0, maxHp: 2, maxHit: 0, stats: {}, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: false, wanderRadius: 4, respawnTicks: 10, examine: 'Quack.' },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 314, name: 'Feather', weight: 10, min: 3, max: 8 }, { id: 2138, name: 'Raw duck', weight: 6, min: 1, max: 1 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
mob('dog', { name: 'Dog', combat: 0, maxHp: 4, maxHit: 0, stats: {}, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: false, wanderRadius: 5, respawnTicks: 15, examine: 'A friendly dog.' },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 2132, name: 'Raw beef', weight: 6, min: 1, max: 1 }, { id: 0, name: 'Nothing', weight: 10, min: 0, max: 0 }] });
mob('ghost', { name: 'Ghost', combat: 19, maxHp: 15, maxHit: 3, stats: { attack: 10, strength: 8, defence: 8 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 3, wanderRadius: 3, respawnTicks: 30, examine: 'A transparent ghost.', weakness: 'magic', tags: ['undead', 'spirit'], resistance: 'melee' },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 19, max: 57 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
mob('dwarf', { name: 'Dwarf', combat: 10, maxHp: 15, maxHit: 2, stats: { attack: 5, strength: 6, defence: 8 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: false, wanderRadius: 3, respawnTicks: 25, examine: 'A short, sturdy creature.', weakness: 'stab', tags: ['human'] },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 10, max: 30 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
mob('barbarian', { name: 'Barbarian', combat: 17, maxHp: 20, maxHit: 3, stats: { attack: 10, strength: 12, defence: 8 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: false, wanderRadius: 4, respawnTicks: 30, examine: 'A fierce barbarian warrior.', weakness: 'stab', tags: ['human'] },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 17, max: 51 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
mob('pigeon', { name: 'Pigeon', combat: 0, maxHp: 1, maxHit: 0, stats: {}, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: false, wanderRadius: 6, respawnTicks: 10, examine: 'Coo.' },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 314, name: 'Feather', weight: 10, min: 1, max: 3 }, { id: 0, name: 'Nothing', weight: 12, min: 0, max: 0 }] });
mob('bat', { name: 'Bat', combat: 5, maxHp: 6, maxHit: 1, stats: { attack: 3, strength: 2, defence: 2 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: false, wanderRadius: 5, respawnTicks: 15, examine: 'A small cave bat.', weakness: 'ranged' },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 5, max: 30 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
mob('giant_bat', { name: 'Giant bat', combat: 27, maxHp: 32, maxHit: 4, stats: { attack: 16, strength: 14, defence: 12 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 4, wanderRadius: 5, respawnTicks: 30, examine: 'A very large bat.', weakness: 'ranged', tags: ['beast'] },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 27, max: 81 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
mob('earth_warrior', { name: 'Earth warrior', combat: 51, maxHp: 48, maxHit: 7, stats: { attack: 30, strength: 28, defence: 32 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 4, wanderRadius: 3, respawnTicks: 40, examine: 'A warrior made of earth.', weakness: 'slash', tags: ['elemental'] },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 51, max: 153 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
mob('wolf', { name: 'Wolf', combat: 16, maxHp: 18, maxHit: 3, stats: { attack: 8, strength: 10, defence: 6 }, attackSpeed: 3, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 5, wanderRadius: 8, respawnTicks: 25, examine: 'A wild wolf.', weakness: 'stab', tags: ['beast'] },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 16, max: 48 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
mob('crawling_zombie', { name: 'Crawling zombie', combat: 12, maxHp: 14, maxHit: 2, stats: { attack: 6, strength: 8, defence: 3 }, attackSpeed: 5, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 3, wanderRadius: 2, respawnTicks: 25, examine: 'A zombie missing its legs. Still dangerous.', weakness: 'slash', tags: ['undead'] },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 12, max: 36 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
mob('skeleton_archer', { name: 'Skeleton archer', combat: 22, maxHp: 20, maxHit: 4, stats: { attack: 14, strength: 12, defence: 8 }, attackSpeed: 4, attackRange: 5, attackStyle: 'ranged', aggressive: true, aggroRange: 5, wanderRadius: 3, respawnTicks: 35, examine: 'A skeleton with a bow.', weakness: 'crush', tags: ['undead'] },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 22, max: 66 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });

// ══════════════════════════════════════════════════════════════════════════════
// BONEYARD WASTES — expanded desert, tombs, nomad camps
// ══════════════════════════════════════════════════════════════════════════════

mob('desert_hawk', { name: 'Desert hawk', combat: 8, maxHp: 10, maxHit: 2, stats: { attack: 4, strength: 5, defence: 3 }, attackSpeed: 3, attackRange: 1, attackStyle: 'melee', aggressive: false, wanderRadius: 8, respawnTicks: 20, examine: 'A bird of prey.', weakness: 'ranged', tags: ['beast'] },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 8, max: 30 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
mob('tomb_spider', { name: 'Tomb spider', combat: 40, maxHp: 38, maxHit: 6, stats: { attack: 25, strength: 22, defence: 18 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 3, wanderRadius: 3, respawnTicks: 35, examine: 'A spider from the ancient tombs.', weakness: 'crush', tags: ['beast'], poisonDamage: 3 },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 40, max: 120 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
mob('sand_elemental', { name: 'Sand elemental', combat: 60, maxHp: 65, maxHit: 8, stats: { attack: 38, strength: 35, defence: 30 }, attackSpeed: 4, attackRange: 3, attackStyle: 'magic', aggressive: true, aggroRange: 4, wanderRadius: 4, respawnTicks: 45, examine: 'A being of living sand.', weakness: 'magic', tags: ['elemental'], resistance: 'melee' },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 60, max: 180 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
mob('nomad_warrior', { name: 'Nomad warrior', combat: 45, maxHp: 48, maxHit: 6, stats: { attack: 28, strength: 30, defence: 22 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: false, wanderRadius: 4, respawnTicks: 40, examine: 'A desert nomad fighter.', weakness: 'stab', tags: ['human'] },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 45, max: 135 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
mob('sand_worm', { name: 'Sand worm', combat: 55, maxHp: 60, maxHit: 8, stats: { attack: 35, strength: 40, defence: 20 }, attackSpeed: 5, attackRange: 1, attackStyle: 'melee', size: 2, aggressive: true, aggroRange: 3, wanderRadius: 4, respawnTicks: 50, examine: 'Burrows through the sand.', weakness: 'slash', tags: ['beast'] },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 55, max: 165 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
mob('fossilized_drake', { name: 'Fossilized drake', combat: 100, maxHp: 130, maxHit: 14, stats: { attack: 65, strength: 60, defence: 80 }, attackSpeed: 5, attackRange: 3, attackStyle: 'ranged', size: 2, aggressive: true, aggroRange: 4, wanderRadius: 3, respawnTicks: 70, examine: 'An ancient drake skeleton. Still flies.', weakness: 'crush', tags: ['undead', 'dragon'], resistance: 'melee' },
  { always: [{ id: 107, name: 'Dragon bones', min: 1, max: 1 }], main: [{ id: 4002, name: 'Fossilized fang', weight: 3, min: 1, max: 1 }, { id: 101, name: 'Coins', weight: 5, min: 100, max: 400 }, { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 }] });
mob('camel_warrior', { name: 'Camel warrior', combat: 105, maxHp: 110, maxHit: 12, stats: { attack: 68, strength: 62, defence: 58 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: false, wanderRadius: 3, respawnTicks: 60, examine: 'A powerful warrior atop a war camel.', weakness: 'magic', tags: ['human', 'beast'] },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 105, max: 315 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });

// ══════════════════════════════════════════════════════════════════════════════
// MORYSKAH — expanded catacombs, graveyard, deeper swamp
// ══════════════════════════════════════════════════════════════════════════════

mob('giant_undead_chicken', { name: 'Undead chicken', combat: 5, maxHp: 4, maxHit: 1, stats: { attack: 2, strength: 1, defence: 1 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: false, wanderRadius: 3, respawnTicks: 15, examine: 'A zombie chicken. Still clucks.', weakness: 'slash', tags: ['undead'] },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 5, max: 30 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
mob('zombie_rat', { name: 'Zombie rat', combat: 8, maxHp: 10, maxHit: 2, stats: { attack: 4, strength: 5, defence: 2 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 3, wanderRadius: 3, respawnTicks: 20, examine: 'A dead rat that still moves.', weakness: 'crush', tags: ['undead'] },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 8, max: 30 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
mob('twisted_banshee', { name: 'Twisted banshee', combat: 89, maxHp: 80, maxHit: 11, stats: { attack: 55, strength: 50, defence: 45 }, attackSpeed: 4, attackRange: 4, attackStyle: 'magic', aggressive: true, aggroRange: 5, wanderRadius: 3, respawnTicks: 50, examine: 'A more powerful banshee variant.', weakness: 'crush', tags: ['undead', 'spirit'], resistance: 'ranged' },
  { always: [], main: [{ id: 5007, name: 'Banshee vocal cord', weight: 6, min: 1, max: 2 }, { id: 101, name: 'Coins', weight: 8, min: 50, max: 200 }, { id: 11357, name: 'Death rune', weight: 4, min: 5, max: 12 }, { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 }] });
mob('catacomb_demon', { name: 'Catacomb demon', combat: 95, maxHp: 100, maxHit: 12, stats: { attack: 62, strength: 58, defence: 55 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 5, wanderRadius: 3, respawnTicks: 55, examine: 'A demon lurking in the catacombs.', weakness: 'ranged', tags: ['demon'], resistance: 'magic' },
  { always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 60, max: 250 }, { id: 11356, name: 'Chaos rune', weight: 5, min: 5, max: 15 }, { id: 0, name: 'Nothing', weight: 5, min: 0, max: 0 }] });
mob('skeletal_mystic', { name: 'Skeletal mystic', combat: 80, maxHp: 70, maxHit: 10, stats: { attack: 48, strength: 35, defence: 40 }, attackSpeed: 5, attackRange: 6, attackStyle: 'magic', aggressive: true, aggroRange: 5, wanderRadius: 2, respawnTicks: 50, examine: 'A skeleton that still channels magic.', weakness: 'ranged', tags: ['undead'], resistance: 'magic' },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 80, max: 240 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
mob('animated_spade', { name: 'Animated spade', combat: 15, maxHp: 12, maxHit: 3, stats: { attack: 8, strength: 10, defence: 5 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 2, wanderRadius: 2, respawnTicks: 20, examine: 'A spade brought to life by dark magic.', weakness: 'crush', tags: ['construct'] },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 15, max: 45 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
mob('swamp_snakeling', { name: 'Swamp snakeling', combat: 20, maxHp: 18, maxHit: 3, stats: { attack: 12, strength: 10, defence: 8 }, attackSpeed: 3, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 3, wanderRadius: 5, respawnTicks: 20, examine: 'A small venomous swamp snake.', weakness: 'slash', tags: ['beast'], poisonDamage: 2 },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 20, max: 60 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
mob('bog_beast', { name: 'Bog beast', combat: 55, maxHp: 58, maxHit: 7, stats: { attack: 35, strength: 38, defence: 25 }, attackSpeed: 5, attackRange: 1, attackStyle: 'melee', size: 2, aggressive: true, aggroRange: 3, wanderRadius: 3, respawnTicks: 45, examine: 'A creature of the deep bog.', weakness: 'ranged', tags: ['beast'], resistance: 'melee' },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 55, max: 165 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });

// ══════════════════════════════════════════════════════════════════════════════
// VEILWOOD — forest depths, elven ruins
// ══════════════════════════════════════════════════════════════════════════════

mob('mountain_troll', { name: 'Mountain troll', combat: 69, maxHp: 80, maxHit: 9, stats: { attack: 42, strength: 48, defence: 35 }, attackSpeed: 5, attackRange: 1, attackStyle: 'melee', size: 2, aggressive: true, aggroRange: 4, wanderRadius: 4, respawnTicks: 50, examine: 'A troll from the mountain pass.', weakness: 'magic', tags: ['beast'], resistance: 'ranged' },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 69, max: 207 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
mob('giant_moth', { name: 'Giant moth', combat: 18, maxHp: 15, maxHit: 3, stats: { attack: 10, strength: 8, defence: 6 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: false, wanderRadius: 8, respawnTicks: 20, examine: 'A moth the size of an eagle.', weakness: 'ranged', tags: ['beast'] },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 18, max: 54 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
mob('forest_archer', { name: 'Forest archer', combat: 35, maxHp: 32, maxHit: 5, stats: { attack: 22, strength: 18, defence: 15 }, attackSpeed: 4, attackRange: 6, attackStyle: 'ranged', aggressive: false, wanderRadius: 4, respawnTicks: 35, examine: 'A human archer living off the forest.', weakness: 'magic', tags: ['human'] },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 35, max: 105 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
mob('root_demon', { name: 'Root demon', combat: 72, maxHp: 78, maxHit: 9, stats: { attack: 45, strength: 42, defence: 38 }, attackSpeed: 4, attackRange: 2, attackStyle: 'melee', aggressive: true, aggroRange: 4, wanderRadius: 3, respawnTicks: 50, examine: 'A demon bound to the roots of an ancient tree.', weakness: 'slash', tags: ['demon', 'plant'] },
  { always: [], main: [{ id: 6002, name: 'Veilwood bark', weight: 5, min: 1, max: 2 }, { id: 101, name: 'Coins', weight: 8, min: 30, max: 120 }, { id: 0, name: 'Nothing', weight: 5, min: 0, max: 0 }] });
mob('dryad', { name: 'Dryad', combat: 42, maxHp: 40, maxHit: 6, stats: { attack: 25, strength: 20, defence: 22 }, attackSpeed: 4, attackRange: 4, attackStyle: 'magic', aggressive: false, wanderRadius: 5, respawnTicks: 40, examine: 'A tree spirit. Protective of its grove.', weakness: 'slash', tags: ['spirit', 'plant'], resistance: 'magic' },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 42, max: 126 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
mob('elven_scout', { name: 'Elven scout', combat: 28, maxHp: 25, maxHit: 4, stats: { attack: 15, strength: 12, defence: 14 }, attackSpeed: 4, attackRange: 6, attackStyle: 'ranged', aggressive: false, wanderRadius: 6, respawnTicks: 30, examine: 'An elf patrolling the borders.', weakness: 'magic', tags: ['human'] },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 28, max: 84 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
mob('grizzly_bear', { name: 'Grizzly bear', combat: 42, maxHp: 50, maxHit: 6, stats: { attack: 25, strength: 28, defence: 20 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 5, wanderRadius: 5, respawnTicks: 40, examine: 'An enormous grizzly.', weakness: 'stab', tags: ['beast'] },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 103, name: 'Raw beef', weight: 10, min: 2, max: 3 }, { id: 0, name: 'Nothing', weight: 5, min: 0, max: 0 }] });

// ══════════════════════════════════════════════════════════════════════════════
// SOOTWORKS — factory floor, deep mines, lava tubes
// ══════════════════════════════════════════════════════════════════════════════

mob('bronze_dragon', { name: 'Bronze dragon', combat: 131, maxHp: 130, maxHit: 14, stats: { attack: 80, strength: 78, defence: 110 }, attackSpeed: 5, attackRange: 4, attackStyle: 'ranged', size: 3, aggressive: true, aggroRange: 4, wanderRadius: 3, respawnTicks: 60, examine: 'A dragon made of bronze. The weakest metal dragon.', weakness: 'magic', tags: ['dragon', 'armoured'], resistance: 'melee' },
  { always: [{ id: 107, name: 'Dragon bones', min: 1, max: 1 }], main: [{ id: 2111, name: 'Bronze bar', weight: 10, min: 5, max: 15 }, { id: 101, name: 'Coins', weight: 6, min: 100, max: 400 }, { id: 0, name: 'Nothing', weight: 3, min: 0, max: 0 }] });
mob('coal_golem', { name: 'Coal golem', combat: 38, maxHp: 45, maxHit: 5, stats: { attack: 20, strength: 22, defence: 25 }, attackSpeed: 5, attackRange: 1, attackStyle: 'melee', aggressive: false, wanderRadius: 2, respawnTicks: 40, examine: 'A golem made of compressed coal.', weakness: 'crush', tags: ['elemental', 'construct'] },
  { always: [{ id: 2104, name: 'Coal', min: 2, max: 5 }], main: [] });
mob('mechanical_spider', { name: 'Mechanical spider', combat: 42, maxHp: 40, maxHit: 6, stats: { attack: 26, strength: 22, defence: 28 }, attackSpeed: 3, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 3, wanderRadius: 3, respawnTicks: 30, examine: 'A clockwork spider. Fast.', weakness: 'crush', tags: ['construct'] },
  { always: [], main: [{ id: 7003, name: 'Clockwork gear', weight: 8, min: 1, max: 2 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
mob('steam_dragon', { name: 'Steam dragon', combat: 170, maxHp: 180, maxHit: 18, stats: { attack: 105, strength: 100, defence: 120 }, attackSpeed: 5, attackRange: 4, attackStyle: 'magic', size: 3, aggressive: true, aggroRange: 4, wanderRadius: 2, respawnTicks: 80, examine: 'A dragon powered by steam. Unique to the Sootworks.', weakness: 'magic', tags: ['dragon', 'construct', 'armoured'], resistance: 'melee' },
  { always: [{ id: 107, name: 'Dragon bones', min: 1, max: 1 }], main: [{ id: 7002, name: 'Soot-iron bar', weight: 8, min: 5, max: 12 }, { id: 101, name: 'Coins', weight: 5, min: 300, max: 1000 }, { id: 0, name: 'Nothing', weight: 3, min: 0, max: 0 }] });
mob('cave_troll', { name: 'Cave troll', combat: 52, maxHp: 60, maxHit: 7, stats: { attack: 30, strength: 35, defence: 25 }, attackSpeed: 5, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 4, wanderRadius: 3, respawnTicks: 45, examine: 'A troll in the deep mines.', weakness: 'magic', tags: ['beast'] },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 52, max: 156 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });

// ══════════════════════════════════════════════════════════════════════════════
// SALTBRINE — tide pools, reef, smuggler caves, underwater
// ══════════════════════════════════════════════════════════════════════════════

mob('crab_hermit', { name: 'Hermit crab', combat: 20, maxHp: 25, maxHit: 3, stats: { attack: 10, strength: 12, defence: 18 }, attackSpeed: 5, attackRange: 1, attackStyle: 'melee', aggressive: false, wanderRadius: 3, respawnTicks: 25, examine: 'A crab in a shell.', weakness: 'crush', tags: ['beast', 'armoured'] },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 20, max: 60 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
mob('reef_shark', { name: 'Reef shark', combat: 55, maxHp: 50, maxHit: 7, stats: { attack: 35, strength: 38, defence: 22 }, attackSpeed: 3, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 6, wanderRadius: 8, respawnTicks: 40, examine: 'A shark in the coastal reef. Fast.', weakness: 'stab', tags: ['beast'] },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 55, max: 165 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
mob('giant_eel', { name: 'Giant eel', combat: 35, maxHp: 32, maxHit: 5, stats: { attack: 20, strength: 22, defence: 15 }, attackSpeed: 4, attackRange: 2, attackStyle: 'melee', aggressive: true, aggroRange: 4, wanderRadius: 5, respawnTicks: 35, examine: 'A massive electric eel.', weakness: 'ranged', tags: ['beast'] },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 35, max: 105 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
mob('barnacle_golem', { name: 'Barnacle golem', combat: 48, maxHp: 55, maxHit: 6, stats: { attack: 28, strength: 25, defence: 35 }, attackSpeed: 5, attackRange: 1, attackStyle: 'melee', size: 2, aggressive: false, wanderRadius: 2, respawnTicks: 50, examine: 'A golem encrusted with barnacles.', weakness: 'crush', tags: ['construct', 'armoured'] },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 48, max: 144 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
mob('smuggler', { name: 'Smuggler', combat: 32, maxHp: 35, maxHit: 5, stats: { attack: 20, strength: 18, defence: 16 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: false, wanderRadius: 3, respawnTicks: 35, examine: 'A smuggler in a hidden cove.', weakness: 'stab', tags: ['human'] },
  { always: [], main: [{ id: 101, name: 'Coins', weight: 12, min: 20, max: 100 }, { id: 8003, name: 'Pirate rum', weight: 5, min: 1, max: 2 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
mob('ghost_pirate', { name: 'Ghost pirate', combat: 40, maxHp: 38, maxHit: 6, stats: { attack: 24, strength: 22, defence: 18 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 4, wanderRadius: 3, respawnTicks: 40, examine: 'The ghost of a pirate. Still angry.', weakness: 'magic', tags: ['undead', 'spirit', 'human'], resistance: 'melee' },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 40, max: 120 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
mob('sea_urchin', { name: 'Sea urchin', combat: 10, maxHp: 12, maxHit: 2, stats: { attack: 3, strength: 5, defence: 15 }, attackSpeed: 5, attackRange: 1, attackStyle: 'melee', aggressive: false, wanderRadius: 1, respawnTicks: 20, examine: 'Step on one and regret it.', weakness: 'crush', tags: ['armoured'], poisonDamage: 1 },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 10, max: 30 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });

// ══════════════════════════════════════════════════════════════════════════════
// GLASS DESERT — crystal variants, desert endgame
// ══════════════════════════════════════════════════════════════════════════════

mob('crystal_unicorn', { name: 'Crystal unicorn', combat: 50, maxHp: 45, maxHit: 6, stats: { attack: 30, strength: 28, defence: 25 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: false, wanderRadius: 8, respawnTicks: 60, examine: 'A unicorn made entirely of crystal. Majestic.', weakness: 'crush', tags: ['beast'] },
  { always: [], main: [{ id: 10001, name: 'Crystal shard', weight: 8, min: 2, max: 5 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
mob('sand_phantom', { name: 'Sand phantom', combat: 65, maxHp: 55, maxHit: 8, stats: { attack: 42, strength: 38, defence: 30 }, attackSpeed: 4, attackRange: 4, attackStyle: 'magic', aggressive: true, aggroRange: 5, wanderRadius: 5, respawnTicks: 45, examine: 'A phantom that appears as a sand mirage.', weakness: 'ranged', tags: ['spirit'], resistance: 'melee' },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 65, max: 195 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
mob('glass_scorpion', { name: 'Glass scorpion', combat: 55, maxHp: 48, maxHit: 7, stats: { attack: 35, strength: 32, defence: 28 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 3, wanderRadius: 4, respawnTicks: 40, examine: 'A scorpion made of glass. Its sting is crystal-sharp.', weakness: 'crush', tags: ['beast', 'armoured'], poisonDamage: 4 },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 55, max: 165 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
mob('wyrm', { name: 'Wyrm', combat: 99, maxHp: 120, maxHit: 12, stats: { attack: 62, strength: 58, defence: 55 }, attackSpeed: 4, attackRange: 3, attackStyle: 'magic', aggressive: true, aggroRange: 4, wanderRadius: 3, respawnTicks: 55, examine: 'A lesser cousin of the Crystal Wyrm.', weakness: 'stab', tags: ['dragon'] },
  { always: [], main: [{ id: 10001, name: 'Crystal shard', weight: 8, min: 3, max: 8 }, { id: 101, name: 'Coins', weight: 6, min: 80, max: 300 }, { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 }] });
mob('drake', { name: 'Drake', combat: 192, maxHp: 200, maxHit: 18, stats: { attack: 120, strength: 110, defence: 100 }, attackSpeed: 4, attackRange: 3, attackStyle: 'ranged', size: 2, aggressive: true, aggroRange: 4, wanderRadius: 3, respawnTicks: 70, examine: 'A volcanic drake. Breathes fire.', weakness: 'stab', tags: ['dragon'] },
  { always: [{ id: 107, name: 'Dragon bones', min: 1, max: 1 }], main: [{ id: 10001, name: 'Crystal shard', weight: 5, min: 5, max: 15 }, { id: 101, name: 'Coins', weight: 4, min: 200, max: 800 }, { id: 0, name: 'Nothing', weight: 3, min: 0, max: 0 }] });

// ══════════════════════════════════════════════════════════════════════════════
// INKWEALD — expanded dream dungeon
// ══════════════════════════════════════════════════════════════════════════════

mob('dream_spider', { name: 'Dream spider', combat: 35, maxHp: 28, maxHit: 5, stats: { attack: 20, strength: 18, defence: 15 }, attackSpeed: 3, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 3, wanderRadius: 4, respawnTicks: 30, examine: 'A spider that exists only in dreams.', weakness: 'crush', tags: ['beast', 'spirit'] },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 35, max: 105 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
mob('consciousness_fragment', { name: 'Consciousness fragment', combat: 55, maxHp: 45, maxHit: 7, stats: { attack: 32, strength: 28, defence: 25 }, attackSpeed: 4, attackRange: 4, attackStyle: 'magic', aggressive: false, wanderRadius: 6, respawnTicks: 40, examine: 'A fragment of someone else\'s consciousness.', weakness: 'ranged', tags: ['spirit'] },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 55, max: 165 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
mob('false_self', { name: 'False self', combat: 70, maxHp: 65, maxHit: 9, stats: { attack: 42, strength: 40, defence: 38 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 3, wanderRadius: 2, respawnTicks: 50, examine: 'A mirror image of you. Fights with your stats.', weakness: 'magic', tags: ['spirit', 'shadow'] },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 70, max: 210 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
mob('void_leech', { name: 'Void leech', combat: 45, maxHp: 38, maxHit: 6, stats: { attack: 28, strength: 25, defence: 20 }, attackSpeed: 3, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 4, wanderRadius: 5, respawnTicks: 35, examine: 'A leech that drains your prayer.', weakness: 'slash', tags: ['beast', 'shadow'] },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 45, max: 135 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
mob('dream_dragon', { name: 'Dream dragon', combat: 150, maxHp: 180, maxHit: 16, stats: { attack: 95, strength: 90, defence: 85 }, attackSpeed: 4, attackRange: 5, attackStyle: 'magic', size: 3, aggressive: true, aggroRange: 5, wanderRadius: 3, respawnTicks: 80, examine: 'A dragon that exists only in the Inkweald. Not a real dragon — but the damage is real.', weakness: 'crush', tags: ['dragon', 'spirit'], resistance: 'magic' },
  { always: [{ id: 107, name: 'Dragon bones', min: 1, max: 1 }], main: [{ id: 9004, name: 'Nightmare shard', weight: 3, min: 1, max: 2 }, { id: 9002, name: 'Lucid essence', weight: 4, min: 1, max: 2 }, { id: 101, name: 'Coins', weight: 5, min: 300, max: 1000 }, { id: 0, name: 'Nothing', weight: 3, min: 0, max: 0 }] });

// ══════════════════════════════════════════════════════════════════════════════
// THE WILDS — more wilderness creatures, rare spawns
// ══════════════════════════════════════════════════════════════════════════════

mob('poison_spider_wild', { name: 'Poison spider', combat: 64, maxHp: 56, maxHit: 8, stats: { attack: 40, strength: 42, defence: 30 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 4, wanderRadius: 5, respawnTicks: 35, examine: 'A venomous spider in the wilderness.', weakness: 'crush', tags: ['beast'], poisonDamage: 5 },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 64, max: 192 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
mob('magic_axe', { name: 'Magic axe', combat: 42, maxHp: 40, maxHit: 6, stats: { attack: 25, strength: 28, defence: 18 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 3, wanderRadius: 3, respawnTicks: 30, examine: 'A floating enchanted axe.', weakness: 'magic', tags: ['construct'] },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 42, max: 126 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
mob('ice_spider', { name: 'Ice spider', combat: 34, maxHp: 30, maxHit: 5, stats: { attack: 20, strength: 18, defence: 15 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 3, wanderRadius: 4, respawnTicks: 30, examine: 'A spider encased in ice.', weakness: 'crush', tags: ['beast'] },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 34, max: 102 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
mob('mammoth', { name: 'Mammoth', combat: 80, maxHp: 100, maxHit: 10, stats: { attack: 48, strength: 55, defence: 45 }, attackSpeed: 5, attackRange: 1, attackStyle: 'melee', size: 3, aggressive: true, aggroRange: 5, wanderRadius: 5, respawnTicks: 60, examine: 'A massive prehistoric creature.', weakness: 'magic', tags: ['beast'] },
  { always: [{ id: 106, name: 'Big bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 8, min: 50, max: 200 }, { id: 0, name: 'Nothing', weight: 5, min: 0, max: 0 }] });
mob('lava_naga', { name: 'Lava naga', combat: 95, maxHp: 90, maxHit: 12, stats: { attack: 60, strength: 55, defence: 48 }, attackSpeed: 4, attackRange: 3, attackStyle: 'magic', aggressive: true, aggroRange: 5, wanderRadius: 4, respawnTicks: 55, examine: 'A serpentine creature wreathed in lava.', weakness: 'ranged', tags: ['elemental', 'beast'], resistance: 'melee' },
  { always: [], main: [{ id: 101, name: 'Coins', weight: 6, min: 80, max: 300 }, { id: 11358, name: 'Blood rune', weight: 3, min: 5, max: 10 }, { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 }] });
mob('vetion', { name: "Vet'ion", combat: 454, maxHp: 255, maxHit: 28, stats: { attack: 220, strength: 200, defence: 200 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', size: 3, aggressive: true, aggroRange: 6, wanderRadius: 0, respawnTicks: 200, examine: 'A skeletal champion of the wilderness. Incredibly powerful.', weakness: 'crush', tags: ['undead', 'boss'], resistance: 'ranged' },
  { always: [{ id: 107, name: 'Dragon bones', min: 2, max: 2 }], main: [{ id: 101, name: 'Coins', weight: 4, min: 5000, max: 20000 }, { id: 24001, name: 'Berserker ring', weight: 1, min: 1, max: 1 }, { id: 0, name: 'Nothing', weight: 3, min: 0, max: 0 }], tertiary: [{ id: 22008, name: 'Eternal gem', chance: 256, min: 1, max: 1 }] });
mob('callisto', { name: 'Callisto', combat: 470, maxHp: 255, maxHit: 30, stats: { attack: 230, strength: 210, defence: 220 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', size: 4, aggressive: true, aggroRange: 6, wanderRadius: 0, respawnTicks: 200, examine: 'A massive bear of the deep wilderness.', weakness: 'stab', tags: ['beast', 'boss'] },
  { always: [{ id: 107, name: 'Dragon bones', min: 2, max: 2 }], main: [{ id: 101, name: 'Coins', weight: 4, min: 5000, max: 20000 }, { id: 24004, name: 'Warrior ring', weight: 1, min: 1, max: 1 }, { id: 0, name: 'Nothing', weight: 3, min: 0, max: 0 }] });
mob('venenatis', { name: 'Venenatis', combat: 464, maxHp: 255, maxHit: 28, stats: { attack: 220, strength: 200, defence: 190 }, attackSpeed: 4, attackRange: 5, attackStyle: 'magic', size: 4, aggressive: true, aggroRange: 6, wanderRadius: 0, respawnTicks: 200, examine: 'A colossal poisonous spider of the wilderness.', weakness: 'ranged', tags: ['beast', 'boss'], poisonDamage: 6 },
  { always: [{ id: 107, name: 'Dragon bones', min: 2, max: 2 }], main: [{ id: 101, name: 'Coins', weight: 4, min: 5000, max: 20000 }, { id: 24005, name: 'Ring of suffering', weight: 1, min: 1, max: 1 }, { id: 0, name: 'Nothing', weight: 3, min: 0, max: 0 }] });
mob('crazy_archaeologist', { name: 'Crazy archaeologist', combat: 204, maxHp: 225, maxHit: 21, stats: { attack: 130, strength: 125, defence: 100 }, attackSpeed: 4, attackRange: 6, attackStyle: 'ranged', aggressive: true, aggroRange: 6, wanderRadius: 3, respawnTicks: 120, examine: 'A rogue archaeologist gone insane in the wilderness.', weakness: 'magic', tags: ['human', 'boss'] },
  { always: [], main: [{ id: 101, name: 'Coins', weight: 5, min: 2000, max: 8000 }, { id: 4092, name: 'Ancient tablet', weight: 2, min: 1, max: 1 }, { id: 0, name: 'Nothing', weight: 3, min: 0, max: 0 }] });

console.log('[aelgard] Monster blitz round 2 loaded');
