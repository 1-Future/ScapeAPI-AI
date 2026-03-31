// ── Shop System (8.4) ─────────────────────────────────────────────────────────
// NPC shops with stock, dynamic pricing, restocking

const shops = new Map(); // id → shop

function define(id, opts) {
  const stock = (opts.stock || []).map(s => ({ ...s, current: s.base }));
  shops.set(id, {
    id,
    name: opts.name || id,
    npc: opts.npc || null,
    type: opts.type || 'specialty', // specialty or general
    stock,
    restockRate: opts.restockRate || 100, // ticks per restock
    lastRestock: 0,
  });
}

function getShop(id) { return shops.get(id); }

function findByNpc(npcName) {
  const lower = npcName.toLowerCase();
  for (const shop of shops.values()) {
    if (shop.npc && shop.npc.toLowerCase() === lower) return shop;
  }
  return null;
}

function buyPrice(shop, itemIdx) {
  const s = shop.stock[itemIdx];
  if (!s) return -1;
  // Price increases as stock decreases
  const ratio = s.current > 0 ? s.base / s.current : 10;
  return Math.max(1, Math.floor(s.price * ratio));
}

function sellPrice(shop, itemValue) {
  if (shop.type === 'general') return Math.floor(itemValue * 0.4);
  return Math.floor(itemValue * 0.6);
}

function buy(shop, itemIdx, count = 1) {
  const s = shop.stock[itemIdx];
  if (!s || s.current < count) return null;
  const price = buyPrice(shop, itemIdx) * count;
  s.current -= count;
  return { itemId: s.id, name: s.name, count, price };
}

function sell(shop, itemId, name, count, value) {
  const price = sellPrice(shop, value) * count;
  // Add to stock if specialty shop has this item, or always for general
  const existing = shop.stock.find(s => s.id === itemId);
  if (existing) existing.current += count;
  else if (shop.type === 'general') shop.stock.push({ id: itemId, name, base: 0, current: count, price: value });
  return price;
}

function restockTick(currentTick) {
  for (const shop of shops.values()) {
    if (currentTick - shop.lastRestock < shop.restockRate) continue;
    shop.lastRestock = currentTick;
    for (const s of shop.stock) {
      if (s.current < s.base) s.current++;
      else if (s.current > s.base) s.current--;
    }
  }
}

// ── Define default shops ──────────────────────────────────────────────────────
define('general_store', {
  name: 'General Store',
  npc: 'Shopkeeper',
  type: 'general',
  stock: [
    { id: 573, name: 'Tinderbox', base: 5, price: 1 },
    { id: 572, name: 'Knife', base: 3, price: 6 },
    { id: 570, name: 'Hammer', base: 5, price: 5 },
    { id: 571, name: 'Chisel', base: 3, price: 5 },
    { id: 574, name: 'Needle', base: 3, price: 1 },
    { id: 575, name: 'Thread', base: 100, price: 1 },
    { id: 325, name: 'Vial', base: 10, price: 1 },
    { id: 324, name: 'Vial of water', base: 10, price: 2 },
  ],
});

define('weapon_shop', {
  name: 'Sword Shop',
  npc: 'Weapon Master',
  type: 'specialty',
  stock: [
    { id: 400, name: 'Bronze dagger', base: 10, price: 10 },
    { id: 401, name: 'Bronze sword', base: 10, price: 20 },
    { id: 402, name: 'Bronze scimitar', base: 5, price: 32 },
    { id: 411, name: 'Iron sword', base: 5, price: 56 },
    { id: 412, name: 'Iron scimitar', base: 5, price: 80 },
    { id: 420, name: 'Steel scimitar', base: 3, price: 320 },
    { id: 500, name: 'Wooden shield', base: 5, price: 10 },
    { id: 501, name: 'Bronze sq shield', base: 5, price: 32 },
  ],
});

define('armour_shop', {
  name: 'Armour Shop',
  npc: 'Armour Seller',
  type: 'specialty',
  stock: [
    { id: 510, name: 'Bronze platebody', base: 5, price: 160 },
    { id: 520, name: 'Bronze platelegs', base: 5, price: 80 },
    { id: 530, name: 'Bronze full helm', base: 5, price: 44 },
    { id: 511, name: 'Iron platebody', base: 3, price: 280 },
    { id: 521, name: 'Iron platelegs', base: 3, price: 140 },
    { id: 512, name: 'Steel platebody', base: 2, price: 1200 },
  ],
});

define('mining_shop', {
  name: 'Mining Supplies',
  npc: 'Mining Instructor',
  type: 'specialty',
  stock: [
    { id: 550, name: 'Bronze pickaxe', base: 5, price: 10 },
    { id: 551, name: 'Iron pickaxe', base: 3, price: 56 },
    { id: 552, name: 'Steel pickaxe', base: 2, price: 200 },
  ],
});

define('fishing_shop', {
  name: 'Fishing Supplies',
  npc: 'Fishing Tutor',
  type: 'specialty',
  stock: [
    { id: 576, name: 'Small fishing net', base: 5, price: 5 },
    { id: 577, name: 'Fly fishing rod', base: 5, price: 5 },
    { id: 578, name: 'Harpoon', base: 3, price: 5 },
    { id: 579, name: 'Lobster pot', base: 3, price: 20 },
    { id: 104, name: 'Feather', base: 1000, price: 2 },
    { id: 109, name: 'Fishing bait', base: 500, price: 3 },
  ],
});

define('magic_shop', {
  name: 'Rune Shop',
  npc: 'Aubury',
  type: 'specialty',
  stock: [
    { id: 270, name: 'Air rune', base: 500, price: 4 },
    { id: 271, name: 'Water rune', base: 500, price: 4 },
    { id: 272, name: 'Earth rune', base: 500, price: 4 },
    { id: 273, name: 'Fire rune', base: 500, price: 4 },
    { id: 274, name: 'Mind rune', base: 500, price: 3 },
    { id: 275, name: 'Body rune', base: 250, price: 4 },
    { id: 276, name: 'Chaos rune', base: 50, price: 60 },
    { id: 277, name: 'Death rune', base: 50, price: 130 },
    { id: 278, name: 'Nature rune', base: 50, price: 130 },
    { id: 279, name: 'Law rune', base: 50, price: 160 },
  ],
});

module.exports = { define, getShop, findByNpc, buyPrice, sellPrice, buy, sell, restockTick, shops };
