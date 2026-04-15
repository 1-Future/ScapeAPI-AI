#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// Smoke test for the minigames registry (burn-v2/minigames-mega).
//
// Verifies:
//   - 30+ new minigames registered via rel.defineMinigame
//   - All 16 BYOS templates covered
//   - All 9 regions have at least one minigame
//   - Each minigame carries a unique_reward (Manifesto P04)
//   - Each minigame has valid stages OR rooms when multi-phase
//   - Required fields present on every entry
//   - PvP / PvE split is sensible
//   - Duration estimates set where needed
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const rel = require('../src/data/relationships');

// Load both the base and mega minigames
require('../src/content/aelgard/minigames');
require('../src/content/aelgard/minigames-mega');

let passed = 0;
let failed = 0;
const failures = [];

function assert(label, cond, extra) {
  if (cond) {
    passed++;
    console.log(`  PASS  ${label}`);
  } else {
    failed++;
    failures.push(label + (extra ? ' — ' + extra : ''));
    console.log(`  FAIL  ${label}${extra ? ' — ' + extra : ''}`);
  }
}

console.log('══════════════════════════════════════════════════════════════');
console.log('  MINIGAMES MEGA — SMOKE TESTS');
console.log('══════════════════════════════════════════════════════════════');

const all = rel.listMinigames();
console.log('');
console.log(`  total minigames registered: ${all.length}`);
console.log('');

// ── Assertion 1: total count ──────────────────────────────────────────────────
assert('01 at least 30 new minigames added (total >= 36)', all.length >= 36, `actual=${all.length}`);

// ── Assertion 2: rel exposes defineMinigame ──────────────────────────────────
assert('02 rel.defineMinigame exists',  typeof rel.defineMinigame  === 'function');
assert('03 rel.listMinigames exists',   typeof rel.listMinigames   === 'function');
assert('04 rel.getMinigame   exists',   typeof rel.getMinigame     === 'function');

// ── Assertion 3: every minigame has required fields ──────────────────────────
const requiredFields = ['id', 'name', 'region', 'minPlayers', 'maxPlayers', 'isPvP', 'description'];
let missingField = null;
for (const mg of all) {
  for (const f of requiredFields) {
    if (mg[f] === undefined || mg[f] === null || mg[f] === '') {
      // skills_trained/rewards are allowed empty arrays — covered below
      if (f !== 'description' || !mg[f]) {
        missingField = { id: mg.id, field: f };
        break;
      }
    }
  }
  if (missingField) break;
}
assert('05 every minigame has required fields', missingField === null,
  missingField ? `${missingField.id} missing ${missingField.field}` : '');

// ── Assertion 4: every minigame has skills_trained array ─────────────────────
const badSkills = all.find(mg => !Array.isArray(mg.skills_trained));
assert('06 every minigame has skills_trained array', !badSkills,
  badSkills ? `${badSkills.id} has non-array skills_trained` : '');

// ── Assertion 5: every minigame has rewards array ────────────────────────────
const badRewards = all.find(mg => !Array.isArray(mg.rewards) || mg.rewards.length === 0);
assert('07 every minigame has at least one reward', !badRewards,
  badRewards ? `${badRewards.id} rewards=${JSON.stringify(badRewards.rewards)}` : '');

// ── Assertion 6: every mega minigame has unique_reward (P04) ────────────────
// Mega files define unique_reward. Base minigames may not.
const megaIds = [
  'harvest_festival_hustle', 'heartlands_taverna_gambit', 'heartlands_estate_stewardship',
  'sootworks_cinder_parkour', 'sootworks_deep_shaft', 'sootworks_steam_titan',
  'veilwood_poacher_rounds', 'veilwood_temple_trek', 'veilwood_tears_of_the_grove',
  'saltbrine_tide_trawl', 'saltbrine_gale_crew', 'saltbrine_courier_run',
  'boneyard_pyramid_plunder', 'boneyard_sandstorm_arena', 'boneyard_tomb_creep',
  'moryskah_burgh_ramble', 'moryskah_vyre_vigil', 'moryskah_reliquary_defence',
  'glass_desert_shardforge', 'glass_desert_mirage_zone', 'glass_desert_glass_pit',
  'glass_desert_mage_trial_spire',
  'inkweald_dream_duelling', 'inkweald_ensouled_lattice', 'inkweald_whisperstep',
  'wilds_shard_wars', 'wilds_fortress_siege', 'wilds_clan_wars_roles', 'wilds_prop_hunt',
  'aelgard_travelling_market', 'aelgard_sigil_stories',
  'veilwood_canopy_kitchen', 'boneyard_rogue_warrens', 'heartlands_hayfield_duels',
];
assert('08 mega file registers 30+ minigames', megaIds.length >= 30, `count=${megaIds.length}`);

let missingUnique = null;
for (const id of megaIds) {
  const mg = rel.getMinigame(id);
  if (!mg) { missingUnique = { id, reason: 'not_found' }; break; }
  if (!mg.unique_reward) { missingUnique = { id, reason: 'no_unique_reward' }; break; }
}
assert('09 every mega minigame has a unique_reward', missingUnique === null,
  missingUnique ? `${missingUnique.id} — ${missingUnique.reason}` : '');

// ── Assertion 7: each mega minigame has stages OR rooms OR is single-phase ──
let badPhase = null;
for (const id of megaIds) {
  const mg = rel.getMinigame(id);
  if (!mg) continue;
  const hasStages = Array.isArray(mg.stages) && mg.stages.length > 0;
  const hasRooms  = Array.isArray(mg.rooms)  && mg.rooms.length > 0;
  // Allow a minigame to be single-phase (explicitly empty both) — but prefer at least one
  if (!hasStages && !hasRooms) {
    // Only fail if template implies multi-phase
    if (['tower_climbing', 'skilling_boss', 'gather_craft_fight', 'obstacle_course',
         'wave_survival', 'escort_protect', 'objective_defence', 'stealth',
         'board_game', 'delivery'].includes(mg.template)) {
      badPhase = { id, template: mg.template };
      break;
    }
  }
}
assert('10 multi-phase templates define stages or rooms', badPhase === null,
  badPhase ? `${badPhase.id} (${badPhase.template}) — neither stages nor rooms` : '');

// ── Assertion 8: reward_currency present when shop present ──────────────────
let badCurrency = null;
for (const mg of all) {
  if (Array.isArray(mg.shop) && mg.shop.length > 0 && !mg.reward_currency) {
    badCurrency = mg.id;
    break;
  }
}
assert('11 shops require a reward_currency', badCurrency === null,
  badCurrency ? `${badCurrency} has shop but no reward_currency` : '');

// ── Assertion 9: all 16 BYOS templates are covered ──────────────────────────
const BYOS_TEMPLATES = [
  'wave_survival', 'capture_the_flag', 'battle_royale', 'objective_defence',
  'duel_1v1', 'role_based_team', 'gather_craft_fight', 'obstacle_course',
  'timed_collection', 'passive_management', 'escort_protect', 'skilling_boss',
  'tower_climbing', 'board_game', 'stealth', 'delivery',
];
for (const tpl of BYOS_TEMPLATES) {
  const count = all.filter(mg => mg.template === tpl).length;
  assert(`12.${tpl} covered (>=1)`, count >= 1, `count=${count}`);
}

// ── Assertion 10: all 9 regions have at least one minigame ──────────────────
const REGIONS = [
  'Heartlands', 'Sootworks', 'Veilwood', 'Saltbrine',
  'Boneyard', 'Moryskah', 'Glass Desert', 'Inkweald', 'Wilds',
];
for (const r of REGIONS) {
  const count = all.filter(mg => (mg.region || '').toLowerCase() === r.toLowerCase()).length;
  assert(`13.${r} has >= 1 minigame`, count >= 1, `count=${count}`);
}

// ── Assertion 11: endgame regions (Glass Desert) and Wilds have 4+ minigames ─
const glassCount = all.filter(mg => (mg.region || '').toLowerCase() === 'glass desert').length;
const wildsCount = all.filter(mg => (mg.region || '').toLowerCase() === 'wilds').length;
assert('14 Glass Desert has >= 4 minigames', glassCount >= 4, `count=${glassCount}`);
assert('15 Wilds has >= 4 minigames',         wildsCount >= 4, `count=${wildsCount}`);

// ── Assertion 12: unique IDs ────────────────────────────────────────────────
const ids = all.map(mg => mg.id);
const uniqueIds = new Set(ids);
assert('16 all minigame IDs are unique', ids.length === uniqueIds.size,
  `dup check: ${ids.length} vs ${uniqueIds.size}`);

// ── Assertion 13: minPlayers <= maxPlayers ──────────────────────────────────
const badPlayers = all.find(mg => mg.minPlayers > mg.maxPlayers);
assert('17 minPlayers <= maxPlayers everywhere', !badPlayers,
  badPlayers ? `${badPlayers.id}: ${badPlayers.minPlayers}/${badPlayers.maxPlayers}` : '');

// ── Assertion 14: attention field uses valid tier ───────────────────────────
const VALID_ATTENTION = ['Background', 'Multitask', 'Active', 'Max Focus'];
const badAttention = all.find(mg => mg.attention && !VALID_ATTENTION.includes(mg.attention));
assert('18 attention field uses valid tier', !badAttention,
  badAttention ? `${badAttention.id}: ${badAttention.attention}` : '');

// ── Assertion 15: isPvP is boolean ──────────────────────────────────────────
const badIsPvP = all.find(mg => typeof mg.isPvP !== 'boolean');
assert('19 isPvP is boolean on every entry', !badIsPvP,
  badIsPvP ? `${badIsPvP.id}: ${typeof badIsPvP.isPvP}` : '');

// ── Assertion 16: at least 3 PvP minigames ──────────────────────────────────
const pvpCount = all.filter(mg => mg.isPvP === true).length;
assert('20 at least 5 PvP minigames', pvpCount >= 5, `count=${pvpCount}`);

// ── Assertion 17: at least 20 PvE/non-PvP minigames ─────────────────────────
const pveCount = all.filter(mg => mg.isPvP === false).length;
assert('21 at least 20 non-PvP minigames', pveCount >= 20, `count=${pveCount}`);

// ── Assertion 18: attention spectrum covered ────────────────────────────────
for (const tier of VALID_ATTENTION) {
  const c = all.filter(mg => mg.attention === tier).length;
  assert(`22.${tier} attention represented`, c >= 1, `count=${c}`);
}

// ── Assertion 19: duration_estimate_min present on mega ─────────────────────
let missingDuration = null;
for (const id of megaIds) {
  const mg = rel.getMinigame(id);
  if (!mg) continue;
  if (!mg.duration_estimate_min || mg.duration_estimate_min <= 0) {
    missingDuration = id;
    break;
  }
}
assert('23 every mega minigame has duration_estimate_min', missingDuration === null,
  missingDuration ? missingDuration : '');

// ── Assertion 20: template coverage per mega minigame ───────────────────────
let missingTemplate = null;
for (const id of megaIds) {
  const mg = rel.getMinigame(id);
  if (!mg) continue;
  if (!mg.template || !BYOS_TEMPLATES.includes(mg.template)) {
    missingTemplate = { id, template: mg.template };
    break;
  }
}
assert('24 every mega minigame declares a valid BYOS template', missingTemplate === null,
  missingTemplate ? `${missingTemplate.id}: template=${missingTemplate.template}` : '');

// ── Assertion 21: by-region cross-check ─────────────────────────────────────
if (typeof rel.listMinigamesByRegion === 'function') {
  const heartCount = rel.listMinigamesByRegion('Heartlands').length;
  assert('25 listMinigamesByRegion(Heartlands) >= 3', heartCount >= 3, `count=${heartCount}`);
}

// ── Assertion 22: by-template cross-check ───────────────────────────────────
if (typeof rel.listMinigamesByTemplate === 'function') {
  const stealthCount = rel.listMinigamesByTemplate('stealth').length;
  assert('26 listMinigamesByTemplate(stealth) >= 2', stealthCount >= 2, `count=${stealthCount}`);
}

// ── Assertion 23: specific unique reward exists ─────────────────────────────
const plunder = rel.getMinigame('boneyard_pyramid_plunder');
assert('27 Pyramid Plunder registered', !!plunder, 'not found');
if (plunder) {
  assert('28 Pyramid Plunder has sceptre-related unique reward',
    /sceptre/i.test(plunder.unique_reward || ''),
    `unique_reward=${plunder.unique_reward}`);
}

// ── Assertion 24: Shard Wars unique reward is soul-shard ────────────────────
const shardWars = rel.getMinigame('wilds_shard_wars');
assert('29 Shard Wars has soul-shard unique reward',
  shardWars && /soul-shard/i.test(shardWars.unique_reward || ''),
  shardWars ? `unique=${shardWars.unique_reward}` : 'not found');

// ── Assertion 25: at least one template per attention tier ──────────────────
// (ensures we have variety across the full attention spectrum in mega content)
let bg = 0, mt = 0, ac = 0, mx = 0;
for (const id of megaIds) {
  const mg = rel.getMinigame(id);
  if (!mg) continue;
  if (mg.attention === 'Background') bg++;
  if (mg.attention === 'Multitask')  mt++;
  if (mg.attention === 'Active')     ac++;
  if (mg.attention === 'Max Focus')  mx++;
}
assert('30 mega content has Background tier',  bg >= 1, `bg=${bg}`);
assert('31 mega content has Multitask tier',   mt >= 1, `mt=${mt}`);
assert('32 mega content has Active tier',      ac >= 1, `ac=${ac}`);
assert('33 mega content has Max Focus tier',   mx >= 1, `mx=${mx}`);

// ── Assertion 26: voice_flavor present on every mega entry ──────────────────
let missingVoice = null;
for (const id of megaIds) {
  const mg = rel.getMinigame(id);
  if (!mg) continue;
  if (!mg.voice_flavor || typeof mg.voice_flavor !== 'string' || mg.voice_flavor.length < 5) {
    missingVoice = id; break;
  }
}
assert('34 every mega minigame has voice_flavor', missingVoice === null,
  missingVoice ? missingVoice : '');

// ── Assertion 27: rel.stats() reports the minigames count ───────────────────
const s = rel.stats();
assert('35 rel.stats().minigames matches registry',
  s.minigames === all.length,
  `stats=${s.minigames}, actual=${all.length}`);

console.log('');
console.log('══════════════════════════════════════════════════════════════');
console.log(`  RESULT: ${passed} passed, ${failed} failed`);
console.log('══════════════════════════════════════════════════════════════');

if (failed > 0) {
  console.log('');
  console.log('  Failures:');
  for (const f of failures) console.log('    - ' + f);
  process.exit(1);
}
process.exit(0);
