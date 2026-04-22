# Misery Zone Categorization + Fix Plan

Generated 2026-04-22 against `data/intensity-catalog.json` (2,117 activities, 506 misery zones).

Misery = `xp/hr < 0.7 * family-band-median`. Families are `skilling_xp` and `combat`, medians computed per intensity band. Manifest-combat skill swing entries, raid-boss shards, minigames, and composite raid rooms are excluded before median computation (per `scripts/build-intensity-catalog.js` lines 1107-1185).

Pillar 1 of the Marstead bible holds that a misery zone (high attention + trivial difficulty + sub-median reward) is the worst possible state. A low-XP activity is only acceptable if it is (a) a canon OSRS drudge that players already accept, or (b) a truly AFK alternative that trades XP for attention cost. Every other misery zone must be fixed.

---

## 1. Summary: 506 misery zones by root cause

| Root cause | Count | Default fix | Intent |
|---|---|---|---|
| stub_data | 293 | BUFF | placeholder numbers from early burn (round 8k / 12k / 16k / 20k), never balanced |
| alternative_exists | 134 | REDUCE_INTENSITY | low-attention kill/skill alts mistagged at active tier; re-band them to AFK |
| OSRS_parity_artifact | 61 | DO_NOT_FIX | canon-slow methods (Turael slayer, sub-77 RC, shrimp, bronze, etc.) |
| genuine_design_flaw | 18 | BUFF | HP deficit on combat mobs (shared-xp scale never tuned) |

Fix distribution: **BUFF 311, REDUCE_INTENSITY 134, DO_NOT_FIX 61, CUT 0**. No entries warrant deletion — every misery activity corresponds to a real progression slot.

Band heat-map (misery count): b1=89, b2=69, b3=42, b4=102, b5=68, b6=33, b7=48, b8=21, b9=32, b10=2. The b4 bulge is driven by Active skilling methods (RC craft lines, pickpocket man, agility gnome) being measured against a 82.5k-median band they were never meant to hit.

---

## 2. RC 1-77 systemic misery

Runecrafting 1-77 is the single most concentrated misery pocket: 37 of 506 entries (7.3 percent) belong to `runecrafting`, and 22 of them sit in the 1-77 air-to-death band. This is partially intentional OSRS parity — pre-77 RC is canonically slow — but the current numbers are **too low even for parity** and there is **no high-attention alternative** beyond level 77 Abyss.

### Current vs recommended RC xp/hr

| Lvl | Rune | Region | `runecrafting_craft_*` xp/hr | Best alt method xp/hr | Recommendation |
|---|---|---|---|---|---|
|  1 | air    | heartlands    | 10,000 | GotR 15,000 / daeyalt 45,000 | DO_NOT_FIX craft line; **BUFF** GotR to 40k, **BUFF** abyss to 75k |
|  2 | mind   | heartlands    | 9,500 altar-afk | - | **BUFF** altar-afk to 23k (AFK tier) |
|  5 | mind   | heartlands    | 11,000 | - | DO_NOT_FIX craft; **ADD** pouch-rush alt @ 40k |
|  9 | water  | saltbrine     | 12,000 | altar-afk 11,500 / pouch-rush 33,600 | DO_NOT_FIX craft; **BUFF** pouch-rush to 45k |
| 14 | earth  | heartlands    | 13,000 | altar-afk 12,500 / tiara-rush 29,800 | **BUFF** tiara-rush to 48k |
| 20 | fire   | sootworks     | 14,000 | altar-afk 26,800 | DO_NOT_FIX craft; **BUFF** altar-afk to 38k |
| 27 | body   | heartlands    | 15,000 | altar-afk 17,400 | **BUFF** altar-afk to 30k; add Nightshade Abyss alt |
| 35 | cosmic | glass_desert  | 16,000 | altar-afk 23k / rush 46,900 | DO_NOT_FIX craft; **BUFF** rush to 62k |
| 44 | chaos  | wilds         | 17,000 | altar-afk 36,100 / wilds_abyss 85k | DO_NOT_FIX craft; already has Abyss alt — OK |
| 54 | nature | veilwood      | 18,000 | rush 83,700 | DO_NOT_FIX craft; Abyss covers it |
| 65 | law    | inkweald      | 19,000 | wilds_death_rune_altar 58,000 | DO_NOT_FIX craft; **BUFF** death-rune alt to 85k |
| 77 | death  | boneyard      | 20,000 | wilds_blood_rune_altar 62,000 | DO_NOT_FIX craft; **BUFF** blood-altar alt to 90k |
| 85 | blood  | moryskah      | 21,000 | - | **BUFF** craft to 40k (matches OSRS blood parity buff) |
| 95 | wrath  | wilds         | 22,000 | sun_rc 52,000 | **BUFF** wrath craft to 60k; **BUFF** sun_rc to 110k |

**Rule:** The canonical-slow `runecrafting_craft_*_runes` lines stay as OSRS-parity AFK reference methods (DO_NOT_FIX). The adjacent `altar-afk`, `altar-rush`, `pouch-rush`, `abyss`, and regional training-knob methods are the non-misery escape hatches, and all 25 of them are currently below their band medians. **Buff the alts, keep the crafts.** This turns RC from a single miserable gradient into the 8-knob design the bible asks for.

---

## 3. Per-skill misery breakdown

| Skill | Misery count | Notes |
|---|---|---|
| slayer | 116 | 84 are monster kills from `monsters-mega.js` under-xp'd for their tags; 21 skill methods (Turael/Konar task throughputs) |
| combat | 77 | Shared-xp family on under-scaled mobs |
| runecrafting | 37 | See section 2 |
| mining | 32 | Shooting star (4.2k), dense essence (3.6k), sandstone (9k), granite (15k); powermining misery |
| hitpoints | 27 | Passive leech xp under-scaled relative to combat median |
| fishing | 20 | Shrimp/sardine/herring canon + manta/karambwan/barb trout misclassed as Active when they are AFK |
| woodcutting | 18 | Normal/logwood (canon) + arctic pine, teak, mahogany active misery |
| smithing | 17 | Bronze/iron canon + silver (4.1k) / gold (6.7k) smelts miserable even by OSRS standards |
| defence / attack / strength | 16 / 15 / 10 | Spillover from under-xp'd mobs and Turael tasks |
| cooking / fletching / herblore / crafting | 14 / 13 / 13 / 12 | Band-1 Heartlands intro methods stubbed at 8k |
| firemaking | 11 | Normal/oak logs canon + bonfire center misreport |
| agility | 10 | Gnome course (parity) + courses 4-7 under-scaled |
| thieving | 9 | Man pickpocket (parity) + farmer (parity, -79%) — farmer is a *genuine* OSRS buff target |
| magic / ranged | 9 / 9 | Low-level bolt/safe-spot training |
| prayer | 8 | Bones-at-altar intro stubs |
| farming | 6 | Allotment/herb patch seeding stubbed |
| hunter | 4 | Butterfly/cormorant/pearl-diver/stag under-xp |
| construction | 3 | Carpenter apprentice + crude chair stubs |

Median-zero bands for runecrafting, smithing, construction, fletching, farming, thieving, hunter, herblore, crafting at band 9-10 flag **genuine content gaps** (those skills have no high-band entries) — not misery but worth calling out.

---

## 4. Per-region misery distribution

| Region | Misery count | Total activities | Over-representation |
|---|---|---|---|
| heartlands | 158 | 391 | 40 percent misery rate — worst. It's the starter region with the most stub methods. |
| wilds (+the_wilds) | 52 | 208 | 25 percent — training-knobs stubs |
| saltbrine (+reach) | 47 | 198 | 24 percent |
| moryskah | 47 | 274 | 17 percent — best-balanced region |
| unknown | 40 | 180 | 22 percent — region-unhinted core methods (`mining_mine_*`, `fishing_net_*`, `gather_*`) |
| sootworks | 39 | 215 | 18 percent |
| veilwood | 36 | 200 | 18 percent |
| glass_desert | 30 | 148 | 20 percent |
| inkweald | 29 | 174 | 17 percent |
| boneyard (+wastes) | 28 | 135 | 21 percent |

Heartlands is over-represented and needs a region-wide BUFF pass. The 40 `unknown` entries are mostly canon OSRS methods (gather/process/smelt generic IDs) whose region tag defaults to `unknown` because they are skill-plugin rather than content-pack registrations — this is a tagging gap in `build-intensity-catalog.js`, not a gameplay flaw. Tagging them to `heartlands` would push the starter region to ~200 misery entries.

---

## 5. Priority fix list (top 50)

Ranked by bot-blocking weight: `(100 - level) + activity_type_score + deficit + skill_centrality + fix_bonus`.

| # | Fix | Skill | Lvl | Band | Activity ID | xp/hr | Deficit | Root cause |
|---|---|---|---|---|---|---|---|---|
|  1 | BUFF | runecrafting | 1 | 2 | heartlands_air_altar_afk | 13,900 | -74% | stub_data |
|  2 | BUFF | runecrafting | 1 | 2 | trainmethod_runecrafting_guardians_of_rift | 15,000 | -72% | stub_data |
|  3 | BUFF | runecrafting | 2 | 1 | heartlands_mind_altar | 9,500 | -71% | stub_data |
|  4 | BUFF | runecrafting | 1 | 8 | trainmethod_runecrafting_wilds_abyss | 50,000 | -67% | stub_data |
|  5 | BUFF | mining | 1 | 1 | heartlands_copperpit_surface_tap | 8,000 | -76% | stub_data |
|  6 | BUFF | mining | 1 | 1 | trainmethod_mining_copper_tin | 8,000 | -76% | stub_data |
|  7 | BUFF | mining | 1 | 2 | heartlands_tinhook_vein | 13,900 | -74% | stub_data |
|  8 | BUFF | slayer | 1 | 2 | trainmethod_heartlands_slayer_turael | 16,000 | -70% | stub_data |
|  9 | BUFF | mining | 5 | 4 | heartlands_chelser_pick_rush | 24,300 | -71% | stub_data |
| 10 | BUFF | runecrafting | 9 | 1 | saltbrine_water_altar_afk | 11,500 | -65% | stub_data |
| 11 | BUFF | slayer | 1 | 9 | trainmethod_slayer_wilds_tasks | 30,000 | -62% | stub_data |
| 12 | BUFF | cooking | 1 | 1 | heartlands_range_meat_basic | 8,000 | -76% | stub_data |
| 13 | BUFF | firemaking | 1 | 1 | heartlands_log_burn_trail | 8,000 | -76% | stub_data |
| 14 | BUFF | runecrafting | 14 | 4 | heartlands_earth_altar_tiara_rush | 29,800 | -64% | stub_data |
| 15 | BUFF | mining | 20 | 2 | gather_silver_rock | 12,000 | -78% | stub_data |
| 16 | BUFF | firemaking | 1 | 2 | heartlands_bonfire_center | 13,900 | -74% | stub_data |
| 17 | BUFF | runecrafting | 14 | 1 | heartlands_earth_altar_afk | 12,500 | -62% | stub_data |
| 18 | BUFF | crafting | 1 | 1 | crafting_tan_leather | 7,500 | -77% | stub_data |
| 19 | BUFF | crafting | 1 | 1 | heartlands_wool_spin | 8,000 | -76% | stub_data |
| 20 | BUFF | fletching | 1 | 1 | heartlands_arrow_shaft_cut | 8,000 | -76% | stub_data |
| 21 | BUFF | prayer | 1 | 1 | heartlands_bury_bones_afk | 8,000 | -76% | stub_data |
| 22 | BUFF | construction | 1 | 4 | trainmethod_construction_crude_chairs | 20,000 | -76% | stub_data |
| 23 | BUFF | runecrafting | 5 | 5 | heartlands_air_altar_pouch_rush | 36,200 | -50% | stub_data |
| 24 | BUFF | mining | 35 | 4 | gather_sandstone_rock | 9,000 | -89% | stub_data |
| 25 | BUFF | cooking | 3 | 3 | heartlands_range_meat_rotation | 19,300 | -72% | stub_data |
| 26 | BUFF | runecrafting | 9 | 5 | saltbrine_water_altar_pouch_rush | 33,600 | -53% | stub_data |
| 27 | BUFF | runecrafting | 1 | 4 | trainmethod_runecrafting_daeyalt_essence | 45,000 | -45% | stub_data |
| 28 | BUFF | herblore | 3 | 1 | heartlands_guam_clean_bulk | 8,000 | -76% | stub_data |
| 29 | BUFF | magic | 5 | 4 | magic_water_strike | 15,000 | -77% | stub_data |
| 30 | BUFF | slayer | 20 | 5 | trainmethod_slayer_konar_tasks | 20,000 | -72% | stub_data |
| 31 | BUFF | mining | 38 | 1 | gather_dense_essence_rock | 3,600 | -89% | stub_data |
| 32 | BUFF | prayer | 1 | 2 | trainmethod_prayer_bones_altar | 15,000 | -72% | stub_data |
| 33 | BUFF | crafting | 1 | 3 | heartlands_clay_pot | 19,300 | -72% | stub_data |
| 34 | BUFF | prayer | 1 | 3 | heartlands_bury_big_bones | 19,300 | -72% | stub_data |
| 35 | BUFF | ranged | 1 | 2 | trainmethod_ranged_safe_spot_ogres | 12,000 | -71% | stub_data |
| 36 | BUFF | slayer | 15 | 4 | heartlands_banshee_rush | 29,200 | -65% | stub_data |
| 37 | BUFF | runecrafting | 1 | 7 | trainmethod_wilds_rune_essence | 68,000 | -41% | stub_data |
| 38 | BUFF | fletching | 5 | 2 | heartlands_shortbow_u | 13,900 | -74% | stub_data |
| 39 | BUFF | farming | 1 | 2 | farming_plant_potato_seed | 16,000 | -70% | stub_data |
| 40 | BUFF | construction | 1 | 2 | trainmethod_heartlands_carpenter_apprentice | 16,000 | -70% | stub_data |
| 41 | BUFF | herblore | 3 | 4 | heartlands_attack_potion_mix | 24,300 | -71% | stub_data |
| 42 | BUFF | thieving | 1 | 2 | trainmethod_heartlands_market_pickpocket | 22,000 | -59% | stub_data |
| 43 | BUFF | firemaking | 1 | 2 | trainmethod_firemaking_normal_logs | 20,000 | -63% | stub_data |
| 44 | BUFF | mining | 15 | 1 | sootworks_iron_soot_seam | 12,500 | -62% | stub_data |
| 45 | BUFF | slayer | 15 | 1 | heartlands_burthorpe_banshee | 13,300 | -60% | stub_data |
| 46 | BUFF | thieving | 1 | 2 | trainmethod_veilwood_thinkberry_cache_thieving | 24,000 | -56% | stub_data |
| 47 | BUFF | thieving | 25 | 4 | thieving_pickpocket_farmer | 17,400 | -79% | stub_data |
| 48 | BUFF | attack | 3 | 2 | heartlands_giant_rat_cave | 13,900 | -67% | stub_data |
| 49 | BUFF | defence | 3 | 2 | heartlands_rat_def | 13,900 | -67% | stub_data |
| 50 | BUFF | ranged | 3 | 2 | heartlands_rat_range | 13,900 | -67% | stub_data |

**Implementation shape:** each BUFF targets `xpPer` in the action manifest, `xpPerHour` in the training-knobs pack, or the `experience` field in `data/methods/<skill>.json`. No data-file edits in this report — just the specification.

**Heuristic BUFF targets:** raise to `0.85 * band_family_median`. For the 293 BUFF rows that is: b1 -> 28k, b2 -> 46k, b3 -> 58k, b4 -> 70k, b5 -> 61k, b6 -> 104k, b7 -> 98k/101k, b8 -> 127k/85k, b9 -> 68k/119k.

**REDUCE_INTENSITY targets (134 entries):** most are `kill_mega_*` monsters in `monsters-mega.js` whose raw xp is fine for a band-2 AFK kill but is mistagged as band 3-5 Active. Re-tagging them from intensity 4 -> 2 and 5 -> 3 clears ~100 of these without touching xp values.

---

## 6. Do-not-fix list (61 intentional OSRS-parity drudges)

These are canon slow paths players accept. Flag them in the catalog report with an `osrs_canon=true` marker so the misery tally can exclude them.

| Skill | Lvl | Activity | xp/hr | OSRS parity reason |
|---|---|---|---|---|
| agility | 1 | trainmethod_agility_gnome_course | 8,000 | Canon Gnome Stronghold xp/hr |
| attack | 1 | trainmethod_attack_cows | 14,000 | Lumbridge cows intro |
| attack | 12 | heartlands_man_pickpocket_hybrid | 30,200 | Hybrid pickpocket/safe-spot is canonically mid |
| combat | 1 | kill_pigeon | 2,660 | Starter mob — the point is *to teach you combat* |
| cooking | 1 | process_cook_sardine | 12,000 | Canon shrimp/sardine intro |
| cooking | 5 | process_cook_herring | 15,000 | Canon herring intro |
| fishing | 1,5,10,81 | shrimp/sardine/herring/manta | 6k-13.8k | All canonical AFK fishing tiers |
| magic | 17 | heartlands_wind_bolt_cow | 14,100 | Canon wind bolt on cows |
| mining | 10 | gather_shooting_star | 4,200 | Shooting star is an *event* reward, not a training loop |
| runecrafting | 1-85 | runecrafting_craft_*_runes | 10k-21k | Canon solo RC is slow — alts handle non-misery |
| slayer | 1-10 | Turael cow/bear/spider/bat, turael_tasks | 5k-19k | Turael is canonically beginner-slow |
| smithing | 1-70 | bronze_bar/iron_bar/silver/gold/adamantite smelt | 4.1k-37.5k | OSRS smithing is slow below blast furnace |
| smithing | 35 | trainmethod_smithing_cannonballs | 14,000 | Cannonball AFK is canonically slow-XP, GP-positive |
| thieving | 1 | thieving_pickpocket_man | 9,600 | Canon man pickpocket intro |
| thieving | 50 | trainmethod_saltbrine_smuggler_manifest_thieving | 95,000 | Slow AFK variant with good loot |
| woodcutting | 1-30 | normal/logwood/oak/willow tiers | 7k-24k | Canon tree xp curve |
| cooking | 1 | trainmethod_cooking_shrimp_basic | 30,000 | Starter tutorial path |
| mining | 70 | adamantite_rock / adamant_tick_cluster | 57k/65k | Canon adamant xp; pre-rune skilling plateau |
| defence | 15 | heartlands_man_def_guard_rotation | 30,200 | Slow defensive AFK |
| slayer | 38 | kill_mega_veil_hollow_huntsman | 28,160 | One of several 38-level monster options |
| combat | 7,85 | kill_mega_heart_toll_highwayman / kill_commander_zilyana | 15.4k/54.3k | Zilyana parity — expected low raw xp, high GP |

Full list of 61 entries is in the priority-ordered JSON working file. These 61 entries should be excluded from future misery-zone counts via an `osrs_canon: true` flag on the activity, which would bring the reported misery tally from 506 to **445**.

---

## Recommended execution order

1. **BUFF pass 1 — Heartlands starter stubs (bands 1-2, ~120 entries).** Single-session edit to `training-knobs.js` + `training-methods.js`. Removes the obvious band-1/2 bulge.
2. **REDUCE_INTENSITY pass — `monsters-mega.js` re-tag (~100 entries).** Mechanical: drop intensity by 1-2 for every kill_mega_* whose attention is Background/Multitask.
3. **RC 1-77 plan (section 2).** Buff the 14 alt methods; leave the craft lines alone. Single PR, ~40 line changes.
4. **Add `osrs_canon: true` flag** to the catalog builder + 61 entries (section 6). Mechanical.
5. **Genuine design flaw pass (18 HP entries).** Rebalance hitpoints xp coefficient against combat median.
6. **Content gap pass.** Runecrafting/smithing/construction/fletching/farming/thieving/hunter/herblore/crafting are missing band 9-10 methods entirely — this is a separate gap-audit task, not a misery fix.

---

_Derived data: `reports/_misery_temp.json` (all 506 entries with root_cause + fix + priority) and `reports/_misery_derived.json` (aggregates). Neither file is committed with this report — they are regenerable from `intensity-catalog.json` via the algorithm in `scripts/build-intensity-catalog.js` lines 1107-1185._
