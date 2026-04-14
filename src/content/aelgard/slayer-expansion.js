// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Slayer Expansion
// 30+ new slayer creatures across all level brackets, 10 superior variants,
// endgame slayer master, and unique items.
// ══════════════════════════════════════════════════════════════════════════════

const npcs = require('../../world/npcs');
const droptables = require('../../data/droptables');
const items = require('../../data/items');
const slayer = require('../../data/slayer');

function mob(defId, def, drops) {
  npcs.defineNpc(defId, def);
  if (drops) droptables.define(defId, drops);
}

// ══════════════════════════════════════════════════════════════════════════════
// NEW ITEMS — unique slayer drops + superior-only rewards
// ══════════════════════════════════════════════════════════════════════════════

// Superior-only drops
items.define({ id: 31100, name: 'Dust battlestaff', examine: 'A battlestaff imbued with earth and air. Provides unlimited dust runes.', value: 350000, category: 'weapon', equipSlot: 'weapon', speed: 5, stats: { magic: 10, melee_strength: 38, magic_damage: 10 }, equipReqs: { attack: 30, magic: 30 } });
items.define({ id: 31101, name: 'Mist battlestaff', examine: 'A battlestaff imbued with water and air. Provides unlimited mist runes.', value: 380000, category: 'weapon', equipSlot: 'weapon', speed: 5, stats: { magic: 12, melee_strength: 38, magic_damage: 12 }, equipReqs: { attack: 30, magic: 30 } });
items.define({ id: 31102, name: 'Eternal gem', examine: 'Used to craft an eternal slayer ring with unlimited teleport charges.', value: 500000, category: 'crafting', weight: 0.1 });

// Creature unique drops
items.define({ id: 31110, name: 'Crawler fang', examine: 'A venomous fang from a cave crawler. Used in herblore.', value: 800, category: 'crafting', weight: 0.1 });
items.define({ id: 31111, name: 'Twisted banshee vocal cord', examine: 'A shrivelled vocal cord. Hums with residual magic.', value: 2500, category: 'crafting', weight: 0.1 });
items.define({ id: 31112, name: 'Wallbeast hide', examine: 'Thick hide ripped from a wall beast. Highly resilient.', value: 3000, category: 'crafting', weight: 1.0 });
items.define({ id: 31113, name: 'Pyrefiend ember', examine: 'A white-hot ember that never cools. Used to enchant fire staves.', value: 5000, category: 'crafting', weight: 0.1 });
items.define({ id: 31114, name: 'Harpie bug carapace', examine: 'A lightweight carapace from a harpie bug swarm. Surprisingly durable.', value: 4000, category: 'crafting', weight: 0.5 });
items.define({ id: 31115, name: 'Infernal thread', examine: 'Thread spun from infernal energy. Glows faintly.', value: 8000, category: 'crafting', weight: 0.1 });
items.define({ id: 31116, name: 'Gelatinous core', examine: 'The pulsating core of a jelly. Surprisingly warm.', value: 6000, category: 'crafting', weight: 0.3 });
items.define({ id: 31117, name: 'Terror dog fang', examine: 'A massive canine fang. Radiates fear.', value: 7000, category: 'crafting', weight: 0.2 });
items.define({ id: 31118, name: 'Mutated blood shard', examine: 'A crystallized blood shard from a mutated bloodveld. Pulses rhythmically.', value: 15000, category: 'crafting', weight: 0.1 });
items.define({ id: 31119, name: 'Fever spider venom sac', examine: 'A sac of potent venom. Handle with extreme care.', value: 10000, category: 'crafting', weight: 0.2 });
items.define({ id: 31120, name: 'Shadow essence', examine: 'Captured shadow from a shadow warrior. Writhes in the light.', value: 12000, category: 'crafting', weight: 0.1 });
items.define({ id: 31121, name: 'Nechryarch grimoire', examine: 'A tome of forbidden knowledge ripped from a greater nechryael.', value: 25000, category: 'crafting', weight: 1.5 });
items.define({ id: 31122, name: 'Spectral essence', examine: 'The distilled soul energy of a spiritual warrior. Cold to the touch.', value: 18000, category: 'crafting', weight: 0.1 });
items.define({ id: 31123, name: 'Brutal dragonhide', examine: 'Exceptionally tough dragonhide from a brutal dragon.', value: 30000, category: 'crafting', weight: 2.0 });
items.define({ id: 31124, name: 'Fossilized wyvern visage', examine: 'An ancient wyvern shield component. Radiates primordial cold.', value: 200000, category: 'crafting', weight: 3.0 });
items.define({ id: 31125, name: 'Granite dust', examine: 'Fine granite powder. Used to enhance cannonballs.', value: 50, category: 'crafting', stackable: true, weight: 0 });
items.define({ id: 31126, name: 'Zenyte shard', examine: 'A fragment of zenyte. Can be combined with an onyx to create zenyte jewellery.', value: 500000, category: 'crafting', weight: 0.2 });
items.define({ id: 31127, name: 'Hydra leather', examine: 'Supple leather stripped from a hydra. Used to craft Ferocious gloves.', value: 120000, category: 'crafting', weight: 1.0 });
items.define({ id: 31128, name: 'Hydra claw', examine: 'A razor-sharp claw from the Alchemical Hydra. Combined with a Zamorakian hasta to create the Dragon hunter lance.', value: 800000, category: 'crafting', weight: 0.5 });
items.define({ id: 31129, name: 'Brimstone ring piece (i)', examine: 'A fragment of the Brimstone ring. Collect all three to assemble.', value: 300000, category: 'crafting', weight: 0.1 });
items.define({ id: 31130, name: 'Dark beast sinew', examine: 'An impossibly strong sinew from a superior dark beast. Used to craft dark bows.', value: 150000, category: 'crafting', weight: 0.5 });
items.define({ id: 31131, name: 'Smoke devil heart', examine: 'The smouldering heart of a thermonuclear smoke devil. Burns eternally.', value: 600000, category: 'crafting', weight: 0.3 });
items.define({ id: 31132, name: 'Occult necklace', examine: 'A necklace of dark power. Increases magic damage by 10%.', value: 400000, category: 'armour', equipSlot: 'neck', stats: { magic: 12, magic_damage: 10 }, equipReqs: { magic: 70 } });

// ══════════════════════════════════════════════════════════════════════════════
// SLAYER LEVEL 1-10 — Entry-level creatures
// ══════════════════════════════════════════════════════════════════════════════

// 1. Shore crab (rock crab variant) — Level 1 slayer
mob('shore_crab', {
  name: 'Shore crab', combat: 13, maxHp: 50, maxHit: 1,
  stats: { attack: 1, strength: 1, defence: 40 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee',
  aggressive: false, aggroRange: 1, wanderRadius: 0, respawnTicks: 25,
  examine: 'A rock-like crustacean. Awakens when approached.',
  weakness: 'crush', tags: ['beast', 'armoured']
}, {
  always: [], main: [
    { id: 101, name: 'Coins', weight: 12, min: 5, max: 20 },
    { id: 0, name: 'Nothing', weight: 18, min: 0, max: 0 }
  ]
});

// 2. Armoured hobgoblin (hobgoblin variant) — Level 5 slayer
mob('armoured_hobgoblin', {
  name: 'Armoured hobgoblin', combat: 35, maxHp: 38, maxHit: 6,
  stats: { attack: 24, strength: 22, defence: 25 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee',
  aggressive: true, aggroRange: 4, wanderRadius: 4, respawnTicks: 40,
  examine: 'A hobgoblin clad in scavenged plate armour.',
  weakness: 'magic', tags: ['goblinoid', 'armoured']
}, {
  always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [
    { id: 101, name: 'Coins', weight: 15, min: 15, max: 55 },
    { id: 12203, name: 'Limpwurt root', weight: 4, min: 1, max: 1 },
    { id: 0, name: 'Nothing', weight: 10, min: 0, max: 0 }
  ]
});

// 3. Cave crawler — Level 10 slayer
mob('cave_crawler', {
  name: 'Cave crawler', combat: 23, maxHp: 22, maxHit: 3,
  stats: { attack: 14, strength: 12, defence: 10 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee',
  aggressive: true, aggroRange: 3, wanderRadius: 3, respawnTicks: 30,
  examine: 'A multi-legged cave dweller. Venomous.',
  weakness: 'slash', tags: ['beast'], poisonDamage: 1
}, {
  always: [], main: [
    { id: 101, name: 'Coins', weight: 12, min: 5, max: 30 },
    { id: 31110, name: 'Crawler fang', weight: 3, min: 1, max: 1 },
    { id: 0, name: 'Nothing', weight: 12, min: 0, max: 0 }
  ]
});

// ══════════════════════════════════════════════════════════════════════════════
// SLAYER LEVEL 10-20 — Developing slayers
// ══════════════════════════════════════════════════════════════════════════════

// 4. Twisted banshee — Level 15 slayer
mob('twisted_banshee', {
  name: 'Twisted banshee', combat: 89, maxHp: 60, maxHit: 8,
  stats: { attack: 50, strength: 48, defence: 30 },
  attackSpeed: 4, attackRange: 4, attackStyle: 'magic',
  aggressive: true, aggroRange: 5, wanderRadius: 3, respawnTicks: 35,
  examine: 'A banshee warped by dark magic. Its scream rends the mind.',
  weakness: 'ranged', tags: ['undead', 'spectral'], resistance: 'magic'
}, {
  always: [], main: [
    { id: 101, name: 'Coins', weight: 10, min: 20, max: 80 },
    { id: 31111, name: 'Twisted banshee vocal cord', weight: 2, min: 1, max: 1 },
    { id: 11359, name: 'Nature rune', weight: 4, min: 3, max: 10 },
    { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }
  ]
});

// 5. Grasping hand (crawling hands variant) — Level 13 slayer
mob('grasping_hand', {
  name: 'Grasping hand', combat: 18, maxHp: 16, maxHit: 3,
  stats: { attack: 10, strength: 8, defence: 6 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee',
  aggressive: true, aggroRange: 3, wanderRadius: 2, respawnTicks: 25,
  examine: 'A severed hand that crawls with unnatural purpose.',
  weakness: 'slash', tags: ['undead']
}, {
  always: [], main: [
    { id: 101, name: 'Coins', weight: 15, min: 5, max: 25 },
    { id: 0, name: 'Nothing', weight: 15, min: 0, max: 0 }
  ]
});

// 6. Wall beast — Level 17 slayer
mob('wall_beast', {
  name: 'Wall beast', combat: 49, maxHp: 45, maxHit: 7,
  stats: { attack: 28, strength: 30, defence: 22 },
  attackSpeed: 5, attackRange: 1, attackStyle: 'melee',
  aggressive: true, aggroRange: 1, wanderRadius: 0, respawnTicks: 40,
  examine: 'A beast that lurks within the cave walls. Ambush predator.',
  weakness: 'crush', tags: ['beast']
}, {
  always: [], main: [
    { id: 101, name: 'Coins', weight: 10, min: 15, max: 60 },
    { id: 31112, name: 'Wallbeast hide', weight: 2, min: 1, max: 1 },
    { id: 0, name: 'Nothing', weight: 10, min: 0, max: 0 }
  ]
});

// ══════════════════════════════════════════════════════════════════════════════
// SLAYER LEVEL 20-30 — Intermediate creatures
// ══════════════════════════════════════════════════════════════════════════════

// 7. Pyrefiend — Level 25 slayer
mob('pyrefiend', {
  name: 'Pyrefiend', combat: 48, maxHp: 45, maxHit: 6,
  stats: { attack: 32, strength: 30, defence: 25 },
  attackSpeed: 4, attackRange: 3, attackStyle: 'magic',
  aggressive: true, aggroRange: 4, wanderRadius: 3, respawnTicks: 35,
  examine: 'A lesser fire demon. Weak to water magic.',
  weakness: 'water_magic', tags: ['demon', 'fiery'], resistance: 'melee'
}, {
  always: [], main: [
    { id: 101, name: 'Coins', weight: 10, min: 20, max: 80 },
    { id: 31113, name: 'Pyrefiend ember', weight: 2, min: 1, max: 1 },
    { id: 11353, name: 'Fire rune', weight: 5, min: 5, max: 15 },
    { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }
  ]
});

// 8. Harpie bug swarm — Level 23 slayer
mob('harpie_bug_swarm', {
  name: 'Harpie bug swarm', combat: 46, maxHp: 40, maxHit: 5,
  stats: { attack: 25, strength: 22, defence: 18 },
  attackSpeed: 3, attackRange: 1, attackStyle: 'melee',
  aggressive: true, aggroRange: 5, wanderRadius: 5, respawnTicks: 30,
  examine: 'A buzzing swarm of harpie bugs. Requires a lit bug lantern.',
  weakness: 'magic', tags: ['beast'], resistance: 'melee'
}, {
  always: [], main: [
    { id: 101, name: 'Coins', weight: 10, min: 15, max: 50 },
    { id: 31114, name: 'Harpie bug carapace', weight: 3, min: 1, max: 1 },
    { id: 0, name: 'Nothing', weight: 10, min: 0, max: 0 }
  ]
});

// ══════════════════════════════════════════════════════════════════════════════
// SLAYER LEVEL 30-40 — Challenging mid-game
// ══════════════════════════════════════════════════════════════════════════════

// 9. Infernal mage — Level 32 slayer
mob('infernal_mage', {
  name: 'Infernal mage', combat: 66, maxHp: 60, maxHit: 9,
  stats: { attack: 40, strength: 35, defence: 35 },
  attackSpeed: 4, attackRange: 5, attackStyle: 'magic',
  aggressive: true, aggroRange: 5, wanderRadius: 3, respawnTicks: 40,
  examine: 'A mage wreathed in infernal flame. Casts devastating fire spells.',
  weakness: 'ranged', tags: ['human', 'demon'], resistance: 'magic'
}, {
  always: [], main: [
    { id: 101, name: 'Coins', weight: 8, min: 30, max: 100 },
    { id: 31115, name: 'Infernal thread', weight: 2, min: 1, max: 1 },
    { id: 11353, name: 'Fire rune', weight: 5, min: 10, max: 30 },
    { id: 11357, name: 'Death rune', weight: 3, min: 2, max: 5 },
    { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }
  ]
});

// 10. Jelly — Level 33 slayer
mob('jelly', {
  name: 'Jelly', combat: 78, maxHp: 75, maxHit: 8,
  stats: { attack: 45, strength: 42, defence: 35 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee',
  aggressive: true, aggroRange: 3, wanderRadius: 2, respawnTicks: 40,
  examine: 'An amorphous blob of gelatinous flesh. Absorbs physical blows.',
  weakness: 'magic', tags: ['beast'], resistance: 'melee'
}, {
  always: [], main: [
    { id: 101, name: 'Coins', weight: 10, min: 25, max: 90 },
    { id: 31116, name: 'Gelatinous core', weight: 2, min: 1, max: 1 },
    { id: 12005, name: 'Grimy ranarr', weight: 3, min: 1, max: 1 },
    { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }
  ]
});

// 11. Terror dog — Level 38 slayer
mob('terror_dog', {
  name: 'Terror dog', combat: 100, maxHp: 90, maxHit: 11,
  stats: { attack: 60, strength: 58, defence: 50 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee',
  aggressive: true, aggroRange: 5, wanderRadius: 4, respawnTicks: 45,
  examine: 'A massive hound from the pits of terror. Its howl paralyses.',
  weakness: 'crush', tags: ['beast', 'shadow']
}, {
  always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [
    { id: 101, name: 'Coins', weight: 8, min: 40, max: 130 },
    { id: 31117, name: 'Terror dog fang', weight: 2, min: 1, max: 1 },
    { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }
  ]
});

// ══════════════════════════════════════════════════════════════════════════════
// SLAYER LEVEL 40-50 — Upper mid-game
// ══════════════════════════════════════════════════════════════════════════════

// 12. Mutated bloodveld — Level 40 slayer
mob('mutated_bloodveld', {
  name: 'Mutated bloodveld', combat: 123, maxHp: 120, maxHit: 12,
  stats: { attack: 72, strength: 70, defence: 55 },
  attackSpeed: 4, attackRange: 3, attackStyle: 'magic',
  aggressive: true, aggroRange: 5, wanderRadius: 4, respawnTicks: 50,
  examine: 'A grotesquely mutated bloodveld. Larger and far more aggressive.',
  weakness: 'ranged', tags: ['demon'], resistance: 'magic'
}, {
  always: [], main: [
    { id: 101, name: 'Coins', weight: 8, min: 50, max: 180 },
    { id: 31118, name: 'Mutated blood shard', weight: 2, min: 1, max: 1 },
    { id: 11358, name: 'Blood rune', weight: 4, min: 5, max: 12 },
    { id: 0, name: 'Nothing', weight: 5, min: 0, max: 0 }
  ]
});

// 13. Fever spider — Level 42 slayer
mob('fever_spider', {
  name: 'Fever spider', combat: 49, maxHp: 45, maxHit: 7,
  stats: { attack: 30, strength: 28, defence: 20 },
  attackSpeed: 3, attackRange: 1, attackStyle: 'melee',
  aggressive: true, aggroRange: 4, wanderRadius: 3, respawnTicks: 35,
  examine: 'A disease-riddled spider. Slayer gloves required to avoid infection.',
  weakness: 'crush', tags: ['beast'], poisonDamage: 3
}, {
  always: [], main: [
    { id: 101, name: 'Coins', weight: 10, min: 20, max: 70 },
    { id: 31119, name: 'Fever spider venom sac', weight: 2, min: 1, max: 1 },
    { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }
  ]
});

// 14. Shadow warrior — Level 48 slayer
mob('shadow_warrior', {
  name: 'Shadow warrior', combat: 68, maxHp: 62, maxHit: 8,
  stats: { attack: 42, strength: 40, defence: 38 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee',
  aggressive: true, aggroRange: 4, wanderRadius: 3, respawnTicks: 40,
  examine: 'A warrior made of living shadow. Semi-transparent.',
  weakness: 'magic', tags: ['shadow', 'spectral'], resistance: 'ranged'
}, {
  always: [], main: [
    { id: 101, name: 'Coins', weight: 8, min: 40, max: 120 },
    { id: 31120, name: 'Shadow essence', weight: 2, min: 1, max: 1 },
    { id: 11357, name: 'Death rune', weight: 4, min: 3, max: 8 },
    { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }
  ]
});

// ══════════════════════════════════════════════════════════════════════════════
// SLAYER LEVEL 50-60 — High mid-game
// ══════════════════════════════════════════════════════════════════════════════

// 15. Greater nechryael — Level 55 slayer
mob('greater_nechryael', {
  name: 'Greater nechryael', combat: 200, maxHp: 170, maxHit: 18,
  stats: { attack: 115, strength: 110, defence: 100 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee',
  aggressive: true, aggroRange: 4, wanderRadius: 3, respawnTicks: 55,
  examine: 'An immensely powerful nechryael. Summons death spawn.',
  weakness: 'slash', tags: ['demon'], resistance: 'magic'
}, {
  always: [], main: [
    { id: 101, name: 'Coins', weight: 6, min: 80, max: 300 },
    { id: 31121, name: 'Nechryarch grimoire', weight: 1, min: 1, max: 1 },
    { id: 12009, name: 'Grimy snapdragon', weight: 2, min: 1, max: 1 },
    { id: 11357, name: 'Death rune', weight: 4, min: 5, max: 15 },
    { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 }
  ]
});

// 16. Spiritual warrior — Level 55 slayer
mob('spiritual_warrior', {
  name: 'Spiritual warrior', combat: 134, maxHp: 110, maxHit: 13,
  stats: { attack: 82, strength: 78, defence: 70 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee',
  aggressive: true, aggroRange: 4, wanderRadius: 3, respawnTicks: 45,
  examine: 'The ghost of a fallen warrior. Still fights with discipline.',
  weakness: 'magic', tags: ['undead', 'spectral'], resistance: 'melee'
}, {
  always: [], main: [
    { id: 101, name: 'Coins', weight: 8, min: 50, max: 180 },
    { id: 31122, name: 'Spectral essence', weight: 2, min: 1, max: 1 },
    { id: 0, name: 'Nothing', weight: 5, min: 0, max: 0 }
  ]
});

// 17. Spiritual mage — Level 55 slayer
mob('spiritual_mage', {
  name: 'Spiritual mage', combat: 120, maxHp: 90, maxHit: 14,
  stats: { attack: 70, strength: 65, defence: 55 },
  attackSpeed: 4, attackRange: 5, attackStyle: 'magic',
  aggressive: true, aggroRange: 5, wanderRadius: 3, respawnTicks: 45,
  examine: 'The ghost of a fallen mage. Casts spells from beyond the grave.',
  weakness: 'ranged', tags: ['undead', 'spectral'], resistance: 'magic'
}, {
  always: [], main: [
    { id: 101, name: 'Coins', weight: 8, min: 50, max: 180 },
    { id: 31122, name: 'Spectral essence', weight: 2, min: 1, max: 1 },
    { id: 11357, name: 'Death rune', weight: 4, min: 5, max: 12 },
    { id: 0, name: 'Nothing', weight: 5, min: 0, max: 0 }
  ]
});

// 18. Spiritual ranger — Level 55 slayer
mob('spiritual_ranger', {
  name: 'Spiritual ranger', combat: 127, maxHp: 100, maxHit: 13,
  stats: { attack: 75, strength: 72, defence: 60 },
  attackSpeed: 3, attackRange: 6, attackStyle: 'ranged',
  aggressive: true, aggroRange: 6, wanderRadius: 3, respawnTicks: 45,
  examine: 'The ghost of a fallen ranger. Fires spectral arrows.',
  weakness: 'magic', tags: ['undead', 'spectral'], resistance: 'ranged'
}, {
  always: [], main: [
    { id: 101, name: 'Coins', weight: 8, min: 50, max: 180 },
    { id: 31122, name: 'Spectral essence', weight: 2, min: 1, max: 1 },
    { id: 11104, name: 'Adamant arrow', weight: 5, min: 10, max: 30 },
    { id: 0, name: 'Nothing', weight: 5, min: 0, max: 0 }
  ]
});

// ══════════════════════════════════════════════════════════════════════════════
// SLAYER LEVEL 60-70 — High-level creatures
// ══════════════════════════════════════════════════════════════════════════════

// 19. Brutal black dragon — Level 62 slayer
mob('brutal_black_dragon', {
  name: 'Brutal black dragon', combat: 318, maxHp: 280, maxHit: 25,
  stats: { attack: 175, strength: 170, defence: 165 },
  attackSpeed: 4, attackRange: 5, attackStyle: 'magic', size: 3,
  aggressive: true, aggroRange: 5, wanderRadius: 3, respawnTicks: 80,
  examine: 'A savage black dragon driven mad by ancient corruption.',
  weakness: 'stab', tags: ['dragon', 'brutal'], resistance: 'magic'
}, {
  always: [{ id: 107, name: 'Dragon bones', min: 1, max: 1 }], main: [
    { id: 101, name: 'Coins', weight: 5, min: 400, max: 1500 },
    { id: 31123, name: 'Brutal dragonhide', weight: 2, min: 1, max: 1 },
    { id: 20012, name: 'Dragon platelegs', weight: 1, min: 1, max: 1 },
    { id: 0, name: 'Nothing', weight: 3, min: 0, max: 0 }
  ]
});

// 20. Brutal blue dragon — Level 62 slayer
mob('brutal_blue_dragon', {
  name: 'Brutal blue dragon', combat: 250, maxHp: 220, maxHit: 21,
  stats: { attack: 145, strength: 140, defence: 135 },
  attackSpeed: 4, attackRange: 5, attackStyle: 'magic', size: 3,
  aggressive: true, aggroRange: 5, wanderRadius: 3, respawnTicks: 75,
  examine: 'A blue dragon warped by brutal fury. Do not underestimate it.',
  weakness: 'stab', tags: ['dragon', 'brutal'], resistance: 'magic'
}, {
  always: [{ id: 107, name: 'Dragon bones', min: 1, max: 1 }], main: [
    { id: 101, name: 'Coins', weight: 5, min: 300, max: 1000 },
    { id: 31123, name: 'Brutal dragonhide', weight: 2, min: 1, max: 1 },
    { id: 0, name: 'Nothing', weight: 3, min: 0, max: 0 }
  ]
});

// 21. Brutal red dragon — Level 62 slayer
mob('brutal_red_dragon', {
  name: 'Brutal red dragon', combat: 289, maxHp: 260, maxHit: 23,
  stats: { attack: 160, strength: 155, defence: 150 },
  attackSpeed: 4, attackRange: 5, attackStyle: 'magic', size: 3,
  aggressive: true, aggroRange: 5, wanderRadius: 3, respawnTicks: 78,
  examine: 'A red dragon consumed by brutality. Fire incarnate.',
  weakness: 'stab', tags: ['dragon', 'brutal'], resistance: 'magic'
}, {
  always: [{ id: 107, name: 'Dragon bones', min: 1, max: 1 }], main: [
    { id: 101, name: 'Coins', weight: 5, min: 350, max: 1200 },
    { id: 31123, name: 'Brutal dragonhide', weight: 2, min: 1, max: 1 },
    { id: 11358, name: 'Blood rune', weight: 3, min: 5, max: 15 },
    { id: 0, name: 'Nothing', weight: 3, min: 0, max: 0 }
  ]
});

// 22. Fossil island wyvern — Level 66 slayer
mob('fossil_wyvern', {
  name: 'Fossil island wyvern', combat: 152, maxHp: 150, maxHit: 15,
  stats: { attack: 90, strength: 88, defence: 80 },
  attackSpeed: 4, attackRange: 4, attackStyle: 'ranged', size: 2,
  aggressive: true, aggroRange: 4, wanderRadius: 3, respawnTicks: 60,
  examine: 'An ancient wyvern preserved in fossil. Breathes icy wind.',
  weakness: 'slash', tags: ['dragon', 'undead'], resistance: 'ranged'
}, {
  always: [{ id: 107, name: 'Dragon bones', min: 1, max: 1 }], main: [
    { id: 101, name: 'Coins', weight: 6, min: 100, max: 400 },
    { id: 31125, name: 'Granite dust', weight: 4, min: 5, max: 25 },
    { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 }
  ],
  tertiary: [
    { id: 31124, name: 'Fossilized wyvern visage', chance: 5000, min: 1, max: 1 }
  ]
});

// ══════════════════════════════════════════════════════════════════════════════
// SLAYER LEVEL 70-80 — Elite creatures + bosses
// ══════════════════════════════════════════════════════════════════════════════

// 23. Grotesque Guardians (boss) — Level 75 slayer
mob('grotesque_guardian_dawn', {
  name: 'Grotesque Guardian Dawn', combat: 328, maxHp: 450, maxHit: 28,
  stats: { attack: 180, strength: 175, defence: 160 },
  attackSpeed: 4, attackRange: 5, attackStyle: 'magic', size: 4,
  aggressive: true, aggroRange: 6, wanderRadius: 0, respawnTicks: 120,
  examine: 'The dawn gargoyle. Awakened from stone atop the Slayer Tower.',
  weakness: 'ranged', tags: ['boss', 'armoured', 'construct'], resistance: 'magic'
}, {
  always: [], main: [
    { id: 101, name: 'Coins', weight: 5, min: 500, max: 2000 },
    { id: 31125, name: 'Granite dust', weight: 3, min: 20, max: 50 },
    { id: 11358, name: 'Blood rune', weight: 3, min: 10, max: 25 },
    { id: 0, name: 'Nothing', weight: 2, min: 0, max: 0 }
  ]
});

mob('grotesque_guardian_dusk', {
  name: 'Grotesque Guardian Dusk', combat: 344, maxHp: 500, maxHit: 32,
  stats: { attack: 195, strength: 190, defence: 175 },
  attackSpeed: 5, attackRange: 1, attackStyle: 'melee', size: 4,
  aggressive: true, aggroRange: 6, wanderRadius: 0, respawnTicks: 120,
  examine: 'The dusk gargoyle. The stronger of the pair.',
  weakness: 'crush', tags: ['boss', 'armoured', 'construct'], resistance: 'ranged'
}, {
  always: [], main: [
    { id: 101, name: 'Coins', weight: 5, min: 500, max: 2500 },
    { id: 31125, name: 'Granite dust', weight: 3, min: 20, max: 50 },
    { id: 0, name: 'Nothing', weight: 2, min: 0, max: 0 }
  ]
});

// 24. Demonic gorilla — Level 72 slayer
mob('demonic_gorilla', {
  name: 'Demonic gorilla', combat: 275, maxHp: 380, maxHit: 30,
  stats: { attack: 170, strength: 168, defence: 155 },
  attackSpeed: 4, attackRange: 4, attackStyle: 'melee', size: 2,
  aggressive: true, aggroRange: 5, wanderRadius: 3, respawnTicks: 70,
  examine: 'A gorilla possessed by demonic energy. Switches combat styles.',
  weakness: 'ranged', tags: ['demon', 'beast', 'style_switcher']
}, {
  always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [
    { id: 101, name: 'Coins', weight: 5, min: 300, max: 1200 },
    { id: 11357, name: 'Death rune', weight: 3, min: 10, max: 25 },
    { id: 11358, name: 'Blood rune', weight: 3, min: 5, max: 15 },
    { id: 0, name: 'Nothing', weight: 3, min: 0, max: 0 }
  ],
  tertiary: [
    { id: 31126, name: 'Zenyte shard', chance: 300, min: 1, max: 1 }
  ]
});

// ══════════════════════════════════════════════════════════════════════════════
// SLAYER LEVEL 80-90 — Endgame creatures + bosses
// ══════════════════════════════════════════════════════════════════════════════

// 25. Hydra — Level 80 slayer
mob('hydra', {
  name: 'Hydra', combat: 194, maxHp: 200, maxHit: 17,
  stats: { attack: 120, strength: 115, defence: 100 },
  attackSpeed: 4, attackRange: 4, attackStyle: 'ranged', size: 2,
  aggressive: true, aggroRange: 4, wanderRadius: 3, respawnTicks: 55,
  examine: 'A multi-headed serpentine creature. Each head acts independently.',
  weakness: 'slash', tags: ['beast', 'dragon']
}, {
  always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [
    { id: 101, name: 'Coins', weight: 6, min: 100, max: 400 },
    { id: 31127, name: 'Hydra leather', weight: 2, min: 1, max: 1 },
    { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 }
  ]
});

// 26. Alchemical hydra (boss) — Level 85 slayer
mob('alchemical_hydra', {
  name: 'Alchemical Hydra', combat: 426, maxHp: 1100, maxHit: 35,
  stats: { attack: 250, strength: 240, defence: 220 },
  attackSpeed: 4, attackRange: 5, attackStyle: 'magic', size: 4,
  aggressive: true, aggroRange: 6, wanderRadius: 0, respawnTicks: 150,
  examine: 'A hydra augmented with alchemical power. Four devastating phases.',
  weakness: 'slash', tags: ['beast', 'dragon', 'boss']
}, {
  always: [{ id: 106, name: 'Big bones', min: 2, max: 2 }], main: [
    { id: 101, name: 'Coins', weight: 4, min: 1000, max: 5000 },
    { id: 31127, name: 'Hydra leather', weight: 2, min: 1, max: 2 },
    { id: 11358, name: 'Blood rune', weight: 3, min: 15, max: 40 },
    { id: 0, name: 'Nothing', weight: 2, min: 0, max: 0 }
  ],
  tertiary: [
    { id: 31128, name: 'Hydra claw', chance: 1001, min: 1, max: 1 },
    { id: 31129, name: 'Brimstone ring piece (i)', chance: 360, min: 1, max: 1 }
  ]
});

// 27. Superior dark beast — Level 88 slayer
mob('superior_dark_beast', {
  name: 'Superior dark beast', combat: 285, maxHp: 280, maxHit: 24,
  stats: { attack: 165, strength: 160, defence: 140 },
  attackSpeed: 4, attackRange: 4, attackStyle: 'magic', size: 3,
  aggressive: true, aggroRange: 5, wanderRadius: 3, respawnTicks: 65,
  examine: 'An enormous dark beast. Older and far more dangerous than its kin.',
  weakness: 'slash', tags: ['beast', 'shadow'], resistance: 'magic'
}, {
  always: [], main: [
    { id: 101, name: 'Coins', weight: 5, min: 200, max: 800 },
    { id: 31130, name: 'Dark beast sinew', weight: 2, min: 1, max: 1 },
    { id: 11357, name: 'Death rune', weight: 3, min: 10, max: 25 },
    { id: 0, name: 'Nothing', weight: 3, min: 0, max: 0 }
  ]
});

// ══════════════════════════════════════════════════════════════════════════════
// SLAYER LEVEL 90+ — Pinnacle content
// ══════════════════════════════════════════════════════════════════════════════

// 28. Thermonuclear smoke devil (boss) — Level 93 slayer
mob('thermonuclear_smoke_devil', {
  name: 'Thermonuclear smoke devil', combat: 301, maxHp: 400, maxHit: 26,
  stats: { attack: 185, strength: 180, defence: 160 },
  attackSpeed: 4, attackRange: 5, attackStyle: 'magic', size: 3,
  aggressive: true, aggroRange: 5, wanderRadius: 0, respawnTicks: 100,
  examine: 'The progenitor of the smoke devils. Engulfed in thermonuclear smog.',
  weakness: 'ranged', tags: ['demon', 'boss'], resistance: 'magic'
}, {
  always: [], main: [
    { id: 101, name: 'Coins', weight: 4, min: 500, max: 2500 },
    { id: 31131, name: 'Smoke devil heart', weight: 1, min: 1, max: 1 },
    { id: 11353, name: 'Fire rune', weight: 3, min: 25, max: 75 },
    { id: 11357, name: 'Death rune', weight: 3, min: 10, max: 30 },
    { id: 0, name: 'Nothing', weight: 2, min: 0, max: 0 }
  ],
  tertiary: [
    { id: 31132, name: 'Occult necklace', chance: 350, min: 1, max: 1 }
  ]
});

// ══════════════════════════════════════════════════════════════════════════════
// ADDITIONAL CREATURES (filling remaining bracket gaps)
// ══════════════════════════════════════════════════════════════════════════════

// 29. Rockslug — Level 7 slayer (needs bag of salt to finish)
mob('rockslug', {
  name: 'Rockslug', combat: 29, maxHp: 27, maxHit: 4,
  stats: { attack: 16, strength: 14, defence: 20 },
  attackSpeed: 5, attackRange: 1, attackStyle: 'melee',
  aggressive: false, aggroRange: 2, wanderRadius: 2, respawnTicks: 30,
  examine: 'A slug made of rock. Use a bag of salt to finish it off.',
  weakness: 'crush', tags: ['beast', 'armoured']
}, {
  always: [], main: [
    { id: 101, name: 'Coins', weight: 12, min: 8, max: 35 },
    { id: 0, name: 'Nothing', weight: 15, min: 0, max: 0 }
  ]
});

// 30. Cockatrice — Level 12 slayer (mirror shield required)
mob('cockatrice', {
  name: 'Cockatrice', combat: 37, maxHp: 35, maxHit: 5,
  stats: { attack: 22, strength: 18, defence: 15 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee',
  aggressive: true, aggroRange: 3, wanderRadius: 3, respawnTicks: 30,
  examine: 'A hideous bird-reptile hybrid. Its gaze drains stats. Bring a mirror shield.',
  weakness: 'slash', tags: ['beast']
}, {
  always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [
    { id: 101, name: 'Coins', weight: 12, min: 10, max: 40 },
    { id: 12203, name: 'Limpwurt root', weight: 3, min: 1, max: 1 },
    { id: 0, name: 'Nothing', weight: 10, min: 0, max: 0 }
  ]
});

// 31. Warped jelly — Level 33 slayer (stronger jelly variant)
mob('warped_jelly', {
  name: 'Warped jelly', combat: 112, maxHp: 105, maxHit: 11,
  stats: { attack: 62, strength: 58, defence: 48 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee',
  aggressive: true, aggroRange: 4, wanderRadius: 3, respawnTicks: 45,
  examine: 'A jelly twisted into an unrecognisable mass. Disturbingly sentient.',
  weakness: 'magic', tags: ['beast'], resistance: 'melee'
}, {
  always: [], main: [
    { id: 101, name: 'Coins', weight: 8, min: 40, max: 150 },
    { id: 31116, name: 'Gelatinous core', weight: 3, min: 1, max: 1 },
    { id: 12005, name: 'Grimy ranarr', weight: 2, min: 1, max: 2 },
    { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }
  ]
});

// 32. Wyrm — Level 44 slayer
mob('wyrm', {
  name: 'Wyrm', combat: 99, maxHp: 90, maxHit: 10,
  stats: { attack: 58, strength: 55, defence: 48 },
  attackSpeed: 4, attackRange: 3, attackStyle: 'magic', size: 2,
  aggressive: true, aggroRange: 4, wanderRadius: 3, respawnTicks: 45,
  examine: 'A wingless dragon that slithers through volcanic tunnels.',
  weakness: 'stab', tags: ['dragon']
}, {
  always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [
    { id: 101, name: 'Coins', weight: 8, min: 40, max: 150 },
    { id: 11353, name: 'Fire rune', weight: 5, min: 5, max: 15 },
    { id: 0, name: 'Nothing', weight: 5, min: 0, max: 0 }
  ]
});

// 33. Drake — Level 60 slayer
mob('drake', {
  name: 'Drake', combat: 192, maxHp: 180, maxHit: 16,
  stats: { attack: 110, strength: 105, defence: 95 },
  attackSpeed: 4, attackRange: 4, attackStyle: 'ranged', size: 2,
  aggressive: true, aggroRange: 4, wanderRadius: 3, respawnTicks: 55,
  examine: 'A volcanic drake. Breathes superheated air.',
  weakness: 'stab', tags: ['dragon']
}, {
  always: [{ id: 107, name: 'Dragon bones', min: 1, max: 1 }], main: [
    { id: 101, name: 'Coins', weight: 6, min: 80, max: 300 },
    { id: 11353, name: 'Fire rune', weight: 4, min: 10, max: 30 },
    { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 }
  ]
});

// ══════════════════════════════════════════════════════════════════════════════
// SUPERIOR SLAYER VARIANTS
// Rare spawns (1/200 chance), 10x HP, guaranteed unique table roll.
// Superior-only drops: Imbued heart (22007), Eternal gem (31102),
//   Dust battlestaff (31100), Mist battlestaff (31101)
// ══════════════════════════════════════════════════════════════════════════════

const SUPERIOR_DROP_TABLE = {
  always: [], main: [
    { id: 22007, name: 'Imbued heart', weight: 1, min: 1, max: 1 },
    { id: 31102, name: 'Eternal gem', weight: 1, min: 1, max: 1 },
    { id: 31100, name: 'Dust battlestaff', weight: 1, min: 1, max: 1 },
    { id: 31101, name: 'Mist battlestaff', weight: 1, min: 1, max: 1 },
  ]
};

// 1. Superior cave crawler — spawns from cave_crawler (1/200)
mob('superior_cave_crawler', {
  name: 'Chasm crawler', combat: 68, maxHp: 220, maxHit: 8,
  stats: { attack: 38, strength: 35, defence: 28 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee',
  aggressive: true, aggroRange: 5, wanderRadius: 3, respawnTicks: 0,
  examine: 'A monstrous cave crawler. Far larger than its kin.',
  weakness: 'slash', tags: ['beast', 'superior'], poisonDamage: 3,
  superiorOf: 'cave_crawler', spawnChance: 200
}, SUPERIOR_DROP_TABLE);

// 2. Superior pyrefiend — spawns from pyrefiend (1/200)
mob('superior_pyrefiend', {
  name: 'Flaming pyrelord', combat: 128, maxHp: 450, maxHit: 14,
  stats: { attack: 72, strength: 68, defence: 55 },
  attackSpeed: 4, attackRange: 4, attackStyle: 'magic',
  aggressive: true, aggroRange: 6, wanderRadius: 3, respawnTicks: 0,
  examine: 'A massive fire demon. The flames burn white-hot.',
  weakness: 'water_magic', tags: ['demon', 'fiery', 'superior'], resistance: 'melee',
  superiorOf: 'pyrefiend', spawnChance: 200
}, SUPERIOR_DROP_TABLE);

// 3. Superior jelly — spawns from jelly (1/200)
mob('superior_jelly', {
  name: 'Vitreous jelly', combat: 185, maxHp: 750, maxHit: 18,
  stats: { attack: 95, strength: 90, defence: 78 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee',
  aggressive: true, aggroRange: 5, wanderRadius: 2, respawnTicks: 0,
  examine: 'A colossal jelly with a transparent, glass-like membrane.',
  weakness: 'magic', tags: ['beast', 'superior'], resistance: 'melee',
  superiorOf: 'jelly', spawnChance: 200
}, SUPERIOR_DROP_TABLE);

// 4. Superior bloodveld — spawns from mutated_bloodveld (1/200)
mob('superior_bloodveld', {
  name: 'Insatiable bloodveld', combat: 260, maxHp: 1200, maxHit: 24,
  stats: { attack: 148, strength: 142, defence: 115 },
  attackSpeed: 4, attackRange: 4, attackStyle: 'magic',
  aggressive: true, aggroRange: 6, wanderRadius: 4, respawnTicks: 0,
  examine: 'A bloodveld consumed by endless hunger. Its tongue drains life.',
  weakness: 'ranged', tags: ['demon', 'superior'], resistance: 'magic',
  superiorOf: 'mutated_bloodveld', spawnChance: 200
}, SUPERIOR_DROP_TABLE);

// 5. Superior nechryael — spawns from greater_nechryael (1/200)
mob('superior_nechryael', {
  name: 'Nechryarch', combat: 350, maxHp: 1700, maxHit: 30,
  stats: { attack: 200, strength: 195, defence: 175 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee',
  aggressive: true, aggroRange: 6, wanderRadius: 3, respawnTicks: 0,
  examine: 'The lord of the nechryael. Commands an army of death spawn.',
  weakness: 'slash', tags: ['demon', 'superior'], resistance: 'magic',
  superiorOf: 'greater_nechryael', spawnChance: 200
}, SUPERIOR_DROP_TABLE);

// 6. Superior smoke devil — spawns from smoke_devil (1/200)
mob('superior_smoke_devil', {
  name: 'Nuclear smoke devil', combat: 310, maxHp: 1850, maxHit: 28,
  stats: { attack: 185, strength: 178, defence: 155 },
  attackSpeed: 4, attackRange: 5, attackStyle: 'magic',
  aggressive: true, aggroRange: 6, wanderRadius: 3, respawnTicks: 0,
  examine: 'A smoke devil on the verge of thermonuclear meltdown.',
  weakness: 'ranged', tags: ['demon', 'superior'], resistance: 'magic',
  superiorOf: 'smoke_devil', spawnChance: 200
}, SUPERIOR_DROP_TABLE);

// 7. Superior abyssal demon — spawns from abyssal_demon (1/200)
mob('superior_abyssal_demon', {
  name: 'Abyssal sire spawn', combat: 290, maxHp: 1500, maxHit: 26,
  stats: { attack: 170, strength: 165, defence: 145 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee',
  aggressive: true, aggroRange: 6, wanderRadius: 4, respawnTicks: 0,
  examine: 'A fragment of the Abyssal Sire given form. Teleports erratically.',
  weakness: 'slash', tags: ['demon', 'superior'], resistance: 'magic',
  superiorOf: 'abyssal_demon', spawnChance: 200
}, SUPERIOR_DROP_TABLE);

// 8. Superior basilisk — spawns from basilisk (1/200)
mob('superior_basilisk', {
  name: 'Basilisk sentinel', combat: 180, maxHp: 750, maxHit: 16,
  stats: { attack: 100, strength: 95, defence: 90 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee',
  aggressive: true, aggroRange: 5, wanderRadius: 3, respawnTicks: 0,
  examine: 'An ancient basilisk hardened into living stone. Its gaze is lethal.',
  weakness: 'crush', tags: ['beast', 'armoured', 'superior'],
  superiorOf: 'basilisk', spawnChance: 200
}, SUPERIOR_DROP_TABLE);

// 9. Superior cave horror — spawns from cave_horror (1/200)
mob('superior_cave_horror', {
  name: 'Cave abomination', combat: 195, maxHp: 550, maxHit: 18,
  stats: { attack: 110, strength: 108, defence: 80 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee',
  aggressive: true, aggroRange: 6, wanderRadius: 4, respawnTicks: 0,
  examine: 'A cave horror mutated beyond recognition. Pure nightmare.',
  weakness: 'slash', tags: ['beast', 'shadow', 'superior'],
  superiorOf: 'cave_horror', spawnChance: 200
}, SUPERIOR_DROP_TABLE);

// 10. Superior dark beast — spawns from superior_dark_beast tasks (1/200)
mob('superior_dark_beast_apex', {
  name: 'Night beast', combat: 410, maxHp: 2800, maxHit: 38,
  stats: { attack: 230, strength: 225, defence: 200 },
  attackSpeed: 4, attackRange: 5, attackStyle: 'magic', size: 3,
  aggressive: true, aggroRange: 6, wanderRadius: 3, respawnTicks: 0,
  examine: 'The apex predator of the shadow realm. Darkness given form.',
  weakness: 'slash', tags: ['beast', 'shadow', 'superior'], resistance: 'magic',
  superiorOf: 'superior_dark_beast', spawnChance: 200
}, SUPERIOR_DROP_TABLE);

// ══════════════════════════════════════════════════════════════════════════════
// ENDGAME SLAYER MASTER — Grandmaster Korvak
// ══════════════════════════════════════════════════════════════════════════════

slayer.defineMaster('korvak', {
  name: 'Grandmaster Korvak', combatReq: 110, slayerReq: 85,
  tasks: [
    // Mid-tier filler (low weight, for variety)
    { monster: 'turoth', weight: 2, min: 60, max: 100, slayerReq: 35 },
    { monster: 'kurask', weight: 3, min: 60, max: 100, slayerReq: 50 },
    { monster: 'cave horror', weight: 3, min: 80, max: 120, slayerReq: 58 },
    { monster: 'basilisk', weight: 3, min: 80, max: 120, slayerReq: 60 },

    // New expansion creatures
    { monster: 'mutated bloodveld', weight: 4, min: 100, max: 150, slayerReq: 40 },
    { monster: 'shadow warrior', weight: 3, min: 80, max: 120, slayerReq: 48 },
    { monster: 'greater nechryael', weight: 5, min: 100, max: 150, slayerReq: 55 },
    { monster: 'spiritual warrior', weight: 4, min: 100, max: 140, slayerReq: 55 },
    { monster: 'spiritual mage', weight: 4, min: 100, max: 140, slayerReq: 55 },
    { monster: 'spiritual ranger', weight: 4, min: 100, max: 140, slayerReq: 55 },
    { monster: 'drake', weight: 4, min: 80, max: 120, slayerReq: 60 },
    { monster: 'fossil wyvern', weight: 3, min: 60, max: 100, slayerReq: 66 },

    // Brutal dragons
    { monster: 'brutal black dragon', weight: 2, min: 20, max: 40, slayerReq: 62 },
    { monster: 'brutal blue dragon', weight: 3, min: 30, max: 50, slayerReq: 62 },
    { monster: 'brutal red dragon', weight: 2, min: 25, max: 45, slayerReq: 62 },

    // Demonic gorilla
    { monster: 'demonic gorilla', weight: 4, min: 50, max: 80, slayerReq: 72 },

    // Elite tasks
    { monster: 'smoke devil', weight: 5, min: 100, max: 150, slayerReq: 65 },
    { monster: 'gargoyle', weight: 5, min: 100, max: 150, slayerReq: 75 },
    { monster: 'abyssal demon', weight: 6, min: 120, max: 180, slayerReq: 85 },
    { monster: 'hydra', weight: 5, min: 80, max: 130, slayerReq: 80 },
    { monster: 'superior dark beast', weight: 4, min: 50, max: 80, slayerReq: 88 },

    // Boss tasks (low weight, low count)
    { monster: 'cave kraken', weight: 3, min: 80, max: 120, slayerReq: 87 },
    { monster: 'cerberus', weight: 2, min: 5, max: 25, slayerReq: 91 },
    { monster: 'thermonuclear smoke devil', weight: 2, min: 3, max: 15, slayerReq: 93 },
    { monster: 'alchemical hydra', weight: 2, min: 3, max: 20, slayerReq: 85 },
    { monster: 'grotesque guardian dawn', weight: 1, min: 3, max: 15, slayerReq: 75 },
  ],
});

console.log('[aelgard] Slayer expansion: 30+ creatures loaded');
