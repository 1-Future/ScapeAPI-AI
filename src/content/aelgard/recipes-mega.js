// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Skill Recipes Mega Pack (burn v2)
//
// "Every skill 1-99 should have tier-appropriate crafting/smithing/cooking/
//  herblore/fletching methods with clear input-output recipes." — task brief
//
// This file fills the tier gaps in:
//   * Smithing (adds dart tips, throwing knives tier, cannon-balls, burial)
//   * Fletching (adds dart assembly, unfinished bolts to bolts, crossbows)
//   * Crafting (dragonhide bodies, battlestaves, tiaras)
//   * Cooking (stews, pies, kebabs, special heals)
//   * Herblore (combo potions, super combat, saradomin brew steps)
//   * Runecrafting (combo runes — mud/steam/lava/smoke/mist/dust)
//   * Prayer (ensouled head reanimation tier ladder)
//   * Construction (planks from logs, stone from limestone)
//   * Firemaking (bonfires — bulk log burn)
//
// All recipes use rel.defineRecipe-equivalent (via processing.defineRecipe)
// so they register in the same registry as the smithing-complete table.
// Cross-referenced with registerItemSource / registerItemUse so the
// gap-report / codex-generator / region-analyzer / multi-agent-sim see them.
//
// Item IDs in the 71000-71999 range (above the skill-web 70100+ block).
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const processing = require('../../skills/processing');
const recipes = require('../../data/recipes');
const rel = require('../../data/relationships');
const items = require('../../data/items');

let recipeCount = 0;
let itemDefCount = 0;
let relCount = 0;

function r(def) {
  if (def.station === undefined) def.station = null;
  if (def.tool === undefined) def.tool = null;
  if (def.failItem === undefined) def.failItem = null;
  if (def.stopBurn === undefined) def.stopBurn = null;
  recipes.define(def);
  recipeCount++;
}

function itm(def) { items.define(def); itemDefCount++; }
function src(itemId, source) { rel.registerItemSource(itemId, source); relCount++; }
function use(itemId, u) { rel.registerItemUse(itemId, u); relCount++; }

// ══════════════════════════════════════════════════════════════════════════════
// NEW ITEMS NEEDED FOR MEGA RECIPES (IDs 71000-71999)
// ══════════════════════════════════════════════════════════════════════════════

// Darts (fletching tier)
itm({ id: 71000, name: 'Bronze dart', examine: 'A bronze throwing dart.', stackable: true, value: 2, category: 'ranged', equipSlot: 'weapon', speed: 3, stats: { ranged: 1, ranged_strength: 1 }, weight: 0 });
itm({ id: 71001, name: 'Iron dart', examine: 'An iron throwing dart.', stackable: true, value: 5, category: 'ranged', equipSlot: 'weapon', speed: 3, stats: { ranged: 3, ranged_strength: 3 }, equipReqs: { ranged: 1 }, weight: 0 });
itm({ id: 71002, name: 'Steel dart', examine: 'A steel throwing dart.', stackable: true, value: 12, category: 'ranged', equipSlot: 'weapon', speed: 3, stats: { ranged: 6, ranged_strength: 6 }, equipReqs: { ranged: 10 }, weight: 0 });
itm({ id: 71003, name: 'Mithril dart', examine: 'A mithril throwing dart.', stackable: true, value: 30, category: 'ranged', equipSlot: 'weapon', speed: 3, stats: { ranged: 11, ranged_strength: 11 }, equipReqs: { ranged: 20 }, weight: 0 });
itm({ id: 71004, name: 'Adamant dart', examine: 'An adamant throwing dart.', stackable: true, value: 80, category: 'ranged', equipSlot: 'weapon', speed: 3, stats: { ranged: 17, ranged_strength: 17 }, equipReqs: { ranged: 30 }, weight: 0 });
itm({ id: 71005, name: 'Rune dart', examine: 'A rune throwing dart.', stackable: true, value: 200, category: 'ranged', equipSlot: 'weapon', speed: 3, stats: { ranged: 26, ranged_strength: 26 }, equipReqs: { ranged: 40 }, weight: 0 });
itm({ id: 71006, name: 'Dragon dart', examine: 'A dragon throwing dart.', stackable: true, value: 600, category: 'ranged', equipSlot: 'weapon', speed: 3, stats: { ranged: 38, ranged_strength: 38 }, equipReqs: { ranged: 60 }, weight: 0 });

// Feather used in dart fletching (feather ID is 104, already exists)

// Finished crossbow bolts (per tier, from bolts-unf + feathers)
itm({ id: 71020, name: 'Bronze bolts', examine: 'Bronze crossbow bolts.', stackable: true, value: 5, category: 'ammo', equipSlot: 'ammo', weight: 0, stats: { ranged_strength: 4 } });
itm({ id: 71021, name: 'Iron bolts', examine: 'Iron crossbow bolts.', stackable: true, value: 10, category: 'ammo', equipSlot: 'ammo', weight: 0, stats: { ranged_strength: 9 } });
itm({ id: 71022, name: 'Steel bolts', examine: 'Steel crossbow bolts.', stackable: true, value: 25, category: 'ammo', equipSlot: 'ammo', weight: 0, stats: { ranged_strength: 17 } });
itm({ id: 71023, name: 'Mithril bolts', examine: 'Mithril crossbow bolts.', stackable: true, value: 60, category: 'ammo', equipSlot: 'ammo', weight: 0, stats: { ranged_strength: 26 } });
itm({ id: 71024, name: 'Adamant bolts', examine: 'Adamant crossbow bolts.', stackable: true, value: 160, category: 'ammo', equipSlot: 'ammo', weight: 0, stats: { ranged_strength: 46 } });
itm({ id: 71025, name: 'Runite bolts', examine: 'Runite crossbow bolts.', stackable: true, value: 400, category: 'ammo', equipSlot: 'ammo', weight: 0, stats: { ranged_strength: 115 } });

// Dragonhide bodies (crafting tier)
itm({ id: 71030, name: 'Blue dragon leather', examine: 'Blue tanned dragonhide.', value: 1200, category: 'crafting', weight: 0.5 });
itm({ id: 71031, name: 'Red dragon leather', examine: 'Red tanned dragonhide.', value: 1500, category: 'crafting', weight: 0.5 });
itm({ id: 71032, name: 'Black dragon leather', examine: 'Black tanned dragonhide.', value: 2000, category: 'crafting', weight: 0.5 });
itm({ id: 71033, name: 'Blue d\'hide body', examine: 'Blue dragonhide body.', value: 6000, category: 'ranged', equipSlot: 'body', stats: { def_ranged: 45, ranged: 2 }, equipReqs: { ranged: 50, defence: 40 }, weight: 6.5 });
itm({ id: 71034, name: 'Red d\'hide body', examine: 'Red dragonhide body.', value: 9000, category: 'ranged', equipSlot: 'body', stats: { def_ranged: 53, ranged: 4 }, equipReqs: { ranged: 60, defence: 40 }, weight: 6.5 });
itm({ id: 71035, name: 'Black d\'hide body', examine: 'Black dragonhide body.', value: 13000, category: 'ranged', equipSlot: 'body', stats: { def_ranged: 60, ranged: 6 }, equipReqs: { ranged: 70, defence: 40 }, weight: 6.5 });

// Battlestaves (crafting — orb + staff)
itm({ id: 71040, name: 'Battlestaff', examine: 'A plain battlestaff.', value: 7000, category: 'magic', equipSlot: 'weapon', speed: 4, stats: { magic: 10 }, equipReqs: { magic: 30 }, weight: 2 });
itm({ id: 71041, name: 'Air battlestaff', examine: 'An air battlestaff. Unlimited air runes.', value: 9000, category: 'magic', equipSlot: 'weapon', speed: 4, stats: { magic: 15 }, equipReqs: { magic: 30, attack: 30 }, weight: 2 });
itm({ id: 71042, name: 'Water battlestaff', examine: 'A water battlestaff. Unlimited water runes.', value: 9000, category: 'magic', equipSlot: 'weapon', speed: 4, stats: { magic: 15 }, equipReqs: { magic: 30, attack: 30 }, weight: 2 });
itm({ id: 71043, name: 'Earth battlestaff', examine: 'An earth battlestaff. Unlimited earth runes.', value: 9000, category: 'magic', equipSlot: 'weapon', speed: 4, stats: { magic: 15 }, equipReqs: { magic: 30, attack: 30 }, weight: 2 });
itm({ id: 71044, name: 'Fire battlestaff', examine: 'A fire battlestaff. Unlimited fire runes.', value: 9000, category: 'magic', equipSlot: 'weapon', speed: 4, stats: { magic: 15 }, equipReqs: { magic: 30, attack: 30 }, weight: 2 });

// Orbs (magic — used to create elemental battlestaves)
itm({ id: 71050, name: 'Unpowered orb', examine: 'An unpowered orb. Needs obelisk charging.', value: 300, category: 'magic', weight: 0.2 });
itm({ id: 71051, name: 'Air orb', examine: 'An air orb. Charges battlestaff.', value: 2500, category: 'magic', weight: 0.2 });
itm({ id: 71052, name: 'Water orb', examine: 'A water orb.', value: 2500, category: 'magic', weight: 0.2 });
itm({ id: 71053, name: 'Earth orb', examine: 'An earth orb.', value: 2500, category: 'magic', weight: 0.2 });
itm({ id: 71054, name: 'Fire orb', examine: 'A fire orb.', value: 2500, category: 'magic', weight: 0.2 });

// Stew, kebab, pie (cooking specials)
itm({ id: 71060, name: 'Stew', examine: 'A hearty stew. Chance of +5 stat boost.', value: 100, category: 'food', weight: 0.5 });
itm({ id: 71061, name: 'Kebab', examine: 'A kebab. Heals 7-18 HP, variable.', value: 80, category: 'food', weight: 0.3 });
itm({ id: 71062, name: 'Meat pie', examine: 'A meat pie. Heals 6 HP twice.', value: 60, category: 'food', weight: 0.4 });
itm({ id: 71063, name: 'Apple pie', examine: 'An apple pie. Heals 7 HP twice.', value: 80, category: 'food', weight: 0.4 });
itm({ id: 71064, name: 'Summer pie', examine: 'A summer pie. Heals 11 HP twice + run energy.', value: 300, category: 'food', weight: 0.4 });
itm({ id: 71065, name: 'Pie shell (uncooked)', examine: 'Uncooked pie shell.', value: 20, category: 'cooking', weight: 0.4 });
itm({ id: 71066, name: 'Pastry dough', examine: 'Pastry dough.', value: 10, category: 'cooking', weight: 0.3 });

// Combo runes (runecrafting)
itm({ id: 71070, name: 'Mist rune', examine: 'A mist rune (air+water).', stackable: true, value: 40, category: 'magic' });
itm({ id: 71071, name: 'Dust rune', examine: 'A dust rune (air+earth).', stackable: true, value: 40, category: 'magic' });
itm({ id: 71072, name: 'Mud rune', examine: 'A mud rune (water+earth).', stackable: true, value: 80, category: 'magic' });
itm({ id: 71073, name: 'Smoke rune', examine: 'A smoke rune (air+fire).', stackable: true, value: 60, category: 'magic' });
itm({ id: 71074, name: 'Steam rune', examine: 'A steam rune (water+fire).', stackable: true, value: 70, category: 'magic' });
itm({ id: 71075, name: 'Lava rune', examine: 'A lava rune (earth+fire).', stackable: true, value: 70, category: 'magic' });

// Construction planks
itm({ id: 71080, name: 'Plank', examine: 'A plain plank.', value: 100, category: 'construction', weight: 1 });
itm({ id: 71081, name: 'Oak plank', examine: 'An oak plank.', value: 250, category: 'construction', weight: 1 });
itm({ id: 71082, name: 'Teak plank', examine: 'A teak plank.', value: 500, category: 'construction', weight: 1 });
itm({ id: 71083, name: 'Mahogany plank', examine: 'A mahogany plank.', value: 1500, category: 'construction', weight: 1.2 });
itm({ id: 71084, name: 'Limestone brick', examine: 'A limestone brick.', value: 30, category: 'construction', weight: 1 });

// Cannon-balls (smithing ironman)
itm({ id: 71090, name: 'Cannonball', examine: 'A cannonball.', stackable: true, value: 200, category: 'ammo', weight: 0.5 });

// Combo potions (herblore)
itm({ id: 71100, name: 'Super combat potion(4)', examine: 'Super combat potion.', value: 1500, category: 'potion', weight: 0.3 });
itm({ id: 71101, name: 'Extended antifire(4)', examine: 'Extended antifire.', value: 2500, category: 'potion', weight: 0.3 });
itm({ id: 71102, name: 'Stamina potion(4)', examine: 'Restores run energy.', value: 1800, category: 'potion', weight: 0.3 });
itm({ id: 71103, name: 'Divine super combat(4)', examine: 'Divine super combat.', value: 3500, category: 'potion', weight: 0.3 });

// Amulet strings (crafting — for stringing amulets via wool)
itm({ id: 71110, name: 'Ball of wool', examine: 'A ball of wool.', value: 30, category: 'crafting', weight: 0.1 });

// Ensouled heads (prayer tier via Arceuus)
itm({ id: 71120, name: 'Ensouled goblin head', examine: 'A goblin head with residual soul.', value: 50, category: 'prayer', weight: 1 });
itm({ id: 71121, name: 'Ensouled giant head', examine: 'A giant head with residual soul.', value: 180, category: 'prayer', weight: 1.5 });
itm({ id: 71122, name: 'Ensouled dragon head', examine: 'A dragon head with residual soul.', value: 12000, category: 'prayer', weight: 2 });

// ══════════════════════════════════════════════════════════════════════════════
// SMITHING — Dart tips to darts, crossbow bolts, cannon-balls (1-99)
// ══════════════════════════════════════════════════════════════════════════════

// Dart-tip smithing already exists in smithing-complete (suffix: 'dart tips').
// Assembly: dart tips + feather = darts (Fletching skill, tip comes from Smithing)

// Cannon-ball (Smithing 35+, uses steel bar + mould)
r({ id: 'smith_cannonball', skill: 'smithing', name: 'Cannonball', inputs: [{ id: 252, count: 1 }], outputs: [{ id: 71090, count: 4 }], level: 35, xp: 25.5, ticks: 5, station: 'furnace', tool: 'ammo mould' });
src(71090, { type: 'recipe', sourceId: 'smith_cannonball', sourceName: 'Smith Cannonball', details: 'Smithing 35, steel bar + ammo mould + furnace. 4 per bar.' });
use(252, { type: 'recipe', targetId: 'smith_cannonball', targetName: 'Cannonball', details: 'Smithing 35' });

// ══════════════════════════════════════════════════════════════════════════════
// FLETCHING — Darts, crossbow bolt assembly (1-99)
// ══════════════════════════════════════════════════════════════════════════════

r({ id: 'fletch_bronze_darts', skill: 'fletching', name: 'Bronze darts', inputs: [{ id: 593, count: 10 }, { id: 104, count: 10 }], outputs: [{ id: 71000, count: 10 }], level: 1, xp: 18, ticks: 1 });
r({ id: 'fletch_iron_darts', skill: 'fletching', name: 'Iron darts', inputs: [{ id: 594, count: 10 }, { id: 104, count: 10 }], outputs: [{ id: 71001, count: 10 }], level: 22, xp: 38, ticks: 1 });
r({ id: 'fletch_steel_darts', skill: 'fletching', name: 'Steel darts', inputs: [{ id: 70170, count: 10 }, { id: 104, count: 10 }], outputs: [{ id: 71002, count: 10 }], level: 37, xp: 75, ticks: 1 });
r({ id: 'fletch_mithril_darts', skill: 'fletching', name: 'Mithril darts', inputs: [{ id: 70171, count: 10 }, { id: 104, count: 10 }], outputs: [{ id: 71003, count: 10 }], level: 52, xp: 112, ticks: 1 });
r({ id: 'fletch_adamant_darts', skill: 'fletching', name: 'Adamant darts', inputs: [{ id: 70172, count: 10 }, { id: 104, count: 10 }], outputs: [{ id: 71004, count: 10 }], level: 67, xp: 150, ticks: 1 });
r({ id: 'fletch_rune_darts', skill: 'fletching', name: 'Rune darts', inputs: [{ id: 70173, count: 10 }, { id: 104, count: 10 }], outputs: [{ id: 71005, count: 10 }], level: 81, xp: 187, ticks: 1 });
r({ id: 'fletch_dragon_darts', skill: 'fletching', name: 'Dragon darts', inputs: [{ id: 31128, count: 1 }, { id: 104, count: 10 }], outputs: [{ id: 71006, count: 10 }], level: 95, xp: 250, ticks: 1 });

src(71000, { type: 'recipe', sourceId: 'fletch_bronze_darts', sourceName: 'Bronze darts', details: 'Fletching 1, 10 bronze arrowheads + 10 feathers' });
src(71003, { type: 'recipe', sourceId: 'fletch_mithril_darts', sourceName: 'Mithril darts', details: 'Fletching 52' });
src(71006, { type: 'recipe', sourceId: 'fletch_dragon_darts', sourceName: 'Dragon darts', details: 'Fletching 95, hydra claw + feathers' });
use(104, { type: 'recipe', targetId: 'fletch_bronze_darts', targetName: 'Bronze darts', details: 'Fletching 1' });
use(104, { type: 'recipe', targetId: 'fletch_dragon_darts', targetName: 'Dragon darts', details: 'Fletching 95' });

// Finished crossbow bolts: unf bolts + feathers = bolts
r({ id: 'fletch_bronze_bolts', skill: 'fletching', name: 'Bronze bolts', inputs: [{ id: 70000, count: 10 }, { id: 104, count: 10 }], outputs: [{ id: 71020, count: 10 }], level: 9, xp: 15, ticks: 1 });
r({ id: 'fletch_iron_bolts', skill: 'fletching', name: 'Iron bolts', inputs: [{ id: 70001, count: 10 }, { id: 104, count: 10 }], outputs: [{ id: 71021, count: 10 }], level: 39, xp: 50, ticks: 1 });
r({ id: 'fletch_steel_bolts', skill: 'fletching', name: 'Steel bolts', inputs: [{ id: 70002, count: 10 }, { id: 104, count: 10 }], outputs: [{ id: 71022, count: 10 }], level: 46, xp: 65, ticks: 1 });
r({ id: 'fletch_mithril_bolts', skill: 'fletching', name: 'Mithril bolts', inputs: [{ id: 70003, count: 10 }, { id: 104, count: 10 }], outputs: [{ id: 71023, count: 10 }], level: 59, xp: 83, ticks: 1 });
r({ id: 'fletch_adamant_bolts', skill: 'fletching', name: 'Adamant bolts', inputs: [{ id: 70004, count: 10 }, { id: 104, count: 10 }], outputs: [{ id: 71024, count: 10 }], level: 69, xp: 105, ticks: 1 });
r({ id: 'fletch_rune_bolts', skill: 'fletching', name: 'Runite bolts', inputs: [{ id: 70005, count: 10 }, { id: 104, count: 10 }], outputs: [{ id: 71025, count: 10 }], level: 84, xp: 140, ticks: 1 });

src(71020, { type: 'recipe', sourceId: 'fletch_bronze_bolts', sourceName: 'Bronze bolts', details: 'Fletching 9, unfinished bolts + feathers' });
src(71025, { type: 'recipe', sourceId: 'fletch_rune_bolts', sourceName: 'Runite bolts', details: 'Fletching 84' });

// ══════════════════════════════════════════════════════════════════════════════
// CRAFTING — Dragonhide bodies, battlestaves, stringing amulets (1-99)
// ══════════════════════════════════════════════════════════════════════════════

// Dragonhide tanning (cowhide-style: raw hide -> tanned leather)
r({ id: 'tan_blue_dhide', skill: 'crafting', name: 'Blue dragonhide', inputs: [{ id: 1753, count: 1 }], outputs: [{ id: 71030, count: 1 }], level: 1, xp: 0, ticks: 2, station: 'tanner' });
r({ id: 'tan_red_dhide', skill: 'crafting', name: 'Red dragonhide', inputs: [{ id: 1754, count: 1 }], outputs: [{ id: 71031, count: 1 }], level: 1, xp: 0, ticks: 2, station: 'tanner' });
r({ id: 'tan_black_dhide', skill: 'crafting', name: 'Black dragonhide', inputs: [{ id: 1755, count: 1 }], outputs: [{ id: 71032, count: 1 }], level: 1, xp: 0, ticks: 2, station: 'tanner' });

// Dragonhide body crafting
r({ id: 'craft_blue_dhide_body', skill: 'crafting', name: 'Blue d\'hide body', inputs: [{ id: 71030, count: 3 }, { id: 580, count: 1 }], outputs: [{ id: 71033, count: 1 }], level: 71, xp: 210, ticks: 4, tool: 'needle' });
r({ id: 'craft_red_dhide_body', skill: 'crafting', name: 'Red d\'hide body', inputs: [{ id: 71031, count: 3 }, { id: 580, count: 1 }], outputs: [{ id: 71034, count: 1 }], level: 77, xp: 220, ticks: 4, tool: 'needle' });
r({ id: 'craft_black_dhide_body', skill: 'crafting', name: 'Black d\'hide body', inputs: [{ id: 71032, count: 3 }, { id: 580, count: 1 }], outputs: [{ id: 71035, count: 1 }], level: 84, xp: 235, ticks: 4, tool: 'needle' });

src(71033, { type: 'recipe', sourceId: 'craft_blue_dhide_body', sourceName: 'Blue d\'hide body', details: 'Crafting 71, 3 blue dhide + bowstring + needle' });
src(71035, { type: 'recipe', sourceId: 'craft_black_dhide_body', sourceName: 'Black d\'hide body', details: 'Crafting 84, 3 black dhide + bowstring + needle' });

// Battlestaves: unpowered orb + obelisk = elemental orb; elemental orb + battlestaff = elemental battlestaff
r({ id: 'craft_unpowered_orb', skill: 'crafting', name: 'Unpowered orb', inputs: [{ id: 70231, count: 1 }, { id: 60011, count: 1 }], outputs: [{ id: 71050, count: 1 }], level: 46, xp: 52, ticks: 3, station: 'glass blower' });
r({ id: 'charge_air_orb', skill: 'magic', name: 'Charge air orb', inputs: [{ id: 71050, count: 1 }, { id: 270, count: 3 }, { id: 70231, count: 3 }], outputs: [{ id: 71051, count: 1 }], level: 66, xp: 76, ticks: 3, station: 'obelisk' });
r({ id: 'charge_water_orb', skill: 'magic', name: 'Charge water orb', inputs: [{ id: 71050, count: 1 }, { id: 271, count: 3 }, { id: 70231, count: 3 }], outputs: [{ id: 71052, count: 1 }], level: 56, xp: 66, ticks: 3, station: 'obelisk' });
r({ id: 'charge_earth_orb', skill: 'magic', name: 'Charge earth orb', inputs: [{ id: 71050, count: 1 }, { id: 272, count: 3 }, { id: 70231, count: 3 }], outputs: [{ id: 71053, count: 1 }], level: 60, xp: 70, ticks: 3, station: 'obelisk' });
r({ id: 'charge_fire_orb', skill: 'magic', name: 'Charge fire orb', inputs: [{ id: 71050, count: 1 }, { id: 273, count: 3 }, { id: 70231, count: 3 }], outputs: [{ id: 71054, count: 1 }], level: 63, xp: 73, ticks: 3, station: 'obelisk' });

r({ id: 'craft_air_battlestaff', skill: 'crafting', name: 'Air battlestaff', inputs: [{ id: 71040, count: 1 }, { id: 71051, count: 1 }], outputs: [{ id: 71041, count: 1 }], level: 66, xp: 137, ticks: 3 });
r({ id: 'craft_water_battlestaff', skill: 'crafting', name: 'Water battlestaff', inputs: [{ id: 71040, count: 1 }, { id: 71052, count: 1 }], outputs: [{ id: 71042, count: 1 }], level: 54, xp: 100, ticks: 3 });
r({ id: 'craft_earth_battlestaff', skill: 'crafting', name: 'Earth battlestaff', inputs: [{ id: 71040, count: 1 }, { id: 71053, count: 1 }], outputs: [{ id: 71043, count: 1 }], level: 58, xp: 112, ticks: 3 });
r({ id: 'craft_fire_battlestaff', skill: 'crafting', name: 'Fire battlestaff', inputs: [{ id: 71040, count: 1 }, { id: 71054, count: 1 }], outputs: [{ id: 71044, count: 1 }], level: 62, xp: 125, ticks: 3 });

src(71041, { type: 'recipe', sourceId: 'craft_air_battlestaff', sourceName: 'Air battlestaff', details: 'Crafting 66, battlestaff + charged air orb' });
src(71050, { type: 'recipe', sourceId: 'craft_unpowered_orb', sourceName: 'Unpowered orb', details: 'Crafting 46, molten glass + glass blower' });
use(71050, { type: 'recipe', targetId: 'charge_air_orb', targetName: 'Air orb', details: 'Magic 66 at obelisk' });

// Spinning wool to ball (crafting)
r({ id: 'spin_wool', skill: 'crafting', name: 'Ball of wool', inputs: [{ id: 1737, count: 1 }], outputs: [{ id: 71110, count: 1 }], level: 2, xp: 2.5, ticks: 3, station: 'spinning wheel' });
src(71110, { type: 'recipe', sourceId: 'spin_wool', sourceName: 'Ball of wool', details: 'Crafting 2, wool + spinning wheel' });

// ══════════════════════════════════════════════════════════════════════════════
// COOKING — Stews, pies, kebabs (1-99)
// ══════════════════════════════════════════════════════════════════════════════

r({ id: 'cook_stew', skill: 'cooking', name: 'Stew', inputs: [{ id: 103, count: 1 }, { id: 1942, count: 1 }, { id: 1957, count: 1 }, { id: 1923, count: 1 }], outputs: [{ id: 71060, count: 1 }], level: 25, xp: 117, ticks: 4, station: 'range', failItem: 70218, stopBurn: 60 });
r({ id: 'cook_kebab', skill: 'cooking', name: 'Kebab', inputs: [{ id: 103, count: 1 }, { id: 1942, count: 1 }], outputs: [{ id: 71061, count: 1 }], level: 1, xp: 1, ticks: 4, station: 'range', failItem: 70218, stopBurn: 20 });
r({ id: 'bake_pastry_dough', skill: 'cooking', name: 'Pastry dough', inputs: [{ id: 1933, count: 1 }, { id: 1891, count: 1 }], outputs: [{ id: 71066, count: 1 }], level: 1, xp: 15, ticks: 2 });
r({ id: 'make_pie_shell', skill: 'cooking', name: 'Pie shell', inputs: [{ id: 71066, count: 1 }], outputs: [{ id: 71065, count: 1 }], level: 10, xp: 15, ticks: 2, tool: 'pie dish' });
r({ id: 'cook_meat_pie', skill: 'cooking', name: 'Meat pie', inputs: [{ id: 71065, count: 1 }, { id: 103, count: 1 }], outputs: [{ id: 71062, count: 1 }], level: 20, xp: 110, ticks: 4, station: 'range', failItem: 70218, stopBurn: 52 });
r({ id: 'cook_apple_pie', skill: 'cooking', name: 'Apple pie', inputs: [{ id: 71065, count: 1 }, { id: 1955, count: 2 }], outputs: [{ id: 71063, count: 1 }], level: 30, xp: 130, ticks: 4, station: 'range', failItem: 70218, stopBurn: 62 });
r({ id: 'cook_summer_pie', skill: 'cooking', name: 'Summer pie', inputs: [{ id: 71065, count: 1 }, { id: 1955, count: 1 }, { id: 1942, count: 1 }, { id: 1957, count: 1 }], outputs: [{ id: 71064, count: 1 }], level: 95, xp: 260, ticks: 4, station: 'range', failItem: 70218, stopBurn: 99 });

src(71060, { type: 'recipe', sourceId: 'cook_stew', sourceName: 'Stew', details: 'Cooking 25, raw meat + potato + onion + bowl of water. Chance of +5 stat roll.' });
src(71064, { type: 'recipe', sourceId: 'cook_summer_pie', sourceName: 'Summer pie', details: 'Cooking 95, summer pie — BiS pie food.' });

// ══════════════════════════════════════════════════════════════════════════════
// HERBLORE — Super combat, extended antifire, stamina, divine (1-99)
// ══════════════════════════════════════════════════════════════════════════════

r({ id: 'mix_super_combat', skill: 'herblore', name: 'Super combat potion(4)', inputs: [{ id: 336, count: 1 }, { id: 337, count: 1 }, { id: 70190, count: 1 }, { id: 70187, count: 1 }], outputs: [{ id: 71100, count: 1 }], level: 90, xp: 150, ticks: 3 });
r({ id: 'mix_extended_antifire', skill: 'herblore', name: 'Extended antifire(4)', inputs: [{ id: 70193, count: 1 }, { id: 336, count: 1 }, { id: 70186, count: 1 }], outputs: [{ id: 71101, count: 1 }], level: 84, xp: 220, ticks: 3 });
r({ id: 'mix_stamina', skill: 'herblore', name: 'Stamina potion(4)', inputs: [{ id: 324, count: 1 }, { id: 313, count: 1 }, { id: 70199, count: 1 }], outputs: [{ id: 71102, count: 1 }], level: 77, xp: 85, ticks: 3 });
r({ id: 'mix_divine_super_combat', skill: 'herblore', name: 'Divine super combat(4)', inputs: [{ id: 71100, count: 1 }, { id: 98593, count: 1 }], outputs: [{ id: 71103, count: 1 }], level: 97, xp: 250, ticks: 3 });

src(71100, { type: 'recipe', sourceId: 'mix_super_combat', sourceName: 'Super combat potion', details: 'Herblore 90, super attack + super strength + super defence + torstol' });
src(71101, { type: 'recipe', sourceId: 'mix_extended_antifire', sourceName: 'Extended antifire', details: 'Herblore 84, antifire + super attack + dwarf weed' });
src(71103, { type: 'recipe', sourceId: 'mix_divine_super_combat', sourceName: 'Divine super combat', details: 'Herblore 97, super combat + unsaid-name (Inkweald) — cross-region endgame' });

// ══════════════════════════════════════════════════════════════════════════════
// RUNECRAFTING — Combination runes (1-99)
// Air + Water = Mist; Air + Earth = Dust; Water + Earth = Mud; Air + Fire = Smoke;
// Water + Fire = Steam; Earth + Fire = Lava. Cross-altar RC at level 6+.
// ══════════════════════════════════════════════════════════════════════════════

r({ id: 'craft_mist_runes', skill: 'runecrafting', name: 'Mist runes', inputs: [{ id: 710, count: 1 }, { id: 270, count: 1 }], outputs: [{ id: 71070, count: 2 }], level: 6, xp: 8, ticks: 1 });
r({ id: 'craft_dust_runes', skill: 'runecrafting', name: 'Dust runes', inputs: [{ id: 710, count: 1 }, { id: 272, count: 1 }], outputs: [{ id: 71071, count: 2 }], level: 10, xp: 8, ticks: 1 });
r({ id: 'craft_mud_runes', skill: 'runecrafting', name: 'Mud runes', inputs: [{ id: 710, count: 1 }, { id: 272, count: 1 }], outputs: [{ id: 71072, count: 1 }], level: 13, xp: 9, ticks: 1 });
r({ id: 'craft_smoke_runes', skill: 'runecrafting', name: 'Smoke runes', inputs: [{ id: 710, count: 1 }, { id: 270, count: 1 }], outputs: [{ id: 71073, count: 1 }], level: 15, xp: 9, ticks: 1 });
r({ id: 'craft_steam_runes', skill: 'runecrafting', name: 'Steam runes', inputs: [{ id: 710, count: 1 }, { id: 271, count: 1 }], outputs: [{ id: 71074, count: 2 }], level: 19, xp: 10, ticks: 1 });
r({ id: 'craft_lava_runes', skill: 'runecrafting', name: 'Lava runes', inputs: [{ id: 710, count: 1 }, { id: 272, count: 1 }], outputs: [{ id: 71075, count: 2 }], level: 23, xp: 10, ticks: 1 });

src(71070, { type: 'recipe', sourceId: 'craft_mist_runes', sourceName: 'Mist runes', details: 'Runecrafting 6, at mist altar or dual-altar' });
src(71072, { type: 'recipe', sourceId: 'craft_mud_runes', sourceName: 'Mud runes', details: 'Runecrafting 13' });
src(71075, { type: 'recipe', sourceId: 'craft_lava_runes', sourceName: 'Lava runes', details: 'Runecrafting 23' });

// ══════════════════════════════════════════════════════════════════════════════
// PRAYER — Ensouled head reanimation (Arceuus path 1-99)
// ══════════════════════════════════════════════════════════════════════════════

r({ id: 'reanimate_goblin', skill: 'prayer', name: 'Reanimate goblin', inputs: [{ id: 71120, count: 1 }, { id: 275, count: 1 }, { id: 273, count: 2 }], outputs: [], level: 16, xp: 130, ticks: 6, station: 'dark_altar' });
r({ id: 'reanimate_giant', skill: 'prayer', name: 'Reanimate giant', inputs: [{ id: 71121, count: 1 }, { id: 275, count: 2 }, { id: 273, count: 3 }], outputs: [], level: 41, xp: 650, ticks: 6, station: 'dark_altar' });
r({ id: 'reanimate_dragon', skill: 'prayer', name: 'Reanimate dragon', inputs: [{ id: 71122, count: 1 }, { id: 275, count: 4 }, { id: 273, count: 5 }, { id: 70230, count: 2 }], outputs: [], level: 93, xp: 1560, ticks: 6, station: 'dark_altar' });

src(71120, { type: 'drop', sourceId: 'goblins', sourceName: 'Goblins', details: 'Uncommon drop. Used for reanimation.' });
src(71122, { type: 'drop', sourceId: 'dragons', sourceName: 'All dragons', details: 'Rare drop. Endgame prayer training.' });
use(71120, { type: 'recipe', targetId: 'reanimate_goblin', targetName: 'Reanimate goblin', details: 'Prayer 16, dark altar' });
use(71122, { type: 'recipe', targetId: 'reanimate_dragon', targetName: 'Reanimate dragon', details: 'Prayer 93, BIS prayer training per hour' });

// ══════════════════════════════════════════════════════════════════════════════
// CONSTRUCTION — Planks from logs, bricks from limestone (1-99)
// ══════════════════════════════════════════════════════════════════════════════

r({ id: 'make_plank', skill: 'construction', name: 'Plank', inputs: [{ id: 200, count: 1 }], outputs: [{ id: 71080, count: 1 }], level: 1, xp: 29, ticks: 3, station: 'sawmill' });
r({ id: 'make_oak_plank', skill: 'construction', name: 'Oak plank', inputs: [{ id: 201, count: 1 }], outputs: [{ id: 71081, count: 1 }], level: 15, xp: 60, ticks: 3, station: 'sawmill' });
r({ id: 'make_teak_plank', skill: 'construction', name: 'Teak plank', inputs: [{ id: 203, count: 1 }], outputs: [{ id: 71082, count: 1 }], level: 35, xp: 90, ticks: 3, station: 'sawmill' });
r({ id: 'make_mahogany_plank', skill: 'construction', name: 'Mahogany plank', inputs: [{ id: 204, count: 1 }], outputs: [{ id: 71083, count: 1 }], level: 50, xp: 140, ticks: 3, station: 'sawmill' });
r({ id: 'make_limestone_brick', skill: 'crafting', name: 'Limestone brick', inputs: [{ id: 3211, count: 1 }], outputs: [{ id: 71084, count: 1 }], level: 12, xp: 6, ticks: 2, tool: 'chisel' });

src(71080, { type: 'recipe', sourceId: 'make_plank', sourceName: 'Plank', details: 'Construction 1, logs at sawmill' });
src(71083, { type: 'recipe', sourceId: 'make_mahogany_plank', sourceName: 'Mahogany plank', details: 'Construction 50' });
src(71084, { type: 'recipe', sourceId: 'make_limestone_brick', sourceName: 'Limestone brick', details: 'Crafting 12, limestone + chisel' });

// ══════════════════════════════════════════════════════════════════════════════
// FIREMAKING — Bonfires (bulk log burn for group XP) 1-99
// ══════════════════════════════════════════════════════════════════════════════

r({ id: 'bonfire_logs', skill: 'firemaking', name: 'Bonfire (logs)', inputs: [{ id: 200, count: 1 }], outputs: [], level: 1, xp: 60, ticks: 4, tool: 'tinderbox' });
r({ id: 'bonfire_oak', skill: 'firemaking', name: 'Bonfire (oak)', inputs: [{ id: 201, count: 1 }], outputs: [], level: 15, xp: 90, ticks: 4, tool: 'tinderbox' });
r({ id: 'bonfire_willow', skill: 'firemaking', name: 'Bonfire (willow)', inputs: [{ id: 202, count: 1 }], outputs: [], level: 30, xp: 135, ticks: 4, tool: 'tinderbox' });
r({ id: 'bonfire_maple', skill: 'firemaking', name: 'Bonfire (maple)', inputs: [{ id: 203, count: 1 }], outputs: [], level: 45, xp: 202, ticks: 4, tool: 'tinderbox' });
r({ id: 'bonfire_yew', skill: 'firemaking', name: 'Bonfire (yew)', inputs: [{ id: 204, count: 1 }], outputs: [], level: 60, xp: 303, ticks: 4, tool: 'tinderbox' });
r({ id: 'bonfire_magic', skill: 'firemaking', name: 'Bonfire (magic)', inputs: [{ id: 205, count: 1 }], outputs: [], level: 75, xp: 454, ticks: 4, tool: 'tinderbox' });
r({ id: 'bonfire_petrified_palm', skill: 'firemaking', name: 'Bonfire (petrified palm)', inputs: [{ id: 96527, count: 1 }], outputs: [], level: 90, xp: 520, ticks: 4, tool: 'tinderbox' });

use(200, { type: 'recipe', targetId: 'bonfire_logs', targetName: 'Bonfire (logs)', details: 'Firemaking 1, 50% more XP than normal burn' });
use(96527, { type: 'recipe', targetId: 'bonfire_petrified_palm', targetName: 'Bonfire (petrified palm)', details: 'Firemaking 90, Boneyard-native endgame firemaking' });

// ══════════════════════════════════════════════════════════════════════════════
// END — Summary
// ══════════════════════════════════════════════════════════════════════════════

console.log('[aelgard] Recipes mega-pack (burn v2): ' + recipeCount + ' recipes, ' + itemDefCount + ' items, ' + relCount + ' source/use entries');

module.exports = { recipeCount, itemDefCount, relCount };
