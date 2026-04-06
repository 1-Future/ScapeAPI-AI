// ══════════════════════════════════════════════════════════════════════════════
// FARMING: Herbs, allotments, trees, fruit trees, hops
// ══════════════════════════════════════════════════════════════════════════════

const { define } = require('../mechanic');

const HERBS = [
  { id: 'farm-guam',       name: 'Farm Guam',       level: 9,  plantXp: 11,  harvestXp: 12.5, growthMin: 80 },
  { id: 'farm-marrentill', name: 'Farm Marrentill', level: 14, plantXp: 13.5,harvestXp: 15,   growthMin: 80 },
  { id: 'farm-tarromin',   name: 'Farm Tarromin',   level: 19, plantXp: 16,  harvestXp: 18,   growthMin: 80 },
  { id: 'farm-harralander',name: 'Farm Harralander',level: 26, plantXp: 21.5,harvestXp: 24,   growthMin: 80 },
  { id: 'farm-ranarr',     name: 'Farm Ranarr',     level: 32, plantXp: 27,  harvestXp: 30.5, growthMin: 80 },
  { id: 'farm-toadflax',   name: 'Farm Toadflax',   level: 38, plantXp: 34,  harvestXp: 38.5, growthMin: 80 },
  { id: 'farm-irit',       name: 'Farm Irit',       level: 44, plantXp: 43,  harvestXp: 48.5, growthMin: 80 },
  { id: 'farm-avantoe',    name: 'Farm Avantoe',    level: 50, plantXp: 54.5,harvestXp: 61.5, growthMin: 80 },
  { id: 'farm-kwuarm',     name: 'Farm Kwuarm',     level: 56, plantXp: 69,  harvestXp: 78,   growthMin: 80 },
  { id: 'farm-snapdragon', name: 'Farm Snapdragon', level: 62, plantXp: 87.5,harvestXp: 98.5, growthMin: 80 },
  { id: 'farm-cadantine',  name: 'Farm Cadantine',  level: 67, plantXp: 106.5,harvestXp: 120, growthMin: 80 },
  { id: 'farm-lantadyme',  name: 'Farm Lantadyme',  level: 73, plantXp: 134.5,harvestXp: 151.5,growthMin: 80 },
  { id: 'farm-dwarf-weed', name: 'Farm Dwarf Weed', level: 79, plantXp: 170.5,harvestXp: 192, growthMin: 80 },
  { id: 'farm-torstol',    name: 'Farm Torstol',    level: 85, plantXp: 199.5,harvestXp: 224.5,growthMin: 80 },
];

const ALLOTMENTS = [
  { id: 'farm-potato',     name: 'Farm Potato',     level: 1,  plantXp: 8,   harvestXp: 9,    growthMin: 40 },
  { id: 'farm-onion',      name: 'Farm Onion',      level: 5,  plantXp: 9.5, harvestXp: 10.5, growthMin: 40 },
  { id: 'farm-cabbage',    name: 'Farm Cabbage',    level: 7,  plantXp: 10,  harvestXp: 11.5, growthMin: 40 },
  { id: 'farm-tomato',     name: 'Farm Tomato',     level: 12, plantXp: 12.5,harvestXp: 14,   growthMin: 40 },
  { id: 'farm-sweetcorn',  name: 'Farm Sweetcorn',  level: 20, plantXp: 17,  harvestXp: 19,   growthMin: 50 },
  { id: 'farm-strawberry', name: 'Farm Strawberry', level: 31, plantXp: 26,  harvestXp: 29,   growthMin: 55 },
  { id: 'farm-watermelon', name: 'Farm Watermelon', level: 47, plantXp: 48.5,harvestXp: 54.5, growthMin: 70 },
  { id: 'farm-snape-grass',name: 'Farm Snape Grass',level: 61, plantXp: 82,  harvestXp: 82,   growthMin: 70 },
];

const TREES = [
  { id: 'farm-oak-tree',    name: 'Farm Oak Tree',    level: 15, plantXp: 14,  checkXp: 467.3,  growthMin: 200 },
  { id: 'farm-willow-tree', name: 'Farm Willow Tree', level: 30, plantXp: 25,  checkXp: 1456.5, growthMin: 280 },
  { id: 'farm-maple-tree',  name: 'Farm Maple Tree',  level: 45, plantXp: 45,  checkXp: 3403.4, growthMin: 320 },
  { id: 'farm-yew-tree',    name: 'Farm Yew Tree',    level: 60, plantXp: 81,  checkXp: 7069.9, growthMin: 400 },
  { id: 'farm-magic-tree',  name: 'Farm Magic Tree',  level: 75, plantXp: 145.5,checkXp: 13768.3,growthMin: 480 },
  { id: 'farm-redwood-tree',name: 'Farm Redwood Tree',level: 90, plantXp: 230, checkXp: 22450, growthMin: 640 },
];

const FRUIT_TREES = [
  { id: 'farm-apple-tree',  name: 'Farm Apple Tree',  level: 27, plantXp: 22,  checkXp: 1199.5, growthMin: 960 },
  { id: 'farm-banana-tree', name: 'Farm Banana Tree', level: 33, plantXp: 28,  checkXp: 1750.5, growthMin: 960 },
  { id: 'farm-orange-tree', name: 'Farm Orange Tree', level: 39, plantXp: 35.5,checkXp: 2470.2, growthMin: 960 },
  { id: 'farm-curry-tree',  name: 'Farm Curry Tree',  level: 42, plantXp: 40,  checkXp: 2906.9, growthMin: 960 },
  { id: 'farm-pineapple',   name: 'Farm Pineapple',   level: 51, plantXp: 57,  checkXp: 4605.7, growthMin: 960 },
  { id: 'farm-papaya-tree', name: 'Farm Papaya Tree', level: 57, plantXp: 72,  checkXp: 6146.4, growthMin: 960 },
  { id: 'farm-palm-tree',   name: 'Farm Palm Tree',   level: 68, plantXp: 110.5,checkXp: 10150.1,growthMin: 960 },
  { id: 'farm-dragonfruit', name: 'Farm Dragonfruit', level: 81, plantXp: 140, checkXp: 17335, growthMin: 960 },
];

for (const h of HERBS) {
  define({
    id: h.id, name: h.name, type: 'skill',
    requires: { levels: { farming: h.level } },
    atoms: {
      periodicAction: { interval: 4, successRate: 0.80, successMessage: `You harvest a grimy herb.` },
      xpDrop: { skills: { farming: h.harvestXp } },
      timer: { duration: h.growthMin, name: 'growth' },
    },
    config: { plantXp: h.plantXp, growthMinutes: h.growthMin }
  });
}

for (const a of ALLOTMENTS) {
  define({
    id: a.id, name: a.name, type: 'skill',
    requires: { levels: { farming: a.level } },
    atoms: {
      periodicAction: { interval: 4, successRate: 0.85, successMessage: `You harvest some produce.` },
      xpDrop: { skills: { farming: a.harvestXp } },
      timer: { duration: a.growthMin, name: 'growth' },
    },
    config: { plantXp: a.plantXp }
  });
}

for (const t of TREES) {
  define({
    id: t.id, name: t.name, type: 'skill',
    requires: { levels: { farming: t.level } },
    atoms: {
      xpDrop: { skills: { farming: t.checkXp } },
      timer: { duration: t.growthMin, name: 'growth' },
    },
    config: { plantXp: t.plantXp, checkHealth: true }
  });
}

for (const f of FRUIT_TREES) {
  define({
    id: f.id, name: f.name, type: 'skill',
    requires: { levels: { farming: f.level } },
    atoms: {
      xpDrop: { skills: { farming: f.checkXp } },
      timer: { duration: f.growthMin, name: 'growth' },
    },
    config: { plantXp: f.plantXp, checkHealth: true }
  });
}

const total = HERBS.length + ALLOTMENTS.length + TREES.length + FRUIT_TREES.length;
console.log(`[defs] Farming: ${HERBS.length} herbs, ${ALLOTMENTS.length} allotments, ${TREES.length} trees, ${FRUIT_TREES.length} fruit = ${total} mechanics`);
