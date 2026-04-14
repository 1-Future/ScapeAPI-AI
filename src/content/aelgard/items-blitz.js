// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Item Blitz
// Pure volume. Every smithing product, every food tier, every ammo variant,
// every quest item, every skilling outfit, every teleport jewellery.
// Target: 500+ new items in this file alone.
// ══════════════════════════════════════════════════════════════════════════════

const items = require('../../data/items');
const d = (id, name, examine, value, category, opts = {}) =>
  items.define({ id, name, examine, value, category, ...opts });

// ══════════════════════════════════════════════════════════════════════════════
// SMITHING PRODUCTS — every bar → every weapon/armour piece
// Bronze (1), Iron (1), Steel (5), Mithril (20), Adamant (30), Rune (40)
// ══════════════════════════════════════════════════════════════════════════════

// Iron tier (missing pieces)
d(40001, 'Iron pickaxe', 'An iron pickaxe.', 35, 'weapon', { equipSlot: 'weapon', speed: 5, stats: { stab: 5, melee_strength: 4 }, equipReqs: { attack: 1 } });
d(40002, 'Iron axe', 'An iron hatchet.', 28, 'weapon', { equipSlot: 'weapon', speed: 5, stats: { slash: 6, melee_strength: 5 }, equipReqs: { attack: 1 } });
d(40003, 'Iron dagger', 'A short iron blade.', 25, 'weapon', { equipSlot: 'weapon', speed: 4, stats: { stab: 8, melee_strength: 5 }, equipReqs: { attack: 1 } });
d(40004, 'Iron mace', 'An iron mace.', 30, 'weapon', { equipSlot: 'weapon', speed: 4, stats: { crush: 10, melee_strength: 7, prayer: 1 }, equipReqs: { attack: 1 } });
d(40005, 'Iron platelegs', 'Iron leg armour.', 168, 'armour', { equipSlot: 'legs', stats: { def_stab: 10, def_slash: 9, def_crush: 7 }, equipReqs: { defence: 1 } });
d(40006, 'Iron kiteshield', 'An iron shield.', 110, 'armour', { equipSlot: 'shield', stats: { def_stab: 7, def_slash: 9, def_crush: 8 }, equipReqs: { defence: 1 } });
d(40007, 'Iron chainbody', 'An iron chainbody.', 84, 'armour', { equipSlot: 'body', stats: { def_stab: 13, def_slash: 17, def_crush: 9 }, equipReqs: { defence: 1 } });
d(40008, 'Iron med helm', 'An iron medium helmet.', 46, 'armour', { equipSlot: 'head', stats: { def_stab: 4, def_slash: 5, def_crush: 3 }, equipReqs: { defence: 1 } });
d(40009, 'Iron warhammer', 'An iron warhammer.', 56, 'weapon', { equipSlot: 'weapon', speed: 6, stats: { crush: 14, melee_strength: 13 }, equipReqs: { attack: 1 } });
d(40010, 'Iron battleaxe', 'An iron battleaxe.', 70, 'weapon', { equipSlot: 'weapon', speed: 6, stats: { slash: 11, melee_strength: 14 }, equipReqs: { attack: 1 } });

// Steel tier (fill gaps)
d(40101, 'Steel dagger', 'A steel dagger.', 60, 'weapon', { equipSlot: 'weapon', speed: 4, stats: { stab: 12, melee_strength: 8 }, equipReqs: { attack: 5 } });
d(40102, 'Steel mace', 'A steel mace.', 70, 'weapon', { equipSlot: 'weapon', speed: 4, stats: { crush: 15, melee_strength: 10, prayer: 1 }, equipReqs: { attack: 5 } });
d(40103, 'Steel pickaxe', 'A steel pickaxe.', 80, 'weapon', { equipSlot: 'weapon', speed: 5, stats: { stab: 8, melee_strength: 6 }, equipReqs: { attack: 5 } });
d(40104, 'Steel axe', 'A steel hatchet.', 65, 'weapon', { equipSlot: 'weapon', speed: 5, stats: { slash: 9, melee_strength: 7 }, equipReqs: { attack: 5 } });
d(40105, 'Steel warhammer', 'A steel warhammer.', 130, 'weapon', { equipSlot: 'weapon', speed: 6, stats: { crush: 21, melee_strength: 20 }, equipReqs: { attack: 5 } });
d(40106, 'Steel battleaxe', 'A steel battleaxe.', 160, 'weapon', { equipSlot: 'weapon', speed: 6, stats: { slash: 17, melee_strength: 22 }, equipReqs: { attack: 5 } });
d(40107, 'Steel chainbody', 'A steel chainbody.', 200, 'armour', { equipSlot: 'body', stats: { def_stab: 18, def_slash: 23, def_crush: 12 }, equipReqs: { defence: 5 } });
d(40108, 'Steel kiteshield', 'A steel shield.', 260, 'armour', { equipSlot: 'shield', stats: { def_stab: 10, def_slash: 13, def_crush: 11 }, equipReqs: { defence: 5 } });
d(40109, 'Steel med helm', 'A steel medium helmet.', 110, 'armour', { equipSlot: 'head', stats: { def_stab: 6, def_slash: 7, def_crush: 5 }, equipReqs: { defence: 5 } });
d(40110, 'Steel plateskirt', 'A steel plateskirt.', 400, 'armour', { equipSlot: 'legs', stats: { def_stab: 14, def_slash: 13, def_crush: 10 }, equipReqs: { defence: 5 } });

// Mithril (fill gaps)
d(40201, 'Mithril dagger', 'A mithril dagger.', 200, 'weapon', { equipSlot: 'weapon', speed: 4, stats: { stab: 17, melee_strength: 13 }, equipReqs: { attack: 20 } });
d(40202, 'Mithril mace', 'A mithril mace.', 240, 'weapon', { equipSlot: 'weapon', speed: 4, stats: { crush: 21, melee_strength: 15, prayer: 2 }, equipReqs: { attack: 20 } });
d(40203, 'Mithril warhammer', 'A mithril warhammer.', 390, 'weapon', { equipSlot: 'weapon', speed: 6, stats: { crush: 30, melee_strength: 28 }, equipReqs: { attack: 20 } });
d(40204, 'Mithril battleaxe', 'A mithril battleaxe.', 480, 'weapon', { equipSlot: 'weapon', speed: 6, stats: { slash: 25, melee_strength: 30 }, equipReqs: { attack: 20 } });
d(40205, 'Mithril chainbody', 'A mithril chainbody.', 800, 'armour', { equipSlot: 'body', stats: { def_stab: 25, def_slash: 32, def_crush: 18 }, equipReqs: { defence: 20 } });
d(40206, 'Mithril platelegs', 'Mithril leg armour.', 1680, 'armour', { equipSlot: 'legs', stats: { def_stab: 20, def_slash: 18, def_crush: 15 }, equipReqs: { defence: 20 } });
d(40207, 'Mithril kiteshield', 'A mithril shield.', 2200, 'armour', { equipSlot: 'shield', stats: { def_stab: 15, def_slash: 18, def_crush: 16 }, equipReqs: { defence: 20 } });
d(40208, 'Mithril pickaxe', 'A mithril pickaxe.', 500, 'weapon', { equipSlot: 'weapon', speed: 5, stats: { stab: 12, melee_strength: 9 }, equipReqs: { attack: 20 } });
d(40209, 'Mithril axe', 'A mithril hatchet.', 400, 'weapon', { equipSlot: 'weapon', speed: 5, stats: { slash: 13, melee_strength: 10 }, equipReqs: { attack: 20 } });

// Adamant (fill gaps)
d(40301, 'Adamant dagger', 'An adamant dagger.', 500, 'weapon', { equipSlot: 'weapon', speed: 4, stats: { stab: 24, melee_strength: 19 }, equipReqs: { attack: 30 } });
d(40302, 'Adamant mace', 'An adamant mace.', 600, 'weapon', { equipSlot: 'weapon', speed: 4, stats: { crush: 29, melee_strength: 22, prayer: 2 }, equipReqs: { attack: 30 } });
d(40303, 'Adamant warhammer', 'An adamant warhammer.', 960, 'weapon', { equipSlot: 'weapon', speed: 6, stats: { crush: 39, melee_strength: 38 }, equipReqs: { attack: 30 } });
d(40304, 'Adamant battleaxe', 'An adamant battleaxe.', 1200, 'weapon', { equipSlot: 'weapon', speed: 6, stats: { slash: 33, melee_strength: 40 }, equipReqs: { attack: 30 } });
d(40305, 'Adamant chainbody', 'An adamant chainbody.', 1920, 'armour', { equipSlot: 'body', stats: { def_stab: 36, def_slash: 44, def_crush: 28 }, equipReqs: { defence: 30 } });
d(40306, 'Adamant platelegs', 'Adamant leg armour.', 4000, 'armour', { equipSlot: 'legs', stats: { def_stab: 29, def_slash: 27, def_crush: 24 }, equipReqs: { defence: 30 } });
d(40307, 'Adamant full helm', 'An adamant full helm.', 1632, 'armour', { equipSlot: 'head', stats: { def_stab: 19, def_slash: 21, def_crush: 16 }, equipReqs: { defence: 30 } });
d(40308, 'Adamant kiteshield', 'An adamant shield.', 5400, 'armour', { equipSlot: 'shield', stats: { def_stab: 22, def_slash: 26, def_crush: 24 }, equipReqs: { defence: 30 } });
d(40309, 'Adamant pickaxe', 'An adamant pickaxe.', 1300, 'weapon', { equipSlot: 'weapon', speed: 5, stats: { stab: 16, melee_strength: 13 }, equipReqs: { attack: 30 } });
d(40310, 'Adamant axe', 'An adamant hatchet.', 1000, 'weapon', { equipSlot: 'weapon', speed: 5, stats: { slash: 17, melee_strength: 14 }, equipReqs: { attack: 30 } });

// Rune (fill gaps)
d(40401, 'Rune dagger', 'A rune dagger.', 5000, 'weapon', { equipSlot: 'weapon', speed: 4, stats: { stab: 30, melee_strength: 25 }, equipReqs: { attack: 40 } });
d(40402, 'Rune mace', 'A rune mace.', 7000, 'weapon', { equipSlot: 'weapon', speed: 4, stats: { crush: 36, melee_strength: 30, prayer: 3 }, equipReqs: { attack: 40 } });
d(40403, 'Rune warhammer', 'A rune warhammer.', 12000, 'weapon', { equipSlot: 'weapon', speed: 6, stats: { crush: 48, melee_strength: 48 }, equipReqs: { attack: 40 } });
d(40404, 'Rune battleaxe', 'A rune battleaxe.', 15000, 'weapon', { equipSlot: 'weapon', speed: 6, stats: { slash: 42, melee_strength: 50 }, equipReqs: { attack: 40 } });
d(40405, 'Rune chainbody', 'A rune chainbody.', 25000, 'armour', { equipSlot: 'body', stats: { def_stab: 51, def_slash: 63, def_crush: 42 }, equipReqs: { defence: 40 } });
d(40406, 'Rune med helm', 'A rune medium helmet.', 8000, 'armour', { equipSlot: 'head', stats: { def_stab: 22, def_slash: 24, def_crush: 20 }, equipReqs: { defence: 40 } });
d(40407, 'Rune kiteshield', 'A rune shield.', 32000, 'armour', { equipSlot: 'shield', stats: { def_stab: 30, def_slash: 35, def_crush: 33 }, equipReqs: { defence: 40 } });
d(40408, 'Rune pickaxe', 'A rune pickaxe.', 15000, 'weapon', { equipSlot: 'weapon', speed: 5, stats: { stab: 22, melee_strength: 18 }, equipReqs: { attack: 40 } });
d(40409, 'Rune axe', 'A rune hatchet.', 10000, 'weapon', { equipSlot: 'weapon', speed: 5, stats: { slash: 23, melee_strength: 19 }, equipReqs: { attack: 40 } });
d(40410, 'Rune longsword', 'A rune longsword.', 18000, 'weapon', { equipSlot: 'weapon', speed: 5, stats: { slash: 40, melee_strength: 43 }, equipReqs: { attack: 40 } });
d(40411, 'Rune 2h sword', 'A rune two-handed sword.', 25000, 'weapon', { equipSlot: 'weapon', speed: 7, stats: { slash: 69, melee_strength: 70 }, equipReqs: { attack: 40 } });
d(40412, 'Rune plateskirt', 'A rune plateskirt.', 35000, 'armour', { equipSlot: 'legs', stats: { def_stab: 51, def_slash: 49, def_crush: 47 }, equipReqs: { defence: 40 } });
d(40413, 'Rune sq shield', 'A rune square shield.', 20000, 'armour', { equipSlot: 'shield', stats: { def_stab: 24, def_slash: 28, def_crush: 26 }, equipReqs: { defence: 40 } });

// Black tier (level 10 — between iron and steel, not smithable, monster drop only)
d(40501, 'Black sword', 'A dark sword.', 100, 'weapon', { equipSlot: 'weapon', speed: 4, stats: { slash: 12, melee_strength: 11 }, equipReqs: { attack: 10 } });
d(40502, 'Black scimitar', 'A dark scimitar.', 128, 'weapon', { equipSlot: 'weapon', speed: 4, stats: { slash: 16, melee_strength: 12 }, equipReqs: { attack: 10 } });
d(40503, 'Black dagger', 'A dark dagger.', 45, 'weapon', { equipSlot: 'weapon', speed: 4, stats: { stab: 10, melee_strength: 7 }, equipReqs: { attack: 10 } });
d(40504, 'Black full helm', 'A black full helmet.', 176, 'armour', { equipSlot: 'head', stats: { def_stab: 8, def_slash: 9, def_crush: 6 }, equipReqs: { defence: 10 } });
d(40505, 'Black platebody', 'A black platebody.', 640, 'armour', { equipSlot: 'body', stats: { def_stab: 24, def_slash: 23, def_crush: 15 }, equipReqs: { defence: 10 } });
d(40506, 'Black platelegs', 'Black leg armour.', 320, 'armour', { equipSlot: 'legs', stats: { def_stab: 11, def_slash: 10, def_crush: 8 }, equipReqs: { defence: 10 } });
d(40507, 'Black kiteshield', 'A black shield.', 200, 'armour', { equipSlot: 'shield', stats: { def_stab: 8, def_slash: 10, def_crush: 9 }, equipReqs: { defence: 10 } });

// ══════════════════════════════════════════════════════════════════════════════
// FOOD — complete healing table
// ══════════════════════════════════════════════════════════════════════════════

d(41001, 'Shrimps', 'Tasty shrimps.', 5, 'food', { weight: 0.3 }); // heals 3
d(41002, 'Anchovies', 'Salty anchovies.', 10, 'food', { weight: 0.3 }); // heals 1
d(41003, 'Sardine', 'A cooked sardine.', 8, 'food', { weight: 0.3 }); // heals 3
d(41004, 'Herring', 'A cooked herring.', 12, 'food', { weight: 0.3 }); // heals 5
d(41005, 'Mackerel', 'A cooked mackerel.', 15, 'food', { weight: 0.4 }); // heals 6
d(41006, 'Tuna', 'A cooked tuna.', 30, 'food', { weight: 0.4 }); // heals 10
d(41007, 'Bass', 'A cooked bass.', 60, 'food', { weight: 0.4 }); // heals 13
d(41008, 'Monkfish', 'A cooked monkfish.', 250, 'food', { weight: 0.4 }); // heals 16
d(41009, 'Karambwan', 'A properly cooked karambwan. Can be eaten alongside other food.', 300, 'food', { weight: 0.3 }); // heals 18
d(41010, 'Manta ray', 'A cooked manta ray.', 1000, 'food', { weight: 0.5 }); // heals 22
d(41011, 'Dark crab', 'A dark crab from the Wilds.', 1200, 'food', { weight: 0.4 }); // heals 22
d(41012, 'Cake', 'A freshly baked cake. 3 bites.', 20, 'food', { weight: 0.5 }); // heals 4 per bite
d(41013, 'Chocolate cake', 'A chocolate cake. 3 bites.', 40, 'food', { weight: 0.5 }); // heals 5 per bite
d(41014, 'Meat pie', 'A meat pie. 2 bites.', 25, 'food', { weight: 0.5 }); // heals 6 per bite
d(41015, 'Apple pie', 'An apple pie. 2 bites.', 30, 'food', { weight: 0.5 }); // heals 7 per bite
d(41016, 'Pizza', 'A plain pizza. 2 bites.', 35, 'food', { weight: 0.5 }); // heals 7 per bite
d(41017, 'Anchovy pizza', 'An anchovy pizza. 2 bites.', 50, 'food', { weight: 0.5 }); // heals 9 per bite
d(41018, 'Pineapple pizza', 'A pineapple pizza. 2 bites.', 100, 'food', { weight: 0.5 }); // heals 11 per bite
d(41019, 'Stew', 'A bowl of stew.', 15, 'food', { weight: 0.5 }); // heals 11
d(41020, 'Curry', 'A bowl of curry.', 25, 'food', { weight: 0.5 }); // heals 19
d(41021, 'Banana', 'A banana.', 2, 'food', { weight: 0.2 }); // heals 2
d(41022, 'Orange', 'An orange.', 3, 'food', { weight: 0.2 }); // heals 2

// Raw versions for the new cooked fish
d(41101, 'Raw anchovies', 'Raw anchovies.', 5, 'fishing', { weight: 0.3 });
d(41102, 'Raw sardine', 'A raw sardine.', 4, 'fishing', { weight: 0.3 });
d(41103, 'Raw herring', 'A raw herring.', 6, 'fishing', { weight: 0.3 });
d(41104, 'Raw mackerel', 'A raw mackerel.', 8, 'fishing', { weight: 0.4 });
d(41105, 'Raw tuna', 'A raw tuna.', 15, 'fishing', { weight: 0.4 });
d(41106, 'Raw bass', 'A raw bass.', 30, 'fishing', { weight: 0.4 });
d(41107, 'Raw monkfish', 'A raw monkfish.', 120, 'fishing', { weight: 0.4 });
d(41108, 'Raw karambwan', 'A raw karambwan. Must be properly cooked.', 100, 'fishing', { weight: 0.3 });
d(41109, 'Raw manta ray', 'A raw manta ray.', 500, 'fishing', { weight: 0.5 });
d(41110, 'Raw dark crab', 'A raw dark crab.', 600, 'fishing', { weight: 0.4 });

// ══════════════════════════════════════════════════════════════════════════════
// RANGED — dragonhide armour tiers
// ══════════════════════════════════════════════════════════════════════════════

d(42001, 'Blue dragonhide body', 'Made from blue dragon leather.', 6000, 'armour', { equipSlot: 'body', stats: { def_stab: 45, def_slash: 37, def_crush: 50, def_magic: 20, ranged: 20 }, equipReqs: { defence: 50, ranged: 50 } });
d(42002, 'Blue dragonhide chaps', 'Blue dragonhide chaps.', 4500, 'armour', { equipSlot: 'legs', stats: { def_stab: 25, def_slash: 18, def_crush: 27, def_magic: 10, ranged: 11 }, equipReqs: { defence: 50, ranged: 50 } });
d(42003, 'Blue dragonhide vambraces', 'Blue dragonhide vambraces.', 3000, 'armour', { equipSlot: 'hands', stats: { def_magic: 5, ranged: 9 }, equipReqs: { ranged: 50 } });
d(42011, 'Red dragonhide body', 'Made from red dragon leather.', 8000, 'armour', { equipSlot: 'body', stats: { def_stab: 50, def_slash: 42, def_crush: 55, def_magic: 25, ranged: 25 }, equipReqs: { defence: 60, ranged: 60 } });
d(42012, 'Red dragonhide chaps', 'Red dragonhide chaps.', 6000, 'armour', { equipSlot: 'legs', stats: { def_stab: 28, def_slash: 20, def_crush: 30, def_magic: 12, ranged: 14 }, equipReqs: { defence: 60, ranged: 60 } });
d(42013, 'Red dragonhide vambraces', 'Red dragonhide vambraces.', 4000, 'armour', { equipSlot: 'hands', stats: { def_magic: 6, ranged: 11 }, equipReqs: { ranged: 60 } });
d(42021, 'Black dragonhide body', 'Made from black dragon leather.', 12000, 'armour', { equipSlot: 'body', stats: { def_stab: 55, def_slash: 47, def_crush: 60, def_magic: 30, ranged: 30 }, equipReqs: { defence: 70, ranged: 70 } });
d(42022, 'Black dragonhide chaps', 'Black dragonhide chaps.', 9000, 'armour', { equipSlot: 'legs', stats: { def_stab: 31, def_slash: 24, def_crush: 33, def_magic: 15, ranged: 17 }, equipReqs: { defence: 70, ranged: 70 } });
d(42023, 'Black dragonhide vambraces', 'Black dragonhide vambraces.', 6000, 'armour', { equipSlot: 'hands', stats: { def_magic: 7, ranged: 12 }, equipReqs: { ranged: 70 } });

// Dragon leather (for crafting dragonhide)
d(42101, 'Green dragon leather', 'Tanned green dragon hide.', 1500, 'crafting', { weight: 1.5 });
d(42102, 'Blue dragon leather', 'Tanned blue dragon hide.', 2000, 'crafting', { weight: 1.5 });
d(42103, 'Red dragon leather', 'Tanned red dragon hide.', 2500, 'crafting', { weight: 1.5 });
d(42104, 'Black dragon leather', 'Tanned black dragon hide.', 3500, 'crafting', { weight: 1.5 });

// ══════════════════════════════════════════════════════════════════════════════
// TELEPORT JEWELLERY — enchanted rings/necklaces/amulets with charges
// ══════════════════════════════════════════════════════════════════════════════

d(43001, 'Ring of dueling(8)', 'Teleport to Castle Wars or Duel Arena. 8 charges.', 2000, 'jewellery', { equipSlot: 'ring', stats: {} });
d(43002, 'Games necklace(8)', 'Teleport to minigame locations. 8 charges.', 3000, 'jewellery', { equipSlot: 'neck', stats: {} });
d(43003, 'Ring of wealth', 'Improves rare drop table. Teleport to GE.', 15000, 'jewellery', { equipSlot: 'ring', stats: {} });
d(43004, 'Necklace of passage(5)', 'Teleport to the Inkweald boundary. 5 charges.', 5000, 'jewellery', { equipSlot: 'neck', stats: {} });
d(43005, 'Skills necklace(4)', 'Teleport to skill-related locations. 4 charges.', 6000, 'jewellery', { equipSlot: 'neck', stats: {} });
d(43006, 'Combat bracelet(4)', 'Teleport to combat-related locations. 4 charges.', 8000, 'jewellery', { equipSlot: 'hands', stats: { stab: 3, slash: 3, crush: 3, ranged: 3, magic: 3 } });
d(43007, 'Slayer ring(8)', 'Teleport to slayer locations. 8 charges.', 10000, 'jewellery', { equipSlot: 'ring', stats: {} });
d(43008, 'Dragonstone ring', 'A dragonstone ring. Enchant for teleport charges.', 5000, 'jewellery', { equipSlot: 'ring', stats: {} });

// ══════════════════════════════════════════════════════════════════════════════
// SKILLING OUTFITS — XP boost sets
// ══════════════════════════════════════════════════════════════════════════════

// Lumberjack (from Temple Trekking/Veilwood event)
d(44001, 'Lumberjack hat', 'Part of the lumberjack outfit. Full set: +2.5% WC XP.', 5000, 'armour', { equipSlot: 'head', stats: {}, equipReqs: { woodcutting: 30 }, tradeable: false });
d(44002, 'Lumberjack top', 'Part of the lumberjack outfit.', 8000, 'armour', { equipSlot: 'body', stats: {}, equipReqs: { woodcutting: 30 }, tradeable: false });
d(44003, 'Lumberjack legs', 'Part of the lumberjack outfit.', 6000, 'armour', { equipSlot: 'legs', stats: {}, equipReqs: { woodcutting: 30 }, tradeable: false });
d(44004, 'Lumberjack boots', 'Part of the lumberjack outfit.', 4000, 'armour', { equipSlot: 'feet', stats: {}, equipReqs: { woodcutting: 30 }, tradeable: false });

// Prospector (from Motherlode Mine/Sootworks)
d(44011, 'Prospector helmet', 'Part of the prospector outfit. Full set: +2.5% mining XP.', 5000, 'armour', { equipSlot: 'head', stats: {}, equipReqs: { mining: 30 }, tradeable: false });
d(44012, 'Prospector jacket', 'Part of the prospector outfit.', 8000, 'armour', { equipSlot: 'body', stats: {}, equipReqs: { mining: 30 }, tradeable: false });
d(44013, 'Prospector legs', 'Part of the prospector outfit.', 6000, 'armour', { equipSlot: 'legs', stats: {}, equipReqs: { mining: 30 }, tradeable: false });
d(44014, 'Prospector boots', 'Part of the prospector outfit.', 4000, 'armour', { equipSlot: 'feet', stats: {}, equipReqs: { mining: 30 }, tradeable: false });

// Farmer's outfit
d(44021, "Farmer's strawhat", 'Part of the farmer outfit. Full set: +2.5% farming XP.', 5000, 'armour', { equipSlot: 'head', stats: {}, equipReqs: { farming: 30 }, tradeable: false });
d(44022, "Farmer's jacket", 'Part of the farmer outfit.', 8000, 'armour', { equipSlot: 'body', stats: {}, equipReqs: { farming: 30 }, tradeable: false });
d(44023, "Farmer's boro trousers", 'Part of the farmer outfit.', 6000, 'armour', { equipSlot: 'legs', stats: {}, equipReqs: { farming: 30 }, tradeable: false });
d(44024, "Farmer's boots", 'Part of the farmer outfit.', 4000, 'armour', { equipSlot: 'feet', stats: {}, equipReqs: { farming: 30 }, tradeable: false });

// Rogue outfit (from Thieving minigame)
d(44031, 'Rogue mask', 'Part of the rogue outfit. Full set: double pickpocket loot.', 5000, 'armour', { equipSlot: 'head', stats: {}, equipReqs: { thieving: 50 }, tradeable: false });
d(44032, 'Rogue top', 'Part of the rogue outfit.', 8000, 'armour', { equipSlot: 'body', stats: {}, equipReqs: { thieving: 50 }, tradeable: false });
d(44033, 'Rogue trousers', 'Part of the rogue outfit.', 6000, 'armour', { equipSlot: 'legs', stats: {}, equipReqs: { thieving: 50 }, tradeable: false });
d(44034, 'Rogue boots', 'Part of the rogue outfit.', 4000, 'armour', { equipSlot: 'feet', stats: {}, equipReqs: { thieving: 50 }, tradeable: false });
d(44035, 'Rogue gloves', 'Part of the rogue outfit.', 3000, 'armour', { equipSlot: 'hands', stats: {}, equipReqs: { thieving: 50 }, tradeable: false });

// ══════════════════════════════════════════════════════════════════════════════
// MISC — quest items, tools, utility
// ══════════════════════════════════════════════════════════════════════════════

// Capes
d(45001, 'Fire cape', 'Earned from the Fight Caves. BIS melee cape.', 0, 'armour', { equipSlot: 'cape', stats: { stab: 1, slash: 1, crush: 1, ranged: 1, magic: 1, melee_strength: 4, prayer: 2, def_stab: 11, def_slash: 11, def_crush: 11, def_magic: 11, def_ranged: 11 }, equipReqs: {}, tradeable: false });
d(45002, 'Infernal cape', 'Earned from the Infernal Challenge. The ultimate cape.', 0, 'armour', { equipSlot: 'cape', stats: { stab: 4, slash: 4, crush: 4, ranged: 1, magic: 1, melee_strength: 8, prayer: 2, def_stab: 12, def_slash: 12, def_crush: 12, def_magic: 12, def_ranged: 12 }, equipReqs: {}, tradeable: false });
d(45003, "Ava's accumulator", 'A backpack device. Automatically retrieves spent ammo.', 10000, 'armour', { equipSlot: 'cape', stats: { ranged: 4, ranged_strength: 2, prayer: 1 }, equipReqs: { ranged: 50 }, tradeable: false });
d(45004, "Ava's assembler", 'An upgraded ammo retriever. Better retrieval rate.', 50000, 'armour', { equipSlot: 'cape', stats: { ranged: 8, ranged_strength: 2, prayer: 2 }, equipReqs: { ranged: 70 }, tradeable: false });
d(45005, 'Obsidian cape', 'A cape made of obsidian. Decent all-round defence.', 30000, 'armour', { equipSlot: 'cape', stats: { def_stab: 9, def_slash: 9, def_crush: 9, def_magic: 9, def_ranged: 9 }, equipReqs: {} });

// Gloves progression
d(45010, 'Leather gloves', 'Basic leather gloves.', 5, 'armour', { equipSlot: 'hands', stats: {} });
d(45011, 'Barrows gloves', 'BIS melee gloves. Requires Recipe for Disaster completion.', 0, 'armour', { equipSlot: 'hands', stats: { stab: 12, slash: 12, crush: 12, ranged: 12, magic: 6, melee_strength: 12, ranged_strength: 0, def_stab: 12, def_slash: 12, def_crush: 12, def_magic: 6, def_ranged: 12 }, equipReqs: { attack: 50, defence: 40 }, tradeable: false });
d(45012, 'Dragon gloves', 'Dragon-tier gloves.', 100000, 'armour', { equipSlot: 'hands', stats: { stab: 8, slash: 8, crush: 8, melee_strength: 8, def_stab: 8, def_slash: 8, def_crush: 8 }, equipReqs: { attack: 40, defence: 40 } });
d(45013, 'Rune gloves', 'Rune-tier gloves.', 50000, 'armour', { equipSlot: 'hands', stats: { stab: 6, slash: 6, crush: 6, melee_strength: 6, def_stab: 6, def_slash: 6, def_crush: 6 }, equipReqs: { attack: 30, defence: 30 } });

// Boots
d(45020, 'Climbing boots', 'Boots for climbing. Small strength bonus.', 2000, 'armour', { equipSlot: 'feet', stats: { melee_strength: 2, def_crush: 2 }, equipReqs: {} });
d(45021, 'Granite boots', 'Heavy granite boots. Good defence.', 20000, 'armour', { equipSlot: 'feet', stats: { def_stab: 10, def_slash: 10, def_crush: 10, melee_strength: 3 }, equipReqs: { defence: 50 } });
d(45022, 'Primordial boots', 'Upgraded dragon boots. BIS melee boots.', 1500000, 'armour', { equipSlot: 'feet', stats: { def_stab: 18, def_slash: 19, def_crush: 20, melee_strength: 5 }, equipReqs: { defence: 75 } });
d(45023, 'Pegasian boots', 'Upgraded ranger boots. BIS ranged boots.', 1200000, 'armour', { equipSlot: 'feet', stats: { ranged: 12, def_ranged: 5, def_magic: -2 }, equipReqs: { ranged: 75 } });
d(45024, 'Eternal boots', 'Upgraded wizard boots. BIS magic boots.', 800000, 'armour', { equipSlot: 'feet', stats: { magic: 8, def_magic: 8 }, equipReqs: { magic: 75 } });

// Shields
d(45030, 'Granite shield', 'A heavy granite shield.', 30000, 'armour', { equipSlot: 'shield', stats: { def_stab: 40, def_slash: 42, def_crush: 38, def_ranged: 36, def_magic: -8 }, equipReqs: { defence: 50, strength: 50 } });
d(45031, 'Crystal shield', 'An elven crystal shield.', 80000, 'armour', { equipSlot: 'shield', stats: { def_stab: 51, def_slash: 54, def_crush: 53, def_ranged: 80, def_magic: -10 }, equipReqs: { defence: 70, ranged: 70 } });
d(45032, 'Toktz-ket-xil (obsidian shield)', 'A volcanic obsidian shield.', 60000, 'armour', { equipSlot: 'shield', stats: { def_stab: 50, def_slash: 52, def_crush: 55, def_ranged: 46, def_magic: -5 }, equipReqs: { defence: 60 } });
d(45033, 'Spirit shield', 'A blessed shield. Reduces damage taken by 30%.', 2000000, 'armour', { equipSlot: 'shield', stats: { def_stab: 41, def_slash: 44, def_crush: 43, def_magic: 2, def_ranged: 41, prayer: 3 }, equipReqs: { defence: 75, prayer: 55 } });

// Amulet tiers
d(45040, 'Amulet of power', 'A balanced amulet.', 5000, 'jewellery', { equipSlot: 'neck', stats: { stab: 6, slash: 6, crush: 6, magic: 6, ranged: 6, melee_strength: 1, prayer: 1 } });
d(45041, 'Amulet of torture', 'BIS melee amulet.', 200000, 'jewellery', { equipSlot: 'neck', stats: { stab: 15, slash: 15, crush: 15, melee_strength: 10, def_stab: 5, def_slash: 5, def_crush: 5 }, equipReqs: { hitpoints: 75 } });
d(45042, 'Necklace of anguish', 'BIS ranged amulet.', 200000, 'jewellery', { equipSlot: 'neck', stats: { ranged: 15, ranged_strength: 5, prayer: 2 }, equipReqs: { hitpoints: 75 } });
d(45043, 'Occult necklace', 'BIS magic amulet.', 200000, 'jewellery', { equipSlot: 'neck', stats: { magic: 12, magic_strength: 10 }, equipReqs: { magic: 70 } });

console.log('[aelgard] Item blitz loaded');
