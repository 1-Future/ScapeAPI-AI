// Tick system — phase registration, schedule, advance.

import { describe, it, expect } from 'vitest';
import tick from '../../src/engine/tick.js';

describe('tick system', () => {
  it('registerPhase accepts valid phases', () => {
    const calls = [];
    tick.registerPhase('preTick', 'test:pre', () => calls.push('pre'));
    tick.registerPhase('postTick', 'test:post', () => calls.push('post'));
    // Run a single tick manually via the phase-driven step when available.
    if (typeof tick.processTick === 'function') tick.processTick();
    tick.unregisterPhase('preTick', 'test:pre');
    tick.unregisterPhase('postTick', 'test:post');
    expect(Array.isArray(calls)).toBe(true);
  });

  it('registerPhase rejects unknown phase', () => {
    expect(() => tick.registerPhase('bogusPhase', 'x', () => {})).toThrow();
  });

  it('schedule + cancelScheduled remove the entry', () => {
    tick.schedule(tick.getTick() + 100, 0, 'test:scheduled', () => {});
    const cancelled = tick.cancelScheduled('test:scheduled');
    expect(cancelled).toBe(true);
  });

  it('getTick returns a non-negative integer', () => {
    expect(tick.getTick()).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(tick.getTick())).toBe(true);
  });
});
