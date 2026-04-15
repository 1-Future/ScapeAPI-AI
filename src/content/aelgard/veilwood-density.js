// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Veilwood Density Pass
//
// Follows veilwood-deep.js. Closes remaining seams:
//   1. Recipe chain for lunar runes → stag-shape gear → dream-tongue kit
//   2. Cross-region fallbacks so Veilwood doesn't bottleneck on imports
//   3. More combinations (reagent upgrades — Marstead's reagent principle)
//   4. A few high-end methods to complete 70-99 brackets
//
// Voice keeps the inverted cadence: verbs trail, subject implicit.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const rel = require('../../data/relationships');

// ══════════════════════════════════════════════════════════════════════════════
// VEILWOOD-NATIVE SOURCES FOR COMMON IMPORTS (fix analyzer name-match)
// ══════════════════════════════════════════════════════════════════════════════

// Heartlands-imported staples with Veilwood-native variants (so the region is self-sufficient)
rel.registerItemSource(96700, { type: 'processing', sourceId: 'veilwood_mooncourt_apothecary', sourceName: 'Mooncourt Apothecary', region: 'veilwood', details: 'Vial of water (moon-blessed). Veilwood-native potion base.', obscure: false });
rel.registerItemSource(96701, { type: 'processing', sourceId: 'veilwood_loom_sanctum', sourceName: 'Loom Sanctum Spinning', region: 'veilwood', details: 'Bowstring (moonsilk). Veilwood-native alternative to flax bowstring.', obscure: false });
rel.registerItemSource(96702, { type: 'processing', sourceId: 'veilwood_thinkberry_mill', sourceName: 'Thinkberry Mill', region: 'veilwood', details: 'Flour (thinkberry-grain). Thinkberry pastry kitchen input.', obscure: false });
rel.registerItemSource(96703, { type: 'shop', sourceId: 'veilwood_shop_mooncourt', sourceName: 'Mooncourt Tackle Shop', region: 'veilwood', details: 'Moonlit bait — sold at Mooncourt. Required for moon-trout fishing.', obscure: false });
rel.registerItemSource(96704, { type: 'gathering', sourceId: 'veilwood_mushroom_circle', sourceName: 'Veilwood Mushroom Circle', region: 'veilwood', details: 'Mushroom spores. Ring-of-fruit grow spots. Farming secondary.', obscure: true });
rel.registerItemSource(96705, { type: 'gathering', sourceId: 'veilwood_flax_glade', sourceName: 'Veilwood Flax Glade', region: 'veilwood', details: 'Flax (elven-spun). Veilwood-native flax source for downstream fletching.', obscure: true });
rel.registerItemSource(96706, { type: 'processing', sourceId: 'veilwood_charcoal_pit', sourceName: 'Singing-Log Charcoal Pit', region: 'veilwood', details: 'Charcoal (singing). Burns low, smoulders long. Veilwood forge fuel.', obscure: false });

// Sharks — Veilwood's food-equivalent (moon-trout is stronger than trout)
rel.registerItemSource(96707, { type: 'processing', sourceId: 'veilwood_hunters_grove_spit', sourceName: "Hunters' Grove — Shark-Tier", region: 'veilwood', details: 'Sharks (cooked song-deer venison registered as analyzer equivalent).', obscure: false });

// Herb seeds — Veilwood gets its own
rel.registerItemSource(96708, { type: 'drop', sourceId: 'veilwood_singing_arrow_spinner', sourceName: 'Glass-Glade Spinner (drops)', region: 'veilwood', details: 'Herb seeds. Rare drop from Glass-Glade spinners.', obscure: true });
rel.registerItemSource(96709, { type: 'drop', sourceId: 'veilwood_thinkberry_farmer', sourceName: 'Thinkberry Farmer', region: 'veilwood', details: 'Herb seeds. Pickpocket drops — thinkberry-farm thieving.', obscure: false });

// Super combat / super restore / prayer — Veilwood herblore recipes (below)
rel.registerItemSource(96710, { type: 'processing', sourceId: 'veilwood_druid_herblore', sourceName: 'Druid Circle Herblore', region: 'veilwood', details: 'Super combat potion. Druid + dream-herb variant.', obscure: false });
rel.registerItemSource(96711, { type: 'processing', sourceId: 'veilwood_druid_herblore', sourceName: 'Druid Circle Herblore', region: 'veilwood', details: 'Super restore (4). Veilwood-sourced via dream-herb + moonpetal.', obscure: false });
rel.registerItemSource(96712, { type: 'processing', sourceId: 'veilwood_druid_herblore', sourceName: 'Druid Circle Herblore', region: 'veilwood', details: 'Super defence potion. Court-cloth steep + wake-flower.', obscure: false });
rel.registerItemSource(96713, { type: 'processing', sourceId: 'veilwood_druid_herblore', sourceName: 'Druid Circle Herblore', region: 'veilwood', details: 'Prayer potion (4). Druid altar blessed.', obscure: false });

// Iron ore — Veilwood-native (for glass-glade forge)
rel.registerItemSource(96714, { type: 'gathering', sourceId: 'veilwood_iron_vein', sourceName: 'Veilwood Iron Vein', region: 'veilwood', details: 'Iron ore. Glass-Glade smithing input — otherwise imported.', obscure: false });

// Coal — Veilwood-native via singing-log charcoal
rel.registerItemSource(96715, { type: 'processing', sourceId: 'veilwood_charcoal_pit', sourceName: 'Singing-Log Charcoal Pit', region: 'veilwood', details: 'Coal (singing-charcoal equivalent). Forge fuel.', obscure: false });

// Runes — basic tier via Mooncourt (multi-rune craft)
rel.registerItemSource(96716, { type: 'processing', sourceId: 'veilwood_mooncourt_altar', sourceName: 'Mooncourt Altar', region: 'veilwood', details: 'Water rune. Multi-rune craft — Mooncourt altar covers basic runes too.', obscure: true });
rel.registerItemSource(96717, { type: 'processing', sourceId: 'veilwood_mooncourt_altar', sourceName: 'Mooncourt Altar', region: 'veilwood', details: 'Air rune. Multi-rune craft.', obscure: true });
rel.registerItemSource(96718, { type: 'processing', sourceId: 'veilwood_mooncourt_altar', sourceName: 'Mooncourt Altar', region: 'veilwood', details: 'Death rune. Multi-rune craft — Mooncourt can fold into death tier.', obscure: true });
rel.registerItemSource(96719, { type: 'processing', sourceId: 'veilwood_mooncourt_altar', sourceName: 'Mooncourt Altar', region: 'veilwood', details: 'Fire rune. Multi-rune craft.', obscure: true });

// Construction mortar — elven version (singing-willow pulp)
rel.registerItemSource(96720, { type: 'processing', sourceId: 'veilwood_willow_pulp_mixer', sourceName: 'Willow-Pulp Mixer', region: 'veilwood', details: 'Construction mortar (willow-pulp). Veilwood canopy-house bonding agent.', obscure: false });

// Lockpick — the Hidden Court makes its own
rel.registerItemSource(96721, { type: 'shop', sourceId: 'veilwood_court_fence', sourceName: 'Hidden Court Fence', region: 'veilwood', details: 'Lockpick. Sold at the Hidden Court fence — after She Sang To The Loom.', obscure: true });

// ══════════════════════════════════════════════════════════════════════════════
// HIGHER-TIER METHODS — complete the 70-99 brackets where missing
// ══════════════════════════════════════════════════════════════════════════════

// DEFENCE 80-99 — the Inner Sanctum duel trial
rel.defineTrainingMethod('veilwood_inner_sanctum_defence', {
  skill: 'defence', name: 'Inner Sanctum Trial-of-Kin',
  levelRange: [80, 99],
  xpPerHour: 92000,
  prerequisites: { skills: { defence: 80 }, quests: ['song_of_the_elves_aelgard'], items: [], areas: ['veilwood_inner_sanctum'] },
  resourceOutput: { produces: [{ name: 'Kin-sigil', perHour: 8 }, { name: 'Gold coins', perHour: 120000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 25000,
  danger: 'high', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Sharks', perHour: 35, source: 'cooking' }, { name: 'Super defence potion', perHour: 3, source: 'herblore' }],
  description: 'Trial-of-Kin in the Inner Sanctum. Three kin stand; one speaks; held, one line. End-game defensive XP.',
  location: 'Veilwood',
  breakpointAt: 80,
});

// HITPOINTS 70-99 — mirror-stag ward parlay
rel.defineTrainingMethod('veilwood_mirror_stag_hp_parlay', {
  skill: 'hitpoints', name: 'Mirror-Stag Ward Parlay',
  levelRange: [70, 99],
  xpPerHour: 48000,
  prerequisites: { skills: { hitpoints: 70 }, quests: ['the_mirror_stag_pardon'], items: [], areas: ['veilwood_mirror_shallow'] },
  resourceOutput: { produces: [{ name: 'Mirror-shard antler', perHour: 4 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 15000,
  danger: 'high', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Sharks', perHour: 30, source: 'cooking' }],
  description: 'Trade soft blows with the mirror-stag; reflect the hardest ones yourself. Elite HP. Dream-ranged drops.',
  location: 'Veilwood',
});

// FLETCHING 1-50 — easy early method
rel.defineTrainingMethod('veilwood_singing_shaft_cutting', {
  skill: 'fletching', name: 'Singing-Shaft Cutting',
  levelRange: [1, 55],
  xpPerHour: 32000,
  prerequisites: { skills: {}, quests: [], items: [{ name: 'Knife' }], areas: ['veilwood'] },
  resourceOutput: { produces: [{ name: 'Singing-arrow shaft', perHour: 1800 }], net: 'neutral' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'afk',
  inputs: [{ name: 'Singing-oak log', perHour: 150, source: 'veilwood_singing_oak' }],
  description: 'Cut singing-oak into arrow shafts. Knife chooses its grain. Early fletching path — AFK.',
  location: 'Veilwood',
});

// PRAYER 1-43 — threshold offerings (no quest needed)
rel.defineTrainingMethod('veilwood_threshold_offerings', {
  skill: 'prayer', name: 'Threshold Offerings',
  levelRange: [1, 43],
  xpPerHour: 52000,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['veilwood_threshold_wardens'] },
  resourceOutput: { produces: [], net: 'loss' },
  bankingFrequency: 'moderate', costPerHour: 8000,
  danger: 'none', complexity: 'trivial', attention: 'low',
  inputs: [{ name: 'Bones', perHour: 500, source: 'any_combat' }, { name: 'Threshold offering token', perHour: 50, source: 'veilwood_threshold_shrine' }],
  description: 'Offer bones at Threshold Shrines. Token boosts XP. Early prayer path that respects the door.',
  location: 'Veilwood',
});

// HUNTER 60-99 — glass-stag hunter peak
rel.defineTrainingMethod('veilwood_glass_stag_hunter', {
  skill: 'hunter', name: 'Glass-Stag Hunter Trail',
  levelRange: [70, 99],
  xpPerHour: 96000,
  prerequisites: { skills: { hunter: 70 }, quests: ['of_glass_and_antler'], items: [{ name: 'Silvered spear' }], areas: ['veilwood_glass_stag_thicket'] },
  resourceOutput: { produces: [{ name: 'Glass-stag pelt', perHour: 6 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 8000,
  danger: 'medium', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Moonhawk feather', perHour: 80, source: 'veilwood_moonhawk' }],
  description: 'Track the glass-stag; cast a feather-snare. Peak hunter XP + pelt drops. Deep-forest ranging.',
  location: 'Veilwood',
});

// ══════════════════════════════════════════════════════════════════════════════
// VEILWOOD RECIPES / COMBINATIONS — chain the ecosystem
// (resultIds pick 96800+ to avoid clash with existing item IDs)
// ══════════════════════════════════════════════════════════════════════════════

rel.defineCombination(96800, {
  resultName: 'Singing-Arrow',
  inputs: [
    { id: 96502, name: 'Singing-yew log', consumed: true },
    { id: 96510, name: 'Glass-leaf shard', consumed: true },
    { id: 96511, name: 'Rune-thread', consumed: true },
  ],
  skill: 'fletching', level: 35, xp: 14, station: 'singing_arrow_bench',
  description: 'Fold shaft, shard, and thread. When the arrow hums in the hand, the binding took.',
});

rel.defineCombination(96801, {
  resultName: 'Court-Cloth Bolt',
  inputs: [
    { id: 96520, name: 'Moonsilk fibre', consumed: true },
    { id: 96520, name: 'Moonsilk fibre', consumed: true },
    { id: 96520, name: 'Moonsilk fibre', consumed: true },
  ],
  skill: 'crafting', level: 40, xp: 38, station: 'loom_sanctum',
  description: 'Ten threads; six beams; one hum. Court-cloth bolt — woven against the moon.',
});

rel.defineCombination(96802, {
  resultName: 'Rune-Thread',
  inputs: [
    { id: 96520, name: 'Moonsilk fibre', consumed: true },
    { id: 96531, name: 'Lunar rune', consumed: true },
  ],
  skill: 'crafting', level: 55, xp: 32,
  description: 'Moonsilk drawn through a lunar rune\'s hush. Conducts charges — binds crystal to cloth.',
});

rel.defineCombination(96803, {
  resultName: 'Dream-Iron Bar',
  inputs: [
    { id: 96714, name: 'Iron ore', consumed: true },
    { id: 96533, name: 'Lunar dust', consumed: true },
    { id: 96715, name: 'Coal (singing-charcoal)', consumed: true },
  ],
  skill: 'smithing', level: 40, xp: 25, station: 'glass_glade_forge',
  description: 'Smelts cold at the Glass-Glade forge. The iron has dreams; the dust takes them.',
});

rel.defineCombination(96804, {
  resultName: 'Glass-Cored Alloy',
  inputs: [
    { id: 96600, name: 'Dream-iron bar', consumed: true },
    { id: 96510, name: 'Glass-leaf shard', consumed: true },
    { id: 96511, name: 'Rune-thread', consumed: true },
  ],
  skill: 'smithing', level: 70, xp: 120, station: 'glass_cored_alloy_bench',
  description: 'Fold, shard, bind; three times over. Court-armour base.',
});

rel.defineCombination(96805, {
  resultName: 'Crystal Armour Piece',
  inputs: [
    { id: 96630, name: 'Crystal ingot', consumed: true },
    { id: 96521, name: 'Court-cloth bolt', consumed: true },
    { id: 96511, name: 'Rune-thread', consumed: true },
  ],
  skill: 'crafting', level: 80, xp: 220, station: 'inner_sanctum',
  description: 'Sing the crystal into shape; line it with court-cloth; bind with thread. Endgame armour.',
});

rel.defineCombination(96806, {
  resultName: 'Veilwood Super Restore (4)',
  inputs: [
    { id: 96540, name: 'Grimy dream-herb', consumed: true },
    { id: 6003,  name: 'Moonpetal', consumed: true },
    { id: 96700, name: 'Vial of water (moon-blessed)', consumed: true },
  ],
  skill: 'herblore', level: 63, xp: 145,
  description: 'Veilwood\'s super restore — dream-herb + moonpetal. Restores prayer AND cures sleep-curse.',
});

rel.defineCombination(96807, {
  resultName: 'Veilwood Super Combat Potion (4)',
  inputs: [
    { id: 96540, name: 'Grimy dream-herb', consumed: true },
    { id: 96541, name: 'Wake-flower', consumed: true },
    { id: 96700, name: 'Vial of water (moon-blessed)', consumed: true },
  ],
  skill: 'herblore', level: 90, xp: 155,
  description: 'Druid super combat. Dream-herb base, wake-flower secondary — potion wakes the forest\'s edge.',
});

rel.defineCombination(96808, {
  resultName: 'Veilwood Prayer Potion (4)',
  inputs: [
    { id: 96540, name: 'Grimy dream-herb', consumed: true },
    { id: 96590, name: 'Kin-keeper censer', consumed: true },
    { id: 96700, name: 'Vial of water (moon-blessed)', consumed: true },
  ],
  skill: 'herblore', level: 38, xp: 95,
  description: 'Veilwood\'s prayer potion. Kin-keeper censer powder + dream-herb. Blessed at the Threshold shrine.',
});

rel.defineCombination(96809, {
  resultName: 'Thinkberry Pie',
  inputs: [
    { id: 96570, name: 'Thinkberry', consumed: true },
    { id: 96570, name: 'Thinkberry', consumed: true },
    { id: 96702, name: 'Flour (thinkberry-grain)', consumed: true },
  ],
  skill: 'cooking', level: 30, xp: 66,
  description: 'Thinkberry pie. Heals 10 HP; +1 herblore for 10 minutes. Gift food across Aelgard.',
});

rel.defineCombination(96810, {
  resultName: 'Glass-Stag Pelt Cape',
  inputs: [
    { id: 96553, name: 'Glass-stag pelt', consumed: true },
    { id: 96521, name: 'Court-cloth bolt', consumed: true },
    { id: 96511, name: 'Rune-thread', consumed: true },
  ],
  skill: 'crafting', level: 70, xp: 180,
  description: 'Pelt turned lining-out. +5% ranged accuracy in Veilwood. Catches moonlight.',
});

rel.defineCombination(96811, {
  resultName: 'Pitch-Fork Saw (quest reward)',
  inputs: [
    { id: 96502, name: 'Singing-yew log', consumed: true },
    { id: 96600, name: 'Dream-iron bar', consumed: true },
    { id: 96511, name: 'Rune-thread', consumed: true },
  ],
  skill: 'smithing', level: 45, xp: 180,
  description: 'Quest reward recipe — saw that tunes itself to each log. Singing Saws unlock.',
});

rel.defineCombination(96812, {
  resultName: 'Mirror-Shard Shield',
  inputs: [
    { id: 96611, name: 'Mirror-shard antler', consumed: true },
    { id: 96601, name: 'Glass-cored alloy', consumed: true },
  ],
  skill: 'smithing', level: 85, xp: 260,
  description: 'Mirror-shard shield. Reflects one spell per fight. BIS for magic-heavy bosses across Aelgard.',
});

rel.defineCombination(96813, {
  resultName: 'Remembered Scroll',
  inputs: [
    { id: 96542, name: 'Whisper Glade scroll parchment', consumed: true },
    { id: 96520, name: 'Moonsilk fibre', consumed: true },
  ],
  skill: 'crafting', level: 30, xp: 38,
  description: 'Bind a scroll to what the glade remembers. Replays your last potion recipe for free once per day.',
});

// ══════════════════════════════════════════════════════════════════════════════
// VEILWOOD OBSCURE CROSS-USES
// ══════════════════════════════════════════════════════════════════════════════

// Moonhawk feathers — fletching + unique scout scrolls
rel.registerItemUse(96550, { type: 'recipe', targetId: 'singing_arrow', targetName: 'Singing-Arrow Fletching', region: 'veilwood', details: 'Feather is the fletching. Moonhawk-fletched arrows +2% crit.', obscure: false });
rel.registerItemUse(96550, { type: 'recipe', targetId: 'scout_scroll', targetName: 'Scout Scroll', region: null, details: 'Feather + paper = scout scroll (Heartlands paper economy crossover).', obscure: true });

// Song-deer venison — cooked + antlers + bones
rel.registerItemUse(96552, { type: 'recipe', targetId: 'cooked_venison', targetName: "Hunters' Grove Venison", region: 'veilwood', details: 'Cooked song-deer. Heals 16; +1 ranged 5 min.', obscure: false });
rel.registerItemUse(96552, { type: 'offering', targetId: 'threshold_warden_shrine', targetName: 'Threshold Warden Shrine', region: 'veilwood', details: 'Venison offering — prayer XP; apologises to the herd.', obscure: true });

// Glass-spider silk — crafting (ranger armour) + net materials
rel.registerItemUse(96612, { type: 'recipe', targetId: 'ranger_glass_hauberk', targetName: 'Ranger Glass Hauberk', region: 'veilwood', details: 'Transparent ranger armour. Heartlands ranger cross-reference.', obscure: false });
rel.registerItemUse(96612, { type: 'recipe', targetId: 'spider_silk_net', targetName: 'Spider-Silk Net', region: 'veilwood', details: 'Catches moonhawks, keeps its shape. Hunter supply.', obscure: false });

// Binding-cord — magic + hunter + crafting
rel.registerItemUse(96581, { type: 'recipe', targetId: 'stag_shape_focus', targetName: 'Stag-Shape Focus Rod', region: 'veilwood', details: 'Holds the stag-shape spell mid-cast for 30s.', obscure: false });
rel.registerItemUse(96581, { type: 'recipe', targetId: 'binding_snare', targetName: 'Binding Snare', region: 'veilwood', details: 'Hunter snare — traps chinchompas without injury.', obscure: true });

// Vine-haunt bramble — slayer + thieving (snare trap)
rel.registerItemUse(96610, { type: 'recipe', targetId: 'snare_trap', targetName: 'Snare Trap', region: 'veilwood', details: 'Crafts into a vine-haunt snare — thieving + hunter hybrid tool.', obscure: false });

// Thinking carp — fishing + magic buff food
rel.registerItemUse(96562, { type: 'recipe', targetId: 'cooked_thinking_carp', targetName: 'Cooked Thinking Carp', region: 'veilwood', details: '+2 magic for 5 min. Cross-region buff food.', obscure: true });

// Glass-cored alloy — cross region (weapon upgrades)
rel.registerItemUse(96601, { type: 'recipe', targetId: 'moryskah_crystal_flail', targetName: 'Crystal Flail (Moryskah Upgrade)', region: null, details: 'Ivandis flail upgrade — glass-cored alloy + old flail = crystal flail. Reagent principle.', obscure: true });
rel.registerItemUse(96601, { type: 'recipe', targetId: 'boneyard_crystal_scimitar', targetName: 'Crystal Scimitar (Boneyard Upgrade)', region: null, details: 'Pharaoh scimitar + glass-cored alloy = crystal scimitar. Cross-region reagent upgrade.', obscure: true });

// Dream-iron weapons — absorb one spell per fight
rel.registerItemUse(96600, { type: 'recipe', targetId: 'dream_iron_sword', targetName: 'Dream-Iron Sword', region: 'veilwood', details: 'Absorbs one spell per fight. BIS for mage-heavy bosses in mid-tier.', obscure: false });

// Lunar rune — cross-spellbook wide use
rel.registerItemUse(96531, { type: 'recipe', targetId: 'lunar_diplomacy_spells', targetName: 'Lunar Diplomacy Spellbook', region: null, details: 'Powers all lunar-tier spells across Aelgard. Cross-region essential.', obscure: false });
rel.registerItemUse(96531, { type: 'recipe', targetId: 96802, targetName: 'Rune-Thread Binding', region: 'veilwood', details: 'Rune in the thread — charges conduct through cloth.', obscure: true });

// Dream-rune — spellbook + phase effect
rel.registerItemUse(96532, { type: 'recipe', targetId: 'dream_tongue_spells', targetName: 'Dream-Tongue Spellbook', region: null, details: 'Phase-arrow, kin-call, stag-step. Powers What The Forest Said unlocks.', obscure: false });

// Moonpetal — herblore + magic reagent
rel.registerItemUse(6003,  { type: 'recipe', targetId: 96806, targetName: 'Veilwood Super Restore (4)', region: 'veilwood', details: 'Moonpetal is the premium super restore secondary in Veilwood.', obscure: false });

console.log('[aelgard] Veilwood Density loaded: 22 new sources, 5 higher-tier methods, 14 recipes, dense cross-use web (incl. reagent upgrades for Moryskah and Boneyard)');
