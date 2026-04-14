// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Item Blitz Round 2
// Obsidian gear, God Wars sets, prayer items, slayer equipment, potions,
// farming expanded, treasure trail uniques, and misc utility items.
// 200+ new items starting at ID 50000.
// ══════════════════════════════════════════════════════════════════════════════

const items = require('../../data/items');
const d = (id, name, examine, value, category, opts = {}) =>
  items.define({ id, name, examine, value, category, ...opts });

// ══════════════════════════════════════════════════════════════════════════════
// OBSIDIAN EQUIPMENT — level 60 from TzHaar/volcanic area
// Tank gear with no negative magic stats
// ══════════════════════════════════════════════════════════════════════════════

d(50000, 'Toktz-xil-ak (obsidian sword)', 'A razor-sharp obsidian sword forged in volcanic heat.', 90000, 'weapon', { equipSlot: 'weapon', speed: 4, stats: { stab: 36, slash: 55, melee_strength: 49 }, equipReqs: { attack: 60 } });
d(50001, 'Tzhaar-ket-om (obsidian maul)', 'An enormous obsidian maul. Devastatingly slow, devastatingly strong.', 120000, 'weapon', { equipSlot: 'weapon', speed: 7, stats: { crush: 85, melee_strength: 95 }, equipReqs: { attack: 60, strength: 60 } });
d(50002, 'Toktz-mej-tal (obsidian staff)', 'A staff carved from volcanic obsidian. Channels fire magic.', 80000, 'weapon', { equipSlot: 'weapon', speed: 5, stats: { crush: 28, magic: 15, magic_strength: 5 }, equipReqs: { attack: 60, magic: 60 } });
d(50003, 'Toktz-xil-ul (obsidian throwing ring)', 'A deadly obsidian ring. Thrown as a ranged weapon.', 40000, 'ammo', { equipSlot: 'ammo', stats: { ranged: 30, ranged_strength: 49 }, equipReqs: { ranged: 60 }, stackable: true });
d(50004, 'Obsidian helmet', 'A helm shaped from volcanic rock. Surprisingly light.', 75000, 'armour', { equipSlot: 'head', stats: { def_stab: 33, def_slash: 35, def_crush: 36, def_ranged: 30, def_magic: 0, melee_strength: 3 }, equipReqs: { defence: 60 } });
d(50005, 'Obsidian platebody', 'A heavy obsidian chestplate. No negative magic bonuses.', 250000, 'armour', { equipSlot: 'body', stats: { def_stab: 78, def_slash: 82, def_crush: 80, def_ranged: 72, def_magic: 0, melee_strength: 3 }, equipReqs: { defence: 60 } });
d(50006, 'Obsidian platelegs', 'Volcanic leg armour. No negative magic bonuses.', 180000, 'armour', { equipSlot: 'legs', stats: { def_stab: 51, def_slash: 49, def_crush: 47, def_ranged: 44, def_magic: 0, melee_strength: 1 }, equipReqs: { defence: 60 } });

// ══════════════════════════════════════════════════════════════════════════════
// GOD WARS COMPLETE SETS
// Level 70 equipment from the God Wars dungeon
// ══════════════════════════════════════════════════════════════════════════════

// --- Saradomin ---
d(50100, 'Saradomin sword', 'A blessed two-handed sword glowing with holy light.', 500000, 'weapon', { equipSlot: 'weapon', speed: 4, stats: { stab: 0, slash: 82, crush: 60, melee_strength: 82, prayer: 2 }, equipReqs: { attack: 70 } });
d(50101, 'Saradomin hilt', 'The hilt of a Saradomin godsword.', 800000, 'material', {});
d(50102, 'Saradomin godsword', 'A godsword imbued with the power of Saradomin. Special heals HP and prayer.', 2500000, 'weapon', { equipSlot: 'weapon', speed: 6, stats: { stab: 0, slash: 132, crush: 80, melee_strength: 132, prayer: 8 }, equipReqs: { attack: 75 } });

// --- Zamorak ---
d(50110, 'Zamorak spear', 'A vicious spear blessed by Zamorak. Effective against Corporeal Beast.', 600000, 'weapon', { equipSlot: 'weapon', speed: 4, stats: { stab: 85, slash: 65, crush: 65, melee_strength: 75 }, equipReqs: { attack: 70 } });
d(50111, 'Zamorak hasta', 'A Zamorak spear mounted on a shaft. Can be used with a shield.', 700000, 'weapon', { equipSlot: 'weapon', speed: 4, stats: { stab: 85, slash: 65, crush: 65, melee_strength: 75 }, equipReqs: { attack: 70 } });
d(50112, 'Zamorak hilt', 'The hilt of a Zamorak godsword.', 600000, 'material', {});
d(50113, 'Zamorak godsword', 'A godsword imbued with the fury of Zamorak. Special freezes the target.', 2000000, 'weapon', { equipSlot: 'weapon', speed: 6, stats: { stab: 0, slash: 132, crush: 80, melee_strength: 132 }, equipReqs: { attack: 75 } });

// --- Bandos ---
d(50120, 'Bandos boots', 'Heavy boots worn by followers of Bandos.', 300000, 'armour', { equipSlot: 'feet', stats: { def_stab: 15, def_slash: 16, def_crush: 17, melee_strength: 4, prayer: 1 }, equipReqs: { defence: 70 } });
d(50121, 'Bandos hilt', 'The hilt of a Bandos godsword.', 1500000, 'material', {});
d(50122, 'Bandos godsword', 'A godsword imbued with the power of Bandos. Special drains defence.', 3000000, 'weapon', { equipSlot: 'weapon', speed: 6, stats: { stab: 0, slash: 132, crush: 80, melee_strength: 132 }, equipReqs: { attack: 75 } });

// --- Armadyl ---
d(50130, 'Armadyl helmet', 'A divine helmet blessed by Armadyl. Best ranged head slot.', 400000, 'armour', { equipSlot: 'head', stats: { ranged: 10, def_stab: 6, def_slash: 6, def_crush: 6, def_ranged: 10, def_magic: 6, prayer: 1 }, equipReqs: { defence: 70, ranged: 70 } });
d(50131, 'Armadyl hilt', 'The hilt of an Armadyl godsword.', 2000000, 'material', {});
d(50132, 'Armadyl godsword', 'A godsword imbued with the power of Armadyl. Devastating special attack.', 4000000, 'weapon', { equipSlot: 'weapon', speed: 6, stats: { stab: 0, slash: 132, crush: 80, melee_strength: 132 }, equipReqs: { attack: 75 } });

// --- Godsword shared components ---
d(50140, 'Godsword blade', 'A godsword blade. Combine with a hilt to create a godsword.', 500000, 'material', {});
d(50141, 'Godsword shard 1', 'A shard of a godsword blade.', 150000, 'material', {});
d(50142, 'Godsword shard 2', 'A shard of a godsword blade.', 150000, 'material', {});
d(50143, 'Godsword shard 3', 'A shard of a godsword blade.', 150000, 'material', {});

// ══════════════════════════════════════════════════════════════════════════════
// PRAYER ITEMS
// Scrolls, relics, and utility items for the Prayer skill
// ══════════════════════════════════════════════════════════════════════════════

d(50200, 'Rigour scroll', 'A scroll containing the Rigour prayer. Unlocks +20% ranged accuracy and +23% ranged strength.', 2500000, 'prayer', { tradeable: true });
d(50201, 'Augury scroll', 'A scroll containing the Augury prayer. Unlocks +25% magic accuracy and +25% magic defence.', 1500000, 'prayer', { tradeable: true });
d(50202, 'Preserve scroll', 'A scroll containing the Preserve prayer. Boosted stats last 50% longer.', 500000, 'prayer', { tradeable: true });
d(50203, 'Holy wrench', 'A blessed wrench. Restores +2 extra prayer points per potion dose.', 50000, 'prayer', { tradeable: false });
d(50204, 'Bonecrusher', 'Automatically buries bones dropped by monsters.', 100000, 'prayer', { tradeable: false });
d(50205, 'Dragonbone necklace', 'Restores prayer when bones are buried or bonecrushed.', 500000, 'jewellery', { equipSlot: 'neck', stats: { prayer: 12, def_stab: 2, def_slash: 2, def_crush: 2 }, equipReqs: { prayer: 70 } });
d(50206, 'Proselyte hauberk', 'White knight prayer armour. Best prayer bonus body slot.', 40000, 'armour', { equipSlot: 'body', stats: { def_stab: 55, def_slash: 60, def_crush: 49, prayer: 8 }, equipReqs: { defence: 30, prayer: 20 } });
d(50207, 'Proselyte cuisse', 'White knight prayer leg armour.', 36000, 'armour', { equipSlot: 'legs', stats: { def_stab: 36, def_slash: 33, def_crush: 30, prayer: 6 }, equipReqs: { defence: 30, prayer: 20 } });
d(50208, 'Proselyte sallet', 'White knight prayer helmet.', 20000, 'armour', { equipSlot: 'head', stats: { def_stab: 15, def_slash: 17, def_crush: 13, prayer: 4 }, equipReqs: { defence: 30, prayer: 20 } });
d(50209, 'Monk robes (top)', 'A simple brown robe.', 100, 'armour', { equipSlot: 'body', stats: { prayer: 6 }, equipReqs: {} });
d(50210, 'Monk robes (bottom)', 'Simple brown robe legs.', 80, 'armour', { equipSlot: 'legs', stats: { prayer: 5 }, equipReqs: {} });

// ══════════════════════════════════════════════════════════════════════════════
// SLAYER EQUIPMENT
// Helmets, masks, ammo, and inventory management
// ══════════════════════════════════════════════════════════════════════════════

d(50300, 'Black mask', 'A mask imbued with dark power. +16.67% melee accuracy and damage on task.', 800000, 'armour', { equipSlot: 'head', stats: { def_stab: 10, def_slash: 11, def_crush: 10, melee_strength: 0 }, equipReqs: { defence: 10 } });
d(50301, 'Black mask (i)', 'An imbued black mask. Boosts melee, ranged, and magic on task.', 1000000, 'armour', { equipSlot: 'head', stats: { def_stab: 10, def_slash: 11, def_crush: 10, magic: 3, ranged: 3 }, equipReqs: { defence: 10 }, tradeable: false });
d(50302, 'Slayer helmet', 'A helmet assembled from slayer rewards. +16.67% melee accuracy and damage on task.', 1200000, 'armour', { equipSlot: 'head', stats: { def_stab: 22, def_slash: 24, def_crush: 20, def_magic: 6, def_ranged: 22, melee_strength: 0 }, equipReqs: { defence: 10 }, tradeable: false });
d(50303, 'Slayer helmet (i)', 'An imbued slayer helmet. Boosts melee, ranged, and magic on task.', 1500000, 'armour', { equipSlot: 'head', stats: { def_stab: 22, def_slash: 24, def_crush: 20, def_magic: 6, def_ranged: 22, magic: 3, ranged: 3, melee_strength: 0 }, equipReqs: { defence: 10 }, tradeable: false });
d(50304, 'Faceguard (basilisk jaw)', 'A Neitiznot faceguard. BIS melee strength helmet.', 3000000, 'armour', { equipSlot: 'head', stats: { def_stab: 24, def_slash: 26, def_crush: 22, def_magic: -2, def_ranged: 24, melee_strength: 6, prayer: 3 }, equipReqs: { defence: 70 }, tradeable: true });
d(50305, 'Basilisk jaw', 'A jaw from a basilisk knight. Attach to a Neitiznot helm.', 2500000, 'material', {});

d(50310, 'Broad bolts', 'Slayer-crafted bolts. Effective against turoth and kurask.', 50, 'ammo', { equipSlot: 'ammo', stats: { ranged_strength: 100 }, equipReqs: { ranged: 55 }, stackable: true });
d(50311, 'Broad arrows', 'Slayer-crafted arrows. Effective against turoth and kurask.', 60, 'ammo', { equipSlot: 'ammo', stats: { ranged_strength: 28 }, equipReqs: { ranged: 55 }, stackable: true });

d(50320, 'Herb sack', 'Holds up to 30 of each grimy herb type. Slayer reward.', 750, 'tool', { tradeable: false });
d(50321, 'Gem bag', 'Holds up to 60 of each uncut gem type.', 750, 'tool', { tradeable: false });
d(50322, 'Seed box', 'Holds multiple types of seeds in a single slot.', 750, 'tool', { tradeable: false });
d(50323, 'Rune pouch', 'Holds up to 3 types of runes in a single inventory slot.', 750, 'tool', { tradeable: false });
d(50324, 'Enchanted gem', 'Used to communicate with your Slayer master.', 1, 'tool', { tradeable: false });
d(50325, 'Slayer ring (8)', 'A ring that teleports to Slayer locations. 8 charges.', 15000, 'jewellery', { equipSlot: 'ring', stats: {}, tradeable: false });
d(50326, 'Nose peg', 'Protects against aberrant spectres.', 200, 'armour', { equipSlot: 'head', stats: {}, equipReqs: {} });
d(50327, 'Earmuffs', 'Protects against banshees.', 200, 'armour', { equipSlot: 'head', stats: {}, equipReqs: {} });
d(50328, 'Bag of salt', 'Used to kill rockslugs.', 10, 'tool', { stackable: true });
d(50329, 'Rock hammer', 'Used to finish off gargoyles.', 500, 'tool', {});
d(50330, 'Ice cooler', 'Used to kill desert lizards.', 1, 'tool', { stackable: true });
d(50331, 'Witchwood icon', 'Protects against cave horrors.', 900, 'jewellery', { equipSlot: 'neck', stats: { prayer: 2 }, equipReqs: {} });
d(50332, 'Mirror shield', 'Protects against basilisks and cockatrice.', 5000, 'armour', { equipSlot: 'shield', stats: { def_stab: 18, def_slash: 20, def_crush: 16, def_ranged: 20, def_magic: -3 }, equipReqs: { defence: 20 } });

// ══════════════════════════════════════════════════════════════════════════════
// POTIONS — extended, divine, and special variants
// ══════════════════════════════════════════════════════════════════════════════

d(50400, 'Antivenom(4)', 'Cures venom and provides venom immunity for 12 seconds.', 8000, 'potion', {});
d(50401, 'Antivenom(3)', 'Cures venom and provides venom immunity for 12 seconds.', 6000, 'potion', {});
d(50402, 'Antivenom(2)', 'Cures venom and provides venom immunity for 12 seconds.', 4000, 'potion', {});
d(50403, 'Antivenom(1)', 'Cures venom and provides venom immunity for 12 seconds.', 2000, 'potion', {});

d(50404, 'Antivenom+(4)', 'Superior venom cure. Immunity for 3 minutes.', 18000, 'potion', {});
d(50405, 'Antivenom+(3)', 'Superior venom cure. Immunity for 3 minutes.', 13500, 'potion', {});
d(50406, 'Antivenom+(2)', 'Superior venom cure. Immunity for 3 minutes.', 9000, 'potion', {});
d(50407, 'Antivenom+(1)', 'Superior venom cure. Immunity for 3 minutes.', 4500, 'potion', {});

d(50410, 'Extended antifire(4)', 'Protects against dragonfire for 12 minutes.', 5000, 'potion', {});
d(50411, 'Extended antifire(3)', 'Protects against dragonfire for 12 minutes.', 3750, 'potion', {});
d(50412, 'Extended antifire(2)', 'Protects against dragonfire for 12 minutes.', 2500, 'potion', {});
d(50413, 'Extended antifire(1)', 'Protects against dragonfire for 12 minutes.', 1250, 'potion', {});

d(50420, 'Extended super antifire(4)', 'Full dragonfire protection for 6 minutes. No shield needed.', 25000, 'potion', {});
d(50421, 'Extended super antifire(3)', 'Full dragonfire protection for 6 minutes. No shield needed.', 18750, 'potion', {});
d(50422, 'Extended super antifire(2)', 'Full dragonfire protection for 6 minutes. No shield needed.', 12500, 'potion', {});
d(50423, 'Extended super antifire(1)', 'Full dragonfire protection for 6 minutes. No shield needed.', 6250, 'potion', {});

d(50430, 'Divine super combat(4)', 'Boosts attack, strength, and defence by 5+15%. Drains 10 HP over time.', 60000, 'potion', {});
d(50431, 'Divine super combat(3)', 'Boosts attack, strength, and defence by 5+15%. Drains 10 HP over time.', 45000, 'potion', {});
d(50432, 'Divine super combat(2)', 'Boosts attack, strength, and defence by 5+15%. Drains 10 HP over time.', 30000, 'potion', {});
d(50433, 'Divine super combat(1)', 'Boosts attack, strength, and defence by 5+15%. Drains 10 HP over time.', 15000, 'potion', {});

d(50434, 'Divine ranging potion(4)', 'Boosts ranged by 5+15%. Drains 10 HP over time.', 35000, 'potion', {});
d(50435, 'Divine ranging potion(3)', 'Boosts ranged by 5+15%. Drains 10 HP over time.', 26250, 'potion', {});
d(50436, 'Divine ranging potion(2)', 'Boosts ranged by 5+15%. Drains 10 HP over time.', 17500, 'potion', {});
d(50437, 'Divine ranging potion(1)', 'Boosts ranged by 5+15%. Drains 10 HP over time.', 8750, 'potion', {});

d(50438, 'Divine magic potion(4)', 'Boosts magic by 5+15%. Drains 10 HP over time.', 30000, 'potion', {});
d(50439, 'Divine magic potion(3)', 'Boosts magic by 5+15%. Drains 10 HP over time.', 22500, 'potion', {});
d(50440, 'Divine magic potion(2)', 'Boosts magic by 5+15%. Drains 10 HP over time.', 15000, 'potion', {});
d(50441, 'Divine magic potion(1)', 'Boosts magic by 5+15%. Drains 10 HP over time.', 7500, 'potion', {});

d(50450, 'Sanfew serum(4)', 'Restores stats, cures poison, and restores prayer.', 20000, 'potion', {});
d(50451, 'Sanfew serum(3)', 'Restores stats, cures poison, and restores prayer.', 15000, 'potion', {});
d(50452, 'Sanfew serum(2)', 'Restores stats, cures poison, and restores prayer.', 10000, 'potion', {});
d(50453, 'Sanfew serum(1)', 'Restores stats, cures poison, and restores prayer.', 5000, 'potion', {});

d(50460, 'Stamina potion(4)', 'Restores 20% run energy and reduces drain rate for 2 minutes.', 10000, 'potion', {});
d(50461, 'Stamina potion(3)', 'Restores 20% run energy and reduces drain rate for 2 minutes.', 7500, 'potion', {});
d(50462, 'Stamina potion(2)', 'Restores 20% run energy and reduces drain rate for 2 minutes.', 5000, 'potion', {});
d(50463, 'Stamina potion(1)', 'Restores 20% run energy and reduces drain rate for 2 minutes.', 2500, 'potion', {});
d(50464, 'Amylase crystal', 'Used to create stamina potions.', 1500, 'material', { stackable: true });

// ══════════════════════════════════════════════════════════════════════════════
// FARMING EXPANDED — fruit trees, allotment produce, compost bucket
// ══════════════════════════════════════════════════════════════════════════════

// Fruit tree seeds
d(50500, 'Apple tree seed', 'Plant this in a fruit tree patch.', 20, 'farming', { stackable: true });
d(50501, 'Banana tree seed', 'Plant this in a fruit tree patch.', 50, 'farming', { stackable: true });
d(50502, 'Orange tree seed', 'Plant this in a fruit tree patch.', 70, 'farming', { stackable: true });
d(50503, 'Curry tree seed', 'Plant this in a fruit tree patch.', 120, 'farming', { stackable: true });
d(50504, 'Pineapple seed', 'Plant this in a fruit tree patch.', 200, 'farming', { stackable: true });
d(50505, 'Papaya tree seed', 'Plant this in a fruit tree patch.', 3000, 'farming', { stackable: true });
d(50506, 'Palm tree seed', 'Plant this in a fruit tree patch.', 15000, 'farming', { stackable: true });
d(50507, 'Dragonfruit tree seed', 'Plant this in a fruit tree patch.', 50000, 'farming', { stackable: true });
d(50508, 'Calquat tree seed', 'Plant this in the calquat patch at Tai Bwo Wannai.', 1000, 'farming', { stackable: true });

// Fruit tree products
d(50510, 'Cooking apple', 'An apple for cooking.', 5, 'food', { stackable: true });
d(50511, 'Banana', 'A yellow banana.', 8, 'food', { healAmount: 2 });
d(50512, 'Orange', 'A juicy orange.', 10, 'food', { healAmount: 2 });
d(50513, 'Curry leaf', 'A leaf used in cooking curries.', 15, 'material', { stackable: true });
d(50514, 'Pineapple', 'A prickly tropical fruit.', 30, 'food', { healAmount: 2 });
d(50515, 'Papaya fruit', 'A tropical papaya.', 200, 'food', { healAmount: 8 });
d(50516, 'Coconut', 'A hairy coconut.', 500, 'food', {});
d(50517, 'Dragonfruit', 'An exotic dragonfruit. Prized by chefs.', 1500, 'food', { healAmount: 10 });
d(50518, 'Calquat fruit', 'A large tropical fruit.', 100, 'food', { healAmount: 6 });

// Allotment seeds
d(50520, 'Sweetcorn seed', 'Plant this in an allotment patch.', 15, 'farming', { stackable: true });
d(50521, 'Strawberry seed', 'Plant this in an allotment patch.', 20, 'farming', { stackable: true });
d(50522, 'Watermelon seed', 'Plant this in an allotment patch.', 100, 'farming', { stackable: true });
d(50523, 'Snape grass seed', 'Plant this in an allotment patch.', 50, 'farming', { stackable: true });

// Allotment produce
d(50530, 'Sweetcorn', 'A cob of sweetcorn. Delicious cooked.', 20, 'food', { healAmount: 10 });
d(50531, 'Cooked sweetcorn', 'Buttery sweetcorn.', 25, 'food', { healAmount: 10 });
d(50532, 'Strawberry', 'A juicy red strawberry.', 25, 'food', { healAmount: 6 });
d(50533, 'Watermelon', 'A large watermelon.', 120, 'food', {});
d(50534, 'Watermelon slice', 'A slice of watermelon.', 40, 'food', { healAmount: 5 });

// Compost
d(50540, 'Bottomless compost bucket', 'An enchanted bucket that never runs out of compost. Fill with any compost type.', 500000, 'tool', { tradeable: true });
d(50541, 'Supercompost', 'High-quality compost for farming.', 300, 'farming', { stackable: true });
d(50542, 'Ultracompost', 'The best compost available. Maximises crop yields.', 800, 'farming', { stackable: true });

// Herb seeds (expanded)
d(50550, 'Toadflax seed', 'Plant this in a herb patch. Grows toadflax.', 500, 'farming', { stackable: true });
d(50551, 'Irit seed', 'Plant this in a herb patch. Grows irit.', 200, 'farming', { stackable: true });
d(50552, 'Avantoe seed', 'Plant this in a herb patch. Grows avantoe.', 400, 'farming', { stackable: true });
d(50553, 'Kwuarm seed', 'Plant this in a herb patch. Grows kwuarm.', 1200, 'farming', { stackable: true });
d(50554, 'Snapdragon seed', 'Plant this in a herb patch. Grows snapdragon.', 5000, 'farming', { stackable: true });
d(50555, 'Cadantine seed', 'Plant this in a herb patch. Grows cadantine.', 600, 'farming', { stackable: true });
d(50556, 'Lantadyme seed', 'Plant this in a herb patch. Grows lantadyme.', 1500, 'farming', { stackable: true });
d(50557, 'Dwarf weed seed', 'Plant this in a herb patch. Grows dwarf weed.', 1000, 'farming', { stackable: true });
d(50558, 'Torstol seed', 'Plant this in a herb patch. Grows torstol.', 8000, 'farming', { stackable: true });
d(50559, 'Ranarr seed', 'Plant this in a herb patch. Grows ranarr.', 3000, 'farming', { stackable: true });

// ══════════════════════════════════════════════════════════════════════════════
// TREASURE TRAIL UNIQUES — God dhide, blessed dhide, elegant, master clue
// ══════════════════════════════════════════════════════════════════════════════

// Saradomin blessed dragonhide
d(50600, 'Saradomin coif', 'A dragonhide coif blessed by Saradomin.', 50000, 'armour', { equipSlot: 'head', stats: { ranged: 4, def_stab: 4, def_slash: 6, def_crush: 8, def_ranged: 4, def_magic: 4, prayer: 1 }, equipReqs: { ranged: 40, defence: 40 } });
d(50601, 'Saradomin chaps', 'Dragonhide chaps blessed by Saradomin.', 80000, 'armour', { equipSlot: 'legs', stats: { ranged: 8, def_stab: 17, def_slash: 12, def_crush: 18, def_ranged: 17, def_magic: 8, prayer: 1 }, equipReqs: { ranged: 40, defence: 40 } });
d(50602, 'Saradomin d\'hide body', 'Dragonhide armour blessed by Saradomin.', 120000, 'armour', { equipSlot: 'body', stats: { ranged: 15, def_stab: 30, def_slash: 25, def_crush: 33, def_ranged: 30, def_magic: 15, prayer: 1 }, equipReqs: { ranged: 40, defence: 40 } });
d(50603, 'Saradomin d\'hide boots', 'Dragonhide boots blessed by Saradomin.', 40000, 'armour', { equipSlot: 'feet', stats: { ranged: 3, def_ranged: 3, prayer: 1 }, equipReqs: { ranged: 40 } });
d(50604, 'Saradomin d\'hide shield', 'A dragonhide shield blessed by Saradomin.', 100000, 'armour', { equipSlot: 'shield', stats: { ranged: 6, def_stab: 20, def_slash: 22, def_crush: 20, def_ranged: 20, def_magic: 8, prayer: 2 }, equipReqs: { ranged: 40, defence: 40 } });
d(50605, 'Saradomin bracers', 'Dragonhide bracers blessed by Saradomin.', 35000, 'armour', { equipSlot: 'hands', stats: { ranged: 6, def_ranged: 3, prayer: 1 }, equipReqs: { ranged: 40 } });

// Zamorak blessed dragonhide
d(50610, 'Zamorak coif', 'A dragonhide coif blessed by Zamorak.', 50000, 'armour', { equipSlot: 'head', stats: { ranged: 4, def_stab: 4, def_slash: 6, def_crush: 8, def_ranged: 4, def_magic: 4, prayer: 1 }, equipReqs: { ranged: 40, defence: 40 } });
d(50611, 'Zamorak chaps', 'Dragonhide chaps blessed by Zamorak.', 80000, 'armour', { equipSlot: 'legs', stats: { ranged: 8, def_stab: 17, def_slash: 12, def_crush: 18, def_ranged: 17, def_magic: 8, prayer: 1 }, equipReqs: { ranged: 40, defence: 40 } });
d(50612, 'Zamorak d\'hide body', 'Dragonhide armour blessed by Zamorak.', 120000, 'armour', { equipSlot: 'body', stats: { ranged: 15, def_stab: 30, def_slash: 25, def_crush: 33, def_ranged: 30, def_magic: 15, prayer: 1 }, equipReqs: { ranged: 40, defence: 40 } });
d(50613, 'Zamorak d\'hide boots', 'Dragonhide boots blessed by Zamorak.', 40000, 'armour', { equipSlot: 'feet', stats: { ranged: 3, def_ranged: 3, prayer: 1 }, equipReqs: { ranged: 40 } });
d(50614, 'Zamorak d\'hide shield', 'A dragonhide shield blessed by Zamorak.', 100000, 'armour', { equipSlot: 'shield', stats: { ranged: 6, def_stab: 20, def_slash: 22, def_crush: 20, def_ranged: 20, def_magic: 8, prayer: 2 }, equipReqs: { ranged: 40, defence: 40 } });
d(50615, 'Zamorak bracers', 'Dragonhide bracers blessed by Zamorak.', 35000, 'armour', { equipSlot: 'hands', stats: { ranged: 6, def_ranged: 3, prayer: 1 }, equipReqs: { ranged: 40 } });

// Guthix blessed dragonhide
d(50620, 'Guthix coif', 'A dragonhide coif blessed by Guthix.', 50000, 'armour', { equipSlot: 'head', stats: { ranged: 4, def_stab: 4, def_slash: 6, def_crush: 8, def_ranged: 4, def_magic: 4, prayer: 1 }, equipReqs: { ranged: 40, defence: 40 } });
d(50621, 'Guthix chaps', 'Dragonhide chaps blessed by Guthix.', 80000, 'armour', { equipSlot: 'legs', stats: { ranged: 8, def_stab: 17, def_slash: 12, def_crush: 18, def_ranged: 17, def_magic: 8, prayer: 1 }, equipReqs: { ranged: 40, defence: 40 } });
d(50622, 'Guthix d\'hide body', 'Dragonhide armour blessed by Guthix.', 120000, 'armour', { equipSlot: 'body', stats: { ranged: 15, def_stab: 30, def_slash: 25, def_crush: 33, def_ranged: 30, def_magic: 15, prayer: 1 }, equipReqs: { ranged: 40, defence: 40 } });
d(50623, 'Guthix d\'hide boots', 'Dragonhide boots blessed by Guthix.', 40000, 'armour', { equipSlot: 'feet', stats: { ranged: 3, def_ranged: 3, prayer: 1 }, equipReqs: { ranged: 40 } });
d(50624, 'Guthix d\'hide shield', 'A dragonhide shield blessed by Guthix.', 100000, 'armour', { equipSlot: 'shield', stats: { ranged: 6, def_stab: 20, def_slash: 22, def_crush: 20, def_ranged: 20, def_magic: 8, prayer: 2 }, equipReqs: { ranged: 40, defence: 40 } });
d(50625, 'Guthix bracers', 'Dragonhide bracers blessed by Guthix.', 35000, 'armour', { equipSlot: 'hands', stats: { ranged: 6, def_ranged: 3, prayer: 1 }, equipReqs: { ranged: 40 } });

// Bandos blessed dragonhide
d(50630, 'Bandos coif', 'A dragonhide coif blessed by Bandos.', 50000, 'armour', { equipSlot: 'head', stats: { ranged: 4, def_stab: 4, def_slash: 6, def_crush: 8, def_ranged: 4, def_magic: 4, prayer: 1 }, equipReqs: { ranged: 40, defence: 40 } });
d(50631, 'Bandos chaps', 'Dragonhide chaps blessed by Bandos.', 80000, 'armour', { equipSlot: 'legs', stats: { ranged: 8, def_stab: 17, def_slash: 12, def_crush: 18, def_ranged: 17, def_magic: 8, prayer: 1 }, equipReqs: { ranged: 40, defence: 40 } });
d(50632, 'Bandos d\'hide body', 'Dragonhide armour blessed by Bandos.', 120000, 'armour', { equipSlot: 'body', stats: { ranged: 15, def_stab: 30, def_slash: 25, def_crush: 33, def_ranged: 30, def_magic: 15, prayer: 1 }, equipReqs: { ranged: 40, defence: 40 } });
d(50633, 'Bandos d\'hide boots', 'Dragonhide boots blessed by Bandos.', 40000, 'armour', { equipSlot: 'feet', stats: { ranged: 3, def_ranged: 3, prayer: 1 }, equipReqs: { ranged: 40 } });
d(50634, 'Bandos d\'hide shield', 'A dragonhide shield blessed by Bandos.', 100000, 'armour', { equipSlot: 'shield', stats: { ranged: 6, def_stab: 20, def_slash: 22, def_crush: 20, def_ranged: 20, def_magic: 8, prayer: 2 }, equipReqs: { ranged: 40, defence: 40 } });
d(50635, 'Bandos bracers', 'Dragonhide bracers blessed by Bandos.', 35000, 'armour', { equipSlot: 'hands', stats: { ranged: 6, def_ranged: 3, prayer: 1 }, equipReqs: { ranged: 40 } });

// Armadyl blessed dragonhide
d(50640, 'Armadyl coif', 'A dragonhide coif blessed by Armadyl.', 50000, 'armour', { equipSlot: 'head', stats: { ranged: 4, def_stab: 4, def_slash: 6, def_crush: 8, def_ranged: 4, def_magic: 4, prayer: 1 }, equipReqs: { ranged: 40, defence: 40 } });
d(50641, 'Armadyl chaps', 'Dragonhide chaps blessed by Armadyl.', 80000, 'armour', { equipSlot: 'legs', stats: { ranged: 8, def_stab: 17, def_slash: 12, def_crush: 18, def_ranged: 17, def_magic: 8, prayer: 1 }, equipReqs: { ranged: 40, defence: 40 } });
d(50642, 'Armadyl d\'hide body', 'Dragonhide armour blessed by Armadyl.', 120000, 'armour', { equipSlot: 'body', stats: { ranged: 15, def_stab: 30, def_slash: 25, def_crush: 33, def_ranged: 30, def_magic: 15, prayer: 1 }, equipReqs: { ranged: 40, defence: 40 } });
d(50643, 'Armadyl d\'hide boots', 'Dragonhide boots blessed by Armadyl.', 40000, 'armour', { equipSlot: 'feet', stats: { ranged: 3, def_ranged: 3, prayer: 1 }, equipReqs: { ranged: 40 } });
d(50644, 'Armadyl d\'hide shield', 'A dragonhide shield blessed by Armadyl.', 100000, 'armour', { equipSlot: 'shield', stats: { ranged: 6, def_stab: 20, def_slash: 22, def_crush: 20, def_ranged: 20, def_magic: 8, prayer: 2 }, equipReqs: { ranged: 40, defence: 40 } });
d(50645, 'Armadyl bracers', 'Dragonhide bracers blessed by Armadyl.', 35000, 'armour', { equipSlot: 'hands', stats: { ranged: 6, def_ranged: 3, prayer: 1 }, equipReqs: { ranged: 40 } });

// Ancient blessed dragonhide
d(50650, 'Ancient coif', 'A dragonhide coif blessed by Zaros.', 60000, 'armour', { equipSlot: 'head', stats: { ranged: 4, def_stab: 4, def_slash: 6, def_crush: 8, def_ranged: 4, def_magic: 4, prayer: 1 }, equipReqs: { ranged: 40, defence: 40 } });
d(50651, 'Ancient chaps', 'Dragonhide chaps blessed by Zaros.', 90000, 'armour', { equipSlot: 'legs', stats: { ranged: 8, def_stab: 17, def_slash: 12, def_crush: 18, def_ranged: 17, def_magic: 8, prayer: 1 }, equipReqs: { ranged: 40, defence: 40 } });
d(50652, 'Ancient d\'hide body', 'Dragonhide armour blessed by Zaros.', 130000, 'armour', { equipSlot: 'body', stats: { ranged: 15, def_stab: 30, def_slash: 25, def_crush: 33, def_ranged: 30, def_magic: 15, prayer: 1 }, equipReqs: { ranged: 40, defence: 40 } });
d(50653, 'Ancient d\'hide boots', 'Dragonhide boots blessed by Zaros.', 45000, 'armour', { equipSlot: 'feet', stats: { ranged: 3, def_ranged: 3, prayer: 1 }, equipReqs: { ranged: 40 } });
d(50654, 'Ancient d\'hide shield', 'A dragonhide shield blessed by Zaros.', 110000, 'armour', { equipSlot: 'shield', stats: { ranged: 6, def_stab: 20, def_slash: 22, def_crush: 20, def_ranged: 20, def_magic: 8, prayer: 2 }, equipReqs: { ranged: 40, defence: 40 } });
d(50655, 'Ancient bracers', 'Dragonhide bracers blessed by Zaros.', 40000, 'armour', { equipSlot: 'hands', stats: { ranged: 6, def_ranged: 3, prayer: 1 }, equipReqs: { ranged: 40 } });

// Elegant clothing (cosmetic)
d(50700, 'Blue elegant shirt', 'A stylish blue shirt. Purely cosmetic.', 5000, 'cosmetic', { equipSlot: 'body', stats: {} });
d(50701, 'Blue elegant legs', 'Stylish blue trousers. Purely cosmetic.', 5000, 'cosmetic', { equipSlot: 'legs', stats: {} });
d(50702, 'Red elegant shirt', 'A stylish red shirt. Purely cosmetic.', 5000, 'cosmetic', { equipSlot: 'body', stats: {} });
d(50703, 'Red elegant legs', 'Stylish red trousers. Purely cosmetic.', 5000, 'cosmetic', { equipSlot: 'legs', stats: {} });
d(50704, 'Green elegant shirt', 'A stylish green shirt. Purely cosmetic.', 5000, 'cosmetic', { equipSlot: 'body', stats: {} });
d(50705, 'Green elegant legs', 'Stylish green trousers. Purely cosmetic.', 5000, 'cosmetic', { equipSlot: 'legs', stats: {} });
d(50706, 'Black elegant shirt', 'A stylish black shirt. Purely cosmetic.', 10000, 'cosmetic', { equipSlot: 'body', stats: {} });
d(50707, 'Black elegant legs', 'Stylish black trousers. Purely cosmetic.', 10000, 'cosmetic', { equipSlot: 'legs', stats: {} });
d(50708, 'White elegant blouse', 'A stylish white blouse. Purely cosmetic.', 5000, 'cosmetic', { equipSlot: 'body', stats: {} });
d(50709, 'White elegant skirt', 'A stylish white skirt. Purely cosmetic.', 5000, 'cosmetic', { equipSlot: 'legs', stats: {} });
d(50710, 'Purple elegant shirt', 'A stylish purple shirt. Purely cosmetic.', 5000, 'cosmetic', { equipSlot: 'body', stats: {} });
d(50711, 'Purple elegant legs', 'Stylish purple trousers. Purely cosmetic.', 5000, 'cosmetic', { equipSlot: 'legs', stats: {} });

// Master clue rewards
d(50720, 'Bloodhound pet', 'A loyal bloodhound. It can sniff out treasure trails.', 0, 'pet', { tradeable: false });
d(50721, '3rd age druidic robe top', 'An incredibly rare druidic robe. Highly prized.', 50000000, 'armour', { equipSlot: 'body', stats: { magic: 10, def_stab: 20, def_slash: 20, def_crush: 20, def_magic: 30, prayer: 10 }, equipReqs: { defence: 65, prayer: 65 }, tradeable: true });
d(50722, '3rd age druidic robe bottom', 'An incredibly rare druidic robe bottom.', 40000000, 'armour', { equipSlot: 'legs', stats: { magic: 8, def_stab: 14, def_slash: 14, def_crush: 14, def_magic: 22, prayer: 8 }, equipReqs: { defence: 65, prayer: 65 }, tradeable: true });
d(50723, '3rd age druidic staff', 'An incredibly rare druidic staff.', 60000000, 'weapon', { equipSlot: 'weapon', speed: 5, stats: { magic: 20, crush: 20, magic_strength: 8, prayer: 5 }, equipReqs: { magic: 65, attack: 65 }, tradeable: true });
d(50724, '3rd age druidic cloak', 'An incredibly rare druidic cloak.', 30000000, 'armour', { equipSlot: 'cape', stats: { magic: 5, def_magic: 10, prayer: 7 }, equipReqs: { prayer: 65 }, tradeable: true });
d(50725, 'Ring of 3rd age', 'A ring from the Third Age. Extremely rare.', 25000000, 'jewellery', { equipSlot: 'ring', stats: { stab: 4, slash: 4, crush: 4, ranged: 4, magic: 4, melee_strength: 4, prayer: 4 }, tradeable: true });

// ══════════════════════════════════════════════════════════════════════════════
// MISC UTILITY ITEMS
// Bags, pouches, rings, amulets, staves
// ══════════════════════════════════════════════════════════════════════════════

d(50800, 'Looting bag', 'Holds up to 28 items. Only usable in the Wilderness.', 0, 'tool', { tradeable: false });
d(50801, 'Coal bag', 'Holds up to 27 coal in a single inventory slot.', 750, 'tool', { tradeable: false });

d(50810, 'Ring of wealth', 'Improves rare drop table chances.', 20000, 'jewellery', { equipSlot: 'ring', stats: {} });
d(50811, 'Ring of wealth (i)', 'Improved ring of wealth. Doubles rare drop table chance in Wilderness.', 50000, 'jewellery', { equipSlot: 'ring', stats: {}, tradeable: false });

d(50820, 'Salve amulet', 'Provides 15% accuracy and damage boost against undead.', 50000, 'jewellery', { equipSlot: 'neck', stats: { def_stab: 2, def_slash: 2, def_crush: 2 }, equipReqs: {} });
d(50821, 'Salve amulet (e)', 'Enhanced salve amulet. 20% accuracy and damage vs undead.', 100000, 'jewellery', { equipSlot: 'neck', stats: { def_stab: 2, def_slash: 2, def_crush: 2 }, equipReqs: {} });
d(50822, 'Salve amulet (ei)', 'Imbued enhanced salve amulet. 20% accuracy and damage vs undead for all styles.', 150000, 'jewellery', { equipSlot: 'neck', stats: { def_stab: 2, def_slash: 2, def_crush: 2 }, equipReqs: {}, tradeable: false });

d(50830, 'Dramen staff', 'A staff carved from dramen wood. Required for fairy ring travel.', 0, 'weapon', { equipSlot: 'weapon', speed: 5, stats: { crush: 10, magic: 10 }, equipReqs: {} });
d(50831, 'Lunar staff', 'A staff attuned to Lunar magic. Access the Lunar spellbook.', 50000, 'weapon', { equipSlot: 'weapon', speed: 5, stats: { crush: 15, magic: 15, magic_strength: 3 }, equipReqs: { magic: 65 } });

d(50840, 'Ectophial', 'A vial of ectoplasm. Teleports to the Ectofuntus when emptied.', 0, 'tool', { tradeable: false });
d(50841, 'Teleport crystal', 'An elven crystal. Teleports to Lletya. Degrades with use.', 15000, 'tool', { tradeable: false });
d(50842, 'Pharaoh\'s sceptre', 'Teleports to Pyramid Plunder and other desert locations.', 500000, 'weapon', { equipSlot: 'weapon', speed: 5, stats: { crush: 20, magic: 10 }, equipReqs: {} });

d(50850, 'Imbued heart', 'A magical heart. Boosts magic level by 1+10% every 7 minutes.', 2000000, 'tool', { tradeable: true });
d(50851, 'Eternal gem', 'A gem that never runs out of Slayer task checks.', 100000, 'material', { tradeable: true });

d(50860, 'Dragon pickaxe', 'The best pickaxe for mining. Has a special attack that boosts mining by 3.', 500000, 'weapon', { equipSlot: 'weapon', speed: 5, stats: { stab: 28, melee_strength: 24 }, equipReqs: { attack: 60 } });
d(50861, 'Dragon axe', 'The best hatchet for woodcutting. Special boosts woodcutting by 3.', 300000, 'weapon', { equipSlot: 'weapon', speed: 5, stats: { slash: 30, melee_strength: 26 }, equipReqs: { attack: 60 } });
d(50862, 'Dragon harpoon', 'The best harpoon for fishing. Special boosts fishing by 3.', 400000, 'weapon', { equipSlot: 'weapon', speed: 5, stats: { stab: 24, melee_strength: 22 }, equipReqs: { attack: 60 } });

d(50870, 'Graceful hood', 'Lightweight hood that reduces weight.', 35, 'armour', { equipSlot: 'head', stats: {}, tradeable: false });
d(50871, 'Graceful top', 'Lightweight top that reduces weight.', 55, 'armour', { equipSlot: 'body', stats: {}, tradeable: false });
d(50872, 'Graceful legs', 'Lightweight legs that reduce weight.', 45, 'armour', { equipSlot: 'legs', stats: {}, tradeable: false });
d(50873, 'Graceful gloves', 'Lightweight gloves that reduce weight.', 30, 'armour', { equipSlot: 'hands', stats: {}, tradeable: false });
d(50874, 'Graceful boots', 'Lightweight boots that reduce weight.', 30, 'armour', { equipSlot: 'feet', stats: {}, tradeable: false });
d(50875, 'Graceful cape', 'Lightweight cape that reduces weight. Full set bonus: run energy restores 30% faster.', 40, 'armour', { equipSlot: 'cape', stats: {}, tradeable: false });

d(50880, 'Explorer\'s ring 4', 'Replenishes 100% run energy twice daily. Alchemy casts.', 0, 'jewellery', { equipSlot: 'ring', stats: { prayer: 1 }, tradeable: false });
d(50881, 'Ardougne cloak 4', 'Unlimited teleports to Ardougne farm patch. +15% thieving success.', 0, 'armour', { equipSlot: 'cape', stats: { stab: 6, prayer: 4 }, tradeable: false });
d(50882, 'Rada\'s blessing 4', '+4% fishing catch rate. Unlimited teleport to Mount Karuulm.', 0, 'armour', { equipSlot: 'ammo', stats: { prayer: 2 }, tradeable: false });

d(50890, 'Book of war', 'Bandos prayer book. Offensive crush bonus.', 25000, 'armour', { equipSlot: 'shield', stats: { crush: 8, melee_strength: 5, prayer: 5 }, equipReqs: { prayer: 50 } });
d(50891, 'Book of law', 'Armadyl prayer book. Offensive ranged bonus.', 25000, 'armour', { equipSlot: 'shield', stats: { ranged: 10, prayer: 5 }, equipReqs: { prayer: 50 } });
d(50892, 'Book of darkness', 'Ancient prayer book. Offensive magic bonus.', 25000, 'armour', { equipSlot: 'shield', stats: { magic: 10, prayer: 5 }, equipReqs: { prayer: 50 } });
d(50893, 'Holy book', 'Saradomin prayer book. Defensive bonuses.', 25000, 'armour', { equipSlot: 'shield', stats: { def_stab: 8, def_slash: 8, def_crush: 8, prayer: 5 }, equipReqs: { prayer: 50 } });
d(50894, 'Unholy book', 'Zamorak prayer book. Offensive melee bonus.', 25000, 'armour', { equipSlot: 'shield', stats: { stab: 8, melee_strength: 5, prayer: 5 }, equipReqs: { prayer: 50 } });
d(50895, 'Book of balance', 'Guthix prayer book. Balanced bonuses.', 25000, 'armour', { equipSlot: 'shield', stats: { stab: 4, magic: 4, def_stab: 4, def_slash: 4, def_crush: 4, prayer: 5 }, equipReqs: { prayer: 50 } });

d(50900, 'Ring of the gods', 'A ring blessed by the gods. Best prayer bonus ring.', 1500000, 'jewellery', { equipSlot: 'ring', stats: { prayer: 8, def_stab: 4, def_slash: 4, def_crush: 4 }, equipReqs: {} });
d(50901, 'Ring of the gods (i)', 'An imbued ring of the gods. +4 prayer, holy wrench effect built in.', 2000000, 'jewellery', { equipSlot: 'ring', stats: { prayer: 8, def_stab: 4, def_slash: 4, def_crush: 4 }, equipReqs: {}, tradeable: false });
d(50902, 'Tyrannical ring', 'A ring that enhances crush accuracy.', 500000, 'jewellery', { equipSlot: 'ring', stats: { crush: 8 }, equipReqs: {} });
d(50903, 'Tyrannical ring (i)', 'An imbued tyrannical ring.', 800000, 'jewellery', { equipSlot: 'ring', stats: { crush: 8, def_crush: 4 }, equipReqs: {}, tradeable: false });
d(50904, 'Treasonous ring', 'A ring that enhances stab accuracy.', 500000, 'jewellery', { equipSlot: 'ring', stats: { stab: 8 }, equipReqs: {} });
d(50905, 'Treasonous ring (i)', 'An imbued treasonous ring.', 800000, 'jewellery', { equipSlot: 'ring', stats: { stab: 8, def_stab: 4 }, equipReqs: {}, tradeable: false });

d(50910, 'Abyssal tentacle', 'A whip infused with kraken tentacle. Degrades.', 1800000, 'weapon', { equipSlot: 'weapon', speed: 4, stats: { slash: 90, melee_strength: 86 }, equipReqs: { attack: 75 } });
d(50911, 'Kraken tentacle', 'A slimy tentacle from the Kraken. Combine with abyssal whip.', 500000, 'material', {});
d(50912, 'Trident of the seas', 'A powered staff. Casts built-in water spell. Uses charges.', 300000, 'weapon', { equipSlot: 'weapon', speed: 4, stats: { magic: 15, magic_strength: 12 }, equipReqs: { magic: 75 } });
d(50913, 'Trident of the swamp', 'A toxic trident. Casts built-in venom spell. Stronger than seas.', 800000, 'weapon', { equipSlot: 'weapon', speed: 4, stats: { magic: 25, magic_strength: 17 }, equipReqs: { magic: 78 } });
d(50914, 'Toxic blowpipe', 'A venomous blowpipe. Rapid ranged attacks with darts.', 2000000, 'weapon', { equipSlot: 'weapon', speed: 3, stats: { ranged: 30, ranged_strength: 20 }, equipReqs: { ranged: 75 } });
d(50915, 'Serpentine visage', 'A venomous helm face. Provides venom immunity and poisons attackers.', 1000000, 'material', {});
d(50916, 'Serpentine helm', 'A helm that provides venom immunity and poisons attackers in melee.', 1500000, 'armour', { equipSlot: 'head', stats: { def_stab: 52, def_slash: 55, def_crush: 50, def_ranged: 48, def_magic: -5, melee_strength: 5 }, equipReqs: { defence: 75 } });

d(50920, 'Magic fang', 'A fang from Zulrah. Used to create the toxic trident and blowpipe.', 600000, 'material', {});
d(50921, 'Tanzanite fang', 'A fang from Zulrah. Used to create the toxic blowpipe.', 800000, 'material', {});

d(50930, 'Dragon warhammer', 'A powerful crush weapon. Special drains 30% of target defence.', 5000000, 'weapon', { equipSlot: 'weapon', speed: 6, stats: { crush: 95, melee_strength: 85 }, equipReqs: { attack: 60 } });
d(50931, 'Bandos chestplate', 'Heavy Bandos armour. BIS melee body.', 1500000, 'armour', { equipSlot: 'body', stats: { def_stab: 98, def_slash: 93, def_crush: 105, def_ranged: -15, def_magic: -10, melee_strength: 4, prayer: 1 }, equipReqs: { defence: 65 } });
d(50932, 'Bandos tassets', 'Heavy Bandos leg armour. BIS melee legs.', 1200000, 'armour', { equipSlot: 'legs', stats: { def_stab: 71, def_slash: 63, def_crush: 66, def_ranged: -7, def_magic: -4, melee_strength: 2, prayer: 1 }, equipReqs: { defence: 65 } });
d(50933, 'Armadyl chestplate', 'Armadyl ranged body armour.', 1200000, 'armour', { equipSlot: 'body', stats: { ranged: 33, def_stab: 56, def_slash: 48, def_crush: 61, def_ranged: 57, def_magic: 10 }, equipReqs: { defence: 70, ranged: 70 } });
d(50934, 'Armadyl chainskirt', 'Armadyl ranged leg armour.', 900000, 'armour', { equipSlot: 'legs', stats: { ranged: 20, def_stab: 32, def_slash: 26, def_crush: 34, def_ranged: 33, def_magic: 8 }, equipReqs: { defence: 70, ranged: 70 } });

d(50940, 'Spectral spirit shield', 'Reduces prayer drain from monster effects by 50%.', 3000000, 'armour', { equipSlot: 'shield', stats: { def_stab: 41, def_slash: 44, def_crush: 43, def_magic: 30, def_ranged: 41, prayer: 3, magic: 0 }, equipReqs: { defence: 75, prayer: 70, magic: 65 } });
d(50941, 'Arcane spirit shield', 'BIS magic shield. +20 magic attack bonus.', 5000000, 'armour', { equipSlot: 'shield', stats: { magic: 20, def_stab: 41, def_slash: 44, def_crush: 43, def_magic: 25, def_ranged: 41, prayer: 3 }, equipReqs: { defence: 75, prayer: 70, magic: 65 } });
d(50942, 'Elysian spirit shield', 'BIS defensive shield. 70% chance to reduce incoming damage by 25%.', 10000000, 'armour', { equipSlot: 'shield', stats: { def_stab: 73, def_slash: 75, def_crush: 72, def_magic: 2, def_ranged: 70, prayer: 3 }, equipReqs: { defence: 75, prayer: 70 } });
d(50943, 'Blessed spirit shield', 'A spirit shield blessed by Father Aereck.', 2500000, 'armour', { equipSlot: 'shield', stats: { def_stab: 41, def_slash: 44, def_crush: 43, def_magic: 2, def_ranged: 41, prayer: 3 }, equipReqs: { defence: 70, prayer: 60 } });
d(50944, 'Holy elixir', 'Used to bless a spirit shield.', 1500000, 'material', {});
d(50945, 'Spectral sigil', 'An ethereal sigil. Attach to a blessed spirit shield.', 2000000, 'material', {});
d(50946, 'Arcane sigil', 'An arcane sigil. Attach to a blessed spirit shield.', 4000000, 'material', {});
d(50947, 'Elysian sigil', 'An elysian sigil. Attach to a blessed spirit shield.', 8000000, 'material', {});

console.log('[aelgard] Items blitz round 2 loaded');
