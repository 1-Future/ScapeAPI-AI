// ══════════════════════════════════════════════════════════════════════════════
// Content Loader — bridge builder_entities (Postgres) → engine data modules
//
// At startup, queries builder_entities grouped by tab_id and dispatches each
// entity to the appropriate engine define() function. Hardcoded content in
// src/data/*.js stays as defaults; builder content overlays on top.
//
// This is the P0.3 bridge that makes builder-authored content live in the game.
// ══════════════════════════════════════════════════════════════════════════════

const db = require('../db');
const items = require('../data/items');
const npcs = require('../world/npcs');
const shops = require('../data/shops');
const quests = require('../data/quests');
const droptables = require('../data/droptables');
const slayer = require('../data/slayer');
const recipes = require('../data/recipes');

// ── Tab → loader mapping ───────────────────────────────────────────────────
// Each loader takes (name, data) from a builder_entity row and calls the
// engine's define() function with the right shape.

const LOADERS = {
  items: loadItem,
  equipment: loadItem,        // equipment is items with equipSlot
  monsters: loadMonster,
  bosses: loadBoss,
  shops: loadShop,
  quests: loadQuest,
  npcs: loadNpc,
  crafting: loadRecipe,
};

// ── Item loader ────────────────────────────────────────────────────────────

function loadItem(name, data) {
  items.define({
    id: data.id || undefined,
    name: name,
    examine: data.examine || data.description || '',
    tradeable: data.tradeable !== false,
    stackable: data.stackable || false,
    weight: data.weight || 0,
    value: data.value || 0,
    equipSlot: data.equipSlot || data.equip_slot || null,
    equipReqs: data.equipReqs || data.equip_reqs || {},
    stats: data.stats || {},
    speed: data.speed || null,
    members: data.members || false,
    category: data.category || 'misc',
  });
}

// ── Monster loader ─────────────────────────────────────────────────────────

function loadMonster(name, data) {
  const defId = data.defId || data.def_id || name.toLowerCase().replace(/\s+/g, '_');
  npcs.defineNpc(defId, {
    name: name,
    examine: data.examine || data.description || 'A monster.',
    combat: data.combat || data.combatLevel || data.combat_level || 0,
    maxHp: data.maxHp || data.max_hp || data.hp || 1,
    stats: data.stats || {},
    attackSpeed: data.attackSpeed || data.attack_speed || 4,
    attackRange: data.attackRange || data.attack_range || 1,
    maxHit: data.maxHit || data.max_hit || 1,
    size: data.size || 1,
    aggressive: data.aggressive || false,
    aggroRange: data.aggroRange || data.aggro_range || 3,
    wanderRadius: data.wanderRadius || data.wander_radius || 5,
    respawnTicks: data.respawnTicks || data.respawn_ticks || 50,
    drops: data.drops || [],
    dialogue: data.dialogue || null,
    attackStyle: data.attackStyle || data.attack_style || 'melee',
    poisonDamage: data.poisonDamage || data.poison_damage || 0,
  });

  // If drops are defined as a separate structure, load them too
  if (data.dropTable || data.drop_table) {
    const dt = data.dropTable || data.drop_table;
    droptables.define(defId, {
      always: dt.always || [],
      main: dt.main || [],
      tertiary: dt.tertiary || [],
    });
  }
}

// ── Boss loader ────────────────────────────────────────────────────────────
// Bosses are monsters with phases. The base NPC def is loaded as a monster,
// phase data is stored for the instance system to read.

function loadBoss(name, data) {
  // Load the base NPC definition
  loadMonster(name, data);

  // If phases are defined, store them for the instance/playable system
  if (data.phases && Array.isArray(data.phases)) {
    const defId = data.defId || data.def_id || name.toLowerCase().replace(/\s+/g, '_');
    const registry = require('./content-registry');

    // Only register as playable if it has enough structure
    if (data.phases.length > 0) {
      try {
        registry.registerPlayable(defId, {
          name: name,
          description: data.description || data.examine || '',
          source: 'builder',
          challenges: data.challenges || { full: { description: `Full ${name} fight` } },
          mobDefs: [defId, ...(data.addMobs || data.add_mobs || [])],
          phases: { count: data.phases.length, names: data.phases.map(p => p.name || `Phase ${p}`) },
          loadout: data.loadout || {
            level: 99, hpLevel: 99,
            equipment: [], inventory: [], prayers: [],
          },
          actionSpace: registry.buildActionSpace(data.actionSpace || [
            'noop', 'brew', 'restore', 'move_n', 'move_s', 'move_e', 'move_w',
            'target_boss', 'target_adds', 'pray_mage', 'pray_range', 'pray_melee', 'noop',
          ]),
        });
      } catch (err) {
        console.warn(`[content-loader] Could not register boss "${name}" as playable:`, err.message);
      }
    }
  }
}

// ── NPC loader (non-combat) ────────────────────────────────────────────────

function loadNpc(name, data) {
  const defId = data.defId || data.def_id || name.toLowerCase().replace(/\s+/g, '_');
  npcs.defineNpc(defId, {
    name: name,
    examine: data.examine || data.description || 'An NPC.',
    combat: 0,
    maxHp: data.maxHp || data.max_hp || 1,
    size: 1,
    aggressive: false,
    wanderRadius: data.wanderRadius || data.wander_radius || 3,
    respawnTicks: data.respawnTicks || 100,
    dialogue: data.dialogue || null,
    canMove: data.canMove !== undefined ? data.canMove : true,
  });
}

// ── Shop loader ────────────────────────────────────────────────────────────

function loadShop(name, data) {
  const shopId = data.id || name.toLowerCase().replace(/\s+/g, '_');
  shops.define(shopId, {
    name: name,
    npc: data.npc || null,
    type: data.type || 'specialty',
    stock: (data.stock || []).map(s => ({
      id: s.id || s.itemId || s.item_id,
      name: s.name || s.itemName || s.item_name,
      base: s.base || s.quantity || 10,
      price: s.price || s.value || 1,
    })),
    restockRate: data.restockRate || data.restock_rate || 100,
  });
}

// ── Quest loader ───────────────────────────────────────────────────────────

function loadQuest(name, data) {
  const questId = data.id || name.toLowerCase().replace(/\s+/g, '_');
  quests.define(questId, {
    name: name,
    description: data.description || '',
    difficulty: data.difficulty || 'Novice',
    questPoints: data.questPoints || data.quest_points || 1,
    requirements: data.requirements || {},
    steps: (data.steps || []).map(s => ({
      text: s.text || s.description || '',
      action: s.action || null,
      check: s.check || null,
    })),
    rewards: data.rewards || {},
  });
}

// ── Recipe loader ──────────────────────────────────────────────────────────

function loadRecipe(name, data) {
  if (recipes.define) {
    recipes.define({
      name: name,
      skill: data.skill || 'crafting',
      level: data.level || 1,
      xp: data.xp || 0,
      inputs: data.inputs || data.ingredients || [],
      outputs: data.outputs || data.products || [{ name: name, count: 1 }],
      ticks: data.ticks || 3,
    });
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN LOADER — call this at server startup after DB connects
// ══════════════════════════════════════════════════════════════════════════════

let _loaded = false;

async function loadAllContent() {
  if (_loaded) return;

  try {
    const rows = await db.queryAll(
      'SELECT tab_id, name, data FROM builder_entities ORDER BY tab_id, name'
    );

    let loaded = 0;
    let skipped = 0;
    const tabCounts = {};

    for (const row of rows) {
      const loader = LOADERS[row.tab_id];
      if (loader) {
        try {
          const data = typeof row.data === 'string' ? JSON.parse(row.data) : (row.data || {});
          loader(row.name, data);
          loaded++;
          tabCounts[row.tab_id] = (tabCounts[row.tab_id] || 0) + 1;
        } catch (err) {
          console.warn(`[content-loader] Failed to load ${row.tab_id}/${row.name}:`, err.message);
          skipped++;
        }
      }
      // Tabs without loaders (lore-bible, npc-personas, cfg-*, ref-*, etc.)
      // are stored in builder_entities and served via the content API / Codex.
      // They don't need engine-side loading.
    }

    _loaded = true;

    if (loaded > 0) {
      const summary = Object.entries(tabCounts).map(([k, v]) => `${k}:${v}`).join(', ');
      console.log(`[content-loader] Loaded ${loaded} builder entities into engine (${summary})`);
    }
    if (skipped > 0) {
      console.warn(`[content-loader] Skipped ${skipped} entities due to errors`);
    }
  } catch (err) {
    // DB not available — no builder content loaded, engine runs with hardcoded only
    console.warn('[content-loader] Could not load builder content:', err.message);
    console.warn('[content-loader] Engine will run with hardcoded content only.');
  }
}

// ── Hot reload — call after a builder save to refresh a single entity ──────

async function reloadEntity(tabId, entityId) {
  const loader = LOADERS[tabId];
  if (!loader) return false;

  try {
    const row = await db.queryOne(
      'SELECT tab_id, name, data FROM builder_entities WHERE id = $1',
      [entityId]
    );
    if (!row) return false;
    const data = typeof row.data === 'string' ? JSON.parse(row.data) : (row.data || {});
    loader(row.name, data);
    console.log(`[content-loader] Hot-reloaded ${tabId}/${row.name}`);
    return true;
  } catch (err) {
    console.warn(`[content-loader] Hot-reload failed for ${tabId}/${entityId}:`, err.message);
    return false;
  }
}

// ══════════════════════════════════════════════════════════════════════════════

module.exports = { loadAllContent, reloadEntity, LOADERS };
