// ══════════════════════════════════════════════════════════════════════════════
// Goal planner — picks the next action for a bot.
//
// Policy is identical across all 4 archetypes (see docs/balance-diagnostic.md
// §5). The only per-bot state is the bot's own level + inventory + quest
// flags; the planner is a pure function otherwise.
//
// A goal is a priority entry that scores some subset of feasible actions:
//   { id, kind: 'survival'|'quest'|'skill'|'gp'|'unlock', score(action) -> 0..1 }
//
// The runner seeds 1-3 active goals (always plus survival baseline). Every
// ~6 hours of simulated time OR on goal completion, the planner rotates.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

// ─── RNG (mulberry32 so seeds are portable) ────────────────────────────────
function mulberry32(seed) {
  let s = seed >>> 0;
  return function() {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Feasibility ───────────────────────────────────────────────────────────
function filterByState(catalog, state) {
  return catalog.filter(a => state.satisfies(a.requires));
}

// ─── Scoring ───────────────────────────────────────────────────────────────
//
// Each goal contributes a 0-1 score to a single action. Total action score
// is the sum, clamped to 5 (avoid one goal monopolising when many agree).
// Efficiency = score / drain.

function scoreSurvival(_action) { return 0.1; }

function scoreSkill(action, targetSkill) {
  if (!action.base_output || !action.base_output.xp) return 0;
  const xp = action.base_output.xp[targetSkill] || 0;
  if (xp <= 0) return 0;
  // Normalise roughly: 500 xp per action is 1.0, scales down.
  return Math.min(1, xp / 500);
}

function scoreGp(action) {
  const gp = (action.base_output && action.base_output.gp) || 0;
  if (gp <= 0) return 0;
  return Math.min(1, gp / 2000);
}

function scoreQuest(action, questId) {
  if (!action.base_output) return 0;
  return action.base_output.quest === questId ? 1 : 0;
}

function scoreUnlockHop(action, dagNodeId, dag) {
  // If the action is listed under `rewards.unlocks` of the target node,
  // it's on the critical path.
  const node = dag.nodes && dag.nodes[dagNodeId];
  if (!node) return 0;
  const unlocks = (node.rewards && node.rewards.unlocks) || [];
  return unlocks.includes(action.id) ? 0.8 : 0;
}

/**
 * Compute goal scores for one activity. Returns a sum clamped to 5.
 */
function scoreAction(action, goals, dag) {
  let total = 0;
  for (const g of goals) {
    switch (g.kind) {
      case 'survival': total += scoreSurvival(action); break;
      case 'skill':    total += scoreSkill(action, g.target); break;
      case 'gp':       total += scoreGp(action); break;
      case 'quest':    total += scoreQuest(action, g.target); break;
      case 'unlock':   total += scoreUnlockHop(action, g.target, dag); break;
      default: /* unknown kind, skip */ break;
    }
  }
  return Math.min(5, total);
}

// ─── Top-k selection + small ε-greedy randomness ───────────────────────────
function pickTopKWithEpsilon(ranked, k, rand, epsilon = 0.1) {
  if (ranked.length === 0) return null;
  const topK = ranked.slice(0, k);
  if (topK.length === 1) return topK[0];
  if (rand() < epsilon && topK.length >= 2) {
    const idx = 1 + Math.floor(rand() * (topK.length - 1));
    return topK[Math.min(idx, topK.length - 1)];
  }
  return topK[0];
}

// ─── The planner ───────────────────────────────────────────────────────────
class GoalPlanner {
  constructor({ catalog, dag, seed = 1 }) {
    this.catalog = catalog;
    this.dag = dag;
    this.rand = mulberry32(seed);
    this.goals = [{ id: 'survival', kind: 'survival' }];
    this._lastRotationMs = 0;
  }

  /** Replace all goals (except survival baseline) with fresh picks. */
  setGoals(goalsExceptSurvival) {
    this.goals = [
      { id: 'survival', kind: 'survival' },
      ...goalsExceptSurvival,
    ];
  }

  /**
   * Called by the runner each tick. Returns the chosen activity or null.
   */
  pick(state, attentionBar) {
    const feasible = filterByState(this.catalog, state);
    if (feasible.length === 0) return { activity: null, reason: 'no feasible action' };

    const ranked = feasible
      .map(a => {
        const drain = (a.intensity || 2) * 1; // time_factor = 1
        const score = scoreAction(a, this.goals, this.dag);
        return { activity: a, drain, score, efficiency: score / (drain || 1) };
      })
      .sort((x, y) => y.efficiency - x.efficiency);

    let chosen = pickTopKWithEpsilon(ranked, 3, this.rand);

    // Budget fallback — if drain > bar * 1.5, drop to low-intensity afk.
    if (chosen && attentionBar.cap !== Infinity
        && chosen.drain > attentionBar.bar * 1.5
        && attentionBar.bar > 0) {
      const low = ranked.filter(r => (r.activity.intensity || 2) <= 1);
      if (low.length) {
        chosen = pickTopKWithEpsilon(low, 2, this.rand);
      } else {
        chosen = null;
      }
    }

    if (!chosen) return { activity: null, reason: 'fallback also unaffordable' };
    return { activity: chosen.activity, drain: chosen.drain, score: chosen.score };
  }

  /**
   * Rotate goals every 6 simulated hours (21.6M ms). Called by runner.
   */
  maybeRotate(state, targetSkills, targetQuests, targetDagNodes) {
    const rotationIntervalMs = 6 * 60 * 60 * 1000;
    if (state.day_ms - this._lastRotationMs < rotationIntervalMs) return false;
    this._lastRotationMs = state.day_ms;
    this._rotateGoals(state, targetSkills, targetQuests, targetDagNodes);
    return true;
  }

  _rotateGoals(state, skills, quests, dagNodes) {
    const goals = [];

    // Pick one in-progress skill (lowest level among targets).
    if (skills.length) {
      let pick = skills[0];
      let lowest = state.level(pick);
      for (const s of skills) {
        const lvl = state.level(s);
        if (lvl < lowest) { lowest = lvl; pick = s; }
      }
      goals.push({ id: `skill::${pick}`, kind: 'skill', target: pick });
    }

    // Active quest → push it
    for (const q of quests) {
      if (!state.quests.has(q)) {
        goals.push({ id: `quest::${q}`, kind: 'quest', target: q });
        break;
      }
    }

    // Latent unlock goal — first unreached DAG node.
    for (const n of dagNodes) {
      if (!state.unlocks.has(n)) {
        goals.push({ id: `unlock::${n}`, kind: 'unlock', target: n });
        break;
      }
    }

    // Always push a GP goal as low-priority background.
    goals.push({ id: 'gp', kind: 'gp' });

    this.setGoals(goals);
  }
}

module.exports = {
  GoalPlanner,
  filterByState,
  scoreAction,
  scoreSkill,
  scoreGp,
  scoreQuest,
  scoreUnlockHop,
  pickTopKWithEpsilon,
  mulberry32,
};
