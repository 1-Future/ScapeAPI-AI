// ══════════════════════════════════════════════════════════════════════════════
// Area-Locked Account Mode (Locke / Tomato Anarchy style)
//
// The player is confined to one region at a time. They start in their chosen
// region and cannot travel elsewhere until they CLEAR it — which means meeting
// a region-specific mix of quest, boss-kill, and skill-level conditions.
//
// Design bible references:
//   - Principle 08 (Breakpoint Progression): every cleared region is a HUGE
//     breakpoint — "this changes everything" at a whole-region scale.
//   - Principle 15 (Iron Man Philosophy): more content becomes non-degenerate.
//     A single region must sustain dozens of levels; every drop counts.
//   - Principle 17 (Trade-offs): much more limited content per level, but
//     every cross-region item is precious. We compensate with a small XP bonus
//     (10-20% by tier) and a cosmetic cape that changes colour per clear.
//
// Architecture (hook style — per rules):
//   - `area-gate-runner.addPreCheck(fn)`: area-locked subscribes to deny travel
//     to any region not in unlockedRegions. No direct mutation of the runner.
//   - `breakpoint-runner.addXpModifier(fn)`: area-locked multiplies incoming XP
//     by `xpBonusFor(player, regionId)` only while the player is earning XP
//     INSIDE the current region. This keeps breakpoint-runner clean; the hook
//     is the contract.
//
// Alternative considered: having commands/all.js wrap addXp manually and
// teaching area-gate-runner about the mode directly. Rejected — that forces
// every XP call-site and every entry call-site to know about the account
// mode, which violates the decoupled design of the engine bridge.
//
// Persistence: `player.areaLocked` is a plain JSON-serialisable object, so the
// existing player-save mechanism round-trips it automatically. No custom hook.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const tiles = require('../world/tiles');

// Lazy-required — breakpoint-runner and area-gate-runner both require this
// module indirectly in some boot orderings. Defer to first-use.
let areaGateRunner = null;
let breakpointRunner = null;
function _areaGateRunner() {
  if (!areaGateRunner) areaGateRunner = require('./area-gate-runner');
  return areaGateRunner;
}
function _breakpointRunner() {
  if (!breakpointRunner) breakpointRunner = require('./breakpoint-runner');
  return breakpointRunner;
}

// ── Canonical region order ───────────────────────────────────────────────────
// A player's journey proceeds along this sequence. Starting region can be any
// of the first 8 (the wilds is open content, not a starting choice). After
// clearing the first region, the wilds unlocks (no clear gate — risk IS the gate).
const REGION_ORDER = Object.freeze([
  'heartlands',
  'sootworks',
  'moryskah',
  'veilwood',
  'boneyard_wastes',
  'saltbrine_reach',
  'inkweald',
  'glass_desert',
]);

// Region aliases — area-gate IDs do not always match the "region" key used by
// death-commands, world-layout, etc. This maps the short name (as used in
// `/areamode start <region>`) to the canonical region id above.
const REGION_ALIASES = Object.freeze({
  heartlands:      'heartlands',
  sootworks:       'sootworks',
  moryskah:        'moryskah',
  veilwood:        'veilwood',
  boneyard:        'boneyard_wastes',
  boneyard_wastes: 'boneyard_wastes',
  saltbrine:       'saltbrine_reach',
  saltbrine_reach: 'saltbrine_reach',
  inkweald:        'inkweald',
  glass_desert:    'glass_desert',
  glassdesert:     'glass_desert',
  wilds:           'the_wilds',
  the_wilds:       'the_wilds',
});

function canonicalRegion(input) {
  if (!input) return null;
  const key = String(input).toLowerCase().replace(/[^a-z_]/g, '');
  return REGION_ALIASES[key] || null;
}

// ── Clear conditions per region ──────────────────────────────────────────────
// Each region has a clear-condition object. Conditions are ALL required (AND),
// unless the `any` flag is set (in which case one of the listed items suffices).
// The task spec explicitly lists these; do not change without review.
const CLEAR_CONDITIONS = Object.freeze({
  heartlands: {
    quest: 'rfd_finale',
    totalLevel: 200,
    description: 'Complete Recipe for Disaster — Finale AND reach total level 200.',
  },
  sootworks: {
    quest: 'sootworks_rising',
    skill: { mining: 70 },
    description: 'Complete Sootworks Rising AND reach Mining 70.',
  },
  moryskah: {
    quest: 'the_bog_witchs_bargain',
    bossKill: { barrows_any: 1 },
    description: "Complete The Bog Witch's Bargain AND defeat one Barrows brother.",
  },
  veilwood: {
    quest: 'song_of_the_elves_aelgard',
    skill: { hunter: 60 },
    description: 'Complete Song of the Elves (Aelgard) AND reach Hunter 60.',
  },
  boneyard_wastes: {
    quest: 'echoes_of_the_deep',
    skill: { slayer: 50 },
    description: 'Complete Echoes of the Deep AND reach Slayer 50.',
  },
  saltbrine_reach: {
    quest: 'pirate_king',
    skill: { fishing: 70 },
    description: 'Complete Pirate King AND reach Fishing 70.',
  },
  inkweald: {
    quests: ['the_inkweald_door', 'lunar_diplomacy'],
    description: 'Complete The Inkweald Door AND Lunar Diplomacy.',
  },
  glass_desert: {
    bossKill: { crystal_wyrm: 1 },
    description: 'Defeat the Crystal Wyrm.',
  },
  the_wilds: {
    // Wilds is open content — no clear gate. Unlocked automatically after the
    // first region is cleared (per spec).
    open: true,
    description: 'Open content. No clear gate.',
  },
});

// ── Public API ───────────────────────────────────────────────────────────────

function isAreaLocked(player) {
  return !!(player && player.areaLocked && player.areaLocked.mode === 'area_locked');
}

function clearConditions(regionId) {
  const canon = canonicalRegion(regionId) || regionId;
  const c = CLEAR_CONDITIONS[canon];
  if (!c) return null;
  // Return a shallow copy so callers can't mutate our table.
  return Object.assign({}, c);
}

function enableMode(player, startingRegion) {
  if (!player) throw new Error('area-locked.enableMode: player required');
  if (isAreaLocked(player)) {
    return { ok: false, reason: 'Already in Area-Locked mode. The choice is permanent.' };
  }
  const canon = canonicalRegion(startingRegion);
  if (!canon) return { ok: false, reason: `Unknown region: ${startingRegion}` };
  if (canon === 'the_wilds') return { ok: false, reason: 'The Wilds cannot be a starting region.' };
  if (!REGION_ORDER.includes(canon)) {
    return { ok: false, reason: `${canon} is not a valid starting region.` };
  }

  // Build initial clear-state scaffolding so save/load round-trips carry the
  // same shape even before any condition is met.
  const clearStates = {};
  for (const rid of REGION_ORDER) {
    clearStates[rid] = scaffoldClearState(rid);
  }
  // The Wilds has its own tracking (always open — flagged unlocked after the
  // first region clear).
  clearStates[the_wilds_key()] = { open: true, cleared: false };

  player.areaLocked = {
    mode: 'area_locked',
    startingRegion: canon,
    currentRegion: canon,
    unlockedRegions: [canon],
    clearStates,
    enabledAt: Date.now(),
    clears: 0,       // how many regions cleared (→ drives cape colour tier)
  };
  return { ok: true, areaLocked: player.areaLocked };
}

function scaffoldClearState(regionId) {
  const c = CLEAR_CONDITIONS[regionId] || {};
  return {
    cleared: false,
    quest: c.quest ? false : null,
    quests: c.quests ? c.quests.reduce((o, q) => (o[q] = false, o), {}) : null,
    bossKill: c.bossKill ? Object.keys(c.bossKill).reduce((o, k) => (o[k] = 0, o), {}) : null,
    skill: c.skill ? Object.keys(c.skill).reduce((o, k) => (o[k] = 0, o), {}) : null,
    totalLevel: c.totalLevel ? 0 : null,
  };
}

function the_wilds_key() { return 'the_wilds'; }

// ── Region access check ──────────────────────────────────────────────────────
// Subscribed as a pre-check hook on area-gate-runner.  Returns null to pass
// (not area-locked, or region is unlocked) or { ok:false, reason } to deny.

function canEnterRegion(player, regionId) {
  if (!isAreaLocked(player)) return { allowed: true, reason: null };
  const canon = canonicalRegion(regionId) || regionId;
  const cur = player.areaLocked.currentRegion;
  if (canon === player.areaLocked.currentRegion || player.areaLocked.unlockedRegions.includes(canon)) {
    return { allowed: true, reason: null };
  }
  return {
    allowed: false,
    reason: `You are an Area-Locked Adventurer. You must first clear ${cur} to travel.`,
  };
}

// Resolve a gated-area id (e.g. "moryskah_slayer_tower") down to its region
// (e.g. "moryskah"). Falls back to the id itself if no region is defined.
function regionForArea(areaId) {
  // Avoid circular: tiles.areas only has bounding boxes. Relationship registry
  // stores `region` on each gate. Use the gate registry.
  const rel = require('../data/relationships');
  const gate = rel.getAreaGate(areaId);
  if (gate && gate.region) return gate.region;
  return areaId;
}

// Hook function: returns null to pass, { ok:false, reason } to deny.
function areaGatePreCheck(player, areaId) {
  if (!isAreaLocked(player)) return null;
  const region = regionForArea(areaId);
  // Wilds is always allowed once unlocked (per spec: opens after first region
  // cleared). Before the first clear, it's locked like everything else.
  if (region === the_wilds_key()) {
    if (player.areaLocked.clears >= 1) return null;
    return {
      ok: false,
      reason: `You are an Area-Locked Adventurer. You must first clear ${player.areaLocked.currentRegion} to travel.`,
    };
  }
  if (player.areaLocked.unlockedRegions.includes(region)) return null;
  return {
    ok: false,
    reason: `You are an Area-Locked Adventurer. You must first clear ${player.areaLocked.currentRegion} to travel.`,
  };
}

// ── Clear-condition evaluation ───────────────────────────────────────────────

function evaluateClearState(player, regionId) {
  const canon = canonicalRegion(regionId) || regionId;
  const cond = CLEAR_CONDITIONS[canon];
  if (!cond) return { cleared: false, reason: `unknown region: ${canon}` };
  if (cond.open) return { cleared: true };

  const state = player.areaLocked?.clearStates?.[canon];
  const progress = {
    quest: null,
    quests: null,
    bossKill: null,
    skill: null,
    totalLevel: null,
  };
  const missing = [];

  // Quest (single)
  if (cond.quest) {
    const done = !!player.questProgress?.[cond.quest]?.complete;
    progress.quest = { id: cond.quest, done };
    if (!done) missing.push(`quest: ${cond.quest}`);
  }
  // Quests (multi, all required)
  if (cond.quests) {
    progress.quests = {};
    for (const q of cond.quests) {
      const done = !!player.questProgress?.[q]?.complete;
      progress.quests[q] = done;
      if (!done) missing.push(`quest: ${q}`);
    }
  }
  // Boss kills
  if (cond.bossKill) {
    progress.bossKill = {};
    for (const [bossId, need] of Object.entries(cond.bossKill)) {
      let have = 0;
      if (bossId === 'barrows_any') {
        // Special: any one of the six brothers counts.
        const brothers = ['ahrim','dharok','guthan','karil','torag','verac'];
        have = brothers.reduce((sum, b) => sum + (player.bossKills?.[b] || 0), 0);
      } else {
        have = player.bossKills?.[bossId] || 0;
      }
      progress.bossKill[bossId] = { have, need };
      if (have < need) missing.push(`boss: ${bossId} (${have}/${need})`);
    }
  }
  // Skills
  if (cond.skill) {
    progress.skill = {};
    for (const [skill, lvl] of Object.entries(cond.skill)) {
      const have = player.skills?.[skill]?.level || 0;
      progress.skill[skill] = { have, need: lvl };
      if (have < lvl) missing.push(`skill: ${skill} ${have}/${lvl}`);
    }
  }
  // Total level
  if (cond.totalLevel) {
    const have = totalLevel(player);
    progress.totalLevel = { have, need: cond.totalLevel };
    if (have < cond.totalLevel) missing.push(`total level: ${have}/${cond.totalLevel}`);
  }

  // Persist the snapshot into clearStates so /areamode status reports match.
  if (state) {
    if (progress.quest)      state.quest = progress.quest.done;
    if (progress.quests)     state.quests = progress.quests;
    if (progress.bossKill)   state.bossKill = Object.fromEntries(
      Object.entries(progress.bossKill).map(([k, v]) => [k, v.have])
    );
    if (progress.skill)      state.skill = Object.fromEntries(
      Object.entries(progress.skill).map(([k, v]) => [k, v.have])
    );
    if (progress.totalLevel) state.totalLevel = progress.totalLevel.have;
  }

  return {
    cleared: missing.length === 0,
    missing,
    progress,
    description: cond.description || '',
  };
}

function totalLevel(p) {
  if (!p || !p.skills) return 0;
  let t = 0;
  for (const k of Object.keys(p.skills)) {
    t += p.skills[k]?.level || 0;
  }
  return t;
}

function nextRegionFor(player) {
  if (!isAreaLocked(player)) return null;
  const cur = player.areaLocked.currentRegion;
  const idx = REGION_ORDER.indexOf(cur);
  if (idx < 0) return null;
  if (idx + 1 >= REGION_ORDER.length) return null; // final region, nothing after
  return REGION_ORDER[idx + 1];
}

function clearRegion(player, regionId) {
  if (!isAreaLocked(player)) return { ok: false, reason: 'not in area-locked mode' };
  const canon = canonicalRegion(regionId) || regionId;
  if (!REGION_ORDER.includes(canon)) {
    return { ok: false, reason: `${canon} is not a clearable region` };
  }
  const state = player.areaLocked.clearStates[canon];
  if (state && state.cleared) {
    return { ok: false, reason: 'already cleared', already: true };
  }
  const check = evaluateClearState(player, canon);
  if (!check.cleared) {
    return { ok: false, reason: 'clear conditions not met', missing: check.missing };
  }
  state.cleared = true;
  player.areaLocked.clears++;
  // Unlock the next region in sequence (if any).
  const nextIdx = REGION_ORDER.indexOf(canon) + 1;
  let unlocked = null;
  if (nextIdx < REGION_ORDER.length) {
    unlocked = REGION_ORDER[nextIdx];
    if (!player.areaLocked.unlockedRegions.includes(unlocked)) {
      player.areaLocked.unlockedRegions.push(unlocked);
    }
    // Advance current pointer so /areamode next + /areamode status reflect
    // the new active target.
    player.areaLocked.currentRegion = unlocked;
  }
  // Unlock the Wilds after first clear, if not already unlocked.
  if (player.areaLocked.clears >= 1 &&
      !player.areaLocked.unlockedRegions.includes('the_wilds')) {
    player.areaLocked.unlockedRegions.push('the_wilds');
  }
  return {
    ok: true,
    cleared: canon,
    clears: player.areaLocked.clears,
    unlocked,
    unlockedRegions: player.areaLocked.unlockedRegions.slice(),
  };
}

// ── XP bonus ─────────────────────────────────────────────────────────────────
// 1.10 default, scales by tier. Tier = number of regions already cleared.
//   tier 0  → 1.10
//   tier 1  → 1.12
//   tier 2  → 1.14
//   tier 3  → 1.16
//   tier 4+ → 1.20
//
// Bonus ONLY applies when the player is physically standing inside the
// CURRENT region (so moving back to Heartlands for its bonus after clearing it
// doesn't work — the bonus always tracks the next thing to clear).

function xpBonusFor(player, regionId) {
  if (!isAreaLocked(player)) return 1.0;
  const canon = canonicalRegion(regionId) || regionId;
  if (canon !== player.areaLocked.currentRegion) return 1.0;
  const tier = player.areaLocked.clears || 0;
  const table = [1.10, 1.12, 1.14, 1.16, 1.20];
  return table[Math.min(tier, table.length - 1)];
}

// ── Region bounding-box table for tiles.areas ────────────────────────────────
// tiles.areas does NOT contain a heartlands box (the starter area is the open
// map around (100, 90)). And saltbrine is defined in tiles.areas as `saltbrine`
// but the gate registry names the region `saltbrine_reach`.  Map tile-area →
// canonical-region (spec) so the position lookup returns the correct region.
const TILE_AREA_TO_REGION = Object.freeze({
  boneyard_wastes: 'boneyard_wastes',
  moryskah:        'moryskah',
  veilwood:        'veilwood',
  sootworks:       'sootworks',
  saltbrine:       'saltbrine_reach',
  inkweald:        'inkweald',
  glass_desert:    'glass_desert',
  the_wilds:       'the_wilds',
});

// Rough fallback box for heartlands (no explicit bounding box in tiles.areas).
// Derived from world-layout.js: "Heartlands center (100, 90)" — region spans
// roughly x: 60-150, y: 60-120 between the other regions.
const HEARTLANDS_BOX = Object.freeze({ x1: 60, y1: 60, x2: 150, y2: 120, layer: 0 });

// What region is the player physically in? Uses tiles.areas bounding boxes,
// with a heartlands-fallback for the un-boxed starter region.
function currentPlayerRegion(player) {
  if (!player || player.x == null || player.y == null) return null;
  const layer = player.layer || 0;
  // Prefer region-level tile areas (largest-first so sub-areas inside a region
  // resolve correctly).
  for (const [areaId, a] of tiles.areas) {
    if (!TILE_AREA_TO_REGION[areaId]) continue;
    if (player.x >= a.x1 && player.x <= a.x2 &&
        player.y >= a.y1 && player.y <= a.y2 &&
        (a.layer || 0) === layer) {
      return TILE_AREA_TO_REGION[areaId];
    }
  }
  // Heartlands fallback — no explicit box in tiles.areas.
  if (player.x >= HEARTLANDS_BOX.x1 && player.x <= HEARTLANDS_BOX.x2 &&
      player.y >= HEARTLANDS_BOX.y1 && player.y <= HEARTLANDS_BOX.y2 &&
      layer === HEARTLANDS_BOX.layer) {
    return 'heartlands';
  }
  return null;
}

// Hook function for breakpoint-runner.addXpModifier.
function xpModifier(player, skill, amount) {
  if (!isAreaLocked(player)) return amount;
  const region = currentPlayerRegion(player);
  if (!region) return amount;
  const mult = xpBonusFor(player, region);
  if (mult === 1.0) return amount;
  return Math.floor(amount * mult);
}

// ── Wiring: subscribe to hooks exactly once ──────────────────────────────────
// Call attach() during server bootstrap. Idempotent.
let _attached = false;
function attach() {
  if (_attached) return;
  _attached = true;
  _areaGateRunner().addPreCheck(areaGatePreCheck);
  _breakpointRunner().addXpModifier(xpModifier);
}

// ── Status helpers (used by commands) ────────────────────────────────────────

function status(player) {
  if (!isAreaLocked(player)) return { mode: null };
  const cur = player.areaLocked.currentRegion;
  const check = evaluateClearState(player, cur);
  const next = nextRegionFor(player);
  return {
    mode: 'area_locked',
    startingRegion: player.areaLocked.startingRegion,
    currentRegion: cur,
    unlockedRegions: player.areaLocked.unlockedRegions.slice(),
    clears: player.areaLocked.clears,
    xpBonus: xpBonusFor(player, cur),
    currentClear: check,
    nextRegion: next,
    capeColor: capeColorForTier(player.areaLocked.clears || 0),
  };
}

// Cape colour shifts per tier. Cosmetic only.
const CAPE_COLORS = ['white', 'green', 'blue', 'purple', 'red', 'gold', 'prismatic'];
function capeColorForTier(tier) {
  return CAPE_COLORS[Math.min(tier, CAPE_COLORS.length - 1)];
}

module.exports = {
  enableMode,
  canEnterRegion,
  clearRegion,
  nextRegionFor,
  xpBonusFor,
  clearConditions,
  isAreaLocked,
  // extras used by commands / tests
  evaluateClearState,
  currentPlayerRegion,
  status,
  attach,
  areaGatePreCheck,
  xpModifier,
  canonicalRegion,
  REGION_ORDER,
  CLEAR_CONDITIONS,
  capeColorForTier,
};
