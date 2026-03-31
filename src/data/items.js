// ── Item Definitions Database (8.1) ──────────────────────────────────────────
// Every item in the game. Properties match OSRS wiki data.

const items = new Map(); // id → item def
let nextId = 1000;

function define(opts) {
  const id = opts.id || nextId++;
  const item = {
    id,
    name: opts.name,
    examine: opts.examine || '',
    tradeable: opts.tradeable !== false,
    stackable: opts.stackable || false,
    noted: opts.noted || false,
    weight: opts.weight || 0,
    value: opts.value || 0, // base value in coins
    highAlch: opts.highAlch || Math.floor((opts.value || 0) * 0.6),
    lowAlch: opts.lowAlch || Math.floor((opts.value || 0) * 0.4),
    equipSlot: opts.equipSlot || null,
    equipReqs: opts.equipReqs || {}, // { attack: 40, defence: 40 }
    stats: opts.stats || {}, // { slash: 10, melee_strength: 12 }
    speed: opts.speed || null, // attack speed (weapons only)
    members: opts.members || false,
    category: opts.category || 'misc',
  };
  items.set(id, item);
  return item;
}

function get(id) { return items.get(id); }
function find(name) {
  const lower = name.toLowerCase();
  for (const item of items.values()) {
    if (item.name.toLowerCase() === lower) return item;
  }
  return null;
}
function search(query) {
  const lower = query.toLowerCase();
  return [...items.values()].filter(i => i.name.toLowerCase().includes(lower));
}

// ── Define all items ──────────────────────────────────────────────────────────

// Bones & remains
define({ id: 100, name: 'Bones', examine: 'Ew.', value: 1, category: 'prayer', weight: 0.5 });
define({ id: 106, name: 'Big bones', examine: 'Big bones.', value: 15, category: 'prayer', weight: 1 });
define({ id: 107, name: 'Dragon bones', examine: 'These bones belonged to a dragon.', value: 1500, category: 'prayer', weight: 1.5 });

// Coins & currency
define({ id: 101, name: 'Coins', examine: 'Lovely money!', stackable: true, value: 1, weight: 0, category: 'currency' });

// Hides & leather
define({ id: 102, name: 'Cowhide', examine: 'A cow hide.', value: 5, category: 'crafting', weight: 2 });
define({ id: 108, name: 'Leather', examine: 'Tanned cowhide.', value: 10, category: 'crafting', weight: 1 });

// Raw food
define({ id: 103, name: 'Raw beef', examine: 'Raw beef.', value: 2, category: 'cooking', weight: 0.5 });
define({ id: 105, name: 'Raw chicken', examine: 'Raw chicken.', value: 2, category: 'cooking', weight: 0.5 });
define({ id: 220, name: 'Raw shrimps', examine: 'Raw shrimps.', value: 5, category: 'cooking', weight: 0.2 });
define({ id: 221, name: 'Raw trout', examine: 'A raw trout.', value: 20, category: 'cooking', weight: 0.4 });
define({ id: 222, name: 'Raw salmon', examine: 'A raw salmon.', value: 25, category: 'cooking', weight: 0.4 });
define({ id: 223, name: 'Raw lobster', examine: 'A raw lobster.', value: 100, category: 'cooking', weight: 0.5 });
define({ id: 224, name: 'Raw swordfish', examine: 'A raw swordfish.', value: 200, category: 'cooking', weight: 0.8 });
define({ id: 225, name: 'Raw shark', examine: 'A raw shark.', value: 500, category: 'cooking', weight: 1 });

// Cooked food
define({ id: 230, name: 'Shrimps', examine: 'Cooked shrimps.', value: 10, category: 'food', weight: 0.2 });
define({ id: 231, name: 'Cooked chicken', examine: 'Tasty chicken.', value: 8, category: 'food', weight: 0.5 });
define({ id: 232, name: 'Cooked beef', examine: 'Cooked beef.', value: 8, category: 'food', weight: 0.5 });
define({ id: 233, name: 'Trout', examine: 'A trout.', value: 40, category: 'food', weight: 0.4 });
define({ id: 234, name: 'Salmon', examine: 'Salmon.', value: 50, category: 'food', weight: 0.4 });
define({ id: 235, name: 'Lobster', examine: 'A lobster.', value: 150, category: 'food', weight: 0.5 });
define({ id: 236, name: 'Swordfish', examine: 'A swordfish.', value: 300, category: 'food', weight: 0.8 });
define({ id: 237, name: 'Shark', examine: 'A shark.', value: 700, category: 'food', weight: 1 });

// Burnt food
define({ id: 240, name: 'Burnt shrimps', examine: 'Oops.', value: 1, tradeable: false, category: 'junk', weight: 0.2 });
define({ id: 241, name: 'Burnt chicken', examine: 'Oops.', value: 1, tradeable: false, category: 'junk', weight: 0.5 });
define({ id: 242, name: 'Burnt meat', examine: 'Oops.', value: 1, tradeable: false, category: 'junk', weight: 0.5 });
define({ id: 243, name: 'Burnt fish', examine: 'Oops.', value: 1, tradeable: false, category: 'junk', weight: 0.4 });

// Food healing values
const FOOD_HEAL = {
  230: 3, 231: 3, 232: 3, // shrimps, chicken, beef
  233: 7, 234: 9, // trout, salmon
  235: 12, 236: 14, 237: 20, // lobster, swordfish, shark
};

// Feathers & bait
define({ id: 104, name: 'Feather', examine: 'A feather.', stackable: true, value: 2, category: 'fishing', weight: 0 });
define({ id: 109, name: 'Fishing bait', examine: 'Bait for fishing.', stackable: true, value: 3, category: 'fishing', weight: 0 });

// Logs
define({ id: 200, name: 'Logs', examine: 'Logs.', value: 4, category: 'woodcutting', weight: 2 });
define({ id: 201, name: 'Oak logs', examine: 'Oak logs.', value: 15, category: 'woodcutting', weight: 2 });
define({ id: 202, name: 'Willow logs', examine: 'Willow logs.', value: 8, category: 'woodcutting', weight: 2 });
define({ id: 203, name: 'Maple logs', examine: 'Maple logs.', value: 20, category: 'woodcutting', weight: 2 });
define({ id: 204, name: 'Yew logs', examine: 'Yew logs.', value: 160, category: 'woodcutting', weight: 2 });
define({ id: 205, name: 'Magic logs', examine: 'Magic logs.', value: 500, category: 'woodcutting', weight: 2 });

// Ores
define({ id: 210, name: 'Copper ore', examine: 'A copper ore.', value: 5, category: 'mining', weight: 2 });
define({ id: 211, name: 'Tin ore', examine: 'A tin ore.', value: 5, category: 'mining', weight: 2 });
define({ id: 212, name: 'Iron ore', examine: 'An iron ore.', value: 25, category: 'mining', weight: 2 });
define({ id: 213, name: 'Coal', examine: 'A chunk of coal.', value: 45, category: 'mining', weight: 2 });
define({ id: 214, name: 'Gold ore', examine: 'Gold ore.', value: 150, category: 'mining', weight: 2 });
define({ id: 215, name: 'Mithril ore', examine: 'Mithril ore.', value: 160, category: 'mining', weight: 2 });
define({ id: 216, name: 'Adamantite ore', examine: 'Adamantite ore.', value: 400, category: 'mining', weight: 2 });
define({ id: 217, name: 'Runite ore', examine: 'Runite ore.', value: 3200, category: 'mining', weight: 2 });

// Bars
define({ id: 250, name: 'Bronze bar', examine: 'A bronze bar.', value: 12, category: 'smithing', weight: 1.8 });
define({ id: 251, name: 'Iron bar', examine: 'An iron bar.', value: 56, category: 'smithing', weight: 1.8 });
define({ id: 252, name: 'Steel bar', examine: 'A steel bar.', value: 120, category: 'smithing', weight: 1.8 });
define({ id: 253, name: 'Gold bar', examine: 'A gold bar.', value: 300, category: 'smithing', weight: 1.8 });
define({ id: 254, name: 'Mithril bar', examine: 'A mithril bar.', value: 480, category: 'smithing', weight: 1.8 });
define({ id: 255, name: 'Adamantite bar', examine: 'An adamantite bar.', value: 1280, category: 'smithing', weight: 1.8 });
define({ id: 256, name: 'Runite bar', examine: 'A runite bar.', value: 6400, category: 'smithing', weight: 1.8 });

// Gems
define({ id: 260, name: 'Uncut sapphire', examine: 'An uncut sapphire.', value: 50, category: 'crafting', weight: 0.01 });
define({ id: 261, name: 'Uncut emerald', examine: 'An uncut emerald.', value: 100, category: 'crafting', weight: 0.01 });
define({ id: 262, name: 'Uncut ruby', examine: 'An uncut ruby.', value: 200, category: 'crafting', weight: 0.01 });
define({ id: 263, name: 'Uncut diamond', examine: 'An uncut diamond.', value: 500, category: 'crafting', weight: 0.01 });
define({ id: 264, name: 'Sapphire', examine: 'A sapphire.', value: 75, category: 'crafting', weight: 0.01 });
define({ id: 265, name: 'Emerald', examine: 'An emerald.', value: 150, category: 'crafting', weight: 0.01 });
define({ id: 266, name: 'Ruby', examine: 'A ruby.', value: 300, category: 'crafting', weight: 0.01 });
define({ id: 267, name: 'Diamond', examine: 'A diamond.', value: 750, category: 'crafting', weight: 0.01 });

// Runes
define({ id: 270, name: 'Air rune', examine: 'An air rune.', stackable: true, value: 4, category: 'magic', weight: 0 });
define({ id: 271, name: 'Water rune', examine: 'A water rune.', stackable: true, value: 4, category: 'magic', weight: 0 });
define({ id: 272, name: 'Earth rune', examine: 'An earth rune.', stackable: true, value: 4, category: 'magic', weight: 0 });
define({ id: 273, name: 'Fire rune', examine: 'A fire rune.', stackable: true, value: 4, category: 'magic', weight: 0 });
define({ id: 274, name: 'Mind rune', examine: 'A mind rune.', stackable: true, value: 3, category: 'magic', weight: 0 });
define({ id: 275, name: 'Body rune', examine: 'A body rune.', stackable: true, value: 4, category: 'magic', weight: 0 });
define({ id: 276, name: 'Chaos rune', examine: 'A chaos rune.', stackable: true, value: 60, category: 'magic', weight: 0 });
define({ id: 277, name: 'Death rune', examine: 'A death rune.', stackable: true, value: 130, category: 'magic', weight: 0 });
define({ id: 278, name: 'Nature rune', examine: 'A nature rune.', stackable: true, value: 130, category: 'magic', weight: 0 });
define({ id: 279, name: 'Law rune', examine: 'A law rune.', stackable: true, value: 160, category: 'magic', weight: 0 });
define({ id: 280, name: 'Blood rune', examine: 'A blood rune.', stackable: true, value: 200, category: 'magic', weight: 0 });

// Herbs (grimy)
define({ id: 300, name: 'Grimy guam', examine: 'A grimy guam leaf.', value: 10, category: 'herblore', weight: 0.01 });
define({ id: 301, name: 'Grimy marrentill', examine: 'A grimy marrentill.', value: 15, category: 'herblore', weight: 0.01 });
define({ id: 302, name: 'Grimy tarromin', examine: 'A grimy tarromin.', value: 20, category: 'herblore', weight: 0.01 });
define({ id: 303, name: 'Grimy harralander', examine: 'A grimy harralander.', value: 30, category: 'herblore', weight: 0.01 });
define({ id: 304, name: 'Grimy ranarr', examine: 'A grimy ranarr weed.', value: 200, category: 'herblore', weight: 0.01 });
define({ id: 305, name: 'Grimy irit', examine: 'A grimy irit leaf.', value: 40, category: 'herblore', weight: 0.01 });
define({ id: 306, name: 'Grimy kwuarm', examine: 'A grimy kwuarm.', value: 100, category: 'herblore', weight: 0.01 });
define({ id: 307, name: 'Grimy snapdragon', examine: 'A grimy snapdragon.', value: 500, category: 'herblore', weight: 0.01 });
define({ id: 308, name: 'Grimy torstol', examine: 'A grimy torstol.', value: 1000, category: 'herblore', weight: 0.01 });

// Herbs (clean)
define({ id: 310, name: 'Guam leaf', examine: 'A guam leaf.', value: 15, category: 'herblore', weight: 0.01 });
define({ id: 311, name: 'Marrentill', examine: 'A marrentill.', value: 20, category: 'herblore', weight: 0.01 });
define({ id: 312, name: 'Tarromin', examine: 'A tarromin.', value: 25, category: 'herblore', weight: 0.01 });
define({ id: 313, name: 'Harralander', examine: 'A harralander.', value: 35, category: 'herblore', weight: 0.01 });
define({ id: 314, name: 'Ranarr weed', examine: 'A ranarr weed.', value: 250, category: 'herblore', weight: 0.01 });

// Potion secondaries
define({ id: 320, name: 'Eye of newt', examine: 'Eye of newt.', value: 3, category: 'herblore', weight: 0.01 });
define({ id: 321, name: 'Unicorn horn dust', examine: 'Horn dust.', value: 20, category: 'herblore', weight: 0.01 });
define({ id: 322, name: 'Limpwurt root', examine: 'A limpwurt root.', value: 30, category: 'herblore', weight: 0.1 });
define({ id: 323, name: 'Red spiders\' eggs', examine: 'Red spiders\' eggs.', value: 15, category: 'herblore', weight: 0.01 });
define({ id: 324, name: 'Vial of water', examine: 'A vial of water.', value: 2, category: 'herblore', weight: 0.1 });
define({ id: 325, name: 'Vial', examine: 'An empty vial.', value: 1, category: 'herblore', weight: 0.1 });

// Potions
define({ id: 330, name: 'Attack potion(4)', examine: 'Boosts attack.', value: 40, category: 'potion', weight: 0.3 });
define({ id: 331, name: 'Strength potion(4)', examine: 'Boosts strength.', value: 60, category: 'potion', weight: 0.3 });
define({ id: 332, name: 'Defence potion(4)', examine: 'Boosts defence.', value: 60, category: 'potion', weight: 0.3 });
define({ id: 333, name: 'Antipoison(4)', examine: 'Cures poison.', value: 50, category: 'potion', weight: 0.3 });
define({ id: 334, name: 'Restore potion(4)', examine: 'Restores stats.', value: 40, category: 'potion', weight: 0.3 });
define({ id: 335, name: 'Prayer potion(4)', examine: 'Restores prayer.', value: 300, category: 'potion', weight: 0.3 });
define({ id: 336, name: 'Super attack(4)', examine: 'Super attack potion.', value: 200, category: 'potion', weight: 0.3 });
define({ id: 337, name: 'Super strength(4)', examine: 'Super strength potion.', value: 300, category: 'potion', weight: 0.3 });

// Arrow shafts & arrows
define({ id: 340, name: 'Arrow shaft', examine: 'Arrow shafts.', stackable: true, value: 1, category: 'fletching', weight: 0 });
define({ id: 341, name: 'Headless arrow', examine: 'Headless arrows.', stackable: true, value: 2, category: 'fletching', weight: 0 });
define({ id: 342, name: 'Bronze arrows', examine: 'Bronze arrows.', stackable: true, value: 4, category: 'ammo', weight: 0 });
define({ id: 343, name: 'Iron arrows', examine: 'Iron arrows.', stackable: true, value: 10, category: 'ammo', weight: 0 });
define({ id: 344, name: 'Steel arrows', examine: 'Steel arrows.', stackable: true, value: 24, category: 'ammo', weight: 0 });
define({ id: 345, name: 'Mithril arrows', examine: 'Mithril arrows.', stackable: true, value: 48, category: 'ammo', weight: 0 });
define({ id: 346, name: 'Adamant arrows', examine: 'Adamant arrows.', stackable: true, value: 96, category: 'ammo', weight: 0 });
define({ id: 347, name: 'Rune arrows', examine: 'Rune arrows.', stackable: true, value: 240, category: 'ammo', weight: 0 });

// Bows
define({ id: 350, name: 'Shortbow', examine: 'A shortbow.', value: 20, category: 'ranged', equipSlot: 'weapon', speed: 4, stats: { ranged: 8, ranged_strength: 6 }, weight: 0.9 });
define({ id: 351, name: 'Oak shortbow', examine: 'An oak shortbow.', value: 80, category: 'ranged', equipSlot: 'weapon', speed: 4, equipReqs: { ranged: 5 }, stats: { ranged: 14, ranged_strength: 8 }, weight: 0.9 });
define({ id: 352, name: 'Willow shortbow', examine: 'A willow shortbow.', value: 160, category: 'ranged', equipSlot: 'weapon', speed: 4, equipReqs: { ranged: 20 }, stats: { ranged: 20, ranged_strength: 10 }, weight: 0.9 });
define({ id: 353, name: 'Maple shortbow', examine: 'A maple shortbow.', value: 400, category: 'ranged', equipSlot: 'weapon', speed: 4, equipReqs: { ranged: 30 }, stats: { ranged: 29, ranged_strength: 14 }, weight: 0.9 });
define({ id: 354, name: 'Yew shortbow', examine: 'A yew shortbow.', value: 800, category: 'ranged', equipSlot: 'weapon', speed: 4, equipReqs: { ranged: 40 }, stats: { ranged: 47, ranged_strength: 21 }, weight: 0.9 });

// Melee weapons — Bronze
define({ id: 400, name: 'Bronze dagger', examine: 'A bronze dagger.', value: 10, category: 'melee', equipSlot: 'weapon', speed: 4, stats: { stab: 4, slash: 2, melee_strength: 3 }, weight: 0.4 });
define({ id: 401, name: 'Bronze sword', examine: 'A bronze sword.', value: 20, category: 'melee', equipSlot: 'weapon', speed: 4, stats: { stab: 4, slash: 5, melee_strength: 5 }, weight: 0.9 });
define({ id: 402, name: 'Bronze scimitar', examine: 'A bronze scimitar.', value: 32, category: 'melee', equipSlot: 'weapon', speed: 4, stats: { slash: 7, melee_strength: 6 }, weight: 0.9 });
define({ id: 403, name: 'Bronze axe', examine: 'A bronze axe.', value: 16, category: 'melee', equipSlot: 'weapon', speed: 5, stats: { slash: 4, melee_strength: 5 }, weight: 1.8 });

// Melee weapons — Iron
define({ id: 410, name: 'Iron dagger', examine: 'An iron dagger.', value: 25, category: 'melee', equipSlot: 'weapon', speed: 4, equipReqs: { attack: 1 }, stats: { stab: 5, slash: 3, melee_strength: 4 }, weight: 0.4 });
define({ id: 411, name: 'Iron sword', examine: 'An iron sword.', value: 56, category: 'melee', equipSlot: 'weapon', speed: 4, equipReqs: { attack: 1 }, stats: { stab: 7, slash: 8, melee_strength: 7 }, weight: 0.9 });
define({ id: 412, name: 'Iron scimitar', examine: 'An iron scimitar.', value: 80, category: 'melee', equipSlot: 'weapon', speed: 4, equipReqs: { attack: 1 }, stats: { slash: 10, melee_strength: 9 }, weight: 0.9 });

// Melee weapons — Steel
define({ id: 420, name: 'Steel scimitar', examine: 'A steel scimitar.', value: 320, category: 'melee', equipSlot: 'weapon', speed: 4, equipReqs: { attack: 5 }, stats: { slash: 15, melee_strength: 14 }, weight: 0.9 });
define({ id: 421, name: 'Steel sword', examine: 'A steel sword.', value: 200, category: 'melee', equipSlot: 'weapon', speed: 4, equipReqs: { attack: 5 }, stats: { stab: 11, slash: 12, melee_strength: 12 }, weight: 0.9 });

// Melee weapons — Mithril
define({ id: 430, name: 'Mithril scimitar', examine: 'A mithril scimitar.', value: 1040, category: 'melee', equipSlot: 'weapon', speed: 4, equipReqs: { attack: 20 }, stats: { slash: 21, melee_strength: 20 }, weight: 0.9 });

// Melee weapons — Adamant
define({ id: 440, name: 'Adamant scimitar', examine: 'An adamant scimitar.', value: 2560, category: 'melee', equipSlot: 'weapon', speed: 4, equipReqs: { attack: 30 }, stats: { slash: 29, melee_strength: 28 }, weight: 0.9 });

// Melee weapons — Rune
define({ id: 450, name: 'Rune scimitar', examine: 'A rune scimitar.', value: 12800, category: 'melee', equipSlot: 'weapon', speed: 4, equipReqs: { attack: 40 }, stats: { slash: 45, melee_strength: 44 }, weight: 0.9 });

// Shields
define({ id: 500, name: 'Wooden shield', examine: 'A wooden shield.', value: 10, category: 'armour', equipSlot: 'shield', stats: { def_stab: 2, def_slash: 3, def_crush: 1 }, weight: 2 });
define({ id: 501, name: 'Bronze sq shield', examine: 'A bronze square shield.', value: 32, category: 'armour', equipSlot: 'shield', stats: { def_stab: 3, def_slash: 5, def_crush: 4 }, weight: 2.2 });
define({ id: 502, name: 'Iron sq shield', examine: 'An iron square shield.', value: 84, category: 'armour', equipSlot: 'shield', stats: { def_stab: 5, def_slash: 7, def_crush: 6 }, weight: 2.2 });

// Body armour
define({ id: 510, name: 'Bronze platebody', examine: 'A bronze platebody.', value: 160, category: 'armour', equipSlot: 'body', stats: { def_stab: 15, def_slash: 14, def_crush: 9 }, weight: 9 });
define({ id: 511, name: 'Iron platebody', examine: 'An iron platebody.', value: 280, category: 'armour', equipSlot: 'body', equipReqs: { defence: 1 }, stats: { def_stab: 20, def_slash: 19, def_crush: 13 }, weight: 9 });
define({ id: 512, name: 'Steel platebody', examine: 'A steel platebody.', value: 1200, category: 'armour', equipSlot: 'body', equipReqs: { defence: 5 }, stats: { def_stab: 32, def_slash: 31, def_crush: 24 }, weight: 9 });
define({ id: 513, name: 'Mithril platebody', examine: 'A mithril platebody.', value: 3900, category: 'armour', equipSlot: 'body', equipReqs: { defence: 20 }, stats: { def_stab: 46, def_slash: 44, def_crush: 38 }, weight: 8 });
define({ id: 514, name: 'Adamant platebody', examine: 'An adamant platebody.', value: 9600, category: 'armour', equipSlot: 'body', equipReqs: { defence: 30 }, stats: { def_stab: 65, def_slash: 63, def_crush: 55 }, weight: 7 });
define({ id: 515, name: 'Rune platebody', examine: 'A rune platebody.', value: 38400, category: 'armour', equipSlot: 'body', equipReqs: { defence: 40 }, stats: { def_stab: 82, def_slash: 80, def_crush: 72 }, weight: 6 });

// Legs
define({ id: 520, name: 'Bronze platelegs', examine: 'Bronze platelegs.', value: 80, category: 'armour', equipSlot: 'legs', stats: { def_stab: 7, def_slash: 7, def_crush: 6 }, weight: 8 });
define({ id: 521, name: 'Iron platelegs', examine: 'Iron platelegs.', value: 140, category: 'armour', equipSlot: 'legs', equipReqs: { defence: 1 }, stats: { def_stab: 10, def_slash: 10, def_crush: 8 }, weight: 8 });
define({ id: 525, name: 'Rune platelegs', examine: 'Rune platelegs.', value: 19200, category: 'armour', equipSlot: 'legs', equipReqs: { defence: 40 }, stats: { def_stab: 51, def_slash: 49, def_crush: 47 }, weight: 5 });

// Helmets
define({ id: 530, name: 'Bronze full helm', examine: 'A bronze full helmet.', value: 44, category: 'armour', equipSlot: 'head', stats: { def_stab: 3, def_slash: 4, def_crush: 2 }, weight: 2.7 });
define({ id: 535, name: 'Rune full helm', examine: 'A rune full helmet.', value: 17600, category: 'armour', equipSlot: 'head', equipReqs: { defence: 40 }, stats: { def_stab: 30, def_slash: 32, def_crush: 27 }, weight: 2.7 });

// Tools
define({ id: 550, name: 'Bronze pickaxe', examine: 'A bronze pickaxe.', value: 10, category: 'tool', equipSlot: 'weapon', speed: 5, stats: { slash: 4, melee_strength: -2 }, weight: 2.2 });
define({ id: 551, name: 'Iron pickaxe', examine: 'An iron pickaxe.', value: 56, category: 'tool', equipSlot: 'weapon', speed: 5, equipReqs: { attack: 1, mining: 1 }, stats: { slash: 5, melee_strength: -2 }, weight: 2.2 });
define({ id: 552, name: 'Steel pickaxe', examine: 'A steel pickaxe.', value: 200, category: 'tool', equipSlot: 'weapon', speed: 5, equipReqs: { attack: 5, mining: 6 }, stats: { slash: 8, melee_strength: -2 }, weight: 2.2 });
define({ id: 553, name: 'Mithril pickaxe', examine: 'A mithril pickaxe.', value: 520, category: 'tool', equipSlot: 'weapon', speed: 5, equipReqs: { attack: 20, mining: 21 }, stats: { slash: 12, melee_strength: -2 }, weight: 2.2 });
define({ id: 554, name: 'Adamant pickaxe', examine: 'An adamant pickaxe.', value: 1280, category: 'tool', equipSlot: 'weapon', speed: 5, equipReqs: { attack: 30, mining: 31 }, stats: { slash: 17, melee_strength: -2 }, weight: 2.2 });
define({ id: 555, name: 'Rune pickaxe', examine: 'A rune pickaxe.', value: 6400, category: 'tool', equipSlot: 'weapon', speed: 5, equipReqs: { attack: 40, mining: 41 }, stats: { slash: 24, melee_strength: -2 }, weight: 2.2 });

define({ id: 560, name: 'Bronze axe', examine: 'A woodcutting axe.', value: 16, category: 'tool', equipSlot: 'weapon', speed: 5, stats: { slash: 4, melee_strength: 5 }, weight: 1.8 });
define({ id: 561, name: 'Iron axe', examine: 'An iron woodcutting axe.', value: 56, category: 'tool', equipSlot: 'weapon', speed: 5, equipReqs: { attack: 1, woodcutting: 1 }, stats: { slash: 5, melee_strength: 7 }, weight: 1.8 });
define({ id: 565, name: 'Rune axe', examine: 'A rune woodcutting axe.', value: 6400, category: 'tool', equipSlot: 'weapon', speed: 5, equipReqs: { attack: 40, woodcutting: 41 }, stats: { slash: 24, melee_strength: 29 }, weight: 1.8 });

define({ id: 570, name: 'Hammer', examine: 'A hammer.', value: 5, category: 'tool', weight: 1 });
define({ id: 571, name: 'Chisel', examine: 'A chisel.', value: 5, category: 'tool', weight: 0.1 });
define({ id: 572, name: 'Knife', examine: 'A knife.', value: 6, category: 'tool', weight: 0.4 });
define({ id: 573, name: 'Tinderbox', examine: 'A tinderbox.', value: 1, category: 'tool', weight: 0.4 });
define({ id: 574, name: 'Needle', examine: 'A needle.', value: 1, category: 'tool', weight: 0 });
define({ id: 575, name: 'Thread', examine: 'Thread.', stackable: true, value: 1, category: 'tool', weight: 0 });
define({ id: 576, name: 'Small fishing net', examine: 'A small fishing net.', value: 5, category: 'tool', weight: 0.4 });
define({ id: 577, name: 'Fly fishing rod', examine: 'A fly fishing rod.', value: 5, category: 'tool', weight: 0.4 });
define({ id: 578, name: 'Harpoon', examine: 'A harpoon.', value: 5, category: 'tool', weight: 1.3 });
define({ id: 579, name: 'Lobster pot', examine: 'A lobster pot.', value: 20, category: 'tool', weight: 0.4 });

// Bowstring & crafting materials
define({ id: 580, name: 'Bowstring', examine: 'A bowstring.', value: 10, category: 'fletching', weight: 0 });
define({ id: 581, name: 'Flax', examine: 'Flax.', value: 5, category: 'crafting', weight: 0.1 });

// Unstrung bows
define({ id: 590, name: 'Shortbow (u)', examine: 'An unstrung shortbow.', value: 10, category: 'fletching', weight: 0.9 });
define({ id: 591, name: 'Oak shortbow (u)', examine: 'An unstrung oak shortbow.', value: 40, category: 'fletching', weight: 0.9 });
define({ id: 592, name: 'Willow shortbow (u)', examine: 'An unstrung willow shortbow.', value: 80, category: 'fletching', weight: 0.9 });

// Arrowheads
define({ id: 593, name: 'Bronze arrowheads', examine: 'Bronze arrowheads.', stackable: true, value: 2, category: 'fletching', weight: 0 });
define({ id: 594, name: 'Iron arrowheads', examine: 'Iron arrowheads.', stackable: true, value: 5, category: 'fletching', weight: 0 });

// Seeds (farming)
define({ id: 600, name: 'Guam seed', examine: 'A guam seed.', stackable: true, value: 5, category: 'farming', weight: 0 });
define({ id: 601, name: 'Marrentill seed', examine: 'A marrentill seed.', stackable: true, value: 8, category: 'farming', weight: 0 });
define({ id: 602, name: 'Ranarr seed', examine: 'A ranarr seed.', stackable: true, value: 100, category: 'farming', weight: 0 });

// Hunter items
define({ id: 610, name: 'Bird snare', examine: 'A bird snare for catching birds.', value: 20, category: 'hunter', weight: 0.5 });
define({ id: 611, name: 'Box trap', examine: 'A box trap for catching chinchompas.', value: 40, category: 'hunter', weight: 1 });
define({ id: 612, name: 'Raw bird meat', examine: 'Raw bird meat.', value: 5, category: 'cooking', weight: 0.3 });
define({ id: 613, name: 'Chinchompa', examine: 'A chinchompa.', stackable: true, value: 200, category: 'hunter', weight: 0 });
define({ id: 614, name: 'Bird feather', examine: 'A colourful bird feather.', stackable: true, value: 10, category: 'hunter', weight: 0 });

// Antipoison potion (already exists as id 333 — Antipoison(4))

// Clue scrolls & misc drops
define({ id: 900, name: 'Clue scroll (beginner)', examine: 'A clue scroll.', value: 50, tradeable: false, category: 'clue', weight: 0 });
define({ id: 901, name: 'Giant key', examine: 'A giant key.', value: 500, tradeable: false, category: 'boss', weight: 1 });

// XP lamp (achievement reward)
define({ id: 950, name: 'XP lamp (small)', examine: 'Grants XP in a skill of your choice.', value: 0, tradeable: false, category: 'reward', weight: 0 });
define({ id: 951, name: 'XP lamp (medium)', examine: 'Grants XP in a skill of your choice.', value: 0, tradeable: false, category: 'reward', weight: 0 });
define({ id: 952, name: 'XP lamp (large)', examine: 'Grants XP in a skill of your choice.', value: 0, tradeable: false, category: 'reward', weight: 0 });

// ── Construction planks & nails ──────────────────────────────────────────────
define({ id: 700, name: 'Plank', examine: 'A wooden plank.', value: 100, category: 'construction', weight: 1.5 });
define({ id: 701, name: 'Oak plank', examine: 'An oak plank.', value: 250, category: 'construction', weight: 1.5 });
define({ id: 702, name: 'Teak plank', examine: 'A teak plank.', value: 500, category: 'construction', weight: 1.5 });
define({ id: 703, name: 'Mahogany plank', examine: 'A mahogany plank.', value: 1500, category: 'construction', weight: 1.5 });
define({ id: 704, name: 'Nails', examine: 'A pack of nails.', stackable: true, value: 5, category: 'construction', weight: 0 });
define({ id: 705, name: 'Steel nails', examine: 'Steel nails.', stackable: true, value: 15, category: 'construction', weight: 0 });

// ── Rune essence (runecrafting) ──────────────────────────────────────────────
define({ id: 710, name: 'Rune essence', examine: 'An essence used for crafting runes.', stackable: false, value: 10, category: 'runecrafting', weight: 0.01 });
define({ id: 711, name: 'Pure essence', examine: 'A purer essence for higher-tier runes.', stackable: false, value: 25, category: 'runecrafting', weight: 0.01 });

// ── Anti-dragon shield ──────────────────────────────────────────────────────
define({ id: 720, name: 'Anti-dragon shield', examine: 'Protects against dragonfire.', value: 500, category: 'armour', equipSlot: 'shield', stats: { def_stab: 5, def_slash: 6, def_crush: 7 }, weight: 2.2 });

// ── Boss unique drops ────────────────────────────────────────────────────────
define({ id: 730, name: 'Draconic visage', examine: 'A rare drop from the King Black Dragon.', value: 1000000, category: 'boss', weight: 1 });
define({ id: 731, name: 'KBD head', examine: 'The head of the King Black Dragon.', value: 50000, tradeable: false, category: 'boss', weight: 2 });
define({ id: 732, name: 'Mole claw', examine: 'A large claw from the Giant Mole.', value: 5000, category: 'boss', weight: 0.5 });
define({ id: 733, name: 'Mole skin', examine: 'The skin of the Giant Mole.', value: 5000, category: 'boss', weight: 1 });
define({ id: 734, name: "Dharok's greataxe", examine: 'A powerful Barrows weapon.', value: 200000, category: 'boss', equipSlot: 'weapon', speed: 5, equipReqs: { attack: 70, strength: 70 }, stats: { slash: 103, melee_strength: 105 }, weight: 3 });
define({ id: 735, name: "Verac's flail", examine: 'A Barrows flail.', value: 180000, category: 'boss', equipSlot: 'weapon', speed: 4, equipReqs: { attack: 70 }, stats: { crush: 82, melee_strength: 72 }, weight: 2 });
define({ id: 736, name: "Guthan's warspear", examine: 'A Barrows warspear.', value: 180000, category: 'boss', equipSlot: 'weapon', speed: 4, equipReqs: { attack: 70 }, stats: { stab: 85, melee_strength: 75 }, weight: 2.5 });
define({ id: 737, name: "Ahrim's staff", examine: 'A Barrows staff.', value: 150000, category: 'boss', equipSlot: 'weapon', speed: 4, equipReqs: { attack: 70, magic: 70 }, stats: { magic: 65 }, weight: 2 });
define({ id: 738, name: "Karil's crossbow", examine: 'A Barrows crossbow.', value: 150000, category: 'boss', equipSlot: 'weapon', speed: 4, equipReqs: { ranged: 70 }, stats: { ranged: 84, ranged_strength: 55 }, weight: 2 });
define({ id: 739, name: "Torag's hammers", examine: 'Barrows dual hammers.', value: 150000, category: 'boss', equipSlot: 'weapon', speed: 4, equipReqs: { attack: 70, strength: 70 }, stats: { crush: 85, melee_strength: 72 }, weight: 3 });

// ── Clue scroll tiers ────────────────────────────────────────────────────────
define({ id: 902, name: 'Clue scroll (medium)', examine: 'A medium clue scroll.', value: 100, tradeable: false, category: 'clue', weight: 0 });

// ── Treasure trail rewards (cosmetics) ──────────────────────────────────────
define({ id: 910, name: 'Ranger boots', examine: 'Stylish boots of ranging.', value: 500000, category: 'clue_reward', equipSlot: 'feet', equipReqs: { ranged: 40 }, stats: { ranged: 8 }, weight: 0.5 });
define({ id: 911, name: 'Wizard boots', examine: 'Magical footwear.', value: 100000, category: 'clue_reward', equipSlot: 'feet', equipReqs: { magic: 20 }, stats: { magic: 4 }, weight: 0.5 });
define({ id: 912, name: 'Holy sandals', examine: 'Blessed sandals.', value: 100000, category: 'clue_reward', equipSlot: 'feet', equipReqs: { prayer: 30 }, stats: { prayer: 3 }, weight: 0.3 });
define({ id: 913, name: 'Trimmed armour set', examine: 'A set of trimmed armour.', value: 50000, category: 'clue_reward', weight: 5 });
define({ id: 914, name: 'Gold-trimmed armour set', examine: 'A set of gold-trimmed armour.', value: 75000, category: 'clue_reward', weight: 5 });
define({ id: 915, name: 'Elegant shirt', examine: 'An elegant top.', value: 20000, category: 'clue_reward', equipSlot: 'body', weight: 0.5 });
define({ id: 916, name: 'Elegant legs', examine: 'Elegant leg wear.', value: 20000, category: 'clue_reward', equipSlot: 'legs', weight: 0.5 });

// ── BH emblems ──────────────────────────────────────────────────────────────
define({ id: 920, name: 'BH emblem (tier 1)', examine: 'A bounty hunter emblem.', value: 50000, tradeable: true, category: 'pvp', weight: 0 });
define({ id: 921, name: 'BH emblem (tier 2)', examine: 'A bounty hunter emblem.', value: 100000, tradeable: true, category: 'pvp', weight: 0 });

// ── Slayer helm ──────────────────────────────────────────────────────────────
define({ id: 925, name: 'Slayer helm', examine: 'A helmet imbued with slayer power.', value: 50000, category: 'armour', equipSlot: 'head', equipReqs: { defence: 20, slayer: 55 }, stats: { def_stab: 30, def_slash: 32, def_crush: 27 }, weight: 2 });

module.exports = { define, get, find, search, items, FOOD_HEAL };
