// ══════════════════════════════════════════════════════════════════════════════
// Collection Log (engine module)
// Tracks unique drops per source ("have you gotten the Twisted Bow yet?").
// Static catalogue lives in data/collection-log.json. Player progress lives in
// player.collectionLog = { [sourceId]: [itemId, ...] }.
//
// Hooks the drop-resolution pipeline via events ('drop_resolved'), but also
// exposes a direct registerEntry() the combat/loot code can call.
//
// Manifesto P06 (permanent progress): every unique drop is etched in the log
// forever. Manifesto P08 (breakpoint progression): completing a source grants
// a cosmetic + title — a discrete, visible milestone.
// ══════════════════════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');

let events = null;
try { events = require('./events'); } catch (_) { events = null; }

let CATALOGUE = null;
let CATALOGUE_PATH = path.join(__dirname, '..', '..', 'data', 'collection-log.json');

// ── Catalogue load ────────────────────────────────────────────────────────────

function loadCatalogue(filepath) {
  if (filepath) CATALOGUE_PATH = filepath;
  if (!fs.existsSync(CATALOGUE_PATH)) {
    console.warn('[collection-log] Catalogue file missing at ' + CATALOGUE_PATH);
    CATALOGUE = { sources: [] };
    return CATALOGUE;
  }
  try {
    const raw = fs.readFileSync(CATALOGUE_PATH, 'utf8');
    CATALOGUE = JSON.parse(raw);
    if (!CATALOGUE.sources) CATALOGUE.sources = [];
  } catch (err) {
    console.error('[collection-log] Failed to parse catalogue: ' + err.message);
    CATALOGUE = { sources: [] };
  }
  return CATALOGUE;
}

function getCatalogue() {
  if (!CATALOGUE) loadCatalogue();
  return CATALOGUE;
}

function getSource(sourceId) {
  const cat = getCatalogue();
  return cat.sources.find(s => s.id === sourceId) || null;
}

function listSources() {
  return getCatalogue().sources.slice();
}

// ── Player state helpers ──────────────────────────────────────────────────────

function ensurePlayerLog(player) {
  if (!player) throw new Error('collection-log: player is required');
  if (!player.collectionLog || typeof player.collectionLog !== 'object') {
    player.collectionLog = {};
  }
  if (!player.collectionLogRewards || !Array.isArray(player.collectionLogRewards)) {
    player.collectionLogRewards = [];
  }
  return player.collectionLog;
}

// ── Public API ────────────────────────────────────────────────────────────────

// Register a single drop event. Idempotent — adding an already-owned item
// returns { added: false }. Returns { added, justCompleted, reward } so the
// caller can react to milestone completion.
function registerEntry(player, sourceId, itemId) {
  const log = ensurePlayerLog(player);
  const source = getSource(sourceId);
  if (!source) {
    return { added: false, justCompleted: false, reward: null, reason: 'unknown_source' };
  }
  // Normalise itemId (allow numeric or string)
  const tracked = source.items.find(i => i.id === itemId || i.id === Number(itemId) || String(i.id) === String(itemId));
  if (!tracked) {
    return { added: false, justCompleted: false, reward: null, reason: 'item_not_in_source' };
  }
  if (!log[sourceId]) log[sourceId] = [];
  if (log[sourceId].some(id => id === tracked.id || String(id) === String(tracked.id))) {
    return { added: false, justCompleted: false, reward: null, reason: 'already_owned' };
  }
  log[sourceId].push(tracked.id);
  const justCompleted = isComplete(player, sourceId) && !player.collectionLogRewards.includes(sourceId);
  let reward = null;
  if (justCompleted) {
    reward = source.completionReward || null;
    player.collectionLogRewards.push(sourceId);
    if (events && events.emit) {
      events.emit('collection_log_completed', { player, sourceId, source, reward });
    }
  }
  if (events && events.emit) {
    events.emit('collection_log_entry', { player, sourceId, itemId: tracked.id, source });
  }
  return { added: true, justCompleted, reward };
}

// Per-source progress
function getProgress(player, sourceId) {
  const log = ensurePlayerLog(player);
  const source = getSource(sourceId);
  if (!source) return null;
  const owned = (log[sourceId] || []).slice();
  const ownedSet = new Set(owned.map(String));
  const ownedItems = source.items.filter(i => ownedSet.has(String(i.id)));
  const missing = source.items.filter(i => !ownedSet.has(String(i.id)));
  const total = source.items.length;
  const pct = total === 0 ? 100 : Math.round((ownedItems.length / total) * 1000) / 10;
  return {
    sourceId,
    name: source.name,
    category: source.category,
    owned: ownedItems,
    missing,
    pct,
    complete: missing.length === 0 && total > 0,
  };
}

// Full log summary (per-source completion stats + grand totals)
function getLog(player) {
  ensurePlayerLog(player);
  const sources = listSources().map(s => {
    const prog = getProgress(player, s.id);
    return {
      id: s.id,
      name: s.name,
      category: s.category,
      ownedCount: prog.owned.length,
      totalCount: s.items.length,
      pct: prog.pct,
      complete: prog.complete,
    };
  });
  const totalUnique = sources.reduce((sum, s) => sum + s.totalCount, 0);
  const ownedUnique = sources.reduce((sum, s) => sum + s.ownedCount, 0);
  return {
    sources,
    totals: {
      sources: sources.length,
      sourcesComplete: sources.filter(s => s.complete).length,
      uniqueItemsOwned: ownedUnique,
      uniqueItemsTotal: totalUnique,
      pct: totalUnique === 0 ? 0 : Math.round((ownedUnique / totalUnique) * 1000) / 10,
    },
  };
}

function isComplete(player, sourceId) {
  const prog = getProgress(player, sourceId);
  if (!prog) return false;
  return prog.complete;
}

// Returns the list of sources the player has fully completed, with their reward.
function completionRewards(player) {
  ensurePlayerLog(player);
  const out = [];
  for (const source of listSources()) {
    if (isComplete(player, source.id)) {
      out.push({
        sourceId: source.id,
        name: source.name,
        category: source.category,
        reward: source.completionReward || null,
        claimed: player.collectionLogRewards.includes(source.id),
      });
    }
  }
  return out;
}

// Mark an existing-completion as claimed (no-op for new-style register flow,
// kept for migrations and admin tooling).
function claimReward(player, sourceId) {
  ensurePlayerLog(player);
  if (!isComplete(player, sourceId)) return false;
  if (player.collectionLogRewards.includes(sourceId)) return false;
  player.collectionLogRewards.push(sourceId);
  return true;
}

// ── Engine plugin entry point ─────────────────────────────────────────────────

function register(engine) {
  loadCatalogue();
  if (engine && engine.events && engine.events.on) {
    // Bridge: when the loot system emits a drop, fan it through the log.
    engine.events.on('drop_resolved', 'collection-log', ({ player, sourceId, itemId }) => {
      if (player && sourceId != null && itemId != null) {
        registerEntry(player, sourceId, itemId);
      }
    });
  }
  return module.exports;
}

module.exports = {
  register,
  loadCatalogue,
  getCatalogue,
  getSource,
  listSources,
  registerEntry,
  getLog,
  getProgress,
  isComplete,
  completionRewards,
  claimReward,
};
