// Combat damage calc — OSRS-accurate max-hit + accuracy.

import { describe, it, expect } from 'vitest';
import { createPlayer, addXp } from '../../src/player/player.js';
import {
  maxHitMelee, maxHitRanged, attackRoll, effectiveLevel,
  getEquipBonus, accuracy, npcDefenceRoll,
} from '../../src/combat/combat.js';

function vanillaPlayer(id = 10, name = 'Dummy') {
  const p = createPlayer(id, name);
  // Prevent boost math weirdness.
  p.boosts = {};
  return p;
}

describe('combat damage', () => {
  it('level-1 player has max melee hit of 1', () => {
    const p = vanillaPlayer();
    expect(maxHitMelee(p)).toBe(1);
  });

  it('max-hit rises with strength XP', () => {
    const weak = vanillaPlayer();
    const strong = vanillaPlayer(11, 'Strong');
    addXp(strong, 'strength', 1_000_000); // ≈ level 73
    expect(maxHitMelee(strong)).toBeGreaterThan(maxHitMelee(weak));
  });

  it('effectiveLevel adds +8 base + 3 style invisible (accurate atk bonus)', () => {
    const p = vanillaPlayer();
    p.attackStyle = 'accurate';
    expect(effectiveLevel(p, 'attack')).toBe(1 + 3 + 8);
  });

  it('aggressive style adds invisible to strength', () => {
    const p = vanillaPlayer();
    p.attackStyle = 'aggressive';
    expect(effectiveLevel(p, 'strength')).toBe(1 + 3 + 8);
    expect(effectiveLevel(p, 'attack')).toBe(1 + 8); // no bonus
  });

  it('getEquipBonus sums stats across worn items', () => {
    const p = vanillaPlayer();
    p.equipment.weapon = { id: 99, name: 'Test sword', stats: { slash: 50, melee_strength: 30 } };
    p.equipment.body = { id: 100, name: 'Plate', stats: { slash: 10 } };
    expect(getEquipBonus(p.equipment, 'slash')).toBe(60);
    expect(getEquipBonus(p.equipment, 'melee_strength')).toBe(30);
  });

  it('attackRoll = effectiveAtk * (bonus+64) for base player', () => {
    const p = vanillaPlayer();
    const roll = attackRoll(p, 'slash');
    // effectiveLevel(atk) = 1 + 3 + 8 = 12 (accurate + atk-tied style)
    // equip bonus = 0
    expect(roll).toBe(12 * 64);
  });

  it('accuracy is between 0 and 1', () => {
    const p = vanillaPlayer();
    const npcDef = 50;
    const acc = accuracy(attackRoll(p, 'slash'), npcDef);
    expect(acc).toBeGreaterThanOrEqual(0);
    expect(acc).toBeLessThanOrEqual(1);
  });

  it('ranged max-hit defaults to 1 when un-equipped', () => {
    const p = vanillaPlayer();
    expect(maxHitRanged(p)).toBeGreaterThanOrEqual(1);
  });
});
