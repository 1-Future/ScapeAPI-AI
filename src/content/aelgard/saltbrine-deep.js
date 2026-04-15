// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Saltbrine Reach Deepening (Flagship Region #3 — Sailor Identity)
//
// Target: 16 → 85+ depth. 14 blocked skills to unblock, 2 low caps to raise.
//
// Saltbrine is the pirate coast — but not yo-ho cartoon piracy. The voice is
// Patrick O'Brian: sailor cadence, under-spoken professionalism, knots and
// rope and charter vellum. "She comes about. She pays. She holds the wind by
// the throat." Names compound: Brine-Ghost, Salt-Tongue, Chart-Wife,
// Anchor-Sworn.
//
// Identity anchors (content hooks):
//   - The Wreck Coast          — deep-water boat-only fishing
//   - Charter Houses           — sailing trade routes, vouchers, ferry net
//   - The Salt Pans            — brine-crystal runecrafting on slow cycles
//   - Captain's Bond           — sailor-icon prayer, kraken-warding chants
//   - Piratesfall Cliffs       — mast-climbing, rope-bridge agility
//   - The Smuggler's Hold      — manifest forgery, customs-evasion thieving
//   - The Brewer's Quay        — barrel-fermented herblore, sea-medicine
//   - Cannon Foundry           — cannon-forged ranged munitions smithing
//   - Crow's Nest Range        — rigging-sniper ranged
//   - Scuttler Pits            — kraken-spawn / brine-troll / salt-vampire slayer
//   - Shipwright's Yard        — bulk hull / deck / mast construction
//   - Tide-Tide Farms          — brine-fed kelp & salt-resistant crops
//   - Salt-Smoked              — fish-cure cooking, hardtack, ship's biscuit
//   - Lighthouse Vigil         — beacon-chain firemaking, signal teleport net
//   - Salty Fletching          — driftwood bows, sea-cured bolts
//   - The Sea Witch            — charter-conjure magic, water-tier spells
//   - Hunter                   — sea-bird snares, pearl-dive traps
//
// This file ADDS content. saltbrine.js stays intact.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const rel = require('../../data/relationships');

// ══════════════════════════════════════════════════════════════════════════════
// SALTBRINE-NATIVE ITEMS (IDs 96400-96999)
// Sailor-themed resources unique to the coast
// ══════════════════════════════════════════════════════════════════════════════

// Raw stone / ore from the coast
rel.registerItemSource(96400, { type: 'gathering', sourceId: 'saltbrine_tidestone_quarry', sourceName: 'Tidestone Quarry', region: 'saltbrine_reach', details: 'Tidestone. Cut from cliffs at low water. Breakwater construction. Deck ballast.', obscure: false });
rel.registerItemSource(96401, { type: 'gathering', sourceId: 'saltbrine_wreck_iron', sourceName: 'Wreck Iron Salvage', region: 'saltbrine_reach', details: 'Wreck iron. Rust-eaten hull plate. Smelts into cannon iron — strong, brittle.', obscure: false });
rel.registerItemSource(96402, { type: 'gathering', sourceId: 'saltbrine_saltpetre_cave', sourceName: 'Saltpetre Cave', region: 'saltbrine_reach', details: 'Saltpetre. Powders the cannon. Gunpowder component.', obscure: false });
rel.registerItemSource(96403, { type: 'gathering', sourceId: 'saltbrine_copper_cliff', sourceName: 'Copper Cliff Face', region: 'saltbrine_reach', details: 'Sea-copper. Verdigris-green. Cannon-bronze alloy.', obscure: false });
rel.registerItemSource(96404, { type: 'gathering', sourceId: 'saltbrine_lead_reef', sourceName: 'Lead Reef', region: 'saltbrine_reach', details: 'Lead. Cast into shot. Sinks keels. The gunner\'s friend.', obscure: false });
rel.registerItemSource(96405, { type: 'gathering', sourceId: 'saltbrine_brine_crystal', sourceName: 'Brine Crystal Seam', region: 'saltbrine_reach', details: 'Brine crystal. Salt-imbued essence. Water runes in slow cycle.', obscure: false });

// Driftwood & coastal timber
rel.registerItemSource(96410, { type: 'gathering', sourceId: 'saltbrine_driftwood_line', sourceName: 'Driftwood Tide-Line', region: 'saltbrine_reach', details: 'Driftwood. Cured by sea. Bends into bows without breaking.', obscure: false });
rel.registerItemSource(96411, { type: 'gathering', sourceId: 'saltbrine_mangrove_grove', sourceName: 'Mangrove Grove', region: 'saltbrine_reach', details: 'Mangrove logs. Rot-proof. Deck planking, jetty pilings.', obscure: false });
rel.registerItemSource(96412, { type: 'gathering', sourceId: 'saltbrine_black_teak', sourceName: 'Black Teak Stand', region: 'saltbrine_reach', details: 'Black teak. Salt-hardened. Mast timber — withstands storm strain.', obscure: false });
rel.registerItemSource(96413, { type: 'gathering', sourceId: 'saltbrine_tarred_cordage', sourceName: 'Tarred Cordage Coil', region: 'saltbrine_reach', details: 'Tarred cordage. Rope-house output. Rigging and fletching string.', obscure: true });

// Fish — expand on existing Saltbrine catalogue
rel.registerItemSource(96420, { type: 'gathering', sourceId: 'saltbrine_deep_tuna_spot', sourceName: 'Deep Tuna Spot', region: 'saltbrine_reach', details: 'Deep tuna. Boat-only. Two men on a harpoon, or none come home.', obscure: false });
rel.registerItemSource(96421, { type: 'gathering', sourceId: 'saltbrine_cove_urchin', sourceName: 'Cove Urchin Beds', region: 'saltbrine_reach', details: 'Sea urchin. Cooking + crafting. Spines to needles; meat to dockside stew.', obscure: false });
rel.registerItemSource(96422, { type: 'gathering', sourceId: 'saltbrine_reef_squid', sourceName: 'Reef Squid Beds', region: 'saltbrine_reach', details: 'Reef squid. Ink secondary for scribes. Flesh cures to salt-smoked strips.', obscure: false });
rel.registerItemSource(96423, { type: 'gathering', sourceId: 'saltbrine_black_mackerel_run', sourceName: 'Black Mackerel Run', region: 'saltbrine_reach', details: 'Black mackerel. Schooling. Cure into hardtack fish for long voyages.', obscure: false });
rel.registerItemSource(96424, { type: 'gathering', sourceId: 'saltbrine_wreck_pike', sourceName: 'Wreck Pike Hollow', region: 'saltbrine_reach', details: 'Wreck pike. Hides in sunken hulls. Knows the dead by name.', obscure: true });

// Sea-bird hunter quarry
rel.registerItemSource(96430, { type: 'gathering', sourceId: 'saltbrine_tern_snare', sourceName: 'Tern Snare Ledge', region: 'saltbrine_reach', details: 'Sea-tern. Feathers for fletching. Flesh for bait.', obscure: false });
rel.registerItemSource(96431, { type: 'gathering', sourceId: 'saltbrine_gannet_cliff', sourceName: 'Gannet Cliff Net', region: 'saltbrine_reach', details: 'Gannet. Oilier feathers — fly-fishing premium. Crafts into sailor-oilskin.', obscure: false });
rel.registerItemSource(96432, { type: 'gathering', sourceId: 'saltbrine_pearl_diver_grotto', sourceName: 'Pearl-Diver Grotto', region: 'saltbrine_reach', details: 'Deep pearl. Hunter underwater. Held in oyster for a hundred years; yours in ten seconds.', obscure: true });
rel.registerItemSource(96433, { type: 'gathering', sourceId: 'saltbrine_cormorant_weir', sourceName: 'Cormorant Weir', region: 'saltbrine_reach', details: 'Cormorant. Trained birds return with fish. Hunter + fishing hybrid.', obscure: true });

// Slayer quarry — sea-themed horror
rel.registerItemSource(96440, { type: 'drop', sourceId: 'saltbrine_brine_troll', sourceName: 'Brine-Troll', region: 'saltbrine_reach', details: 'Brine-troll. Salt-crust hide. Drops crust plates + brine vials.', obscure: false });
rel.registerItemSource(96441, { type: 'drop', sourceId: 'saltbrine_salt_vampire', sourceName: 'Salt-Vampire', region: 'saltbrine_reach', details: 'Salt-vampire. Dried husks of drowned men. Brine-sucked rather than blood.', obscure: false });
rel.registerItemSource(96442, { type: 'drop', sourceId: 'saltbrine_kraken_spawn', sourceName: 'Kraken-Spawn', region: 'saltbrine_reach', details: 'Young kraken. Tentacle fragments. Slayer-only crafting components.', obscure: false });
rel.registerItemSource(96443, { type: 'drop', sourceId: 'saltbrine_drowned_man', sourceName: 'The Drowned', region: 'saltbrine_reach', details: 'The Drowned. Revenant sailors. Bones of the shipless. Captain\'s Bond offering.', obscure: true });
rel.registerItemSource(96444, { type: 'drop', sourceId: 'saltbrine_salt_wraith', sourceName: 'Salt-Wraith', region: 'saltbrine_reach', details: 'Salt-wraith. Crystallized grief. Drops brine-ghost essence — magic secondary.', obscure: true });

// Herblore secondaries — sea-medicine
rel.registerItemSource(96450, { type: 'gathering', sourceId: 'saltbrine_sea_sage_patch', sourceName: 'Sea-Sage Patch', region: 'saltbrine_reach', details: 'Sea-sage. Salt-tolerant. Brewer\'s Quay base for anti-drowning brew.', obscure: false });
rel.registerItemSource(96451, { type: 'gathering', sourceId: 'saltbrine_salt_thistle_patch', sourceName: 'Salt-Thistle Patch', region: 'saltbrine_reach', details: 'Salt-thistle. Scurvy cure. Lungwort variant of herblore chain.', obscure: false });
rel.registerItemSource(96452, { type: 'gathering', sourceId: 'saltbrine_kelp_cultivation', sourceName: 'Brine-Fed Kelp Raft', region: 'saltbrine_reach', details: 'Brine-fed kelp. Farming. Iodine-rich. Cooking + herblore.', obscure: false });

// Crafting materials
rel.registerItemSource(96460, { type: 'gathering', sourceId: 'saltbrine_oyster_pearl_bed', sourceName: 'Oyster Pearl Bed', region: 'saltbrine_reach', details: 'Oyster pearl. Jewelry, charter-seals, witch-bottles. The Reach\'s coin-equivalent.', obscure: false });
rel.registerItemSource(96461, { type: 'gathering', sourceId: 'saltbrine_ambergris_drift', sourceName: 'Ambergris Drift', region: 'saltbrine_reach', details: 'Ambergris. Rare. One lump buys a small boat. Herblore + magic secondary.', obscure: true });
rel.registerItemSource(96462, { type: 'gathering', sourceId: 'saltbrine_sharkhide_cure', sourceName: 'Sharkhide Curing Rack', region: 'saltbrine_reach', details: 'Sharkhide. Crafting. Cut into oilskin coats; stitched into pouches.', obscure: false });

// Boss / prestige items
rel.registerItemSource(96470, { type: 'drop', sourceId: 'saltbrine_drowned_king', sourceName: 'The Drowned King', region: 'saltbrine_reach', details: 'The Drowned King — Saltbrine prayer boss. Drops Captain\'s Bond relic.', obscure: true });
rel.registerItemSource(96471, { type: 'drop', sourceId: 'saltbrine_hesperus_ghost', sourceName: 'Ghost of the Hesperus', region: 'saltbrine_reach', details: 'Hesperus crew. Quest-gated. Drops charter-voucher fragments.', obscure: true });

// ══════════════════════════════════════════════════════════════════════════════
// SALTBRINE QUESTS — 10 with obscure, non-degenerate unlocks
// ══════════════════════════════════════════════════════════════════════════════

rel.defineQuestUnlock('coffin_tide', {
  name: 'Coffin Tide',
  unlocks: [
    { type: 'training_method', id: 'saltbrine_brewer_quay_herblore', description: "Brewer's Quay unlocked — barrel-fermented potions, +8% herblore yield on Saltbrine brews" },
    { type: 'recipe', id: 'anti_drowning_draught', description: 'Anti-Drowning Draught — 10 minutes of underwater breathing, stacks with waterbreathing. The only source.' },
  ],
});

rel.defineQuestUnlock('charter_the_drift', {
  name: 'Charter the Drift',
  unlocks: [
    { type: 'item_equip', id: 'charter_voucher_weekly', description: 'Weekly Charter Voucher — 3 free charter trips per week between any Charter House ports in Aelgard' },
    { type: 'area', id: 'saltbrine_drifting_market', description: 'The Drifting Market — floating bazaar that rotates between coastal ports; exclusive stock weekly' },
  ],
});

rel.defineQuestUnlock('the_wreck_of_the_hesperus', {
  name: 'The Wreck Of The Hesperus',
  unlocks: [
    { type: 'area', id: 'saltbrine_wreck_coast', description: 'The Wreck Coast — boat-only deep-water fishing grounds. Unique fish not found elsewhere.' },
    { type: 'training_method', id: 'saltbrine_wreck_deepwater_fishing', description: 'Wreck-coast deep-water fishing — the only source of wreck pike and deep tuna' },
  ],
});

rel.defineQuestUnlock('salt_tongues_bargain', {
  name: "Salt-Tongue's Bargain",
  unlocks: [
    { type: 'npc', id: 'salt_tongue_sailing_master', description: 'Salt-Tongue — sailing master and sea-witch tutor, opens advanced charter combat and magic paths' },
    { type: 'training_method', id: 'saltbrine_sea_witch_advanced', description: 'Sea-Witch advanced magic instruction — charter-conjure spellbook unlocked' },
  ],
});

rel.defineQuestUnlock('gunners_test', {
  name: "Gunner's Test",
  unlocks: [
    { type: 'training_method', id: 'saltbrine_cannon_foundry_smithing', description: 'Cannon Foundry smithing — cannon-forged munitions, only source of sea-shot bolts' },
    { type: 'area', id: 'saltbrine_crows_nest_range', description: "Crow's Nest Range — sniper-shot rigging range, high-tier ranged training with storm-sway mechanic" },
  ],
});

rel.defineQuestUnlock('lighthouse_reignited', {
  name: 'Lighthouse Reignited',
  unlocks: [
    { type: 'training_method', id: 'saltbrine_lighthouse_firemaking', description: 'Lighthouse Vigil firemaking — beacon-chain burning, highest firemaking XP by attention-per-tick' },
    { type: 'teleport', id: 'saltbrine_signal_fire_network', description: 'Signal-Fire Network — teleport between 6 lit lighthouses across the Reach and its shipping lanes' },
  ],
});

rel.defineQuestUnlock('the_drowned_king', {
  name: 'The Drowned King',
  unlocks: [
    { type: 'training_method', id: 'saltbrine_captains_bond_prayer', description: "Captain's Bond prayer — sailor-icon offerings, kraken-warding chants, anti-drowning prayer" },
    { type: 'item_equip', id: 'captains_bond_relic', description: "Captain's Bond Relic — grants the Kraken-Warding prayer, negates drowning damage below 10 HP" },
  ],
});

rel.defineQuestUnlock('pearls_of_the_hollow_ship', {
  name: 'Pearls of the Hollow Ship',
  unlocks: [
    { type: 'training_method', id: 'saltbrine_pearl_diver_hunter', description: 'Pearl-Diver hunter method — underwater Hunter trapping, unique to Saltbrine' },
    { type: 'item_equip', id: 'pearl_diver_24h_token', description: 'Pearl-Diver Token — 24-hour +40% pearl yield bonus after completion' },
  ],
});

rel.defineQuestUnlock('the_salt_pans_covenant', {
  name: 'The Salt-Pans Covenant',
  unlocks: [
    { type: 'training_method', id: 'saltbrine_salt_pan_runecrafting', description: 'Salt-Pan runecrafting — brine crystal to water rune conversion on slow overnight cycle' },
    { type: 'recipe', id: 'brine_crystal_water_rune', description: 'Brine Crystal → Water Rune recipe — slow (12hr cycle) but produces 8x water runes per essence.' },
  ],
});

rel.defineQuestUnlock('the_smugglers_hold', {
  name: "The Smuggler's Hold",
  unlocks: [
    { type: 'training_method', id: 'saltbrine_smuggler_manifest_thieving', description: "Smuggler's Hold thieving — forge cargo manifests, evade customs for high thieving XP + contraband" },
    { type: 'shop', id: 'saltbrine_contraband_fence', description: 'Contraband Fence — sells Saltbrine-exclusive gear no legitimate shop carries' },
  ],
});

rel.defineQuestUnlock('the_shipwrights_commission', {
  name: "The Shipwright's Commission",
  unlocks: [
    { type: 'training_method', id: 'saltbrine_shipwright_construction', description: "Shipwright's Yard construction — hull framing, deck-laying, mast-stepping. Low-attention bulk XP." },
    { type: 'item_equip', id: 'saltbrine_shipwright_adze', description: "Shipwright's Adze — construction tool. Works on wood-tier furniture 1 level lower than normal." },
  ],
});

// ══════════════════════════════════════════════════════════════════════════════
// SALTBRINE TRAINING METHODS — unblock 14 hard-blocked skills + raise caps
// ══════════════════════════════════════════════════════════════════════════════

// ── HITPOINTS ────────────────────────────────────────────────────────────────

rel.defineTrainingMethod('saltbrine_rockcrab_hp', {
  skill: 'hitpoints', name: 'Rock-Crab Tanking',
  levelRange: [1, 50],
  xpPerHour: 14000,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['saltbrine_reach'] },
  resourceOutput: { produces: [{ name: 'Crab shell', perHour: 60 }], net: 'neutral' },
  bankingFrequency: 'rare', costPerHour: 0,
  danger: 'low', complexity: 'trivial', attention: 'afk',
  inputs: [{ name: 'Basic food', perHour: 8, source: 'cooking' }],
  description: 'Stand between the coastal rock-crabs. They step on you for twenty minutes. You step back. She pays in small ticks.',
  location: 'Saltbrine Reach',
});

rel.defineTrainingMethod('saltbrine_siren_hp', {
  skill: 'hitpoints', name: 'Siren-Rock Endurance',
  levelRange: [40, 85],
  xpPerHour: 26000,
  prerequisites: { skills: { hitpoints: 40 }, quests: [], items: [{ name: 'Earmuffs' }], areas: ['saltbrine_reach'] },
  resourceOutput: { produces: [{ name: 'Siren-feather', perHour: 20 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 0,
  danger: 'medium', complexity: 'simple', attention: 'low',
  inputs: [{ name: 'Mid-tier food', perHour: 18, source: 'cooking' }, { name: 'Earmuffs (durable)', perHour: 0.1, source: 'crafting' }],
  description: 'Take the siren-song on the rocks with ears plugged. She sings. She does not reach you. HP accrues in the waiting.',
  location: 'Saltbrine Reach',
});

// ── PRAYER ───────────────────────────────────────────────────────────────────

rel.defineTrainingMethod('saltbrine_captains_bond_prayer', {
  skill: 'prayer', name: "Captain's Bond Offering",
  levelRange: [1, 99],
  xpPerHour: 110000,
  prerequisites: { skills: {}, quests: ['the_drowned_king'], items: [], areas: ['saltbrine_reach'] },
  resourceOutput: { produces: [{ name: 'Sailor-icon', perHour: 120 }], net: 'neutral' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Bones (any)', perHour: 600, source: 'combat' }, { name: 'Tarred cordage', perHour: 120, source: 'saltbrine_tarred_cordage' }],
  description: 'Wrap bones in tarred cordage, speak the Bond. Name the drowned. Walk the prayer-walk across the jetty. The dead hear.',
  location: 'Saltbrine Reach',
});

rel.defineTrainingMethod('saltbrine_kraken_warding_chant', {
  skill: 'prayer', name: 'Kraken-Warding Chant',
  levelRange: [30, 99],
  xpPerHour: 72000,
  prerequisites: { skills: { prayer: 30 }, quests: ['the_drowned_king'], items: [], areas: ['saltbrine_reach'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'rare', costPerHour: 0,
  danger: 'none', complexity: 'simple', attention: 'low',
  inputs: [{ name: 'Ship\'s biscuit', perHour: 10, source: 'cooking' }],
  description: 'Stand at the harbour-mouth. Chant the old warding, steady cadence. No interruption. The kraken does not come while the chant holds.',
  location: 'Saltbrine Reach',
});

// ── MAGIC (raise cap and add variety) ────────────────────────────────────────

rel.defineTrainingMethod('saltbrine_sea_witch_advanced', {
  skill: 'magic', name: 'Sea-Witch Charter-Conjure',
  levelRange: [50, 99],
  xpPerHour: 92000,
  prerequisites: { skills: { magic: 50 }, quests: ['salt_tongues_bargain'], items: [], areas: ['saltbrine_reach'] },
  resourceOutput: { produces: [{ name: 'Charter scroll', perHour: 120 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 22000,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Water rune', perHour: 1800, source: 'saltbrine_salt_pan_runecrafting' }, { name: 'Air rune', perHour: 1200, source: 'runecrafting' }, { name: 'Paper', perHour: 120, source: 'heartlands_papermaking' }],
  description: 'Salt-Tongue teaches charter-conjure. Scroll the wind into vellum. Each scroll a one-shot ferry. She pays in repeat custom.',
  location: 'Saltbrine Reach',
});

// ── RUNECRAFTING ─────────────────────────────────────────────────────────────

rel.defineTrainingMethod('saltbrine_salt_pan_runecrafting', {
  skill: 'runecrafting', name: 'Salt-Pan Brine-Crystal RC',
  levelRange: [5, 99],
  xpPerHour: 38000,
  prerequisites: { skills: { runecrafting: 5 }, quests: ['the_salt_pans_covenant'], items: [], areas: ['saltbrine_reach'] },
  resourceOutput: { produces: [{ name: 'Water rune', perHour: 2800 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'afk',
  inputs: [{ name: 'Brine crystal', perHour: 400, source: 'saltbrine_brine_crystal' }, { name: 'Pure essence', perHour: 400, source: 'mining' }],
  description: 'Lay brine crystal on the pans. The sun does the rest. Water runes at 8x yield but you collect once per cycle, not once per minute.',
  location: 'Saltbrine Reach',
  breakpointAt: 77,
});

rel.defineTrainingMethod('saltbrine_storm_altar', {
  skill: 'runecrafting', name: 'Storm-Altar Runecrafting',
  levelRange: [66, 99],
  xpPerHour: 52000,
  prerequisites: { skills: { runecrafting: 66 }, quests: [], items: [], areas: ['saltbrine_reach'] },
  resourceOutput: { produces: [{ name: 'Water rune', perHour: 2400 }, { name: 'Air rune', perHour: 1200 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'low', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Pure essence', perHour: 2400, source: 'mining' }],
  description: 'The storm-altar rises from the breakwater in heavy weather. Dual-element binding. The altar only shows in a blow — she waits for the wind.',
  location: 'Saltbrine Reach',
});

// ── CONSTRUCTION ─────────────────────────────────────────────────────────────

rel.defineTrainingMethod('saltbrine_shipwright_construction', {
  skill: 'construction', name: "Shipwright's Yard Framing",
  levelRange: [1, 99],
  xpPerHour: 220000,
  prerequisites: { skills: {}, quests: ['the_shipwrights_commission'], items: [], areas: ['saltbrine_reach'] },
  resourceOutput: { produces: [], net: 'loss' },
  bankingFrequency: 'frequent', costPerHour: 260000,
  danger: 'none', complexity: 'simple', attention: 'low',
  inputs: [{ name: 'Mangrove logs', perHour: 1400, source: 'saltbrine_mangrove_grove' }, { name: 'Construction mortar', perHour: 600, source: 'heartlands_density' }, { name: 'Tarred cordage', perHour: 400, source: 'saltbrine_tarred_cordage' }],
  description: 'Hull frames, deck planks, masts stepped. Bulk work. Lay plank, hammer, move. She does not demand cleverness. She pays in footage.',
  location: 'Saltbrine Reach',
});

rel.defineTrainingMethod('saltbrine_lighthouse_construction', {
  skill: 'construction', name: 'Lighthouse Masonry',
  levelRange: [50, 99],
  xpPerHour: 180000,
  prerequisites: { skills: { construction: 50 }, quests: ['lighthouse_reignited'], items: [], areas: ['saltbrine_reach'] },
  resourceOutput: { produces: [], net: 'loss' },
  bankingFrequency: 'moderate', costPerHour: 320000,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Tidestone', perHour: 800, source: 'saltbrine_tidestone_quarry' }, { name: 'Construction mortar', perHour: 400, source: 'heartlands_density' }],
  description: 'Course the tidestone up. Each lighthouse reinforced adds to the signal network. She will not fall — the sea has tried.',
  location: 'Saltbrine Reach',
});

// ── CRAFTING ─────────────────────────────────────────────────────────────────

rel.defineTrainingMethod('saltbrine_sail_stitching', {
  skill: 'crafting', name: 'Sail-Stitching',
  levelRange: [15, 80],
  xpPerHour: 68000,
  prerequisites: { skills: { crafting: 15 }, quests: [], items: [{ name: 'Needle' }], areas: ['saltbrine_reach'] },
  resourceOutput: { produces: [{ name: 'Stitched sail', perHour: 60 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'simple', attention: 'low',
  inputs: [{ name: 'Flax canvas', perHour: 600, source: 'heartlands_flax_field' }, { name: 'Tarred cordage', perHour: 60, source: 'saltbrine_tarred_cordage' }],
  description: 'Needle-and-palm work at the sail-loft. Long seams, steady pace. The loft-wife sings without singing.',
  location: 'Saltbrine Reach',
});

rel.defineTrainingMethod('saltbrine_sharkhide_tanning', {
  skill: 'crafting', name: 'Sharkhide Tanning',
  levelRange: [55, 99],
  xpPerHour: 85000,
  prerequisites: { skills: { crafting: 55 }, quests: [], items: [], areas: ['saltbrine_reach'] },
  resourceOutput: { produces: [{ name: 'Sharkhide coat', perHour: 35 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 28000,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Sharkhide', perHour: 35, source: 'saltbrine_sharkhide_cure' }, { name: 'Salt-thistle', perHour: 70, source: 'saltbrine_salt_thistle_patch' }],
  description: 'Scrape, salt, stretch, oil. The hide is patient work. Oilskins keep a man warm on the deep-water watch.',
  location: 'Saltbrine Reach',
});

rel.defineTrainingMethod('saltbrine_pearl_jewelry', {
  skill: 'crafting', name: 'Pearl-Setting',
  levelRange: [40, 90],
  xpPerHour: 62000,
  prerequisites: { skills: { crafting: 40 }, quests: [], items: [], areas: ['saltbrine_reach'] },
  resourceOutput: { produces: [{ name: 'Pearl jewelry', perHour: 80 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Oyster pearl', perHour: 80, source: 'saltbrine_oyster_pearl_bed' }, { name: 'Gold bar', perHour: 80, source: 'smithing' }],
  description: 'Set pearls in gold. Each piece a small dowry. The pearl-cutter drinks tea, measures twice.',
  location: 'Saltbrine Reach',
});

// ── FLETCHING ────────────────────────────────────────────────────────────────

rel.defineTrainingMethod('saltbrine_driftwood_bow_fletching', {
  skill: 'fletching', name: 'Driftwood Bow Fletching',
  levelRange: [20, 80],
  xpPerHour: 70000,
  prerequisites: { skills: { fletching: 20 }, quests: [], items: [], areas: ['saltbrine_reach'] },
  resourceOutput: { produces: [{ name: 'Driftwood bow', perHour: 450 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'simple', attention: 'afk',
  inputs: [{ name: 'Driftwood', perHour: 450, source: 'saltbrine_driftwood_line' }, { name: 'Tarred cordage', perHour: 450, source: 'saltbrine_tarred_cordage' }],
  description: 'Cure-bent by sea. Salty in the grain. Bends well, takes tarred cordage. The driftwood bow shoots a touch slower but holds in weather.',
  location: 'Saltbrine Reach',
});

rel.defineTrainingMethod('saltbrine_sea_cured_bolts', {
  skill: 'fletching', name: 'Sea-Cured Bolt Fletching',
  levelRange: [40, 99],
  xpPerHour: 92000,
  prerequisites: { skills: { fletching: 40 }, quests: [], items: [], areas: ['saltbrine_reach'] },
  resourceOutput: { produces: [{ name: 'Sea-cured bolts', perHour: 3200 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'simple', attention: 'afk',
  inputs: [{ name: 'Bronze bolt (unfinished)', perHour: 3200, source: 'saltbrine_cannon_foundry_smithing' }, { name: 'Gannet feather', perHour: 3200, source: 'saltbrine_gannet_cliff' }],
  description: 'Feather the bolts with gannet-oil quill. The sea cures them hard. She flies true in spray.',
  location: 'Saltbrine Reach',
});

// ── SLAYER ───────────────────────────────────────────────────────────────────

rel.defineTrainingMethod('saltbrine_scuttler_pits', {
  skill: 'slayer', name: 'Scuttler Pits Slaying',
  levelRange: [35, 85],
  xpPerHour: 58000,
  prerequisites: { skills: { slayer: 35 }, quests: ['slayers_gauntlet'], items: [], areas: ['saltbrine_reach'] },
  resourceOutput: { produces: [{ name: 'Gold coins', perHour: 75000 }, { name: 'Slayer points', perHour: 25 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 6000,
  danger: 'medium', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Mid-tier food', perHour: 28, source: 'saltbrine_salt_smoked_cooking' }, { name: 'Super combat potion', perHour: 2, source: 'saltbrine_brewer_quay_herblore' }],
  description: 'Scuttler Pits — brine-troll, salt-vampire, kraken-spawn. Slayer master Anchor-Sworn gives the task. Slayer XP you cannot get elsewhere.',
  location: 'Saltbrine Reach',
  breakpointAt: 50,
});

rel.defineTrainingMethod('saltbrine_salt_wraith_slayer', {
  skill: 'slayer', name: 'Salt-Wraith Hunting',
  levelRange: [65, 99],
  xpPerHour: 72000,
  prerequisites: { skills: { slayer: 65 }, quests: [], items: [{ name: 'Silver-tipped weapon' }], areas: ['saltbrine_reach'] },
  resourceOutput: { produces: [{ name: 'Brine-ghost essence', perHour: 180 }, { name: 'Gold coins', perHour: 95000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 18000,
  danger: 'high', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Sharks', perHour: 35, source: 'saltbrine_salt_smoked_cooking' }, { name: 'Prayer potion', perHour: 5, source: 'herblore' }],
  description: 'Salt-wraiths on the drowned lanes. They do not bleed. Silver-tip finishes them. She is a difficult slayer — pays accordingly.',
  location: 'Saltbrine Reach',
});

// ── HUNTER ───────────────────────────────────────────────────────────────────

rel.defineTrainingMethod('saltbrine_sea_bird_snaring', {
  skill: 'hunter', name: 'Sea-Bird Snaring',
  levelRange: [15, 70],
  xpPerHour: 54000,
  prerequisites: { skills: { hunter: 15 }, quests: [], items: [{ name: 'Bird snare' }], areas: ['saltbrine_reach'] },
  resourceOutput: { produces: [{ name: 'Sea-tern', perHour: 240 }, { name: 'Gannet feather', perHour: 600 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'low', complexity: 'simple', attention: 'low',
  inputs: [],
  description: 'Set snares on the tern-ledges. Sea-terns take salt-fish bait. Feathers to the fletcher; flesh to the pier-cats.',
  location: 'Saltbrine Reach',
});

rel.defineTrainingMethod('saltbrine_pearl_diver_hunter', {
  skill: 'hunter', name: 'Pearl-Diver Underwater Hunter',
  levelRange: [55, 99],
  xpPerHour: 88000,
  prerequisites: { skills: { hunter: 55 }, quests: ['pearls_of_the_hollow_ship'], items: [{ name: 'Diving mask' }], areas: ['saltbrine_reach'] },
  resourceOutput: { produces: [{ name: 'Oyster pearl', perHour: 140 }, { name: 'Deep pearl', perHour: 15 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 12000,
  danger: 'medium', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Anti-drowning draught', perHour: 6, source: 'saltbrine_brewer_quay_herblore' }],
  description: 'Underwater hunter — set oyster-traps on deep shoals. Unique to Saltbrine. Pearls to crafting, deep pearls to jewelers who only whisper their price.',
  location: 'Saltbrine Reach',
});

rel.defineTrainingMethod('saltbrine_cormorant_fishing', {
  skill: 'hunter', name: 'Cormorant-Trained Fishing',
  levelRange: [35, 85],
  xpPerHour: 45000,
  prerequisites: { skills: { hunter: 35, fishing: 40 }, quests: [], items: [], areas: ['saltbrine_reach'] },
  resourceOutput: { produces: [{ name: 'Raw trout/salmon', perHour: 220 }, { name: 'Hunter xp hybrid', perHour: 1 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [],
  description: 'Train a cormorant. Rope at the neck. She dives; she returns with fish. Hunter + fishing hybrid. She pays twice.',
  location: 'Saltbrine Reach',
});

// ── MINING ───────────────────────────────────────────────────────────────────

rel.defineTrainingMethod('saltbrine_coastal_mining', {
  skill: 'mining', name: 'Tidestone & Wreck-Iron Mining',
  levelRange: [1, 70],
  xpPerHour: 42000,
  prerequisites: { skills: {}, quests: [], items: [{ name: 'Pickaxe' }], areas: ['saltbrine_reach'] },
  resourceOutput: { produces: [{ name: 'Tidestone', perHour: 300 }, { name: 'Wreck iron', perHour: 220 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'low', complexity: 'simple', attention: 'low',
  inputs: [],
  description: 'Cliff-cut stone at low water. Rust-red iron from the wreck-line. The tide keeps the hours. She waits.',
  location: 'Saltbrine Reach',
});

rel.defineTrainingMethod('saltbrine_saltpetre_lead_mining', {
  skill: 'mining', name: 'Saltpetre & Lead Mining',
  levelRange: [40, 99],
  xpPerHour: 65000,
  prerequisites: { skills: { mining: 40 }, quests: [], items: [{ name: 'Pickaxe' }], areas: ['saltbrine_reach'] },
  resourceOutput: { produces: [{ name: 'Saltpetre', perHour: 260 }, { name: 'Lead', perHour: 340 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'low', complexity: 'simple', attention: 'low',
  inputs: [],
  description: 'Saltpetre caves, lead reefs. Powder and shot for the Cannon Foundry. The gunner pays by weight.',
  location: 'Saltbrine Reach',
});

// ── SMITHING ─────────────────────────────────────────────────────────────────

rel.defineTrainingMethod('saltbrine_cannon_foundry_smithing', {
  skill: 'smithing', name: 'Cannon Foundry Smithing',
  levelRange: [30, 99],
  xpPerHour: 105000,
  prerequisites: { skills: { smithing: 30 }, quests: ['gunners_test'], items: [], areas: ['saltbrine_reach'] },
  resourceOutput: { produces: [{ name: 'Sea-shot bolts', perHour: 3200 }, { name: 'Cannon-ball', perHour: 800 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Wreck iron', perHour: 400, source: 'saltbrine_wreck_iron' }, { name: 'Lead', perHour: 800, source: 'saltbrine_lead_reef' }, { name: 'Saltpetre', perHour: 200, source: 'saltbrine_saltpetre_cave' }, { name: 'Coal', perHour: 400, source: 'mining' }],
  description: 'Cannon Foundry — forge cannon-balls and sea-shot bolts. Only source of sea-shot. The foundry-master inspects every barrel.',
  location: 'Saltbrine Reach',
  breakpointAt: 55,
});

rel.defineTrainingMethod('saltbrine_anchor_forge', {
  skill: 'smithing', name: 'Anchor Forge',
  levelRange: [55, 99],
  xpPerHour: 78000,
  prerequisites: { skills: { smithing: 55 }, quests: [], items: [], areas: ['saltbrine_reach'] },
  resourceOutput: { produces: [{ name: 'Anchor chain link', perHour: 180 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Steel bar', perHour: 600, source: 'smithing' }, { name: 'Coal', perHour: 1200, source: 'mining' }],
  description: 'Heavy work — anchor chain, every link three times the size of an arrow. Anchors are construction components too.',
  location: 'Saltbrine Reach',
});

// ── COOKING ──────────────────────────────────────────────────────────────────

rel.defineTrainingMethod('saltbrine_salt_smoked_cooking', {
  skill: 'cooking', name: 'Salt-Smoked Fish Cooking',
  levelRange: [1, 99],
  xpPerHour: 140000,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['saltbrine_reach'] },
  resourceOutput: { produces: [{ name: 'Salt-smoked fish', perHour: 1400 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'simple', attention: 'afk',
  inputs: [{ name: 'Raw fish (any Saltbrine)', perHour: 1400, source: 'saltbrine_fishing' }, { name: 'Salt-thistle', perHour: 300, source: 'saltbrine_salt_thistle_patch' }],
  description: 'Cure fish in salt-thistle brine, smoke over driftwood. The smoke-house smells of both joy and embalming. Both are correct.',
  location: 'Saltbrine Reach',
});

rel.defineTrainingMethod('saltbrine_hardtack_baking', {
  skill: 'cooking', name: "Hardtack & Ship's Biscuit",
  levelRange: [15, 70],
  xpPerHour: 82000,
  prerequisites: { skills: { cooking: 15 }, quests: [], items: [], areas: ['saltbrine_reach'] },
  resourceOutput: { produces: [{ name: "Ship's biscuit", perHour: 800 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'afk',
  inputs: [{ name: 'Flour', perHour: 800, source: 'heartlands_mill' }, { name: 'Salt water', perHour: 800, source: 'saltbrine_reach' }],
  description: "Flour, salt-water, bake twice, bake three times. Ship's biscuit will outlive the ship. Feeds a crew for months.",
  location: 'Saltbrine Reach',
});

rel.defineTrainingMethod('saltbrine_grog_brewing', {
  skill: 'cooking', name: 'Grog & Galley Stew',
  levelRange: [35, 85],
  xpPerHour: 95000,
  prerequisites: { skills: { cooking: 35 }, quests: [], items: [], areas: ['saltbrine_reach'] },
  resourceOutput: { produces: [{ name: 'Galley stew', perHour: 300 }, { name: 'Grog', perHour: 400 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Raw squid/urchin', perHour: 300, source: 'saltbrine_cove_urchin' }, { name: 'Pirate rum', perHour: 400, source: 'saltbrine_fish_shop' }],
  description: 'Galley work. Stew the urchin, ferment the grog. The cook does not taste the grog until after the watch. She is honourable in that.',
  location: 'Saltbrine Reach',
});

// ── FIREMAKING ───────────────────────────────────────────────────────────────

rel.defineTrainingMethod('saltbrine_lighthouse_firemaking', {
  skill: 'firemaking', name: 'Lighthouse Beacon Tending',
  levelRange: [30, 99],
  xpPerHour: 195000,
  prerequisites: { skills: { firemaking: 30 }, quests: ['lighthouse_reignited'], items: [{ name: 'Tinderbox' }], areas: ['saltbrine_reach'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Black teak logs', perHour: 600, source: 'saltbrine_black_teak' }, { name: 'Mangrove logs', perHour: 400, source: 'saltbrine_mangrove_grove' }],
  description: 'Tend the lighthouse beacon. Feed teak and mangrove on rotation. The light keeps ships from the rocks — your XP keeps yourself.',
  location: 'Saltbrine Reach',
});

rel.defineTrainingMethod('saltbrine_signal_fire_chain', {
  skill: 'firemaking', name: 'Signal-Fire Chain Burning',
  levelRange: [50, 99],
  xpPerHour: 160000,
  prerequisites: { skills: { firemaking: 50 }, quests: ['lighthouse_reignited'], items: [{ name: 'Tinderbox' }], areas: ['saltbrine_reach'] },
  resourceOutput: { produces: [{ name: 'Signal token', perHour: 30 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'low',
  inputs: [{ name: 'Driftwood', perHour: 1200, source: 'saltbrine_driftwood_line' }],
  description: 'Light signal fires up the coast in sequence. Each fire tokens. Tokens redeem at the lighthouse teleport network.',
  location: 'Saltbrine Reach',
});

// ── WOODCUTTING ──────────────────────────────────────────────────────────────

rel.defineTrainingMethod('saltbrine_coastal_woodcutting', {
  skill: 'woodcutting', name: 'Mangrove & Driftwood Gathering',
  levelRange: [1, 65],
  xpPerHour: 52000,
  prerequisites: { skills: {}, quests: [], items: [{ name: 'Axe' }], areas: ['saltbrine_reach'] },
  resourceOutput: { produces: [{ name: 'Mangrove logs', perHour: 320 }, { name: 'Driftwood', perHour: 240 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'simple', attention: 'afk',
  inputs: [],
  description: 'Mangrove from the tidal roots, driftwood from the tide-line. The tide-line resets each dawn. Low-attention work, steady return.',
  location: 'Saltbrine Reach',
});

rel.defineTrainingMethod('saltbrine_black_teak_felling', {
  skill: 'woodcutting', name: 'Black Teak Felling',
  levelRange: [60, 99],
  xpPerHour: 78000,
  prerequisites: { skills: { woodcutting: 60 }, quests: [], items: [{ name: 'Axe' }], areas: ['saltbrine_reach'] },
  resourceOutput: { produces: [{ name: 'Black teak logs', perHour: 180 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [],
  description: 'Salt-hardened teak. Each trunk a mast. Slow felling, heavy timber. The lumbermen work in pairs — one cuts, one watches the sea.',
  location: 'Saltbrine Reach',
});

// ── FARMING ──────────────────────────────────────────────────────────────────

rel.defineTrainingMethod('saltbrine_tide_tide_farming', {
  skill: 'farming', name: 'Tide-Tide Salt-Resistant Farming',
  levelRange: [15, 99],
  xpPerHour: 48000,
  prerequisites: { skills: { farming: 15 }, quests: [], items: [], areas: ['saltbrine_reach'] },
  resourceOutput: { produces: [{ name: 'Sea-sage', perHour: 50 }, { name: 'Salt-thistle', perHour: 80 }, { name: 'Sea-potato', perHour: 120 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 1500,
  danger: 'none', complexity: 'moderate', attention: 'low',
  inputs: [{ name: 'Seeds (salt-tolerant)', perHour: 20, source: 'saltbrine_seed_merchant' }],
  description: 'Tide-Tide fields — crops that take the brine. The farmhand waters with half-brackish water and the crop pays her for it.',
  location: 'Saltbrine Reach',
});

rel.defineTrainingMethod('saltbrine_kelp_cultivation_farming', {
  skill: 'farming', name: 'Brine-Fed Kelp Cultivation',
  levelRange: [35, 99],
  xpPerHour: 62000,
  prerequisites: { skills: { farming: 35 }, quests: [], items: [], areas: ['saltbrine_reach'] },
  resourceOutput: { produces: [{ name: 'Brine-fed kelp', perHour: 240 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 800,
  danger: 'none', complexity: 'moderate', attention: 'low',
  inputs: [{ name: 'Kelp frond', perHour: 30, source: 'saltbrine_kelp_field' }],
  description: 'Kelp rafts anchored off the breakwater. Grow in fast rotations. Kelp feeds the herbalist and the cook equally.',
  location: 'Saltbrine Reach',
  breakpointAt: 35,
});

// ── HERBLORE (second method — Brewer's Quay) ─────────────────────────────────

rel.defineTrainingMethod('saltbrine_brewer_quay_herblore', {
  skill: 'herblore', name: "Brewer's Quay Barrel-Fermenting",
  levelRange: [20, 99],
  xpPerHour: 88000,
  prerequisites: { skills: { herblore: 20 }, quests: ['coffin_tide'], items: [], areas: ['saltbrine_reach'] },
  resourceOutput: { produces: [{ name: 'Sea-medicine potion', perHour: 280 }, { name: 'Anti-drowning draught', perHour: 60 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Sea-sage', perHour: 280, source: 'saltbrine_sea_sage_patch' }, { name: 'Salt-thistle', perHour: 140, source: 'saltbrine_salt_thistle_patch' }, { name: 'Brine-fed kelp', perHour: 140, source: 'saltbrine_kelp_cultivation_farming' }, { name: 'Vial of water', perHour: 280, source: 'heartlands_apothecary' }],
  description: "The Brewer's Quay ferments in oak barrels swept by sea air. Sea-medicine. Anti-drowning draught is only made here. Barrel-cooper watches the bubbles.",
  location: 'Saltbrine Reach',
});

// ── RANGED — Crow's Nest Range (raise cap) ───────────────────────────────────

rel.defineTrainingMethod('saltbrine_crows_nest_range', {
  skill: 'ranged', name: "Crow's Nest Sniper Range",
  levelRange: [50, 99],
  xpPerHour: 105000,
  prerequisites: { skills: { ranged: 50 }, quests: ['gunners_test'], items: [{ name: 'Crossbow' }], areas: ['saltbrine_reach'] },
  resourceOutput: { produces: [{ name: 'Ranged token', perHour: 20 }], net: 'neutral' },
  bankingFrequency: 'rare', costPerHour: 25000,
  danger: 'none', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Sea-cured bolts', perHour: 3000, source: 'saltbrine_sea_cured_bolts' }],
  description: "From the crow's nest — storm-sway factored, the shot compensates. Highest-attention ranged in Aelgard. The rigging does not forgive loose feet.",
  location: 'Saltbrine Reach',
  breakpointAt: 50,
});

rel.defineTrainingMethod('saltbrine_harbour_archery', {
  skill: 'ranged', name: 'Harbour Archery Practice',
  levelRange: [1, 60],
  xpPerHour: 32000,
  prerequisites: { skills: {}, quests: [], items: [{ name: 'Bow' }], areas: ['saltbrine_reach'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'rare', costPerHour: 2500,
  danger: 'none', complexity: 'trivial', attention: 'afk',
  inputs: [{ name: 'Bronze arrow', perHour: 1800, source: 'fletching' }],
  description: 'Dockside straw butts. Quiet practice. The harbour-master allows it if you retrieve your own arrows. Most do not.',
  location: 'Saltbrine Reach',
});

// ── STRENGTH (raise cap) ─────────────────────────────────────────────────────

rel.defineTrainingMethod('saltbrine_capstan_hauling', {
  skill: 'strength', name: 'Capstan & Cable Hauling',
  levelRange: [1, 99],
  xpPerHour: 48000,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['saltbrine_reach'] },
  resourceOutput: { produces: [{ name: 'Dock wages', perHour: 4000 }], net: 'profit' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'afk',
  inputs: [],
  description: 'Four men at the capstan; five ropes rising. You walk the wheel. The bosun counts the turns. She pays by the ton weighed.',
  location: 'Saltbrine Reach',
});

rel.defineTrainingMethod('saltbrine_lobstrosity_str', {
  skill: 'strength', name: 'Lobstrosity Crushing',
  levelRange: [45, 99],
  xpPerHour: 78000,
  prerequisites: { skills: { strength: 45 }, quests: [], items: [{ name: 'Blunt weapon' }], areas: ['saltbrine_reach'] },
  resourceOutput: { produces: [{ name: 'Raw lobster', perHour: 200 }, { name: 'Barnacle shell', perHour: 160 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'medium', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Mid-tier food', perHour: 25, source: 'saltbrine_salt_smoked_cooking' }],
  description: 'The shell yields only to crush. Strength XP from the breaking. Lobstrosity flesh into the galley stew.',
  location: 'Saltbrine Reach',
});

// ── AGILITY (Piratesfall Cliffs) ─────────────────────────────────────────────

rel.defineTrainingMethod('saltbrine_piratesfall_agility', {
  skill: 'agility', name: 'Piratesfall Rope-Bridge Course',
  levelRange: [40, 90],
  xpPerHour: 62000,
  prerequisites: { skills: { agility: 40 }, quests: [], items: [], areas: ['saltbrine_reach'] },
  resourceOutput: { produces: [{ name: 'Marks of grace', perHour: 22 }], net: 'profit' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'low', complexity: 'moderate', attention: 'medium',
  inputs: [],
  description: 'Rope-bridges, mast-climbs, rope-to-rope traverse. Piratesfall Cliffs. A fall drops you twenty feet into the surf; she does not kill you but she reminds.',
  location: 'Saltbrine Reach',
});

rel.defineTrainingMethod('saltbrine_rigging_agility', {
  skill: 'agility', name: 'Rigging-Run Agility',
  levelRange: [70, 99],
  xpPerHour: 78000,
  prerequisites: { skills: { agility: 70 }, quests: [], items: [], areas: ['saltbrine_reach'] },
  resourceOutput: { produces: [{ name: 'Marks of grace', perHour: 30 }], net: 'profit' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'medium', complexity: 'complex', attention: 'high',
  inputs: [],
  description: 'Rigging-run course on berthed ships. High attention — the rope moves with the swell. Top-tier agility for Saltbrine.',
  location: 'Saltbrine Reach',
});

// ── THIEVING (Smuggler's Hold) ───────────────────────────────────────────────

rel.defineTrainingMethod('saltbrine_smuggler_manifest_thieving', {
  skill: 'thieving', name: "Smuggler's Manifest Forgery",
  levelRange: [50, 99],
  xpPerHour: 95000,
  prerequisites: { skills: { thieving: 50 }, quests: ['the_smugglers_hold'], items: [], areas: ['saltbrine_reach'] },
  resourceOutput: { produces: [{ name: 'Contraband crate', perHour: 60 }, { name: 'Gold coins', perHour: 85000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'medium', complexity: 'complex', attention: 'high',
  inputs: [],
  description: "The Smuggler's Hold. Forge cargo manifests, bribe customs, walk the contraband through. High thieving XP. Customs-evasion is the art.",
  location: 'Saltbrine Reach',
});

rel.defineTrainingMethod('saltbrine_charter_pickpocket', {
  skill: 'thieving', name: 'Charter-House Pickpocketing',
  levelRange: [25, 70],
  xpPerHour: 42000,
  prerequisites: { skills: { thieving: 25 }, quests: [], items: [], areas: ['saltbrine_reach'] },
  resourceOutput: { produces: [{ name: 'Gold coins', perHour: 28000 }, { name: 'Charter-voucher fragment', perHour: 6 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 0,
  danger: 'low', complexity: 'simple', attention: 'low',
  inputs: [],
  description: 'Charter Houses crowd with travellers. Pick the pockets of the careless merchant. Charter-voucher fragments worth their weight in free ferry.',
  location: 'Saltbrine Reach',
});

// ══════════════════════════════════════════════════════════════════════════════
// NEW FISHING METHOD — Wreck Coast deep-water (quest-gated)
// ══════════════════════════════════════════════════════════════════════════════

rel.defineTrainingMethod('saltbrine_wreck_deepwater_fishing', {
  skill: 'fishing', name: 'Wreck Coast Deep-Water Fishing',
  levelRange: [62, 99],
  xpPerHour: 92000,
  prerequisites: { skills: { fishing: 62 }, quests: ['the_wreck_of_the_hesperus'], items: [{ name: 'Harpoon' }], areas: ['saltbrine_reach'] },
  resourceOutput: { produces: [{ name: 'Deep tuna', perHour: 180 }, { name: 'Wreck pike', perHour: 60 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'medium', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Anti-drowning draught', perHour: 2, source: 'saltbrine_brewer_quay_herblore' }],
  description: 'Boat-only fishing over the sunken fleet. Deep tuna and wreck pike. The wreck knows its drowned — the pike calls them up.',
  location: 'Saltbrine Reach',
});

// ══════════════════════════════════════════════════════════════════════════════
// SALTBRINE QUIRKY INTERACTIONS (sailor flavor, tiny XP but present)
// ══════════════════════════════════════════════════════════════════════════════

rel.defineTrainingMethod('quirky_saltbrine_knot_tying', {
  skill: 'crafting',
  name: '[Quirky] Tie Knots on the Pier',
  levelRange: [1, 99],
  xpPerHour: 1800,
  prerequisites: { skills: {}, quests: [], items: [{ name: 'Rope' }], areas: ['saltbrine_reach'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'low',
  inputs: [],
  description: 'Tie bowline, tie clove-hitch, tie carrick-bend. The rope-hand nods. Crafting accrues in the knots.',
  location: 'Saltbrine Reach',
});

rel.defineTrainingMethod('quirky_saltbrine_bilge_pumping', {
  skill: 'strength',
  name: '[Quirky] Pump the Bilge',
  levelRange: [1, 99],
  xpPerHour: 2400,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['saltbrine_reach'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'high',
  inputs: [],
  description: 'Two men on the pump, one on the discharge. The bilge rises — you pump her down. Strength in the shoulders. The boat does not thank you.',
  location: 'Saltbrine Reach',
});

rel.defineTrainingMethod('quirky_saltbrine_sea_chanty', {
  skill: 'prayer',
  name: '[Quirky] Sing the Sea-Chanty',
  levelRange: [1, 99],
  xpPerHour: 1600,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['saltbrine_reach'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'low',
  inputs: [],
  description: 'Stand with the dockside choir. Sing the capstan chanty. The old words. The drowned hear. Prayer accrues in the chorus.',
  location: 'Saltbrine Reach',
});

rel.defineTrainingMethod('quirky_saltbrine_barnacle_scraping', {
  skill: 'mining',
  name: '[Quirky] Scrape the Barnacles',
  levelRange: [1, 99],
  xpPerHour: 1400,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['saltbrine_reach'] },
  resourceOutput: { produces: [{ name: 'Barnacle shell', perHour: 60 }], net: 'profit' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'medium',
  inputs: [],
  description: 'Careened hull, tide out, scrape the barnacles off the keel. Mining XP — the hull is its own small quarry. Shells sell to crafters.',
  location: 'Saltbrine Reach',
});

rel.defineTrainingMethod('quirky_saltbrine_net_mending', {
  skill: 'fletching',
  name: '[Quirky] Mend the Nets',
  levelRange: [1, 99],
  xpPerHour: 2000,
  prerequisites: { skills: {}, quests: [], items: [{ name: 'Needle' }], areas: ['saltbrine_reach'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'low',
  inputs: [],
  description: "Mend the fisher's net. A knot at each tear, a kindness at each knot. The fletching isn't bow work; it's the family of work.",
  location: 'Saltbrine Reach',
});

rel.defineTrainingMethod('quirky_saltbrine_lantern_carry', {
  skill: 'firemaking',
  name: '[Quirky] Walk the Lantern Round',
  levelRange: [1, 99],
  xpPerHour: 1200,
  prerequisites: { skills: {}, quests: [], items: [{ name: 'Lantern' }], areas: ['saltbrine_reach'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'low',
  inputs: [],
  description: "Walk the lamp-round with the lamplighter. Light each dock-lantern in sequence. The harbourmaster's relief at the quiet round.",
  location: 'Saltbrine Reach',
});

// ══════════════════════════════════════════════════════════════════════════════
// SALTBRINE BREAKPOINTS — sailor-cadence progression moments
// ══════════════════════════════════════════════════════════════════════════════

rel.defineBreakpoint({
  type: 'quest_complete', trigger: { quest: 'lighthouse_reignited' },
  description: "Signal-Fire Network active. Six lighthouses lit. Teleport between coastal ports and shipping lanes. She does not need the charter-voucher — she holds the wind.",
  unlocks: [
    { type: 'teleport', id: 'saltbrine_signal_fire_network', description: 'Signal-Fire teleport network (6 lighthouses)' },
    { type: 'training_method', id: 'saltbrine_lighthouse_firemaking', description: 'Lighthouse Vigil — 195k firemaking XP/hr' },
  ],
  importance: 'transformative',
});

rel.defineBreakpoint({
  type: 'quest_complete', trigger: { quest: 'the_drowned_king' },
  description: "Captain's Bond Relic equipped. Kraken-Warding prayer active. The Reach opens — the Drowned do not come while the Bond holds. She is the signature Saltbrine prestige moment.",
  unlocks: [
    { type: 'item_equip', id: 'captains_bond_relic', description: "Captain's Bond Relic" },
    { type: 'training_method', id: 'saltbrine_captains_bond_prayer', description: "Captain's Bond prayer path" },
  ],
  importance: 'transformative',
});

rel.defineBreakpoint({
  type: 'quest_complete', trigger: { quest: 'charter_the_drift' },
  description: "Charter-voucher weekly active. Drifting Market access. Three free ferries a week. The Charter Houses no longer charge her at the gangway.",
  unlocks: [
    { type: 'item_equip', id: 'charter_voucher_weekly', description: 'Weekly Charter Voucher' },
    { type: 'area', id: 'saltbrine_drifting_market', description: 'Drifting Market' },
  ],
  importance: 'major',
});

rel.defineBreakpoint({
  type: 'skill_level', trigger: { skill: 'runecrafting', level: 77 },
  description: "Salt-Pan runecrafting paired with Moryskah blood altar — the Aelgard RC endgame. Water rune at scale. Cross-region: Salt-Pan feeds the charter-conjure economy across all ports.",
  unlocks: [{ type: 'training_method', id: 'saltbrine_salt_pan_runecrafting', description: 'Salt-Pan RC at endgame' }],
  importance: 'major',
});

rel.defineBreakpoint({
  type: 'skill_level', trigger: { skill: 'smithing', level: 55 },
  description: "Cannon Foundry unlocks sea-shot bolts. The only source in Aelgard. Ranged economy shifts — the crow's nest demands sea-shot; the Foundry demands smithing.",
  unlocks: [{ type: 'training_method', id: 'saltbrine_cannon_foundry_smithing', description: 'Cannon Foundry' }],
  importance: 'major',
});

rel.defineBreakpoint({
  type: 'quest_complete', trigger: { quest: 'the_wreck_of_the_hesperus' },
  description: "Wreck Coast opened. Deep-water fishing grounds. The wreck knows its drowned. Unique fish — deep tuna, wreck pike — only obtainable here.",
  unlocks: [
    { type: 'area', id: 'saltbrine_wreck_coast', description: 'Wreck Coast deep-water grounds' },
    { type: 'training_method', id: 'saltbrine_wreck_deepwater_fishing', description: 'Wreck deep-water fishing' },
  ],
  importance: 'major',
});

rel.defineBreakpoint({
  type: 'skill_level', trigger: { skill: 'slayer', level: 50 },
  description: "Scuttler Pits slayer tier open. Anchor-Sworn gives the first salt-wraith task. The Reach's slayer ladder begins here — brine-troll to salt-vampire to salt-wraith.",
  unlocks: [{ type: 'area', id: 'saltbrine_scuttler_pits', description: 'Scuttler Pits full access' }],
  importance: 'major',
});

// ══════════════════════════════════════════════════════════════════════════════
// SALTBRINE ITEM USES & RECIPES — dense cross-use web
// ══════════════════════════════════════════════════════════════════════════════

// Anti-drowning draught — sole source, multiple uses
rel.defineCombination(96501, {
  resultName: 'Anti-drowning draught',
  inputs: [
    { id: 96450, name: 'Sea-sage', consumed: true },
    { id: 96452, name: 'Brine-fed kelp', consumed: true },
    { id: 5, name: 'Vial of water', consumed: true },
  ],
  skill: 'herblore', level: 35, xp: 110, station: 'brewers_quay',
  description: 'Anti-drowning draught. 10 minutes underwater breathing. Brewer\'s Quay only.',
});

rel.defineCombination(96502, {
  resultName: 'Cannon-ball',
  inputs: [
    { id: 96404, name: 'Lead', consumed: true },
    { id: 96401, name: 'Wreck iron', consumed: true },
  ],
  skill: 'smithing', level: 40, xp: 25, station: 'cannon_foundry',
  description: 'Cannon-ball. Saltbrine-exclusive. Lead-core, wreck-iron shell.',
});

rel.defineCombination(96503, {
  resultName: 'Sea-shot bolts (100)',
  inputs: [
    { id: 96404, name: 'Lead', consumed: true },
    { id: 96402, name: 'Saltpetre', consumed: true },
    { id: 96401, name: 'Wreck iron', consumed: true },
  ],
  skill: 'smithing', level: 55, xp: 62, station: 'cannon_foundry',
  description: 'Sea-shot bolts. Only source. +8% ranged damage on the Reach and at sea.',
});

rel.defineCombination(96504, {
  resultName: 'Driftwood bow',
  inputs: [
    { id: 96410, name: 'Driftwood', consumed: true },
    { id: 96413, name: 'Tarred cordage', consumed: true },
  ],
  skill: 'fletching', level: 25, xp: 42, station: 'sail_loft',
  description: 'Driftwood bow. Sea-cured. Works in weather where normal bows warp.',
});

rel.defineCombination(96505, {
  resultName: 'Stitched sail',
  inputs: [
    { id: 90001, name: 'Flax (Heartlands)', consumed: true },
    { id: 96413, name: 'Tarred cordage', consumed: true },
  ],
  skill: 'crafting', level: 35, xp: 72, station: 'sail_loft',
  description: 'Stitched sail. Required for shipwright commission. Cross-region flax dependency.',
});

rel.defineCombination(96506, {
  resultName: 'Oilskin coat',
  inputs: [
    { id: 96462, name: 'Sharkhide', consumed: true },
    { id: 96451, name: 'Salt-thistle', consumed: true },
  ],
  skill: 'crafting', level: 65, xp: 130, station: 'tannery',
  description: 'Oilskin coat. Rain-proof. +1 prayer for the wearer in Saltbrine (resistance to drown-rot).',
});

rel.defineCombination(96507, {
  resultName: 'Salt-smoked fish',
  inputs: [
    { id: 96423, name: 'Raw black mackerel', consumed: true },
    { id: 96451, name: 'Salt-thistle', consumed: true },
  ],
  skill: 'cooking', level: 35, xp: 90, station: 'smokehouse',
  description: 'Salt-smoked fish. Heals 14. Does not spoil. The voyage food.',
});

rel.defineCombination(96508, {
  resultName: "Ship's biscuit",
  inputs: [
    { id: 90191, name: 'Flour (Heartlands)', consumed: true },
    { id: 96451, name: 'Salt-thistle', consumed: true },
  ],
  skill: 'cooking', level: 15, xp: 42, station: 'galley',
  description: "Ship's biscuit. Heals 4. Does not spoil for a year. A staple on the charter routes.",
});

rel.defineCombination(96509, {
  resultName: 'Charter scroll',
  inputs: [
    { id: 95145, name: 'Water rune (4)', consumed: true },
    { id: 95146, name: 'Air rune (4)', consumed: true },
    { id: 90007, name: 'Paper', consumed: true },
  ],
  skill: 'magic', level: 50, xp: 85, station: 'sea_witch_lectern',
  description: 'Charter scroll. One-shot teleport to any named Saltbrine port. Sea-Witch spellcraft.',
});

rel.defineCombination(96510, {
  resultName: 'Captain\'s Bond offering',
  inputs: [
    { id: 96413, name: 'Tarred cordage', consumed: true },
    { id: 100, name: 'Bones', consumed: true },
    { id: 96443, name: 'Drowned-remains (optional)', consumed: false },
  ],
  skill: 'prayer', level: 1, xp: 50, station: 'bond_altar',
  description: "Captain's Bond offering. Wrapped bones. 4x the prayer XP of bare burial. Saltbrine-only altar.",
});

// Item uses — dense web
rel.registerItemUse(96413, { type: 'recipe', targetId: 96504, targetName: 'Driftwood bow', region: 'saltbrine_reach', details: 'Tarred cordage is the bowstring.', obscure: false });
rel.registerItemUse(96413, { type: 'recipe', targetId: 96505, targetName: 'Stitched sail', region: 'saltbrine_reach', details: 'Tarred cordage binds the sail edge.', obscure: false });
rel.registerItemUse(96413, { type: 'recipe', targetId: 96510, targetName: "Captain's Bond offering", region: 'saltbrine_reach', details: "Wrap bones with cordage for the Bond offering.", obscure: true });

rel.registerItemUse(96451, { type: 'secondary', targetId: 96507, targetName: 'Salt-smoked fish cure', region: 'saltbrine_reach', details: 'Salt-thistle is the curing herb.', obscure: false });
rel.registerItemUse(96451, { type: 'secondary', targetId: 96508, targetName: "Ship's biscuit", region: 'saltbrine_reach', details: 'Salt-thistle as preservative.', obscure: false });
rel.registerItemUse(96451, { type: 'recipe', targetId: 96506, targetName: 'Oilskin coat cure', region: 'saltbrine_reach', details: 'Salt-thistle in the hide-cure.', obscure: true });

rel.registerItemUse(96404, { type: 'recipe', targetId: 96502, targetName: 'Cannon-ball', region: 'saltbrine_reach', details: 'Lead core.', obscure: false });
rel.registerItemUse(96404, { type: 'recipe', targetId: 96503, targetName: 'Sea-shot bolts', region: 'saltbrine_reach', details: 'Lead shot body.', obscure: false });

rel.registerItemUse(96405, { type: 'recipe', targetId: 'water_rune', targetName: 'Water rune (Salt-Pan)', region: 'saltbrine_reach', details: 'Brine crystal as RC essence overlay. 8x yield per essence.', obscure: false });
rel.registerItemUse(96405, { type: 'recipe', targetId: 96509, targetName: 'Charter scroll', region: 'saltbrine_reach', details: 'Brine crystal trace in the scroll-ink for water rune binding.', obscure: true });

rel.registerItemUse(96460, { type: 'recipe', targetId: 'pearl_jewelry', targetName: 'Pearl jewelry', region: 'saltbrine_reach', details: 'Oyster pearl in gold setting.', obscure: false });
rel.registerItemUse(96460, { type: 'currency', targetId: 'charter_seal', targetName: 'Charter seal', region: 'saltbrine_reach', details: 'Pearl as charter-seal — merchant-class signature.', obscure: true });

rel.registerItemUse(96432, { type: 'recipe', targetId: 'deep_pearl_ring', targetName: 'Deep pearl ring', region: 'saltbrine_reach', details: 'Deep pearl into signet — +2% hunter yield worldwide.', obscure: true });

rel.registerItemUse(96442, { type: 'recipe', targetId: 'kraken_spawn_staff', targetName: 'Kraken-spawn staff', region: 'saltbrine_reach', details: 'Kraken-spawn tentacle hafted onto staff — magic water-tier secondary.', obscure: true });

console.log('[aelgard] Saltbrine Deep loaded: 50+ methods, 11 quests, 7 breakpoints, 40+ items, 10 recipes, 6 quirky interactions, dense cross-use web');
