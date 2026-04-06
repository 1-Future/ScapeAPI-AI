// ══════════════════════════════════════════════════════════════════════════════
// DROP TABLES: Wiki-accurate loot tables for major monsters
// These override the generic "Bones" drop in the monster definitions
// ══════════════════════════════════════════════════════════════════════════════

const { define } = require('../mechanic');

// Each monster's drop table is a separate mechanic that can be tested independently
const DROP_TABLES = [
  {
    id: 'drops-cow', monster: 'Cow',
    always: [{ name: 'Bones', min: 1, max: 1 }, { name: 'Cowhide', min: 1, max: 1 }, { name: 'Raw beef', min: 1, max: 1 }],
    table: []
  },
  {
    id: 'drops-chicken', monster: 'Chicken',
    always: [{ name: 'Bones', min: 1, max: 1 }, { name: 'Raw chicken', min: 1, max: 1 }, { name: 'Feather', min: 5, max: 15 }],
    table: []
  },
  {
    id: 'drops-hill-giant', monster: 'Hill Giant',
    always: [{ name: 'Big bones', min: 1, max: 1 }],
    table: [
      { name: 'Iron full helm', weight: 4 }, { name: 'Iron kiteshield', weight: 3 },
      { name: 'Steel longsword', weight: 3 }, { name: 'Iron arrow', weight: 5, min: 2, max: 12 },
      { name: 'Coins', weight: 10, min: 10, max: 75 },
      { name: 'Law rune', weight: 2, min: 1, max: 2 }, { name: 'Nature rune', weight: 3, min: 2, max: 6 },
      { name: 'Limpwurt root', weight: 2 }, { name: 'Giant key', weight: 1 },
      { name: 'Ranarr seed', weight: 1 }, { name: 'Long bone', weight: 1 },
    ]
  },
  {
    id: 'drops-moss-giant', monster: 'Moss Giant',
    always: [{ name: 'Big bones', min: 1, max: 1 }],
    table: [
      { name: 'Black sq shield', weight: 3 }, { name: 'Steel kiteshield', weight: 3 },
      { name: 'Mithril sword', weight: 2 }, { name: 'Coins', weight: 10, min: 25, max: 190 },
      { name: 'Nature rune', weight: 3, min: 3, max: 9 }, { name: 'Law rune', weight: 2, min: 2, max: 3 },
      { name: 'Mossy key', weight: 1 }, { name: 'Ranarr seed', weight: 1 },
    ]
  },
  {
    id: 'drops-fire-giant', monster: 'Fire Giant',
    always: [{ name: 'Big bones', min: 1, max: 1 }],
    table: [
      { name: 'Rune scimitar', weight: 1 }, { name: 'Fire battlestaff', weight: 1 },
      { name: 'Coins', weight: 10, min: 50, max: 450 },
      { name: 'Nature rune', weight: 3, min: 5, max: 15 }, { name: 'Fire rune', weight: 5, min: 37, max: 75 },
      { name: 'Ranarr seed', weight: 1 }, { name: 'Snapdragon seed', weight: 1 },
      { name: 'Rune med helm', weight: 2 }, { name: 'Adamant arrow', weight: 3, min: 5, max: 15 },
    ]
  },
  {
    id: 'drops-hellhound', monster: 'Hellhound',
    always: [{ name: 'Bones', min: 1, max: 1 }],
    table: [
      { name: 'Clue scroll (hard)', weight: 1 }, { name: 'Smouldering stone', weight: 1 },
    ]
  },
  {
    id: 'drops-abyssal-demon', monster: 'Abyssal Demon',
    always: [{ name: 'Ashes', min: 1, max: 1 }],
    table: [
      { name: 'Abyssal whip', weight: 1 }, { name: 'Rune chainbody', weight: 3 },
      { name: 'Rune med helm', weight: 3 }, { name: 'Coins', weight: 10, min: 132, max: 500 },
      { name: 'Blood rune', weight: 3, min: 7, max: 14 }, { name: 'Law rune', weight: 2, min: 3, max: 6 },
      { name: 'Pure essence', weight: 5, min: 50, max: 100 },
      { name: 'Ranarr seed', weight: 1 }, { name: 'Snapdragon seed', weight: 1 },
      { name: 'Clue scroll (hard)', weight: 1 }, { name: 'Abyssal head', weight: 1 },
    ]
  },
  {
    id: 'drops-gargoyle', monster: 'Gargoyle',
    always: [{ name: 'Coins', min: 500, max: 750 }],
    table: [
      { name: 'Rune platelegs', weight: 2 }, { name: 'Rune full helm', weight: 2 },
      { name: 'Granite maul', weight: 2 }, { name: 'Mystic robe top (dark)', weight: 1 },
      { name: 'Coins', weight: 10, min: 300, max: 1500 },
      { name: 'Gold bar', weight: 5, min: 10, max: 20 }, { name: 'Steel bar', weight: 5, min: 10, max: 25 },
      { name: 'Gold ore', weight: 3, min: 10, max: 25 },
      { name: 'Ranarr seed', weight: 1 }, { name: 'Torstol seed', weight: 1 },
    ]
  },
  {
    id: 'drops-dust-devil', monster: 'Dust Devil',
    always: [{ name: 'Bones', min: 1, max: 1 }],
    table: [
      { name: 'Dragon chainbody', weight: 1 }, { name: 'Rune sword', weight: 2 },
      { name: 'Rune platelegs', weight: 2 }, { name: 'Coins', weight: 10, min: 50, max: 500 },
      { name: 'Earth rune', weight: 5, min: 10, max: 50 },
      { name: 'Ranarr seed', weight: 1 },
    ]
  },
  {
    id: 'drops-black-demon', monster: 'Black Demon',
    always: [{ name: 'Ashes', min: 1, max: 1 }],
    table: [
      { name: 'Rune chainbody', weight: 2 }, { name: 'Rune med helm', weight: 2 },
      { name: 'Black sword', weight: 3 }, { name: 'Coins', weight: 10, min: 40, max: 300 },
      { name: 'Blood rune', weight: 3, min: 3, max: 7 }, { name: 'Law rune', weight: 2, min: 2, max: 5 },
      { name: 'Ranarr seed', weight: 1 },
    ]
  },
  {
    id: 'drops-greater-demon', monster: 'Greater Demon',
    always: [{ name: 'Ashes', min: 1, max: 1 }],
    table: [
      { name: 'Rune full helm', weight: 2 }, { name: 'Rune platelegs', weight: 1 },
      { name: 'Coins', weight: 10, min: 30, max: 240 },
      { name: 'Fire rune', weight: 5, min: 12, max: 50 }, { name: 'Chaos rune', weight: 3, min: 5, max: 15 },
      { name: 'Ranarr seed', weight: 1 },
    ]
  },
  {
    id: 'drops-dragon-blue', monster: 'Blue Dragon',
    always: [{ name: 'Dragon bones', min: 1, max: 1 }, { name: 'Blue dragonhide', min: 1, max: 1 }],
    table: [
      { name: 'Rune dagger', weight: 2 }, { name: 'Mithril kiteshield', weight: 3 },
      { name: 'Adamant platebody', weight: 1 }, { name: 'Coins', weight: 10, min: 44, max: 220 },
      { name: 'Nature rune', weight: 3, min: 3, max: 7 }, { name: 'Law rune', weight: 2, min: 2, max: 3 },
      { name: 'Ranarr seed', weight: 1 },
    ]
  },
  {
    id: 'drops-dragon-black', monster: 'Black Dragon',
    always: [{ name: 'Dragon bones', min: 1, max: 1 }, { name: 'Black dragonhide', min: 1, max: 1 }],
    table: [
      { name: 'Rune longsword', weight: 2 }, { name: 'Adamant platelegs', weight: 2 },
      { name: 'Rune 2h sword', weight: 1 }, { name: 'Coins', weight: 10, min: 100, max: 690 },
      { name: 'Law rune', weight: 2, min: 3, max: 7 }, { name: 'Blood rune', weight: 2, min: 3, max: 15 },
      { name: 'Ranarr seed', weight: 1 }, { name: 'Dragon med helm', weight: 1 },
    ]
  },
  {
    id: 'drops-dark-beast', monster: 'Dark Beast',
    always: [{ name: 'Bones', min: 1, max: 1 }],
    table: [
      { name: 'Dark bow', weight: 1 }, { name: 'Rune 2h sword', weight: 2 },
      { name: 'Rune chainbody', weight: 2 }, { name: 'Death rune', weight: 3, min: 10, max: 30 },
      { name: 'Blood rune', weight: 3, min: 10, max: 20 }, { name: 'Coins', weight: 10, min: 200, max: 900 },
      { name: 'Ranarr seed', weight: 1 }, { name: 'Snapdragon seed', weight: 1 },
      { name: 'Clue scroll (elite)', weight: 1 },
    ]
  },
  {
    id: 'drops-demonic-gorilla', monster: 'Demonic Gorilla',
    always: [{ name: 'Ashes', min: 1, max: 1 }],
    table: [
      { name: 'Zenyte shard', weight: 1 }, { name: 'Ballista limbs', weight: 1 },
      { name: 'Ballista spring', weight: 1 }, { name: 'Light frame', weight: 1 },
      { name: 'Heavy frame', weight: 1 }, { name: 'Monkey tail', weight: 1 },
      { name: 'Rune platelegs', weight: 3 }, { name: 'Rune plateskirt', weight: 3 },
      { name: 'Rune chainbody', weight: 3 }, { name: 'Dragon scimitar', weight: 2 },
      { name: 'Coins', weight: 10, min: 300, max: 1500 },
      { name: 'Runite bolts', weight: 3, min: 10, max: 30 }, { name: 'Death rune', weight: 3, min: 30, max: 80 },
      { name: 'Ranarr seed', weight: 2 }, { name: 'Snapdragon seed', weight: 1 }, { name: 'Torstol seed', weight: 1 },
    ]
  },
  {
    id: 'drops-lizardman-shaman', monster: 'Lizardman Shaman',
    always: [{ name: 'Bones', min: 1, max: 1 }],
    table: [
      { name: 'Dragon warhammer', weight: 1 }, { name: 'Rune med helm', weight: 3 },
      { name: 'Rune warhammer', weight: 2 }, { name: 'Coins', weight: 10, min: 100, max: 600 },
      { name: 'Earth rune', weight: 5, min: 20, max: 60 }, { name: 'Chaos rune', weight: 3, min: 10, max: 30 },
      { name: 'Xerician fabric', weight: 3, min: 1, max: 3 },
      { name: 'Ranarr seed', weight: 1 },
    ]
  },
];

for (const dt of DROP_TABLES) {
  define({
    id: dt.id, name: `${dt.monster} Drops`, type: 'drop_table',
    atoms: {
      lootDrop: { table: [...dt.always.map(i => ({ ...i, always: true, weight: 1 })), ...dt.table.map(i => ({ ...i, min: i.min || 1, max: i.max || 1 }))] },
    },
    config: { monster: dt.monster, alwaysDrops: dt.always.map(i => i.name) }
  });
}

console.log(`[defs] Drop Tables: ${DROP_TABLES.length} monster drop tables`);
