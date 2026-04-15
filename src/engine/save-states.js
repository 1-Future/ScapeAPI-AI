// ══════════════════════════════════════════════════════════════════════════════
// Save States — Snapshots, Rollbacks, Export/Import
//
// Snapshots live OUTSIDE the gitignored `data/` tree:
//
//   <repo>/snapshots/<playerId>/<timestamp>.json
//
// Each snapshot file has this shape:
//
//   {
//     version: 1,
//     snapshotId: 'auto-1713200000000' | 'manual-1713200000000-label',
//     playerId: 'alice',
//     playerName: 'Alice',
//     label: 'auto' | 'before-boss' | ... ,
//     kind: 'auto' | 'manual',
//     createdAt: ms epoch,
//     player: <serialized player state, Sets as arrays>,
//   }
//
// Retention:
//   - Manual snapshots: kept indefinitely (unless deleted explicitly).
//   - Auto snapshots:   keep last 30; older auto saves are pruned.
//
// Restoration is ALWAYS destructive — the engine exposes
// `restoreSnapshot(player, snapshotId, { confirm: true })`. A missing or
// false `confirm` returns a structured warning without touching player state.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const fs = require('fs');
const path = require('path');

const SNAPSHOT_ROOT = path.join(__dirname, '..', '..', 'snapshots');
const MAX_AUTO_SNAPSHOTS = 30;
const AUTO_SNAPSHOT_MIN_INTERVAL_MS = 12 * 60 * 60 * 1000; // 12h between auto snapshots
const SNAPSHOT_VERSION = 1;

// Fields that are transient / shouldn't be saved as-is.
const TRANSIENT_KEYS = ['_bankOpen', '_shopOpen', 'ws', 'socket', 'pendingEvent', 'combatTarget'];

function now() { return Date.now(); }

function _dirFor(playerId) {
  const safe = String(playerId).replace(/[^a-zA-Z0-9_\-]/g, '_');
  return path.join(SNAPSHOT_ROOT, safe);
}

function _ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function _serialize(player) {
  const out = {};
  for (const k of Object.keys(player)) {
    if (TRANSIENT_KEYS.includes(k)) continue;
    const v = player[k];
    if (v instanceof Set) out[k] = [...v];
    else if (v instanceof Map) out[k] = [...v.entries()];
    else out[k] = v;
  }
  // Deep-clone via JSON round-trip to strip any remaining non-serializable values.
  return JSON.parse(JSON.stringify(out));
}

function _deserialize(serialized) {
  // Return a plain object — caller decides how to merge back into live player.
  return JSON.parse(JSON.stringify(serialized));
}

function _filenameFor(snapshotId) {
  return `${snapshotId}.json`;
}

function _idFromFilename(f) {
  return f.replace(/\.json$/, '');
}

function _parseSnapshotId(id) {
  // Shape: "<kind>-<ts>[-<label>]"
  const m = String(id).match(/^(auto|manual)-(\d+)(?:-(.+))?$/);
  if (!m) return null;
  return { kind: m[1], ts: Number(m[2]), label: m[3] || m[1] };
}

// ── Snapshot CRUD ───────────────────────────────────────────────────────────

/**
 * createSnapshot(player, label='auto') -> { ok, snapshotId, path }
 * label: an alphanumeric tag or 'auto'. Auto snapshots are subject to pruning.
 */
function createSnapshot(player, label) {
  if (!player || player.id == null) return { ok: false, reason: 'player.id required' };
  const rawLabel = String(label || 'auto').toLowerCase().trim();
  const kind = rawLabel === 'auto' ? 'auto' : 'manual';
  const safeLabel = rawLabel.replace(/[^a-z0-9_\-]/g, '-').slice(0, 40) || 'snapshot';
  const ts = now();
  const snapshotId = (kind === 'auto')
    ? `auto-${ts}`
    : `manual-${ts}-${safeLabel}`;
  const dir = _dirFor(player.id);
  _ensureDir(dir);
  const filePath = path.join(dir, _filenameFor(snapshotId));
  const payload = {
    version: SNAPSHOT_VERSION,
    snapshotId,
    playerId: player.id,
    playerName: player.name || null,
    label: safeLabel,
    kind,
    createdAt: ts,
    player: _serialize(player),
  };
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));
  if (kind === 'auto') purgeOldSnapshots(player);
  return { ok: true, snapshotId, path: filePath, kind, label: safeLabel, createdAt: ts };
}

/**
 * listSnapshots(player) -> [{ snapshotId, kind, label, createdAt, size }]
 * Sorted newest-first.
 */
function listSnapshots(player) {
  if (!player || player.id == null) return [];
  const dir = _dirFor(player.id);
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  const out = [];
  for (const f of files) {
    const full = path.join(dir, f);
    const id = _idFromFilename(f);
    const parsed = _parseSnapshotId(id);
    const stat = fs.statSync(full);
    out.push({
      snapshotId: id,
      kind: parsed ? parsed.kind : 'unknown',
      label: parsed ? parsed.label : id,
      createdAt: parsed ? parsed.ts : stat.mtimeMs,
      size: stat.size,
    });
  }
  out.sort((a, b) => b.createdAt - a.createdAt);
  return out;
}

/**
 * readSnapshot(player, snapshotId) -> { ok, snapshot } | { ok:false, reason }
 */
function readSnapshot(player, snapshotId) {
  if (!player || player.id == null) return { ok: false, reason: 'player.id required' };
  const filePath = path.join(_dirFor(player.id), _filenameFor(snapshotId));
  if (!fs.existsSync(filePath)) return { ok: false, reason: 'Snapshot not found.' };
  try {
    const snapshot = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return { ok: true, snapshot };
  } catch (e) {
    return { ok: false, reason: `Failed to parse snapshot: ${e.message}` };
  }
}

/**
 * restoreSnapshot(player, snapshotId, { confirm })
 *
 * DESTRUCTIVE — overwrites all persistent player state. Requires confirm=true.
 * A pre-restore "undo" snapshot is always created first so restores are not
 * irreversible.
 */
function restoreSnapshot(player, snapshotId, opts) {
  if (!player || player.id == null) return { ok: false, reason: 'player.id required' };
  const confirm = !!(opts && opts.confirm);
  if (!confirm) {
    return { ok: false, needsConfirmation: true, reason: 'Restore is destructive. Pass { confirm: true } to proceed.' };
  }
  const r = readSnapshot(player, snapshotId);
  if (!r.ok) return r;

  // Pre-restore safety snapshot.
  const preSnap = createSnapshot(player, 'pre-restore');

  // Apply restoration in place so live refs keep working.
  const fresh = _deserialize(r.snapshot.player);
  // Remove keys that won't be in the snapshot to ensure a true replacement,
  // but preserve transient fields.
  const transientBackup = {};
  for (const k of TRANSIENT_KEYS) {
    if (k in player) transientBackup[k] = player[k];
  }
  for (const k of Object.keys(player)) {
    if (TRANSIENT_KEYS.includes(k)) continue;
    delete player[k];
  }
  for (const k of Object.keys(fresh)) {
    player[k] = fresh[k];
  }
  for (const k of Object.keys(transientBackup)) {
    player[k] = transientBackup[k];
  }
  // Re-hydrate Set fields we know about.
  if (Array.isArray(player.activePrayers)) player.activePrayers = new Set(player.activePrayers);
  else if (!player.activePrayers) player.activePrayers = new Set();

  return {
    ok: true,
    snapshotId,
    restoredFrom: r.snapshot.createdAt,
    undoSnapshotId: preSnap.ok ? preSnap.snapshotId : null,
  };
}

/**
 * deleteSnapshot(player, snapshotId) — only manual snapshots can be deleted
 * via this path. Auto snapshots are pruned automatically.
 */
function deleteSnapshot(player, snapshotId, opts) {
  if (!player || player.id == null) return { ok: false, reason: 'player.id required' };
  const parsed = _parseSnapshotId(snapshotId);
  if (!parsed) return { ok: false, reason: 'Invalid snapshot id.' };
  if (parsed.kind === 'auto' && !(opts && opts.allowAuto)) {
    return { ok: false, reason: 'Auto snapshots cannot be deleted manually.' };
  }
  const filePath = path.join(_dirFor(player.id), _filenameFor(snapshotId));
  if (!fs.existsSync(filePath)) return { ok: false, reason: 'Snapshot not found.' };
  fs.unlinkSync(filePath);
  return { ok: true };
}

// ── Auto snapshot & pruning ─────────────────────────────────────────────────

/**
 * autoSnapshot(player) — called by the daily tick (or an external scheduler).
 * Skips if an auto snapshot was taken in the last AUTO_SNAPSHOT_MIN_INTERVAL_MS.
 */
function autoSnapshot(player) {
  if (!player || player.id == null) return { ok: false, reason: 'player.id required' };
  const list = listSnapshots(player).filter(s => s.kind === 'auto');
  if (list.length > 0) {
    const latest = list[0];
    if ((now() - latest.createdAt) < AUTO_SNAPSHOT_MIN_INTERVAL_MS) {
      return { ok: false, skipped: true, reason: 'Recent auto snapshot exists.' };
    }
  }
  return createSnapshot(player, 'auto');
}

/**
 * purgeOldSnapshots(player) — keeps the newest MAX_AUTO_SNAPSHOTS auto
 * snapshots and ALL manual snapshots (manual is unlimited).
 */
function purgeOldSnapshots(player) {
  if (!player || player.id == null) return { ok: false, reason: 'player.id required' };
  const all = listSnapshots(player);
  const autos = all.filter(s => s.kind === 'auto');
  const deleted = [];
  if (autos.length > MAX_AUTO_SNAPSHOTS) {
    const toDelete = autos.slice(MAX_AUTO_SNAPSHOTS);
    for (const s of toDelete) {
      const fp = path.join(_dirFor(player.id), _filenameFor(s.snapshotId));
      if (fs.existsSync(fp)) { fs.unlinkSync(fp); deleted.push(s.snapshotId); }
    }
  }
  return { ok: true, deleted, keptAuto: Math.min(autos.length, MAX_AUTO_SNAPSHOTS), keptManual: all.length - autos.length };
}

// ── Export / Import ─────────────────────────────────────────────────────────

/**
 * exportSave(player) -> JSON string
 * Complete backup: profile + security hashes + skills + inventory + snapshots index.
 * Note: security hashes ARE exported (the hash, never the plaintext). Operator must
 * treat these files as sensitive.
 */
function exportSave(player) {
  if (!player || player.id == null) return JSON.stringify({ ok: false, reason: 'player.id required' });
  const payload = {
    version: SNAPSHOT_VERSION,
    exportedAt: now(),
    playerId: player.id,
    playerName: player.name || null,
    player: _serialize(player),
    snapshotsIndex: listSnapshots(player),
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * importSave(player, json) -> { ok, restoredFields } | { ok:false, reason }
 *
 * Full replacement of player state. Always creates a pre-import snapshot.
 * The caller should confirm with the user before calling. If confirm !== true,
 * returns a needsConfirmation response.
 */
function importSave(player, json, opts) {
  if (!player || player.id == null) return { ok: false, reason: 'player.id required' };
  const confirm = !!(opts && opts.confirm);
  if (!confirm) return { ok: false, needsConfirmation: true, reason: 'Import is destructive. Pass { confirm: true } to proceed.' };
  let parsed;
  try { parsed = (typeof json === 'string') ? JSON.parse(json) : json; }
  catch (e) { return { ok: false, reason: `Invalid JSON: ${e.message}` }; }
  if (!parsed || !parsed.player || typeof parsed.player !== 'object') {
    return { ok: false, reason: 'Not a valid save export.' };
  }
  if (parsed.version !== SNAPSHOT_VERSION) {
    return { ok: false, reason: `Unsupported save version: ${parsed.version}` };
  }
  const preSnap = createSnapshot(player, 'pre-import');
  const fresh = _deserialize(parsed.player);
  const transientBackup = {};
  for (const k of TRANSIENT_KEYS) if (k in player) transientBackup[k] = player[k];
  for (const k of Object.keys(player)) {
    if (TRANSIENT_KEYS.includes(k)) continue;
    delete player[k];
  }
  for (const k of Object.keys(fresh)) player[k] = fresh[k];
  for (const k of Object.keys(transientBackup)) player[k] = transientBackup[k];
  if (Array.isArray(player.activePrayers)) player.activePrayers = new Set(player.activePrayers);
  else if (!player.activePrayers) player.activePrayers = new Set();

  return {
    ok: true,
    restoredFields: Object.keys(fresh).length,
    undoSnapshotId: preSnap.ok ? preSnap.snapshotId : null,
  };
}

// ── Exports ─────────────────────────────────────────────────────────────────

module.exports = {
  createSnapshot, listSnapshots, readSnapshot, restoreSnapshot, deleteSnapshot,
  autoSnapshot, purgeOldSnapshots,
  exportSave, importSave,
  SNAPSHOT_ROOT, MAX_AUTO_SNAPSHOTS, AUTO_SNAPSHOT_MIN_INTERVAL_MS, SNAPSHOT_VERSION,
};
