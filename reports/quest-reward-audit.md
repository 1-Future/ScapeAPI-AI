# Scape Quest Reward Audit

**Generated:** 2026-04-22 (burn-wave0 / gap-audit)
**Source:** 23 quest-bearing files under `src/content/aelgard/`
**Method:** Brace-matched AST-ish parse of every `quests.define(...)` block; reward field presence + magnitude check.

## 1. Summary

| Category | Count | % of 220 |
|---|---|---|
| **populated** | 0 | 0.0% |
| **partial** | 216 | 98.2% |
| **stub** | 4 | 1.8% |
| **missing** | 0 | 0.0% |
| **TOTAL** | 220 | 100.0% |

Every one of the 220 quests carries at minimum a `questPoints` field and most carry `xp`, so nothing is fully *missing*. But zero quests meet the full 5-field schema (`qp` + `xp` + `items` + `unlocks` + `chain_next`). The canonical schema calls for explicit `unlocks` and `chain_next` arrays/values, and those are absent almost everywhere.

### 1a. What is each "partial" quest missing?

| Missing field | Partial quests affected |
|---|---|
| qp = 0 (no questPoints anywhere) | 2 |
| No xp block at all | 0 |
| xp total < 1000 | 14 |
| No items key | 18 |
| items: [] | 0 |
| No unlocks key | 216 |
| unlocks: [] | 0 |
| No chain_next key | 216 |

### 1b. XP magnitudes actually observed, by tier

| Tier | Quests with XP | Min | Median | Avg | Max |
|---|---|---|---|---|---|
| Novice | 21 | 400 | 550 | 1,555 | 5,000 |
| Intermediate | 46 | 500 | 4,600 | 6,320 | 18,200 |
| Experienced | 67 | 4,300 | 12,000 | 17,703 | 49,000 |
| Master | 46 | 9,000 | 25,500 | 36,924 | 157,000 |
| Grandmaster | 37 | 10,000 | 79,000 | 130,243 | 445,000 |
| Unknown | 0 | — | — | — | — |

## 2. Per-file breakdown

| File | Quests | Populated | Partial | Stub | Missing | Total XP | Total QP | w/o unlocks | w/o chain_next | w/o items |
|---|---|---|---|---|---|---|---|---|---|---|
| `active-gathering.js` | 2 | 0 | 2 | 0 | 0 | 8,000 | 4 | 2 | 2 | 0 |
| `boneyard-wastes.js` | 2 | 0 | 2 | 0 | 0 | 8,000 | 4 | 2 | 2 | 0 |
| `glass-desert.js` | 4 | 0 | 4 | 0 | 0 | 100,000 | 14 | 4 | 4 | 0 |
| `heartlands.js` | 3 | 0 | 3 | 0 | 0 | 3,100 | 4 | 3 | 3 | 0 |
| `inkweald.js` | 2 | 0 | 2 | 0 | 0 | 37,000 | 7 | 2 | 2 | 0 |
| `moryskah.js` | 2 | 0 | 2 | 0 | 0 | 12,300 | 5 | 2 | 2 | 0 |
| `quests-blitz.js` | 30 | 0 | 30 | 0 | 0 | 464,300 | 103 | 30 | 30 | 0 |
| `quests-burn-wave3-part2.js` | 7 | 0 | 7 | 0 | 0 | 441,500 | 22 | 7 | 7 | 0 |
| `quests-burn-wave3-part3.js` | 6 | 0 | 6 | 0 | 0 | 471,200 | 20 | 6 | 6 | 0 |
| `quests-burn-wave3.js` | 7 | 0 | 7 | 0 | 0 | 150,600 | 16 | 7 | 7 | 0 |
| `quests-expanded.js` | 10 | 0 | 9 | 1 | 0 | 130,700 | 24 | 10 | 10 | 0 |
| `quests-mega.js` | 50 | 0 | 50 | 0 | 0 | 915,650 | 133 | 50 | 50 | 0 |
| `quests-series-extensions.js` | 32 | 0 | 32 | 0 | 0 | 1,806,000 | 111 | 32 | 32 | 0 |
| `quests-series.js` | 17 | 0 | 14 | 3 | 0 | 142,500 | 26 | 17 | 17 | 7 |
| `quests-v0.8-chain-1.js` | 6 | 0 | 6 | 0 | 0 | 512,400 | 18 | 6 | 6 | 0 |
| `quests-v0.8-chain-2.js` | 6 | 0 | 6 | 0 | 0 | 678,400 | 18 | 6 | 6 | 0 |
| `quests-v0.8-chain-3.js` | 6 | 0 | 6 | 0 | 0 | 645,800 | 18 | 6 | 6 | 0 |
| `quests-v0.8-chain-4.js` | 6 | 0 | 6 | 0 | 0 | 601,000 | 18 | 6 | 6 | 0 |
| `quests-v0.8-chain-5.js` | 6 | 0 | 6 | 0 | 0 | 652,000 | 18 | 6 | 6 | 0 |
| `raid-prerequisites.js` | 11 | 0 | 11 | 0 | 0 | 205,500 | 32 | 11 | 11 | 11 |
| `saltbrine.js` | 2 | 0 | 2 | 0 | 0 | 13,000 | 5 | 2 | 2 | 0 |
| `sootworks.js` | 2 | 0 | 2 | 0 | 0 | 24,500 | 6 | 2 | 2 | 0 |
| `veilwood.js` | 1 | 0 | 1 | 0 | 0 | 3,500 | 2 | 1 | 1 | 0 |

## 3. Stub quests (rewards empty or not defined)

| Quest ID | File:line | Name | Difficulty | Notes |
|---|---|---|---|---|
| `the_werewolfs_dilemma` | `quests-expanded.js:156` | The Werewolf | Experienced | rewards present but empty |
| `barrows_brothers` | `quests-series.js:259` | The Barrows Brothers | Experienced | rewards present but empty |
| `fight_caves` | `quests-series.js:319` | The Fight Caves | Grandmaster | rewards present but empty |
| `infernal_challenge` | `quests-series.js:338` | The Infernal Challenge | Grandmaster | rewards present but empty |

## 4. Biggest outliers — structured quests with weak reward signal

These have populated steps, requirements and narrative but award either 0 XP _or_ no items, and have no machine-readable `unlocks`/`chain_next` — so a planner cannot compute expected value and will skip them.

| Quest ID | File:line | Name | Difficulty | QP | Items | XP | Notes |
|---|---|---|---|---|---|---|---|
| `rfd_start` | `quests-series.js:15` | Recipe for Disaster — Prologue | Intermediate | 1 | 0 | 500 | low XP + no items/unlocks/chain |
| `rfd_heartlands` | `quests-series.js:29` | Recipe for Disaster — The Captain | Intermediate | 1 | 0 | 2,300 | low XP + no items/unlocks/chain |
| `kings_crypt_key` | `raid-prerequisites.js:88` | The Restless Dead | Intermediate | 2 | 0 | 3,500 | low XP + no items/unlocks/chain |
| `rfd_moryskah` | `quests-series.js:44` | Recipe for Disaster — The Priest | Experienced | 1 | 0 | 4,300 | low XP + no items/unlocks/chain |
| `rfd_sootworks` | `quests-series.js:59` | Recipe for Disaster — The Engineer | Experienced | 1 | 0 | 6,300 | low XP + no items/unlocks/chain |
| `prism_labyrinth_key` | `raid-prerequisites.js:172` | Shattered Light | Experienced | 2 | 0 | 7,500 | low XP + no items/unlocks/chain |
| `sunken_temple_key` | `raid-prerequisites.js:138` | Depths of Despair | Experienced | 2 | 0 | 7,500 | low XP + no items/unlocks/chain |
| `crucible_key` | `raid-prerequisites.js:121` | The Forgemaster | Experienced | 2 | 0 | 8,500 | low XP + no items/unlocks/chain |

## 5. Quests with unlock refs pointing to non-existent DAG nodes

_No broken DAG references — either no quest uses literal `unlocks: [dag_id]` arrays, or all refs resolve._
_Note:_ the great majority of quests encode unlock intent only as trailing prose comments (e.g. `// Unlocks: Sootworks border mine shortcut`). Those are invisible to the planner. 0 / 220 quests use the schema-style `unlocks: ["dag_node_id", ...]` array.

## 6. Top 20 priority fixes

Quests the bot SHOULD be doing (low difficulty, early game, likely on the critical path) but whose reward signal is too weak for a planner to pick them up.

| # | Quest ID | Name | Tier | Issue | File |
|---|---|---|---|---|---|
| 1 | `barrows_brothers` | The Barrows Brothers | Experienced | STUB | `quests-series.js` |
| 2 | `the_werewolfs_dilemma` | The Werewolf | Experienced | STUB | `quests-expanded.js` |
| 3 | `fight_caves` | The Fight Caves | Grandmaster | STUB | `quests-series.js` |
| 4 | `infernal_challenge` | The Infernal Challenge | Grandmaster | STUB | `quests-series.js` |
| 5 | `heartlands_patrol` | The Heartlands Patrol | Novice | tiny XP (400) | `heartlands.js` |
| 6 | `lamplighters_apprentice` | Lamplighter | Novice | tiny XP (500) | `quests-mega.js` |
| 7 | `target_practice` | Target Practice | Novice | tiny XP (550) | `quests-mega.js` |
| 8 | `the_apprentice_trapper` | The Apprentice Trapper | Novice | tiny XP (550) | `quests-mega.js` |
| 9 | `the_bog_witchs_errand` | The Bog Witch | Novice | tiny XP (500) | `quests-mega.js` |
| 10 | `the_boneyard_compass` | The Boneyard Compass | Novice | tiny XP (600) | `quests-mega.js` |
| 11 | `the_fencepost_problem` | The Fencepost Problem | Novice | tiny XP (500) | `quests-mega.js` |
| 12 | `the_green_thumb` | The Green Thumb | Novice | tiny XP (900) | `quests-expanded.js` |
| 13 | `the_missing_miner` | The Missing Miner | Novice | tiny XP (400) | `heartlands.js` |
| 14 | `the_runaway_golem` | The Runaway Golem | Novice | tiny XP (500) | `quests-mega.js` |
| 15 | `the_slayers_first_mark` | The Slayer | Novice | tiny XP (550) | `quests-mega.js` |
| 16 | `the_stolen_runes` | The Stolen Runes | Novice | tiny XP (550) | `quests-mega.js` |
| 17 | `the_tide_pool_collector` | The Tide Pool Collector | Novice | tiny XP (450) | `quests-mega.js` |
| 18 | `kings_crypt_key` | The Restless Dead | Intermediate | raid-key quest with no item/unlock reward | `raid-prerequisites.js` |
| 19 | `rfd_start` | Recipe for Disaster — Prologue | Intermediate | tiny XP (500) | `quests-series.js` |
| 20 | `crucible_key` | The Forgemaster | Experienced | raid-key quest with no item/unlock reward | `raid-prerequisites.js` |

## 7. Suggested XP magnitudes per tier

Based on OSRS reference points (Hunter ~14k/quest avg, SotE 40k across 8 skills, big quests 40-75k) and observed Scape tier structure. These are **per-skill** figures; multiply by 1-3 skills for the total.

| Tier | Per-skill XP | Total XP (1-3 skills) | Rationale |
|---|---|---|---|
| **Novice** | 1,000 - 5,000 | 3k - 15k | introduces mechanic, gates a nearby resource |
| **Intermediate** | 5,000 - 15,000 | 15k - 45k | multi-region, opens a Diary tier |
| **Experienced** | 15,000 - 30,000 | 45k - 90k | boss-gated, opens major shortcut/store |
| **Master** | 30,000 - 50,000 | 90k - 150k | raid unlock, tier-jump access |
| **Grandmaster** | 40,000 - 75,000 | 120k - 225k | Song-of-Elves class, campaign finale |

### Calibration vs observed data

Observed Scape averages (from section 1b above) suggest current rewards are _inside_ the low end of these ranges for Novice/Intermediate and broadly on-target at Master/Grandmaster. The more urgent gap is **structural**, not numeric: no quest exposes `unlocks` or `chain_next` in machine-readable form, so a planner cannot traverse the quest DAG to compute expected value.

## 8. Recommendations

1. **Add `unlocks: [...]` arrays to every quest** whose trailing comment mentions an unlock (`Unlocks: X`). Automated sweep — the comment prose is consistent.
2. **Add `chain_next` to all multi-part chains** (e.g. `the_last_dragon_p1` → `the_last_dragon_p2` → `the_last_dragon_p3`, the v0.8 chains). 216/220 are missing this key.
3. **Fill `items: [item_id]` arrays** rather than just `[{id, name, count}]` prose objects — the planner needs item IDs to score inventory gain.
4. **Normalize `qp` / `questPoints`** to a single canonical name in rewards. Currently both appear; many quests only set top-level `questPoints`.
5. **Surface the DAG join**: the 0-XP outliers in section 4 (especially raid-prereq quests with only `questPoints` as reward) need explicit `unlocks: ["raid:coa"]`-style refs so planner sees raid access as the payoff.
