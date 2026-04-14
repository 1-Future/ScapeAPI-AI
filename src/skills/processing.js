// ══════════════════════════════════════════════════════════════════════════════
// Processing Skills — Cooking, Smithing
//
// Processing pattern:
//   Player + Raw Input + Station → Action Ticks → Success Roll → Product + XP
//
// Unlike gathering, processing burns the input item on attempt (success or fail).
// API-first: every action and state is observable by RL.
// ══════════════════════════════════════════════════════════════════════════════

const tick = require('../engine/tick');
const { successChance, xpToLevel, XP_TABLE } = require('./gathering');

// ── Recipe Registry ────────────────────────────────────────────────────────

const recipes = new Map(); // recipeId → recipe definition

function defineRecipe(opts) {
  const recipe = {
    id: opts.id,
    name: opts.name,
    skill: opts.skill, // cooking, smithing
    level: opts.level, // minimum level
    xp: opts.xp, // xp on success
    inputId: opts.inputId, // consumed item ID
    inputName: opts.inputName,
    outputId: opts.outputId, // produced item ID
    outputName: opts.outputName,
    burnOutputId: opts.burnOutputId || null, // item produced on failure (burnt food)
    burnOutputName: opts.burnOutputName || null,
    low: opts.low || 30, // success formula: low numerator
    high: opts.high || 200, // success formula: high numerator
    stopBurnLevel: opts.stopBurnLevel || 99, // level at which failures stop
    ticks: opts.ticks || 4, // ticks per processing attempt
    stationRequired: opts.stationRequired || null, // range, furnace, anvil
    // Smithing: multi-bar recipes
    inputCount: opts.inputCount || 1, // how many input items consumed
    secondaryId: opts.secondaryId || null, // coal for steel, etc.
    secondaryCount: opts.secondaryCount || 0,
  };
  recipes.set(recipe.id, recipe);
  return recipe;
}

function getRecipe(id) { return recipes.get(id); }
function listRecipes(skill) {
  if (!skill) return [...recipes.values()];
  return [...recipes.values()].filter(r => r.skill === skill);
}

// ── Process action ─────────────────────────────────────────────────────────
// Called once per processing attempt. Returns result.

function processAttempt(player, recipeId) {
  const recipe = recipes.get(recipeId);
  if (!recipe) return { error: 'unknown_recipe' };

  // Check level
  const skillData = player.skills?.[recipe.skill];
  const level = skillData?.level || 1;
  if (level < recipe.level) return { error: 'level_too_low', required: recipe.level };

  // Check input items in inventory
  const inputSlots = findItemSlots(player, recipe.inputId, recipe.inputCount);
  if (inputSlots.length < recipe.inputCount) return { error: 'missing_input', need: recipe.inputName, have: inputSlots.length, required: recipe.inputCount };

  // Check secondary items (e.g. coal for steel bars)
  let secondarySlots = [];
  if (recipe.secondaryId && recipe.secondaryCount > 0) {
    secondarySlots = findItemSlots(player, recipe.secondaryId, recipe.secondaryCount);
    if (secondarySlots.length < recipe.secondaryCount) return { error: 'missing_secondary', need: recipe.secondaryCount };
  }

  // Check free inventory slot for output
  const freeSlot = player.inventory.findIndex(s => s === null);
  // If we're consuming at least one slot, we'll have room
  const willFreeSlot = inputSlots.length > 0;
  if (freeSlot === -1 && !willFreeSlot) return { error: 'inventory_full' };

  // Consume inputs
  for (const slot of inputSlots) player.inventory[slot] = null;
  for (const slot of secondarySlots) player.inventory[slot] = null;

  // Success roll
  const chance = level >= recipe.stopBurnLevel ? 1.0 : successChance(level, recipe.low, recipe.high);
  const success = Math.random() < chance;

  // Place output
  const outputSlot = player.inventory.findIndex(s => s === null);
  if (success) {
    if (outputSlot >= 0) {
      player.inventory[outputSlot] = { id: recipe.outputId, name: recipe.outputName, count: 1 };
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
      product: { id: recipe.outputId, name: recipe.outputName },
      xp: recipe.xp,
      skill: recipe.skill,
      level: player.skills[recipe.skill].level,
      chance,
    };
  } else {
    // Failure — produce burnt output if applicable
    if (recipe.burnOutputId && outputSlot >= 0) {
      player.inventory[outputSlot] = { id: recipe.burnOutputId, name: recipe.burnOutputName, count: 1 };
    }
    return { success: false, burnt: recipe.burnOutputName || null, chance };
  }
}

// ── Helper ─────────────────────────────────────────────────────────────────

function findItemSlots(player, itemId, count) {
  const slots = [];
  if (!player.inventory) return slots;
  for (let i = 0; i < player.inventory.length && slots.length < count; i++) {
    if (player.inventory[i] && player.inventory[i].id === itemId) {
      slots.push(i);
    }
  }
  return slots;
}

// ══════════════════════════════════════════════════════════════════════════════
// DEFINE RECIPES — Cooking
// ══════════════════════════════════════════════════════════════════════════════

defineRecipe({ id: 'cook_shrimps', name: 'Cook shrimps', skill: 'cooking', level: 1, xp: 30, inputId: 2301, inputName: 'Raw shrimps', outputId: 2009, outputName: 'Shrimps', burnOutputId: 2099, burnOutputName: 'Burnt shrimps', low: 50, high: 220, stopBurnLevel: 34, stationRequired: 'range' });
defineRecipe({ id: 'cook_meat', name: 'Cook meat', skill: 'cooking', level: 1, xp: 30, inputId: 103, inputName: 'Raw beef', outputId: 2002, outputName: 'Cooked meat', burnOutputId: 2098, burnOutputName: 'Burnt meat', low: 50, high: 220, stopBurnLevel: 34, stationRequired: 'range' });
defineRecipe({ id: 'cook_chicken', name: 'Cook chicken', skill: 'cooking', level: 1, xp: 30, inputId: 105, inputName: 'Raw chicken', outputId: 2003, outputName: 'Cooked chicken', burnOutputId: 2098, burnOutputName: 'Burnt meat', low: 50, high: 220, stopBurnLevel: 34, stationRequired: 'range' });
defineRecipe({ id: 'cook_trout', name: 'Cook trout', skill: 'cooking', level: 15, xp: 70, inputId: 2302, inputName: 'Raw trout', outputId: 2004, outputName: 'Trout', burnOutputId: 2097, burnOutputName: 'Burnt fish', low: 20, high: 180, stopBurnLevel: 50, stationRequired: 'range' });
defineRecipe({ id: 'cook_salmon', name: 'Cook salmon', skill: 'cooking', level: 25, xp: 90, inputId: 2303, inputName: 'Raw salmon', outputId: 2005, outputName: 'Salmon', burnOutputId: 2097, burnOutputName: 'Burnt fish', low: 15, high: 160, stopBurnLevel: 58, stationRequired: 'range' });
defineRecipe({ id: 'cook_lobster', name: 'Cook lobster', skill: 'cooking', level: 40, xp: 120, inputId: 2304, inputName: 'Raw lobster', outputId: 2006, outputName: 'Lobster', burnOutputId: 2097, burnOutputName: 'Burnt fish', low: 10, high: 140, stopBurnLevel: 74, stationRequired: 'range' });
defineRecipe({ id: 'cook_swordfish', name: 'Cook swordfish', skill: 'cooking', level: 45, xp: 140, inputId: 2305, inputName: 'Raw swordfish', outputId: 2007, outputName: 'Swordfish', burnOutputId: 2097, burnOutputName: 'Burnt fish', low: 8, high: 130, stopBurnLevel: 81, stationRequired: 'range' });
defineRecipe({ id: 'cook_shark', name: 'Cook shark', skill: 'cooking', level: 80, xp: 210, inputId: 2306, inputName: 'Raw shark', outputId: 2008, outputName: 'Shark', burnOutputId: 2097, burnOutputName: 'Burnt fish', low: 3, high: 100, stopBurnLevel: 94, stationRequired: 'range' });

// ══════════════════════════════════════════════════════════════════════════════
// DEFINE RECIPES — Smithing (smelting)
// ══════════════════════════════════════════════════════════════════════════════

defineRecipe({ id: 'smelt_bronze', name: 'Smelt bronze bar', skill: 'smithing', level: 1, xp: 6.2, inputId: 2101, inputName: 'Copper ore', secondaryId: 2102, secondaryCount: 1, outputId: 2111, outputName: 'Bronze bar', low: 256, high: 256, stopBurnLevel: 1, stationRequired: 'furnace' });
defineRecipe({ id: 'smelt_iron', name: 'Smelt iron bar', skill: 'smithing', level: 15, xp: 12.5, inputId: 2103, inputName: 'Iron ore', outputId: 2112, outputName: 'Iron bar', low: 30, high: 200, stopBurnLevel: 45, stationRequired: 'furnace' });
defineRecipe({ id: 'smelt_steel', name: 'Smelt steel bar', skill: 'smithing', level: 30, xp: 17.5, inputId: 2103, inputName: 'Iron ore', secondaryId: 2104, secondaryCount: 2, outputId: 2113, outputName: 'Steel bar', low: 256, high: 256, stopBurnLevel: 1, stationRequired: 'furnace' });
defineRecipe({ id: 'smelt_soot_iron', name: 'Smelt soot-iron bar', skill: 'smithing', level: 25, xp: 20, inputId: 7001, inputName: 'Soot-iron ore', secondaryId: 2104, secondaryCount: 1, outputId: 7002, outputName: 'Soot-iron bar', low: 256, high: 256, stopBurnLevel: 1, stationRequired: 'furnace' });
defineRecipe({ id: 'smelt_mithril', name: 'Smelt mithril bar', skill: 'smithing', level: 50, xp: 30, inputId: 2105, inputName: 'Mithril ore', secondaryId: 2104, secondaryCount: 4, outputId: 2114, outputName: 'Mithril bar', low: 256, high: 256, stopBurnLevel: 1, stationRequired: 'furnace' });
defineRecipe({ id: 'smelt_adamantite', name: 'Smelt adamantite bar', skill: 'smithing', level: 70, xp: 37.5, inputId: 2106, inputName: 'Adamantite ore', secondaryId: 2104, secondaryCount: 6, outputId: 2115, outputName: 'Adamantite bar', low: 256, high: 256, stopBurnLevel: 1, stationRequired: 'furnace' });
defineRecipe({ id: 'smelt_runite', name: 'Smelt runite bar', skill: 'smithing', level: 85, xp: 50, inputId: 2107, inputName: 'Runite ore', secondaryId: 2104, secondaryCount: 8, outputId: 2116, outputName: 'Runite bar', low: 256, high: 256, stopBurnLevel: 1, stationRequired: 'furnace' });

// ── Burnt food item defs ───────────────────────────────────────────────────

const itemsModule = require('../data/items');
itemsModule.define({ id: 2009, name: 'Shrimps', examine: 'Cooked shrimps.', value: 5, category: 'food', weight: 0.3 });
itemsModule.define({ id: 2097, name: 'Burnt fish', examine: 'Oops.', value: 1, category: 'misc', weight: 0.3 });
itemsModule.define({ id: 2098, name: 'Burnt meat', examine: 'Oops.', value: 1, category: 'misc', weight: 0.5 });
itemsModule.define({ id: 2099, name: 'Burnt shrimps', examine: 'Oops.', value: 1, category: 'misc', weight: 0.3 });

// ══════════════════════════════════════════════════════════════════════════════

module.exports = {
  defineRecipe, getRecipe, listRecipes,
  processAttempt,
};
