// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Glass Desert Deepening (Flagship Region #9 — Crystalline Endgame)
//
// Target: 12 → 65+ depth. Per analyzer, 16 skills hard-blocked. Only 9 methods.
// Glass Desert is Aelgard's endgame. Methods here are L60+ tier. Rewards elite.
// Crystal Wyrm already implemented in special-regions + glass-desert.js.
//
// Voice: glass-edged minimal. Sentences short. Verbs precise. Nothing wasted.
// The desert remembers what shape it was. Names: glass-walker, salt-singer,
// edge-keeper, lens-true. Verbs: cut, hold, know, witness. The Glass Desert
// speaks of itself as inevitable. McCarthy in SF.
//
// Landmarks introduced here:
//   - The Wyrm Lair          (slayer — crystal hunter, wyrm-spawn, glass-stalker)
//   - The Lens Forge         (smithing — crystal-cored armor, prism-blade)
//   - Singing Glass Caverns  (runecrafting — crystal-rune, light-rune, BiS)
//   - The Mirrored Spire     (magic — crystal-tier, prism-burst BiS combat)
//   - Salt-Glass Hunters     (hunter — falconry, lens-cat trapping)
//   - The Witness Wall       (prayer — light-warding, anti-corruption)
//   - Edge-Keeper Trials     (strength/defence/HP BiS combat)
//   - Glass-Walker Climbs    (agility — Mirrored Spire, glass-bridges)
//   - Crystal Anglers        (fishing — lens-fish, glass-eel, prism-trout)
//   - Refractory Fires       (firemaking — light-bind, crystal-imbued)
//   - Lens Apothecary        (herblore — crystal-tier BiS potions)
//   - Mirror Library Thieves (thieving — light-locked vaults)
//   - Glass-Glade Fletching  (fletching — crystal arrows, prism-bow)
//   - Salt-Glass Cookery     (cooking — crystal-cured fish, BiS food)
//   - Dunewright Construction(construction — crystal-glass walls, BiS POH)
//   - Lens-Glass Farming     (farming — prism-fruit, light-grass, BiS crops)
//   - The Witness Range      (ranged — prism-shot, light-arrow)
//   - Crystal Saw Camps      (woodcutting — crystal-bound, glass-cedar)
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const rel = require('../../data/relationships');

// ══════════════════════════════════════════════════════════════════════════════
// GLASS DESERT ITEM SOURCES (IDs 98400-98899 — endgame-native)
// Every method produces or consumes at least one of these.
// ══════════════════════════════════════════════════════════════════════════════

// Wyrm Lair — slayer drops
rel.registerItemSource(98400, { type: 'drop', sourceId: 'glass_desert_crystal_hunter', sourceName: 'Crystal Hunter', region: 'glass_desert', details: 'Crystal-hunter fang. Tier-5 slayer drop. Cuts to a single edge. Fletches into prism-bolt heads.', obscure: false });
rel.registerItemSource(98401, { type: 'drop', sourceId: 'glass_desert_wyrm_spawn', sourceName: 'Wyrm-Spawn', region: 'glass_desert', details: 'Wyrm-spawn shard. Slayer drop. Holds a single vibration of the Wyrm. Smithing input for crystal-cored bars.', obscure: false });
rel.registerItemSource(98402, { type: 'drop', sourceId: 'glass_desert_glass_stalker', sourceName: 'Glass-Stalker', region: 'glass_desert', details: 'Stalker-pane. Invisible at rest. Crafting input for lens-true armor plates.', obscure: false });
rel.registerItemSource(98403, { type: 'drop', sourceId: 'glass_desert_lens_cat', sourceName: 'Lens-Cat', region: 'glass_desert', details: 'Lens-cat whisker. Ultra-rare. Hunter + herblore secondary. Focuses light so cleanly it burns.', obscure: true });
rel.registerItemSource(98404, { type: 'drop', sourceId: 'glass_desert_prismstalker', sourceName: 'Prismstalker', region: 'glass_desert', details: 'Prismstalker scale. Refracts seven colors. Endgame ranged + magic crafting secondary.', obscure: false });
rel.registerItemSource(98405, { type: 'drop', sourceId: 'glass_desert_salt_singer', sourceName: 'Salt-Singer', region: 'glass_desert', details: 'Salt-singer throat-stone. Sings when struck. Runecrafting input for light-runes.', obscure: true });

// Mining — Crystal Mines (already referenced in glass-desert.js but register more IDs)
rel.registerItemSource(98410, { type: 'gathering', sourceId: 'glass_desert_prismstone_vein', sourceName: 'Prismstone Vein', region: 'glass_desert', details: 'Prismstone. Cuts seven ways. Crystal-cored armor substrate. Mining 75+ endgame.', obscure: false });
rel.registerItemSource(98411, { type: 'gathering', sourceId: 'glass_desert_lens_quartz_face', sourceName: 'Lens-Quartz Face', region: 'glass_desert', details: 'Lens-quartz. Clear as air. Refractory fires + BiS magic substrate. Mining 80+.', obscure: false });
rel.registerItemSource(98412, { type: 'gathering', sourceId: 'glass_desert_edgestone_shaft', sourceName: 'Edgestone Shaft', region: 'glass_desert', details: 'Edgestone. Holds an edge without a whetstone. Smithing flux for prism-blades.', obscure: false });
rel.registerItemSource(98413, { type: 'gathering', sourceId: 'glass_desert_memory_glass', sourceName: 'Memory-Glass Pool', region: 'glass_desert', details: 'Memory-glass. Holds the last shape it was. Construction + crafting input. Obscure.', obscure: true });

// Lens Forge — smithing
rel.registerItemSource(98420, { type: 'processing', sourceId: 'glass_desert_lens_forge', sourceName: 'The Lens Forge', region: 'glass_desert', details: 'Light-imbued metal bar. Lens Forge smelts prismstone + edgestone + lens-quartz. BiS smithing output.', obscure: false });
rel.registerItemSource(98421, { type: 'processing', sourceId: 'glass_desert_lens_forge', sourceName: 'The Lens Forge', region: 'glass_desert', details: 'Crystal-cored plate. Plate + lens-quartz core. Tier-5 armor. Lens Forge anvil only.', obscure: false });
rel.registerItemSource(98422, { type: 'processing', sourceId: 'glass_desert_lens_forge', sourceName: 'The Lens Forge', region: 'glass_desert', details: 'Prism-blade stock. Edgestone + prismstone + wyrm-spawn shard. BiS weapon blank.', obscure: false });

// Singing Glass Caverns — runecrafting
rel.registerItemSource(98430, { type: 'gathering', sourceId: 'glass_desert_singing_glass_bed', sourceName: 'Singing Glass Bed', region: 'glass_desert', details: 'Crystal-rune essence. Sings when carved. Runecrafting 85+. Endgame rune tier.', obscure: false });
rel.registerItemSource(98431, { type: 'gathering', sourceId: 'glass_desert_light_rune_stack', sourceName: 'Light-Rune Stack', region: 'glass_desert', details: 'Light-rune. Only rune that burns instead of breaks. BiS for endgame combat magic. Runecrafting 90+.', obscure: false });

// The Mirrored Spire — magic
rel.registerItemSource(98440, { type: 'processing', sourceId: 'glass_desert_mirrored_spire', sourceName: 'The Mirrored Spire', region: 'glass_desert', details: 'Prism-burst charge. Crystal-rune + lens-quartz + wyrm-spawn shard. BiS combat magic ammunition.', obscure: false });
rel.registerItemSource(98441, { type: 'processing', sourceId: 'glass_desert_mirrored_spire', sourceName: 'The Mirrored Spire', region: 'glass_desert', details: 'Light-binding focus. Light-rune + prismstalker scale. Crystal-tier spellbook inscription.', obscure: true });

// Salt-Glass Hunters — hunter
rel.registerItemSource(98450, { type: 'gathering', sourceId: 'glass_desert_falconry_perch', sourceName: 'Crystal Hunter Falconry Perch', region: 'glass_desert', details: 'Crystal-hunter feather. Falconry catches. Hunter 75+ endgame method. Fletching secondary.', obscure: false });
rel.registerItemSource(98451, { type: 'gathering', sourceId: 'glass_desert_lens_cat_trap', sourceName: 'Lens-Cat Trap Line', region: 'glass_desert', details: 'Lens-cat pelt. Trap-only. Hunter 85+ endgame. Crafts into light-warding cloak.', obscure: true });
rel.registerItemSource(98452, { type: 'gathering', sourceId: 'glass_desert_prismstalker_track', sourceName: 'Prismstalker Track', region: 'glass_desert', details: 'Prismstalker tail-scale. Tracker-only. Hunter 90+. BiS ranged crafting secondary.', obscure: false });

// The Witness Wall — prayer
rel.registerItemSource(98460, { type: 'gathering', sourceId: 'glass_desert_witness_wall', sourceName: 'The Witness Wall', region: 'glass_desert', details: 'Light-ward sigil. Carved at the Witness Wall. Prayer offering for light-warding chants.', obscure: false });
rel.registerItemSource(98461, { type: 'drop', sourceId: 'glass_desert_edge_keeper', sourceName: 'Edge-Keeper', region: 'glass_desert', details: 'Edge-keeper relic. Rare prayer drop. Stacks with Witness Wall offerings. Anti-corruption tier.', obscure: true });

// Edge-Keeper Trials — combat training
rel.registerItemSource(98470, { type: 'drop', sourceId: 'glass_desert_edge_keeper_trial', sourceName: 'Edge-Keeper Trial Drops', region: 'glass_desert', details: 'Edge-token. Trial completion currency. Trade for BiS combat gear at the Keeper.', obscure: false });

// Glass-Walker Climbs — agility
rel.registerItemSource(98480, { type: 'gathering', sourceId: 'glass_desert_mirrored_spire_climb', sourceName: 'Mirrored Spire Climb', region: 'glass_desert', details: 'Marks of grace (crystal). Glass-Walker climb yield. Agility 75+. Trade for agility-exclusive BiS.', obscure: false });
rel.registerItemSource(98481, { type: 'drop', sourceId: 'glass_desert_glass_bridge_run', sourceName: 'Glass-Bridge Run', region: 'glass_desert', details: 'Lens-walker seal. Rare (1/32) from Glass-Walker runs. Required for Glass-Walker\'s sash.', obscure: true });

// Crystal Anglers — fishing
rel.registerItemSource(98490, { type: 'gathering', sourceId: 'glass_desert_lens_fish_pool', sourceName: 'Lens-Fish Pool', region: 'glass_desert', details: 'Raw lens-fish. Clear through the gills. Fishing 70+. Salt-Glass Cookery input.', obscure: false });
rel.registerItemSource(98491, { type: 'gathering', sourceId: 'glass_desert_glass_eel_trench', sourceName: 'Glass-Eel Trench', region: 'glass_desert', details: 'Raw glass-eel. Fishing 80+. Eel meat and spine. Fletching secondary.', obscure: false });
rel.registerItemSource(98492, { type: 'gathering', sourceId: 'glass_desert_prism_trout_fall', sourceName: 'Prism-Trout Fall', region: 'glass_desert', details: 'Raw prism-trout. BiS Glass Desert fish. Fishing 90+. Heals 25 HP cooked. Endgame food tier.', obscure: false });

// Refractory Fires — firemaking
rel.registerItemSource(98500, { type: 'processing', sourceId: 'glass_desert_refractory_fire', sourceName: 'Refractory Fire', region: 'glass_desert', details: 'Light-bound torch. Burns without fuel. Firemaking 75+ output. Prayer + hunter double-use.', obscure: false });
rel.registerItemSource(98501, { type: 'processing', sourceId: 'glass_desert_refractory_fire', sourceName: 'Refractory Fire', region: 'glass_desert', details: 'Crystal-imbued ember. Firemaking 85+. Herblore catalyst for crystal-tier potions.', obscure: true });

// Lens Apothecary — herblore
rel.registerItemSource(98510, { type: 'processing', sourceId: 'glass_desert_lens_apothecary', sourceName: 'Lens Apothecary', region: 'glass_desert', details: 'Super combat ++ (crystal). Herblore 85+. BiS combat consumable. Overwrites super combat.', obscure: false });
rel.registerItemSource(98511, { type: 'processing', sourceId: 'glass_desert_lens_apothecary', sourceName: 'Lens Apothecary', region: 'glass_desert', details: 'Divine ranged ++ (crystal). Herblore 88+. BiS ranged consumable. Divine-class.', obscure: false });
rel.registerItemSource(98512, { type: 'processing', sourceId: 'glass_desert_lens_apothecary', sourceName: 'Lens Apothecary', region: 'glass_desert', details: 'Prism elixir. Herblore 92+. BiS magic consumable. +15% spell damage, 5 minutes.', obscure: true });

// Mirror Library — thieving
rel.registerItemSource(98520, { type: 'drop', sourceId: 'glass_desert_mirror_library', sourceName: 'Mirror Library Vault', region: 'glass_desert', details: 'Light-locked ledger. Thieving 80+ loot. Trade at the Librarian for crystal-tier spellbook pages.', obscure: false });
rel.registerItemSource(98521, { type: 'drop', sourceId: 'glass_desert_mirror_library_master', sourceName: 'Mirror Library Master Vault', region: 'glass_desert', details: 'Master vault jewel. Thieving 95+ ultra-rare. Crafts into lens-true ring (+3 magic, +3 prayer).', obscure: true });

// Glass-Glade Fletching — fletching
rel.registerItemSource(98530, { type: 'processing', sourceId: 'glass_desert_glass_glade', sourceName: 'Glass-Glade Fletch-Bench', region: 'glass_desert', details: 'Crystal arrow (fletched). Fletching 75+. Crystal-hunter fang + prism-pine shaft. Endgame tier.', obscure: false });
rel.registerItemSource(98531, { type: 'processing', sourceId: 'glass_desert_glass_glade', sourceName: 'Glass-Glade Fletch-Bench', region: 'glass_desert', details: 'Prism-bow. Fletching 88+. BiS ranged weapon. Lens-quartz + glass-cedar + light-bound string.', obscure: false });
rel.registerItemSource(98532, { type: 'processing', sourceId: 'glass_desert_glass_glade', sourceName: 'Glass-Glade Fletch-Bench', region: 'glass_desert', details: 'Light-bound bowstring. Fletching 80+. Refractory-fire-spun flax. Never frays.', obscure: true });

// Salt-Glass Cookery — cooking
rel.registerItemSource(98540, { type: 'processing', sourceId: 'glass_desert_salt_glass_hearth', sourceName: 'Salt-Glass Hearth', region: 'glass_desert', details: 'Crystal-cured prism-trout. Heals 25 HP. BiS Glass Desert food. Cooking 88+.', obscure: false });
rel.registerItemSource(98541, { type: 'processing', sourceId: 'glass_desert_salt_glass_hearth', sourceName: 'Salt-Glass Hearth', region: 'glass_desert', details: 'Lens-fish carpaccio. Heals 18 HP + 1 prayer. Cooking 82+. Stackable in 5s.', obscure: true });

// Dunewright Construction — construction
rel.registerItemSource(98550, { type: 'gathering', sourceId: 'glass_desert_dunewright_yard', sourceName: 'Dunewright Yard', region: 'glass_desert', details: 'Crystal-glass wall section. Construction 80+. BiS POH wall tier. Dunewright-cut.', obscure: false });
rel.registerItemSource(98551, { type: 'gathering', sourceId: 'glass_desert_dunewright_yard', sourceName: 'Dunewright Yard', region: 'glass_desert', details: 'Prism beam. Construction 85+. BiS POH support. Holds weight no wood can hold.', obscure: false });

// Lens-Glass Farming — farming
rel.registerItemSource(98560, { type: 'gathering', sourceId: 'glass_desert_lens_glass_plot', sourceName: 'Lens-Glass Plot', region: 'glass_desert', details: 'Prism-fruit. Farming 80+. BiS herblore secondary. Grows only under refracted sun.', obscure: false });
rel.registerItemSource(98561, { type: 'gathering', sourceId: 'glass_desert_light_grass_field', sourceName: 'Light-Grass Field', region: 'glass_desert', details: 'Light-grass. Farming 85+. Cooking + herblore BiS input. Photosynthesizes at night.', obscure: true });
rel.registerItemSource(98562, { type: 'gathering', sourceId: 'glass_desert_crystal_corn_row', sourceName: 'Crystal-Corn Row', region: 'glass_desert', details: 'Crystal-corn. Farming 90+. BiS cooking stock. Kernels snap like glass. Heals 20 HP raw.', obscure: false });

// The Witness Range — ranged
rel.registerItemSource(98570, { type: 'gathering', sourceId: 'glass_desert_witness_range', sourceName: 'The Witness Range', region: 'glass_desert', details: 'Prism-shot. Ranged ammo. Fletched at Glass-Glade. Chains to secondary targets.', obscure: false });
rel.registerItemSource(98571, { type: 'processing', sourceId: 'glass_desert_witness_range', sourceName: 'The Witness Range', region: 'glass_desert', details: 'Light-arrow. Ranged ammo. BiS vs corruption-tagged enemies. +20% damage to Moryskah + Inkweald bestiary.', obscure: false });

// Crystal Saw Camps — woodcutting
rel.registerItemSource(98580, { type: 'gathering', sourceId: 'glass_desert_glass_cedar_stand', sourceName: 'Glass-Cedar Stand', region: 'glass_desert', details: 'Glass-cedar logs. Woodcutting 80+. Fletching + firemaking BiS. Cut by crystal-saw only.', obscure: false });
rel.registerItemSource(98581, { type: 'gathering', sourceId: 'glass_desert_prism_pine_grove', sourceName: 'Prism-Pine Grove', region: 'glass_desert', details: 'Prism-pine logs. Woodcutting 90+. Endgame fletching stock. Rings like a bell when felled.', obscure: false });

// Quest-relevant uniques
rel.registerItemSource(98600, { type: 'quest', sourceId: 'the_edge_remembers', sourceName: 'The Edge Remembers Reward', region: 'glass_desert', details: 'Witness-ward icon. Prayer training focus. Permanent prayer bonus in Glass Desert.', obscure: false });
rel.registerItemSource(98601, { type: 'quest', sourceId: 'glass_walkers_climb', sourceName: 'Glass-Walker\'s Climb Reward', region: 'glass_desert', details: 'Glass-walker\'s sash. +4 agility in Glass Desert. Cannot be sold.', obscure: false });
rel.registerItemSource(98602, { type: 'quest', sourceId: 'the_lens_forge_quest', sourceName: 'The Lens Forge Reward', region: 'glass_desert', details: 'Lens-forge hammer. Required for crystal-cored smithing. +6% smithing XP at Lens Forge.', obscure: false });
rel.registerItemSource(98603, { type: 'quest', sourceId: 'singer_in_the_caverns', sourceName: 'Singer in the Caverns Reward', region: 'glass_desert', details: 'Singing-glass chisel. Required for crystal-rune runecrafting.', obscure: false });
rel.registerItemSource(98604, { type: 'quest', sourceId: 'what_the_dune_forgot', sourceName: 'What the Dune Forgot Reward', region: 'glass_desert', details: 'Lens-cat ally. Follows the player. +3 hunter in Glass Desert, spots traps at 3 tiles.', obscure: false });
rel.registerItemSource(98605, { type: 'quest', sourceId: 'the_mirrored_spire_quest', sourceName: 'The Mirrored Spire Reward', region: 'glass_desert', details: 'Prism-burst tome. Unlocks prism-burst BiS combat magic spell.', obscure: false });
rel.registerItemSource(98606, { type: 'quest', sourceId: 'the_last_caravan', sourceName: 'The Last Caravan Reward', region: 'glass_desert', details: 'Caravan-master token. Unlocks Glass Desert <-> Heartlands <-> Saltbrine trade route.', obscure: false });
rel.registerItemSource(98607, { type: 'quest', sourceId: 'crystal_hunters_mark', sourceName: 'Crystal Hunter\'s Mark Reward', region: 'glass_desert', details: 'Crystal-hunter\'s mark. Unlocks crystal-hunter slayer task + crystal-hunter pet route.', obscure: false });
rel.registerItemSource(98608, { type: 'quest', sourceId: 'the_witness_wall_quest', sourceName: 'The Witness Wall Reward', region: 'glass_desert', details: 'Witness-wall relic. Anti-corruption tier prayers unlocked. Stacks at Witness Wall offerings.', obscure: false });
rel.registerItemSource(98609, { type: 'quest', sourceId: 'the_dune_that_remembers', sourceName: 'The Dune That Remembers Reward', region: 'glass_desert', details: 'Memory-glass cipher. Reads old dune-script. Unlocks Dunewright master construction.', obscure: false });

// ══════════════════════════════════════════════════════════════════════════════
// GLASS DESERT TRAINING METHODS — unblock all 16 skills at endgame tier
// Every method carries all 8 Marstead knobs. Most L60+ tier.
// ══════════════════════════════════════════════════════════════════════════════

// ── STRENGTH (Edge-Keeper Trials) ──────────────────────────────────────────
rel.defineTrainingMethod('glass_desert_edge_keeper_strength', {
  skill: 'strength', name: 'Edge-Keeper Trial — Strength',
  levelRange: [70, 99],
  xpPerHour: 95000,
  prerequisites: { skills: { strength: 70, attack: 70 }, quests: ['the_edge_remembers'], items: [], areas: ['glass_desert'] },
  resourceOutput: { produces: [{ name: 'Edge-token', perHour: 28 }, { name: 'Gold coins', perHour: 55000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 8000,
  danger: 'high', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Crystal-cured prism-trout', perHour: 20, source: 'glass_desert_salt_glass_hearth' }, { name: 'Super combat ++ (crystal)', perHour: 3, source: 'glass_desert_lens_apothecary' }],
  description: 'Trial of the Edge-Keeper. Cut. Hold. Cut again. The keeper watches. The keeper does not forget. BiS endgame strength.',
  location: 'Glass Desert',
  breakpointAt: 70,
});

rel.defineTrainingMethod('glass_desert_wyrm_spawn_strength', {
  skill: 'strength', name: 'Wyrm-Spawn Cleave',
  levelRange: [60, 90],
  xpPerHour: 78000,
  prerequisites: { skills: { strength: 60 }, quests: [], items: [], areas: ['glass_desert'] },
  resourceOutput: { produces: [{ name: 'Wyrm-spawn shard', perHour: 120 }, { name: 'Gold coins', perHour: 38000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 5000,
  danger: 'high', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Crystal-cured prism-trout', perHour: 14, source: 'glass_desert_salt_glass_hearth' }],
  description: 'Cleave wyrm-spawn as they hatch from the lair-stone. They do not scream. They only shatter.',
  location: 'Glass Desert',
});

// ── DEFENCE (Edge-Keeper Trials) ───────────────────────────────────────────
rel.defineTrainingMethod('glass_desert_edge_keeper_defence', {
  skill: 'defence', name: 'Edge-Keeper Trial — Defence',
  levelRange: [70, 99],
  xpPerHour: 92000,
  prerequisites: { skills: { defence: 70 }, quests: ['the_edge_remembers'], items: [], areas: ['glass_desert'] },
  resourceOutput: { produces: [{ name: 'Edge-token', perHour: 24 }], net: 'neutral' },
  bankingFrequency: 'rare', costPerHour: 6000,
  danger: 'high', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Crystal-cured prism-trout', perHour: 18, source: 'glass_desert_salt_glass_hearth' }],
  description: 'Brace against the Keeper\'s first strike. It is the only one that matters. Stance. Hold. Know.',
  location: 'Glass Desert',
  breakpointAt: 70,
});

rel.defineTrainingMethod('glass_desert_glass_stalker_defence', {
  skill: 'defence', name: 'Glass-Stalker Wardening',
  levelRange: [60, 85],
  xpPerHour: 70000,
  prerequisites: { skills: { defence: 60 }, quests: [], items: [], areas: ['glass_desert'] },
  resourceOutput: { produces: [{ name: 'Stalker-pane', perHour: 110 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 4000,
  danger: 'high', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Crystal-cured prism-trout', perHour: 12, source: 'glass_desert_salt_glass_hearth' }],
  description: 'Ward the unseen. Glass-stalkers do not warn. The shield hears them before the eye does.',
  location: 'Glass Desert',
});

// ── HITPOINTS (Edge-Keeper + combat drift) ─────────────────────────────────
rel.defineTrainingMethod('glass_desert_edge_keeper_hitpoints', {
  skill: 'hitpoints', name: 'Edge-Keeper Trial — Hitpoints',
  levelRange: [70, 99],
  xpPerHour: 32000,
  prerequisites: { skills: { hitpoints: 70 }, quests: ['the_edge_remembers'], items: [], areas: ['glass_desert'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'rare', costPerHour: 5000,
  danger: 'high', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Crystal-cured prism-trout', perHour: 22, source: 'glass_desert_salt_glass_hearth' }],
  description: 'Stand the trial. Take the edge. Heal. Stand again. The body learns what the mind will not say.',
  location: 'Glass Desert',
});

rel.defineTrainingMethod('glass_desert_witness_passive_hp', {
  skill: 'hitpoints', name: 'Witness Wall Endurance Vigil',
  levelRange: [60, 99],
  xpPerHour: 18000,
  prerequisites: { skills: { hitpoints: 60 }, quests: ['the_witness_wall_quest'], items: [], areas: ['glass_desert'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'low', complexity: 'trivial', attention: 'afk',
  inputs: [],
  description: 'Stand the vigil at the Witness Wall. The desert witnesses. The desert grants. AFK HP at endgame tier.',
  location: 'Glass Desert',
});

// ── RANGED (Witness Range) ──────────────────────────────────────────────────
rel.defineTrainingMethod('glass_desert_witness_range_prism', {
  skill: 'ranged', name: 'Witness Range — Prism-Shot Drill',
  levelRange: [70, 99],
  xpPerHour: 110000,
  prerequisites: { skills: { ranged: 70 }, quests: [], items: [{ name: 'Prism-bow' }], areas: ['glass_desert'] },
  resourceOutput: { produces: [{ name: 'Crystal-hunter feather', perHour: 60 }], net: 'neutral' },
  bankingFrequency: 'moderate', costPerHour: 28000,
  danger: 'medium', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Prism-shot', perHour: 2400, source: 'glass_desert_glass_glade' }, { name: 'Crystal-cured prism-trout', perHour: 12, source: 'glass_desert_salt_glass_hearth' }],
  description: 'Loose the prism-shot. It chains. Three targets, one string-pull. The desert teaches economy.',
  location: 'Glass Desert',
  breakpointAt: 70,
});

rel.defineTrainingMethod('glass_desert_witness_range_light_arrow', {
  skill: 'ranged', name: 'Witness Range — Light-Arrow Master',
  levelRange: [85, 99],
  xpPerHour: 135000,
  prerequisites: { skills: { ranged: 85 }, quests: ['the_mirrored_spire_quest'], items: [{ name: 'Prism-bow' }], areas: ['glass_desert'] },
  resourceOutput: { produces: [{ name: 'Prismstalker scale', perHour: 22 }], net: 'neutral' },
  bankingFrequency: 'moderate', costPerHour: 65000,
  danger: 'medium', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Light-arrow', perHour: 1800, source: 'glass_desert_glass_glade' }, { name: 'Divine ranged ++ (crystal)', perHour: 3, source: 'glass_desert_lens_apothecary' }],
  description: 'The arrow holds its own light. No wind. No drop. Target. Release. Witness. BiS endgame ranged.',
  location: 'Glass Desert',
  breakpointAt: 85,
});

// ── PRAYER (Witness Wall) ───────────────────────────────────────────────────
rel.defineTrainingMethod('glass_desert_witness_wall_prayer', {
  skill: 'prayer', name: 'Witness Wall Light-Warding',
  levelRange: [60, 99],
  xpPerHour: 165000,
  prerequisites: { skills: { prayer: 60 }, quests: ['the_witness_wall_quest'], items: [], areas: ['glass_desert'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'frequent', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Light-ward sigil', perHour: 360, source: 'glass_desert_witness_wall' }, { name: 'Bones (any)', perHour: 300, source: 'any_bones' }],
  description: 'Carve the sigil. Offer it at the Wall. The Wall does not answer. It witnesses. 3.5x prayer per sigil. Flagship endgame prayer.',
  location: 'Glass Desert',
  breakpointAt: 60,
});

rel.defineTrainingMethod('glass_desert_edge_keeper_prayer', {
  skill: 'prayer', name: 'Edge-Keeper Relic Offering',
  levelRange: [80, 99],
  xpPerHour: 210000,
  prerequisites: { skills: { prayer: 80 }, quests: ['the_edge_remembers'], items: [], areas: ['glass_desert'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'complex', attention: 'medium',
  inputs: [{ name: 'Edge-keeper relic', perHour: 80, source: 'glass_desert_edge_keeper' }, { name: 'Dragon bones', perHour: 200, source: 'any_dragon_bones' }],
  description: 'Offer edge-keeper relic with dragon bone. The edge is held. The edge is held. BiS endgame prayer rate.',
  location: 'Glass Desert',
  breakpointAt: 80,
});

// ── MAGIC (Mirrored Spire) ──────────────────────────────────────────────────
rel.defineTrainingMethod('glass_desert_mirrored_spire_magic', {
  skill: 'magic', name: 'Mirrored Spire — Crystal-Tier Spellcasting',
  levelRange: [75, 99],
  xpPerHour: 120000,
  prerequisites: { skills: { magic: 75, runecrafting: 60 }, quests: ['the_mirrored_spire_quest'], items: [], areas: ['glass_desert'] },
  resourceOutput: { produces: [{ name: 'Prism-burst charge', perHour: 80 }], net: 'neutral' },
  bankingFrequency: 'moderate', costPerHour: 38000,
  danger: 'low', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Crystal-rune', perHour: 900, source: 'glass_desert_singing_glass_bed' }, { name: 'Lens-quartz', perHour: 200, source: 'glass_desert_lens_quartz_face' }],
  description: 'Crystal-tier spellcasting at the Mirrored Spire. The spire reflects. The spell returns. Cast. Return. Cast.',
  location: 'Glass Desert',
  breakpointAt: 75,
});

rel.defineTrainingMethod('glass_desert_prism_burst_magic', {
  skill: 'magic', name: 'Prism-Burst Combat Cycle',
  levelRange: [90, 99],
  xpPerHour: 155000,
  prerequisites: { skills: { magic: 90 }, quests: ['the_mirrored_spire_quest'], items: [{ name: 'Prism-burst tome' }], areas: ['glass_desert'] },
  resourceOutput: { produces: [{ name: 'Light-binding focus', perHour: 32 }, { name: 'Gold coins', perHour: 180000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 95000,
  danger: 'medium', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Light-rune', perHour: 600, source: 'glass_desert_light_rune_stack' }, { name: 'Prism elixir', perHour: 3, source: 'glass_desert_lens_apothecary' }],
  description: 'Burst. Refract. Burst. The chain completes. BiS endgame combat magic. The Spire remembers the pattern.',
  location: 'Glass Desert',
  breakpointAt: 90,
});

// ── RUNECRAFTING (Singing Glass Caverns) ───────────────────────────────────
rel.defineTrainingMethod('glass_desert_crystal_rune_rc', {
  skill: 'runecrafting', name: 'Singing Glass Crystal-Rune Crafting',
  levelRange: [85, 99],
  xpPerHour: 72000,
  prerequisites: { skills: { runecrafting: 85 }, quests: ['singer_in_the_caverns'], items: [{ name: 'Singing-glass chisel' }], areas: ['glass_desert'] },
  resourceOutput: { produces: [{ name: 'Crystal-rune', perHour: 1900 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'complex', attention: 'medium',
  inputs: [{ name: 'Crystal-rune essence', perHour: 1900, source: 'glass_desert_singing_glass_bed' }],
  description: 'Carve the singing glass. Each rune carries its own note. Endgame rune tier. BiS for crystal spellcasting.',
  location: 'Glass Desert',
  breakpointAt: 85,
});

rel.defineTrainingMethod('glass_desert_light_rune_rc', {
  skill: 'runecrafting', name: 'Light-Rune Binding',
  levelRange: [92, 99],
  xpPerHour: 88000,
  prerequisites: { skills: { runecrafting: 92 }, quests: ['singer_in_the_caverns'], items: [{ name: 'Singing-glass chisel' }], areas: ['glass_desert'] },
  resourceOutput: { produces: [{ name: 'Light-rune', perHour: 1200 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Lens-quartz', perHour: 300, source: 'glass_desert_lens_quartz_face' }, { name: 'Salt-singer throat-stone', perHour: 60, source: 'glass_desert_salt_singer' }],
  description: 'Bind light. The only rune that burns instead of breaks. BiS for endgame combat magic.',
  location: 'Glass Desert',
  breakpointAt: 92,
});

// ── CONSTRUCTION (Dunewright) ───────────────────────────────────────────────
rel.defineTrainingMethod('glass_desert_dunewright_construction', {
  skill: 'construction', name: 'Dunewright Crystal-Glass Framing',
  levelRange: [70, 99],
  xpPerHour: 410000,
  prerequisites: { skills: { construction: 70 }, quests: [], items: [], areas: ['glass_desert'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'moderate', costPerHour: 320000,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Crystal-glass wall section', perHour: 280, source: 'glass_desert_dunewright_yard' }, { name: 'Gold coins', perHour: 320000, source: 'gold' }],
  description: 'Frame crystal-glass walls at the Dunewright yard. Highest construction XP/hr in Aelgard. Costly.',
  location: 'Glass Desert',
  breakpointAt: 70,
});

rel.defineTrainingMethod('glass_desert_dunewright_master', {
  skill: 'construction', name: 'Dunewright Master — Prism Beam Assembly',
  levelRange: [85, 99],
  xpPerHour: 540000,
  prerequisites: { skills: { construction: 85 }, quests: ['the_dune_that_remembers'], items: [], areas: ['glass_desert'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'moderate', costPerHour: 480000,
  danger: 'none', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Prism beam', perHour: 180, source: 'glass_desert_dunewright_yard' }, { name: 'Memory-glass', perHour: 40, source: 'glass_desert_memory_glass' }],
  description: 'Prism beams hold what wood cannot. BiS construction. The house remembers its own shape.',
  location: 'Glass Desert',
  breakpointAt: 85,
});

// ── AGILITY (Glass-Walker Climbs) ───────────────────────────────────────────
rel.defineTrainingMethod('glass_desert_mirrored_spire_climb', {
  skill: 'agility', name: 'Glass-Walker Mirrored Spire Climb',
  levelRange: [75, 99],
  xpPerHour: 92000,
  prerequisites: { skills: { agility: 75 }, quests: ['glass_walkers_climb'], items: [], areas: ['glass_desert'] },
  resourceOutput: { produces: [{ name: 'Marks of grace (crystal)', perHour: 42 }], net: 'profit' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'high', complexity: 'complex', attention: 'high',
  inputs: [],
  description: 'Climb the Mirrored Spire. The spire holds the climber. The spire does not forgive a slip. BiS endgame agility.',
  location: 'Glass Desert',
  breakpointAt: 75,
});

rel.defineTrainingMethod('glass_desert_glass_bridge_run', {
  skill: 'agility', name: 'Glass-Bridge Endurance Run',
  levelRange: [85, 99],
  xpPerHour: 108000,
  prerequisites: { skills: { agility: 85 }, quests: ['glass_walkers_climb'], items: [], areas: ['glass_desert'] },
  resourceOutput: { produces: [{ name: 'Marks of grace (crystal)', perHour: 52 }, { name: 'Lens-walker seal', perHour: 2 }], net: 'profit' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'high', complexity: 'complex', attention: 'high',
  inputs: [],
  description: 'Run the glass bridges between lens-quartz spires. They ring when you land. They break if you hesitate.',
  location: 'Glass Desert',
  breakpointAt: 85,
});

// ── HERBLORE (Lens Apothecary) ──────────────────────────────────────────────
rel.defineTrainingMethod('glass_desert_lens_apothecary_super', {
  skill: 'herblore', name: 'Lens Apothecary — Super Combat ++',
  levelRange: [85, 99],
  xpPerHour: 200000,
  prerequisites: { skills: { herblore: 85 }, quests: [], items: [], areas: ['glass_desert'] },
  resourceOutput: { produces: [{ name: 'Super combat ++ (crystal)', perHour: 180 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 45000,
  danger: 'none', complexity: 'complex', attention: 'medium',
  inputs: [{ name: 'Prism-fruit', perHour: 180, source: 'glass_desert_lens_glass_plot' }, { name: 'Crystal-imbued ember', perHour: 180, source: 'glass_desert_refractory_fire' }, { name: 'Vial of water', perHour: 180, source: 'heartlands_apothecary' }],
  description: 'BiS combat consumable. Overwrites super combat. The Apothecary does not brew. The Apothecary distills.',
  location: 'Glass Desert',
  breakpointAt: 85,
});

rel.defineTrainingMethod('glass_desert_prism_elixir', {
  skill: 'herblore', name: 'Prism Elixir Master Distillation',
  levelRange: [92, 99],
  xpPerHour: 235000,
  prerequisites: { skills: { herblore: 92 }, quests: ['the_mirrored_spire_quest'], items: [], areas: ['glass_desert'] },
  resourceOutput: { produces: [{ name: 'Prism elixir', perHour: 140 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 88000,
  danger: 'none', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Prism-fruit', perHour: 140, source: 'glass_desert_lens_glass_plot' }, { name: 'Lens-quartz', perHour: 70, source: 'glass_desert_lens_quartz_face' }, { name: 'Light-grass', perHour: 140, source: 'glass_desert_light_grass_field' }],
  description: 'Distill the elixir through lens-quartz. +15% spell damage, 5 minutes. BiS magic consumable.',
  location: 'Glass Desert',
  breakpointAt: 92,
});

// ── THIEVING (Mirror Library) ───────────────────────────────────────────────
rel.defineTrainingMethod('glass_desert_mirror_library_thieving', {
  skill: 'thieving', name: 'Mirror Library Vault Lifting',
  levelRange: [80, 99],
  xpPerHour: 125000,
  prerequisites: { skills: { thieving: 80 }, quests: [], items: [{ name: 'Lockpick' }], areas: ['glass_desert'] },
  resourceOutput: { produces: [{ name: 'Gold coins', perHour: 220000 }, { name: 'Light-locked ledger', perHour: 14 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'medium', complexity: 'complex', attention: 'high',
  inputs: [],
  description: 'Lift from light-locked vaults. The locks are made of witness. The witness is made of light. BiS thieving.',
  location: 'Glass Desert',
  breakpointAt: 80,
});

rel.defineTrainingMethod('glass_desert_master_vault_thieving', {
  skill: 'thieving', name: 'Mirror Library Master Vault',
  levelRange: [95, 99],
  xpPerHour: 160000,
  prerequisites: { skills: { thieving: 95 }, quests: ['the_mirrored_spire_quest'], items: [{ name: 'Lockpick' }], areas: ['glass_desert'] },
  resourceOutput: { produces: [{ name: 'Gold coins', perHour: 380000 }, { name: 'Master vault jewel', perHour: 2 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'high', complexity: 'complex', attention: 'high',
  inputs: [],
  description: 'The Master Vault has never been opened twice by the same hand. The library remembers your touch.',
  location: 'Glass Desert',
  breakpointAt: 95,
});

// ── FLETCHING (Glass-Glade) ─────────────────────────────────────────────────
rel.defineTrainingMethod('glass_desert_crystal_arrow_fletching', {
  skill: 'fletching', name: 'Glass-Glade Crystal Arrow Fletching',
  levelRange: [75, 99],
  xpPerHour: 145000,
  prerequisites: { skills: { fletching: 75 }, quests: [], items: [], areas: ['glass_desert'] },
  resourceOutput: { produces: [{ name: 'Crystal arrow', perHour: 3400 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Prism-pine logs', perHour: 680, source: 'glass_desert_prism_pine_grove' }, { name: 'Crystal-hunter fang', perHour: 340, source: 'glass_desert_crystal_hunter' }],
  description: 'Shaft. Fang. Fletch. The arrow knows its target. Endgame fletching.',
  location: 'Glass Desert',
});

rel.defineTrainingMethod('glass_desert_prism_bow_fletching', {
  skill: 'fletching', name: 'Glass-Glade Prism-Bow Assembly',
  levelRange: [88, 99],
  xpPerHour: 185000,
  prerequisites: { skills: { fletching: 88 }, quests: [], items: [], areas: ['glass_desert'] },
  resourceOutput: { produces: [{ name: 'Prism-bow', perHour: 24 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Glass-cedar logs', perHour: 24, source: 'glass_desert_glass_cedar_stand' }, { name: 'Lens-quartz', perHour: 24, source: 'glass_desert_lens_quartz_face' }, { name: 'Light-bound bowstring', perHour: 24, source: 'glass_desert_glass_glade' }],
  description: 'Assemble the prism-bow. Lens, cedar, string. The bow tunes itself. BiS ranged weapon.',
  location: 'Glass Desert',
  breakpointAt: 88,
});

// ── SLAYER (Wyrm Lair) ──────────────────────────────────────────────────────
rel.defineTrainingMethod('glass_desert_crystal_hunter_slayer', {
  skill: 'slayer', name: 'Crystal Hunter Slayer Contracts',
  levelRange: [75, 99],
  xpPerHour: 85000,
  prerequisites: { skills: { slayer: 75 }, quests: ['crystal_hunters_mark'], items: [], areas: ['glass_desert'] },
  resourceOutput: { produces: [{ name: 'Gold coins', perHour: 120000 }, { name: 'Slayer points', perHour: 40 }, { name: 'Crystal-hunter fang', perHour: 40 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 18000,
  danger: 'high', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Crystal-cured prism-trout', perHour: 22, source: 'glass_desert_salt_glass_hearth' }, { name: 'Super combat ++ (crystal)', perHour: 4, source: 'glass_desert_lens_apothecary' }],
  description: 'Crystal-hunter contracts from the Edge-Keeper. Hunt what hunts. The desert remembers the hunter.',
  location: 'Glass Desert',
  breakpointAt: 75,
});

rel.defineTrainingMethod('glass_desert_wyrm_lair_slayer', {
  skill: 'slayer', name: 'Wyrm Lair Endgame Slayer',
  levelRange: [90, 99],
  xpPerHour: 115000,
  prerequisites: { skills: { slayer: 90 }, quests: ['slaying_the_crystal_wyrm', 'crystal_hunters_mark'], items: [], areas: ['glass_desert'] },
  resourceOutput: { produces: [{ name: 'Gold coins', perHour: 260000 }, { name: 'Slayer points', perHour: 70 }, { name: 'Prismstalker scale', perHour: 14 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 42000,
  danger: 'high', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Crystal-cured prism-trout', perHour: 32, source: 'glass_desert_salt_glass_hearth' }, { name: 'Super combat ++ (crystal)', perHour: 6, source: 'glass_desert_lens_apothecary' }],
  description: 'Wyrm Lair deep. The wyrm watches through the lair-stone. BiS endgame slayer rate in Aelgard.',
  location: 'Glass Desert',
  breakpointAt: 90,
});

// ── HUNTER (Salt-Glass Hunters) ─────────────────────────────────────────────
rel.defineTrainingMethod('glass_desert_crystal_hunter_falconry', {
  skill: 'hunter', name: 'Crystal Hunter Falconry',
  levelRange: [75, 99],
  xpPerHour: 118000,
  prerequisites: { skills: { hunter: 75 }, quests: ['crystal_hunters_mark'], items: [{ name: 'Falconry glove' }], areas: ['glass_desert'] },
  resourceOutput: { produces: [{ name: 'Crystal-hunter feather', perHour: 260 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'low', complexity: 'complex', attention: 'high',
  inputs: [],
  description: 'Loose the crystal-hunter from the glove. It returns with what it has seen. Endgame hunter flagship.',
  location: 'Glass Desert',
  breakpointAt: 75,
});

rel.defineTrainingMethod('glass_desert_lens_cat_trapping', {
  skill: 'hunter', name: 'Lens-Cat Trap Line',
  levelRange: [85, 99],
  xpPerHour: 142000,
  prerequisites: { skills: { hunter: 85 }, quests: ['what_the_dune_forgot'], items: [{ name: 'Box trap' }], areas: ['glass_desert'] },
  resourceOutput: { produces: [{ name: 'Lens-cat pelt', perHour: 90 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'low', complexity: 'complex', attention: 'high',
  inputs: [],
  description: 'Trap lens-cats on the dune-shadow line. They focus light. They burn what they do not see. Very rare.',
  location: 'Glass Desert',
  breakpointAt: 85,
});

rel.defineTrainingMethod('glass_desert_prismstalker_tracking', {
  skill: 'hunter', name: 'Prismstalker Tracking',
  levelRange: [90, 99],
  xpPerHour: 165000,
  prerequisites: { skills: { hunter: 90 }, quests: ['what_the_dune_forgot'], items: [], areas: ['glass_desert'] },
  resourceOutput: { produces: [{ name: 'Prismstalker scale', perHour: 72 }, { name: 'Gold coins', perHour: 220000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'medium', complexity: 'complex', attention: 'high',
  inputs: [],
  description: 'Track the prismstalker through seven colors. Each color is a tense. BiS endgame hunter.',
  location: 'Glass Desert',
  breakpointAt: 90,
});

// ── FISHING (Crystal Anglers) ───────────────────────────────────────────────
rel.defineTrainingMethod('glass_desert_lens_fish_pool', {
  skill: 'fishing', name: 'Lens-Fish Pool Angling',
  levelRange: [70, 90],
  xpPerHour: 78000,
  prerequisites: { skills: { fishing: 70 }, quests: [], items: [{ name: 'Fishing rod' }], areas: ['glass_desert'] },
  resourceOutput: { produces: [{ name: 'Raw lens-fish', perHour: 210 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'simple', attention: 'low',
  inputs: [{ name: 'Bait', perHour: 210, source: 'shop' }],
  description: 'The lens-fish holds still in the pool-water. You see its whole shape before you catch it. Steady endgame fishing.',
  location: 'Glass Desert',
});

rel.defineTrainingMethod('glass_desert_glass_eel_trench', {
  skill: 'fishing', name: 'Glass-Eel Trench Fishing',
  levelRange: [80, 95],
  xpPerHour: 95000,
  prerequisites: { skills: { fishing: 80 }, quests: [], items: [], areas: ['glass_desert'] },
  resourceOutput: { produces: [{ name: 'Raw glass-eel', perHour: 170 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'low', complexity: 'moderate', attention: 'medium',
  inputs: [],
  description: 'Hook the glass-eel. It pulls. It knows its trench. Fletching secondary from the spine.',
  location: 'Glass Desert',
});

rel.defineTrainingMethod('glass_desert_prism_trout_fall', {
  skill: 'fishing', name: 'Prism-Trout Fall Harpooning',
  levelRange: [90, 99],
  xpPerHour: 112000,
  prerequisites: { skills: { fishing: 90 }, quests: ['the_last_caravan'], items: [{ name: 'Harpoon' }], areas: ['glass_desert'] },
  resourceOutput: { produces: [{ name: 'Raw prism-trout', perHour: 140 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'low', complexity: 'moderate', attention: 'medium',
  inputs: [],
  description: 'Harpoon the prism-trout at the fall. Seven colors in its side. BiS Glass Desert fish. Heals 25 HP cooked.',
  location: 'Glass Desert',
  breakpointAt: 90,
});

// ── COOKING (Salt-Glass Cookery) ────────────────────────────────────────────
rel.defineTrainingMethod('glass_desert_salt_glass_hearth_trout', {
  skill: 'cooking', name: 'Salt-Glass Hearth — Crystal-Cured Prism-Trout',
  levelRange: [88, 99],
  xpPerHour: 285000,
  prerequisites: { skills: { cooking: 88 }, quests: [], items: [], areas: ['glass_desert'] },
  resourceOutput: { produces: [{ name: 'Crystal-cured prism-trout', perHour: 1100 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Raw prism-trout', perHour: 1100, source: 'glass_desert_prism_trout_fall' }, { name: 'Salt-crystal', perHour: 1100, source: 'boneyard_salt_crystal_bed' }],
  description: 'Cure the trout in salt-glass. Heals 25 HP. BiS food in Aelgard. No burn risk above 95.',
  location: 'Glass Desert',
  breakpointAt: 88,
});

rel.defineTrainingMethod('glass_desert_lens_fish_carpaccio', {
  skill: 'cooking', name: 'Salt-Glass Hearth — Lens-Fish Carpaccio',
  levelRange: [82, 99],
  xpPerHour: 240000,
  prerequisites: { skills: { cooking: 82 }, quests: [], items: [], areas: ['glass_desert'] },
  resourceOutput: { produces: [{ name: 'Lens-fish carpaccio', perHour: 1400 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'simple', attention: 'low',
  inputs: [{ name: 'Raw lens-fish', perHour: 1400, source: 'glass_desert_lens_fish_pool' }],
  description: 'Slice the lens-fish thin. Stack in fives. Heals 18 + 1 prayer. The carpaccio holds the desert-clear.',
  location: 'Glass Desert',
});

// ── FIREMAKING (Refractory Fires) ───────────────────────────────────────────
rel.defineTrainingMethod('glass_desert_refractory_fire_fm', {
  skill: 'firemaking', name: 'Refractory Fire Light-Binding',
  levelRange: [75, 99],
  xpPerHour: 220000,
  prerequisites: { skills: { firemaking: 75 }, quests: [], items: [{ name: 'Tinderbox' }], areas: ['glass_desert'] },
  resourceOutput: { produces: [{ name: 'Light-bound torch', perHour: 340 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'low', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Glass-cedar logs', perHour: 1600, source: 'glass_desert_glass_cedar_stand' }],
  description: 'Bind light to glass-cedar. Burns without fuel once lit. Refractory fires do not ash.',
  location: 'Glass Desert',
  breakpointAt: 75,
});

rel.defineTrainingMethod('glass_desert_crystal_imbued_fm', {
  skill: 'firemaking', name: 'Crystal-Imbued Master Burn',
  levelRange: [85, 99],
  xpPerHour: 275000,
  prerequisites: { skills: { firemaking: 85 }, quests: ['the_mirrored_spire_quest'], items: [{ name: 'Tinderbox' }], areas: ['glass_desert'] },
  resourceOutput: { produces: [{ name: 'Crystal-imbued ember', perHour: 220 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'medium', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Prism-pine logs', perHour: 1200, source: 'glass_desert_prism_pine_grove' }, { name: 'Lens-quartz', perHour: 200, source: 'glass_desert_lens_quartz_face' }],
  description: 'Imbue the burn with lens-quartz. Embers hold crystal. Herblore catalyst. BiS firemaking in Aelgard.',
  location: 'Glass Desert',
  breakpointAt: 85,
});

// ── WOODCUTTING (Crystal Saw Camps) ─────────────────────────────────────────
rel.defineTrainingMethod('glass_desert_glass_cedar_cutting', {
  skill: 'woodcutting', name: 'Glass-Cedar Stand Cutting',
  levelRange: [80, 99],
  xpPerHour: 115000,
  prerequisites: { skills: { woodcutting: 80 }, quests: [], items: [{ name: 'Crystal saw' }], areas: ['glass_desert'] },
  resourceOutput: { produces: [{ name: 'Glass-cedar logs', perHour: 420 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'simple', attention: 'low',
  inputs: [],
  description: 'Fell glass-cedar with the crystal saw. The cedar does not fall. It crystallizes down. Endgame woodcutting.',
  location: 'Glass Desert',
});

rel.defineTrainingMethod('glass_desert_prism_pine_grove', {
  skill: 'woodcutting', name: 'Prism-Pine Grove Master Cutting',
  levelRange: [90, 99],
  xpPerHour: 145000,
  prerequisites: { skills: { woodcutting: 90 }, quests: [], items: [{ name: 'Crystal saw' }], areas: ['glass_desert'] },
  resourceOutput: { produces: [{ name: 'Prism-pine logs', perHour: 320 }, { name: 'Lens-quartz chip', perHour: 60 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'low', complexity: 'moderate', attention: 'medium',
  inputs: [],
  description: 'Cut the prism-pine. It rings like a bell. Lens-quartz chips fall with the logs. BiS woodcutting.',
  location: 'Glass Desert',
  breakpointAt: 90,
});

// ── FARMING (Lens-Glass Farming) ────────────────────────────────────────────
rel.defineTrainingMethod('glass_desert_lens_glass_plot', {
  skill: 'farming', name: 'Lens-Glass Plot Rotation',
  levelRange: [80, 99],
  xpPerHour: 112000,
  prerequisites: { skills: { farming: 80 }, quests: [], items: [], areas: ['glass_desert'] },
  resourceOutput: { produces: [{ name: 'Prism-fruit', perHour: 210 }, { name: 'Light-grass', perHour: 140 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 9500,
  danger: 'none', complexity: 'moderate', attention: 'low',
  inputs: [{ name: 'Crystal-corn seed', perHour: 22, source: 'shop_or_drops' }],
  description: 'Rotate prism-fruit through light-grass through crystal-corn. Each row passes light to the next. BiS farming.',
  location: 'Glass Desert',
  breakpointAt: 80,
});

rel.defineTrainingMethod('glass_desert_crystal_corn_master_farm', {
  skill: 'farming', name: 'Crystal-Corn Master Plot',
  levelRange: [90, 99],
  xpPerHour: 165000,
  prerequisites: { skills: { farming: 90 }, quests: [], items: [], areas: ['glass_desert'] },
  resourceOutput: { produces: [{ name: 'Crystal-corn', perHour: 180 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 18000,
  danger: 'none', complexity: 'complex', attention: 'low',
  inputs: [{ name: 'Crystal-corn seed', perHour: 18, source: 'shop_or_drops' }],
  description: 'Grow crystal-corn in light-grass beds. Kernels snap like glass. BiS cooking stock.',
  location: 'Glass Desert',
});

// ── MINING (Crystal Mines deepened) ─────────────────────────────────────────
rel.defineTrainingMethod('glass_desert_prismstone_mining', {
  skill: 'mining', name: 'Prismstone Vein Mining',
  levelRange: [75, 95],
  xpPerHour: 88000,
  prerequisites: { skills: { mining: 75 }, quests: [], items: [{ name: 'Crystal pickaxe' }], areas: ['glass_desert'] },
  resourceOutput: { produces: [{ name: 'Prismstone', perHour: 260 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [],
  description: 'Strike the prismstone. It cuts seven ways. Crystal-cored armor substrate. Mid-endgame mining.',
  location: 'Glass Desert',
});

rel.defineTrainingMethod('glass_desert_lens_quartz_mining', {
  skill: 'mining', name: 'Lens-Quartz Face Mining',
  levelRange: [85, 99],
  xpPerHour: 105000,
  prerequisites: { skills: { mining: 85 }, quests: [], items: [{ name: 'Crystal pickaxe' }], areas: ['glass_desert'] },
  resourceOutput: { produces: [{ name: 'Lens-quartz', perHour: 180 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [],
  description: 'Strike the lens-quartz face. Clear through. Refractory fires + magic BiS. Higher tier than prismstone.',
  location: 'Glass Desert',
});

// ── SMITHING (Lens Forge) ───────────────────────────────────────────────────
rel.defineTrainingMethod('glass_desert_lens_forge_smelt', {
  skill: 'smithing', name: 'Lens Forge — Light-Imbued Smelting',
  levelRange: [75, 99],
  xpPerHour: 170000,
  prerequisites: { skills: { smithing: 75 }, quests: ['the_lens_forge_quest'], items: [{ name: 'Lens-forge hammer' }], areas: ['glass_desert'] },
  resourceOutput: { produces: [{ name: 'Light-imbued metal bar', perHour: 300 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 25000,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Prismstone', perHour: 300, source: 'glass_desert_prismstone_vein' }, { name: 'Edgestone', perHour: 300, source: 'glass_desert_edgestone_shaft' }, { name: 'Lens-quartz', perHour: 150, source: 'glass_desert_lens_quartz_face' }],
  description: 'Smelt the three-stone alloy at the Lens Forge. Light-imbued. BiS smithing bar in Aelgard.',
  location: 'Glass Desert',
  breakpointAt: 75,
});

rel.defineTrainingMethod('glass_desert_crystal_cored_plate', {
  skill: 'smithing', name: 'Lens Forge — Crystal-Cored Plate',
  levelRange: [85, 99],
  xpPerHour: 215000,
  prerequisites: { skills: { smithing: 85 }, quests: ['the_lens_forge_quest'], items: [{ name: 'Lens-forge hammer' }], areas: ['glass_desert'] },
  resourceOutput: { produces: [{ name: 'Crystal-cored plate', perHour: 55 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 12000,
  danger: 'none', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Light-imbued metal bar', perHour: 275, source: 'glass_desert_lens_forge' }, { name: 'Lens-quartz', perHour: 55, source: 'glass_desert_lens_quartz_face' }],
  description: 'Hammer the crystal core into the plate. Tier-5 armor. The plate does not dent. The plate remembers.',
  location: 'Glass Desert',
  breakpointAt: 85,
});

rel.defineTrainingMethod('glass_desert_prism_blade_smithing', {
  skill: 'smithing', name: 'Lens Forge — Prism-Blade Forging',
  levelRange: [92, 99],
  xpPerHour: 265000,
  prerequisites: { skills: { smithing: 92 }, quests: ['the_lens_forge_quest'], items: [{ name: 'Lens-forge hammer' }], areas: ['glass_desert'] },
  resourceOutput: { produces: [{ name: 'Prism-blade stock', perHour: 18 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 48000,
  danger: 'none', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Light-imbued metal bar', perHour: 216, source: 'glass_desert_lens_forge' }, { name: 'Edgestone', perHour: 90, source: 'glass_desert_edgestone_shaft' }, { name: 'Wyrm-spawn shard', perHour: 36, source: 'glass_desert_wyrm_spawn' }],
  description: 'Forge the prism-blade. It holds its edge on its own. BiS weapon blank in Aelgard.',
  location: 'Glass Desert',
  breakpointAt: 92,
});

// ══════════════════════════════════════════════════════════════════════════════
// GLASS DESERT QUESTS — 10 new quests with non-degenerate Metroidvania unlocks
// ══════════════════════════════════════════════════════════════════════════════

rel.defineQuestUnlock('the_edge_remembers', {
  name: 'The Edge Remembers',
  unlocks: [
    { type: 'training_method', id: 'glass_desert_edge_keeper_strength', description: 'Edge-Keeper Trial — Strength (BiS endgame strength training)' },
    { type: 'training_method', id: 'glass_desert_edge_keeper_defence', description: 'Edge-Keeper Trial — Defence' },
    { type: 'training_method', id: 'glass_desert_edge_keeper_hitpoints', description: 'Edge-Keeper Trial — Hitpoints' },
    { type: 'training_method', id: 'glass_desert_edge_keeper_prayer', description: 'Edge-Keeper relic offering — BiS prayer rate' },
    { type: 'area', id: 'glass_desert_edge_keeper_trials', description: 'Edge-Keeper Trials — BiS endgame combat training hub' },
  ],
});

rel.defineQuestUnlock('glass_walkers_climb', {
  name: "Glass-Walker's Climb",
  unlocks: [
    { type: 'training_method', id: 'glass_desert_mirrored_spire_climb', description: 'Mirrored Spire climb — BiS endgame agility' },
    { type: 'training_method', id: 'glass_desert_glass_bridge_run', description: 'Glass-bridge endurance run — 85+ agility' },
    { type: 'item_equip', id: 'glass_walkers_sash', description: "Glass-Walker's Sash — +4 agility in Glass Desert, cannot be sold" },
    { type: 'area', id: 'glass_desert_mirrored_spire_climb_area', description: 'Mirrored Spire full agility course access' },
  ],
});

rel.defineQuestUnlock('the_lens_forge_quest', {
  name: 'The Lens Forge',
  unlocks: [
    { type: 'training_method', id: 'glass_desert_lens_forge_smelt', description: 'Lens Forge light-imbued smelting' },
    { type: 'training_method', id: 'glass_desert_crystal_cored_plate', description: 'Crystal-cored plate smithing (BiS armor)' },
    { type: 'training_method', id: 'glass_desert_prism_blade_smithing', description: 'Prism-blade forging (BiS weapon)' },
    { type: 'recipe', id: 'glass_desert_crystal_armor', description: 'Crystal-armor smithing recipe — BiS late-game smithing' },
    { type: 'item_equip', id: 'lens_forge_hammer', description: 'Lens-forge hammer — required for crystal-cored smithing, +6% smithing XP at Lens Forge' },
  ],
});

rel.defineQuestUnlock('crystal_hunters_mark', {
  name: "Crystal Hunter's Mark",
  unlocks: [
    { type: 'training_method', id: 'glass_desert_crystal_hunter_slayer', description: 'Crystal-hunter slayer contracts — L75+ endgame slayer' },
    { type: 'training_method', id: 'glass_desert_crystal_hunter_falconry', description: 'Crystal-hunter falconry hunter flagship' },
    { type: 'npc', id: 'crystal_hunter_master', description: 'Crystal-Hunter Master — issues crystal-hunter contracts' },
    { type: 'item_equip', id: 'crystal_hunters_mark', description: "Crystal-Hunter's Mark — unlocks crystal-hunter pet route (1/3000 from contracts)" },
  ],
});

rel.defineQuestUnlock('singer_in_the_caverns', {
  name: 'Singer in the Caverns',
  unlocks: [
    { type: 'training_method', id: 'glass_desert_crystal_rune_rc', description: 'Singing Glass crystal-rune crafting — L85+ BiS endgame rune' },
    { type: 'training_method', id: 'glass_desert_light_rune_rc', description: 'Light-rune binding — L92+ BiS combat magic rune' },
    { type: 'spellbook', id: 'crystal_tier_spellbook', description: 'Crystal-tier spellbook — requires crystal-runes and light-runes' },
    { type: 'item_equip', id: 'singing_glass_chisel', description: 'Singing-glass chisel — required for crystal-rune crafting' },
    { type: 'area', id: 'glass_desert_singing_glass_caverns', description: 'Singing Glass Caverns full access' },
  ],
});

rel.defineQuestUnlock('what_the_dune_forgot', {
  name: 'What the Dune Forgot',
  unlocks: [
    { type: 'training_method', id: 'glass_desert_lens_cat_trapping', description: 'Lens-cat trap-line hunter method' },
    { type: 'training_method', id: 'glass_desert_prismstalker_tracking', description: 'Prismstalker tracking — L90+ BiS hunter' },
    { type: 'npc', id: 'lens_cat_ally', description: 'Lens-cat ally — follows the player, +3 hunter in Glass Desert, spots traps at 3 tiles' },
  ],
});

rel.defineQuestUnlock('the_mirrored_spire_quest', {
  name: 'The Mirrored Spire',
  unlocks: [
    { type: 'training_method', id: 'glass_desert_prism_burst_magic', description: 'Prism-burst combat cycle — L90+ BiS combat magic' },
    { type: 'training_method', id: 'glass_desert_witness_range_light_arrow', description: 'Witness Range light-arrow master — L85+ BiS ranged' },
    { type: 'training_method', id: 'glass_desert_prism_elixir', description: 'Prism elixir master distillation — L92+ BiS magic consumable' },
    { type: 'training_method', id: 'glass_desert_crystal_imbued_fm', description: 'Crystal-imbued master burn — BiS firemaking' },
    { type: 'training_method', id: 'glass_desert_master_vault_thieving', description: 'Master vault thieving — L95+' },
    { type: 'item_equip', id: 'prism_burst_tome', description: 'Prism-burst tome — unlocks prism-burst BiS combat magic spell' },
    { type: 'spellbook', id: 'prism_burst_spell', description: 'Prism-burst spell — BiS combat magic damage' },
  ],
});

rel.defineQuestUnlock('the_last_caravan', {
  name: 'The Last Caravan',
  unlocks: [
    { type: 'teleport', id: 'glass_desert_caravan_circuit', description: 'Caravan circuit — Glass Desert <-> Heartlands <-> Saltbrine teleport' },
    { type: 'training_method', id: 'glass_desert_prism_trout_fall', description: 'Prism-trout fall harpooning — L90+ BiS Glass Desert fish' },
    { type: 'shop', id: 'glass_desert_caravan_market', description: 'Caravan market — crystal-tier goods sold region-to-region at fair markup' },
    { type: 'item_equip', id: 'caravan_master_token', description: 'Caravan-master token — permanent +10% trade prices in Glass Desert' },
  ],
});

rel.defineQuestUnlock('the_witness_wall_quest', {
  name: 'The Witness Wall',
  unlocks: [
    { type: 'training_method', id: 'glass_desert_witness_wall_prayer', description: 'Witness Wall light-warding prayer — L60+ flagship prayer' },
    { type: 'training_method', id: 'glass_desert_witness_passive_hp', description: 'Witness Wall endurance vigil — AFK HP training' },
    { type: 'prayer', id: 'light_warding', description: 'Light-Warding prayer — reduces corruption damage by 20%' },
    { type: 'prayer', id: 'prism_blessing', description: 'Prism-Blessing prayer — +8% damage vs Inkweald + Moryskah bestiary (anti-corruption tier)' },
    { type: 'area', id: 'glass_desert_witness_wall_area', description: 'Witness Wall altar access + regional prayer hub' },
  ],
});

rel.defineQuestUnlock('the_dune_that_remembers', {
  name: 'The Dune That Remembers',
  unlocks: [
    { type: 'training_method', id: 'glass_desert_dunewright_master', description: 'Dunewright master prism-beam construction — BiS construction' },
    { type: 'npc', id: 'dunewright_master', description: 'Dunewright Master — issues master construction contracts' },
    { type: 'item_equip', id: 'memory_glass_cipher', description: 'Memory-glass cipher — reads old dune-script, unlocks Dunewright master contracts' },
    { type: 'recipe', id: 'glass_desert_prism_beam', description: 'Prism beam recipe — BiS POH support' },
  ],
});

// ══════════════════════════════════════════════════════════════════════════════
// GLASS DESERT BREAKPOINTS — transformative endgame moments
// ══════════════════════════════════════════════════════════════════════════════

rel.defineBreakpoint({
  type: 'skill_level', trigger: { skill: 'mining', level: 90 },
  description: 'Crystal mining cap reached. Prismstone + lens-quartz unlock the full Lens Forge chain. The desert yields its clear.',
  unlocks: [
    { type: 'training_method', id: 'glass_desert_lens_quartz_mining', description: 'Lens-quartz face mining' },
    { type: 'training_method', id: 'glass_desert_prismstone_mining', description: 'Prismstone vein mining' },
  ],
  importance: 'transformative',
});

rel.defineBreakpoint({
  type: 'skill_level', trigger: { skill: 'hunter', level: 75 },
  description: 'Crystal-hunter falconry opens. The crystal-hunter returns with what it has seen. Endgame hunter flagship.',
  unlocks: [{ type: 'training_method', id: 'glass_desert_crystal_hunter_falconry', description: 'Crystal-hunter falconry' }],
  importance: 'major',
});

rel.defineBreakpoint({
  type: 'skill_level', trigger: { skill: 'runecrafting', level: 92 },
  description: 'Light-rune binding unlocks. The only rune that burns instead of breaks. BiS for endgame combat magic.',
  unlocks: [{ type: 'training_method', id: 'glass_desert_light_rune_rc', description: 'Light-rune binding' }],
  importance: 'transformative',
});

rel.defineBreakpoint({
  type: 'skill_level', trigger: { skill: 'herblore', level: 92 },
  description: 'Prism elixir distills. +15% spell damage for five minutes. The BiS magic consumable in Aelgard.',
  unlocks: [{ type: 'training_method', id: 'glass_desert_prism_elixir', description: 'Prism elixir master distillation' }],
  importance: 'transformative',
});

rel.defineBreakpoint({
  type: 'quest_complete', trigger: { quest: 'the_edge_remembers' },
  description: 'The Edge-Keeper remembers you. BiS endgame combat training opens. Strength, defence, HP, prayer all at their peak rates.',
  unlocks: [
    { type: 'training_method', id: 'glass_desert_edge_keeper_strength', description: 'Edge-Keeper strength trial' },
    { type: 'training_method', id: 'glass_desert_edge_keeper_defence', description: 'Edge-Keeper defence trial' },
    { type: 'training_method', id: 'glass_desert_edge_keeper_hitpoints', description: 'Edge-Keeper HP trial' },
    { type: 'training_method', id: 'glass_desert_edge_keeper_prayer', description: 'Edge-Keeper prayer offering' },
  ],
  importance: 'transformative',
});

rel.defineBreakpoint({
  type: 'quest_complete', trigger: { quest: 'the_mirrored_spire_quest' },
  description: 'The Spire reflects. Prism-burst magic, light-arrow mastery, prism elixir, crystal-imbued firemaking, master vault thieving all open at once.',
  unlocks: [
    { type: 'training_method', id: 'glass_desert_prism_burst_magic', description: 'Prism-burst combat magic' },
    { type: 'training_method', id: 'glass_desert_witness_range_light_arrow', description: 'Light-arrow ranged master' },
    { type: 'training_method', id: 'glass_desert_crystal_imbued_fm', description: 'Crystal-imbued firemaking' },
    { type: 'training_method', id: 'glass_desert_master_vault_thieving', description: 'Master vault thieving' },
    { type: 'spellbook', id: 'prism_burst_spell', description: 'Prism-burst spell' },
  ],
  importance: 'transformative',
});

rel.defineBreakpoint({
  type: 'quest_complete', trigger: { quest: 'the_lens_forge_quest' },
  description: 'The Lens Forge fires. BiS smithing bar, plate, and weapon blank all open. The desert hammers its own edge.',
  unlocks: [
    { type: 'training_method', id: 'glass_desert_lens_forge_smelt', description: 'Lens Forge smelting' },
    { type: 'training_method', id: 'glass_desert_crystal_cored_plate', description: 'Crystal-cored plate smithing' },
    { type: 'training_method', id: 'glass_desert_prism_blade_smithing', description: 'Prism-blade forging' },
  ],
  importance: 'transformative',
});

// ══════════════════════════════════════════════════════════════════════════════
// GLASS DESERT RECIPES — crystal armor, crystal weapons, crystal-tier potions
// ══════════════════════════════════════════════════════════════════════════════

rel.defineCombination(98801, {
  resultName: 'Light-imbued metal bar',
  inputs: [
    { id: 98410, name: 'Prismstone', consumed: true },
    { id: 98412, name: 'Edgestone', consumed: true },
    { id: 98411, name: 'Lens-quartz', consumed: true },
  ],
  skill: 'smithing', level: 75, xp: 110, station: 'lens_forge_furnace',
  description: 'Smelt the three-stone alloy. Light-imbued. Lens Forge furnace only. BiS smithing bar.',
});

rel.defineCombination(98802, {
  resultName: 'Crystal-cored plate',
  inputs: [
    { id: 98801, name: 'Light-imbued metal bar', consumed: true },
    { id: 98801, name: 'Light-imbued metal bar', consumed: true },
    { id: 98801, name: 'Light-imbued metal bar', consumed: true },
    { id: 98801, name: 'Light-imbued metal bar', consumed: true },
    { id: 98801, name: 'Light-imbued metal bar', consumed: true },
    { id: 98411, name: 'Lens-quartz', consumed: true },
  ],
  skill: 'smithing', level: 85, xp: 340, station: 'lens_forge_anvil',
  description: 'Crystal-cored plate. Tier-5 armor. Best plate in Aelgard. Lens Forge anvil.',
});

rel.defineCombination(98803, {
  resultName: 'Prism-blade',
  inputs: [
    { id: 98801, name: 'Light-imbued metal bar', consumed: true },
    { id: 98801, name: 'Light-imbued metal bar', consumed: true },
    { id: 98801, name: 'Light-imbued metal bar', consumed: true },
    { id: 98412, name: 'Edgestone', consumed: true },
    { id: 98412, name: 'Edgestone', consumed: true },
    { id: 98401, name: 'Wyrm-spawn shard', consumed: true },
    { id: 98401, name: 'Wyrm-spawn shard', consumed: true },
  ],
  skill: 'smithing', level: 92, xp: 480, station: 'lens_forge_anvil',
  description: 'Prism-blade. BiS sword blank. Holds edge on its own. Lens Forge anvil.',
});

rel.defineCombination(98804, {
  resultName: 'Crystal-rune',
  inputs: [{ id: 98430, name: 'Crystal-rune essence', consumed: true }],
  skill: 'runecrafting', level: 85, xp: 42, station: 'singing_glass_altar',
  description: 'Carve the singing-glass into rune. BiS endgame rune tier. Singing Glass altar.',
});

rel.defineCombination(98805, {
  resultName: 'Light-rune',
  inputs: [
    { id: 98411, name: 'Lens-quartz', consumed: true },
    { id: 98405, name: 'Salt-singer throat-stone', consumed: true },
  ],
  skill: 'runecrafting', level: 92, xp: 78, station: 'singing_glass_altar',
  description: 'Bind light to lens-quartz. BiS combat magic rune. Salt-singer stone binds.',
});

rel.defineCombination(98806, {
  resultName: 'Super combat ++ (crystal)',
  inputs: [
    { id: 98560, name: 'Prism-fruit', consumed: true },
    { id: 98501, name: 'Crystal-imbued ember', consumed: true },
    { id: 90005, name: 'Vial of water', consumed: true },
  ],
  skill: 'herblore', level: 85, xp: 220,
  description: 'Crystal-tier super combat. Overwrites super combat. BiS melee consumable.',
});

rel.defineCombination(98807, {
  resultName: 'Divine ranged ++ (crystal)',
  inputs: [
    { id: 98560, name: 'Prism-fruit', consumed: true },
    { id: 98561, name: 'Light-grass', consumed: true },
    { id: 98452, name: 'Prismstalker tail-scale', consumed: true },
    { id: 90005, name: 'Vial of water', consumed: true },
  ],
  skill: 'herblore', level: 88, xp: 260,
  description: 'Crystal-tier divine ranged. BiS ranged consumable. Divine-class effect.',
});

rel.defineCombination(98808, {
  resultName: 'Prism elixir',
  inputs: [
    { id: 98560, name: 'Prism-fruit', consumed: true },
    { id: 98411, name: 'Lens-quartz', consumed: true },
    { id: 98561, name: 'Light-grass', consumed: true },
    { id: 90005, name: 'Vial of water', consumed: true },
  ],
  skill: 'herblore', level: 92, xp: 310,
  description: 'Distill through lens-quartz. +15% spell damage, 5 minutes. BiS magic consumable.',
});

rel.defineCombination(98809, {
  resultName: 'Crystal arrow',
  inputs: [
    { id: 98581, name: 'Prism-pine log', consumed: true },
    { id: 98400, name: 'Crystal-hunter fang', consumed: true },
  ],
  skill: 'fletching', level: 75, xp: 18,
  description: 'Shaft and fang. The arrow knows its target. Endgame ranged ammo.',
});

rel.defineCombination(98810, {
  resultName: 'Prism-bow',
  inputs: [
    { id: 98580, name: 'Glass-cedar log', consumed: true },
    { id: 98411, name: 'Lens-quartz', consumed: true },
    { id: 98532, name: 'Light-bound bowstring', consumed: true },
  ],
  skill: 'fletching', level: 88, xp: 240,
  description: 'Assemble the prism-bow. Tunes itself. BiS ranged weapon.',
});

rel.defineCombination(98811, {
  resultName: 'Light-bound bowstring',
  inputs: [
    { id: 90001, name: 'Flax', consumed: true },
    { id: 98500, name: 'Light-bound torch', consumed: true },
  ],
  skill: 'fletching', level: 80, xp: 42,
  description: 'Spin flax through refractory fire. Never frays. Light-bound.',
});

rel.defineCombination(98812, {
  resultName: 'Crystal-cured prism-trout',
  inputs: [
    { id: 98492, name: 'Raw prism-trout', consumed: true },
    { id: 96012, name: 'Salt-crystal', consumed: true },
  ],
  skill: 'cooking', level: 88, xp: 310, station: 'salt_glass_hearth',
  description: 'Cure the trout in salt-glass. Heals 25 HP. BiS food in Aelgard.',
});

rel.defineCombination(98813, {
  resultName: 'Lens-fish carpaccio',
  inputs: [{ id: 98490, name: 'Raw lens-fish', consumed: true }],
  skill: 'cooking', level: 82, xp: 220, station: 'salt_glass_hearth',
  description: 'Slice the lens-fish thin. Heals 18 + 1 prayer. Stackable in fives.',
});

rel.defineCombination(98814, {
  resultName: 'Prism beam',
  inputs: [
    { id: 98581, name: 'Prism-pine log', consumed: true },
    { id: 98411, name: 'Lens-quartz', consumed: true },
    { id: 98413, name: 'Memory-glass', consumed: true },
  ],
  skill: 'construction', level: 85, xp: 380, station: 'dunewright_yard',
  description: 'Assemble the prism beam. Holds weight wood cannot. BiS POH support.',
});

rel.defineCombination(98815, {
  resultName: 'Crystal-glass wall section',
  inputs: [
    { id: 98410, name: 'Prismstone', consumed: true },
    { id: 98411, name: 'Lens-quartz', consumed: true },
  ],
  skill: 'construction', level: 80, xp: 180, station: 'dunewright_yard',
  description: 'Dunewright-cut wall. BiS POH wall tier. Holds light through it.',
});

// ══════════════════════════════════════════════════════════════════════════════
// GLASS DESERT QUIRKY INTERACTIONS (trivial XP, glass-edged flavor)
// ══════════════════════════════════════════════════════════════════════════════

rel.defineTrainingMethod('quirky_glass_desert_witness_the_edge', {
  skill: 'prayer',
  name: '[Quirky] Witness the Edge',
  levelRange: [1, 99],
  xpPerHour: 2400,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['glass_desert'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'low',
  inputs: [],
  description: 'Stand at the Witness Wall. Watch the edge the wall carves in the light. Tiny prayer. The wall sees.',
  location: 'Glass Desert',
});

rel.defineTrainingMethod('quirky_glass_desert_count_the_colors', {
  skill: 'magic',
  name: '[Quirky] Count the Colors',
  levelRange: [1, 99],
  xpPerHour: 2000,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['glass_desert'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'low',
  inputs: [],
  description: 'Count the seven colors in a prismstalker track. Speak each one. The Spire listens. Tiny magic XP.',
  location: 'Glass Desert',
});

rel.defineTrainingMethod('quirky_glass_desert_polish_the_lens', {
  skill: 'crafting',
  name: '[Quirky] Polish the Mirror Lens',
  levelRange: [1, 99],
  xpPerHour: 1800,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['glass_desert'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'low',
  inputs: [],
  description: 'Polish a lens in the Mirror Library stacks. The librarian nods. Tiny crafting XP. The lens remembers clean.',
  location: 'Glass Desert',
});

rel.defineTrainingMethod('quirky_glass_desert_walk_the_edge', {
  skill: 'agility',
  name: '[Quirky] Walk the Dune-Edge',
  levelRange: [1, 99],
  xpPerHour: 2100,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['glass_desert'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'low', complexity: 'trivial', attention: 'medium',
  inputs: [],
  description: 'Walk the edge where dune meets glass. One foot on sand, one on glass. Tiny agility XP. The desert teaches balance.',
  location: 'Glass Desert',
});

rel.defineTrainingMethod('quirky_glass_desert_sing_to_the_salt', {
  skill: 'hunter',
  name: '[Quirky] Sing to the Salt-Singers',
  levelRange: [1, 99],
  xpPerHour: 1700,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['glass_desert'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'medium',
  inputs: [],
  description: 'Sing back to the salt-singers. They listen. They do not sing back. Tiny hunter XP. You learn their pitch.',
  location: 'Glass Desert',
});

console.log('[aelgard] Glass Desert Deep loaded: 40 training methods, 10 quests, 7 breakpoints, 15 recipes, 5 quirky interactions');
