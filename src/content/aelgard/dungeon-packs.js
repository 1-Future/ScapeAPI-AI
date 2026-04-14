// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Dungeon Packs
// Each region gets a proper multi-level dungeon with 10-20 monster types.
// Dungeons are the bread and butter of slayer and combat training.
// They're where you spend hundreds of hours killing monsters for drops and XP.
// ══════════════════════════════════════════════════════════════════════════════

const npcs = require('../../world/npcs');
const droptables = require('../../data/droptables');
const items = require('../../data/items');

function mob(defId, def, drops) {
  npcs.defineNpc(defId, def);
  if (drops) droptables.define(defId, drops);
}

// ══════════════════════════════════════════════════════════════════════════════
// HEARTLANDS STRONGHOLD OF SECURITY — 4-level dungeon
// Each level tests a different combat aspect. Reward: cosmetic boots.
// ══════════════════════════════════════════════════════════════════════════════

mob('animated_bronze', { name: 'Animated bronze armour', combat: 18, maxHp: 20, maxHit: 3, stats: { attack: 10, strength: 8, defence: 12 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 3, wanderRadius: 3, respawnTicks: 25, examine: 'Bronze armour brought to life.', weakness: 'crush', tags: ['construct', 'armoured'] });
mob('animated_iron', { name: 'Animated iron armour', combat: 28, maxHp: 32, maxHit: 5, stats: { attack: 16, strength: 14, defence: 18 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 3, wanderRadius: 3, respawnTicks: 30, examine: 'Iron armour brought to life.', weakness: 'crush', tags: ['construct', 'armoured'] });
mob('animated_steel', { name: 'Animated steel armour', combat: 38, maxHp: 42, maxHit: 6, stats: { attack: 24, strength: 22, defence: 28 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 3, wanderRadius: 3, respawnTicks: 35, examine: 'Steel armour animated by dark magic.', weakness: 'crush', tags: ['construct', 'armoured'] });
mob('animated_mithril', { name: 'Animated mithril armour', combat: 55, maxHp: 58, maxHit: 7, stats: { attack: 35, strength: 32, defence: 38 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 3, wanderRadius: 3, respawnTicks: 40, examine: 'Mithril armour, alive and angry.', weakness: 'crush', tags: ['construct', 'armoured'] });
mob('animated_adamant', { name: 'Animated adamant armour', combat: 68, maxHp: 72, maxHit: 9, stats: { attack: 42, strength: 40, defence: 48 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 3, wanderRadius: 3, respawnTicks: 45, examine: 'Adamant armour stalks the halls.', weakness: 'crush', tags: ['construct', 'armoured'] });
mob('animated_rune', { name: 'Animated rune armour', combat: 83, maxHp: 88, maxHit: 11, stats: { attack: 55, strength: 52, defence: 60 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 3, wanderRadius: 3, respawnTicks: 50, examine: 'Rune armour, the strongest animated set.', weakness: 'crush', tags: ['construct', 'armoured'] },
  { always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 50, max: 200 }, { id: 1502, name: 'Rune scimitar', weight: 1, min: 1, max: 1 }, { id: 0, name: 'Nothing', weight: 5, min: 0, max: 0 }] });
mob('flesh_crawler', { name: 'Flesh crawler', combat: 44, maxHp: 40, maxHit: 6, stats: { attack: 28, strength: 25, defence: 20 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 4, wanderRadius: 3, respawnTicks: 30, examine: 'A disgusting crawling creature.', weakness: 'slash', tags: ['beast'] },
  { always: [], main: [{ id: 12001, name: 'Grimy guam', weight: 5, min: 1, max: 1 }, { id: 12005, name: 'Grimy ranarr', weight: 1, min: 1, max: 1 }, { id: 101, name: 'Coins', weight: 8, min: 10, max: 50 }, { id: 0, name: 'Nothing', weight: 5, min: 0, max: 0 }] });
mob('catablepon', { name: 'Catablepon', combat: 49, maxHp: 48, maxHit: 7, stats: { attack: 30, strength: 28, defence: 22 }, attackSpeed: 4, attackRange: 4, attackStyle: 'magic', aggressive: true, aggroRange: 4, wanderRadius: 3, respawnTicks: 35, examine: 'A bull-like creature with magical abilities.', weakness: 'ranged', tags: ['beast'], resistance: 'magic' },
  { always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 15, max: 60 }, { id: 11356, name: 'Chaos rune', weight: 3, min: 3, max: 8 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

// ══════════════════════════════════════════════════════════════════════════════
// MORYSKAH CATACOMBS EXPANSION — deeper levels
// ══════════════════════════════════════════════════════════════════════════════

mob('brutal_hellhound', { name: 'Brutal hellhound', combat: 142, maxHp: 135, maxHit: 15, stats: { attack: 90, strength: 92, defence: 75 }, attackSpeed: 3, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 6, wanderRadius: 4, respawnTicks: 45, examine: 'A bigger, meaner hellhound.', weakness: 'slash', tags: ['demon', 'beast'] },
  { always: [], main: [{ id: 100, name: 'Bones', weight: 15, min: 1, max: 1 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }], tertiary: [{ id: 33003, name: 'Clue scroll (hard)', chance: 32, min: 1, max: 1 }] });
mob('deviant_spectre', { name: 'Deviant spectre', combat: 169, maxHp: 155, maxHit: 17, stats: { attack: 105, strength: 95, defence: 90 }, attackSpeed: 4, attackRange: 5, attackStyle: 'magic', aggressive: true, aggroRange: 5, wanderRadius: 3, respawnTicks: 50, examine: 'A warped spectre from the deepest catacombs.', weakness: 'ranged', tags: ['undead', 'spirit'], resistance: 'melee' },
  { always: [], main: [{ id: 5004, name: 'Ectoplasm', weight: 5, min: 2, max: 4 }, { id: 12009, name: 'Grimy snapdragon', weight: 2, min: 1, max: 1 }, { id: 101, name: 'Coins', weight: 6, min: 80, max: 300 }, { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 }] });
mob('warped_terrorbird', { name: 'Warped terrorbird', combat: 62, maxHp: 55, maxHit: 8, stats: { attack: 38, strength: 40, defence: 25 }, attackSpeed: 3, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 5, wanderRadius: 5, respawnTicks: 35, examine: 'A terrorbird corrupted by the catacombs.', weakness: 'stab', tags: ['beast'] });
mob('catacomb_dragon', { name: 'Catacomb dragon', combat: 155, maxHp: 145, maxHit: 16, stats: { attack: 95, strength: 90, defence: 100 }, attackSpeed: 5, attackRange: 4, attackStyle: 'magic', size: 2, aggressive: true, aggroRange: 5, wanderRadius: 2, respawnTicks: 70, examine: 'A dragon nesting in the catacombs.', weakness: 'stab', tags: ['dragon'], resistance: 'magic' },
  { always: [{ id: 107, name: 'Dragon bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 5, min: 200, max: 600 }, { id: 0, name: 'Nothing', weight: 3, min: 0, max: 0 }] });

// ══════════════════════════════════════════════════════════════════════════════
// BONEYARD TOMB COMPLEX — multi-room tomb dungeon
// ══════════════════════════════════════════════════════════════════════════════

mob('tomb_warrior', { name: 'Tomb warrior', combat: 62, maxHp: 65, maxHit: 8, stats: { attack: 40, strength: 38, defence: 35 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 4, wanderRadius: 2, respawnTicks: 45, examine: 'An ancient warrior preserved in the tombs.', weakness: 'crush', tags: ['undead', 'armoured'] },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 4004, name: 'Bone shard', weight: 8, min: 2, max: 4 }, { id: 101, name: 'Coins', weight: 8, min: 30, max: 100 }, { id: 0, name: 'Nothing', weight: 5, min: 0, max: 0 }] });
mob('tomb_priestess', { name: 'Tomb priestess', combat: 72, maxHp: 58, maxHit: 9, stats: { attack: 45, strength: 30, defence: 40 }, attackSpeed: 5, attackRange: 6, attackStyle: 'magic', aggressive: true, aggroRange: 5, wanderRadius: 2, respawnTicks: 50, examine: 'An ancient priestess still channeling dark magic.', weakness: 'ranged', tags: ['undead', 'human'], resistance: 'magic' },
  { always: [], main: [{ id: 4006, name: 'Sand rune', weight: 8, min: 5, max: 15 }, { id: 101, name: 'Coins', weight: 6, min: 40, max: 150 }, { id: 0, name: 'Nothing', weight: 5, min: 0, max: 0 }] });
mob('sand_guardian', { name: 'Sand guardian', combat: 80, maxHp: 100, maxHit: 10, stats: { attack: 50, strength: 45, defence: 60 }, attackSpeed: 5, attackRange: 1, attackStyle: 'melee', size: 2, aggressive: true, aggroRange: 3, wanderRadius: 1, respawnTicks: 60, examine: 'A construct of compressed sand. Guards the inner tombs.', weakness: 'magic', tags: ['construct', 'elemental'], resistance: 'melee' },
  { always: [], main: [{ id: 4003, name: 'Glass sand', weight: 8, min: 5, max: 12 }, { id: 101, name: 'Coins', weight: 6, min: 50, max: 200 }, { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 }] });
mob('scarab_lord', { name: 'Scarab lord', combat: 95, maxHp: 120, maxHit: 12, stats: { attack: 60, strength: 55, defence: 65 }, attackSpeed: 4, attackRange: 3, attackStyle: 'magic', size: 2, aggressive: true, aggroRange: 5, wanderRadius: 2, respawnTicks: 70, examine: 'A massive intelligent scarab. Commands the swarm.', weakness: 'crush', tags: ['beast', 'armoured'] },
  { always: [], main: [{ id: 4007, name: 'Scarab shell', weight: 10, min: 2, max: 5 }, { id: 101, name: 'Coins', weight: 5, min: 80, max: 300 }, { id: 0, name: 'Nothing', weight: 3, min: 0, max: 0 }] });

// ══════════════════════════════════════════════════════════════════════════════
// VEILWOOD UNDERGROUND ELVEN RUINS — ancient dungeon
// ══════════════════════════════════════════════════════════════════════════════

mob('elven_shade', { name: 'Elven shade', combat: 50, maxHp: 42, maxHit: 6, stats: { attack: 30, strength: 25, defence: 22 }, attackSpeed: 4, attackRange: 4, attackStyle: 'magic', aggressive: false, aggroRange: 3, wanderRadius: 3, respawnTicks: 35, examine: 'The ghost of an ancient elf.', weakness: 'magic', tags: ['undead', 'spirit', 'human'], resistance: 'melee' });
mob('crystal_warrior', { name: 'Crystal warrior', combat: 70, maxHp: 75, maxHit: 9, stats: { attack: 45, strength: 42, defence: 40 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 4, wanderRadius: 3, respawnTicks: 45, examine: 'An elven warrior preserved in crystal.', weakness: 'crush', tags: ['construct', 'armoured'] },
  { always: [], main: [{ id: 10001, name: 'Crystal shard', weight: 8, min: 2, max: 5 }, { id: 101, name: 'Coins', weight: 6, min: 30, max: 100 }, { id: 0, name: 'Nothing', weight: 5, min: 0, max: 0 }] });
mob('moss_titan', { name: 'Moss titan', combat: 88, maxHp: 110, maxHit: 11, stats: { attack: 55, strength: 58, defence: 50 }, attackSpeed: 6, attackRange: 1, attackStyle: 'melee', size: 3, aggressive: true, aggroRange: 5, wanderRadius: 2, respawnTicks: 70, examine: 'A titan of living moss. Enormous.', weakness: 'slash', tags: ['plant'], resistance: 'ranged' },
  { always: [{ id: 2206, name: 'Magic logs', min: 3, max: 6 }], main: [{ id: 6004, name: 'Spirit seed', weight: 2, min: 1, max: 1 }, { id: 6002, name: 'Veilwood bark', weight: 5, min: 3, max: 8 }] });

// ══════════════════════════════════════════════════════════════════════════════
// SOOTWORKS ABANDONED FACTORY — clockwork dungeon
// ══════════════════════════════════════════════════════════════════════════════

mob('overloaded_sentry', { name: 'Overloaded sentry', combat: 75, maxHp: 80, maxHit: 10, stats: { attack: 48, strength: 42, defence: 55 }, attackSpeed: 3, attackRange: 5, attackStyle: 'ranged', aggressive: true, aggroRange: 6, wanderRadius: 2, respawnTicks: 45, examine: 'A sentry on overdrive. Fires rapidly.', weakness: 'crush', tags: ['construct', 'armoured'], resistance: 'magic' },
  { always: [], main: [{ id: 7003, name: 'Clockwork gear', weight: 10, min: 2, max: 5 }, { id: 101, name: 'Coins', weight: 6, min: 30, max: 100 }, { id: 0, name: 'Nothing', weight: 5, min: 0, max: 0 }] });
mob('factory_foreman', { name: 'Factory foreman', combat: 65, maxHp: 70, maxHit: 8, stats: { attack: 40, strength: 38, defence: 32 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 4, wanderRadius: 3, respawnTicks: 50, examine: 'A dwarven foreman gone mad. Wields a wrench.', weakness: 'stab', tags: ['human'] },
  { always: [], main: [{ id: 7004, name: 'Steam valve', weight: 8, min: 1, max: 3 }, { id: 7005, name: 'Blast powder', weight: 3, min: 1, max: 2 }, { id: 101, name: 'Coins', weight: 6, min: 20, max: 80 }] });
mob('prototype_golem', { name: 'Prototype golem', combat: 95, maxHp: 130, maxHit: 13, stats: { attack: 60, strength: 65, defence: 70 }, attackSpeed: 5, attackRange: 1, attackStyle: 'melee', size: 2, aggressive: false, aggroRange: 3, wanderRadius: 1, respawnTicks: 80, examine: 'An experimental golem. Unstable.', weakness: 'magic', tags: ['construct', 'elemental'], resistance: 'melee' },
  { always: [], main: [{ id: 7003, name: 'Clockwork gear', weight: 10, min: 5, max: 10 }, { id: 7002, name: 'Soot-iron bar', weight: 5, min: 2, max: 4 }, { id: 101, name: 'Coins', weight: 5, min: 50, max: 200 }] });

// ══════════════════════════════════════════════════════════════════════════════
// SALTBRINE UNDERWATER CAVES — submerged dungeon
// ══════════════════════════════════════════════════════════════════════════════

mob('deep_sea_jelly', { name: 'Deep sea jelly', combat: 45, maxHp: 40, maxHit: 6, stats: { attack: 25, strength: 28, defence: 18 }, attackSpeed: 4, attackRange: 2, attackStyle: 'magic', aggressive: true, aggroRange: 4, wanderRadius: 5, respawnTicks: 30, examine: 'A jellyfish from the deep.', weakness: 'slash', tags: ['beast'], poisonDamage: 4, resistance: 'magic' });
mob('sea_guardian', { name: 'Sea guardian', combat: 82, maxHp: 95, maxHit: 10, stats: { attack: 52, strength: 48, defence: 55 }, attackSpeed: 5, attackRange: 1, attackStyle: 'melee', size: 2, aggressive: true, aggroRange: 3, wanderRadius: 2, respawnTicks: 55, examine: 'A stone guardian covered in barnacles.', weakness: 'crush', tags: ['construct', 'armoured'] },
  { always: [], main: [{ id: 8006, name: 'Coral fragment', weight: 8, min: 2, max: 5 }, { id: 8001, name: 'Saltbrine pearl', weight: 2, min: 1, max: 1 }, { id: 101, name: 'Coins', weight: 5, min: 40, max: 150 }] });
mob('abyssal_leech', { name: 'Abyssal leech', combat: 38, maxHp: 30, maxHit: 5, stats: { attack: 22, strength: 25, defence: 12 }, attackSpeed: 3, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 4, wanderRadius: 5, respawnTicks: 25, examine: 'A leech from the abyss. Drains your stats on hit.', weakness: 'slash', tags: ['beast'] });
mob('sunken_warrior', { name: 'Sunken warrior', combat: 68, maxHp: 65, maxHit: 8, stats: { attack: 42, strength: 40, defence: 35 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 4, wanderRadius: 3, respawnTicks: 45, examine: 'A drowned warrior, still fighting.', weakness: 'crush', tags: ['undead', 'human'] },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 8, min: 30, max: 100 }, { id: 0, name: 'Nothing', weight: 5, min: 0, max: 0 }] });

// ══════════════════════════════════════════════════════════════════════════════
// GLASS DESERT CRYSTAL CAVERNS EXPANSION
// ══════════════════════════════════════════════════════════════════════════════

mob('crystal_shade', { name: 'Crystal shade', combat: 55, maxHp: 45, maxHit: 7, stats: { attack: 32, strength: 28, defence: 25 }, attackSpeed: 4, attackRange: 4, attackStyle: 'magic', aggressive: true, aggroRange: 4, wanderRadius: 4, respawnTicks: 35, examine: 'A shade trapped in crystal.', weakness: 'ranged', tags: ['undead', 'spirit'] });
mob('prism_sentinel', { name: 'Prism sentinel', combat: 100, maxHp: 120, maxHit: 13, stats: { attack: 65, strength: 60, defence: 70 }, attackSpeed: 5, attackRange: 5, attackStyle: 'magic', size: 2, aggressive: true, aggroRange: 5, wanderRadius: 2, respawnTicks: 65, examine: 'A massive crystal construct. Refracts all ranged attacks.', weakness: 'crush', tags: ['construct', 'elemental'], resistance: 'ranged' },
  { always: [], main: [{ id: 10001, name: 'Crystal shard', weight: 8, min: 5, max: 12 }, { id: 10002, name: 'Prism lens', weight: 2, min: 1, max: 1 }, { id: 101, name: 'Coins', weight: 5, min: 80, max: 300 }] });
mob('crystal_wyrm_juvenile', { name: 'Crystal wyrm juvenile', combat: 78, maxHp: 85, maxHit: 10, stats: { attack: 50, strength: 48, defence: 42 }, attackSpeed: 4, attackRange: 3, attackStyle: 'magic', aggressive: true, aggroRange: 5, wanderRadius: 4, respawnTicks: 50, examine: 'A young crystal wyrm. Still dangerous.', weakness: 'stab', tags: ['dragon'] },
  { always: [], main: [{ id: 10001, name: 'Crystal shard', weight: 10, min: 3, max: 8 }, { id: 101, name: 'Coins', weight: 6, min: 40, max: 150 }, { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 }] });

// ══════════════════════════════════════════════════════════════════════════════
// INKWEALD DEEP DREAM CREATURES
// ══════════════════════════════════════════════════════════════════════════════

mob('terror', { name: 'Terror', combat: 65, maxHp: 55, maxHit: 8, stats: { attack: 40, strength: 35, defence: 30 }, attackSpeed: 4, attackRange: 4, attackStyle: 'magic', aggressive: true, aggroRange: 5, wanderRadius: 5, respawnTicks: 40, examine: 'A manifestation of pure fear. Makes you flee.', weakness: 'stab', tags: ['spirit', 'shadow'], resistance: 'magic' });
mob('dream_sentinel', { name: 'Dream sentinel', combat: 90, maxHp: 100, maxHit: 12, stats: { attack: 58, strength: 52, defence: 55 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', size: 2, aggressive: true, aggroRange: 4, wanderRadius: 2, respawnTicks: 60, examine: 'A guardian of the deep dream. Will not let you pass.', weakness: 'ranged', tags: ['construct', 'spirit'] },
  { always: [], main: [{ id: 9002, name: 'Lucid essence', weight: 5, min: 1, max: 2 }, { id: 9004, name: 'Nightmare shard', weight: 2, min: 1, max: 1 }, { id: 101, name: 'Coins', weight: 5, min: 60, max: 200 }] });
mob('subconscious_beast', { name: 'Subconscious beast', combat: 110, maxHp: 130, maxHit: 14, stats: { attack: 70, strength: 68, defence: 55 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', size: 2, aggressive: true, aggroRange: 5, wanderRadius: 3, respawnTicks: 60, examine: 'A beast from the deepest subconscious. Hits hard.', weakness: 'magic', tags: ['beast', 'spirit', 'shadow'], resistance: 'melee' },
  { always: [], main: [{ id: 9004, name: 'Nightmare shard', weight: 5, min: 1, max: 2 }, { id: 9001, name: 'Inkblot fragment', weight: 8, min: 3, max: 6 }, { id: 101, name: 'Coins', weight: 4, min: 100, max: 400 }] });

// ══════════════════════════════════════════════════════════════════════════════
// WILDS DUNGEON — Revenant Caves Expansion
// ══════════════════════════════════════════════════════════════════════════════

mob('revenant_cyclops', { name: 'Revenant cyclops', combat: 142, maxHp: 160, maxHit: 18, stats: { attack: 92, strength: 90, defence: 100 }, attackSpeed: 3, attackRange: 5, attackStyle: 'magic', aggressive: true, aggroRange: 8, wanderRadius: 6, respawnTicks: 160, examine: 'A ghostly one-eyed giant. Very dangerous.', weakness: 'magic', tags: ['undead', 'spirit'], resistance: 'melee' },
  { always: [], main: [{ id: 101, name: 'Coins', weight: 6, min: 800, max: 4000 }, { id: 12504, name: 'Uncut diamond', weight: 2, min: 1, max: 2 }, { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 }] });
mob('revenant_dark_beast', { name: 'Revenant dark beast', combat: 155, maxHp: 180, maxHit: 20, stats: { attack: 100, strength: 95, defence: 110 }, attackSpeed: 3, attackRange: 5, attackStyle: 'magic', size: 2, aggressive: true, aggroRange: 8, wanderRadius: 5, respawnTicks: 180, examine: 'A ghostly dark beast. Extremely dangerous.', weakness: 'magic', tags: ['undead', 'spirit', 'beast'], resistance: 'melee' },
  { always: [], main: [{ id: 101, name: 'Coins', weight: 5, min: 1500, max: 6000 }, { id: 12505, name: 'Uncut dragonstone', weight: 2, min: 1, max: 1 }, { id: 0, name: 'Nothing', weight: 3, min: 0, max: 0 }] });
mob('chaos_golem', { name: 'Chaos golem', combat: 100, maxHp: 120, maxHit: 13, stats: { attack: 65, strength: 60, defence: 70 }, attackSpeed: 5, attackRange: 1, attackStyle: 'melee', size: 2, aggressive: true, aggroRange: 4, wanderRadius: 3, respawnTicks: 70, examine: 'A golem of chaos energy. Unpredictable.', weakness: 'magic', tags: ['construct', 'elemental'] });

const totalNew = 35; // approximate
console.log(`[aelgard] Dungeon packs: ~${totalNew} dungeon monsters across 7 region dungeons`);
