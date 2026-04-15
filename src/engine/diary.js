// ══════════════════════════════════════════════════════════════════════════════
// Achievement Diary (engine module)
// Per-region tiered tasks (easy/medium/hard/elite) with cumulative perks.
// Static data lives in data/diaries/{region}.json. Player progress lives in
// player.diary = { [regionId]: { tasks: { [taskId]: true }, claimed: { easy:..., medium:... } } }.
//
// Tier gating: a higher tier cannot be claimed until the prior tier is fully
// complete AND claimed. Perks granted are cumulative — claiming hard does not
// remove easy/medium perks.
//
// Manifesto P03 (self-direction): players choose which region to focus.
// Manifesto P08 (breakpoint): each tier completion is a discrete unlock.
// Manifesto P09 (skill breadth): elite tasks span multiple skills + bosses.
// ══════════════════════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');

let events = null;
try { events = require('./events'); } catch (_) { events = null; }

const TIERS = ['easy', 'medium', 'hard', 'elite'];

let DIARIES = null; // Map<regionId, diaryDef>
let DIARIES_DIR = path.join(__dirname, '..', '..', 'data', 'diaries');

// ── Loader ────────────────────────────────────────────────────────────────────

function loadDiaries(dir) {
  if (dir) DIARIES_DIR = dir;
  DIARIES = new Map();
  if (!fs.existsSync(DIARIES_DIR)) {
    console.warn('[diary] Diaries directory missing at ' + DIARIES_DIR);
    return DIARIES;
  }
  const files = fs.readdirSync(DIARIES_DIR).filter(f => f.endsWith('.json'));
  for (const file of files) {
    const full = path.join(DIARIES_DIR, file);
    try {
      const def = JSON.parse(fs.readFileSync(full, 'utf8'));
      if (!def.region) {
        console.warn('[diary] Skipping ' + file + ': missing region field');
        continue;
      }
      validateDiary(def, file);
      DIARIES.set(def.region, def);
    } catch (err) {
      console.error('[diary] Failed to load ' + file + ': ' + err.message);
    }
  }
  return DIARIES;
}

function validateDiary(def, file) {
  if (!def.tiers) throw new Error(file + ' missing tiers');
  for (const tier of TIERS) {
    if (!def.tiers[tier]) throw new Error(file + ' missing tier "' + tier + '"');
    if (!Array.isArray(def.tiers[tier].tasks)) throw new Error(file + ' tier ' + tier + ' missing tasks array');
  }
}

function getDiaries() {
  if (!DIARIES) loadDiaries();
  return DIARIES;
}

function getDiary(regionId) {
  return getDiaries().get(regionId) || null;
}

function listDiaries() {
  return [...getDiaries().values()];
}

// ── Player state helpers ──────────────────────────────────────────────────────

function ensurePlayerDiary(player) {
  if (!player) throw new Error('diary: player is required');
  if (!player.diary || typeof player.diary !== 'object') {
    player.diary = {};
  }
  return player.diary;
}

function ensureRegion(player, regionId) {
  const root = ensurePlayerDiary(player);
  if (!root[regionId]) {
    root[regionId] = { tasks: {}, claimed: { easy: false, medium: false, hard: false, elite: false } };
  } else {
    if (!root[regionId].tasks) root[regionId].tasks = {};
    if (!root[regionId].claimed) root[regionId].claimed = { easy: false, medium: false, hard: false, elite: false };
    for (const t of TIERS) {
      if (typeof root[regionId].claimed[t] !== 'boolean') root[regionId].claimed[t] = false;
    }
  }
  return root[regionId];
}

// ── Public API ────────────────────────────────────────────────────────────────

// Mark an individual task as done.
function completeTask(player, regionId, taskId) {
  const diary = getDiary(regionId);
  if (!diary) return { ok: false, reason: 'unknown_region' };
  const state = ensureRegion(player, regionId);
  let foundTier = null;
  for (const tier of TIERS) {
    if (diary.tiers[tier].tasks.some(t => t.id === taskId)) {
      foundTier = tier;
      break;
    }
  }
  if (!foundTier) return { ok: false, reason: 'unknown_task' };
  if (state.tasks[taskId]) return { ok: false, reason: 'already_complete' };
  state.tasks[taskId] = true;
  if (events && events.emit) {
    events.emit('diary_task_complete', { player, regionId, tier: foundTier, taskId });
  }
  return { ok: true, tier: foundTier };
}

// Compute progress for a single region across all four tiers.
function checkProgress(player, regionId) {
  const diary = getDiary(regionId);
  if (!diary) return null;
  const state = ensureRegion(player, regionId);
  const out = { region: regionId, name: diary.name || regionId };
  for (const tier of TIERS) {
    const tasks = diary.tiers[tier].tasks;
    const total = tasks.length;
    const done = tasks.filter(t => !!state.tasks[t.id]).length;
    out[tier] = {
      done,
      total,
      complete: total > 0 && done === total,
      claimed: !!state.claimed[tier],
      perk: diary.tiers[tier].perk_description || null,
      reward: diary.tiers[tier].reward || null,
    };
  }
  return out;
}

// Claim a tier reward. Enforces gating: lower tier must be complete + claimed.
function complete(player, regionId, tier) {
  if (!TIERS.includes(tier)) return { ok: false, reason: 'unknown_tier' };
  const diary = getDiary(regionId);
  if (!diary) return { ok: false, reason: 'unknown_region' };
  const state = ensureRegion(player, regionId);
  // Gating: previous tier must be claimed
  const idx = TIERS.indexOf(tier);
  if (idx > 0) {
    const prev = TIERS[idx - 1];
    if (!state.claimed[prev]) {
      return { ok: false, reason: 'prior_tier_unclaimed', priorTier: prev };
    }
  }
  const prog = checkProgress(player, regionId);
  if (!prog[tier].complete) return { ok: false, reason: 'tier_incomplete', progress: prog[tier] };
  if (prog[tier].claimed) return { ok: false, reason: 'already_claimed' };
  state.claimed[tier] = true;
  const def = diary.tiers[tier];
  if (events && events.emit) {
    events.emit('diary_tier_complete', { player, regionId, tier, perk: def.perk_description, reward: def.reward });
  }
  return { ok: true, tier, perk: def.perk_description || null, reward: def.reward || null };
}

// Flat list of every perk this player currently has from claimed tiers.
function grantedPerks(player) {
  ensurePlayerDiary(player);
  const out = [];
  for (const diary of listDiaries()) {
    const state = ensureRegion(player, diary.region);
    for (const tier of TIERS) {
      if (state.claimed[tier]) {
        out.push({
          region: diary.region,
          tier,
          perk: diary.tiers[tier].perk_description || null,
          reward: diary.tiers[tier].reward || null,
        });
      }
    }
  }
  return out;
}

// Convenience accessors
function listTasks(regionId, tier) {
  const diary = getDiary(regionId);
  if (!diary) return [];
  if (tier && diary.tiers[tier]) return diary.tiers[tier].tasks.slice();
  const out = [];
  for (const t of TIERS) {
    for (const task of diary.tiers[t].tasks) {
      out.push({ ...task, tier: t });
    }
  }
  return out;
}

// ── Engine plugin entry point ─────────────────────────────────────────────────

function register(engine) {
  loadDiaries();
  return module.exports;
}

module.exports = {
  register,
  TIERS,
  loadDiaries,
  getDiaries,
  getDiary,
  listDiaries,
  listTasks,
  completeTask,
  complete,
  checkProgress,
  grantedPerks,
};
