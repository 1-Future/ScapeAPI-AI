// ══════════════════════════════════════════════════════════════════════════════
// ITEMS: Comprehensive item definitions beyond weapons/armor
// Seeds, herbs, ores, bars, gems, runes, ammunition, tools, misc
// ══════════════════════════════════════════════════════════════════════════════

const { define } = require('../mechanic');

// ── SEEDS ───────────────────────────────────────────────────────────────────
const SEEDS = [
  'Potato seed', 'Onion seed', 'Cabbage seed', 'Tomato seed', 'Sweetcorn seed',
  'Strawberry seed', 'Watermelon seed', 'Snape grass seed',
  'Guam seed', 'Marrentill seed', 'Tarromin seed', 'Harralander seed',
  'Ranarr seed', 'Toadflax seed', 'Irit seed', 'Avantoe seed',
  'Kwuarm seed', 'Snapdragon seed', 'Cadantine seed', 'Lantadyme seed',
  'Dwarf weed seed', 'Torstol seed',
  'Acorn', 'Willow seed', 'Maple seed', 'Yew seed', 'Magic seed', 'Redwood seed',
  'Apple tree seed', 'Banana tree seed', 'Orange tree seed', 'Curry tree seed',
  'Pineapple seed', 'Papaya tree seed', 'Palm tree seed', 'Dragonfruit tree seed',
  'Spirit seed', 'Celastrus seed', 'Crystal acorn',
  'Hespori seed', 'Kronos seed', 'Iasor seed', 'Attas seed',
];

// ── HERBS ───────────────────────────────────────────────────────────────────
const HERBS = [
  'Guam leaf', 'Marrentill', 'Tarromin', 'Harralander', 'Ranarr weed',
  'Toadflax', 'Irit leaf', 'Avantoe', 'Kwuarm', 'Snapdragon',
  'Cadantine', 'Lantadyme', 'Dwarf weed', 'Torstol',
];

// ── RUNES ───────────────────────────────────────────────────────────────────
const RUNES = [
  'Air rune', 'Water rune', 'Earth rune', 'Fire rune', 'Mind rune',
  'Body rune', 'Cosmic rune', 'Chaos rune', 'Nature rune', 'Law rune',
  'Death rune', 'Blood rune', 'Soul rune', 'Wrath rune', 'Astral rune',
  'Dust rune', 'Mist rune', 'Mud rune', 'Smoke rune', 'Steam rune', 'Lava rune',
];

// ── AMMUNITION ──────────────────────────────────────────────────────────────
const AMMO = [
  'Bronze arrow', 'Iron arrow', 'Steel arrow', 'Mithril arrow', 'Adamant arrow',
  'Rune arrow', 'Amethyst arrow', 'Dragon arrow',
  'Bronze bolts', 'Iron bolts', 'Steel bolts', 'Mithril bolts', 'Adamant bolts',
  'Runite bolts', 'Dragon bolts', 'Diamond bolts (e)', 'Ruby bolts (e)',
  'Dragonstone bolts (e)', 'Onyx bolts (e)',
  'Bronze dart', 'Iron dart', 'Steel dart', 'Mithril dart', 'Adamant dart',
  'Rune dart', 'Dragon dart', 'Amethyst dart',
  'Bronze knife', 'Iron knife', 'Steel knife', 'Mithril knife', 'Adamant knife',
  'Rune knife', 'Dragon knife',
  'Bronze javelin', 'Iron javelin', 'Steel javelin', 'Mithril javelin',
  'Adamant javelin', 'Rune javelin', 'Dragon javelin', 'Amethyst javelin',
  'Cannonball', 'Granite cannonball',
  'Toktz-xil-ul', // obsidian throwing ring
];

// ── TOOLS ───────────────────────────────────────────────────────────────────
const TOOLS = [
  'Bronze pickaxe', 'Iron pickaxe', 'Steel pickaxe', 'Mithril pickaxe',
  'Adamant pickaxe', 'Rune pickaxe', 'Dragon pickaxe', 'Infernal pickaxe',
  'Crystal pickaxe', '3rd age pickaxe',
  'Bronze axe', 'Iron axe', 'Steel axe', 'Mithril axe', 'Adamant axe',
  'Rune axe', 'Dragon axe', 'Infernal axe', 'Crystal axe', '3rd age axe',
  'Bronze harpoon', 'Iron harpoon', 'Steel harpoon', 'Dragon harpoon',
  'Infernal harpoon', 'Crystal harpoon',
  'Hammer', 'Chisel', 'Needle', 'Thread', 'Tinderbox', 'Knife',
  'Pestle and mortar', 'Vial of water', 'Empty vial',
  'Spade', 'Rake', 'Seed dibber', 'Secateurs', 'Watering can',
  'Rope', 'Bucket', 'Jug', 'Bowl', 'Pot', 'Pie dish', 'Cake tin',
  'Impling jar', 'Butterfly net', 'Small fishing net', 'Big fishing net',
  'Fishing rod', 'Fly fishing rod', 'Barbarian rod', 'Oily fishing rod',
  'Lobster pot',
  'Bird snare', 'Box trap', 'Noose wand',
  'Saw', 'Bolt of cloth',
];

// ── BARS ────────────────────────────────────────────────────────────────────
const BARS = [
  'Bronze bar', 'Iron bar', 'Silver bar', 'Steel bar', 'Gold bar',
  'Mithril bar', 'Adamantite bar', 'Runite bar',
];

// ── GEMS ────────────────────────────────────────────────────────────────────
const GEMS = [
  'Uncut sapphire', 'Uncut emerald', 'Uncut ruby', 'Uncut diamond',
  'Uncut dragonstone', 'Uncut onyx', 'Uncut zenyte',
  'Sapphire', 'Emerald', 'Ruby', 'Diamond', 'Dragonstone', 'Onyx', 'Zenyte',
];

// ── ORES ────────────────────────────────────────────────────────────────────
const ORES = [
  'Clay', 'Rune essence', 'Pure essence', 'Copper ore', 'Tin ore',
  'Iron ore', 'Silver ore', 'Coal', 'Gold ore', 'Mithril ore',
  'Adamantite ore', 'Runite ore', 'Amethyst',
];

// ── LOGS ────────────────────────────────────────────────────────────────────
const LOGS = [
  'Logs', 'Oak logs', 'Willow logs', 'Teak logs', 'Maple logs',
  'Mahogany logs', 'Yew logs', 'Magic logs', 'Redwood logs',
];

// ── BONES ───────────────────────────────────────────────────────────────────
const BONES_LIST = [
  'Bones', 'Big bones', 'Baby dragon bones', 'Dragon bones',
  'Superior dragon bones', 'Dagannoth bones', 'Wyvern bones',
  'Lava dragon bones', 'Hydra bones',
];

// ── PLANKS ──────────────────────────────────────────────────────────────────
const PLANKS = ['Plank', 'Oak plank', 'Teak plank', 'Mahogany plank'];

// ── MISC ITEMS ──────────────────────────────────────────────────────────────
const MISC = [
  'Coins', 'Feather', 'Bait', 'Raw chicken', 'Cowhide', 'Leather',
  'Hard leather', 'Dragon leather', 'Bow string', 'Flax',
  'Ball of wool', 'Molten glass', 'Gold leaf', 'Marble block', 'Limestone brick',
  'Mort myre fungus', 'Potato cactus', 'White berries', 'Limpwurt root',
  'Red spiders eggs', 'Wine of zamorak', 'Snape grass', 'Eye of newt',
  'Unicorn horn dust', 'Dragon scale dust', 'Crushed nest',
  'Ring mould', 'Necklace mould', 'Amulet mould', 'Bracelet mould',
  'Compost', 'Supercompost', 'Ultracompost',
  'Cosmic talisman', 'Chaos talisman', 'Nature talisman', 'Law talisman',
  'Death talisman', 'Blood talisman', 'Soul talisman',
  'Saltpetre', 'Volcanic ash', 'Dark essence block', 'Dark essence fragments',
  'Crystal shard', 'Crystal weapon seed', 'Crystal armour seed',
  'Enhanced crystal weapon seed', 'Blade of saeldor (inactive)',
  'Godsword shard 1', 'Godsword shard 2', 'Godsword shard 3', 'Godsword blade',
  'Coin pouch', 'Looting bag', 'Rune pouch', 'Herb sack', 'Seed box',
  'Coal bag', 'Gem bag', 'Bolt pouch',
  'Teleport scroll', 'Clue scroll (easy)', 'Clue scroll (medium)',
  'Clue scroll (hard)', 'Clue scroll (elite)', 'Clue scroll (master)',
  'Long bone', 'Curved bone', 'Ensouled head',
  'Ecumenical key', 'Larran\'s key', 'Brimstone key', 'Crystal key',
];

let count = 0;
const allItems = [
  ...SEEDS.map(s => ({ name: s, cat: 'seed' })),
  ...HERBS.map(s => ({ name: s, cat: 'herb' })),
  ...RUNES.map(s => ({ name: s, cat: 'rune' })),
  ...AMMO.map(s => ({ name: s, cat: 'ammunition' })),
  ...TOOLS.map(s => ({ name: s, cat: 'tool' })),
  ...BARS.map(s => ({ name: s, cat: 'bar' })),
  ...GEMS.map(s => ({ name: s, cat: 'gem' })),
  ...ORES.map(s => ({ name: s, cat: 'ore' })),
  ...LOGS.map(s => ({ name: s, cat: 'log' })),
  ...BONES_LIST.map(s => ({ name: s, cat: 'bone' })),
  ...PLANKS.map(s => ({ name: s, cat: 'plank' })),
  ...MISC.map(s => ({ name: s, cat: 'misc' })),
];

for (const item of allItems) {
  const id = `item-${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')}`;
  define({
    id, name: item.name, type: 'item',
    atoms: {},
    config: { category: item.cat }
  });
  count++;
}

console.log(`[defs] Items: ${SEEDS.length} seeds, ${HERBS.length} herbs, ${RUNES.length} runes, ${AMMO.length} ammo, ${TOOLS.length} tools, ${BARS.length} bars, ${GEMS.length} gems, ${ORES.length} ores, ${LOGS.length} logs, ${BONES_LIST.length} bones, ${PLANKS.length} planks, ${MISC.length} misc = ${count} items`);
