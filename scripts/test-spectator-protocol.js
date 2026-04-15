// ══════════════════════════════════════════════════════════════════════════════
// test-spectator-protocol.js — burn-v2
//
// Pure validation of WebSocket message shapes emitted by the spectator bridge
// in src/server.js. We don't need a running server for this — we import the
// `buildSpectateMessage` helper (and its siblings) and assert the returned
// objects match the documented protocol.
//
// The spectator message protocol is intentionally narrow and additive:
//   dialogue_update    — NPC/player dialogue history snapshot
//   breakpoint_hit     — transformative moment (from engine/breakpoint-runner)
//   inventory          — 28-slot grid snapshot
//   combat_achievement — task completed
//   state_snapshot     — region, minigame, death count, account mode, CA totals
//
// Run:  node scripts/test-spectator-protocol.js
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const path = require('path');

// Import the helpers. They live in src/server.js but we expose them through
// src/engine/spectate-bridge.js so this script doesn't have to boot the server.
const bridge = require(path.join(__dirname, '..', 'src', 'engine', 'spectate-bridge.js'));

// ── Tiny assertion harness ────────────────────────────────────────────────────
let passed = 0;
let failed = 0;
const failures = [];

function assert(cond, name) {
  if (cond) {
    passed++;
    console.log(`  \u2713 ${name}`);
  } else {
    failed++;
    failures.push(name);
    console.log(`  \u2717 ${name}`);
  }
}

function assertEq(actual, expected, name) {
  assert(actual === expected, `${name} (expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)})`);
}

function assertShape(obj, spec, prefix = '') {
  for (const [key, pred] of Object.entries(spec)) {
    const label = prefix ? `${prefix}.${key}` : key;
    const v = obj ? obj[key] : undefined;
    let ok = false;
    try { ok = pred(v); } catch { ok = false; }
    assert(ok, `shape: ${label}`);
  }
}

const isStr = (v) => typeof v === 'string';
const isNum = (v) => typeof v === 'number' && !Number.isNaN(v);
const isArr = (v) => Array.isArray(v);
const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const isBool = (v) => typeof v === 'boolean';
const oneOf = (arr) => (v) => arr.includes(v);

// ── Fixtures ──────────────────────────────────────────────────────────────────

function fakePlayer(overrides = {}) {
  const base = {
    id: 7,
    name: 'Testrick',
    x: 100,
    y: 50,
    layer: 0,
    hp: 80,
    maxHp: 99,
    deathCount: 3,
    accountMode: 'ironman',
    inv: [
      { id: 526, name: 'Bones', count: 2 },
      null,
      { id: 995, name: 'Coins', count: 12345 },
    ],
    activeDialogue: null,
    achievementsComplete: { ca_duran_kill: true, ca_mole_kill: true },
    activeMinigame: null,
    area: { id: 'heartlands_square', name: 'Heartlands Square' },
  };
  return Object.assign(base, overrides);
}

// ══════════════════════════════════════════════════════════════════════════════
// Suite 1 — dialogue_update shape
// ══════════════════════════════════════════════════════════════════════════════
console.log('\nSuite 1 — dialogue_update');
{
  const p = fakePlayer({
    activeDialogue: {
      npcId: 'captain_alden',
      npcName: 'Captain Alden',
      startedAt: 12345,
      history: [
        { role: 'npc', text: "You're new. State your business at the wall.", ts: 1 },
        { role: 'player', text: 'I want to help.', ts: 2 },
        { role: 'npc', text: 'Right.', ts: 3 },
      ],
    },
  });
  const msg = bridge.buildDialogueUpdate(p);
  assertEq(msg.type, 'dialogue_update', 'type is dialogue_update');
  assert(isStr(msg.playerName), 'has playerName');
  assert(isStr(msg.npcId), 'has npcId');
  assert(isStr(msg.npcName), 'has npcName');
  assert(isArr(msg.history), 'history is array');
  assert(msg.history.length === 3, 'history has 3 turns');
  assert(msg.history.every(h => isStr(h.role) && isStr(h.text)), 'every turn has role+text');
  assert(oneOf(['waiting_for_player', 'npc_thinking', 'ended'])(msg.status), 'status enum');
  assertEq(msg.status, 'waiting_for_player', 'status is waiting_for_player when last turn is npc');

  // ended shape (no active dialogue → null history)
  const q = fakePlayer();
  const endMsg = bridge.buildDialogueUpdate(q);
  assertEq(endMsg.type, 'dialogue_update', 'type is dialogue_update (ended)');
  assertEq(endMsg.status, 'ended', 'status=ended when no activeDialogue');
  assert(endMsg.history === null || (isArr(endMsg.history) && endMsg.history.length === 0), 'history empty when ended');
}

// ══════════════════════════════════════════════════════════════════════════════
// Suite 2 — breakpoint_hit shape
// ══════════════════════════════════════════════════════════════════════════════
console.log('\nSuite 2 — breakpoint_hit');
{
  const event = {
    bpKey: 'skill_level:prayer:43',
    bpType: 'skill_level',
    trigger: { skill: 'prayer', level: 43 },
    importance: 'transformative',
    description: 'Unlocked Protect from Missiles',
    unlocks: ['protect_from_missiles', 'prayer_scroll'],
    playerId: 7,
    playerName: 'Testrick',
    tick: 9999,
  };
  const msg = bridge.buildBreakpointHit(event);
  assertEq(msg.type, 'breakpoint_hit', 'type is breakpoint_hit');
  assert(oneOf(['minor', 'major', 'transformative'])(msg.importance), 'importance enum');
  assert(isStr(msg.description), 'has description');
  assert(isStr(msg.bpKey), 'has bpKey');
  assert(isArr(msg.unlocks), 'unlocks is array');
  assert(isNum(msg.tick), 'tick is number');
  assert(isNum(msg.ts), 'ts is wall-clock ms');
}

// ══════════════════════════════════════════════════════════════════════════════
// Suite 3 — inventory shape
// ══════════════════════════════════════════════════════════════════════════════
console.log('\nSuite 3 — inventory');
{
  const p = fakePlayer();
  const msg = bridge.buildInventory(p);
  assertEq(msg.type, 'inventory', 'type is inventory');
  assert(isStr(msg.playerName), 'has playerName');
  assert(isArr(msg.slots), 'slots is array');
  assertEq(msg.slots.length, 28, 'inventory has 28 slots');
  // First three slots mirror fixture
  assert(msg.slots[0] && msg.slots[0].name === 'Bones' && msg.slots[0].count === 2, 'slot 0 matches fixture');
  assert(msg.slots[1] === null, 'slot 1 empty');
  assert(msg.slots[2] && msg.slots[2].name === 'Coins' && msg.slots[2].count === 12345, 'slot 2 matches fixture');
  // Padded slots are null
  assert(msg.slots.slice(3).every(s => s === null), 'unused slots are null');
  assertEq(msg.freeSlots, 26, 'freeSlots correct');
}

// ══════════════════════════════════════════════════════════════════════════════
// Suite 4 — combat_achievement shape
// ══════════════════════════════════════════════════════════════════════════════
console.log('\nSuite 4 — combat_achievement');
{
  const msg = bridge.buildCombatAchievement({
    playerId: 7,
    playerName: 'Testrick',
    taskId: 'ca_duran_melee',
    name: 'Blacksmith Brawl',
    tier: 'easy',
  });
  assertEq(msg.type, 'combat_achievement', 'type is combat_achievement');
  assert(isStr(msg.taskId), 'has taskId');
  assert(isStr(msg.name), 'has name');
  assert(oneOf(['easy', 'medium', 'hard', 'elite', 'master', 'grandmaster'])(msg.tier), 'tier enum');
  assert(isNum(msg.ts), 'ts is number');
}

// ══════════════════════════════════════════════════════════════════════════════
// Suite 5 — state_snapshot shape (combat achievements totals, region, death, minigame)
// ══════════════════════════════════════════════════════════════════════════════
console.log('\nSuite 5 — state_snapshot');
{
  const p = fakePlayer({
    activeMinigame: { id: 'inferno', name: 'The Inferno', wave: 17 },
    area: { id: 'heartlands_square', name: 'Heartlands Square', subArea: 'Well' },
  });
  const msg = bridge.buildStateSnapshot(p);
  assertEq(msg.type, 'state_snapshot', 'type is state_snapshot');
  assert(isStr(msg.playerName), 'has playerName');
  assert(isNum(msg.deathCount), 'deathCount is number');
  assert(oneOf(['normal', 'ironman', 'hcim', 'uim', null])(msg.accountMode ?? null), 'accountMode enum/null');
  assert(isObj(msg.region), 'region object');
  assert(isStr(msg.region.name), 'region.name');
  assert(isObj(msg.ca), 'ca object');
  assert(isArr(msg.ca.tiers), 'ca.tiers array');
  assert(msg.ca.tiers.length === 6, 'ca.tiers has 6 tiers');
  assert(msg.ca.tiers.every(t => isStr(t.tier) && isNum(t.complete) && isNum(t.total)), 'ca.tier shape');
  assert(isObj(msg.minigame) || msg.minigame === null, 'minigame is object or null');
  if (msg.minigame) {
    assert(isStr(msg.minigame.id), 'minigame.id');
    assert(isStr(msg.minigame.name), 'minigame.name');
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// Suite 6 — dialogue status transitions
// ══════════════════════════════════════════════════════════════════════════════
console.log('\nSuite 6 — dialogue status transitions');
{
  // last turn = player → NPC is thinking
  const p = fakePlayer({
    activeDialogue: {
      npcId: 'captain_alden',
      npcName: 'Captain Alden',
      history: [
        { role: 'npc', text: 'Right.', ts: 1 },
        { role: 'player', text: 'Whats the news?', ts: 2 },
      ],
    },
  });
  const msg = bridge.buildDialogueUpdate(p);
  assertEq(msg.status, 'npc_thinking', 'status=npc_thinking after player speaks');

  // zero-history session is waiting_for_player (cold open)
  const q = fakePlayer({
    activeDialogue: {
      npcId: 'smith_kael', npcName: 'Kael', history: [],
    },
  });
  assertEq(bridge.buildDialogueUpdate(q).status, 'npc_thinking', 'cold-open → npc_thinking');
}

// ══════════════════════════════════════════════════════════════════════════════
// Suite 7 — history truncation
// ══════════════════════════════════════════════════════════════════════════════
console.log('\nSuite 7 — history truncation');
{
  const big = [];
  for (let i = 0; i < 20; i++) big.push({ role: i % 2 ? 'player' : 'npc', text: 'line ' + i, ts: i });
  const p = fakePlayer({ activeDialogue: { npcId: 'x', npcName: 'X', history: big } });
  const msg = bridge.buildDialogueUpdate(p);
  assert(msg.history.length <= 5, 'history capped at 5 turns in wire message');
  // Latest turn must be preserved
  assert(msg.history[msg.history.length - 1].text === 'line 19', 'latest turn preserved');
}

// ══════════════════════════════════════════════════════════════════════════════
// Suite 8 — breakpoint importance passthrough
// ══════════════════════════════════════════════════════════════════════════════
console.log('\nSuite 8 — breakpoint importance passthrough');
{
  for (const imp of ['minor', 'major', 'transformative']) {
    const m = bridge.buildBreakpointHit({
      bpKey: 'test', bpType: 'skill_level', trigger: {}, importance: imp,
      description: 'x', unlocks: [], playerId: 1, playerName: 'Q', tick: 0,
    });
    assertEq(m.importance, imp, `importance=${imp} passthrough`);
  }
  // Unknown importance falls back to minor
  const m = bridge.buildBreakpointHit({
    bpKey: 'test', bpType: 'skill_level', trigger: {}, importance: 'zomg',
    description: 'x', unlocks: [], playerId: 1, playerName: 'Q', tick: 0,
  });
  assertEq(m.importance, 'minor', 'unknown importance coerced to minor');
}

// ══════════════════════════════════════════════════════════════════════════════
// Suite 9 — inventory null handling
// ══════════════════════════════════════════════════════════════════════════════
console.log('\nSuite 9 — inventory null handling');
{
  const empty = bridge.buildInventory({ name: 'X', inv: [] });
  assertEq(empty.slots.length, 28, 'empty inv still 28 slots');
  assert(empty.slots.every(s => s === null), 'all null when empty');
  assertEq(empty.freeSlots, 28, 'freeSlots=28 when empty');

  const missing = bridge.buildInventory({ name: 'Y' }); // no .inv
  assertEq(missing.slots.length, 28, 'missing inv still 28 slots');
  assert(missing.slots.every(s => s === null), 'all null when missing');
}

// ══════════════════════════════════════════════════════════════════════════════
// Suite 10 — JSON round-trip safety (must be WebSocket-serializable)
// ══════════════════════════════════════════════════════════════════════════════
console.log('\nSuite 10 — JSON round-trip safety');
{
  const p = fakePlayer({
    activeDialogue: { npcId: 'x', npcName: 'X', history: [{ role: 'npc', text: 'hi', ts: 1 }] },
  });
  const msgs = [
    bridge.buildDialogueUpdate(p),
    bridge.buildInventory(p),
    bridge.buildStateSnapshot(p),
    bridge.buildCombatAchievement({ taskId: 'ca_duran_kill', name: 'Hammer Time', tier: 'easy', playerId: 1, playerName: 'P' }),
    bridge.buildBreakpointHit({
      bpKey: 'q', bpType: 'quest_complete', trigger: { quest: 'lost_horizon' },
      importance: 'major', description: 'done', unlocks: [], playerId: 1, playerName: 'P', tick: 1,
    }),
  ];
  for (const m of msgs) {
    const round = JSON.parse(JSON.stringify(m));
    assertEq(round.type, m.type, `${m.type} survives JSON round-trip`);
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// Report
// ══════════════════════════════════════════════════════════════════════════════
console.log('\n══════════════════════════════════════════════════════');
console.log(`  Total: ${passed + failed}   Passed: ${passed}   Failed: ${failed}`);
if (failed > 0) {
  console.log('\nFailures:');
  for (const f of failures) console.log('  -', f);
  process.exit(1);
}
console.log('  All assertions passed.');
process.exit(0);
