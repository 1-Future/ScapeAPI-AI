# Burn-out rate changes

Generated: 2026-04-22T20:06:17.528Z

## Rule

For each Scape drop, `new_rate = min(current_rate, p99_kc_of_osrs_equivalent)`.
p99_kc = OSRS hiscores rank 50 KC (the "top 1% of dedicated players" ceiling).

## Collection log (data/collection-log.json)

- Items scanned: 808
- Items rebalanced: 11

### Per-source changes

**skilling_pets** → OSRS vorkath (p99 = 54626)
  - [80101] Rock golem (pet): `1/62500` → `1/54626` (reduced 1.14×)
  - [80102] Heron: `1/62500` → `1/54626` (reduced 1.14×)
  - [80103] Beaver: `1/62500` → `1/54626` (reduced 1.14×)
  - [80106] Rocky: `1/62500` → `1/54626` (reduced 1.14×)
  - [80107] Rift guardian: `1/62500` → `1/54626` (reduced 1.14×)
  - [80110] Chompy chick: `1/62500` → `1/54626` (reduced 1.14×)
  - [80111] Nexling: `1/62500` → `1/54626` (reduced 1.14×)
  - [80119] Defence turtle: `1/125000` → `1/54626` (reduced 2.29×)

**other_daily_random_events** → OSRS hespori (p99 = 1829)
  - [80301] Genie wisp: `1/2500` → `1/1829` (reduced 1.37×)
  - [80302] Drunken dwarf: `1/2500` → `1/1829` (reduced 1.37×)
  - [80303] Sandwich lady pet: `1/3000` → `1/1829` (reduced 1.64×)

### Summary stats

- Avg reduction factor: 1.33×
- Max reduction factor: 2.29×

## raids-mega1.js inline petRate

- Tails scanned: 12
- Tails rebalanced: 0

No changes — all inline petRates already within the chambers_of_xeric p99 cap (7272).

## Default petRate = 1500

`bosses-expanded.js`, `raids-bosses-mega.js`, and `raids-mega2.js` all default
`petRate = 1500` for every call. 1500 < all p99 ceilings in our 20-boss sample,
so no changes are needed at the code level. (The audit confirms the default was
already aligned with realistic commitment post the v0.9-waveB4 H14 rebalance.)