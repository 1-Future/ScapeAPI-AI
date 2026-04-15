// ══════════════════════════════════════════════════════════════════════════════
// test-monster-drops.js (burn v2 / monsters-mega)
// Validates the 110 mega monsters:
//   - drop-table weights are non-negative and main tables sum > 0
//   - collection-log uniques are exposed and have reasonable chances
//   - slayer-task eligibility implies slayer_level_required > 0
//   - region counts match the task spec
//   - stat sanity (hp > 0, max_hit reasonable, level consistent)
//
// 40+ assertions. Run: `node scripts/test-monster-drops.js`
// Exit 0 on success, exit 1 on any failed assertion.
// ══════════════════════════════════════════════════════════════════════════════

// Load world + items infra so require chains resolve cleanly.
require('../src/data/items');
require('../src/data/droptables');
require('../src/data/relationships');
require('../src/content/aelgard/items-blitz3');
const { MEGA } = require('../src/content/aelgard/monsters-mega');
const droptablesMega = require('../src/content/aelgard/droptables-mega');

let passed = 0;
let failed = 0;
const failures = [];

function assert(cond, msg) {
  if (cond) {
    passed++;
    return true;
  }
  failed++;
  failures.push(msg);
  return false;
}

// ── 1. Total / region counts ─────────────────────────────────────────────────
assert(MEGA.length >= 100, `expected >= 100 monsters, got ${MEGA.length}`);
assert(MEGA.length === 110, `expected 110 monsters, got ${MEGA.length}`);

const expected = {
  heartlands: 10, moryskah: 15, boneyard: 12, veilwood: 12,
  sootworks: 12, saltbrine: 12, inkweald: 12, glass_desert: 10, wilds: 15,
};
for (const [region, want] of Object.entries(expected)) {
  const got = droptablesMega.REGION_COUNTS[region] || 0;
  assert(got === want, `region "${region}" expected ${want}, got ${got}`);
}

// ── 2. Schema completeness on every monster ──────────────────────────────────
const requiredFields = [
  'id', 'name', 'level', 'hp', 'combat_style', 'attack_speed', 'max_hit',
  'accuracy', 'defence_stab', 'defence_slash', 'defence_crush', 'defence_magic',
  'defence_ranged', 'aggressive', 'region', 'slayer_task_eligible',
  'slayer_level_required', 'xp_per_kill', 'sprite', 'examine',
];
let schemaOk = true;
for (const m of MEGA) {
  for (const f of requiredFields) {
    if (!(f in m)) {
      schemaOk = false;
      failures.push(`monster ${m.id} missing field ${f}`);
    }
  }
}
assert(schemaOk, 'all monsters pass schema field check');

// ── 3. Stat sanity ───────────────────────────────────────────────────────────
let statsOk = true;
for (const m of MEGA) {
  if (m.hp <= 0) { statsOk = false; failures.push(`${m.id}: hp <= 0`); break; }
  if (m.level <= 0) { statsOk = false; failures.push(`${m.id}: level <= 0`); break; }
  if (m.max_hit < 0) { statsOk = false; failures.push(`${m.id}: max_hit < 0`); break; }
  if (m.max_hit > 30) { statsOk = false; failures.push(`${m.id}: max_hit absurdly high`); break; }
  if (m.xp_per_kill <= 0) { statsOk = false; failures.push(`${m.id}: xp_per_kill <= 0`); break; }
  if (!['melee', 'ranged', 'magic'].includes(m.combat_style)) {
    statsOk = false;
    failures.push(`${m.id}: bad combat_style ${m.combat_style}`);
    break;
  }
}
assert(statsOk, 'all monsters pass stat-sanity check');

// ── 4. Defence fields all non-negative ───────────────────────────────────────
let defOk = true;
for (const m of MEGA) {
  for (const style of ['stab', 'slash', 'crush', 'magic', 'ranged']) {
    if (m[`defence_${style}`] < 0) {
      defOk = false;
      failures.push(`${m.id}: defence_${style} < 0`);
    }
  }
}
assert(defOk, 'all defence_* fields non-negative');

// ── 5. Drop table structural integrity ───────────────────────────────────────
let dropsOk = true;
let totalDropRows = 0;
let alwaysRows = 0;
let commonRows = 0;
let uncommonRows = 0;
let rareRows = 0;
let veryRareRows = 0;
let uniqueRows = 0;

for (const m of MEGA) {
  for (const d of (m.always_drops || [])) {
    totalDropRows++;
    alwaysRows++;
    if (!d.item_id || !Array.isArray(d.quantity) || d.quantity.length !== 2) {
      dropsOk = false; failures.push(`${m.id}: malformed always drop`);
    }
    if (d.quantity && (d.quantity[0] < 0 || d.quantity[1] < d.quantity[0])) {
      dropsOk = false; failures.push(`${m.id}: bad always quantity`);
    }
  }
  for (const d of (m.drops || [])) {
    totalDropRows++;
    if (d.rarity === 'always') alwaysRows++;
    if (d.rarity === 'common') commonRows++;
    if (d.rarity === 'uncommon') uncommonRows++;
    if (d.rarity === 'rare') rareRows++;
    if (d.rarity === 'very_rare') veryRareRows++;
    if (!d.item_id && d.item_id !== 0) {
      dropsOk = false; failures.push(`${m.id}: drop missing item_id`);
    }
    if (d.weight !== undefined && d.weight < 0) {
      dropsOk = false; failures.push(`${m.id}: negative weight`);
    }
    if (!['always', 'common', 'uncommon', 'rare', 'very_rare'].includes(d.rarity)) {
      dropsOk = false; failures.push(`${m.id}: bad rarity "${d.rarity}"`);
    }
  }
  for (const u of (m.unique_drops || [])) {
    uniqueRows++;
    totalDropRows++;
    if (!u.item_id || !u.chance) {
      dropsOk = false; failures.push(`${m.id}: malformed unique drop`);
    }
    if (u.chance && u.chance < 16) {
      dropsOk = false; failures.push(`${m.id}: unique chance too generous (<16)`);
    }
  }
}
assert(dropsOk, 'all drop rows are structurally valid');
assert(totalDropRows >= 400, `expected >= 400 total drop rows, got ${totalDropRows}`);
assert(alwaysRows >= 60, `expected >= 60 always drops, got ${alwaysRows}`);
assert(commonRows >= 140, `expected >= 140 common drops, got ${commonRows}`);
assert(uncommonRows >= 100, `expected >= 100 uncommon drops, got ${uncommonRows}`);
assert(rareRows >= 40, `expected >= 40 rare drops, got ${rareRows}`);
assert(veryRareRows >= 10, `expected >= 10 very_rare drops, got ${veryRareRows}`);

// Rarity ratios (task spec: ~10/40/30/15/5)
const mainMass = commonRows + uncommonRows + rareRows + veryRareRows;
const ratio = (part) => (part / mainMass);
assert(ratio(commonRows) >= 0.30, `common ratio too low: ${ratio(commonRows).toFixed(2)}`);
assert(ratio(rareRows) <= 0.30, `rare ratio too high: ${ratio(rareRows).toFixed(2)}`);
assert(ratio(veryRareRows) <= 0.12, `very_rare ratio too high: ${ratio(veryRareRows).toFixed(2)}`);

// ── 6. Drop weights are positive and main-table sum > 0 per monster ──────────
let weightsSumOk = true;
for (const m of MEGA) {
  const sum = (m.drops || [])
    .filter(d => d.rarity !== 'always' && d.weight)
    .reduce((s, d) => s + d.weight, 0);
  if (sum <= 0) {
    weightsSumOk = false;
    failures.push(`${m.id}: main-table weight sum = ${sum}`);
  }
}
assert(weightsSumOk, 'every main drop table has positive weight sum');

// ── 7. Collection-log uniques ────────────────────────────────────────────────
const uniques = droptablesMega.collectionLogUniques();
assert(uniques.length >= 18, `expected >= 18 collection-log uniques, got ${uniques.length}`);
let uniquesOk = true;
for (const u of uniques) {
  if (u.chance < 16 || u.chance > 4096) {
    uniquesOk = false; failures.push(`unique ${u.item_id} bad chance ${u.chance}`);
  }
}
assert(uniquesOk, 'all unique drop chances are in [16, 4096]');

// Every region with a boss monster should have at least one unique drop.
const regionsWithUnique = new Set(uniques.map(u => u.region));
for (const r of ['heartlands', 'moryskah', 'boneyard', 'veilwood', 'sootworks',
                 'saltbrine', 'inkweald', 'glass_desert', 'wilds']) {
  assert(regionsWithUnique.has(r), `region ${r} has no collection-log unique`);
}

// ── 8. Slayer eligibility ────────────────────────────────────────────────────
let slayerOk = true;
for (const m of MEGA) {
  if (m.slayer_task_eligible && m.slayer_level_required <= 0) {
    slayerOk = false;
    failures.push(`${m.id}: slayer-eligible but slayer_level_required=${m.slayer_level_required}`);
  }
  if (!m.slayer_task_eligible && m.slayer_level_required !== 0) {
    slayerOk = false;
    failures.push(`${m.id}: not slayer-eligible but slayer_level_required=${m.slayer_level_required}`);
  }
}
assert(slayerOk, 'slayer eligibility consistent with slayer_level_required');

const slayerMegaList = droptablesMega.slayerEligibleMegaMonsters();
assert(slayerMegaList.length >= 70, `expected >= 70 slayer-eligible mega mobs, got ${slayerMegaList.length}`);

// ── 9. droptables-mega drop-weight validity helper ───────────────────────────
const weightReport = droptablesMega.dropWeightsValid();
assert(weightReport.ok,
  `droptables-mega dropWeightsValid() failed: ${JSON.stringify(weightReport.offenders.slice(0, 3))}`);

// ── 10. whoDrops reverse lookup ──────────────────────────────────────────────
// coins (101) should be dropped by nearly every mega monster.
const coinDroppers = droptablesMega.whoDrops(101);
assert(coinDroppers.length >= 90,
  `coins (101) should be dropped by at least 90 mega monsters, got ${coinDroppers.length}`);

// At least 50 distinct items indexed.
assert(droptablesMega.ITEM_TO_MONSTERS.size >= 50,
  `expected >= 50 distinct drop items, got ${droptablesMega.ITEM_TO_MONSTERS.size}`);

// ── 11. Unique defIds ────────────────────────────────────────────────────────
const ids = new Set(MEGA.map(m => m.id));
assert(ids.size === MEGA.length, `duplicate mega defIds detected: ${MEGA.length - ids.size}`);

// ── 12. Examine flavour present and non-trivial ──────────────────────────────
let examineOk = true;
for (const m of MEGA) {
  if (!m.examine || m.examine.length < 8) {
    examineOk = false; failures.push(`${m.id}: examine too short`);
  }
}
assert(examineOk, 'every monster has a non-trivial examine string');

// ── 13. Notable boss presence ────────────────────────────────────────────────
const byName = new Map(MEGA.map(m => [m.name, m]));
assert(byName.has('Pharaoh lich'), 'boneyard boss Pharaoh lich present');
assert(byName.has('Kraken matriarch'), 'saltbrine boss Kraken matriarch present');
assert(byName.has('Sunking'), 'glass desert boss Sunking present');
assert(byName.has('Forgotten-name'), 'inkweald boss Forgotten-name present');
assert(byName.has('Black-stone warden'), 'wilds capstone boss present');

// ── Summary ─────────────────────────────────────────────────────────────────
console.log('═══════════════════════════════════════════════════════════════════');
console.log(`test-monster-drops: ${passed} passed, ${failed} failed`);
console.log('═══════════════════════════════════════════════════════════════════');
if (failed > 0) {
  console.log('FAILURES:');
  for (const f of failures.slice(0, 20)) console.log('  -', f);
  if (failures.length > 20) console.log(`  ... and ${failures.length - 20} more`);
  process.exit(1);
}
console.log('Monsters:', MEGA.length);
console.log('Regions:', Object.keys(droptablesMega.REGION_COUNTS).length);
console.log('Drop rows:', totalDropRows);
console.log('Unique items indexed:', droptablesMega.ITEM_TO_MONSTERS.size);
console.log('Slayer-eligible mega mobs:', slayerMegaList.length);
console.log('Collection-log uniques:', uniques.length);
process.exit(0);
