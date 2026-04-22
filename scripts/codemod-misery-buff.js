// ══════════════════════════════════════════════════════════════════════════════
// scripts/codemod-misery-buff.js
//
// Wave B5 misery remediation pass. Applies C16, C17, H13, H17, H18, M7, M12,
// M17 from the v0.9 roadmap:
//
//   C16 (BUFF) — raises stub-data xp/hr entries to 0.85 * band_family_median.
//   C17 (REDUCE_INTENSITY) — drops int 4 -> 2 and 5 -> 3 for kill_mega_* with
//        Background/Multitask attention.
//   H13 (RC alt BUFF) — lifts 14 non-miserable RC alt methods per §2 table.
//   H17 (HP family) — rebalance HP coefficient against combat median.
//   H18 (osrs_canon flag) — 61 parity-drudge activities get osrs_canon=true.
//   M7  (canon marker)  — same flag extension across training methods.
//   M12 (Heartlands buff) — region-wide buff pass for band 1-2 starters.
//   M17 (region tag fix) — unknown -> heartlands for core gather/smelt/etc.
//
// Targets data/intensity-catalog.json directly. Re-runs of the build script
// call codemod-misery-buff via require at the tail so the fix is idempotent.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const CATALOG_PATH = path.join(REPO_ROOT, 'data', 'intensity-catalog.json');

// The 61 OSRS-canon drudges that should carry osrs_canon=true and be excluded
// from misery counts. Taken from reports/misery-zone-fixes.md §6.
const OSRS_CANON_IDS = new Set([
  'trainmethod_agility_gnome_course',
  'trainmethod_attack_cows',
  'heartlands_man_pickpocket_hybrid',
  'kill_pigeon',
  'process_cook_sardine',
  'process_cook_herring',
  'trainmethod_cooking_shrimp_basic',
  'heartlands_wind_bolt_cow',
  'gather_shooting_star',
  'magic_craft_air_runes',
  'runecrafting_craft_air_runes',
  'runecrafting_craft_mind_runes',
  'runecrafting_craft_water_runes',
  'runecrafting_craft_earth_runes',
  'runecrafting_craft_fire_runes',
  'runecrafting_craft_body_runes',
  'runecrafting_craft_cosmic_runes',
  'runecrafting_craft_chaos_runes',
  'runecrafting_craft_nature_runes',
  'runecrafting_craft_law_runes',
  'runecrafting_craft_death_runes',
  'runecrafting_craft_blood_runes',
  'runecrafting_craft_wrath_runes',
  'heartlands_air_altar',
  'heartlands_mind_altar',
  'heartlands_earth_altar',
  'sootworks_fire_altar',
  'saltbrine_water_altar',
  'heartlands_body_altar',
  'glass_desert_cosmic_altar',
  'wilds_chaos_altar',
  'veilwood_nature_altar',
  'inkweald_law_altar',
  'boneyard_death_altar',
  'moryskah_blood_altar',
  'wilds_wrath_altar',
  'trainmethod_heartlands_slayer_turael',
  'trainmethod_slayer_turael_tasks',
  'smithing_smelt_bronze_bar',
  'smithing_smelt_iron_bar',
  'smithing_smelt_steel_bar',
  'smithing_smelt_silver_bar',
  'smithing_smelt_gold_bar',
  'smithing_smelt_adamantite_bar',
  'trainmethod_smithing_cannonballs',
  'thieving_pickpocket_man',
  'trainmethod_saltbrine_smuggler_manifest_thieving',
  'woodcutting_chop_logs',
  'woodcutting_chop_oak_logs',
  'woodcutting_chop_willow_logs',
  'woodcutting_chop_maple_logs',
  'mining_mine_adamantite_rock',
  'mining_mine_adamant_tick_cluster',
  'heartlands_man_def_guard_rotation',
  'kill_mega_veil_hollow_huntsman',
  'kill_mega_heart_toll_highwayman',
  'kill_commander_zilyana',
  'firemaking_burn_normal_logs',
  'firemaking_burn_oak_logs',
  'cooking_cook_shrimp',
  'cooking_cook_sardine',
  'fishing_net_shrimp',
  'fishing_bait_sardine',
  'fishing_fly_fish_trout',
  'fishing_harpoon_manta_ray',
  'fishing_karambwan',
]);

// H13 RC alt-method target BUFF values (per misery-zone-fixes.md §2).
const RC_ALT_BUFFS = {
  'trainmethod_runecrafting_guardians_of_rift': 40000,
  'heartlands_mind_altar_afk': 23000,
  'heartlands_air_altar_pouch_rush': 45000,
  'saltbrine_water_altar_pouch_rush': 45000,
  'heartlands_earth_altar_tiara_rush': 48000,
  'sootworks_fire_altar_afk': 38000,
  'heartlands_body_altar_afk': 30000,
  'glass_desert_cosmic_altar_rush': 62000,
  'wilds_death_rune_altar': 85000,
  'wilds_blood_rune_altar': 90000,
  'wilds_sun_rc': 110000,
  'trainmethod_runecrafting_wilds_abyss': 75000,
  'trainmethod_wilds_rune_essence': 95000,
  'trainmethod_runecrafting_daeyalt_essence': 65000,
};

const COMBAT_MANIFEST_SKILLS = new Set(['attack','strength','defence','hitpoints','ranged','magic']);
function isManifestCombatSkillEntry(e) {
  return e.activity_type === 'skill_method'
    && COMBAT_MANIFEST_SKILLS.has(e.skill)
    && e.base_xp_per_hour > 0 && e.base_xp_per_hour < 12000;
}
function activityFamily(e) {
  if (e.activity_type === 'skill_method' && e.skill !== 'combat' && !COMBAT_MANIFEST_SKILLS.has(e.skill)) return 'skilling_xp';
  if (e.activity_type === 'skill_method' && COMBAT_MANIFEST_SKILLS.has(e.skill)) return 'combat';
  if (['monster','boss','raid_boss','instance'].includes(e.activity_type)) return 'combat';
  return 'other';
}

function computeBandMedians(activities) {
  const bands = {};
  for (let i = 1; i <= 10; i++) bands[i] = { skilling: [], combat: [] };
  for (const e of activities) {
    const b = Math.min(10, Math.max(1, Math.round(e.intensity)));
    if (e.base_xp_per_hour <= 0) continue;
    if (isManifestCombatSkillEntry(e)) continue;
    if (e.activity_type === 'minigame') continue;
    if (e.activity_type === 'raid_boss') continue;
    if (e.is_composite) continue;
    if (e.osrs_canon) continue; // exclude canon from median
    const fam = activityFamily(e);
    if (fam === 'skilling_xp') bands[b].skilling.push(e.base_xp_per_hour);
    else if (fam === 'combat') bands[b].combat.push(e.base_xp_per_hour);
  }
  const medians = {};
  for (let i = 1; i <= 10; i++) {
    const s = bands[i].skilling.slice().sort((a, b) => a - b);
    const c = bands[i].combat.slice().sort((a, b) => a - b);
    medians[i] = {
      skilling: s.length ? s[Math.floor(s.length / 2)] : 0,
      combat: c.length ? c[Math.floor(c.length / 2)] : 0,
    };
  }
  return medians;
}

// C17 — REDUCE_INTENSITY re-tag for kill_mega_* monsters with Background/
// Multitask attention. Drops int 4 -> 2 and 5 -> 3 so they stop being measured
// against an Active-tier median they weren't designed for.
function applyC17ReduceIntensity(activities) {
  let retagged = 0;
  for (const e of activities) {
    if (!/^kill_mega_/.test(e.activity_id)) continue;
    // Only touch misery candidates — intensity 4 or 5
    if (e.intensity !== 4 && e.intensity !== 5) continue;
    // Heuristic: low xp relative to combat class suggests AFK-tier mob
    // (background/multitask attention). Combat < 50 monsters are AFK tier.
    const notes = e.notes || '';
    const combatMatch = notes.match(/combat\s+(\d+)/);
    const combat = combatMatch ? Number(combatMatch[1]) : 0;
    // Only retag low-combat mobs (truly Background/Multitask in practice)
    if (combat > 80) continue;
    // Also require aggressive OR low xp per kill to confirm AFK nature
    const xph = Number(e.base_xp_per_hour) || 0;
    if (xph > 50000) continue; // high xp implies active tier, leave alone
    e.intensity = e.intensity === 4 ? 2 : 3;
    e._c17_retagged = true;
    retagged++;
  }
  return retagged;
}

// H18 + M7 — osrs_canon flag on 61 parity-drudge activities.
function applyH18M7OsrsCanon(activities) {
  let flagged = 0;
  for (const e of activities) {
    if (OSRS_CANON_IDS.has(e.activity_id)) {
      e.osrs_canon = true;
      flagged++;
    }
  }
  return flagged;
}

// H13 — RC alt-method buff pass (14 specific entries).
function applyH13RcAltBuffs(activities) {
  let buffed = 0;
  for (const e of activities) {
    if (!RC_ALT_BUFFS[e.activity_id]) continue;
    const target = RC_ALT_BUFFS[e.activity_id];
    if (e.base_xp_per_hour >= target) continue; // already at target
    e.base_xp_per_hour = target;
    e._h13_rc_buff = true;
    buffed++;
  }
  return buffed;
}

// M17 — region tag fix. Generic mining_mine_*, fishing_net_*, gather_* and
// similar core methods default to 'unknown' because they're registered from
// skill plugins rather than content packs. Re-tag to Heartlands.
function applyM17RegionTags(activities) {
  let retagged = 0;
  const RETAG_PATTERNS = [
    /^(mining_mine|fishing_net|fishing_fly|fishing_bait|fishing_cage|fishing_harpoon)_/,
    /^(gather_|chop_|process_|farm_|trap_|pickpocket_|course_|fish_)/,
    /^(cooking_cook|firemaking_burn|crafting_)/,
    /^(thieving_pickpocket_|agility_course_|hunter_)/,
  ];
  for (const e of activities) {
    if (e.region && e.region !== 'unknown') continue;
    for (const re of RETAG_PATTERNS) {
      if (re.test(e.activity_id)) {
        e.region = 'heartlands';
        e._m17_retag = true;
        retagged++;
        break;
      }
    }
  }
  return retagged;
}

// C16 + M12 — BUFF pass. Raise every misery (xp < 0.7 * fam_median) to
// 0.85 * fam_median, except OSRS-canon entries.
// M12 piggybacks on this since Heartlands band 1-2 is the worst misery cluster.
function applyC16MiseryBuffs(activities) {
  const medians = computeBandMedians(activities);
  let buffed = 0;
  const log = [];
  for (const e of activities) {
    if (e.osrs_canon) continue;
    if (e.is_composite) continue;
    if (e.activity_type === 'minigame' || e.activity_type === 'raid_boss') continue;
    if (isManifestCombatSkillEntry(e)) continue;
    const xph = Number(e.base_xp_per_hour) || 0;
    if (xph <= 0) continue;
    const band = Math.min(10, Math.max(1, Math.round(e.intensity)));
    const fam = activityFamily(e);
    if (fam !== 'skilling_xp' && fam !== 'combat') continue;
    const med = fam === 'skilling_xp' ? medians[band].skilling : medians[band].combat;
    if (med <= 0) continue;
    if (xph >= med * 0.7) continue; // not misery
    // Buff to 0.85 * median
    const target = Math.round(med * 0.85);
    if (target <= xph) continue;
    const before = xph;
    e.base_xp_per_hour = target;
    e._c16_buffed = true;
    log.push({ id: e.activity_id, family: fam, band, before, after: target });
    buffed++;
  }
  fs.writeFileSync(
    path.join(REPO_ROOT, 'reports', '_c16_buff_log.json'),
    JSON.stringify({ buffed, entries: log.slice(0, 300) }, null, 2),
  );
  return buffed;
}

// H17 — HP family genuine design flaws. Raise every hitpoints skill_method
// whose base_xp_per_hour is <60% of its band combat median. 18 entries.
function applyH17HpBuff(activities) {
  const medians = computeBandMedians(activities);
  let buffed = 0;
  for (const e of activities) {
    if (e.skill !== 'hitpoints') continue;
    if (e.activity_type !== 'skill_method') continue;
    if (e.osrs_canon) continue;
    const band = Math.min(10, Math.max(1, Math.round(e.intensity)));
    const med = medians[band].combat;
    if (med <= 0) continue;
    const xph = Number(e.base_xp_per_hour) || 0;
    if (xph >= med * 0.60) continue;
    // HP is coefficient 1.33x of combat damage — raise to 0.75 of combat median
    e.base_xp_per_hour = Math.round(med * 0.75);
    e._h17_hp_buff = true;
    buffed++;
  }
  return buffed;
}

function main() {
  const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  const activities = catalog.activities;

  console.log(`[misery-buff] catalog has ${activities.length} activities`);

  const canon = applyH18M7OsrsCanon(activities);
  console.log(`[misery-buff] H18/M7: flagged ${canon} osrs_canon entries`);

  const retagged = applyM17RegionTags(activities);
  console.log(`[misery-buff] M17: retagged ${retagged} unknown-region -> heartlands`);

  const reduced = applyC17ReduceIntensity(activities);
  console.log(`[misery-buff] C17: reduced intensity on ${reduced} kill_mega_* monsters`);

  const rcBuffed = applyH13RcAltBuffs(activities);
  console.log(`[misery-buff] H13: buffed ${rcBuffed} RC alt methods`);

  const hpBuffed = applyH17HpBuff(activities);
  console.log(`[misery-buff] H17: buffed ${hpBuffed} hitpoints family entries`);

  const buffed = applyC16MiseryBuffs(activities);
  console.log(`[misery-buff] C16/M12: buffed ${buffed} misery entries to 0.85 * median`);

  fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2));
  console.log(`[misery-buff] wrote ${CATALOG_PATH}`);
}

if (require.main === module) main();

module.exports = {
  applyH18M7OsrsCanon,
  applyM17RegionTags,
  applyC17ReduceIntensity,
  applyH13RcAltBuffs,
  applyH17HpBuff,
  applyC16MiseryBuffs,
  OSRS_CANON_IDS,
  RC_ALT_BUFFS,
};
