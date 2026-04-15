// ══════════════════════════════════════════════════════════════════════════════
// validate-audio-triggers.js
//
// Walks data/audio-manifest.json and confirms:
//   1. Every `trigger` on an SFX, music, or vocal entry is declared in
//      conventions.known_events.
//   2. No duplicate ids within a layer (music, sfx, ambient_loops, vocal_stings).
//   3. All manifest music / sfx count minimums are met (gut-check against task
//      targets: 50+ music cues, 30+ ambient loops, 300+ SFX, 50+ vocal stings).
//
// Exits with code 0 on success, 1 on failure. Meant to be run in CI and after
// editing the manifest.
//
// Usage:  node scripts/validate-audio-triggers.js
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const fs = require('fs');
const path = require('path');

const MANIFEST_FILE = path.join(__dirname, '..', 'data', 'audio-manifest.json');

const TARGETS = {
  music: 50,
  ambient_loops: 30,
  sfx: 300,
  vocal_stings: 50,
};

function fail(msg) {
  console.error(`[validate-audio-triggers] FAIL: ${msg}`);
  process.exitCode = 1;
}

function info(msg) {
  console.log(`[validate-audio-triggers] ${msg}`);
}

function loadManifest() {
  let raw;
  try {
    raw = fs.readFileSync(MANIFEST_FILE, 'utf8');
  } catch (e) {
    console.error(`[validate-audio-triggers] cannot read ${MANIFEST_FILE}: ${e.message}`);
    process.exit(1);
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error(`[validate-audio-triggers] parse error: ${e.message}`);
    process.exit(1);
  }
}

function uniqueIds(list, layerName) {
  if (!Array.isArray(list)) return true;
  const seen = new Set();
  let ok = true;
  for (const item of list) {
    if (!item.id) {
      fail(`${layerName} entry missing id: ${JSON.stringify(item).slice(0, 100)}`);
      ok = false;
      continue;
    }
    if (seen.has(item.id)) {
      fail(`${layerName} duplicate id: ${item.id}`);
      ok = false;
      continue;
    }
    seen.add(item.id);
  }
  return ok;
}

function validateTriggers(list, layerName, knownEvents) {
  if (!Array.isArray(list)) return true;
  let ok = true;
  for (const item of list) {
    if (!item.trigger) continue;  // triggers only required on SFX; music/vocal may omit
    if (!knownEvents.has(item.trigger)) {
      fail(`${layerName} entry '${item.id}' references unknown trigger '${item.trigger}'`);
      ok = false;
    }
  }
  return ok;
}

function requireSfxTriggers(list) {
  let ok = true;
  for (const item of list) {
    if (!item.trigger) {
      fail(`sfx entry '${item.id}' has no trigger`);
      ok = false;
    }
  }
  return ok;
}

function checkCounts(m) {
  const counts = {
    music: (m.music || []).length,
    ambient_loops: (m.ambient_loops || []).length,
    sfx: (m.sfx || []).length,
    vocal_stings: (m.vocal_stings || []).length,
  };
  info(`counts — music: ${counts.music}, ambient_loops: ${counts.ambient_loops}, sfx: ${counts.sfx}, vocal_stings: ${counts.vocal_stings}`);
  let ok = true;
  for (const k of Object.keys(TARGETS)) {
    if (counts[k] < TARGETS[k]) {
      fail(`count target missed: ${k} has ${counts[k]}, need >= ${TARGETS[k]}`);
      ok = false;
    }
  }
  return ok;
}

function checkCharacterReferences(m, knownNpcIds) {
  // Optional sanity: warn if a vocal_sting references a character that is not
  // in data/npc-bibles.json. Not fatal.
  if (!knownNpcIds) return true;
  let warnings = 0;
  for (const v of m.vocal_stings || []) {
    if (!v.character) continue;
    if (!knownNpcIds.has(v.character)) {
      // Allow monster characters (crystal_wyrm etc.) even if they aren't in the
      // NPC bibles — they may live in content packs.
      info(`note: vocal '${v.id}' references character '${v.character}' not in npc-bibles.json (ok if monster)`);
      warnings++;
    }
  }
  if (warnings) info(`${warnings} vocal stings reference non-bible characters (informational only)`);
  return true;
}

function loadNpcBibleIds() {
  // Tolerant: if npc-bibles.json is missing (gitignored data/), skip.
  const p = path.join(__dirname, '..', 'data', 'npc-bibles.json');
  try {
    const raw = fs.readFileSync(p, 'utf8');
    const data = JSON.parse(raw);
    const ids = new Set();
    for (const n of data.npcs || []) if (n.id) ids.add(n.id);
    return ids;
  } catch (e) {
    return null; // not present in this worktree; skip check
  }
}

function main() {
  const m = loadManifest();
  const knownEvents = new Set((m.conventions && m.conventions.known_events) || []);
  if (knownEvents.size === 0) {
    fail('conventions.known_events is empty or missing');
    process.exit(1);
  }

  let ok = true;
  ok = uniqueIds(m.music, 'music') && ok;
  ok = uniqueIds(m.ambient_loops, 'ambient_loops') && ok;
  ok = uniqueIds(m.sfx, 'sfx') && ok;
  ok = uniqueIds(m.vocal_stings, 'vocal_stings') && ok;

  ok = requireSfxTriggers(m.sfx || []) && ok;

  ok = validateTriggers(m.music || [], 'music', knownEvents) && ok;
  ok = validateTriggers(m.sfx || [], 'sfx', knownEvents) && ok;
  ok = validateTriggers(m.vocal_stings || [], 'vocal_stings', knownEvents) && ok;

  ok = checkCounts(m) && ok;

  const npcIds = loadNpcBibleIds();
  checkCharacterReferences(m, npcIds);

  // Coverage summary: which known_events are not referenced by any SFX entry
  // at all? Not a failure — informational — but useful to know the dead
  // triggers so they can either be pruned or wired.
  const usedTriggers = new Set();
  for (const s of m.sfx || []) if (s.trigger) usedTriggers.add(s.trigger);
  const unused = [...knownEvents].filter(e => !usedTriggers.has(e));
  if (unused.length) {
    info(`${unused.length} known_events are not yet bound to an SFX (informational): ${unused.slice(0, 5).join(', ')}${unused.length > 5 ? '...' : ''}`);
  }

  if (ok) {
    info('PASS — all SFX triggers are declared, no duplicates, counts meet targets');
    process.exit(0);
  } else {
    console.error('[validate-audio-triggers] FAILED — see errors above');
    process.exit(1);
  }
}

main();
