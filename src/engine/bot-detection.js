// ══════════════════════════════════════════════════════════════════════════════
// Bot Detection — Behavioral Analysis, Honeypots, Policy
//
// BYOS spec (build-your-own-scape/docs/bot-detection.md):
//   - Behavioral signal aggregation into a 0-1 bot score
//   - Honeypots that catch obvious automation patterns
//   - Server-wide policy: ban | allow | licensed | zone_restricted
//   - Admin-only visibility of scores (players NEVER see another player's score)
//   - Players may self-label via /mark-as-bot (transparency) — labeled bots get
//     reduced GE prices as an anti-exploitation incentive
//
// Philosophy: behavioral detection is SOFT and probabilistic. Nothing here bans
// a player directly — the policy layer decides the outcome, and high-scoring
// accounts escalate to an admin review queue, never to an automatic ban except
// when the server has explicitly opted into policy='ban' AND score >= 0.9.
//
// Signals tracked per-player (on player.botSignals):
//   actions        : [{ tick, type, meta }] ring buffer of the most recent ~256 actions
//   timings        : [...] last ~128 inter-action deltas (ms)
//   cameraMoves    : count of camera moves since last analysis
//   chatEvents     : count of chat messages since last analysis
//   logoutTicks    : [...] last ~16 logout ticks (for 6-hour-marker detection)
//   honeypotHits   : count of honeypots triggered
//   lastAnalysis   : { tick, score, breakdown } cached output of the analyzer
//   isBot          : boolean (self-label via /mark-as-bot)
//   escalated      : boolean (pushed to moderator queue at least once)
//
// Policy (data/bot-policy.json):
//   { policy: 'ban'|'allow'|'licensed'|'zone_restricted',
//     banThreshold: 0.9, licensedPlayers: [...], botZones: [...],
//     priceDiscount: 0.1 }
//
// Aggregate score:
//   score = sum(weight_i * signal_i) / sum(weight_i),  clamped to [0, 1]
//
// Signal weights are exposed as SIGNAL_WEIGHTS and can be tuned without
// touching analyzer code.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const events = require('./events');
const persistence = require('./persistence');

// ── Config & constants ──────────────────────────────────────────────────────

const POLICY_FILE = 'bot-policy.json';

const DEFAULT_POLICY = Object.freeze({
  policy: 'allow',              // ban | allow | licensed | zone_restricted
  banThreshold: 0.9,
  licensedPlayers: [],          // accountIds that have paid the license
  botZones: [],                 // zone names where bots are permitted
  priceDiscount: 0.1,           // 10% GE discount for self-labeled bots
  throttleUnlicensed: true,     // for 'licensed' mode
  autoEscalateThreshold: 0.7,   // push to admin review at or above this
});

const POLICIES = Object.freeze({
  BAN: 'ban',
  ALLOW: 'allow',
  LICENSED: 'licensed',
  ZONE_RESTRICTED: 'zone_restricted',
});

// How many recent actions/timings/logouts to retain.
const ACTION_BUFFER = 256;
const TIMING_BUFFER = 128;
const LOGOUT_BUFFER = 16;

// Every N ticks the analyzer runs on each connected player. 1000 ticks ≈ 10 min
// game time at 600ms per tick.
const ANALYSIS_INTERVAL_TICKS = 1000;

// Six-hour mark in ticks. OSRS 6-hour auto-logout is an infamous bot tell.
const SIX_HOURS_TICKS = Math.floor((6 * 60 * 60 * 1000) / 600);

// Signal weights — higher = signal contributes more to the bot score. A weight
// of 0 disables the signal without removing it.
const SIGNAL_WEIGHTS = Object.freeze({
  timingVariance:    2.0,  // click-pattern std dev — the most reliable signal
  routingOptimality: 1.5,  // hyper-optimal pathing
  afkRegularity:     1.5,  // AFK for EXACTLY the same interval each time
  responseToEvents:  1.2,  // did they react to random events?
  cameraActivity:    0.8,  // humans wiggle their camera; bots often don't
  chatEngagement:    0.8,  // bots rarely chat
  logoutRegularity:  1.0,  // 6-hour-mark logouts
  honeypots:         3.0,  // strongest single signal
});

// Tick source; defaults to 0 so the module is usable without wiring.
let getTick = () => 0;

function setTickSource(fn) {
  if (typeof fn === 'function') getTick = fn;
}

// ── Policy ──────────────────────────────────────────────────────────────────

let currentPolicy = null;

function loadPolicy() {
  const loaded = persistence.load(POLICY_FILE, null);
  if (loaded && typeof loaded === 'object') {
    currentPolicy = Object.assign({}, DEFAULT_POLICY, loaded);
  } else {
    currentPolicy = Object.assign({}, DEFAULT_POLICY);
    // Seed the file on first run.
    try { persistence.save(POLICY_FILE, currentPolicy); } catch (_e) { /* ok */ }
  }
  return currentPolicy;
}

function getPolicy() {
  if (!currentPolicy) loadPolicy();
  return currentPolicy;
}

function setPolicy(next) {
  if (!next || typeof next !== 'object') return getPolicy();
  currentPolicy = Object.assign({}, getPolicy(), next);
  try { persistence.save(POLICY_FILE, currentPolicy); } catch (_e) { /* ok */ }
  return currentPolicy;
}

/**
 * getPolicyFor(player) -> 'ban' | 'allow' | 'licensed' | 'zone_restricted'
 * Effective policy for this player given the server config and any account
 * licensing. A self-labeled bot (player.isBot) is treated according to the
 * server policy — self-labeling does not grant immunity.
 */
function getPolicyFor(player) {
  const cfg = getPolicy();
  if (cfg.policy === POLICIES.LICENSED && player && player.id != null) {
    const list = Array.isArray(cfg.licensedPlayers) ? cfg.licensedPlayers : [];
    if (list.indexOf(String(player.id)) >= 0) return POLICIES.LICENSED;
  }
  return cfg.policy;
}

// ── Player signal bootstrap ─────────────────────────────────────────────────

function ensureSignals(player) {
  if (!player || typeof player !== 'object') return null;
  if (!player.botSignals) {
    player.botSignals = {
      actions: [],
      timings: [],
      cameraMoves: 0,
      chatEvents: 0,
      logoutTicks: [],
      honeypotHits: 0,
      lastActionTick: null,
      lastActionWallMs: null,
      responsesToEvents: 0,     // successful human-timed responses
      eventsPrompted: 0,        // random events sent to the player
      afkIntervals: [],         // ticks between consecutive sustained AFKs
      lastActiveTick: null,
      lastAnalysis: null,
      isBot: !!(player.isBot),
      escalated: false,
      score: 0,
    };
  }
  return player.botSignals;
}

// ── recordAction ────────────────────────────────────────────────────────────

/**
 * recordAction(player, actionType, metadata?)
 * Every tick-hooked action (command, click, movement, chat) should call this.
 * metadata is optional and free-form but commonly includes { x, y, target }.
 */
function recordAction(player, actionType, metadata) {
  const sig = ensureSignals(player);
  if (!sig) return null;
  const tick = getTick();
  const wallMs = Date.now();

  const action = {
    tick,
    type: String(actionType || 'unknown'),
    meta: metadata && typeof metadata === 'object' ? metadata : null,
  };

  // Ring buffer.
  sig.actions.push(action);
  if (sig.actions.length > ACTION_BUFFER) sig.actions.shift();

  // Timing: wall-clock delta to the previous action, in ms.
  if (sig.lastActionWallMs != null) {
    const delta = wallMs - sig.lastActionWallMs;
    if (delta >= 0 && delta < 60_000) {  // cap 60s; longer = AFK, not click timing
      sig.timings.push(delta);
      if (sig.timings.length > TIMING_BUFFER) sig.timings.shift();
    }
  }
  sig.lastActionWallMs = wallMs;

  // AFK: if the gap from last action exceeds 25 ticks (≈15s), record it as an
  // AFK interval. Bots tend to AFK for EXACTLY the same interval each time.
  if (sig.lastActionTick != null) {
    const gap = tick - sig.lastActionTick;
    if (gap >= 25) {
      sig.afkIntervals.push(gap);
      if (sig.afkIntervals.length > 32) sig.afkIntervals.shift();
    }
  }
  sig.lastActionTick = tick;
  sig.lastActiveTick = tick;

  // Per-type side-effects.
  if (actionType === 'camera_move') sig.cameraMoves++;
  if (actionType === 'chat') sig.chatEvents++;
  if (actionType === 'logout') {
    sig.logoutTicks.push(tick);
    if (sig.logoutTicks.length > LOGOUT_BUFFER) sig.logoutTicks.shift();
  }
  if (actionType === 'event_response') {
    sig.responsesToEvents++;
  }
  if (actionType === 'event_prompted') {
    sig.eventsPrompted++;
  }

  return action;
}

// ── Analyzers (each returns a 0-1 sub-score) ────────────────────────────────

/**
 * analyzeTimings — click-pattern variance.
 * Humans: std dev ~50-200ms. Bots: often < 10ms std dev.
 * Returns 1.0 for very low variance, 0.0 for healthy variance.
 */
function analyzeTimings(player) {
  const sig = ensureSignals(player);
  if (!sig || sig.timings.length < 8) return 0;   // not enough data — neutral
  const timings = sig.timings;
  const mean = timings.reduce((a, b) => a + b, 0) / timings.length;
  const variance = timings.reduce((a, b) => a + (b - mean) * (b - mean), 0) / timings.length;
  const stdDev = Math.sqrt(variance);
  // < 10ms -> 1.0, 50ms -> 0.5, >= 200ms -> 0.0  (piecewise linear)
  if (stdDev < 10) return 1;
  if (stdDev >= 200) return 0;
  // Linear between 10 and 200.
  return 1 - ((stdDev - 10) / 190);
}

/**
 * analyzeRouting — bots walk optimal paths; humans wander.
 * We approximate optimality by looking at the last few movement actions and
 * checking whether consecutive (x, y) steps sum to a Manhattan distance equal
 * to the straight-line step count (i.e., perfectly straight, no wander).
 * Returns a 0-1 score where 1.0 = fully optimal, 0.0 = human-like wander.
 */
function analyzeRouting(player) {
  const sig = ensureSignals(player);
  if (!sig) return 0;
  const moves = sig.actions.filter(a => a.type === 'move' && a.meta
    && Number.isFinite(a.meta.x) && Number.isFinite(a.meta.y));
  if (moves.length < 6) return 0;
  let straight = 0;
  let total = 0;
  for (let i = 1; i < moves.length; i++) {
    const dx = Math.abs(moves[i].meta.x - moves[i - 1].meta.x);
    const dy = Math.abs(moves[i].meta.y - moves[i - 1].meta.y);
    if (dx + dy === 0) continue;
    total++;
    // A "straight" step is one with no lateral wander: dx==0 or dy==0 (or the
    // diagonal is monotonic in both axes).
    if (dx === 0 || dy === 0) straight++;
  }
  if (total === 0) return 0;
  return straight / total;   // 1.0 = every step straight -> optimal
}

/**
 * analyzeAfkRegularity — bots AFK for EXACTLY the same interval each time.
 * Std dev of AFK gaps is the signal; low std dev with >=4 samples = suspicious.
 */
function analyzeAfkRegularity(player) {
  const sig = ensureSignals(player);
  if (!sig || sig.afkIntervals.length < 4) return 0;
  const arr = sig.afkIntervals;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const variance = arr.reduce((a, b) => a + (b - mean) * (b - mean), 0) / arr.length;
  const stdDev = Math.sqrt(variance);
  // std dev < 2 ticks => 1.0, std dev >= 30 ticks => 0.0
  if (stdDev < 2) return 1;
  if (stdDev >= 30) return 0;
  return 1 - ((stdDev - 2) / 28);
}

/**
 * analyzeResponseToEvents — random events. Humans respond in seconds; bots
 * either respond in ms (fully automated recognition) or ignore them.
 * Signal = 1.0 when responsesToEvents/eventsPrompted diverges from ~0.7.
 */
function analyzeResponseToEvents(player) {
  const sig = ensureSignals(player);
  if (!sig || sig.eventsPrompted < 3) return 0;
  const ratio = sig.responsesToEvents / sig.eventsPrompted;
  // Humans tend to respond ~0.5-0.9 of the time. Extreme values (always or
  // never) are bot-like.
  if (ratio <= 0.1 || ratio >= 0.98) return 1;   // ignore OR always = suspicious
  if (ratio >= 0.4 && ratio <= 0.9) return 0;    // healthy band
  // Linear falloff outside the healthy band.
  if (ratio < 0.4) return (0.4 - ratio) / 0.3;
  return (ratio - 0.9) / 0.08;
}

/**
 * analyzeCameraActivity — humans wiggle their camera mid-task.
 * Low camera movement during a session is mildly suspicious.
 */
function analyzeCameraActivity(player) {
  const sig = ensureSignals(player);
  if (!sig) return 0;
  if (sig.actions.length < 20) return 0;
  // 0 camera moves across 20+ actions = 1.0; 10+ camera moves = 0.0
  if (sig.cameraMoves === 0) return 1;
  if (sig.cameraMoves >= 10) return 0;
  return 1 - (sig.cameraMoves / 10);
}

/**
 * analyzeChatEngagement — bots rarely chat.
 * 0 chat events across an extended session is a mild signal.
 */
function analyzeChatEngagement(player) {
  const sig = ensureSignals(player);
  if (!sig) return 0;
  if (sig.actions.length < 30) return 0;
  if (sig.chatEvents === 0) return 0.6;   // mild; plenty of humans don't chat either
  if (sig.chatEvents >= 3) return 0;
  return 0.6 - (sig.chatEvents * 0.2);
}

/**
 * analyzeLogoutRegularity — bots often log at EXACT 6-hour marks.
 * If many recent logouts land within ~60 ticks of the 6-hour tick, flag it.
 */
function analyzeLogoutRegularity(player) {
  const sig = ensureSignals(player);
  if (!sig || sig.logoutTicks.length < 2) return 0;
  // Look at intervals between consecutive logouts.
  const gaps = [];
  for (let i = 1; i < sig.logoutTicks.length; i++) {
    gaps.push(sig.logoutTicks[i] - sig.logoutTicks[i - 1]);
  }
  // How many gaps are within ±60 ticks (±36s) of the 6-hour mark?
  let suspicious = 0;
  for (const g of gaps) {
    if (Math.abs(g - SIX_HOURS_TICKS) < 60) suspicious++;
  }
  return suspicious / gaps.length;
}

/**
 * analyzeHoneypots — honeypot hits are the strongest signal.
 * Each hit increments honeypotHits; normalized so a single hit is 0.5 and
 * 2+ hits clamps to 1.0.
 */
function analyzeHoneypots(player) {
  const sig = ensureSignals(player);
  if (!sig) return 0;
  if (sig.honeypotHits === 0) return 0;
  if (sig.honeypotHits >= 2) return 1;
  return 0.5;
}

// ── Score aggregator ────────────────────────────────────────────────────────

/**
 * getBotScore(player) -> number in [0, 1]
 * Weighted sum of individual signal scores, normalized by total weight.
 * Also caches the breakdown on player.botSignals.lastAnalysis for /botscore.
 */
function getBotScore(player) {
  const sig = ensureSignals(player);
  if (!sig) return 0;

  const breakdown = {
    timingVariance:    analyzeTimings(player),
    routingOptimality: analyzeRouting(player),
    afkRegularity:     analyzeAfkRegularity(player),
    responseToEvents:  analyzeResponseToEvents(player),
    cameraActivity:    analyzeCameraActivity(player),
    chatEngagement:    analyzeChatEngagement(player),
    logoutRegularity:  analyzeLogoutRegularity(player),
    honeypots:         analyzeHoneypots(player),
  };

  let numerator = 0;
  let denominator = 0;
  for (const k of Object.keys(SIGNAL_WEIGHTS)) {
    const w = SIGNAL_WEIGHTS[k];
    const v = breakdown[k] || 0;
    numerator += w * v;
    denominator += w;
  }
  const score = denominator > 0 ? numerator / denominator : 0;
  const clamped = Math.max(0, Math.min(1, score));

  sig.lastAnalysis = { tick: getTick(), score: clamped, breakdown };
  sig.score = clamped;
  return clamped;
}

// ── Honeypots ──────────────────────────────────────────────────────────────

/**
 * Honeypot registry. A honeypot is an entity the engine spawns that should NOT
 * be interacted with by any rational human but is attractive to an automation
 * script (e.g., a rare drop that appears in plain sight or a bank item that
 * "shouldn't be there"). Any interaction is logged against the player.
 */
const honeypots = new Map();        // id -> { id, kind, x, y, meta, placedAtTick }
let nextHoneypotId = 1;

const HONEYPOT_KINDS = Object.freeze({
  FAKE_DROP:        'fake_drop',       // a "rare drop" that despawns on pickup
  TRIPWIRE_BANK:    'tripwire_bank',   // bank item that shouldn't have moved
  FAKE_LEVEL_UP:    'fake_level_up',   // fake level-up event, no XP granted
});

function placeHoneypot(kind, x, y, meta) {
  if (!Object.values(HONEYPOT_KINDS).includes(kind)) {
    return { ok: false, reason: `Unknown honeypot kind: ${kind}` };
  }
  const id = nextHoneypotId++;
  const record = {
    id, kind,
    x: Number.isFinite(x) ? x : null,
    y: Number.isFinite(y) ? y : null,
    meta: meta && typeof meta === 'object' ? meta : null,
    placedAtTick: getTick(),
    triggered: 0,
  };
  honeypots.set(id, record);
  events.emit('bot:honeypot_placed', { type: 'bot:honeypot_placed', ...record });
  return { ok: true, honeypot: record };
}

function listHoneypots() {
  return Array.from(honeypots.values());
}

function removeHoneypot(id) {
  return honeypots.delete(id);
}

/**
 * checkHoneypots(player, honeypotId?)
 * If honeypotId is given, increments the hit counter for that honeypot AND
 * charges it to the player. Returns the honeypot result for routing the
 * player (e.g., teleport-to-despawn) by the caller.
 */
function checkHoneypots(player, honeypotId) {
  const sig = ensureSignals(player);
  if (!sig) return { ok: false, reason: 'No player.' };
  if (honeypotId == null) {
    // Pure query: has this player hit any honeypot?
    return { ok: true, hits: sig.honeypotHits };
  }
  const hp = honeypots.get(honeypotId);
  if (!hp) return { ok: false, reason: `Unknown honeypot: ${honeypotId}` };
  hp.triggered++;
  sig.honeypotHits++;
  events.emit('bot:honeypot_triggered', {
    type: 'bot:honeypot_triggered',
    playerId: player.id,
    honeypotId,
    kind: hp.kind,
    tick: getTick(),
  });
  // A honeypot hit is automatically an escalation trigger.
  escalate(player, `Honeypot triggered: ${hp.kind} #${honeypotId}`);
  return { ok: true, honeypot: hp, totalHits: sig.honeypotHits };
}

// ── Escalation queue (admin review) ─────────────────────────────────────────

const escalations = [];             // { playerId, reason, tick, score }
const ESCALATION_CAP = 512;

function escalate(player, reason) {
  const sig = ensureSignals(player);
  if (!sig) return null;
  const score = getBotScore(player);
  const entry = {
    playerId: player && player.id,
    playerName: (player && player.name) || null,
    reason: String(reason || 'unspecified'),
    tick: getTick(),
    score,
  };
  escalations.push(entry);
  if (escalations.length > ESCALATION_CAP) escalations.shift();
  sig.escalated = true;
  events.emit('bot:escalated', { type: 'bot:escalated', ...entry });
  return entry;
}

function getEscalations() {
  return escalations.slice();
}

function clearEscalations() {
  escalations.length = 0;
}

// ── Self-labeling (transparency) ────────────────────────────────────────────

function markAsBot(player, flag) {
  const sig = ensureSignals(player);
  if (!sig) return false;
  const next = flag === undefined ? true : !!flag;
  sig.isBot = next;
  player.isBot = next;
  events.emit('bot:self_label', {
    type: 'bot:self_label',
    playerId: player.id,
    isBot: next,
    tick: getTick(),
  });
  return true;
}

function isSelfLabeledBot(player) {
  return !!(player && (player.isBot || (player.botSignals && player.botSignals.isBot)));
}

// ── GE price modifier (anti-exploitation for self-labeled bots) ─────────────

/**
 * applyGEPrice(player, basePrice) -> number
 * If the player self-labels as a bot, reduce their GE price by the server's
 * priceDiscount. No change for non-bots. Callers apply this to both sides of
 * an offer (or only to the bot's side, depending on policy).
 */
function applyGEPrice(player, basePrice) {
  if (!isSelfLabeledBot(player)) return basePrice;
  const cfg = getPolicy();
  const disc = Number.isFinite(cfg.priceDiscount) ? cfg.priceDiscount : 0.1;
  return Math.max(1, Math.floor(basePrice * (1 - disc)));
}

// ── Periodic analyzer ──────────────────────────────────────────────────────
// analysePlayers(players) is called roughly every ANALYSIS_INTERVAL_TICKS.
// server bootstrap wires this into the tick loop. Returns a summary.

function analysePlayers(players) {
  if (!Array.isArray(players)) return { analyzed: 0 };
  const cfg = getPolicy();
  let flagged = 0;
  let escalated = 0;
  let autobanned = 0;

  for (const p of players) {
    if (!p) continue;
    const score = getBotScore(p);
    if (score >= cfg.autoEscalateThreshold) {
      escalate(p, `Auto-escalated at score ${score.toFixed(3)}`);
      escalated++;
    }
    if (score >= 0.5) flagged++;
    if (cfg.policy === POLICIES.BAN && score >= cfg.banThreshold) {
      // We emit the event only — the caller decides how to actually ban.
      events.emit('bot:autoban_candidate', {
        type: 'bot:autoban_candidate',
        playerId: p.id,
        playerName: p.name || null,
        score,
        tick: getTick(),
      });
      autobanned++;
    }
  }
  return { analyzed: players.length, flagged, escalated, autobanned };
}

// ── Zone helper (for policy 'zone_restricted') ─────────────────────────────

function isBotAllowedInZone(player, zoneName) {
  const cfg = getPolicy();
  if (cfg.policy !== POLICIES.ZONE_RESTRICTED) return true;  // policy doesn't care
  if (!isSelfLabeledBot(player)) return true;                 // not a labeled bot
  const zones = Array.isArray(cfg.botZones) ? cfg.botZones : [];
  return zones.indexOf(zoneName) >= 0;
}

// ── Reset helpers (mainly for tests) ───────────────────────────────────────

function _resetForTests() {
  honeypots.clear();
  nextHoneypotId = 1;
  escalations.length = 0;
  currentPolicy = null;
}

// ── Exports ─────────────────────────────────────────────────────────────────

module.exports = {
  // Signal recording.
  recordAction,
  ensureSignals,

  // Individual analyzers.
  analyzeTimings,
  analyzeRouting,
  analyzeAfkRegularity,
  analyzeResponseToEvents,
  analyzeCameraActivity,
  analyzeChatEngagement,
  analyzeLogoutRegularity,
  analyzeHoneypots,

  // Aggregate score.
  getBotScore,

  // Policy.
  loadPolicy,
  getPolicy,
  setPolicy,
  getPolicyFor,

  // Honeypots.
  placeHoneypot,
  listHoneypots,
  removeHoneypot,
  checkHoneypots,

  // Escalation.
  escalate,
  getEscalations,
  clearEscalations,

  // Self-labeling.
  markAsBot,
  isSelfLabeledBot,

  // GE helper.
  applyGEPrice,

  // Zone helper.
  isBotAllowedInZone,

  // Periodic analyzer.
  analysePlayers,

  // Wiring.
  setTickSource,

  // Constants.
  POLICIES,
  HONEYPOT_KINDS,
  SIGNAL_WEIGHTS,
  ANALYSIS_INTERVAL_TICKS,
  SIX_HOURS_TICKS,
  DEFAULT_POLICY,

  // Test helpers.
  _resetForTests,
};
