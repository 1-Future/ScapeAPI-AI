# Collection Log Coverage Audit

**Date:** 2026-04-22
**Target:** OSRS parity — 1,500+ entries across 6 top-level categories
**Reference:** https://oldschool.runescape.wiki/w/Collection_log

## 1. Summary

Scape's collection log has **two parallel catalogues** that do not agree. This is the first finding.

| Catalogue                                          | Sections | Items | Notes |
|----------------------------------------------------|---------:|------:|-------|
| `data/collection-log.json` (authoritative runtime) | 51       | 209   | Loaded by `src/engine/collection-log.js` |
| `src/content/aelgard/pets-collection.js`           | 33       | 143   | Built in-process via `defineLogSection()` — never handed to the engine |

The engine only reads the JSON file; the second map is orphan data. Both must be reconciled before expansion, otherwise the existing UI disagrees with itself.

**Current vs OSRS target** (using the JSON catalogue):

| Category        | Scape now | OSRS target | Gap    |
|-----------------|----------:|------------:|-------:|
| Bosses          | 209 items / 36 sources (including wilds + slayer rolled in) | ~850 | -641 |
| Raids           | 11 items / 4 sources (Choir, GWD-mega, Fight Caves, Inferno) | ~150 | -139 |
| Clues           | 24 items / 5 tiers (Beginner–Master) | ~400 | -376 |
| Minigames       | 22 items / 5 minigames | ~140 | -118 |
| Skilling        | 11 pets / 1 source | ~60  | -49 |
| Other           | 0 | ~50 | -50 |
| **TOTAL**       | **209 / 51** | **~1,500 / 170** | **-1,291** |

Scape is at **14% of the OSRS entry-count target** and **30% of its section-count target**.

## 2. Per-boss entry contribution

`data/bosses.json` defines 15 boss bibles with 40 total uniques (avg 2.7 uniques/boss). `data/drop-tables.json` defines 36 monster drop tables with 25 `collection_log_unique` entries (avg 0.7/table). `data/bestiary/*.json` adds 120 tagged monsters of which ~10 are bosses with *zero* `loot_uniqueness` structure in the JSON — the uniques live elsewhere (code-side in `monsters-mega.js`).

The "87 bosses" and "15 raid bosses" from project notes do NOT all appear in the collection log. Only **36 of the ~87 audited bosses (41%)** have a `collection-log.json` source entry. The rest are effectively invisible to completionists.

**Top-heavy sections** (items per source):
- Barrows: 24 items (highest)
- The Nightmare: 9
- Pest Control: 7
- Kree'arra / Dagannoth Kings: 6 each
- Most bosses: 2-4 items

**Average items per boss source:** 3.5 — OSRS averages 4-6 per boss. Shortfall of ~2 items per boss × 50 missing bosses = ~100 entries lost.

## 3. Clue-tier coverage

| Tier       | Scape | OSRS | Gap |
|-----------|------:|-----:|----:|
| Beginner  | 1 | ~18  | -17 |
| Easy      | 0 | ~45  | -45 |
| Medium    | 3 | ~70  | -67 |
| Hard      | 5 | ~100 | -95 |
| Elite     | 5 | ~85  | -80 |
| Master    | 10 | ~85 | -75 |

**Total clue entries: 24 vs ~403 OSRS target. -379 entries.**
Easy tier is entirely missing. God-pages, trimmed ornaments, full gilded sets, 3rd-age weapons beyond platebody, heraldic armours, cosmetic overrides — none tracked.

## 4. Minigame gaps

`data/minigame-rewards.json` lists 10 minigames with 55 tracked slots, but only **5 minigames** (22 slots) propagate into `collection-log.json`. Five minigames are orphaned from the log:
- sootworks_forge (0 slots — by design)
- marchlands (7 slots)
- ramparts (6 slots)
- deadhold (8 slots)
- the_ascendancy (12 slots)

Quick win: +33 entries from wiring existing reward tables into the log.

## 5. Total-hours-to-average-completion

Drop-rate-based computation:

- **Boss pets (catalogue):** 53 pets in-log, avg 1/3,500 rate × ~30 kills/hr = ~116 hr each. Total: **~6,150 hr**.
- **Non-pet boss uniques (catalogue):** 156 items, weighted rate ~1/150 avg × 30 kills/hr = ~5 hr each. Total: **~780 hr**.
- **Drop-tables uniques (25 entries):** sum of 21,056 kills at 30 kills/hr = **~700 hr**.
- **Boss-bible uniques (40 entries):** sum of 49,179 kills at 20 kills/hr = **~2,460 hr**.
- **Skilling pets (11):** ~830 hr each = **~9,130 hr**.
- **Clue uniques (24):** avg 1/250 casket at 15 caskets/hr = **~400 hr total**.
- **Minigame uniques (22):** mostly shop-purchase (points-gated) — **~150 hr total**.

**Current avg-luck completion: ~19,770 hours** for the 209 entries that exist.
**Per-entry rate: ~95 hr/entry.**

Extrapolated to OSRS's 1,500 entries at the same mean rate: **~142,500 hr** — far above the 8,760 hr (1-year 24/7) target and well past the project's 100,000-hour aspiration.

**Diagnosis:** the current catalogue is *too rare on average*. Cutting skilling-pet rates by 4x and boss-pet rates by 2x (matching OSRS's modern drop-boost era) brings the 209-entry sum down to ~6,000 hr — more appropriate for partial completion. Any future entry additions must cap at ~5 hr avg or the grand total blows past realistic play.

## 6. Priority expansion plan — first 200 entries

Ordered by design cost × completeness payoff:

| Batch | Count | Entries to add | Blocker |
|-------|------:|----------------|---------|
| 1. Reconcile parallel catalogues | 0 | Merge `pets-collection.js` defs into `collection-log.json` | Drop dead code |
| 2. Wire orphan minigames | +33 | Marchlands, Ramparts, Deadhold, The Ascendancy | Already in `minigame-rewards.json` |
| 3. Remaining 51 audited bosses | +153 | Avg 3 uniques × 51 bosses from `bosses-expanded.js`, `monsters-mega.js`, `raids-mega*.js` | Extract from code, port to JSON |
| 4. Easy clue tier | +45 | Full easy-tier loot table | Port from `clue-scrolls-expanded.js` |
| 5. Raid trash drops (Choir, GWD) | +25 | Expand 2 raids from 4 → ~15 items each | Design |
| 6. Skilling uniques (non-pet) | +20 | Heron-analog charms, rare gems, quest-skill rewards | Content design |

Total for batches 1-6: **+276 entries** → 485 total (still only 32% of 1,500). Batches 7-10 need to port the remaining bosses, full clue tables, and add the "Other" category (holiday events, leagues rewards, miscellaneous).

**Critical path for bot-account completion:** Barrows (24) + God Wars (11) + Master Clues (10) + Nightmare (9) represent 54 items — 26% of the current log — and are all already designed. An RL agent can realistically chase those four sources first. Wilds pet grinds at 1/2000-1/3000 are the terminal long-tail: the bot spends 80% of its time there.

## Key findings

1. **Two catalogues disagree.** `pets-collection.js` (143 items) is orphan; reconcile before anything else.
2. **Only 41% of audited bosses are in the log.** 51 bosses missing. Largest single gap.
3. **Easy clues entirely absent.** 45 missing entries for free.
4. **Five designed minigames orphaned** from the log (33 entries).
5. **Average drop rarity too high.** 95 hr/entry → 142k hr at 1,500 entries. Rebalance pets 2-4x more common before scaling, OR accept that full completion is a 16-year commitment.
6. **"Other" category empty.** OSRS has holiday events, league rewards, leagues-era cosmetics — Scape has 0.
