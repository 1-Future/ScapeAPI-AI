# Intensity Catalog Report

Generated 2026-04-22T15:25:37.842Z. 1232 activities indexed.

## Intensity band histogram

| Band | Total | Skilling | Combat | Skilling Median XP/hr | Combat Median XP/hr |
|------|-------|----------|--------|----------------------|--------------------|
| 1 | 196 | 158 | 29 | 30400 | 19800 |
| 2 | 112 | 75 | 35 | 40000 | 42000 |
| 3 | 102 | 16 | 83 | 56100 | 46550 |
| 4 | 246 | 83 | 138 | 65000 | 65542 |
| 5 | 144 | 30 | 102 | 56200 | 84269 |
| 6 | 84 | 35 | 38 | 122300 | 111720 |
| 7 | 202 | 9 | 189 | 112200 | 119168 |
| 8 | 42 | 7 | 8 | 163500 | 106400 |
| 9 | 96 | 0 | 75 | 0 | 148960 |
| 10 | 8 | 0 | 6 | 0 | 75000 |

_Total counts include minigames, composites, and combat-manifest swing entries. Skilling/Combat columns count only activities eligible for misery comparison._

## Content gaps (bands with <5 activities)

_None. Every intensity band has >=5 activities._

## Misery zones (activities >30% below their band median)

Total: **328** misery entries across bands (family-aware: skilling vs combat medians computed separately).

### Top 20 worst offenders

| Activity | Band | Family | Skill | Deficit % | XP/hr | Fam.Median | Source |
|---|---|---|---|---|---|---|---|
| gather_shooting_star | 2 | skilling_xp | mining | -90% | 4200 | 40000 | src/content/aelgard/training-methods.js |
| process_smelt_silver | 2 | skilling_xp | smithing | -90% | 4110 | 40000 | src/content/aelgard/training-methods.js |
| gather_dense_essence_rock | 1 | skilling_xp | mining | -88% | 3600 | 30400 | src/content/aelgard/training-methods.js |
| kill_pigeon | 1 | combat | combat | -87% | 2660 | 19800 | src/content/aelgard/monsters-blitz2.js |
| gather_sandstone_rock | 4 | skilling_xp | mining | -86% | 9000 | 65000 | src/content/aelgard/training-methods.js |
| runecrafting_craft_air_runes | 4 | skilling_xp | runecrafting | -85% | 10000 | 65000 | src/engine/skills/runecrafting.js |
| thieving_pickpocket_man | 4 | skilling_xp | thieving | -85% | 9600 | 65000 | src/engine/skills/thieving.js |
| process_smelt_gold | 2 | skilling_xp | smithing | -83% | 6750 | 40000 | src/content/aelgard/training-methods.js |
| runecrafting_craft_mind_runes | 4 | skilling_xp | runecrafting | -83% | 11000 | 65000 | src/engine/skills/runecrafting.js |
| runecrafting_craft_water_runes | 4 | skilling_xp | runecrafting | -82% | 12000 | 65000 | src/engine/skills/runecrafting.js |
| runecrafting_craft_wrath_runes | 6 | skilling_xp | runecrafting | -82% | 22000 | 122300 | src/engine/skills/runecrafting.js |
| gather_achey_tree | 2 | skilling_xp | woodcutting | -81% | 7500 | 40000 | src/content/aelgard/training-methods.js |
| gather_sardine_spot | 1 | skilling_xp | fishing | -80% | 6000 | 30400 | src/content/aelgard/training-methods.js |
| runecrafting_craft_earth_runes | 4 | skilling_xp | runecrafting | -80% | 13000 | 65000 | src/engine/skills/runecrafting.js |
| runecrafting_craft_fire_runes | 4 | skilling_xp | runecrafting | -78% | 14000 | 65000 | src/engine/skills/runecrafting.js |
| runecrafting_craft_body_runes | 4 | skilling_xp | runecrafting | -77% | 15000 | 65000 | src/engine/skills/runecrafting.js |
| gather_granite_rock | 4 | skilling_xp | mining | -77% | 15000 | 65000 | src/content/aelgard/training-methods.js |
| magic_water_strike | 4 | combat | magic | -77% | 15000 | 65542 | src/engine/skills/magic.js |
| smithing_smelt_bronze_bar | 1 | skilling_xp | smithing | -76% | 7440 | 30400 | src/engine/skills/smithing.js |
| crafting_tan_leather | 1 | skilling_xp | crafting | -75% | 7500 | 30400 | src/engine/skills/crafting.js |

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
| strength | 1, 2, 3, 4, 5, 6, 7, 9 | 8, 10 |
| thieving | 4, 6 | 1, 2, 3, 5, 7, 8, 9, 10 |
| woodcutting | 1, 2, 4, 5, 6, 7, 8 | 3, 9, 10 |
