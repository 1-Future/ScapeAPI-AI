// ══════════════════════════════════════════════════════════════════════════════
// Builder Staging — writable, schema-driven entity editor state
//
// DMs edit registry entities here without touching the live content files.
// Drafts persist across sessions in data/builder-staging/<type>/<id>.json.
// Publishing promotes staged entities into data/builder-staging/_overrides.json
// which src/content/aelgard/builder-overrides.js reads at boot and applies via
// the normal define*/override* paths.
//
// Soft-delete moves staged files to data/builder-staging/_trash/<type>/<id>.json.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const STAGING_ROOT = path.join(DATA_DIR, 'builder-staging');
const TRASH_ROOT = path.join(STAGING_ROOT, '_trash');
const OVERRIDES_FILE = path.join(STAGING_ROOT, '_overrides.json');
// Canonical override file that applyOverridesAtBoot() reads. Kept in sync
// with OVERRIDES_FILE on every publish so external readers (e.g. codex
// regeneration) can point to a stable path outside the staging dir.
const PUBLISHED_OVERRIDES_FILE = path.join(DATA_DIR, 'builder-overrides.json');
const SNAPSHOTS_DIR = path.join(STAGING_ROOT, '_snapshots');
const AUDIT_LOG = path.join(DATA_DIR, 'builder-audit.log');
const SCHEMAS_DIR = path.join(__dirname, 'schemas');

// Pull in the tilemap editor so its publish runs alongside entity publish.
// Require is lazy to keep load-order simple and allow tests to stub.
let _tilemapEditor = null;
function _getTilemapEditor() {
  if (!_tilemapEditor) {
    try { _tilemapEditor = require('./tilemap-editor'); }
    catch (e) { _tilemapEditor = { publish: () => ({ ok: true, published: 0, regions: [] }) }; }
  }
  return _tilemapEditor;
}

// ── Schemas ───────────────────────────────────────────────────────────────────

const _schemaCache = new Map();

function loadSchema(type) {
  if (_schemaCache.has(type)) return _schemaCache.get(type);
  const filePath = path.join(SCHEMAS_DIR, `${type}.json`);
  if (!fs.existsSync(filePath)) return null;
  try {
    const schema = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    _schemaCache.set(type, schema);
    return schema;
  } catch (e) {
    console.error(`[staging] Failed to parse schema ${type}:`, e.message);
    return null;
  }
}

function listSchemas() {
  if (!fs.existsSync(SCHEMAS_DIR)) return [];
  return fs.readdirSync(SCHEMAS_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => f.slice(0, -5))
    .sort();
}

function listTypes() {
  return listSchemas().map(type => {
    const s = loadSchema(type);
    return { type, label: s?.label || type, description: s?.description || '' };
  });
}

// ── File helpers ──────────────────────────────────────────────────────────────

function _ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }

function _typeDir(type) {
  const dir = path.join(STAGING_ROOT, type);
  _ensureDir(dir);
  return dir;
}

function _entityPath(type, id) {
  return path.join(_typeDir(type), `${_sanitize(id)}.json`);
}

function _trashDir(type) {
  const dir = path.join(TRASH_ROOT, type);
  _ensureDir(dir);
  return dir;
}

function _sanitize(id) {
  return String(id).toLowerCase().replace(/[^a-z0-9_\-]/g, '_');
}

function _now() { return new Date().toISOString(); }

// ── Validation — both server-side and used by tests ───────────────────────────

function validate(type, data) {
  const schema = loadSchema(type);
  if (!schema) return { ok: false, errors: [`Unknown entity type: ${type}`] };
  const errors = [];
  _validateFields(schema.fields || [], data || {}, '', errors);
  return { ok: errors.length === 0, errors };
}

function _validateFields(fields, data, prefix, errors) {
  for (const f of fields) {
    const keyPath = prefix ? `${prefix}.${f.key}` : f.key;
    const v = data[f.key];
    const missing = v === undefined || v === null || v === '';
    if (f.required && missing) {
      errors.push(`${keyPath}: required`);
      continue;
    }
    if (missing) continue;
    const t = f.type;
    if (t === 'string' || t === 'markdown') {
      if (typeof v !== 'string') errors.push(`${keyPath}: must be string`);
    } else if (t === 'int') {
      if (!Number.isFinite(v) || !Number.isInteger(v)) errors.push(`${keyPath}: must be integer`);
    } else if (t === 'float') {
      if (!Number.isFinite(v)) errors.push(`${keyPath}: must be number`);
    } else if (t === 'bool') {
      if (typeof v !== 'boolean') errors.push(`${keyPath}: must be boolean`);
    } else if (t === 'enum') {
      if (!Array.isArray(f.values) || !f.values.includes(v)) {
        errors.push(`${keyPath}: must be one of ${JSON.stringify(f.values)}`);
      }
    } else if (t === 'tuple_int_int') {
      if (!Array.isArray(v) || v.length !== 2 || !Number.isInteger(v[0]) || !Number.isInteger(v[1])) {
        errors.push(`${keyPath}: must be [int, int]`);
      } else if (v[0] > v[1]) {
        errors.push(`${keyPath}: min (${v[0]}) > max (${v[1]})`);
      }
    } else if (t === 'int_or_range') {
      const bad = !(Number.isInteger(v) || (Array.isArray(v) && v.length === 2 && Number.isInteger(v[0]) && Number.isInteger(v[1])));
      if (bad) errors.push(`${keyPath}: must be int or [int, int]`);
    } else if (t === 'string_list') {
      if (!Array.isArray(v) || !v.every(x => typeof x === 'string')) errors.push(`${keyPath}: must be string[]`);
    } else if (t === 'kv_int') {
      if (typeof v !== 'object' || Array.isArray(v)) errors.push(`${keyPath}: must be object`);
      else for (const [k, val] of Object.entries(v)) {
        if (!Number.isInteger(val)) errors.push(`${keyPath}.${k}: must be int`);
      }
    } else if (t === 'obj_list') {
      if (!Array.isArray(v)) { errors.push(`${keyPath}: must be array`); continue; }
      v.forEach((item, i) => _validateFields(f.fields || [], item || {}, `${keyPath}[${i}]`, errors));
    } else if (t === 'object') {
      if (typeof v !== 'object' || Array.isArray(v)) { errors.push(`${keyPath}: must be object`); continue; }
      _validateFields(f.fields || [], v, keyPath, errors);
    } else if (t === 'region_picker') {
      if (typeof v !== 'string') errors.push(`${keyPath}: must be region id string`);
    }
    // Unknown types: accept as-is (forward-compat)
  }
}

// ── Listing & fetching ────────────────────────────────────────────────────────

function list(type) {
  const schema = loadSchema(type);
  if (!schema) return null;
  const dir = _typeDir(type);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  const out = [];
  for (const f of files) {
    try {
      const raw = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      out.push({
        id: raw.id,
        name: raw.name || raw.id,
        _staged: true,
        _dirty: !!raw._dirty,
        _published: !!raw._published,
        _updatedAt: raw._updatedAt,
      });
    } catch (e) {
      // Skip unparseable files
    }
  }
  // Sort by name
  out.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  return out;
}

function get(type, id) {
  const schema = loadSchema(type);
  if (!schema) return null;
  const filePath = _entityPath(type, id);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    return null;
  }
}

// ── Mutations ─────────────────────────────────────────────────────────────────

let _autoIdCounter = 0;

function _autoId(type) {
  const schema = loadSchema(type);
  const prefix = (schema && schema.idPrefix) || (type + '_');
  const stamp = Date.now().toString(36);
  const seq = (_autoIdCounter++).toString(36);
  return `${prefix}${stamp}${seq}`;
}

function create(type, data) {
  const schema = loadSchema(type);
  if (!schema) return { ok: false, errors: [`Unknown type: ${type}`] };
  const id = (data && data.id) || _autoId(type);
  const rec = Object.assign({}, data || {}, { id });
  // Auto-fill name if missing
  if (!rec.name) rec.name = id;
  const v = validate(type, rec);
  if (!v.ok) return { ok: false, errors: v.errors };
  // Disallow overwrite
  if (fs.existsSync(_entityPath(type, id))) {
    return { ok: false, errors: [`id already exists: ${id}`] };
  }
  rec._dirty = true;
  rec._published = false;
  rec._createdAt = _now();
  rec._updatedAt = rec._createdAt;
  fs.writeFileSync(_entityPath(type, id), JSON.stringify(rec, null, 2));
  return { ok: true, entity: rec };
}

function update(type, id, data) {
  const schema = loadSchema(type);
  if (!schema) return { ok: false, errors: [`Unknown type: ${type}`] };
  const existing = get(type, id);
  if (!existing) return { ok: false, errors: [`not found: ${id}`] };
  const merged = Object.assign({}, existing, data || {});
  // Enforce readonly_after_create
  for (const f of (schema.fields || [])) {
    if (f.readonly_after_create && data && data[f.key] !== undefined && data[f.key] !== existing[f.key]) {
      return { ok: false, errors: [`${f.key}: readonly after create`] };
    }
  }
  merged.id = existing.id; // force id immutable
  const v = validate(type, merged);
  if (!v.ok) return { ok: false, errors: v.errors };
  merged._dirty = true;
  merged._published = false;
  merged._updatedAt = _now();
  if (!merged._createdAt) merged._createdAt = merged._updatedAt;
  fs.writeFileSync(_entityPath(type, id), JSON.stringify(merged, null, 2));
  return { ok: true, entity: merged };
}

function remove(type, id) {
  const schema = loadSchema(type);
  if (!schema) return { ok: false, errors: [`Unknown type: ${type}`] };
  const filePath = _entityPath(type, id);
  if (!fs.existsSync(filePath)) return { ok: false, errors: [`not found: ${id}`] };
  const trashPath = path.join(_trashDir(type), `${_sanitize(id)}.${Date.now()}.json`);
  fs.renameSync(filePath, trashPath);
  return { ok: true, trashedAt: trashPath };
}

function restore(type, id) {
  // Restore most recent trashed entry
  const tDir = _trashDir(type);
  const files = fs.readdirSync(tDir)
    .filter(f => f.startsWith(`${_sanitize(id)}.`) && f.endsWith('.json'))
    .sort()
    .reverse();
  if (files.length === 0) return { ok: false, errors: [`no trash for: ${id}`] };
  const src = path.join(tDir, files[0]);
  const dst = _entityPath(type, id);
  if (fs.existsSync(dst)) return { ok: false, errors: [`${id} already exists in staging`] };
  fs.renameSync(src, dst);
  return { ok: true };
}

// ── Stats ─────────────────────────────────────────────────────────────────────

function stats() {
  const out = { types: {}, total: 0, dirty: 0, published: 0 };
  for (const type of listSchemas()) {
    const entries = list(type) || [];
    out.types[type] = {
      count: entries.length,
      dirty: entries.filter(e => e._dirty).length,
      published: entries.filter(e => e._published).length,
    };
    out.total += entries.length;
    out.dirty += out.types[type].dirty;
    out.published += out.types[type].published;
  }
  return out;
}

// ── Publish ───────────────────────────────────────────────────────────────────
// Collects all staged entities, validates each, writes a consolidated
// overrides JSON that can be replayed at boot, and marks each staged file
// as _published:true, _dirty:false.
//
// Side effects (in order):
//   1. Snapshot prior builder-overrides.json into data/builder-staging/_snapshots/
//   2. Write consolidated overrides to data/builder-staging/_overrides.json AND
//      data/builder-overrides.json (the canonical path used at boot).
//   3. Mark each staged entity file as _published:true, _dirty:false.
//   4. Invoke tilemap-editor.publish() so world edits flow in the same commit.
//   5. Re-apply overrides to live engine registries (hot-reload).
//   6. Append an entry to data/builder-audit.log.

function _hashOverrides(overrides) {
  const h = crypto.createHash('sha256');
  h.update(JSON.stringify(overrides || {}));
  return h.digest('hex');
}

function _countEntities(overrides) {
  if (!overrides || !overrides.types) return 0;
  let n = 0;
  for (const arr of Object.values(overrides.types)) {
    if (Array.isArray(arr)) n += arr.length;
  }
  return n;
}

function _snapshotCurrent() {
  _ensureDir(SNAPSHOTS_DIR);
  // Prefer the canonical file, fall back to the staging file
  const src = fs.existsSync(PUBLISHED_OVERRIDES_FILE) ? PUBLISHED_OVERRIDES_FILE
            : (fs.existsSync(OVERRIDES_FILE) ? OVERRIDES_FILE : null);
  if (!src) return null;
  const ts = _now().replace(/[:.]/g, '-');
  const dst = path.join(SNAPSHOTS_DIR, `overrides.${ts}.json`);
  try {
    fs.copyFileSync(src, dst);
    return dst;
  } catch (e) {
    return null;
  }
}

function _appendAuditLog(entry) {
  try {
    _ensureDir(DATA_DIR);
    fs.appendFileSync(AUDIT_LOG, JSON.stringify(entry) + '\n');
    return true;
  } catch (e) {
    return false;
  }
}

function publish(options = {}) {
  const playerId = (options && options.playerId) || 'unknown';
  const overrides = { publishedAt: _now(), types: {} };
  const errors = [];
  const marked = [];

  for (const type of listSchemas()) {
    const entries = list(type) || [];
    overrides.types[type] = [];
    for (const meta of entries) {
      const ent = get(type, meta.id);
      if (!ent) continue;
      const v = validate(type, ent);
      if (!v.ok) {
        errors.push({ type, id: meta.id, errors: v.errors });
        continue;
      }
      // Strip internal flags before persisting to overrides
      const clean = Object.assign({}, ent);
      delete clean._dirty; delete clean._published;
      delete clean._createdAt; delete clean._updatedAt;
      overrides.types[type].push(clean);
      marked.push({ type, id: meta.id });
    }
  }

  if (errors.length > 0) return { ok: false, errors };

  // 1. Snapshot the existing overrides before overwriting
  const snapshotPath = _snapshotCurrent();

  // 2. Persist new overrides (both staging + canonical locations)
  _ensureDir(STAGING_ROOT);
  _ensureDir(DATA_DIR);
  const payload = JSON.stringify(overrides, null, 2);
  fs.writeFileSync(OVERRIDES_FILE, payload);
  fs.writeFileSync(PUBLISHED_OVERRIDES_FILE, payload);

  // 3. Mark each file as published
  for (const m of marked) {
    const filePath = _entityPath(m.type, m.id);
    if (fs.existsSync(filePath)) {
      try {
        const rec = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        rec._dirty = false;
        rec._published = true;
        rec._publishedAt = overrides.publishedAt;
        fs.writeFileSync(filePath, JSON.stringify(rec, null, 2));
      } catch {}
    }
  }

  // 4. Publish tilemap edits alongside entity edits (best-effort)
  let tilemapResult = { ok: true, published: 0, regions: [] };
  try {
    tilemapResult = _getTilemapEditor().publish();
  } catch (e) {
    tilemapResult = { ok: false, errors: [String(e && e.message || e)] };
  }

  // 5. Best-effort reload of engine content
  _tryApplyOverrides(overrides);

  // 6. Audit log entry
  const hash = _hashOverrides(overrides);
  const auditEntry = {
    ts: overrides.publishedAt,
    action: 'publish',
    playerId,
    entitiesChanged: marked.length,
    tilemapRegionsChanged: tilemapResult.published || 0,
    hashOfOverrides: hash,
    snapshotPath,
  };
  _appendAuditLog(auditEntry);

  return {
    ok: true,
    published: marked.length,
    tilemap: tilemapResult,
    overridesFile: PUBLISHED_OVERRIDES_FILE,
    stagingFile: OVERRIDES_FILE,
    hash,
    snapshotPath,
    auditEntry,
  };
}

function readOverrides() {
  // Prefer canonical file; fall back to staging file
  for (const p of [PUBLISHED_OVERRIDES_FILE, OVERRIDES_FILE]) {
    if (fs.existsSync(p)) {
      try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
      catch { /* try next */ }
    }
  }
  return null;
}

// ── Audit log helpers ────────────────────────────────────────────────────────

function readAuditLog(limit = 50) {
  if (!fs.existsSync(AUDIT_LOG)) return [];
  try {
    const lines = fs.readFileSync(AUDIT_LOG, 'utf8').split('\n').filter(Boolean);
    const entries = [];
    for (const line of lines) {
      try { entries.push(JSON.parse(line)); } catch {}
    }
    return entries.slice(-Math.max(1, limit));
  } catch {
    return [];
  }
}

// ── Rollback — restore the most recent snapshot, apply to engine ────────────

function rollback(options = {}) {
  const playerId = (options && options.playerId) || 'unknown';
  if (!fs.existsSync(SNAPSHOTS_DIR)) {
    return { ok: false, error: 'no snapshots available' };
  }
  const snapshots = fs.readdirSync(SNAPSHOTS_DIR)
    .filter(f => f.startsWith('overrides.') && f.endsWith('.json'))
    .sort();
  if (snapshots.length === 0) {
    return { ok: false, error: 'no snapshots available' };
  }
  const latest = snapshots[snapshots.length - 1];
  const snapPath = path.join(SNAPSHOTS_DIR, latest);
  let data;
  try {
    data = JSON.parse(fs.readFileSync(snapPath, 'utf8'));
  } catch (e) {
    return { ok: false, error: 'snapshot unreadable: ' + e.message };
  }
  // Move the snapshot aside so a second rollback goes further back
  const consumedDir = path.join(SNAPSHOTS_DIR, '_consumed');
  _ensureDir(consumedDir);
  try { fs.renameSync(snapPath, path.join(consumedDir, latest)); } catch {}

  // Write restored data into both overrides locations
  const payload = JSON.stringify(data, null, 2);
  fs.writeFileSync(OVERRIDES_FILE, payload);
  fs.writeFileSync(PUBLISHED_OVERRIDES_FILE, payload);

  // Re-apply to engine
  _tryApplyOverrides(data);

  // Audit
  const hash = _hashOverrides(data);
  const entry = {
    ts: _now(),
    action: 'rollback',
    playerId,
    entitiesChanged: _countEntities(data),
    restoredFrom: latest,
    hashOfOverrides: hash,
  };
  _appendAuditLog(entry);

  return { ok: true, restoredFrom: latest, entitiesRestored: _countEntities(data), hash, auditEntry: entry };
}

// ── Preview — diff against what the codex would look like after publish ─────
// Cheap, heuristic preview: rather than regenerating every HTML page, we
// compute the set of (type, id) pairs that would change between the current
// published overrides and the staged tree, plus a short per-page impact list.

function preview() {
  const currentPublished = readOverrides() || { types: {} };
  const currentById = {};
  for (const [type, arr] of Object.entries(currentPublished.types || {})) {
    for (const e of (arr || [])) currentById[`${type}/${e.id}`] = e;
  }

  // Build a candidate "next" overrides set = current ∪ staged-valid-entities
  const next = { publishedAt: _now(), types: {} };
  const changed = [];
  const validationErrors = [];

  for (const type of listSchemas()) {
    next.types[type] = [];
    const entries = list(type) || [];
    for (const meta of entries) {
      const ent = get(type, meta.id);
      if (!ent) continue;
      const v = validate(type, ent);
      if (!v.ok) {
        validationErrors.push({ type, id: meta.id, errors: v.errors });
        continue;
      }
      const clean = Object.assign({}, ent);
      delete clean._dirty; delete clean._published;
      delete clean._createdAt; delete clean._updatedAt;
      next.types[type].push(clean);
      const key = `${type}/${meta.id}`;
      const before = currentById[key];
      if (!before || JSON.stringify(before) !== JSON.stringify(clean)) {
        changed.push({ type, id: meta.id, action: before ? 'update' : 'create' });
      }
    }
  }

  // Rough mapping of entity-types to codex pages they feed.
  const PAGE_MAP = {
    quest:             ['quests.html'],
    item:              ['items.html'],
    recipe:            ['items.html', 'skills.html'],
    training_method:   ['skills.html'],
    monster:           ['regions.html', 'bosses.html'],
    boss:              ['bosses.html'],
    npc:               ['regions.html'],
    area_gate:         ['regions.html'],
    breakpoint:        ['breakpoints.html'],
    combination:       ['items.html'],
    shop:              ['regions.html'],
    minigame:          ['regions.html'],
    region:            ['regions.html'],
  };
  const affectedPages = new Set(['index.html']); // index always touched
  for (const c of changed) {
    for (const p of (PAGE_MAP[c.type] || [])) affectedPages.add(p);
  }

  // Tilemap diffs (if the editor is present)
  let tilemapChanged = [];
  try {
    const tm = _getTilemapEditor();
    if (tm && typeof tm.listStagedRegions === 'function') {
      tilemapChanged = tm.listStagedRegions();
      if (tilemapChanged.length > 0) affectedPages.add('regions.html');
    }
  } catch {}

  return {
    ok: validationErrors.length === 0,
    changedEntities: changed,
    changedTilemaps: tilemapChanged,
    affectedPages: Array.from(affectedPages).sort(),
    validationErrors,
    currentCount: _countEntities(currentPublished),
    nextCount: _countEntities(next),
    hashCurrent: _hashOverrides(currentPublished),
    hashNext: _hashOverrides(next),
  };
}

// ── Engine integration ──────────────────────────────────────────────────────
// Apply the published overrides to the live engine registries. Best-effort —
// any missing module is skipped. This is the "reload the relevant content
// modules" hook described in the task.

function _tryApplyOverrides(overrides) {
  if (!overrides || !overrides.types) return;

  for (const [type, entities] of Object.entries(overrides.types)) {
    if (!Array.isArray(entities) || entities.length === 0) continue;
    try {
      if (type === 'item') {
        const items = require('../data/items');
        for (const e of entities) {
          const idNum = _parseIntId(e.id);
          items.define(Object.assign({}, e, { id: idNum || undefined }));
        }
      } else if (type === 'monster' || type === 'boss') {
        const npcs = require('../world/npcs');
        for (const e of entities) {
          npcs.defineNpc(e.id, Object.assign({}, e, { combat: e.combatLevel }));
        }
      } else if (type === 'npc') {
        const npcs = require('../world/npcs');
        for (const e of entities) {
          npcs.defineNpc(e.id, Object.assign({ combat: 0, canMove: e.canMove }, e));
        }
      } else if (type === 'quest') {
        const quests = require('../data/quests');
        for (const e of entities) quests.define(e.id, e);
      } else if (type === 'recipe') {
        const recipes = require('../data/recipes');
        for (const e of entities) recipes.define(Object.assign({}, e));
      } else if (type === 'training_method') {
        const rel = require('../data/relationships');
        for (const e of entities) {
          const knobs = e.knobs || {};
          rel.defineTrainingMethod(e.id, {
            skill: e.skill, name: e.name,
            levelRange: e.levelRange, xpPerHour: e.xpPerHour,
            prerequisites: e.prerequisites || {},
            resourceOutput: knobs.resourceOutput || { produces: [], net: 'neutral' },
            bankingFrequency: knobs.bankingFrequency || 'moderate',
            costPerHour: knobs.costPerHour || 0,
            danger: knobs.danger || 'none',
            complexity: knobs.complexity || 'simple',
            attention: knobs.attention || 'low',
            inputs: knobs.inputs || [],
            description: e.description, location: e.location,
            members: e.members, ironmanViable: e.ironmanViable,
            breakpointAt: e.breakpointAt,
          });
        }
      } else if (type === 'combination') {
        const rel = require('../data/relationships');
        for (const e of entities) rel.defineCombination(e.id, e);
      } else if (type === 'area_gate') {
        const rel = require('../data/relationships');
        for (const e of entities) rel.defineAreaGate(e.id, e);
      } else if (type === 'breakpoint') {
        const rel = require('../data/relationships');
        for (const e of entities) rel.defineBreakpoint(e);
      } else if (type === 'shop') {
        const shops = require('../data/shops');
        if (shops && shops.define) for (const e of entities) shops.define(e.id, e);
      }
      // minigame, region: stored only; no runtime module yet.
    } catch (e) {
      console.warn(`[staging] Failed to apply overrides for ${type}:`, e.message);
    }
  }
}

function _parseIntId(id) {
  const m = /(\d+)$/.exec(String(id));
  return m ? parseInt(m[1], 10) : null;
}

// Boot-time loader: replay published overrides into engine at startup.
function applyOverridesAtBoot() {
  const o = readOverrides();
  if (o) _tryApplyOverrides(o);
}

// ── Admin-only reset (used by tests) ──────────────────────────────────────────
function _wipeForTests() {
  if (process.env.NODE_ENV !== 'test' && !process.env.SCAPE_BUILDER_ALLOW_WIPE) return false;
  const rm = (p) => { if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true }); };
  rm(STAGING_ROOT);
  rm(PUBLISHED_OVERRIDES_FILE);
  rm(AUDIT_LOG);
  _ensureDir(STAGING_ROOT);
  return true;
}

module.exports = {
  // Schema
  loadSchema, listSchemas, listTypes,
  // Entities
  list, get, create, update, remove, restore,
  // Validation
  validate,
  // Publish
  publish, readOverrides, applyOverridesAtBoot,
  // Audit / rollback / preview
  readAuditLog, rollback, preview,
  // Stats
  stats,
  // Paths (for tests)
  STAGING_ROOT, OVERRIDES_FILE, PUBLISHED_OVERRIDES_FILE,
  SNAPSHOTS_DIR, AUDIT_LOG, SCHEMAS_DIR,
  // Test utils
  _wipeForTests,
};
