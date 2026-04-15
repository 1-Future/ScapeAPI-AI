#!/usr/bin/env node
// ── Smoke test for src/engine/recipe-runner.js ───────────────────────────────
// 1. Cook shrimps (recipe with station=range)        — happy path with no station nearby = expected fail
// 2. Cook shrimps after placing a range nearby        — happy path: consumes raw, produces cooked, +30 cooking xp
// 3. Try without raw shrimps                          — expected fail
// 4. Combine: feed in ingredients for a real combo    — produces result item

'use strict';

require('../src/data/items');
require('../src/content/aelgard/items-expanded');
require('../src/content/aelgard/area-gates');
require('../src/content/aelgard/quest-unlocks');
require('../src/content/aelgard/item-ecosystem'); // for combinations
require('../src/content/aelgard/training-knobs');
require('../src/content/aelgard/breakpoints');

const items = require('../src/data/items');
const objects = require('../src/world/objects');
const player = require('../src/player/player');
const runner = require('../src/engine/recipe-runner');
const rel = require('../src/data/relationships');

function log(label, v) { console.log(`[${label}]`, typeof v === 'string' ? v : JSON.stringify(v)); }
function pass(msg) { console.log('PASS:', msg); }
function fail(msg) { console.log('FAIL:', msg); failed = true; }
let failed = false;

// ── Setup ────────────────────────────────────────────────────────────────────
const p = player.createPlayer(1, 'RecipeTester');
p.inventory[0] = { id: 220, name: 'Raw shrimps', count: 1 }; // for cook_shrimps

// ── Test 1: try to cook without a range nearby ──
let r = runner.craft(p, 'cook_shrimps');
log('cook (no station)', r);
if (!r.ok && r.reason.includes('range')) pass('rejects without station');
else fail('should have failed without station');

// ── Test 2: place a range, try again ──
objects.defineObject('range', { name: 'range', actions: ['Cook'] });
objects.placeObject('range', p.x, p.y, p.layer);
r = runner.craft(p, 'cook_shrimps');
log('cook (with station)', r);
if (r.ok && r.xpGained === 30 && p.inventory.some(s => s && s.id === 230)) {
  pass('cooked successfully, got xp + cooked shrimps');
} else fail('cook with station failed');

// ── Test 3: try again with no raw shrimps left ──
r = runner.craft(p, 'cook_shrimps');
log('cook (no input)', r);
if (!r.ok && r.reason.includes('Raw shrimps')) pass('rejects with no input');
else fail('should have failed with no input');

// ── Test 4: combination — find a defined one and try it ──
// Pick "Godsword blade" (resultId 91005) which combines 3 godsword shards
const combo = rel.getCombination(91005);
log('combo', { exists: !!combo, name: combo?.resultName, skill: combo?.skill, level: combo?.level });

if (combo) {
  const p2 = player.createPlayer(2, 'ComboTester');
  // Player needs smithing 80
  player.addXp(p2, 'smithing', 2_000_000); // way past 80
  // Give them the 3 shards
  for (const inp of combo.inputs) {
    const slot = p2.inventory.findIndex(s => s === null);
    if (slot >= 0) p2.inventory[slot] = { id: inp.id, name: inp.name, count: 1 };
  }
  // Give them an anvil
  objects.defineObject('anvil', { name: 'anvil', actions: ['Smith'] });
  objects.placeObject('anvil', p2.x, p2.y, p2.layer);

  const cr = runner.combine(p2, 91005);
  log('combine result', cr);
  if (cr.ok && cr.xpGained === 100) pass('combination produced + xp awarded');
  else fail(`combination failed: ${cr.reason || 'no xp'}`);

  const has = p2.inventory.some(s => s && s.id === 91005);
  if (has) pass('result item in inventory');
  else fail('no result item');
} else {
  console.log('SKIP: combo 91005 not in registry');
}

process.exit(failed ? 1 : 0);
