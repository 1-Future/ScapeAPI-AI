# Multi-Agent Deep Simulation Report

Generated: 2026-04-15T12:51:38.457Z
Ticks per archetype: 10000 (~1.67 game-hours)
Archetypes: 9
Total simulated ticks: 90000
Simulation wall time: 275 ms

## Threshold Results

| Metric | Value | Target | Result |
|--------|-------|--------|--------|
| Unique-to-1-archetype methods | 29 | >= 100 | FAIL |
| Average route similarity | 18.2% | <= 40% | PASS |
| Max total level across archetypes | 265 | < 2100 | PASS |
| Every archetype hits transformative BP | no | yes | FAIL |
| Archetypes missing transformative | AFK Andy, Skiller |  |  |

## Cross-Archetype Summary

- Methods used by all 9 archetypes: 0
- Methods used by exactly 1 archetype: 29
- Methods used by 2-8 archetypes: 30
- Average route similarity (Jaccard): 18.2%
- Min / Max pairwise similarity: 0.0% / 53.8%

### Overlap Matrix (Jaccard %)

| From \ To | Efficiency Andy | AFK Andy | Money Maker | PvM Rusher | Skiller | Quester | Ironman | Candy Looper | Casual |
|---|---|---|---|---|---|---|---|---|---|
| Efficiency Andy | -- | 0% | 6% | 0% | 0% | 0% | 0% | 2% | 0% |
| AFK Andy | 0% | -- | 0% | 0% | 0% | 0% | 0% | 2% | 6% |
| Money Maker | 6% | 0% | -- | 39% | 39% | 53% | 24% | 30% | 43% |
| PvM Rusher | 0% | 0% | 39% | -- | 10% | 54% | 31% | 14% | 26% |
| Skiller | 0% | 0% | 39% | 10% | -- | 35% | 20% | 22% | 29% |
| Quester | 0% | 0% | 53% | 54% | 35% | -- | 31% | 19% | 47% |
| Ironman | 0% | 0% | 24% | 31% | 20% | 31% | -- | 14% | 32% |
| Candy Looper | 2% | 2% | 30% | 14% | 22% | 19% | 14% | -- | 26% |
| Casual | 0% | 6% | 43% | 26% | 29% | 47% | 32% | 26% | -- |

### Universally-used Methods

_None — no method was picked by all archetypes. That is genuinely surprising._

### Methods Used By Only One Archetype (first 30)

- cooking/Hunters' Grove Game Preparations (veilwood_hunters_grove_cooking)
- prayer/Regular Bones at Altar (prayer_bones_altar)
- prayer/[Quirky] Place a Revenant Ward (quirky_wilds_revenant_ward)
- agility/[Quirky] Climb the Fallen Statue (quirky_wilds_fallen_statue_climb)
- prayer/Chaos Altar (Wilderness) (prayer_wilds_chaos_altar)
- attack/[Quirky] Kick the Scarecrow (quirky_heartlands_scarecrow_kick)
- crafting/Glass-Leaf Knapping (veilwood_glass_leaf_knapping)
- magic/[Quirky] Read the Spell Tome (quirky_heartlands_library_study)
- smithing/Bronze Bar Smelting (smithing_bronze_bars)
- fletching/The Splinter — Bone-Shaft Arrows (boneyard_splinter_bone_shaft)
- slayer/Heartlands Novice Slayer (heartlands_slayer_turael)
- attack/[Quirky] Guard Practice Dummy (quirky_heartlands_practice_dummy)
- defence/Sand Crab Defence (defence_sand_crabs_def)
- strength/[Quirky] The Village Pump (quirky_heartlands_draynor_pump)
- crafting/[Quirky] Masonry Wall Chiseling (quirky_heartlands_market_chisel)
- herblore/Apothecary Potion Mixing (heartlands_apothecary_mixing)
- fishing/Shrimp Netting (fishing_shrimp)
- ranged/Ogre Safespot (ranged_safe_spot_ogres)
- hitpoints/Dreamless Rest at the Threshold (inkweald_dreamless_rest_hp)
- crafting/Gold Jewelry (crafting_gold_jewelry)
- magic/Burnt Library Scroll-Reading (boneyard_burnt_library_reading)
- hitpoints/Infirmary Practice Ward (heartlands_infirmary_patient)
- magic/Curse / Low Alchemy (magic_curse_alching)
- herblore/The Backwards Garden — Reverse-Decay Brewing (inkweald_backwards_garden_herblore)
- hunter/Birdhouse Runs (hunter_birdhouse_runs)
- crafting/Leather Crafting (crafting_leather)
- construction/Carpenter Apprentice Work (heartlands_carpenter_apprentice)
- herblore/Boil Pit Heat-Distillation (boneyard_boil_pit_distillation)
- slayer/Wilderness Slayer (slayer_wilds_tasks)

## Per-Archetype Reports

### Efficiency Andy

_Max XP/hr. Follows the optimal meta. No distractions._

- Total level: **99** (maxed skills: 0/23)
- Methods: 1 used (0 unique to this archetype, 1 shared)
- Breakpoints: 4 total (1 transformative, 1 major)
- Areas entered: 1 | Regions visited: heartlands, the_wilds
- Method switches: 0 | Quests completed: 0
- Monster kills (est): 0 across 0 monster types
- Divergence score: 99.0% (avg similarity to others: 1.0%)
- Stuck: no
- Prestige goal (heartlands): The Grand Feast — not reached

**Final Skill Levels**

| Skill | Level | Skill | Level | Skill | Level |
|---|---|---|---|---|---|
| attack | 1 | strength | 1 | defence | 1 |
| hitpoints | 10 | ranged | 1 | prayer | 68 |
| magic | 1 | runecrafting | 1 | construction | 1 |
| agility | 1 | herblore | 1 | thieving | 1 |
| crafting | 1 | fletching | 1 | slayer | 1 |
| hunter | 1 | mining | 1 | smithing | 1 |
| fishing | 1 | cooking | 1 | firemaking | 1 |
| woodcutting | 1 | farming | 1 |  |  |

**Top Candy Moments**

- tick 0: Entered high-stakes method Chaos Altar Prayer
- tick 794: All three protection prayers. This is THE breakpoint. Bosses that were impossible become farmable. The game permanently changes.

### AFK Andy

_Only afk/low attention methods. Playing while watching TV._

- Total level: **89** (maxed skills: 0/23)
- Methods: 2 used (1 unique to this archetype, 1 shared)
- Breakpoints: 1 total (0 transformative, 0 major)
- Areas entered: 2 | Regions visited: heartlands, boneyard_salted_cookery, veilwood_hunters_grove
- Method switches: 1 | Quests completed: 0
- Monster kills (est): 0 across 0 monster types
- Divergence score: 99.1% (avg similarity to others: 0.9%)
- Stuck: no
- Prestige goal (heartlands): The Grand Feast — not reached

**Final Skill Levels**

| Skill | Level | Skill | Level | Skill | Level |
|---|---|---|---|---|---|
| attack | 1 | strength | 1 | defence | 1 |
| hitpoints | 10 | ranged | 1 | prayer | 1 |
| magic | 1 | runecrafting | 1 | construction | 1 |
| agility | 1 | herblore | 1 | thieving | 1 |
| crafting | 1 | fletching | 1 | slayer | 1 |
| hunter | 1 | mining | 1 | smithing | 1 |
| fishing | 1 | cooking | 58 | firemaking | 1 |
| woodcutting | 1 | farming | 1 |  |  |

### Money Maker

_Max gp/hr. Profit-weighted. Will buy XP when needed._

- Total level: **200** (maxed skills: 0/23)
- Methods: 17 used (0 unique to this archetype, 17 shared)
- Breakpoints: 11 total (1 transformative, 3 major)
- Areas entered: 6 | Regions visited: heartlands, the_wilds, boneyard_veiled_grave, boneyard_smelters_bones, inkweald_half_light_range, boneyard_sun_bleach_pits, inkweald_backseam_camps
- Method switches: 54 | Quests completed: 3
- Monster kills (est): 289 across 5 monster types
- Divergence score: 70.7% (avg similarity to others: 29.3%)
- Stuck: no
- Prestige goal (heartlands): The Grand Feast — not reached

**Final Skill Levels**

| Skill | Level | Skill | Level | Skill | Level |
|---|---|---|---|---|---|
| attack | 4 | strength | 1 | defence | 1 |
| hitpoints | 10 | ranged | 4 | prayer | 43 |
| magic | 46 | runecrafting | 5 | construction | 5 |
| agility | 10 | herblore | 5 | thieving | 1 |
| crafting | 4 | fletching | 1 | slayer | 1 |
| hunter | 1 | mining | 15 | smithing | 15 |
| fishing | 1 | cooking | 13 | firemaking | 11 |
| woodcutting | 1 | farming | 2 |  |  |

**Top Candy Moments**

- tick 0: Entered high-stakes method Chaos Altar Prayer
- tick 2832: All three protection prayers. This is THE breakpoint. Bosses that were impossible become farmable. The game permanently changes.

### PvM Rusher

_Rush combat + prayer + herblore. Wants to boss ASAP._

- Total level: **134** (maxed skills: 0/23)
- Methods: 8 used (0 unique to this archetype, 8 shared)
- Breakpoints: 9 total (1 transformative, 3 major)
- Areas entered: 1 | Regions visited: heartlands, inkweald_half_light_range
- Method switches: 25 | Quests completed: 2
- Monster kills (est): 370 across 5 monster types
- Divergence score: 78.3% (avg similarity to others: 21.7%)
- Stuck: no
- Prestige goal (heartlands): The Grand Feast — not reached

**Final Skill Levels**

| Skill | Level | Skill | Level | Skill | Level |
|---|---|---|---|---|---|
| attack | 5 | strength | 1 | defence | 1 |
| hitpoints | 10 | ranged | 4 | prayer | 45 |
| magic | 48 | runecrafting | 1 | construction | 1 |
| agility | 1 | herblore | 5 | thieving | 1 |
| crafting | 1 | fletching | 1 | slayer | 1 |
| hunter | 1 | mining | 1 | smithing | 1 |
| fishing | 1 | cooking | 1 | firemaking | 1 |
| woodcutting | 1 | farming | 1 |  |  |

**Top Candy Moments**

- tick 3219: All three protection prayers. This is THE breakpoint. Bosses that were impossible become farmable. The game permanently changes.

### Skiller

_No combat ever. Pure skilling account. Level 3 hp forever._

- Total level: **155** (maxed skills: 0/23)
- Methods: 15 used (0 unique to this archetype, 15 shared)
- Breakpoints: 5 total (0 transformative, 1 major)
- Areas entered: 4 | Regions visited: heartlands, the_wilds, boneyard_smelters_bones, boneyard_sun_bleach_pits, inkweald_backseam_camps
- Method switches: 41 | Quests completed: 1
- Monster kills (est): 0 across 0 monster types
- Divergence score: 80.6% (avg similarity to others: 19.4%)
- Stuck: no
- Prestige goal (heartlands): The Grand Feast — not reached

**Final Skill Levels**

| Skill | Level | Skill | Level | Skill | Level |
|---|---|---|---|---|---|
| attack | 1 | strength | 1 | defence | 1 |
| hitpoints | 10 | ranged | 1 | prayer | 1 |
| magic | 1 | runecrafting | 6 | construction | 5 |
| agility | 12 | herblore | 5 | thieving | 3 |
| crafting | 4 | fletching | 1 | slayer | 1 |
| hunter | 3 | mining | 44 | smithing | 15 |
| fishing | 4 | cooking | 19 | firemaking | 11 |
| woodcutting | 1 | farming | 5 |  |  |

**Top Candy Moments**

- tick 3100: Entered high-stakes method Wilderness Pure Essence

### Quester

_Quest cape run. Prioritizes skill levels that quests need._

- Total level: **183** (maxed skills: 0/23)
- Methods: 12 used (0 unique to this archetype, 12 shared)
- Breakpoints: 11 total (1 transformative, 3 major)
- Areas entered: 2 | Regions visited: heartlands, the_wilds, boneyard_smelters_bones
- Method switches: 38 | Quests completed: 2
- Monster kills (est): 204 across 4 monster types
- Divergence score: 70.1% (avg similarity to others: 29.9%)
- Stuck: no
- Prestige goal (heartlands): The Grand Feast — not reached

**Final Skill Levels**

| Skill | Level | Skill | Level | Skill | Level |
|---|---|---|---|---|---|
| attack | 2 | strength | 1 | defence | 1 |
| hitpoints | 10 | ranged | 1 | prayer | 43 |
| magic | 43 | runecrafting | 1 | construction | 1 |
| agility | 11 | herblore | 5 | thieving | 1 |
| crafting | 4 | fletching | 1 | slayer | 1 |
| hunter | 1 | mining | 15 | smithing | 15 |
| fishing | 4 | cooking | 19 | firemaking | 1 |
| woodcutting | 1 | farming | 1 |  |  |

**Top Candy Moments**

- tick 4519: All three protection prayers. This is THE breakpoint. Bosses that were impossible become farmable. The game permanently changes.

### Ironman

_Cannot buy inputs. Must self-supply via own skills._

- Total level: **146** (maxed skills: 0/23)
- Methods: 9 used (0 unique to this archetype, 9 shared)
- Breakpoints: 9 total (1 transformative, 3 major)
- Areas entered: 1 | Regions visited: heartlands, veilwood_whisper_glade
- Method switches: 14 | Quests completed: 1
- Monster kills (est): 83 across 4 monster types
- Divergence score: 81.1% (avg similarity to others: 18.9%)
- Stuck: no
- Prestige goal (heartlands): The Grand Feast — not reached

**Final Skill Levels**

| Skill | Level | Skill | Level | Skill | Level |
|---|---|---|---|---|---|
| attack | 1 | strength | 1 | defence | 1 |
| hitpoints | 10 | ranged | 1 | prayer | 43 |
| magic | 34 | runecrafting | 1 | construction | 1 |
| agility | 10 | herblore | 1 | thieving | 1 |
| crafting | 1 | fletching | 1 | slayer | 1 |
| hunter | 1 | mining | 30 | smithing | 1 |
| fishing | 1 | cooking | 1 | firemaking | 1 |
| woodcutting | 1 | farming | 2 |  |  |

**Top Candy Moments**

- tick 150: Discovered low-XP flavor method [Quirky] Listen to What the Forest Said (magic)
- tick 150: Quirky interaction: [Quirky] Listen to What the Forest Said
- tick 8769: All three protection prayers. This is THE breakpoint. Bosses that were impossible become farmable. The game permanently changes.

### Candy Looper

_Distracted. Random-weighted picks. "Ooh a piece of candy."_

- Total level: **265** (maxed skills: 0/23)
- Methods: 56 used (28 unique to this archetype, 28 shared)
- Breakpoints: 9 total (1 transformative, 2 major)
- Areas entered: 16 | Regions visited: heartlands, veilwood_whisper_glade, veilwood_threshold_wardens, boneyard_salted_cookery, the_wilds, veilwood_glass_leaf_glades, inkweald_backseam_camps, boneyard_sun_bleach_pits, veilwood_range, boneyard_the_splinter, boneyard_smelters_bones, inkweald_half_light_range, boneyard_veiled_grave, inkweald_threshold_of_names, boneyard_burnt_library, inkweald_backwards_garden, boneyard_boil_pits
- Method switches: 191 | Quests completed: 8
- Monster kills (est): 59 across 20 monster types
- Divergence score: 83.7% (avg similarity to others: 16.3%)
- Stuck: no
- Prestige goal (heartlands): The Grand Feast — not reached

**Final Skill Levels**

| Skill | Level | Skill | Level | Skill | Level |
|---|---|---|---|---|---|
| attack | 6 | strength | 1 | defence | 3 |
| hitpoints | 13 | ranged | 9 | prayer | 44 |
| magic | 28 | runecrafting | 9 | construction | 12 |
| agility | 7 | herblore | 20 | thieving | 3 |
| crafting | 14 | fletching | 5 | slayer | 4 |
| hunter | 12 | mining | 7 | smithing | 15 |
| fishing | 2 | cooking | 24 | firemaking | 19 |
| woodcutting | 1 | farming | 7 |  |  |

**Top Candy Moments**

- tick 50: Discovered low-XP flavor method [Quirky] Listen to What the Forest Said (magic)
- tick 50: Quirky interaction: [Quirky] Listen to What the Forest Said
- tick 250: Discovered low-XP flavor method [Quirky] Place a Revenant Ward (prayer)
- tick 250: Entered high-stakes method [Quirky] Place a Revenant Ward
- tick 250: Quirky interaction: [Quirky] Place a Revenant Ward

### Casual

_Plays 1-2 hour sessions. Won't touch max-attention content._

- Total level: **175** (maxed skills: 0/23)
- Methods: 16 used (0 unique to this archetype, 16 shared)
- Breakpoints: 10 total (1 transformative, 2 major)
- Areas entered: 6 | Regions visited: heartlands, veilwood_threshold_wardens, boneyard_salted_cookery, boneyard_smelters_bones, veilwood_range, boneyard_veiled_grave, inkweald_threshold_of_names
- Method switches: 51 | Quests completed: 3
- Monster kills (est): 201 across 5 monster types
- Divergence score: 73.7% (avg similarity to others: 26.3%)
- Stuck: no
- Prestige goal (heartlands): The Grand Feast — not reached

**Final Skill Levels**

| Skill | Level | Skill | Level | Skill | Level |
|---|---|---|---|---|---|
| attack | 3 | strength | 1 | defence | 1 |
| hitpoints | 10 | ranged | 3 | prayer | 43 |
| magic | 42 | runecrafting | 1 | construction | 1 |
| agility | 10 | herblore | 5 | thieving | 1 |
| crafting | 4 | fletching | 1 | slayer | 1 |
| hunter | 1 | mining | 15 | smithing | 15 |
| fishing | 4 | cooking | 9 | firemaking | 1 |
| woodcutting | 1 | farming | 2 |  |  |

**Top Candy Moments**

- tick 7320: All three protection prayers. This is THE breakpoint. Bosses that were impossible become farmable. The game permanently changes.

## Verdict

**2/4 thresholds pass.**

Review failing thresholds above. Degeneracy or missing content may need attention.
