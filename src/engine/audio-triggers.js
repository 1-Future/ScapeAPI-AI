// ══════════════════════════════════════════════════════════════════════════════
// Audio Trigger Dispatcher — maps game events to audio-manifest IDs and emits
// WebSocket messages that the client will consume when audio is wired.
//
// This does NOT play audio. Pre-audio-engine: it stages the routing so that
// when the client-side audio engine lands, it can subscribe to `audio` events
// via server.js and play clips by id + layer.
//
// How it wires in (self-registering, like narrator):
//   - On require('./audio-triggers'), the module:
//     1. Loads data/audio-manifest.json (tolerantly — logs and disables if missing)
//     2. Builds a reverse index:   trigger -> [ { id, layer } ]
//     3. Calls breakpoint-runner.subscribe(...) to listen for breakpoint events
//        and translate them to minor/major/transformative SFX triggers
//   - server.js does NOT need to import this directly. require() once at boot
//     to activate the side effects. (Recommended: require at the same place
//     narrator is initialized.)
//
// Registering a WebSocket forwarder:
//   - server.js (the only module that knows about sockets) should call
//     audioTriggers.registerForwarder(forwardFn) once at boot with a function
//     (playerIdOrSocket, message) => void that sends to the client.
//   - Then any code in the engine can call
//     audioTriggers.emitEvent(playerSocket, eventType, context) and the
//     dispatcher will look up the manifest ids and push them to the forwarder.
//
// Event message shape going to client:
//   { type: 'audio', id: 'level_up_transformative', layer: 'sfx', context: {...} }
//
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const fs = require('fs');
const path = require('path');

const MANIFEST_FILE = path.join(__dirname, '..', '..', 'data', 'audio-manifest.json');

// ── Manifest load (tolerant) ─────────────────────────────────────────────────

let manifest = null;
let manifestError = null;
let triggerIndex = new Map();   // trigger -> [ { id, layer } ]
let knownEvents = new Set();    // from conventions.known_events

function loadManifest() {
  try {
    const raw = fs.readFileSync(MANIFEST_FILE, 'utf8');
    manifest = JSON.parse(raw);
    buildIndex();
    return true;
  } catch (e) {
    manifest = null;
    manifestError = `audio-manifest load failed: ${e.message}`;
    console.warn(`[audio-triggers] ${manifestError}. Dispatcher will no-op until manifest is present.`);
    return false;
  }
}

function buildIndex() {
  triggerIndex = new Map();
  knownEvents = new Set((manifest.conventions && manifest.conventions.known_events) || []);

  const addEntry = (trigger, id, layer) => {
    if (!trigger) return;
    if (!triggerIndex.has(trigger)) triggerIndex.set(trigger, []);
    triggerIndex.get(trigger).push({ id, layer });
  };

  for (const m of manifest.music || []) {
    if (m.trigger) addEntry(m.trigger, m.id, 'music');
  }
  for (const s of manifest.sfx || []) {
    addEntry(s.trigger, s.id, 'sfx');
  }
  for (const v of manifest.vocal_stings || []) {
    addEntry(v.trigger, v.id, 'vocal');
  }
  // Ambient loops are region/time driven on the client, not direct triggers,
  // but we still expose them via helper lookups.
}

// ── Handler registry (allows runtime extension by other subsystems) ─────────
// registerHandler('combat_hit_slash_light', ['my-custom-hit-sfx-id']) will
// attach an override that plays alongside (or instead of) the manifest entry.

const handlerOverrides = new Map(); // event -> [audioIds...]

function registerHandler(eventType, audioIds) {
  if (!Array.isArray(audioIds)) audioIds = [audioIds];
  if (!handlerOverrides.has(eventType)) handlerOverrides.set(eventType, []);
  const list = handlerOverrides.get(eventType);
  for (const id of audioIds) if (!list.includes(id)) list.push(id);
}

// ── Forwarder wire-up (server owns this) ─────────────────────────────────────

let forwarder = null;  // (target, msg) => void

function registerForwarder(fn) {
  forwarder = typeof fn === 'function' ? fn : null;
}

// ── Public: emit an audio event for a player ────────────────────────────────
// `target` can be anything the forwarder understands (usually a WebSocket or
// a player id). When no forwarder is registered, emits are silently dropped,
// which is intentional pre-audio-engine.

function emitEvent(target, eventType, context) {
  if (!manifest) return;           // manifest failed to load → no-op
  if (!forwarder) return;          // no socket wiring yet → no-op
  const ctx = context || {};
  const entries = triggerIndex.get(eventType) || [];
  const extras = handlerOverrides.get(eventType) || [];
  for (const e of entries) {
    safeForward(target, { type: 'audio', id: e.id, layer: e.layer, context: ctx });
  }
  for (const id of extras) {
    // Extras are ids without layer context; default to 'sfx'.
    safeForward(target, { type: 'audio', id, layer: 'sfx', context: ctx });
  }
}

function safeForward(target, msg) {
  try {
    forwarder(target, msg);
  } catch (e) {
    console.error('[audio-triggers] forwarder threw:', e.message);
  }
}

// ── Breakpoint → audio routing ───────────────────────────────────────────────
// Subscribe to breakpoint-runner. Map importance to the corresponding audio
// trigger. Pass playerId as the target; server.js's forwarder will look it up.

function breakpointToEvent(ev) {
  if (!ev || !ev.importance) return null;
  switch (ev.importance) {
    case 'minor': return 'breakpoint_minor';
    case 'major': return 'breakpoint_major';
    case 'transformative': return 'breakpoint_transformative';
    default: return null;
  }
}

let unsubscribeBreakpoint = null;

function wireBreakpointListener() {
  try {
    const runner = require('./breakpoint-runner');
    if (unsubscribeBreakpoint) unsubscribeBreakpoint();
    unsubscribeBreakpoint = runner.subscribe((ev) => {
      const eventType = breakpointToEvent(ev);
      if (!eventType) return;
      // Target is the player id; server forwarder resolves it to a socket.
      emitEvent(ev.playerId, eventType, {
        tick: ev.tick,
        bpKey: ev.bpKey,
        bpType: ev.bpType,
        description: ev.description,
      });
      // Also fire the narrator_breakpoint_text_ready event so client can
      // flavor a low-volume page-turn when the narration appends.
      emitEvent(ev.playerId, 'narrator_breakpoint_text_ready', { bpKey: ev.bpKey });
    });
  } catch (e) {
    // breakpoint-runner may not be present in lean test environments; that's ok.
    console.warn('[audio-triggers] breakpoint-runner unavailable:', e.message);
  }
}

// ── Introspection (used by validate-audio-triggers.js and tests) ────────────

function getTriggerIndex() { return triggerIndex; }
function getKnownEvents() { return knownEvents; }
function getManifest() { return manifest; }
function isReady() { return manifest !== null; }
function getError() { return manifestError; }

// ── Self-register on require ─────────────────────────────────────────────────

loadManifest();
wireBreakpointListener();

module.exports = {
  // Public API
  registerHandler,
  registerForwarder,
  emitEvent,
  // Introspection
  getTriggerIndex,
  getKnownEvents,
  getManifest,
  isReady,
  getError,
  // Allow hot-reload in dev
  reload: () => {
    loadManifest();
    wireBreakpointListener();
    return isReady();
  },
  // For tests
  _breakpointToEvent: breakpointToEvent,
  MANIFEST_FILE,
};
