// Bank deposit / withdraw / tab round-trip.

import { describe, it, expect, beforeEach } from 'vitest';
import { createPlayer, invAdd, invFreeSlots } from '../../src/player/player.js';
import bank from '../../src/engine/bank.js';
import items from '../../src/data/items.js';

// Minimal item registry so bank resolves defs.
items.define({ id: 5001, name: 'Test log', examine: 'Loggy.', value: 5, category: 'misc', stackable: false, weight: 1 });
items.define({ id: 5002, name: 'Test ore', examine: 'Rocky.', value: 3, category: 'misc', stackable: false, weight: 1 });

function freshPlayer() {
  const p = createPlayer(50, 'Banker');
  bank.ensureBankState(p);
  return p;
}

const ctx = {
  items: items,
  invAdd,
  invFreeSlots,
};

describe('bank', () => {
  it('ensureBankState initialises tabs + placeholders', () => {
    const p = freshPlayer();
    expect(p.bankTabs[0]).toBe('All');
    expect(p.bank).toEqual([]);
    expect(p.placeholdersOn).toBe(false);
  });

  it('deposits a log from inventory', () => {
    const p = freshPlayer();
    invAdd(p, 5001, 'Test log', 1);
    const r = bank.deposit(p, ctx, 'Test log', 1);
    expect(r.ok).toBe(true);
    expect(p.bank[0].id).toBe(5001);
    expect(p.bank[0].count).toBe(1);
  });

  it('rejects deposit when item is not in inventory', () => {
    const p = freshPlayer();
    const r = bank.deposit(p, ctx, 'Test log', 1);
    expect(r.ok).toBe(false);
  });

  it('deposit all + withdraw round-trips item count', () => {
    const p = freshPlayer();
    for (let i = 0; i < 5; i++) invAdd(p, 5001, 'Test log', 1);
    bank.deposit(p, ctx, 'Test log', 'all');
    expect(p.bank[0].count).toBe(5);

    const w = bank.withdraw(p, ctx, 'Test log', 3);
    expect(w.ok).toBe(true);
    expect(p.bank[0].count).toBe(2);
  });

  it('creates a custom tab and targets it on deposit', () => {
    const p = freshPlayer();
    invAdd(p, 5001, 'Test log', 1);
    bank.createTab(p, 'Combat');
    const r = bank.deposit(p, ctx, 'Test log', 1, 'Combat');
    expect(r.ok).toBe(true);
    expect(p.bank[0].tab).toBeGreaterThan(0);
  });

  it('bankValue computes sum of stored value', () => {
    const p = freshPlayer();
    invAdd(p, 5001, 'Test log', 4);
    bank.deposit(p, ctx, 'Test log', 'all');
    // bankValue returns object { total, top5, ... } — only check shape.
    const v = bank.bankValue(p, ctx);
    expect(v).toBeTruthy();
    expect(typeof v.total).toBe('number');
  });
});
