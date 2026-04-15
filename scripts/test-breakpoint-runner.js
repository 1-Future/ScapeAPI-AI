#!/usr/bin/env node
// ── Smoke test for src/engine/breakpoint-runner.js ───────────────────────────
// 1. Subscribe a listener
// 2. Train via training-runner — should emit breakpoints when crossing
// 3. Verify dedup: re-grant XP, ensure same breakpoint not re-fires
// 4. Bootstrap an existing high-level player — should record but NOT emit

'use strict';

require('../src/data/items');
require('../src/content/aelgard/items-expanded');
require('../src/content/aelgard/area-gates');
require('../src/content/aelgard/quest-unlocks');
require('../src/content/aelgard/item-ecosystem');
require('../src/content/aelgard/training-knobs');
require('../src/content/aelgard/breakpoints');

const player = require('../src/player/player');
const tick = require('../src/engine/tick');
const actions = require('../src/engine/actions');
const breakpoints = require('../src/engine/breakpoint-runner');
const trainingRunner = require('../src/engine/training-runner');
const rel = require('../src/data/relationships');

function log(label, v) { console.log(`[${label}]`, typeof v === 'string' ? v : JSON.stringify(v)); }

// Capture all events
const captured = [];
breakpoints.subscribe(ev => captured.push(ev));

// ── Test 1: prayer 43 (transformative — Eagle Eye unlock) ───────────────────
const p = player.createPlayer(1, 'BPTester');
const bps = rel.getBreakpointsForSkill('prayer');
log('prayer breakpoints', bps.map(b => `lvl ${b.trigger.level} (${b.importance})`));

// Grant exactly enough XP to hit prayer 43
const xpFor43 = require('../src/player/player').xpForLevel(43);
log('xp for prayer 43', xpFor43);
breakpoints.addXpWithBreakpoints(p, 'prayer', xpFor43);
log('prayer level after grant', player.getLevel(p, 'prayer'));
log('captured events', captured.map(e => `${e.bpKey} (${e.importance})`));

const fired43 = captured.some(e => e.bpKey === 'skill_level:prayer:43');
console.log(fired43 ? 'PASS: prayer 43 breakpoint fired' : 'FAIL: prayer 43 not fired');

// ── Test 2: dedup — grant more XP, prayer 43 should NOT re-fire ─────────────
const before = captured.length;
breakpoints.addXpWithBreakpoints(p, 'prayer', 1000);
const newEvents = captured.slice(before);
log('events after extra xp', newEvents.map(e => e.bpKey));
const noDup = !newEvents.some(e => e.bpKey === 'skill_level:prayer:43');
console.log(noDup ? 'PASS: no duplicate emission' : 'FAIL: duplicate fire');

// ── Test 3: bootstrap — high-level player on login should NOT emit ──────────
const captured2 = [];
breakpoints.subscribe(ev => captured2.push(ev));
const veteran = player.createPlayer(2, 'Veteran');
player.addXp(veteran, 'attack', 13_034_431); // level 99
breakpoints.bootstrap(veteran);
log('veteran bootstrap emitted', captured2.length);
console.log(captured2.length === 0 ? 'PASS: bootstrap silent' : 'FAIL: bootstrap emitted events');
log('veteran breakpointsHit count', Object.keys(veteran.breakpointsHit).length);

// ── Test 4: training-runner integration — running a method that grants XP ───
const t = player.createPlayer(3, 'TrainPath');
const captured3 = [];
const unsub = breakpoints.subscribe(ev => { if (ev.playerId === 3) captured3.push(ev); });

// attack_chickens at 8000 xp/hr — to hit attack 5 (steel weapons breakpoint) need 388 xp
trainingRunner.start(t, 'attack_chickens', () => {});
for (let i = 0; i < 600; i++) { tick.processTick(); actions.processTick(); } // 6 minutes = 800 xp
log('training player attack', { lvl: player.getLevel(t, 'attack'), xp: player.getXp(t, 'attack') });
log('training player events', captured3.map(e => e.bpKey));
const trainBpFired = captured3.some(e => e.bpKey === 'skill_level:attack:5');
console.log(trainBpFired ? 'PASS: training-runner emits breakpoints' : 'FAIL: no training breakpoint');
unsub();

const allOk = fired43 && noDup && captured2.length === 0 && trainBpFired;
process.exit(allOk ? 0 : 1);
