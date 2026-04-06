// ══════════════════════════════════════════════════════════════════════════════
// EQUIPMENT: Armor sets, shields, helmets, boots, gloves, capes, rings, necks
// ══════════════════════════════════════════════════════════════════════════════

const { define } = require('../mechanic');

// Melee armor sets (helmet, body, legs, shield per metal)
const ARMOR_SETS = [
  { metal: 'Bronze',   defReq: 1,  stabDef: 5,  slashDef: 8,  crushDef: 6 },
  { metal: 'Iron',     defReq: 1,  stabDef: 10, slashDef: 14, crushDef: 11 },
  { metal: 'Steel',    defReq: 5,  stabDef: 15, slashDef: 19, crushDef: 16 },
  { metal: 'Mithril',  defReq: 20, stabDef: 20, slashDef: 25, crushDef: 22 },
  { metal: 'Adamant',  defReq: 30, stabDef: 31, slashDef: 37, crushDef: 33 },
  { metal: 'Rune',     defReq: 40, stabDef: 44, slashDef: 50, crushDef: 46 },
  { metal: 'Dragon',   defReq: 60, stabDef: 60, slashDef: 68, crushDef: 63 },
];

const ARMOR_SLOTS = [
  { slot: 'full helm', defMult: 0.5 },
  { slot: 'platebody', defMult: 1.0 },
  { slot: 'platelegs', defMult: 0.7 },
  { slot: 'plateskirt', defMult: 0.7 },
  { slot: 'kiteshield', defMult: 0.6 },
  { slot: 'med helm', defMult: 0.35 },
  { slot: 'sq shield', defMult: 0.4 },
  { slot: 'chainbody', defMult: 0.7 },
];

let count = 0;
for (const a of ARMOR_SETS) {
  for (const s of ARMOR_SLOTS) {
    const id = `equip-${a.metal.toLowerCase()}-${s.slot.replace(/\s+/g, '-')}`;
    define({
      id, name: `${a.metal} ${s.slot}`, type: 'equipment',
      requires: { levels: { defence: a.defReq } },
      atoms: {},
      config: {
        slot: s.slot.includes('helm') ? 'head' : s.slot.includes('body') || s.slot.includes('chain') ? 'body' : s.slot.includes('leg') || s.slot.includes('skirt') ? 'legs' : 'shield',
        stats: { def_stab: Math.round(a.stabDef * s.defMult), def_slash: Math.round(a.slashDef * s.defMult), def_crush: Math.round(a.crushDef * s.defMult) }
      }
    });
    count++;
  }
}

// High-level armor
const HIGH_ARMOR = [
  { id: 'equip-bandos-chestplate', name: 'Bandos Chestplate', defReq: 65, slot: 'body', stats: { def_stab: 98, def_slash: 93, def_crush: 105, strength: 4, prayer: 1 } },
  { id: 'equip-bandos-tassets',    name: 'Bandos Tassets',     defReq: 65, slot: 'legs', stats: { def_stab: 71, def_slash: 63, def_crush: 66, strength: 2, prayer: 1 } },
  { id: 'equip-bandos-boots',     name: 'Bandos Boots',       defReq: 65, slot: 'boots', stats: { def_stab: 15, def_slash: 17, def_crush: 16, strength: 1 } },
  { id: 'equip-torva-platebody',  name: 'Torva Platebody',    defReq: 80, slot: 'body', stats: { def_stab: 108, def_slash: 103, def_crush: 115, strength: 6, prayer: 1, hitpoints: 6 } },
  { id: 'equip-torva-platelegs',  name: 'Torva Platelegs',    defReq: 80, slot: 'legs', stats: { def_stab: 76, def_slash: 68, def_crush: 72, strength: 4, prayer: 1, hitpoints: 4 } },
  { id: 'equip-torva-full-helm',  name: 'Torva Full Helm',    defReq: 80, slot: 'head', stats: { def_stab: 56, def_slash: 59, def_crush: 63, strength: 3, hitpoints: 3 } },
  { id: 'equip-armadyl-chest',    name: 'Armadyl Chestplate', defReq: 70, slot: 'body', stats: { def_stab: 68, def_ranged: 77, ranged: 33, prayer: 1 } },
  { id: 'equip-armadyl-skirt',    name: 'Armadyl Chainskirt', defReq: 70, slot: 'legs', stats: { def_stab: 44, def_ranged: 57, ranged: 20, prayer: 1 } },
  { id: 'equip-armadyl-helmet',   name: 'Armadyl Helmet',     defReq: 70, slot: 'head', stats: { def_stab: 6, def_ranged: 10, ranged: 10, prayer: 1 } },
  { id: 'equip-crystal-body',     name: 'Crystal Body',       defReq: 70, slot: 'body', stats: { def_stab: 36, def_slash: 44, def_crush: 48, def_ranged: 64, ranged: 15, prayer: 3 } },
  { id: 'equip-crystal-legs',     name: 'Crystal Legs',       defReq: 70, slot: 'legs', stats: { def_stab: 22, def_slash: 26, def_crush: 30, def_ranged: 40, ranged: 8, prayer: 2 } },
  { id: 'equip-crystal-helm',     name: 'Crystal Helm',       defReq: 70, slot: 'head', stats: { def_stab: 6, def_slash: 8, def_crush: 10, def_ranged: 10, ranged: 9, prayer: 1 } },
  { id: 'equip-ancestral-hat',    name: 'Ancestral Hat',      defReq: 65, slot: 'head', stats: { magic: 8, magic_damage: 0.02, prayer: 2 } },
  { id: 'equip-ancestral-robe-top',name:'Ancestral Robe Top', defReq: 65, slot: 'body', stats: { magic: 35, magic_damage: 0.02, prayer: 2 } },
  { id: 'equip-ancestral-bottom', name: 'Ancestral Robe Bottom',defReq: 65, slot: 'legs', stats: { magic: 26, magic_damage: 0.02, prayer: 2 } },
  { id: 'equip-justiciar-faceguard',name:'Justiciar Faceguard',defReq: 75, slot: 'head', stats: { def_stab: 60, def_slash: 67, def_crush: 70, prayer: 4 } },
  { id: 'equip-justiciar-chest',  name: 'Justiciar Chestguard',defReq: 75, slot: 'body', stats: { def_stab: 132, def_slash: 124, def_crush: 140, prayer: 4 } },
  { id: 'equip-justiciar-legs',   name: 'Justiciar Legguards',defReq: 75, slot: 'legs', stats: { def_stab: 84, def_slash: 76, def_crush: 80, prayer: 4 } },
  { id: 'equip-inquisitor-helm',  name: "Inquisitor's Great Helm",defReq: 70, slot: 'head', stats: { def_crush: 8, strength: 4, prayer: 2 } },
  { id: 'equip-inquisitor-haubrk',name: "Inquisitor's Hauberk",defReq: 70, slot: 'body', stats: { def_crush: 16, strength: 8, prayer: 4 } },
  { id: 'equip-inquisitor-plate', name: "Inquisitor's Plateskirt",defReq: 70, slot: 'legs', stats: { def_crush: 10, strength: 6, prayer: 3 } },
  // Accessories
  { id: 'equip-fire-cape',        name: 'Fire Cape',          defReq: 1,  slot: 'cape', stats: { strength: 4, def_stab: 11, def_slash: 11, def_crush: 11, prayer: 2 } },
  { id: 'equip-infernal-cape',    name: 'Infernal Cape',      defReq: 1,  slot: 'cape', stats: { strength: 8, def_stab: 12, def_slash: 12, def_crush: 12, prayer: 2 } },
  { id: 'equip-avas-assembler',   name: "Ava's Assembler",    defReq: 1,  slot: 'cape', stats: { ranged: 20, ranged_strength: 2, prayer: 2 } },
  { id: 'equip-berserker-ring',   name: 'Berserker Ring',     defReq: 1,  slot: 'ring', stats: { strength: 4 } },
  { id: 'equip-berserker-ring-i', name: 'Berserker Ring (i)', defReq: 1,  slot: 'ring', stats: { strength: 8 } },
  { id: 'equip-archers-ring',     name: 'Archers Ring',       defReq: 1,  slot: 'ring', stats: { ranged: 4 } },
  { id: 'equip-archers-ring-i',   name: 'Archers Ring (i)',   defReq: 1,  slot: 'ring', stats: { ranged: 8 } },
  { id: 'equip-seers-ring',       name: 'Seers Ring',         defReq: 1,  slot: 'ring', stats: { magic: 4 } },
  { id: 'equip-seers-ring-i',     name: 'Seers Ring (i)',     defReq: 1,  slot: 'ring', stats: { magic: 8 } },
  { id: 'equip-amulet-fury',      name: 'Amulet of Fury',    defReq: 1,  slot: 'neck', stats: { attack: 10, strength: 6, ranged: 10, magic: 10, def_stab: 15, prayer: 5 } },
  { id: 'equip-amulet-torture',   name: 'Amulet of Torture', defReq: 1,  slot: 'neck', stats: { attack: 15, strength: 10, prayer: 2 } },
  { id: 'equip-necklace-anguish', name: 'Necklace of Anguish',defReq: 1, slot: 'neck', stats: { ranged: 15, ranged_strength: 5, prayer: 2 } },
  { id: 'equip-occult-necklace',  name: 'Occult Necklace',    defReq: 1,  slot: 'neck', stats: { magic: 12, magic_damage: 0.10 } },
  { id: 'equip-barrows-gloves',   name: 'Barrows Gloves',     defReq: 40, slot: 'gloves', stats: { attack: 12, strength: 12, ranged: 12, magic: 6, def_stab: 12 } },
  { id: 'equip-ferocious-gloves', name: 'Ferocious Gloves',   defReq: 80, slot: 'gloves', stats: { attack: 16, strength: 14 } },
  { id: 'equip-pegasian-boots',   name: 'Pegasian Boots',     defReq: 75, slot: 'boots', stats: { ranged: 12, def_stab: 5, def_slash: 5, def_crush: 5 } },
  { id: 'equip-primordial-boots', name: 'Primordial Boots',   defReq: 75, slot: 'boots', stats: { strength: 5, attack: 2, def_stab: 22, def_slash: 22, def_crush: 22 } },
  { id: 'equip-eternal-boots',    name: 'Eternal Boots',      defReq: 75, slot: 'boots', stats: { magic: 8, def_magic: 8 } },
  { id: 'equip-dragon-defender',  name: 'Dragon Defender',    defReq: 60, slot: 'shield', stats: { attack: 25, strength: 6, def_stab: 20, def_slash: 19, def_crush: 18 } },
  { id: 'equip-avernic-defender', name: 'Avernic Defender',   defReq: 70, slot: 'shield', stats: { attack: 30, strength: 8, def_stab: 23, def_slash: 22, def_crush: 21 } },
  { id: 'equip-elysian-spirit',   name: 'Elysian Spirit Shield',defReq: 75, slot: 'shield', stats: { def_stab: 73, def_slash: 75, def_crush: 72, def_magic: 2, def_ranged: 72, prayer: 3 } },
  { id: 'equip-spectral-spirit',  name: 'Spectral Spirit Shield',defReq: 75, slot: 'shield', stats: { def_stab: 60, def_slash: 62, def_crush: 58, def_magic: 30, prayer: 3 } },
  { id: 'equip-arcane-spirit',    name: 'Arcane Spirit Shield',defReq: 75, slot: 'shield', stats: { def_stab: 53, def_slash: 55, def_crush: 52, magic: 20, prayer: 3 } },
  { id: 'equip-serpentine-helm',  name: 'Serpentine Helm',     defReq: 75, slot: 'head', stats: { def_stab: 52, def_slash: 55, def_crush: 58, strength: 5 } },
  { id: 'equip-neitiznot-faceguard',name:'Neitiznot Faceguard',defReq: 70, slot: 'head', stats: { def_stab: 34, def_slash: 36, def_crush: 38, strength: 6, prayer: 3 } },
  { id: 'equip-slayer-helm-i',    name: 'Slayer Helmet (i)',   defReq: 10, slot: 'head', stats: { def_stab: 30, def_slash: 32, def_crush: 27 } },
];

for (const a of HIGH_ARMOR) {
  define({
    id: a.id, name: a.name, type: 'equipment',
    requires: { levels: { defence: a.defReq } },
    atoms: {},
    config: { slot: a.slot, stats: a.stats }
  });
}

console.log(`[defs] Equipment: ${count} metal armor, ${HIGH_ARMOR.length} high-level = ${count + HIGH_ARMOR.length} pieces`);
