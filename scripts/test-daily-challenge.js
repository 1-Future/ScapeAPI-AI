#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// Smoke test for src/engine/daily-challenge.js
//
// Covers:
//   - template pool has >=50 entries covering every region
//   - utcDateKey + hashSeed are deterministic
//   - dailyChallengeFor(player, date) is deterministic for same (id, date)
//   - different dates yield different templates for the same player
//   - getOrGenerate rolls over at the UTC day boundary and preserves history
//   - track() progresses matching challenges, ignores non-matching
//   - claim() rejects incomplete, pays reward on complete, emits event
//   - tier scaling: reward grows with total level
//   - multi-day drop challenges survive day rollover
//   - /challenge commands round-trip through the command registry
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

require('../src/data/items');

const player = require('../src/player/player');
const daily = require('../src/engine/daily-challenge');
const commands = require('../src/engine/commands');
const randomEventsCommands = require('../src/engine/random-events-commands');
const events = require('../src/engine/events');

let pass = 0, fail = 0;
function check(cond, msg) {
  if (cond) { console.log('PASS:', msg); pass++; }
  else      { console.log('FAIL:', msg); fail++; }
}

// ══════════════════════════════════════════════════════════════════════════════
// 1. Template pool sized + covers every region
// ══════════════════════════════════════════════════════════════════════════════
const templates = daily.listTemplates();
check(templates.length >= 50, `template pool has >= 50 entries (got ${templates.length})`);

const regionsWanted = [
  'heartlands','sootworks','moryskah','veilwood','boneyard_wastes',
  'saltbrine_reach','inkweald','glass_desert','any',
];
for (const r of regionsWanted) {
  check(templates.some(t => t.region === r), `template pool covers region: ${r}`);
}

// Make sure every template has required fields.
let wellFormed = true;
for (const t of templates) {
  if (!t.id || !t.type || !t.targetName || !t.goal || !t.rewardType) { wellFormed = false; break; }
}
check(wellFormed, 'every template has id/type/targetName/goal/rewardType');

// ══════════════════════════════════════════════════════════════════════════════
// 2. Deterministic date key
// ══════════════════════════════════════════════════════════════════════════════
const fixedDate = new Date(Date.UTC(2026, 3, 15, 12, 0, 0));
check(daily.utcDateKey(fixedDate) === '2026-04-15', 'utcDateKey for 2026-04-15 12:00 UTC');
check(daily.utcDateKey(new Date(Date.UTC(2026, 3, 15, 23, 59, 59))) === '2026-04-15',
      'utcDateKey stable across the day');
check(daily.utcDateKey(new Date(Date.UTC(2026, 3, 16, 0, 0, 1))) === '2026-04-16',
      'utcDateKey rolls at UTC midnight');

// ══════════════════════════════════════════════════════════════════════════════
// 3. hashSeed is deterministic
// ══════════════════════════════════════════════════════════════════════════════
check(daily.hashSeed('foo|2026-04-15') === daily.hashSeed('foo|2026-04-15'),
      'hashSeed deterministic');
check(daily.hashSeed('foo|2026-04-15') !== daily.hashSeed('foo|2026-04-16'),
      'hashSeed date-sensitive');
check(daily.hashSeed('a|2026-04-15') !== daily.hashSeed('b|2026-04-15'),
      'hashSeed player-sensitive');

// ══════════════════════════════════════════════════════════════════════════════
// 4. dailyChallengeFor is deterministic for (playerId, date)
// ══════════════════════════════════════════════════════════════════════════════
const p = player.createPlayer(1, 'DailyTester');
const dc1 = daily.dailyChallengeFor(p, fixedDate);
const dc2 = daily.dailyChallengeFor(p, fixedDate);
check(dc1.id === dc2.id, 'same (playerId, date) yields same template id');
check(dc1.dateKey === '2026-04-15', 'dateKey recorded on the challenge');
check(dc1.progress === 0, 'fresh challenge starts at progress 0');
check(dc1.complete === false, 'fresh challenge not complete');
check(dc1.claimed === false, 'fresh challenge not claimed');

// Different day = possibly different template (high probability).
let differences = 0;
for (let i = 0; i < 30; i++) {
  const d = new Date(Date.UTC(2026, 3, 15 + i));
  if (daily.dailyChallengeFor(p, d).id !== dc1.id) differences++;
}
check(differences > 0, 'different dates produce different templates at some point');

// ══════════════════════════════════════════════════════════════════════════════
// 5. Different players on same date get different templates (usually)
// ══════════════════════════════════════════════════════════════════════════════
const pA = player.createPlayer(10, 'A');
const pB = player.createPlayer(20, 'B');
const dcA = daily.dailyChallengeFor(pA, fixedDate);
const dcB = daily.dailyChallengeFor(pB, fixedDate);
// Could match by chance; sanity check that at least SOMETIMES they differ
// across a small batch of synthetic players.
let seen = new Set();
for (let id = 1; id <= 20; id++) {
  const pi = player.createPlayer(id, `U${id}`);
  seen.add(daily.dailyChallengeFor(pi, fixedDate).id);
}
check(seen.size >= 2, `different player ids yield varied templates (${seen.size} distinct)`);

// ══════════════════════════════════════════════════════════════════════════════
// 6. getOrGenerate on empty player creates challenge for today
// ══════════════════════════════════════════════════════════════════════════════
const p2 = player.createPlayer(2, 'Fresh');
const today = daily.utcDateKey();
const dc = daily.getOrGenerate(p2);
check(!!p2.dailyChallenge, 'player.dailyChallenge set by getOrGenerate');
check(p2.dailyChallenge.dateKey === today, 'dateKey matches today');
check(dc === p2.dailyChallenge, 'getOrGenerate returns the same object that was stored');

// Call again on same day = same object
const dcSameDay = daily.getOrGenerate(p2);
check(dcSameDay === p2.dailyChallenge, 'same-day call returns same object (no regen)');

// ══════════════════════════════════════════════════════════════════════════════
// 7. Roll-over: simulate a past-day challenge, generate for today
// ══════════════════════════════════════════════════════════════════════════════
const p3 = player.createPlayer(3, 'Rollover');
p3.dailyChallenge = {
  id: 'legacy',
  dateKey: '2026-04-14', // yesterday (vs 04-15 today or later)
  type: 'kill',
  targetName: 'rat',
  goal: 5,
  progress: 2,
  complete: false,
  claimed: false,
  rewardType: 'coins',
  reward: 100,
  multiDay: false,
};
const rolled = daily.getOrGenerate(p3);
check(rolled.dateKey !== '2026-04-14', 'rollover produced a new day challenge');
check(rolled === p3.dailyChallenge, 'player.dailyChallenge replaced');

// Multi-day rollover preserves previous challenge on multiDayChallenges.
const p3m = player.createPlayer(30, 'RolloverMulti');
p3m.dailyChallenge = {
  id: 'drop_hunt_dragon_spear',
  dateKey: '2026-04-14',
  type: 'drop',
  targetName: 'dragon spear',
  goal: 1, progress: 0, complete: false, claimed: false,
  rewardType: 'coins', reward: 15000,
  multiDay: true,
};
daily.getOrGenerate(p3m);
check(Array.isArray(p3m.multiDayChallenges) && p3m.multiDayChallenges.length === 1,
      'multi-day rollover preserved the previous challenge');
check(p3m.multiDayChallenges[0].id === 'drop_hunt_dragon_spear', 'preserved the right id');

// ══════════════════════════════════════════════════════════════════════════════
// 8. track() matches correct type/targetName and increments progress
// ══════════════════════════════════════════════════════════════════════════════
const p4 = player.createPlayer(4, 'Tracker');
// Force a known challenge for testing determinism.
p4.dailyChallenge = {
  id: 'kill_goblins_10', dateKey: daily.utcDateKey(), type: 'kill',
  targetName: 'goblin', region: 'heartlands', goal: 10, progress: 0,
  rewardType: 'coins', reward: 500, rewardSkill: null, baseReward: 500, tier: 0,
  multiDay: false, claimed: false, complete: false,
  generatedAt: Date.now(),
};
const hit1 = daily.track(p4, 'kill', 'goblin');
check(!!hit1 && hit1.progressed === 1, 'kill/goblin counted 1 progress');
check(p4.dailyChallenge.progress === 1, 'progress incremented on the player');
const hit2 = daily.track(p4, 'kill', 'goblin', 5);
check(hit2.progressed === 5, 'track with amount=5 adds 5');
check(p4.dailyChallenge.progress === 6, 'progress reflects cumulative count');
const miss = daily.track(p4, 'kill', 'cow');
check(miss === null, 'kill/cow ignored when challenge targets goblin');
const wrongKind = daily.track(p4, 'cook', 'goblin');
check(wrongKind === null, 'wrong kind (cook) ignored for kill challenge');

// Cap at goal
daily.track(p4, 'kill', 'goblin', 100);
check(p4.dailyChallenge.progress === 10, 'progress capped at goal');
check(p4.dailyChallenge.complete === true, 'challenge marked complete when progress hits goal');

// ══════════════════════════════════════════════════════════════════════════════
// 9. claim() rejects incomplete, pays on complete
// ══════════════════════════════════════════════════════════════════════════════
const p5 = player.createPlayer(5, 'Claimer');
p5.dailyChallenge = {
  id: 'cook_trout_15', dateKey: daily.utcDateKey(), type: 'cook',
  targetName: 'trout', region: 'heartlands', goal: 5, progress: 0,
  rewardType: 'xp', reward: 2500, rewardSkill: 'cooking', baseReward: 2500, tier: 0,
  multiDay: false, claimed: false, complete: false,
  generatedAt: Date.now(),
};
const earlyClaim = daily.claim(p5);
check(!earlyClaim.ok, 'cannot claim incomplete challenge');
daily.track(p5, 'cook', 'trout', 5);
check(p5.dailyChallenge.complete, 'challenge complete after tracking goal');
const xpBefore = player.getXp(p5, 'cooking');
const claimResult = daily.claim(p5);
check(claimResult.ok, 'claim OK when complete');
check(claimResult.applied && claimResult.applied.type === 'xp', 'xp reward applied');
check(player.getXp(p5, 'cooking') === xpBefore + 2500, 'cooking xp increased by reward');
check(p5.dailyChallenge.claimed === true, 'challenge marked claimed');
const reclaim = daily.claim(p5);
check(!reclaim.ok, 'cannot double-claim');

// ══════════════════════════════════════════════════════════════════════════════
// 10. Coin reward path
// ══════════════════════════════════════════════════════════════════════════════
const p6 = player.createPlayer(6, 'Coiner');
p6.dailyChallenge = {
  id: 'kill_goblins_10', dateKey: daily.utcDateKey(), type: 'kill',
  targetName: 'goblin', region: 'heartlands', goal: 2, progress: 0,
  rewardType: 'coins', reward: 500, rewardSkill: null, baseReward: 500, tier: 0,
  multiDay: false, claimed: false, complete: false,
  generatedAt: Date.now(),
};
daily.track(p6, 'kill', 'goblin', 2);
const coinClaim = daily.claim(p6);
check(coinClaim.ok, 'coin reward claim ok');
const coinSlot = p6.inventory.find(s => s && s.id === 101);
check(!!coinSlot && coinSlot.count === 500, 'coins added to inventory');

// ══════════════════════════════════════════════════════════════════════════════
// 11. tier scaling
// ══════════════════════════════════════════════════════════════════════════════
const low = player.createPlayer(7, 'Low');
const lowTier = daily.tierFor(low);
check(lowTier === 0, 'fresh player is tier 0');
const high = player.createPlayer(8, 'High');
for (const s of player.SKILLS) player.addXp(high, s, 10_000_000);
const highTier = daily.tierFor(high);
check(highTier > lowTier, 'high-total player has higher tier');
check(highTier <= 5, 'tier clamped at 5');
check(daily.tierMultiplier(0) === 1, 'tier 0 multiplier = 1');
check(daily.tierMultiplier(5) === 3, 'tier 5 multiplier = 3');

// Reward scales with tier
const lowDc = daily.dailyChallengeFor(low, fixedDate);
const highDc = daily.dailyChallengeFor(high, fixedDate);
// dc.reward = baseReward * mult. Grab the same template if RNG matched, else
// compare base to scaled ratio.
check(lowDc.reward === lowDc.baseReward, 'low-tier reward = base');
check(highDc.reward >= highDc.baseReward, 'high-tier reward >= base');

// ══════════════════════════════════════════════════════════════════════════════
// 12. History is recorded after claim
// ══════════════════════════════════════════════════════════════════════════════
check(Array.isArray(p5.dailyChallengeHistory) && p5.dailyChallengeHistory.length === 1,
      'history has one entry after claim');
check(p5.dailyChallengeHistory[0].id === 'cook_trout_15', 'history entry id matches');

// ══════════════════════════════════════════════════════════════════════════════
// 13. Event emission on complete + claim
// ══════════════════════════════════════════════════════════════════════════════
const completes = [], claims = [];
events.on('daily_challenge_complete', 'test1', (ev) => completes.push(ev));
events.on('daily_challenge_claimed',  'test1', (ev) => claims.push(ev));

const p9 = player.createPlayer(9, 'EventCatcher');
p9.dailyChallenge = {
  id: 'kill_goblins_10', dateKey: daily.utcDateKey(), type: 'kill',
  targetName: 'goblin', region: 'heartlands', goal: 1, progress: 0,
  rewardType: 'coins', reward: 100, rewardSkill: null, baseReward: 100, tier: 0,
  multiDay: false, claimed: false, complete: false,
  generatedAt: Date.now(),
};
daily.track(p9, 'kill', 'goblin');
check(completes.length >= 1, 'daily_challenge_complete event emitted');
daily.claim(p9);
check(claims.length >= 1, 'daily_challenge_claimed event emitted');
events.off('daily_challenge_complete', 'test1');
events.off('daily_challenge_claimed',  'test1');

// ══════════════════════════════════════════════════════════════════════════════
// 14. status() shape
// ══════════════════════════════════════════════════════════════════════════════
const p10 = player.createPlayer(10, 'Statusy');
const s10 = daily.status(p10);
check(typeof s10 === 'object' && s10.id && s10.goal > 0, 'status returns a populated object');
check(typeof s10.reward === 'number', 'status includes numeric reward');

// ══════════════════════════════════════════════════════════════════════════════
// 15. completeChallenge helper
// ══════════════════════════════════════════════════════════════════════════════
const p11 = player.createPlayer(11, 'Completer');
daily.getOrGenerate(p11);
const before = p11.dailyChallenge.progress;
daily.completeChallenge(p11);
check(p11.dailyChallenge.complete === true, 'completeChallenge forces complete');
check(p11.dailyChallenge.progress === p11.dailyChallenge.goal, 'progress set to goal');
check(before !== null, 'pre-state captured');

// ══════════════════════════════════════════════════════════════════════════════
// 16. Commands: /challenge status | claim | history
// ══════════════════════════════════════════════════════════════════════════════
randomEventsCommands.register({ commands });
const p12 = player.createPlayer(12, 'CmdChallenge');
const stOut = commands.execute(p12, 'challenge status');
check(/Daily Challenge/i.test(stOut), '/challenge status returns Daily Challenge header');

const noClaim = commands.execute(p12, 'challenge claim');
check(/not complete/i.test(noClaim), '/challenge claim rejects incomplete');

daily.completeChallenge(p12);
const claimedOut = commands.execute(p12, 'challenge claim');
check(/Claimed/i.test(claimedOut), '/challenge claim acknowledges success');

const histOut = commands.execute(p12, 'challenge history');
check(/History|No completed/i.test(histOut), '/challenge history returns a list');

// ══════════════════════════════════════════════════════════════════════════════
// 17. JSON round-trip survives
// ══════════════════════════════════════════════════════════════════════════════
const p13 = player.createPlayer(13, 'JsonTrip');
daily.getOrGenerate(p13);
daily.completeChallenge(p13);
daily.claim(p13);
const snapshot = JSON.parse(JSON.stringify({
  dailyChallenge: p13.dailyChallenge,
  dailyChallengeHistory: p13.dailyChallengeHistory,
}));
check(snapshot.dailyChallenge.claimed === true, 'dailyChallenge survives JSON');
check(Array.isArray(snapshot.dailyChallengeHistory), 'history survives JSON');
check(snapshot.dailyChallengeHistory.length === p13.dailyChallengeHistory.length, 'history length preserved');

// ══════════════════════════════════════════════════════════════════════════════
// Summary
// ══════════════════════════════════════════════════════════════════════════════
console.log(`\n── Results ── ${pass} passed, ${fail} failed ──`);
process.exit(fail === 0 ? 0 : 1);
