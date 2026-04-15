#!/usr/bin/env node
// ── Smoke test for area-gate-runner ──────────────────────────────────────────
// 1. Try to travel to a quest-locked area (boneyard_wastes) — should fail
// 2. Bump the player's stats + complete the gating quest
// 3. Travel again — should succeed (or fail with only items_missing if no item)

'use strict';

require('../src/data/items');
require('../src/content/aelgard/items-expanded');
require('../src/content/aelgard/area-gates');
require('../src/content/aelgard/quest-unlocks');
require('../src/content/aelgard/training-knobs');
require('../src/content/aelgard/breakpoints');

// World layout MUST be invoked for tiles.areas to know area bounding boxes
const tiles = require('../src/world/tiles');
const worldLayout = require('../src/content/aelgard/world-layout');
worldLayout.spawnWorld();

const player = require('../src/player/player');
const rel = require('../src/data/relationships');
const runner = require('../src/engine/area-gate-runner');
const quests = require('../src/data/quests');
const questRunner = require('../src/engine/quest-runner');

function log(label, v) { console.log(`[${label}]`, typeof v === 'string' ? v : JSON.stringify(v)); }

const p = player.createPlayer(1, 'AreaTester');
log('init', { x: p.x, y: p.y, mining: player.getLevel(p, 'mining'), areas_in_tiles: tiles.areas.size });

// ── Find a quest-gated area (Boneyard Wastes — needs sand_and_secrets quest + skills + item) ─
const target = 'boneyard_wastes';
const gate = rel.getAreaGate(target);
log('gate', gate);

let r = runner.canEnter(p, target);
log('canEnter (locked)', r);
const lockedOk = !r.allowed && r.missing.length > 0;
console.log(lockedOk ? 'PASS: gate blocks fresh player' : 'FAIL: gate did not block');

// ── Try to travel — should be rejected ──
r = runner.enter(p, target);
log('enter (locked)', r);
console.log(!r.ok ? 'PASS: enter() rejected' : 'FAIL: enter() allowed locked area');

// ── Satisfy gate: register the quest, complete it, set skill levels, give item ──
// (sand_and_secrets is referenced but may not be defined as a real quest — define it minimally)
if (!quests.getQuest('sand_and_secrets')) {
  quests.define('sand_and_secrets', {
    name: 'Sand and Secrets',
    description: 'Test stub for area-gate validation',
    requirements: {},
    steps: [{ text: 'do the thing' }],
    rewards: {},
  });
}
questRunner.start(p, 'sand_and_secrets');
questRunner.complete(p, 'sand_and_secrets');
player.addXp(p, 'mining', 2500); // ~level 17, exceeds 15 req
player.addXp(p, 'firemaking', 1200); // ~level 11, exceeds 10 req

// Add the gate item
const items = require('../src/data/items');
let compass = items.get(15009) || items.find('Boneyard compass');
if (!compass) {
  // Define a stub if not present
  compass = items.define({ id: 15009, name: 'Boneyard compass', value: 1 });
}
p.inventory[0] = { id: compass.id, name: compass.name, count: 1 };

r = runner.canEnter(p, target);
log('canEnter (after prep)', r);

r = runner.enter(p, target);
log('enter (after prep)', r);
const enterOk = r.ok && p.x !== 100; // player should have moved
console.log(enterOk ? `PASS: traveled to ${r.name} at (${r.x}, ${r.y})` : 'FAIL: still cannot enter');

// ── Final: list accessible areas ──
const accessible = runner.listAccessible(p);
log('accessible after prep', accessible.map(a => a.id));
console.log(accessible.some(a => a.id === target) ? 'PASS: shows up in accessible list' : 'FAIL: missing from list');

const allOk = lockedOk && enterOk;
process.exit(allOk ? 0 : 1);
