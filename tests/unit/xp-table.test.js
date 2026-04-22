// XP table + level progression — OSRS-accurate table.
// Covers the canonical breakpoints (99, 50, 1) in both directions.

import { describe, it, expect } from 'vitest';
import { XP_TABLE, xpForLevel, levelForXp, addXp, createPlayer } from '../../src/player/player.js';

describe('XP table', () => {
  it('level 1 requires 0 XP', () => {
    expect(XP_TABLE[1]).toBe(0);
  });

  it('level 99 requires 13,034,431 XP (OSRS canon)', () => {
    expect(XP_TABLE[99]).toBe(13034431);
  });

  it('level 50 requires 101,333 XP (OSRS canon)', () => {
    expect(XP_TABLE[50]).toBe(101333);
  });

  it('levelForXp is inverse of xpForLevel', () => {
    for (let l = 1; l <= 99; l++) {
      expect(levelForXp(xpForLevel(l))).toBe(l);
    }
  });

  it('addXp levels up a fresh player to 10 with 1,154+ XP in attack', () => {
    const p = createPlayer(1, 'TestDummy');
    addXp(p, 'attack', 1200);
    expect(p.skills.attack.level).toBeGreaterThanOrEqual(10);
  });

  it('addXp caps at 200M', () => {
    const p = createPlayer(2, 'MaxXp');
    addXp(p, 'strength', 300_000_000);
    expect(p.skills.strength.xp).toBe(200_000_000);
  });

  it('hitpoints starts at level 10 (OSRS default)', () => {
    const p = createPlayer(3, 'HPCheck');
    expect(p.skills.hitpoints.level).toBe(10);
    expect(p.maxHp).toBe(10);
  });
});
