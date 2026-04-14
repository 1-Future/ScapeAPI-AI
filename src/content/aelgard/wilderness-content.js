// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Expanded Wilderness Content
// The Wilds needs to be worth the risk. High reward PvP content.
// Everything here is dangerous — other players can attack you.
// But the rewards are proportionally better than safe content.
//
// Manifesto P13: Danger knob turned to MAX. Compensated with high rewards.
// Manifesto P04: Unique content not available anywhere else.
// ══════════════════════════════════════════════════════════════════════════════

const items = require('../../data/items');
const npcs = require('../../world/npcs');
const droptables = require('../../data/droptables');
const shops = require('../../data/shops');

// ══════════════════════════════════════════════════════════════════════════════
// WILDERNESS WEAPONS — only usable in the Wilds, BIS within
// ══════════════════════════════════════════════════════════════════════════════

items.define({ id: 99001, name: "Craw's bow", examine: "A bow that draws power from the wilderness. BIS ranged in the Wilds.", value: 5000000, category: 'weapon', equipSlot: 'weapon', speed: 4, stats: { ranged: 75, ranged_strength: 0 }, equipReqs: { ranged: 60 } });
// Note: In the wilderness, Craw's bow gets +50% accuracy and damage
items.define({ id: 99002, name: "Viggora's chainmace", examine: "A mace empowered by wilderness ether. BIS melee in the Wilds.", value: 5000000, category: 'weapon', equipSlot: 'weapon', speed: 4, stats: { crush: 60, melee_strength: 58 }, equipReqs: { attack: 60 } });
items.define({ id: 99003, name: "Thammaron's sceptre", examine: "A sceptre of dark magic. BIS magic in the Wilds.", value: 5000000, category: 'weapon', equipSlot: 'weapon', speed: 4, stats: { magic: 20, magic_strength: 15 }, equipReqs: { magic: 60 } });
items.define({ id: 99004, name: 'Wilderness ether', examine: 'Charges for wilderness weapons. Dropped by revenants.', value: 50, category: 'misc', stackable: true, weight: 0 });

// ══════════════════════════════════════════════════════════════════════════════
// WILDERNESS RESOURCE AREAS — high yield, high risk
// ══════════════════════════════════════════════════════════════════════════════

// Items for wilderness-exclusive resources
items.define({ id: 99010, name: 'Wilderness herb', examine: 'A herb only found in the Wilds. Used for anti-PK potions.', value: 200, category: 'herblore', weight: 0.1 });
items.define({ id: 99011, name: 'Anti-PK potion(4)', examine: 'Reduces incoming PvP damage by 10% for 5 minutes.', value: 2000, category: 'potion', weight: 0.5 });
items.define({ id: 99012, name: 'Revenant ether', examine: 'Essence dropped by revenants. Charges wilderness weapons.', value: 80, category: 'misc', stackable: true, weight: 0 });

// ══════════════════════════════════════════════════════════════════════════════
// BOUNTY HUNTER — PvP reward system
// ══════════════════════════════════════════════════════════════════════════════

items.define({ id: 99100, name: 'Bounty hunter emblem (tier 1)', examine: 'A PvP emblem. Upgrade by killing your target.', value: 50000, category: 'misc', tradeable: true });
items.define({ id: 99101, name: 'Bounty hunter emblem (tier 2)', examine: 'Upgraded emblem. More valuable.', value: 100000, category: 'misc', tradeable: true });
items.define({ id: 99102, name: 'Bounty hunter emblem (tier 3)', examine: 'Further upgraded. High value.', value: 250000, category: 'misc', tradeable: true });
items.define({ id: 99103, name: 'Bounty hunter emblem (tier 4)', examine: 'Near-max upgrade. Very valuable.', value: 500000, category: 'misc', tradeable: true });
items.define({ id: 99104, name: 'Bounty hunter emblem (tier 5)', examine: 'Maximum upgrade. Exchange for BH rewards.', value: 1000000, category: 'misc', tradeable: true });

// BH reward items
items.define({ id: 99110, name: 'Granite maul (or)', examine: 'An ornamental granite maul. Spec costs only 50% instead of 60%.', value: 200000, category: 'weapon', equipSlot: 'weapon', speed: 7, stats: { crush: 81, melee_strength: 79 }, equipReqs: { attack: 50, strength: 50 } });
items.define({ id: 99111, name: 'Rune pouch (wilderness)', examine: 'A rune pouch earned from BH. Holds 3 rune types in 1 slot.', value: 100000, category: 'misc', tradeable: false });
items.define({ id: 99112, name: 'Looting bag (upgraded)', examine: 'An upgraded looting bag. Holds 42 items instead of 28.', value: 300000, category: 'misc', tradeable: false });
items.define({ id: 99113, name: 'Blighted food pack', examine: 'Wilderness-only food. Cheaper but only works in the Wilds.', value: 5000, category: 'food', weight: 1 });

// ══════════════════════════════════════════════════════════════════════════════
// LAST MAN STANDING — PvP minigame
// ══════════════════════════════════════════════════════════════════════════════

items.define({ id: 99200, name: 'LMS token', examine: 'Earned from Last Man Standing. Exchange for rewards.', value: 0, category: 'misc', stackable: true, tradeable: false });
items.define({ id: 99201, name: 'Halos (Saradomin)', examine: 'A holy halo from LMS. Cosmetic + small prayer bonus.', value: 0, category: 'armour', equipSlot: 'head', stats: { prayer: 3, stab: 3, slash: 3, crush: 3, ranged: 3, magic: 3 }, tradeable: false });
items.define({ id: 99202, name: 'Halos (Zamorak)', examine: 'A dark halo from LMS.', value: 0, category: 'armour', equipSlot: 'head', stats: { prayer: 3, stab: 3, slash: 3, crush: 3, ranged: 3, magic: 3 }, tradeable: false });
items.define({ id: 99203, name: 'Halos (Guthix)', examine: 'A balanced halo from LMS.', value: 0, category: 'armour', equipSlot: 'head', stats: { prayer: 3, stab: 3, slash: 3, crush: 3, ranged: 3, magic: 3 }, tradeable: false });
items.define({ id: 99204, name: 'Steam staff ornament kit', examine: 'Cosmetic kit from LMS.', value: 0, category: 'misc', tradeable: false });
items.define({ id: 99205, name: 'Lava staff ornament kit', examine: 'Cosmetic kit from LMS.', value: 0, category: 'misc', tradeable: false });

// ══════════════════════════════════════════════════════════════════════════════
// CHAOS TEMPLE — wilderness prayer training
// ══════════════════════════════════════════════════════════════════════════════

// The chaos altar in the Wilds offers 3.5x prayer XP (same as gilded altar)
// BUT: 50% chance to consume the bone without giving XP
// NET: 1.75x XP per bone on average — worse than gilded altar
// HOWEVER: it's FREE to use (no construction level needed)
// AND: the 50% chance means you use half as many bones for the same XP
// This makes it the best METHOD for ironmen who can't afford gilded altar
// But you risk getting PKed and losing your bones.
// THIS is a perfectly balanced design knob trade-off.

// ══════════════════════════════════════════════════════════════════════════════
// WILDERNESS SLAYER — optional, higher reward tasks
// ══════════════════════════════════════════════════════════════════════════════

items.define({ id: 99300, name: 'Larran\'s key', examine: 'A key dropped during wilderness slayer tasks. Opens Larran\'s chest in the Wilds.', value: 30000, category: 'misc', weight: 0 });

// Larran's chest loot table (opened with key, located at wilderness ruins)
droptables.define('larrans_chest', {
  always: [{ id: 101, name: 'Coins', min: 10000, max: 50000 }],
  main: [
    { id: 107, name: 'Dragon bones', weight: 5, min: 10, max: 30 },
    { id: 2116, name: 'Runite bar', weight: 3, min: 3, max: 8 },
    { id: 11358, name: 'Blood rune', weight: 4, min: 50, max: 150 },
    { id: 12505, name: 'Uncut dragonstone', weight: 2, min: 2, max: 4 },
    { id: 2008, name: 'Shark', weight: 5, min: 10, max: 30 },
    { id: 12013, name: 'Grimy torstol', weight: 2, min: 5, max: 10 },
  ],
  tertiary: [
    { id: 20017, name: 'Dragon pickaxe', chance: 256, min: 1, max: 1 },
  ],
});

// ══════════════════════════════════════════════════════════════════════════════
// WILDERNESS NPC ADDITIONS
// ══════════════════════════════════════════════════════════════════════════════

npcs.defineNpc('wilderness_slayer_master', {
  name: 'Krystilia', combat: 0, maxHp: 1, size: 1,
  aggressive: false, wanderRadius: 0, canMove: false,
  examine: 'A slayer master who assigns wilderness-only tasks. Higher points but dangerous.',
  dialogue: { type: 'slayer' },
});

npcs.defineNpc('bounty_hunter_npc', {
  name: 'Bounty Hunter', combat: 0, maxHp: 1, size: 1,
  aggressive: false, wanderRadius: 0, canMove: false,
  examine: 'Exchange bounty hunter emblems for rewards.',
  dialogue: { type: 'shop', shopId: 'bh_rewards' },
});

shops.define('bh_rewards', {
  name: 'Bounty Hunter Rewards', npc: 'Bounty Hunter', type: 'specialty',
  stock: [
    { id: 99110, name: 'Granite maul (or)', base: 1, price: 500000 },
    { id: 99111, name: 'Rune pouch (wilderness)', base: 1, price: 200000 },
    { id: 99112, name: 'Looting bag (upgraded)', base: 1, price: 300000 },
  ],
  restockRate: 6000,
});

npcs.defineNpc('lms_npc', {
  name: 'LMS Justiciar', combat: 0, maxHp: 1, size: 1,
  aggressive: false, wanderRadius: 0, canMove: false,
  examine: 'Runs the Last Man Standing minigame. Exchange tokens for rewards.',
  dialogue: { type: 'minigame', minigameId: 'lms' },
});

console.log('[aelgard] Wilderness content: weapons, BH system, LMS, chaos altar, slayer master, Larran\'s chest');
