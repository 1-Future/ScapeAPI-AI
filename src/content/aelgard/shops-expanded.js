// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Expanded Shops (16 new → 30 total)
// Every region gets: general store, specialty shop, plus unique vendors
// ══════════════════════════════════════════════════════════════════════════════

const shops = require('../../data/shops');
const npcs = require('../../world/npcs');

// ══════════════════════════════════════════════════════════════════════════════
// HEARTLANDS (had 2, adding 3 → 5 total)
// ══════════════════════════════════════════════════════════════════════════════

npcs.defineNpc('jeweller_esme', { name: 'Jeweller Esme', combat: 0, maxHp: 1, aggressive: false, wanderRadius: 0, canMove: false, examine: 'A master jeweller with an eye for gems.', dialogue: { type: 'shop', shopId: 'heartlands_jeweller' } });
shops.define('heartlands_jeweller', { name: "Esme's Gems & Jewellery", npc: 'Jeweller Esme', type: 'specialty',
  stock: [
    { id: 12804, name: 'Chisel', base: 5, price: 5 },
    { id: 12501, name: 'Uncut sapphire', base: 3, price: 25 },
    { id: 12502, name: 'Uncut emerald', base: 2, price: 50 },
    { id: 12520, name: 'Gold ring', base: 3, price: 200 },
    { id: 12541, name: 'Amulet of strength', base: 1, price: 2000 },
  ], restockRate: 300 });

npcs.defineNpc('rune_seller_aubury', { name: 'Aubury', combat: 0, maxHp: 1, aggressive: false, wanderRadius: 0, canMove: false, examine: 'Sells runes and magical supplies.', dialogue: { type: 'shop', shopId: 'heartlands_runes' } });
shops.define('heartlands_runes', { name: "Aubury's Rune Shop", npc: 'Aubury', type: 'specialty',
  stock: [
    { id: 11350, name: 'Air rune', base: 500, price: 4 },
    { id: 11351, name: 'Water rune', base: 500, price: 4 },
    { id: 11352, name: 'Earth rune', base: 500, price: 4 },
    { id: 11353, name: 'Fire rune', base: 500, price: 4 },
    { id: 11354, name: 'Mind rune', base: 500, price: 3 },
    { id: 11355, name: 'Body rune', base: 500, price: 3 },
    { id: 11356, name: 'Chaos rune', base: 100, price: 90 },
    { id: 11357, name: 'Death rune', base: 50, price: 180 },
    { id: 11359, name: 'Nature rune', base: 50, price: 150 },
    { id: 11360, name: 'Law rune', base: 25, price: 200 },
  ], restockRate: 200 });

npcs.defineNpc('farming_supplier_aldwin', { name: 'Farmer Aldwin', combat: 0, maxHp: 1, aggressive: false, wanderRadius: 0, canMove: false, examine: 'Sells farming supplies and seeds.', dialogue: { type: 'shop', shopId: 'heartlands_farming' } });
shops.define('heartlands_farming', { name: "Aldwin's Farm Supply", npc: 'Farmer Aldwin', type: 'specialty',
  stock: [
    { id: 12818, name: 'Spade', base: 5, price: 5 },
    { id: 12819, name: 'Rake', base: 5, price: 8 },
    { id: 12820, name: 'Seed dibber', base: 5, price: 5 },
    { id: 12821, name: 'Secateurs', base: 5, price: 10 },
    { id: 12816, name: 'Compost', base: 20, price: 10 },
    { id: 12817, name: 'Supercompost', base: 5, price: 50 },
    { id: 12401, name: 'Potato seed', base: 50, price: 1 },
    { id: 12410, name: 'Guam seed', base: 10, price: 5 },
  ], restockRate: 200 });

// ══════════════════════════════════════════════════════════════════════════════
// BONEYARD WASTES (had 1, adding 2 → 3 total)
// ══════════════════════════════════════════════════════════════════════════════

npcs.defineNpc('bone_collector_kress', { name: 'Kress the Bone Collector', combat: 0, maxHp: 1, aggressive: false, wanderRadius: 0, canMove: false, examine: 'Collects bones and sells bone-crafted goods.', dialogue: { type: 'shop', shopId: 'boneyard_bones' } });
shops.define('boneyard_bones', { name: "Kress's Bone Market", npc: 'Kress the Bone Collector', type: 'specialty',
  stock: [
    { id: 4004, name: 'Bone shard', base: 20, price: 25 },
    { id: 4001, name: 'Leviathan bone', base: 3, price: 350 },
    { id: 100, name: 'Bones', base: 50, price: 1 },
    { id: 106, name: 'Big bones', base: 10, price: 15 },
  ], restockRate: 300 });

npcs.defineNpc('desert_general_jara', { name: 'Merchant Jara', combat: 0, maxHp: 1, aggressive: false, wanderRadius: 0, canMove: false, examine: 'A general store in the desert oasis.', dialogue: { type: 'shop', shopId: 'boneyard_general' } });
shops.define('boneyard_general', { name: "Jara's Oasis Store", npc: 'Merchant Jara', type: 'general',
  stock: [
    { id: 2001, name: 'Bread', base: 15, price: 15 },
    { id: 4008, name: 'Cactus water', base: 30, price: 15 },
    { id: 12801, name: 'Rope', base: 5, price: 20 },
    { id: 12802, name: 'Tinderbox', base: 5, price: 5 },
  ], restockRate: 200 });

// ══════════════════════════════════════════════════════════════════════════════
// MORYSKAH (had 1, adding 2 → 3 total)
// ══════════════════════════════════════════════════════════════════════════════

npcs.defineNpc('moryskah_general_ivan', { name: 'Trader Ivan', combat: 0, maxHp: 1, aggressive: false, wanderRadius: 0, canMove: false, examine: 'A nervous trader who serves the Moryskah village.', dialogue: { type: 'shop', shopId: 'moryskah_general' } });
shops.define('moryskah_general', { name: "Ivan's Desperate Goods", npc: 'Trader Ivan', type: 'general',
  stock: [
    { id: 2001, name: 'Bread', base: 10, price: 20 },
    { id: 2006, name: 'Lobster', base: 5, price: 200 },
    { id: 12801, name: 'Rope', base: 3, price: 25 },
    { id: 12802, name: 'Tinderbox', base: 3, price: 8 },
  ], restockRate: 250 });

npcs.defineNpc('gravedigger_morn', { name: 'Gravedigger Morn', combat: 0, maxHp: 1, aggressive: false, wanderRadius: 0, canMove: false, examine: 'Digs graves. Sells prayer supplies.', dialogue: { type: 'shop', shopId: 'moryskah_prayer' } });
shops.define('moryskah_prayer', { name: "Morn's Prayer Supplies", npc: 'Gravedigger Morn', type: 'specialty',
  stock: [
    { id: 100, name: 'Bones', base: 50, price: 3 },
    { id: 106, name: 'Big bones', base: 20, price: 20 },
    { id: 107, name: 'Dragon bones', base: 3, price: 1800 },
    { id: 5004, name: 'Ectoplasm', base: 10, price: 30 },
  ], restockRate: 300 });

// ══════════════════════════════════════════════════════════════════════════════
// VEILWOOD (had 1, adding 2 → 3 total)
// ══════════════════════════════════════════════════════════════════════════════

npcs.defineNpc('elven_herbalist_syl', { name: 'Herbalist Syl', combat: 0, maxHp: 1, aggressive: false, wanderRadius: 0, canMove: false, examine: 'An elven herbalist who tends the forest herbs.', dialogue: { type: 'shop', shopId: 'veilwood_herbs' } });
shops.define('veilwood_herbs', { name: "Syl's Herblore Supplies", npc: 'Herbalist Syl', type: 'specialty',
  stock: [
    { id: 12200, name: 'Vial of water', base: 50, price: 2 },
    { id: 12201, name: 'Eye of newt', base: 30, price: 5 },
    { id: 12202, name: 'Unicorn horn dust', base: 10, price: 50 },
    { id: 12203, name: 'Limpwurt root', base: 10, price: 30 },
    { id: 6003, name: 'Moonpetal', base: 5, price: 200 },
  ], restockRate: 250 });

npcs.defineNpc('elven_general_aela', { name: 'Vendor Aela', combat: 0, maxHp: 1, aggressive: false, wanderRadius: 0, canMove: false, examine: 'Sells forest supplies.', dialogue: { type: 'shop', shopId: 'veilwood_general' } });
shops.define('veilwood_general', { name: "Aela's Forest Goods", npc: 'Vendor Aela', type: 'general',
  stock: [
    { id: 2001, name: 'Bread', base: 10, price: 12 },
    { id: 1004, name: 'Bronze axe', base: 5, price: 16 },
    { id: 12803, name: 'Knife', base: 5, price: 10 },
    { id: 12710, name: 'Bow string', base: 20, price: 50 },
    { id: 12712, name: 'Feather', base: 200, price: 2 },
  ], restockRate: 150 });

// ══════════════════════════════════════════════════════════════════════════════
// SALTBRINE (had 1, adding 2 → 3 total)
// ══════════════════════════════════════════════════════════════════════════════

npcs.defineNpc('saltbrine_general_pip', { name: 'Merchant Pip', combat: 0, maxHp: 1, aggressive: false, wanderRadius: 0, canMove: false, examine: 'A cheerful dockside merchant.', dialogue: { type: 'shop', shopId: 'saltbrine_general' } });
shops.define('saltbrine_general', { name: "Pip's Harbour Store", npc: 'Merchant Pip', type: 'general',
  stock: [
    { id: 2001, name: 'Bread', base: 15, price: 12 },
    { id: 12801, name: 'Rope', base: 10, price: 20 },
    { id: 12802, name: 'Tinderbox', base: 5, price: 5 },
    { id: 8004, name: 'Barnacle shell', base: 10, price: 10 },
  ], restockRate: 150 });

npcs.defineNpc('ranged_supplier_bolt', { name: 'Bolt the Ranger', combat: 0, maxHp: 1, aggressive: false, wanderRadius: 0, canMove: false, examine: 'Sells ranged weapons and ammunition.', dialogue: { type: 'shop', shopId: 'saltbrine_ranged' } });
shops.define('saltbrine_ranged', { name: "Bolt's Ranged Supplies", npc: 'Bolt the Ranger', type: 'specialty',
  stock: [
    { id: 11001, name: 'Shortbow', base: 5, price: 50 },
    { id: 11005, name: 'Yew shortbow', base: 2, price: 800 },
    { id: 11100, name: 'Bronze arrow', base: 500, price: 1 },
    { id: 11103, name: 'Mithril arrow', base: 200, price: 16 },
    { id: 11105, name: 'Rune arrow', base: 50, price: 100 },
    { id: 11020, name: 'Bronze crossbow', base: 3, price: 70 },
    { id: 11110, name: 'Bronze bolts', base: 500, price: 1 },
    { id: 11200, name: 'Leather body', base: 5, price: 20 },
  ], restockRate: 250 });

// ══════════════════════════════════════════════════════════════════════════════
// SOOTWORKS (had 2, adding 1 → 3 total)
// ══════════════════════════════════════════════════════════════════════════════

npcs.defineNpc('sootworks_general_grit', { name: 'Vendor Grit', combat: 0, maxHp: 1, aggressive: false, wanderRadius: 0, canMove: false, examine: 'A grumpy dwarf who sells basic supplies.', dialogue: { type: 'shop', shopId: 'sootworks_general' } });
shops.define('sootworks_general', { name: "Grit's Underground Store", npc: 'Vendor Grit', type: 'general',
  stock: [
    { id: 2001, name: 'Bread', base: 10, price: 15 },
    { id: 7006, name: 'Dwarven stout', base: 20, price: 30 },
    { id: 12805, name: 'Hammer', base: 5, price: 5 },
    { id: 12802, name: 'Tinderbox', base: 5, price: 5 },
  ], restockRate: 200 });

// ══════════════════════════════════════════════════════════════════════════════
// INKWEALD (had 0, adding 2 → 2 total)
// ══════════════════════════════════════════════════════════════════════════════

npcs.defineNpc('dream_merchant_zyx', { name: 'Dream Merchant Zyx', combat: 0, maxHp: 1, aggressive: false, wanderRadius: 0, canMove: false, examine: 'Sells dreamstuff. Their wares shimmer and shift.', dialogue: { type: 'shop', shopId: 'inkweald_dreams' } });
shops.define('inkweald_dreams', { name: "Zyx's Dream Market", npc: 'Dream Merchant Zyx', type: 'specialty',
  stock: [
    { id: 9001, name: 'Inkblot fragment', base: 10, price: 400 },
    { id: 9002, name: 'Lucid essence', base: 3, price: 800 },
    { id: 9003, name: 'Dream thread', base: 5, price: 250 },
    { id: 9005, name: 'Echo petal', base: 10, price: 100 },
  ], restockRate: 400 });

npcs.defineNpc('inkweald_general_echo', { name: 'Echo', combat: 0, maxHp: 1, aggressive: false, wanderRadius: 0, canMove: false, examine: 'A shopkeeper who might be a dream themselves.', dialogue: { type: 'shop', shopId: 'inkweald_general' } });
shops.define('inkweald_general', { name: "Echo's Supplies", npc: 'Echo', type: 'general',
  stock: [
    { id: 2008, name: 'Shark', base: 5, price: 600 },
    { id: 12312, name: 'Super restore(4)', base: 3, price: 600 },
    { id: 12801, name: 'Rope', base: 5, price: 25 },
  ], restockRate: 350 });

// ══════════════════════════════════════════════════════════════════════════════
// GLASS DESERT (had 1, adding 1 → 2 total)
// ══════════════════════════════════════════════════════════════════════════════

npcs.defineNpc('glass_desert_general_zel2', { name: 'Supplier Zel', combat: 0, maxHp: 1, aggressive: false, wanderRadius: 0, canMove: false, examine: 'Sells survival supplies for the Glass Desert.', dialogue: { type: 'shop', shopId: 'glass_desert_general' } });
shops.define('glass_desert_general', { name: "Desert Survival Store", npc: 'Supplier Zel', type: 'general',
  stock: [
    { id: 2008, name: 'Shark', base: 10, price: 550 },
    { id: 12313, name: 'Saradomin brew(4)', base: 5, price: 500 },
    { id: 12312, name: 'Super restore(4)', base: 5, price: 600 },
    { id: 12314, name: 'Antifire(4)', base: 5, price: 250 },
  ], restockRate: 400 });

console.log('[aelgard] 16 expanded shops loaded');
