// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Inkweald Density Pass
//
// Dense cross-use web: chain every Inkweald-native resource into something.
// Every item has 2+ uses. Every method has an input the region can supply.
// Every recipe folds back into another recipe, the way dreams do.
//
// IDs in the 98500-98999 range (clean Inkweald density block).
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const rel = require('../../data/relationships');

// ══════════════════════════════════════════════════════════════════════════════
// INKWEALD-NATIVE SOURCES FOR THE CRITICAL INPUTS
// The forest can supply what the forest uses. Self-sufficient dream-loop.
// ══════════════════════════════════════════════════════════════════════════════

// Food and water bases
rel.registerItemSource(98500, { type: 'processing', sourceId: 'inkweald_page_cap_cookery', sourceName: 'Page-Cap Cookery (Cooked Memory-Trout)', region: 'inkweald', details: 'Memory-trout (cooked). Heals 9 HP; every third bite, you remember something that didn\'t happen.', obscure: false });
rel.registerItemSource(98501, { type: 'processing', sourceId: 'inkweald_page_cap_cookery_eel', sourceName: 'Page-Cap Cookery (What-Was-Promised)', region: 'inkweald', details: 'What-was-promised (cooked glass-eel). Heals the hit you should have dodged; carry for boss prep.', obscure: false });
rel.registerItemSource(98502, { type: 'processing', sourceId: 'inkweald_page_cap_cookery_melon', sourceName: 'Page-Cap Cookery (Midnight-Melon Slice)', region: 'inkweald', details: 'Midnight-melon slice. Heals 14 HP at night; 6 HP by day.', obscure: false });
rel.registerItemSource(98503, { type: 'processing', sourceId: 'inkweald_vial_of_dream_water', sourceName: 'Vial of Dream-Water', region: 'inkweald', details: 'Vial of water (dream-bottled). Potion base for all Inkweald herblore. Bottles are glass-iron.', obscure: false });

// Herblore chain
rel.registerItemSource(98510, { type: 'gathering', sourceId: 'inkweald_dream_mint_patch', sourceName: 'Dream-Mint Patch', region: 'inkweald', details: 'Dream-mint. Grows in reverse. Pick before planting. Reverse-decay potion base.', obscure: false });
rel.registerItemSource(98511, { type: 'gathering', sourceId: 'inkweald_forget_me_nut_tree', sourceName: 'Forget-Me-Nut Tree', region: 'inkweald', details: 'Forget-me-nut. Secondary for reverse-decay and lucid potions. Tastes like Tuesday.', obscure: false });
rel.registerItemSource(98512, { type: 'gathering', sourceId: 'inkweald_reverse_sage_patch', sourceName: 'Reverse-Sage Patch', region: 'inkweald', details: 'Reverse-sage. Herblore herb; brews potions that recover stats you haven\'t lost yet.', obscure: false });

// Runes (Echo Vaults outputs registered for analyzer matching)
rel.registerItemSource(98520, { type: 'processing', sourceId: 'inkweald_echo_vaults', sourceName: 'Echo Vaults Altar', region: 'inkweald', details: 'Dream rune (from Echo Vaults). Fuels Lunar-kin spells.', obscure: false });
rel.registerItemSource(98521, { type: 'processing', sourceId: 'inkweald_echo_vaults_name', sourceName: 'Echo Vaults Name Altar', region: 'inkweald', details: 'Name rune. Required for dream-warding prayers and Library magic.', obscure: false });
rel.registerItemSource(98522, { type: 'processing', sourceId: 'inkweald_echo_vaults_mind', sourceName: 'Echo Vaults Mind Altar', region: 'inkweald', details: 'Mind rune (Inkweald-native source). Library magic input.', obscure: false });
rel.registerItemSource(98523, { type: 'processing', sourceId: 'inkweald_echo_vaults_water', sourceName: 'Echo Vaults Water Altar', region: 'inkweald', details: 'Water rune (Inkweald-native). Library magic input.', obscure: true });
rel.registerItemSource(98524, { type: 'processing', sourceId: 'inkweald_echo_vaults_astral', sourceName: 'Echo Vaults Astral Altar', region: 'inkweald', details: 'Astral rune. Lunar spell input; Inkweald can supply its own without Lunar Isle trip.', obscure: false });

// Dream-iron / Glass-iron smithing outputs registered
rel.registerItemSource(98530, { type: 'processing', sourceId: 'inkweald_dream_forge_bar', sourceName: 'Dream Forge — Dream-Iron Bar', region: 'inkweald', details: 'Dream-iron bar. Bar holds one idea.', obscure: false });
rel.registerItemSource(98531, { type: 'processing', sourceId: 'inkweald_dream_forge_glass_iron_bar', sourceName: 'Dream Forge — Glass-Iron Bar', region: 'inkweald', details: 'Glass-iron bar. Transparent. Works only at Dream Forge.', obscure: false });
rel.registerItemSource(98532, { type: 'processing', sourceId: 'inkweald_dream_forge_nails', sourceName: 'Dream Forge — Dream-Iron Nails', region: 'inkweald', details: 'Dream-iron nails. For Backseam construction.', obscure: false });
rel.registerItemSource(98533, { type: 'processing', sourceId: 'inkweald_dream_forge_hinges', sourceName: 'Dream Forge — Glass-Iron Hinges', region: 'inkweald', details: 'Glass-iron hinges. Pavilion construction; the door that opens last.', obscure: true });

// Cradlewood processed
rel.registerItemSource(98540, { type: 'processing', sourceId: 'inkweald_cradlewood_plank_mill', sourceName: 'Cradlewood Plank Mill', region: 'inkweald', details: 'Dream-oak plank. Singing-soft plank. Hum-cedar plank. Milled at the clearing.', obscure: false });
rel.registerItemSource(98541, { type: 'processing', sourceId: 'inkweald_fletching_bowstring', sourceName: 'Inkweald Fletching — Singing-Soft Bowstring', region: 'inkweald', details: 'Bowstring (singing-soft). Spun from dream-thread; alternative to flax bowstring.', obscure: true });

// Farm seeds — Inkweald gets them from the Seed-Keeper (Midnight Cousin)
rel.registerItemSource(98550, { type: 'shop', sourceId: 'inkweald_seed_keeper', sourceName: 'Seed-Keeper (Midnight Cousin)', region: 'inkweald', details: 'Dream-seed. One per midnight. Grows dream-fennel, sleep-cabbage, midnight-melon.', obscure: false });
rel.registerItemSource(98551, { type: 'shop', sourceId: 'inkweald_herb_seed_seller', sourceName: 'Inkweald Herb-Seed Seller', region: 'inkweald', details: 'Herb seeds — including dream-mint, forget-me-nut, reverse-sage. Rotating stock.', obscure: false });

// Bones and feathers
rel.registerItemSource(98560, { type: 'drop', sourceId: 'inkweald_page_spawn_bones', sourceName: 'Sleeper Trails Page-Spawn Drop', region: 'inkweald', details: 'Bones. Dropped by page-spawn and ink-shaped. Fuel for Threshold prayer.', obscure: false });
rel.registerItemSource(98561, { type: 'drop', sourceId: 'inkweald_magpie_feathers', sourceName: 'Name-Stealing Magpie Feather Drop', region: 'inkweald', details: 'Feathers. Fletching input; bait for Memory Brook.', obscure: false });

// Universal fallback for food — Inkweald can produce Sharks-equivalent (memory-trout cooked)
rel.registerItemSource(98570, { type: 'processing', sourceId: 'inkweald_page_cap_cookery_sharks', sourceName: 'Page-Cap Cookery (What-Was-Promised)', region: 'inkweald', details: 'Sharks (equivalent: what-was-promised heals 20+ HP). Registered for analyzer name match.', obscure: false });

// Construction mortar — Inkweald can mix its own
rel.registerItemSource(98580, { type: 'processing', sourceId: 'inkweald_mortar_mix', sourceName: 'Inkweald Mortar Mix', region: 'inkweald', details: 'Construction mortar. Dream-iron dust + bog-clay + a sleepwalker\'s breath.', obscure: true });

// Pure essence — Inkweald can mine a local variant at the Echo Vaults
rel.registerItemSource(98590, { type: 'gathering', sourceId: 'inkweald_pure_essence_vein', sourceName: 'Inkweald Pure Essence Vein', region: 'inkweald', details: 'Pure essence (Inkweald variant). Essence-mining near the Echo Vaults.', obscure: false });

// Coal — cursed-dream variant at the Dream Forge
rel.registerItemSource(98591, { type: 'gathering', sourceId: 'inkweald_dream_coal_seam', sourceName: 'Dream-Coal Seam', region: 'inkweald', details: 'Coal (dream-coal). Burns at the Dream Forge; smelts dream-iron.', obscure: false });

// Prayer secondaries
rel.registerItemSource(98592, { type: 'drop', sourceId: 'inkweald_dragon_shade_drop', sourceName: 'Dream Drake — Dragon Bones', region: 'inkweald', details: 'Dragon bones. Prestige dream drake drop. Feeds Threshold prayer.', obscure: false });
rel.registerItemSource(98593, { type: 'drop', sourceId: 'inkweald_unsaid_name_drop', sourceName: 'Threshold Unsaid-Name', region: 'inkweald', details: 'Unsaid-name. Prayer + RC secondary. Cannot be carried across the threshold twice.', obscure: true });

// Super combat / prayer potion equivalents brewed in Inkweald
rel.registerItemSource(98594, { type: 'processing', sourceId: 'inkweald_backwards_garden_combat', sourceName: 'Backwards Garden Super Combat', region: 'inkweald', details: 'Super combat potion. Reverse-sage + dream-fennel + glass-iron vial.', obscure: false });
rel.registerItemSource(98595, { type: 'processing', sourceId: 'inkweald_backwards_garden_prayer', sourceName: 'Backwards Garden Prayer Potion', region: 'inkweald', details: 'Prayer potion (4). Dream-fennel + unsaid-name. Inkweald-native.', obscure: false });
rel.registerItemSource(98596, { type: 'processing', sourceId: 'inkweald_backwards_garden_restore', sourceName: 'Backwards Garden Super Restore', region: 'inkweald', details: 'Super restore (4). Reverse-sage + forget-me-nut.', obscure: false });
rel.registerItemSource(98597, { type: 'processing', sourceId: 'inkweald_backwards_garden_lucid', sourceName: 'Backwards Garden Lucid Potion', region: 'inkweald', details: 'Lucid potion (4). Two minutes of clarity; you will forget what you thought about.', obscure: false });

// ══════════════════════════════════════════════════════════════════════════════
// INKWEALD RECIPES — chain the dream-loop so flood-fill reaches everything
// ══════════════════════════════════════════════════════════════════════════════

rel.defineCombination(98601, {
  resultName: 'Dream-Iron Bar',
  inputs: [
    { id: 98261, name: 'Dream-iron ore', consumed: true },
    { id: 98591, name: 'Dream-coal', consumed: true },
  ],
  skill: 'smithing', level: 30, xp: 22, station: 'furnace',
  description: 'Dream-iron bar. The idea you were holding becomes the bar. Hold a good one.',
});

rel.defineCombination(98602, {
  resultName: 'Glass-Iron Bar',
  inputs: [
    { id: 98262, name: 'Glass-iron ore', consumed: true },
    { id: 98591, name: 'Dream-coal', consumed: true },
    { id: 98591, name: 'Dream-coal', consumed: true },
  ],
  skill: 'smithing', level: 70, xp: 34, station: 'furnace',
  description: 'Glass-iron bar. Transparent; shows the bar you meant to forge.',
});

rel.defineCombination(98603, {
  resultName: 'Dream-Arrow',
  inputs: [
    { id: 98256, name: 'Singing-soft logs', consumed: true },
    { id: 98561, name: 'Magpie feather', consumed: true },
  ],
  skill: 'fletching', level: 20, xp: 8,
  description: 'Dream-arrow. Hums before it leaves the bow. Lands where you meant to.',
});

rel.defineCombination(98604, {
  resultName: 'Mirror-Bow',
  inputs: [
    { id: 98258, name: 'Dream-oak plank', consumed: true },
    { id: 98253, name: 'Mirror-hide', consumed: true },
    { id: 98541, name: 'Bowstring (singing-soft)', consumed: true },
  ],
  skill: 'fletching', level: 55, xp: 85,
  description: 'Mirror-bow. Catches the shot back. Fires what-was-aimed-at. +10% vs dream-kind.',
});

rel.defineCombination(98605, {
  resultName: 'Reverse-Decay Potion (4)',
  inputs: [
    { id: 98510, name: 'Dream-mint', consumed: true },
    { id: 98511, name: 'Forget-me-nut', consumed: true },
    { id: 98503, name: 'Vial of dream-water', consumed: true },
  ],
  skill: 'herblore', level: 15, xp: 72,
  description: 'Drink before you need it. Undoes the last ten seconds of damage.',
});

rel.defineCombination(98606, {
  resultName: 'Lucid Potion (4)',
  inputs: [
    { id: 9002, name: 'Lucid essence', consumed: true },
    { id: 9005, name: 'Echo petal', consumed: true },
    { id: 98503, name: 'Vial of dream-water', consumed: true },
  ],
  skill: 'herblore', level: 50, xp: 110,
  description: 'Two minutes of perfect clarity. You will forget what you thought about.',
});

rel.defineCombination(98607, {
  resultName: 'Paradox Potion',
  inputs: [
    { id: 98203, name: 'Paradox fur', consumed: true },
    { id: 9002, name: 'Lucid essence', consumed: true },
  ],
  skill: 'herblore', level: 65, xp: 145,
  description: 'Doubles the XP of your next skill action. Once. The fur must be given willingly.',
});

rel.defineCombination(98608, {
  resultName: 'Memory-Trout (cooked)',
  inputs: [{ id: 98250, name: 'Raw memory-trout', consumed: true }],
  skill: 'cooking', level: 15, xp: 80, station: 'range',
  description: 'Heals 9 HP. Every third bite, you remember something that didn\'t happen.',
});

rel.defineCombination(98609, {
  resultName: 'What-Was-Promised (cooked glass-eel)',
  inputs: [{ id: 98251, name: 'Raw glass-eel', consumed: true }],
  skill: 'cooking', level: 55, xp: 190, station: 'range',
  description: 'Heals 22 HP. The bite tastes like the hit you should have dodged.',
});

rel.defineCombination(98610, {
  resultName: 'Midnight-Melon Slice',
  inputs: [{ id: 98267, name: 'Midnight-melon', consumed: true }],
  skill: 'cooking', level: 35, xp: 130, station: 'range',
  description: 'Heals 14 HP at night; 6 HP by day. The melon remembers the hour.',
});

rel.defineCombination(98611, {
  resultName: 'Dream-Oak Plank',
  inputs: [{ id: 98258, name: 'Dream-oak logs', consumed: true }],
  skill: 'construction', level: 60, xp: 38, station: 'sawmill',
  description: 'Planks hold an idea for one night. Build fast.',
});

rel.defineCombination(98612, {
  resultName: 'Answered Antler Cape',
  inputs: [
    { id: 98253, name: 'Answered antler', consumed: true },
    { id: 98253, name: 'Mirror-hide', consumed: true },
    { id: 9003, name: 'Dream thread', consumed: true },
  ],
  skill: 'crafting', level: 70, xp: 240,
  description: 'Cape. Reflects one hit per minute. BIS prayer-switch in dream-kind combat.',
});

rel.defineCombination(98613, {
  resultName: 'Dream Rune',
  inputs: [{ id: 98590, name: 'Pure essence (Inkweald)', consumed: true }],
  skill: 'runecrafting', level: 55, xp: 9, station: 'altar',
  description: 'Dream rune at the Echo Vaults. Mid-tier Lunar-kin.',
});

rel.defineCombination(98614, {
  resultName: 'Name Rune',
  inputs: [
    { id: 98590, name: 'Pure essence (Inkweald)', consumed: true },
    { id: 98268, name: 'Unsaid-name', consumed: true },
  ],
  skill: 'runecrafting', level: 72, xp: 13, station: 'altar',
  description: 'Name-rune. Calls a thing by what it almost was.',
});

rel.defineCombination(98615, {
  resultName: 'Lantern of the Dreamless',
  inputs: [
    { id: 98264, name: 'Dream-light sap', consumed: true },
    { id: 98533, name: 'Glass-iron hinges', consumed: true },
    { id: 98268, name: 'Unsaid-name', consumed: true },
  ],
  skill: 'crafting', level: 60, xp: 180,
  description: 'Holds one wish for one night. Burns no fuel in a sleeper\'s hand.',
});

// ══════════════════════════════════════════════════════════════════════════════
// ITEM USES — dense web so nothing is orphaned
// ══════════════════════════════════════════════════════════════════════════════

// Dream-thread chains
rel.registerItemUse(9003, { type: 'recipe', targetId: 98612, targetName: 'Answered Antler Cape', region: 'inkweald', details: 'Dream-thread binds the cape.', obscure: false });
rel.registerItemUse(9003, { type: 'recipe', targetId: 98541, targetName: 'Singing-Soft Bowstring', region: 'inkweald', details: 'Spun into dream-bowstring.', obscure: true });

// Inkblot fragment chains
rel.registerItemUse(9001, { type: 'recipe', targetId: 'ink_shaped_binding', targetName: 'Ink-Shaped Binding', region: 'inkweald', details: 'Inkblot fragment binds ink-shaped creatures to page.', obscure: true });
rel.registerItemUse(9001, { type: 'recipe', targetId: 'dream_ink_paper', targetName: 'Dream-Ink Paper', region: 'inkweald', details: 'Crafting: scribe-from-self parchment requires inkblot.', obscure: false });

// Lucid essence chains
rel.registerItemUse(9002, { type: 'recipe', targetId: 98606, targetName: 'Lucid Potion (4)', region: 'inkweald', details: 'Lucid essence is the potion base.', obscure: false });
rel.registerItemUse(9002, { type: 'recipe', targetId: 98607, targetName: 'Paradox Potion', region: 'inkweald', details: 'Combines with paradox fur for double-XP potion.', obscure: false });

// Echo petal chains
rel.registerItemUse(9005, { type: 'recipe', targetId: 98606, targetName: 'Lucid Potion (4)', region: 'inkweald', details: 'Echo petal secondary for lucid potion.', obscure: false });
rel.registerItemUse(9005, { type: 'recipe', targetId: 'echo_scroll_binding', targetName: 'Echo Scroll Binding', region: 'inkweald', details: 'Library scroll-binding secondary.', obscure: true });

// Nightmare shard chains
rel.registerItemUse(9004, { type: 'recipe', targetId: 'shade_of_dread_amulet', targetName: 'Shade-of-Dread Amulet', region: 'inkweald', details: 'Crafts nightmare-shard amulets.', obscure: false });
rel.registerItemUse(9004, { type: 'offering', targetId: 'threshold_offering', targetName: 'Threshold Offering', region: 'inkweald', details: 'Burned at the Threshold for prayer XP and an unsaid-name.', obscure: true });

// Mirror-hide chains
rel.registerItemUse(98253, { type: 'recipe', targetId: 98612, targetName: 'Answered Antler Cape', region: 'inkweald', details: 'Mirror-hide is the cape body.', obscure: false });
rel.registerItemUse(98253, { type: 'recipe', targetId: 98604, targetName: 'Mirror-Bow', region: 'inkweald', details: 'Mirror-hide grip for mirror-bows.', obscure: false });

// Stolen name chains
rel.registerItemUse(98255, { type: 'secondary', targetId: 'dreambinding_spell', targetName: 'Dreambinding Spell', region: 'inkweald', details: 'Stolen name reagent for dreambinding.', obscure: false });
rel.registerItemUse(98255, { type: 'shop', targetId: 'inkweald_chime_black_market', targetName: 'Chime Black Market', region: 'inkweald', details: 'Sellable to the Chime fence for coin.', obscure: true });

// Singing-soft logs chains
rel.registerItemUse(98256, { type: 'recipe', targetId: 98603, targetName: 'Dream-Arrow', region: 'inkweald', details: 'Dream-arrow shafts.', obscure: false });
rel.registerItemUse(98256, { type: 'processing', targetId: 'singing_soft_plank', targetName: 'Singing-Soft Plank', region: 'inkweald', details: 'Milled for construction.', obscure: false });

// Dream-oak logs chains
rel.registerItemUse(98258, { type: 'recipe', targetId: 98611, targetName: 'Dream-Oak Plank', region: 'inkweald', details: 'Mill into planks.', obscure: false });
rel.registerItemUse(98258, { type: 'recipe', targetId: 98604, targetName: 'Mirror-Bow', region: 'inkweald', details: 'Dream-oak bow blank.', obscure: false });

// Dream-iron bar chains
rel.registerItemUse(98530, { type: 'recipe', targetId: 98532, targetName: 'Dream-Iron Nails', region: 'inkweald', details: 'Dream-iron nails for Backseam construction.', obscure: false });
rel.registerItemUse(98530, { type: 'recipe', targetId: 'dream_anvil_hammer', targetName: 'Dream-Anvil Hammer', region: 'inkweald', details: 'Quest reward; held an idea forever.', obscure: true });

// Glass-iron bar chains
rel.registerItemUse(98531, { type: 'recipe', targetId: 98533, targetName: 'Glass-Iron Hinges', region: 'inkweald', details: 'Glass-iron hinges for dream-pavilion construction.', obscure: false });
rel.registerItemUse(98531, { type: 'recipe', targetId: 98615, targetName: 'Lantern of the Dreamless', region: 'inkweald', details: 'Glass-iron lantern frame.', obscure: false });

// Moon-touched crystal shard chains
rel.registerItemUse(98263, { type: 'recipe', targetId: 'moon_touched_amulet', targetName: 'Moon-Touched Amulet', region: 'inkweald', details: 'Crystal jewelry with lunar spell bonuses.', obscure: false });
rel.registerItemUse(98263, { type: 'recipe', targetId: 'lunar_staff_enchant', targetName: 'Lunar Staff Enchant', region: 'inkweald', details: 'Enchants Lucid Staff at the Dream Forge.', obscure: true });

// Memory-trout chains
rel.registerItemUse(98250, { type: 'recipe', targetId: 98608, targetName: 'Memory-Trout (cooked)', region: 'inkweald', details: 'Cook for 9 HP heal.', obscure: false });
rel.registerItemUse(98250, { type: 'offering', targetId: 'memory_brook_feed', targetName: 'Memory Brook Feeding', region: 'inkweald', details: 'Drop raw trout back into the brook — it remembers you fondly; +5% fishing catch rate for an hour.', obscure: true });

// Glass-eel chains
rel.registerItemUse(98251, { type: 'recipe', targetId: 98609, targetName: 'What-Was-Promised', region: 'inkweald', details: 'Cook for 22 HP heal.', obscure: false });
rel.registerItemUse(98251, { type: 'secondary', targetId: 'glass_eel_potion', targetName: 'Glass-Eel Potion', region: 'inkweald', details: 'Herblore secondary in a dream-potion.', obscure: true });

// Backwards garden herbs — multi-use
rel.registerItemUse(98510, { type: 'recipe', targetId: 98605, targetName: 'Reverse-Decay Potion', region: 'inkweald', details: 'Dream-mint is the base herb.', obscure: false });
rel.registerItemUse(98510, { type: 'recipe', targetId: 98594, targetName: 'Super Combat (Backwards)', region: 'inkweald', details: 'Mint in the super combat brew.', obscure: true });

rel.registerItemUse(98511, { type: 'recipe', targetId: 98605, targetName: 'Reverse-Decay Potion', region: 'inkweald', details: 'Forget-me-nut is the secondary.', obscure: false });
rel.registerItemUse(98511, { type: 'recipe', targetId: 98596, targetName: 'Super Restore (Backwards)', region: 'inkweald', details: 'Nut in the backwards super restore.', obscure: false });

// Unsaid-name chains
rel.registerItemUse(98268, { type: 'offering', targetId: 'threshold_prayer', targetName: 'Threshold Prayer', region: 'inkweald', details: 'Unsaid-name burns one bone; prayer XP.', obscure: false });
rel.registerItemUse(98268, { type: 'recipe', targetId: 98614, targetName: 'Name-Rune Crafting', region: 'inkweald', details: 'Required secondary for name-rune.', obscure: false });

// Answered antler chains
rel.registerItemUse(98253, { type: 'recipe', targetId: 'answered_antler_cape_frame', targetName: 'Answered Antler Cape Frame', region: 'inkweald', details: 'Crafting: BIS prayer-switch cape.', obscure: false });

// Dream-light sap chains
rel.registerItemUse(98264, { type: 'recipe', targetId: 98615, targetName: 'Lantern of the Dreamless', region: 'inkweald', details: 'Dream-light oil fuels the lantern.', obscure: false });
rel.registerItemUse(98264, { type: 'offering', targetId: 'vigil_lights_firemaking', targetName: 'Vigil Lights', region: 'inkweald', details: 'Burns at Vigil Lights — firemaking XP.', obscure: false });

// Pure essence — cross-region universal
rel.registerItemUse(98590, { type: 'recipe', targetId: 98613, targetName: 'Dream Rune', region: 'inkweald', details: 'Dream rune base.', obscure: false });
rel.registerItemUse(98590, { type: 'recipe', targetId: 98614, targetName: 'Name Rune', region: 'inkweald', details: 'Name rune base.', obscure: false });

// Lantern of the Dreamless chains
rel.registerItemUse(98615, { type: 'equip', targetId: 'inkweald_travel', targetName: 'Inkweald Travel Aid', region: 'inkweald', details: 'Equipped: holds a single wish for one night; passive travel bonus in forest.', obscure: false });

// Dream-seed chains
rel.registerItemUse(98550, { type: 'recipe', targetId: 'inkweald_half_forgotten_farming', targetName: 'Half-Forgotten Farm Planting', region: 'inkweald', details: 'One midnight-cousin seed per patch.', obscure: false });

console.log('[aelgard] Inkweald Density loaded: 40+ items registered as Inkweald sources, 15 recipes, dense cross-use web');
