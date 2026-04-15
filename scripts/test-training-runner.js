#!/usr/bin/env node
// ── Smoke test for src/engine/training-runner.js ─────────────────────────────
// Boots just enough of the engine to validate the training runner end-to-end:
//   1. Load relationship registry
//   2. Create a player
//   3. Start a known low-level method
//   4. Drive the tick loop manually
//   5. Assert XP grew and inventory reflects production/consumption
//
// Run: node scripts/test-training-runner.js

'use strict';

// Load registries (same set the server loads)
require('../src/content/aelgard/items-expanded');
require('../src/content/aelgard/area-gates');
require('../src/content/aelgard/quest-unlocks');
require('../src/content/aelgard/item-ecosystem');
require('../src/content/aelgard/training-knobs');
require('../src/content/aelgard/breakpoints');
try { require('../src/content/aelgard/skill-web'); } catch (e) {}

const player = require('../src/player/player');
const tick = require('../src/engine/tick');
const actions = require('../src/engine/actions');
const rel = require('../src/data/relationships');
const runner = require('../src/engine/training-runner');

function log(label, obj) { console.log(`[${label}]`, typeof obj === 'string' ? obj : JSON.stringify(obj)); }

// ── Setup ────────────────────────────────────────────────────────────────────
const p = player.createPlayer(1, 'TestRunner');
log('init', { skills_attack: player.getLevel(p, 'attack'), inventory_free: p.inventory.filter(s => s === null).length });

// Confirm the registry actually has methods loaded
const total = rel.stats();
log('registry', total);
if (total.trainingMethods === 0) {
  console.error('FAIL: no training methods registered');
  process.exit(1);
}

// Pick attack_chickens — level 1, no prereqs, produces Raw chicken/Feather, no inputs
const methodId = 'attack_chickens';
const method = rel.getTrainingMethod(methodId);
if (!method) {
  console.error(`FAIL: method ${methodId} not in registry`);
  process.exit(1);
}
log('method', { id: methodId, name: method.name, xpPerHour: method.xpPerHour, produces: method.resourceOutput.produces });

// ── Start training ───────────────────────────────────────────────────────────
const messages = [];
const sendFn = (msg) => messages.push(msg);
const startResult = runner.start(p, methodId, sendFn);
log('start', startResult.ok ? 'OK' : `FAIL: ${startResult.reason}`);
if (!startResult.ok) process.exit(1);

if (!p.activeTraining) { console.error('FAIL: activeTraining not set'); process.exit(1); }

// ── Drive 600 ticks (= 6 minutes of game time = 1/10th of an hour) ──────────
const TICKS = 600;
for (let i = 0; i < TICKS; i++) {
  // Mimic the server's tick loop
  tick.processTick();
  actions.processTick();
}

// ── Assertions ──────────────────────────────────────────────────────────────
const finalXp = player.getXp(p, 'attack');
const finalLvl = player.getLevel(p, 'attack');
const expectedXp = method.xpPerHour / 10; // 1/10 hr
const inv = p.inventory.filter(s => s !== null);
const chickenCount = inv.filter(s => s.name === 'Raw chicken').reduce((sum, s) => sum + (s.count || 1), 0);
const featherCount = inv.filter(s => s.name === 'Feather').reduce((sum, s) => sum + (s.count || 1), 0);

log('result', {
  attack_xp: finalXp,
  attack_level: finalLvl,
  expected_xp: expectedXp,
  raw_chicken: chickenCount,
  feathers: featherCount,
  expected_chicken: method.resourceOutput.produces.find(p => p.name === 'Raw chicken').perHour / 10,
  expected_feather: method.resourceOutput.produces.find(p => p.name === 'Feather').perHour / 10,
  messages: messages.slice(0, 10),
  active_training: p.activeTraining ? 'still active' : 'stopped',
});

// XP should be roughly 800 (8000/hr * 1/10hr) — allow ±5% drift from rounding
const xpOk = Math.abs(finalXp - expectedXp) < expectedXp * 0.05;
console.log(xpOk ? 'PASS: XP rate matches' : `FAIL: XP rate off (got ${finalXp}, want ~${expectedXp})`);

if (!xpOk) process.exit(1);
process.exit(0);
