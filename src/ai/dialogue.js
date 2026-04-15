// ══════════════════════════════════════════════════════════════════════════════
// NPC Dialogue — routes `talk <npcId>` and follow-up player lines to local
// Ollama (qwen2.5:14b), using the NPC's personality bible as system context.
//
// Design notes:
//   - Mirrors narrator.js: lazy probe Ollama once, fall back gracefully.
//   - Non-blocking: every Ollama call is async; engine code awaits only its own
//     chain (the command socket), never the tick loop.
//   - System prompt built from data/npc-bibles.json — voice, background, drives,
//     example_lines, dialogue_patterns. No hardcoded archetype tables.
//   - Per-NPC LRU cache for cold-open questions (no player-specific context).
//     Persists to data/dialogue-cache.json between runs.
//   - If Ollama is unreachable or returns empty, fall back to the NPC bible's
//     `dialogue_patterns.greeting_first` (or similar canned stock line).
//
// No reference to any real-world author/essayist is ever passed to the model;
// the model tends to treat proper nouns as place names. Voice direction is
// phrased as "grounded design principles" or similar neutral phrasing.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const fs = require('fs');
const path = require('path');

// ── Paths ────────────────────────────────────────────────────────────────────
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const BIBLES_FILE = path.join(DATA_DIR, 'npc-bibles.json');
const CACHE_FILE = path.join(DATA_DIR, 'dialogue-cache.json');

// ── Ollama config ────────────────────────────────────────────────────────────
const OLLAMA_URL = (process.env.OLLAMA_URL || 'http://localhost:11434').replace(/\/$/, '');
const MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:14b';
const NUM_PREDICT = 200;
const PROBE_TIMEOUT_MS = 2000;
const GEN_TIMEOUT_MS = 30000;

// ── Cache config ─────────────────────────────────────────────────────────────
const CACHE_MAX_PER_NPC = 50;
const CACHE_SAVE_INTERVAL_MS = 60000;

// ── NPC bibles registry ──────────────────────────────────────────────────────
let biblesLoaded = false;
const bibles = new Map(); // id → bible object

function loadBibles() {
  if (biblesLoaded) return;
  try {
    const raw = fs.readFileSync(BIBLES_FILE, 'utf8');
    const data = JSON.parse(raw);
    const list = Array.isArray(data.npcs) ? data.npcs : [];
    for (const b of list) {
      if (b && b.id) bibles.set(b.id, b);
    }
    biblesLoaded = true;
  } catch (e) {
    // Not fatal — the engine may be running without bibles in dev.
    biblesLoaded = true;
    console.warn(`[dialogue] Could not load ${BIBLES_FILE}: ${e.message}`);
  }
}

function getBible(npcId) {
  loadBibles();
  return bibles.get(npcId) || null;
}

function listNpcIds() {
  loadBibles();
  return [...bibles.keys()];
}

// ── Cache: per-NPC LRU for cold-open answers ─────────────────────────────────
// Map<npcId, Map<cacheKey, { lines, options, ts }>>
const cache = new Map();
let cacheDirty = false;

function loadCache() {
  try {
    if (!fs.existsSync(CACHE_FILE)) return;
    const raw = fs.readFileSync(CACHE_FILE, 'utf8');
    const data = JSON.parse(raw);
    for (const [npcId, entries] of Object.entries(data || {})) {
      const m = new Map();
      for (const [k, v] of Object.entries(entries || {})) {
        m.set(k, v);
      }
      cache.set(npcId, m);
    }
  } catch (e) {
    console.warn(`[dialogue] Cache load failed: ${e.message}`);
  }
}

function saveCache() {
  if (!cacheDirty) return;
  try {
    const out = {};
    for (const [npcId, m] of cache) {
      out[npcId] = {};
      for (const [k, v] of m) out[npcId][k] = v;
    }
    fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify(out, null, 2));
    cacheDirty = false;
  } catch (e) {
    console.warn(`[dialogue] Cache save failed: ${e.message}`);
  }
}

let cacheTimer = null;
function startCachePersistence(ms = CACHE_SAVE_INTERVAL_MS) {
  if (cacheTimer) return;
  loadCache();
  cacheTimer = setInterval(saveCache, ms);
}
function stopCachePersistence() {
  if (cacheTimer) { clearInterval(cacheTimer); cacheTimer = null; }
  saveCache();
}

function timeOfDayBucket(worldState) {
  if (!worldState || typeof worldState.tick !== 'number') return 'day';
  // Simple bucket: day/night cycle every 2400 ticks, day first half.
  const phase = (worldState.tick % 2400) / 2400;
  return phase < 0.5 ? 'day' : 'night';
}

function cacheKeyFor(npcId, topic, playerState) {
  // Cache keys only include NPC-scope data (no player-specific facts that
  // personalize the reply). topic + region + time bucket are enough to
  // dedupe cold-open questions.
  const t = topic || 'greeting';
  const region = (playerState && playerState.region) || 'unknown';
  const timeBucket = (playerState && playerState.timeOfDay) || 'day';
  return `${npcId}::${t}::${region}::${timeBucket}`;
}

function cacheGet(npcId, key) {
  const m = cache.get(npcId);
  if (!m) return null;
  const entry = m.get(key);
  if (!entry) return null;
  // LRU: touch moves to end.
  m.delete(key);
  m.set(key, entry);
  return { lines: entry.lines.slice(), options: entry.options.slice() };
}

function cacheSet(npcId, key, value) {
  let m = cache.get(npcId);
  if (!m) { m = new Map(); cache.set(npcId, m); }
  m.delete(key);
  m.set(key, { lines: value.lines.slice(), options: value.options.slice(), ts: Date.now() });
  while (m.size > CACHE_MAX_PER_NPC) {
    const oldest = m.keys().next().value;
    m.delete(oldest);
  }
  cacheDirty = true;
}

function clearCache() {
  cache.clear();
  cacheDirty = true;
}

// ── Ollama probe ─────────────────────────────────────────────────────────────
let probed = null;
let probePromise = null;
let disabledReason = null;

async function probeOllama() {
  try {
    const f = _getFetch();
    const r = await f(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(PROBE_TIMEOUT_MS) });
    if (!r.ok) {
      disabledReason = `Ollama returned HTTP ${r.status} from /api/tags`;
      return false;
    }
    return true;
  } catch (e) {
    disabledReason = `Ollama unreachable at ${OLLAMA_URL} (${e.message})`;
    return false;
  }
}

async function ensureProbed() {
  if (probed !== null) return probed;
  if (!probePromise) probePromise = probeOllama();
  probed = await probePromise;
  return probed;
}

function resetProbe() {
  probed = null;
  probePromise = null;
  disabledReason = null;
}

// ── Prompt builders ──────────────────────────────────────────────────────────
function pickExampleLines(bible, max = 5) {
  const lines = (bible.voice && Array.isArray(bible.voice.example_lines)) ? bible.voice.example_lines : [];
  return lines.slice(0, Math.max(3, Math.min(max, lines.length)));
}

function summarizeRelationships(bible) {
  const rels = Array.isArray(bible.relationships) ? bible.relationships.slice(0, 3) : [];
  return rels.map(r => `  - ${r.with}: ${r.nature}`).join('\n');
}

function summarizeDrives(bible) {
  const d = bible.drives || {};
  const parts = [];
  if (d.wants) parts.push(`Wants: ${d.wants}`);
  if (d.fears) parts.push(`Fears: ${d.fears}`);
  // The secret is NOT revealed to the player. The model should weigh it but
  // never state it.
  if (d.secret) parts.push(`Secret (never speak aloud, shapes silences only): ${d.secret}`);
  return parts.join('\n');
}

function summarizeVoice(bible) {
  const v = bible.voice || {};
  const parts = [];
  if (v.cadence) parts.push(`Cadence: ${v.cadence}`);
  if (v.vocabulary) parts.push(`Vocabulary: ${v.vocabulary}`);
  if (Array.isArray(v.verbal_tics) && v.verbal_tics.length) {
    parts.push(`Verbal tics: ${v.verbal_tics.join('; ')}`);
  }
  if (v.silences) parts.push(`Silences: ${v.silences}`);
  return parts.join('\n');
}

function buildSystemPrompt(bible, playerState, worldState) {
  const examples = pickExampleLines(bible, 5);
  const examplesBlock = examples.map(e => `- "${e}"`).join('\n');

  const forbid = Array.isArray(bible.do_not_have_her_say) ? bible.do_not_have_her_say : [];
  const forbidBlock = forbid.length
    ? `\nThis character must NEVER say:\n${forbid.map(s => `- ${s}`).join('\n')}`
    : '';

  const patterns = bible.dialogue_patterns || {};
  const patternsBlock = Object.keys(patterns).length
    ? `\nCanned patterns (tone reference, not verbatim quotes):\n${Object.entries(patterns).map(([k, v]) => `- ${k}: "${v}"`).join('\n')}`
    : '';

  const drivesBlock = summarizeDrives(bible);
  const voiceBlock = summarizeVoice(bible);
  const relsBlock = summarizeRelationships(bible);

  // Minimal player context. Do not include secrets, do not include inventory
  // details — only what a villager would realistically observe or remember.
  const ps = playerState || {};
  const playerBlock = [
    `Player name: ${ps.name || 'an adventurer'}`,
    ps.region ? `Where they stand right now: ${ps.region}` : null,
    (typeof ps.totalLevel === 'number') ? `Impression of their bearing: total skill ${ps.totalLevel}${ps.highestSkill ? `, visibly trained in ${ps.highestSkill}` : ''}` : null,
    (Array.isArray(ps.activeQuests) && ps.activeQuests.length) ? `Quests the player has spoken of: ${ps.activeQuests.join(', ')}` : null,
  ].filter(Boolean).join('\n');

  const ws = worldState || {};
  const worldBlock = [
    ws.timeOfDay ? `Time of day: ${ws.timeOfDay}` : null,
    (Array.isArray(ws.recentEvents) && ws.recentEvents.length) ? `Recent events this NPC would know of: ${ws.recentEvents.slice(0, 3).join('; ')}` : null,
  ].filter(Boolean).join('\n');

  return [
    `You are ${bible.name}${bible.title_shown_to_players ? ` (${bible.title_shown_to_players})` : ''}, a character in the world of Aelgard — a grounded OSRS-inspired setting. Stay in character at all times.`,
    '',
    `Region: ${bible.region || 'unknown'}`,
    `Location: ${bible.location || 'unknown'}`,
    `Role: ${bible.role || 'villager'}`,
    bible.archetype ? `Archetype: ${bible.archetype}` : '',
    '',
    'Background:',
    (bible.background || '').trim(),
    '',
    'Drives:',
    drivesBlock,
    '',
    'Voice (match this exactly):',
    voiceBlock,
    '',
    'Relationships shaping their outlook:',
    relsBlock,
    '',
    'Example lines — study their cadence, vocabulary, and beat-closing rhythm. Do NOT quote them verbatim; write new lines that sound like these:',
    examplesBlock,
    patternsBlock,
    forbidBlock,
    '',
    '— Player context —',
    playerBlock || '(player unknown)',
    '',
    worldBlock ? `— World context —\n${worldBlock}\n` : '',
    '— Grounded design principles (must follow) —',
    '- Speak as this person, in their region\'s register. No modern speech, no slang outside their vocabulary, no genre-savvy winks or meta-jokes, no emoji.',
    '- Exclamation marks are forbidden unless this character explicitly uses them in their examples; even then, use them sparingly.',
    '- Never break character. Never say you are an AI. Never refer to game mechanics, stats, inventories, tick counts, or menus. Translate any mechanic into in-world observation.',
    '- Cap reply to 3-4 short sentences per turn. Shorter is better. Silence is allowed when this character would be silent.',
    '- Never reveal the character\'s secret. Let it shape what they do not say.',
    '',
    'Output format:',
    '- Return ONLY the character\'s line(s) of dialogue, with no preamble, no label, no quotes around them, no stage directions.',
    '- If you offer the player 2-3 branching options, append them on separate lines each starting with "> " at the end.',
  ].filter(x => x !== '').join('\n');
}

function buildUserPrompt(userLine, topic, history) {
  const parts = [];
  if (Array.isArray(history) && history.length) {
    parts.push('Conversation so far:');
    for (const turn of history.slice(-6)) {
      if (turn.role === 'player') parts.push(`Player: ${turn.text}`);
      else if (turn.role === 'npc') parts.push(`You (previously): ${turn.text}`);
    }
    parts.push('');
  }
  if (topic) parts.push(`The player wants to discuss: ${topic}`);
  if (userLine) {
    parts.push(`Player says: "${userLine}"`);
  } else {
    parts.push('The player has just approached you for the first time this session. Greet or regard them as this character would.');
  }
  parts.push('');
  parts.push('Write the character\'s response now.');
  return parts.join('\n');
}

// ── Response parsing ─────────────────────────────────────────────────────────
function parseOllamaText(text) {
  if (!text || typeof text !== 'string') return { lines: [], options: [] };
  let cleaned = text.trim();

  // Try JSON first.
  if (cleaned.startsWith('{') || cleaned.startsWith('[')) {
    try {
      const obj = JSON.parse(cleaned);
      if (obj && Array.isArray(obj.lines)) {
        return {
          lines: obj.lines.filter(Boolean).map(String),
          options: Array.isArray(obj.options) ? obj.options.filter(Boolean).map(String) : [],
        };
      }
    } catch {
      // Fall through to plain-text parsing.
    }
  }

  // Plain text with "> " prefixed options at the end.
  const options = [];
  const mainLines = [];
  for (const raw of cleaned.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    if (/^>\s+/.test(line)) {
      options.push(line.replace(/^>\s+/, '').trim());
    } else {
      mainLines.push(line);
    }
  }
  const joined = mainLines.join(' ').trim();
  const final = joined ? [joined] : [];
  return { lines: final, options };
}

// ── Ollama call ──────────────────────────────────────────────────────────────
let fetchImpl = null;
function _getFetch() {
  if (fetchImpl) return fetchImpl;
  if (typeof fetch === 'function') return fetch;
  throw new Error('No fetch implementation available');
}
function _setFetch(fn) { fetchImpl = fn; }

async function callOllama(systemPrompt, userPrompt) {
  const f = _getFetch();
  const res = await f(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      stream: false,
      options: {
        num_predict: NUM_PREDICT,
        temperature: 0.8,
        top_p: 0.9,
      },
    }),
    signal: AbortSignal.timeout(GEN_TIMEOUT_MS),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Ollama HTTP ${res.status}${body ? ': ' + body.slice(0, 160) : ''}`);
  }
  const data = await res.json();
  const text = data && data.message && data.message.content;
  return typeof text === 'string' ? text.trim() : null;
}

// ── Available topics ─────────────────────────────────────────────────────────
// Derived from the bible's role/archetype text and player gating (quest status,
// skill levels). Keeps us honest: no "shop" option if there's no shop.
function availableTopics(npcId, player) {
  const bible = getBible(npcId);
  if (!bible) return [];

  const topics = new Set();
  topics.add('small_talk');

  const haystack = [
    bible.role || '',
    bible.archetype || '',
    bible.location || '',
  ].join(' ').toLowerCase();

  const offersShop = /\b(merchant|shop|store|general goods|seller|fence|stockist|trader|fishmonger|armourer|smithy|tanner|innkeeper)\b/.test(haystack);
  const offersTraining = /\b(tutor|trainer|master|instructor|coach|teaches|apprentice|gatekeeper)\b/.test(haystack);
  const offersQuests = /\b(quest-giver|quest giver|errand|patrol|assistant|coordinator|contact|broker)\b/.test(haystack);
  const knowsRumours = !!(bible.opinions || bible.relationships);

  if (offersShop) topics.add('shop');
  if (offersTraining) topics.add('training');
  if (offersQuests || (player && Array.isArray(player.activeQuests) && player.activeQuests.length)) {
    topics.add('quest');
  }
  if (knowsRumours) topics.add('rumors');

  return [...topics];
}

// ── Fallback ─────────────────────────────────────────────────────────────────
function fallbackLine(bible) {
  const p = (bible && bible.dialogue_patterns) || {};
  return p.greeting_first || p.greeting_regular || 'Hm.';
}

function fallbackResponse(bible) {
  return { lines: [fallbackLine(bible)], options: [], fallback: true };
}

// ── Player state projection ──────────────────────────────────────────────────
// Accept a raw engine player object and produce the minimal context we send
// to Ollama. Never leak skills objects, inventory, or breakpoint history.
function projectPlayerState(player) {
  if (!player) return {};
  const state = {
    name: player.name,
    region: player.region || (player.currentRegion) || null,
  };
  // Skills summary
  if (player.skills && typeof player.skills === 'object') {
    let total = 0;
    let highest = null;
    let highestLvl = 0;
    for (const [skill, s] of Object.entries(player.skills)) {
      const lvl = s && typeof s.level === 'number' ? s.level : 0;
      total += lvl;
      if (lvl > highestLvl) { highestLvl = lvl; highest = skill; }
    }
    state.totalLevel = total;
    state.highestSkill = highest;
  }
  // Active quest ids
  if (player.questProgress && typeof player.questProgress === 'object') {
    state.activeQuests = Object.entries(player.questProgress)
      .filter(([, s]) => s && s.started && !s.complete)
      .map(([id]) => id);
  }
  // Optional time-of-day hint
  if (typeof player._timeOfDay === 'string') state.timeOfDay = player._timeOfDay;
  return state;
}

// ── Public API ───────────────────────────────────────────────────────────────
// talk(player, npcId, userLine=null, topic=null) -> { lines, options }
//
// - userLine=null, topic=null → cold open (cacheable).
// - userLine=null, topic=X    → "we want to discuss X" (cacheable).
// - userLine=X                → follow-up; never cached.
async function talk(player, npcId, userLine = null, topic = null, extra = {}) {
  const bible = getBible(npcId);
  if (!bible) {
    return { lines: [`You address no one in particular.`], options: [], error: 'unknown_npc' };
  }

  const playerState = projectPlayerState(player);
  // Timestamp on the NPC's side; we use tick if provided by caller.
  const worldState = extra.worldState || {};
  if (!worldState.timeOfDay) worldState.timeOfDay = timeOfDayBucket(worldState);

  const coldOpen = !userLine;
  const history = Array.isArray(extra.history) ? extra.history : [];

  // Cache lookup (cold-open only; per-NPC LRU)
  if (coldOpen) {
    const key = cacheKeyFor(npcId, topic, { region: playerState.region, timeOfDay: worldState.timeOfDay });
    const hit = cacheGet(npcId, key);
    if (hit) return { ...hit, cached: true };
  }

  const ok = await ensureProbed();
  if (!ok) {
    return fallbackResponse(bible);
  }

  const systemPrompt = buildSystemPrompt(bible, playerState, worldState);
  const userPrompt = buildUserPrompt(userLine, topic, history);

  let raw = null;
  try {
    raw = await callOllama(systemPrompt, userPrompt);
  } catch (e) {
    console.error(`[dialogue] Ollama error for ${npcId}: ${e.message}`);
    return fallbackResponse(bible);
  }
  const parsed = parseOllamaText(raw);
  if (!parsed.lines.length) {
    return fallbackResponse(bible);
  }

  const response = { lines: parsed.lines, options: parsed.options };

  if (coldOpen) {
    const key = cacheKeyFor(npcId, topic, { region: playerState.region, timeOfDay: worldState.timeOfDay });
    cacheSet(npcId, key, response);
  }

  return response;
}

// ── Exports ──────────────────────────────────────────────────────────────────
module.exports = {
  // primary
  talk,
  availableTopics,
  cacheKeyFor,
  // introspection / lifecycle
  loadBibles,
  getBible,
  listNpcIds,
  startCachePersistence,
  stopCachePersistence,
  saveCache,
  clearCache,
  // prompt building (exposed for tests / tools)
  buildSystemPrompt,
  buildUserPrompt,
  parseOllamaText,
  projectPlayerState,
  fallbackLine,
  fallbackResponse,
  // probe state
  probe: ensureProbed,
  resetProbe,
  isEnabled: () => probed === true,
  disabledReason: () => probed === false ? disabledReason : (probed === null ? 'not yet probed' : null),
  // hooks for tests
  _setFetch,
  // config constants
  OLLAMA_URL,
  MODEL,
  BIBLES_FILE,
  CACHE_FILE,
  CACHE_MAX_PER_NPC,
};
