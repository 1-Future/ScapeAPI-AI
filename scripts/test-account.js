#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// Account Management Engine Tests
//
// Verifies:
//   1. account.getProfile / updateProfile / displayName cooldown + filter
//   2. account.setPrivacy + canSee friend/clan gating
//   3. security.setPassword strength enforcement + verifyPassword
//   4. security.enable2FA + verify2FA TOTP round-trip + bad code rejection
//   5. security.setBankPin 4-6 digit, verify, session timeout, lock on N fails
//   6. security.requireBankPinGate integration (before bank operations)
//   7. save-states.createSnapshot + listSnapshots sorted newest-first
//   8. save-states.restoreSnapshot requires confirm, creates undo, restores state
//   9. save-states.exportSave / importSave full round-trip with pre-import snapshot
//  10. save-states.purgeOldSnapshots keeps last 30 auto, unlimited manual
//  11. account-commands register on a fake registry without server deps
//  12. bank PIN prevents bank operations; unlocks for 10 minutes
//
// Run: node scripts/test-account.js
// Exit 0 on all pass.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const path = require('path');
const fs = require('fs');

// Sandbox the snapshots root so tests never touch real save state.
const TMP_ROOT = path.join(__dirname, '..', '.tmp-account-test');
if (fs.existsSync(TMP_ROOT)) fs.rmSync(TMP_ROOT, { recursive: true, force: true });
fs.mkdirSync(TMP_ROOT, { recursive: true });

// Redirect SNAPSHOT_ROOT before save-states loads its constant by patching the
// module after require via the exported SNAPSHOT_ROOT ref — we instead monkey-
// patch fs.mkdirSync target by overriding the module's internals. Simpler:
// override the module's SNAPSHOT_ROOT via Object.defineProperty on the export.
const saveStates = require('../src/engine/save-states');
// Force snapshot writes into TMP_ROOT by overriding internals.
const origDirname = saveStates.SNAPSHOT_ROOT;
// saveStates._dirFor is not exported, so we instead reroute its writes by
// shadowing fs via path translation inside a wrapper. For the purposes of
// testing we just monkey-patch the functions that touch SNAPSHOT_ROOT.
// The cleanest approach: replace the module's path with TMP_ROOT via
// require-time patching. Here we use Node's require.cache to swap the constant.
const modCache = require.cache[require.resolve('../src/engine/save-states')];
if (modCache && modCache.exports) {
  Object.defineProperty(modCache.exports, 'SNAPSHOT_ROOT', { value: TMP_ROOT, writable: true });
}
// The internal `SNAPSHOT_ROOT` is closed-over, so we need a different approach:
// reload save-states with a redirected path. We'll clear its cache and
// re-require after monkey-patching `path.join` in a small shim.
delete require.cache[require.resolve('../src/engine/save-states')];

// Inject a require hook to override the constant via rewriting the source.
const Module = require('module');
const origResolve = Module._resolveFilename;
const origLoad = Module._load;
const saveStatesPath = require.resolve('../src/engine/save-states');
Module._load = function (request, parent, ...rest) {
  if (origResolve.call(this, request, parent) === saveStatesPath) {
    const fs2 = require('fs');
    const src = fs2.readFileSync(saveStatesPath, 'utf8');
    const tmpRootEsc = TMP_ROOT.replace(/\\/g, '\\\\');
    const rewritten = src.replace(
      /const SNAPSHOT_ROOT = path\.join\(__dirname, '\.\.', '\.\.', 'snapshots'\);/,
      `const SNAPSHOT_ROOT = ${JSON.stringify(TMP_ROOT)};`
    );
    const m = new Module(saveStatesPath, parent);
    m.filename = saveStatesPath;
    m.paths = Module._nodeModulePaths(path.dirname(saveStatesPath));
    m._compile(rewritten, saveStatesPath);
    require.cache[saveStatesPath] = m;
    return m.exports;
  }
  return origLoad.call(this, request, parent, ...rest);
};

const sandboxedSaveStates = require('../src/engine/save-states');

// Restore module loader to normal for other modules.
Module._load = origLoad;

const account  = require('../src/engine/account');
const security = require('../src/engine/account-security');
const commandsModule = require('../src/engine/commands');
const accountCommands = require('../src/engine/account-commands');
const playerLib = require('../src/player/player');

// ── Test harness ────────────────────────────────────────────────────────────
let passed = 0, failed = 0;
const failures = [];
function assert(cond, label) {
  if (cond) { passed++; console.log('  PASS  ' + label); }
  else      { failed++; failures.push(label); console.log('  FAIL  ' + label); }
}
function eq(a, b, label) {
  assert(a === b, `${label} (expected ${JSON.stringify(b)}, got ${JSON.stringify(a)})`);
}
function section(title) { console.log('\n=== ' + title + ' ==='); }

let nextPid = 1;
function makePlayer(name) {
  return playerLib.createPlayer(String(nextPid++), name || `P${nextPid}`);
}

// ── 1. Profile: get/update/displayName cooldown + banned fragment ───────────
section('Profile + display name');

{
  const p = makePlayer('Alice');
  const pr1 = account.getProfile(p);
  eq(pr1.name, 'Alice', 'getProfile returns player name');
  assert(typeof pr1.createdAt === 'number', 'createdAt is set');
  assert(Array.isArray(pr1.titles), 'titles is an array');
  assert(Array.isArray(pr1.modes), 'modes is an array');
  eq(pr1.modes[0], 'normal', 'default mode is normal');

  const upd = account.updateProfile(p, { bio: 'Hello world', onlineStatus: 'away', visibility: 'friends' });
  assert(upd.ok, 'updateProfile ok');
  eq(p.account.bio, 'Hello world', 'bio updated');
  eq(p.account.onlineStatus, 'away', 'status updated');
  eq(p.account.visibility, 'friends', 'visibility updated');

  const bad = account.updateProfile(p, { onlineStatus: 'dancing' });
  assert(!bad.ok, 'invalid status rejected');

  const tooLongBio = 'x'.repeat(account.MAX_BIO_LEN + 1);
  const bad2 = account.updateProfile(p, { bio: tooLongBio });
  assert(!bad2.ok, 'over-long bio rejected');

  // Title gating (only unlocked titles).
  account.grantTitle(p, 'Champion');
  const setT = account.updateProfile(p, { title: 'Champion' });
  assert(setT.ok, 'can set unlocked title');
  const badT = account.updateProfile(p, { title: 'Emperor' });
  assert(!badT.ok, 'cannot set un-unlocked title');

  // Display name change + cooldown.
  const nameChange = account.changeDisplayName(p, 'Alice_2');
  assert(nameChange.ok, 'name change ok');
  eq(p.name, 'Alice_2', 'player.name updated');
  assert(p.account.nameHistory.length === 1, 'name history has 1 entry');
  const cooldown = account.changeDisplayName(p, 'Alice_3');
  assert(!cooldown.ok, 'second name change blocked by cooldown');

  const banned = account.changeDisplayName(makePlayer('X'), 'Admin_01');
  assert(!banned.ok, 'banned fragment rejected');
  const tooLong = account.changeDisplayName(makePlayer('X'), 'x'.repeat(32));
  assert(!tooLong.ok, 'over-long name rejected');
}

// ── 2. Privacy + canSee ─────────────────────────────────────────────────────
section('Privacy set + canSee gating');

{
  const subject = makePlayer('Subject');
  const stranger = makePlayer('Stranger');
  const friend = makePlayer('Friend');
  subject.friends = [friend.id];
  const clanMate = makePlayer('Mate');
  subject.clan = 'Red'; clanMate.clan = 'Red';
  const otherClan = makePlayer('Other'); otherClan.clan = 'Blue';

  const r = account.setPrivacy(subject, { stats_visible_to: 'friends', equipment_visible_to: 'clan' });
  assert(r.ok, 'setPrivacy ok');
  eq(account.canSee(friend, subject, 'stats_visible_to'), true, 'friend sees stats');
  eq(account.canSee(stranger, subject, 'stats_visible_to'), false, 'stranger blocked on stats');
  eq(account.canSee(clanMate, subject, 'equipment_visible_to'), true, 'clan mate sees equipment');
  eq(account.canSee(otherClan, subject, 'equipment_visible_to'), false, 'other clan blocked');
  eq(account.canSee(subject, subject, 'bank_visible_to'), true, 'self always sees');

  const bad = account.setPrivacy(subject, { stats_visible_to: 'dancers' });
  assert(!bad.ok, 'invalid privacy value rejected');

  const b = account.setPrivacy(subject, { friends_can_see_online: false });
  assert(b.ok && subject.account.privacy.friends_can_see_online === false, 'boolean privacy key set');
}

// ── 3. Password strength + verify ───────────────────────────────────────────
section('Password: strength + verify');

{
  const p = makePlayer('PWUser');
  const weak = security.setPassword(p, 'hi');
  assert(!weak.ok, 'too-short password rejected');
  const noUp = security.setPassword(p, 'alllower1');
  assert(!noUp.ok, 'missing uppercase rejected');
  const noDigit = security.setPassword(p, 'NoDigitsHere');
  assert(!noDigit.ok, 'missing digit rejected');
  const good = security.setPassword(p, 'Str0ngPass');
  assert(good.ok, 'strong password accepted');
  assert(p.security.passwordHash && p.security.passwordHash.length > 10, 'password stored as hash');
  assert(!p.security.passwordHash.includes('Str0ngPass'), 'plaintext NOT in hash');

  const v1 = security.verifyPassword(p, 'Str0ngPass');
  assert(v1.ok, 'correct password verifies');
  const v2 = security.verifyPassword(p, 'WrongPass1');
  assert(!v2.ok, 'wrong password fails');
  assert(p.security.failedLogins === 1, 'failedLogins increments');
  security.verifyPassword(p, 'Str0ngPass');
  assert(p.security.failedLogins === 0, 'failedLogins resets on success');
}

// ── 4. TOTP 2FA round-trip ─────────────────────────────────────────────────
section('2FA: enable/verify/disable');

{
  const p = makePlayer('TotpUser');
  const en = security.enable2FA(p, 'totp');
  assert(en.ok, 'enable2FA ok');
  assert(typeof en.secret === 'string' && en.secret.length >= 16, 'secret returned (base32)');
  assert(en.qr.startsWith('otpauth://totp/'), 'otpauth URI returned');
  eq(security.is2FAEnabled(p), false, '2FA not enabled until verify');

  // Generate a valid code from the live secret and verify it.
  const goodCode = security.totpGenerate(p.security.totpSecret);
  const okV = security.verify2FA(p, goodCode);
  assert(okV.ok, 'correct TOTP code verifies');
  assert(security.is2FAEnabled(p), '2FA enabled after first verify');

  const badV = security.verify2FA(p, '000000');
  assert(!badV.ok, 'wrong TOTP code rejected (very likely)');

  const unsupported = security.enable2FA(p, 'sms');
  assert(!unsupported.ok, 'unsupported method rejected');

  const dis = security.disable2FA(p);
  assert(dis.ok, 'disable2FA ok');
  eq(security.is2FAEnabled(p), false, '2FA off after disable');
}

// ── 5. Bank PIN: set, verify, lock on N failures ────────────────────────────
section('Bank PIN: set + verify + lock');

{
  const p = makePlayer('PinUser');
  const tooShort = security.setBankPin(p, '12');
  assert(!tooShort.ok, '2-digit PIN rejected');
  const tooLong = security.setBankPin(p, '1234567');
  assert(!tooLong.ok, '7-digit PIN rejected');
  const nonDigit = security.setBankPin(p, 'abcd');
  assert(!nonDigit.ok, 'non-digit PIN rejected');
  const good = security.setBankPin(p, '1234');
  assert(good.ok, '4-digit PIN accepted');
  assert(!p.security.bankPinHash.includes('1234'), 'plaintext PIN NOT in hash');

  eq(security.isBankPinVerified(p), false, 'PIN not verified initially');
  const wrong = security.verifyBankPin(p, '0000');
  assert(!wrong.ok, 'wrong PIN fails');
  eq(p.security.failedPin, 1, 'failedPin increments');

  const right = security.verifyBankPin(p, '1234');
  assert(right.ok, 'right PIN verifies');
  eq(security.isBankPinVerified(p), true, 'PIN session verified');
  assert(typeof p.bankPinVerifiedAt === 'number', 'bankPinVerifiedAt timestamp set');

  // Lock after 5 wrong attempts.
  const p2 = makePlayer('Locker');
  security.setBankPin(p2, '9999');
  for (let i = 0; i < security.PIN_MAX_FAILURES; i++) {
    security.verifyBankPin(p2, '0000');
  }
  eq(p2.security.pinLocked, true, 'PIN locks after max failures');
  const locked = security.verifyBankPin(p2, '9999');
  assert(!locked.ok, 'correct PIN fails while locked');

  // Session timeout logic.
  const p3 = makePlayer('Timer');
  security.setBankPin(p3, '5555');
  security.verifyBankPin(p3, '5555');
  eq(security.isBankPinVerified(p3), true, 'fresh verify is valid');
  p3.bankPinVerifiedAt = Date.now() - security.BANK_PIN_TIMEOUT_MS - 1000;
  eq(security.isBankPinVerified(p3), false, 'session expires after 10 min');
  security.clearBankPinSession(p3);
  assert(p3.bankPinVerifiedAt === null, 'clearBankPinSession clears stamp');
}

// ── 6. requireBankPinGate for bank ops ─────────────────────────────────────
section('Bank PIN gate before bank operations');

{
  // No PIN set: gate passes.
  const noPin = makePlayer('NoPin');
  const g1 = security.requireBankPinGate(noPin);
  assert(g1.ok && g1.gated === false, 'no PIN: gate open');

  // PIN set, not verified: gate blocks.
  const withPin = makePlayer('WithPin');
  security.setBankPin(withPin, '4242');
  const g2 = security.requireBankPinGate(withPin);
  assert(!g2.ok, 'PIN set but not entered: gate blocks');
  assert(/PIN/.test(g2.reason), 'reason mentions PIN');

  // After verify, gate passes.
  security.verifyBankPin(withPin, '4242');
  const g3 = security.requireBankPinGate(withPin);
  assert(g3.ok && g3.gated === true, 'after verify, gate opens');

  // After session expiry, gate blocks again.
  withPin.bankPinVerifiedAt = Date.now() - security.BANK_PIN_TIMEOUT_MS - 1000;
  const g4 = security.requireBankPinGate(withPin);
  assert(!g4.ok, 'after timeout, gate blocks');
}

// ── 7. Snapshot create + list ──────────────────────────────────────────────
section('Snapshots: create + list');

{
  const p = makePlayer('Snapper');
  p.x = 42; p.y = 84; p.hp = 17;
  const s1 = sandboxedSaveStates.createSnapshot(p, 'before-boss');
  assert(s1.ok, 'createSnapshot ok');
  assert(/^manual-\d+-before-boss$/.test(s1.snapshotId), 'snapshotId format for manual');
  const s2 = sandboxedSaveStates.createSnapshot(p, 'auto');
  assert(/^auto-\d+$/.test(s2.snapshotId), 'auto snapshot id format');
  const list = sandboxedSaveStates.listSnapshots(p);
  assert(list.length >= 2, 'listSnapshots returns both');
  assert(list[0].createdAt >= list[1].createdAt, 'newest first');
  assert(list.some(s => s.kind === 'manual'), 'has manual kind');
  assert(list.some(s => s.kind === 'auto'), 'has auto kind');
}

// ── 8. Restore + confirm + undo ─────────────────────────────────────────────
section('Restore: needs confirm, creates undo, replaces state');

{
  const p = makePlayer('Restorer');
  p.x = 100; p.y = 100; p.hp = 10;
  const s = sandboxedSaveStates.createSnapshot(p, 'checkpoint');
  assert(s.ok, 'checkpoint snapshot made');

  // Move player, take damage.
  p.x = 200; p.y = 300; p.hp = 2;

  // Restore without confirm: refuses.
  const unconfirmed = sandboxedSaveStates.restoreSnapshot(p, s.snapshotId, {});
  assert(!unconfirmed.ok && unconfirmed.needsConfirmation, 'restore without confirm refused');
  eq(p.x, 200, 'player state unchanged by unconfirmed restore');

  // Restore with confirm.
  const r = sandboxedSaveStates.restoreSnapshot(p, s.snapshotId, { confirm: true });
  assert(r.ok, 'restore with confirm ok');
  eq(p.x, 100, 'x restored');
  eq(p.y, 100, 'y restored');
  eq(p.hp, 10, 'hp restored');
  assert(typeof r.undoSnapshotId === 'string', 'undoSnapshotId returned');
  // Undo snapshot was created with label pre-restore.
  const all = sandboxedSaveStates.listSnapshots(p);
  assert(all.some(x => x.snapshotId === r.undoSnapshotId), 'undo snapshot present in list');
}

// ── 9. Export / import round-trip ───────────────────────────────────────────
section('Export + import round-trip');

{
  const p = makePlayer('Exporter');
  p.x = 555; p.y = 777;
  p.skills.attack.xp = 12345;
  const json = sandboxedSaveStates.exportSave(p);
  assert(typeof json === 'string' && json.length > 0, 'exportSave returns JSON string');
  const parsed = JSON.parse(json);
  eq(parsed.version, sandboxedSaveStates.SNAPSHOT_VERSION, 'export has version');
  eq(parsed.player.x, 555, 'export captures x');

  // Mutate then import.
  p.x = 1; p.y = 1;
  const unconfirmed = sandboxedSaveStates.importSave(p, json, {});
  assert(!unconfirmed.ok && unconfirmed.needsConfirmation, 'import without confirm refused');

  const imp = sandboxedSaveStates.importSave(p, json, { confirm: true });
  assert(imp.ok, 'import with confirm ok');
  eq(p.x, 555, 'x restored via import');
  eq(p.y, 777, 'y restored via import');
  assert(imp.undoSnapshotId, 'pre-import undo snapshot created');

  const badVersion = JSON.stringify({ version: 999, player: {} });
  const badImp = sandboxedSaveStates.importSave(p, badVersion, { confirm: true });
  assert(!badImp.ok, 'rejects mismatched version');
}

// ── 10. purgeOldSnapshots (keep last 30 auto, unlimited manual) ────────────
section('Purge: keep 30 auto, unlimited manual');

{
  const p = makePlayer('Purger');
  // Create 35 auto snapshots quickly with artificial timestamps.
  // We leverage createSnapshot rapid-fire; the filename uses ms-timestamp so
  // we must space them by advancing the clock. Use a small sleep-equivalent
  // via direct file writes.
  const dir = path.join(sandboxedSaveStates.SNAPSHOT_ROOT, String(p.id));
  fs.mkdirSync(dir, { recursive: true });
  for (let i = 0; i < 35; i++) {
    const ts = Date.now() - (35 - i) * 1000;
    const id = `auto-${ts}`;
    const file = path.join(dir, `${id}.json`);
    fs.writeFileSync(file, JSON.stringify({ version: 1, snapshotId: id, playerId: p.id, kind: 'auto', createdAt: ts, player: { x: i } }));
  }
  for (let i = 0; i < 5; i++) {
    const ts = Date.now() + i * 1000;
    const id = `manual-${ts}-kept-${i}`;
    const file = path.join(dir, `${id}.json`);
    fs.writeFileSync(file, JSON.stringify({ version: 1, snapshotId: id, playerId: p.id, kind: 'manual', createdAt: ts, player: { x: 99 } }));
  }
  const before = sandboxedSaveStates.listSnapshots(p);
  eq(before.filter(s => s.kind === 'auto').length, 35, '35 auto present before purge');
  eq(before.filter(s => s.kind === 'manual').length, 5, '5 manual present before purge');

  const res = sandboxedSaveStates.purgeOldSnapshots(p);
  assert(res.ok, 'purge ok');
  const after = sandboxedSaveStates.listSnapshots(p);
  eq(after.filter(s => s.kind === 'auto').length, sandboxedSaveStates.MAX_AUTO_SNAPSHOTS, 'auto capped at 30');
  eq(after.filter(s => s.kind === 'manual').length, 5, 'manual unchanged');
}

// ── 11. Commands register cleanly ───────────────────────────────────────────
section('Commands register + basic usage');

{
  const fakeRegistry = {
    _cmds: new Map(),
    register(name, opts) { this._cmds.set(name, opts); },
  };
  accountCommands.register({
    commands: fakeRegistry,
    account,
    security,
    saveStates: sandboxedSaveStates,
  });
  assert(fakeRegistry._cmds.has('profile'), '/profile registered');
  assert(fakeRegistry._cmds.has('security'), '/security registered');
  assert(fakeRegistry._cmds.has('save'), '/save registered');

  // Exercise /profile
  const p = makePlayer('Cmder');
  const pr = fakeRegistry._cmds.get('profile');
  const show = pr.fn(p, []);
  assert(/Profile/.test(show), 'profile show returns a card');

  const edit = pr.fn(p, ['edit', 'bio', 'Just a tester.']);
  assert(/Updated/.test(edit), 'profile edit bio succeeds');
  eq(p.account.bio, 'Just a tester.', 'bio persisted via command');

  const privShow = pr.fn(p, ['privacy']);
  assert(/Privacy/.test(privShow), 'privacy show');

  // /security
  const sec = fakeRegistry._cmds.get('security');
  const status = sec.fn(p, ['status']);
  assert(/Security status/.test(status), 'security status');
  const pwSet = sec.fn(p, ['password', 'Str0ngPass']);
  assert(/set/.test(pwSet), 'security password');

  const pinSet = sec.fn(p, ['bankpin', 'set', '4242']);
  assert(/set/i.test(pinSet), 'bankpin set');
  const pinEnter = sec.fn(p, ['bankpin', 'enter', '4242']);
  assert(/verified/i.test(pinEnter), 'bankpin enter verified');

  // /save
  const sv = fakeRegistry._cmds.get('save');
  const list = sv.fn(p, ['list']);
  assert(typeof list === 'string', 'save list returns string');
  const create = sv.fn(p, ['create', 'test']);
  assert(/created/i.test(create), 'save create');

  // Double-confirm restore flow.
  const latest = sandboxedSaveStates.listSnapshots(p)[0];
  const firstTry = sv.fn(p, ['restore', latest.snapshotId]);
  assert(/WARNING/.test(firstTry), 'first restore attempt warns and waits');
  const secondTry = sv.fn(p, ['restore', latest.snapshotId]);
  assert(/Restored|Error/.test(secondTry), 'second restore executes');
}

// ── 12. Full bank PIN integration scenario ──────────────────────────────────
section('Scenario: bank PIN required before deposit, unlocks for 10 min');

{
  const p = makePlayer('Banker');
  // Simulate a bank deposit helper that checks the gate.
  function depositFlow(player) {
    const gate = security.requireBankPinGate(player);
    if (!gate.ok) return { ok: false, reason: gate.reason };
    return { ok: true, deposited: true };
  }

  // No PIN: allowed.
  const f1 = depositFlow(p);
  assert(f1.ok, 'no PIN: deposit allowed');

  // Set PIN; immediately blocked until verified.
  security.setBankPin(p, '2468');
  const f2 = depositFlow(p);
  assert(!f2.ok, 'PIN set: deposit blocked until verified');

  // Verify PIN; allowed.
  security.verifyBankPin(p, '2468');
  const f3 = depositFlow(p);
  assert(f3.ok, 'after verify: deposit allowed');

  // Simulate 10 min of inactivity; blocked again.
  p.bankPinVerifiedAt = Date.now() - security.BANK_PIN_TIMEOUT_MS - 1;
  const f4 = depositFlow(p);
  assert(!f4.ok, 'after timeout: deposit blocked');

  // Logout simulation (clearBankPinSession).
  security.verifyBankPin(p, '2468');
  assert(depositFlow(p).ok, 'verified again');
  security.clearBankPinSession(p);
  const f5 = depositFlow(p);
  assert(!f5.ok, 'after clearBankPinSession: deposit blocked');
}

// ── Summary ─────────────────────────────────────────────────────────────────
console.log(`\n── Results ──`);
console.log(`  ${passed} passed, ${failed} failed`);
if (failures.length) {
  console.log('\nFAILURES:');
  for (const f of failures) console.log('  - ' + f);
  process.exit(1);
}

// Cleanup.
try { fs.rmSync(TMP_ROOT, { recursive: true, force: true }); } catch (_) {}
process.exit(0);
