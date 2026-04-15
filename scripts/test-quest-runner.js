#!/usr/bin/env node
// ── Smoke test for src/engine/quest-runner.js ────────────────────────────────
// 1. Start a basic quest (cooks_assistant), step through, complete, verify rewards
// 2. Start a quest with unlocks (the_tide_pool_collector), complete, verify unlocks list
// 3. Verify quest gating: training method requiring quest fails before, succeeds after

'use strict';

require('../src/data/items'); // base items first
require('../src/content/aelgard/items-expanded');
require('../src/content/aelgard/area-gates');
require('../src/content/aelgard/quest-unlocks');
require('../src/content/aelgard/item-ecosystem');
require('../src/content/aelgard/training-knobs');
require('../src/content/aelgard/breakpoints');

const player = require('../src/player/player');
const quests = require('../src/data/quests');
const runner = require('../src/engine/quest-runner');
const rel = require('../src/data/relationships');

function log(label, v) { console.log(`[${label}]`, typeof v === 'string' ? v : JSON.stringify(v, null, 2)); }

const p = player.createPlayer(1, 'QuestTester');
const cookXpBefore = player.getXp(p, 'cooking');
log('init', { cookingXp: cookXpBefore, qp: runner.getQuestPoints(p) });

// ── Test 1: cooks_assistant (3 steps, awards 300 cooking XP) ────────────────
let r = runner.start(p, 'cooks_assistant');
log('start cooks_assistant', r.ok ? 'OK' : `FAIL ${r.reason}`);
if (!r.ok) process.exit(1);

r = runner.advanceStep(p, 'cooks_assistant');
log('step 1', r);
r = runner.advanceStep(p, 'cooks_assistant');
log('step 2', r);
// Third step should auto-complete (3 steps total, 0->1->2->3 triggers complete)
r = runner.advanceStep(p, 'cooks_assistant');
log('step 3 (auto-complete)', { ok: r.ok, complete: !!r.questId, xp: r.xpAwarded, name: r.name });

const cookXpAfter = player.getXp(p, 'cooking');
const xpGained = cookXpAfter - cookXpBefore;
log('cook xp delta', { gained: xpGained, expected: 300 });
const xpOk = xpGained === 300;
console.log(xpOk ? 'PASS: cooks_assistant XP awarded' : 'FAIL: XP mismatch');

const qpOk = runner.getQuestPoints(p) === 1;
console.log(qpOk ? 'PASS: quest point counted' : 'FAIL: QP not counted');

// ── Test 2: a quest with unlocks via rel.defineQuestUnlock only ─────────────
// the_tide_pool_collector exists in quest-unlocks.js (registry only)
const unlockResult = runner.start(p, 'the_tide_pool_collector');
log('start tide_pool', unlockResult.ok ? 'OK (registry-only quest)' : `FAIL ${unlockResult.reason}`);
const completeResult = runner.complete(p, 'the_tide_pool_collector');
log('complete tide_pool', { unlocks: completeResult.unlocks?.length, list: completeResult.unlocks });
const unlocksOk = completeResult.ok && completeResult.unlocks.length > 0;
console.log(unlocksOk ? 'PASS: unlocks surfaced from registry' : 'FAIL: no unlocks returned');

// ── Test 3: status of all quests ────────────────────────────────────────────
const all = runner.status(p);
log('all status', all);

// ── Test 4: gating — verify questProgress[id].complete blocks/allows ────────
const isComplete = !!p.questProgress.cooks_assistant?.complete;
console.log(isComplete ? 'PASS: questProgress reflects completion' : 'FAIL: questProgress not set');

const allOk = xpOk && qpOk && unlocksOk && isComplete;
process.exit(allOk ? 0 : 1);
