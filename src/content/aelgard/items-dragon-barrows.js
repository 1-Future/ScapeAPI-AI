// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Dragon Tier, Barrows Sets, Slayer Drops, Clue Rewards
// Massive item expansion round 2. Target: 300+ new items.
// ══════════════════════════════════════════════════════════════════════════════

const items = require('../../data/items');

// ══════════════════════════════════════════════════════════════════════════════
// DRAGON TIER (Level 60 attack/defence) — obtained from bosses and rare drops
// ══════════════════════════════════════════════════════════════════════════════

items.define({ id: 20001, name: 'Dragon scimitar', examine: 'A razor-sharp dragon scimitar.', value: 100000, category: 'weapon', equipSlot: 'weapon', speed: 4, stats: { slash: 67, melee_strength: 66 }, equipReqs: { attack: 60 } });
items.define({ id: 20002, name: 'Dragon longsword', examine: 'A powerful dragon longsword.', value: 100000, category: 'weapon', equipSlot: 'weapon', speed: 5, stats: { slash: 69, melee_strength: 71 }, equipReqs: { attack: 60 } });
items.define({ id: 20003, name: 'Dragon dagger', examine: 'A poisoned dragon dagger.', value: 30000, category: 'weapon', equipSlot: 'weapon', speed: 4, stats: { stab: 40, melee_strength: 40 }, equipReqs: { attack: 60 } });
items.define({ id: 20004, name: 'Dragon mace', examine: 'A dragon mace with prayer bonus.', value: 50000, category: 'weapon', equipSlot: 'weapon', speed: 4, stats: { crush: 60, melee_strength: 55, prayer: 5 }, equipReqs: { attack: 60 } });
items.define({ id: 20005, name: 'Dragon battleaxe', examine: 'A mighty dragon battleaxe.', value: 120000, category: 'weapon', equipSlot: 'weapon', speed: 6, stats: { slash: 70, melee_strength: 85 }, equipReqs: { attack: 60 } });
items.define({ id: 20006, name: 'Dragon halberd', examine: 'A dragon halberd with extended reach.', value: 150000, category: 'weapon', equipSlot: 'weapon', speed: 7, stats: { slash: 78, melee_strength: 89 }, equipReqs: { attack: 60, strength: 30 } });
items.define({ id: 20007, name: 'Dragon spear', examine: 'A dragon spear.', value: 80000, category: 'weapon', equipSlot: 'weapon', speed: 5, stats: { stab: 55, melee_strength: 60 }, equipReqs: { attack: 60 } });
items.define({ id: 20010, name: 'Dragon full helm', examine: 'A full dragon helmet.', value: 500000, category: 'armour', equipSlot: 'head', stats: { def_stab: 46, def_slash: 48, def_crush: 42, def_ranged: 44, prayer: 1 }, equipReqs: { defence: 60 } });
items.define({ id: 20011, name: 'Dragon platebody', examine: 'A dragon platebody.', value: 2000000, category: 'armour', equipSlot: 'body', stats: { def_stab: 98, def_slash: 105, def_crush: 92, def_ranged: 95 }, equipReqs: { defence: 60 } });
items.define({ id: 20012, name: 'Dragon platelegs', examine: 'Dragon leg armour.', value: 800000, category: 'armour', equipSlot: 'legs', stats: { def_stab: 68, def_slash: 66, def_crush: 63, def_ranged: 65 }, equipReqs: { defence: 60 } });
items.define({ id: 20013, name: 'Dragon plateskirt', examine: 'A dragon plateskirt.', value: 650000, category: 'armour', equipSlot: 'legs', stats: { def_stab: 68, def_slash: 66, def_crush: 63, def_ranged: 65 }, equipReqs: { defence: 60 } });
items.define({ id: 20014, name: 'Dragon sq shield', examine: 'A dragon square shield.', value: 450000, category: 'armour', equipSlot: 'shield', stats: { def_stab: 50, def_slash: 52, def_crush: 48, def_magic: -3, def_ranged: 50 }, equipReqs: { defence: 60 } });
items.define({ id: 20015, name: 'Dragon boots', examine: 'Dragon boots. Melee strength bonus.', value: 300000, category: 'armour', equipSlot: 'feet', stats: { def_stab: 16, def_slash: 17, def_crush: 18, melee_strength: 4 }, equipReqs: { defence: 60 } });
items.define({ id: 20016, name: 'Dragon defender', examine: 'An offensive dragon shield.', value: 350000, category: 'armour', equipSlot: 'shield', stats: { slash: 25, stab: 23, crush: 22, melee_strength: 6, def_stab: 24, def_slash: 23, def_crush: 25 }, equipReqs: { attack: 60, defence: 60 } });
items.define({ id: 20017, name: 'Dragon pickaxe', examine: 'A dragon pickaxe. Best mining tool.', value: 400000, category: 'weapon', equipSlot: 'weapon', speed: 5, stats: { stab: 42, melee_strength: 38 }, equipReqs: { attack: 61, mining: 61 } });
items.define({ id: 20018, name: 'Dragon axe', examine: 'A dragon axe. Best woodcutting tool.', value: 200000, category: 'weapon', equipSlot: 'weapon', speed: 5, stats: { slash: 43, melee_strength: 42 }, equipReqs: { attack: 61, woodcutting: 61 } });
items.define({ id: 20019, name: 'Dragon harpoon', examine: 'A dragon harpoon. Best fishing tool.', value: 250000, category: 'weapon', equipSlot: 'weapon', speed: 5, stats: { stab: 42, melee_strength: 38 }, equipReqs: { attack: 61, fishing: 61 } });

// ══════════════════════════════════════════════════════════════════════════════
// BARROWS — 6 brothers, each a degradable set (level 70)
// Each set has a unique set effect. Non-degenerate: best-in-slot for different roles.
// ══════════════════════════════════════════════════════════════════════════════

// Dharok — melee, damage increases as HP decreases
items.define({ id: 21001, name: "Dharok's greataxe", examine: 'A massive barrows greataxe. Set effect: damage scales with missing HP.', value: 500000, category: 'weapon', equipSlot: 'weapon', speed: 7, stats: { slash: 95, melee_strength: 103 }, equipReqs: { attack: 70, strength: 70 } });
items.define({ id: 21002, name: "Dharok's helm", examine: "Dharok's barrows helm.", value: 300000, category: 'armour', equipSlot: 'head', stats: { def_stab: 45, def_slash: 48, def_crush: 44, def_ranged: 43 }, equipReqs: { defence: 70 } });
items.define({ id: 21003, name: "Dharok's platebody", examine: "Dharok's barrows platebody.", value: 600000, category: 'armour', equipSlot: 'body', stats: { def_stab: 105, def_slash: 110, def_crush: 95, def_ranged: 100 }, equipReqs: { defence: 70 } });
items.define({ id: 21004, name: "Dharok's platelegs", examine: "Dharok's barrows legs.", value: 400000, category: 'armour', equipSlot: 'legs', stats: { def_stab: 72, def_slash: 70, def_crush: 68, def_ranged: 65 }, equipReqs: { defence: 70 } });

// Guthan — melee, heals on hit
items.define({ id: 21011, name: "Guthan's warspear", examine: "A barrows spear. Set effect: attacks have a chance to heal you.", value: 450000, category: 'weapon', equipSlot: 'weapon', speed: 5, stats: { stab: 75, melee_strength: 72 }, equipReqs: { attack: 70 } });
items.define({ id: 21012, name: "Guthan's helm", examine: "Guthan's barrows helm.", value: 300000, category: 'armour', equipSlot: 'head', stats: { def_stab: 45, def_slash: 48, def_crush: 44 }, equipReqs: { defence: 70 } });
items.define({ id: 21013, name: "Guthan's platebody", examine: "Guthan's barrows body.", value: 600000, category: 'armour', equipSlot: 'body', stats: { def_stab: 105, def_slash: 110, def_crush: 95 }, equipReqs: { defence: 70 } });
items.define({ id: 21014, name: "Guthan's chainskirt", examine: "Guthan's barrows legs.", value: 400000, category: 'armour', equipSlot: 'legs', stats: { def_stab: 72, def_slash: 70, def_crush: 68 }, equipReqs: { defence: 70 } });

// Verac — melee, hits through prayer
items.define({ id: 21021, name: "Verac's flail", examine: "A barrows flail. Set effect: attacks have 25% chance to ignore prayer.", value: 400000, category: 'weapon', equipSlot: 'weapon', speed: 5, stats: { crush: 68, melee_strength: 72, prayer: 6 }, equipReqs: { attack: 70 } });
items.define({ id: 21022, name: "Verac's helm", examine: "Verac's barrows helm.", value: 280000, category: 'armour', equipSlot: 'head', stats: { def_stab: 45, def_slash: 48, def_crush: 44, prayer: 3 }, equipReqs: { defence: 70 } });
items.define({ id: 21023, name: "Verac's brassard", examine: "Verac's barrows body.", value: 550000, category: 'armour', equipSlot: 'body', stats: { def_stab: 81, def_slash: 95, def_crush: 85, prayer: 5 }, equipReqs: { defence: 70 } });
items.define({ id: 21024, name: "Verac's plateskirt", examine: "Verac's barrows legs.", value: 380000, category: 'armour', equipSlot: 'legs', stats: { def_stab: 68, def_slash: 66, def_crush: 63, prayer: 4 }, equipReqs: { defence: 70 } });

// Ahrim — magic, drains enemy stats
items.define({ id: 21031, name: "Ahrim's staff", examine: "A barrows staff. Set effect: attacks drain enemy magic.", value: 350000, category: 'weapon', equipSlot: 'weapon', speed: 4, stats: { magic: 15, magic_strength: 5, crush: 12 }, equipReqs: { magic: 70, attack: 70 } });
items.define({ id: 21032, name: "Ahrim's hood", examine: "Ahrim's barrows hood.", value: 250000, category: 'armour', equipSlot: 'head', stats: { magic: 6, def_magic: 6, def_stab: 6, def_slash: 6 }, equipReqs: { magic: 70, defence: 70 } });
items.define({ id: 21033, name: "Ahrim's robe top", examine: "Ahrim's barrows top.", value: 500000, category: 'armour', equipSlot: 'body', stats: { magic: 10, def_magic: 10, def_stab: 52, def_slash: 37 }, equipReqs: { magic: 70, defence: 70 } });
items.define({ id: 21034, name: "Ahrim's robe bottom", examine: "Ahrim's barrows bottom.", value: 350000, category: 'armour', equipSlot: 'legs', stats: { magic: 8, def_magic: 8, def_stab: 30, def_slash: 22 }, equipReqs: { magic: 70, defence: 70 } });

// Karil — ranged, drains enemy agility
items.define({ id: 21041, name: "Karil's crossbow", examine: "A barrows crossbow. Set effect: attacks drain enemy agility.", value: 400000, category: 'weapon', equipSlot: 'weapon', speed: 4, stats: { ranged: 84 }, equipReqs: { ranged: 70 } });
items.define({ id: 21042, name: "Karil's coif", examine: "Karil's barrows coif.", value: 250000, category: 'armour', equipSlot: 'head', stats: { ranged: 7, def_stab: 18, def_slash: 20, def_crush: 22, def_magic: 10, def_ranged: 4 }, equipReqs: { ranged: 70, defence: 70 } });
items.define({ id: 21043, name: "Karil's leathertop", examine: "Karil's barrows top.", value: 500000, category: 'armour', equipSlot: 'body', stats: { ranged: 12, def_stab: 57, def_slash: 47, def_crush: 62, def_magic: 20, def_ranged: 8 }, equipReqs: { ranged: 70, defence: 70 } });
items.define({ id: 21044, name: "Karil's leatherskirt", examine: "Karil's barrows skirt.", value: 350000, category: 'armour', equipSlot: 'legs', stats: { ranged: 8, def_stab: 38, def_slash: 26, def_crush: 40, def_magic: 12, def_ranged: 6 }, equipReqs: { ranged: 70, defence: 70 } });

// Torag — tank, reduces enemy run energy
items.define({ id: 21051, name: "Torag's hammers", examine: "Barrows war hammers. Set effect: attacks drain enemy run energy.", value: 350000, category: 'weapon', equipSlot: 'weapon', speed: 5, stats: { crush: 72, melee_strength: 72 }, equipReqs: { attack: 70, strength: 70 } });
items.define({ id: 21052, name: "Torag's helm", examine: "Torag's barrows helm.", value: 280000, category: 'armour', equipSlot: 'head', stats: { def_stab: 50, def_slash: 52, def_crush: 48, def_ranged: 46 }, equipReqs: { defence: 70 } });
items.define({ id: 21053, name: "Torag's platebody", examine: "Torag's barrows platebody. Highest melee defence.", value: 600000, category: 'armour', equipSlot: 'body', stats: { def_stab: 110, def_slash: 115, def_crush: 105, def_ranged: 100 }, equipReqs: { defence: 70 } });
items.define({ id: 21054, name: "Torag's platelegs", examine: "Torag's barrows legs. Highest melee defence.", value: 420000, category: 'armour', equipSlot: 'legs', stats: { def_stab: 78, def_slash: 76, def_crush: 74, def_ranged: 72 }, equipReqs: { defence: 70 } });

// ══════════════════════════════════════════════════════════════════════════════
// SLAYER-ONLY DROPS — items only obtainable from specific slayer monsters
// Non-degenerate: each item has a unique use case
// ══════════════════════════════════════════════════════════════════════════════

items.define({ id: 22001, name: 'Abyssal whip', examine: 'A whip from an abyssal demon. Fast and deadly.', value: 200000, category: 'weapon', equipSlot: 'weapon', speed: 4, stats: { slash: 82, melee_strength: 82 }, equipReqs: { attack: 70 } });
items.define({ id: 22002, name: 'Dark bow', examine: 'A bow from a dark beast. Fires two arrows at once.', value: 150000, category: 'weapon', equipSlot: 'weapon', speed: 8, stats: { ranged: 95, ranged_strength: 10 }, equipReqs: { ranged: 60 } });
items.define({ id: 22003, name: 'Granite maul', examine: 'A heavy granite weapon. Instant special attack.', value: 100000, category: 'weapon', equipSlot: 'weapon', speed: 7, stats: { crush: 81, melee_strength: 79 }, equipReqs: { attack: 50, strength: 50 } });
items.define({ id: 22004, name: 'Trident of the seas', examine: 'A trident that casts built-in water spells.', value: 200000, category: 'weapon', equipSlot: 'weapon', speed: 4, stats: { magic: 25, magic_strength: 15 }, equipReqs: { magic: 75 } });
items.define({ id: 22005, name: 'Mystic smoke staff', examine: 'A staff that combines air and fire runes.', value: 80000, category: 'weapon', equipSlot: 'weapon', speed: 5, stats: { magic: 18, magic_strength: 10, crush: 12 }, equipReqs: { magic: 40, attack: 40 } });
items.define({ id: 22006, name: 'Leaf-bladed battleaxe', examine: 'Made from a special leaf blade. Effective against turoths and kurasks.', value: 65000, category: 'weapon', equipSlot: 'weapon', speed: 5, stats: { slash: 72, melee_strength: 68 }, equipReqs: { attack: 65, slayer: 55 } });
items.define({ id: 22007, name: 'Imbued heart', examine: 'Boosts Magic by 1-10 levels when activated.', value: 500000, category: 'misc', weight: 0.3 });
items.define({ id: 22008, name: 'Eternal gem', examine: 'Used to craft an eternal slayer ring.', value: 300000, category: 'misc', weight: 0.1 });
items.define({ id: 22009, name: 'Basilisk jaw', examine: 'Attach to a helm for a powerful melee headpiece.', value: 400000, category: 'crafting', weight: 0.5 });
items.define({ id: 22010, name: 'Nechryael contract', examine: 'A slayer contract with bonus points.', value: 0, category: 'slayer', tradeable: false, weight: 0 });

// ══════════════════════════════════════════════════════════════════════════════
// CLUE SCROLL REWARDS — cosmetic + utility items from treasure trails
// ══════════════════════════════════════════════════════════════════════════════

// Trimmed armour (cosmetic upgrades to existing tiers)
items.define({ id: 23001, name: 'Rune platebody (t)', examine: 'A rune platebody with gold trim.', value: 100000, category: 'armour', equipSlot: 'body', stats: { def_stab: 82, def_slash: 80, def_crush: 72 }, equipReqs: { defence: 40 } });
items.define({ id: 23002, name: 'Rune platebody (g)', examine: 'A rune platebody with gold and blue trim.', value: 150000, category: 'armour', equipSlot: 'body', stats: { def_stab: 82, def_slash: 80, def_crush: 72 }, equipReqs: { defence: 40 } });
items.define({ id: 23003, name: 'Black platebody (t)', examine: 'A black platebody with trim.', value: 30000, category: 'armour', equipSlot: 'body', stats: { def_stab: 40, def_slash: 38, def_crush: 32 }, equipReqs: { defence: 10 } });

// God pages & books
items.define({ id: 23010, name: 'Holy book', examine: 'A completed holy book. Prayer bonus.', value: 50000, category: 'armour', equipSlot: 'shield', stats: { prayer: 5 }, equipReqs: {} });
items.define({ id: 23011, name: 'Book of darkness', examine: 'A book of the dark gods. Magic attack bonus.', value: 50000, category: 'armour', equipSlot: 'shield', stats: { magic: 10, prayer: 5 }, equipReqs: {} });
items.define({ id: 23012, name: 'Book of war', examine: 'A book of war. Melee strength bonus.', value: 50000, category: 'armour', equipSlot: 'shield', stats: { melee_strength: 5, prayer: 5 }, equipReqs: {} });

// Rangers & Wizard boots (rare clue items, BIS for their slot)
items.define({ id: 23020, name: 'Ranger boots', examine: 'Leather boots of exceptional quality.', value: 500000, category: 'armour', equipSlot: 'feet', stats: { ranged: 8, def_ranged: 4 }, equipReqs: { ranged: 40 } });
items.define({ id: 23021, name: 'Wizard boots', examine: 'Boots enchanted with magical energy.', value: 200000, category: 'armour', equipSlot: 'feet', stats: { magic: 4, def_magic: 4 }, equipReqs: { magic: 40 } });
items.define({ id: 23022, name: "Robin Hood hat", examine: 'A feathered hat of legendary archers.', value: 400000, category: 'armour', equipSlot: 'head', stats: { ranged: 8 }, equipReqs: { ranged: 40 } });

// Third-age armour (ultra-rare prestige)
items.define({ id: 23030, name: 'Third-age platebody', examine: 'Ancient armour of incredible craftsmanship.', value: 5000000, category: 'armour', equipSlot: 'body', stats: { def_stab: 65, def_slash: 63, def_crush: 58, def_magic: -4, def_ranged: 60, prayer: 1 }, equipReqs: { defence: 65 } });
items.define({ id: 23031, name: 'Third-age platelegs', examine: 'Ancient leg armour.', value: 3000000, category: 'armour', equipSlot: 'legs', stats: { def_stab: 40, def_slash: 38, def_crush: 35, def_ranged: 38, prayer: 1 }, equipReqs: { defence: 65 } });
items.define({ id: 23032, name: 'Third-age full helm', examine: 'An ancient full helm.', value: 2000000, category: 'armour', equipSlot: 'head', stats: { def_stab: 26, def_slash: 28, def_crush: 24, def_ranged: 25, prayer: 1 }, equipReqs: { defence: 65 } });
items.define({ id: 23033, name: 'Third-age range top', examine: 'Ancient ranged armour.', value: 5000000, category: 'armour', equipSlot: 'body', stats: { ranged: 18, def_stab: 45, def_slash: 38, def_crush: 50, def_magic: 25, def_ranged: 8 }, equipReqs: { ranged: 65, defence: 65 } });
items.define({ id: 23034, name: 'Third-age mage hat', examine: 'Ancient mage headgear.', value: 4000000, category: 'armour', equipSlot: 'head', stats: { magic: 8, def_magic: 8, def_stab: 6, def_slash: 6, prayer: 1 }, equipReqs: { magic: 65, defence: 65 } });

// ══════════════════════════════════════════════════════════════════════════════
// RINGS — combat rings with meaningful choices (P12 encounter itemization)
// ══════════════════════════════════════════════════════════════════════════════

items.define({ id: 24001, name: 'Berserker ring', examine: 'A ring of the berserkers. Melee strength.', value: 150000, category: 'jewellery', equipSlot: 'ring', stats: { melee_strength: 4 }, equipReqs: {} });
items.define({ id: 24002, name: 'Archers ring', examine: 'A ring of the archers. Ranged accuracy.', value: 150000, category: 'jewellery', equipSlot: 'ring', stats: { ranged: 4 }, equipReqs: {} });
items.define({ id: 24003, name: 'Seers ring', examine: 'A ring of the seers. Magic accuracy.', value: 150000, category: 'jewellery', equipSlot: 'ring', stats: { magic: 4 }, equipReqs: {} });
items.define({ id: 24004, name: 'Warrior ring', examine: 'A ring of warriors. Slash accuracy.', value: 100000, category: 'jewellery', equipSlot: 'ring', stats: { slash: 4 }, equipReqs: {} });
items.define({ id: 24005, name: 'Ring of suffering', examine: 'Absorbs recoil damage. Defensive ring.', value: 300000, category: 'jewellery', equipSlot: 'ring', stats: { def_stab: 10, def_slash: 10, def_crush: 10, def_magic: 10, def_ranged: 10 }, equipReqs: {} });
items.define({ id: 24006, name: 'Brimstone ring', examine: 'Reduces enemy magic defence by 10%.', value: 500000, category: 'jewellery', equipSlot: 'ring', stats: { magic: 4, melee_strength: 4, ranged_strength: 4 }, equipReqs: {} });

// Imbued versions (doubled stats — from NMZ/boss content)
items.define({ id: 24011, name: 'Berserker ring (i)', examine: 'An imbued berserker ring. Doubled melee strength.', value: 300000, category: 'jewellery', equipSlot: 'ring', stats: { melee_strength: 8 }, equipReqs: {} });
items.define({ id: 24012, name: 'Archers ring (i)', examine: 'An imbued archers ring. Doubled ranged accuracy.', value: 300000, category: 'jewellery', equipSlot: 'ring', stats: { ranged: 8 }, equipReqs: {} });
items.define({ id: 24013, name: 'Seers ring (i)', examine: 'An imbued seers ring. Doubled magic accuracy.', value: 300000, category: 'jewellery', equipSlot: 'ring', stats: { magic: 8 }, equipReqs: {} });

// ══════════════════════════════════════════════════════════════════════════════
// AMMUNITION — higher tier bolts, javelin, darts
// ══════════════════════════════════════════════════════════════════════════════

items.define({ id: 25001, name: 'Dragon arrow', examine: 'Dragon-tipped arrows.', value: 200, category: 'ranged', stackable: true, weight: 0, stats: { ranged_strength: 60 } });
items.define({ id: 25002, name: 'Dragon bolts', examine: 'Dragon crossbow bolts.', value: 250, category: 'ranged', stackable: true, weight: 0, stats: { ranged_strength: 62 } });
items.define({ id: 25003, name: 'Dragon bolts (e)', examine: 'Enchanted dragon bolts. Special effect on proc.', value: 400, category: 'ranged', stackable: true, weight: 0, stats: { ranged_strength: 78 } });
items.define({ id: 25004, name: 'Bronze dart', examine: 'A bronze throwing dart.', value: 1, category: 'ranged', stackable: true, weight: 0, stats: { ranged: 3, ranged_strength: 1 } });
items.define({ id: 25005, name: 'Iron dart', examine: 'An iron throwing dart.', value: 2, category: 'ranged', stackable: true, weight: 0, stats: { ranged: 5, ranged_strength: 3 } });
items.define({ id: 25006, name: 'Steel dart', examine: 'A steel throwing dart.', value: 5, category: 'ranged', stackable: true, weight: 0, stats: { ranged: 8, ranged_strength: 6 } });
items.define({ id: 25007, name: 'Mithril dart', examine: 'A mithril throwing dart.', value: 12, category: 'ranged', stackable: true, weight: 0, stats: { ranged: 11, ranged_strength: 9 } });
items.define({ id: 25008, name: 'Adamant dart', examine: 'An adamant throwing dart.', value: 25, category: 'ranged', stackable: true, weight: 0, stats: { ranged: 15, ranged_strength: 14 } });
items.define({ id: 25009, name: 'Rune dart', examine: 'A rune throwing dart.', value: 60, category: 'ranged', stackable: true, weight: 0, stats: { ranged: 18, ranged_strength: 20 } });
items.define({ id: 25010, name: 'Dragon dart', examine: 'A dragon throwing dart.', value: 150, category: 'ranged', stackable: true, weight: 0, stats: { ranged: 22, ranged_strength: 25 } });
items.define({ id: 25011, name: 'Toxic blowpipe', examine: 'A blowpipe that fires darts with venom.', value: 1000000, category: 'weapon', equipSlot: 'weapon', speed: 3, stats: { ranged: 30, ranged_strength: 20 }, equipReqs: { ranged: 75 } });

// ══════════════════════════════════════════════════════════════════════════════
// MISC HIGH-VALUE ITEMS
// ══════════════════════════════════════════════════════════════════════════════

items.define({ id: 26001, name: 'Dragonfire shield', examine: 'A shield that absorbs dragonfire. Must be charged.', value: 800000, category: 'armour', equipSlot: 'shield', stats: { def_stab: 20, def_slash: 25, def_crush: 22, def_magic: -5, def_ranged: 20, melee_strength: 7 }, equipReqs: { defence: 75 } });
items.define({ id: 26002, name: 'Serpentine helm', examine: 'A helm from a giant serpent. Inflicts venom on attackers.', value: 600000, category: 'armour', equipSlot: 'head', stats: { def_stab: 52, def_slash: 55, def_crush: 50, def_ranged: 48, melee_strength: 3 }, equipReqs: { defence: 75 } });
items.define({ id: 26003, name: 'Bandos chestplate', examine: 'Armour of a war god. Best melee body that also gives strength.', value: 3000000, category: 'armour', equipSlot: 'body', stats: { def_stab: 98, def_slash: 93, def_crush: 105, def_ranged: 80, melee_strength: 4 }, equipReqs: { defence: 65 } });
items.define({ id: 26004, name: 'Bandos tassets', examine: 'Tassets of a war god. Best melee legs with strength.', value: 2500000, category: 'armour', equipSlot: 'legs', stats: { def_stab: 71, def_slash: 63, def_crush: 66, def_ranged: 58, melee_strength: 2 }, equipReqs: { defence: 65 } });
items.define({ id: 26005, name: 'Bandos godsword', examine: 'A godsword aligned with the war god.', value: 2000000, category: 'weapon', equipSlot: 'weapon', speed: 6, stats: { slash: 132, melee_strength: 132 }, equipReqs: { attack: 75 } });
items.define({ id: 26006, name: 'Armadyl chestplate', examine: 'Blessed ranged armour of an aviansie god.', value: 3000000, category: 'armour', equipSlot: 'body', stats: { ranged: 33, def_stab: 56, def_slash: 48, def_crush: 61, def_magic: 70, def_ranged: 57 }, equipReqs: { ranged: 65, defence: 65 } });
items.define({ id: 26007, name: 'Armadyl chainskirt', examine: 'Blessed ranged legs.', value: 2500000, category: 'armour', equipSlot: 'legs', stats: { ranged: 20, def_stab: 32, def_slash: 26, def_crush: 34, def_magic: 40, def_ranged: 33 }, equipReqs: { ranged: 65, defence: 65 } });
items.define({ id: 26008, name: 'Armadyl crossbow', examine: 'A crossbow blessed by Armadyl. Long range, high accuracy.', value: 4000000, category: 'weapon', equipSlot: 'weapon', speed: 5, stats: { ranged: 100, prayer: 1 }, equipReqs: { ranged: 70 } });
items.define({ id: 26009, name: 'Ancestral hat', examine: 'Ancient magical headgear. Best-in-slot magic head.', value: 3000000, category: 'armour', equipSlot: 'head', stats: { magic: 8, magic_strength: 2, def_magic: 8, def_stab: 8, def_slash: 8, prayer: 2 }, equipReqs: { magic: 75, defence: 65 } });
items.define({ id: 26010, name: 'Ancestral robe top', examine: 'Ancient magical robes. Best magic body.', value: 8000000, category: 'armour', equipSlot: 'body', stats: { magic: 12, magic_strength: 2, def_magic: 12, def_stab: 42, def_slash: 30 }, equipReqs: { magic: 75, defence: 65 } });
items.define({ id: 26011, name: 'Ancestral robe bottom', examine: 'Ancient magical robes.', value: 5000000, category: 'armour', equipSlot: 'legs', stats: { magic: 10, magic_strength: 2, def_magic: 10, def_stab: 28, def_slash: 22 }, equipReqs: { magic: 75, defence: 65 } });
items.define({ id: 26012, name: 'Twisted bow', examine: 'A bow twisted with ancient power. Accuracy and damage scale with target magic level.', value: 20000000, category: 'weapon', equipSlot: 'weapon', speed: 5, stats: { ranged: 70, ranged_strength: 20 }, equipReqs: { ranged: 75 } });
items.define({ id: 26013, name: 'Scythe of vitur', examine: 'A vampyre scythe. Hits 3 targets in a line.', value: 15000000, category: 'weapon', equipSlot: 'weapon', speed: 5, stats: { slash: 110, melee_strength: 75 }, equipReqs: { attack: 75, strength: 75 } });

console.log('[aelgard] Dragon tier, Barrows, Slayer drops, Clue rewards, God Wars items loaded');
