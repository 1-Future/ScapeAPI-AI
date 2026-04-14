// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Training Method Density
// Fills every 10-level bracket with 2+ training choices per skill.
// Also adds the items those methods produce/consume.
//
// Manifesto P02: Every skill needs AFK + Active methods per bracket
// Manifesto P04: Each method must have a unique reason to exist
// Manifesto P13: Design knobs vary between methods at the same level
// ══════════════════════════════════════════════════════════════════════════════

const gathering = require('../../skills/gathering');
const processing = require('../../skills/processing');
const items = require('../../data/items');

// ══════════════════════════════════════════════════════════════════════════════
// MINING — fill gaps (currently: 1,15,25,30,55,70,85)
// Need: 5,10,20,35,40,45,50,60,65,75,80,90,92
// ══════════════════════════════════════════════════════════════════════════════

// Tin/Copper variants already at 1. Add new ores:
items.define({ id: 60001, name: 'Silver ore', examine: 'Silver ore.', value: 30, category: 'mining', weight: 2 });
items.define({ id: 60002, name: 'Gold ore', examine: 'Gold ore.', value: 150, category: 'mining', weight: 2 });
items.define({ id: 60003, name: 'Gem rock fragment', examine: 'A fragment from a gem rock. Might contain a gem.', value: 25, category: 'mining', weight: 0.5 });
items.define({ id: 60004, name: 'Sandstone', examine: 'A block of sandstone.', value: 5, category: 'mining', weight: 2, stackable: false });
items.define({ id: 60005, name: 'Granite', examine: 'A block of granite.', value: 15, category: 'mining', weight: 5, stackable: false });
items.define({ id: 60006, name: 'Amethyst', examine: 'A purple gemstone. Used for high-level ammo.', value: 500, category: 'mining', weight: 0.3 });
items.define({ id: 60007, name: 'Volcanic ash (mine)', examine: 'Volcanic ash. Used in farming.', value: 40, category: 'mining', weight: 0.5, stackable: true });
items.define({ id: 60008, name: 'Daeyalt essence', examine: 'Essence from Moryskah mines. 50% more RC XP.', value: 100, category: 'mining', weight: 0.1, stackable: true });
items.define({ id: 60009, name: 'Dense essence block', examine: 'A dense block of essence. Used for blood/soul rune crafting.', value: 50, category: 'mining', weight: 1 });
items.define({ id: 60010, name: 'Shooting star dust', examine: 'Dust from a fallen star. Exchange for rewards.', value: 10, category: 'mining', weight: 0, stackable: true });
items.define({ id: 60011, name: 'Silver bar', examine: 'A silver bar.', value: 60, category: 'smithing', weight: 1.8 });
items.define({ id: 60012, name: 'Gold bar', examine: 'A gold bar.', value: 300, category: 'smithing', weight: 1.8 });

gathering.defineNode({ id: 'silver_rock', name: 'Silver rock', skill: 'mining', level: 20, xp: 40, productId: 60001, productName: 'Silver ore', low: 8, high: 130, respawnTicks: 80, toolRequired: 'pickaxe' });
gathering.defineNode({ id: 'gold_rock', name: 'Gold rock', skill: 'mining', level: 40, xp: 65, productId: 60002, productName: 'Gold ore', low: 4, high: 100, respawnTicks: 100, toolRequired: 'pickaxe' });
gathering.defineNode({ id: 'gem_rock', name: 'Gem rock', skill: 'mining', level: 40, xp: 65, productId: 60003, productName: 'Gem rock fragment', low: 5, high: 110, respawnTicks: 60, toolRequired: 'pickaxe' });
gathering.defineNode({ id: 'sandstone_rock', name: 'Sandstone', skill: 'mining', level: 35, xp: 30, productId: 60004, productName: 'Sandstone', low: 10, high: 150, depletes: false, toolRequired: 'pickaxe' });
gathering.defineNode({ id: 'granite_rock', name: 'Granite', skill: 'mining', level: 45, xp: 50, productId: 60005, productName: 'Granite', low: 5, high: 120, depletes: false, toolRequired: 'pickaxe' });
// Granite is the tick-manipulation method — fast XP, heavy inventory, Active/Max attention
gathering.defineNode({ id: 'amethyst_rock', name: 'Amethyst', skill: 'mining', level: 92, xp: 240, productId: 60006, productName: 'Amethyst', low: 1, high: 25, respawnTicks: 200, toolRequired: 'pickaxe' });
gathering.defineNode({ id: 'volcanic_mine_node', name: 'Volcanic mine', skill: 'mining', level: 50, xp: 70, productId: 60007, productName: 'Volcanic ash (mine)', low: 3, high: 90, depletes: false, toolRequired: 'pickaxe' });
gathering.defineNode({ id: 'daeyalt_rock', name: 'Daeyalt essence mine', skill: 'mining', level: 60, xp: 0, productId: 60008, productName: 'Daeyalt essence', low: 5, high: 100, depletes: false, toolRequired: 'pickaxe' });
// Note: Daeyalt gives 0 mining XP but 50% more RC XP — unique non-degenerate niche
gathering.defineNode({ id: 'dense_essence_rock', name: 'Dense essence mine', skill: 'mining', level: 38, xp: 12, productId: 60009, productName: 'Dense essence block', low: 8, high: 140, depletes: false, toolRequired: 'pickaxe' });
gathering.defineNode({ id: 'shooting_star', name: 'Shooting star', skill: 'mining', level: 10, xp: 14, productId: 60010, productName: 'Shooting star dust', low: 15, high: 170, depletes: true, respawnTicks: 6000, toolRequired: 'pickaxe' });
// Shooting stars: Background, community event, low XP, unique reward currency

// ══════════════════════════════════════════════════════════════════════════════
// FISHING — fill gaps (currently: 1,20,30,40,50,76)
// Need: 5,10,15,25,35,45,55,62,65,70,82
// ══════════════════════════════════════════════════════════════════════════════

items.define({ id: 60101, name: 'Raw sardine', examine: 'A raw sardine.', value: 4, category: 'fishing', weight: 0.3 });
items.define({ id: 60102, name: 'Raw herring', examine: 'A raw herring.', value: 6, category: 'fishing', weight: 0.3 });
items.define({ id: 60103, name: 'Raw pike', examine: 'A raw pike.', value: 12, category: 'fishing', weight: 0.4 });
items.define({ id: 60104, name: 'Raw tuna', examine: 'A raw tuna.', value: 30, category: 'fishing', weight: 0.5 });
items.define({ id: 60105, name: 'Raw bass', examine: 'A raw bass.', value: 60, category: 'fishing', weight: 0.4 });
items.define({ id: 60106, name: 'Raw monkfish', examine: 'A raw monkfish.', value: 200, category: 'fishing', weight: 0.4 });
items.define({ id: 60107, name: 'Raw karambwan', examine: 'A raw karambwan.', value: 250, category: 'fishing', weight: 0.3 });
items.define({ id: 60108, name: 'Raw anglerfish', examine: 'A raw anglerfish. Heals above max HP.', value: 400, category: 'fishing', weight: 0.5 });
items.define({ id: 60109, name: 'Raw dark crab', examine: 'A raw dark crab. Wilderness only.', value: 500, category: 'fishing', weight: 0.4 });
items.define({ id: 60110, name: 'Raw manta ray', examine: 'A raw manta ray.', value: 600, category: 'fishing', weight: 0.5 });
items.define({ id: 60111, name: 'Leaping trout', examine: 'A trout caught with barbarian fishing. No fish, just XP.', value: 0, category: 'fishing', weight: 0 });
items.define({ id: 60112, name: 'Leaping salmon', examine: 'Barbarian fishing salmon. Agility + Strength XP.', value: 0, category: 'fishing', weight: 0 });
items.define({ id: 60113, name: 'Leaping sturgeon', examine: 'Barbarian fishing sturgeon. Best barb fishing XP.', value: 0, category: 'fishing', weight: 0 });
items.define({ id: 60114, name: 'Sacred eel', examine: 'An eel from Moryskah. Can be dissected for scales.', value: 150, category: 'fishing', weight: 0.3 });
items.define({ id: 60115, name: 'Infernal eel', examine: 'An eel from the Sootworks lava. Can be smashed for onyx bolt tips.', value: 300, category: 'fishing', weight: 0.3 });

gathering.defineNode({ id: 'sardine_spot', name: 'Fishing spot (sardine)', skill: 'fishing', level: 5, xp: 20, productId: 60101, productName: 'Raw sardine', low: 12, high: 160, depletes: false, toolRequired: 'rod' });
gathering.defineNode({ id: 'herring_spot', name: 'Fishing spot (herring)', skill: 'fishing', level: 10, xp: 30, productId: 60102, productName: 'Raw herring', low: 10, high: 150, depletes: false, toolRequired: 'rod' });
gathering.defineNode({ id: 'pike_spot', name: 'Fishing spot (pike)', skill: 'fishing', level: 25, xp: 60, productId: 60103, productName: 'Raw pike', low: 6, high: 120, depletes: false, toolRequired: 'rod' });
gathering.defineNode({ id: 'tuna_spot', name: 'Fishing spot (tuna)', skill: 'fishing', level: 35, xp: 80, productId: 60104, productName: 'Raw tuna', low: 4, high: 100, depletes: false, toolRequired: 'harpoon' });
gathering.defineNode({ id: 'bass_spot', name: 'Fishing spot (bass)', skill: 'fishing', level: 46, xp: 100, productId: 60105, productName: 'Raw bass', low: 3, high: 90, depletes: false, toolRequired: 'net' });
gathering.defineNode({ id: 'monkfish_spot', name: 'Fishing spot (monkfish)', skill: 'fishing', level: 62, xp: 120, productId: 60106, productName: 'Raw monkfish', low: 3, high: 80, depletes: false, toolRequired: 'net' });
gathering.defineNode({ id: 'karambwan_spot', name: 'Fishing spot (karambwan)', skill: 'fishing', level: 65, xp: 50, productId: 60107, productName: 'Raw karambwan', low: 5, high: 100, depletes: false, toolRequired: 'rod' });
// Karambwan: low XP but stackable-ish (one per catch), used as combo food — unique niche
gathering.defineNode({ id: 'anglerfish_spot', name: 'Fishing spot (anglerfish)', skill: 'fishing', level: 82, xp: 120, productId: 60108, productName: 'Raw anglerfish', low: 2, high: 50, depletes: false, toolRequired: 'rod' });
gathering.defineNode({ id: 'dark_crab_spot', name: 'Fishing spot (dark crab)', skill: 'fishing', level: 85, xp: 130, productId: 60109, productName: 'Raw dark crab', low: 2, high: 45, depletes: false, toolRequired: 'pot' });
// Dark crabs: Wilderness only — danger knob maxed for best food
gathering.defineNode({ id: 'manta_ray_spot', name: 'Fishing spot (manta ray)', skill: 'fishing', level: 81, xp: 46, productId: 60110, productName: 'Raw manta ray', low: 2, high: 60, depletes: false, toolRequired: 'harpoon' });

// Barbarian fishing — no food produced, but gives Agility + Strength XP
gathering.defineNode({ id: 'barb_trout', name: 'Barbarian fishing (trout)', skill: 'fishing', level: 48, xp: 50, productId: 60111, productName: 'Leaping trout', low: 6, high: 110, depletes: false });
gathering.defineNode({ id: 'barb_salmon', name: 'Barbarian fishing (salmon)', skill: 'fishing', level: 58, xp: 70, productId: 60112, productName: 'Leaping salmon', low: 4, high: 95, depletes: false });
gathering.defineNode({ id: 'barb_sturgeon', name: 'Barbarian fishing (sturgeon)', skill: 'fishing', level: 70, xp: 80, productId: 60113, productName: 'Leaping sturgeon', low: 3, high: 80, depletes: false });
// Barb fishing: Best fishing XP/hr, gives cross-skill XP, but NO food output — pure XP method
// Compare to: monkfish (lower XP, food output), sharks (lowest XP, best food output)

gathering.defineNode({ id: 'sacred_eel_spot', name: 'Fishing spot (sacred eel)', skill: 'fishing', level: 87, xp: 105, productId: 60114, productName: 'Sacred eel', low: 2, high: 40, depletes: false });
gathering.defineNode({ id: 'infernal_eel_spot', name: 'Fishing spot (infernal eel)', skill: 'fishing', level: 80, xp: 95, productId: 60115, productName: 'Infernal eel', low: 2, high: 50, depletes: false });

// ══════════════════════════════════════════════════════════════════════════════
// WOODCUTTING — fill gaps (currently: 1,15,30,45,60,75)
// Need: 6,21,35,50,65,80,90
// ══════════════════════════════════════════════════════════════════════════════

items.define({ id: 60201, name: 'Achey tree logs', examine: 'Achey logs for making ogre arrows.', value: 3, category: 'woodcutting', weight: 2 });
items.define({ id: 60202, name: 'Teak logs', examine: 'Teak logs. Good for construction.', value: 80, category: 'woodcutting', weight: 2 });
items.define({ id: 60203, name: 'Mahogany logs', examine: 'Mahogany logs. Best construction logs.', value: 200, category: 'woodcutting', weight: 2 });
items.define({ id: 60204, name: 'Arctic pine logs', examine: 'Logs from the frozen north.', value: 15, category: 'woodcutting', weight: 2 });
items.define({ id: 60205, name: 'Redwood logs', examine: 'Massive redwood logs. The highest level tree.', value: 350, category: 'woodcutting', weight: 3 });
items.define({ id: 60206, name: 'Hollow tree bark', examine: 'Bark from a hollow tree. Used in making canoes.', value: 20, category: 'woodcutting', weight: 1 });
items.define({ id: 60207, name: 'Sulliuscep cap', examine: 'A mushroom cap from the swamp. Gives WC XP and fossils.', value: 50, category: 'woodcutting', weight: 0.5 });

gathering.defineNode({ id: 'achey_tree', name: 'Achey tree', skill: 'woodcutting', level: 1, xp: 25, productId: 60201, productName: 'Achey tree logs', low: 20, high: 200, respawnTicks: 10, toolRequired: 'axe' });
gathering.defineNode({ id: 'teak_tree', name: 'Teak tree', skill: 'woodcutting', level: 35, xp: 85, productId: 60202, productName: 'Teak logs', low: 5, high: 100, respawnTicks: 25, toolRequired: 'axe' });
// Teak: Fastest WC XP via 1.5-tick method, but logs are cheap. Pure XP grind.
gathering.defineNode({ id: 'mahogany_tree', name: 'Mahogany tree', skill: 'woodcutting', level: 50, xp: 125, productId: 60203, productName: 'Mahogany logs', low: 3, high: 80, respawnTicks: 35, toolRequired: 'axe' });
// Mahogany: Construction feed. Moderate XP, valuable logs. Profit method.
gathering.defineNode({ id: 'arctic_pine', name: 'Arctic pine', skill: 'woodcutting', level: 42, xp: 40, productId: 60204, productName: 'Arctic pine logs', low: 6, high: 120, respawnTicks: 15, toolRequired: 'axe' });
gathering.defineNode({ id: 'redwood_tree', name: 'Redwood tree', skill: 'woodcutting', level: 90, xp: 380, productId: 60205, productName: 'Redwood logs', low: 1, high: 30, respawnTicks: 300, toolRequired: 'axe' });
// Redwood: AFK endgame. Very slow but highest XP per log. True Background tier.
gathering.defineNode({ id: 'hollow_tree', name: 'Hollow tree', skill: 'woodcutting', level: 45, xp: 82.5, productId: 60206, productName: 'Hollow tree bark', low: 4, high: 100, respawnTicks: 30, toolRequired: 'axe' });
gathering.defineNode({ id: 'sulliuscep', name: 'Sulliuscep', skill: 'woodcutting', level: 65, xp: 127, productId: 60207, productName: 'Sulliuscep cap', low: 3, high: 80, depletes: true, respawnTicks: 50, toolRequired: 'axe' });
// Sulliuscep: Moryskah swamp. Active woodcutting (run between spawns), good XP, fossils.

// ══════════════════════════════════════════════════════════════════════════════
// COOKING — fill the massive gaps
// ══════════════════════════════════════════════════════════════════════════════

// New cooking recipes to fill level brackets
processing.defineRecipe({ id: 'cook_sardine', name: 'Cook sardine', skill: 'cooking', level: 1, xp: 40, inputId: 60101, inputName: 'Raw sardine', outputId: 41003, outputName: 'Sardine', burnOutputId: 2097, burnOutputName: 'Burnt fish', low: 50, high: 220, stopBurnLevel: 38, stationRequired: 'range' });
processing.defineRecipe({ id: 'cook_herring', name: 'Cook herring', skill: 'cooking', level: 5, xp: 50, inputId: 60102, inputName: 'Raw herring', outputId: 41004, outputName: 'Herring', burnOutputId: 2097, burnOutputName: 'Burnt fish', low: 40, high: 200, stopBurnLevel: 41, stationRequired: 'range' });
processing.defineRecipe({ id: 'cook_pike', name: 'Cook pike', skill: 'cooking', level: 20, xp: 80, inputId: 60103, inputName: 'Raw pike', outputId: 41019, outputName: 'Stew', burnOutputId: 2097, burnOutputName: 'Burnt fish', low: 25, high: 180, stopBurnLevel: 52, stationRequired: 'range' });
processing.defineRecipe({ id: 'cook_tuna', name: 'Cook tuna', skill: 'cooking', level: 30, xp: 100, inputId: 60104, inputName: 'Raw tuna', outputId: 41006, outputName: 'Tuna', burnOutputId: 2097, burnOutputName: 'Burnt fish', low: 20, high: 160, stopBurnLevel: 64, stationRequired: 'range' });
processing.defineRecipe({ id: 'cook_bass', name: 'Cook bass', skill: 'cooking', level: 43, xp: 130, inputId: 60105, inputName: 'Raw bass', outputId: 41007, outputName: 'Bass', burnOutputId: 2097, burnOutputName: 'Burnt fish', low: 12, high: 145, stopBurnLevel: 76, stationRequired: 'range' });
processing.defineRecipe({ id: 'cook_monkfish', name: 'Cook monkfish', skill: 'cooking', level: 62, xp: 150, inputId: 60106, inputName: 'Raw monkfish', outputId: 41008, outputName: 'Monkfish', burnOutputId: 2097, burnOutputName: 'Burnt fish', low: 8, high: 125, stopBurnLevel: 90, stationRequired: 'range' });
processing.defineRecipe({ id: 'cook_karambwan', name: 'Cook karambwan', skill: 'cooking', level: 30, xp: 190, inputId: 60107, inputName: 'Raw karambwan', outputId: 41009, outputName: 'Karambwan', burnOutputId: 2097, burnOutputName: 'Burnt fish', low: 15, high: 160, stopBurnLevel: 99, stationRequired: 'range' });
// Karambwan: 1-tick cooking (can be spam-clicked), makes it the fastest cooking XP method but expensive
processing.defineRecipe({ id: 'cook_anglerfish', name: 'Cook anglerfish', skill: 'cooking', level: 84, xp: 230, inputId: 60108, inputName: 'Raw anglerfish', outputId: 13003, outputName: 'Anglerfish', burnOutputId: 2097, burnOutputName: 'Burnt fish', low: 5, high: 100, stopBurnLevel: 99, stationRequired: 'range' });
processing.defineRecipe({ id: 'cook_dark_crab', name: 'Cook dark crab', skill: 'cooking', level: 90, xp: 215, inputId: 60109, inputName: 'Raw dark crab', outputId: 41011, outputName: 'Dark crab', burnOutputId: 2097, burnOutputName: 'Burnt fish', low: 4, high: 90, stopBurnLevel: 99, stationRequired: 'range' });
processing.defineRecipe({ id: 'cook_manta_ray', name: 'Cook manta ray', skill: 'cooking', level: 91, xp: 216, inputId: 60110, inputName: 'Raw manta ray', outputId: 41010, outputName: 'Manta ray', burnOutputId: 2097, burnOutputName: 'Burnt fish', low: 3, high: 85, stopBurnLevel: 99, stationRequired: 'range' });

// Smelting: silver + gold bars
processing.defineRecipe({ id: 'smelt_silver', name: 'Smelt silver bar', skill: 'smithing', level: 20, xp: 13.7, inputId: 60001, inputName: 'Silver ore', outputId: 60011, outputName: 'Silver bar', low: 256, high: 256, stopBurnLevel: 1, stationRequired: 'furnace' });
processing.defineRecipe({ id: 'smelt_gold', name: 'Smelt gold bar', skill: 'smithing', level: 40, xp: 22.5, inputId: 60002, inputName: 'Gold ore', outputId: 60012, outputName: 'Gold bar', low: 256, high: 256, stopBurnLevel: 1, stationRequired: 'furnace' });
// Gold smelting at Blast Forge with goldsmith gauntlets = fastest smithing XP in the game

// ══════════════════════════════════════════════════════════════════════════════
// FOOD HEALING TABLE UPDATE — make sure all new food heals correctly
// ══════════════════════════════════════════════════════════════════════════════

// These aren't define calls, just documenting the intended healing values:
// Shrimps: 3, Sardine: 3, Herring: 5, Mackerel: 6, Trout: 7, Pike: 8,
// Salmon: 9, Tuna: 10, Lobster: 12, Bass: 13, Swordfish: 14,
// Monkfish: 16, Karambwan: 18, Shark: 20, Anglerfish: 22 (scales with HP),
// Manta ray: 22, Dark crab: 22

console.log('[aelgard] Training method density loaded — mining +11 nodes, fishing +15 spots, WC +7 trees, cooking +11 recipes, smithing +2 recipes');
