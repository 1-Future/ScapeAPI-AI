// ══════════════════════════════════════════════════════════════════════════════
// SKILL DEFINITIONS: Activity Skills (Agility, Thieving, Prayer, Crafting)
// ══════════════════════════════════════════════════════════════════════════════

const { define } = require('../mechanic');

// ── AGILITY COURSES ─────────────────────────────────────────────────────────
const COURSES = [
  { id: 'agil-gnome',        name: 'Gnome Stronghold Course',   level: 1,  xp: 86.5,   lapTicks: 45, obstacles: 7 },
  { id: 'agil-draynor',      name: 'Draynor Village Course',    level: 10, xp: 120,    lapTicks: 50, obstacles: 7 },
  { id: 'agil-al-kharid',    name: 'Al Kharid Course',          level: 20, xp: 180,    lapTicks: 55, obstacles: 8 },
  { id: 'agil-varrock',      name: 'Varrock Course',            level: 30, xp: 238,    lapTicks: 50, obstacles: 8 },
  { id: 'agil-canifis',      name: 'Canifis Course',            level: 40, xp: 240,    lapTicks: 44, obstacles: 8 },
  { id: 'agil-falador',      name: 'Falador Course',            level: 50, xp: 440,    lapTicks: 70, obstacles: 13 },
  { id: 'agil-seers',        name: 'Seers Village Course',      level: 60, xp: 570,    lapTicks: 43, obstacles: 5 },
  { id: 'agil-pollnivneach',name: 'Pollnivneach Course',        level: 70, xp: 890,    lapTicks: 52, obstacles: 9 },
  { id: 'agil-rellekka',     name: 'Rellekka Course',           level: 80, xp: 780,    lapTicks: 43, obstacles: 7 },
  { id: 'agil-ardougne',     name: 'Ardougne Course',           level: 90, xp: 793,    lapTicks: 38, obstacles: 6 },
  { id: 'agil-priff',        name: 'Prifddinas Course',         level: 75, xp: 1340,   lapTicks: 60, obstacles: 6 },
  { id: 'agil-hallowed-sep', name: 'Hallowed Sepulchre',        level: 52, xp: 2000,   lapTicks: 120, obstacles: 15 },
];

for (const c of COURSES) {
  define({
    id: c.id, name: c.name, type: 'skill',
    requires: { levels: { agility: c.level } },
    atoms: {
      round: { activeTicks: c.lapTicks },
      periodicAction: { interval: Math.ceil(c.lapTicks / c.obstacles), successRate: 0.95 },
      xpDrop: { skills: { agility: c.xp } },
    },
    config: { obstacles: c.obstacles }
  });
}

// ── THIEVING TARGETS ────────────────────────────────────────────────────────
const PICKPOCKETS = [
  { id: 'thiev-man',        name: 'Pickpocket Man',           level: 1,  xp: 8,    rate: 0.70, stunDmg: 1, stunTicks: 5 },
  { id: 'thiev-farmer',     name: 'Pickpocket Farmer',        level: 10, xp: 14.5, rate: 0.65, stunDmg: 1, stunTicks: 5 },
  { id: 'thiev-ham-female', name: 'Pickpocket HAM Member',    level: 15, xp: 18.5, rate: 0.60, stunDmg: 1, stunTicks: 5 },
  { id: 'thiev-warrior',    name: 'Pickpocket Warrior',       level: 25, xp: 26,   rate: 0.55, stunDmg: 2, stunTicks: 5 },
  { id: 'thiev-rogue',      name: 'Pickpocket Rogue',         level: 32, xp: 36.5, rate: 0.50, stunDmg: 2, stunTicks: 5 },
  { id: 'thiev-master-farm',name: 'Pickpocket Master Farmer', level: 38, xp: 43,   rate: 0.45, stunDmg: 3, stunTicks: 5 },
  { id: 'thiev-guard',      name: 'Pickpocket Guard',         level: 40, xp: 46.8, rate: 0.45, stunDmg: 2, stunTicks: 5 },
  { id: 'thiev-knight',     name: 'Pickpocket Knight',        level: 55, xp: 84.3, rate: 0.50, stunDmg: 3, stunTicks: 5 },
  { id: 'thiev-paladin',    name: 'Pickpocket Paladin',       level: 70, xp: 151.8,rate: 0.40, stunDmg: 3, stunTicks: 5 },
  { id: 'thiev-hero',       name: 'Pickpocket Hero',          level: 80, xp: 275.3,rate: 0.30, stunDmg: 4, stunTicks: 6 },
  { id: 'thiev-elf',        name: 'Pickpocket Elf',           level: 85, xp: 353.3,rate: 0.25, stunDmg: 5, stunTicks: 6 },
  { id: 'thiev-vyrewatch',  name: 'Pickpocket Vyre',          level: 82, xp: 306.9,rate: 0.30, stunDmg: 5, stunTicks: 6 },
];

for (const t of PICKPOCKETS) {
  define({
    id: t.id, name: t.name, type: 'skill',
    requires: { levels: { thieving: t.level } },
    atoms: {
      periodicAction: { interval: 4, successRate: t.rate, successMessage: `You pick the ${t.name.replace('Pickpocket ', '').toLowerCase()}'s pocket.`, failMessage: `You fail to pick the pocket. You've been stunned!`, failPenalty: { damage: t.stunDmg, stunTicks: t.stunTicks } },
      cooldown: { duration: t.stunTicks },
      xpDrop: { skills: { thieving: t.xp } },
      lootDrop: { table: [{ name: 'Coins', weight: 1, min: 3, max: 50 }] },
    }
  });
}

// ── PRAYER TRAINING ─────────────────────────────────────────────────────────
const BONES = [
  { id: 'bury-bones',        name: 'Bury Bones',         xp: 4.5,  bone: 'Bones' },
  { id: 'bury-big-bones',    name: 'Bury Big Bones',     xp: 15,   bone: 'Big bones' },
  { id: 'bury-baby-dragon',  name: 'Bury Baby Dragon',   xp: 30,   bone: 'Baby dragon bones' },
  { id: 'bury-dragon-bones', name: 'Bury Dragon Bones',  xp: 72,   bone: 'Dragon bones' },
  { id: 'bury-superior-drag',name: 'Bury Superior Dragon',xp: 150,  bone: 'Superior dragon bones' },
  { id: 'bury-dagannoth',    name: 'Bury Dagannoth',     xp: 125,  bone: 'Dagannoth bones' },
  { id: 'bury-wyvern',       name: 'Bury Wyvern Bones',  xp: 72,   bone: 'Wyvern bones' },
  { id: 'bury-lava-drag',    name: 'Bury Lava Dragon',   xp: 85,   bone: 'Lava dragon bones' },
  { id: 'altar-bones',       name: 'Use Bones on Altar', xp: 4.5,  bone: 'Bones' },
  { id: 'altar-dragon',      name: 'Dragon on Altar',    xp: 72,   bone: 'Dragon bones' },
  { id: 'altar-superior',    name: 'Superior on Altar',  xp: 150,  bone: 'Superior dragon bones' },
];

// Altar gives 3.5x XP
for (const b of BONES) {
  const isAltar = b.id.startsWith('altar-');
  define({
    id: b.id, name: b.name, type: 'skill',
    atoms: {
      periodicAction: { interval: isAltar ? 2 : 3, successRate: 1.0, successMessage: isAltar ? `The gods are pleased.` : `You bury the ${b.bone.toLowerCase()}.` },
      xpDrop: { skills: { prayer: isAltar ? b.xp * 3.5 : b.xp } },
    }
  });
}

// ── CRAFTING ────────────────────────────────────────────────────────────────
const CRAFTING = [
  { id: 'craft-leather-body', name: 'Craft Leather Body',  level: 14, xp: 25,  item: 'Leather body' },
  { id: 'craft-leather-chaps',name: 'Craft Leather Chaps', level: 18, xp: 27,  item: 'Leather chaps' },
  { id: 'craft-hard-body',   name: 'Craft Hard Leather',   level: 28, xp: 35,  item: 'Hardleather body' },
  { id: 'craft-green-dhide', name: 'Craft Green D-hide',   level: 63, xp: 62,  item: 'Green dragonhide body' },
  { id: 'craft-blue-dhide',  name: 'Craft Blue D-hide',    level: 71, xp: 70,  item: 'Blue dragonhide body' },
  { id: 'craft-red-dhide',   name: 'Craft Red D-hide',     level: 77, xp: 78,  item: 'Red dragonhide body' },
  { id: 'craft-black-dhide', name: 'Craft Black D-hide',   level: 84, xp: 86,  item: 'Black dragonhide body' },
  { id: 'craft-cut-sapphire',name: 'Cut Sapphire',         level: 20, xp: 50,  item: 'Sapphire' },
  { id: 'craft-cut-emerald', name: 'Cut Emerald',          level: 27, xp: 67.5,item: 'Emerald' },
  { id: 'craft-cut-ruby',    name: 'Cut Ruby',             level: 43, xp: 85,  item: 'Ruby' },
  { id: 'craft-cut-diamond', name: 'Cut Diamond',          level: 43, xp: 107.5,item: 'Diamond' },
  { id: 'craft-cut-dragonstone',name:'Cut Dragonstone',    level: 55, xp: 137.5,item: 'Dragonstone' },
  { id: 'craft-cut-onyx',    name: 'Cut Onyx',             level: 67, xp: 167.5,item: 'Onyx' },
  { id: 'craft-cut-zenyte',  name: 'Cut Zenyte',           level: 89, xp: 200, item: 'Zenyte' },
  { id: 'craft-gold-ring',   name: 'Craft Gold Ring',      level: 5,  xp: 15,  item: 'Gold ring' },
  { id: 'craft-gold-necklace',name:'Craft Gold Necklace',  level: 6,  xp: 20,  item: 'Gold necklace' },
  { id: 'craft-gold-amulet', name: 'Craft Gold Amulet',    level: 8,  xp: 30,  item: 'Gold amulet (u)' },
  { id: 'craft-spin-flax',   name: 'Spin Flax',            level: 10, xp: 15,  item: 'Bow string' },
  { id: 'craft-glassblowing', name: 'Glassblowing',        level: 1,  xp: 20,  item: 'Beer glass' },
];

for (const c of CRAFTING) {
  define({
    id: c.id, name: c.name, type: 'skill',
    requires: { levels: { crafting: c.level } },
    atoms: {
      periodicAction: { interval: 3, successRate: 1.0, successMessage: `You craft a ${c.item.toLowerCase()}.` },
      xpDrop: { skills: { crafting: c.xp } },
      lootDrop: { table: [{ name: c.item, weight: 1, min: 1, max: 1 }] },
    }
  });
}

const total = COURSES.length + PICKPOCKETS.length + BONES.length + CRAFTING.length;
console.log(`[defs] Activity: ${COURSES.length} courses, ${PICKPOCKETS.length} pickpockets, ${BONES.length} bones, ${CRAFTING.length} crafting = ${total} mechanics`);
