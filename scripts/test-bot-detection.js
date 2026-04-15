#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// Bot Detection — Engine Tests
//
// Coverage:
//   1.  recordAction bootstraps player.botSignals and ring-buffers actions
//   2.  analyzeTimings — low stddev -> 1.0, high stddev -> 0.0
//   3.  analyzeRouting — straight-line walker scores high; wandering low
//   4.  analyzeAfkRegularity — constant AFK -> 1.0; jittery AFK -> 0.0
//   5.  analyzeResponseToEvents — always/never responding -> 1.0; healthy -> 0
//   6.  analyzeCameraActivity — no camera moves -> 1.0; active -> 0
//   7.  analyzeChatEngagement — no chat -> 0.6; engaged -> 0
//   8.  analyzeLogoutRegularity — 6-hour-mark logouts -> 1.0
//   9.  analyzeHoneypots — 1 hit = 0.5, 2+ hits = 1.0
//   10. getBotScore aggregates and clamps to [0, 1]
//   11. Honeypot place/list/remove + checkHoneypots increments and escalates
//   12. Policy load/save round-trip through persistence
//   13. getPolicyFor returns licensed only for licensed accounts
//   14. markAsBot toggles both player.isBot and botSignals.isBot
//   15. applyGEPrice discounts for self-labeled bots; no change otherwise
//   16. isBotAllowedInZone — zone_restricted policy only affects labeled bots
//   17. analysePlayers escalates high scorers + emits autoban_candidate at >= threshold
//   18. Chat commands register cleanly; /botpolicy visible, /botscore admin-only
//
// Run: node scripts/test-bot-detection.js
// Exit 0 on all-pass, exit 1 on any failure.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const path = require('path');
const fs = require('fs');

// Sandbox persistence so tests never touch real data.
const tmpDataDir = path.join(__dirname, '..', '.tmp-bot-detection-test');
if (fs.existsSync(tmpDataDir)) fs.rmSync(tmpDataDir, { recursive: true, force: true });
fs.mkdirSync(tmpDataDir, { recursive: true });

const persistence = require('../src/engine/persistence');
const originalSave = persistence.save;
const originalLoad = persistence.load;
persistence.save = (filename, data) => {
  const fp = path.join(tmpDataDir, filename);
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, JSON.stringify(data, null, 2));
};
persistence.load = (filename, fallback = null) => {
  const fp = path.join(tmpDataDir, filename);
  if (!fs.existsSync(fp)) return fallback;
  try { return JSON.parse(fs.readFileSync(fp, 'utf8')); }
  catch { return fallback; }
};

const events = require('../src/engine/events');
const bot = require('../src/engine/bot-detection');
const commands = require('../src/engine/commands');
const botCommands = require('../src/engine/bot-detection-commands');

let passed = 0, failed = 0;
const failures = [];
function assert(cond, label) {
  if (cond) { passed++; console.log('  PASS  ' + label); }
  else      { failed++; failures.push(label); console.log('  FAIL  ' + label); }
}
function eq(actual, expected, label) {
  assert(actual === expected,
    `${label} (expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)})`);
}
function near(actual, expected, delta, label) {
  assert(Math.abs(actual - expected) <= delta,
    `${label} (expected ~${expected} +/- ${delta}, got ${actual})`);
}
function section(title) { console.log('\n=== ' + title + ' ==='); }

let nextPid = 1;
function makePlayer(name) {
  return { id: String(nextPid++), name, admin: false };
}

let currentTick = 1000;
bot.setTickSource(() => currentTick);

bot._resetForTests();

// ── 1. recordAction bootstraps signals ──────────────────────────────────────
section('recordAction bootstraps player.botSignals');

{
  const p = makePlayer('Alice');
  assert(!p.botSignals, 'no signals before first recordAction');
  const a = bot.recordAction(p, 'click', { x: 1, y: 2 });
  assert(!!p.botSignals, 'signals created after recordAction');
  eq(p.botSignals.actions.length, 1, 'one action recorded');
  eq(a.type, 'click', 'action.type is "click"');
  // Fill past buffer cap to confirm ring-buffering.
  for (let i = 0; i < 300; i++) bot.recordAction(p, 'click', { x: i, y: i });
  assert(p.botSignals.actions.length <= 256, 'action buffer capped at 256');
}

// ── 2. analyzeTimings — low vs high variance ────────────────────────────────
section('analyzeTimings: low variance = bot, high variance = human');

{
  // Low-variance bot: patch Date.now to emit near-identical deltas.
  const bot1 = makePlayer('Robotic');
  const realNow = Date.now;
  let fake = 1_000_000;
  Date.now = () => fake;
  // First action records baseline.
  bot.recordAction(bot1, 'click');
  for (let i = 0; i < 20; i++) {
    fake += 50;                      // 50ms consistent — tiny std dev
    bot.recordAction(bot1, 'click');
  }
  const lowVar = bot.analyzeTimings(bot1);
  Date.now = realNow;
  assert(lowVar >= 0.9, `low-variance timings scored ${lowVar.toFixed(3)} (expect >= 0.9)`);

  // High-variance human: wide spread produces stddev >= 200ms -> 0.
  const human = makePlayer('Human');
  Date.now = () => fake;
  bot.recordAction(human, 'click');
  const deltas = [30, 900, 80, 1500, 40, 600, 120, 2000, 50, 850, 90, 1200, 70, 2500];
  for (const d of deltas) {
    fake += d;
    bot.recordAction(human, 'click');
  }
  const hiVar = bot.analyzeTimings(human);
  Date.now = realNow;
  assert(hiVar < 0.2, `high-variance timings scored ${hiVar.toFixed(3)} (expect < 0.2)`);

  // Too-few-samples -> 0
  const sparse = makePlayer('Sparse');
  bot.recordAction(sparse, 'click');
  eq(bot.analyzeTimings(sparse), 0, 'insufficient samples -> 0');
}

// ── 3. analyzeRouting — straight vs wander ─────────────────────────────────
section('analyzeRouting: straight-line walker scores high');

{
  const straight = makePlayer('StraightWalker');
  for (let i = 0; i < 8; i++) bot.recordAction(straight, 'move', { x: i, y: 0 });
  const straightScore = bot.analyzeRouting(straight);
  assert(straightScore >= 0.9, `straight walker scored ${straightScore.toFixed(3)} (>= 0.9)`);

  const wander = makePlayer('Wanderer');
  // Every step changes both x and y => diagonal wander; expect low score.
  const path = [[0, 0], [1, 1], [2, 3], [4, 2], [5, 4], [7, 3], [6, 5], [8, 6]];
  for (const [x, y] of path) bot.recordAction(wander, 'move', { x, y });
  const wanderScore = bot.analyzeRouting(wander);
  assert(wanderScore <= 0.3, `wanderer scored ${wanderScore.toFixed(3)} (<= 0.3)`);
}

// ── 4. analyzeAfkRegularity ─────────────────────────────────────────────────
section('analyzeAfkRegularity: uniform gaps = bot');

{
  // Force 5 AFK gaps of exactly 100 ticks.
  const p = makePlayer('AfkBot');
  bot.ensureSignals(p);
  p.botSignals.afkIntervals = [100, 100, 100, 100, 100];
  const score = bot.analyzeAfkRegularity(p);
  eq(score, 1, 'constant AFK intervals -> 1.0');

  const jittery = makePlayer('JitteryHuman');
  bot.ensureSignals(jittery);
  jittery.botSignals.afkIntervals = [60, 120, 30, 200, 90];
  const j = bot.analyzeAfkRegularity(jittery);
  assert(j < 0.5, `jittery AFK scored ${j.toFixed(3)} (< 0.5)`);

  const tooFew = makePlayer('TooFew');
  bot.ensureSignals(tooFew);
  tooFew.botSignals.afkIntervals = [100, 100];
  eq(bot.analyzeAfkRegularity(tooFew), 0, 'too-few AFK samples -> 0');
}

// ── 5. analyzeResponseToEvents ──────────────────────────────────────────────
section('analyzeResponseToEvents: always-or-never = bot');

{
  const ignorer = makePlayer('Ignorer');
  bot.ensureSignals(ignorer);
  ignorer.botSignals.eventsPrompted = 10;
  ignorer.botSignals.responsesToEvents = 0;
  eq(bot.analyzeResponseToEvents(ignorer), 1, 'never responding -> 1.0');

  const alwaysResponder = makePlayer('AlwaysBot');
  bot.ensureSignals(alwaysResponder);
  alwaysResponder.botSignals.eventsPrompted = 10;
  alwaysResponder.botSignals.responsesToEvents = 10;
  eq(bot.analyzeResponseToEvents(alwaysResponder), 1, 'always responding -> 1.0');

  const healthy = makePlayer('Healthy');
  bot.ensureSignals(healthy);
  healthy.botSignals.eventsPrompted = 10;
  healthy.botSignals.responsesToEvents = 7;
  eq(bot.analyzeResponseToEvents(healthy), 0, '70% response rate -> 0 (healthy)');
}

// ── 6. analyzeCameraActivity ────────────────────────────────────────────────
section('analyzeCameraActivity: no camera = 1.0');

{
  const noCam = makePlayer('NoCam');
  bot.ensureSignals(noCam);
  noCam.botSignals.actions = new Array(25).fill({ type: 'click' });
  noCam.botSignals.cameraMoves = 0;
  eq(bot.analyzeCameraActivity(noCam), 1, 'no camera moves across 25 actions -> 1.0');

  const active = makePlayer('Active');
  bot.ensureSignals(active);
  active.botSignals.actions = new Array(25).fill({ type: 'click' });
  active.botSignals.cameraMoves = 12;
  eq(bot.analyzeCameraActivity(active), 0, 'active camera -> 0');
}

// ── 7. analyzeChatEngagement ────────────────────────────────────────────────
section('analyzeChatEngagement: no chat = 0.6 signal');

{
  const quiet = makePlayer('Quiet');
  bot.ensureSignals(quiet);
  quiet.botSignals.actions = new Array(35).fill({ type: 'click' });
  quiet.botSignals.chatEvents = 0;
  near(bot.analyzeChatEngagement(quiet), 0.6, 0.001, 'no-chat -> ~0.6');

  const chatty = makePlayer('Chatty');
  bot.ensureSignals(chatty);
  chatty.botSignals.actions = new Array(35).fill({ type: 'click' });
  chatty.botSignals.chatEvents = 5;
  eq(bot.analyzeChatEngagement(chatty), 0, 'engaged player -> 0');
}

// ── 8. analyzeLogoutRegularity ──────────────────────────────────────────────
section('analyzeLogoutRegularity: 6-hour marks');

{
  const six = bot.SIX_HOURS_TICKS;
  const sixMark = makePlayer('SixHour');
  bot.ensureSignals(sixMark);
  sixMark.botSignals.logoutTicks = [1000, 1000 + six, 1000 + 2 * six, 1000 + 3 * six];
  eq(bot.analyzeLogoutRegularity(sixMark), 1, 'all 6-hour-mark logouts -> 1.0');

  const irregular = makePlayer('Irregular');
  bot.ensureSignals(irregular);
  irregular.botSignals.logoutTicks = [1000, 2000, 8000, 22000];
  const score = bot.analyzeLogoutRegularity(irregular);
  assert(score < 0.4, `irregular logouts scored ${score.toFixed(3)} (< 0.4)`);
}

// ── 9. analyzeHoneypots ─────────────────────────────────────────────────────
section('analyzeHoneypots: 1 hit = 0.5, 2+ = 1.0');

{
  const none = makePlayer('NoHoneypot');
  bot.ensureSignals(none);
  eq(bot.analyzeHoneypots(none), 0, '0 hits -> 0');
  const one = makePlayer('OneHit');
  bot.ensureSignals(one);
  one.botSignals.honeypotHits = 1;
  eq(bot.analyzeHoneypots(one), 0.5, '1 hit -> 0.5');
  const many = makePlayer('ManyHits');
  bot.ensureSignals(many);
  many.botSignals.honeypotHits = 5;
  eq(bot.analyzeHoneypots(many), 1, '5 hits -> 1.0');
}

// ── 10. getBotScore aggregates, clamps ──────────────────────────────────────
section('getBotScore: weighted aggregate in [0, 1]');

{
  const p = makePlayer('Mixed');
  bot.ensureSignals(p);
  // Force all signals to max.
  p.botSignals.honeypotHits = 5;
  p.botSignals.logoutTicks = [0, bot.SIX_HOURS_TICKS, 2 * bot.SIX_HOURS_TICKS];
  p.botSignals.afkIntervals = [50, 50, 50, 50, 50];
  p.botSignals.eventsPrompted = 5;
  p.botSignals.responsesToEvents = 0;
  p.botSignals.cameraMoves = 0;
  p.botSignals.chatEvents = 0;
  p.botSignals.actions = new Array(30).fill({ type: 'click' });
  // Force timing stddev to near-zero.
  p.botSignals.timings = new Array(12).fill(50);
  // No move actions => routing stays 0 (fine; not all signals need to be max).
  const score = bot.getBotScore(p);
  assert(score >= 0.7 && score <= 1, `max-bot score in [0.7, 1]: got ${score.toFixed(3)}`);

  const fresh = makePlayer('Fresh');
  const freshScore = bot.getBotScore(fresh);
  assert(freshScore >= 0 && freshScore <= 1, 'fresh player score clamped to [0, 1]');
  near(freshScore, 0, 0.001, 'fresh player score ~0');

  // breakdown is cached on the player
  assert(!!(p.botSignals.lastAnalysis && p.botSignals.lastAnalysis.breakdown),
    'lastAnalysis.breakdown cached');
}

// ── 11. Honeypots: place/list/remove + checkHoneypots ──────────────────────
section('Honeypots: lifecycle + hit attribution + escalation');

{
  bot.clearEscalations();
  const res = bot.placeHoneypot(bot.HONEYPOT_KINDS.FAKE_DROP, 50, 60, { item: 'rare_scimitar' });
  assert(res.ok, 'placeHoneypot ok for known kind');
  const id = res.honeypot.id;
  const list = bot.listHoneypots();
  assert(list.some(h => h.id === id), 'placed honeypot appears in listHoneypots');

  const bad = bot.placeHoneypot('not_a_kind', 0, 0);
  assert(!bad.ok, 'unknown honeypot kind rejected');

  const victim = makePlayer('Victim');
  const c = bot.checkHoneypots(victim, id);
  assert(c.ok, 'checkHoneypots ok');
  eq(c.totalHits, 1, 'player honeypot hit count = 1');
  assert(victim.botSignals.escalated, 'victim auto-escalated on hit');
  const esc = bot.getEscalations();
  assert(esc.length >= 1, 'escalation recorded');
  assert(esc[esc.length - 1].reason.indexOf('Honeypot') >= 0,
    'escalation reason mentions Honeypot');

  // Unknown honeypot id.
  const miss = bot.checkHoneypots(victim, 9999999);
  assert(!miss.ok, 'checkHoneypots with unknown id fails gracefully');

  assert(bot.removeHoneypot(id), 'removeHoneypot ok');
  assert(!bot.listHoneypots().some(h => h.id === id), 'honeypot gone after remove');
}

// ── 12. Policy load/save round-trip ────────────────────────────────────────
section('Policy: load/save round-trip');

{
  bot._resetForTests();
  const p1 = bot.loadPolicy();
  eq(p1.policy, 'allow', 'default policy is "allow"');
  assert(fs.existsSync(path.join(tmpDataDir, 'bot-policy.json')),
    'policy file seeded on first load');

  bot.setPolicy({ policy: 'ban', banThreshold: 0.85 });
  const saved = JSON.parse(fs.readFileSync(path.join(tmpDataDir, 'bot-policy.json'), 'utf8'));
  eq(saved.policy, 'ban', 'saved policy = ban');
  near(saved.banThreshold, 0.85, 0.0001, 'saved banThreshold = 0.85');

  // Reload fresh.
  bot._resetForTests();
  const p2 = bot.loadPolicy();
  eq(p2.policy, 'ban', 'policy persisted across reload');
  near(p2.banThreshold, 0.85, 0.0001, 'banThreshold persisted');
}

// ── 13. getPolicyFor: licensed accounts override server default ────────────
section('getPolicyFor: licensed accounts');

{
  bot.setPolicy({ policy: 'licensed', licensedPlayers: ['777'] });
  const licensed = { id: '777', name: 'Licensed' };
  const unlicensed = { id: '888', name: 'Unlicensed' };
  eq(bot.getPolicyFor(licensed), 'licensed', 'licensed player -> licensed');
  eq(bot.getPolicyFor(unlicensed), 'licensed',
    'unlicensed player still sees the server "licensed" policy string');
  // Switch to ban -> licensed list irrelevant
  bot.setPolicy({ policy: 'ban' });
  eq(bot.getPolicyFor(licensed), 'ban', 'ban policy applies to everyone');
}

// ── 14. markAsBot toggles flag ─────────────────────────────────────────────
section('markAsBot: toggles player.isBot and botSignals.isBot');

{
  const p = makePlayer('Self');
  bot.markAsBot(p, true);
  eq(p.isBot, true, 'player.isBot = true');
  eq(p.botSignals.isBot, true, 'botSignals.isBot = true');
  eq(bot.isSelfLabeledBot(p), true, 'isSelfLabeledBot true');
  bot.markAsBot(p, false);
  eq(p.isBot, false, 'player.isBot = false after toggle off');
  eq(bot.isSelfLabeledBot(p), false, 'isSelfLabeledBot false after off');
}

// ── 15. applyGEPrice: discount for self-labeled bots ───────────────────────
section('applyGEPrice: labeled bots get configured discount');

{
  bot.setPolicy({ policy: 'allow', priceDiscount: 0.2 });
  const normal = makePlayer('Normal');
  const labeled = makePlayer('Labeled');
  bot.markAsBot(labeled, true);
  eq(bot.applyGEPrice(normal, 1000), 1000, 'normal player: no discount');
  eq(bot.applyGEPrice(labeled, 1000), 800, 'labeled bot: 20% discount -> 800');
  // Never returns below 1.
  assert(bot.applyGEPrice(labeled, 1) >= 1, 'applyGEPrice never returns below 1');
}

// ── 16. isBotAllowedInZone: zone_restricted only affects labeled bots ──────
section('isBotAllowedInZone: zone_restricted policy');

{
  bot.setPolicy({ policy: 'zone_restricted', botZones: ['sootworks'] });
  const normal = makePlayer('NormalZ');
  const labeled = makePlayer('LabeledZ');
  bot.markAsBot(labeled, true);
  eq(bot.isBotAllowedInZone(normal, 'heartlands'), true,
    'non-labeled player always allowed');
  eq(bot.isBotAllowedInZone(labeled, 'sootworks'), true,
    'labeled bot allowed in configured bot zone');
  eq(bot.isBotAllowedInZone(labeled, 'heartlands'), false,
    'labeled bot denied in non-bot zone');

  // Under policy=allow, anyone is allowed in any zone.
  bot.setPolicy({ policy: 'allow' });
  eq(bot.isBotAllowedInZone(labeled, 'heartlands'), true,
    'policy=allow: labeled bot allowed anywhere');
}

// ── 17. analysePlayers: escalates and emits autoban_candidate ─────────────
section('analysePlayers: escalates high-score players, emits autoban_candidate under ban policy');

{
  bot._resetForTests();
  bot.setPolicy({ policy: 'ban', banThreshold: 0.5, autoEscalateThreshold: 0.3 });

  // Capture events.
  const autobanCaps = [];
  events.on('bot:autoban_candidate', 'test-cap', (e) => autobanCaps.push(e));

  const lazy = makePlayer('Lazy');  // low-signal player
  const sus  = makePlayer('Sus');   // pre-loaded with max signals
  bot.ensureSignals(sus);
  sus.botSignals.honeypotHits = 5;
  sus.botSignals.afkIntervals = [50, 50, 50, 50, 50, 50];
  sus.botSignals.eventsPrompted = 10;
  sus.botSignals.responsesToEvents = 0;
  sus.botSignals.cameraMoves = 0;
  sus.botSignals.chatEvents = 0;
  sus.botSignals.actions = new Array(40).fill({ type: 'click' });
  sus.botSignals.timings = new Array(12).fill(50);
  sus.botSignals.logoutTicks = [0, bot.SIX_HOURS_TICKS, 2 * bot.SIX_HOURS_TICKS];

  const summary = bot.analysePlayers([lazy, sus]);
  eq(summary.analyzed, 2, 'analyzed 2 players');
  assert(summary.escalated >= 1, `at least 1 escalated (got ${summary.escalated})`);
  assert(summary.autobanned >= 1, `at least 1 autoban candidate (got ${summary.autobanned})`);
  assert(autobanCaps.length >= 1, 'at least one bot:autoban_candidate event fired');
  assert(autobanCaps.some(e => e.playerId === sus.id), 'sus player was the autoban candidate');

  events.off('bot:autoban_candidate', 'test-cap');
}

// ── 18. Commands ──────────────────────────────────────────────────────────
section('Commands: register cleanly, /botpolicy open, /botscore admin-only');

{
  const fakeRegistry = {
    _cmds: new Map(),
    register(name, opts) { this._cmds.set(name, opts); },
  };
  botCommands.register({
    commands: fakeRegistry,
    botDetection: bot,
    getTick: () => currentTick,
    findPlayer: (id) => ({ id: String(id), name: `P-${id}` }),
  });
  assert(fakeRegistry._cmds.has('botpolicy'), '/botpolicy registered');
  assert(fakeRegistry._cmds.has('mark-as-bot'), '/mark-as-bot registered');
  assert(fakeRegistry._cmds.has('botscore'), '/botscore registered');
  assert(fakeRegistry._cmds.has('honeypot'), '/honeypot registered');

  const scoreCmd = fakeRegistry._cmds.get('botscore');
  eq(scoreCmd.admin, true, '/botscore is admin-only');
  const hpCmd = fakeRegistry._cmds.get('honeypot');
  eq(hpCmd.admin, true, '/honeypot is admin-only');
  const policyCmd = fakeRegistry._cmds.get('botpolicy');
  eq(!!policyCmd.admin, false, '/botpolicy is NOT admin-only');
  const labelCmd = fakeRegistry._cmds.get('mark-as-bot');
  eq(!!labelCmd.admin, false, '/mark-as-bot is NOT admin-only');

  // /botpolicy output mentions the policy.
  bot.setPolicy({ policy: 'allow' });
  const out = policyCmd.fn({ id: '1', name: 'Any', admin: false }, []);
  assert(typeof out === 'string' && /allow/i.test(out),
    '/botpolicy output mentions policy');

  // /mark-as-bot toggles.
  const p = makePlayer('CmdLabel');
  const on = labelCmd.fn(p, ['on']);
  assert(/flagged as a bot/i.test(on), '/mark-as-bot on confirms');
  eq(p.isBot, true, '/mark-as-bot on sets isBot');
  const off = labelCmd.fn(p, ['off']);
  assert(/removed/i.test(off), '/mark-as-bot off confirms');
  eq(p.isBot, false, '/mark-as-bot off clears isBot');

  // /botscore works with admin target.
  const p2 = makePlayer('Admin');
  p2.admin = true;
  bot.ensureSignals(p2);
  p2.botSignals.honeypotHits = 1;
  const scoreOut = scoreCmd.fn(p2, []);
  assert(typeof scoreOut === 'string' && /Bot score/.test(scoreOut),
    '/botscore returns a score line');

  // /honeypot place works with admin.
  const hpOut = hpCmd.fn(p2, ['place', bot.HONEYPOT_KINDS.FAKE_DROP, '10', '20']);
  assert(/Placed/.test(hpOut), '/honeypot place confirms');
  const listOut = hpCmd.fn(p2, ['list']);
  assert(/fake_drop/.test(listOut) || /(honeypot)/i.test(listOut),
    '/honeypot list shows placed honeypot');

  // /honeypot escalations works.
  bot.clearEscalations();
  bot.escalate(p, 'test escalation');
  const escOut = hpCmd.fn(p2, ['escalations']);
  assert(/test escalation/.test(escOut), '/honeypot escalations lists entries');
}

// ── 19. Command pipeline integration: admin-only enforced by commands.execute
section('Pipeline: non-admin is blocked by commands.execute');

{
  // Re-use the global registry.
  botCommands.register({
    commands,
    botDetection: bot,
    getTick: () => currentTick,
  });
  const normal = makePlayer('NonAdmin');
  normal.admin = false;
  const res = commands.execute(normal, 'botscore', null);
  assert(typeof res === 'string' && /Admin only/i.test(res),
    'non-admin botscore => Admin only');

  const admin = makePlayer('RealAdmin');
  admin.admin = true;
  const ok = commands.execute(admin, 'botscore', null);
  assert(typeof ok === 'string' && /Bot score/i.test(ok),
    'admin botscore returns a score');
}

// ── Summary ────────────────────────────────────────────────────────────────
console.log(`\n── Results ──`);
console.log(`  ${passed} passed, ${failed} failed`);

// Restore persistence (polite to other tests running after).
persistence.save = originalSave;
persistence.load = originalLoad;

if (failures.length) {
  console.log('\nFAILURES:');
  for (const f of failures) console.log('  - ' + f);
  process.exit(1);
}
process.exit(0);
