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
// from misery counts. Taken from reports/misery-zone-fixes.md §6. IDs reflect
// actual generated activity_ids in data/intensity-catalog.json.
const OSRS_CANON_IDS = new Set([
  // Agility / attack / combat intros
  'trainmethod_agility_gnome_course',
  'trainmethod_attack_cows',
  'heartlands_man_pickpocket_hybrid',
  'kill_pigeon',
  // Cooking canon
  'process_cook_sardine',
  'process_cook_herring',
  'trainmethod_cooking_shrimp_basic',
  // Magic / ranged canon
  'heartlands_wind_bolt_cow',
  'gather_shooting_star',
  // Runecrafting craft lines (all 13 tiers — canon-slow reference)
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
  // Plain altar-AFK variants (canon-slow reference paths per §2)
  'heartlands_air_altar_afk',
  'heartlands_mind_altar',          // pure craft-line at level 2
  'heartlands_earth_altar_afk',
  'sootworks_fire_altar_afk',
  'saltbrine_water_altar_afk',
  'heartlands_body_altar_afk',
  'glass_desert_cosmic_altar_afk',
  'wilds_chaos_altar_afk',
  'veilwood_nature_altar_afk',
  'inkweald_law_altar_afk',
  'boneyard_death_altar_afk',
  'moryskah_blood_altar_afk',
  'wilds_wrath_altar_afk',
  // Slayer
  'trainmethod_heartlands_slayer_turael',
  'trainmethod_slayer_turael_tasks',
  // Smithing canon-slow smelts (bronze/iron/steel/silver/gold/adamantite per §6)
  'smithing_smelt_bronze_bar',
  'smithing_smelt_iron_bar',
  'smithing_smelt_steel_bar',
  'smithing_smelt_adamantite_bar',
  'process_smelt_silver',
  'process_smelt_gold',
  'trainmethod_smithing_cannonballs',
  // Thieving intros
  'thieving_pickpocket_man',
  'trainmethod_saltbrine_smuggler_manifest_thieving',
  // Woodcutting canon tree tiers
  'woodcutting_chop_tree',
  'woodcutting_chop_oak',
  'woodcutting_chop_willow',
  'woodcutting_chop_maple',
  // Mining adamant canon
  'mining_mine_adamantite_rock',
  'moryskah_adamant_tick_cluster',
  // Defensive canon + specific kill_mega
  'heartlands_man_def_guard_rotation',
  'kill_mega_veil_hollow_huntsman',
  'kill_mega_heart_toll_highwayman',
  'kill_commander_zilyana',
  // Firemaking canon log tiers (§6: normal + oak tiers only)
  'trainmethod_firemaking_normal_logs',
  'firemaking_light_oak_logs',
  // Fishing canon
  'fishing_net_shrimp',
  'gather_sardine_spot',
  'fishing_fly_fish_trout',
  'gather_manta_ray_spot',
  'gather_karambwan_spot',
]);

// H13 RC alt-method target BUFF values (per misery-zone-fixes.md §2). IDs
// reflect actual generated activity_ids in data/intensity-catalog.json. These
// are the 14 non-canon RC alts the bible identifies as needing a buff — the
// craft-lines stay at their canon-slow values; alts are the escape hatch.
const RC_ALT_BUFFS = {
  'trainmethod_runecrafting_guardians_of_rift': 40000,
  'heartlands_mind_altar': 23000,                       // §2 row: "mind altar-afk -> 23k"
  'heartlands_air_altar_pouch_rush': 45000,
  'saltbrine_water_altar_pouch_rush': 45000,
  'heartlands_earth_altar_tiara_rush': 48000,
  'sootworks_fire_altar_afk': 38000,
  'heartlands_body_altar_afk': 30000,
  'glass_desert_cosmic_altar_rush': 62000,
  'trainmethod_wilds_death_rune_altar': 85000,          // canonical wilds death alt
  'trainmethod_wilds_blood_rune_altar': 90000,          // canonical wilds blood alt
  'trainmethod_glass_desert_sun_rc': 110000,            // §2 sun_rc to 110k
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
//
// Per roadmap §5: "kill_mega_* monsters in monsters-mega.js whose raw xp is
// fine for a band-2 AFK kill but is mistagged as band 3-5 Active. Re-tagging
// them from intensity 4 -> 2 and 5 -> 3 clears ~100 of these without touching
// xp values." Target: 134 entries.
function applyC17ReduceIntensity(activities) {
  let retagged = 0;
  for (const e of activities) {
    if (!/^kill_mega_/.test(e.activity_id)) continue;
    // Only touch misery candidates — intensity 4 or 5
    if (e.intensity !== 4 && e.intensity !== 5) continue;
    // Canon-marked entries stay put
    if (e.osrs_canon) continue;
    // Bosses stay put (`tags:[boss]` or level >=200 implies rotation tier)
    const notes = e.notes || '';
    if (/tags:[^\s]*boss/.test(notes)) continue;
    // Extract combat level from notes
    const combatMatch = notes.match(/combat\s+(\d+)/);
    const combat = combatMatch ? Number(combatMatch[1]) : 0;
    // kill_mega_* entries are standalone mobs, NOT raid rooms or rotations.
    // Anything under level 200 is functionally Background/Multitask attention.
    if (combat > 200) continue;
    const xph = Number(e.base_xp_per_hour) || 0;
    // High-xph entries (>120k) are already meeting their band median; if they
    // were miserable the BUFF pass handles them.
    if (xph > 120000) continue;
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

function applyAll(activities) {
  const canon = applyH18M7OsrsCanon(activities);
  const m17 = applyM17RegionTags(activities);
  const c17 = applyC17ReduceIntensity(activities);
  const h13 = applyH13RcAltBuffs(activities);
  const h17 = applyH17HpBuff(activities);
  const c16 = applyC16MiseryBuffs(activities);
  return { canon, m17, c17, h13, h17, c16 };
}

function main() {
  const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  const activities = catalog.activities;

  console.log(`[misery-buff] catalog has ${activities.length} activities`);

  const counts = applyAll(activities);
  console.log(`[misery-buff] H18/M7: flagged ${counts.canon} osrs_canon entries`);
  console.log(`[misery-buff] M17: retagged ${counts.m17} unknown-region -> heartlands`);
  console.log(`[misery-buff] C17: reduced intensity on ${counts.c17} kill_mega_* monsters`);
  console.log(`[misery-buff] H13: buffed ${counts.h13} RC alt methods`);
  console.log(`[misery-buff] H17: buffed ${counts.h17} hitpoints family entries`);
  console.log(`[misery-buff] C16/M12: buffed ${counts.c16} misery entries to 0.85 * median`);

  fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2));
  console.log(`[misery-buff] wrote ${CATALOG_PATH}`);
}

if (require.main === module) main();

module.exports = {
  applyAll,
  applyH18M7OsrsCanon,
  applyM17RegionTags,
  applyC17ReduceIntensity,
  applyH13RcAltBuffs,
  applyH17HpBuff,
  applyC16MiseryBuffs,
  OSRS_CANON_IDS,
  RC_ALT_BUFFS,
};
