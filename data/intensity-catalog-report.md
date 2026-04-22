# Intensity Catalog Report

Generated 2026-04-22T15:30:41.134Z. 2094 activities indexed.

## Intensity band histogram

| Band | Total | Skilling | Combat | Skilling Median XP/hr | Combat Median XP/hr |
|------|-------|----------|--------|----------------------|--------------------|
| 1 | 300 | 207 | 63 | 35000 | 22000 |
| 2 | 298 | 171 | 64 | 53800 | 42000 |
| 3 | 154 | 31 | 92 | 68000 | 46550 |
| 4 | 444 | 184 | 157 | 85000 | 65542 |
| 5 | 231 | 63 | 133 | 72100 | 75810 |
| 6 | 143 | 51 | 60 | 124500 | 92568 |
| 7 | 256 | 44 | 202 | 115400 | 119168 |
| 8 | 98 | 35 | 26 | 149100 | 99750 |
| 9 | 155 | 26 | 103 | 80000 | 140000 |
| 10 | 15 | 1 | 12 | 72000 | 80000 |

_Total counts include minigames, composites, and combat-manifest swing entries. Skilling/Combat columns count only activities eligible for misery comparison._

## Content gaps (bands with <5 activities)

_None. Every intensity band has >=5 activities._

## Misery zones (activities >30% below their band median)

Total: **503** misery entries across bands (family-aware: skilling vs combat medians computed separately).

### Top 20 worst offenders

| Activity | Band | Family | Skill | Deficit % | XP/hr | Fam.Median | Source |
|---|---|---|---|---|---|---|---|
| gather_shooting_star | 2 | skilling_xp | mining | -92% | 4200 | 53800 | src/content/aelgard/training-methods.js |
| process_smelt_silver | 2 | skilling_xp | smithing | -92% | 4110 | 53800 | src/content/aelgard/training-methods.js |
| trainmethod_slayer_turael_tasks | 2 | skilling_xp | slayer | -91% | 5000 | 53800 | src/content/aelgard/training-knobs.js |
| trainmethod_runecrafting_air_runes | 4 | skilling_xp | runecrafting | -91% | 8000 | 85000 | src/content/aelgard/training-knobs.js |
| trainmethod_agility_gnome_course | 4 | skilling_xp | agility | -91% | 8000 | 85000 | src/content/aelgard/training-knobs.js |
| gather_dense_essence_rock | 1 | skilling_xp | mining | -90% | 3600 | 35000 | src/content/aelgard/training-methods.js |
| thieving_pickpocket_man | 4 | skilling_xp | thieving | -89% | 9600 | 85000 | src/engine/skills/thieving.js |
| gather_sandstone_rock | 4 | skilling_xp | mining | -89% | 9000 | 85000 | src/content/aelgard/training-methods.js |
| kill_pigeon | 1 | combat | combat | -88% | 2660 | 22000 | src/content/aelgard/monsters-blitz2.js |
| runecrafting_craft_air_runes | 4 | skilling_xp | runecrafting | -88% | 10000 | 85000 | src/engine/skills/runecrafting.js |
| process_smelt_gold | 2 | skilling_xp | smithing | -87% | 6750 | 53800 | src/content/aelgard/training-methods.js |
| runecrafting_craft_mind_runes | 4 | skilling_xp | runecrafting | -87% | 11000 | 85000 | src/engine/skills/runecrafting.js |
| gather_achey_tree | 2 | skilling_xp | woodcutting | -86% | 7500 | 53800 | src/content/aelgard/training-methods.js |
| runecrafting_craft_water_runes | 4 | skilling_xp | runecrafting | -86% | 12000 | 85000 | src/engine/skills/runecrafting.js |
| runecrafting_craft_earth_runes | 4 | skilling_xp | runecrafting | -85% | 13000 | 85000 | src/engine/skills/runecrafting.js |
| runecrafting_craft_fire_runes | 4 | skilling_xp | runecrafting | -84% | 14000 | 85000 | src/engine/skills/runecrafting.js |
| gather_sardine_spot | 1 | skilling_xp | fishing | -83% | 6000 | 35000 | src/content/aelgard/training-methods.js |
| runecrafting_craft_body_runes | 4 | skilling_xp | runecrafting | -82% | 15000 | 85000 | src/engine/skills/runecrafting.js |
| gather_granite_rock | 4 | skilling_xp | mining | -82% | 15000 | 85000 | src/content/aelgard/training-methods.js |
| runecrafting_craft_wrath_runes | 6 | skilling_xp | runecrafting | -82% | 22000 | 124500 | src/engine/skills/runecrafting.js |

## Per-skill coverage matrix

| Skill | Bands covered | Bands missing |
|---|---|---|
| agility | 2, 4, 5, 6, 7, 8, 9 | 1, 3, 10 |
| attack | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 | none |
| combat | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 | none |
| construction | 2, 4, 5, 6, 7, 8 | 1, 3, 9, 10 |
| cooking | 1, 2, 3, 4, 5, 6, 7, 8 | 9, 10 |
| crafting | 1, 2, 3, 4, 5, 6, 7, 8 | 9, 10 |
| defence | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 | none |
| farming | 1, 2, 3, 4, 5, 7, 8 | 6, 9, 10 |
| firemaking | 1, 2, 3, 4, 5, 6, 8, 9 | 7, 10 |
| fishing | 1, 2, 3, 4, 5, 6, 7, 8, 9 | 10 |
| fletching | 1, 2, 3, 4, 5, 6, 7, 8 | 9, 10 |
| herblore | 1, 2, 3, 4, 5, 6, 7, 8 | 9, 10 |
| hitpoints | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 | none |
| hunter | 1, 2, 3, 4, 5, 6, 7, 8 | 9, 10 |
| magic | 1, 2, 3, 4, 5, 6, 7, 8, 9 | 10 |
| mining | 1, 2, 3, 4, 5, 6, 7, 8, 9 | 10 |
| mixed | 2, 3, 5, 6, 8 | 1, 4, 7, 9, 10 |
| prayer | 1, 2, 3, 4, 5, 6, 7, 8, 9 | 10 |
| ranged | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 | none |
| runecrafting | 1, 2, 3, 4, 5, 6, 7, 8, 10 | 9 |
| slayer | 1, 2, 3, 4, 5, 6, 7, 9 | 8, 10 |
| smithing | 1, 2, 3, 4, 5, 6, 7, 8 | 9, 10 |
| strength | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 | none |
| thieving | 1, 2, 4, 5, 6, 7, 8, 9 | 3, 10 |
| woodcutting | 1, 2, 3, 4, 5, 6, 7, 8 | 9, 10 |

## Per-region coverage matrix

| Region | # Activities | Bands covered | Bands missing |
|---|---|---|---|
| heartlands | 385 | 1, 2, 3, 4, 5, 6, 7, 8, 9 | 10 |
| sootworks | 213 | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 | none |
| moryskah | 269 | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 | none |
| boneyard | 134 | 1, 2, 3, 4, 5, 6, 7, 8, 9 | 10 |
| glass_desert | 148 | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 | none |
| saltbrine | 186 | 1, 2, 3, 4, 5, 6, 7, 8, 9 | 10 |
| veilwood | 197 | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 | none |
| inkweald | 171 | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 | none |
| wilds | 207 | 2, 3, 4, 5, 6, 7, 8, 9, 10 | 1 |
| unknown | 180 | 1, 2, 3, 4, 5, 6, 7, 8, 9 | 10 |
