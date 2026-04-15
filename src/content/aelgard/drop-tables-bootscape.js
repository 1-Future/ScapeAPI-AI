// ══════════════════════════════════════════════════════════════════════════════
// Aelgard - Bootscape-Salvaged Drop Tables (burn v2)
//
// Source: /tmp/scape-repos/bootscape/Server/content/scripts/drop tables/scripts/
// Bootscape ships authentic OSRS drop tables as RS2 scripts. We re-shape them
// into our data/droptables.js weighted-main + tertiary format for eight monsters
// that already exist in Aelgard but had no drop table yet:
//
//   man, woman, farmer, giant_rat, skeleton, unicorn, werewolf, zombie
//   pirate, moss_giant
//
// The RS2 table uses random(128). We convert each "if $random < N" branch into
// a weight that preserves the approximate hit chance. Our engine uses weighted
// selection so the weights map to probability mass and sum to ~128.
//
// All item IDs map to the canonical IDs in src/data/items.js:
//   100=Bones  101=Coins  102=Cowhide  103=Raw beef  104=Feather  105=Raw chicken
//   106=Big bones  210=Copper ore  212=Iron ore  270=Air rune  271=Water rune
//   272=Earth rune  273=Fire rune  274=Mind rune  275=Body rune  276=Chaos rune
//   277=Death rune  278=Nature rune  279=Law rune
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const droptables = require('../../data/droptables');

// man / citizen / thief drop table (level 2 generic human)
droptables.define('man', {
  always: [{ id: 100, name: 'Bones', min: 1, max: 1 }],
  main: [
    { id: 101, name: 'Coins', weight: 38, min: 3, max: 25 },
    { id: 272, name: 'Earth rune', weight: 2, min: 4, max: 4 },
    { id: 273, name: 'Fire rune', weight: 2, min: 6, max: 6 },
    { id: 274, name: 'Mind rune', weight: 2, min: 9, max: 9 },
    { id: 276, name: 'Chaos rune', weight: 1, min: 2, max: 2 },
    { id: 0, name: 'Nothing', weight: 83, min: 0, max: 0 },
  ],
  tertiary: [
    { id: 902, name: 'Clue scroll (easy)', rate: 128, count: 1 },
  ],
});

// woman - same template as man
droptables.define('woman', {
  always: [{ id: 100, name: 'Bones', min: 1, max: 1 }],
  main: [
    { id: 101, name: 'Coins', weight: 38, min: 3, max: 25 },
    { id: 272, name: 'Earth rune', weight: 2, min: 4, max: 4 },
    { id: 273, name: 'Fire rune', weight: 2, min: 6, max: 6 },
    { id: 274, name: 'Mind rune', weight: 2, min: 9, max: 9 },
    { id: 276, name: 'Chaos rune', weight: 1, min: 2, max: 2 },
    { id: 0, name: 'Nothing', weight: 83, min: 0, max: 0 },
  ],
  tertiary: [
    { id: 902, name: 'Clue scroll (easy)', rate: 128, count: 1 },
  ],
});

// farmer - loot biased toward herbs, cabbage, copper ore
droptables.define('farmer', {
  always: [{ id: 100, name: 'Bones', min: 1, max: 1 }],
  main: [
    { id: 101, name: 'Coins', weight: 62, min: 3, max: 25 },
    { id: 322, name: 'Random herb', weight: 11, min: 1, max: 1 },
    { id: 104, name: 'Feather', weight: 5, min: 1, max: 1 },
    { id: 210, name: 'Copper ore', weight: 2, min: 1, max: 1 },
    { id: 272, name: 'Earth rune', weight: 2, min: 4, max: 4 },
    { id: 273, name: 'Fire rune', weight: 2, min: 6, max: 6 },
    { id: 400, name: 'Cabbage', weight: 1, min: 1, max: 1 },
    { id: 0, name: 'Nothing', weight: 43, min: 0, max: 0 },
  ],
  tertiary: [
    { id: 902, name: 'Clue scroll (easy)', rate: 128, count: 1 },
  ],
});

// giant_rat - just a carcass drop
droptables.define('giant_rat', {
  always: [
    { id: 100, name: 'Bones', min: 1, max: 1 },
    { id: 613, name: 'Raw rat meat', min: 1, max: 1 },
  ],
  main: [],
  tertiary: [],
});

// skeleton - undead ranged-coin-biased table
droptables.define('skeleton', {
  always: [{ id: 100, name: 'Bones', min: 1, max: 1 }],
  main: [
    { id: 101, name: 'Coins', weight: 54, min: 2, max: 48 },
    { id: 322, name: 'Random herb', weight: 21, min: 1, max: 1 },
    { id: 270, name: 'Air rune', weight: 2, min: 15, max: 15 },
    { id: 272, name: 'Earth rune', weight: 2, min: 3, max: 3 },
    { id: 273, name: 'Fire rune', weight: 2, min: 2, max: 2 },
    { id: 276, name: 'Chaos rune', weight: 2, min: 3, max: 3 },
    { id: 278, name: 'Nature rune', weight: 1, min: 3, max: 3 },
    { id: 0, name: 'Nothing', weight: 44, min: 0, max: 0 },
  ],
  tertiary: [
    { id: 902, name: 'Clue scroll (easy)', rate: 128, count: 1 },
  ],
});

// unicorn - guaranteed horn, no main table
droptables.define('unicorn', {
  always: [
    { id: 100, name: 'Bones', min: 1, max: 1 },
    { id: 614, name: 'Unicorn horn', min: 1, max: 1 },
  ],
  main: [],
  tertiary: [],
});

// werewolf - valuable mithril/rune gear at 512 granularity, not 128
droptables.define('werewolf', {
  always: [{ id: 106, name: 'Big bones', min: 1, max: 1 }],
  main: [
    { id: 101, name: 'Coins', weight: 280, min: 10, max: 364 },
    { id: 615, name: 'Grey wolf fur', weight: 100, min: 1, max: 1 },
    { id: 616, name: 'Fur', weight: 100, min: 1, max: 1 },
    { id: 617, name: 'Raw bear meat', weight: 10, min: 5, max: 5 },
    { id: 103, name: 'Raw beef', weight: 10, min: 5, max: 5 },
    { id: 105, name: 'Raw chicken', weight: 10, min: 5, max: 5 },
    { id: 618, name: 'Jug of wine', weight: 20, min: 1, max: 1 },
    { id: 619, name: 'Mithril chainbody', weight: 10, min: 1, max: 1 },
    { id: 620, name: 'Mithril sq shield', weight: 10, min: 1, max: 1 },
    { id: 621, name: 'Rune med helm', weight: 3, min: 1, max: 1 },
    { id: 622, name: 'Steel scimitar', weight: 32, min: 1, max: 1 },
    { id: 623, name: 'Steel full helm', weight: 15, min: 1, max: 1 },
    { id: 322, name: 'Random herb', weight: 3, min: 1, max: 1 },
    { id: 0, name: 'Nothing', weight: 3, min: 0, max: 0 },
  ],
  tertiary: [
    { id: 902, name: 'Clue scroll (medium)', rate: 96, count: 1 },
  ],
});

// zombie - unarmed variant, fishing_bait biased
droptables.define('zombie', {
  always: [{ id: 100, name: 'Bones', min: 1, max: 1 }],
  main: [
    { id: 624, name: 'Fishing bait', weight: 37, min: 5, max: 5 },
    { id: 322, name: 'Random herb', weight: 25, min: 1, max: 1 },
    { id: 101, name: 'Coins', weight: 22, min: 4, max: 28 },
    { id: 275, name: 'Body rune', weight: 5, min: 6, max: 6 },
    { id: 274, name: 'Mind rune', weight: 5, min: 5, max: 5 },
    { id: 270, name: 'Air rune', weight: 4, min: 13, max: 13 },
    { id: 625, name: 'Iron arrow', weight: 11, min: 5, max: 8 },
    { id: 626, name: 'Steel arrow', weight: 2, min: 5, max: 5 },
    { id: 278, name: 'Nature rune', weight: 1, min: 6, max: 6 },
    { id: 210, name: 'Copper ore', weight: 2, min: 1, max: 1 },
    { id: 627, name: 'Bronze med helm', weight: 4, min: 1, max: 1 },
    { id: 628, name: 'Bronze longsword', weight: 1, min: 1, max: 1 },
    { id: 629, name: 'Iron axe', weight: 1, min: 1, max: 1 },
    { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 },
  ],
  tertiary: [
    { id: 902, name: 'Clue scroll (easy)', rate: 128, count: 1 },
  ],
});

// pirate - coin-heavy, iron_platebody rare, eye patch p2p
droptables.define('pirate', {
  always: [{ id: 100, name: 'Bones', min: 1, max: 1 }],
  main: [
    { id: 101, name: 'Coins', weight: 56, min: 4, max: 55 },
    { id: 276, name: 'Chaos rune', weight: 6, min: 2, max: 2 },
    { id: 278, name: 'Nature rune', weight: 5, min: 2, max: 2 },
    { id: 630, name: 'Bronze arrow', weight: 4, min: 9, max: 12 },
    { id: 270, name: 'Air rune', weight: 2, min: 10, max: 10 },
    { id: 272, name: 'Earth rune', weight: 2, min: 9, max: 9 },
    { id: 273, name: 'Fire rune', weight: 2, min: 5, max: 5 },
    { id: 279, name: 'Law rune', weight: 1, min: 2, max: 2 },
    { id: 631, name: 'Iron dagger', weight: 6, min: 1, max: 1 },
    { id: 632, name: 'Bronze scimitar', weight: 4, min: 1, max: 1 },
    { id: 633, name: 'Iron platebody', weight: 1, min: 1, max: 1 },
    { id: 634, name: 'Eye patch', weight: 12, min: 1, max: 1 },
    { id: 0, name: 'Nothing', weight: 27, min: 0, max: 0 },
  ],
  tertiary: [
    { id: 902, name: 'Clue scroll (easy)', rate: 64, count: 1 },
  ],
});

// moss_giant - runes + mithril bias
droptables.define('moss_giant', {
  always: [{ id: 106, name: 'Big bones', min: 1, max: 1 }],
  main: [
    { id: 101, name: 'Coins', weight: 40, min: 10, max: 100 },
    { id: 635, name: 'Black sq shield', weight: 5, min: 1, max: 1 },
    { id: 636, name: 'Steel med helm', weight: 2, min: 1, max: 1 },
    { id: 637, name: 'Mithril sword', weight: 2, min: 1, max: 1 },
    { id: 638, name: 'Mithril spear', weight: 2, min: 1, max: 1 },
    { id: 639, name: 'Steel kiteshield', weight: 1, min: 1, max: 1 },
    { id: 640, name: 'Magic staff', weight: 2, min: 1, max: 1 },
    { id: 279, name: 'Law rune', weight: 4, min: 3, max: 3 },
    { id: 270, name: 'Air rune', weight: 3, min: 18, max: 18 },
    { id: 272, name: 'Earth rune', weight: 3, min: 27, max: 27 },
    { id: 276, name: 'Chaos rune', weight: 3, min: 7, max: 7 },
    { id: 278, name: 'Nature rune', weight: 3, min: 6, max: 6 },
    { id: 641, name: 'Cosmic rune', weight: 2, min: 2, max: 2 },
    { id: 277, name: 'Death rune', weight: 1, min: 3, max: 3 },
    { id: 322, name: 'Random herb', weight: 20, min: 1, max: 1 },
    { id: 0, name: 'Nothing', weight: 35, min: 0, max: 0 },
  ],
  tertiary: [
    { id: 902, name: 'Clue scroll (medium)', rate: 64, count: 1 },
  ],
});

const added = ['man', 'woman', 'farmer', 'giant_rat', 'skeleton', 'unicorn', 'werewolf', 'zombie', 'pirate', 'moss_giant'];
console.log(`[aelgard] bootscape drop tables added: ${added.length} monsters`);

module.exports = { added };
