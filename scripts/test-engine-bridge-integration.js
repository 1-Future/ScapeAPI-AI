#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// Engine Bridge — 1000-tick integration harness
//
// Drives a single simulated player through all 5 sub-systems in one live tick
// loop, asserting:
//   1. Training drips XP + items over ticks         (~350 ticks)
//   2. Quest start → step → complete awards rewards (~3 ticks)
//   3. Area gate rejects then allows                (~2 ticks)
//   4. Recipe craft produces output + XP            (~1 tick)
//   5. Breakpoint listener fires WebSocket-style events as thresholds cross
//
// The breakpoint subscriber mimics the server's WebSocket forwarder — anything
// we capture here is what real players/spectators would see.
//
// Run: node scripts/test-engine-bridge-integration.js
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

// ── Registry loading (same set the server loads) ──────────────────────────────
require('../src/data/items');
require('../src/content/aelgard/items-expanded');
require('../src/content/aelgard/area-gates');
require('../src/content/aelgard/quest-unlocks');
require('../src/content/aelgard/item-ecosystem');
require('../src/content/aelgard/training-knobs');
require('../src/content/aelgard/breakpoints');
try { require('../src/content/aelgard/skill-web'); } catch (e) {}

// World layout so tiles.areas has bounding boxes for area-gate teleports
const tiles = require('../src/world/tiles');
const worldLayout = require('../src/content/aelgard/world-layout');
worldLayout.spawnWorld();

const player = require('../src/player/player');
const tick = require('../src/engine/tick');
const actions = require('../src/engine/actions');
const objects = require('../src/world/objects');
const items = require('../src/data/items');
const quests = require('../src/data/quests');
const rel = require('../src/data/relationships');

const trainingRunner = require('../src/engine/training-runner');
const questRunner = require('../src/engine/quest-runner');
const areaGateRunner = require('../src/engine/area-gate-runner');
const recipeRunner = require('../src/engine/recipe-runner');
const breakpoints = require('../src/engine/breakpoint-runner');

// ── Reporting ────────────────────────────────────────────────────────────────
const results = [];
let failedCount = 0;
function check(label, cond, detail) {
  results.push({ label, ok: !!cond, detail });
  if (!cond) failedCount++;
  const tag = cond ? 'PASS' : 'FAIL';
  console.log(`[${tag}] ${label}${detail ? '  ' + JSON.stringify(detail) : ''}`);
}
function log(label, obj) { console.log(`[${label}]`, typeof obj === 'string' ? obj : JSON.stringify(obj)); }

// ── Simulated WebSocket: capture breakpoint events ───────────────────────────
// Mirror the server's subscribe block — every breakpoint fire becomes a
// structured event the way a real WS client would see it.
const wsEvents = [];
const unsubscribe = breakpoints.subscribe((ev) => {
  wsEvents.push({
    t: 'breakpoint',
    importance: ev.importance,
    description: ev.description,
    unlocks: ev.unlocks,
    bpKey: ev.bpKey,
    bpType: ev.bpType,
    trigger: ev.trigger,
    tick: ev.tick,
    playerId: ev.playerId,
  });
});

// ── Setup: create a fresh player ─────────────────────────────────────────────
const p = player.createPlayer(1, 'IntegrationPlayer');
breakpoints.bootstrap(p); // silent record of level-1 breakpoints so they don't fire later
log('player init', {
  id: p.id, name: p.name,
  attack: player.getLevel(p, 'attack'),
  cooking: player.getLevel(p, 'cooking'),
  prayer: player.getLevel(p, 'prayer'),
  inv_free: p.inventory.filter(s => s === null).length,
});

// ══════════════════════════════════════════════════════════════════════════════
// PHASE 1 — Training (ticks 1..350)
// Chicken slaughter: 8000 xp/hr, 600 feathers/hr, 120 raw chicken/hr
// Over 350 ticks (~1/17 hr) we expect ~470 attack xp, ~35 feathers, ~7 chicken
// ══════════════════════════════════════════════════════════════════════════════
console.log('\n── PHASE 1: Training (350 ticks of chicken slaughter) ──');
const startResult = trainingRunner.start(p, 'attack_chickens', () => {});
check('training started', startResult.ok, { reason: startResult.reason });

const attackXpBefore = player.getXp(p, 'attack');
const featherBefore = p.inventory.filter(s => s && s.name === 'Feather')
  .reduce((sum, s) => sum + (s.count || 1), 0);

for (let i = 0; i < 350; i++) {
  tick.processTick();
  actions.processTick();
}

const attackXpAfter = player.getXp(p, 'attack');
const attackLevelAfter = player.getLevel(p, 'attack');
const featherAfter = p.inventory.filter(s => s && s.name === 'Feather')
  .reduce((sum, s) => sum + (s.count || 1), 0);
const chickenAfter = p.inventory.filter(s => s && s.name === 'Raw chicken')
  .reduce((sum, s) => sum + (s.count || 1), 0);

const xpGained = attackXpAfter - attackXpBefore;
const expectedXp = 8000 * 350 / 6000; // ~466
check('training: xp dripped (~466)',
  xpGained >= expectedXp * 0.9 && xpGained <= expectedXp * 1.1,
  { gained: xpGained, expected: Math.round(expectedXp) });

check('training: attack leveled past 1', attackLevelAfter > 1,
  { level: attackLevelAfter });

const featherGained = featherAfter - featherBefore;
check('training: feathers produced (~35)',
  featherGained >= 30 && featherGained <= 40,
  { feathers: featherGained });

check('training: raw chicken produced (~7)',
  chickenAfter >= 5 && chickenAfter <= 10,
  { chicken: chickenAfter });

// Stop training before moving on
trainingRunner.stop(p);
check('training: stopped cleanly', p.activeTraining === null);

// ══════════════════════════════════════════════════════════════════════════════
// PHASE 2 — Quest start → step → complete (cooks_assistant)
// ══════════════════════════════════════════════════════════════════════════════
console.log('\n── PHASE 2: Quest (cooks_assistant) ──');

const cookingBefore = player.getXp(p, 'cooking');
const qpBefore = questRunner.getQuestPoints(p);

const qStart = questRunner.start(p, 'cooks_assistant');
check('quest: started', qStart.ok, qStart);
tick.processTick();

const qStep1 = questRunner.advanceStep(p, 'cooks_assistant');
check('quest: advanced to step 1', qStep1.ok && qStep1.step === 1, qStep1);
tick.processTick();

const qStep2 = questRunner.advanceStep(p, 'cooks_assistant');
check('quest: advanced to step 2', qStep2.ok && qStep2.step === 2, qStep2);
tick.processTick();

const qStep3 = questRunner.advanceStep(p, 'cooks_assistant'); // auto-completes via complete()
const isComplete = !!p.questProgress.cooks_assistant?.complete;
check('quest: completed on final step',
  qStep3.ok && isComplete && qStep3.xpAwarded?.cooking === 300,
  { ok: qStep3.ok, progressComplete: isComplete, xpAwarded: qStep3.xpAwarded });

const cookingAfter = player.getXp(p, 'cooking');
const cookingGained = cookingAfter - cookingBefore;
check('quest: awarded cooking xp (300)', cookingGained === 300,
  { gained: cookingGained });

const qpAfter = questRunner.getQuestPoints(p);
check('quest: quest point awarded', qpAfter === qpBefore + 1,
  { before: qpBefore, after: qpAfter });

// Registry-only quest with unlocks
const qStart2 = questRunner.start(p, 'the_tide_pool_collector');
check('quest: registry-only quest starts', qStart2.ok, qStart2);
const qComplete2 = questRunner.complete(p, 'the_tide_pool_collector');
check('quest: registry-only quest unlocks surface',
  qComplete2.ok && qComplete2.unlocks && qComplete2.unlocks.length > 0,
  { unlocks: qComplete2.unlocks?.length });

// ══════════════════════════════════════════════════════════════════════════════
// PHASE 3 — Area gate: reject locked, allow after prep
// ══════════════════════════════════════════════════════════════════════════════
console.log('\n── PHASE 3: Area gate (boneyard_wastes) ──');

// Locked attempt
const gateCheck1 = areaGateRunner.canEnter(p, 'boneyard_wastes');
check('gate: blocks unprepared player',
  !gateCheck1.allowed && gateCheck1.missing.length > 0,
  { missing: gateCheck1.missing });

const enterLocked = areaGateRunner.enter(p, 'boneyard_wastes');
check('gate: enter() returns ok:false with reason',
  !enterLocked.ok && /missing:/.test(enterLocked.reason),
  { reason: enterLocked.reason });

// Satisfy requirements: quest, skill levels, item
if (!quests.getQuest('sand_and_secrets')) {
  quests.define('sand_and_secrets', {
    name: 'Sand and Secrets',
    description: 'Harness stub',
    requirements: {},
    steps: [{ text: 'do the thing' }],
    rewards: {},
  });
}
if (!p.questProgress.sand_and_secrets?.complete) {
  questRunner.start(p, 'sand_and_secrets');
  questRunner.complete(p, 'sand_and_secrets');
}
player.addXp(p, 'mining', 2500);     // ~level 17
player.addXp(p, 'firemaking', 1200); // ~level 11

let compass = items.get(15009) || items.find('Boneyard compass');
if (!compass) compass = items.define({ id: 15009, name: 'Boneyard compass', value: 1 });
const slot = p.inventory.findIndex(s => s === null);
p.inventory[slot] = { id: compass.id, name: compass.name, count: 1 };

const gateCheck2 = areaGateRunner.canEnter(p, 'boneyard_wastes');
check('gate: allows after all reqs met',
  gateCheck2.allowed,
  { missing: gateCheck2.missing });

const xBefore = p.x, yBefore = p.y;
const enterOk = areaGateRunner.enter(p, 'boneyard_wastes');
check('gate: enter() teleports to area centroid',
  enterOk.ok && (p.x !== xBefore || p.y !== yBefore),
  { from: [xBefore, yBefore], to: [p.x, p.y], name: enterOk.name });

tick.processTick(); // settle

// ══════════════════════════════════════════════════════════════════════════════
// PHASE 4 — Recipe crafting
// ══════════════════════════════════════════════════════════════════════════════
console.log('\n── PHASE 4: Recipe (cook_shrimps) ──');

// After the teleport the player is at the new centroid; place a range nearby
objects.defineObject('range', { name: 'range', actions: ['Cook'] });
objects.placeObject('range', p.x, p.y, p.layer);

// Need a raw shrimp in the inventory
const rawSlot = p.inventory.findIndex(s => s === null);
p.inventory[rawSlot] = { id: 220, name: 'Raw shrimps', count: 1 };

const cookResult = recipeRunner.craft(p, 'cook_shrimps');
check('recipe: cooked successfully',
  cookResult.ok && cookResult.xpGained === 30,
  { xp: cookResult.xpGained, produced: cookResult.produced });

const hasCooked = p.inventory.some(s => s && s.id === 230);
check('recipe: cooked shrimps added to inventory', hasCooked);

// Reagent combination
const combo = rel.getCombination(91005); // Godsword blade
if (combo) {
  const p2 = player.createPlayer(2, 'ComboTester');
  player.addXp(p2, 'smithing', 2_000_000);
  for (const inp of combo.inputs) {
    const s = p2.inventory.findIndex(x => x === null);
    p2.inventory[s] = { id: inp.id, name: inp.name, count: 1 };
  }
  objects.defineObject('anvil', { name: 'anvil', actions: ['Smith'] });
  objects.placeObject('anvil', p2.x, p2.y, p2.layer);

  const comboResult = recipeRunner.combine(p2, 91005);
  check('recipe: combination succeeded',
    comboResult.ok && comboResult.xpGained === 100,
    { result: comboResult.resultId, xp: comboResult.xpGained });
  check('recipe: combined item in inventory',
    p2.inventory.some(s => s && s.id === 91005));
}

// ══════════════════════════════════════════════════════════════════════════════
// PHASE 5 — Breakpoint events: large XP grant crosses thresholds
// Prayer 43 is transformative (protection prayers unlock).
// ══════════════════════════════════════════════════════════════════════════════
console.log('\n── PHASE 5: Breakpoint emission ──');

const eventsBeforePrayer = wsEvents.length;

// Grant enough prayer XP to hit the 43 breakpoint (50339 XP → L43)
breakpoints.addXpWithBreakpoints(p, 'prayer', 50339);
tick.processTick();

const prayerEvents = wsEvents.slice(eventsBeforePrayer).filter(e =>
  e.bpType === 'skill_level' && e.trigger?.skill === 'prayer');
check('breakpoint: prayer level crossings emitted',
  prayerEvents.length >= 1,
  { count: prayerEvents.length, keys: prayerEvents.map(e => e.bpKey) });

const transformative = prayerEvents.find(e => e.importance === 'transformative');
check('breakpoint: prayer 43 transformative event fired',
  !!transformative,
  transformative ? { description: transformative.description, unlocks: transformative.unlocks?.length } : null);

// Re-grant XP — should NOT re-fire
const eventsPreDedup = wsEvents.length;
breakpoints.addXpWithBreakpoints(p, 'prayer', 5000);
tick.processTick();
const newEvents = wsEvents.length - eventsPreDedup;
check('breakpoint: dedup (no re-fire on extra xp)', newEvents === 0,
  { newEvents });

// ══════════════════════════════════════════════════════════════════════════════
// PHASE 6 — Combat damage path (src/combat/combat.js)
// Proves the combat.js migration: combatXp() now routes through the breakpoint
// runner. Player on 'accurate' style gets 4 attack xp per damage. Attack 5
// breakpoint (388 xp → "steel weapons") is the first reachable threshold.
// ══════════════════════════════════════════════════════════════════════════════
console.log('\n── PHASE 6: Combat XP path (combat.combatXp) ──');

const combat = require('../src/combat/combat');

// Fresh player with no prior combat xp
const cp = player.createPlayer(3, 'CombatTester');
breakpoints.bootstrap(cp); // silent record of L1 breakpoints so they don't fire here

const eventsBeforeCombat = wsEvents.length;

// Drive 120 damage events of 10 damage each on accurate style.
// 10 dmg × 4 xp/dmg = 40 attack xp per hit × 120 hits = 4800 attack xp.
// Crosses attack 5 (388 xp, minor) and attack 20 (4470 xp, minor).
for (let i = 0; i < 120; i++) {
  combat.combatXp(cp, 10);
  tick.processTick();
}

const combatEvents = wsEvents.slice(eventsBeforeCombat).filter(e =>
  e.bpType === 'skill_level' && e.trigger?.skill === 'attack' && e.playerId === cp.id);
check('combat: attack xp routed through breakpoint runner',
  player.getXp(cp, 'attack') === 4800,
  { xp: player.getXp(cp, 'attack'), level: player.getLevel(cp, 'attack') });
check('combat: attack 5 breakpoint emitted from combat.js',
  combatEvents.some(e => e.trigger.level === 5),
  { events: combatEvents.map(e => e.bpKey) });
check('combat: attack 20 breakpoint emitted from combat.js',
  combatEvents.some(e => e.trigger.level === 20),
  { events: combatEvents.map(e => e.bpKey) });

// Aggressive style → strength xp. First strength breakpoint is L10 (max hit step-up).
cp.attackStyle = 'aggressive';
const eventsBeforeStr = wsEvents.length;
for (let i = 0; i < 30; i++) combat.combatXp(cp, 10);
const strEvents = wsEvents.slice(eventsBeforeStr).filter(e =>
  e.bpType === 'skill_level' && e.trigger?.skill === 'strength' && e.playerId === cp.id);
check('combat: strength 10 breakpoint fires from combat.js',
  strEvents.some(e => e.trigger.level === 10),
  { events: strEvents.map(e => e.bpKey) });

// ══════════════════════════════════════════════════════════════════════════════
// PHASE 7 — commands/all.js bury path crosses prayer 43 (transformative)
// Registers the full all.js command set against a minimal ctx, then executes
// `bury dragon bones` enough times to push prayer XP past the L43 threshold.
// ══════════════════════════════════════════════════════════════════════════════
console.log('\n── PHASE 7: commands/all.js bury → prayer 43 ──');

const cmdEngine = require('../src/engine/commands');
const cmdPlayer = require('../src/player/player');
const cmdTick = require('../src/engine/tick');
const cmdActions = require('../src/engine/actions');

// Use the real events module — all.js registers with events.on(event, id, fn)
// which is a 3-arg signature specific to src/engine/events.js, not Node's EE.
const gameEvents = require('../src/engine/events');
const ctx = {
  players: new Map(),
  playersByName: new Map(),
  groundItems: [],
  tick: cmdTick,
  events: gameEvents,
  persistence: { save: () => {}, saveQueued: () => {} },
  tiles,
  walls: { get: () => null },
  npcs: { spawn: () => null, despawn: () => {}, list: () => [], find: () => null, get: () => null, all: () => [] },
  objects,
  pathfinding: { findPath: () => [] },
  combat,
  actions: cmdActions,
  getLevel: cmdPlayer.getLevel,
  getXp: cmdPlayer.getXp,
  addXp: cmdPlayer.addXp, // the wrapper inside registerAll re-declares this
  totalLevel: cmdPlayer.totalLevel || (() => 0),
  combatLevel: cmdPlayer.combatLevel || (() => 3),
  getBoostedLevel: cmdPlayer.getBoostedLevel || cmdPlayer.getLevel,
  calcWeight: () => {},
  invAdd: cmdPlayer.invAdd,
  invRemove: cmdPlayer.invRemove,
  invCount: cmdPlayer.invCount,
  invFreeSlots: cmdPlayer.invFreeSlots || (() => 28),
  send: () => {},
  sendText: () => {},
  broadcast: () => {},
  findPlayer: () => null,
  nextItemId: () => Date.now(),
  getLevelUpMessage: () => '',
  clans: { get: () => null, list: () => [] },
};

let registerOk = false;
try {
  require('../src/commands/all')(ctx);
  registerOk = true;
} catch (e) {
  console.log('[all.js register] error:', e.message);
}
check('bury path: commands/all.js registers against minimal ctx', registerOk);

// Set player prayer xp just below the L43 threshold (50339).
// Dragon bones = 72 XP per bury. 50339 - 72 = 50267 puts us one bury short of 43.
cp.skills.prayer.xp = 50267;
cp.skills.prayer.level = cmdPlayer.getLevel(cp, 'prayer'); // recompute from xp
cp.inventory[0] = { id: 107, name: 'Dragon bones', count: 1 };

const eventsBeforeBury = wsEvents.length;
const buryResult = cmdEngine.execute(cp, 'bury bones');
check('bury path: command returned a message',
  typeof buryResult === 'string' && buryResult.length > 0,
  { result: buryResult.slice(0, 80) });

const prayerBuryEvents = wsEvents.slice(eventsBeforeBury).filter(e =>
  e.bpType === 'skill_level' && e.trigger?.skill === 'prayer' && e.playerId === cp.id);
check('bury path: prayer breakpoint emitted via all.js wrapped addXp',
  prayerBuryEvents.length >= 1,
  { events: prayerBuryEvents.map(e => `${e.bpKey}:${e.importance}`) });

const prayer43 = prayerBuryEvents.find(e => e.trigger.level === 43);
check('bury path: prayer 43 transformative event fired through bury command',
  !!prayer43 && prayer43.importance === 'transformative',
  prayer43 ? { description: prayer43.description } : null);

// ── Use the remainder of the tick budget actually ticking the loop ──
// (Fill to 1000 ticks total.)
console.log('\n── Padding ticks to reach 1000 ──');
const ticksSoFar = tick.getTick();
const padding = Math.max(0, 1000 - ticksSoFar);
for (let i = 0; i < padding; i++) {
  tick.processTick();
  actions.processTick();
}
log('final tick', { tick: tick.getTick(), padded: padding });

// ── Summary ──────────────────────────────────────────────────────────────────
console.log('\n══════ SUMMARY ══════');
console.log(`${results.length - failedCount}/${results.length} checks passed`);
console.log(`WebSocket events captured: ${wsEvents.length}`);
console.log(`Final state: attack ${player.getLevel(p, 'attack')}, prayer ${player.getLevel(p, 'prayer')}, cooking ${player.getLevel(p, 'cooking')}, QP ${questRunner.getQuestPoints(p)}`);
console.log(`Breakpoints recorded: ${Object.keys(p.breakpointsHit || {}).length}`);

unsubscribe();

if (failedCount > 0) {
  console.log(`\nFAILED: ${failedCount} check(s)`);
  for (const r of results.filter(r => !r.ok)) {
    console.log('  - ' + r.label + (r.detail ? ' ' + JSON.stringify(r.detail) : ''));
  }
  process.exit(1);
}
console.log('\nALL CHECKS PASSED');
process.exit(0);
