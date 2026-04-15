// ══════════════════════════════════════════════════════════════════════════════
// Combat Achievements — Core Engine
//
// OSRS-style per-boss restriction tasks that cumulate into tier totals.
// Completing each tier grants a permanent perk.
//
// Tiers: easy → medium → hard → elite → master → grandmaster
// Points thresholds: 33 / 75 / 200 / 400 / 700 / 1200
//
// Points per task are derived from task.difficulty:
//   easy: 1, medium: 2, hard: 4, elite: 6, master: 8, grandmaster: 12
//
// Every tier unlocks a perk. Tasks are permanent — once complete, always
// complete (manifesto P06: game integrity, irreversibility). Perks stack
// cumulatively so a master-tier player benefits from easy + medium + hard +
// elite + master perks simultaneously.
//
// Hooks:
//   - emits engine/events 'combat_achievement:complete', 'combat_achievement:tier'
//   - subscribable via registerListener() — server.js forwards to WebSocket
//   - writes a breakpoint entry into player.breakpointHistory on tier-complete
//
// Sub-system wired into the Engine Bridge (see ENGINE-BRIDGE-ROADMAP.md).
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

// ── Tier configuration (spec §1) ──────────────────────────────────────────────

const TIERS = ['easy', 'medium', 'hard', 'elite', 'master', 'grandmaster'];

const pointsForTier = {
  easy: 33,
  medium: 75,
  hard: 200,
  elite: 400,
  master: 700,
  grandmaster: 1200,
};

const pointsPerTaskDifficulty = {
  easy: 1,
  medium: 2,
  hard: 4,
  elite: 6,
  master: 8,
  grandmaster: 12,
};

// Perks per tier. Each perk has an id, description, and runtime data used by
// the rest of the engine (combat, GE, prayer regen, healing, teleport, cape).
const tierPerks = {
  easy: {
    id: 'perk_easy_melee_accuracy',
    name: 'Steady Hand',
    effect: 'melee_accuracy_vs_bosses',
    magnitude: 0.01,
    description: '+1% melee accuracy vs bosses (permanent).',
  },
  medium: {
    id: 'perk_medium_ge_rate',
    name: 'Market Whisperer',
    effect: 'daily_ge_rate',
    magnitude: 0.05,
    description: 'Daily Grand Exchange rate +5%.',
  },
  hard: {
    id: 'perk_hard_prayer_regen',
    name: 'Faithful Restoration',
    effect: 'prayer_regen_under_30',
    magnitude: 1,
    description: 'Bonus prayer point regen when below 30%.',
  },
  elite: {
    id: 'perk_elite_neardeath_heal',
    name: 'Phoenix Pulse',
    effect: 'one_time_heal_per_combat',
    magnitude: 0.5,
    description: 'One-time heal on near-death per combat encounter.',
  },
  master: {
    id: 'perk_master_boss_teleport',
    name: "Ghommal's Key",
    effect: 'boss_lair_teleport',
    magnitude: 1,
    description: 'Unique teleport to any discovered boss lair.',
  },
  grandmaster: {
    id: 'perk_grandmaster_cape',
    name: "Ghommal's Legacy",
    effect: 'cosmetic_cape_and_unique_boss',
    magnitude: 1,
    description: 'Cosmetic cape, title, and one unique boss encounter.',
  },
};

// ── Registry ──────────────────────────────────────────────────────────────────
// bossId -> [task]
// taskId -> task (deduplicated)

const tasksByBoss = new Map();
const taskById = new Map();
const tasksByTier = new Map();

function registerTask(bossId, task) {
  if (!bossId || typeof bossId !== 'string') {
    throw new Error('[combat-achievements] registerTask: bossId must be a non-empty string');
  }
  if (!task || !task.id) {
    throw new Error('[combat-achievements] registerTask: task.id is required');
  }
  if (!TIERS.includes(task.tier)) {
    throw new Error(`[combat-achievements] registerTask: invalid tier "${task.tier}" on ${task.id}`);
  }
  if (taskById.has(task.id)) {
    throw new Error(`[combat-achievements] registerTask: duplicate task id "${task.id}"`);
  }
  const normalized = {
    id: task.id,
    bossId,
    name: task.name || task.id,
    description: task.description || '',
    tier: task.tier,
    difficulty: task.difficulty || task.tier,
    category: task.category || 'mechanic',   // kc|restriction|speed|mechanic|gear|solo|perfection
    points: task.points || pointsPerTaskDifficulty[task.difficulty || task.tier],
    // Scape-Builder-Injects audit fields (spec rule): every task must be
    // auditable against the 18 injects. We record which injects the task
    // touches so codex pages can surface the audit.
    injects: task.injects || [],
  };
  if (!tasksByBoss.has(bossId)) tasksByBoss.set(bossId, []);
  tasksByBoss.get(bossId).push(normalized);
  taskById.set(task.id, normalized);
  if (!tasksByTier.has(normalized.tier)) tasksByTier.set(normalized.tier, []);
  tasksByTier.get(normalized.tier).push(normalized);
  return normalized;
}

function getTask(taskId) { return taskById.get(taskId) || null; }
function listTasksForBoss(bossId) { return (tasksByBoss.get(bossId) || []).slice(); }
function listTasksForTier(tier) { return (tasksByTier.get(tier) || []).slice(); }
function listAllTasks() { return [...taskById.values()]; }
function listBosses() { return [...tasksByBoss.keys()]; }

function registry() {
  return {
    totalTasks: taskById.size,
    totalBosses: tasksByBoss.size,
    byTier: Object.fromEntries(TIERS.map(t => [t, (tasksByTier.get(t) || []).length])),
  };
}

// ── Listeners (forwarded to WebSocket by server.js) ───────────────────────────

const listeners = new Set();

function registerListener(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit(event) {
  for (const fn of listeners) {
    try { fn(event); } catch (e) { console.error('[combat-achievements] listener', e.message); }
  }
}

// ── Player state helpers ──────────────────────────────────────────────────────
// We store state on the player object so persistence (db/persistence.js)
// picks it up automatically.

function ensureState(player) {
  if (!player) throw new Error('[combat-achievements] player required');
  if (!player.combatAchievements) {
    player.combatAchievements = {
      completed: {},            // { taskId: tickCompleted }
      tiersGranted: {},         // { tier: tickGranted }
      perks: {},                // { perkId: { grantedAt, effect, magnitude } }
      totalPoints: 0,
    };
  }
  return player.combatAchievements;
}

function hasCompleted(player, taskId) {
  const s = ensureState(player);
  return Object.prototype.hasOwnProperty.call(s.completed, taskId);
}

function totalPoints(player) {
  const s = ensureState(player);
  return s.totalPoints | 0;
}

function pointsInTier(player, tier) {
  const s = ensureState(player);
  let sum = 0;
  for (const taskId of Object.keys(s.completed)) {
    const task = taskById.get(taskId);
    if (task && task.tier === tier) sum += task.points;
  }
  return sum;
}

// The point threshold required to complete a given tier. These are ABSOLUTE
// totals (OSRS semantics): reaching 33 total points grants Easy perk; reaching
// 1200 total points grants Grandmaster perk. Points from any tier count toward
// these thresholds — higher-tier tasks contribute more per task.
function cumulativeThreshold(tier) {
  return pointsForTier[tier];
}

// Is the tier threshold satisfied by the player's total points?
function tierComplete(player, tier) {
  if (!TIERS.includes(tier)) return false;
  return totalPoints(player) >= pointsForTier[tier];
}

// ── Perk application ──────────────────────────────────────────────────────────

function grantPerk(player, tier) {
  const perk = tierPerks[tier];
  if (!perk) return null;
  const s = ensureState(player);
  if (s.perks[perk.id]) return s.perks[perk.id]; // idempotent
  s.perks[perk.id] = {
    grantedAt: _currentTick(),
    tier,
    effect: perk.effect,
    magnitude: perk.magnitude,
    name: perk.name,
    description: perk.description,
  };
  s.tiersGranted[tier] = _currentTick();
  return s.perks[perk.id];
}

function hasPerk(player, perkIdOrEffect) {
  const s = ensureState(player);
  if (s.perks[perkIdOrEffect]) return true;
  for (const p of Object.values(s.perks)) {
    if (p.effect === perkIdOrEffect) return true;
  }
  return false;
}

function listPerks(player) {
  const s = ensureState(player);
  return [...Object.values(s.perks)];
}

// ── Completion flow ───────────────────────────────────────────────────────────
// This is the write-path: called from gameplay (boss kill hook, speed-timer,
// restriction-check). It records the task, rolls up tier grants, emits events
// so the breakpoint system / WebSocket / codex can react.

function completeTask(player, taskId) {
  const task = taskById.get(taskId);
  if (!task) {
    return { ok: false, reason: 'unknown_task', taskId };
  }
  const s = ensureState(player);
  if (s.completed[taskId] !== undefined) {
    return { ok: false, reason: 'already_completed', taskId };
  }
  const tickNow = _currentTick();
  s.completed[taskId] = tickNow;
  s.totalPoints = (s.totalPoints | 0) + (task.points | 0);

  // Emit a completion event (type aligned with spec: 'combat_achievement')
  const evt = {
    type: 'combat_achievement',
    subType: 'task_complete',
    taskId: task.id,
    taskName: task.name,
    tier: task.tier,
    bossId: task.bossId,
    points: task.points,
    totalPoints: s.totalPoints,
    playerId: player.id,
    playerName: player.name,
    tick: tickNow,
  };
  emit(evt);

  // Detect tier crossings. Grant perks for any tier the player has newly
  // completed. Multiple tiers may cross simultaneously (bulk-reward path).
  const newlyGranted = [];
  for (const tier of TIERS) {
    if (s.tiersGranted[tier] !== undefined) continue;
    if (!tierComplete(player, tier)) continue;
    const perk = grantPerk(player, tier);
    newlyGranted.push({ tier, perk });

    // Record a breakpoint entry in the player's breakpoint history so the
    // codex/spectator surfaces the moment alongside skill/quest breakpoints.
    // Importance: grandmaster=transformative, master/elite=major, others=minor.
    const importance = (tier === 'grandmaster') ? 'transformative'
                    : (tier === 'master' || tier === 'elite') ? 'major'
                    : 'minor';
    const bpKey = `combat_achievement:tier:${tier}`;
    if (player.breakpointHistory) {
      player.breakpointHistory.push({
        type: 'combat_achievement',
        subType: 'tier_complete',
        bpKey,
        tier,
        perkId: perk.id,
        perkName: perk.name,
        description: `Combat Achievements: ${tier} tier complete — ${perk.description}`,
        importance,
        tick: tickNow,
      });
      if (player.breakpointHistory.length > 50) player.breakpointHistory.shift();
    }
    if (player.breakpointsHit) {
      player.breakpointsHit[bpKey] = tickNow;
    }
    // Feed into breakpoint-runner so narrator/spectator pick it up alongside
    // skill/quest breakpoints. Guarded by try/catch for test harnesses that
    // load this module without the full server context.
    try {
      const br = require('./breakpoint-runner');
      if (br && typeof br.emit === 'function') {
        br.emit({
          type: 'breakpoint',
          bpKey,
          bpType: 'combat_achievement',
          trigger: { tier, perkId: perk.id },
          importance,
          description: `Combat Achievements: ${tier} tier complete — ${perk.description}`,
          unlocks: [{ type: 'perk', id: perk.id, description: perk.description }],
          playerId: player.id,
          playerName: player.name,
          tick: tickNow,
        });
      }
    } catch (_) { /* breakpoint-runner optional */ }

    // Emit a tier-complete event (type aligned with spec)
    emit({
      type: 'combat_achievement',
      subType: 'tier_complete',
      tier,
      perkId: perk.id,
      perkName: perk.name,
      perkDescription: perk.description,
      totalPoints: s.totalPoints,
      playerId: player.id,
      playerName: player.name,
      tick: tickNow,
    });
  }

  return {
    ok: true,
    task,
    totalPoints: s.totalPoints,
    tiersGranted: newlyGranted,
  };
}

// ── Tick helper (lazy import to avoid circular deps at boot) ──────────────────

function _currentTick() {
  try {
    // require lazily; if the tick module isn't loaded yet (during content
    // bootstrap) we fall back to 0. The breakpoint-runner uses this same
    // pattern.
    return require('./tick').getTick();
  } catch (_) { return 0; }
}

// ── Progress reporting (for codex / UI) ───────────────────────────────────────

function playerProgress(player) {
  const s = ensureState(player);
  const done = Object.keys(s.completed);
  const progress = { totalPoints: s.totalPoints, byTier: {}, perks: listPerks(player) };
  for (const tier of TIERS) {
    const all = tasksByTier.get(tier) || [];
    const completed = all.filter(t => s.completed[t.id] !== undefined).length;
    progress.byTier[tier] = {
      total: all.length,
      completed,
      points: pointsInTier(player, tier),
      threshold: cumulativeThreshold(tier),
      tierGranted: s.tiersGranted[tier] !== undefined,
    };
  }
  progress.completedIds = done;
  return progress;
}

// ── Export ────────────────────────────────────────────────────────────────────

module.exports = {
  // Config
  TIERS,
  pointsForTier,
  pointsPerTaskDifficulty,
  tierPerks,
  // Registry
  registerTask,
  getTask,
  listTasksForBoss,
  listTasksForTier,
  listAllTasks,
  listBosses,
  registry,
  // Completion
  completeTask,
  hasCompleted,
  totalPoints,
  pointsInTier,
  tierComplete,
  cumulativeThreshold,
  // Perks
  grantPerk,
  hasPerk,
  listPerks,
  // Events
  registerListener,
  emit,
  // State
  ensureState,
  playerProgress,
};
