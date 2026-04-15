#!/usr/bin/env node
// ── Smoke test for src/engine/clue-runner.js + clue-commands.js ──────────────
// 40+ assertions across:
//   - Tier canonicalisation (easy → beginner)
//   - startClue / currentStep / abandonClue
//   - attemptSolve across all 10 step types
//   - giveReward under seeded RNG (deterministic)
//   - Unique roll + collection-log integration
//   - dropClue rate derivation
//   - /clue chat command integration
//
// Seeded mulberry32 RNG is wired before each scenario so the test is stable.

'use strict';

// Load content first so the runner can see the tier catalogue + reward tables.
require('../src/data/items');
require('../src/content/aelgard/items-expanded');
require('../src/content/aelgard/treasure-trails');
require('../src/content/aelgard/clue-scrolls-expanded');

const runner = require('../src/engine/clue-runner');
const commands = require('../src/engine/commands');
const clueCommands = require('../src/engine/clue-commands');
const player = require('../src/player/player');
const trails = require('../src/content/aelgard/treasure-trails');

// Install chat commands before anyone registers a competing /dig
clueCommands.register({ commands });

let pass = 0;
let fail = 0;
let idx = 0;
function assert(cond, label) {
  idx++;
  if (cond) {
    pass++;
    console.log(`  [${String(idx).padStart(2, '0')}] PASS  ${label}`);
  } else {
    fail++;
    console.log(`  [${String(idx).padStart(2, '0')}] FAIL  ${label}`);
  }
}

function section(title) {
  console.log(`\n── ${title} ────────────────────────────────────────────────`);
}

function makePlayer(name) {
  const p = player.createPlayer(1, name || 'Clueer');
  p.activeClue = null; // ensure state reset
  return p;
}

// ─── SECTION 1: canonicalisation + tier table ────────────────────────────────
section('canonicalisation + tier table');

assert(runner.canonTier('easy') === 'beginner', 'canonTier: easy → beginner');
assert(runner.canonTier('BEGINNER') === 'beginner', 'canonTier: uppercase');
assert(runner.canonTier('master') === 'master', 'canonTier: master');
assert(runner.canonTier('legendary') == null, 'canonTier: rejects unknown');
assert(runner.normType('coordinate') === 'coord', 'normType: coordinate → coord');
assert(runner.normType('riddle') === 'cryptic', 'normType: riddle → cryptic');
assert(runner.normType('emote') === 'emote', 'normType: passthrough');
assert(Array.isArray(runner.TIERS) && runner.TIERS.length === 5, 'TIERS exposes all 5 tiers');

// ─── SECTION 2: start / currentStep / abandon ───────────────────────────────
section('start / currentStep / abandon');

{
  runner.setRng(runner.makeSeededRng(42));
  const p = makePlayer('TierTester');
  const r = runner.startClue(p, 'easy');
  assert(r.ok && p.activeClue && p.activeClue.tier === 'beginner', 'startClue: easy alias stores as beginner');
  assert(p.activeClue.steps.length === 3, 'beginner chain length = 3');
  const step = runner.currentStep(p);
  assert(step != null && step.type != null, 'currentStep returns a step');
  const twice = runner.startClue(p, 'beginner');
  assert(!twice.ok && twice.reason === 'clue_in_progress', 'cannot start a second clue');
  const gone = runner.abandonClue(p);
  assert(gone.ok && p.activeClue == null, 'abandonClue clears state');
  const nope = runner.abandonClue(p);
  assert(!nope.ok, 'abandonClue on empty returns not-ok');
}

// ─── SECTION 3: attemptSolve — coord step ────────────────────────────────────
section('attemptSolve — coord/map/sextant/hallowed/hot-cold');

{
  runner.setRng(runner.makeSeededRng(1));
  const p = makePlayer();
  p.activeClue = {
    tier: 'beginner',
    currentStep: 0,
    solved: false,
    steps: [
      { type: 'coord', x: 50, y: 60, description: 'Dig at (50, 60).' },
      { type: 'map', x: 100, y: 110, description: 'Map hint' },
      { type: 'sextant', x: 200, y: 210, description: 'Sextant puzzle' },
      { type: 'hallowed', x: 300, y: 310, description: 'Hallowed' },
      { type: 'hot-cold', x: 400, y: 410, description: 'Hot-cold' },
    ],
  };

  const wrong = runner.attemptSolve(p, { x: 0, y: 0 });
  assert(wrong.ok && wrong.solved === false, 'coord: wrong location not solved');
  const right = runner.attemptSolve(p, { x: 50, y: 60 });
  assert(right.ok && right.solved && !right.complete, 'coord: exact dig solves');
  // Map step — tolerance ±1 allowed
  p.x = 99; p.y = 111;
  const m = runner.attemptSolve(p, {});
  assert(m.ok && m.solved, 'map: ±1 tolerance solves using p.x,p.y');
  // Sextant — +/- 1 tolerance
  const sex = runner.attemptSolve(p, { x: 201, y: 210 });
  assert(sex.ok && sex.solved, 'sextant: tolerance works');
  // Hallowed — exact (well, tolerance 1)
  const hal = runner.attemptSolve(p, { x: 300, y: 311 });
  assert(hal.ok && hal.solved, 'hallowed: tolerance works');
  // Hot-cold — last step, should complete
  const hot = runner.attemptSolve(p, { x: 400, y: 410 });
  assert(hot.ok && hot.solved && hot.complete, 'hot-cold: completes the chain');
  assert(p.activeClue && p.activeClue.solved === true, 'chain-complete marks awaiting-reward');
  const re = runner.attemptSolve(p, { x: 0, y: 0 });
  assert(!re.ok && re.reason === 'awaiting_reward', 'attemptSolve rejected after completion');
}

// ─── SECTION 4: attemptSolve — anagram/cryptic/puzzle ────────────────────────
section('attemptSolve — anagram/cryptic/puzzle');

{
  const p = makePlayer();
  p.activeClue = {
    tier: 'medium',
    currentStep: 0,
    solved: false,
    steps: [
      { type: 'anagram', solution: 'Smith Kael', description: 'Anagram: ...' },
      { type: 'cryptic', solution: 'Captain Alden', description: 'Cryptic hint' },
      { type: 'puzzle', answer: 'celtic', description: 'Celtic knot' },
    ],
  };

  const wrong = runner.attemptSolve(p, { answer: 'Cookie' });
  assert(wrong.ok && !wrong.solved, 'anagram: wrong answer not solved');
  const right = runner.attemptSolve(p, { answer: 'smith kael' });
  assert(right.ok && right.solved, 'anagram: case-insensitive match');
  const cry = runner.attemptSolve(p, { answer: 'captain alden' });
  assert(cry.ok && cry.solved, 'cryptic: solved');
  const pz = runner.attemptSolve(p, { answer: 'celtic' });
  assert(pz.ok && pz.solved && pz.complete, 'puzzle: solved and chain complete');
}

// ─── SECTION 5: attemptSolve — emote/item-placement/combat ───────────────────
section('attemptSolve — emote / item-placement / combat');

{
  const p = makePlayer();
  p.x = 120; p.y = 130;
  p.activeClue = {
    tier: 'hard',
    currentStep: 0,
    solved: false,
    steps: [
      { type: 'emote', emote: 'wave', x: 120, y: 130, description: 'Wave here' },
      { type: 'item-placement', itemId: 999, x: 150, y: 160, description: 'Place item' },
      { type: 'combat', combatLevel: 140, description: 'Kill a double agent' },
    ],
  };

  const wrongEmote = runner.attemptSolve(p, { emote: 'dance' });
  assert(wrongEmote.ok && !wrongEmote.solved, 'emote: wrong emote not solved');
  const rightEmote = runner.attemptSolve(p, { emote: 'wave' });
  assert(rightEmote.ok && rightEmote.solved, 'emote: correct emote + correct tile solves');

  // Item-placement — need to be near (150,160) with item 999
  p.x = 151; p.y = 161;
  const wrongItem = runner.attemptSolve(p, { itemId: 1, x: 151, y: 161 });
  assert(wrongItem.ok && !wrongItem.solved, 'item-placement: wrong item not solved');
  const rightItem = runner.attemptSolve(p, { itemId: 999, x: 151, y: 161 });
  assert(rightItem.ok && rightItem.solved, 'item-placement: correct item + near target solves');

  // Combat — { kill: true } from combat system
  const noKill = runner.attemptSolve(p, {});
  assert(noKill.ok && !noKill.solved, 'combat: kill flag required');
  const kill = runner.attemptSolve(p, { kill: true });
  assert(kill.ok && kill.solved && kill.complete, 'combat: kill flag completes');
}

// ─── SECTION 6: giveReward — beginner tier, deterministic ────────────────────
section('giveReward — beginner tier under seeded RNG');

{
  runner.setRng(runner.makeSeededRng(2026));
  const p = makePlayer();
  const r = runner.startClue(p, 'beginner');
  assert(r.ok, 'startClue beginner (seeded)');
  // Solve all steps (don't care about content — short-circuit by marking solved)
  for (let i = 0; i < p.activeClue.steps.length; i++) {
    p.activeClue.steps[i].solved = true;
  }
  p.activeClue.currentStep = p.activeClue.steps.length;
  p.activeClue.solved = true;

  const rw = runner.giveReward(p);
  assert(rw.ok, 'giveReward ok');
  assert(rw.tier === 'beginner', 'giveReward tier echoes');
  assert(typeof rw.coins === 'number' && rw.coins >= 0, 'coins is a number');
  assert(Array.isArray(rw.items) && rw.items.length > 0, 'items array non-empty');
  assert(p.activeClue == null, 'activeClue cleared after reward');
  assert(p.cluesCompleted && p.cluesCompleted.beginner === 1, 'cluesCompleted counter ticks');
}

// ─── SECTION 7: unique roll + collection-log integration ─────────────────────
section('unique roll + collection-log integration');

{
  // Force a unique roll with a seeded RNG that picks a low value.
  const p = makePlayer();
  // Register a fake solved clue at master tier, then force uniques.
  p.activeClue = {
    tier: 'master',
    currentStep: 2,
    solved: true,
    steps: [
      { type: 'coord', solved: true, x: 0, y: 0 },
      { type: 'coord', solved: true, x: 0, y: 0 },
    ],
  };

  // Call giveReward multiple times until we see a unique — bounded trials
  // for determinism. We seed, then keep invoking fresh reward rolls.
  let gotUnique = null;
  for (let seed = 1; seed <= 60 && !gotUnique; seed++) {
    runner.setRng(runner.makeSeededRng(seed));
    const p2 = makePlayer();
    p2.activeClue = {
      tier: 'master', currentStep: 2, solved: true,
      steps: [{ type: 'coord', solved: true }, { type: 'coord', solved: true }],
    };
    const rw = runner.giveReward(p2);
    if (rw.ok && rw.uniqueRolled) { gotUnique = { rw, p2, seed }; }
  }
  assert(gotUnique != null, 'master reward table yields at least one unique within 60 seeds');
  if (gotUnique) {
    const { rw, p2 } = gotUnique;
    assert(runner.UNIQUE_ITEMS.master.has(rw.uniqueRolled.id), 'uniqueRolled is in master unique set');
    assert(p2.collectionLog && p2.collectionLog.clue_master && p2.collectionLog.clue_master.length > 0,
      'master unique registered in collectionLog.clue_master');
  }
}

// ─── SECTION 8: dropClue — rate derivation + inventory gate ──────────────────
section('dropClue — rate derivation + inventory gate');

{
  // Force-drop path: deterministic, bypasses rate roll
  runner.setRng(runner.makeSeededRng(1));
  const p = makePlayer();
  const r1 = runner.dropClue(p, 'beginner', { force: true });
  assert(r1.dropped && r1.tier === 'beginner', 'force drop of beginner scroll works');
  const hasScroll = p.inventory.some(s => s && s.id === runner.SCROLL_IDS.beginner);
  assert(hasScroll, 'scroll lands in inventory');
  const r2 = runner.dropClue(p, 'beginner', { force: true });
  assert(!r2.dropped && r2.reason === 'already_holding', 'dont double-hold same-tier scroll');

  // Rate derivation from mob level (use very low rate so it's guaranteed to hit)
  runner.setRng(() => 0); // always rolls 1
  const p3 = makePlayer();
  const r3 = runner.dropClue(p3, null, { mobLevel: 20, rate: 1 });
  assert(r3.dropped && r3.tier === 'beginner', 'mobLevel 20 → beginner tier');
  const p4 = makePlayer();
  const r4 = runner.dropClue(p4, null, { mobLevel: 100, rate: 1 });
  assert(r4.dropped && r4.tier === 'hard', 'mobLevel 100 → hard tier');
  const p5 = makePlayer();
  const r5 = runner.dropClue(p5, null, { mobLevel: 350, rate: 1 });
  assert(r5.dropped && r5.tier === 'master', 'mobLevel 350 → master tier');
  // Resource tier → medium
  const p6 = makePlayer();
  const r6 = runner.dropClue(p6, null, { resourceTier: 'rune', rate: 1 });
  assert(r6.dropped && r6.tier === 'medium', 'resourceTier rune → medium tier');
  // No drop when RNG returns >= 1
  runner.setRng(() => 0.99);
  const p7 = makePlayer();
  const r7 = runner.dropClue(p7, null, { mobLevel: 20 });
  assert(!r7.dropped, 'high roll → no drop');
}

// ─── SECTION 9: chat command integration ─────────────────────────────────────
section('chat command integration');

{
  runner.setRng(runner.makeSeededRng(77));
  const p = makePlayer();

  // The chat parser expects the bare verb (no leading slash).
  let out = commands.execute(p, 'clue status');
  assert(typeof out === 'string' && /no active clue/i.test(out), '/clue status (empty)');

  // Grant a scroll + open it
  runner.dropClue(p, 'beginner', { force: true });
  out = commands.execute(p, 'clue open beginner');
  assert(typeof out === 'string' && /open/i.test(out) && p.activeClue, '/clue open beginner begins a chain');
  // /clue hint echoes step
  out = commands.execute(p, 'clue hint');
  assert(typeof out === 'string' && /step 1/i.test(out), '/clue hint shows current step');
  // /clue abandon
  out = commands.execute(p, 'clue abandon');
  assert(typeof out === 'string' && /abandon/i.test(out) && !p.activeClue, '/clue abandon clears state');
  // /clue anagram with no clue — graceful
  out = commands.execute(p, 'clue anagram smith kael');
  assert(typeof out === 'string' && /no active/i.test(out), '/clue anagram without clue');
}

// ─── SECTION 10: trail registry integration ────────────────────────────────
section('trail registry integration');

{
  // Content should have non-empty step pools.
  assert(trails.clueSteps.get('beginner').length >= 5, 'beginner catalogue has content');
  assert(trails.clueSteps.get('medium').length >= 5, 'medium catalogue has content');
  assert(trails.clueSteps.get('hard').length >= 5, 'hard catalogue has content');
  assert(trails.clueSteps.get('elite').length >= 5, 'elite catalogue has content');
  assert(trails.clueSteps.get('master').length >= 5, 'master catalogue has content');
  // Reward tables too.
  assert(trails.rewardTables.get('beginner') != null, 'beginner reward table exists');
  assert(trails.rewardTables.get('master') != null, 'master reward table exists');
}

// ─── SECTION 11: end-to-end with content steps ──────────────────────────────
section('end-to-end — live content chain');

{
  runner.setRng(runner.makeSeededRng(5150));
  const p = makePlayer();
  const r = runner.startClue(p, 'beginner');
  assert(r.ok, 'start beginner from live content');
  // Walk through each step, feeding a hack-solver that matches the step type.
  let guard = 20;
  while (p.activeClue && !p.activeClue.solved && guard-- > 0) {
    const step = runner.currentStep(p);
    if (!step) break;
    let input;
    switch (step.type) {
      case 'coord': case 'map': case 'hot-cold': case 'hallowed': case 'sextant':
        input = { x: step.x, y: step.y }; break;
      case 'anagram': case 'cryptic':
        input = { answer: step.solution || '' }; break;
      case 'puzzle':
        input = { answer: step.answer || 'solved' }; break;
      case 'emote':
        p.x = step.x != null ? step.x : p.x;
        p.y = step.y != null ? step.y : p.y;
        input = { emote: step.emote || 'wave' }; break;
      case 'item-placement':
        input = { itemId: step.itemId, x: step.x, y: step.y }; break;
      case 'combat':
        input = { kill: true }; break;
      default:
        input = {};
    }
    const sr = runner.attemptSolve(p, input);
    if (!sr.solved) break;
  }
  assert(p.activeClue && p.activeClue.solved, 'live beginner chain solves to completion');
  const rw = runner.giveReward(p);
  assert(rw.ok && rw.tier === 'beginner', 'live reward claimed');
  assert(p.cluesCompleted.beginner >= 1, 'counter increments for live run');
}

runner.resetRng();

// ─── Report ──────────────────────────────────────────────────────────────────
console.log(`\n──────────────────────────────────────────────`);
console.log(`Assertions: ${idx} total | ${pass} pass | ${fail} fail`);
if (fail === 0) {
  console.log('ALL CLEAR');
  process.exit(0);
} else {
  console.log('FAIL');
  process.exit(1);
}
