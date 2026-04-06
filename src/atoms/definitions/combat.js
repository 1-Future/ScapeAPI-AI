// ══════════════════════════════════════════════════════════════════════════════
// COMBAT DEFINITIONS: Weapons + Food + Potions
// ══════════════════════════════════════════════════════════════════════════════

const { define } = require('../mechanic');

// ── MELEE WEAPONS ───────────────────────────────────────────────────────────
const MELEE = [
  { id: 'wpn-bronze-scim',   name: 'Bronze Scimitar',     level: 1,  speed: 4, maxHit: 4,  bonus: 7,  style: 'slash' },
  { id: 'wpn-iron-scim',     name: 'Iron Scimitar',       level: 1,  speed: 4, maxHit: 6,  bonus: 10, style: 'slash' },
  { id: 'wpn-steel-scim',    name: 'Steel Scimitar',      level: 5,  speed: 4, maxHit: 9,  bonus: 15, style: 'slash' },
  { id: 'wpn-mithril-scim',  name: 'Mithril Scimitar',    level: 20, speed: 4, maxHit: 12, bonus: 21, style: 'slash' },
  { id: 'wpn-adamant-scim',  name: 'Adamant Scimitar',    level: 30, speed: 4, maxHit: 16, bonus: 29, style: 'slash' },
  { id: 'wpn-rune-scim',     name: 'Rune Scimitar',       level: 40, speed: 4, maxHit: 20, bonus: 45, style: 'slash' },
  { id: 'wpn-dragon-scim',   name: 'Dragon Scimitar',     level: 60, speed: 4, maxHit: 25, bonus: 67, style: 'slash' },
  { id: 'wpn-abyssal-whip',  name: 'Abyssal Whip',        level: 70, speed: 4, maxHit: 28, bonus: 82, style: 'slash' },
  { id: 'wpn-tentacle',      name: 'Abyssal Tentacle',    level: 75, speed: 4, maxHit: 30, bonus: 90, style: 'slash' },
  { id: 'wpn-blade-saeldor', name: 'Blade of Saeldor',    level: 80, speed: 4, maxHit: 32, bonus: 94, style: 'slash' },
  { id: 'wpn-rapier',        name: 'Ghrazi Rapier',       level: 80, speed: 4, maxHit: 32, bonus: 94, style: 'stab' },
  { id: 'wpn-dds',            name: 'Dragon Dagger',      level: 60, speed: 4, maxHit: 20, bonus: 40, style: 'stab' },
  { id: 'wpn-ags',            name: 'Armadyl Godsword',   level: 75, speed: 6, maxHit: 48, bonus: 132, style: 'slash' },
  { id: 'wpn-bgs',            name: 'Bandos Godsword',    level: 75, speed: 6, maxHit: 48, bonus: 132, style: 'slash' },
  { id: 'wpn-sgs',            name: 'Saradomin Godsword', level: 75, speed: 6, maxHit: 48, bonus: 132, style: 'slash' },
  { id: 'wpn-zgs',            name: 'Zamorak Godsword',   level: 75, speed: 6, maxHit: 48, bonus: 132, style: 'slash' },
  { id: 'wpn-dragon-claws',  name: 'Dragon Claws',        level: 60, speed: 4, maxHit: 22, bonus: 57, style: 'slash' },
  { id: 'wpn-scythe',        name: 'Scythe of Vitur',     level: 80, speed: 5, maxHit: 35, bonus: 70, style: 'slash' },
];

for (const w of MELEE) {
  define({
    id: w.id, name: w.name, type: 'combat',
    requires: { levels: { attack: w.level } },
    atoms: {
      cooldown: { duration: w.speed },
      hitCheck: { maxHit: w.maxHit, style: w.style, bonus: w.bonus },
      protectionCheck: true,
      xpDrop: { skills: { attack: 4, hitpoints: 1.33 } },
    },
    config: { speed: w.speed, bonus: w.bonus }
  });
}

// ── RANGED WEAPONS ──────────────────────────────────────────────────────────
const RANGED = [
  { id: 'wpn-shortbow',      name: 'Shortbow',            level: 1,  speed: 4, maxHit: 5,  bonus: 8,  range: 7 },
  { id: 'wpn-oak-short',     name: 'Oak Shortbow',        level: 5,  speed: 4, maxHit: 8,  bonus: 14, range: 7 },
  { id: 'wpn-willow-short',  name: 'Willow Shortbow',     level: 20, speed: 4, maxHit: 11, bonus: 20, range: 7 },
  { id: 'wpn-maple-short',   name: 'Maple Shortbow',      level: 30, speed: 4, maxHit: 14, bonus: 29, range: 7 },
  { id: 'wpn-yew-short',     name: 'Yew Shortbow',        level: 40, speed: 4, maxHit: 17, bonus: 47, range: 7 },
  { id: 'wpn-magic-short',   name: 'Magic Shortbow',      level: 50, speed: 3, maxHit: 20, bonus: 69, range: 7 },
  { id: 'wpn-rune-cbow',     name: 'Rune Crossbow',       level: 61, speed: 5, maxHit: 22, bonus: 90, range: 7 },
  { id: 'wpn-dragon-cbow',   name: 'Dragon Crossbow',     level: 64, speed: 5, maxHit: 24, bonus: 94, range: 7 },
  { id: 'wpn-acb',            name: 'Armadyl Crossbow',   level: 70, speed: 5, maxHit: 26, bonus: 100, range: 7 },
  { id: 'wpn-dcb',            name: 'Dragon Hunter CB',   level: 65, speed: 5, maxHit: 24, bonus: 95, range: 7 },
  { id: 'wpn-blowpipe',      name: 'Toxic Blowpipe',      level: 75, speed: 3, maxHit: 24, bonus: 60, range: 5 },
  { id: 'wpn-tbow',          name: 'Twisted Bow',          level: 85, speed: 5, maxHit: 41, bonus: 70, range: 10 },
  { id: 'wpn-bowfa',         name: 'Bow of Faerdhinen',   level: 80, speed: 4, maxHit: 36, bonus: 128, range: 10 },
  { id: 'wpn-zaryte-cbow',   name: 'Zaryte Crossbow',     level: 80, speed: 5, maxHit: 28, bonus: 110, range: 7 },
];

for (const w of RANGED) {
  define({
    id: w.id, name: w.name, type: 'combat',
    requires: { levels: { ranged: w.level } },
    atoms: {
      cooldown: { duration: w.speed },
      hitCheck: { maxHit: w.maxHit, style: 'ranged', bonus: w.bonus },
      protectionCheck: true,
      delayedAction: { baseDelay: 1 },
      xpDrop: { skills: { ranged: 4, hitpoints: 1.33 } },
    },
    config: { speed: w.speed, range: w.range }
  });
}

// ── FOOD ────────────────────────────────────────────────────────────────────
const FOOD = [
  { id: 'eat-shrimps',     name: 'Eat Shrimps',     heals: 3 },
  { id: 'eat-trout',       name: 'Eat Trout',       heals: 7 },
  { id: 'eat-salmon',      name: 'Eat Salmon',      heals: 9 },
  { id: 'eat-tuna',        name: 'Eat Tuna',        heals: 10 },
  { id: 'eat-lobster',     name: 'Eat Lobster',     heals: 12 },
  { id: 'eat-swordfish',   name: 'Eat Swordfish',   heals: 14 },
  { id: 'eat-monkfish',    name: 'Eat Monkfish',    heals: 16 },
  { id: 'eat-karambwan',   name: 'Eat Karambwan',   heals: 18 },
  { id: 'eat-shark',       name: 'Eat Shark',       heals: 20 },
  { id: 'eat-manta-ray',   name: 'Eat Manta Ray',   heals: 22 },
  { id: 'eat-dark-crab',   name: 'Eat Dark Crab',   heals: 22 },
  { id: 'eat-anglerfish',  name: 'Eat Anglerfish',  heals: 22 },
  { id: 'eat-cake',        name: 'Eat Cake',        heals: 12 },
  { id: 'eat-pizza',       name: 'Eat Pizza',       heals: 11 },
  { id: 'eat-pie',         name: 'Eat Pie',         heals: 8 },
  { id: 'eat-bread',       name: 'Eat Bread',       heals: 5 },
];

for (const f of FOOD) {
  define({
    id: f.id, name: f.name, type: 'consumable',
    atoms: {
      cooldown: { duration: 3 },
      consume: { healHp: f.heals },
    }
  });
}

// ── POTIONS ─────────────────────────────────────────────────────────────────
const DRINKABLES = [
  { id: 'drink-attack-pot',    name: 'Drink Attack Potion',    effect: { boosts: { attack: 13 } } },
  { id: 'drink-strength-pot',  name: 'Drink Strength Potion',  effect: { boosts: { strength: 13 } } },
  { id: 'drink-defence-pot',   name: 'Drink Defence Potion',   effect: { boosts: { defence: 13 } } },
  { id: 'drink-super-attack',  name: 'Drink Super Attack',     effect: { boosts: { attack: 19 } } },
  { id: 'drink-super-str',     name: 'Drink Super Strength',   effect: { boosts: { strength: 19 } } },
  { id: 'drink-super-def',     name: 'Drink Super Defence',    effect: { boosts: { defence: 19 } } },
  { id: 'drink-ranging',       name: 'Drink Ranging Potion',   effect: { boosts: { ranged: 13 } } },
  { id: 'drink-magic',         name: 'Drink Magic Potion',     effect: { boosts: { magic: 9 } } },
  { id: 'drink-prayer',        name: 'Drink Prayer Potion',    effect: { restorePrayer: 31 } },
  { id: 'drink-super-restore', name: 'Drink Super Restore',    effect: { restorePrayer: 32 } },
  { id: 'drink-sara-brew',     name: 'Drink Saradomin Brew',   effect: { healHp: 16, boosts: { defence: 2 }, drains: { attack: 2, strength: 2, magic: 2, ranged: 2 } } },
  { id: 'drink-antifire',      name: 'Drink Antifire',         effect: {} },
  { id: 'drink-antivenom',     name: 'Drink Anti-venom',       effect: { curePoison: true } },
  { id: 'drink-stamina',       name: 'Drink Stamina',          effect: { runEnergy: 2000 } },
  { id: 'drink-bastion',       name: 'Drink Bastion',          effect: { boosts: { ranged: 13, defence: 19 } } },
  { id: 'drink-combat',        name: 'Drink Super Combat',     effect: { boosts: { attack: 19, strength: 19, defence: 19 } } },
];

for (const d of DRINKABLES) {
  define({
    id: d.id, name: d.name, type: 'consumable',
    atoms: {
      cooldown: { duration: 3 },
      doseSystem: true,
      consume: d.effect,
    }
  });
}

const total = MELEE.length + RANGED.length + FOOD.length + DRINKABLES.length;
console.log(`[defs] Combat: ${MELEE.length} melee, ${RANGED.length} ranged, ${FOOD.length} food, ${DRINKABLES.length} potions = ${total} mechanics`);
