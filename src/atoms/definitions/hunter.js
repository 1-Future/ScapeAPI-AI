// ══════════════════════════════════════════════════════════════════════════════
// HUNTER: Traps, birdhouses, tracking, chinchompas
// ══════════════════════════════════════════════════════════════════════════════

const { define } = require('../mechanic');

const HUNTER = [
  { id: 'hunt-crimson-swift', name: 'Catch Crimson Swift',   level: 1,  xp: 34,  method: 'bird snare', rate: 0.80 },
  { id: 'hunt-golden-warbler',name: 'Catch Golden Warbler',  level: 5,  xp: 47,  method: 'bird snare', rate: 0.75 },
  { id: 'hunt-copper-long',   name: 'Catch Copper Longtail', level: 9,  xp: 61,  method: 'bird snare', rate: 0.70 },
  { id: 'hunt-cerulean-twitch',name:'Catch Cerulean Twitch', level: 11, xp: 64.5,method: 'bird snare', rate: 0.70 },
  { id: 'hunt-tropical-wagtail',name:'Catch Tropical Wagtail',level: 19, xp: 95.2,method: 'bird snare', rate: 0.65 },
  { id: 'hunt-swamp-lizard',  name: 'Catch Swamp Lizard',    level: 29, xp: 152, method: 'net trap', rate: 0.60 },
  { id: 'hunt-orange-sala',   name: 'Catch Orange Salamander',level: 47, xp: 224, method: 'net trap', rate: 0.55 },
  { id: 'hunt-red-sala',      name: 'Catch Red Salamander',   level: 59, xp: 272, method: 'net trap', rate: 0.50 },
  { id: 'hunt-black-sala',    name: 'Catch Black Salamander',  level: 67, xp: 319, method: 'net trap', rate: 0.45 },
  { id: 'hunt-grey-chin',     name: 'Catch Grey Chinchompa',  level: 53, xp: 198.5,method: 'box trap', rate: 0.50 },
  { id: 'hunt-red-chin',      name: 'Catch Red Chinchompa',   level: 63, xp: 265, method: 'box trap', rate: 0.40 },
  { id: 'hunt-black-chin',    name: 'Catch Black Chinchompa', level: 73, xp: 315, method: 'box trap', rate: 0.35 },
  { id: 'hunt-imp-box',       name: 'Catch Impling',          level: 17, xp: 25,  method: 'butterfly net', rate: 0.60 },
  { id: 'hunt-herbiboar',     name: 'Track Herbiboar',        level: 80, xp: 1950,method: 'tracking', rate: 0.90 },
  // Birdhouses
  { id: 'hunt-birdhouse-reg', name: 'Regular Birdhouse',      level: 5,  xp: 280, method: 'birdhouse', rate: 1.0 },
  { id: 'hunt-birdhouse-oak', name: 'Oak Birdhouse',          level: 14, xp: 420, method: 'birdhouse', rate: 1.0 },
  { id: 'hunt-birdhouse-will',name: 'Willow Birdhouse',       level: 24, xp: 560, method: 'birdhouse', rate: 1.0 },
  { id: 'hunt-birdhouse-teak',name: 'Teak Birdhouse',         level: 34, xp: 700, method: 'birdhouse', rate: 1.0 },
  { id: 'hunt-birdhouse-mpl', name: 'Maple Birdhouse',        level: 44, xp: 820, method: 'birdhouse', rate: 1.0 },
  { id: 'hunt-birdhouse-mah', name: 'Mahogany Birdhouse',     level: 49, xp: 960, method: 'birdhouse', rate: 1.0 },
  { id: 'hunt-birdhouse-yew', name: 'Yew Birdhouse',          level: 59, xp: 1020,method: 'birdhouse', rate: 1.0 },
  { id: 'hunt-birdhouse-mag', name: 'Magic Birdhouse',        level: 74, xp: 1140,method: 'birdhouse', rate: 1.0 },
  { id: 'hunt-birdhouse-red', name: 'Redwood Birdhouse',      level: 89, xp: 1200,method: 'birdhouse', rate: 1.0 },
];

for (const h of HUNTER) {
  define({
    id: h.id, name: h.name, type: 'skill',
    requires: { levels: { hunter: h.level } },
    atoms: {
      periodicAction: { interval: h.method === 'birdhouse' ? 1 : 6, successRate: h.rate, successMessage: `You catch the creature.` },
      xpDrop: { skills: { hunter: h.xp } },
    },
    config: { method: h.method }
  });
}

console.log(`[defs] Hunter: ${HUNTER.length} methods`);
