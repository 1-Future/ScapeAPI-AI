// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Player Housing Room Catalogue
//
// 13 canonical room types per BYOS player-housing.md spec + burn-v2 extensions:
// the classic 12 plus the trophy_room (grandmaster achievement unlock).
//
// Each room:
//   - defines a set of hotspots (3-6 placement slots for furniture)
//   - defines its intrinsic functionality (teleport, altar, cooking, etc.)
//   - defines the Construction level required to build the room itself
//   - defines the flat build XP awarded on placement
//   - may define unlock conditions beyond level (total_level_500, grandmaster
//     quest complete, etc.). These are enforced in src/engine/housing.js.
//
// Rooms are placed on a grid. A house grid is 6x6 max (36 slots). Construction
// caps rooms to 3 at level 10 (first house unlock) and scales to 32 at level 99.
// See src/engine/housing.js ROOM_CAP_FOR_LEVEL for the schedule.
//
// Level gating per BYOS construction-system.md (burn v2):
//   parlour 1, kitchen 5, workshop 10, dining_room 15, bedroom 20,
//   garden 25, chapel 25, menagerie 37, study 40, costume_room 42,
//   portal_chamber 50, throne_room 60, trophy_room 70.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

// ── Room definitions ────────────────────────────────────────────────────────
//
// hotspots: each room has 3-6 hotspots. Each hotspot name is referenced by the
// furniture catalogue (housing-furniture.js) to constrain where furniture may
// be placed.
//
// functionality: what activating the room does for the player.
//
// buildLevel: minimum Construction level to place this room type.
// buildXp: flat XP awarded when the room is placed.
//
// unlockConditions (burn-v2): additional non-level gates:
//   - 'total_level_500':  requires total level >= 500 across all skills
//   - 'grandmaster_quest': requires at least one Grandmaster-difficulty quest
//                          to be completed

const ROOMS = Object.freeze({
  parlour: {
    id: 'parlour',
    name: 'Parlour',
    description: 'Entry room with a telepad for friends to visit.',
    hotspots: ['chair_1', 'chair_2', 'rug', 'curtains', 'fireplace', 'telepad'],
    functionality: 'telepad',
    buildLevel: 1,
    buildXp: 100,
    tier: 1,
    unlockConditions: [],
  },
  kitchen: {
    id: 'kitchen',
    name: 'Kitchen',
    description: 'Cooking range, sink, shelves. Unlocks premium cooking methods.',
    hotspots: ['range', 'sink', 'shelves', 'larder', 'table'],
    functionality: 'cooking',
    buildLevel: 5,
    buildXp: 120,
    tier: 1,
    unlockConditions: [],
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
    unlockConditions: [],
  },
  dining_room: {
    id: 'dining_room',
    name: 'Dining Room',
    description: 'Host feasts for clan members. Shared food buffs. Has a pantry.',
    hotspots: ['table', 'chair_1', 'chair_2', 'chair_3', 'bell_pull', 'wall_art'],
    functionality: 'feast',
    buildLevel: 15,
    buildXp: 200,
    tier: 2,
    unlockConditions: [],
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
    unlockConditions: [],
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
    unlockConditions: [],
  },
  chapel: {
    id: 'chapel',
    name: 'Chapel',
    description: 'Altar for prayer XP. Bones used grant bonus XP.',
    hotspots: ['altar', 'icon', 'torch_1', 'torch_2', 'musical'],
    functionality: 'altar',
    buildLevel: 25,
    buildXp: 200,
    tier: 2,
    unlockConditions: [],
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
    unlockConditions: [],
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
    unlockConditions: [],
  },
  costume_room: {
    id: 'costume_room',
    name: 'Costume Room',
    description: 'Store cosmetic gear with no inventory cost. Unlocked at 500 total level.',
    hotspots: ['costume_box', 'mirror', 'mannequin', 'wardrobe', 'chest'],
    functionality: 'costume_storage',
    buildLevel: 42,
    buildXp: 250,
    tier: 3,
    // burn-v2: costume_room is a prestige room. Total level >= 500 required
    // in addition to Construction 42.
    unlockConditions: ['total_level_500'],
  },
  portal_chamber: {
    id: 'portal_chamber',
    name: 'Portal Chamber',
    description: 'Teleports to any region. Attune portals at higher levels.',
    hotspots: ['portal_1', 'portal_2', 'portal_3'],
    functionality: 'portal',
    buildLevel: 50,
    buildXp: 250,
    tier: 3,
    unlockConditions: [],
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
    unlockConditions: [],
  },
  trophy_room: {
    id: 'trophy_room',
    name: 'Trophy Room',
    description: 'Display grandmaster-quest trophies and boss heads. Unlocked by completing your first Grandmaster quest.',
    hotspots: ['quest_plinth', 'boss_head', 'banner', 'relic_case', 'display_case'],
    functionality: 'achievement_display',
    buildLevel: 70,
    buildXp: 600,
    tier: 4,
    // burn-v2: trophy_room is gated on completing any Grandmaster quest.
    unlockConditions: ['grandmaster_quest'],
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

function unlockConditionsFor(roomId) {
  const r = ROOMS[roomId];
  return r && Array.isArray(r.unlockConditions) ? r.unlockConditions.slice() : [];
}

module.exports = {
  ROOMS,
  listRoomIds,
  getRoom,
  roomExists,
  hotspotsFor,
  buildLevelFor,
  buildXpFor,
  unlockConditionsFor,
};
