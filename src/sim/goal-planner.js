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
//
// ── v0.9 Wave C upgrades ──────────────────────────────────────────────────────
//
// C8 (quest pursuit): the planner synthesises virtual "do-quest" actions for
// every quest whose requirements are currently satisfied. Each synthesised
// action credits the quest's direct XP + item-GP rewards AND marks the quest
// complete so downstream DAG nodes unlock. Quest scoring is:
//
//     total_value = direct_xp + direct_item_gp + downstream_DAG_value
//     efficiency  = total_value / estimated_time
//
// `downstream_DAG_value` is pre-computed via DP over the DAG — each node's
// downstream = 1 + Σ children's downstream, so a quest that unlocks the
// Wilds breakpoint scores ~91 and a quest that unlocks Sootworks ~88.
//
// C9 (novelty): action scoring adds a `novelty_bonus = 1 / (1 + touch_count)`
// term where touch_count is the number of times the action_id was chosen in
// the last 100 picks (tracked in BotState). The novelty coefficient is tuned
// so efficiency still dominates — a brand-new action is worth ~1 extra unit,
// a heavily-reused one close to 0.
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
//
// A quest_synth action disappears once the bot has the quest flag — we don't
// want bots to "re-complete" the same quest. Everything else passes through
// the normal `satisfies` gate.
function filterByState(catalog, state) {
  return catalog.filter(a => {
    if (a && a.kind === 'quest_synth' && a.quest_id && state.quests.has(a.quest_id)) return false;
    return state.satisfies(a.requires);
  });
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

// ─── DAG downstream value (DP / topological sort) ──────────────────────────
//
// For each node X the downstream_value is the number of distinct DAG nodes
// reachable by following "requires → requirer" edges. Example: if `quest:A`
// is listed in `requires` of `area:wilds` and `skill_level:attack_90`, and
// those have their own downstream, we sum recursively. Cycles are clamped
// by marking visited mid-traversal.
//
// Returns a map `nodeId -> downstream_count` covering every node in the DAG.

function buildDownstreamValueMap(dag) {
  const out = Object.create(null);
  if (!dag || !dag.nodes) return out;

  // Build reverse adjacency: for every node ref `X` that appears in another
  // node's `requires`, push that other node into adj[X].
  const adj = Object.create(null);
  const allIds = Object.keys(dag.nodes);
  for (const id of allIds) {
    const node = dag.nodes[id];
    const req = node && node.requires;
    if (!req) continue;
    // Handle both shapes: string-array (real DAG raw) and object-shape (after
    // normalisation). The sim-level DAG is already normalised to the object
    // shape, so here we only see the object. But the object may also embed a
    // `quest` id (single) or `quests` array, which we treat as edges too.
    if (req.quest && dag.nodes[`quest:${req.quest}`]) {
      const key = `quest:${req.quest}`;
      (adj[key] ||= []).push(id);
    }
    if (Array.isArray(req.quests)) {
      for (const q of req.quests) {
        const key = `quest:${q}`;
        if (dag.nodes[key]) (adj[key] ||= []).push(id);
      }
    }
    if (req.level) {
      for (const [skill, lvl] of Object.entries(req.level)) {
        const key = `skill:${skill}:${lvl}`;
        if (dag.nodes[key]) (adj[key] ||= []).push(id);
      }
    }
  }
  // Also include pre-normalised string edges if the DAG exposes them (raw
  // import path). The sim stub-dag currently discards these; the expanded
  // planner consumes whichever is present.
  for (const id of allIds) {
    const node = dag.nodes[id];
    const raw = node && node._rawRequires;
    if (!Array.isArray(raw)) continue;
    for (const ref of raw) {
      if (typeof ref !== 'string') continue;
      if (!dag.nodes[ref]) continue;
      (adj[ref] ||= []).push(id);
    }
  }

  // Memoised DFS. Guard against cycles by marking nodes mid-visit.
  const MID_VISIT = -1;
  function downstream(id) {
    if (out[id] !== undefined && out[id] !== MID_VISIT) return out[id];
    if (out[id] === MID_VISIT) return 0; // cycle guard
    out[id] = MID_VISIT;
    const kids = adj[id] || [];
    let total = 0;
    const seen = new Set();
    for (const k of kids) {
      if (seen.has(k)) continue;
      seen.add(k);
      total += 1 + downstream(k);
    }
    out[id] = total;
    return total;
  }
  for (const id of allIds) downstream(id);
  return out;
}

// ─── Quest synthesis ───────────────────────────────────────────────────────
//
// Convert each quest record (from quest-loader) into a virtual catalog entry.
// The sim consumes these exactly like training-method entries: feasibility
// check, score, drain, time. When applied, the quest flag flips and DAG
// downstream unlocks credit.
//
// Estimated time cost: questPoints × 20 minutes. A novice (1 QP) costs 20
// simulated minutes, a grandmaster (5 QP) costs 100 min. Drain is fixed at
// intensity 2 (Multitask) — quest work is deliberate but not cap-busting.

const QUEST_ACTION_PREFIX = 'quest-action::';
const QUEST_TIME_PER_QP_MS = 20 * 60 * 1000;  // 20 min per quest-point
const QUEST_DRAIN = 2;                         // Multitask — see intensity manifest

function buildQuestActions(quests) {
  if (!Array.isArray(quests) || quests.length === 0) return [];
  const actions = [];
  for (const q of quests) {
    if (!q || !q.id) continue;
    const req = {};
    if (q.requirements && q.requirements.skills) {
      req.level = { ...q.requirements.skills };
    }
    if (q.requirements && Array.isArray(q.requirements.quests) && q.requirements.quests.length) {
      req.quests = q.requirements.quests.slice();
    }
    const xpOut = (q.rewards && q.rewards.xp) ? { ...q.rewards.xp } : {};
    const gpOut = estimateQuestGp(q);
    const unlocks = (q.rewards && Array.isArray(q.rewards.unlocks))
      ? q.rewards.unlocks.slice() : [];
    actions.push({
      id:        `${QUEST_ACTION_PREFIX}${q.id}`,
      kind:      'quest_synth',
      quest_id:  q.id,
      intensity: QUEST_DRAIN,
      time_ms:   Math.max(QUEST_TIME_PER_QP_MS, (q.questPoints || 1) * QUEST_TIME_PER_QP_MS),
      region:    null,
      requires:  Object.keys(req).length ? req : undefined,
      base_output: {
        xp:      xpOut,
        gp:      gpOut,
        quest:   q.id,
        unlocks,
      },
      _quest_meta: {
        questPoints: q.questPoints || 1,
        difficulty:  q.difficulty,
        chain_next:  q.rewards && q.rewards.chain_next,
      },
    });
  }
  return actions;
}

// Heuristic: convert the `items` reward array into a GP estimate. The items
// field in quest definitions is a mix of { id, name, count } records. Coin
// stacks (id 101, name 'Coins') contribute `count` directly; other items
// contribute a flat 500 gp placeholder — we don't have per-item prices here.
function estimateQuestGp(q) {
  const items = (q.rewards && Array.isArray(q.rewards.items)) ? q.rewards.items : [];
  let gp = 0;
  for (const it of items) {
    if (!it) continue;
    const count = it.count || it.qty || 1;
    const name = (it.name || '').toLowerCase();
    if (it.id === 101 || name === 'coins' || name === 'gp') {
      gp += count;
    } else {
      gp += 500 * count; // placeholder per-item value
    }
  }
  return gp;
}

// ─── Scoring for synthesised quest actions ─────────────────────────────────
//
// total_value = direct_xp + direct_item_gp + downstream_DAG_value
//   - direct_xp is summed across all skills.
//   - downstream_DAG_value is the pre-computed count for `quest:<id>`.
// Efficiency = total_value / (time_ms / 60_000).  (per-minute)
//
// The raw total_value is large (thousands). We compress with a log scale so
// quest actions still rank alongside per-tick training methods whose
// efficiency is O(1).

function scoreQuestActionRaw(action, downstreamMap) {
  if (!action || action.kind !== 'quest_synth') return 0;
  const out = action.base_output || {};
  let xp = 0;
  if (out.xp) for (const v of Object.values(out.xp)) xp += v;
  const gp = out.gp || 0;
  const downstream = downstreamMap ? (downstreamMap[`quest:${action.quest_id}`] || 0) : 0;
  return xp + gp + downstream * DOWNSTREAM_GP_EQUIV;
}

// One downstream DAG node is worth this many gp of "future value". Tuned so
// a quest that unlocks an 80-node subtree (e.g. Wilds) scores comparably to
// a ~40k gp reward — makes high-unlock quests dominate low-XP grinds.
const DOWNSTREAM_GP_EQUIV = 500;

// Quest efficiency — converts the large raw total into a per-tick competitive
// score. We divide by minutes, then apply log-compression so the scale
// matches normal per-action scores.
function scoreQuestAction(action, downstreamMap) {
  if (!action || action.kind !== 'quest_synth') return 0;
  const raw = scoreQuestActionRaw(action, downstreamMap);
  if (raw <= 0) return 0;
  const minutes = Math.max(1, (action.time_ms || QUEST_TIME_PER_QP_MS) / 60_000);
  const perMin = raw / minutes;
  // Compress to ~0-5 range. A per-minute value of 100 gp gives ~2.3; a value
  // of 10,000 gp (big quest on the critical path) gives ~4.6.
  return Math.min(5, Math.log1p(perMin) / 2);
}

// ─── Novelty bonus (C9) ────────────────────────────────────────────────────
//
// A small additive bonus on top of efficiency that decays with repeat touches
// of the same action_id in the last 100 picks. Tuned so a brand-new action is
// worth ~1 extra score unit and a heavily-reused one ~0.

const NOVELTY_COEFF = 1.0;

function noveltyBonus(action, state) {
  if (!state || typeof state.touchCount !== 'function') return 0;
  const n = state.touchCount(action.id);
  return NOVELTY_COEFF / (1 + n);
}

// ─── The planner ───────────────────────────────────────────────────────────
class GoalPlanner {
  /**
   * @param {Object} opts
   * @param {Array}  opts.catalog - training-method catalog entries
   * @param {Object} opts.dag     - progression DAG (normalised `nodes` map)
   * @param {Array}  [opts.quests] - quest records from quest-loader (synthesises actions)
   * @param {number} [opts.seed]
   */
  constructor({ catalog, dag, quests = [], seed = 1 }) {
    this.catalog = catalog;
    this.dag = dag;
    this.rand = mulberry32(seed);
    this.goals = [{ id: 'survival', kind: 'survival' }];
    this._lastRotationMs = 0;

    // v0.9 Wave C: synthesised quest actions + downstream DAG value map.
    this.downstreamMap = buildDownstreamValueMap(dag || {});
    this.questActions  = buildQuestActions(quests || []);
    // Merge into one feasibility pool so ranking considers both.
    this.expandedCatalog = Array.isArray(catalog)
      ? catalog.concat(this.questActions)
      : this.questActions.slice();
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
    const feasible = filterByState(this.expandedCatalog, state);
    if (feasible.length === 0) return { activity: null, reason: 'no feasible action' };

    const ranked = feasible
      .map(a => {
        const drain = (a.intensity || 2) * 1; // time_factor = 1
        let score;
        if (a.kind === 'quest_synth') {
          score = scoreQuestAction(a, this.downstreamMap);
        } else {
          score = scoreAction(a, this.goals, this.dag);
        }
        score += noveltyBonus(a, state);
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
  // v0.9 Wave C exports (for tests + tooling):
  buildDownstreamValueMap,
  buildQuestActions,
  scoreQuestAction,
  scoreQuestActionRaw,
  noveltyBonus,
  estimateQuestGp,
  QUEST_ACTION_PREFIX,
  QUEST_TIME_PER_QP_MS,
  QUEST_DRAIN,
  NOVELTY_COEFF,
  DOWNSTREAM_GP_EQUIV,
};
