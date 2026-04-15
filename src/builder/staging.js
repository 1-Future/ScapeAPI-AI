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

const STAGING_ROOT = path.join(__dirname, '..', '..', 'data', 'builder-staging');
const TRASH_ROOT = path.join(STAGING_ROOT, '_trash');
const OVERRIDES_FILE = path.join(STAGING_ROOT, '_overrides.json');
const SCHEMAS_DIR = path.join(__dirname, 'schemas');

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

function publish() {
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

  _ensureDir(STAGING_ROOT);
  fs.writeFileSync(OVERRIDES_FILE, JSON.stringify(overrides, null, 2));

  // Mark each file as published
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

  // Best-effort reload of engine content
  _tryApplyOverrides(overrides);

  return { ok: true, published: marked.length, overridesFile: OVERRIDES_FILE };
}

function readOverrides() {
  if (!fs.existsSync(OVERRIDES_FILE)) return null;
  try { return JSON.parse(fs.readFileSync(OVERRIDES_FILE, 'utf8')); }
  catch { return null; }
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
  // Stats
  stats,
  // Paths (for tests)
  STAGING_ROOT, OVERRIDES_FILE, SCHEMAS_DIR,
  // Test utils
  _wipeForTests,
};
