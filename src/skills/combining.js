// ══════════════════════════════════════════════════════════════════════════════
// Combining Skills — Herblore, Fletching, Crafting, Prayer
//
// Unlike processing (cook/smelt), combining skills often have two inputs.
// Pattern: Primary + Secondary → Product + XP
// All recipes are registered here and exposed via commands.
// ══════════════════════════════════════════════════════════════════════════════

const { xpToLevel } = require('./gathering');

// ── Recipe Registry ────────────────────────────────────────────────────────

const recipes = new Map(); // recipeId → recipe

function define(opts) {
  recipes.set(opts.id, {
    id: opts.id,
    name: opts.name,
    skill: opts.skill,
    level: opts.level,
    xp: opts.xp,
    primaryId: opts.primaryId,
    primaryName: opts.primaryName,
    secondaryId: opts.secondaryId || null,
    secondaryName: opts.secondaryName || null,
    outputId: opts.outputId,
    outputName: opts.outputName,
    outputCount: opts.outputCount || 1,
    ticks: opts.ticks || 3,
  });
}

function getRecipe(id) { return recipes.get(id); }
function listRecipes(skill) {
  if (!skill) return [...recipes.values()];
  return [...recipes.values()].filter(r => r.skill === skill);
}

function attempt(player, recipeId) {
  const recipe = recipes.get(recipeId);
  if (!recipe) return { error: 'unknown_recipe' };

  const skillData = player.skills?.[recipe.skill];
  const level = skillData?.level || 1;
  if (level < recipe.level) return { error: 'level_too_low', required: recipe.level };

  // Find primary
  const pri = player.inventory.findIndex(s => s && s.id === recipe.primaryId);
  if (pri < 0) return { error: 'missing_primary', need: recipe.primaryName };

  // Find secondary (if needed)
  let sec = -1;
  if (recipe.secondaryId) {
    sec = player.inventory.findIndex((s, i) => s && s.id === recipe.secondaryId && i !== pri);
    if (sec < 0) return { error: 'missing_secondary', need: recipe.secondaryName };
  }

  // Consume inputs
  player.inventory[pri] = null;
  if (sec >= 0) player.inventory[sec] = null;

  // Produce output
  const freeSlot = player.inventory.findIndex(s => s === null);
  if (freeSlot >= 0) {
    player.inventory[freeSlot] = { id: recipe.outputId, name: recipe.outputName, count: recipe.outputCount };
  }

  // Grant XP
  if (!player.skills[recipe.skill]) player.skills[recipe.skill] = { level: 1, xp: 0 };
  player.skills[recipe.skill].xp += recipe.xp;
  const newLevel = xpToLevel(player.skills[recipe.skill].xp);
  if (newLevel > player.skills[recipe.skill].level) {
    player.skills[recipe.skill].level = newLevel;
  }

  return {
    success: true,
    product: { id: recipe.outputId, name: recipe.outputName, count: recipe.outputCount },
    xp: recipe.xp,
    skill: recipe.skill,
    level: player.skills[recipe.skill].level,
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// HERBLORE — Clean herbs + Mix potions
// ══════════════════════════════════════════════════════════════════════════════

// Clean herbs (grimy → clean)
define({ id: 'clean_guam', name: 'Clean Guam', skill: 'herblore', level: 3, xp: 2.5, primaryId: 12001, primaryName: 'Grimy guam', outputId: 12101, outputName: 'Guam leaf' });
define({ id: 'clean_marrentill', name: 'Clean Marrentill', skill: 'herblore', level: 5, xp: 3.8, primaryId: 12002, primaryName: 'Grimy marrentill', outputId: 12102, outputName: 'Marrentill' });
define({ id: 'clean_tarromin', name: 'Clean Tarromin', skill: 'herblore', level: 11, xp: 5, primaryId: 12003, primaryName: 'Grimy tarromin', outputId: 12103, outputName: 'Tarromin' });
define({ id: 'clean_harralander', name: 'Clean Harralander', skill: 'herblore', level: 20, xp: 6.3, primaryId: 12004, primaryName: 'Grimy harralander', outputId: 12104, outputName: 'Harralander' });
define({ id: 'clean_ranarr', name: 'Clean Ranarr', skill: 'herblore', level: 25, xp: 7.5, primaryId: 12005, primaryName: 'Grimy ranarr', outputId: 12105, outputName: 'Ranarr weed' });
define({ id: 'clean_irit', name: 'Clean Irit', skill: 'herblore', level: 40, xp: 8.8, primaryId: 12006, primaryName: 'Grimy irit', outputId: 12106, outputName: 'Irit leaf' });
define({ id: 'clean_avantoe', name: 'Clean Avantoe', skill: 'herblore', level: 48, xp: 10, primaryId: 12007, primaryName: 'Grimy avantoe', outputId: 12107, outputName: 'Avantoe' });
define({ id: 'clean_kwuarm', name: 'Clean Kwuarm', skill: 'herblore', level: 54, xp: 11.3, primaryId: 12008, primaryName: 'Grimy kwuarm', outputId: 12108, outputName: 'Kwuarm' });
define({ id: 'clean_snapdragon', name: 'Clean Snapdragon', skill: 'herblore', level: 59, xp: 11.8, primaryId: 12009, primaryName: 'Grimy snapdragon', outputId: 12109, outputName: 'Snapdragon' });
define({ id: 'clean_cadantine', name: 'Clean Cadantine', skill: 'herblore', level: 65, xp: 12.5, primaryId: 12010, primaryName: 'Grimy cadantine', outputId: 12110, outputName: 'Cadantine' });
define({ id: 'clean_lantadyme', name: 'Clean Lantadyme', skill: 'herblore', level: 67, xp: 13.1, primaryId: 12011, primaryName: 'Grimy lantadyme', outputId: 12111, outputName: 'Lantadyme' });
define({ id: 'clean_dwarf_weed', name: 'Clean Dwarf weed', skill: 'herblore', level: 70, xp: 13.8, primaryId: 12012, primaryName: 'Grimy dwarf weed', outputId: 12112, outputName: 'Dwarf weed' });
define({ id: 'clean_torstol', name: 'Clean Torstol', skill: 'herblore', level: 75, xp: 15, primaryId: 12013, primaryName: 'Grimy torstol', outputId: 12113, outputName: 'Torstol' });

// Mix potions (herb + secondary + vial = potion)
define({ id: 'mix_attack', name: 'Attack potion', skill: 'herblore', level: 3, xp: 25, primaryId: 12101, primaryName: 'Guam leaf', secondaryId: 12201, secondaryName: 'Eye of newt', outputId: 12301, outputName: 'Attack potion(4)' });
define({ id: 'mix_strength', name: 'Strength potion', skill: 'herblore', level: 12, xp: 50, primaryId: 12103, primaryName: 'Tarromin', secondaryId: 12203, secondaryName: 'Limpwurt root', outputId: 12302, outputName: 'Strength potion(4)' });
define({ id: 'mix_defence', name: 'Defence potion', skill: 'herblore', level: 30, xp: 75, primaryId: 12105, primaryName: 'Ranarr weed', secondaryId: 12205, secondaryName: 'White berries', outputId: 12303, outputName: 'Defence potion(4)' });
define({ id: 'mix_prayer', name: 'Prayer potion', skill: 'herblore', level: 38, xp: 87.5, primaryId: 12105, primaryName: 'Ranarr weed', secondaryId: 12206, secondaryName: 'Snape grass', outputId: 12304, outputName: 'Prayer potion(4)' });
define({ id: 'mix_super_attack', name: 'Super attack', skill: 'herblore', level: 45, xp: 100, primaryId: 12106, primaryName: 'Irit leaf', secondaryId: 12201, secondaryName: 'Eye of newt', outputId: 12305, outputName: 'Super attack(4)' });
define({ id: 'mix_super_strength', name: 'Super strength', skill: 'herblore', level: 55, xp: 125, primaryId: 12108, primaryName: 'Kwuarm', secondaryId: 12203, secondaryName: 'Limpwurt root', outputId: 12306, outputName: 'Super strength(4)' });
define({ id: 'mix_super_defence', name: 'Super defence', skill: 'herblore', level: 66, xp: 150, primaryId: 12110, primaryName: 'Cadantine', secondaryId: 12205, secondaryName: 'White berries', outputId: 12307, outputName: 'Super defence(4)' });
define({ id: 'mix_ranging', name: 'Ranging potion', skill: 'herblore', level: 72, xp: 162.5, primaryId: 12112, primaryName: 'Dwarf weed', secondaryId: 12207, secondaryName: 'Wine of zamorak', outputId: 12308, outputName: 'Ranging potion(4)' });
define({ id: 'mix_antipoison', name: 'Antipoison', skill: 'herblore', level: 5, xp: 37.5, primaryId: 12102, primaryName: 'Marrentill', secondaryId: 12202, secondaryName: 'Unicorn horn dust', outputId: 12310, outputName: 'Antipoison(4)' });
define({ id: 'mix_super_restore', name: 'Super restore', skill: 'herblore', level: 63, xp: 142.5, primaryId: 12109, primaryName: 'Snapdragon', secondaryId: 12204, secondaryName: 'Red spiders eggs', outputId: 12312, outputName: 'Super restore(4)' });
define({ id: 'mix_saradomin_brew', name: 'Saradomin brew', skill: 'herblore', level: 81, xp: 180, primaryId: 12113, primaryName: 'Torstol', secondaryId: 12208, secondaryName: 'Crushed nest', outputId: 12313, outputName: 'Saradomin brew(4)' });

// ══════════════════════════════════════════════════════════════════════════════
// FLETCHING — Bows, arrows
// ══════════════════════════════════════════════════════════════════════════════

// Cut bow (u) from logs — simplified: log → bow directly
define({ id: 'fletch_shortbow', name: 'Shortbow', skill: 'fletching', level: 5, xp: 10, primaryId: 2201, primaryName: 'Logs', secondaryId: 12710, secondaryName: 'Bow string', outputId: 11001, outputName: 'Shortbow' });
define({ id: 'fletch_oak_shortbow', name: 'Oak shortbow', skill: 'fletching', level: 20, xp: 33, primaryId: 2202, primaryName: 'Oak logs', secondaryId: 12710, secondaryName: 'Bow string', outputId: 11002, outputName: 'Oak shortbow' });
define({ id: 'fletch_willow_shortbow', name: 'Willow shortbow', skill: 'fletching', level: 35, xp: 66, primaryId: 2203, primaryName: 'Willow logs', secondaryId: 12710, secondaryName: 'Bow string', outputId: 11003, outputName: 'Willow shortbow' });
define({ id: 'fletch_maple_shortbow', name: 'Maple shortbow', skill: 'fletching', level: 50, xp: 100, primaryId: 2204, primaryName: 'Maple logs', secondaryId: 12710, secondaryName: 'Bow string', outputId: 11004, outputName: 'Maple shortbow' });
define({ id: 'fletch_yew_shortbow', name: 'Yew shortbow', skill: 'fletching', level: 65, xp: 135, primaryId: 2205, primaryName: 'Yew logs', secondaryId: 12710, secondaryName: 'Bow string', outputId: 11005, outputName: 'Yew shortbow' });
define({ id: 'fletch_magic_shortbow', name: 'Magic shortbow', skill: 'fletching', level: 80, xp: 166.5, primaryId: 2206, primaryName: 'Magic logs', secondaryId: 12710, secondaryName: 'Bow string', outputId: 11006, outputName: 'Magic shortbow' });

// Arrow shafts + tips → arrows
define({ id: 'fletch_bronze_arrow', name: 'Bronze arrows', skill: 'fletching', level: 1, xp: 2.6, primaryId: 12702, primaryName: 'Headless arrow', secondaryId: 12703, secondaryName: 'Bronze arrowtips', outputId: 11100, outputName: 'Bronze arrow', outputCount: 15 });
define({ id: 'fletch_iron_arrow', name: 'Iron arrows', skill: 'fletching', level: 15, xp: 3.8, primaryId: 12702, primaryName: 'Headless arrow', secondaryId: 12704, secondaryName: 'Iron arrowtips', outputId: 11101, outputName: 'Iron arrow', outputCount: 15 });
define({ id: 'fletch_steel_arrow', name: 'Steel arrows', skill: 'fletching', level: 30, xp: 6.3, primaryId: 12702, primaryName: 'Headless arrow', secondaryId: 12705, secondaryName: 'Steel arrowtips', outputId: 11102, outputName: 'Steel arrow', outputCount: 15 });
define({ id: 'fletch_mithril_arrow', name: 'Mithril arrows', skill: 'fletching', level: 45, xp: 8.8, primaryId: 12702, primaryName: 'Headless arrow', secondaryId: 12706, secondaryName: 'Mithril arrowtips', outputId: 11103, outputName: 'Mithril arrow', outputCount: 15 });
define({ id: 'fletch_adamant_arrow', name: 'Adamant arrows', skill: 'fletching', level: 60, xp: 11.3, primaryId: 12702, primaryName: 'Headless arrow', secondaryId: 12707, secondaryName: 'Adamant arrowtips', outputId: 11104, outputName: 'Adamant arrow', outputCount: 15 });
define({ id: 'fletch_rune_arrow', name: 'Rune arrows', skill: 'fletching', level: 75, xp: 13.8, primaryId: 12702, primaryName: 'Headless arrow', secondaryId: 12708, secondaryName: 'Rune arrowtips', outputId: 11105, outputName: 'Rune arrow', outputCount: 15 });

// ══════════════════════════════════════════════════════════════════════════════
// CRAFTING — Gems, jewellery, leather
// ══════════════════════════════════════════════════════════════════════════════

// Cut gems
define({ id: 'cut_sapphire', name: 'Cut Sapphire', skill: 'crafting', level: 20, xp: 50, primaryId: 12501, primaryName: 'Uncut sapphire', outputId: 12511, outputName: 'Sapphire' });
define({ id: 'cut_emerald', name: 'Cut Emerald', skill: 'crafting', level: 27, xp: 67.5, primaryId: 12502, primaryName: 'Uncut emerald', outputId: 12512, outputName: 'Emerald' });
define({ id: 'cut_ruby', name: 'Cut Ruby', skill: 'crafting', level: 40, xp: 85, primaryId: 12503, primaryName: 'Uncut ruby', outputId: 12513, outputName: 'Ruby' });
define({ id: 'cut_diamond', name: 'Cut Diamond', skill: 'crafting', level: 43, xp: 107.5, primaryId: 12504, primaryName: 'Uncut diamond', outputId: 12514, outputName: 'Diamond' });
define({ id: 'cut_dragonstone', name: 'Cut Dragonstone', skill: 'crafting', level: 55, xp: 137.5, primaryId: 12505, primaryName: 'Uncut dragonstone', outputId: 12515, outputName: 'Dragonstone' });

// Tan leather (cowhide → leather)
define({ id: 'tan_leather', name: 'Tan Leather', skill: 'crafting', level: 1, xp: 5, primaryId: 102, primaryName: 'Cowhide', outputId: 108, outputName: 'Leather' });

// Craft leather armour
define({ id: 'craft_leather_body', name: 'Leather body', skill: 'crafting', level: 14, xp: 25, primaryId: 108, primaryName: 'Leather', outputId: 11200, outputName: 'Leather body' });
define({ id: 'craft_leather_chaps', name: 'Leather chaps', skill: 'crafting', level: 18, xp: 27, primaryId: 108, primaryName: 'Leather', outputId: 11201, outputName: 'Leather chaps' });

// ══════════════════════════════════════════════════════════════════════════════
// PRAYER — Bury bones
// ══════════════════════════════════════════════════════════════════════════════

// Prayer recipes are instant (no secondary), just bone → XP
define({ id: 'bury_bones', name: 'Bury Bones', skill: 'prayer', level: 1, xp: 4.5, primaryId: 100, primaryName: 'Bones', outputId: 0, outputName: 'Nothing' });
define({ id: 'bury_big_bones', name: 'Bury Big bones', skill: 'prayer', level: 1, xp: 15, primaryId: 106, primaryName: 'Big bones', outputId: 0, outputName: 'Nothing' });
define({ id: 'bury_dragon_bones', name: 'Bury Dragon bones', skill: 'prayer', level: 1, xp: 72, primaryId: 107, primaryName: 'Dragon bones', outputId: 0, outputName: 'Nothing' });
define({ id: 'bury_superior_dragon', name: 'Bury Superior dragon bones', skill: 'prayer', level: 1, xp: 150, primaryId: 12602, primaryName: 'Superior dragon bones', outputId: 0, outputName: 'Nothing' });

// ══════════════════════════════════════════════════════════════════════════════

module.exports = { define, getRecipe, listRecipes, attempt };
