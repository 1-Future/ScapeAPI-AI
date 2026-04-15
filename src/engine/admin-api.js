// ══════════════════════════════════════════════════════════════════════════════
// Admin API — aggregation layer for the server admin dashboard (public/admin.html).
//
// Central read/write boundary for every admin panel. The HTTP layer in
// src/http-api.js calls into this module; the WebSocket push layer in
// src/server.js reuses the same aggregators so what admins see over REST is
// always the same shape as what they see live.
//
// Design notes:
//   - Zero coupling to network / res objects. This module returns plain data.
//   - All heavy lifting (moderation queues, bot detection, audit reads) is
//     delegated to the subsystem modules. We only shape + sanitise.
//   - Player records are *redacted* before they leave: no raw bcrypt hashes,
//     no WebSocket handles, no internal refs.
//   - Tick-health samples are a rolling 128-point window. Server registers
//     recordTickSample() inside its tick phase; the aggregator computes P50/P99
//     over the window.
//   - Audit log reads tail both data/mod-audit.log AND data/builder-audit.log
//     (if present) and stitches them in timestamp order.
//   - Scheduled events live in data/server-events.json. The scheduler is a
//     thin persistence wrapper; the engine side-effects are the caller's job.
//
// Public API (consumed by src/http-api.js):
//   init({ players, playersByName, tick, getClanList, getMarketStats })
//   getOverview()
//   listPlayers({ q, limit })
//   getPlayerCard(nameOrId)
//   getModQueue()                 // reports + appeals + incidents
//   getBotLeaderboard(limit = 20)
//   getTradeLog(limit = 50)
//   getAuditLog({ since, limit })
//   scheduleEvent({ kind, at, payload, by })
//   cancelEvent(id, by)
//   listEvents()
//   updateConfig(key, value, by)  // bot-policy | channel-config | server-rules
//   getConfig(key)
//   getClans({ limit = 50 })
//   recordTickSample(ms)           // called by server tick loop
//
// The module emits bus events the WS admin fan-out subscribes to:
//   admin:overview_tick    (every 5s)
//   admin:new_report       (on moderation.recordIncident)
//   admin:alert            (bot score breach, hardcore death, etc.)
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const fs = require('fs');
const path = require('path');
const events = require('./events');
const persistence = require('./persistence');

let moderation = null;
let bot = null;
let trade = null;
let clan = null;
let ge = null;
let rules = null;
let staging = null;

try { moderation = require('./moderation'); } catch {}
try { bot        = require('./bot-detection'); } catch {}
try { trade      = require('./trade'); } catch {}
try { clan       = require('./clan'); } catch {}
try { ge         = require('./ge-runner'); } catch {}
try { rules      = require('./rules'); } catch {}
try { staging    = require('../builder/staging'); } catch {}

// ── Wired runtime state ────────────────────────────────────────────────────
let _players = null;         // Map<ws, player>
let _playersByName = null;   // Map<lowername, player>
let _tick = null;            // { getTick(): number }
let _getClanList = null;     // () => Array<clan>
let _getMarketStats = null;  // (itemId) => stats
let _startTime = Date.now();

// Tick health ring buffer (milliseconds per tick).
const TICK_SAMPLES_CAP = 128;
const _tickSamples = [];
let _overviewTimer = null;

// Alert throttling to avoid spamming the admin bus.
const _alertThrottle = new Map();   // key -> last-fire ms
const ALERT_COOLDOWN_MS = 30_000;

// Scheduled server events.
const EVENTS_FILE = 'server-events.json';
let _nextEventId = 1;
function loadEvents() {
  const data = persistence.load(EVENTS_FILE, { nextId: 1, events: [] }) || {};
  _nextEventId = data.nextId || 1;
  return Array.isArray(data.events) ? data.events : [];
}
function saveEvents(list) {
  persistence.save(EVENTS_FILE, { nextId: _nextEventId, events: list });
}

// ── Init / wiring ──────────────────────────────────────────────────────────

function init(opts = {}) {
  _players        = opts.players || null;
  _playersByName  = opts.playersByName || null;
  _tick           = opts.tick || null;
  _getClanList    = opts.getClanList || (clan ? clan.listClans : null);
  _getMarketStats = opts.getMarketStats || (ge ? ge.getMarketStats : null);
  _startTime      = opts.startTime || Date.now();
  _nextEventId    = (loadEvents().length && persistence.load(EVENTS_FILE, {}).nextId) || 1;

  // Emit admin:new_report whenever a report is filed or resolved.
  events.on('mod:report_filed', 'admin-api:new_report', (payload) => {
    events.emit('admin:new_report', { ...payload, kind: 'filed' });
  });
  events.on('mod:report_resolved', 'admin-api:report_resolved', (payload) => {
    events.emit('admin:new_report', { ...payload, kind: 'resolved' });
  });
  events.on('mod:appeal_filed', 'admin-api:appeal_filed', (payload) => {
    events.emit('admin:new_report', { ...payload, kind: 'appeal_filed' });
  });

  // Auto-escalation → admin:alert.
  events.on('bot:escalated', 'admin-api:bot-escalated', (payload) => {
    _fireAlert(`bot_escalated:${payload.playerId}`, {
      kind: 'bot_escalated',
      severity: payload.score >= 0.9 ? 'critical' : 'warn',
      playerId: payload.playerId,
      playerName: payload.playerName || null,
      score: payload.score,
      reason: payload.reason,
    });
  });
  events.on('bot:autoban_candidate', 'admin-api:autoban', (payload) => {
    _fireAlert(`autoban:${payload.playerId}`, {
      kind: 'autoban_candidate',
      severity: 'critical',
      playerId: payload.playerId,
      score: payload.score,
    });
  });
  events.on('bot:honeypot_triggered', 'admin-api:honeypot', (payload) => {
    _fireAlert(`honeypot:${payload.playerId}`, {
      kind: 'honeypot',
      severity: 'warn',
      playerId: payload.playerId,
      honeypotId: payload.honeypotId,
    });
  });
  events.on('player:death_hardcore', 'admin-api:hc-death', (payload) => {
    _fireAlert(`hc_death:${payload && payload.playerId}`, {
      kind: 'hardcore_death',
      severity: 'warn',
      playerId: payload && payload.playerId,
      playerName: payload && payload.playerName,
    });
  });

  return true;
}

function startOverviewPush(intervalMs = 5000) {
  if (_overviewTimer) return;
  _overviewTimer = setInterval(() => {
    try { events.emit('admin:overview_tick', getOverview()); } catch {}
  }, intervalMs);
}
function stopOverviewPush() {
  if (_overviewTimer) { clearInterval(_overviewTimer); _overviewTimer = null; }
}

function recordTickSample(ms) {
  if (!Number.isFinite(ms) || ms < 0) return;
  _tickSamples.push(ms);
  while (_tickSamples.length > TICK_SAMPLES_CAP) _tickSamples.shift();
}

function _fireAlert(key, payload) {
  const now = Date.now();
  const prev = _alertThrottle.get(key) || 0;
  if (now - prev < ALERT_COOLDOWN_MS) return;
  _alertThrottle.set(key, now);
  events.emit('admin:alert', { ts: now, ...payload });
}

// ── Utility: enumerate live players ───────────────────────────────────────
function _allPlayers() {
  if (_playersByName) return [..._playersByName.values()];
  if (_players) return [..._players.values()];
  return [];
}

function _pctile(arr, p) {
  if (!arr.length) return 0;
  const sorted = arr.slice().sort((a, b) => a - b);
  const idx = Math.max(0, Math.min(sorted.length - 1, Math.floor(p * sorted.length)));
  return sorted[idx];
}

function _bankValue(player) {
  if (!player || !Array.isArray(player.bank)) return 0;
  let total = 0;
  for (const entry of player.bank) {
    if (!entry) continue;
    const price = entry.value != null ? entry.value
                : entry.price != null ? entry.price
                : (ge && ge.getGuidePrice ? (ge.getGuidePrice(entry.id) || 0) : 0);
    total += (price | 0) * ((entry.count | 0) || 1);
  }
  return total;
}

// ── Overview ───────────────────────────────────────────────────────────────

function getOverview() {
  const players = _allPlayers();
  const now = Date.now();
  const connected = players.filter(p => p && !p.httpOnly).length;
  const sessions = players.length;

  let pendingReports = 0, pendingAppeals = 0;
  if (moderation) {
    try { pendingReports = moderation.reviewQueue().length; } catch {}
    try { pendingAppeals = moderation.appealsQueue().length; } catch {}
  }

  let flaggedBots = 0, escalatedBots = 0, policyName = 'allow';
  if (bot) {
    try {
      for (const p of players) {
        const sig = p && p.botSignals;
        if (sig && typeof sig.score === 'number' && sig.score >= 0.5) flaggedBots++;
        if (sig && sig.escalated) escalatedBots++;
      }
      policyName = (bot.getPolicy() || {}).policy || 'allow';
    } catch {}
  }

  return {
    ok: true,
    ts: now,
    uptimeMs: now - _startTime,
    uptimeSec: Math.floor((now - _startTime) / 1000),
    tick: _tick ? _tick.getTick() : 0,
    players: {
      connected,
      sessions,
      httpOnly: sessions - connected,
    },
    tickHealth: {
      samples: _tickSamples.length,
      p50: +_pctile(_tickSamples, 0.5).toFixed(2),
      p99: +_pctile(_tickSamples, 0.99).toFixed(2),
      mean: _tickSamples.length
        ? +(_tickSamples.reduce((a, b) => a + b, 0) / _tickSamples.length).toFixed(2)
        : 0,
    },
    moderation: {
      pendingReports,
      pendingAppeals,
    },
    bots: {
      policy: policyName,
      flagged: flaggedBots,
      escalated: escalatedBots,
    },
    clans: (() => {
      try { return _getClanList ? _getClanList().length : 0; } catch { return 0; }
    })(),
    events: listEvents().filter(e => e.status === 'scheduled').length,
  };
}

// ── Players ────────────────────────────────────────────────────────────────

function _redactPlayer(p) {
  if (!p) return null;
  return {
    id: p.id,
    name: p.name,
    role: (p.role || (p.admin ? 'admin' : 'player')),
    admin: !!p.admin,
    x: p.x, y: p.y, layer: p.layer || 0,
    hp: p.hp, maxHp: p.maxHp,
    busy: !!p.busy,
    moderationState: p.moderationState || null,
    botScore: p.botSignals && typeof p.botSignals.score === 'number' ? p.botSignals.score : 0,
    httpOnly: !!p.httpOnly,
    strikes: Array.isArray(p.strikes) ? p.strikes.length : 0,
  };
}

function listPlayers(opts = {}) {
  const q = (opts.q || '').trim().toLowerCase();
  const limit = Math.max(1, Math.min(500, opts.limit || 100));
  const players = _allPlayers();
  let filtered = players;
  if (q) {
    filtered = players.filter(p => {
      if (!p) return false;
      if ((p.name || '').toLowerCase().includes(q)) return true;
      if (String(p.id || '').toLowerCase().includes(q)) return true;
      return false;
    });
  }
  return filtered.slice(0, limit).map(_redactPlayer);
}

function getPlayerCard(nameOrId) {
  if (!nameOrId) return null;
  const lower = String(nameOrId).toLowerCase();
  let p = null;
  if (_playersByName) p = _playersByName.get(lower) || null;
  if (!p) {
    for (const cand of _allPlayers()) {
      if (!cand) continue;
      if (String(cand.id).toLowerCase() === lower) { p = cand; break; }
      if ((cand.name || '').toLowerCase() === lower) { p = cand; break; }
    }
  }
  if (!p) return null;

  const inv = Array.isArray(p.inventory)
    ? p.inventory.map(s => s ? { id: s.id, name: s.name, count: s.count | 0 } : null)
    : [];
  const bank = Array.isArray(p.bank)
    ? p.bank.slice(0, 300).map(e => ({
        id: e.id, name: e.name, count: e.count | 0, tab: e.tab || 0,
      }))
    : [];
  const bankValue = _bankValue(p);
  const strikes = Array.isArray(p.strikes) ? p.strikes.slice() : [];
  const recentChat = (() => {
    if (!moderation || !moderation._chatBuffers) return null;
    try {
      const buf = moderation._chatBuffers.get(p.id);
      return buf ? buf.slice(-50) : [];
    } catch { return null; }
  })();
  const combatLog = (() => {
    if (!moderation || !moderation._combatBuffers) return null;
    try {
      const buf = moderation._combatBuffers.get(p.id);
      return buf ? buf.slice(-50) : [];
    } catch { return null; }
  })();
  const botSignals = p.botSignals ? {
    score: p.botSignals.score || 0,
    escalated: !!p.botSignals.escalated,
    honeypotHits: p.botSignals.honeypotHits || 0,
    lastAnalysis: p.botSignals.lastAnalysis || null,
    isBot: !!p.botSignals.isBot,
  } : null;

  return {
    ok: true,
    ...(_redactPlayer(p)),
    bankValue,
    inventory: inv,
    bank: bank,
    strikes,
    recentChat,
    combatLog,
    botSignals,
    skillTotals: (() => {
      if (!p.skills) return null;
      let total = 0;
      for (const s of Object.values(p.skills)) total += (s && s.level) || 0;
      return total;
    })(),
  };
}

// ── Moderation queue (reports + appeals combined) ─────────────────────────

function getModQueue() {
  if (!moderation) return { reports: [], appeals: [], strikes: [] };
  let reports = [], appeals = [];
  try { reports = moderation.reviewQueue() || []; } catch {}
  try { appeals = moderation.appealsQueue() || []; } catch {}
  const strikes = [];
  for (const p of _allPlayers()) {
    if (!p || !Array.isArray(p.strikes)) continue;
    for (const s of p.strikes) {
      if (s && s.active !== false) {
        strikes.push({
          ...s,
          playerId: p.id,
          playerName: p.name || null,
        });
      }
    }
  }
  strikes.sort((a, b) => (b.appliedAt || 0) - (a.appliedAt || 0));
  return {
    reports, appeals,
    strikes: strikes.slice(0, 100),
    ruleCount: rules && rules.listRules ? rules.listRules().length : 0,
  };
}

// ── Bot leaderboard ───────────────────────────────────────────────────────

function getBotLeaderboard(limit = 20) {
  const n = Math.max(1, Math.min(200, limit | 0));
  const out = [];
  for (const p of _allPlayers()) {
    if (!p) continue;
    const sig = p.botSignals;
    if (!sig) continue;
    // Recompute score on demand so the view is live.
    let score = sig.score || 0;
    try { score = bot ? bot.getBotScore(p) : score; } catch {}
    const breakdown = (sig.lastAnalysis && sig.lastAnalysis.breakdown) || null;
    out.push({
      playerId: p.id,
      playerName: p.name || null,
      score,
      escalated: !!sig.escalated,
      honeypotHits: sig.honeypotHits || 0,
      isBot: !!sig.isBot,
      breakdown,
    });
  }
  out.sort((a, b) => b.score - a.score);
  const escalations = bot && bot.getEscalations ? bot.getEscalations() : [];
  const honeypots = bot && bot.listHoneypots ? bot.listHoneypots() : [];
  return {
    ok: true,
    policy: bot && bot.getPolicy ? bot.getPolicy() : null,
    leaderboard: out.slice(0, n),
    escalations: escalations.slice(-50).reverse(),
    honeypots,
  };
}

// ── Trade / GE ────────────────────────────────────────────────────────────

function getTradeLog(limit = 50) {
  const n = Math.max(1, Math.min(500, limit | 0));
  let history = [];
  if (trade && trade.listHistory) {
    try { history = trade.listHistory(null, n) || []; } catch {}
  }
  // Top volume items from GE trades (24h).
  let topVolume = [];
  if (ge && ge._trades) {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    const byItem = new Map();
    for (const [itemId, list] of ge._trades) {
      let vol = 0, sum = 0, trades = 0;
      for (const t of list) {
        if (t.ts < cutoff) continue;
        vol += t.qty; sum += t.qty * t.price; trades++;
      }
      if (vol > 0) byItem.set(itemId, { itemId, vol24h: vol, coinsMoved: sum, trades });
    }
    topVolume = [...byItem.values()].sort((a, b) => b.vol24h - a.vol24h).slice(0, 10);
  }
  return {
    ok: true,
    trades: history,
    topVolume,
    totalHistory: history.length,
  };
}

// ── Audit log ─────────────────────────────────────────────────────────────

function _readAuditFile(absPath, since) {
  if (!fs.existsSync(absPath)) return [];
  try {
    const raw = fs.readFileSync(absPath, 'utf8');
    const lines = raw.split('\n').filter(l => l.trim().length > 0);
    const out = [];
    for (const line of lines) {
      let entry;
      try { entry = JSON.parse(line); } catch { continue; }
      if (since && entry && entry.ts != null && entry.ts < since) continue;
      if (entry && typeof entry === 'object') {
        entry._source = path.basename(absPath);
        out.push(entry);
      }
    }
    return out;
  } catch { return []; }
}

function getAuditLog(opts = {}) {
  const since = opts.since ? Number(opts.since) : 0;
  const limit = Math.max(1, Math.min(1000, opts.limit || 200));
  const modPath = path.join(persistence.DATA_DIR, 'mod-audit.log');
  const builderPath = path.join(persistence.DATA_DIR, 'builder-audit.log');
  const all = [
    ..._readAuditFile(modPath, since),
    ..._readAuditFile(builderPath, since),
  ];
  // Sort newest-first.
  all.sort((a, b) => (b.ts || 0) - (a.ts || 0));
  return {
    ok: true,
    since,
    entries: all.slice(0, limit),
    total: all.length,
  };
}

// ── Scheduled events ───────────────────────────────────────────────────────

const EVENT_KINDS = Object.freeze([
  'xp_weekend', 'boss_spawn', 'item_giveaway', 'broadcast', 'double_drops',
]);

function scheduleEvent({ kind, at, payload, by } = {}) {
  if (!kind || !EVENT_KINDS.includes(kind)) {
    return { ok: false, reason: `Unknown event kind: ${kind}. Valid: ${EVENT_KINDS.join(', ')}` };
  }
  const ts = Number(at);
  if (!Number.isFinite(ts) || ts < Date.now() - 60_000) {
    return { ok: false, reason: 'Scheduled time must be a future timestamp (ms).' };
  }
  const list = loadEvents();
  const ev = {
    id: _nextEventId++,
    kind,
    at: ts,
    payload: payload && typeof payload === 'object' ? payload : {},
    status: 'scheduled',
    createdAt: Date.now(),
    createdBy: by || 'unknown',
  };
  list.push(ev);
  saveEvents(list);
  events.emit('admin:event_scheduled', ev);
  return { ok: true, event: ev };
}

function cancelEvent(id, by) {
  const list = loadEvents();
  const idx = list.findIndex(e => e.id === (id | 0));
  if (idx < 0) return { ok: false, reason: 'Event not found.' };
  const ev = list[idx];
  if (ev.status !== 'scheduled') return { ok: false, reason: `Event already ${ev.status}.` };
  ev.status = 'cancelled';
  ev.cancelledAt = Date.now();
  ev.cancelledBy = by || 'unknown';
  saveEvents(list);
  events.emit('admin:event_cancelled', ev);
  return { ok: true, event: ev };
}

function listEvents() {
  return loadEvents();
}

// ── Config (bot-policy, channel-config, rules) ────────────────────────────

const CONFIG_KEYS = Object.freeze({
  'bot-policy':    { file: 'bot-policy.json',    validate: _validateBotPolicy },
  'channel-config':{ file: 'channel-config.json', validate: _validateObject },
  'server-rules':  { file: 'server-rules.json',   validate: _validateObject },
});

function _validateObject(v) {
  if (!v || typeof v !== 'object' || Array.isArray(v)) {
    return { ok: false, reason: 'Value must be an object.' };
  }
  return { ok: true };
}
function _validateBotPolicy(v) {
  const base = _validateObject(v);
  if (!base.ok) return base;
  const validPolicies = ['ban', 'allow', 'licensed', 'zone_restricted'];
  if (v.policy && !validPolicies.includes(v.policy)) {
    return { ok: false, reason: `policy must be one of: ${validPolicies.join(', ')}` };
  }
  if (v.banThreshold != null && (typeof v.banThreshold !== 'number' || v.banThreshold < 0 || v.banThreshold > 1)) {
    return { ok: false, reason: 'banThreshold must be 0..1' };
  }
  return { ok: true };
}

function getConfig(key) {
  const cfg = CONFIG_KEYS[key];
  if (!cfg) return null;
  return persistence.load(cfg.file, null);
}

function updateConfig(key, value, by) {
  const cfg = CONFIG_KEYS[key];
  if (!cfg) return { ok: false, reason: `Unknown config key: ${key}` };
  const v = cfg.validate(value);
  if (!v.ok) return v;
  persistence.save(cfg.file, value);
  // Hot-reload bot policy in memory.
  if (key === 'bot-policy' && bot && bot.setPolicy) {
    try { bot.setPolicy(value); } catch {}
  }
  // Audit the change.
  try {
    fs.mkdirSync(persistence.DATA_DIR, { recursive: true });
    fs.appendFileSync(
      path.join(persistence.DATA_DIR, 'mod-audit.log'),
      JSON.stringify({
        ts: Date.now(),
        tick: _tick ? _tick.getTick() : 0,
        action: 'admin_config_update',
        actor: { name: by || 'unknown' },
        target: null,
        payload: { key, value },
      }) + '\n'
    );
  } catch {}
  events.emit('admin:config_updated', { key, value, by });
  return { ok: true };
}

// ── Clans ─────────────────────────────────────────────────────────────────

function getClans(opts = {}) {
  const limit = Math.max(1, Math.min(500, opts.limit || 50));
  let list = [];
  try { list = _getClanList ? _getClanList() : []; } catch {}
  const out = list.slice(0, limit).map(c => ({
    id: c.id,
    name: c.name,
    motto: c.motto || '',
    founder: c.founder,
    foundedAt: c.foundedAt,
    memberCount: Array.isArray(c.members) ? c.members.length : 0,
    territory: Array.isArray(c.territory) ? c.territory.slice() : [],
    citadelTier: c.citadel ? c.citadel.tier : 0,
    treasuryCoins: c.treasury ? c.treasury.coins : 0,
    wins: c.wins || { wars: 0, bingo: 0 },
  }));
  return { ok: true, clans: out, total: list.length };
}

// ── Content / staging summary ─────────────────────────────────────────────

function getContentSummary() {
  const out = { stagedOverrides: 0, entityTypes: 0 };
  if (staging) {
    try {
      const stats = staging.stats();
      out.stagedOverrides = (stats && stats.dirty) || 0;
      out.totalEntities = (stats && stats.total) || 0;
      out.entityTypes = staging.listTypes ? staging.listTypes().length : 0;
      out.perType = stats && stats.types ? stats.types : {};
    } catch {}
  }
  // Codex regen status: look at the modtime of the codex directory as a
  // lightweight "staleness" heuristic.
  try {
    const codexDir = path.join(__dirname, '..', '..', 'public', 'codex');
    if (fs.existsSync(codexDir)) {
      const st = fs.statSync(codexDir);
      out.codexMtime = st.mtimeMs;
    }
  } catch {}
  return out;
}

// ── Exports ───────────────────────────────────────────────────────────────

module.exports = {
  init,
  startOverviewPush,
  stopOverviewPush,
  recordTickSample,
  getOverview,
  listPlayers,
  getPlayerCard,
  getModQueue,
  getBotLeaderboard,
  getTradeLog,
  getAuditLog,
  scheduleEvent,
  cancelEvent,
  listEvents,
  getConfig,
  updateConfig,
  getClans,
  getContentSummary,
  EVENT_KINDS,
  CONFIG_KEYS: Object.keys(CONFIG_KEYS),

  // test helpers (not public contract)
  _reset() {
    _tickSamples.length = 0;
    _alertThrottle.clear();
    persistence.save(EVENTS_FILE, { nextId: 1, events: [] });
    _nextEventId = 1;
  },
};
