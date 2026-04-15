// ══════════════════════════════════════════════════════════════════════════════
// Highscores — Leaderboards for skills, bosses, CA, diary, clans, ironman
//
// In-memory ranking snapshots with periodic persistence.
//
// Boards:
//   - skill:<name>           top 50 by skill XP
//   - overall                top 50 by total XP
//   - boss:<id>              top 50 by boss kill count
//   - ca                     top 50 by combat achievement points
//   - diary                  top 50 by diary tier completions
//   - clan                   top 50 clans by total member XP
//   - ironman                top 50 ironman-only by skill or overall
//
// Privacy: players with `player.privacy.hiscores_opt_out === true` OR
// `player.account.privacy.appear_on_hiscores === false` are excluded from
// every board.
//
// Update path: call `updatePlayerSnapshot(player)` on any state change
// (XP gain, boss kill, CA complete, diary claim). The snapshot re-evaluates
// every ranking the player appears on. Persistence is deferred to a 5-minute
// flush timer (see `startAutoSave()`).
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const path = require('path');
const fs = require('fs');

let persistence = null;
try { persistence = require('./persistence'); } catch (_) { /* optional */ }

// Skill list mirrors src/player/player.js SKILLS.
const SKILLS = Object.freeze([
  'attack', 'strength', 'defence', 'hitpoints', 'ranged', 'prayer', 'magic',
  'runecrafting', 'construction', 'agility', 'herblore', 'thieving',
  'crafting', 'fletching', 'slayer', 'hunter', 'mining', 'smithing',
  'fishing', 'cooking', 'firemaking', 'woodcutting', 'farming',
]);

const MAX_RANK = 50;

// ── State ────────────────────────────────────────────────────────────────────
// All snapshot data is keyed by boardId → { playerId → entry }. The entry
// shape is { playerId, playerName, value, ironman, variant, clanId, updatedAt }.

const boards = new Map();          // boardId → Map<playerId, entry>
const playerSnapshots = new Map(); // playerId → { name, totalXp, skills, kc, ca, diary, ironman, variant, clanId, updatedAt, optOut }
const clanIndex = new Map();       // clanId → { clanId, name, totalXp, memberCount, updatedAt }

let _autoSaveInterval = null;
let _saveFile = 'highscores.json';

// ── Helpers ──────────────────────────────────────────────────────────────────

function _boardKey(...parts) { return parts.join(':'); }
function _getBoard(id) {
  if (!boards.has(id)) boards.set(id, new Map());
  return boards.get(id);
}

function _isOptedOut(player) {
  if (!player) return true;
  if (player.privacy && player.privacy.hiscores_opt_out === true) return true;
  const acct = player.account;
  if (acct && acct.privacy && acct.privacy.appear_on_hiscores === false) return true;
  return false;
}

function _getVariant(player) {
  if (!player) return null;
  if (player.ironman && player.ironman.variant) return player.ironman.variant;
  if (player.accountMode && player.accountMode !== 'normal') return player.accountMode;
  return null;
}

function _totalXp(player) {
  if (!player || !player.skills) return 0;
  let total = 0;
  for (const s of SKILLS) {
    const e = player.skills[s];
    if (e && typeof e.xp === 'number') total += e.xp;
  }
  return total;
}

function _getSkillXp(player, skill) {
  const e = player && player.skills && player.skills[skill];
  return e && typeof e.xp === 'number' ? e.xp : 0;
}

function _caPoints(player) {
  const ca = player && player.combatAchievements;
  return (ca && ca.totalPoints) | 0;
}

function _diaryPoints(player) {
  // 1 point per claimed tier (easy/medium/hard/elite) per region.
  const d = player && player.diary;
  if (!d) return 0;
  let pts = 0;
  for (const region of Object.keys(d)) {
    const claims = d[region] && d[region].claimed;
    if (!claims) continue;
    for (const tier of Object.keys(claims)) {
      if (claims[tier]) pts++;
    }
  }
  return pts;
}

// ── Snapshot update ──────────────────────────────────────────────────────────

/**
 * updatePlayerSnapshot(player) — called whenever a player's state may change.
 * Rebuilds every board that player appears on.
 */
function updatePlayerSnapshot(player) {
  if (!player || player.id == null) return null;
  const optOut = _isOptedOut(player);
  const variant = _getVariant(player);
  const totalXp = _totalXp(player);
  const clanId = (player.clanId != null) ? player.clanId : null;

  const snap = {
    playerId: player.id,
    playerName: player.name || `player:${player.id}`,
    totalXp,
    variant,
    ironman: !!variant,
    clanId,
    optOut,
    skills: {},
    kc: {},
    ca: _caPoints(player),
    diary: _diaryPoints(player),
    updatedAt: Date.now(),
  };
  for (const s of SKILLS) snap.skills[s] = _getSkillXp(player, s);
  if (player.killCounts) {
    for (const k of Object.keys(player.killCounts)) {
      snap.kc[k] = player.killCounts[k] | 0;
    }
  }
  playerSnapshots.set(player.id, snap);

  if (optOut) {
    // Remove from every board.
    _purgePlayer(player.id);
    return snap;
  }

  // Update all skill boards.
  for (const s of SKILLS) {
    _upsert(_boardKey('skill', s), player.id, snap.skills[s] || 0, snap);
  }
  // Overall board.
  _upsert(_boardKey('overall'), player.id, snap.totalXp, snap);

  // Boss boards.
  for (const bossId of Object.keys(snap.kc)) {
    _upsert(_boardKey('boss', bossId), player.id, snap.kc[bossId] || 0, snap);
  }

  // CA + Diary boards.
  if (snap.ca > 0) _upsert(_boardKey('ca'), player.id, snap.ca, snap);
  if (snap.diary > 0) _upsert(_boardKey('diary'), player.id, snap.diary, snap);

  // Ironman boards (variant-specific + per-skill).
  if (variant) {
    _upsert(_boardKey('ironman', 'overall'), player.id, snap.totalXp, snap);
    for (const s of SKILLS) {
      _upsert(_boardKey('ironman', 'skill', s), player.id, snap.skills[s] || 0, snap);
    }
    // Variant-specific overall (e.g. 'ironman:hardcore_ironman').
    _upsert(_boardKey('ironman', variant), player.id, snap.totalXp, snap);
  }

  return snap;
}

function _upsert(boardId, playerId, value, snap) {
  const b = _getBoard(boardId);
  // Strip anything below threshold only if the board is full.
  b.set(playerId, {
    playerId,
    playerName: snap.playerName,
    value: value | 0,
    ironman: snap.ironman,
    variant: snap.variant,
    clanId: snap.clanId,
    updatedAt: snap.updatedAt,
  });
  // Trim to top MAX_RANK * 2 to avoid unbounded growth — we sort on read.
  if (b.size > MAX_RANK * 4) {
    const sorted = _sortDesc(b);
    const keep = sorted.slice(0, MAX_RANK * 2);
    b.clear();
    for (const e of keep) b.set(e.playerId, e);
  }
}

function _purgePlayer(playerId) {
  for (const b of boards.values()) b.delete(playerId);
}

function _sortDesc(b) {
  return [...b.values()].sort((a, z) => {
    if (z.value !== a.value) return z.value - a.value;
    return a.updatedAt - z.updatedAt; // earlier achiever ranks higher
  });
}

// ── Public API ───────────────────────────────────────────────────────────────

function getSkillRanking(skill, limit = MAX_RANK) {
  if (!SKILLS.includes(skill)) return [];
  const b = boards.get(_boardKey('skill', skill));
  if (!b) return [];
  return _sortDesc(b).slice(0, Math.max(1, limit | 0)).map((e, i) => ({ rank: i + 1, ...e }));
}

function getOverallRanking(limit = MAX_RANK) {
  const b = boards.get(_boardKey('overall'));
  if (!b) return [];
  return _sortDesc(b).slice(0, Math.max(1, limit | 0)).map((e, i) => ({ rank: i + 1, ...e }));
}

function getBossKcRanking(bossId, limit = MAX_RANK) {
  if (!bossId || typeof bossId !== 'string') return [];
  const b = boards.get(_boardKey('boss', bossId));
  if (!b) return [];
  return _sortDesc(b).slice(0, Math.max(1, limit | 0)).map((e, i) => ({ rank: i + 1, ...e }));
}

function getCaRanking(limit = MAX_RANK) {
  const b = boards.get(_boardKey('ca'));
  if (!b) return [];
  return _sortDesc(b).slice(0, Math.max(1, limit | 0)).map((e, i) => ({ rank: i + 1, ...e }));
}

function getDiaryRanking(limit = MAX_RANK) {
  const b = boards.get(_boardKey('diary'));
  if (!b) return [];
  return _sortDesc(b).slice(0, Math.max(1, limit | 0)).map((e, i) => ({ rank: i + 1, ...e }));
}

function getClanRanking(limit = MAX_RANK) {
  const arr = [...clanIndex.values()]
    .filter(c => (c.memberCount | 0) > 0)
    .sort((a, z) => z.totalXp - a.totalXp);
  return arr.slice(0, Math.max(1, limit | 0)).map((e, i) => ({ rank: i + 1, ...e }));
}

/**
 * getIronmanRanking(skill=null, limit=50, variant=null)
 *   - skill null → variant-specific overall (if variant given) else combined ironman overall
 *   - skill 'overall' → combined ironman overall
 *   - skill in SKILLS → per-skill ironman top 50
 *   - variant filters to one specific ironman variant (ironman, hardcore_ironman, etc.)
 */
function getIronmanRanking(skill = null, limit = MAX_RANK, variant = null) {
  let boardId;
  if (skill && skill !== 'overall') {
    if (!SKILLS.includes(skill)) return [];
    boardId = _boardKey('ironman', 'skill', skill);
  } else if (variant) {
    boardId = _boardKey('ironman', variant);
  } else {
    boardId = _boardKey('ironman', 'overall');
  }
  const b = boards.get(boardId);
  if (!b) return [];
  let list = _sortDesc(b);
  if (variant && skill && skill !== 'overall') {
    list = list.filter(e => e.variant === variant);
  }
  return list.slice(0, Math.max(1, limit | 0)).map((e, i) => ({ rank: i + 1, ...e }));
}

/**
 * getPlayerStats(playerId) -> full per-player view across every board the
 * player is in. Returns null if the player has no snapshot.
 */
function getPlayerStats(playerId) {
  const snap = playerSnapshots.get(playerId);
  if (!snap) return null;
  const out = {
    playerId: snap.playerId,
    playerName: snap.playerName,
    totalXp: snap.totalXp,
    ironman: snap.ironman,
    variant: snap.variant,
    clanId: snap.clanId,
    ca: snap.ca,
    diary: snap.diary,
    ranks: {
      overall: _rankOf(_boardKey('overall'), snap.playerId),
      skills: {},
      bosses: {},
      ca: _rankOf(_boardKey('ca'), snap.playerId),
      diary: _rankOf(_boardKey('diary'), snap.playerId),
    },
    skills: Object.assign({}, snap.skills),
    kc: Object.assign({}, snap.kc),
    optOut: snap.optOut,
  };
  for (const s of SKILLS) {
    out.ranks.skills[s] = _rankOf(_boardKey('skill', s), snap.playerId);
  }
  for (const bossId of Object.keys(snap.kc)) {
    out.ranks.bosses[bossId] = _rankOf(_boardKey('boss', bossId), snap.playerId);
  }
  if (snap.ironman) {
    out.ranks.ironman = {
      overall: _rankOf(_boardKey('ironman', 'overall'), snap.playerId),
      skills: {},
    };
    for (const s of SKILLS) {
      out.ranks.ironman.skills[s] = _rankOf(_boardKey('ironman', 'skill', s), snap.playerId);
    }
  }
  return out;
}

function _rankOf(boardId, playerId) {
  const b = boards.get(boardId);
  if (!b) return null;
  const entry = b.get(playerId);
  if (!entry) return null;
  const sorted = _sortDesc(b);
  const idx = sorted.findIndex(e => e.playerId === playerId);
  return idx >= 0 ? { rank: idx + 1, value: entry.value } : null;
}

/**
 * findPlayerByName(name) — case-insensitive lookup into the snapshot index.
 */
function findPlayerByName(name) {
  if (!name) return null;
  const low = String(name).toLowerCase();
  for (const snap of playerSnapshots.values()) {
    if (snap.playerName && snap.playerName.toLowerCase() === low) {
      return snap;
    }
  }
  return null;
}

// ── Clan rankings ────────────────────────────────────────────────────────────

/**
 * updateClanRanking(clan, members)
 *   clan = { id, name }
 *   members = [player, ...] — reads totalXp from each.
 */
function updateClanRanking(clan, members) {
  if (!clan || clan.id == null) return null;
  const members2 = Array.isArray(members) ? members : [];
  let totalXp = 0;
  let memberCount = 0;
  for (const m of members2) {
    if (!m) continue;
    // Prefer using the snapshot (authoritative source); fall back to player.
    const snap = playerSnapshots.get(m.id);
    if (snap && !snap.optOut) {
      totalXp += snap.totalXp;
      memberCount++;
    } else if (m.skills) {
      totalXp += _totalXp(m);
      memberCount++;
    }
  }
  const entry = {
    clanId: clan.id,
    clanName: clan.name || `clan:${clan.id}`,
    totalXp,
    memberCount,
    updatedAt: Date.now(),
  };
  clanIndex.set(clan.id, entry);
  return entry;
}

function removeClan(clanId) {
  clanIndex.delete(clanId);
}

// ── Wiring ───────────────────────────────────────────────────────────────────

/**
 * attachXpListener(breakpoints, getPlayerById)
 *   Subscribe to XP events via events.js. Called once from server bootstrap.
 *   Lightweight: only re-snapshots the affected player.
 */
function attachXpListener(events, getPlayerById) {
  if (!events || typeof events.on !== 'function') return false;
  events.on('xp_gained', 'highscores', (e) => {
    if (!e) return;
    const p = (typeof getPlayerById === 'function') ? getPlayerById(e.playerId) : e.player;
    if (p) updatePlayerSnapshot(p);
  });
  events.on('npc_kill', 'highscores', (e) => {
    if (e && e.player) updatePlayerSnapshot(e.player);
  });
  events.on('combat_achievement', 'highscores', (e) => {
    const p = (typeof getPlayerById === 'function') ? getPlayerById(e && e.playerId) : null;
    if (p) updatePlayerSnapshot(p);
  });
  events.on('diary:tier_claimed', 'highscores', (e) => {
    const p = (typeof getPlayerById === 'function') ? getPlayerById(e && e.playerId) : null;
    if (p) updatePlayerSnapshot(p);
  });
  return true;
}

// ── Persistence (flush every 5 minutes) ──────────────────────────────────────

function serialize() {
  const out = {
    version: 1,
    boards: {},
    snapshots: [],
    clans: [],
  };
  for (const [id, b] of boards.entries()) {
    out.boards[id] = [...b.values()];
  }
  for (const snap of playerSnapshots.values()) out.snapshots.push(snap);
  for (const c of clanIndex.values()) out.clans.push(c);
  return out;
}

function deserialize(data) {
  reset();
  if (!data || typeof data !== 'object') return;
  if (data.boards && typeof data.boards === 'object') {
    for (const id of Object.keys(data.boards)) {
      const rows = data.boards[id];
      if (!Array.isArray(rows)) continue;
      const m = _getBoard(id);
      for (const r of rows) {
        if (r && r.playerId != null) m.set(r.playerId, r);
      }
    }
  }
  if (Array.isArray(data.snapshots)) {
    for (const s of data.snapshots) {
      if (s && s.playerId != null) playerSnapshots.set(s.playerId, s);
    }
  }
  if (Array.isArray(data.clans)) {
    for (const c of data.clans) {
      if (c && c.clanId != null) clanIndex.set(c.clanId, c);
    }
  }
}

function save() {
  if (!persistence) return false;
  try { persistence.save(_saveFile, serialize()); return true; }
  catch (e) { console.error('[highscores] save error', e.message); return false; }
}

function load() {
  if (!persistence) return false;
  try { deserialize(persistence.load(_saveFile, null)); return true; }
  catch (e) { console.error('[highscores] load error', e.message); return false; }
}

function reset() {
  boards.clear();
  playerSnapshots.clear();
  clanIndex.clear();
}

function startAutoSave(ms = 5 * 60 * 1000) {
  if (_autoSaveInterval) return;
  _autoSaveInterval = setInterval(() => { save(); }, ms);
}
function stopAutoSave() {
  if (_autoSaveInterval) { clearInterval(_autoSaveInterval); _autoSaveInterval = null; }
}

// Register as a persist handler so saveAll() flushes us.
if (persistence && typeof persistence.onSave === 'function') {
  persistence.onSave('highscores', save);
}

// ── Stats / helpers ──────────────────────────────────────────────────────────

function listBoards() {
  return [...boards.keys()].sort();
}

function boardSize(boardId) {
  const b = boards.get(boardId);
  return b ? b.size : 0;
}

function stats() {
  return {
    boards: boards.size,
    snapshots: playerSnapshots.size,
    clans: clanIndex.size,
  };
}

module.exports = {
  // Getters.
  getSkillRanking,
  getOverallRanking,
  getBossKcRanking,
  getCaRanking,
  getDiaryRanking,
  getClanRanking,
  getIronmanRanking,
  getPlayerStats,
  findPlayerByName,

  // Updaters.
  updatePlayerSnapshot,
  updateClanRanking,
  removeClan,

  // Wiring.
  attachXpListener,

  // Persistence.
  save, load, serialize, deserialize, reset,
  startAutoSave, stopAutoSave,

  // Meta.
  listBoards, boardSize, stats,

  // Constants.
  SKILLS, MAX_RANK,
};
