// Items registry — define + get + find + search.

import { describe, it, expect } from 'vitest';
import items from '../../src/data/items.js';

describe('items registry', () => {
  it('define + get round-trips', () => {
    items.define({ id: 70001, name: 'Test fish', examine: 'Fishy.', value: 10, category: 'food', weight: 0.5 });
    const def = items.get(70001);
    expect(def.name).toBe('Test fish');
  });

  it('find is case-insensitive name lookup', () => {
    items.define({ id: 70002, name: 'Bread', examine: '', value: 12, category: 'food', weight: 0.5 });
    const def = items.find('bread');
    expect(def).toBeTruthy();
    expect(def.id).toBe(70002);
  });

  it('FOOD_HEAL map is defined', () => {
    expect(typeof items.FOOD_HEAL).toBe('object');
  });
});
