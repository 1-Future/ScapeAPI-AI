// ══════════════════════════════════════════════════════════════════════════════
// Audio Trigger Dispatcher — maps game events to audio-manifest IDs and emits
// WebSocket messages that the client will consume when audio is wired.
//
// Pre-audio-engine: this stages the routing so the client-side audio engine,
// when it lands, can subscribe to `audio` events forwarded by server.js and
// play clips by id + layer. A dev-mode overlay on the client also listens to
// these events for verification.
//
// burn-v2 Audio Activation:
//   - Full reverse-index across music / sfx / vocal_stings / ambient_loops.
//   - `emitRegionAudio(target, region, timeOfDay)` helper for region entry.
//   - `emitVocalForBoss(target, npcId, trigger)` helper for phase transitions.
//   - `snapshotEmit(fn)` — optional tap (dev-overlay/test) for every emit.
//   - Graceful fallback if the manifest fails to load.
//
// How it wires in (self-registering, like narrator):
//   - On require('./audio-triggers'), the module:
//     1. Loads data/audio-manifest.json (tolerantly — logs and disables if missing)
//     2. Builds reverse indexes (trigger → entries, region → ambient/music).
//     3. Calls breakpoint-runner.subscribe(...) to listen for breakpoint events
//        and translate them to minor/major/transformative SFX triggers.
//   - server.js calls registerForwarder(fn) once at boot with a WebSocket sender.
//   - audio-wiring.js (companion module) subscribes to every other relevant
//     engine event and funnels them through emitEvent().
//
// Event message shape going to client:
//   { type: 'audio', id: '<audio-id>', layer: 'sfx'|'music'|'vocal'|'ambient',
//     trigger: '<trigger-name>', context: {...} }
//
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const fs = require('fs');
const path = require('path');

const MANIFEST_FILE = path.join(__dirname, '..', '..', 'data', 'audio-manifest.json');

// ── Manifest load (tolerant) ─────────────────────────────────────────────────

let manifest = null;
let manifestError = null;
let triggerIndex = new Map();      // trigger → [ { id, layer } ]
let musicByRegion = new Map();     // region → [ music entries ]
let ambientByRegion = new Map();   // region → [ ambient_loops entries ]
let vocalByCharacter = new Map();  // character → [ vocal_stings entries ]
let knownEvents = new Set();       // from conventions.known_events

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
  musicByRegion = new Map();
  ambientByRegion = new Map();
  vocalByCharacter = new Map();
  knownEvents = new Set((manifest.conventions && manifest.conventions.known_events) || []);

  const addTrigger = (trigger, id, layer) => {
    if (!trigger) return;
    if (!triggerIndex.has(trigger)) triggerIndex.set(trigger, []);
    triggerIndex.get(trigger).push({ id, layer });
  };
  const addRegionMusic = (region, entry) => {
    if (!region) return;
    if (!musicByRegion.has(region)) musicByRegion.set(region, []);
    musicByRegion.get(region).push(entry);
  };
  const addRegionAmbient = (region, entry) => {
    if (!region) return;
    if (!ambientByRegion.has(region)) ambientByRegion.set(region, []);
    ambientByRegion.get(region).push(entry);
  };
  const addCharacterVocal = (character, entry) => {
    if (!character) return;
    if (!vocalByCharacter.has(character)) vocalByCharacter.set(character, []);
    vocalByCharacter.get(character).push(entry);
  };

  for (const m of manifest.music || []) {
    if (m.trigger) addTrigger(m.trigger, m.id, 'music');
    addRegionMusic(m.region, m);
  }
  for (const s of manifest.sfx || []) {
    addTrigger(s.trigger, s.id, 'sfx');
  }
  for (const v of manifest.vocal_stings || []) {
    addTrigger(v.trigger, v.id, 'vocal');
    addCharacterVocal(v.character, v);
  }
  for (const a of manifest.ambient_loops || []) {
    addRegionAmbient(a.region, a);
  }
}

// ── Handler registry (runtime extensions alongside manifest mappings) ───────

const handlerOverrides = new Map(); // event → [audioIds...]

function registerHandler(eventType, audioIds) {
  if (!Array.isArray(audioIds)) audioIds = [audioIds];
  if (!handlerOverrides.has(eventType)) handlerOverrides.set(eventType, []);
  const list = handlerOverrides.get(eventType);
  for (const id of audioIds) if (!list.includes(id)) list.push(id);
}

// ── Forwarder wire-up (server owns the socket) ───────────────────────────────

let forwarder = null;            // (target, msg) => void

function registerForwarder(fn) {
  forwarder = typeof fn === 'function' ? fn : null;
}

// ── Emit tap (dev overlay / tests subscribe here) ────────────────────────────

const emitTaps = new Set();

function snapshotEmit(fn) {
  emitTaps.add(fn);
  return () => emitTaps.delete(fn);
}

function notifyTaps(target, msg) {
  for (const fn of emitTaps) {
    try { fn(target, msg); } catch (_) { /* taps are fire-and-forget */ }
  }
}

// ── Public: emit an audio event for a player ────────────────────────────────

function emitEvent(target, eventType, context) {
  if (!manifest) return;
  const ctx = context || {};
  const entries = triggerIndex.get(eventType) || [];
  const extras = handlerOverrides.get(eventType) || [];
  for (const e of entries) {
    const msg = { type: 'audio', id: e.id, layer: e.layer, trigger: eventType, context: ctx };
    safeForward(target, msg);
    notifyTaps(target, msg);
  }
  for (const id of extras) {
    const msg = { type: 'audio', id, layer: 'sfx', trigger: eventType, context: ctx };
    safeForward(target, msg);
    notifyTaps(target, msg);
  }
}

function safeForward(target, msg) {
  if (!forwarder) return;
  try {
    forwarder(target, msg);
  } catch (e) {
    console.error('[audio-triggers] forwarder threw:', e.message);
  }
}

// ── Region / time-of-day helpers ────────────────────────────────────────────
// simulateDayNight(gameTick): returns 'day' if [0, 12000) mod 24000, else 'night'.

function simulateDayNight(gameTick) {
  const phase = ((gameTick | 0) % 24000 + 24000) % 24000;
  return phase < 12000 ? 'day' : 'night';
}

// pickMusicForRegion / pickAmbientForRegion choose the closest match:
// exact id "region_main" preferred, then by time-of-day suffix.
function pickMusicForRegion(region, timeOfDay) {
  const entries = musicByRegion.get(region) || [];
  if (!entries.length) return null;
  const targetMain = `${region.replace(/_/g, '-')}-main-${timeOfDay}`;
  const main = entries.find(e => e.id === targetMain);
  if (main) return main;
  // fall back to any zone_loop
  return entries.find(e => e.type === 'zone_loop') || entries[0];
}

function pickAmbientForRegion(region, timeOfDay) {
  const entries = ambientByRegion.get(region) || [];
  if (!entries.length) return null;
  // Prefer specific time-of-day match, then "any"
  const match = entries.find(e => e.time_of_day === timeOfDay)
    || entries.find(e => e.time_of_day === 'any')
    || entries[0];
  return match;
}

function emitRegionAudio(target, region, timeOfDay) {
  if (!manifest || !region) return;
  const tod = timeOfDay || 'day';
  const music = pickMusicForRegion(region, tod);
  const ambient = pickAmbientForRegion(region, tod);
  const ctx = { region, timeOfDay: tod };
  if (music) {
    const msg = { type: 'audio', id: music.id, layer: 'music', trigger: `region_enter_${region}`, context: ctx };
    safeForward(target, msg);
    notifyTaps(target, msg);
  }
  if (ambient) {
    const msg = { type: 'audio', id: ambient.id, layer: 'ambient', trigger: `region_enter_${region}`, context: ctx };
    safeForward(target, msg);
    notifyTaps(target, msg);
  }
  // Also fire the standard region_enter_<region> SFX trigger (chimes/stings).
  emitEvent(target, `region_enter_${region}`, ctx);
}

// ── Vocal sting lookup (by boss/NPC character + optional trigger) ───────────

function emitVocalForBoss(target, npcId, trigger) {
  if (!manifest || !npcId) return 0;
  const candidates = vocalByCharacter.get(npcId) || [];
  if (!candidates.length) return 0;
  const preferred = trigger
    ? candidates.filter(v => v.trigger === trigger)
    : candidates;
  const chosen = preferred.length ? preferred : candidates;
  let count = 0;
  for (const v of chosen) {
    const msg = {
      type: 'audio', id: v.id, layer: 'vocal',
      trigger: v.trigger || trigger || 'npc_dialogue_sting',
      context: { character: npcId, line: v.line, mood: v.mood },
    };
    safeForward(target, msg);
    notifyTaps(target, msg);
    count++;
  }
  return count;
}

// ── Breakpoint → audio routing ───────────────────────────────────────────────

function breakpointToEvent(ev) {
  if (!ev || !ev.importance) return null;
  switch (ev.importance) {
    case 'minor': return 'breakpoint_minor';
    case 'major': return 'breakpoint_major';
    case 'transformative': return 'breakpoint_transformative';
    default: return null;
  }
}

function breakpointToLevelUp(ev) {
  if (!ev || !ev.importance) return null;
  switch (ev.importance) {
    case 'minor': return 'level_up_minor';
    case 'major': return 'level_up_major';
    case 'transformative': return 'level_up_transformative';
    default: return null;
  }
}

let unsubscribeBreakpoint = null;

function wireBreakpointListener() {
  try {
    const runner = require('./breakpoint-runner');
    if (unsubscribeBreakpoint) unsubscribeBreakpoint();
    unsubscribeBreakpoint = runner.subscribe((ev) => {
      const bpEvent = breakpointToEvent(ev);
      if (bpEvent) {
        emitEvent(ev.playerId, bpEvent, {
          tick: ev.tick, bpKey: ev.bpKey, bpType: ev.bpType, description: ev.description,
        });
      }
      // For skill-level breakpoints, also fire the level_up_<importance> stinger.
      if (ev && ev.bpType === 'skill_level') {
        const luEvent = breakpointToLevelUp(ev);
        if (luEvent) emitEvent(ev.playerId, luEvent, { tick: ev.tick, bpKey: ev.bpKey });
      }
      // Quest breakpoints get the generic quest_complete SFX for extra punch.
      if (ev && ev.bpType === 'quest_complete') {
        emitEvent(ev.playerId, 'quest_complete', { tick: ev.tick, bpKey: ev.bpKey });
      }
      // Narrator page-turn hint.
      emitEvent(ev.playerId, 'narrator_breakpoint_text_ready', { bpKey: ev.bpKey });
    });
  } catch (e) {
    console.warn('[audio-triggers] breakpoint-runner unavailable:', e.message);
  }
}

// ── Introspection ────────────────────────────────────────────────────────────

function getTriggerIndex() { return triggerIndex; }
function getKnownEvents() { return knownEvents; }
function getManifest() { return manifest; }
function isReady() { return manifest !== null; }
function getError() { return manifestError; }
function getMusicByRegion(region) { return region ? (musicByRegion.get(region) || []) : musicByRegion; }
function getAmbientByRegion(region) { return region ? (ambientByRegion.get(region) || []) : ambientByRegion; }
function getVocalByCharacter(character) { return character ? (vocalByCharacter.get(character) || []) : vocalByCharacter; }

// ── Self-register on require ─────────────────────────────────────────────────

loadManifest();
wireBreakpointListener();

module.exports = {
  // Public API
  registerHandler,
  registerForwarder,
  emitEvent,
  emitRegionAudio,
  emitVocalForBoss,
  snapshotEmit,
  simulateDayNight,
  pickMusicForRegion,
  pickAmbientForRegion,
  // Introspection
  getTriggerIndex,
  getKnownEvents,
  getManifest,
  getMusicByRegion,
  getAmbientByRegion,
  getVocalByCharacter,
  isReady,
  getError,
  // Reload for dev/tests
  reload: () => {
    loadManifest();
    wireBreakpointListener();
    return isReady();
  },
  // For tests
  _breakpointToEvent: breakpointToEvent,
  _breakpointToLevelUp: breakpointToLevelUp,
  MANIFEST_FILE,
};
