// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Glass Desert Density Pass
//
// Fleshes out cross-use web. Even with many methods, a thin item registry
// penalizes the region. This file:
//   - Registers Glass Desert-native equivalents of critical imports
//     (food, potions, bars, bones, runes) so locked endgame accounts can be
//     fully self-sufficient.
//   - Wires up item-use chains so nothing is orphaned.
//   - Adds 10+ more Glass Desert-only recipe combinations (crystal armor
//     pieces, crystal weapon variants, glass-bound goods).
//
// Glass Desert item IDs: 98900-99299 for this density pass.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const rel = require('../../data/relationships');

// ══════════════════════════════════════════════════════════════════════════════
// PRIMARY PRODUCTION ITEMS — Glass Desert-native equivalents of standard stock
// ══════════════════════════════════════════════════════════════════════════════

// Ores the Glass Desert methods reference (beyond those in glass-desert-deep)
rel.registerItemSource(98900, { type: 'gathering', sourceId: 'glass_desert_crystal_coal_seam', sourceName: 'Crystal Coal Seam', region: 'glass_desert', details: 'Crystal coal. Burns at lens-forge temperatures. Feeds Lens Forge smelting.', obscure: false });
rel.registerItemSource(98901, { type: 'gathering', sourceId: 'glass_desert_crystal_iron_face', sourceName: 'Crystal Iron Face', region: 'glass_desert', details: 'Crystal iron. Glass Desert-native iron tier. Mined after 75.', obscure: false });
rel.registerItemSource(98902, { type: 'gathering', sourceId: 'glass_desert_crystal_pure_essence', sourceName: 'Crystal Pure Essence', region: 'glass_desert', details: 'Crystal pure essence. Runecrafting substrate. Carves crystal-runes cleanly.', obscure: false });
rel.registerItemSource(98903, { type: 'gathering', sourceId: 'glass_desert_desert_gold_vein', sourceName: 'Desert Gold Vein', region: 'glass_desert', details: 'Desert gold ore. Jewelry crafting. Lens-true ring substrate.', obscure: false });
rel.registerItemSource(98904, { type: 'gathering', sourceId: 'glass_desert_sand_silver_seam', sourceName: 'Sand-Silver Seam', region: 'glass_desert', details: 'Sand-silver ore. Used in Witness Wall relic work + crystal-tier jewelry.', obscure: false });

// Bars produced at Glass Desert forges (non-BiS tier, standard kit)
rel.registerItemSource(98910, { type: 'processing', sourceId: 'glass_desert_lens_forge', sourceName: 'Lens Forge', region: 'glass_desert', details: 'Bronze bar. Lens-forge-smelted. Standard stock.', obscure: false });
rel.registerItemSource(98911, { type: 'processing', sourceId: 'glass_desert_lens_forge', sourceName: 'Lens Forge', region: 'glass_desert', details: 'Iron bar. Lens-forge-smelted.', obscure: false });
rel.registerItemSource(98912, { type: 'processing', sourceId: 'glass_desert_lens_forge', sourceName: 'Lens Forge', region: 'glass_desert', details: 'Steel bar. Lens-forge-smelted (iron + 2 crystal coal).', obscure: false });
rel.registerItemSource(98913, { type: 'processing', sourceId: 'glass_desert_lens_forge', sourceName: 'Lens Forge', region: 'glass_desert', details: 'Mithril bar. Lens-forge-smelted.', obscure: false });
rel.registerItemSource(98914, { type: 'processing', sourceId: 'glass_desert_lens_forge', sourceName: 'Lens Forge', region: 'glass_desert', details: 'Adamant bar. Lens-forge-smelted.', obscure: false });
rel.registerItemSource(98915, { type: 'processing', sourceId: 'glass_desert_lens_forge', sourceName: 'Lens Forge', region: 'glass_desert', details: 'Rune bar. Lens-forge-smelted. Tier-4 stock.', obscure: false });
rel.registerItemSource(98916, { type: 'processing', sourceId: 'glass_desert_lens_forge', sourceName: 'Lens Forge', region: 'glass_desert', details: 'Gold bar. Lens-forge-smelted. Jewelry stock.', obscure: false });
rel.registerItemSource(98917, { type: 'processing', sourceId: 'glass_desert_lens_forge', sourceName: 'Lens Forge', region: 'glass_desert', details: 'Sand-silver bar. Used in Witness Wall reliquary + anti-corruption jewelry.', obscure: false });

// Glass Desert-native herbs (beyond deep file)
rel.registerItemSource(98920, { type: 'gathering', sourceId: 'glass_desert_dune_herb_patch', sourceName: 'Dune Herb Patch', region: 'glass_desert', details: 'Sun-dried harralander. Desert-preserved. 20% XP bonus vs wet-grown.', obscure: false });
rel.registerItemSource(98921, { type: 'gathering', sourceId: 'glass_desert_prism_ranarr_patch', sourceName: 'Prism Ranarr Patch', region: 'glass_desert', details: 'Prism ranarr. Herblore prayer-potion primary, crystal-desert variant.', obscure: false });
rel.registerItemSource(98922, { type: 'gathering', sourceId: 'glass_desert_lens_snapdragon_patch', sourceName: 'Lens Snapdragon Patch', region: 'glass_desert', details: 'Lens snapdragon. Super-restore primary, Glass Desert variant.', obscure: false });
rel.registerItemSource(98923, { type: 'shop', sourceId: 'glass_desert_apothecary', sourceName: 'Glass Desert Apothecary', region: 'glass_desert', details: 'Vial of water (desert-clear). Potion base for crystal-tier brews.', obscure: false });
rel.registerItemSource(98924, { type: 'shop', sourceId: 'glass_desert_seed_keeper', sourceName: 'Lens-Glass Seed Keeper', region: 'glass_desert', details: 'Prism-fruit seed, light-grass seed, crystal-corn seed. Sold at Lens-Glass plot.', obscure: false });

// Food chain — Glass Desert-native cooked variants
rel.registerItemSource(98930, { type: 'processing', sourceId: 'glass_desert_salt_glass_hearth', sourceName: 'Salt-Glass Hearth', region: 'glass_desert', details: 'Crystal-cured prism-trout (cooked). Heals 25 HP. BiS Aelgard food.', obscure: false });
rel.registerItemSource(98931, { type: 'processing', sourceId: 'glass_desert_salt_glass_hearth', sourceName: 'Salt-Glass Hearth', region: 'glass_desert', details: 'Glass-eel jerky (cooked). Heals 20 HP. Stackable in 10s. Cooking 85+.', obscure: false });
rel.registerItemSource(98932, { type: 'processing', sourceId: 'glass_desert_salt_glass_hearth', sourceName: 'Salt-Glass Hearth', region: 'glass_desert', details: 'Crystal-corn bread (cooked). Heals 16 HP + stackable. Cooking 80+.', obscure: false });
rel.registerItemSource(98933, { type: 'processing', sourceId: 'glass_desert_salt_glass_hearth', sourceName: 'Salt-Glass Hearth', region: 'glass_desert', details: 'Lens-fish carpaccio (cooked). Heals 18 + 1 prayer. Cooking 82+.', obscure: false });

// Potions / crystal-tier brews
rel.registerItemSource(98940, { type: 'processing', sourceId: 'glass_desert_lens_apothecary', sourceName: 'Lens Apothecary', region: 'glass_desert', details: 'Crystal super-restore. Glass Desert super-restore analog. Restores prayer + stats.', obscure: false });
rel.registerItemSource(98941, { type: 'processing', sourceId: 'glass_desert_lens_apothecary', sourceName: 'Lens Apothecary', region: 'glass_desert', details: 'Crystal prayer potion. Glass Desert prayer-restore analog. Potent at Witness Wall.', obscure: false });
rel.registerItemSource(98942, { type: 'processing', sourceId: 'glass_desert_lens_apothecary', sourceName: 'Lens Apothecary', region: 'glass_desert', details: 'Anti-corruption brew. Glass Desert-unique. Reduces Moryskah/Inkweald corruption damage 40%.', obscure: true });
rel.registerItemSource(98943, { type: 'processing', sourceId: 'glass_desert_lens_apothecary', sourceName: 'Lens Apothecary', region: 'glass_desert', details: 'Stamina ++ (crystal). BiS stamina. Restores run energy 3x normal. Stackable.', obscure: false });

// Bones — Glass Desert sources
rel.registerItemSource(98950, { type: 'drop', sourceId: 'glass_desert_wyrm_lair_drops', sourceName: 'Wyrm Lair Drops', region: 'glass_desert', details: 'Wyrm-spawn bones. All Glass Desert slayer drops produce these. Pyre-grade.', obscure: false });
rel.registerItemSource(98951, { type: 'drop', sourceId: 'glass_desert_boss_edge_keeper', sourceName: 'Edge-Keeper Boss Drop', region: 'glass_desert', details: 'Edge-keeper bones. Prestige prayer offering. Witness Wall accepts them as 2x relic.', obscure: true });
rel.registerItemSource(98952, { type: 'drop', sourceId: 'glass_desert_wyrm_spawn_drop', sourceName: 'Wyrm-Spawn Drop', region: 'glass_desert', details: 'Dragon bones (crystal-ash). Wyrm-spawn drop. Standard dragon bones, crystal-tinted.', obscure: false });

// Runes — Singing Glass equivalents
rel.registerItemSource(98960, { type: 'processing', sourceId: 'glass_desert_singing_glass_altar', sourceName: 'Singing Glass Altar', region: 'glass_desert', details: 'Crystal-rune (air-equiv). Air rune equivalent in crystal-tier magic.', obscure: false });
rel.registerItemSource(98961, { type: 'processing', sourceId: 'glass_desert_singing_glass_altar', sourceName: 'Singing Glass Altar', region: 'glass_desert', details: 'Crystal-rune (water-equiv). Water rune equivalent.', obscure: false });
rel.registerItemSource(98962, { type: 'processing', sourceId: 'glass_desert_singing_glass_altar', sourceName: 'Singing Glass Altar', region: 'glass_desert', details: 'Crystal-rune (fire-equiv). Fire rune equivalent. Natural Glass Desert rune.', obscure: false });
rel.registerItemSource(98963, { type: 'processing', sourceId: 'glass_desert_singing_glass_altar', sourceName: 'Singing Glass Altar', region: 'glass_desert', details: 'Crystal-rune (death-equiv). Death rune equivalent. BiS for prism-burst.', obscure: false });
rel.registerItemSource(98964, { type: 'processing', sourceId: 'glass_desert_singing_glass_altar', sourceName: 'Singing Glass Altar', region: 'glass_desert', details: 'Crystal-rune (blood-equiv). Blood rune equivalent. BiS for endgame magic.', obscure: false });
rel.registerItemSource(98965, { type: 'processing', sourceId: 'glass_desert_singing_glass_altar', sourceName: 'Singing Glass Altar', region: 'glass_desert', details: 'Crystal-rune (soul-equiv). Soul rune equivalent.', obscure: false });

// Arrows / ammo — Glass Desert ammo stock
rel.registerItemSource(98970, { type: 'processing', sourceId: 'glass_desert_glass_glade', sourceName: 'Glass-Glade Fletch Line', region: 'glass_desert', details: 'Crystal arrows. Ranged ammo. Endgame tier.', obscure: false });
rel.registerItemSource(98971, { type: 'processing', sourceId: 'glass_desert_glass_glade', sourceName: 'Glass-Glade Fletch Line', region: 'glass_desert', details: 'Light-arrows. BiS vs corruption-tagged enemies. +20% vs Moryskah + Inkweald bestiary.', obscure: false });
rel.registerItemSource(98972, { type: 'processing', sourceId: 'glass_desert_glass_glade', sourceName: 'Glass-Glade Fletch Line', region: 'glass_desert', details: 'Prism-shot bolts. Chains between secondary targets. BiS crossbow ammo.', obscure: false });

// Gems — Glass Desert gem types
rel.registerItemSource(98980, { type: 'drop', sourceId: 'glass_desert_prism_gem_rock', sourceName: 'Prism Gem Rock', region: 'glass_desert', details: 'Uncut prism-diamond. Drops from gem-rock mining, Glass Desert variant.', obscure: false });
rel.registerItemSource(98981, { type: 'drop', sourceId: 'glass_desert_lens_gem_rock', sourceName: 'Lens Gem Rock', region: 'glass_desert', details: 'Uncut lens-onyx. BiS gem for jewelry. Drops rare from lens-quartz mining.', obscure: true });

// ══════════════════════════════════════════════════════════════════════════════
// ITEM-USE REGISTRATIONS — make the cross-web dense
// ══════════════════════════════════════════════════════════════════════════════

// Crystal coal — feeds Lens Forge
rel.registerItemUse(98900, { type: 'recipe', targetId: 98912, targetName: 'Steel bar (Lens Forge)', region: 'glass_desert', details: 'Two crystal coal + iron = steel at the Lens Forge.', obscure: false });
rel.registerItemUse(98900, { type: 'recipe', targetId: 98913, targetName: 'Mithril bar (Lens Forge)', region: 'glass_desert', details: 'Four crystal coal + mithril = bar.', obscure: false });
rel.registerItemUse(98900, { type: 'recipe', targetId: 98914, targetName: 'Adamant bar (Lens Forge)', region: 'glass_desert', details: 'Six crystal coal + adamantite = bar.', obscure: false });
rel.registerItemUse(98900, { type: 'recipe', targetId: 98915, targetName: 'Rune bar (Lens Forge)', region: 'glass_desert', details: 'Eight crystal coal + runite = bar.', obscure: false });
rel.registerItemUse(98900, { type: 'recipe', targetId: 98801, targetName: 'Light-imbued bar', region: 'glass_desert', details: 'Crystal coal fires the three-stone alloy.', obscure: false });

// Prismstone — Lens Forge + construction
rel.registerItemUse(98410, { type: 'recipe', targetId: 98801, targetName: 'Light-imbued bar', region: 'glass_desert', details: 'Prismstone is the first of three alloy stones.', obscure: false });
rel.registerItemUse(98410, { type: 'recipe', targetId: 98815, targetName: 'Crystal-glass wall section', region: 'glass_desert', details: 'Prismstone + lens-quartz = BiS POH wall.', obscure: false });

// Lens-quartz — core mid-endgame cross-use
rel.registerItemUse(98411, { type: 'recipe', targetId: 98801, targetName: 'Light-imbued bar', region: 'glass_desert', details: 'Lens-quartz is the second of three alloy stones.', obscure: false });
rel.registerItemUse(98411, { type: 'recipe', targetId: 98802, targetName: 'Crystal-cored plate', region: 'glass_desert', details: 'Lens-quartz is the plate core.', obscure: false });
rel.registerItemUse(98411, { type: 'recipe', targetId: 98805, targetName: 'Light-rune', region: 'glass_desert', details: 'Lens-quartz is the light-rune substrate.', obscure: false });
rel.registerItemUse(98411, { type: 'recipe', targetId: 98808, targetName: 'Prism elixir', region: 'glass_desert', details: 'Prism elixir is distilled through lens-quartz.', obscure: false });
rel.registerItemUse(98411, { type: 'recipe', targetId: 98810, targetName: 'Prism-bow', region: 'glass_desert', details: 'Lens-quartz is the prism-bow focus.', obscure: false });
rel.registerItemUse(98411, { type: 'recipe', targetId: 98814, targetName: 'Prism beam', region: 'glass_desert', details: 'Prism-beams contain lens-quartz cores.', obscure: false });
rel.registerItemUse(98411, { type: 'recipe', targetId: 98815, targetName: 'Crystal-glass wall section', region: 'glass_desert', details: 'Lens-quartz faces the crystal-glass wall.', obscure: false });

// Edgestone — blade-edge chain
rel.registerItemUse(98412, { type: 'recipe', targetId: 98801, targetName: 'Light-imbued bar', region: 'glass_desert', details: 'Edgestone is the third of three alloy stones.', obscure: false });
rel.registerItemUse(98412, { type: 'recipe', targetId: 98803, targetName: 'Prism-blade', region: 'glass_desert', details: 'Prism-blades require two edgestone keeling.', obscure: false });

// Memory-glass — obscure, construction-focused
rel.registerItemUse(98413, { type: 'recipe', targetId: 98814, targetName: 'Prism beam', region: 'glass_desert', details: 'Memory-glass in prism-beams lets the beam remember load distribution.', obscure: false });
rel.registerItemUse(98413, { type: 'combination', targetId: 'glass_desert_memory_cipher_read', targetName: 'Memory-glass cipher reading', region: 'glass_desert', details: 'Obscure: memory-glass reveals old dune-script. Unlocks Dunewright master contracts.', obscure: true });

// Crystal-hunter fang — fletching + slayer pet route
rel.registerItemUse(98400, { type: 'recipe', targetId: 98809, targetName: 'Crystal arrow', region: 'glass_desert', details: 'Crystal-hunter fangs tip crystal arrows.', obscure: false });
rel.registerItemUse(98400, { type: 'combination', targetId: 'glass_desert_crystal_hunter_pet_route', targetName: 'Crystal-hunter pet chance', region: 'glass_desert', details: 'Obscure: each fang collected increments pet drop roll by a hair.', obscure: true });

// Wyrm-spawn shard — slayer cross-use into smithing
rel.registerItemUse(98401, { type: 'recipe', targetId: 98803, targetName: 'Prism-blade', region: 'glass_desert', details: 'Wyrm-spawn shards carry the Wyrm\'s vibration into the blade.', obscure: false });
rel.registerItemUse(98401, { type: 'secondary', targetId: 'glass_desert_anti_wyrm_bonus', targetName: 'Anti-wyrm damage bonus', region: 'glass_desert', details: 'Weapons tempered with wyrm-spawn shards deal +8% vs wyrm-tagged.', obscure: true });

// Stalker-pane — crafting + defence bonus
rel.registerItemUse(98402, { type: 'combination', targetId: 'lens_true_armor_plates', targetName: 'Lens-true armor plates', region: 'glass_desert', details: 'Stalker-panes face lens-true plates. Invisible at rest in inventory.', obscure: false });
rel.registerItemUse(98402, { type: 'secondary', targetId: 'glass_desert_perception_bonus', targetName: 'Perception bonus', region: 'glass_desert', details: 'Obscure: stalker-pane dust in eyes reveals invisible traps for 10 minutes.', obscure: true });

// Lens-cat whisker — hunter secondary
rel.registerItemUse(98403, { type: 'secondary', targetId: 'glass_desert_prism_elixir', targetName: 'Prism elixir catalyst', region: 'glass_desert', details: 'Obscure: lens-cat whisker substitutes for lens-quartz in prism elixir at 50% material cost.', obscure: true });
rel.registerItemUse(98403, { type: 'recipe', targetId: 'lens_cat_eye_ring', targetName: 'Lens-cat eye ring', region: 'glass_desert', details: 'Crafting: whisker + gold bar = ring of lens-cat sight.', obscure: false });

// Prismstalker scale — ranged + magic
rel.registerItemUse(98404, { type: 'recipe', targetId: 98807, targetName: 'Divine ranged ++ (crystal)', region: 'glass_desert', details: 'Prismstalker tail-scales are the divine ranged brew scale-stock.', obscure: false });
rel.registerItemUse(98404, { type: 'secondary', targetId: 98441, targetName: 'Light-binding focus', region: 'glass_desert', details: 'Prismstalker scales catalyze light-binding.', obscure: false });

// Salt-singer throat-stone — runecrafting
rel.registerItemUse(98405, { type: 'recipe', targetId: 98805, targetName: 'Light-rune', region: 'glass_desert', details: 'Salt-singer stones bind light into rune.', obscure: false });
rel.registerItemUse(98405, { type: 'secondary', targetId: 'glass_desert_singing_glass_bonus', targetName: 'Singing-Glass RC bonus', region: 'glass_desert', details: 'Obscure: salt-singer stones hummed over essence = +5% RC XP for 10 carves.', obscure: true });

// Crystal-rune essence — runecrafting primary
rel.registerItemUse(98430, { type: 'recipe', targetId: 98804, targetName: 'Crystal-rune', region: 'glass_desert', details: 'Crystal-rune essence carves into all elemental crystal-tier runes.', obscure: false });
rel.registerItemUse(98430, { type: 'secondary', targetId: 'glass_desert_crystal_rc_training', targetName: 'Crystal RC training', region: 'glass_desert', details: 'Primary substrate for Singing Glass runecrafting.', obscure: false });

// Prism-fruit — herblore
rel.registerItemUse(98560, { type: 'recipe', targetId: 98806, targetName: 'Super combat ++ (crystal)', region: 'glass_desert', details: 'Prism-fruit is the primary for super combat ++.', obscure: false });
rel.registerItemUse(98560, { type: 'recipe', targetId: 98807, targetName: 'Divine ranged ++ (crystal)', region: 'glass_desert', details: 'Prism-fruit is the primary for divine ranged ++.', obscure: false });
rel.registerItemUse(98560, { type: 'recipe', targetId: 98808, targetName: 'Prism elixir', region: 'glass_desert', details: 'Prism-fruit is the primary for prism elixir.', obscure: false });

// Light-grass — herblore secondary
rel.registerItemUse(98561, { type: 'recipe', targetId: 98807, targetName: 'Divine ranged ++ (crystal)', region: 'glass_desert', details: 'Light-grass is the ranged brew secondary.', obscure: false });
rel.registerItemUse(98561, { type: 'recipe', targetId: 98808, targetName: 'Prism elixir', region: 'glass_desert', details: 'Light-grass is the prism elixir secondary.', obscure: false });
rel.registerItemUse(98561, { type: 'secondary', targetId: 'glass_desert_cooking_bonus', targetName: 'Cooking XP bonus', region: 'glass_desert', details: 'Light-grass garnish on carpaccio adds +5% cooking XP for 20 dishes.', obscure: true });

// Crystal-corn — farming + cooking
rel.registerItemUse(98562, { type: 'recipe', targetId: 'crystal_corn_bread', targetName: 'Crystal-corn bread', region: 'glass_desert', details: 'Crystal-corn grinds into flour. Bread heals 16 HP.', obscure: false });
rel.registerItemUse(98562, { type: 'secondary', targetId: 'glass_desert_raw_corn_heal', targetName: 'Raw crystal-corn heal', region: 'glass_desert', details: 'Raw crystal-corn eaten heals 20 HP. Unique to Glass Desert.', obscure: true });

// Glass-cedar logs — fletching + firemaking + construction
rel.registerItemUse(98580, { type: 'recipe', targetId: 98810, targetName: 'Prism-bow', region: 'glass_desert', details: 'Glass-cedar is the prism-bow stave.', obscure: false });
rel.registerItemUse(98580, { type: 'secondary', targetId: 'glass_desert_refractory_fire_fm', targetName: 'Refractory firemaking', region: 'glass_desert', details: 'Glass-cedar logs are light-bound torch stock.', obscure: false });
rel.registerItemUse(98580, { type: 'secondary', targetId: 'construction_crystal_glass_wall', targetName: 'Crystal-glass wall framing', region: 'glass_desert', details: 'Glass-cedar frames the wall sections.', obscure: true });

// Prism-pine logs — fletching + firemaking
rel.registerItemUse(98581, { type: 'recipe', targetId: 98809, targetName: 'Crystal arrow', region: 'glass_desert', details: 'Prism-pine is the crystal-arrow shaft.', obscure: false });
rel.registerItemUse(98581, { type: 'recipe', targetId: 98814, targetName: 'Prism beam', region: 'glass_desert', details: 'Prism-pine is the beam structure.', obscure: false });
rel.registerItemUse(98581, { type: 'secondary', targetId: 'glass_desert_crystal_imbued_fm', targetName: 'Crystal-imbued firemaking', region: 'glass_desert', details: 'Prism-pine logs are crystal-imbued ember stock.', obscure: false });

// Light-bound torch — firemaking + prayer double use
rel.registerItemUse(98500, { type: 'offering', targetId: 'glass_desert_witness_wall_prayer', targetName: 'Witness Wall prayer', region: 'glass_desert', details: 'Light-bound torches burn at the Witness Wall prayer altar.', obscure: false });
rel.registerItemUse(98500, { type: 'recipe', targetId: 98811, targetName: 'Light-bound bowstring', region: 'glass_desert', details: 'Flax spun through torch = light-bound bowstring.', obscure: false });

// Crystal-imbued ember — herblore catalyst
rel.registerItemUse(98501, { type: 'recipe', targetId: 98806, targetName: 'Super combat ++ (crystal)', region: 'glass_desert', details: 'Crystal-imbued embers catalyze super combat ++.', obscure: false });

// Witness Wall sigil — prayer flagship
rel.registerItemUse(98460, { type: 'offering', targetId: 'glass_desert_witness_wall_prayer', targetName: 'Witness Wall sermons', region: 'glass_desert', details: '3.5x prayer XP per sigil offered. Flagship endgame prayer.', obscure: false });
rel.registerItemUse(98460, { type: 'recipe', targetId: 'glass_desert_anti_corruption_amulet', targetName: 'Anti-corruption amulet', region: 'glass_desert', details: 'Sigils + sand-silver = anti-corruption amulet. Prayer bonus.', obscure: true });

// Edge-keeper relic — prayer + combat
rel.registerItemUse(98461, { type: 'offering', targetId: 'glass_desert_edge_keeper_prayer', targetName: 'Edge-Keeper relic offering', region: 'glass_desert', details: 'Best endgame prayer offering. Stacks with Witness Wall sigils.', obscure: false });
rel.registerItemUse(98461, { type: 'combination', targetId: 'glass_desert_edge_blessing', targetName: 'Edge-blessing weapon infusion', region: 'glass_desert', details: 'Obscure: edge-keeper relic held while forging gives +1 edge-stat to weapon.', obscure: true });

// Edge-tokens — trial currency
rel.registerItemUse(98470, { type: 'shop', targetId: 'glass_desert_edge_keeper_shop', targetName: 'Edge-Keeper trade post', region: 'glass_desert', details: 'Edge-tokens trade for BiS combat gear at the Keeper.', obscure: false });

// Marks of grace (crystal) — agility currency
rel.registerItemUse(98480, { type: 'shop', targetId: 'glass_desert_graceful_shop', targetName: 'Glass-Walker graceful shop', region: 'glass_desert', details: 'Crystal marks of grace trade for graceful + glass-walker\'s sash.', obscure: false });

// Lens-walker seal — agility prestige
rel.registerItemUse(98481, { type: 'recipe', targetId: 'glass_walkers_sash', targetName: 'Glass-Walker\'s Sash', region: 'glass_desert', details: 'Seals assemble into the Glass-Walker\'s Sash prestige item.', obscure: false });

// Light-locked ledger — thieving
rel.registerItemUse(98520, { type: 'shop', targetId: 'glass_desert_mirror_library_shop', targetName: 'Mirror Library trade', region: 'glass_desert', details: 'Ledgers trade for crystal-tier spellbook pages at the Librarian.', obscure: false });

// Master vault jewel — thieving prestige
rel.registerItemUse(98521, { type: 'recipe', targetId: 'lens_true_ring', targetName: 'Lens-true ring', region: 'glass_desert', details: 'Master vault jewel + gold bar = lens-true ring (+3 magic, +3 prayer).', obscure: false });

// ══════════════════════════════════════════════════════════════════════════════
// GLASS DESERT DENSITY RECIPES — 10+ more combinations
// ══════════════════════════════════════════════════════════════════════════════

rel.defineCombination(99001, {
  resultName: 'Steel bar (Lens Forge)',
  inputs: [
    { id: 98901, name: 'Crystal iron', consumed: true },
    { id: 98900, name: 'Crystal coal', consumed: true },
    { id: 98900, name: 'Crystal coal', consumed: true },
  ],
  skill: 'smithing', level: 30, xp: 17, station: 'lens_forge_furnace',
  description: 'Standard steel-tier, Lens Forge-smelted.',
});

rel.defineCombination(99002, {
  resultName: 'Mithril bar (Lens Forge)',
  inputs: [
    { id: 98902, name: 'Crystal mithril ore', consumed: true },
    { id: 98900, name: 'Crystal coal', consumed: true },
    { id: 98900, name: 'Crystal coal', consumed: true },
    { id: 98900, name: 'Crystal coal', consumed: true },
    { id: 98900, name: 'Crystal coal', consumed: true },
  ],
  skill: 'smithing', level: 50, xp: 30, station: 'lens_forge_furnace',
  description: 'Mithril-tier, Lens Forge-smelted.',
});

rel.defineCombination(99003, {
  resultName: 'Rune bar (Lens Forge)',
  inputs: [
    { id: 98915, name: 'Crystal runite ore', consumed: true },
    { id: 98900, name: 'Crystal coal', consumed: true },
    { id: 98900, name: 'Crystal coal', consumed: true },
    { id: 98900, name: 'Crystal coal', consumed: true },
    { id: 98900, name: 'Crystal coal', consumed: true },
    { id: 98900, name: 'Crystal coal', consumed: true },
    { id: 98900, name: 'Crystal coal', consumed: true },
    { id: 98900, name: 'Crystal coal', consumed: true },
  ],
  skill: 'smithing', level: 85, xp: 50, station: 'lens_forge_furnace',
  description: 'Rune-tier, Lens Forge-smelted.',
});

rel.defineCombination(99004, {
  resultName: 'Crystal-cored helm',
  inputs: [
    { id: 98801, name: 'Light-imbued metal bar', consumed: true },
    { id: 98801, name: 'Light-imbued metal bar', consumed: true },
    { id: 98411, name: 'Lens-quartz', consumed: true },
  ],
  skill: 'smithing', level: 82, xp: 180, station: 'lens_forge_anvil',
  description: 'Tier-5 helm. Lens Forge anvil. +3 prayer when paired with the plate.',
});

rel.defineCombination(99005, {
  resultName: 'Crystal-cored legs',
  inputs: [
    { id: 98801, name: 'Light-imbued metal bar', consumed: true },
    { id: 98801, name: 'Light-imbued metal bar', consumed: true },
    { id: 98801, name: 'Light-imbued metal bar', consumed: true },
    { id: 98411, name: 'Lens-quartz', consumed: true },
  ],
  skill: 'smithing', level: 84, xp: 220, station: 'lens_forge_anvil',
  description: 'Tier-5 legs. Lens Forge anvil. Pairs with the plate.',
});

rel.defineCombination(99006, {
  resultName: 'Crystal-cored boots',
  inputs: [
    { id: 98801, name: 'Light-imbued metal bar', consumed: true },
    { id: 98402, name: 'Stalker-pane', consumed: true },
  ],
  skill: 'smithing', level: 80, xp: 120, station: 'lens_forge_anvil',
  description: 'Tier-5 boots. Stalker-pane toe cap. Lens Forge anvil.',
});

rel.defineCombination(99007, {
  resultName: 'Crystal super-restore (4)',
  inputs: [
    { id: 98922, name: 'Lens snapdragon', consumed: true },
    { id: 98501, name: 'Crystal-imbued ember', consumed: true },
    { id: 98923, name: 'Vial of water (desert-clear)', consumed: true },
  ],
  skill: 'herblore', level: 78, xp: 160,
  description: 'Glass Desert super-restore analog. Prayer + stats.',
});

rel.defineCombination(99008, {
  resultName: 'Crystal prayer potion (4)',
  inputs: [
    { id: 98921, name: 'Prism ranarr', consumed: true },
    { id: 98950, name: 'Wyrm-spawn bones', consumed: true },
    { id: 98923, name: 'Vial of water (desert-clear)', consumed: true },
  ],
  skill: 'herblore', level: 68, xp: 120,
  description: 'Glass Desert prayer potion. Potent at Witness Wall altar.',
});

rel.defineCombination(99009, {
  resultName: 'Anti-corruption brew (4)',
  inputs: [
    { id: 98921, name: 'Prism ranarr', consumed: true },
    { id: 98431, name: 'Light-rune', consumed: true },
    { id: 98460, name: 'Light-ward sigil', consumed: true },
    { id: 98923, name: 'Vial of water (desert-clear)', consumed: true },
  ],
  skill: 'herblore', level: 80, xp: 195,
  description: 'Glass Desert-unique. Reduces corruption damage by 40% for 10 minutes.',
});

rel.defineCombination(99010, {
  resultName: 'Stamina ++ (crystal)',
  inputs: [
    { id: 98561, name: 'Light-grass', consumed: true },
    { id: 98920, name: 'Sun-dried harralander', consumed: true },
    { id: 98411, name: 'Lens-quartz', consumed: true },
    { id: 98923, name: 'Vial of water (desert-clear)', consumed: true },
  ],
  skill: 'herblore', level: 82, xp: 175,
  description: 'Crystal stamina. Run energy 3x normal. Stackable.',
});

rel.defineCombination(99011, {
  resultName: 'Glass-eel jerky',
  inputs: [
    { id: 98491, name: 'Raw glass-eel', consumed: true },
    { id: 96012, name: 'Salt-crystal', consumed: true },
  ],
  skill: 'cooking', level: 85, xp: 260, station: 'salt_glass_hearth',
  description: 'Jerky-cure glass-eel. Heals 20. Stackable in 10s.',
});

rel.defineCombination(99012, {
  resultName: 'Crystal-corn bread',
  inputs: [
    { id: 98562, name: 'Crystal-corn', consumed: true },
    { id: 98562, name: 'Crystal-corn', consumed: true },
  ],
  skill: 'cooking', level: 80, xp: 180, station: 'salt_glass_hearth',
  description: 'Crystal-corn bread. Heals 16 + stackable. Glass Desert field staple.',
});

rel.defineCombination(99013, {
  resultName: 'Lens-true ring',
  inputs: [
    { id: 98521, name: 'Master vault jewel', consumed: true },
    { id: 98916, name: 'Gold bar', consumed: true },
  ],
  skill: 'crafting', level: 85, xp: 120, station: 'jewelry_workbench',
  description: '+3 magic, +3 prayer. Prestige ring from Mirror Library master vault.',
});

rel.defineCombination(99014, {
  resultName: 'Anti-corruption amulet',
  inputs: [
    { id: 98460, name: 'Light-ward sigil', consumed: true },
    { id: 98460, name: 'Light-ward sigil', consumed: true },
    { id: 98917, name: 'Sand-silver bar', consumed: true },
  ],
  skill: 'crafting', level: 70, xp: 95, station: 'jewelry_workbench',
  description: 'Anti-corruption amulet. +5% prayer, -10% corruption damage received.',
});

rel.defineCombination(99015, {
  resultName: 'Crystal-hunter arrow-tip set',
  inputs: [
    { id: 98400, name: 'Crystal-hunter fang', consumed: true },
    { id: 98400, name: 'Crystal-hunter fang', consumed: true },
    { id: 98400, name: 'Crystal-hunter fang', consumed: true },
  ],
  skill: 'fletching', level: 72, xp: 45,
  description: 'Three fangs into a tip set. BiS arrowheads for crystal arrows.',
});

// ══════════════════════════════════════════════════════════════════════════════
// GLASS DESERT OBSCURE CROSS-USES (non-obvious chains)
// ══════════════════════════════════════════════════════════════════════════════

rel.registerItemUse(98401, { type: 'offering', targetId: 'wyrm_spawn_pyre', targetName: 'Wyrm-spawn pyre-bone burning', region: 'glass_desert', details: 'Obscure: wyrm-spawn shards burn at pyres for 2x prayer XP from Glass Desert bones.', obscure: true });
rel.registerItemUse(98411, { type: 'combination', targetId: 'glass_desert_enchant_lens', targetName: 'Enchanted lens focus', region: 'glass_desert', details: 'Obscure: lens-quartz polished in prayer-focus doubles magic cast damage once per 100 casts.', obscure: true });
rel.registerItemUse(98412, { type: 'combination', targetId: 'glass_desert_sharpening_ritual', targetName: 'Sharpening ritual', region: 'glass_desert', details: 'Obscure: edgestone held while chanting Witness prayers sharpens any weapon by +1 for 30 minutes.', obscure: true });
rel.registerItemUse(98450, { type: 'combination', targetId: 'glass_desert_falconry_glove_feather', targetName: 'Falconry glove enhancement', region: 'glass_desert', details: 'Obscure: crystal-hunter feathers woven into falconry glove extend range by 2 tiles.', obscure: true });
rel.registerItemUse(98500, { type: 'secondary', targetId: 'glass_desert_torch_hunter_bonus', targetName: 'Torch hunter bonus', region: 'glass_desert', details: 'Obscure: light-bound torches at hunter camps attract prismstalkers at 2x rate.', obscure: true });

// ══════════════════════════════════════════════════════════════════════════════
// GLASS DESERT EXISTING ITEM SOURCES — register for analyzer coverage
// Items defined in glass-desert.js + special-regions.js get Glass Desert-tagged
// ══════════════════════════════════════════════════════════════════════════════

rel.registerItemSource(10001, { type: 'drop', sourceId: 'glass_desert_crystal_shard_drops', sourceName: 'Glass Desert Crystal Shard Drops', region: 'glass_desert', details: 'Crystal shards drop from glass_spider, prism_wizard, glass_golem, refracted_elemental.', obscure: false });
rel.registerItemSource(10002, { type: 'drop', sourceId: 'glass_desert_prism_wizard_drops', sourceName: 'Prism Wizard Drops', region: 'glass_desert', details: 'Prism lens rare drop from prism wizards.', obscure: false });
rel.registerItemSource(10003, { type: 'drop', sourceId: 'glass_desert_glass_golem_drops', sourceName: 'Glass Golem Drops', region: 'glass_desert', details: 'Glass sand drops from glass golems. Crafting substrate.', obscure: false });
rel.registerItemSource(10004, { type: 'drop', sourceId: 'glass_desert_refracted_elemental_drops', sourceName: 'Refracted Elemental Drops', region: 'glass_desert', details: 'Refracted essence. High-tier magic rune ingredient.', obscure: false });
rel.registerItemSource(10005, { type: 'drop', sourceId: 'glass_desert_refracted_elemental_drops', sourceName: 'Refracted Elemental Drops', region: 'glass_desert', details: 'Crystal arrowheads. Stackable. Crystal-tier ranged ammo.', obscure: false });
rel.registerItemSource(10050, { type: 'drop', sourceId: 'the_glass_tyrant', sourceName: 'The Glass Tyrant', region: 'glass_desert', details: 'Glass crown. Prestige tyrant drop. Multi-style defence.', obscure: false });
rel.registerItemSource(10051, { type: 'drop', sourceId: 'the_glass_tyrant', sourceName: 'The Glass Tyrant', region: 'glass_desert', details: 'Prismatic blade. Tyrant prestige weapon. Refracts differently each swing.', obscure: false });
rel.registerItemSource(10060, { type: 'drop', sourceId: 'veldrak', sourceName: 'Veldrak the Last Dragon', region: 'glass_desert', details: 'Dragon shard. World-boss prestige. Crafting substrate.', obscure: false });
rel.registerItemSource(10061, { type: 'drop', sourceId: 'veldrak', sourceName: 'Veldrak the Last Dragon', region: 'glass_desert', details: "Veldrak's talon. Endgame weapon drop.", obscure: false });
rel.registerItemSource(10062, { type: 'drop', sourceId: 'veldrak', sourceName: 'Veldrak the Last Dragon', region: 'glass_desert', details: "Veldrak's scale mail. Endgame armor drop.", obscure: false });

console.log('[aelgard] Glass Desert Density loaded: 50+ sources registered as Glass Desert-native, 15 recipes, 40+ item uses, cross-use web densified');
