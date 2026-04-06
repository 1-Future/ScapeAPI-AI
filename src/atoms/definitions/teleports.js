// ══════════════════════════════════════════════════════════════════════════════
// TELEPORTS: Spells, tabs, jewelry, other transport methods
// ══════════════════════════════════════════════════════════════════════════════

const { define } = require('../mechanic');

// Jewelry teleports (uses charge system like dose)
const JEWELRY = [
  { id: 'tele-ring-dueling-1', name: 'Ring of Dueling: Duel Arena',      charges: 8, dest: 'duel_arena' },
  { id: 'tele-ring-dueling-2', name: 'Ring of Dueling: Castle Wars',     charges: 8, dest: 'castle_wars' },
  { id: 'tele-ring-dueling-3', name: 'Ring of Dueling: Ferox Enclave',   charges: 8, dest: 'ferox' },
  { id: 'tele-games-neck-1',   name: 'Games Necklace: Burthorpe',       charges: 8, dest: 'burthorpe' },
  { id: 'tele-games-neck-2',   name: 'Games Necklace: Barbarian Outpost',charges: 8, dest: 'barb_outpost' },
  { id: 'tele-games-neck-3',   name: 'Games Necklace: Corporeal Beast', charges: 8, dest: 'corp' },
  { id: 'tele-games-neck-4',   name: 'Games Necklace: Wintertodt',      charges: 8, dest: 'wintertodt' },
  { id: 'tele-glory-1',        name: 'Glory: Edgeville',                charges: 6, dest: 'edgeville' },
  { id: 'tele-glory-2',        name: 'Glory: Karamja',                  charges: 6, dest: 'karamja' },
  { id: 'tele-glory-3',        name: 'Glory: Draynor Village',          charges: 6, dest: 'draynor' },
  { id: 'tele-glory-4',        name: 'Glory: Al Kharid',                charges: 6, dest: 'al_kharid' },
  { id: 'tele-combat-brace-1', name: 'Combat Bracelet: Warriors Guild', charges: 6, dest: 'warriors_guild' },
  { id: 'tele-combat-brace-2', name: 'Combat Bracelet: Champions Guild',charges: 6, dest: 'champions_guild' },
  { id: 'tele-combat-brace-3', name: 'Combat Bracelet: Monastery',      charges: 6, dest: 'monastery' },
  { id: 'tele-combat-brace-4', name: 'Combat Bracelet: Ranging Guild',  charges: 6, dest: 'ranging_guild' },
  { id: 'tele-skills-neck-1',  name: 'Skills Necklace: Fishing Guild',  charges: 6, dest: 'fishing_guild' },
  { id: 'tele-skills-neck-2',  name: 'Skills Necklace: Mining Guild',   charges: 6, dest: 'mining_guild' },
  { id: 'tele-skills-neck-3',  name: 'Skills Necklace: Crafting Guild',  charges: 6, dest: 'crafting_guild' },
  { id: 'tele-skills-neck-4',  name: 'Skills Necklace: Farming Guild',  charges: 6, dest: 'farming_guild' },
  { id: 'tele-skills-neck-5',  name: 'Skills Necklace: Woodcutting Guild',charges: 6, dest: 'wc_guild' },
  { id: 'tele-wealth-1',       name: 'Ring of Wealth: GE',              charges: 5, dest: 'grand_exchange' },
  { id: 'tele-wealth-2',       name: 'Ring of Wealth: Falador',         charges: 5, dest: 'falador' },
  { id: 'tele-wealth-3',       name: 'Ring of Wealth: Miscellania',     charges: 5, dest: 'miscellania' },
  { id: 'tele-seed-pod',       name: 'Royal Seed Pod: Grand Tree',      charges: -1, dest: 'grand_tree' },
  { id: 'tele-slayer-ring-1',  name: 'Slayer Ring: Stronghold Cave',    charges: 8, dest: 'stronghold_slayer' },
  { id: 'tele-slayer-ring-2',  name: 'Slayer Ring: Morytania Tower',    charges: 8, dest: 'slayer_tower' },
  { id: 'tele-slayer-ring-3',  name: 'Slayer Ring: Rellekka Cave',      charges: 8, dest: 'rellekka_slayer' },
  { id: 'tele-digi-1',         name: 'Digsite Pendant: Digsite',        charges: 5, dest: 'digsite' },
  { id: 'tele-digi-2',         name: 'Digsite Pendant: Fossil Island',  charges: 5, dest: 'fossil_island' },
  { id: 'tele-digi-3',         name: 'Digsite Pendant: Lithkren',       charges: 5, dest: 'lithkren' },
];

// Teleport tablets
const TABS = [
  { id: 'tele-tab-varrock',   name: 'Varrock Teleport Tab',    dest: 'varrock' },
  { id: 'tele-tab-lumbridge',name: 'Lumbridge Teleport Tab',   dest: 'lumbridge' },
  { id: 'tele-tab-falador',  name: 'Falador Teleport Tab',    dest: 'falador' },
  { id: 'tele-tab-camelot',  name: 'Camelot Teleport Tab',    dest: 'camelot' },
  { id: 'tele-tab-ardougne', name: 'Ardougne Teleport Tab',   dest: 'ardougne' },
  { id: 'tele-tab-watchtower',name:'Watchtower Teleport Tab', dest: 'watchtower' },
  { id: 'tele-tab-house',    name: 'Teleport to House Tab',   dest: 'poh' },
  { id: 'tele-tab-kourend',  name: 'Kourend Castle Teleport', dest: 'kourend' },
];

// Other transport
const TRANSPORT = [
  { id: 'tele-fairy-ring',    name: 'Fairy Ring',             dest: 'varies', method: 'fairy_ring' },
  { id: 'tele-spirit-tree',   name: 'Spirit Tree',            dest: 'varies', method: 'spirit_tree' },
  { id: 'tele-charter-ship',  name: 'Charter Ship',           dest: 'varies', method: 'charter' },
  { id: 'tele-canoe',         name: 'Canoe',                  dest: 'varies', method: 'canoe' },
  { id: 'tele-gnome-glider',  name: 'Gnome Glider',           dest: 'varies', method: 'glider' },
  { id: 'tele-balloon',       name: 'Balloon Transport',      dest: 'varies', method: 'balloon' },
  { id: 'tele-minecart',      name: 'Minecart',               dest: 'varies', method: 'minecart' },
  { id: 'tele-agility-short', name: 'Agility Shortcut',       dest: 'varies', method: 'shortcut' },
];

for (const j of JEWELRY) {
  define({
    id: j.id, name: j.name, type: 'transport',
    atoms: {
      consume: {},
      ...(j.charges > 0 ? { doseSystem: true } : {}),
      cooldown: { duration: 5 },
    },
    config: { dest: j.dest, charges: j.charges, method: 'jewelry' }
  });
}

for (const t of TABS) {
  define({
    id: t.id, name: t.name, type: 'transport',
    atoms: { consume: {}, cooldown: { duration: 5 } },
    config: { dest: t.dest, method: 'tab', consumeOnUse: true }
  });
}

for (const t of TRANSPORT) {
  define({
    id: t.id, name: t.name, type: 'transport',
    atoms: { cooldown: { duration: 3 } },
    config: { dest: t.dest, method: t.method }
  });
}

console.log(`[defs] Teleports: ${JEWELRY.length} jewelry, ${TABS.length} tabs, ${TRANSPORT.length} transport = ${JEWELRY.length + TABS.length + TRANSPORT.length} mechanics`);
