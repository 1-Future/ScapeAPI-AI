// ══════════════════════════════════════════════════════════════════════════════
// MAGIC DEFINITIONS: Standard + Ancient spellbook combat spells
// ══════════════════════════════════════════════════════════════════════════════

const { define } = require('../mechanic');

// ── STANDARD SPELLBOOK ──────────────────────────────────────────────────────
const STANDARD = [
  { id: 'spell-wind-strike',   name: 'Wind Strike',   level: 1,  maxHit: 2,  xp: 5.5,  runes: '1air 1mind' },
  { id: 'spell-water-strike',  name: 'Water Strike',  level: 5,  maxHit: 4,  xp: 7.5,  runes: '1water 1air 1mind' },
  { id: 'spell-earth-strike',  name: 'Earth Strike',  level: 9,  maxHit: 6,  xp: 9.5,  runes: '2earth 1air 1mind' },
  { id: 'spell-fire-strike',   name: 'Fire Strike',   level: 13, maxHit: 8,  xp: 11.5, runes: '3fire 2air 1mind' },
  { id: 'spell-wind-bolt',     name: 'Wind Bolt',     level: 17, maxHit: 9,  xp: 13.5, runes: '2air 1chaos' },
  { id: 'spell-water-bolt',    name: 'Water Bolt',    level: 23, maxHit: 10, xp: 16.5, runes: '2water 2air 1chaos' },
  { id: 'spell-earth-bolt',    name: 'Earth Bolt',    level: 29, maxHit: 11, xp: 19.5, runes: '3earth 2air 1chaos' },
  { id: 'spell-fire-bolt',     name: 'Fire Bolt',     level: 35, maxHit: 12, xp: 22.5, runes: '4fire 3air 1chaos' },
  { id: 'spell-wind-blast',    name: 'Wind Blast',    level: 41, maxHit: 13, xp: 25.5, runes: '3air 1death' },
  { id: 'spell-water-blast',   name: 'Water Blast',   level: 47, maxHit: 14, xp: 28.5, runes: '3water 3air 1death' },
  { id: 'spell-earth-blast',   name: 'Earth Blast',   level: 53, maxHit: 15, xp: 31.5, runes: '4earth 3air 1death' },
  { id: 'spell-fire-blast',    name: 'Fire Blast',    level: 59, maxHit: 16, xp: 34.5, runes: '5fire 4air 1death' },
  { id: 'spell-wind-wave',     name: 'Wind Wave',     level: 62, maxHit: 17, xp: 36,   runes: '5air 1blood' },
  { id: 'spell-water-wave',    name: 'Water Wave',    level: 65, maxHit: 18, xp: 37.5, runes: '7water 5air 1blood' },
  { id: 'spell-earth-wave',    name: 'Earth Wave',    level: 70, maxHit: 19, xp: 40,   runes: '7earth 5air 1blood' },
  { id: 'spell-fire-wave',     name: 'Fire Wave',     level: 75, maxHit: 20, xp: 42.5, runes: '7fire 5air 1blood' },
  { id: 'spell-wind-surge',    name: 'Wind Surge',    level: 81, maxHit: 21, xp: 44.5, runes: '7air 1wrath' },
  { id: 'spell-water-surge',   name: 'Water Surge',   level: 85, maxHit: 22, xp: 46.5, runes: '10water 7air 1wrath' },
  { id: 'spell-earth-surge',   name: 'Earth Surge',   level: 90, maxHit: 23, xp: 48.5, runes: '10earth 7air 1wrath' },
  { id: 'spell-fire-surge',    name: 'Fire Surge',    level: 95, maxHit: 24, xp: 50.5, runes: '10fire 7air 1wrath' },
  // Utility spells
  { id: 'spell-crumble-undead',name: 'Crumble Undead',level: 39, maxHit: 15, xp: 24.5, runes: '2earth 2air 1chaos' },
  { id: 'spell-iban-blast',    name: 'Iban Blast',    level: 50, maxHit: 25, xp: 30,   runes: '5fire 1death' },
  { id: 'spell-magic-dart',    name: 'Magic Dart',    level: 50, maxHit: 19, xp: 30,   runes: '4mind 1death' },
];

for (const s of STANDARD) {
  define({
    id: s.id, name: s.name, type: 'combat',
    requires: { levels: { magic: s.level } },
    atoms: {
      cooldown: { duration: 5 },
      hitCheck: { maxHit: s.maxHit, style: 'magic' },
      protectionCheck: true,
      delayedAction: { baseDelay: 2 },
      xpDrop: { skills: { magic: s.xp, hitpoints: 1.33 } },
    },
    config: { runes: s.runes, spellbook: 'standard' }
  });
}

// ── ANCIENT SPELLBOOK ───────────────────────────────────────────────────────
const ANCIENTS = [
  { id: 'spell-smoke-rush',   name: 'Smoke Rush',   level: 50, maxHit: 13, xp: 30,   runes: '1death 1fire 1air 1chaos' },
  { id: 'spell-shadow-rush',  name: 'Shadow Rush',  level: 52, maxHit: 14, xp: 31,   runes: '1death 1air 1soul 1chaos' },
  { id: 'spell-blood-rush',   name: 'Blood Rush',   level: 56, maxHit: 15, xp: 33,   runes: '1death 1blood 1chaos' },
  { id: 'spell-ice-rush',     name: 'Ice Rush',     level: 58, maxHit: 16, xp: 34,   runes: '2death 2water 1chaos' },
  { id: 'spell-smoke-burst',  name: 'Smoke Burst',  level: 62, maxHit: 17, xp: 36,   runes: '2death 2fire 1air 1chaos' },
  { id: 'spell-shadow-burst', name: 'Shadow Burst', level: 64, maxHit: 18, xp: 37,   runes: '2death 1air 1soul 1chaos' },
  { id: 'spell-blood-burst',  name: 'Blood Burst',  level: 68, maxHit: 21, xp: 39,   runes: '2death 2blood 1chaos' },
  { id: 'spell-ice-burst',    name: 'Ice Burst',    level: 70, maxHit: 22, xp: 40,   runes: '4death 4water 1chaos' },
  { id: 'spell-smoke-blitz',  name: 'Smoke Blitz',  level: 74, maxHit: 23, xp: 42,   runes: '2death 2fire 2air 1blood' },
  { id: 'spell-shadow-blitz', name: 'Shadow Blitz', level: 76, maxHit: 24, xp: 43,   runes: '2death 2air 2soul 1blood' },
  { id: 'spell-blood-blitz',  name: 'Blood Blitz',  level: 80, maxHit: 25, xp: 45,   runes: '2death 4blood' },
  { id: 'spell-ice-blitz',    name: 'Ice Blitz',    level: 82, maxHit: 26, xp: 46,   runes: '2death 3water 2blood' },
  { id: 'spell-smoke-barrage',name: 'Smoke Barrage',level: 86, maxHit: 27, xp: 48,   runes: '4death 4fire 2air 2blood' },
  { id: 'spell-shadow-barrage',name:'Shadow Barrage',level: 88, maxHit: 28, xp: 49,  runes: '4death 2air 3soul 2blood' },
  { id: 'spell-blood-barrage',name: 'Blood Barrage',level: 92, maxHit: 29, xp: 51,   runes: '4death 1blood 1soul' },
  { id: 'spell-ice-barrage',  name: 'Ice Barrage',  level: 94, maxHit: 30, xp: 52,   runes: '4death 6water 2blood' },
];

for (const s of ANCIENTS) {
  const isAoe = s.name.includes('Burst') || s.name.includes('Barrage');
  const isBlood = s.name.includes('Blood');
  const isIce = s.name.includes('Ice');
  define({
    id: s.id, name: s.name, type: 'combat',
    requires: { levels: { magic: s.level } },
    atoms: {
      cooldown: { duration: 5 },
      hitCheck: { maxHit: s.maxHit, style: 'magic' },
      protectionCheck: true,
      delayedAction: { baseDelay: 2 },
      xpDrop: { skills: { magic: s.xp, hitpoints: 1.33 } },
    },
    config: {
      runes: s.runes, spellbook: 'ancient', aoe: isAoe,
      healsOnHit: isBlood ? 0.25 : 0,
      freezeTicks: isIce ? (s.name.includes('Barrage') ? 33 : s.name.includes('Blitz') ? 25 : s.name.includes('Burst') ? 17 : 8) : 0,
    }
  });
}

// ── UTILITY SPELLS ──────────────────────────────────────────────────────────
const UTILITY = [
  { id: 'spell-teleport-varrock',  name: 'Varrock Teleport',    level: 25, xp: 35, runes: '3air 1fire 1law' },
  { id: 'spell-teleport-lumbridge',name: 'Lumbridge Teleport',  level: 31, xp: 41, runes: '3air 1earth 1law' },
  { id: 'spell-teleport-falador', name: 'Falador Teleport',     level: 37, xp: 48, runes: '3air 1water 1law' },
  { id: 'spell-teleport-camelot', name: 'Camelot Teleport',     level: 45, xp: 55.5,runes: '5air 1law' },
  { id: 'spell-teleport-ardougne',name: 'Ardougne Teleport',    level: 51, xp: 61, runes: '2water 2law' },
  { id: 'spell-high-alch',       name: 'High Level Alchemy',    level: 55, xp: 65, runes: '5fire 1nature' },
  { id: 'spell-low-alch',        name: 'Low Level Alchemy',     level: 21, xp: 31, runes: '3fire 1nature' },
  { id: 'spell-superheat',       name: 'Superheat Item',        level: 43, xp: 53, runes: '4fire 1nature' },
  { id: 'spell-enchant-sapphire',name: 'Enchant Sapphire',      level: 7,  xp: 17.5,runes: '1water 1cosmic' },
  { id: 'spell-enchant-emerald', name: 'Enchant Emerald',       level: 27, xp: 37, runes: '3air 1cosmic' },
  { id: 'spell-enchant-ruby',    name: 'Enchant Ruby',          level: 49, xp: 59, runes: '5fire 1cosmic' },
  { id: 'spell-enchant-diamond', name: 'Enchant Diamond',       level: 57, xp: 67, runes: '10earth 1cosmic' },
  { id: 'spell-enchant-dragonstone',name:'Enchant Dragonstone', level: 68, xp: 78, runes: '15water 15earth 1cosmic' },
  { id: 'spell-enchant-onyx',    name: 'Enchant Onyx',          level: 87, xp: 97, runes: '20fire 20earth 1cosmic' },
  { id: 'spell-bones-to-bananas',name: 'Bones to Bananas',      level: 15, xp: 25, runes: '2earth 2water 1nature' },
  { id: 'spell-telegrab',        name: 'Telekinetic Grab',      level: 33, xp: 43, runes: '1air 1law' },
];

for (const s of UTILITY) {
  define({
    id: s.id, name: s.name, type: 'skill',
    requires: { levels: { magic: s.level } },
    atoms: {
      cooldown: { duration: 5 },
      xpDrop: { skills: { magic: s.xp } },
    },
    config: { runes: s.runes, spellbook: 'standard' }
  });
}

console.log(`[defs] Magic: ${STANDARD.length} standard, ${ANCIENTS.length} ancient, ${UTILITY.length} utility = ${STANDARD.length + ANCIENTS.length + UTILITY.length} spells`);
