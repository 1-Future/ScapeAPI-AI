// ══════════════════════════════════════════════════════════════════════════════
// CONSTRUCTION: Rooms and furniture
// ══════════════════════════════════════════════════════════════════════════════

const { define } = require('../mechanic');

const ROOMS = [
  { id: 'con-parlour',     name: 'Build Parlour',       level: 1,  xp: 100,  cost: 1000 },
  { id: 'con-kitchen',     name: 'Build Kitchen',       level: 5,  xp: 150,  cost: 5000 },
  { id: 'con-dining',      name: 'Build Dining Room',   level: 10, xp: 200,  cost: 5000 },
  { id: 'con-workshop',    name: 'Build Workshop',      level: 15, xp: 250,  cost: 10000 },
  { id: 'con-bedroom',     name: 'Build Bedroom',       level: 20, xp: 300,  cost: 10000 },
  { id: 'con-skill-hall',  name: 'Build Skill Hall',    level: 25, xp: 350,  cost: 15000 },
  { id: 'con-games-room',  name: 'Build Games Room',    level: 30, xp: 400,  cost: 25000 },
  { id: 'con-combat-room', name: 'Build Combat Room',   level: 32, xp: 450,  cost: 25000 },
  { id: 'con-quest-hall',  name: 'Build Quest Hall',    level: 35, xp: 500,  cost: 25000 },
  { id: 'con-menagerie',   name: 'Build Menagerie',     level: 37, xp: 500,  cost: 30000 },
  { id: 'con-study',       name: 'Build Study',         level: 40, xp: 550,  cost: 50000 },
  { id: 'con-costume-room',name: 'Build Costume Room',  level: 42, xp: 550,  cost: 50000 },
  { id: 'con-chapel',      name: 'Build Chapel',        level: 45, xp: 600,  cost: 50000 },
  { id: 'con-portal-room', name: 'Build Portal Chamber',level: 50, xp: 650,  cost: 100000 },
  { id: 'con-formal-garden',name:'Build Formal Garden', level: 55, xp: 700,  cost: 75000 },
  { id: 'con-throne-room', name: 'Build Throne Room',   level: 60, xp: 800,  cost: 150000 },
  { id: 'con-oubliette',   name: 'Build Oubliette',     level: 65, xp: 850,  cost: 150000 },
  { id: 'con-sup-garden',  name: 'Build Superior Garden',level: 75, xp: 1000, cost: 200000 },
  { id: 'con-achievement', name: 'Build Achievement Gallery',level: 80, xp: 1200, cost: 200000 },
];

const FURNITURE = [
  { id: 'con-crude-chair',   name: 'Build Crude Chair',     level: 1,  xp: 58,  materials: '2 planks, 2 nails' },
  { id: 'con-wooden-chair',  name: 'Build Wooden Chair',    level: 8,  xp: 87,  materials: '3 planks, 3 nails' },
  { id: 'con-rocking-chair', name: 'Build Rocking Chair',   level: 14, xp: 87,  materials: '3 planks, 3 nails' },
  { id: 'con-oak-chair',     name: 'Build Oak Chair',       level: 19, xp: 120, materials: '2 oak planks' },
  { id: 'con-oak-table',     name: 'Build Oak Dining Table',level: 22, xp: 240, materials: '4 oak planks' },
  { id: 'con-teak-table',    name: 'Build Teak Table',      level: 38, xp: 360, materials: '4 teak planks' },
  { id: 'con-mahogany-table',name: 'Build Mahogany Table',  level: 52, xp: 840, materials: '6 mahogany planks' },
  { id: 'con-oak-larder',    name: 'Build Oak Larder',      level: 33, xp: 480, materials: '8 oak planks' },
  { id: 'con-teak-larder',   name: 'Build Teak Larder',     level: 43, xp: 750, materials: '8 teak planks, 2 bolts of cloth' },
  { id: 'con-oak-dungeon-door',name:'Build Oak Dungeon Door',level: 74, xp: 600, materials: '10 oak planks' },
  { id: 'con-gilded-altar',  name: 'Build Gilded Altar',    level: 75, xp: 2230,materials: '4 limestone, 2 mahogany planks, 2 gold leaf, 2 bolts of cloth' },
  { id: 'con-ornate-pool',   name: 'Build Ornate Rejuv Pool',level: 90, xp: 3500, materials: '100 gold leaf, 100 marble blocks' },
  { id: 'con-spirit-tree',   name: 'Build Spirit Tree',     level: 75, xp: 350, materials: 'spirit tree, watering can' },
  { id: 'con-fairy-ring',    name: 'Build Fairy Ring',       level: 85, xp: 535, materials: '1 mushroom, 10 limestone' },
  { id: 'con-occult-altar',  name: 'Build Occult Altar',    level: 90, xp: 3445,materials: 'arcane, dark, dexterous signet' },
  { id: 'con-jewellery-box', name: 'Build Ornate Jewellery Box',level: 91, xp: 2680, materials: 'bolt of cloth, gold leaf, ring of dueling, etc.' },
  { id: 'con-nexus',         name: 'Build Portal Nexus',    level: 72, xp: 800, materials: '2 marble block, 200k gp per teleport' },
];

for (const r of ROOMS) {
  define({
    id: r.id, name: r.name, type: 'skill',
    requires: { levels: { construction: r.level } },
    atoms: {
      xpDrop: { skills: { construction: r.xp } },
    },
    config: { cost: r.cost, type: 'room' }
  });
}

for (const f of FURNITURE) {
  define({
    id: f.id, name: f.name, type: 'skill',
    requires: { levels: { construction: f.level } },
    atoms: {
      periodicAction: { interval: 4, successRate: 1.0, successMessage: `You build the ${f.name.replace('Build ', '').toLowerCase()}.` },
      xpDrop: { skills: { construction: f.xp } },
    },
    config: { materials: f.materials, type: 'furniture' }
  });
}

console.log(`[defs] Construction: ${ROOMS.length} rooms, ${FURNITURE.length} furniture = ${ROOMS.length + FURNITURE.length} mechanics`);
