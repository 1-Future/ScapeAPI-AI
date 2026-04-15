// ══════════════════════════════════════════════════════════════════════════════
// Account Security — Password, 2FA (TOTP), Bank PIN, Recovery Email
//
// All secrets are stored as hashes (bcrypt) or base32 shared secrets (TOTP).
// Plaintext passwords / PINs / TOTP secrets NEVER touch the log stream.
//
// Player shape additions:
//
//   player.security = {
//     passwordHash:   string | null,
//     totpSecret:     string | null,    // base32 secret (shared w/ authenticator)
//     totpEnabled:    boolean,
//     totpMethod:     'totp',
//     bankPinHash:    string | null,    // bcrypt hash of 4-6 digit PIN
//     bankPinSetAt:   ms | null,
//     bankPinRemoveRequestedAt: ms | null,   // start of removal cooldown
//     recoveryEmail:  string | null,
//     recoveryEmailSetAt: ms | null,
//     failedLogins:   number,           // rolling count
//     failedPin:      number,           // rolling count
//     pinLocked:      boolean,          // auto-lock after N failures
//   }
//
// Session (in-memory, not persisted in secure form):
//
//   player.bankPinVerifiedAt: ms | null
//
// See `src/engine/account.js` for profile + privacy (separate concerns).
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const crypto = require('crypto');

let bcrypt;
try { bcrypt = require('bcrypt'); }
catch (_e) { bcrypt = null; /* fallback to scrypt */ }

const BCRYPT_ROUNDS  = 10;
const PIN_PATTERN    = /^[0-9]{4,6}$/;
const BANK_PIN_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
const PIN_REMOVE_DELAY_MS = 3 * 24 * 60 * 60 * 1000; // 3 days
const PIN_MAX_FAILURES = 5;
const MIN_PASSWORD_LEN = 8;
const TOTP_PERIOD = 30; // seconds
const TOTP_DIGITS = 6;

function now() { return Date.now(); }

function ensureSecurity(player) {
  if (!player || typeof player !== 'object') {
    throw new Error('security: player required');
  }
  if (!player.security || typeof player.security !== 'object') {
    player.security = {
      passwordHash: null,
      totpSecret: null,
      totpEnabled: false,
      totpMethod: 'totp',
      bankPinHash: null,
      bankPinSetAt: null,
      bankPinRemoveRequestedAt: null,
      recoveryEmail: null,
      recoveryEmailSetAt: null,
      failedLogins: 0,
      failedPin: 0,
      pinLocked: false,
    };
  }
  return player.security;
}

// ── Password hashing — bcrypt preferred, scrypt fallback ────────────────────

function _hash(value) {
  if (bcrypt) return bcrypt.hashSync(value, BCRYPT_ROUNDS);
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(value, salt, 64).toString('hex');
  return `scrypt$${salt}$${derived}`;
}

function _verify(value, hash) {
  if (!hash) return false;
  if (hash.startsWith('scrypt$')) {
    const [, salt, expected] = hash.split('$');
    if (!salt || !expected) return false;
    const got = crypto.scryptSync(value, salt, 64).toString('hex');
    const a = Buffer.from(got, 'hex');
    const b = Buffer.from(expected, 'hex');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  }
  if (bcrypt) return bcrypt.compareSync(value, hash);
  return false;
}

// ── Password ────────────────────────────────────────────────────────────────

function validatePasswordStrength(password) {
  if (typeof password !== 'string') return 'Password must be a string.';
  if (password.length < MIN_PASSWORD_LEN) return `Password must be at least ${MIN_PASSWORD_LEN} chars.`;
  if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter.';
  if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter.';
  if (!/[0-9]/.test(password)) return 'Password must contain a digit.';
  return null;
}

/**
 * setPassword(player, password)
 * Enforces strength. Never logs plaintext.
 */
function setPassword(player, password) {
  const s = ensureSecurity(player);
  const err = validatePasswordStrength(password);
  if (err) return { ok: false, reason: err };
  s.passwordHash = _hash(password);
  s.failedLogins = 0;
  return { ok: true };
}

function verifyPassword(player, password) {
  const s = ensureSecurity(player);
  if (!s.passwordHash) return { ok: false, reason: 'No password set.' };
  const ok = _verify(String(password || ''), s.passwordHash);
  if (!ok) { s.failedLogins = (s.failedLogins || 0) + 1; return { ok: false, reason: 'Wrong password.' }; }
  s.failedLogins = 0;
  return { ok: true };
}

function hasPassword(player) {
  const s = ensureSecurity(player);
  return !!s.passwordHash;
}

// ── TOTP (RFC 6238) ─────────────────────────────────────────────────────────

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function _base32Encode(buf) {
  let out = '';
  let bits = 0, value = 0;
  for (let i = 0; i < buf.length; i++) {
    value = (value << 8) | buf[i];
    bits += 8;
    while (bits >= 5) {
      out += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  return out;
}

function _base32Decode(str) {
  const s = String(str || '').replace(/=+$/, '').toUpperCase();
  const out = [];
  let bits = 0, value = 0;
  for (let i = 0; i < s.length; i++) {
    const idx = BASE32_ALPHABET.indexOf(s[i]);
    if (idx < 0) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

function _totpAt(secret, counter, digits = TOTP_DIGITS) {
  const key = _base32Decode(secret);
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const hmac = crypto.createHmac('sha1', key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binCode =
      ((hmac[offset]     & 0x7f) << 24)
    | ((hmac[offset + 1] & 0xff) << 16)
    | ((hmac[offset + 2] & 0xff) << 8)
    |  (hmac[offset + 3] & 0xff);
  const mod = Math.pow(10, digits);
  return String(binCode % mod).padStart(digits, '0');
}

function totpGenerate(secret, at = now()) {
  const counter = Math.floor((at / 1000) / TOTP_PERIOD);
  return _totpAt(secret, counter);
}

function totpVerify(secret, code, at = now(), window = 1) {
  if (!secret || !code) return false;
  const clean = String(code).replace(/\D/g, '');
  if (clean.length < TOTP_DIGITS) return false;
  const base = Math.floor((at / 1000) / TOTP_PERIOD);
  for (let w = -window; w <= window; w++) {
    const candidate = _totpAt(secret, base + w);
    if (candidate === clean) return true;
  }
  return false;
}

/**
 * enable2FA(player, method='totp') -> { ok, secret, qr }
 * Generates a fresh shared secret and returns it + a QR URI. Caller is
 * responsible for rendering the QR code. Secret is persisted on the player
 * under player.security.totpSecret. totpEnabled remains false until the
 * player confirms via verify2FA() with a valid code.
 */
function enable2FA(player, method = 'totp') {
  const s = ensureSecurity(player);
  if (method !== 'totp') return { ok: false, reason: `Unsupported 2FA method: ${method}` };
  const raw = crypto.randomBytes(20);
  const secret = _base32Encode(raw).replace(/=+$/, '');
  s.totpSecret = secret;
  s.totpEnabled = false;                        // user must verify first
  s.totpMethod = 'totp';
  const label = encodeURIComponent(`Scape:${player.name || player.id || 'player'}`);
  const issuer = encodeURIComponent('Scape');
  const qr = `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=${TOTP_DIGITS}&period=${TOTP_PERIOD}`;
  return { ok: true, secret, qr, method: 'totp' };
}

/**
 * verify2FA(player, code)
 * First successful verification also flips totpEnabled=true, locking in the
 * secret. Later calls are straight verification.
 */
function verify2FA(player, code) {
  const s = ensureSecurity(player);
  if (!s.totpSecret) return { ok: false, reason: '2FA not set up.' };
  const ok = totpVerify(s.totpSecret, code);
  if (!ok) return { ok: false, reason: 'Invalid or expired code.' };
  if (!s.totpEnabled) s.totpEnabled = true;
  return { ok: true };
}

function disable2FA(player) {
  const s = ensureSecurity(player);
  if (!s.totpSecret && !s.totpEnabled) return { ok: false, reason: '2FA not enabled.' };
  s.totpSecret = null;
  s.totpEnabled = false;
  return { ok: true };
}

function is2FAEnabled(player) {
  const s = ensureSecurity(player);
  return !!s.totpEnabled && !!s.totpSecret;
}

// ── Bank PIN ────────────────────────────────────────────────────────────────

/**
 * setBankPin(player, pin) -> { ok } | { ok:false, reason }
 * PIN must be 4-6 digits. Never logged.
 */
function setBankPin(player, pin) {
  const s = ensureSecurity(player);
  const clean = String(pin || '');
  if (!PIN_PATTERN.test(clean)) {
    return { ok: false, reason: 'Bank PIN must be 4-6 digits.' };
  }
  s.bankPinHash = _hash(clean);
  s.bankPinSetAt = now();
  s.bankPinRemoveRequestedAt = null;
  s.failedPin = 0;
  s.pinLocked = false;
  // New PIN resets verification.
  player.bankPinVerifiedAt = null;
  return { ok: true };
}

function hasBankPin(player) {
  const s = ensureSecurity(player);
  return !!s.bankPinHash;
}

/**
 * verifyBankPin(player, pin) -> { ok, verifiedAt? }
 * On success, stamps player.bankPinVerifiedAt = now().
 */
function verifyBankPin(player, pin) {
  const s = ensureSecurity(player);
  if (!s.bankPinHash) return { ok: false, reason: 'No bank PIN set.' };
  if (s.pinLocked) return { ok: false, reason: 'Bank PIN locked due to too many failed attempts.' };
  const clean = String(pin || '');
  if (!PIN_PATTERN.test(clean)) {
    return { ok: false, reason: 'PIN must be 4-6 digits.' };
  }
  const ok = _verify(clean, s.bankPinHash);
  if (!ok) {
    s.failedPin = (s.failedPin || 0) + 1;
    if (s.failedPin >= PIN_MAX_FAILURES) s.pinLocked = true;
    return { ok: false, reason: `Incorrect PIN. Attempts: ${s.failedPin}/${PIN_MAX_FAILURES}.` };
  }
  s.failedPin = 0;
  player.bankPinVerifiedAt = now();
  return { ok: true, verifiedAt: player.bankPinVerifiedAt };
}

/**
 * requestRemoveBankPin(player)
 * Starts the 3-day removal delay per spec.
 */
function requestRemoveBankPin(player) {
  const s = ensureSecurity(player);
  if (!s.bankPinHash) return { ok: false, reason: 'No PIN set.' };
  s.bankPinRemoveRequestedAt = now();
  return { ok: true, completesAt: s.bankPinRemoveRequestedAt + PIN_REMOVE_DELAY_MS };
}

function finalizeRemoveBankPin(player) {
  const s = ensureSecurity(player);
  if (!s.bankPinRemoveRequestedAt) return { ok: false, reason: 'No removal request.' };
  const elapsed = now() - s.bankPinRemoveRequestedAt;
  if (elapsed < PIN_REMOVE_DELAY_MS) {
    const wait = Math.ceil((PIN_REMOVE_DELAY_MS - elapsed) / (60 * 60 * 1000));
    return { ok: false, reason: `${wait} hour(s) remaining.` };
  }
  s.bankPinHash = null;
  s.bankPinSetAt = null;
  s.bankPinRemoveRequestedAt = null;
  s.failedPin = 0;
  s.pinLocked = false;
  player.bankPinVerifiedAt = null;
  return { ok: true };
}

/**
 * isBankPinVerified(player) — returns true only if PIN is set, not locked,
 * AND player.bankPinVerifiedAt is within the session timeout.
 * If the PIN is not set at all, returns true (no PIN == no gate).
 */
function isBankPinVerified(player) {
  const s = ensureSecurity(player);
  if (!s.bankPinHash) return true; // no PIN configured -> no gate
  if (s.pinLocked) return false;
  const v = player.bankPinVerifiedAt;
  if (!v) return false;
  return (now() - v) < BANK_PIN_TIMEOUT_MS;
}

function clearBankPinSession(player) {
  player.bankPinVerifiedAt = null;
}

/**
 * requireBankPinGate(player) -> { ok: true } or { ok: false, reason }
 * Call this immediately before deposit/withdraw/bank-open operations.
 */
function requireBankPinGate(player) {
  const s = ensureSecurity(player);
  if (!s.bankPinHash) return { ok: true, gated: false };
  if (s.pinLocked) return { ok: false, reason: 'Bank PIN is locked. Reset via recovery.' };
  if (!isBankPinVerified(player)) {
    return { ok: false, reason: 'Enter bank PIN: /security bankpin enter <pin>' };
  }
  return { ok: true, gated: true };
}

// ── Recovery email ──────────────────────────────────────────────────────────

function recoveryEmail(player, email) {
  const s = ensureSecurity(player);
  if (email === undefined || email === null) {
    return { ok: true, email: s.recoveryEmail };
  }
  const clean = String(email).trim();
  if (clean === '') {
    s.recoveryEmail = null;
    s.recoveryEmailSetAt = null;
    return { ok: true, email: null };
  }
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(clean)) return { ok: false, reason: 'Invalid email address.' };
  s.recoveryEmail = clean.toLowerCase();
  s.recoveryEmailSetAt = now();
  return { ok: true, email: s.recoveryEmail };
}

// ── Exports ─────────────────────────────────────────────────────────────────

module.exports = {
  // Password.
  setPassword, verifyPassword, hasPassword, validatePasswordStrength,
  // 2FA.
  enable2FA, verify2FA, disable2FA, is2FAEnabled,
  totpGenerate, totpVerify,
  // Bank PIN.
  setBankPin, verifyBankPin, hasBankPin, isBankPinVerified, clearBankPinSession,
  requestRemoveBankPin, finalizeRemoveBankPin, requireBankPinGate,
  // Recovery.
  recoveryEmail,
  // Util.
  ensureSecurity,
  // Constants.
  BANK_PIN_TIMEOUT_MS, PIN_REMOVE_DELAY_MS, MIN_PASSWORD_LEN,
  PIN_MAX_FAILURES, TOTP_PERIOD, TOTP_DIGITS,
};
