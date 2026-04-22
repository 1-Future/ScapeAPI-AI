// ══════════════════════════════════════════════════════════════════════════════
// scripts/rederive-effective-xp.js
//
// Re-derive effective-xp/hr (and effective-gp/hr) for intensity-catalog entries
// using the formula:
//
//   effective = base × (active_min / (active_min + travel_min))
//
// where travel_min = (travel_time_to_bank_seconds × 2 × trips_per_hour) / 60
// (round-trip, twice per banking trip).
//
// Source of travel + trips + gp_cost fields: data/methods/*.json, populated by
// scripts/annotate-methods-travel-tradeoff.js.
//
// This script:
//   1. Loads data/intensity-catalog.json
//   2. Loads the per-method annotations from data/methods/*.json, keyed by id.
//   3. Pipes travel + supplies fields onto every skill_method entry.
//   4. Writes effective_xp_per_hour and effective_gp_per_hour onto every
//      eligible entry.
//   5. Writes net_gp_per_hour and tradeoff_profile onto every eligible entry.
//   6. Emits reports/_effective_xp_rederive_log.json with a diff.
//
// Run this AFTER scripts/build-intensity-catalog.js (or as a follow-up inside
// that script — we wire it in).
//
// The formula is idempotent — running twice yields identical output.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const CATALOG_PATH = path.join(REPO_ROOT, 'data', 'intensity-catalog.json');
const METHODS_DIR = path.join(REPO_ROOT, 'data', 'methods');
const REPORTS_DIR = path.join(REPO_ROOT, 'reports');

function loadMethodAnnotations() {
  const byId = new Map();
  if (!fs.existsSync(METHODS_DIR)) return byId;
  for (const fname of fs.readdirSync(METHODS_DIR)) {
    if (!fname.endsWith('.json')) continue;
    let parsed;
    try { parsed = JSON.parse(fs.readFileSync(path.join(METHODS_DIR, fname), 'utf8')); }
    catch { continue; }
    for (const m of (parsed.methods || [])) {
      if (!m.id) continue;
      byId.set(m.id, {
        travel_time_to_bank_seconds: m.travel_time_to_bank_seconds ?? 0,
        nearest_teleport: m.nearest_teleport ?? null,
        banking_trip_cost: m.banking_trip_cost ?? { gp: 0, intensity: 0 },
        travel_region_multiplier: m.travel_region_multiplier ?? 0,
        travel_minutes_per_hour: m.travel_minutes_per_hour ?? 0,
        active_minutes_per_hour: m.active_minutes_per_hour ?? 60,
        trips_per_hour: m.trips_per_hour ?? 0,
        gp_cost_per_hour: m.gp_cost_per_hour ?? 0,
        net_gp_per_hour: m.net_gp_per_hour ?? 0,
        tradeoff_profile: m.tradeoff_profile ?? null,
        effective_xp_per_hour: m.effective_xp_per_hour ?? null,
        effective_gp_per_hour: m.effective_gp_per_hour ?? null,
      });
    }
  }
  return byId;
}

// Generic re-derivation when a method has no annotation in data/methods/*.json
// (e.g. catalog entries from mob(), training-methods.js, minigames).
// Use intensity-based defaults: intense methods are "near teleport" because
// raids/bosses always are; AFK/background skilling is mid-travel.
function defaultTravelFor(entry) {
  const intensity = entry.intensity || 1;
  const region = (entry.region || 'heartlands').toLowerCase();
  // Default travel seconds by intensity band. High-intensity = clustered
  // around teles + banks, so short. Low-intensity = field work, longer.
  const baseByIntensity = {
    1: 30, 2: 28, 3: 25, 4: 22, 5: 18, 6: 20, 7: 18, 8: 15, 9: 12, 10: 15,
  };
  let base = baseByIntensity[intensity] || 25;
  // Region multiplier (matches annotate-methods-travel-tradeoff.js).
  const regionMult = {
    heartlands: 0, saltbrine: 0, sootworks: 0.10, moryskah: 0.20,
    boneyard: 0.20, veilwood: 0.10, inkweald: 0.20, glass_desert: 0.50,
    wilds: 0.30,
  }[region] ?? 0.15;
  return Math.round(base * (1 + regionMult));
}

function defaultTripsFor(entry) {
  const intensity = entry.intensity || 1;
  const type = entry.activity_type || 'skill_method';
  if (type === 'boss' || type === 'monster' || type === 'raid_boss') {
    return intensity >= 8 ? 3 : intensity >= 5 ? 2 : 1.5;
  }
  if (type === 'skill_method') {
    return intensity <= 2 ? 2 : intensity <= 4 ? 4 : 5;
  }
  if (type === 'minigame') return 2;
  return 2;
}

function computeEffective(baseVal, travelSec, trips) {
  if (!baseVal || baseVal <= 0) return 0;
  if (!travelSec || travelSec <= 0) return baseVal;
  const travelMin = (travelSec * 2 * trips) / 60;
  const activeMin = Math.max(1, 60 - travelMin);
  const ratio = activeMin / (activeMin + travelMin);
  return Math.round(baseVal * ratio);
}

function rederive(catalog) {
  const annotations = loadMethodAnnotations();
  const log = { updated: 0, appended_annotation: 0, filled_default: 0, entries: [] };

  for (const e of catalog.activities) {
    const ann = annotations.get(e.activity_id);
    let travel, trips, gpCost, netGp, profile;
    let annotationHasTradeoff = false;
    if (ann) {
      // Preferred path — method file has all the math.
      travel = ann.travel_time_to_bank_seconds;
      trips = ann.trips_per_hour;
      // Copy travel fields always.
      e.travel_time_to_bank_seconds = travel;
      e.nearest_teleport = ann.nearest_teleport;
      e.banking_trip_cost = ann.banking_trip_cost;
      e.travel_region_multiplier = ann.travel_region_multiplier;
      e.travel_minutes_per_hour = ann.travel_minutes_per_hour;
      e.active_minutes_per_hour = ann.active_minutes_per_hour;
      e.trips_per_hour = trips;
      // Copy tradeoff fields only if they exist in the annotation. In task-17
      // commit, annotations have travel only; in task-18 commit they have
      // both. This keeps the script forward-compatible either direction.
      if (ann.tradeoff_profile != null) {
        gpCost = ann.gp_cost_per_hour;
        netGp = ann.net_gp_per_hour;
        profile = ann.tradeoff_profile;
        e.gp_cost_per_hour = gpCost;
        e.net_gp_per_hour = netGp;
        e.tradeoff_profile = profile;
        annotationHasTradeoff = true;
      }
      log.appended_annotation++;
    } else {
      // Fallback — infer from intensity/region.
      travel = defaultTravelFor(e);
      trips = defaultTripsFor(e);
      e.travel_time_to_bank_seconds = travel;
      e.nearest_teleport = null;
      e.banking_trip_cost = { gp: 0, intensity: 1 };
      e.travel_minutes_per_hour = Math.round(((travel * 2 * trips) / 60) * 10) / 10;
      e.active_minutes_per_hour = Math.max(1, 60 - e.travel_minutes_per_hour);
      e.trips_per_hour = trips;
      log.filled_default++;
    }

    // Compute effective xp/hr and gp/hr (always, since we always have travel).
    const effXp = computeEffective(Number(e.base_xp_per_hour) || 0, travel, trips);
    const effGp = computeEffective(Number(e.base_gp_per_hour) || 0, travel, trips);
    e.effective_xp_per_hour = effXp;
    e.effective_gp_per_hour = effGp;
    log.updated++;

    if (log.entries.length < 40) {
      log.entries.push({
        activity_id: e.activity_id,
        skill: e.skill,
        intensity: e.intensity,
        base_xp: Number(e.base_xp_per_hour) || 0,
        effective_xp: effXp,
        base_gp: Number(e.base_gp_per_hour) || 0,
        gp_cost: annotationHasTradeoff ? gpCost : undefined,
        net_gp: annotationHasTradeoff ? netGp : undefined,
        travel_s: travel,
        trips_per_hour: trips,
        profile: annotationHasTradeoff ? profile : undefined,
      });
    }
  }

  return log;
}

function main() {
  if (!fs.existsSync(CATALOG_PATH)) {
    console.error(`[rederive-eff] ${CATALOG_PATH} missing — run build-intensity-catalog.js first`);
    process.exit(1);
  }
  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

  const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  const log = rederive(catalog);

  fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2));
  fs.writeFileSync(
    path.join(REPORTS_DIR, '_effective_xp_rederive_log.json'),
    JSON.stringify(log, null, 2),
  );

  console.log(`[rederive-eff] updated ${log.updated} entries`);
  console.log(`[rederive-eff]   ${log.appended_annotation} from data/methods/*.json`);
  console.log(`[rederive-eff]   ${log.filled_default} default-filled (no method file)`);
  console.log(`[rederive-eff] catalog: ${CATALOG_PATH}`);
  console.log(`[rederive-eff] log:     reports/_effective_xp_rederive_log.json`);
}

if (require.main === module) main();

module.exports = { rederive, computeEffective, defaultTravelFor, defaultTripsFor };
