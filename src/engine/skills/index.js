// ══════════════════════════════════════════════════════════════════════════════
// Unified Skill Manifest Registry
//
// All 23 OSRS-parity skills aggregated here in a single shape. Clients:
//   - codex page generator (src/tools/codex-generator.js)
//   - admin dashboard skill panel
//   - RL environment feature vector
//   - training-method breakpoint cross-reference
//
// The implementation of XP / actions / success rolls lives in:
//   - src/skills/gathering.js  (Mining, Fishing, Woodcutting)
//   - src/skills/processing.js (Cooking, Smithing)
//   - src/skills/combining.js  (Crafting, Fletching, Prayer-bone, Herblore-mix)
//   - src/skills/agility.js    (Agility)
//   - src/skills/construction.js (Construction)
//   - src/skills/farming.js    (Farming)
//   - src/skills/firemaking.js (Firemaking)
//   - src/skills/hunter.js     (Hunter)
//   - src/skills/runecrafting.js (Runecrafting)
//   - src/skills/thieving.js   (Thieving)
//   - src/combat/combat.js     (Attack, Strength, Defence, Hitpoints, Ranged, Magic)
//   - src/engine/prayer-runner.js (Prayer)
//   - src/engine/magic-runner.js  (Magic — spellbook logic)
//   - src/data/slayer.js          (Slayer)
//   - src/data/recipes.js         (Herblore recipes)
//
// This manifest is intentionally declarative-only.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const { CATEGORIES, ATTENTION, XP_TABLE_99 } = require('./_shape');

const SKILL_IDS = [
  // Combat
  'attack', 'strength', 'defence', 'hitpoints', 'ranged', 'prayer', 'magic',
  // Support
  'runecrafting', 'construction',
  // Exploration
  'agility', 'thieving',
  // Slayer (combat-adjacent)
  'slayer',
  // Gathering
  'mining', 'fishing', 'woodcutting', 'hunter', 'farming',
  // Processing
  'cooking', 'smithing', 'crafting', 'fletching', 'herblore',
  // Support (warmth / utility)
  'firemaking',
];

const _manifests = Object.create(null);
for (const id of SKILL_IDS) {
  // eslint-disable-next-line global-require
  _manifests[id] = require(`./${id}.js`);
}

/**
 * Get the full manifest for a skill by id.
 * @param {string} id lowercase skill name
 * @returns {object | null}
 */
function get(id) {
  return _manifests[String(id || '').toLowerCase()] || null;
}

/**
 * List all manifests (array form — useful for ordered UI).
 */
function list() {
  return SKILL_IDS.map(id => _manifests[id]);
}

/**
 * List skill ids by category (e.g., CATEGORIES.COMBAT → [attack, strength, ...]).
 */
function byCategory(category) {
  return list().filter(m => m.category === category);
}

/**
 * Resolve an XP count to a level (reads the manifest's own xpTable).
 */
function levelForXp(skillId, xp) {
  const m = get(skillId);
  if (!m) return 1;
  const table = m.xpTable || XP_TABLE_99;
  for (let lvl = table.length - 1; lvl >= 1; lvl--) {
    if (xp >= table[lvl]) return lvl;
  }
  return 1;
}

/**
 * Actions that become available at a given player level.
 * Returns those whose required level <= targetLevel.
 */
function unlockedActions(skillId, targetLevel) {
  const m = get(skillId);
  if (!m) return [];
  return m.actions.filter(a => a.level <= targetLevel);
}

module.exports = {
  get, list, byCategory, levelForXp, unlockedActions,
  SKILL_IDS, CATEGORIES, ATTENTION,
  // Raw access for reflection.
  _manifests,
};
