// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — The Wilds Density Pass
//
// Closes gaps and adds higher-tier methods plus PvP-specific mechanics that
// push the gap score past 70. Follows the pattern of moryskah-density.js and
// glass-desert-density.js.
//
// Voice: cold clipped sentences. No mercy. Tiles from safety.
// "Twenty-three. Twenty-two. Now."
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const rel = require('../../data/relationships');

// ══════════════════════════════════════════════════════════════════════════════
// HIGHER-TIER METHODS — fill the 70-99 bracket everywhere the wilds flavor fits
// ══════════════════════════════════════════════════════════════════════════════

rel.defineTrainingMethod('wilds_thammaron_sceptre_magic', {
  skill: 'magic', name: "Thammaron's Sceptre — Deep Cast",
  levelRange: [60, 99],
  xpPerHour: 165000,
  prerequisites: { skills: { magic: 60 }, quests: [], items: [{ name: "Thammaron's sceptre" }], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Skull-gold coins', perHour: 320000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 90000,
  danger: 'high', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Revenant ether', perHour: 1200, source: 'wilds_revenant_hobgoblin' }, { name: 'Fire rune', perHour: 4000, source: 'runecrafting' }, { name: 'Blood rune', perHour: 2000, source: 'runecrafting' }],
  description: "Thammaron's sceptre. +50% accuracy and damage inside the wilds. Revenant targets. The sceptre drinks ether faster than any weapon.",
  location: 'The Wilds',
});

rel.defineTrainingMethod('wilds_vetion_melee_grind', {
  skill: 'attack', name: "Vet'ion — Skeleton Champion Grind",
  levelRange: [80, 99],
  xpPerHour: 145000,
  prerequisites: { skills: { attack: 80, defence: 75 }, quests: ['third_ditch_ordeal'], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: "Vet'ion ring shard", perHour: 0.4 }, { name: 'Skull-gold coins', perHour: 680000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 95000,
  danger: 'extreme', complexity: 'intense', attention: 'high',
  inputs: [{ name: 'Blighted shark', perHour: 200, source: 'wilds_stackable_food' }, { name: 'Super restore (4)', perHour: 12, source: 'herblore' }],
  description: "Vet'ion. Deep teleblocked wilds. Two phases, four skeletons summoned per phase. Drops Ring of the Long Road — teleport delay reduced two ticks.",
  location: 'The Wilds',
  breakpointAt: 80,
});

rel.defineTrainingMethod('wilds_exiled_champion_boss', {
  skill: 'strength', name: 'The Exiled Champion — Instance Fight',
  levelRange: [85, 99],
  xpPerHour: 165000,
  prerequisites: { skills: { strength: 85 }, quests: ['blade_of_the_wilds_second'], items: [], areas: ['the_wilds_exiled_camp'] },
  resourceOutput: { produces: [{ name: 'Blade shard', perHour: 1.2 }, { name: 'Skull-gold coins', perHour: 580000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 80000,
  danger: 'high', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Blighted shark', perHour: 160, source: 'wilds_stackable_food' }],
  description: 'The Exiled Champion. Instance inside the Exiled Camp — safe pocket in deep wilds. His blade is the original. He carries a piece of the blade you will inherit.',
  location: 'The Wilds',
});

rel.defineTrainingMethod('wilds_teleblocked_king_boss', {
  skill: 'hitpoints', name: 'The Teleblocked King — Throne Fight',
  levelRange: [90, 99],
  xpPerHour: 35000,
  prerequisites: { skills: { hitpoints: 90, magic: 85 }, quests: ['blade_of_the_wilds_third'], items: [], areas: ['the_wilds_throne'] },
  resourceOutput: { produces: [{ name: 'Wilderness Crown', perHour: 0.15 }, { name: 'Skull-gold coins', perHour: 880000 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 130000,
  danger: 'extreme', complexity: 'intense', attention: 'high',
  inputs: [{ name: 'Blighted shark', perHour: 220, source: 'wilds_stackable_food' }, { name: 'Super restore (4)', perHour: 16, source: 'herblore' }, { name: 'Anti-PK potion(4)', perHour: 4, source: 'wilds_antipk_potion_brewing' }],
  description: 'The Teleblocked King. Throne of the Wilds. He teleblocks at any HP above 10%. No escape while he draws breath. Prestige boss. Wilderness Crown drop.',
  location: 'The Wilds',
  breakpointAt: 90,
});

rel.defineTrainingMethod('wilds_dark_warrior_elite', {
  skill: 'defence', name: 'Dark Warrior Elite — Tank Grind',
  levelRange: [60, 95],
  xpPerHour: 98000,
  prerequisites: { skills: { defence: 60 }, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Skull-gold coins', perHour: 140000 }, { name: 'Dark warrior piece', perHour: 2 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 18000,
  danger: 'high', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Blighted shark', perHour: 90, source: 'wilds_stackable_food' }],
  description: 'Dark warriors. Level-fourteen wilds. Elite tier at the castle. Defence XP at greater-demon rate. PKers camp the castle stairs.',
  location: 'The Wilds',
});

rel.defineTrainingMethod('wilds_revenants_range_aoe', {
  skill: 'ranged', name: 'Revenant Cave — Black Chinchompa AoE',
  levelRange: [73, 99],
  xpPerHour: 215000,
  prerequisites: { skills: { ranged: 73 }, quests: [], items: [{ name: 'Black chinchompa' }], areas: ['the_wilds_revenant_caves'] },
  resourceOutput: { produces: [{ name: 'Revenant ether', perHour: 3400 }, { name: 'Skull-gold coins', perHour: 720000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 320000,
  danger: 'extreme', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Black chinchompa', perHour: 1800, source: 'wilds_black_chinchompa_hunting' }, { name: 'Blighted shark', perHour: 180, source: 'wilds_stackable_food' }],
  description: 'Black chinchompas into the revenant pack. Cave multicombat. Peak ranged XP in Aelgard at peak cost. Teleblocked by the first rev that sees you.',
  location: 'The Wilds',
});

rel.defineTrainingMethod('wilds_deep_wyrm_slayer', {
  skill: 'slayer', name: 'Deep-Wild Wyrm Hunt',
  levelRange: [85, 99],
  xpPerHour: 155000,
  prerequisites: { skills: { slayer: 85 }, quests: ['the_long_road_home'], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Wyrm scale', perHour: 240 }, { name: 'Slayer points', perHour: 45 }, { name: 'Skull-gold coins', perHour: 450000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 45000,
  danger: 'high', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Blighted shark', perHour: 140, source: 'wilds_stackable_food' }],
  description: 'Deep-wild wyrms. Level-thirty-five wilderness. Wyrm scales — crafting secondary for the no-honor armor. Krystilia tasks this at rate.',
  location: 'The Wilds',
});

rel.defineTrainingMethod('wilds_hunter_ptarmigan_trapping', {
  skill: 'hunter', name: 'Wilderness Ptarmigan Trapping',
  levelRange: [45, 90],
  xpPerHour: 98000,
  prerequisites: { skills: { hunter: 45 }, quests: [], items: [{ name: 'Bird snare' }], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Ptarmigan meat', perHour: 180 }, { name: 'Ptarmigan feather', perHour: 180 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'medium', complexity: 'moderate', attention: 'medium',
  inputs: [],
  description: 'Ptarmigan birds. Level-twelve wilderness. Birds migrate through on the hour. Trap-line runs the ridge. Feathers stack five-thousand to the slot.',
  location: 'The Wilds',
});

rel.defineTrainingMethod('wilds_mithril_dragons_combat', {
  skill: 'attack', name: 'Mithril Dragons Pocket Combat',
  levelRange: [80, 99],
  xpPerHour: 128000,
  prerequisites: { skills: { attack: 80 }, quests: [], items: [], areas: ['the_wilds_mithril_pocket'] },
  resourceOutput: { produces: [{ name: 'Dragon bones', perHour: 280 }, { name: 'Mithril dragon scale', perHour: 40 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 50000,
  danger: 'high', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Blighted shark', perHour: 120, source: 'wilds_stackable_food' }, { name: 'Anti-fire potion (4)', perHour: 4, source: 'herblore' }],
  description: 'Mithril dragons in the teleblocked pocket. Level-thirty wilderness. Crossbow-bolt drop table at PKer-frequency. The scales craft into dragonhide wards.',
  location: 'The Wilds',
});

// ══════════════════════════════════════════════════════════════════════════════
// HIGHER-TIER SUPPORT METHODS — ranged, magic, fletching deep-wild coverage
// ══════════════════════════════════════════════════════════════════════════════

rel.defineTrainingMethod('wilds_runite_bolt_fletching', {
  skill: 'fletching', name: 'Runite Bolt Fletching (Wilds Forge)',
  levelRange: [79, 99],
  xpPerHour: 220000,
  prerequisites: { skills: { fletching: 79 }, quests: ['the_wilds_forge'], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Runite bolt', perHour: 4800 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'medium', complexity: 'simple', attention: 'low',
  inputs: [{ name: 'Runite bar', perHour: 480, source: 'wilds_blast_forge_smelting' }, { name: 'Ptarmigan feather', perHour: 4800, source: 'wilds_hunter_ptarmigan_trapping' }],
  description: 'Runite bolts at the Edgeward fletch-bench. Bars come from the Wilds Blast Forge. Feathers come from ptarmigan. The wilds makes its own ammunition.',
  location: 'The Wilds',
});

rel.defineTrainingMethod('wilds_death_rune_altar', {
  skill: 'runecrafting', name: 'Deep-Wild Death Rune Altar',
  levelRange: [65, 99],
  xpPerHour: 58000,
  prerequisites: { skills: { runecrafting: 65 }, quests: [], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Death rune', perHour: 2200 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'high', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Pure essence', perHour: 2200, source: 'mining' }],
  description: 'Death rune altar. Level-twenty-two wilderness. Closer than the safe equivalent; twice the PKer risk. Rate holds 2200/hr.',
  location: 'The Wilds',
});

rel.defineTrainingMethod('wilds_wrath_rune_altar', {
  skill: 'runecrafting', name: 'Wrath Rune Altar — Deepest Wild',
  levelRange: [95, 99],
  xpPerHour: 72000,
  prerequisites: { skills: { runecrafting: 95 }, quests: ['the_long_road_home'], items: [], areas: ['the_wilds_throne'] },
  resourceOutput: { produces: [{ name: 'Wrath rune', perHour: 1400 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 0,
  danger: 'extreme', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Pure essence', perHour: 1400, source: 'mining' }],
  description: 'Wrath rune altar. Level-fifty-two wilderness. Highest RC XP bar in Aelgard. Only crafts inside the Throne pocket. Two tiles to teleblocked safety.',
  location: 'The Wilds',
  breakpointAt: 95,
});

rel.defineTrainingMethod('wilds_construction_hideout', {
  skill: 'construction', name: 'Wilds Hideout Construction',
  levelRange: [60, 99],
  xpPerHour: 380000,
  prerequisites: { skills: { construction: 60 }, quests: ['bandit_camp_alliance'], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [], net: 'loss' },
  bankingFrequency: 'frequent', costPerHour: 420000,
  danger: 'medium', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Mahogany plank', perHour: 900, source: 'woodcutting' }, { name: 'Magic logs', perHour: 400, source: 'wilds_magic_trees' }],
  description: 'Build your hideout inside the wilds. Peak construction XP. A personal pocket: bank, glory, altar. PKers cannot enter; they can camp the exit.',
  location: 'The Wilds',
});

rel.defineTrainingMethod('wilds_smithing_dragon_platebody', {
  skill: 'smithing', name: 'Dragon Platebody Smithing (Wilds Forge)',
  levelRange: [92, 99],
  xpPerHour: 195000,
  prerequisites: { skills: { smithing: 92 }, quests: ['the_wilds_forge'], items: [], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Dragon platebody', perHour: 28 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'medium', complexity: 'complex', attention: 'medium',
  inputs: [{ name: 'Draconic bar', perHour: 84, source: 'smithing' }, { name: 'Revenant ether', perHour: 840, source: 'wilds_revenant_demon' }],
  description: 'Dragon platebody smithing. Only the Wilds Blast Forge reaches the heat. Draconic bar + revenant ether bind. Smithing 92 gate. Peak armor XP.',
  location: 'The Wilds',
});

rel.defineTrainingMethod('wilds_mining_adamantite', {
  skill: 'mining', name: 'Wilderness Adamantite Belt',
  levelRange: [70, 90],
  xpPerHour: 82000,
  prerequisites: { skills: { mining: 70 }, quests: [], items: [{ name: 'Rune pickaxe' }], areas: ['the_wilds'] },
  resourceOutput: { produces: [{ name: 'Adamantite ore', perHour: 360 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'medium', complexity: 'simple', attention: 'low',
  inputs: [],
  description: 'Adamantite belt. Level-nineteen wilds. Eight rocks in formation. The rate is higher than the Mining Guild. The distance to bank is longer than the Mining Guild.',
  location: 'The Wilds',
});

// ══════════════════════════════════════════════════════════════════════════════
// WILDS-NATIVE ITEM SOURCES — fill the ecosystem cross-web
// ══════════════════════════════════════════════════════════════════════════════

rel.registerItemSource(99700, { type: 'drop', sourceId: 'wilds_dark_warrior', sourceName: 'Dark Warrior', region: 'the_wilds', details: 'Dark warrior helm. Wilds-only drop. Wears over black armor for +3 prayer.', obscure: false });
rel.registerItemSource(99701, { type: 'drop', sourceId: 'wilds_mithril_dragon', sourceName: 'Mithril Dragon', region: 'the_wilds', details: 'Mithril dragon scale. Crafting secondary for draconic wards.', obscure: true });
rel.registerItemSource(99702, { type: 'gathering', sourceId: 'wilds_ptarmigan_trap', sourceName: 'Ptarmigan Snare', region: 'the_wilds', details: 'Ptarmigan meat + feathers. Feathers stack 5000/slot. Meat heals 9.', obscure: false });
rel.registerItemSource(99703, { type: 'drop', sourceId: 'wilds_deep_wyrm', sourceName: 'Deep-Wild Wyrm', region: 'the_wilds', details: 'Wyrm scale. No-honor armor secondary. Krystilia slayer task.', obscure: false });
rel.registerItemSource(99704, { type: 'drop', sourceId: 'wilds_ferox_chest', sourceName: 'Ferox Enclave Chest', region: 'the_wilds', details: 'Wilds-chest loot. Slayer task streak reward. Contains divine rune pouch at streak 50.', obscure: true });
rel.registerItemSource(99705, { type: 'processing', sourceId: 'wilds_runite_bar', sourceName: 'Wilds Blast Forge', region: 'the_wilds', details: 'Runite bar (wilds-grade). Burns 10% less coal than safe forge. Required for dragon plate.', obscure: false });
rel.registerItemSource(99706, { type: 'processing', sourceId: 'wilds_draconic_bar', sourceName: 'Wilds Draconic Alloy', region: 'the_wilds', details: 'Draconic bar. Runite bar + dragon bone + ether. Only smelts in Wilds Blast Forge.', obscure: false });
rel.registerItemSource(99707, { type: 'drop', sourceId: 'wilds_revenant_imp_small', sourceName: 'Small Ether Cache', region: 'the_wilds', details: 'Small ether cache — 10 ether guaranteed from any revenant kill. Starter currency.', obscure: false });
rel.registerItemSource(99708, { type: 'gathering', sourceId: 'wilds_yew_grove', sourceName: 'Wilds Yew Grove', region: 'the_wilds', details: 'Yew logs (wilds-grade). Feeds the Wilds Blast Forge coal-replacement.', obscure: false });
rel.registerItemSource(99709, { type: 'gathering', sourceId: 'wilds_pure_essence_vein', sourceName: 'Wilds Pure Essence Vein', region: 'the_wilds', details: 'Pure essence (wilds-grade). 15% more RC XP per rune. Level-twenty wilderness.', obscure: false });
rel.registerItemSource(99710, { type: 'drop', sourceId: 'wilds_pk_bag_drop', sourceName: 'PK Bag Drop', region: 'the_wilds', details: 'Ancestor looting bag — 70 items. Deep-revenant rare drop.', obscure: true });
rel.registerItemSource(99711, { type: 'shop', sourceId: 'wilds_bandit_supplies', sourceName: 'Bandit Supply Caravan', region: 'the_wilds', details: 'Bandit supplies. Logout tabs, emergency glories, wilds-cheap armor.', obscure: false });
rel.registerItemSource(99712, { type: 'shop', sourceId: 'wilds_ferox_shop', sourceName: 'Ferox Enclave Supply', region: 'the_wilds', details: 'Ferox shop. Blighted food packs, blighted potion packs, entry anchor.', obscure: false });
rel.registerItemSource(99713, { type: 'gathering', sourceId: 'wilds_deadman_chest', sourceName: 'Deadman Chest', region: 'the_wilds', details: 'Deadman-season chest. 3x XP while inside pocket. Everything drops on death.', obscure: true });
rel.registerItemSource(99714, { type: 'drop', sourceId: 'wilds_pk_target_bounty', sourceName: 'Bounty Hunter Target', region: 'the_wilds', details: 'Bounty emblem upgrade on target kill. Up to tier 5 (1M value).', obscure: false });
rel.registerItemSource(99715, { type: 'drop', sourceId: 'wilds_risk_bonus_kill', sourceName: 'Risk-Bonus PK Kill', region: 'the_wilds', details: 'Risk-bonus loot. Killing a 150k+ risk target gives 10% extra loot.', obscure: false });
rel.registerItemSource(99716, { type: 'drop', sourceId: 'wilds_multi_kill_bonus', sourceName: 'Multi-Zone Kill Bonus', region: 'the_wilds', details: 'Multi-combat kill bonus. Each of the first 3 kills in a multi-zone gives +5% to next kill loot.', obscure: true });

// ══════════════════════════════════════════════════════════════════════════════
// WILDS RECIPES — chain ecosystem so nothing is orphaned
// ══════════════════════════════════════════════════════════════════════════════

rel.defineCombination(99801, {
  resultName: 'Draconic Bar',
  inputs: [
    { id: 99705, name: 'Runite bar (wilds-grade)', consumed: true },
    { id: 107, name: 'Dragon bones', consumed: true },
    { id: 99012, name: 'Revenant ether', consumed: true },
    { id: 99012, name: 'Revenant ether', consumed: true },
  ],
  skill: 'smithing', level: 85, xp: 320, station: 'wilds_blast_forge',
  description: 'Draconic bar. Runite + dragon bone + ether double. Only smelts in the Wilds Blast Forge.',
});

rel.defineCombination(99802, {
  resultName: 'No-Honor Armor (chestplate)',
  inputs: [
    { id: 99703, name: 'Wyrm scale', consumed: true },
    { id: 99703, name: 'Wyrm scale', consumed: true },
    { id: 99703, name: 'Wyrm scale', consumed: true },
    { id: 99520, name: 'Amulet of No-Honor', consumed: false },
  ],
  skill: 'crafting', level: 80, xp: 280,
  description: 'No-honor armor chestplate. Three wyrm scales + amulet catalyst. Prayer-preserving chest.',
});

rel.defineCombination(99803, {
  resultName: 'Divine Rune Pouch',
  inputs: [
    { id: 99704, name: 'Ferox Enclave Chest (streak 50)', consumed: true },
    { id: 99111, name: 'Rune pouch (wilderness)', consumed: true },
  ],
  skill: 'crafting', level: 85, xp: 160,
  description: 'Divine rune pouch. Holds 4 rune types instead of 3. Requires slayer streak 50 chest + wilds pouch.',
});

rel.defineCombination(99804, {
  resultName: 'Logout Tab (bulk)',
  inputs: [
    { id: 563, name: 'Law rune', consumed: true },
    { id: 562, name: 'Chaos rune', consumed: true },
    { id: 99012, name: 'Revenant ether', consumed: true },
    { id: 8007, name: 'Teleport tablet base', consumed: true },
  ],
  skill: 'crafting', level: 55, xp: 45, station: 'wilds_bandit_lectern',
  description: 'Bulk logout tab. Same effect, stacks 100/slot inside wilds. Emergency instant-logout.',
});

rel.defineCombination(99805, {
  resultName: 'Blighted Super Restore (4)',
  inputs: [
    { id: 3024, name: 'Super restore (4)', consumed: true },
    { id: 99012, name: 'Revenant ether', consumed: true },
  ],
  skill: 'herblore', level: 72, xp: 142, station: 'wilds_herblab',
  description: 'Blighted super restore. Stacks 500/slot in wilds. Spoils 2 ticks after leaving.',
});

rel.defineCombination(99806, {
  resultName: 'Blighted Prayer Potion (4)',
  inputs: [
    { id: 2434, name: 'Prayer potion (4)', consumed: true },
    { id: 99012, name: 'Revenant ether', consumed: true },
  ],
  skill: 'herblore', level: 55, xp: 100, station: 'wilds_herblab',
  description: 'Blighted prayer potion. Stacks 500/slot in wilds. Saves inventory space for the long-road.',
});

rel.defineCombination(99807, {
  resultName: 'Ptarmigan Arrows',
  inputs: [
    { id: 314, name: 'Feather', consumed: true },
    { id: 53, name: 'Headless arrow', consumed: true },
  ],
  skill: 'fletching', level: 1, xp: 4,
  description: 'Ptarmigan arrows from wilds feather. Wilds-only catch; arrows work everywhere.',
});

rel.defineCombination(99808, {
  resultName: 'Mithril Dragon Ward',
  inputs: [
    { id: 99701, name: 'Mithril dragon scale', consumed: true },
    { id: 99701, name: 'Mithril dragon scale', consumed: true },
    { id: 99701, name: 'Mithril dragon scale', consumed: true },
  ],
  skill: 'crafting', level: 75, xp: 220,
  description: 'Mithril dragon ward. Defensive shield. +15% magic defence in wilds-interior.',
});

rel.defineCombination(99809, {
  resultName: "Vet'ion Ring (restored)",
  inputs: [
    { id: 99522, name: 'Ring of the Long Road shard', consumed: true },
    { id: 99522, name: 'Ring of the Long Road shard', consumed: true },
    { id: 99012, name: 'Revenant ether', consumed: true },
    { id: 99012, name: 'Revenant ether', consumed: true },
  ],
  skill: 'crafting', level: 90, xp: 420,
  description: "Ring of the Long Road restored. Two shards + ether double. Teleport delay reduced 2 ticks.",
});

rel.defineCombination(99810, {
  resultName: 'Amulet of No-Honor (strung)',
  inputs: [
    { id: 99520, name: 'Amulet of No-Honor seed', consumed: true },
    { id: 99531, name: 'Magic logs', consumed: true },
  ],
  skill: 'crafting', level: 90, xp: 200,
  description: 'String the amulet with magic log fiber. Wilds answer to Amulet of Fury. Stackable 1000/slot.',
});

rel.defineCombination(99811, {
  resultName: 'Ferox Enclave Anchor',
  inputs: [
    { id: 99566, name: 'Ferox enclave marker', consumed: true },
    { id: 99562, name: 'Glory recharge', consumed: true },
    { id: 563, name: 'Law rune', consumed: true },
    { id: 563, name: 'Law rune', consumed: true },
  ],
  skill: 'magic', level: 85, xp: 180,
  description: 'Anchor the Ferox enclave to your inventory. One free wilds teleport per hour.',
});

rel.defineCombination(99812, {
  resultName: 'Wilderness Crown',
  inputs: [
    { id: 99815, name: 'Teleblocked King crown shard', consumed: true },
    { id: 99815, name: 'Teleblocked King crown shard', consumed: true },
    { id: 99815, name: 'Teleblocked King crown shard', consumed: true },
    { id: 99520, name: 'Amulet of No-Honor', consumed: false },
  ],
  skill: 'crafting', level: 95, xp: 1200, station: 'wilds_throne_forge',
  description: 'Wilderness Crown. Three Teleblocked King crown shards + amulet catalyst. Prestige crown. +20% wilds damage.',
});

rel.defineCombination(99813, {
  resultName: 'Soulsplit Prayer Unlock',
  inputs: [
    { id: 99541, name: 'Soulsplit scroll fragment', consumed: true },
    { id: 99541, name: 'Soulsplit scroll fragment', consumed: true },
    { id: 99541, name: 'Soulsplit scroll fragment', consumed: true },
  ],
  skill: 'prayer', level: 92, xp: 800,
  description: 'Three Soulsplit scroll fragments. Unlock the Soulsplit prayer — heal for 25% of damage dealt.',
});

rel.defineCombination(99814, {
  resultName: 'Blade of the Wilds',
  inputs: [
    { id: 99609, name: "Exiled Champion's blade shard", consumed: true },
    { id: 99609, name: "Exiled Champion's blade shard", consumed: true },
    { id: 99705, name: 'Runite bar (wilds-grade)', consumed: true },
    { id: 99705, name: 'Runite bar (wilds-grade)', consumed: true },
  ],
  skill: 'smithing', level: 80, xp: 350, station: 'wilds_blast_forge',
  description: 'Blade of the Wilds (original). Two blade shards + two runite bars. Quest-chain weapon, upgradable twice.',
});

// ══════════════════════════════════════════════════════════════════════════════
// WILDS OBSCURE CROSS-USES — items that have non-obvious wilds utility
// ══════════════════════════════════════════════════════════════════════════════

rel.registerItemUse(99012, { type: 'secondary', targetId: 'wilds_blighted_food_processing', targetName: 'Blighting recipe secondary', region: 'the_wilds', details: 'Ether is the blighting catalyst for stackable food.', obscure: false });
rel.registerItemUse(99012, { type: 'secondary', targetId: 99801, targetName: 'Draconic bar smelting', region: 'the_wilds', details: 'Draconic bar requires 2 ether per bar.', obscure: false });
rel.registerItemUse(99012, { type: 'secondary', targetId: 99809, targetName: "Vet'ion ring restoration", region: 'the_wilds', details: 'Ether double-bind for ring restore.', obscure: false });

rel.registerItemUse(99530, { type: 'recipe', targetId: 99705, targetName: 'Wilds runite bar', region: 'the_wilds', details: 'Wilds rune rocks feed the blast forge at 10% coal reduction.', obscure: false });
rel.registerItemUse(99530, { type: 'recipe', targetId: 99801, targetName: 'Draconic bar', region: 'the_wilds', details: 'Rune ore is draconic bar base.', obscure: true });

rel.registerItemUse(99531, { type: 'recipe', targetId: 99802, targetName: 'No-honor armor', region: 'the_wilds', details: 'Magic logs are the no-honor armor structural base.', obscure: true });
rel.registerItemUse(99531, { type: 'offering', targetId: 'wilds_pyre_bone_wildsfire', targetName: 'Wilds pyre', region: 'the_wilds', details: 'Magic logs + lava dragon bones = peak firemaking + prayer double-skill.', obscure: false });

rel.registerItemUse(99532, { type: 'recipe', targetId: 99606, targetName: 'Anti-PK potion (4)', region: 'the_wilds', details: 'Wilderness herbs are the anti-PK potion ONLY source.', obscure: false });

rel.registerItemUse(99541, { type: 'recipe', targetId: 99813, targetName: 'Soulsplit prayer unlock', region: 'the_wilds', details: '3 fragments unlock Soulsplit — heal 25% of damage dealt.', obscure: false });

rel.registerItemUse(99545, { type: 'offering', targetId: 'wilds_chaos_altar_offering', targetName: 'Chaos altar', region: 'the_wilds', details: 'Lava dragon bones are chaos altar premium.', obscure: false });

rel.registerItemUse(99550, { type: 'consumable', targetId: 'wilds_combat_food', targetName: 'Wilds combat food', region: 'the_wilds', details: 'Stackable 1000/slot. Saves inventory for long stays.', obscure: false });
rel.registerItemUse(99551, { type: 'consumable', targetId: 'wilds_combat_potions', targetName: 'Wilds combat potions', region: 'the_wilds', details: 'Stackable 500/slot. The longer stay is the whole design.', obscure: false });

rel.registerItemUse(99566, { type: 'teleport', targetId: 'wilds_ferox_teleport', targetName: 'Ferox Enclave teleport', region: 'the_wilds', details: 'Ferox is the wilds-adjacent safe bank. Gear up before the ditch.', obscure: false });

rel.registerItemUse(99568, { type: 'escape', targetId: 'wilds_emergency_logout', targetName: 'Emergency Logout', region: 'the_wilds', details: 'Logout tab — instant logout with 10-tick protection. Essential for deep-wild grinds.', obscure: false });

rel.registerItemUse(99701, { type: 'recipe', targetId: 99808, targetName: 'Mithril dragon ward', region: 'the_wilds', details: '3 scales to a ward. +15% magic defence in wilds.', obscure: false });

rel.registerItemUse(99705, { type: 'recipe', targetId: 99801, targetName: 'Draconic bar', region: 'the_wilds', details: 'Runite bar is the draconic base.', obscure: false });
rel.registerItemUse(99705, { type: 'recipe', targetId: 99814, targetName: 'Blade of the Wilds', region: 'the_wilds', details: 'Runite bars are the blade body.', obscure: true });

// ══════════════════════════════════════════════════════════════════════════════
// FINAL BREAKPOINTS — threshold moments that complete the wilds arc
// ══════════════════════════════════════════════════════════════════════════════

rel.defineBreakpoint({
  type: 'skill_level', trigger: { skill: 'runecrafting', level: 95 },
  description: 'Wrath rune altar unlocked. Deepest wild. Level-fifty-two wilderness. Two tiles to the throne pocket. The only wrath rune source in Aelgard.',
  unlocks: [{ type: 'training_method', id: 'wilds_wrath_rune_altar', description: 'Wrath rune altar' }],
  importance: 'transformative',
});

rel.defineBreakpoint({
  type: 'skill_level', trigger: { skill: 'smithing', level: 90 },
  description: 'Vesta reforging threshold. The Wilds Blast Forge accepts the fragments. Peak melee lineage begins.',
  unlocks: [{ type: 'training_method', id: 'wilds_vesta_reforging', description: "Vesta's longsword reforging" }],
  importance: 'major',
});

rel.defineBreakpoint({
  type: 'item_acquired', trigger: { item: 'wilderness_crown' },
  description: 'Wilderness Crown equipped. Peak wilds identity. +20% damage bonus inside wilds. The risk king.',
  unlocks: [{ type: 'item_equip', id: 'wilderness_crown', description: 'Wilderness Crown' }],
  importance: 'transformative',
});

rel.defineBreakpoint({
  type: 'skill_level', trigger: { skill: 'prayer', level: 92 },
  description: 'Soulsplit prayer unlock threshold. Heal for 25% of damage dealt. The defining wilds prayer.',
  unlocks: [{ type: 'prayer', id: 'soulsplit', description: 'Soulsplit prayer' }],
  importance: 'transformative',
});

console.log('[aelgard] Wilds Density loaded: 15 higher-tier methods, 17 native sources, 14 recipes, 20+ cross-uses, 4 final breakpoints, cold clipped voice');
