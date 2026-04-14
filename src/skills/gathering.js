// ══════════════════════════════════════════════════════════════════════════════
// Gathering Skills — Mining, Fishing, Woodcutting
//
// Shared gathering pattern from build-your-own-scape/docs/skills-gathering.md:
//   Player + Tool + Node → Action Tick → Success Roll → Product + XP
//
// Universal success formula (OSRS linear interpolation):
//   chance = (1 + floor(low * (99 - level) / 98 + high * (level - 1) / 98 + 0.5)) / 256
//
// API-first: every action and state is observable by RL.
// ══════════════════════════════════════════════════════════════════════════════

const tick = require('../engine/tick');
const items = require('../data/items');

// ── Configuration ──────────────────────────────────────────────────────────

const GAME_TICK_MS = 600; // 0.6s per tick, matching OSRS
const TICKS_PER_HOUR = Math.floor(3600000 / GAME_TICK_MS); // 6000

// ── Resource Node Registry ─────────────────────────────────────────────────

const nodes = new Map(); // nodeId → node definition

function defineNode(opts) {
  const node = {
    id: opts.id,
    name: opts.name,
    skill: opts.skill, // mining, fishing, woodcutting
    level: opts.level, // minimum level to gather
    xp: opts.xp, // xp per successful gather
    productId: opts.productId, // item ID produced
    productName: opts.productName,
    low: opts.low || 10, // success formula: low numerator (level 1)
    high: opts.high || 100, // success formula: high numerator (level 99)
    rollInterval: opts.rollInterval || 4, // ticks between success rolls (tool-dependent base)
    depletes: opts.depletes !== false, // does the node deplete after gathering?
    respawnTicks: opts.respawnTicks || 50, // ticks to respawn after depletion
    toolRequired: opts.toolRequired || null, // required tool category
  };
  nodes.set(node.id, node);
  return node;
}

function getNode(id) { return nodes.get(id); }
function listNodes(skill) {
  if (!skill) return [...nodes.values()];
  return [...nodes.values()].filter(n => n.skill === skill);
}

// ── Success formula ────────────────────────────────────────────────────────

function successChance(level, low, high) {
  const chance = (1 + Math.floor(low * (99 - level) / 98 + high * (level - 1) / 98 + 0.5)) / 256;
  return Math.max(0, Math.min(1, chance));
}

// ── Tool speed modifiers ───────────────────────────────────────────────────
// Better tools reduce the roll interval

const TOOL_SPEEDS = {
  mining: {
    'Bronze pickaxe': 8, 'Iron pickaxe': 7, 'Steel pickaxe': 6,
    'Mithril pickaxe': 5, 'Adamant pickaxe': 4, 'Rune pickaxe': 3,
  },
  woodcutting: {
    'Bronze axe': 8, 'Iron axe': 7, 'Steel axe': 6,
    'Mithril axe': 5, 'Adamant axe': 4, 'Rune axe': 3,
  },
  fishing: {
    'Small fishing net': 5, 'Fishing rod': 5, 'Fly fishing rod': 4,
    'Harpoon': 5, 'Lobster pot': 5, 'Big fishing net': 6,
  },
};

function getToolSpeed(skill, toolName) {
  const table = TOOL_SPEEDS[skill];
  if (!table) return 6; // default
  return table[toolName] || 6;
}

// ── Gather action ──────────────────────────────────────────────────────────
// Called each tick for a player who is gathering.
// Returns { success, product, xp } or null if still rolling.

function gatherTick(player, nodeId) {
  const node = nodes.get(nodeId);
  if (!node) return { error: 'unknown_node' };

  // Check level
  const skillData = player.skills?.[node.skill];
  const level = skillData?.level || 1;
  if (level < node.level) return { error: 'level_too_low', required: node.level };

  // Check tool
  const toolName = getEquippedTool(player, node.skill);
  if (node.toolRequired && !toolName) return { error: 'no_tool', required: node.toolRequired };

  // Check inventory space
  const freeSlot = player.inventory?.findIndex(s => s === null);
  if (freeSlot === -1) return { error: 'inventory_full' };

  // Initialize gathering state
  if (!player._gatherState) player._gatherState = {};
  if (!player._gatherState[nodeId]) {
    player._gatherState[nodeId] = { lastRollTick: 0 };
  }
  const state = player._gatherState[nodeId];

  // Roll interval based on tool
  const rollInterval = getToolSpeed(node.skill, toolName);
  const currentTick = tick.getTick();

  // Not time to roll yet
  if (currentTick - state.lastRollTick < rollInterval) {
    return { waiting: true, ticksUntilRoll: rollInterval - (currentTick - state.lastRollTick) };
  }

  state.lastRollTick = currentTick;

  // Success roll
  const chance = successChance(level, node.low, node.high);
  if (Math.random() < chance) {
    // Success — give product + XP
    const product = { id: node.productId, name: node.productName, count: 1 };
    if (freeSlot >= 0) {
      player.inventory[freeSlot] = product;
    }

    // Grant XP
    if (!player.skills[node.skill]) player.skills[node.skill] = { level: 1, xp: 0 };
    player.skills[node.skill].xp += node.xp;

    // Level up check
    const newLevel = xpToLevel(player.skills[node.skill].xp);
    if (newLevel > player.skills[node.skill].level) {
      player.skills[node.skill].level = newLevel;
    }

    return {
      success: true,
      product: product,
      xp: node.xp,
      skill: node.skill,
      level: player.skills[node.skill].level,
      totalXp: player.skills[node.skill].xp,
      chance: chance,
    };
  }

  return { success: false, chance: chance };
}

// ── XP table (OSRS formula) ───────────────────────────────────────────────

function levelToXp(level) {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += Math.floor(i + 300 * Math.pow(2, i / 7));
  }
  return Math.floor(total / 4);
}

const XP_TABLE = [];
for (let l = 1; l <= 99; l++) XP_TABLE[l] = levelToXp(l);

function xpToLevel(xp) {
  for (let l = 99; l >= 1; l--) {
    if (xp >= XP_TABLE[l]) return l;
  }
  return 1;
}

// ── Helper: find equipped tool ─────────────────────────────────────────────

function getEquippedTool(player, skill) {
  const weapon = player.equipment?.weapon;
  if (!weapon) return null;
  const table = TOOL_SPEEDS[skill];
  if (table && table[weapon.name]) return weapon.name;
  // Also check inventory for tools
  if (player.inventory) {
    for (const slot of player.inventory) {
      if (slot && table && table[slot.name]) return slot.name;
    }
  }
  return null;
}

// ── Computed method rates (Training Method Builder) ────────────────────────
// Returns the theoretical XP/hr for a given node at a given level with a given tool.

function computeMethodRate(nodeId, level, toolName) {
  const node = nodes.get(nodeId);
  if (!node) return null;

  const rollInterval = getToolSpeed(node.skill, toolName);
  const chance = successChance(level, node.low, node.high);
  const avgTicksPerSuccess = rollInterval / chance;
  const successesPerHour = TICKS_PER_HOUR / avgTicksPerSuccess;
  const xpPerHour = successesPerHour * node.xp;

  return {
    nodeId, nodeName: node.name, skill: node.skill,
    level, tool: toolName,
    rollInterval, successChance: chance,
    avgTicksPerSuccess: Math.round(avgTicksPerSuccess * 10) / 10,
    successesPerHour: Math.round(successesPerHour),
    xpPerHour: Math.round(xpPerHour),
    // Note: GP/hr would need live item prices — deferred to economy module
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// DEFINE RESOURCE NODES — Mining
// ══════════════════════════════════════════════════════════════════════════════

defineNode({ id: 'copper_rock', name: 'Copper rock', skill: 'mining', level: 1, xp: 17.5, productId: 2101, productName: 'Copper ore', low: 10, high: 150, respawnTicks: 5, toolRequired: 'pickaxe' });
defineNode({ id: 'tin_rock', name: 'Tin rock', skill: 'mining', level: 1, xp: 17.5, productId: 2102, productName: 'Tin ore', low: 10, high: 150, respawnTicks: 5, toolRequired: 'pickaxe' });
defineNode({ id: 'iron_rock', name: 'Iron rock', skill: 'mining', level: 15, xp: 35, productId: 2103, productName: 'Iron ore', low: 5, high: 120, respawnTicks: 10, toolRequired: 'pickaxe' });
defineNode({ id: 'coal_rock', name: 'Coal rock', skill: 'mining', level: 30, xp: 50, productId: 2104, productName: 'Coal', low: 3, high: 100, respawnTicks: 40, toolRequired: 'pickaxe' });
defineNode({ id: 'mithril_rock', name: 'Mithril rock', skill: 'mining', level: 55, xp: 80, productId: 2105, productName: 'Mithril ore', low: 2, high: 70, respawnTicks: 120, toolRequired: 'pickaxe' });
defineNode({ id: 'adamantite_rock', name: 'Adamantite rock', skill: 'mining', level: 70, xp: 95, productId: 2106, productName: 'Adamantite ore', low: 1, high: 50, respawnTicks: 240, toolRequired: 'pickaxe' });
defineNode({ id: 'runite_rock', name: 'Runite rock', skill: 'mining', level: 85, xp: 125, productId: 2107, productName: 'Runite ore', low: 1, high: 30, respawnTicks: 720, toolRequired: 'pickaxe' });
defineNode({ id: 'soot_iron_rock', name: 'Soot-iron rock', skill: 'mining', level: 25, xp: 45, productId: 7001, productName: 'Soot-iron ore', low: 4, high: 110, respawnTicks: 15, toolRequired: 'pickaxe' });
defineNode({ id: 'crystal_node', name: 'Crystal node', skill: 'mining', level: 70, xp: 100, productId: 10001, productName: 'Crystal shard', low: 2, high: 60, respawnTicks: 100, toolRequired: 'pickaxe' });

// ══════════════════════════════════════════════════════════════════════════════
// DEFINE RESOURCE NODES — Woodcutting
// ══════════════════════════════════════════════════════════════════════════════

defineNode({ id: 'normal_tree', name: 'Tree', skill: 'woodcutting', level: 1, xp: 25, productId: 2201, productName: 'Logs', low: 20, high: 200, respawnTicks: 10, toolRequired: 'axe' });
defineNode({ id: 'oak_tree', name: 'Oak tree', skill: 'woodcutting', level: 15, xp: 37.5, productId: 2202, productName: 'Oak logs', low: 10, high: 150, respawnTicks: 15, toolRequired: 'axe' });
defineNode({ id: 'willow_tree', name: 'Willow tree', skill: 'woodcutting', level: 30, xp: 67.5, productId: 2203, productName: 'Willow logs', low: 5, high: 120, respawnTicks: 20, toolRequired: 'axe' });
defineNode({ id: 'maple_tree', name: 'Maple tree', skill: 'woodcutting', level: 45, xp: 100, productId: 2204, productName: 'Maple logs', low: 3, high: 90, respawnTicks: 40, toolRequired: 'axe' });
defineNode({ id: 'yew_tree', name: 'Yew tree', skill: 'woodcutting', level: 60, xp: 175, productId: 2205, productName: 'Yew logs', low: 2, high: 60, respawnTicks: 100, toolRequired: 'axe' });
defineNode({ id: 'magic_tree', name: 'Magic tree', skill: 'woodcutting', level: 75, xp: 250, productId: 2206, productName: 'Magic logs', low: 1, high: 40, respawnTicks: 200, toolRequired: 'axe' });

// ══════════════════════════════════════════════════════════════════════════════
// DEFINE RESOURCE NODES — Fishing
// ══════════════════════════════════════════════════════════════════════════════

defineNode({ id: 'shrimp_spot', name: 'Fishing spot (shrimp)', skill: 'fishing', level: 1, xp: 10, productId: 2301, productName: 'Raw shrimps', low: 15, high: 180, depletes: false, toolRequired: 'net' });
defineNode({ id: 'trout_spot', name: 'Fishing spot (trout)', skill: 'fishing', level: 20, xp: 50, productId: 2302, productName: 'Raw trout', low: 5, high: 120, depletes: false, toolRequired: 'rod' });
defineNode({ id: 'salmon_spot', name: 'Fishing spot (salmon)', skill: 'fishing', level: 30, xp: 70, productId: 2303, productName: 'Raw salmon', low: 4, high: 100, depletes: false, toolRequired: 'rod' });
defineNode({ id: 'lobster_spot', name: 'Fishing spot (lobster)', skill: 'fishing', level: 40, xp: 90, productId: 2304, productName: 'Raw lobster', low: 3, high: 80, depletes: false, toolRequired: 'pot' });
defineNode({ id: 'swordfish_spot', name: 'Fishing spot (swordfish)', skill: 'fishing', level: 50, xp: 100, productId: 2305, productName: 'Raw swordfish', low: 2, high: 70, depletes: false, toolRequired: 'harpoon' });
defineNode({ id: 'shark_spot', name: 'Fishing spot (shark)', skill: 'fishing', level: 76, xp: 110, productId: 2306, productName: 'Raw shark', low: 1, high: 40, depletes: false, toolRequired: 'harpoon' });

// ══════════════════════════════════════════════════════════════════════════════

module.exports = {
  defineNode, getNode, listNodes,
  successChance, gatherTick,
  computeMethodRate,
  xpToLevel, levelToXp, XP_TABLE,
  TOOL_SPEEDS, getToolSpeed,
};
