#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// Test: Seed Salvage (burn v2 / bootscape / OpenScape / ScapifyDatSheet port)
// Run: node scripts/test-seed-salvage.js
//
// Verifies that the six files ported by branch burn-v2/seed-salvage load
// cleanly and are wired into the game's registries.
//
// 10+ assertions across:
//   - src/content/aelgard/minigames-scapified.js (4 minigames)
//   - src/content/aelgard/drop-tables-bootscape.js (10 drop tables)
//   - data/scapify-method.json
//   - data/music-regions.json
//   - data/minigame-rewards.json
//   - data/bootscape-salvage-index.json
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');

let passed = 0;
let failed = 0;
const failures = [];

function assert(cond, label) {
  if (cond) {
    passed++;
    console.log('  PASS  ' + label);
  } else {
    failed++;
    failures.push(label);
    console.error('  FAIL  ' + label);
  }
}

function section(title) {
  console.log('\n=== ' + title + ' ===');
}

// ── Pre-load engine modules ───────────────────────────────────────────────────
const mgBase = require(path.join(ROOT, 'src', 'content', 'aelgard', 'minigames.js'));
const mgAdded = require(path.join(ROOT, 'src', 'content', 'aelgard', 'minigames-scapified.js'));
const droptables = require(path.join(ROOT, 'src', 'data', 'droptables.js'));
require(path.join(ROOT, 'src', 'content', 'aelgard', 'drop-tables-bootscape.js'));
const rel = require(path.join(ROOT, 'src', 'data', 'relationships.js'));
const items = require(path.join(ROOT, 'src', 'data', 'items.js'));
const npcs = require(path.join(ROOT, 'src', 'world', 'npcs.js'));

// ── 1. Scapified minigames registered ─────────────────────────────────────────
section('Scapified minigames');

const expectedNewMinigames = ['marchlands', 'ramparts', 'deadhold', 'the_ascendancy'];
for (const id of expectedNewMinigames) {
  assert(mgBase.minigames.has(id), 'minigame registered: ' + id);
}

assert(mgBase.minigames.size >= 10, 'total minigames at least 10 (got ' + mgBase.minigames.size + ')');

const marchlands = mgBase.minigames.get('marchlands');
assert(marchlands && marchlands.type === 'pvp', 'marchlands is type=pvp');
assert(marchlands && marchlands.minPlayers === 10, 'marchlands minPlayers=10');

const ascendancy = mgBase.minigames.get('the_ascendancy');
assert(ascendancy && ascendancy.levelReqs && ascendancy.levelReqs.slayer === 60, 'the_ascendancy requires 60 Slayer');

const deadhold = mgBase.minigames.get('deadhold');
assert(deadhold && deadhold.pointCurrency === 'dread_tokens', 'deadhold currency is dread_tokens');

// ── 2. Minigame items exist ───────────────────────────────────────────────────
section('Minigame items');

const expectedItems = [
  { id: 30501, name: 'Siege mark' },
  { id: 30504, name: 'Battering ram' },
  { id: 30601, name: 'Fortification token' },
  { id: 30602, name: 'Battlement ring' },
  { id: 30701, name: 'Dread token' },
  { id: 30702, name: 'Dreadbone crossbow' },
  { id: 30801, name: 'Remnant shard' },
  { id: 30802, name: 'Tide of Ruin' },
];
for (const e of expectedItems) {
  const it = items.get(e.id);
  assert(it && it.name === e.name, 'item id ' + e.id + ' registered as "' + e.name + '"');
}

// ── 3. Minigame NPCs ──────────────────────────────────────────────────────────
section('Minigame NPCs');

const expectedNpcs = ['marchlands_marshal', 'ramparts_commander', 'deadhold_captain', 'ascendancy_arbiter'];
for (const id of expectedNpcs) {
  const def = npcs.npcDefs ? npcs.npcDefs.get(id) : null;
  assert(def !== undefined && def !== null, 'npc registered: ' + id);
}

// ── 4. Quest unlocks ──────────────────────────────────────────────────────────
section('Quest unlocks');

const expectedQuestUnlocks = ['the_war_below', 'the_last_garrison', 'shades_of_moryskah', 'ascension_trial'];
for (const id of expectedQuestUnlocks) {
  const unlock = rel.getQuestUnlocks(id);
  assert(unlock !== undefined, 'quest unlock registered: ' + id);
  assert(unlock && unlock.unlocks && unlock.unlocks.length > 0, 'quest unlock has at least one unlock: ' + id);
}

// ── 5. Drop tables ────────────────────────────────────────────────────────────
section('Bootscape drop tables');

const expectedDropTargets = ['man', 'woman', 'farmer', 'giant_rat', 'skeleton', 'unicorn', 'werewolf', 'zombie', 'pirate', 'moss_giant'];
for (const monster of expectedDropTargets) {
  assert(droptables.tables.has(monster), 'drop table registered: ' + monster);
}

// Sample a roll and make sure it either returns bones or a normal drop
function hasBonesOrBigBones(drops) {
  return drops.some(d => d.name === 'Bones' || d.name === 'Big bones' || d.name === 'Raw rat meat' || d.name === 'Unicorn horn');
}

const manDrops = droptables.roll('man');
assert(Array.isArray(manDrops) && manDrops.length > 0, 'man drop roll returned at least one item');
assert(hasBonesOrBigBones(manDrops), 'man always drops Bones');

const giantRatDrops = droptables.roll('giant_rat');
assert(giantRatDrops.some(d => d.name === 'Raw rat meat'), 'giant_rat always drops Raw rat meat');

const unicornDrops = droptables.roll('unicorn');
assert(unicornDrops.some(d => d.name === 'Unicorn horn'), 'unicorn always drops Unicorn horn');

const werewolfDrops = droptables.roll('werewolf');
assert(werewolfDrops.some(d => d.name === 'Big bones'), 'werewolf always drops Big bones');

const mossGiantDrops = droptables.roll('moss_giant');
assert(mossGiantDrops.some(d => d.name === 'Big bones'), 'moss_giant always drops Big bones');

// ── 6. JSON data files ────────────────────────────────────────────────────────
section('JSON data files');

const scapifyMethod = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'scapify-method.json'), 'utf8'));
assert(Array.isArray(scapifyMethod.steps) && scapifyMethod.steps.length === 8, 'scapify-method.json has 8 steps (got ' + (scapifyMethod.steps || []).length + ')');
assert(scapifyMethod.registered_outputs && scapifyMethod.registered_outputs.length === 4, 'scapify-method registered_outputs has 4 entries');

const musicRegions = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'music-regions.json'), 'utf8'));
const regionKeys = Object.keys(musicRegions.regions || {});
assert(regionKeys.length >= 10, 'music-regions covers at least 10 regions (got ' + regionKeys.length + ')');
assert(musicRegions.regions.heartlands.default_day === 'heartlands-main-day', 'heartlands day cue is heartlands-main-day');
assert(Object.keys(musicRegions.minigame_cues || {}).length >= 10, 'music-regions has a cue for all 10 minigames');

const mgRewards = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'minigame-rewards.json'), 'utf8'));
assert(mgRewards.totals && mgRewards.totals.minigames === 10, 'minigame-rewards totals.minigames = 10');
assert(Object.keys(mgRewards.minigames).length === 10, 'minigame-rewards has 10 minigames entries');
const totalSlots = Object.values(mgRewards.minigames).reduce((s, m) => s + (m.collection_log_slots || 0), 0);
assert(totalSlots === mgRewards.totals.collection_log_slots, 'minigame-rewards collection_log_slots totals match aggregation (' + totalSlots + ' vs ' + mgRewards.totals.collection_log_slots + ')');

const salvageIndex = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'bootscape-salvage-index.json'), 'utf8'));
assert(salvageIndex.port_summary && salvageIndex.port_summary.new_data_files === 6, 'salvage-index records 6 new data files');
assert(Array.isArray(salvageIndex.port_summary.file_list) && salvageIndex.port_summary.file_list.length === 6, 'salvage-index file_list has 6 entries');

// ── 7. Report file exists ─────────────────────────────────────────────────────
section('Report file');
assert(fs.existsSync(path.join(ROOT, 'reports', 'bootscape-salvage.md')), 'reports/bootscape-salvage.md exists');

// ── Summary ───────────────────────────────────────────────────────────────────
console.log('\n════════════════════════════════════════════════════');
console.log('PASS: ' + passed + '  FAIL: ' + failed + '  TOTAL: ' + (passed + failed));
if (failed > 0) {
  console.log('\nFailures:');
  for (const f of failures) console.log('  - ' + f);
  process.exit(1);
}
process.exit(0);
