// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Monster Blitz
// 200+ more monsters. Pure volume. Every region gets 15-25 more creatures.
// Dungeons, caves, underwater, boss minions, rare spawns.
// ══════════════════════════════════════════════════════════════════════════════

const npcs = require('../../world/npcs');
const droptables = require('../../data/droptables');

function mob(defId, def, drops) {
  npcs.defineNpc(defId, def);
  if (drops) droptables.define(defId, drops);
}

// ══════════════════════════════════════════════════════════════════════════════
// HEARTLANDS DUNGEON — underground cave system below the town
// ══════════════════════════════════════════════════════════════════════════════

mob('cave_goblin', { name: 'Cave goblin', combat: 10, maxHp: 12, maxHit: 2, stats: { attack: 5, strength: 4, defence: 3 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 3, wanderRadius: 3, respawnTicks: 25, examine: 'A goblin adapted to cave life.', weakness: 'slash', tags: ['goblinoid'] });
mob('cave_rat', { name: 'Cave rat', combat: 3, maxHp: 5, maxHit: 1, stats: { attack: 2, strength: 1, defence: 1 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: false, wanderRadius: 3, respawnTicks: 15, examine: 'A rat adapted to the dark.', weakness: 'stab' });
mob('rock_slug', { name: 'Rock slug', combat: 29, maxHp: 27, maxHit: 4, stats: { attack: 18, strength: 16, defence: 20 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: false, wanderRadius: 2, respawnTicks: 30, examine: 'A slug made of rock. Use a salt bag to finish it.', weakness: 'magic', tags: ['beast'] });
mob('cockatrice', { name: 'Cockatrice', combat: 37, maxHp: 37, maxHit: 5, stats: { attack: 22, strength: 20, defence: 18 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: false, wanderRadius: 3, respawnTicks: 35, examine: 'Part chicken, part serpent. Bring a mirror shield.', weakness: 'crush', tags: ['beast'] });
mob('wall_beast', { name: 'Wall beast', combat: 35, maxHp: 30, maxHit: 5, stats: { attack: 20, strength: 22, defence: 15 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 1, wanderRadius: 0, respawnTicks: 30, examine: 'A tentacled creature that grabs from the wall.', weakness: 'slash', tags: ['beast'] });
mob('giant_frog', { name: 'Giant frog', combat: 13, maxHp: 15, maxHit: 2, stats: { attack: 7, strength: 6, defence: 5 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: false, wanderRadius: 5, respawnTicks: 20, examine: 'A very large frog.', weakness: 'ranged', tags: ['beast'] });
mob('hill_troll', { name: 'Hill troll', combat: 35, maxHp: 40, maxHit: 6, stats: { attack: 22, strength: 25, defence: 18 }, attackSpeed: 5, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 4, wanderRadius: 4, respawnTicks: 40, examine: 'A large, stupid troll.', weakness: 'magic', tags: ['beast'], resistance: 'ranged' });
mob('chaos_druid', { name: 'Chaos druid', combat: 13, maxHp: 20, maxHit: 3, stats: { attack: 8, strength: 6, defence: 5 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 3, wanderRadius: 3, respawnTicks: 25, examine: 'A druid gone to chaos.', weakness: 'ranged', tags: ['human'] },
  { always: [], main: [{ id: 12001, name: 'Grimy guam', weight: 8, min: 1, max: 1 }, { id: 12002, name: 'Grimy marrentill', weight: 6, min: 1, max: 1 }, { id: 12005, name: 'Grimy ranarr', weight: 1, min: 1, max: 1 }, { id: 101, name: 'Coins', weight: 10, min: 5, max: 30 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
mob('moss_warrior', { name: 'Moss warrior', combat: 48, maxHp: 55, maxHit: 7, stats: { attack: 30, strength: 28, defence: 22 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 4, wanderRadius: 5, respawnTicks: 45, examine: 'A warrior covered in moss.', weakness: 'slash', tags: ['plant'] });
mob('fire_giant', { name: 'Fire giant', combat: 86, maxHp: 111, maxHit: 10, stats: { attack: 60, strength: 62, defence: 55 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', size: 2, aggressive: true, aggroRange: 5, wanderRadius: 4, respawnTicks: 50, examine: 'A giant wreathed in flame.', weakness: 'magic', tags: ['elemental'], resistance: 'melee' },
  { always: [{ id: 106, name: 'Big bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 30, max: 150 }, { id: 11353, name: 'Fire rune', weight: 5, min: 10, max: 30 }, { id: 1502, name: 'Rune scimitar', weight: 1, min: 1, max: 1 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });
mob('ankou', { name: 'Ankou', combat: 75, maxHp: 60, maxHit: 9, stats: { attack: 50, strength: 48, defence: 42 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 4, wanderRadius: 3, respawnTicks: 40, examine: 'The spirit of death itself.', weakness: 'magic', tags: ['undead'], resistance: 'melee' },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 8, min: 50, max: 200 }, { id: 11357, name: 'Death rune', weight: 5, min: 5, max: 15 }, { id: 0, name: 'Nothing', weight: 5, min: 0, max: 0 }] });
mob('ice_warrior', { name: 'Ice warrior', combat: 57, maxHp: 50, maxHit: 7, stats: { attack: 35, strength: 32, defence: 30 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 4, wanderRadius: 3, respawnTicks: 40, examine: 'A warrior made of ice.', weakness: 'crush', tags: ['elemental'] });
mob('ice_giant', { name: 'Ice giant', combat: 53, maxHp: 70, maxHit: 7, stats: { attack: 30, strength: 35, defence: 25 }, attackSpeed: 5, attackRange: 1, attackStyle: 'melee', size: 2, aggressive: true, aggroRange: 5, wanderRadius: 4, respawnTicks: 55, examine: 'A frozen giant.', weakness: 'crush', tags: ['elemental'], resistance: 'ranged' },
  { always: [{ id: 106, name: 'Big bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 20, max: 80 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });

// ══════════════════════════════════════════════════════════════════════════════
// BONEYARD WASTES — desert dungeon creatures
// ══════════════════════════════════════════════════════════════════════════════

mob('desert_bandit', { name: 'Desert bandit', combat: 57, maxHp: 56, maxHit: 7, stats: { attack: 38, strength: 35, defence: 30 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 4, wanderRadius: 4, respawnTicks: 40, examine: 'A desert outlaw.', weakness: 'stab', tags: ['human'] },
  { always: [], main: [{ id: 101, name: 'Coins', weight: 12, min: 20, max: 80 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
mob('jackal', { name: 'Jackal', combat: 14, maxHp: 16, maxHit: 2, stats: { attack: 8, strength: 6, defence: 5 }, attackSpeed: 3, attackRange: 1, attackStyle: 'melee', aggressive: false, wanderRadius: 6, respawnTicks: 20, examine: 'A desert scavenger.', weakness: 'stab', tags: ['beast'] });
mob('crocodile', { name: 'Crocodile', combat: 63, maxHp: 52, maxHit: 8, stats: { attack: 40, strength: 38, defence: 35 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 3, wanderRadius: 3, respawnTicks: 45, examine: 'A massive desert crocodile.', weakness: 'ranged', tags: ['beast', 'armoured'] });
mob('mummy_warrior', { name: 'Mummy warrior', combat: 75, maxHp: 85, maxHit: 10, stats: { attack: 48, strength: 45, defence: 42 }, attackSpeed: 5, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 4, wanderRadius: 2, respawnTicks: 55, examine: 'A mummified warrior still carrying its sword.', weakness: 'crush', tags: ['undead', 'armoured'] },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 4004, name: 'Bone shard', weight: 10, min: 2, max: 5 }, { id: 101, name: 'Coins', weight: 8, min: 40, max: 150 }, { id: 0, name: 'Nothing', weight: 5, min: 0, max: 0 }] });
mob('scarab_mage', { name: 'Scarab mage', combat: 55, maxHp: 48, maxHit: 7, stats: { attack: 30, strength: 20, defence: 25 }, attackSpeed: 5, attackRange: 5, attackStyle: 'magic', aggressive: true, aggroRange: 5, wanderRadius: 3, respawnTicks: 45, examine: 'A scarab that casts ancient spells.', weakness: 'ranged', tags: ['beast'], resistance: 'magic' },
  { always: [], main: [{ id: 4006, name: 'Sand rune', weight: 8, min: 3, max: 8 }, { id: 4007, name: 'Scarab shell', weight: 5, min: 1, max: 1 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
mob('skeletal_wyvern', { name: 'Skeletal wyvern', combat: 140, maxHp: 150, maxHit: 15, stats: { attack: 85, strength: 80, defence: 100 }, attackSpeed: 4, attackRange: 4, attackStyle: 'ranged', size: 2, aggressive: true, aggroRange: 4, wanderRadius: 3, respawnTicks: 65, examine: 'A fossilized wyvern reanimated by dark magic.', weakness: 'magic', tags: ['undead', 'dragon'], resistance: 'melee' },
  { always: [{ id: 12603, name: 'Wyvern bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 6, min: 200, max: 800 }, { id: 2116, name: 'Runite bar', weight: 2, min: 1, max: 1 }, { id: 0, name: 'Nothing', weight: 3, min: 0, max: 0 }] });

// ══════════════════════════════════════════════════════════════════════════════
// MORYSKAH — expanded slayer tower + vampyre city
// ══════════════════════════════════════════════════════════════════════════════

mob('hellhound', { name: 'Hellhound', combat: 122, maxHp: 116, maxHit: 13, stats: { attack: 78, strength: 80, defence: 66 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 5, wanderRadius: 4, respawnTicks: 40, examine: 'A demon dog from the underworld.', weakness: 'slash', tags: ['demon', 'beast'] },
  { always: [], main: [{ id: 100, name: 'Bones', weight: 20, min: 1, max: 1 }, { id: 0, name: 'Nothing', weight: 10, min: 0, max: 0 }], tertiary: [{ id: 33003, name: 'Clue scroll (hard)', chance: 64, min: 1, max: 1 }] });
mob('infernal_mage', { name: 'Infernal mage', combat: 66, maxHp: 60, maxHit: 8, stats: { attack: 38, strength: 30, defence: 35 }, attackSpeed: 5, attackRange: 5, attackStyle: 'magic', aggressive: true, aggroRange: 4, wanderRadius: 3, respawnTicks: 45, examine: 'A mage wreathed in infernal fire.', weakness: 'ranged', tags: ['human'], resistance: 'magic' },
  { always: [], main: [{ id: 11353, name: 'Fire rune', weight: 8, min: 10, max: 30 }, { id: 101, name: 'Coins', weight: 8, min: 30, max: 100 }, { id: 0, name: 'Nothing', weight: 5, min: 0, max: 0 }] });
mob('vampyre_sentinel', { name: 'Vampyre sentinel', combat: 90, maxHp: 100, maxHit: 12, stats: { attack: 60, strength: 55, defence: 50 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 5, wanderRadius: 3, respawnTicks: 65, examine: 'A castle guard. Elite vampyre.', weakness: 'slash', tags: ['vampyre', 'undead'], resistance: 'ranged' },
  { always: [], main: [{ id: 5001, name: 'Vial of blood', weight: 10, min: 2, max: 4 }, { id: 101, name: 'Coins', weight: 6, min: 60, max: 250 }, { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 }] });
mob('death_spawn', { name: 'Death spawn', combat: 60, maxHp: 25, maxHit: 7, stats: { attack: 35, strength: 40, defence: 10 }, attackSpeed: 3, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 6, wanderRadius: 3, respawnTicks: 10, examine: 'A small creature spawned by nechryael.', weakness: 'slash', tags: ['demon'] });
mob('skeleton_hellhound', { name: 'Skeletal hellhound', combat: 97, maxHp: 90, maxHit: 11, stats: { attack: 65, strength: 68, defence: 55 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 5, wanderRadius: 4, respawnTicks: 50, examine: 'An undead hellhound.', weakness: 'crush', tags: ['undead', 'demon'] });

// ══════════════════════════════════════════════════════════════════════════════
// VEILWOOD — deeper forest, underground elven ruins
// ══════════════════════════════════════════════════════════════════════════════

mob('poison_spider', { name: 'Poison spider', combat: 24, maxHp: 22, maxHit: 4, stats: { attack: 12, strength: 14, defence: 10 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 3, wanderRadius: 5, respawnTicks: 25, examine: 'A venomous forest spider.', weakness: 'crush', tags: ['beast'], poisonDamage: 3 });
mob('jungle_horror', { name: 'Jungle horror', combat: 53, maxHp: 55, maxHit: 7, stats: { attack: 32, strength: 35, defence: 25 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 4, wanderRadius: 4, respawnTicks: 40, examine: 'A twisted creature from deep in the forest.', weakness: 'slash', tags: ['beast', 'shadow'] },
  { always: [], main: [{ id: 6008, name: 'Fungal spore', weight: 8, min: 2, max: 5 }, { id: 101, name: 'Coins', weight: 8, min: 20, max: 60 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
mob('elven_guard', { name: 'Elven guard', combat: 70, maxHp: 75, maxHit: 9, stats: { attack: 45, strength: 40, defence: 42 }, attackSpeed: 4, attackRange: 6, attackStyle: 'ranged', aggressive: false, wanderRadius: 3, respawnTicks: 55, examine: 'An elite elven border guard.', weakness: 'magic', tags: ['human'] });
mob('living_vine', { name: 'Living vine', combat: 32, maxHp: 35, maxHit: 5, stats: { attack: 18, strength: 20, defence: 15 }, attackSpeed: 4, attackRange: 2, attackStyle: 'melee', aggressive: true, aggroRange: 2, wanderRadius: 1, respawnTicks: 30, examine: 'A vine that attacks anything that moves.', weakness: 'slash', tags: ['plant'] });
mob('feral_cat', { name: 'Feral cat', combat: 5, maxHp: 6, maxHit: 1, stats: { attack: 3, strength: 2, defence: 2 }, attackSpeed: 3, attackRange: 1, attackStyle: 'melee', aggressive: false, wanderRadius: 6, respawnTicks: 15, examine: 'A wild forest cat.', weakness: 'slash', tags: ['beast'] });
mob('king_scorpion', { name: 'King scorpion', combat: 32, maxHp: 35, maxHit: 5, stats: { attack: 20, strength: 18, defence: 22 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 3, wanderRadius: 4, respawnTicks: 35, examine: 'An oversized scorpion. Very aggressive.', weakness: 'crush', tags: ['beast', 'armoured'], poisonDamage: 3 });

// ══════════════════════════════════════════════════════════════════════════════
// SOOTWORKS — deep mine creatures, automatons
// ══════════════════════════════════════════════════════════════════════════════

mob('mithril_dragon', { name: 'Mithril dragon', combat: 304, maxHp: 254, maxHit: 28, stats: { attack: 190, strength: 180, defence: 230 }, attackSpeed: 5, attackRange: 5, attackStyle: 'magic', size: 3, aggressive: true, aggroRange: 4, wanderRadius: 3, respawnTicks: 120, examine: 'A dragon forged from mithril. The hardest chromatic.', weakness: 'magic', tags: ['dragon', 'armoured'], resistance: 'melee' },
  { always: [{ id: 107, name: 'Dragon bones', min: 1, max: 1 }], main: [{ id: 2114, name: 'Mithril bar', weight: 8, min: 3, max: 10 }, { id: 101, name: 'Coins', weight: 5, min: 400, max: 1500 }, { id: 0, name: 'Nothing', weight: 3, min: 0, max: 0 }] });
mob('chaos_dwarf', { name: 'Chaos dwarf', combat: 48, maxHp: 52, maxHit: 7, stats: { attack: 30, strength: 28, defence: 25 }, attackSpeed: 4, attackRange: 4, attackStyle: 'ranged', aggressive: true, aggroRange: 4, wanderRadius: 3, respawnTicks: 35, examine: 'A dwarf corrupted by dark energy.', weakness: 'magic', tags: ['human'] },
  { always: [], main: [{ id: 7005, name: 'Blast powder', weight: 5, min: 1, max: 2 }, { id: 101, name: 'Coins', weight: 8, min: 20, max: 80 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
mob('magma_serpent', { name: 'Magma serpent', combat: 70, maxHp: 80, maxHit: 10, stats: { attack: 45, strength: 50, defence: 35 }, attackSpeed: 4, attackRange: 2, attackStyle: 'melee', aggressive: true, aggroRange: 3, wanderRadius: 4, respawnTicks: 50, examine: 'A snake made of living lava.', weakness: 'ranged', tags: ['elemental'], resistance: 'melee' });
mob('furnace_golem', { name: 'Furnace golem', combat: 85, maxHp: 120, maxHit: 12, stats: { attack: 50, strength: 55, defence: 65 }, attackSpeed: 6, attackRange: 1, attackStyle: 'melee', size: 2, aggressive: false, aggroRange: 2, wanderRadius: 1, respawnTicks: 80, examine: 'A golem built into a furnace. Extremely hot.', weakness: 'magic', tags: ['construct', 'elemental'], resistance: 'melee' });

// ══════════════════════════════════════════════════════════════════════════════
// SALTBRINE — underwater caves, pirate hideouts
// ══════════════════════════════════════════════════════════════════════════════

mob('mogre_chief', { name: 'Mogre chief', combat: 58, maxHp: 65, maxHit: 8, stats: { attack: 38, strength: 40, defence: 30 }, attackSpeed: 5, attackRange: 1, attackStyle: 'melee', size: 2, aggressive: true, aggroRange: 4, wanderRadius: 3, respawnTicks: 50, examine: 'The biggest mogre.', weakness: 'ranged', tags: ['beast'] },
  { always: [{ id: 106, name: 'Big bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 8, min: 50, max: 200 }, { id: 0, name: 'Nothing', weight: 5, min: 0, max: 0 }] });
mob('pirate_berserker', { name: 'Pirate berserker', combat: 60, maxHp: 68, maxHit: 9, stats: { attack: 40, strength: 42, defence: 25 }, attackSpeed: 3, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 5, wanderRadius: 4, respawnTicks: 50, examine: 'A pirate driven to frenzy.', weakness: 'stab', tags: ['human'] });
mob('coral_golem', { name: 'Coral golem', combat: 55, maxHp: 70, maxHit: 7, stats: { attack: 30, strength: 28, defence: 40 }, attackSpeed: 5, attackRange: 1, attackStyle: 'melee', size: 2, aggressive: false, wanderRadius: 2, respawnTicks: 60, examine: 'A golem of living coral.', weakness: 'crush', tags: ['construct', 'armoured'], resistance: 'ranged' },
  { always: [], main: [{ id: 8006, name: 'Coral fragment', weight: 10, min: 2, max: 5 }, { id: 101, name: 'Coins', weight: 8, min: 20, max: 80 }] });
mob('giant_oyster', { name: 'Giant oyster', combat: 20, maxHp: 30, maxHit: 3, stats: { attack: 5, strength: 8, defence: 30 }, attackSpeed: 5, attackRange: 1, attackStyle: 'melee', aggressive: false, wanderRadius: 0, respawnTicks: 50, examine: 'A massive oyster. Might contain a pearl.', weakness: 'crush', tags: ['armoured'] },
  { always: [], main: [{ id: 8001, name: 'Saltbrine pearl', weight: 3, min: 1, max: 1 }, { id: 0, name: 'Nothing', weight: 10, min: 0, max: 0 }] });
mob('kraken_spawn', { name: 'Kraken spawn', combat: 35, maxHp: 30, maxHit: 5, stats: { attack: 20, strength: 22, defence: 15 }, attackSpeed: 4, attackRange: 3, attackStyle: 'magic', aggressive: true, aggroRange: 5, wanderRadius: 3, respawnTicks: 25, examine: 'A small tentacle from the kraken.', weakness: 'slash', tags: ['beast'] });

// ══════════════════════════════════════════════════════════════════════════════
// GLASS DESERT — crystal creatures, golems, wisps
// ══════════════════════════════════════════════════════════════════════════════

mob('crystal_spider_queen', { name: 'Crystal spider queen', combat: 95, maxHp: 110, maxHit: 13, stats: { attack: 60, strength: 55, defence: 50 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', size: 2, aggressive: true, aggroRange: 5, wanderRadius: 3, respawnTicks: 70, examine: 'The matriarch of the glass spiders.', weakness: 'crush', tags: ['beast', 'armoured', 'boss'] },
  { always: [], main: [{ id: 10001, name: 'Crystal shard', weight: 10, min: 5, max: 15 }, { id: 101, name: 'Coins', weight: 5, min: 100, max: 400 }] });
mob('glass_imp', { name: 'Glass imp', combat: 25, maxHp: 18, maxHit: 4, stats: { attack: 15, strength: 12, defence: 10 }, attackSpeed: 3, attackRange: 4, attackStyle: 'magic', aggressive: true, aggroRange: 4, wanderRadius: 6, respawnTicks: 25, examine: 'A tiny imp made of glass. Shatters easily.', weakness: 'ranged', tags: ['demon'] });
mob('prism_guardian', { name: 'Prism guardian', combat: 110, maxHp: 130, maxHit: 15, stats: { attack: 70, strength: 65, defence: 75 }, attackSpeed: 5, attackRange: 6, attackStyle: 'magic', size: 2, aggressive: false, wanderRadius: 2, respawnTicks: 80, examine: 'An ancient guardian that bends light.', weakness: 'crush', tags: ['construct', 'elemental'], resistance: 'ranged' },
  { always: [], main: [{ id: 10002, name: 'Prism lens', weight: 3, min: 1, max: 1 }, { id: 10004, name: 'Refracted essence', weight: 5, min: 1, max: 2 }, { id: 101, name: 'Coins', weight: 5, min: 100, max: 500 }] });
mob('crystal_wolf', { name: 'Crystal wolf', combat: 60, maxHp: 55, maxHit: 8, stats: { attack: 40, strength: 38, defence: 25 }, attackSpeed: 3, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 5, wanderRadius: 6, respawnTicks: 40, examine: 'A wolf with crystalline fur. Eerily beautiful.', weakness: 'magic', tags: ['beast'] });

// ══════════════════════════════════════════════════════════════════════════════
// INKWEALD — deep dream creatures
// ══════════════════════════════════════════════════════════════════════════════

mob('dream_imp', { name: 'Dream imp', combat: 30, maxHp: 22, maxHit: 5, stats: { attack: 18, strength: 15, defence: 12 }, attackSpeed: 3, attackRange: 4, attackStyle: 'magic', aggressive: true, aggroRange: 5, wanderRadius: 6, respawnTicks: 25, examine: 'A small demon from the dream world.', weakness: 'ranged', tags: ['demon', 'spirit'] });
mob('phantasm', { name: 'Phantasm', combat: 75, maxHp: 70, maxHit: 10, stats: { attack: 48, strength: 42, defence: 40 }, attackSpeed: 4, attackRange: 5, attackStyle: 'magic', aggressive: true, aggroRange: 5, wanderRadius: 4, respawnTicks: 50, examine: 'A manifestation of fear.', weakness: 'stab', tags: ['spirit', 'shadow'], resistance: 'magic' },
  { always: [], main: [{ id: 9004, name: 'Nightmare shard', weight: 3, min: 1, max: 1 }, { id: 9001, name: 'Inkblot fragment', weight: 8, min: 2, max: 4 }, { id: 0, name: 'Nothing', weight: 5, min: 0, max: 0 }] });
mob('memory_devourer', { name: 'Memory devourer', combat: 90, maxHp: 95, maxHit: 12, stats: { attack: 58, strength: 52, defence: 48 }, attackSpeed: 4, attackRange: 3, attackStyle: 'magic', size: 2, aggressive: true, aggroRange: 6, wanderRadius: 4, respawnTicks: 60, examine: 'A creature that feeds on memories. Reduces your stats on hit.', weakness: 'ranged', tags: ['spirit', 'shadow'], resistance: 'melee' },
  { always: [], main: [{ id: 9002, name: 'Lucid essence', weight: 3, min: 1, max: 1 }, { id: 9003, name: 'Dream thread', weight: 5, min: 1, max: 2 }, { id: 101, name: 'Coins', weight: 5, min: 80, max: 300 }] });
mob('choir_attendant', { name: 'Choir attendant', combat: 110, maxHp: 100, maxHit: 14, stats: { attack: 72, strength: 65, defence: 60 }, attackSpeed: 4, attackRange: 4, attackStyle: 'magic', aggressive: true, aggroRange: 5, wanderRadius: 3, respawnTicks: 55, examine: 'A servant of the Hollow Choir. Sings a note that damages you.', weakness: 'crush', tags: ['spirit'] });

// ══════════════════════════════════════════════════════════════════════════════
// THE WILDS — expanded wilderness creatures
// ══════════════════════════════════════════════════════════════════════════════

mob('chaos_warrior', { name: 'Chaos warrior', combat: 50, maxHp: 55, maxHit: 7, stats: { attack: 32, strength: 30, defence: 28 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 4, wanderRadius: 4, respawnTicks: 40, examine: 'A warrior devoted to chaos.', weakness: 'stab', tags: ['human'] });
mob('lava_spider', { name: 'Lava spider', combat: 30, maxHp: 28, maxHit: 5, stats: { attack: 18, strength: 20, defence: 15 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 3, wanderRadius: 4, respawnTicks: 30, examine: 'A spider that thrives near lava.', weakness: 'crush', tags: ['beast'], poisonDamage: 2 });
mob('hellrat', { name: 'Hellrat', combat: 20, maxHp: 18, maxHit: 3, stats: { attack: 12, strength: 10, defence: 8 }, attackSpeed: 3, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 3, wanderRadius: 5, respawnTicks: 20, examine: 'A demonic rat.', weakness: 'slash', tags: ['demon'] });
mob('greater_demon_wild', { name: 'Greater demon', combat: 104, maxHp: 95, maxHit: 12, stats: { attack: 85, strength: 88, defence: 78 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 5, wanderRadius: 3, respawnTicks: 50, examine: 'A greater demon in the wilderness.', weakness: 'ranged', tags: ['demon'], resistance: 'magic' },
  { always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 80, max: 300 }, { id: 11357, name: 'Death rune', weight: 4, min: 5, max: 15 }, { id: 0, name: 'Nothing', weight: 5, min: 0, max: 0 }] });
mob('elder_chaos_druid', { name: 'Elder chaos druid', combat: 70, maxHp: 72, maxHit: 10, stats: { attack: 42, strength: 35, defence: 38 }, attackSpeed: 5, attackRange: 5, attackStyle: 'magic', aggressive: true, aggroRange: 5, wanderRadius: 4, respawnTicks: 50, examine: 'A powerful chaos druid. Drops good herbs.', weakness: 'ranged', tags: ['human'], resistance: 'magic' },
  { always: [], main: [{ id: 12005, name: 'Grimy ranarr', weight: 5, min: 1, max: 2 }, { id: 12009, name: 'Grimy snapdragon', weight: 2, min: 1, max: 1 }, { id: 12013, name: 'Grimy torstol', weight: 1, min: 1, max: 1 }, { id: 101, name: 'Coins', weight: 6, min: 40, max: 150 }, { id: 0, name: 'Nothing', weight: 3, min: 0, max: 0 }] });
mob('ent_wild', { name: 'Ent', combat: 101, maxHp: 120, maxHit: 11, stats: { attack: 65, strength: 60, defence: 70 }, attackSpeed: 6, attackRange: 1, attackStyle: 'melee', size: 2, aggressive: true, aggroRange: 4, wanderRadius: 3, respawnTicks: 60, examine: 'A massive tree creature in the wilderness.', weakness: 'slash', tags: ['plant'], resistance: 'ranged' },
  { always: [{ id: 2205, name: 'Yew logs', min: 2, max: 5 }], main: [{ id: 2206, name: 'Magic logs', weight: 3, min: 1, max: 3 }, { id: 0, name: 'Nothing', weight: 5, min: 0, max: 0 }] });
mob('chaos_fanatic', { name: 'Chaos Fanatic', combat: 202, maxHp: 225, maxHit: 20, stats: { attack: 130, strength: 120, defence: 110 }, attackSpeed: 4, attackRange: 6, attackStyle: 'magic', aggressive: true, aggroRange: 6, wanderRadius: 4, respawnTicks: 120, examine: 'A wildly unpredictable wilderness boss. Fires explosive orbs.', weakness: 'ranged', tags: ['human', 'boss'], resistance: 'magic' },
  { always: [], main: [{ id: 101, name: 'Coins', weight: 5, min: 2000, max: 8000 }, { id: 11358, name: 'Blood rune', weight: 3, min: 10, max: 30 }, { id: 0, name: 'Nothing', weight: 3, min: 0, max: 0 }] });
mob('scorpia', { name: 'Scorpia', combat: 225, maxHp: 200, maxHit: 22, stats: { attack: 140, strength: 135, defence: 130 }, attackSpeed: 4, attackRange: 3, attackStyle: 'magic', size: 3, aggressive: true, aggroRange: 5, wanderRadius: 0, respawnTicks: 150, examine: 'A massive scorpion queen in the wilderness.', weakness: 'crush', tags: ['beast', 'armoured', 'boss'], poisonDamage: 5 },
  { always: [], main: [{ id: 101, name: 'Coins', weight: 5, min: 3000, max: 10000 }, { id: 22007, name: 'Imbued heart', weight: 1, min: 1, max: 1 }, { id: 0, name: 'Nothing', weight: 3, min: 0, max: 0 }] });

console.log('[aelgard] Monster blitz loaded');
