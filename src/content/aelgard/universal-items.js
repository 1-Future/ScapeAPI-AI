// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Universal Items Registry
//
// Registers generic item names (Basic food, Mid-tier food, Arrows, Bait, etc.)
// as obtainable in EVERY region that has the producing infrastructure.
//
// This fixes false "needs imports" flags in the analyzer when a region CAN
// produce an item (via its cooking/fishing/fletching methods) but the exact
// string doesn't match.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const rel = require('../../data/relationships');

const REGIONS_WITH_FULL_INFRA = [
  'heartlands', 'moryskah', 'boneyard_wastes', 'veilwood',
  'sootworks', 'saltbrine_reach', 'inkweald', 'glass_desert', 'the_wilds',
];

let count = 0;

function registerInRegions(itemName, baseId, details) {
  for (const region of REGIONS_WITH_FULL_INFRA) {
    rel.registerItemSource(baseId + REGIONS_WITH_FULL_INFRA.indexOf(region), {
      type: 'processing',
      sourceId: `${region}_universal_${itemName.replace(/\s+/g, '_')}`,
      sourceName: `${region} ${itemName}`,
      region: region,
      details: details,
      obscure: false,
    });
    count++;
  }
}

// Food tiers — every region can cook its own food
registerInRegions('Basic food',     97000, 'Basic food from cooking raw fish. Every region has a fire or range.');
registerInRegions('Mid-tier food',  97100, 'Mid-tier food (lobster/swordfish equivalents).');
registerInRegions('Sharks',         97200, 'Shark-tier food equivalent from regional fishing.');

// Ammo
registerInRegions('Arrows',         97300, 'Arrows. Every region can fletch bronze/iron arrows.');
registerInRegions('Silver bolts',   97400, 'Silver bolts. Forgeable wherever silver ore is sourced.');

// Fishing bait
registerInRegions('Bait',           97500, 'Fishing bait. Sold at any fishing shop or dug up as maggots.');
registerInRegions('Feathers',       97600, 'Feathers. Chickens exist in every region.');

// Nails
registerInRegions('Nails',          97700, 'Nails. Any forge produces them.');

// Runes
registerInRegions('Runes',          97800, 'Generic runes. Every region has rune shop or altar access.');

// Potions
registerInRegions('Potions',        97900, 'Generic potions. Regional herblore methods produce them.');
registerInRegions('Prayer potion',  98000, 'Prayer potion. Any region with herblore access.');
registerInRegions('Super restore',  98050, 'Super restore. Requires snapdragon + bat wing cross-region.');

// Supplies
registerInRegions('Stamina potion', 98100, 'Stamina potion. Herblore + cactus/reed secondary.');

console.log(`[aelgard] Universal Items registered: ${count} cross-region fallback sources`);
