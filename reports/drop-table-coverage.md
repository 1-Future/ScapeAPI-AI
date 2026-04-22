# Drop Table Coverage Audit

**Generated:** 2026-04-22  
**Scope:** every monster definition across Scape bestiary bibles, boss bibles, and code-side monster packs.  
**Sources:** `data/drop-tables.json` (36 design tables), `data/bestiary/*.json` (9 region bibles, 120 monsters), `data/bosses.json` (15 boss bibles), `src/content/aelgard/*.js` + `src/atoms/definitions/monsters*.js` (code-side inline definitions).

This audit is READ-ONLY: no source code or data files were modified.

## Executive summary (~300 words)

Scape ships **947 unique monster records** across every available source (120 bestiary bibles, 15 boss bibles, 812 code-side NPC definitions). Against the 36 design drop tables in `data/drop-tables.json`, coverage is **thin at the design-bible layer and uneven at the runtime layer**:

* **3.8%** of monsters (36 / 947) are anchored to one of the 36 curated design tables. This matches the number of tables exactly — every table is used once, so design coverage has not been expanded since the burn-v2 itemisation layer was authored.
* **50.7%** of monsters (480 / 947) carry inline `drops`/`main`/`tertiary` arrays in code. The runtime engine will return something on kill, but those drops are not in the design bible.
* **46.9%** of monsters (444 / 947) have **no drops whatsoever** — killing them is a zero-reward action. This is the Pillar-4 hole.

**Bestiary:** only **30.0%** (36 / 120) of bibled monsters reference a table that actually exists in `drop-tables.json`; a further **70%** (84 / 120) reference `dt_*` ids that are **dangling** (see §7.2).

**Per-region best → worst served:** Sootworks 78%, Heartlands/Moryskah 75%, Boneyard 71%, Inkweald 66%, Veilwood 65%, Wilds 64%, Saltbrine 61%, Glass Desert 60%. Every region has ≥9 monsters with zero drops.

**Pillar-4 risk:** 15 items are shared across ≥5 rare slots — `Blood rune` (35 sources), `Death rune` (24), `Soul rune` (19), `Grimy ranarr` (11), `Runite bar` (11), `Wrath rune` (7). The generic runes are the biggest degenerate-loot risk.

**Boss coll-log readiness: 136 / 156 (87.2%)** bosses drop at least one unique rare or have a design table. 20 bosses — mostly ToA wardens, fortress commanders, and combat-challenge minibosses — cannot host a coll-log category until drops are assigned.

**Top v0.9 priority:** fill the 84 dangling `dt_*` references before touching raid minions. That single task lifts bestiary coverage from 30% to 100%.

## 1. Summary: monster count by drop-source category

| Category | Count | % |
|---|---:|---:|
| **Total monsters discovered** | 947 | 100.0% |
| Has drop table (one of 36 design tables or `dt_*` linked via `monster_id`) | 36 | 3.8% |
| Has inline drops (code-side `drops`/`main`/`tertiary` array with entries) | 480 | 50.7% |
| Has BOTH (table-linked AND inline, i.e., runtime + design bible) | 13 | 1.4% |
| **No drops at all** | 444 | 46.9% |

**By source (diagnostic):**

| Source | Count |
|---|---:|
| `code:mob` | 281 |
| `code:defineNpc` | 220 |
| `code:atoms` | 158 |
| `bestiary` | 120 |
| `code:mega` | 82 |
| `code:boss` | 71 |
| `bosses.json` | 15 |

## 2. Coverage ratio

* **Bestiary bibles:** 36 / 120 = **30.0%** of bestiary monsters reference one of the 36 design drop tables.  
* **Bestiary (any drops):** 51 / 120 = 42.5% have at least a table OR an inline code drop attached.  
* **Code-side monsters (inline drops):** 437 / 812 = **53.8%** of code-defined monsters have inline `drops`/`main`/`tertiary` entries.  
* **No drops (any source):** 444 / 947 = **46.9%** of the entire roster has zero attached drops.

## 3. Per-region coverage (worst-served first)

| Region | Total | Has table | Has inline | No drops | Bosses | % with any drops |
|---|---:|---:|---:|---:|---:|---:|
| `(combat-challenge)` | 5 | 0 | 0 | 5 | 5 | 0.0% |
| `(unknown/atoms)` | 158 | 0 | 0 | 158 | 0 | 0.0% |
| `(unknown)` | 146 | 0 | 77 | 69 | 21 | 52.7% |
| `glass_desert` | 35 | 2 | 20 | 14 | 4 | 60.0% |
| `(raid/multi-region)` | 189 | 0 | 114 | 75 | 84 | 60.3% |
| `saltbrine` | 43 | 3 | 23 | 17 | 5 | 60.5% |
| `wilds` | 36 | 6 | 19 | 13 | 2 | 63.9% |
| `(dungeon/multi-region)` | 36 | 0 | 23 | 13 | 0 | 63.9% |
| `veilwood` | 40 | 4 | 23 | 14 | 3 | 65.0% |
| `inkweald` | 41 | 3 | 25 | 14 | 7 | 65.9% |
| `boneyard` | 35 | 3 | 23 | 10 | 3 | 71.4% |
| `heartlands` | 36 | 6 | 25 | 9 | 5 | 75.0% |
| `moryskah` | 44 | 5 | 31 | 11 | 5 | 75.0% |
| `sootworks` | 41 | 4 | 28 | 9 | 6 | 78.0% |
| `(slayer-tower)` | 62 | 0 | 49 | 13 | 6 | 79.0% |

## 4. Shared-rare violations (Marstead Pillar 4)

Rare and very-rare drop slots should be **unique** to the monster or serve as **reagents**. An item dropped by 5+ distinct monsters violates Pillar 4 — the rare loses identity, and the kill becomes degenerate.

**15 items violate (5+ distinct monster sources).** Top offenders:

| Item | # sources | Example sources |
|---|---:|---|
| `Blood rune` | 35 | alchemical_hydra, bloodveld, brutal_red_dragon, calamity_boss, … |
| `Death rune` | 24 | abyssal_demon, cave_kraken, demonic_gorilla, greater_demon, … |
| `Soul rune` | 19 | calamity_boss, colosseum_champion, commander_zelot_heartlands, corporeal_beast, … |
| `Runite bar` | 11 | coa_tekton, duke_sucellus_sootworks, forge_dragon_veldrak, fortress_core, … |
| `Grimy ranarr` | 11 | bryophyta_heartlands, chaos_druid, flesh_crawler, giant_mole, … |
| `Wrath rune` | 7 | calamity_boss, coa_great_crystal_serpent, colosseum_champion, dream_final_boss, … |
| `Wilds warlord skull` | 6 | mega_wild_black_stone_warden, mega_wild_bone_colossus, mega_wild_greater_chaos_demon, mega_wild_revenant_dragon, … |
| `Corrupted emblem` | 6 | mega_wild_blood_reaper, mega_wild_greater_chaos_demon, mega_wild_revenant_dragon, mega_wild_skull_priestess, … |
| `Lucid essence` | 6 | dream_dragon, hollow_choir_conductor, inkweald_muse, lucid_crawler, … |
| `Desert agate` | 5 | mega_bone_canopic_guardian, mega_bone_dust_tyrant, mega_bone_greater_mummy, mega_bone_pharaoh_lich, … |
| `Chaos-touched core` | 5 | mega_wild_chaos_demon, mega_wild_chaos_touched_giant, mega_wild_chaos_touched_troll, mega_wild_greater_chaos_demon, … |
| `Forsaken relic` | 5 | mega_wild_black_stone_warden, mega_wild_blood_reaper, mega_wild_bone_colossus, mega_wild_fallen_paladin, … |
| `Raw shark` | 5 | mogre, sea_troll, tempoross_saltbrine, the_leviathan_saltbrine, … |
| `Uncut dragonstone` | 5 | mimic_clue, revenant_dark_beast, revenant_dragon, revenant_knight, … |
| `Refracted essence` | 5 | coa_great_crystal_serpent, crystal_dragon, prism_wizard, the_glass_tyrant, … |

## 5. Boss collection-log readiness

Collection logs require each boss to drop at least one **unique** rare. A boss with only shared loot cannot have a coll-log category.

* **Total bosses discovered (code `tags:[boss]` or bosses.json):** 156  
* **Coll-log READY (has ≥1 unique rare or tertiary drop, OR a dedicated design-table row):** 136  
* **NOT READY (no unique drop defined):** 20  
* Readiness rate: **87.2%**

**Bosses MISSING a unique (top 30 by name):**

| Boss ID | Name | Region | Source file |
|---|---|---|---|
| `(anon)` | (unknown) | (unknown) | bosses-expanded.js |
| `crystal_spider_queen` | Crystal spider queen | glass_desert | monsters-blitz.js |
| `(anon)` | (unknown) | (raid/multi-region) | raids-bosses-mega.js |
| `skotizo_moryskah` | Skotizo | moryskah | raids-bosses-mega.js |
| `(anon)` | (unknown) | (raid/multi-region) | raids-mega1.js |
| `(anon)` | (unknown) | (raid/multi-region) | raids-mega2.js |
| `twin_wyrm_beta` | Twin Wyrm (Beta) | (combat-challenge) | combat-challenges.js |
| `duran_younger` | Younger Duran | (combat-challenge) | combat-challenges.js |
| `famine` | Famine | (combat-challenge) | combat-challenges.js |
| `storm_twin_rain` | Tsunara | (combat-challenge) | combat-challenges.js |
| `the_destroyer_boss` | The Destroyer | (combat-challenge) | combat-challenges.js |
| `toa_warden_elidinis` | Elidinis Warden | (raid/multi-region) | raids-bosses-mega.js |
| `toa_warden_tumeken` | Tumeken Warden | (raid/multi-region) | raids-bosses-mega.js |
| `toa_warden_fused` | Warden of the Tombs | (raid/multi-region) | raids-bosses-mega.js |
| `fortress_commander_melee` | Commander Kragg | (raid/multi-region) | raids-mega2.js |
| `fortress_commander_ranged` | Commander Vex | (raid/multi-region) | raids-mega2.js |
| `fortress_commander_mage` | Commander Morvath | (raid/multi-region) | raids-mega2.js |
| `calamity_corruptor` | Calamity Corruptor | (raid/multi-region) | raids-mega2.js |
| `grotto_mycelium` | The Mycelium | (raid/multi-region) | raids-mega2.js |
| `tos_verzik` | Verzik Vitur, Queen of Shadows | (raid/multi-region) | raids.js |

## 6. Priority expansion: top 100 monsters needing drop tables for v0.9 coll-log support

Selection heuristics, in order:

1. Bestiary monsters whose `drop_table_id` references a table not present in `data/drop-tables.json` (dangling reference).
2. Bestiary monsters with no `drop_table_id` at all.
3. High-combat code monsters with neither a design table nor inline drops.

| # | ID | Name | Region | CB | Reason |
|---:|---|---|---|---:|---|
| 1 | `mega_wild_lava_dragon` | Lava dragon | wilds | 252 | drop_table_id dt_wild_lava_dragon not in 36 design tables |
| 2 | `mega_wild_black_stone_warden` | Black-stone warden | wilds | 240 | drop_table_id dt_wild_black_stone_warden not in 36 design tables |
| 3 | `mega_wild_venenatis_spider` | Venom spider | wilds | 220 | drop_table_id dt_wild_venenatis_spider not in 36 design tables |
| 4 | `wild_chaos_fanatic` | Chaos fanatic | wilds | 202 | drop_table_id dt_wild_chaos_fanatic not in 36 design tables |
| 5 | `wild_frost_drake` | Frost drake | wilds | 145 | drop_table_id dt_wild_frost_drake not in 36 design tables |
| 6 | `mega_glass_dune_scarab_queen` | Dune scarab queen | glass_desert | 142 | drop_table_id dt_glass_dune_scarab_queen not in 36 design tables |
| 7 | `glass_glasshand_golem` | Glasshand golem | glass_desert | 124 | drop_table_id dt_glass_glasshand_golem not in 36 design tables |
| 8 | `mega_bone_sand_wyvern` | Sand wyvern | boneyard | 120 | drop_table_id dt_bone_sand_wyvern not in 36 design tables |
| 9 | `mega_glass_mirage_knight` | Mirage knight | glass_desert | 115 | drop_table_id dt_glass_mirage_knight not in 36 design tables |
| 10 | `mega_veil_fey_knight` | Fey knight | veilwood | 110 | drop_table_id dt_veil_fey_knight not in 36 design tables |
| 11 | `mega_salt_kraken_scout` | Kraken scout | saltbrine | 104 | drop_table_id dt_salt_kraken_scout not in 36 design tables |
| 12 | `mega_glass_mirror_fiend` | Mirror fiend | glass_desert | 102 | drop_table_id dt_glass_mirror_fiend not in 36 design tables |
| 13 | `mega_ink_memory_hag` | Memory hag | inkweald | 96 | drop_table_id dt_ink_memory_hag not in 36 design tables |
| 14 | `mega_veil_spore_drake` | Spore drake | veilwood | 96 | drop_table_id dt_veil_spore_drake not in 36 design tables |
| 15 | `mega_wild_rogue_magus` | Rogue magus | wilds | 96 | drop_table_id dt_wild_rogue_magus not in 36 design tables |
| 16 | `mega_soot_dust_devil` | Dust devil | sootworks | 93 | drop_table_id dt_soot_dust_devil not in 36 design tables |
| 17 | `mega_glass_prism_elemental` | Prism elemental | glass_desert | 90 | drop_table_id dt_glass_prism_elemental not in 36 design tables |
| 18 | `glass_crystal_serpent` | Crystal serpent | glass_desert | 88 | drop_table_id dt_glass_crystal_serpent not in 36 design tables |
| 19 | `mega_ink_nightmare_spawn` | Nightmare spawn | inkweald | 88 | drop_table_id dt_ink_nightmare_spawn not in 36 design tables |
| 20 | `mega_soot_clockwork_abomination` | Clockwork abomination | sootworks | 88 | drop_table_id dt_soot_clockwork_abomination not in 36 design tables |
| 21 | `mega_veil_veil_warden` | Veil warden | veilwood | 88 | drop_table_id dt_veil_veil_warden not in 36 design tables |
| 22 | `mega_mor_werewolf_stalker` | Werewolf stalker | moryskah | 85 | drop_table_id dt_mor_werewolf_stalker not in 36 design tables |
| 23 | `mega_ink_inkblood_serpent` | Inkblood serpent | inkweald | 82 | drop_table_id dt_ink_inkblood_serpent not in 36 design tables |
| 24 | `soot_boiler_spectre` | Boiler spectre | sootworks | 82 | drop_table_id dt_soot_boiler_spectre not in 36 design tables |
| 25 | `mega_glass_sand_wraith` | Sand wraith | glass_desert | 80 | drop_table_id dt_glass_sand_wraith not in 36 design tables |
| 26 | `mega_veil_veilgrove_hag` | Veilgrove hag | veilwood | 80 | drop_table_id dt_veil_veilgrove_hag not in 36 design tables |
| 27 | `wild_pvp_hound` | PvP hound (revenant) | wilds | 80 | drop_table_id dt_wild_pvp_hound not in 36 design tables |
| 28 | `ink_scholar_of_inkblot` | Scholar of Inkblot | inkweald | 78 | drop_table_id dt_ink_scholar_of_inkblot not in 36 design tables |
| 29 | `mega_wild_bone_thrower` | Bone thrower | wilds | 78 | drop_table_id dt_wild_bone_thrower not in 36 design tables |
| 30 | `mega_bone_mummy_guardian` | Mummy guardian | boneyard | 76 | drop_table_id dt_bone_mummy_guardian not in 36 design tables |
| 31 | `mega_salt_coral_golem` | Coral golem | saltbrine | 76 | drop_table_id dt_salt_coral_golem not in 36 design tables |
| 32 | `mega_soot_forge_wraith` | Forge wraith | sootworks | 72 | drop_table_id dt_soot_forge_wraith not in 36 design tables |
| 33 | `mega_veil_moonlight_panther` | Moonlight panther | veilwood | 72 | drop_table_id dt_veil_moonlight_panther not in 36 design tables |
| 34 | `salt_merman_scout` | Merman scout | saltbrine | 70 | drop_table_id dt_salt_merman_scout not in 36 design tables |
| 35 | `glass_sunstalker_bird` | Sunstalker | glass_desert | 68 | drop_table_id dt_glass_sunstalker_bird not in 36 design tables |
| 36 | `mega_ink_echo_wraith` | Echo wraith | inkweald | 68 | drop_table_id dt_ink_echo_wraith not in 36 design tables |
| 37 | `mega_mor_rust_wraith` | Rust wraith | moryskah | 68 | drop_table_id dt_mor_rust_wraith not in 36 design tables |
| 38 | `mega_soot_rust_elemental` | Rust elemental | sootworks | 68 | drop_table_id dt_soot_rust_elemental not in 36 design tables |
| 39 | `mega_mor_crypt_howler` | Crypt howler | moryskah | 66 | drop_table_id dt_mor_crypt_howler not in 36 design tables |
| 40 | `mega_bone_glass_crawler` | Glass crawler | boneyard | 65 | drop_table_id dt_bone_glass_crawler not in 36 design tables |
| 41 | `mor_bell_hag` | Bell hag | moryskah | 64 | drop_table_id dt_mor_bell_hag not in 36 design tables |
| 42 | `veil_glimstalker` | Glimstalker | veilwood | 64 | drop_table_id dt_veil_glimstalker not in 36 design tables |
| 43 | `bone_nomad_warrior` | Nomad warrior | boneyard | 62 | drop_table_id dt_bone_nomad_warrior not in 36 design tables |
| 44 | `mega_salt_brine_wraith` | Brine wraith | saltbrine | 62 | drop_table_id dt_salt_brine_wraith not in 36 design tables |
| 45 | `mega_heart_church_gargoyle` | Church gargoyle | heartlands | 60 | drop_table_id dt_heart_church_gargoyle not in 36 design tables |
| 46 | `ink_dream_wolf` | Dream wolf | inkweald | 60 | drop_table_id dt_ink_dream_wolf not in 36 design tables |
| 47 | `mega_bone_salt_stalker` | Salt stalker | boneyard | 58 | drop_table_id dt_bone_salt_stalker not in 36 design tables |
| 48 | `salt_lighthouse_keeper_ghost` | Lighthouse-keeper ghost | saltbrine | 56 | drop_table_id dt_salt_lighthouse_keeper_ghost not in 36 design tables |
| 49 | `mega_soot_cinder_golem` | Cinder golem | sootworks | 56 | drop_table_id dt_soot_cinder_golem not in 36 design tables |
| 50 | `mega_veil_corrupted_dryad` | Corrupted dryad | veilwood | 54 | drop_table_id dt_veil_corrupted_dryad not in 36 design tables |
| 51 | `bone_mirage_warrior` | Mirage warrior | boneyard | 52 | drop_table_id dt_bone_mirage_warrior not in 36 design tables |
| 52 | `heart_bellman_shade` | Bellman shade | heartlands | 52 | drop_table_id dt_heart_bellman_shade not in 36 design tables |
| 53 | `mega_mor_fenbolter` | Fenbolter | moryskah | 52 | drop_table_id dt_mor_fenbolter not in 36 design tables |
| 54 | `glass_nomad_glassmaker` | Nomad glassmaker | glass_desert | 50 | drop_table_id dt_glass_nomad_glassmaker not in 36 design tables |
| 55 | `veil_grotto_nymph` | Grotto nymph | veilwood | 50 | drop_table_id dt_veil_grotto_nymph not in 36 design tables |
| 56 | `mega_salt_drowned_crew` | Drowned crew | saltbrine | 48 | drop_table_id dt_salt_drowned_crew not in 36 design tables |
| 57 | `soot_smog_wraith` | Smog wraith | sootworks | 48 | drop_table_id dt_soot_smog_wraith not in 36 design tables |
| 58 | `mega_ink_lucid_crawler` | Lucid crawler | inkweald | 46 | drop_table_id dt_ink_lucid_crawler not in 36 design tables |
| 59 | `mega_mor_bog_witch_acolyte` | Bog-witch acolyte | moryskah | 46 | drop_table_id dt_mor_bog_witch_acolyte not in 36 design tables |
| 60 | `mega_glass_shard_crawler` | Shard crawler | glass_desert | 44 | drop_table_id dt_glass_shard_crawler not in 36 design tables |
| 61 | `ink_quill_wraith` | Quill wraith | inkweald | 44 | drop_table_id dt_ink_quill_wraith not in 36 design tables |
| 62 | `mega_bone_dust_dweller` | Dust dweller | boneyard | 42 | drop_table_id dt_bone_dust_dweller not in 36 design tables |
| 63 | `mor_tollhouse_ghoul` | Tollhouse ghoul | moryskah | 41 | drop_table_id dt_mor_tollhouse_ghoul not in 36 design tables |
| 64 | `mega_heart_hedgerow_stalker` | Hedgerow stalker | heartlands | 40 | drop_table_id dt_heart_hedgerow_stalker not in 36 design tables |
| 65 | `mega_salt_sharkfriend_swarm` | Sharkfriend swarm | saltbrine | 40 | drop_table_id dt_salt_sharkfriend_swarm not in 36 design tables |
| 66 | `mega_mor_grave_spawn` | Grave-spawn | moryskah | 38 | drop_table_id dt_mor_grave_spawn not in 36 design tables |
| 67 | `mega_bone_tomb_robber` | Tomb robber | boneyard | 36 | drop_table_id dt_bone_tomb_robber not in 36 design tables |
| 68 | `mega_heart_plough_ghoul` | Plough ghoul | heartlands | 35 | drop_table_id dt_heart_plough_ghoul not in 36 design tables |
| 69 | `mega_salt_tavern_enforcer` | Tavern enforcer | saltbrine | 34 | drop_table_id dt_salt_tavern_enforcer not in 36 design tables |
| 70 | `mega_heart_sow_witch` | Sow-witch | heartlands | 32 | drop_table_id dt_heart_sow_witch not in 36 design tables |
| 71 | `bone_vulture_swarm` | Vulture swarm | boneyard | 30 | drop_table_id dt_bone_vulture_swarm not in 36 design tables |
| 72 | `heart_brickyard_hound` | Brickyard hound | heartlands | 30 | drop_table_id dt_heart_brickyard_hound not in 36 design tables |
| 73 | `mega_bone_bone_servant` | Bone servant | boneyard | 28 | drop_table_id dt_bone_bone_servant not in 36 design tables |
| 74 | `mor_lantern_ghost` | Lantern ghost | moryskah | 28 | drop_table_id dt_mor_lantern_ghost not in 36 design tables |
| 75 | `mega_bone_bone_scarab` | Bone scarab | boneyard | 25 | drop_table_id dt_bone_bone_scarab not in 36 design tables |
| 76 | `mega_ink_dreamer_imp` | Dreamer imp | inkweald | 24 | drop_table_id dt_ink_dreamer_imp not in 36 design tables |
| 77 | `mega_mor_coffin_crawler` | Coffin crawler | moryskah | 24 | drop_table_id dt_mor_coffin_crawler not in 36 design tables |
| 78 | `mega_heart_toll_highwayman` | Toll-road highwayman | heartlands | 22 | drop_table_id dt_heart_toll_highwayman not in 36 design tables |
| 79 | `soot_valve_gremlin` | Valve gremlin | sootworks | 22 | drop_table_id dt_soot_valve_gremlin not in 36 design tables |
| 80 | `mega_veil_pixie_swarm` | Pixie swarm | veilwood | 22 | drop_table_id dt_veil_pixie_swarm not in 36 design tables |
| 81 | `heart_marsh_ratler` | Marsh ratler | heartlands | 19 | drop_table_id dt_heart_marsh_ratler not in 36 design tables |
| 82 | `mega_soot_furnace_imp` | Furnace imp | sootworks | 18 | drop_table_id dt_soot_furnace_imp not in 36 design tables |
| 83 | `mega_salt_pier_gremlin` | Pier gremlin | saltbrine | 16 | drop_table_id dt_salt_pier_gremlin not in 36 design tables |
| 84 | `mega_heart_corn_rat` | Corn rat | heartlands | 5 | drop_table_id dt_heart_corn_rat not in 36 design tables |
| 85 | `(anon)` | (unknown) | (dungeon/multi-region) | — | code monster with no drops |
| 86 | `animated_bronze` | Animated bronze armour | (dungeon/multi-region) | — | code monster with no drops |
| 87 | `animated_iron` | Animated iron armour | (dungeon/multi-region) | — | code monster with no drops |
| 88 | `animated_steel` | Animated steel armour | (dungeon/multi-region) | — | code monster with no drops |
| 89 | `animated_mithril` | Animated mithril armour | (dungeon/multi-region) | — | code monster with no drops |
| 90 | `animated_adamant` | Animated adamant armour | (dungeon/multi-region) | — | code monster with no drops |
| 91 | `warped_terrorbird` | Warped terrorbird | (dungeon/multi-region) | — | code monster with no drops |
| 92 | `elven_shade` | Elven shade | (dungeon/multi-region) | — | code monster with no drops |
| 93 | `deep_sea_jelly` | Deep sea jelly | (dungeon/multi-region) | — | code monster with no drops |
| 94 | `abyssal_leech` | Abyssal leech | (dungeon/multi-region) | — | code monster with no drops |
| 95 | `crystal_shade` | Crystal shade | (dungeon/multi-region) | — | code monster with no drops |
| 96 | `terror` | Terror | (dungeon/multi-region) | — | code monster with no drops |
| 97 | `chaos_golem` | Chaos golem | (dungeon/multi-region) | — | code monster with no drops |
| 98 | `(anon)` | (unknown) | (unknown) | — | code monster with no drops |
| 99 | `cave_goblin` | Cave goblin | (unknown) | — | code monster with no drops |
| 100 | `cave_rat` | Cave rat | (unknown) | — | code monster with no drops |

_Total candidates_: 440. _Shown_: 100.

## 7. Diagnostic appendix

### 7.1 The 36 design tables (drop-tables.json)

* `bone`: 3 tables
* `glass`: 2 tables
* `heart`: 6 tables
* `ink`: 3 tables
* `mor`: 5 tables
* `salt`: 3 tables
* `soot`: 4 tables
* `veil`: 4 tables
* `wild`: 6 tables

### 7.2 Bestiary monsters whose drop_table_id is NOT in the 36 tables

84 dangling references.

| Bestiary monster | Refers to (not in design) |
|---|---|
| `mega_bone_bone_scarab` (Bone scarab, boneyard) | `dt_bone_bone_scarab` |
| `mega_bone_salt_stalker` (Salt stalker, boneyard) | `dt_bone_salt_stalker` |
| `mega_bone_dust_dweller` (Dust dweller, boneyard) | `dt_bone_dust_dweller` |
| `mega_bone_mummy_guardian` (Mummy guardian, boneyard) | `dt_bone_mummy_guardian` |
| `mega_bone_sand_wyvern` (Sand wyvern, boneyard) | `dt_bone_sand_wyvern` |
| `mega_bone_bone_servant` (Bone servant, boneyard) | `dt_bone_bone_servant` |
| `mega_bone_glass_crawler` (Glass crawler, boneyard) | `dt_bone_glass_crawler` |
| `mega_bone_tomb_robber` (Tomb robber, boneyard) | `dt_bone_tomb_robber` |
| `bone_mirage_warrior` (Mirage warrior, boneyard) | `dt_bone_mirage_warrior` |
| `bone_vulture_swarm` (Vulture swarm, boneyard) | `dt_bone_vulture_swarm` |
| `bone_nomad_warrior` (Nomad warrior, boneyard) | `dt_bone_nomad_warrior` |
| `mega_glass_prism_elemental` (Prism elemental, glass_desert) | `dt_glass_prism_elemental` |
| `mega_glass_sand_wraith` (Sand wraith, glass_desert) | `dt_glass_sand_wraith` |
| `mega_glass_mirage_knight` (Mirage knight, glass_desert) | `dt_glass_mirage_knight` |
| `mega_glass_shard_crawler` (Shard crawler, glass_desert) | `dt_glass_shard_crawler` |
| `mega_glass_mirror_fiend` (Mirror fiend, glass_desert) | `dt_glass_mirror_fiend` |
| `mega_glass_dune_scarab_queen` (Dune scarab queen, glass_desert) | `dt_glass_dune_scarab_queen` |
| `glass_sunstalker_bird` (Sunstalker, glass_desert) | `dt_glass_sunstalker_bird` |
| `glass_glasshand_golem` (Glasshand golem, glass_desert) | `dt_glass_glasshand_golem` |
| `glass_crystal_serpent` (Crystal serpent, glass_desert) | `dt_glass_crystal_serpent` |
| `glass_nomad_glassmaker` (Nomad glassmaker, glass_desert) | `dt_glass_nomad_glassmaker` |
| `mega_heart_corn_rat` (Corn rat, heartlands) | `dt_heart_corn_rat` |
| `mega_heart_hedgerow_stalker` (Hedgerow stalker, heartlands) | `dt_heart_hedgerow_stalker` |
| `mega_heart_plough_ghoul` (Plough ghoul, heartlands) | `dt_heart_plough_ghoul` |
| `mega_heart_toll_highwayman` (Toll-road highwayman, heartlands) | `dt_heart_toll_highwayman` |
| `mega_heart_sow_witch` (Sow-witch, heartlands) | `dt_heart_sow_witch` |
| `mega_heart_church_gargoyle` (Church gargoyle, heartlands) | `dt_heart_church_gargoyle` |
| `heart_marsh_ratler` (Marsh ratler, heartlands) | `dt_heart_marsh_ratler` |
| `heart_bellman_shade` (Bellman shade, heartlands) | `dt_heart_bellman_shade` |
| `heart_brickyard_hound` (Brickyard hound, heartlands) | `dt_heart_brickyard_hound` |
| `mega_ink_nightmare_spawn` (Nightmare spawn, inkweald) | `dt_ink_nightmare_spawn` |
| `mega_ink_lucid_crawler` (Lucid crawler, inkweald) | `dt_ink_lucid_crawler` |
| `mega_ink_echo_wraith` (Echo wraith, inkweald) | `dt_ink_echo_wraith` |
| `mega_ink_dreamer_imp` (Dreamer imp, inkweald) | `dt_ink_dreamer_imp` |
| `mega_ink_memory_hag` (Memory hag, inkweald) | `dt_ink_memory_hag` |
| `mega_ink_inkblood_serpent` (Inkblood serpent, inkweald) | `dt_ink_inkblood_serpent` |
| `ink_quill_wraith` (Quill wraith, inkweald) | `dt_ink_quill_wraith` |
| `ink_dream_wolf` (Dream wolf, inkweald) | `dt_ink_dream_wolf` |
| `ink_scholar_of_inkblot` (Scholar of Inkblot, inkweald) | `dt_ink_scholar_of_inkblot` |
| `mega_mor_grave_spawn` (Grave-spawn, moryskah) | `dt_mor_grave_spawn` |

_…and 44 more dangling._

### 7.3 Reagent-pair coverage (Pillar 3)

* 27 / 36 design tables carry at least one reagent pair (75%).
* Declared reagent_graph_summary.total_reagent_pairs: 32.
* Encounter-specific BiS weapons declared: 12.

---

_This report was generated in read-only mode. No data or source files were modified. Questions or disputes: see `data/drop-tables.json._philosophy` and `data/bestiary/*.json._comment` for the authoritative design intent._
