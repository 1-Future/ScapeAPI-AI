// Balance diagnostic — bot state + xp table
// Covers satisfies(), apply() mutations, level derivation, snapshot shape.

import { describe, it, expect } from 'vitest';
import { BotState, XP_TABLE, levelForXp } from '../../src/sim/state.js';

describe('bot state', () => {
  it('starts at level 1 in every skill', () => {
    const s = new BotState('low');
    expect(s.level('mining')).toBe(1);
    expect(s.level('cooking')).toBe(1);
  });

  it('satisfies returns true when no requires', () => {
    const s = new BotState('low');
    expect(s.satisfies(null)).toBe(true);
    expect(s.satisfies({})).toBe(true);
  });

  it('satisfies level requirement — fails then passes after XP', () => {
    const s = new BotState('low');
    const req = { level: { mining: 15 } };
    expect(s.satisfies(req)).toBe(false);

    // 2411 XP → level 15 on OSRS table
    s.apply({ base_output: { xp: { mining: 2411 } } });
    expect(s.satisfies(req)).toBe(true);
  });

  it('satisfies item requirement — consumes on apply', () => {
    const s = new BotState('low');
    s.inventory['iron-ore'] = 2;
    const req = { items: [{ id: 'iron-ore', qty: 1 }] };
    expect(s.satisfies(req)).toBe(true);
    s.apply({ requires: req, base_output: { xp: { smithing: 10 } } });
    expect(s.inventory['iron-ore']).toBe(1);
    s.apply({ requires: req, base_output: { xp: { smithing: 10 } } });
    expect(s.inventory['iron-ore']).toBeUndefined();
    expect(s.satisfies(req)).toBe(false);
  });

  it('apply produces XP, GP, items and flips quests', () => {
    const s = new BotState('medium');
    s.apply({
      base_output: {
        xp: { mining: 17.5 },
        gp: 25,
        items: [{ id: 'copper-ore', qty: 1 }],
        quest: 'tutorial-island',
      },
    });
    expect(s.skills.mining).toBe(17.5);
    expect(s.gp).toBe(25);
    expect(s.inventory['copper-ore']).toBe(1);
    expect(s.quests.has('tutorial-island')).toBe(true);
  });

  it('snapshot is JSON-safe and includes derived levels', () => {
    const s = new BotState('high');
    s.apply({ base_output: { xp: { fishing: 100 } } });
    const snap = s.snapshot();
    expect(() => JSON.stringify(snap)).not.toThrow();
    expect(snap.levels.fishing).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(snap.unlocks)).toBe(true);
  });

  it('highestLevel walks every skill', () => {
    const s = new BotState('low');
    s.apply({ base_output: { xp: { mining: 500, cooking: 5000 } } });
    const minLvl = levelForXp(500);
    const cookLvl = levelForXp(5000);
    expect(s.highestLevel()).toBe(Math.max(minLvl, cookLvl));
  });

  it('totalXp sums across skills', () => {
    const s = new BotState('low');
    s.apply({ base_output: { xp: { mining: 100, cooking: 50 } } });
    expect(s.totalXp()).toBe(150);
  });

  it('XP_TABLE has OSRS level 99 value', () => {
    expect(XP_TABLE[99]).toBe(13034431);
  });
});
