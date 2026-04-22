// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Expanded Boss Roster
// 20 more bosses bringing total to 40+
// Each boss = ~100 hours of pet hunting + collection log = 2,000 more hours
//
// Manifesto P04: Every boss has a unique mechanic no other boss has
// Manifesto P12: Different gear optimal per boss
// Manifesto P08: Each boss drops items that are breakpoints for some progression
// ══════════════════════════════════════════════════════════════════════════════

const items = require('../../data/items');
const npcs = require('../../world/npcs');
const droptables = require('../../data/droptables');
const registry = require('../../engine/content-registry');

// v0.9-waveB4 H14: boss-pet rates cut 2x (3000 → 1500) to bring avg-luck
// collection completion from 142,500hr → 6,000hr. See reports/coll-log-audit.md §5.
function boss(defId, def, drops, petId, petName, petExamine, petRate = 1500) {
  npcs.defineNpc(defId, def);
  if (drops) droptables.define(defId, drops);
  if (petId) {
    items.define({ id: petId, name: petName, examine: petExamine, value: 0, category: 'pet', tradeable: false, weight: 0 });
    // Add pet to drop table tertiary
    if (drops && !drops.tertiary) drops.tertiary = [];
    if (drops) drops.tertiary.push({ id: petId, name: petName, chance: petRate, min: 1, max: 1 });
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// GOD WARS DUNGEON BOSSES — 4 generals, each with unique mechanics
// Located in a shared dungeon beneath the Wilds
// ══════════════════════════════════════════════════════════════════════════════

// Items
items.define({ id: 91001, name: 'Saradomin hilt', examine: 'A hilt blessed by Saradomin.', value: 1000000, category: 'crafting', weight: 0.5 });
items.define({ id: 91002, name: 'Zamorak hilt', examine: 'A hilt cursed by Zamorak.', value: 1000000, category: 'crafting', weight: 0.5 });
items.define({ id: 91003, name: 'Bandos hilt', examine: 'A hilt of war.', value: 1500000, category: 'crafting', weight: 0.5 });
items.define({ id: 91004, name: 'Armadyl hilt', examine: 'A hilt of the sky.', value: 1500000, category: 'crafting', weight: 0.5 });
items.define({ id: 91005, name: 'Godsword blade', examine: 'A massive blade. Attach a hilt to complete.', value: 500000, category: 'weapon', weight: 5 });
items.define({ id: 91006, name: 'Saradomin godsword', examine: 'The Saradomin godsword. Special attack heals HP and prayer.', value: 3000000, category: 'weapon', equipSlot: 'weapon', speed: 6, stats: { slash: 132, melee_strength: 132, prayer: 8 }, equipReqs: { attack: 75 } });
items.define({ id: 91007, name: 'Zamorak godsword', examine: 'The Zamorak godsword. Special attack freezes the target.', value: 2000000, category: 'weapon', equipSlot: 'weapon', speed: 6, stats: { slash: 132, melee_strength: 132 }, equipReqs: { attack: 75 } });
items.define({ id: 91008, name: 'Saradomin sword', examine: 'A blessed sword. Good strength training weapon.', value: 500000, category: 'weapon', equipSlot: 'weapon', speed: 4, stats: { slash: 82, melee_strength: 82, prayer: 2 }, equipReqs: { attack: 70 } });
items.define({ id: 91009, name: 'Zamorak spear', examine: 'A spear of Zamorak. BIS stab for Corp Beast.', value: 800000, category: 'weapon', equipSlot: 'weapon', speed: 4, stats: { stab: 85, melee_strength: 75 }, equipReqs: { attack: 70 } });
items.define({ id: 91010, name: 'Bandos boots', examine: 'Boots of the war god.', value: 500000, category: 'armour', equipSlot: 'feet', stats: { def_stab: 15, def_slash: 16, def_crush: 17, melee_strength: 3 }, equipReqs: { defence: 65 } });
items.define({ id: 91011, name: 'Armadyl helmet', examine: 'A blessed aviansie helmet.', value: 800000, category: 'armour', equipSlot: 'head', stats: { ranged: 10, def_stab: 6, def_slash: 8, def_crush: 10, def_magic: 10, def_ranged: 6 }, equipReqs: { ranged: 65, defence: 65 } });

// Commander Zilyana (Saradomin) — magic attacks, high speed, weak to ranged
boss('commander_zilyana', {
  name: 'Commander Zilyana', combat: 596, maxHp: 255, maxHit: 27,
  stats: { attack: 250, strength: 230, defence: 220 },
  attackSpeed: 2, attackRange: 5, attackStyle: 'magic', size: 2,
  aggressive: true, aggroRange: 6, wanderRadius: 0, respawnTicks: 80,
  examine: 'Commander of Saradomin\'s forces. Extremely fast attacks.',
  weakness: 'ranged', tags: ['boss', 'godwars'], resistance: 'magic',
}, {
  always: [{ id: 107, name: 'Dragon bones', min: 1, max: 1 }],
  main: [
    { id: 91008, name: 'Saradomin sword', weight: 1, min: 1, max: 1 },
    { id: 91001, name: 'Saradomin hilt', weight: 1, min: 1, max: 1 },
    { id: 91005, name: 'Godsword blade', weight: 1, min: 1, max: 1 },
    { id: 101, name: 'Coins', weight: 5, min: 10000, max: 30000 },
    { id: 11360, name: 'Law rune', weight: 3, min: 50, max: 150 },
  ],
}, 82001, 'Zilyana Jr.', 'A tiny commander. Still bossy.');

// General Graardor (Bandos) — melee attacks, ranged special, tanky
boss('general_graardor', {
  name: 'General Graardor', combat: 624, maxHp: 255, maxHit: 32,
  stats: { attack: 280, strength: 270, defence: 250 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee', size: 3,
  aggressive: true, aggroRange: 6, wanderRadius: 0, respawnTicks: 80,
  examine: 'General of Bandos. Hits like a truck.',
  weakness: 'magic', tags: ['boss', 'godwars'], resistance: 'ranged',
}, {
  always: [{ id: 107, name: 'Dragon bones', min: 1, max: 1 }],
  main: [
    { id: 26003, name: 'Bandos chestplate', weight: 1, min: 1, max: 1 },
    { id: 26004, name: 'Bandos tassets', weight: 1, min: 1, max: 1 },
    { id: 91010, name: 'Bandos boots', weight: 1, min: 1, max: 1 },
    { id: 91003, name: 'Bandos hilt', weight: 1, min: 1, max: 1 },
    { id: 91005, name: 'Godsword blade', weight: 1, min: 1, max: 1 },
    { id: 101, name: 'Coins', weight: 5, min: 15000, max: 40000 },
  ],
}, 82002, 'General Graardor Jr.', 'A tiny Graardor. Stomps around angrily.');

// Kree'arra (Armadyl) — ranged attacks, aviansie, must use ranged to fight
boss('kreearra', {
  name: "Kree'arra", combat: 580, maxHp: 255, maxHit: 26,
  stats: { attack: 240, strength: 220, defence: 240 },
  attackSpeed: 3, attackRange: 8, attackStyle: 'ranged', size: 3,
  aggressive: true, aggroRange: 8, wanderRadius: 0, respawnTicks: 80,
  examine: 'Armadyl\'s general. Flies. Must use ranged or magic to attack.',
  weakness: 'magic', tags: ['boss', 'godwars'], resistance: 'melee',
}, {
  always: [{ id: 107, name: 'Dragon bones', min: 1, max: 1 }],
  main: [
    { id: 26006, name: 'Armadyl chestplate', weight: 1, min: 1, max: 1 },
    { id: 26007, name: 'Armadyl chainskirt', weight: 1, min: 1, max: 1 },
    { id: 91011, name: 'Armadyl helmet', weight: 1, min: 1, max: 1 },
    { id: 91004, name: 'Armadyl hilt', weight: 1, min: 1, max: 1 },
    { id: 91005, name: 'Godsword blade', weight: 1, min: 1, max: 1 },
    { id: 26008, name: 'Armadyl crossbow', weight: 1, min: 1, max: 1 },
    { id: 101, name: 'Coins', weight: 5, min: 10000, max: 30000 },
  ],
}, 82003, "Kree'arra Jr.", 'A tiny aviansie. Chirps angrily.');

// K'ril Tsutsaroth (Zamorak) — melee + magic special, poison, prayer drain
boss('kril_tsutsaroth', {
  name: "K'ril Tsutsaroth", combat: 650, maxHp: 255, maxHit: 30,
  stats: { attack: 260, strength: 260, defence: 230 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee', size: 3,
  aggressive: true, aggroRange: 6, wanderRadius: 0, respawnTicks: 80,
  examine: 'A greater demon general of Zamorak. Drains prayer.',
  weakness: 'slash', tags: ['boss', 'godwars', 'demon'], resistance: 'magic',
  poisonDamage: 6,
}, {
  always: [{ id: 107, name: 'Dragon bones', min: 1, max: 1 }],
  main: [
    { id: 91009, name: 'Zamorak spear', weight: 1, min: 1, max: 1 },
    { id: 91002, name: 'Zamorak hilt', weight: 1, min: 1, max: 1 },
    { id: 91005, name: 'Godsword blade', weight: 1, min: 1, max: 1 },
    { id: 101, name: 'Coins', weight: 5, min: 12000, max: 35000 },
    { id: 11358, name: 'Blood rune', weight: 3, min: 50, max: 150 },
  ],
}, 82004, "K'ril Jr.", 'A tiny demon general. Still terrifying.');

// ══════════════════════════════════════════════════════════════════════════════
// MID-GAME BOSSES — fill the level 80-120 gap
// ══════════════════════════════════════════════════════════════════════════════

// Zulrah — the profit snake. 2 styles required (ranged + magic switching)
items.define({ id: 91101, name: 'Tanzanite fang', examine: 'Attach to a blowpipe for the toxic blowpipe.', value: 2000000, category: 'crafting', weight: 0.5 });
items.define({ id: 91102, name: 'Magic fang', examine: 'Attach to a trident for the trident of the swamp.', value: 1500000, category: 'crafting', weight: 0.5 });
items.define({ id: 91103, name: 'Serpentine visage', examine: 'Attach to a helm for the serpentine helm (already exists).', value: 1000000, category: 'crafting', weight: 0.5 });
items.define({ id: 91104, name: 'Trident of the swamp', examine: 'An upgraded trident. Built-in venom spell.', value: 3000000, category: 'weapon', equipSlot: 'weapon', speed: 4, stats: { magic: 25, magic_strength: 20 }, equipReqs: { magic: 78 } });
items.define({ id: 91105, name: 'Zulrah scales', examine: 'Scales used to charge Zulrah weapons.', value: 100, category: 'misc', stackable: true, weight: 0 });

boss('zulrah', {
  name: 'Zulrah', combat: 725, maxHp: 500, maxHit: 35,
  stats: { attack: 300, strength: 280, defence: 250 },
  attackSpeed: 4, attackRange: 8, attackStyle: 'magic', size: 3,
  aggressive: true, aggroRange: 8, wanderRadius: 0, respawnTicks: 50,
  examine: 'A giant serpent that changes combat styles. Bring ranged AND magic.',
  weakness: 'ranged', tags: ['beast', 'boss'],
  // Mechanic: rotates between green (ranged), blue (magic), red (melee) forms
  // Green: weak to ranged, attacks with ranged
  // Blue: weak to magic, attacks with magic
  // Red: weak to melee, attacks with melee (but stands in poison)
}, {
  always: [{ id: 91105, name: 'Zulrah scales', min: 100, max: 300 }],
  main: [
    { id: 101, name: 'Coins', weight: 5, min: 20000, max: 60000 },
    { id: 11359, name: 'Nature rune', weight: 3, min: 50, max: 150 },
    { id: 11357, name: 'Death rune', weight: 3, min: 100, max: 200 },
    { id: 2306, name: 'Raw shark', weight: 3, min: 10, max: 30 },
    { id: 12013, name: 'Grimy torstol', weight: 2, min: 3, max: 6 },
  ],
  tertiary: [
    { id: 91101, name: 'Tanzanite fang', chance: 512, min: 1, max: 1 },
    { id: 91102, name: 'Magic fang', chance: 512, min: 1, max: 1 },
    { id: 91103, name: 'Serpentine visage', chance: 512, min: 1, max: 1 },
  ],
}, 82005, 'Snakeling', 'A tiny Zulrah. Hisses softly.');

// Vorkath — the undead dragon. Requires DS2 quest. High GP/hr boss.
items.define({ id: 91201, name: "Vorkath's head", examine: "The head of Vorkath. Can be mounted or used for upgrades.", value: 500000, category: 'misc', weight: 3 });
items.define({ id: 91202, name: 'Dragonbone necklace', examine: 'A necklace made of dragon bones. Restores prayer when burying bones.', value: 600000, category: 'jewellery', equipSlot: 'neck', stats: { prayer: 12 }, equipReqs: {} });
items.define({ id: 91203, name: 'Skeletal visage', examine: 'A visage from an undead dragon. Make a dragonfire ward.', value: 3000000, category: 'crafting', weight: 2 });
items.define({ id: 91204, name: 'Dragonfire ward', examine: 'A ward that protects from dragonfire. BIS magic shield with dragon protection.', value: 5000000, category: 'armour', equipSlot: 'shield', stats: { magic: 5, def_stab: 10, def_slash: 12, def_crush: 10, def_magic: 15, def_ranged: 10 }, equipReqs: { defence: 70, magic: 70 } });

boss('vorkath', {
  name: 'Vorkath', combat: 732, maxHp: 750, maxHit: 32,
  stats: { attack: 320, strength: 300, defence: 280 },
  attackSpeed: 5, attackRange: 6, attackStyle: 'magic', size: 4,
  aggressive: true, aggroRange: 8, wanderRadius: 0, respawnTicks: 50,
  examine: 'An undead dragon reanimated by dark magic. Breathes multiple dragonfire types.',
  weakness: 'stab', tags: ['dragon', 'undead', 'boss'], resistance: 'magic',
  // Mechanic: switches between regular, venom, and freezing dragonfire
  // Acid phase: floor fills with acid pools, must walk to avoid damage
  // Zombie spawn: spawns a zombie that must be killed immediately or instant-kills you
}, {
  always: [{ id: 107, name: 'Dragon bones', min: 2, max: 2 }],
  main: [
    { id: 101, name: 'Coins', weight: 4, min: 30000, max: 80000 },
    { id: 2116, name: 'Runite bar', weight: 3, min: 3, max: 6 },
    { id: 20012, name: 'Dragon platelegs', weight: 1, min: 1, max: 1 },
    { id: 11357, name: 'Death rune', weight: 3, min: 100, max: 300 },
    { id: 12505, name: 'Uncut dragonstone', weight: 2, min: 2, max: 4 },
  ],
  tertiary: [
    { id: 91201, name: "Vorkath's head", chance: 50, min: 1, max: 1 },
    { id: 91202, name: 'Dragonbone necklace', chance: 1000, min: 1, max: 1 },
    { id: 91203, name: 'Skeletal visage', chance: 5000, min: 1, max: 1 },
  ],
}, 82006, 'Vorki', 'A tiny undead dragon. Still breathes fire.');

// Corporeal Beast — the highest HP boss. Requires team or special strategy.
items.define({ id: 91301, name: 'Spectral sigil', examine: 'Attach to a spirit shield. Reduces prayer drain from magic.', value: 5000000, category: 'crafting', weight: 0.5 });
items.define({ id: 91302, name: 'Arcane sigil', examine: 'Attach to a spirit shield. BIS magic shield.', value: 10000000, category: 'crafting', weight: 0.5 });
items.define({ id: 91303, name: 'Elysian sigil', examine: 'Attach to a spirit shield. 70% chance to reduce damage by 25%.', value: 30000000, category: 'crafting', weight: 0.5 });
items.define({ id: 91304, name: 'Arcane spirit shield', examine: 'BIS magic offhand. +20 magic accuracy.', value: 15000000, category: 'armour', equipSlot: 'shield', stats: { magic: 20, def_stab: 41, def_slash: 44, def_crush: 43, def_magic: 5, def_ranged: 41, prayer: 3 }, equipReqs: { defence: 75, prayer: 70, magic: 65 } });
items.define({ id: 91305, name: 'Elysian spirit shield', examine: 'The rarest shield. 70% chance to reduce incoming damage by 25%.', value: 50000000, category: 'armour', equipSlot: 'shield', stats: { def_stab: 41, def_slash: 44, def_crush: 43, def_magic: 2, def_ranged: 41, prayer: 3 }, equipReqs: { defence: 75, prayer: 70 } });
items.define({ id: 91306, name: 'Holy elixir', examine: 'Used to bless a spirit shield.', value: 500000, category: 'crafting', weight: 0.3 });

boss('corporeal_beast', {
  name: 'Corporeal Beast', combat: 785, maxHp: 2000, maxHit: 51,
  stats: { attack: 350, strength: 350, defence: 300 },
  attackSpeed: 4, attackRange: 6, attackStyle: 'magic', size: 5,
  aggressive: true, aggroRange: 8, wanderRadius: 0, respawnTicks: 120,
  examine: 'A beast from another dimension. 2000 HP. Bring friends.',
  weakness: 'stab', tags: ['beast', 'boss'], resistance: 'melee',
  // Mechanic: ONLY takes full damage from spears/halberds
  // All other weapons do half damage
  // Dark core: spawns a dark core that heals Corp and damages players
  // Stomp: deals massive melee damage in 3x3 area
}, {
  always: [{ id: 107, name: 'Dragon bones', min: 3, max: 3 }],
  main: [
    { id: 101, name: 'Coins', weight: 3, min: 50000, max: 150000 },
    { id: 45033, name: 'Spirit shield', weight: 2, min: 1, max: 1 },
    { id: 91306, name: 'Holy elixir', weight: 2, min: 1, max: 1 },
    { id: 11363, name: 'Soul rune', weight: 3, min: 50, max: 150 },
  ],
  tertiary: [
    { id: 91301, name: 'Spectral sigil', chance: 1365, min: 1, max: 1 },
    { id: 91302, name: 'Arcane sigil', chance: 1365, min: 1, max: 1 },
    { id: 91303, name: 'Elysian sigil', chance: 4095, min: 1, max: 1 },
  ],
}, 82007, 'Dark core pet', 'A tiny dark core. Orbits your head.');

// Nightmare — group boss in Inkweald. Drops BIS mage weapons.
items.define({ id: 91401, name: 'Nightmare staff', examine: 'A staff from the Nightmare. Can be imbued with orbs.', value: 3000000, category: 'weapon', equipSlot: 'weapon', speed: 4, stats: { magic: 22, magic_strength: 15, crush: 10 }, equipReqs: { magic: 72 } });
items.define({ id: 91402, name: 'Harmonised orb', examine: 'Imbue the Nightmare staff for 1-tick standard spells.', value: 20000000, category: 'crafting', weight: 0.3 });
items.define({ id: 91403, name: 'Volatile orb', examine: 'Imbue the Nightmare staff for high max hit special.', value: 10000000, category: 'crafting', weight: 0.3 });
items.define({ id: 91404, name: 'Eldritch orb', examine: 'Imbue the Nightmare staff to restore prayer on special.', value: 8000000, category: 'crafting', weight: 0.3 });
items.define({ id: 91405, name: "Inquisitor's mace", examine: 'BIS crush weapon. Especially good against armoured targets.', value: 5000000, category: 'weapon', equipSlot: 'weapon', speed: 4, stats: { crush: 95, melee_strength: 89, prayer: 2 }, equipReqs: { attack: 75 } });
items.define({ id: 91406, name: "Inquisitor's hauberk", examine: 'Crush-focused armour. BIS for crush attack.', value: 4000000, category: 'armour', equipSlot: 'body', stats: { crush: 4, melee_strength: 2, def_stab: 67, def_slash: 60, def_crush: 72, def_ranged: 52 }, equipReqs: { defence: 70, strength: 70 } });
items.define({ id: 91407, name: "Inquisitor's plateskirt", examine: 'Crush-focused legs.', value: 3000000, category: 'armour', equipSlot: 'legs', stats: { crush: 2, melee_strength: 1, def_stab: 40, def_slash: 33, def_crush: 42, def_ranged: 30 }, equipReqs: { defence: 70, strength: 70 } });
items.define({ id: 91408, name: "Inquisitor's great helm", examine: 'Crush-focused helm.', value: 2000000, category: 'armour', equipSlot: 'head', stats: { crush: 2, melee_strength: 1, def_stab: 22, def_slash: 20, def_crush: 25, def_ranged: 18 }, equipReqs: { defence: 70, strength: 70 } });

boss('the_nightmare', {
  name: 'The Nightmare', combat: 814, maxHp: 2400, maxHit: 40,
  stats: { attack: 300, strength: 280, defence: 350 },
  attackSpeed: 5, attackRange: 8, attackStyle: 'magic', size: 5,
  aggressive: true, aggroRange: 10, wanderRadius: 0, respawnTicks: 150,
  examine: 'A being from the dream world that feeds on nightmares. Requires 5+ players.',
  weakness: 'crush', tags: ['spirit', 'boss'], resistance: 'ranged',
  // Mechanic: 4 totems that must be charged by players during phases
  // Sleepwalkers phase: kill sleepwalkers before they reach the boss (heals it)
  // Parasite: plants parasites on players — must be healed to remove
  // Grasping claws: AoE that pulls players toward the boss
}, {
  always: [{ id: 107, name: 'Dragon bones', min: 2, max: 2 }],
  main: [
    { id: 101, name: 'Coins', weight: 4, min: 40000, max: 120000 },
    { id: 11363, name: 'Soul rune', weight: 3, min: 50, max: 150 },
    { id: 9004, name: 'Nightmare shard', weight: 5, min: 3, max: 8 },
  ],
  tertiary: [
    { id: 91401, name: 'Nightmare staff', chance: 400, min: 1, max: 1 },
    { id: 91402, name: 'Harmonised orb', chance: 1600, min: 1, max: 1 },
    { id: 91403, name: 'Volatile orb', chance: 1600, min: 1, max: 1 },
    { id: 91404, name: 'Eldritch orb', chance: 1600, min: 1, max: 1 },
    { id: 91405, name: "Inquisitor's mace", chance: 600, min: 1, max: 1 },
    { id: 91406, name: "Inquisitor's hauberk", chance: 600, min: 1, max: 1 },
    { id: 91407, name: "Inquisitor's plateskirt", chance: 600, min: 1, max: 1 },
    { id: 91408, name: "Inquisitor's great helm", chance: 600, min: 1, max: 1 },
  ],
}, 82008, 'Little nightmare', 'A tiny Nightmare. Induces bad dreams.');

// Dagannoth Kings — 3 kings, each uses 1 combat style, drops BIS rings
boss('dagannoth_rex', {
  name: 'Dagannoth Rex', combat: 303, maxHp: 255, maxHit: 26,
  stats: { attack: 180, strength: 180, defence: 100 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee', size: 3,
  aggressive: true, aggroRange: 6, wanderRadius: 0, respawnTicks: 60,
  examine: 'The melee Dagannoth King. Weak to magic.',
  weakness: 'magic', tags: ['beast', 'boss'], resistance: 'ranged',
}, {
  always: [{ id: 106, name: 'Big bones', min: 1, max: 1 }],
  main: [{ id: 101, name: 'Coins', weight: 5, min: 5000, max: 20000 }],
  tertiary: [{ id: 24001, name: 'Berserker ring', chance: 128, min: 1, max: 1 }],
}, 82009, 'Dagannoth Rex pet', 'A tiny melee king.');

boss('dagannoth_prime', {
  name: 'Dagannoth Prime', combat: 303, maxHp: 255, maxHit: 42,
  stats: { attack: 200, strength: 150, defence: 120 },
  attackSpeed: 4, attackRange: 8, attackStyle: 'magic', size: 3,
  aggressive: true, aggroRange: 8, wanderRadius: 0, respawnTicks: 60,
  examine: 'The magic Dagannoth King. Weak to ranged.',
  weakness: 'ranged', tags: ['beast', 'boss'], resistance: 'melee',
}, {
  always: [{ id: 106, name: 'Big bones', min: 1, max: 1 }],
  main: [{ id: 101, name: 'Coins', weight: 5, min: 5000, max: 20000 }],
  tertiary: [{ id: 24003, name: 'Seers ring', chance: 128, min: 1, max: 1 }],
}, 82010, 'Dagannoth Prime pet', 'A tiny magic king.');

boss('dagannoth_supreme', {
  name: 'Dagannoth Supreme', combat: 303, maxHp: 255, maxHit: 26,
  stats: { attack: 200, strength: 150, defence: 130 },
  attackSpeed: 4, attackRange: 8, attackStyle: 'ranged', size: 3,
  aggressive: true, aggroRange: 8, wanderRadius: 0, respawnTicks: 60,
  examine: 'The ranged Dagannoth King. Weak to melee.',
  weakness: 'crush', tags: ['beast', 'boss'], resistance: 'magic',
}, {
  always: [{ id: 106, name: 'Big bones', min: 1, max: 1 }],
  main: [{ id: 101, name: 'Coins', weight: 5, min: 5000, max: 20000 }],
  tertiary: [{ id: 24002, name: 'Archers ring', chance: 128, min: 1, max: 1 }],
}, 82011, 'Dagannoth Supreme pet', 'A tiny ranged king.');

// Giant Mole — easy boss, introduces bossing to new players
boss('giant_mole', {
  name: 'Giant Mole', combat: 230, maxHp: 200, maxHit: 21,
  stats: { attack: 140, strength: 140, defence: 120 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee', size: 3,
  aggressive: true, aggroRange: 5, wanderRadius: 0, respawnTicks: 50,
  examine: 'A massive mole. Burrows away when hurt. Annoying but profitable.',
  weakness: 'slash', tags: ['beast', 'boss'],
  // Mechanic: burrows underground at 50% HP, reappears in random location
}, {
  always: [{ id: 106, name: 'Big bones', min: 1, max: 1 }],
  main: [
    { id: 101, name: 'Coins', weight: 5, min: 5000, max: 15000 },
    { id: 12005, name: 'Grimy ranarr', weight: 3, min: 2, max: 4 },
    { id: 12414, name: 'Ranarr seed', weight: 1, min: 1, max: 2 },
  ],
}, 82012, 'Baby mole', 'A tiny mole. Digs little holes.');

// Kalphite Queen — 2 phases (melee phase then magic phase), BIS ring drop
items.define({ id: 91501, name: 'Dragon chain', examine: 'A dragon chainbody. Rare and prestigious.', value: 3000000, category: 'armour', equipSlot: 'body', stats: { def_stab: 81, def_slash: 93, def_crush: 83, def_ranged: 78 }, equipReqs: { defence: 60 } });

boss('kalphite_queen', {
  name: 'Kalphite Queen', combat: 333, maxHp: 255, maxHit: 31,
  stats: { attack: 220, strength: 210, defence: 200 },
  attackSpeed: 4, attackRange: 4, attackStyle: 'melee', size: 3,
  aggressive: true, aggroRange: 6, wanderRadius: 0, respawnTicks: 80,
  examine: 'Queen of the kalphites. Phase 1: melee (pray ranged). Phase 2: airborne (pray magic).',
  weakness: 'crush', tags: ['beast', 'boss', 'armoured'],
  // Phase 1: crawling, melee+ranged, immune to magic. Use crush.
  // Phase 2: flying, magic+ranged, immune to melee. Use ranged.
}, {
  always: [{ id: 107, name: 'Dragon bones', min: 1, max: 1 }],
  main: [
    { id: 91501, name: 'Dragon chain', weight: 1, min: 1, max: 1 },
    { id: 101, name: 'Coins', weight: 5, min: 5000, max: 20000 },
  ],
  tertiary: [{ id: 24006, name: 'Brimstone ring', chance: 400, min: 1, max: 1 }],
}, 82013, 'Kalphite princess', 'A tiny kalphite queen. Clicks her mandibles.');

console.log('[aelgard] 12 expanded bosses loaded (God Wars 4 + Zulrah + Vorkath + Corp + Nightmare + DKs 3 + Mole + KQ)');
