// Balance diagnostic — goal planner
// Covers feasibility filter, scoring, top-k pick, budget fallback.

import { describe, it, expect } from 'vitest';
import {
  GoalPlanner, filterByState, scoreSkill, scoreGp, scoreQuest, scoreAction,
  pickTopKWithEpsilon, mulberry32,
} from '../../src/sim/goal-planner.js';
import { BotState } from '../../src/sim/state.js';
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
