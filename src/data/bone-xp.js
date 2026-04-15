// ── Prayer bone XP table ──────────────────────────────────────────────────────
// Salvaged from ScapeAPI old fork (src/commands/all.js :: BONE_XP). Lifted to
// a standalone module so bones can be referenced outside the monolithic
// commands file (e.g. drop tables, achievements, quest rewards, prayer-altar
// scripts).
//
// Values are OSRS-accurate — bury XP per bone variant. When we add more bone
// types (wyvern, dagannoth, frost dragon, etc.) they land here, not in all.js.
//
// Source: ScapeAPI fork @ /src/commands/all.js :: BONE_XP
// -----------------------------------------------------------------------------

'use strict';

const BONE_XP = {
  100: 4.5,  // Bones
  106: 15,   // Big bones
  107: 72,   // Dragon bones
};

// Default bury XP when a bone item isn't in the table — matches the old
// fallback that used 4.5 for any bone variant whose id wasn't yet registered.
const DEFAULT_BONE_XP = 4.5;

function getXp(itemId) {
  return Object.prototype.hasOwnProperty.call(BONE_XP, itemId) ? BONE_XP[itemId] : DEFAULT_BONE_XP;
}

module.exports = { BONE_XP, DEFAULT_BONE_XP, getXp };
