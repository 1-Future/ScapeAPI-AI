#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// Prayer + Magic Runner tests — burn v2
//
// Covers the first-class prayer-runner and magic-runner modules:
//   * activate / deactivate / conflict resolution / drain / onTick
//   * getModifiers: protection prayers, on_death, on_low_hp, preserve
//   * applyProtectPrayers: PvM=100% block, PvP=40% block, Protect from Undead
//   * Retribution, Redemption, Smite mechanics
//   * Altar bonus XP (gilded 3.5x, ectofuntus 4x)
//   * castable/cast validation: level, runes, book, cooldown, ironman bans
//   * spellbook switching with quest gates (desert_treasure / lunar_diplomacy /
//     inkweald_dreamwalk)
//   * spell effect resolution (combat, teleport, enchant, alch, utility)
//   * Dream spellbook quartet (Inkweald)
//
// 60+ assertions. Runs under 2 seconds.
// Run: node scripts/test-prayer-magic.js
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const { makeReporter, makePlayer, freshBreakpoint } = require('./test-helpers');

// Silence the content-file console.log during require.
const origLog = console.log;
console.log = function () {};
require('../src/content/aelgard/prayer-expansion');
require('../src/content/aelgard/spellbooks');
console.log = origLog;

const player       = require('../src/player/player');
const combat       = require('../src/combat/combat');
const prayerRunner = require('../src/engine/prayer-runner');
const magicRunner  = require('../src/engine/magic-runner');

const r = makeReporter({ silentPass: true });

function fresh(name) {
  const p = makePlayer(name);
  freshBreakpoint(p);
  return p;
}

// ══════════════════════════════════════════════════════════════════════════════
// Prayer runner — activate / deactivate / conflicts
// ══════════════════════════════════════════════════════════════════════════════

r.section('prayer-runner: activation + level gates');

{
  const p = fresh('LowLevel');
  const res = prayerRunner.activate(p, 'piety');
  r.eq(res.ok, false, 'piety requires prayer level 70');
}

{
  const p = fresh('ProperLevel');
  player.addXp(p, 'prayer', player.xpForLevel(70));
  const res = prayerRunner.activate(p, 'piety');
  r.eq(res.ok, true, 'prayer 70 can activate piety');
  r.eq(prayerRunner.isActive(p, 'piety'), true, 'isActive after activate');
}

{
  const p = fresh('ZeroPoints');
  player.addXp(p, 'prayer', player.xpForLevel(70));
  p.prayerPoints = 0;
  const res = prayerRunner.activate(p, 'piety');
  r.eq(res.ok, false, 'cannot activate with 0 prayer points');
}

{
  const p = fresh('ToggleOff');
  player.addXp(p, 'prayer', player.xpForLevel(70));
  prayerRunner.activate(p, 'piety');
  const off = prayerRunner.activate(p, 'piety');
  r.eq(off.toggled, 'off', 'second activate toggles off');
  r.eq(prayerRunner.isActive(p, 'piety'), false, 'isActive false after toggle off');
}

{
  const p = fresh('Unknown');
  const res = prayerRunner.activate(p, 'not_a_real_prayer');
  r.eq(res.ok, false, 'unknown prayer id rejected');
}

r.section('prayer-runner: conflict resolution');

{
  const p = fresh('ProtMelee');
  player.addXp(p, 'prayer', player.xpForLevel(70));
  prayerRunner.activate(p, 'protect_from_melee');
  prayerRunner.activate(p, 'protect_from_magic');
  r.eq(prayerRunner.isActive(p, 'protect_from_melee'), false, 'protect melee removed on magic activate');
  r.eq(prayerRunner.isActive(p, 'protect_from_magic'), true, 'protect magic active');
}

{
  const p = fresh('RetribVsProtect');
  player.addXp(p, 'prayer', player.xpForLevel(70));
  prayerRunner.activate(p, 'retribution');
  prayerRunner.activate(p, 'protect_from_melee');
  r.eq(prayerRunner.isActive(p, 'retribution'), false, 'retribution cleared by protect_from_melee');
}

{
  const p = fresh('SmiteVsProtect');
  player.addXp(p, 'prayer', player.xpForLevel(70));
  prayerRunner.activate(p, 'smite');
  prayerRunner.activate(p, 'protect_from_magic');
  r.eq(prayerRunner.isActive(p, 'smite'), false, 'smite cleared by protect_from_magic');
}

r.section('prayer-runner: clear / listActive');

{
  const p = fresh('ClearAll');
  player.addXp(p, 'prayer', player.xpForLevel(70));
  prayerRunner.activate(p, 'piety');
  prayerRunner.activate(p, 'protect_from_melee');
  r.eq(prayerRunner.listActive(p).length, 2, 'two prayers active');
  const cleared = prayerRunner.clear(p);
  r.eq(cleared, 2, 'clear() returns count');
  r.eq(prayerRunner.listActive(p).length, 0, 'no prayers active after clear');
}

r.section('prayer-runner: drain + onTick');

{
  const p = fresh('Drain');
  player.addXp(p, 'prayer', player.xpForLevel(70));
  p.prayerPoints = 70;
  prayerRunner.activate(p, 'piety');
  const rate = prayerRunner.drainRate(p);
  r.check(rate > 0, 'drain rate > 0 with piety active');
  // 24 pts/min / 100 ticks = 0.24 per tick
  r.approx(rate, 0.24, 0.001, 'piety drain = 0.24 pts/tick');
}

{
  const p = fresh('DrainNone');
  r.eq(prayerRunner.drainRate(p), 0, 'no prayers → 0 drain');
}

{
  const p = fresh('DrainTicks');
  player.addXp(p, 'prayer', player.xpForLevel(70));
  p.prayerPoints = 70;
  prayerRunner.activate(p, 'piety'); // 0.24/tick
  // Drive 5 ticks → 1.2 points consumed → floor 1
  prayerRunner.onTick(p, 1);
  prayerRunner.onTick(p, 2);
  prayerRunner.onTick(p, 3);
  prayerRunner.onTick(p, 4);
  const before5 = p.prayerPoints;
  prayerRunner.onTick(p, 5);
  r.check(before5 >= 69, 'after 4 ticks still near full');
  r.check(p.prayerPoints < 70, 'onTick eventually reduces points');
}

{
  const p = fresh('DrainEmpty');
  player.addXp(p, 'prayer', player.xpForLevel(70));
  p.prayerPoints = 1;
  prayerRunner.activate(p, 'piety');
  // Run lots of ticks
  for (let i = 0; i < 20; i++) prayerRunner.onTick(p, i);
  r.eq(p.prayerPoints, 0, 'prayer points drain to 0');
  r.eq(prayerRunner.listActive(p).length, 0, 'empty points auto-disable all prayers');
}

// ══════════════════════════════════════════════════════════════════════════════
// Prayer runner — modifiers
// ══════════════════════════════════════════════════════════════════════════════

r.section('prayer-runner: getModifiers');

{
  const p = fresh('ModsBase');
  const m = prayerRunner.getModifiers(p);
  r.eq(m.accuracy_melee, 1.0, 'base accuracy_melee = 1');
  r.eq(m.damage_melee, 1.0, 'base damage_melee = 1');
  r.eq(m.protect_prayers.length, 0, 'no protect prayers active');
  r.eq(m.preserve, false, 'preserve false');
  r.eq(m.retribution, false, 'retribution false');
  r.eq(m.smite, false, 'smite false');
  r.eq(m.protect_item, false, 'protect_item false');
}

{
  const p = fresh('ModsProtect');
  player.addXp(p, 'prayer', player.xpForLevel(43));
  prayerRunner.activate(p, 'protect_from_melee');
  const m = prayerRunner.getModifiers(p);
  r.check(m.protect_prayers.indexOf('protect_from_melee') >= 0, 'protect_from_melee in protect_prayers');
}

{
  const p = fresh('ModsRetrib');
  player.addXp(p, 'prayer', player.xpForLevel(46));
  prayerRunner.activate(p, 'retribution');
  const m = prayerRunner.getModifiers(p);
  r.eq(m.retribution, true, 'retribution flag set');
  r.check(m.on_death.indexOf('retribution') >= 0, 'on_death contains retribution');
}

{
  const p = fresh('ModsRedemp');
  player.addXp(p, 'prayer', player.xpForLevel(49));
  prayerRunner.activate(p, 'redemption');
  const m = prayerRunner.getModifiers(p);
  r.eq(m.redemption, true, 'redemption flag set');
  r.check(m.on_low_hp.indexOf('redemption') >= 0, 'on_low_hp contains redemption');
}

{
  const p = fresh('ModsPreserve');
  player.addXp(p, 'prayer', player.xpForLevel(55));
  prayerRunner.activate(p, 'preserve');
  const m = prayerRunner.getModifiers(p);
  r.eq(m.preserve, true, 'preserve flag set');
}

// ══════════════════════════════════════════════════════════════════════════════
// Prayer runner — protect prayers damage reduction
// ══════════════════════════════════════════════════════════════════════════════

r.section('prayer-runner: applyProtectPrayers PvM/PvP');

{
  const p = fresh('PvMMelee');
  player.addXp(p, 'prayer', player.xpForLevel(43));
  prayerRunner.activate(p, 'protect_from_melee');
  const dmg = prayerRunner.applyProtectPrayers(p, 20, { style: 'melee', pvp: false });
  r.eq(dmg, 0, 'PvM protect_from_melee blocks 100%');
}

{
  const p = fresh('PvPMelee');
  player.addXp(p, 'prayer', player.xpForLevel(43));
  prayerRunner.activate(p, 'protect_from_melee');
  const dmg = prayerRunner.applyProtectPrayers(p, 20, { style: 'melee', pvp: true });
  r.eq(dmg, 12, 'PvP protect_from_melee reduces to 60%');
}

{
  const p = fresh('PvMRanged');
  player.addXp(p, 'prayer', player.xpForLevel(40));
  prayerRunner.activate(p, 'protect_from_missiles');
  const dmg = prayerRunner.applyProtectPrayers(p, 15, { style: 'ranged' });
  r.eq(dmg, 0, 'PvM protect_from_missiles blocks 100%');
}

{
  const p = fresh('PvMMagic');
  player.addXp(p, 'prayer', player.xpForLevel(37));
  prayerRunner.activate(p, 'protect_from_magic');
  const dmg = prayerRunner.applyProtectPrayers(p, 30, { style: 'magic' });
  r.eq(dmg, 0, 'PvM protect_from_magic blocks 100%');
}

{
  const p = fresh('ProtectUndead');
  player.addXp(p, 'prayer', player.xpForLevel(35));
  prayerRunner.activate(p, 'protect_from_undead');
  const dmg = prayerRunner.applyProtectPrayers(p, 10, { style: 'melee', attackerTags: ['undead'] });
  r.eq(dmg, 6, 'protect_from_undead: 40% damage reduction');
}

{
  const p = fresh('NoProtect');
  const dmg = prayerRunner.applyProtectPrayers(p, 20, { style: 'melee' });
  r.eq(dmg, 20, 'no protection prayer → no reduction');
}

// ══════════════════════════════════════════════════════════════════════════════
// Prayer runner — retribution / redemption / smite
// ══════════════════════════════════════════════════════════════════════════════

r.section('prayer-runner: retribution / redemption / smite');

{
  const p = fresh('Retrib');
  player.addXp(p, 'prayer', player.xpForLevel(80));
  prayerRunner.activate(p, 'retribution');
  const plan = prayerRunner.onPlayerDeath(p);
  r.check(plan && plan.type === 'retribution', 'retribution on death');
  r.check(plan.damage > 0, 'retribution damage > 0');
  r.eq(plan.damage, 20, 'retribution damage = 25% of 80 = 20');
}

{
  const p = fresh('NoRetrib');
  const plan = prayerRunner.onPlayerDeath(p);
  r.eq(plan, null, 'no retribution without prayer');
}

{
  const p = fresh('Redemp');
  player.addXp(p, 'prayer', player.xpForLevel(80));
  player.addXp(p, 'hitpoints', player.xpForLevel(99) - player.xpForLevel(10));
  prayerRunner.activate(p, 'redemption');
  p.hp = 5; // < 10% of 99
  const res = prayerRunner.checkRedemption(p);
  r.check(res && res.healed > 0, 'redemption heals below 10% HP');
  r.eq(res.healed, 20, 'redemption heal = 25% of 80 = 20');
  r.eq(p.prayerPoints, 0, 'redemption drains all prayer');
}

{
  const p = fresh('RedempNotLow');
  player.addXp(p, 'prayer', player.xpForLevel(80));
  player.addXp(p, 'hitpoints', player.xpForLevel(99) - player.xpForLevel(10));
  prayerRunner.activate(p, 'redemption');
  p.hp = 80; // not low
  const res = prayerRunner.checkRedemption(p);
  r.eq(res, null, 'redemption inactive above 10% HP');
}

{
  const atk = fresh('Smiter');
  const def = fresh('SmitedUpon');
  player.addXp(atk, 'prayer', player.xpForLevel(60));
  prayerRunner.activate(atk, 'smite');
  def.prayerPoints = 50;
  const drained = prayerRunner.applySmite(atk, def, 20);
  r.eq(drained, 5, 'smite drains 25% of damage (20 × 0.25 = 5)');
  r.eq(def.prayerPoints, 45, 'defender prayer points reduced by 5');
}

// ══════════════════════════════════════════════════════════════════════════════
// Prayer runner — altar / bury XP
// ══════════════════════════════════════════════════════════════════════════════

r.section('prayer-runner: altar multipliers');

r.eq(prayerRunner.altarMultiplier('regular'), 1.0, 'regular altar 1.0x');
r.eq(prayerRunner.altarMultiplier('gilded'), 3.5, 'gilded altar 3.5x');
r.eq(prayerRunner.altarMultiplier('chaos'), 3.5, 'chaos altar 3.5x');
r.eq(prayerRunner.altarMultiplier('ectofuntus'), 4.0, 'ectofuntus altar 4.0x');
r.eq(prayerRunner.altarMultiplier('unknown'), 1.0, 'unknown altar defaults to 1.0');

r.eq(prayerRunner.buryXp('Bones', 'regular'), 4.5, 'Bones regular = 4.5 XP');
r.eq(prayerRunner.buryXp('Dragon bones', 'gilded'), 252, 'Dragon bones gilded = 72 × 3.5 = 252');
r.eq(prayerRunner.buryXp('Big bones', 'ectofuntus'), 60, 'Big bones ectofuntus = 15 × 4 = 60');
r.eq(prayerRunner.buryXp('Superior dragon bones', 'gilded'), 525, 'Superior dragon bones gilded = 150 × 3.5 = 525');

// ══════════════════════════════════════════════════════════════════════════════
// Magic runner — castable validation
// ══════════════════════════════════════════════════════════════════════════════

r.section('magic-runner: castable validation');

{
  const p = fresh('MagicNew');
  const chk = magicRunner.castable(p, 'wind_strike');
  // Wind Strike needs level 1 + 1 air + 1 mind rune.
  r.eq(chk.ok, false, 'no runes → castable false');
  r.check(/runes/i.test(chk.reason), 'reason mentions runes');
}

{
  const p = fresh('MagicLevel');
  const chk = magicRunner.castable(p, 'fire_surge');
  r.eq(chk.ok, false, 'level 95 fire_surge blocked at lvl 1');
  r.check(/level/i.test(chk.reason), 'reason mentions level');
}

{
  const p = fresh('MagicUnknown');
  const chk = magicRunner.castable(p, 'not_a_spell');
  r.eq(chk.ok, false, 'unknown spell rejected');
}

{
  const p = fresh('MagicOK');
  // Grant runes
  p.inventory[0] = { id: 11350, name: 'Air rune', count: 100 };
  p.inventory[1] = { id: 11354, name: 'Mind rune', count: 100 };
  const chk = magicRunner.castable(p, 'wind_strike');
  r.eq(chk.ok, true, 'wind strike castable with runes at lvl 1');
}

r.section('magic-runner: hasRunes / removeRunes');

{
  const p = fresh('Runes');
  p.inventory[0] = { id: 11350, name: 'Air rune', count: 5 };
  p.inventory[1] = { id: 11354, name: 'Mind rune', count: 3 };
  r.eq(magicRunner.hasRunes(p, [{ id: 11350, count: 5 }]), true, 'has exactly enough air');
  r.eq(magicRunner.hasRunes(p, [{ id: 11350, count: 6 }]), false, 'not enough air');
  r.eq(magicRunner.hasRunes(p, [{ id: 11354, count: 3 }]), true, 'has exactly enough mind');
  magicRunner.removeRunes(p, [{ id: 11350, count: 5 }]);
  r.eq(magicRunner.hasRunes(p, [{ id: 11350, count: 1 }]), false, 'all air consumed');
}

// ══════════════════════════════════════════════════════════════════════════════
// Magic runner — cast + effect
// ══════════════════════════════════════════════════════════════════════════════

r.section('magic-runner: cast combat spell');

{
  const p = fresh('CastCombat');
  p.inventory[0] = { id: 11350, name: 'Air rune', count: 10 };
  p.inventory[1] = { id: 11354, name: 'Mind rune', count: 10 };
  const before = player.getXp(p, 'magic');
  const res = magicRunner.cast(p, 'wind_strike', null);
  r.eq(res.ok, true, 'wind_strike cast ok');
  r.check(res.result.kind === 'combat', 'result.kind = combat');
  r.check(res.result.maxHit === 2, 'wind_strike maxHit = 2');
  const after = player.getXp(p, 'magic');
  r.check(after > before, 'magic XP gained from cast');
}

{
  const p = fresh('CastRunesConsumed');
  p.inventory[0] = { id: 11350, name: 'Air rune', count: 1 };
  p.inventory[1] = { id: 11354, name: 'Mind rune', count: 1 };
  magicRunner.cast(p, 'wind_strike', null);
  const chk = magicRunner.castable(p, 'wind_strike');
  r.eq(chk.ok, false, 'second cast fails — runes consumed');
}

// ══════════════════════════════════════════════════════════════════════════════
// Magic runner — spellbook switching
// ══════════════════════════════════════════════════════════════════════════════

r.section('magic-runner: spellbook + gates');

{
  const p = fresh('BookInit');
  r.eq(magicRunner.currentBook(p), 'standard', 'default book = standard');
}

{
  const p = fresh('BookNoQuest');
  const res = magicRunner.setSpellbook(p, 'ancient');
  r.eq(res.ok, false, 'ancient blocked without desert_treasure');
  r.check(/desert_treasure/.test(res.reason), 'reason names desert_treasure quest');
}

{
  const p = fresh('BookWithQuest');
  p.questProgress = { desert_treasure: { complete: true } };
  const res = magicRunner.setSpellbook(p, 'ancient');
  r.eq(res.ok, true, 'ancient allowed with desert_treasure complete');
  r.eq(magicRunner.currentBook(p), 'ancient', 'current book = ancient');
}

{
  const p = fresh('BookLunar');
  p.questProgress = { lunar_diplomacy: { complete: true } };
  const res = magicRunner.setSpellbook(p, 'lunar');
  r.eq(res.ok, true, 'lunar allowed with lunar_diplomacy complete');
}

{
  const p = fresh('BookDream');
  p.questProgress = { inkweald_dreamwalk: { complete: true } };
  const res = magicRunner.setSpellbook(p, 'dream');
  r.eq(res.ok, true, 'dream allowed with inkweald_dreamwalk complete');
}

{
  const p = fresh('BookUnknown');
  const res = magicRunner.setSpellbook(p, 'blood');
  r.eq(res.ok, false, 'unknown book rejected');
}

r.section('magic-runner: spell must match current book');

{
  const p = fresh('WrongBook');
  p.inventory[0] = { id: 11351, name: 'Water rune', count: 10 };
  p.inventory[1] = { id: 11356, name: 'Chaos rune', count: 10 };
  p.inventory[2] = { id: 11357, name: 'Death rune', count: 10 };
  player.addXp(p, 'magic', player.xpForLevel(80));
  // Default spellbook = standard, so ice_rush (ancient) should be blocked
  const chk = magicRunner.castable(p, 'ice_rush');
  r.eq(chk.ok, false, 'ice_rush blocked when book=standard');
}

// ══════════════════════════════════════════════════════════════════════════════
// Magic runner — ironman restriction
// ══════════════════════════════════════════════════════════════════════════════

r.section('magic-runner: ironman restrictions');

{
  const p = fresh('IronTele');
  p.ironman = { variant: 'ironman' };
  p.inventory[0] = { id: 11363, name: 'Soul rune', count: 10 };
  p.inventory[1] = { id: 11360, name: 'Law rune', count: 10 };
  p.inventory[2] = { id: 11352, name: 'Earth rune', count: 10 };
  player.addXp(p, 'magic', player.xpForLevel(80));
  const chk = magicRunner.castable(p, 'tele_other_heartlands');
  r.eq(chk.ok, false, 'ironman blocked from tele_other');
  r.check(/Ironmen/i.test(chk.reason), 'reason explains ironman ban');
}

{
  const p = fresh('IronEnergy');
  p.ironman = { variant: 'ironman' };
  p.questProgress = { lunar_diplomacy: { complete: true } };
  magicRunner.setSpellbook(p, 'lunar');
  p.inventory[0] = { id: 11362, name: 'Astral rune', count: 10 };
  p.inventory[1] = { id: 11360, name: 'Law rune', count: 10 };
  p.inventory[2] = { id: 11359, name: 'Nature rune', count: 10 };
  player.addXp(p, 'magic', player.xpForLevel(95));
  const chk = magicRunner.castable(p, 'energy_transfer');
  r.eq(chk.ok, false, 'ironman blocked from energy_transfer');
}

{
  const p = fresh('NonIronTele');
  p.questProgress = {};
  p.inventory[0] = { id: 11363, name: 'Soul rune', count: 10 };
  p.inventory[1] = { id: 11360, name: 'Law rune', count: 10 };
  p.inventory[2] = { id: 11352, name: 'Earth rune', count: 10 };
  player.addXp(p, 'magic', player.xpForLevel(80));
  const chk = magicRunner.castable(p, 'tele_other_heartlands');
  r.eq(chk.ok, true, 'non-ironman can tele other');
}

// ══════════════════════════════════════════════════════════════════════════════
// Magic runner — alchemy + enchant
// ══════════════════════════════════════════════════════════════════════════════

r.section('magic-runner: alch');

{
  const p = fresh('AlchHi');
  p.inventory[0] = { id: 11353, name: 'Fire rune', count: 20 };
  p.inventory[1] = { id: 11359, name: 'Nature rune', count: 20 };
  p.inventory[2] = { id: 100, name: 'Bones', count: 1 };
  player.addXp(p, 'magic', player.xpForLevel(60));
  const res = magicRunner.alch(p, 100, 'hi');
  r.eq(res.ok, true, 'high alch cast ok');
  r.eq(res.mode, 'high_alchemy', 'mode = high_alchemy');
  r.check(res.coins >= 0, 'returns coin value');
}

{
  const p = fresh('AlchNoItem');
  p.inventory[0] = { id: 11353, name: 'Fire rune', count: 20 };
  p.inventory[1] = { id: 11359, name: 'Nature rune', count: 20 };
  player.addXp(p, 'magic', player.xpForLevel(60));
  const res = magicRunner.alch(p, 999999, 'hi');
  r.eq(res.ok, false, 'alch without target item fails');
}

r.section('magic-runner: enchant');

{
  const p = fresh('Enchant');
  p.inventory[0] = { id: 11351, name: 'Water rune', count: 20 };
  p.inventory[1] = { id: 11361, name: 'Cosmic rune', count: 20 };
  p.inventory[2] = { id: 100, name: 'Bones', count: 1 };
  player.addXp(p, 'magic', player.xpForLevel(20));
  const res = magicRunner.enchant(p, 'enchant_sapphire', 100);
  r.eq(res.ok, true, 'tier-1 enchant cast ok');
  r.eq(res.tier, 1, 'enchant_sapphire tier = 1');
}

// ══════════════════════════════════════════════════════════════════════════════
// Magic runner — dream spellbook (Inkweald)
// ══════════════════════════════════════════════════════════════════════════════

r.section('magic-runner: dream spellbook (Inkweald)');

{
  const p = fresh('DreamCast');
  p.questProgress = { inkweald_dreamwalk: { complete: true } };
  magicRunner.setSpellbook(p, 'dream');
  r.eq(magicRunner.currentBook(p), 'dream', 'dream book active');
  const forgetting = magicRunner.getSpell('dream_forgetting');
  r.check(forgetting && forgetting.book === 'dream', 'dream_forgetting registered');
  const ward = magicRunner.getSpell('dream_ward');
  r.check(ward && ward.book === 'dream', 'dream_ward registered');
  const nameBind = magicRunner.getSpell('dream_name_bind');
  r.check(nameBind && nameBind.book === 'dream', 'dream_name_bind registered');
  const pageBurn = magicRunner.getSpell('dream_page_burn');
  r.check(pageBurn && pageBurn.book === 'dream', 'dream_page_burn registered');
}

// ══════════════════════════════════════════════════════════════════════════════
// Coverage counts
// ══════════════════════════════════════════════════════════════════════════════

r.section('coverage counts');

{
  const stdSpells = magicRunner.listSpells('standard');
  r.check(stdSpells.length >= 20, `standard spellbook has ${stdSpells.length} spells (>= 20)`);

  const ancSpells = magicRunner.listSpells('ancient');
  r.check(ancSpells.length >= 8, `ancient spellbook has ${ancSpells.length} spells (>= 8)`);

  const lunSpells = magicRunner.listSpells('lunar');
  r.check(lunSpells.length >= 10, `lunar spellbook has ${lunSpells.length} spells (>= 10)`);

  const drmSpells = magicRunner.listSpells('dream');
  r.eq(drmSpells.length, 4, 'dream spellbook has 4 Inkweald spells');

  const all = magicRunner.listSpells();
  r.check(all.length >= 55, `total spells >= 55 (got ${all.length})`);
}

// ══════════════════════════════════════════════════════════════════════════════
// Combat.js hooks
// ══════════════════════════════════════════════════════════════════════════════

r.section('combat.js: PRAYER_MODIFIERS + MAGIC_ATTACK hooks');

{
  const p = fresh('CombatMods');
  const m = combat.PRAYER_MODIFIERS(p);
  r.check(m && typeof m === 'object', 'PRAYER_MODIFIERS returns object');
  r.eq(m.damage_melee, 1.0, 'default damage_melee = 1.0');
}

{
  const p = fresh('CombatMagicHook');
  const target = { stats: { magic: 5, def_magic: 0, defence: 1 } };
  p.inventory[0] = { id: 11350, name: 'Air rune', count: 10 };
  p.inventory[1] = { id: 11354, name: 'Mind rune', count: 10 };
  const res = combat.MAGIC_ATTACK(p, 'wind_strike', target);
  r.eq(res.ok, true, 'MAGIC_ATTACK returns ok');
  r.check('hit' in res && 'damage' in res, 'MAGIC_ATTACK returns hit/damage');
  r.check(res.maxHit === 2, 'wind_strike maxHit=2');
}

{
  const p = fresh('ApplyProtectCombat');
  player.addXp(p, 'prayer', player.xpForLevel(43));
  prayerRunner.activate(p, 'protect_from_melee');
  const dmg = combat.applyProtectPrayers(p, 20, { style: 'melee', pvp: false });
  r.eq(dmg, 0, 'combat.applyProtectPrayers delegates to prayer-runner');
}

// ══════════════════════════════════════════════════════════════════════════════
// Summary
// ══════════════════════════════════════════════════════════════════════════════

r.exit();
