// ── Tile Map Loader (region-scoped, on-disk JSON format) ─────────────────────
// This module loads the static, designer-authored tile maps in data/tilemaps/.
// It is the spec the future 2D renderer consumes, plus a Node-side accessor
// so the engine can validate positions, enforce walls, resolve area IDs, etc.
//
// Storage convention (one file per region):
//   data/tilemaps/{regionId}.json  →  see schema in module docstring below.
//
// Wall encoding follows src/world/walls.js — bitmask edges per tile:
//   N=1, E=2, S=4, W=8, DIAG_NE=16, DIAG_NW=32
//
// Coordinates inside a region are LOCAL (0..width-1, 0..height-1). Translation
// to world coordinates is the engine's job (see src/content/aelgard/world-layout.js).
// ─────────────────────────────────────────────────────────────────────────────

'use strict';

const fs = require('fs');
const path = require('path');

const TILEMAPS_DIR = path.join(__dirname, '..', '..', 'data', 'tilemaps');

// Mirror of walls.js EDGE — kept local so this module has no runtime dependency
// on the live walls singleton. The on-disk format is a sparse {x,y,mask} list.
const EDGE = { N: 1, E: 2, S: 4, W: 8, DIAG_NE: 16, DIAG_NW: 32 };
const OPPOSITE = { 1: 4, 4: 1, 2: 8, 8: 2 };

// Cache of loaded region maps.
const regionCache = new Map();

// ─── RegionMap class ──────────────────────────────────────────────────────────

class RegionMap {
  constructor(raw) {
    this.id = raw.id;
    this.name = raw.name;
    this.width = raw.width;
    this.height = raw.height;
    this.tileLegend = raw.tile_legend || {};
    this.audioZone = raw.audio_zone || null;
    this.musicZone = raw.music_zone || null;

    // Tile grid — accept either string-of-rows or 2d array. Store as Uint8Array.
    this.tiles = decodeTiles(raw.tiles, raw.width, raw.height);

    // Build walkability lookup from legend. Legend keys are base-36 strings
    // (so int 10 → "a"); fall back to plain int string for legacy formats.
    this.walkable = new Uint8Array(raw.width * raw.height);
    for (let i = 0; i < this.tiles.length; i++) {
      const entry = this._legendFor(this.tiles[i]);
      this.walkable[i] = entry && entry.walkable ? 1 : 0;
    }

    // Areas — array of axis-aligned rects.
    this.areas = (raw.areas || []).map(a => ({ ...a }));

    // Landmarks — point features with sprites.
    this.landmarks = (raw.landmarks || []).map(l => ({ ...l }));

    // Spawn points — name → {x,y,kind?}
    this.spawnPoints = {};
    for (const [k, v] of Object.entries(raw.spawn_points || {})) {
      if (typeof v === 'object' && v !== null) this.spawnPoints[k] = { ...v };
    }

    // Walls — sparse list of {x1,y1,x2,y2,type}. We index by source tile + edge.
    this.walls = (raw.walls || []).map(w => ({ ...w }));
    this.wallEdgeMap = new Map(); // "x_y" → bitmask
    for (const w of this.walls) {
      this._applyWallSegment(w);
    }

    // Doors — same structure, separately indexed so renderers can show them.
    // We mirror the door across both adjacent tiles so isEdgeBlocked() finds
    // the open edge regardless of approach direction (matches walls.js).
    this.doors = (raw.doors || []).map(d => ({ ...d }));
    this.doorEdgeMap = new Map();
    for (const d of this.doors) {
      const k = `${d.x}_${d.y}`;
      this.doorEdgeMap.set(k, (this.doorEdgeMap.get(k) || 0) | (d.edge || 0));
      // Mirror to the neighbour tile.
      const mirror = mirrorEdge(d.x, d.y, d.edge || 0);
      if (mirror) {
        const mk = `${mirror.x}_${mirror.y}`;
        this.doorEdgeMap.set(mk, (this.doorEdgeMap.get(mk) || 0) | mirror.edge);
      }
    }

    // Lazy-built reverse spawn index by entity prefix (e.g. "npc_", "player_").
    this._spawnsByType = null;
  }

  // ─── Tile accessors ─────────────────────────────────────────────────────────

  inBounds(x, y) {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

  tileAt(x, y) {
    if (!this.inBounds(x, y)) return null;
    const tile = this.tiles[y * this.width + x];
    const legend = this._legendFor(tile) || {};
    return {
      x,
      y,
      tile,
      name: legend.name || 'unknown',
      sprite: legend.sprite || null,
      walkable: !!legend.walkable,
      areaId: this.areaAt(x, y),
      objects: this.objectsAt(x, y),
      walls: this.wallEdgeMap.get(`${x}_${y}`) || 0,
      doors: this.doorEdgeMap.get(`${x}_${y}`) || 0,
    };
  }

  _legendFor(tile) {
    // Legend keys may be either base-36 chars ("0".."9","a".."z") or stringified
    // ints. Try both so authors can use either form.
    return this.tileLegend[encodeTileChar(tile)] || this.tileLegend[String(tile)] || null;
  }

  isWalkable(x, y) {
    if (!this.inBounds(x, y)) return false;
    return this.walkable[y * this.width + x] === 1;
  }

  // Returns area id of the SMALLEST containing area (or null). Smaller areas
  // are typically named sub-zones (eg "saltbrine_harbour") nested inside the
  // region (eg "saltbrine"). Smallest-wins lets sub-zones override the parent.
  areaAt(x, y) {
    let best = null;
    let bestSize = Infinity;
    for (const a of this.areas) {
      if (x < a.x0 || x > a.x1 || y < a.y0 || y > a.y1) continue;
      const size = (a.x1 - a.x0 + 1) * (a.y1 - a.y0 + 1);
      if (size < bestSize) { best = a.id; bestSize = size; }
    }
    return best;
  }

  // Landmarks that occupy this exact tile (point features). The engine treats
  // these as static "objects" — banks, anvils, doors, NPC posts, etc.
  objectsAt(x, y) {
    return this.landmarks.filter(l => l.x === x && l.y === y);
  }

  // ─── Spawn lookups ──────────────────────────────────────────────────────────

  // type can be "player", "npc", "monster", "boss", or any prefix used in
  // the spawn_points keys. Returns array of {x, y, key, ...meta}.
  findSpawns(type) {
    if (!this._spawnsByType) this._buildSpawnsIndex();
    const prefix = type.endsWith('_') ? type : `${type}_`;
    const out = [];
    for (const [key, sp] of Object.entries(this.spawnPoints)) {
      if (key.startsWith(prefix) || key === type) {
        out.push({ key, ...sp });
      }
    }
    return out;
  }

  _buildSpawnsIndex() {
    // Simple presence flag — actual filtering is done by findSpawns above.
    // Reserved for future bucketing if spawn lists grow large.
    this._spawnsByType = true;
  }

  // ─── Pathfinding helpers ────────────────────────────────────────────────────

  // 8-direction neighbours that are walkable and not blocked by a wall edge.
  neighbors(x, y) {
    const out = [];
    const dirs = [
      [0, -1, EDGE.N], [0, 1, EDGE.S], [-1, 0, EDGE.W], [1, 0, EDGE.E],
      [-1, -1, EDGE.DIAG_NW], [1, -1, EDGE.DIAG_NE], [-1, 1, 0], [1, 1, 0],
    ];
    for (const [dx, dy, edge] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!this.inBounds(nx, ny)) continue;
      if (!this.isWalkable(nx, ny)) continue;
      if (this._edgeBlocks(x, y, nx, ny)) continue;
      // For diagonal moves, also reject if both cardinal pivots are blocked.
      if (Math.abs(dx) === 1 && Math.abs(dy) === 1) {
        if (!this.isWalkable(x + dx, y) && !this.isWalkable(x, y + dy)) continue;
      }
      out.push({ x: nx, y: ny });
    }
    return out;
  }

  _edgeBlocks(fx, fy, tx, ty) {
    const dx = tx - fx, dy = ty - fy;
    let edge = 0;
    if (dy === -1 && dx === 0) edge = EDGE.N;
    else if (dy === 1 && dx === 0) edge = EDGE.S;
    else if (dx === 1 && dy === 0) edge = EDGE.E;
    else if (dx === -1 && dy === 0) edge = EDGE.W;
    else return false; // diagonals: handled by cardinal checks elsewhere
    const fromMask = this.wallEdgeMap.get(`${fx}_${fy}`) || 0;
    const toMask = this.wallEdgeMap.get(`${tx}_${ty}`) || 0;
    const opp = OPPOSITE[edge] || 0;
    const fromDoor = this.doorEdgeMap.get(`${fx}_${fy}`) || 0;
    const toDoor = this.doorEdgeMap.get(`${tx}_${ty}`) || 0;
    if ((fromMask & edge) && !(fromDoor & edge)) return true;
    if (opp && (toMask & opp) && !(toDoor & opp)) return true;
    return false;
  }

  // BFS reachability — used by tests to verify there's no orphaned bank tile.
  // Returns the set of "x_y" keys reachable from (sx, sy) within `maxNodes`.
  reachableFrom(sx, sy, maxNodes = 65536) {
    const seen = new Set();
    if (!this.inBounds(sx, sy) || !this.isWalkable(sx, sy)) return seen;
    const queue = [[sx, sy]];
    seen.add(`${sx}_${sy}`);
    while (queue.length && seen.size < maxNodes) {
      const [cx, cy] = queue.shift();
      for (const n of this.neighbors(cx, cy)) {
        const key = `${n.x}_${n.y}`;
        if (seen.has(key)) continue;
        seen.add(key);
        queue.push([n.x, n.y]);
      }
    }
    return seen;
  }

  // ─── Wall application (used during construction) ────────────────────────────

  _applyWallSegment(seg) {
    // A segment is a straight horizontal or vertical run; we expand it into
    // per-tile edge masks.
    const { x1, y1, x2, y2 } = seg;
    if (x1 === x2) {
      // Vertical wall — sits on the WEST edge of column x1, between y1..y2.
      const a = Math.min(y1, y2), b = Math.max(y1, y2);
      for (let y = a; y < b; y++) {
        this._or(x1, y, EDGE.W);
        if (x1 > 0) this._or(x1 - 1, y, EDGE.E);
      }
    } else if (y1 === y2) {
      // Horizontal wall — sits on the NORTH edge of row y1, between x1..x2.
      const a = Math.min(x1, x2), b = Math.max(x1, x2);
      for (let x = a; x < b; x++) {
        this._or(x, y1, EDGE.N);
        if (y1 > 0) this._or(x, y1 - 1, EDGE.S);
      }
    }
  }

  _or(x, y, mask) {
    const k = `${x}_${y}`;
    this.wallEdgeMap.set(k, (this.wallEdgeMap.get(k) || 0) | mask);
  }

  // ─── Serialization (lossless round-trip) ────────────────────────────────────

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      width: this.width,
      height: this.height,
      tile_legend: this.tileLegend,
      tiles: encodeTiles(this.tiles, this.width, this.height),
      areas: this.areas,
      landmarks: this.landmarks,
      spawn_points: this.spawnPoints,
      walls: this.walls,
      doors: this.doors,
      audio_zone: this.audioZone,
      music_zone: this.musicZone,
    };
  }
}

// ─── Tile encoding helpers ────────────────────────────────────────────────────

// Decode either format (array of strings, array-of-arrays of ints, or flat array)
// into a flat Uint8Array of length width*height.
function decodeTiles(input, width, height) {
  const out = new Uint8Array(width * height);
  if (typeof input === 'string') {
    // Single string with newlines.
    const rows = input.split(/\r?\n/);
    for (let y = 0; y < height && y < rows.length; y++) {
      const row = rows[y];
      for (let x = 0; x < width && x < row.length; x++) {
        out[y * width + x] = parseTileChar(row[x]);
      }
    }
  } else if (Array.isArray(input)) {
    if (input.length > 0 && typeof input[0] === 'string') {
      // Array of row strings.
      for (let y = 0; y < height && y < input.length; y++) {
        const row = input[y];
        for (let x = 0; x < width && x < row.length; x++) {
          out[y * width + x] = parseTileChar(row[x]);
        }
      }
    } else if (input.length > 0 && Array.isArray(input[0])) {
      // 2D array — accept either ints or chars (chars decoded via base-36).
      for (let y = 0; y < height && y < input.length; y++) {
        const row = input[y];
        for (let x = 0; x < width && x < row.length; x++) {
          const v = row[x];
          out[y * width + x] = (typeof v === 'string') ? parseTileChar(v) : v;
        }
      }
    } else {
      // Flat int array.
      for (let i = 0; i < input.length && i < out.length; i++) out[i] = input[i];
    }
  }
  return out;
}

// Mirror an edge across to the neighbouring tile (same physical wall edge).
function mirrorEdge(x, y, edge) {
  if (edge === EDGE.N) return { x, y: y - 1, edge: EDGE.S };
  if (edge === EDGE.S) return { x, y: y + 1, edge: EDGE.N };
  if (edge === EDGE.E) return { x: x + 1, y, edge: EDGE.W };
  if (edge === EDGE.W) return { x: x - 1, y, edge: EDGE.E };
  return null;
}

// Tile chars use base-36 (0-9 + a-z) for compactness — supports legend keys 0..35.
function parseTileChar(c) {
  if (!c || c === ' ') return 0;
  const n = parseInt(c, 36);
  return isNaN(n) ? 0 : n;
}

function encodeTileChar(n) {
  if (n < 0 || n > 35) return '0';
  return n.toString(36);
}

// Encode flat tile array back into row-strings. Lossless round-trip with decode.
function encodeTiles(tiles, width, height) {
  const rows = [];
  for (let y = 0; y < height; y++) {
    let row = '';
    for (let x = 0; x < width; x++) row += encodeTileChar(tiles[y * width + x]);
    rows.push(row);
  }
  return rows;
}

// ─── Public loader API ────────────────────────────────────────────────────────

function loadRegion(regionId) {
  if (regionCache.has(regionId)) return regionCache.get(regionId);
  const file = path.join(TILEMAPS_DIR, `${regionId}.json`);
  if (!fs.existsSync(file)) {
    throw new Error(`tilemap not found: ${file}`);
  }
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  const map = new RegionMap(raw);
  regionCache.set(regionId, map);
  return map;
}

function loadAllRegions() {
  if (!fs.existsSync(TILEMAPS_DIR)) return new Map();
  const out = new Map();
  for (const file of fs.readdirSync(TILEMAPS_DIR)) {
    if (!file.endsWith('.json')) continue;
    const id = file.replace(/\.json$/, '');
    out.set(id, loadRegion(id));
  }
  return out;
}

function clearCache() { regionCache.clear(); }

function listRegionIds() {
  if (!fs.existsSync(TILEMAPS_DIR)) return [];
  return fs.readdirSync(TILEMAPS_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace(/\.json$/, ''));
}

module.exports = {
  RegionMap,
  EDGE,
  loadRegion,
  loadAllRegions,
  listRegionIds,
  clearCache,
  TILEMAPS_DIR,
  // exposed for tests + tooling:
  decodeTiles,
  encodeTiles,
  encodeTileChar,
  parseTileChar,
};
