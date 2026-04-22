// Balance diagnostic — attention bar
// Covers cap assignment, drain semantics, exhaustion, refill, unlimited case.

import { describe, it, expect } from 'vitest';
import { AttentionBar, CAPS, capFor } from '../../src/sim/attention-bar.js';

describe('attention bar', () => {
  it('exposes the 4 canonical caps', () => {
    expect(CAPS.low).toBe(200);
    expect(CAPS.medium).toBe(500);
    expect(CAPS.high).toBe(1000);
    expect(CAPS.unlimited).toBe(Infinity);
  });

  it('capFor throws on unknown archetype', () => {
    expect(() => capFor('banana')).toThrow();
  });

  it('drain decreases bar by the requested cost', () => {
    const b = new AttentionBar('medium');
    expect(b.bar).toBe(500);
    b.drain(40);
    expect(b.bar).toBe(460);
  });

  it('drain never goes negative', () => {
    const b = new AttentionBar('low');
    b.drain(500);
    expect(b.bar).toBe(0);
  });

  it('isExhausted is true when low bar hits 0', () => {
    const b = new AttentionBar('low');
    expect(b.isExhausted()).toBe(false);
    b.drain(200);
    expect(b.isExhausted()).toBe(true);
  });

  it('unlimited is never exhausted', () => {
    const b = new AttentionBar('unlimited');
    b.drain(1e9);
    expect(b.isExhausted()).toBe(false);
    expect(b.canAfford(1e18)).toBe(true);
  });

  it('refill restores to cap', () => {
    const b = new AttentionBar('high');
    b.drain(800);
    b.refill();
    expect(b.bar).toBe(1000);
  });

  it('canAfford checks bar for finite caps', () => {
    const b = new AttentionBar('low');
    expect(b.canAfford(100)).toBe(true);
    b.drain(150);
    expect(b.canAfford(100)).toBe(false);
    expect(b.canAfford(50)).toBe(true);
  });

  it('drain rejects invalid cost', () => {
    const b = new AttentionBar('medium');
    expect(() => b.drain(-1)).toThrow();
    expect(() => b.drain(NaN)).toThrow();
  });
});
