# Intensity Catalog Report

Generated 2026-04-22T15:20:11.582Z. 1007 activities indexed.

## Intensity band histogram

| Band | Total | Skilling | Combat | Skilling Median XP/hr | Combat Median XP/hr |
|------|-------|----------|--------|----------------------|--------------------|
| 1 | 150 | 130 | 16 | 32000 | 15960 |
| 2 | 75 | 47 | 26 | 49200 | 42560 |
| 3 | 78 | 15 | 60 | 45900 | 52136 |
| 4 | 197 | 78 | 94 | 72500 | 74480 |
| 5 | 104 | 25 | 67 | 56200 | 95760 |
| 6 | 73 | 32 | 30 | 152000 | 119700 |
| 7 | 187 | 8 | 175 | 112200 | 123424 |
| 8 | 41 | 6 | 8 | 163500 | 106400 |
| 9 | 94 | 0 | 73 | 0 | 148960 |
| 10 | 8 | 0 | 6 | 0 | 75000 |

_Total counts include minigames, composites, and combat-manifest swing entries. Skilling/Combat columns count only activities eligible for misery comparison._

## Content gaps (bands with <5 activities)

_None. Every intensity band has >=5 activities._

## Misery zones (activities >30% below their band median)

Total: **189** misery entries across bands (family-aware: skilling vs combat medians computed separately).

### Top 20 worst offenders

| Activity | Band | Family | Skill | Deficit % | XP/hr | Fam.Median | Source |
|---|---|---|---|---|---|---|---|
| thieving_pickpocket_man | 4 | skilling_xp | thieving | -87% | 9600 | 72500 | src/engine/skills/thieving.js |
| runecrafting_craft_air_runes | 4 | skilling_xp | runecrafting | -86% | 10000 | 72500 | src/engine/skills/runecrafting.js |
| runecrafting_craft_wrath_runes | 6 | skilling_xp | runecrafting | -86% | 22000 | 152000 | src/engine/skills/runecrafting.js |
| runecrafting_craft_mind_runes | 4 | skilling_xp | runecrafting | -85% | 11000 | 72500 | src/engine/skills/runecrafting.js |
| kill_pigeon | 1 | combat | combat | -83% | 2660 | 15960 | src/content/aelgard/monsters-blitz2.js |
| runecrafting_craft_water_runes | 4 | skilling_xp | runecrafting | -83% | 12000 | 72500 | src/engine/skills/runecrafting.js |
| runecrafting_craft_earth_runes | 4 | skilling_xp | runecrafting | -82% | 13000 | 72500 | src/engine/skills/runecrafting.js |
| runecrafting_craft_fire_runes | 4 | skilling_xp | runecrafting | -81% | 14000 | 72500 | src/engine/skills/runecrafting.js |
| magic_water_strike | 4 | combat | magic | -80% | 15000 | 74480 | src/engine/skills/magic.js |
| runecrafting_craft_body_runes | 4 | skilling_xp | runecrafting | -79% | 15000 | 72500 | src/engine/skills/runecrafting.js |
| runecrafting_craft_cosmic_runes | 4 | skilling_xp | runecrafting | -78% | 16000 | 72500 | src/engine/skills/runecrafting.js |
| smithing_smelt_bronze_bar | 1 | skilling_xp | smithing | -77% | 7440 | 32000 | src/engine/skills/smithing.js |
| crafting_tan_leather | 1 | skilling_xp | crafting | -77% | 7500 | 32000 | src/engine/skills/crafting.js |
| runecrafting_craft_chaos_runes | 4 | skilling_xp | runecrafting | -77% | 17000 | 72500 | src/engine/skills/runecrafting.js |
| thieving_pickpocket_farmer | 4 | skilling_xp | thieving | -76% | 17400 | 72500 | src/engine/skills/thieving.js |
| heartlands_range_meat_basic | 1 | skilling_xp | cooking | -75% | 8000 | 32000 | data/methods/cooking.json |
| heartlands_wool_spin | 1 | skilling_xp | crafting | -75% | 8000 | 32000 | data/methods/crafting.json |
| heartlands_log_burn_trail | 1 | skilling_xp | firemaking | -75% | 8000 | 32000 | data/methods/firemaking.json |
| heartlands_lumbrick_shrimp_net | 1 | skilling_xp | fishing | -75% | 8000 | 32000 | data/methods/fishing.json |
| heartlands_arrow_shaft_cut | 1 | skilling_xp | fletching | -75% | 8000 | 32000 | data/methods/fletching.json |

## Per-skill coverage matrix

| Skill | Bands covered | Bands missing |
|---|---|---|
| agility | 2, 4, 6 | 1, 3, 5, 7, 8, 9, 10 |
| attack | 4, 6 | 1, 2, 3, 5, 7, 8, 9, 10 |
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
| runecrafting | 4, 6 | 1, 2, 3, 5, 7, 8, 9, 10 |
| slayer | 4, 6 | 1, 2, 3, 5, 7, 8, 9, 10 |
| smithing | 1, 2, 3, 4, 5, 6, 7, 8 | 9, 10 |
| strength | 4, 6 | 1, 2, 3, 5, 7, 8, 9, 10 |
| thieving | 4, 6 | 1, 2, 3, 5, 7, 8, 9, 10 |
| woodcutting | 1, 2, 4, 5, 6, 7, 8 | 3, 9, 10 |
