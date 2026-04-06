// ══════════════════════════════════════════════════════════════════════════════
// TRANSPORTATION: Spirit trees, canoes, gliders, minecarts, charter ships
// ══════════════════════════════════════════════════════════════════════════════

const { define } = require('../mechanic');

const SPIRIT_TREES = [
  { dest: 'Tree Gnome Village' }, { dest: 'Tree Gnome Stronghold' },
  { dest: 'Battlefield of Khazard' }, { dest: 'Grand Exchange' },
  { dest: 'Brimhaven' }, { dest: 'Hosidius' }, { dest: 'Farming Guild' },
  { dest: 'Port Sarim' }, { dest: 'Etceteria' }, { dest: 'Prifddinas' },
];

const CANOES = [
  { dest: 'Lumbridge', level: 12 }, { dest: 'Champions Guild', level: 12 },
  { dest: 'Barbarian Village', level: 27 }, { dest: 'Edgeville', level: 42 },
  { dest: 'Wilderness Pond', level: 57 },
];

const GNOME_GLIDERS = [
  { dest: 'Tree Gnome Stronghold' }, { dest: 'White Wolf Mountain' },
  { dest: 'Karamja' }, { dest: 'Feldip Hills' }, { dest: 'Ape Atoll' },
  { dest: 'Digsite' },
];

const MINECARTS = [
  { dest: 'Keldagrim' }, { dest: 'Ice Mountain' }, { dest: 'Grand Exchange' },
  { dest: 'Lovakengj' },
];

const CHARTER_SHIPS = [
  { dest: 'Port Sarim', cost: 0 }, { dest: 'Karamja', cost: 30 },
  { dest: 'Brimhaven', cost: 400 }, { dest: 'Ardougne', cost: 1600 },
  { dest: 'Catherby', cost: 480 }, { dest: 'Port Khazard', cost: 1280 },
  { dest: 'Ship Yard', cost: 400 }, { dest: 'Mos Le Harmless', cost: 725 },
  { dest: 'Port Phasmatys', cost: 1100 }, { dest: 'Corsair Cove', cost: 750 },
  { dest: 'Port Tyras', cost: 3200 }, { dest: 'Prifddinas', cost: 0 },
];

const BOATS = [
  { id: 'boat-karamja',      name: 'Port Sarim to Karamja',    cost: 30 },
  { id: 'boat-ardougne',     name: 'Brimhaven to Ardougne',     cost: 30 },
  { id: 'boat-pest-control', name: 'Port Sarim to Pest Control', cost: 0 },
  { id: 'boat-entrana',      name: 'Port Sarim to Entrana',      cost: 0 },
  { id: 'boat-crandor',      name: 'Port Sarim to Crandor',      cost: 0 },
  { id: 'boat-waterbirth',   name: 'Rellekka to Waterbirth',     cost: 0 },
  { id: 'boat-neitiznot',    name: 'Rellekka to Neitiznot',      cost: 0 },
  { id: 'boat-jatizso',      name: 'Rellekka to Jatizso',        cost: 0 },
  { id: 'boat-fossil-island',name: 'Digsite to Fossil Island',   cost: 0 },
  { id: 'boat-mos-le-harmless',name:"Port Phasmatys to Mos Le'Harmless", cost: 0 },
  { id: 'boat-dragontooth',  name: 'Port Phasmatys to Dragontooth', cost: 0 },
  { id: 'boat-lunar-isle',   name: 'Rellekka to Lunar Isle',     cost: 0 },
  { id: 'boat-braindeath',   name: 'Port Phasmatys to Braindeath', cost: 0 },
];

let count = 0;
for (const s of SPIRIT_TREES) {
  const id = `spirit-tree-${s.dest.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  define({ id, name: `Spirit Tree: ${s.dest}`, type: 'transport', atoms: { cooldown: { duration: 3 } }, config: { dest: s.dest, method: 'spirit_tree' } });
  count++;
}
for (const c of CANOES) {
  const id = `canoe-${c.dest.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  define({ id, name: `Canoe to ${c.dest}`, type: 'transport', requires: { levels: { woodcutting: c.level } }, atoms: { cooldown: { duration: 5 } }, config: { dest: c.dest, method: 'canoe' } });
  count++;
}
for (const g of GNOME_GLIDERS) {
  const id = `glider-${g.dest.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  define({ id, name: `Glider to ${g.dest}`, type: 'transport', atoms: { cooldown: { duration: 3 } }, config: { dest: g.dest, method: 'glider' } });
  count++;
}
for (const m of MINECARTS) {
  const id = `minecart-${m.dest.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  define({ id, name: `Minecart to ${m.dest}`, type: 'transport', atoms: { cooldown: { duration: 3 } }, config: { dest: m.dest, method: 'minecart' } });
  count++;
}
for (const c of CHARTER_SHIPS) {
  const id = `charter-${c.dest.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  define({ id, name: `Charter to ${c.dest}`, type: 'transport', atoms: { cooldown: { duration: 5 } }, config: { dest: c.dest, cost: c.cost, method: 'charter' } });
  count++;
}
for (const b of BOATS) {
  define({ id: b.id, name: b.name, type: 'transport', atoms: { cooldown: { duration: 5 } }, config: { cost: b.cost, method: 'boat' } });
  count++;
}

console.log(`[defs] Transport Extended: ${SPIRIT_TREES.length} spirit trees, ${CANOES.length} canoes, ${GNOME_GLIDERS.length} gliders, ${MINECARTS.length} minecarts, ${CHARTER_SHIPS.length} charters, ${BOATS.length} boats = ${count} transports`);
