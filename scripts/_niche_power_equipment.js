// ══════════════════════════════════════════════════════════════════════════════
// _niche_power_equipment.js — one-shot codemod for v0.9-waveC niche-power
//
// Adds a damage_multipliers field to every item in data/items/equipment.json.
//
// Default multipliers (all 1.0):
//   demons, undead, dragons, kalphites, vampyres, slayer_monsters,
//   bosses, magic_users
//
// Encounter-specific BiS weapons (per v0.9-waveC task #19 niche-power spec,
// Marstead Pillar 4 — power is a vector, not a scalar):
//   arclight              -> demons 1.7 (BiS vs demons, flagged in tags)
//   twisted_bow           -> magic_users 1.5 (scales with target magic)
//   scythe_of_vitur       -> bosses 1.4, undead 1.2 (multi-target raid boss weapon)
//   tumekens_shadow       -> magic_users 1.4 (staff dmg multiplier)
//   bone_dagger           -> undead 1.3 (bone-shattering spec)
//
// Additional niche matrix derived from item tags + names (conservative):
//   *barrows* (dharoks/ahrims/karils) -> slayer_monsters 1.05
//   *fire_cape* / *infernal_cape*      -> demons 1.1 (fire-themed vs cold demons)
//
// Writes equipment.json in-place with the new field.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const fs = require('fs');
const path = require('path');

const EQUIP_PATH = path.join(__dirname, '..', 'data', 'items', 'equipment.json');

const DEFAULT_MULTIPLIERS = {
  demons: 1.0,
  undead: 1.0,
  dragons: 1.0,
  kalphites: 1.0,
  vampyres: 1.0,
  slayer_monsters: 1.0,
  bosses: 1.0,
  magic_users: 1.0,
};

// Encounter-specific BiS overrides. Keys == item.id. Values merged over defaults.
const NICHE_OVERRIDES = {
  // v0.7 flagged BiS niche weapons
  arclight: { demons: 1.7 },
  twisted_bow: { magic_users: 1.5, bosses: 1.1 },
  scythe_of_vitur: { bosses: 1.4, undead: 1.2 },
  tumekens_shadow: { magic_users: 1.4, bosses: 1.15 },
  bone_dagger: { undead: 1.3 },

  // Silverlight-family / holy-fire weapons implied by examine/tags are
  // not present in the current equipment.json (dragon_hunter_lance, silverlight,
  // keris are itemDB entries, not equipment tier-gear). We leave them out so
  // this codemod is idempotent against the current 431-item shape.

  // Fire-themed capes: minor bonus vs demons (fire-aspect coherence with OSRS).
  fire_cape:     { demons: 1.1 },
  infernal_cape: { demons: 1.15, bosses: 1.05 },

  // Barrows set pieces: minor slayer-monster bonus (wiki-parity).
  dharoks_helm:        { slayer_monsters: 1.05 },
  dharoks_platebody:   { slayer_monsters: 1.05 },
  dharoks_platelegs:   { slayer_monsters: 1.05 },
  dharoks_greataxe:    { slayer_monsters: 1.1, undead: 1.05 },
  ahrims_hood:         { slayer_monsters: 1.05 },
  ahrims_robetop:      { slayer_monsters: 1.05 },
  ahrims_robebottom:   { slayer_monsters: 1.05 },
  ahrims_staff:        { slayer_monsters: 1.1, magic_users: 1.05 },
  karils_coif:         { slayer_monsters: 1.05 },
  karils_body:         { slayer_monsters: 1.05 },
  karils_skirt:        { slayer_monsters: 1.05 },
  karils_crossbow:     { slayer_monsters: 1.1 },

  // Dragonsteel tier weapons: implicit dragon-killer lineage (name).
  dragonsteel_dagger:     { dragons: 1.05 },
  dragonsteel_shortsword: { dragons: 1.05 },
  dragonsteel_longsword:  { dragons: 1.05 },
  dragonsteel_scimitar:   { dragons: 1.05 },
  dragonsteel_mace:       { dragons: 1.05 },
  dragonsteel_battleaxe:  { dragons: 1.05 },
  dragonsteel_warhammer:  { dragons: 1.05 },
  dragonsteel_two_hander: { dragons: 1.08 },
  dragonsteel_halberd:    { dragons: 1.08 },
  dragonsteel_spear:      { dragons: 1.05 },

  // Wyrmforged tier: dragon-scale forged, strong vs dragons.
  wyrmforged_dagger:      { dragons: 1.1 },
  wyrmforged_shortsword:  { dragons: 1.1 },
  wyrmforged_longsword:   { dragons: 1.1 },
  wyrmforged_scimitar:    { dragons: 1.1 },
  wyrmforged_mace:        { dragons: 1.1 },
  wyrmforged_battleaxe:   { dragons: 1.1 },
  wyrmforged_warhammer:   { dragons: 1.1 },
  wyrmforged_two_hander:  { dragons: 1.15 },
  wyrmforged_halberd:     { dragons: 1.15 },
  wyrmforged_spear:       { dragons: 1.1 },

  // Moryskah Lichbane / Boneyard Mummy Wrap / Saltbrine Drowner Amulet niche bibs
  moryskah_lichbane_pendant: { undead: 1.15, vampyres: 1.1 },
  boneyard_mummy_wrap:       { undead: 1.1 },
  saltbrine_drowner_amulet:  { bosses: 1.05 },
  veilwood_moon_circlet:     { vampyres: 1.1 },
  wilds_corrupted_ring:      { bosses: 1.05, demons: 1.05 },
  inkweald_bound_tome:       { magic_users: 1.1 },
  heartlands_champion_crest: { bosses: 1.05 },
  glass_prism_shield:        { dragons: 1.05, magic_users: 1.05 },
  sootworks_forge_gauntlets: { bosses: 1.05 },

  // Occult / magic amulets: small magic_users bump
  occult_necklace:         { magic_users: 1.05 },
  amulet_of_torture:       { bosses: 1.03 },
  necklace_of_anguish:     { bosses: 1.03 },
};

function buildMultipliers(id, item) {
  const out = { ...DEFAULT_MULTIPLIERS };
  const override = NICHE_OVERRIDES[id];
  if (override) Object.assign(out, override);
  return out;
}

function main() {
  const items = JSON.parse(fs.readFileSync(EQUIP_PATH, 'utf8'));
  let touched = 0;
  let niche = 0;
  for (const item of items) {
    if (!item.id) continue;
    item.damage_multipliers = buildMultipliers(item.id, item);
    touched++;
    // Count niche = any key != 1.0
    if (Object.values(item.damage_multipliers).some(v => v !== 1.0)) niche++;
  }
  fs.writeFileSync(EQUIP_PATH, JSON.stringify(items, null, 2) + '\n');
  console.log(`[niche-equipment] tagged ${touched}/${items.length} equipment items`);
  console.log(`[niche-equipment] ${niche} items have at least one non-1.0 multiplier (niche BiS)`);
  console.log(`[niche-equipment] encounter-specific BiS flagged: ${Object.keys(NICHE_OVERRIDES).length} items`);
}

main();
