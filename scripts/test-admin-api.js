#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// Admin API — Engine Tests (burn v2)
//
// Coverage:
//   1.  init() wires players + tick source without exceptions
//   2.  getOverview() returns ok:true with required shape
//   3.  overview.players.connected counts non-httpOnly players
//   4.  overview.players.sessions counts total
//   5.  recordTickSample buffers samples; P50 / P99 / mean computed
//   6.  listPlayers() returns redacted player records
//   7.  listPlayers({ q }) filters by name substring
//   8.  listPlayers respects limit
//   9.  getPlayerCard returns null for unknown
//   10. getPlayerCard returns inventory + bank + strikes + botSignals
//   11. getModQueue() groups reports / appeals / strikes
//   12. getModQueue strikes are redacted with playerId/playerName
//   13. getBotLeaderboard sorts descending by score
//   14. getBotLeaderboard respects limit
//   15. getTradeLog() returns { trades, topVolume }
//   16. getAuditLog reads mod-audit.log lines
//   17. getAuditLog since= filter works
//   18. scheduleEvent with unknown kind is rejected
//   19. scheduleEvent with past time is rejected
//   20. scheduleEvent with valid input persists
//   21. listEvents includes scheduled event
//   22. cancelEvent transitions status to cancelled
//   23. cancelEvent twice returns ok:false
//   24. getConfig('bot-policy') returns default bot-policy
//   25. updateConfig('bot-policy') validates policy field
//   26. updateConfig('bot-policy') persists valid values
//   27. updateConfig('bot-policy') rejects bad policy string
//   28. updateConfig('bot-policy') hot-reloads via bot module
//   29. getConfig('unknown-key') returns null
//   30. getClans() returns clan summaries with memberCount
//   31. Redaction: player cards do NOT expose bcrypt hashes
//   32. admin:overview_tick event fires when startOverviewPush runs
//   33. admin:new_report fires when moderation.recordIncident runs
//   34. admin:alert fires on bot:escalated
//   35. alert throttling suppresses duplicate alerts inside cooldown
//   36. getContentSummary returns staged overrides + entity types
//   37. EVENT_KINDS contains expected whitelist
//   38. CONFIG_KEYS exposes the 3 config namespaces
//   39. updateConfig audit line written to mod-audit.log
//
// Run: node scripts/test-admin-api.js
// Exit 0 on all-pass, 1 on any failure.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const path = require('path');
const fs = require('fs');

// Sandbox persistence so tests never touch real data.
const tmpDataDir = path.join(__dirname, '..', '.tmp-admin-api-test');
if (fs.existsSync(tmpDataDir)) fs.rmSync(tmpDataDir, { recursive: true, force: true });
fs.mkdirSync(tmpDataDir, { recursive: true });

const persistence = require('../src/engine/persistence');
persistence.save = (filename, data) => {
  const fp = path.join(tmpDataDir, filename);
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, JSON.stringify(data, null, 2));
};
persistence.load = (filename, fallback = null) => {
  const fp = path.join(tmpDataDir, filename);
  if (!fs.existsSync(fp)) return fallback;
  try { return JSON.parse(fs.readFileSync(fp, 'utf8')); } catch { return fallback; }
};
persistence.DATA_DIR = tmpDataDir;

const events = require('../src/engine/events');
const moderation = require('../src/engine/moderation');
const bot = require('../src/engine/bot-detection');
const ruleRegistry = require('../src/content/aelgard/rules-registry');
const adminApi = require('../src/engine/admin-api');

// ── Harness ────────────────────────────────────────────────────────────────
let passed = 0, failed = 0;
const failures = [];
function assert(cond, label) {
  if (cond) { passed++; console.log('  PASS  ' + label); }
  else      { failed++; failures.push(label); console.log('  FAIL  ' + label); }
}
function eq(a, b, label) {
  assert(JSON.stringify(a) === JSON.stringify(b),
    `${label} (expected ${JSON.stringify(b)}, got ${JSON.stringify(a)})`);
}
function section(title) { console.log('\n=== ' + title + ' ==='); }

// ── Fixtures ───────────────────────────────────────────────────────────────
let nextId = 1;
function makePlayer(name, opts = {}) {
  return {
    id: String(nextId++),
    name,
    admin: !!opts.admin,
    role: opts.role || (opts.admin ? 'admin' : 'player'),
    httpOnly: !!opts.httpOnly,
    x: 100, y: 100, layer: 0,
    hp: 10, maxHp: 10,
    busy: false,
    inventory: [
      { id: 1, name: 'bread', count: 3 },
      { id: 101, name: 'coins', count: 500 },
    ].concat(Array(26).fill(null)),
    bank: [
      { id: 995, name: 'gold bar', count: 5, value: 100 },
      { id: 1777, name: 'feather', count: 1000, value: 5 },
    ],
    skills: {
      attack: { xp: 0, level: 1 },
      hitpoints: { xp: 0, level: 10 },
    },
    strikes: [],
    botSignals: null,
    moderationState: null,
    // Fields that should be REDACTED:
    hash: '$2b$10$FAKEBCRYPTHASH',
    passwordHash: 'SECRET',
  };
}

const playersByName = new Map();
const playersMap = new Map();  // ws-keyed, but we fake ws with player id
function registerPlayer(p) {
  playersByName.set((p.name || '').toLowerCase(), p);
  playersMap.set(p.id, p);
}

// Fake tick source
let currentTick = 100;
const tick = { getTick: () => currentTick };

// Alice: connected admin, Bob: connected player, Carol: httpOnly
const alice = makePlayer('Alice', { admin: true, role: 'admin' });
const bob   = makePlayer('Bob',   { role: 'player' });
const carol = makePlayer('Carol', { httpOnly: true });
registerPlayer(alice);
registerPlayer(bob);
registerPlayer(carol);

// Bob gets a bot score by feeding signals.
bot.ensureSignals(bob);
bob.botSignals.timings = [5, 5, 5, 5, 5, 5, 5, 5, 5];
bob.botSignals.honeypotHits = 2;
bob.botSignals.escalated = true;
bot.getBotScore(bob);  // populate lastAnalysis

moderation.setTickSource(() => currentTick);

// Register the rule registry so moderation incidents can file.
// ruleRegistry auto-registers on require (side effect).

// ── Init ──────────────────────────────────────────────────────────────────

adminApi._reset();
const initOK = adminApi.init({
  players: playersMap,
  playersByName,
  tick,
  getClanList: () => [
    { id: 1, name: 'Testing Guild', motto: 'For Science', founder: 1, foundedAt: Date.now(), members: [{ playerId: 1 }, { playerId: 2 }], territory: ['heartlands'], citadel: { tier: 2 }, treasury: { coins: 1234 }, wins: { wars: 0, bingo: 0 } },
  ],
  getMarketStats: () => ({ low: 10, high: 20 }),
});

section('1) init');
assert(initOK === true, '1.1 init returns true');
assert(Array.isArray(adminApi.EVENT_KINDS) && adminApi.EVENT_KINDS.length >= 5,
  '1.2 EVENT_KINDS has >= 5 kinds');

// ── Overview ──────────────────────────────────────────────────────────────

section('2) getOverview()');
const ov = adminApi.getOverview();
assert(ov.ok === true, '2.1 getOverview ok:true');
assert(typeof ov.uptimeMs === 'number' && ov.uptimeMs >= 0, '2.2 uptimeMs present');
eq(ov.players.connected, 2, '2.3 connected counts non-httpOnly players');
eq(ov.players.sessions, 3, '2.4 sessions counts total');
assert(ov.tickHealth && typeof ov.tickHealth.p50 === 'number', '2.5 tickHealth shape present');
assert(ov.bots && typeof ov.bots.policy === 'string', '2.6 bots.policy string present');
assert(typeof ov.clans === 'number', '2.7 clans count present');
eq(ov.clans, 1, '2.8 clan count matches getClanList');

// ── Tick samples ──────────────────────────────────────────────────────────

section('3) Tick samples P50 / P99');
for (let i = 0; i < 50; i++) adminApi.recordTickSample(10 + i); // 10..59
for (let i = 0; i < 50; i++) adminApi.recordTickSample(60 + i); // 60..109
const ov2 = adminApi.getOverview();
assert(ov2.tickHealth.samples === 100, '3.1 100 samples buffered');
assert(ov2.tickHealth.p50 >= 50 && ov2.tickHealth.p50 <= 70, '3.2 P50 in mid-range (50..70)');
assert(ov2.tickHealth.p99 >= 100, '3.3 P99 near max');
assert(ov2.tickHealth.mean > 0, '3.4 mean > 0');

// ── Players ───────────────────────────────────────────────────────────────

section('4) listPlayers');
const listed = adminApi.listPlayers({ q: '', limit: 100 });
assert(Array.isArray(listed) && listed.length === 3, '4.1 listPlayers returns 3 players');
assert(listed.every(p => !('hash' in p) && !('passwordHash' in p)),
  '4.2 Redaction: no bcrypt hash in output');
const filtered = adminApi.listPlayers({ q: 'alice' });
eq(filtered.length, 1, '4.3 Search by "alice" yields 1');
eq(filtered[0].name, 'Alice', '4.4 Search returns Alice');
const limited = adminApi.listPlayers({ limit: 2 });
eq(limited.length, 2, '4.5 Limit respected');
const byId = adminApi.listPlayers({ q: alice.id });
assert(byId.length >= 1 && byId.find(p => p.name === 'Alice'), '4.6 Search by id works');

// ── Player card ──────────────────────────────────────────────────────────

section('5) getPlayerCard');
assert(adminApi.getPlayerCard('nobody') === null, '5.1 Unknown returns null');
const bobCard = adminApi.getPlayerCard('Bob');
assert(bobCard && bobCard.ok === true, '5.2 Bob card ok');
assert(Array.isArray(bobCard.inventory), '5.3 inventory array');
assert(Array.isArray(bobCard.bank), '5.4 bank array');
assert(bobCard.bankValue > 0, '5.5 bank value computed (>0)');
eq(bobCard.bankValue, 5 * 100 + 1000 * 5, '5.6 bank value = 500 + 5000 = 5500');
assert(bobCard.botSignals && typeof bobCard.botSignals.score === 'number', '5.7 botSignals score present');
assert(!('hash' in bobCard), '5.8 Card has no bcrypt hash');
assert(!('passwordHash' in bobCard), '5.9 Card has no passwordHash');

// ── Mod queue ────────────────────────────────────────────────────────────

section('6) getModQueue');
let newReportFired = 0;
events.on('admin:new_report', 'test:new_report', () => { newReportFired++; });

// Bob gets reported by Alice
moderation.recordIncident(alice.id, bob.id, 'scamming', { reason: 'tried to phish' });
assert(newReportFired >= 1, '6.1 admin:new_report bus event fired on recordIncident');

const queue = adminApi.getModQueue();
assert(Array.isArray(queue.reports), '6.2 reports is an array');
assert(queue.reports.length >= 1, '6.3 At least one report in queue');
assert(Array.isArray(queue.strikes), '6.4 strikes array returned');
assert(typeof queue.ruleCount === 'number' && queue.ruleCount > 0, '6.5 ruleCount > 0');

// Apply a strike to Bob and check it appears in the strikes list
moderation.applyStrike(bob, 'scamming', 'test strike', alice, {});
const q2 = adminApi.getModQueue();
assert(q2.strikes.length >= 1, '6.6 applied strike appears');
assert(q2.strikes[0].playerId === bob.id, '6.7 strike has playerId');
assert(q2.strikes[0].playerName === 'Bob', '6.8 strike has playerName');

// ── Bot leaderboard ─────────────────────────────────────────────────────

section('7) getBotLeaderboard');
const lb = adminApi.getBotLeaderboard(10);
assert(lb.ok === true, '7.1 ok');
assert(Array.isArray(lb.leaderboard), '7.2 leaderboard array');
assert(lb.leaderboard.length >= 1, '7.3 at least Bob present');
// Bob should be at top (highest score)
assert(lb.leaderboard[0].playerId === bob.id || lb.leaderboard[0].playerName === 'Bob',
  '7.4 Top scorer is Bob');
assert(typeof lb.leaderboard[0].score === 'number', '7.5 score is number');
// Limit
const lb2 = adminApi.getBotLeaderboard(1);
assert(lb2.leaderboard.length === 1, '7.6 limit respected');

// ── Trade log ───────────────────────────────────────────────────────────

section('8) getTradeLog');
const tlog = adminApi.getTradeLog(10);
assert(tlog.ok === true, '8.1 ok');
assert(Array.isArray(tlog.trades), '8.2 trades array');
assert(Array.isArray(tlog.topVolume), '8.3 topVolume array');

// ── Audit log ───────────────────────────────────────────────────────────

section('9) getAuditLog');
// Moderation's audit should have fired (from recordIncident + applyStrike earlier)
const audit = adminApi.getAuditLog({ limit: 50 });
assert(audit.ok === true, '9.1 ok');
assert(Array.isArray(audit.entries), '9.2 entries array');
assert(audit.entries.length >= 2, '9.3 At least 2 audit entries (report_filed, strike_applied)');

// since= filter
const now = Date.now();
// Sleep briefly by manipulating timestamps: we'll just call with future "since" and expect empty.
const auditFuture = adminApi.getAuditLog({ since: now + 86400000 });
eq(auditFuture.entries.length, 0, '9.4 since= future returns empty');

// ── Scheduled events ─────────────────────────────────────────────────────

section('10) Events');
const badKind = adminApi.scheduleEvent({ kind: 'nonexistent', at: Date.now() + 1000 });
assert(badKind.ok === false, '10.1 Unknown kind rejected');

const pastTime = adminApi.scheduleEvent({ kind: 'xp_weekend', at: Date.now() - 86400000 });
assert(pastTime.ok === false, '10.2 Past time rejected');

const good = adminApi.scheduleEvent({ kind: 'xp_weekend', at: Date.now() + 3600000, payload: { multiplier: 2 }, by: 'Alice' });
assert(good.ok === true && good.event && good.event.id, '10.3 Valid schedule persists');

const list = adminApi.listEvents();
assert(list.some(e => e.id === good.event.id), '10.4 listEvents contains new event');

const cancel1 = adminApi.cancelEvent(good.event.id, 'Alice');
assert(cancel1.ok === true, '10.5 First cancel succeeds');
assert(cancel1.event.status === 'cancelled', '10.6 status=cancelled');

const cancel2 = adminApi.cancelEvent(good.event.id, 'Alice');
assert(cancel2.ok === false, '10.7 Second cancel rejected');

// ── Config ──────────────────────────────────────────────────────────────

section('11) Config');
// Seed bot-policy first
bot.loadPolicy();

const cfg = adminApi.getConfig('bot-policy');
assert(cfg && typeof cfg === 'object', '11.1 bot-policy config loaded');

const badUpdate = adminApi.updateConfig('bot-policy', { policy: 'bogus' }, 'Alice');
assert(badUpdate.ok === false, '11.2 Invalid policy rejected');

const goodUpdate = adminApi.updateConfig('bot-policy', { policy: 'licensed', banThreshold: 0.85 }, 'Alice');
assert(goodUpdate.ok === true, '11.3 Valid update persists');

// Hot reload check
const botCfg = bot.getPolicy();
assert(botCfg.policy === 'licensed', '11.4 Hot reload applied to bot module');

const unknownKey = adminApi.getConfig('nope');
assert(unknownKey === null, '11.5 Unknown key returns null');

// Audit entry should have been written for config update
const afterCfgAudit = adminApi.getAuditLog({ limit: 50 });
assert(afterCfgAudit.entries.some(e => e.action === 'admin_config_update'),
  '11.6 Config update audit line written');

// Test all CONFIG_KEYS present
assert(adminApi.CONFIG_KEYS.includes('bot-policy'), '11.7 CONFIG_KEYS has bot-policy');
assert(adminApi.CONFIG_KEYS.includes('channel-config'), '11.8 CONFIG_KEYS has channel-config');
assert(adminApi.CONFIG_KEYS.includes('server-rules'), '11.9 CONFIG_KEYS has server-rules');

// ── Clans ───────────────────────────────────────────────────────────────

section('12) Clans');
const clans = adminApi.getClans({ limit: 10 });
assert(clans.ok === true, '12.1 ok');
assert(clans.clans.length === 1, '12.2 one clan');
eq(clans.clans[0].name, 'Testing Guild', '12.3 clan name');
eq(clans.clans[0].memberCount, 2, '12.4 member count');

// ── Content summary ────────────────────────────────────────────────────

section('13) getContentSummary');
const content = adminApi.getContentSummary();
assert(content && typeof content === 'object', '13.1 content summary returned');
assert('stagedOverrides' in content, '13.2 stagedOverrides key present');
assert('entityTypes' in content, '13.3 entityTypes key present');

// ── Overview push + alerts ──────────────────────────────────────────────

section('14) Overview push + alert throttling');
let overviewTicks = 0;
events.on('admin:overview_tick', 'test:overview-tick', () => { overviewTicks++; });

adminApi.startOverviewPush(100);
setTimeout(() => {
  assert(overviewTicks >= 1, '14.1 admin:overview_tick fires');
  adminApi.stopOverviewPush();

  // Alert throttling: fire two identical events in quick succession.
  let alertsFired = 0;
  events.on('admin:alert', 'test:alert-count', () => { alertsFired++; });
  events.emit('bot:escalated', { playerId: bob.id, playerName: 'Bob', score: 0.9, reason: 'test' });
  events.emit('bot:escalated', { playerId: bob.id, playerName: 'Bob', score: 0.9, reason: 'test' });
  assert(alertsFired === 1, '14.2 duplicate alert throttled (1 fired, 1 suppressed)');

  // Final summary
  console.log(`\n── Summary ─────────────────────────────────────`);
  console.log(`  Passed: ${passed}`);
  console.log(`  Failed: ${failed}`);
  if (failed > 0) {
    console.log('\nFailures:');
    for (const f of failures) console.log('  - ' + f);
  }
  // Cleanup
  try { fs.rmSync(tmpDataDir, { recursive: true, force: true }); } catch {}
  process.exit(failed > 0 ? 1 : 0);
}, 250);
