#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// scripts/generate-item-db.js
//
// Generates the Scape canonical item database JSONs into data/items/*.
// Run once during burn; regenerate whenever tier tables need adjustment.
//
// Everything is Scape-flavored (no "Varrock", no OSRS deity names). Item IDs
// are snake_case strings (e.g., "runeforge_scimitar"). Numeric IDs from the
// legacy src/data/items.js system are intentionally NOT reused.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'data', 'items');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

const writeJson = (file, data) => {
  const p = path.join(OUT, file);
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
  console.log(`wrote ${p} (${Array.isArray(data) ? data.length : Object.keys(data).length} entries)`);
};

// ══════════════════════════════════════════════════════════════════════════════
// TIER SPEC — Scape-flavored lineage. Marstead: each has a niche/tradeoff.
// ══════════════════════════════════════════════════════════════════════════════

const TIERS = [
  { key: 'tinroot',     t: 0,  req: 1,   mult: 1.00, valueMult: 1,   weightMod: 1.0, color: 'pale copper-tin alloy flecked with bark', note: 'Heartlands starter alloy — brittle but light.',             flavor: 'Smiths of the Heartlands pour tin over soft copper roots.' },
  { key: 'pigiron',     t: 1,  req: 1,   mult: 1.20, valueMult: 2,   weightMod: 1.1, color: 'matte grey pigiron with forge scale',        note: 'Rough iron, tough but heavy.',                              flavor: 'Cheapest working metal. Rusts if left wet.' },
  { key: 'coalsteel',   t: 2,  req: 5,   mult: 1.55, valueMult: 5,   weightMod: 1.0, color: 'charcoal-dark steel with a blue sheen',      note: 'Sootworks-forged steel, carbon-hardened.',                  flavor: 'Coal-fired Sootworks crucible steel. Standard militia kit.' },
  { key: 'brassforge',  t: 3,  req: 10,  mult: 1.85, valueMult: 8,   weightMod: 1.1, color: 'dark bronze-brass with patina',              note: 'Monster-drop only — not smithable.',                        flavor: 'Brass-bandit armour. Dropped, not forged. Surprisingly stout.' },
  { key: 'quicksilver', t: 4,  req: 20,  mult: 2.30, valueMult: 16,  weightMod: 0.7, color: 'silvery-blue mercurial sheen',               note: 'Weighs 30% less than same-tier steel.',                     flavor: 'Quicksilver vein from Moryskah. Light, but poor against crushing blows.' },
  { key: 'blacksteel',  t: 5,  req: 30,  mult: 2.70, valueMult: 25,  weightMod: 1.0, color: 'gloss black steel with silver edge',         note: 'Strong all-round — common endgame floor.',                  flavor: 'Blacksmiths quench Coalsteel in whaleoil from Saltbrine to make Blacksteel.' },
  { key: 'darkiron',    t: 6,  req: 40,  mult: 3.10, valueMult: 45,  weightMod: 1.2, color: 'deep iron-black with veined texture',         note: 'Heavy but wrecks armour (+10% armour-break).',             flavor: 'Pit-ore from Moryskah crypts. Bleeds a faint black soot.' },
  { key: 'runeforge',   t: 7,  req: 50,  mult: 3.60, valueMult: 90,  weightMod: 0.9, color: 'bright cyan rune-etched steel',              note: 'Rune-etched: scales with magic level (+1% per magic lvl over 50).', flavor: 'Forged at Heartlands Rune Altar, each piece sings faintly.' },
  { key: 'dragonsteel', t: 8,  req: 60,  mult: 4.10, valueMult: 180, weightMod: 0.8, color: 'blood-red dragon-forged steel',              note: 'Dragon special attacks (one per 30s).',                     flavor: 'Smelted with dragon bones. Craftable only after the Reaper\'s Hymn quest.' },
  { key: 'aeldra',      t: 9,  req: 70,  mult: 4.70, valueMult: 420, weightMod: 0.7, color: 'luminous pale-green elven alloy',            note: 'Degrades — needs aeldra_charge reagent every 10 hours of combat.', flavor: 'Veilwood moonglass fused with elvish song. Sings when swung.' },
  { key: 'wyrmforged',  t: 10, req: 75,  mult: 5.40, valueMult: 900, weightMod: 0.6, color: 'iridescent wyrm-scale lattice',              note: 'Post-Aeldra. Encounter-specific BiS via reagent recipes.',   flavor: 'Wyrm-scale lattice forged at the heart of the Glass Desert forge.' },
];

// ══════════════════════════════════════════════════════════════════════════════
// EQUIPMENT
// ══════════════════════════════════════════════════════════════════════════════

// Weapon archetypes. Each has a niche — Marstead sidegrade principle.
// Speed: 1 = very slow, 7 = rapid. OSRS-style numbering, 4 = baseline scimitar speed.
const WEAPON_FAMILIES = [
  // id_suffix, name_fragment, slot, speed, atk_bias, str_bias, niche
  { k: 'dagger',       n: 'dagger',      s: 'weapon', spd: 4, atkKey: 'stab',  strFactor: 0.55, niche: 'fastest stab; best DPS for low-def bosses' },
  { k: 'shortsword',   n: 'shortsword',  s: 'weapon', spd: 4, atkKey: 'stab',  strFactor: 0.75, niche: 'balanced stab; no special attack cost' },
  { k: 'longsword',    n: 'longsword',   s: 'weapon', spd: 5, atkKey: 'slash', strFactor: 0.95, niche: 'slower slash; higher per-hit dmg' },
  { k: 'scimitar',     n: 'scimitar',    s: 'weapon', spd: 4, atkKey: 'slash', strFactor: 0.85, niche: 'fast slash; the all-rounder' },
  { k: 'mace',         n: 'mace',        s: 'weapon', spd: 4, atkKey: 'crush', strFactor: 0.80, niche: 'crush; +1 prayer bonus per tier' },
  { k: 'battleaxe',    n: 'battleaxe',   s: 'weapon', spd: 6, atkKey: 'slash', strFactor: 1.10, niche: 'slow slash; top per-hit str' },
  { k: 'warhammer',    n: 'warhammer',   s: 'weapon', spd: 6, atkKey: 'crush', strFactor: 1.15, niche: 'slow crush; best vs plate armour' },
  { k: 'two_hander',   n: '2h sword',    s: 'weapon', spd: 7, atkKey: 'slash', strFactor: 1.40, niche: 'slowest, highest per-swing; no shield' },
  { k: 'halberd',      n: 'halberd',     s: 'weapon', spd: 6, atkKey: 'stab',  strFactor: 1.20, niche: '2-tile reach; safespot giants' },
  { k: 'spear',        n: 'spear',       s: 'weapon', spd: 5, atkKey: 'stab',  strFactor: 1.00, niche: 'balanced stab/slash/crush — 3-style versatile' },
];

const ARMOR_PIECES = [
  // key, name_suffix, slot, base_def_stab, base_def_slash, base_def_crush, base_def_magic, base_def_ranged, weight
  { k: 'helm',     n: 'helm',      s: 'head',   ds: 10, dl: 12, dc: 8,  dm: 0,  dr: 10, w: 2.7 },
  { k: 'platebody',n: 'platebody', s: 'body',   ds: 30, dl: 32, dc: 24, dm: -4, dr: 28, w: 9.0 },
  { k: 'platelegs',n: 'platelegs', s: 'legs',   ds: 18, dl: 19, dc: 17, dm: -2, dr: 16, w: 8.0 },
  { k: 'boots',    n: 'boots',     s: 'feet',   ds: 4,  dl: 5,  dc: 3,  dm: 0,  dr: 4,  w: 1.0 },
  { k: 'gauntlets',n: 'gauntlets', s: 'hands',  ds: 3,  dl: 3,  dc: 3,  dm: 0,  dr: 3,  w: 0.5 },
  { k: 'kiteshield',n:'kiteshield',s: 'shield', ds: 14, dl: 16, dc: 12, dm: -4, dr: 14, w: 5.5 },
  { k: 'cape',     n: 'cape',      s: 'cape',   ds: 1,  dl: 1,  dc: 1,  dm: 1,  dr: 1,  w: 0.3 },
  { k: 'ring',     n: 'ring',      s: 'ring',   ds: 0,  dl: 0,  dc: 0,  dm: 0,  dr: 0,  w: 0.0 },
  { k: 'amulet',   n: 'amulet',    s: 'neck',   ds: 1,  dl: 1,  dc: 1,  dm: 2,  dr: 1,  w: 0.1 },
];

// Ranged archetypes
const RANGED_FAMILIES = [
  { k: 'shortbow',   n: 'shortbow',   spd: 4, rngBias: 0.95, strBias: 0.70, req: 'ranged', niche: 'fast, short-range' },
  { k: 'longbow',    n: 'longbow',    spd: 6, rngBias: 1.15, strBias: 1.15, req: 'ranged', niche: 'slow, long-range, higher per-shot' },
  { k: 'crossbow',   n: 'crossbow',   spd: 6, rngBias: 1.00, strBias: 0.00, req: 'ranged', niche: 'uses bolts; shield-compatible' },
  { k: 'thrown',     n: 'throwing knives', spd: 3, rngBias: 0.75, strBias: 0.80, req: 'ranged', niche: 'very fast, stackable ammo=weapon' },
];

// Magic archetypes
const MAGIC_FAMILIES = [
  { k: 'staff',  n: 'staff',  spd: 5, magBias: 1.00, niche: 'two-handed magic; casts combat spells' },
  { k: 'wand',   n: 'wand',   spd: 4, magBias: 0.80, niche: 'one-handed; shield-compatible' },
];

const equipment = [];
const idSet = new Set();
const addEquip = (item) => {
  if (idSet.has(item.id)) throw new Error('duplicate equip id: ' + item.id);
  idSet.add(item.id);
  equipment.push(item);
};

// Build melee weapons: 10 families × 11 tiers = 110 items
for (const tier of TIERS) {
  for (const fam of WEAPON_FAMILIES) {
    const base = Math.round(8 * tier.mult);
    const atk = base;
    const str = Math.round(base * fam.strFactor);
    const stats = { melee_strength: str };
    stats[`attack_${fam.atkKey}`] = atk;
    // Mace: extra prayer bonus
    if (fam.k === 'mace') stats.prayer = Math.ceil(tier.t / 3);
    // Spear: multi-style (stab + slash + crush)
    if (fam.k === 'spear') {
      stats.attack_stab = atk;
      stats.attack_slash = Math.round(atk * 0.7);
      stats.attack_crush = Math.round(atk * 0.7);
    }
    // Halberd: 2-tile reach (flag)
    const tags = [];
    if (fam.k === 'halberd') tags.push('reach_2');
    if (fam.k === 'two_hander') tags.push('two_handed');
    if (tier.key === 'aeldra') tags.push('degrades');
    if (tier.key === 'wyrmforged') tags.push('degrades', 'requires_charge');

    const reqs = {};
    const reqSkill = (fam.k === 'halberd' || fam.k === 'spear') ? 'attack' : 'attack';
    reqs[reqSkill] = tier.req;
    if (fam.k === 'two_hander' || fam.k === 'battleaxe' || fam.k === 'warhammer') reqs.strength = Math.max(1, tier.req - 5);

    const baseWeight = fam.k === 'dagger' ? 0.5 : fam.k === 'two_hander' ? 4.0 : fam.k === 'halberd' ? 3.5 : fam.k === 'battleaxe' ? 2.5 : fam.k === 'warhammer' ? 3.0 : fam.k === 'spear' ? 2.0 : fam.k === 'mace' ? 1.2 : fam.k === 'longsword' ? 2.0 : 1.5;
    const weight = Math.round(baseWeight * tier.weightMod * 10) / 10;

    addEquip({
      id: `${tier.key}_${fam.k}`,
      name: `${cap(tier.key)} ${fam.n}`,
      slot: 'weapon',
      tier: tier.t,
      tier_name: tier.key,
      family: fam.k,
      category: 'melee',
      speed: fam.spd,
      stats,
      requirements: reqs,
      weight,
      value: 20 * tier.valueMult * (fam.k === 'two_hander' || fam.k === 'halberd' ? 2 : 1),
      tradeable: true,
      tags,
      examine: `A ${tier.key} ${fam.n}. ${fam.niche}.`,
      flavor: tier.flavor,
    });
  }
}

// Build armor: 9 pieces × 11 tiers = 99 items
for (const tier of TIERS) {
  for (const piece of ARMOR_PIECES) {
    const m = tier.mult;
    const stats = {
      defence_stab: Math.round(piece.ds * m),
      defence_slash: Math.round(piece.dl * m),
      defence_crush: Math.round(piece.dc * m),
      defence_magic: Math.round(piece.dm * m),
      defence_ranged: Math.round(piece.dr * m),
    };
    if (piece.k === 'cape') { stats.prayer = Math.ceil(tier.t / 4); }
    if (piece.k === 'ring')   { stats.melee_strength = Math.ceil(tier.t / 3); stats.attack_stab = Math.ceil(tier.t / 3); }
    if (piece.k === 'amulet') { stats.melee_strength = Math.ceil(tier.t / 2); stats.attack_slash = Math.ceil(tier.t / 2); stats.prayer = Math.ceil(tier.t / 4); }

    const weight = Math.round(piece.w * tier.weightMod * 10) / 10;
    const tags = [];
    if (tier.key === 'aeldra') tags.push('degrades');
    if (tier.key === 'wyrmforged') tags.push('degrades', 'requires_charge');

    const reqs = {};
    // Armor gates on defence
    reqs.defence = tier.req;
    // Rings/amulets don't gate on defence
    if (piece.k === 'ring' || piece.k === 'amulet') delete reqs.defence;
    if (piece.k === 'cape' && tier.t >= 7) reqs.prayer = Math.max(1, tier.req - 30);

    const valueMod = piece.k === 'platebody' ? 3 : piece.k === 'platelegs' ? 2 : piece.k === 'kiteshield' ? 2 : piece.k === 'ring' ? 0.5 : piece.k === 'amulet' ? 0.5 : piece.k === 'cape' ? 0.5 : 1;

    addEquip({
      id: `${tier.key}_${piece.k}`,
      name: `${cap(tier.key)} ${piece.n}`,
      slot: piece.s,
      tier: tier.t,
      tier_name: tier.key,
      family: piece.k,
      category: 'armor',
      stats,
      requirements: reqs,
      weight,
      value: Math.round(30 * tier.valueMult * valueMod),
      tradeable: true,
      tags,
      examine: `${cap(tier.key)} ${piece.n}. ${tier.note}`,
      flavor: tier.flavor,
    });
  }
}

// Ranged: 4 families × 11 tiers, skip thrown for t0/t1 (inappropriate)
for (const tier of TIERS) {
  for (const fam of RANGED_FAMILIES) {
    if (fam.k === 'thrown' && tier.t < 1) continue;
    const base = Math.round(10 * tier.mult);
    const stats = { attack_ranged: Math.round(base * fam.rngBias), ranged_strength: Math.round(base * fam.strBias) };
    const reqs = { ranged: tier.req };
    const tags = fam.k === 'thrown' ? ['stackable_weapon'] : [];
    if (tier.key === 'aeldra') tags.push('degrades');
    if (tier.key === 'wyrmforged') tags.push('degrades', 'requires_charge');
    const weight = fam.k === 'thrown' ? 0 : fam.k === 'crossbow' ? 3 : fam.k === 'longbow' ? 1.8 : 1.5;
    addEquip({
      id: `${tier.key}_${fam.k}`,
      name: `${cap(tier.key)} ${fam.n}`,
      slot: 'weapon',
      tier: tier.t,
      tier_name: tier.key,
      family: fam.k,
      category: 'ranged',
      speed: fam.spd,
      stats,
      requirements: reqs,
      weight: Math.round(weight * tier.weightMod * 10) / 10,
      value: Math.round(25 * tier.valueMult),
      tradeable: true,
      tags,
      examine: `${cap(tier.key)} ${fam.n}. ${fam.niche}.`,
      flavor: tier.flavor,
    });
  }
}

// Magic staves/wands: 2 families × 11 tiers
for (const tier of TIERS) {
  for (const fam of MAGIC_FAMILIES) {
    const base = Math.round(6 * tier.mult);
    const stats = { attack_magic: Math.round(base * fam.magBias), magic_damage: Math.round(tier.t / 2) };
    if (fam.k === 'staff') stats.attack_crush = Math.round(base * 0.5);
    const reqs = { magic: tier.req, attack: Math.max(1, tier.req - 10) };
    const tags = [];
    if (tier.key === 'aeldra') tags.push('degrades');
    if (tier.key === 'wyrmforged') tags.push('degrades', 'requires_charge');
    if (fam.k === 'staff') tags.push('two_handed');
    addEquip({
      id: `${tier.key}_${fam.k}`,
      name: `${cap(tier.key)} ${fam.n}`,
      slot: 'weapon',
      tier: tier.t,
      tier_name: tier.key,
      family: fam.k,
      category: 'magic',
      speed: fam.spd,
      stats,
      requirements: reqs,
      weight: Math.round((fam.k === 'staff' ? 2.5 : 1.0) * tier.weightMod * 10) / 10,
      value: Math.round(30 * tier.valueMult),
      tradeable: true,
      tags,
      examine: `${cap(tier.key)} ${fam.n}. ${fam.niche}.`,
      flavor: tier.flavor,
    });
  }
}

// Ranged-armor sets (dragonhide equivalents — Scape flavor: scaleweave, huntscale, etc.)
const RANGED_SETS = [
  { key: 'cowhide',     req: 1,  mult: 1.0,  flavor: 'Cowhide from Heartlands pastures.' },
  { key: 'deerhide',    req: 15, mult: 1.4,  flavor: 'Veilwood stag leather; dappled.' },
  { key: 'boarhide',    req: 25, mult: 1.7,  flavor: 'Sootworks boar — coarse, fireproof.' },
  { key: 'wyvern',      req: 40, mult: 2.3,  flavor: 'Wyvern scales from Moryskah crypts.' },
  { key: 'firedrake',   req: 50, mult: 2.8,  flavor: 'Glass Desert firedrake — heat-treated.' },
  { key: 'brinescale',  req: 60, mult: 3.3,  flavor: 'Saltbrine seawyrm scales.' },
  { key: 'shadowhide',  req: 70, mult: 3.9,  flavor: 'Inkweald shadowhide — ink-stained.' },
  { key: 'wyrmscale',   req: 75, mult: 4.6,  flavor: 'Crystal wyrm endgame set.' },
];
const RANGED_ARMOR_SLOTS = [
  { k: 'coif',    s: 'head',  w: 0.5, vm: 0.6 },
  { k: 'body',    s: 'body',  w: 3.5, vm: 1.5 },
  { k: 'chaps',   s: 'legs',  w: 2.5, vm: 1.2 },
  { k: 'vambraces', s: 'hands', w: 0.3, vm: 0.5 },
  { k: 'boots',   s: 'feet',  w: 0.5, vm: 0.5 },
];
for (const set of RANGED_SETS) {
  for (const slot of RANGED_ARMOR_SLOTS) {
    const base = Math.round(6 * set.mult);
    addEquip({
      id: `${set.key}_${slot.k}`,
      name: `${cap(set.key)} ${slot.k}`,
      slot: slot.s,
      tier: Math.floor(set.req / 10),
      tier_name: set.key,
      family: slot.k,
      category: 'ranged_armor',
      stats: {
        attack_ranged: Math.round(base * 0.6),
        defence_ranged: Math.round(base * 1.2),
        defence_magic:  Math.round(base * 0.7),
        defence_slash: -Math.round(base * 0.5),
      },
      requirements: { ranged: set.req, defence: Math.max(1, set.req - 20) },
      weight: slot.w,
      value: Math.round(200 * set.mult * slot.vm),
      tradeable: true,
      tags: [],
      examine: `${cap(set.key)} ${slot.k}. ${set.flavor}`,
      flavor: set.flavor,
    });
  }
}

// Magic robe sets — Scape-flavor
const MAGE_SETS = [
  { key: 'apprentice',  req: 1,  mult: 1.0, flavor: 'Heartlands apprentice-linen.' },
  { key: 'mystic',      req: 40, mult: 2.2, flavor: 'Inkweald-dyed linen; pages stitched into hem.' },
  { key: 'inkweald',    req: 60, mult: 3.2, flavor: 'Inkweald high-mage robes; ink bleeds when cast.' },
  { key: 'moonweave',   req: 75, mult: 4.3, flavor: 'Veilwood moonweave — end-game mage kit.' },
];
const MAGE_ARMOR_SLOTS = [
  { k: 'hat',     s: 'head', w: 0.3, vm: 0.5 },
  { k: 'robe_top',s: 'body', w: 2.0, vm: 1.5 },
  { k: 'robe_bottom', s: 'legs', w: 1.5, vm: 1.2 },
  { k: 'gloves',  s: 'hands', w: 0.2, vm: 0.4 },
  { k: 'boots',   s: 'feet',  w: 0.3, vm: 0.5 },
];
for (const set of MAGE_SETS) {
  for (const slot of MAGE_ARMOR_SLOTS) {
    const base = Math.round(5 * set.mult);
    addEquip({
      id: `${set.key}_${slot.k}`,
      name: `${cap(set.key)} ${slot.k.replace('_', ' ')}`,
      slot: slot.s,
      tier: Math.floor(set.req / 10),
      tier_name: set.key,
      family: slot.k,
      category: 'magic_armor',
      stats: {
        attack_magic: Math.round(base * 0.7),
        defence_magic: Math.round(base * 1.3),
        defence_ranged: -Math.round(base * 0.5),
        magic_damage: slot.k === 'robe_top' ? Math.ceil(set.req / 20) : 0,
      },
      requirements: { magic: set.req, defence: Math.max(1, Math.floor(set.req / 3)) },
      weight: slot.w,
      value: Math.round(300 * set.mult * slot.vm),
      tradeable: true,
      tags: [],
      examine: `${cap(set.key)} ${slot.k.replace('_', ' ')}. ${set.flavor}`,
      flavor: set.flavor,
    });
  }
}

// Unique post-Dragon / post-Aeldra named pieces (non-tier, niche BiS via reagents later)
const UNIQUES = [
  { id: 'heartlands_champion_crest',   slot: 'head',   category: 'armor', name: 'Heartlands Champion Crest',   stats: { defence_stab: 35, defence_slash: 35, defence_crush: 30, attack_slash: 2, prayer: 1 }, requirements: { defence: 60, attack: 60 }, weight: 2.5, value: 1_800_000, tradeable: false, flavor: 'Awarded after Heartlands Grand Diary elite.', tags: ['untradeable_reward'] },
  { id: 'moryskah_lichbane_pendant',   slot: 'neck',   category: 'jewellery', name: 'Lichbane Pendant',        stats: { attack_crush: 8, prayer: 4, melee_strength: 4 }, requirements: { prayer: 55 }, weight: 0.1, value: 2_400_000, tradeable: false, flavor: 'Pendant forged in a Moryskah cryptfire. +20% dmg to undead.', tags: ['bonus_vs_undead'] },
  { id: 'boneyard_mummy_wrap',         slot: 'body',   category: 'armor', name: 'Sealed Mummy Wrap',            stats: { defence_stab: 40, defence_slash: 42, defence_magic: 15, prayer: 3 }, requirements: { defence: 50, prayer: 35 }, weight: 3.0, value: 1_200_000, tradeable: true, flavor: 'Linen wraps from a Boneyard pharaoh. Pulses faintly.', tags: [] },
  { id: 'glass_prism_shield',          slot: 'shield', category: 'armor', name: 'Prism Shield',                 stats: { defence_stab: 45, defence_slash: 48, defence_crush: 42, defence_magic: 25, defence_ranged: 40 }, requirements: { defence: 70, magic: 50 }, weight: 5.0, value: 3_600_000, tradeable: true, flavor: 'A Glass Desert shield that refracts spells. 10% magic damage reflect.', tags: ['spell_reflect'] },
  { id: 'saltbrine_drowner_amulet',    slot: 'neck',   category: 'jewellery', name: 'Drowner Amulet',          stats: { attack_ranged: 10, attack_magic: 6, prayer: 2 }, requirements: { ranged: 60 }, weight: 0.1, value: 2_100_000, tradeable: false, flavor: 'Worn by Saltbrine deep-divers. Unlimited breath.', tags: ['unlimited_breath'] },
  { id: 'veilwood_moon_circlet',       slot: 'head',   category: 'jewellery', name: 'Moon Circlet',             stats: { attack_magic: 12, magic_damage: 3, prayer: 2 }, requirements: { magic: 70 }, weight: 0.3, value: 2_800_000, tradeable: false, flavor: 'Night-only — stats drop to zero during daylight.', tags: ['night_only'] },
  { id: 'inkweald_bound_tome',         slot: 'shield', category: 'magic_armor', name: 'Bound Tome',            stats: { attack_magic: 18, magic_damage: 4, defence_magic: 20, prayer: 3 }, requirements: { magic: 75, prayer: 50 }, weight: 1.2, value: 4_200_000, tradeable: false, flavor: 'Inkweald grimoire; drops prayer by 1 per spell cast.', tags: ['prayer_drain'] },
  { id: 'sootworks_forge_gauntlets',   slot: 'hands',  category: 'armor', name: 'Forge Gauntlets',              stats: { defence_stab: 12, defence_slash: 12, defence_crush: 14, attack_crush: 4, melee_strength: 3 }, requirements: { defence: 55, smithing: 60 }, weight: 0.6, value: 1_500_000, tradeable: true, flavor: 'Fire-immune gauntlets. +10% smithing heat tolerance.', tags: ['fire_immune'] },
  { id: 'wilds_corrupted_ring',        slot: 'ring',   category: 'jewellery', name: 'Corrupted Ring',           stats: { melee_strength: 8, attack_stab: 4, attack_slash: 4, attack_crush: 4 }, requirements: {}, weight: 0, value: 3_500_000, tradeable: true, flavor: 'Pulses with Wilds chaos. +5% dmg in PvP zones, -5% outside.', tags: ['pvp_bonus'] },
  { id: 'aeldra_heartstone_ring',      slot: 'ring',   category: 'jewellery', name: 'Aeldra Heartstone',        stats: { melee_strength: 12, attack_magic: 8, attack_ranged: 8, prayer: 2 }, requirements: {}, weight: 0, value: 12_000_000, tradeable: false, flavor: 'BiS all-style ring. Made only by combining 3 region champion rings + aeldra_charge.', tags: ['degrades', 'requires_charge'] },
  // Basic jewellery (gold/gem set) — 6 rings + 6 amulets for mid-tier
  { id: 'gold_ring',                slot: 'ring',   category: 'jewellery', name: 'Gold ring',                 stats: {}, requirements: {}, weight: 0, value: 400,    tradeable: true, flavor: 'A plain gold ring.' },
  { id: 'sapphire_ring',            slot: 'ring',   category: 'jewellery', name: 'Sapphire ring',             stats: {}, requirements: {}, weight: 0, value: 900,    tradeable: true, flavor: 'Enchant for recoil effect.' },
  { id: 'emerald_ring',             slot: 'ring',   category: 'jewellery', name: 'Emerald ring',              stats: {}, requirements: {}, weight: 0, value: 1600,   tradeable: true, flavor: 'Enchant for quest-telepoint.' },
  { id: 'ruby_ring',                slot: 'ring',   category: 'jewellery', name: 'Ruby ring',                 stats: {}, requirements: {}, weight: 0, value: 2800,   tradeable: true, flavor: 'Enchant for life-saving recoil (once/day).' },
  { id: 'diamond_ring',             slot: 'ring',   category: 'jewellery', name: 'Diamond ring',              stats: {}, requirements: {}, weight: 0, value: 4200,   tradeable: true, flavor: 'Enchant for PvP damage reduction.' },
  { id: 'dragonstone_ring',         slot: 'ring',   category: 'jewellery', name: 'Dragonstone ring',          stats: {}, requirements: {}, weight: 0, value: 12000,  tradeable: true, flavor: 'Enchant for dragon-slayer buff.' },
  { id: 'gold_amulet',              slot: 'neck',   category: 'jewellery', name: 'Gold amulet',               stats: {}, requirements: {}, weight: 0, value: 450,    tradeable: true, flavor: 'A plain gold amulet.' },
  { id: 'sapphire_amulet',          slot: 'neck',   category: 'jewellery', name: 'Sapphire amulet',           stats: { attack_magic: 2 }, requirements: {}, weight: 0, value: 1100, tradeable: true, flavor: 'Enchant: amulet of magic.' },
  { id: 'emerald_amulet',           slot: 'neck',   category: 'jewellery', name: 'Emerald amulet',            stats: { defence_magic: 3 }, requirements: {}, weight: 0, value: 1800, tradeable: true, flavor: 'Enchant: amulet of defence.' },
  { id: 'ruby_amulet',              slot: 'neck',   category: 'jewellery', name: 'Ruby amulet',               stats: { melee_strength: 3 }, requirements: {}, weight: 0, value: 3200, tradeable: true, flavor: 'Enchant: amulet of strength.' },
  { id: 'diamond_amulet',           slot: 'neck',   category: 'jewellery', name: 'Diamond amulet',            stats: { attack_stab: 4, attack_slash: 4, attack_crush: 4 }, requirements: {}, weight: 0, value: 4800, tradeable: true, flavor: 'Enchant: amulet of power.' },
  { id: 'amulet_of_glory',          slot: 'neck',   category: 'jewellery', name: 'Amulet of glory',           stats: { attack_stab: 6, attack_slash: 6, attack_crush: 6, attack_magic: 6, attack_ranged: 6, melee_strength: 1, prayer: 1 }, requirements: {}, weight: 0, value: 12_000, tradeable: true, flavor: 'Enchanted dragonstone. Teleports (4 charges).', tags: ['teleport', 'charges'] },
  { id: 'amulet_of_fury',           slot: 'neck',   category: 'jewellery', name: 'Amulet of fury',            stats: { attack_stab: 10, attack_slash: 10, attack_crush: 10, attack_magic: 10, attack_ranged: 10, melee_strength: 8, prayer: 5, defence_stab: 10, defence_slash: 10, defence_crush: 10, defence_magic: 10, defence_ranged: 10 }, requirements: {}, weight: 0, value: 3_200_000, tradeable: true, flavor: 'BiS balanced amulet (non-style-specific).' },
  // Archers/Warriors/Seers/Berserkers rings (Fremennik-style)
  { id: 'archers_ring',             slot: 'ring',   category: 'jewellery', name: "Archers' ring",             stats: { attack_ranged: 4 }, requirements: {}, weight: 0, value: 1_800_000, tradeable: true, flavor: 'Ranged bonus. Imbue for double bonus.' },
  { id: 'warriors_ring',            slot: 'ring',   category: 'jewellery', name: "Warriors' ring",            stats: { attack_slash: 4 }, requirements: {}, weight: 0, value: 1_800_000, tradeable: true, flavor: 'Slash bonus. Imbue for double bonus.' },
  { id: 'seers_ring',               slot: 'ring',   category: 'jewellery', name: "Seers' ring",               stats: { attack_magic: 6 }, requirements: {}, weight: 0, value: 1_800_000, tradeable: true, flavor: 'Magic bonus. Imbue for double bonus.' },
  { id: 'berserkers_ring',          slot: 'ring',   category: 'jewellery', name: "Berserkers' ring",          stats: { melee_strength: 4 }, requirements: {}, weight: 0, value: 2_400_000, tradeable: true, flavor: 'Strength bonus. Imbue for +4 str bonus.' },
  { id: 'ring_of_suffering',        slot: 'ring',   category: 'jewellery', name: 'Ring of suffering',         stats: { defence_stab: 4, defence_slash: 4, defence_crush: 4, defence_magic: 4, defence_ranged: 4 }, requirements: {}, weight: 0, value: 1_200_000, tradeable: true, flavor: 'All-defence ring. Imbue for 10% damage recoil.' },
  { id: 'occult_necklace',          slot: 'neck',   category: 'jewellery', name: 'Occult necklace',           stats: { attack_magic: 12, magic_damage: 10 }, requirements: { magic: 70 }, weight: 0, value: 800_000, tradeable: true, flavor: '+10% magic damage. Great for DPS mages.' },
  { id: 'necklace_of_anguish',      slot: 'neck',   category: 'jewellery', name: 'Necklace of anguish',       stats: { attack_ranged: 15, ranged_strength: 5, prayer: 1 }, requirements: { ranged: 75 }, weight: 0, value: 12_000_000, tradeable: true, flavor: 'BiS ranged amulet.' },
  { id: 'amulet_of_torture',        slot: 'neck',   category: 'jewellery', name: 'Amulet of torture',         stats: { attack_stab: 15, attack_slash: 15, attack_crush: 15, melee_strength: 10 }, requirements: { hitpoints: 75 }, weight: 0, value: 12_000_000, tradeable: true, flavor: 'BiS melee amulet.' },
  // Tools (pickaxes, hatchets, harpoons for each tier)
  { id: 'tinroot_pickaxe',          slot: 'weapon', category: 'tool', name: 'Tinroot pickaxe',                stats: { attack_stab: 4 }, requirements: { mining: 1, attack: 1 },  weight: 2.2, value: 15,    tradeable: true, flavor: 'Bottom-tier pick. Mines ores up to pigiron.', speed: 5 },
  { id: 'pigiron_pickaxe',          slot: 'weapon', category: 'tool', name: 'Pigiron pickaxe',                stats: { attack_stab: 5 }, requirements: { mining: 1, attack: 1 },  weight: 2.2, value: 60,    tradeable: true, flavor: 'Basic pick. Mines up to coalseam.', speed: 5 },
  { id: 'coalsteel_pickaxe',        slot: 'weapon', category: 'tool', name: 'Coalsteel pickaxe',              stats: { attack_stab: 8 }, requirements: { mining: 6, attack: 5 },  weight: 2.2, value: 220,   tradeable: true, flavor: 'Standard pick.', speed: 5 },
  { id: 'quicksilver_pickaxe',      slot: 'weapon', category: 'tool', name: 'Quicksilver pickaxe',            stats: { attack_stab: 12 }, requirements: { mining: 21, attack: 20 }, weight: 1.6, value: 640, tradeable: true, flavor: 'Lighter pick, fewer strikes to mine.', speed: 5 },
  { id: 'blacksteel_pickaxe',       slot: 'weapon', category: 'tool', name: 'Blacksteel pickaxe',             stats: { attack_stab: 16 }, requirements: { mining: 31, attack: 30 }, weight: 2.2, value: 1400, tradeable: true, flavor: 'Heavy-duty pick.', speed: 5 },
  { id: 'runeforge_pickaxe',        slot: 'weapon', category: 'tool', name: 'Runeforge pickaxe',              stats: { attack_stab: 22 }, requirements: { mining: 41, attack: 40 }, weight: 2.0, value: 8000, tradeable: true, flavor: 'Rune-etched pick.', speed: 5 },
  { id: 'dragonsteel_pickaxe',      slot: 'weapon', category: 'tool', name: 'Dragonsteel pickaxe',            stats: { attack_stab: 28 }, requirements: { mining: 61, attack: 60 }, weight: 2.2, value: 650000, tradeable: true, flavor: 'Special boosts mining +3 for 3 min.', speed: 5, tags: ['special_attack'] },
  { id: 'tinroot_hatchet',          slot: 'weapon', category: 'tool', name: 'Tinroot hatchet',                stats: { attack_slash: 4 }, requirements: { woodcutting: 1, attack: 1 }, weight: 1.8, value: 18, tradeable: true, flavor: 'Bottom-tier hatchet.', speed: 5 },
  { id: 'pigiron_hatchet',          slot: 'weapon', category: 'tool', name: 'Pigiron hatchet',                stats: { attack_slash: 6 }, requirements: { woodcutting: 1, attack: 1 }, weight: 1.8, value: 70, tradeable: true, flavor: 'Basic hatchet.', speed: 5 },
  { id: 'coalsteel_hatchet',        slot: 'weapon', category: 'tool', name: 'Coalsteel hatchet',              stats: { attack_slash: 9 }, requirements: { woodcutting: 6, attack: 5 }, weight: 1.8, value: 240, tradeable: true, flavor: 'Standard hatchet.', speed: 5 },
  { id: 'runeforge_hatchet',        slot: 'weapon', category: 'tool', name: 'Runeforge hatchet',              stats: { attack_slash: 24 }, requirements: { woodcutting: 41, attack: 40 }, weight: 1.6, value: 9000, tradeable: true, flavor: 'Rune-etched hatchet.', speed: 5 },
  { id: 'dragonsteel_hatchet',      slot: 'weapon', category: 'tool', name: 'Dragonsteel hatchet',            stats: { attack_slash: 30 }, requirements: { woodcutting: 61, attack: 60 }, weight: 1.6, value: 450000, tradeable: true, flavor: 'Special boosts wc +3 for 3 min.', speed: 5, tags: ['special_attack'] },
  { id: 'dragonsteel_harpoon',      slot: 'weapon', category: 'tool', name: 'Dragonsteel harpoon',            stats: { attack_stab: 26 }, requirements: { fishing: 61, attack: 60 }, weight: 1.3, value: 520000, tradeable: true, flavor: 'Special boosts fishing +3 for 3 min.', speed: 5, tags: ['special_attack'] },
  // Prayer-specific (Proselyte/monk variants)
  { id: 'proselyte_sallet',         slot: 'head',   category: 'armor',    name: 'Proselyte sallet',           stats: { defence_stab: 15, defence_slash: 17, defence_crush: 13, prayer: 4 }, requirements: { defence: 30, prayer: 20 }, weight: 2.0, value: 22000, tradeable: true, flavor: 'White knight prayer helm.' },
  { id: 'proselyte_hauberk',        slot: 'body',   category: 'armor',    name: 'Proselyte hauberk',          stats: { defence_stab: 55, defence_slash: 60, defence_crush: 49, prayer: 8 }, requirements: { defence: 30, prayer: 20 }, weight: 4.0, value: 45000, tradeable: true, flavor: 'Best prayer-bonus body in its tier.' },
  { id: 'proselyte_cuisse',         slot: 'legs',   category: 'armor',    name: 'Proselyte cuisse',           stats: { defence_stab: 36, defence_slash: 33, defence_crush: 30, prayer: 6 }, requirements: { defence: 30, prayer: 20 }, weight: 3.5, value: 38000, tradeable: true, flavor: 'Heavy prayer legs.' },
  { id: 'monk_robe_top',            slot: 'body',   category: 'armor',    name: 'Monk robe top',              stats: { prayer: 6 }, requirements: {}, weight: 1.0, value: 100, tradeable: true, flavor: 'Simple brown robe.' },
  { id: 'monk_robe_bottom',         slot: 'legs',   category: 'armor',    name: 'Monk robe bottom',           stats: { prayer: 5 }, requirements: {}, weight: 1.0, value: 80, tradeable: true, flavor: 'Matching monk legs.' },
  // Graceful (run energy set — 6 pieces)
  { id: 'graceful_hood',            slot: 'head',   category: 'armor',    name: 'Graceful hood',              stats: {}, requirements: {}, weight: 0,   value: 70,  tradeable: true, flavor: 'Light hood; reduces weight.', tags: ['graceful_set'] },
  { id: 'graceful_top',             slot: 'body',   category: 'armor',    name: 'Graceful top',               stats: {}, requirements: {}, weight: 0,   value: 110, tradeable: true, flavor: 'Light top; reduces weight.', tags: ['graceful_set'] },
  { id: 'graceful_legs',            slot: 'legs',   category: 'armor',    name: 'Graceful legs',              stats: {}, requirements: {}, weight: 0,   value: 90,  tradeable: true, flavor: 'Light legs; reduces weight.', tags: ['graceful_set'] },
  { id: 'graceful_gloves',          slot: 'hands',  category: 'armor',    name: 'Graceful gloves',            stats: {}, requirements: {}, weight: 0,   value: 60,  tradeable: true, flavor: 'Light gloves; reduces weight.', tags: ['graceful_set'] },
  { id: 'graceful_boots',           slot: 'feet',   category: 'armor',    name: 'Graceful boots',             stats: {}, requirements: {}, weight: 0,   value: 60,  tradeable: true, flavor: 'Light boots; reduces weight.', tags: ['graceful_set'] },
  { id: 'graceful_cape',            slot: 'cape',   category: 'armor',    name: 'Graceful cape',              stats: {}, requirements: {}, weight: 0,   value: 80,  tradeable: true, flavor: 'Full set: +30% run energy restore.', tags: ['graceful_set', 'set_bonus'] },
  // Skilling outfits (prospector/lumberjack/anglers/farmers/rogue) — 4 slots each
  { id: 'prospector_helmet',        slot: 'head',   category: 'armor',    name: 'Prospector helmet',          stats: {}, requirements: { mining: 30 }, weight: 0.3, value: 5000, tradeable: false, flavor: '+0.4% mining XP.', tags: ['skill_outfit'] },
  { id: 'prospector_jacket',        slot: 'body',   category: 'armor',    name: 'Prospector jacket',          stats: {}, requirements: { mining: 30 }, weight: 0.5, value: 8000, tradeable: false, flavor: '+0.8% mining XP.', tags: ['skill_outfit'] },
  { id: 'prospector_legs',          slot: 'legs',   category: 'armor',    name: 'Prospector legs',            stats: {}, requirements: { mining: 30 }, weight: 0.4, value: 6000, tradeable: false, flavor: '+0.6% mining XP.', tags: ['skill_outfit'] },
  { id: 'prospector_boots',         slot: 'feet',   category: 'armor',    name: 'Prospector boots',           stats: {}, requirements: { mining: 30 }, weight: 0.3, value: 4000, tradeable: false, flavor: '+0.2% mining XP. Set: +2.5%.', tags: ['skill_outfit', 'set_bonus'] },
  { id: 'lumberjack_hat',           slot: 'head',   category: 'armor',    name: 'Lumberjack hat',             stats: {}, requirements: { woodcutting: 30 }, weight: 0.3, value: 5000, tradeable: false, flavor: '+0.4% wc XP.', tags: ['skill_outfit'] },
  { id: 'lumberjack_top',           slot: 'body',   category: 'armor',    name: 'Lumberjack top',             stats: {}, requirements: { woodcutting: 30 }, weight: 0.5, value: 8000, tradeable: false, flavor: '+0.8% wc XP.', tags: ['skill_outfit'] },
  { id: 'lumberjack_legs',          slot: 'legs',   category: 'armor',    name: 'Lumberjack legs',            stats: {}, requirements: { woodcutting: 30 }, weight: 0.4, value: 6000, tradeable: false, flavor: '+0.6% wc XP.', tags: ['skill_outfit'] },
  { id: 'lumberjack_boots',         slot: 'feet',   category: 'armor',    name: 'Lumberjack boots',           stats: {}, requirements: { woodcutting: 30 }, weight: 0.3, value: 4000, tradeable: false, flavor: '+0.2% wc XP. Set: +2.5%.', tags: ['skill_outfit', 'set_bonus'] },
  { id: 'anglers_hat',              slot: 'head',   category: 'armor',    name: "Angler's hat",               stats: {}, requirements: { fishing: 30 }, weight: 0.3, value: 5000, tradeable: false, flavor: '+0.4% fishing XP.', tags: ['skill_outfit'] },
  { id: 'anglers_top',              slot: 'body',   category: 'armor',    name: "Angler's top",               stats: {}, requirements: { fishing: 30 }, weight: 0.5, value: 8000, tradeable: false, flavor: '+0.8% fishing XP.', tags: ['skill_outfit'] },
  { id: 'anglers_waders',           slot: 'legs',   category: 'armor',    name: "Angler's waders",            stats: {}, requirements: { fishing: 30 }, weight: 0.4, value: 6000, tradeable: false, flavor: '+0.6% fishing XP.', tags: ['skill_outfit'] },
  { id: 'anglers_boots',            slot: 'feet',   category: 'armor',    name: "Angler's boots",             stats: {}, requirements: { fishing: 30 }, weight: 0.3, value: 4000, tradeable: false, flavor: '+0.2% fishing XP. Set: +2.5%.', tags: ['skill_outfit', 'set_bonus'] },
  { id: 'farmers_strawhat',         slot: 'head',   category: 'armor',    name: "Farmer's strawhat",          stats: {}, requirements: { farming: 30 }, weight: 0.3, value: 5000, tradeable: false, flavor: '+0.4% farming XP.', tags: ['skill_outfit'] },
  { id: 'farmers_jacket',           slot: 'body',   category: 'armor',    name: "Farmer's jacket",            stats: {}, requirements: { farming: 30 }, weight: 0.5, value: 8000, tradeable: false, flavor: '+0.8% farming XP.', tags: ['skill_outfit'] },
  { id: 'farmers_trousers',         slot: 'legs',   category: 'armor',    name: "Farmer's trousers",          stats: {}, requirements: { farming: 30 }, weight: 0.4, value: 6000, tradeable: false, flavor: '+0.6% farming XP.', tags: ['skill_outfit'] },
  { id: 'farmers_boots',            slot: 'feet',   category: 'armor',    name: "Farmer's boots",             stats: {}, requirements: { farming: 30 }, weight: 0.3, value: 4000, tradeable: false, flavor: '+0.2% farming XP. Set: +2.5%.', tags: ['skill_outfit', 'set_bonus'] },
  { id: 'rogue_mask',               slot: 'head',   category: 'armor',    name: 'Rogue mask',                 stats: {}, requirements: { thieving: 50 }, weight: 0.3, value: 8000, tradeable: false, flavor: 'Part of thieving outfit.', tags: ['skill_outfit'] },
  { id: 'rogue_top',                slot: 'body',   category: 'armor',    name: 'Rogue top',                  stats: {}, requirements: { thieving: 50 }, weight: 0.5, value: 10000, tradeable: false, flavor: 'Part of thieving outfit.', tags: ['skill_outfit'] },
  { id: 'rogue_trousers',           slot: 'legs',   category: 'armor',    name: 'Rogue trousers',             stats: {}, requirements: { thieving: 50 }, weight: 0.4, value: 8000, tradeable: false, flavor: 'Part of thieving outfit.', tags: ['skill_outfit'] },
  { id: 'rogue_boots',              slot: 'feet',   category: 'armor',    name: 'Rogue boots',                stats: {}, requirements: { thieving: 50 }, weight: 0.3, value: 6000, tradeable: false, flavor: 'Part of thieving outfit.', tags: ['skill_outfit'] },
  { id: 'rogue_gloves',             slot: 'hands',  category: 'armor',    name: 'Rogue gloves',               stats: {}, requirements: { thieving: 50 }, weight: 0.3, value: 5000, tradeable: false, flavor: 'Set: 2x pickpocket loot.', tags: ['skill_outfit', 'set_bonus'] },
  // Capes
  { id: 'fire_cape',                slot: 'cape',   category: 'armor',    name: 'Fire cape',                  stats: { attack_stab: 1, attack_slash: 1, attack_crush: 1, attack_magic: 1, attack_ranged: 1, melee_strength: 4, defence_stab: 11, defence_slash: 11, defence_crush: 11, defence_magic: 11, defence_ranged: 11, prayer: 2 }, requirements: {}, weight: 0.5, value: 0, tradeable: false, flavor: 'Earned from Fight Caves. BiS melee cape.', tags: ['untradeable_reward'] },
  { id: 'infernal_cape',            slot: 'cape',   category: 'armor',    name: 'Infernal cape',              stats: { attack_stab: 4, attack_slash: 4, attack_crush: 4, attack_magic: 1, attack_ranged: 1, melee_strength: 8, defence_stab: 12, defence_slash: 12, defence_crush: 12, defence_magic: 12, defence_ranged: 12, prayer: 2 }, requirements: {}, weight: 0.5, value: 0, tradeable: false, flavor: 'Ultimate prestige cape.', tags: ['untradeable_reward'] },
  { id: 'max_cape',                 slot: 'cape',   category: 'armor',    name: 'Max cape',                   stats: { attack_stab: 4, attack_slash: 4, attack_crush: 4, attack_magic: 4, attack_ranged: 4, melee_strength: 4, defence_stab: 12, defence_slash: 12, defence_crush: 12, defence_magic: 12, defence_ranged: 12, prayer: 4 }, requirements: {}, weight: 0.5, value: 0, tradeable: false, flavor: 'Earned only at 99 in all skills.', tags: ['untradeable_reward'] },
  { id: 'avas_assembler',           slot: 'cape',   category: 'armor',    name: "Ava's assembler",            stats: { attack_ranged: 8, ranged_strength: 2, prayer: 2 }, requirements: { ranged: 70 }, weight: 0.5, value: 120_000, tradeable: false, flavor: 'Auto-retrieves spent ammo.', tags: ['ammo_retrieval'] },
  // Additional Barrows-style set pieces (for reagent recipes)
  { id: 'dharoks_helm',             slot: 'head',   category: 'armor',    name: "Dharok's helm",              stats: { defence_stab: 45, defence_slash: 52, defence_crush: 52, attack_crush: 1, prayer: 1 }, requirements: { defence: 70 }, weight: 2.5, value: 380_000, tradeable: true, flavor: 'Barrows-style helm.', tags: ['barrows_set'] },
  { id: 'dharoks_platebody',        slot: 'body',   category: 'armor',    name: "Dharok's platebody",         stats: { defence_stab: 140, defence_slash: 138, defence_crush: 112, attack_crush: 6, prayer: 1 }, requirements: { defence: 70 }, weight: 9.0, value: 520_000, tradeable: true, flavor: 'Barrows-style body.', tags: ['barrows_set'] },
  { id: 'dharoks_platelegs',        slot: 'legs',   category: 'armor',    name: "Dharok's platelegs",         stats: { defence_stab: 85, defence_slash: 82, defence_crush: 83, attack_crush: 4, prayer: 1 }, requirements: { defence: 70 }, weight: 8.0, value: 460_000, tradeable: true, flavor: 'Barrows-style legs.', tags: ['barrows_set'] },
  { id: 'dharoks_greataxe',         slot: 'weapon', category: 'melee',    name: "Dharok's greataxe",          stats: { attack_slash: 70, attack_crush: 95, melee_strength: 103 }, requirements: { attack: 70, strength: 70 }, weight: 4.0, value: 380_000, tradeable: true, flavor: 'Barrows-style greataxe.', tags: ['barrows_set', 'two_handed'], speed: 7 },
  { id: 'ahrims_hood',              slot: 'head',   category: 'magic_armor', name: "Ahrim's hood",            stats: { attack_magic: 8, defence_magic: 6, defence_stab: 22, defence_slash: 25, defence_crush: 20, prayer: 1 }, requirements: { magic: 70, defence: 70 }, weight: 1.0, value: 120_000, tradeable: true, flavor: 'Barrows-style mage hood.', tags: ['barrows_set'] },
  { id: 'ahrims_robetop',           slot: 'body',   category: 'magic_armor', name: "Ahrim's robetop",         stats: { attack_magic: 30, defence_magic: 22, defence_stab: 52, defence_slash: 37, defence_crush: 63, prayer: 1 }, requirements: { magic: 70, defence: 70 }, weight: 4.0, value: 320_000, tradeable: true, flavor: 'Barrows-style mage top.', tags: ['barrows_set'] },
  { id: 'ahrims_robebottom',        slot: 'legs',   category: 'magic_armor', name: "Ahrim's robebottom",      stats: { attack_magic: 22, defence_magic: 16, defence_stab: 33, defence_slash: 25, defence_crush: 38, prayer: 1 }, requirements: { magic: 70, defence: 70 }, weight: 3.0, value: 280_000, tradeable: true, flavor: 'Barrows-style mage legs.', tags: ['barrows_set'] },
  { id: 'ahrims_staff',             slot: 'weapon', category: 'magic',    name: "Ahrim's staff",              stats: { attack_magic: 15, attack_crush: 10, magic_damage: 2 }, requirements: { magic: 70, attack: 70 }, weight: 2.5, value: 180_000, tradeable: true, flavor: 'Barrows-style mage staff.', tags: ['barrows_set'], speed: 5 },
  { id: 'karils_coif',              slot: 'head',   category: 'ranged_armor', name: "Karil's coif",           stats: { attack_ranged: 6, defence_ranged: 9, defence_stab: 8, defence_slash: 6, defence_crush: 10, prayer: 1 }, requirements: { ranged: 70, defence: 70 }, weight: 0.5, value: 110_000, tradeable: true, flavor: 'Barrows-style ranger coif.', tags: ['barrows_set'] },
  { id: 'karils_body',              slot: 'body',   category: 'ranged_armor', name: "Karil's leathertop",     stats: { attack_ranged: 30, defence_ranged: 30, defence_stab: 47, defence_slash: 42, defence_crush: 55, prayer: 1 }, requirements: { ranged: 70, defence: 70 }, weight: 3.5, value: 260_000, tradeable: true, flavor: 'Barrows-style ranger top.', tags: ['barrows_set'] },
  { id: 'karils_skirt',             slot: 'legs',   category: 'ranged_armor', name: "Karil's skirt",          stats: { attack_ranged: 18, defence_ranged: 18, defence_stab: 26, defence_slash: 20, defence_crush: 33, prayer: 1 }, requirements: { ranged: 70, defence: 70 }, weight: 2.5, value: 220_000, tradeable: true, flavor: 'Barrows-style ranger legs.', tags: ['barrows_set'] },
  { id: 'karils_crossbow',          slot: 'weapon', category: 'ranged',   name: "Karil's crossbow",           stats: { attack_ranged: 84, ranged_strength: 55 }, requirements: { ranged: 70 }, weight: 2.0, value: 180_000, tradeable: true, flavor: 'Barrows-style rapid crossbow.', tags: ['barrows_set'], speed: 4 },
  // Special boss uniques (encounter-specific BiS)
  { id: 'scythe_of_vitur',          slot: 'weapon', category: 'melee',    name: 'Scythe of Vitur',            stats: { attack_slash: 85, attack_stab: 70, melee_strength: 75 }, requirements: { attack: 80, strength: 75 }, weight: 3.5, value: 1_200_000_000, tradeable: true, flavor: 'Hits 3 targets per swing in 3x1 line. Degrades. Moryskah drop.', tags: ['two_handed', 'multi_target', 'degrades'], speed: 5 },
  { id: 'twisted_bow',              slot: 'weapon', category: 'ranged',   name: 'Twisted bow',                stats: { attack_ranged: 70, ranged_strength: 20 }, requirements: { ranged: 85 }, weight: 1.5, value: 1_400_000_000, tradeable: true, flavor: 'Damage scales with target magic level (BiS vs mages).', tags: ['scales_with_target'], speed: 5 },
  { id: 'tumekens_shadow',          slot: 'weapon', category: 'magic',    name: "Tumeken's shadow",           stats: { attack_magic: 35, magic_damage: 20 }, requirements: { magic: 85 }, weight: 2.5, value: 1_800_000_000, tradeable: true, flavor: 'Boneyard endgame staff. Damage x3 from magic equipment.', tags: ['two_handed', 'stat_multiplier'], speed: 5 },
  { id: 'arclight',                 slot: 'weapon', category: 'melee',    name: 'Arclight',                   stats: { attack_slash: 60, attack_stab: 55, melee_strength: 50 }, requirements: { attack: 75 }, weight: 2.0, value: 80_000_000, tradeable: false, flavor: 'BiS vs demons. Degrades (charges required).', tags: ['bonus_vs_demon', 'degrades', 'consumes_charges'], speed: 4 },
  { id: 'bone_dagger',              slot: 'weapon', category: 'melee',    name: 'Bone dagger',                stats: { attack_stab: 75, melee_strength: 70 }, requirements: { attack: 70 }, weight: 0.5, value: 380_000, tradeable: true, flavor: 'Fastest stab weapon; special lowers enemy def 30%.', tags: ['special_attack'], speed: 3 },
];
for (const u of UNIQUES) addEquip({ ...u, tier: u.tier_name ? u.tier : 8, tier_name: u.tier_name || 'unique', examine: u.flavor });

writeJson('equipment.json', equipment);

// ══════════════════════════════════════════════════════════════════════════════
// CONSUMABLES
// ══════════════════════════════════════════════════════════════════════════════
const consumables = [];
const cons = (obj) => consumables.push(obj);

// Regional food — 9 regions, flavor-specific
const REGIONAL_FOOD = [
  // Heartlands (farm/pastoral)
  { id: 'heartlands_field_loaf',      name: 'Field loaf',            region: 'heartlands', heal: 5,  value: 10,  flavor: 'Crusty rye loaf from Heartlands farms.' },
  { id: 'heartlands_farmers_stew',    name: "Farmer's stew",         region: 'heartlands', heal: 11, value: 25,  flavor: 'Thick barley stew with pork and root veg.' },
  { id: 'heartlands_honey_cake',      name: 'Honey cake',            region: 'heartlands', heal: 8,  value: 40,  flavor: 'Sweet cake with wildflower honey. 3 bites.', bites: 3 },
  { id: 'heartlands_apple',           name: 'Orchard apple',         region: 'heartlands', heal: 2,  value: 3 },
  { id: 'heartlands_roast_pheasant',  name: 'Roast pheasant',        region: 'heartlands', heal: 14, value: 80 },
  { id: 'heartlands_cream_cheese_roll',name:'Cream cheese roll',     region: 'heartlands', heal: 9,  value: 45 },
  // Sootworks (industrial/fired)
  { id: 'sootworks_coal_bread',       name: 'Coal-oven bread',       region: 'sootworks',  heal: 6,  value: 15,  flavor: 'Dense black-crust bread from Sootworks ovens.' },
  { id: 'sootworks_smoked_sausage',   name: 'Smoked sausage',        region: 'sootworks',  heal: 10, value: 50 },
  { id: 'sootworks_forgeman_pie',     name: "Forgeman's pie",        region: 'sootworks',  heal: 12, value: 60,  bites: 2 },
  { id: 'sootworks_iron_ale',         name: 'Iron ale',              region: 'sootworks',  heal: 5,  value: 30, flavor: 'Dark ale. +1 str for 3 min, -1 atk.', effect: 'str_up_1' },
  { id: 'sootworks_spiced_ribs',      name: 'Spiced ribs',           region: 'sootworks',  heal: 17, value: 150 },
  // Moryskah (gothic/vampiric)
  { id: 'moryskah_black_pudding',     name: 'Black pudding',         region: 'moryskah',   heal: 13, value: 75,  flavor: 'Thick blood pudding. Unsettling texture.' },
  { id: 'moryskah_crypt_mushroom_soup',name:'Crypt mushroom soup',   region: 'moryskah',   heal: 11, value: 60 },
  { id: 'moryskah_gothic_wine',       name: 'Gothic red wine',       region: 'moryskah',   heal: 4,  value: 120, effect: 'prayer_restore_5' },
  { id: 'moryskah_salted_venison',    name: 'Salted venison',        region: 'moryskah',   heal: 16, value: 140 },
  { id: 'moryskah_graveside_tea',     name: 'Graveside tea',         region: 'moryskah',   heal: 3,  value: 50,  effect: 'restore_all_stats_1' },
  // Boneyard (desert)
  { id: 'boneyard_cactus_water',      name: 'Cactus water',          region: 'boneyard',   heal: 2,  value: 5,   flavor: 'Bitter cactus sap. Restores run energy too.', effect: 'run_energy_20' },
  { id: 'boneyard_sand_biscuit',      name: 'Sand biscuit',          region: 'boneyard',   heal: 4,  value: 8 },
  { id: 'boneyard_date_cluster',      name: 'Date cluster',          region: 'boneyard',   heal: 6,  value: 18, bites: 4 },
  { id: 'boneyard_scarab_skewer',     name: 'Scarab skewer',         region: 'boneyard',   heal: 12, value: 90 },
  { id: 'boneyard_pharaohs_loaf',     name: "Pharaoh's loaf",        region: 'boneyard',   heal: 18, value: 220 },
  // Glass Desert (crystal)
  { id: 'glass_prism_fruit',          name: 'Prism fruit',           region: 'glass_desert', heal: 10, value: 80 },
  { id: 'glass_crystal_honey',        name: 'Crystal honeycomb',     region: 'glass_desert', heal: 14, value: 180, bites: 2 },
  { id: 'glass_sunburst_loaf',        name: 'Sunburst loaf',         region: 'glass_desert', heal: 19, value: 260, flavor: 'Glows faintly. +5 magic-defence for 60s when eaten.', effect: 'magic_def_5' },
  { id: 'glass_mirage_fish',          name: 'Mirage fish',           region: 'glass_desert', heal: 15, value: 190 },
  // Saltbrine (sea)
  { id: 'saltbrine_brined_cod',       name: 'Brined cod',            region: 'saltbrine',  heal: 9,  value: 55 },
  { id: 'saltbrine_brined_mackerel',  name: 'Brined mackerel',       region: 'saltbrine',  heal: 7,  value: 35 },
  { id: 'saltbrine_kraken_chowder',   name: 'Kraken chowder',        region: 'saltbrine',  heal: 18, value: 260,  flavor: 'Seafood chowder with kraken tentacle. +2 fishing for 5m.', effect: 'fishing_boost_2' },
  { id: 'saltbrine_seaweed_roll',     name: 'Seaweed roll',          region: 'saltbrine',  heal: 6,  value: 30 },
  { id: 'saltbrine_deep_crab_claw',   name: 'Deep-crab claw',        region: 'saltbrine',  heal: 20, value: 440 },
  { id: 'saltbrine_pirate_rum',       name: 'Pirate rum',            region: 'saltbrine',  heal: 5,  value: 90, effect: 'all_combat_minus_1' },
  // Veilwood (forest/fey)
  { id: 'veilwood_forest_game_pie',   name: 'Forest game pie',       region: 'veilwood',   heal: 13, value: 110, bites: 2 },
  { id: 'veilwood_moonberry_jam_toast',name:'Moonberry jam toast',    region: 'veilwood',   heal: 9,  value: 70 },
  { id: 'veilwood_fey_tea',           name: 'Fey tea',               region: 'veilwood',   heal: 4,  value: 60, effect: 'restore_all_stats_3' },
  { id: 'veilwood_thistledown_broth', name: 'Thistledown broth',     region: 'veilwood',   heal: 17, value: 200 },
  { id: 'veilwood_stag_heart_roast',  name: 'Stag heart roast',      region: 'veilwood',   heal: 21, value: 380 },
  // Inkweald (library)
  { id: 'inkweald_inksoaked_biscuits',name: 'Ink-soaked biscuits',   region: 'inkweald',   heal: 5,  value: 25, flavor: "Tastes faintly of pages. +1 magic for 5 min.", effect: 'magic_boost_1' },
  { id: 'inkweald_scribes_gruel',     name: "Scribe's gruel",        region: 'inkweald',   heal: 8,  value: 40 },
  { id: 'inkweald_margin_pickles',    name: 'Margin pickles',        region: 'inkweald',   heal: 3,  value: 20, bites: 3 },
  { id: 'inkweald_chapter_wine',      name: 'Chapter wine',          region: 'inkweald',   heal: 4,  value: 180, effect: 'magic_boost_3' },
  { id: 'inkweald_parchment_bread',   name: 'Parchment bread',       region: 'inkweald',   heal: 7,  value: 35 },
  // Wilds (survival)
  { id: 'wilds_jerky',                name: 'Wilds jerky',           region: 'wilds',      heal: 8,  value: 65, flavor: 'Stackable to 100. Kept on death in PvP.', tags: ['stackable', 'kept_on_death_wilds'] },
  { id: 'wilds_bone_broth',           name: 'Bone broth',            region: 'wilds',      heal: 16, value: 120 },
  { id: 'wilds_revenant_heart',       name: 'Revenant heart',        region: 'wilds',      heal: 22, value: 800, flavor: 'From revenants. Rarest food in the Wilds.' },
  { id: 'wilds_blackbread',           name: 'Blackbread',            region: 'wilds',      heal: 6,  value: 25 },
];
REGIONAL_FOOD.forEach(f => cons({
  ...f,
  category: 'food',
  stackable: !!(f.tags || []).includes('stackable'),
  weight: 0.4,
  tradeable: !(f.tags || []).includes('untradeable'),
  heal_amount: f.heal,
  bites: f.bites || 1,
  examine: f.flavor || `A ${f.name.toLowerCase()}.`,
}));

// Potions — all 4-dose + lower doses for each
const POTION_SPECS = [
  // id, name, category, effect summary, base value, herb, secondary
  { k: 'attack',       n: 'Attack potion',        bonus: '+3 attack for 5 min',              herb: 'guam',        secondary: 'eye_of_newt',         val: 50 },
  { k: 'strength',     n: 'Strength potion',      bonus: '+3 strength for 5 min',            herb: 'tarromin',    secondary: 'limpwurt_root',       val: 70 },
  { k: 'defence',      n: 'Defence potion',       bonus: '+3 defence for 5 min',             herb: 'ranarr',      secondary: 'white_berries',       val: 80 },
  { k: 'super_attack', n: 'Super attack potion',  bonus: '+5+15% attack for 5 min',          herb: 'irit',        secondary: 'eye_of_newt',         val: 220 },
  { k: 'super_strength',n:'Super strength potion',bonus: '+5+15% strength for 5 min',        herb: 'kwuarm',      secondary: 'limpwurt_root',       val: 300 },
  { k: 'super_defence',n: 'Super defence potion', bonus: '+5+15% defence for 5 min',         herb: 'cadantine',   secondary: 'white_berries',       val: 320 },
  { k: 'ranging',      n: 'Ranging potion',       bonus: '+4+10% ranged for 5 min',          herb: 'dwarf_weed',  secondary: 'wine_of_zamorak',     val: 380 },
  { k: 'magic',        n: 'Magic potion',         bonus: '+4 magic for 5 min',               herb: 'lantadyme',   secondary: 'potato_cactus',       val: 360 },
  { k: 'prayer',       n: 'Prayer potion',        bonus: 'restore 7+level/4 prayer',         herb: 'ranarr',      secondary: 'snape_grass',         val: 320 },
  { k: 'super_restore',n: 'Super restore',        bonus: 'restore 8+level/4 all stats + prayer', herb: 'snapdragon', secondary: 'red_spider_eggs',  val: 950 },
  { k: 'saradomin_brew',n:'Saradomin brew',       bonus: 'heal +15 HP, +20% def, -10% offensive stats', herb: 'toadflax', secondary: 'crushed_nest',  val: 1400 },
  { k: 'antipoison',   n: 'Antipoison',           bonus: 'cure + immunity 90s',              herb: 'marrentill',  secondary: 'unicorn_horn_dust',   val: 60 },
  { k: 'super_antipoison',n:'Super antipoison',   bonus: 'cure + immunity 6 min',            herb: 'irit',        secondary: 'unicorn_horn_dust',   val: 160 },
  { k: 'antivenom',    n: 'Antivenom',            bonus: 'cure venom + immunity 3 min',      herb: 'cadantine',   secondary: 'zulrah_scales',       val: 3200 },
  { k: 'antifire',     n: 'Antifire potion',      bonus: 'halve dragonfire 6 min',           herb: 'lantadyme',   secondary: 'dragon_scale_dust',   val: 1200 },
  { k: 'super_antifire',n:'Super antifire potion',bonus: 'immune to dragonfire 3 min',       herb: 'lantadyme',   secondary: 'phoenix_feather',     val: 4500 },
  { k: 'stamina',      n: 'Stamina potion',       bonus: '20% run energy, slower drain 2 min', herb: 'super_energy', secondary: 'amylase_crystal',   val: 1800 },
  { k: 'energy',       n: 'Energy potion',        bonus: '10% run energy',                   herb: 'harralander', secondary: 'chocolate_dust',      val: 180 },
  { k: 'super_energy', n: 'Super energy potion',  bonus: '20% run energy',                   herb: 'avantoe',     secondary: 'mort_myre_fungus',    val: 420 },
  { k: 'overload',     n: 'Overload',             bonus: '+5+15% all combat for 5 min, drain HP', herb: 'torstol',  secondary: 'cadantine_ext',      val: 9500 },
  { k: 'stat_freeze',  n: 'Stat-freeze potion',   bonus: 'freeze stats at current level 2 min', herb: 'torstol',  secondary: 'preserved_essence',   val: 8500 },
  { k: 'zamorak_brew', n: 'Zamorak brew',         bonus: '+20% atk/str, -10% def/HP',        herb: 'torstol',     secondary: 'jangerberries',       val: 2400 },
  { k: 'divine_super_combat', n: 'Divine super combat potion', bonus: 'super atk/str/def, doesn\'t tick down', herb: 'torstol', secondary: 'super_combat_potion_4 + eternium_crystal', val: 15000 },
  { k: 'sanfew_serum', n: 'Sanfew serum',         bonus: 'super restore + disease cure + anti-poison', herb: 'snapdragon', secondary: 'unicorn_horn_dust + snake_weed + nail_beast_nails', val: 2100 },
  { k: 'bastion',      n: 'Bastion potion',       bonus: '+4+10% ranged, +5+15% def',        herb: 'lantadyme',   secondary: 'potato_cactus',       val: 2800 },
  { k: 'battlemage',   n: 'Battlemage potion',    bonus: '+4 magic, +5+15% def',             herb: 'kwuarm',      secondary: 'newt_eye',            val: 2600 },
];
for (const p of POTION_SPECS) {
  for (const dose of [4, 3, 2, 1]) {
    cons({
      id: `${p.k}_potion_${dose}`,
      name: `${p.n}(${dose})`,
      category: 'potion',
      sub_category: p.k,
      doses: dose,
      effect_summary: p.bonus,
      stackable: false,
      weight: 0.3,
      value: Math.round(p.val * dose / 4),
      tradeable: true,
      tags: ['potion', `${dose}_dose`],
      examine: `A (${dose})-dose ${p.n.toLowerCase()}. ${p.bonus}.`,
    });
  }
  // Flavor: add empty vial after full consumption
}
// Light sources
const LIGHT = [
  { id: 'candle',               n: 'Candle',             val: 3,   dur: '5 min',  ext: 'water',  lvl: 1  },
  { id: 'torch_unlit',          n: 'Torch (unlit)',      val: 5,   dur: '—',      ext: '—',      lvl: 1  },
  { id: 'torch_lit',            n: 'Lit torch',          val: 5,   dur: '15 min', ext: 'wind',   lvl: 1  },
  { id: 'oil_lantern_empty',    n: 'Oil lantern (empty)',val: 30,  dur: '—',      ext: '—',      lvl: 26 },
  { id: 'oil_lantern_lit',      n: 'Lit oil lantern',    val: 30,  dur: '45 min', ext: 'wind',   lvl: 26 },
  { id: 'bullseye_lantern_lit', n: 'Bullseye lantern',   val: 250, dur: '90 min', ext: 'none',   lvl: 49 },
  { id: 'sapphire_lantern',     n: 'Sapphire lantern',   val: 2000,dur: '6 hr',   ext: 'none',   lvl: 70 },
  { id: 'crystal_lantern',      n: 'Crystal lantern',    val: 8000,dur: '—',      ext: 'none',   lvl: 80 },
  { id: 'mining_helm',          n: 'Mining helmet',      val: 120, dur: '—',      ext: 'none',   lvl: 25, slot: 'head' },
];
LIGHT.forEach(l => cons({
  id: l.id, name: l.n, category: 'light_source', stackable: false, weight: 0.5,
  value: l.val, tradeable: true, tags: ['light_source'],
  duration: l.dur, extinguishes_in: l.ext, requirements: { firemaking: l.lvl },
  slot: l.slot,
  examine: `${l.n}. Lasts ${l.dur}, extinguished by ${l.ext}.`,
}));

// Teleport tablets & jewellery-with-charges — Scape locations only
const TELEPORTS = [
  // Tablets (one-use)
  { id: 'heartlands_teleport_tablet',   n: 'Heartlands teleport',  val: 1200,  dest: 'Heartlands town square', lvl: 27 },
  { id: 'sootworks_teleport_tablet',    n: 'Sootworks teleport',   val: 2100,  dest: 'Sootworks foundry',      lvl: 37 },
  { id: 'moryskah_teleport_tablet',     n: 'Moryskah teleport',    val: 2400,  dest: 'Moryskah gates',         lvl: 40 },
  { id: 'boneyard_teleport_tablet',     n: 'Boneyard teleport',    val: 2700,  dest: 'Boneyard cenotaph',      lvl: 45 },
  { id: 'glass_desert_teleport_tablet', n: 'Glass Desert teleport',val: 3000,  dest: 'Glass Desert oasis',     lvl: 50 },
  { id: 'saltbrine_teleport_tablet',    n: 'Saltbrine teleport',   val: 3200,  dest: 'Saltbrine harbor',       lvl: 55 },
  { id: 'veilwood_teleport_tablet',     n: 'Veilwood teleport',    val: 3600,  dest: 'Veilwood grove',         lvl: 60 },
  { id: 'inkweald_teleport_tablet',     n: 'Inkweald teleport',    val: 3900,  dest: 'Inkweald library gate',  lvl: 65 },
  { id: 'wilds_lvl10_teleport_tablet',  n: 'Wilds level 10 tele',  val: 1800,  dest: 'Wilds tier-10 altar',    lvl: 33 },
  { id: 'wilds_lvl30_teleport_tablet',  n: 'Wilds level 30 tele',  val: 5500,  dest: 'Wilds tier-30 altar',    lvl: 47 },
];
TELEPORTS.forEach(t => cons({
  id: t.id, name: t.n, category: 'teleport', stackable: true, weight: 0,
  value: t.val, tradeable: true, tags: ['teleport', 'stackable'],
  destination: t.dest, requirements: { magic: t.lvl },
  examine: `Breaks to teleport you to ${t.dest}. Requires magic ${t.lvl}.`,
}));

// Teleport jewellery with charges — 8 charge, rechargeable
const TELE_JEW = [
  { id: 'ring_of_passage_8',      n: 'Ring of passage(8)',     slot: 'ring', charges: 8,  val: 6000,  dests: 'Heartlands, Sootworks, Moryskah' },
  { id: 'amulet_of_ports_5',      n: 'Amulet of ports(5)',     slot: 'neck', charges: 5,  val: 12000, dests: 'Saltbrine harbors and 3 islands' },
  { id: 'skill_bracelet_4',       n: 'Skill bracelet(4)',      slot: 'hands',charges: 4,  val: 8000,  dests: 'Farming patches + rune altars' },
  { id: 'moon_earring_3',         n: 'Moon earring(3)',        slot: 'neck', charges: 3,  val: 14000, dests: 'Veilwood 3 grove patches' },
  { id: 'wilds_sigil_ring_5',     n: 'Wilds sigil ring(5)',    slot: 'ring', charges: 5,  val: 22000, dests: 'Wilds altars at lvl 10/20/30/40/50' },
];
TELE_JEW.forEach(j => cons({
  id: j.id, name: j.n, category: 'teleport', slot: j.slot, charges: j.charges,
  stackable: false, weight: 0.05, value: j.val, tradeable: true,
  tags: ['teleport', 'degrades', 'jewellery'],
  destinations: j.dests,
  examine: `Teleport jewellery. ${j.charges} charges. ${j.dests}.`,
}));

// Cures & misc
const CURES = [
  { id: 'antidote_salve',         n: 'Antidote salve',         val: 80,   desc: 'Cures poison. Instant.' },
  { id: 'ghast_warding_rune',     n: 'Ghast warding rune',     val: 500,  desc: 'Single-use. Prevents Moryskah ghasts from rotting food for 10 min.' },
  { id: 'disease_tonic',          n: 'Disease tonic',          val: 350,  desc: 'Cures all farming diseases; one-use.' },
  { id: 'curse_unbinder',         n: 'Curse unbinder',         val: 1200, desc: 'Removes a Moryskah curse debuff.' },
  { id: 'phoenix_feather',        n: 'Phoenix feather',        val: 8000, desc: 'Revives once on death (1 use, keeps inventory).', tags: ['death_revive'] },
  { id: 'saradomin_godbrew_crystal',n:'Sarad godbrew crystal', val: 12000,desc: 'Adds +2 doses to any brew potion when crushed into it.' },
];
CURES.forEach(c => cons({
  id: c.id, name: c.n, category: 'cure', stackable: true, weight: 0.1,
  value: c.val, tradeable: true, tags: c.tags || ['consumable'],
  examine: c.desc,
}));

writeJson('consumables.json', consumables);

// ══════════════════════════════════════════════════════════════════════════════
// RESOURCES
// ══════════════════════════════════════════════════════════════════════════════
const resources = [];
const res = (x) => resources.push(x);

// Ores — match tier keys
const ORE_TIERS = [
  { key: 'tinroot',     lvl: 1,  xp: 12,  val: 5 },
  { key: 'pigiron',     lvl: 1,  xp: 20,  val: 17 },
  { key: 'coalseam',    lvl: 30, xp: 50,  val: 45, altName: 'coal' },
  { key: 'brassforge',  lvl: 15, xp: 35,  val: 70 },
  { key: 'quicksilver', lvl: 40, xp: 65,  val: 140 },
  { key: 'blacksteel',  lvl: 55, xp: 90,  val: 310 },
  { key: 'darkiron',    lvl: 65, xp: 110, val: 620 },
  { key: 'runeforge',   lvl: 75, xp: 140, val: 2200 },
  { key: 'dragonsteel', lvl: 85, xp: 175, val: 4800 },
  { key: 'aeldra',      lvl: 92, xp: 220, val: 12000 },
];
ORE_TIERS.forEach(o => res({
  id: `${o.key}_ore`, name: `${cap(o.altName || o.key)} ore`,
  category: 'ore', stackable: false, weight: 2.0, value: o.val, tradeable: true,
  requirements: { mining: o.lvl }, xp: o.xp,
  examine: `A chunk of ${o.altName || o.key} ore.`,
}));
// Bars
ORE_TIERS.forEach(o => res({
  id: `${o.key}_bar`, name: `${cap(o.altName || o.key)} bar`,
  category: 'bar', stackable: false, weight: 1.8, value: Math.round(o.val * 2.6), tradeable: true,
  requirements: { smithing: o.lvl + 2 }, xp: Math.round(o.xp * 1.5),
  examine: `A smelted ${o.altName || o.key} bar.`,
}));
// Gems (uncut + cut)
const GEMS = [
  { k: 'opal',        lvl: 1,  val: 40 },
  { k: 'jade',        lvl: 13, val: 110 },
  { k: 'topaz',       lvl: 16, val: 200 },
  { k: 'sapphire',    lvl: 20, val: 300 },
  { k: 'emerald',     lvl: 27, val: 600 },
  { k: 'ruby',        lvl: 34, val: 1200 },
  { k: 'diamond',     lvl: 43, val: 2400 },
  { k: 'dragonstone', lvl: 55, val: 7200 },
  { k: 'onyx',        lvl: 67, val: 180000 },
  { k: 'zenyte',      lvl: 78, val: 550000 },
  { k: 'moonstone',   lvl: 81, val: 280000 },
  { k: 'inkstone',    lvl: 85, val: 420000 },
];
GEMS.forEach(g => {
  res({ id: `uncut_${g.k}`, name: `Uncut ${g.k}`, category: 'gem_uncut', stackable: false, weight: 0.01, value: Math.round(g.val * 0.4), tradeable: true, requirements: { mining: g.lvl }, examine: `An uncut ${g.k}.` });
  res({ id: `cut_${g.k}`,   name: cap(g.k),       category: 'gem_cut',   stackable: false, weight: 0.01, value: g.val,                      tradeable: true, requirements: { crafting: g.lvl + 1 }, examine: `A cut ${g.k}.` });
});

// Logs
const TREES = [
  { k: 'tinderwood', lvl: 1,  xp: 25,  val: 4 },
  { k: 'oak',        lvl: 15, xp: 38,  val: 14 },
  { k: 'willow',     lvl: 30, xp: 68,  val: 22 },
  { k: 'teak',       lvl: 35, xp: 85,  val: 50 },
  { k: 'maple',      lvl: 45, xp: 100, val: 48 },
  { k: 'mahogany',   lvl: 50, xp: 125, val: 120 },
  { k: 'yew',        lvl: 60, xp: 175, val: 280 },
  { k: 'magic_yew',  lvl: 75, xp: 250, val: 900 },
  { k: 'redwood',    lvl: 80, xp: 380, val: 1800 },
  { k: 'moonwood',   lvl: 85, xp: 460, val: 4500 },
  { k: 'inkbark',    lvl: 90, xp: 580, val: 9000 },
];
TREES.forEach(t => res({
  id: `${t.k}_logs`, name: `${cap(t.k)} logs`, category: 'log', stackable: false, weight: 2.0, value: t.val, tradeable: true,
  requirements: { woodcutting: t.lvl }, xp: t.xp, examine: `${cap(t.k)} logs.`,
}));

// Raw fish + cooked
const FISH = [
  { k: 'sprat',       lvl: 1,  xpf: 10, xpc: 25,  val: 5 },
  { k: 'shrimp',      lvl: 1,  xpf: 10, xpc: 30,  val: 6 },
  { k: 'sardine',     lvl: 5,  xpf: 20, xpc: 40,  val: 10 },
  { k: 'trout',       lvl: 20, xpf: 50, xpc: 70,  val: 20 },
  { k: 'pike',        lvl: 25, xpf: 60, xpc: 80,  val: 30 },
  { k: 'salmon',      lvl: 30, xpf: 70, xpc: 90,  val: 40 },
  { k: 'tuna',        lvl: 35, xpf: 80, xpc: 100, val: 55 },
  { k: 'lobster',     lvl: 40, xpf: 90, xpc: 120, val: 120 },
  { k: 'swordfish',   lvl: 50, xpf:100, xpc: 140, val: 240 },
  { k: 'monkfish',    lvl: 62, xpf:120, xpc: 150, val: 500 },
  { k: 'shark',       lvl: 76, xpf:140, xpc: 210, val: 900 },
  { k: 'anglerfish',  lvl: 82, xpf:170, xpc: 230, val: 1600 },
  { k: 'dark_crab',   lvl: 85, xpf:180, xpc: 250, val: 2200 },
  { k: 'sea_wyrm',    lvl: 90, xpf:210, xpc: 290, val: 4500 },
  { k: 'moonfin_eel', lvl: 94, xpf:240, xpc: 330, val: 9000 },
];
FISH.forEach(f => {
  res({ id: `raw_${f.k}`,      name: `Raw ${f.k.replace('_',' ')}`, category: 'raw_fish', stackable: false, weight: 0.5, value: Math.round(f.val * 0.5), tradeable: true, requirements: { fishing: f.lvl }, xp: f.xpf, examine: `A raw ${f.k.replace('_',' ')}.` });
  res({ id: `cooked_${f.k}`,   name: cap(f.k.replace('_',' ')),     category: 'cooked_fish', stackable: false, weight: 0.5, value: f.val, tradeable: true, requirements: { cooking: f.lvl }, xp: f.xpc, examine: `A cooked ${f.k.replace('_',' ')}.` });
});

// Herbs (grimy + clean) — 14 herb types
const HERBS = [
  { k: 'guam',        lvl: 3,  val: 15 },
  { k: 'marrentill',  lvl: 5,  val: 24 },
  { k: 'tarromin',    lvl: 11, val: 35 },
  { k: 'harralander', lvl: 20, val: 50 },
  { k: 'ranarr',      lvl: 25, val: 360 },
  { k: 'toadflax',    lvl: 30, val: 200 },
  { k: 'irit',        lvl: 40, val: 150 },
  { k: 'avantoe',     lvl: 48, val: 220 },
  { k: 'kwuarm',      lvl: 54, val: 300 },
  { k: 'snapdragon',  lvl: 59, val: 520 },
  { k: 'cadantine',   lvl: 65, val: 440 },
  { k: 'lantadyme',   lvl: 67, val: 560 },
  { k: 'dwarf_weed',  lvl: 70, val: 480 },
  { k: 'torstol',     lvl: 75, val: 920 },
];
HERBS.forEach(h => {
  res({ id: `grimy_${h.k}`, name: `Grimy ${h.k.replace('_',' ')}`, category: 'herb_grimy', stackable: false, weight: 0.01, value: Math.round(h.val * 0.7), tradeable: true, requirements: { herblore: h.lvl }, examine: `A grimy ${h.k.replace('_',' ')} still caked with dirt.` });
  res({ id: `clean_${h.k}`, name: `${cap(h.k.replace('_',' '))} leaf`,     category: 'herb_clean', stackable: false, weight: 0.01, value: h.val, tradeable: true, requirements: { herblore: h.lvl }, examine: `A cleaned ${h.k.replace('_',' ')} leaf.` });
  res({ id: `${h.k}_seed`,  name: `${cap(h.k.replace('_',' '))} seed`,     category: 'seed', stackable: true, weight: 0, value: Math.round(h.val * 0.4), tradeable: true, requirements: { farming: h.lvl - 1 }, examine: `A ${h.k.replace('_',' ')} seed for the herb patch.` });
});

// Potion secondaries
const SECONDARIES = [
  ['eye_of_newt', 'Eye of newt', 3],
  ['limpwurt_root', 'Limpwurt root', 30],
  ['white_berries', 'White berries', 35],
  ['unicorn_horn_dust', 'Unicorn horn dust', 25],
  ['snape_grass', 'Snape grass', 100],
  ['red_spider_eggs', "Red spiders' eggs", 18],
  ['chocolate_dust', 'Chocolate dust', 10],
  ['amylase_crystal', 'Amylase crystal', 1600],
  ['crushed_nest', 'Crushed bird nest', 220],
  ['dragon_scale_dust', 'Dragon scale dust', 800],
  ['potato_cactus', 'Potato cactus', 400],
  ['wine_of_zamorak', 'Wine of Zamorak', 200],
  ['jangerberries', 'Jangerberries', 45],
  ['zulrah_scales', 'Zulrah scales', 280],
  ['mort_myre_fungus', 'Mort myre fungus', 90],
  ['nail_beast_nails', 'Nail beast nails', 1200],
  ['snake_weed', 'Snake weed', 80],
  ['eternium_crystal', 'Eternium crystal', 18000],
  ['preserved_essence', 'Preserved essence', 9500],
];
SECONDARIES.forEach(([id, n, v]) => res({ id, name: n, category: 'secondary', stackable: true, weight: 0.01, value: v, tradeable: true, examine: `${n}. Used in herblore.` }));

// Runes — standard + combination
const RUNES = [
  { id: 'air_rune',     n: 'Air rune',     val: 4 },
  { id: 'water_rune',   n: 'Water rune',   val: 4 },
  { id: 'earth_rune',   n: 'Earth rune',   val: 4 },
  { id: 'fire_rune',    n: 'Fire rune',    val: 4 },
  { id: 'mind_rune',    n: 'Mind rune',    val: 3 },
  { id: 'body_rune',    n: 'Body rune',    val: 3 },
  { id: 'chaos_rune',   n: 'Chaos rune',   val: 70 },
  { id: 'death_rune',   n: 'Death rune',   val: 180 },
  { id: 'blood_rune',   n: 'Blood rune',   val: 260 },
  { id: 'soul_rune',    n: 'Soul rune',    val: 310 },
  { id: 'nature_rune',  n: 'Nature rune',  val: 150 },
  { id: 'law_rune',     n: 'Law rune',     val: 200 },
  { id: 'astral_rune',  n: 'Astral rune',  val: 210 },
  { id: 'cosmic_rune',  n: 'Cosmic rune',  val: 120 },
  { id: 'wrath_rune',   n: 'Wrath rune',   val: 420 },
  // Combination runes (Marstead-flavored)
  { id: 'dust_rune',    n: 'Dust rune',    val: 12, combo: 'air + earth' },
  { id: 'smoke_rune',   n: 'Smoke rune',   val: 14, combo: 'air + fire' },
  { id: 'mist_rune',    n: 'Mist rune',    val: 12, combo: 'air + water' },
  { id: 'lava_rune',    n: 'Lava rune',    val: 16, combo: 'earth + fire' },
  { id: 'mud_rune',     n: 'Mud rune',     val: 18, combo: 'earth + water' },
  { id: 'steam_rune',   n: 'Steam rune',   val: 18, combo: 'water + fire' },
  { id: 'ink_rune',     n: 'Ink rune',     val: 280, combo: 'blood + soul (Inkweald exclusive)' },
  { id: 'moon_rune',    n: 'Moon rune',    val: 260, combo: 'astral + cosmic (Veilwood exclusive)' },
  { id: 'salt_rune',    n: 'Salt rune',    val: 220, combo: 'water + earth + soul (Saltbrine exclusive)' },
  { id: 'sun_rune',     n: 'Sun rune',     val: 320, combo: 'fire + soul (Glass Desert exclusive)' },
];
RUNES.forEach(r => res({
  id: r.id, name: r.n, category: 'rune', stackable: true, weight: 0, value: r.val,
  tradeable: true, tags: ['rune', 'stackable'], combo: r.combo,
  examine: `A ${r.n.toLowerCase()}.` + (r.combo ? ` Combination: ${r.combo}.` : ''),
}));

// Essence
res({ id: 'rune_essence', name: 'Rune essence', category: 'essence', stackable: false, weight: 0.01, value: 12, tradeable: true, requirements: { mining: 1 }, examine: 'Raw essence for low runes.' });
res({ id: 'pure_essence', name: 'Pure essence', category: 'essence', stackable: false, weight: 0.01, value: 30, tradeable: true, requirements: { mining: 30 }, examine: 'Pure essence for high-tier runes.' });
res({ id: 'dark_essence_fragment', name: 'Dark essence fragment', category: 'essence', stackable: false, weight: 0.01, value: 850, tradeable: false, requirements: { runecrafting: 62 }, examine: 'Used to craft blood runes.' });

// Hides & leather (Scape regional variants)
const HIDES = [
  ['cowhide',        'Cowhide',        1,  10],
  ['deer_hide',      'Deer hide',      15, 45],
  ['boar_hide',      'Boar hide',      25, 80],
  ['wyvern_hide',    'Wyvern hide',    40, 260],
  ['firedrake_hide', 'Firedrake hide', 50, 520],
  ['brinescale_hide','Brinescale hide',60, 850],
  ['shadowhide',     'Shadowhide',     70, 1400],
  ['wyrmscale',      'Wyrmscale',      75, 2800],
];
HIDES.forEach(([id, n, lvl, val]) => {
  res({ id, name: n, category: 'hide', stackable: false, weight: 1.5, value: Math.round(val * 0.6), tradeable: true, requirements: { crafting: lvl }, examine: `Untanned ${n.toLowerCase()}.` });
  res({ id: `${id}_tanned`, name: `Tanned ${n.toLowerCase()}`, category: 'leather', stackable: false, weight: 1.4, value: val, tradeable: true, requirements: { crafting: lvl + 1 }, examine: `Tanned ${n.toLowerCase()}.` });
});

// Additional raw food (raw meats)
const MEATS = [
  ['raw_chicken', 'Raw chicken', 1,  5],
  ['raw_beef',    'Raw beef',    1,  5],
  ['raw_pork',    'Raw pork',    1,  8],
  ['raw_pheasant','Raw pheasant',30, 40],
  ['raw_venison', 'Raw venison', 40, 90],
  ['raw_bear',    'Raw bear',    48, 120],
  ['raw_boar',    'Raw boar',    30, 55],
  ['raw_rabbit',  'Raw rabbit',  1,  4],
  ['raw_rat_meat','Raw rat meat',1,  1],
  ['raw_cod',     'Raw cod',     18, 15],
  ['raw_eel',     'Raw eel',     28, 30],
  ['raw_shark_tail','Raw shark tail', 76, 450],
];
MEATS.forEach(([id, n, lvl, val]) => res({ id, name: n, category: 'raw_meat', stackable: false, weight: 0.5, value: val, tradeable: true, requirements: { hunter: lvl > 30 ? lvl : 1 }, examine: `${n}.` }));

// Cooking ingredients (flour, eggs, dairy, vegetables, fruits, etc.)
const INGREDIENTS = [
  ['flour',         'Pot of flour',     1, 10, 'pot'],
  ['grain',         'Grain',            1, 5,  'raw'],
  ['pot_empty',     'Empty pot',        1, 1,  'container'],
  ['pot_of_water',  'Pot of water',     1, 2,  'liquid'],
  ['vial',          'Vial',             1, 1,  'container'],
  ['vial_of_water', 'Vial of water',    1, 2,  'liquid'],
  ['bucket',        'Bucket',           1, 2,  'container'],
  ['bucket_of_water','Bucket of water', 1, 3,  'liquid'],
  ['bucket_of_milk','Bucket of milk',   1, 10, 'liquid'],
  ['egg',           'Egg',              1, 5,  'raw'],
  ['butter',        'Pat of butter',    1, 15, 'dairy'],
  ['cheese',        'Cheese',           1, 12, 'dairy'],
  ['cream',         'Cream',            1, 20, 'dairy'],
  ['salt',          'Salt',             1, 4,  'seasoning'],
  ['pepper',        'Pepper',           1, 8,  'seasoning'],
  ['chilli',        'Red chilli',       1, 12, 'spice'],
  ['garlic',        'Garlic',           1, 6,  'herb'],
  ['onion',         'Onion',            1, 4,  'vegetable'],
  ['potato',        'Potato',           1, 3,  'vegetable'],
  ['cabbage',       'Cabbage',          1, 5,  'vegetable'],
  ['tomato',        'Tomato',           1, 6,  'vegetable'],
  ['sweetcorn',     'Sweetcorn',        1, 12, 'vegetable'],
  ['mushroom',      'Mushroom',         1, 8,  'vegetable'],
  ['cactus_spine',  'Cactus spine',     1, 10, 'desert'],
  ['date_fruit',    'Date fruit',       1, 15, 'fruit'],
  ['coconut',       'Coconut',          1, 40, 'fruit'],
  ['pineapple',     'Pineapple',        1, 45, 'fruit'],
  ['apple',         'Apple',            1, 3,  'fruit'],
  ['orange',        'Orange',           1, 5,  'fruit'],
  ['banana',        'Banana',           1, 5,  'fruit'],
  ['moonberry',     'Moonberry',        1, 40, 'fruit'],
  ['inkberry',      'Inkberry',         1, 55, 'fruit'],
  ['blood',         'Blood',            1, 10, 'liquid'],
  ['oats',          'Oats',             1, 6,  'grain'],
  ['honey',         'Honey',            1, 18, 'sweet'],
  ['sugar',         'Sugar',            1, 8,  'sweet'],
  ['coal_dust',     'Coal dust',        1, 3,  'industrial'],
  ['water',         'Water (from source)', 1, 0, 'liquid'],
  ['kelp',          'Kelp',             1, 15, 'sea'],
  ['sea_salt',      'Sea salt',         1, 20, 'sea'],
];
INGREDIENTS.forEach(([id, n, lvl, val, cat]) => res({
  id, name: n, category: 'ingredient', sub_category: cat, stackable: cat === 'seasoning' || cat === 'spice' || cat === 'sweet',
  weight: cat === 'container' ? 0.5 : cat === 'liquid' ? 1.0 : 0.2,
  value: val, tradeable: true, requirements: {},
  examine: `${n}. A common cooking ingredient.`,
}));

// Arrow components (tips + shafts) per tier
['tinroot','pigiron','coalsteel','quicksilver','blacksteel','runeforge','dragonsteel','aeldra','wyrmforged'].forEach((tier, i) => {
  res({
    id: `${tier}_arrowtip`, name: `${cap(tier)} arrowtip`,
    category: 'ammo_component', stackable: true, weight: 0,
    value: 4 * (i + 1) * 2, tradeable: true,
    requirements: { smithing: 1 + i * 10 }, examine: `${cap(tier)} arrowtip. 15 per bar.`,
  });
  res({
    id: `${tier}_arrows`, name: `${cap(tier)} arrows`,
    category: 'ammo', sub_category: 'arrow', stackable: true, weight: 0,
    value: 12 * (i + 1) * 2, tradeable: true, slot: 'ammo',
    requirements: { ranged: 1 + i * 10 },
    stats: { ranged_strength: 7 + i * 12 },
    examine: `${cap(tier)} arrows. Requires ranged ${1 + i * 10}.`,
  });
  res({
    id: `${tier}_bolts`, name: `${cap(tier)} bolts`,
    category: 'ammo', sub_category: 'bolt', stackable: true, weight: 0,
    value: 15 * (i + 1) * 2, tradeable: true, slot: 'ammo',
    requirements: { ranged: 1 + i * 10 },
    stats: { ranged_strength: 10 + i * 14 },
    examine: `${cap(tier)} crossbow bolts. Requires ranged ${1 + i * 10}.`,
  });
  res({
    id: `${tier}_knives`, name: `${cap(tier)} throwing knives`,
    category: 'ammo', sub_category: 'thrown', stackable: true, weight: 0,
    value: 10 * (i + 1) * 2, tradeable: true, slot: 'weapon',
    requirements: { ranged: 1 + i * 10 },
    stats: { attack_ranged: 5 + i * 8, ranged_strength: 6 + i * 10 },
    examine: `Thrown ${tier} knives. Stackable.`,
  });
});
res({ id: 'arrow_shaft', name: 'Arrow shaft', category: 'ammo_component', stackable: true, weight: 0, value: 1, tradeable: true, examine: 'Fletching arrow shafts.' });
res({ id: 'feather', name: 'Feather', category: 'ammo_component', stackable: true, weight: 0, value: 2, tradeable: true, examine: 'Used to fletch arrows.' });
res({ id: 'headless_arrow', name: 'Headless arrow', category: 'ammo_component', stackable: true, weight: 0, value: 3, tradeable: true, examine: 'Arrow shaft + feather.' });
res({ id: 'bowstring', name: 'Bowstring', category: 'ammo_component', stackable: true, weight: 0, value: 120, tradeable: true, examine: 'Spun from flax. Strings bows.' });
res({ id: 'flax', name: 'Flax', category: 'ammo_component', stackable: false, weight: 0.1, value: 16, tradeable: true, examine: 'Spin into bowstring.' });

// Allotment seeds + produce
const ALLOTMENT = [
  ['potato',       'Potato',       1,  5,  3],
  ['onion',        'Onion',        5,  8,  4],
  ['cabbage',      'Cabbage',      7,  10, 5],
  ['tomato',       'Tomato',       12, 15, 6],
  ['sweetcorn',    'Sweetcorn',    20, 22, 12],
  ['strawberry',   'Strawberry',   31, 30, 25],
  ['watermelon',   'Watermelon',   47, 90, 120],
  ['snape_grass',  'Snape grass',  60, 160, 100],
  ['white_berries','White berries', 59, 150, 35],
];
ALLOTMENT.forEach(([id, n, lvl, seedVal, prodVal]) => {
  res({ id: `${id}_seed`,    name: `${n} seed`,    category: 'seed', sub_category: 'allotment', stackable: true, weight: 0, value: seedVal, tradeable: true, requirements: { farming: lvl }, examine: `Plant in an allotment patch.` });
  // produce also defined (if not already in INGREDIENTS)
});

// Fruit tree seeds
const FRUIT_TREES = [
  ['apple_tree',      'Apple tree seed',       27, 40],
  ['banana_tree',     'Banana tree seed',      33, 75],
  ['orange_tree',     'Orange tree seed',      39, 120],
  ['curry_tree',      'Curry tree seed',       42, 180],
  ['pineapple_tree',  'Pineapple tree seed',   51, 280],
  ['papaya_tree',     'Papaya tree seed',      57, 500],
  ['palm_tree',       'Palm tree seed',        68, 1200],
  ['dragonfruit_tree','Dragonfruit tree seed', 81, 9500],
  ['moonberry_tree',  'Moonberry tree seed',   75, 3200],
];
FRUIT_TREES.forEach(([k, n, lvl, val]) => res({
  id: `${k}_seed`, name: n, category: 'seed', sub_category: 'fruit_tree',
  stackable: true, weight: 0, value: val, tradeable: true,
  requirements: { farming: lvl }, examine: `Plant in a fruit tree patch.`,
}));

// Tree saplings
const TREE_SAPLINGS = [
  ['oak',         15, 14, 40],
  ['willow',      30, 22, 90],
  ['maple',       45, 48, 280],
  ['yew',         60, 280, 1200],
  ['magic',       75, 900, 5500],
  ['redwood',     90, 1800, 18000],
];
TREE_SAPLINGS.forEach(([k, lvl, seedVal, saplingVal]) => {
  res({ id: `${k}_tree_seed`, name: `${cap(k)} tree seed`, category: 'seed', sub_category: 'tree', stackable: true, weight: 0, value: seedVal, tradeable: true, requirements: { farming: lvl }, examine: `Plant in a plant pot, water to grow sapling.` });
  res({ id: `${k}_sapling`, name: `${cap(k)} sapling`, category: 'sapling', stackable: false, weight: 0.1, value: saplingVal, tradeable: true, requirements: { farming: lvl }, examine: `A ${k} sapling, ready to plant.` });
});

// Bush seeds
const BUSHES = [
  ['redberry',   10, 10,  2],
  ['cadavaberry',22, 22, 7],
  ['dwellberry', 36, 55, 10],
  ['jangerberry',48, 80, 15],
  ['whiteberry', 59, 150, 35],
  ['poisonivy',  70, 300, 50],
];
BUSHES.forEach(([k, lvl, seedVal, berryVal]) => {
  res({ id: `${k}_seed`, name: `${cap(k)} seed`, category: 'seed', sub_category: 'bush', stackable: true, weight: 0, value: seedVal, tradeable: true, requirements: { farming: lvl }, examine: `Plant in a bush patch.` });
  res({ id: k, name: cap(k), category: 'fruit', stackable: false, weight: 0.1, value: berryVal, tradeable: true, examine: `A handful of ${k} berries.` });
});

// Log shortcut — more wood-like resources
const WOOD_ACCESSORIES = [
  ['planks_regular', 'Plank', 100, 1],
  ['oak_planks', 'Oak plank', 250, 15],
  ['teak_plank', 'Teak plank', 500, 35],
  ['mahogany_plank','Mahogany plank', 1500, 50],
  ['redwood_plank','Redwood plank', 4800, 85],
];
WOOD_ACCESSORIES.forEach(([id, n, val, lvl]) => res({
  id, name: n, category: 'processed_wood', stackable: false, weight: 1.5, value: val, tradeable: true, requirements: { construction: lvl }, examine: `A sawmill-cut ${n.toLowerCase()}.`
}));

// Rope / nails / misc
const MISC_RES = [
  ['rope',       'Rope',         18,  1,   'utility'],
  ['chisel',     'Chisel',       5,   1,   'tool'],
  ['hammer',     'Hammer',       5,   1,   'tool'],
  ['knife',      'Knife',        6,   1,   'tool'],
  ['tinderbox',  'Tinderbox',    1,   1,   'tool'],
  ['rake',       'Rake',         3,   1,   'tool'],
  ['dibber',     'Seed dibber',  4,   1,   'tool'],
  ['spade',      'Spade',        3,   1,   'tool'],
  ['needle',     'Needle',       1,   1,   'tool'],
  ['thread',     'Thread',       1,   1,   'tool'],
  ['nails_iron', 'Iron nails',   5,   1,   'utility'],
  ['nails_steel','Steel nails',  15,  1,   'utility'],
  ['nails_mith', 'Mithril nails', 30, 20,  'utility'],
  ['nails_adam', 'Adamant nails', 60, 30,  'utility'],
  ['nails_rune', 'Rune nails',    120, 40, 'utility'],
];
MISC_RES.forEach(([id, n, val, lvl, cat]) => res({
  id, name: n, category: cat, stackable: cat === 'utility' && n.includes('nails'), weight: 0.5, value: val, tradeable: true, requirements: lvl > 1 ? { crafting: lvl } : {}, examine: `A ${n.toLowerCase()}.`,
}));

// Bones & ashes (prayer XP)
const BONES = [
  ['bones',          'Bones',          5,   1 ],
  ['big_bones',      'Big bones',     15,  15 ],
  ['cursed_bones',   'Cursed bones',  42, 150 ],
  ['dragon_bones',   'Dragon bones',  72, 800 ],
  ['wyrm_bones',     'Wyrm bones',    80, 2200 ],
  ['moonbeast_bones','Moonbeast bones',90, 4500 ],
  ['ashes',          'Ashes',         4,    1 ],
  ['white_ashes',    'White ashes',  20,   30 ],
  ['infernal_ashes', 'Infernal ashes',110, 6000 ],
];
BONES.forEach(([id, n, val, lvl]) => res({
  id, name: n, category: 'prayer_resource', stackable: false, weight: id.includes('dragon') ? 1.5 : 1.0,
  value: val, tradeable: true, requirements: { prayer: lvl > 50 ? lvl : 1 },
  examine: `${n}. Bury for prayer XP.`,
}));

writeJson('resources.json', resources);

// ══════════════════════════════════════════════════════════════════════════════
// QUEST ITEMS
// ══════════════════════════════════════════════════════════════════════════════
const questItems = [];
const qi = (x) => questItems.push({ tradeable: false, stackable: false, weight: 0.1, ...x });

// Keys
const KEYS = [
  ['heartlands_barn_key',       'Heartlands barn key',       'Unlocks the back door of the old Heartlands barn.'],
  ['sootworks_foundry_key',     'Sootworks foundry key',     'Opens the Sootworks masters\' foundry gate.'],
  ['moryskah_crypt_key',        'Moryskah crypt key',        'A cold iron key crusted with grave-dust.'],
  ['boneyard_tomb_key',         'Boneyard tomb key',         'A scarab-cut brass key.'],
  ['glass_spire_key',           'Glass spire key',           'A prism-cut crystal, carved like a key.'],
  ['saltbrine_harbor_key',      'Saltbrine harbor key',      'A rust-pitted key from a drowned harbormaster.'],
  ['veilwood_grove_key',        'Veilwood grove key',        'A branch-shaped key. Grows if you plant it.'],
  ['inkweald_library_key',      'Inkweald library key',      'A folded paper key that unfolds to fit the lock.'],
  ['wilds_warlord_skull_key',   'Wilds warlord skull key',   'A skull with teeth that fit as key-bits.'],
  ['chapel_vestry_key',         'Chapel vestry key',         'Rusted, but it still turns.'],
  ['lighthouse_lens_key',       'Lighthouse lens key',       'Unlocks the Saltbrine lighthouse lens housing.'],
  ['deep_mine_foreman_key',     "Deep Mine foreman's key",   'The Sootworks deep-mine foreman\'s master key.'],
  ['pharaoh_sarcophagus_key',   'Pharaoh sarcophagus key',   'A scarab-shaped bronze key, hot to the touch.'],
  ['crystal_gate_shard',        'Crystal gate shard',        'One of three shards needed to open the Glass Desert gate.'],
  ['moon_sanctum_key',          'Moon sanctum key',          'Glows at night, dead at day.'],
];
KEYS.forEach(([id, n, ex]) => qi({ id, name: n, category: 'quest_key', value: 1, tags: ['key', 'quest_item', 'untradeable'], examine: ex }));

// Letters / documents
const LETTERS = [
  ['faded_letter_to_moryskah',  'Faded letter to Moryskah',  'A stained letter asking after a brother long gone to the crypts.'],
  ['forge_masters_ledger',      "Forge master's ledger",     'A ledger of Sootworks clients. One client is not a person.'],
  ['pharoahs_riddle_scroll',    "Pharaoh's riddle scroll",   'A riddle scroll from a long-sealed tomb.'],
  ['drowner_captains_log',      "Drowner captain's log",     'The last log of a captain who never surfaced.'],
  ['inkweald_chapter_fragment', 'Inkweald chapter fragment', 'A torn fragment — a chapter from a book with no library.'],
  ['veilwood_grove_song_sheet', 'Grove song sheet',          'A song only the fey can read; eyes water reading it.'],
  ['crystal_sages_testament',   "Crystal sage's testament",  'Written in light, visible only in direct sun.'],
  ['revenant_list_of_names',    'Revenant list of names',    'Names of PKers who owe blood-debts to the Wilds.'],
  ['heartlands_deed',           'Heartlands deed',           'Deed to a plot of Heartlands farmland. Required to start A Farmer\'s Burden.'],
  ['sootworks_indenture_papers','Sootworks indenture papers','Papers binding a Sootworks apprentice. Burn them?'],
];
LETTERS.forEach(([id, n, ex]) => qi({ id, name: n, category: 'quest_document', value: 0, tags: ['document', 'quest_item'], examine: ex }));

// Plot tokens / relics
const PLOT = [
  ['champions_sigil_heartlands','Heartlands champion sigil','Awarded for completing Heartlands Grand Diary. Proof of Heartlands champion.'],
  ['reapers_harp_string',       "Reaper's harp string",      'A single harp string, black and resonant. Quest: The Reaper\'s Hymn.'],
  ['ashen_crown_half',          'Ashen crown (half)',        'Half of the Ashen Crown. Match with the other half to unlock Moryskah\'s throne.'],
  ['ashen_crown_other_half',    'Ashen crown (other half)',  'The other half of the crown.'],
  ['salt_kings_trident',        "Salt King's trident",       'A broken trident. Recovered; needs the Sunken Forge to be reforged.'],
  ['veilwood_heartwood_sprig',  'Heartwood sprig',           'Planted at the grove altar, grows into a portal tree.'],
  ['inkweald_bound_name',       'Bound name',                'Your name, written in the forbidden book — cursed until unbound.'],
  ['pharaoh_canopic_jar',       'Pharaoh canopic jar',       'One of four canopic jars. Collect all four to free the pharaoh\'s soul.'],
  ['glass_prism_core',          'Glass prism core',          'Refracts the setting sun into a doorway.'],
  ['wyrm_heart_relic',          'Wyrm heart relic',          'The heart of the Crystal Wyrm, still beating. Power source for Wyrmforged gear.'],
  ['chalice_of_first_light',    'Chalice of first light',    'Drinks dawn; refills on every sunrise.'],
  ['cursed_signet_of_moryskah', 'Cursed signet of Moryskah', 'Marks its bearer. Attracts undead. Drops prayer by 20% while held.'],
  ['champions_token_sootworks', 'Sootworks champion token',  'Proof of mastery over the Sootworks forges.'],
  ['champions_token_moryskah',  'Moryskah champion token',   'Proof of conquering the crypts.'],
  ['champions_token_boneyard',  'Boneyard champion token',   'Proof of solving the Boneyard tombs.'],
  ['champions_token_glass',     'Glass Desert champion token','Proof of clearing the Glass Desert.'],
  ['champions_token_saltbrine', 'Saltbrine champion token',  'Proof of surviving the Saltbrine depths.'],
  ['champions_token_veilwood',  'Veilwood champion token',   'Proof of walking Veilwood\'s moon paths.'],
  ['champions_token_inkweald',  'Inkweald champion token',   'Proof of reading the forbidden chapter.'],
  ['champions_token_wilds',     'Wilds champion token',      'Proof of surviving the Wilds. Cannot be lost on death.'],
];
PLOT.forEach(([id, n, ex]) => qi({ id, name: n, category: 'plot_token', value: 0, tags: ['plot', 'quest_item'], examine: ex }));

// Ferry tokens / passage
const PASSAGE = [
  ['saltbrine_ferry_ticket',    'Saltbrine ferry ticket',    'One-way crossing to Saltbrine outer islands.', true],
  ['wilds_gate_token',          'Wilds gate token',          'Single-use token to bypass the Wilds entrance skull-check.', true],
  ['veilwood_grove_passport',   'Veilwood grove passport',   'Accepted by the fey at grove gates.', false],
  ['boneyard_caravan_pass',     'Boneyard caravan pass',     'Season pass for all boneyard caravans.', false],
  ['inkweald_reader_pass',      'Inkweald reader pass',      'Permits you to check out books from the forbidden section.', false],
  ['moryskah_mourners_pin',     "Moryskah mourner's pin",    'Marks you as a mourner; Moryskah undead will not attack for 24 in-game hours.', false],
];
PASSAGE.forEach(([id, n, ex, stack]) => qi({ id, name: n, category: 'passage', value: 0, stackable: stack, tags: ['passage', 'quest_item'], examine: ex }));

writeJson('quest-items.json', questItems);

// ══════════════════════════════════════════════════════════════════════════════
// REAGENTS — the core Marstead pillar #3 system
// Each reagent: boss drop or skill output. Pairs with OLD item to make upgrade.
// Never deprecates — old item is always a consumed input.
// ══════════════════════════════════════════════════════════════════════════════
const reagents = [];
const reagentPairs = [];

const defReagent = (r) => reagents.push(r);
const defPair = (p) => reagentPairs.push(p);

// ── Reagents (the dropped/earned items) ──────────────────────────────────────
const REAGENT_DROPS = [
  // Heartlands
  { id: 'hedgelord_fang',           name: 'Hedgelord fang',           source: 'The Hedgelord (Heartlands)',   region: 'heartlands', value: 280000, flavor: 'A single needle-sharp bristle from the Hedgelord. Feels warm.' },
  { id: 'field_baron_sigil',        name: 'Field Baron sigil',        source: 'Field Baron (Heartlands)',      region: 'heartlands', value: 380000, flavor: 'The seal of the Heartlands\' greatest farmer-king.' },
  { id: 'champions_pin',            name: 'Champion pin',             source: 'Heartlands Grand Diary',         region: 'heartlands', value: 450000, flavor: 'Awarded for completing Heartlands elite diary.' },
  // Sootworks
  { id: 'forge_wraith_essence',     name: 'Forge-wraith essence',     source: 'Forge-Wraith (Sootworks)',       region: 'sootworks',  value: 420000, flavor: 'Captured heat in a sealed vial. Hot to the touch forever.' },
  { id: 'rust_golem_core',          name: 'Rust-golem core',          source: 'Rust Golem (Sootworks)',          region: 'sootworks',  value: 520000, flavor: 'Cracked magnetite heart. Pulses weakly.' },
  { id: 'sootlord_ingot',           name: 'Sootlord ingot',           source: 'The Sootlord (Sootworks)',         region: 'sootworks',  value: 900000, flavor: 'An ingot of blackened steel that refuses to cool.' },
  // Moryskah
  { id: 'ember_of_the_mire',        name: 'Ember of the Mire',        source: 'Bog-Witch (Moryskah)',             region: 'moryskah',   value: 680000, flavor: 'A single coal that burns cold. Still glowing.' },
  { id: 'grave_lord_talisman',      name: 'Grave lord talisman',      source: 'The Grave Lord (Moryskah)',       region: 'moryskah',   value: 1100000,flavor: 'Talisman pulled from the throat of the Grave Lord.' },
  { id: 'vampire_fang_shard',       name: 'Vampire fang shard',       source: 'Nocturne Vampire (Moryskah)',     region: 'moryskah',   value: 320000, flavor: 'Fragment of a vampire fang. Still bleeds on iron.' },
  { id: 'crypt_ichor_vial',         name: 'Crypt ichor vial',         source: 'Crypt Bats (Moryskah)',            region: 'moryskah',   value: 180000, flavor: 'Black ooze from the crypt floors. Bubbles on contact with silver.' },
  // Boneyard
  { id: 'pharaohs_scarab',          name: "Pharaoh's scarab",         source: 'The Buried Pharaoh (Boneyard)',   region: 'boneyard',   value: 850000, flavor: 'A scarab fused with the soul of a pharaoh. Still scurries.' },
  { id: 'dust_dweller_fang',        name: 'Dust-dweller fang',        source: 'Dust Dweller (Boneyard)',          region: 'boneyard',   value: 260000, flavor: 'Long flat fang worn smooth by sandstorms.' },
  { id: 'sandwyrm_scale',           name: 'Sandwyrm scale',           source: 'Sandwyrm (Boneyard)',              region: 'boneyard',   value: 440000, flavor: 'A flat amber scale. Holds heat for hours.' },
  // Glass Desert
  { id: 'prism_core',               name: 'Prism core',               source: 'Prism Beast (Glass Desert)',       region: 'glass_desert',value: 680000, flavor: 'A prism that refracts not light, but intent.' },
  { id: 'crystal_hunter_heart',     name: 'Crystal hunter heart',     source: 'Crystal Hunter (Glass Desert)',    region: 'glass_desert',value: 820000, flavor: 'A heart of spun glass. Sharp to the touch.' },
  { id: 'wyrm_scale',               name: 'Wyrm scale',               source: 'Crystal Wyrm (Glass Desert boss)', region: 'glass_desert',value: 1500000,flavor: 'Massive scale from the Crystal Wyrm.' },
  { id: 'attuned_wyrm_scale',       name: 'Attuned wyrm scale',       source: 'Crystal Wyrm (Glass Desert boss) — rare', region: 'glass_desert', value: 4200000, flavor: 'A wyrm scale resonating with crystal energy.' },
  // Saltbrine
  { id: 'brine_crystal',            name: 'Brine crystal',            source: 'Brine Troll (Saltbrine)',          region: 'saltbrine',  value: 320000, flavor: 'A crystal that only grows in brine. Bitter taste.' },
  { id: 'kraken_tentacle_tip',      name: 'Kraken tentacle tip',      source: 'The Kraken (Saltbrine)',           region: 'saltbrine',  value: 1400000,flavor: 'The last inch of a kraken tentacle. Still squirms.' },
  { id: 'drowner_lantern_core',     name: 'Drowner lantern core',     source: 'Drowner (Saltbrine)',              region: 'saltbrine',  value: 520000, flavor: 'A lantern core that burns underwater.' },
  { id: 'tidestone',                name: 'Tidestone',                source: 'Tide shrines (Saltbrine)',          region: 'saltbrine',  value: 180000, flavor: 'A stone shaped by a thousand tides.' },
  // Veilwood
  { id: 'moonglass_shard',          name: 'Moonglass shard',          source: 'Moonbeast (Veilwood)',             region: 'veilwood',   value: 420000, flavor: 'Moonlight, solidified. Only sharp at night.' },
  { id: 'fey_ribbon',               name: 'Fey ribbon',               source: 'Fey Trickster (Veilwood)',          region: 'veilwood',   value: 260000, flavor: 'A ribbon from a fey\'s hair. Never untangles.' },
  { id: 'grove_heartwood',          name: 'Grove heartwood',          source: 'The Grove Warden (Veilwood)',      region: 'veilwood',   value: 950000, flavor: 'Wood with a slow, steady pulse.' },
  { id: 'veil_king_antler',         name: 'Veil King antler',         source: 'The Veil King (Veilwood)',         region: 'veilwood',   value: 1800000,flavor: 'A full antler. Reflects nothing — no sun, no fire.' },
  // Inkweald
  { id: 'bound_chapter',            name: 'Bound chapter',            source: 'The Margin-Dweller (Inkweald)',    region: 'inkweald',   value: 560000, flavor: 'A single chapter, bound in human skin. Readable only in dreams.' },
  { id: 'ink_heart',                name: 'Ink heart',                source: 'Page-Spawn (Inkweald)',            region: 'inkweald',   value: 420000, flavor: 'A heart of wet ink. Beats slower when read.' },
  { id: 'forgotten_syllable',       name: 'Forgotten syllable',       source: 'The Forgotten Author (Inkweald)', region: 'inkweald',   value: 2200000,flavor: 'A single syllable carved into bone. Silence around it.' },
  // Wilds
  { id: 'revenant_ether',           name: 'Revenant ether',           source: 'Revenants (Wilds)',                region: 'wilds',      value: 380000, flavor: 'A bottle of bound Wilderness wind.' },
  { id: 'chaos_touched_core',       name: 'Chaos-touched core',       source: 'Chaos Fanatic (Wilds)',             region: 'wilds',      value: 920000, flavor: 'A core pulsing with raw chaos.' },
  { id: 'forsaken_relic',           name: 'Forsaken relic',           source: 'Wilds bosses (Wilds)',              region: 'wilds',      value: 2500000,flavor: 'A holy relic, abandoned centuries ago. Still blessed.' },
  // Universal / tier-up
  { id: 'aeldra_charge',            name: 'Aeldra charge',            source: 'Veilwood elves / grove',             region: 'veilwood',   value: 200000, flavor: 'A pinch of aeldra crystal. Recharges aeldra gear for 10 hours combat.' },
  { id: 'wyrmforge_flame',          name: 'Wyrmforge flame',          source: 'Glass Desert wyrm forge',            region: 'glass_desert',value: 1800000,flavor: 'A flame that burns only on wyrm breath.' },
  // Reagents also used as potion secondaries implicitly exist in resources.json; keep this focused on combine-reagents.
  { id: 'godsword_shard_1',         name: 'Godsword shard 1',         source: 'GWD-style boss drop (Inkweald)',     region: 'inkweald',   value: 600000, flavor: 'A shard of a godsword. Combines with 2 others + hilt.' },
  { id: 'godsword_shard_2',         name: 'Godsword shard 2',         source: 'GWD-style boss drop (Inkweald)',     region: 'inkweald',   value: 600000, flavor: 'A shard of a godsword.' },
  { id: 'godsword_shard_3',         name: 'Godsword shard 3',         source: 'GWD-style boss drop (Inkweald)',     region: 'inkweald',   value: 600000, flavor: 'A shard of a godsword.' },
  { id: 'godsword_hilt_heartlands', name: 'Heartlands godsword hilt', source: 'Heartlands Champion (very rare)',    region: 'heartlands', value: 2400000,flavor: 'The hilt of a forgotten god.' },
  { id: 'godsword_hilt_moryskah',   name: 'Moryskah godsword hilt',   source: 'The Grave Lord (very rare)',          region: 'moryskah',   value: 2400000,flavor: 'The hilt of a dread god.' },
  { id: 'godsword_hilt_saltbrine',  name: 'Saltbrine godsword hilt',  source: 'The Kraken (very rare)',              region: 'saltbrine',  value: 2400000,flavor: 'The hilt of a sea-god.' },
  { id: 'godsword_hilt_veilwood',   name: 'Veilwood godsword hilt',   source: 'The Veil King (very rare)',           region: 'veilwood',   value: 2400000,flavor: 'The hilt of a moon-god.' },
  // Pet reagents etc
  { id: 'binding_rune_cracked',     name: 'Cracked binding rune',     source: 'minor bosses (any region)',          region: 'any',        value: 45000, flavor: 'A cracked rune that still holds. Used in many upgrades.' },
  { id: 'binding_rune_perfect',     name: 'Perfect binding rune',     source: 'boss rare drop (any region)',         region: 'any',        value: 380000, flavor: 'A flawless binding rune. The core of most endgame combines.' },
  // Additional reagents for breadth (spreads across regions)
  { id: 'kwuarm_extract',           name: 'Kwuarm extract',            source: 'Herblore distillation',               region: 'any',        value: 3200,  flavor: 'Concentrated kwuarm. Potent weapon poison.' },
  { id: 'revenant_crown_shard',     name: 'Revenant crown shard',      source: 'Revenant Knight (Wilds)',             region: 'wilds',      value: 480_000,flavor: 'Shard from a revenant king\'s crown.' },
  { id: 'coralbone_fragment',       name: 'Coralbone fragment',        source: 'Coral Skeleton (Saltbrine)',          region: 'saltbrine',  value: 220_000,flavor: 'Petrified coral woven through bone.' },
  { id: 'ashenheart_seed',          name: 'Ashenheart seed',           source: 'Ashenheart Tree (Moryskah)',          region: 'moryskah',   value: 640_000,flavor: 'A seed that sprouts cold grey fire.' },
  { id: 'loom_thread_of_fate',      name: 'Loom thread of fate',       source: 'The Weaver (Inkweald)',               region: 'inkweald',   value: 1_200_000, flavor: 'A thread cut from the loom of fate itself.' },
  { id: 'sunforged_ingot',          name: 'Sunforged ingot',           source: 'Sunforge Pharaoh (Glass Desert)',     region: 'glass_desert',value: 1_400_000, flavor: 'An ingot forged in a beam of captured sun.' },
  { id: 'briar_crown_petal',        name: 'Briar-crown petal',         source: 'Briar Queen (Veilwood)',              region: 'veilwood',   value: 380_000, flavor: 'A single petal from the Briar Queen\'s crown.' },
];

REAGENT_DROPS.forEach(r => defReagent({
  ...r,
  category: 'reagent',
  stackable: true,
  weight: 0.1,
  tradeable: true,
  tags: ['reagent', 'boss_drop'],
  examine: r.flavor,
}));

// ── Reagent pairings (combine old item + reagent = upgraded item) ───────────
// Format: { pair_id, reagent, base_item, produces, niche, skill, level, xp }
// produces items with IDs prefixed per niche (scorched_*, brined_*, aeldra_*).

const PAIRS = [
  // ── Heartlands — Hedgelord chain: fast attack speed ──
  { pair: 'hedgelord_tempered_scimitar', reagent: 'hedgelord_fang',     base: 'runeforge_scimitar',
    produces: 'hedgelord_scimitar', name: 'Hedgelord scimitar',
    niche: '+10% attack speed vs beasts; old runeforge scimitar is consumed',
    skill: 'smithing', level: 72, xp: 420,
    stats: { attack_slash: 58, melee_strength: 54 }, tags: ['bonus_vs_beast'] },
  { pair: 'champion_crest_upgrade',  reagent: 'champions_pin', base: 'runeforge_helm',
    produces: 'heartlands_champion_crest', name: 'Heartlands Champion Crest',
    niche: 'BiS head for Heartlands-rooted quests; untradeable',
    skill: 'smithing', level: 70, xp: 360,
    tags: ['untradeable_reward', 'niche_bis'] },
  { pair: 'field_baron_cuirass',     reagent: 'field_baron_sigil', base: 'runeforge_platebody',
    produces: 'field_baron_cuirass', name: 'Field Baron cuirass',
    niche: '+2 prayer, +6% defence vs farm-native mobs',
    skill: 'smithing', level: 74, xp: 440 },

  // ── Sootworks — Forge chain: heat-immune, +smithing synergy ──
  { pair: 'forge_wraith_blade',      reagent: 'forge_wraith_essence', base: 'dragonsteel_longsword',
    produces: 'forgewraith_longsword', name: 'Forge-wraith longsword',
    niche: 'Ignites on hit; +15% vs ice/crystal enemies',
    skill: 'smithing', level: 78, xp: 520, tags: ['fire_damage'] },
  { pair: 'rust_golem_armor',        reagent: 'rust_golem_core', base: 'dragonsteel_platebody',
    produces: 'rust_lord_platebody', name: 'Rust Lord platebody',
    niche: 'Returns 5% incoming damage as rust (degrades enemy armour)',
    skill: 'smithing', level: 80, xp: 640 },
  { pair: 'sootlord_greathammer',    reagent: 'sootlord_ingot', base: 'dragonsteel_warhammer',
    produces: 'sootlord_greathammer', name: 'Sootlord greathammer',
    niche: '+25% vs plate-armoured enemies; shatters shields (1 in 3)',
    skill: 'smithing', level: 85, xp: 820, tags: ['shield_shatter'] },

  // ── Moryskah — Bog chain: +undead damage, silver-bane ──
  { pair: 'scorched_rune_scimitar',  reagent: 'ember_of_the_mire', base: 'runeforge_scimitar',
    produces: 'scorched_rune_scimitar', name: 'Scorched rune scimitar',
    niche: '+15% damage vs undead (BiS vs Moryskah bosses)',
    skill: 'smithing', level: 68, xp: 340, tags: ['bonus_vs_undead'] },
  { pair: 'lichbane_pendant',        reagent: 'grave_lord_talisman', base: 'amulet_of_glory',
    produces: 'moryskah_lichbane_pendant', name: 'Lichbane pendant',
    niche: '+4 prayer, +20% dmg to undead, -2% vs anything else',
    skill: 'crafting', level: 70, xp: 420 },
  { pair: 'silver_laced_bolts',      reagent: 'vampire_fang_shard', base: 'runeforge_crossbow',
    produces: 'silverlaced_crossbow', name: 'Silver-laced crossbow',
    niche: 'Bolts auto-silver-tipped vs vampires; ignores vampire DR',
    skill: 'fletching', level: 70, xp: 400 },
  { pair: 'ichor_warpaint',          reagent: 'crypt_ichor_vial', base: 'blacksteel_gauntlets',
    produces: 'crypt_warpaint_gauntlets', name: 'Crypt-painted gauntlets',
    niche: '+8% crit vs undead; scares lesser undead',
    skill: 'crafting', level: 55, xp: 210 },

  // ── Boneyard — Pharaoh chain: heat-immune, bleed ──
  { pair: 'pharaohs_scarab_shield',  reagent: 'pharaohs_scarab', base: 'dragonsteel_kiteshield',
    produces: 'pharaohs_scarab_shield', name: "Pharaoh's scarab shield",
    niche: 'Scarab projectiles auto-counter (20% block chance)',
    skill: 'smithing', level: 80, xp: 620 },
  { pair: 'sandwyrm_arrows',         reagent: 'sandwyrm_scale', base: 'runeforge_arrows',
    produces: 'sandwyrm_arrows', name: 'Sandwyrm arrows (100)',
    niche: 'Bleeds target for 5 ticks (3 dmg each)',
    skill: 'fletching', level: 72, xp: 280, tags: ['stackable', 'bleed'] },
  { pair: 'dust_dweller_cloak',      reagent: 'dust_dweller_fang', base: 'runeforge_cape',
    produces: 'dustdweller_cloak', name: 'Dust-dweller cloak',
    niche: 'Sandstorm stealth; hides you from Boneyard-native mobs for 10s per minute',
    skill: 'crafting', level: 68, xp: 320, tags: ['stealth'] },

  // ── Glass Desert — Wyrm chain: encounter-specific BiS (the headline chain) ──
  { pair: 'wyrm_scale_platebody',    reagent: 'wyrm_scale', base: 'dragonsteel_platebody',
    produces: 'wyrm_scale_platebody', name: 'Wyrm-scale platebody',
    niche: 'BiS defence vs magic; prayer +2',
    skill: 'smithing', level: 80, xp: 780 },
  { pair: 'wyrm_scale_fang',         reagent: 'attuned_wyrm_scale', base: 'dragonsteel_dagger',
    produces: 'crystal_wyrm_fang', name: 'Crystal wyrm fang',
    niche: 'T75 stab weapon, fastest in tier; special lowers enemy def 30%',
    skill: 'smithing', level: 85, xp: 1100, tags: ['special_attack'] },
  { pair: 'prism_bow',               reagent: 'prism_core', base: 'dragonsteel_longbow',
    produces: 'prism_longbow', name: 'Prism longbow',
    niche: 'Splits arrows 3-way vs grouped enemies',
    skill: 'fletching', level: 80, xp: 640, tags: ['multi_target'] },
  { pair: 'crystal_hunter_vambraces',reagent: 'crystal_hunter_heart', base: 'dragonsteel_gauntlets',
    produces: 'crystal_hunter_vambraces', name: 'Crystal-hunter vambraces',
    niche: '+10% ranged str but -15% melee str (sidegrade to melee gauntlets)',
    skill: 'crafting', level: 76, xp: 480 },

  // ── Saltbrine — Brine chain: sea-creature BiS, water breathing ──
  { pair: 'brinekissed_cutlass',     reagent: 'brine_crystal', base: 'runeforge_longsword',
    produces: 'brinekissed_cutlass', name: 'Brine-kissed cutlass',
    niche: '+12% vs sea-creatures; never rusts at sea',
    skill: 'smithing', level: 70, xp: 380, tags: ['bonus_vs_sea'] },
  { pair: 'kraken_tendril_whip',     reagent: 'kraken_tentacle_tip', base: 'runeforge_two_hander',
    produces: 'kraken_whip', name: 'Kraken whip',
    niche: 'Whip-speed (3 tick), +2 tile range; degrades',
    skill: 'crafting', level: 82, xp: 940, tags: ['degrades', 'reach_2'] },
  { pair: 'drowner_lantern_shield',  reagent: 'drowner_lantern_core', base: 'runeforge_kiteshield',
    produces: 'drowner_lantern_shield', name: 'Drowner lantern shield',
    niche: 'Provides light + water-breathing when equipped',
    skill: 'smithing', level: 75, xp: 540, tags: ['light_source', 'water_breathing'] },
  { pair: 'tidestone_amulet',        reagent: 'tidestone', base: 'amulet_of_glory',
    produces: 'tidestone_amulet', name: 'Tidestone amulet',
    niche: '+3 swim speed, +6% vs sea; -10% vs fire enemies',
    skill: 'crafting', level: 60, xp: 280 },

  // ── Veilwood — Moon chain: night-boost BiS ──
  { pair: 'moonsilk_shortbow',       reagent: 'moonglass_shard', base: 'runeforge_shortbow',
    produces: 'moonsilk_shortbow', name: 'Moonsilk shortbow',
    niche: '+20% ranged damage at night, -5% during day',
    skill: 'fletching', level: 75, xp: 520, tags: ['night_boost'] },
  { pair: 'fey_ribbon_cloak',        reagent: 'fey_ribbon', base: 'dragonsteel_cape',
    produces: 'fey_ribbon_cloak', name: 'Fey-ribbon cloak',
    niche: 'Run energy does not drain while worn — tradeoff: -10% defence all',
    skill: 'crafting', level: 70, xp: 440, tags: ['inf_run'] },
  { pair: 'grove_heartwood_staff',   reagent: 'grove_heartwood', base: 'runeforge_staff',
    produces: 'grove_heartwood_staff', name: 'Grove heartwood staff',
    niche: 'Heals 1 HP per spell cast; -10% magic damage',
    skill: 'crafting', level: 78, xp: 680, tags: ['heal_on_cast'] },
  { pair: 'veil_king_crown',         reagent: 'veil_king_antler', base: 'dragonsteel_helm',
    produces: 'veil_king_crown', name: 'Veil King crown',
    niche: 'BiS prayer helm at night; prayer +5 at night, 0 at day',
    skill: 'smithing', level: 82, xp: 920, tags: ['night_only'] },

  // ── Inkweald — Book chain: arcane damage, rune discount ──
  { pair: 'bound_tome_upgrade',      reagent: 'bound_chapter', base: 'runeforge_kiteshield',
    produces: 'inkweald_bound_tome', name: 'Bound tome',
    niche: '+18 magic attack; book shield (no defence stats)',
    skill: 'crafting', level: 75, xp: 580 },
  { pair: 'ink_heart_staff',         reagent: 'ink_heart', base: 'runeforge_staff',
    produces: 'ink_heart_staff', name: 'Ink-heart staff',
    niche: '50% chance to not consume rune (when casting combat spells)',
    skill: 'runecrafting', level: 78, xp: 720, tags: ['rune_saving'] },
  { pair: 'forgotten_syllable_pendant',reagent: 'forgotten_syllable', base: 'occult_necklace',
    produces: 'silenced_pendant', name: 'Silenced pendant',
    niche: 'BiS magic neck; +15% magic dmg; suppresses enemy spellcasting within 1 tile',
    skill: 'crafting', level: 85, xp: 1200, tags: ['spell_suppress'] },

  // ── Wilds — Chaos chain: PvP bonus, risk-keep ──
  { pair: 'revenant_charge_weapon',  reagent: 'revenant_ether', base: 'runeforge_scimitar',
    produces: 'revenant_blade', name: 'Revenant blade',
    niche: '+20% dmg in Wilds, -10% outside; kept on death in Wilds',
    skill: 'smithing', level: 70, xp: 400, tags: ['kept_on_death_wilds', 'pvp_bonus'] },
  { pair: 'chaos_touched_helm',      reagent: 'chaos_touched_core', base: 'dragonsteel_helm',
    produces: 'chaos_touched_helm', name: 'Chaos-touched helm',
    niche: '+prayer bonus in Wilds; -def elsewhere',
    skill: 'smithing', level: 78, xp: 640 },
  { pair: 'forsaken_relic_pendant',  reagent: 'forsaken_relic', base: 'amulet_of_glory',
    produces: 'forsaken_pendant', name: 'Forsaken pendant',
    niche: 'Auto-revive once per day in Wilds; loses charge on non-Wilds deaths',
    skill: 'crafting', level: 80, xp: 780, tags: ['daily_revive'] },

  // ── Godsword (cross-region) — 3 shards + hilt per god ──
  { pair: 'heartlands_godsword',     reagent: 'godsword_hilt_heartlands', base: 'godsword_shard_1 + godsword_shard_2 + godsword_shard_3',
    produces: 'heartlands_godsword', name: 'Heartlands godsword',
    niche: 'Special heals 50% of damage dealt as HP',
    skill: 'smithing', level: 85, xp: 1400, tags: ['godsword'] },
  { pair: 'moryskah_godsword',       reagent: 'godsword_hilt_moryskah', base: 'godsword_shard_1 + godsword_shard_2 + godsword_shard_3',
    produces: 'moryskah_godsword', name: 'Moryskah godsword',
    niche: 'Special raises all combat stats by 5',
    skill: 'smithing', level: 85, xp: 1400, tags: ['godsword'] },
  { pair: 'saltbrine_godsword',      reagent: 'godsword_hilt_saltbrine', base: 'godsword_shard_1 + godsword_shard_2 + godsword_shard_3',
    produces: 'saltbrine_godsword', name: 'Saltbrine godsword',
    niche: 'Special drains 10% of target prayer',
    skill: 'smithing', level: 85, xp: 1400, tags: ['godsword'] },
  { pair: 'veilwood_godsword',       reagent: 'godsword_hilt_veilwood', base: 'godsword_shard_1 + godsword_shard_2 + godsword_shard_3',
    produces: 'veilwood_godsword', name: 'Veilwood godsword',
    niche: 'Special reduces target defence by 30%',
    skill: 'smithing', level: 85, xp: 1400, tags: ['godsword'] },

  // ── Aeldra charge upkeep (tier degradation) ──
  { pair: 'aeldra_recharge',         reagent: 'aeldra_charge', base: 'aeldra_longsword',
    produces: 'aeldra_longsword_charged', name: 'Aeldra longsword (recharged)',
    niche: 'Resets 10-hour combat timer; no stat change',
    skill: 'crafting', level: 70, xp: 120, tags: ['recharge'] },
  { pair: 'aeldra_heartstone_ring_combine', reagent: 'aeldra_charge', base: 'champions_token_heartlands + champions_token_moryskah + champions_token_saltbrine',
    produces: 'aeldra_heartstone_ring', name: 'Aeldra heartstone ring',
    niche: 'BiS all-style ring; -1 prayer drain per minute (always)',
    skill: 'crafting', level: 90, xp: 2200, tags: ['universal_bis_ring', 'prayer_cost'] },

  // ── Wyrmforged tier: post-Aeldra, encounter-specific ──
  { pair: 'wyrmforged_reforge_melee', reagent: 'wyrmforge_flame', base: 'aeldra_two_hander',
    produces: 'wyrmforged_greatsword', name: 'Wyrmforged greatsword',
    niche: 'Charges on kills (up to 100); special deals 2x damage per charge',
    skill: 'smithing', level: 90, xp: 2800, tags: ['charges', 'special_attack'] },
  { pair: 'wyrmforged_bow',           reagent: 'wyrmforge_flame', base: 'aeldra_longbow',
    produces: 'wyrmforged_longbow', name: 'Wyrmforged longbow',
    niche: 'Fires 3 arrows per shot at full charge',
    skill: 'fletching', level: 90, xp: 2600, tags: ['charges'] },
  { pair: 'wyrmforged_staff',         reagent: 'wyrmforge_flame', base: 'aeldra_staff',
    produces: 'wyrmforged_staff', name: 'Wyrmforged staff',
    niche: 'Reduces rune cost by 50% at full charge',
    skill: 'magic',  level: 90, xp: 2400, tags: ['charges', 'rune_saving'] },

  // ── Cross-region mega combos: two regions' reagents + base ──
  { pair: 'brine_moonsilk_bow',      reagent: 'brine_crystal + moonglass_shard', base: 'runeforge_longbow',
    produces: 'brine_moonsilk_longbow', name: 'Brine-moonsilk longbow',
    niche: 'Saltbrine + Veilwood hybrid. +12% at sea at night (stacks)',
    skill: 'fletching', level: 82, xp: 980, tags: ['night_boost', 'bonus_vs_sea'] },
  { pair: 'crypt_sandwyrm_amulet',   reagent: 'crypt_ichor_vial + sandwyrm_scale', base: 'lichbane_pendant',
    produces: 'tomb_binder_pendant', name: 'Tomb-binder pendant',
    niche: 'Moryskah + Boneyard hybrid. +25% vs undead AND desert',
    skill: 'crafting', level: 80, xp: 880 },
  { pair: 'ink_wilds_cape',          reagent: 'bound_chapter + chaos_touched_core', base: 'runeforge_cape',
    produces: 'binding_chaos_cape', name: 'Binding-chaos cape',
    niche: 'Inkweald + Wilds. +prayer +magic in Wilds only. -2 def always.',
    skill: 'crafting', level: 82, xp: 1020 },
  { pair: 'forge_grove_hammer',      reagent: 'forge_wraith_essence + grove_heartwood', base: 'dragonsteel_warhammer',
    produces: 'forgeroot_warhammer', name: 'Forgeroot warhammer',
    niche: 'Sootworks + Veilwood. Heats on crit (chain fire dmg)',
    skill: 'smithing', level: 82, xp: 940, tags: ['fire_damage', 'chain_damage'] },

  // ── Godsword shard assembly (pre-hilt) ──
  { pair: 'godsword_blade_assembly', reagent: 'godsword_shard_1 + godsword_shard_2 + godsword_shard_3', base: '—',
    produces: 'godsword_blade', name: 'Godsword blade',
    niche: 'Intermediate: combines with a hilt to create a godsword',
    skill: 'smithing', level: 80, xp: 600, tags: ['intermediate'] },

  // ── Weapon poison ──
  { pair: 'poisoned_weapon',         reagent: 'kwuarm_extract + unicorn_horn_dust', base: 'dragonsteel_dagger',
    produces: 'poisoned_dragonsteel_dagger', name: 'Poisoned dragonsteel dagger',
    niche: 'Adds 8-dmg poison to weapon; expires after 50 uses',
    skill: 'herblore', level: 58, xp: 190, tags: ['poison', 'consumes_charges'] },

  // ── Imbue recipes ──
  { pair: 'imbued_archers_ring',     reagent: 'binding_rune_perfect', base: 'archers_ring',
    produces: 'imbued_archers_ring', name: 'Imbued archers ring',
    niche: 'Doubles ranged bonus to +8; untradeable',
    skill: 'magic', level: 75, xp: 650, tags: ['untradeable_reward'] },
  { pair: 'imbued_warriors_ring',    reagent: 'binding_rune_perfect', base: 'warriors_ring',
    produces: 'imbued_warriors_ring', name: 'Imbued warriors ring',
    niche: 'Doubles melee bonus to +8; untradeable',
    skill: 'magic', level: 75, xp: 650, tags: ['untradeable_reward'] },
  { pair: 'imbued_seers_ring',       reagent: 'binding_rune_perfect', base: 'seers_ring',
    produces: 'imbued_seers_ring', name: 'Imbued seers ring',
    niche: 'Doubles magic bonus to +12; untradeable',
    skill: 'magic', level: 75, xp: 650, tags: ['untradeable_reward'] },
  { pair: 'imbued_berserkers_ring',  reagent: 'binding_rune_perfect', base: 'berserkers_ring',
    produces: 'imbued_berserkers_ring', name: 'Imbued berserkers ring',
    niche: '+4 str bonus; untradeable',
    skill: 'magic', level: 75, xp: 650, tags: ['untradeable_reward'] },
  { pair: 'imbued_ring_of_suffering',reagent: 'binding_rune_perfect', base: 'ring_of_suffering',
    produces: 'imbued_ring_of_suffering', name: 'Imbued ring of suffering',
    niche: 'Ring recoils 10% damage back at attacker; untradeable',
    skill: 'magic', level: 75, xp: 650, tags: ['untradeable_reward', 'recoil'] },

  // ── Barrows-style armor set infusions ──
  { pair: 'barrows_dharoks_set',     reagent: 'binding_rune_perfect', base: 'dharoks_helm + dharoks_platebody + dharoks_platelegs + dharoks_greataxe',
    produces: 'dharoks_set_bonus', name: "Dharok's set bonus",
    niche: 'When all 4 equipped, damage scales inversely with HP (5% per 10% HP lost)',
    skill: 'crafting', level: 70, xp: 180, tags: ['set_bonus'] },
  { pair: 'barrows_ahrims_set',      reagent: 'binding_rune_perfect', base: 'ahrims_hood + ahrims_robetop + ahrims_robebottom + ahrims_staff',
    produces: 'ahrims_set_bonus', name: "Ahrim's set bonus",
    niche: 'When all 4 equipped, spells have 25% chance to hit for +50%',
    skill: 'crafting', level: 70, xp: 180, tags: ['set_bonus'] },
  { pair: 'barrows_karils_set',      reagent: 'binding_rune_perfect', base: 'karils_coif + karils_body + karils_skirt + karils_crossbow',
    produces: 'karils_set_bonus', name: "Karil's set bonus",
    niche: 'When all 4 equipped, arrows have 25% chance to drain target agility -1',
    skill: 'crafting', level: 70, xp: 180, tags: ['set_bonus'] },

  // ── Salvage reagent: recycles an old piece for charges ──
  { pair: 'gear_salvage_basic',      reagent: '—', base: 'runeforge_helm',
    produces: 'binding_rune_cracked x2', name: 'Gear salvage (basic)',
    niche: 'Recycle old tier-7 pieces into cracked binding runes',
    skill: 'smithing', level: 60, xp: 50, tags: ['salvage', 'consumes_base'] },

  // ── Extra reagent chains (to hit 60+ target) ──
  { pair: 'revenant_crown_helm',     reagent: 'revenant_crown_shard', base: 'dragonsteel_helm',
    produces: 'revenant_crown_helm', name: 'Revenant crown helm',
    niche: 'Wilds kept-on-death; +3 prayer in Wilds, +0 elsewhere',
    skill: 'smithing', level: 74, xp: 520, tags: ['kept_on_death_wilds', 'night_only'] },
  { pair: 'coralbone_trident',       reagent: 'coralbone_fragment', base: 'aeldra_spear',
    produces: 'coralbone_trident', name: 'Coralbone trident',
    niche: 'Auto-target sea mobs (+3 accuracy per tile of water around target)',
    skill: 'crafting', level: 78, xp: 680, tags: ['bonus_vs_sea'] },
  { pair: 'ashenheart_staff',        reagent: 'ashenheart_seed', base: 'runeforge_staff',
    produces: 'ashenheart_staff', name: 'Ashenheart staff',
    niche: 'Drains HP but heals prayer 1:1 — reverse of blood magic',
    skill: 'magic', level: 76, xp: 640, tags: ['hp_to_prayer', 'tradeoff'] },
  { pair: 'fate_thread_cloak',       reagent: 'loom_thread_of_fate', base: 'aeldra_cape',
    produces: 'fate_thread_cloak', name: 'Fate-thread cloak',
    niche: 'Rerolls one failed chance per combat (drop, crit, miss) — one-use per encounter',
    skill: 'crafting', level: 90, xp: 2400, tags: ['luck_effect', 'legendary'] },
  { pair: 'sunforged_blade',         reagent: 'sunforged_ingot', base: 'aeldra_longsword',
    produces: 'sunforged_greatsword', name: 'Sunforged greatsword',
    niche: 'Only swings during daylight; +40% damage when sun is visible',
    skill: 'smithing', level: 88, xp: 1800, tags: ['day_only', 'conditional_power'] },
  { pair: 'briar_crown_circlet',     reagent: 'briar_crown_petal', base: 'aeldra_helm',
    produces: 'briar_crown_circlet', name: 'Briar Crown circlet',
    niche: 'Veilwood-only +10% magic dmg; roots grow through helm — cannot equip other helm for 1 hour after removal',
    skill: 'crafting', level: 82, xp: 920, tags: ['binding', 'veilwood_only'] },
  { pair: 'salvage_high',            reagent: '—', base: 'dragonsteel_platebody',
    produces: 'binding_rune_perfect x1', name: 'Gear salvage (high)',
    niche: 'Salvage endgame gear into a perfect binding rune',
    skill: 'smithing', level: 80, xp: 120, tags: ['salvage', 'consumes_base'] },
  { pair: 'salvage_aeldra',          reagent: '—', base: 'aeldra_helm',
    produces: 'binding_rune_perfect x2 + aeldra_charge x1', name: 'Gear salvage (aeldra)',
    niche: 'Salvage an aeldra piece for reagent materials',
    skill: 'smithing', level: 85, xp: 200, tags: ['salvage', 'consumes_base'] },
];

PAIRS.forEach(p => defPair({
  pair_id: p.pair,
  reagent: p.reagent,
  base_item: p.base,
  produces: p.produces,
  produces_name: p.name,
  niche: p.niche,
  skill: p.skill,
  level: p.level,
  xp: p.xp,
  stats: p.stats || null,
  tags: p.tags || [],
  examine: `${p.name}: reagent "${p.reagent}" combined with "${p.base}". ${p.niche}.`,
}));

writeJson('reagents.json', { reagents, reagent_pairs: reagentPairs });

// ══════════════════════════════════════════════════════════════════════════════
// RECIPES — skill-based item creation (smithing, herblore, cooking, fletching,
// crafting, runecrafting, magic). Separate from reagent pairs above.
// ══════════════════════════════════════════════════════════════════════════════
const recipes = [];
const addRecipe = (r) => recipes.push(r);

// Smithing — bars from ores
ORE_TIERS.forEach(o => {
  const isCoal = o.key === 'coalseam';
  const inputs = isCoal ? [] : [{ item: `${o.key}_ore`, qty: 1 }];
  if (o.key === 'coalsteel') inputs.push({ item: 'coalseam_ore', qty: 2 });
  if (o.key === 'quicksilver') inputs.push({ item: 'coalseam_ore', qty: 4 });
  if (o.key === 'blacksteel') inputs.push({ item: 'coalseam_ore', qty: 6 });
  if (o.key === 'darkiron') inputs.push({ item: 'coalseam_ore', qty: 8 });
  if (o.key === 'runeforge') inputs.push({ item: 'coalseam_ore', qty: 8 });
  if (o.key === 'dragonsteel') inputs.push({ item: 'coalseam_ore', qty: 10 });
  if (o.key === 'aeldra')      inputs.push({ item: 'coalseam_ore', qty: 12 });
  addRecipe({
    id: `smelt_${o.key}_bar`, skill: 'smithing', station: 'furnace',
    level: o.lvl + 2, xp: Math.round(o.xp * 1.2),
    inputs: isCoal ? [{ item: 'coalseam_ore', qty: 1 }] : inputs,
    outputs: [{ item: `${o.key}_bar`, qty: 1 }],
    category: 'smelting',
    examine: `Smelts ${o.altName || o.key} bars from ore.`,
  });
});

// Smithing — weapons/armor from bars (one representative recipe per tier per slot)
TIERS.forEach(tier => {
  const slotsToForge = ['dagger', 'scimitar', 'longsword', 'mace', 'battleaxe', 'warhammer', 'two_hander', 'halberd', 'spear', 'platebody', 'platelegs', 'helm', 'kiteshield', 'boots', 'gauntlets'];
  const barsByTier = { dagger: 1, scimitar: 1, longsword: 2, mace: 1, battleaxe: 3, warhammer: 3, two_hander: 4, halberd: 3, spear: 2, platebody: 5, platelegs: 3, helm: 2, kiteshield: 3, boots: 1, gauntlets: 1 };
  for (const slot of slotsToForge) {
    const bars = barsByTier[slot] || 2;
    // Only craftable tiers (not brassforge which is drop-only)
    if (tier.key === 'brassforge') continue;
    addRecipe({
      id: `smith_${tier.key}_${slot}`, skill: 'smithing', station: 'anvil',
      level: tier.req + 3, xp: Math.round(tier.t * 50 + bars * 20),
      inputs: [
        { item: `${tier.key}_bar`, qty: bars },
        { item: 'hammer', qty: 0, note: 'tool-required' },
      ],
      outputs: [{ item: `${tier.key}_${slot}`, qty: 1 }],
      category: 'forging',
      examine: `Forges a ${tier.key} ${slot} from ${bars} ${tier.key} bar(s).`,
    });
  }
});

// Herblore — clean + potion recipes
HERBS.forEach(h => {
  addRecipe({
    id: `clean_${h.k}`, skill: 'herblore', station: 'inventory',
    level: h.lvl, xp: Math.round(h.lvl * 0.25 + 2),
    inputs: [{ item: `grimy_${h.k}`, qty: 1 }],
    outputs: [{ item: `clean_${h.k}`, qty: 1 }],
    category: 'cleaning',
    examine: `Clean a grimy ${h.k.replace('_', ' ')}.`,
  });
});
// Potion mixing (herb + vial-of-water, then herb + secondary)
POTION_SPECS.forEach(p => {
  addRecipe({
    id: `mix_${p.k}_unfinished`, skill: 'herblore', station: 'inventory',
    level: Math.max(1, p.val > 1000 ? 70 : p.val > 200 ? 45 : 30),
    xp: 30,
    inputs: [{ item: 'vial_of_water', qty: 1 }, { item: `clean_${p.herb.replace(/ /g, '_')}`, qty: 1 }],
    outputs: [{ item: `${p.k}_unfinished_potion`, qty: 1 }],
    category: 'potion_unfinished',
    examine: `Mix a ${p.n.toLowerCase()} (unfinished).`,
  });
  addRecipe({
    id: `mix_${p.k}_potion_4`, skill: 'herblore', station: 'inventory',
    level: Math.max(1, p.val > 1000 ? 75 : p.val > 200 ? 55 : 35),
    xp: Math.min(200, Math.round(p.val / 12)),
    inputs: [{ item: `${p.k}_unfinished_potion`, qty: 1 }, { item: p.secondary.split(' + ')[0].replace(/ /g, '_'), qty: 1 }],
    outputs: [{ item: `${p.k}_potion_4`, qty: 1 }],
    category: 'potion',
    examine: `Mix a 4-dose ${p.n.toLowerCase()}. ${p.bonus}.`,
  });
});

// Cooking — cooked fish from raw
FISH.forEach(f => addRecipe({
  id: `cook_${f.k}`, skill: 'cooking', station: 'range',
  level: f.lvl, xp: f.xpc,
  inputs: [{ item: `raw_${f.k}`, qty: 1 }],
  outputs: [{ item: `cooked_${f.k}`, qty: 1 }],
  burn_chance_at_level: f.lvl,
  category: 'cooking',
  examine: `Cook a raw ${f.k.replace('_',' ')}.`,
}));

// Cooking — regional food recipes
const REGIONAL_RECIPES = [
  // id -> { inputs, level, xp }
  { out: 'heartlands_field_loaf',     inputs: [{item:'flour',qty:2},{item:'water',qty:1}], lvl: 5, xp: 25 },
  { out: 'heartlands_farmers_stew',   inputs: [{item:'raw_beef',qty:1},{item:'potato',qty:1},{item:'onion',qty:1}], lvl: 20, xp: 80 },
  { out: 'sootworks_coal_bread',      inputs: [{item:'flour',qty:3},{item:'coal_dust',qty:1}], lvl: 12, xp: 35 },
  { out: 'sootworks_smoked_sausage',  inputs: [{item:'raw_pork',qty:1},{item:'salt',qty:1}], lvl: 25, xp: 70 },
  { out: 'moryskah_black_pudding',    inputs: [{item:'blood',qty:1},{item:'oats',qty:2}], lvl: 45, xp: 120 },
  { out: 'boneyard_cactus_water',     inputs: [{item:'cactus_spine',qty:1},{item:'vial',qty:1}], lvl: 10, xp: 30 },
  { out: 'saltbrine_kraken_chowder',  inputs: [{item:'kraken_tentacle_tip',qty:1},{item:'raw_cod',qty:2},{item:'cream',qty:1}], lvl: 80, xp: 320 },
  { out: 'veilwood_fey_tea',          inputs: [{item:'moonberry',qty:2},{item:'water',qty:1}], lvl: 30, xp: 60 },
  { out: 'inkweald_inksoaked_biscuits',inputs: [{item:'flour',qty:1},{item:'ink_heart',qty:1}], lvl: 55, xp: 160 },
  { out: 'wilds_bone_broth',          inputs: [{item:'bones',qty:3},{item:'water',qty:1}], lvl: 40, xp: 100 },
];
REGIONAL_RECIPES.forEach(r => addRecipe({
  id: `cook_${r.out}`, skill: 'cooking', station: 'range',
  level: r.lvl, xp: r.xp, inputs: r.inputs, outputs: [{ item: r.out, qty: 1 }],
  category: 'cooking_regional',
  examine: `Cook a regional dish: ${r.out.replace(/_/g, ' ')}.`,
}));

// Fletching — bows + arrows
TREES.filter(t => !['tinderwood','teak','mahogany','redwood'].includes(t.k)).forEach((t, i) => {
  addRecipe({ id: `fletch_${t.k}_shortbow_u`, skill: 'fletching', station: 'inventory',
    level: 5 + i * 5, xp: 10 + i * 8,
    inputs: [{ item: `${t.k}_logs`, qty: 1 }, { item: 'knife', qty: 0, note: 'tool-required' }],
    outputs: [{ item: `${t.k}_shortbow_unstrung`, qty: 1 }], category: 'fletching',
    examine: `Fletch an unstrung ${t.k} shortbow.` });
  addRecipe({ id: `string_${t.k}_shortbow`, skill: 'fletching', station: 'inventory',
    level: 5 + i * 5, xp: 15 + i * 10,
    inputs: [{ item: `${t.k}_shortbow_unstrung`, qty: 1 }, { item: 'bowstring', qty: 1 }],
    outputs: [{ item: `${t.k}_shortbow`, qty: 1 }], category: 'fletching',
    examine: `String a ${t.k} shortbow.` });
});
// Arrows
['tinroot','pigiron','coalsteel','quicksilver','blacksteel','runeforge','dragonsteel','aeldra'].forEach((tier, i) => {
  addRecipe({ id: `fletch_${tier}_arrows`, skill: 'fletching', station: 'inventory',
    level: 1 + i * 10, xp: 2 + i * 3,
    inputs: [{ item: 'arrow_shaft', qty: 15 }, { item: 'feather', qty: 15 }, { item: `${tier}_arrowtip`, qty: 15 }],
    outputs: [{ item: `${tier}_arrows`, qty: 15 }], category: 'fletching',
    examine: `Fletch 15 ${tier} arrows.` });
});

// Crafting — leather, jewellery, gem-cutting
HIDES.forEach(([id, n, lvl]) => addRecipe({
  id: `tan_${id}`, skill: 'crafting', station: 'tannery',
  level: lvl, xp: lvl * 2,
  inputs: [{ item: id, qty: 1 }, { item: 'coins', qty: lvl }],
  outputs: [{ item: `${id}_tanned`, qty: 1 }], category: 'tanning',
  examine: `Tan a ${n.toLowerCase()}.`,
}));
GEMS.forEach(g => addRecipe({
  id: `cut_${g.k}`, skill: 'crafting', station: 'inventory',
  level: g.lvl + 1, xp: g.val / 20,
  inputs: [{ item: `uncut_${g.k}`, qty: 1 }, { item: 'chisel', qty: 0, note: 'tool-required' }],
  outputs: [{ item: `cut_${g.k}`, qty: 1 }], category: 'gem_cutting',
  examine: `Cut an uncut ${g.k}.`,
}));

// Runecrafting — standard runes from essence
const RC_RUNES = [
  { k: 'air',   lvl: 1,  xp: 5,  ess: 1 },
  { k: 'mind',  lvl: 2,  xp: 5.5, ess: 1 },
  { k: 'water', lvl: 5,  xp: 6,  ess: 1 },
  { k: 'earth', lvl: 9,  xp: 6.5, ess: 1 },
  { k: 'fire',  lvl: 14, xp: 7,  ess: 1 },
  { k: 'body',  lvl: 20, xp: 7.5, ess: 1 },
  { k: 'cosmic',lvl: 27, xp: 8,  ess: 1, pure: true },
  { k: 'chaos', lvl: 35, xp: 8.5, ess: 1, pure: true },
  { k: 'astral',lvl: 40, xp: 8.7, ess: 1, pure: true },
  { k: 'nature',lvl: 44, xp: 9,  ess: 1, pure: true },
  { k: 'law',   lvl: 54, xp: 9.5, ess: 1, pure: true },
  { k: 'death', lvl: 65, xp: 10, ess: 1, pure: true },
  { k: 'blood', lvl: 77, xp: 10.5, ess: 1, pure: true, uses_dark: true },
  { k: 'soul',  lvl: 90, xp: 11.2, ess: 1, pure: true, uses_dark: true },
  { k: 'wrath', lvl: 95, xp: 13,  ess: 1, pure: true, uses_dark: true },
];
RC_RUNES.forEach(r => {
  const essItem = r.uses_dark ? 'dark_essence_fragment' : r.pure ? 'pure_essence' : 'rune_essence';
  addRecipe({
    id: `rc_${r.k}`, skill: 'runecrafting', station: `${r.k}_altar`,
    level: r.lvl, xp: r.xp,
    inputs: [{ item: essItem, qty: r.ess }],
    outputs: [{ item: `${r.k}_rune`, qty: 1 }],
    category: 'runecrafting',
    examine: `Craft a ${r.k} rune at the ${r.k} altar.`,
  });
});

// Farming — plant seeds
HERBS.forEach(h => addRecipe({
  id: `farm_plant_${h.k}`, skill: 'farming', station: 'herb_patch',
  level: Math.max(1, h.lvl - 1), xp: h.lvl * 3,
  inputs: [{ item: `${h.k}_seed`, qty: 1 }, { item: 'rake', qty: 0, note: 'tool-required' }],
  outputs: [{ item: `grimy_${h.k}`, qty: 4 }],
  category: 'farming_herb', growth_ticks: h.lvl * 80,
  examine: `Plant a ${h.k} seed. Grows into 4-6 grimy ${h.k}.`,
}));

writeJson('recipes.json', recipes);

// ══════════════════════════════════════════════════════════════════════════════
// SUMMARY
// ══════════════════════════════════════════════════════════════════════════════
const totalItems = equipment.length + consumables.length + resources.length + questItems.length + reagents.length;

// Overwrite INVENTORY.md counts section
try {
  const invPath = path.join(OUT, 'INVENTORY.md');
  let inv = fs.readFileSync(invPath, 'utf8');
  const replacement = [
    '## Counts (final)',
    '',
    `- **equipment.json**: ${equipment.length} items (tier weapons + armor + tools + uniques + jewellery + skilling outfits)`,
    `- **consumables.json**: ${consumables.length} items (${REGIONAL_FOOD.length} regional foods + ${POTION_SPECS.length * 4} potion doses + ${LIGHT.length} light sources + ${TELEPORTS.length + TELE_JEW.length} teleports + ${CURES.length} cures)`,
    `- **resources.json**: ${resources.length} items (ores/bars/gems/logs/fish/herbs/seeds/runes/hides/meats)`,
    `- **quest-items.json**: ${questItems.length} items (keys/documents/plot tokens/passage tickets)`,
    `- **reagents.json**: ${reagents.length} reagents + ${reagentPairs.length} combine recipes (Marstead pillar 3: no content deprecation)`,
    `- **recipes.json**: ${recipes.length} skill recipes (smithing/herblore/cooking/fletching/crafting/runecrafting/farming)`,
    '',
    `**Total unique items in canonical JSON DB: ${totalItems}**`,
    '',
  ].join('\n');
  inv = inv.replace(/## Counts \(final\)[\s\S]*$/, replacement);
  fs.writeFileSync(invPath, inv);
} catch (e) { console.warn('INVENTORY.md count update skipped:', e.message); }

console.log('\n--- SUMMARY ---');
console.log(`equipment.json : ${equipment.length} items`);
console.log(`consumables.json: ${consumables.length} items`);
console.log(`resources.json : ${resources.length} items`);
console.log(`quest-items.json: ${questItems.length} items`);
console.log(`reagents.json  : ${reagents.length} reagents + ${reagentPairs.length} pairs`);
console.log(`recipes.json   : ${recipes.length} recipes`);
console.log(`TOTAL items   : ${totalItems}`);

function cap(s) { return s.replace(/_/g, ' ').replace(/(^|\s)\w/g, c => c.toUpperCase()); }
