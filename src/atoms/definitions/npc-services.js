// ══════════════════════════════════════════════════════════════════════════════
// NPC SERVICES: Functional NPCs with actual service mechanics
// Banks, altars, furnaces, anvils, ranges, spinning wheels, etc.
// ══════════════════════════════════════════════════════════════════════════════

const { define } = require('../mechanic');

// ── BANK LOCATIONS ──────────────────────────────────────────────────────────
const BANKS = [
  'Lumbridge', 'Varrock East', 'Varrock West', 'Varrock GE',
  'Falador East', 'Falador West', 'Draynor', 'Al Kharid',
  'Edgeville', 'Catherby', 'Seers Village', 'Ardougne North', 'Ardougne South',
  'Yanille', 'Canifis', 'Burgh de Rott', 'Rellekka', 'Neitiznot',
  'Keldagrim', 'Zanaris', 'Shilo Village', 'Nardah',
  'Prifddinas', 'Fossil Island', 'Farming Guild', 'Crafting Guild',
  'Mining Guild', 'Woodcutting Guild', 'Fishing Guild', 'Warriors Guild',
  'Kourend Castle', 'Hosidius', 'Port Piscarilius', 'Lovakengj',
  'Arceuus', 'Shayzien', 'Ferox Enclave', 'Lunar Isle',
  'Pest Control', 'Castle Wars', 'Duel Arena', 'Clan Hall',
  'Mount Karuulm', 'Darkmeyer', 'Ver Sinhaza',
];

// ── ALTARS ───────────────────────────────────────────────────────────────────
const ALTARS = [
  { id: 'altar-lumbridge', name: 'Lumbridge Chapel Altar', location: 'Lumbridge' },
  { id: 'altar-varrock', name: 'Varrock Palace Altar', location: 'Varrock' },
  { id: 'altar-falador', name: 'Falador Altar', location: 'Falador' },
  { id: 'altar-edgeville', name: 'Edgeville Monastery Altar', location: 'Edgeville' },
  { id: 'altar-camelot', name: 'Camelot Altar', location: 'Camelot' },
  { id: 'altar-ardougne', name: 'Ardougne Altar', location: 'Ardougne' },
  { id: 'altar-rellekka', name: 'Rellekka Altar', location: 'Rellekka' },
  { id: 'altar-poh', name: 'POH Altar', location: 'Player Owned House' },
  { id: 'altar-poh-gilded', name: 'POH Gilded Altar', location: 'Player Owned House' },
  { id: 'altar-chaos', name: 'Chaos Altar (Wilderness)', location: 'Wilderness' },
  { id: 'altar-ectofuntus', name: 'Ectofuntus', location: 'Port Phasmatys' },
];

// ── CRAFTING STATIONS ───────────────────────────────────────────────────────
const STATIONS = [
  { id: 'station-furnace-lumbridge', name: 'Lumbridge Furnace', type: 'furnace', location: 'Lumbridge' },
  { id: 'station-furnace-falador',   name: 'Falador Furnace',  type: 'furnace', location: 'Falador' },
  { id: 'station-furnace-al-kharid', name: 'Al Kharid Furnace',type: 'furnace', location: 'Al Kharid' },
  { id: 'station-furnace-edgeville', name: 'Edgeville Furnace',type: 'furnace', location: 'Edgeville' },
  { id: 'station-furnace-prifddinas',name: 'Prifddinas Furnace',type:'furnace', location: 'Prifddinas' },
  { id: 'station-blast-furnace',     name: 'Blast Furnace',    type: 'furnace', location: 'Keldagrim' },
  { id: 'station-anvil-varrock',     name: 'Varrock Anvil',    type: 'anvil',   location: 'Varrock' },
  { id: 'station-anvil-falador',     name: 'Falador Anvil',    type: 'anvil',   location: 'Falador' },
  { id: 'station-range-lumbridge',   name: 'Lumbridge Range',  type: 'range',   location: 'Lumbridge' },
  { id: 'station-range-rogues-den',  name: "Rogues' Den Fire", type: 'range',   location: "Rogues' Den" },
  { id: 'station-range-hosidius',    name: 'Hosidius Range',   type: 'range',   location: 'Hosidius' },
  { id: 'station-range-myths-guild', name: "Myths' Guild Range",type:'range',   location: "Myths' Guild" },
  { id: 'station-spinning-lumbridge',name: 'Lumbridge Wheel',  type: 'spinning',location: 'Lumbridge' },
  { id: 'station-spinning-seers',    name: 'Seers Village Wheel',type:'spinning',location: 'Seers Village' },
  { id: 'station-pottery-barb',      name: 'Barbarian Pottery',type: 'pottery', location: 'Barbarian Village' },
  { id: 'station-loom-falador',      name: 'Falador Loom',     type: 'loom',    location: 'Falador' },
  { id: 'station-tanning-al-kharid', name: 'Al Kharid Tanner', type: 'tanning', location: 'Al Kharid' },
  { id: 'station-tanning-canifis',   name: 'Canifis Tanner',   type: 'tanning', location: 'Canifis' },
  { id: 'station-enchant-table',     name: 'Enchanting Table',  type: 'enchant', location: 'Various' },
  { id: 'station-lectern-poh',       name: 'POH Lectern',      type: 'lectern', location: 'Player Owned House' },
  { id: 'station-sawmill',           name: 'Sawmill',           type: 'sawmill', location: 'Varrock' },
  { id: 'station-sand-pit',          name: 'Sand Pit',          type: 'sand',    location: 'Yanille' },
  { id: 'station-water-source',      name: 'Water Source',      type: 'water',   location: 'Various' },
];

// ── RUNECRAFT ALTARS ────────────────────────────────────────────────────────
const RC_ALTARS = [
  { id: 'rc-altar-air',    name: 'Air Altar',    rune: 'Air rune',    level: 1 },
  { id: 'rc-altar-mind',   name: 'Mind Altar',   rune: 'Mind rune',   level: 2 },
  { id: 'rc-altar-water',  name: 'Water Altar',  rune: 'Water rune',  level: 5 },
  { id: 'rc-altar-earth',  name: 'Earth Altar',  rune: 'Earth rune',  level: 9 },
  { id: 'rc-altar-fire',   name: 'Fire Altar',   rune: 'Fire rune',   level: 14 },
  { id: 'rc-altar-body',   name: 'Body Altar',   rune: 'Body rune',   level: 20 },
  { id: 'rc-altar-cosmic', name: 'Cosmic Altar', rune: 'Cosmic rune', level: 27 },
  { id: 'rc-altar-chaos',  name: 'Chaos Altar',  rune: 'Chaos rune',  level: 35 },
  { id: 'rc-altar-nature', name: 'Nature Altar', rune: 'Nature rune', level: 44 },
  { id: 'rc-altar-law',    name: 'Law Altar',    rune: 'Law rune',    level: 54 },
  { id: 'rc-altar-death',  name: 'Death Altar',  rune: 'Death rune',  level: 65 },
  { id: 'rc-altar-wrath',  name: 'Wrath Altar',  rune: 'Wrath rune',  level: 95 },
  { id: 'rc-altar-blood',  name: 'Blood Altar',  rune: 'Blood rune',  level: 77 },
  { id: 'rc-altar-soul',   name: 'Soul Altar',   rune: 'Soul rune',   level: 90 },
  { id: 'rc-altar-ourania', name: 'Ourania Altar',rune: 'Random rune', level: 1 },
];

let count = 0;

for (const bank of BANKS) {
  const id = `bank-${bank.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  define({ id, name: `${bank} Bank`, type: 'service', atoms: {}, config: { service: 'bank', location: bank } });
  count++;
}

for (const a of ALTARS) {
  define({ id: a.id, name: a.name, type: 'service',
    atoms: { xpDrop: { skills: { prayer: 0 } } },
    config: { service: 'altar', location: a.location, xpMultiplier: a.id.includes('gilded') ? 3.5 : a.id.includes('chaos') ? 3.5 : a.id.includes('ecto') ? 4.0 : 1.0 }
  });
  count++;
}

for (const s of STATIONS) {
  define({ id: s.id, name: s.name, type: 'service', atoms: {}, config: { service: s.type, location: s.location } });
  count++;
}

for (const r of RC_ALTARS) {
  define({ id: r.id, name: r.name, type: 'service',
    requires: { levels: { runecraft: r.level } },
    atoms: { xpDrop: { skills: { runecraft: 0 } } },
    config: { service: 'rc_altar', rune: r.rune }
  });
  count++;
}

console.log(`[defs] NPC Services: ${BANKS.length} banks, ${ALTARS.length} altars, ${STATIONS.length} stations, ${RC_ALTARS.length} RC altars = ${count} services`);
