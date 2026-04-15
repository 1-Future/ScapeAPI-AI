// ══════════════════════════════════════════════════════════════════════════════
// Clan Bingo
//
// A bingo board is a grid of task tiles. Each tile has a spec that can be
// auto-evaluated (kill boss N times, gather N resource, complete quest X) or
// submitted manually. The board is 5x5 or 7x7 by default.
//
// Win conditions (each triggers a separate reward pool):
//   line     — any row, column, or diagonal
//   bingo    — same as line (alias)
//   full     — every tile claimed (blackout/full-house)
//
// Only one active bingo per clan at a time. A claim is logged against the
// claiming player for contribution tracking.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const clan = require('./clan');
const events = require('./events');

const ALLOWED_SIZES = Object.freeze([3, 4, 5, 7]);

/**
 * startBingo(clanObj, by, spec)
 * spec: { size: 5|7, tiles: [...], durationMs?, winCondition? }
 *   tiles can be fewer than size*size — remaining cells become free auto-claimed.
 */
function startBingo(clanObj, by, spec) {
  if (!clanObj || clanObj.disbanded) return { ok: false, error: 'Clan not found.' };
  if (!clan.canDo(clanObj, by, 'startBingo')) return { ok: false, error: 'Insufficient rank to start bingo.' };
  if (clanObj.bingo && clanObj.bingo.active) return { ok: false, error: 'A bingo is already active.' };

  spec = spec || {};
  const size = ALLOWED_SIZES.includes(spec.size | 0) ? (spec.size | 0) : 5;
  const tilesIn = Array.isArray(spec.tiles) ? spec.tiles : [];
  const cells = size * size;
  const tiles = [];
  for (let i = 0; i < cells; i++) {
    const raw = tilesIn[i] || { id: `cell-${i}`, name: `Free ${i}`, free: true };
    tiles.push({
      id: raw.id || `cell-${i}`,
      name: raw.name || `Task ${i}`,
      description: raw.description || '',
      metric: raw.metric || null,           // e.g. { type: 'bossKC', bossId: 'zulrah', count: 10 }
      claimed: !!raw.free,
      claimedBy: raw.free ? null : null,
      claimedAt: raw.free ? Date.now() : null,
      auto: !!raw.auto,
    });
  }
  clanObj.bingo = {
    active: true,
    size,
    tiles,
    winCondition: spec.winCondition || 'line',
    prize: spec.prize || { coins: 0 },
    startedAt: Date.now(),
    startedBy: by,
    durationMs: spec.durationMs || (7 * 24 * 60 * 60 * 1000),
    winners: [],
    winsByType: { line: null, full: null },
  };
  events.emit('clan:bingo_started', { clanId: clanObj.id, by, size });
  return { ok: true, bingo: clanObj.bingo };
}

/**
 * claimBingoTile(clanObj, player, tileId) — the player claims a tile. In a
 * production build the server bootstrap wires the metric evaluator. Here we
 * allow a manual claim if the tile is not auto-only, and leave the validator
 * as a hook the server attaches.
 */
function claimBingoTile(clanObj, player, tileId) {
  if (!clanObj || clanObj.disbanded) return { ok: false, error: 'Clan not found.' };
  if (!clan.findMember(clanObj, player.id)) return { ok: false, error: 'Not a member.' };
  const b = clanObj.bingo;
  if (!b || !b.active) return { ok: false, error: 'No active bingo.' };
  const tile = b.tiles.find(t => t.id === tileId);
  if (!tile) return { ok: false, error: 'Unknown tile.' };
  if (tile.claimed) return { ok: false, error: 'Tile already claimed.' };

  tile.claimed = true;
  tile.claimedBy = player.id;
  tile.claimedAt = Date.now();

  // Award contribution points to the claimer.
  const m = clan.findMember(clanObj, player.id);
  if (m) m.contributionPoints += 5;

  events.emit('clan:bingo_claimed', { clanId: clanObj.id, tileId, playerId: player.id });

  // Check win conditions.
  const lineFirst = checkLineWin(b);
  let lineResult = null;
  if (lineFirst && !b.winsByType.line) {
    b.winsByType.line = { at: Date.now(), kind: lineFirst.kind, idx: lineFirst.idx, cells: lineFirst.cells, prize: b.prize.coins || 0 };
    clanObj.treasury.coins += (b.prize.coins || 0);
    clanObj.wins.bingo = (clanObj.wins.bingo | 0) + 1;
    events.emit('clan:bingo_line', { clanId: clanObj.id, line: lineFirst });
    lineResult = b.winsByType.line;
  }
  const fullWin = checkFullHouse(b);
  let fullResult = null;
  if (fullWin && !b.winsByType.full) {
    b.winsByType.full = { at: Date.now(), prize: (b.prize.coins || 0) * 2 };
    clanObj.treasury.coins += ((b.prize.coins || 0) * 2);
    b.active = false;
    events.emit('clan:bingo_full', { clanId: clanObj.id });
    fullResult = b.winsByType.full;
  }

  return { ok: true, tile, line: lineResult, full: fullResult };
}

/**
 * endBingo(clanObj, by) — early end by leadership.
 */
function endBingo(clanObj, by) {
  if (!clanObj || clanObj.disbanded) return { ok: false, error: 'Clan not found.' };
  if (!clan.canDo(clanObj, by, 'startBingo')) return { ok: false, error: 'Insufficient rank.' };
  if (!clanObj.bingo || !clanObj.bingo.active) return { ok: false, error: 'No active bingo.' };
  clanObj.bingo.active = false;
  clanObj.bingo.endedAt = Date.now();
  clanObj.bingo.endedBy = by;
  events.emit('clan:bingo_ended', { clanId: clanObj.id });
  return { ok: true };
}

/**
 * checkLineWin(bingo) — returns the first line (array of indexes) that is
 * fully claimed, or null.
 */
function checkLineWin(bingo) {
  const n = bingo.size;
  const grid = bingo.tiles;
  // Rows.
  for (let r = 0; r < n; r++) {
    let all = true;
    const idxs = [];
    for (let c = 0; c < n; c++) {
      const i = r * n + c;
      idxs.push(i);
      if (!grid[i].claimed) { all = false; break; }
    }
    if (all) return { kind: 'row', idx: r, cells: idxs };
  }
  // Columns.
  for (let c = 0; c < n; c++) {
    let all = true;
    const idxs = [];
    for (let r = 0; r < n; r++) {
      const i = r * n + c;
      idxs.push(i);
      if (!grid[i].claimed) { all = false; break; }
    }
    if (all) return { kind: 'col', idx: c, cells: idxs };
  }
  // Diagonals.
  let all = true, idxs = [];
  for (let i = 0; i < n; i++) {
    const idx = i * n + i;
    idxs.push(idx);
    if (!grid[idx].claimed) { all = false; break; }
  }
  if (all) return { kind: 'diag', idx: 0, cells: idxs };
  all = true; idxs = [];
  for (let i = 0; i < n; i++) {
    const idx = i * n + (n - 1 - i);
    idxs.push(idx);
    if (!grid[idx].claimed) { all = false; break; }
  }
  if (all) return { kind: 'anti', idx: 0, cells: idxs };
  return null;
}

function checkFullHouse(bingo) {
  for (const t of bingo.tiles) if (!t.claimed) return false;
  return true;
}

/**
 * bingoStatus(clanObj) — snapshot for display.
 */
function bingoStatus(clanObj) {
  if (!clanObj.bingo) return { active: false };
  const b = clanObj.bingo;
  const claimed = b.tiles.filter(t => t.claimed).length;
  return {
    active: b.active,
    size: b.size,
    tiles: b.tiles.slice(),
    claimed,
    total: b.tiles.length,
    winCondition: b.winCondition,
    startedAt: b.startedAt,
    durationMs: b.durationMs,
    winsByType: { ...b.winsByType },
  };
}

module.exports = {
  startBingo, claimBingoTile, endBingo, bingoStatus,
  checkLineWin, checkFullHouse,
  ALLOWED_SIZES,
};
