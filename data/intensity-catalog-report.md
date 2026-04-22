# Intensity Catalog Report

Generated 2026-04-22T15:31:33.488Z. 2117 activities indexed.

## Intensity band histogram

| Band | Total | Skilling | Combat | Skilling Median XP/hr | Combat Median XP/hr |
|------|-------|----------|--------|----------------------|--------------------|
| 1 | 309 | 216 | 63 | 33000 | 22000 |
| 2 | 300 | 173 | 64 | 54000 | 42000 |
| 3 | 157 | 34 | 92 | 68000 | 46550 |
| 4 | 447 | 187 | 157 | 82500 | 65542 |
| 5 | 234 | 66 | 133 | 72200 | 75810 |
| 6 | 145 | 53 | 60 | 122300 | 92568 |
| 7 | 256 | 44 | 202 | 115400 | 119168 |
| 8 | 99 | 36 | 26 | 149300 | 99750 |
| 9 | 155 | 26 | 103 | 80000 | 140000 |
| 10 | 15 | 1 | 12 | 72000 | 80000 |

_Total counts include minigames, composites, and combat-manifest swing entries. Skilling/Combat columns count only activities eligible for misery comparison._

## Content gaps (bands with <5 activities)

_None. Every intensity band has >=5 activities._

## Misery zones (activities >30% below their band median)

Total: **506** misery entries across bands (family-aware: skilling vs combat medians computed separately).

### Top 20 worst offenders

| Activity | Band | Family | Skill | Deficit % | XP/hr | Fam.Median | Source |
|---|---|---|---|---|---|---|---|
| gather_shooting_star | 2 | skilling_xp | mining | -92% | 4200 | 54000 | src/content/aelgard/training-methods.js |
| process_smelt_silver | 2 | skilling_xp | smithing | -92% | 4110 | 54000 | src/content/aelgard/training-methods.js |
| trainmethod_slayer_turael_tasks | 2 | skilling_xp | slayer | -91% | 5000 | 54000 | src/content/aelgard/training-knobs.js |
| trainmethod_runecrafting_air_runes | 4 | skilling_xp | runecrafting | -90% | 8000 | 82500 | src/content/aelgard/training-knobs.js |
| trainmethod_agility_gnome_course | 4 | skilling_xp | agility | -90% | 8000 | 82500 | src/content/aelgard/training-knobs.js |
| gather_dense_essence_rock | 1 | skilling_xp | mining | -89% | 3600 | 33000 | src/content/aelgard/training-methods.js |
| gather_sandstone_rock | 4 | skilling_xp | mining | -89% | 9000 | 82500 | src/content/aelgard/training-methods.js |
| kill_pigeon | 1 | combat | combat | -88% | 2660 | 22000 | src/content/aelgard/monsters-blitz2.js |
| process_smelt_gold | 2 | skilling_xp | smithing | -88% | 6750 | 54000 | src/content/aelgard/training-methods.js |
| runecrafting_craft_air_runes | 4 | skilling_xp | runecrafting | -88% | 10000 | 82500 | src/engine/skills/runecrafting.js |
| thieving_pickpocket_man | 4 | skilling_xp | thieving | -88% | 9600 | 82500 | src/engine/skills/thieving.js |
| runecrafting_craft_mind_runes | 4 | skilling_xp | runecrafting | -87% | 11000 | 82500 | src/engine/skills/runecrafting.js |
| gather_achey_tree | 2 | skilling_xp | woodcutting | -86% | 7500 | 54000 | src/content/aelgard/training-methods.js |
| runecrafting_craft_water_runes | 4 | skilling_xp | runecrafting | -85% | 12000 | 82500 | src/engine/skills/runecrafting.js |
| runecrafting_craft_earth_runes | 4 | skilling_xp | runecrafting | -84% | 13000 | 82500 | src/engine/skills/runecrafting.js |
| runecrafting_craft_fire_runes | 4 | skilling_xp | runecrafting | -83% | 14000 | 82500 | src/engine/skills/runecrafting.js |
| gather_sardine_spot | 1 | skilling_xp | fishing | -82% | 6000 | 33000 | src/content/aelgard/training-methods.js |
| runecrafting_craft_body_runes | 4 | skilling_xp | runecrafting | -82% | 15000 | 82500 | src/engine/skills/runecrafting.js |
| gather_granite_rock | 4 | skilling_xp | mining | -82% | 15000 | 82500 | src/content/aelgard/training-methods.js |
| runecrafting_craft_wrath_runes | 6 | skilling_xp | runecrafting | -82% | 22000 | 122300 | src/engine/skills/runecrafting.js |

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
| slayer | 1, 2, 3, 4, 5, 6, 7, 8, 9 | 10 |
| smithing | 1, 2, 3, 4, 5, 6, 7, 8 | 9, 10 |
| strength | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 | none |
| thieving | 1, 2, 4, 5, 6, 7, 8, 9 | 3, 10 |
| woodcutting | 1, 2, 3, 4, 5, 6, 7, 8 | 9, 10 |

## Per-region coverage matrix

| Region | # Activities | Bands covered | Bands missing |
|---|---|---|---|
| heartlands | 391 | 1, 2, 3, 4, 5, 6, 7, 8, 9 | 10 |
| sootworks | 215 | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 | none |
| moryskah | 274 | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 | none |
| boneyard | 135 | 1, 2, 3, 4, 5, 6, 7, 8, 9 | 10 |
| glass_desert | 148 | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 | none |
| saltbrine | 188 | 1, 2, 3, 4, 5, 6, 7, 8, 9 | 10 |
| veilwood | 200 | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 | none |
| inkweald | 174 | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 | none |
| wilds | 208 | 2, 3, 4, 5, 6, 7, 8, 9, 10 | 1 |
| unknown | 180 | 1, 2, 3, 4, 5, 6, 7, 8, 9 | 10 |
