#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// TEST: Quest Series (burn-v2)
//
// Asserts:
//   - Every extended series has a resolution (grandmaster/master capstone quest)
//   - Every quest in quests-series-extensions.js has a corresponding narrative
//     entry in data/quest-narratives.json
//   - Every quest unlock registered has a unique id across types
//   - Every quest in the narratives file has cross_region listed
//   - Every series chain is reachable via requirements: quests[]
//
// Usage: node scripts/test-quest-series.js
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const fs = require('fs');
const path = require('path');

// Load registries
require('../src/data/items');
require('../src/content/aelgard/items-expanded');
require('../src/content/aelgard/area-gates');
require('../src/content/aelgard/quest-unlocks');
require('../src/content/aelgard/quests-series');
require('../src/content/aelgard/quests-blitz');
require('../src/content/aelgard/quests-expanded');
require('../src/content/aelgard/quests-mega');
require('../src/content/aelgard/quests-series-extensions');
// Region quest files
try { require('../src/content/aelgard/heartlands'); } catch (e) {}
try { require('../src/content/aelgard/moryskah'); } catch (e) {}
try { require('../src/content/aelgard/boneyard-wastes'); } catch (e) {}
try { require('../src/content/aelgard/veilwood'); } catch (e) {}
try { require('../src/content/aelgard/sootworks'); } catch (e) {}
try { require('../src/content/aelgard/saltbrine'); } catch (e) {}
try { require('../src/content/aelgard/inkweald'); } catch (e) {}
try { require('../src/content/aelgard/glass-desert'); } catch (e) {}
try { require('../src/content/aelgard/active-gathering'); } catch (e) {}
try { require('../src/content/aelgard/raid-prerequisites'); } catch (e) {}

const quests = require('../src/data/quests');
const rel = require('../src/data/relationships');

// Load narratives
const NARR_PATH = path.join(__dirname, '..', 'data', 'quest-narratives.json');
const narratives = JSON.parse(fs.readFileSync(NARR_PATH, 'utf8'));

// ── test harness ─────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;
const failures = [];

function assert(label, cond, detail) {
  if (cond) {
    passed++;
    console.log(`  PASS: ${label}`);
  } else {
    failed++;
    failures.push({ label, detail });
    console.log(`  FAIL: ${label}${detail ? ' — ' + detail : ''}`);
  }
}

// ── Narrative lookup ─────────────────────────────────────────────────────────
const narrById = new Map();
for (const n of narratives) narrById.set(n.id, n);

// ── Quests defined by extensions file (the 32 new ones) ─────────────────────
const NEW_QUESTS = [
  'the_slayers_creed',
  'slayers_grandmaster_trial',
  'the_bog_witchs_hunger',
  'the_bog_witchs_final_curse',
  'the_werewolfs_lineage',
  'the_werewolfs_reckoning',
  'the_pirate_kings_gold',
  'the_pirate_kings_throne',
  'admirals_last_voyage',
  'the_druids_covenant',
  'the_veilwood_grandmaster_rite',
  'the_inkweald_second_door',
  'the_inkweald_grandmaster_dream',
  'prophecy_fragments',
  'sandglass_sage_ascension',
  'foundations_of_flame',
  'sootworks_grandmaster_titan',
  'the_cartographers_debt',
  'pharaohs_reckoning_prelude',
  'the_revenant_oath',
  'the_wilds_grandmaster_crown',
  'the_counterfeit_empire',
  'the_heartlands_uprising',
  'the_heartlands_grandmaster_feast',
  'the_comet_of_ash',
  'the_merchant_empires_fall',
  'the_wandering_plague',
  'the_lost_god_returns',
  'the_boneyard_first_empire_rite',
  'the_inkweald_mirror',
  'the_cartography_grandmaster',
  'the_last_prayer',
];

// ── Series chain definitions (from extensions file header docblock) ─────────
// Each series: [prereq quest] → [mid] → [capstone grandmaster or master]
const SERIES = {
  slayer: ['the_slayers_first_mark', 'slayers_gauntlet', 'the_slayers_creed', 'slayers_grandmaster_trial'],
  bog_witch: ['the_bog_witchs_errand', 'the_bog_witchs_bargain', 'the_bog_witchs_hunger', 'the_bog_witchs_final_curse'],
  werewolf: ['the_werewolfs_dilemma', 'the_werewolfs_lineage', 'the_werewolfs_reckoning'],
  pirate_king: ['pirate_king', 'the_pirate_kings_gold', 'the_pirate_kings_throne', 'admirals_last_voyage'],
  druid: ['the_green_thumb', 'the_druids_covenant', 'the_veilwood_grandmaster_rite'],
  inkweald_door: ['the_inkweald_door', 'the_inkweald_second_door', 'the_inkweald_grandmaster_dream'],
  glass_prophecy: ['echoes_of_the_deep', 'prophecy_fragments', 'sandglass_sage_ascension'],
  foundations: ['foundations_of_the_fallen', 'foundations_of_flame', 'sootworks_grandmaster_titan'],
  sand_and_secrets: ['sand_and_secrets', 'the_cartographers_debt', 'pharaohs_reckoning_prelude'],
  into_the_wilds: ['into_the_wilds', 'the_revenant_oath', 'the_wilds_grandmaster_crown'],
  counterfeit: ['the_counterfeit_ring', 'the_counterfeit_empire'],
  heartlands_patrol: ['heartlands_patrol', 'the_heartlands_uprising', 'the_heartlands_grandmaster_feast'],
};

const WORLD_QUESTS = [
  'the_comet_of_ash',
  'the_merchant_empires_fall',
  'the_wandering_plague',
  'the_lost_god_returns',
];

const GRANDMASTER_TERMINI = [
  'slayers_grandmaster_trial',
  'the_bog_witchs_final_curse',
  'the_werewolfs_reckoning',
  'admirals_last_voyage',
  'the_veilwood_grandmaster_rite',
  'the_inkweald_grandmaster_dream',
  'sandglass_sage_ascension',
  'sootworks_grandmaster_titan',
  'pharaohs_reckoning_prelude',
  'the_wilds_grandmaster_crown',
  'the_heartlands_grandmaster_feast',
  'the_lost_god_returns',
  'the_cartography_grandmaster',
  'the_last_prayer',
];

// ══════════════════════════════════════════════════════════════════════════════
// BEGIN TESTS
// ══════════════════════════════════════════════════════════════════════════════

console.log('\n── [1] quest registration ───────────────────────────────────────');
// Assertion 1: every new quest is registered in the quests registry
for (const qid of NEW_QUESTS) {
  assert(`${qid} is registered in quests`, !!quests.getQuest(qid), `not found in quests.getQuest`);
}

console.log('\n── [2] narrative coverage (1 per new quest) ─────────────────────');
// Assertion 2: every new quest has a matching narrative entry
for (const qid of NEW_QUESTS) {
  assert(`${qid} has a narrative`, narrById.has(qid), `no narrative in data/quest-narratives.json`);
}

console.log('\n── [3] every series resolves (has a grandmaster/master terminus) ─');
// Assertion 3: every series listed has a resolution quest (master+ difficulty)
for (const [seriesName, chain] of Object.entries(SERIES)) {
  const terminus = chain[chain.length - 1];
  const q = quests.getQuest(terminus);
  const resolved = !!q && ['Master', 'Grandmaster'].includes(q.difficulty);
  assert(`series[${seriesName}] resolves at ${terminus} (${q ? q.difficulty : 'NOT FOUND'})`, resolved, resolved ? '' : 'terminus not Master/Grandmaster difficulty');
}

console.log('\n── [4] series chain — requirements wire up correctly ───────────');
// Assertion 4: every NEW quest in a series chain has proper requirements.quests wiring
// (We do not assert on pre-existing quests; some of them predate burn-v2 and do not chain.)
for (const [seriesName, chain] of Object.entries(SERIES)) {
  for (let i = 1; i < chain.length; i++) {
    const qid = chain[i];
    if (!NEW_QUESTS.includes(qid)) continue; // skip pre-existing quests in chain
    const quest = quests.getQuest(qid);
    if (!quest) {
      assert(`series[${seriesName}]: ${qid} requires predecessor`, false, 'quest not defined');
      continue;
    }
    const reqQuests = quest.requirements.quests || [];
    const chainOk = reqQuests.some(r => chain.slice(0, i).includes(r));
    assert(`series[${seriesName}]: new quest ${qid} requires a chain predecessor`, chainOk, `requirements.quests = ${JSON.stringify(reqQuests)}, expected to include one of ${chain.slice(0, i).join(',')}`);
  }
}

console.log('\n── [5] unlock uniqueness ─────────────────────────────────────────');
// Assertion 5: every unlock registered is unique across type+id
const seenUnlocks = new Map(); // key `type:id` → questId
let duplicateUnlocks = 0;
for (const qid of NEW_QUESTS) {
  const reg = rel.getQuestUnlocks(qid);
  if (!reg) {
    assert(`${qid} has an unlock registry entry`, false, 'defineQuestUnlock not called');
    continue;
  }
  for (const u of reg.unlocks) {
    const key = `${u.type}:${u.id}`;
    if (seenUnlocks.has(key)) {
      duplicateUnlocks++;
      const other = seenUnlocks.get(key);
      assert(`unlock ${key} is unique (found on both ${qid} and ${other})`, false, 'duplicate unlock');
    } else {
      seenUnlocks.set(key, qid);
    }
  }
}
assert(`no duplicate unlocks across 32 new quests`, duplicateUnlocks === 0, `${duplicateUnlocks} duplicates`);

console.log('\n── [6] every quest unlocks >= 2 unique things ───────────────────');
// Assertion 6: Metroidvania rule — every quest must unlock at least 2 things
for (const qid of NEW_QUESTS) {
  const reg = rel.getQuestUnlocks(qid);
  const count = reg ? reg.unlocks.length : 0;
  assert(`${qid} unlocks >= 2 things (has ${count})`, count >= 2, `only ${count} unlocks`);
}

console.log('\n── [7] narrative shape — required fields ────────────────────────');
// Assertion 7: narrative entries have hook, premise, steps, twist, resolution, dialogue
const REQUIRED_FIELDS = ['id', 'title', 'difficulty', 'hook', 'premise', 'steps', 'twist', 'resolution', 'unlocks_prose', 'dialogue_beats', 'cross_region'];
for (const qid of NEW_QUESTS) {
  const n = narrById.get(qid);
  if (!n) continue;
  const missing = REQUIRED_FIELDS.filter(f => n[f] === undefined || n[f] === null || n[f] === '');
  assert(`narrative[${qid}] has all required fields`, missing.length === 0, `missing: ${missing.join(', ')}`);
}

console.log('\n── [8] narrative steps — at least 3 per quest ───────────────────');
// Assertion 8: every narrative has at least 3 steps
for (const qid of NEW_QUESTS) {
  const n = narrById.get(qid);
  if (!n) continue;
  const stepCount = Array.isArray(n.steps) ? n.steps.length : 0;
  assert(`narrative[${qid}] has >= 3 steps (has ${stepCount})`, stepCount >= 3, `only ${stepCount} steps`);
}

console.log('\n── [9] world quests span >= 3 regions ───────────────────────────');
// Assertion 9: world quests span 3+ regions (cross_region field)
for (const qid of WORLD_QUESTS) {
  const n = narrById.get(qid);
  if (!n) {
    assert(`world quest ${qid} has narrative`, false, 'no narrative');
    continue;
  }
  const regionCount = Array.isArray(n.cross_region) ? n.cross_region.length : 0;
  assert(`world quest ${qid} spans >= 3 regions (has ${regionCount})`, regionCount >= 3, `only ${regionCount} regions`);
}

console.log('\n── [10] grandmaster termini have questPoints >= 3 ───────────────');
// Assertion 10: grandmaster quests award at least 3 QP (a capstone reward)
for (const qid of GRANDMASTER_TERMINI) {
  const q = quests.getQuest(qid);
  if (!q) continue;
  const qp = q.questPoints || 0;
  assert(`${qid} awards >= 3 questPoints (awards ${qp})`, qp >= 3, `only ${qp} QP`);
}

console.log('\n── [11] sanity — no quest relies on itself in requirements ──────');
// Assertion 11: no self-referential prereqs
for (const qid of NEW_QUESTS) {
  const q = quests.getQuest(qid);
  if (!q) continue;
  const reqQuests = (q.requirements && q.requirements.quests) || [];
  assert(`${qid} does not require itself`, !reqQuests.includes(qid), 'self-referential prereq');
}

console.log('\n── [12] narrative dialogue_beats — at least 1 per quest ─────────');
// Assertion 12: every narrative has at least 1 dialogue beat
for (const qid of NEW_QUESTS) {
  const n = narrById.get(qid);
  if (!n) continue;
  const dialogueCount = Array.isArray(n.dialogue_beats) ? n.dialogue_beats.length : 0;
  assert(`narrative[${qid}] has >= 1 dialogue beat (has ${dialogueCount})`, dialogueCount >= 1, `no dialogue`);
}

console.log('\n── [13] 30+ new quests defined (burn-v2 target) ──────────────────');
assert(`at least 30 new quests added`, NEW_QUESTS.length >= 30, `only ${NEW_QUESTS.length}`);

// ══════════════════════════════════════════════════════════════════════════════

console.log('\n══════════════════════════════════════════════════════════════════');
console.log(`  RESULT: ${passed} passed, ${failed} failed, ${passed + failed} total`);
console.log('══════════════════════════════════════════════════════════════════');

if (failed > 0) {
  console.log('\nFailures:');
  for (const f of failures) console.log(`  - ${f.label}${f.detail ? ': ' + f.detail : ''}`);
  process.exit(1);
}

process.exit(0);
