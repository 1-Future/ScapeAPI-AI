// ══════════════════════════════════════════════════════════════════════════════
// Raid Invocation Engine
//
// OSRS Tombs of Amascut-style invocation system. Players toggle invocations
// before a raid begins. Each toggled invocation:
//
//   - adds (or subtracts) a raid-level point weight
//   - activates a scaling effect (hp/damage/speed multipliers, mechanic adds)
//
// API
// ---
// availableInvocations(raidId)                  -> invocation records
// toggleInvocation(player, raidId, invId)       -> { ok, state, reason? }
// currentInvocationLevel(player, raidId)        -> int (0 - ~600)
// scaledDifficulty(raidId, level)               -> multipliers for engine
// onRaidStart(player, raidId)                   -> locks invocations, returns snapshot
// onRaidComplete(player, raidId, successStats)  -> { points, rewards }
// pointsTable(raidId, level, perf)              -> { bucket, rolls, unique }
//
// Player state is held on player.raidInvocations -- a Map of raidId ->
// {
//   enabled:  Set<invId>          // active invocations
//   locked:   boolean             // true during an active raid
//   startedAt: number|null        // tick at raid start
//   snapshot: object|null         // frozen config at raid start
// }
//
// The engine does NOT rewrite raid logic. It provides hooks that existing
// raid code can read (via scaledDifficulty + snapshot) to apply multipliers.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const invocationData = require('../content/aelgard/invocations-data');

// ── Internal helpers ────────────────────────────────────────────────────────

function _ensurePlayerState(player) {
  if (!player.raidInvocations) {
    // Map preserves insertion order; per raid we store state.
    player.raidInvocations = new Map();
  }
  return player.raidInvocations;
}

function _getRaidState(player, raidId) {
  const store = _ensurePlayerState(player);
  if (!store.has(raidId)) {
    // Default: enable any "positive" invocations (matches OSRS ToA UX).
    const defaults = new Set();
    const list = invocationData.getInvocationsForRaid(raidId) || [];
    for (const inv of list) {
      if (inv.defaultOn) defaults.add(inv.id);
    }
    store.set(raidId, {
      enabled: defaults,
      locked: false,
      startedAt: null,
      snapshot: null,
    });
  }
  return store.get(raidId);
}

// ══════════════════════════════════════════════════════════════════════════════
// 1. availableInvocations
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Return the full invocation list for a raid. Returns [] if raid unknown.
 */
function availableInvocations(raidId) {
  return invocationData.getInvocationsForRaid(raidId) || [];
}

// ══════════════════════════════════════════════════════════════════════════════
// 2. toggleInvocation
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Toggle a single invocation ON or OFF. Returns { ok, state, reason? }.
 * Rejects if the raid is locked or conflicts exist.
 */
function toggleInvocation(player, raidId, invId) {
  const inv = invocationData.getInvocation(raidId, invId);
  if (!inv) {
    return { ok: false, state: null, reason: 'unknown_invocation' };
  }
  const state = _getRaidState(player, raidId);
  if (state.locked) {
    return { ok: false, state: 'locked', reason: 'raid_in_progress' };
  }

  if (state.enabled.has(invId)) {
    // Toggle OFF
    state.enabled.delete(invId);
    return { ok: true, state: 'off' };
  }

  // Conflict check: if any listed conflict is enabled, reject.
  for (const conflictId of (inv.conflictsWith || [])) {
    if (state.enabled.has(conflictId)) {
      return { ok: false, state: 'off', reason: `conflicts_with:${conflictId}` };
    }
  }

  state.enabled.add(invId);
  return { ok: true, state: 'on' };
}

// ══════════════════════════════════════════════════════════════════════════════
// 3. currentInvocationLevel
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Return the player's current raid level for a raid (sum of enabled
 * invocation weights). Clamped at 0 on the low end. No upper clamp
 * (OSRS ToA cap is 600 but players can build higher theoretically).
 */
function currentInvocationLevel(player, raidId) {
  const state = _getRaidState(player, raidId);
  const list = invocationData.getInvocationsForRaid(raidId) || [];
  let level = 0;
  for (const inv of list) {
    if (state.enabled.has(inv.id)) {
      level += inv.raidLevel;
    }
  }
  // Clamp: raid level cannot go below 0. Positive invocations cap the
  // downside (turning them off below the point floor does nothing further).
  return Math.max(0, level);
}

// ══════════════════════════════════════════════════════════════════════════════
// 4. scaledDifficulty
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Return a combined multipliers object, built by merging the effect fields
 * of every ENABLED invocation. Raid-code can read this to scale NPC HP,
 * damage, attack speed, etc.
 *
 * For numeric multipliers (hpMultiplier, damageMultiplier,
 * bossAttackSpeedMultiplier, prayerDrainMultiplier, monsterAccuracyMultiplier,
 * supplyDropMultiplier, protectionPrayerEffectiveness) values MULTIPLY.
 * For booleans (playerCanRun, prayerDisabled, projectilesAlwaysHit,
 * failOnDeath, suppressFoodDrops, pillarsDisabled), any TRUE wins.
 * For additive numeric bonuses (bossAttackSpeedBonus, enrageSpeedBonus,
 * freeDeaths, wrongPrayerDamage, etc.) values SUM (except freeDeaths which
 * takes MIN -- Hardcore overrides Softcore when both are enabled).
 *
 * Also includes:
 *   level           -- current raid level
 *   enabledCount    -- number of enabled invocations
 *   enabledIds      -- array of enabled invocation ids
 */
function scaledDifficulty(raidId, level) {
  // If a player is not given we still want an "at this level" effect summary.
  // In normal use the engine calls with a level derived from a player's state,
  // but the function is pure on its arguments (raidId + level) when a player
  // isn't available. To keep the API clean we accept two call shapes:
  //
  //   scaledDifficulty(raidId, level)       -- used with a level int
  //   scaledDifficulty(raidId, playerState) -- used with a player raid-state
  //                                            object that has .enabled Set.
  //
  // Both return a multipliers object. The level-only form cannot enumerate
  // the exact invocations, so it returns a linear approximation used by the
  // RL agent for curriculum training.
  if (typeof level === 'number') {
    // Approximation path: return a monotone scaling derived from level.
    // Each +100 raid level adds ~20% HP and ~15% damage, clamped.
    const scale = level / 100;
    return {
      level,
      enabledCount: 0,
      enabledIds: [],
      hpMultiplier: 1 + 0.20 * scale,
      damageMultiplier: 1 + 0.15 * scale,
      bossAttackSpeedMultiplier: 1 + 0.05 * scale,
      monsterAccuracyMultiplier: 1 + 0.10 * scale,
      protectionPrayerEffectiveness: Math.max(0.50, 1 - 0.05 * scale),
      bossAttackSpeedBonus: 0,
      enrageSpeedBonus: 0,
      enrageDamageMultiplier: 1,
      freeDeaths: Infinity,
      wrongPrayerDamage: 0,
      suppressFoodDrops: false,
      prayerDisabled: false,
      playerCanRun: true,
      projectilesAlwaysHit: false,
      failOnDeath: false,
      pillarsDisabled: false,
      supplyDropMultiplier: 1,
      prayerDrainMultiplier: 1,
      approximation: true,
    };
  }

  // Full path: callers pass a raid state object with .enabled Set
  const state = level;
  const enabled = (state && state.enabled) || new Set();
  const list = invocationData.getInvocationsForRaid(raidId) || [];

  const result = {
    level: 0,
    enabledCount: enabled.size,
    enabledIds: Array.from(enabled),
    // Multiplicative fields (default 1.0)
    hpMultiplier: 1.0,
    damageMultiplier: 1.0,
    bossAttackSpeedMultiplier: 1.0,
    monsterAccuracyMultiplier: 1.0,
    protectionPrayerEffectiveness: 1.0,
    prayerDrainMultiplier: 1.0,
    supplyDropMultiplier: 1.0,
    tornadoSpawnMultiplier: 1.0,
    tornadoSpeedMultiplier: 1.0,
    zukShieldSpeedMultiplier: 1.0,
    craftedGearStatMultiplier: 1.0,
    nodeDensityMultiplier: 1.0,
    transitionTimeMultiplier: 1.0,
    specialFrequencyMultiplier: 1.0,
    // Additive integer bonuses (default 0)
    bossAttackSpeedBonus: 0,
    enrageSpeedBonus: 0,
    wrongPrayerDamage: 0,
    bloatShockwaveDamage: 0,
    serpentBeamDamage: 0,
    zebakFloodDamage: 0,
    babaRockfallDamage: 0,
    kephriEliteHp: 0,
    // Special: freeDeaths starts Infinity so MIN reduces it
    freeDeaths: Infinity,
    // Enrage mechanics
    enrageThreshold: null,
    enrageDamageMultiplier: 1.0,
    coreExposureTicks: null,
    // Booleans (default false)
    suppressFoodDrops: false,
    prayerDisabled: false,
    playerCanRun: true,
    projectilesAlwaysHit: false,
    failOnDeath: false,
    pillarsDisabled: false,
    maidenBloodPersistent: false,
    nyloStyleRandom: false,
    randomEnrageWaves: false,
    vanguardSyncInterval: null,
    // Counts
    jadsOnTripleJadWave: null,
    sotetsegDeathBalls: null,
    vespulaSpawnBonus: 0,
    hunllefStyleSwitchInterval: null,
    akkhaMirrorReflect: 0,
    babaRockfallInterval: null,
    prepTimerMinutes: null,
    verzikP3Threshold: null,
    // Source
    approximation: false,
  };

  for (const inv of list) {
    if (!enabled.has(inv.id)) continue;
    result.level += inv.raidLevel;
    const eff = inv.effect || {};

    // Multiplicative
    if (eff.hpMultiplier != null) result.hpMultiplier *= eff.hpMultiplier;
    if (eff.damageMultiplier != null) result.damageMultiplier *= eff.damageMultiplier;
    if (eff.bossAttackSpeedMultiplier != null) result.bossAttackSpeedMultiplier *= eff.bossAttackSpeedMultiplier;
    if (eff.monsterAccuracyMultiplier != null) result.monsterAccuracyMultiplier *= eff.monsterAccuracyMultiplier;
    if (eff.protectionPrayerEffectiveness != null) result.protectionPrayerEffectiveness *= eff.protectionPrayerEffectiveness;
    if (eff.prayerDrainMultiplier != null) result.prayerDrainMultiplier *= eff.prayerDrainMultiplier;
    if (eff.supplyDropMultiplier != null) result.supplyDropMultiplier *= eff.supplyDropMultiplier;
    if (eff.tornadoSpawnMultiplier != null) result.tornadoSpawnMultiplier *= eff.tornadoSpawnMultiplier;
    if (eff.tornadoSpeedMultiplier != null) result.tornadoSpeedMultiplier *= eff.tornadoSpeedMultiplier;
    if (eff.zukShieldSpeedMultiplier != null) result.zukShieldSpeedMultiplier *= eff.zukShieldSpeedMultiplier;
    if (eff.craftedGearStatMultiplier != null) result.craftedGearStatMultiplier *= eff.craftedGearStatMultiplier;
    if (eff.nodeDensityMultiplier != null) result.nodeDensityMultiplier *= eff.nodeDensityMultiplier;
    if (eff.transitionTimeMultiplier != null) result.transitionTimeMultiplier *= eff.transitionTimeMultiplier;
    if (eff.specialFrequencyMultiplier != null) result.specialFrequencyMultiplier *= eff.specialFrequencyMultiplier;
    if (eff.enrageDamageMultiplier != null) result.enrageDamageMultiplier *= eff.enrageDamageMultiplier;

    // Additive
    if (eff.bossAttackSpeedBonus != null) result.bossAttackSpeedBonus += eff.bossAttackSpeedBonus;
    if (eff.enrageSpeedBonus != null) result.enrageSpeedBonus += eff.enrageSpeedBonus;
    if (eff.wrongPrayerDamage != null) result.wrongPrayerDamage += eff.wrongPrayerDamage;
    if (eff.bloatShockwaveDamage != null) result.bloatShockwaveDamage += eff.bloatShockwaveDamage;
    if (eff.serpentBeamDamage != null) result.serpentBeamDamage += eff.serpentBeamDamage;
    if (eff.zebakFloodDamage != null) result.zebakFloodDamage += eff.zebakFloodDamage;
    if (eff.babaRockfallDamage != null) result.babaRockfallDamage += eff.babaRockfallDamage;
    if (eff.kephriEliteHp != null) result.kephriEliteHp += eff.kephriEliteHp;
    if (eff.vespulaSpawnBonus != null) result.vespulaSpawnBonus += eff.vespulaSpawnBonus;
    if (eff.akkhaMirrorReflect != null) result.akkhaMirrorReflect += eff.akkhaMirrorReflect;

    // MIN (freeDeaths: lower is more strict, hardcore wins over softcore)
    if (eff.freeDeaths != null) result.freeDeaths = Math.min(result.freeDeaths, eff.freeDeaths);

    // Latest-wins fields (rare, but for scalar thresholds)
    if (eff.enrageThreshold != null) result.enrageThreshold = eff.enrageThreshold;
    if (eff.wardenCoreExposureTicks != null) result.coreExposureTicks = eff.wardenCoreExposureTicks;
    if (eff.vanguardSyncInterval != null) result.vanguardSyncInterval = eff.vanguardSyncInterval;
    if (eff.jadsOnTripleJadWave != null) result.jadsOnTripleJadWave = eff.jadsOnTripleJadWave;
    if (eff.sotetsegDeathBalls != null) result.sotetsegDeathBalls = eff.sotetsegDeathBalls;
    if (eff.hunllefStyleSwitchInterval != null) result.hunllefStyleSwitchInterval = eff.hunllefStyleSwitchInterval;
    if (eff.babaRockfallInterval != null) result.babaRockfallInterval = eff.babaRockfallInterval;
    if (eff.prepTimerMinutes != null) result.prepTimerMinutes = eff.prepTimerMinutes;
    if (eff.verzikP3Threshold != null) result.verzikP3Threshold = eff.verzikP3Threshold;

    // Booleans (OR)
    if (eff.suppressFoodDrops) result.suppressFoodDrops = true;
    if (eff.prayerDisabled) result.prayerDisabled = true;
    if (eff.projectilesAlwaysHit) result.projectilesAlwaysHit = true;
    if (eff.failOnDeath) result.failOnDeath = true;
    if (eff.pillarsDisabled) result.pillarsDisabled = true;
    if (eff.maidenBloodPersistent) result.maidenBloodPersistent = true;
    if (eff.nyloStyleRandom) result.nyloStyleRandom = true;
    if (eff.randomEnrageWaves) result.randomEnrageWaves = true;
    // playerCanRun defaults true; any false wins
    if (eff.playerCanRun === false) result.playerCanRun = false;
  }

  // Clamp level
  if (result.level < 0) result.level = 0;

  // If freeDeaths remained Infinity, emit null so callers don't have to know
  if (result.freeDeaths === Infinity) result.freeDeaths = null;

  return result;
}

// ══════════════════════════════════════════════════════════════════════════════
// 5. onRaidStart -- lock invocations, snapshot state
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Called when a raid begins. Locks the invocation set so it can't be
 * changed mid-raid, snapshots the scaled difficulty, and records the
 * start tick. Returns the snapshot.
 */
function onRaidStart(player, raidId, startTick) {
  const state = _getRaidState(player, raidId);
  state.locked = true;
  state.startedAt = typeof startTick === 'number' ? startTick : 0;
  state.snapshot = scaledDifficulty(raidId, state);
  state.snapshot.raidId = raidId;
  state.snapshot.startedAt = state.startedAt;
  return state.snapshot;
}

// ══════════════════════════════════════════════════════════════════════════════
// 6. onRaidComplete -- unlock + compute rewards
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Called at the end of a raid (success or wipe). Unlocks the invocation
 * set so the player can adjust for the next attempt. Computes points +
 * loot rolls based on successStats:
 *   deaths           -- number of deaths during the raid (default 0)
 *   hpLostPct        -- percentage of max-hp taken as damage (0..N)
 *   ticksTaken       -- total ticks elapsed
 *   beatParTime      -- bool; shortcut for ticksTaken <= parTime
 *   kc               -- player's prior completion count for this raid
 *   success          -- false if raid failed; still return points but floor
 */
function onRaidComplete(player, raidId, successStats) {
  const state = _getRaidState(player, raidId);
  const level = state.snapshot ? state.snapshot.level : currentInvocationLevel(player, raidId);
  const config = invocationData.getPointConfig(raidId);

  const perf = _normalizePerf(successStats, config);
  const points = _computePoints(config, level, perf);
  const rewards = pointsTable(raidId, level, points);

  // Unlock for next run
  state.locked = false;
  state.startedAt = null;

  return { points, level, rewards, perf, success: perf.success };
}

function _normalizePerf(stats, config) {
  stats = stats || {};
  const parTimeTicks = (config && config.parTimeTicks) || 6000;
  const ticksTaken = stats.ticksTaken != null ? stats.ticksTaken : parTimeTicks;
  return {
    deaths: Math.max(0, stats.deaths || 0),
    hpLostPct: Math.max(0, stats.hpLostPct || 0),
    ticksTaken,
    beatParTime: stats.beatParTime != null ? !!stats.beatParTime : ticksTaken < parTimeTicks,
    kc: Math.max(0, stats.kc || 0),
    success: stats.success != null ? !!stats.success : true,
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// 7. pointsTable -- convert points into loot rolls
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Map a player's earned raid points into a loot-roll config.
 *
 * Buckets:
 *   0-999:     1 standard roll
 *   1000-1999: 2 standard rolls
 *   2000-2999: 3 standard rolls + chance at unique
 *   3000+:     4 standard rolls + guaranteed unique
 */
function pointsTable(raidId, level, perf) {
  const config = invocationData.getPointConfig(raidId);
  if (!config) {
    return { bucket: 'unknown', standardRolls: 0, uniqueChance: 0, guaranteedUnique: false };
  }

  // Accept either a raw points number or a perf object in the 3rd arg.
  const points = typeof perf === 'number' ? perf : (perf && perf.points) || 0;

  let standardRolls, uniqueChance, guaranteedUnique, bucket;
  if (points < 1000) {
    bucket = 'low';
    standardRolls = 1;
    uniqueChance = 0;
    guaranteedUnique = false;
  } else if (points < 2000) {
    bucket = 'mid';
    standardRolls = 2;
    uniqueChance = 0;
    guaranteedUnique = false;
  } else if (points < 3000) {
    bucket = 'high';
    standardRolls = 3;
    // Chance at unique scales with level (+0.10% per raid level)
    uniqueChance = Math.min(0.75, 0.10 + 0.001 * Math.max(0, level || 0));
    guaranteedUnique = false;
  } else {
    bucket = 'elite';
    standardRolls = 4;
    // Guaranteed unique at elite, level still affects quality chance
    uniqueChance = 1.0;
    guaranteedUnique = true;
  }

  return {
    bucket,
    points,
    level,
    standardRolls,
    uniqueChance,
    guaranteedUnique,
    standardTable: config.standardTable,
    uniqueTable: config.uniqueTable,
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// Points math
// ══════════════════════════════════════════════════════════════════════════════
//
// points = base_points * (1 + sum_of_invocation_weights / 100) * kc_modifier * perf_modifier
//
// kc_modifier: ramps down from 1.25 (first-ever clear) to 1.00 at 50 kc,
//              then stays 1.00 forever. This encourages attempting each raid.
// perf_modifier: starts at 1.0 and applies:
//   * -20% per death
//   * -10% per 25% of max HP damage taken
//   * +10% if time under par
//
// perf_modifier is clamped to >= 0.10 (you always get something for finishing).
function _computePoints(config, level, perf) {
  const base = (config && config.basePoints) || 1500;
  if (!perf.success) {
    // Wiped: still return floor (tiny) so the player has SOMETHING to look at.
    return Math.floor(base * 0.05);
  }

  const invMult = 1 + level / 100;
  const kcMult = _kcModifier(perf.kc);
  let perfMult = 1.0;
  perfMult *= Math.pow(0.80, perf.deaths);
  perfMult *= Math.pow(0.90, Math.floor(perf.hpLostPct / 25));
  if (perf.beatParTime) perfMult *= 1.10;
  if (perfMult < 0.10) perfMult = 0.10;

  return Math.floor(base * invMult * kcMult * perfMult);
}

function _kcModifier(kc) {
  // 1.25 at kc 0, linear to 1.00 at kc 50, then flat.
  if (kc >= 50) return 1.00;
  return 1.25 - (0.25 * kc / 50);
}

// ══════════════════════════════════════════════════════════════════════════════
// Debug / admin helpers
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Return the player's invocation state for a raid (for UI / persistence).
 * Does NOT mutate state (read-only snapshot).
 */
function getState(player, raidId) {
  const state = _getRaidState(player, raidId);
  return {
    enabled: Array.from(state.enabled),
    locked: state.locked,
    startedAt: state.startedAt,
    level: currentInvocationLevel(player, raidId),
  };
}

/**
 * Clear all invocations on a raid (used by admin / reset flow).
 * Rejects if locked.
 */
function resetInvocations(player, raidId) {
  const state = _getRaidState(player, raidId);
  if (state.locked) return { ok: false, reason: 'raid_in_progress' };
  state.enabled.clear();
  // Re-apply defaults
  const list = invocationData.getInvocationsForRaid(raidId) || [];
  for (const inv of list) {
    if (inv.defaultOn) state.enabled.add(inv.id);
  }
  return { ok: true };
}

module.exports = {
  availableInvocations,
  toggleInvocation,
  currentInvocationLevel,
  scaledDifficulty,
  onRaidStart,
  onRaidComplete,
  pointsTable,
  getState,
  resetInvocations,
  // For tests / deeper integration
  _computePoints,
  _kcModifier,
  _normalizePerf,
};
