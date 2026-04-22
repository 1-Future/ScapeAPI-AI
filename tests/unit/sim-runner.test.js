// Balance diagnostic — end-to-end runner + renderer smoke tests.
// Covers: 30-day run produces 4 bots' logs, log is readable, HTML renders.

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { runDiagnostic, ARCHETYPES, EIGHT_HOURS_MS } from '../../src/sim/hyperspeed-runner.js';
import { renderHtml, aggregate, detectContentGaps, computeRatios } from '../../src/sim/render-html.js';
import { EventLog, EVENT_TYPES } from '../../src/sim/event-log.js';

describe('runner — hyperspeed diagnostic', () => {
  it('exposes the 4 canonical archetypes', () => {
    expect(ARCHETYPES).toEqual(['low', 'medium', 'high', 'unlimited']);
    expect(EIGHT_HOURS_MS).toBe(8 * 60 * 60 * 1000);
  });

  it('runs a 2-day, 2-account diagnostic and writes a readable JSONL', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'scape-sim-'));
    const result = await runDiagnostic({
      days: 2,
      accounts: ['low', 'unlimited'],
      seed: 7,
      reportsDir: tmp,
    });
    expect(fs.existsSync(result.outPath)).toBe(true);
    const events = EventLog.readFile(result.outPath);
    expect(events.length).toBeGreaterThan(10);
    // Every account has at least one BOOT, one DAY_END
    for (const arch of ['low', 'unlimited']) {
      const acctEvents = events.filter(e => e.account === arch);
      expect(acctEvents.some(e => e.type === EVENT_TYPES.BOOT)).toBe(true);
      expect(acctEvents.some(e => e.type === EVENT_TYPES.DAY_END)).toBe(true);
      expect(acctEvents.some(e => e.type === EVENT_TYPES.ACTION)).toBe(true);
    }
  }, 20_000);

  it('low-cap bot logs fewer action events than unlimited', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'scape-sim-ratio-'));
    const result = await runDiagnostic({
      days: 3,
      accounts: ['low', 'unlimited'],
      seed: 13,
      reportsDir: tmp,
    });
    const events = EventLog.readFile(result.outPath);
    const lowCount = events.filter(e => e.account === 'low' && e.type === EVENT_TYPES.ACTION).length;
    const unlCount = events.filter(e => e.account === 'unlimited' && e.type === EVENT_TYPES.ACTION).length;
    expect(lowCount).toBeGreaterThan(0);
    expect(unlCount).toBeGreaterThan(lowCount);
  }, 20_000);
});

describe('aggregator + renderer', () => {
  it('aggregate computes per-account totals', () => {
    const events = [
      { account: 'low', type: EVENT_TYPES.BOOT, state_snapshot: { cap: 200 } },
      { account: 'low', type: EVENT_TYPES.ACTION, action_id: 'x', drain: 2, output: { xp: { mining: 17.5 }, gp: 5 }, state_snapshot: { day_ms: 3000, levels: { mining: 2 } } },
      { account: 'low', type: EVENT_TYPES.ACTION, action_id: 'x', drain: 2, output: { xp: { mining: 17.5 }, gp: 5 }, state_snapshot: { day_ms: 6000, levels: { mining: 2 } } },
      { account: 'low', type: EVENT_TYPES.DAY_END, sim_day: 0, state_snapshot: { totalXp: 35, gp: 10, highestLevel: 2, quests: [], unlocks: 2 } },
    ];
    const agg = aggregate(events);
    expect(agg.low.totalXp).toBe(35);
    expect(agg.low.totalGp).toBe(10);
    expect(agg.low.ticks).toBe(2);
    expect(agg.low.cap).toBe(200);
    expect(agg.low.actionCounts.x.count).toBe(2);
    expect(agg.low.actionCounts.x.drain).toBe(4);
  });

  it('detectContentGaps flags a 50% single-action run as repetition trap', () => {
    const events = [
      { account: 'low', type: EVENT_TYPES.BOOT, state_snapshot: { cap: 200 } },
      { account: 'low', type: EVENT_TYPES.ACTION, action_id: 'grind', drain: 10, output: {} },
      { account: 'low', type: EVENT_TYPES.ACTION, action_id: 'grind', drain: 10, output: {} },
      { account: 'low', type: EVENT_TYPES.ACTION, action_id: 'other', drain: 5, output: {} },
      { account: 'low', type: EVENT_TYPES.DAY_END, sim_day: 0, state_snapshot: { totalXp: 0, gp: 0, highestLevel: 1, quests: [], unlocks: 1 } },
    ];
    const agg = aggregate(events);
    const gaps = detectContentGaps(agg);
    expect(gaps.some(g => g.text.includes('repetition trap'))).toBe(true);
  });

  it('computeRatios returns low/unlimited proportion', () => {
    const agg = {
      low:       { totalXp: 100, archetype: 'low' },
      unlimited: { totalXp: 500, archetype: 'unlimited' },
    };
    const ratios = computeRatios(agg);
    const low = ratios.find(r => r.archetype === 'low');
    expect(low).toBeTruthy();
    expect(low.ratio).toBeCloseTo(0.2, 2);
  });

  it('renderHtml produces a non-empty HTML with required sections', () => {
    const events = [
      { account: 'low', type: EVENT_TYPES.BOOT, state_snapshot: { cap: 200 } },
      { account: 'low', type: EVENT_TYPES.ACTION, action_id: 'a', drain: 1, output: { xp: { mining: 10 }, gp: 1 }, state_snapshot: { day_ms: 1000, levels: { mining: 1 } } },
      { account: 'low', type: EVENT_TYPES.DAY_END, sim_day: 0, state_snapshot: { totalXp: 10, gp: 1, highestLevel: 1, quests: [], unlocks: 1 } },
    ];
    const html = renderHtml(events);
    expect(html).toMatch(/<!DOCTYPE html>/);
    expect(html).toMatch(/Balance Diagnostic/);
    expect(html).toMatch(/Headline/);
    expect(html).toMatch(/Activity mix/);
    expect(html).toMatch(/Content-gap callouts/);
    expect(html).toMatch(/<svg/);
  });
});
