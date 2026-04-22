# Intensity Catalog Report

Generated 2026-04-22T15:23:40.028Z. 1166 activities indexed.

## Intensity band histogram

| Band | Total | Skilling | Combat | Skilling Median XP/hr | Combat Median XP/hr |
|------|-------|----------|--------|----------------------|--------------------|
| 1 | 170 | 141 | 23 | 32000 | 18620 |
| 2 | 86 | 52 | 32 | 49200 | 42000 |
| 3 | 101 | 16 | 82 | 56100 | 46550 |
| 4 | 239 | 80 | 134 | 69600 | 65542 |
| 5 | 141 | 30 | 99 | 56200 | 87780 |
| 6 | 83 | 35 | 37 | 122300 | 111720 |
| 7 | 201 | 9 | 188 | 112200 | 119168 |
| 8 | 42 | 7 | 8 | 163500 | 106400 |
| 9 | 95 | 0 | 74 | 0 | 148960 |
| 10 | 8 | 0 | 6 | 0 | 75000 |

_Total counts include minigames, composites, and combat-manifest swing entries. Skilling/Combat columns count only activities eligible for misery comparison._

## Content gaps (bands with <5 activities)

_None. Every intensity band has >=5 activities._

## Misery zones (activities >30% below their band median)

Total: **300** misery entries across bands (family-aware: skilling vs combat medians computed separately).

### Top 20 worst offenders

| Activity | Band | Family | Skill | Deficit % | XP/hr | Fam.Median | Source |
|---|---|---|---|---|---|---|---|
| kill_pigeon | 1 | combat | combat | -86% | 2660 | 18620 | src/content/aelgard/monsters-blitz2.js |
| runecrafting_craft_air_runes | 4 | skilling_xp | runecrafting | -86% | 10000 | 69600 | src/engine/skills/runecrafting.js |
| thieving_pickpocket_man | 4 | skilling_xp | thieving | -86% | 9600 | 69600 | src/engine/skills/thieving.js |
| runecrafting_craft_mind_runes | 4 | skilling_xp | runecrafting | -84% | 11000 | 69600 | src/engine/skills/runecrafting.js |
| runecrafting_craft_water_runes | 4 | skilling_xp | runecrafting | -83% | 12000 | 69600 | src/engine/skills/runecrafting.js |
| runecrafting_craft_wrath_runes | 6 | skilling_xp | runecrafting | -82% | 22000 | 122300 | src/engine/skills/runecrafting.js |
| runecrafting_craft_earth_runes | 4 | skilling_xp | runecrafting | -81% | 13000 | 69600 | src/engine/skills/runecrafting.js |
| runecrafting_craft_fire_runes | 4 | skilling_xp | runecrafting | -80% | 14000 | 69600 | src/engine/skills/runecrafting.js |
| runecrafting_craft_body_runes | 4 | skilling_xp | runecrafting | -78% | 15000 | 69600 | src/engine/skills/runecrafting.js |
| smithing_smelt_bronze_bar | 1 | skilling_xp | smithing | -77% | 7440 | 32000 | src/engine/skills/smithing.js |
| crafting_tan_leather | 1 | skilling_xp | crafting | -77% | 7500 | 32000 | src/engine/skills/crafting.js |
| runecrafting_craft_cosmic_runes | 4 | skilling_xp | runecrafting | -77% | 16000 | 69600 | src/engine/skills/runecrafting.js |
| magic_water_strike | 4 | combat | magic | -77% | 15000 | 65542 | src/engine/skills/magic.js |
| runecrafting_craft_chaos_runes | 4 | skilling_xp | runecrafting | -76% | 17000 | 69600 | src/engine/skills/runecrafting.js |
| heartlands_range_meat_basic | 1 | skilling_xp | cooking | -75% | 8000 | 32000 | data/methods/cooking.json |
| heartlands_wool_spin | 1 | skilling_xp | crafting | -75% | 8000 | 32000 | data/methods/crafting.json |
| heartlands_log_burn_trail | 1 | skilling_xp | firemaking | -75% | 8000 | 32000 | data/methods/firemaking.json |
| heartlands_lumbrick_shrimp_net | 1 | skilling_xp | fishing | -75% | 8000 | 32000 | data/methods/fishing.json |
| heartlands_arrow_shaft_cut | 1 | skilling_xp | fletching | -75% | 8000 | 32000 | data/methods/fletching.json |
| heartlands_guam_clean_bulk | 1 | skilling_xp | herblore | -75% | 8000 | 32000 | data/methods/herblore.json |

## Per-skill coverage matrix

| Skill | Bands covered | Bands missing |
|---|---|---|
| agility | 2, 4, 6 | 1, 3, 5, 7, 8, 9, 10 |
| attack | 1, 2, 3, 4, 5, 6, 7, 9 | 8, 10 |
| combat | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 | none |
| construction | 4, 6 | 1, 2, 3, 5, 7, 8, 9, 10 |
| cooking | 1, 2, 3, 4, 5, 6, 7 | 8, 9, 10 |
| crafting | 1, 2, 3, 4, 5, 6, 8 | 7, 9, 10 |
| defence | 4, 6 | 1, 2, 3, 5, 7, 8, 9, 10 |
| farming | 1, 2 | 3, 4, 5, 6, 7, 8, 9, 10 |
| firemaking | 1, 2, 3, 4, 5, 6 | 7, 8, 9, 10 |
| fishing | 1, 2, 3, 4, 5, 6, 7, 8 | 9, 10 |
| fletching | 1, 2, 3, 4, 5, 6, 7 | 8, 9, 10 |
| herblore | 1, 2, 4, 5, 6 | 3, 7, 8, 9, 10 |
| hitpoints | 1 | 2, 3, 4, 5, 6, 7, 8, 9, 10 |
| hunter | 2, 4, 6 | 1, 3, 5, 7, 8, 9, 10 |
| magic | 1, 2, 4, 6 | 3, 5, 7, 8, 9, 10 |
| mining | 1, 2, 3, 4, 5, 6, 7, 8 | 9, 10 |
| mixed | 2, 3, 5, 6, 8 | 1, 4, 7, 9, 10 |
| prayer | 1, 4, 6 | 2, 3, 5, 7, 8, 9, 10 |
| ranged | 4, 6 | 1, 2, 3, 5, 7, 8, 9, 10 |
| runecrafting | 1, 2, 3, 4, 5, 6, 7, 8 | 9, 10 |
| slayer | 1, 2, 3, 4, 5, 6, 7 | 8, 9, 10 |
| smithing | 1, 2, 3, 4, 5, 6, 7, 8 | 9, 10 |
| strength | 4, 6 | 1, 2, 3, 5, 7, 8, 9, 10 |
| thieving | 4, 6 | 1, 2, 3, 5, 7, 8, 9, 10 |
| woodcutting | 1, 2, 4, 5, 6, 7, 8 | 3, 9, 10 |
