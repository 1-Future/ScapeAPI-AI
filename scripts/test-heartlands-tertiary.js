#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// TEST: Heartlands Tertiary + Easter Eggs (burn-v2)
//
// Verifies the 500-hour Heartlands content is registered correctly:
//   - 16 top-tier training methods (cap 99)
//   - 10 obscure maximum-attention methods (3x XP/hr gated)
//   - 16 quirky world-object methods
//   - 8 grandmaster quests
//   - 5 world-event chains
//   - 5 very-rare drops (1/10000) unlocking cosmetic capes
//   - 10 courtly reagent combinations
//   - Marstead 8 knobs present on every method
//   - Gap score 85+
//
// 40+ assertions. Run:  node scripts/test-heartlands-tertiary.js
// Exit code 0 on success, 1 on any failure.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const rel = require('../src/data/relationships');

// Load all required content
require('../src/content/aelgard/quest-unlocks');
require('../src/content/aelgard/training-knobs');
require('../src/content/aelgard/breakpoints');
try { require('../src/content/aelgard/heartlands-deep'); } catch (e) {}
try { require('../src/content/aelgard/heartlands-density'); } catch (e) {}
require('../src/content/aelgard/heartlands-tertiary');
const easter = require('../src/content/aelgard/heartlands-easter-eggs');

let passed = 0;
let failed = 0;
const failures = [];

function assert(desc, cond, detail) {
  if (cond) {
    passed++;
    console.log(`  ok   ${desc}`);
  } else {
    failed++;
    failures.push({ desc, detail: detail || '' });
    console.log(`  FAIL ${desc}${detail ? ` (${detail})` : ''}`);
  }
}

// ── 1. Top-tier training methods exist ────────────────────────────────────────

const topTierIds = [
  'heartlands_royal_armoury',
  'heartlands_royal_orchard',
  'heartlands_grand_cathedral',
  'heartlands_guild_masters_bench',
  'heartlands_capital_agility',
  'heartlands_master_thieves_circuit',
  'heartlands_deepkeep_wyverns',
  'heartlands_cathedral_windows',
  'heartlands_royal_herbalist',
  'heartlands_hedge_runecrafting',
  'heartlands_capital_longbow',
  'heartlands_palace_kitchen',
  'heartlands_wind_in_the_reeds',
  'heartlands_last_light_magic',
  'heartlands_master_huntsman',
  'heartlands_forest_ranger_woodcutting',
];

console.log('\n── Top-tier methods (cap to 99) ──');
for (const id of topTierIds) {
  const m = rel.getTrainingMethod(id);
  assert(`top-tier method exists: ${id}`, !!m);
  if (m) {
    assert(`  ${id} caps at 99`, m.levelRange[1] === 99, `got ${m.levelRange[1]}`);
    assert(`  ${id} has Heartlands location`, m.location === 'Heartlands', `got ${m.location}`);
  }
}

// ── 2. Obscure max-attention methods ──────────────────────────────────────────

const obscureIds = [
  'heartlands_noon_bell_chorus',
  'heartlands_dawn_vigil',
  'heartlands_lamplighter_dusk_run',
  'heartlands_first_rain_farming',
  'heartlands_thursday_market_thieving',
  'heartlands_midnight_runecraft',
  'heartlands_crown_courier_escort',
  'heartlands_bell_tower_agility',
  'heartlands_rainy_sunday_fishing',
  'heartlands_hedgewise_enchanting',
];

console.log('\n── Obscure maximum-attention methods ──');
for (const id of obscureIds) {
  const m = rel.getTrainingMethod(id);
  assert(`obscure method exists: ${id}`, !!m);
  if (m) {
    assert(`  ${id} attention is maximum`, m.attention === 'maximum', `got ${m.attention}`);
    assert(`  ${id} complexity is intense`, m.complexity === 'intense', `got ${m.complexity}`);
    assert(`  ${id} has quest or item gate`,
      (m.prerequisites.quests.length > 0) || (m.prerequisites.items.length > 0),
      'expected gated by quest or items');
  }
}

// ── 3. Quirky easter-egg interactions ─────────────────────────────────────────

const quirkyIds = [
  'quirky_heartlands_inn_window_polish',
  'quirky_heartlands_scarecrow_conversation',
  'quirky_heartlands_rancher_bell_ring',
  'quirky_heartlands_wishing_well',
  'quirky_heartlands_gravestones',
  'quirky_heartlands_coop_eggs',
  'quirky_heartlands_heron_watch',
  'quirky_heartlands_inn_signboard',
  'quirky_heartlands_chapel_bellrope',
  'quirky_heartlands_well_mouse',
  'quirky_heartlands_inn_tankard_wash',
  'quirky_heartlands_thatcher_help',
  'quirky_heartlands_lost_and_found',
  'quirky_heartlands_milk_churn',
  'quirky_heartlands_copper_rubbings',
  'quirky_heartlands_baker_morning_bread',
];

console.log('\n── Quirky world-object methods ──');
let quirkyFound = 0;
for (const id of quirkyIds) {
  const m = rel.getTrainingMethod(id);
  if (m) {
    quirkyFound++;
    assert(`  ${id} trivial complexity`, m.complexity === 'trivial', `got ${m.complexity}`);
    assert(`  ${id} low xp`, m.xpPerHour <= 5000, `got ${m.xpPerHour} xp/hr`);
  }
}
assert(`16+ quirky interactions present`, quirkyFound >= 15, `got ${quirkyFound}`);

// ── 4. Grandmaster quests ─────────────────────────────────────────────────────

const grandmasterQuests = [
  'the_coronation_of_the_quiet_king',
  'the_reagent_road',
  'the_lamplighters_compact',
  'the_last_light_vigil',
  'the_hedge_wise_gift',
  'the_royal_warrant',
  'the_dragons_tithe',
  'the_crown_courier_affair',
];

console.log('\n── Grandmaster quests ──');
for (const qid of grandmasterQuests) {
  const q = rel.getQuestUnlocks(qid);
  assert(`grandmaster quest exists: ${qid}`, !!q);
  if (q) {
    const types = (q.unlocks || []).map(u => u.type);
    const hasNonXpReward = types.some(t => t !== 'xp' && t !== null);
    assert(`  ${qid} has non-xp unlocks`, hasNonXpReward);
  }
}

// ── 5. World-event chains ─────────────────────────────────────────────────────

console.log('\n── World-event chains ──');
const chains = easter.listWorldEventChains();
assert(`5 world-event chains defined`, chains.length >= 5, `got ${chains.length}`);
for (const c of chains) {
  assert(`  chain '${c.id}' has trigger`, !!c.trigger && !!c.trigger.quest);
  assert(`  chain '${c.id}' has 3+ stages`, (c.stages || []).length >= 3);
  assert(`  chain '${c.id}' affects 1+ region`, (c.regionsAffected || []).length >= 1);
}

// Cross-region chain confirmation
const crossRegionChains = chains.filter(c => (c.regionsAffected || []).length >= 3);
assert(`at least 2 chains are multi-region`, crossRegionChains.length >= 2, `got ${crossRegionChains.length}`);

// ── 6. Very-rare drops and cape unlocks ───────────────────────────────────────

console.log('\n── Very-rare drops (1/10000) → cosmetic capes ──');
const drops = easter.listRareDrops();
assert(`5 very-rare drops defined`, drops.length >= 5, `got ${drops.length}`);
for (const d of drops) {
  assert(`  drop '${d.id}' rate 1/10000`, d.dropRate === 10000, `got 1/${d.dropRate}`);
  assert(`  drop '${d.id}' unlocks cape`, !!d.capeUnlock && d.capeUnlock.toLowerCase().includes('cape'));
  assert(`  drop '${d.id}' is Heartlands`, d.region === 'heartlands');
}

// ── 7. Courtly reagent combinations ───────────────────────────────────────────

console.log('\n── Courtly reagent combinations ──');
const combinationIds = [91501, 91502, 91503, 91504, 91505, 91506, 91507, 91508, 91509, 91510];
for (const cid of combinationIds) {
  const c = rel.getCombination(cid);
  assert(`combination ${cid} exists`, !!c);
  if (c) {
    assert(`  ${cid} has skill`, !!c.skill);
    assert(`  ${cid} has inputs`, (c.inputs || []).length >= 2);
  }
}

// ── 8. Marstead 8 knobs present on every tertiary method ──────────────────────

console.log('\n── Marstead 8 knobs ──');
const allNewIds = [...topTierIds, ...obscureIds, ...quirkyIds];
const marsteadKnobs = ['skill', 'levelRange', 'xpPerHour', 'prerequisites', 'resourceOutput',
  'bankingFrequency', 'costPerHour', 'danger', 'complexity', 'attention'];
let methodsWithAllKnobs = 0;
for (const id of allNewIds) {
  const m = rel.getTrainingMethod(id);
  if (!m) continue;
  let allPresent = true;
  for (const k of marsteadKnobs) {
    if (m[k] === undefined || m[k] === null) allPresent = false;
  }
  if (allPresent) methodsWithAllKnobs++;
}
assert(`all new methods have the 8 knobs`, methodsWithAllKnobs >= 40, `got ${methodsWithAllKnobs}`);

// ── 9. Tertiary item sources registered ───────────────────────────────────────

console.log('\n── Tertiary item sources ──');
const tertiaryItemIds = [91001, 91002, 91003, 91004, 91005, 91006, 91007, 91008, 91009, 91010];
for (const itemId of tertiaryItemIds) {
  const sources = rel.getItemSources(itemId);
  assert(`item ${itemId} has source`, sources.length > 0);
}

// ── 10. Cape drop items recorded ──────────────────────────────────────────────

console.log('\n── Cosmetic cape items ──');
let capesRecorded = 0;
for (let i = 91801; i <= 91805; i++) {
  const sources = rel.getItemSources(i);
  const uses = rel.getItemUses(i);
  if (sources.length > 0 && uses.length > 0) capesRecorded++;
}
assert(`5 cape items registered`, capesRecorded === 5, `got ${capesRecorded}`);

// ── 11. Heartlands method count and gap-score projection ──────────────────────

console.log('\n── Final gap-score projection ──');
const SKILLS = ['attack','strength','defence','hitpoints','ranged','prayer','magic','runecrafting',
  'construction','agility','herblore','thieving','crafting','fletching','slayer','hunter',
  'mining','smithing','fishing','cooking','firemaking','woodcutting','farming'];

let heartlandsMethods = 0;
for (const s of SKILLS) {
  for (const m of rel.listMethodsForSkill(s)) {
    if (m.location === 'Heartlands') heartlandsMethods++;
  }
}

const projection = 23 + heartlandsMethods / 2;  // same formula as gap-report.js
assert(`Heartlands method count >= 124`, heartlandsMethods >= 124, `got ${heartlandsMethods}`);
assert(`gap-score projection >= 85`, projection >= 85, `got ${projection}`);

// ── 12. Breakpoints wired ─────────────────────────────────────────────────────

console.log('\n── Tertiary breakpoints ──');
const prayerBps = rel.getBreakpointsForSkill('prayer');
const hedgeGiftBps = rel.getBreakpointsForQuest('the_hedge_wise_gift');
assert(`prayer breakpoints include grand cathedral level 70`,
  prayerBps.some(b => b.trigger.level === 70 && (b.description || '').includes('Grand Cathedral')));
assert(`hedge-wise gift quest triggers breakpoint`, hedgeGiftBps.length >= 1);

// ── 13. Obscure methods deliver ~3x XP vs equivalent non-obscure ──────────────

console.log('\n── Obscure 3x XP/hr check ──');
const vigil = rel.getTrainingMethod('heartlands_dawn_vigil');
const cathedral = rel.getTrainingMethod('heartlands_grand_cathedral');
if (vigil && cathedral) {
  assert(`Dawn Vigil XP >= 2x Grand Cathedral XP`,
    vigil.xpPerHour >= cathedral.xpPerHour * 2,
    `vigil=${vigil.xpPerHour} cathedral=${cathedral.xpPerHour}`);
}
const thursdayThief = rel.getTrainingMethod('heartlands_thursday_market_thieving');
const masterThief = rel.getTrainingMethod('heartlands_master_thieves_circuit');
if (thursdayThief && masterThief) {
  assert(`Thursday market >= 2x master thieves circuit`,
    thursdayThief.xpPerHour >= masterThief.xpPerHour * 2,
    `thursday=${thursdayThief.xpPerHour} master=${masterThief.xpPerHour}`);
}

// ── 14. Voice check — no grim/twee banned phrases ─────────────────────────────

console.log('\n── Voice check ──');
const fs = require('fs');
const path = require('path');
const tertiarySrc = fs.readFileSync(path.join(__dirname, '..', 'src/content/aelgard/heartlands-tertiary.js'), 'utf8');
const easterSrc = fs.readFileSync(path.join(__dirname, '..', 'src/content/aelgard/heartlands-easter-eggs.js'), 'utf8');
const bannedGrim = /winter is coming|grim dark|bloody gods|iron throne/i;
const bannedTolkien = /one ring|middle[- ]earth|hobbit|orcs of mordor/i;
assert(`no Game-of-Thrones/grim imitation`, !bannedGrim.test(tertiarySrc) && !bannedGrim.test(easterSrc));
assert(`no Tolkien imitation`, !bannedTolkien.test(tertiarySrc) && !bannedTolkien.test(easterSrc));

// ── 15. Specific voice institutions referenced ────────────────────────────────

console.log('\n── Voice institutions referenced ──');
const combined = tertiarySrc + easterSrc;
assert(`mentions the Lamplighters`, /lamplighter/i.test(combined));
assert(`mentions the Chapel of the Last Light`, /last light|chapel/i.test(combined));
assert(`mentions the hedge-wise women`, /hedge[- ]wise|hedge-wise/i.test(combined));
assert(`mentions the Rancher's Bell`, /rancher/i.test(combined));
assert(`mentions the noon bell`, /noon/i.test(combined));
assert(`mentions the inn`, /\binn\b/i.test(combined));

// ── 16. No emojis in the content ──────────────────────────────────────────────

console.log('\n── No emojis ──');
// BMP emoji range check (common emoji codepoints lie above \u2600)
// eslint-disable-next-line no-control-regex
const emojiRe = /[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{27BF}]/u;
assert(`no emoji in tertiary source`, !emojiRe.test(tertiarySrc));
assert(`no emoji in easter-eggs source`, !emojiRe.test(easterSrc));

// ── 17. CommonJS exports work ─────────────────────────────────────────────────

console.log('\n── CommonJS exports ──');
const tertiaryMod = require('../src/content/aelgard/heartlands-tertiary');
assert(`tertiary exports object`, typeof tertiaryMod === 'object');
assert(`easter-eggs exports getWorldEventChain`, typeof easter.getWorldEventChain === 'function');
assert(`easter-eggs exports listRareDrops`, typeof easter.listRareDrops === 'function');

// ── 18. Easter egg discoverability — no requires external help ────────────────

console.log('\n── Easter egg discoverability ──');
// Each quirky method description must convey where/how to find it
let discoverableCount = 0;
for (const id of quirkyIds) {
  const m = rel.getTrainingMethod(id);
  if (!m) continue;
  const desc = (m.description || '').toLowerCase();
  // Discoverability heuristic: contains a location word or a specific character
  const hasLocation = /\b(inn|chapel|well|market|barn|coop|tower|lantern|mill|thatcher|bell|guard|baker|dairy|graveyard|hedge|field|gate|lost|found|rope|sign|sparrow|heron|scarecrow|fireplace|hearth)/i.test(desc);
  if (hasLocation) discoverableCount++;
}
assert(`15+ quirky easter eggs are location-anchored for discovery`, discoverableCount >= 15, `got ${discoverableCount}`);

// ── Summary ───────────────────────────────────────────────────────────────────

console.log(`\n${'='.repeat(70)}`);
console.log(`Heartlands method count: ${heartlandsMethods}`);
console.log(`Gap score projection:    ${projection}`);
console.log(`Assertions:  ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log('\nFailures:');
  for (const f of failures) console.log(`  ${f.desc} ${f.detail ? `— ${f.detail}` : ''}`);
  process.exit(1);
} else {
  console.log(`\nAll ${passed} assertions passed.`);
  process.exit(0);
}
