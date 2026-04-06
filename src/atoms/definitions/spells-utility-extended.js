// ══════════════════════════════════════════════════════════════════════════════
// SPELLS: Lunar, teleports, enchants, utility — everything not combat
// ══════════════════════════════════════════════════════════════════════════════

const { define } = require('../mechanic');

const LUNAR_SPELLS = [
  { id: 'spell-lunar-home-tele',  name: 'Lunar Home Teleport', level: 0,  xp: 0 },
  { id: 'spell-bake-pie',        name: 'Bake Pie',            level: 65, xp: 60 },
  { id: 'spell-cure-plant',      name: 'Cure Plant',          level: 66, xp: 60 },
  { id: 'spell-npc-contact',     name: 'NPC Contact',         level: 67, xp: 63 },
  { id: 'spell-humidify',        name: 'Humidify',            level: 68, xp: 65 },
  { id: 'spell-hunter-kit',      name: 'Hunter Kit',          level: 71, xp: 70 },
  { id: 'spell-spin-flax-spell', name: 'Spin Flax (Lunar)',   level: 76, xp: 75 },
  { id: 'spell-superglass-make', name: 'Superglass Make',     level: 77, xp: 78 },
  { id: 'spell-tan-leather',     name: 'Tan Leather',         level: 78, xp: 81 },
  { id: 'spell-string-jewellery',name: 'String Jewellery',    level: 80, xp: 83 },
  { id: 'spell-plank-make',      name: 'Plank Make',          level: 86, xp: 90 },
  { id: 'spell-fertile-soil',    name: 'Fertile Soil',        level: 83, xp: 87 },
  { id: 'spell-boost-potion',    name: 'Boost Potion Share',  level: 84, xp: 88 },
  { id: 'spell-energy-transfer', name: 'Energy Transfer',     level: 91, xp: 100 },
  { id: 'spell-heal-other',      name: 'Heal Other',          level: 92, xp: 101 },
  { id: 'spell-vengeance',       name: 'Vengeance',           level: 94, xp: 112 },
  { id: 'spell-vengeance-other', name: 'Vengeance Other',     level: 93, xp: 108 },
  { id: 'spell-heal-group',      name: 'Heal Group',          level: 95, xp: 124 },
  { id: 'spell-spell-book-swap', name: 'Spellbook Swap',      level: 96, xp: 130 },
  // Lunar teleports
  { id: 'spell-tele-moonclan',   name: 'Moonclan Teleport',   level: 69, xp: 66 },
  { id: 'spell-tele-ourania',    name: 'Ourania Teleport',    level: 71, xp: 69 },
  { id: 'spell-tele-waterbirth', name: 'Waterbirth Teleport', level: 72, xp: 71 },
  { id: 'spell-tele-barbarian',  name: 'Barbarian Teleport',  level: 75, xp: 76 },
  { id: 'spell-tele-khazard',    name: 'Khazard Teleport',    level: 78, xp: 80 },
  { id: 'spell-tele-fishing-guild',name:'Fishing Guild Tele', level: 85, xp: 89 },
  { id: 'spell-tele-catherby',   name: 'Catherby Teleport',   level: 87, xp: 92 },
  { id: 'spell-tele-ice-plateau',name: 'Ice Plateau Tele',    level: 89, xp: 96 },
];

const ARCEUUS_SPELLS = [
  { id: 'spell-reanimate-goblin',  name: 'Reanimate Goblin',      level: 3,  xp: 6 },
  { id: 'spell-lumbridge-grave',   name: 'Lumbridge Graveyard',    level: 6,  xp: 10 },
  { id: 'spell-reanimate-monkey',  name: 'Reanimate Monkey',       level: 7,  xp: 14 },
  { id: 'spell-reanimate-imp',     name: 'Reanimate Imp',          level: 12, xp: 22 },
  { id: 'spell-reanimate-minotaur',name: 'Reanimate Minotaur',     level: 16, xp: 30 },
  { id: 'spell-draynor-manor-tele',name: 'Draynor Manor Tele',     level: 17, xp: 33 },
  { id: 'spell-reanimate-scorpion',name: 'Reanimate Scorpion',     level: 19, xp: 38 },
  { id: 'spell-mind-altar-tele',   name: 'Mind Altar Teleport',    level: 22, xp: 42 },
  { id: 'spell-reanimate-bear',    name: 'Reanimate Bear',         level: 21, xp: 40 },
  { id: 'spell-respawn-tele',      name: 'Respawn Teleport',       level: 34, xp: 58 },
  { id: 'spell-reanimate-unicorn', name: 'Reanimate Unicorn',      level: 22, xp: 44 },
  { id: 'spell-salve-grave-tele',  name: 'Salve Graveyard Tele',   level: 40, xp: 70 },
  { id: 'spell-reanimate-dog',     name: 'Reanimate Dog',          level: 26, xp: 52 },
  { id: 'spell-fenkenstrain-tele', name: 'Fenkenstrain Castle',    level: 48, xp: 80 },
  { id: 'spell-reanimate-chaos',   name: 'Reanimate Chaos Druid',  level: 30, xp: 60 },
  { id: 'spell-west-ardougne-tele',name: 'West Ardougne Tele',     level: 61, xp: 90 },
  { id: 'spell-reanimate-giant',   name: 'Reanimate Giant',        level: 37, xp: 74 },
  { id: 'spell-harmony-isle-tele', name: 'Harmony Island Tele',    level: 65, xp: 100 },
  { id: 'spell-reanimate-ogre',    name: 'Reanimate Ogre',         level: 40, xp: 80 },
  { id: 'spell-cemetery-tele',     name: 'Cemetery Teleport',      level: 71, xp: 110 },
  { id: 'spell-reanimate-elf',     name: 'Reanimate Elf',          level: 43, xp: 86 },
  { id: 'spell-reanimate-troll',   name: 'Reanimate Troll',        level: 46, xp: 92 },
  { id: 'spell-barrows-tele',      name: 'Barrows Teleport',       level: 83, xp: 120 },
  { id: 'spell-reanimate-horror',  name: 'Reanimate Horror',       level: 52, xp: 104 },
  { id: 'spell-ape-atoll-tele',    name: 'Ape Atoll Teleport',     level: 90, xp: 140 },
  { id: 'spell-reanimate-kalphite',name: 'Reanimate Kalphite',     level: 57, xp: 114 },
  { id: 'spell-reanimate-dagannoth',name:'Reanimate Dagannoth',    level: 62, xp: 124 },
  { id: 'spell-reanimate-bloodveld',name:'Reanimate Bloodveld',    level: 65, xp: 130 },
  { id: 'spell-reanimate-tzhaar',  name: 'Reanimate TzHaar',       level: 69, xp: 138 },
  { id: 'spell-reanimate-demon',   name: 'Reanimate Demon',        level: 72, xp: 144 },
  { id: 'spell-reanimate-aviansie',name: 'Reanimate Aviansie',     level: 78, xp: 156 },
  { id: 'spell-reanimate-abyssal', name: 'Reanimate Abyssal',      level: 85, xp: 170 },
  { id: 'spell-reanimate-dragon',  name: 'Reanimate Dragon',       level: 93, xp: 186 },
  { id: 'spell-sinister-offering', name: 'Sinister Offering',      level: 92, xp: 180 },
  { id: 'spell-demonic-offering',  name: 'Demonic Offering',       level: 84, xp: 160 },
  { id: 'spell-shadow-veil',       name: 'Shadow Veil',            level: 47, xp: 54 },
  { id: 'spell-vile-vigour',       name: 'Vile Vigour',            level: 66, xp: 86 },
  { id: 'spell-dark-lure',         name: 'Dark Lure',              level: 50, xp: 60 },
  { id: 'spell-mark-of-darkness',  name: 'Mark of Darkness',       level: 59, xp: 70 },
  { id: 'spell-ward-of-arceuus',   name: 'Ward of Arceuus',        level: 73, xp: 100 },
  { id: 'spell-death-charge',      name: 'Death Charge',           level: 80, xp: 120 },
  { id: 'spell-resurrect-crops',   name: 'Resurrect Crops',        level: 78, xp: 90 },
];

for (const s of LUNAR_SPELLS) {
  define({
    id: s.id, name: s.name, type: 'skill',
    requires: { levels: { magic: s.level } },
    atoms: { cooldown: { duration: 5 }, xpDrop: { skills: { magic: s.xp } } },
    config: { spellbook: 'lunar' }
  });
}

for (const s of ARCEUUS_SPELLS) {
  define({
    id: s.id, name: s.name, type: 'skill',
    requires: { levels: { magic: s.level } },
    atoms: { cooldown: { duration: 5 }, xpDrop: { skills: { magic: s.xp } } },
    config: { spellbook: 'arceuus' }
  });
}

console.log(`[defs] Spells Extended: ${LUNAR_SPELLS.length} lunar, ${ARCEUUS_SPELLS.length} arceuus = ${LUNAR_SPELLS.length + ARCEUUS_SPELLS.length} spells`);
