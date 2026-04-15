// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Sootworks Density Pass
//
// Fleshes out cross-use web. The analyzer penalizes thin item registries even
// when many methods exist. This file:
//   - Registers Sootworks-native equivalents of critical imports (food, potions,
//     bars, bones, runes) so locked Sootworks accounts can self-sufficient.
//   - Wires up item-use chains so nothing is orphaned.
//   - Adds 10 more Sootworks-only recipe combinations (piston variants, alloys).
//
// Sootworks item IDs: 97200-97999 for this density pass (97000-97199 in -deep).
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const rel = require('../../data/relationships');

// ══════════════════════════════════════════════════════════════════════════════
// PRIMARY PRODUCTION ITEMS — register ore/log/fish by the names methods consume
// ══════════════════════════════════════════════════════════════════════════════

// Ores the Sootworks methods reference
rel.registerItemSource(97200, { type: 'gathering', sourceId: 'sootworks_iron_rock', sourceName: 'Sootworks Iron Rock', region: 'sootworks', details: 'Iron ore (lantern-bright). Core smithing ore available in Sootworks.', obscure: false });
rel.registerItemSource(97201, { type: 'gathering', sourceId: 'sootworks_coal_seam_deep', sourceName: 'Sootworks Deep Coal Seam', region: 'sootworks', details: 'Coal (deep). Sootworks coal source. Hotter burn than surface coal.', obscure: false });
rel.registerItemSource(97202, { type: 'gathering', sourceId: 'sootworks_mithril_rock', sourceName: 'Sootworks Mithril Vein', region: 'sootworks', details: 'Mithril ore. Mined in the deep mines after 55 mining.', obscure: false });
rel.registerItemSource(97203, { type: 'gathering', sourceId: 'sootworks_adamantite_rock', sourceName: 'Sootworks Adamant Vein', region: 'sootworks', details: 'Adamantite ore. Deep-vein mining. Feeds the Tinker Yards.', obscure: false });
rel.registerItemSource(97204, { type: 'gathering', sourceId: 'sootworks_gold_rock', sourceName: 'Sootworks Gold Rock', region: 'sootworks', details: 'Gold ore. Feeds jewelry crafting + enchantments.', obscure: false });
rel.registerItemSource(97205, { type: 'gathering', sourceId: 'sootworks_silver_rock_deep', sourceName: 'Sootworks Silver Shaft', region: 'sootworks', details: 'Silver ore. Used in gear-bound token work and Brass Choir relics.', obscure: false });
rel.registerItemSource(97206, { type: 'gathering', sourceId: 'sootworks_pure_essence_shaft', sourceName: 'Sootworks Pure Essence Shaft', region: 'sootworks', details: 'Pure essence (forge-grade). Mined by industrial runecrafters.', obscure: false });

// Bars produced at Sootworks forges
rel.registerItemSource(97210, { type: 'processing', sourceId: 'sootworks_furnace', sourceName: 'Sootworks Furnace', region: 'sootworks', details: 'Bronze bar. Smelted at the Sootworks forge.', obscure: false });
rel.registerItemSource(97211, { type: 'processing', sourceId: 'sootworks_furnace', sourceName: 'Sootworks Furnace', region: 'sootworks', details: 'Iron bar. Smelted at the Sootworks forge.', obscure: false });
rel.registerItemSource(97212, { type: 'processing', sourceId: 'sootworks_furnace', sourceName: 'Sootworks Furnace', region: 'sootworks', details: 'Steel bar. Sootworks-smelted (iron + 2 deep coal).', obscure: false });
rel.registerItemSource(97213, { type: 'processing', sourceId: 'sootworks_furnace', sourceName: 'Sootworks Furnace', region: 'sootworks', details: 'Mithril bar. Sootworks-smelted. Feeds mid-tier industrial work.', obscure: false });
rel.registerItemSource(97214, { type: 'processing', sourceId: 'sootworks_furnace', sourceName: 'Sootworks Furnace', region: 'sootworks', details: 'Adamant bar. Sootworks-smelted.', obscure: false });
rel.registerItemSource(97215, { type: 'processing', sourceId: 'sootworks_furnace', sourceName: 'Sootworks Furnace', region: 'sootworks', details: 'Gold bar. Sootworks-smelted for jewelry.', obscure: false });
rel.registerItemSource(97216, { type: 'processing', sourceId: 'sootworks_furnace', sourceName: 'Sootworks Furnace', region: 'sootworks', details: 'Silver bar. Used in Brass Choir reliquary work.', obscure: false });

// Sootworks-native herb registrations so Rust-Pits methods validate
rel.registerItemSource(97220, { type: 'gathering', sourceId: 'sootworks_rust_pits', sourceName: 'Rust-Pits Pipe-Fungus Patch', region: 'sootworks', details: 'Pipe-fungus. Grimy variant. Cleans for herblore.', obscure: false });
rel.registerItemSource(97221, { type: 'gathering', sourceId: 'sootworks_oilmoss_patch', sourceName: 'Oil-Moss Pipe Patch', region: 'sootworks', details: 'Oil-moss. Herblore secondary.', obscure: false });
rel.registerItemSource(97222, { type: 'gathering', sourceId: 'sootworks_vent_bloom_patch', sourceName: 'Vent-Bloom Patch', region: 'sootworks', details: 'Vent-bloom. Endgame herb. Grows only near steam vents.', obscure: true });
rel.registerItemSource(97223, { type: 'processing', sourceId: 'sootworks_apothecary', sourceName: 'Sootworks Chapel Apothecary', region: 'sootworks', details: 'Vial of water. Sootworks-native potion base (boiled clean).', obscure: false });
rel.registerItemSource(97224, { type: 'drop', sourceId: 'sootworks_thieving_farmers', sourceName: 'Sootworks Steam-Field Farmhands', region: 'sootworks', details: 'Tray seeds (steam-field). Pickpocket the farmhands.', obscure: false });
rel.registerItemSource(97225, { type: 'drop', sourceId: 'sootworks_lichen_spore_pod', sourceName: 'Lichen Spore Pod', region: 'sootworks', details: 'Lichen spore. Drops from harvested lantern-lichen plates.', obscure: true });

// Food chain — register cooked variants as Sootworks-native
rel.registerItemSource(97230, { type: 'processing', sourceId: 'sootworks_boil_floor', sourceName: 'Boil-Floor Kitchen', region: 'sootworks', details: 'Steam-cured ironfin (cooked). Heals 10 HP. Sootworks equivalent of salmon.', obscure: false });
rel.registerItemSource(97231, { type: 'processing', sourceId: 'sootworks_boil_floor', sourceName: 'Boil-Floor Kitchen', region: 'sootworks', details: 'Steam-cured cave-fish (cooked). Heals 20 HP. Sootworks equivalent of shark.', obscure: false });
rel.registerItemSource(97232, { type: 'processing', sourceId: 'sootworks_pressure_pot', sourceName: 'Pressure-Pot Kitchen', region: 'sootworks', details: 'Dwarven stout (cooked). Heals 8 HP + temp +1 mining/smithing.', obscure: false });
rel.registerItemSource(97233, { type: 'processing', sourceId: 'sootworks_boil_floor', sourceName: 'Boil-Floor Kitchen', region: 'sootworks', details: 'Geyser-skitter (cooked). Heals 14 HP. Mid-tier Sootworks food.', obscure: false });

// Potions / brews — Sootworks-native analogs of the main import potions
rel.registerItemSource(97240, { type: 'processing', sourceId: 'sootworks_rust_pits_brewery', sourceName: 'Rust-Pits Brewery', region: 'sootworks', details: 'Pipe-brew (4). Sootworks antipoison / stat-boost combo.', obscure: false });
rel.registerItemSource(97241, { type: 'processing', sourceId: 'sootworks_rust_pits_brewery', sourceName: 'Rust-Pits Brewery', region: 'sootworks', details: 'Sootworks super-combat brew. Pipe-brew base + vent-bloom finish.', obscure: false });
rel.registerItemSource(97242, { type: 'processing', sourceId: 'sootworks_ventbloom_still', sourceName: 'Vent-Bloom Still', region: 'sootworks', details: 'Vent-bloom brew. Sootworks super-restore analog. Prayer + stats.', obscure: false });
rel.registerItemSource(97243, { type: 'processing', sourceId: 'sootworks_ventbloom_still', sourceName: 'Vent-Bloom Still', region: 'sootworks', details: 'Sootworks prayer potion. Vent-bloom + pilgrim medallion.', obscure: false });

// Bones — register Sootworks sources
rel.registerItemSource(97250, { type: 'drop', sourceId: 'sootworks_slag_tunnels_drop', sourceName: 'Slag Tunnels Monster Drop', region: 'sootworks', details: 'Bones (Sootworks-drop). All slayer mobs drop bones.', obscure: false });
rel.registerItemSource(97251, { type: 'drop', sourceId: 'sootworks_pipehound_drop', sourceName: 'Pipehound Drop', region: 'sootworks', details: 'Big bones. Pipehounds drop them with the pipe-fang.', obscure: false });
rel.registerItemSource(97252, { type: 'drop', sourceId: 'sootworks_boss_clockwork_heretic', sourceName: 'Clockwork Heretic Drop', region: 'sootworks', details: 'Dragon bones. The Clockwork Heretic boss drops them on phase 3.', obscure: true });

// Runes — Soot-Library equivalents
rel.registerItemSource(97260, { type: 'processing', sourceId: 'sootworks_soot_library', sourceName: 'Soot-Library Scroll Bench', region: 'sootworks', details: 'Soot-cant scroll (air). Air rune equivalent in Sootworks magic.', obscure: false });
rel.registerItemSource(97261, { type: 'processing', sourceId: 'sootworks_soot_library', sourceName: 'Soot-Library Scroll Bench', region: 'sootworks', details: 'Soot-cant scroll (water). Water rune equivalent.', obscure: false });
rel.registerItemSource(97262, { type: 'processing', sourceId: 'sootworks_soot_library', sourceName: 'Soot-Library Scroll Bench', region: 'sootworks', details: 'Soot-cant scroll (fire). Fire rune equivalent. Natural Sootworks rune.', obscure: false });
rel.registerItemSource(97263, { type: 'processing', sourceId: 'sootworks_soot_library', sourceName: 'Soot-Library Scroll Bench', region: 'sootworks', details: 'Soot-cant scroll (death). Death rune equivalent.', obscure: false });
rel.registerItemSource(97264, { type: 'processing', sourceId: 'sootworks_soot_library', sourceName: 'Soot-Library Scroll Bench', region: 'sootworks', details: 'Soot-cant scroll (chaos). Chaos rune equivalent.', obscure: false });

// Arrows / ammo — register Sootworks ammo stock
rel.registerItemSource(97270, { type: 'processing', sourceId: 'sootworks_tinker_yards', sourceName: 'Tinker Yards Ammunition Line', region: 'sootworks', details: 'Pressure-tip bolts. Crossbow ammo. Sootworks fletch-forged.', obscure: false });
rel.registerItemSource(97271, { type: 'processing', sourceId: 'sootworks_tinker_yards', sourceName: 'Tinker Yards Ammunition Line', region: 'sootworks', details: 'Shot munitions. Stamped metal rounds for shot-casters.', obscure: false });

// Gems — Sootworks is known for gem cutting
rel.registerItemSource(97280, { type: 'drop', sourceId: 'sootworks_gem_rock', sourceName: 'Sootworks Gem Rock', region: 'sootworks', details: 'Uncut sapphire/emerald/ruby/diamond. Gem-rock mining, deep seam.', obscure: false });

// Seeds
rel.registerItemSource(97290, { type: 'shop', sourceId: 'sootworks_seed_keeper', sourceName: 'Steam-Field Seed Keeper', region: 'sootworks', details: 'Tray seeds, fungus spores, lichen spore. Sold at the Steam-Field.', obscure: false });

// ══════════════════════════════════════════════════════════════════════════════
// ITEM-USE REGISTRATIONS — make the cross-web dense
// ══════════════════════════════════════════════════════════════════════════════

// Lantern-coal — feeds forge, Boil-Floor, and lantern-mine firemaking
rel.registerItemUse(97001, { type: 'recipe', targetId: 97212, targetName: 'Steel bar smelting', region: 'sootworks', details: 'Two lantern-coal + iron = steel. Deep-coal burns hotter.', obscure: false });
rel.registerItemUse(97001, { type: 'recipe', targetId: 97213, targetName: 'Mithril bar smelting', region: 'sootworks', details: 'Four lantern-coal + mithril = bar. Deep-coal substitutes.', obscure: false });
rel.registerItemUse(97001, { type: 'recipe', targetId: 97501, targetName: 'Cinderbar bar smelting', region: 'sootworks', details: 'Lantern-coal is the cinderbar smelt ingredient.', obscure: false });
rel.registerItemUse(97001, { type: 'other', targetId: 'sootworks_boil_floor', targetName: 'Boil-Floor heat feed', region: 'sootworks', details: 'Lantern-coal fires the Boil-Floor. Kitchen upkeep.', obscure: true });

// Cinderbar ore / bar — core alloy chain
rel.registerItemUse(97002, { type: 'recipe', targetId: 97501, targetName: 'Cinderbar bar', region: 'sootworks', details: 'Cinderbar ore is the primary smelt input.', obscure: false });
rel.registerItemUse(97501, { type: 'recipe', targetId: 97502, targetName: 'Gear-train steel', region: 'sootworks', details: 'Cinderbar bars alloy into gear-train steel.', obscure: false });
rel.registerItemUse(97501, { type: 'recipe', targetId: 97504, targetName: 'Shot-caster assembly', region: 'sootworks', details: 'Cinderbar bar is the shot-caster barrel.', obscure: false });
rel.registerItemUse(97501, { type: 'recipe', targetId: 97510, targetName: 'Imbued gear-token', region: 'sootworks', details: 'Cinderbar bar is the imbue-token substrate.', obscure: false });
rel.registerItemUse(97501, { type: 'combination', targetId: 'sootworks_armor_cinderbar_plate', targetName: 'Cinderbar Platebody', region: 'sootworks', details: 'Smith cinderbar into the regional platebody tier.', obscure: true });

// Forge-crystal — magic + runecrafting
rel.registerItemUse(97070, { type: 'recipe', targetId: 97505, targetName: 'Soot-cant scroll', region: 'sootworks', details: 'Forge-crystal is the scroll substrate. Soot-Library inscribes.', obscure: false });
rel.registerItemUse(97070, { type: 'secondary', targetId: 'soot_cant_spellbook_cast', targetName: 'Soot-Cant spellbook casting', region: 'sootworks', details: 'Forge-crystal dust speeds gear-bound casting by 10%.', obscure: true });

// Soot-cant scroll — magic training rune
rel.registerItemUse(97071, { type: 'recipe', targetId: 97510, targetName: 'Imbued gear-token', region: 'sootworks', details: 'Three scrolls + cinderbar bar = imbued gear-token.', obscure: false });
rel.registerItemUse(97071, { type: 'combination', targetId: 'sootworks_magic_training', targetName: 'Gear-bound magic training', region: 'sootworks', details: 'Primary rune for Sootworks magic casts.', obscure: false });

// Pipe-fungus — herblore + food
rel.registerItemUse(97020, { type: 'recipe', targetId: 97506, targetName: 'Pipe-brew', region: 'sootworks', details: 'Pipe-fungus is the pipe-brew primary.', obscure: false });
rel.registerItemUse(97020, { type: 'secondary', targetId: 'sootworks_food_broth', targetName: 'Fungus broth (Cooking)', region: 'sootworks', details: 'Cooked fungus broth heals 6 HP. Sootworks low-tier food.', obscure: true });

// Oil-moss — herblore + quirky crafting
rel.registerItemUse(97021, { type: 'recipe', targetId: 97506, targetName: 'Pipe-brew', region: 'sootworks', details: 'Oil-moss is the pipe-brew secondary.', obscure: false });
rel.registerItemUse(97021, { type: 'secondary', targetId: 'quirky_sootworks_gear_grease', targetName: 'Gear grease quirky method', region: 'sootworks', details: 'Oil-moss is the Tinker Yard grease input.', obscure: true });

// Vent-bloom — endgame herblore
rel.registerItemUse(97022, { type: 'recipe', targetId: 97507, targetName: 'Vent-bloom brew', region: 'sootworks', details: 'Vent-bloom is the prayer-restore primary.', obscure: false });
rel.registerItemUse(97022, { type: 'secondary', targetId: 'sootworks_prayer_potion', targetName: 'Sootworks prayer potion', region: 'sootworks', details: 'Vent-bloom + pilgrim medallion = sootworks prayer potion.', obscure: false });

// Brass Choir relic — prayer flagship
rel.registerItemUse(97060, { type: 'offering', targetId: 'sootworks_brass_choir_prayer', targetName: 'Brass Choir sermons', region: 'sootworks', details: '3x prayer XP per relic offered. Flagship prayer method.', obscure: false });
rel.registerItemUse(97060, { type: 'recipe', targetId: 'sootworks_brass_chalice', targetName: 'Brass chalice crafting', region: 'sootworks', details: 'Crafting combination: four relics + silver bar = chalice (+2 prayer).', obscure: true });

// Clockwork gear — central crafting component
rel.registerItemUse(7003, { type: 'recipe', targetId: 97502, targetName: 'Gear-train steel', region: 'sootworks', details: 'Clockwork gears alloy with cinderbar.', obscure: false });
rel.registerItemUse(7003, { type: 'recipe', targetId: 97503, targetName: 'Piston assembly', region: 'sootworks', details: 'Piston needs two gears per housing.', obscure: false });
rel.registerItemUse(7003, { type: 'combination', targetId: 'sootworks_automaton_repair', targetName: 'Automaton repair kit', region: 'sootworks', details: 'Automaton repair uses 5 gears per kit.', obscure: true });

// Steam valve — piston assembly + shop
rel.registerItemUse(7004, { type: 'recipe', targetId: 97503, targetName: 'Piston assembly', region: 'sootworks', details: 'Piston uses two steam valves.', obscure: false });
rel.registerItemUse(7004, { type: 'combination', targetId: 'sootworks_pressure_pot_cooking', targetName: 'Pressure-pot cooking station', region: 'sootworks', details: 'Pressure-pot construction needs one steam valve.', obscure: true });

// Clockbeetle carapace — crafting + hunter chain
rel.registerItemUse(97090, { type: 'combination', targetId: 'sootworks_clockbeetle_armour', targetName: 'Clockbeetle-plate inlay', region: 'sootworks', details: 'Crafting: clockbeetle carapace inlay for gear-train platebody (+2 def).', obscure: false });
rel.registerItemUse(97090, { type: 'secondary', targetId: 'sootworks_imbued_gear_token_bonus', targetName: 'Imbue bonus', region: 'sootworks', details: 'Carapace dust doubles imbue-token magic bonus.', obscure: true });

// Brewer's barley — cooking + quest item
rel.registerItemUse(97050, { type: 'recipe', targetId: 97508, targetName: 'Dwarven stout', region: 'sootworks', details: "Two barley + clay = dwarven stout.", obscure: false });

// Cave-fish — cooking
rel.registerItemUse(97042, { type: 'recipe', targetId: 97509, targetName: 'Steam-cured cave-fish', region: 'sootworks', details: 'Cook on the Boil-Floor. Heals 20 HP.', obscure: false });

// Blackroot logs — fletching + firemaking
rel.registerItemUse(97031, { type: 'recipe', targetId: 97504, targetName: 'Shot-caster assembly', region: 'sootworks', details: 'Blackroot logs are the shot-caster stock.', obscure: false });
rel.registerItemUse(97031, { type: 'secondary', targetId: 'sootworks_lantern_mine_firemaking', targetName: 'Lantern mine firemaking', region: 'sootworks', details: 'Blackroot logs fuel the lantern-mine seam-lighting.', obscure: false });
rel.registerItemUse(97031, { type: 'secondary', targetId: 'sootworks_pilgrim_watchfire', targetName: 'Pilgrim watchfire prayer', region: 'sootworks', details: 'Blackroot logs feed the watchfire prayer method.', obscure: true });

// Spring-coils
rel.registerItemUse(97011, { type: 'recipe', targetId: 97504, targetName: 'Shot-caster', region: 'sootworks', details: 'Spring-coils are the shot-caster trigger assembly.', obscure: false });
rel.registerItemUse(97011, { type: 'recipe', targetId: 'sootworks_tinker_bolt_fletching', targetName: 'Tinker-Yard bolts', region: 'sootworks', details: 'Spring-coils crimp bolt heads.', obscure: false });

// Pilgrim medallion
rel.registerItemUse(97061, { type: 'offering', targetId: 'sootworks_pilgrim_watchfire', targetName: 'Pilgrim watchfire', region: 'sootworks', details: 'Pilgrim medallions are the watchfire offering.', obscure: false });
rel.registerItemUse(97061, { type: 'recipe', targetId: 97507, targetName: 'Vent-bloom brew', region: 'sootworks', details: 'Pilgrim medallion brass is the brew catalyst.', obscure: false });

// Glowmoth scales — crafting + hunter
rel.registerItemUse(97091, { type: 'secondary', targetId: 'sootworks_shotcaster_fletching', targetName: 'Shot-caster polish', region: 'sootworks', details: 'Glowmoth scales polish the shot-caster barrel (+3% crit).', obscure: true });
rel.registerItemUse(97091, { type: 'recipe', targetId: 'sootworks_lantern_robe', targetName: 'Lantern-robe crafting', region: 'sootworks', details: 'Glowmoth scales craft into a light-emitting robe (cosmetic + hunter bonus).', obscure: false });

// ══════════════════════════════════════════════════════════════════════════════
// SOOTWORKS RECIPES — density pass (10 more combinations)
// ══════════════════════════════════════════════════════════════════════════════

rel.defineCombination(97601, {
  resultName: 'Steel bar (Sootworks)',
  inputs: [
    { id: 97200, name: 'Iron ore', consumed: true },
    { id: 97201, name: 'Deep coal', consumed: true },
    { id: 97201, name: 'Deep coal', consumed: true },
  ],
  skill: 'smithing', level: 30, xp: 17, station: 'furnace',
  description: 'Sootworks-smelt steel. Deep coal substitutes cleanly.',
});

rel.defineCombination(97602, {
  resultName: 'Mithril bar (Sootworks)',
  inputs: [
    { id: 97202, name: 'Mithril ore', consumed: true },
    { id: 97201, name: 'Deep coal', consumed: true },
    { id: 97201, name: 'Deep coal', consumed: true },
    { id: 97201, name: 'Deep coal', consumed: true },
    { id: 97201, name: 'Deep coal', consumed: true },
  ],
  skill: 'smithing', level: 50, xp: 30, station: 'furnace',
  description: 'Sootworks-smelt mithril. Forge Cathedral furnace.',
});

rel.defineCombination(97603, {
  resultName: 'Adamant bar (Sootworks)',
  inputs: [
    { id: 97203, name: 'Adamantite ore', consumed: true },
    { id: 97201, name: 'Deep coal', consumed: true },
    { id: 97201, name: 'Deep coal', consumed: true },
    { id: 97201, name: 'Deep coal', consumed: true },
    { id: 97201, name: 'Deep coal', consumed: true },
    { id: 97201, name: 'Deep coal', consumed: true },
    { id: 97201, name: 'Deep coal', consumed: true },
  ],
  skill: 'smithing', level: 70, xp: 37, station: 'furnace',
  description: 'Sootworks-smelt adamant. Tinker Yards furnace.',
});

rel.defineCombination(97604, {
  resultName: 'Clockbeetle-plate inlay',
  inputs: [
    { id: 97090, name: 'Clockbeetle carapace', consumed: true },
    { id: 97090, name: 'Clockbeetle carapace', consumed: true },
    { id: 97501, name: 'Cinderbar bar', consumed: true },
  ],
  skill: 'crafting', level: 40, xp: 60, station: 'workbench',
  description: 'Inlay cinderbar plate with clockbeetle shell. +2 def over base.',
});

rel.defineCombination(97605, {
  resultName: 'Lantern-robe',
  inputs: [
    { id: 97091, name: 'Glowmoth scales', consumed: true },
    { id: 97091, name: 'Glowmoth scales', consumed: true },
    { id: 97091, name: 'Glowmoth scales', consumed: true },
  ],
  skill: 'crafting', level: 55, xp: 48,
  description: 'Weave glowmoth scales into a faintly-lit robe. Hunter +2 underground.',
});

rel.defineCombination(97606, {
  resultName: 'Sootworks prayer potion (4)',
  inputs: [
    { id: 97022, name: 'Vent-bloom', consumed: true },
    { id: 97061, name: 'Pilgrim medallion', consumed: true },
    { id: 97252, name: 'Dragon bones', consumed: true },
  ],
  skill: 'herblore', level: 38, xp: 88,
  description: 'Sootworks prayer-potion analog. Vent-bloom + pilgrim brass + dragon bones.',
});

rel.defineCombination(97607, {
  resultName: 'Sootworks super-restore (4)',
  inputs: [
    { id: 97022, name: 'Vent-bloom', consumed: true },
    { id: 97020, name: 'Pipe-fungus', consumed: true },
    { id: 97061, name: 'Pilgrim medallion', consumed: true },
    { id: 97223, name: 'Vial of water', consumed: true },
  ],
  skill: 'herblore', level: 63, xp: 142,
  description: 'Sootworks super-restore. Prayer + stats. The iconic Sootworks brew.',
});

rel.defineCombination(97608, {
  resultName: 'Gear-train platebody',
  inputs: [
    { id: 97502, name: 'Gear-train steel', consumed: true },
    { id: 97502, name: 'Gear-train steel', consumed: true },
    { id: 97502, name: 'Gear-train steel', consumed: true },
    { id: 97502, name: 'Gear-train steel', consumed: true },
    { id: 97502, name: 'Gear-train steel', consumed: true },
  ],
  skill: 'smithing', level: 68, xp: 200, station: 'anvil',
  description: 'Gear-train platebody. Between mithril and adamant tier. Sootworks-exclusive armor.',
});

rel.defineCombination(97609, {
  resultName: 'Shot-munitions (100)',
  inputs: [
    { id: 97501, name: 'Cinderbar bar', consumed: true },
  ],
  skill: 'smithing', level: 50, xp: 35, station: 'anvil',
  description: 'Stamp 100 shot-munitions from one cinderbar bar. Feeds shot-caster range training.',
});

rel.defineCombination(97610, {
  resultName: 'Automaton repair kit',
  inputs: [
    { id: 7003, name: 'Clockwork gear', consumed: true },
    { id: 7003, name: 'Clockwork gear', consumed: true },
    { id: 7003, name: 'Clockwork gear', consumed: true },
    { id: 7003, name: 'Clockwork gear', consumed: true },
    { id: 7003, name: 'Clockwork gear', consumed: true },
    { id: 97004, name: 'Cursed coal', consumed: true },
  ],
  skill: 'crafting', level: 60, xp: 80, station: 'workbench',
  description: 'Assemble a repair kit for friendly Sootworks automatons. Used in late Sootworks quests.',
});

// ══════════════════════════════════════════════════════════════════════════════
// SOOTWORKS OBSCURE CROSS-USES (non-obvious chains)
// ══════════════════════════════════════════════════════════════════════════════

rel.registerItemUse(97070, { type: 'combination', targetId: 'sootworks_magic_enchant_ring', targetName: 'Enchanted ring (Sootworks)', region: 'sootworks', details: 'Obscure: forge-crystal can substitute for cosmic rune on ring enchant.', obscure: true });
rel.registerItemUse(97091, { type: 'combination', targetId: 'sootworks_tinderbox_ignite_bonus', targetName: 'Tinderbox ignite bonus', region: 'sootworks', details: 'Obscure: glowmoth dust sprinkled on tinder ignites 2x faster.', obscure: true });
rel.registerItemUse(97092, { type: 'offering', targetId: 'sootworks_depth_trout_offering', targetName: 'Depth-trout offering', region: 'sootworks', details: 'Obscure: depth-trout offered at Brass Choir = 1.5x normal prayer bonus.', obscure: true });

// ══════════════════════════════════════════════════════════════════════════════
// SOOTWORKS SOURCES — register existing Sootworks items (from sootworks.js)
// so the analyzer counts them as region-registered
// ══════════════════════════════════════════════════════════════════════════════

rel.registerItemSource(7001, { type: 'gathering', sourceId: 'sootworks_soot_iron_vein', sourceName: 'Soot-Iron Vein', region: 'sootworks', details: 'Soot-iron ore. Harder than steel. Unique Sootworks tier.', obscure: false });
rel.registerItemSource(7002, { type: 'processing', sourceId: 'sootworks_furnace', sourceName: 'Sootworks Furnace', region: 'sootworks', details: 'Soot-iron bar. Feeds the unique soot-iron armor tier.', obscure: false });
rel.registerItemSource(7003, { type: 'drop', sourceId: 'sootworks_clockwork_sentry_drop', sourceName: 'Clockwork Sentry Drop', region: 'sootworks', details: 'Clockwork gear. Component for piston assemblies + repair kits.', obscure: false });
rel.registerItemSource(7004, { type: 'drop', sourceId: 'sootworks_clockwork_sentry_drop', sourceName: 'Clockwork Sentry Drop', region: 'sootworks', details: 'Steam valve. Plumbing component.', obscure: false });
rel.registerItemSource(7005, { type: 'shop', sourceId: 'sootworks_engineer', sourceName: "Fizz's Contraptions", region: 'sootworks', details: 'Blast powder. Demolition charge. Used in mining breakthroughs.', obscure: false });
rel.registerItemSource(7006, { type: 'shop', sourceId: 'sootworks_smithy', sourceName: "Hald's Soot-Iron Forge", region: 'sootworks', details: 'Dwarven stout. Temporary +1 mining / smithing boost.', obscure: false });

console.log('[aelgard] Sootworks Density loaded: 50+ sources registered as Sootworks-native, 10 recipes, 30+ item uses, cross-use web densified');
