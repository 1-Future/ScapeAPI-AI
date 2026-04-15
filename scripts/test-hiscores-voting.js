#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// Hiscores + Voting — Engine Tests (burn-v2)
//
// Verifies:
//   A. Hiscores engine
//      1.  updatePlayerSnapshot creates board entries
//      2.  getSkillRanking sorts by XP descending, cap at limit
//      3.  getOverallRanking sums correctly across SKILLS
//      4.  getBossKcRanking reads player.killCounts
//      5.  Ironman-only board excludes non-ironmen
//      6.  Hardcore + Regular ironman appear on ironman overall
//      7.  CA + diary rankings read player.combatAchievements / player.diary
//      8.  Clan ranking aggregates member XP
//      9.  Privacy opt-out purges player from every board
//      10. getPlayerStats reports per-skill rank
//      11. findPlayerByName is case-insensitive
//      12. serialize/deserialize round trip preserves boards + snapshots
//   B. Voting engine
//      13. createPoll rejects <3-char title, <2 options, >8 options, duplicates
//      14. createPoll records title/options/closesAt
//      15. vote records a single vote and increments count
//      16. vote rejects double vote (unless unvote first)
//      17. unvote decrements the count
//      18. sweepExpired closes polls past closesAt
//      19. closePoll seals and records closedBy
//      20. getPollResults returns percentages that sum within 100±1
//      21. getPollResults declares a clear winner (no tie)
//      22. getPollResults reports tie when counts are equal
//      23. snapshot() never leaks `voters` map
//      24. listPolls('active' vs 'closed') partitions correctly
//      25. myVote returns player's own choice
//      26. hasVoted is boolean only (does not leak which)
//      27. serialize/deserialize round trip preserves votes + counts
//   C. Commands (thin smoke)
//      28. /hi me returns ranking info
//      29. /hi <skill> returns top 10
//      30. /poll list returns active polls
//      31. /poll vote records and shows option
//      32. /poll create is admin-only
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const path = require('path');
const fs = require('fs');

// Sandbox persistence.
const tmpDataDir = path.join(__dirname, '..', '.tmp-hiscores-test');
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
  try { return JSON.parse(fs.readFileSync(fp, 'utf8')); }
  catch { return fallback; }
};

const highscores = require('../src/engine/highscores');
const voting     = require('../src/engine/voting');
const commands   = require('../src/engine/commands');
const hiscoresCommands = require('../src/engine/highscores-commands');
const votingCommands   = require('../src/engine/voting-commands');

// ── Harness ─────────────────────────────────────────────────────────────────
let passed = 0, failed = 0;
const failures = [];

function assert(cond, label) {
  if (cond) { passed++; console.log('  PASS  ' + label); }
  else      { failed++; failures.push(label); console.log('  FAIL  ' + label); }
}
function eq(actual, expected, label) {
  assert(actual === expected, `${label} (expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)})`);
}
function section(title) { console.log('\n=== ' + title + ' ==='); }

// ── Player factory ──────────────────────────────────────────────────────────
const SKILLS = highscores.SKILLS;
let nextId = 1;
function makePlayer(name, opts = {}) {
  const skills = {};
  for (const s of SKILLS) skills[s] = { xp: 0, level: 1 };
  const p = {
    id: nextId++,
    name,
    skills,
    killCounts: {},
    admin: !!opts.admin,
  };
  if (opts.ironman) {
    p.ironman = { variant: opts.ironman, enabledAt: 0, group: [], hardcoreDied: false, downgradedFrom: null };
    p.accountMode = opts.ironman === 'hardcore_ironman' ? 'hcim' : 'ironman';
  }
  if (opts.optOut) {
    p.privacy = { hiscores_opt_out: true };
  }
  return p;
}
function grantXp(p, skill, xp) {
  p.skills[skill].xp = (p.skills[skill].xp | 0) + xp;
  p.skills[skill].level = 1;
}

// ══════════════════════════════════════════════════════════════════════════════
// A — HIGHSCORES
// ══════════════════════════════════════════════════════════════════════════════
section('A. Hiscores engine');

highscores.reset();

const alice = makePlayer('Alice');
grantXp(alice, 'attack', 50_000);
grantXp(alice, 'strength', 30_000);
grantXp(alice, 'hitpoints', 1200);
highscores.updatePlayerSnapshot(alice);

const bob = makePlayer('Bob');
grantXp(bob, 'attack', 100_000);
grantXp(bob, 'strength', 25_000);
bob.killCounts = { giant_mole: 17, kreearra: 3 };
highscores.updatePlayerSnapshot(bob);

const carol = makePlayer('Carol', { ironman: 'ironman' });
grantXp(carol, 'attack', 10_000);
grantXp(carol, 'woodcutting', 500_000);
highscores.updatePlayerSnapshot(carol);

const dave = makePlayer('Dave', { ironman: 'hardcore_ironman' });
grantXp(dave, 'attack', 80_000);
highscores.updatePlayerSnapshot(dave);

const eve = makePlayer('Eve', { optOut: true });
grantXp(eve, 'attack', 999_999);
highscores.updatePlayerSnapshot(eve);

// Test 1: board entries exist after snapshot
const atkRanking = highscores.getSkillRanking('attack', 50);
assert(atkRanking.length >= 4, 'attack ranking populated (>=4 non-opted-out)');

// Test 2: sorted descending — Bob (100k) > Dave (80k) > Alice (50k)
eq(atkRanking[0].playerName, 'Bob', 'top attack = Bob');
eq(atkRanking[1].playerName, 'Dave', '2nd attack = Dave');
eq(atkRanking[2].playerName, 'Alice', '3rd attack = Alice');

// Test: limit honored
const top1 = highscores.getSkillRanking('attack', 1);
eq(top1.length, 1, 'limit=1 returns only top entry');
eq(top1[0].rank, 1, 'rank set to 1');

// Test 3: overall totals — Carol has woodcutting 500k which dwarfs others
const overall = highscores.getOverallRanking(50);
assert(overall[0].playerName === 'Carol', 'Carol is top overall (500k wc)');

// Test 4: boss kc
const bossTop = highscores.getBossKcRanking('giant_mole', 50);
eq(bossTop.length, 1, 'only Bob has giant_mole kc');
eq(bossTop[0].playerName, 'Bob', 'giant_mole top = Bob');
eq(bossTop[0].value, 17, 'kc = 17');

// Test 5: Ironman-only boards exclude non-ironmen
const ironmanOverall = highscores.getIronmanRanking('overall', 50);
const ironmanNames = ironmanOverall.map(e => e.playerName);
assert(ironmanNames.includes('Carol'), 'Carol on ironman overall');
assert(ironmanNames.includes('Dave'), 'Dave on ironman overall');
assert(!ironmanNames.includes('Alice'), 'Alice excluded from ironman overall');
assert(!ironmanNames.includes('Bob'), 'Bob excluded from ironman overall');

// Test 6: hardcore + regular ironmen both appear
assert(ironmanOverall.some(e => e.variant === 'ironman'), 'regular ironman variant present');
assert(ironmanOverall.some(e => e.variant === 'hardcore_ironman'), 'hardcore ironman variant present');

// Test 7: CA/diary rankings read player state
alice.combatAchievements = { totalPoints: 42 };
alice.diary = { heartlands: { claimed: { easy: true, medium: true } } };
highscores.updatePlayerSnapshot(alice);
const caRank = highscores.getCaRanking(10);
assert(caRank.length > 0 && caRank[0].value === 42, 'CA ranking shows Alice 42 pts');
const diaryRank = highscores.getDiaryRanking(10);
assert(diaryRank.length > 0 && diaryRank[0].value === 2, 'diary ranking shows Alice 2 tiers');

// Test 8: Clan aggregation
highscores.updateClanRanking({ id: 1, name: 'Ravens' }, [alice, bob]);
highscores.updateClanRanking({ id: 2, name: 'Wolves' }, [carol]);
const clanRank = highscores.getClanRanking(10);
assert(clanRank.length === 2, 'two clans ranked');
assert(clanRank[0].memberCount >= 1, 'memberCount populated');
assert(clanRank[0].totalXp > 0, 'totalXp populated');

// Test 9: Privacy opt-out purges from boards
const eveInAtk = atkRanking.find(e => e.playerName === 'Eve');
assert(!eveInAtk, 'Eve (opted-out) excluded from attack board despite 999k XP');

// Test 10: getPlayerStats per-skill rank
const bobStats = highscores.getPlayerStats(bob.id);
assert(bobStats, 'bobStats non-null');
assert(bobStats.ranks.overall, 'bob has overall rank');
assert(bobStats.ranks.skills.attack, 'bob has attack rank');
eq(bobStats.ranks.skills.attack.rank, 1, 'bob rank 1 in attack');
assert(bobStats.ranks.bosses.giant_mole, 'bob has giant_mole rank');

// Test 11: findPlayerByName case-insensitive
const foundAlice = highscores.findPlayerByName('alice');
assert(foundAlice && foundAlice.playerName === 'Alice', 'findPlayerByName case-insensitive');
const foundBob = highscores.findPlayerByName('BOB');
assert(foundBob && foundBob.playerName === 'Bob', 'findPlayerByName uppercase');
const foundNone = highscores.findPlayerByName('nobody_xyz');
assert(foundNone === null, 'findPlayerByName returns null for unknown');

// Test 12: serialize/deserialize round trip
const blob = highscores.serialize();
highscores.reset();
eq(highscores.getOverallRanking(10).length, 0, 'reset clears boards');
highscores.deserialize(blob);
const overallAfter = highscores.getOverallRanking(50);
assert(overallAfter.length >= 4, 'boards restored after deserialize');
assert(overallAfter[0].playerName === 'Carol', 'Carol still top overall after restore');
assert(highscores.stats().snapshots >= 4, 'snapshots restored');

// ══════════════════════════════════════════════════════════════════════════════
// B — VOTING
// ══════════════════════════════════════════════════════════════════════════════
section('B. Voting engine');

voting.reset();

// Test 13: validation rejects bad input
const bad1 = voting.createPoll({ title: 'ab', options: ['yes', 'no'] });
assert(!bad1.ok, 'reject title <3 chars');

const bad2 = voting.createPoll({ title: 'Should we?', options: ['only_one'] });
assert(!bad2.ok, 'reject <2 options');

const bad3 = voting.createPoll({ title: 'Big vote', options: Array.from({ length: 10 }, (_, i) => 'opt' + i) });
assert(!bad3.ok, 'reject >8 options');

const bad4 = voting.createPoll({ title: 'Dup', options: ['Yes', 'yes'] });
assert(!bad4.ok, 'reject duplicate (case-insensitive) options');

// Test 14: valid poll
const pres = voting.createPoll({
  title: 'Should we raise woodcutting XP rate?',
  options: ['Yes', 'No', 'Abstain'],
  durationDays: 3,
  createdBy: 999,
  createdByName: 'ModAlice',
});
assert(pres.ok, 'createPoll ok');
const pollId = pres.poll.id;
eq(pres.poll.title, 'Should we raise woodcutting XP rate?', 'title preserved');
eq(pres.poll.options.length, 3, '3 options stored');
assert(pres.poll.closesAt > Date.now(), 'closesAt in future');

// Test 15: cast a vote
const v1 = voting.vote(pollId, 101, 'Yes');
assert(v1.ok, 'v1 ok');
eq(v1.option, 'Yes', 'v1 option echoed');

const v2 = voting.vote(pollId, 102, 1); // index 1 = No
assert(v2.ok, 'v2 ok');
const v3 = voting.vote(pollId, 103, 'abstain'); // case-insensitive
assert(v3.ok, 'v3 ok case-insensitive');

// Test 16: double vote rejected
const dup = voting.vote(pollId, 101, 'No');
assert(!dup.ok, 'double vote rejected');

// Test 17: unvote decrements
const uv = voting.unvote(pollId, 103);
assert(uv.ok, 'unvote ok');
const reRes = voting.getPollResults(pollId);
eq(reRes.total, 2, 'total after unvote = 2');

// Test: re-vote after unvote works
const v4 = voting.vote(pollId, 103, 'No');
assert(v4.ok, 'can revote after unvoting');

// Test 18: sweepExpired closes expired
const shortPoll = voting.createPoll({
  title: 'Tomorrow?', options: ['Yes', 'No'], durationDays: 1,
});
const rawPoll = voting.getPoll(shortPoll.poll.id);
// Manually age the poll
const closed = voting.sweepExpired(rawPoll.closesAt + 1);
assert(closed.length >= 1, 'sweepExpired returns closed polls');
const afterSweep = voting.getPoll(shortPoll.poll.id);
eq(afterSweep.closed, true, 'expired poll marked closed');

// Test 19: closePoll
const cres = voting.closePoll(pollId, 42);
assert(cres.ok, 'closePoll ok');
const sealed = voting.getPoll(pollId);
eq(sealed.closed, true, 'poll closed flag set');
assert(sealed.closedAt, 'closedAt set');
const cres2 = voting.closePoll(pollId, 42);
assert(!cres2.ok, 'cannot close twice');

// Test 20: percentages within tolerance
const r = voting.getPollResults(pollId);
const pctSum = r.results.reduce((a, e) => a + e.pct, 0);
assert(Math.abs(pctSum - 100) <= 1 || r.total === 0, `percentages sum ~100 (got ${pctSum})`);

// Test 21 + 22: winner vs tie
voting.reset();
const p2 = voting.createPoll({ title: 'Simple', options: ['A', 'B'], durationDays: 5 }).poll;
voting.vote(p2.id, 1, 'A');
voting.vote(p2.id, 2, 'A');
voting.vote(p2.id, 3, 'B');
const r2 = voting.getPollResults(p2.id);
eq(r2.winner, 'A', 'A wins 2-1');
assert(!r2.tie, 'not a tie');

const p3 = voting.createPoll({ title: 'Tied', options: ['X', 'Y'], durationDays: 5 }).poll;
voting.vote(p3.id, 1, 'X');
voting.vote(p3.id, 2, 'Y');
const r3 = voting.getPollResults(p3.id);
assert(r3.tie === true, 'tie detected');
eq(r3.winner, null, 'no winner on tie');

// Test 23: snapshot never leaks voters map
const snap = voting.getPoll(p2.id);
assert(!('voters' in snap), 'snapshot has no voters field');
const listed = voting.listPolls('all');
for (const l of listed) {
  assert(!('voters' in l), 'listPolls entries have no voters field');
}

// Test 24: listPolls filter
const active = voting.listPolls('active');
const closedList = voting.listPolls('closed');
for (const p of active) assert(!p.closed, 'active list has only open polls');
for (const p of closedList) assert(p.closed, 'closed list has only closed polls');

// Test 25: myVote echoes own vote
const mv = voting.myVote(p2.id, 1);
assert(mv && mv.label === 'A', 'myVote returns A for voter 1');
const mvNone = voting.myVote(p2.id, 999);
assert(mvNone === null, 'myVote null for non-voter');

// Test 26: hasVoted boolean
eq(voting.hasVoted(p2.id, 1), true, 'hasVoted=true for voter');
eq(voting.hasVoted(p2.id, 999), false, 'hasVoted=false for non-voter');

// Test 27: serialize round-trip
const vBlob = voting.serialize();
voting.reset();
eq(voting.listPolls('all').length, 0, 'reset clears polls');
voting.deserialize(vBlob);
const restoredActive = voting.listPolls('all');
assert(restoredActive.length >= 2, 'polls restored after deserialize');
const p2Restored = voting.getPoll(p2.id);
assert(p2Restored, 'specific poll restored');
eq(p2Restored.total, 3, 'vote counts restored');

// ══════════════════════════════════════════════════════════════════════════════
// C — COMMANDS (smoke)
// ══════════════════════════════════════════════════════════════════════════════
section('C. Commands smoke');

// Re-seed highscores so stats pass command outputs.
highscores.reset();
nextId = 100;
const frank = makePlayer('Frank');
grantXp(frank, 'attack', 500_000);
highscores.updatePlayerSnapshot(frank);
const ginny = makePlayer('Ginny');
grantXp(ginny, 'attack', 300_000);
highscores.updatePlayerSnapshot(ginny);

hiscoresCommands.register({
  commands,
  highscores,
  findPlayer: (name) => [frank, ginny].find(p => p.name.toLowerCase() === String(name).toLowerCase()),
  SKILLS,
});

const hiMe = commands.execute(frank, 'hi me');
assert(typeof hiMe === 'string' && hiMe.includes('Frank'), '/hi me mentions own name');
assert(hiMe.includes('Overall') || hiMe.toLowerCase().includes('no hiscore'), '/hi me includes overall section');

const hiSkill = commands.execute(frank, 'hi attack');
assert(typeof hiSkill === 'string' && hiSkill.includes('Frank'), '/hi attack lists top players including Frank');

const hiPlayer = commands.execute(frank, 'hi ginny');
assert(typeof hiPlayer === 'string' && hiPlayer.includes('Ginny'), '/hi <player> looks up Ginny');

voting.reset();
votingCommands.register({ commands, voting });

const listEmpty = commands.execute(frank, 'poll list');
assert(typeof listEmpty === 'string', '/poll list returns string (empty ok)');

// Test 32: admin-only create
const nonAdminCreate = commands.execute(ginny, 'poll create "Test?" yes,no,maybe');
assert(typeof nonAdminCreate === 'string' && /admin/i.test(nonAdminCreate), 'non-admin rejected for /poll create');

frank.admin = true;
const adminCreate = commands.execute(frank, 'poll create "Should we?" yes,no,maybe');
assert(typeof adminCreate === 'string' && adminCreate.toLowerCase().includes('created'), '/poll create admin ok');

const listAfter = commands.execute(frank, 'poll list');
assert(typeof listAfter === 'string' && listAfter.includes('Should we?'), '/poll list shows new poll');

// Test 31: /poll vote records
const polls = voting.listPolls('active');
if (polls.length > 0) {
  const pid = polls[0].id;
  const voteCmd = commands.execute(ginny, `poll vote ${pid} yes`);
  assert(typeof voteCmd === 'string' && voteCmd.toLowerCase().includes('voted'), '/poll vote echoes vote');
  const results = voting.getPollResults(pid);
  assert(results.total >= 1, 'vote tally increased');
}

// ──────────────────────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════════════════════════');
console.log(`  Passed: ${passed}`);
console.log(`  Failed: ${failed}`);
console.log('══════════════════════════════════════════════════════════════════');
if (failed > 0) {
  console.log('\nFailures:');
  for (const f of failures) console.log('  - ' + f);
  process.exit(1);
}
process.exit(0);
