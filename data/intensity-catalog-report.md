# Intensity Catalog Report

Generated 2026-04-22T17:14:40.437Z. 2242 activities indexed.

## Intensity band histogram

| Band | Total | Skilling | Combat | Skilling Median XP/hr | Combat Median XP/hr |
|------|-------|----------|--------|----------------------|--------------------|
| 1 | 362 | 269 | 63 | 32000 | 22000 |
| 2 | 318 | 187 | 68 | 53800 | 42560 |
| 3 | 171 | 48 | 92 | 56400 | 46550 |
| 4 | 464 | 204 | 157 | 82000 | 65542 |
| 5 | 248 | 80 | 133 | 73700 | 75810 |
| 6 | 150 | 58 | 60 | 136500 | 92568 |
| 7 | 259 | 47 | 202 | 118000 | 119168 |
| 8 | 100 | 37 | 26 | 149100 | 99750 |
| 9 | 155 | 26 | 103 | 80000 | 140000 |
| 10 | 15 | 1 | 12 | 72000 | 80000 |

_Total counts include minigames, composites, and combat-manifest swing entries. Skilling/Combat columns count only activities eligible for misery comparison._

## Content gaps (bands with <5 activities)

_None. Every intensity band has >=5 activities._

## Misery zones (activities >30% below their band median)

Total: **544** misery entries across bands (family-aware: skilling vs combat medians computed separately).

### Top 20 worst offenders

| Activity | Band | Family | Skill | Deficit % | XP/hr | Fam.Median | Source |
|---|---|---|---|---|---|---|---|
| gather_shooting_star | 2 | skilling_xp | mining | -92% | 4200 | 53800 | src/content/aelgard/training-methods.js |
| process_smelt_silver | 2 | skilling_xp | smithing | -92% | 4110 | 53800 | src/content/aelgard/training-methods.js |
| trainmethod_slayer_turael_tasks | 2 | skilling_xp | slayer | -91% | 5000 | 53800 | src/content/aelgard/training-knobs.js |
| trainmethod_runecrafting_air_runes | 4 | skilling_xp | runecrafting | -90% | 8000 | 82000 | src/content/aelgard/training-knobs.js |
| trainmethod_agility_gnome_course | 4 | skilling_xp | agility | -90% | 8000 | 82000 | src/content/aelgard/training-knobs.js |
| gather_dense_essence_rock | 1 | skilling_xp | mining | -89% | 3600 | 32000 | src/content/aelgard/training-methods.js |
| gather_sandstone_rock | 4 | skilling_xp | mining | -89% | 9000 | 82000 | src/content/aelgard/training-methods.js |
| kill_pigeon | 1 | combat | combat | -88% | 2660 | 22000 | src/content/aelgard/monsters-blitz2.js |
| runecrafting_craft_air_runes | 4 | skilling_xp | runecrafting | -88% | 10000 | 82000 | src/engine/skills/runecrafting.js |
| thieving_pickpocket_man | 4 | skilling_xp | thieving | -88% | 9600 | 82000 | src/engine/skills/thieving.js |
| process_smelt_gold | 2 | skilling_xp | smithing | -87% | 6750 | 53800 | src/content/aelgard/training-methods.js |
| runecrafting_craft_mind_runes | 4 | skilling_xp | runecrafting | -87% | 11000 | 82000 | src/engine/skills/runecrafting.js |
| gather_achey_tree | 2 | skilling_xp | woodcutting | -86% | 7500 | 53800 | src/content/aelgard/training-methods.js |
| runecrafting_craft_water_runes | 4 | skilling_xp | runecrafting | -85% | 12000 | 82000 | src/engine/skills/runecrafting.js |
| runecrafting_craft_earth_runes | 4 | skilling_xp | runecrafting | -84% | 13000 | 82000 | src/engine/skills/runecrafting.js |
| runecrafting_craft_wrath_runes | 6 | skilling_xp | runecrafting | -84% | 22000 | 136500 | src/engine/skills/runecrafting.js |
| runecrafting_craft_fire_runes | 4 | skilling_xp | runecrafting | -83% | 14000 | 82000 | src/engine/skills/runecrafting.js |
| runecrafting_craft_body_runes | 4 | skilling_xp | runecrafting | -82% | 15000 | 82000 | src/engine/skills/runecrafting.js |
| gather_granite_rock | 4 | skilling_xp | mining | -82% | 15000 | 82000 | src/content/aelgard/training-methods.js |
| boneyard_skeleton_hp_multi | 6 | combat | hitpoints | -82% | 16900 | 92568 | data/methods/hitpoints.json |

## Per-skill coverage matrix

| Skill | Bands covered | Bands missing |
|---|---|---|
| agility | 1, 2, 3, 4, 5, 6, 7, 8, 9 | 10 |
| attack | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 | none |
| combat | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 | none |
| construction | 1, 2, 3, 4, 5, 6, 7, 8 | 9, 10 |
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
| slayer | 1, 2, 3, 4, 5, 6, 7, 8, 9 | 10 |
| smithing | 1, 2, 3, 4, 5, 6, 7, 8 | 9, 10 |
| strength | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 | none |
| thieving | 1, 2, 3, 4, 5, 6, 7, 8, 9 | 10 |
| woodcutting | 1, 2, 3, 4, 5, 6, 7, 8 | 9, 10 |

## Per-region coverage matrix

| Region | # Activities | Bands covered | Bands missing |
|---|---|---|---|
| heartlands | 452 | 1, 2, 3, 4, 5, 6, 7, 8, 9 | 10 |
| sootworks | 216 | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 | none |
| moryskah | 277 | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 | none |
| boneyard | 138 | 1, 2, 3, 4, 5, 6, 7, 8, 9 | 10 |
| glass_desert | 155 | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 | none |
| saltbrine | 195 | 1, 2, 3, 4, 5, 6, 7, 8, 9 | 10 |
| veilwood | 223 | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 | none |
| inkweald | 188 | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 | none |
| wilds | 214 | 2, 3, 4, 5, 6, 7, 8, 9, 10 | 1 |
| unknown | 180 | 1, 2, 3, 4, 5, 6, 7, 8, 9 | 10 |
