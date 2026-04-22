// Event bus — on/off/emit with handler priority.

import { describe, it, expect } from 'vitest';
import events from '../../src/engine/events.js';

describe('event bus', () => {
  it('emits to registered handler', () => {
    let received = null;
    events.on('test:hello', 'h1', (d) => { received = d; });
    events.emit('test:hello', { payload: 'world' });
    expect(received).toEqual({ payload: 'world' });
    events.off('test:hello', 'h1');
  });

  it('off removes the handler', () => {
    let count = 0;
    events.on('test:counter', 'h1', () => count++);
    events.emit('test:counter');
    events.off('test:counter', 'h1');
    events.emit('test:counter');
    expect(count).toBe(1);
  });

  it('handlers fire in priority order (lower first)', () => {
    const order = [];
    events.on('test:ordered', 'late', () => order.push('late'), 10);
    events.on('test:ordered', 'early', () => order.push('early'), 0);
    events.emit('test:ordered');
    expect(order).toEqual(['early', 'late']);
    events.off('test:ordered', 'early');
    events.off('test:ordered', 'late');
  });

  it('swallows handler exceptions', () => {
    events.on('test:throw', 'boom', () => { throw new Error('bad'); });
    // Should not throw to caller.
    expect(() => events.emit('test:throw')).not.toThrow();
    events.off('test:throw', 'boom');
  });
});
