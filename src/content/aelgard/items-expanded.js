// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Expanded Item Database
// Potions, ranged gear, magic gear, herbs, seeds, crafting, fletching, prayer
// Target: 250+ new items to bring total close to 400+
// ══════════════════════════════════════════════════════════════════════════════

const items = require('../../data/items');

// ══════════════════════════════════════════════════════════════════════════════
// RANGED WEAPONS & AMMO
// ══════════════════════════════════════════════════════════════════════════════

// Bows
items.define({ id: 11001, name: 'Shortbow', examine: 'A basic shortbow.', value: 50, category: 'weapon', equipSlot: 'weapon', speed: 3, stats: { ranged: 8 }, equipReqs: { ranged: 1 } });
items.define({ id: 11002, name: 'Oak shortbow', examine: 'An oak shortbow.', value: 100, category: 'weapon', equipSlot: 'weapon', speed: 3, stats: { ranged: 14 }, equipReqs: { ranged: 5 } });
items.define({ id: 11003, name: 'Willow shortbow', examine: 'A willow shortbow.', value: 200, category: 'weapon', equipSlot: 'weapon', speed: 3, stats: { ranged: 20 }, equipReqs: { ranged: 20 } });
items.define({ id: 11004, name: 'Maple shortbow', examine: 'A maple shortbow.', value: 400, category: 'weapon', equipSlot: 'weapon', speed: 3, stats: { ranged: 29 }, equipReqs: { ranged: 30 } });
items.define({ id: 11005, name: 'Yew shortbow', examine: 'A yew shortbow.', value: 800, category: 'weapon', equipSlot: 'weapon', speed: 3, stats: { ranged: 47 }, equipReqs: { ranged: 40 } });
items.define({ id: 11006, name: 'Magic shortbow', examine: 'A shortbow made of magic wood.', value: 1600, category: 'weapon', equipSlot: 'weapon', speed: 3, stats: { ranged: 69 }, equipReqs: { ranged: 50 } });
items.define({ id: 11011, name: 'Longbow', examine: 'A basic longbow.', value: 80, category: 'weapon', equipSlot: 'weapon', speed: 5, stats: { ranged: 8, ranged_strength: 0 }, equipReqs: { ranged: 1 } });
items.define({ id: 11012, name: 'Oak longbow', examine: 'An oak longbow.', value: 160, category: 'weapon', equipSlot: 'weapon', speed: 5, stats: { ranged: 14 }, equipReqs: { ranged: 5 } });
items.define({ id: 11013, name: 'Yew longbow', examine: 'A yew longbow.', value: 1200, category: 'weapon', equipSlot: 'weapon', speed: 5, stats: { ranged: 47 }, equipReqs: { ranged: 40 } });
items.define({ id: 11014, name: 'Magic longbow', examine: 'A longbow made of magic wood.', value: 2400, category: 'weapon', equipSlot: 'weapon', speed: 5, stats: { ranged: 69 }, equipReqs: { ranged: 50 } });

// Crossbows
items.define({ id: 11020, name: 'Bronze crossbow', examine: 'A bronze crossbow.', value: 70, category: 'weapon', equipSlot: 'weapon', speed: 5, stats: { ranged: 18 }, equipReqs: { ranged: 1 } });
items.define({ id: 11021, name: 'Iron crossbow', examine: 'An iron crossbow.', value: 140, category: 'weapon', equipSlot: 'weapon', speed: 5, stats: { ranged: 24 }, equipReqs: { ranged: 16 } });
items.define({ id: 11022, name: 'Steel crossbow', examine: 'A steel crossbow.', value: 300, category: 'weapon', equipSlot: 'weapon', speed: 5, stats: { ranged: 31 }, equipReqs: { ranged: 31 } });
items.define({ id: 11023, name: 'Mithril crossbow', examine: 'A mithril crossbow.', value: 600, category: 'weapon', equipSlot: 'weapon', speed: 5, stats: { ranged: 36 }, equipReqs: { ranged: 36 } });
items.define({ id: 11024, name: 'Adamant crossbow', examine: 'An adamant crossbow.', value: 1200, category: 'weapon', equipSlot: 'weapon', speed: 5, stats: { ranged: 46 }, equipReqs: { ranged: 46 } });
items.define({ id: 11025, name: 'Rune crossbow', examine: 'A rune crossbow.', value: 9000, category: 'weapon', equipSlot: 'weapon', speed: 5, stats: { ranged: 90 }, equipReqs: { ranged: 61 } });

// Arrows
items.define({ id: 11100, name: 'Bronze arrow', examine: 'Bronze arrows.', value: 1, category: 'ranged', stackable: true, weight: 0, stats: { ranged_strength: 7 } });
items.define({ id: 11101, name: 'Iron arrow', examine: 'Iron arrows.', value: 2, category: 'ranged', stackable: true, weight: 0, stats: { ranged_strength: 10 } });
items.define({ id: 11102, name: 'Steel arrow', examine: 'Steel arrows.', value: 6, category: 'ranged', stackable: true, weight: 0, stats: { ranged_strength: 16 } });
items.define({ id: 11103, name: 'Mithril arrow', examine: 'Mithril arrows.', value: 16, category: 'ranged', stackable: true, weight: 0, stats: { ranged_strength: 22 } });
items.define({ id: 11104, name: 'Adamant arrow', examine: 'Adamant arrows.', value: 40, category: 'ranged', stackable: true, weight: 0, stats: { ranged_strength: 31 } });
items.define({ id: 11105, name: 'Rune arrow', examine: 'Rune arrows.', value: 100, category: 'ranged', stackable: true, weight: 0, stats: { ranged_strength: 49 } });

// Bolts
items.define({ id: 11110, name: 'Bronze bolts', examine: 'Bronze crossbow bolts.', value: 1, category: 'ranged', stackable: true, weight: 0, stats: { ranged_strength: 10 } });
items.define({ id: 11111, name: 'Iron bolts', examine: 'Iron crossbow bolts.', value: 3, category: 'ranged', stackable: true, weight: 0, stats: { ranged_strength: 14 } });
items.define({ id: 11112, name: 'Steel bolts', examine: 'Steel crossbow bolts.', value: 8, category: 'ranged', stackable: true, weight: 0, stats: { ranged_strength: 20 } });
items.define({ id: 11113, name: 'Mithril bolts', examine: 'Mithril crossbow bolts.', value: 20, category: 'ranged', stackable: true, weight: 0, stats: { ranged_strength: 27 } });
items.define({ id: 11114, name: 'Adamant bolts', examine: 'Adamant crossbow bolts.', value: 50, category: 'ranged', stackable: true, weight: 0, stats: { ranged_strength: 40 } });
items.define({ id: 11115, name: 'Runite bolts', examine: 'Runite crossbow bolts.', value: 120, category: 'ranged', stackable: true, weight: 0, stats: { ranged_strength: 55 } });

// Ranged armour — d'hide
items.define({ id: 11200, name: 'Leather body', examine: 'Basic leather armour.', value: 20, category: 'armour', equipSlot: 'body', stats: { def_stab: 8, def_slash: 9, def_crush: 7, ranged: 2 }, equipReqs: { defence: 1 } });
items.define({ id: 11201, name: 'Leather chaps', examine: 'Leather leg armour.', value: 15, category: 'armour', equipSlot: 'legs', stats: { def_stab: 4, def_slash: 4, def_crush: 3, ranged: 2 }, equipReqs: { defence: 1 } });
items.define({ id: 11202, name: 'Leather coif', examine: 'A leather coif.', value: 10, category: 'armour', equipSlot: 'head', stats: { def_stab: 2, def_slash: 3, def_crush: 2, ranged: 1 }, equipReqs: { defence: 1 } });
items.define({ id: 11210, name: 'Green dragonhide body', examine: 'Made from green dragon leather.', value: 4000, category: 'armour', equipSlot: 'body', stats: { def_stab: 40, def_slash: 32, def_crush: 45, def_magic: 15, ranged: 15 }, equipReqs: { defence: 40, ranged: 40 } });
items.define({ id: 11211, name: 'Green dragonhide chaps', examine: 'Green dragonhide chaps.', value: 3000, category: 'armour', equipSlot: 'legs', stats: { def_stab: 22, def_slash: 16, def_crush: 24, def_magic: 8, ranged: 8 }, equipReqs: { defence: 40, ranged: 40 } });
items.define({ id: 11212, name: 'Green dragonhide vambraces', examine: 'Green dragonhide vambraces.', value: 2000, category: 'armour', equipSlot: 'hands', stats: { def_magic: 4, ranged: 8 }, equipReqs: { ranged: 40 } });

// ══════════════════════════════════════════════════════════════════════════════
// MAGIC EQUIPMENT
// ══════════════════════════════════════════════════════════════════════════════

// Staves
items.define({ id: 11300, name: 'Staff', examine: 'A basic wooden staff.', value: 15, category: 'weapon', equipSlot: 'weapon', speed: 5, stats: { magic: 4, crush: 7 }, equipReqs: {} });
items.define({ id: 11301, name: 'Staff of air', examine: 'Provides unlimited air runes.', value: 1500, category: 'weapon', equipSlot: 'weapon', speed: 5, stats: { magic: 10, crush: 7 }, equipReqs: { magic: 1 } });
items.define({ id: 11302, name: 'Staff of water', examine: 'Provides unlimited water runes.', value: 1500, category: 'weapon', equipSlot: 'weapon', speed: 5, stats: { magic: 10, crush: 7 }, equipReqs: { magic: 1 } });
items.define({ id: 11303, name: 'Staff of earth', examine: 'Provides unlimited earth runes.', value: 1500, category: 'weapon', equipSlot: 'weapon', speed: 5, stats: { magic: 10, crush: 7 }, equipReqs: { magic: 1 } });
items.define({ id: 11304, name: 'Staff of fire', examine: 'Provides unlimited fire runes.', value: 1500, category: 'weapon', equipSlot: 'weapon', speed: 5, stats: { magic: 10, crush: 7 }, equipReqs: { magic: 1 } });
items.define({ id: 11305, name: 'Mystic staff', examine: 'A staff imbued with magical energy.', value: 25000, category: 'weapon', equipSlot: 'weapon', speed: 5, stats: { magic: 18, magic_strength: 8, crush: 10 }, equipReqs: { magic: 40 } });

// Robes
items.define({ id: 11310, name: 'Wizard hat', examine: 'A pointy wizard hat.', value: 10, category: 'armour', equipSlot: 'head', stats: { magic: 2, def_magic: 2 }, equipReqs: {} });
items.define({ id: 11311, name: 'Wizard robe top', examine: 'A blue wizard robe.', value: 15, category: 'armour', equipSlot: 'body', stats: { magic: 3, def_magic: 3 }, equipReqs: {} });
items.define({ id: 11312, name: 'Wizard robe skirt', examine: 'A blue wizard skirt.', value: 10, category: 'armour', equipSlot: 'legs', stats: { magic: 2, def_magic: 2 }, equipReqs: {} });
items.define({ id: 11315, name: 'Mystic hat', examine: 'Enchanted robes of a skilled wizard.', value: 15000, category: 'armour', equipSlot: 'head', stats: { magic: 6, def_magic: 6, def_stab: 4, def_slash: 4 }, equipReqs: { magic: 40, defence: 20 } });
items.define({ id: 11316, name: 'Mystic robe top', examine: 'Enchanted wizard robes.', value: 30000, category: 'armour', equipSlot: 'body', stats: { magic: 12, def_magic: 12, def_stab: 8, def_slash: 8 }, equipReqs: { magic: 40, defence: 20 } });
items.define({ id: 11317, name: 'Mystic robe bottom', examine: 'Enchanted wizard skirt.', value: 20000, category: 'armour', equipSlot: 'legs', stats: { magic: 8, def_magic: 8, def_stab: 5, def_slash: 5 }, equipReqs: { magic: 40, defence: 20 } });

// Runes
items.define({ id: 11350, name: 'Air rune', examine: 'An air rune.', value: 4, category: 'rune', stackable: true, weight: 0 });
items.define({ id: 11351, name: 'Water rune', examine: 'A water rune.', value: 4, category: 'rune', stackable: true, weight: 0 });
items.define({ id: 11352, name: 'Earth rune', examine: 'An earth rune.', value: 4, category: 'rune', stackable: true, weight: 0 });
items.define({ id: 11353, name: 'Fire rune', examine: 'A fire rune.', value: 4, category: 'rune', stackable: true, weight: 0 });
items.define({ id: 11354, name: 'Mind rune', examine: 'A mind rune.', value: 3, category: 'rune', stackable: true, weight: 0 });
items.define({ id: 11355, name: 'Body rune', examine: 'A body rune.', value: 3, category: 'rune', stackable: true, weight: 0 });
items.define({ id: 11356, name: 'Chaos rune', examine: 'A chaos rune.', value: 90, category: 'rune', stackable: true, weight: 0 });
items.define({ id: 11357, name: 'Death rune', examine: 'A death rune.', value: 180, category: 'rune', stackable: true, weight: 0 });
items.define({ id: 11358, name: 'Blood rune', examine: 'A blood rune.', value: 250, category: 'rune', stackable: true, weight: 0 });
items.define({ id: 11359, name: 'Nature rune', examine: 'A nature rune.', value: 150, category: 'rune', stackable: true, weight: 0 });
items.define({ id: 11360, name: 'Law rune', examine: 'A law rune.', value: 200, category: 'rune', stackable: true, weight: 0 });
items.define({ id: 11361, name: 'Cosmic rune', examine: 'A cosmic rune.', value: 100, category: 'rune', stackable: true, weight: 0 });
items.define({ id: 11362, name: 'Astral rune', examine: 'An astral rune.', value: 120, category: 'rune', stackable: true, weight: 0 });
items.define({ id: 11363, name: 'Soul rune', examine: 'A soul rune.', value: 300, category: 'rune', stackable: true, weight: 0 });
items.define({ id: 11364, name: 'Wrath rune', examine: 'A wrath rune.', value: 350, category: 'rune', stackable: true, weight: 0 });

// ══════════════════════════════════════════════════════════════════════════════
// HERBLORE — Herbs, Secondaries, Potions
// ══════════════════════════════════════════════════════════════════════════════

// Grimy herbs
items.define({ id: 12001, name: 'Grimy guam', examine: 'An unidentified herb.', value: 5, category: 'herblore', weight: 0.1 });
items.define({ id: 12002, name: 'Grimy marrentill', examine: 'An unidentified herb.', value: 10, category: 'herblore', weight: 0.1 });
items.define({ id: 12003, name: 'Grimy tarromin', examine: 'An unidentified herb.', value: 15, category: 'herblore', weight: 0.1 });
items.define({ id: 12004, name: 'Grimy harralander', examine: 'An unidentified herb.', value: 20, category: 'herblore', weight: 0.1 });
items.define({ id: 12005, name: 'Grimy ranarr', examine: 'An unidentified herb.', value: 150, category: 'herblore', weight: 0.1 });
items.define({ id: 12006, name: 'Grimy irit', examine: 'An unidentified herb.', value: 40, category: 'herblore', weight: 0.1 });
items.define({ id: 12007, name: 'Grimy avantoe', examine: 'An unidentified herb.', value: 60, category: 'herblore', weight: 0.1 });
items.define({ id: 12008, name: 'Grimy kwuarm', examine: 'An unidentified herb.', value: 80, category: 'herblore', weight: 0.1 });
items.define({ id: 12009, name: 'Grimy snapdragon', examine: 'An unidentified herb.', value: 200, category: 'herblore', weight: 0.1 });
items.define({ id: 12010, name: 'Grimy cadantine', examine: 'An unidentified herb.', value: 100, category: 'herblore', weight: 0.1 });
items.define({ id: 12011, name: 'Grimy lantadyme', examine: 'An unidentified herb.', value: 120, category: 'herblore', weight: 0.1 });
items.define({ id: 12012, name: 'Grimy dwarf weed', examine: 'An unidentified herb.', value: 150, category: 'herblore', weight: 0.1 });
items.define({ id: 12013, name: 'Grimy torstol', examine: 'An unidentified herb.', value: 500, category: 'herblore', weight: 0.1 });

// Clean herbs
items.define({ id: 12101, name: 'Guam leaf', examine: 'A clean guam leaf.', value: 8, category: 'herblore', weight: 0.1 });
items.define({ id: 12102, name: 'Marrentill', examine: 'A clean marrentill.', value: 15, category: 'herblore', weight: 0.1 });
items.define({ id: 12103, name: 'Tarromin', examine: 'A clean tarromin.', value: 20, category: 'herblore', weight: 0.1 });
items.define({ id: 12104, name: 'Harralander', examine: 'A clean harralander.', value: 25, category: 'herblore', weight: 0.1 });
items.define({ id: 12105, name: 'Ranarr weed', examine: 'A clean ranarr weed.', value: 200, category: 'herblore', weight: 0.1 });
items.define({ id: 12106, name: 'Irit leaf', examine: 'A clean irit leaf.', value: 50, category: 'herblore', weight: 0.1 });
items.define({ id: 12107, name: 'Avantoe', examine: 'A clean avantoe.', value: 70, category: 'herblore', weight: 0.1 });
items.define({ id: 12108, name: 'Kwuarm', examine: 'A clean kwuarm.', value: 100, category: 'herblore', weight: 0.1 });
items.define({ id: 12109, name: 'Snapdragon', examine: 'A clean snapdragon.', value: 250, category: 'herblore', weight: 0.1 });
items.define({ id: 12110, name: 'Cadantine', examine: 'A clean cadantine.', value: 120, category: 'herblore', weight: 0.1 });
items.define({ id: 12111, name: 'Lantadyme', examine: 'A clean lantadyme.', value: 150, category: 'herblore', weight: 0.1 });
items.define({ id: 12112, name: 'Dwarf weed', examine: 'A clean dwarf weed.', value: 180, category: 'herblore', weight: 0.1 });
items.define({ id: 12113, name: 'Torstol', examine: 'A clean torstol.', value: 600, category: 'herblore', weight: 0.1 });

// Secondaries
items.define({ id: 12200, name: 'Vial of water', examine: 'A vial of water.', value: 2, category: 'herblore', weight: 0.3 });
items.define({ id: 12201, name: 'Eye of newt', examine: 'The eye of a newt.', value: 5, category: 'herblore', weight: 0.1 });
items.define({ id: 12202, name: 'Unicorn horn dust', examine: 'Ground unicorn horn.', value: 50, category: 'herblore', weight: 0.1 });
items.define({ id: 12203, name: 'Limpwurt root', examine: 'A limpwurt root.', value: 30, category: 'herblore', weight: 0.1 });
items.define({ id: 12204, name: 'Red spiders eggs', examine: 'Red spider eggs.', value: 50, category: 'herblore', weight: 0.1 });
items.define({ id: 12205, name: 'White berries', examine: 'White berries.', value: 40, category: 'herblore', weight: 0.1 });
items.define({ id: 12206, name: 'Snape grass', examine: 'Snape grass.', value: 30, category: 'herblore', weight: 0.2 });
items.define({ id: 12207, name: 'Wine of zamorak', examine: 'Wine dedicated to Zamorak.', value: 150, category: 'herblore', weight: 0.3 });
items.define({ id: 12208, name: 'Crushed nest', examine: 'Crushed bird nest.', value: 200, category: 'herblore', weight: 0.1 });
items.define({ id: 12209, name: 'Potato cactus', examine: 'A cactus fruit.', value: 60, category: 'herblore', weight: 0.2 });

// Potions (4 dose)
items.define({ id: 12301, name: 'Attack potion(4)', examine: 'Temporarily boosts Attack.', value: 50, category: 'potion', weight: 0.5 });
items.define({ id: 12302, name: 'Strength potion(4)', examine: 'Temporarily boosts Strength.', value: 50, category: 'potion', weight: 0.5 });
items.define({ id: 12303, name: 'Defence potion(4)', examine: 'Temporarily boosts Defence.', value: 50, category: 'potion', weight: 0.5 });
items.define({ id: 12304, name: 'Prayer potion(4)', examine: 'Restores Prayer points.', value: 300, category: 'potion', weight: 0.5 });
items.define({ id: 12305, name: 'Super attack(4)', examine: 'Greatly boosts Attack.', value: 200, category: 'potion', weight: 0.5 });
items.define({ id: 12306, name: 'Super strength(4)', examine: 'Greatly boosts Strength.', value: 200, category: 'potion', weight: 0.5 });
items.define({ id: 12307, name: 'Super defence(4)', examine: 'Greatly boosts Defence.', value: 200, category: 'potion', weight: 0.5 });
items.define({ id: 12308, name: 'Ranging potion(4)', examine: 'Boosts Ranged.', value: 250, category: 'potion', weight: 0.5 });
items.define({ id: 12309, name: 'Magic potion(4)', examine: 'Boosts Magic.', value: 250, category: 'potion', weight: 0.5 });
items.define({ id: 12310, name: 'Antipoison(4)', examine: 'Cures poison.', value: 100, category: 'potion', weight: 0.5 });
items.define({ id: 12311, name: 'Energy potion(4)', examine: 'Restores run energy.', value: 80, category: 'potion', weight: 0.5 });
items.define({ id: 12312, name: 'Super restore(4)', examine: 'Restores all stats and prayer.', value: 500, category: 'potion', weight: 0.5 });
items.define({ id: 12313, name: 'Saradomin brew(4)', examine: 'Heals significantly but reduces stats.', value: 400, category: 'potion', weight: 0.5 });
items.define({ id: 12314, name: 'Antifire(4)', examine: 'Provides partial dragon fire protection.', value: 200, category: 'potion', weight: 0.5 });
items.define({ id: 12315, name: 'Stamina potion(4)', examine: 'Reduces run energy drain.', value: 600, category: 'potion', weight: 0.5 });
items.define({ id: 12316, name: 'Combat potion(4)', examine: 'Boosts Attack and Strength.', value: 150, category: 'potion', weight: 0.5 });
items.define({ id: 12317, name: 'Bastion potion(4)', examine: 'Boosts Ranged and Defence.', value: 350, category: 'potion', weight: 0.5 });
items.define({ id: 12318, name: 'Battlemage potion(4)', examine: 'Boosts Magic and Defence.', value: 350, category: 'potion', weight: 0.5 });

// ══════════════════════════════════════════════════════════════════════════════
// FARMING SEEDS
// ══════════════════════════════════════════════════════════════════════════════

items.define({ id: 12401, name: 'Potato seed', examine: 'A potato seed.', value: 1, category: 'farming', stackable: true, weight: 0 });
items.define({ id: 12402, name: 'Onion seed', examine: 'An onion seed.', value: 2, category: 'farming', stackable: true, weight: 0 });
items.define({ id: 12403, name: 'Cabbage seed', examine: 'A cabbage seed.', value: 2, category: 'farming', stackable: true, weight: 0 });
items.define({ id: 12404, name: 'Tomato seed', examine: 'A tomato seed.', value: 3, category: 'farming', stackable: true, weight: 0 });
items.define({ id: 12405, name: 'Sweetcorn seed', examine: 'A sweetcorn seed.', value: 10, category: 'farming', stackable: true, weight: 0 });
items.define({ id: 12406, name: 'Strawberry seed', examine: 'A strawberry seed.', value: 20, category: 'farming', stackable: true, weight: 0 });
items.define({ id: 12407, name: 'Watermelon seed', examine: 'A watermelon seed.', value: 80, category: 'farming', stackable: true, weight: 0 });
items.define({ id: 12410, name: 'Guam seed', examine: 'Plant in a herb patch.', value: 5, category: 'farming', stackable: true, weight: 0 });
items.define({ id: 12411, name: 'Marrentill seed', examine: 'Plant in a herb patch.', value: 10, category: 'farming', stackable: true, weight: 0 });
items.define({ id: 12412, name: 'Tarromin seed', examine: 'Plant in a herb patch.', value: 15, category: 'farming', stackable: true, weight: 0 });
items.define({ id: 12413, name: 'Harralander seed', examine: 'Plant in a herb patch.', value: 20, category: 'farming', stackable: true, weight: 0 });
items.define({ id: 12414, name: 'Ranarr seed', examine: 'Plant in a herb patch. Valuable.', value: 500, category: 'farming', stackable: true, weight: 0 });
items.define({ id: 12415, name: 'Snapdragon seed', examine: 'Plant in a herb patch.', value: 800, category: 'farming', stackable: true, weight: 0 });
items.define({ id: 12416, name: 'Torstol seed', examine: 'Plant in a herb patch. Very valuable.', value: 2000, category: 'farming', stackable: true, weight: 0 });
items.define({ id: 12420, name: 'Oak seed', examine: 'Plant in a tree patch.', value: 50, category: 'farming', stackable: true, weight: 0 });
items.define({ id: 12421, name: 'Willow seed', examine: 'Plant in a tree patch.', value: 200, category: 'farming', stackable: true, weight: 0 });
items.define({ id: 12422, name: 'Maple seed', examine: 'Plant in a tree patch.', value: 1000, category: 'farming', stackable: true, weight: 0 });
items.define({ id: 12423, name: 'Yew seed', examine: 'Plant in a tree patch.', value: 5000, category: 'farming', stackable: true, weight: 0 });
items.define({ id: 12424, name: 'Magic seed', examine: 'Plant in a tree patch. Very rare.', value: 15000, category: 'farming', stackable: true, weight: 0 });

// ══════════════════════════════════════════════════════════════════════════════
// CRAFTING MATERIALS & PRODUCTS
// ══════════════════════════════════════════════════════════════════════════════

// Gems
items.define({ id: 12501, name: 'Uncut sapphire', examine: 'An uncut sapphire.', value: 25, category: 'crafting', weight: 0.2 });
items.define({ id: 12502, name: 'Uncut emerald', examine: 'An uncut emerald.', value: 50, category: 'crafting', weight: 0.2 });
items.define({ id: 12503, name: 'Uncut ruby', examine: 'An uncut ruby.', value: 100, category: 'crafting', weight: 0.2 });
items.define({ id: 12504, name: 'Uncut diamond', examine: 'An uncut diamond.', value: 200, category: 'crafting', weight: 0.2 });
items.define({ id: 12505, name: 'Uncut dragonstone', examine: 'An uncut dragonstone.', value: 800, category: 'crafting', weight: 0.2 });
items.define({ id: 12511, name: 'Sapphire', examine: 'A polished sapphire.', value: 50, category: 'crafting', weight: 0.1 });
items.define({ id: 12512, name: 'Emerald', examine: 'A polished emerald.', value: 100, category: 'crafting', weight: 0.1 });
items.define({ id: 12513, name: 'Ruby', examine: 'A polished ruby.', value: 200, category: 'crafting', weight: 0.1 });
items.define({ id: 12514, name: 'Diamond', examine: 'A polished diamond.', value: 400, category: 'crafting', weight: 0.1 });
items.define({ id: 12515, name: 'Dragonstone', examine: 'A polished dragonstone.', value: 1500, category: 'crafting', weight: 0.1 });

// Jewellery
items.define({ id: 12520, name: 'Gold ring', examine: 'A gold ring.', value: 200, category: 'jewellery', equipSlot: 'ring', stats: {}, equipReqs: {} });
items.define({ id: 12521, name: 'Sapphire ring', examine: 'A sapphire ring.', value: 500, category: 'jewellery', equipSlot: 'ring', stats: {}, equipReqs: {} });
items.define({ id: 12522, name: 'Emerald ring', examine: 'An emerald ring.', value: 800, category: 'jewellery', equipSlot: 'ring', stats: {}, equipReqs: {} });
items.define({ id: 12523, name: 'Ruby ring', examine: 'A ruby ring.', value: 1500, category: 'jewellery', equipSlot: 'ring', stats: {}, equipReqs: {} });
items.define({ id: 12524, name: 'Diamond ring', examine: 'A diamond ring.', value: 3000, category: 'jewellery', equipSlot: 'ring', stats: {}, equipReqs: {} });
items.define({ id: 12530, name: 'Gold necklace', examine: 'A gold necklace.', value: 300, category: 'jewellery', equipSlot: 'neck', stats: {}, equipReqs: {} });
items.define({ id: 12531, name: 'Sapphire necklace', examine: 'A sapphire necklace.', value: 700, category: 'jewellery', equipSlot: 'neck', stats: {}, equipReqs: {} });
items.define({ id: 12540, name: 'Gold amulet', examine: 'A gold amulet.', value: 400, category: 'jewellery', equipSlot: 'neck', stats: {}, equipReqs: {} });
items.define({ id: 12541, name: 'Amulet of strength', examine: 'Boosts melee strength.', value: 2000, category: 'jewellery', equipSlot: 'neck', stats: { melee_strength: 10 }, equipReqs: {} });
items.define({ id: 12542, name: 'Amulet of glory', examine: 'A powerful enchanted amulet.', value: 15000, category: 'jewellery', equipSlot: 'neck', stats: { stab: 10, slash: 10, crush: 10, magic: 10, ranged: 10, melee_strength: 6, prayer: 3 }, equipReqs: {} });
items.define({ id: 12543, name: 'Amulet of fury', examine: 'The most powerful combat amulet.', value: 50000, category: 'jewellery', equipSlot: 'neck', stats: { stab: 15, slash: 15, crush: 15, magic: 15, ranged: 15, melee_strength: 8, prayer: 5, def_stab: 15, def_slash: 15, def_crush: 15, def_magic: 15, def_ranged: 15 }, equipReqs: {} });

// ══════════════════════════════════════════════════════════════════════════════
// PRAYER ITEMS
// ══════════════════════════════════════════════════════════════════════════════

items.define({ id: 12601, name: 'Ensouled head', examine: 'A head with residual spiritual energy.', value: 100, category: 'prayer', weight: 1 });
items.define({ id: 12602, name: 'Superior dragon bones', examine: 'Extremely powerful dragon bones.', value: 10000, category: 'prayer', weight: 2 });
items.define({ id: 12603, name: 'Wyvern bones', examine: 'Bones from a wyvern.', value: 5000, category: 'prayer', weight: 1.5 });

// ══════════════════════════════════════════════════════════════════════════════
// FLETCHING SUPPLIES
// ══════════════════════════════════════════════════════════════════════════════

items.define({ id: 12701, name: 'Arrow shaft', examine: 'A shaft for making arrows.', value: 1, category: 'fletching', stackable: true, weight: 0 });
items.define({ id: 12702, name: 'Headless arrow', examine: 'An arrow with feathers but no tip.', value: 2, category: 'fletching', stackable: true, weight: 0 });
items.define({ id: 12703, name: 'Bronze arrowtips', examine: 'Bronze arrowheads.', value: 1, category: 'fletching', stackable: true, weight: 0 });
items.define({ id: 12704, name: 'Iron arrowtips', examine: 'Iron arrowheads.', value: 3, category: 'fletching', stackable: true, weight: 0 });
items.define({ id: 12705, name: 'Steel arrowtips', examine: 'Steel arrowheads.', value: 8, category: 'fletching', stackable: true, weight: 0 });
items.define({ id: 12706, name: 'Mithril arrowtips', examine: 'Mithril arrowheads.', value: 20, category: 'fletching', stackable: true, weight: 0 });
items.define({ id: 12707, name: 'Adamant arrowtips', examine: 'Adamant arrowheads.', value: 50, category: 'fletching', stackable: true, weight: 0 });
items.define({ id: 12708, name: 'Rune arrowtips', examine: 'Rune arrowheads.', value: 120, category: 'fletching', stackable: true, weight: 0 });
items.define({ id: 12710, name: 'Bow string', examine: 'A string for a bow.', value: 50, category: 'fletching', weight: 0.1 });
items.define({ id: 12711, name: 'Crossbow string', examine: 'A string for a crossbow.', value: 80, category: 'fletching', weight: 0.1 });
items.define({ id: 12712, name: 'Feather', examine: 'A feather. Used in fletching and fishing.', value: 2, category: 'fletching', stackable: true, weight: 0 });

// ══════════════════════════════════════════════════════════════════════════════
// MISC / UTILITY
// ══════════════════════════════════════════════════════════════════════════════

items.define({ id: 12801, name: 'Rope', examine: 'A length of rope.', value: 20, category: 'misc', weight: 1 });
items.define({ id: 12802, name: 'Tinderbox', examine: 'Used to light fires.', value: 5, category: 'tool', weight: 0.5 });
items.define({ id: 12803, name: 'Knife', examine: 'A small knife. Used in crafting and fletching.', value: 10, category: 'tool', weight: 0.3 });
items.define({ id: 12804, name: 'Chisel', examine: 'Used to cut gems.', value: 5, category: 'tool', weight: 0.3 });
items.define({ id: 12805, name: 'Hammer', examine: 'Used in smithing.', value: 5, category: 'tool', weight: 1 });
items.define({ id: 12806, name: 'Needle', examine: 'Used in crafting leather.', value: 3, category: 'tool', weight: 0.1 });
items.define({ id: 12807, name: 'Thread', examine: 'Used in crafting.', value: 3, category: 'crafting', stackable: true, weight: 0 });
items.define({ id: 12808, name: 'Bucket', examine: 'An empty bucket.', value: 3, category: 'misc', weight: 1 });
items.define({ id: 12809, name: 'Bucket of water', examine: 'A bucket of water.', value: 5, category: 'misc', weight: 2 });
items.define({ id: 12810, name: 'Jug', examine: 'An empty jug.', value: 2, category: 'misc', weight: 0.5 });
items.define({ id: 12811, name: 'Jug of water', examine: 'A jug of water.', value: 5, category: 'misc', weight: 1 });
items.define({ id: 12812, name: 'Pot of flour', examine: 'A pot of flour.', value: 8, category: 'cooking', weight: 1 });
items.define({ id: 12813, name: 'Bread dough', examine: 'Raw bread dough.', value: 10, category: 'cooking', weight: 0.5 });
items.define({ id: 12814, name: 'Pie dish', examine: 'A dish for making pies.', value: 3, category: 'cooking', weight: 0.3 });
items.define({ id: 12815, name: 'Cake tin', examine: 'A tin for baking cakes.', value: 5, category: 'cooking', weight: 0.5 });
items.define({ id: 12816, name: 'Compost', examine: 'Compost for farming.', value: 10, category: 'farming', weight: 2 });
items.define({ id: 12817, name: 'Supercompost', examine: 'High-quality compost.', value: 50, category: 'farming', weight: 2 });
items.define({ id: 12818, name: 'Spade', examine: 'Used for digging.', value: 5, category: 'tool', weight: 1 });
items.define({ id: 12819, name: 'Rake', examine: 'Used for clearing farming patches.', value: 8, category: 'tool', weight: 1 });
items.define({ id: 12820, name: 'Seed dibber', examine: 'Used for planting seeds.', value: 5, category: 'tool', weight: 0.5 });
items.define({ id: 12821, name: 'Secateurs', examine: 'Used for cutting plants.', value: 10, category: 'tool', weight: 0.5 });
items.define({ id: 12822, name: 'Watering can', examine: 'Used to water crops.', value: 15, category: 'tool', weight: 0.5 });

// Teleport tablets
items.define({ id: 12901, name: 'Heartlands teleport', examine: 'Teleports you to the Heartlands.', value: 500, category: 'misc', stackable: true, weight: 0 });
items.define({ id: 12902, name: 'Saltbrine teleport', examine: 'Teleports you to Saltbrine Reach.', value: 800, category: 'misc', stackable: true, weight: 0 });
items.define({ id: 12903, name: 'Sootworks teleport', examine: 'Teleports you to the Sootworks.', value: 800, category: 'misc', stackable: true, weight: 0 });
items.define({ id: 12904, name: 'Moryskah teleport', examine: 'Teleports you to Moryskah.', value: 800, category: 'misc', stackable: true, weight: 0 });
items.define({ id: 12905, name: 'Veilwood teleport', examine: 'Teleports you to Veilwood.', value: 800, category: 'misc', stackable: true, weight: 0 });

console.log('[aelgard] Expanded items loaded (~250 new items)');
