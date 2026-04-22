// Unified skill-manifest registry — 23 skills, consistent shape.

import { describe, it, expect } from 'vitest';
import skills from '../../src/engine/skills/index.js';

describe('skill manifest registry', () => {
  it('exposes exactly 23 skills', () => {
    expect(skills.SKILL_IDS.length).toBe(23);
  });

  it('every skill id has a loadable manifest', () => {
    for (const id of skills.SKILL_IDS) {
      const m = skills.get(id);
      expect(m).toBeTruthy();
      expect(m.id).toBe(id);
      expect(typeof m.name).toBe('string');
      expect(Array.isArray(m.xpTable)).toBe(true);
      expect(m.xpTable.length).toBeGreaterThanOrEqual(100);
    }
  });

  it('every manifest declares at least one action', () => {
    for (const m of skills.list()) {
      expect(m.actions.length).toBeGreaterThan(0);
    }
  });

  it('capstone declares level 99 for every skill', () => {
    for (const m of skills.list()) {
      expect(m.capstone.level).toBe(99);
      expect(m.capstone.name).toBeTruthy();
    }
  });

  it('byCategory splits skills into 5 categories', () => {
    const combat      = skills.byCategory('combat');
    const gathering   = skills.byCategory('gathering');
    const processing  = skills.byCategory('processing');
    const support     = skills.byCategory('support');
    const exploration = skills.byCategory('exploration');
    const total = combat.length + gathering.length + processing.length + support.length + exploration.length;
    expect(total).toBe(23);
  });

  it('levelForXp matches OSRS table (lvl 99 = 13,034,431)', () => {
    expect(skills.levelForXp('mining', 13034431)).toBe(99);
    expect(skills.levelForXp('mining', 13034430)).toBe(98);
    expect(skills.levelForXp('mining', 0)).toBe(1);
  });

  it('unlockedActions filters by level gate', () => {
    const atLvl1  = skills.unlockedActions('mining', 1);
    const atLvl99 = skills.unlockedActions('mining', 99);
    expect(atLvl99.length).toBeGreaterThanOrEqual(atLvl1.length);
  });

  it('every action has a region tagged to one of the 9 Aelgard realms or "any"', () => {
    const valid = new Set([
      'Heartlands', 'Sootworks', 'Moryskah', 'Boneyard',
      'Glass Desert', 'Saltbrine', 'Veilwood', 'Inkweald', 'Wilds', 'any',
    ]);
    for (const m of skills.list()) {
      for (const a of m.actions) {
        if (a.region != null) {
          expect(valid.has(a.region)).toBe(true);
        }
      }
    }
  });

  it('actions are sorted or at-least-all within level 1..99', () => {
    for (const m of skills.list()) {
      for (const a of m.actions) {
        expect(a.level).toBeGreaterThanOrEqual(1);
        expect(a.level).toBeLessThanOrEqual(99);
      }
    }
  });

  it('every action has attention profile in the defined set', () => {
    const valid = new Set(Object.values(skills.ATTENTION));
    for (const m of skills.list()) {
      for (const a of m.actions) {
        if (a.attention != null) expect(valid.has(a.attention)).toBe(true);
      }
    }
  });
});
