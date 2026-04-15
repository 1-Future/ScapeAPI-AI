#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// Moderation Engine Tests
//
// Covers:
//   - rules registry (definition, escalation resolution)
//   - report pipeline (file, queue, resolve)
//   - strike application (rule escalation, role gating)
//   - appeals (file, review, strike lifting, 30-day window)
//   - direct mod actions (mute, unmute, kick, ban, unban, rollback, transfer,
//     broadcast, role)
//   - audit log (every action recorded)
//   - evidence capture (chat/location/combat)
//   - self-action protection (no self-strike, no self-appeal, no self-report)
//   - role promotion restricted to owner
//
// Run: node scripts/test-moderation.js
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const path = require('path');
const fs = require('fs');

// Sandbox persistence so tests never touch real data.
const tmpDataDir = path.join(__dirname, '..', '.tmp-moderation-test');
if (fs.existsSync(tmpDataDir)) fs.rmSync(tmpDataDir, { recursive: true, force: true });
fs.mkdirSync(tmpDataDir, { recursive: true });

// Override persistence BEFORE modules that use it are loaded.
const persistence = require('../src/engine/persistence');
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
// Make audit log also land in the sandbox.
persistence.DATA_DIR = tmpDataDir;

const rules = require('../src/engine/rules');
const moderation = require('../src/engine/moderation');
const playerLib = require('../src/player/player');
const commands = require('../src/engine/commands');
const modCommands = require('../src/engine/mod-commands');

// Register the Aelgard rule registry and capture the id list.
const ruleRegistry = require('../src/content/aelgard/rules-registry');

// ── Test harness ────────────────────────────────────────────────────────────
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
function section(title) { console.log('\n=== ' + title + ' ==='); }

// ── Fixture ─────────────────────────────────────────────────────────────────
let nextPid = 1;
function makePlayer(name, role) {
  const p = playerLib.createPlayer(String(nextPid++), name);
  if (role) p.role = role;
  if (role === 'admin' || role === 'owner') p.admin = true;
  return p;
}
let currentTick = 1000;
moderation.setTickSource(() => currentTick);

// Wire mod-commands so we can also smoke the command layer.
const playerIndex = new Map();
function registerPlayer(p) { playerIndex.set(String(p.id), p); playerIndex.set(p.name, p); return p; }
function findPlayer(token) { return playerIndex.get(String(token)) || null; }
modCommands.register({
  commands,
  moderation,
  rules,
  findPlayer,
  getTick: () => currentTick,
  restoreSnapshot: (player, snapshotId) => {
    player.restoredTo = snapshotId;
    return { ok: true };
  },
  invRemove: (p, itemId, n) => { p._removed = (p._removed || 0) + n; return n; },
  invAdd:    (p, itemId, _name, n) => { p._added = (p._added || 0) + n; return true; },
});

// ── 1. Rules registry ───────────────────────────────────────────────────────
section('Rules registry');

assert(ruleRegistry.RULE_IDS.length >= 20,
  `rules-registry exposes 20+ ids (got ${ruleRegistry.RULE_IDS.length})`);
for (const id of ruleRegistry.RULE_IDS) {
  assert(rules.hasRule(id), `rules.hasRule(${id})`);
}
const rwt = rules.getRule('rwt');
assert(!!rwt, 'getRule(rwt) returns rule');
eq(rwt.severity, 'severe', 'rwt is severe');
eq(typeof rwt.description, 'string', 'rwt has description');
assert(rwt.escalation.length >= 1, 'rwt has escalation');

// Bad-spec rejections
try {
  rules.defineRule('', { title: 'x', description: 'x', severity: 'minor', default_action: 'warn', escalation: [{ strikes: 1, action: 'warn', duration_days: 0 }] });
  assert(false, 'empty id throws');
} catch { assert(true, 'empty id throws'); }

try {
  rules.defineRule('bad_sev', {
    title: 'x', description: 'x', severity: 'nope',
    default_action: 'warn', escalation: [{ strikes: 1, action: 'warn', duration_days: 0 }],
  });
  assert(false, 'bad severity throws');
} catch { assert(true, 'bad severity throws'); }

try {
  rules.defineRule('bad_esc', {
    title: 'x', description: 'x', severity: 'minor', default_action: 'warn',
    escalation: [],
  });
  assert(false, 'empty escalation throws');
} catch { assert(true, 'empty escalation throws'); }

// resolveAction
const harassment = rules.getRule('harassment');
const step1 = rules.resolveAction(harassment, 1);
const step3 = rules.resolveAction(harassment, 3);
eq(step1.action, 'warn', 'harassment @1 strike = warn');
eq(step3.action, 'tempban', 'harassment @3 strikes = tempban');
const step99 = rules.resolveAction(harassment, 99);
eq(step99.action, 'ban', 'harassment @99 strikes = last rung (ban)');

// listBySeverity
assert(rules.listBySeverity('severe').length >= 3, 'at least 3 severe rules');
assert(rules.listBySeverity('major').length >= 5, 'at least 5 major rules');
assert(rules.listBySeverity('minor').length >= 3, 'at least 3 minor rules');

// ── 2. Reports pipeline ─────────────────────────────────────────────────────
section('Reports pipeline');

moderation._resetAllForTests();
const reporter = registerPlayer(makePlayer('Reporter'));
const cheater  = registerPlayer(makePlayer('Cheater'));
const mod      = registerPlayer(makePlayer('ModBob', 'moderator'));
const admin    = registerPlayer(makePlayer('AdminAlice', 'admin'));
const owner    = registerPlayer(makePlayer('OwnerOmar', 'owner'));

// Evidence capture before report
moderation.pushChatLine(cheater.id, 'buy gold cheap dot com');
moderation.pushChatLine(cheater.id, '50m for 5usd paypal');
moderation.pushLocation(cheater.id, 100, 100, 0);
moderation.pushCombatEvent(cheater.id, 'kill', { target: 'cow' });

// Self-report rejected
{
  const r = moderation.recordIncident(reporter.id, reporter.id, 'rwt', { reason: 'self' });
  eq(r.ok, false, 'self-report rejected');
}
// Unknown rule rejected
{
  const r = moderation.recordIncident(reporter.id, cheater.id, 'flapjack', { reason: 'x' });
  eq(r.ok, false, 'unknown rule rejected');
}

// Valid report
const rep = moderation.recordIncident(reporter.id, cheater.id, 'rwt',
  { reason: 'selling gold in yell chat' });
eq(rep.ok, true, 'valid report filed');
assert(!!rep.id, 'report has id');
eq(rep.incident.status, 'pending', 'new report is pending');
assert(rep.incident.evidence.chat.length >= 2, 'chat evidence attached');
assert(rep.incident.evidence.combat.length >= 1, 'combat evidence attached');

// Queue lookup
const pending = moderation.reviewQueue();
eq(pending.length, 1, 'one pending report');

// Non-moderator can't resolve
{
  const r = moderation.resolveIncident(rep.id, 'upheld', reporter, {
    getPlayerById: (id) => findPlayer(id),
  });
  eq(r.ok, false, 'non-mod cannot resolve');
}

// Unknown resolution rejected
{
  const r = moderation.resolveIncident(rep.id, 'quantumdismissed', mod, {});
  eq(r.ok, false, 'unknown resolution rejected');
}

// Upheld: applies strike
{
  const r = moderation.resolveIncident(rep.id, 'upheld', mod, {
    getPlayerById: (id) => findPlayer(id),
  });
  eq(r.ok, true, 'mod can uphold report');
  assert(!!r.strike && !!r.strike.strike, 'upheld produces a strike');
  eq(r.strike.strike.action, 'tempban', 'rwt first strike = tempban');
}
eq(moderation.reviewQueue().length, 0, 'queue empty after resolve');
eq(moderation.reviewQueue('upheld').length, 1, 'upheld count = 1');

// Already-resolved report cannot be re-resolved
{
  const r = moderation.resolveIncident(rep.id, 'dismissed', mod, {});
  eq(r.ok, false, 'cannot re-resolve');
}

// Dismiss path
const rep2 = moderation.recordIncident(reporter.id, cheater.id, 'chat_spam',
  { reason: 'flooding' });
{
  const r = moderation.resolveIncident(rep2.id, 'dismissed', mod, {
    getPlayerById: (id) => findPlayer(id),
    resolveNote: 'context ok',
  });
  eq(r.ok, true, 'dismiss accepted');
  eq(r.strike, null, 'dismissal creates no strike');
}

// Escalate path
const rep3 = moderation.recordIncident(reporter.id, cheater.id, 'harassment',
  { reason: 'targeted' });
{
  const r = moderation.resolveIncident(rep3.id, 'escalated', mod, {});
  eq(r.ok, true, 'escalate accepted');
  eq(r.report.status, 'escalated', 'report status = escalated');
}

// ── 3. Strikes ──────────────────────────────────────────────────────────────
section('Strikes');

// Non-mod cannot apply
{
  const r = moderation.applyStrike(cheater, 'chat_spam', 'flooding', reporter);
  eq(r.ok, false, 'non-mod cannot applyStrike');
}
// Self-strike blocked
{
  const r = moderation.applyStrike(mod, 'chat_spam', 'self', mod);
  eq(r.ok, false, 'cannot strike self');
}
// Unknown rule rejected
{
  const r = moderation.applyStrike(cheater, 'banana', 'x', mod);
  eq(r.ok, false, 'unknown rule on applyStrike rejected');
}

// Apply ladder on harassment
const chatterer = registerPlayer(makePlayer('Chatterer'));
const s1 = moderation.applyStrike(chatterer, 'harassment', 'first', mod);
const s2 = moderation.applyStrike(chatterer, 'harassment', 'second', mod);
const s3 = moderation.applyStrike(chatterer, 'harassment', 'third', mod);
const s4 = moderation.applyStrike(chatterer, 'harassment', 'fourth', mod);
eq(s1.strike.action, 'warn',    'harassment #1 = warn');
eq(s2.strike.action, 'mute',    'harassment #2 = mute');
eq(s3.strike.action, 'tempban', 'harassment #3 = tempban');
eq(s4.strike.action, 'ban',     'harassment #4 = ban');

eq(moderation.countActiveStrikes(chatterer, 'harassment'), 4, '4 active strikes on harassment');

// getStrikeHistory
{
  const h = moderation.getStrikeHistory(chatterer);
  eq(h.length, 4, 'getStrikeHistory returns all 4');
}

// moderationState is synced
assert(chatterer.moderationState.banned === true, 'banned state reflects action');

// Strike for a different rule is independent (counts separately)
const sRwt = moderation.applyStrike(chatterer, 'rwt', 'gold seller', mod);
eq(sRwt.strike.strikeCount, 1, 'strike counts are per-rule');

// ── 4. Appeals ──────────────────────────────────────────────────────────────
section('Appeals');

// Appeal a non-existent strike
{
  const r = moderation.appeal(chatterer, 'nope_id', 'because');
  eq(r.ok, false, 'appeal on missing strike rejected');
}

// Valid appeal
const appealRes = moderation.appeal(chatterer, s1.strike.id, 'I was provoked');
eq(appealRes.ok, true, 'appeal filed');
assert(!!appealRes.id, 'appeal has id');

// Duplicate appeal rejected
{
  const r = moderation.appeal(chatterer, s1.strike.id, 'again');
  eq(r.ok, false, 'duplicate appeal rejected');
}

// Non-mod cannot review
{
  const r = moderation.reviewAppeal(appealRes.id, 'approved', reporter, {
    getPlayerById: (id) => findPlayer(id),
  });
  eq(r.ok, false, 'non-mod cannot review appeal');
}

// Self-review of own appeal blocked
const ownAppeal = moderation.appeal(chatterer, s2.strike.id, 'self-review test');
{
  chatterer.role = 'moderator';
  const r = moderation.reviewAppeal(ownAppeal.id, 'approved', chatterer, {
    getPlayerById: (id) => findPlayer(id),
  });
  eq(r.ok, false, 'cannot review your own appeal');
  delete chatterer.role;
}

// Approval lifts the strike
{
  const r = moderation.reviewAppeal(appealRes.id, 'approved', mod, {
    getPlayerById: (id) => findPlayer(id),
    note: 'first offence waived',
  });
  eq(r.ok, true, 'appeal approved');
  eq(r.lifted, true, 'strike marked lifted');
  const lifted = chatterer.strikes.find(s => s.id === s1.strike.id);
  eq(lifted.active, false, 'strike.active = false after lift');
}
eq(moderation.countActiveStrikes(chatterer, 'harassment'), 3, 'active count drops after lift');

// Denial leaves strike intact
const a2 = moderation.appeal(chatterer, s3.strike.id, 'try again');
{
  const r = moderation.reviewAppeal(a2.id, 'denied', mod, {
    getPlayerById: (id) => findPlayer(id),
  });
  eq(r.ok, true, 'appeal denied accepted');
  const s = chatterer.strikes.find(x => x.id === s3.strike.id);
  eq(s.active, true, 'denied: strike still active');
}

// Already-resolved appeal cannot be re-reviewed
{
  const r = moderation.reviewAppeal(appealRes.id, 'denied', mod, {});
  eq(r.ok, false, 'cannot re-review appeal');
}

// Non-appealable rule
const doxxStrike = moderation.applyStrike(chatterer, 'doxxing', 'leaked addr', admin);
{
  const r = moderation.appeal(chatterer, doxxStrike.strike.id, 'please');
  eq(r.ok, false, 'doxxing strike cannot be appealed');
}

// 30-day window
{
  const oldStrike = moderation.applyStrike(chatterer, 'chat_spam', 'old', mod);
  oldStrike.strike.appliedAt = Date.now() - 40 * 86400 * 1000;
  const r = moderation.appeal(chatterer, oldStrike.strike.id, 'late');
  eq(r.ok, false, 'appeal past 30-day window rejected');
}

// ── 5. Direct mod actions ───────────────────────────────────────────────────
section('Direct mod actions');

const victim = registerPlayer(makePlayer('Victim'));

// Mute + unmute
{
  const r = moderation.mute(mod, victim, 5, 'test');
  eq(r.ok, true, 'mute succeeds');
  eq(moderation.isMuted(victim), true, 'isMuted true');
  const r2 = moderation.unmute(mod, victim, 'test unmute');
  eq(r2.ok, true, 'unmute succeeds');
  eq(moderation.isMuted(victim), false, 'isMuted false after unmute');
}

// Kick
{
  const r = moderation.kick(mod, victim, 'afk');
  eq(r.ok, true, 'kick succeeds');
  assert(!!victim.kicked, 'victim.kicked set');
}

// Self-actions blocked
{
  const r = moderation.mute(mod, mod, 5, 'self');
  eq(r.ok, false, 'self-mute blocked');
  const r2 = moderation.kick(mod, mod, 'self');
  eq(r2.ok, false, 'self-kick blocked');
}

// Moderator cannot ban (admin-only)
{
  const r = moderation.ban(mod, victim, 3, 'spam');
  eq(r.ok, false, 'mod cannot ban');
}
// Admin can ban
{
  const r = moderation.ban(admin, victim, 3, 'spam');
  eq(r.ok, true, 'admin can ban');
  eq(moderation.isBanned(victim), true, 'victim is banned');
  const r2 = moderation.unban(admin, victim, 'appeal ok');
  eq(r2.ok, true, 'admin can unban');
  eq(moderation.isBanned(victim), false, 'not banned after unban');
}
// Permanent ban when duration == 0
{
  const r = moderation.ban(admin, victim, 0, 'bad actor');
  eq(r.ok, true, 'permanent ban');
  eq(victim.moderationState.banned, true, 'banned=true');
  moderation.unban(admin, victim, 'reset');
}

// Admin cannot act on another admin unless owner
{
  const r = moderation.ban(admin, owner, 0, 'coup');
  eq(r.ok, false, 'admin cannot ban owner');
}
{
  const r = moderation.ban(owner, admin, 0, 'demotion');
  eq(r.ok, true, 'owner can ban admin');
  moderation.unban(owner, admin, 'reset');
}

// Rollback
{
  const r = moderation.rollback(admin, victim, 'snap_2026_04_10', {
    restoreFn: (target, id) => { target.restoredTo = id; return { ok: true }; },
  });
  eq(r.ok, true, 'rollback succeeds');
  eq(victim.restoredTo, 'snap_2026_04_10', 'snapshot applied');
}
// Rollback without permission
{
  const r = moderation.rollback(mod, victim, 'x', { restoreFn: () => ({ ok: true }) });
  eq(r.ok, false, 'mod cannot rollback');
}

// Transfer
const giver = registerPlayer(makePlayer('Giver'));
const receiver = registerPlayer(makePlayer('Receiver'));
{
  const r = moderation.transfer(admin, giver, receiver, 'coins', 1000, {
    invRemove: (p, _id, n) => { p._removed = (p._removed || 0) + n; return n; },
    invAdd:    (p, _id, _n) => { p._added = (p._added || 0) + 1; return true; },
    itemName: 'coins',
  });
  eq(r.ok, true, 'transfer succeeds');
}
// Transfer without admin
{
  const r = moderation.transfer(mod, giver, receiver, 'coins', 100, {});
  eq(r.ok, false, 'mod cannot transfer');
}
// Same-source transfer blocked
{
  const r = moderation.transfer(admin, giver, giver, 'coins', 100, {});
  eq(r.ok, false, 'same-source transfer blocked');
}

// Broadcast
{
  const r = moderation.broadcast(mod, 'Server restart in 5 minutes.');
  eq(r.ok, true, 'broadcast succeeds');
  const r2 = moderation.broadcast(mod, '  ');
  eq(r2.ok, false, 'empty broadcast rejected');
  const r3 = moderation.broadcast(reporter, 'hello');
  eq(r3.ok, false, 'non-mod cannot broadcast');
}

// ── 6. Roles ────────────────────────────────────────────────────────────────
section('Roles');

const pleb = registerPlayer(makePlayer('Pleb'));
{
  const r = moderation.setRole(admin, pleb, 'moderator');
  eq(r.ok, false, 'admin cannot promote');
}
{
  const r = moderation.setRole(owner, pleb, 'moderator');
  eq(r.ok, true, 'owner can promote');
  eq(moderation.getRole(pleb), 'moderator', 'role is moderator');
}
{
  const r = moderation.setRole(owner, pleb, 'mascot');
  eq(r.ok, false, 'unknown role rejected');
}

// hasRole ladder
assert(moderation.hasRole(owner, 'admin'), 'owner hasRole admin');
assert(moderation.hasRole(admin, 'moderator'), 'admin hasRole moderator');
assert(!moderation.hasRole(pleb, 'admin'), 'moderator !hasRole admin');

// ── 7. Audit log ────────────────────────────────────────────────────────────
section('Audit log');

const audit = moderation.readAudit();
assert(audit.length >= 20, `audit log has 20+ entries (got ${audit.length})`);
const actions = new Set(audit.map(e => e.action));
assert(actions.has('report_filed'), 'audit has report_filed');
assert(actions.has('strike_applied'), 'audit has strike_applied');
assert(actions.has('appeal_filed'), 'audit has appeal_filed');
assert(actions.has('appeal_approved'), 'audit has appeal_approved');
assert(actions.has('mute'), 'audit has mute');
assert(actions.has('ban'), 'audit has ban');
assert(actions.has('broadcast'), 'audit has broadcast');
assert(actions.has('role_change'), 'audit has role_change');
assert(actions.has('rollback'), 'audit has rollback');
assert(actions.has('transfer'), 'audit has transfer');

// Audit entries carry tick + actor
const anyEntry = audit[0];
assert(typeof anyEntry.tick === 'number', 'audit entry has tick');
assert(!!anyEntry.action, 'audit entry has action');

// ── 8. Command surface smoke ────────────────────────────────────────────────
section('Command surface smoke');

const rulesOut = commands.execute(reporter, 'rules list');
assert(typeof rulesOut === 'string' && rulesOut.includes('rwt'),
  '/rules list contains rwt');

const rulesShow = commands.execute(reporter, 'rules show rwt');
assert(rulesShow.includes('Real-World Trading'),
  '/rules show rwt contains title');

const reportCmd = commands.execute(reporter, `report ${cheater.name} rwt selling`);
assert(reportCmd.startsWith('Report filed'), '/report files a report');

// Non-mod admin command rejected
{
  const out = commands.execute(reporter, 'admin reports list');
  eq(out, 'Admin only.', 'non-mod /admin rejected');
}

// Moderator can list reports
{
  const out = commands.execute(mod, 'admin reports list');
  assert(out.includes('rep_'), '/admin reports list shows pending');
}

// Admin help
{
  const out = commands.execute(mod, 'admin help');
  assert(out.includes('admin reports'), '/admin help describes reports');
}

// ── Done ────────────────────────────────────────────────────────────────────
console.log('\n=== Results ===');
console.log(`  Passed: ${passed}`);
console.log(`  Failed: ${failed}`);
if (failed > 0) {
  console.log('\nFailures:');
  for (const f of failures) console.log('  - ' + f);
  process.exitCode = 1;
} else {
  console.log('All moderation tests passed.');
}

// Cleanup sandbox
try { fs.rmSync(tmpDataDir, { recursive: true, force: true }); } catch {}
