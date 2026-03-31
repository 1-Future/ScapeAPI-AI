// ── Tile System (1.2) + Chunks (1.3) + Layers (1.4) ──────────────────────────
// Infinite 2D grid, chunked for storage, multiple layers

const persistence = require('../engine/persistence');

const CHUNK_SIZE = 64;

// Tile types
const T = {
  EMPTY: 0, GRASS: 1, WATER: 2, TREE: 3, PATH: 4, ROCK: 5,
  SAND: 6, WALL: 7, FLOOR: 8, DOOR: 9, BRIDGE: 10,
  FISH_SPOT: 11, FLOWER: 12, BUSH: 13, DARK_GRASS: 14,
  SNOW: 15, LAVA: 16, SWAMP: 17, CUSTOM: 99,
};

const TILE_NAMES = {};
for (const [k, v] of Object.entries(T)) TILE_NAMES[v] = k.toLowerCase();

// Walkability
const UNWALKABLE = new Set([T.WATER, T.TREE, T.ROCK, T.WALL, T.LAVA]);

// Speed modifiers (1.0 = normal)
const SPEED_MOD = { [T.SAND]: 0.5, [T.SWAMP]: 0.5, [T.PATH]: 1.0, [T.SNOW]: 0.75 };

// Chunks: Map<"layer_cx_cy", Uint8Array(CHUNK_SIZE*CHUNK_SIZE)>
const chunks = new Map();

function chunkKey(cx, cy, layer = 0) { return `${layer}_${cx}_${cy}`; }
function tileToChunk(x) { return Math.floor(x / CHUNK_SIZE); }
function localXY(wx, wy) {
  return [((wx % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE, ((wy % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE];
}

function getOrCreateChunk(cx, cy, layer = 0) {
  const key = chunkKey(cx, cy, layer);
  if (!chunks.has(key)) {
    chunks.set(key, new Uint8Array(CHUNK_SIZE * CHUNK_SIZE));
  }
  return chunks.get(key);
}

function tileAt(x, y, layer = 0) {
  const cx = tileToChunk(x), cy = tileToChunk(y);
  const key = chunkKey(cx, cy, layer);
  const chunk = chunks.get(key);
  if (!chunk) return T.EMPTY;
  const [lx, ly] = localXY(x, y);
  return chunk[ly * CHUNK_SIZE + lx];
}

function setTile(x, y, tile, layer = 0) {
  const cx = tileToChunk(x), cy = tileToChunk(y);
  const chunk = getOrCreateChunk(cx, cy, layer);
  const [lx, ly] = localXY(x, y);
  chunk[ly * CHUNK_SIZE + lx] = tile;
}

function isWalkable(x, y, layer = 0) {
  const tile = tileAt(x, y, layer);
  return !UNWALKABLE.has(tile);
}

function getSpeedMod(x, y, layer = 0) {
  return SPEED_MOD[tileAt(x, y, layer)] || 1.0;
}

function getTileName(tile) {
  return TILE_NAMES[tile] || 'unknown';
}

// Regions / Areas (1.5)
const areas = new Map(); // id → { name, x1, y1, x2, y2, layer, properties }

function defineArea(id, opts) {
  areas.set(id, { name: opts.name, x1: opts.x1, y1: opts.y1, x2: opts.x2, y2: opts.y2, layer: opts.layer || 0, ...opts });
}

function getArea(x, y, layer = 0) {
  for (const [id, a] of areas) {
    if (a.layer !== undefined && a.layer !== layer) continue;
    if (x >= a.x1 && x <= a.x2 && y >= a.y1 && y <= a.y2) return { id, ...a };
  }
  return null;
}

// Persistence
function saveChunks() {
  const data = {};
  for (const [key, chunk] of chunks) {
    data[key] = Array.from(chunk);
  }
  persistence.save('chunks.json', data);
}

function loadChunks() {
  const data = persistence.load('chunks.json', {});
  for (const [key, arr] of Object.entries(data)) {
    chunks.set(key, new Uint8Array(arr));
  }
  console.log(`[world] Loaded ${chunks.size} chunks`);
}

function saveAreas() {
  const data = {};
  for (const [id, a] of areas) data[id] = a;
  persistence.save('areas.json', data);
}

function loadAreas() {
  const data = persistence.load('areas.json', {});
  for (const [id, a] of Object.entries(data)) areas.set(id, a);
  console.log(`[world] Loaded ${areas.size} areas`);
}

// Create spawn island
function createSpawn(x = 100, y = 100) {
  for (let dx = -5; dx <= 5; dx++) {
    for (let dy = -5; dy <= 5; dy++) {
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= 5) setTile(x + dx, y + dy, dist <= 3 ? T.GRASS : T.SAND);
    }
  }
  setTile(x, y, T.PATH); // center marker
  defineArea('spawn', { name: 'Spawn Island', x1: x - 5, y1: y - 5, x2: x + 5, y2: y + 5, safe: true });
}

module.exports = {
  T, TILE_NAMES, CHUNK_SIZE, UNWALKABLE,
  tileAt, setTile, isWalkable, getSpeedMod, getTileName,
  defineArea, getArea, areas,
  saveChunks, loadChunks, saveAreas, loadAreas,
  createSpawn,
};
