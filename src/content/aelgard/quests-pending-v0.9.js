// ══════════════════════════════════════════════════════════════════════════════
// [v0.9-waveC2] H12 — QUEST_PENDING skeleton stubs
//
// Registers 17 stub quests for DAG-refs-plan §3.3 (OSRS-heritage placeholders)
// and §3.4 (Scape-native unwritten). Each stub resolves the DAG reference but
// has empty requirements + rewards. Marked `status: 'stub_pending_author'`.
//
// A future content-pass (per Marstead design bible) MUST replace each stub
// with a Marstead-native narrative quest (~4hr design+write effort per §6.4).
//
// DO NOT ship these to players in their current form; `questPoints: 0` plus
// the `status` flag mean `listAll().filter(q => q.status !== 'stub_...')`
// can hide them from any UI until authored.
//
// Touching this file: only add quests to the STUBS table below and re-run
// the `registerStubs()` loop. No logic.
// ══════════════════════════════════════════════════════════════════════════════

const quests = require('../../data/quests');

// ── Stub shape (matches quests.define opts) ────────────────────────────────
// Every stub has these fields:
//   id:           DAG-referenced quest id (matches broken-dag-refs-plan.md §3)
//   name:         Placeholder title matching lore seed
//   description:  One-line placeholder; will be rewritten at author-time
//   difficulty:   'placeholder' (will be set during authoring)
//   status:       'stub_pending_author' — marks for content-agent handoff
//   region:       Lore region (per plan §3.4 column)
//   heritage:     'osrs_heritage' | 'scape_native' | 'wilds_diary_ref'
// ── Stubs ──────────────────────────────────────────────────────────────────

const STUBS = [
  // ═════════════ OSRS-HERITAGE (§3.3 — need Scape-native replacement) ═════
  // [v0.9-waveC2 — M6] Each of the 6 stubs below carries _osrs_heritage: true
  // via its `heritage: 'osrs_heritage'` field. See the per-entry comments
  // below for individual content-agent tickets.
  {
    // _osrs_heritage: true — content-agent ticket QUEST_HERITAGE_PIP
    id: 'priest_in_peril',
    name: 'Priest in Peril [STUB]',
    description: 'OSRS-heritage placeholder. Aelgard replacement: the Deadhold summons — a Moryskah-native intro quest that unlocks the deadhold minigame.',
    region: 'Moryskah',
    heritage: 'osrs_heritage',
    proposedReplacement: 'the_deadhold_summons',
  },
  {
    // _osrs_heritage: true — content-agent ticket QUEST_HERITAGE_TBWT
    id: 'tai_bwo_wannai_trio',
    name: 'Tai Bwo Wannai Trio [STUB]',
    description: 'OSRS-heritage placeholder. Aelgard has no Karamja analogue; proposed replacement is a Saltbrine cooking unlock gated on the_saltbrine_regatta.',
    region: 'Saltbrine',
    heritage: 'osrs_heritage',
    proposedReplacement: 'the_saltbrine_regatta',
  },
  {
    // _osrs_heritage: true — content-agent ticket QUEST_HERITAGE_SWAN
    id: 'swan_song',
    name: 'Swan Song [STUB]',
    description: 'OSRS-heritage placeholder. Aelgard lacks monkfish; proposed replacement hooks monkfish-tier fishing onto the_trawlers_call chain.',
    region: 'Saltbrine',
    heritage: 'osrs_heritage',
    proposedReplacement: 'the_trawlers_call',
  },
  {
    // _osrs_heritage: true — content-agent ticket QUEST_HERITAGE_CANNON
    id: 'dwarf_cannon_quest',
    name: 'Dwarf Cannon [STUB]',
    description: 'OSRS-heritage placeholder. Aelgard replacement: the Cannon Forge Commission — a Sootworks dwarven-ally quest that unlocks smithing cannonballs.',
    region: 'Sootworks',
    heritage: 'osrs_heritage',
    proposedReplacement: 'the_cannon_forge_commission',
  },
  {
    // _osrs_heritage: true — content-agent ticket QUEST_HERITAGE_FEUD
    id: 'feud_quest',
    name: 'The Feud [STUB]',
    description: 'OSRS-heritage placeholder. Aelgard replacement: the Moonless Feud — a Moryskah blackjacking unlock with rival vampyre houses.',
    region: 'Moryskah',
    heritage: 'osrs_heritage',
    proposedReplacement: 'the_moonless_feud',
  },
  {
    // _osrs_heritage: true — content-agent ticket QUEST_HERITAGE_BA
    id: 'barbarian_assault',
    name: 'Barbarian Assault [STUB]',
    description: 'OSRS-heritage placeholder. Aelgard has no direct analogue; proposed swap is the Saltbrine scuttler-pits minigame, but this quest id is still DAG-referenced by saltbrine_diary_elite.',
    region: 'Saltbrine',
    heritage: 'osrs_heritage',
    proposedReplacement: 'minigame:saltbrine_scuttler_pits',
  },

  // ═════════════ SCAPE-NATIVE UNWRITTEN (§3.4) ═══════════════════════════
  {
    id: 'bone_voyage',
    name: 'Bone Voyage [STUB]',
    description: 'Boneyard prayer + mining unlock. Referenced by boneyard_fossil_prayer and mining_volcanic_mine training methods.',
    region: 'Boneyard',
    heritage: 'scape_native',
  },
  {
    id: 'the_tiled_rooftops',
    name: 'The Tiled Rooftops [STUB]',
    description: 'Heartlands agility-tree unlock. Referenced by heartlands_bell_tower_agility and heartlands_capital_agility.',
    region: 'Heartlands',
    heritage: 'scape_native',
  },
  {
    id: 'moryskah_requiem',
    name: 'Moryskah Requiem [STUB]',
    description: 'Key combat-chinchompa unlock. Referenced by defence_chinchompa_stacking, magic_burst_spells, and ranged_chinchompas.',
    region: 'Moryskah',
    heritage: 'scape_native',
  },
  {
    id: 'soot_king_raid',
    name: 'Soot King Raid [STUB]',
    description: 'Sootworks raid introduction quest. Required by achievement:sootworks_diary_elite.',
    region: 'Sootworks',
    heritage: 'scape_native',
  },
  {
    id: 'saltbrine_agility_course',
    name: 'Saltbrine Agility Course [STUB]',
    description: 'Saltbrine agility introduction. Required by achievement:saltbrine_diary_medium.',
    region: 'Saltbrine',
    heritage: 'scape_native',
  },
  {
    id: 'the_fen_pilgrimage',
    name: 'The Fen Pilgrimage [STUB]',
    description: 'Moryskah burgh-ramble unlock. Required by minigame:moryskah_burgh_ramble.',
    region: 'Moryskah',
    heritage: 'scape_native',
  },
  {
    id: 'the_rangers_trust',
    name: "The Ranger's Trust [STUB]",
    description: 'Veilwood poacher-rounds unlock. Required by minigame:veilwood_poacher_rounds.',
    region: 'Veilwood',
    heritage: 'scape_native',
  },
  {
    id: 'inkweald_archives',
    name: 'Inkweald Archives [STUB]',
    description: 'Inkweald archives unlock — suspected alias for the_inkweald_second_door; content agent to confirm. Referenced by agility_seers_course.',
    region: 'Inkweald',
    heritage: 'scape_native',
  },
  {
    id: 'moryskah_haunting',
    name: 'Moryskah Haunting [STUB]',
    description: 'Core prayer-ectofuntus unlock. Referenced by prayer_ectofuntus training method.',
    region: 'Moryskah',
    heritage: 'scape_native',
  },

  // ═════════════ WILDS DIARY REFS (referenced but unwritten) ══════════════
  {
    id: 'wilderness_collection_log',
    name: 'The Wilderness Collection Log [STUB]',
    description: 'Wilds elite-diary gate. Fills the full 100% Wilds collection-log prerequisite.',
    region: 'Wilds',
    heritage: 'wilds_diary_ref',
  },
  {
    id: 'wilderness_agility_course_perfectly',
    name: 'The Wilderness Agility Course (Perfect) [STUB]',
    description: 'Wilds hard-diary gate. Requires a full lap of the Wilderness Agility Course without failing any obstacle.',
    region: 'Wilds',
    heritage: 'wilds_diary_ref',
  },
];

// ── Registrar ──────────────────────────────────────────────────────────────

function registerStubs() {
  let registered = 0;
  let skippedExisting = 0;
  for (const stub of STUBS) {
    if (quests.getQuest(stub.id)) {
      // Already authored upstream — stub would clobber real content.
      skippedExisting++;
      continue;
    }
    quests.define(stub.id, {
      name: stub.name,
      description: stub.description,
      difficulty: 'placeholder',
      questPoints: 0,
      requirements: {},
      steps: [],
      rewards: {
        xp: [],
        items: [],
        unlocks: [],
      },
      // Stub-only metadata (ignored by engine but visible to audit scripts).
      status: 'stub_pending_author',
      heritage: stub.heritage,
      region: stub.region,
      proposedReplacement: stub.proposedReplacement || null,
    });
    registered++;
  }
  console.log(`[aelgard] quests-pending-v0.9: ${registered} stubs registered, ${skippedExisting} already authored (skipped)`);
}

registerStubs();

module.exports = { STUBS, registerStubs };
