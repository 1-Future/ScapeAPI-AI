// Death handler — protect-item, respawn, grave placement.

import { describe, it, expect, beforeEach } from 'vitest';
import { createPlayer, invAdd } from '../../src/player/player.js';
import death from '../../src/engine/death.js';
import items from '../../src/data/items.js';

// Minimal items the death module relies on for value sort.
items.define({ id: 101, name: 'Coins', examine: '', value: 1, stackable: true, weight: 0, category: 'currency' });

beforeEach(() => {
  death._resetForTests();
});

describe('death handler', () => {
  it('getRespawnPoint returns a 3-tuple (x,y,layer) or object', () => {
    const p = createPlayer(300, 'Respawner');
    const r = death.getRespawnPoint(p);
    expect(r).toBeTruthy();
  });

  it('setRespawnPoint + getRespawnPoint round-trip', () => {
    const p = createPlayer(301, 'RespawnSet');
    death.setRespawnPoint(p, { x: 42, y: 43, layer: 0 });
    const got = death.getRespawnPoint(p);
    expect(got.x).toBe(42);
    expect(got.y).toBe(43);
  });

  it('placeGrave records a grave', () => {
    const p = createPlayer(302, 'Dier');
    const grave = death.placeGrave(p, { x: 5, y: 6, layer: 0 }, [
      { id: 101, name: 'Coins', count: 100 },
    ]);
    expect(grave).toBeTruthy();
    expect(death.listGraves().length).toBeGreaterThan(0);
  });

  it('restoreStats heals HP to full', () => {
    const p = createPlayer(303, 'Healed');
    p.hp = 1;
    death.restoreStats(p);
    expect(p.hp).toBe(p.maxHp);
  });

  it('hasProtectItem returns false for empty player', () => {
    const p = createPlayer(304, 'NoProtect');
    expect(death.hasProtectItem(p)).toBe(false);
  });
});
