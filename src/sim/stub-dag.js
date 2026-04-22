// ══════════════════════════════════════════════════════════════════════════════
// Stub progression DAG.
//
// Used as a fallback when data/progression-dag.json is missing. The real DAG
// will be produced by agent 3 on this burn. Stub provides enough nodes to
// let the goal planner do latent-goal scoring.
//
// Shape:
//   { nodes: { <id>: {label, requires:{level?,quest?,items?}, rewards:{unlocks?:[]}} },
//     edges: [[from, to], ...] }
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const fs = require('fs');
const path = require('path');

// Normalise the real DAG into the runner's shape.
// Real: { nodes: [{id, type, name, requires: ['skill:mining:25','quest:foo']}] }
// Runner: { nodes: { id: { label, requires: {level?, quest?, items?} } } }
function normaliseRealDag(data) {
  if (!data || !Array.isArray(data.nodes)) return null;

  const nodes = Object.create(null);
  for (const n of data.nodes) {
    const reqs = { level: {}, items: [] };
    let questReq = null;
    for (const r of (n.requires || [])) {
      if (typeof r !== 'string') continue;
      if (r.startsWith('skill:')) {
        const [, skill, lvl] = r.split(':');
        const parsed = parseInt(lvl, 10);
        if (skill && parsed > 0) reqs.level[skill] = Math.max(reqs.level[skill] || 0, parsed);
      } else if (r.startsWith('quest:')) {
        const q = r.slice(6);
        if (q && !questReq) questReq = q;
      } else if (r.startsWith('item:')) {
        const id = r.slice(5);
        if (id) reqs.items.push({ id, qty: 1 });
      }
    }
    const clean = {};
    if (Object.keys(reqs.level).length) clean.level = reqs.level;
    if (questReq) clean.quest = questReq;
    if (reqs.items.length) clean.items = reqs.items;

    nodes[n.id] = {
      label:    n.name || n.id,
      type:     n.type || 'node',
      region:   n.region || null,
      requires: clean,
      rewards:  { unlocks: [] }, // real DAG doesn't list action unlocks yet
    };
  }
  return { nodes, edges: [] };
}

function loadRealDag() {
  const p = path.join(__dirname, '..', '..', 'data', 'progression-dag.json');
  try {
    if (fs.existsSync(p)) {
      const raw = fs.readFileSync(p, 'utf8');
      const data = JSON.parse(raw);
      // If already in our shape, use directly.
      if (data && data.nodes && !Array.isArray(data.nodes)) return data;
      // Otherwise normalise.
      const normalised = normaliseRealDag(data);
      if (normalised && Object.keys(normalised.nodes).length) return normalised;
    }
  } catch (e) { /* fall through */ }
  return null;
}

const STUB_DAG = {
  nodes: {
    'start':                  { label: 'Start (Heartlands)',      requires: {},                                          rewards: { unlocks: ['mining::copper','mining::tin','wc::tree','fish::shrimp','combat::goblin'] } },
    'mining-15':              { label: 'Mining 15 — iron',        requires: { level: { mining: 15 } },                   rewards: { unlocks: ['mining::iron'] } },
    'mining-30':              { label: 'Mining 30 — coal',        requires: { level: { mining: 30 } },                   rewards: { unlocks: ['mining::coal'] } },
    'mining-55':              { label: 'Mining 55 — mithril',     requires: { level: { mining: 55 } },                   rewards: { unlocks: ['mining::mithril'] } },
    'mining-85':              { label: 'Mining 85 — runite',      requires: { level: { mining: 85 } },                   rewards: { unlocks: ['mining::runite'] } },
    'wc-15':                  { label: 'WC 15 — oaks',            requires: { level: { woodcutting: 15 } },              rewards: { unlocks: ['wc::oak'] } },
    'wc-30':                  { label: 'WC 30 — willows',         requires: { level: { woodcutting: 30 } },              rewards: { unlocks: ['wc::willow'] } },
    'wc-60':                  { label: 'WC 60 — yews',            requires: { level: { woodcutting: 60 } },              rewards: { unlocks: ['wc::yew'] } },
    'wc-75':                  { label: 'WC 75 — magic',           requires: { level: { woodcutting: 75 } },              rewards: { unlocks: ['wc::magic'] } },
    'fish-20':                { label: 'Fishing 20 — trout',      requires: { level: { fishing: 20 } },                  rewards: { unlocks: ['fish::trout'] } },
    'fish-40':                { label: 'Fishing 40 — lobster',    requires: { level: { fishing: 40 } },                  rewards: { unlocks: ['fish::lobster'] } },
    'fish-76':                { label: 'Fishing 76 — shark',      requires: { level: { fishing: 76 } },                  rewards: { unlocks: ['fish::shark'] } },
    'smelt-15':               { label: 'Smithing 15 — iron bars', requires: { level: { smithing: 15 } },                 rewards: { unlocks: ['smelt::iron'] } },
    'smelt-30':               { label: 'Smithing 30 — steel',     requires: { level: { smithing: 30 } },                 rewards: { unlocks: ['smelt::steel'] } },
    'cooking-15':             { label: 'Cooking 15 — trout',      requires: { level: { cooking: 15 } },                  rewards: { unlocks: ['cook::trout'] } },
    'cooking-40':             { label: 'Cooking 40 — lobster',    requires: { level: { cooking: 40 } },                  rewards: { unlocks: ['cook::lobster'] } },
    'agility-60':             { label: 'Agility 60 — Wilds loop', requires: { level: { agility: 60 } },                  rewards: { unlocks: ['agility::wilds'] } },
    'attack-40':              { label: 'Attack 40 — moss giants', requires: { level: { attack: 40 } },                   rewards: { unlocks: ['combat::moss-giant'] } },
    'attack-60':              { label: 'Attack 60 — dragons',     requires: { level: { attack: 60 } },                   rewards: { unlocks: ['combat::dragon'] } },
    'thieving-50':            { label: 'Thieving 50 — stalls',    requires: { level: { thieving: 50 } },                 rewards: { unlocks: ['thieve::stall'] } },
    'quest::cook-assistant':  { label: 'Cook\'s Assistant',       requires: {},                                          rewards: {} },
    'quest::tree-gnome':      { label: 'Tree Gnome Village',      requires: { level: { agility: 25 } },                  rewards: {} },
  },
  edges: [
    ['start','mining-15'],['mining-15','mining-30'],['mining-30','mining-55'],['mining-55','mining-85'],
    ['start','wc-15'],['wc-15','wc-30'],['wc-30','wc-60'],['wc-60','wc-75'],
    ['start','fish-20'],['fish-20','fish-40'],['fish-40','fish-76'],
    ['mining-15','smelt-15'],['smelt-15','smelt-30'],
    ['start','cooking-15'],['cooking-15','cooking-40'],
    ['start','agility-60'],['start','attack-40'],['attack-40','attack-60'],
    ['start','thieving-50'],
    ['start','quest::cook-assistant'],['agility-60','quest::tree-gnome'],
  ],
};

function loadDag() {
  const real = loadRealDag();
  if (real && real.nodes) return { source: 'real', dag: real };
  return { source: 'stub', dag: STUB_DAG };
}

module.exports = { loadDag, STUB_DAG };
