#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// Communication Channels — Engine Tests (burn-v2)
//
// Covers:
//   1.  Channel registry has all 14 types, each with required metadata
//   2.  canSend / canRead access-control matrix for every channel
//   3.  Proximity enforcement on `public`
//   4.  Rate limit + cooldown (per-channel, per-player)
//   5.  Filter pipeline: profanity, disallowed links, length, auto-mute
//   6.  Friends / ignore / mute lifecycle
//   7.  Quick chat lookup (by id / category / search)
//   8.  sendMessage + audienceFor delivery
//   9.  Log writer round-trip (admin can read, player can self-inspect)
//   10. Persistence round-trip for friends and channel-settings tables
//   11. Commands integration: /say, /tell, /clan, /trade, /qc, /channel mute
//
// Run: node scripts/test-channels.js
// Exit 0 on all-pass, exit 1 on any failure.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const path = require('path');
const fs = require('fs');

// Sandbox persistence + log dir so tests never touch real data.
const tmpDir = path.join(__dirname, '..', '.tmp-channels-test');
if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true, force: true });
fs.mkdirSync(tmpDir, { recursive: true });

const channels = require('../src/engine/channels');
const quickchat = require('../src/content/aelgard/quickchat-presets');
const commands = require('../src/engine/commands');
const channelsCommands = require('../src/engine/channels-commands');

// ── Sandbox: redirect filter file and log dir ───────────────────────────────
const sandboxFilter = path.join(tmpDir, 'chat-filter.json');
const sandboxLogs   = path.join(tmpDir, 'chat-logs');
fs.writeFileSync(sandboxFilter, JSON.stringify({
  profanity: ['badword', 'forbidden', 'nope'],
  urlAllowList: ['sc4p3.com', 'scape.wiki'],
}));
channels.setFilterFile(sandboxFilter);
channels.setChatLogDir(sandboxLogs);

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
function makePlayer(name, overrides = {}) {
  const p = Object.assign({
    id: String(nextPid++),
    name,
    x: 100, y: 100, layer: 0,
    admin: false,
  }, overrides);
  return p;
}

// Swap Date.now to a controllable value for rate-limit tests.
let mockNow = 1_700_000_000_000;
const realNow = Date.now;
function setNow(t) { mockNow = t; }
Date.now = () => mockNow;

// ── 1. Channel registry ─────────────────────────────────────────────────────
section('1. Channel registry');

const expected = [
  'public', 'private', 'clan', 'clan-broadcast', 'trade', 'help',
  'pvp', 'region', 'friends', 'staff', 'group-ironman',
  'quickchat', 'event', 'announce',
];
eq(channels.ALL_CHANNELS.length, 14, 'registry has exactly 14 channels');
for (const id of expected) {
  assert(channels.CHANNELS[id], `channel '${id}' is registered`);
}
for (const id of channels.ALL_CHANNELS) {
  const ch = channels.CHANNELS[id];
  assert(typeof ch.name === 'string' && ch.name.length > 0, `${id} has name`);
  assert(typeof ch.tag === 'string' && ch.tag.length > 0, `${id} has tag`);
  assert(ch.rateLimit && ch.rateLimit.messages && ch.rateLimit.windowMs, `${id} has rateLimit`);
  assert(typeof ch.logPath === 'string' && ch.logPath.length > 0, `${id} has logPath`);
}

// ── 2. Access control ───────────────────────────────────────────────────────
section('2. Access control (canSend / canRead)');

const alice = makePlayer('Alice', { x: 100, y: 100 });
const bob   = makePlayer('Bob',   { x: 105, y: 100 });
const faraway = makePlayer('Faraway', { x: 500, y: 500 });
const staff = makePlayer('Staff', { admin: true });
const clanA = makePlayer('ClanA', { clanId: 'red', clanRank: 'member' });
const clanB = makePlayer('ClanB', { clanId: 'red', clanRank: 'leader' });
const clanC = makePlayer('ClanC', { clanId: 'blue' });
const wildsP = makePlayer('Wildy', { inWilderness: true });
const regionP = makePlayer('Regional', { region: 'heartlands' });
const regionQ = makePlayer('Regional2', { region: 'heartlands' });
const regionR = makePlayer('Regional3', { region: 'glass-desert' });

// Public: proximity-gated
{
  const near = channels.canRead('public', bob, { speaker: alice });
  eq(near.allowed, true, 'public read in range');
  const far = channels.canRead('public', faraway, { speaker: alice });
  eq(far.allowed, false, 'public read out of range');
  const send = channels.canSend('public', alice);
  eq(send.allowed, true, 'public send allowed');
}

// Private whisper: only endpoints
{
  const r = channels.canRead('private', alice, { speaker: alice, recipient: bob });
  eq(r.allowed, true, 'speaker can read own whisper');
  const r2 = channels.canRead('private', bob, { speaker: alice, recipient: bob });
  eq(r2.allowed, true, 'recipient can read whisper');
  const r3 = channels.canRead('private', faraway, { speaker: alice, recipient: bob });
  eq(r3.allowed, false, 'third-party cannot read whisper');
}

// Clan: need same clan
{
  const r = channels.canSend('clan', clanA);
  eq(r.allowed, true, 'clan member can send');
  const r2 = channels.canSend('clan', alice);
  eq(r2.allowed, false, 'non-clanned player cannot send clan');
  const readSame = channels.canRead('clan', clanA, { speaker: clanB });
  eq(readSame.allowed, true, 'same-clan read allowed');
  const readOther = channels.canRead('clan', clanC, { speaker: clanA });
  eq(readOther.allowed, false, 'different-clan read blocked');
}

// Clan-broadcast: leader-only send
{
  const r = channels.canSend('clan-broadcast', clanA);
  eq(r.allowed, false, 'non-leader cannot broadcast');
  const r2 = channels.canSend('clan-broadcast', clanB);
  eq(r2.allowed, true, 'clan leader can broadcast');
}

// PvP wilderness
{
  const r = channels.canSend('pvp', alice);
  eq(r.allowed, false, 'pvp send blocked outside wilderness');
  const r2 = channels.canSend('pvp', wildsP);
  eq(r2.allowed, true, 'pvp send allowed in wilderness');
}

// Region chat
{
  const r = channels.canRead('region', regionQ, { speaker: regionP });
  eq(r.allowed, true, 'same-region read allowed');
  const r2 = channels.canRead('region', regionR, { speaker: regionP });
  eq(r2.allowed, false, 'cross-region read blocked');
}

// Staff channel
{
  const r = channels.canSend('staff', alice);
  eq(r.allowed, false, 'staff send blocked for player');
  const r2 = channels.canSend('staff', staff);
  eq(r2.allowed, true, 'staff send allowed for admin');
}

// Announce
{
  const r = channels.canSend('announce', alice);
  eq(r.allowed, false, 'announce blocked for player');
  const r2 = channels.canSend('announce', staff);
  eq(r2.allowed, true, 'announce allowed for staff');
}

// Group ironman
{
  const g1 = makePlayer('G1', { ironman: { variant: 'group_ironman', group: ['G2-id'] } });
  const g2 = makePlayer('G2', { ironman: { variant: 'group_ironman', group: [] } });
  g2.id = 'G2-id';
  const r = channels.canSend('group-ironman', g1);
  eq(r.allowed, true, 'group-ironman send allowed');
  const r2 = channels.canSend('group-ironman', alice);
  eq(r2.allowed, false, 'non-gim send blocked');
  const readSame = channels.canRead('group-ironman', g2, { speaker: g1 });
  eq(readSame.allowed, true, 'same-group gim read allowed');
}

// Event
{
  const ev1 = makePlayer('Ev1', { activeEvent: 'blood-moon' });
  const ev2 = makePlayer('Ev2', { activeEvent: 'blood-moon' });
  const ev3 = makePlayer('Ev3', { activeEvent: 'harvest-fest' });
  const r = channels.canSend('event', ev1);
  eq(r.allowed, true, 'event send allowed with activeEvent');
  const r2 = channels.canRead('event', ev2, { speaker: ev1 });
  eq(r2.allowed, true, 'same-event read allowed');
  const r3 = channels.canRead('event', ev3, { speaker: ev1 });
  eq(r3.allowed, false, 'different-event read blocked');
}

// ── 3. Rate limit + cooldown ────────────────────────────────────────────────
section('3. Rate limit + cooldown');

{
  setNow(1_700_000_000_000);
  const tp = makePlayer('RateTester');
  // Trade: 3 per 30s, 3000ms cooldown
  const r1 = channels.checkRateLimit(tp, 'trade');
  eq(r1.allowed, true, 'trade first send allowed');
  channels.recordSend(tp, 'trade');

  const r2 = channels.checkRateLimit(tp, 'trade');
  eq(r2.allowed, false, 'trade cooldown blocks second send immediately');

  setNow(mockNow + 3500);
  const r3 = channels.checkRateLimit(tp, 'trade');
  eq(r3.allowed, true, 'after cooldown, trade send re-allowed');
  channels.recordSend(tp, 'trade');

  setNow(mockNow + 3500);
  channels.recordSend(tp, 'trade');
  setNow(mockNow + 3500);

  const r4 = channels.checkRateLimit(tp, 'trade');
  eq(r4.allowed, false, 'trade window hit: 3/30s max');
}

// Public: 5 per 10s, 600ms cooldown
{
  setNow(1_700_000_100_000);
  const tp = makePlayer('PubTester');
  for (let i = 0; i < 5; i++) {
    const r = channels.checkRateLimit(tp, 'public');
    eq(r.allowed, true, `public send ${i + 1}/5 allowed`);
    channels.recordSend(tp, 'public');
    setNow(mockNow + 700);
  }
  const r6 = channels.checkRateLimit(tp, 'public');
  eq(r6.allowed, false, 'public 6th send blocked by window');
}

// ── 4. Filter pipeline ──────────────────────────────────────────────────────
section('4. Filter pipeline');

{
  const p = makePlayer('Filterer');

  const clean = channels.applyFilters('hello there', 'public');
  eq(clean.allowed, true, 'clean message passes filter');

  const profane = channels.applyFilters('this is a badword', 'public');
  eq(profane.allowed, false, 'profanity blocks message');
  assert(profane.reasons.join(' ').toLowerCase().includes('profanity'), 'profanity reason reported');

  const link = channels.applyFilters('visit https://evil.site/x for gold', 'public');
  eq(link.allowed, false, 'disallowed link blocks message');

  const allowedLink = channels.applyFilters('go to https://sc4p3.com/guide', 'public');
  eq(allowedLink.allowed, true, 'whitelisted link passes');

  const tooLong = channels.applyFilters('x'.repeat(200), 'public');
  eq(tooLong.allowed, false, 'over-limit message blocked');
}

// Auto-mute after 3 consecutive filtered messages
{
  setNow(1_700_000_200_000);
  const p = makePlayer('AutoMute');
  let res;
  res = channels.sendMessage(p, 'help', 'this is nope');
  eq(res.filtered, true, 'auto-mute 1/3 filtered');
  res = channels.sendMessage(p, 'help', 'another nope');
  eq(res.filtered, true, 'auto-mute 2/3 filtered');
  res = channels.sendMessage(p, 'help', 'one more nope');
  eq(res.autoMuted, true, 'auto-muted after 3rd filtered message');
  // While muted, further sends blocked with a different reason
  setNow(mockNow + 1000);
  const blocked = channels.sendMessage(p, 'help', 'hello world');
  eq(blocked.ok, false, 'auto-muted player is blocked from sending');
}

// Filter streak resets on a clean send
{
  setNow(1_700_000_300_000);
  const p = makePlayer('Resetter');
  channels.sendMessage(p, 'help', 'this is nope');
  setNow(mockNow + 2000);
  channels.sendMessage(p, 'help', 'nope again');
  setNow(mockNow + 2000);
  // clean message resets streak
  const ok = channels.sendMessage(p, 'help', 'clean text message');
  eq(ok.ok, true, 'clean send succeeds after 2 filtered sends');
  // Now send a filtered again. Streak was reset to 0, so this is 1/3 — not auto-muted.
  setNow(mockNow + 2000);
  const r2 = channels.sendMessage(p, 'help', 'another nope fourth');
  eq(r2.autoMuted || false, false, 'streak reset, no auto-mute after clean send');
}

// ── 5. Friends / ignore / mute ──────────────────────────────────────────────
section('5. Friends / ignore / mute');

{
  const p = makePlayer('FriendMgr');
  const a = makePlayer('Alfa');
  const b = makePlayer('Bravo');

  const r1 = channels.addFriend(p, a.id);
  eq(r1.ok, true, 'addFriend ok');
  eq(channels.isFriend(p, a.id), true, 'isFriend true');
  const r2 = channels.addFriend(p, a.id);
  eq(r2.ok, false, 'duplicate addFriend blocked');
  const r3 = channels.removeFriend(p, a.id);
  eq(r3.ok, true, 'removeFriend ok');
  eq(channels.isFriend(p, a.id), false, 'removed friend gone');

  const r4 = channels.ignore(p, b.id);
  eq(r4.ok, true, 'ignore ok');
  eq(channels.isIgnored(p, b.id), true, 'isIgnored true');
  const r5 = channels.unignore(p, b.id);
  eq(r5.ok, true, 'unignore ok');
  eq(channels.isIgnored(p, b.id), false, 'no longer ignored');

  const r6 = channels.mute(p, 'trade');
  eq(r6.ok, true, 'mute channel ok');
  assert(channels.mutedChannels(p).includes('trade'), 'trade is in mutedChannels');
  const r7 = channels.unmute(p, 'trade');
  eq(r7.ok, true, 'unmute channel ok');

  const bad = channels.mute(p, 'does-not-exist');
  eq(bad.ok, false, 'mute of unknown channel rejected');

  const self = channels.addFriend(p, p.id);
  eq(self.ok, false, 'cannot friend yourself');
  const selfIg = channels.ignore(p, p.id);
  eq(selfIg.ok, false, 'cannot ignore yourself');
}

// ── 6. Quick chat presets ───────────────────────────────────────────────────
section('6. Quick chat presets');

eq(quickchat.all().length >= 60, true, 'at least 60 quickchat presets');
assert(quickchat.presetById('greet-hi') && quickchat.presetById('greet-hi').text === 'Hi.',
  'preset lookup by id works');
assert(quickchat.presetById('GREET-HI') !== null, 'preset lookup is case-insensitive');
assert(quickchat.presetById('does-not-exist') === null, 'missing preset returns null');
assert(quickchat.presetsByCategory('combat').length >= 3, 'combat category has multiple presets');
assert(quickchat.listCategories().includes('trade'), 'trade category listed');
assert(quickchat.listCategories().includes('quest'), 'quest category listed');
assert(quickchat.search('boss').length >= 1, 'search finds boss-related preset');
assert(quickchat.search('bank').length >= 1, 'search finds banking preset');

// ── 7. sendMessage + audienceFor ────────────────────────────────────────────
section('7. sendMessage + audienceFor');

{
  setNow(1_700_000_400_000);
  const speaker = makePlayer('Speaker', { x: 100, y: 100 });
  const near    = makePlayer('Near',    { x: 110, y: 100 });
  const far     = makePlayer('Far',     { x: 500, y: 500 });
  const ignorer = makePlayer('Ignorer', { x: 105, y: 100 });
  channels.ignore(ignorer, speaker.id);

  const res = channels.sendMessage(speaker, 'public', 'hello world');
  eq(res.ok, true, 'public sendMessage ok');
  assert(typeof res.audienceFn === 'function', 'audienceFn returned');
  const audience = res.audienceFn([speaker, near, far, ignorer]);
  const ids = audience.map(p => p.id);
  assert(ids.includes(near.id), 'nearby player is in audience');
  assert(!ids.includes(far.id), 'far player is excluded from audience');
  assert(!ids.includes(ignorer.id), 'ignoring player is excluded from audience');
  assert(ids.includes(speaker.id), 'speaker is in own audience');
}

// ── 8. Log writer round-trip ───────────────────────────────────────────────
section('8. Log writer + readLog');

{
  setNow(1_700_000_500_000);
  const p = makePlayer('Logger');
  const msg = channels.sendMessage(p, 'help', 'i need help with quest please');
  eq(msg.ok, true, 'log-producing send succeeds');

  const date = new Date(mockNow).toISOString().slice(0, 10);
  const adminRead = channels.readLog('help', date, staff);
  eq(adminRead.ok, true, 'admin readLog ok');
  assert(adminRead.entries.length >= 1, 'admin sees logged entries');

  const playerRead = channels.readLog('help', date, alice);
  eq(playerRead.ok, false, 'non-staff cannot readLog directly');

  const ownRead = channels.readOwnLog('help', date, p);
  eq(ownRead.ok, true, 'readOwnLog ok');
  assert(ownRead.entries.every(e => e.speakerId === p.id || e.recipientId === p.id),
    'readOwnLog only returns own entries');
}

// ── 9. Persistence round-trip (friends + channel settings) ─────────────────
section('9. Persistence round-trip');

{
  const p = makePlayer('Persist', { clanId: 'red' });
  channels.addFriend(p, 'friend-1');
  channels.addFriend(p, 'friend-2');
  channels.ignore(p, 'enemy-1');
  channels.mute(p, 'trade');
  channels.mute(p, 'help');

  const ftable = channels.dumpFriends([p]);
  const stable = channels.dumpChannelSettings([p]);
  assert(ftable[p.id].friends.length === 2, 'dumpFriends captures friends');
  assert(ftable[p.id].ignored.length === 1, 'dumpFriends captures ignored');
  assert(stable[p.id].muted.length === 2, 'dumpChannelSettings captures mutes');

  const p2 = makePlayer('PersistRestore');
  p2.id = p.id;
  channels.loadFriendsInto(p2, ftable);
  channels.loadChannelSettingsInto(p2, stable);
  eq(p2.friends.length, 2, 'loadFriendsInto restored friends');
  eq(p2.ignored.length, 1, 'loadFriendsInto restored ignored');
  assert(channels.mutedChannels(p2).includes('trade'), 'loadChannelSettings restored trade mute');
}

// ── 10. listAccessibleChannels ──────────────────────────────────────────────
section('10. listAccessibleChannels');

{
  const p = makePlayer('Lister');
  const list = channels.listAccessibleChannels(p);
  eq(list.length, 14, 'listAccessibleChannels returns every channel');
  const publicEntry = list.find(e => e.id === 'public');
  eq(publicEntry.canSend, true, 'public is sendable');
  const staffEntry = list.find(e => e.id === 'staff');
  eq(staffEntry.canSend, false, 'staff is not sendable by player');
}

// ── 11. Commands integration ────────────────────────────────────────────────
section('11. Commands integration');

{
  // Build a tiny directory so findPlayer resolves names.
  const registry = new Map();
  function addToReg(p) {
    registry.set(String(p.name).toLowerCase(), p);
    registry.set(String(p.id), p);
    return p;
  }
  const you    = addToReg(makePlayer('You', { x: 100, y: 100, clanId: 'red', clanRank: 'member' }));
  const them   = addToReg(makePlayer('Them', { x: 101, y: 100 }));
  const leader = addToReg(makePlayer('Leader', { clanId: 'red', clanRank: 'leader' }));

  channelsCommands.register({
    commands,
    channels,
    quickchat,
    findPlayer: (name) => registry.get(String(name).toLowerCase()) || registry.get(String(name)) || null,
    listPlayers: () => [...registry.values()],
    deliver: (recipient, message) => { /* deliver is opaque in the test */ },
  });

  setNow(1_700_000_600_000);

  const sayCmd = commands.commands.get('say');
  assert(sayCmd && typeof sayCmd.fn === 'function', 'say command registered');
  const sayOut = sayCmd.fn(you, ['hello']);
  assert(typeof sayOut === 'string', 'say returns string');
  assert(sayOut.includes('hello'), 'say output contains the text');

  setNow(mockNow + 1000);
  const tellCmd = commands.commands.get('tell');
  const tellOut = tellCmd.fn(you, ['Them', 'secret', 'plan']);
  assert(tellOut.includes('secret plan'), 'tell delivered');

  setNow(mockNow + 1000);
  const clanCmd = commands.commands.get('clan');
  const clanOut = clanCmd.fn(you, ['strategy', 'meeting']);
  assert(clanOut.includes('strategy'), 'clan delivered');

  setNow(mockNow + 3500);
  const tradeCmd = commands.commands.get('trade');
  const tradeOut = tradeCmd.fn(you, ['selling', 'dragon', 'bones']);
  assert(tradeOut.includes('selling'), 'trade delivered');

  setNow(mockNow + 4000);
  const qcCmd = commands.commands.get('qc');
  const qcList = qcCmd.fn(you, ['list']);
  assert(qcList.toLowerCase().includes('categor'), 'qc list shows categories');

  setNow(mockNow + 4000);
  const qcSend = qcCmd.fn(you, ['greet-hi']);
  assert(qcSend.includes('Hi.'), 'qc preset sent');

  setNow(mockNow + 4000);
  const chCmd = commands.commands.get('channel');
  const chList = chCmd.fn(you, ['list']);
  assert(chList.includes('Channels'), 'channel list output');

  const muteOut = chCmd.fn(you, ['mute', 'trade']);
  assert(muteOut.toLowerCase().includes('muted'), 'channel mute confirmed');
  assert(channels.mutedChannels(you).includes('trade'), 'trade in muted list');
  const unmuteOut = chCmd.fn(you, ['unmute', 'trade']);
  assert(unmuteOut.toLowerCase().includes('unmuted'), 'channel unmute confirmed');

  const friendsCmd = commands.commands.get('friends');
  const friendsList = friendsCmd.fn(you, ['list']);
  assert(typeof friendsList === 'string' && friendsList.length > 0,
    'friends list returns a message');
  const addFr = friendsCmd.fn(you, ['add', 'Them']);
  assert(addFr.toLowerCase().includes('added'), 'friends add confirmed');
  assert(channels.isFriend(you, them.id), 'friend persisted');

  const ignoreCmd = commands.commands.get('ignore');
  const ignoreAdd = ignoreCmd.fn(you, ['add', 'Them']);
  assert(ignoreAdd.toLowerCase().includes('ignored'), 'ignore add confirmed');
  const igList = ignoreCmd.fn(you, ['list']);
  assert(igList.toLowerCase().includes('ignored'), 'ignore list returned');
}

// ── Summary ────────────────────────────────────────────────────────────────
console.log(`\n── Results ──`);
console.log(`  ${passed} passed, ${failed} failed`);

// restore Date.now
Date.now = realNow;

if (failures.length) {
  console.log('\nFAILURES:');
  for (const f of failures) console.log('  - ' + f);
  process.exit(1);
}
process.exit(0);
