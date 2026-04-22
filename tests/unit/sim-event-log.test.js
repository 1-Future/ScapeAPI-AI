// Balance diagnostic — event log
// Covers emit normalisation, type validation, account filter.

import { describe, it, expect } from 'vitest';
import { EventLog, EVENT_TYPES } from '../../src/sim/event-log.js';

describe('event log', () => {
  it('emit normalises default fields', () => {
    const log = new EventLog();
    const ev = log.emit({ account: 'low', type: EVENT_TYPES.BOOT });
    expect(ev.timestamp).toMatch(/\d{4}-\d{2}-\d{2}T/);
    expect(ev.sim_day).toBe(0);
    expect(ev.tick).toBe(0);
    expect(ev.action_id).toBe(null);
    expect(ev.drain).toBe(0);
  });

  it('emit stores to events[]', () => {
    const log = new EventLog();
    log.emit({ account: 'low', type: EVENT_TYPES.ACTION });
    log.emit({ account: 'high', type: EVENT_TYPES.ACTION });
    expect(log.size()).toBe(2);
  });

  it('emit rejects unknown event type', () => {
    const log = new EventLog();
    expect(() => log.emit({ account: 'low', type: 'bogus' })).toThrow(/unknown event type/);
  });

  it('forAccount filters by archetype', () => {
    const log = new EventLog();
    log.emit({ account: 'low', type: EVENT_TYPES.ACTION });
    log.emit({ account: 'medium', type: EVENT_TYPES.ACTION });
    log.emit({ account: 'low', type: EVENT_TYPES.SESSION_END });
    expect(log.forAccount('low').length).toBe(2);
    expect(log.forAccount('medium').length).toBe(1);
    expect(log.forAccount('absent').length).toBe(0);
  });

  it('exposes the 6 canonical event types', () => {
    expect(EVENT_TYPES.BOOT).toBe('boot');
    expect(EVENT_TYPES.ACTION).toBe('action');
    expect(EVENT_TYPES.SESSION_END).toBe('session_end');
    expect(EVENT_TYPES.DAY_END).toBe('day_end');
    expect(EVENT_TYPES.GOAL_SET).toBe('goal_set');
    expect(EVENT_TYPES.GAP).toBe('gap');
  });
});
