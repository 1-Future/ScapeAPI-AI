// ══════════════════════════════════════════════════════════════════════════════
// MONSTERS EXTENDED: Hundreds more monsters
// ══════════════════════════════════════════════════════════════════════════════

const { define } = require('../mechanic');

const MONSTERS = [
  // Wilderness
  { id: 'mob-rev-imp',        name: 'Revenant Imp',         combat: 7,   hp: 10,  maxHit: 3,  speed: 4, style: 'magic', def: 5 },
  { id: 'mob-rev-goblin',     name: 'Revenant Goblin',      combat: 15,  hp: 14,  maxHit: 6,  speed: 4, style: 'magic', def: 10 },
  { id: 'mob-rev-pyrefiend',  name: 'Revenant Pyrefiend',   combat: 52,  hp: 48,  maxHit: 11, speed: 4, style: 'magic', def: 30 },
  { id: 'mob-rev-hobgoblin',  name: 'Revenant Hobgoblin',   combat: 60,  hp: 60,  maxHit: 13, speed: 4, style: 'magic', def: 35 },
  { id: 'mob-rev-cyclops',    name: 'Revenant Cyclops',      combat: 82,  hp: 110, maxHit: 16, speed: 4, style: 'magic', def: 50 },
  { id: 'mob-rev-hellhound',  name: 'Revenant Hellhound',   combat: 90,  hp: 112, maxHit: 18, speed: 4, style: 'magic', def: 55 },
  { id: 'mob-rev-demon',      name: 'Revenant Demon',        combat: 98,  hp: 120, maxHit: 20, speed: 4, style: 'magic', def: 60 },
  { id: 'mob-rev-ork',        name: 'Revenant Ork',          combat: 105, hp: 105, maxHit: 20, speed: 4, style: 'magic', def: 65 },
  { id: 'mob-rev-dark-beast', name: 'Revenant Dark Beast',   combat: 120, hp: 142, maxHit: 22, speed: 4, style: 'magic', def: 70 },
  { id: 'mob-rev-knight',     name: 'Revenant Knight',       combat: 126, hp: 155, maxHit: 23, speed: 4, style: 'magic', def: 80 },
  { id: 'mob-rev-dragon',     name: 'Revenant Dragon',       combat: 135, hp: 155, maxHit: 24, speed: 4, style: 'magic', def: 85 },
  { id: 'mob-rev-maledictus', name: 'Revenant Maledictus',   combat: 180, hp: 300, maxHit: 30, speed: 4, style: 'magic', def: 100 },
  // Catacombs of Kourend
  { id: 'mob-greater-nech',   name: 'Greater Nechryael',     combat: 200, hp: 200, maxHit: 17, speed: 4, style: 'melee', def: 120 },
  { id: 'mob-deviant-spec',   name: 'Deviant Spectre',       combat: 169, hp: 145, maxHit: 14, speed: 4, style: 'magic', def: 80 },
  { id: 'mob-brutal-black-d', name: 'Brutal Black Dragon',   combat: 318, hp: 325, maxHit: 30, speed: 4, style: 'melee', def: 200 },
  { id: 'mob-brutal-red-d',   name: 'Brutal Red Dragon',     combat: 289, hp: 285, maxHit: 26, speed: 4, style: 'melee', def: 170 },
  { id: 'mob-brutal-blue-d',  name: 'Brutal Blue Dragon',    combat: 271, hp: 255, maxHit: 24, speed: 4, style: 'melee', def: 150 },
  { id: 'mob-superior-crawl', name: 'Crushing Hand',         combat: 139, hp: 200, maxHit: 12, speed: 4, style: 'melee', def: 70 },
  { id: 'mob-superior-rock',  name: 'Cockathrice',           combat: 152, hp: 220, maxHit: 14, speed: 4, style: 'melee', def: 90 },
  { id: 'mob-superior-blood', name: 'Insatiable Bloodveld',  combat: 202, hp: 370, maxHit: 16, speed: 4, style: 'melee', def: 100 },
  // Slayer dungeon
  { id: 'mob-cave-kraken',    name: 'Cave Kraken',           combat: 127, hp: 125, maxHit: 7,  speed: 4, style: 'magic', def: 40 },
  { id: 'mob-warped-jelly',   name: 'Warped Jelly',          combat: 112, hp: 95,  maxHit: 8,  speed: 4, style: 'melee', def: 55 },
  { id: 'mob-jelly',          name: 'Jelly',                  combat: 78,  hp: 75,  maxHit: 6,  speed: 4, style: 'melee', def: 40 },
  { id: 'mob-turoth',         name: 'Turoth',                 combat: 83,  hp: 76,  maxHit: 6,  speed: 4, style: 'melee', def: 55 },
  { id: 'mob-wall-beast',     name: 'Wall Beast',             combat: 49,  hp: 46,  maxHit: 4,  speed: 4, style: 'melee', def: 30 },
  { id: 'mob-cave-horror',    name: 'Cave Horror',            combat: 80,  hp: 55,  maxHit: 6,  speed: 4, style: 'melee', def: 40 },
  { id: 'mob-banshee',        name: 'Banshee',                combat: 23,  hp: 22,  maxHit: 2,  speed: 4, style: 'melee', def: 15 },
  { id: 'mob-cave-crawler',   name: 'Cave Crawler',           combat: 23,  hp: 22,  maxHit: 2,  speed: 4, style: 'melee', def: 15 },
  // Godwars minions
  { id: 'mob-tstanon-karlak', name: 'Tstanon Karlak',        combat: 145, hp: 100, maxHit: 15, speed: 5, style: 'melee', def: 120 },
  { id: 'mob-zakln-gritch',   name: "Zakl'n Gritch",         combat: 142, hp: 100, maxHit: 14, speed: 5, style: 'ranged', def: 100 },
  { id: 'mob-balfrug-kreeyath',name:'Balfrug Kreeyath',      combat: 151, hp: 100, maxHit: 16, speed: 5, style: 'magic', def: 110 },
  { id: 'mob-sergeant-steelwill',name:'Sgt Steelwill',       combat: 159, hp: 142, maxHit: 21, speed: 4, style: 'magic', def: 100 },
  { id: 'mob-sergeant-grimspike',name:'Sgt Grimspike',       combat: 142, hp: 142, maxHit: 15, speed: 4, style: 'ranged', def: 100 },
  { id: 'mob-sergeant-strongstack',name:'Sgt Strongstack',   combat: 141, hp: 142, maxHit: 16, speed: 4, style: 'melee', def: 100 },
  { id: 'mob-starlight',      name: 'Starlight',              combat: 149, hp: 120, maxHit: 14, speed: 4, style: 'melee', def: 100 },
  { id: 'mob-growler',        name: 'Growler',                 combat: 139, hp: 120, maxHit: 14, speed: 4, style: 'magic', def: 100 },
  { id: 'mob-bree',           name: 'Bree',                    combat: 146, hp: 120, maxHit: 13, speed: 4, style: 'ranged', def: 100 },
  { id: 'mob-flight-kilisa',  name: 'Flight Kilisa',          combat: 159, hp: 120, maxHit: 14, speed: 4, style: 'melee', def: 100 },
  { id: 'mob-flockleader-geerin',name:'Flockleader Geerin',  combat: 149, hp: 120, maxHit: 15, speed: 4, style: 'ranged', def: 100 },
  { id: 'mob-wingman-skree',  name: 'Wingman Skree',          combat: 143, hp: 120, maxHit: 21, speed: 4, style: 'magic', def: 100 },
  // Common training mobs
  { id: 'mob-rock-crab',      name: 'Rock Crab',              combat: 13,  hp: 50,  maxHit: 1,  speed: 4, style: 'melee', def: 0 },
  { id: 'mob-sand-crab',      name: 'Sand Crab',              combat: 15,  hp: 60,  maxHit: 1,  speed: 4, style: 'melee', def: 0 },
  { id: 'mob-ammonite-crab',  name: 'Ammonite Crab',          combat: 25,  hp: 100, maxHit: 1,  speed: 4, style: 'melee', def: 0 },
  { id: 'mob-experiments',    name: 'Experiment',              combat: 25,  hp: 100, maxHit: 3,  speed: 4, style: 'melee', def: 0 },
  { id: 'mob-yak',            name: 'Yak',                     combat: 22,  hp: 50,  maxHit: 2,  speed: 4, style: 'melee', def: 5 },
  { id: 'mob-bear',           name: 'Bear',                    combat: 21,  hp: 25,  maxHit: 3,  speed: 4, style: 'melee', def: 10 },
  { id: 'mob-white-wolf',     name: 'White Wolf',              combat: 25,  hp: 26,  maxHit: 3,  speed: 4, style: 'melee', def: 10 },
  { id: 'mob-ice-warrior',    name: 'Ice Warrior',             combat: 57,  hp: 50,  maxHit: 5,  speed: 4, style: 'melee', def: 30 },
  { id: 'mob-ice-giant',      name: 'Ice Giant',               combat: 53,  hp: 70,  maxHit: 7,  speed: 4, style: 'melee', def: 25 },
  { id: 'mob-jogre',          name: 'Jogre',                   combat: 53,  hp: 60,  maxHit: 5,  speed: 4, style: 'melee', def: 25 },
  { id: 'mob-troll',          name: 'Mountain Troll',          combat: 69,  hp: 80,  maxHit: 7,  speed: 4, style: 'melee', def: 40 },
  { id: 'mob-green-dragon',   name: 'Green Dragon',            combat: 79,  hp: 75,  maxHit: 8,  speed: 4, style: 'melee', def: 50 },
  { id: 'mob-red-dragon',     name: 'Red Dragon',              combat: 152, hp: 140, maxHit: 11, speed: 4, style: 'melee', def: 90 },
  { id: 'mob-bronze-dragon',  name: 'Bronze Dragon',           combat: 131, hp: 130, maxHit: 12, speed: 4, style: 'melee', def: 100 },
  { id: 'mob-mithril-dragon', name: 'Mithril Dragon',         combat: 304, hp: 250, maxHit: 28, speed: 4, style: 'melee', def: 200 },
  { id: 'mob-adamant-dragon', name: 'Adamant Dragon',         combat: 338, hp: 295, maxHit: 29, speed: 4, style: 'melee', def: 220 },
  { id: 'mob-rune-dragon',    name: 'Rune Dragon',             combat: 380, hp: 330, maxHit: 32, speed: 4, style: 'melee', def: 240 },
  { id: 'mob-lava-dragon',    name: 'Lava Dragon',             combat: 252, hp: 190, maxHit: 21, speed: 4, style: 'melee', def: 130 },
  { id: 'mob-baby-blue-d',    name: 'Baby Blue Dragon',        combat: 48,  hp: 50,  maxHit: 4,  speed: 4, style: 'melee', def: 20 },
  { id: 'mob-baby-red-d',     name: 'Baby Red Dragon',         combat: 65,  hp: 75,  maxHit: 6,  speed: 4, style: 'melee', def: 30 },
  { id: 'mob-baby-black-d',   name: 'Baby Black Dragon',       combat: 83,  hp: 80,  maxHit: 7,  speed: 4, style: 'melee', def: 40 },
  // Barrows brothers
  { id: 'mob-ahrim',          name: 'Ahrim the Blighted',     combat: 98,  hp: 100, maxHit: 20, speed: 5, style: 'magic', def: 80 },
  { id: 'mob-dharok',         name: "Dharok the Wretched",    combat: 115, hp: 100, maxHit: 58, speed: 7, style: 'melee', def: 100 },
  { id: 'mob-guthan',         name: "Guthan the Infested",    combat: 115, hp: 100, maxHit: 24, speed: 5, style: 'melee', def: 100 },
  { id: 'mob-karil',          name: "Karil the Tainted",      combat: 98,  hp: 100, maxHit: 20, speed: 4, style: 'ranged', def: 80 },
  { id: 'mob-torag',          name: "Torag the Corrupted",    combat: 115, hp: 100, maxHit: 23, speed: 5, style: 'melee', def: 120 },
  { id: 'mob-verac',          name: "Verac the Defiled",      combat: 115, hp: 100, maxHit: 23, speed: 5, style: 'melee', def: 100 },
  // Misc
  { id: 'mob-kalphite-worker',name: 'Kalphite Worker',        combat: 28,  hp: 40,  maxHit: 3,  speed: 4, style: 'melee', def: 20 },
  { id: 'mob-kalphite-soldier',name:'Kalphite Soldier',       combat: 85,  hp: 90,  maxHit: 6,  speed: 4, style: 'melee', def: 50 },
  { id: 'mob-kalphite-guard', name: 'Kalphite Guardian',      combat: 141, hp: 170, maxHit: 10, speed: 4, style: 'melee', def: 80 },
  { id: 'mob-chaos-druid',    name: 'Chaos Druid',            combat: 13,  hp: 20,  maxHit: 2,  speed: 4, style: 'melee', def: 5 },
  { id: 'mob-dwarf',          name: 'Dwarf',                   combat: 10,  hp: 19,  maxHit: 2,  speed: 4, style: 'melee', def: 8 },
  { id: 'mob-elf-warrior',    name: 'Elf Warrior',             combat: 108, hp: 100, maxHit: 10, speed: 4, style: 'melee', def: 70 },
  { id: 'mob-dark-warrior',   name: 'Dark Warrior',            combat: 8,   hp: 10,  maxHit: 2,  speed: 4, style: 'melee', def: 5 },
  { id: 'mob-ghost',          name: 'Ghost',                   combat: 19,  hp: 25,  maxHit: 2,  speed: 4, style: 'melee', def: 10 },
  { id: 'mob-moss-giant-boss',name: 'Bryophyta (Moss)',        combat: 128, hp: 115, maxHit: 14, speed: 4, style: 'melee', def: 80 },
  { id: 'mob-obor-hill-giant',name: 'Obor (Hill Giant)',       combat: 106, hp: 120, maxHit: 16, speed: 4, style: 'melee', def: 60 },
  { id: 'mob-lizardman',      name: 'Lizardman',               combat: 53,  hp: 60,  maxHit: 8,  speed: 4, style: 'melee', def: 30 },
  { id: 'mob-lizardman-brute',name: 'Lizardman Brute',         combat: 73,  hp: 80,  maxHit: 12, speed: 4, style: 'melee', def: 50 },
  { id: 'mob-lizardman-shaman',name:'Lizardman Shaman',       combat: 150, hp: 150, maxHit: 31, speed: 5, style: 'ranged', def: 100 },
  { id: 'mob-demonic-gorilla',name: 'Demonic Gorilla',        combat: 275, hp: 380, maxHit: 30, speed: 4, style: 'melee', def: 220 },
  { id: 'mob-tortured-gorilla',name:'Tortured Gorilla',       combat: 141, hp: 130, maxHit: 12, speed: 4, style: 'melee', def: 80 },
  { id: 'mob-skeletal-mystic',name: 'Skeletal Mystic',        combat: 118, hp: 150, maxHit: 14, speed: 4, style: 'magic', def: 60 },
  { id: 'mob-guardian',       name: 'Guardian',                combat: 92,  hp: 120, maxHit: 8,  speed: 4, style: 'melee', def: 60 },
  { id: 'mob-vanguard',       name: 'Vanguard',                combat: 200, hp: 600, maxHit: 30, speed: 4, style: 'melee', def: 150 },
  { id: 'mob-nylocas-vasilias',name:'Nylocas Vasilias',       combat: 260, hp: 750, maxHit: 26, speed: 4, style: 'melee', def: 120 },
  { id: 'mob-pestilent-bloat',name: 'Pestilent Bloat',        combat: 320, hp: 600, maxHit: 70, speed: 6, style: 'melee', def: 200 },
  { id: 'mob-maiden-sugadinti',name:'Maiden of Sugadinti',    combat: 340, hp: 2625,maxHit: 18, speed: 4, style: 'magic', def: 150 },
  { id: 'mob-sotetseg',       name: 'Sotetseg',                combat: 360, hp: 4000,maxHit: 50, speed: 5, style: 'magic', def: 180 },
  { id: 'mob-xarpus',         name: 'Xarpus',                  combat: 350, hp: 5080,maxHit: 0,  speed: 4, style: 'ranged', def: 200 },
  // Misc overworld
  { id: 'mob-cow-calf',       name: 'Cow Calf',               combat: 2,   hp: 6,   maxHit: 1,  speed: 4, style: 'melee', def: 0 },
  { id: 'mob-frog',           name: 'Frog',                    combat: 1,   hp: 3,   maxHit: 1,  speed: 4, style: 'melee', def: 0 },
  { id: 'mob-duck',           name: 'Duck',                    combat: 1,   hp: 2,   maxHit: 0,  speed: 4, style: 'melee', def: 0 },
  { id: 'mob-seagull',        name: 'Seagull',                 combat: 1,   hp: 2,   maxHit: 0,  speed: 4, style: 'melee', def: 0 },
  { id: 'mob-scorpion',       name: 'Scorpion',                combat: 14,  hp: 17,  maxHit: 2,  speed: 4, style: 'melee', def: 5 },
  { id: 'mob-king-scorpion',  name: 'King Scorpion',           combat: 32,  hp: 38,  maxHit: 4,  speed: 4, style: 'melee', def: 15 },
  { id: 'mob-poison-scorpion',name: 'Poison Scorpion',         combat: 27,  hp: 28,  maxHit: 3,  speed: 4, style: 'melee', def: 10 },
  { id: 'mob-hobgoblin',      name: 'Hobgoblin',               combat: 28,  hp: 29,  maxHit: 3,  speed: 4, style: 'melee', def: 15 },
  { id: 'mob-otherworldly-being',name:'Otherworldly Being',   combat: 64,  hp: 50,  maxHit: 6,  speed: 4, style: 'magic', def: 30 },
  { id: 'mob-earth-warrior',  name: 'Earth Warrior',           combat: 51,  hp: 40,  maxHit: 5,  speed: 4, style: 'melee', def: 25 },
  { id: 'mob-chaos-dwarf',    name: 'Chaos Dwarf',             combat: 48,  hp: 59,  maxHit: 5,  speed: 4, style: 'melee', def: 25 },
  { id: 'mob-giant-bat',      name: 'Giant Bat',               combat: 27,  hp: 32,  maxHit: 3,  speed: 4, style: 'melee', def: 10 },
  { id: 'mob-shade',          name: 'Shade',                   combat: 45,  hp: 40,  maxHit: 5,  speed: 4, style: 'melee', def: 20 },
  { id: 'mob-vampire',        name: 'Vampire',                 combat: 32,  hp: 25,  maxHit: 3,  speed: 4, style: 'melee', def: 15 },
  { id: 'mob-werewolf',       name: 'Werewolf',                combat: 88,  hp: 100, maxHit: 7,  speed: 4, style: 'melee', def: 55 },
  { id: 'mob-ghast',          name: 'Ghast',                   combat: 30,  hp: 30,  maxHit: 4,  speed: 4, style: 'melee', def: 15 },
  { id: 'mob-vyrewatch',      name: 'Vyrewatch',               combat: 110, hp: 125, maxHit: 11, speed: 4, style: 'melee', def: 60 },
  { id: 'mob-vyre-sentinel',  name: 'Vyrewatch Sentinel',     combat: 151, hp: 175, maxHit: 13, speed: 4, style: 'melee', def: 80 },
];

// H15: Build tier-appropriate loot tables from combat level. Atoms monsters
// previously only dropped Bones — now they drop coins scaled to combat, plus
// category-appropriate flavour items. Keeps Pillar-4 non-degenerate: generic
// runes/herbs are common fills, not rares; truly unique rares live in
// src/content/aelgard/* inline drops and data/drop-tables.json.
function buildLoot(m) {
  const cb = m.combat || 1;
  const name = (m.name || '').toLowerCase();
  const boneType = /dragon/.test(name) ? 'Dragon bones' : cb >= 250 ? 'Dragon bones' : cb >= 80 ? 'Big bones' : 'Bones';
  const table = [
    { name: boneType, weight: 1, min: 1, max: 1, always: true },
    { name: 'Coins', weight: 10, min: Math.max(1, Math.floor(cb * 0.5)), max: Math.max(5, cb * 3) },
    { name: 'Nothing', weight: 8, min: 0, max: 0 },
  ];
  // Dragons drop dragonhide + extra runes (OSRS parity)
  if (/dragon/.test(name) && !/baby/.test(name)) {
    const hide = /blue/.test(name) ? 'Blue dragonhide'
      : /red/.test(name) ? 'Red dragonhide'
      : /black/.test(name) ? 'Black dragonhide'
      : 'Green dragonhide';
    table.push({ name: hide, weight: 10, min: 1, max: 1, always: true });
  }
  // Revenant tertiary shared-rare emblems
  if (/revenant/.test(name)) {
    table.push({ name: 'Revenant emblem', weight: 3, min: 1, max: 1 });
    table.push({ name: 'Bracelet of ethereum', weight: 1, min: 1, max: 1 });
  }
  // Kalphite drops chitin
  if (/kalphite/.test(name)) {
    table.push({ name: 'Potato cactus', weight: 3, min: 1, max: 3 });
  }
  // Vyre + vampire holy drops
  if (/vyre|vampir|lizard/.test(name)) {
    table.push({ name: 'Blood rune', weight: 3, min: 3, max: 8 });
  }
  // Crab/yak hides
  if (/crab|yak|bear/.test(name)) {
    table.push({ name: 'Raw beef', weight: 6, min: 1, max: 2 });
  }
  // Brother (Barrows) special
  if (/ahrim|dharok|guthan|karil|torag|verac/.test(name)) {
    table.push({ name: 'Barrows key', weight: 2, min: 1, max: 1 });
  }
  // Troll / ice giant drops
  if (/troll|ice/.test(name) && cb >= 50) {
    table.push({ name: 'Mithril bar', weight: 2, min: 1, max: 1 });
  }
  // Style-based flavour
  if (m.style === 'magic') {
    table.push({ name: 'Chaos rune', weight: 4, min: 2, max: Math.max(3, Math.ceil(cb / 20)) });
    if (cb >= 100) table.push({ name: 'Death rune', weight: 2, min: 1, max: 3 });
    if (cb >= 180) table.push({ name: 'Blood rune', weight: 2, min: 1, max: 3 });
  }
  if (m.style === 'ranged') {
    table.push({ name: 'Feather', weight: 4, min: 5, max: 15 });
    if (cb >= 60) table.push({ name: 'Adamant arrow', weight: 2, min: 2, max: 6 });
  }
  if (m.style === 'melee' && cb >= 40) {
    table.push({ name: 'Iron dagger', weight: 2, min: 1, max: 1 });
    if (cb >= 100) table.push({ name: 'Steel longsword', weight: 1, min: 1, max: 1 });
  }
  // High-tier flavour
  if (cb >= 150) table.push({ name: 'Uncut sapphire', weight: 1, min: 1, max: 1 });
  if (cb >= 200) table.push({ name: 'Runite bar', weight: 1, min: 1, max: 1 });
  return table;
}

for (const m of MONSTERS) {
  define({
    id: m.id, name: m.name, type: 'monster',
    config: { combat: m.combat, hp: m.hp, maxHit: m.maxHit, speed: m.speed, defence: m.def },
    atoms: {
      cooldown: { duration: m.speed },
      hitCheck: { maxHit: m.maxHit, style: m.style, bonus: m.def },
      flinch: { attackSpeed: m.speed },
      lootDrop: { table: buildLoot(m) },
    }
  });
}

console.log(`[defs] Monsters Extended: ${MONSTERS.length} more monsters`);
