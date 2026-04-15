#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// Test suite for src/ai/dialogue.js + src/engine/dialogue-commands.js
//
// Runs without a live Ollama — we mock fetch with canned responses, then verify
// prompt shape, player-context inclusion, caching, topic gating, and session
// teardown. Also verifies the unreachable-Ollama fallback path.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const path = require('path');
const fs = require('fs');

// Clear any stale cache file from previous runs before requiring the module.
const CACHE_FILE = path.join(__dirname, '..', 'data', 'dialogue-cache.json');
try { if (fs.existsSync(CACHE_FILE)) fs.unlinkSync(CACHE_FILE); } catch {}

const dialogue = require('../src/ai/dialogue');
const dialogueCommands = require('../src/engine/dialogue-commands');

// ── Test harness ─────────────────────────────────────────────────────────────
const results = [];
let currentSection = '(root)';

function section(name) { currentSection = name; console.log(`\n── ${name} ──`); }
function assert(name, cond, detail) {
  const ok = Boolean(cond);
  results.push({ ok, section: currentSection, name, detail });
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}${(!ok && detail) ? `\n        ${detail}` : ''}`);
}
function assertEq(name, got, want) {
  assert(name, got === want, `got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
}
function assertContains(name, haystack, needle) {
  const ok = typeof haystack === 'string' && haystack.includes(needle);
  assert(name, ok, `expected to contain: ${JSON.stringify(needle)}`);
}
function assertNotContains(name, haystack, needle) {
  const ok = typeof haystack === 'string' && !haystack.includes(needle);
  assert(name, ok, `expected NOT to contain: ${JSON.stringify(needle)}`);
}

// ── Fetch mock ───────────────────────────────────────────────────────────────
let fetchCalls = [];
let fetchNextResponse = null; // function or fixed value
let fetchProbeOk = true;

function makeProbeResp() {
  return {
    ok: fetchProbeOk,
    status: fetchProbeOk ? 200 : 500,
    async json() { return { models: [{ name: 'qwen2.5:14b' }] }; },
    async text() { return ''; },
  };
}
function makeChatResp(content) {
  return {
    ok: true,
    status: 200,
    async json() { return { message: { content } }; },
    async text() { return ''; },
  };
}
function makeUnreachable() {
  const err = new Error('ECONNREFUSED');
  return Promise.reject(err);
}

function installFetchMock() {
  fetchCalls = [];
  const mock = async (url, init) => {
    fetchCalls.push({ url: String(url), init });
    if (String(url).endsWith('/api/tags')) {
      if (!fetchProbeOk) return makeUnreachable();
      return makeProbeResp();
    }
    if (typeof fetchNextResponse === 'function') {
      const r = fetchNextResponse(url, init);
      fetchNextResponse = null;
      return r;
    }
    if (fetchNextResponse) {
      const r = fetchNextResponse;
      fetchNextResponse = null;
      return r;
    }
    return makeChatResp('Default canned reply.');
  };
  dialogue._setFetch(mock);
}

function resetProbeAndMock() {
  dialogue.resetProbe();
  fetchProbeOk = true;
  fetchNextResponse = null;
  installFetchMock();
}

// ── Test fixtures ────────────────────────────────────────────────────────────
function makePlayer(overrides = {}) {
  const skills = {};
  const skillNames = ['attack', 'strength', 'defence', 'hitpoints', 'mining', 'magic'];
  for (const s of skillNames) skills[s] = { xp: 0, level: 1 };
  skills.attack = { xp: 15000, level: 40 };
  skills.hitpoints = { xp: 15000, level: 40 };

  return Object.assign({
    id: 'p1',
    name: 'Thorne',
    region: 'heartlands',
    skills,
    questProgress: {
      cooks_assistant: { started: true, step: 1, complete: false },
      sheep_shearer: { started: true, step: 0, complete: true },
    },
    x: 100,
    y: 100,
    layer: 0,
  }, overrides);
}

async function main() {
// ══════════════════════════════════════════════════════════════════════════════
// 1. Bible loading
// ══════════════════════════════════════════════════════════════════════════════
section('bibles');
dialogue.loadBibles();
const npcIds = dialogue.listNpcIds();
assert('loaded 54 NPCs', npcIds.length === 54, `got ${npcIds.length}`);
const alden = dialogue.getBible('captain_alden');
assert('found captain_alden', !!alden && alden.name === 'Alden');
const kael = dialogue.getBible('smith_kael');
assert('found smith_kael', !!kael && kael.name === 'Kael');

// ══════════════════════════════════════════════════════════════════════════════
// 2. System prompt contains cadence + example lines + forbids
// ══════════════════════════════════════════════════════════════════════════════
section('system prompt shape');
const prompt = dialogue.buildSystemPrompt(alden, {
  name: 'Thorne', region: 'heartlands', totalLevel: 245, highestSkill: 'attack',
  activeQuests: ['cooks_assistant'],
}, { timeOfDay: 'day' });

// cadence included
assertContains('contains cadence line', prompt, alden.voice.cadence);
// at least 2 example_lines verbatim
const examples = alden.voice.example_lines;
assertContains('contains example_line[0]', prompt, examples[0]);
assertContains('contains example_line[1]', prompt, examples[1]);
// player context
assertContains('includes player name', prompt, 'Thorne');
assertContains('includes player region', prompt, 'heartlands');
assertContains('includes player highest skill', prompt, 'attack');
assertContains('includes active quest id', prompt, 'cooks_assistant');
// forbids
assertContains('forbids modern speech', prompt, 'No modern speech');
assertContains('forbids breaking character', prompt, 'Never break character');
assertContains('caps length', prompt, '3-4 short sentences');
// must not leak forbidden name
assertNotContains('no forbidden name "Marstead" in prompt', prompt, 'Marstead');
// uses neutral phrasing instead
assert('uses grounded design principles framing', /grounded design principles/i.test(prompt), 'prompt must include neutral "grounded design principles" phrasing');

// ══════════════════════════════════════════════════════════════════════════════
// 3. projectPlayerState
// ══════════════════════════════════════════════════════════════════════════════
section('player state projection');
const state = dialogue.projectPlayerState(makePlayer());
assertEq('name', state.name, 'Thorne');
assertEq('region', state.region, 'heartlands');
assert('totalLevel sums skills', state.totalLevel >= 80, `got ${state.totalLevel}`);
assertEq('highestSkill', state.highestSkill, 'attack');
assert('activeQuests filtered to started-not-complete', Array.isArray(state.activeQuests) && state.activeQuests.length === 1 && state.activeQuests[0] === 'cooks_assistant');

// ══════════════════════════════════════════════════════════════════════════════
// 4. availableTopics gating
// ══════════════════════════════════════════════════════════════════════════════
section('availableTopics');
const player = makePlayer();

// Alden = patrol coordinator / quest-giver / militia captain — no shop
const aldenTopics = dialogue.availableTopics('captain_alden', player);
assert('Alden has small_talk', aldenTopics.includes('small_talk'));
assert('Alden has quest', aldenTopics.includes('quest'));
assert('Alden does NOT have shop', !aldenTopics.includes('shop'));

// Hilde = general store / fence / merchant — SHOULD have shop
const hildeTopics = dialogue.availableTopics('merchant_hilde', player);
assert('Hilde has shop', hildeTopics.includes('shop'));

// Kael = smithing tutor / weapon merchant — SHOULD have training and shop
const kaelTopics = dialogue.availableTopics('smith_kael', player);
assert('Kael has training', kaelTopics.includes('training'));
assert('Kael has shop', kaelTopics.includes('shop'));

// Unknown NPC = empty
assertEq('unknown NPC → empty topics', dialogue.availableTopics('nobody_here', player).length, 0);

// ══════════════════════════════════════════════════════════════════════════════
// 5. parseOllamaText
// ══════════════════════════════════════════════════════════════════════════════
section('parseOllamaText');
const plain = dialogue.parseOllamaText('Right. Mind the south road.');
assertEq('plain text → 1 line', plain.lines.length, 1);
assertEq('plain text → 0 options', plain.options.length, 0);

const withOpts = dialogue.parseOllamaText('What is your business at the wall.\n> Ask about the patrol\n> Ask about the goblins');
assertEq('parses main line', withOpts.lines.length, 1);
assertEq('parses 2 options', withOpts.options.length, 2);
assertEq('option text stripped', withOpts.options[0], 'Ask about the patrol');

const jsonResp = dialogue.parseOllamaText(JSON.stringify({ lines: ['Mm.'], options: ['Stock.', 'Work.'] }));
assertEq('json → lines', jsonResp.lines[0], 'Mm.');
assertEq('json → options', jsonResp.options.length, 2);

// ══════════════════════════════════════════════════════════════════════════════
// 6. Caching — cold open hits cache on repeat
// ══════════════════════════════════════════════════════════════════════════════
section('cache: cold-open repeat');
resetProbeAndMock();
dialogue.clearCache();

function countChatCalls() {
  return fetchCalls.filter(c => c.url.endsWith('/api/chat')).length;
}

fetchNextResponse = makeChatResp('You are new. State your business at the wall. Right.');
const r1 = await dialogue.talk(makePlayer(), 'captain_alden');
assert('r1 lines not empty', r1.lines.length > 0);
assert('r1 not cached on first call', !r1.cached);
assertEq('chat call count after r1', countChatCalls(), 1);

// Second call, same cold open, same player region + timeBucket — should HIT cache.
const r2 = await dialogue.talk(makePlayer(), 'captain_alden');
assert('r2 is a cache hit', r2.cached === true);
assertEq('chat call count unchanged after r2', countChatCalls(), 1);

// Different topic → should miss cache and generate again.
fetchNextResponse = makeChatResp('Shop is Hilde\'s. Down the square.');
const r3 = await dialogue.talk(makePlayer(), 'captain_alden', null, 'rumors');
assert('r3 not cached', !r3.cached);
assertEq('chat call count increments', countChatCalls(), 2);

// ══════════════════════════════════════════════════════════════════════════════
// 7. cacheKeyFor stability
// ══════════════════════════════════════════════════════════════════════════════
section('cacheKeyFor stability');
const k1 = dialogue.cacheKeyFor('captain_alden', null, { region: 'heartlands', timeOfDay: 'day' });
const k2 = dialogue.cacheKeyFor('captain_alden', null, { region: 'heartlands', timeOfDay: 'day' });
assertEq('same inputs → same key', k1, k2);
const k3 = dialogue.cacheKeyFor('captain_alden', 'shop', { region: 'heartlands', timeOfDay: 'day' });
assert('different topic → different key', k1 !== k3);
const k4 = dialogue.cacheKeyFor('captain_alden', null, { region: 'moryskah', timeOfDay: 'day' });
assert('different region → different key', k1 !== k4);

// ══════════════════════════════════════════════════════════════════════════════
// 8. Fallback when Ollama unreachable
// ══════════════════════════════════════════════════════════════════════════════
section('fallback on unreachable Ollama');
dialogue.resetProbe();
dialogue.clearCache();
fetchProbeOk = false;       // /api/tags will fail
fetchNextResponse = null;
installFetchMock();

const fb = await dialogue.talk(makePlayer(), 'captain_alden');
assert('fallback returned non-empty', fb.lines.length > 0);
// Canned stock line from bible.dialogue_patterns.greeting_first
assertEq('fallback matches greeting_first', fb.lines[0], alden.dialogue_patterns.greeting_first);
assert('fallback flagged', fb.fallback === true);

// ══════════════════════════════════════════════════════════════════════════════
// 9. Command surface: /talk starts session, /bye tears it down
// ══════════════════════════════════════════════════════════════════════════════
section('commands: /talk and /bye');
// Re-enable Ollama for a clean conversation
dialogue.resetProbe();
fetchProbeOk = true;
installFetchMock();

const replyLog = [];
const fakeServer = {
  commands: {
    _registered: new Map(),
    register(name, opts) { this._registered.set(name, opts); },
    get(n) { return this._registered.get(n); },
  },
  findNpc: (id, p) => ({ id, x: p.x, y: p.y, layer: p.layer, name: 'Alden' }),
  setInputHook(fn) { this._inputHook = fn; },
  reply(player, text) { replyLog.push({ player, text }); },
};

dialogueCommands.register(fakeServer);
assert('/talk registered', fakeServer.commands.get('talk') !== undefined);
assert('/bye registered', fakeServer.commands.get('bye') !== undefined);
assert('input hook installed', typeof fakeServer._inputHook === 'function');

const p = makePlayer();
fetchNextResponse = makeChatResp('You are new. State your business at the wall. Right.');
const talkResult = await dialogueCommands.handleTalk({ findNpc: fakeServer.findNpc }, p, ['captain_alden']);
assert('session created', !!p.activeDialogue && p.activeDialogue.npcId === 'captain_alden');
assertEq('npcName stored', p.activeDialogue.npcName, 'Alden');
assert('history has NPC turn', p.activeDialogue.history.length === 1 && p.activeDialogue.history[0].role === 'npc');
assertContains('reply includes NPC name', talkResult, 'Alden:');

// ── Follow-up via hook ──
fetchNextResponse = makeChatResp('Goblins on the south road. Take their orders off the warrior. Right.');
const hookReply = await dialogueCommands.routePlayerInput({ findNpc: fakeServer.findNpc }, p, 'Tell me about the patrol.');
assertContains('hook returns NPC reply', hookReply, 'Alden:');
assertEq('history tracks 3 turns', p.activeDialogue.history.length, 3);
assertEq('middle turn is player', p.activeDialogue.history[1].role, 'player');

// History cap: push many turns.
for (let i = 0; i < 20; i++) {
  p.activeDialogue.history.push({ role: 'npc', text: `filler ${i}` });
}
// The cap is enforced when we push new turns; simulate one push to trigger trim.
p.activeDialogue.history.push({ role: 'player', text: 'last' });
// Our pushTurn helper is internal — call routePlayerInput once more to exercise it.
fetchNextResponse = makeChatResp('Mind the south road.');
await dialogueCommands.routePlayerInput({ findNpc: fakeServer.findNpc }, p, 'okay');
assert('history capped at 8', p.activeDialogue.history.length <= 8, `got ${p.activeDialogue.history.length}`);

// ── /bye tears down ──
const byeResult = await dialogueCommands.handleBye({}, p);
assertContains('/bye acknowledges', byeResult, 'step away');
assert('session removed on /bye', !p.activeDialogue);

// ── Inline 'bye' also ends session ──
p.activeDialogue = { npcId: 'captain_alden', npcName: 'Alden', startedAt: 0, history: [] };
const inlineBye = await dialogueCommands.routePlayerInput({ findNpc: fakeServer.findNpc }, p, 'bye');
assertContains('inline bye ends session', inlineBye, 'step away');
assert('session gone after inline bye', !p.activeDialogue);

// ── Walk-away ends session ──
p.activeDialogue = { npcId: 'captain_alden', npcName: 'Alden', startedAt: 0, history: [] };
const farCtx = { findNpc: () => ({ id: 'captain_alden', x: 200, y: 200, layer: 0 }) };
const walked = await dialogueCommands.routePlayerInput(farCtx, p, 'Still there?');
assertContains('walk-away warns out of earshot', walked, 'earshot');
assert('session gone after walk-away', !p.activeDialogue);

// ══════════════════════════════════════════════════════════════════════════════
// 10. Post-processing: options surface when offered
// ══════════════════════════════════════════════════════════════════════════════
section('options parsing end-to-end');
dialogue.resetProbe();
fetchProbeOk = true;
dialogue.clearCache();
installFetchMock();

fetchNextResponse = makeChatResp(
  'Friend. You look new. Tea is on the back stove.\n> Ask about lockpicks\n> Ask about the patrol fund'
);
const hildeResp = await dialogue.talk(makePlayer(), 'merchant_hilde');
assertEq('hilde lines', hildeResp.lines.length, 1);
assertEq('hilde options count', hildeResp.options.length, 2);
assertEq('first option stripped', hildeResp.options[0], 'Ask about lockpicks');

// ══════════════════════════════════════════════════════════════════════════════
// Summary
// ══════════════════════════════════════════════════════════════════════════════
const passed = results.filter(r => r.ok).length;
const failed = results.filter(r => !r.ok).length;

console.log(`\n═════════════════════════════════════════════════════════════════`);
console.log(`Tests: ${results.length}   Passed: ${passed}   Failed: ${failed}`);
console.log(`NPCs loaded: ${npcIds.length}`);
console.log(`═════════════════════════════════════════════════════════════════\n`);

if (failed > 0) {
  console.log('Failures:');
  for (const r of results.filter(x => !x.ok)) {
    console.log(`  [${r.section}] ${r.name}${r.detail ? ' — ' + r.detail : ''}`);
  }
  process.exit(1);
}

// Stop any timers so the process exits cleanly.
dialogue.stopCachePersistence();
process.exit(0);
}

main().catch(e => {
  console.error('Test harness crashed:', e);
  process.exit(2);
});
