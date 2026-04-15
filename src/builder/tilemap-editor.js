// ══════════════════════════════════════════════════════════════════════════════
// Builder — Tilemap editor
//
// Stages per-region tilemap edits in data/builder-staging/tilemap/<region>.json
// and, on publish, merges them back into the authoritative
// data/tilemaps/<region>.json files (or equivalent overrides applied at boot).
//
// Data shape (staged):
//   {
//     "id": "heartlands",
//     "width": 64,
//     "height": 64,
//     "tiles": [ "1111..", "1111..", ... ],      // array of row strings
//     "tile_legend": { "1": { name, walkable, sprite } },
//     "_dirty": true, "_published": false, "_updatedAt": "..."
//   }
//
// The editor supports partial edits — you may stage ONLY tile rows, or ONLY
// a legend patch. Fields not present in the staged file fall through to the
// canonical JSON on publish.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const fs = require('fs');
const path = require('path');

const STAGING_ROOT = path.join(__dirname, '..', '..', 'data', 'builder-staging');
const TILEMAP_STAGING = path.join(STAGING_ROOT, 'tilemap');
const TILEMAPS_CANON = path.join(__dirname, '..', '..', 'data', 'tilemaps');
const PALETTES_FILE = path.join(__dirname, '..', '..', 'data', 'sprite-palettes.json');

function _ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }

function _stagingPath(regionId) {
  _ensureDir(TILEMAP_STAGING);
  return path.join(TILEMAP_STAGING, `${_sanitize(regionId)}.json`);
}

function _canonPath(regionId) {
  return path.join(TILEMAPS_CANON, `${_sanitize(regionId)}.json`);
}

function _sanitize(id) {
  return String(id).toLowerCase().replace(/[^a-z0-9_\-]/g, '_');
}

function _now() { return new Date().toISOString(); }

// ── List regions ─────────────────────────────────────────────────────────────

function listRegions() {
  if (!fs.existsSync(TILEMAPS_CANON)) return [];
  return fs.readdirSync(TILEMAPS_CANON)
    .filter(f => f.endsWith('.json'))
    .map(f => f.slice(0, -5))
    .sort();
}

function listStagedRegions() {
  if (!fs.existsSync(TILEMAP_STAGING)) return [];
  return fs.readdirSync(TILEMAP_STAGING)
    .filter(f => f.endsWith('.json'))
    .map(f => f.slice(0, -5))
    .sort();
}

// ── Palette lookup — builds per-region colour palette from sprite-palettes.json
//    for the UI to render tile previews without needing sprite images.

function loadPalettes() {
  if (!fs.existsSync(PALETTES_FILE)) return {};
  try { return JSON.parse(fs.readFileSync(PALETTES_FILE, 'utf8')); }
  catch { return {}; }
}

// Deterministic color for a tile name. Prefers the region's palette
// (dominant → accent → highlight/shadow) for a coherent look, then falls
// back to a hash-based colour.
function tileColor(regionPalette, tileName, idx) {
  if (!tileName) return '#2a2a2a';
  const name = String(tileName).toLowerCase();
  // Named heuristics — map common tile kinds to palette slots
  if (regionPalette) {
    if (name.includes('void')) return regionPalette.shadow || '#0a0a0a';
    if (name.includes('water') || name.includes('river') || name.includes('lake'))
      return regionPalette.water_tint || '#2a5080';
    if (name.includes('wall') || name.includes('cliff'))
      return regionPalette.shadow || '#2c2418';
    if (name.includes('path') || name.includes('road') || name.includes('cobble'))
      return (regionPalette.dominant && regionPalette.dominant[1]) || '#806045';
    if (name.includes('floor') || name.includes('wood'))
      return (regionPalette.accent && regionPalette.accent[2]) || '#6b5e42';
    if (name.includes('grass'))
      return (regionPalette.dominant && regionPalette.dominant[0]) || '#5a7e3d';
    if (name.includes('flower'))
      return (regionPalette.accent && regionPalette.accent[0]) || '#c23b22';
    if (name.includes('wheat') || name.includes('sand'))
      return (regionPalette.dominant && regionPalette.dominant[2]) || '#d4c4a0';
    if (name.includes('tree'))
      return regionPalette.shadow || '#2e3b1f';
    if (name.includes('bridge'))
      return (regionPalette.accent && regionPalette.accent[1]) || '#c2a15a';
    if (name.includes('fence'))
      return regionPalette.highlight || '#9e8e6a';
    if (name.includes('sky'))
      return regionPalette.sky_tint || '#bcd6ea';
  }
  // Fallback: deterministic swatch from an index hash
  const palette = ['#6b5e42', '#5a7e3d', '#9b8154', '#c23b22', '#4a6ea7',
                   '#2c1810', '#d4c4a0', '#f5d76e', '#2e3b1f', '#8b6508'];
  return palette[(idx | 0) % palette.length];
}

function paletteFor(regionId) {
  const all = loadPalettes();
  return all[regionId] || null;
}

// ── Canonical tilemap loader — reads either the staged or canonical file ────

function _readJsonSafe(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
  catch { return null; }
}

function getCanonical(regionId) {
  return _readJsonSafe(_canonPath(regionId));
}

function getStaged(regionId) {
  return _readJsonSafe(_stagingPath(regionId));
}

// Merged view: staged fields take precedence over canonical.
function getMerged(regionId) {
  const canon = getCanonical(regionId);
  const staged = getStaged(regionId);
  if (!canon && !staged) return null;
  const out = Object.assign({}, canon || {}, staged || {});
  // Preserve id from canonical if staged lacks one
  out.id = out.id || regionId;
  return out;
}

// Legend + palette preview — used by UI to build the tile palette
function getPalette(regionId) {
  const merged = getMerged(regionId);
  if (!merged) return null;
  const legend = merged.tile_legend || {};
  const regionPalette = paletteFor(regionId);
  const tiles = Object.entries(legend).map(([code, entry], i) => {
    const name = (entry && entry.name) || `tile_${code}`;
    return {
      code,
      name,
      walkable: !!(entry && entry.walkable),
      sprite: (entry && entry.sprite) || null,
      color: tileColor(regionPalette, name, i),
    };
  });
  return { regionId, width: merged.width, height: merged.height, tiles };
}

// ── Staging mutations ───────────────────────────────────────────────────────

function stageFull(regionId, tilemap) {
  if (!regionId) return { ok: false, errors: ['regionId required'] };
  const v = validate(tilemap);
  if (!v.ok) return v;
  const rec = Object.assign({}, tilemap, {
    id: regionId,
    _dirty: true,
    _published: false,
    _updatedAt: _now(),
  });
  fs.writeFileSync(_stagingPath(regionId), JSON.stringify(rec, null, 2));
  return { ok: true, region: regionId };
}

// Set a single tile (row, col) in the staged copy. If the region has no
// staged file yet, seed from canonical.
function setTile(regionId, col, row, code) {
  if (!regionId) return { ok: false, errors: ['regionId required'] };
  let rec = getStaged(regionId);
  if (!rec) {
    const canon = getCanonical(regionId);
    if (!canon) return { ok: false, errors: [`unknown region: ${regionId}`] };
    rec = JSON.parse(JSON.stringify(canon));
  }
  const width = rec.width | 0;
  const height = rec.height | 0;
  if (!Array.isArray(rec.tiles) || rec.tiles.length !== height) {
    return { ok: false, errors: ['tile rows missing or wrong length'] };
  }
  if (row < 0 || row >= height || col < 0 || col >= width) {
    return { ok: false, errors: [`out of bounds: (${col},${row}) in ${width}x${height}`] };
  }
  const legendKeys = Object.keys(rec.tile_legend || {});
  if (legendKeys.length > 0 && !legendKeys.includes(String(code))) {
    return { ok: false, errors: [`code '${code}' not in tile_legend`] };
  }
  const rowStr = rec.tiles[row];
  if (typeof rowStr !== 'string' || rowStr.length !== width) {
    return { ok: false, errors: [`row ${row} malformed (got ${rowStr ? rowStr.length : 'null'}/${width})`] };
  }
  const c = String(code)[0];
  rec.tiles[row] = rowStr.slice(0, col) + c + rowStr.slice(col + 1);
  rec.id = regionId;
  rec._dirty = true;
  rec._published = false;
  rec._updatedAt = _now();
  fs.writeFileSync(_stagingPath(regionId), JSON.stringify(rec, null, 2));
  return { ok: true };
}

// Bulk paint — replace many (col,row) in a single write
function paintTiles(regionId, edits) {
  if (!Array.isArray(edits)) return { ok: false, errors: ['edits must be array'] };
  let rec = getStaged(regionId);
  if (!rec) {
    const canon = getCanonical(regionId);
    if (!canon) return { ok: false, errors: [`unknown region: ${regionId}`] };
    rec = JSON.parse(JSON.stringify(canon));
  }
  const width = rec.width | 0;
  const height = rec.height | 0;
  for (const e of edits) {
    const { col, row, code } = e || {};
    if (!Number.isInteger(col) || !Number.isInteger(row)) {
      return { ok: false, errors: [`bad edit: ${JSON.stringify(e)}`] };
    }
    if (row < 0 || row >= height || col < 0 || col >= width) continue; // skip OOB
    const rowStr = rec.tiles[row];
    if (typeof rowStr !== 'string' || rowStr.length !== width) continue;
    rec.tiles[row] = rowStr.slice(0, col) + String(code)[0] + rowStr.slice(col + 1);
  }
  rec.id = regionId;
  rec._dirty = true;
  rec._published = false;
  rec._updatedAt = _now();
  fs.writeFileSync(_stagingPath(regionId), JSON.stringify(rec, null, 2));
  return { ok: true, applied: edits.length };
}

function discard(regionId) {
  const p = _stagingPath(regionId);
  if (!fs.existsSync(p)) return { ok: false, errors: [`nothing staged for ${regionId}`] };
  fs.unlinkSync(p);
  return { ok: true };
}

// ── Validation ──────────────────────────────────────────────────────────────

function validate(tilemap) {
  const errors = [];
  if (!tilemap || typeof tilemap !== 'object') {
    return { ok: false, errors: ['tilemap must be object'] };
  }
  if (!Number.isInteger(tilemap.width) || tilemap.width <= 0) errors.push('width: must be positive int');
  if (!Number.isInteger(tilemap.height) || tilemap.height <= 0) errors.push('height: must be positive int');
  if (!Array.isArray(tilemap.tiles)) {
    errors.push('tiles: must be string[]');
  } else if (Number.isInteger(tilemap.height) && tilemap.tiles.length !== tilemap.height) {
    errors.push(`tiles: expected ${tilemap.height} rows, got ${tilemap.tiles.length}`);
  } else {
    for (let i = 0; i < tilemap.tiles.length; i++) {
      const row = tilemap.tiles[i];
      if (typeof row !== 'string') { errors.push(`tiles[${i}]: must be string`); continue; }
      if (Number.isInteger(tilemap.width) && row.length !== tilemap.width) {
        errors.push(`tiles[${i}]: length ${row.length} != width ${tilemap.width}`);
      }
    }
  }
  if (tilemap.tile_legend && typeof tilemap.tile_legend !== 'object') {
    errors.push('tile_legend: must be object');
  }
  return { ok: errors.length === 0, errors };
}

// ── Publish — merges staged tilemap files into canonical files ──────────────

function publish() {
  _ensureDir(TILEMAP_STAGING);
  const staged = listStagedRegions();
  if (staged.length === 0) return { ok: true, published: 0, regions: [] };

  const published = [];
  const errors = [];
  for (const region of staged) {
    const rec = getStaged(region);
    if (!rec) continue;
    const v = validate(rec);
    if (!v.ok) { errors.push({ region, errors: v.errors }); continue; }
    // Merge on top of canonical so unchanged legend keys survive
    const canon = getCanonical(region) || {};
    const merged = Object.assign({}, canon, rec);
    // Strip internal flags before writing canonical
    delete merged._dirty; delete merged._published; delete merged._updatedAt;
    delete merged._publishedAt;
    fs.writeFileSync(_canonPath(region), JSON.stringify(merged, null, 2));
    // Mark staged record as published
    rec._dirty = false;
    rec._published = true;
    rec._publishedAt = _now();
    fs.writeFileSync(_stagingPath(region), JSON.stringify(rec, null, 2));
    published.push(region);
  }

  if (errors.length > 0) return { ok: false, errors, published };
  return { ok: true, published: published.length, regions: published };
}

// ── Stats ───────────────────────────────────────────────────────────────────

function stats() {
  const canonical = listRegions();
  const staged = listStagedRegions();
  const dirty = staged.filter(r => {
    const rec = getStaged(r);
    return !!(rec && rec._dirty);
  });
  return {
    canonicalCount: canonical.length,
    stagedCount: staged.length,
    dirty: dirty.length,
    regions: canonical,
    staged: staged,
  };
}

function _wipeForTests() {
  if (process.env.NODE_ENV !== 'test' && !process.env.SCAPE_BUILDER_ALLOW_WIPE) return false;
  if (fs.existsSync(TILEMAP_STAGING)) fs.rmSync(TILEMAP_STAGING, { recursive: true, force: true });
  _ensureDir(TILEMAP_STAGING);
  return true;
}

module.exports = {
  // Region lists
  listRegions, listStagedRegions,
  // Canonical / staged / merged reads
  getCanonical, getStaged, getMerged, getPalette,
  // Palette helpers
  loadPalettes, paletteFor, tileColor,
  // Mutations
  stageFull, setTile, paintTiles, discard,
  // Publish
  publish,
  // Validation + stats
  validate, stats,
  // Paths (for tests)
  TILEMAP_STAGING, TILEMAPS_CANON, PALETTES_FILE,
  // Test util
  _wipeForTests,
};
