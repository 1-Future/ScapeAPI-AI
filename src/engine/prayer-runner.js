// ══════════════════════════════════════════════════════════════════════════════
// Prayer Runner — first-class prayer activation + drain + effect resolution
//
// Upstream source of prayer definitions is
// src/content/aelgard/prayer-expansion.js (29 prayers). This runner provides
// the engine glue:
//
//   activate(p, id)           toggle/activate a prayer (mutex against conflicts)
//   deactivate(p, id)         disable a single prayer
//   isActive(p, id)           boolean
//   drainRate(p)              points consumed per tick by the currently active
//                             prayer set (0 when none active)
//   getModifiers(p)           { accuracy_melee, damage_melee, damage_ranged,
//                               damage_magic, defence, protect_prayers:[...],
//                               on_death:[], on_low_hp:[], preserve, protect_item }
//   onTick(p, tick)           drain; on 0 points, deactivate all
//
// The runner is additive to src/combat/combat.js — combat.js already reads
// activePrayers for the OSRS-accurate level multipliers (Piety, Rigour, etc).
// The new modifiers below are the overhead / special prayers (protect-from-X,
// Retribution, Redemption, Smite, Preserve, Protect Item) plus the bonus XP
// for burying at altars — things combat.js does not yet handle.
//
// No emojis. CommonJS. Tests live in scripts/test-prayer-magic.js.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

let _prayers = null;
function prayerDefs() {
  if (_prayers) return _prayers;
  try {
    const mod = require('../content/aelgard/prayer-expansion');
    _prayers = mod.prayers;
  } catch (_) {
    _prayers = new Map();
  }
  return _prayers;
}

let _boneXp = null;
function boneXpTable() {
  if (_boneXp) return _boneXp;
  try {
    _boneXp = require('../content/aelgard/prayer-expansion').BONE_XP || {};
  } catch (_) {
    _boneXp = {};
  }
  return _boneXp;
}

const player = require('../player/player');

// ── Prayer definitions that live outside prayer-expansion ───────────────────
// These are the quest/scroll unlock prayers that the content file flags but
// does not fully enumerate. Kept here so isActive/activate work uniformly.
const EXTRA_PRAYERS = {
  protect_from_undead: { id: 'protect_from_undead', name: 'Protect from Undead', level: 35, drainRate: 10, type: 'overhead',
    effect: 'Reduces undead damage by 40%',
    conflicts: ['protect_from_melee', 'protect_from_missiles', 'protect_from_magic'] },
  ancestral_spirit:    { id: 'ancestral_spirit', name: 'Ancestral Spirit', level: 65, drainRate: 18, type: 'special',
    effect: 'Veilwood spirit blessing: +10% damage vs ancestral tags',
    conflicts: [] },
  solar_blessing:      { id: 'solar_blessing', name: 'Solar Blessing', level: 75, drainRate: 20, type: 'special',
    effect: 'Glass Desert quest reward: +8% damage all styles',
    conflicts: [] },
};

// Drain rate is stored in "points per minute" in the content file; convert to
// per-tick (600ms tick → 100 ticks per minute). Prayers very often round to
// nice fractions per tick — we keep the fractional accumulator on the player.
const TICKS_PER_MINUTE = 100;

// ── Helpers ───────────────────────────────────────────────────────────────────

function getDef(id) {
  const defs = prayerDefs();
  if (defs.has && defs.has(id)) return defs.get(id);
  if (EXTRA_PRAYERS[id]) return EXTRA_PRAYERS[id];
  return null;
}

function ensureSet(p) {
  if (!p.activePrayers) p.activePrayers = new Set();
  if (Array.isArray(p.activePrayers)) p.activePrayers = new Set(p.activePrayers);
  return p.activePrayers;
}

function ensureDrainAcc(p) {
  if (typeof p.prayerDrainAcc !== 'number') p.prayerDrainAcc = 0;
  return p.prayerDrainAcc;
}

// ── Activation ────────────────────────────────────────────────────────────────

function activate(p, prayerId) {
  if (!p || !prayerId) return { ok: false, reason: 'invalid' };
  const def = getDef(prayerId);
  if (!def) return { ok: false, reason: `unknown prayer: ${prayerId}` };

  const prayerLevel = player.getLevel(p, 'prayer');
  if (prayerLevel < def.level) {
    return { ok: false, reason: `Prayer level ${def.level} required.` };
  }

  if ((p.prayerPoints || 0) <= 0) {
    return { ok: false, reason: 'No prayer points remaining.' };
  }

  const set = ensureSet(p);

  // Already active → toggle off
  if (set.has(prayerId)) {
    set.delete(prayerId);
    return { ok: true, toggled: 'off', prayer: def };
  }

  // Resolve conflicts: remove any conflicting prayer, and remove symmetric
  // conflicts (e.g. activating protect_from_melee should turn off retribution
  // because retribution lists protection prayers as conflicts).
  const conflicts = new Set(def.conflicts || []);
  for (const other of Array.from(set)) {
    const otherDef = getDef(other);
    if (!otherDef) continue;
    if (conflicts.has(other)) { set.delete(other); continue; }
    const otherConflicts = otherDef.conflicts || [];
    if (otherConflicts.indexOf(prayerId) >= 0) set.delete(other);
  }

  set.add(prayerId);
  return { ok: true, toggled: 'on', prayer: def };
}

function deactivate(p, prayerId) {
  const set = ensureSet(p);
  if (!set.has(prayerId)) return { ok: false, reason: 'not active' };
  set.delete(prayerId);
  return { ok: true };
}

function clear(p) {
  const set = ensureSet(p);
  const n = set.size;
  set.clear();
  return n;
}

function isActive(p, prayerId) {
  const set = ensureSet(p);
  return set.has(prayerId);
}

function listActive(p) {
  const set = ensureSet(p);
  return Array.from(set);
}

// ── Drain ─────────────────────────────────────────────────────────────────────

function drainRate(p) {
  const set = ensureSet(p);
  if (set.size === 0) return 0;
  let total = 0;
  for (const id of set) {
    const def = getDef(id);
    if (!def) continue;
    // per-minute → per-tick
    total += (def.drainRate || 0) / TICKS_PER_MINUTE;
  }
  // Preserve bonus is handled in getModifiers (slows boost drain) — does not
  // change prayer drain rate here.
  return total;
}

function onTick(p) {
  const set = ensureSet(p);
  if (set.size === 0) { p.prayerDrainAcc = 0; return { drained: 0 }; }

  const rate = drainRate(p);
  let acc = ensureDrainAcc(p) + rate;
  let consumed = 0;
  while (acc >= 1 && (p.prayerPoints || 0) > 0) {
    p.prayerPoints = Math.max(0, (p.prayerPoints || 0) - 1);
    consumed += 1;
    acc -= 1;
  }
  p.prayerDrainAcc = acc;

  if ((p.prayerPoints || 0) <= 0) {
    set.clear();
    p.prayerDrainAcc = 0;
  }
  return { drained: consumed, remaining: p.prayerPoints || 0 };
}

// ── Modifier aggregation ──────────────────────────────────────────────────────
// Runs on top of combat.js PRAYER_BOOSTS (stat multipliers). This returns the
// "other" effects: damage reduction from protection prayers, on-death hooks,
// on-low-hp hooks, and passive flags.

const PROTECTION_PRAYERS = new Set([
  'protect_from_melee', 'protect_from_missiles', 'protect_from_magic',
  'protect_from_undead',
]);

function getModifiers(p) {
  const active = listActive(p);
  const mods = {
    accuracy_melee: 1.0,
    accuracy_ranged: 1.0,
    accuracy_magic: 1.0,
    damage_melee: 1.0,
    damage_ranged: 1.0,
    damage_magic: 1.0,
    defence: 1.0,
    protect_prayers: [],
    on_death: [],
    on_low_hp: [],
    preserve: false,
    protect_item: false,
    smite: false,
    retribution: false,
    redemption: false,
  };

  for (const id of active) {
    if (PROTECTION_PRAYERS.has(id)) mods.protect_prayers.push(id);
    if (id === 'retribution')  { mods.on_death.push('retribution'); mods.retribution = true; }
    if (id === 'redemption')   { mods.on_low_hp.push('redemption'); mods.redemption = true; }
    if (id === 'smite')        mods.smite = true;
    if (id === 'preserve')     mods.preserve = true;
    if (id === 'protect_item') mods.protect_item = true;
    if (id === 'ancestral_spirit') mods.damage_melee *= 1.10;
    if (id === 'solar_blessing')   { mods.damage_melee *= 1.08; mods.damage_ranged *= 1.08; mods.damage_magic *= 1.08; }
  }

  return mods;
}

// ── Damage resolution (called by combat.damage()) ────────────────────────────
// Returns the final damage after applying protection prayers for a given
// attack style. 100% block in PvM, 40% in PvP. Retribution/Redemption/Smite
// are handled by onPlayerDamaged / onPlayerDeath hooks below.
function applyProtectPrayers(defender, damage, opts) {
  if (!damage || damage <= 0) return damage;
  const style = (opts && opts.style) || 'melee';
  const isPvp  = !!(opts && opts.pvp);
  const attackerTags = (opts && opts.attackerTags) || [];
  const active = ensureSet(defender);
  let dmg = damage;

  function reduce(factor) {
    dmg = Math.floor(dmg * factor);
  }

  if (style === 'melee' && active.has('protect_from_melee')) {
    reduce(isPvp ? 0.60 : 0.0);
  } else if (style === 'ranged' && active.has('protect_from_missiles')) {
    reduce(isPvp ? 0.60 : 0.0);
  } else if (style === 'magic' && active.has('protect_from_magic')) {
    reduce(isPvp ? 0.60 : 0.0);
  }

  // Protect from Undead: reduces damage from undead NPCs by 40%.
  if (attackerTags.indexOf('undead') >= 0 && active.has('protect_from_undead')) {
    reduce(0.60);
  }

  return dmg;
}

// Called when a defender takes damage and drops below ~10% HP. Activates
// Redemption: heal 25% of prayer level, drain all prayer.
function checkRedemption(defender) {
  if (!defender) return null;
  if (!isActive(defender, 'redemption')) return null;
  const maxHp = defender.maxHp || player.getLevel(defender, 'hitpoints') || 10;
  if ((defender.hp || 0) > maxHp * 0.10) return null;
  const prayerLvl = player.getLevel(defender, 'prayer') || 1;
  const heal = Math.floor(prayerLvl * 0.25);
  defender.hp = Math.min(maxHp, (defender.hp || 0) + heal);
  defender.prayerPoints = 0;
  ensureSet(defender).clear();
  return { healed: heal };
}

// Called on death: if Retribution is active, return an AoE damage plan the
// caller applies to nearby hostiles.
function onPlayerDeath(p) {
  if (!p) return null;
  if (!isActive(p, 'retribution')) return null;
  const prayerLvl = player.getLevel(p, 'prayer') || 1;
  const damage = Math.floor(prayerLvl * 0.25);
  return { type: 'retribution', damage, radius: 1 };
}

// Called when a player lands a hit: if Smite is active, drain 25% of the
// damage dealt from opponent's prayer points.
function applySmite(attacker, defender, damage) {
  if (!attacker || !defender) return 0;
  if (!isActive(attacker, 'smite')) return 0;
  if (!damage || damage <= 0) return 0;
  const drain = Math.floor(damage * 0.25);
  defender.prayerPoints = Math.max(0, (defender.prayerPoints || 0) - drain);
  return drain;
}

// ── Altar XP bonus ────────────────────────────────────────────────────────────
// Burying bones at an altar multiplies the bone's base XP. "gilded" / "chaos"
// give 3.5x. "ectofuntus" gives 4x. "regular" is 1x.

const ALTAR_MULTIPLIERS = {
  regular:    1.0,
  gilded:     3.5,
  chaos:      3.5,   // 50% risk of losing bone with no XP — resolved by caller
  ectofuntus: 4.0,
};

function altarMultiplier(altarKind) {
  return ALTAR_MULTIPLIERS[altarKind] || 1.0;
}

function buryXp(boneName, altarKind) {
  const table = boneXpTable();
  const base = table[boneName] !== undefined ? table[boneName] : 4.5;
  const mult = altarMultiplier(altarKind || 'regular');
  return Math.round(base * mult * 10) / 10;
}

// ── Exports ───────────────────────────────────────────────────────────────────

module.exports = {
  // Core API
  activate, deactivate, clear, isActive, listActive,
  drainRate, getModifiers, onTick,
  // Combat hooks
  applyProtectPrayers, applySmite, checkRedemption, onPlayerDeath,
  // Altar / bone XP
  altarMultiplier, buryXp, ALTAR_MULTIPLIERS,
  // Constants / helpers
  EXTRA_PRAYERS, PROTECTION_PRAYERS, TICKS_PER_MINUTE,
  getDef,
};
