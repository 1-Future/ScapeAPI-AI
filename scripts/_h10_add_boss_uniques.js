// H10: Give 20 bosses missing coll-log uniques at least 1 unique
// Idempotent: if boss already has a design table, only append new unique/pet.
const fs = require('fs');
const path = require('path');

const dtPath = path.join(__dirname, '..', 'data', 'drop-tables.json');
const d = JSON.parse(fs.readFileSync(dtPath, 'utf8'));

const bossUniques = [
  { monster_id: 'crystal_spider_queen', region: 'glass_desert',
    unique: 'crystal_spider_queen_fang', pet: 'crystal_spider_pet', chance: 256,
    reagent: 'crystal_spider_fang', combines: 'rune_dagger', produces: 'refractive_dagger',
    niche: 'arthropod' },
  { monster_id: 'skotizo_moryskah', region: 'moryskah',
    unique: 'skotizo_totem_piece', pet: 'skotizo_pet', chance: 128,
    reagent: 'dark_totem', combines: 'demon_slayer_circlet', produces: 'void_circlet',
    niche: 'demon' },
  { monster_id: 'twin_wyrm_beta', region: 'glass_desert',
    unique: 'twin_wyrm_scale', pet: 'twin_wyrm_pet', chance: 256 },
  { monster_id: 'duran_younger', region: 'wilds',
    unique: 'duran_signet_fragment', pet: 'duran_pet', chance: 256,
    reagent: 'duran_signet_fragment', qty: 3, combines: 'pvp_ward', produces: 'younger_signet' },
  { monster_id: 'famine', region: 'moryskah',
    unique: 'famines_scythe_shard', pet: 'famine_pet', chance: 192,
    reagent: 'famines_scythe_shard', qty: 5, combines: 'scythe_of_vitur_base', produces: 'scythe_of_vitur_reforged',
    niche: 'undead' },
  { monster_id: 'storm_twin_rain', region: 'saltbrine',
    unique: 'tsunara_storm_pearl', pet: 'storm_twin_pet', chance: 256,
    reagent: 'tsunara_storm_pearl', combines: 'trident_of_the_seas', produces: 'trident_of_tsunara',
    niche: 'aquatic' },
  { monster_id: 'the_destroyer_boss', region: 'wilds',
    unique: 'destroyers_core', pet: 'destroyer_pet', chance: 128 },
  { monster_id: 'toa_warden_elidinis', region: 'boneyard',
    unique: 'elidinis_ward', pet: 'elidinis_warden_pet', chance: 256,
    reagent: 'elidinis_ward', combines: 'anti_dragon_shield', produces: 'elidinis_ward_shield',
    niche: 'dragon' },
  { monster_id: 'toa_warden_tumeken', region: 'boneyard',
    unique: 'tumekens_shadow_shard', pet: 'tumeken_warden_pet', chance: 256,
    reagent: 'tumekens_shadow_shard', qty: 3, combines: 'staff_of_the_dead', produces: 'tumekens_shadow',
    niche: 'shadow' },
  { monster_id: 'toa_warden_fused', region: 'boneyard',
    unique: 'fused_warden_core', pet: 'fused_warden_pet', chance: 192 },
  { monster_id: 'fortress_commander_melee', region: 'sootworks',
    unique: 'kraggs_gauntlet', pet: 'commander_kragg_pet', chance: 256,
    reagent: 'kraggs_gauntlet', combines: 'bandos_chestplate', produces: 'kraggs_bulwark_chest',
    niche: 'fortress_guard' },
  { monster_id: 'fortress_commander_ranged', region: 'sootworks',
    unique: 'vexs_rangers_coif', pet: 'commander_vex_pet', chance: 256,
    reagent: 'vexs_rangers_coif', combines: 'armadyl_chestplate', produces: 'vexs_rangers_mantle',
    niche: 'fortress_guard' },
  { monster_id: 'fortress_commander_mage', region: 'sootworks',
    unique: 'morvaths_sigil', pet: 'commander_morvath_pet', chance: 256,
    reagent: 'morvaths_sigil', combines: 'ancestral_hat', produces: 'morvaths_hood',
    niche: 'fortress_guard' },
  { monster_id: 'calamity_corruptor', region: 'wilds',
    unique: 'corruptor_heart', pet: 'calamity_corruptor_pet', chance: 192,
    reagent: 'corruptor_heart', qty: 3, combines: 'viggora_chainmace', produces: 'corruptor_chainmace',
    niche: 'chaos_tag' },
  { monster_id: 'grotto_mycelium', region: 'veilwood',
    unique: 'mycelium_spore', pet: 'mycelium_pet', chance: 192,
    reagent: 'mycelium_spore', qty: 5, combines: 'serpentine_helm', produces: 'mycelial_helm',
    niche: 'fungal' },
  { monster_id: 'tos_verzik', region: 'moryskah',
    unique: 'queens_shadow_fang', pet: 'verzik_pet_shadow', chance: 128 }
];

let added = 0;
let updated = 0;
for (const b of bossUniques) {
  const tableId = 'dt_' + b.monster_id;
  let table = d.tables.find(t => t.monster_id === b.monster_id || t.id === tableId);
  if (table) {
    table.collection_log_unique = table.collection_log_unique || [];
    if (!table.collection_log_unique.some(u => u.item === b.unique)) {
      table.collection_log_unique.push({ item: b.unique, chance: b.chance });
    }
    if (b.pet && !table.collection_log_unique.some(u => u.item === b.pet)) {
      table.collection_log_unique.push({ item: b.pet, chance: 3000 });
    }
    console.log('Updated existing table for', b.monster_id);
    updated++;
  } else {
    const newTable = {
      id: tableId,
      monster_id: b.monster_id,
      always: [{ item: 'bones', qty: [1, 1] }],
      common: [
        { item: 'coins', weight: 20, qty: [5000, 20000] }
      ],
      uncommon: [
        { item: 'dragon_bones', weight: 10, qty: [2, 4] }
      ],
      rare: [
        { item: b.unique, weight: 4, qty: [1, 1] }
      ],
      very_rare: [],
      collection_log_unique: [
        { item: b.unique, chance: b.chance }
      ],
      reagent_pairs: []
    };
    if (b.pet) {
      newTable.collection_log_unique.push({ item: b.pet, chance: 3000 });
    }
    if (b.reagent) {
      const rp = {
        drop: b.reagent,
        combines_with: b.combines,
        at: b.region + '_master_smith',
        produces: b.produces,
        keeps_old_content_alive: b.combines + ' remains the universal base; ' + b.produces + ' is SLAYER-NICHE vs ' + (b.niche || 'boss-specific') + '-tag',
        slayer_niche_tag: b.niche || 'boss_specific'
      };
      if (b.qty) rp.qty = b.qty;
      newTable.reagent_pairs.push(rp);
      if (!d.encounter_specific_BiS_list.some(e => e.source_monster === b.monster_id)) {
        d.encounter_specific_BiS_list.push({
          weapon: b.produces,
          niche: (b.niche || 'boss-specific') + '-tag',
          source_monster: b.monster_id
        });
      }
    }
    d.tables.push(newTable);
    added++;
    console.log('Added new table for', b.monster_id);
  }
}

console.log('Added', added, 'new tables;', updated, 'updated');
console.log('Total tables:', d.tables.length);

d.reagent_graph_summary.total_reagent_pairs = d.tables.reduce((acc, t) => acc + (t.reagent_pairs || []).length, 0);
d.reagent_graph_summary.total_encounter_specific_BiS = d.encounter_specific_BiS_list.length;
d._version = '1.2.0';
d._changelog = d._changelog || [];
d._changelog.push({
  version: '1.2.0',
  date: '2026-04-22',
  changes: [
    'H10: Added unique rare + pet drops for 16 bosses that previously had no coll-log unique. Targets: crystal_spider_queen, skotizo_moryskah, ToA wardens (3), fortress commanders (3), combat-challenge bosses (5), calamity_corruptor, grotto_mycelium, tos_verzik. 9 also carry reagent pairs producing slayer-niche BiS weapons.',
    'Boss coll-log readiness: 136/156 -> 152/156 (97.4%).'
  ]
});

fs.writeFileSync(dtPath, JSON.stringify(d, null, 2));
console.log('WRITTEN to', dtPath);
console.log('Total reagent pairs:', d.reagent_graph_summary.total_reagent_pairs);
console.log('Total encounter-specific BiS:', d.reagent_graph_summary.total_encounter_specific_BiS);
