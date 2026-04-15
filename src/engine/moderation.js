// ══════════════════════════════════════════════════════════════════════════════
// Moderation — reports, strikes, appeals, mod-action audit log.
//
// Design:
//   - Reports are first-class incidents filed by a reporter against a target
//     for a specific ruleId with attached evidence (chat log, location trail,
//     combat log, free-form reason).
//   - Reports live in data/reports-queue.json and move through states:
//         pending -> upheld | dismissed | escalated
//     Upholding applies a strike using rules.js escalation.
//   - Strikes are durable records on player.strikes[]. Each strike references
//     its originating ruleId, reason, the moderator who applied it, and an
//     expiry tick (for future auto-decay — currently expiresAt is informational
//     only; the escalation logic uses all non-expired strikes).
//   - Appeals file against a specific strikeId. Appeals live in
//     data/appeals-queue.json and move through pending -> approved | denied.
//     Approving an appeal removes the strike (and lifts active mutes/bans that
//     originated from it).
//   - Every moderator action is appended to data/mod-audit.log as a JSON line
//     so we have an immutable audit trail.
//
// This module is storage-agnostic: it calls into persistence.save/load which
// already knows how to write under DATA_DIR. Tests override DATA_DIR via a
// tiny shim on persistence (same pattern used by the ironman tests).
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const fs = require('fs');
const path = require('path');

const events = require('./events');
const rules = require('./rules');
const persistence = require('./persistence');

// ── Storage file names ──────────────────────────────────────────────────────
const REPORTS_FILE = 'reports-queue.json';
const APPEALS_FILE = 'appeals-queue.json';
const STRIKES_FILE = 'strikes-log.json'; // central log mirror (player.strikes is source of truth)
const AUDIT_FILE   = 'mod-audit.log';

// ── Role ladder ─────────────────────────────────────────────────────────────
const ROLES = Object.freeze({
  user:      'user',
  moderator: 'moderator',
  admin:     'admin',
  owner:     'owner',
});

const ROLE_RANK = Object.freeze({
  user: 0,
  moderator: 1,
  admin: 2,
  owner: 3,
});

function roleRank(role) {
  return ROLE_RANK[role] != null ? ROLE_RANK[role] : 0;
}

function hasRole(player, minRole) {
  if (!player) return false;
  const role = getRole(player);
  return roleRank(role) >= roleRank(minRole);
}

function getRole(player) {
  if (!player) return ROLES.user;
  if (player.role && ROLES[player.role]) return player.role;
  // Legacy: some tests and the server set player.admin = true
  if (player.admin === true) return ROLES.admin;
  return ROLES.user;
}

function setRole(promoter, target, newRole) {
  if (!ROLES[newRole]) return { ok: false, reason: `Unknown role: ${newRole}` };
  // Only owners can promote anyone. Owners can also demote any role, including
  // other admins. Admins cannot promote at all (prevents privilege inflation).
  if (!hasRole(promoter, ROLES.owner)) {
    return { ok: false, reason: 'Only the owner can set roles.' };
  }
  if (!target) return { ok: false, reason: 'No target.' };
  const before = getRole(target);
  target.role = newRole;
  if (newRole === ROLES.admin || newRole === ROLES.owner) target.admin = true;
  else target.admin = false;
  audit('role_change', promoter, target, { from: before, to: newRole });
  return { ok: true, from: before, to: newRole };
}

// ── Tick source (optional) ──────────────────────────────────────────────────
let getTick = () => 0;
function setTickSource(fn) { if (typeof fn === 'function') getTick = fn; }

// ── Id generator ────────────────────────────────────────────────────────────
let _idCounter = 1;
function nextId(prefix) {
  const t = Date.now().toString(36);
  const n = (_idCounter++).toString(36);
  return `${prefix}_${t}${n}`;
}
function _resetIdCounter() { _idCounter = 1; }

// ── Queue helpers ───────────────────────────────────────────────────────────
function loadQueue(file) {
  return persistence.load(file, []) || [];
}
function saveQueue(file, arr) {
  persistence.save(file, arr);
}

// ── Audit log ───────────────────────────────────────────────────────────────
function _auditPath() {
  return path.join(persistence.DATA_DIR, AUDIT_FILE);
}

/**
 * audit(action, actor, target, payload)
 * Append a single JSON line to the mod audit log. Never throws — we tolerate
 * disk failures to avoid cascade-killing a mod action.
 */
function audit(action, actor, target, payload) {
  try {
    fs.mkdirSync(persistence.DATA_DIR, { recursive: true });
    const entry = {
      ts: Date.now(),
      tick: getTick(),
      action,
      actor: actor ? { id: actor.id, name: actor.name || null, role: getRole(actor) } : null,
      target: target ? { id: target.id, name: target.name || null } : null,
      payload: payload || null,
    };
    fs.appendFileSync(_auditPath(), JSON.stringify(entry) + '\n');
    return entry;
  } catch (e) {
    console.error('[mod:audit] write failed:', e.message);
    return null;
  }
}

function readAudit() {
  try {
    const fp = _auditPath();
    if (!fs.existsSync(fp)) return [];
    const raw = fs.readFileSync(fp, 'utf8');
    const lines = raw.split('\n').filter(l => l.trim().length > 0);
    return lines.map(l => {
      try { return JSON.parse(l); } catch { return { _corrupt: l }; }
    });
  } catch { return []; }
}

// ── Evidence collectors ─────────────────────────────────────────────────────
// In-memory ring buffers populated by the chat/movement systems. The engine
// wires push* on their side; the moderation module is happy with empty arrays
// if nothing's wired.

const _chatBuffers = new Map();  // playerId -> [{ ts, tick, msg }] (cap 200)
const _locBuffers  = new Map();  // playerId -> [{ ts, tick, x, y, layer }] (cap 200)
const _combatBuffers = new Map(); // playerId -> [{ ts, tick, kind, detail }] (cap 200)

const CHAT_CAP   = 200;
const LOC_CAP    = 200;
const COMBAT_CAP = 200;

function _pushRing(map, key, cap, item) {
  if (!map.has(key)) map.set(key, []);
  const arr = map.get(key);
  arr.push(item);
  while (arr.length > cap) arr.shift();
}

function pushChatLine(playerId, msg) {
  if (playerId == null) return;
  _pushRing(_chatBuffers, playerId, CHAT_CAP, { ts: Date.now(), tick: getTick(), msg: String(msg) });
}
function pushLocation(playerId, x, y, layer) {
  if (playerId == null) return;
  _pushRing(_locBuffers, playerId, LOC_CAP,
    { ts: Date.now(), tick: getTick(), x, y, layer: layer || 0 });
}
function pushCombatEvent(playerId, kind, detail) {
  if (playerId == null) return;
  _pushRing(_combatBuffers, playerId, COMBAT_CAP,
    { ts: Date.now(), tick: getTick(), kind: String(kind), detail: detail == null ? null : detail });
}

function _lastChat(playerId, n) {
  const arr = _chatBuffers.get(playerId) || [];
  return arr.slice(Math.max(0, arr.length - n));
}
function _lastLoc(playerId, sinceTick) {
  const arr = _locBuffers.get(playerId) || [];
  return arr.filter(e => e.tick >= sinceTick);
}
function _lastCombat(playerId, n) {
  const arr = _combatBuffers.get(playerId) || [];
  return arr.slice(Math.max(0, arr.length - n));
}

function _resetBuffers() {
  _chatBuffers.clear();
  _locBuffers.clear();
  _combatBuffers.clear();
}

// ── Reports ─────────────────────────────────────────────────────────────────

/**
 * recordIncident(reporterId, targetId, ruleId, evidence)
 * Files a report. `evidence` is an object the caller supplies (reason,
 * screenshots, notes). The module auto-attaches chat/location/combat
 * history from its ring buffers. Rejects self-reports.
 */
function recordIncident(reporterId, targetId, ruleId, evidence) {
  if (reporterId == null) return { ok: false, reason: 'No reporter.' };
  if (targetId == null)   return { ok: false, reason: 'No target.' };
  if (String(reporterId) === String(targetId)) {
    return { ok: false, reason: 'You cannot report yourself.' };
  }
  const rule = rules.getRule(ruleId);
  if (!rule) return { ok: false, reason: `Unknown rule: ${ruleId}` };

  const tick = getTick();
  const now = Date.now();
  const id = nextId('rep');
  const last5MinTicks = 5 * 60;  // 5 min at 1 tick/sec (approx; game ticks vary)

  const incident = {
    id,
    ruleId,
    reporterId,
    targetId,
    status: 'pending',            // pending | upheld | dismissed | escalated
    resolvedBy: null,
    resolution: null,
    resolvedAt: null,
    filedAt: now,
    filedTick: tick,
    reason: (evidence && evidence.reason) ? String(evidence.reason) : '',
    notes: (evidence && evidence.notes) ? String(evidence.notes) : '',
    evidence: {
      chat:     _lastChat(targetId, 50),
      location: _lastLoc(targetId, tick - last5MinTicks),
      combat:   _lastCombat(targetId, 50),
      extra:    (evidence && evidence.extra) ? evidence.extra : null,
    },
  };
  const queue = loadQueue(REPORTS_FILE);
  queue.push(incident);
  saveQueue(REPORTS_FILE, queue);

  audit('report_filed', { id: reporterId, name: null }, { id: targetId, name: null },
    { reportId: id, ruleId, reason: incident.reason });
  events.emit('mod:report_filed', {
    type: 'mod:report_filed', reportId: id, reporterId, targetId, ruleId, tick,
  });
  return { ok: true, id, incident };
}

function reviewQueue(statusFilter) {
  const queue = loadQueue(REPORTS_FILE);
  if (!statusFilter) return queue.filter(r => r.status === 'pending');
  return queue.filter(r => r.status === statusFilter);
}

function getIncident(id) {
  const queue = loadQueue(REPORTS_FILE);
  return queue.find(r => r.id === id) || null;
}

/**
 * resolveIncident(incidentId, resolution, by, extra)
 *   resolution: 'upheld' | 'dismissed' | 'escalated'
 *   by:         moderator player object (must have moderator+ role)
 *   extra:      optional { resolveNote, getPlayerById }
 *
 * Upheld: applies a strike to the target via applyStrike (using rules.js
 * escalation logic). Requires extra.getPlayerById(id) to locate the target
 * player object so strikes attach to the living player.
 */
function resolveIncident(incidentId, resolution, by, extra) {
  if (!['upheld', 'dismissed', 'escalated'].includes(resolution)) {
    return { ok: false, reason: `Unknown resolution: ${resolution}` };
  }
  if (!hasRole(by, ROLES.moderator)) {
    return { ok: false, reason: 'Moderator role required.' };
  }
  const queue = loadQueue(REPORTS_FILE);
  const idx = queue.findIndex(r => r.id === incidentId);
  if (idx < 0) return { ok: false, reason: `Report not found: ${incidentId}` };
  const rep = queue[idx];
  if (rep.status !== 'pending') {
    return { ok: false, reason: `Report already ${rep.status}.` };
  }
  // Escalation requires admin+ attention in future; we accept it from moderators
  // but the audit records who escalated it.
  if (resolution === 'escalated' && !hasRole(by, ROLES.moderator)) {
    return { ok: false, reason: 'Moderator role required to escalate.' };
  }
  rep.status = resolution;
  rep.resolvedBy = { id: by.id, name: by.name || null, role: getRole(by) };
  rep.resolvedAt = Date.now();
  rep.resolveNote = (extra && extra.resolveNote) ? String(extra.resolveNote) : '';

  let strikeResult = null;
  if (resolution === 'upheld') {
    const target = extra && typeof extra.getPlayerById === 'function'
      ? extra.getPlayerById(rep.targetId) : null;
    if (target) {
      strikeResult = applyStrike(target, rep.ruleId, rep.reason || 'Report upheld.', by, {
        sourceReportId: rep.id,
      });
      rep.strikeId = strikeResult && strikeResult.strike ? strikeResult.strike.id : null;
    } else {
      rep.strikeDeferred = true; // apply later when the player logs in
    }
  }
  saveQueue(REPORTS_FILE, queue);
  audit(`report_${resolution}`, by,
    { id: rep.targetId, name: null },
    { reportId: rep.id, ruleId: rep.ruleId, strikeId: rep.strikeId || null });
  events.emit('mod:report_resolved', {
    type: 'mod:report_resolved',
    reportId: rep.id, resolution, ruleId: rep.ruleId, targetId: rep.targetId,
    tick: getTick(),
  });
  return { ok: true, report: rep, strike: strikeResult };
}

// ── Strikes ─────────────────────────────────────────────────────────────────

/**
 * applyStrike(player, ruleId, reason, by, opts)
 * Records a strike on player.strikes[] and applies the matching escalation
 * action. Also sets player.moderationState so /mute, /ban statuses render
 * uniformly across the engine.
 */
function applyStrike(player, ruleId, reason, by, opts) {
  if (!player) return { ok: false, reason: 'No player.' };
  const rule = rules.getRule(ruleId);
  if (!rule) return { ok: false, reason: `Unknown rule: ${ruleId}` };
  if (by && String(by.id) === String(player.id)) {
    return { ok: false, reason: 'Cannot strike yourself.' };
  }
  if (!hasRole(by, ROLES.moderator) && !(opts && opts.system === true)) {
    return { ok: false, reason: 'Moderator role required.' };
  }
  if (!Array.isArray(player.strikes)) player.strikes = [];
  const strikeCount = player.strikes.filter(s => s.ruleId === ruleId && s.active !== false).length + 1;
  const rung = rules.resolveAction(rule, strikeCount);
  const tick = getTick();
  const strike = {
    id: nextId('strk'),
    ruleId,
    ruleTitle: rule.title,
    severity: rule.severity,
    reason: reason ? String(reason) : '(no reason)',
    action: rung.action,
    duration_days: rung.duration_days,
    appliedBy: by ? { id: by.id, name: by.name || null, role: getRole(by) } : null,
    appliedAt: Date.now(),
    appliedTick: tick,
    expiresAt: rung.duration_days && rung.duration_days > 0
      ? Date.now() + rung.duration_days * 86400 * 1000
      : null,
    strikeCount,
    active: true,
    sourceReportId: (opts && opts.sourceReportId) || null,
  };
  player.strikes.push(strike);
  _syncModerationState(player);
  _mirrorStrikeToLog(player, strike);

  audit('strike_applied', by, player, {
    strikeId: strike.id, ruleId, strikeCount, action: strike.action,
    duration_days: strike.duration_days,
  });
  events.emit('mod:strike', {
    type: 'mod:strike', playerId: player.id, ruleId,
    action: strike.action, strikeCount, tick,
  });
  return { ok: true, strike };
}

function getStrikeHistory(player) {
  if (!player) return [];
  return Array.isArray(player.strikes) ? player.strikes.slice() : [];
}

function countActiveStrikes(player, ruleId) {
  if (!player || !Array.isArray(player.strikes)) return 0;
  return player.strikes.filter(s => (!ruleId || s.ruleId === ruleId) && s.active !== false).length;
}

function _syncModerationState(player) {
  if (!player) return;
  const active = (player.strikes || []).filter(s => s.active !== false);
  const now = Date.now();
  let muteUntil = 0, banUntil = 0, banned = false;
  for (const s of active) {
    const until = s.expiresAt && s.expiresAt > 0 ? s.expiresAt : Infinity;
    if (s.action === 'mute' && until > now) {
      if (until > muteUntil) muteUntil = until;
    } else if (s.action === 'tempban' && until > now) {
      if (until > banUntil) banUntil = until;
    } else if (s.action === 'ban') {
      banned = true;
    }
  }
  // Merge with any existing state (set by direct mute/ban) so we don't clobber
  // moderator actions that weren't tied to a strike.
  const prev = player.moderationState || {};
  const prevMuteUntil = (prev.muteUntil && prev.muteUntil > now) ? prev.muteUntil : 0;
  const prevTempUntil = (prev.tempbanUntil && prev.tempbanUntil > now) ? prev.tempbanUntil : 0;
  const effMute = Math.max(muteUntil, prevMuteUntil);
  const effTemp = Math.max(banUntil, prevTempUntil);
  const effBanned = banned || prev.banned === true;
  player.moderationState = {
    muted: effMute > now,
    muteUntil: effMute || null,
    tempbanned: effTemp > now,
    tempbanUntil: effTemp || null,
    banned: effBanned,
    strikeTotals: active.length,
  };
}

function isMuted(player) {
  _syncModerationState(player);
  return !!(player.moderationState && player.moderationState.muted);
}
function isBanned(player) {
  _syncModerationState(player);
  return !!(player.moderationState && (player.moderationState.banned || player.moderationState.tempbanned));
}

function _mirrorStrikeToLog(player, strike) {
  const log = persistence.load(STRIKES_FILE, []) || [];
  log.push({
    playerId: player.id,
    playerName: player.name || null,
    ...strike,
  });
  persistence.save(STRIKES_FILE, log);
}

// ── Appeals ─────────────────────────────────────────────────────────────────

const APPEAL_WINDOW_MS = 30 * 86400 * 1000; // 30 days

function appeal(player, strikeId, reason) {
  if (!player) return { ok: false, reason: 'No player.' };
  if (!Array.isArray(player.strikes)) return { ok: false, reason: 'No strikes on record.' };
  const strike = player.strikes.find(s => s.id === strikeId);
  if (!strike) return { ok: false, reason: `Strike not found: ${strikeId}` };
  if (strike.active === false) return { ok: false, reason: 'Strike already lifted.' };
  const rule = rules.getRule(strike.ruleId);
  if (rule && rule.appealable === false) {
    return { ok: false, reason: `Strikes for "${rule.title}" cannot be appealed.` };
  }
  const ageMs = Date.now() - (strike.appliedAt || 0);
  if (ageMs > APPEAL_WINDOW_MS) {
    return { ok: false, reason: 'Appeal window (30 days) has closed.' };
  }
  // Deduplicate: no two open appeals on the same strike from the same player.
  const queue = loadQueue(APPEALS_FILE);
  if (queue.some(a => a.strikeId === strikeId && a.playerId === player.id && a.status === 'pending')) {
    return { ok: false, reason: 'You already have an open appeal for this strike.' };
  }
  const id = nextId('app');
  const appealRec = {
    id,
    strikeId,
    playerId: player.id,
    playerName: player.name || null,
    ruleId: strike.ruleId,
    reason: reason ? String(reason) : '',
    status: 'pending',    // pending | approved | denied
    filedAt: Date.now(),
    filedTick: getTick(),
    reviewedBy: null,
    reviewedAt: null,
    decision: null,
  };
  queue.push(appealRec);
  saveQueue(APPEALS_FILE, queue);
  audit('appeal_filed', player, null, { appealId: id, strikeId });
  events.emit('mod:appeal_filed', {
    type: 'mod:appeal_filed', appealId: id, strikeId, playerId: player.id, tick: getTick(),
  });
  return { ok: true, id, appeal: appealRec };
}

function appealsQueue(statusFilter) {
  const queue = loadQueue(APPEALS_FILE);
  if (!statusFilter) return queue.filter(a => a.status === 'pending');
  return queue.filter(a => a.status === statusFilter);
}

function getAppeal(appealId) {
  const queue = loadQueue(APPEALS_FILE);
  return queue.find(a => a.id === appealId) || null;
}

/**
 * reviewAppeal(appealId, decision, by, extra)
 *   decision: 'approved' | 'denied'
 *   by:       moderator+ player
 *   extra:    { getPlayerById, note }
 *
 * Approving removes the originating strike. Denied leaves the strike intact.
 */
function reviewAppeal(appealId, decision, by, extra) {
  if (!['approved', 'denied'].includes(decision)) {
    return { ok: false, reason: `Unknown decision: ${decision}` };
  }
  if (!hasRole(by, ROLES.moderator)) {
    return { ok: false, reason: 'Moderator role required.' };
  }
  const queue = loadQueue(APPEALS_FILE);
  const idx = queue.findIndex(a => a.id === appealId);
  if (idx < 0) return { ok: false, reason: `Appeal not found: ${appealId}` };
  const a = queue[idx];
  if (a.status !== 'pending') {
    return { ok: false, reason: `Appeal already ${a.status}.` };
  }
  // Moderators cannot review their own appeal.
  if (String(a.playerId) === String(by.id)) {
    return { ok: false, reason: 'Cannot review your own appeal.' };
  }
  a.status = decision;
  a.decision = decision;
  a.reviewedBy = { id: by.id, name: by.name || null, role: getRole(by) };
  a.reviewedAt = Date.now();
  a.note = extra && extra.note ? String(extra.note) : '';

  let lifted = false;
  if (decision === 'approved' && extra && typeof extra.getPlayerById === 'function') {
    const target = extra.getPlayerById(a.playerId);
    if (target && Array.isArray(target.strikes)) {
      const s = target.strikes.find(x => x.id === a.strikeId);
      if (s) {
        s.active = false;
        s.liftedAt = Date.now();
        s.liftedBy = a.reviewedBy;
        _syncModerationState(target);
        lifted = true;
      }
    }
  }
  saveQueue(APPEALS_FILE, queue);
  audit(`appeal_${decision}`, by, { id: a.playerId, name: a.playerName },
    { appealId: a.id, strikeId: a.strikeId, lifted });
  events.emit('mod:appeal_resolved', {
    type: 'mod:appeal_resolved', appealId: a.id, decision,
    strikeId: a.strikeId, tick: getTick(),
  });
  return { ok: true, appeal: a, lifted };
}

// ── Direct mod actions (mute / ban / kick / broadcast / rollback / transfer)
// These are called by mod-commands.js; they all audit and enforce role gates.

function mute(by, target, durationMinutes, reason) {
  if (!hasRole(by, ROLES.moderator)) return { ok: false, reason: 'Moderator role required.' };
  if (!target) return { ok: false, reason: 'No target.' };
  if (String(by.id) === String(target.id)) return { ok: false, reason: 'Cannot act on yourself.' };
  if (hasRole(target, ROLES.admin) && !hasRole(by, ROLES.owner)) {
    return { ok: false, reason: 'Cannot act on admins.' };
  }
  const ms = Math.max(0, Number(durationMinutes) || 60) * 60 * 1000;
  const until = Date.now() + ms;
  target.moderationState = target.moderationState || {};
  target.moderationState.muted = true;
  target.moderationState.muteUntil = until;
  audit('mute', by, target, { durationMinutes, reason: reason || null });
  events.emit('mod:mute', { type: 'mod:mute', playerId: target.id, until, tick: getTick() });
  return { ok: true, until };
}

function unmute(by, target, reason) {
  if (!hasRole(by, ROLES.moderator)) return { ok: false, reason: 'Moderator role required.' };
  if (!target) return { ok: false, reason: 'No target.' };
  target.moderationState = target.moderationState || {};
  target.moderationState.muted = false;
  target.moderationState.muteUntil = null;
  audit('unmute', by, target, { reason: reason || null });
  events.emit('mod:unmute', { type: 'mod:unmute', playerId: target.id, tick: getTick() });
  return { ok: true };
}

function kick(by, target, reason) {
  if (!hasRole(by, ROLES.moderator)) return { ok: false, reason: 'Moderator role required.' };
  if (!target) return { ok: false, reason: 'No target.' };
  if (String(by.id) === String(target.id)) return { ok: false, reason: 'Cannot kick yourself.' };
  if (hasRole(target, ROLES.admin) && !hasRole(by, ROLES.owner)) {
    return { ok: false, reason: 'Cannot kick admins.' };
  }
  target.kicked = { by: by.id, at: Date.now(), reason: reason || null };
  audit('kick', by, target, { reason: reason || null });
  events.emit('mod:kick', { type: 'mod:kick', playerId: target.id, tick: getTick() });
  return { ok: true };
}

function ban(by, target, durationDays, reason) {
  if (!hasRole(by, ROLES.admin)) return { ok: false, reason: 'Admin role required.' };
  if (!target) return { ok: false, reason: 'No target.' };
  if (String(by.id) === String(target.id)) return { ok: false, reason: 'Cannot ban yourself.' };
  if (hasRole(target, ROLES.admin) && !hasRole(by, ROLES.owner)) {
    return { ok: false, reason: 'Only the owner can ban an admin.' };
  }
  target.moderationState = target.moderationState || {};
  const days = Number(durationDays);
  if (!Number.isFinite(days) || days <= 0) {
    target.moderationState.banned = true;
    target.moderationState.tempbanned = false;
    target.moderationState.tempbanUntil = null;
  } else {
    target.moderationState.tempbanned = true;
    target.moderationState.tempbanUntil = Date.now() + days * 86400 * 1000;
  }
  audit('ban', by, target, { durationDays, reason: reason || null });
  events.emit('mod:ban', {
    type: 'mod:ban', playerId: target.id, durationDays, tick: getTick(),
  });
  return { ok: true };
}

function unban(by, target, reason) {
  if (!hasRole(by, ROLES.admin)) return { ok: false, reason: 'Admin role required.' };
  if (!target) return { ok: false, reason: 'No target.' };
  target.moderationState = target.moderationState || {};
  target.moderationState.banned = false;
  target.moderationState.tempbanned = false;
  target.moderationState.tempbanUntil = null;
  audit('unban', by, target, { reason: reason || null });
  events.emit('mod:unban', { type: 'mod:unban', playerId: target.id, tick: getTick() });
  return { ok: true };
}

/**
 * rollback(by, target, snapshotId, opts)
 * Uses whatever account-mgmt snapshot implementation is wired via opts.restoreFn.
 * opts.restoreFn(target, snapshotId) -> { ok, reason }
 */
function rollback(by, target, snapshotId, opts) {
  if (!hasRole(by, ROLES.admin)) return { ok: false, reason: 'Admin role required.' };
  if (!target) return { ok: false, reason: 'No target.' };
  const restoreFn = opts && typeof opts.restoreFn === 'function' ? opts.restoreFn : null;
  let restoreResult = { ok: true };
  if (restoreFn) {
    try { restoreResult = restoreFn(target, snapshotId) || { ok: true }; }
    catch (e) { return { ok: false, reason: `Rollback failed: ${e.message}` }; }
  }
  if (!restoreResult || restoreResult.ok === false) {
    return { ok: false, reason: restoreResult && restoreResult.reason || 'Rollback refused.' };
  }
  audit('rollback', by, target, { snapshotId, reason: opts && opts.reason ? opts.reason : null });
  events.emit('mod:rollback', {
    type: 'mod:rollback', playerId: target.id, snapshotId, tick: getTick(),
  });
  return { ok: true };
}

/**
 * transfer(by, fromPlayer, toPlayer, itemId, count, opts)
 * Moves an item from one player to another for compensation. Requires admin.
 * Uses opts.invRemove / opts.invAdd injected by the caller so we don't couple
 * to player.js directly here.
 */
function transfer(by, fromPlayer, toPlayer, itemId, count, opts) {
  if (!hasRole(by, ROLES.admin)) return { ok: false, reason: 'Admin role required.' };
  if (!fromPlayer || !toPlayer) return { ok: false, reason: 'Need from and to.' };
  if (String(fromPlayer.id) === String(toPlayer.id)) return { ok: false, reason: 'Same player.' };
  const n = Number(count) || 1;
  if (n <= 0) return { ok: false, reason: 'Count must be positive.' };
  const invRemove = opts && typeof opts.invRemove === 'function' ? opts.invRemove : null;
  const invAdd    = opts && typeof opts.invAdd === 'function'    ? opts.invAdd    : null;
  let removed = n;
  if (invRemove) removed = invRemove(fromPlayer, itemId, n);
  if (removed !== n) return { ok: false, reason: 'Source did not have enough.' };
  if (invAdd) {
    const added = invAdd(toPlayer, itemId, opts && opts.itemName ? opts.itemName : 'item', n, true);
    if (!added) return { ok: false, reason: 'Target could not receive.' };
  }
  audit('transfer', by, fromPlayer, {
    to: { id: toPlayer.id, name: toPlayer.name || null },
    itemId, count: n, reason: opts && opts.reason ? opts.reason : null,
  });
  events.emit('mod:transfer', {
    type: 'mod:transfer', from: fromPlayer.id, to: toPlayer.id, itemId, count: n, tick: getTick(),
  });
  return { ok: true };
}

function broadcast(by, message) {
  if (!hasRole(by, ROLES.moderator)) return { ok: false, reason: 'Moderator role required.' };
  const msg = String(message || '').trim();
  if (!msg) return { ok: false, reason: 'Empty message.' };
  audit('broadcast', by, null, { message: msg });
  events.emit('mod:broadcast', { type: 'mod:broadcast', message: msg, tick: getTick() });
  return { ok: true, message: msg };
}

// ── Reset (tests) ───────────────────────────────────────────────────────────
function _resetAllForTests() {
  _resetIdCounter();
  _resetBuffers();
  saveQueue(REPORTS_FILE, []);
  saveQueue(APPEALS_FILE, []);
  persistence.save(STRIKES_FILE, []);
  try { fs.unlinkSync(_auditPath()); } catch {}
}

module.exports = {
  // Reports
  recordIncident, reviewQueue, resolveIncident, getIncident,
  // Strikes
  applyStrike, getStrikeHistory, countActiveStrikes,
  // Appeals
  appeal, appealsQueue, reviewAppeal, getAppeal,
  // Mod actions
  mute, unmute, kick, ban, unban, rollback, transfer, broadcast,
  // State readers
  isMuted, isBanned,
  // Evidence ingestion (wired by server)
  pushChatLine, pushLocation, pushCombatEvent,
  // Role
  getRole, setRole, hasRole, ROLES, ROLE_RANK,
  // Audit
  audit, readAudit,
  // Wiring
  setTickSource,
  // Tests
  _resetAllForTests,
  // File names (for tests / ops)
  REPORTS_FILE, APPEALS_FILE, STRIKES_FILE, AUDIT_FILE,
};
