#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// Test: Collection Log + Achievement Diary
// Run: node scripts/test-collection-diary.js
//
// Verifies:
//   * Collection log catalogue loads (>= 30 sources).
//   * registerEntry adds items, dedupes, and grants completion reward.
//   * isComplete and getProgress report correct values.
//   * Diary loader picks up all 8 region files.
//   * completeTask + checkProgress track per-tier completion.
//   * complete() enforces tier gating (medium blocked until easy claimed).
//   * grantedPerks accumulates across tiers + regions.
// ══════════════════════════════════════════════════════════════════════════════

const path = require('path');

const collectionLog = require(path.join(__dirname, '..', 'src', 'engine', 'collection-log.js'));
const diary = require(path.join(__dirname, '..', 'src', 'engine', 'diary.js'));

// Load fresh from disk
collectionLog.loadCatalogue();
diary.loadDiaries();

let passed = 0;
let failed = 0;
const failures = [];

function assert(cond, label) {
  if (cond) {
    passed++;
    console.log('  PASS  ' + label);
  } else {
    failed++;
    failures.push(label);
    console.error('  FAIL  ' + label);
  }
}

function section(title) {
  console.log('\n=== ' + title + ' ===');
}

function makePlayer(name) {
  return { id: name, name };
}

// ── 1. Catalogue loaded ──────────────────────────────────────────────────────
section('Collection log catalogue');

const cat = collectionLog.getCatalogue();
assert(cat && Array.isArray(cat.sources), 'catalogue exists with sources array');
assert(cat.sources.length >= 30, 'catalogue has at least 30 sources (got ' + cat.sources.length + ')');
const sourceIds = new Set(cat.sources.map(s => s.id));
assert(sourceIds.size === cat.sources.length, 'all source ids are unique');

const allHaveItems = cat.sources.every(s => Array.isArray(s.items) && s.items.length > 0);
assert(allHaveItems, 'every source has at least one item');

const allHaveCompletionReward = cat.sources.every(s => s.completionReward && s.completionReward.cosmetic && s.completionReward.title);
assert(allHaveCompletionReward, 'every source has cosmetic + title completion reward');

const sampleSource = collectionLog.getSource('forgefather_duran');
assert(sampleSource && sampleSource.name === 'Forgefather Duran', 'getSource(forgefather_duran) returns the right source');

// ── 2. registerEntry — add, dedupe, completion ───────────────────────────────
section('registerEntry add + dedupe + completion');

const p1 = makePlayer('test-collector');
const duran = collectionLog.getSource('forgefather_duran');
assert(duran.items.length >= 2, 'Duran has 2+ items to test completion');

// Initial state
const progBefore = collectionLog.getProgress(p1, 'forgefather_duran');
assert(progBefore.owned.length === 0, 'no items owned before any registration');
assert(progBefore.pct === 0, 'pct = 0 before any registration');
assert(!collectionLog.isComplete(p1, 'forgefather_duran'), 'not complete with zero items');

// Add one item
const r1 = collectionLog.registerEntry(p1, 'forgefather_duran', duran.items[0].id);
assert(r1.added === true, 'first item registers as added');
assert(r1.justCompleted === false, 'partial completion does not trigger justCompleted');

// Dedupe
const r1b = collectionLog.registerEntry(p1, 'forgefather_duran', duran.items[0].id);
assert(r1b.added === false, 'duplicate registration returns added=false');
assert(r1b.reason === 'already_owned', 'duplicate reason is already_owned');

// Add remaining items
for (let i = 1; i < duran.items.length; i++) {
  collectionLog.registerEntry(p1, 'forgefather_duran', duran.items[i].id);
}
const last = collectionLog.registerEntry(p1, 'forgefather_duran', 99999999);
assert(last.added === false && last.reason === 'item_not_in_source', 'unknown item rejected with reason');

assert(collectionLog.isComplete(p1, 'forgefather_duran'), 'isComplete true after all items registered');

const progAfter = collectionLog.getProgress(p1, 'forgefather_duran');
assert(progAfter.pct === 100, 'pct = 100 after all items');
assert(progAfter.complete === true, 'progress.complete === true');
assert(progAfter.missing.length === 0, 'no missing items');
assert(progAfter.owned.length === duran.items.length, 'owned count matches catalogue');

// Completion reward should be in collectionLogRewards
assert(p1.collectionLogRewards.includes('forgefather_duran'), 'reward marked as granted');

const rewards = collectionLog.completionRewards(p1);
const duranReward = rewards.find(r => r.sourceId === 'forgefather_duran');
assert(duranReward, 'completionRewards lists Duran');
assert(duranReward.reward && duranReward.reward.cosmetic, 'reward includes cosmetic');
assert(duranReward.reward.title, 'reward includes title');

// ── 3. getLog totals ─────────────────────────────────────────────────────────
section('getLog totals');

const fullLog = collectionLog.getLog(p1);
assert(fullLog.totals.sources === cat.sources.length, 'getLog totals.sources matches catalogue size');
assert(fullLog.totals.sourcesComplete === 1, 'one source complete');
assert(fullLog.totals.uniqueItemsOwned === duran.items.length, 'owned items count matches');
assert(fullLog.sources.find(s => s.id === 'forgefather_duran').complete === true, 'Duran shows complete in getLog');

// ── 4. Unknown source rejected ───────────────────────────────────────────────
section('Unknown source handling');

const badSource = collectionLog.registerEntry(p1, 'no_such_source', 1);
assert(badSource.added === false, 'unknown sourceId returns added=false');
assert(badSource.reason === 'unknown_source', 'reason is unknown_source');

// ── 5. Diary loader ──────────────────────────────────────────────────────────
section('Diary loader');

const diaries = diary.listDiaries();
const expectedRegions = ['heartlands', 'boneyard', 'moryskah', 'veilwood', 'sootworks', 'saltbrine', 'inkweald', 'glass_desert'];
assert(diaries.length === 8, 'loaded exactly 8 diaries (got ' + diaries.length + ')');
for (const region of expectedRegions) {
  assert(!!diary.getDiary(region), 'diary exists for region: ' + region);
}

const heartlands = diary.getDiary('heartlands');
assert(heartlands.tiers.easy.tasks.length >= 5, 'heartlands easy has 5+ tasks');
assert(heartlands.tiers.medium.tasks.length >= 5, 'heartlands medium has 5+ tasks');
assert(heartlands.tiers.hard.tasks.length >= 5, 'heartlands hard has 5+ tasks');
assert(heartlands.tiers.elite.tasks.length >= 5, 'heartlands elite has 5+ tasks');

const totalTasks = diaries.reduce((sum, d) => {
  return sum + ['easy', 'medium', 'hard', 'elite'].reduce((s, t) => s + d.tiers[t].tasks.length, 0);
}, 0);
assert(totalTasks >= 200, 'total task count >= 200 (got ' + totalTasks + ')');

// All tasks have unique ids per diary
for (const d of diaries) {
  const ids = new Set();
  for (const tier of ['easy', 'medium', 'hard', 'elite']) {
    for (const task of d.tiers[tier].tasks) {
      assert(!ids.has(task.id), 'task id unique in ' + d.region + ': ' + task.id);
      ids.add(task.id);
    }
  }
}

// All tiers have reward + perk_description
for (const d of diaries) {
  for (const tier of ['easy', 'medium', 'hard', 'elite']) {
    assert(typeof d.tiers[tier].reward === 'string' && d.tiers[tier].reward.length > 0, d.region + '/' + tier + ' has reward');
    assert(typeof d.tiers[tier].perk_description === 'string' && d.tiers[tier].perk_description.length > 0, d.region + '/' + tier + ' has perk_description');
  }
}

// ── 6. Diary task completion + tier ──────────────────────────────────────────
section('Diary completeTask + checkProgress');

const p2 = makePlayer('test-diarist');
const initialProgress = diary.checkProgress(p2, 'heartlands');
assert(initialProgress, 'checkProgress returns object for heartlands');
assert(initialProgress.easy.done === 0, 'easy starts at 0');
assert(initialProgress.easy.complete === false, 'easy starts incomplete');
assert(initialProgress.easy.claimed === false, 'easy starts unclaimed');

// Complete each easy task
const easyTasks = heartlands.tiers.easy.tasks;
for (const task of easyTasks) {
  const r = diary.completeTask(p2, 'heartlands', task.id);
  assert(r.ok === true, 'completeTask ok for ' + task.id);
}

// Duplicate completion rejected
const dup = diary.completeTask(p2, 'heartlands', easyTasks[0].id);
assert(dup.ok === false && dup.reason === 'already_complete', 'duplicate completeTask rejected');

// Unknown task rejected
const unk = diary.completeTask(p2, 'heartlands', 'zzz_no_such');
assert(unk.ok === false && unk.reason === 'unknown_task', 'unknown task rejected');

const easyProg = diary.checkProgress(p2, 'heartlands');
assert(easyProg.easy.done === easyTasks.length, 'easy.done matches task count');
assert(easyProg.easy.complete === true, 'easy.complete after all tasks');
assert(easyProg.easy.claimed === false, 'easy still unclaimed (must call complete())');

// ── 7. Tier gating ───────────────────────────────────────────────────────────
section('Diary tier gating');

// Try to claim medium before easy
const blockedMed = diary.complete(p2, 'heartlands', 'medium');
assert(blockedMed.ok === false, 'cannot claim medium before easy is claimed');
assert(blockedMed.reason === 'prior_tier_unclaimed', 'reason is prior_tier_unclaimed');
assert(blockedMed.priorTier === 'easy', 'priorTier is easy');

// Try to claim hard before medium
const blockedHard = diary.complete(p2, 'heartlands', 'hard');
assert(blockedHard.ok === false && blockedHard.priorTier === 'medium', 'hard blocked by medium');

// Now claim easy properly
const easyClaim = diary.complete(p2, 'heartlands', 'easy');
assert(easyClaim.ok === true, 'easy claim succeeds when complete');
assert(easyClaim.tier === 'easy', 'returned tier matches');
assert(easyClaim.perk, 'returns perk description');

// Re-claim rejected
const reclaim = diary.complete(p2, 'heartlands', 'easy');
assert(reclaim.ok === false && reclaim.reason === 'already_claimed', 'already claimed rejected');

// Now medium is unblocked but tier_incomplete (no medium tasks done)
const medGated = diary.complete(p2, 'heartlands', 'medium');
assert(medGated.ok === false && medGated.reason === 'tier_incomplete', 'medium still incomplete blocks claim');

// Complete all medium tasks then claim
for (const task of heartlands.tiers.medium.tasks) {
  diary.completeTask(p2, 'heartlands', task.id);
}
const medClaim = diary.complete(p2, 'heartlands', 'medium');
assert(medClaim.ok === true, 'medium claim succeeds after all tasks done and easy claimed');

// ── 8. grantedPerks ──────────────────────────────────────────────────────────
section('grantedPerks');

const perks = diary.grantedPerks(p2);
assert(perks.length === 2, 'granted 2 perks (heartlands easy + medium)');
const perkTiers = perks.map(p => p.tier).sort();
assert(perkTiers[0] === 'easy' && perkTiers[1] === 'medium', 'perks include easy and medium');
assert(perks.every(p => p.region === 'heartlands'), 'both perks are heartlands');

// ── 9. Multi-region perks ────────────────────────────────────────────────────
section('Cross-region grantedPerks accumulation');

const p3 = makePlayer('test-explorer');
// Complete easy in heartlands and boneyard
for (const task of diary.getDiary('heartlands').tiers.easy.tasks) {
  diary.completeTask(p3, 'heartlands', task.id);
}
diary.complete(p3, 'heartlands', 'easy');
for (const task of diary.getDiary('boneyard').tiers.easy.tasks) {
  diary.completeTask(p3, 'boneyard', task.id);
}
diary.complete(p3, 'boneyard', 'easy');

const multiPerks = diary.grantedPerks(p3);
assert(multiPerks.length === 2, 'two regions claimed = two perks');
const regions = multiPerks.map(p => p.region).sort();
assert(regions.includes('heartlands') && regions.includes('boneyard'), 'perks span heartlands + boneyard');

// ── 10. Unknown region rejected ──────────────────────────────────────────────
section('Unknown region handling');

const badRegion = diary.checkProgress(p3, 'no_such_region');
assert(badRegion === null, 'checkProgress returns null for unknown region');

const badComplete = diary.complete(p3, 'no_such_region', 'easy');
assert(badComplete.ok === false && badComplete.reason === 'unknown_region', 'complete returns unknown_region');

const badTier = diary.complete(p3, 'heartlands', 'super_elite');
assert(badTier.ok === false && badTier.reason === 'unknown_tier', 'unknown tier rejected');

// ── Summary ──────────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════════════════════════════════════');
console.log('Tests passed: ' + passed);
console.log('Tests failed: ' + failed);
if (failed > 0) {
  console.log('Failures:');
  for (const f of failures) console.log('  - ' + f);
  process.exit(1);
}
console.log('All tests passed.');
console.log('Sources: ' + cat.sources.length + ' | Diaries: ' + diaries.length + ' | Total tasks: ' + totalTasks);
process.exit(0);
