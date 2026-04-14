// ══════════════════════════════════════════════════════════════════════════════
// Runecrafting — Mine essence, craft runes at altars
//
// Design Knobs (P13):
//   Standard RC: 20-35k XP/hr, Active (run to altar and back), free, produces runes
//   This is intentionally slow — runes are valuable, the skill compensates with
//   high GP/hr output rather than high XP/hr
//
// Manifesto P04: Only way to produce runes from scratch (Iron Man critical)
// Manifesto P05: Each rune type stays relevant — no rune replaces another
// Manifesto P11: Inventory constraint is core — 28 essence = 28 runes per trip
// ══════════════════════════════════════════════════════════════════════════════

const { xpToLevel } = require('./gathering');
const items = require('../data/items');

const altarDefs = new Map();

function defineAltar(opts) {
  altarDefs.set(opts.id, {
    id: opts.id,
    name: opts.name,
    runeId: opts.runeId,
    runeName: opts.runeName,
    level: opts.level,
    xp: opts.xp,           // per essence crafted
    multiplierLevels: opts.multiplierLevels || [], // levels where you craft 2x, 3x etc
    region: opts.region,
  });
}

function getAltar(id) { return altarDefs.get(id); }
function listAltars() { return [...altarDefs.values()]; }

function craftRunes(player, altarId) {
  const altar = altarDefs.get(altarId);
  if (!altar) return { error: 'unknown_altar' };

  const level = player.skills?.runecrafting?.level || 1;
  if (level < altar.level) return { error: 'level_too_low', required: altar.level };

  // Count rune essence in inventory
  const essenceId = 15001; // Rune essence
  const pureEssenceId = 15002; // Pure essence (for higher runes)
  let essenceCount = 0;
  const essenceSlots = [];

  for (let i = 0; i < player.inventory.length; i++) {
    const slot = player.inventory[i];
    if (slot && (slot.id === essenceId || slot.id === pureEssenceId)) {
      essenceCount += slot.count || 1;
      essenceSlots.push(i);
    }
  }

  if (essenceCount === 0) return { error: 'no_essence' };

  // Higher level runes need pure essence
  if (altar.level > 20) {
    const pureCount = player.inventory.filter(s => s && s.id === pureEssenceId).reduce((s, item) => s + (item.count || 1), 0);
    if (pureCount === 0) return { error: 'need_pure_essence' };
    essenceCount = pureCount;
  }

  // Calculate multiplier (at certain levels you craft multiple runes per essence)
  let multiplier = 1;
  for (const lvl of altar.multiplierLevels) {
    if (level >= lvl) multiplier++;
  }

  // Remove essence
  for (const slotIdx of essenceSlots) {
    player.inventory[slotIdx] = null;
  }

  // Add runes
  const runeCount = essenceCount * multiplier;
  const freeSlot = player.inventory.findIndex(s => s === null);
  if (freeSlot >= 0) {
    player.inventory[freeSlot] = { id: altar.runeId, name: altar.runeName, count: runeCount, stackable: true };
  }

  // Grant XP
  const totalXp = essenceCount * altar.xp;
  if (!player.skills.runecrafting) player.skills.runecrafting = { level: 1, xp: 0 };
  player.skills.runecrafting.xp += totalXp;
  const newLevel = xpToLevel(player.skills.runecrafting.xp);
  if (newLevel > player.skills.runecrafting.level) player.skills.runecrafting.level = newLevel;

  return {
    success: true,
    rune: altar.runeName,
    essenceUsed: essenceCount,
    runesCrafted: runeCount,
    multiplier,
    xp: totalXp,
    level: player.skills.runecrafting.level,
  };
}

// ── Essence items ──────────────────────────────────────────────────────────

items.define({ id: 15001, name: 'Rune essence', examine: 'Raw magical essence. Used for basic runes.', value: 5, category: 'runecrafting', weight: 0.1 });
items.define({ id: 15002, name: 'Pure essence', examine: 'Purified essence. Required for higher-level runes.', value: 15, category: 'runecrafting', weight: 0.1 });

// ── Altar definitions ──────────────────────────────────────────────────────

defineAltar({ id: 'air_altar', name: 'Air Altar', runeId: 11350, runeName: 'Air rune', level: 1, xp: 5, multiplierLevels: [11, 22, 33, 44, 55, 66, 77, 88, 99], region: 'Heartlands' });
defineAltar({ id: 'mind_altar', name: 'Mind Altar', runeId: 11354, runeName: 'Mind rune', level: 2, xp: 5.5, multiplierLevels: [14, 28, 42, 56, 70, 84, 98], region: 'Heartlands' });
defineAltar({ id: 'water_altar', name: 'Water Altar', runeId: 11351, runeName: 'Water rune', level: 5, xp: 6, multiplierLevels: [19, 38, 57, 76, 95], region: 'Saltbrine' });
defineAltar({ id: 'earth_altar', name: 'Earth Altar', runeId: 11352, runeName: 'Earth rune', level: 9, xp: 6.5, multiplierLevels: [26, 52, 78], region: 'Veilwood' });
defineAltar({ id: 'fire_altar', name: 'Fire Altar', runeId: 11353, runeName: 'Fire rune', level: 14, xp: 7, multiplierLevels: [35, 70], region: 'Sootworks' });
defineAltar({ id: 'body_altar', name: 'Body Altar', runeId: 11355, runeName: 'Body rune', level: 20, xp: 7.5, multiplierLevels: [46, 92], region: 'Heartlands' });
defineAltar({ id: 'cosmic_altar', name: 'Cosmic Altar', runeId: 11361, runeName: 'Cosmic rune', level: 27, xp: 8, multiplierLevels: [59], region: 'Inkweald' });
defineAltar({ id: 'chaos_altar', name: 'Chaos Altar', runeId: 11356, runeName: 'Chaos rune', level: 35, xp: 8.5, multiplierLevels: [74], region: 'Moryskah' });
defineAltar({ id: 'nature_altar', name: 'Nature Altar', runeId: 11359, runeName: 'Nature rune', level: 44, xp: 9, multiplierLevels: [91], region: 'Veilwood' });
defineAltar({ id: 'law_altar', name: 'Law Altar', runeId: 11360, runeName: 'Law rune', level: 54, xp: 9.5, multiplierLevels: [], region: 'Boneyard' });
defineAltar({ id: 'death_altar', name: 'Death Altar', runeId: 11357, runeName: 'Death rune', level: 65, xp: 10, multiplierLevels: [], region: 'Moryskah' });
defineAltar({ id: 'blood_altar', name: 'Blood Altar', runeId: 11358, runeName: 'Blood rune', level: 77, xp: 23.8, multiplierLevels: [], region: 'Moryskah' });
defineAltar({ id: 'soul_altar', name: 'Soul Altar', runeId: 11363, runeName: 'Soul rune', level: 90, xp: 30, multiplierLevels: [], region: 'Inkweald' });
defineAltar({ id: 'wrath_altar', name: 'Wrath Altar', runeId: 11364, runeName: 'Wrath rune', level: 95, xp: 35, multiplierLevels: [], region: 'Glass Desert' });

module.exports = { defineAltar, getAltar, listAltars, craftRunes, altarDefs };
