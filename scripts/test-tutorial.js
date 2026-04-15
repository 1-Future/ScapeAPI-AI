#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// Smoke test for src/engine/tutorial.js + tutorial-commands.js + content
//
// Exercises:
//   - initPlayer seeds state, idempotent on repeat
//   - currentStep / hint return the correct data
//   - advanceStep matches the correct trigger shapes
//   - rewards are applied via configured host hooks
//   - distance accumulator advances a move-5-tiles step
//   - manual steps only auto-advance on mode-select triggers
//   - completeTutorial + skip + replay lifecycles
//   - progressBar string shape
//   - /tutorial status | hint | skip | replay command output
//   - legacy-compat: old p.tutorialStep = 10 / p.tutorialComplete = true still
//     treated as "complete" by status()
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const tutorial = require('../src/engine/tutorial');
const tutorialCommands = require('../src/engine/tutorial-commands');
const commands = require('../src/engine/commands');
const stepsModule = require('../src/content/aelgard/tutorial-steps');

let pass = 0, fail = 0;
function check(cond, msg) {
  if (cond) { console.log('PASS:', msg); pass++; }
  else      { console.log('FAIL:', msg); fail++; }
}

// ── Fake host primitives ────────────────────────────────────────────────────
const xpGrants = [];        // [{ skill, amount }]
const itemGrants = [];      // [{ id, name, count, stackable }]
const ITEM_DB = {
  101: { id: 101, name: 'Coins', stackable: true },
  200: { id: 200, name: 'Logs', stackable: false },
  230: { id: 230, name: 'Shrimps', stackable: false },
  401: { id: 401, name: 'Bronze sword', stackable: false },
};

tutorial.configure({
  addXp: (p, skill, amount) => { xpGrants.push({ skill, amount }); },
  invAdd: (p, id, name, count, stackable) => {
    itemGrants.push({ id, name, count, stackable: !!stackable });
    if (!Array.isArray(p._fakeInv)) p._fakeInv = [];
    p._fakeInv.push({ id, name, count });
    return true;
  },
  getItem: (id) => ITEM_DB[id] || null,
});

function newPlayer(name) {
  return { id: 1, name, tutorialStep: undefined };
}

// Register commands against a fresh registry (commands module is a singleton;
// we just need /tutorial to be registered for the command-output tests).
tutorialCommands.register({ commands, tutorial });

// ══════════════════════════════════════════════════════════════════════════════
// 1. initPlayer
// ══════════════════════════════════════════════════════════════════════════════

{
  const p = newPlayer('Alpha');
  tutorial.initPlayer(p);
  check(p.tutorialStep === 0, 'initPlayer sets tutorialStep=0');
  check(p.tutorialComplete === false, 'initPlayer sets tutorialComplete=false');
  check(p.tutorialDistance === 0, 'initPlayer sets tutorialDistance=0');
  check(Array.isArray(p.tutorialHistory), 'initPlayer seeds tutorialHistory array');
  // Idempotent
  p.tutorialStep = 5;
  tutorial.initPlayer(p);
  check(p.tutorialStep === 5, 'initPlayer is idempotent and preserves existing step');
}

// ══════════════════════════════════════════════════════════════════════════════
// 2. Steps content sanity
// ══════════════════════════════════════════════════════════════════════════════

{
  const total = tutorial.totalSteps();
  check(total >= 30 && total <= 45, `step count ${total} is within 30-45`);
  const ids = new Set();
  let unique = true;
  for (const s of stepsModule.STEPS) {
    if (ids.has(s.id)) { unique = false; break; }
    ids.add(s.id);
  }
  check(unique, 'all step ids are unique');
  const required = ['welcome_look', 'move_5_tiles', 'chop_first_tree', 'light_first_fire',
    'cook_a_shrimp', 'fight_a_cow', 'pick_up_loot', 'check_inventory', 'open_bank',
    'first_skill_10', 'first_quest_start', 'dialogue_flow', 'grand_exchange',
    'toggle_prayer', 'combat_style', 'consider_ironman', 'consider_arealocked',
    'save_state', 'join_or_create_clan', 'open_codex'];
  const haveAll = required.every(r => ids.has(r));
  check(haveAll, 'all spec-required step ids are present');

  // Every step has id/title/hint/trigger
  let shapeOk = true;
  for (const s of stepsModule.STEPS) {
    if (!s.id || !s.title || !s.hint || !s.trigger || !s.trigger.type) { shapeOk = false; break; }
  }
  check(shapeOk, 'every step has id/title/hint/trigger');
}

// ══════════════════════════════════════════════════════════════════════════════
// 3. currentStep / hint
// ══════════════════════════════════════════════════════════════════════════════

{
  const p = tutorial.initPlayer(newPlayer('Beta'));
  const cur = tutorial.currentStep(p);
  check(cur && cur.id === 'welcome_look', 'currentStep(p) is welcome_look at step 0');
  const h = tutorial.hint(p);
  check(typeof h === 'string' && h.includes('Welcome to Aelgard'), 'hint() contains step title');
  check(h.includes('1/'), 'hint() shows 1-indexed step number');
}

// ══════════════════════════════════════════════════════════════════════════════
// 4. advanceStep by command verb
// ══════════════════════════════════════════════════════════════════════════════

{
  const p = tutorial.initPlayer(newPlayer('Gamma'));
  xpGrants.length = 0;
  const no = tutorial.advanceStep(p, { type: 'command', verb: 'attack' });
  check(!no.advanced, 'command:attack does not advance welcome_look step');
  const yes = tutorial.advanceStep(p, { type: 'command', verb: 'look' });
  check(yes.advanced, 'command:look advances welcome_look step');
  check(p.tutorialStep === 1, 'tutorialStep incremented to 1');
  check(xpGrants.some(g => g.skill === 'hitpoints' && g.amount === 25), 'welcome_look XP reward applied');
  // Alias: `l` for `look`
  const p2 = tutorial.initPlayer(newPlayer('Delta'));
  const aliased = tutorial.advanceStep(p2, { type: 'command', verb: 'l' });
  check(aliased.advanced, 'command alias `l` advances welcome_look');
}

// ══════════════════════════════════════════════════════════════════════════════
// 5. Distance accumulator
// ══════════════════════════════════════════════════════════════════════════════

{
  const p = tutorial.initPlayer(newPlayer('Epsilon'));
  p.tutorialStep = 1; // move_5_tiles
  // Move 4 tiles — should NOT advance
  for (let i = 0; i < 4; i++) tutorial.advanceStep(p, { type: 'player_move', tiles: 1 });
  check(p.tutorialStep === 1, 'move_5_tiles not advanced after 4 steps');
  check(p.tutorialDistance === 4, 'tutorialDistance tracks 4');
  // One more step — should advance
  const r = tutorial.advanceStep(p, { type: 'player_move', tiles: 1 });
  check(r.advanced === true, 'move_5_tiles advances on 5th tile');
  check(p.tutorialStep === 2, 'tutorialStep incremented to 2');
  check(p.tutorialDistance === 0, 'tutorialDistance reset after advance');
}

// ══════════════════════════════════════════════════════════════════════════════
// 6. npc_kill / tree_chopped / fire_lit / item_acquired triggers
// ══════════════════════════════════════════════════════════════════════════════

{
  const p = tutorial.initPlayer(newPlayer('Zeta'));
  // Jump directly to chop_first_tree
  p.tutorialStep = stepsModule.STEPS.findIndex(s => s.id === 'chop_first_tree');
  const chopped = tutorial.advanceStep(p, { type: 'tree_chopped' });
  check(chopped.advanced, 'tree_chopped advances chop_first_tree step');

  // After chop_first_tree => light_first_fire
  const fired = tutorial.advanceStep(p, { type: 'fire_lit' });
  check(fired.advanced, 'fire_lit advances light_first_fire step');

  // Fish/mine aliases
  const p2 = tutorial.initPlayer(newPlayer('Eta'));
  p2.tutorialStep = stepsModule.STEPS.findIndex(s => s.id === 'fish_or_mine');
  const mined = tutorial.advanceStep(p2, { type: 'command', verb: 'mine' });
  check(mined.advanced, 'command:mine advances fish_or_mine via alias');

  // cook_a_shrimp (item_acquired 230)
  const p3 = tutorial.initPlayer(newPlayer('Theta'));
  p3.tutorialStep = stepsModule.STEPS.findIndex(s => s.id === 'cook_a_shrimp');
  const cooked = tutorial.advanceStep(p3, { type: 'item_acquired', itemId: 230 });
  check(cooked.advanced, 'item_acquired(230) advances cook_a_shrimp');
  // Wrong item must not advance
  const p4 = tutorial.initPlayer(newPlayer('Iota'));
  p4.tutorialStep = stepsModule.STEPS.findIndex(s => s.id === 'cook_a_shrimp');
  const wrong = tutorial.advanceStep(p4, { type: 'item_acquired', itemId: 999 });
  check(!wrong.advanced, 'item_acquired wrong itemId does not advance');

  // Combat: fight_a_cow
  const p5 = tutorial.initPlayer(newPlayer('Kappa'));
  p5.tutorialStep = stepsModule.STEPS.findIndex(s => s.id === 'fight_a_cow');
  const killed = tutorial.advanceStep(p5, { type: 'npc_kill', name: 'Cow' });
  check(killed.advanced, 'npc_kill:Cow advances fight_a_cow (case insensitive)');
}

// ══════════════════════════════════════════════════════════════════════════════
// 7. Level and breakpoint triggers
// ══════════════════════════════════════════════════════════════════════════════

{
  const p = tutorial.initPlayer(newPlayer('Lambda'));
  p.tutorialStep = stepsModule.STEPS.findIndex(s => s.id === 'first_skill_10');
  const early = tutorial.advanceStep(p, { type: 'level', skill: 'cooking', level: 9 });
  check(!early.advanced, 'level 9 does not advance first_skill_10 (threshold 10)');
  const ok = tutorial.advanceStep(p, { type: 'level', skill: 'cooking', level: 10 });
  check(ok.advanced, 'level 10 advances first_skill_10');

  // breakpoint step
  const p2 = tutorial.initPlayer(newPlayer('Mu'));
  p2.tutorialStep = stepsModule.STEPS.findIndex(s => s.id === 'first_breakpoint');
  const bp = tutorial.advanceStep(p2, { type: 'breakpoint', key: 'skill_level:magic:55' });
  check(bp.advanced, 'breakpoint event advances first_breakpoint');
}

// ══════════════════════════════════════════════════════════════════════════════
// 8. Manual steps (ironman / arealocked mode)
// ══════════════════════════════════════════════════════════════════════════════

{
  const p = tutorial.initPlayer(newPlayer('Nu'));
  p.tutorialStep = stepsModule.STEPS.findIndex(s => s.id === 'consider_ironman');
  const noauto = tutorial.advanceStep(p, { type: 'command', verb: 'look' });
  check(!noauto.advanced, 'manual step does not advance on generic command');
  const auto = tutorial.advanceStep(p, { type: 'ironman_set' });
  check(auto.advanced, 'manual step auto-advances on ironman_set');
}

// ══════════════════════════════════════════════════════════════════════════════
// 9. Rewards are applied
// ══════════════════════════════════════════════════════════════════════════════

{
  xpGrants.length = 0;
  itemGrants.length = 0;
  const p = tutorial.initPlayer(newPlayer('Xi'));
  p.tutorialStep = stepsModule.STEPS.findIndex(s => s.id === 'check_inventory');
  tutorial.advanceStep(p, { type: 'command', verb: 'i' });
  check(itemGrants.some(g => g.id === 200 && g.count === 2), 'check_inventory grants 2 logs');
}

// Rewards suppressed during replay
{
  xpGrants.length = 0;
  const p = tutorial.initPlayer(newPlayer('Omicron'));
  tutorial.replay(p);
  check(p.tutorialReplay === true, 'replay sets tutorialReplay=true');
  const r = tutorial.advanceStep(p, { type: 'command', verb: 'look' });
  check(r.advanced && r.reward && r.reward.suppressed === true, 'replay advance suppresses rewards');
  check(!xpGrants.some(g => g.skill === 'hitpoints'), 'no XP granted on replay advance');
}

// ══════════════════════════════════════════════════════════════════════════════
// 10. Skip / complete / replay lifecycle
// ══════════════════════════════════════════════════════════════════════════════

{
  const p = tutorial.initPlayer(newPlayer('Pi'));
  const sk = tutorial.skip(p);
  check(sk.ok, 'skip() returns ok');
  check(p.tutorialComplete === true, 'skip marks tutorial complete');
  check(p.tutorialSkipped === true, 'skip marks tutorialSkipped');
  const again = tutorial.skip(p);
  check(!again.ok && again.reason === 'already_complete', 'skip is idempotent (already_complete)');

  // replay resumes from 0
  tutorial.replay(p);
  check(p.tutorialStep === 0, 'replay() resets tutorialStep to 0');
  check(p.tutorialComplete === false, 'replay() clears tutorialComplete');

  // completeTutorial directly
  const p2 = tutorial.initPlayer(newPlayer('Rho'));
  tutorial.completeTutorial(p2);
  check(p2.tutorialComplete === true, 'completeTutorial marks complete');
  check(p2.tutorialStep === tutorial.totalSteps(), 'completeTutorial sets step to total');
}

// ══════════════════════════════════════════════════════════════════════════════
// 11. Status + progress bar
// ══════════════════════════════════════════════════════════════════════════════

{
  const p = tutorial.initPlayer(newPlayer('Sigma'));
  const s0 = tutorial.status(p);
  check(s0.active === true && s0.step === 0, 'status active at step 0');
  check(s0.percent === 0, 'status percent=0 at step 0');
  // advance a few
  tutorial.advanceStep(p, { type: 'command', verb: 'look' });
  const s1 = tutorial.status(p);
  check(s1.step === 1, 'status reports step 1 after advance');
  const bar = tutorial.progressBar(p, 10);
  check(typeof bar === 'string' && bar.includes('['), 'progressBar returns bracketed string');
  // completion
  tutorial.completeTutorial(p);
  const s2 = tutorial.status(p);
  check(s2.complete === true && s2.percent === 100, 'status reports 100% on completion');
}

// ══════════════════════════════════════════════════════════════════════════════
// 12. Commands: /tutorial status | hint | skip | replay
// ══════════════════════════════════════════════════════════════════════════════

{
  const p = tutorial.initPlayer(newPlayer('Tau'));
  const out1 = commands.execute(p, 'tutorial status');
  check(typeof out1 === 'string' && out1.includes('Tutorial'), '/tutorial status prints header');
  check(out1.includes('['), '/tutorial status prints progress bar');

  const out2 = commands.execute(p, 'tutorial hint');
  check(out2.includes('Welcome to Aelgard'), '/tutorial hint prints welcome_look title');

  const out3 = commands.execute(p, 'tutorial skip');
  check(out3.includes('Tutorial Skipped'), '/tutorial skip prints skipped header');
  check(p.tutorialComplete === true, '/tutorial skip marks complete');

  const out4 = commands.execute(p, 'tutorial replay');
  check(out4.includes('Tutorial Replay'), '/tutorial replay prints replay header');
  check(p.tutorialComplete === false, '/tutorial replay resets complete');

  const out5 = commands.execute(p, 'tutorial');
  check(typeof out5 === 'string' && out5.includes('Tutorial'), 'bare /tutorial defaults to status');
}

// ══════════════════════════════════════════════════════════════════════════════
// 13. JSON round-trip preserves state
// ══════════════════════════════════════════════════════════════════════════════

{
  const p = tutorial.initPlayer(newPlayer('Upsilon'));
  tutorial.advanceStep(p, { type: 'command', verb: 'look' });
  p.tutorialDistance = 3;
  const json = JSON.stringify({
    tutorialStep: p.tutorialStep,
    tutorialComplete: p.tutorialComplete,
    tutorialDistance: p.tutorialDistance,
    tutorialHistory: p.tutorialHistory,
    tutorialSkipped: p.tutorialSkipped,
    tutorialReplay: p.tutorialReplay,
  });
  const restored = JSON.parse(json);
  check(restored.tutorialStep === p.tutorialStep, 'JSON round-trip preserves tutorialStep');
  check(restored.tutorialDistance === 3, 'JSON round-trip preserves tutorialDistance');
  check(Array.isArray(restored.tutorialHistory) && restored.tutorialHistory.length >= 1,
    'JSON round-trip preserves tutorialHistory');
}

// ══════════════════════════════════════════════════════════════════════════════
// 14. Legacy-compat
// ══════════════════════════════════════════════════════════════════════════════

{
  const p = { id: 99, name: 'LegacyPlayer', tutorialStep: 10, tutorialComplete: true };
  tutorial.initPlayer(p);
  check(p.tutorialComplete === true, 'legacy tutorialComplete=true preserved through initPlayer');
  const s = tutorial.status(p);
  check(s.complete === true, 'legacy completed player reported as complete in status()');
  check(tutorial.currentStep(p) === null, 'legacy completed player has no currentStep');
}

// ══════════════════════════════════════════════════════════════════════════════
// Summary
// ══════════════════════════════════════════════════════════════════════════════

console.log(`\n── Tutorial tests: ${pass} pass / ${fail} fail (${pass + fail} total) ──`);
if (fail > 0) process.exit(1);
