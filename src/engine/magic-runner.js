// ══════════════════════════════════════════════════════════════════════════════
// Magic Runner — first-class spell cast + effect resolution
//
// Upstream source of spell definitions is
// src/content/aelgard/spellbooks.js (55 spells across 3 books). This runner
// adds the Dream spellbook (Inkweald-unlocked) and provides the engine glue:
//
//   cast(p, spellId, target)           validate runes/level/cooldown + apply
//   castable(p, spellId) -> {ok,reason}
//   applyEffect(p, target, spell)      damage / freeze / bind / teleport / etc.
//   teleport(p, spellId)
//   enchant(p, spellId, itemId)
//   alch(p, itemId, mode)              hi | lo
//   setSpellbook(p, book)              altar-gated book switch
//   currentBook(p)
//   listSpells(book)
//   getSpell(id)
//
// SPELLBOOKS:
//   standard  — strike/bolt/blast/wave/surge tiers + enchant + alch + teleport
//               + bones-to-bananas + superheat + telegrab + bind/snare/entangle
//   ancient   — ice/blood/shadow/smoke × rush/burst/blitz/barrage
//   lunar     — cure, heal-group, vengeance, humidify, NPC contact, etc.
//   dream     — Inkweald-unlocked: forgetting, dream-ward, name-bind, page-burn
//
// Ironman restriction: Tele Other family is disabled for ironman accounts.
//
// No emojis. CommonJS. Tests in scripts/test-prayer-magic.js.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const player = require('../player/player');

// Load content spellbooks.js — it auto-registers all 55 spells on require.
let _spellMap = null;
function getSpellMap() {
  if (_spellMap) return _spellMap;
  try {
    const mod = require('../content/aelgard/spellbooks');
    _spellMap = mod.spells instanceof Map ? mod.spells : new Map();
  } catch (_) {
    _spellMap = new Map();
  }
  return _spellMap;
}

// ══════════════════════════════════════════════════════════════════════════════
// Extended spell definitions — completes the 55+ coverage the task calls for.
// Added locally so we don't mutate the content file. These include:
//   standard — bind/snare/entangle, tele-other, charge, additional surges
//   ancient  — missing rush/burst/blitz permutations
//   lunar    — energy transfer, stat spy, vengeance group
//   dream    — Inkweald-unlocked quartet
// ══════════════════════════════════════════════════════════════════════════════

// Rune ids from spellbooks.js header:
// air=11350 water=11351 earth=11352 fire=11353 mind=11354 body=11355
// chaos=11356 death=11357 blood=11358 nature=11359 law=11360 cosmic=11361
// astral=11362 soul=11363 wrath=11364
const R = {
  air: 11350, water: 11351, earth: 11352, fire: 11353, mind: 11354, body: 11355,
  chaos: 11356, death: 11357, blood: 11358, nature: 11359, law: 11360,
  cosmic: 11361, astral: 11362, soul: 11363, wrath: 11364,
};

const EXTRA_SPELLS = {
  // Standard — missing strikes/surges and the bind family
  water_wave:  { id: 'water_wave',  name: 'Water Wave',  book: 'standard', type: 'combat', level: 65, maxHit: 18, baseXp: 37.5,
    runes: [{ id: R.water, count: 7 }, { id: R.air, count: 5 }, { id: R.blood, count: 1 }] },
  earth_wave:  { id: 'earth_wave',  name: 'Earth Wave',  book: 'standard', type: 'combat', level: 70, maxHit: 19, baseXp: 40,
    runes: [{ id: R.earth, count: 7 }, { id: R.air, count: 5 }, { id: R.blood, count: 1 }] },
  fire_wave:   { id: 'fire_wave',   name: 'Fire Wave',   book: 'standard', type: 'combat', level: 75, maxHit: 20, baseXp: 42.5,
    runes: [{ id: R.fire, count: 7 }, { id: R.air, count: 5 }, { id: R.blood, count: 1 }] },
  wind_surge:  { id: 'wind_surge',  name: 'Wind Surge',  book: 'standard', type: 'combat', level: 81, maxHit: 21, baseXp: 50,
    runes: [{ id: R.air, count: 7 }, { id: R.wrath, count: 1 }] },
  water_surge: { id: 'water_surge', name: 'Water Surge', book: 'standard', type: 'combat', level: 85, maxHit: 22, baseXp: 53.5,
    runes: [{ id: R.water, count: 10 }, { id: R.air, count: 7 }, { id: R.wrath, count: 1 }] },
  earth_surge: { id: 'earth_surge', name: 'Earth Surge', book: 'standard', type: 'combat', level: 90, maxHit: 23, baseXp: 56.5,
    runes: [{ id: R.earth, count: 10 }, { id: R.air, count: 7 }, { id: R.wrath, count: 1 }] },
  missile_strike: { id: 'missile_strike', name: 'Missile Strike', book: 'standard', type: 'combat', level: 10, maxHit: 5, baseXp: 10,
    runes: [{ id: R.mind, count: 2 }] },
  // Binds
  bind:        { id: 'bind',       name: 'Bind',       book: 'standard', type: 'combat', level: 20, maxHit: 2, baseXp: 30, effect: 'freeze:5',
    runes: [{ id: R.earth, count: 3 }, { id: R.water, count: 3 }, { id: R.nature, count: 2 }] },
  snare:       { id: 'snare',      name: 'Snare',      book: 'standard', type: 'combat', level: 50, maxHit: 2, baseXp: 60, effect: 'freeze:10',
    runes: [{ id: R.earth, count: 4 }, { id: R.water, count: 4 }, { id: R.nature, count: 3 }] },
  entangle:    { id: 'entangle',   name: 'Entangle',   book: 'standard', type: 'combat', level: 79, maxHit: 5, baseXp: 89, effect: 'freeze:15',
    runes: [{ id: R.earth, count: 5 }, { id: R.water, count: 5 }, { id: R.nature, count: 4 }] },
  charge:      { id: 'charge',     name: 'Charge',     book: 'standard', type: 'utility', level: 80, baseXp: 180,
    runes: [{ id: R.air, count: 3 }, { id: R.fire, count: 3 }, { id: R.blood, count: 3 }],
    description: 'Doubles god spell damage for 7 minutes.' },
  // Enchantments tier 6 + onyx
  enchant_onyx:  { id: 'enchant_onyx',  name: 'Lvl-6 Enchant',  book: 'standard', type: 'enchant', level: 87, baseXp: 97,
    runes: [{ id: R.fire, count: 20 }, { id: R.earth, count: 20 }, { id: R.cosmic, count: 1 }] },
  tele_other_heartlands: { id: 'tele_other_heartlands', name: 'Tele Other: Heartlands', book: 'standard', type: 'teleport', level: 74, baseXp: 84,
    runes: [{ id: R.soul, count: 1 }, { id: R.law, count: 1 }, { id: R.earth, count: 1 }],
    ironmanBanned: true, description: 'Teleport another player to Heartlands. Ironman: disabled.' },

  // Ancient — fill in missing blitzes/bursts/barrages
  smoke_burst:   { id: 'smoke_burst',   name: 'Smoke Burst',   book: 'ancient', type: 'combat', level: 62, maxHit: 20, baseXp: 36, effect: 'poison:3,aoe:3x3',
    runes: [{ id: R.fire, count: 2 }, { id: R.air, count: 2 }, { id: R.chaos, count: 4 }, { id: R.death, count: 2 }] },
  smoke_blitz:   { id: 'smoke_blitz',   name: 'Smoke Blitz',   book: 'ancient', type: 'combat', level: 74, maxHit: 23, baseXp: 42, effect: 'poison:4',
    runes: [{ id: R.fire, count: 2 }, { id: R.air, count: 2 }, { id: R.blood, count: 2 }, { id: R.death, count: 2 }] },
  shadow_burst:  { id: 'shadow_burst',  name: 'Shadow Burst',  book: 'ancient', type: 'combat', level: 64, maxHit: 19, baseXp: 37, effect: 'drain:attack:10%,aoe:3x3',
    runes: [{ id: R.earth, count: 2 }, { id: R.air, count: 2 }, { id: R.chaos, count: 4 }, { id: R.death, count: 2 }, { id: R.soul, count: 2 }] },
  shadow_blitz:  { id: 'shadow_blitz',  name: 'Shadow Blitz',  book: 'ancient', type: 'combat', level: 76, maxHit: 24, baseXp: 43, effect: 'drain:attack:15%',
    runes: [{ id: R.earth, count: 2 }, { id: R.air, count: 2 }, { id: R.blood, count: 2 }, { id: R.death, count: 2 }, { id: R.soul, count: 1 }] },

  // Lunar — extras
  stat_spy:       { id: 'stat_spy',      name: 'Stat Spy',      book: 'lunar', type: 'utility', level: 75, baseXp: 76,
    runes: [{ id: R.astral, count: 2 }, { id: R.body, count: 5 }, { id: R.cosmic, count: 2 }],
    description: 'Reveals another player\'s skill levels.' },
  energy_transfer:{ id: 'energy_transfer', name: 'Energy Transfer', book: 'lunar', type: 'utility', level: 91, baseXp: 100,
    runes: [{ id: R.astral, count: 3 }, { id: R.law, count: 2 }, { id: R.nature, count: 1 }],
    ironmanBanned: true, description: 'Transfer run energy + special to another player. Ironman: disabled.' },
  vengeance_group:{ id: 'vengeance_group', name: 'Vengeance Group', book: 'lunar', type: 'utility', level: 95, baseXp: 120,
    runes: [{ id: R.astral, count: 4 }, { id: R.earth, count: 11 }, { id: R.death, count: 3 }],
    ironmanBanned: true, description: 'Casts Vengeance on all nearby group members. Ironman: disabled.' },

  // Dream spellbook — Inkweald-unlocked
  dream_forgetting: { id: 'dream_forgetting', name: 'Forgetting',  book: 'dream', type: 'combat', level: 70, maxHit: 18, baseXp: 48, effect: 'drain:magic:20%',
    runes: [{ id: R.soul, count: 3 }, { id: R.mind, count: 4 }, { id: R.body, count: 4 }] },
  dream_ward:       { id: 'dream_ward',       name: 'Dream Ward',  book: 'dream', type: 'utility', level: 74, baseXp: 55, effect: 'ward:50',
    runes: [{ id: R.soul, count: 2 }, { id: R.astral, count: 2 }, { id: R.mind, count: 4 }],
    description: 'Absorb 50 damage over the next 10 ticks.' },
  dream_name_bind:  { id: 'dream_name_bind',  name: 'Name-Bind',   book: 'dream', type: 'combat', level: 80, maxHit: 3, baseXp: 75, effect: 'freeze:20,brand',
    runes: [{ id: R.soul, count: 3 }, { id: R.mind, count: 5 }, { id: R.astral, count: 2 }] },
  dream_page_burn:  { id: 'dream_page_burn',  name: 'Page-Burn',   book: 'dream', type: 'combat', level: 88, maxHit: 27, baseXp: 90, effect: 'burn:3',
    runes: [{ id: R.soul, count: 4 }, { id: R.fire, count: 8 }, { id: R.astral, count: 2 }] },
};

// ── Public: spell lookup ─────────────────────────────────────────────────────

function getSpell(id) {
  const m = getSpellMap();
  if (m.has(id)) return m.get(id);
  return EXTRA_SPELLS[id] || null;
}

function listSpells(book) {
  const out = [];
  for (const sp of getSpellMap().values()) {
    if (!book || sp.book === book) out.push(sp);
  }
  for (const sp of Object.values(EXTRA_SPELLS)) {
    if (!book || sp.book === book) out.push(sp);
  }
  return out;
}

function getSpellbooks() { return ['standard', 'ancient', 'lunar', 'dream']; }

// ── Spellbook state ───────────────────────────────────────────────────────────
// Players default to 'standard'. Switching requires using a Lunar Isle / Altar
// of the Occult object — the command layer will check proximity. Quest unlocks
// gate whether the switch is allowed:
//   ancient → requires 'desert_treasure' complete
//   lunar   → requires 'lunar_diplomacy' complete
//   dream   → requires 'inkweald_dreamwalk' complete

const BOOK_GATES = {
  standard: null,
  ancient:  'desert_treasure',
  lunar:    'lunar_diplomacy',
  dream:    'inkweald_dreamwalk',
};

function currentBook(p) {
  return (p && p.spellbook) || 'standard';
}

function canSwitchSpellbook(p, book) {
  const gate = BOOK_GATES[book];
  if (!gate) return { ok: true };
  const prog = (p.questProgress && p.questProgress[gate]) || null;
  if (prog && prog.complete) return { ok: true };
  return { ok: false, reason: `Requires quest: ${gate}` };
}

function setSpellbook(p, book) {
  if (!getSpellbooks().includes(book)) return { ok: false, reason: `Unknown book: ${book}` };
  const gate = canSwitchSpellbook(p, book);
  if (!gate.ok) return gate;
  p.spellbook = book;
  return { ok: true, book };
}

// ── Validation ────────────────────────────────────────────────────────────────

function invCountOf(p, itemId) {
  if (!p || !p.inventory) return 0;
  let n = 0;
  for (const slot of p.inventory) {
    if (slot && slot.id === itemId) n += (slot.count || 1);
  }
  return n;
}

function removeRunes(p, runes) {
  // Simple inventory scan. We assume the caller already validated with hasRunes.
  for (const { id, count } of runes) {
    let need = count;
    for (let i = 0; i < p.inventory.length && need > 0; i++) {
      const slot = p.inventory[i];
      if (!slot || slot.id !== id) continue;
      if (slot.count <= need) {
        need -= slot.count;
        p.inventory[i] = null;
      } else {
        slot.count -= need;
        need = 0;
      }
    }
  }
}

function hasRunes(p, runes) {
  for (const { id, count } of runes) {
    if (invCountOf(p, id) < count) return false;
  }
  return true;
}

function isIronman(p) {
  if (!p) return false;
  if (p.ironman && p.ironman.variant) return true;
  if (p.accountMode && p.accountMode !== 'normal' && p.accountMode !== null) return true;
  return false;
}

function castable(p, spellId) {
  const spell = getSpell(spellId);
  if (!spell) return { ok: false, reason: `Unknown spell: ${spellId}` };

  // Book check: spell must be in the current book (or standard always allowed
  // for the utility alch spells that every book can use? OSRS-accurate: no —
  // switching books hides non-current spells).
  const book = currentBook(p);
  if (spell.book !== book) {
    return { ok: false, reason: `Spell not in current spellbook (${book}).` };
  }

  // Ironman restriction: tele-other / energy transfer family
  if (spell.ironmanBanned && isIronman(p)) {
    return { ok: false, reason: 'Ironmen cannot cast this spell.' };
  }

  // Level check
  if (player.getLevel(p, 'magic') < (spell.level || 1)) {
    return { ok: false, reason: `Magic level ${spell.level} required.` };
  }

  // Rune check
  const runes = spell.runes || [];
  if (!hasRunes(p, runes)) {
    return { ok: false, reason: 'Not enough runes.' };
  }

  // Cooldown (spells with a cooldown key e.g. vengeance 30 seconds = 50 ticks)
  if (p.spellCooldowns && p.spellCooldowns[spellId]) {
    const tickMod = require('./tick');
    const now = tickMod.getTick ? tickMod.getTick() : 0;
    if (now < p.spellCooldowns[spellId]) {
      return { ok: false, reason: `On cooldown (${p.spellCooldowns[spellId] - now} ticks).` };
    }
  }

  return { ok: true, spell };
}

// ── Effect resolution ────────────────────────────────────────────────────────
// Non-combat spells run their effect inline here; combat spells return a
// payload the combat module uses to finalise damage.

function applyEffect(p, target, spell) {
  if (!spell) return { ok: false, reason: 'no spell' };

  // Teleports — combat spells get short-circuited here if teleport type
  if (spell.type === 'teleport') return applyTeleport(p, spell);
  if (spell.type === 'enchant')  return { ok: true, kind: 'enchant', spell };
  if (spell.type === 'utility')  return applyUtility(p, target, spell);

  // Combat spell — calculate max hit and effect tags; damage calc happens in
  // combat.js (which already handles magic accuracy).
  return {
    ok: true,
    kind: 'combat',
    spell,
    maxHit: spell.maxHit || 0,
    effect: spell.effect || null,
  };
}

function applyTeleport(p, spell) {
  // We don't know world coordinates for every region here; hand back a payload
  // the commands module can wire into the world layer.
  const name = (spell.name || '').toLowerCase();
  const map = {
    'teleport to house': { target: 'house' },
    'heartlands teleport': { target: 'heartlands' },
    'saltbrine teleport': { target: 'saltbrine' },
    'sootworks teleport': { target: 'sootworks' },
    'moryskah teleport':  { target: 'moryskah' },
    'moonclan teleport':  { target: 'moonclan' },
    'ice plateau teleport': { target: 'ice_plateau' },
  };
  const resolved = map[name] || { target: name.replace(/ teleport$/, '') };
  return { ok: true, kind: 'teleport', spell, ...resolved };
}

function applyUtility(p, target, spell) {
  const id = spell.id;
  switch (id) {
    case 'humidify': {
      // Fill empty water containers (vials, jugs, buckets) — stub: count slots
      return { ok: true, kind: 'humidify', spell };
    }
    case 'dream': {
      p.dreamingUntilTick = (p.dreamingUntilTick || 0); // command wires tick
      return { ok: true, kind: 'dream', spell, heal: 1 };
    }
    case 'vengeance': {
      p.vengeanceReady = true;
      p.spellCooldowns = p.spellCooldowns || {};
      // 30-second cooldown = 50 ticks
      try {
        const tickMod = require('./tick');
        p.spellCooldowns.vengeance = (tickMod.getTick ? tickMod.getTick() : 0) + 50;
      } catch (_) {}
      return { ok: true, kind: 'vengeance', spell };
    }
    case 'cure_other':
    case 'cure_plant': {
      return { ok: true, kind: 'cure', spell };
    }
    case 'heal_other': {
      if (!target) return { ok: false, reason: 'Heal Other needs a target.' };
      const transfer = Math.floor((p.hp || 0) * 0.75);
      p.hp = (p.hp || 0) - transfer;
      target.hp = Math.min(target.maxHp || transfer, (target.hp || 0) + transfer);
      return { ok: true, kind: 'heal_other', spell, transfer };
    }
    case 'npc_contact': {
      return { ok: true, kind: 'npc_contact', spell };
    }
    case 'stat_spy': {
      if (!target || !target.skills) return { ok: false, reason: 'Target has no skills.' };
      const snapshot = {};
      for (const k of Object.keys(target.skills)) snapshot[k] = target.skills[k].level;
      return { ok: true, kind: 'stat_spy', spell, snapshot };
    }
    default:
      return { ok: true, kind: 'utility', spell };
  }
}

// ── Cast entrypoint ──────────────────────────────────────────────────────────

function cast(p, spellId, target) {
  const check = castable(p, spellId);
  if (!check.ok) return check;
  const spell = check.spell;

  // Consume runes
  removeRunes(p, spell.runes || []);

  // Grant magic XP (base only — damage XP added by combat.js)
  if (spell.baseXp) {
    player.addXp(p, 'magic', spell.baseXp);
  }

  const result = applyEffect(p, target, spell);
  return { ok: true, spell, result };
}

// ── Enchant / alchemy helpers ────────────────────────────────────────────────

// Jewellery enchantment: expects itemId of unenchanted jewellery. The return
// payload tells the command layer which enchanted item to hand back.
const ENCHANT_MAP = {
  enchant_sapphire:    { tier: 1 },
  enchant_emerald:     { tier: 2 },
  enchant_ruby:        { tier: 3 },
  enchant_diamond:     { tier: 4 },
  enchant_dragonstone: { tier: 5 },
  enchant_onyx:        { tier: 6 },
};

function enchant(p, spellId, itemId) {
  const spell = getSpell(spellId);
  if (!spell || spell.type !== 'enchant') return { ok: false, reason: 'Not an enchant spell.' };
  const check = castable(p, spellId);
  if (!check.ok) return check;
  if (invCountOf(p, itemId) <= 0) return { ok: false, reason: 'You do not have that item.' };
  removeRunes(p, spell.runes || []);
  player.addXp(p, 'magic', spell.baseXp || 0);
  const tierInfo = ENCHANT_MAP[spellId] || { tier: 0 };
  return { ok: true, kind: 'enchant', spell, tier: tierInfo.tier, itemId };
}

function alch(p, itemId, mode) {
  const spellId = (mode === 'lo' || mode === 'low') ? 'low_alchemy' : 'high_alchemy';
  const spell = getSpell(spellId);
  if (!spell) return { ok: false, reason: 'Alchemy spell not loaded.' };
  const check = castable(p, spellId);
  if (!check.ok) return check;
  if (invCountOf(p, itemId) <= 0) return { ok: false, reason: 'You do not have that item.' };

  // Look up item value via data/items if available
  let value = 0;
  try {
    const items = require('../data/items');
    const def = items.get(itemId);
    if (def) {
      value = (spellId === 'high_alchemy')
        ? (def.highAlch || Math.floor(def.value * 0.6))
        : (def.lowAlch  || Math.floor(def.value * 0.4));
    }
  } catch (_) {}

  removeRunes(p, spell.runes || []);
  player.addXp(p, 'magic', spell.baseXp || 0);

  return { ok: true, kind: 'alch', spell, itemId, coins: value, mode: spellId };
}

// ── Teleport wrapper (public API) ────────────────────────────────────────────

function teleport(p, spellId) {
  const spell = getSpell(spellId);
  if (!spell) return { ok: false, reason: `Unknown spell: ${spellId}` };
  if (spell.type !== 'teleport') return { ok: false, reason: 'Not a teleport spell.' };
  return cast(p, spellId);
}

module.exports = {
  cast, castable, applyEffect, teleport, enchant, alch,
  setSpellbook, currentBook, canSwitchSpellbook,
  listSpells, getSpell, getSpellbooks,
  hasRunes, removeRunes, isIronman,
  EXTRA_SPELLS, BOOK_GATES,
};
