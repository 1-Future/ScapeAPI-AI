// ══════════════════════════════════════════════════════════════════════════════
// Pet Companion Runtime (burn v2)
//
// Design reference: build-your-own-scape/docs/pet-companion.md
//
// Pets exist as data in src/content/aelgard/pets-collection.js + the extension
// registry in src/content/aelgard/pets-extended.js. This module provides the
// LIVE runtime: unlock pipeline, follower entity, affinity/levelling, feeding,
// and the hooks that let the rest of the engine (drop tables, skill ticks,
// quests, combat, death) grant and manage pets without touching server.js.
//
// Public API:
//
//   registerPetDef(def)                  — add/update a pet definition
//   getPetDef(petId)                     — look up a pet def
//   listPetDefs()                        — all known pet defs (copy)
//
//   unlockPet(player, petId, opts?)      — award a pet on rare drop / quest
//   hasPet(player, petId)                — ownership check
//   getPets(player)                      — list of unlocked pets (summary objs)
//
//   summonPet(player, petId)             — place pet as follower, 1 tile behind
//   dismissPet(player)                   — despawn follower
//   currentPet(player)                   — { petId, name, ...state } | null
//
//   feedPet(player, petId, foodItemId)   — bump affinity, consume food
//   getAffinity(player, petId)           — { value, level, shiny, stats }
//
//   onCombatStart(player)                — breeders: passive pets auto-dismiss
//   onCombatEnd(player)                  — re-summons if auto-resume flag set
//
//   onLootDrop(player, sourceId, drops)  — rolls per-boss pet chance + returns
//                                          a mutated `drops` array (add-on)
//
//   onSkillAction(player, skill, meta)   — rolls per-skill pet chance
//
//   tick(player, currentTick)            — per-tick: follower path follow +
//                                          affinity accrual while summoned
//
//   register(engine)                     — auto-wire events (combat, loot,
//                                          skill, death) if provided
//
// Player state shape (added under `player.pets`):
//
//   player.pets = {
//     unlocked: [petId, ...],               // collection-log order
//     nicknames: { [petId]: string },       // player-provided names
//     active: petId | null,                 // currently summoned
//     affinity: { [petId]: Number },        // 0..1000
//     level: { [petId]: 1..10 },            // derived from affinity
//     shiny: { [petId]: true },             // variant unlocked at level 10
//     insured: { [petId]: true },           // survive hardcore death
//     follower: { x, y, layer, path: [] } | null, // live follower placement
//     lastActiveTick: { [petId]: tick },    // bookkeeping for affinity decay
//     resumeAfterCombat: boolean,           // re-summon when combat ends
//     stats: { unlocks: n, feeds: n, ticksActive: n, combatTicks: n },
//   }
//
// Design rules (per task spec):
//   • No emojis. CommonJS only.
//   • Pets are collection-log eligible — unlockPet fires a collection_log event.
//   • Combat pets never exceed 1% damage contribution (damageShare <= 0.01).
//   • One active pet at a time.
//   • Follower despawns on combat for passive pets; combat-eligible pets stay.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

let events = null;
try { events = require('./events'); } catch (_) { events = null; }

// Registry of pet definitions. Populated at require-time when content files
// are loaded and call registerPetDef().
const PET_DEFS = new Map();

// Affinity breakpoints per level. 10 levels total. 1000 pts = max.
const AFFINITY_PER_LEVEL = [0, 50, 120, 200, 300, 420, 560, 720, 850, 1000];

// Clamp helpers ───────────────────────────────────────────────────────────────
function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

// ── Registry ────────────────────────────────────────────────────────────────

/**
 * Pet definition shape:
 * {
 *   id: Number,                    // item id (from pets-collection.js)
 *   name: String,
 *   examine: String,
 *   source: String,                // display hint ("Forgefather Duran")
 *   sourceId: String | null,       // npc defId / skill id / quest id
 *   category: 'boss' | 'skill' | 'quest' | 'minigame' | 'clue' | 'random',
 *   rarity: Number,                // denominator (3000 = 1/3000)
 *   foods: [itemId, ...],          // foods this pet accepts (+affinity on feed)
 *   combatEligible: Boolean,       // stays active in combat
 *   damageShare: Number,           // max fraction of damage it contributes (<=0.01)
 *   skill: String | null,          // for skill pets ("fishing")
 *   bossId: String | null,         // for boss pets ("forgefather_duran")
 *   questId: String | null,        // for quest-locked pets
 *   tier: Number,                  // 1..5 for UI grouping
 *   shinyVariant: itemId | null,   // optional alt cosmetic at level 10
 * }
 */
function registerPetDef(def) {
  if (!def || typeof def !== 'object') throw new Error('pets: def required');
  if (def.id == null) throw new Error('pets: def.id required');
  const normalized = {
    id: def.id,
    name: def.name || ('Pet #' + def.id),
    examine: def.examine || '',
    source: def.source || '',
    sourceId: def.sourceId || null,
    category: def.category || 'boss',
    rarity: Number(def.rarity) || 3000,
    foods: Array.isArray(def.foods) ? def.foods.slice() : [],
    combatEligible: def.combatEligible === true,
    damageShare: clamp(Number(def.damageShare) || 0, 0, 0.01),
    skill: def.skill || null,
    bossId: def.bossId || null,
    questId: def.questId || null,
    tier: Number(def.tier) || 1,
    shinyVariant: def.shinyVariant || null,
  };
  PET_DEFS.set(normalized.id, normalized);
  return normalized;
}

function getPetDef(petId) { return PET_DEFS.get(petId) || null; }
function listPetDefs()    { return Array.from(PET_DEFS.values()); }

// Bulk load from the pets-collection export. Accepts:
//   [{ id, name, examine, source, rate }, ...]
// rate strings like "1/3000" or "~1/250k actions" are parsed into rarity.
function importCollection(petsArray, defaults) {
  if (!Array.isArray(petsArray)) return 0;
  const d = defaults || {};
  let loaded = 0;
  for (const p of petsArray) {
    if (!p || p.id == null) continue;
    // Don't clobber a fully-specified registration (pets-extended wins).
    if (PET_DEFS.has(p.id) && PET_DEFS.get(p.id)._fromExtended) continue;
    const rarity = parseRate(p.rate);
    const category = inferCategory(p.source);
    registerPetDef({
      id: p.id,
      name: p.name,
      examine: p.examine,
      source: p.source,
      rarity,
      category,
      combatEligible: false,
      damageShare: 0,
      tier: d.tier || 1,
    });
    loaded++;
  }
  return loaded;
}

function parseRate(rate) {
  if (!rate) return 3000;
  const s = String(rate).toLowerCase();
  // "1/3000", "~1/250k", "~1/7000"
  const m = s.match(/1\/(\d+)(k)?/);
  if (!m) return 3000;
  let denom = Number(m[1]);
  if (m[2] === 'k') denom *= 1000;
  return denom || 3000;
}

function inferCategory(source) {
  const s = String(source || '').toLowerCase();
  if (s.includes('clue')) return 'clue';
  if (s.includes('mining')) return 'skill';
  if (s.includes('fishing')) return 'skill';
  if (s.includes('woodcutting')) return 'skill';
  if (s.includes('agility')) return 'skill';
  if (s.includes('farming')) return 'skill';
  if (s.includes('thieving')) return 'skill';
  if (s.includes('runecrafting')) return 'skill';
  if (s.includes('herblore')) return 'skill';
  if (s.includes('firemaking')) return 'skill';
  if (s.includes('hunter')) return 'skill';
  if (s.includes('construction')) return 'skill';
  if (s.includes('pest control') || s.includes('minigame')) return 'minigame';
  if (s.includes('pyre')) return 'minigame';
  if (s.includes('quest')) return 'quest';
  if (s.includes('random event')) return 'random';
  return 'boss';
}

// ── Player state helpers ────────────────────────────────────────────────────

function ensureState(player) {
  if (!player || typeof player !== 'object') throw new Error('pets: player required');
  if (!player.pets || typeof player.pets !== 'object') {
    player.pets = {
      unlocked: [],
      nicknames: {},
      active: null,
      affinity: {},
      level: {},
      shiny: {},
      insured: {},
      follower: null,
      lastActiveTick: {},
      resumeAfterCombat: true,
      stats: { unlocks: 0, feeds: 0, ticksActive: 0, combatTicks: 0 },
    };
  }
  // Backfill newly-added fields when loading old saves.
  const s = player.pets;
  if (!Array.isArray(s.unlocked)) s.unlocked = [];
  if (!s.nicknames) s.nicknames = {};
  if (!s.affinity) s.affinity = {};
  if (!s.level) s.level = {};
  if (!s.shiny) s.shiny = {};
  if (!s.insured) s.insured = {};
  if (!s.lastActiveTick) s.lastActiveTick = {};
  if (!s.stats) s.stats = { unlocks: 0, feeds: 0, ticksActive: 0, combatTicks: 0 };
  return s;
}

// ── Ownership ───────────────────────────────────────────────────────────────

function hasPet(player, petId) {
  const s = ensureState(player);
  return s.unlocked.indexOf(petId) !== -1;
}

/**
 * Award a pet. Returns { ok, added, reason?, def? }.
 *   ok=true, added=true   — first-time unlock; collection log + event fired.
 *   ok=true, added=false  — already owned (duplicate grace message).
 *   ok=false              — unknown pet id.
 */
function unlockPet(player, petId, opts) {
  const s = ensureState(player);
  const def = getPetDef(petId);
  if (!def) return { ok: false, reason: 'unknown_pet' };
  if (s.unlocked.indexOf(petId) !== -1) {
    return { ok: true, added: false, reason: 'already_owned', def };
  }
  s.unlocked.push(petId);
  s.affinity[petId] = 0;
  s.level[petId] = 1;
  s.stats.unlocks++;

  // Collection log hook — the collection-log engine listens via drop_resolved,
  // but pets can also be unlocked via skills or quests where no "source" is
  // fired, so we emit a dedicated event too.
  if (events && events.emit) {
    events.emit('pet_unlocked', {
      player, petId, def,
      source: (opts && opts.source) || def.source,
      sourceId: (opts && opts.sourceId) || def.sourceId || null,
    });
    // Forward through drop_resolved if a sourceId is supplied — the collection
    // log catalogue has pet entries attached to boss sections.
    if (opts && opts.sourceId) {
      events.emit('drop_resolved', {
        player, sourceId: opts.sourceId, itemId: petId,
      });
    }
  }

  return { ok: true, added: true, def };
}

function getPets(player) {
  const s = ensureState(player);
  const out = [];
  for (const petId of s.unlocked) {
    const def = getPetDef(petId);
    if (!def) continue;
    out.push({
      id: petId,
      name: def.name,
      nickname: s.nicknames[petId] || null,
      category: def.category,
      source: def.source,
      affinity: s.affinity[petId] || 0,
      level: s.level[petId] || 1,
      shiny: !!s.shiny[petId],
      active: s.active === petId,
      insured: !!s.insured[petId],
      combatEligible: !!def.combatEligible,
    });
  }
  return out;
}

// ── Follower entity ─────────────────────────────────────────────────────────

/**
 * Place the pet as a follower. 1 tile behind the player on the same layer.
 * "Behind" = opposite of the player's facing direction. We fall back to the
 * tile just south of the player if facing is unknown (harmless on empty grids).
 */
function summonPet(player, petId) {
  const s = ensureState(player);
  const def = getPetDef(petId);
  if (!def) return { ok: false, reason: 'unknown_pet' };
  if (s.unlocked.indexOf(petId) !== -1 === false) {
    return { ok: false, reason: 'not_unlocked' };
  }
  if (s.active === petId && s.follower) {
    return { ok: true, alreadyActive: true, def };
  }
  // Combat rule: passive pets cannot be summoned while in combat.
  if (!def.combatEligible && player.combatTarget) {
    return { ok: false, reason: 'in_combat' };
  }
  s.active = petId;
  s.follower = {
    x: computeBehindX(player),
    y: computeBehindY(player),
    layer: player.layer || 0,
    path: [],
  };
  if (events && events.emit) {
    events.emit('pet_summoned', { player, petId, def });
  }
  return { ok: true, def, follower: s.follower };
}

function dismissPet(player) {
  const s = ensureState(player);
  if (!s.active) return { ok: false, reason: 'no_active' };
  const petId = s.active;
  const def = getPetDef(petId);
  s.active = null;
  s.follower = null;
  if (events && events.emit) {
    events.emit('pet_dismissed', { player, petId, def });
  }
  return { ok: true, def, petId };
}

function currentPet(player) {
  const s = ensureState(player);
  if (!s.active) return null;
  const def = getPetDef(s.active);
  if (!def) return null;
  return {
    petId: s.active,
    name: s.nicknames[s.active] || def.name,
    examine: def.examine,
    category: def.category,
    affinity: s.affinity[s.active] || 0,
    level: s.level[s.active] || 1,
    shiny: !!s.shiny[s.active],
    combatEligible: !!def.combatEligible,
    damageShare: def.damageShare,
    follower: s.follower ? { x: s.follower.x, y: s.follower.y, layer: s.follower.layer } : null,
  };
}

function computeBehindX(player) {
  const facing = player.facing || player.lastFacing || 'south';
  const x = player.x != null ? player.x : 0;
  if (facing === 'east')  return x - 1;
  if (facing === 'west')  return x + 1;
  return x; // north/south: same column
}

function computeBehindY(player) {
  const facing = player.facing || player.lastFacing || 'south';
  const y = player.y != null ? player.y : 0;
  if (facing === 'north') return y - 1;
  if (facing === 'south') return y + 1;
  return y + 1; // default: one tile south
}

// ── Affinity / Feeding ──────────────────────────────────────────────────────

function computeLevel(value) {
  let lvl = 1;
  for (let i = 1; i < AFFINITY_PER_LEVEL.length; i++) {
    if (value >= AFFINITY_PER_LEVEL[i]) lvl = i + 1;
  }
  return clamp(lvl, 1, 10);
}

function bumpAffinity(player, petId, delta) {
  const s = ensureState(player);
  if (s.unlocked.indexOf(petId) === -1) return { ok: false, reason: 'not_unlocked' };
  const before = s.affinity[petId] || 0;
  const after = clamp(before + delta, 0, 1000);
  s.affinity[petId] = after;
  const newLevel = computeLevel(after);
  const oldLevel = s.level[petId] || 1;
  s.level[petId] = newLevel;
  const levelUp = newLevel > oldLevel;
  let shinyUnlocked = false;
  if (newLevel >= 10 && !s.shiny[petId]) {
    s.shiny[petId] = true;
    shinyUnlocked = true;
  }
  if (levelUp && events && events.emit) {
    events.emit('pet_level_up', { player, petId, newLevel, shinyUnlocked });
  }
  return { ok: true, value: after, level: newLevel, levelUp, shinyUnlocked };
}

function getAffinity(player, petId) {
  const s = ensureState(player);
  const def = getPetDef(petId);
  if (!def) return null;
  const value = s.affinity[petId] || 0;
  const level = s.level[petId] || computeLevel(value);
  return {
    petId, value, level,
    shiny: !!s.shiny[petId],
    max: 1000,
    nextLevelAt: level < 10 ? AFFINITY_PER_LEVEL[level] : null,
    foods: def.foods.slice(),
  };
}

// Feeding the pet: consume one food from inventory, gain affinity. If the pet
// def declares `foods` (whitelist), only those items work. Otherwise any
// category=='food' item works but at a reduced bonus.
function feedPet(player, petId, foodItemId) {
  const s = ensureState(player);
  if (s.unlocked.indexOf(petId) === -1) return { ok: false, reason: 'not_unlocked' };
  const def = getPetDef(petId);
  if (!def) return { ok: false, reason: 'unknown_pet' };

  const whitelisted = def.foods.length === 0 || def.foods.indexOf(foodItemId) !== -1;
  const amount = whitelisted ? 25 : 8;

  // Consume from inventory if possible. Caller can skip inventory logic by
  // passing an inventoryOverride (used by tests).
  let consumed = false;
  if (Array.isArray(player.inventory)) {
    for (let i = 0; i < player.inventory.length; i++) {
      const slot = player.inventory[i];
      if (slot && slot.id === foodItemId) {
        slot.count = (slot.count || 1) - 1;
        if (slot.count <= 0) player.inventory[i] = null;
        consumed = true;
        break;
      }
    }
    if (!consumed) return { ok: false, reason: 'food_not_in_inventory' };
  }

  const bump = bumpAffinity(player, petId, amount);
  s.stats.feeds++;
  if (events && events.emit) {
    events.emit('pet_fed', { player, petId, foodItemId, amount, whitelisted, level: bump.level });
  }
  return { ok: true, consumed, amount, whitelisted, ...bump };
}

// ── Combat hooks ────────────────────────────────────────────────────────────

function onCombatStart(player) {
  const s = ensureState(player);
  if (!s.active) return;
  const def = getPetDef(s.active);
  if (!def) return;
  if (def.combatEligible) {
    // Combat-eligible pets follow into combat. No action.
    return;
  }
  // Passive pets: hide follower but remember pet id for auto-resume.
  s._suspendedFor = s.active;
  s.follower = null;
}

function onCombatEnd(player) {
  const s = ensureState(player);
  if (!s._suspendedFor) return;
  const petId = s._suspendedFor;
  s._suspendedFor = null;
  if (s.resumeAfterCombat && s.active === petId) {
    s.follower = {
      x: computeBehindX(player),
      y: computeBehindY(player),
      layer: player.layer || 0,
      path: [],
    };
  }
}

// Compute the pet's contribution to a damage roll. Capped at damageShare of
// the player's hit; in practice <= 1% for every registered pet.
function computePetDamageBonus(player, basePlayerDamage) {
  const cp = currentPet(player);
  if (!cp || !cp.combatEligible || !cp.damageShare) return 0;
  const bonus = Math.floor(basePlayerDamage * cp.damageShare);
  return clamp(bonus, 0, Math.ceil(basePlayerDamage * 0.01));
}

// ── Drop pipeline ───────────────────────────────────────────────────────────

/**
 * Called from the loot pipeline after a kill. Rolls every boss-pet associated
 * with the monster's sourceId. Appends awarded pets to `drops` (so the caller's
 * inventory/text code can surface them), unlocks them on the player, and
 * returns { drops, awardedPets: [petId] }.
 *
 * The pet is NOT added to inventory — it lives on player.pets. An "informative"
 * drop entry is appended to `drops` with `meta.pet = true` so the server can
 * announce it without trying to route it through the ground-item system.
 */
function onLootDrop(player, sourceId, drops) {
  if (!Array.isArray(drops)) drops = [];
  const awarded = [];
  for (const def of PET_DEFS.values()) {
    if (!def.bossId || def.bossId !== sourceId) continue;
    if (hasPet(player, def.id)) continue;
    const denom = Math.max(1, def.rarity);
    if (Math.random() < 1 / denom) {
      const res = unlockPet(player, def.id, { source: def.source, sourceId });
      if (res.ok && res.added) {
        drops.push({ id: def.id, name: def.name, count: 1, meta: { pet: true } });
        awarded.push(def.id);
      }
    }
  }
  return { drops, awardedPets: awarded };
}

function onSkillAction(player, skill, meta) {
  const awarded = [];
  for (const def of PET_DEFS.values()) {
    if (def.category !== 'skill' || def.skill !== skill) continue;
    if (hasPet(player, def.id)) continue;
    // Skilling pets scale with skill level: higher level = more common.
    // rarity is the "base" at level 1; at level 99 it's ~4x more common.
    const level = (player.skills && player.skills[skill] && player.skills[skill].level) || 1;
    const scaled = Math.max(1, Math.floor(def.rarity / (1 + level / 33)));
    if (Math.random() < 1 / scaled) {
      const res = unlockPet(player, def.id, { source: def.source, sourceId: skill });
      if (res.ok && res.added) awarded.push(def.id);
    }
  }
  return { awardedPets: awarded };
}

// ── Per-player tick ─────────────────────────────────────────────────────────

function tick(player, currentTick) {
  const s = ensureState(player);
  if (!s.active || !s.follower) return;
  // Follower path-follow: teleport to the tile 1 behind the player if we
  // drift too far (Manhattan distance > 3) — otherwise let the player's own
  // movement pull the follower along via closeness checks.
  const dist = Math.abs((s.follower.x || 0) - (player.x || 0))
             + Math.abs((s.follower.y || 0) - (player.y || 0));
  if (dist > 3 || s.follower.layer !== (player.layer || 0)) {
    s.follower.x = computeBehindX(player);
    s.follower.y = computeBehindY(player);
    s.follower.layer = player.layer || 0;
  }
  // Affinity drip while summoned: 1 point per 100 ticks (~60s).
  s.stats.ticksActive++;
  if (currentTick != null && currentTick % 100 === 0) {
    bumpAffinity(player, s.active, 1);
  }
  s.lastActiveTick[s.active] = currentTick != null ? currentTick : s.lastActiveTick[s.active] || 0;
}

// ── Rename / insure / rare utilities ────────────────────────────────────────

function renamePet(player, petId, newName) {
  const s = ensureState(player);
  if (s.unlocked.indexOf(petId) === -1) return { ok: false, reason: 'not_unlocked' };
  const name = String(newName || '').trim();
  if (!name) { delete s.nicknames[petId]; return { ok: true, cleared: true }; }
  if (name.length > 32) return { ok: false, reason: 'too_long' };
  s.nicknames[petId] = name;
  return { ok: true, name };
}

function setInsured(player, petId, flag) {
  const s = ensureState(player);
  if (s.unlocked.indexOf(petId) === -1) return { ok: false, reason: 'not_unlocked' };
  if (flag) s.insured[petId] = true; else delete s.insured[petId];
  return { ok: true, insured: !!s.insured[petId] };
}

// Hardcore death: uninsured pets are lost (removed from unlocked), insured
// pets are kept but affinity halved. Hook called from death.js.
function onHardcoreDeath(player) {
  const s = ensureState(player);
  const lost = [];
  const kept = [];
  for (const petId of s.unlocked.slice()) {
    if (s.insured[petId]) {
      s.affinity[petId] = Math.floor((s.affinity[petId] || 0) / 2);
      s.level[petId] = computeLevel(s.affinity[petId]);
      kept.push(petId);
    } else {
      const idx = s.unlocked.indexOf(petId);
      if (idx !== -1) s.unlocked.splice(idx, 1);
      delete s.affinity[petId];
      delete s.level[petId];
      delete s.shiny[petId];
      delete s.nicknames[petId];
      lost.push(petId);
    }
  }
  if (s.active && lost.indexOf(s.active) !== -1) {
    s.active = null;
    s.follower = null;
  }
  return { lost, kept };
}

// ── Engine integration ──────────────────────────────────────────────────────

function register(engine) {
  if (!engine || !engine.events || typeof engine.events.on !== 'function') return module.exports;

  engine.events.on('npc_kill', 'pets:drop-roll', ({ player, npc }) => {
    if (!player || !npc) return;
    const sourceId = npc.defId || (npc.name || '').toLowerCase().replace(/\s+/g, '_');
    onLootDrop(player, sourceId, []);
  });

  engine.events.on('skill_action', 'pets:skill-roll', ({ player, skill }) => {
    if (!player || !skill) return;
    onSkillAction(player, skill, {});
  });

  engine.events.on('combat_start', 'pets:combat-start', ({ player }) => {
    if (player) onCombatStart(player);
  });
  engine.events.on('combat_end', 'pets:combat-end', ({ player }) => {
    if (player) onCombatEnd(player);
  });

  engine.events.on('hardcore_died', 'pets:hardcore', ({ player }) => {
    if (player) onHardcoreDeath(player);
  });

  return module.exports;
}

module.exports = {
  // registry
  registerPetDef,
  getPetDef,
  listPetDefs,
  importCollection,

  // ownership
  unlockPet,
  hasPet,
  getPets,

  // follower
  summonPet,
  dismissPet,
  currentPet,

  // affinity/feed
  feedPet,
  getAffinity,
  bumpAffinity,
  computeLevel,

  // combat
  onCombatStart,
  onCombatEnd,
  computePetDamageBonus,

  // drops / skill rolls
  onLootDrop,
  onSkillAction,

  // misc
  renamePet,
  setInsured,
  onHardcoreDeath,

  // tick + engine plugin
  tick,
  register,

  // constants (useful for tests)
  AFFINITY_PER_LEVEL,
};
