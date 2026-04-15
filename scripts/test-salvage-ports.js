#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// Salvage-ports tests — Burn v2
//
// Verifies the modules salvaged from the old ScapeAPI fork are loadable and
// preserve the exact values/shapes the original inline tables had inside
// src/commands/all.js. These tests intentionally hard-pin numeric values so a
// future refactor that silently changes a level requirement, XP value, or
// reward coin amount will fail loudly.
//
// Covered modules:
//   src/data/seed-data.js
//   src/data/bone-xp.js
//   src/data/rc-altars.js
//   src/data/house-rooms.js
//   src/data/boss-info.js
//   src/data/achievements.js
//   src/world/map-gutter.js
//   src/combat/combat-legacy.js
//
// Run: node scripts/test-salvage-ports.js
// Exit 0 on all-pass, exit 1 on any failure.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const path = require('path');
const ROOT = path.join(__dirname, '..');

let passed = 0;
let failed = 0;
const failures = [];

function assert(label, cond, detail) {
  if (cond) {
    passed++;
    console.log(`  PASS  ${label}`);
  } else {
    failed++;
    const line = `  FAIL  ${label}${detail ? ' — ' + detail : ''}`;
    console.log(line);
    failures.push(line);
  }
}

function near(a, b, eps = 1e-6) {
  return Math.abs(a - b) <= eps;
}

// ── 1. seed-data ────────────────────────────────────────────────────────────
console.log('\n=== seed-data ===');
const seed = require(path.join(ROOT, 'src/data/seed-data'));
assert('guam seed level is 9', seed.SEED_DATA[600].level === 9);
assert('ranarr seed xp is 26.5', near(seed.SEED_DATA[602].xp, 26.5));
assert('marrentill has 4 stages', seed.SEED_DATA[601].stages === 4);
assert('get(600) returns guam row', seed.get(600) && seed.get(600).herbName === 'Grimy guam');
assert('get(999) returns null for unknown', seed.get(999) === null);
assert('has(601) is true', seed.has(601) === true);
assert('list() yields 3 entries', seed.list().length === 3);
assert('levelFor(602) is 32', seed.levelFor(602) === 32);

// ── 2. bone-xp ──────────────────────────────────────────────────────────────
console.log('\n=== bone-xp ===');
const boneXp = require(path.join(ROOT, 'src/data/bone-xp'));
assert('regular bones give 4.5 xp', near(boneXp.BONE_XP[100], 4.5));
assert('big bones give 15 xp', near(boneXp.BONE_XP[106], 15));
assert('dragon bones give 72 xp', near(boneXp.BONE_XP[107], 72));
assert('unknown bone id falls back to 4.5', near(boneXp.getXp(999), 4.5));
assert('getXp(107) returns 72', near(boneXp.getXp(107), 72));

// ── 3. rc-altars ────────────────────────────────────────────────────────────
console.log('\n=== rc-altars ===');
const rc = require(path.join(ROOT, 'src/data/rc-altars'));
assert('air altar level 1', rc.RC_ALTARS.air_altar.level === 1);
assert('fire altar gives 7 xp', near(rc.RC_ALTARS.fire_altar.xp, 7));
assert('runesPerEssence(air, 1) === 1', rc.runesPerEssence('air_altar', 1) === 1);
assert('runesPerEssence(air, 11) === 2', rc.runesPerEssence('air_altar', 11) === 2);
assert('runesPerEssence(air, 99) === 10', rc.runesPerEssence('air_altar', 99) === 10);
assert('runesPerEssence(water, 4) returns 0 (below level)', rc.runesPerEssence('water_altar', 4) === 0);
assert('runesPerEssence(bogus, 50) returns 0', rc.runesPerEssence('does_not_exist', 50) === 0);
assert('list() yields 4 altars', rc.list().length === 4);

// ── 4. house-rooms ──────────────────────────────────────────────────────────
console.log('\n=== house-rooms ===');
const rooms = require(path.join(ROOT, 'src/data/house-rooms'));
assert('parlour level 1, 3 planks', rooms.HOUSE_ROOMS.parlour.level === 1 && rooms.HOUSE_ROOMS.parlour.planks === 3);
assert('chapel requires level 20', rooms.HOUSE_ROOMS.chapel.level === 20);
assert('workshop has tool_rack furniture', !!rooms.HOUSE_ROOMS.workshop.furniture.tool_rack);
assert('bed gives 117 construction xp', rooms.HOUSE_ROOMS.bedroom.furniture.bed.xp === 117);
assert('getRoom(bogus) returns null', rooms.getRoom('nonsense') === null);
assert('list() yields 5 rooms', rooms.list().length === 5);

// ── 5. boss-info ────────────────────────────────────────────────────────────
console.log('\n=== boss-info ===');
const bosses = require(path.join(ROOT, 'src/data/boss-info'));
assert('KBD combat 276', bosses.BOSS_INFO['king black dragon'].combat === 276);
assert('Giant Mole hp 200', bosses.BOSS_INFO['giant mole'].hp === 200);
assert('Barrows uses string hp', typeof bosses.BOSS_INFO.barrows.hp === 'string');
assert('get("Giant Mole") is case-insensitive', !!bosses.get('Giant Mole'));
assert('get(null) returns null', bosses.get(null) === null);

// ── 6. achievements ─────────────────────────────────────────────────────────
console.log('\n=== achievements ===');
const ach = require(path.join(ROOT, 'src/data/achievements'));
assert('exactly 32 achievements (matches old/new parity)', ach.count() === 32);
assert('first_blood rewards 500 coins', ach.ACHIEVEMENTS.first_blood.reward.coins === 500);
assert('millionaire goal is 1_000_000', ach.ACHIEVEMENTS.millionaire.goal === 1000000);
assert('max_combat type is combat_level', ach.ACHIEVEMENTS.max_combat.type === 'combat_level');
assert('dragon_slayer_ach targets green dragon', ach.ACHIEVEMENTS.dragon_slayer_ach.target === 'green dragon');
assert('small lamp id is 950', ach.lampIdFor('small') === 950);
assert('medium lamp id is 951', ach.lampIdFor('medium') === 951);
assert('large lamp id is 952', ach.lampIdFor('large') === 952);
assert('unknown lamp tier falls back to large', ach.lampIdFor('xyzzy') === 952);
assert('lampNameFor(large) labels correctly', ach.lampNameFor('large') === 'XP lamp (large)');

// ── 7. map-gutter ───────────────────────────────────────────────────────────
console.log('\n=== map-gutter ===');
const gutter = require(path.join(ROOT, 'src/world/map-gutter'));
{
  // 3x3 map (rx=1, ry=1): "...\n.@.\n..."
  const grid = '...\n.@.\n...';
  const out = gutter.applyGutter(grid, 1, 1);
  const lines = out.split('\n');
  assert('gutter produces 4 rows (header + 3)', lines.length === 4);
  assert('header marks player column with v', lines[0].includes('v'));
  assert('middle row uses > prefix', lines[2].startsWith(' > '));
  assert('non-center rows use plain prefix', lines[1].startsWith('   '));
  assert('columnHeader(2) length is 4 + 5', gutter.columnHeader(2).length === 9);
  assert('rowPrefix(0) uses > ', gutter.rowPrefix(0) === ' > ');
  assert('rowPrefix(-1) uses spaces', gutter.rowPrefix(-1) === '   ');
}

// ── 8. combat-legacy ────────────────────────────────────────────────────────
console.log('\n=== combat-legacy ===');
const legacy = require(path.join(ROOT, 'src/combat/combat-legacy'));
// Known-value checks: level 40 str, no pot, no prayer, style +3, str bonus 50
{
  const effStr = legacy.legacyEffectiveLevel(40, 0, 1.0, 3); // floor((40+0+3+8)*1) = 51
  assert('legacyEffectiveLevel(40, 0, 1.0, 3) === 51', effStr === 51);
  const maxHit = legacy.legacyMaxHitMelee(51, 50); // floor(0.5 + 51*(50+64)/640) = floor(0.5 + 51*114/640) = floor(9.58) = 9
  assert('legacyMaxHitMelee with str bonus 50 is 9', maxHit === 9);
  const atkRoll = legacy.legacyAttackRoll(51, 50); // 51 * 114 = 5814
  assert('legacyAttackRoll(51, 50) === 5814', atkRoll === 5814);
  const defRoll = legacy.legacyNpcDefenceRoll(30, 10); // (30+9) * 74 = 2886
  assert('legacyNpcDefenceRoll(30, 10) === 2886', defRoll === 2886);
  // Hit chance when atk > def
  const hc = legacy.legacyAccuracy(5814, 2886);
  assert('legacyAccuracy returns >0.5 when atk>def', hc > 0.5);
  // Hit chance when atk <= def
  const hc2 = legacy.legacyAccuracy(2000, 5000);
  assert('legacyAccuracy returns <0.5 when atk<def', hc2 < 0.5);
  // Snapshot wrapper
  const snap = legacy.legacyMeleeSnapshot(
    { atkLevel: 60, strLevel: 60, atkBonus: 40, strBonus: 50 },
    { defLevel: 30, defBonus: 10 },
    3
  );
  assert('snapshot has maxHit number', typeof snap.maxHit === 'number');
  assert('snapshot has hitChance in [0,1]', snap.hitChance >= 0 && snap.hitChance <= 1);
}

// ── Summary ─────────────────────────────────────────────────────────────────
console.log('\n' + '═'.repeat(60));
console.log(`  Passed: ${passed}`);
console.log(`  Failed: ${failed}`);
console.log('═'.repeat(60));
if (failed) {
  console.log('\nFailures:');
  for (const f of failures) console.log(f);
  process.exit(1);
}
process.exit(0);
