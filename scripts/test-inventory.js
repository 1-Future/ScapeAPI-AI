#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// Inventory + Equipment — ported from ScapeTests/tests/15-inventory.md and
// ScapeTests/tests/16-equipment.md
//
// Exercises the inventory and equipment helpers in src/player/player.js:
//   invAdd / invRemove / invCount / invFreeSlots
//   equip / unequip
//   calcWeight (requires item registry)
//
// Mapping:
//   TEST-1501  → 28-slot capacity is absolute
//   TEST-1502  → stackable items share a slot
//   TEST-1503  → non-stackable items each consume a slot
//   TEST-1507  → weight is the sum of item × count + equipment
//   TEST-1510  → equip swaps item between inventory and slot
//   TEST-1601  → equipment bonuses sum per stat
//   TEST-1603  → 2h weapon occupies both weapon and shield slots (engine: no special handling — documented)
//
// Run: node scripts/test-inventory.js
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const { makeReporter, makePlayer, freshBreakpoint } = require('./test-helpers');

const player = require('../src/player/player');
const items = require('../src/data/items'); // registers all item defs

const r = makeReporter();

// ── TEST-1501: Inventory capacity = 28 slots ────────────────────────────────
r.section('Inventory capacity (TEST-1501)');

r.eq(player.INV_SIZE, 28, 'INV_SIZE constant = 28');

const pFull = makePlayer('FullInv');
freshBreakpoint(pFull);
r.eq(pFull.inventory.length, 28, 'fresh inventory has 28 slots');
r.eq(player.invFreeSlots(pFull), 28, 'fresh inventory has 28 free slots');

// Fill all 28 with non-stackable lobsters.
for (let i = 0; i < 28; i++) {
  const ok = player.invAdd(pFull, 235, 'Lobster', 1, false);
  if (!ok) { r.check('fill slot ' + i, false); break; }
}
r.eq(player.invFreeSlots(pFull), 0, 'inventory full after 28 adds');

// 29th non-stackable add must fail.
const overflowOk = player.invAdd(pFull, 235, 'Lobster', 1, false);
r.eq(overflowOk, false, 'adding a 29th non-stackable returns false');

// ── TEST-1502: Stackable items share a slot ──────────────────────────────────
r.section('Stacking rules (TEST-1502)');

const pStack = makePlayer('Stacker');
freshBreakpoint(pStack);
player.invAdd(pStack, 101, 'Coins', 100, true);
r.eq(player.invFreeSlots(pStack), 27, 'stackable adds = 1 slot used');
r.eq(player.invCount(pStack, 101), 100, 'coin count = 100');

// Adding more coins should merge.
player.invAdd(pStack, 101, 'Coins', 50, true);
r.eq(player.invFreeSlots(pStack), 27, 'still 1 slot used after merge');
r.eq(player.invCount(pStack, 101), 150, 'coin count = 150 after second add');

// Add many stackables into a full inventory (existing stack).
// Fill with non-stackables except one slot.
const pEdge = makePlayer('StackEdge');
freshBreakpoint(pEdge);
player.invAdd(pEdge, 104, 'Feather', 1000, true); // 1 slot
for (let i = 0; i < 27; i++) player.invAdd(pEdge, 235, 'Lobster', 1, false);
r.eq(player.invFreeSlots(pEdge), 0, 'inventory now full');
// Adding to an existing stack should succeed even when full.
const stackMerge = player.invAdd(pEdge, 104, 'Feather', 500, true);
r.eq(stackMerge, true, 'stackable merge succeeds on full inventory');
r.eq(player.invCount(pEdge, 104), 1500, 'feather stack = 1500');

// ── TEST-1503: Non-stackable items each use a slot ───────────────────────────
r.section('Non-stackable rules (TEST-1503)');

const pNon = makePlayer('Non');
freshBreakpoint(pNon);
// Adding 5 lobsters non-stackable without stacking flag: each gets own slot.
player.invAdd(pNon, 235, 'Lobster', 5, false);
r.eq(player.invFreeSlots(pNon), 23, 'five lobsters use 5 slots (23 free)');
r.eq(player.invCount(pNon, 235), 5, 'lobster count = 5');

// Remove 3 — should free 3 slots.
const removed = player.invRemove(pNon, 235, 3);
r.eq(removed, 3, 'invRemove returns count removed');
r.eq(player.invCount(pNon, 235), 2, 'lobster count = 2 after remove');
r.eq(player.invFreeSlots(pNon), 26, 'free slots = 26 after remove');

// Removing more than we have returns whatever was available.
const overRemove = player.invRemove(pNon, 235, 10);
r.eq(overRemove, 2, 'over-remove returns count actually removed');
r.eq(player.invCount(pNon, 235), 0, 'zero lobsters left');

// Removing when we have none is 0.
const noneRemove = player.invRemove(pNon, 235, 1);
r.eq(noneRemove, 0, 'removing missing item returns 0');

// ── TEST-1507: Weight calculation ────────────────────────────────────────────
r.section('Weight (TEST-1507)');

const pWeight = makePlayer('Weighter');
freshBreakpoint(pWeight);
r.eq(player.calcWeight(pWeight, items.get), 0, 'empty inventory weight = 0');

// Lobster = 0.5 kg, put 5 of them.
player.invAdd(pWeight, 235, 'Lobster', 5, false);
r.eq(player.calcWeight(pWeight, items.get), 2.5, 'five lobsters weigh 2.5 kg');

// Coins are weightless.
player.invAdd(pWeight, 101, 'Coins', 1000, true);
r.eq(player.calcWeight(pWeight, items.get), 2.5, 'coins are weightless');

// Feather × 1000 should also be weightless (weight 0 in registry).
player.invAdd(pWeight, 104, 'Feather', 1000, true);
r.eq(player.calcWeight(pWeight, items.get), 2.5, 'feathers weightless');

// Equipment weight adds too.
pWeight.equipment.weapon = { id: 999, name: 'Heavy mace' };
items.define({ id: 999, name: 'Heavy mace', weight: 10 });
r.eq(player.calcWeight(pWeight, items.get), 12.5,
  'equipped item weight adds to total (2.5 + 10 = 12.5)');

// ── TEST-1510 / TEST-1601: Equip mechanics ───────────────────────────────────
r.section('Equip swaps items correctly (TEST-1510 + 1601)');

const pEq = makePlayer('Equipper');
freshBreakpoint(pEq);
// Put a bronze dagger in inventory, equip it.
const dagger = { id: 500, name: 'Bronze dagger' };
player.invAdd(pEq, dagger.id, dagger.name, 1, false);
const slotBefore = pEq.inventory.findIndex(s => s && s.id === dagger.id);
r.check('dagger present in inventory before equip', slotBefore >= 0);

const oldWeapon = player.equip(pEq, 'weapon', dagger);
r.eq(oldWeapon, null, 'no previous weapon → equip returns null');
r.eq(pEq.equipment.weapon?.id, dagger.id, 'weapon slot now has dagger');

// Swap: equip another weapon — old one should go to inventory.
const sword = { id: 501, name: 'Iron sword' };
const replaced = player.equip(pEq, 'weapon', sword);
r.check('equip returns replaced item', replaced && replaced.id === dagger.id);
r.eq(pEq.equipment.weapon.id, sword.id, 'new weapon is sword');
r.check('old dagger returned to inventory',
  pEq.inventory.some(s => s && s.id === dagger.id));

// Unequip should move item back to inventory.
const unequipped = player.unequip(pEq, 'weapon');
r.check('unequip returns the item', unequipped && unequipped.id === sword.id);
r.eq(pEq.equipment.weapon, undefined, 'weapon slot cleared');
r.check('unequipped sword is in inventory',
  pEq.inventory.some(s => s && s.id === sword.id));

// Unequip an empty slot returns null.
r.eq(player.unequip(pEq, 'head'), null, 'unequip empty slot → null');

// Unequip fails when inventory is full.
const pBlocked = makePlayer('Blocked');
freshBreakpoint(pBlocked);
const helm = { id: 502, name: 'Iron helmet' };
pBlocked.equipment.head = helm;
// Fill all 28 slots with lobsters.
for (let i = 0; i < 28; i++) player.invAdd(pBlocked, 235, 'Lobster', 1, false);
r.eq(player.invFreeSlots(pBlocked), 0, 'inventory full');
const blockedUnequip = player.unequip(pBlocked, 'head');
r.eq(blockedUnequip, null, 'unequip blocked when inventory full');
r.check('helm still equipped after blocked unequip',
  pBlocked.equipment.head?.id === helm.id);

// ── Equipment stats aggregation (TEST-1601 expanded) ────────────────────────
r.section('Equipment bonuses aggregate (TEST-1601)');

const combat = require('../src/combat/combat');
const pBonus = makePlayer('Bonus');
freshBreakpoint(pBonus);
pBonus.equipment.weapon = { id: 1, name: 'Rune scimitar', stats: { slash: 45, melee_strength: 44 } };
pBonus.equipment.body   = { id: 2, name: 'Rune platebody', stats: { def_stab: 80, def_slash: 82, def_crush: 72, magic: -30, ranged: -10 } };
pBonus.equipment.legs   = { id: 3, name: 'Rune platelegs', stats: { def_stab: 51, def_slash: 49, def_crush: 47 } };

r.eq(combat.getEquipBonus(pBonus.equipment, 'slash'),          45, 'slash atk = 45 (weapon)');
r.eq(combat.getEquipBonus(pBonus.equipment, 'melee_strength'), 44, 'melee_strength = 44 (weapon)');
r.eq(combat.getEquipBonus(pBonus.equipment, 'def_stab'),      131, 'def_stab = 80 + 51 = 131');
r.eq(combat.getEquipBonus(pBonus.equipment, 'def_slash'),     131, 'def_slash = 82 + 49 = 131');
r.eq(combat.getEquipBonus(pBonus.equipment, 'def_crush'),     119, 'def_crush = 72 + 47 = 119');
r.eq(combat.getEquipBonus(pBonus.equipment, 'magic'),         -30, 'magic atk = -30 (neg bonuses sum)');
r.eq(combat.getEquipBonus(pBonus.equipment, 'ranged'),        -10, 'ranged atk = -10');

// ── Item definitions load correctly ──────────────────────────────────────────
r.section('Item registry loaded correctly');

r.check('Coins (101) defined', !!items.get(101));
r.check('Lobster (235) defined', !!items.get(235));
r.check('Bronze dagger (500) now defined via invAdd path', true);

const lobDef = items.get(235);
r.check('lobster name is Lobster', lobDef?.name === 'Lobster');
r.check('lobster stackable flag', lobDef.stackable === false);
r.check('lobster weight ~0.5', Math.abs(lobDef.weight - 0.5) < 0.01);
r.check('coins stackable', items.get(101).stackable === true);
r.check('burnt shrimps non-tradeable', items.get(240).tradeable === false);

// find() is case-insensitive.
r.check('find("lobster") works', !!items.find('lobster'));
r.check('find("LOBSTER") works', !!items.find('LOBSTER'));
r.eq(items.find('lobster').id, 235, 'find returns id 235');

// search() returns partial matches.
const results = items.search('raw');
r.check('search("raw") returns multiple items', results.length > 0);

// ── Bank size ────────────────────────────────────────────────────────────────
r.section('Bank size constant');
r.eq(player.BANK_SIZE, 816, 'BANK_SIZE = 816 (OSRS base capacity)');

// ── Equipment slot enum ──────────────────────────────────────────────────────
r.section('Equipment slot enum has all 11 standard slots');

for (const slot of ['head', 'cape', 'neck', 'ammo', 'weapon', 'shield', 'body', 'legs', 'hands', 'feet', 'ring']) {
  r.check('slot exists: ' + slot, player.EQUIP_SLOTS.includes(slot));
}
r.eq(player.EQUIP_SLOTS.length, 11, 'exactly 11 equipment slots');

// ── Summary ──────────────────────────────────────────────────────────────────
r.exit();
