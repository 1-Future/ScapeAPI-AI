// ── Recipe System (Tier 7) ────────────────────────────────────────────────────
// Universal crafting/processing. Cooking, smithing, crafting, fletching, herblore.

const recipes = []; // { id, skill, name, inputs, outputs, level, xp, ticks, station, tool, failItem, stopBurn }

function define(r) { recipes.push(r); return r; }
function forSkill(skill) { return recipes.filter(r => r.skill === skill); }
function find(name) { return recipes.find(r => r.name.toLowerCase() === name.toLowerCase()); }
function findById(id) { return recipes.find(r => r.id === id); }

// ── Cooking recipes ───────────────────────────────────────────────────────────
define({ id: 'cook_shrimps', skill: 'cooking', name: 'Shrimps', inputs: [{ id: 220, count: 1 }], outputs: [{ id: 230, count: 1 }], level: 1, xp: 30, ticks: 4, station: 'range', failItem: 240, stopBurn: 34 });
define({ id: 'cook_chicken', skill: 'cooking', name: 'Cooked chicken', inputs: [{ id: 105, count: 1 }], outputs: [{ id: 231, count: 1 }], level: 1, xp: 30, ticks: 4, station: 'range', failItem: 241, stopBurn: 34 });
define({ id: 'cook_beef', skill: 'cooking', name: 'Cooked beef', inputs: [{ id: 103, count: 1 }], outputs: [{ id: 232, count: 1 }], level: 1, xp: 30, ticks: 4, station: 'range', failItem: 242, stopBurn: 34 });
define({ id: 'cook_trout', skill: 'cooking', name: 'Trout', inputs: [{ id: 221, count: 1 }], outputs: [{ id: 233, count: 1 }], level: 15, xp: 70, ticks: 4, station: 'range', failItem: 243, stopBurn: 50 });
define({ id: 'cook_salmon', skill: 'cooking', name: 'Salmon', inputs: [{ id: 222, count: 1 }], outputs: [{ id: 234, count: 1 }], level: 25, xp: 90, ticks: 4, station: 'range', failItem: 243, stopBurn: 58 });
define({ id: 'cook_lobster', skill: 'cooking', name: 'Lobster', inputs: [{ id: 223, count: 1 }], outputs: [{ id: 235, count: 1 }], level: 40, xp: 120, ticks: 4, station: 'range', failItem: 243, stopBurn: 74 });
define({ id: 'cook_swordfish', skill: 'cooking', name: 'Swordfish', inputs: [{ id: 224, count: 1 }], outputs: [{ id: 236, count: 1 }], level: 45, xp: 140, ticks: 4, station: 'range', failItem: 243, stopBurn: 86 });
define({ id: 'cook_shark', skill: 'cooking', name: 'Shark', inputs: [{ id: 225, count: 1 }], outputs: [{ id: 237, count: 1 }], level: 80, xp: 210, ticks: 4, station: 'range', failItem: 243, stopBurn: 99 });

// ── Smelting recipes ──────────────────────────────────────────────────────────
define({ id: 'smelt_bronze', skill: 'smithing', name: 'Bronze bar', inputs: [{ id: 210, count: 1 }, { id: 211, count: 1 }], outputs: [{ id: 250, count: 1 }], level: 1, xp: 6, ticks: 4, station: 'furnace' });
define({ id: 'smelt_iron', skill: 'smithing', name: 'Iron bar', inputs: [{ id: 212, count: 1 }], outputs: [{ id: 251, count: 1 }], level: 15, xp: 12, ticks: 4, station: 'furnace', failChance: 0.5 });
define({ id: 'smelt_steel', skill: 'smithing', name: 'Steel bar', inputs: [{ id: 212, count: 1 }, { id: 213, count: 2 }], outputs: [{ id: 252, count: 1 }], level: 30, xp: 17, ticks: 4, station: 'furnace' });
define({ id: 'smelt_gold', skill: 'smithing', name: 'Gold bar', inputs: [{ id: 214, count: 1 }], outputs: [{ id: 253, count: 1 }], level: 40, xp: 22, ticks: 4, station: 'furnace' });
define({ id: 'smelt_mithril', skill: 'smithing', name: 'Mithril bar', inputs: [{ id: 215, count: 1 }, { id: 213, count: 4 }], outputs: [{ id: 254, count: 1 }], level: 50, xp: 30, ticks: 4, station: 'furnace' });
define({ id: 'smelt_adamant', skill: 'smithing', name: 'Adamantite bar', inputs: [{ id: 216, count: 1 }, { id: 213, count: 6 }], outputs: [{ id: 255, count: 1 }], level: 70, xp: 37, ticks: 4, station: 'furnace' });
define({ id: 'smelt_rune', skill: 'smithing', name: 'Runite bar', inputs: [{ id: 217, count: 1 }, { id: 213, count: 8 }], outputs: [{ id: 256, count: 1 }], level: 85, xp: 50, ticks: 4, station: 'furnace' });

// ── Smithing (anvil) ──────────────────────────────────────────────────────────
define({ id: 'smith_bronze_dagger', skill: 'smithing', name: 'Bronze dagger', inputs: [{ id: 250, count: 1 }], outputs: [{ id: 400, count: 1 }], level: 1, xp: 12, ticks: 3, station: 'anvil', tool: 'hammer' });
define({ id: 'smith_bronze_sword', skill: 'smithing', name: 'Bronze sword', inputs: [{ id: 250, count: 1 }], outputs: [{ id: 401, count: 1 }], level: 4, xp: 12, ticks: 3, station: 'anvil', tool: 'hammer' });
define({ id: 'smith_bronze_scimitar', skill: 'smithing', name: 'Bronze scimitar', inputs: [{ id: 250, count: 2 }], outputs: [{ id: 402, count: 1 }], level: 5, xp: 25, ticks: 3, station: 'anvil', tool: 'hammer' });
define({ id: 'smith_iron_dagger', skill: 'smithing', name: 'Iron dagger', inputs: [{ id: 251, count: 1 }], outputs: [{ id: 410, count: 1 }], level: 15, xp: 25, ticks: 3, station: 'anvil', tool: 'hammer' });
define({ id: 'smith_iron_scimitar', skill: 'smithing', name: 'Iron scimitar', inputs: [{ id: 251, count: 2 }], outputs: [{ id: 412, count: 1 }], level: 20, xp: 50, ticks: 3, station: 'anvil', tool: 'hammer' });
define({ id: 'smith_steel_scimitar', skill: 'smithing', name: 'Steel scimitar', inputs: [{ id: 252, count: 2 }], outputs: [{ id: 420, count: 1 }], level: 35, xp: 75, ticks: 3, station: 'anvil', tool: 'hammer' });
define({ id: 'smith_mithril_scimitar', skill: 'smithing', name: 'Mithril scimitar', inputs: [{ id: 254, count: 2 }], outputs: [{ id: 430, count: 1 }], level: 55, xp: 100, ticks: 3, station: 'anvil', tool: 'hammer' });
define({ id: 'smith_adamant_scimitar', skill: 'smithing', name: 'Adamant scimitar', inputs: [{ id: 255, count: 2 }], outputs: [{ id: 440, count: 1 }], level: 75, xp: 125, ticks: 3, station: 'anvil', tool: 'hammer' });
define({ id: 'smith_rune_scimitar', skill: 'smithing', name: 'Rune scimitar', inputs: [{ id: 256, count: 2 }], outputs: [{ id: 450, count: 1 }], level: 90, xp: 150, ticks: 3, station: 'anvil', tool: 'hammer' });
define({ id: 'smith_bronze_arrowheads', skill: 'smithing', name: 'Bronze arrowheads', inputs: [{ id: 250, count: 1 }], outputs: [{ id: 593, count: 15 }], level: 5, xp: 12, ticks: 3, station: 'anvil', tool: 'hammer' });
define({ id: 'smith_iron_arrowheads', skill: 'smithing', name: 'Iron arrowheads', inputs: [{ id: 251, count: 1 }], outputs: [{ id: 594, count: 15 }], level: 20, xp: 25, ticks: 3, station: 'anvil', tool: 'hammer' });

// ── Crafting ──────────────────────────────────────────────────────────────────
define({ id: 'tan_cowhide', skill: 'crafting', name: 'Leather', inputs: [{ id: 102, count: 1 }], outputs: [{ id: 108, count: 1 }], level: 1, xp: 0, ticks: 2, station: 'tanner' });
define({ id: 'cut_sapphire', skill: 'crafting', name: 'Sapphire', inputs: [{ id: 260, count: 1 }], outputs: [{ id: 264, count: 1 }], level: 20, xp: 50, ticks: 3, tool: 'chisel' });
define({ id: 'cut_emerald', skill: 'crafting', name: 'Emerald', inputs: [{ id: 261, count: 1 }], outputs: [{ id: 265, count: 1 }], level: 27, xp: 67, ticks: 3, tool: 'chisel' });
define({ id: 'cut_ruby', skill: 'crafting', name: 'Ruby', inputs: [{ id: 262, count: 1 }], outputs: [{ id: 266, count: 1 }], level: 63, xp: 85, ticks: 3, tool: 'chisel' });
define({ id: 'cut_diamond', skill: 'crafting', name: 'Diamond', inputs: [{ id: 263, count: 1 }], outputs: [{ id: 267, count: 1 }], level: 43, xp: 107, ticks: 3, tool: 'chisel' });
define({ id: 'spin_flax', skill: 'crafting', name: 'Bowstring', inputs: [{ id: 581, count: 1 }], outputs: [{ id: 580, count: 1 }], level: 10, xp: 15, ticks: 3, station: 'spinning wheel' });

// ── Fletching ─────────────────────────────────────────────────────────────────
define({ id: 'fletch_arrow_shaft', skill: 'fletching', name: 'Arrow shaft', inputs: [{ id: 200, count: 1 }], outputs: [{ id: 340, count: 15 }], level: 1, xp: 5, ticks: 2, tool: 'knife' });
define({ id: 'fletch_headless', skill: 'fletching', name: 'Headless arrow', inputs: [{ id: 340, count: 15 }, { id: 104, count: 15 }], outputs: [{ id: 341, count: 15 }], level: 1, xp: 15, ticks: 2 });
define({ id: 'fletch_shortbow_u', skill: 'fletching', name: 'Shortbow (u)', inputs: [{ id: 200, count: 1 }], outputs: [{ id: 590, count: 1 }], level: 5, xp: 5, ticks: 3, tool: 'knife' });
define({ id: 'fletch_shortbow', skill: 'fletching', name: 'Shortbow', inputs: [{ id: 590, count: 1 }, { id: 580, count: 1 }], outputs: [{ id: 350, count: 1 }], level: 5, xp: 5, ticks: 2 });
define({ id: 'fletch_oak_shortbow_u', skill: 'fletching', name: 'Oak shortbow (u)', inputs: [{ id: 201, count: 1 }], outputs: [{ id: 591, count: 1 }], level: 20, xp: 16, ticks: 3, tool: 'knife' });
define({ id: 'fletch_oak_shortbow', skill: 'fletching', name: 'Oak shortbow', inputs: [{ id: 591, count: 1 }, { id: 580, count: 1 }], outputs: [{ id: 351, count: 1 }], level: 20, xp: 16, ticks: 2 });
define({ id: 'fletch_bronze_arrows', skill: 'fletching', name: 'Bronze arrows', inputs: [{ id: 341, count: 15 }, { id: 593, count: 15 }], outputs: [{ id: 342, count: 15 }], level: 1, xp: 20, ticks: 2 });
define({ id: 'fletch_iron_arrows', skill: 'fletching', name: 'Iron arrows', inputs: [{ id: 341, count: 15 }, { id: 594, count: 15 }], outputs: [{ id: 343, count: 15 }], level: 15, xp: 37, ticks: 2 });

// ── Herblore ──────────────────────────────────────────────────────────────────
define({ id: 'clean_guam', skill: 'herblore', name: 'Clean guam', inputs: [{ id: 300, count: 1 }], outputs: [{ id: 310, count: 1 }], level: 3, xp: 2, ticks: 1 });
define({ id: 'clean_marrentill', skill: 'herblore', name: 'Clean marrentill', inputs: [{ id: 301, count: 1 }], outputs: [{ id: 311, count: 1 }], level: 5, xp: 3, ticks: 1 });
define({ id: 'clean_tarromin', skill: 'herblore', name: 'Clean tarromin', inputs: [{ id: 302, count: 1 }], outputs: [{ id: 312, count: 1 }], level: 11, xp: 5, ticks: 1 });
define({ id: 'clean_harralander', skill: 'herblore', name: 'Clean harralander', inputs: [{ id: 303, count: 1 }], outputs: [{ id: 313, count: 1 }], level: 20, xp: 6, ticks: 1 });
define({ id: 'clean_ranarr', skill: 'herblore', name: 'Clean ranarr', inputs: [{ id: 304, count: 1 }], outputs: [{ id: 314, count: 1 }], level: 25, xp: 7, ticks: 1 });

define({ id: 'mix_attack', skill: 'herblore', name: 'Attack potion(4)', inputs: [{ id: 324, count: 1 }, { id: 310, count: 1 }, { id: 320, count: 1 }], outputs: [{ id: 330, count: 1 }], level: 3, xp: 25, ticks: 3 });
define({ id: 'mix_strength', skill: 'herblore', name: 'Strength potion(4)', inputs: [{ id: 324, count: 1 }, { id: 312, count: 1 }, { id: 322, count: 1 }], outputs: [{ id: 331, count: 1 }], level: 12, xp: 50, ticks: 3 });
define({ id: 'mix_defence', skill: 'herblore', name: 'Defence potion(4)', inputs: [{ id: 324, count: 1 }, { id: 314, count: 1 }, { id: 323, count: 1 }], outputs: [{ id: 332, count: 1 }], level: 30, xp: 75, ticks: 3 });
define({ id: 'mix_prayer', skill: 'herblore', name: 'Prayer potion(4)', inputs: [{ id: 324, count: 1 }, { id: 314, count: 1 }, { id: 321, count: 1 }], outputs: [{ id: 335, count: 1 }], level: 38, xp: 87, ticks: 3 });

// ── Firemaking ────────────────────────────────────────────────────────────────
define({ id: 'burn_logs', skill: 'firemaking', name: 'Burn logs', inputs: [{ id: 200, count: 1 }], outputs: [], level: 1, xp: 40, ticks: 4, tool: 'tinderbox' });
define({ id: 'burn_oak', skill: 'firemaking', name: 'Burn oak logs', inputs: [{ id: 201, count: 1 }], outputs: [], level: 15, xp: 60, ticks: 4, tool: 'tinderbox' });
define({ id: 'burn_willow', skill: 'firemaking', name: 'Burn willow logs', inputs: [{ id: 202, count: 1 }], outputs: [], level: 30, xp: 90, ticks: 4, tool: 'tinderbox' });
define({ id: 'burn_maple', skill: 'firemaking', name: 'Burn maple logs', inputs: [{ id: 203, count: 1 }], outputs: [], level: 45, xp: 135, ticks: 4, tool: 'tinderbox' });
define({ id: 'burn_yew', skill: 'firemaking', name: 'Burn yew logs', inputs: [{ id: 204, count: 1 }], outputs: [], level: 60, xp: 202, ticks: 4, tool: 'tinderbox' });
define({ id: 'burn_magic', skill: 'firemaking', name: 'Burn magic logs', inputs: [{ id: 205, count: 1 }], outputs: [], level: 75, xp: 303, ticks: 4, tool: 'tinderbox' });

module.exports = { define, forSkill, find, findById, recipes };
