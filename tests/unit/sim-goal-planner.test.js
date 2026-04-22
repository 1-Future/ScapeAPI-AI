// Balance diagnostic — goal planner
// Covers feasibility filter, scoring, top-k pick, budget fallback,
// v0.9 Wave C additions (C8 quest pursuit, C9 novelty).

import { describe, it, expect } from 'vitest';
import {
  GoalPlanner, filterByState, scoreSkill, scoreGp, scoreQuest, scoreAction,
  pickTopKWithEpsilon, mulberry32,
  buildDownstreamValueMap, buildQuestActions,
  scoreQuestAction, scoreQuestActionRaw, noveltyBonus,
  estimateQuestGp, QUEST_ACTION_PREFIX, QUEST_TIME_PER_QP_MS,
  DOWNSTREAM_GP_EQUIV, NOVELTY_COEFF,
} from '../../src/sim/goal-planner.js';
import { BotState, DEFAULT_TOUCH_WINDOW } from '../../src/sim/state.js';
import { AttentionBar } from '../../src/sim/attention-bar.js';

const STUB_CATALOG = [
  { id: 'a', intensity: 1, time_ms: 1000, base_output: { xp: { mining: 20 }, gp: 5 } },
  { id: 'b', intensity: 3, time_ms: 2000, base_output: { xp: { mining: 90 }, gp: 50 }, requires: { level: { mining: 10 } } },
  { id: 'c', intensity: 2, time_ms: 1500, base_output: { xp: { cooking: 60 }, gp: 30 }, requires: { items: [{ id: 'raw-fish', qty: 1 }] } },
  { id: 'q', intensity: 2, time_ms: 1000, base_output: { xp: { cooking: 10 }, gp: 0, quest: 'cook-assistant' } },
];

const STUB_DAG = {
  nodes: {
    'start':     { label: 's', requires: {}, rewards: { unlocks: ['a','b','c'] } },
    'mining-10': { label: 'm10', requires: { level: { mining: 10 } }, rewards: { unlocks: ['b'] } },
  },
  edges: [['start','mining-10']],
};

describe('filterByState', () => {
  it('drops actions whose level requirement is unmet', () => {
    const s = new BotState('low');
    const f = filterByState(STUB_CATALOG, s);
    expect(f.map(a => a.id)).toEqual(['a', 'q']);
  });

  it('keeps actions after level is reached', () => {
    const s = new BotState('low');
    s.apply({ base_output: { xp: { mining: 1200 } } }); // ~level 10
    const f = filterByState(STUB_CATALOG, s);
    expect(f.some(a => a.id === 'b')).toBe(true);
  });

  it('drops actions requiring absent items', () => {
    const s = new BotState('low');
    const f = filterByState(STUB_CATALOG, s);
    expect(f.some(a => a.id === 'c')).toBe(false);
    s.inventory['raw-fish'] = 1;
    const f2 = filterByState(STUB_CATALOG, s);
    expect(f2.some(a => a.id === 'c')).toBe(true);
  });

  it('drops quest_synth actions once the quest is complete', () => {
    const s = new BotState('low');
    const synth = { id: 'quest-action::alpha', kind: 'quest_synth', quest_id: 'alpha' };
    expect(filterByState([synth], s).length).toBe(1);
    s.quests.add('alpha');
    expect(filterByState([synth], s).length).toBe(0);
  });
});

describe('goal scoring', () => {
  it('scoreSkill is 0 when action gives unrelated XP', () => {
    expect(scoreSkill({ base_output: { xp: { cooking: 100 } } }, 'mining')).toBe(0);
  });

  it('scoreSkill scales with XP amount', () => {
    const low  = scoreSkill({ base_output: { xp: { mining: 10 } } }, 'mining');
    const high = scoreSkill({ base_output: { xp: { mining: 500 } } }, 'mining');
    expect(high).toBeGreaterThan(low);
    expect(high).toBeLessThanOrEqual(1);
  });

  it('scoreGp caps at 1', () => {
    expect(scoreGp({ base_output: { gp: 10000 } })).toBe(1);
    expect(scoreGp({ base_output: { gp: 0 } })).toBe(0);
  });

  it('scoreQuest matches quest id exactly', () => {
    expect(scoreQuest({ base_output: { quest: 'alpha' } }, 'alpha')).toBe(1);
    expect(scoreQuest({ base_output: { quest: 'alpha' } }, 'beta')).toBe(0);
  });

  it('scoreAction sums multiple goal contributions', () => {
    const act = { base_output: { xp: { mining: 500 }, gp: 2000 } };
    const goals = [{ kind: 'skill', target: 'mining' }, { kind: 'gp' }];
    const score = scoreAction(act, goals, STUB_DAG);
    expect(score).toBeCloseTo(2, 1);
  });
});

describe('pickTopKWithEpsilon', () => {
  it('returns null for empty ranked list', () => {
    expect(pickTopKWithEpsilon([], 3, mulberry32(1))).toBe(null);
  });

  it('returns the top slot most of the time', () => {
    const ranked = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
    const rand = mulberry32(1);
    let top = 0;
    for (let i = 0; i < 200; i++) if (pickTopKWithEpsilon(ranked, 3, rand).id === 'a') top++;
    expect(top).toBeGreaterThan(150);  // ~90% at epsilon 0.1
  });
});

describe('GoalPlanner.pick', () => {
  it('returns a feasible action when one exists', () => {
    const s = new BotState('low');
    const bar = new AttentionBar('low');
    const p = new GoalPlanner({ catalog: STUB_CATALOG, dag: STUB_DAG, seed: 1 });
    p.setGoals([{ id: 'skill::mining', kind: 'skill', target: 'mining' }]);
    const r = p.pick(s, bar);
    expect(r.activity).toBeTruthy();
    expect(['a', 'q']).toContain(r.activity.id);
  });

  it('emits a reason when no feasible action exists', () => {
    const s = new BotState('low');
    const bar = new AttentionBar('low');
    const p = new GoalPlanner({ catalog: [{ id: 'z', intensity: 1, requires: { level: { mining: 99 } }, base_output: { xp: { mining: 1 } } }], dag: STUB_DAG, seed: 1 });
    const r = p.pick(s, bar);
    expect(r.activity).toBe(null);
    expect(r.reason).toMatch(/no feasible/);
  });

  it('fallback to afk when drain exceeds budget×1.5', () => {
    const s = new BotState('low');
    const bar = new AttentionBar('low');
    // Drain bar to 1 so only intensity-1 actions can fit.
    bar.drain(199);
    const catalog = [
      { id: 'hi', intensity: 5, base_output: { xp: { mining: 100 }, gp: 0 } },
      { id: 'lo', intensity: 1, base_output: { xp: { mining: 1 }, gp: 0 } },
    ];
    const p = new GoalPlanner({ catalog, dag: STUB_DAG, seed: 1 });
    p.setGoals([{ id: 'skill::mining', kind: 'skill', target: 'mining' }]);
    const r = p.pick(s, bar);
    expect(r.activity && r.activity.id).toBe('lo');
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// v0.9 Wave C — C8 quest pursuit
// ══════════════════════════════════════════════════════════════════════════════

describe('buildDownstreamValueMap', () => {
  it('handles an empty DAG', () => {
    expect(buildDownstreamValueMap({})).toEqual({});
    expect(buildDownstreamValueMap({ nodes: {} })).toEqual({});
  });

  it('counts direct requirers of a quest', () => {
    const dag = {
      nodes: {
        'quest:alpha': { label: 'alpha', requires: {} },
        'area:beta':   { label: 'beta',  requires: { quest: 'alpha' } },
        'area:gamma':  { label: 'gamma', requires: { quest: 'alpha' } },
      },
    };
    const m = buildDownstreamValueMap(dag);
    expect(m['quest:alpha']).toBe(2);
  });

  it('counts transitive downstream via multi-quest requires', () => {
    const dag = {
      nodes: {
        'quest:root':    { label: 'r', requires: {} },
        'quest:mid':     { label: 'm', requires: { quest: 'root' } },
        'area:leaf1':    { label: 'l1', requires: { quests: ['mid'] } },
        'area:leaf2':    { label: 'l2', requires: { quests: ['mid'] } },
      },
    };
    const m = buildDownstreamValueMap(dag);
    expect(m['quest:mid']).toBe(2);
    expect(m['quest:root']).toBe(3); // mid + 2 leaves via mid
  });

  it('guards against cycles', () => {
    const dag = {
      nodes: {
        'quest:a': { label: 'a', requires: { quest: 'b' } },
        'quest:b': { label: 'b', requires: { quest: 'a' } },
      },
    };
    expect(() => buildDownstreamValueMap(dag)).not.toThrow();
  });

  it('resolves skill-level requirements via skill-node refs', () => {
    const dag = {
      nodes: {
        'skill:mining:15': { label: 'sm15', requires: {} },
        'area:iron_mine':  { label: 'ir',   requires: { level: { mining: 15 } } },
      },
    };
    const m = buildDownstreamValueMap(dag);
    expect(m['skill:mining:15']).toBe(1);
  });
});

describe('buildQuestActions', () => {
  it('builds a synth action per quest', () => {
    const quests = [
      { id: 'alpha', name: 'A', difficulty: 'Novice', questPoints: 1, requirements: {}, rewards: { xp: { mining: 300 } } },
      { id: 'beta',  name: 'B', difficulty: 'Intermediate', questPoints: 2, requirements: { skills: { mining: 15 } }, rewards: { xp: { mining: 500 }, unlocks: ['area:x'] } },
    ];
    const actions = buildQuestActions(quests);
    expect(actions.length).toBe(2);
    expect(actions[0].id).toBe(`${QUEST_ACTION_PREFIX}alpha`);
    expect(actions[0].kind).toBe('quest_synth');
    expect(actions[0].quest_id).toBe('alpha');
    expect(actions[0].base_output.quest).toBe('alpha');
    expect(actions[1].requires.level).toEqual({ mining: 15 });
    expect(actions[1].base_output.unlocks).toEqual(['area:x']);
  });

  it('passes questPoints-scaled time_ms', () => {
    const quests = [
      { id: 'nov', questPoints: 1, requirements: {}, rewards: {} },
      { id: 'gm',  questPoints: 5, requirements: {}, rewards: {} },
    ];
    const [nov, gm] = buildQuestActions(quests);
    expect(gm.time_ms).toBeGreaterThan(nov.time_ms);
    expect(gm.time_ms).toBe(5 * QUEST_TIME_PER_QP_MS);
  });

  it('carries quest prerequisite as requires.quests', () => {
    const quests = [
      { id: 'sequel', questPoints: 1, requirements: { quests: ['prequel'] }, rewards: {} },
    ];
    const [sequel] = buildQuestActions(quests);
    expect(sequel.requires.quests).toEqual(['prequel']);
  });

  it('handles empty input gracefully', () => {
    expect(buildQuestActions(null)).toEqual([]);
    expect(buildQuestActions([])).toEqual([]);
  });
});

describe('estimateQuestGp', () => {
  it('counts coin items directly', () => {
    const q = { rewards: { items: [{ id: 101, name: 'Coins', count: 1000 }] } };
    expect(estimateQuestGp(q)).toBe(1000);
  });

  it('applies placeholder value for non-coin items', () => {
    const q = { rewards: { items: [{ id: 1234, name: 'Sword', count: 2 }] } };
    expect(estimateQuestGp(q)).toBe(1000); // 500 * 2
  });

  it('handles missing rewards block', () => {
    expect(estimateQuestGp({})).toBe(0);
    expect(estimateQuestGp({ rewards: {} })).toBe(0);
  });
});

describe('scoreQuestAction', () => {
  it('returns 0 for non-quest_synth actions', () => {
    expect(scoreQuestAction({ id: 'x' }, {})).toBe(0);
  });

  it('rewards quests with downstream DAG value', () => {
    const small = { kind: 'quest_synth', quest_id: 'a', time_ms: QUEST_TIME_PER_QP_MS, base_output: { xp: { mining: 500 }, gp: 0 } };
    const big   = { kind: 'quest_synth', quest_id: 'b', time_ms: QUEST_TIME_PER_QP_MS, base_output: { xp: { mining: 500 }, gp: 0 } };
    const map = { 'quest:a': 0, 'quest:b': 80 };
    expect(scoreQuestAction(big, map)).toBeGreaterThan(scoreQuestAction(small, map));
  });

  it('raw score = direct_xp + item_gp + downstream × coefficient', () => {
    const a = { kind: 'quest_synth', quest_id: 'foo', time_ms: QUEST_TIME_PER_QP_MS, base_output: { xp: { mining: 200, cooking: 300 }, gp: 1000 } };
    const map = { 'quest:foo': 10 };
    const raw = scoreQuestActionRaw(a, map);
    expect(raw).toBe(200 + 300 + 1000 + 10 * DOWNSTREAM_GP_EQUIV);
  });

  it('scales to a bounded ~0-5 score', () => {
    const huge = { kind: 'quest_synth', quest_id: 'x', time_ms: QUEST_TIME_PER_QP_MS, base_output: { xp: { mining: 1_000_000 }, gp: 1_000_000 } };
    const s = scoreQuestAction(huge, { 'quest:x': 100 });
    expect(s).toBeLessThanOrEqual(5);
    expect(s).toBeGreaterThan(0);
  });
});

describe('GoalPlanner quest synthesis integration', () => {
  it('includes quest actions in the expanded catalog', () => {
    const p = new GoalPlanner({
      catalog: [],
      dag: STUB_DAG,
      quests: [{ id: 'alpha', questPoints: 1, requirements: {}, rewards: {} }],
      seed: 1,
    });
    expect(p.questActions.length).toBe(1);
    expect(p.expandedCatalog.some(a => a.id === `${QUEST_ACTION_PREFIX}alpha`)).toBe(true);
  });

  it('can pick a feasible quest action', () => {
    const s = new BotState('unlimited');
    const bar = new AttentionBar('unlimited');
    const p = new GoalPlanner({
      catalog: [],
      dag: { nodes: { 'quest:alpha': { requires: {} } } },
      quests: [{ id: 'alpha', questPoints: 1, requirements: {}, rewards: { xp: { mining: 500 } } }],
      seed: 7,
    });
    const r = p.pick(s, bar);
    expect(r.activity).toBeTruthy();
    expect(r.activity.kind).toBe('quest_synth');
  });

  it('filters out completed quest actions', () => {
    const s = new BotState('unlimited');
    s.quests.add('alpha');
    const bar = new AttentionBar('unlimited');
    const p = new GoalPlanner({
      catalog: [],
      dag: STUB_DAG,
      quests: [{ id: 'alpha', questPoints: 1, requirements: {}, rewards: {} }],
      seed: 1,
    });
    const r = p.pick(s, bar);
    expect(r.activity).toBe(null);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// v0.9 Wave C — C9 novelty bonus
// ══════════════════════════════════════════════════════════════════════════════

describe('noveltyBonus', () => {
  it('is NOVELTY_COEFF when never touched', () => {
    const s = new BotState('low');
    expect(noveltyBonus({ id: 'fresh' }, s)).toBe(NOVELTY_COEFF);
  });

  it('decays with repeat touches', () => {
    const s = new BotState('low');
    s.recordTouch('grind');
    const once = noveltyBonus({ id: 'grind' }, s);
    s.recordTouch('grind');
    s.recordTouch('grind');
    const thrice = noveltyBonus({ id: 'grind' }, s);
    expect(once).toBeGreaterThan(thrice);
  });

  it('returns 0 when state has no touch tracker', () => {
    expect(noveltyBonus({ id: 'x' }, {})).toBe(0);
    expect(noveltyBonus({ id: 'x' }, null)).toBe(0);
  });
});

describe('BotState touch window', () => {
  it('tracks counts for the last N touches', () => {
    const s = new BotState('low', { touchWindow: 3 });
    s.recordTouch('a');
    s.recordTouch('a');
    s.recordTouch('b');
    expect(s.touchCount('a')).toBe(2);
    expect(s.touchCount('b')).toBe(1);
    // Fourth touch evicts the oldest 'a'.
    s.recordTouch('c');
    expect(s.touchCount('a')).toBe(1);
    expect(s.touchCount('c')).toBe(1);
  });

  it('defaults the window to 100', () => {
    const s = new BotState('low');
    expect(s.touchWindow).toBe(DEFAULT_TOUCH_WINDOW);
  });
});

describe('GoalPlanner rotation prefers under-used actions', () => {
  it('novelty nudges the planner toward less-touched catalog entries', () => {
    const s = new BotState('unlimited', { touchWindow: 50 });
    const bar = new AttentionBar('unlimited');
    // Two catalog entries with equal per-tick return.
    const catalog = [
      { id: 'stale', intensity: 1, time_ms: 1000, base_output: { xp: { mining: 100 } } },
      { id: 'fresh', intensity: 1, time_ms: 1000, base_output: { xp: { mining: 100 } } },
    ];
    // Pre-touch 'stale' many times so novelty decays on it.
    for (let i = 0; i < 40; i++) s.recordTouch('stale');
    const p = new GoalPlanner({ catalog, dag: STUB_DAG, seed: 1 });
    p.setGoals([{ kind: 'skill', target: 'mining' }]);
    // Over many picks, 'fresh' should win the ranking most of the time.
    let freshWins = 0;
    for (let i = 0; i < 50; i++) {
      const r = p.pick(s, bar);
      if (r && r.activity && r.activity.id === 'fresh') freshWins++;
    }
    expect(freshWins).toBeGreaterThan(30);
  });
});
