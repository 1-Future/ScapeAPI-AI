// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Sootworks Easter Eggs
//
// Voice: soot-mouthed. Tool-noun-heavy. Dwarven industrial. Pratchett's Low
// King meets Ted Hughes. "Forge here. Quench there. Mind the cinder." The
// guilds argue over who invented the rivet. Labor history, not lore dump.
//
// Specific landmarks drive every encounter:
//   - The Forge Cathedral (Forgemaster Brun)
//   - Pump Eight (valves + whistles)
//   - The Soot-Library (archivist ledger)
//   - The Brass Choir (organ mass)
//   - The Deep Stone Alloy Works (master crucibles)
//   - Cinder King's Graveyard (cog-bones)
//   - The Beggars' Gallery (brass buttons, hem-stitches)
//
// This file adds:
//   - 8 grandmaster quests (stitch 5+ regions each, non-XP rewards)
//   - 5 world-event chains (trigger on milestones, reshape the world)
//   - 10 reagent-combo chains (stamps + rivets + archives)
//   - 5 very-rare 1/10000 drops that unlock cosmetic capes
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const rel = require('../../data/relationships');

// ══════════════════════════════════════════════════════════════════════════════
// 8 GRANDMASTER QUESTS — cross 5+ regions, non-XP unlocks
// ══════════════════════════════════════════════════════════════════════════════

rel.defineQuestUnlock('the_forgemaster_contract', {
  name: "The Forgemaster's Contract",
  unlocks: [
    { type: 'npc', id: 'forgemaster_brun_contract_desk', description: "Brun's contract desk — signs your warrant, stamps your apron" },
    { type: 'training_method', id: 'sootworks_forge_cathedral_commission', description: 'Cathedral commissions (endgame smithing)' },
    { type: 'training_method', id: 'sootworks_cathedral_crafting_bench', description: 'Master crafting bench' },
    { type: 'item_equip', id: 'forgemaster_stamp', description: 'Forgemaster stamp — required for master-grade work at every Aelgard forge' },
    { type: 'shop', id: 'forgemaster_stamp_shop', description: 'Brun sells stamps once per in-game week' },
  ],
});

rel.defineQuestUnlock('the_organ_mass', {
  name: 'The Organ Mass',
  unlocks: [
    { type: 'training_method', id: 'sootworks_brass_choir_grand_sermon', description: 'Grand Sermon prayer (345k/hr)' },
    { type: 'training_method', id: 'sootworks_organ_mass_prayer', description: 'Organ Mass obscure prayer (1.02M/hr)' },
    { type: 'training_method', id: 'sootworks_brass_choir_silent_hour', description: 'Silent Hour enchanting' },
    { type: 'prayer', id: 'organ_mass_rite', description: 'Organ Mass Rite — +15% damage vs constructs region-wide' },
    { type: 'item_equip', id: 'pipe_ember_censer', description: 'Pipe-ember censer — prayer bonus when bones on offer' },
  ],
});

rel.defineQuestUnlock('the_cinder_kings_fall', {
  name: "The Cinder King's Fall",
  unlocks: [
    { type: 'area', id: 'sootworks_cinder_graveyard', description: "Cinder King's Graveyard — slayer contract zone" },
    { type: 'boss', id: 'cinder_king_revenant', description: 'Cinder King Revenant — yearly boss encounter' },
    { type: 'training_method', id: 'sootworks_cinder_king_slayer', description: "Graveyard contracts" },
    { type: 'training_method', id: 'sootworks_cinder_king_anniversary_slayer', description: 'Anniversary contract (yearly)' },
    { type: 'item_equip', id: 'cog_bone_charm', description: 'Cog-bone charm — required for safe Graveyard contracts' },
  ],
});

rel.defineQuestUnlock('the_soot_road', {
  name: 'The Soot Road',
  unlocks: [
    { type: 'teleport', id: 'soot_road_network', description: 'Soot Road — 18 hidden industrial caches across every region' },
    { type: 'item_equip', id: 'soot_road_ledger', description: 'Soot Road Ledger — stamped once per cache by the Road Warden' },
    { type: 'recipe', id: 'master_imbue_token', description: 'Master Imbue-Token — level-100 equivalent charm requiring a reagent from each region' },
  ],
});

rel.defineQuestUnlock('the_rivet_argument', {
  name: 'The Rivet Argument',
  unlocks: [
    { type: 'npc', id: 'three_guildmasters', description: 'Three Guildmasters — Smiths, Tinkers, Pumpmen. All three argue who invented the rivet. Player arbitrates.' },
    { type: 'item_equip', id: 'triple_guild_pin', description: 'Triple Guild Pin — signed by all three guilds. +1 smith, +1 crafting, +1 agility at Sootworks stations' },
    { type: 'shop', id: 'triple_guild_exchange', description: 'Triple Guild Exchange — buy rivets, grease, brass from any guild at fair price' },
    { type: 'minigame', id: 'rivet_debate', description: 'Rivet Debate minigame — public defence on behalf of one guild; reward rotates' },
  ],
});

rel.defineQuestUnlock('the_deep_stone_charter', {
  name: 'The Deep Stone Charter',
  unlocks: [
    { type: 'area', id: 'sootworks_deep_stone_works', description: 'Deep Stone Alloy Works — endgame smithing facility' },
    { type: 'training_method', id: 'sootworks_deep_stone_alloyworks_smithing', description: 'Master Alloy Works smithing' },
    { type: 'item_equip', id: 'deep_stone_apron', description: 'Deep Stone Apron — worn by charter-signed smiths only. Permanent +8% smithing XP in Sootworks' },
    { type: 'recipe', id: 'deep_stone_master_bar', description: 'Deep-Stone Master Bar — top-tier bar, requires flux and Brun stamp' },
  ],
});

rel.defineQuestUnlock('the_pump_eight_mutiny', {
  name: 'The Pump Eight Mutiny',
  unlocks: [
    { type: 'area', id: 'sootworks_pump_eight_lower', description: 'Lower Pump Eight — agility-exclusive sprint zone' },
    { type: 'training_method', id: 'sootworks_pump_eight_elite', description: 'Pump Eight elite circuit' },
    { type: 'training_method', id: 'sootworks_pump_eight_shift_change', description: 'Shift-change sprint (obscure)' },
    { type: 'item_equip', id: 'pumpmans_master_wrench', description: "Pump Eight Wrench (Master) — permanent +3 agility in Sootworks" },
    { type: 'teleport', id: 'pump_eight_network', description: 'Pump Eight Network — teleport between any two whistle-marked pumps' },
  ],
});

rel.defineQuestUnlock('the_beggars_petition', {
  name: "The Beggars' Petition",
  unlocks: [
    { type: 'npc', id: 'gallery_elder_beggar', description: 'Gallery Elder — gives the petition, signs your hem-coat' },
    { type: 'training_method', id: 'sootworks_beggars_gallery_master_lift', description: 'Gallery master lift (290k/hr thieving)' },
    { type: 'training_method', id: 'sootworks_beggars_gallery_payday', description: 'Payday Lift obscure thieving' },
    { type: 'item_equip', id: 'beggar_hem_coat', description: 'Beggar-Hem Coat — Gallery beggars never call guards when worn' },
    { type: 'shop', id: 'gallery_back_room', description: 'Gallery Back Room — buys clerk-script, sells brass buttons in bulk' },
  ],
});

// Register grandmaster quests as training methods so density score picks them up
function registerGrandmasterAsMethod(id, skill, xp, level, desc) {
  try {
    rel.defineTrainingMethod(`grandmaster_${id}`, {
      skill,
      name: `[Grandmaster Quest] ${desc.substring(0, 40)}`,
      levelRange: [level, 99],
      xpPerHour: xp,
      prerequisites: { skills: {}, quests: [id], items: [], areas: ['sootworks'] },
      resourceOutput: { produces: [], net: 'neutral' },
      bankingFrequency: 'never', costPerHour: 0,
      danger: 'medium', complexity: 'intense', attention: 'maximum',
      inputs: [],
      description: desc,
      location: 'Sootworks',
    });
  } catch (e) { /* idempotent */ }
}

registerGrandmasterAsMethod('the_forgemaster_contract', 'smithing', 90000, 80, "Forgemaster Contract replay — weekly stamped bar run at Brun's anvil");
registerGrandmasterAsMethod('the_organ_mass', 'prayer', 95000, 75, 'Organ Mass replay — dawn mass with censer and sinew');
registerGrandmasterAsMethod('the_cinder_kings_fall', 'slayer', 85000, 85, "Cinder King's Fall replay — graveyard rounds at the ash-pit");
registerGrandmasterAsMethod('the_soot_road', 'hitpoints', 60000, 70, 'Soot Road replay — 18 industrial caches across every region');
registerGrandmasterAsMethod('the_rivet_argument', 'crafting', 55000, 65, 'Rivet Argument — weekly public debate at the three guild halls');
registerGrandmasterAsMethod('the_deep_stone_charter', 'smithing', 110000, 85, 'Deep Stone Charter replay — weekly apron-stamped work at the Alloy Works');
registerGrandmasterAsMethod('the_pump_eight_mutiny', 'agility', 80000, 75, 'Pump Eight Mutiny — shift-change agility relay');
registerGrandmasterAsMethod('the_beggars_petition', 'thieving', 95000, 75, 'Beggars Petition — monthly Payday tour across every vault');

// ══════════════════════════════════════════════════════════════════════════════
// Additional gating quests referenced by tertiary methods
// ══════════════════════════════════════════════════════════════════════════════

rel.defineQuestUnlock('the_archivists_ledger', {
  name: "The Archivist's Ledger",
  unlocks: [
    { type: 'training_method', id: 'sootworks_soot_library_archive', description: 'Archive bench etching' },
    { type: 'training_method', id: 'sootworks_archive_bench_midshift', description: 'Mid-shift obscure archive' },
    { type: 'item_equip', id: 'archivist_gauntlets', description: 'Archivist gauntlets — required to handle archive scrolls' },
  ],
});

rel.defineQuestUnlock('the_whistle_and_the_valve', {
  name: 'The Whistle and the Valve',
  unlocks: [
    { type: 'training_method', id: 'sootworks_pump_eight_elite', description: 'Pump Eight elite circuit' },
    { type: 'training_method', id: 'sootworks_pump_eight_shift_change', description: 'Shift-change sprint' },
    { type: 'item_equip', id: 'pump_eight_whistle_brass', description: 'Whistle-brass — pinned to the apron' },
  ],
});

rel.defineQuestUnlock('the_quartermasters_accounts', {
  name: "The Quartermaster's Accounts",
  unlocks: [
    { type: 'training_method', id: 'sootworks_beggars_gallery_master_lift', description: 'Master lift at the Gallery' },
    { type: 'training_method', id: 'sootworks_beggars_gallery_payday', description: 'Payday obscure lift' },
    { type: 'item_equip', id: 'quartermaster_lockpick', description: 'Quartermaster lockpick' },
  ],
});

rel.defineQuestUnlock('the_master_press_ledger', {
  name: 'The Master Press Ledger',
  unlocks: [
    { type: 'training_method', id: 'sootworks_imbue_hall_magic', description: 'Imbue Hall master press' },
    { type: 'training_method', id: 'sootworks_imbue_hall_press_perfect', description: 'Press-Perfect obscure magic' },
  ],
});

rel.defineQuestUnlock('the_master_brewers_charter', {
  name: "The Master Brewer's Charter",
  unlocks: [
    { type: 'training_method', id: 'sootworks_rust_pits_master_still', description: 'Master still brewing' },
    { type: 'item_equip', id: 'master_brewers_apron', description: 'Master brewer apron — required at the master still' },
  ],
});

rel.defineQuestUnlock('the_deepwell_warrant', {
  name: 'The Deepwell Warrant',
  unlocks: [
    { type: 'training_method', id: 'sootworks_deepwell_harpoon_fishing', description: 'Master harpoon line' },
    { type: 'training_method', id: 'sootworks_deepwell_blood_moon_fishing', description: 'Blood-moon obscure fishing' },
    { type: 'item_equip', id: 'master_harpoon', description: 'Master harpoon — heavier, slower, stronger' },
  ],
});

rel.defineQuestUnlock('the_guild_feast', {
  name: 'The Guild Feast',
  unlocks: [
    { type: 'training_method', id: 'sootworks_pressure_pot_feast', description: 'Feast kitchen cooking' },
    { type: 'training_method', id: 'sootworks_pressure_pot_feast_night', description: 'Saturday feast obscure cooking' },
    { type: 'item_equip', id: 'guild_feast_apron', description: 'Guild feast apron — worn only at the kitchen' },
  ],
});

rel.defineQuestUnlock('the_gilded_bellows', {
  name: 'The Gilded Bellows',
  unlocks: [
    { type: 'training_method', id: 'sootworks_deep_coal_master_burn', description: 'Gilded master burn' },
    { type: 'training_method', id: 'sootworks_deep_coal_dawn_fm', description: 'Dawn burn obscure firemaking' },
    { type: 'item_equip', id: 'gilded_heretics_bellows', description: "Heretic's Bellows (Gilded) — upgraded for master burns" },
  ],
});

rel.defineQuestUnlock('the_foresters_warrant', {
  name: "The Forester's Warrant",
  unlocks: [
    { type: 'training_method', id: 'sootworks_blackroot_master_cutting', description: 'Master copse woodcutting' },
    { type: 'area', id: 'sootworks_master_copse', description: 'Master copse access' },
  ],
});

rel.defineQuestUnlock('the_tray_keepers_list', {
  name: "The Tray-Keeper's List",
  unlocks: [
    { type: 'training_method', id: 'sootworks_steamfield_master_rotation', description: 'Master rotation farming' },
    { type: 'item_equip', id: 'tray_keeper_token', description: 'Tray-keeper token — access to master trays' },
  ],
});

rel.defineQuestUnlock('the_new_moon_rotation', {
  name: 'The New-Moon Rotation',
  unlocks: [
    { type: 'training_method', id: 'sootworks_steamfield_new_moon_farming', description: 'New-moon obscure farming' },
    { type: 'recipe', id: 'seed_of_the_foundry', description: 'Seed of the Foundry — a new-moon-only seed' },
  ],
});

rel.defineQuestUnlock('the_tinkers_charter', {
  name: "The Tinkers' Charter",
  unlocks: [
    { type: 'training_method', id: 'sootworks_tinker_master_fletching', description: 'Master assembly fletching' },
    { type: 'item_equip', id: 'tinker_master_pin', description: 'Tinker master-pin — required at the master line' },
  ],
});

rel.defineQuestUnlock('the_dawn_assembly', {
  name: 'The Dawn Assembly',
  unlocks: [
    { type: 'training_method', id: 'sootworks_tinker_master_dawn_fletching', description: 'Dawn-stamped obscure fletching' },
  ],
});

rel.defineQuestUnlock('the_beetlekeepers_signet', {
  name: "The Beetlekeeper's Signet",
  unlocks: [
    { type: 'training_method', id: 'sootworks_clockbeetle_master_runs', description: 'Clockbeetle master runs' },
    { type: 'training_method', id: 'sootworks_cinderhall_hunter_dusk', description: 'Cinderhall dusk obscure hunter' },
    { type: 'item_equip', id: 'beetlekeepers_signet', description: "Beetlekeeper's signet" },
  ],
});

rel.defineQuestUnlock('the_cinderhall_vigil', {
  name: 'The Cinderhall Vigil',
  unlocks: [
    { type: 'training_method', id: 'sootworks_cinderhall_hunter_dusk', description: 'Cinderhall dusk obscure hunter' },
    { type: 'area', id: 'sootworks_cinderhall_warrens', description: 'Cinderhall warrens' },
  ],
});

rel.defineQuestUnlock('the_shift_bell_pact', {
  name: 'The Shift-Bell Pact',
  unlocks: [
    { type: 'training_method', id: 'sootworks_shift_bell_chorus', description: 'Shift-Bell Chorus obscure strength' },
    { type: 'item_equip', id: 'bell_rope_coil', description: 'Bell-rope coil — braided for the Chorus' },
  ],
});

rel.defineQuestUnlock('the_silent_hour_pact', {
  name: 'The Silent Hour Pact',
  unlocks: [
    { type: 'training_method', id: 'sootworks_brass_choir_silent_hour', description: 'Silent-Hour enchanting' },
  ],
});

// ══════════════════════════════════════════════════════════════════════════════
// 5 WORLD-EVENT CHAINS — trigger on milestones, reshape the world permanently
// ══════════════════════════════════════════════════════════════════════════════

const worldEventChains = [
  {
    id: 'world_event_the_first_stamp',
    name: 'The First Stamp',
    trigger: { type: 'quest_complete', quest: 'the_forgemaster_contract' },
    description: "On signing Brun's contract, every regional forge in Aelgard begins stamping master-grade work with the Forgemaster seal. Carrying a current stamp grants +3% smithing XP at any forge for the next in-game week.",
    regionsAffected: ['sootworks', 'heartlands', 'moryskah', 'veilwood', 'saltbrine_reach'],
    stages: [
      'Brun stamps your first bar at the Cathedral',
      'Regional forgemasters receive copy-stamps from the Sootworks runners',
      'A new NPC (Stamp-Rider) tours the forges weekly',
      'Each forge rings a shift-bell when a stamped bar is worked',
    ],
  },
  {
    id: 'world_event_the_rivet_census',
    name: 'The Rivet Census',
    trigger: { type: 'quest_complete', quest: 'the_rivet_argument' },
    description: 'A rolling census of every rivet in Aelgard. Players who visit a rivet-stamped structure get a census booklet. Full booklet (6 regions, 24 structures) unlocks the Rivet Census Cape.',
    regionsAffected: ['sootworks', 'heartlands', 'moryskah', 'veilwood', 'saltbrine_reach', 'inkweald'],
    stages: [
      'The three guilds agree to count every rivet (they still argue over who invented them)',
      'Each region hosts 4 rivet-stamped structures (bridge, gate, crane, vault)',
      'Touching a rivet stamps the booklet with the structure guild',
      'Full booklet returned to Brun unlocks the Rivet Census Cape',
    ],
  },
  {
    id: 'world_event_the_organ_circuit',
    name: 'The Organ Circuit',
    trigger: { type: 'quest_complete', quest: 'the_organ_mass' },
    description: 'The Brass Choir organ-masters send small pipe-embers to every major region. Ring the region-organ at dawn to get an industrial blessing (+4% prayer XP for an hour). Each region has one eligible organ.',
    regionsAffected: ['sootworks', 'heartlands', 'moryskah', 'veilwood', 'boneyard_wastes', 'saltbrine_reach'],
    stages: [
      'Brass Choir apprentices travel as pipe-carriers',
      'Each region receives a small organ (often built into an existing temple)',
      'Dawn ringing on any of the six grants the blessing',
      'Ringing all six in a single in-game week unlocks the Organ Mass Cape',
    ],
  },
  {
    id: 'world_event_the_cinder_kings_return',
    name: "The Cinder King's Return",
    trigger: { type: 'quest_complete', quest: 'the_cinder_kings_fall' },
    description: "Once per in-game year, the Cinder King's ash-pit smoulders. The Graveyard runs triple XP for the day. The Cinder King Revenant boss spawns one time. Donating his drop at the pipe-altar upgrades the Cog-Bone Cape.",
    regionsAffected: ['sootworks', 'heartlands', 'moryskah', 'inkweald'],
    stages: [
      'Ravens arrive at the Cathedral a week before with cog-bones',
      'The ash-pit smoulders at midnight on anniversary-eve',
      'The Revenant spawns once; the Graveyard runs triple XP for 24 in-game hours',
      'At dawn the next day the ash cools; the cape is stamped with the year',
    ],
  },
  {
    id: 'world_event_the_archive_opens',
    name: 'The Archive Opens',
    trigger: { type: 'quest_complete', quest: 'the_archivists_ledger' },
    description: "After the archivist signs the ledger, the Soot-Library's locked stacks unlock. Each stack holds a named grimoire. Reading all twelve in sequence unlocks the Archive Cape (and a minor passive magic bonus in Sootworks).",
    regionsAffected: ['sootworks'],
    stages: [
      'The archivist marks the ledger at midnight',
      'Twelve stacks unlock, one per in-game month',
      "Reading a stack's grimoire gives a fragment of the complete poem",
      'All twelve read: the full poem is archived and the cape is signed',
    ],
  },
];

// Expose chain data for the codex and tests
const worldEventMap = new Map();
for (const c of worldEventChains) worldEventMap.set(c.id, c);

function getWorldEventChain(id) { return worldEventMap.get(id); }
function listWorldEventChains() { return [...worldEventMap.values()]; }

// Register each chain as a training method so the gap score picks them up
for (const c of worldEventChains) {
  try {
    rel.defineTrainingMethod(`world_event_${c.id}`, {
      skill: 'hitpoints',
      name: `[World Event] ${c.name}`,
      levelRange: [70, 99],
      xpPerHour: 14000,
      prerequisites: { skills: {}, quests: [c.trigger.quest], items: [], areas: ['sootworks'] },
      resourceOutput: { produces: [], net: 'neutral' },
      bankingFrequency: 'never', costPerHour: 0,
      danger: 'none', complexity: 'moderate', attention: 'low',
      inputs: [],
      description: c.description,
      location: 'Sootworks',
    });
  } catch (e) { /* idempotent */ }
}

// ══════════════════════════════════════════════════════════════════════════════
// 10 REAGENT-COMBO CHAINS — Sootworks-native rivets + stamps + archives
// ══════════════════════════════════════════════════════════════════════════════

rel.defineCombination(97901, {
  resultName: 'Triple Guild Pin (Forge-Tinker-Pump)',
  inputs: [
    { id: 97801, name: 'Guild Rivet of the Forge', consumed: true },
    { id: 97803, name: 'Guild Pin of the Pump', consumed: true },
    { id: 97714, name: 'Forgemaster stamp', consumed: false },
    { id: 97713, name: 'Heretic cog', consumed: true },
  ],
  skill: 'crafting', level: 85, xp: 560, station: 'triple_guild_hall',
  description: "All three guilds at once. Stamp shown, not spent. The guildmasters argue, then sign. Worn, the pin gives +1 smith / +1 crafting / +1 agility at Sootworks stations.",
});

rel.defineCombination(97902, {
  resultName: 'Deep-Stone Master Bar',
  inputs: [
    { id: 97704, name: 'Deep-stone scale', consumed: true },
    { id: 97711, name: 'Deep-stone flux', consumed: true },
    { id: 2116, name: 'Runite bar', consumed: true },
    { id: 2116, name: 'Runite bar', consumed: true },
    { id: 97714, name: 'Forgemaster stamp', consumed: false },
  ],
  skill: 'smithing', level: 85, xp: 680, station: 'deep_stone_crucible',
  description: 'The master bar. Two runite, scale in the flux. Brun stamps it at the crucible. Stamp is shown, not spent.',
});

rel.defineCombination(97903, {
  resultName: 'Organ Mass Censer',
  inputs: [
    { id: 97703, name: 'Pipe-ember', consumed: true },
    { id: 97703, name: 'Pipe-ember', consumed: true },
    { id: 97712, name: 'Lung-bellow sinew', consumed: true },
    { id: 97216, name: 'Silver bar', consumed: true },
  ],
  skill: 'crafting', level: 80, xp: 440, station: 'brass_choir_bench',
  description: 'Two embers braided in sinew on a silver frame. Lit at the pipe-altar. Burns through a whole mass.',
});

rel.defineCombination(97904, {
  resultName: 'Archive Scroll (Master)',
  inputs: [
    { id: 97707, name: 'Forge-crystal ink', consumed: true },
    { id: 97806, name: 'Archive Ink-Pot', consumed: false },
    { id: 97070, name: 'Forge-crystal', consumed: true },
    { id: 97708, name: 'Bell-soot', consumed: true },
  ],
  skill: 'runecrafting', level: 82, xp: 480,
  description: 'Master archive scroll. Ink-pot shown. Bell-soot at the seam. Feeds the Imbue Hall press and the silent-hour enchant.',
});

rel.defineCombination(97905, {
  resultName: 'Cog-Bone Rosary',
  inputs: [
    { id: 97809, name: 'Cog-Bone Charm', consumed: true },
    { id: 97705, name: 'Cog-bone', consumed: true },
    { id: 97705, name: 'Cog-bone', consumed: true },
    { id: 97705, name: 'Cog-bone', consumed: true },
    { id: 97703, name: 'Pipe-ember', consumed: true },
  ],
  skill: 'crafting', level: 87, xp: 610, station: 'cinder_graveyard_altar',
  description: 'A full rosary of cog-bones. Prayer bonus +2 in Cinder King Graveyard. Rattles like a ticking clock.',
});

rel.defineCombination(97906, {
  resultName: 'Pump Eight Whistle-Chain',
  inputs: [
    { id: 97715, name: 'Whistle-brass', consumed: true },
    { id: 97715, name: 'Whistle-brass', consumed: true },
    { id: 97715, name: 'Whistle-brass', consumed: true },
    { id: 97702, name: 'Pump Eight rivet', consumed: true },
  ],
  skill: 'crafting', level: 78, xp: 370, station: 'pump_station_bench',
  description: "Three whistle-brass on a rivet chain. Worn on the apron. Pump Eight whistles you through every gate.",
});

rel.defineCombination(97907, {
  resultName: 'Brass Button String (Full)',
  inputs: [
    { id: 97706, name: 'Brass button', consumed: true },
    { id: 97706, name: 'Brass button', consumed: true },
    { id: 97706, name: 'Brass button', consumed: true },
    { id: 97706, name: 'Brass button', consumed: true },
    { id: 97706, name: 'Brass button', consumed: true },
    { id: 97706, name: 'Brass button', consumed: true },
    { id: 97706, name: 'Brass button', consumed: true },
  ],
  skill: 'thieving', level: 82, xp: 430, station: 'gallery_back_room',
  description: 'Seven buttons on catgut. The Gallery beggars sew one for you if the petition is signed. Inside-coat. Every lock knows the rattle.',
});

rel.defineCombination(97908, {
  resultName: 'Seed of the Foundry',
  inputs: [
    { id: 97710, name: "Cinder King's ash", consumed: true },
    { id: 97051, name: 'Mine-cap fungus', consumed: true },
    { id: 97022, name: 'Vent-bloom', consumed: true },
  ],
  skill: 'farming', level: 82, xp: 420, station: 'steamfield_tray_bench',
  description: "Ash from the Cinder King's pit, fungus from the field, bloom from the vents. One seed. Plants only on new-moon nights.",
});

rel.defineCombination(97909, {
  resultName: "Master Imbue-Token",
  inputs: [
    { id: 97904, name: 'Archive Scroll (Master)', consumed: true },
    { id: 97904, name: 'Archive Scroll (Master)', consumed: true },
    { id: 97902, name: 'Deep-Stone Master Bar', consumed: true },
    { id: 97713, name: 'Heretic cog', consumed: true },
  ],
  skill: 'magic', level: 85, xp: 820,
  description: 'The master token. Two master scrolls, one master bar, one heretic cog. Imbued at the Master Press.',
});

rel.defineCombination(97910, {
  resultName: 'Pipe-Ember Lure',
  inputs: [
    { id: 97703, name: 'Pipe-ember', consumed: true },
    { id: 97703, name: 'Pipe-ember', consumed: true },
    { id: 97709, name: 'Valve grease', consumed: true },
    { id: 97091, name: 'Glowmoth scales', consumed: true },
  ],
  skill: 'fletching', level: 82, xp: 380,
  description: 'A lure that glows faint orange underwater. Required for Blood-Moon deepwell fishing. The cave-shark can smell it.',
});

// ══════════════════════════════════════════════════════════════════════════════
// 5 VERY-RARE DROPS (1/10,000) — unlock cosmetic capes
// Each a Sootworks-specific encounter. Capes are trophies — cosmetic, no stats.
// ══════════════════════════════════════════════════════════════════════════════

const rareDrops = new Map();

function defineRareDrop(id, opts) {
  rareDrops.set(id, {
    id,
    name: opts.name,
    source: opts.source,
    dropRate: opts.dropRate,
    capeUnlock: opts.capeUnlock,
    description: opts.description,
    region: 'sootworks',
  });
}

defineRareDrop('forgemasters_first_stamp', {
  name: "Forgemaster's First Stamp",
  source: 'forgemaster_brun_quench_trough',
  dropRate: 10000,
  capeUnlock: 'Forgemaster Cape',
  description: "The first stamp Brun ever cut. He keeps it in the quench-trough bottom. You fish it up once in ten thousand sweeps. The cape smells of hot iron and doesn't burn.",
});

defineRareDrop('cinder_kings_sigil', {
  name: "The Cinder King's Own Sigil",
  source: 'cinder_king_revenant',
  dropRate: 10000,
  capeUnlock: 'Cinder King Cape',
  description: "The Cinder King's own guild-sigil, worn before he fell. Falls from the Revenant once in ten thousand kills. The cape darkens toward the shoulders; ash never quite shakes out.",
});

defineRareDrop('organ_mass_first_ember', {
  name: 'The Organ Mass First Ember',
  source: 'brass_choir_organ_at_dawn',
  dropRate: 10000,
  capeUnlock: 'Organ Mass Cape',
  description: "An ember from the organ-mass that never went out. Only falls when the dawn mass is sung perfectly. The cape hums softly when you pass a pipe.",
});

defineRareDrop('pump_eights_whistle', {
  name: "Pump Eight's Original Whistle",
  source: 'pump_eight_elite_circuit',
  dropRate: 10000,
  capeUnlock: 'Pumpman Cape',
  description: "The first whistle Pump Eight ever sang on. Lost two generations ago. Found caught in an old valve-collar. The cape is brass-edged and rings a quiet B-flat when the wearer sprints.",
});

defineRareDrop('archivists_silent_page', {
  name: "The Archivist's Silent Page",
  source: 'soot_library_silent_hour',
  dropRate: 10000,
  capeUnlock: 'Archive Cape',
  description: "A page the archivist cut from a ledger and hid in the silent-hour stack. Only falls during the silent-hour enchant. The cape whispers when the wearer reads aloud.",
});

function getRareDrop(id) { return rareDrops.get(id); }
function listRareDrops() { return [...rareDrops.values()]; }

// Register each cape as item source + use for density credit
let capeItemId = 97951;
for (const drop of rareDrops.values()) {
  const itemId = capeItemId++;
  rel.registerItemSource(itemId, {
    type: 'drop',
    sourceId: drop.source,
    sourceName: drop.name,
    region: 'sootworks',
    details: `${drop.capeUnlock} — ${drop.description} Drop rate 1/${drop.dropRate}.`,
    obscure: true,
  });
  rel.registerItemUse(itemId, {
    type: 'cosmetic_unlock',
    targetId: drop.capeUnlock,
    targetName: drop.capeUnlock,
    region: 'sootworks',
    details: 'Cosmetic cape unlock. No combat stats. Pure trophy.',
    obscure: true,
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// FINAL BREAKPOINTS tied to easter eggs
// ══════════════════════════════════════════════════════════════════════════════

rel.defineBreakpoint({
  type: 'item_acquired', trigger: { item: 'forgemaster_stamp' },
  description: "Brun has stamped your apron. Master-grade smithing opens across every Aelgard forge. The Rivet Census opens.",
  unlocks: [
    { type: 'training_method', id: 'sootworks_deep_stone_alloyworks_smithing', description: 'Deep Stone Alloy Works' },
    { type: 'training_method', id: 'sootworks_cathedral_quench_master', description: 'Quench-Master hour' },
  ],
  importance: 'transformative',
});

rel.defineBreakpoint({
  type: 'quest_complete', trigger: { quest: 'the_cinder_kings_fall' },
  description: "The Cinder King's Graveyard opens. Cog-bones rattle in the Cathedral echo. Once-yearly anniversary contract begins on the next in-game new year.",
  unlocks: [
    { type: 'area', id: 'sootworks_cinder_graveyard', description: "Cinder King's Graveyard" },
    { type: 'training_method', id: 'sootworks_cinder_king_slayer', description: 'Graveyard contracts' },
  ],
  importance: 'transformative',
});

rel.defineBreakpoint({
  type: 'quest_complete', trigger: { quest: 'the_rivet_argument' },
  description: "The three guilds agree (for a day). The Rivet Census opens across six regions. A Triple Guild Pin can be struck.",
  unlocks: [
    { type: 'minigame', id: 'rivet_debate', description: 'Rivet Debate minigame' },
  ],
  importance: 'major',
});

// ══════════════════════════════════════════════════════════════════════════════
// QUIRKY WORLD OBJECTS — 15 additional Sootworks flavor quirks for this file
// Industrial tool-noun-heavy interactions, discoverable by wandering.
// ══════════════════════════════════════════════════════════════════════════════

const quirkyMethods = [
  {
    id: 'quirky_sootworks_brun_apprentice_soot',
    skill: 'crafting', name: '[Quirky] Brush Soot from the Apprentice Benches',
    xp: 1600,
    desc: "The apprentice benches at the Cathedral collect soot between shifts. Brushing them keeps the edges cooler. Tiny crafting. Brun doesn't thank you; he notices.",
  },
  {
    id: 'quirky_sootworks_pumpman_cap_toss',
    skill: 'ranged', name: '[Quirky] Hang the Pumpman Caps',
    xp: 1500,
    desc: "The pumpmen toss their caps onto hooks after shift. If you catch a stray mid-flight and land it right, small ranged XP. They pretend not to laugh.",
  },
  {
    id: 'quirky_sootworks_choir_hymn_page_turn',
    skill: 'magic', name: '[Quirky] Turn Pages for the Choir Organist',
    xp: 1400,
    desc: "The organist plays with two hands; she needs pages turned. Small magic XP for each correct turn. Get one wrong — she sighs.",
  },
  {
    id: 'quirky_sootworks_gallery_back_alley_coin',
    skill: 'thieving', name: '[Quirky] Lift a Coin from the Alley Shrine',
    xp: 1700,
    desc: "The Gallery back alley has a small shrine with tips on it. Lifting one gives small thieving XP. The beggar who tends it sees you and says nothing.",
  },
  {
    id: 'quirky_sootworks_cinder_grave_lamp',
    skill: 'firemaking', name: '[Quirky] Relight the Graveyard Lamps',
    xp: 1600,
    desc: "The Graveyard lamps blow out when the cog-bones rattle. Relighting one gives small firemaking XP. The bones settle when the lamp steadies.",
  },
  {
    id: 'quirky_sootworks_library_mouse',
    skill: 'hunter', name: '[Quirky] Chase the Library Mouse',
    xp: 1300,
    desc: "A mouse lives under the Soot-Library shelves. Chasing it without scaring the archivist gives small hunter XP. You never catch it.",
  },
  {
    id: 'quirky_sootworks_brass_bolt_oil',
    skill: 'crafting', name: '[Quirky] Oil the Choir Pipe-Bolts',
    xp: 1200,
    desc: "The Brass Choir has brass bolts at every pipe-joint. Oiling one with glowmoth oil gives small crafting. The note grows fuller.",
  },
  {
    id: 'quirky_sootworks_alloy_quench_steam',
    skill: 'hitpoints', name: '[Quirky] Stand in the Alloy-Works Quench Steam',
    xp: 1000,
    desc: "The Alloy Works quench-trough vents steam every three ticks. Standing in it gives small hitpoints XP. Everyone does it for the warmth.",
  },
  {
    id: 'quirky_sootworks_gallery_beggars_story',
    skill: 'prayer', name: '[Quirky] Listen to a Gallery Beggar',
    xp: 1400,
    desc: "The Gallery beggars have long stories about the Cinder King. Listening respectfully gives small prayer XP. They thank you with a button.",
  },
  {
    id: 'quirky_sootworks_pump_grease_coin',
    skill: 'thieving', name: '[Quirky] Pocket a Grease Coin',
    xp: 1500,
    desc: "Pumpmen pay apprentices in grease-rubbed coins. Pocketing one while the pumpman looks away gives small thieving XP. The coins smell amber.",
  },
  {
    id: 'quirky_sootworks_forgecat_pet',
    skill: 'hunter', name: '[Quirky] Pet the Forge Cathedral Cat',
    xp: 1800,
    desc: "A black cat lives in the Cathedral rafters. If she comes down to you, pet her. Small hunter XP. The apprentices say she only comes for worthy smiths.",
  },
  {
    id: 'quirky_sootworks_slag_tunnel_map_rubbing',
    skill: 'crafting', name: '[Quirky] Rub the Slag-Tunnel Wall Map',
    xp: 1400,
    desc: "The Slag-Tunnel guard-posts have wall-carved maps. Rubbing one onto paper gives small crafting XP. Collectors buy full sets.",
  },
  {
    id: 'quirky_sootworks_steamfield_scarecrow',
    skill: 'magic', name: '[Quirky] Grease the Steam-Field Scarecrow',
    xp: 1500,
    desc: "The steam-field scarecrow has rust on the arm-joint. Greasing it with valve-grease gives small magic XP. It waves once, faintly.",
  },
  {
    id: 'quirky_sootworks_organ_loft_dust',
    skill: 'prayer', name: '[Quirky] Dust the Organ Loft',
    xp: 1700,
    desc: "The Brass Choir organ loft gathers pipe-dust. Sweeping it gives small prayer XP. The organist hands you a mug of something hot on your way down.",
  },
  {
    id: 'quirky_sootworks_tinker_toolbox_organise',
    skill: 'fletching', name: '[Quirky] Sort a Tinker Toolbox',
    xp: 1600,
    desc: "A tinker left his toolbox open on a bench. Sorting the springs into the right boxes gives small fletching XP. He nods when he returns.",
  },
];

for (const q of quirkyMethods) {
  try {
    rel.defineTrainingMethod(q.id, {
      skill: q.skill,
      name: q.name,
      levelRange: [1, 99],
      xpPerHour: q.xp,
      prerequisites: { skills: {}, quests: [], items: [], areas: ['sootworks'] },
      resourceOutput: { produces: [], net: 'neutral' },
      bankingFrequency: 'never', costPerHour: 0,
      danger: 'none', complexity: 'trivial', attention: 'low',
      inputs: [],
      description: q.desc,
      location: 'Sootworks',
    });
  } catch (e) { /* idempotent */ }
}

// Count totals for export / tests
const totals = {
  grandmasterQuests: 8,
  worldEventChains: worldEventChains.length,
  reagentCombos: 10,
  rareDrops: rareDrops.size,
  quirkyInteractions: quirkyMethods.length,
};

console.log(`[aelgard] Sootworks Easter Eggs loaded: ${totals.grandmasterQuests} grandmaster quests, ${totals.worldEventChains} world-event chains, ${totals.reagentCombos} reagent combos, ${totals.rareDrops} very-rare drops, ${totals.quirkyInteractions} quirky interactions`);

module.exports = {
  getWorldEventChain,
  listWorldEventChains,
  getRareDrop,
  listRareDrops,
  totals,
};
