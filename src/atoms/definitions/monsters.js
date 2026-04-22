// ══════════════════════════════════════════════════════════════════════════════
// MONSTER DEFINITIONS: Every common monster as a combat config
// ══════════════════════════════════════════════════════════════════════════════

const { define } = require('../mechanic');

const MONSTERS = [
  // ── FREE TO PLAY ──
  { id: 'mob-chicken',       name: 'Chicken',          combat: 1,   hp: 3,   maxHit: 1,  speed: 4, style: 'melee', def: 0,  xp: 3 },
  { id: 'mob-cow',           name: 'Cow',              combat: 2,   hp: 8,   maxHit: 1,  speed: 4, style: 'melee', def: 0,  xp: 8 },
  { id: 'mob-goblin',        name: 'Goblin',           combat: 2,   hp: 5,   maxHit: 1,  speed: 4, style: 'melee', def: 0,  xp: 5 },
  { id: 'mob-rat',           name: 'Giant Rat',        combat: 3,   hp: 5,   maxHit: 1,  speed: 4, style: 'melee', def: 2,  xp: 5 },
  { id: 'mob-spider',        name: 'Giant Spider',     combat: 2,   hp: 4,   maxHit: 2,  speed: 4, style: 'melee', def: 1,  xp: 4 },
  { id: 'mob-man',           name: 'Man',              combat: 2,   hp: 7,   maxHit: 1,  speed: 4, style: 'melee', def: 5,  xp: 7 },
  { id: 'mob-imp',           name: 'Imp',              combat: 2,   hp: 8,   maxHit: 1,  speed: 4, style: 'melee', def: 3,  xp: 8 },
  { id: 'mob-mugger',        name: 'Mugger',           combat: 6,   hp: 12,  maxHit: 2,  speed: 4, style: 'melee', def: 5,  xp: 12 },
  { id: 'mob-al-kharid-war', name: 'Al-Kharid Warrior',combat: 9,   hp: 19,  maxHit: 3,  speed: 4, style: 'melee', def: 8,  xp: 19 },
  { id: 'mob-dark-wizard',   name: 'Dark Wizard',      combat: 7,   hp: 16,  maxHit: 4,  speed: 4, style: 'magic', def: 3,  xp: 16 },
  { id: 'mob-skeleton',      name: 'Skeleton',         combat: 22,  hp: 24,  maxHit: 3,  speed: 4, style: 'melee', def: 15, xp: 24 },
  { id: 'mob-zombie',        name: 'Zombie',           combat: 13,  hp: 22,  maxHit: 3,  speed: 4, style: 'melee', def: 10, xp: 22 },
  { id: 'mob-guard',         name: 'Guard',            combat: 21,  hp: 22,  maxHit: 3,  speed: 4, style: 'melee', def: 18, xp: 22 },
  { id: 'mob-hill-giant',    name: 'Hill Giant',       combat: 28,  hp: 35,  maxHit: 4,  speed: 4, style: 'melee', def: 18, xp: 35 },
  { id: 'mob-moss-giant',    name: 'Moss Giant',       combat: 42,  hp: 60,  maxHit: 5,  speed: 4, style: 'melee', def: 30, xp: 60 },
  { id: 'mob-lesser-demon',  name: 'Lesser Demon',     combat: 82,  hp: 79,  maxHit: 8,  speed: 4, style: 'melee', def: 55, xp: 79 },
  { id: 'mob-greater-demon', name: 'Greater Demon',    combat: 92,  hp: 87,  maxHit: 8,  speed: 4, style: 'melee', def: 63, xp: 87 },
  { id: 'mob-ankou',         name: 'Ankou',            combat: 75,  hp: 60,  maxHit: 7,  speed: 4, style: 'melee', def: 50, xp: 60 },

  // ── MEMBERS LOW-MID ──
  { id: 'mob-crawling-hand', name: 'Crawling Hand',    combat: 16,  hp: 16,  maxHit: 2,  speed: 4, style: 'melee', def: 10, xp: 16 },
  { id: 'mob-rock-slug',     name: 'Rock Slug',        combat: 29,  hp: 27,  maxHit: 2,  speed: 4, style: 'melee', def: 20, xp: 27 },
  { id: 'mob-cockatrice',    name: 'Cockatrice',       combat: 37,  hp: 37,  maxHit: 3,  speed: 4, style: 'melee', def: 25, xp: 37 },
  { id: 'mob-pyrefiend',     name: 'Pyrefiend',        combat: 43,  hp: 45,  maxHit: 4,  speed: 4, style: 'melee', def: 30, xp: 45 },
  { id: 'mob-infernal-mage', name: 'Infernal Mage',    combat: 66,  hp: 60,  maxHit: 7,  speed: 4, style: 'magic', def: 40, xp: 60 },
  { id: 'mob-bloodveld',     name: 'Bloodveld',        combat: 76,  hp: 120, maxHit: 5,  speed: 4, style: 'melee', def: 50, xp: 120 },
  { id: 'mob-aberrant-spec', name: 'Aberrant Spectre', combat: 96,  hp: 90,  maxHit: 8,  speed: 4, style: 'magic', def: 60, xp: 90 },
  { id: 'mob-hellhound',     name: 'Hellhound',        combat: 122, hp: 116, maxHit: 11, speed: 4, style: 'melee', def: 80, xp: 116 },
  { id: 'mob-fire-giant',    name: 'Fire Giant',       combat: 86,  hp: 111, maxHit: 11, speed: 4, style: 'melee', def: 65, xp: 111 },
  { id: 'mob-blue-dragon',   name: 'Blue Dragon',      combat: 111, hp: 105, maxHit: 12, speed: 4, style: 'melee', def: 75, xp: 105 },
  { id: 'mob-black-dragon',  name: 'Black Dragon',     combat: 227, hp: 195, maxHit: 18, speed: 4, style: 'melee', def: 120, xp: 195 },
  { id: 'mob-iron-dragon',   name: 'Iron Dragon',      combat: 189, hp: 165, maxHit: 17, speed: 4, style: 'melee', def: 140, xp: 165 },
  { id: 'mob-steel-dragon',  name: 'Steel Dragon',     combat: 246, hp: 210, maxHit: 19, speed: 4, style: 'melee', def: 160, xp: 210 },

  // ── MEMBERS HIGH ──
  { id: 'mob-abyssal-demon', name: 'Abyssal Demon',    combat: 124, hp: 150, maxHit: 8,  speed: 4, style: 'melee', def: 85,  xp: 150 },
  { id: 'mob-dark-beast',    name: 'Dark Beast',       combat: 182, hp: 220, maxHit: 16, speed: 4, style: 'melee', def: 110, xp: 220 },
  { id: 'mob-nechryael',     name: 'Nechryael',        combat: 115, hp: 105, maxHit: 12, speed: 4, style: 'melee', def: 80,  xp: 105 },
  { id: 'mob-gargoyle',      name: 'Gargoyle',         combat: 111, hp: 105, maxHit: 11, speed: 4, style: 'melee', def: 105, xp: 105 },
  { id: 'mob-dust-devil',    name: 'Dust Devil',       combat: 93,  hp: 105, maxHit: 8,  speed: 4, style: 'melee', def: 60,  xp: 105 },
  { id: 'mob-kurask',        name: 'Kurask',           combat: 106, hp: 97,  maxHit: 7,  speed: 4, style: 'melee', def: 75,  xp: 97 },
  { id: 'mob-wyvern',        name: 'Skeletal Wyvern',  combat: 140, hp: 200, maxHit: 15, speed: 4, style: 'ranged', def: 120, xp: 200 },
  { id: 'mob-kraken-tent',   name: 'Enormous Tentacle',combat: 96,  hp: 112, maxHit: 4,  speed: 4, style: 'magic', def: 30,  xp: 112 },
  { id: 'mob-smoke-devil',   name: 'Smoke Devil',      combat: 160, hp: 185, maxHit: 14, speed: 4, style: 'magic', def: 90,  xp: 185 },
  { id: 'mob-hydra',         name: 'Hydra',            combat: 194, hp: 255, maxHit: 17, speed: 4, style: 'ranged', def: 100, xp: 255 },
  { id: 'mob-wyrm',          name: 'Wyrm',             combat: 99,  hp: 130, maxHit: 8,  speed: 4, style: 'magic', def: 60,  xp: 130 },
  { id: 'mob-drake',         name: 'Drake',            combat: 192, hp: 250, maxHit: 17, speed: 4, style: 'melee', def: 120, xp: 250 },
  { id: 'mob-basilisk-kn',   name: 'Basilisk Knight',  combat: 204, hp: 300, maxHit: 26, speed: 4, style: 'melee', def: 150, xp: 300 },
  { id: 'mob-black-demon',   name: 'Black Demon',      combat: 172, hp: 157, maxHit: 16, speed: 4, style: 'melee', def: 90,  xp: 157 },
  { id: 'mob-dagannoth',     name: 'Dagannoth',        combat: 74,  hp: 70,  maxHit: 6,  speed: 4, style: 'melee', def: 40,  xp: 70 },
  { id: 'mob-suqah',         name: 'Suqah',            combat: 111, hp: 105, maxHit: 11, speed: 4, style: 'melee', def: 65,  xp: 105 },
  { id: 'mob-tzhaar-ket',    name: 'TzHaar-Ket',       combat: 149, hp: 70,  maxHit: 15, speed: 5, style: 'melee', def: 195, xp: 70 },
  { id: 'mob-tzhaar-xil',    name: 'TzHaar-Xil',       combat: 133, hp: 60,  maxHit: 12, speed: 4, style: 'ranged', def: 100, xp: 60 },
  { id: 'mob-tzhaar-mej',    name: 'TzHaar-Mej',       combat: 103, hp: 55,  maxHit: 12, speed: 4, style: 'magic', def: 80,  xp: 55 },
];

// H15: Build tier-appropriate loot tables from combat level. Atoms monsters
// previously only dropped Bones — now they drop coins scaled to combat, plus
// category-appropriate flavour items. Keeps Pillar-4 non-degenerate: generic
// runes/herbs are common fills, not rares; truly unique rares live in
// src/content/aelgard/* inline drops and data/drop-tables.json.
function buildLoot(m) {
  const cb = m.combat || 1;
  const boneType = cb >= 250 ? 'Dragon bones' : cb >= 80 ? 'Big bones' : 'Bones';
  const table = [
    { name: boneType, weight: 1, min: 1, max: 1, always: true },
    { name: 'Coins', weight: 10, min: Math.max(1, Math.floor(cb * 0.5)), max: Math.max(5, cb * 3) },
    { name: 'Nothing', weight: 8, min: 0, max: 0 },
  ];
  if (m.style === 'magic') {
    table.push({ name: 'Chaos rune', weight: 4, min: 2, max: Math.max(3, Math.ceil(cb / 20)) });
    if (cb >= 100) table.push({ name: 'Death rune', weight: 2, min: 1, max: 3 });
  }
  if (m.style === 'ranged') {
    table.push({ name: 'Feather', weight: 4, min: 5, max: 15 });
    if (cb >= 60) table.push({ name: 'Adamant arrow', weight: 2, min: 2, max: 6 });
  }
  if (m.style === 'melee' && cb >= 40) {
    table.push({ name: 'Iron dagger', weight: 2, min: 1, max: 1 });
    if (cb >= 100) table.push({ name: 'Steel longsword', weight: 1, min: 1, max: 1 });
  }
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
      xpDrop: { skills: { hitpoints: m.xp * 1.33 / 10 } },
      lootDrop: { table: buildLoot(m) },
    }
  });
}

console.log(`[defs] Monsters: ${MONSTERS.length} monsters`);
