// ══════════════════════════════════════════════════════════════════════════════
// Player Housing / Construction Runtime
//
// Implements the full BYOS player-housing.md spec plus the burn-v2 cross-link:
//   - House unlock gated by Construction 10
//   - Each house is instanced (its own sub-layer with its own walls/grid)
//   - 12 canonical room types + burn-v2 trophy_room (13 total)
//   - Each room has 3-6 furniture hotspots
//   - Each hotspot has 7 tier options: regular -> mahogany -> teak -> magic
//     -> gilded -> demonic -> crystal
//   - Construction XP awarded per place/upgrade/repair, per the tier table
//   - Tier multipliers: demonic = 5x XP, crystal = 8x XP
//   - Room cap scales with Construction level (3 at lvl 10, 32 at lvl 99)
//   - Persistence via data/houses.json through persistence.onSave
//
// Construction XP flow (burn v2):
//   1. Build room       -> flat room.buildXp
//   2. Add furniture    -> furniture.xp (tier-multiplied)
//   3. Upgrade furniture-> full new-tier XP (tier-multiplied)
//   4. Repair furniture -> 50% of highest-tier XP in room (min 25)
//   5. Remove/destroy   -> zero XP
//   6. External XP sources (training-runner, recipe-runner, etc.) call
//      notifyConstructionXp(p, amount) which ticks housing progress and
//      fires room_unlocked notifications when crossings happen.
//
// Supply chain (burn v2):
//   Every buildRoom requires N planks and M nails from the inventory. Higher
//   build-level rooms require higher-tier planks. plankCostForRoom(roomDef)
//   gives the matrix. Tests may opt out with { _bypassMaterials: true }.
//
// Feast (burn v2):
//   One feast per 24 real hours per house. Consumes high-tier food from the
//   dining-room pantry. Applies a +25% XP buff to host + clan-member
//   attendees for 30 minutes. Guests outside the host's clan are NOT buffed.
//
// Trophy / Costume rooms (burn v2):
//   - trophy_room is unlocked by completing the first Grandmaster quest
//   - costume_room requires Construction 42 AND total level >= 500
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const path = require('path');
const fs = require('fs');

let events = null;
try { events = require('./events'); } catch (_) { events = null; }

let player = null;
function _player() {
  if (!player) {
    try { player = require('../player/player'); } catch (_) { player = null; }
  }
  return player;
}

const rooms = require('../content/aelgard/housing-rooms');
const furniture = require('../content/aelgard/housing-furniture');

// ── Constants ───────────────────────────────────────────────────────────────
const UNLOCK_LEVEL = 10;
const HOUSE_LAYER_BASE = 1000;
const GRID_SIZE = 6; // 6x6 = 36 possible slots
const MAX_SLOTS = GRID_SIZE * GRID_SIZE;
const SLEEP_COOLDOWN_TICKS = 60 * 60 * 24; // one in-game day
const SLEEP_BOOST_DURATION_TICKS = 60 * 10; // 10 minutes at ~1s/tick

// Feast constants (burn v2)
const FEAST_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 real hours
const FEAST_DURATION_MS = 30 * 60 * 1000;       // 30 minutes buff
const FEAST_XP_MULTIPLIER = 1.25;                // +25% XP
const FEAST_FOOD_REQUIRED = 10;                  // high-tier food count
const FEAST_HIGH_TIER_FOOD_IDS = [237, 236, 235]; // Shark, Swordfish, Lobster

// Burn-v2 tier XP multipliers. Spec: demonic = 5x, crystal = 8x base.
const XP_TIER_MULTIPLIER_OVERRIDES = Object.freeze({
  demonic: 5,
  crystal: 8,
});

// Costume room unlock threshold.
const COSTUME_ROOM_TOTAL_LEVEL = 500;

const HOUSES_FILE = 'houses.json';

// ── In-memory storage ───────────────────────────────────────────────────────
// Map<playerId, houseObject>
const HOUSES = new Map();

// Listeners registered via onConstructionXpGained — external systems can
// subscribe to learn about XP crossings.
const XP_LISTENERS = new Set();

// ── Room cap schedule ───────────────────────────────────────────────────────
function roomCapForLevel(lvl) {
  if (lvl < UNLOCK_LEVEL) return 0;
  if (lvl >= 99) return 32;
  const extra = Math.floor(((lvl - UNLOCK_LEVEL) / (99 - UNLOCK_LEVEL)) * (32 - 3));
  return 3 + extra;
}

// ── Supply-chain plank cost per room ─────────────────────────────────────────
// Roughly: higher build-level rooms need more (and higher-tier) planks. The
// parlour (level 1) gets a free build so the tutorial flow stays simple.
function plankCostForRoom(roomDef) {
  if (!roomDef) return { planks: 0, nails: 0, plankTier: 'plank' };
  const lvl = roomDef.buildLevel || 1;
  if (lvl <= 1)  return { planks: 0,  nails: 0,  plankTier: 'plank' };
  if (lvl <= 10) return { planks: 6,  nails: 6,  plankTier: 'plank' };
  if (lvl <= 20) return { planks: 12, nails: 12, plankTier: 'plank' };
  if (lvl <= 30) return { planks: 20, nails: 20, plankTier: 'oak_plank' };
  if (lvl <= 40) return { planks: 30, nails: 30, plankTier: 'oak_plank' };
  if (lvl <= 50) return { planks: 40, nails: 40, plankTier: 'teak_plank' };
  if (lvl <= 60) return { planks: 50, nails: 50, plankTier: 'teak_plank' };
  return { planks: 60, nails: 60, plankTier: 'mahogany_plank' };
}

// Plank item IDs (canonical from src/data/items.js: 700-703).
const PLANK_IDS = Object.freeze({
  plank:          [700],
  oak_plank:      [701],
  teak_plank:     [702],
  mahogany_plank: [703],
});
const NAIL_IDS = Object.freeze([705, 704]); // steel nails first, then generic

function consumePlanksForRoom(p, roomDef) {
  const cost = plankCostForRoom(roomDef);
  if (cost.planks <= 0) return { ok: true, consumed: { planks: 0, nails: 0 } };
  if (!p || !Array.isArray(p.inventory)) {
    return { ok: false, reason: 'cannot access inventory' };
  }
  const plankIds = PLANK_IDS[cost.plankTier] || PLANK_IDS.plank;
  const plankHave = countItems(p, plankIds);
  if (plankHave < cost.planks) {
    return { ok: false, reason: `requires ${cost.planks} ${cost.plankTier.replace('_', ' ')}(s) (have ${plankHave})` };
  }
  const nailHave = countItems(p, NAIL_IDS);
  if (nailHave < cost.nails) {
    return { ok: false, reason: `requires ${cost.nails} nail(s) (have ${nailHave})` };
  }
  // Consume.
  removeItems(p, plankIds, cost.planks);
  removeItems(p, NAIL_IDS, cost.nails);
  return { ok: true, consumed: { planks: cost.planks, nails: cost.nails, plankTier: cost.plankTier } };
}

function countItems(p, ids) {
  let total = 0;
  for (const slot of p.inventory) {
    if (!slot) continue;
    if (ids.includes(slot.id)) total += (slot.count || 1);
  }
  return total;
}

function removeItems(p, ids, count) {
  let remaining = count;
  for (let i = 0; i < p.inventory.length && remaining > 0; i++) {
    const slot = p.inventory[i];
    if (!slot || !ids.includes(slot.id)) continue;
    const have = slot.count || 1;
    if (have <= remaining) {
      remaining -= have;
      p.inventory[i] = null;
    } else {
      slot.count = have - remaining;
      remaining = 0;
    }
  }
  return count - remaining;
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function constructionLevel(p) {
  return (p && p.skills && p.skills.construction && p.skills.construction.level) || 1;
}

function totalLevelOf(p) {
  const mod = _player();
  if (mod && typeof mod.totalLevel === 'function') return mod.totalLevel(p);
  // Fallback manual sum.
  if (!p || !p.skills) return 0;
  let t = 0;
  for (const s of Object.values(p.skills)) t += (s.level || 0);
  return t;
}

function hasGrandmasterQuestCompleted(p) {
  if (!p || !p.questProgress) return false;
  let quests = null;
  try { quests = require('../data/quests'); } catch (_) { quests = null; }
  for (const [qId, status] of Object.entries(p.questProgress)) {
    if (!status || !status.complete) continue;
    if (quests && typeof quests.getQuest === 'function') {
      const q = quests.getQuest(qId);
      if (q && typeof q.difficulty === 'string' && q.difficulty.toLowerCase() === 'grandmaster') {
        return true;
      }
    }
    // Fallback: quest IDs containing "grandmaster" always count.
    if (/grandmaster/i.test(qId)) return true;
  }
  return false;
}

function checkRoomUnlockConditions(p, roomDef) {
  const conds = roomDef && Array.isArray(roomDef.unlockConditions)
    ? roomDef.unlockConditions
    : [];
  for (const c of conds) {
    if (c === 'total_level_500') {
      const tl = totalLevelOf(p);
      if (tl < COSTUME_ROOM_TOTAL_LEVEL) {
        return { ok: false, reason: `requires total level ${COSTUME_ROOM_TOTAL_LEVEL} (you have ${tl})` };
      }
    } else if (c === 'grandmaster_quest') {
      if (!hasGrandmasterQuestCompleted(p)) {
        return { ok: false, reason: 'requires completing a Grandmaster quest' };
      }
    }
  }
  return { ok: true };
}

function layerForHouse(ownerId) {
  return HOUSE_LAYER_BASE + Number(ownerId);
}

function gridIndex(x, y) {
  return y * GRID_SIZE + x;
}

function parseSlot(slot) {
  if (slot == null) return null;
  if (typeof slot === 'object' && slot.x != null && slot.y != null) {
    const x = Number(slot.x), y = Number(slot.y);
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return null;
    return { x, y, idx: gridIndex(x, y) };
  }
  const idx = Number(slot);
  if (Number.isNaN(idx) || idx < 0 || idx >= MAX_SLOTS) return null;
  return { x: idx % GRID_SIZE, y: Math.floor(idx / GRID_SIZE), idx };
}

// ── Tier XP multiplier ─────────────────────────────────────────────────────
// Applied on top of furniture.xp for per-action grants. Default is 1x for
// standard tiers; demonic and crystal get the burn-v2 override multipliers.
function tierXpMultiplier(tierName) {
  if (!tierName) return 1;
  return XP_TIER_MULTIPLIER_OVERRIDES[tierName] || 1;
}

// ── House lifecycle ─────────────────────────────────────────────────────────

function createHouse(p) {
  if (!p) return { ok: false, reason: 'player required' };
  const lvl = constructionLevel(p);
  if (lvl < UNLOCK_LEVEL) {
    return { ok: false, reason: `Construction ${UNLOCK_LEVEL} required to own a house.` };
  }
  if (HOUSES.has(p.id)) {
    return { ok: false, reason: 'house already exists', house: HOUSES.get(p.id) };
  }
  const house = {
    ownerId: p.id,
    ownerName: p.name,
    layer: layerForHouse(p.id),
    createdAt: Date.now(),
    lastModified: Date.now(),
    theme: 'medieval',
    visitorPermission: 'friends',
    rooms: [],
    portalDestinations: {},
    sleepCooldownUntil: 0,
    guestBook: [],
    ratings: [],
    totalBuildXp: 0,
    // burn-v2: housing progress mirrors cumulative Construction XP (not just
    // build-XP) so non-housing training methods visibly progress the house.
    progressXp: (p.skills && p.skills.construction && p.skills.construction.xp) || 0,
    unlockedRoomTypes: computeUnlockedRooms(p),
    lastFeastAt: 0,
    feastCooldownUntil: 0,
    pantry: {
      // Per-house food pantry. Feasts consume from here, dining room
      // stockPantry() fills it. Keyed by item id: { [itemId]: count }
    },
  };
  HOUSES.set(p.id, house);
  if (!Array.isArray(p.house)) p.house = [];
  syncPlayerHouseArray(p, house);
  if (events && events.emit) {
    events.emit('house_created', { playerId: p.id, house });
  }
  return { ok: true, house };
}

function getHouse(p) {
  if (!p) return null;
  return HOUSES.get(p.id) || null;
}

function hasHouse(p) {
  return !!(p && HOUSES.has(p.id));
}

function destroyHouse(p) {
  if (!p || !HOUSES.has(p.id)) return { ok: false, reason: 'no house' };
  HOUSES.delete(p.id);
  if (Array.isArray(p.house)) p.house = [];
  return { ok: true };
}

// ── Entering / leaving (instanced) ──────────────────────────────────────────

function enterHouse(p, target) {
  if (!p) return { ok: false, reason: 'player required' };
  let ownerId = p.id;
  if (target != null) {
    if (typeof target === 'object' && target.id != null) ownerId = target.id;
    else ownerId = target;
  }
  const house = HOUSES.get(ownerId);
  if (!house) return { ok: false, reason: 'no such house' };
  if (ownerId !== p.id && house.visitorPermission === 'locked') {
    return { ok: false, reason: 'house is locked to visitors' };
  }
  p.houseLocation = { x: p.x, y: p.y, layer: p.layer || 0 };
  p.x = 0;
  p.y = 0;
  p.layer = house.layer;
  p.inHouse = ownerId;
  if (events && events.emit) {
    events.emit('house_entered', { playerId: p.id, ownerId, layer: house.layer });
  }
  return { ok: true, house, layer: house.layer };
}

function leaveHouse(p) {
  if (!p) return { ok: false, reason: 'player required' };
  if (!p.inHouse) return { ok: false, reason: 'not inside a house' };
  if (p.houseLocation) {
    p.x = p.houseLocation.x;
    p.y = p.houseLocation.y;
    p.layer = p.houseLocation.layer;
  }
  const ownerId = p.inHouse;
  p.inHouse = null;
  p.houseLocation = null;
  if (events && events.emit) {
    events.emit('house_left', { playerId: p.id, ownerId });
  }
  return { ok: true };
}

// ── Rooms ───────────────────────────────────────────────────────────────────

function buildRoom(p, roomType, position, opts) {
  if (!p) return { ok: false, reason: 'player required' };
  const house = HOUSES.get(p.id);
  if (!house) return { ok: false, reason: 'no house — create one first' };
  if (!rooms.roomExists(roomType)) {
    return { ok: false, reason: `unknown room type: ${roomType}` };
  }
  const lvl = constructionLevel(p);
  const roomDef = rooms.getRoom(roomType);
  if (lvl < roomDef.buildLevel) {
    return { ok: false, reason: `Construction ${roomDef.buildLevel} required for ${roomType}.` };
  }
  // burn-v2: extra unlock gates (costume_room -> total 500, trophy_room -> grandmaster).
  const cond = checkRoomUnlockConditions(p, roomDef);
  if (!cond.ok) return cond;

  const slot = parseSlot(position);
  if (!slot) return { ok: false, reason: 'invalid position (must be 0..35 or {x,y})' };
  const existing = house.rooms.find(r => r.slot.idx === slot.idx);
  if (existing) return { ok: false, reason: `slot ${slot.idx} already has a room (${existing.roomId})` };
  const cap = roomCapForLevel(lvl);
  if (house.rooms.length >= cap) {
    return { ok: false, reason: `room cap reached (${house.rooms.length}/${cap}) for Construction ${lvl}` };
  }

  // Plank/nail supply chain. Tests may bypass with _bypassMaterials.
  let consumed = { planks: 0, nails: 0 };
  if (!opts || !opts._bypassMaterials) {
    const supply = consumePlanksForRoom(p, roomDef);
    if (!supply.ok) return supply;
    consumed = supply.consumed;
  }

  const room = {
    slot,
    roomId: roomType,
    furniture: {},
    builtAt: Date.now(),
    // burn-v2: per-room damage/repair tracking.
    condition: 100,
  };
  house.rooms.push(room);
  house.lastModified = Date.now();
  const xp = roomDef.buildXp;
  house.totalBuildXp += xp;
  awardConstructionXp(p, xp, { source: 'build_room', roomType });
  syncPlayerHouseArray(p, house);
  if (events && events.emit) {
    events.emit('house_room_built', { playerId: p.id, roomType, slot, xp, consumed });
  }
  return { ok: true, room, xp, consumed };
}

function destroyRoom(p, slot) {
  if (!p) return { ok: false, reason: 'player required' };
  const house = HOUSES.get(p.id);
  if (!house) return { ok: false, reason: 'no house' };
  const s = parseSlot(slot);
  if (!s) return { ok: false, reason: 'invalid slot' };
  const idx = house.rooms.findIndex(r => r.slot.idx === s.idx);
  if (idx < 0) return { ok: false, reason: 'no room at that slot' };
  const [removed] = house.rooms.splice(idx, 1);
  house.lastModified = Date.now();
  syncPlayerHouseArray(p, house);
  if (events && events.emit) {
    events.emit('house_room_destroyed', { playerId: p.id, roomType: removed.roomId, slot: s });
  }
  return { ok: true, removed };
}

function listRooms(p) {
  const house = HOUSES.get(p && p.id);
  if (!house) return [];
  return house.rooms.slice();
}

// ── Furniture ───────────────────────────────────────────────────────────────

function addFurniture(p, roomSlot, furnitureId) {
  if (!p) return { ok: false, reason: 'player required' };
  const house = HOUSES.get(p.id);
  if (!house) return { ok: false, reason: 'no house' };
  const s = parseSlot(roomSlot);
  if (!s) return { ok: false, reason: 'invalid slot' };
  const room = house.rooms.find(r => r.slot.idx === s.idx);
  if (!room) return { ok: false, reason: 'no room at that slot' };
  const f = furniture.getFurniture(furnitureId);
  if (!f) return { ok: false, reason: `unknown furniture: ${furnitureId}` };
  if (f.room !== room.roomId) {
    return { ok: false, reason: `furniture ${furnitureId} is for ${f.room}, not ${room.roomId}` };
  }
  const roomDef = rooms.getRoom(room.roomId);
  if (!roomDef.hotspots.includes(f.hotspot)) {
    return { ok: false, reason: `hotspot ${f.hotspot} does not exist on ${room.roomId}` };
  }
  const lvl = constructionLevel(p);
  if (lvl < f.level) {
    return { ok: false, reason: `Construction ${f.level} required for ${f.tierName} tier.` };
  }
  // Idempotency: re-placing identical tier is allowed but zero XP.
  const already = room.furniture[f.hotspot] === f.id;
  room.furniture[f.hotspot] = f.id;
  house.lastModified = Date.now();
  // burn-v2: tier-multiplier for demonic/crystal. Also awarded per-action.
  const effectiveXp = already ? 0 : Math.floor(f.xp * tierXpMultiplier(f.tierName));
  house.totalBuildXp += effectiveXp;
  if (effectiveXp > 0) {
    awardConstructionXp(p, effectiveXp, { source: 'add_furniture', furnitureId: f.id, tier: f.tierName });
  }
  syncPlayerHouseArray(p, house);
  if (events && events.emit) {
    events.emit('house_furniture_added', { playerId: p.id, roomId: room.roomId, furnitureId: f.id, xp: effectiveXp, tier: f.tierName });
  }
  return { ok: true, furniture: f, xp: effectiveXp };
}

function removeFurniture(p, roomSlot, furnitureId) {
  if (!p) return { ok: false, reason: 'player required' };
  const house = HOUSES.get(p.id);
  if (!house) return { ok: false, reason: 'no house' };
  const s = parseSlot(roomSlot);
  if (!s) return { ok: false, reason: 'invalid slot' };
  const room = house.rooms.find(r => r.slot.idx === s.idx);
  if (!room) return { ok: false, reason: 'no room at that slot' };
  const f = furniture.getFurniture(furnitureId);
  if (!f) return { ok: false, reason: `unknown furniture: ${furnitureId}` };
  if (room.furniture[f.hotspot] !== f.id) {
    return { ok: false, reason: `furniture ${furnitureId} not placed on ${f.hotspot}` };
  }
  delete room.furniture[f.hotspot];
  house.lastModified = Date.now();
  syncPlayerHouseArray(p, house);
  if (events && events.emit) {
    events.emit('house_furniture_removed', { playerId: p.id, roomId: room.roomId, furnitureId: f.id });
  }
  return { ok: true, removed: f };
}

// ── Upgrade + repair (burn-v2) ──────────────────────────────────────────────
//
// Upgrade: swap an existing hotspot's furniture for a higher-tier option on
// the same (room, hotspot). Grants the full new-tier XP (tier-multiplied).
// Fails if the new tier is equal or lower.

function upgradeFurniture(p, roomSlot, newFurnitureId) {
  if (!p) return { ok: false, reason: 'player required' };
  const house = HOUSES.get(p.id);
  if (!house) return { ok: false, reason: 'no house' };
  const s = parseSlot(roomSlot);
  if (!s) return { ok: false, reason: 'invalid slot' };
  const room = house.rooms.find(r => r.slot.idx === s.idx);
  if (!room) return { ok: false, reason: 'no room at that slot' };
  const target = furniture.getFurniture(newFurnitureId);
  if (!target) return { ok: false, reason: `unknown furniture: ${newFurnitureId}` };
  if (target.room !== room.roomId) {
    return { ok: false, reason: `furniture ${newFurnitureId} is for ${target.room}, not ${room.roomId}` };
  }
  const currentId = room.furniture[target.hotspot];
  if (!currentId) return { ok: false, reason: `no furniture on ${target.hotspot} to upgrade` };
  const current = furniture.getFurniture(currentId);
  if (!current) return { ok: false, reason: 'current furniture unknown (data corruption?)' };
  if (target.tier <= current.tier) {
    return { ok: false, reason: `target tier (${target.tierName}) must be strictly higher than current (${current.tierName})` };
  }
  const lvl = constructionLevel(p);
  if (lvl < target.level) {
    return { ok: false, reason: `Construction ${target.level} required for ${target.tierName} tier.` };
  }
  room.furniture[target.hotspot] = target.id;
  house.lastModified = Date.now();
  const xp = Math.floor(target.xp * tierXpMultiplier(target.tierName));
  house.totalBuildXp += xp;
  awardConstructionXp(p, xp, { source: 'upgrade_furniture', from: current.id, to: target.id, tier: target.tierName });
  syncPlayerHouseArray(p, house);
  if (events && events.emit) {
    events.emit('house_furniture_upgraded', {
      playerId: p.id, roomId: room.roomId, fromId: current.id, toId: target.id, xp, tier: target.tierName,
    });
  }
  return { ok: true, from: current, to: target, xp };
}

// Repair: restore a damaged room's condition to 100. Awards XP equal to
// 50% of the highest-tier furniture XP in the room (min 25). Condition is
// only reduced by external callers (test / damage events).

function repairRoom(p, roomSlot) {
  if (!p) return { ok: false, reason: 'player required' };
  const house = HOUSES.get(p.id);
  if (!house) return { ok: false, reason: 'no house' };
  const s = parseSlot(roomSlot);
  if (!s) return { ok: false, reason: 'invalid slot' };
  const room = house.rooms.find(r => r.slot.idx === s.idx);
  if (!room) return { ok: false, reason: 'no room at that slot' };
  if (typeof room.condition !== 'number') room.condition = 100;
  if (room.condition >= 100) return { ok: false, reason: 'room is not damaged' };
  // Compute repair XP from the highest-tier furniture in the room.
  let topTier = null;
  for (const fId of Object.values(room.furniture)) {
    const f = furniture.getFurniture(fId);
    if (!f) continue;
    if (!topTier || f.tier > topTier.tier) topTier = f;
  }
  const baseXp = topTier ? Math.floor(topTier.xp * tierXpMultiplier(topTier.tierName) * 0.5) : 25;
  const xp = Math.max(25, baseXp);
  const before = room.condition;
  room.condition = 100;
  house.lastModified = Date.now();
  house.totalBuildXp += xp;
  awardConstructionXp(p, xp, { source: 'repair_room', roomType: room.roomId });
  syncPlayerHouseArray(p, house);
  if (events && events.emit) {
    events.emit('house_room_repaired', { playerId: p.id, roomType: room.roomId, before, xp });
  }
  return { ok: true, xp, restoredFrom: before };
}

// Test / damage hook.
function damageRoom(p, roomSlot, amount) {
  const house = HOUSES.get(p && p.id);
  if (!house) return { ok: false, reason: 'no house' };
  const s = parseSlot(roomSlot);
  if (!s) return { ok: false, reason: 'invalid slot' };
  const room = house.rooms.find(r => r.slot.idx === s.idx);
  if (!room) return { ok: false, reason: 'no room at that slot' };
  if (typeof room.condition !== 'number') room.condition = 100;
  room.condition = Math.max(0, room.condition - Math.max(1, Math.floor(amount || 10)));
  return { ok: true, condition: room.condition };
}

// ── Portal Chamber ──────────────────────────────────────────────────────────

function setPortalDestination(p, portalSlot, region) {
  if (!p) return { ok: false, reason: 'player required' };
  const house = HOUSES.get(p.id);
  if (!house) return { ok: false, reason: 'no house' };
  const portalRoom = house.rooms.find(r => r.roomId === 'portal_chamber');
  if (!portalRoom) return { ok: false, reason: 'no portal chamber — build one first' };
  const roomDef = rooms.getRoom('portal_chamber');
  if (!roomDef.hotspots.includes(portalSlot)) {
    return { ok: false, reason: `invalid portal hotspot: ${portalSlot}` };
  }
  if (!portalRoom.furniture[portalSlot]) {
    return { ok: false, reason: `no portal frame at ${portalSlot} — place furniture first` };
  }
  house.portalDestinations[portalSlot] = region;
  house.lastModified = Date.now();
  if (events && events.emit) {
    events.emit('house_portal_attuned', { playerId: p.id, portalSlot, region });
  }
  return { ok: true, portalSlot, region };
}

function listPortals(p) {
  const house = HOUSES.get(p && p.id);
  if (!house) return [];
  return Object.entries(house.portalDestinations).map(([slot, region]) => ({ slot, region }));
}

// ── Sleep (bedroom) ─────────────────────────────────────────────────────────

function sleep(p) {
  if (!p) return { ok: false, reason: 'player required' };
  const house = HOUSES.get(p.id);
  if (!house) return { ok: false, reason: 'no house' };
  const bedroom = house.rooms.find(r => r.roomId === 'bedroom');
  if (!bedroom) return { ok: false, reason: 'no bedroom' };
  const now = nowTick();
  if (now < house.sleepCooldownUntil) {
    return { ok: false, reason: 'already slept today — come back tomorrow' };
  }
  house.sleepCooldownUntil = now + SLEEP_COOLDOWN_TICKS;
  house.lastModified = Date.now();
  p.restBoost = {
    multiplier: 1.25,
    expiresTick: now + SLEEP_BOOST_DURATION_TICKS,
  };
  if (events && events.emit) {
    events.emit('house_slept', { playerId: p.id, expiresTick: p.restBoost.expiresTick });
  }
  return { ok: true, boost: p.restBoost };
}

function nowTick() {
  try { return require('./tick').getTick(); } catch (_) { return Math.floor(Date.now() / 1000); }
}

// ── Pantry / Feast (burn-v2) ────────────────────────────────────────────────
//
// stockPantry(p, itemId, count): pulls food from the player's inventory into
// the house pantry. Requires a dining room.

function stockPantry(p, itemId, count) {
  if (!p) return { ok: false, reason: 'player required' };
  const house = HOUSES.get(p.id);
  if (!house) return { ok: false, reason: 'no house' };
  if (!house.rooms.some(r => r.roomId === 'dining_room')) {
    return { ok: false, reason: 'no dining room' };
  }
  const n = Math.max(1, Math.floor(count || 1));
  const have = countItems(p, [itemId]);
  if (have < n) return { ok: false, reason: `only have ${have}, need ${n}` };
  removeItems(p, [itemId], n);
  house.pantry = house.pantry || {};
  house.pantry[itemId] = (house.pantry[itemId] || 0) + n;
  house.lastModified = Date.now();
  return { ok: true, pantry: Object.assign({}, house.pantry) };
}

function _stockPantryRaw(p, itemId, count) {
  // Test-only: bypass inventory to seed pantry directly.
  const house = HOUSES.get(p && p.id);
  if (!house) return { ok: false, reason: 'no house' };
  house.pantry = house.pantry || {};
  house.pantry[itemId] = (house.pantry[itemId] || 0) + Math.max(1, Math.floor(count || 1));
  return { ok: true, pantry: Object.assign({}, house.pantry) };
}

function consumeFromPantry(house, itemIds, need) {
  let remaining = need;
  for (const id of itemIds) {
    const have = house.pantry && house.pantry[id] ? house.pantry[id] : 0;
    if (have <= 0) continue;
    const take = Math.min(have, remaining);
    house.pantry[id] = have - take;
    if (house.pantry[id] <= 0) delete house.pantry[id];
    remaining -= take;
    if (remaining <= 0) break;
  }
  return need - remaining;
}

// startFeast(p, guests, opts): schedules a feast. Cooldown 24h per house.
// Consumes FEAST_FOOD_REQUIRED high-tier food from pantry. Applies +25% XP
// buff to host + clan-member attendees for 30 minutes.
//
// Guests can be an array of player objects, player ids, or string names.
// Player objects get stamped with { feastBuff: { multiplier, expiresAt } }.

function startFeast(p, guests, opts) {
  if (!p) return { ok: false, reason: 'player required' };
  const house = HOUSES.get(p.id);
  if (!house) return { ok: false, reason: 'no house' };
  if (!house.rooms.some(r => r.roomId === 'dining_room')) {
    return { ok: false, reason: 'no dining room' };
  }
  const now = Date.now();
  if (house.feastCooldownUntil && now < house.feastCooldownUntil) {
    const remainingMs = house.feastCooldownUntil - now;
    return {
      ok: false,
      reason: `feast on cooldown (${Math.ceil(remainingMs / 60000)} min remaining)`,
      cooldownUntil: house.feastCooldownUntil,
    };
  }
  // Food requirement. Tests may pass { _bypassFood: true } to skip.
  let foodConsumed = 0;
  if (!opts || !opts._bypassFood) {
    const available = FEAST_HIGH_TIER_FOOD_IDS.reduce((sum, id) => {
      return sum + (house.pantry && house.pantry[id] ? house.pantry[id] : 0);
    }, 0);
    if (available < FEAST_FOOD_REQUIRED) {
      return {
        ok: false,
        reason: `need ${FEAST_FOOD_REQUIRED} high-tier food in pantry (have ${available})`,
      };
    }
    foodConsumed = consumeFromPantry(house, FEAST_HIGH_TIER_FOOD_IDS, FEAST_FOOD_REQUIRED);
  }

  // Normalise guests. Filter to clan members if host has a clan.
  const invited = Array.isArray(guests) ? guests.slice() : [];
  const attendees = [];
  const buffExpires = now + FEAST_DURATION_MS;
  const buff = { multiplier: FEAST_XP_MULTIPLIER, expiresAt: buffExpires, source: 'house_feast', hostId: p.id };
  for (const g of invited) {
    // Only player objects receive the stamped feastBuff.
    if (g && typeof g === 'object' && g.id != null) {
      const sameClan = !p.clan || p.clan === g.clan;
      if (!sameClan) {
        attendees.push({ id: g.id, name: g.name || `player_${g.id}`, buffed: false });
        continue; // only buff clan members when host has a clan
      }
      g.feastBuff = buff;
      attendees.push({ id: g.id, name: g.name || `player_${g.id}`, buffed: true });
    } else {
      attendees.push({ id: null, name: String(g), buffed: false });
    }
  }
  // Host always gets the buff.
  p.feastBuff = buff;

  house.feast = {
    hostId: p.id,
    guests: invited,
    attendees,
    startedAt: now,
    endsAt: buffExpires,
    foodConsumed,
    active: true,
  };
  house.lastFeastAt = now;
  house.feastCooldownUntil = now + FEAST_COOLDOWN_MS;
  house.lastModified = now;

  if (events && events.emit) {
    events.emit('house_feast_started', { playerId: p.id, guests: invited, attendees, buff });
  }
  return {
    ok: true,
    feast: house.feast,
    buff,
    cooldownUntil: house.feastCooldownUntil,
    attendees,
  };
}

function endFeast(p) {
  if (!p) return { ok: false, reason: 'player required' };
  const house = HOUSES.get(p.id);
  if (!house || !house.feast) return { ok: false, reason: 'no active feast' };
  house.feast.active = false;
  if (events && events.emit) {
    events.emit('house_feast_ended', { playerId: p.id });
  }
  return { ok: true };
}

function feastBuffActive(p) {
  if (!p || !p.feastBuff) return false;
  return Date.now() < (p.feastBuff.expiresAt || 0);
}

// ── Redecorate: preview before commit ───────────────────────────────────────

function previewChange(p, change) {
  if (!p) return { ok: false, reason: 'player required' };
  const house = HOUSES.get(p.id);
  if (!house) return { ok: false, reason: 'no house' };
  const lvl = constructionLevel(p);
  const out = { ok: true, currentLevel: lvl, currentRooms: house.rooms.length, cap: roomCapForLevel(lvl) };
  if (change && change.type === 'buildRoom') {
    const def = rooms.getRoom(change.roomType);
    if (def) {
      out.projectedXp = def.buildXp;
      out.projectedRooms = house.rooms.length + 1;
      out.capOk = out.projectedRooms <= out.cap;
      out.levelOk = lvl >= def.buildLevel;
      out.cost = plankCostForRoom(def);
      out.unlockOk = checkRoomUnlockConditions(p, def).ok;
    }
  } else if (change && change.type === 'addFurniture') {
    const f = furniture.getFurniture(change.furnitureId);
    if (f) {
      out.projectedXp = Math.floor(f.xp * tierXpMultiplier(f.tierName));
      out.levelOk = lvl >= f.level;
      out.tier = f.tierName;
    }
  } else if (change && change.type === 'upgradeFurniture') {
    const f = furniture.getFurniture(change.furnitureId);
    if (f) {
      out.projectedXp = Math.floor(f.xp * tierXpMultiplier(f.tierName));
      out.levelOk = lvl >= f.level;
      out.tier = f.tierName;
    }
  }
  return out;
}

// ── Construction XP award ───────────────────────────────────────────────────

function awardConstructionXp(p, xp, meta) {
  if (!xp || xp <= 0) return 0;
  const mod = _player();
  // Track before/after level so we can fire room_unlocked crossings.
  const beforeLvl = constructionLevel(p);
  if (mod && typeof mod.addXp === 'function') {
    mod.addXp(p, 'construction', xp);
  } else if (p.skills && p.skills.construction) {
    p.skills.construction.xp = (p.skills.construction.xp || 0) + xp;
    if (mod && typeof mod.levelForXp === 'function') {
      p.skills.construction.level = mod.levelForXp(p.skills.construction.xp);
    }
  }
  const afterLvl = constructionLevel(p);
  _tickHousingProgress(p, xp, meta, beforeLvl, afterLvl);
  return xp;
}

// ── Housing progress / room-unlock detection (burn-v2) ─────────────────────
//
// Called from awardConstructionXp AND from notifyConstructionXp. Ticks the
// per-house progressXp counter, recomputes unlocked room types, and fires
// 'house_room_unlocked' for any new crossings.

function computeUnlockedRooms(p) {
  const out = {};
  const lvl = constructionLevel(p);
  for (const [id, def] of Object.entries(rooms.ROOMS)) {
    const levelOk = lvl >= def.buildLevel;
    const cond = checkRoomUnlockConditions(p, def);
    out[id] = { unlocked: levelOk && cond.ok, levelOk, conditionsOk: cond.ok, reason: cond.ok ? null : cond.reason };
  }
  return out;
}

function _tickHousingProgress(p, xp, meta, beforeLvl, afterLvl) {
  const house = HOUSES.get(p && p.id);
  if (!house) {
    _notifyXpListeners(p, xp, meta, null);
    return;
  }
  house.progressXp = (house.progressXp || 0) + xp;
  house.lastModified = Date.now();

  // Recompute room unlocks; emit for each new unlock.
  const before = house.unlockedRoomTypes || {};
  const after = computeUnlockedRooms(p);
  const newlyUnlocked = [];
  for (const [id, entry] of Object.entries(after)) {
    const prev = before[id];
    if (entry.unlocked && (!prev || !prev.unlocked)) {
      newlyUnlocked.push(id);
    }
  }
  house.unlockedRoomTypes = after;
  for (const id of newlyUnlocked) {
    if (events && events.emit) {
      events.emit('house_room_unlocked', {
        playerId: p.id,
        roomType: id,
        construction: afterLvl,
        xpSource: (meta && meta.source) || 'construction_xp',
      });
    }
  }
  _notifyXpListeners(p, xp, meta, { beforeLvl, afterLvl, newlyUnlocked });
}

function _notifyXpListeners(p, xp, meta, crossing) {
  if (XP_LISTENERS.size === 0) return;
  for (const fn of XP_LISTENERS) {
    try { fn({ player: p, xp, meta: meta || null, crossing: crossing || null }); }
    catch (e) { /* swallow listener errors */ }
  }
}

function onConstructionXpGained(fn) {
  if (typeof fn !== 'function') return () => {};
  XP_LISTENERS.add(fn);
  return () => XP_LISTENERS.delete(fn);
}

// External callers: any non-housing Construction XP source should call this
// AFTER addXp has been applied, so the house's progressXp tracks every
// Construction XP the player gains (not just the ones spent on builds).
//
// Accepts:
//   notifyConstructionXp(p, xpAmount, { source: 'training_runner', methodId })
//
// Returns the list of newly-unlocked room types, if any.

function notifyConstructionXp(p, xp, meta) {
  if (!p || !xp || xp <= 0) return [];
  const house = HOUSES.get(p.id);
  if (!house) {
    _notifyXpListeners(p, xp, meta, null);
    return [];
  }
  const currentLvl = constructionLevel(p);
  // Do NOT award XP here — that's the caller's job. Just record progress and
  // re-evaluate unlocks (in case the caller already ran addXp).
  const before = Object.assign({}, house.unlockedRoomTypes || {});
  house.progressXp = (house.progressXp || 0) + xp;
  const after = computeUnlockedRooms(p);
  const newly = [];
  for (const [id, entry] of Object.entries(after)) {
    const prev = before[id];
    if (entry.unlocked && (!prev || !prev.unlocked)) newly.push(id);
  }
  house.unlockedRoomTypes = after;
  house.lastModified = Date.now();
  for (const id of newly) {
    if (events && events.emit) {
      events.emit('house_room_unlocked', {
        playerId: p.id,
        roomType: id,
        construction: currentLvl,
        xpSource: (meta && meta.source) || 'external',
      });
    }
  }
  _notifyXpListeners(p, xp, meta, { beforeLvl: currentLvl, afterLvl: currentLvl, newlyUnlocked: newly });
  return newly;
}

// ── Player-mirror array (spec: player.house = []) ───────────────────────────

function syncPlayerHouseArray(p, house) {
  if (!p || !house) return;
  p.house = house.rooms.map(r => ({
    type: r.roomId,
    slot: r.slot,
    furniture: Object.assign({}, r.furniture),
  }));
}

// ── Persistence ─────────────────────────────────────────────────────────────

function serializeAll() {
  const out = {};
  for (const [id, h] of HOUSES) {
    out[id] = {
      ownerId: h.ownerId,
      ownerName: h.ownerName,
      layer: h.layer,
      createdAt: h.createdAt,
      lastModified: h.lastModified,
      theme: h.theme,
      visitorPermission: h.visitorPermission,
      rooms: h.rooms,
      portalDestinations: h.portalDestinations,
      sleepCooldownUntil: h.sleepCooldownUntil,
      guestBook: h.guestBook,
      ratings: h.ratings,
      totalBuildXp: h.totalBuildXp,
      progressXp: h.progressXp || 0,
      unlockedRoomTypes: h.unlockedRoomTypes || {},
      lastFeastAt: h.lastFeastAt || 0,
      feastCooldownUntil: h.feastCooldownUntil || 0,
      pantry: h.pantry || {},
    };
  }
  return out;
}

function restoreAll(data) {
  HOUSES.clear();
  if (!data || typeof data !== 'object') return 0;
  let count = 0;
  for (const [idStr, h] of Object.entries(data)) {
    const id = Number(idStr);
    HOUSES.set(id, Object.assign({
      ownerId: id,
      rooms: [],
      portalDestinations: {},
      guestBook: [],
      ratings: [],
      totalBuildXp: 0,
      sleepCooldownUntil: 0,
      progressXp: 0,
      unlockedRoomTypes: {},
      lastFeastAt: 0,
      feastCooldownUntil: 0,
      pantry: {},
    }, h));
    count++;
  }
  return count;
}

function saveHouses(dir) {
  const root = dir || path.join(__dirname, '..', '..', 'data');
  if (!fs.existsSync(root)) fs.mkdirSync(root, { recursive: true });
  const filepath = path.join(root, HOUSES_FILE);
  fs.writeFileSync(filepath, JSON.stringify(serializeAll(), null, 2));
  return filepath;
}

function loadHouses(dir) {
  const root = dir || path.join(__dirname, '..', '..', 'data');
  const filepath = path.join(root, HOUSES_FILE);
  if (!fs.existsSync(filepath)) return 0;
  try {
    const raw = fs.readFileSync(filepath, 'utf8');
    return restoreAll(JSON.parse(raw));
  } catch (err) {
    console.error('[housing] failed to load houses.json:', err.message);
    return 0;
  }
}

// ── Register: wire into persistence + events ───────────────────────────────

function register(opts) {
  opts = opts || {};
  const persistence = opts.persistence || (() => { try { return require('./persistence'); } catch (_) { return null; } })();
  if (persistence && typeof persistence.onSave === 'function') {
    persistence.onSave('housing', () => { saveHouses(); });
  }
  try { loadHouses(); } catch (_) {}
  return module.exports;
}

// ── Test helpers ────────────────────────────────────────────────────────────

function _resetForTest() {
  HOUSES.clear();
  XP_LISTENERS.clear();
}

// ── Exports ─────────────────────────────────────────────────────────────────

module.exports = {
  // Spec entry points
  createHouse,
  getHouse,
  enterHouse,
  leaveHouse,
  buildRoom,
  destroyRoom,
  addFurniture,
  removeFurniture,
  upgradeFurniture,
  repairRoom,
  damageRoom,
  // Portal chamber
  setPortalDestination,
  listPortals,
  // Bedroom / dining
  sleep,
  startFeast,
  endFeast,
  feastBuffActive,
  stockPantry,
  _stockPantryRaw,
  // Preview / redecorate
  previewChange,
  // Queries
  hasHouse,
  listRooms,
  roomCapForLevel,
  constructionLevel,
  totalLevelOf,
  hasGrandmasterQuestCompleted,
  checkRoomUnlockConditions,
  computeUnlockedRooms,
  tierXpMultiplier,
  plankCostForRoom,
  // Cross-link (burn-v2)
  notifyConstructionXp,
  onConstructionXpGained,
  // Persistence
  saveHouses,
  loadHouses,
  serializeAll,
  restoreAll,
  register,
  // Admin / cleanup
  destroyHouse,
  // Constants
  UNLOCK_LEVEL,
  GRID_SIZE,
  MAX_SLOTS,
  HOUSE_LAYER_BASE,
  FEAST_COOLDOWN_MS,
  FEAST_DURATION_MS,
  FEAST_XP_MULTIPLIER,
  FEAST_FOOD_REQUIRED,
  FEAST_HIGH_TIER_FOOD_IDS,
  COSTUME_ROOM_TOTAL_LEVEL,
  XP_TIER_MULTIPLIER_OVERRIDES,
  // Test helpers
  _resetForTest,
  _HOUSES: HOUSES,
};
