// ══════════════════════════════════════════════════════════════════════════════
// Construction — Player-Owned House (POH)
//
// Design Knobs (P13):
//   Training: 20-300k XP/hr depending on method, HIGH cost (planks + nails)
//   The "buyable" skill — fast XP but expensive. Trade-off vs other gold uses.
//
// Manifesto P08: Breakpoints at 50 (portal room), 70 (gilded altar = best prayer),
//   82 (jewellery box = unlimited teleports), 90 (max pool = full stat restore)
// Manifesto P04: Only source of certain utility (altar, pool, portal, storage)
// ══════════════════════════════════════════════════════════════════════════════

const { xpToLevel } = require('./gathering');
const items = require('../data/items');

const roomDefs = new Map();
const furnitureDefs = new Map();

function defineRoom(opts) {
  roomDefs.set(opts.id, {
    id: opts.id, name: opts.name,
    level: opts.level, cost: opts.cost || 0,
    hotspots: opts.hotspots || [], // [{ id, name, options: [furnitureId, ...] }]
  });
}

function defineFurniture(opts) {
  furnitureDefs.set(opts.id, {
    id: opts.id, name: opts.name,
    level: opts.level, xp: opts.xp,
    materials: opts.materials || [], // [{ id, name, count }]
    effect: opts.effect || null, // functional effect description
  });
}

function buildFurniture(player, furnitureId) {
  const def = furnitureDefs.get(furnitureId);
  if (!def) return { error: 'unknown_furniture' };

  const level = player.skills?.construction?.level || 1;
  if (level < def.level) return { error: 'level_too_low', required: def.level };

  // Check materials
  for (const mat of def.materials) {
    const count = player.inventory.filter(s => s && s.id === mat.id).reduce((sum, s) => sum + (s.count || 1), 0);
    if (count < mat.count) return { error: 'missing_material', need: mat.name, have: count, required: mat.count };
  }

  // Consume materials
  for (const mat of def.materials) {
    let remaining = mat.count;
    for (let i = 0; i < player.inventory.length && remaining > 0; i++) {
      if (player.inventory[i] && player.inventory[i].id === mat.id) {
        const take = Math.min(remaining, player.inventory[i].count || 1);
        if (player.inventory[i].count && player.inventory[i].count > take) {
          player.inventory[i].count -= take;
        } else {
          player.inventory[i] = null;
        }
        remaining -= take;
      }
    }
  }

  // Grant XP
  if (!player.skills.construction) player.skills.construction = { level: 1, xp: 0 };
  player.skills.construction.xp += def.xp;
  const newLevel = xpToLevel(player.skills.construction.xp);
  if (newLevel > player.skills.construction.level) player.skills.construction.level = newLevel;

  return { success: true, furniture: def.name, xp: def.xp, level: player.skills.construction.level };
}

// ── Plank items ────────────────────────────────────────────────────────────

items.define({ id: 15201, name: 'Plank', examine: 'A wooden plank.', value: 100, category: 'construction', weight: 1.5 });
items.define({ id: 15202, name: 'Oak plank', examine: 'An oak plank.', value: 250, category: 'construction', weight: 1.5 });
items.define({ id: 15203, name: 'Teak plank', examine: 'A teak plank.', value: 500, category: 'construction', weight: 1.5 });
items.define({ id: 15204, name: 'Mahogany plank', examine: 'A mahogany plank. Expensive but fast XP.', value: 1500, category: 'construction', weight: 1.5 });
items.define({ id: 15205, name: 'Steel nails', examine: 'Steel nails for construction.', value: 5, category: 'construction', stackable: true, weight: 0 });
items.define({ id: 15206, name: 'Gold leaf', examine: 'A sheet of gold leaf. Used for gilded furniture.', value: 130000, category: 'construction', weight: 0.1 });
items.define({ id: 15207, name: 'Marble block', examine: 'A block of marble. Used for high-level furniture.', value: 325000, category: 'construction', weight: 10 });
items.define({ id: 15208, name: 'Limestone brick', examine: 'A brick made from limestone.', value: 25, category: 'construction', weight: 2 });

// ── Room definitions ───────────────────────────────────────────────────────

defineRoom({ id: 'parlour', name: 'Parlour', level: 1, cost: 1000 });
defineRoom({ id: 'kitchen', name: 'Kitchen', level: 5, cost: 5000 });
defineRoom({ id: 'bedroom', name: 'Bedroom', level: 20, cost: 10000 });
defineRoom({ id: 'workshop', name: 'Workshop', level: 15, cost: 10000 });
defineRoom({ id: 'chapel', name: 'Chapel', level: 45, cost: 50000 });
defineRoom({ id: 'portal_room', name: 'Portal Chamber', level: 50, cost: 100000 });
defineRoom({ id: 'combat_room', name: 'Combat Room', level: 32, cost: 25000 });
defineRoom({ id: 'treasure_room', name: 'Treasure Room', level: 75, cost: 150000 });
defineRoom({ id: 'achievement_gallery', name: 'Achievement Gallery', level: 80, cost: 200000 });

// ── Furniture definitions ──────────────────────────────────────────────────

// Chairs (parlour) — basic training
defineFurniture({ id: 'crude_chair', name: 'Crude chair', level: 1, xp: 58,
  materials: [{ id: 15201, name: 'Plank', count: 2 }, { id: 15205, name: 'Steel nails', count: 2 }] });
defineFurniture({ id: 'oak_chair', name: 'Oak chair', level: 19, xp: 120,
  materials: [{ id: 15202, name: 'Oak plank', count: 2 }] });
defineFurniture({ id: 'teak_table', name: 'Teak table', level: 38, xp: 360,
  materials: [{ id: 15203, name: 'Teak plank', count: 4 }] });
defineFurniture({ id: 'mahogany_table', name: 'Mahogany table', level: 52, xp: 840,
  materials: [{ id: 15204, name: 'Mahogany plank', count: 6 }] });

// Kitchen
defineFurniture({ id: 'oak_larder', name: 'Oak larder', level: 33, xp: 480,
  materials: [{ id: 15202, name: 'Oak plank', count: 8 }] });

// Chapel — the big breakpoint (gilded altar = best prayer training)
defineFurniture({ id: 'oak_altar', name: 'Oak altar', level: 45, xp: 240,
  materials: [{ id: 15202, name: 'Oak plank', count: 4 }],
  effect: 'Altar — bones give 2x prayer XP' });
defineFurniture({ id: 'gilded_altar', name: 'Gilded altar', level: 75, xp: 2230,
  materials: [{ id: 15204, name: 'Mahogany plank', count: 4 }, { id: 15206, name: 'Gold leaf', count: 2 }],
  effect: 'Gilded altar — bones give 3.5x prayer XP (best prayer training in the game)' });

// Achievement gallery
defineFurniture({ id: 'jewellery_box', name: 'Ornate jewellery box', level: 91, xp: 2680,
  materials: [{ id: 15204, name: 'Mahogany plank', count: 2 }, { id: 15206, name: 'Gold leaf', count: 1 }],
  effect: 'Unlimited teleports to all jewellery destinations' });
defineFurniture({ id: 'ornate_pool', name: 'Ornate rejuvenation pool', level: 90, xp: 3660,
  materials: [{ id: 15207, name: 'Marble block', count: 2 }, { id: 15206, name: 'Gold leaf', count: 2 }],
  effect: 'Restores HP, prayer, run energy, special attack, and cures poison' });

// Portal room
defineFurniture({ id: 'portal_frame', name: 'Teleport portal', level: 50, xp: 100,
  materials: [{ id: 15204, name: 'Mahogany plank', count: 2 }],
  effect: 'Teleport to configured destination (requires runes to charge)' });

module.exports = { defineRoom, defineFurniture, buildFurniture, roomDefs, furnitureDefs };
