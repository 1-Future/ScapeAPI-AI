# Burn-out curves — ground-truth from OSRS hiscores

Generated: 2026-04-22
Source data: `data/osrs-hiscores-snapshot.json` (147 fetches, 0 failures)
Derived thresholds: `data/burnout-thresholds.json`

## What this is

Scape's v1.0 balance diagnostic previously reported a ~53,500-hour average-luck
coll-log completion window. That number assumes infinite player patience — it
asks "how many hours at average luck?" without ever asking "how many hours
would a realistic player actually commit before quitting?"

This document calibrates the second question using real OSRS hiscores as
ground truth. We sampled 7 rank points (1, 50, 200, 1000, 5000, 25000, 100000)
across 21 priority bosses and mapped those ranks to percentiles of the player
population that ever tried the boss:

| Rank       | Percentile | Label                                         |
|------------|------------|-----------------------------------------------|
| 1          | p99.9      | Ladder top — usually bots or ultra-grinders   |
| 50         | p99        | Realistic dedicated-player ceiling            |
| 200        | p95        | Serious grinder                               |
| 1000       | p90        | Committed                                     |
| 5000       | median     | Typical dedicated player                      |
| 25000      | p10        | Casual / lapsed                               |
| 100000     | p1         | One-and-done or legacy                        |

The **p99_kc** value is our burn-out threshold — the "1% of dedicated players
grind this far before quitting" signal. Drop rates whose expected-kills count
exceeds p99_kc are mathematically unreachable for all but the top 1%.

## Per-boss curves

Values in kill count. Blank = rank below boss-ladder cutoff.

| Boss                 | median | p90     | p99     | p99.9   |
|----------------------|--------|---------|---------|---------|
| Vorkath              |   6272 |  16993  |  54626  | 181887  |
| Zulrah               |   7600 |  15023  |  42756  | 179842  |
| Kraken               |   7577 |  12382  |  40112  | 144060  |
| General Graardor     |   2872 |   6715  |  26018  | 113214  |
| Sarachnis            |   3131 |   6751  |  20656  | 173948  |
| Cerberus             |   4228 |   7567  |  19679  | 123458  |
| Alchemical Hydra     |   4252 |   7412  |  19067  | 139910  |
| Corporeal Beast      |   1558 |   4814  |  18627  | 100000  |
| Dagannoth Rex        |   2753 |   5825  |  17811  |  48290  |
| Kree'Arra            |   1877 |   4697  |  17259  | 128504  |
| King Black Dragon    |   3334 |   6671  |  14329  |  48501  |
| Commander Zilyana    |   1818 |   3809  |  13541  |  42910  |
| K'ril Tsutsaroth     |   1329 |   3066  |  12005  |  26870  |
| Wintertodt           |   1700 |   5916  |   9858  |  99471  |
| Phantom Muspah       |   1081 |   2593  |   8681  |  40342  |
| Nightmare            |    666 |   2024  |   7957  |  20000  |
| Chambers of Xeric    |   1737 |   3016  |   7272  |  19761  |
| Theatre of Blood     |   1295 |   2549  |   6320  |  14077  |
| Phosani's Nightmare  |    750 |   2068  |   6262  |  21888  |
| Tempoross            |   1344 |   2055  |   5329  |  28804  |
| Hespori              |    415 |    800  |   1829  |   2288  |

## Cross-boss patterns

### Highest quit rates (lowest p99_kc — easiest to burn out on)

1. **Hespori** (p99 1829): Gated weekly seed, capped supply.
2. **Tempoross** (p99 5329): Minigame reward caps out early.
3. **Phosani's Nightmare** (p99 6262): Solo-only, brutal mechanics.
4. **Theatre of Blood** (p99 6320): Team-dependent, high friction per kill.
5. **Chambers of Xeric** (p99 7272): Team-dependent.

The pattern: **gated or high-friction content burns out fastest**. Players
quit when each kill requires a party, is time-boxed weekly, or has minigame-
reward diminishing returns.

### Stickiest bosses (highest p99_kc — players grind farthest)

1. **Vorkath** (p99 54626): GP-efficient, solo, scripted rotation.
2. **Zulrah** (p99 42756): Similar — fast kills, high GP/hour.
3. **Kraken** (p99 40112): Slayer-task AFK-friendly.
4. **General Graardor** (p99 26018): Low-intensity team-of-1 boss.
5. **Sarachnis** (p99 20656): Easy-access, steady GP + herbs.

Pattern: **solo, GP-efficient, low-intensity bosses are stickiest**. These are
the bosses where grinders spend 50k+ kills chasing max-luck uniques.

### Stickiness ratio (p99 / median)

Ratio of 4-6 = tight curve (everyone who engages grinds similarly). Ratio of
10+ = fat tail (a small elite grinds 10x harder than a typical dedicated
player).

| Fat-tail bosses (ratio > 9)    |       | Tight-curve bosses (ratio < 5) |      |
|--------------------------------|-------|--------------------------------|------|
| Corporeal Beast                | 11.96 | Tempoross                      | 3.97 |
| Nightmare                      | 11.95 | Chambers of Xeric              | 4.19 |
| Kree'Arra                      |  9.19 | King Black Dragon              | 4.30 |
| General Graardor               |  9.06 | Hespori                        | 4.41 |
| K'ril Tsutsaroth               |  9.03 | Alchemical Hydra               | 4.48 |

Interpretation: Corp and Nightmare are "trophy-grind" bosses with
ridiculously-rare uniques (elysian sigil 1/4095, inquisitor 1/600 per role).
Their fat tail is real — a tiny sliver of players keep going well past the
point where 99% have quit. Tempoross and minigames are tight because the
reward curve itself is bounded (weekly pet progress, capped points).

## Typical player commitment ceiling per intensity tier

Using p99_kc as "what the top 1% of dedicated players reach":

- **Low-account tier** — equivalent to a casual Scape bot with 4-12 hr/week
  budget. Commitment ceiling for any single boss ~p10 (25,000th rank) =
  typically **150-1000 KC**. After that they move on.

- **Medium-account tier** — 20-30 hr/week budget. Commitment ceiling ~median
  = **700-7600 KC** depending on boss efficiency. This is where most OSRS
  iron-man accounts sit.

- **High-account tier** — 40-60 hr/week budget. Commitment ceiling ~p90 =
  **800-17000 KC**. These are the "completionist" accounts.

- **Unlimited-account tier** — infinite commitment, used as mathematical
  control. p99 ceiling = **1800-55000 KC**.

The sim's four archetypes (low / medium / high / unlimited) map naturally
onto these tiers. Wiring each archetype with a per-boss burn-out multiplier
(see sub-task D) makes the sim's commitment model match real OSRS grinding
behaviour instead of the current "grind forever until average luck" fiction.

## Implications for Scape v1.0 rebalance

Any Scape drop whose expected-kills (= 1/drop_rate) exceeds the p99_kc for
its OSRS equivalent is effectively unobtainable. The rebalance rule is:

    new_rate = min(current_rate, 1 / p99_kc_of_equivalent)

Cross-referencing `data/collection-log.json` drop rates against these p99
thresholds will identify unachievable entries and cap them. See sub-task C.

## Data caveats

- `rank_100000` for bosses with ladder cutoffs below 100,000 (Phosani's
  Nightmare, Nightmare, Theatre of Blood, Hespori) is monotone-filtered out
  because the hiscore page returns an unrelated row when the requested rank
  exceeds the ranked-player count.
- Hiscores include **bots and unranked transfers**. Rank 1 on Vorkath (181k
  KC) is almost certainly a bot farm. That's why we use p99 (rank 50), not
  p99.9 (rank 1), as the burn-out threshold.
- The scrape is a single point-in-time snapshot (2026-04-22). If re-run, KC
  values will grow but percentile ratios should be stable.
