// Processing skills — cooking + smithing recipe attempt.

import { describe, it, expect } from 'vitest';
import { createPlayer, invAdd } from '../../src/player/player.js';
import processing from '../../src/skills/processing.js';

describe('processing skills', () => {
  it('listRecipes contains cooking + smithing defs', () => {
    const cooking = processing.listRecipes('cooking');
    const smithing = processing.listRecipes('smithing');
    expect(cooking.length).toBeGreaterThan(0);
    expect(smithing.length).toBeGreaterThan(0);
  });

  it('cook shrimps consumes raw shrimp', () => {
    const p = createPlayer(700, 'Cook');
    p.skills.cooking = { xp: 0, level: 1 };
    invAdd(p, 2301, 'Raw shrimps', 1);
    const r = processing.processAttempt(p, 'cook_shrimps');
    expect(r.success === true || r.success === false).toBe(true);
    // Whether burnt or cooked, the raw slot is now gone.
    const stillRaw = p.inventory.find(s => s && s.id === 2301);
    expect(stillRaw).toBeFalsy();
  });

  it('rejects cooking above burn level threshold w/ real inventory', () => {
    const p = createPlayer(701, 'SalmonFail');
    p.skills.cooking = { xp: 0, level: 1 };
    // Level 1 can't cook salmon (needs 25).
    invAdd(p, 2303, 'Raw salmon', 1);
    const r = processing.processAttempt(p, 'cook_salmon');
    expect(r.error).toBe('level_too_low');
  });

  it('smelting bronze requires copper + tin', () => {
    const p = createPlayer(702, 'Smith');
    p.skills.smithing = { xp: 0, level: 1 };
    invAdd(p, 2101, 'Copper ore', 1);
    // No tin yet.
    const r = processing.processAttempt(p, 'smelt_bronze');
    expect(r.error).toBe('missing_secondary');
  });

  it('getRecipe returns a definition', () => {
    const r = processing.getRecipe('cook_shrimps');
    expect(r.skill).toBe('cooking');
  });
});
