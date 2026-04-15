// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Player Housing Furniture Catalogue
//
// Each room hotspot has 5+ tier options (regular → mahogany → teak → magic →
// gilded → demonic → crystal). Tier determines Construction level required
// and XP awarded.
//
// Tier ordering (spec):
//   1 regular    lvl  1   base XP
//   2 mahogany   lvl 20   1.5x XP
//   3 teak       lvl 40   2.0x XP
//   4 magic      lvl 60   3.0x XP
//   5 gilded     lvl 80   4.0x XP
//   6 demonic    lvl 90   5.0x XP  (unlocked at 99 for crystal-tier access)
//   7 crystal    lvl 99   6.0x XP  (max construction unlocks crystal)
//
// Furniture IDs follow `<hotspot>_<tier>` convention so callers can compute
// them from upgrade paths without lookup tables.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const rooms = require('./housing-rooms');

const TIERS = Object.freeze([
  { id: 1, name: 'regular',  level: 1,  xpMult: 1.0, baseXp: 40 },
  { id: 2, name: 'mahogany', level: 20, xpMult: 1.5, baseXp: 80 },
  { id: 3, name: 'teak',     level: 40, xpMult: 2.0, baseXp: 140 },
  { id: 4, name: 'magic',    level: 60, xpMult: 3.0, baseXp: 240 },
  { id: 5, name: 'gilded',   level: 80, xpMult: 4.0, baseXp: 380 },
  { id: 6, name: 'demonic',  level: 90, xpMult: 5.0, baseXp: 560 },
  { id: 7, name: 'crystal',  level: 99, xpMult: 6.0, baseXp: 780 },
]);

const TIER_BY_NAME = Object.freeze(TIERS.reduce((o, t) => (o[t.name] = t, o), {}));
const TIER_BY_ID   = Object.freeze(TIERS.reduce((o, t) => (o[t.id]   = t, o), {}));

// ── Furniture catalogue ─────────────────────────────────────────────────────
// Built programmatically: for each room + each hotspot, generate seven tier
// options. Saves manual typing and guarantees tier coverage per the spec.

function buildCatalogue() {
  const out = {};
  for (const [roomId, room] of Object.entries(rooms.ROOMS)) {
    for (const hotspot of room.hotspots) {
      for (const tier of TIERS) {
        const id = `${roomId}_${hotspot}_t${tier.id}`;
        out[id] = {
          id,
          room: roomId,
          hotspot,
          name: prettyName(roomId, hotspot, tier),
          tier: tier.id,
          tierName: tier.name,
          level: tier.level,
          xp: tier.baseXp,
          functionality: functionalityFor(roomId, hotspot),
          flatpackable: hotspotFlatpackable(hotspot),
        };
      }
    }
  }
  return out;
}

function prettyName(roomId, hotspot, tier) {
  const rName = roomId.replace(/_/g, ' ');
  const hName = hotspot.replace(/_/g, ' ');
  return `${capitalize(tier.name)} ${hName} (${rName})`;
}

function capitalize(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

// Per-hotspot intrinsic function. Decorative unless marked otherwise.
const FUNCTIONAL_HOTSPOTS = Object.freeze({
  telepad: 'teleport',
  portal_1: 'teleport',
  portal_2: 'teleport',
  portal_3: 'teleport',
  altar: 'altar',
  range: 'cooking_range',
  workbench: 'crafting_bench',
  repair_stand: 'repair_stand',
  bed: 'sleep',
  throne: 'display',
  lectern: 'magic_training',
  herb_patch: 'farming',
  tree_patch: 'farming',
  flower_patch: 'farming',
  pet_house: 'pet_storage',
  costume_box: 'costume_storage',
  mannequin: 'display',
});

function functionalityFor(roomId, hotspot) {
  return FUNCTIONAL_HOTSPOTS[hotspot] || 'decorative';
}

function hotspotFlatpackable(hotspot) {
  // Storage/teleport/altar hotspots are not flatpackable (must be built on-site).
  const NON_FLATPACK = new Set([
    'altar', 'portal_1', 'portal_2', 'portal_3', 'telepad',
    'pet_house', 'costume_box', 'herb_patch', 'tree_patch', 'flower_patch',
  ]);
  return !NON_FLATPACK.has(hotspot);
}

const FURNITURE = Object.freeze(buildCatalogue());

// ── Public API ──────────────────────────────────────────────────────────────

function listFurnitureIds() {
  return Object.keys(FURNITURE);
}

function getFurniture(id) {
  return FURNITURE[id] || null;
}

function furnitureExists(id) {
  return Object.prototype.hasOwnProperty.call(FURNITURE, id);
}

function furnitureForHotspot(roomId, hotspot) {
  return Object.values(FURNITURE).filter(f => f.room === roomId && f.hotspot === hotspot);
}

function tiers() {
  return TIERS.slice();
}

function tierByName(n) {
  return TIER_BY_NAME[n] || null;
}

function tierById(id) {
  return TIER_BY_ID[id] || null;
}

function totalFurnitureCount() {
  return Object.keys(FURNITURE).length;
}

module.exports = {
  FURNITURE,
  TIERS,
  listFurnitureIds,
  getFurniture,
  furnitureExists,
  furnitureForHotspot,
  tiers,
  tierByName,
  tierById,
  totalFurnitureCount,
};
