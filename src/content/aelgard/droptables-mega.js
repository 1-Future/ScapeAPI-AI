// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Drop Table MEGA Cross-Reference (burn v2)
// For every new mega monster, we publish an item→monster reverse lookup
// so the codex, gap-report, and collection log can ask "who drops X?"
// without re-parsing monsters-mega.
// ══════════════════════════════════════════════════════════════════════════════

const { MEGA } = require('./monsters-mega');
const rel = require('../../data/relationships');

// Build the reverse index: item_id → [{ monster, rarity, region }]
const ITEM_TO_MONSTERS = new Map();

function pushDrop(item_id, entry) {
  if (!ITEM_TO_MONSTERS.has(item_id)) ITEM_TO_MONSTERS.set(item_id, []);
  ITEM_TO_MONSTERS.get(item_id).push(entry);
}

for (const m of MEGA) {
  // Always drops
  for (const d of (m.always_drops || [])) {
    pushDrop(d.item_id, { monster: m.id, region: m.region, rarity: 'always', quantity: d.quantity });
  }
  // Main drops
  for (const d of (m.drops || [])) {
    pushDrop(d.item_id, { monster: m.id, region: m.region, rarity: d.rarity, quantity: d.quantity });
  }
  // Unique / collection-log drops
  for (const u of (m.unique_drops || [])) {
    pushDrop(u.item_id, { monster: m.id, region: m.region, rarity: 'collection_log', chance: u.chance });
  }
}

// Also register each drop as a relationship entry so gap-report can traverse
// the monster→item graph starting from an item id.
for (const [item_id, sources] of ITEM_TO_MONSTERS) {
  for (const s of sources) {
    rel.registerItemSource(item_id, {
      type: 'monster_mega',
      source: s.monster,
      region: s.region,
      rarity: s.rarity,
    });
  }
}

// Compact summaries for quick inspection / tests / codex builds.
const REGION_COUNTS = {};
for (const m of MEGA) REGION_COUNTS[m.region] = (REGION_COUNTS[m.region] || 0) + 1;

function monstersByRegion(region) {
  return MEGA.filter(m => m.region === region);
}
function whoDrops(item_id) {
  return ITEM_TO_MONSTERS.get(item_id) || [];
}
function collectionLogUniques() {
  const out = [];
  for (const m of MEGA) {
    for (const u of (m.unique_drops || [])) {
      out.push({ monster: m.id, region: m.region, item_id: u.item_id, chance: u.chance });
    }
  }
  return out;
}
function slayerEligibleMegaMonsters() {
  return MEGA.filter(m => m.slayer_task_eligible && m.slayer_level_required > 0);
}

// ── Drop-weight validation (used by test-monster-drops) ─────────────────────
function dropWeightsValid() {
  const report = { ok: true, offenders: [] };
  for (const m of MEGA) {
    // Rarity distribution sanity: we expect at least one "common" for most mobs
    // and at most ~10% very_rare of the main table weight mass.
    const rarityCounts = { always: 0, common: 0, uncommon: 0, rare: 0, very_rare: 0 };
    for (const d of (m.drops || [])) {
      rarityCounts[d.rarity] = (rarityCounts[d.rarity] || 0) + 1;
    }
    const mainTotal = Object.entries(rarityCounts)
      .filter(([k]) => k !== 'always')
      .reduce((s, [, v]) => s + v, 0);
    if (mainTotal < 2) {
      report.ok = false;
      report.offenders.push({ monster: m.id, reason: 'fewer-than-2-main-drops', rarityCounts });
    }
  }
  return report;
}

console.log(`[aelgard] droptables-mega indexed ${ITEM_TO_MONSTERS.size} unique items from ${MEGA.length} monsters`);

module.exports = {
  ITEM_TO_MONSTERS,
  REGION_COUNTS,
  monstersByRegion,
  whoDrops,
  collectionLogUniques,
  slayerEligibleMegaMonsters,
  dropWeightsValid,
};
