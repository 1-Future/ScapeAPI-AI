// ══════════════════════════════════════════════════════════════════════════════
// SKILL DEFINITIONS: Gathering (Mining, Fishing, Woodcutting, Hunter, Farming)
// Every gatherable resource as a mechanic config.
// ══════════════════════════════════════════════════════════════════════════════

const { define } = require('../mechanic');

// ── MINING ──────────────────────────────────────────────────────────────────
const ORES = [
  { id: 'mine-clay',         name: 'Mine Clay',         level: 1,  interval: 2, xp: 5,   ore: 'Clay',          rate: 0.95 },
  { id: 'mine-rune-essence', name: 'Mine Rune Essence', level: 1,  interval: 2, xp: 5,   ore: 'Rune essence',  rate: 1.0 },
  { id: 'mine-copper',       name: 'Mine Copper',       level: 1,  interval: 3, xp: 17.5,ore: 'Copper ore',    rate: 0.95 },
  { id: 'mine-tin',          name: 'Mine Tin',          level: 1,  interval: 3, xp: 17.5,ore: 'Tin ore',       rate: 0.95 },
  { id: 'mine-iron',         name: 'Mine Iron',         level: 15, interval: 3, xp: 35,  ore: 'Iron ore',      rate: 0.85 },
  { id: 'mine-silver',       name: 'Mine Silver',       level: 20, interval: 4, xp: 40,  ore: 'Silver ore',    rate: 0.80 },
  { id: 'mine-coal',         name: 'Mine Coal',         level: 30, interval: 4, xp: 50,  ore: 'Coal',          rate: 0.75 },
  { id: 'mine-sandstone',    name: 'Mine Sandstone',    level: 35, interval: 4, xp: 60,  ore: 'Sandstone',     rate: 0.80 },
  { id: 'mine-gold',         name: 'Mine Gold',         level: 40, interval: 5, xp: 65,  ore: 'Gold ore',      rate: 0.65 },
  { id: 'mine-gem-rock',     name: 'Mine Gem Rock',     level: 40, interval: 4, xp: 65,  ore: 'Gem',           rate: 0.60 },
  { id: 'mine-mithril',      name: 'Mine Mithril',      level: 55, interval: 5, xp: 80,  ore: 'Mithril ore',   rate: 0.55 },
  { id: 'mine-adamantite',   name: 'Mine Adamantite',   level: 70, interval: 6, xp: 95,  ore: 'Adamantite ore',rate: 0.40 },
  { id: 'mine-runite',       name: 'Mine Runite',       level: 85, interval: 8, xp: 125, ore: 'Runite ore',    rate: 0.25 },
  { id: 'mine-amethyst',     name: 'Mine Amethyst',     level: 92, interval: 7, xp: 240, ore: 'Amethyst',      rate: 0.30 },
];

for (const o of ORES) {
  define({
    id: o.id, name: o.name, type: 'skill',
    requires: { levels: { mining: o.level } },
    atoms: {
      periodicAction: { interval: o.interval, successRate: o.rate, successMessage: `You manage to mine some ${o.ore.toLowerCase()}.` },
      xpDrop: { skills: { mining: o.xp } },
      lootDrop: { table: [{ name: o.ore, weight: 1, min: 1, max: 1 }] },
    }
  });
}

// ── FISHING ─────────────────────────────────────────────────────────────────
const FISH = [
  { id: 'fish-shrimps',     name: 'Fish Shrimps',     level: 1,  interval: 5, xp: 10,  fish: 'Raw shrimps',     rate: 0.90, tool: 'Small fishing net' },
  { id: 'fish-sardine',     name: 'Fish Sardine',     level: 5,  interval: 5, xp: 20,  fish: 'Raw sardine',     rate: 0.85, tool: 'Fishing rod' },
  { id: 'fish-herring',     name: 'Fish Herring',     level: 10, interval: 5, xp: 30,  fish: 'Raw herring',     rate: 0.85, tool: 'Fishing rod' },
  { id: 'fish-anchovies',   name: 'Fish Anchovies',   level: 15, interval: 5, xp: 40,  fish: 'Raw anchovies',   rate: 0.80, tool: 'Small fishing net' },
  { id: 'fish-trout',       name: 'Fish Trout',       level: 20, interval: 5, xp: 50,  fish: 'Raw trout',       rate: 0.80, tool: 'Fly fishing rod' },
  { id: 'fish-salmon',      name: 'Fish Salmon',      level: 30, interval: 5, xp: 70,  fish: 'Raw salmon',      rate: 0.75, tool: 'Fly fishing rod' },
  { id: 'fish-tuna',        name: 'Fish Tuna',        level: 35, interval: 5, xp: 80,  fish: 'Raw tuna',        rate: 0.70, tool: 'Harpoon' },
  { id: 'fish-lobster',     name: 'Fish Lobster',     level: 40, interval: 5, xp: 90,  fish: 'Raw lobster',     rate: 0.65, tool: 'Lobster pot' },
  { id: 'fish-swordfish',   name: 'Fish Swordfish',   level: 50, interval: 5, xp: 100, fish: 'Raw swordfish',   rate: 0.55, tool: 'Harpoon' },
  { id: 'fish-monkfish',    name: 'Fish Monkfish',    level: 62, interval: 5, xp: 120, fish: 'Raw monkfish',    rate: 0.50, tool: 'Small fishing net' },
  { id: 'fish-shark',       name: 'Fish Shark',       level: 76, interval: 6, xp: 110, fish: 'Raw shark',       rate: 0.35, tool: 'Harpoon' },
  { id: 'fish-anglerfish',  name: 'Fish Anglerfish',  level: 82, interval: 6, xp: 120, fish: 'Raw anglerfish',  rate: 0.30, tool: 'Fishing rod' },
  { id: 'fish-dark-crab',   name: 'Fish Dark Crab',   level: 85, interval: 6, xp: 130, fish: 'Raw dark crab',   rate: 0.25, tool: 'Lobster pot' },
  { id: 'fish-karambwan',   name: 'Fish Karambwan',   level: 65, interval: 5, xp: 50,  fish: 'Raw karambwan',   rate: 0.60, tool: 'Karambwan vessel' },
  { id: 'fish-minnow',      name: 'Fish Minnow',      level: 82, interval: 4, xp: 26.1,fish: 'Minnow',         rate: 0.70, tool: 'Small fishing net' },
  { id: 'fish-sacred-eel',  name: 'Fish Sacred Eel',  level: 87, interval: 6, xp: 105, fish: 'Sacred eel',      rate: 0.30, tool: 'Fishing rod' },
  { id: 'fish-infernal-eel',name: 'Fish Infernal Eel',level: 80, interval: 5, xp: 95,  fish: 'Infernal eel',    rate: 0.35, tool: 'Oily fishing rod' },
];

for (const f of FISH) {
  define({
    id: f.id, name: f.name, type: 'skill',
    requires: { levels: { fishing: f.level }, items: [f.tool] },
    atoms: {
      periodicAction: { interval: f.interval, successRate: f.rate, successMessage: `You catch a ${f.fish.replace('Raw ', '').toLowerCase()}.` },
      xpDrop: { skills: { fishing: f.xp } },
      lootDrop: { table: [{ name: f.fish, weight: 1, min: 1, max: 1 }] },
    }
  });
}

// ── WOODCUTTING ──────────────────────────────────────────────────────────────
const TREES = [
  { id: 'chop-tree',       name: 'Chop Tree',       level: 1,  interval: 4, xp: 25,   log: 'Logs',          rate: 0.95 },
  { id: 'chop-oak',        name: 'Chop Oak',        level: 15, interval: 4, xp: 37.5, log: 'Oak logs',      rate: 0.85 },
  { id: 'chop-willow',     name: 'Chop Willow',     level: 30, interval: 4, xp: 67.5, log: 'Willow logs',   rate: 0.75 },
  { id: 'chop-teak',       name: 'Chop Teak',       level: 35, interval: 4, xp: 85,   log: 'Teak logs',     rate: 0.70 },
  { id: 'chop-maple',      name: 'Chop Maple',      level: 45, interval: 5, xp: 100,  log: 'Maple logs',    rate: 0.60 },
  { id: 'chop-mahogany',   name: 'Chop Mahogany',   level: 50, interval: 5, xp: 125,  log: 'Mahogany logs', rate: 0.55 },
  { id: 'chop-yew',        name: 'Chop Yew',        level: 60, interval: 6, xp: 175,  log: 'Yew logs',      rate: 0.40 },
  { id: 'chop-magic',      name: 'Chop Magic',      level: 75, interval: 8, xp: 250,  log: 'Magic logs',    rate: 0.25 },
  { id: 'chop-redwood',    name: 'Chop Redwood',    level: 90, interval: 7, xp: 380,  log: 'Redwood logs',  rate: 0.20 },
];

for (const t of TREES) {
  define({
    id: t.id, name: t.name, type: 'skill',
    requires: { levels: { woodcutting: t.level } },
    atoms: {
      periodicAction: { interval: t.interval, successRate: t.rate, successMessage: `You get some ${t.log.toLowerCase()}.` },
      xpDrop: { skills: { woodcutting: t.xp } },
      lootDrop: { table: [{ name: t.log, weight: 1, min: 1, max: 1 }] },
    }
  });
}

console.log(`[defs] Gathering: ${ORES.length} ores, ${FISH.length} fish, ${TREES.length} trees = ${ORES.length + FISH.length + TREES.length} mechanics`);
