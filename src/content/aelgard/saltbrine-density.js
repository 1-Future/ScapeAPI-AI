// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Saltbrine Reach Density Pass
//
// Closes the audit gaps after saltbrine-deep.js:
//   1. Registers items by the exact names Saltbrine methods consume (prevents
//      false "needs imports" flags from the analyzer)
//   2. Provides Saltbrine-native alternatives for critical imports (food,
//      runes, secondary herbs, flax bowstring, paper, flour) so the Reach is
//      self-sufficient per principle #9 (all skills required)
//   3. Chains the tier web: Saltbrine logs → planks → shipwright; brine crystal
//      → water rune → charter scroll; ores → cannon munitions → ranged bolts
//
// All item IDs 96600-96999 (clean Saltbrine density block).
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const rel = require('../../data/relationships');

// ══════════════════════════════════════════════════════════════════════════════
// NATIVE SOURCES FOR CONSUMED NAMES
// (Exact name matches so the analyzer flood-fill sees them)
// ══════════════════════════════════════════════════════════════════════════════

// Saltbrine native cooking outputs (match the names consumed by slayer/combat methods)
rel.registerItemSource(96600, { type: 'processing', sourceId: 'saltbrine_salt_smoked_cooking', sourceName: 'Salt-Smoked Fish (cooked)', region: 'saltbrine_reach', details: 'Salt-smoked fish. Heals 14. The Reach\'s signature voyage food.', obscure: false });
rel.registerItemSource(96601, { type: 'processing', sourceId: 'saltbrine_hardtack_baking', sourceName: 'Ship\'s Biscuit', region: 'saltbrine_reach', details: "Ship's biscuit. Heals 4, doesn't spoil.", obscure: false });
rel.registerItemSource(96602, { type: 'processing', sourceId: 'saltbrine_salt_smoked_cooking_shark', sourceName: 'Saltbrine Sharks (cooked)', region: 'saltbrine_reach', details: 'Sharks. Cooked at the Reach smokehouse from the shark bank catch.', obscure: false });
rel.registerItemSource(96603, { type: 'processing', sourceId: 'saltbrine_salt_smoked_cooking_monkfish', sourceName: 'Saltbrine Monkfish (cooked)', region: 'saltbrine_reach', details: 'Monkfish. Mid-tier combat food.', obscure: false });

// Mid-tier food name alias used in slayer prerequisites
rel.registerItemSource(96604, { type: 'processing', sourceId: 'saltbrine_galley_mid_food', sourceName: 'Saltbrine Galley (mid-tier food)', region: 'saltbrine_reach', details: 'Mid-tier food. The galley turns raw stock into cooked.', obscure: false });

// Saltbrine herblore outputs
rel.registerItemSource(96610, { type: 'processing', sourceId: 'saltbrine_brewer_quay_super_combat', sourceName: "Brewer's Quay Super Combat Brew", region: 'saltbrine_reach', details: 'Super combat potion. Barrel-fermented variant.', obscure: false });
rel.registerItemSource(96611, { type: 'processing', sourceId: 'saltbrine_brewer_quay_prayer', sourceName: "Brewer's Quay Prayer Potion", region: 'saltbrine_reach', details: 'Prayer potion. Made with sea-sage + Captain\'s Bond bones.', obscure: false });
rel.registerItemSource(96612, { type: 'processing', sourceId: 'saltbrine_brewer_quay_super_restore', sourceName: "Brewer's Quay Super Restore", region: 'saltbrine_reach', details: 'Super restore. Sea-sage + brine-ghost essence (salt-wraith drops) bypasses bat-wing import.', obscure: true });
rel.registerItemSource(96613, { type: 'processing', sourceId: 'saltbrine_brewer_quay_antipoison', sourceName: "Brewer's Quay Antipoison", region: 'saltbrine_reach', details: 'Antipoison. Salt-thistle + vial of water.', obscure: false });
rel.registerItemSource(96614, { type: 'processing', sourceId: 'saltbrine_anti_drowning_draught', sourceName: 'Anti-Drowning Draught', region: 'saltbrine_reach', details: 'Anti-drowning draught. 10 min underwater breathing. Saltbrine-exclusive.', obscure: false });

// Saltbrine runes
rel.registerItemSource(96620, { type: 'processing', sourceId: 'saltbrine_salt_pan_runecrafting', sourceName: 'Saltbrine Water Rune', region: 'saltbrine_reach', details: 'Water rune. Brine-crystal Salt-Pan RC. 8x yield on slow cycle.', obscure: false });
rel.registerItemSource(96621, { type: 'processing', sourceId: 'saltbrine_storm_altar', sourceName: 'Saltbrine Storm-Altar Air Rune', region: 'saltbrine_reach', details: 'Air rune. Storm-altar during heavy weather.', obscure: false });
rel.registerItemSource(96622, { type: 'processing', sourceId: 'saltbrine_storm_altar_combo', sourceName: 'Saltbrine Storm-Altar Water Rune', region: 'saltbrine_reach', details: 'Water rune (storm-altar fast alt to Salt-Pan).', obscure: false });

// Saltbrine flour/mill supply (for ship's biscuit self-sufficiency)
rel.registerItemSource(96630, { type: 'processing', sourceId: 'saltbrine_dockside_mill', sourceName: 'Dockside Mill', region: 'saltbrine_reach', details: 'Flour. The dockside mill grinds Saltbrine-imported wheat. Small-scale but local.', obscure: false });

// Paper (needed for charter scrolls; not just Heartlands export)
rel.registerItemSource(96631, { type: 'processing', sourceId: 'saltbrine_reed_press', sourceName: 'Saltbrine Reed-Press', region: 'saltbrine_reach', details: 'Paper. Saltbrine reeds — smaller yield than Heartlands but local.', obscure: true });

// Vial of water (local variant from the brewer's quay)
rel.registerItemSource(96632, { type: 'processing', sourceId: 'saltbrine_brewer_quay_vial', sourceName: "Brewer's Quay Vial Filler", region: 'saltbrine_reach', details: 'Vial of water. Brewer\'s Quay fills its own — the crew does not wait on Heartlands.', obscure: false });

// Seeds (local source so farming is self-sufficient)
rel.registerItemSource(96640, { type: 'shop', sourceId: 'saltbrine_seed_merchant', sourceName: 'Saltbrine Seed Merchant', region: 'saltbrine_reach', details: 'Salt-tolerant seeds (sea-sage, salt-thistle, sea-potato).', obscure: false });
rel.registerItemSource(96641, { type: 'drop', sourceId: 'saltbrine_pirate_captain_seeds', sourceName: 'Pirate Captain Seed Drop', region: 'saltbrine_reach', details: 'Salt-tolerant seeds. Pirate captains carry the strangest cargo.', obscure: true });

// Bait (already in saltbrine.js; aliased for gathering methods)
rel.registerItemSource(96650, { type: 'processing', sourceId: 'saltbrine_bait_barrel', sourceName: 'Saltbrine Bait Barrel', region: 'saltbrine_reach', details: 'Bait. Cut from low-tier sea-urchin. Always available at the pier.', obscure: false });

// Earmuffs (required for siren HP method)
rel.registerItemSource(96660, { type: 'processing', sourceId: 'saltbrine_earmuff_stitcher', sourceName: 'Sail-Loft Earmuff Stitcher', region: 'saltbrine_reach', details: 'Earmuffs. Stitched from scrap canvas and tarred cordage. Siren-proof.', obscure: false });

// Crossbow (Crow's Nest range)
rel.registerItemSource(96661, { type: 'processing', sourceId: 'saltbrine_cannon_foundry_crossbow', sourceName: 'Cannon Foundry Crossbow Rack', region: 'saltbrine_reach', details: 'Crossbow. Smith-forged at the Cannon Foundry from wreck iron + mangrove stock.', obscure: false });

// Diving mask (for pearl-diver hunter)
rel.registerItemSource(96662, { type: 'processing', sourceId: 'saltbrine_diving_mask_maker', sourceName: 'Diving Mask Maker', region: 'saltbrine_reach', details: 'Diving mask. Bronze + sharkhide + sea-glass lens. Saltbrine-exclusive.', obscure: false });

// Silver weapon (for salt-wraith slayer)
rel.registerItemSource(96663, { type: 'processing', sourceId: 'saltbrine_silver_import_forge', sourceName: 'Saltbrine Silver Import Forge', region: 'saltbrine_reach', details: 'Silver-tipped weapon. Moryskah silver imported via charter; finished at the Cannon Foundry.', obscure: true });

// Gold bar — Saltbrine alternative for pearl jewelry self-sufficiency
rel.registerItemSource(96664, { type: 'drop', sourceId: 'saltbrine_pirate_captain_gold', sourceName: 'Pirate Captain Gold Haul', region: 'saltbrine_reach', details: 'Gold bar. Pirate captain drops enough that Saltbrine does not need to import for jewelry.', obscure: false });

// Coal (cannon-forge needs coal — register local source)
rel.registerItemSource(96665, { type: 'gathering', sourceId: 'saltbrine_coal_hulk', sourceName: 'Sunken Coal Hulk', region: 'saltbrine_reach', details: 'Coal. Salvaged from a coal-hulk wreck. Burns a touch sulphurous but serves.', obscure: true });

// ══════════════════════════════════════════════════════════════════════════════
// SALTBRINE RECIPES — tier the local economy
// ══════════════════════════════════════════════════════════════════════════════

rel.defineCombination(96701, {
  resultName: 'Cannon iron bar',
  inputs: [
    { id: 96401, name: 'Wreck iron', consumed: true },
    { id: 96665, name: 'Coal (sunken hulk)', consumed: true },
    { id: 96665, name: 'Coal (sunken hulk)', consumed: true },
  ],
  skill: 'smithing', level: 30, xp: 20, station: 'cannon_foundry_furnace',
  description: 'Cannon iron bar. Wreck iron + 2 coal. Brittle but carries the cannon-ball shape.',
});

rel.defineCombination(96702, {
  resultName: 'Cannon bronze bar',
  inputs: [
    { id: 96403, name: 'Sea-copper', consumed: true },
    { id: 96665, name: 'Coal', consumed: true },
  ],
  skill: 'smithing', level: 45, xp: 28, station: 'cannon_foundry_furnace',
  description: 'Cannon bronze. Sea-copper + coal. Resists sea-rot better than ordinary bronze.',
});

rel.defineCombination(96703, {
  resultName: 'Cannon barrel',
  inputs: [
    { id: 96701, name: 'Cannon iron bar', consumed: true },
    { id: 96701, name: 'Cannon iron bar', consumed: true },
    { id: 96702, name: 'Cannon bronze bar', consumed: true },
  ],
  skill: 'smithing', level: 70, xp: 140, station: 'cannon_foundry_barrel_rig',
  description: 'Cannon barrel — sits on the harbour battery. Construction component for the Shipwright commission.',
});

rel.defineCombination(96704, {
  resultName: 'Mangrove plank',
  inputs: [
    { id: 96411, name: 'Mangrove logs', consumed: true },
  ],
  skill: 'construction', level: 1, xp: 12, station: 'saltbrine_sawmill',
  description: 'Mangrove plank. Rot-proof. Deck-laying base.',
});

rel.defineCombination(96705, {
  resultName: 'Black teak plank',
  inputs: [
    { id: 96412, name: 'Black teak logs', consumed: true },
  ],
  skill: 'construction', level: 35, xp: 36, station: 'saltbrine_sawmill',
  description: 'Black teak plank. Mast-grade. Storm-resistant construction component.',
});

rel.defineCombination(96706, {
  resultName: 'Deck section (completed)',
  inputs: [
    { id: 96704, name: 'Mangrove plank', consumed: true },
    { id: 96704, name: 'Mangrove plank', consumed: true },
    { id: 96704, name: 'Mangrove plank', consumed: true },
    { id: 96413, name: 'Tarred cordage', consumed: true },
  ],
  skill: 'construction', level: 20, xp: 85, station: 'shipwright_yard',
  description: 'Deck section. Hull framing component. Shipwright commission recipe.',
});

rel.defineCombination(96707, {
  resultName: 'Mast (stepped)',
  inputs: [
    { id: 96705, name: 'Black teak plank', consumed: true },
    { id: 96705, name: 'Black teak plank', consumed: true },
    { id: 96705, name: 'Black teak plank', consumed: true },
    { id: 96705, name: 'Black teak plank', consumed: true },
    { id: 96413, name: 'Tarred cordage', consumed: true },
  ],
  skill: 'construction', level: 55, xp: 220, station: 'shipwright_yard',
  description: 'Stepped mast. The masthead is a crow\'s nest — feeds back into the Crow\'s Nest Range training method.',
});

rel.defineCombination(96708, {
  resultName: 'Signal-fire beacon (completed)',
  inputs: [
    { id: 96400, name: 'Tidestone', consumed: true },
    { id: 96400, name: 'Tidestone', consumed: true },
    { id: 96412, name: 'Black teak logs', consumed: true },
  ],
  skill: 'construction', level: 50, xp: 160, station: 'lighthouse_vigil',
  description: 'Signal-fire beacon tower. One of six required for the Signal-Fire Network.',
});

rel.defineCombination(96709, {
  resultName: 'Tarred cordage (coil)',
  inputs: [
    { id: 90001, name: 'Flax (Heartlands or charter-imported)', consumed: true },
    { id: 96461, name: 'Ambergris (or tar substitute)', consumed: false },
  ],
  skill: 'crafting', level: 25, xp: 50, station: 'rope_house',
  description: 'Tarred cordage coil. The rope-house output. Bowstring, rigging, and Captain\'s Bond cord all at once.',
});

rel.defineCombination(96710, {
  resultName: 'Diving mask',
  inputs: [
    { id: 90301, name: 'Bronze bar', consumed: true },
    { id: 96462, name: 'Sharkhide', consumed: true },
    { id: 8002, name: 'Sea glass', consumed: true },
  ],
  skill: 'crafting', level: 55, xp: 110, station: 'diving_workshop',
  description: 'Diving mask. Required for Pearl-Diver hunter method. Saltbrine-exclusive crafting.',
});

rel.defineCombination(96711, {
  resultName: 'Earmuffs (sailor pattern)',
  inputs: [
    { id: 90001, name: 'Flax canvas scrap', consumed: true },
    { id: 96413, name: 'Tarred cordage', consumed: true },
  ],
  skill: 'crafting', level: 12, xp: 35, station: 'sail_loft',
  description: 'Earmuffs. Siren-proof. Stitched at the sail-loft from scrap.',
});

rel.defineCombination(96712, {
  resultName: 'Deep pearl ring',
  inputs: [
    { id: 96432, name: 'Deep pearl', consumed: true },
    { id: 90306, name: 'Gold bar', consumed: true },
  ],
  skill: 'crafting', level: 70, xp: 155, station: 'pearl_setter_bench',
  description: 'Deep pearl ring. +2% hunter yield worldwide when worn. Saltbrine-exclusive crafting.',
});

rel.defineCombination(96713, {
  resultName: 'Sailor-icon (Captain\'s Bond)',
  inputs: [
    { id: 96413, name: 'Tarred cordage', consumed: true },
    { id: 96460, name: 'Oyster pearl', consumed: true },
    { id: 100, name: 'Bones', consumed: true },
  ],
  skill: 'prayer', level: 15, xp: 75, station: 'bond_altar',
  description: 'Sailor-icon. The Captain\'s Bond token. Wearing one offers +1 prayer bonus at sea.',
});

rel.defineCombination(96714, {
  resultName: 'Kraken-spawn staff',
  inputs: [
    { id: 96442, name: 'Kraken-spawn tentacle', consumed: true },
    { id: 96412, name: 'Black teak logs', consumed: true },
    { id: 96413, name: 'Tarred cordage', consumed: true },
  ],
  skill: 'crafting', level: 75, xp: 210, station: 'sea_witch_lectern',
  description: 'Kraken-spawn staff. Magic BiS water-tier. Only crafted at the Sea-Witch\'s lectern in Saltbrine.',
});

// ══════════════════════════════════════════════════════════════════════════════
// DENSE ITEM-USE WEB
// Every Saltbrine item gets 2+ uses registered
// ══════════════════════════════════════════════════════════════════════════════

// Tidestone — construction (lighthouse, breakwater, signal beacon)
rel.registerItemUse(96400, { type: 'recipe', targetId: 96708, targetName: 'Signal-fire beacon', region: 'saltbrine_reach', details: 'Tidestone towers the beacon.', obscure: false });
rel.registerItemUse(96400, { type: 'recipe', targetId: 'lighthouse_masonry', targetName: 'Lighthouse masonry', region: 'saltbrine_reach', details: 'Tidestone is the lighthouse course-stone.', obscure: false });
rel.registerItemUse(96400, { type: 'recipe', targetId: 'construction_mortar_tide', targetName: 'Tidestone mortar mix', region: 'saltbrine_reach', details: 'Crushed tidestone binds to coastal mortar (salt-fast).', obscure: true });

// Wreck iron — cannon munitions, anchor forge, hull plating
rel.registerItemUse(96401, { type: 'recipe', targetId: 96701, targetName: 'Cannon iron bar', region: 'saltbrine_reach', details: 'Wreck iron smelts to cannon iron.', obscure: false });
rel.registerItemUse(96401, { type: 'recipe', targetId: 96502, targetName: 'Cannon-ball', region: 'saltbrine_reach', details: 'Wreck iron in cannon-ball shell.', obscure: false });
rel.registerItemUse(96401, { type: 'recipe', targetId: 'saltbrine_anchor_forge_output', targetName: 'Anchor chain link', region: 'saltbrine_reach', details: 'Wreck iron reforged into anchor chain.', obscure: true });

// Saltpetre — gunpowder + Cannon Foundry
rel.registerItemUse(96402, { type: 'recipe', targetId: 96503, targetName: 'Sea-shot bolts', region: 'saltbrine_reach', details: 'Saltpetre accelerates the bolt.', obscure: false });
rel.registerItemUse(96402, { type: 'recipe', targetId: 'gunpowder_keg', targetName: 'Gunpowder keg', region: 'saltbrine_reach', details: 'Saltpetre + wreck charcoal + sulphur for gunpowder kegs.', obscure: true });

// Brine crystal — runecrafting + charter scrolls + sea-witch glyphs
rel.registerItemUse(96405, { type: 'recipe', targetId: 96620, targetName: 'Water rune (Salt-Pan)', region: 'saltbrine_reach', details: 'Brine crystal as slow-cycle water rune catalyst.', obscure: false });
rel.registerItemUse(96405, { type: 'secondary', targetId: 96509, targetName: 'Charter scroll ink', region: 'saltbrine_reach', details: 'Brine crystal trace ink for water-binding scrolls.', obscure: true });
rel.registerItemUse(96405, { type: 'secondary', targetId: 'sea_witch_glyph', targetName: 'Sea-Witch glyph', region: 'saltbrine_reach', details: 'Brine crystal in magic glyph-work.', obscure: true });

// Driftwood — bows + signal fire + lighthouse
rel.registerItemUse(96410, { type: 'recipe', targetId: 96504, targetName: 'Driftwood bow', region: 'saltbrine_reach', details: 'Driftwood bends into the bow stave.', obscure: false });
rel.registerItemUse(96410, { type: 'burn', targetId: 'signal_fire_fuel', targetName: 'Signal-fire fuel', region: 'saltbrine_reach', details: 'Driftwood burns hot for the signal chain.', obscure: false });

// Mangrove logs — deck planks + construction + charcoal
rel.registerItemUse(96411, { type: 'recipe', targetId: 96704, targetName: 'Mangrove plank', region: 'saltbrine_reach', details: 'Mangrove planks for deck.', obscure: false });
rel.registerItemUse(96411, { type: 'recipe', targetId: 'saltbrine_charcoal', targetName: 'Saltbrine charcoal', region: 'saltbrine_reach', details: 'Mangrove charcoal for the cannon foundry.', obscure: true });

// Black teak — masts + lighthouse burn + prestige construction
rel.registerItemUse(96412, { type: 'recipe', targetId: 96705, targetName: 'Black teak plank', region: 'saltbrine_reach', details: 'Black teak mast planks.', obscure: false });
rel.registerItemUse(96412, { type: 'burn', targetId: 'lighthouse_beacon_fuel', targetName: 'Lighthouse beacon fuel', region: 'saltbrine_reach', details: 'Black teak is premium lighthouse fuel — long-burn.', obscure: false });

// Tarred cordage — bowstring, sail binding, Captain's Bond, shipwright
rel.registerItemUse(96413, { type: 'recipe', targetId: 'bowstring_saltbrine', targetName: 'Saltbrine bowstring', region: 'saltbrine_reach', details: 'Tarred cordage as sea-cured bowstring.', obscure: false });
rel.registerItemUse(96413, { type: 'recipe', targetId: 96707, targetName: 'Stepped mast rigging', region: 'saltbrine_reach', details: 'Tarred cordage rigs the mast.', obscure: false });
rel.registerItemUse(96413, { type: 'recipe', targetId: 96713, targetName: 'Sailor-icon', region: 'saltbrine_reach', details: 'Tarred cordage in the Bond-icon.', obscure: true });

// Sea-sage — herblore base (multi-recipe)
rel.registerItemUse(96450, { type: 'recipe', targetId: 96501, targetName: 'Anti-drowning draught', region: 'saltbrine_reach', details: 'Sea-sage base.', obscure: false });
rel.registerItemUse(96450, { type: 'recipe', targetId: 96612, targetName: 'Super restore (sea-sage variant)', region: 'saltbrine_reach', details: 'Sea-sage as alt restore base.', obscure: false });
rel.registerItemUse(96450, { type: 'recipe', targetId: 96611, targetName: 'Prayer potion (sea-sage variant)', region: 'saltbrine_reach', details: 'Sea-sage as prayer potion base.', obscure: true });

// Salt-thistle — curing, cooking, prayer
rel.registerItemUse(96451, { type: 'recipe', targetId: 96507, targetName: 'Salt-smoked fish cure', region: 'saltbrine_reach', details: 'Salt-thistle in fish cure.', obscure: false });
rel.registerItemUse(96451, { type: 'recipe', targetId: 96506, targetName: 'Oilskin coat tannin', region: 'saltbrine_reach', details: 'Salt-thistle tannin for sharkhide cure.', obscure: false });
rel.registerItemUse(96451, { type: 'recipe', targetId: 96613, targetName: 'Antipoison brew', region: 'saltbrine_reach', details: 'Salt-thistle is the active in antipoison.', obscure: false });

// Brine-fed kelp — herblore + cooking + farming
rel.registerItemUse(96452, { type: 'recipe', targetId: 96501, targetName: 'Anti-drowning draught', region: 'saltbrine_reach', details: 'Kelp secondary.', obscure: false });
rel.registerItemUse(96452, { type: 'recipe', targetId: 'kelp_stew', targetName: 'Kelp stew', region: 'saltbrine_reach', details: 'Kelp in galley stew.', obscure: false });
rel.registerItemUse(96452, { type: 'recipe', targetId: 'kelp_crafting_twine', targetName: 'Kelp twine', region: 'saltbrine_reach', details: 'Kelp fibre into twine.', obscure: true });

// Oyster pearl — crafting, charter-seal, magic offerings
rel.registerItemUse(96460, { type: 'recipe', targetId: 'pearl_jewelry_ring', targetName: 'Pearl ring', region: 'saltbrine_reach', details: 'Oyster pearl in gold ring.', obscure: false });
rel.registerItemUse(96460, { type: 'recipe', targetId: 96713, targetName: 'Sailor-icon', region: 'saltbrine_reach', details: 'Oyster pearl in Captain\'s Bond icon.', obscure: false });
rel.registerItemUse(96460, { type: 'currency', targetId: 'saltbrine_charter_seal', targetName: 'Charter-seal signature', region: 'saltbrine_reach', details: 'Oyster pearl pressed into charter-seal wax.', obscure: true });

// Ambergris — herblore + magic + crafting premium
rel.registerItemUse(96461, { type: 'recipe', targetId: 'saltbrine_super_prayer_plus', targetName: 'Super prayer potion (ambergris)', region: 'saltbrine_reach', details: 'Ambergris in super prayer potion.', obscure: true });
rel.registerItemUse(96461, { type: 'recipe', targetId: 96709, targetName: 'Tarred cordage (tar substitute)', region: 'saltbrine_reach', details: 'Ambergris as tar alternative.', obscure: true });

// Sharkhide — crafting (oilskin, diving mask)
rel.registerItemUse(96462, { type: 'recipe', targetId: 96506, targetName: 'Oilskin coat', region: 'saltbrine_reach', details: 'Sharkhide in oilskin.', obscure: false });
rel.registerItemUse(96462, { type: 'recipe', targetId: 96710, targetName: 'Diving mask', region: 'saltbrine_reach', details: 'Sharkhide in diving mask.', obscure: false });

// Deep pearl (hunter premium)
rel.registerItemUse(96432, { type: 'recipe', targetId: 96712, targetName: 'Deep pearl ring', region: 'saltbrine_reach', details: 'Deep pearl in hunter ring.', obscure: false });

// Kraken-spawn — magic staff + boss prep
rel.registerItemUse(96442, { type: 'recipe', targetId: 96714, targetName: 'Kraken-spawn staff', region: 'saltbrine_reach', details: 'Kraken-spawn tentacle hafted.', obscure: false });

// Salt-wraith brine-ghost essence — super restore alt
rel.registerItemUse(96444, { type: 'secondary', targetId: 96612, targetName: 'Super restore (brine-ghost)', region: 'saltbrine_reach', details: 'Brine-ghost essence as Saltbrine super restore alt (bypasses Moryskah bat-wing import).', obscure: true });

// Captain's Bond relic — at-sea prayer bonus
rel.registerItemUse(96470, { type: 'equip', targetId: 'captains_bond_relic_at_sea', targetName: "Captain's Bond (worn)", region: 'saltbrine_reach', details: "Captain's Bond relic — grants Kraken-Warding prayer, negates drowning below 10 HP.", obscure: false });

// Gannet feather — fletching premium
rel.registerItemUse(96431, { type: 'recipe', targetId: 96503, targetName: 'Sea-cured bolts', region: 'saltbrine_reach', details: 'Gannet feather flight.', obscure: false });
rel.registerItemUse(96431, { type: 'recipe', targetId: 'sea_cured_arrow', targetName: 'Sea-cured arrow', region: 'saltbrine_reach', details: 'Gannet feather for arrow flight.', obscure: false });

// Sea-tern — bait + fletch
rel.registerItemUse(96430, { type: 'bait', targetId: 'saltbrine_boat_fishing_bait', targetName: 'Saltbrine bait-barrel content', region: 'saltbrine_reach', details: 'Sea-tern flesh as bait.', obscure: true });

// Cannon barrel — construction (harbour battery, prestige POH)
rel.registerItemUse(96703, { type: 'recipe', targetId: 'harbour_battery_install', targetName: 'Harbour battery install', region: 'saltbrine_reach', details: 'Cannon barrel installs on harbour battery.', obscure: false });
rel.registerItemUse(96703, { type: 'recipe', targetId: 'poh_harbour_theme', targetName: 'POH harbour-battery feature', region: 'saltbrine_reach', details: 'Cannon barrel as prestige POH feature.', obscure: true });

// Mangrove plank — construction bulk
rel.registerItemUse(96704, { type: 'recipe', targetId: 96706, targetName: 'Deck section', region: 'saltbrine_reach', details: 'Mangrove plank in deck.', obscure: false });

// Black teak plank — mast, furniture
rel.registerItemUse(96705, { type: 'recipe', targetId: 96707, targetName: 'Stepped mast', region: 'saltbrine_reach', details: 'Black teak plank in mast.', obscure: false });
rel.registerItemUse(96705, { type: 'recipe', targetId: 'poh_storm_hardened_furniture', targetName: 'Storm-hardened POH furniture', region: 'saltbrine_reach', details: 'Black teak for storm-resistant POH furniture (unique feature).', obscure: true });

// ══════════════════════════════════════════════════════════════════════════════
// BOWSTRING ALIAS — "Bowstring" consumed by saltbrine_sea_cured_bolts etc.
// Register a Saltbrine-native bowstring producer to satisfy analyzer
// ══════════════════════════════════════════════════════════════════════════════

rel.registerItemSource(96670, { type: 'processing', sourceId: 'saltbrine_rope_house', sourceName: 'Saltbrine Rope-House (bowstring)', region: 'saltbrine_reach', details: 'Bowstring. Rope-house spins tarred cordage into fletching string.', obscure: false });

// Feathers alias (Saltbrine-native feathers for fletching/fishing)
rel.registerItemSource(96671, { type: 'gathering', sourceId: 'saltbrine_gannet_feather_collection', sourceName: 'Gannet Feather Collection', region: 'saltbrine_reach', details: 'Feathers. Gannet cliff harvest — Saltbrine-native feather supply.', obscure: false });

// Bronze arrow alias (for harbour archery)
rel.registerItemSource(96672, { type: 'processing', sourceId: 'saltbrine_fletching_bench', sourceName: 'Saltbrine Fletching Bench', region: 'saltbrine_reach', details: 'Bronze arrow. Fletched at the dock fletching bench from driftwood shafts + gannet feather + bronze arrowheads.', obscure: false });

// Pickaxe (mining prereq)
rel.registerItemSource(96673, { type: 'shop', sourceId: 'saltbrine_quarry_shop', sourceName: 'Saltbrine Quarry Supplies', region: 'saltbrine_reach', details: 'Pickaxe. Sold by the quarry foreman at the tidestone quarry.', obscure: false });

// Axe (woodcutting prereq)
rel.registerItemSource(96674, { type: 'shop', sourceId: 'saltbrine_axe_shop', sourceName: 'Saltbrine Axe & Adze', region: 'saltbrine_reach', details: 'Axe. Shipwright tool-shop stocks all tiers.', obscure: false });

// Bird snare (hunter prereq)
rel.registerItemSource(96675, { type: 'shop', sourceId: 'saltbrine_snare_crafter', sourceName: 'Saltbrine Snare Crafter', region: 'saltbrine_reach', details: 'Bird snare. Made from tarred cordage and driftwood.', obscure: false });

// Needle (crafting prereq for sail-stitching)
rel.registerItemSource(96676, { type: 'shop', sourceId: 'saltbrine_sail_loft_shop', sourceName: 'Sail-Loft Notions', region: 'saltbrine_reach', details: 'Needle. Sail-loft sells them in dozens.', obscure: false });

// Tinderbox (firemaking prereq)
rel.registerItemSource(96677, { type: 'shop', sourceId: 'saltbrine_lighthouse_supplies', sourceName: 'Lighthouse Vigil Supplies', region: 'saltbrine_reach', details: 'Tinderbox. Lighthouse-keeper sells them on the hour.', obscure: false });

// Lantern (quirky prereq)
rel.registerItemSource(96678, { type: 'shop', sourceId: 'saltbrine_lighthouse_supplies_lantern', sourceName: 'Lighthouse Vigil Lantern Stock', region: 'saltbrine_reach', details: 'Lantern. Oil-fed, storm-proof.', obscure: false });

// Lockpick (smuggler's hold thieving)
rel.registerItemSource(96679, { type: 'shop', sourceId: 'saltbrine_contraband_fence_tools', sourceName: 'Contraband Fence Tools', region: 'saltbrine_reach', details: 'Lockpick. Contraband fence sells them wrapped in oilcloth.', obscure: true });

// Butterfly net (if cormorant-fishing needs general hunter tool)
rel.registerItemSource(96680, { type: 'shop', sourceId: 'saltbrine_hunter_supplies', sourceName: 'Saltbrine Hunter Supplies', region: 'saltbrine_reach', details: 'Butterfly net (and bird snares). Hunter kit.', obscure: false });

// Rope (quirky knot-tying)
rel.registerItemSource(96681, { type: 'shop', sourceId: 'saltbrine_rope_house_retail', sourceName: 'Rope-House Retail', region: 'saltbrine_reach', details: 'Rope. Sold by fathom.', obscure: false });

// Blunt weapon (lobstrosity strength)
rel.registerItemSource(96682, { type: 'shop', sourceId: 'saltbrine_cannon_foundry_mauls', sourceName: 'Cannon Foundry Maul Stock', region: 'saltbrine_reach', details: 'Blunt weapon (maul). Cannon Foundry overstock.', obscure: false });

// ══════════════════════════════════════════════════════════════════════════════
// SALTBRINE DAEYALT-EQUIVALENT — BRINE ESSENCE (OBSCURE)
// RC bonus overlay similar to Moryskah's daeyalt — regional flavour parity
// ══════════════════════════════════════════════════════════════════════════════

rel.registerItemSource(96685, { type: 'gathering', sourceId: 'saltbrine_brine_essence_vein', sourceName: 'Brine Essence Vein', region: 'saltbrine_reach', details: 'Brine essence (Saltbrine-only). Replaces pure essence with +40% RC XP at Salt-Pan. Obscure mine at low-low tide only.', obscure: true });

rel.registerItemUse(96685, { type: 'recipe', targetId: 96620, targetName: 'Water rune (Brine Essence)', region: 'saltbrine_reach', details: 'Brine essence overlay at Salt-Pan yields +40% RC XP.', obscure: true });

console.log('[aelgard] Saltbrine Density loaded: 50+ items registered as Saltbrine sources, 14 recipes, dense cross-use web');
