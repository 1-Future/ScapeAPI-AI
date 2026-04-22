# Scape Moneymaking Audit vs OSRS

**Date:** 2026-04-22
**Scope:** 2,242 unique activities (2,117 catalog + 525 methods, deduped) vs OSRS Money Making Guide tiers.
**Source files audited:**
- `data/intensity-catalog.json`
- `data/methods/*.json` (23 skill packs)
- `data/drop-tables.json` (36 tables; used for boss gp validation)

---

## 1. Summary: gp/hr tier histogram vs OSRS targets

| Tier | OSRS archetype | Scape count | Verdict |
|---|---|---:|---|
| 0 (no gp) | training/combat-only | 520 | baseline; many skills have no gp by design |
| 1-50k | birdhouse, shrimp, early mining | 674 | **heavily over-indexed** (incl. 401 placeholder 1-999 gp entries, see §6) |
| 50-100k | iron mining, fly fishing, cannonballs | 130 | thin |
| 100-250k | herb runs, low slayer, chinning | 513 | healthy |
| 250-500k | mid bossing, blood runes | 189 | adequate |
| 500k-1M | Vorkath, zulrah on-task, GWD | **21** | **severe gap** |
| 1-2M | solo CoX, Muspah, GWD scaling | **17** | **severe gap** |
| 2-5M | ToB duo, ToA HM solo | **17** | **severe gap** |
| 5M+ | elite raid scaling, PK flipping | 161 | all boss combat, almost no non-combat |

Endgame combat is well covered (161 methods at 5M+, 147 bosses), but **the 500k-5M "mid-elite" band has only 55 methods total**, compared to OSRS where that band holds dozens of staples (Zulrah, Vorkath, Muspah, wildy bosses, Skotizo, DKs, Corrupted Gauntlet, etc). OSRS-parity requires roughly 3-4x more content in this range.

One data error: `crafting_craft_zenyte_amulet` lists **3.75 billion gp/hr** (likely a `*1000` overflow); flag for correction.

---

## 2. Intensity × gp-tier heatmap

| INT | 0 | 1-50k | 50-100k | 100-250k | 250-500k | 500k-1M | 1-2M | 2-5M | 5M+ |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 108 | 157 | 27 | 42 | 16 | 3 | 2 | 3 | 4 |
| 2 | 106 | 119 | 42 | 38 | 9 | 1 | 1 | 0 | 2 |
| 3 | 19 | 49 | 25 | 73 | 5 | 0 | 0 | 0 | 0 |
| 4 | 127 | 137 | 13 | 154 | 18 | 4 | 5 | 1 | 5 |
| 5 | 34 | 77 | 15 | 99 | 21 | 2 | 0 | 0 | 0 |
| 6 | 56 | 27 | 2 | 29 | 25 | 4 | 3 | 3 | 1 |
| 7 | 13 | 37 | 2 | 51 | 73 | 1 | 0 | 0 | 82 |
| 8 | 47 | 28 | 1 | 8 | 5 | 4 | 0 | 0 | 7 |
| 9 | 10 | 36 | 3 | 19 | 15 | 2 | 6 | 7 | 57 |
| 10 | 0 | 7 | 0 | 0 | 2 | 0 | 0 | 3 | 3 |

**Hot cells (healthy):** int4/100-250k (154), int7/5M+ (82 bosses), int9/5M+ (57).
**Dead cells (zero or near-zero):**
- Int3 / 500k+ = **0 methods** across all five upper tiers (attentive skilling ceiling is 500k gp/hr).
- Int5 / 1M+ = **0** (active combat ceiling is 1M).
- Int6 / 5M+ = 1; Int8 / 1-5M = 0.
- Int10 has only 10 entries total — endgame raid-effort tier is thin everywhere except 2-5M (3) and 5M+ (3).

Endgame gp is a cliff: below int7 you can never earn more than ~2M/hr.

---

## 3. Per-region tier coverage

| Region | 0 | 1-50k | 50-100k | 100-250k | 250-500k | 500k-1M | 1-2M | 2-5M | 5M+ |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| heartlands | 162 | 186 | 30 | 53 | 12 | 2 | **0** | **0** | 7 |
| sootworks | 42 | 84 | 8 | 47 | 21 | **0** | **0** | 2 | 12 |
| moryskah | 51 | 86 | 18 | 61 | 20 | 2 | 2 | 2 | 35 |
| boneyard | 9 | 15 | 6 | 34 | 9 | 1 | **0** | **0** | 5 |
| glass_desert | 24 | 40 | 7 | 42 | 15 | 1 | 1 | 5 | 20 |
| saltbrine | 25 | 17 | 20 | 53 | 9 | 1 | **0** | **0** | 8 |
| veilwood | 46 | 47 | 12 | 77 | 25 | 1 | 5 | 2 | 8 |
| inkweald | 34 | 41 | 9 | 50 | 26 | 6 | 1 | 2 | 19 |
| wilds | 22 | **0** | 3 | 32 | 25 | 6 | 8 | 4 | 14 |
| unknown | 105 | 158 | 17 | 64 | 27 | 1 | **0** | **0** | 33 |

**Findings:**
- **Heartlands (starter region) has zero 1-5M methods.** OSRS starter regions (Lumbridge/Varrock) have several (herb runs, GE flipping). Scape starter players hit a gp ceiling of ~500k.
- **Saltbrine, Boneyard, Sootworks** all have 0 methods in 1-2M and 2-5M bands — mid-tier regions skip straight from 500k to 5M+.
- **Wilds has zero 1-50k activities**, which makes sense (high-risk only) but PK loot tiers are thin (8 methods above 500k).
- **Moryskah is the model region**: every tier covered.

---

## 4. Gap hit-list (zero-method cells, region × intensity × tier)

Out of 900 possible cells (9 regions × 10 intensities × 10 tiers), **495 are empty**. Focusing on cells that *should* exist (tier >= 100k): **398 meaningful gaps**.

Top offenders (9-10 out of 10 intensities empty for that region+tier):

| Region | Tier | Missing intensities |
|---|---|---|
| heartlands | 1-2M | all 10 |
| heartlands | 2-5M | all 10 |
| saltbrine | 1-2M | all 10 |
| saltbrine | 2-5M | all 10 |
| sootworks | 1-2M | all 10 |
| sootworks | 500k-1M | all 10 |
| boneyard | 1-2M | all 10 |
| boneyard | 2-5M | all 10 |
| saltbrine | 500k-1M | 9/10 |
| heartlands | 500k-1M | 9/10 |
| veilwood | 500k-1M | 9/10 |
| glass_desert | 1-2M | 9/10 |
| glass_desert | 500k-1M | 9/10 |

Every region except Moryskah, Inkweald, and Wilds is missing the entire 500k-2M "mid-boss/high-skill" band. This is the band casual players spend most of mid-game in.

---

## 5. 30 new moneymaker concepts to fill gaps

Numbered by (region, tier, intensity). Expected gp/hr in parens.

**Heartlands 500k-2M (currently 0-2 methods):**
1. Chelser caravan escort — int4, 700k — moryskah-bound guard task with attackers.
2. Lumbrick rooftop chain — int5, 450k — timed agility loot chain.
3. Heartlands herb patch consortium — int3, 900k — simultaneous ranarr/toadflax multi-patch.
4. Brigand Mounts slayer rotation — int7, 1.3M — mid-tier combat slayer.

**Saltbrine 500k-2M (currently 0 across 500k-1M, 1-2M, 2-5M):**
5. Drifting Market silk flip — int2, 600k — mercantile AFK.
6. Tidecaller reef dive — int6, 1.1M — 3-tick fishing + swim dodge.
7. Coral Reaver bounty — int7, 1.6M — swimming combat boss.
8. Saltbrine Kraken tentacle loop — int6, 2.4M — OSRS Kraken analog.

**Sootworks 500k-2M (all 10 intensities empty at 500k-1M):**
9. Engine crawl salvage — int2, 550k — AFK scrap collection.
10. Furnace stoker shifts — int4, 900k — stoke → bar output → sell.
11. Pipeworks rune golem — int6, 1.4M — cannon-able elemental in pipes.
12. Gearcore shard smith — int5, 750k — high-level smithing producing bars w/ value.

**Boneyard 500k-5M (0-1 methods everywhere):**
13. Cryptstalker relic run — int3, 680k — lootable obelisks (AFK agility+thieving).
14. Tomb Marauder ironman task — int6, 1.8M — mid-level wilderness-lite boss.
15. Bone Pyramid desecrator — int7, 2.6M — rotation boss with ensouled drops.

**Glass Desert 500k-2M (1 method at 500k-1M, 1 at 1-2M):**
16. Mirage caravan escort — int4, 950k — timed NPC escort.
17. Sunken Spire glass cutter — int1, 800k — AFK gem cutting with loss risk.
18. Sandwraith summoner — int7, 1.7M — mid-tier magic boss.

**Veilwood 500k-2M:**
19. Dreamroot harvest — int2, 500k — farming uplift (OSRS herb-run analog).
20. Elfwood hunter-trapper — int4, 700k — rare pelt collection.
21. Silvermoon chanter — int6, 1.5M — magic boss with runes drop.

**Inkweald 2-5M / int1-6:**
22. Ink-dyed rune batch — int2, 2.2M — runecrafting with reagent pairs.
23. Dreameater lair — int6, 3.4M — solo midgame boss.

**Moryskah 2-5M / int4-6:**
24. Necropolis toll run — int4, 2.7M — thieving circuit.
25. Vampire lord duel — int6, 4.2M — solo midgame vampire boss.

**Wilds 500k-1M / int1-2-3:**
26. Chaos shrine prayer salvage — int2, 650k — AFK with random attackers.
27. Revenant shard flip — int3, 880k — PvM lite with GE cycle.

**Intensity-3 500k+ (entire intensity band has zero methods above 500k):**
28. Mercantile route (multi-region) — int3, 750k — trade goods between 3 cities.
29. Fishing monkfish rotation — int3, 550k — attentive but not tick-perfect.

**Intensity-5 1M+ (entire band empty above 500k):**
30. Active chinchompa range task — int5, 1.3M — covers chinning gap for mid-accounts.

---

## 6. Misery vs Degenerate cross-check

**Degenerate (int ≤ 2, gp ≥ 1M) — 12 activities.** AFK moneymakers that are too rewarding relative to effort. Full list:

| Activity | int | gp/hr | Region | Skill |
|---|---:|---:|---|---|
| crafting_craft_zenyte_amulet | 4 | **3.75B** | inkweald | crafting | (**data error — overflow**) |
| herblore_clean_ranarr | 1 | 45M | inkweald | herblore |
| crafting_cut_dragonstone | 1 | 24M | glass_desert | crafting |
| herblore_mix_prayer_potion | 1 | 21M | moryskah | herblore |
| farming_plant_torstol_seed | 2 | 16M | inkweald | farming |
| farming_plant_ranarr_seed | 2 | 14M | heartlands | farming |
| crafting_cut_diamond | 1 | 7.6M | glass_desert | crafting |
| crafting_cut_ruby | 1 | 4.2M | glass_desert | crafting |
| fletching_string_magic_longbow | 1 | 3M | veilwood | fletching |
| crafting_cut_emerald | 1 | 2.8M | glass_desert | crafting |
| crafting_cut_sapphire | 1 | 1.9M | glass_desert | crafting |
| smithing_smelt_adamantite_bar | 2 | 1.6M | moryskah | smithing |
| fletching_string_yew_longbow | 1 | 1.6M | veilwood | fletching |

In OSRS these are processing methods that *burn* gp rather than generate it (alching profit comes from buyers of the finished good). Scape's catalog appears to be double-counting the sale price as profit. Recommend re-deriving gp/hr from (item_value × rate) minus reagent costs.

**Misery (int ≥ 7, gp < 50k) — 108 activities.** Training methods with brutal effort for trivial loot. Sample (top offenders from §2 extract):

| Activity | int | gp/hr | xp/hr | Region |
|---|---:|---:|---:|---|
| trainmethod_strength_wilderness_bosses | 10 | 1 | 60k | wilds |
| trainmethod_wilds_boss_hunting | 10 | 3 | 85k | wilds |
| trainmethod_wilds_callisto_defence | 10 | 4 | 115k | wilds |
| trainmethod_wilds_venenatis_hp | 10 | 3 | 24k | wilds |
| trainmethod_wilds_revenants_range_aoe | 10 | 3.4k | 215k | wilds |
| trainmethod_moryskah_vampire_noble_elite | 10 | 30 | 95k | moryskah |
| trainmethod_inkweald_dream_stalker_combat | 9 | 120 | 185k | inkweald |

**Root cause:** 401 activities have gp values between 1 and 999 — these look like placeholder/stub values, not real calibrated drops. Most training-method entries were seeded with symbolic gp (1, 3, 4, 8…) rather than actual drop-table math. For OSRS parity, an intensity-10 wilderness boss should earn **at minimum** 2M/hr — Callisto in OSRS is ~3M/hr, and the risk premium is load-bearing.

**Data-quality fix needed:** join intensity-catalog against drop-tables.json so every combat activity inherits a real gp/hr from its drop table rather than stub values.

---

## 7. Key takeaways

1. **Mid-game (500k-5M) is empty** in 6 of 9 regions. This is where OSRS players spend 100+ hours (Vorkath, Zulrah, Muspah, Sarachnis, Skotizo, GWD, CoX solo). Scape has 55 methods total across 500k-5M vs OSRS's ~50+ staple methods.
2. **Starter region Heartlands caps at ~500k/hr** — this contradicts Marstead pillar 3 (keep old content alive via endgame reagents).
3. **Endgame is all combat.** 161 of 173 methods at 5M+ are kill_* entries. OSRS has non-combat elite moneymakers (rune running, GE flipping, high-level processing). Scape needs 5-10 non-combat 5M+ methods.
4. **Data integrity:** 401 stub-gp entries (1-999 gp/hr), 1 overflow entry (3.75B), and all int-1 processing methods appear to count sale price as profit — re-derive from drop-tables + reagent deltas.

---

*Report generated by audit script at `C:/tmp/scape-audit/audit.js`. Raw data JSON at `C:/tmp/scape-audit/audit-data.json`.*
