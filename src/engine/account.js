// ══════════════════════════════════════════════════════════════════════════════
// Account — Profile, Identity, Privacy
//
// Profile shape stored on the player object under `player.account`:
//
//   player.account = {
//     bio:          string (max 200 chars),
//     title:        string | null (display title),
//     titles:       [string, ...] (earned titles available to display),
//     avatar:       string | null (avatar id/url),
//     onlineStatus: 'online' | 'away' | 'invisible' | 'dnd',
//     visibility:   'public' | 'friends' | 'private',
//     createdAt:    ms epoch,
//     bondsActive:  number (bond months remaining, 0 = no bond),
//     nameHistory:  [{ name, changedAt }, ...],
//     nameChangedAt: ms epoch | null,
//     privacy: {
//       stats_visible_to:     'everyone' | 'friends' | 'clan' | 'nobody',
//       equipment_visible_to: '...',
//       bank_visible_to:      '...',
//       online_visible_to:    '...',
//       location_visible_to:  '...',
//       trade_from:           '...',
//       follow_from:          '...',
//       pm_from:              'everyone' | 'friends' | 'nobody',
//       groupinvite_from:     '...',
//       claninvite_from:      'everyone' | 'friends' | 'nobody',
//       friends_can_see_online: boolean,
//       clan_can_see_location:  boolean,
//       appear_on_hiscores:     boolean,
//       public_clan_listing:    boolean,
//       block_random_invites:   boolean,
//     },
//     loginHistory: [{ ts, ip, device, result }, ...] (cap 50),
//   }
//
// All setters are SOFT — on invalid input they return { ok: false, reason }.
// The profile block is created lazily on first access.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const MAX_BIO_LEN        = 200;
const MAX_NAME_HISTORY   = 10;
const MAX_LOGIN_HISTORY  = 50;
const NAME_CHANGE_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const ONLINE_STATUSES   = ['online', 'away', 'invisible', 'dnd'];
const VISIBILITY_LEVELS = ['public', 'friends', 'private'];

const VISIBLE_TO_OPTS   = ['everyone', 'friends', 'clan', 'nobody'];
const INTERACT_FROM_OPTS = ['everyone', 'friends', 'clan', 'nobody'];
const MSG_FROM_OPTS     = ['everyone', 'friends', 'nobody'];

const DEFAULT_PRIVACY = Object.freeze({
  stats_visible_to:       'everyone',
  equipment_visible_to:   'everyone',
  bank_visible_to:        'nobody',
  online_visible_to:      'friends',
  location_visible_to:    'clan',
  trade_from:             'everyone',
  follow_from:            'everyone',
  pm_from:                'friends',
  groupinvite_from:       'friends',
  claninvite_from:        'friends',
  friends_can_see_online: true,
  clan_can_see_location:  true,
  appear_on_hiscores:     true,
  public_clan_listing:    true,
  block_random_invites:   false,
});

const BANNED_NAME_FRAGMENTS = ['admin', 'mod_', 'staff', 'official', 'scape_staff'];
const NAME_PATTERN = /^[A-Za-z0-9_\- ]{1,16}$/;

function now() { return Date.now(); }

function ensureAccount(player) {
  if (!player || typeof player !== 'object') {
    throw new Error('account: player required');
  }
  if (!player.account || typeof player.account !== 'object') {
    player.account = {
      bio: '',
      title: null,
      titles: [],
      avatar: null,
      onlineStatus: 'online',
      visibility: 'public',
      createdAt: now(),
      bondsActive: 0,
      nameHistory: [],
      nameChangedAt: null,
      privacy: Object.assign({}, DEFAULT_PRIVACY),
      loginHistory: [],
    };
  }
  // Back-fill missing fields so older saves don't crash.
  const a = player.account;
  if (a.bio == null) a.bio = '';
  if (!Array.isArray(a.titles)) a.titles = [];
  if (!Array.isArray(a.nameHistory)) a.nameHistory = [];
  if (!Array.isArray(a.loginHistory)) a.loginHistory = [];
  if (!a.privacy || typeof a.privacy !== 'object') a.privacy = Object.assign({}, DEFAULT_PRIVACY);
  // Back-fill any new privacy keys.
  for (const k of Object.keys(DEFAULT_PRIVACY)) {
    if (!(k in a.privacy)) a.privacy[k] = DEFAULT_PRIVACY[k];
  }
  if (!a.createdAt) a.createdAt = now();
  if (!a.onlineStatus) a.onlineStatus = 'online';
  if (!a.visibility) a.visibility = 'public';
  return a;
}

// ── Profile ─────────────────────────────────────────────────────────────────

/**
 * getProfile(player) -> { id, name, createdAt, totalLevel, modes: [...], bondsActive, titles }
 * Public view of a player's profile. Reads computed values when possible.
 */
function getProfile(player) {
  if (!player) return null;
  ensureAccount(player);
  const a = player.account;

  // totalLevel — try the player module if available, else sum skills.
  let total = 0;
  try {
    const playerLib = require('../player/player');
    if (typeof playerLib.totalLevel === 'function') total = playerLib.totalLevel(player);
  } catch (_) { /* fall through */ }
  if (!total && player.skills) {
    for (const k of Object.keys(player.skills)) {
      total += (player.skills[k] && player.skills[k].level) || 0;
    }
  }

  // modes — reflect ironman variant and/or any future modes.
  const modes = [];
  if (player.ironman && player.ironman.variant) modes.push(player.ironman.variant);
  else if (player.accountMode) modes.push(player.accountMode);
  else modes.push('normal');

  return {
    id:           player.id,
    name:         player.name,
    createdAt:    a.createdAt,
    totalLevel:   total,
    modes:        modes.slice(),
    bondsActive:  a.bondsActive || 0,
    titles:       a.titles.slice(),
    title:        a.title || null,
    bio:          a.bio,
    avatar:       a.avatar,
    onlineStatus: a.onlineStatus,
    visibility:   a.visibility,
    nameHistory:  a.nameHistory.slice(),
  };
}

/**
 * updateProfile(player, patch)
 * Patch supports: { bio, title, avatar, onlineStatus, visibility, displayName }
 * Unknown or invalid keys are ignored / rejected with { ok:false, reason }.
 */
function updateProfile(player, patch) {
  if (!player) return { ok: false, reason: 'No player.' };
  const a = ensureAccount(player);
  if (!patch || typeof patch !== 'object') return { ok: false, reason: 'No patch.' };
  const errors = [];
  const applied = {};

  if ('bio' in patch) {
    const bio = String(patch.bio || '');
    if (bio.length > MAX_BIO_LEN) {
      errors.push(`bio too long (max ${MAX_BIO_LEN})`);
    } else {
      a.bio = bio;
      applied.bio = bio;
    }
  }
  if ('title' in patch) {
    const t = patch.title;
    if (t == null || t === '') {
      a.title = null;
      applied.title = null;
    } else if (typeof t !== 'string') {
      errors.push('title must be a string');
    } else if (a.titles.length > 0 && a.titles.indexOf(t) < 0) {
      errors.push(`title "${t}" is not unlocked`);
    } else {
      a.title = t;
      applied.title = t;
    }
  }
  if ('avatar' in patch) {
    const av = patch.avatar;
    if (av != null && typeof av !== 'string') {
      errors.push('avatar must be a string');
    } else {
      a.avatar = av || null;
      applied.avatar = a.avatar;
    }
  }
  if ('onlineStatus' in patch) {
    const s = String(patch.onlineStatus || '').toLowerCase();
    if (!ONLINE_STATUSES.includes(s)) {
      errors.push(`onlineStatus must be one of ${ONLINE_STATUSES.join(', ')}`);
    } else {
      a.onlineStatus = s;
      applied.onlineStatus = s;
    }
  }
  if ('visibility' in patch) {
    const v = String(patch.visibility || '').toLowerCase();
    if (!VISIBILITY_LEVELS.includes(v)) {
      errors.push(`visibility must be one of ${VISIBILITY_LEVELS.join(', ')}`);
    } else {
      a.visibility = v;
      applied.visibility = v;
    }
  }
  if ('displayName' in patch) {
    const res = changeDisplayName(player, patch.displayName);
    if (!res.ok) errors.push(res.reason);
    else applied.displayName = res.newName;
  }

  if (errors.length) return { ok: false, reason: errors.join('; '), applied };
  return { ok: true, applied };
}

/**
 * changeDisplayName(player, newName) — honours cooldown + filter + history.
 */
function changeDisplayName(player, newName) {
  if (!player) return { ok: false, reason: 'No player.' };
  const a = ensureAccount(player);
  const n = String(newName || '').trim();
  if (!n) return { ok: false, reason: 'Name required.' };
  if (!NAME_PATTERN.test(n)) {
    return { ok: false, reason: 'Name must be 1-16 chars: letters, digits, space, underscore, dash.' };
  }
  const lower = n.toLowerCase();
  for (const bad of BANNED_NAME_FRAGMENTS) {
    if (lower.includes(bad)) return { ok: false, reason: `Name contains forbidden fragment "${bad}".` };
  }
  if (a.nameChangedAt && (now() - a.nameChangedAt) < NAME_CHANGE_COOLDOWN_MS) {
    const wait = Math.ceil((NAME_CHANGE_COOLDOWN_MS - (now() - a.nameChangedAt)) / (24 * 60 * 60 * 1000));
    return { ok: false, reason: `Name change on cooldown: ${wait} day(s) remaining.` };
  }

  const old = player.name;
  player.name = n;
  a.nameHistory.unshift({ name: old, changedAt: now() });
  if (a.nameHistory.length > MAX_NAME_HISTORY) a.nameHistory.length = MAX_NAME_HISTORY;
  a.nameChangedAt = now();
  return { ok: true, newName: n, oldName: old };
}

// ── Titles ──────────────────────────────────────────────────────────────────

function grantTitle(player, title) {
  if (!player || typeof title !== 'string' || !title.trim()) {
    return { ok: false, reason: 'Invalid title.' };
  }
  const a = ensureAccount(player);
  if (a.titles.indexOf(title) >= 0) return { ok: false, reason: 'Already granted.' };
  a.titles.push(title);
  return { ok: true, title };
}

function revokeTitle(player, title) {
  if (!player) return { ok: false, reason: 'No player.' };
  const a = ensureAccount(player);
  const idx = a.titles.indexOf(title);
  if (idx < 0) return { ok: false, reason: 'Title not held.' };
  a.titles.splice(idx, 1);
  if (a.title === title) a.title = null;
  return { ok: true, title };
}

// ── Privacy ─────────────────────────────────────────────────────────────────

const PRIVACY_KEY_VALIDATORS = {
  stats_visible_to:       VISIBLE_TO_OPTS,
  equipment_visible_to:   VISIBLE_TO_OPTS,
  bank_visible_to:        VISIBLE_TO_OPTS,
  online_visible_to:      VISIBLE_TO_OPTS,
  location_visible_to:    VISIBLE_TO_OPTS,
  trade_from:             INTERACT_FROM_OPTS,
  follow_from:            INTERACT_FROM_OPTS,
  pm_from:                MSG_FROM_OPTS,
  groupinvite_from:       INTERACT_FROM_OPTS,
  claninvite_from:        MSG_FROM_OPTS,
  // booleans
  friends_can_see_online: 'boolean',
  clan_can_see_location:  'boolean',
  appear_on_hiscores:     'boolean',
  public_clan_listing:    'boolean',
  block_random_invites:   'boolean',
};

function setPrivacy(player, patch) {
  if (!player) return { ok: false, reason: 'No player.' };
  const a = ensureAccount(player);
  if (!patch || typeof patch !== 'object') return { ok: false, reason: 'No patch.' };
  const applied = {};
  const errors = [];
  for (const k of Object.keys(patch)) {
    const val = patch[k];
    const spec = PRIVACY_KEY_VALIDATORS[k];
    if (!spec) { errors.push(`unknown privacy key: ${k}`); continue; }
    if (spec === 'boolean') {
      if (typeof val !== 'boolean') { errors.push(`${k} must be boolean`); continue; }
      a.privacy[k] = val;
      applied[k] = val;
    } else if (Array.isArray(spec)) {
      const v = String(val || '').toLowerCase();
      if (!spec.includes(v)) { errors.push(`${k} must be one of ${spec.join(', ')}`); continue; }
      a.privacy[k] = v;
      applied[k] = v;
    }
  }
  if (errors.length && !Object.keys(applied).length) {
    return { ok: false, reason: errors.join('; ') };
  }
  return { ok: true, applied, warnings: errors };
}

function getPrivacy(player) {
  const a = ensureAccount(player);
  return Object.assign({}, a.privacy);
}

/**
 * canSee(viewer, subject, key)
 * key is a VISIBLE_TO_OPTS-keyed privacy field like 'stats_visible_to'.
 * Returns boolean. Checks friendship / clan / self.
 */
function canSee(viewer, subject, key) {
  if (!subject) return false;
  if (viewer && viewer.id === subject.id) return true;
  const a = ensureAccount(subject);
  const level = a.privacy[key];
  switch (level) {
    case 'everyone': return true;
    case 'nobody':   return false;
    case 'friends':  return !!(viewer && Array.isArray(subject.friends) && subject.friends.includes(viewer.id));
    case 'clan':     return !!(viewer && subject.clan && viewer.clan === subject.clan);
    default: return level == null ? true : false;
  }
}

// ── Login history ───────────────────────────────────────────────────────────

function recordLogin(player, info) {
  const a = ensureAccount(player);
  const entry = {
    ts: now(),
    ip: (info && info.ip) || null,
    device: (info && info.device) || null,
    result: (info && info.result) || 'ok',
  };
  a.loginHistory.unshift(entry);
  if (a.loginHistory.length > MAX_LOGIN_HISTORY) a.loginHistory.length = MAX_LOGIN_HISTORY;
  return entry;
}

function getLoginHistory(player, limit = 10) {
  const a = ensureAccount(player);
  return a.loginHistory.slice(0, Math.max(1, limit | 0));
}

// ── Exports ─────────────────────────────────────────────────────────────────

module.exports = {
  // Profile.
  getProfile, updateProfile, changeDisplayName, ensureAccount,
  // Titles.
  grantTitle, revokeTitle,
  // Privacy.
  setPrivacy, getPrivacy, canSee,
  // Login history.
  recordLogin, getLoginHistory,
  // Constants.
  ONLINE_STATUSES, VISIBILITY_LEVELS, VISIBLE_TO_OPTS, INTERACT_FROM_OPTS, MSG_FROM_OPTS,
  DEFAULT_PRIVACY, MAX_BIO_LEN, NAME_CHANGE_COOLDOWN_MS,
};
