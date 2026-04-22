// Gathering skills — mining / fishing / woodcutting success formula + nodes.

import { describe, it, expect } from 'vitest';
import { createPlayer, addXp } from '../../src/player/player.js';
import gathering from '../../src/skills/gathering.js';

describe('gathering skills', () => {
  it('listNodes returns at least the basic mining/wc/fishing nodes', () => {
    expect(gathering.listNodes('mining').length).toBeGreaterThan(0);
    expect(gathering.listNodes('woodcutting').length).toBeGreaterThan(0);
    expect(gathering.listNodes('fishing').length).toBeGreaterThan(0);
  });

  it('successChance is monotonically increasing in level', () => {
    const c1 = gathering.successChance(1, 10, 150);
    const c99 = gathering.successChance(99, 10, 150);
    expect(c99).toBeGreaterThan(c1);
  });

  it('getNode copper_rock returns mining level 1', () => {
    const n = gathering.getNode('copper_rock');
    expect(n).toBeTruthy();
    expect(n.level).toBe(1);
    expect(n.skill).toBe('mining');
  });

  it('xpToLevel inverse of levelToXp', () => {
    for (const l of [1, 10, 50, 75, 92, 99]) {
      expect(gathering.xpToLevel(gathering.levelToXp(l))).toBe(l);
    }
  });

  it('gatherTick rejects a player below level', () => {
    const p = createPlayer(600, 'Miner');
    const r = gathering.gatherTick(p, 'runite_rock');
    expect(r.error).toBeDefined();
  });

  it('computeMethodRate yields a positive xpPerHour for normal tree w/ bronze axe at 30', () => {
    const rate = gathering.computeMethodRate('normal_tree', 30, 'Bronze axe');
    expect(rate.xpPerHour).toBeGreaterThan(0);
  });
});
