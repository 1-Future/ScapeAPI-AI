// ══════════════════════════════════════════════════════════════════════════════
// PRAYER DEFINITIONS: Every activatable prayer
// ══════════════════════════════════════════════════════════════════════════════

const { define } = require('../mechanic');

const PRAYERS = [
  // Normal prayers
  { id: 'pray-thick-skin',     name: 'Thick Skin',           level: 1,  drainRate: 3,  effect: { defence: 1.05 } },
  { id: 'pray-burst-str',      name: 'Burst of Strength',    level: 4,  drainRate: 3,  effect: { strength: 1.05 } },
  { id: 'pray-clarity',        name: 'Clarity of Thought',   level: 7,  drainRate: 3,  effect: { attack: 1.05 } },
  { id: 'pray-sharp-eye',      name: 'Sharp Eye',            level: 8,  drainRate: 3,  effect: { ranged: 1.05 } },
  { id: 'pray-mystic-will',    name: 'Mystic Will',          level: 9,  drainRate: 3,  effect: { magic: 1.05 } },
  { id: 'pray-rock-skin',      name: 'Rock Skin',            level: 10, drainRate: 6,  effect: { defence: 1.10 } },
  { id: 'pray-superhuman-str', name: 'Superhuman Strength',  level: 13, drainRate: 6,  effect: { strength: 1.10 } },
  { id: 'pray-improved-refl',  name: 'Improved Reflexes',    level: 16, drainRate: 6,  effect: { attack: 1.10 } },
  { id: 'pray-rapid-restore',  name: 'Rapid Restore',        level: 19, drainRate: 1,  effect: { statRestore: 2 } },
  { id: 'pray-rapid-heal',     name: 'Rapid Heal',           level: 22, drainRate: 2,  effect: { hpRegen: 2 } },
  { id: 'pray-protect-item',   name: 'Protect Item',         level: 25, drainRate: 2,  effect: { keepExtra: 1 } },
  { id: 'pray-hawk-eye',       name: 'Hawk Eye',             level: 26, drainRate: 6,  effect: { ranged: 1.10 } },
  { id: 'pray-mystic-lore',    name: 'Mystic Lore',          level: 27, drainRate: 6,  effect: { magic: 1.10 } },
  { id: 'pray-steel-skin',     name: 'Steel Skin',           level: 28, drainRate: 12, effect: { defence: 1.15 } },
  { id: 'pray-ultimate-str',   name: 'Ultimate Strength',    level: 31, drainRate: 12, effect: { strength: 1.15 } },
  { id: 'pray-incredible-refl',name: 'Incredible Reflexes',  level: 34, drainRate: 12, effect: { attack: 1.15 } },
  { id: 'pray-protect-magic',  name: 'Protect from Magic',   level: 37, drainRate: 12, effect: { protection: 'magic' } },
  { id: 'pray-protect-range',  name: 'Protect from Missiles',level: 40, drainRate: 12, effect: { protection: 'ranged' } },
  { id: 'pray-protect-melee',  name: 'Protect from Melee',   level: 43, drainRate: 12, effect: { protection: 'melee' } },
  { id: 'pray-eagle-eye',      name: 'Eagle Eye',            level: 44, drainRate: 12, effect: { ranged: 1.15 } },
  { id: 'pray-mystic-might',   name: 'Mystic Might',         level: 45, drainRate: 12, effect: { magic: 1.15 } },
  { id: 'pray-retribution',    name: 'Retribution',          level: 46, drainRate: 3,  effect: { deathDamage: true } },
  { id: 'pray-redemption',     name: 'Redemption',           level: 49, drainRate: 6,  effect: { healOnLow: true } },
  { id: 'pray-smite',          name: 'Smite',                level: 52, drainRate: 18, effect: { drainPrayer: true } },
  { id: 'pray-preserve',       name: 'Preserve',             level: 55, drainRate: 3,  effect: { boostDuration: 1.5 } },
  { id: 'pray-chivalry',       name: 'Chivalry',             level: 60, drainRate: 24, effect: { attack: 1.15, strength: 1.18, defence: 1.20 } },
  { id: 'pray-piety',          name: 'Piety',                level: 70, drainRate: 24, effect: { attack: 1.20, strength: 1.23, defence: 1.25 } },
  { id: 'pray-rigour',         name: 'Rigour',               level: 74, drainRate: 24, effect: { ranged: 1.20, rangedStr: 1.23, defence: 1.25 } },
  { id: 'pray-augury',         name: 'Augury',               level: 77, drainRate: 24, effect: { magic: 1.25, magicDef: 1.25, defence: 1.25 } },
];

for (const p of PRAYERS) {
  define({
    id: p.id, name: p.name, type: 'passive',
    requires: { levels: { prayer: p.level } },
    atoms: {
      tickCycle: { rate: p.drainRate, threshold: 60 },
      instant: true,
    },
    config: { drainRate: p.drainRate, ...p.effect }
  });
}

console.log(`[defs] Prayers: ${PRAYERS.length} prayers`);
