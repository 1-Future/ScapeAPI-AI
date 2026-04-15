// ══════════════════════════════════════════════════════════════════════════════
// Recipe Runner — bridges skill recipes + item combinations → engine
//
// Two parallel sources:
//   1. src/data/recipes.js (skill recipes: cooking, smithing, crafting, etc.)
//      shape: { id, skill, name, inputs: [{id, count}], outputs: [{id, count}],
//               level, xp, ticks, station, tool, failItem, failChance, stopBurn }
//   2. src/data/relationships.js → defineCombination (reagent-system upgrades)
//      shape: { resultId, resultName, inputs: [{id, name, consumed}], skill,
//               level, xp, station, description }
//
// Public API:
//   craft(p, recipeId)  → { ok, reason?, name, xpGained, leveledTo? }
//   combine(p, resultId)→ { ok, reason?, name, xpGained, leveledTo? }
//   listAvailable(p, skill?) — recipes the player can actually do right now
//
// Sub-system #4 of the Engine Bridge (see ENGINE-BRIDGE-ROADMAP.md).
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const recipes = require('../data/recipes');
const items = require('../data/items');
const player = require('../player/player');
const rel = require('../data/relationships');
const objects = require('../world/objects');
const breakpoints = require('./breakpoint-runner');

// ── Validators ────────────────────────────────────────────────────────────────

function checkLevel(p, skill, level) {
  if (!skill || !level) return { ok: true };
  const lvl = player.getLevel(p, skill);
  if (lvl < level) return { ok: false, reason: `requires ${skill} level ${level} (you are ${lvl})` };
  return { ok: true };
}

function checkInputs(p, inputs) {
  // inputs: [{ id, count?, name? }] — resolves missing ids by name lookup
  for (const inp of inputs) {
    let id = inp.id;
    if (!id && inp.name) {
      const def = items.find(inp.name);
      if (def) id = def.id;
    }
    if (!id) return { ok: false, reason: `unknown input: ${inp.name || inp.id}` };
    const need = inp.count || 1;
    if (player.invCount(p, id) < need) {
      const name = inp.name || items.get(id)?.name || `item ${id}`;
      return { ok: false, reason: `requires ${need}x ${name}` };
    }
  }
  return { ok: true };
}

function checkStation(p, stationName) {
  if (!stationName) return { ok: true };
  // Look for an object of the right type within 2 tiles
  const obj = objects.findObjectByName(stationName, p.x, p.y, 2, p.layer || 0);
  if (!obj) return { ok: false, reason: `requires ${stationName} nearby` };
  return { ok: true };
}

function checkTool(p, toolName) {
  if (!toolName) return { ok: true };
  // Tool can be in inventory OR equipped
  const lower = toolName.toLowerCase();
  const inInv = p.inventory?.some(s => s && s.name?.toLowerCase().includes(lower));
  const equipped = Object.values(p.equipment || {}).some(e => e && e.name?.toLowerCase().includes(lower));
  if (!inInv && !equipped) return { ok: false, reason: `requires ${toolName}` };
  return { ok: true };
}

// ── Apply an outputs+xp bundle ────────────────────────────────────────────────

function applyOutputs(p, outputs) {
  const awarded = [];
  for (const out of outputs) {
    let id = out.id;
    if (!id && out.name) {
      const def = items.find(out.name);
      if (def) id = def.id;
    }
    if (!id) continue;
    const def = items.get(id);
    if (!def) continue;
    const ok = player.invAdd(p, def.id, def.name, out.count || 1, def.stackable);
    if (!ok) return { ok: false, reason: 'inventory full', awarded };
    awarded.push({ id: def.id, name: def.name, count: out.count || 1 });
  }
  return { ok: true, awarded };
}

function consumeInputs(p, inputs) {
  for (const inp of inputs) {
    if (inp.consumed === false) continue; // combinations may flag a non-consumed input
    let id = inp.id;
    if (!id && inp.name) {
      const def = items.find(inp.name);
      if (def) id = def.id;
    }
    if (!id) continue;
    player.invRemove(p, id, inp.count || 1);
  }
}

// ── craft (skill recipes) ─────────────────────────────────────────────────────

function craft(p, recipeId) {
  // Accept either a recipe id (string) or a recipe name
  let recipe = recipes.findById ? recipes.findById(recipeId) : null;
  if (!recipe) recipe = recipes.find(recipeId);
  if (!recipe) return { ok: false, reason: `unknown recipe: ${recipeId}` };

  const checks = [
    checkLevel(p, recipe.skill, recipe.level),
    checkStation(p, recipe.station),
    checkTool(p, recipe.tool),
    checkInputs(p, recipe.inputs || []),
  ];
  for (const c of checks) if (!c.ok) return c;

  consumeInputs(p, recipe.inputs || []);

  // Some recipes (firemaking) have empty outputs but still award XP
  const outputs = recipe.outputs || [];
  const apply = applyOutputs(p, outputs);
  if (!apply.ok) return apply;

  const leveledTo = recipe.xp ? breakpoints.addXpWithBreakpoints(p, recipe.skill, recipe.xp) : null;
  return {
    ok: true,
    recipeId: recipe.id || recipe.name,
    name: recipe.name,
    skill: recipe.skill,
    xpGained: recipe.xp || 0,
    leveledTo: leveledTo || null,
    produced: apply.awarded,
  };
}

// ── combine (reagent system) ──────────────────────────────────────────────────

function combine(p, resultId) {
  // resultId may be a numeric item id OR a result name
  let combo = rel.getCombination(resultId);
  if (!combo && typeof resultId === 'string') {
    // Resolve name → item id → combination
    const def = items.find(resultId);
    if (def) combo = rel.getCombination(def.id);
  }
  if (!combo) return { ok: false, reason: `unknown combination: ${resultId}` };

  const checks = [
    checkLevel(p, combo.skill, combo.level),
    checkStation(p, combo.station),
    checkInputs(p, combo.inputs || []),
  ];
  for (const c of checks) if (!c.ok) return c;

  consumeInputs(p, combo.inputs || []);

  // Combination always produces 1 of resultId
  const def = items.get(combo.resultId) || (combo.resultName ? items.find(combo.resultName) : null);
  if (!def) {
    // Item doesn't exist as a definition yet — define a stub so it can be added
    items.define({ id: combo.resultId, name: combo.resultName || `Item ${combo.resultId}`, value: 0 });
  }
  const itemDef = items.get(combo.resultId) || items.find(combo.resultName);
  const ok = player.invAdd(p, itemDef.id, itemDef.name, 1, itemDef.stackable);
  if (!ok) return { ok: false, reason: 'inventory full' };

  const leveledTo = combo.xp ? breakpoints.addXpWithBreakpoints(p, combo.skill, combo.xp) : null;
  return {
    ok: true,
    resultId: combo.resultId,
    name: itemDef.name,
    skill: combo.skill,
    xpGained: combo.xp || 0,
    leveledTo: leveledTo || null,
  };
}

// ── Listing helpers ───────────────────────────────────────────────────────────

function listAvailable(p, skill) {
  const all = skill ? recipes.forSkill(skill) : recipes.recipes;
  return all.filter(r => {
    if (checkLevel(p, r.skill, r.level).ok === false) return false;
    return checkInputs(p, r.inputs || []).ok;
  });
}

module.exports = { craft, combine, listAvailable, checkLevel, checkInputs, checkStation };
