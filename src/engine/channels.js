// ══════════════════════════════════════════════════════════════════════════════
// Communication Channels (burn-v2)
//
// Implements the 14-channel chat model described in
// build-your-own-scape/docs/communication.md.
//
// Channels supported:
//   public          local chat, proximity-gated (default 20 tiles)
//   private         1-on-1 whispers
//   clan            clan members only
//   clan-broadcast  clan leadership -> all members
//   trade           global, rate-limited
//   help            global newbie questions
//   pvp             wilderness-only
//   region          per-region chat
//   friends         private friends list
//   staff           admins + moderators
//   group-ironman   for group ironman members
//   quickchat       preset phrases, always available
//   event           for active event participants
//   announce        server-wide announcements (mod+)
//
// Each channel carries:
//   - name         display label
//   - tag          short channel id used in prefixes e.g. [T] for trade
//   - access       who can read/send (function of player + context)
//   - rateLimit    { messages, windowMs }
//   - cooldownMs   minimum delay between consecutive messages
//   - charLimit    maximum characters per message
//   - logPath      relative path under data/chat-logs for persistence
//   - retentionDays  log retention policy
//   - proximityTiles (public only) 20-tile visibility radius
//
// Friend / ignore / mute state lives on the player object:
//   player.friends = [friendId, ...]
//   player.ignored = [ignoredId, ...]
//   player.mutedChannels = { channelId: true }
//
// Persistence is done via src/engine/persistence.js which writes under data/.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const fs = require('fs');
const path = require('path');
const events = require('./events');

// ── Constants ──────────────────────────────────────────────────────────────
const PUBLIC_PROXIMITY_TILES = 20;
const DEFAULT_RATE_LIMIT = { messages: 5, windowMs: 10000 };
const AUTO_MUTE_AFTER_FILTERED = 3;
const AUTO_MUTE_SECONDS = 300;
const DEFAULT_CHAR_LIMIT = 240;

// Directories for logs and data files.
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
let CHAT_LOG_DIR = path.join(DATA_DIR, 'chat-logs');
const FRIENDS_FILE = 'friends-lists.json';
const SETTINGS_FILE = 'channel-settings.json';
let FILTER_FILE = path.join(DATA_DIR, 'chat-filter.json');

function setFilterFile(p) { FILTER_FILE = p; filterCache = null; }
function setChatLogDir(p) { CHAT_LOG_DIR = p; }
function getFilterFile() { return FILTER_FILE; }
function getChatLogDir() { return CHAT_LOG_DIR; }

// ── Channel definitions ─────────────────────────────────────────────────────
// Keep ids lowercase. `access` is { read(player, ctx), send(player, ctx) }.
// ctx may include { speaker, recipient, regionId, event, position } etc.
const CHANNELS = Object.freeze({
  public: {
    id: 'public',
    name: 'Public',
    tag: 'P',
    type: 'proximity',
    proximityTiles: PUBLIC_PROXIMITY_TILES,
    rateLimit: { messages: 5, windowMs: 10000 },
    cooldownMs: 600,
    charLimit: 80,
    logPath: 'public',
    retentionDays: 7,
    default: true,
  },
  private: {
    id: 'private',
    name: 'Private',
    tag: 'W',
    type: 'whisper',
    rateLimit: { messages: 10, windowMs: 10000 },
    cooldownMs: 300,
    charLimit: DEFAULT_CHAR_LIMIT,
    logPath: 'private',
    retentionDays: 30,
    default: true,
  },
  clan: {
    id: 'clan',
    name: 'Clan',
    tag: 'C',
    type: 'clan',
    rateLimit: { messages: 6, windowMs: 10000 },
    cooldownMs: 400,
    charLimit: 200,
    logPath: 'clan',
    retentionDays: 30,
    default: true,
  },
  'clan-broadcast': {
    id: 'clan-broadcast',
    name: 'Clan Broadcast',
    tag: 'CB',
    type: 'clan-broadcast',
    rateLimit: { messages: 2, windowMs: 60000 },
    cooldownMs: 5000,
    charLimit: 240,
    logPath: 'clan-broadcast',
    retentionDays: 90,
    default: true,
  },
  trade: {
    id: 'trade',
    name: 'Trade',
    tag: 'T',
    type: 'global',
    rateLimit: { messages: 3, windowMs: 30000 },
    cooldownMs: 3000,
    charLimit: 160,
    logPath: 'trade',
    retentionDays: 14,
    default: true,
  },
  help: {
    id: 'help',
    name: 'Help',
    tag: 'H',
    type: 'global',
    rateLimit: { messages: 4, windowMs: 20000 },
    cooldownMs: 1500,
    charLimit: 240,
    logPath: 'help',
    retentionDays: 14,
    default: true,
    moderated: true,
  },
  pvp: {
    id: 'pvp',
    name: 'PvP',
    tag: 'V',
    type: 'zone',
    zone: 'wilderness',
    rateLimit: { messages: 5, windowMs: 10000 },
    cooldownMs: 400,
    charLimit: 120,
    logPath: 'pvp',
    retentionDays: 14,
    default: true,
  },
  region: {
    id: 'region',
    name: 'Region',
    tag: 'R',
    type: 'region',
    rateLimit: { messages: 5, windowMs: 10000 },
    cooldownMs: 600,
    charLimit: 180,
    logPath: 'region',
    retentionDays: 7,
    default: true,
  },
  friends: {
    id: 'friends',
    name: 'Friends',
    tag: 'F',
    type: 'friends',
    rateLimit: { messages: 10, windowMs: 10000 },
    cooldownMs: 300,
    charLimit: DEFAULT_CHAR_LIMIT,
    logPath: 'friends',
    retentionDays: 30,
    default: true,
  },
  staff: {
    id: 'staff',
    name: 'Staff',
    tag: 'S',
    type: 'role',
    role: 'staff',
    rateLimit: { messages: 20, windowMs: 10000 },
    cooldownMs: 200,
    charLimit: DEFAULT_CHAR_LIMIT,
    logPath: 'staff',
    retentionDays: 365,
    default: true,
  },
  'group-ironman': {
    id: 'group-ironman',
    name: 'Group Ironman',
    tag: 'GI',
    type: 'group-ironman',
    rateLimit: { messages: 6, windowMs: 10000 },
    cooldownMs: 400,
    charLimit: DEFAULT_CHAR_LIMIT,
    logPath: 'group-ironman',
    retentionDays: 30,
    default: true,
  },
  quickchat: {
    id: 'quickchat',
    name: 'Quick Chat',
    tag: 'Q',
    type: 'preset',
    rateLimit: { messages: 6, windowMs: 10000 },
    cooldownMs: 500,
    charLimit: 240,
    logPath: 'quickchat',
    retentionDays: 7,
    default: true,
  },
  event: {
    id: 'event',
    name: 'Event',
    tag: 'E',
    type: 'event',
    rateLimit: { messages: 10, windowMs: 10000 },
    cooldownMs: 300,
    charLimit: 200,
    logPath: 'event',
    retentionDays: 14,
    default: true,
  },
  announce: {
    id: 'announce',
    name: 'Announce',
    tag: 'A',
    type: 'announce',
    role: 'staff',
    rateLimit: { messages: 5, windowMs: 60000 },
    cooldownMs: 2000,
    charLimit: 300,
    logPath: 'announce',
    retentionDays: 365,
    default: true,
  },
});

const ALL_CHANNELS = Object.freeze(Object.keys(CHANNELS));

// ── Helpers: player state shape ─────────────────────────────────────────────
function ensureState(player) {
  if (!player || typeof player !== 'object') return;
  if (!Array.isArray(player.friends)) player.friends = [];
  if (!Array.isArray(player.ignored)) player.ignored = [];
  if (!player.mutedChannels || typeof player.mutedChannels !== 'object') {
    player.mutedChannels = {};
  }
  if (!player.chatState || typeof player.chatState !== 'object') {
    player.chatState = {
      lastSendAt: {},            // channelId -> timestamp
      windowBuckets: {},          // channelId -> [timestamps]
      filteredStreak: 0,          // consecutive filtered messages
      autoMuteUntil: 0,           // epoch ms while auto-muted
    };
  }
}

function isStaff(player) {
  return !!(player && (player.admin || player.staff || player.role === 'staff' ||
    player.role === 'admin' || player.role === 'moderator'));
}

function inWilderness(player) {
  if (!player) return false;
  if (player.inWilderness === true) return true;
  if (player.zone === 'wilderness') return true;
  if (player.region === 'wilderness') return true;
  return false;
}

function playerRegion(player) {
  if (!player) return null;
  if (player.region) return player.region;
  if (player.regionId) return player.regionId;
  return null;
}

function inSameClan(a, b) {
  if (!a || !b) return false;
  if (!a.clan && !a.clanId) return false;
  const ca = a.clan || a.clanId;
  const cb = b.clan || b.clanId;
  return !!(ca && cb && ca === cb);
}

function isClanLeader(player) {
  if (!player) return false;
  const rank = (player.clanRank || '').toLowerCase();
  return rank === 'leader' || rank === 'officer' || rank === 'owner' ||
    !!player.clanLeader;
}

function inSameGroupIronman(a, b) {
  if (!a || !b) return false;
  if (!a.ironman || !b.ironman) return false;
  if (a.ironman.variant !== 'group_ironman') return false;
  if (b.ironman.variant !== 'group_ironman') return false;
  const ga = a.ironman.group || [];
  const gb = b.ironman.group || [];
  return ga.includes(b.id) || gb.includes(a.id) || a.id === b.id;
}

function manhattanDistance(a, b) {
  if (!a || !b) return Infinity;
  if (a.layer !== undefined && b.layer !== undefined && a.layer !== b.layer) {
    return Infinity;
  }
  const ax = a.x || 0, ay = a.y || 0, bx = b.x || 0, by = b.y || 0;
  return Math.abs(ax - bx) + Math.abs(ay - by);
}

// ── Access control ──────────────────────────────────────────────────────────
function canRead(channelId, player, ctx = {}) {
  const ch = CHANNELS[channelId];
  if (!ch) return { allowed: false, reason: `Unknown channel '${channelId}'.` };
  if (!player) return { allowed: false, reason: 'No player.' };
  ensureState(player);

  if (player.mutedChannels && player.mutedChannels[channelId]) {
    return { allowed: false, reason: `You have muted ${ch.name}.` };
  }

  switch (ch.type) {
    case 'proximity': {
      const speaker = ctx.speaker;
      if (!speaker) return { allowed: true };
      const d = manhattanDistance(player, speaker);
      return d <= (ch.proximityTiles || PUBLIC_PROXIMITY_TILES)
        ? { allowed: true }
        : { allowed: false, reason: 'Out of range.' };
    }
    case 'whisper': {
      const recipient = ctx.recipient;
      const speaker = ctx.speaker;
      if (!speaker || !recipient) return { allowed: false, reason: 'Whisper needs both parties.' };
      if (player.id !== speaker.id && player.id !== recipient.id) {
        return { allowed: false, reason: 'Not your whisper.' };
      }
      return { allowed: true };
    }
    case 'clan': {
      const speaker = ctx.speaker;
      if (speaker && !inSameClan(player, speaker)) {
        return { allowed: false, reason: 'Different clan.' };
      }
      if (!player.clan && !player.clanId) {
        return { allowed: false, reason: 'Not in a clan.' };
      }
      return { allowed: true };
    }
    case 'clan-broadcast': {
      if (!player.clan && !player.clanId) {
        return { allowed: false, reason: 'Not in a clan.' };
      }
      return { allowed: true };
    }
    case 'global':
      return { allowed: true };
    case 'zone': {
      if (ch.zone === 'wilderness' && !inWilderness(player)) {
        return { allowed: false, reason: 'PvP chat only in wilderness.' };
      }
      return { allowed: true };
    }
    case 'region': {
      const region = ctx.regionId || playerRegion(ctx.speaker);
      if (!region) return { allowed: true };
      if (playerRegion(player) !== region) {
        return { allowed: false, reason: 'Not in that region.' };
      }
      return { allowed: true };
    }
    case 'friends': {
      const speaker = ctx.speaker;
      if (!speaker) return { allowed: false, reason: 'No speaker.' };
      if (player.id === speaker.id) return { allowed: true };
      const onList = (speaker.friends || []).includes(player.id) ||
        (player.friends || []).includes(speaker.id);
      return onList
        ? { allowed: true }
        : { allowed: false, reason: 'Not on the speaker\'s friends list.' };
    }
    case 'role': {
      return isStaff(player)
        ? { allowed: true }
        : { allowed: false, reason: 'Staff only.' };
    }
    case 'group-ironman': {
      const speaker = ctx.speaker;
      if (!speaker) {
        if (player.ironman && player.ironman.variant === 'group_ironman') {
          return { allowed: true };
        }
        return { allowed: false, reason: 'Not a group ironman.' };
      }
      return inSameGroupIronman(player, speaker)
        ? { allowed: true }
        : { allowed: false, reason: 'Different group.' };
    }
    case 'preset':
      return { allowed: true };
    case 'event': {
      const speaker = ctx.speaker;
      const evId = ctx.eventId || (speaker && speaker.activeEvent);
      const playerEv = player.activeEvent;
      if (!evId) return { allowed: false, reason: 'No active event.' };
      if (playerEv !== evId) {
        return { allowed: false, reason: 'Not in the event.' };
      }
      return { allowed: true };
    }
    case 'announce':
      return { allowed: true };
    default:
      return { allowed: false, reason: `Unknown channel type '${ch.type}'.` };
  }
}

function canSend(channelId, player, ctx = {}) {
  const ch = CHANNELS[channelId];
  if (!ch) return { allowed: false, reason: `Unknown channel '${channelId}'.` };
  if (!player) return { allowed: false, reason: 'No player.' };
  ensureState(player);

  if (player.chatState && player.chatState.autoMuteUntil > Date.now()) {
    return { allowed: false, reason: 'You are temporarily muted.' };
  }

  switch (ch.type) {
    case 'proximity':
    case 'whisper':
    case 'global':
    case 'preset':
      return { allowed: true };
    case 'clan':
      if (!player.clan && !player.clanId) {
        return { allowed: false, reason: 'You are not in a clan.' };
      }
      return { allowed: true };
    case 'clan-broadcast':
      if (!isClanLeader(player)) {
        return { allowed: false, reason: 'Clan leadership only.' };
      }
      return { allowed: true };
    case 'zone':
      if (ch.zone === 'wilderness' && !inWilderness(player)) {
        return { allowed: false, reason: 'PvP chat only available in the wilderness.' };
      }
      return { allowed: true };
    case 'region':
      if (!playerRegion(player)) {
        return { allowed: false, reason: 'Not in a region.' };
      }
      return { allowed: true };
    case 'friends':
      return { allowed: true };
    case 'role':
      return isStaff(player)
        ? { allowed: true }
        : { allowed: false, reason: 'Staff only.' };
    case 'group-ironman':
      if (!player.ironman || player.ironman.variant !== 'group_ironman') {
        return { allowed: false, reason: 'Group ironmen only.' };
      }
      return { allowed: true };
    case 'event':
      if (!player.activeEvent) {
        return { allowed: false, reason: 'Not in an event.' };
      }
      return { allowed: true };
    case 'announce':
      return isStaff(player)
        ? { allowed: true }
        : { allowed: false, reason: 'Moderators only.' };
    default:
      return { allowed: false, reason: `Unknown channel type '${ch.type}'.` };
  }
}

// ── Rate limiting ───────────────────────────────────────────────────────────
function checkRateLimit(player, channelId, now = Date.now()) {
  const ch = CHANNELS[channelId];
  if (!ch) return { allowed: false, reason: 'Unknown channel.' };
  ensureState(player);

  const state = player.chatState;
  const { cooldownMs, rateLimit } = ch;
  const last = state.lastSendAt[channelId] || 0;
  if (cooldownMs && now - last < cooldownMs) {
    const waitMs = cooldownMs - (now - last);
    return { allowed: false, reason: `Cooldown: wait ${waitMs}ms.` };
  }

  const bucket = state.windowBuckets[channelId] || [];
  const cutoff = now - (rateLimit.windowMs || DEFAULT_RATE_LIMIT.windowMs);
  const windowed = bucket.filter(t => t >= cutoff);
  if (windowed.length >= (rateLimit.messages || DEFAULT_RATE_LIMIT.messages)) {
    return {
      allowed: false,
      reason: `Rate limit: ${rateLimit.messages} per ${Math.round(rateLimit.windowMs / 1000)}s.`,
    };
  }
  return { allowed: true, windowed };
}

function recordSend(player, channelId, now = Date.now()) {
  ensureState(player);
  const state = player.chatState;
  state.lastSendAt[channelId] = now;
  const bucket = state.windowBuckets[channelId] || [];
  const cutoff = now - ((CHANNELS[channelId] && CHANNELS[channelId].rateLimit.windowMs) || DEFAULT_RATE_LIMIT.windowMs);
  state.windowBuckets[channelId] = [...bucket.filter(t => t >= cutoff), now];
}

// ── Filters: profanity, links ───────────────────────────────────────────────
let filterCache = null;
function loadFilter() {
  if (filterCache) return filterCache;
  let words = [];
  let urlAllowList = [];
  try {
    if (fs.existsSync(FILTER_FILE)) {
      const raw = JSON.parse(fs.readFileSync(FILTER_FILE, 'utf8'));
      words = Array.isArray(raw.profanity) ? raw.profanity : [];
      urlAllowList = Array.isArray(raw.urlAllowList) ? raw.urlAllowList : [];
    }
  } catch (e) {
    // Swallow: missing filter is not fatal. The filter file is intentionally
    // kept off the public repo; a safe default is no-profanity, all-URLs-blocked.
  }
  filterCache = { words, urlAllowList };
  return filterCache;
}

function resetFilterCache() {
  filterCache = null;
}

function containsProfanity(text) {
  const { words } = loadFilter();
  if (!words.length) return false;
  const lower = String(text || '').toLowerCase();
  for (const w of words) {
    if (!w) continue;
    if (lower.includes(w.toLowerCase())) return true;
  }
  return false;
}

function containsDisallowedLink(text) {
  const { urlAllowList } = loadFilter();
  const str = String(text || '');
  const urlRegex = /\b((?:https?:\/\/|www\.)[^\s]+)/gi;
  const matches = str.match(urlRegex) || [];
  if (!matches.length) return false;
  const allow = urlAllowList.map(s => s.toLowerCase());
  for (const m of matches) {
    const lower = m.toLowerCase();
    const hit = allow.find(a => lower.includes(a));
    if (!hit) return true;
  }
  return false;
}

function applyFilters(text, channelId) {
  const reasons = [];
  const ch = CHANNELS[channelId];
  if (ch && ch.charLimit && text.length > ch.charLimit) {
    reasons.push(`Message exceeds ${ch.charLimit} chars.`);
  }
  if (containsProfanity(text)) reasons.push('Profanity blocked.');
  if (containsDisallowedLink(text)) reasons.push('Links not allowed.');
  return { allowed: reasons.length === 0, reasons };
}

function registerFilteredMessage(player) {
  ensureState(player);
  const state = player.chatState;
  state.filteredStreak = (state.filteredStreak || 0) + 1;
  if (state.filteredStreak >= AUTO_MUTE_AFTER_FILTERED) {
    state.autoMuteUntil = Date.now() + AUTO_MUTE_SECONDS * 1000;
    state.filteredStreak = 0;
    events.emit('chat_auto_muted', { playerId: player.id, durationSec: AUTO_MUTE_SECONDS });
    return true;
  }
  return false;
}

function resetFilteredStreak(player) {
  ensureState(player);
  player.chatState.filteredStreak = 0;
}

// ── Logging ─────────────────────────────────────────────────────────────────
let logWriter = defaultLogWriter;

function defaultLogWriter(channelId, entry) {
  try {
    const ch = CHANNELS[channelId];
    if (!ch || !ch.logPath) return;
    const date = new Date(entry.ts || Date.now()).toISOString().slice(0, 10);
    const dir = path.join(CHAT_LOG_DIR, ch.logPath);
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `${date}.log`);
    const line = JSON.stringify(entry) + '\n';
    fs.appendFileSync(file, line);
  } catch (e) {
    // non-fatal; logging must never crash the send path
  }
}

function setLogWriter(fn) {
  logWriter = typeof fn === 'function' ? fn : defaultLogWriter;
}

function getLogWriter() { return logWriter; }

// ── Friends / ignore ────────────────────────────────────────────────────────
function addFriend(player, friendId) {
  ensureState(player);
  if (!friendId || friendId === player.id) {
    return { ok: false, reason: 'Invalid friend.' };
  }
  if (player.friends.includes(friendId)) {
    return { ok: false, reason: 'Already on friends list.' };
  }
  if (player.friends.length >= 400) {
    return { ok: false, reason: 'Friends list full.' };
  }
  player.friends.push(friendId);
  events.emit('friend_added', { playerId: player.id, friendId });
  return { ok: true, friends: player.friends.slice() };
}

function removeFriend(player, friendId) {
  ensureState(player);
  const idx = player.friends.indexOf(friendId);
  if (idx < 0) return { ok: false, reason: 'Not on friends list.' };
  player.friends.splice(idx, 1);
  events.emit('friend_removed', { playerId: player.id, friendId });
  return { ok: true, friends: player.friends.slice() };
}

function ignore(player, targetId) {
  ensureState(player);
  if (!targetId || targetId === player.id) {
    return { ok: false, reason: 'Invalid target.' };
  }
  if (player.ignored.includes(targetId)) {
    return { ok: false, reason: 'Already ignored.' };
  }
  if (player.ignored.length >= 200) {
    return { ok: false, reason: 'Ignore list full.' };
  }
  player.ignored.push(targetId);
  events.emit('player_ignored', { playerId: player.id, targetId });
  return { ok: true, ignored: player.ignored.slice() };
}

function unignore(player, targetId) {
  ensureState(player);
  const idx = player.ignored.indexOf(targetId);
  if (idx < 0) return { ok: false, reason: 'Not ignored.' };
  player.ignored.splice(idx, 1);
  events.emit('player_unignored', { playerId: player.id, targetId });
  return { ok: true, ignored: player.ignored.slice() };
}

function isIgnored(player, otherId) {
  ensureState(player);
  return player.ignored.includes(otherId);
}

function isFriend(player, otherId) {
  ensureState(player);
  return player.friends.includes(otherId);
}

// ── Mute / Unmute channels (per-player preference) ──────────────────────────
function mute(player, channelId) {
  ensureState(player);
  if (!CHANNELS[channelId]) return { ok: false, reason: 'Unknown channel.' };
  player.mutedChannels[channelId] = true;
  return { ok: true };
}

function unmute(player, channelId) {
  ensureState(player);
  if (!CHANNELS[channelId]) return { ok: false, reason: 'Unknown channel.' };
  delete player.mutedChannels[channelId];
  return { ok: true };
}

function mutedChannels(player) {
  ensureState(player);
  return Object.keys(player.mutedChannels);
}

// ── Send pipeline ───────────────────────────────────────────────────────────
/**
 * sendMessage(speaker, channelId, text, opts)
 *
 * Fully validates permissions, rate limit, filters. Emits `chat_message`
 * on success with a recipient list (computed lazily by the caller via
 * `audience` helper — we only compute it when a player registry is provided).
 *
 * Returns:
 *   { ok: true,  message, audienceFn }  on success
 *   { ok: false, reason, category }     on failure
 *
 * The caller is responsible for delivering the message to `audienceFn(players)`.
 */
function sendMessage(speaker, channelId, text, opts = {}) {
  const ch = CHANNELS[channelId];
  if (!ch) return { ok: false, reason: `Unknown channel '${channelId}'.`, category: 'unknown' };
  if (!speaker) return { ok: false, reason: 'No speaker.', category: 'no-speaker' };
  ensureState(speaker);

  const ctx = opts.ctx || {};
  const sendCheck = canSend(channelId, speaker, ctx);
  if (!sendCheck.allowed) {
    return { ok: false, reason: sendCheck.reason, category: 'denied' };
  }

  const trimmed = String(text || '').trim();
  if (!trimmed) return { ok: false, reason: 'Empty message.', category: 'empty' };

  const filter = applyFilters(trimmed, channelId);
  if (!filter.allowed) {
    const autoMuted = registerFilteredMessage(speaker);
    return {
      ok: false,
      reason: filter.reasons.join(' '),
      category: autoMuted ? 'auto-muted' : 'filtered',
      filtered: true,
      autoMuted,
    };
  }
  // Successful send resets filter streak.
  resetFilteredStreak(speaker);

  const now = opts.now || Date.now();
  const rl = checkRateLimit(speaker, channelId, now);
  if (!rl.allowed) {
    return { ok: false, reason: rl.reason, category: 'rate-limited' };
  }
  recordSend(speaker, channelId, now);

  const message = {
    channel: channelId,
    tag: ch.tag,
    speakerId: speaker.id,
    speakerName: speaker.name || 'unknown',
    recipientId: opts.recipientId || (ctx.recipient && ctx.recipient.id) || null,
    text: trimmed,
    ts: now,
    type: ch.type,
    meta: opts.meta || {},
  };

  try { logWriter(channelId, message); } catch (e) { /* non-fatal */ }

  events.emit('chat_message', message);

  const audienceFn = (players) => audienceFor(channelId, speaker, message, players, ctx);
  return { ok: true, message, audienceFn };
}

function audienceFor(channelId, speaker, message, players, ctx = {}) {
  const ch = CHANNELS[channelId];
  if (!ch || !Array.isArray(players)) return [];
  const result = [];
  for (const p of players) {
    if (!p) continue;
    if (p.id === speaker.id) { result.push(p); continue; }
    // Ignore list: receiver has muted the speaker.
    ensureState(p);
    if (isIgnored(p, speaker.id)) continue;
    const read = canRead(channelId, p, Object.assign({}, ctx, { speaker, recipient: ctx.recipient || null }));
    if (read.allowed) result.push(p);
  }
  return result;
}

// ── Persistence helpers ────────────────────────────────────────────────────
function dumpFriends(playerList) {
  const out = {};
  for (const p of playerList || []) {
    if (!p) continue;
    ensureState(p);
    out[p.id] = { friends: p.friends.slice(), ignored: p.ignored.slice() };
  }
  return out;
}

function loadFriendsInto(player, table) {
  ensureState(player);
  if (!table) return;
  const entry = table[player.id];
  if (!entry) return;
  player.friends = Array.isArray(entry.friends) ? entry.friends.slice() : [];
  player.ignored = Array.isArray(entry.ignored) ? entry.ignored.slice() : [];
}

function dumpChannelSettings(playerList) {
  const out = {};
  for (const p of playerList || []) {
    if (!p) continue;
    ensureState(p);
    out[p.id] = { muted: mutedChannels(p).slice() };
  }
  return out;
}

function loadChannelSettingsInto(player, table) {
  ensureState(player);
  if (!table) return;
  const entry = table[player.id];
  if (!entry) return;
  player.mutedChannels = {};
  if (Array.isArray(entry.muted)) {
    for (const m of entry.muted) player.mutedChannels[m] = true;
  }
}

function listAccessibleChannels(player, ctx = {}) {
  ensureState(player);
  const out = [];
  for (const id of ALL_CHANNELS) {
    const r = canSend(id, player, ctx);
    out.push({
      id,
      name: CHANNELS[id].name,
      tag: CHANNELS[id].tag,
      canSend: r.allowed,
      muted: !!player.mutedChannels[id],
      reason: r.allowed ? null : r.reason,
    });
  }
  return out;
}

// ── Log reading (admin only unless "self" variant) ──────────────────────────
function readLog(channelId, date, viewer) {
  const ch = CHANNELS[channelId];
  if (!ch) return { ok: false, reason: 'Unknown channel.' };
  if (!isStaff(viewer)) return { ok: false, reason: 'Staff only.' };
  const d = date || new Date().toISOString().slice(0, 10);
  const file = path.join(CHAT_LOG_DIR, ch.logPath, `${d}.log`);
  if (!fs.existsSync(file)) return { ok: true, entries: [] };
  const lines = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean);
  const entries = lines.map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  return { ok: true, entries };
}

function readOwnLog(channelId, date, player) {
  const ch = CHANNELS[channelId];
  if (!ch) return { ok: false, reason: 'Unknown channel.' };
  const d = date || new Date().toISOString().slice(0, 10);
  const file = path.join(CHAT_LOG_DIR, ch.logPath, `${d}.log`);
  if (!fs.existsSync(file)) return { ok: true, entries: [] };
  const lines = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean);
  const entries = [];
  for (const l of lines) {
    try {
      const e = JSON.parse(l);
      if (e.speakerId === player.id || e.recipientId === player.id) entries.push(e);
    } catch { /* ignore */ }
  }
  return { ok: true, entries };
}

// ── Module exports ──────────────────────────────────────────────────────────
module.exports = {
  // constants
  CHANNELS,
  ALL_CHANNELS,
  PUBLIC_PROXIMITY_TILES,
  AUTO_MUTE_AFTER_FILTERED,
  AUTO_MUTE_SECONDS,
  DATA_DIR,
  get CHAT_LOG_DIR() { return CHAT_LOG_DIR; },
  FRIENDS_FILE,
  SETTINGS_FILE,
  get FILTER_FILE() { return FILTER_FILE; },
  setFilterFile,
  setChatLogDir,
  getFilterFile,
  getChatLogDir,

  // state
  ensureState,

  // access
  canRead,
  canSend,
  listAccessibleChannels,

  // rate + filters
  checkRateLimit,
  recordSend,
  applyFilters,
  containsProfanity,
  containsDisallowedLink,
  registerFilteredMessage,
  resetFilteredStreak,
  loadFilter,
  resetFilterCache,

  // logging
  setLogWriter,
  getLogWriter,
  readLog,
  readOwnLog,

  // send
  sendMessage,
  audienceFor,

  // friends/ignore/mute
  addFriend,
  removeFriend,
  ignore,
  unignore,
  isIgnored,
  isFriend,
  mute,
  unmute,
  mutedChannels,

  // persistence
  dumpFriends,
  loadFriendsInto,
  dumpChannelSettings,
  loadChannelSettingsInto,

  // test helpers
  _internal: { inSameClan, isStaff, inWilderness, isClanLeader, manhattanDistance, inSameGroupIronman },
};
