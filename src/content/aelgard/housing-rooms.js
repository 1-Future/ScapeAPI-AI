// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Player Housing Room Catalogue
//
// 12 canonical room types per BYOS player-housing.md spec. Each room:
//   - defines a set of hotspots (3-6 placement slots for furniture)
//   - defines its intrinsic functionality (teleport, altar, cooking, etc.)
//   - defines the Construction level required to build the room itself
//   - defines the flat build XP awarded on placement
//
// Rooms are placed on a grid. A house grid is 6x6 max (36 slots). Construction
// caps rooms to 3 at level 10 (first house unlock) and scales to 32 at level 99.
// See src/engine/housing.js ROOM_CAP_FOR_LEVEL for the schedule.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

// ── Room definitions ────────────────────────────────────────────────────────
//
// hotspots: each room has 3-6 hotspots. Each hotspot name is referenced by the
// furniture catalogue (housing-furniture.js) to constrain where furniture may
// be placed.
//
// functionality: what activating the room does for the player. For example,
// entering a Parlour gives a telepad, a Bedroom lets you sleep for rest XP, a
// Chapel exposes an altar, a Portal Chamber teleports, etc.
//
// buildLevel: minimum Construction level to place this room type.
// buildXp: flat XP awarded when the room is placed (construction-system tier).

const ROOMS = Object.freeze({
  parlour: {
    id: 'parlour',
    name: 'Parlour',
    description: 'Entry room with a telepad for friends to visit.',
    hotspots: ['chair_1', 'chair_2', 'rug', 'curtains', 'fireplace', 'telepad'],
    functionality: 'telepad',
    buildLevel: 10,
    buildXp: 100,
    tier: 1,
  },
  kitchen: {
    id: 'kitchen',
    name: 'Kitchen',
    description: 'Cooking range, sink, shelves. Unlocks premium cooking methods.',
    hotspots: ['range', 'sink', 'shelves', 'larder', 'table'],
    functionality: 'cooking',
    buildLevel: 10,
    buildXp: 120,
    tier: 1,
  },
  bedroom: {
    id: 'bedroom',
    name: 'Bedroom',
    description: 'Sleep for a 25% XP boost for 10 minutes. Daily limit.',
    hotspots: ['bed', 'wardrobe', 'dresser', 'clock', 'rug'],
    functionality: 'sleep',
    buildLevel: 20,
    buildXp: 150,
    tier: 2,
  },
  chapel: {
    id: 'chapel',
    name: 'Chapel',
    description: 'Altar for prayer XP. Bones used grant bonus XP.',
    hotspots: ['altar', 'icon', 'torch_1', 'torch_2', 'musical'],
    functionality: 'altar',
    buildLevel: 30,
    buildXp: 200,
    tier: 2,
  },
  portal_chamber: {
    id: 'portal_chamber',
    name: 'Portal Chamber',
    description: 'Teleports to any region. Attune portals at higher levels.',
    hotspots: ['portal_1', 'portal_2', 'portal_3'],
    functionality: 'portal',
    buildLevel: 40,
    buildXp: 250,
    tier: 3,
  },
  workshop: {
    id: 'workshop',
    name: 'Workshop',
    description: 'Repair degradable items, fletch arrows, craft flatpacks.',
    hotspots: ['workbench', 'repair_stand', 'tool_rack', 'whetstone'],
    functionality: 'workshop',
    buildLevel: 10,
    buildXp: 150,
    tier: 1,
  },
  dining_room: {
    id: 'dining_room',
    name: 'Dining Room',
    description: 'Host feasts for clan members. Shared food buffs.',
    hotspots: ['table', 'chair_1', 'chair_2', 'chair_3', 'bell_pull', 'wall_art'],
    functionality: 'feast',
    buildLevel: 30,
    buildXp: 200,
    tier: 2,
  },
  throne_room: {
    id: 'throne_room',
    name: 'Throne Room',
    description: 'Cosmetic throne plus guards. Prestige display.',
    hotspots: ['throne', 'guard_1', 'guard_2', 'lever', 'trapdoor', 'banner'],
    functionality: 'cosmetic',
    buildLevel: 60,
    buildXp: 500,
    tier: 4,
  },
  garden: {
    id: 'garden',
    name: 'Garden',
    description: 'Farming patches + exclusive herb patches (house-only).',
    hotspots: ['tree_patch', 'flower_patch', 'herb_patch', 'pond', 'statue'],
    functionality: 'farming',
    buildLevel: 25,
    buildXp: 180,
    tier: 2,
  },
  study: {
    id: 'study',
    name: 'Study',
    description: 'Spell training + enchantment at higher tiers.',
    hotspots: ['bookshelf', 'lectern', 'globe', 'telescope', 'writing_desk'],
    functionality: 'magic',
    buildLevel: 40,
    buildXp: 230,
    tier: 3,
  },
  menagerie: {
    id: 'menagerie',
    name: 'Menagerie',
    description: 'Pet storage. Store up to 50 pets without inventory cost.',
    hotspots: ['pet_house', 'pedestal_1', 'pedestal_2', 'feeding_bowl', 'toy'],
    functionality: 'pet_storage',
    buildLevel: 37,
    buildXp: 210,
    tier: 2,
  },
  costume_room: {
    id: 'costume_room',
    name: 'Costume Room',
    description: 'Store cosmetic gear with no inventory cost.',
    hotspots: ['costume_box', 'mirror', 'mannequin', 'wardrobe', 'chest'],
    functionality: 'costume_storage',
    buildLevel: 42,
    buildXp: 250,
    tier: 3,
  },
});

function listRoomIds() {
  return Object.keys(ROOMS);
}

function getRoom(id) {
  return ROOMS[id] || null;
}

function roomExists(id) {
  return Object.prototype.hasOwnProperty.call(ROOMS, id);
}

function hotspotsFor(roomId) {
  const r = ROOMS[roomId];
  return r ? r.hotspots.slice() : [];
}

function buildLevelFor(roomId) {
  const r = ROOMS[roomId];
  return r ? r.buildLevel : null;
}

function buildXpFor(roomId) {
  const r = ROOMS[roomId];
  return r ? r.buildXp : 0;
}

module.exports = {
  ROOMS,
  listRoomIds,
  getRoom,
  roomExists,
  hotspotsFor,
  buildLevelFor,
  buildXpFor,
};
