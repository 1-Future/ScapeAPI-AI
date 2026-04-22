// Prayer runner — activation, drain, bury XP.

import { describe, it, expect } from 'vitest';
import { createPlayer, addXp } from '../../src/player/player.js';
import prayer from '../../src/engine/prayer-runner.js';

describe('prayer runner', () => {
  it('bury XP for bones defaults to 4.5 at the regular altar', () => {
    const xp = prayer.buryXp('Bones', 'regular');
    expect(xp).toBe(4.5);
  });

  it('altar multiplier increases bury XP', () => {
    const regularXp = prayer.buryXp('Bones', 'regular');
    const gildedXp  = prayer.buryXp('Bones', 'gilded');
    expect(gildedXp).toBeGreaterThanOrEqual(regularXp);
  });

  it('dragon bones grant more XP than bones', () => {
    expect(prayer.buryXp('Dragon bones', 'regular')).toBeGreaterThan(
      prayer.buryXp('Bones', 'regular')
    );
  });

  it('requires prayer level for higher prayers', () => {
    const p = createPlayer(400, 'PrayerNoob');
    p.skills.prayer = { xp: 0, level: 1 };
    p.prayerPoints = 1;
    const r = prayer.activate(p, 'piety');
    expect(r.ok).toBe(false); // piety needs prayer 70
  });

  it('activates a low-level prayer with level+points', () => {
    const p = createPlayer(401, 'PrayerOK');
    addXp(p, 'prayer', 1_000_000); // ≥ level 73
    p.prayerPoints = p.skills.prayer.level;
    const r = prayer.activate(p, 'piety');
    expect(r.ok).toBe(true);
  });
});
