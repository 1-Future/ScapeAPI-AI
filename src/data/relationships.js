// ══════════════════════════════════════════════════════════════════════════════
// RELATIONSHIP ENGINE — The connective tissue that makes Scape a Metroidvania
//
// Design Bible (Marstead "RuneScape is Awesome"):
//   - Hundreds of unique locks opened by hundreds of unique keys
//   - Skills interconnect: mining ore → smithing bars → crafting jewelry → alching
//   - Every quest unlocks something UNIQUE (area, method, item, spellbook)
//   - 8 design knobs per training method (attention is the most important)
//   - No universal BiS — encounters have BiS lists, not characters
//   - Reagent system: new boss drop + old item = upgrade (old content stays alive)
//   - Degradation: powerful items consume charges (cost-benefit per encounter)
//   - Breakpoints: "this changes everything" moments are the core loop
//   - No content deprecation: new content must never make old content irrelevant
//
// This module is the CENTRAL REGISTRY for all cross-system relationships.
// Content files call these APIs to register their connections.
// The engine queries this at runtime to enforce gates and compute dependencies.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

// ── Area Gates ────────────────────────────────────────────────────────────────
// Lock-and-key: every area can require quests, skill levels, items, or other
// areas to have been visited. This is the Metroidvania structure.

const areaGates = new Map(); // areaId → { requires, description }

function defineAreaGate(areaId, opts) {
  // opts: { name, description, requires: { skills, quests, items, areas, combatLevel }, region }
  if (!opts.requires) opts.requires = {};
  areaGates.set(areaId, {
    name: opts.name || areaId,
    description: opts.description || '',
    region: opts.region || null,
    requires: {
      skills: opts.requires.skills || {},       // { mining: 30, agility: 20 }
      quests: opts.requires.quests || [],        // ['quest_id', ...]
      items: opts.requires.items || [],          // [{ id, name, consumed }]
      areas: opts.requires.areas || [],          // ['area_id', ...] must have visited
      combatLevel: opts.requires.combatLevel || 0,
    },
  });
}

function getAreaGate(areaId) { return areaGates.get(areaId); }
function listAreaGates() { return [...areaGates.entries()]; }

function canAccessArea(player, areaId, getLevel) {
  const gate = areaGates.get(areaId);
  if (!gate) return { allowed: true, missing: [] };
  const missing = [];
  const req = gate.requires;
  for (const [skill, lvl] of Object.entries(req.skills)) {
    if (getLevel(player, skill) < lvl) missing.push(`${skill} level ${lvl}`);
  }
  for (const qId of req.quests) {
    if (!player.questProgress?.[qId]?.complete) missing.push(`quest: ${qId}`);
  }
  for (const item of req.items) {
    // Check player has item (not consumed on check — consumed on entry if item.consumed)
    const has = player.inventory?.some(s => s && s.id === item.id);
    if (!has) missing.push(`item: ${item.name}`);
  }
  if (req.combatLevel > 0) {
    // combatLevel check delegated to caller
    missing.push(`combat level ${req.combatLevel}`);
  }
  return { allowed: missing.length === 0, missing };
}

// ── Quest Unlocks ─────────────────────────────────────────────────────────────
// What does completing a quest ACTUALLY unlock? Not just XP — unique rewards
// that serve as Metroidvania keys for downstream content.

const questUnlocks = new Map(); // questId → { unlocks[] }

function defineQuestUnlock(questId, opts) {
  // opts: { name, unlocks: [{ type, id, description }] }
  // types: 'area', 'training_method', 'shop', 'teleport', 'spellbook',
  //        'item_equip', 'npc', 'recipe', 'prayer', 'fairy_ring',
  //        'shortcut', 'diary_perk', 'minigame', 'boss'
  questUnlocks.set(questId, {
    name: opts.name || questId,
    unlocks: (opts.unlocks || []).map(u => ({
      type: u.type,
      id: u.id || null,
      description: u.description || '',
    })),
  });
}

function getQuestUnlocks(questId) { return questUnlocks.get(questId); }

function isUnlockedByQuest(type, id) {
  // Reverse lookup: what quest unlocks this thing?
  for (const [qId, data] of questUnlocks) {
    for (const u of data.unlocks) {
      if (u.type === type && u.id === id) return qId;
    }
  }
  return null;
}

function hasUnlock(player, type, id) {
  const questId = isUnlockedByQuest(type, id);
  if (!questId) return true; // Not gated by any quest
  return !!player.questProgress?.[questId]?.complete;
}

// ── Training Method Knobs ─────────────────────────────────────────────────────
// The 8 balance knobs from Marstead. Every training method MUST have all 8.
// Attention is the most important — it's what makes RS an "attention RPG."
//
// Attention levels: 'afk' | 'low' | 'medium' | 'high' | 'maximum'
// Danger levels: 'none' | 'low' | 'medium' | 'high' | 'extreme'
// Complexity: 'trivial' | 'simple' | 'moderate' | 'complex' | 'intense'

const trainingMethods = new Map(); // methodId → full knob data

function defineTrainingMethod(methodId, opts) {
  // All 8 knobs are REQUIRED. No defaults. Force the designer to think.
  const required = ['skill', 'name', 'levelRange', 'xpPerHour', 'prerequisites',
    'resourceOutput', 'bankingFrequency', 'costPerHour', 'danger',
    'complexity', 'attention'];
  for (const f of required) {
    if (opts[f] === undefined) throw new Error(`Training method ${methodId} missing required knob: ${f}`);
  }
  trainingMethods.set(methodId, {
    id: methodId,
    skill: opts.skill,
    name: opts.name,
    levelRange: opts.levelRange,          // [min, max] or [min, 99]
    // ── The 8 Knobs ──
    xpPerHour: opts.xpPerHour,            // number or [low, high] range
    prerequisites: opts.prerequisites,     // { skills, quests, items, areas }
    resourceOutput: opts.resourceOutput,   // { produces: [{ id, name, perHour }], net: 'profit'|'loss'|'neutral' }
    bankingFrequency: opts.bankingFrequency, // 'never'|'rare'|'moderate'|'frequent'|'constant'
    costPerHour: opts.costPerHour,         // number (gp) — 0 = free, negative = profit
    danger: opts.danger,                   // 'none'|'low'|'medium'|'high'|'extreme'
    complexity: opts.complexity,           // 'trivial'|'simple'|'moderate'|'complex'|'intense'
    attention: opts.attention,             // 'afk'|'low'|'medium'|'high'|'maximum'
    // ── Supply Chain (the 9th knob) ──
    // What this method CONSUMES. This is what forces skill diversification.
    // "Where do the bones come from?" — you can't train prayer without combat.
    inputs: opts.inputs || [],             // [{ name, perHour, source }] — items consumed per hour
    // source hints: 'combat_drops', 'fishing', 'mining', 'farming', 'shop', 'ge', etc.
    // ── Meta ──
    description: opts.description || '',
    location: opts.location || null,       // area or region
    members: opts.members !== false,
    ironmanViable: opts.ironmanViable !== false,
    breakpointAt: opts.breakpointAt || null, // level where this method unlocks
  });
}

function getTrainingMethod(id) { return trainingMethods.get(id); }
function listMethodsForSkill(skill) {
  return [...trainingMethods.values()].filter(m => m.skill === skill);
}
function listMethodsByAttention(attention) {
  return [...trainingMethods.values()].filter(m => m.attention === attention);
}
function listMethodsInRange(skill, level) {
  return [...trainingMethods.values()].filter(m =>
    m.skill === skill && level >= m.levelRange[0] && level <= m.levelRange[1]
  );
}

// ── Item Combinations (Reagent System) ────────────────────────────────────────
// "New boss drops a reagent. The reagent has to be combined with the old version
// of the item to create the new, more powerful item." — Marstead
//
// This keeps old content alive. The old item and its source stay relevant.

const combinations = new Map(); // resultId → { inputs, skill, level, description }

function defineCombination(resultId, opts) {
  // opts: { resultName, inputs: [{ id, name, consumed }], skill, level, xp, description, station }
  combinations.set(resultId, {
    resultId,
    resultName: opts.resultName,
    inputs: opts.inputs || [],          // [{ id, name, consumed: true }]
    skill: opts.skill || null,          // crafting, smithing, etc.
    level: opts.level || 1,
    xp: opts.xp || 0,
    station: opts.station || null,      // 'anvil', 'furnace', 'workbench'
    description: opts.description || '',
  });
}

function getCombination(resultId) { return combinations.get(resultId); }
function whatUsesItem(itemId) {
  // Reverse lookup: what combinations consume this item?
  const uses = [];
  for (const [rId, combo] of combinations) {
    if (combo.inputs.some(i => i.id === itemId)) {
      uses.push({ resultId: rId, resultName: combo.resultName, combo });
    }
  }
  return uses;
}
function whatMakesItem(itemId) {
  return combinations.get(itemId) || null;
}

// ── Item Degradation ──────────────────────────────────────────────────────────
// "If killing a boss provides 100,000 gold per hour, but using the uber-powerful
// Staff costs you 200,000 per hour just to upkeep it, it had better more than
// double your kill speed." — Marstead
//
// Degradation creates cost-benefit per encounter and keeps non-degradable items
// relevant for content where upkeep exceeds profit.

const degradation = new Map(); // itemId → { charges, chargeItem, chargeCount, costPerCharge, onDeplete }

function defineDegradation(itemId, opts) {
  degradation.set(itemId, {
    itemId,
    itemName: opts.itemName,
    maxCharges: opts.maxCharges,             // total charges when fully charged
    chargesPerAttack: opts.chargesPerAttack || 1,
    // How to recharge:
    rechargeItem: opts.rechargeItem || null,  // { id, name, perCharge } — item consumed to recharge
    rechargeCost: opts.rechargeCost || 0,     // gp cost to recharge (alternative to item)
    rechargeNpc: opts.rechargeNpc || null,    // NPC who recharges (e.g., Bob in Moryskah)
    // Cost math:
    costPerAttack: opts.costPerAttack || 0,   // computed or explicit gp cost per attack
    // What happens when charges run out:
    onDeplete: opts.onDeplete || 'unequip',   // 'unequip' | 'destroy' | 'revert' (to base item)
    revertsTo: opts.revertsTo || null,        // itemId it becomes when depleted (if onDeplete=revert)
    description: opts.description || '',
  });
}

function getDegradation(itemId) { return degradation.get(itemId); }
function isDegradable(itemId) { return degradation.has(itemId); }
function listDegradableItems() { return [...degradation.entries()]; }

// ── Encounter BiS Tables ──────────────────────────────────────────────────────
// "It's not characters that have best in slot lists. It's encounters." — Marstead
//
// Every boss/encounter has its own recommended gear. No universal BiS.
// This is what makes you want to own MOST gear in the game.

const encounterBis = new Map(); // encounterId → { slots, notes }

function defineEncounterBis(encounterId, opts) {
  encounterBis.set(encounterId, {
    name: opts.name,
    description: opts.description || '',
    combatStyle: opts.combatStyle,         // 'melee' | 'ranged' | 'magic' | 'hybrid'
    slots: opts.slots || {},               // { head: [{ id, name, why }], body: [...], weapon: [...] }
    // Each slot lists items in priority order with WHY they're good here
    switches: opts.switches || [],         // [{ style, items: [{ slot, id, name }] }] — gear switches mid-fight
    inventory: opts.inventory || [],       // [{ id, name, count, why }] — what to bring
    costPerHour: opts.costPerHour || 0,    // approximate gp/hr cost to use this setup
    profitPerHour: opts.profitPerHour || 0,
    notes: opts.notes || '',
  });
}

function getEncounterBis(encounterId) { return encounterBis.get(encounterId); }

// ── Breakpoints ───────────────────────────────────────────────────────────────
// "RuneScape is nothing but that feeling. Passing breakpoints, seeing how the
// game world opens up to you with each threshold crossed." — Marstead
//
// Every significant threshold (skill level, quest completion, item acquisition)
// that permanently changes how you play the game.

const breakpoints = []; // sorted by importance

function defineBreakpoint(opts) {
  // opts: { type, trigger, description, unlocks, importance }
  // type: 'skill_level' | 'quest_complete' | 'item_acquired' | 'achievement'
  // trigger: { skill, level } | { quest } | { item } | { achievement }
  // unlocks: [{ type, id, description }] — same format as quest unlocks
  // importance: 'minor' | 'major' | 'transformative'
  breakpoints.push({
    type: opts.type,
    trigger: opts.trigger,
    description: opts.description || '',
    unlocks: opts.unlocks || [],
    importance: opts.importance || 'minor',
  });
}

function getBreakpointsForSkill(skill) {
  return breakpoints.filter(b => b.type === 'skill_level' && b.trigger.skill === skill);
}
function getBreakpointsForQuest(questId) {
  return breakpoints.filter(b => b.type === 'quest_complete' && b.trigger.quest === questId);
}
function getTransformativeBreakpoints() {
  return breakpoints.filter(b => b.importance === 'transformative');
}

// ── Minigames Registry ────────────────────────────────────────────────────────
// The 16 game-mode templates from BYOS minigames.md. Every minigame must give
// something UNIQUE (Manifesto P04) — not just coins/XP.
// Templates: wave_survival, capture_the_flag, battle_royale, objective_defence,
//   duel_1v1, role_based_team, gather_craft_fight, obstacle_course,
//   timed_collection, passive_management, escort_protect, skilling_boss,
//   tower_climbing, board_game, stealth, delivery
//
// Plus additional: prop_hunt, ccg.

const minigames = new Map(); // id → minigame definition

function defineMinigame(opts) {
  // opts: {
  //   id, name, region, location,
  //   template,               // one of the 16 BYOS templates
  //   minPlayers, maxPlayers,
  //   isPvP,                   // boolean — derived from combatType if absent
  //   combatType,              // 'PvP' | 'PvE' | 'Both' | 'none'
  //   attention,               // 'Background' | 'Multitask' | 'Active' | 'Max Focus'
  //   levelReqs, questReqs,
  //   skills_trained: [],      // list of skill ids trained
  //   rewards: [],             // list of human-readable reward names
  //   unique_reward,           // the single thing ONLY obtainable here (P04)
  //   rewardCurrency | reward_currency,
  //   shop: [{ item, cost }],
  //   stages | rooms: [],      // phase descriptors
  //   description, voice_flavor,
  //   duration_estimate_min,
  // }
  const rewardCurrency = opts.reward_currency || opts.rewardCurrency || opts.pointCurrency || null;
  const isPvP = typeof opts.isPvP === 'boolean'
    ? opts.isPvP
    : (opts.combatType === 'PvP' || opts.combatType === 'Both');
  minigames.set(opts.id, {
    id: opts.id,
    name: opts.name,
    region: opts.region,
    location: opts.location || null,
    template: opts.template || null,
    type: opts.type || (isPvP ? 'pvp' : 'mixed'),
    minPlayers: opts.minPlayers || 1,
    maxPlayers: opts.maxPlayers || 1,
    isPvP,
    combatType: opts.combatType || (isPvP ? 'PvP' : 'PvE'),
    attention: opts.attention || 'Active',
    levelReqs: opts.levelReqs || {},
    questReqs: opts.questReqs || [],
    skills_trained: opts.skills_trained || [],
    rewards: opts.rewards || [],
    unique_reward: opts.unique_reward || null,
    rewardCurrency,
    reward_currency: rewardCurrency,
    shop: opts.shop || [],
    stages: opts.stages || null,
    rooms: opts.rooms || null,
    description: opts.description || '',
    voice_flavor: opts.voice_flavor || '',
    duration_estimate_min: opts.duration_estimate_min || null,
    xpRewards: opts.xpRewards || {},
    pointCurrency: rewardCurrency,
  });
}

function getMinigame(id) { return minigames.get(id); }
function listMinigames() { return [...minigames.values()]; }
function listMinigamesByRegion(region) {
  return [...minigames.values()].filter(m => m.region === region);
}
function listMinigamesByTemplate(template) {
  return [...minigames.values()].filter(m => m.template === template);
}
function listMinigamesPvP(isPvP) {
  return [...minigames.values()].filter(m => m.isPvP === isPvP);
}

// ── Item Source Registry ──────────────────────────────────────────────────────
// For any item: where does it come from? What drops it, what quest gives it,
// what recipe produces it, what shop sells it?

const itemSources = new Map(); // itemId → [{ type, sourceId, sourceName, details }]

function registerItemSource(itemId, source) {
  // source: { type: 'drop'|'quest'|'recipe'|'shop'|'gathering'|'other', sourceId, sourceName, details }
  if (!itemSources.has(itemId)) itemSources.set(itemId, []);
  itemSources.get(itemId).push(source);
}

function getItemSources(itemId) { return itemSources.get(itemId) || []; }

// ── Item Uses Registry ────────────────────────────────────────────────────────
// For any item: what is it used FOR? What recipes consume it, what quests need
// it, what combinations require it?

const itemUses = new Map(); // itemId → [{ type, targetId, targetName, details }]

function registerItemUse(itemId, use) {
  // use: { type: 'recipe'|'quest_req'|'combination'|'charge'|'offering'|'other', targetId, targetName, details }
  if (!itemUses.has(itemId)) itemUses.set(itemId, []);
  itemUses.get(itemId).push(use);
}

function getItemUses(itemId) { return itemUses.get(itemId) || []; }

// ── Dependency Graph Queries ──────────────────────────────────────────────────
// High-level queries that cross-reference all registries.

function whatDoINeedFor(targetType, targetId) {
  // "I want to do X. What do I need?"
  const deps = { skills: {}, quests: [], items: [], areas: [] };

  if (targetType === 'area') {
    const gate = areaGates.get(targetId);
    if (gate) Object.assign(deps, gate.requires);
  }
  if (targetType === 'quest') {
    // Would need access to quest definitions — delegate to quests.js
  }
  if (targetType === 'training_method') {
    const method = trainingMethods.get(targetId);
    if (method) Object.assign(deps, method.prerequisites);
  }
  if (targetType === 'combination') {
    const combo = combinations.get(targetId);
    if (combo) {
      if (combo.skill) deps.skills[combo.skill] = combo.level;
      deps.items = combo.inputs.map(i => ({ id: i.id, name: i.name }));
    }
  }
  return deps;
}

function whatDoesThisUnlock(sourceType, sourceId) {
  // "I just completed X. What's new?"
  const unlocked = [];

  if (sourceType === 'quest') {
    const qu = questUnlocks.get(sourceId);
    if (qu) unlocked.push(...qu.unlocks);
    // Also check area gates that require this quest
    for (const [areaId, gate] of areaGates) {
      if (gate.requires.quests.includes(sourceId)) {
        unlocked.push({ type: 'area', id: areaId, description: `Access to ${gate.name}` });
      }
    }
  }
  if (sourceType === 'skill_level') {
    // sourceId = { skill, level }
    const bps = breakpoints.filter(b =>
      b.type === 'skill_level' &&
      b.trigger.skill === sourceId.skill &&
      b.trigger.level === sourceId.level
    );
    for (const bp of bps) unlocked.push(...bp.unlocks);
  }
  return unlocked;
}

// ── Integrity Checks ──────────────────────────────────────────────────────────
// Validate the relationship web for dangling references, orphaned content, etc.

function validateRelationships() {
  const issues = [];

  // Check quest unlocks reference valid quests
  for (const [qId] of questUnlocks) {
    // Would check against quests.js registry
  }

  // Check area gates don't create circular dependencies
  // Check combinations reference valid items
  for (const [rId, combo] of combinations) {
    for (const input of combo.inputs) {
      if (!input.id && !input.name) {
        issues.push(`Combination ${rId}: input missing both id and name`);
      }
    }
  }

  // Check training methods cover all 10-level brackets
  const skills = ['attack', 'strength', 'defence', 'hitpoints', 'ranged', 'prayer',
    'magic', 'runecrafting', 'construction', 'agility', 'herblore', 'thieving',
    'crafting', 'fletching', 'slayer', 'hunter', 'mining', 'smithing',
    'fishing', 'cooking', 'firemaking', 'woodcutting', 'farming'];

  for (const skill of skills) {
    const methods = listMethodsForSkill(skill);
    if (methods.length === 0) {
      issues.push(`Skill ${skill}: no training methods defined`);
      continue;
    }
    // Check every 10-level bracket has at least 2 methods
    for (let bracket = 1; bracket <= 90; bracket += 10) {
      const inBracket = methods.filter(m =>
        m.levelRange[0] <= bracket + 9 && m.levelRange[1] >= bracket
      );
      if (inBracket.length < 2) {
        issues.push(`Skill ${skill}: bracket ${bracket}-${bracket + 9} has ${inBracket.length} methods (need 2+)`);
      }
    }
    // Check at least one AFK and one high-attention method exists
    const hasAfk = methods.some(m => m.attention === 'afk' || m.attention === 'low');
    const hasActive = methods.some(m => m.attention === 'high' || m.attention === 'maximum');
    if (!hasAfk) issues.push(`Skill ${skill}: no AFK/low-attention method`);
    if (!hasActive) issues.push(`Skill ${skill}: no high/max-attention method`);
  }

  // Check breakpoints exist for all skills
  for (const skill of skills) {
    const bps = getBreakpointsForSkill(skill);
    if (bps.length === 0) issues.push(`Skill ${skill}: no breakpoints defined`);
  }

  return issues;
}

// ── Stats ─────────────────────────────────────────────────────────────────────

function stats() {
  return {
    areaGates: areaGates.size,
    questUnlocks: questUnlocks.size,
    trainingMethods: trainingMethods.size,
    combinations: combinations.size,
    degradableItems: degradation.size,
    encounterBisTables: encounterBis.size,
    breakpoints: breakpoints.length,
    itemSources: itemSources.size,
    itemUses: itemUses.size,
    minigames: minigames.size,
  };
}

// ══════════════════════════════════════════════════════════════════════════════
module.exports = {
  // Area Gates
  defineAreaGate, getAreaGate, listAreaGates, canAccessArea,
  // Quest Unlocks
  defineQuestUnlock, getQuestUnlocks, isUnlockedByQuest, hasUnlock,
  // Training Methods (8 knobs)
  defineTrainingMethod, getTrainingMethod, listMethodsForSkill,
  listMethodsByAttention, listMethodsInRange,
  // Item Combinations (Reagent System)
  defineCombination, getCombination, whatUsesItem, whatMakesItem,
  // Degradation
  defineDegradation, getDegradation, isDegradable, listDegradableItems,
  // Encounter BiS
  defineEncounterBis, getEncounterBis,
  // Breakpoints
  defineBreakpoint, getBreakpointsForSkill, getBreakpointsForQuest,
  getTransformativeBreakpoints,
  // Item Sources & Uses
  registerItemSource, getItemSources, registerItemUse, getItemUses,
  // Minigames (16 BYOS templates)
  defineMinigame, getMinigame, listMinigames,
  listMinigamesByRegion, listMinigamesByTemplate, listMinigamesPvP,
  // Graph Queries
  whatDoINeedFor, whatDoesThisUnlock,
  // Validation
  validateRelationships,
  // Stats
  stats,
};
