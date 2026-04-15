// ══════════════════════════════════════════════════════════════════════════════
// Accessibility Layer — Core
//
// Implements the spec in `build-your-own-scape/docs/accessibility.md`, boiled
// down to the six pillars that the current engine can actually honor:
//
//   1. Visual      — colorblind palettes (none/deuteranopia/protanopia/tritanopia),
//                    high contrast, text size (1.0..2.0), ARIA annotations.
//   2. Auditory    — TTS emit hook (every text WS message also gets an audio
//                    event so the client can speak it).
//   3. Motor       — key remapping (default WASD + Q/E movement actions).
//   4. Cognitive   — reduced motion (skip transitions in the spectator).
//   5. Comm.       — screen-reader annotations (alt_text on UI updates).
//   6. I18N        — getTranslatedText stub for future localization.
//
// Design rules (fixed by the task brief):
//   - Every preference defaults to "off" / "standard" — zero behavior change
//     unless the player explicitly opts in.
//   - Prefs are per-player and serialize through the existing persistence
//     layer (player.accessibility = { ... }).
//   - Colorblind filter is data-driven: we expose an ANSI palette PER MODE so
//     the xterm chat output (and eventually any text renderer) can remap 16
//     basic colors + a small accent set.
//   - TTS and screen-reader are opt-in hooks that emit extra WS events; they
//     do not mutate the original text message.
//   - This file is a pure CommonJS module. No DOM, no globals, no WS bindings
//     — those live in `accessibility-commands.js` and the HTML clients.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const events = require('./events');

// ── Defaults & schema ───────────────────────────────────────────────────────

const COLORBLIND_MODES = Object.freeze([
  'none',          // standard palette (no remap)
  'deuteranopia',  // red/green -> blue/orange
  'protanopia',    // similar to deuteranopia with slight variation
  'tritanopia',    // blue/yellow -> red/green
  'achromatopsia', // greyscale (bonus mode from spec)
]);

const TEXT_SIZE_MIN = 1.0;
const TEXT_SIZE_MAX = 2.0;

// Movement + action keybindings the engine understands. The *action ids* are
// stable; the keys are whatever the player rebinds. Default is WASD + Q/E
// (strafe-left / strafe-right) matching the first-tier motor-accessibility
// convention in the spec.
const DEFAULT_KEYMAP = Object.freeze({
  move_north:     'w',
  move_south:     's',
  move_west:      'a',
  move_east:      'd',
  rotate_left:    'q',
  rotate_right:   'e',
  interact:       ' ',        // space
  open_inventory: 'i',
  open_prayer:    'p',
  open_map:       'm',
  run_toggle:     'shift',
  cancel:         'escape',
});

// Every action id the remap command can bind. Canonical list; commands reject
// anything outside this set to keep client state simple.
const ACTIONS = Object.freeze(Object.keys(DEFAULT_KEYMAP));

function defaultPrefs() {
  return {
    colorblind:    'none',
    textSize:      1.0,
    highContrast:  false,
    reducedMotion: false,
    tts:           false,
    screenReader:  false,
    keyRemap:      Object.assign({}, DEFAULT_KEYMAP),
    locale:        'en',           // future i18n hook
    enabledAt:     null,           // tick; set on first setPrefs call
  };
}

// ── ANSI / CSS palettes (colorblind remap) ──────────────────────────────────
// Keys are semantic *roles*, not raw ANSI indices, so new roles can be added
// without breaking the base palette. The mapper maps a source color (either
// a role id or a 0–15 xterm code) to the target palette under the current
// mode. For xterm chat output we emit ANSI via xtermColor().

// Source/standard palette (what the engine emits by default):
const BASE_PALETTE = Object.freeze({
  // Status / chat roles — used by xterm chat renderer
  system:   '#0000aa',
  player:   '#000099',
  npc:      '#006600',
  error:    '#aa0000',
  success:  '#008000',
  warning:  '#aa6600',
  magic:    '#6600aa',
  ranged:   '#007755',
  gold:     '#ff981f',
  // Neutral
  bg:       '#c8b88a', // parchment
  fg:       '#000000',
  border:   '#3a352e', // stone-dark
});

// The four alternate palettes. We keep the *structure* identical to the base
// palette but remap red/green to blue/orange (deut./prot.) or blue/yellow to
// red/green (trit.) where it matters.
const PALETTES = Object.freeze({
  none:          BASE_PALETTE,
  deuteranopia: Object.freeze({
    system:   '#0040aa',
    player:   '#000099',
    npc:      '#0066aa',   // green -> blue
    error:    '#cc6600',   // red -> orange
    success:  '#0088dd',   // green -> blue
    warning:  '#bb5500',
    magic:    '#6600aa',
    ranged:   '#006688',
    gold:     '#ffaa00',
    bg:       '#d8cfa8',
    fg:       '#000000',
    border:   '#2a2420',
  }),
  protanopia: Object.freeze({
    system:   '#0050bb',
    player:   '#000099',
    npc:      '#0077bb',
    error:    '#dd7700',
    success:  '#0099ee',
    warning:  '#cc6611',
    magic:    '#7711bb',
    ranged:   '#007799',
    gold:     '#ffbb11',
    bg:       '#dacfa8',
    fg:       '#000000',
    border:   '#2a2420',
  }),
  tritanopia: Object.freeze({
    system:   '#aa3333',   // was blue -> red
    player:   '#990055',
    npc:      '#008833',
    error:    '#aa0000',
    success:  '#008855',
    warning:  '#cc3300',   // was blue/yellow -> red/green
    magic:    '#aa0033',
    ranged:   '#997755',
    gold:     '#aa3300',
    bg:       '#d0c090',
    fg:       '#000000',
    border:   '#3a352e',
  }),
  achromatopsia: Object.freeze({
    system:   '#333333',
    player:   '#222222',
    npc:      '#555555',
    error:    '#000000',
    success:  '#777777',
    warning:  '#444444',
    magic:    '#666666',
    ranged:   '#777777',
    gold:     '#aaaaaa',
    bg:       '#e8e8e8',
    fg:       '#000000',
    border:   '#555555',
  }),
});

// Approximate ANSI 4-bit palette by colorblind mode. xterm256 would be more
// faithful but we emit plain 30–37 / 90–97 here so any dumb terminal can
// handle the remap. These are the role-to-ANSI mappings; roles outside this
// table fall through to 39 (default fg).
const BASE_ANSI = Object.freeze({
  system: 34, player: 34, npc: 32, error: 31, success: 32,
  warning: 33, magic: 35, ranged: 36, gold: 93,
});

const ANSI_PALETTES = Object.freeze({
  none:          BASE_ANSI,
  // deut/prot: remap green (32) -> blue (34), red (31) -> yellow/orange (33)
  deuteranopia: Object.freeze({
    system: 34, player: 34, npc: 94, error: 33, success: 94,
    warning: 33, magic: 35, ranged: 36, gold: 93,
  }),
  protanopia: Object.freeze({
    system: 34, player: 34, npc: 94, error: 33, success: 94,
    warning: 33, magic: 35, ranged: 36, gold: 93,
  }),
  // trit: blue (34) -> red (31), yellow (93) -> magenta (35)
  tritanopia: Object.freeze({
    system: 31, player: 31, npc: 32, error: 31, success: 32,
    warning: 31, magic: 31, ranged: 35, gold: 91,
  }),
  achromatopsia: Object.freeze({
    system: 90, player: 90, npc: 37, error: 30, success: 37,
    warning: 90, magic: 37, ranged: 37, gold: 97,
  }),
});

// ── Prefs accessors ─────────────────────────────────────────────────────────

let getTick = () => 0;
function setTickSource(fn) { if (typeof fn === 'function') getTick = fn; }

/**
 * getPrefs(player)
 * Returns the player's accessibility prefs, filled in from defaults for any
 * missing keys. Never throws; a missing player returns a frozen default bundle
 * so callers can always do prefs.colorblind without a guard.
 */
function getPrefs(player) {
  if (!player || typeof player !== 'object') return defaultPrefs();
  if (!player.accessibility) player.accessibility = defaultPrefs();
  const base = defaultPrefs();
  const live = player.accessibility;
  // Shallow merge; keyRemap merged deeply.
  const merged = Object.assign({}, base, live);
  merged.keyRemap = Object.assign({}, DEFAULT_KEYMAP, (live && live.keyRemap) || {});
  return merged;
}

/**
 * setPrefs(player, patch)
 * Mutates player.accessibility with the given patch. Returns { ok, reason,
 * prefs } — ok=false on invalid values. Unknown keys are rejected so typos
 * do not silently accumulate. An empty patch is a no-op but still returns
 * the current prefs for client sync.
 */
function setPrefs(player, patch) {
  if (!player || typeof player !== 'object') {
    return { ok: false, reason: 'No player.', prefs: defaultPrefs() };
  }
  if (!patch || typeof patch !== 'object') {
    return { ok: false, reason: 'Patch must be an object.', prefs: getPrefs(player) };
  }

  if (!player.accessibility) player.accessibility = defaultPrefs();
  const current = player.accessibility;

  // Validate every key first; fail atomically.
  for (const k of Object.keys(patch)) {
    const err = _validateField(k, patch[k]);
    if (err) return { ok: false, reason: err, prefs: getPrefs(player) };
  }

  // Apply.
  for (const k of Object.keys(patch)) {
    if (k === 'keyRemap') {
      current.keyRemap = Object.assign(
        {}, DEFAULT_KEYMAP, current.keyRemap || {}, patch.keyRemap);
    } else {
      current[k] = patch[k];
    }
  }
  if (!current.enabledAt) current.enabledAt = getTick();

  events.emit('accessibility:prefs_changed', {
    type: 'accessibility:prefs_changed',
    playerId: player.id,
    patch,
    prefs: getPrefs(player),
    tick: getTick(),
  });
  return { ok: true, reason: 'Applied.', prefs: getPrefs(player) };
}

function _validateField(key, value) {
  switch (key) {
    case 'colorblind':
      return COLORBLIND_MODES.indexOf(value) >= 0
        ? null
        : `colorblind must be one of ${COLORBLIND_MODES.join(', ')}`;
    case 'textSize':
      if (typeof value !== 'number' || !isFinite(value))
        return 'textSize must be a number';
      if (value < TEXT_SIZE_MIN || value > TEXT_SIZE_MAX)
        return `textSize must be in [${TEXT_SIZE_MIN}, ${TEXT_SIZE_MAX}]`;
      return null;
    case 'highContrast':
    case 'reducedMotion':
    case 'tts':
    case 'screenReader':
      return typeof value === 'boolean' ? null : `${key} must be a boolean`;
    case 'locale':
      return (typeof value === 'string' && value.length <= 16)
        ? null : 'locale must be a short string';
    case 'enabledAt':
      return (value === null || typeof value === 'number')
        ? null : 'enabledAt must be a number or null';
    case 'keyRemap':
      if (!value || typeof value !== 'object' || Array.isArray(value))
        return 'keyRemap must be an object';
      for (const action of Object.keys(value)) {
        if (ACTIONS.indexOf(action) < 0)
          return `keyRemap: unknown action "${action}"`;
        const k = value[action];
        if (typeof k !== 'string' || k.length === 0 || k.length > 16)
          return `keyRemap: invalid key for "${action}"`;
      }
      return null;
    default:
      return `Unknown preference: ${key}`;
  }
}

/**
 * resetPrefs(player) -> prefs
 * Restore defaults while preserving the enabledAt timestamp so persistence
 * knows the player has interacted with the panel at some point.
 */
function resetPrefs(player) {
  if (!player || typeof player !== 'object') return defaultPrefs();
  const prev = player.accessibility || {};
  player.accessibility = defaultPrefs();
  player.accessibility.enabledAt = prev.enabledAt || getTick();
  events.emit('accessibility:prefs_changed', {
    type: 'accessibility:prefs_changed',
    playerId: player.id,
    patch: 'reset',
    prefs: getPrefs(player),
    tick: getTick(),
  });
  return getPrefs(player);
}

// ── i18n hook ───────────────────────────────────────────────────────────────
// Future: look up `key` in a per-locale dictionary. For now, every locale is
// English and we simply pass through, but we expose the signature so call
// sites can be threaded now and the dictionary wired later.
const I18N_STUB = {
  en: {
    'accessibility.reset':    'Accessibility settings restored to defaults.',
    'accessibility.applied':  'Accessibility preference applied.',
    'accessibility.invalid':  'Invalid accessibility value.',
  },
};

function getTranslatedText(player, key, fallback) {
  const locale = (getPrefs(player).locale || 'en');
  const dict = I18N_STUB[locale] || I18N_STUB.en;
  if (dict && Object.prototype.hasOwnProperty.call(dict, key)) return dict[key];
  if (typeof fallback === 'string') return fallback;
  return key;
}

// ── Colorblind mapping helpers ──────────────────────────────────────────────

/**
 * cssPalette(mode) -> object
 * Returns the palette object for the given mode; falls back to BASE_PALETTE
 * for unknown modes. Useful for driving CSS custom properties from the client.
 */
function cssPalette(mode) {
  return PALETTES[mode] || BASE_PALETTE;
}

/**
 * ansiFor(role, mode)
 * Returns the ANSI 4-bit foreground code for the role under the given
 * colorblind mode. Falls back to 39 (default fg) for unknown roles.
 */
function ansiFor(role, mode) {
  const table = ANSI_PALETTES[mode] || BASE_ANSI;
  return table[role] || 39;
}

/**
 * ansiWrap(text, role, mode)
 * Produce an ANSI-escaped string that any xterm (or xterm.js) will render
 * with the colorblind-safe color for that role. If mode is 'none' the text
 * passes through with a reset sequence.
 */
function ansiWrap(text, role, mode) {
  const code = ansiFor(role, mode);
  return '\x1b[' + code + 'm' + text + '\x1b[39m';
}

// ── WS / chat hooks (TTS + screen reader) ───────────────────────────────────
//
// The hook pattern: client.on('message', msg => { ...engine calls... })
// In the server the engine already emits WS messages of the shape
//   { type: 'text' | 'chat' | 'system', text: '...' }
// When the player has tts or screenReader on we fan out a sibling WS message:
//   { type: 'audio', text, role: 'tts' }
//   { type: 'aria',  text, role: 'announce' }
//
// The actual socket.send happens in server.js. This module gives the server a
// pure function (decorateOutgoing) that takes an outgoing frame + prefs and
// returns *every* frame that should be sent (original + accessibility sibs).
//
// No network IO here — tests can stub the send sink.

/**
 * decorateOutgoing(frame, prefs) -> [frame, ...]
 * The original frame is always first in the returned array. Accessibility
 * sibling frames, if any, follow. If prefs.tts is on and the frame carries
 * a `text` field, an audio frame is appended. If prefs.screenReader is on,
 * an aria frame is appended (possibly with alt_text for non-text UI updates).
 */
function decorateOutgoing(frame, prefs) {
  if (!frame || typeof frame !== 'object') return [frame];
  const out = [frame];
  const hasText = typeof frame.text === 'string' && frame.text.length > 0;
  const hasAlt  = typeof frame.alt_text === 'string' && frame.alt_text.length > 0;
  const p = prefs || defaultPrefs();

  // TTS: only for text-bearing frames.
  if (p.tts && hasText && _frameCarriesTextRole(frame)) {
    out.push({
      type: 'audio',
      role: 'tts',
      text: frame.text,
      source: frame.type,
      ts: frame.ts || Date.now(),
    });
  }

  // Screen reader: always announce something if we have text OR explicit
  // alt_text (for UI updates like "your HP dropped to 7").
  if (p.screenReader && (hasText || hasAlt)) {
    out.push({
      type: 'aria',
      role: 'announce',
      text: hasAlt ? frame.alt_text : frame.text,
      source: frame.type,
      ts: frame.ts || Date.now(),
    });
  }

  return out;
}

function _frameCarriesTextRole(frame) {
  // Heuristic: speak chat, system, dialogue, narrator, notification. Skip map
  // deltas and HUD frames — those are too noisy for TTS.
  const t = frame.type;
  return (
    t === 'text' || t === 'chat' || t === 'system' ||
    t === 'dialogue' || t === 'narrator' || t === 'notification'
  );
}

// ── Preview text for the /accessibility preview command ─────────────────────
// Short human-readable descriptions of each pref so players can understand
// what the setting will change BEFORE they flip it.

const PREVIEW = Object.freeze({
  colorblind: [
    'Colorblind palette. Options:',
    '  none           — default Scape colors.',
    '  deuteranopia   — red/green become blue/orange (red-green colorblind).',
    '  protanopia     — similar to deuteranopia with a slight variation.',
    '  tritanopia     — blue/yellow become red/green (blue-yellow colorblind).',
    '  achromatopsia  — full greyscale (total colorblindness).',
  ].join('\n'),
  textSize:
    'Text size multiplier applied to play and spectator HTML (1.0..2.0). ' +
    'Scales every font via CSS.',
  highContrast:
    'Swap the parchment/stone theme for a high-contrast black/white/yellow theme.',
  reducedMotion:
    'Skip animations and transitions in the spectator (instant position updates).',
  tts:
    'Every chat / dialogue / narrator message is mirrored as an audio event the ' +
    'client speaks via the Web Speech API.',
  screenReader:
    'Every UI update emits an ARIA-friendly "announce" event so screen readers ' +
    'can read the alt_text.',
  keyRemap:
    'Rebind movement / action keys. Default is WASD + Q/E + space/interact. ' +
    'Use `/accessibility keymap <action> <key>` to change one.',
});

function previewAll() {
  const out = [];
  for (const k of Object.keys(PREVIEW)) {
    out.push('— ' + k + ' —');
    out.push(PREVIEW[k]);
    out.push('');
  }
  return out.join('\n').trimEnd();
}

// ── Summary (for /accessibility prefs) ──────────────────────────────────────

function summarize(player) {
  const p = getPrefs(player);
  const lines = [
    `Colorblind:    ${p.colorblind}`,
    `Text size:     ${p.textSize.toFixed(2)}x`,
    `High contrast: ${p.highContrast ? 'on' : 'off'}`,
    `Reduced motion:${p.reducedMotion ? 'on' : 'off'}`,
    `Text to speech:${p.tts ? 'on' : 'off'}`,
    `Screen reader: ${p.screenReader ? 'on' : 'off'}`,
    `Locale:        ${p.locale}`,
    'Key remap:',
  ];
  for (const a of ACTIONS) {
    const key = (p.keyRemap && p.keyRemap[a]) || DEFAULT_KEYMAP[a];
    const def = DEFAULT_KEYMAP[a];
    const marker = key !== def ? ' (custom)' : '';
    lines.push(`  ${a.padEnd(15)} -> ${key}${marker}`);
  }
  return lines.join('\n');
}

// ── Persistence helpers ─────────────────────────────────────────────────────
// Accessibility prefs are stored IN the player object, so they get written
// out automatically by whatever saves player state. We also expose a helper
// for tooling that wants to roundtrip just the prefs subset.

function toJSON(player) {
  const p = getPrefs(player);
  return {
    colorblind:    p.colorblind,
    textSize:      p.textSize,
    highContrast:  p.highContrast,
    reducedMotion: p.reducedMotion,
    tts:           p.tts,
    screenReader:  p.screenReader,
    locale:        p.locale,
    enabledAt:     p.enabledAt,
    keyRemap:      Object.assign({}, p.keyRemap),
  };
}

function fromJSON(player, obj) {
  if (!player || !obj || typeof obj !== 'object') return getPrefs(player);
  const patch = {};
  for (const k of ['colorblind', 'textSize', 'highContrast', 'reducedMotion',
                    'tts', 'screenReader', 'locale']) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) patch[k] = obj[k];
  }
  if (obj.keyRemap && typeof obj.keyRemap === 'object') patch.keyRemap = obj.keyRemap;
  const res = setPrefs(player, patch);
  // If validation rejected something we still return *whatever did apply*;
  // the caller sees ok=false.
  return res.prefs;
}

// ── Exports ─────────────────────────────────────────────────────────────────

module.exports = {
  // Core API (task spec).
  getPrefs,
  setPrefs,
  resetPrefs,
  getTranslatedText,

  // Palettes & ANSI.
  cssPalette,
  ansiFor,
  ansiWrap,
  PALETTES,
  ANSI_PALETTES,
  BASE_PALETTE,

  // WS hooks.
  decorateOutgoing,

  // Keymap.
  DEFAULT_KEYMAP,
  ACTIONS,

  // Summary / preview.
  summarize,
  previewAll,
  PREVIEW,

  // Persistence.
  toJSON,
  fromJSON,

  // Wiring.
  setTickSource,

  // Constants.
  COLORBLIND_MODES,
  TEXT_SIZE_MIN,
  TEXT_SIZE_MAX,
  defaultPrefs,
};
