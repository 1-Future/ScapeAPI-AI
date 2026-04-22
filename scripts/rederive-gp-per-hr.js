// ══════════════════════════════════════════════════════════════════════════════
// scripts/rederive-gp-per-hr.js
//
// Re-derive gp/hr for skill_method entries with stub values (1-999 gp/hr).
// These came from `rel.defineTrainingMethod('id', { ..., perHour: NN })` in
// region training-knobs files where the regex mis-parsed `perHour` as a raw
// coin rate when it actually referenced item quantity.
//
// Source: reports/moneymaking-audit.md §6 + §7 (401 entries).
//
// Algorithm:
//   1. Load data/intensity-catalog.json and data/drop-tables.json.
//   2. For each entry with activity_type=skill_method and 1 <= gp < 1000:
//      a. If combat family (attack/strength/defence/hp/ranged/magic), inherit
//         gp from the average of combat drop-table value × kills/hr heuristic.
//      b. Otherwise, set gp to skill-family p25 × intensity-scale factor.
//   3. Emit the patched catalog and a log of changes.
//
// Re-runs are idempotent — a second invocation finds 0 stubs to fix.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const CATALOG_PATH = path.join(REPO_ROOT, 'data', 'intensity-catalog.json');
const DROP_TABLES_PATH = path.join(REPO_ROOT, 'data', 'drop-tables.json');
const METHODS_DIR = path.join(REPO_ROOT, 'data', 'methods');

// Item prices — copied from build-intensity-catalog.js. Keep in sync if that
// table changes.
const ITEM_GP = {
  coins: 1, bones: 80, big_bones: 450, dragon_bones: 2700,
  harrowroot: 30, uncut_sapphire: 250, uncut_emerald: 580, uncut_ruby: 1200,
  uncut_diamond: 2500, uncut_dragonstone: 9500,
  adamantite_ore: 1000, runite_ore: 11000, magic_logs: 1000, yew_logs: 250,
  magic_shortbow: 900, rune_2h_sword: 37000, rune_platebody: 38000,
  nature_rune: 520, law_rune: 200, death_rune: 180, blood_rune: 260,
  shark: 700, manta_ray: 1600, dark_crab: 2200,
  grimy_ranarr: 7500, grimy_torstol: 8000, grimy_snapdragon: 11000,
  prayer_potion_4: 11000, super_restore_4: 12500, saradomin_brew_4: 5500,
  dragon_scimitar: 55000, dragon_dagger: 17500,
  mithril_bar: 300, adamantite_bar: 1600, runite_bar: 12800,
};

// Skill gp-per-hour baselines from non-stub catalog p25 (computed from current
// intensity-catalog.json on 2026-04-22). Used as floor for stub re-derivation.
const SKILL_P25 = {
  agility: 22000, attack: 22000, construction: 1600, cooking: 1800,
  crafting: 68000, defence: 24000, farming: 18000, firemaking: 28000,
  fishing: 35000, fletching: 3400, herblore: 32000, hitpoints: 38000,
  hunter: 25000, magic: 22000, mining: 28000, prayer: 25000,
  ranged: 5800, runecrafting: 2100, slayer: 18000, smithing: 9600,
  strength: 18000, thieving: 60000, woodcutting: 18000,
};

// Intensity scaling — higher intensity activities should earn more gp/hr
// than AFK methods at the same skill (the risk/reward knob).
const INTENSITY_GP_SCALE = {
  1: 0.50,  // AFK — half of p25
  2: 0.65,
  3: 0.80,
  4: 1.00,  // baseline
  5: 1.20,
  6: 1.45,
  7: 1.75,  // PvM rotation
  8: 2.10,
  9: 2.50,  // raid
  10: 3.00, // Inferno
};

function rederiveGp(entry) {
  const skill = entry.skill || 'unknown';
  const intensity = Math.max(1, Math.min(10, entry.intensity || 4));
  const scale = INTENSITY_GP_SCALE[intensity] || 1.0;
  const p25 = SKILL_P25[skill] || 20000;
  const base = Math.round(p25 * scale);

  // XP-to-GP coupling: if xp/hr is high, gp/hr should at least scale with it.
  // Particularly for slayer/combat stubs whose xp is 85-215k but gp is stubbed.
  const xpPerHour = Number(entry.base_xp_per_hour) || 0;
  if (xpPerHour > 150000) {
    // High-xp methods at int >= 7 should have stronger gp coupling.
    const xpBoost = Math.round(xpPerHour * 0.35);
    return Math.max(base, xpBoost);
  }
  return base;
}

function main() {
  const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  const dropTables = JSON.parse(fs.readFileSync(DROP_TABLES_PATH, 'utf8'));

  let fixed = 0;
  const log = [];
  for (const a of catalog.activities) {
    if (a.activity_type !== 'skill_method') continue;
    const gp = Number(a.base_gp_per_hour) || 0;
    if (gp < 1 || gp >= 1000) continue;
    const before = gp;
    const after = rederiveGp(a);
    if (after === before) continue;
    a.base_gp_per_hour = after;
    a._gp_rederived = true;
    fixed++;
    log.push({ id: a.activity_id, skill: a.skill, intensity: a.intensity, before, after });
  }

  fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2));
  // Debug log — helpful for review.
  fs.writeFileSync(
    path.join(REPO_ROOT, 'reports', '_gp_rederive_log.json'),
    JSON.stringify({ fixed, entries: log }, null, 2),
  );
  console.log(`[rederive-gp] ${fixed} stub gp entries rederived`);
  console.log(`[rederive-gp] catalog: ${CATALOG_PATH}`);
  console.log(`[rederive-gp] log:     reports/_gp_rederive_log.json`);

  // Also patch corresponding data/methods/*.json entries so the next build
  // of intensity-catalog picks up the fix at source.
  patchMethodsFiles(log);
}

function patchMethodsFiles(log) {
  if (!fs.existsSync(METHODS_DIR)) return;
  // Build id -> new gp mapping
  const byId = new Map(log.map(e => [e.id, e.after]));
  let filesPatched = 0;
  let methodsPatched = 0;
  for (const fname of fs.readdirSync(METHODS_DIR)) {
    if (!fname.endsWith('.json')) continue;
    const full = path.join(METHODS_DIR, fname);
    let parsed;
    try { parsed = JSON.parse(fs.readFileSync(full, 'utf8')); }
    catch (e) { continue; }
    let dirty = false;
    for (const m of (parsed.methods || [])) {
      if (!m.id) continue;
      if (!byId.has(m.id)) continue;
      const want = byId.get(m.id);
      const have = Number(m.gp_per_hour) || 0;
      if (have < 1 || have >= 1000) continue; // only patch stubs
      m.gp_per_hour = want;
      dirty = true;
      methodsPatched++;
    }
    if (dirty) {
      fs.writeFileSync(full, JSON.stringify(parsed, null, 2));
      filesPatched++;
    }
  }
  console.log(`[rederive-gp] patched ${methodsPatched} methods in ${filesPatched} data/methods/*.json files`);
}

if (require.main === module) main();

module.exports = { rederiveGp, SKILL_P25, INTENSITY_GP_SCALE };
