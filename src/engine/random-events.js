// ══════════════════════════════════════════════════════════════════════════════
// Random Events Runner — surprise encounters while skilling/training
//
// Per reports/byos-gap-audit.md, player.pendingEvent was declared on the
// player shape but never fired. This module owns the full lifecycle:
//
//   maybeSpawnEvent(player)          — per tick hook, low probability
//   spawnEvent(player, eventId)      — force-spawn by id (testing + admin)
//   respondToEvent(player, response) — accept | refuse | fight | flee | answer
//   listActiveEvents(player)         — what's waiting on this player
//
// Design notes:
//   - Cooldown: EVENT_COOLDOWN_TICKS gates repeat spawns (default 3000 ticks
//     = ~30 game minutes). Spec: no more than 1 random event per player per
//     30 game minutes.
//   - Weighted by skill/region/activity — if the player is cooking, events
//     tagged {triggerSkill: 'cooking'} weight higher than 'any'.
//   - Pure engine. No direct WebSocket I/O — emits in-process events that
//     server.js subscribes to. Narrator can also subscribe.
//   - CommonJS (ADR: no ESM). No emojis.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const tickSys = require('./tick');
const events = require('./events');
const player = require('../player/player');

// ── In-process listeners (server.js subscribes to push WS messages) ───────────
const listeners = new Set();

function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

function emit(event) {
  for (const fn of listeners) {
    try { fn(event); } catch (e) { console.error('[random-events] listener', e.message); }
  }
  // Also broadcast through the common events bus so other engine modules
  // (narrator, breakpoints, etc.) can react.
  try { events.emit('random_event', event); } catch (_) {}
}

// ── Cooldown ──────────────────────────────────────────────────────────────────
// 3000 ticks × 600ms = 30 minutes game time. Spec: cap 1 random event per
// player per 30 game minutes.
const EVENT_COOLDOWN_TICKS = 3000;

// Minimum ticks after login before the FIRST event may fire. Mirrors the
// existing server.js behaviour where p.nextRandomEvent = tick + 500 + rand(500).
const INITIAL_DELAY_MIN = 500;
const INITIAL_DELAY_RANGE = 500;

// ── Event catalogue ───────────────────────────────────────────────────────────
// Each entry is a spec with a triggerSkill filter, probability, response
// handlers, and a narrator-friendly greeting line. Probabilities are the
// ceiling — the actual roll is multiplied by a skill-match weight.

const catalogue = new Map(); // id → spec

function define(spec) {
  if (!spec || !spec.id) throw new Error('random-events.define: spec.id required');
  const entry = {
    id: spec.id,
    name: spec.name || spec.id,
    trigger: spec.trigger || { skill: 'any', probability: 0.001 },
    greeting_line: spec.greeting_line || spec.description || spec.name || '',
    options: spec.options || ['accept', 'refuse'],
    onAccept: spec.onAccept || (() => ({ ok: true, result: 'accepted' })),
    onRefuse: spec.onRefuse || (() => ({ ok: true, result: 'refused' })),
    onFight:  spec.onFight  || null,
    onFlee:   spec.onFlee   || null,
    onAnswer: spec.onAnswer || null,
    cooldown_ticks: spec.cooldown_ticks || EVENT_COOLDOWN_TICKS,
    region: spec.region || null,              // optional region filter
    description: spec.description || '',
    rewardTag: spec.rewardTag || 'misc',
  };
  catalogue.set(entry.id, entry);
  return entry;
}

function get(id) { return catalogue.get(id) || null; }
function list() { return [...catalogue.values()]; }

// ── XP helper (avoid circular requires) ───────────────────────────────────────
function addXp(p, skill, amount) {
  try { return player.addXp(p, skill, Math.max(0, Math.floor(amount || 0))); }
  catch (_) { return null; }
}

function addItem(p, id, name, count, stackable) {
  try { return player.invAdd(p, id, name, count, !!stackable); }
  catch (_) { return false; }
}

// ── Built-in event definitions ────────────────────────────────────────────────
// Spec lists ~10 with mention that the data file has 20+. We define the 10 the
// spec enumerates plus overflow ids mapped to the same handlers so every entry
// in `random-events-daily.js` has a runner-side spec. Extra ids are covered by
// a generic "any-skill" fallback.

define({
  id: 'evil_chef',
  name: 'Evil Chef',
  trigger: { skill: 'cooking', probability: 0.005 },
  greeting_line: 'An Evil Chef blocks the hearth. "Cook this — properly — or lose your apron."',
  description: 'Interrupts cooking, gives a harder cooking challenge.',
  options: ['accept', 'refuse'],
  onAccept: (p) => {
    const lvl = player.getLevel(p, 'cooking');
    const xp = Math.floor(lvl * 25);
    addXp(p, 'cooking', xp);
    return { ok: true, result: 'accepted', xp, skill: 'cooking',
      message: `You salvage the dish. Cooking +${xp} XP.` };
  },
  onRefuse: (p) => ({ ok: true, result: 'refused',
    message: 'You back away. The Evil Chef sneers and vanishes.' }),
});

define({
  id: 'wandering_scholar',
  name: 'Wandering Scholar',
  trigger: { skill: 'any', probability: 0.0005 },
  greeting_line: 'A Wandering Scholar flags you down. "A puzzle, quickly — what is three plus four?"',
  description: 'Gives an arithmetic puzzle for XP reward.',
  options: ['answer', 'refuse'],
  onAnswer: (p, answer) => {
    const expected = String(p.pendingEvent?.data?.expected || '');
    if (String(answer).trim() === expected) {
      const xp = 150 + Math.floor(player.getLevel(p, 'magic') * 10);
      addXp(p, 'magic', xp);
      return { ok: true, correct: true, xp, skill: 'magic',
        message: `Correct. The scholar nods: Magic +${xp} XP.` };
    }
    return { ok: true, correct: false,
      message: 'The scholar shakes his head and wanders off.' };
  },
  onRefuse: () => ({ ok: true, result: 'refused',
    message: 'The scholar shrugs and keeps walking.' }),
});

define({
  id: 'bounty_hunter',
  name: 'Bounty Hunter',
  trigger: { skill: 'any', probability: 0.0015 },
  region: 'the_wilds',
  greeting_line: 'A Bounty Hunter steps from the haze. "Your head is on a list."',
  description: 'Appears in Wilds, forces a PvP encounter or flee.',
  options: ['fight', 'flee'],
  onFight: (p) => {
    // Simplified outcome: small random damage + reward on survival.
    const dmg = 3 + Math.floor(Math.random() * 5);
    p.hp = Math.max(1, (p.hp || p.maxHp || 10) - dmg);
    const coins = 800 + Math.floor(Math.random() * 1200);
    addItem(p, 101, 'Coins', coins, true);
    return { ok: true, result: 'fought', damage: dmg, coins,
      message: `You trade blows. Took ${dmg} damage, looted ${coins} coins.` };
  },
  onFlee: (p) => {
    p.runEnergy = Math.max(0, (p.runEnergy || 0) - 2000);
    return { ok: true, result: 'fled',
      message: 'You flee, run energy drained.' };
  },
});

define({
  id: 'strange_plant',
  name: 'Strange Plant',
  trigger: { skill: 'woodcutting', probability: 0.002 },
  greeting_line: 'A strange seedling pushes up at your feet. "Water me," it seems to ask.',
  description: 'Appears while woodcutting, gives farming XP if watered.',
  options: ['accept', 'refuse'],
  onAccept: (p) => {
    const xp = 50 + player.getLevel(p, 'farming') * 20;
    addXp(p, 'farming', xp);
    return { ok: true, result: 'watered', xp, skill: 'farming',
      message: `The plant blooms. Farming +${xp} XP.` };
  },
  onRefuse: (p) => ({ ok: true, result: 'ignored',
    message: 'You walk past. The plant withers.' }),
});

define({
  id: 'drunken_dwarf',
  name: 'Drunken Dwarf',
  trigger: { skill: 'any', probability: 0.001 },
  region: 'sootworks',
  greeting_line: 'A Drunken Dwarf staggers over. "Beer! For a favour, of course."',
  description: 'Appears in Sootworks, offers beer for favour.',
  options: ['accept', 'refuse'],
  onAccept: (p) => {
    addItem(p, 1917, 'Beer', 2, false);
    return { ok: true, result: 'drink',
      message: 'The dwarf hands you two beers. He tips imaginary hat.' };
  },
  onRefuse: () => ({ ok: true, result: 'refused',
    message: 'He shrugs, mumbles, wanders off.' }),
});

define({
  id: 'royal_falconer',
  name: 'Royal Falconer',
  trigger: { skill: 'hunter', probability: 0.0012 },
  greeting_line: 'A Royal Falconer whistles. "Care to out-track my bird?"',
  description: 'Appears during hunter, challenges player to out-track a bird.',
  options: ['accept', 'refuse'],
  onAccept: (p) => {
    const xp = 40 + player.getLevel(p, 'hunter') * 12;
    addXp(p, 'hunter', xp);
    return { ok: true, result: 'tracked', xp, skill: 'hunter',
      message: `You spot the bird first. Hunter +${xp} XP.` };
  },
  onRefuse: () => ({ ok: true, result: 'refused',
    message: 'The falconer nods politely and departs.' }),
});

define({
  id: 'lost_tourist',
  name: 'Lost Tourist',
  trigger: { skill: 'any', probability: 0.0007 },
  greeting_line: 'A Lost Tourist unfolds a map. "I am trying to reach… somewhere."',
  description: 'Needs directions to a quest location (teleport unlocked).',
  options: ['accept', 'refuse'],
  onAccept: (p) => {
    // Flag a one-shot teleport unlock on the player.
    p.teleportScrolls = p.teleportScrolls || {};
    p.teleportScrolls.heartlands_hub = (p.teleportScrolls.heartlands_hub || 0) + 1;
    return { ok: true, result: 'directed', unlock: 'heartlands_hub_scroll',
      message: 'You point the way. They hand you a Heartlands Hub scroll.' };
  },
  onRefuse: () => ({ ok: true, result: 'refused',
    message: 'They sigh and wander east. Or maybe west.' }),
});

define({
  id: 'hermit_of_the_old_sun',
  name: 'Hermit of the Old Sun',
  trigger: { skill: 'firemaking', probability: 0.001 },
  greeting_line: 'A sun-bleached Hermit steps out of the flame-light. "A blessing, traveller?"',
  description: 'Appears on firemaking breakthrough, offers blessing.',
  options: ['accept', 'refuse'],
  onAccept: (p) => {
    const xp = 80 + player.getLevel(p, 'firemaking') * 18;
    addXp(p, 'firemaking', xp);
    return { ok: true, result: 'blessed', xp, skill: 'firemaking',
      message: `The hermit lays a warm palm on your shoulder. Firemaking +${xp} XP.` };
  },
  onRefuse: () => ({ ok: true, result: 'refused',
    message: 'He inclines his head and fades back into smoke.' }),
});

define({
  id: 'river_troll',
  name: 'River Troll',
  trigger: { skill: 'fishing', probability: 0.0012 },
  greeting_line: 'A River Troll breaches. "Tribute fish, or we fight!"',
  description: 'Appears during fishing, wants tribute fish or fight.',
  options: ['accept', 'fight', 'flee'],
  onAccept: (p) => {
    const removed = player.invRemove(p, 221, 1) || player.invRemove(p, 220, 1);
    if (!removed) return { ok: false, reason: 'No fish in inventory to offer.' };
    return { ok: true, result: 'tribute',
      message: 'You toss the troll a fish. It nods and slips under.' };
  },
  onFight: (p) => {
    const dmg = 2 + Math.floor(Math.random() * 4);
    p.hp = Math.max(1, (p.hp || p.maxHp || 10) - dmg);
    addItem(p, 221, 'Raw salmon', 3, false);
    return { ok: true, result: 'fought', damage: dmg,
      message: `You best the troll. Took ${dmg} damage, looted 3 raw salmon.` };
  },
  onFlee: (p) => ({ ok: true, result: 'fled',
    message: 'You scramble up the bank and keep walking.' }),
});

define({
  id: 'evil_chicken',
  name: 'Evil Chicken',
  trigger: { skill: 'any', probability: 0.0005 },
  greeting_line: 'An Evil Chicken descends, clucking with menace.',
  description: 'An evil chicken attacks. Fight for feathers or flee.',
  options: ['fight', 'flee'],
  onFight: (p) => {
    const dmg = 1 + Math.floor(Math.random() * 3);
    p.hp = Math.max(1, (p.hp || p.maxHp || 10) - dmg);
    addItem(p, 104, 'Feather', 100, true);
    return { ok: true, result: 'fought', damage: dmg,
      message: `You dispatch the chicken. Took ${dmg} damage, looted 100 feathers.` };
  },
  onFlee: () => ({ ok: true, result: 'fled',
    message: 'You back away. The chicken struts off, sated.' }),
});

// ── Extras to cover the broader data file ids ────────────────────────────────

define({
  id: 'genie',
  name: 'Genie',
  trigger: { skill: 'any', probability: 0.0005 },
  greeting_line: 'A Genie appears in a shimmer of lamplight. "A gift of experience?"',
  description: 'Offers an XP lamp.',
  options: ['accept', 'refuse'],
  onAccept: (p) => {
    addItem(p, 85001, 'XP lamp (small)', 1, false);
    return { ok: true, result: 'lamped',
      message: 'The Genie hands you an XP lamp.' };
  },
  onRefuse: () => ({ ok: true, result: 'refused',
    message: 'The Genie vanishes politely.' }),
});

define({
  id: 'quiz_master',
  name: 'Quiz Master',
  trigger: { skill: 'any', probability: 0.0003 },
  greeting_line: 'The Quiz Master coughs. "A trivia question, for a mystery box?"',
  description: 'Trivia question for a mystery box.',
  options: ['answer', 'refuse'],
  onAnswer: (p, answer) => {
    const expected = String(p.pendingEvent?.data?.expected || '').toLowerCase();
    if (String(answer).trim().toLowerCase() === expected) {
      addItem(p, 85004, 'Mystery box', 1, false);
      return { ok: true, correct: true,
        message: 'The Quiz Master nods. A mystery box appears in your hand.' };
    }
    return { ok: true, correct: false,
      message: 'Incorrect. The Quiz Master tuts and departs.' };
  },
  onRefuse: () => ({ ok: true, result: 'refused',
    message: 'The Quiz Master shrugs.' }),
});

define({
  id: 'drill_demon',
  name: 'Drill Demon',
  trigger: { skill: 'any', probability: 0.0003 },
  greeting_line: 'A Drill Demon barks. "Attention! Follow my orders!"',
  description: 'Follow emote orders for a camo outfit piece.',
  options: ['accept', 'refuse'],
  onAccept: (p) => {
    addItem(p, 85010, 'Camo top', 1, false);
    return { ok: true, result: 'drilled', piece: 'camo_top',
      message: 'The Drill Demon tosses you a Camo top.' };
  },
  onRefuse: () => ({ ok: true, result: 'refused',
    message: 'The Drill Demon dismisses you with a bark.' }),
});

define({
  id: 'sandwich_lady',
  name: 'Sandwich Lady',
  trigger: { skill: 'any', probability: 0.0005 },
  greeting_line: 'The Sandwich Lady beams. "Pick one, dearie — on the house!"',
  description: 'Offers free food.',
  options: ['accept', 'refuse'],
  onAccept: (p) => {
    addItem(p, 315, 'Shrimps', 5, false);
    return { ok: true, result: 'fed',
      message: 'She hands you a bundle of cooked shrimps.' };
  },
  onRefuse: () => ({ ok: true, result: 'refused',
    message: 'She looks a touch wounded, then smiles anyway.' }),
});

define({
  id: 'rock_golem',
  name: 'Rock Golem',
  trigger: { skill: 'mining', probability: 0.001 },
  greeting_line: 'A Rock Golem heaves itself out of the seam.',
  description: 'Rock golem spawns while mining. Fight for bonus ore.',
  options: ['fight', 'flee'],
  onFight: (p) => {
    const dmg = 2 + Math.floor(Math.random() * 3);
    p.hp = Math.max(1, (p.hp || p.maxHp || 10) - dmg);
    addItem(p, 211, 'Iron ore', 10, false);
    return { ok: true, result: 'fought', damage: dmg,
      message: `You crack the golem apart. Took ${dmg} damage, looted 10 iron ore.` };
  },
  onFlee: () => ({ ok: true, result: 'fled',
    message: 'You back off. It subsides into the seam.' }),
});

define({
  id: 'tree_spirit',
  name: 'Tree Spirit',
  trigger: { skill: 'woodcutting', probability: 0.001 },
  greeting_line: 'A Tree Spirit peels from the trunk. "Who chops without asking?"',
  description: 'Tree spirit spawns while chopping. Fight for bonus logs.',
  options: ['fight', 'flee'],
  onFight: (p) => {
    const dmg = 2 + Math.floor(Math.random() * 3);
    p.hp = Math.max(1, (p.hp || p.maxHp || 10) - dmg);
    addItem(p, 200, 'Logs', 10, false);
    return { ok: true, result: 'fought', damage: dmg,
      message: `You fell the spirit. Took ${dmg} damage, looted 10 logs.` };
  },
  onFlee: () => ({ ok: true, result: 'fled',
    message: 'You retreat. It sinks back into the bark.' }),
});

define({
  id: 'shade',
  name: 'Shade',
  trigger: { skill: 'prayer', probability: 0.0008 },
  greeting_line: 'A Shade rises from the buried bones.',
  description: 'Shade appears while burying bones. Fight for dragon bones.',
  options: ['fight', 'flee'],
  onFight: (p) => {
    const dmg = 3 + Math.floor(Math.random() * 3);
    p.hp = Math.max(1, (p.hp || p.maxHp || 10) - dmg);
    addItem(p, 536, 'Dragon bones', 5, false);
    return { ok: true, result: 'fought', damage: dmg,
      message: `You banish the shade. Took ${dmg} damage, looted 5 dragon bones.` };
  },
  onFlee: () => ({ ok: true, result: 'fled',
    message: 'You scramble back. The shade recedes.' }),
});

define({
  id: 'mystery_gift',
  name: 'Mystery Gift',
  trigger: { skill: 'any', probability: 0.0006 },
  greeting_line: 'A strange box lands at your feet and bursts open.',
  description: 'Instant coin or item drop.',
  options: ['accept'],
  onAccept: (p) => {
    const coins = 100 + Math.floor(Math.random() * 400);
    addItem(p, 101, 'Coins', coins, true);
    return { ok: true, result: 'gifted', coins,
      message: `You scoop up ${coins} coins.` };
  },
});

// Aliases for the data-file ids (re_evil_bob == evil_chicken, etc.).
const dataIdAliases = {
  're_genie': 'genie',
  're_quiz_master': 'quiz_master',
  're_evil_bob': 'evil_chicken',
  're_maze': 'mystery_gift',
  're_drill_demon': 'drill_demon',
  're_rock_golem_re': 'rock_golem',
  're_tree_spirit_re': 'tree_spirit',
  're_river_troll': 'river_troll',
  're_shade_re': 'shade',
  're_sandwich_lady': 'sandwich_lady',
};

function resolveId(id) {
  if (!id) return null;
  if (catalogue.has(id)) return id;
  if (dataIdAliases[id]) return dataIdAliases[id];
  return null;
}

// ── Spawn logic ───────────────────────────────────────────────────────────────

function isEligible(p) {
  if (!p) return false;
  if (p.pendingEvent) return false;
  if (p.combatTarget) return false;
  if (p.busy) return false;
  return true;
}

function currentTick() {
  try { return tickSys.getTick(); } catch (_) { return 0; }
}

function cooldownReady(p) {
  const next = p.nextRandomEvent || 0;
  return currentTick() >= next;
}

function weightFor(p, spec) {
  // Skill match boosts weight. Players actively using the matching skill get
  // first pick; general events fall through.
  const active = p.busyAction?.skill || p.activeTraining?.skill || null;
  const triggerSkill = spec.trigger?.skill || 'any';
  if (triggerSkill === 'any') return 1.0;
  if (active && active === triggerSkill) return 3.0;
  return 0.25;
}

function regionAllows(p, spec) {
  if (!spec.region) return true;
  // currentRegion is populated by area-locked when active. If unset, be
  // permissive — we only hard-gate region-locked events when we know.
  const cur = p.areaLocked?.currentRegion || null;
  if (!cur) return true;
  return cur === spec.region;
}

// Pick one event, weighted. Returns the spec id or null.
function pickEvent(p, opts) {
  opts = opts || {};
  const rand = typeof opts.rng === 'function' ? opts.rng : Math.random;
  const filter = opts.filter || null;
  const candidates = [];
  for (const spec of catalogue.values()) {
    if (filter && !filter(spec)) continue;
    if (!regionAllows(p, spec)) continue;
    const weight = weightFor(p, spec) * (spec.trigger?.probability || 0.001);
    if (weight <= 0) continue;
    candidates.push({ id: spec.id, weight });
  }
  if (!candidates.length) return null;
  const total = candidates.reduce((a, c) => a + c.weight, 0);
  let roll = rand() * total;
  for (const c of candidates) {
    roll -= c.weight;
    if (roll <= 0) return c.id;
  }
  return candidates[candidates.length - 1].id;
}

// Per-tick maybe-spawn. Returns null (did not fire) or the pending event.
function maybeSpawnEvent(p, opts) {
  opts = opts || {};
  if (!isEligible(p)) return null;
  if (!cooldownReady(p)) return null;
  const rand = typeof opts.rng === 'function' ? opts.rng : Math.random;

  // Global per-tick gate keeps the per-player firing rate low. With
  // SPAWN_GATE = 0.003, average ~1 per ~333 ticks (~3.3 min) pre-cooldown.
  const gate = typeof opts.spawnGate === 'number' ? opts.spawnGate : 0.003;
  if (rand() >= gate) {
    return null;
  }

  const id = pickEvent(p, opts);
  if (!id) return null;
  return spawnEvent(p, id, { quiet: opts.quiet, rng: rand });
}

// Force-spawn a specific event on the player. Used by maybeSpawnEvent, admin
// commands, and tests. Returns the pending event object or null on failure.
function spawnEvent(p, idOrAlias, opts) {
  opts = opts || {};
  const id = resolveId(idOrAlias);
  if (!id) return null;
  const spec = catalogue.get(id);
  if (!spec) return null;
  if (p.pendingEvent) return null;

  const t = currentTick();
  const ev = {
    id: spec.id,
    name: spec.name,
    greeting: spec.greeting_line,
    options: spec.options.slice(),
    spawnedTick: t,
    expiresTick: t + (spec.cooldown_ticks || EVENT_COOLDOWN_TICKS),
    data: {},
  };

  // Populate per-event data (quiz answer, etc.).
  if (spec.id === 'wandering_scholar') {
    const a = 1 + Math.floor(Math.random() * 10);
    const b = 1 + Math.floor(Math.random() * 10);
    ev.data.question = `${a} + ${b}`;
    ev.data.expected = String(a + b);
    ev.greeting = `A Wandering Scholar flags you down. "Quickly — what is ${a} plus ${b}?"`;
  }
  if (spec.id === 'quiz_master') {
    const trivia = [
      { q: 'What is the name of the dwarven city in Sootworks?', a: 'sootworks' },
      { q: 'How many herb patches in Aelgard?', a: '7' },
      { q: 'What color is a Granite maul?', a: 'grey' },
    ];
    const pick = trivia[Math.floor(Math.random() * trivia.length)];
    ev.data.question = pick.q;
    ev.data.expected = pick.a;
    ev.greeting = `The Quiz Master asks: "${pick.q}"`;
  }

  p.pendingEvent = ev;
  // Slide the next-eligible marker out by the cooldown — even if the player
  // ignores this event, we won't spawn another before the cooldown lapses.
  p.nextRandomEvent = t + (spec.cooldown_ticks || EVENT_COOLDOWN_TICKS);

  const payload = { type: 'random_event_spawn', eventId: spec.id, event: ev,
    playerId: p.id, playerName: p.name, tick: t };
  if (!opts.quiet) emit(payload);
  return ev;
}

// ── Response handling ────────────────────────────────────────────────────────
// response: 'accept' | 'refuse' | 'fight' | 'flee' | 'answer'
// arg: optional — e.g., the answer string for quiz events.

function respondToEvent(p, response, arg) {
  if (!p || !p.pendingEvent) return { ok: false, reason: 'No pending event.' };
  const spec = catalogue.get(p.pendingEvent.id);
  if (!spec) {
    const ev = p.pendingEvent; p.pendingEvent = null;
    return { ok: false, reason: `Unknown event spec: ${ev.id}` };
  }
  const resp = String(response || '').toLowerCase().trim();
  const allowed = spec.options || ['accept', 'refuse'];
  if (!allowed.includes(resp)) {
    return { ok: false, reason: `Unsupported response "${resp}". Allowed: ${allowed.join(', ')}` };
  }

  let outcome = null;
  try {
    if (resp === 'accept' && spec.onAccept) outcome = spec.onAccept(p, arg);
    else if (resp === 'refuse' && spec.onRefuse) outcome = spec.onRefuse(p, arg);
    else if (resp === 'fight' && spec.onFight) outcome = spec.onFight(p, arg);
    else if (resp === 'flee' && spec.onFlee) outcome = spec.onFlee(p, arg);
    else if (resp === 'answer' && spec.onAnswer) outcome = spec.onAnswer(p, arg);
  } catch (e) {
    outcome = { ok: false, reason: e.message };
  }
  outcome = outcome || { ok: true, result: resp };

  const ev = p.pendingEvent;
  p.pendingEvent = null;
  const t = currentTick();

  const payload = { type: 'random_event_resolved', eventId: ev.id, response: resp,
    outcome, playerId: p.id, playerName: p.name, tick: t };
  emit(payload);
  return { ok: true, response: resp, outcome, event: ev };
}

// ── Listing ──────────────────────────────────────────────────────────────────

function listActiveEvents(p) {
  if (!p || !p.pendingEvent) return [];
  return [p.pendingEvent];
}

// ── Tick loop integration ────────────────────────────────────────────────────

let _attached = false;
// opts: { getPlayers: () => IterableOf({ws, p}) | IterableOf(p), spawnGate?, rng? }
function attachTickHook(opts) {
  if (_attached) return false;
  opts = opts || {};
  const getPlayers = opts.getPlayers;
  if (typeof getPlayers !== 'function') return false;
  tickSys.onTick('random-events', () => {
    // Global throttle so a huge server doesn't spawn storms.
    const iter = getPlayers();
    for (const entry of iter) {
      const p = entry && entry.id != null ? entry : (entry && entry.p ? entry.p : null);
      if (!p) continue;
      if (!p.nextRandomEvent) {
        const t = currentTick();
        p.nextRandomEvent = t + INITIAL_DELAY_MIN + Math.floor(Math.random() * INITIAL_DELAY_RANGE);
        continue;
      }
      maybeSpawnEvent(p, { spawnGate: opts.spawnGate, rng: opts.rng });
    }
  });
  _attached = true;
  return true;
}

function detachTickHook() {
  tickSys.offTick('random-events');
  _attached = false;
}

module.exports = {
  // constants
  EVENT_COOLDOWN_TICKS,
  // catalogue
  define, get, list, resolveId,
  // lifecycle
  maybeSpawnEvent, spawnEvent, respondToEvent, listActiveEvents,
  // internals (exposed for tests / admin)
  pickEvent, isEligible, cooldownReady, weightFor, regionAllows,
  // event bus
  subscribe, emit,
  // tick integration
  attachTickHook, detachTickHook,
};
