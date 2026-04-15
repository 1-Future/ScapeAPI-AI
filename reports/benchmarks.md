# Scape benchmarks — burn-v2

Generated: 2026-04-15T12:51:32.323Z  
Host: win32 x64 — AMD Ryzen 9 9950X 16-Core Processor             × 32  
Node: v24.13.1  
RSS at exit: 100.36MB

| Bench | Target | Actual | Pass |
| --- | --- | --- | --- |
| GE matchTick × 1000 @ 10k orders / 500 items | <=20ms/matchTick, >=1000 matches/s | avg 0.006ms  p95 0.021ms  p99 0.050ms  hot 834934 matches/s | yes |
| 100 players × 1000 ticks | 0 ticks > 600ms budget, p99 <= 50ms | avg 0.004ms  p50 0.003ms  p95 0.010ms  p99 0.021ms  max 0.183ms  over-budget 0 | yes |
| Persistence round-trip (100p + 20k GE + 500 graves + 50 clans) | save <= 3000ms, load <= 3000ms, disk <= 50MB | save 12.88ms  load 19.06ms  disk 5.72MB  verified: 20000 GE / 50 clans / 500 graves / 100 players | yes |
| Breakpoint subscriber scaling | >=1e5 events/s, no listener leak | 674841 events/s  mem/sub 0.31KB  baseline 0 postTeardown 0  postSub 1000 | yes |

## 1. Grand Exchange — 10k open orders, 500 items

- Target: ≤20ms per matchTick; ≥1000 matches/second
- Actual: avg **0.006ms** per matchTick; hot-cross throughput **834934 matches/s**
- Percentiles (matchTick): p95=0.021ms  p99=0.050ms
- Order book size after placement: 20000 open offers (10000 buys + 10000 sells, fails=0)
- Place-all time: 15.17ms  (0.001ms per placeOffer)
- 1000 matchTick passes total: 5.80ms
- Heap delta during GE bench: 1.25MB

## 2. Tick loop stability — 100 simulated players × 1000 ticks

- Target: zero ticks over the 600ms budget; p99 ≤ 50ms
- Actual: avg **0.004ms**  p50=0.003ms  p95=0.010ms  p99=0.021ms  max=0.183ms
- Ticks over 600ms budget: 0
- Total runtime: 3.67ms for 1000 ticks (0.004ms/tick wall)
- Heap delta during tick bench: 0.08MB

## 3. Persistence round-trip — 100 players + 20k GE + 500 graves + 50 clans

- Target: save ≤ 3000ms; load ≤ 3000ms; disk ≤ 50MB
- Actual: save **12.88ms**, load **19.06ms**, disk **5.72MB**
- Verified after reload: 20000 GE orders, 50 clans, 500 graves, 100 players
- File breakdown:
  - clans.json: 118.2 KB
  - ge.json: 4611.6 KB
  - graves.json: 127.0 KB
  - players-bench.json: 1001.5 KB
- Heap delta during persistence bench: 2.77MB

## 4. Breakpoint subscriber scaling

- Target: ≥100,000 events/s with 1000 subscribers; no listener leak across 1000 sub+unsub cycles
- Actual: **674841 events/s**  (14.82ms for 10000 events × 1000 subs = 10000000.00 listener invocations)
- Memory per subscriber: 0.31KB (heap delta 0.31MB / 1000 subs)
- Leak test: baseline listeners=0, after 1000 sub+unsub cycles=0 (NO LEAK)

## Regressions and next-step commits

All four benches met their primary targets in this run. Monitor `scripts/test-bench-thresholds.js` in CI to catch regressions early.
