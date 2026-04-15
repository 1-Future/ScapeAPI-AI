// ══════════════════════════════════════════════════════════════════════════════
// Sprite Registry
//
// Loads data/sprite-manifest.json and data/sprite-palettes.json and exposes
// lookup helpers for the rest of the engine. Content modules do not embed
// sprite fields (too brittle to edit existing JS). Instead, all sprite
// resolution flows through this module, which cross-references by entity
// defId / name / region.
//
// Usage:
//   const sprites = require('./sprite-registry');
//   sprites.getSprite(400, 'item')        -> 'sootworks/bronze_dagger'
//   sprites.getSprite('goblin', 'monster')-> 'heartlands/goblin'
//   sprites.getSpriteInfo('heartlands/goblin') -> { description, frames, ... }
//   sprites.allSpritesForRegion('heartlands') -> [ ... ]
//   sprites.getPalette('moryskah')        -> { dominant, accent, mood, ... }
//   sprites.validateAllEntities()         -> { missing: [], dead: [], stats }
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const fs = require('fs');
const path = require('path');

// ── Paths ────────────────────────────────────────────────────────────────────

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const MANIFEST_CANDIDATES = [
  path.join(REPO_ROOT, 'data', 'sprite-manifest.json'),
  // If the repo's /data is gitignored on a given box, manifest may sit under
  // the main ScapeAI checkout rather than a worktree copy.
  'C:/Users/username/ScapeAI/data/sprite-manifest.json',
];
const PALETTE_CANDIDATES = [
  path.join(REPO_ROOT, 'data', 'sprite-palettes.json'),
  'C:/Users/username/ScapeAI/data/sprite-palettes.json',
];

// ── Lazy state ───────────────────────────────────────────────────────────────

let _manifest = null;
let _palettes = null;
let _byDefId = null;      // { kind -> Map<defId, spriteId> }
let _byName = null;       // { kind -> Map<lowerName, spriteId> }
let _bySpriteId = null;   // Map<spriteId, entry>
let _byRegion = null;     // Map<region, Array<entry>>

function _firstExisting(paths) {
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function _load() {
  if (_manifest) return;
  const mp = _firstExisting(MANIFEST_CANDIDATES);
  if (!mp) {
    throw new Error(
      '[sprite-registry] sprite-manifest.json not found. Run: node scripts/gen-sprite-manifest.js'
    );
  }
  _manifest = JSON.parse(fs.readFileSync(mp, 'utf8'));

  const pp = _firstExisting(PALETTE_CANDIDATES);
  _palettes = pp ? JSON.parse(fs.readFileSync(pp, 'utf8')) : {};

  _byDefId = {};
  _byName = {};
  _bySpriteId = new Map();
  _byRegion = new Map();

  for (const entry of _manifest.sprites) {
    _bySpriteId.set(entry.id, entry);
    if (!_byRegion.has(entry.region)) _byRegion.set(entry.region, []);
    _byRegion.get(entry.region).push(entry);

    if (entry.entity) {
      const kind = entry.entity.kind;
      if (!_byDefId[kind]) _byDefId[kind] = new Map();
      if (!_byName[kind]) _byName[kind] = new Map();
      if (entry.entity.defId !== undefined && entry.entity.defId !== null) {
        _byDefId[kind].set(entry.entity.defId, entry.id);
      }
      if (entry.entity.name) {
        _byName[kind].set(String(entry.entity.name).toLowerCase(), entry.id);
      }
    }
  }
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Look up a sprite id by entity reference.
 * @param {string|number} entityId — item defId (number) or npc/monster/boss defId (string).
 * @param {string} entityType — 'item' | 'npc' | 'monster' | 'boss' | 'pet'.
 * @returns {string|null} sprite id like 'heartlands/goblin', or null if not found.
 */
function getSprite(entityId, entityType = 'item') {
  _load();
  const kind = String(entityType).toLowerCase();
  if (_byDefId[kind] && _byDefId[kind].has(entityId)) {
    return _byDefId[kind].get(entityId);
  }
  // Fallback: lookup by lowercase name within the same kind.
  if (typeof entityId === 'string' && _byName[kind] && _byName[kind].has(entityId.toLowerCase())) {
    return _byName[kind].get(entityId.toLowerCase());
  }
  // If caller passed a sprite id directly, return it if known.
  if (typeof entityId === 'string' && _bySpriteId.has(entityId)) return entityId;
  // Cross-kind fallback: creature kinds (npc/monster/boss) share a namespace
  // in practice; the caller may not know which bucket a defId lives in.
  if (kind === 'monster' || kind === 'npc' || kind === 'boss') {
    for (const alt of ['npc','monster','boss']) {
      if (alt === kind) continue;
      if (_byDefId[alt] && _byDefId[alt].has(entityId)) return _byDefId[alt].get(entityId);
      if (typeof entityId === 'string' && _byName[alt] && _byName[alt].has(entityId.toLowerCase())) {
        return _byName[alt].get(entityId.toLowerCase());
      }
    }
  }
  return null;
}

/**
 * Lookup by sprite id directly.
 * @param {string} spriteId
 * @returns {object|null} sprite manifest entry.
 */
function getSpriteInfo(spriteId) {
  _load();
  return _bySpriteId.get(spriteId) || null;
}

/**
 * All sprite entries registered for a region.
 * @param {string} regionId
 * @returns {Array<object>}
 */
function allSpritesForRegion(regionId) {
  _load();
  return _byRegion.get(regionId) || [];
}

/**
 * All sprite entries for a given category.
 * @param {string} category
 * @returns {Array<object>}
 */
function allSpritesForCategory(category) {
  _load();
  return _manifest.sprites.filter(s => s.category === category);
}

/**
 * Asset path for a sprite id, following the manifest's directory convention.
 * @param {string} spriteId
 * @param {object} opts — { animated: boolean } forces sheet or still.
 * @returns {string} relative path under public/.
 */
function spritePath(spriteId, opts = {}) {
  _load();
  const entry = _bySpriteId.get(spriteId);
  if (!entry) return null;
  const isSheet = opts.animated !== undefined ? opts.animated : !!entry.animated;
  const convention = isSheet ? _manifest.conventions.animation_sheet : _manifest.conventions.directory;
  return convention
    .replace('{category}', entry.category)
    .replace('{region}', entry.region)
    .replace('{id}', spriteId.split('/').pop());
}

/**
 * Per-region colour palette.
 * @param {string} regionId
 * @returns {object|null}
 */
function getPalette(regionId) {
  _load();
  return _palettes[regionId] || null;
}

/**
 * List every region that has palette guidance.
 */
function allPalettes() {
  _load();
  return Object.keys(_palettes).filter(k => !k.startsWith('_'));
}

/**
 * Conventions block from the manifest.
 */
function conventions() {
  _load();
  return _manifest.conventions;
}

/**
 * Walk all entity definitions in the game and report which references have
 * matching sprites in the manifest, and which manifest entries are orphaned.
 *
 * @returns {{ missing: Array<object>, dead: Array<object>, stats: object }}
 */
function validateAllEntities() {
  _load();

  // Snapshot the manifest entity-bound entries.
  const manifestEntityEntries = _manifest.sprites.filter(s => s.entity);
  const manifestSeen = new Set(); // sprite ids that matched an in-game entity

  const missing = [];

  // 1. Items
  try {
    const items = _loadItemsDb();
    for (const item of items) {
      const sid = getSprite(item.id, 'item') || getSprite(item.name, 'item');
      if (!sid) {
        missing.push({ kind: 'item', defId: item.id, name: item.name });
      } else {
        manifestSeen.add(sid);
      }
    }
  } catch (e) {
    // Items module not available in this context — skip.
  }

  // 2. NPCs / monsters / bosses via regex scan of content files
  try {
    const entities = _scanNpcDefs();
    for (const ent of entities) {
      const sid = getSprite(ent.defId, ent.kind);
      if (!sid) {
        missing.push(ent);
      } else {
        manifestSeen.add(sid);
      }
    }
  } catch (e) { /* ignore */ }

  // 3. Tiles / landmarks via tilemap JSON
  try {
    const tileRefs = _scanTileRefs();
    for (const ref of tileRefs) {
      if (!_bySpriteId.has(ref.id)) {
        missing.push({ kind: ref.category, defId: ref.id, name: ref.id });
      } else {
        manifestSeen.add(ref.id);
      }
    }
  } catch (e) { /* ignore */ }

  // Dead entries: entity-bound manifest entries that nothing in-game references.
  const dead = [];
  for (const entry of manifestEntityEntries) {
    if (!manifestSeen.has(entry.id)) {
      dead.push({
        spriteId: entry.id,
        kind: entry.entity.kind,
        defId: entry.entity.defId,
        name: entry.entity.name,
      });
    }
  }

  return {
    missing,
    dead,
    stats: {
      total: _manifest.sprites.length,
      matched: manifestSeen.size,
      missing: missing.length,
      dead: dead.length,
    },
  };
}

// ── Internal validators ──────────────────────────────────────────────────────

function _loadItemsDb() {
  const itemsMod = require(path.join(REPO_ROOT, 'src', 'data', 'items.js'));
  const contentFiles = [
    'src/content/aelgard/items-expanded.js',
    'src/content/aelgard/items-blitz.js',
    'src/content/aelgard/items-blitz2.js',
    'src/content/aelgard/items-blitz3.js',
    'src/content/aelgard/items-dragon-barrows.js',
    'src/content/aelgard/universal-items.js',
    'src/content/aelgard/smithing-complete.js',
    'src/content/aelgard/combinations-mega.js',
    'src/content/aelgard/recipes-mega.js',
    'src/content/aelgard/wilderness-content.js',
  ];
  const origLog = console.log;
  console.log = () => {};
  for (const f of contentFiles) {
    try { require(path.join(REPO_ROOT, f)); } catch (_) {}
  }
  console.log = origLog;
  return [...itemsMod.items.values()];
}

function _scanNpcDefs() {
  const dir = path.join(REPO_ROOT, 'src', 'content', 'aelgard');
  const out = [];
  const patterns = [
    { re: /mob\('([^']+)',\s*\{\s*name:\s*'([^']+)'/g, kind: 'monster' },
    { re: /boss\('([^']+)',\s*\{\s*name:\s*'([^']+)'/g, kind: 'boss' },
    { re: /npcs\.defineNpc\('([^']+)',\s*\{\s*name:\s*'([^']+)'/g, kind: 'npc' },
    // monsters-mega uses a wrapper: mega({ id: '...', name: '...', ... })
    // The id/name may be on the same line or on two different lines.
    { re: /mega\(\{\s*\n?\s*id:\s*'([^']+)'\s*,\s*name:\s*'([^']+)'/g, kind: 'monster' },
  ];
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.js')) continue;
    const src = fs.readFileSync(path.join(dir, f), 'utf8');
    for (const p of patterns) {
      let m; p.re.lastIndex = 0;
      while ((m = p.re.exec(src)) !== null) {
        out.push({ kind: p.kind, defId: m[1], name: m[2], file: f });
      }
    }
  }
  return out;
}

function _scanTileRefs() {
  // Prefer worktree-local tilemaps if present, else fall back to main checkout.
  const dirs = [
    path.join(REPO_ROOT, 'data', 'tilemaps'),
    'C:/Users/username/ScapeAI/data/tilemaps',
  ];
  let dir = null;
  for (const d of dirs) { if (fs.existsSync(d)) { dir = d; break; } }
  if (!dir) return [];

  const out = [];
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.json')) continue;
    const tm = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    for (const tv of Object.values(tm.tile_legend || {})) {
      if (!tv.sprite) continue;
      out.push({ id: tv.sprite, category: 'tile' });
    }
    for (const lm of tm.landmarks || []) {
      if (!lm.sprite) continue;
      out.push({ id: lm.sprite, category: 'landmark' });
    }
  }
  return out;
}

// ── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  getSprite,
  getSpriteInfo,
  allSpritesForRegion,
  allSpritesForCategory,
  spritePath,
  getPalette,
  allPalettes,
  conventions,
  validateAllEntities,
  // Test / debug hooks
  _reload: () => { _manifest = null; _load(); },
};
