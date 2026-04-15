// ── Construction: house room definitions ─────────────────────────────────────
// Salvaged from ScapeAPI old fork (src/commands/all.js :: HOUSE_ROOMS). POH
// content benefits from being modular — each new room (throne room, portal
// chamber, dungeon) should slot in here instead of expanding the inline table.
//
// Each room has:
//   name, level, planks, nails
//   furniture: { key: { name, level, planks, nails, xp } }
//
// Source: ScapeAPI fork @ /src/commands/all.js :: HOUSE_ROOMS
// -----------------------------------------------------------------------------

'use strict';

const HOUSE_ROOMS = {
  parlour: {
    name: 'Parlour', level: 1, planks: 3, nails: 5,
    furniture: {
      chair:     { name: 'Chair',     level: 1, planks: 2, nails: 2, xp: 58 },
      bookcase:  { name: 'Bookcase',  level: 4, planks: 4, nails: 4, xp: 115 },
      fireplace: { name: 'Fireplace', level: 3, planks: 3, nails: 3, xp: 80 },
    },
  },
  kitchen: {
    name: 'Kitchen', level: 5, planks: 5, nails: 5,
    furniture: {
      table: { name: 'Table', level: 5, planks: 4, nails: 4, xp: 87 },
      stove: { name: 'Stove', level: 7, planks: 5, nails: 5, xp: 120 },
      sink:  { name: 'Sink',  level: 6, planks: 3, nails: 3, xp: 90 },
    },
  },
  bedroom: {
    name: 'Bedroom', level: 10, planks: 6, nails: 6,
    furniture: {
      bed:      { name: 'Bed',      level: 10, planks: 5, nails: 4, xp: 117 },
      wardrobe: { name: 'Wardrobe', level: 12, planks: 6, nails: 5, xp: 150 },
      dresser:  { name: 'Dresser',  level: 11, planks: 4, nails: 3, xp: 121 },
    },
  },
  chapel: {
    name: 'Chapel', level: 20, planks: 8, nails: 8,
    furniture: {
      pew:          { name: 'Pew',          level: 20, planks: 5, nails: 4, xp: 200 },
      small_altar:  { name: 'Small Altar',  level: 25, planks: 8, nails: 6, xp: 350 },
    },
  },
  workshop: {
    name: 'Workshop', level: 15, planks: 7, nails: 7,
    furniture: {
      workbench:    { name: 'Workbench',    level: 15, planks: 5, nails: 5, xp: 143 },
      repair_stand: { name: 'Repair Stand', level: 18, planks: 6, nails: 6, xp: 180 },
      tool_rack:    { name: 'Tool Rack',    level: 16, planks: 4, nails: 4, xp: 120 },
    },
  },
};

function getRoom(id) { return HOUSE_ROOMS[id] || null; }
function list() { return Object.entries(HOUSE_ROOMS).map(([id, r]) => ({ id, ...r })); }

module.exports = { HOUSE_ROOMS, getRoom, list };
