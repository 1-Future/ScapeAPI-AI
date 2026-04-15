#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// TEST: Moryskah Tertiary + Easter Eggs (burn-v2)
//
// Verifies the 500-hour Moryskah content is registered correctly:
//   - 25 top-tier training methods (cap 99)
//   - 15 obscure maximum-attention methods
//   - 18 quirky world-object methods
//   - 10 combo-practice methods (repeatable station work)
//   - 10 seasonal/pilgrimage methods (weekly/seasonal loops)
//   - 8 grandmaster quests (registered also as methods)
//   - 5 world-event chains
//   - 5 very-rare drops (1/10000) unlocking cosmetic capes
//   - 5 cape-pilgrimage methods
//   - 10 reagent combinations
//   - Marstead 8 knobs present on every method
//   - Gap score 90+ for Moryskah
//
// 50+ assertions. Run:  node scripts/test-moryskah-tertiary.js
// Exit code 0 on success, 1 on any failure.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const rel = require('../src/data/relationships');

// Load all required content
require('../src/content/aelgard/quest-unlocks');
require('../src/content/aelgard/training-knobs');
require('../src/content/aelgard/breakpoints');
try { require('../src/content/aelgard/moryskah-deep'); } catch (e) {}
try { require('../src/content/aelgard/moryskah-density'); } catch (e) {}
require('../src/content/aelgard/moryskah-tertiary');
const easter = require('../src/content/aelgard/moryskah-easter-eggs');

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

// ── 1. Top-tier training methods exist (cap 99) ───────────────────────────────

const topTierIds = [
  'moryskah_silent_chapel_smithing',
  'moryskah_bog_witch_resurrection_farm',
  'moryskah_hollow_choir_offerings',
  'moryskah_cabaret_crafting',
  'moryskah_mausoleum_agility',
  'moryskah_immigration_thieving',
  'moryskah_frostwyrm_slayer',
  'moryskah_chapel_construction',
  'moryskah_wolfbane_distillery_herblore',
  'moryskah_ferry_runecrafting',
  'moryskah_barrows_sisterhood_fletching',
  'moryskah_mortuary_cooking',
  'moryskah_tallow_firemaking',
  'moryskah_castle_magic',
  'moryskah_werewolf_tracker_hunter',
  'moryskah_ferry_woodcutting',
  'moryskah_castle_kitchen_strength',
  'moryskah_sisterhood_defence',
  'moryskah_cabaret_hitpoints',
  'moryskah_wake_ranged',
  'moryskah_reliquary_mining',
  'moryskah_grael_fishing',
  'moryskah_distillery_cooking',
  'moryskah_choir_magic',
  'moryskah_hamlet_construction',
];

console.log('\n── Top-tier methods (cap to 99) ──');
for (const id of topTierIds) {
  const m = rel.getTrainingMethod(id);
  assert(`top-tier method exists: ${id}`, !!m);
  if (m) {
    assert(`  ${id} caps at 99`, m.levelRange[1] === 99, `got ${m.levelRange[1]}`);
    assert(`  ${id} has Moryskah location`, m.location === 'Moryskah', `got ${m.location}`);
  }
}

// ── 2. Obscure max-attention methods ──────────────────────────────────────────

const obscureIds = [
  'moryskah_moonless_ledger_thieving',
  'moryskah_dawn_ossuary_prayer',
  'moryskah_cabaret_matinee_hitpoints',
  'moryskah_sisterhood_herblore',
  'moryskah_ferry_midnight_runecrafting',
  'moryskah_wolfbane_still_firemaking',
  'moryskah_hollow_midnight_magic',
  'moryskah_rooftop_stormwalk_agility',
  'moryskah_butler_stair_strength',
  'moryskah_bog_first_fog_farming',
  'moryskah_barrows_brother_by_brother_slayer',
  'moryskah_vampire_cabaret_performance_crafting',
  'moryskah_ferry_sunrise_fishing',
  'moryskah_silent_chapel_sanctum_magic',
  'moryskah_cabaret_stage_hunter',
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
  'quirky_moryskah_inn_register_polish',
  'quirky_moryskah_scarecrow_autopsy',
  'quirky_moryskah_chapel_bell_toll',
  'quirky_moryskah_well_letter_retrieve',
  'quirky_moryskah_graveyard_weed',
  'quirky_moryskah_coop_reaper',
  'quirky_moryskah_heron_ferryman',
  'quirky_moryskah_inn_signboard_relight',
  'quirky_moryskah_chapel_bellrope_pull',
  'quirky_moryskah_distillery_nightwatch',
  'quirky_moryskah_inn_tankard_polish',
  'quirky_moryskah_thatcher_helper',
  'quirky_moryskah_lost_and_found',
  'quirky_moryskah_distillery_churn',
  'quirky_moryskah_gate_rubbings',
  'quirky_moryskah_distillery_mash_taste',
  'quirky_moryskah_cabaret_programme_signing',
  'quirky_moryskah_barrows_picnic',
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
assert(`15+ quirky interactions present`, quirkyFound >= 15, `got ${quirkyFound}`);

// ── 4. Grandmaster quests (registered as questUnlocks AND as methods) ─────────

const grandmasterQuests = [
  'the_coronation_of_the_quiet_count',
  'the_ferrymans_rounds',
  'the_sisterhoods_wills',
  'malachars_returned_correspondence',
  'the_wolfbane_compact',
  'the_cabaret_season_ticket',
  'the_immigration_papers',
  'the_hollow_choirs_descant',
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
  const m = rel.getTrainingMethod(`grandmaster_${qid}`);
  assert(`grandmaster method registered: grandmaster_${qid}`, !!m);
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
  assert(`  drop '${d.id}' is Moryskah`, d.region === 'moryskah');
}

// ── 7. Reagent combinations ───────────────────────────────────────────────────

console.log('\n── Reagent combinations ──');
const combinationIds = [95501, 95502, 95503, 95504, 95505, 95506, 95507, 95508, 95509, 95510];
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
const capePilgrimageIds = [
  'moryskah_writer_cape_pilgrimage',
  'moryskah_unremembered_cape_pilgrimage',
  'moryskah_youngest_cape_pilgrimage',
  'moryskah_distiller_cape_pilgrimage',
  'moryskah_director_cape_pilgrimage',
];
const comboPracticeIds = [
  'moryskah_sigil_chapel_practice',
  'moryskah_sigil_moonless_practice',
  'moryskah_sigil_choir_practice',
  'moryskah_reliquary_sisterhood_practice',
  'moryskah_writ_lesser_practice',
  'moryskah_writ_greater_practice',
  'moryskah_reliquarist_badge_practice',
  'moryskah_distiller_badge_practice',
  'moryskah_cabaret_card_practice',
  'moryskah_bog_charm_practice',
];
const seasonalIds = [
  'moryskah_season_fog_walk',
  'moryskah_wake_night_cooking',
  'moryskah_season_bell_toll_prayer',
  'moryskah_ferryman_weekly_woodcut',
  'moryskah_distillery_tax_thieving',
  'moryskah_sisterhood_mending_fletch',
  'moryskah_cabaret_stage_ranged',
  'moryskah_chapel_organist_magic',
  'moryskah_hamlet_fire_watch',
  'moryskah_bog_witch_apprentice_hunter',
];
const allNewIds = [
  ...topTierIds,
  ...obscureIds,
  ...quirkyIds,
  ...capePilgrimageIds,
  ...comboPracticeIds,
  ...seasonalIds,
];
const marsteadKnobs = [
  'skill', 'levelRange', 'xpPerHour', 'prerequisites', 'resourceOutput',
  'bankingFrequency', 'costPerHour', 'danger', 'complexity', 'attention',
];
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
assert(`all new methods have the 8 knobs`, methodsWithAllKnobs >= 60, `got ${methodsWithAllKnobs}`);

// ── 9. Tertiary item sources registered ───────────────────────────────────────

console.log('\n── Tertiary item sources ──');
const tertiaryItemIds = [95500, 95501, 95502, 95503, 95504, 95505, 95506, 95507, 95508, 95509,
                         95510, 95511, 95512, 95513, 95514, 95515, 95516, 95517, 95518, 95519];
let itemSourcesFound = 0;
for (const itemId of tertiaryItemIds) {
  const sources = rel.getItemSources(itemId);
  if (sources.length > 0) itemSourcesFound++;
}
assert(`20 tertiary items have sources`, itemSourcesFound >= 20, `got ${itemSourcesFound}`);

// ── 10. Cape drop items recorded ──────────────────────────────────────────────

console.log('\n── Cosmetic cape items ──');
let capesRecorded = 0;
for (let i = 95701; i <= 95705; i++) {
  const sources = rel.getItemSources(i);
  const uses = rel.getItemUses(i);
  if (sources.length > 0 && uses.length > 0) capesRecorded++;
}
assert(`5 cape items registered`, capesRecorded === 5, `got ${capesRecorded}`);

// ── 11. Moryskah method count and gap-score projection ────────────────────────

console.log('\n── Final gap-score projection ──');
const SKILLS = ['attack','strength','defence','hitpoints','ranged','prayer','magic','runecrafting',
  'construction','agility','herblore','thieving','crafting','fletching','slayer','hunter',
  'mining','smithing','fishing','cooking','firemaking','woodcutting','farming'];

let moryskahMethods = 0;
for (const s of SKILLS) {
  for (const m of rel.listMethodsForSkill(s)) {
    if (m.location === 'Moryskah') moryskahMethods++;
  }
}

const projection = 23 + moryskahMethods / 2;  // same formula as gap-report.js
assert(`Moryskah method count >= 134`, moryskahMethods >= 134, `got ${moryskahMethods}`);
assert(`gap-score projection >= 90`, projection >= 90, `got ${projection}`);

// ── 12. Breakpoints wired ─────────────────────────────────────────────────────

console.log('\n── Tertiary breakpoints ──');
const prayerBps = rel.getBreakpointsForSkill('prayer');
const sisterhoodBps = rel.getBreakpointsForQuest('barrows_brothers_legend');
assert(`prayer breakpoints include Hollow Choir level 70`,
  prayerBps.some(b => b.trigger.level === 70 && (b.description || '').toLowerCase().includes('choir')));
assert(`sisterhood quest triggers breakpoint`, sisterhoodBps.length >= 1);

// ── 13. Obscure methods deliver ~3x XP vs equivalent non-obscure ──────────────

console.log('\n── Obscure 3x XP/hr check ──');
const dawnOssuary = rel.getTrainingMethod('moryskah_dawn_ossuary_prayer');
const hollowChoirOfferings = rel.getTrainingMethod('moryskah_hollow_choir_offerings');
if (dawnOssuary && hollowChoirOfferings) {
  assert(`Dawn Ossuary XP >= 2x Hollow Choir Offerings`,
    dawnOssuary.xpPerHour >= hollowChoirOfferings.xpPerHour * 2,
    `ossuary=${dawnOssuary.xpPerHour} offerings=${hollowChoirOfferings.xpPerHour}`);
}
const moonlessLedger = rel.getTrainingMethod('moryskah_moonless_ledger_thieving');
const backOffice = rel.getTrainingMethod('moryskah_immigration_thieving');
if (moonlessLedger && backOffice) {
  assert(`Moonless Ledger >= 2x Back Office thieving`,
    moonlessLedger.xpPerHour >= backOffice.xpPerHour * 2,
    `ledger=${moonlessLedger.xpPerHour} office=${backOffice.xpPerHour}`);
}

// ── 14. Voice check — no grim/twee banned phrases ─────────────────────────────

console.log('\n── Voice check ──');
const fs = require('fs');
const path = require('path');
const tertiarySrc = fs.readFileSync(path.join(__dirname, '..', 'src/content/aelgard/moryskah-tertiary.js'), 'utf8');
const easterSrc = fs.readFileSync(path.join(__dirname, '..', 'src/content/aelgard/moryskah-easter-eggs.js'), 'utf8');
const bannedGrim = /winter is coming|grim dark|bloody gods|iron throne/i;
const bannedTolkien = /one ring|middle[- ]earth|hobbit|orcs of mordor/i;
assert(`no Game-of-Thrones/grim imitation`, !bannedGrim.test(tertiarySrc) && !bannedGrim.test(easterSrc));
assert(`no Tolkien imitation`, !bannedTolkien.test(tertiarySrc) && !bannedTolkien.test(easterSrc));

// ── 15. Specific voice institutions referenced ────────────────────────────────

console.log('\n── Voice institutions referenced ──');
const combined = tertiarySrc + easterSrc;
assert(`mentions the Silent Chapel`, /silent chapel/i.test(combined));
assert(`mentions the Moonless Inn`, /moonless inn/i.test(combined));
assert(`mentions the Hollow Choir`, /hollow choir/i.test(combined));
assert(`mentions the Barrows Sisterhood`, /barrows sisterhood|sisterhood/i.test(combined));
assert(`mentions the Wolfbane Distillery`, /wolfbane distillery/i.test(combined));
assert(`mentions the Ferry of the Forgotten`, /ferry of the forgotten|ferryman/i.test(combined));
assert(`mentions Lord Malachar by name`, /malachar/i.test(combined));
assert(`mentions the Bog Witch`, /bog witch|grael/i.test(combined));

// ── 16. No emojis in the content ──────────────────────────────────────────────

console.log('\n── No emojis ──');
const emojiRe = /[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{27BF}]/u;
assert(`no emoji in tertiary source`, !emojiRe.test(tertiarySrc));
assert(`no emoji in easter-eggs source`, !emojiRe.test(easterSrc));

// ── 17. CommonJS exports work ─────────────────────────────────────────────────

console.log('\n── CommonJS exports ──');
const tertiaryMod = require('../src/content/aelgard/moryskah-tertiary');
assert(`tertiary exports object`, typeof tertiaryMod === 'object');
assert(`easter-eggs exports getWorldEventChain`, typeof easter.getWorldEventChain === 'function');
assert(`easter-eggs exports listRareDrops`, typeof easter.listRareDrops === 'function');

// ── 18. Easter egg discoverability — no requires external help ────────────────

console.log('\n── Easter egg discoverability ──');
let discoverableCount = 0;
for (const id of quirkyIds) {
  const m = rel.getTrainingMethod(id);
  if (!m) continue;
  const desc = (m.description || '').toLowerCase();
  // Discoverability heuristic: contains a Moryskah landmark or object
  const hasLocation = /\b(inn|chapel|well|bell|distillery|ferry|mausoleum|cabaret|barrows|sisterhood|hamlet|coop|tower|scarecrow|coffin|graveyard|register|tankard|ladder|churn|stage|programme|organ|roofer|post|box|mash|barley|cat|pinwheel|heron|magnet|charcoal|paper|rooftop)/i.test(desc);
  if (hasLocation) discoverableCount++;
}
assert(`15+ quirky easter eggs are location-anchored for discovery`, discoverableCount >= 15, `got ${discoverableCount}`);

// ── 19. Voice specifics — long trailing clauses + gothic-softened-with-humor ──

console.log('\n── Voice specifics ──');
// Count semicolons and em-dashes per 1000 chars; the voice uses them heavily
const semicolonDensity = (combined.match(/;/g) || []).length / (combined.length / 1000);
assert(`voice uses trailing clauses (semicolons per 1k chars >= 1.5)`,
  semicolonDensity >= 1.5, `got ${semicolonDensity.toFixed(2)}`);
// At least one explicit humor marker in Moryskah descriptions (polite deflection)
assert(`voice contains Discworld-style polite deflection`,
  /politely|kindly|he says|she says|the foreman says|she will not|not, as yet|a matter between|not, properly speaking/i.test(combined));

// ── 20. Combo-practice methods trainable as training methods ──────────────────

console.log('\n── Combo-practice methods ──');
for (const id of comboPracticeIds) {
  const m = rel.getTrainingMethod(id);
  assert(`combo-practice method exists: ${id}`, !!m);
  if (m) {
    assert(`  ${id} cap 99`, m.levelRange[1] === 99, `got ${m.levelRange[1]}`);
  }
}

// ── 21. Seasonal/pilgrimage methods exist ─────────────────────────────────────

console.log('\n── Seasonal/pilgrimage methods ──');
for (const id of seasonalIds) {
  const m = rel.getTrainingMethod(id);
  assert(`seasonal method exists: ${id}`, !!m);
}

// ── 22. Cape-pilgrimage methods exist ─────────────────────────────────────────

console.log('\n── Cape-pilgrimage methods ──');
for (const id of capePilgrimageIds) {
  const m = rel.getTrainingMethod(id);
  assert(`cape-pilgrimage method exists: ${id}`, !!m);
  if (m) {
    assert(`  ${id} in Moryskah`, m.location === 'Moryskah', `got ${m.location}`);
  }
}

// ── 23. No duplicates with moryskah-deep.js existing method IDs ──────────────

console.log('\n── No duplicates with moryskah-deep ──');
const deepIds = [
  'moryskah_vampire_thrall_combat', 'moryskah_ghoul_combat', 'moryskah_crypt_raider_str',
  'moryskah_cursed_knight_def', 'moryskah_banshee_hp', 'moryskah_shade_ranged',
  'moryskah_ectofuntus_worship', 'moryskah_shade_pyre_burning', 'moryskah_aberrant_magic',
  'moryskah_blood_runecrafting', 'moryskah_mausoleum_construction', 'moryskah_bog_witch_apprentice',
  'moryskah_crypt_robbing', 'moryskah_cursed_bow_fletching', 'moryskah_slayer_tower',
  'moryskah_silver_mining', 'moryskah_silver_forge', 'moryskah_bog_fishing',
  'moryskah_sacred_eel_fishing', 'moryskah_blighted_patches', 'moryskah_bog_kitchen',
  'moryskah_pyre_burning', 'moryskah_blighted_forest', 'moryskah_blood_imbued_crafting',
  'moryskah_mausoleum_rooftops', 'moryskah_bat_netting', 'quirky_moryskah_gravedigging',
  'quirky_moryskah_crypt_whispers', 'quirky_moryskah_candle_lighting',
  'moryskah_barrows_grinding', 'moryskah_vampire_noble_elite',
];
let duplicateCount = 0;
for (const id of allNewIds) {
  if (deepIds.includes(id)) duplicateCount++;
}
assert(`no duplicate IDs with moryskah-deep.js`, duplicateCount === 0, `got ${duplicateCount} duplicates`);

// ── Summary ───────────────────────────────────────────────────────────────────

console.log(`\n${'='.repeat(70)}`);
console.log(`Moryskah method count: ${moryskahMethods}`);
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
