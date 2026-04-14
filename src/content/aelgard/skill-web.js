// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Skill Web: Crafting & Processing Chains
//
// "Mining Amethyst can lead you to gain XP in six other skills."
// "Every consumable has potential XP value."
// "Skills form a complex interdependent web."
//
// This file defines the COMPLETE processing chains that connect all 23 skills.
// Each recipe is a real processing step. Each item source and use is registered
// so the relationship engine can answer "where does this come from?" and
// "what is this used for?" for every item in the game.
//
// Webs defined here:
//   1. Metalworking  (Mining -> Smithing -> Crafting -> Magic)
//   2. Woodwork      (Woodcutting -> Fletching -> Ranged + Crafting)
//   3. Food          (Fishing -> Cooking -> Combat sustain)
//   4. Herblore      (Farming -> Herblore -> Combat potions -> PvM)
//   5. Prayer        (Combat -> Bones -> Prayer)
//   6. Runecrafting  (Mining essence -> Runecrafting -> Magic)
//
// Existing recipes in recipes.js are NOT duplicated. This file adds
// the recipes that complete each web and registers all cross-references.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const recipes = require('../../data/recipes');
const rel = require('../../data/relationships');
const items = require('../../data/items');

let recipeCount = 0;
let relCount = 0;

function r(def) {
  // Fill optional fields so every recipe is well-formed
  if (def.station === undefined) def.station = null;
  if (def.tool === undefined) def.tool = null;
  if (def.failItem === undefined) def.failItem = null;
  if (def.stopBurn === undefined) def.stopBurn = null;
  recipes.define(def);
  recipeCount++;
}

function src(itemId, source) { rel.registerItemSource(itemId, source); relCount++; }
function use(itemId, u) { rel.registerItemUse(itemId, u); relCount++; }


// ── New items needed for the skill web ──────────────────────────────────────
// Items in 70100-70299 range (smithing-complete uses 70000+, so we go higher)

// Jewelry moulds & materials
items.define({ id: 70100, name: 'Ring mould', examine: 'A mould for making rings.', value: 5, category: 'tool', weight: 0.1 });
items.define({ id: 70101, name: 'Necklace mould', examine: 'A mould for making necklaces.', value: 5, category: 'tool', weight: 0.1 });
items.define({ id: 70102, name: 'Amulet mould', examine: 'A mould for making amulets.', value: 5, category: 'tool', weight: 0.1 });
items.define({ id: 70103, name: 'Bracelet mould', examine: 'A mould for making bracelets.', value: 5, category: 'tool', weight: 0.1 });
items.define({ id: 70104, name: 'Holy mould', examine: 'A mould for making holy symbols.', value: 5, category: 'tool', weight: 0.1 });
items.define({ id: 70105, name: 'Tiara mould', examine: 'A mould for making tiaras.', value: 5, category: 'tool', weight: 0.1 });

// Silver ore & bar (canonical IDs — training-methods.js uses 60001/60011)
// We reference the existing 60001/60011 IDs from training-methods.js

// Unstrung jewelry (gold)
items.define({ id: 70110, name: 'Gold amulet (u)', examine: 'An unstrung gold amulet.', value: 200, category: 'crafting', weight: 0.1 });
items.define({ id: 70111, name: 'Gold bracelet', examine: 'A gold bracelet.', value: 250, category: 'jewellery', equipSlot: 'hands', stats: {}, weight: 0.1 });

// Sapphire jewelry
items.define({ id: 70112, name: 'Sapphire amulet (u)', examine: 'An unstrung sapphire amulet.', value: 400, category: 'crafting', weight: 0.1 });
items.define({ id: 70113, name: 'Sapphire bracelet', examine: 'A sapphire bracelet.', value: 450, category: 'jewellery', equipSlot: 'hands', stats: {}, weight: 0.1 });

// Emerald jewelry
items.define({ id: 70114, name: 'Emerald ring', examine: 'An emerald ring.', value: 700, category: 'jewellery', equipSlot: 'ring', stats: {}, weight: 0.1 });
items.define({ id: 70115, name: 'Emerald necklace', examine: 'An emerald necklace.', value: 650, category: 'jewellery', equipSlot: 'neck', stats: {}, weight: 0.1 });
items.define({ id: 70116, name: 'Emerald amulet (u)', examine: 'An unstrung emerald amulet.', value: 600, category: 'crafting', weight: 0.1 });
items.define({ id: 70117, name: 'Emerald bracelet', examine: 'An emerald bracelet.', value: 750, category: 'jewellery', equipSlot: 'hands', stats: {}, weight: 0.1 });

// Ruby jewelry
items.define({ id: 70118, name: 'Ruby ring', examine: 'A ruby ring.', value: 1200, category: 'jewellery', equipSlot: 'ring', stats: {}, weight: 0.1 });
items.define({ id: 70119, name: 'Ruby necklace', examine: 'A ruby necklace.', value: 1100, category: 'jewellery', equipSlot: 'neck', stats: {}, weight: 0.1 });
items.define({ id: 70120, name: 'Ruby amulet (u)', examine: 'An unstrung ruby amulet.', value: 1000, category: 'crafting', weight: 0.1 });
items.define({ id: 70121, name: 'Ruby bracelet', examine: 'A ruby bracelet.', value: 1300, category: 'jewellery', equipSlot: 'hands', stats: {}, weight: 0.1 });

// Diamond jewelry
items.define({ id: 70122, name: 'Diamond ring', examine: 'A diamond ring.', value: 2500, category: 'jewellery', equipSlot: 'ring', stats: {}, weight: 0.1 });
items.define({ id: 70123, name: 'Diamond necklace', examine: 'A diamond necklace.', value: 2200, category: 'jewellery', equipSlot: 'neck', stats: {}, weight: 0.1 });
items.define({ id: 70124, name: 'Diamond amulet (u)', examine: 'An unstrung diamond amulet.', value: 2000, category: 'crafting', weight: 0.1 });
items.define({ id: 70125, name: 'Diamond bracelet', examine: 'A diamond bracelet.', value: 2700, category: 'jewellery', equipSlot: 'hands', stats: {}, weight: 0.1 });

// Enchanted jewelry (results of enchant spells)
items.define({ id: 70130, name: 'Ring of recoil', examine: 'Deals damage back to attackers.', value: 600, category: 'jewellery', equipSlot: 'ring', stats: {}, weight: 0.1 });
items.define({ id: 70131, name: 'Games necklace(8)', examine: 'Teleport to minigame locations.', value: 1500, category: 'jewellery', equipSlot: 'neck', stats: {}, weight: 0.1 });
items.define({ id: 70132, name: 'Ring of dueling(8)', examine: 'Teleport to duelling locations.', value: 900, category: 'jewellery', equipSlot: 'ring', stats: {}, weight: 0.1 });
items.define({ id: 70133, name: 'Binding necklace', examine: 'Guarantees combination runes.', value: 1800, category: 'jewellery', equipSlot: 'neck', stats: {}, weight: 0.1 });
items.define({ id: 70134, name: 'Ring of forging', examine: 'Iron ore never fails when smelting.', value: 2000, category: 'jewellery', equipSlot: 'ring', stats: {}, weight: 0.1 });
items.define({ id: 70135, name: 'Ring of life', examine: 'Teleports you away at low HP.', value: 3500, category: 'jewellery', equipSlot: 'ring', stats: {}, weight: 0.1 });
items.define({ id: 70136, name: 'Skills necklace(4)', examine: 'Teleport to skill-related locations.', value: 5000, category: 'jewellery', equipSlot: 'neck', stats: {}, weight: 0.1 });

// Silver items
items.define({ id: 70140, name: 'Silver tiara', examine: 'A silver tiara. Can be imbued with rune altar power.', value: 80, category: 'crafting', equipSlot: 'head', stats: {}, weight: 0.5 });
items.define({ id: 70141, name: 'Holy symbol (u)', examine: 'An unstrung holy symbol.', value: 100, category: 'crafting', weight: 0.1 });
items.define({ id: 70142, name: 'Holy symbol', examine: 'A blessed holy symbol.', value: 300, category: 'jewellery', equipSlot: 'neck', stats: { prayer: 8 }, weight: 0.1 });

// Fletching: higher-tier bows
items.define({ id: 70150, name: 'Willow shortbow (u)', examine: 'An unstrung willow shortbow.', value: 70, category: 'fletching', weight: 0.9 });
items.define({ id: 70151, name: 'Maple shortbow (u)', examine: 'An unstrung maple shortbow.', value: 200, category: 'fletching', weight: 0.9 });
items.define({ id: 70152, name: 'Yew shortbow (u)', examine: 'An unstrung yew shortbow.', value: 500, category: 'fletching', weight: 0.9 });
items.define({ id: 70153, name: 'Magic shortbow (u)', examine: 'An unstrung magic shortbow.', value: 1200, category: 'fletching', weight: 0.9 });
items.define({ id: 70154, name: 'Willow longbow (u)', examine: 'An unstrung willow longbow.', value: 80, category: 'fletching', weight: 1.4 });
items.define({ id: 70155, name: 'Maple longbow (u)', examine: 'An unstrung maple longbow.', value: 240, category: 'fletching', weight: 1.4 });
items.define({ id: 70156, name: 'Yew longbow (u)', examine: 'An unstrung yew longbow.', value: 640, category: 'fletching', weight: 1.4 });
items.define({ id: 70157, name: 'Magic longbow (u)', examine: 'An unstrung magic longbow.', value: 1500, category: 'fletching', weight: 1.4 });

// Finished bows (higher tiers not in items.js)
items.define({ id: 70160, name: 'Willow shortbow', examine: 'A willow shortbow.', value: 160, category: 'ranged', equipSlot: 'weapon', speed: 4, equipReqs: { ranged: 20 }, stats: { ranged: 20, ranged_strength: 10 }, weight: 0.9 });
items.define({ id: 70161, name: 'Maple shortbow', examine: 'A maple shortbow.', value: 400, category: 'ranged', equipSlot: 'weapon', speed: 4, equipReqs: { ranged: 30 }, stats: { ranged: 29, ranged_strength: 14 }, weight: 0.9 });
items.define({ id: 70162, name: 'Yew shortbow', examine: 'A yew shortbow.', value: 800, category: 'ranged', equipSlot: 'weapon', speed: 4, equipReqs: { ranged: 40 }, stats: { ranged: 47, ranged_strength: 21 }, weight: 0.9 });
items.define({ id: 70163, name: 'Magic shortbow', examine: 'A magic shortbow.', value: 1600, category: 'ranged', equipSlot: 'weapon', speed: 3, equipReqs: { ranged: 50 }, stats: { ranged: 69, ranged_strength: 25 }, weight: 0.9 });
items.define({ id: 70164, name: 'Willow longbow', examine: 'A willow longbow.', value: 192, category: 'ranged', equipSlot: 'weapon', speed: 6, equipReqs: { ranged: 20 }, stats: { ranged: 20, ranged_strength: 14 }, weight: 1.4 });
items.define({ id: 70165, name: 'Maple longbow', examine: 'A maple longbow.', value: 480, category: 'ranged', equipSlot: 'weapon', speed: 6, equipReqs: { ranged: 30 }, stats: { ranged: 29, ranged_strength: 18 }, weight: 1.4 });
items.define({ id: 70166, name: 'Yew longbow', examine: 'A yew longbow.', value: 960, category: 'ranged', equipSlot: 'weapon', speed: 6, equipReqs: { ranged: 40 }, stats: { ranged: 47, ranged_strength: 28 }, weight: 1.4 });
items.define({ id: 70167, name: 'Magic longbow', examine: 'A magic longbow.', value: 2400, category: 'ranged', equipSlot: 'weapon', speed: 6, equipReqs: { ranged: 50 }, stats: { ranged: 69, ranged_strength: 35 }, weight: 1.4 });

// Arrowheads (higher tiers)
items.define({ id: 70170, name: 'Steel arrowheads', examine: 'Steel arrowheads.', stackable: true, value: 12, category: 'fletching', weight: 0 });
items.define({ id: 70171, name: 'Mithril arrowheads', examine: 'Mithril arrowheads.', stackable: true, value: 24, category: 'fletching', weight: 0 });
items.define({ id: 70172, name: 'Adamant arrowheads', examine: 'Adamant arrowheads.', stackable: true, value: 64, category: 'fletching', weight: 0 });
items.define({ id: 70173, name: 'Rune arrowheads', examine: 'Rune arrowheads.', stackable: true, value: 160, category: 'fletching', weight: 0 });

// Finished arrows (higher tiers)
items.define({ id: 70174, name: 'Steel arrows', examine: 'Steel arrows.', stackable: true, value: 24, category: 'ammo', equipSlot: 'ammo', weight: 0, stats: { ranged_strength: 16 } });
items.define({ id: 70175, name: 'Mithril arrows', examine: 'Mithril arrows.', stackable: true, value: 48, category: 'ammo', equipSlot: 'ammo', weight: 0, stats: { ranged_strength: 22 } });
items.define({ id: 70176, name: 'Adamant arrows', examine: 'Adamant arrows.', stackable: true, value: 96, category: 'ammo', equipSlot: 'ammo', weight: 0, stats: { ranged_strength: 31 } });
items.define({ id: 70177, name: 'Rune arrows', examine: 'Rune arrows.', stackable: true, value: 240, category: 'ammo', equipSlot: 'ammo', weight: 0, stats: { ranged_strength: 49 } });

// Herblore additions
items.define({ id: 70180, name: 'Clean irit', examine: 'A clean irit leaf.', value: 40, category: 'herblore', weight: 0.01 });
items.define({ id: 70181, name: 'Clean avantoe', examine: 'A clean avantoe.', value: 60, category: 'herblore', weight: 0.01 });
items.define({ id: 70182, name: 'Clean kwuarm', examine: 'A clean kwuarm.', value: 80, category: 'herblore', weight: 0.01 });
items.define({ id: 70183, name: 'Clean snapdragon', examine: 'A clean snapdragon.', value: 200, category: 'herblore', weight: 0.01 });
items.define({ id: 70184, name: 'Clean cadantine', examine: 'A clean cadantine.', value: 100, category: 'herblore', weight: 0.01 });
items.define({ id: 70185, name: 'Clean lantadyme', examine: 'A clean lantadyme.', value: 120, category: 'herblore', weight: 0.01 });
items.define({ id: 70186, name: 'Clean dwarf weed', examine: 'A clean dwarf weed.', value: 150, category: 'herblore', weight: 0.01 });
items.define({ id: 70187, name: 'Clean torstol', examine: 'A clean torstol.', value: 500, category: 'herblore', weight: 0.01 });

// Potions not already defined
items.define({ id: 70190, name: 'Super defence(4)', examine: 'Greatly boosts defence.', value: 300, category: 'potion', weight: 0.3 });
items.define({ id: 70191, name: 'Ranging potion(4)', examine: 'Boosts ranged.', value: 250, category: 'potion', weight: 0.3 });
items.define({ id: 70192, name: 'Magic potion(4)', examine: 'Boosts magic.', value: 250, category: 'potion', weight: 0.3 });
items.define({ id: 70193, name: 'Antifire(4)', examine: 'Provides partial dragonfire protection.', value: 200, category: 'potion', weight: 0.3 });
items.define({ id: 70194, name: 'Super restore(4)', examine: 'Restores all stats and prayer.', value: 500, category: 'potion', weight: 0.3 });
items.define({ id: 70195, name: 'Saradomin brew(4)', examine: 'Heals significantly but reduces stats.', value: 400, category: 'potion', weight: 0.3 });

// Herblore secondaries not already defined
items.define({ id: 70196, name: 'White berries', examine: 'White berries.', value: 40, category: 'herblore', weight: 0.01 });
items.define({ id: 70197, name: 'Wine of zamorak', examine: 'Wine dedicated to Zamorak.', value: 150, category: 'herblore', weight: 0.3 });
items.define({ id: 70198, name: 'Crushed nest', examine: 'Crushed bird nest.', value: 200, category: 'herblore', weight: 0.01 });
items.define({ id: 70199, name: 'Potato cactus', examine: 'A cactus fruit.', value: 60, category: 'herblore', weight: 0.2 });
items.define({ id: 70200, name: 'Dragon scale dust', examine: 'Ground dragon scale.', value: 100, category: 'herblore', weight: 0.01 });
items.define({ id: 70201, name: 'Snape grass', examine: 'Snape grass.', value: 30, category: 'herblore', weight: 0.2 });

// Cooking additions
items.define({ id: 70210, name: 'Raw anglerfish', examine: 'A raw anglerfish.', value: 400, category: 'cooking', weight: 0.5 });
items.define({ id: 70211, name: 'Anglerfish', examine: 'Heals above max HP.', value: 700, category: 'food', weight: 0.5 });
items.define({ id: 70212, name: 'Raw dark crab', examine: 'A raw dark crab from the Wilds.', value: 350, category: 'cooking', weight: 0.5 });
items.define({ id: 70213, name: 'Dark crab', examine: 'A dark crab. Heals 22.', value: 600, category: 'food', weight: 0.5 });
items.define({ id: 70214, name: 'Raw monkfish', examine: 'A raw monkfish.', value: 120, category: 'cooking', weight: 0.4 });
items.define({ id: 70215, name: 'Monkfish', examine: 'A monkfish. Heals 16.', value: 250, category: 'food', weight: 0.4 });
items.define({ id: 70216, name: 'Raw karambwan', examine: 'A raw karambwan.', value: 200, category: 'cooking', weight: 0.4 });
items.define({ id: 70217, name: 'Cooked karambwan', examine: 'A cooked karambwan. Can be combo-eaten.', value: 350, category: 'food', weight: 0.4 });

// Burnt food (generic)
items.define({ id: 70218, name: 'Burnt food', examine: 'Oops.', value: 1, tradeable: false, category: 'junk', weight: 0.4 });

// Prayer bones (higher tiers)
items.define({ id: 70220, name: 'Babydragon bones', examine: 'Bones from a baby dragon.', value: 500, category: 'prayer', weight: 1 });
items.define({ id: 70221, name: 'Superior dragon bones', examine: 'Enormously powerful dragon bones.', value: 10000, category: 'prayer', weight: 1.5 });
items.define({ id: 70222, name: 'Wyvern bones', examine: 'Bones from a wyvern.', value: 5000, category: 'prayer', weight: 1.5 });
items.define({ id: 70223, name: 'Ensouled head', examine: 'A head with residual spiritual energy.', value: 100, category: 'prayer', weight: 1 });

// Soul rune
items.define({ id: 70230, name: 'Soul rune', examine: 'A soul rune.', stackable: true, value: 300, category: 'magic', weight: 0 });

// Cosmic rune (needed for enchanting)
items.define({ id: 70231, name: 'Cosmic rune', examine: 'A cosmic rune.', stackable: true, value: 100, category: 'magic', weight: 0 });


// ══════════════════════════════════════════════════════════════════════════════
// WEB 1: METALWORKING (Mining -> Smithing -> Crafting -> Magic)
//
// Mine ores -> Smelt bars -> Smith equipment OR Craft jewelry -> Enchant ->
// High-alch for magic XP + gold. The circle of the economy.
// ══════════════════════════════════════════════════════════════════════════════

// ── 1a. Smelting: Silver bar ─────────────────────────────────────────────────
// (Bronze through runite smelting already exists in recipes.js)
r({ id: 'smelt_silver', skill: 'crafting', name: 'Silver bar', inputs: [{ id: 60001, count: 1 }], outputs: [{ id: 60011, count: 1 }], level: 20, xp: 13, ticks: 4, station: 'furnace' });

src(60011, { type: 'recipe', sourceId: 'smelt_silver', sourceName: 'Smelt silver bar', details: 'Crafting 20, furnace' });
use(60001, { type: 'recipe', targetId: 'smelt_silver', targetName: 'Silver bar', details: 'Crafting 20, furnace' });

// ── 1b. Jewelry Crafting: Gold ───────────────────────────────────────────────
r({ id: 'craft_gold_ring', skill: 'crafting', name: 'Gold ring', inputs: [{ id: 253, count: 1 }], outputs: [{ id: 12520, count: 1 }], level: 5, xp: 15, ticks: 3, station: 'furnace' });
r({ id: 'craft_gold_necklace', skill: 'crafting', name: 'Gold necklace', inputs: [{ id: 253, count: 1 }], outputs: [{ id: 12530, count: 1 }], level: 6, xp: 20, ticks: 3, station: 'furnace' });
r({ id: 'craft_gold_bracelet', skill: 'crafting', name: 'Gold bracelet', inputs: [{ id: 253, count: 1 }], outputs: [{ id: 70111, count: 1 }], level: 7, xp: 25, ticks: 3, station: 'furnace' });
r({ id: 'craft_gold_amulet_u', skill: 'crafting', name: 'Gold amulet (u)', inputs: [{ id: 253, count: 1 }], outputs: [{ id: 70110, count: 1 }], level: 8, xp: 30, ticks: 3, station: 'furnace' });

src(12520, { type: 'recipe', sourceId: 'craft_gold_ring', sourceName: 'Gold ring', details: 'Crafting 5, gold bar + furnace' });
src(12530, { type: 'recipe', sourceId: 'craft_gold_necklace', sourceName: 'Gold necklace', details: 'Crafting 6, gold bar + furnace' });
use(253, { type: 'recipe', targetId: 'craft_gold_ring', targetName: 'Gold ring', details: 'Crafting 5' });
use(253, { type: 'recipe', targetId: 'craft_gold_necklace', targetName: 'Gold necklace', details: 'Crafting 6' });
use(253, { type: 'recipe', targetId: 'craft_gold_bracelet', targetName: 'Gold bracelet', details: 'Crafting 7' });
use(253, { type: 'recipe', targetId: 'craft_gold_amulet_u', targetName: 'Gold amulet (u)', details: 'Crafting 8' });

// ── 1c. Jewelry Crafting: Sapphire ──────────────────────────────────────────
r({ id: 'craft_sapphire_ring', skill: 'crafting', name: 'Sapphire ring', inputs: [{ id: 253, count: 1 }, { id: 264, count: 1 }], outputs: [{ id: 12521, count: 1 }], level: 20, xp: 40, ticks: 3, station: 'furnace' });
r({ id: 'craft_sapphire_necklace', skill: 'crafting', name: 'Sapphire necklace', inputs: [{ id: 253, count: 1 }, { id: 264, count: 1 }], outputs: [{ id: 12531, count: 1 }], level: 22, xp: 55, ticks: 3, station: 'furnace' });
r({ id: 'craft_sapphire_bracelet', skill: 'crafting', name: 'Sapphire bracelet', inputs: [{ id: 253, count: 1 }, { id: 264, count: 1 }], outputs: [{ id: 70113, count: 1 }], level: 23, xp: 60, ticks: 3, station: 'furnace' });
r({ id: 'craft_sapphire_amulet_u', skill: 'crafting', name: 'Sapphire amulet (u)', inputs: [{ id: 253, count: 1 }, { id: 264, count: 1 }], outputs: [{ id: 70112, count: 1 }], level: 24, xp: 65, ticks: 3, station: 'furnace' });

src(12521, { type: 'recipe', sourceId: 'craft_sapphire_ring', sourceName: 'Sapphire ring', details: 'Crafting 20, gold bar + sapphire' });
use(264, { type: 'recipe', targetId: 'craft_sapphire_ring', targetName: 'Sapphire ring', details: 'Crafting 20' });
use(264, { type: 'recipe', targetId: 'craft_sapphire_necklace', targetName: 'Sapphire necklace', details: 'Crafting 22' });
use(264, { type: 'recipe', targetId: 'craft_sapphire_bracelet', targetName: 'Sapphire bracelet', details: 'Crafting 23' });
use(264, { type: 'recipe', targetId: 'craft_sapphire_amulet_u', targetName: 'Sapphire amulet (u)', details: 'Crafting 24' });

// ── 1d. Jewelry Crafting: Emerald ───────────────────────────────────────────
r({ id: 'craft_emerald_ring', skill: 'crafting', name: 'Emerald ring', inputs: [{ id: 253, count: 1 }, { id: 265, count: 1 }], outputs: [{ id: 70114, count: 1 }], level: 27, xp: 55, ticks: 3, station: 'furnace' });
r({ id: 'craft_emerald_necklace', skill: 'crafting', name: 'Emerald necklace', inputs: [{ id: 253, count: 1 }, { id: 265, count: 1 }], outputs: [{ id: 70115, count: 1 }], level: 29, xp: 60, ticks: 3, station: 'furnace' });
r({ id: 'craft_emerald_bracelet', skill: 'crafting', name: 'Emerald bracelet', inputs: [{ id: 253, count: 1 }, { id: 265, count: 1 }], outputs: [{ id: 70117, count: 1 }], level: 30, xp: 65, ticks: 3, station: 'furnace' });
r({ id: 'craft_emerald_amulet_u', skill: 'crafting', name: 'Emerald amulet (u)', inputs: [{ id: 253, count: 1 }, { id: 265, count: 1 }], outputs: [{ id: 70116, count: 1 }], level: 31, xp: 70, ticks: 3, station: 'furnace' });

// ── 1e. Jewelry Crafting: Ruby ──────────────────────────────────────────────
r({ id: 'craft_ruby_ring', skill: 'crafting', name: 'Ruby ring', inputs: [{ id: 253, count: 1 }, { id: 266, count: 1 }], outputs: [{ id: 70118, count: 1 }], level: 43, xp: 70, ticks: 3, station: 'furnace' });
r({ id: 'craft_ruby_necklace', skill: 'crafting', name: 'Ruby necklace', inputs: [{ id: 253, count: 1 }, { id: 266, count: 1 }], outputs: [{ id: 70119, count: 1 }], level: 40, xp: 75, ticks: 3, station: 'furnace' });
r({ id: 'craft_ruby_amulet_u', skill: 'crafting', name: 'Ruby amulet (u)', inputs: [{ id: 253, count: 1 }, { id: 266, count: 1 }], outputs: [{ id: 70120, count: 1 }], level: 50, xp: 85, ticks: 3, station: 'furnace' });
r({ id: 'craft_ruby_bracelet', skill: 'crafting', name: 'Ruby bracelet', inputs: [{ id: 253, count: 1 }, { id: 266, count: 1 }], outputs: [{ id: 70121, count: 1 }], level: 42, xp: 80, ticks: 3, station: 'furnace' });

// ── 1f. Jewelry Crafting: Diamond ───────────────────────────────────────────
r({ id: 'craft_diamond_ring', skill: 'crafting', name: 'Diamond ring', inputs: [{ id: 253, count: 1 }, { id: 267, count: 1 }], outputs: [{ id: 70122, count: 1 }], level: 43, xp: 85, ticks: 3, station: 'furnace' });
r({ id: 'craft_diamond_necklace', skill: 'crafting', name: 'Diamond necklace', inputs: [{ id: 253, count: 1 }, { id: 267, count: 1 }], outputs: [{ id: 70123, count: 1 }], level: 56, xp: 90, ticks: 3, station: 'furnace' });
r({ id: 'craft_diamond_amulet_u', skill: 'crafting', name: 'Diamond amulet (u)', inputs: [{ id: 253, count: 1 }, { id: 267, count: 1 }], outputs: [{ id: 70124, count: 1 }], level: 70, xp: 100, ticks: 3, station: 'furnace' });
r({ id: 'craft_diamond_bracelet', skill: 'crafting', name: 'Diamond bracelet', inputs: [{ id: 253, count: 1 }, { id: 267, count: 1 }], outputs: [{ id: 70125, count: 1 }], level: 58, xp: 95, ticks: 3, station: 'furnace' });

// ── 1g. Silver Crafting ─────────────────────────────────────────────────────
r({ id: 'craft_silver_tiara', skill: 'crafting', name: 'Silver tiara', inputs: [{ id: 60011, count: 1 }], outputs: [{ id: 70140, count: 1 }], level: 23, xp: 52, ticks: 3, station: 'furnace' });
r({ id: 'craft_holy_symbol_u', skill: 'crafting', name: 'Holy symbol (u)', inputs: [{ id: 60011, count: 1 }], outputs: [{ id: 70141, count: 1 }], level: 16, xp: 50, ticks: 3, station: 'furnace' });

src(70140, { type: 'recipe', sourceId: 'craft_silver_tiara', sourceName: 'Silver tiara', details: 'Crafting 23, silver bar + furnace' });
src(70141, { type: 'recipe', sourceId: 'craft_holy_symbol_u', sourceName: 'Holy symbol (u)', details: 'Crafting 16, silver bar + furnace' });

// ── 1h. Enchanting (Magic XP from jewelry) ──────────────────────────────────
// Enchanting turns plain jewelry into functional teleport/combat jewelry
r({ id: 'enchant_sapphire', skill: 'magic', name: 'Lvl-1 Enchant', inputs: [{ id: 12521, count: 1 }, { id: 271, count: 1 }, { id: 70231, count: 1 }], outputs: [{ id: 70130, count: 1 }], level: 7, xp: 17, ticks: 3 });
r({ id: 'enchant_emerald', skill: 'magic', name: 'Lvl-2 Enchant', inputs: [{ id: 70114, count: 1 }, { id: 270, count: 3 }, { id: 70231, count: 1 }], outputs: [{ id: 70134, count: 1 }], level: 27, xp: 37, ticks: 3 });
r({ id: 'enchant_ruby', skill: 'magic', name: 'Lvl-3 Enchant', inputs: [{ id: 70118, count: 1 }, { id: 273, count: 5 }, { id: 70231, count: 1 }], outputs: [{ id: 70135, count: 1 }], level: 49, xp: 59, ticks: 3 });
r({ id: 'enchant_diamond', skill: 'magic', name: 'Lvl-4 Enchant', inputs: [{ id: 70122, count: 1 }, { id: 272, count: 10 }, { id: 70231, count: 1 }], outputs: [{ id: 70136, count: 1 }], level: 57, xp: 67, ticks: 3 });

src(70130, { type: 'recipe', sourceId: 'enchant_sapphire', sourceName: 'Lvl-1 Enchant', details: 'Magic 7, sapphire ring + runes' });
src(70134, { type: 'recipe', sourceId: 'enchant_emerald', sourceName: 'Lvl-2 Enchant', details: 'Magic 27, emerald ring + runes' });
src(70135, { type: 'recipe', sourceId: 'enchant_ruby', sourceName: 'Lvl-3 Enchant', details: 'Magic 49, ruby ring + runes' });

// ── 1i. High-Alchemy (completing the circuit: products -> coins + magic XP)─
r({ id: 'high_alch', skill: 'magic', name: 'High Level Alchemy', inputs: [{ id: 278, count: 1 }, { id: 273, count: 5 }], outputs: [], level: 55, xp: 65, ticks: 5 });
r({ id: 'low_alch', skill: 'magic', name: 'Low Level Alchemy', inputs: [{ id: 278, count: 1 }, { id: 273, count: 3 }], outputs: [], level: 21, xp: 31, ticks: 5 });

use(278, { type: 'recipe', targetId: 'high_alch', targetName: 'High Level Alchemy', details: 'Magic 55, nature rune + fire runes + any item = coins' });


// ══════════════════════════════════════════════════════════════════════════════
// WEB 2: WOODWORK (Woodcutting -> Fletching -> Ranged + Crafting)
//
// Cut trees -> Fletch into bows/arrow shafts -> String with bowstring ->
// Smith arrowheads -> Attach to shafts -> Fire arrows for ranged XP.
//
// The chain: Woodcutting XP -> Fletching XP -> Crafting XP (spinning) ->
//            Smithing XP (arrowheads) -> Fletching XP (assembly) -> Ranged XP
// ══════════════════════════════════════════════════════════════════════════════

// ── 2a. Fletch higher-tier unstrung bows ────────────────────────────────────
r({ id: 'fletch_willow_shortbow_u', skill: 'fletching', name: 'Willow shortbow (u)', inputs: [{ id: 202, count: 1 }], outputs: [{ id: 70150, count: 1 }], level: 35, xp: 33, ticks: 3, tool: 'knife' });
r({ id: 'fletch_maple_shortbow_u', skill: 'fletching', name: 'Maple shortbow (u)', inputs: [{ id: 203, count: 1 }], outputs: [{ id: 70151, count: 1 }], level: 50, xp: 50, ticks: 3, tool: 'knife' });
r({ id: 'fletch_yew_shortbow_u', skill: 'fletching', name: 'Yew shortbow (u)', inputs: [{ id: 204, count: 1 }], outputs: [{ id: 70152, count: 1 }], level: 65, xp: 67, ticks: 3, tool: 'knife' });
r({ id: 'fletch_magic_shortbow_u', skill: 'fletching', name: 'Magic shortbow (u)', inputs: [{ id: 205, count: 1 }], outputs: [{ id: 70153, count: 1 }], level: 80, xp: 83, ticks: 3, tool: 'knife' });

// Longbows
r({ id: 'fletch_willow_longbow_u', skill: 'fletching', name: 'Willow longbow (u)', inputs: [{ id: 202, count: 1 }], outputs: [{ id: 70154, count: 1 }], level: 40, xp: 41, ticks: 3, tool: 'knife' });
r({ id: 'fletch_maple_longbow_u', skill: 'fletching', name: 'Maple longbow (u)', inputs: [{ id: 203, count: 1 }], outputs: [{ id: 70155, count: 1 }], level: 55, xp: 58, ticks: 3, tool: 'knife' });
r({ id: 'fletch_yew_longbow_u', skill: 'fletching', name: 'Yew longbow (u)', inputs: [{ id: 204, count: 1 }], outputs: [{ id: 70156, count: 1 }], level: 70, xp: 75, ticks: 3, tool: 'knife' });
r({ id: 'fletch_magic_longbow_u', skill: 'fletching', name: 'Magic longbow (u)', inputs: [{ id: 205, count: 1 }], outputs: [{ id: 70157, count: 1 }], level: 85, xp: 91, ticks: 3, tool: 'knife' });

src(70150, { type: 'recipe', sourceId: 'fletch_willow_shortbow_u', sourceName: 'Fletch willow shortbow', details: 'Fletching 35, willow logs + knife' });
src(70151, { type: 'recipe', sourceId: 'fletch_maple_shortbow_u', sourceName: 'Fletch maple shortbow', details: 'Fletching 50, maple logs + knife' });
src(70152, { type: 'recipe', sourceId: 'fletch_yew_shortbow_u', sourceName: 'Fletch yew shortbow', details: 'Fletching 65, yew logs + knife' });
src(70153, { type: 'recipe', sourceId: 'fletch_magic_shortbow_u', sourceName: 'Fletch magic shortbow', details: 'Fletching 80, magic logs + knife' });

use(202, { type: 'recipe', targetId: 'fletch_willow_shortbow_u', targetName: 'Willow shortbow (u)', details: 'Fletching 35' });
use(203, { type: 'recipe', targetId: 'fletch_maple_shortbow_u', targetName: 'Maple shortbow (u)', details: 'Fletching 50' });
use(204, { type: 'recipe', targetId: 'fletch_yew_shortbow_u', targetName: 'Yew shortbow (u)', details: 'Fletching 65' });
use(205, { type: 'recipe', targetId: 'fletch_magic_shortbow_u', targetName: 'Magic shortbow (u)', details: 'Fletching 80' });

// ── 2b. String bows (unstrung + bowstring = finished) ───────────────────────
r({ id: 'fletch_willow_shortbow', skill: 'fletching', name: 'Willow shortbow', inputs: [{ id: 70150, count: 1 }, { id: 580, count: 1 }], outputs: [{ id: 70160, count: 1 }], level: 35, xp: 33, ticks: 2 });
r({ id: 'fletch_maple_shortbow', skill: 'fletching', name: 'Maple shortbow', inputs: [{ id: 70151, count: 1 }, { id: 580, count: 1 }], outputs: [{ id: 70161, count: 1 }], level: 50, xp: 50, ticks: 2 });
r({ id: 'fletch_yew_shortbow', skill: 'fletching', name: 'Yew shortbow', inputs: [{ id: 70152, count: 1 }, { id: 580, count: 1 }], outputs: [{ id: 70162, count: 1 }], level: 65, xp: 67, ticks: 2 });
r({ id: 'fletch_magic_shortbow', skill: 'fletching', name: 'Magic shortbow', inputs: [{ id: 70153, count: 1 }, { id: 580, count: 1 }], outputs: [{ id: 70163, count: 1 }], level: 80, xp: 83, ticks: 2 });

r({ id: 'fletch_willow_longbow', skill: 'fletching', name: 'Willow longbow', inputs: [{ id: 70154, count: 1 }, { id: 580, count: 1 }], outputs: [{ id: 70164, count: 1 }], level: 40, xp: 41, ticks: 2 });
r({ id: 'fletch_maple_longbow', skill: 'fletching', name: 'Maple longbow', inputs: [{ id: 70155, count: 1 }, { id: 580, count: 1 }], outputs: [{ id: 70165, count: 1 }], level: 55, xp: 58, ticks: 2 });
r({ id: 'fletch_yew_longbow', skill: 'fletching', name: 'Yew longbow', inputs: [{ id: 70156, count: 1 }, { id: 580, count: 1 }], outputs: [{ id: 70166, count: 1 }], level: 70, xp: 75, ticks: 2 });
r({ id: 'fletch_magic_longbow', skill: 'fletching', name: 'Magic longbow', inputs: [{ id: 70157, count: 1 }, { id: 580, count: 1 }], outputs: [{ id: 70167, count: 1 }], level: 85, xp: 91, ticks: 2 });

src(70160, { type: 'recipe', sourceId: 'fletch_willow_shortbow', sourceName: 'String willow shortbow', details: 'Fletching 35, unstrung + bowstring' });
src(70163, { type: 'recipe', sourceId: 'fletch_magic_shortbow', sourceName: 'String magic shortbow', details: 'Fletching 80, unstrung + bowstring' });

use(580, { type: 'recipe', targetId: 'fletch_willow_shortbow', targetName: 'Willow shortbow', details: 'Fletching 35' });
use(580, { type: 'recipe', targetId: 'fletch_maple_shortbow', targetName: 'Maple shortbow', details: 'Fletching 50' });
use(580, { type: 'recipe', targetId: 'fletch_yew_shortbow', targetName: 'Yew shortbow', details: 'Fletching 65' });
use(580, { type: 'recipe', targetId: 'fletch_magic_shortbow', targetName: 'Magic shortbow', details: 'Fletching 80' });

// ── 2c. Arrow assembly (higher tiers) ───────────────────────────────────────
// Smith arrowheads at anvil (higher tiers)
r({ id: 'smith_steel_arrowheads', skill: 'smithing', name: 'Steel arrowheads', inputs: [{ id: 252, count: 1 }], outputs: [{ id: 70170, count: 15 }], level: 35, xp: 37, ticks: 3, station: 'anvil', tool: 'hammer' });
r({ id: 'smith_mithril_arrowheads', skill: 'smithing', name: 'Mithril arrowheads', inputs: [{ id: 254, count: 1 }], outputs: [{ id: 70171, count: 15 }], level: 55, xp: 50, ticks: 3, station: 'anvil', tool: 'hammer' });
r({ id: 'smith_adamant_arrowheads', skill: 'smithing', name: 'Adamant arrowheads', inputs: [{ id: 255, count: 1 }], outputs: [{ id: 70172, count: 15 }], level: 75, xp: 62, ticks: 3, station: 'anvil', tool: 'hammer' });
r({ id: 'smith_rune_arrowheads', skill: 'smithing', name: 'Rune arrowheads', inputs: [{ id: 256, count: 1 }], outputs: [{ id: 70173, count: 15 }], level: 90, xp: 75, ticks: 3, station: 'anvil', tool: 'hammer' });

// Attach arrowheads to headless arrows
r({ id: 'fletch_steel_arrows', skill: 'fletching', name: 'Steel arrows', inputs: [{ id: 341, count: 15 }, { id: 70170, count: 15 }], outputs: [{ id: 70174, count: 15 }], level: 30, xp: 75, ticks: 2 });
r({ id: 'fletch_mithril_arrows', skill: 'fletching', name: 'Mithril arrows', inputs: [{ id: 341, count: 15 }, { id: 70171, count: 15 }], outputs: [{ id: 70175, count: 15 }], level: 45, xp: 112, ticks: 2 });
r({ id: 'fletch_adamant_arrows', skill: 'fletching', name: 'Adamant arrows', inputs: [{ id: 341, count: 15 }, { id: 70172, count: 15 }], outputs: [{ id: 70176, count: 15 }], level: 60, xp: 150, ticks: 2 });
r({ id: 'fletch_rune_arrows', skill: 'fletching', name: 'Rune arrows', inputs: [{ id: 341, count: 15 }, { id: 70173, count: 15 }], outputs: [{ id: 70177, count: 15 }], level: 75, xp: 187, ticks: 2 });

src(70174, { type: 'recipe', sourceId: 'fletch_steel_arrows', sourceName: 'Steel arrows', details: 'Fletching 30, headless + steel arrowheads' });
src(70175, { type: 'recipe', sourceId: 'fletch_mithril_arrows', sourceName: 'Mithril arrows', details: 'Fletching 45' });
src(70176, { type: 'recipe', sourceId: 'fletch_adamant_arrows', sourceName: 'Adamant arrows', details: 'Fletching 60' });
src(70177, { type: 'recipe', sourceId: 'fletch_rune_arrows', sourceName: 'Rune arrows', details: 'Fletching 75' });

use(252, { type: 'recipe', targetId: 'smith_steel_arrowheads', targetName: 'Steel arrowheads', details: 'Smithing 35' });
use(254, { type: 'recipe', targetId: 'smith_mithril_arrowheads', targetName: 'Mithril arrowheads', details: 'Smithing 55' });
use(255, { type: 'recipe', targetId: 'smith_adamant_arrowheads', targetName: 'Adamant arrowheads', details: 'Smithing 75' });
use(256, { type: 'recipe', targetId: 'smith_rune_arrowheads', targetName: 'Rune arrowheads', details: 'Smithing 90' });


// ══════════════════════════════════════════════════════════════════════════════
// WEB 3: FOOD (Fishing -> Cooking -> Combat sustain)
//
// Raw fish -> Cook on range -> Food heals HP in combat.
// Burn chance decreases with level. 28 inventory slots = food = HP budget.
// ══════════════════════════════════════════════════════════════════════════════

// (Shrimps through shark already defined in recipes.js. Add the gaps.)

r({ id: 'cook_monkfish', skill: 'cooking', name: 'Monkfish', inputs: [{ id: 70214, count: 1 }], outputs: [{ id: 70215, count: 1 }], level: 62, xp: 150, ticks: 4, station: 'range', failItem: 70218, stopBurn: 92 });
r({ id: 'cook_anglerfish', skill: 'cooking', name: 'Anglerfish', inputs: [{ id: 70210, count: 1 }], outputs: [{ id: 70211, count: 1 }], level: 84, xp: 230, ticks: 4, station: 'range', failItem: 70218, stopBurn: 99 });
r({ id: 'cook_dark_crab', skill: 'cooking', name: 'Dark crab', inputs: [{ id: 70212, count: 1 }], outputs: [{ id: 70213, count: 1 }], level: 90, xp: 215, ticks: 4, station: 'range', failItem: 70218, stopBurn: 99 });
r({ id: 'cook_karambwan', skill: 'cooking', name: 'Cooked karambwan', inputs: [{ id: 70216, count: 1 }], outputs: [{ id: 70217, count: 1 }], level: 30, xp: 190, ticks: 1, station: 'range', failItem: 70218, stopBurn: 99 });

src(70215, { type: 'recipe', sourceId: 'cook_monkfish', sourceName: 'Cook monkfish', details: 'Cooking 62, range. Heals 16.' });
src(70211, { type: 'recipe', sourceId: 'cook_anglerfish', sourceName: 'Cook anglerfish', details: 'Cooking 84, range. Heals above max HP.' });
src(70213, { type: 'recipe', sourceId: 'cook_dark_crab', sourceName: 'Cook dark crab', details: 'Cooking 90, range. Heals 22. Raw from Wilds.' });
src(70217, { type: 'recipe', sourceId: 'cook_karambwan', sourceName: 'Cook karambwan', details: 'Cooking 30, range. Combo food: can eat in same tick as other food.' });

use(70214, { type: 'recipe', targetId: 'cook_monkfish', targetName: 'Monkfish', details: 'Cooking 62' });
use(70210, { type: 'recipe', targetId: 'cook_anglerfish', targetName: 'Anglerfish', details: 'Cooking 84' });
use(70212, { type: 'recipe', targetId: 'cook_dark_crab', targetName: 'Dark crab', details: 'Cooking 90' });
use(70216, { type: 'recipe', targetId: 'cook_karambwan', targetName: 'Cooked karambwan', details: 'Cooking 30' });

// Register fishing as source for raw fish
src(220, { type: 'gathering', sourceId: 'net_fishing', sourceName: 'Net fishing', details: 'Fishing 1, small fishing net' });
src(221, { type: 'gathering', sourceId: 'fly_fishing', sourceName: 'Fly fishing', details: 'Fishing 20, fly fishing rod + feathers' });
src(222, { type: 'gathering', sourceId: 'fly_fishing', sourceName: 'Fly fishing', details: 'Fishing 30, fly fishing rod + feathers' });
src(223, { type: 'gathering', sourceId: 'cage_fishing', sourceName: 'Cage fishing', details: 'Fishing 40, lobster pot' });
src(224, { type: 'gathering', sourceId: 'harpoon_fishing', sourceName: 'Harpoon fishing', details: 'Fishing 50, harpoon' });
src(225, { type: 'gathering', sourceId: 'harpoon_fishing', sourceName: 'Harpoon fishing', details: 'Fishing 76, harpoon' });
src(70214, { type: 'gathering', sourceId: 'net_fishing', sourceName: 'Net fishing (Saltbrine)', details: 'Fishing 62, small fishing net at Saltbrine docks' });
src(70210, { type: 'gathering', sourceId: 'rod_fishing', sourceName: 'Rod fishing (Saltbrine)', details: 'Fishing 82, fishing rod at Saltbrine deep water' });

// Register food use in combat
use(237, { type: 'other', targetId: 'combat_healing', targetName: 'Combat food', details: 'Heals 20 HP. Best non-special food.' });
use(70211, { type: 'other', targetId: 'combat_healing', targetName: 'Combat food', details: 'Heals above max HP. Endgame food.' });
use(70217, { type: 'other', targetId: 'combat_healing', targetName: 'Combo food', details: 'Heals 18. Can eat in same tick as other food.' });


// ══════════════════════════════════════════════════════════════════════════════
// WEB 4: HERBLORE (Farming -> Herblore -> Combat potions -> PvM)
//
// Farm herb seeds -> Grimy herbs -> Clean herbs -> Combine with secondary ->
// Potion -> Boost combat stats for PvM -> PvM drops herb seeds -> CYCLE
// ══════════════════════════════════════════════════════════════════════════════

// ── 4a. Clean herbs (higher tiers not in recipes.js) ────────────────────────
r({ id: 'clean_irit', skill: 'herblore', name: 'Clean irit', inputs: [{ id: 305, count: 1 }], outputs: [{ id: 70180, count: 1 }], level: 45, xp: 8, ticks: 1 });
r({ id: 'clean_avantoe', skill: 'herblore', name: 'Clean avantoe', inputs: [{ id: 306, count: 1 }], outputs: [{ id: 70181, count: 1 }], level: 48, xp: 10, ticks: 1 });
r({ id: 'clean_kwuarm', skill: 'herblore', name: 'Clean kwuarm', inputs: [{ id: 306, count: 1 }], outputs: [{ id: 70182, count: 1 }], level: 54, xp: 11, ticks: 1 });
r({ id: 'clean_snapdragon', skill: 'herblore', name: 'Clean snapdragon', inputs: [{ id: 307, count: 1 }], outputs: [{ id: 70183, count: 1 }], level: 59, xp: 11, ticks: 1 });
r({ id: 'clean_cadantine', skill: 'herblore', name: 'Clean cadantine', inputs: [{ id: 308, count: 1 }], outputs: [{ id: 70184, count: 1 }], level: 65, xp: 12, ticks: 1 });
r({ id: 'clean_lantadyme', skill: 'herblore', name: 'Clean lantadyme', inputs: [{ id: 308, count: 1 }], outputs: [{ id: 70185, count: 1 }], level: 67, xp: 13, ticks: 1 });
r({ id: 'clean_dwarf_weed', skill: 'herblore', name: 'Clean dwarf weed', inputs: [{ id: 308, count: 1 }], outputs: [{ id: 70186, count: 1 }], level: 70, xp: 13, ticks: 1 });
r({ id: 'clean_torstol', skill: 'herblore', name: 'Clean torstol', inputs: [{ id: 308, count: 1 }], outputs: [{ id: 70187, count: 1 }], level: 75, xp: 15, ticks: 1 });

// ── 4b. Potions (higher tiers not in recipes.js) ────────────────────────────
// Super attack: clean irit + eye of newt + vial of water
r({ id: 'mix_super_attack', skill: 'herblore', name: 'Super attack(4)', inputs: [{ id: 324, count: 1 }, { id: 70180, count: 1 }, { id: 320, count: 1 }], outputs: [{ id: 336, count: 1 }], level: 45, xp: 100, ticks: 3 });
// Super strength: clean kwuarm + limpwurt root + vial of water
r({ id: 'mix_super_strength', skill: 'herblore', name: 'Super strength(4)', inputs: [{ id: 324, count: 1 }, { id: 70182, count: 1 }, { id: 322, count: 1 }], outputs: [{ id: 337, count: 1 }], level: 55, xp: 125, ticks: 3 });
// Super defence: clean cadantine + white berries + vial of water
r({ id: 'mix_super_defence', skill: 'herblore', name: 'Super defence(4)', inputs: [{ id: 324, count: 1 }, { id: 70184, count: 1 }, { id: 70196, count: 1 }], outputs: [{ id: 70190, count: 1 }], level: 66, xp: 150, ticks: 3 });
// Ranging potion: clean dwarf weed + wine of zamorak + vial of water
r({ id: 'mix_ranging', skill: 'herblore', name: 'Ranging potion(4)', inputs: [{ id: 324, count: 1 }, { id: 70186, count: 1 }, { id: 70197, count: 1 }], outputs: [{ id: 70191, count: 1 }], level: 72, xp: 162, ticks: 3 });
// Magic potion: clean lantadyme + potato cactus + vial of water
r({ id: 'mix_magic', skill: 'herblore', name: 'Magic potion(4)', inputs: [{ id: 324, count: 1 }, { id: 70185, count: 1 }, { id: 70199, count: 1 }], outputs: [{ id: 70192, count: 1 }], level: 76, xp: 172, ticks: 3 });
// Antifire: clean lantadyme + dragon scale dust + vial of water
r({ id: 'mix_antifire', skill: 'herblore', name: 'Antifire(4)', inputs: [{ id: 324, count: 1 }, { id: 70185, count: 1 }, { id: 70200, count: 1 }], outputs: [{ id: 70193, count: 1 }], level: 69, xp: 157, ticks: 3 });
// Super restore: clean snapdragon + crushed nest + vial of water
r({ id: 'mix_super_restore', skill: 'herblore', name: 'Super restore(4)', inputs: [{ id: 324, count: 1 }, { id: 70183, count: 1 }, { id: 70198, count: 1 }], outputs: [{ id: 70194, count: 1 }], level: 63, xp: 142, ticks: 3 });
// Saradomin brew: clean torstol + crushed nest + vial of water
r({ id: 'mix_saradomin_brew', skill: 'herblore', name: 'Saradomin brew(4)', inputs: [{ id: 324, count: 1 }, { id: 70187, count: 1 }, { id: 70198, count: 1 }], outputs: [{ id: 70195, count: 1 }], level: 81, xp: 180, ticks: 3 });

src(336, { type: 'recipe', sourceId: 'mix_super_attack', sourceName: 'Super attack potion', details: 'Herblore 45, irit + eye of newt' });
src(337, { type: 'recipe', sourceId: 'mix_super_strength', sourceName: 'Super strength potion', details: 'Herblore 55, kwuarm + limpwurt' });
src(70190, { type: 'recipe', sourceId: 'mix_super_defence', sourceName: 'Super defence potion', details: 'Herblore 66, cadantine + white berries' });
src(70191, { type: 'recipe', sourceId: 'mix_ranging', sourceName: 'Ranging potion', details: 'Herblore 72, dwarf weed + wine of zamorak' });
src(70192, { type: 'recipe', sourceId: 'mix_magic', sourceName: 'Magic potion', details: 'Herblore 76, lantadyme + potato cactus' });
src(70193, { type: 'recipe', sourceId: 'mix_antifire', sourceName: 'Antifire potion', details: 'Herblore 69, lantadyme + dragon scale dust' });
src(70194, { type: 'recipe', sourceId: 'mix_super_restore', sourceName: 'Super restore', details: 'Herblore 63, snapdragon + crushed nest' });
src(70195, { type: 'recipe', sourceId: 'mix_saradomin_brew', sourceName: 'Saradomin brew', details: 'Herblore 81, torstol + crushed nest' });

// Register the cycle: PvM drops seeds, seeds grow herbs, herbs become potions
use(336, { type: 'other', targetId: 'combat_boost', targetName: 'Combat boosting', details: 'Boosts attack by 5 + 15% for PvM' });
use(337, { type: 'other', targetId: 'combat_boost', targetName: 'Combat boosting', details: 'Boosts strength by 5 + 15% for PvM' });
use(70191, { type: 'other', targetId: 'combat_boost', targetName: 'Combat boosting', details: 'Boosts ranged by 4 + 10% for PvM' });
use(70193, { type: 'other', targetId: 'combat_boost', targetName: 'Dragon protection', details: 'Required to fight dragons without taking massive dragonfire damage' });
use(70194, { type: 'other', targetId: 'combat_sustain', targetName: 'Prayer sustain', details: 'Restores prayer + all stats. Core PvM supply with sara brews.' });
use(70195, { type: 'other', targetId: 'combat_sustain', targetName: 'HP sustain', details: 'Heals 16 per dose + can overheal. Used with super restores in endgame.' });

// Farming as the source of herbs
src(300, { type: 'gathering', sourceId: 'farming', sourceName: 'Herb farming', details: 'Farming 9, guam seed in herb patch' });
src(304, { type: 'gathering', sourceId: 'farming', sourceName: 'Herb farming', details: 'Farming 32, ranarr seed in herb patch. Most profitable early herb.' });
src(307, { type: 'gathering', sourceId: 'farming', sourceName: 'Herb farming', details: 'Farming 62, snapdragon seed in herb patch' });
src(308, { type: 'gathering', sourceId: 'farming', sourceName: 'Herb farming', details: 'Farming 85, torstol seed in herb patch. Most valuable herb.' });

// Seeds from PvM (closing the cycle)
src(600, { type: 'drop', sourceId: 'various_monsters', sourceName: 'Monster drops', details: 'Common drop from many monsters. Guam seed.' });
src(602, { type: 'drop', sourceId: 'mid_tier_monsters', sourceName: 'Monster drops', details: 'Uncommon drop from mid/high level monsters. Ranarr seed = profit.' });


// ══════════════════════════════════════════════════════════════════════════════
// WEB 5: PRAYER (Combat -> Bones -> Prayer)
//
// Kill monsters -> Bones always drop -> Bury or altar -> Prayer XP
// Higher-tier monsters = better bones = more XP per bone
// Prayer unlocks protection prayers that enable harder content
// ══════════════════════════════════════════════════════════════════════════════

// Bury bones (no station needed)
r({ id: 'bury_bones', skill: 'prayer', name: 'Bury bones', inputs: [{ id: 100, count: 1 }], outputs: [], level: 1, xp: 4, ticks: 3 });
r({ id: 'bury_big_bones', skill: 'prayer', name: 'Bury big bones', inputs: [{ id: 106, count: 1 }], outputs: [], level: 1, xp: 15, ticks: 3 });
r({ id: 'bury_babydragon_bones', skill: 'prayer', name: 'Bury babydragon bones', inputs: [{ id: 70220, count: 1 }], outputs: [], level: 1, xp: 30, ticks: 3 });
r({ id: 'bury_dragon_bones', skill: 'prayer', name: 'Bury dragon bones', inputs: [{ id: 107, count: 1 }], outputs: [], level: 1, xp: 72, ticks: 3 });
r({ id: 'bury_wyvern_bones', skill: 'prayer', name: 'Bury wyvern bones', inputs: [{ id: 70222, count: 1 }], outputs: [], level: 1, xp: 50, ticks: 3 });
r({ id: 'bury_superior_dragon', skill: 'prayer', name: 'Bury superior dragon bones', inputs: [{ id: 70221, count: 1 }], outputs: [], level: 1, xp: 150, ticks: 3 });

// Use bones on altar (3.5x XP for gilded altar with 2 burners lit)
r({ id: 'altar_bones', skill: 'prayer', name: 'Offer bones (gilded altar)', inputs: [{ id: 100, count: 1 }], outputs: [], level: 1, xp: 14, ticks: 3, station: 'altar' });
r({ id: 'altar_big_bones', skill: 'prayer', name: 'Offer big bones (gilded altar)', inputs: [{ id: 106, count: 1 }], outputs: [], level: 1, xp: 52, ticks: 3, station: 'altar' });
r({ id: 'altar_dragon_bones', skill: 'prayer', name: 'Offer dragon bones (gilded altar)', inputs: [{ id: 107, count: 1 }], outputs: [], level: 1, xp: 252, ticks: 3, station: 'altar' });
r({ id: 'altar_superior_dragon', skill: 'prayer', name: 'Offer superior dragon bones (altar)', inputs: [{ id: 70221, count: 1 }], outputs: [], level: 1, xp: 525, ticks: 3, station: 'altar' });

// Ensouled heads (Arceuus spellbook prayer training)
r({ id: 'reanimate_ensouled', skill: 'prayer', name: 'Reanimate ensouled head', inputs: [{ id: 70223, count: 1 }, { id: 275, count: 4 }, { id: 278, count: 2 }], outputs: [], level: 16, xp: 65, ticks: 6 });

src(100, { type: 'drop', sourceId: 'all_monsters', sourceName: 'All monsters', details: 'Always dropped by every monster. Base prayer training.' });
src(106, { type: 'drop', sourceId: 'large_monsters', sourceName: 'Large monsters', details: 'Hill giants, moss giants, ogres. First meaningful prayer XP.' });
src(107, { type: 'drop', sourceId: 'dragons', sourceName: 'Dragons', details: 'Green dragons (Wilds), blue dragons (dungeon). Major prayer XP source.' });
src(70221, { type: 'drop', sourceId: 'vorkath', sourceName: 'Vorkath / endgame bosses', details: 'Endgame boss drops. Best prayer XP per bone.' });

use(100, { type: 'offering', targetId: 'prayer_training', targetName: 'Prayer training', details: '4.5 XP per bone buried, 14 XP on gilded altar' });
use(107, { type: 'offering', targetId: 'prayer_training', targetName: 'Prayer training', details: '72 XP buried, 252 XP on gilded altar. THE prayer training bone.' });


// ══════════════════════════════════════════════════════════════════════════════
// WEB 6: RUNECRAFTING -> MAGIC
//
// Mine pure essence -> Craft into runes at altars -> Use runes to cast spells
// Nature runes + items = high alchemy (magic XP + coins)
// Blood runes = barrage spells (endgame magic combat)
// ══════════════════════════════════════════════════════════════════════════════

// Craft runes from essence
r({ id: 'craft_air_runes', skill: 'runecrafting', name: 'Air runes', inputs: [{ id: 710, count: 1 }], outputs: [{ id: 270, count: 1 }], level: 1, xp: 5, ticks: 1 });
r({ id: 'craft_mind_runes', skill: 'runecrafting', name: 'Mind runes', inputs: [{ id: 710, count: 1 }], outputs: [{ id: 274, count: 1 }], level: 2, xp: 5, ticks: 1 });
r({ id: 'craft_water_runes', skill: 'runecrafting', name: 'Water runes', inputs: [{ id: 710, count: 1 }], outputs: [{ id: 271, count: 1 }], level: 5, xp: 6, ticks: 1 });
r({ id: 'craft_earth_runes', skill: 'runecrafting', name: 'Earth runes', inputs: [{ id: 710, count: 1 }], outputs: [{ id: 272, count: 1 }], level: 9, xp: 6, ticks: 1 });
r({ id: 'craft_fire_runes', skill: 'runecrafting', name: 'Fire runes', inputs: [{ id: 710, count: 1 }], outputs: [{ id: 273, count: 1 }], level: 14, xp: 7, ticks: 1 });
r({ id: 'craft_body_runes', skill: 'runecrafting', name: 'Body runes', inputs: [{ id: 710, count: 1 }], outputs: [{ id: 275, count: 1 }], level: 20, xp: 7, ticks: 1 });
r({ id: 'craft_cosmic_runes', skill: 'runecrafting', name: 'Cosmic runes', inputs: [{ id: 711, count: 1 }], outputs: [{ id: 70231, count: 1 }], level: 27, xp: 8, ticks: 1 });
r({ id: 'craft_chaos_runes', skill: 'runecrafting', name: 'Chaos runes', inputs: [{ id: 711, count: 1 }], outputs: [{ id: 276, count: 1 }], level: 35, xp: 8, ticks: 1 });
r({ id: 'craft_nature_runes', skill: 'runecrafting', name: 'Nature runes', inputs: [{ id: 711, count: 1 }], outputs: [{ id: 278, count: 1 }], level: 44, xp: 9, ticks: 1 });
r({ id: 'craft_law_runes', skill: 'runecrafting', name: 'Law runes', inputs: [{ id: 711, count: 1 }], outputs: [{ id: 279, count: 1 }], level: 54, xp: 9, ticks: 1 });
r({ id: 'craft_death_runes', skill: 'runecrafting', name: 'Death runes', inputs: [{ id: 711, count: 1 }], outputs: [{ id: 277, count: 1 }], level: 65, xp: 10, ticks: 1 });
r({ id: 'craft_blood_runes', skill: 'runecrafting', name: 'Blood runes', inputs: [{ id: 711, count: 1 }], outputs: [{ id: 280, count: 1 }], level: 77, xp: 23, ticks: 1 });
r({ id: 'craft_soul_runes', skill: 'runecrafting', name: 'Soul runes', inputs: [{ id: 711, count: 1 }], outputs: [{ id: 70230, count: 1 }], level: 90, xp: 29, ticks: 1 });

src(270, { type: 'recipe', sourceId: 'craft_air_runes', sourceName: 'Air altar', details: 'Runecrafting 1, rune/pure essence' });
src(278, { type: 'recipe', sourceId: 'craft_nature_runes', sourceName: 'Nature altar', details: 'Runecrafting 44, pure essence. Key for high alchemy economy.' });
src(280, { type: 'recipe', sourceId: 'craft_blood_runes', sourceName: 'Blood altar', details: 'Runecrafting 77, pure essence. AFK endgame method. Fuels barrage spells.' });
src(277, { type: 'recipe', sourceId: 'craft_death_runes', sourceName: 'Death altar', details: 'Runecrafting 65, pure essence. Required for burst/barrage spells.' });
src(70230, { type: 'recipe', sourceId: 'craft_soul_runes', sourceName: 'Soul altar', details: 'Runecrafting 90, pure essence. Highest-tier rune.' });

use(710, { type: 'recipe', targetId: 'craft_air_runes', targetName: 'Air runes', details: 'Runecrafting 1 at air altar' });
use(711, { type: 'recipe', targetId: 'craft_nature_runes', targetName: 'Nature runes', details: 'Runecrafting 44 at nature altar' });
use(711, { type: 'recipe', targetId: 'craft_blood_runes', targetName: 'Blood runes', details: 'Runecrafting 77 at blood altar' });

// Register essence sources
src(710, { type: 'gathering', sourceId: 'essence_mining', sourceName: 'Rune essence mine', details: 'Mining 1, accessed via Aubury or rune shop teleport' });
src(711, { type: 'gathering', sourceId: 'essence_mining', sourceName: 'Rune essence mine', details: 'Mining 30 mines pure essence instead of rune essence' });

// Register rune uses (magic combat)
use(270, { type: 'other', targetId: 'magic_combat', targetName: 'Standard spellbook', details: 'Wind/air spells, teleports. Most consumed rune.' });
use(276, { type: 'other', targetId: 'magic_combat', targetName: 'Standard spellbook', details: 'Chaos bolt, fire bolt, etc. Mid-game combat magic.' });
use(277, { type: 'other', targetId: 'magic_combat', targetName: 'Ancient magicks', details: 'Death runes for burst/barrage. Endgame magic combat and slayer.' });
use(280, { type: 'other', targetId: 'magic_combat', targetName: 'Ancient magicks', details: 'Blood barrage heals on hit. Blood runes for endgame sustain magic.' });
use(279, { type: 'other', targetId: 'magic_utility', targetName: 'Teleports', details: 'Law runes for all standard teleport spells. Core utility.' });

// Register ore mining as source for ores
src(210, { type: 'gathering', sourceId: 'mining', sourceName: 'Mining', details: 'Mining 1, copper rocks' });
src(211, { type: 'gathering', sourceId: 'mining', sourceName: 'Mining', details: 'Mining 1, tin rocks' });
src(212, { type: 'gathering', sourceId: 'mining', sourceName: 'Mining', details: 'Mining 15, iron rocks' });
src(213, { type: 'gathering', sourceId: 'mining', sourceName: 'Mining', details: 'Mining 30, coal rocks' });
src(214, { type: 'gathering', sourceId: 'mining', sourceName: 'Mining', details: 'Mining 40, gold rocks' });
src(215, { type: 'gathering', sourceId: 'mining', sourceName: 'Mining', details: 'Mining 55, mithril rocks' });
src(216, { type: 'gathering', sourceId: 'mining', sourceName: 'Mining', details: 'Mining 70, adamantite rocks' });
src(217, { type: 'gathering', sourceId: 'mining', sourceName: 'Mining', details: 'Mining 85, runite rocks. Rare, contested, valuable.' });

// Register ore uses in smelting
use(210, { type: 'recipe', targetId: 'smelt_bronze', targetName: 'Bronze bar', details: 'Smithing 1, copper + tin' });
use(211, { type: 'recipe', targetId: 'smelt_bronze', targetName: 'Bronze bar', details: 'Smithing 1, copper + tin' });
use(212, { type: 'recipe', targetId: 'smelt_iron', targetName: 'Iron bar', details: 'Smithing 15, 50% success' });
use(213, { type: 'recipe', targetId: 'smelt_steel', targetName: 'Steel bar', details: 'Smithing 30, iron + 2 coal. Also used for mithril/adamant/rune.' });

// Register log sources
src(200, { type: 'gathering', sourceId: 'woodcutting', sourceName: 'Woodcutting', details: 'Woodcutting 1, normal trees' });
src(201, { type: 'gathering', sourceId: 'woodcutting', sourceName: 'Woodcutting', details: 'Woodcutting 15, oak trees' });
src(202, { type: 'gathering', sourceId: 'woodcutting', sourceName: 'Woodcutting', details: 'Woodcutting 30, willow trees' });
src(203, { type: 'gathering', sourceId: 'woodcutting', sourceName: 'Woodcutting', details: 'Woodcutting 45, maple trees' });
src(204, { type: 'gathering', sourceId: 'woodcutting', sourceName: 'Woodcutting', details: 'Woodcutting 60, yew trees' });
src(205, { type: 'gathering', sourceId: 'woodcutting', sourceName: 'Woodcutting', details: 'Woodcutting 75, magic trees. Slow but valuable.' });

// Register log uses (fletching, firemaking)
use(200, { type: 'recipe', targetId: 'fletch_arrow_shaft', targetName: 'Arrow shafts', details: 'Fletching 1, 15 shafts per log' });
use(200, { type: 'recipe', targetId: 'burn_logs', targetName: 'Burn logs', details: 'Firemaking 1, 40 XP' });
use(204, { type: 'recipe', targetId: 'fletch_yew_shortbow_u', targetName: 'Yew shortbow (u)', details: 'Fletching 65. Yew longbows are the classic high-alch item.' });
use(205, { type: 'recipe', targetId: 'fletch_magic_shortbow_u', targetName: 'Magic shortbow (u)', details: 'Fletching 80. Highest tier fletching.' });

// Flax -> Bowstring (connects crafting into fletching web)
src(581, { type: 'gathering', sourceId: 'flax_picking', sourceName: 'Flax picking', details: 'Gather from flax fields (Heartlands, Veilwood)' });
src(580, { type: 'recipe', sourceId: 'spin_flax', sourceName: 'Spin flax', details: 'Crafting 10, spinning wheel. Connects crafting to fletching.' });
use(581, { type: 'recipe', targetId: 'spin_flax', targetName: 'Bowstring', details: 'Crafting 10, spinning wheel' });


// ══════════════════════════════════════════════════════════════════════════════
// CROSS-WEB CONNECTIONS — Where the real magic happens
//
// These are the links that make "mining amethyst gives XP in 6 skills" true.
// ══════════════════════════════════════════════════════════════════════════════

// Mining ore -> Smithing bar -> Smithing arrowheads -> Fletching arrows -> Ranged XP
// That's Mining -> Smithing -> Fletching -> Ranged (4 skills from one ore)
use(212, { type: 'recipe', targetId: 'smith_iron_arrowheads', targetName: 'Iron arrowheads -> Iron arrows -> Ranged XP', details: 'The ore-to-combat pipeline: Mining -> Smithing -> Fletching -> Ranged' });

// Gold ore -> Smithing (smelt) -> Crafting (jewelry) -> Magic (enchant) -> Magic (alch)
// That's Mining -> Smithing -> Crafting -> Magic (4 skills from one ore)
use(214, { type: 'recipe', targetId: 'smelt_gold', targetName: 'Gold bar -> Jewelry -> Enchant -> Alch', details: 'The gold pipeline: Mining -> Smithing -> Crafting -> Magic -> coins' });

// Flax -> Bowstring (Crafting) -> String bow (Fletching) -> Use bow (Ranged)
// That's Crafting -> Fletching -> Ranged
use(580, { type: 'other', targetId: 'ranged_combat', targetName: 'Ranged combat', details: 'Bowstrings on bows fired in combat. Crafting -> Fletching -> Ranged.' });

// Herb seeds (Farming) -> Herbs (Herblore) -> Potions -> PvM -> Bone drops (Prayer)
// That's Farming -> Herblore -> Combat -> Prayer
use(602, { type: 'other', targetId: 'herb_pipeline', targetName: 'Herb pipeline', details: 'Ranarr seed: Farming -> Herblore (prayer potion) -> PvM -> bone drops -> Prayer. 4 skills from one seed.' });

// Pure essence (Mining) -> Runes (Runecrafting) -> Spells (Magic) -> Alch (coins)
// That's Mining -> Runecrafting -> Magic
use(711, { type: 'other', targetId: 'essence_pipeline', targetName: 'Rune pipeline', details: 'Pure essence: Mining -> Runecrafting -> Magic. 3 skills from one rock.' });


console.log(`[aelgard] Skill web loaded: ${recipeCount} recipes, ${relCount} item source/use relationships`);
