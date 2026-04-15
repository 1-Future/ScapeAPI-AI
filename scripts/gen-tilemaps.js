#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// gen-tilemaps.js — one-off procedural generator for the 9 Aelgard region maps.
//
// Produces data/tilemaps/{region}.json. Re-running overwrites them. Hand-edit
// landmarks/spawn_points after generation if you want to nudge specific tiles;
// the loader treats the JSON as canonical going forward.
//
// Layout per region (all local coords):
//   - 64x64 grid, base terrain matching the regional flavor
//   - Path network connecting town center to ~5 named landmarks
//   - Buildings rendered as enclosed wall rectangles with a door tile
//   - Spawn points pulled from src/content/aelgard/world-layout.js NPC list
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'data', 'tilemaps');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// ─── Deterministic seeded RNG so re-generation produces stable output ─────────
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// EDGE bitmask (must match src/world/tilemap.js)
const EDGE = { N: 1, E: 2, S: 4, W: 8 };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeGrid(w, h, fillKey) {
  const g = new Array(h);
  for (let y = 0; y < h; y++) {
    g[y] = new Array(w).fill(fillKey);
  }
  return g;
}

function fillRect(grid, x0, y0, x1, y1, key) {
  const w = grid[0].length, h = grid.length;
  for (let y = Math.max(0, y0); y <= Math.min(h - 1, y1); y++) {
    for (let x = Math.max(0, x0); x <= Math.min(w - 1, x1); x++) {
      grid[y][x] = key;
    }
  }
}

function drawHLine(grid, x0, x1, y, key) {
  if (y < 0 || y >= grid.length) return;
  const a = Math.min(x0, x1), b = Math.max(x0, x1);
  for (let x = Math.max(0, a); x <= Math.min(grid[0].length - 1, b); x++) {
    grid[y][x] = key;
  }
}

function drawVLine(grid, x, y0, y1, key) {
  if (x < 0 || x >= grid[0].length) return;
  const a = Math.min(y0, y1), b = Math.max(y0, y1);
  for (let y = Math.max(0, a); y <= Math.min(grid.length - 1, b); y++) {
    grid[y][x] = key;
  }
}

// Build a rectangular building: floor inside, wall segments around the
// perimeter, with a door cut into one wall.
function makeBuilding(x0, y0, x1, y1, floorKey, doorEdge) {
  const walls = [];
  const doors = [];
  // Walls are stored as segments; encoder in tilemap.js expands them per-edge.
  // Top:
  walls.push({ x1: x0, y1: y0, x2: x1 + 1, y2: y0, type: 'stone' });
  // Bottom:
  walls.push({ x1: x0, y1: y1 + 1, x2: x1 + 1, y2: y1 + 1, type: 'stone' });
  // Left:
  walls.push({ x1: x0, y1: y0, x2: x0, y2: y1 + 1, type: 'stone' });
  // Right:
  walls.push({ x1: x1 + 1, y1: y0, x2: x1 + 1, y2: y1 + 1, type: 'stone' });
  // Door — pick a midpoint of the requested edge.
  const mx = Math.floor((x0 + x1) / 2);
  const my = Math.floor((y0 + y1) / 2);
  if (doorEdge === 'N') doors.push({ x: mx, y: y0, edge: EDGE.N, type: 'wood' });
  else if (doorEdge === 'S') doors.push({ x: mx, y: y1, edge: EDGE.S, type: 'wood' });
  else if (doorEdge === 'W') doors.push({ x: x0, y: my, edge: EDGE.W, type: 'wood' });
  else if (doorEdge === 'E') doors.push({ x: x1, y: my, edge: EDGE.E, type: 'wood' });
  return { walls, doors, floorKey, x0, y0, x1, y1 };
}

// ─── Region generator ────────────────────────────────────────────────────────

function generateRegion(spec) {
  const W = spec.width, H = spec.height;
  const rng = mulberry32(spec.seed);
  const grid = makeGrid(W, H, spec.baseTile);

  // 1. Apply terrain noise — splash the secondary tile around for variety.
  if (spec.scatter) {
    for (const { tile, density } of spec.scatter) {
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          if (rng() < density) grid[y][x] = tile;
        }
      }
    }
  }

  // 2. Carve the path network (cardinal cross from center to edges).
  const cx = Math.floor(W / 2), cy = Math.floor(H / 2);
  drawHLine(grid, 1, W - 2, cy, spec.pathTile);
  drawVLine(grid, cx, 1, H - 2, spec.pathTile);

  // 3. Place named landmarks and their building footprints.
  const landmarks = [];
  const allWalls = [];
  const allDoors = [];
  const buildingRects = []; // for spawn placement avoidance + door access

  for (const lm of spec.landmarks) {
    const { id, x, y, label, sprite, building } = lm;
    if (building) {
      const [bw, bh] = building.size;
      const x0 = x - Math.floor(bw / 2);
      const y0 = y - Math.floor(bh / 2);
      const x1 = x0 + bw - 1;
      const y1 = y0 + bh - 1;
      // Floor inside.
      fillRect(grid, x0, y0, x1, y1, building.floor || spec.floorTile);
      // Walls + door.
      const built = makeBuilding(x0, y0, x1, y1, building.floor || spec.floorTile, building.door || 'S');
      allWalls.push(...built.walls);
      allDoors.push(...built.doors);
      buildingRects.push({ x0, y0, x1, y1, doorEdge: building.door || 'S' });
      // Carve a short approach path from the door to the nearest existing path.
      const door = built.doors[0];
      if (door) {
        const ax = door.x, ay = door.y;
        // Walk along path tile until we hit cy (the main horizontal road).
        const targetY = cy;
        if (ay < targetY) {
          for (let yy = ay + 1; yy <= targetY; yy++) if (grid[yy][ax] !== spec.pathTile) grid[yy][ax] = spec.pathTile;
        } else if (ay > targetY) {
          for (let yy = ay - 1; yy >= targetY; yy--) if (grid[yy][ax] !== spec.pathTile) grid[yy][ax] = spec.pathTile;
        }
      }
    } else {
      // Non-building landmark — clear a small 3x3 footprint (so renderer can
      // show the sprite cleanly) and carve a path back to the cardinal cross
      // so the landmark is reachable from spawn.
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (y + dy >= 0 && y + dy < H && x + dx >= 0 && x + dx < W) {
            grid[y + dy][x + dx] = spec.pathTile;
          }
        }
      }
      // Carve straight line to the central horizontal road.
      const targetY = cy;
      if (y < targetY) {
        for (let yy = y + 1; yy <= targetY; yy++) grid[yy][x] = spec.pathTile;
      } else if (y > targetY) {
        for (let yy = y - 1; yy >= targetY; yy--) grid[yy][x] = spec.pathTile;
      }
    }
    landmarks.push({ id, x, y, label, sprite });
  }

  // 4. Sanity sweep: ensure every landmark tile is reachable from spawn by
  //    nuking any wayward unwalkable scatter that fell on the path.
  drawHLine(grid, 1, W - 2, cy, spec.pathTile);
  drawVLine(grid, cx, 1, H - 2, spec.pathTile);

  // 5. Compute spawn points. The first landmark with id ending "_spawn" or
  //    type 'spawn' is the player_default.
  const spawn_points = {};
  spawn_points.player_default = { x: spec.spawn?.x ?? cx, y: spec.spawn?.y ?? cy };
  for (const sp of spec.npcSpawns || []) {
    spawn_points[`npc_${sp.id}`] = { x: sp.x, y: sp.y, npc: sp.id, label: sp.label };
  }
  for (const sp of spec.monsterSpawns || []) {
    spawn_points[`monster_${sp.id}_${sp.x}_${sp.y}`] = { x: sp.x, y: sp.y, npc: sp.id, label: sp.label || sp.id };
  }
  for (const sp of spec.bossSpawns || []) {
    spawn_points[`boss_${sp.id}`] = { x: sp.x, y: sp.y, npc: sp.id, label: sp.label || sp.id };
  }

  // 6. Tile legend — region-specific palette mapping ints → sprite refs.
  const tile_legend = spec.tile_legend;

  // 7. Areas — supplied by caller (expressed in local coords, matching the
  //    canonical area IDs in data/areas.json).
  const areas = spec.areas;

  return {
    id: spec.id,
    name: spec.name,
    width: W,
    height: H,
    tile_legend,
    tiles: grid,
    areas,
    landmarks,
    spawn_points,
    walls: allWalls,
    doors: allDoors,
    audio_zone: spec.audio_zone,
    music_zone: spec.music_zone,
  };
}

// ─── Region specs ─────────────────────────────────────────────────────────────
// Each block is one region. Tiles use base-36 keys 0..35 (so legend keys are
// strings like "0".."9","a".."z"). Keep palette under 16 distinct types — the
// loader only needs walkability + sprite ref.

const HEARTLANDS = {
  id: 'heartlands',
  name: 'The Heartlands',
  width: 64, height: 64, seed: 1001,
  baseTile: '1', pathTile: '2', floorTile: '8',
  audio_zone: 'heartlands_pastoral',
  music_zone: 'heartlands_main_theme',
  tile_legend: {
    '0': { name: 'void',    walkable: false, sprite: null },
    '1': { name: 'grass',   walkable: true,  sprite: 'heartlands/grass_01' },
    '2': { name: 'path',    walkable: true,  sprite: 'heartlands/path_cobble' },
    '3': { name: 'wall',    walkable: false, sprite: 'heartlands/wall_stone' },
    '4': { name: 'flowers', walkable: true,  sprite: 'heartlands/flowers' },
    '5': { name: 'wheat',   walkable: true,  sprite: 'heartlands/wheat_field' },
    '6': { name: 'tree',    walkable: false, sprite: 'heartlands/tree_oak' },
    '7': { name: 'water',   walkable: false, sprite: 'heartlands/water_river' },
    '8': { name: 'floor',   walkable: true,  sprite: 'heartlands/floor_wood' },
    '9': { name: 'bridge',  walkable: true,  sprite: 'heartlands/bridge_stone' },
    'a': { name: 'fence',   walkable: false, sprite: 'heartlands/fence_wood' },
  },
  scatter: [
    { tile: '4', density: 0.02 },
    { tile: '6', density: 0.04 },
  ],
  spawn: { x: 32, y: 32 },
  landmarks: [
    { id: 'lumbridge_castle',       x: 32, y: 24, label: 'Lumbridge Castle',           sprite: 'heartlands/castle',    building: { size: [10, 8], door: 'S', floor: '8' } },
    { id: 'chapel_last_light',      x: 18, y: 22, label: 'Chapel of the Last Light',   sprite: 'heartlands/chapel',    building: { size: [6, 5], door: 'E', floor: '8' } },
    { id: 'town_market',            x: 32, y: 36, label: 'Town Market',                sprite: 'heartlands/market',    building: { size: [8, 6], door: 'N', floor: '8' } },
    { id: 'blacksmith_kael',        x: 44, y: 30, label: "Kael's Forge",               sprite: 'heartlands/forge',     building: { size: [6, 5], door: 'W', floor: '8' } },
    { id: 'farm_drowned_miller',    x: 50, y: 48, label: 'The Drowned Miller Farm',    sprite: 'heartlands/farm',      building: { size: [5, 4], door: 'N', floor: '8' } },
    { id: 'wishing_well',           x: 32, y: 32, label: 'Wishing Well',               sprite: 'heartlands/well' },
    { id: 'goblin_village_outpost', x: 14, y: 50, label: 'Goblin Village Outpost',     sprite: 'heartlands/goblin_hut', building: { size: [4, 4], door: 'E', floor: '8' } },
  ],
  npcSpawns: [
    { id: 'captain_alden',     x: 32, y: 28, label: 'Captain Alden' },
    { id: 'smith_kael',        x: 43, y: 30, label: 'Smith Kael' },
    { id: 'merchant_hilde',    x: 31, y: 35, label: 'Merchant Hilde' },
    { id: 'forgefather_duran', x: 33, y: 28, label: 'Forgefather Duran' },
  ],
  monsterSpawns: [
    { id: 'goblin', x: 14, y: 52 }, { id: 'goblin', x: 16, y: 52 },
    { id: 'goblin_warrior', x: 15, y: 51 },
    { id: 'giant_rat', x: 48, y: 50 }, { id: 'giant_rat', x: 50, y: 51 },
    { id: 'giant_spider', x: 8, y: 18 },
    { id: 'hill_giant', x: 56, y: 38 },
    { id: 'moss_giant', x: 6, y: 8 },
  ],
  bossSpawns: [],
  areas: [
    { id: 'town',           x0: 24, y0: 28, x1: 42, y1: 40, label: 'Town' },
    { id: 'fields',         x0: 8,  y0: 40, x1: 28, y1: 60, label: 'Lumbridge Fields' },
    { id: 'forest',         x0: 0,  y0: 0,  x1: 14, y1: 28, label: 'Forest' },
    { id: 'goblin_village', x0: 10, y0: 48, x1: 20, y1: 56, label: 'Goblin Village' },
    { id: 'mines',          x0: 48, y0: 48, x1: 62, y1: 60, label: 'Mining Site' },
    { id: 'giant_plains',   x0: 50, y0: 30, x1: 62, y1: 44, label: 'Giant Plains' },
    { id: 'hunting_grounds',x0: 28, y0: 0,  x1: 50, y1: 12, label: 'Hunting Grounds' },
  ],
};

const BONEYARD = {
  id: 'boneyard_wastes',
  name: 'Boneyard Wastes',
  width: 64, height: 64, seed: 2002,
  baseTile: '1', pathTile: '2', floorTile: '6',
  audio_zone: 'boneyard_wind',
  music_zone: 'boneyard_lament',
  tile_legend: {
    '0': { name: 'void',       walkable: false, sprite: null },
    '1': { name: 'sand',       walkable: true,  sprite: 'boneyard/sand_pale' },
    '2': { name: 'path',       walkable: true,  sprite: 'boneyard/path_bones' },
    '3': { name: 'wall',       walkable: false, sprite: 'boneyard/wall_sandstone' },
    '4': { name: 'bone_pile',  walkable: false, sprite: 'boneyard/bones' },
    '5': { name: 'oasis',      walkable: false, sprite: 'boneyard/water_oasis' },
    '6': { name: 'tent_floor', walkable: true,  sprite: 'boneyard/canvas_floor' },
    '7': { name: 'palm',       walkable: false, sprite: 'boneyard/palm_tree' },
    '8': { name: 'cracked',    walkable: true,  sprite: 'boneyard/sand_cracked' },
    '9': { name: 'cactus',     walkable: false, sprite: 'boneyard/cactus' },
    'a': { name: 'sandstone',  walkable: true,  sprite: 'boneyard/sandstone_floor' },
  },
  scatter: [
    { tile: '4', density: 0.025 },
    { tile: '8', density: 0.06 },
    { tile: '9', density: 0.012 },
  ],
  spawn: { x: 32, y: 32 },
  landmarks: [
    { id: 'oasis_pool',         x: 30, y: 30, label: 'Oasis Pool',           sprite: 'boneyard/oasis_lily' },
    { id: 'nomad_camp',         x: 36, y: 30, label: 'Nomad Camp',           sprite: 'boneyard/tent_canvas',  building: { size: [6, 5], door: 'W', floor: '6' } },
    { id: 'pyramid_of_sun',     x: 50, y: 16, label: 'Pyramid of the Sun',   sprite: 'boneyard/pyramid',      building: { size: [10, 10], door: 'S', floor: 'a' } },
    { id: 'azhmari_ossuary',    x: 50, y: 50, label: "Azhmari's Ossuary",    sprite: 'boneyard/ossuary',      building: { size: [8, 8], door: 'N', floor: 'a' } },
    { id: 'compass_obelisk',    x: 14, y: 14, label: 'The Boneyard Compass', sprite: 'boneyard/obelisk' },
    { id: 'hermit_sun_dwelling',x: 14, y: 50, label: "Hermit Old-Sun's Hut", sprite: 'boneyard/mud_hut',      building: { size: [4, 4], door: 'E', floor: '6' } },
  ],
  npcSpawns: [
    { id: 'nomad_trader_razak',  x: 36, y: 30, label: 'Nomad Trader Razak' },
    { id: 'archaeologist_veris', x: 35, y: 28, label: 'Archaeologist Veris' },
    { id: 'hermit_old_sun',      x: 14, y: 49, label: 'Hermit Old-Sun' },
  ],
  monsterSpawns: [
    { id: 'sand_crab',     x: 8,  y: 8 }, { id: 'sand_crab', x: 12, y: 12 },
    { id: 'sand_crab',     x: 8,  y: 56 }, { id: 'sand_crab', x: 56, y: 56 },
    { id: 'desert_wolf',   x: 22, y: 44 }, { id: 'desert_wolf', x: 44, y: 22 },
    { id: 'skeleton',      x: 50, y: 44 }, { id: 'skeleton',  x: 52, y: 46 },
    { id: 'skeleton_mage', x: 51, y: 50 },
    { id: 'giant_scarab',  x: 18, y: 56 }, { id: 'giant_scarab', x: 22, y: 58 },
    { id: 'dust_devil',    x: 56, y: 36 }, { id: 'dust_devil',   x: 58, y: 38 },
    { id: 'mummy',         x: 50, y: 18 }, { id: 'mummy',        x: 52, y: 14 },
    { id: 'bone_crawler',  x: 40, y: 50 }, { id: 'bone_crawler', x: 42, y: 52 },
  ],
  bossSpawns: [
    { id: 'azhmari',       x: 50, y: 50, label: 'Azhmari, the Bone King' },
    { id: 'bog_hydra',     x: 8,  y: 56 },
  ],
  areas: [
    { id: 'boneyard_wastes', x0: 0,  y0: 0,  x1: 63, y1: 63, label: 'Boneyard Wastes' },
    { id: 'boneyard_oasis',  x0: 26, y0: 26, x1: 38, y1: 34, label: 'Boneyard Oasis' },
  ],
};

const VEILWOOD = {
  id: 'veilwood',
  name: 'Veilwood',
  width: 64, height: 64, seed: 3003,
  baseTile: '1', pathTile: '2', floorTile: '8',
  audio_zone: 'veilwood_birdsong',
  music_zone: 'veilwood_elven_strings',
  tile_legend: {
    '0': { name: 'void',         walkable: false, sprite: null },
    '1': { name: 'dark_grass',   walkable: true,  sprite: 'veilwood/grass_dark' },
    '2': { name: 'path',         walkable: true,  sprite: 'veilwood/path_moss' },
    '3': { name: 'wall',         walkable: false, sprite: 'veilwood/wall_living_wood' },
    '4': { name: 'fern',         walkable: true,  sprite: 'veilwood/fern' },
    '5': { name: 'tree_oak',     walkable: false, sprite: 'veilwood/tree_oak' },
    '6': { name: 'tree_yew',     walkable: false, sprite: 'veilwood/tree_yew' },
    '7': { name: 'tree_ancient', walkable: false, sprite: 'veilwood/tree_ancient' },
    '8': { name: 'floor',        walkable: true,  sprite: 'veilwood/floor_polished_wood' },
    '9': { name: 'glow_moss',    walkable: true,  sprite: 'veilwood/moss_luminous' },
    'a': { name: 'stream',       walkable: false, sprite: 'veilwood/stream' },
  },
  scatter: [
    { tile: '4', density: 0.06 },
    { tile: '5', density: 0.05 },
    { tile: '6', density: 0.025 },
    { tile: '7', density: 0.008 },
    { tile: '9', density: 0.015 },
  ],
  spawn: { x: 32, y: 32 },
  landmarks: [
    { id: 'elven_village',      x: 32, y: 32, label: 'Elven Village',        sprite: 'veilwood/elf_pavilion', building: { size: [10, 8], door: 'S', floor: '8' } },
    { id: 'fletcher_workshop',  x: 24, y: 32, label: "Tarin's Fletcher Hut", sprite: 'veilwood/wood_hut',     building: { size: [5, 4], door: 'E', floor: '8' } },
    { id: 'sacred_grove',       x: 14, y: 50, label: 'Sacred Grove',         sprite: 'veilwood/altar_living' },
    { id: 'veilmother_grotto',  x: 10, y: 14, label: "Veilmother's Grotto",  sprite: 'veilwood/grotto_dark',  building: { size: [6, 6], door: 'E', floor: '8' } },
    { id: 'druid_circle',       x: 50, y: 50, label: 'Druid Stone Circle',   sprite: 'veilwood/menhir' },
    { id: 'whispering_falls',   x: 50, y: 14, label: 'The Whispering Falls', sprite: 'veilwood/waterfall' },
  ],
  npcSpawns: [
    { id: 'elven_ranger_lyris',   x: 33, y: 32, label: 'Elven Ranger Lyris' },
    { id: 'elven_fletcher_tarin', x: 24, y: 31, label: 'Elven Fletcher Tarin' },
    { id: 'elder_druid',          x: 14, y: 48, label: 'Elder Druid' },
  ],
  monsterSpawns: [
    { id: 'moss_sprite',    x: 20, y: 22 }, { id: 'moss_sprite',    x: 22, y: 26 },
    { id: 'timber_wolf',    x: 40, y: 18 }, { id: 'timber_wolf',    x: 44, y: 24 },
    { id: 'ent',            x: 18, y: 44 }, { id: 'ent',            x: 16, y: 50 },
    { id: 'unicorn',        x: 32, y: 50 }, { id: 'unicorn',        x: 36, y: 52 },
    { id: 'fungal_mage',    x: 12, y: 56 }, { id: 'fungal_mage',    x: 16, y: 58 },
    { id: 'shadow_panther', x: 8,  y: 22 }, { id: 'shadow_panther', x: 10, y: 28 },
  ],
  bossSpawns: [
    { id: 'the_veilmother', x: 11, y: 14, label: 'The Veilmother' },
  ],
  areas: [
    { id: 'veilwood',       x0: 0,  y0: 0,  x1: 63, y1: 63, label: 'Veilwood' },
    { id: 'elven_village',  x0: 27, y0: 28, x1: 37, y1: 36, label: 'Elven Village' },
    { id: 'sacred_grove',   x0: 10, y0: 46, x1: 20, y1: 56, label: 'Sacred Grove' },
  ],
};

const SOOTWORKS = {
  id: 'sootworks',
  name: 'The Sootworks',
  width: 64, height: 64, seed: 4004,
  baseTile: '3', pathTile: '2', floorTile: '6',
  audio_zone: 'sootworks_hammers',
  music_zone: 'sootworks_industrial',
  tile_legend: {
    '0': { name: 'void',       walkable: false, sprite: null },
    '1': { name: 'soot',       walkable: true,  sprite: 'sootworks/soot_floor' },
    '2': { name: 'cobble',     walkable: true,  sprite: 'sootworks/cobble' },
    '3': { name: 'rock',       walkable: false, sprite: 'sootworks/rock_dark' },
    '4': { name: 'iron_plate', walkable: true,  sprite: 'sootworks/floor_iron_plate' },
    '5': { name: 'lava',       walkable: false, sprite: 'sootworks/lava' },
    '6': { name: 'forge_stone',walkable: true,  sprite: 'sootworks/floor_forge' },
    '7': { name: 'coal_vein',  walkable: false, sprite: 'sootworks/coal_vein' },
    '8': { name: 'iron_vein',  walkable: false, sprite: 'sootworks/iron_vein' },
    '9': { name: 'wall',       walkable: false, sprite: 'sootworks/wall_brickwork' },
    'a': { name: 'gantry',     walkable: true,  sprite: 'sootworks/gantry_metal' },
    'b': { name: 'steam_pipe', walkable: false, sprite: 'sootworks/pipe_steam' },
  },
  scatter: [
    { tile: '1', density: 0.10 },
    { tile: '7', density: 0.025 },
    { tile: '8', density: 0.018 },
    { tile: '5', density: 0.008 },
    { tile: 'b', density: 0.012 },
  ],
  spawn: { x: 32, y: 32 },
  landmarks: [
    { id: 'forge_hall',         x: 32, y: 28, label: 'Sootworks Forge Hall', sprite: 'sootworks/forge_great', building: { size: [12, 8], door: 'S', floor: '6' } },
    { id: 'deep_vein',          x: 50, y: 50, label: 'The Deep Vein',         sprite: 'sootworks/cavern',     building: { size: [10, 8], door: 'N', floor: '4' } },
    { id: 'gnome_workshop',     x: 14, y: 32, label: "Fizz's Workshop",       sprite: 'sootworks/cog_house',  building: { size: [6, 5], door: 'E', floor: '4' } },
    { id: 'soot_king_throne',   x: 50, y: 14, label: 'Soot King Throne',      sprite: 'sootworks/throne_iron',building: { size: [8, 6], door: 'S', floor: '6' } },
    { id: 'mine_shaft_main',    x: 14, y: 50, label: 'Main Mine Shaft',       sprite: 'sootworks/shaft_mouth' },
    { id: 'crucible_chamber',   x: 32, y: 50, label: 'Crucible Chamber',      sprite: 'sootworks/crucible',   building: { size: [6, 6], door: 'N', floor: '6' } },
  ],
  npcSpawns: [
    { id: 'forgemaster_brun',     x: 32, y: 30, label: 'Forgemaster Brun' },
    { id: 'dwarven_smith_hald',   x: 30, y: 28, label: 'Dwarven Smith Hald' },
    { id: 'gnome_engineer_fizz',  x: 14, y: 31, label: 'Gnome Engineer Fizz' },
  ],
  monsterSpawns: [
    { id: 'mine_spider',     x: 16, y: 50 }, { id: 'mine_spider',     x: 18, y: 52 },
    { id: 'rock_golem',      x: 14, y: 56 }, { id: 'rock_golem',      x: 12, y: 54 },
    { id: 'clockwork_sentry',x: 14, y: 30 }, { id: 'clockwork_sentry',x: 16, y: 34 },
    { id: 'lava_beast',      x: 50, y: 52 }, { id: 'lava_beast',      x: 54, y: 50 },
    { id: 'rogue_automaton', x: 52, y: 54 }, { id: 'rogue_automaton', x: 50, y: 48 },
  ],
  bossSpawns: [
    { id: 'vorath',         x: 50, y: 51, label: 'Vorath' },
    { id: 'the_soot_king',  x: 50, y: 14, label: 'The Soot King' },
  ],
  areas: [
    { id: 'sootworks',       x0: 0,  y0: 0,  x1: 63, y1: 63, label: 'The Sootworks' },
    { id: 'sootworks_forge', x0: 26, y0: 24, x1: 38, y1: 32, label: 'Sootworks Forge Hall' },
    { id: 'deep_vein',       x0: 45, y0: 46, x1: 55, y1: 54, label: 'The Deep Vein' },
  ],
};

const MORYSKAH = {
  id: 'moryskah',
  name: 'Moryskah',
  width: 64, height: 64, seed: 5005,
  baseTile: '1', pathTile: '2', floorTile: '6',
  audio_zone: 'moryskah_swamp_drone',
  music_zone: 'moryskah_gothic_choir',
  tile_legend: {
    '0': { name: 'void',         walkable: false, sprite: null },
    '1': { name: 'swamp',        walkable: true,  sprite: 'moryskah/swamp_water' },
    '2': { name: 'path',         walkable: true,  sprite: 'moryskah/path_planks' },
    '3': { name: 'wall',         walkable: false, sprite: 'moryskah/wall_obsidian' },
    '4': { name: 'rotwood',      walkable: false, sprite: 'moryskah/tree_rotwood' },
    '5': { name: 'mist_bog',     walkable: true,  sprite: 'moryskah/bog_mist' },
    '6': { name: 'cobblestone',  walkable: true,  sprite: 'moryskah/cobble_dark' },
    '7': { name: 'graveyard',    walkable: true,  sprite: 'moryskah/grave_floor' },
    '8': { name: 'mausoleum',    walkable: false, sprite: 'moryskah/mausoleum_stone' },
    '9': { name: 'witch_garden', walkable: true,  sprite: 'moryskah/garden_herbs' },
    'a': { name: 'blood_pool',   walkable: false, sprite: 'moryskah/blood_pool' },
  },
  scatter: [
    { tile: '5', density: 0.08 },
    { tile: '4', density: 0.05 },
    { tile: '7', density: 0.02 },
    { tile: 'a', density: 0.008 },
  ],
  spawn: { x: 32, y: 32 },
  landmarks: [
    { id: 'moryskah_village',    x: 32, y: 32, label: 'Moryskah Village',     sprite: 'moryskah/village_square',  building: { size: [10, 8], door: 'S', floor: '6' } },
    { id: 'apothecary_nira',     x: 26, y: 32, label: "Nira's Apothecary",    sprite: 'moryskah/apothecary',      building: { size: [5, 4], door: 'E', floor: '6' } },
    { id: 'slayer_tower',        x: 50, y: 16, label: 'Slayer Tower',         sprite: 'moryskah/tower_tall',      building: { size: [8, 8], door: 'S', floor: '6' } },
    { id: 'castle_malachar',     x: 50, y: 50, label: 'Castle Malachar',      sprite: 'moryskah/castle',          building: { size: [12, 10], door: 'N', floor: '6' } },
    { id: 'bog_witch_grael_hut', x: 14, y: 50, label: "Bog Witch Grael's Hut",sprite: 'moryskah/witch_hut',       building: { size: [4, 4], door: 'E', floor: '6' } },
    { id: 'father_dorin_chapel', x: 14, y: 14, label: "Father Dorin's Chapel",sprite: 'moryskah/chapel',          building: { size: [6, 6], door: 'E', floor: '6' } },
  ],
  npcSpawns: [
    { id: 'father_dorin',           x: 15, y: 16, label: 'Father Dorin' },
    { id: 'apothecary_nira',        x: 26, y: 31, label: 'Apothecary Nira' },
    { id: 'slayer_master_varrek',   x: 50, y: 18, label: 'Slayer Master Varrek' },
    { id: 'bog_witch_grael',        x: 14, y: 49, label: 'Bog Witch Grael' },
  ],
  monsterSpawns: [
    { id: 'ghast',            x: 22, y: 22 }, { id: 'ghast',           x: 26, y: 24 },
    { id: 'ghast',            x: 30, y: 22 }, { id: 'ghast',           x: 18, y: 28 },
    { id: 'banshee',          x: 50, y: 14 }, { id: 'banshee',         x: 52, y: 16 },
    { id: 'crawling_hand',    x: 48, y: 18 }, { id: 'crawling_hand',   x: 52, y: 20 },
    { id: 'vampyre_juvenile', x: 46, y: 46 }, { id: 'vampyre_juvenile',x: 48, y: 48 },
    { id: 'vampyre_noble',    x: 50, y: 48 },
    { id: 'werewolf',         x: 32, y: 48 }, { id: 'werewolf',        x: 36, y: 50 },
    { id: 'werewolf_alpha',   x: 30, y: 50 },
    { id: 'aberrant_spectre', x: 50, y: 22 }, { id: 'aberrant_spectre',x: 53, y: 24 },
    { id: 'revenant_imp',     x: 40, y: 50 },
  ],
  bossSpawns: [
    { id: 'count_malachar',  x: 50, y: 50, label: 'Count Malachar' },
  ],
  areas: [
    { id: 'moryskah',          x0: 0,  y0: 0,  x1: 63, y1: 63, label: 'Moryskah' },
    { id: 'moryskah_village',  x0: 27, y0: 28, x1: 37, y1: 36, label: 'Moryskah Village' },
    { id: 'slayer_tower',      x0: 46, y0: 12, x1: 54, y1: 20, label: 'Slayer Tower' },
    { id: 'castle_malachar',   x0: 44, y0: 45, x1: 56, y1: 55, label: 'Castle Malachar' },
  ],
};

const INKWEALD = {
  id: 'inkweald',
  name: 'The Inkweald',
  width: 64, height: 64, seed: 6006,
  baseTile: '1', pathTile: '2', floorTile: '8',
  audio_zone: 'inkweald_dream_drone',
  music_zone: 'inkweald_resonance',
  tile_legend: {
    '0': { name: 'void',         walkable: false, sprite: null },
    '1': { name: 'dream_grass',  walkable: true,  sprite: 'inkweald/grass_violet' },
    '2': { name: 'path',         walkable: true,  sprite: 'inkweald/path_dream' },
    '3': { name: 'wall',         walkable: false, sprite: 'inkweald/wall_glass' },
    '4': { name: 'flower',       walkable: true,  sprite: 'inkweald/flower_lucid' },
    '5': { name: 'bush',         walkable: false, sprite: 'inkweald/bush_thought' },
    '6': { name: 'mirror_pond',  walkable: false, sprite: 'inkweald/pond_mirror' },
    '7': { name: 'shade',        walkable: true,  sprite: 'inkweald/shade_violet' },
    '8': { name: 'floor',        walkable: true,  sprite: 'inkweald/floor_brass' },
    '9': { name: 'ink_bloom',    walkable: true,  sprite: 'inkweald/bloom_ink' },
    'a': { name: 'thoughtcrack', walkable: false, sprite: 'inkweald/crack_thought' },
  },
  scatter: [
    { tile: '4', density: 0.04 },
    { tile: '5', density: 0.06 },
    { tile: '7', density: 0.05 },
    { tile: '9', density: 0.025 },
    { tile: '6', density: 0.005 },
  ],
  spawn: { x: 32, y: 32 },
  landmarks: [
    { id: 'inkweald_boundary_camp', x: 16, y: 32, label: 'Inkweald Boundary Camp', sprite: 'inkweald/camp_lucid',     building: { size: [8, 6], door: 'E', floor: '8' } },
    { id: 'resonance_chamber',      x: 50, y: 50, label: 'The Resonance Chamber',  sprite: 'inkweald/chamber_brass',  building: { size: [12, 10], door: 'N', floor: '8' } },
    { id: 'mirror_pond_great',      x: 32, y: 16, label: 'Great Mirror Pond',      sprite: 'inkweald/pond_mirror' },
    { id: 'lucid_keeper_lodge',     x: 18, y: 32, label: "Lucid Keeper Yara's Lodge", sprite: 'inkweald/lodge_lucid', building: { size: [4, 4], door: 'S', floor: '8' } },
    { id: 'choir_amphitheatre',     x: 50, y: 16, label: 'Hollow Choir Amphitheatre', sprite: 'inkweald/amphi_brass', building: { size: [8, 6], door: 'S', floor: '8' } },
    { id: 'paradox_grove',          x: 14, y: 50, label: 'Paradox Grove',          sprite: 'inkweald/menhir_violet' },
  ],
  npcSpawns: [
    { id: 'lucid_keeper_yara', x: 18, y: 32, label: 'Lucid Keeper Yara' },
  ],
  monsterSpawns: [
    { id: 'dream_wisp',       x: 30, y: 30 }, { id: 'dream_wisp',       x: 34, y: 32 },
    { id: 'dream_wisp',       x: 38, y: 28 },
    { id: 'thought_stalker',  x: 16, y: 44 }, { id: 'thought_stalker',  x: 20, y: 48 },
    { id: 'mirror_golem',     x: 44, y: 38 }, { id: 'mirror_golem',     x: 48, y: 42 },
    { id: 'ink_horror',       x: 50, y: 56 }, { id: 'ink_horror',       x: 52, y: 58 },
    { id: 'sleepwalker',      x: 32, y: 46 }, { id: 'sleepwalker',      x: 36, y: 48 },
  ],
  bossSpawns: [
    { id: 'inkweald_muse',          x: 50, y: 50, label: 'Inkweald Muse' },
    { id: 'hollow_choir_conductor', x: 50, y: 16, label: 'Hollow Choir Conductor' },
  ],
  areas: [
    { id: 'inkweald',           x0: 0,  y0: 0,  x1: 63, y1: 63, label: 'The Inkweald' },
    { id: 'inkweald_boundary',  x0: 12, y0: 28, x1: 22, y1: 36, label: 'Inkweald Boundary Camp' },
    { id: 'resonance_chamber',  x0: 44, y0: 45, x1: 56, y1: 55, label: 'The Resonance Chamber' },
  ],
};

const SALTBRINE = {
  id: 'saltbrine_reach',
  name: 'Saltbrine Reach',
  width: 64, height: 64, seed: 7007,
  baseTile: '1', pathTile: '2', floorTile: '6',
  audio_zone: 'saltbrine_surf',
  music_zone: 'saltbrine_seashanty',
  tile_legend: {
    '0': { name: 'void',         walkable: false, sprite: null },
    '1': { name: 'sand',         walkable: true,  sprite: 'saltbrine/sand_wet' },
    '2': { name: 'path',         walkable: true,  sprite: 'saltbrine/path_plank' },
    '3': { name: 'wall',         walkable: false, sprite: 'saltbrine/wall_clinker' },
    '4': { name: 'water',        walkable: false, sprite: 'saltbrine/water_ocean' },
    '5': { name: 'shallows',     walkable: true,  sprite: 'saltbrine/water_shallow' },
    '6': { name: 'dock',         walkable: true,  sprite: 'saltbrine/floor_dock' },
    '7': { name: 'rocky_shore',  walkable: false, sprite: 'saltbrine/rocks' },
    '8': { name: 'tide_pool',    walkable: false, sprite: 'saltbrine/tide_pool' },
    '9': { name: 'sea_grass',    walkable: true,  sprite: 'saltbrine/sea_grass' },
    'a': { name: 'wreck',        walkable: false, sprite: 'saltbrine/shipwreck' },
  },
  scatter: [
    { tile: '7', density: 0.04 },
    { tile: '8', density: 0.015 },
    { tile: '9', density: 0.05 },
  ],
  spawn: { x: 32, y: 32 },
  landmarks: [
    { id: 'saltbrine_harbour',   x: 32, y: 36, label: 'Saltbrine Harbour',  sprite: 'saltbrine/harbour_main', building: { size: [12, 6], door: 'N', floor: '6' } },
    { id: 'pirate_cove',         x: 50, y: 50, label: 'Pirate Cove',        sprite: 'saltbrine/cove_pirate',  building: { size: [10, 8], door: 'N', floor: '6' } },
    { id: 'fishmonger_stall',    x: 28, y: 34, label: "Mara's Fishmonger Stall", sprite: 'saltbrine/stall',    building: { size: [4, 3], door: 'S', floor: '6' } },
    { id: 'lighthouse_brine',    x: 14, y: 16, label: 'Brinekeep Lighthouse', sprite: 'saltbrine/lighthouse', building: { size: [4, 4], door: 'S', floor: '6' } },
    { id: 'shipwright_yard',     x: 14, y: 50, label: 'Shipwright Yard',    sprite: 'saltbrine/yard_ship',   building: { size: [8, 6], door: 'N', floor: '6' } },
    { id: 'kraken_warning',      x: 32, y: 56, label: 'Kraken Warning Buoy', sprite: 'saltbrine/buoy' },
  ],
  npcSpawns: [
    { id: 'harbourmaster_cole',  x: 32, y: 38, label: 'Harbourmaster Cole' },
    { id: 'fishmonger_mara',     x: 28, y: 34, label: 'Fishmonger Mara' },
  ],
  monsterSpawns: [
    { id: 'seagull',           x: 30, y: 36 }, { id: 'seagull',           x: 34, y: 38 },
    { id: 'rock_crab_coastal', x: 12, y: 30 }, { id: 'rock_crab_coastal', x: 14, y: 32 },
    { id: 'rock_crab_coastal', x: 16, y: 34 }, { id: 'rock_crab_coastal', x: 18, y: 32 },
    { id: 'pirate',            x: 50, y: 48 }, { id: 'pirate',            x: 52, y: 50 },
    { id: 'pirate',            x: 54, y: 52 }, { id: 'pirate_captain',    x: 51, y: 50 },
    { id: 'sea_snake',         x: 8,  y: 40 }, { id: 'sea_snake',         x: 10, y: 42 },
    { id: 'lobstrosity',       x: 44, y: 46 }, { id: 'lobstrosity',       x: 46, y: 44 },
    { id: 'siren',             x: 30, y: 56 }, { id: 'siren',             x: 34, y: 58 },
  ],
  bossSpawns: [
    { id: 'kraken_saltbrine', x: 32, y: 58, label: 'Kraken of Saltbrine' },
  ],
  areas: [
    { id: 'saltbrine',         x0: 0,  y0: 0,  x1: 63, y1: 63, label: 'Saltbrine Reach' },
    { id: 'saltbrine_harbour', x0: 26, y0: 33, x1: 38, y1: 39, label: 'Saltbrine Harbour' },
    { id: 'pirate_cove',       x0: 45, y0: 46, x1: 55, y1: 54, label: 'Pirate Cove' },
  ],
};

const GLASS_DESERT = {
  id: 'glass_desert',
  name: 'The Glass Desert',
  width: 96, height: 96, seed: 8008,
  baseTile: '1', pathTile: '2', floorTile: '6',
  audio_zone: 'glass_desert_wind',
  music_zone: 'glass_desert_endgame',
  tile_legend: {
    '0': { name: 'void',         walkable: false, sprite: null },
    '1': { name: 'sand',         walkable: true,  sprite: 'glass_desert/sand_pale' },
    '2': { name: 'path',         walkable: true,  sprite: 'glass_desert/path_glass_chip' },
    '3': { name: 'wall',         walkable: false, sprite: 'glass_desert/wall_crystal' },
    '4': { name: 'crystal',      walkable: false, sprite: 'glass_desert/crystal_spire' },
    '5': { name: 'glass_floor',  walkable: true,  sprite: 'glass_desert/floor_glass' },
    '6': { name: 'outpost_floor',walkable: true,  sprite: 'glass_desert/floor_outpost' },
    '7': { name: 'arena_stone',  walkable: true,  sprite: 'glass_desert/floor_arena' },
    '8': { name: 'cracked',      walkable: true,  sprite: 'glass_desert/sand_cracked' },
    '9': { name: 'lava_glass',   walkable: false, sprite: 'glass_desert/lava_glass' },
    'a': { name: 'crystal_vein', walkable: false, sprite: 'glass_desert/vein_crystal' },
    'b': { name: 'mirage',       walkable: true,  sprite: 'glass_desert/mirage_water' },
  },
  scatter: [
    { tile: '4', density: 0.025 },
    { tile: '8', density: 0.06 },
    { tile: 'a', density: 0.012 },
    { tile: 'b', density: 0.008 },
  ],
  spawn: { x: 48, y: 48 },
  landmarks: [
    { id: 'glass_outpost',         x: 16, y: 48, label: 'Glass Desert Outpost',  sprite: 'glass_desert/outpost',    building: { size: [10, 8], door: 'E', floor: '6' } },
    { id: 'glass_tyrant_arena',    x: 70, y: 70, label: 'Glass Tyrant Arena',    sprite: 'glass_desert/arena_tyrant',building: { size: [16, 12], door: 'N', floor: '7' } },
    { id: 'veldrak_arena',         x: 70, y: 24, label: "Veldrak's Domain",      sprite: 'glass_desert/arena_dragon',building: { size: [20, 16], door: 'S', floor: '7' } },
    { id: 'crystal_caverns',       x: 24, y: 70, label: 'Crystal Caverns',       sprite: 'glass_desert/cavern_crystal',building: { size: [12, 10], door: 'N', floor: '5' } },
    { id: 'crystal_heart_chamber', x: 24, y: 84, label: 'Crystal Heart Chamber', sprite: 'glass_desert/chamber_heart',building: { size: [8, 6], door: 'N', floor: '5' } },
    { id: 'inferno_entrance',      x: 88, y: 88, label: 'The Inferno Entrance', sprite: 'glass_desert/inferno_door' },
  ],
  npcSpawns: [
    { id: 'crystal_sage_orin',     x: 18, y: 48, label: 'Crystal Sage Orin' },
    { id: 'crystal_merchant_zel',  x: 16, y: 50, label: 'Crystal Merchant Zel' },
  ],
  monsterSpawns: [
    { id: 'glass_spider',        x: 30, y: 30 }, { id: 'glass_spider',        x: 36, y: 34 },
    { id: 'glass_spider',        x: 42, y: 28 },
    { id: 'prism_wizard',        x: 50, y: 30 }, { id: 'prism_wizard',        x: 56, y: 34 },
    { id: 'glass_golem',         x: 60, y: 60 }, { id: 'glass_golem',         x: 66, y: 64 },
    { id: 'crystal_bat',         x: 40, y: 18 }, { id: 'crystal_bat',         x: 44, y: 14 },
    { id: 'refracted_elemental', x: 70, y: 50 }, { id: 'refracted_elemental', x: 76, y: 54 },
  ],
  bossSpawns: [
    { id: 'the_glass_tyrant',  x: 70, y: 70, label: 'The Glass Tyrant' },
    { id: 'veldrak',           x: 70, y: 24, label: 'Veldrak, the Last Dragon' },
  ],
  areas: [
    { id: 'glass_desert',       x0: 0,  y0: 0,  x1: 95, y1: 95, label: 'The Glass Desert' },
    { id: 'glass_outpost',      x0: 11, y0: 44, x1: 21, y1: 52, label: 'Glass Desert Outpost' },
    { id: 'glass_tyrant_arena', x0: 62, y0: 64, x1: 78, y1: 76, label: 'Glass Tyrant Arena' },
    { id: 'veldrak_arena',      x0: 60, y0: 16, x1: 80, y1: 32, label: "Veldrak's Domain" },
    { id: 'crystal_caverns',    x0: 18, y0: 65, x1: 30, y1: 75, label: 'Crystal Caverns' },
    { id: 'crystal_wyrm_1',     x0: 20, y0: 81, x1: 28, y1: 87, label: 'Crystal Heart Chamber' },
  ],
};

const THE_WILDS = {
  id: 'the_wilds',
  name: 'The Wilds',
  width: 96, height: 96, seed: 9009,
  baseTile: '1', pathTile: '2', floorTile: '6',
  audio_zone: 'wilds_pvp_drone',
  music_zone: 'wilds_unsettling',
  tile_legend: {
    '0': { name: 'void',          walkable: false, sprite: null },
    '1': { name: 'dark_grass',    walkable: true,  sprite: 'wilds/grass_dead' },
    '2': { name: 'path',          walkable: true,  sprite: 'wilds/path_blood' },
    '3': { name: 'wall',          walkable: false, sprite: 'wilds/wall_ruined' },
    '4': { name: 'lava',          walkable: false, sprite: 'wilds/lava_pit' },
    '5': { name: 'rubble',        walkable: true,  sprite: 'wilds/rubble' },
    '6': { name: 'ruin_floor',    walkable: true,  sprite: 'wilds/floor_ruin' },
    '7': { name: 'tree_dead',     walkable: false, sprite: 'wilds/tree_dead' },
    '8': { name: 'bone_field',    walkable: true,  sprite: 'wilds/field_bones' },
    '9': { name: 'wild_altar',    walkable: false, sprite: 'wilds/altar_wild' },
    'a': { name: 'gravestone',    walkable: false, sprite: 'wilds/gravestone' },
    'b': { name: 'level_marker',  walkable: true,  sprite: 'wilds/marker_wild_level' },
  },
  scatter: [
    { tile: '5', density: 0.05 },
    { tile: '7', density: 0.04 },
    { tile: '8', density: 0.025 },
    { tile: 'a', density: 0.015 },
    { tile: '4', density: 0.01 },
  ],
  spawn: { x: 48, y: 90 }, // entry point at the south border
  landmarks: [
    { id: 'wilds_ruins',         x: 48, y: 48, label: 'Abandoned Ruins',     sprite: 'wilds/ruin_great',    building: { size: [16, 12], door: 'S', floor: '6' } },
    { id: 'lava_pit_great',      x: 70, y: 30, label: 'Great Lava Pit',      sprite: 'wilds/lava_great' },
    { id: 'wild_altar_chaos',    x: 24, y: 24, label: 'Chaos Altar',         sprite: 'wilds/altar_chaos',   building: { size: [6, 6], door: 'S', floor: '6' } },
    { id: 'rune_obelisk_north',  x: 48, y: 16, label: 'Rune Obelisk',        sprite: 'wilds/obelisk_rune' },
    { id: 'pvp_arena_clearing',  x: 76, y: 76, label: 'PVP Arena Clearing',  sprite: 'wilds/arena_pvp' },
    { id: 'wilderness_gate',     x: 48, y: 90, label: 'Wilderness Gate',     sprite: 'wilds/gate_wild' },
    { id: 'mage_arena_pillars',  x: 16, y: 70, label: 'Mage Arena Pillars',  sprite: 'wilds/pillars_mage' },
  ],
  npcSpawns: [
    // Wilds is largely PvP — only the gatekeeper NPC.
    { id: 'wilderness_keeper',   x: 48, y: 88, label: 'Wilderness Keeper' },
  ],
  monsterSpawns: [
    { id: 'revenant_imp',     x: 30, y: 50 }, { id: 'revenant_imp',     x: 40, y: 50 },
    { id: 'revenant_dark_beast', x: 50, y: 30 },
    { id: 'chaos_dwarf',      x: 60, y: 60 },
    { id: 'green_dragon',     x: 70, y: 70 }, { id: 'green_dragon',     x: 74, y: 74 },
    { id: 'lava_beast',       x: 70, y: 30 },
    { id: 'skeleton_warrior', x: 24, y: 60 }, { id: 'skeleton_warrior', x: 28, y: 64 },
    { id: 'hellhound',        x: 50, y: 70 },
  ],
  bossSpawns: [
    { id: 'chaos_elemental',  x: 24, y: 24, label: 'Chaos Elemental' },
    { id: 'callisto',         x: 70, y: 30, label: 'Callisto' },
  ],
  areas: [
    { id: 'the_wilds',         x0: 0,  y0: 0,  x1: 95, y1: 95, label: 'The Wilds' },
    { id: 'wilds_ruins',       x0: 40, y0: 42, x1: 56, y1: 54, label: 'Abandoned Ruins' },
  ],
};

// ─── Generate + write all 9 ───────────────────────────────────────────────────

const SPECS = [
  HEARTLANDS, BONEYARD, VEILWOOD, SOOTWORKS, MORYSKAH,
  INKWEALD, SALTBRINE, GLASS_DESERT, THE_WILDS,
];

function main() {
  const tilemapMod = require('../src/world/tilemap');
  let total = 0;
  for (const spec of SPECS) {
    const raw = generateRegion(spec);
    // Round-trip through RegionMap so the on-disk encoding (string-row tiles)
    // matches what the loader expects.
    const map = new tilemapMod.RegionMap({
      ...raw,
      tiles: raw.tiles, // 2d int array, decoded by RegionMap
    });
    const out = map.toJSON();
    const file = path.join(OUT_DIR, `${spec.id}.json`);
    fs.writeFileSync(file, JSON.stringify(out, null, 2));
    const stat = fs.statSync(file);
    console.log(`  wrote ${spec.id.padEnd(20)} ${(stat.size / 1024).toFixed(1)}kb  (${spec.width}x${spec.height})`);
    total += stat.size;
  }
  console.log(`\ngenerated ${SPECS.length} regions, ${(total / 1024).toFixed(1)}kb total`);
}

if (require.main === module) main();

module.exports = { SPECS, generateRegion };
