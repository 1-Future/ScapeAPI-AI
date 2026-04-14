// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — The Heartlands (starter region)
// Medieval kingdom, safe, tutorial-friendly. Goblins, guards, guilds, a river.
// ══════════════════════════════════════════════════════════════════════════════

const items = require('../../data/items');
const npcs = require('../../world/npcs');
const shops = require('../../data/shops');
const quests = require('../../data/quests');
const droptables = require('../../data/droptables');

// ── Items: Bronze tier ─────────────────────────────────────────────────────

items.define({ id: 1001, name: 'Bronze sword', examine: 'A basic bronze sword.', value: 26, category: 'weapon', equipSlot: 'weapon', speed: 4, stats: { slash: 7, melee_strength: 6 }, equipReqs: { attack: 1 } });
items.define({ id: 1002, name: 'Bronze scimitar', examine: 'A curved bronze blade.', value: 32, category: 'weapon', equipSlot: 'weapon', speed: 4, stats: { slash: 9, melee_strength: 7 }, equipReqs: { attack: 1 } });
items.define({ id: 1003, name: 'Bronze dagger', examine: 'Short but pointy.', value: 18, category: 'weapon', equipSlot: 'weapon', speed: 4, stats: { stab: 5, melee_strength: 4 }, equipReqs: { attack: 1 } });
items.define({ id: 1004, name: 'Bronze axe', examine: 'A small bronze hatchet.', value: 16, category: 'weapon', equipSlot: 'weapon', speed: 5, stats: { slash: 5, melee_strength: 4 }, equipReqs: { attack: 1 } });
items.define({ id: 1005, name: 'Bronze pickaxe', examine: 'Used to mine ore.', value: 18, category: 'weapon', equipSlot: 'weapon', speed: 5, stats: { stab: 4, melee_strength: 3 }, equipReqs: { attack: 1 } });
items.define({ id: 1010, name: 'Bronze full helm', examine: 'A full face bronze helmet.', value: 44, category: 'armour', equipSlot: 'head', stats: { def_stab: 4, def_slash: 5, def_crush: 3 }, equipReqs: { defence: 1 } });
items.define({ id: 1011, name: 'Bronze platebody', examine: 'Provides some protection.', value: 160, category: 'armour', equipSlot: 'body', stats: { def_stab: 15, def_slash: 14, def_crush: 9 }, equipReqs: { defence: 1 } });
items.define({ id: 1012, name: 'Bronze platelegs', examine: 'Bronze leg armour.', value: 80, category: 'armour', equipSlot: 'legs', stats: { def_stab: 7, def_slash: 6, def_crush: 5 }, equipReqs: { defence: 1 } });
items.define({ id: 1013, name: 'Bronze kiteshield', examine: 'A bronze shield.', value: 54, category: 'armour', equipSlot: 'shield', stats: { def_stab: 5, def_slash: 7, def_crush: 6 }, equipReqs: { defence: 1 } });

// ── Items: Iron tier ───────────────────────────────────────────────────────

items.define({ id: 1101, name: 'Iron sword', examine: 'A sturdy iron sword.', value: 56, category: 'weapon', equipSlot: 'weapon', speed: 4, stats: { slash: 10, melee_strength: 9 }, equipReqs: { attack: 1 } });
items.define({ id: 1102, name: 'Iron scimitar', examine: 'A sharp curved blade.', value: 70, category: 'weapon', equipSlot: 'weapon', speed: 4, stats: { slash: 14, melee_strength: 10 }, equipReqs: { attack: 1 } });
items.define({ id: 1110, name: 'Iron full helm', examine: 'A full face iron helmet.', value: 92, category: 'armour', equipSlot: 'head', stats: { def_stab: 6, def_slash: 7, def_crush: 5 }, equipReqs: { defence: 1 } });
items.define({ id: 1111, name: 'Iron platebody', examine: 'Provides decent protection.', value: 336, category: 'armour', equipSlot: 'body', stats: { def_stab: 21, def_slash: 20, def_crush: 13 }, equipReqs: { defence: 1 } });
items.define({ id: 1112, name: 'Iron platelegs', examine: 'Iron leg armour.', value: 168, category: 'armour', equipSlot: 'legs', stats: { def_stab: 10, def_slash: 9, def_crush: 7 }, equipReqs: { defence: 1 } });

// ── Items: Steel tier ──────────────────────────────────────────────────────

items.define({ id: 1201, name: 'Steel sword', examine: 'A steel sword.', value: 130, category: 'weapon', equipSlot: 'weapon', speed: 4, stats: { slash: 15, melee_strength: 14 }, equipReqs: { attack: 5 } });
items.define({ id: 1202, name: 'Steel scimitar', examine: 'A steel curved blade.', value: 160, category: 'weapon', equipSlot: 'weapon', speed: 4, stats: { slash: 19, melee_strength: 14 }, equipReqs: { attack: 5 } });
items.define({ id: 1210, name: 'Steel full helm', examine: 'A steel helmet.', value: 220, category: 'armour', equipSlot: 'head', stats: { def_stab: 9, def_slash: 10, def_crush: 7 }, equipReqs: { defence: 5 } });
items.define({ id: 1211, name: 'Steel platebody', examine: 'A steel platebody.', value: 800, category: 'armour', equipSlot: 'body', stats: { def_stab: 30, def_slash: 29, def_crush: 19 }, equipReqs: { defence: 5 } });
items.define({ id: 1212, name: 'Steel platelegs', examine: 'Steel leg armour.', value: 400, category: 'armour', equipSlot: 'legs', stats: { def_stab: 14, def_slash: 13, def_crush: 10 }, equipReqs: { defence: 5 } });

// ── Items: Mithril tier ────────────────────────────────────────────────────

items.define({ id: 1301, name: 'Mithril sword', examine: 'A mithril sword.', value: 390, category: 'weapon', equipSlot: 'weapon', speed: 4, stats: { slash: 21, melee_strength: 20 }, equipReqs: { attack: 20 } });
items.define({ id: 1302, name: 'Mithril scimitar', examine: 'A mithril scimitar.', value: 480, category: 'weapon', equipSlot: 'weapon', speed: 4, stats: { slash: 25, melee_strength: 21 }, equipReqs: { attack: 20 } });
items.define({ id: 1310, name: 'Mithril full helm', examine: 'A mithril helmet.', value: 660, category: 'armour', equipSlot: 'head', stats: { def_stab: 13, def_slash: 14, def_crush: 10 }, equipReqs: { defence: 20 } });
items.define({ id: 1311, name: 'Mithril platebody', examine: 'A mithril platebody.', value: 2400, category: 'armour', equipSlot: 'body', stats: { def_stab: 41, def_slash: 40, def_crush: 28 }, equipReqs: { defence: 20 } });

// ── Items: Adamant tier ────────────────────────────────────────────────────

items.define({ id: 1401, name: 'Adamant sword', examine: 'An adamantite sword.', value: 960, category: 'weapon', equipSlot: 'weapon', speed: 4, stats: { slash: 29, melee_strength: 28 }, equipReqs: { attack: 30 } });
items.define({ id: 1402, name: 'Adamant scimitar', examine: 'An adamant scimitar.', value: 1200, category: 'weapon', equipSlot: 'weapon', speed: 4, stats: { slash: 33, melee_strength: 28 }, equipReqs: { attack: 30 } });
items.define({ id: 1410, name: 'Adamant full helm', examine: 'An adamant helmet.', value: 1632, category: 'armour', equipSlot: 'head', stats: { def_stab: 19, def_slash: 21, def_crush: 16 }, equipReqs: { defence: 30 } });
items.define({ id: 1411, name: 'Adamant platebody', examine: 'An adamant platebody.', value: 5920, category: 'armour', equipSlot: 'body', stats: { def_stab: 57, def_slash: 55, def_crush: 40 }, equipReqs: { defence: 30 } });

// ── Items: Rune tier ───────────────────────────────────────────────────────

items.define({ id: 1501, name: 'Rune sword', examine: 'A magical sword made of runite.', value: 12480, category: 'weapon', equipSlot: 'weapon', speed: 4, stats: { slash: 38, melee_strength: 39 }, equipReqs: { attack: 40 } });
items.define({ id: 1502, name: 'Rune scimitar', examine: 'A rune scimitar.', value: 15360, category: 'weapon', equipSlot: 'weapon', speed: 4, stats: { slash: 45, melee_strength: 44 }, equipReqs: { attack: 40 } });
items.define({ id: 1510, name: 'Rune full helm', examine: 'A rune full helm.', value: 20800, category: 'armour', equipSlot: 'head', stats: { def_stab: 30, def_slash: 32, def_crush: 27 }, equipReqs: { defence: 40 } });
items.define({ id: 1511, name: 'Rune platebody', examine: 'A rune platebody.', value: 65000, category: 'armour', equipSlot: 'body', stats: { def_stab: 82, def_slash: 80, def_crush: 72 }, equipReqs: { defence: 40 } });
items.define({ id: 1512, name: 'Rune platelegs', examine: 'Rune leg armour.', value: 38400, category: 'armour', equipSlot: 'legs', stats: { def_stab: 51, def_slash: 49, def_crush: 47 }, equipReqs: { defence: 40 } });

// ── Items: Food ────────────────────────────────────────────────────────────

items.define({ id: 2001, name: 'Bread', examine: 'A loaf of bread.', value: 12, category: 'food', weight: 0.4 });
items.define({ id: 2002, name: 'Cooked meat', examine: 'Nicely cooked meat.', value: 4, category: 'food', weight: 0.5 });
items.define({ id: 2003, name: 'Cooked chicken', examine: 'Tasty chicken.', value: 4, category: 'food', weight: 0.5 });
items.define({ id: 2004, name: 'Trout', examine: 'A cooked trout.', value: 20, category: 'food', weight: 0.4 });
items.define({ id: 2005, name: 'Salmon', examine: 'A cooked salmon.', value: 40, category: 'food', weight: 0.4 });
items.define({ id: 2006, name: 'Lobster', examine: 'A cooked lobster.', value: 150, category: 'food', weight: 0.4 });
items.define({ id: 2007, name: 'Swordfish', examine: 'A cooked swordfish.', value: 200, category: 'food', weight: 0.4 });
items.define({ id: 2008, name: 'Shark', examine: 'A cooked shark.', value: 500, category: 'food', weight: 0.4 });

// ── Items: Ores & bars ─────────────────────────────────────────────────────

items.define({ id: 2101, name: 'Copper ore', examine: 'Unrefined copper.', value: 4, category: 'mining', weight: 2 });
items.define({ id: 2102, name: 'Tin ore', examine: 'Unrefined tin.', value: 4, category: 'mining', weight: 2 });
items.define({ id: 2103, name: 'Iron ore', examine: 'Unrefined iron.', value: 17, category: 'mining', weight: 2 });
items.define({ id: 2104, name: 'Coal', examine: 'A lump of coal.', value: 45, category: 'mining', weight: 2 });
items.define({ id: 2105, name: 'Mithril ore', examine: 'Mithril ore.', value: 162, category: 'mining', weight: 2 });
items.define({ id: 2106, name: 'Adamantite ore', examine: 'Adamantite ore.', value: 400, category: 'mining', weight: 2 });
items.define({ id: 2107, name: 'Runite ore', examine: 'Runite ore.', value: 6400, category: 'mining', weight: 2 });
items.define({ id: 2111, name: 'Bronze bar', examine: 'A bronze bar.', value: 8, category: 'smithing', weight: 1.8 });
items.define({ id: 2112, name: 'Iron bar', examine: 'An iron bar.', value: 34, category: 'smithing', weight: 1.8 });
items.define({ id: 2113, name: 'Steel bar', examine: 'A steel bar.', value: 100, category: 'smithing', weight: 1.8 });
items.define({ id: 2114, name: 'Mithril bar', examine: 'A mithril bar.', value: 300, category: 'smithing', weight: 1.8 });
items.define({ id: 2115, name: 'Adamantite bar', examine: 'An adamantite bar.', value: 1600, category: 'smithing', weight: 1.8 });
items.define({ id: 2116, name: 'Runite bar', examine: 'A runite bar.', value: 12800, category: 'smithing', weight: 1.8 });

// ── Items: Logs ────────────────────────────────────────────────────────────

items.define({ id: 2201, name: 'Logs', examine: 'Some logs.', value: 1, category: 'woodcutting', weight: 2 });
items.define({ id: 2202, name: 'Oak logs', examine: 'Oak logs.', value: 10, category: 'woodcutting', weight: 2 });
items.define({ id: 2203, name: 'Willow logs', examine: 'Willow logs.', value: 20, category: 'woodcutting', weight: 2 });
items.define({ id: 2204, name: 'Maple logs', examine: 'Maple logs.', value: 40, category: 'woodcutting', weight: 2 });
items.define({ id: 2205, name: 'Yew logs', examine: 'Yew logs.', value: 160, category: 'woodcutting', weight: 2 });
items.define({ id: 2206, name: 'Magic logs', examine: 'Enchanted logs.', value: 600, category: 'woodcutting', weight: 2 });

// ── Items: Fish (raw) ──────────────────────────────────────────────────────

items.define({ id: 2301, name: 'Raw shrimps', examine: 'Some raw shrimps.', value: 1, category: 'fishing', weight: 0.3 });
items.define({ id: 2302, name: 'Raw trout', examine: 'A raw trout.', value: 10, category: 'fishing', weight: 0.4 });
items.define({ id: 2303, name: 'Raw salmon', examine: 'A raw salmon.', value: 20, category: 'fishing', weight: 0.4 });
items.define({ id: 2304, name: 'Raw lobster', examine: 'A raw lobster.', value: 80, category: 'fishing', weight: 0.4 });
items.define({ id: 2305, name: 'Raw swordfish', examine: 'A raw swordfish.', value: 100, category: 'fishing', weight: 0.4 });
items.define({ id: 2306, name: 'Raw shark', examine: 'A raw shark.', value: 250, category: 'fishing', weight: 0.4 });

// ── Items: Misc quest / world items ────────────────────────────────────────

items.define({ id: 3001, name: 'Goblin mail', examine: 'Small, greasy chain mail.', value: 5, category: 'quest' });
items.define({ id: 3002, name: 'Patrol orders', examine: 'Written orders from Captain Alden.', value: 0, category: 'quest', tradeable: false });
items.define({ id: 3003, name: 'Heartlands map', examine: 'A rough map of the Heartlands region.', value: 0, category: 'quest', tradeable: false });

// ══════════════════════════════════════════════════════════════════════════════
// MONSTERS — Heartlands
// ══════════════════════════════════════════════════════════════════════════════

npcs.defineNpc('chicken', {
  name: 'Chicken', combat: 1, maxHp: 3, maxHit: 1,
  stats: { attack: 1, strength: 1, defence: 1 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee',
  aggressive: false, wanderRadius: 3, respawnTicks: 25,
  examine: 'Cluck cluck.',
  weakness: 'slash', // anything kills a chicken, but slash is technically best
});

npcs.defineNpc('cow', {
  name: 'Cow', combat: 2, maxHp: 8, maxHit: 1,
  stats: { attack: 1, strength: 1, defence: 1 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee',
  aggressive: false, wanderRadius: 5, respawnTicks: 30,
  examine: 'A domesticated bovine.',
  weakness: 'slash',
});

npcs.defineNpc('goblin', {
  name: 'Goblin', combat: 5, maxHp: 5, maxHit: 2,
  stats: { attack: 1, strength: 1, defence: 1 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee',
  aggressive: true, aggroRange: 3, wanderRadius: 4, respawnTicks: 30,
  examine: 'An ugly green creature.',
  weakness: 'slash', // light armour, weak to blades
});

npcs.defineNpc('goblin_warrior', {
  name: 'Goblin Warrior', combat: 13, maxHp: 14, maxHit: 3,
  stats: { attack: 7, strength: 6, defence: 5 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee',
  aggressive: true, aggroRange: 4, wanderRadius: 5, respawnTicks: 40,
  examine: 'A goblin with slightly better armour.',
  weakness: 'crush', // armoured — crush beats plate
  resistance: 'magic', // too dumb to care about spells but armour blocks
});

npcs.defineNpc('giant_rat', {
  name: 'Giant rat', combat: 6, maxHp: 8, maxHit: 2,
  stats: { attack: 2, strength: 2, defence: 2 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee',
  aggressive: true, aggroRange: 3, wanderRadius: 4, respawnTicks: 30,
  examine: 'Eek!',
  weakness: 'stab', // small and quick, stab catches them
});

npcs.defineNpc('giant_spider', {
  name: 'Giant spider', combat: 8, maxHp: 10, maxHit: 2,
  stats: { attack: 3, strength: 3, defence: 3 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee',
  aggressive: true, aggroRange: 3, wanderRadius: 5, respawnTicks: 35,
  examine: 'Eight legs of fury.',
  poisonDamage: 1,
  weakness: 'crush', // exoskeleton — crush it
});

npcs.defineNpc('guard', {
  name: 'Guard', combat: 21, maxHp: 22, maxHit: 4,
  stats: { attack: 15, strength: 14, defence: 18 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee',
  aggressive: false, wanderRadius: 3, respawnTicks: 60,
  examine: 'A Heartlands guard.',
  weakness: 'stab', // heavy armour has gaps for stab
  resistance: 'ranged', // shield blocks projectiles
});

npcs.defineNpc('dark_wizard', {
  name: 'Dark wizard', combat: 20, maxHp: 19, maxHit: 5,
  stats: { attack: 10, strength: 8, defence: 6 },
  attackSpeed: 5, attackRange: 6, attackStyle: 'magic',
  aggressive: true, aggroRange: 4, wanderRadius: 3, respawnTicks: 50,
  examine: 'A wizard gone bad.',
  weakness: 'ranged', // robes offer no ranged defence, and you can shoot from outside spell range
  resistance: 'magic', // magic resist from enchantments
});

npcs.defineNpc('hill_giant', {
  name: 'Hill giant', combat: 28, maxHp: 35, maxHit: 5,
  stats: { attack: 18, strength: 20, defence: 12 },
  attackSpeed: 5, attackRange: 1, attackStyle: 'melee', size: 2,
  aggressive: true, aggroRange: 4, wanderRadius: 5, respawnTicks: 50,
  examine: 'A large and intimidating giant.',
  weakness: 'magic', // big and dumb, magic bypasses their thick skin
  resistance: 'melee', // too big to hurt much with a sword
});

npcs.defineNpc('moss_giant', {
  name: 'Moss giant', combat: 42, maxHp: 60, maxHit: 7,
  stats: { attack: 30, strength: 28, defence: 25 },
  attackSpeed: 5, attackRange: 1, attackStyle: 'melee', size: 2,
  aggressive: true, aggroRange: 5, wanderRadius: 4, respawnTicks: 60,
  examine: 'A giant covered in moss.',
  weakness: 'slash', // cut through the moss
  resistance: 'ranged', // arrows stick in moss without doing much
});

// ── Heartlands mini-boss ───────────────────────────────────────────────────

npcs.defineNpc('forgefather_duran', {
  name: 'Forgefather Duran', combat: 45, maxHp: 80, maxHit: 8,
  stats: { attack: 35, strength: 30, defence: 40 },
  attackSpeed: 5, attackRange: 1, attackStyle: 'melee', size: 2,
  aggressive: false, wanderRadius: 0, respawnTicks: 200,
  examine: 'A rogue smith wielding a burning hammer.',
  weakness: 'stab', // heavy armour, stab through the gaps
  resistance: 'ranged', // plate blocks arrows
  tags: ['armoured'],
});

// ══════════════════════════════════════════════════════════════════════════════
// DROP TABLES — Heartlands
// ══════════════════════════════════════════════════════════════════════════════

droptables.define('chicken', {
  always: [{ id: 100, name: 'Bones', min: 1, max: 1 }, { id: 105, name: 'Raw chicken', min: 1, max: 1 }],
  main: [{ id: 103, name: 'Feather', weight: 10, min: 5, max: 15 }],
});

droptables.define('cow', {
  always: [{ id: 100, name: 'Bones', min: 1, max: 1 }, { id: 102, name: 'Cowhide', min: 1, max: 1 }, { id: 103, name: 'Raw beef', min: 1, max: 1 }],
  main: [],
});

droptables.define('goblin', {
  always: [{ id: 100, name: 'Bones', min: 1, max: 1 }],
  main: [
    { id: 101, name: 'Coins', weight: 40, min: 1, max: 10 },
    { id: 1001, name: 'Bronze sword', weight: 5, min: 1, max: 1 },
    { id: 1003, name: 'Bronze dagger', weight: 5, min: 1, max: 1 },
    { id: 3001, name: 'Goblin mail', weight: 3, min: 1, max: 1 },
    { id: 0, name: 'Nothing', weight: 20, min: 0, max: 0 },
  ],
});

droptables.define('goblin_warrior', {
  always: [{ id: 100, name: 'Bones', min: 1, max: 1 }],
  main: [
    { id: 101, name: 'Coins', weight: 30, min: 5, max: 25 },
    { id: 1102, name: 'Iron scimitar', weight: 3, min: 1, max: 1 },
    { id: 1110, name: 'Iron full helm', weight: 3, min: 1, max: 1 },
    { id: 0, name: 'Nothing', weight: 15, min: 0, max: 0 },
  ],
});

droptables.define('giant_rat', {
  always: [{ id: 100, name: 'Bones', min: 1, max: 1 }],
  main: [
    { id: 101, name: 'Coins', weight: 30, min: 1, max: 5 },
    { id: 0, name: 'Nothing', weight: 30, min: 0, max: 0 },
  ],
});

droptables.define('hill_giant', {
  always: [{ id: 106, name: 'Big bones', min: 1, max: 1 }],
  main: [
    { id: 101, name: 'Coins', weight: 25, min: 10, max: 60 },
    { id: 1202, name: 'Steel scimitar', weight: 3, min: 1, max: 1 },
    { id: 1211, name: 'Steel platebody', weight: 1, min: 1, max: 1 },
    { id: 2103, name: 'Iron ore', weight: 5, min: 1, max: 1 },
    { id: 2001, name: 'Bread', weight: 8, min: 1, max: 1 },
    { id: 0, name: 'Nothing', weight: 10, min: 0, max: 0 },
  ],
});

droptables.define('moss_giant', {
  always: [{ id: 106, name: 'Big bones', min: 1, max: 1 }],
  main: [
    { id: 101, name: 'Coins', weight: 20, min: 20, max: 100 },
    { id: 1302, name: 'Mithril scimitar', weight: 2, min: 1, max: 1 },
    { id: 2104, name: 'Coal', weight: 5, min: 1, max: 1 },
    { id: 2105, name: 'Mithril ore', weight: 2, min: 1, max: 1 },
    { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 },
  ],
});

droptables.define('forgefather_duran', {
  always: [{ id: 106, name: 'Big bones', min: 1, max: 1 }],
  main: [
    { id: 101, name: 'Coins', weight: 15, min: 100, max: 500 },
    { id: 1402, name: 'Adamant scimitar', weight: 3, min: 1, max: 1 },
    { id: 2115, name: 'Adamantite bar', weight: 2, min: 1, max: 2 },
    { id: 2113, name: 'Steel bar', weight: 5, min: 3, max: 5 },
  ],
  tertiary: [
    { id: 3010, name: "Duran's hammer", chance: 32, min: 1, max: 1 }, // 1/32
  ],
});

// Boss unique drop
items.define({ id: 3010, name: "Duran's hammer", examine: "The Forgefather's burning hammer. It radiates heat.", value: 15000, category: 'weapon', equipSlot: 'weapon', speed: 5, stats: { crush: 55, melee_strength: 62 }, equipReqs: { attack: 35, strength: 30 } });

// ══════════════════════════════════════════════════════════════════════════════
// NPCs (non-combat) — Heartlands
// ══════════════════════════════════════════════════════════════════════════════

npcs.defineNpc('captain_alden', {
  name: 'Captain Alden', combat: 0, maxHp: 1, size: 1,
  aggressive: false, wanderRadius: 0, canMove: false,
  examine: 'The captain of the Heartlands patrol.',
  dialogue: { type: 'quest', questId: 'heartlands_patrol' },
});

npcs.defineNpc('smith_kael', {
  name: 'Smith Kael', combat: 0, maxHp: 1, size: 1,
  aggressive: false, wanderRadius: 0, canMove: false,
  examine: 'A burly blacksmith.',
  dialogue: { type: 'shop', shopId: 'heartlands_smithy' },
});

npcs.defineNpc('merchant_hilde', {
  name: 'Merchant Hilde', combat: 0, maxHp: 1, size: 1,
  aggressive: false, wanderRadius: 0, canMove: false,
  examine: 'A friendly merchant.',
  dialogue: { type: 'shop', shopId: 'heartlands_general' },
});

// ══════════════════════════════════════════════════════════════════════════════
// SHOPS — Heartlands
// ══════════════════════════════════════════════════════════════════════════════

shops.define('heartlands_smithy', {
  name: "Kael's Smithy", npc: 'Smith Kael', type: 'specialty',
  stock: [
    { id: 1001, name: 'Bronze sword', base: 10, price: 26 },
    { id: 1002, name: 'Bronze scimitar', base: 10, price: 32 },
    { id: 1010, name: 'Bronze full helm', base: 5, price: 44 },
    { id: 1011, name: 'Bronze platebody', base: 5, price: 160 },
    { id: 1012, name: 'Bronze platelegs', base: 5, price: 80 },
    { id: 1013, name: 'Bronze kiteshield', base: 5, price: 54 },
    { id: 1101, name: 'Iron sword', base: 5, price: 56 },
    { id: 1102, name: 'Iron scimitar', base: 5, price: 70 },
    { id: 1110, name: 'Iron full helm', base: 3, price: 92 },
    { id: 1111, name: 'Iron platebody', base: 3, price: 336 },
  ],
  restockRate: 200,
});

shops.define('heartlands_general', {
  name: "Hilde's General Store", npc: 'Merchant Hilde', type: 'general',
  stock: [
    { id: 2001, name: 'Bread', base: 20, price: 12 },
    { id: 2002, name: 'Cooked meat', base: 10, price: 4 },
    { id: 1004, name: 'Bronze axe', base: 5, price: 16 },
    { id: 1005, name: 'Bronze pickaxe', base: 5, price: 18 },
  ],
  restockRate: 100,
});

// ══════════════════════════════════════════════════════════════════════════════
// QUESTS — Heartlands
// ══════════════════════════════════════════════════════════════════════════════

quests.define('heartlands_patrol', {
  name: 'The Heartlands Patrol',
  description: 'Captain Alden needs someone to clear goblins from the south road and report back.',
  difficulty: 'Novice',
  questPoints: 1,
  requirements: {},
  steps: [
    { text: 'Talk to Captain Alden in the Heartlands town square.' },
    { text: 'Kill 5 Goblins along the south road.' },
    { text: 'Pick up the Patrol orders from the Goblin Warrior leader.' },
    { text: 'Return the Patrol orders to Captain Alden.' },
  ],
  rewards: {
    xp: { attack: 200, defence: 200 },
    items: [{ id: 101, name: 'Coins', count: 250 }, { id: 3003, name: 'Heartlands map', count: 1 }],
    questPoints: 1,
  },
});

quests.define('the_missing_miner', {
  name: 'The Missing Miner',
  description: "A miner named Torven hasn't returned from the old mine shaft. Search for him before it's too late.",
  difficulty: 'Novice',
  questPoints: 1,
  requirements: { skills: { mining: 5, crafting: 3, agility: 5 } }, // Crafting to repair rope, Agility to squeeze through collapse
  steps: [
    { text: "Talk to Overseer Greta at the Heartlands mine entrance." },
    { text: "Enter the old mine shaft (requires Bronze pickaxe)." },
    { text: "Navigate to the collapsed section and clear the rubble (Mining 5)." },
    { text: "Find Torven and escort him out." },
    { text: "Return to Overseer Greta." },
  ],
  rewards: {
    xp: { mining: 300, hitpoints: 100 },
    items: [{ id: 101, name: 'Coins', count: 500 }, { id: 2103, name: 'Iron ore', count: 10 }],
    questPoints: 1,
  },
});

quests.define('forge_of_duran', {
  name: 'Forge of Duran',
  description: 'The Forgefather has claimed an abandoned forge south of town. Defeat him and reclaim the forge for the smiths of the Heartlands.',
  difficulty: 'Intermediate',
  questPoints: 2,
  requirements: { skills: { attack: 20, defence: 15, smithing: 10, firemaking: 5 }, quests: ['heartlands_patrol'] }, // Smithing to forge a key, Firemaking to light the forge
  steps: [
    { text: "Talk to Smith Kael about the smoke rising from the old forge." },
    { text: "Travel to the abandoned forge south of the Heartlands." },
    { text: "Defeat Forgefather Duran." },
    { text: "Return the forge key to Smith Kael." },
  ],
  rewards: {
    xp: { attack: 1000, strength: 800, smithing: 500 },
    items: [{ id: 101, name: 'Coins', count: 2000 }],
    questPoints: 2,
  },
});

// ══════════════════════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════════════════════
// WORLD PLACEMENT — Heartlands
// Extends the existing town area with Aelgard-specific spawns.
// Existing town is at (90-115, 80-95). We expand south and east.
// ══════════════════════════════════════════════════════════════════════════════

function spawnHeartlands() {
  // Heartlands town NPCs (near existing town)
  npcs.spawnNpc('captain_alden', 100, 90);    // Town square
  npcs.spawnNpc('smith_kael', 104, 88);       // Near existing weapon shops
  npcs.spawnNpc('merchant_hilde', 98, 90);    // Near center

  // South road — goblin patrol area (y: 115-130)
  npcs.spawnNpc('goblin', 95, 118);
  npcs.spawnNpc('goblin', 98, 120);
  npcs.spawnNpc('goblin', 102, 122);
  npcs.spawnNpc('goblin', 100, 125);
  npcs.spawnNpc('goblin_warrior', 97, 128);   // Patrol leader

  // Giant rats near sewers / caves (east side)
  npcs.spawnNpc('giant_rat', 120, 100);
  npcs.spawnNpc('giant_rat', 122, 102);
  npcs.spawnNpc('giant_rat', 118, 103);

  // Giant spiders in the forest edges
  npcs.spawnNpc('giant_spider', 80, 75);
  npcs.spawnNpc('giant_spider', 82, 78);

  // Dark wizards south of town
  npcs.spawnNpc('dark_wizard', 105, 130);
  npcs.spawnNpc('dark_wizard', 108, 132);

  // Hill giants in hills east
  npcs.spawnNpc('hill_giant', 135, 95);
  npcs.spawnNpc('hill_giant', 138, 98);
  npcs.spawnNpc('hill_giant', 140, 95);

  // Moss giants in deeper forest
  npcs.spawnNpc('moss_giant', 70, 65);
  npcs.spawnNpc('moss_giant', 72, 68);

  // Guards around town
  npcs.spawnNpc('guard', 95, 95);
  npcs.spawnNpc('guard', 112, 95);

  // Forgefather Duran — abandoned forge south of town
  npcs.spawnNpc('forgefather_duran', 100, 140);
}

// Export for delayed spawning (after tiles are set up)
module.exports = { spawnHeartlands };

console.log('[aelgard] Heartlands content loaded');
