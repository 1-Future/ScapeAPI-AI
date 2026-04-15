// ══════════════════════════════════════════════════════════════════════════════
// Death + Respawn System — OSRS-inspired
//
// When a player's HP hits zero:
//   1. Sort inventory + equipment by value (desc).
//   2. Keep the top 3 items. If "Protect Item" prayer is active, keep 4.
//   3. Drop the rest into a grave at the death location.
//   4. Reset HP, prayer, temporary boosts, and teleport to the respawn point.
//   5. Emit a "death" event so listeners (narrator, UI, statistics) can react.
//
// Graves persist on disk in data/graves.json and live for 6000 ticks (~60 min
// at 600ms tick). tickGraves() removes expired graves silently — no chat spam.
//
// Mode variants:
//   * Ironman — only the grave owner can loot. Other players may see it.
//   * Hardcore — the first death sets player.hardcoreDead = true; the grave
//     is kept as a permanent memorial (expiresAt = Infinity). The player's
//     account reverts to regular mode.
//
// Player state additions (shape documented here; production code should set
// defaults in player.createPlayer or via setters when a player first logs in):
//   player.respawnPoint   = { region, x, y }
//     Defaults to Heartlands (100, 90). Overridable per-player via
//     setRespawnPoint(player, { region, x, y }).
//   player.deaths         = [{ tick, location, keptItemIds, lostItemIds, graveId }]
//     Capped at 20 most-recent entries.
//   player.isHardcore     — boolean, optional. Set externally when creating
//     a hardcore character. death.js only reads this flag; it never sets it.
//   player.visitedRegions — Set<string>, optional. Used by /sethome to enforce
//     "must have visited" requirement.
//   player.hardcoreDead   — boolean, set by onPlayerDeath when a hardcore
//     player dies. Subsequent deaths run as regular.
//
// Value lookup (for sorting and display):
//   1. ge-runner.getMarketStats(id).medianPrice (if the GE has trade data)
//   2. item.value (the base coin value from items.js)
//   3. 1 (fallback so every item still sorts deterministically)
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const events = require('./events');
const persistence = require('./persistence');

// ── Constants ───────────────────────────────────────────────────────────────
const GRAVE_TTL_TICKS = 6000;          // 60 min at 600ms tick
const DEATHS_HISTORY_CAP = 20;         // most-recent deaths per player
const KEEP_ON_DEATH = 3;               // default kept-item count
const KEEP_WITH_PROTECT_ITEM = 4;      // with Protect Item prayer
const CLAIM_DISTANCE = 1;              // tiles (Chebyshev)
const DEFAULT_RESPAWN = Object.freeze({ region: 'heartlands', x: 100, y: 90 });

// ── In-memory grave registry ────────────────────────────────────────────────
// A grave: {
//   id: 'g_<tick>_<playerId>_<rand>',
//   ownerId, ownerName,
//   location: { region, x, y },
//   items: [{ id, name, count }],
//   placedAt: tick,
//   expiresAt: tick + TTL (or Infinity for hardcore memorials),
//   mode: 'normal'|'ironman'|'hcim',
//   memorial: boolean, // true for hardcore permanent graves
// }
const graves = new Map();              // graveId -> grave
let _graveSeq = 0;

// ── Persistence ─────────────────────────────────────────────────────────────
function saveGraves() {
  const list = [];
  for (const g of graves.values()) {
    list.push({
      ...g,
      // Infinity doesn't serialize to valid JSON; use null sentinel.
      expiresAt: g.expiresAt === Infinity ? null : g.expiresAt,
    });
  }
  persistence.save('graves.json', { graves: list });
}

function loadGraves() {
  const data = persistence.load('graves.json', { graves: [] });
  graves.clear();
  for (const g of data.graves || []) {
    if (g.expiresAt === null || g.expiresAt === undefined) g.expiresAt = Infinity;
    graves.set(g.id, g);
  }
}

// ── Pluggable adapters ──────────────────────────────────────────────────────
// Production wires these via register(opts). Tests use the in-memory defaults
// so death.js can be exercised without a full server bootstrap.
let adapters = {
  items: null,              // { get, find } — src/data/items
  prayers: null,            // src/content/aelgard/prayer-expansion (optional)
  ge: null,                 // { getMarketStats } — src/engine/ge-runner (optional)
  getTick: () => 0,         // returns current engine tick
  invAdd: null,             // (player, itemId, name, count, stackable) -> boolean
  invRemove: null,          // (player, itemId, count) -> number removed
  setPlayerPosition: null,  // (player, { region, x, y })
};

function setAdapters(opts) {
  if (!opts) return;
  adapters = { ...adapters, ...opts };
}

// ── Value lookup ────────────────────────────────────────────────────────────
function getItemValue(itemId) {
  // 1) GE median price if available.
  const ge = adapters.ge;
  if (ge && typeof ge.getMarketStats === 'function') {
    try {
      const stats = ge.getMarketStats(itemId);
      if (stats && Number.isFinite(stats.medianPrice) && stats.medianPrice > 0) {
        return stats.medianPrice;
      }
    } catch (_) { /* fall through */ }
  }
  // 2) Base item value from items.js.
  const items = adapters.items;
  if (items && typeof items.get === 'function') {
    const def = items.get(itemId);
    if (def && Number.isFinite(def.value) && def.value > 0) return def.value;
  }
  // 3) Fallback so every item still sorts deterministically.
  return 1;
}

// ── Prayer lookup ───────────────────────────────────────────────────────────
function hasProtectItem(player) {
  if (!player || !player.activePrayers) return false;
  // activePrayers is typically a Set, occasionally an array.
  if (typeof player.activePrayers.has === 'function') {
    if (player.activePrayers.has('protect_item')) return true;
  } else if (Array.isArray(player.activePrayers)) {
    if (player.activePrayers.includes('protect_item')) return true;
  }
  // Also check the Aelgard prayer registry so that if the id ever gets
  // renamed we can surface it in logs instead of silently missing it.
  const prayers = adapters.prayers && adapters.prayers.prayers;
  if (prayers && typeof prayers.get === 'function') {
    const def = prayers.get('protect_item');
    if (def && def.level !== undefined) {
      // Definition exists in the registry. If activePrayers didn't contain it,
      // the prayer just isn't active — no extra slot granted.
      return false;
    }
  }
  return false;
}

// ── Respawn point ───────────────────────────────────────────────────────────
function getRespawnPoint(player) {
  if (player && player.respawnPoint
      && Number.isFinite(player.respawnPoint.x)
      && Number.isFinite(player.respawnPoint.y)) {
    return {
      region: player.respawnPoint.region || DEFAULT_RESPAWN.region,
      x: player.respawnPoint.x | 0,
      y: player.respawnPoint.y | 0,
    };
  }
  return { ...DEFAULT_RESPAWN };
}

function setRespawnPoint(player, point) {
  if (!player || !point) return false;
  player.respawnPoint = {
    region: point.region || DEFAULT_RESPAWN.region,
    x: point.x | 0,
    y: point.y | 0,
  };
  return true;
}

// ── Stat restoration ────────────────────────────────────────────────────────
function restoreStats(player) {
  if (!player) return;

  // Restore HP to max.
  if (player.skills && player.skills.hitpoints) {
    player.maxHp = player.skills.hitpoints.level;
  }
  if (Number.isFinite(player.maxHp)) player.hp = player.maxHp;
  else player.hp = 10;

  // Restore prayer to max.
  if (player.skills && player.skills.prayer) {
    player.prayerPoints = player.skills.prayer.level;
  }
  if (player.activePrayers) {
    if (typeof player.activePrayers.clear === 'function') player.activePrayers.clear();
    else if (Array.isArray(player.activePrayers)) player.activePrayers.length = 0;
  }

  // Clear temporary boosts + transient effects.
  player.boosts = {};
  player.poison = null;
  player.stunTicks = 0;
  player.busy = false;
  player.busyAction = null;
  player.combatTarget = null;
  player.pvpTarget = null;
  player.agilityLap = null;
  player.pendingEvent = null;
  player.nextAttackTick = 0;
  player.nextEatTick = 0;
  player.specialEnergy = 1000;
  player.runEnergy = 10000;
}

// ── Grave placement ─────────────────────────────────────────────────────────
function _makeGraveId(playerId) {
  _graveSeq = (_graveSeq + 1) & 0x7fffffff;
  const tick = adapters.getTick ? adapters.getTick() : 0;
  return `g_${tick}_${String(playerId).slice(0, 16)}_${_graveSeq}`;
}

function placeGrave(player, location, items, opts) {
  const o = opts || {};
  const now = adapters.getTick ? adapters.getTick() : 0;
  const ttl = Number.isFinite(o.ttl) ? o.ttl : GRAVE_TTL_TICKS;
  const memorial = !!o.memorial;
  const grave = {
    id: _makeGraveId(player?.id ?? 'anon'),
    ownerId: player?.id ?? null,
    ownerName: player?.name ?? null,
    location: {
      region: location?.region || DEFAULT_RESPAWN.region,
      x: (location?.x | 0),
      y: (location?.y | 0),
    },
    items: (items || []).map(it => ({
      id: it.id,
      name: it.name || null,
      count: it.count || 1,
    })),
    placedAt: now,
    expiresAt: memorial ? Infinity : now + ttl,
    mode: o.mode || (player?.accountMode || 'normal'),
    memorial,
  };
  graves.set(grave.id, grave);
  saveGraves();
  return grave;
}

function getGrave(graveId) {
  return graves.get(graveId) || null;
}

function listGraves(filter) {
  const out = [];
  for (const g of graves.values()) {
    if (filter && filter.ownerId !== undefined && g.ownerId !== filter.ownerId) continue;
    out.push(g);
  }
  return out;
}

// ── Claim a grave ───────────────────────────────────────────────────────────
function _chebyshev(a, b) {
  return Math.max(Math.abs((a.x | 0) - (b.x | 0)), Math.abs((a.y | 0) - (b.y | 0)));
}

function claimGrave(player, graveId) {
  const grave = graves.get(graveId);
  if (!grave) return { ok: false, reason: 'not_found', items: [] };

  // Ironman + HCIM: only owner can loot.
  if ((grave.mode === 'ironman' || grave.mode === 'hcim') && grave.ownerId !== player?.id) {
    return { ok: false, reason: 'ironman_owner_only', items: [] };
  }
  // Hardcore memorial graves are permanent and unlootable by anyone.
  if (grave.memorial) {
    return { ok: false, reason: 'memorial', items: [] };
  }

  const now = adapters.getTick ? adapters.getTick() : 0;
  if (now > grave.expiresAt) {
    // Grave expired. Remove it and report failure.
    graves.delete(graveId);
    saveGraves();
    return { ok: false, reason: 'expired', items: [] };
  }

  if (player) {
    const playerPos = { x: player.x, y: player.y };
    if (_chebyshev(playerPos, grave.location) > CLAIM_DISTANCE) {
      return { ok: false, reason: 'too_far', items: [] };
    }
  }

  const returned = [];
  const invAdd = adapters.invAdd;
  const items = adapters.items;
  const remaining = [];
  for (const item of grave.items) {
    const def = items && items.get ? items.get(item.id) : null;
    const stackable = !!(def && def.stackable);
    let added = true;
    if (invAdd) {
      added = !!invAdd(player, item.id, item.name, item.count, stackable);
    } else if (player && Array.isArray(player.inventory)) {
      // Minimal fallback — place directly in inventory array (used by tests
      // that don't wire invAdd).
      const idx = player.inventory.findIndex(s => s === null);
      if (idx >= 0) player.inventory[idx] = { id: item.id, name: item.name, count: item.count };
      else added = false;
    }
    if (added) returned.push(item);
    else remaining.push(item);
  }

  if (remaining.length === 0) {
    graves.delete(graveId);
  } else {
    grave.items = remaining;
  }
  saveGraves();

  events.emit('grave:claimed', {
    type: 'grave:claimed',
    graveId,
    ownerId: grave.ownerId,
    claimerId: player?.id ?? null,
    returned: returned.map(it => it.id),
    remaining: remaining.length,
  });
  return { ok: true, items: returned, remaining };
}

// ── Tick aging ──────────────────────────────────────────────────────────────
function tickGraves() {
  const now = adapters.getTick ? adapters.getTick() : 0;
  const expired = [];
  for (const g of graves.values()) {
    if (g.expiresAt !== Infinity && now > g.expiresAt) expired.push(g);
  }
  if (!expired.length) return 0;
  for (const g of expired) {
    graves.delete(g.id);
    // Silent in chat — only the event bus gets told.
    events.emit('grave:expired', {
      type: 'grave:expired',
      graveId: g.id,
      ownerId: g.ownerId,
      lostItemIds: g.items.map(it => it.id),
    });
  }
  saveGraves();
  return expired.length;
}

// ── Collecting a player's items ─────────────────────────────────────────────
function _collectPlayerItems(player) {
  // Returns [{ id, name, count, source, value }] covering inventory + equipment.
  const list = [];
  if (Array.isArray(player.inventory)) {
    for (let i = 0; i < player.inventory.length; i++) {
      const slot = player.inventory[i];
      if (!slot) continue;
      list.push({
        id: slot.id,
        name: slot.name,
        count: slot.count || 1,
        source: 'inventory',
        slotIndex: i,
        value: getItemValue(slot.id),
      });
    }
  }
  if (player.equipment && typeof player.equipment === 'object') {
    for (const [slot, item] of Object.entries(player.equipment)) {
      if (!item) continue;
      list.push({
        id: item.id,
        name: item.name,
        count: 1,
        source: 'equipment',
        slotIndex: slot,
        value: getItemValue(item.id),
      });
    }
  }
  return list;
}

function _stripItems(player) {
  if (Array.isArray(player.inventory)) {
    for (let i = 0; i < player.inventory.length; i++) player.inventory[i] = null;
  }
  if (player.equipment && typeof player.equipment === 'object') {
    for (const slot of Object.keys(player.equipment)) delete player.equipment[slot];
  }
}

function _giveKept(player, kept) {
  const items = adapters.items;
  for (const k of kept) {
    // Always return kept items to the inventory (simple rule — OSRS returns
    // them to the player's inventory on respawn regardless of original slot).
    const def = items && items.get ? items.get(k.id) : null;
    const stackable = !!(def && def.stackable);
    if (adapters.invAdd) {
      adapters.invAdd(player, k.id, k.name, k.count, stackable);
    } else if (Array.isArray(player.inventory)) {
      const idx = player.inventory.findIndex(s => s === null);
      if (idx >= 0) player.inventory[idx] = { id: k.id, name: k.name, count: k.count };
    }
  }
}

// ── Main entry point ────────────────────────────────────────────────────────
function onPlayerDeath(player, context) {
  const ctx = context || {};
  const now = adapters.getTick ? adapters.getTick() : 0;
  const deathLocation = ctx.location
    || { region: player.region || DEFAULT_RESPAWN.region, x: player.x, y: player.y };

  // Ironman hook (hardcore downgrade): engine/ironman.js decides whether this
  // player's variant needs to change (hardcore -> ironman on first death) and
  // emits the `hardcore_died` event. Lazy-required to avoid circular deps.
  // The hook runs BEFORE we compute isHardcoreDeath so `player.ironman.variant`
  // still reflects the pre-death state at check time.
  const isIronmanHardcore = !!(player.ironman
    && player.ironman.variant === 'hardcore_ironman'
    && !player.ironman.hardcoreDied);
  try {
    const ironman = require('./ironman');
    if (ironman && typeof ironman.onDeath === 'function') ironman.onDeath(player);
  } catch (_) { /* ironman module not loaded — fine */ }

  // Hardcore: first death = permadeath. Memorial grave, revert mode.
  // Recognises the legacy `hcim` accountMode AND the new ironman.variant.
  const isHardcoreDeath = (!!(player.isHardcore || player.accountMode === 'hcim')
      && !player.hardcoreDead)
    || isIronmanHardcore;

  // Collect and sort items by value desc.
  const allItems = _collectPlayerItems(player);
  allItems.sort((a, b) => {
    if (b.value !== a.value) return b.value - a.value;
    return (a.id | 0) - (b.id | 0);
  });

  // Keep top N.
  const keepCount = hasProtectItem(player) ? KEEP_WITH_PROTECT_ITEM : KEEP_ON_DEATH;
  const kept = allItems.slice(0, keepCount);
  const lost = allItems.slice(keepCount);

  // Strip everything from the player first.
  _stripItems(player);
  // Return the kept items to their inventory.
  _giveKept(player, kept);

  // Drop lost items as a grave (if any).
  let grave = null;
  if (lost.length > 0) {
    const mode = isHardcoreDeath ? 'hcim'
      : (player.accountMode === 'ironman' ? 'ironman' : (player.accountMode || 'normal'));
    grave = placeGrave(player, deathLocation,
      lost.map(l => ({ id: l.id, name: l.name, count: l.count })),
      { mode, memorial: isHardcoreDeath });
  } else if (isHardcoreDeath) {
    // Hardcore always gets a memorial, even if the player was naked.
    grave = placeGrave(player, deathLocation, [], { mode: 'hcim', memorial: true });
  }

  // Reset state + move to respawn point (unless hardcore — the player is done).
  restoreStats(player);
  const respawnPoint = getRespawnPoint(player);
  if (!isHardcoreDeath) {
    if (adapters.setPlayerPosition) {
      adapters.setPlayerPosition(player, respawnPoint);
    } else {
      player.x = respawnPoint.x;
      player.y = respawnPoint.y;
      player.region = respawnPoint.region;
    }
  }

  // Bump death counters and record history.
  player.deathCount = (player.deathCount || 0) + 1;
  if (!Array.isArray(player.deaths)) player.deaths = [];
  player.deaths.push({
    tick: now,
    location: { ...deathLocation },
    keptItemIds: kept.map(k => k.id),
    lostItemIds: lost.map(l => l.id),
    graveId: grave ? grave.id : null,
    killer: ctx.killer ? (ctx.killer.name || ctx.killer.id || null) : null,
    hardcore: isHardcoreDeath,
  });
  if (player.deaths.length > DEATHS_HISTORY_CAP) {
    player.deaths.splice(0, player.deaths.length - DEATHS_HISTORY_CAP);
  }

  // Hardcore account revert.
  if (isHardcoreDeath) {
    player.hardcoreDead = true;
    if (player.accountMode === 'hcim') player.accountMode = null;
    player.isHardcore = false;
  }

  const payload = {
    type: 'death',
    playerId: player.id,
    location: { ...deathLocation },
    keptItemIds: kept.map(k => k.id),
    lostItemIds: lost.map(l => l.id),
    graveId: grave ? grave.id : null,
    hardcore: isHardcoreDeath,
    killer: ctx.killer ? (ctx.killer.name || ctx.killer.id || null) : null,
    tick: now,
  };
  events.emit('death', payload);

  return {
    grave,
    keptItems: kept.map(k => ({ id: k.id, name: k.name, count: k.count, value: k.value })),
    lostItems: lost.map(l => ({ id: l.id, name: l.name, count: l.count, value: l.value })),
    respawnPoint,
    hardcore: isHardcoreDeath,
  };
}

// ── Register hook — production wires adapters + persistence here ────────────
function register(opts) {
  opts = opts || {};
  setAdapters({
    items: opts.items || null,
    prayers: opts.prayers || null,
    ge: opts.ge || null,
    getTick: opts.getTick || (opts.tick && (() => opts.tick.getTick())) || (() => 0),
    invAdd: opts.invAdd || null,
    invRemove: opts.invRemove || null,
    setPlayerPosition: opts.setPlayerPosition || null,
  });
  loadGraves();
  // Auto-save on the persistence cadence.
  if (persistence.onSave) persistence.onSave('death:graves', saveGraves);
  return { tickGraves, onPlayerDeath };
}

// ── Exports ─────────────────────────────────────────────────────────────────
module.exports = {
  // Main API required by the task spec.
  onPlayerDeath, placeGrave, claimGrave, tickGraves,
  getRespawnPoint, restoreStats,
  // Additional API useful for commands + tests.
  setRespawnPoint, getGrave, listGraves,
  saveGraves, loadGraves,
  register, setAdapters,
  hasProtectItem,
  getItemValue,
  // Constants.
  GRAVE_TTL_TICKS, KEEP_ON_DEATH, KEEP_WITH_PROTECT_ITEM, CLAIM_DISTANCE,
  DEFAULT_RESPAWN,
  // Internal state (for tests — do NOT mutate directly in production).
  _graves: graves,
  _resetForTests: () => { graves.clear(); _graveSeq = 0; },
};
