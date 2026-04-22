// ══════════════════════════════════════════════════════════════════════════════
// Stub intensity catalog.
//
// Used ONLY as a fallback when data/intensity-catalog.json is missing. The
// real catalog is produced by agent 1 on the burn-v0.8 wave. When that file
// lands, loadCatalog() prefers it. The stub is intentionally small but hits
// every category + every intensity tier so the diagnostic produces meaningful
// ratios even without the real content.
//
// Shape each entry matches the runner's expectations:
//   {
//     id:           'mining::copper-rock',
//     skill:        'mining',
//     intensity:    1-5,
//     time_ms:      ms per execution (clock budget, not drain)
//     base_output:  { xp: { <skill>: n }, gp: n, items: [{id,qty}] }
//     requires:     { level?: {skill:n}, items?:[{id,qty}], quest?:'id', area?:'name' }
//     region:       Aelgard region name
//     unlocks:      optional progression node id
//   }
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const fs = require('fs');
const path = require('path');

// Normalise a real-catalog entry into the runner's expected shape.
// Real shape (agent 4): { activity_id, skill, intensity, base_xp_per_hour,
//   base_gp_per_hour, region, level_required, gating: {quests, items, areas} }
// Runner shape: { id, skill, intensity, time_ms, region, base_output, requires }
function normaliseEntry(e) {
  if (e.base_output) return e; // already our shape

  // Derive time_ms from intensity (approx). Higher intensity → shorter tick.
  const intensity = Math.max(1, Math.min(10, e.intensity || 2));
  const time_ms = Math.max(1200, Math.round(4800 / Math.sqrt(intensity)));

  // Per-action XP/GP derived from per-hour rates and time_ms.
  const perHourScale = time_ms / (3600 * 1000);
  const xpPer = (e.base_xp_per_hour || 0) * perHourScale;
  const gpPer = (e.base_gp_per_hour || 0) * perHourScale;

  const xpObj = {};
  if (e.skill && xpPer > 0) xpObj[e.skill] = xpPer;

  const requires = {};
  if (e.level_required && e.skill) {
    requires.level = { [e.skill]: e.level_required };
  }
  if (e.gating) {
    if (Array.isArray(e.gating.quests) && e.gating.quests.length) {
      requires.quest = e.gating.quests[0]; // first quest is the gating quest
    }
    if (Array.isArray(e.gating.items) && e.gating.items.length) {
      requires.items = e.gating.items.map(id => ({ id, qty: 1 }));
    }
  }

  // Intensity clamp — the runner's bar model assumes 1-5. Squash 6-10 to 5.
  const runnerIntensity = Math.min(5, intensity);

  return {
    id:           e.activity_id || e.id || `unknown-${Math.random().toString(36).slice(2, 7)}`,
    skill:        e.skill,
    intensity:    runnerIntensity,
    time_ms,
    region:       e.region,
    base_output:  { xp: xpObj, gp: gpPer },
    requires:     Object.keys(requires).length ? requires : undefined,
    _source:      'real',
  };
}

function loadRealCatalog() {
  const p = path.join(__dirname, '..', '..', 'data', 'intensity-catalog.json');
  try {
    if (fs.existsSync(p)) {
      const raw = fs.readFileSync(p, 'utf8');
      const data = JSON.parse(raw);
      let entries = null;
      if (Array.isArray(data)) entries = data;
      else if (Array.isArray(data.activities)) entries = data.activities;
      if (entries && entries.length) return entries.map(normaliseEntry);
    }
  } catch (e) {
    // fall through to stub
  }
  return null;
}

// ─── Stub catalog ──────────────────────────────────────────────────────────
// 30 entries spanning the 5 intensities and 5 categories. Numbers are
// deliberately round — this is a calibration *probe*, not live content.
const STUB = [
  // Gathering — low cost, steady output. Intensity 1-3.
  { id: 'mining::copper',    skill: 'mining',     intensity: 1, time_ms: 3000, region: 'Heartlands',  base_output: { xp: { mining:    17.5 }, gp:   3, items: [{id:'copper-ore',qty:1}] } },
  { id: 'mining::tin',       skill: 'mining',     intensity: 1, time_ms: 3000, region: 'Heartlands',  base_output: { xp: { mining:    17.5 }, gp:   3, items: [{id:'tin-ore',qty:1}] } },
  { id: 'mining::iron',      skill: 'mining',     intensity: 1, time_ms: 2400, region: 'Sootworks',   base_output: { xp: { mining:    35   }, gp:  10, items: [{id:'iron-ore',qty:1}] }, requires: { level: { mining: 15 } } },
  { id: 'mining::coal',      skill: 'mining',     intensity: 2, time_ms: 3600, region: 'Sootworks',   base_output: { xp: { mining:    50   }, gp:  40, items: [{id:'coal',qty:1}] },     requires: { level: { mining: 30 } } },
  { id: 'mining::mithril',   skill: 'mining',     intensity: 3, time_ms: 4800, region: 'Moryskah',    base_output: { xp: { mining:    80   }, gp: 160, items: [{id:'mithril-ore',qty:1}] }, requires: { level: { mining: 55 } } },
  { id: 'mining::runite',    skill: 'mining',     intensity: 5, time_ms: 7200, region: 'Wilds',       base_output: { xp: { mining:   125   }, gp:2500, items: [{id:'runite-ore',qty:1}] }, requires: { level: { mining: 85 } } },

  { id: 'wc::tree',          skill: 'woodcutting',intensity: 1, time_ms: 3000, region: 'Heartlands',  base_output: { xp: { woodcutting: 25 }, gp:   5, items: [{id:'logs',qty:1}] } },
  { id: 'wc::oak',           skill: 'woodcutting',intensity: 1, time_ms: 3600, region: 'Heartlands',  base_output: { xp: { woodcutting: 37.5}, gp:  18, items: [{id:'oak-logs',qty:1}] }, requires: { level: { woodcutting: 15 } } },
  { id: 'wc::willow',        skill: 'woodcutting',intensity: 1, time_ms: 4800, region: 'Saltbrine',   base_output: { xp: { woodcutting: 67.5}, gp:  38, items: [{id:'willow-logs',qty:1}] }, requires: { level: { woodcutting: 30 } } },
  { id: 'wc::yew',           skill: 'woodcutting',intensity: 2, time_ms: 6000, region: 'Veilwood',    base_output: { xp: { woodcutting:175   }, gp: 320, items: [{id:'yew-logs',qty:1}] }, requires: { level: { woodcutting: 60 } } },
  { id: 'wc::magic',         skill: 'woodcutting',intensity: 3, time_ms: 7200, region: 'Veilwood',    base_output: { xp: { woodcutting:250   }, gp:1000, items: [{id:'magic-logs',qty:1}] }, requires: { level: { woodcutting: 75 } } },

  { id: 'fish::shrimp',      skill: 'fishing',    intensity: 1, time_ms: 3000, region: 'Heartlands',  base_output: { xp: { fishing:    10 }, gp:   4, items: [{id:'raw-shrimp',qty:1}] } },
  { id: 'fish::trout',       skill: 'fishing',    intensity: 1, time_ms: 4000, region: 'Saltbrine',   base_output: { xp: { fishing:    50 }, gp:  22, items: [{id:'raw-trout',qty:1}] }, requires: { level: { fishing: 20 } } },
  { id: 'fish::lobster',     skill: 'fishing',    intensity: 2, time_ms: 4800, region: 'Saltbrine',   base_output: { xp: { fishing:    90 }, gp: 120, items: [{id:'raw-lobster',qty:1}] }, requires: { level: { fishing: 40 } } },
  { id: 'fish::shark',       skill: 'fishing',    intensity: 3, time_ms: 6000, region: 'Saltbrine',   base_output: { xp: { fishing:   110 }, gp: 900, items: [{id:'raw-shark',qty:1}] }, requires: { level: { fishing: 76 } } },

  // Processing — convert gathered goods. Intensity 2-3.
  { id: 'cook::shrimp',      skill: 'cooking',    intensity: 1, time_ms: 1800, region: 'Heartlands',  base_output: { xp: { cooking:    30 }, gp:   8 }, requires: { items: [{id:'raw-shrimp',qty:1}] } },
  { id: 'cook::trout',       skill: 'cooking',    intensity: 2, time_ms: 2400, region: 'Heartlands',  base_output: { xp: { cooking:    70 }, gp:  35 }, requires: { items: [{id:'raw-trout',qty:1}], level:{cooking:15} } },
  { id: 'cook::lobster',     skill: 'cooking',    intensity: 2, time_ms: 2400, region: 'Heartlands',  base_output: { xp: { cooking:   120 }, gp: 160 }, requires: { items: [{id:'raw-lobster',qty:1}], level:{cooking:40} } },
  { id: 'smelt::bronze',     skill: 'smithing',   intensity: 2, time_ms: 2400, region: 'Sootworks',   base_output: { xp: { smithing:    6.2}, gp:  20 }, requires: { items: [{id:'copper-ore',qty:1},{id:'tin-ore',qty:1}] } },
  { id: 'smelt::iron',       skill: 'smithing',   intensity: 2, time_ms: 2400, region: 'Sootworks',   base_output: { xp: { smithing:   12.5}, gp:  50 }, requires: { items: [{id:'iron-ore',qty:1}], level:{smithing:15} } },
  { id: 'smelt::steel',      skill: 'smithing',   intensity: 3, time_ms: 3000, region: 'Sootworks',   base_output: { xp: { smithing:   17.5}, gp: 200 }, requires: { items: [{id:'iron-ore',qty:1},{id:'coal',qty:2}], level:{smithing:30} } },

  // Support — intensity 1, off-peak.
  { id: 'fm::logs',          skill: 'firemaking', intensity: 1, time_ms: 2400, region: 'Heartlands',  base_output: { xp: { firemaking: 40 }, gp:   0 }, requires: { items: [{id:'logs',qty:1}] } },
  { id: 'fm::oak',           skill: 'firemaking', intensity: 1, time_ms: 2400, region: 'Heartlands',  base_output: { xp: { firemaking: 60 }, gp:   0 }, requires: { items: [{id:'oak-logs',qty:1}], level:{firemaking:15} } },
  { id: 'agility::heartlands',skill: 'agility',   intensity: 2, time_ms: 7000, region: 'Heartlands',  base_output: { xp: { agility:    360 }, gp:   0 } },
  { id: 'agility::wilds',    skill: 'agility',    intensity: 3, time_ms:10000, region: 'Wilds',       base_output: { xp: { agility:    900 }, gp:   0 }, requires: { level: { agility: 60 } } },

  // Combat — intensity 3-5, high output per tick.
  { id: 'combat::goblin',    skill: 'attack',     intensity: 3, time_ms: 6000, region: 'Heartlands',  base_output: { xp: { attack: 40, strength:40, hitpoints:13, defence:40 }, gp:  30 } },
  { id: 'combat::moss-giant',skill: 'attack',     intensity: 3, time_ms:12000, region: 'Inkweald',    base_output: { xp: { attack:220, strength:220, hitpoints:73, defence:220 }, gp: 200 }, requires: { level: { attack: 40 } } },
  { id: 'combat::dragon',    skill: 'attack',     intensity: 5, time_ms:24000, region: 'Wilds',       base_output: { xp: { attack:600, strength:600, hitpoints:200, defence:600 }, gp:4000 }, requires: { level: { attack: 60 } } },

  // Exploration — thieving / quests as proxies.
  { id: 'thieve::farmer',    skill: 'thieving',   intensity: 2, time_ms: 1500, region: 'Heartlands',  base_output: { xp: { thieving: 14.5 }, gp:  40 } },
  { id: 'thieve::stall',     skill: 'thieving',   intensity: 3, time_ms: 4800, region: 'Moryskah',    base_output: { xp: { thieving: 80 }, gp: 280 }, requires: { level: { thieving: 50 } } },

  // Quest proxy — lets the planner earn quest flags.
  { id: 'quest::cook-assistant', skill: 'quest',  intensity: 2, time_ms:18000, region: 'Heartlands',  base_output: { xp: { cooking:300 }, gp: 500, quest:'cook-assistant' } },
  { id: 'quest::tree-gnome',     skill: 'quest',  intensity: 3, time_ms:36000, region: 'Veilwood',    base_output: { xp: { attack:11450, agility:4250 }, gp:1500, quest:'tree-gnome' }, requires: { level: { agility: 25 } } },
];

function loadCatalog() {
  const real = loadRealCatalog();
  if (real && real.length) return { source: 'real', catalog: real };
  return { source: 'stub', catalog: STUB };
}

module.exports = { loadCatalog, STUB };
