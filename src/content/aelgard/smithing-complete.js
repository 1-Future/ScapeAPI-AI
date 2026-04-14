// ══════════════════════════════════════════════════════════════════════════════
// Complete Smithing Table — Anvil Recipes (Bar → Product)
//
// 6 metal tiers × 21 products = 126 anvil smithing recipes.
// Smelting (ore → bar) lives in processing.js. This is anvil work only.
//
// Items that already exist in items.js are NOT redefined — only their
// smithing recipe is registered. New items start at ID 70000.
// ══════════════════════════════════════════════════════════════════════════════

const processing = require('../../skills/processing');
const items = require('../../data/items');

let count = 0;
let nextItemId = 70000;

// ── Tier definitions ────────────────────────────────────────────────────────

const TIERS = [
  { name: 'Bronze', prefix: 'Bronze',    barId: 2111, baseLevel: 1,  xpPerBar: 12.5, atkReq: 1,  defReq: 1,  valueMulti: 1,    article: 'a' },
  { name: 'Iron',   prefix: 'Iron',      barId: 2112, baseLevel: 15, xpPerBar: 25,   atkReq: 1,  defReq: 1,  valueMulti: 2.5,  article: 'an' },
  { name: 'Steel',  prefix: 'Steel',     barId: 2113, baseLevel: 30, xpPerBar: 37.5, atkReq: 5,  defReq: 5,  valueMulti: 6,    article: 'a' },
  { name: 'Mithril', prefix: 'Mithril',  barId: 2114, baseLevel: 50, xpPerBar: 50,   atkReq: 20, defReq: 20, valueMulti: 16,   article: 'a' },
  { name: 'Adamant', prefix: 'Adamant',  barId: 2115, baseLevel: 70, xpPerBar: 62.5, atkReq: 30, defReq: 30, valueMulti: 40,   article: 'an' },
  { name: 'Rune',   prefix: 'Rune',      barId: 2116, baseLevel: 85, xpPerBar: 75,   atkReq: 40, defReq: 40, valueMulti: 100,  article: 'a' },
];

// ── Product templates ───────────────────────────────────────────────────────
// levelOffset is added to the tier's baseLevel for this product.
// bars = number of bars consumed.

const PRODUCTS = [
  // Weapons
  { suffix: 'dagger',       bars: 1, levelOffset: 0,  category: 'melee', equipSlot: 'weapon', speed: 4, weight: 0.4,
    baseStats: { stab: 4, slash: 2, melee_strength: 3 }, baseValue: 10 },
  { suffix: 'sword',        bars: 1, levelOffset: 1,  category: 'melee', equipSlot: 'weapon', speed: 4, weight: 0.9,
    baseStats: { stab: 4, slash: 5, melee_strength: 5 }, baseValue: 20 },
  { suffix: 'scimitar',     bars: 2, levelOffset: 4,  category: 'melee', equipSlot: 'weapon', speed: 4, weight: 0.9,
    baseStats: { slash: 7, melee_strength: 6 }, baseValue: 32 },
  { suffix: 'longsword',    bars: 2, levelOffset: 5,  category: 'melee', equipSlot: 'weapon', speed: 5, weight: 1.4,
    baseStats: { stab: 4, slash: 7, melee_strength: 7 }, baseValue: 40 },
  { suffix: '2h sword',     bars: 3, levelOffset: 8,  category: 'melee', equipSlot: '2h',     speed: 7, weight: 3.6,
    baseStats: { stab: 3, slash: 9, crush: 3, melee_strength: 10 }, baseValue: 60 },
  { suffix: 'mace',         bars: 1, levelOffset: 2,  category: 'melee', equipSlot: 'weapon', speed: 4, weight: 1.2,
    baseStats: { crush: 5, melee_strength: 5, prayer: 1 }, baseValue: 18 },
  { suffix: 'warhammer',    bars: 3, levelOffset: 7,  category: 'melee', equipSlot: 'weapon', speed: 6, weight: 2.7,
    baseStats: { crush: 10, melee_strength: 10 }, baseValue: 58 },
  { suffix: 'battleaxe',    bars: 3, levelOffset: 6,  category: 'melee', equipSlot: 'weapon', speed: 6, weight: 2.7,
    baseStats: { stab: -2, slash: 9, crush: 1, melee_strength: 10 }, baseValue: 52 },

  // Armour
  { suffix: 'chainbody',    bars: 3, levelOffset: 6,  category: 'armour', equipSlot: 'body', weight: 5.4,
    baseStats: { def_stab: 10, def_slash: 7, def_crush: 12, def_magic: -15, def_ranged: 12 }, baseValue: 60, defReqOnly: true },
  { suffix: 'platebody',    bars: 5, levelOffset: 13, category: 'armour', equipSlot: 'body', weight: 9,
    baseStats: { def_stab: 15, def_slash: 14, def_crush: 9, def_magic: -30, def_ranged: 15 }, baseValue: 160, defReqOnly: true },
  { suffix: 'platelegs',    bars: 3, levelOffset: 11, category: 'armour', equipSlot: 'legs', weight: 8,
    baseStats: { def_stab: 7, def_slash: 7, def_crush: 6, def_magic: -21, def_ranged: 7 }, baseValue: 80, defReqOnly: true },
  { suffix: 'plateskirt',   bars: 3, levelOffset: 11, category: 'armour', equipSlot: 'legs', weight: 6.8,
    baseStats: { def_stab: 7, def_slash: 7, def_crush: 6, def_magic: -21, def_ranged: 7 }, baseValue: 80, defReqOnly: true },
  { suffix: 'full helm',    bars: 2, levelOffset: 9,  category: 'armour', equipSlot: 'head', weight: 2.7,
    baseStats: { def_stab: 3, def_slash: 4, def_crush: 2, def_magic: -6, def_ranged: 4 }, baseValue: 44, defReqOnly: true },
  { suffix: 'med helm',     bars: 1, levelOffset: 3,  category: 'armour', equipSlot: 'head', weight: 1.8,
    baseStats: { def_stab: 2, def_slash: 3, def_crush: 1, def_magic: -3, def_ranged: 3 }, baseValue: 24, defReqOnly: true },
  { suffix: 'kiteshield',   bars: 3, levelOffset: 10, category: 'armour', equipSlot: 'shield', weight: 3.6,
    baseStats: { def_stab: 6, def_slash: 8, def_crush: 7, def_magic: -8, def_ranged: 7 }, baseValue: 54, defReqOnly: true },
  { suffix: 'sq shield',    bars: 2, levelOffset: 3,  category: 'armour', equipSlot: 'shield', weight: 2.2,
    baseStats: { def_stab: 3, def_slash: 5, def_crush: 4, def_magic: -6, def_ranged: 5 }, baseValue: 32, defReqOnly: true },

  // Stackable products (ammo / construction)
  { suffix: 'nails',        bars: 1, levelOffset: 0,  category: 'construction', stackable: true, outputCount: 15, weight: 0,
    baseValue: 5 },
  { suffix: 'arrowtips',    bars: 1, levelOffset: 0,  category: 'fletching', stackable: true, outputCount: 15, weight: 0,
    baseValue: 2 },
  { suffix: 'dart tips',    bars: 1, levelOffset: 0,  category: 'fletching', stackable: true, outputCount: 10, weight: 0,
    baseValue: 3 },
  { suffix: 'bolts (unf)',  bars: 1, levelOffset: 3,  category: 'fletching', stackable: true, outputCount: 10, weight: 0,
    baseValue: 3 },
  { suffix: 'knives',       bars: 1, levelOffset: 2,  category: 'ranged', stackable: true, outputCount: 5, weight: 0,
    equipSlot: 'weapon', speed: 3,
    baseStats: { ranged: 3, ranged_strength: 2 }, baseValue: 4 },
];

// ── Stat scaling per tier ───────────────────────────────────────────────────
// Each tier multiplies base stats by this factor (roughly matching OSRS progression).

const STAT_SCALE = {
  'Bronze': 1.0,
  'Iron': 1.35,
  'Steel': 1.85,
  'Mithril': 2.5,
  'Adamant': 3.4,
  'Rune': 4.8,
};

// ── Existing item map ───────────────────────────────────────────────────────
// Items already defined in items.js — use their existing IDs, don't redefine.

const EXISTING = {
  'Bronze dagger': 400,
  'Bronze sword': 401,
  'Bronze scimitar': 402,
  'Bronze sq shield': 501,
  'Bronze platebody': 510,
  'Bronze platelegs': 520,
  'Bronze full helm': 530,
  'Bronze arrowtips': 593,   // defined as 'Bronze arrowheads' — same item
  'Iron dagger': 410,
  'Iron sword': 411,
  'Iron scimitar': 412,
  'Iron sq shield': 502,
  'Iron platebody': 511,
  'Iron platelegs': 521,
  'Iron arrowtips': 594,     // defined as 'Iron arrowheads'
  'Steel scimitar': 420,
  'Steel sword': 421,
  'Steel platebody': 512,
  'Steel nails': 705,
  'Mithril scimitar': 430,
  'Mithril platebody': 513,
  'Adamant scimitar': 440,
  'Adamant platebody': 514,
  'Rune scimitar': 450,
  'Rune platebody': 515,
  'Rune platelegs': 525,
  'Rune full helm': 535,
};

// Display names that differ from the generated name
const EXISTING_NAMES = {
  593: 'Bronze arrowheads',
  594: 'Iron arrowheads',
  705: 'Steel nails',
};

// ── Helper: scale stats ─────────────────────────────────────────────────────

function scaleStats(base, factor) {
  const result = {};
  for (const [key, val] of Object.entries(base)) {
    result[key] = Math.round(val * factor);
  }
  return result;
}

// ── Generate all recipes ────────────────────────────────────────────────────

for (const tier of TIERS) {
  const scale = STAT_SCALE[tier.name];

  for (const prod of PRODUCTS) {
    const fullName = tier.prefix + ' ' + prod.suffix;
    const level = Math.min(99, tier.baseLevel + prod.levelOffset);
    const xp = prod.bars * tier.xpPerBar;
    const recipeId = 'smith_' + tier.name.toLowerCase() + '_' + prod.suffix.replace(/[\s()]/g, '_');

    // Determine output item ID — use existing if available, else define new
    let outputId;
    let outputName;

    if (EXISTING[fullName]) {
      outputId = EXISTING[fullName];
      outputName = EXISTING_NAMES[outputId] || fullName;
    } else {
      outputId = nextItemId++;
      outputName = fullName;

      // Define the new item
      const article = tier.article;
      const examine = (article === 'an' ? 'An ' : 'A ') + tier.name.toLowerCase() + ' ' + prod.suffix + '.';
      const value = Math.round(prod.baseValue * tier.valueMulti);

      const itemDef = {
        id: outputId,
        name: outputName,
        examine: examine,
        value: value,
        category: prod.category,
        weight: prod.weight || 0,
      };

      if (prod.stackable) {
        itemDef.stackable = true;
      }

      if (prod.equipSlot) {
        itemDef.equipSlot = prod.equipSlot;
        if (prod.defReqOnly) {
          if (tier.defReq > 1) itemDef.equipReqs = { defence: tier.defReq };
        } else if (prod.suffix === 'knives') {
          if (tier.atkReq > 1) itemDef.equipReqs = { ranged: tier.atkReq };
        } else {
          if (tier.atkReq > 1) itemDef.equipReqs = { attack: tier.atkReq };
        }
        if (prod.baseStats) {
          itemDef.stats = scaleStats(prod.baseStats, scale);
        }
        if (prod.speed) {
          itemDef.speed = prod.speed;
        }
      }

      items.define(itemDef);
    }

    // Define the smithing recipe
    processing.defineRecipe({
      id: recipeId,
      name: 'Smith ' + outputName,
      skill: 'smithing',
      level: level,
      xp: xp,
      inputId: tier.barId,
      inputName: tier.prefix + ' bar',
      inputCount: prod.bars,
      outputId: outputId,
      outputName: outputName,
      low: 256,
      high: 256,
      stopBurnLevel: 1,
      ticks: 4,
      stationRequired: 'anvil',
    });
    count++;
  }
}

console.log('[aelgard] Complete smithing table: ' + count + ' recipes');

module.exports = { recipeCount: count };
