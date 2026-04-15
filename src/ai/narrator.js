// ══════════════════════════════════════════════════════════════════════════════
// Live Narrator — on breakpoint events, asks local Ollama (qwen2.5:14b) for
// 2–3 sentences of flavor text and appends to public/events.json. Spectator
// polls that file.
//
// Design notes:
//   - Fire-and-forget from the breakpoint subscriber; never blocks the tick loop.
//   - Uses native fetch against OLLAMA_URL (default http://localhost:11434).
//   - Lazy probes /api/tags on first narrate() call; if Ollama is unreachable,
//     logs once and records structured-only entries from then on.
//   - Retains the last NARRATION_WINDOW entries; older ones rotate out.
//   - Concurrent writes serialized via an in-process promise chain — the server
//     is single-process and this is the only writer, so no file lock needed.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const fs = require('fs');
const path = require('path');

const EVENTS_FILE = path.join(__dirname, '..', '..', 'public', 'events.json');
const NARRATION_WINDOW = 50;
const OLLAMA_URL = (process.env.OLLAMA_URL || 'http://localhost:11434').replace(/\/$/, '');
const MODEL = 'qwen2.5:14b';
const NUM_PREDICT = 200;
const PROBE_TIMEOUT_MS = 2000;
const GEN_TIMEOUT_MS = 30000;

const SYSTEM_PROMPT = `You are the Live Narrator for Scape, a grounded OSRS-inspired MMO set in the world of Aelgard.

Your job: when a player crosses a "breakpoint" — a transformative progression moment like unlocking protection prayers at Prayer 43, or wielding their first rune scimitar at Attack 40 — write 2–3 sentences of tight flavor text for the spectator feed.

Voice:
- Third-person past tense, the player's name as subject ("Thorne felt the altar's weight settle…").
- Specific, grounded: treat progression as the player "earning the next chapter," not a video-game stat bump. Progression is a *threshold* — something the player is now allowed to do, touch, carry, or be trusted with. No RNG talk. No numbers unless they're in the player's own voice. No genre-savvy winking.
- Dry warmth. No exclamation marks. No hype. No "Congratulations!" No emoji. Never address the player directly.
- If there are unlocks, let one surface implicitly — don't enumerate them.
- Under 60 words total. Two sentences is plenty; three only if the beat earns it.

Output rules:
- Return ONLY the narration text. No preamble, no JSON, no quotes around it, no "Narration:" label.
- Never mention the tick, the level number, or the breakpoint key. Translate those into in-world observation.`;

// ── Availability probe (lazy, once) ──────────────────────────────────────────
let probed = null;          // null = unprobed, true/false = result
let probePromise = null;    // in-flight probe, shared across concurrent callers
let disabledReasonStr = null;

async function probeOllama() {
  try {
    const r = await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(PROBE_TIMEOUT_MS) });
    if (!r.ok) {
      disabledReasonStr = `Ollama returned HTTP ${r.status} from /api/tags`;
      return false;
    }
    return true;
  } catch (e) {
    disabledReasonStr = `Ollama unreachable at ${OLLAMA_URL} (${e.message})`;
    return false;
  }
}

async function ensureProbed() {
  if (probed !== null) return probed;
  if (!probePromise) probePromise = probeOllama();
  probed = await probePromise;
  return probed;
}

// ── Write queue — serialize JSON file mutations ──────────────────────────────
let writeChain = Promise.resolve();

function readEventsFile() {
  try {
    const raw = fs.readFileSync(EVENTS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.entries) ? parsed : { entries: [] };
  } catch (e) {
    return { entries: [] };
  }
}

function writeEventsFile(data) {
  const tmp = EVENTS_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, EVENTS_FILE);
}

function ensureInitialized() {
  if (!fs.existsSync(EVENTS_FILE)) {
    writeEventsFile({ entries: [] });
  }
}

function appendEntry(entry) {
  writeChain = writeChain.then(() => {
    const data = readEventsFile();
    data.entries.push(entry);
    if (data.entries.length > NARRATION_WINDOW) {
      data.entries = data.entries.slice(-NARRATION_WINDOW);
    }
    writeEventsFile(data);
  }).catch(e => {
    console.error('[narrator] append failed:', e.message);
  });
  return writeChain;
}

// ── Build the user prompt from a breakpoint event ────────────────────────────
function buildPrompt(ev) {
  const bits = [];
  bits.push(`Player: ${ev.playerName || 'an adventurer'}`);
  bits.push(`Breakpoint: ${ev.description || ev.bpKey}`);
  bits.push(`Importance: ${ev.importance}`);
  if (ev.bpType === 'skill_level' && ev.trigger) {
    bits.push(`Context: crossed ${ev.trigger.skill} ${ev.trigger.level}.`);
  } else if (ev.bpType === 'quest_complete' && ev.trigger) {
    bits.push(`Context: completed the quest "${ev.trigger.quest}".`);
  } else if (ev.bpType === 'item_acquired' && ev.trigger) {
    bits.push(`Context: acquired ${ev.trigger.item}.`);
  }
  if (Array.isArray(ev.unlocks) && ev.unlocks.length) {
    const unlockSummary = ev.unlocks.map(u => u.description || u.id).filter(Boolean).join('; ');
    if (unlockSummary) bits.push(`Unlocks: ${unlockSummary}`);
  }
  bits.push('');
  bits.push('Write the narration now.');
  return bits.join('\n');
}

// ── Ollama call ──────────────────────────────────────────────────────────────
async function callOllama(ev) {
  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildPrompt(ev) },
      ],
      stream: false,
      options: { num_predict: NUM_PREDICT },
    }),
    signal: AbortSignal.timeout(GEN_TIMEOUT_MS),
  });
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Ollama HTTP ${response.status}${body ? ': ' + body.slice(0, 120) : ''}`);
  }
  const data = await response.json();
  const text = data?.message?.content;
  return typeof text === 'string' ? text.trim() : null;
}

// ── Public API ───────────────────────────────────────────────────────────────
let warnedOnce = false;

async function narrate(ev) {
  ensureInitialized();

  const ok = await ensureProbed();
  if (!ok) {
    if (!warnedOnce) {
      console.warn(`[narrator] disabled — ${disabledReasonStr}. Breakpoints will still fire; spectator will show structured events only.`);
      warnedOnce = true;
    }
    await appendEntry({
      ts: Date.now(),
      tick: ev.tick,
      playerId: ev.playerId,
      playerName: ev.playerName,
      bpKey: ev.bpKey,
      importance: ev.importance,
      description: ev.description,
      unlocks: ev.unlocks || [],
      narration: null,
      narrationError: disabledReasonStr,
    });
    return;
  }

  let narration = null;
  let narrationError = null;
  try {
    narration = await callOllama(ev);
    if (!narration) narrationError = 'Ollama returned empty content';
  } catch (e) {
    narrationError = e.name === 'TimeoutError' || e.name === 'AbortError'
      ? `generation timeout after ${GEN_TIMEOUT_MS}ms`
      : `ollama error: ${e.message}`;
    console.error(`[narrator] ${narrationError}`);
  }

  await appendEntry({
    ts: Date.now(),
    tick: ev.tick,
    playerId: ev.playerId,
    playerName: ev.playerName,
    bpKey: ev.bpKey,
    importance: ev.importance,
    description: ev.description,
    unlocks: ev.unlocks || [],
    narration,
    narrationError,
  });
}

// Synchronous external entry point — fire-and-forget.
function handleBreakpoint(ev) {
  narrate(ev).catch(e => console.error('[narrator] handler threw:', e.message));
}

// For tests / manual inject endpoint.
async function injectEntry(entry) {
  ensureInitialized();
  await appendEntry({
    ts: entry.ts || Date.now(),
    tick: entry.tick || null,
    playerId: entry.playerId || null,
    playerName: entry.playerName || 'Unknown',
    bpKey: entry.bpKey || 'manual',
    importance: entry.importance || 'minor',
    description: entry.description || '',
    unlocks: entry.unlocks || [],
    narration: entry.narration || null,
    narrationError: null,
  });
}

module.exports = {
  handleBreakpoint,
  narrate,
  injectEntry,
  ensureInitialized,
  // true only after a successful probe — before narrate() has run, false.
  isEnabled: () => probed === true,
  disabledReason: () => probed === false ? disabledReasonStr : (probed === null ? 'not yet probed' : null),
  // Explicit async probe for callers (e.g. server.js startup) that want to log
  // availability without firing a breakpoint. Idempotent.
  probe: ensureProbed,
  OLLAMA_URL,
  MODEL,
  EVENTS_FILE,
};
