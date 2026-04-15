// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Sawmill Recipes (burn v2)
//
// Plank-and-nails supply chain for player housing. Sawmills convert raw logs
// (from Woodcutting) into planks consumed by src/engine/housing.js buildRoom.
//
// Recipe shape matches src/data/recipes.js:
//   { id, skill, name, inputs:[{id, count}], outputs:[{id, count}],
//     level, xp, ticks, station, tool? }
//
// Base plank conversions (logs -> planks) and burn-v2 extensions:
//   - make_plank           (lvl  1, logs -> plank 700)
//   - make_oak_plank       (lvl 15, oak logs -> oak plank 701)
//   - make_teak_plank      (lvl 35, yew logs -> teak plank 702)    [alias]
//   - make_mahogany_plank  (lvl 50, magic logs -> mahogany plank 703) [alias]
//   - make_yew_plank       (lvl 60, yew logs -> yew plank 72000)
//   - make_magic_plank     (lvl 75, magic logs -> magic plank 72001)
//   - make_marble_plank    (lvl 85, marble block + 2 mahogany -> marble 72002)
//   - bulk batch variants (10 logs -> 10 planks + 1 contract)
//   - redeem_sawmill_contract (contract + 5 logs -> 10 planks)
//
// Nail supply chain: rel.defineCombination for Nails (704) and Steel nails (705).
//
// Training methods: two Construction training methods via rel.defineTrainingMethod
// covering mahogany plank-running and teak bulk contract running.
//
// /craft <plank-id> runs these through src/engine/recipe-runner.js which in turn
// ticks player housing progress via housing.notifyConstructionXp.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const recipes = require('../../data/recipes');
const items = require('../../data/items');
const rel = require('../../data/relationships');

// ── Burn-v2 plank & ingredient items (IDs 72000-72099) ─────────────────────
//
// The vanilla planks (700-703) are already defined in src/data/items.js. The
// burn-v2 extensions below add Yew, Magic, Marble, plus the Sawmill contract.

let itemCount = 0;
function itm(def) {
  // Guard against double-define (hot reload, repeated tests).
  if (items.get(def.id)) return;
  items.define(def);
  itemCount++;
}

itm({ id: 72000, name: 'Yew plank',        examine: 'A cured yew plank. Rare and slow to season.',        value: 3000, category: 'construction', weight: 1.4 });
itm({ id: 72001, name: 'Magic plank',      examine: 'A magic plank; seems to hold more than its weight.', value: 6500, category: 'construction', weight: 1.2, members: true });
itm({ id: 72002, name: 'Marble plank',     examine: 'Not truly a plank — a milled marble slab.',          value: 9000, category: 'construction', weight: 2.2, members: true });
itm({ id: 72003, name: 'Sawmill contract', examine: 'Pre-paid sawmill order. Exchange at any sawmill.',   value: 250,  category: 'construction', weight: 0, stackable: true });
itm({ id: 72004, name: 'Marble block',     examine: 'A raw block of unworked marble.',                    value: 5000, category: 'construction', weight: 3.0 });

// ── Recipes ────────────────────────────────────────────────────────────────

let recipeCount = 0;
function r(def) {
  // Skip if a recipe with this id already exists.
  if (def.id && recipes.findById && recipes.findById(def.id)) return def;
  recipes.define(def);
  recipeCount++;
  return def;
}

// Base tier-1 plank conversions. These mirror the RuneScape sawmill economy:
// pay the sawmill, hand over logs, get planks, gain Construction XP.
r({ id: 'make_plank', skill: 'construction', name: 'Plank',
  inputs: [{ id: 200, count: 1 }],                // Logs
  outputs: [{ id: 700, count: 1 }],               // Plank
  level: 1, xp: 29, ticks: 3, station: 'sawmill' });

r({ id: 'make_oak_plank', skill: 'construction', name: 'Oak plank',
  inputs: [{ id: 201, count: 1 }],                // Oak logs
  outputs: [{ id: 701, count: 1 }],               // Oak plank
  level: 15, xp: 60, ticks: 3, station: 'sawmill' });

r({ id: 'make_teak_plank', skill: 'construction', name: 'Teak plank',
  // Teak-equivalent: in Aelgard, yew logs play the teak role until a true
  // teak log is added. The plank output is still the canonical teak-plank id.
  inputs: [{ id: 204, count: 1 }],                // Yew logs (teak stand-in)
  outputs: [{ id: 702, count: 1 }],               // Teak plank
  level: 35, xp: 90, ticks: 3, station: 'sawmill' });

r({ id: 'make_mahogany_plank', skill: 'construction', name: 'Mahogany plank',
  // Mahogany-equivalent: magic logs until a true mahogany log is added.
  inputs: [{ id: 205, count: 1 }],                // Magic logs (mahogany stand-in)
  outputs: [{ id: 703, count: 1 }],               // Mahogany plank
  level: 50, xp: 140, ticks: 3, station: 'sawmill' });

// Burn-v2 premium extensions.
r({ id: 'make_yew_plank', skill: 'construction', name: 'Yew plank',
  inputs: [{ id: 204, count: 1 }],                // Yew logs
  outputs: [{ id: 72000, count: 1 }],
  level: 60, xp: 200, ticks: 3, station: 'sawmill' });

r({ id: 'make_magic_plank', skill: 'construction', name: 'Magic plank',
  inputs: [{ id: 205, count: 1 }],                // Magic logs
  outputs: [{ id: 72001, count: 1 }],
  level: 75, xp: 280, ticks: 3, station: 'sawmill' });

r({ id: 'make_marble_plank', skill: 'construction', name: 'Marble plank',
  // Marble is a premium ingredient — requires 1 marble block (72004) plus
  // 2 mahogany planks as a bracing frame.
  inputs: [
    { id: 72004, count: 1, name: 'Marble block' },
    { id: 703,   count: 2, name: 'Mahogany plank' },
  ],
  outputs: [{ id: 72002, count: 1 }],
  level: 85, xp: 420, ticks: 4, station: 'sawmill' });

// ── Bulk batch recipes: 10 logs -> 10 planks + 1 sawmill contract ──────────
// Used by the /craft plank command runner to save clicks on long sessions.
// Contract is a per-10-log bonus: redeemable at sawmills for free conversion.
r({ id: 'make_planks_bulk_basic', skill: 'construction', name: 'Planks (bulk)',
  inputs: [{ id: 200, count: 10 }],
  outputs: [
    { id: 700, count: 10 },
    { id: 72003, count: 1 },
  ],
  level: 10, xp: 290, ticks: 10, station: 'sawmill' });

r({ id: 'make_planks_bulk_oak', skill: 'construction', name: 'Oak planks (bulk)',
  inputs: [{ id: 201, count: 10 }],
  outputs: [
    { id: 701, count: 10 },
    { id: 72003, count: 1 },
  ],
  level: 25, xp: 600, ticks: 10, station: 'sawmill' });

r({ id: 'make_planks_bulk_teak', skill: 'construction', name: 'Teak planks (bulk)',
  inputs: [{ id: 204, count: 10 }],
  outputs: [
    { id: 702, count: 10 },
    { id: 72003, count: 1 },
  ],
  level: 45, xp: 900, ticks: 10, station: 'sawmill' });

r({ id: 'make_planks_bulk_mahogany', skill: 'construction', name: 'Mahogany planks (bulk)',
  inputs: [{ id: 205, count: 10 }],
  outputs: [
    { id: 703, count: 10 },
    { id: 72003, count: 1 },
  ],
  level: 55, xp: 1400, ticks: 10, station: 'sawmill' });

// ── Sawmill-contract redemption: 1 contract + 5 logs -> 10 planks ──────────
// No XP — it's a prepaid delivery.
r({ id: 'redeem_sawmill_contract', skill: 'construction', name: 'Redeem sawmill contract',
  inputs: [
    { id: 72003, count: 1 },
    { id: 200,   count: 5 },
  ],
  outputs: [{ id: 700, count: 10 }],
  level: 10, xp: 0, ticks: 2, station: 'sawmill' });

// ══════════════════════════════════════════════════════════════════════════════
// Nail supply chain (reagent combinations)
// ══════════════════════════════════════════════════════════════════════════════
// A bronze bar (id 250) hammered on an anvil yields 15 nails (id 704).
// A steel bar (id 252) yields 15 steel nails (id 705). These are combinations
// so the reagent-system codex finds them alongside plank recipes.

rel.defineCombination(704, {                     // Nails id 704
  resultName: 'Nails (15)', skill: 'smithing', level: 5, xp: 12,
  inputs: [{ id: 250, count: 1, name: 'Bronze bar', consumed: true }],
  station: 'anvil',
  description: 'Hammer a bronze bar into 15 common nails. Feeds the housing-tier-1 supply chain.',
});

rel.defineCombination(705, {                     // Steel nails id 705
  resultName: 'Steel nails (15)', skill: 'smithing', level: 30, xp: 18,
  inputs: [{ id: 252, count: 1, name: 'Steel bar', consumed: true }],
  station: 'anvil',
  description: 'Steel nails. Required for mahogany-tier rooms and endgame furniture.',
});

// ══════════════════════════════════════════════════════════════════════════════
// Item sources (codex visibility)
// ══════════════════════════════════════════════════════════════════════════════

rel.registerItemSource(700, { type: 'recipe', sourceId: 'make_plank',
  sourceName: 'Plank (sawmill)', region: 'heartlands',
  details: 'Construction 1, logs at any sawmill. 29 XP per plank.',
});
rel.registerItemSource(701, { type: 'recipe', sourceId: 'make_oak_plank',
  sourceName: 'Oak plank (sawmill)', region: 'heartlands',
  details: 'Construction 15, oak logs. 60 XP per plank.',
});
rel.registerItemSource(702, { type: 'recipe', sourceId: 'make_teak_plank',
  sourceName: 'Teak plank (sawmill)', region: 'heartlands',
  details: 'Construction 35, yew logs (teak stand-in). 90 XP per plank.',
});
rel.registerItemSource(703, { type: 'recipe', sourceId: 'make_mahogany_plank',
  sourceName: 'Mahogany plank (sawmill)', region: 'heartlands',
  details: 'Construction 50, magic logs (mahogany stand-in). 140 XP per plank.',
});
rel.registerItemSource(72000, { type: 'recipe', sourceId: 'make_yew_plank',
  sourceName: 'Yew plank (sawmill)', region: 'heartlands',
  details: 'Construction 60, yew logs. 200 XP per plank.',
});
rel.registerItemSource(72001, { type: 'recipe', sourceId: 'make_magic_plank',
  sourceName: 'Magic plank (sawmill)', region: 'inkweald',
  details: 'Construction 75, magic logs. 280 XP per plank.',
});
rel.registerItemSource(72002, { type: 'recipe', sourceId: 'make_marble_plank',
  sourceName: 'Marble plank (sawmill)', region: 'sootworks',
  details: 'Construction 85; marble block + 2 mahogany planks. 420 XP.',
});
rel.registerItemSource(72003, { type: 'recipe', sourceId: 'make_planks_bulk_basic',
  sourceName: 'Sawmill contract', region: 'heartlands',
  details: 'Bulk-milling bonus (1 per 10 logs). Redeemable at any sawmill for 10 free planks plus 5 logs.',
});

// ══════════════════════════════════════════════════════════════════════════════
// Training methods: two Construction methods via rel.defineTrainingMethod
// ══════════════════════════════════════════════════════════════════════════════

rel.defineTrainingMethod('sawmill_mahogany_planking', {
  skill: 'construction',
  name: 'Sawmill Plank-Running (Mahogany)',
  levelRange: [50, 99],
  xpPerHour: 180000,
  prerequisites: { skills: { construction: 50 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ id: 703, name: 'Mahogany plank', perHour: 1300 }], net: 'neutral' },
  bankingFrequency: 'frequent', costPerHour: 1950000,
  danger: 'none', complexity: 'simple', attention: 'medium',
  inputs: [
    { name: 'Mahogany logs', perHour: 1300, source: 'woodcutting' },
    { name: 'Coins (sawmill fee)', perHour: 650000, source: 'currency' },
  ],
  description: 'Classic plank-running: run mahogany logs through the sawmill, pay per plank, bank, repeat. The buyable fast-XP method.',
  location: 'Sawmill (any region)',
  breakpointAt: 50,
});

rel.defineTrainingMethod('sawmill_bulk_teak_contracts', {
  skill: 'construction',
  name: 'Sawmill Bulk Teak Contracts',
  levelRange: [35, 80],
  xpPerHour: 125000,
  prerequisites: { skills: { construction: 35, woodcutting: 35 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [
    { id: 702, name: 'Teak plank', perHour: 1600 },
    { id: 72003, name: 'Sawmill contract', perHour: 160 },
  ], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'simple', attention: 'low',
  inputs: [{ name: 'Teak logs', perHour: 1600, source: 'woodcutting' }],
  description: 'Batch 10 teak logs per contract. Slower XP than mahogany plank-running, but net profit and less clicking.',
  location: 'Sawmill (any region)',
  breakpointAt: 35,
});

// ── Nail training methods (feeds the housing supply chain) ────────────────
rel.defineTrainingMethod('anvil_nail_smithing_steel', {
  skill: 'smithing',
  name: 'Steel nail smithing',
  levelRange: [30, 60],
  xpPerHour: 42000,
  prerequisites: { skills: { smithing: 30 }, quests: [], items: [], areas: [] },
  resourceOutput: { produces: [{ id: 705, name: 'Steel nails', perHour: 2800 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'simple', attention: 'low',
  inputs: [{ name: 'Steel bar', perHour: 180, source: 'smelting' }],
  description: 'Feed the housing supply chain: steel bars -> steel nails at the anvil.',
  location: 'Anvil (any region)',
});

function stats() {
  return { items: itemCount, recipes: recipeCount };
}

console.log(`[sawmill-recipes] ${itemCount} items, ${recipeCount} recipes, 1 training method, 2 combinations`);

module.exports = { stats };
