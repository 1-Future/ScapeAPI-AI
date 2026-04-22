// ═════════════════════════════════════════════════════════════════════════════
// [v0.9-waveC2] C11: Wire diary achievements as DAG gates
//
// Pre-C11: 0 downstream nodes require `achievement:<region>_diary_*`
// Post-C11: each elite diary gates >=2 downstream nodes; hard/medium gates
//           layered on for graduated progression.
// Approach: append-only edits to existing `requires` arrays in
//           data/progression-dag.json. No new nodes, no renames.
// ═════════════════════════════════════════════════════════════════════════════
'use strict';

const fs = require('fs');
const path = require('path');

const DAG_PATH = path.join(__dirname, '..', 'data', 'progression-dag.json');
const dag = JSON.parse(fs.readFileSync(DAG_PATH, 'utf8'));

// Map of node_id -> [diary_achievement_id] to append to its `requires` array.
// Chosen per diary-audit.md §5: shortcuts, elite-clue steps, region-locked
// bosses/areas. Minimum 2 per elite diary, with hard/medium layered for depth.
const GATES = {
  // ── BONEYARD ────────────────────────────────────────────────────────────
  'area:boneyard_bone_pyramid':        ['achievement:boneyard_diary_elite'],
  'area:boneyard_burnt_library':       ['achievement:boneyard_diary_elite'],
  'area:boneyard_deep_dunes':          ['achievement:boneyard_diary_hard'],
  'area:boneyard_singing_dunes':       ['achievement:boneyard_diary_hard'],
  'area:boneyard_salt_cisterns':       ['achievement:boneyard_diary_medium'],
  'area:boneyard_the_splinter':        ['achievement:boneyard_diary_medium'],
  'area:boneyard_quarrymaster_camp':   ['achievement:boneyard_diary_medium'],

  // ── GLASS DESERT ────────────────────────────────────────────────────────
  'area:glass_desert_inferno':         ['achievement:glass_desert_diary_elite'],
  'area:glass_desert_sage_tower':      ['achievement:glass_desert_diary_elite'],
  'area:glass_desert_new_sun_zone':    ['achievement:glass_desert_diary_elite'],
  'area:glass_desert_fight_caves':     ['achievement:glass_desert_diary_hard'],
  'area:glass_desert_prophecy_chamber':['achievement:glass_desert_diary_hard'],
  'area:glass_desert_singing_glass_caverns': ['achievement:glass_desert_diary_medium'],

  // ── HEARTLANDS ──────────────────────────────────────────────────────────
  'area:heartlands_bell_tower':        ['achievement:heartlands_diary_elite'],
  'area:heartlands_throne_room':       ['achievement:heartlands_diary_elite'],
  'area:heartlands_all_guilds':        ['achievement:heartlands_diary_elite'],
  'area:heartlands_capital_rooftops':  ['achievement:heartlands_diary_hard'],
  'area:heartlands_deep_keep':         ['achievement:heartlands_diary_hard'],
  'area:heartlands_grand_cathedral':   ['achievement:heartlands_diary_medium'],
  'area:heartlands_old_hedge':         ['achievement:heartlands_diary_medium'],

  // ── INKWEALD ────────────────────────────────────────────────────────────
  'area:inkweald_dream_forge':         ['achievement:inkweald_diary_elite'],
  'area:inkweald_threshold_of_names':  ['achievement:inkweald_diary_elite'],
  'area:ascendant_spire':              ['achievement:inkweald_diary_elite'],
  'area:inkweald_mirror_glades':       ['achievement:inkweald_diary_hard'],
  'area:inkweald_half_light_range':    ['achievement:inkweald_diary_hard'],
  'area:inkweald_cradlewood':          ['achievement:inkweald_diary_medium'],

  // ── MORYSKAH ────────────────────────────────────────────────────────────
  'area:moryskah_silent_chapel_sanctum': ['achievement:moryskah_diary_elite'],
  'area:moryskah_castle_throne':       ['achievement:moryskah_diary_elite'],
  'area:moryskah_choir_loft':          ['achievement:moryskah_diary_elite'],
  'area:moryskah_mausoleum_rooftops':  ['achievement:moryskah_diary_hard'],
  'area:moryskah_sisterhood_library':  ['achievement:moryskah_diary_hard'],
  'area:moryskah_silent_chapel':       ['achievement:moryskah_diary_medium'],
  'area:moryskah_deep_bog':            ['achievement:moryskah_diary_medium'],

  // ── SALTBRINE ───────────────────────────────────────────────────────────
  'area:saltbrine_throne_rocks':       ['achievement:saltbrine_diary_elite'],
  'area:saltbrine_tower_upper':        ['achievement:saltbrine_diary_elite'],
  'area:saltbrine_ghost_anchorage':    ['achievement:saltbrine_diary_elite'],
  'area:saltbrine_deep_waters':        ['achievement:saltbrine_diary_hard'],
  'area:saltbrine_drifting_market':    ['achievement:saltbrine_diary_hard'],
  'area:saltbrine_smugglers_cove':     ['achievement:saltbrine_diary_medium'],

  // ── SOOTWORKS ───────────────────────────────────────────────────────────
  'area:sootworks_deep_furnace':       ['achievement:sootworks_diary_elite'],
  'area:sootworks_deep_stone_works':   ['achievement:sootworks_diary_elite'],
  'area:deep_sootworks_crew_seven_tunnel': ['achievement:sootworks_diary_elite'],
  'area:sootworks_deepwell':           ['achievement:sootworks_diary_hard'],
  'area:sootworks_imbue_hall':         ['achievement:sootworks_diary_hard'],
  'area:sootworks_forge_cathedral':    ['achievement:sootworks_diary_medium'],

  // ── VEILWOOD ────────────────────────────────────────────────────────────
  'area:veilwood_inner_sanctum':       ['achievement:veilwood_diary_elite'],
  'area:veilwood_moonhawk_perch':      ['achievement:veilwood_diary_elite'],
  'area:veilwood_moonwell':            ['achievement:veilwood_diary_elite'],
  'area:veilwood_loom_sanctum':        ['achievement:veilwood_diary_hard'],
  'area:veilwood_stag_stone':          ['achievement:veilwood_diary_hard'],
  'area:veilwood_mirror_shallow':      ['achievement:veilwood_diary_medium'],
  'area:veilwood_threshold_wardens':   ['achievement:veilwood_diary_medium'],

  // ── WILDS ────────────────────────────────────────────────────────────────
  'area:wilds_obelisk_safe_point':     ['achievement:wilds_diary_elite'],
  'area:wilds_revenant_throne':        ['achievement:wilds_diary_elite'],
  'area:the_wilds_kbd_lair':           ['achievement:wilds_diary_hard'],
  'area:the_wilds_mithril_pocket':     ['achievement:wilds_diary_hard'],
  'area:the_wilds_lava_maze':          ['achievement:wilds_diary_medium'],
  'area:the_wilds_ent_grove':          ['achievement:wilds_diary_medium'],
};

// ──────────────────────────────────────────────────────────────────────────
// Apply: scan nodes, append diary achievement to `requires` if not present.
// Skip missing target nodes (log for later clean-up). Skip duplicates.
// ──────────────────────────────────────────────────────────────────────────

const nodesById = new Map(dag.nodes.map((n) => [n.id, n]));
let applied = 0;
let skippedMissing = 0;
let skippedDup = 0;
const missingNodes = [];
const perDiaryCount = {};

for (const [nodeId, gates] of Object.entries(GATES)) {
  const node = nodesById.get(nodeId);
  if (!node) {
    missingNodes.push(nodeId);
    skippedMissing++;
    continue;
  }
  if (!Array.isArray(node.requires)) node.requires = [];
  for (const gate of gates) {
    if (node.requires.includes(gate)) {
      skippedDup++;
      continue;
    }
    node.requires.push(gate);
    applied++;
    perDiaryCount[gate] = (perDiaryCount[gate] || 0) + 1;
    // Tag for provenance
    if (!node.gated_by) node.gated_by = [];
    if (!node.gated_by.includes('v0.9-waveC2-C11')) node.gated_by.push('v0.9-waveC2-C11');
  }
}

// Write back with stable 2-space indent matching existing file.
fs.writeFileSync(DAG_PATH, JSON.stringify(dag, null, 2) + '\n', 'utf8');

console.log(`[C11] applied ${applied} new diary-achievement gates`);
console.log(`[C11] skipped ${skippedMissing} missing target nodes, ${skippedDup} already-present duplicates`);
if (missingNodes.length) {
  console.log('[C11] missing target nodes (gated node does not exist in DAG):');
  for (const m of missingNodes) console.log('  -', m);
}
console.log('[C11] gates applied per diary:');
const sortedDiaries = Object.keys(perDiaryCount).sort();
for (const d of sortedDiaries) console.log(`  ${d}: ${perDiaryCount[d]}`);
