#!/usr/bin/env node
// ── Smoke test for src/engine/area-locked.js ─────────────────────────────────
// Exercises:
//  1. enableMode sets the player state correctly
//  2. Travel to a non-unlocked region is denied with the area-locked reason
//  3. Travel to the current region succeeds (gate requirements permitting)
//  4. Meeting the clear condition + calling clearRegion unlocks the next one
//  5. XP bonus applies when inside the current region, not outside
//  6. /areamode start | status | next | clear produce correct output
//  7. Opt-in is permanent (second enableMode call is rejected)
//  8. JSON round-trip preserves player.areaLocked

'use strict';

require('../src/data/items');
require('../src/content/aelgard/items-expanded');
require('../src/content/aelgard/area-gates');
require('../src/content/aelgard/quest-unlocks');
require('../src/content/aelgard/training-knobs');
require('../src/content/aelgard/breakpoints');

const tiles = require('../src/world/tiles');
const worldLayout = require('../src/content/aelgard/world-layout');
worldLayout.spawnWorld();

const player = require('../src/player/player');
const commands = require('../src/engine/commands');
const areaGateRunner = require('../src/engine/area-gate-runner');
const breakpoints = require('../src/engine/breakpoint-runner');
const areaLocked = require('../src/engine/area-locked');
const areaLockedCommands = require('../src/engine/area-locked-commands');
const quests = require('../src/data/quests');
const questRunner = require('../src/engine/quest-runner');

// ── Bootstrap hooks + commands ───────────────────────────────────────────────
areaLocked.attach();
areaLockedCommands.register({ commands });

function log(label, v) { console.log(`[${label}]`, typeof v === 'string' ? v : JSON.stringify(v)); }

let pass = 0, fail = 0;
function check(cond, msg) {
  if (cond) { console.log('PASS:', msg); pass++; }
  else      { console.log('FAIL:', msg); fail++; }
}

// ══════════════════════════════════════════════════════════════════════════════
// 1. enableMode
// ══════════════════════════════════════════════════════════════════════════════

const p = player.createPlayer(1, 'Locke');
check(!areaLocked.isAreaLocked(p), 'fresh player is not area-locked');

const enable = areaLocked.enableMode(p, 'heartlands');
check(enable.ok, 'enableMode succeeded for heartlands');
check(areaLocked.isAreaLocked(p), 'player.areaLocked set after enableMode');
check(p.areaLocked.mode === 'area_locked', 'mode tag is area_locked');
check(p.areaLocked.startingRegion === 'heartlands', 'starting region recorded');
check(p.areaLocked.currentRegion === 'heartlands', 'current region set');
check(Array.isArray(p.areaLocked.unlockedRegions) && p.areaLocked.unlockedRegions.includes('heartlands'),
      'unlockedRegions contains starting region');
check(!!p.areaLocked.clearStates, 'clearStates scaffolding present');
check(p.areaLocked.clearStates.heartlands, 'per-region clear state for heartlands exists');

// ══════════════════════════════════════════════════════════════════════════════
// 2. Travel to non-unlocked region is denied with area-locked reason
// ══════════════════════════════════════════════════════════════════════════════

// Outright region check
const denied = areaLocked.canEnterRegion(p, 'boneyard_wastes');
check(!denied.allowed, 'canEnterRegion denies non-unlocked region');
check(/Area-Locked/i.test(denied.reason), 'deny reason mentions Area-Locked');

// Pipe through the area-gate-runner (the actual travel entry point).
// Give the player the gate reqs so the ONLY thing left to block is area-locked.
questRunner.start(p, 'sand_and_secrets');
// sand_and_secrets isn't registered as an engine quest — mark it complete directly
// using the same shape quest-runner uses.
if (!quests.getQuest('sand_and_secrets')) {
  quests.define('sand_and_secrets', { name: 'Sand and Secrets', requirements: {}, steps: [] });
}
questRunner.complete(p, 'sand_and_secrets');
player.addXp(p, 'mining', 2500);
player.addXp(p, 'firemaking', 1200);
const items = require('../src/data/items');
let compass = items.get(15009) || items.find('Boneyard compass');
if (!compass) compass = items.define({ id: 15009, name: 'Boneyard compass', value: 1 });
p.inventory[0] = { id: compass.id, name: compass.name, count: 1 };

const gateResult = areaGateRunner.enter(p, 'boneyard_wastes');
log('gate result (locked adventurer, gate reqs met)', gateResult);
check(!gateResult.ok, 'area-gate-runner.enter denies area-locked traveller');
check(typeof gateResult.reason === 'string' && /Area-Locked/i.test(gateResult.reason),
      'enter() rejection mentions Area-Locked');

// ══════════════════════════════════════════════════════════════════════════════
// 3. Travel to unlocked (current) region succeeds (pre-check does NOT deny)
// ══════════════════════════════════════════════════════════════════════════════

// Heartlands has no gate reqs and no bounding box in tiles.areas (it's the
// un-boxed starter map), so enter() fails on "no physical bounds" — unrelated
// to area-locked. Assert at the pre-check + canEnter level instead: the
// area-locked mode should NOT be the blocker.
const canEnterCurrent = areaGateRunner.canEnter(p, 'heartlands');
log('canEnter current region', canEnterCurrent);
check(canEnterCurrent.allowed, 'area-locked does not block entry to current region');

// Pre-check should also pass for any sub-area of the current region.
const canEnterGuild = areaGateRunner.canEnter(p, 'heartlands_cooking_guild');
check(canEnterGuild.allowed === false
      ? !/Area-Locked/i.test(canEnterGuild.missing.join(' '))
      : true,
      'sub-area of current region is NOT blocked by area-locked');

// ══════════════════════════════════════════════════════════════════════════════
// 4. Meeting clear condition → clearRegion unlocks next
// ══════════════════════════════════════════════════════════════════════════════

// Heartlands: needs rfd_finale + total level 200
// Complete the quest
if (!quests.getQuest('rfd_finale')) {
  quests.define('rfd_finale', { name: 'Recipe for Disaster — Finale', requirements: {}, steps: [] });
}
questRunner.start(p, 'rfd_finale');
questRunner.complete(p, 'rfd_finale');

// Bump total level past 200. Each level = ~83 xp for level 10. Easier: give
// enough XP to bring 3 skills to level ~70 each.
for (const skill of ['attack','strength','defence','cooking','woodcutting','mining','fishing','fletching','smithing','crafting']) {
  player.addXp(p, skill, 250_000); // level ~70 each skill
}

const totalLvl = player.totalLevel(p);
log('total level after XP burst', totalLvl);
check(totalLvl >= 200, 'total level above 200 after XP burst');

const evalResult = areaLocked.evaluateClearState(p, 'heartlands');
log('evaluate heartlands', { cleared: evalResult.cleared, missing: evalResult.missing });
check(evalResult.cleared, 'clear condition met for heartlands');

const clearResult = areaLocked.clearRegion(p, 'heartlands');
log('clearRegion result', clearResult);
check(clearResult.ok, 'clearRegion succeeded');
check(clearResult.unlocked === 'sootworks', 'next region in sequence (sootworks) unlocked');
check(p.areaLocked.unlockedRegions.includes('sootworks'), 'sootworks now in unlockedRegions');
check(p.areaLocked.unlockedRegions.includes('the_wilds'), 'the_wilds unlocked after first clear');
check(p.areaLocked.currentRegion === 'sootworks', 'currentRegion advanced to sootworks');
check(p.areaLocked.clears === 1, 'clears counter bumped to 1');

// Double-clear should be rejected
const reclear = areaLocked.clearRegion(p, 'heartlands');
check(!reclear.ok && reclear.already, 'cannot re-clear a region');

// ══════════════════════════════════════════════════════════════════════════════
// 5. XP bonus applies inside current region, not outside
// ══════════════════════════════════════════════════════════════════════════════

// Place player in the sootworks area and confirm xpBonusFor returns ~1.12 (tier 1).
const bonusInCur = areaLocked.xpBonusFor(p, 'sootworks');
log('xp bonus in current region', bonusInCur);
check(bonusInCur > 1.0, 'xp bonus > 1.0 in current region');

const bonusOutside = areaLocked.xpBonusFor(p, 'heartlands');
check(bonusOutside === 1.0, 'xp bonus === 1.0 outside current region (heartlands already cleared)');

// Wire through the breakpoint-runner xp modifier. We need to place the player
// inside the sootworks area first so the position-aware hook picks up the
// right region.
const sootworksArea = tiles.areas.get('sootworks');
if (sootworksArea) {
  p.x = Math.floor((sootworksArea.x1 + sootworksArea.x2) / 2);
  p.y = Math.floor((sootworksArea.y1 + sootworksArea.y2) / 2);
  p.layer = sootworksArea.layer || 0;
}
log('player pos inside sootworks', { x: p.x, y: p.y });

// Grant a round 10000 XP via breakpoint-runner — expect the bonus to apply.
const before = player.getXp(p, 'mining');
breakpoints.addXpWithBreakpoints(p, 'mining', 10_000);
const gained = player.getXp(p, 'mining') - before;
log('xp gained with bonus (10000 base)', gained);
check(gained > 10_000, 'XP gain exceeds base 10000 inside current region');
check(gained <= 12_000 && gained >= 11_000, 'XP gain roughly 1.10-1.20x base (tier-1)');

// Move OUT of sootworks (back to heartlands — the un-boxed starter, centre
// coords per world-layout comment). currentRegion is sootworks, so the bonus
// should NOT apply while the player is standing in heartlands.
p.x = 100;
p.y = 90;
p.layer = 0;
log('player pos outside current region', { x: p.x, y: p.y,
     resolved: areaLocked.currentPlayerRegion(p) });
const beforeOut = player.getXp(p, 'mining');
breakpoints.addXpWithBreakpoints(p, 'mining', 10_000);
const gainedOut = player.getXp(p, 'mining') - beforeOut;
log('xp gained outside current region', gainedOut);
check(gainedOut === 10_000, 'XP gain unmodified outside current region');

// ══════════════════════════════════════════════════════════════════════════════
// 6. /areamode commands return correct state
// ══════════════════════════════════════════════════════════════════════════════

// We need a fresh player to test /areamode start cleanly.
const p2 = player.createPlayer(2, 'CmdTester');
const startOut = commands.execute(p2, 'areamode start sootworks');
log('/areamode start sootworks', startOut);
check(/Area-Locked/i.test(startOut), '/areamode start mentions Area-Locked');
check(areaLocked.isAreaLocked(p2), 'start command enables mode');
check(p2.areaLocked.currentRegion === 'sootworks', 'start command set currentRegion=sootworks');

const statusOut = commands.execute(p2, 'areamode status');
log('/areamode status output (snippet)', statusOut.split('\n').slice(0, 6).join(' | '));
check(/sootworks/i.test(statusOut), '/areamode status shows sootworks');
check(/xp bonus/i.test(statusOut), '/areamode status shows xp bonus line');

const nextOut = commands.execute(p2, 'areamode next');
log('/areamode next output (snippet)', nextOut.split('\n').slice(0, 3).join(' | '));
check(/sootworks_rising|Mining/i.test(nextOut), '/areamode next explains what blocks unlock');

// ══════════════════════════════════════════════════════════════════════════════
// 7. Cannot exit mode once enabled (permanent opt-in)
// ══════════════════════════════════════════════════════════════════════════════

const reenter = areaLocked.enableMode(p2, 'veilwood');
check(!reenter.ok, 'second enableMode call is rejected (permanent opt-in)');
check(/permanent|already/i.test(reenter.reason), 'rejection reason explains permanence');
check(p2.areaLocked.currentRegion === 'sootworks', 'original region unchanged after second call');

// Verify the command path also rejects
const startAgain = commands.execute(p2, 'areamode start inkweald');
check(/already/i.test(startAgain) || /permanent/i.test(startAgain),
      '/areamode start rejects re-start');

// ══════════════════════════════════════════════════════════════════════════════
// 8. JSON round-trip (save/load via the existing persistence mechanism shape)
// ══════════════════════════════════════════════════════════════════════════════

// Simulate what persistence.save + load do: JSON.stringify → parse.
// The player object contains Sets (activePrayers, e.g.); the real save layer
// handles those. For area-locked we only care that the areaLocked sub-tree
// round-trips cleanly.
const saved = JSON.parse(JSON.stringify(p.areaLocked));
log('saved.areaLocked (keys)', Object.keys(saved));
check(saved.mode === 'area_locked', 'mode survives JSON round-trip');
check(saved.startingRegion === p.areaLocked.startingRegion, 'startingRegion survives JSON');
check(saved.currentRegion === p.areaLocked.currentRegion, 'currentRegion survives JSON');
check(Array.isArray(saved.unlockedRegions) && saved.unlockedRegions.length === p.areaLocked.unlockedRegions.length,
      'unlockedRegions survives JSON');
check(!!saved.clearStates && !!saved.clearStates.heartlands && saved.clearStates.heartlands.cleared === true,
      'clearStates survives JSON (heartlands cleared flag)');
check(saved.clears === p.areaLocked.clears, 'clears counter survives JSON');

// Restore into a new player object to prove functional round-trip.
const pRestored = player.createPlayer(3, 'Restored');
pRestored.areaLocked = JSON.parse(JSON.stringify(p.areaLocked));
check(areaLocked.isAreaLocked(pRestored), 'isAreaLocked true after restore');
const statusR = areaLocked.status(pRestored);
check(statusR.clears === p.areaLocked.clears, 'restored player reports same clears count');

// ══════════════════════════════════════════════════════════════════════════════
// 9. Clear-condition coverage — every region in spec has conditions defined
// ══════════════════════════════════════════════════════════════════════════════

const expectedRegions = [
  'heartlands','sootworks','moryskah','veilwood','boneyard_wastes',
  'saltbrine_reach','inkweald','glass_desert','the_wilds',
];
for (const r of expectedRegions) {
  const c = areaLocked.clearConditions(r);
  check(!!c, `clearConditions(${r}) defined`);
}

// ══════════════════════════════════════════════════════════════════════════════
// Summary
// ══════════════════════════════════════════════════════════════════════════════
console.log(`\n── Results ── ${pass} passed, ${fail} failed ──`);
process.exit(fail === 0 ? 0 : 1);
