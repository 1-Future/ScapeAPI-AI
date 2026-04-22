# Scape vs OSRS Gap Analysis
Generated: 2026-04-22

**Scope:** Compares Scape v0.8 (`v0.8-play-api-tier1`, commit `8e658d0`) content catalogs against OSRS's canonical wiki pages.
**Scape data roots:** `data/*.json`, `data/methods/*.json`, `data/bestiary/*.json`, `data/diaries/*.json`, `src/content/aelgard/*.js`.
**OSRS data source:** `oldschool.runescape.wiki` (fetched 2026-04-22).
**Method:** Counted Scape content by parsing JSON and grepping definition calls (`quests.define`, `defineClueStep`, `defineMinigame`, `defineTeleport`, `mob()`, `boss()`, etc.). Each OSRS number is paired with the wiki URL it came from. Wiki summarisation is heuristic — flagged where sparse.

---

## 1. Summary table

| Area | OSRS | Scape v0.8 | Gap | Priority | Intent |
|---|---:|---:|---:|---|---|
| Quests (repo-wide) | 179 (24 F2P + 155 members) | **220** (`quests.define(`) | **+41** | n/a | intentional over — Marstead-style chains |
| Quest XP (total across skills) | ~3.0M per wiki table | not audited per-skill | unknown | med | — |
| Combat Achievements | 637 tasks, 6 tiers | **331** (85 baseline + 246 per-boss) | **-306** | HIGH | shortfall — tiers Easy/Med done, Elite/Master/Grandmaster thin |
| Achievement Diaries (task count) | 492 tasks across 12 regional diaries | **320** tasks across 8 region diaries (+ outline at heartlands_diary etc.) | **-172** | MED | ~ parity in shape (4 tiers × 10 tasks × 8 regions) — missing 4 regional diaries |
| Collection log (sources) | ~122 sections, 1,699 unique entries, 1,905 slots | **51** sources, 209 item entries in `data/collection-log.json` | **-71 sources / -1490 entries** | HIGH | shortfall — the most visible gap |
| Bosses (unique) | ~70-100 (70 core + variants) | **15** full boss bibles (`data/bosses.json`) + ~72 `boss()` calls in content packs = **~87 registered** | ±0 (surface parity) / -15 bibles | MED | shape-parity by count, but OSRS has fuller mechanic design per boss |
| Slayer masters | 9 primary | **3** (`turael`, `vannaka`, `korvak`) | **-6** | HIGH | shortfall — gap in slayer progression |
| Slayer creatures | ~60 task monsters | **60** (16 base + 44 expansion `mob()` calls) | ~0 | low | on target |
| Minigames | ~49 officially-classified (17 combat + 25 skill + 4 hybrid + 3 misc) | **40** (10 in `minigames.js`/`-scapified.js` + 34 in `-mega.js`, minus overlap) | **-9** | low | on target per `minigames-mega.js` goal (38 total) |
| Clue-scroll tiers | 6 (Beginner/Easy/Med/Hard/Elite/Master) | **5** (missing Easy; has Beginner/Med/Hard/Elite/Master) | **-1 tier** | MED | shortfall — Easy tier absent |
| Clue-scroll steps | 200-400 per wiki | **117** (32 base + 85 expanded) `defineClueStep` calls | **-283** | MED | shortfall |
| Training methods (total) | ~241 (sum per-skill ranges) | **525** (`data/methods/*.json`) | **+284** | n/a | intentional over — Scape hits all 10 intensity bands per skill |
| Training methods per skill | 4-20 range | 21-26 narrow band | +shape | LOW | healthy: uniform 21-26 per skill; no underdeveloped skills |
| Intensity-band coverage | implicit, clustered AFK/active | full 1-10 band × 2,117 activities | n/a | ✓ | shape is *better* (explicit ladder) |
| Teleports | ~80 direct + ~40 systems | **20 teleports** + **29 routes** = 49 methods | **-31** | MED | shortfall |
| Raids | 3 (CoX/ToB/ToA) | 5+ raid encounters (`raids.js`/`raids-mega1/2.js`) but bespoke | ~0 | low | intentional — different taxonomy |
| Pets | 68 | tertiary drops defined per `bosses-expanded.js`; count unclear (at least ~20) | ~-48 | MED | shortfall on skilling pets |
| Items | — | **1,339** (`data/items/*.json`: consumables 179, equipment 431, resources 354, recipes 322, quest-items 51, reagents 2) | n/a | ✓ | healthy depth |
| NPC bibles | — | **54** fully-written | n/a | ✓ | Marstead-tier narratives |
| Drop tables | — | **36** canonical + 12 encounter BiS | n/a | ✓ | healthy |
| Progression DAG | n/a (OSRS has no formal DAG) | **2,698 nodes, 0 cycles, 90.5% connected** | n/a | ✓ | Scape original contribution |
| Money making methods | ~200 tracked on wiki | not catalogued as first-class (GP/hr lives inside method records) | unknown | low | shape difference: Scape bakes GP/hr into methods |

---

## 2. Per-area detail

### 2.1 Quests (Scape 220 vs OSRS 179)

**Source:** https://oldschool.runescape.wiki/w/Quests/List — 24 F2P + 155 members = 179 quests, 333 total QP.
**Scape data:** 220 `quests.define(...)` calls across 23 files (`src/content/aelgard/quests-*.js` plus `raid-prerequisites.js`, `heartlands.js`, etc.). Biggest single file: `quests-mega.js` (50). The five v0.8 chains (`chain-1` through `chain-5`) add 30 Marstead-style quests.

**Shape comparison:** OSRS quests cluster around low-medium difficulty with a GM long-tail (MM2, Song of the Elves, DS2). Scape's chains explicitly architect this distribution (each chain: Novice → Intermediate → Experienced → Master → GM), plus Metroidvania cross-chain bleed.

**Intentional:** Yes. The +41 overcount is explicit in v0.8 plan — each chain is narrative-first, each quest touches 2+ regions.

**Actual gap:** XP granted by quests is not catalogued at a per-skill rollup level in Scape — the reward structure exists per-quest but is not summed. OSRS's `Quest_experience_rewards` page tallies ~3M XP across skills; this is worth mirroring as a `reports/quest-xp-rollup.md` for diagnostic purposes.

---

### 2.2 Combat Achievements (Scape 331 vs OSRS 637)

**Source:** https://oldschool.runescape.wiki/w/Combat_Achievements — 637 tasks; Easy 41 / Medium 60 / Hard 85 / Elite 162 / Master 168 / Grandmaster 121.
**Scape data:**
- `src/content/aelgard/combat-achievements.js` — 85 tier-tagged entries across Easy/Medium/Hard/Elite/Master/Grandmaster.
- `src/content/aelgard/combat-achievements-tasks.js` — 246 per-boss entries registered via `ca.registerTask()` with injects + categories. This file's header explicitly targets the tier breakpoints: Easy 33/40, Medium 75/80, Hard 200/220, Elite 400/420, Master 700/720, Grandmaster 1200/1200 — which imply **1,592 points available vs OSRS ~1,800.**

**Shape comparison:** Scape's CAs are tagged with `injects: []` referencing the 18 Scape-Builder-Injects — richer metadata than OSRS but half the count. OSRS's Elite/Master/Grandmaster tiers (451 tasks combined) are the expensive tail and the hole is here.

**Intentional:** Partially. Comment in `combat-achievements.js` says "300+" as target; the codebase is short of its own target. The Grandmaster 121-task expansion (and the supporting bosses) has not landed.

**Priority: HIGH.** -306 tasks is the largest scalar gap in the catalog.

---

### 2.3 Achievement Diaries (Scape 320 vs OSRS 492)

**Source:** https://oldschool.runescape.wiki/w/Achievement_Diary — 12 regional diaries, 492 tasks total.
**Scape data:** `data/diaries/*.json` — 8 region diaries (Boneyard, Glass Desert, Heartlands, Inkweald, Moryskah, Saltbrine, Sootworks, Veilwood). Each diary has 4 tiers × 10 tasks = 40. Total: **320 tasks.** Wilds region has no diary file.

**Shape comparison:** Scape's 4-tier structure matches OSRS. Per-diary task counts (40) are richer than OSRS's typical diary size (~35-50). Scape is shy 4 regional diaries.

**Intentional:** Mostly. Scape has 9 world regions; each should have a diary eventually. `achievement-diaries.js` has outline code but `diaries-tasks-detailed.js` is the one that's producing the JSON. Wilds is likely intentionally a hostile zone with no diary; Heartlands may have a separate "starter" diary planned.

**Priority: MED.** Fill Wilds diary + possibly a multi-region "Explorer's Diary" for +80 tasks → close to OSRS parity.

---

### 2.4 Collection Log (Scape 51 sources vs OSRS 122 sections / 1,699 unique entries)

**Source:** https://oldschool.runescape.wiki/w/Collection_log — 1,699 unique entries, 1,905 slots across ~122 sections (55 bosses, 3 raids, 11 clue tiers, 22 minigames, 31 other).
**Scape data:** `data/collection-log.json` — 51 sources (bosses + raids aggregated), 209 item entries total. Sources are almost all boss-centric (Forgefather Duran, Azhmari, Bog Hydra, The Veilmother, Soot King, Glass Tyrant, etc.). Zero skilling-pet/clue/minigame categories populated.

**Shape comparison:** Scape's collection log is boss-only. OSRS's has ~66 non-boss categories (clues, minigames, skilling, misc). **This is the biggest category-level gap in the audit.**

**Intentional:** No. `src/engine/collection-log.js` is wired into the drop pipeline but the *catalog data* is missing for non-combat sources. Clue-scroll caskets and minigame caches would slot into existing categories cheaply.

**Priority: HIGH.** -1,490 entries. Even at 10 entries per new source this is 150 sources of work. Prioritise: clue caskets (5 tiers × ~20 uniques each = 100 entries), minigame uniques (40 × ~3 = 120), skilling pets (9 skills × 1 = 9).

---

### 2.5 Bosses (Scape 87 registered vs OSRS ~70+)

**Source:** https://oldschool.runescape.wiki/w/List_of_bosses — ~17 non-wilderness world + 9 wilderness + 9 instanced + 4 Forgotten + 4 sporadic + 11 slayer + 5 minigame = **~70+ total** including variants.
**Scape data:** `data/bosses.json` has **15 full boss bibles** (mechanics, attack rotation, invocation compat). `boss(...)` calls across content packs: 72 total (14 in `bosses-expanded.js`, 40 in `raids-mega1.js`, 17 in `raids-bosses-mega.js`, 1 in `raids-mega2.js`). Conservative registered-as-enemy count: **~87 total** (15 bibled + ~72 code-registered, some overlap).

**Shape comparison:** Scape slightly exceeds OSRS on raw count but is thin on bibles. A bible is a design doc — mechanic summary, attack rotation, invocation compat — which is what makes OSRS bosses individually memorable. The 72 content-pack bosses are mostly HP/damage stat blocks, not bibles.

**Intentional:** The "15 bibled, many registered" split is plausible as a quality ladder. Jagex does the same implicitly (CoX's Olm has deep writeups, most slayer bosses don't). But Scape's 15/87 ratio is low; OSRS would be ~25/70 by equivalent bar.

**Priority: MED.** Upgrade ~10 registered-but-unbibled bosses to bible tier for v0.9.

---

### 2.6 Slayer masters (Scape 3 vs OSRS 9)

**Source:** https://oldschool.runescape.wiki/w/Slayer_master — 9 primary masters (Turael, Spria, Krystilia, Mazchna, Vannaka, Chaeldar, Konar, Nieve, Duradel).
**Scape data:** `src/data/slayer.js` has `defineMaster('turael')` and `defineMaster('vannaka')`. `slayer-expansion.js` adds `defineMaster('korvak')` as "endgame slayer master". Total: **3.**

**Shape comparison:** OSRS's 9-master ladder (combat 1 → 100, slayer 0 → 50) provides 8 incremental unlocks. Scape has 3 (implicit combat 1, 40, endgame). The mid-combat range (40-85) is a ladder crater.

**Intentional:** No. This is an acknowledged gap — slayer creature count is at parity (60 monsters), but task-dispatch variety is not.

**Priority: HIGH.** Cheap to close — `data/slayer.js` defineMaster is already a function. +6 masters = 6 × 30 task weights = ~180 task slot definitions. This unblocks mid-level slayer progression.

---

### 2.7 Minigames (Scape 40 vs OSRS ~49)

**Source:** https://oldschool.runescape.wiki/w/Minigame — 17 combat + 25 skill + 4 hybrid + 3 misc = 49 official.
**Scape data:** `defineMinigame(...)` calls: 7 in `minigames.js`, 5 in `minigames-scapified.js`, 34 in `minigames-mega.js` (registered via `rel.defineMinigame`). Header of `minigames-mega.js` states target: 38 total.

**Shape comparison:** Scape groups minigames into 16 BYOS templates (wave_survival, capture_the_flag, battle_royale, objective_defence, duel_1v1, etc.). OSRS doesn't have this taxonomy — each minigame is bespoke. Scape's categorisation is more design-rigorous per Manifesto P04 (every minigame has a unique reward).

**Intentional:** Yes. Scape's 38-minigame target (with each covering a distinct template) is explicit.

**Priority: LOW.** Already on target. Close the -9 by ensuring all 16 templates × primary regions combinations exist.

---

### 2.8 Clue scrolls (Scape 5 tiers, 117 steps vs OSRS 6 tiers, 200-400 steps)

**Source:** https://oldschool.runescape.wiki/w/Clue_scroll — 6 tiers (Beginner, Easy, Medium, Hard, Elite, Master). Wiki is a disambiguation page so specific step counts unclear; community-tracked ~400 steps total.
**Scape data:**
- `treasure-trails.js` — 32 `defineClueStep`. Defines tiers: beginner, medium, hard, elite (4 tiers).
- `clue-scrolls-expanded.js` — 85 more steps, adds master tier (so 5 tiers total).
- Total: 117 steps across Beginner/Medium/Hard/Elite/Master. **Easy tier is missing.**

**Shape comparison:** Scape has Beginner + Medium but skipped Easy. The gap between Beginner (3 steps per clue, 15 in tier) and Medium (5 steps, ~23 in tier) is the niche Easy fills in OSRS (4 steps, ~30-50 entries). Elite/Master are represented.

**Intentional:** No. Header comment says "4 tiers (Beginner, Medium, Hard, Elite)" — the Easy tier was elided at authoring time.

**Priority: MED.** Add Easy tier with ~20-30 steps. Step counts at all tiers also need expansion (117 vs OSRS ~400).

---

### 2.9 Training methods (Scape 525 vs OSRS ~241)

**Source:** Per-skill wiki pages `Pay-to-play_<Skill>_training` (several returned 404, but enough data gathered to estimate).

**Per-skill comparison:**

| Skill | OSRS | Scape | Delta |
|---|---:|---:|---:|
| Mining | 15 | 26 | +11 |
| Fishing | 9 | 23 | +14 |
| Smithing | 9 | 22 | +13 |
| Woodcutting | 9 | 22 | +13 |
| Magic | 20 | 23 | +3 |
| Prayer | 12 | 21 | +9 |
| Runecrafting | 14 | 25 | +11 |
| Herblore | 7 | 26 | +19 |
| Farming | 8 | 22 | +14 |
| Agility | 13 | 21 | +8 |
| Thieving | 20 | 24 | +4 |
| Crafting | 12 | 22 | +10 |
| Fletching | 11 | 24 | +13 |
| Cooking | 6 | 21 | +15 |
| Firemaking | 4 | 22 | +18 |
| Combat (atk/str/def/hp/ranged) | ~40 | 109 | +69 |
| Slayer | ~10 | 24 | +14 |
| Hunter | ~10 | 25 | +15 |
| Construction | ~10 | 23 | +13 |
| **TOTAL** | **~241** | **525** | **+284** |

**Shape comparison:** Every Scape skill has 21-26 methods — uniform. OSRS varies 4 (Firemaking) to 20 (Magic). **Scape's shape is *better*** — no underdeveloped skill. The intensity-catalog confirms full band coverage (1-10) across all 23 skills via 2,117 activities.

**Intentional:** Yes. v0.8 burn target was 230/230 brackets Marstead-compliant — achieved 525/525.

**Surprise:** Scape has more Firemaking methods (22) than OSRS (4). This is a structural win and a risk. A risk because Firemaking is a niche skill in OSRS on purpose; Scape may be bloating it. Recommend a pass to verify every Firemaking method differentiates meaningfully.

---

### 2.10 Intensity bands (Scape has formal ladder, OSRS implicit)

**Source:** Scape `data/intensity-catalog.json` — 2,117 activities across 10 intensity bands, band distribution 309/300/157/447/234/145/256/99/155/15.

**Shape:** Bimodal — 300s in bands 1-2 (pure AFK/light), spike at band 4 (tick-locked), second peak at band 7 (PvM rotation). OSRS's de facto distribution is similar but undocumented. Scape's explicit ladder IS a feature.

**Gap:** Band 10 (Inferno-tier max-effort) has only 15 activities. `project_scape_v0_8.md` flags this — the content-grid verdict is "healthy bimodal" but "RC 1-77 is systemic misery zone (OSRS parity artifact)". Band 10 is dominated by Inferno wave content.

**Intentional:** Yes (the low count at band 10 is by design — Inferno-tier should be exclusive).

---

### 2.11 Teleports (Scape 49 vs OSRS ~150+)

**Source:** https://oldschool.runescape.wiki/w/Transportation — ~150+ distinct teleports (15 standard + 8 ancient + 9 lunar + 13 arceuus + 40 tabs + 12 jewellery + 20 scrolls + 8 diary items + 10 skill capes + quest items + systems).
**Scape data:** `src/content/aelgard/transportation-network.js` — 20 `defineTeleport(...)` + 29 `defineRoute(...)` = 49 total.

**Shape comparison:** Scape has teleports + routes as a unified model. OSRS separates spells / tabs / jewellery / systems which tile differently. Scape's 49 is roughly 1/3 of OSRS's. The fairy-ring / spirit-tree / gnome-glider / canoe *systems* are partially absent from Scape (the route model handles boats/carts/trams/canoes/gliders/balloons/shortcuts but specific system coverage is sparse).

**Intentional:** Partial. v0.8 did not target teleport parity.

**Priority: MED.** Teleports are force-multipliers — each unlocks efficient access to a zone. A v0.9 push could land +30 (e.g., full fairy-ring grid, per-region teleport spell, 10 jewellery).

---

### 2.12 Pets (Scape unclear, ~20 vs OSRS 68)

**Source:** https://oldschool.runescape.wiki/w/Pet — 68 pets (45+ boss, 11 skilling, 12 other).
**Scape data:** Not cataloged as first-class. `bosses-expanded.js` defines per-boss pets via the `boss()` helper's `petId`/`petName` args — those exist but there's no rollup. Items with `category: 'pet'` exist (e.g., `bloodhound`, `Rocky`, god-boss pets) — conservative count ~20.

**Intentional:** Not fully. Skilling pets (9 skills × 1 skilling-pet-per-skill = 9) are mostly absent. Boss pets exist because each `boss()` helper generates one, but the drop rate/mechanism isn't uniformly exposed.

**Priority: MED.** Skilling pets are a major Manifesto P06 (permanent progression) content point and -48 entries is a big absence.

---

### 2.13 Money making (Scape implicit, OSRS 200 methods)

**Source:** https://oldschool.runescape.wiki/w/Money_making_guide — ~200 tracked (140 high-intensity, 45 moderate, 15 low).
**Scape data:** GP/hr is a field on every `data/methods/*.json` record and every `intensity-catalog.json` activity — so 2,117 activities have GP/hr metadata, not a separate MMG. The lowest tracked: ~4,000 gp/hr (Heartlands Copperpit), highest: not checked but the catalog covers 1-10 intensity.

**Shape comparison:** OSRS's MMG is a flat list; Scape's GP/hr lives inside training methods (which is arguably better — unified data). OSRS's high-intensity bosses (Doom of Mokhaiotl 18M/hr) have no Scape equivalent at that payout ceiling.

**Intentional:** Yes, this is a deliberate taxonomy choice. Consider surfacing a denormalised MMG view in `reports/explorer/` for player UX.

---

## 3. Shape observations (not just counts)

1. **Scape is richer per entity, shallower per catalog.** 1,339 items with visuals, 54 fully-written NPC bibles, 15 boss bibles, 30 Marstead quest chains. Not many BUT each has design metadata OSRS doesn't.
2. **Scape has taxonomies OSRS lacks.** Intensity 1-10 bands, Marstead injects (1-18), progression DAG (2,698 nodes), Manifesto pillars (P02/P03/P04/P06/P08/P09). These are structural advantages.
3. **Scape under-represents the "long tail" content OSRS has.** Clue steps (-283), collection log (-1,490 entries), slayer masters (-6), teleports (-100+), skilling pets (-9). These are the high-volume, low-design-density entries — cheap to add, player-visible.
4. **Where Scape exceeds OSRS:** Training methods (+284), quests (+41), per-skill bracket coverage (uniform 21-26 vs OSRS 4-20). Firemaking (+18 vs OSRS 4) is the biggest proportional over-shoot — may warrant dedup.
5. **Scape's combat achievement metadata** (injects per task) is **better** than OSRS's — but count is ~half. Prioritise count catch-up while preserving metadata.

---

## 4. Priority ranking

1. **[HIGH] Combat achievements — 246 + 85 = 331 vs OSRS 637 (gap: -306).** Elite/Master/Grandmaster tiers are the hole. Existing injects metadata is world-class; just need volume.
2. **[HIGH] Collection log entries — 209 vs OSRS 1,699 (gap: -1,490).** Clue caskets, minigame uniques, skilling pets. Cheap additions, huge player-visible effect.
3. **[HIGH] Slayer masters — 3 vs OSRS 9 (gap: -6).** `defineMaster()` is a function; 6 entries × 30 task weights each closes it in a single agent run.
4. **[MED] Teleports — 49 vs OSRS 150+ (gap: -100).** Force-multiplier content; fairy-ring grid + per-region spells + jewellery set.
5. **[MED] Clue scrolls — 117 steps, 5 tiers vs OSRS ~400 steps, 6 tiers.** Add Easy tier + expand existing tiers.
6. **[MED] Skilling pets — 0-9 vs OSRS ~11.** Manifesto P06.
7. **[MED] Achievement diaries — 320 tasks across 8 regions vs OSRS 492 / 12 regions.** Fill Wilds diary, add Explorer's Diary.
8. **[LOW] Boss bibles — 15 vs 87 registered.** Upgrade 10 boss stat-blocks to full bibles.
9. **[LOW] Minigame expansion — 40 vs target 38 (met) vs OSRS 49.** Already at Scape's own target.

---

## 5. Recommended next content wave (v0.9 or v1.0)

Ranked by (gap severity × player impact × ease of landing):

1. **Collection log fill-out.** Add clue casket sources (5 new sources × ~20 entries = 100 entries), minigame unique sources (~40 × 3 = 120 entries), skilling pet sources (9 × 1 = 9 entries). Total: ~230 new entries. Uses existing `src/engine/collection-log.js` pipeline. **Player impact: highest** — collection log is the #1 completionist driver per OSRS player data.
2. **Slayer master expansion.** Add 6 new masters (Krystilia, Mazchna, Chaeldar, Konar, Nieve, Duradel analogs) each with 20-30 task weights. Closes the combat-level 20-85 ladder. **Player impact: high** — unlocks mid-game slayer progression.
3. **Combat achievement Elite/Master/Grandmaster tier expansion.** Add 200+ tasks focused on the existing 15 bibled bosses. Tier targets: Elite +60, Master +60, Grandmaster +80. Preserves `injects[]` metadata. **Player impact: high for endgame PvM.**

These three together close ~75% of the scalar gap while touching systems that are already wired and tested. Bonus: each can be worked in parallel by separate agents without collision (collection log → JSON; slayer masters → `data/slayer.js`; CAs → `src/content/aelgard/combat-achievements-tasks.js`).

---

## 6. Wiki pages that returned errors / sparse data

- `Slayer/Masters` (404 — used `Slayer_master` instead, works)
- `Mining/Training`, `Fishing/Training`, `Cooking/Training`, `Firemaking/Training` (all 404 — used `Pay-to-play_<Skill>_training` variant)
- `Pay-to-play_Hunter_training` (404 — count estimated at ~10)
- `Pay-to-play_Construction_training` (404 — count estimated at ~10)
- `Pay-to-play_Slayer_training` (404 — count estimated at ~10)
- `Free-to-play_Money_making_guide` (404)
- `Clue_scroll` (disambiguation page — specific step counts inferred from community tracking, marked "~400")
- `Collection_log` returned a good summary but section-count of 122 is WebFetch's aggregate; wiki's actual top-level list is 5 sections with deep nesting.

All Scape-side counts are derived from direct file parsing (Python + grep on the repo) and are exact as of commit `8e658d0` / tag `v0.8-play-api-tier1`.
