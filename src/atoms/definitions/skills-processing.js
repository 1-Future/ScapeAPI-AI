// ══════════════════════════════════════════════════════════════════════════════
// SKILL DEFINITIONS: Processing (Cooking, Smithing, Firemaking, Herblore, etc.)
// ══════════════════════════════════════════════════════════════════════════════

const { define } = require('../mechanic');

// ── COOKING ─────────────────────────────────────────────────────────────────
const COOKABLES = [
  { id: 'cook-shrimps',    name: 'Cook Shrimps',    level: 1,  xp: 30,  burn: 0.30, food: 'Shrimps',    heals: 3 },
  { id: 'cook-sardine',    name: 'Cook Sardine',    level: 1,  xp: 40,  burn: 0.25, food: 'Sardine',    heals: 4 },
  { id: 'cook-herring',    name: 'Cook Herring',    level: 5,  xp: 50,  burn: 0.25, food: 'Herring',    heals: 5 },
  { id: 'cook-trout',      name: 'Cook Trout',      level: 15, xp: 70,  burn: 0.20, food: 'Trout',      heals: 7 },
  { id: 'cook-salmon',     name: 'Cook Salmon',     level: 25, xp: 90,  burn: 0.18, food: 'Salmon',     heals: 9 },
  { id: 'cook-tuna',       name: 'Cook Tuna',       level: 30, xp: 100, burn: 0.15, food: 'Tuna',       heals: 10 },
  { id: 'cook-lobster',    name: 'Cook Lobster',    level: 40, xp: 120, burn: 0.12, food: 'Lobster',    heals: 12 },
  { id: 'cook-swordfish',  name: 'Cook Swordfish',  level: 45, xp: 140, burn: 0.10, food: 'Swordfish',  heals: 14 },
  { id: 'cook-monkfish',   name: 'Cook Monkfish',   level: 62, xp: 150, burn: 0.08, food: 'Monkfish',   heals: 16 },
  { id: 'cook-shark',      name: 'Cook Shark',      level: 80, xp: 210, burn: 0.05, food: 'Shark',      heals: 20 },
  { id: 'cook-anglerfish', name: 'Cook Anglerfish', level: 84, xp: 230, burn: 0.04, food: 'Anglerfish', heals: 22 },
  { id: 'cook-manta-ray',  name: 'Cook Manta Ray',  level: 91, xp: 216, burn: 0.03, food: 'Manta ray',  heals: 22 },
  { id: 'cook-dark-crab',  name: 'Cook Dark Crab',  level: 90, xp: 215, burn: 0.03, food: 'Dark crab',  heals: 22 },
  { id: 'cook-karambwan',  name: 'Cook Karambwan',  level: 30, xp: 190, burn: 0.05, food: 'Cooked karambwan', heals: 18 },
  { id: 'cook-bread',      name: 'Cook Bread',      level: 1,  xp: 40,  burn: 0.30, food: 'Bread',      heals: 5 },
  { id: 'cook-pie-shell',  name: 'Cook Pie Shell',  level: 10, xp: 50,  burn: 0.20, food: 'Pie shell',  heals: 0 },
  { id: 'cook-pizza',      name: 'Cook Pizza',      level: 35, xp: 143, burn: 0.10, food: 'Plain pizza', heals: 11 },
  { id: 'cook-cake',       name: 'Cook Cake',       level: 40, xp: 180, burn: 0.08, food: 'Cake',       heals: 12 },
];

for (const c of COOKABLES) {
  define({
    id: c.id, name: c.name, type: 'skill',
    requires: { levels: { cooking: c.level } },
    atoms: {
      periodicAction: { interval: 4, successRate: 1 - c.burn, successMessage: `You cook the ${c.food.toLowerCase()}.`, failMessage: `You burn the ${c.food.toLowerCase()}.` },
      xpDrop: { skills: { cooking: c.xp } },
      lootDrop: { table: [{ name: c.food, weight: 1, min: 1, max: 1 }] },
    },
    config: { heals: c.heals }
  });
}

// ── SMITHING (Smelting) ─────────────────────────────────────────────────────
const BARS = [
  { id: 'smelt-bronze',    name: 'Smelt Bronze',    level: 1,  xp: 6.2,  bar: 'Bronze bar' },
  { id: 'smelt-iron',      name: 'Smelt Iron',      level: 15, xp: 12.5, bar: 'Iron bar' },
  { id: 'smelt-silver',    name: 'Smelt Silver',    level: 20, xp: 13.7, bar: 'Silver bar' },
  { id: 'smelt-steel',     name: 'Smelt Steel',     level: 30, xp: 17.5, bar: 'Steel bar' },
  { id: 'smelt-gold',      name: 'Smelt Gold',      level: 40, xp: 22.5, bar: 'Gold bar' },
  { id: 'smelt-mithril',   name: 'Smelt Mithril',   level: 50, xp: 30,   bar: 'Mithril bar' },
  { id: 'smelt-adamantite',name: 'Smelt Adamantite',level: 70, xp: 37.5, bar: 'Adamantite bar' },
  { id: 'smelt-runite',    name: 'Smelt Runite',    level: 85, xp: 50,   bar: 'Runite bar' },
];

for (const b of BARS) {
  define({
    id: b.id, name: b.name, type: 'skill',
    requires: { levels: { smithing: b.level } },
    atoms: {
      periodicAction: { interval: 4, successRate: 1.0, successMessage: `You smelt a ${b.bar.toLowerCase()}.` },
      xpDrop: { skills: { smithing: b.xp } },
      lootDrop: { table: [{ name: b.bar, weight: 1, min: 1, max: 1 }] },
    }
  });
}

// ── FIREMAKING ──────────────────────────────────────────────────────────────
const LOGS_FM = [
  { id: 'burn-logs',       name: 'Burn Logs',       level: 1,  xp: 40,   log: 'Logs' },
  { id: 'burn-oak',        name: 'Burn Oak Logs',   level: 15, xp: 60,   log: 'Oak logs' },
  { id: 'burn-willow',     name: 'Burn Willow Logs',level: 30, xp: 90,   log: 'Willow logs' },
  { id: 'burn-teak',       name: 'Burn Teak Logs',  level: 35, xp: 105,  log: 'Teak logs' },
  { id: 'burn-maple',      name: 'Burn Maple Logs', level: 45, xp: 135,  log: 'Maple logs' },
  { id: 'burn-mahogany',   name: 'Burn Mahogany',   level: 50, xp: 157.5,log: 'Mahogany logs' },
  { id: 'burn-yew',        name: 'Burn Yew Logs',   level: 60, xp: 202.5,log: 'Yew logs' },
  { id: 'burn-magic',      name: 'Burn Magic Logs', level: 75, xp: 303.8,log: 'Magic logs' },
  { id: 'burn-redwood',    name: 'Burn Redwood',    level: 90, xp: 350,  log: 'Redwood logs' },
];

for (const l of LOGS_FM) {
  define({
    id: l.id, name: l.name, type: 'skill',
    requires: { levels: { firemaking: l.level }, items: ['Tinderbox'] },
    atoms: {
      periodicAction: { interval: 4, successRate: 0.95, successMessage: 'The fire catches and the logs begin to burn.' },
      xpDrop: { skills: { firemaking: l.xp } },
    }
  });
}

// ── HERBLORE ────────────────────────────────────────────────────────────────
const POTIONS = [
  { id: 'make-attack-pot',    name: 'Make Attack Potion',    level: 3,  xp: 25,  potion: 'Attack potion(3)' },
  { id: 'make-strength-pot',  name: 'Make Strength Potion',  level: 12, xp: 50,  potion: 'Strength potion(3)' },
  { id: 'make-defence-pot',   name: 'Make Defence Potion',   level: 30, xp: 75,  potion: 'Defence potion(3)' },
  { id: 'make-prayer-pot',    name: 'Make Prayer Potion',    level: 38, xp: 87.5,potion: 'Prayer potion(3)' },
  { id: 'make-super-attack',  name: 'Make Super Attack',     level: 45, xp: 100, potion: 'Super attack(3)' },
  { id: 'make-super-str',     name: 'Make Super Strength',   level: 55, xp: 125, potion: 'Super strength(3)' },
  { id: 'make-super-def',     name: 'Make Super Defence',    level: 66, xp: 150, potion: 'Super defence(3)' },
  { id: 'make-ranging-pot',   name: 'Make Ranging Potion',   level: 72, xp: 162.5,potion: 'Ranging potion(3)' },
  { id: 'make-super-restore', name: 'Make Super Restore',    level: 63, xp: 142.5,potion: 'Super restore(3)' },
  { id: 'make-sara-brew',     name: 'Make Saradomin Brew',   level: 81, xp: 180, potion: 'Saradomin brew(3)' },
  { id: 'make-antifire',      name: 'Make Antifire',         level: 69, xp: 157.5,potion: 'Antifire potion(3)' },
  { id: 'make-antivenom',     name: 'Make Anti-venom',       level: 87, xp: 210, potion: 'Anti-venom(3)' },
  { id: 'make-stamina',       name: 'Make Stamina Potion',   level: 77, xp: 102, potion: 'Stamina potion(3)' },
  { id: 'make-bastion',       name: 'Make Bastion Potion',   level: 80, xp: 155, potion: 'Bastion potion(3)' },
];

for (const p of POTIONS) {
  define({
    id: p.id, name: p.name, type: 'skill',
    requires: { levels: { herblore: p.level } },
    atoms: {
      periodicAction: { interval: 2, successRate: 1.0, successMessage: `You mix the ${p.potion.replace(/\(\d\)/, '').trim().toLowerCase()}.` },
      xpDrop: { skills: { herblore: p.xp } },
      lootDrop: { table: [{ name: p.potion, weight: 1, min: 1, max: 1 }] },
    }
  });
}

// ── FLETCHING ────────────────────────────────────────────────────────────────
const FLETCH = [
  { id: 'fletch-arrow-shaft',   name: 'Fletch Arrow Shafts',   level: 1,  xp: 5,  item: 'Arrow shaft' },
  { id: 'fletch-shortbow-u',    name: 'Fletch Shortbow (u)',    level: 5,  xp: 5,  item: 'Shortbow (u)' },
  { id: 'fletch-longbow-u',     name: 'Fletch Longbow (u)',     level: 10, xp: 10, item: 'Longbow (u)' },
  { id: 'fletch-oak-short-u',   name: 'Fletch Oak Shortbow',   level: 20, xp: 16.5,item: 'Oak shortbow (u)' },
  { id: 'fletch-oak-long-u',    name: 'Fletch Oak Longbow',    level: 25, xp: 25, item: 'Oak longbow (u)' },
  { id: 'fletch-willow-short',  name: 'Fletch Willow Short',   level: 35, xp: 33.3,item: 'Willow shortbow (u)' },
  { id: 'fletch-willow-long',   name: 'Fletch Willow Long',    level: 40, xp: 41.5,item: 'Willow longbow (u)' },
  { id: 'fletch-maple-short',   name: 'Fletch Maple Short',    level: 50, xp: 50, item: 'Maple shortbow (u)' },
  { id: 'fletch-maple-long',    name: 'Fletch Maple Long',     level: 55, xp: 58.3,item: 'Maple longbow (u)' },
  { id: 'fletch-yew-short',     name: 'Fletch Yew Short',      level: 65, xp: 67.5,item: 'Yew shortbow (u)' },
  { id: 'fletch-yew-long',      name: 'Fletch Yew Long',       level: 70, xp: 75, item: 'Yew longbow (u)' },
  { id: 'fletch-magic-short',   name: 'Fletch Magic Short',    level: 80, xp: 83.3,item: 'Magic shortbow (u)' },
  { id: 'fletch-magic-long',    name: 'Fletch Magic Long',     level: 85, xp: 91.5,item: 'Magic longbow (u)' },
];

for (const f of FLETCH) {
  define({
    id: f.id, name: f.name, type: 'skill',
    requires: { levels: { fletching: f.level } },
    atoms: {
      periodicAction: { interval: 3, successRate: 1.0, successMessage: `You carefully cut the wood into a ${f.item.toLowerCase()}.` },
      xpDrop: { skills: { fletching: f.xp } },
      lootDrop: { table: [{ name: f.item, weight: 1, min: 1, max: 1 }] },
    }
  });
}

// ── RUNECRAFT ───────────────────────────────────────────────────────────────
const RUNES = [
  { id: 'craft-air-rune',    name: 'Craft Air Runes',    level: 1,  xp: 5,   rune: 'Air rune' },
  { id: 'craft-mind-rune',   name: 'Craft Mind Runes',   level: 2,  xp: 5.5, rune: 'Mind rune' },
  { id: 'craft-water-rune',  name: 'Craft Water Runes',  level: 5,  xp: 6,   rune: 'Water rune' },
  { id: 'craft-earth-rune',  name: 'Craft Earth Runes',  level: 9,  xp: 6.5, rune: 'Earth rune' },
  { id: 'craft-fire-rune',   name: 'Craft Fire Runes',   level: 14, xp: 7,   rune: 'Fire rune' },
  { id: 'craft-body-rune',   name: 'Craft Body Runes',   level: 20, xp: 7.5, rune: 'Body rune' },
  { id: 'craft-cosmic-rune', name: 'Craft Cosmic Runes', level: 27, xp: 8,   rune: 'Cosmic rune' },
  { id: 'craft-chaos-rune',  name: 'Craft Chaos Runes',  level: 35, xp: 8.5, rune: 'Chaos rune' },
  { id: 'craft-nature-rune', name: 'Craft Nature Runes', level: 44, xp: 9,   rune: 'Nature rune' },
  { id: 'craft-law-rune',    name: 'Craft Law Runes',    level: 54, xp: 9.5, rune: 'Law rune' },
  { id: 'craft-death-rune',  name: 'Craft Death Runes',  level: 65, xp: 10,  rune: 'Death rune' },
  { id: 'craft-blood-rune',  name: 'Craft Blood Runes',  level: 77, xp: 23.8,rune: 'Blood rune' },
  { id: 'craft-soul-rune',   name: 'Craft Soul Runes',   level: 90, xp: 29.7,rune: 'Soul rune' },
  { id: 'craft-wrath-rune',  name: 'Craft Wrath Runes',  level: 95, xp: 8,   rune: 'Wrath rune' },
];

for (const r of RUNES) {
  define({
    id: r.id, name: r.name, type: 'skill',
    requires: { levels: { runecraft: r.level }, items: ['Pure essence'] },
    atoms: {
      periodicAction: { interval: 1, successRate: 1.0, successMessage: `You craft some ${r.rune.toLowerCase()}s.` },
      xpDrop: { skills: { runecraft: r.xp } },
      lootDrop: { table: [{ name: r.rune, weight: 1, min: 1, max: 1 }] },
    }
  });
}

const total = COOKABLES.length + BARS.length + LOGS_FM.length + POTIONS.length + FLETCH.length + RUNES.length;
console.log(`[defs] Processing: ${COOKABLES.length} cookables, ${BARS.length} bars, ${LOGS_FM.length} logs, ${POTIONS.length} potions, ${FLETCH.length} fletch, ${RUNES.length} runes = ${total} mechanics`);
