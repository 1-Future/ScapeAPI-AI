// ══════════════════════════════════════════════════════════════════════════════
// Player Housing / Construction Runtime
//
// Implements the full BYOS player-housing.md spec:
//   - House unlock gated by Construction 10
//   - Each house is instanced (its own sub-layer with its own walls/grid)
//   - 12 room types (parlour, kitchen, bedroom, chapel, portal_chamber,
//     workshop, dining_room, throne_room, garden, study, menagerie,
//     costume_room)
//   - Each room has 3-6 furniture hotspots
//   - Each hotspot has 7 tier options: regular -> mahogany -> teak -> magic
//     -> gilded -> demonic -> crystal
//   - Construction XP awarded per place/upgrade, per the tier table
//   - Room cap scales with Construction level (3 at lvl 10, 32 at lvl 99)
//   - Persistence via data/houses.json through persistence.onSave
//
// Design:
//   - One module, pure functions + an in-memory HOUSES map keyed by playerId.
//   - Instance layer is allocated per-house (HOUSE_LAYER_BASE + playerId). The
//     engine only needs a unique layer number; actual tile geometry is
//     represented as a 6x6 grid of rooms inside the house object.
//   - Persistence is explicit: saveHouses() / loadHouses() serialise the Map
//     to JSON. persistence.onSave is wired via register().
//
// Construction XP flow:
//   1. Build room      -> flat room.buildXp
//   2. Add furniture   -> furniture.xp (modified by tier multiplier)
//   3. Remove/destroy  -> zero XP (matches spec; no XP for removal)
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

const HOUSES_FILE = 'houses.json';

// ── In-memory storage ───────────────────────────────────────────────────────
// Map<playerId, houseObject>
const HOUSES = new Map();

// ── Room cap schedule ───────────────────────────────────────────────────────
// Construction level -> max rooms. Smoothly scales from 3 at lvl 10 to 32 at
// lvl 99. Floor the result so integer levels never produce fractional caps.
function roomCapForLevel(lvl) {
  if (lvl < UNLOCK_LEVEL) return 0;
  if (lvl >= 99) return 32;
  // Linear: level 10 -> 3, level 99 -> 32. That's (32-3)/(99-10) = 29/89 per lvl.
  const extra = Math.floor(((lvl - UNLOCK_LEVEL) / (99 - UNLOCK_LEVEL)) * (32 - 3));
  return 3 + extra;
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function constructionLevel(p) {
  return (p && p.skills && p.skills.construction && p.skills.construction.level) || 1;
}

function layerForHouse(ownerId) {
  return HOUSE_LAYER_BASE + Number(ownerId);
}

function gridIndex(x, y) {
  return y * GRID_SIZE + x;
}

function parseSlot(slot) {
  // Accept either {x,y} or an integer index 0..35.
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
    rooms: [],               // [{ slot: {x,y,idx}, roomId, furniture: {hotspot: furnitureId} }]
    portalDestinations: {},  // { 'portal_1': 'heartlands', ... }
    sleepCooldownUntil: 0,
    guestBook: [],
    ratings: [],
    totalBuildXp: 0,
  };
  HOUSES.set(p.id, house);
  // Mirror onto player.house for spec compliance (player.house = [] in player.js)
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
  // target is either a target player object, a target id, or null (self).
  let ownerId = p.id;
  if (target != null) {
    if (typeof target === 'object' && target.id != null) ownerId = target.id;
    else ownerId = target;
  }
  const house = HOUSES.get(ownerId);
  if (!house) return { ok: false, reason: 'no such house' };
  // Permission gate (light-weight; full friends/clan check is outside the
  // housing module's responsibility).
  if (ownerId !== p.id && house.visitorPermission === 'locked') {
    return { ok: false, reason: 'house is locked to visitors' };
  }
  // Save location for leaveHouse to restore.
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

function buildRoom(p, roomType, position) {
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
  const slot = parseSlot(position);
  if (!slot) return { ok: false, reason: 'invalid position (must be 0..35 or {x,y})' };
  const existing = house.rooms.find(r => r.slot.idx === slot.idx);
  if (existing) return { ok: false, reason: `slot ${slot.idx} already has a room (${existing.roomId})` };
  const cap = roomCapForLevel(lvl);
  if (house.rooms.length >= cap) {
    return { ok: false, reason: `room cap reached (${house.rooms.length}/${cap}) for Construction ${lvl}` };
  }
  const room = {
    slot,
    roomId: roomType,
    furniture: {}, // hotspot -> furnitureId
    builtAt: Date.now(),
  };
  house.rooms.push(room);
  house.lastModified = Date.now();
  const xp = roomDef.buildXp;
  house.totalBuildXp += xp;
  awardConstructionXp(p, xp);
  syncPlayerHouseArray(p, house);
  if (events && events.emit) {
    events.emit('house_room_built', { playerId: p.id, roomType, slot, xp });
  }
  return { ok: true, room, xp };
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
  // Hotspot must exist on the room type.
  const roomDef = rooms.getRoom(room.roomId);
  if (!roomDef.hotspots.includes(f.hotspot)) {
    return { ok: false, reason: `hotspot ${f.hotspot} does not exist on ${room.roomId}` };
  }
  const lvl = constructionLevel(p);
  if (lvl < f.level) {
    return { ok: false, reason: `Construction ${f.level} required for ${f.tierName} tier.` };
  }
  room.furniture[f.hotspot] = f.id;
  house.lastModified = Date.now();
  house.totalBuildXp += f.xp;
  awardConstructionXp(p, f.xp);
  syncPlayerHouseArray(p, house);
  if (events && events.emit) {
    events.emit('house_furniture_added', { playerId: p.id, roomId: room.roomId, furnitureId: f.id, xp: f.xp });
  }
  return { ok: true, furniture: f, xp: f.xp };
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

// ── Portal Chamber ──────────────────────────────────────────────────────────

function setPortalDestination(p, portalSlot, region) {
  if (!p) return { ok: false, reason: 'player required' };
  const house = HOUSES.get(p.id);
  if (!house) return { ok: false, reason: 'no house' };
  // Portal slot must be a valid hotspot on a portal chamber room.
  const portalRoom = house.rooms.find(r => r.roomId === 'portal_chamber');
  if (!portalRoom) return { ok: false, reason: 'no portal chamber — build one first' };
  const roomDef = rooms.getRoom('portal_chamber');
  if (!roomDef.hotspots.includes(portalSlot)) {
    return { ok: false, reason: `invalid portal hotspot: ${portalSlot}` };
  }
  // Must have furniture on this hotspot (a "portal frame") before attuning.
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

// ── Feasts (dining room) ────────────────────────────────────────────────────

function startFeast(p, guests) {
  if (!p) return { ok: false, reason: 'player required' };
  const house = HOUSES.get(p.id);
  if (!house) return { ok: false, reason: 'no house' };
  if (!house.rooms.some(r => r.roomId === 'dining_room')) {
    return { ok: false, reason: 'no dining room' };
  }
  const invited = Array.isArray(guests) ? guests.slice() : [];
  house.feast = {
    hostId: p.id,
    guests: invited,
    startedAt: Date.now(),
    active: true,
  };
  if (events && events.emit) {
    events.emit('house_feast_started', { playerId: p.id, guests: invited });
  }
  return { ok: true, feast: house.feast };
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

// ── Redecorate: preview before commit ───────────────────────────────────────

function previewChange(p, change) {
  if (!p) return { ok: false, reason: 'player required' };
  const house = HOUSES.get(p.id);
  if (!house) return { ok: false, reason: 'no house' };
  // Simple preview: compute projected XP + cap status for the change.
  const lvl = constructionLevel(p);
  const out = { ok: true, currentLevel: lvl, currentRooms: house.rooms.length, cap: roomCapForLevel(lvl) };
  if (change && change.type === 'buildRoom') {
    const def = rooms.getRoom(change.roomType);
    if (def) {
      out.projectedXp = def.buildXp;
      out.projectedRooms = house.rooms.length + 1;
      out.capOk = out.projectedRooms <= out.cap;
      out.levelOk = lvl >= def.buildLevel;
    }
  } else if (change && change.type === 'addFurniture') {
    const f = furniture.getFurniture(change.furnitureId);
    if (f) {
      out.projectedXp = f.xp;
      out.levelOk = lvl >= f.level;
    }
  }
  return out;
}

// ── Construction XP award ───────────────────────────────────────────────────

function awardConstructionXp(p, xp) {
  if (!xp || xp <= 0) return 0;
  const mod = _player();
  if (mod && typeof mod.addXp === 'function') {
    mod.addXp(p, 'construction', xp);
    return xp;
  }
  // Fallback: direct mutation
  if (p.skills && p.skills.construction) {
    p.skills.construction.xp = (p.skills.construction.xp || 0) + xp;
  }
  return xp;
}

// ── Player-mirror array (spec: player.house = []) ───────────────────────────
// The spec says player.house is an array: [{ type, furniture: {hotspot: furnitureId} }].
// We mirror the Map state into that array on every mutation so any consumer of
// player.house (including the existing persistence snapshot) stays consistent.

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
  // Attempt auto-load (best-effort; missing file is OK).
  try { loadHouses(); } catch (_) {}
  return module.exports;
}

// ── Test helpers ────────────────────────────────────────────────────────────

function _resetForTest() {
  HOUSES.clear();
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
  // Portal chamber
  setPortalDestination,
  listPortals,
  // Bedroom / dining
  sleep,
  startFeast,
  endFeast,
  // Preview / redecorate
  previewChange,
  // Queries
  hasHouse,
  listRooms,
  roomCapForLevel,
  constructionLevel,
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
  // Test helpers
  _resetForTest,
  _HOUSES: HOUSES,
};
