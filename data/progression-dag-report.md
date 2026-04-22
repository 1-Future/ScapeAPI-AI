# Progression DAG — v0.8 Burn Findings

Generated: 2026-04-22T15:12:51.110Z

## Totals

- **Nodes:** 2698
- **Edges:** 4945

### Node counts by type

| Type | Count |
|------|-------|
| training_method | 882 |
| skill_level | 559 |
| quest | 349 |
| item_unlock | 216 |
| achievement | 118 |
| area | 116 |
| spell_unlock | 74 |
| recipe | 72 |
| boss | 62 |
| npc | 47 |
| prayer_unlock | 47 |
| minigame | 47 |
| teleport | 46 |
| raid | 32 |
| shop | 25 |
| shortcut | 6 |

## Top 20 breakpoints (>=5 downstream)

A breakpoint is a node whose completion unlocks 5 or more other nodes. These are the Marstead "this changes everything" moments.

| Rank | Node | Type | Downstream | Sample unlocks |
|------|------|------|-----------:|----------------|
| 1 | `area:the_wilds` — The Wilds | area | 91 | `training_method:agility_wilds_course`, `training_method:attack_wilds_revenants`, `training_method:construction_wilds_fortifications`, `training_method:cooking_wilds_campfire`, `training_method:crafting_wilds_dragonhide_tanning` |
| 2 | `area:sootworks` — The Sootworks | area | 88 | `training_method:grandmaster_the_beggars_petition`, `training_method:grandmaster_the_cinder_kings_fall`, `training_method:grandmaster_the_deep_stone_charter`, `training_method:grandmaster_the_forgemaster_contract`, `training_method:grandmaster_the_organ_mass` |
| 3 | `area:glass_desert` — The Glass Desert | area | 54 | `training_method:glass_desert_crystal_arrow_fletching`, `training_method:glass_desert_crystal_cored_plate`, `training_method:glass_desert_crystal_corn_master_farm`, `training_method:glass_desert_crystal_hunter_falconry`, `training_method:glass_desert_crystal_hunter_slayer` |
| 4 | `area:saltbrine_reach` — Saltbrine Reach | area | 53 | `training_method:quirky_saltbrine_barnacle_scraping`, `training_method:quirky_saltbrine_bilge_pumping`, `training_method:quirky_saltbrine_knot_tying`, `training_method:quirky_saltbrine_lantern_carry`, `training_method:quirky_saltbrine_net_mending` |
| 5 | `area:heartlands` — The Heartlands | area | 50 | `training_method:grandmaster_the_coronation_of_the_quiet_king`, `training_method:grandmaster_the_crown_courier_affair`, `training_method:grandmaster_the_dragons_tithe`, `training_method:grandmaster_the_hedge_wise_gift`, `training_method:grandmaster_the_lamplighters_compact` |
| 6 | `area:moryskah` — Moryskah | area | 42 | `training_method:grandmaster_malachars_returned_correspondence`, `training_method:grandmaster_the_cabaret_season_ticket`, `training_method:grandmaster_the_coronation_of_the_quiet_count`, `training_method:grandmaster_the_ferrymans_rounds`, `training_method:grandmaster_the_hollow_choirs_descant` |
| 7 | `quest:blood_rites` — Blood Rites | quest | 41 | `achievement:moryskah_diary_hard`, `area:moryskah_barrows`, `prayer_unlock:protect_from_undead`, `quest:barrows_brothers`, `quest:blood_sanctum_key` |
| 8 | `area:inkweald` — The Inkweald | area | 33 | `training_method:inkweald_chime_markets_thieving`, `training_method:inkweald_dream_crafting`, `training_method:inkweald_dream_oak_pavilion`, `training_method:inkweald_dream_stalker_combat`, `training_method:inkweald_echo_vaults_rc` |
| 9 | `skill:hitpoints:70` — Hitpoints 70 | skill_level | 30 | `minigame:marchlands`, `quest:fight_caves`, `quest:lucid_nightmare_key`, `quest:the_last_light`, `skill:hitpoints:75` |
| 10 | `quest:desert_treasure` — Desert Treasure | quest | 27 | `achievement:boneyard_diary_elite`, `area:boneyard_pyramid`, `quest:pharaohs_reckoning_prelude`, `quest:sandglass_sage_ascension`, `quest:the_lost_god_returns` |
| 11 | `area:boneyard_wastes` — The Boneyard Wastes | area | 27 | `training_method:boneyard_bone_jewelry_work`, `training_method:boneyard_chitin_armor_assembly`, `training_method:boneyard_deathstalker_traps`, `training_method:boneyard_desert_farming`, `training_method:boneyard_desert_temple_framing` |
| 12 | `skill:attack:70` — Attack 70 | skill_level | 26 | `achievement:heartlands_diary_elite`, `achievement:moryskah_diary_elite`, `achievement:sootworks_diary_elite`, `area:moryskah_castle_malachar`, `item_unlock:abyssal_whip` |
| 13 | `quest:the_bog_witchs_bargain` — The Bog Witch's Bargain | quest | 26 | `area:moryskah`, `npc:bog_witch`, `quest:blood_rites`, `quest:rfd_moryskah`, `quest:the_bog_witchs_hunger` |
| 14 | `quest:lunar_diplomacy` — Lunar Diplomacy | quest | 24 | `achievement:veilwood_diary_elite`, `area:inkweald_lunar_plane`, `quest:gauntlet_key`, `quest:the_lost_god_returns`, `quest:the_veilwood_grandmaster_rite` |
| 15 | `skill:magic:70` — Magic 70 | skill_level | 22 | `minigame:glass_desert_shardforge`, `minigame:marchlands`, `quest:gauntlet_key`, `quest:lucid_nightmare_key`, `quest:pharaohs_reckoning_prelude` |
| 16 | `skill:prayer:60` — Prayer 60 | skill_level | 20 | `achievement:inkweald_diary_elite`, `achievement:moryskah_diary_elite`, `area:moryskah_castle_malachar`, `minigame:moryskah_reliquary_defence`, `prayer_unlock:chivalry` |
| 17 | `skill:magic:55` — Magic 55 | skill_level | 20 | `achievement:inkweald_diary_hard`, `quest:coa_key`, `quest:prism_labyrinth_key`, `quest:the_architect_of_ruin`, `quest:the_counterfeit_empire` |
| 18 | `skill:magic:50` — Magic 50 | skill_level | 19 | `achievement:boneyard_diary_elite`, `area:moryskah_barrows`, `quest:barrows_brothers`, `quest:desert_treasure`, `quest:prophecy_fragments` |
| 19 | `quest:shades_of_moryskah` — Shades of Moryskah | quest | 19 | `area:deadhold_keep`, `minigame:deadhold`, `training_method:moryskah_ferry_midnight_runecrafting`, `training_method:moryskah_ferry_runecrafting`, `training_method:moryskah_ferry_sunrise_fishing` |
| 20 | `area:veilwood` — Veilwood | area | 19 | `training_method:quirky_veilwood_carp_asking`, `training_method:quirky_veilwood_lantern_light`, `training_method:quirky_veilwood_stag_bow_polish`, `training_method:quirky_veilwood_threshold_sweep`, `training_method:veilwood_canopy_house_construction` |

## Clusters (connected components with 5+ nodes) — 8 found

| # | Size | Top types | Top regions | Sample IDs |
|---|-----:|-----------|-------------|------------|
| 1 | 2442 | training_method(826), skill_level(559), quest(334) | Inkweald(10), Moryskah(10), Sootworks(9) | `achievement:boneyard_diary_easy`, `achievement:boneyard_diary_elite`, `achievement:boneyard_diary_hard`, `achievement:boneyard_diary_medium`, `achievement:glass_desert_diary_easy` |
| 2 | 7 | achievement(6), boss(1) | — | `boss:vorkath`, `combat_achievement:ca_vorkath_1000`, `combat_achievement:ca_vorkath_200`, `combat_achievement:ca_vorkath_50`, `combat_achievement:ca_vorkath_fast` |
| 3 | 7 | achievement(6), boss(1) | — | `boss:zulrah`, `combat_achievement:ca_zulrah_1000`, `combat_achievement:ca_zulrah_200`, `combat_achievement:ca_zulrah_50`, `combat_achievement:ca_zulrah_fast` |
| 4 | 5 | achievement(4), boss(1) | — | `boss:all`, `combat_achievement:ca_all_bosses`, `combat_achievement:ca_all_pets`, `combat_achievement:ca_all_raids`, `combat_achievement:ca_speed_all` |
| 5 | 5 | achievement(4), boss(1) | — | `boss:barrows`, `combat_achievement:ca_barrows_1`, `combat_achievement:ca_barrows_10`, `combat_achievement:ca_barrows_full_dharok`, `combat_achievement:ca_barrows_unique` |
| 6 | 5 | achievement(4), boss(1) | — | `boss:coa`, `combat_achievement:ca_coa_complete`, `combat_achievement:ca_coa_deathless`, `combat_achievement:ca_coa_solo`, `combat_achievement:ca_coa_speed` |
| 7 | 5 | achievement(4), boss(1) | — | `boss:crystal_wyrm`, `combat_achievement:ca_wyrm_fast`, `combat_achievement:ca_wyrm_kill`, `combat_achievement:ca_wyrm_no_damage`, `combat_achievement:ca_wyrm_no_pillar` |
| 8 | 5 | achievement(4), boss(1) | — | `boss:veldrak`, `combat_achievement:ca_veldrak_duo`, `combat_achievement:ca_veldrak_fast`, `combat_achievement:ca_veldrak_kill`, `combat_achievement:ca_veldrak_no_food` |

## Cycles — 0 found

No circular prerequisites detected.

## Broken prereqs — 210 found

A node references a prerequisite id that does not exist in the DAG. Either the referenced content is missing, or the id has typoed.

| Node | Missing prereq |
|------|----------------|
| `achievement:glass_desert_diary_hard` | `quest:last_dragon_p1` |
| `achievement:glass_desert_diary_medium` | `quest:glass_prophecy` |
| `achievement:heartlands_diary_medium` | `quest:missing_miner` |
| `achievement:inkweald_diary_hard` | `quest:hollow_choir` |
| `achievement:inkweald_diary_medium` | `quest:inkweald_door` |
| `achievement:moryskah_diary_medium` | `quest:bog_witch` |
| `achievement:saltbrine_diary_elite` | `quest:barbarian_assault` |
| `achievement:saltbrine_diary_medium` | `quest:saltbrine_agility_course` |
| `achievement:sootworks_diary_elite` | `quest:soot_king_raid` |
| `achievement:sootworks_diary_hard` | `quest:forge_beneath` |
| `achievement:veilwood_diary_hard` | `quest:stormwood_rite` |
| `achievement:veilwood_diary_medium` | `quest:veilwood_covenant` |
| `minigame:deadhold` | `quest:priest_in_peril` |
| `minigame:moryskah_burgh_ramble` | `quest:the_fen_pilgrimage` |
| `minigame:veilwood_poacher_rounds` | `quest:the_rangers_trust` |
| `quest:the_letter_unposted` | `quest:the_trawlers_call` |
| `training_method:agility_hallowed_sepulchre` | `quest:sins_of_the_father` |
| `training_method:agility_seers_course` | `quest:inkweald_archives` |
| `training_method:boneyard_boil_pit_distillation` | `area:boneyard_boil_pits` |
| `training_method:boneyard_bone_boomerang_carving` | `area:boneyard_the_splinter` |
| `training_method:boneyard_bone_bound_iron_smithing` | `area:boneyard_smelters_bones` |
| `training_method:boneyard_bone_broth_kitchen` | `area:boneyard_salted_cookery` |
| `training_method:boneyard_burnt_library_reading` | `area:boneyard_burnt_library` |
| `training_method:boneyard_dune_vault_run` | `area:boneyard_singing_dunes` |
| `training_method:boneyard_fossil_prayer` | `quest:bone_voyage` |
| `training_method:boneyard_hyena_market_gauntlet` | `area:boneyard_hyena_markets` |
| `training_method:boneyard_prayer_binding_spellcasting` | `area:boneyard_burnt_library` |
| `training_method:boneyard_quarrymaster_granite` | `area:boneyard_quarrymaster_camp` |
| `training_method:boneyard_quarrymaster_sandstone` | `area:boneyard_quarrymaster_camp` |
| `training_method:boneyard_rune_salt_binding` | `area:boneyard_salt_cisterns` |
| `training_method:boneyard_salt_cistern_runecrafting` | `area:boneyard_salt_cisterns` |
| `training_method:boneyard_salt_crystal_mining` | `area:boneyard_salt_cisterns` |
| `training_method:boneyard_salt_cured_tincture` | `area:boneyard_boil_pits` |
| `training_method:boneyard_salted_cookery_dry_cure` | `area:boneyard_salted_cookery` |
| `training_method:boneyard_sand_cache_theft` | `area:boneyard_hyena_markets` |
| `training_method:boneyard_scorpion_fletching` | `area:boneyard_the_splinter` |
| `training_method:boneyard_singing_dunes_course` | `area:boneyard_singing_dunes` |
| `training_method:boneyard_smelter_bones_forge` | `area:boneyard_smelters_bones` |
| `training_method:boneyard_splinter_bone_shaft` | `area:boneyard_the_splinter` |
| `training_method:boneyard_sun_fire_burning` | `area:boneyard_sun_bleach_pits` |
| `training_method:cooking_karambwan_1tick` | `quest:tai_bwo_wannai_trio` |
| `training_method:defence_chinchompa_stacking` | `quest:moryskah_requiem` |
| `training_method:firemaking_shade_burning` | `quest:shades_of_mortton` |
| `training_method:fishing_monkfish_chill` | `quest:swan_song` |
| `training_method:heartlands_bell_tower_agility` | `quest:the_tiled_rooftops` |
| `training_method:heartlands_bell_tower_agility` | `area:heartlands_bell_tower` |
| `training_method:heartlands_capital_agility` | `quest:the_tiled_rooftops` |
| `training_method:heartlands_capital_agility` | `area:heartlands_capital_rooftops` |
| `training_method:heartlands_capital_longbow` | `area:heartlands_capital` |
| `training_method:heartlands_cathedral_windows` | `area:heartlands_grand_cathedral` |
| `training_method:heartlands_dawn_vigil` | `area:heartlands_chapel` |
| `training_method:heartlands_fishing_guild` | `area:heartlands_fishing_guild` |
| `training_method:heartlands_grand_cathedral` | `area:heartlands_grand_cathedral` |
| `training_method:heartlands_hedge_runecrafting` | `area:heartlands_old_hedge` |
| `training_method:heartlands_hedgewise_enchanting` | `area:heartlands_hedge_wise_cottage` |
| `training_method:heartlands_master_huntsman` | `area:heartlands_royal_forest` |
| `training_method:heartlands_master_thieves_circuit` | `area:heartlands_royal_district` |
| `training_method:heartlands_midnight_runecraft` | `area:heartlands_old_hedge` |
| `training_method:heartlands_noon_bell_chorus` | `area:heartlands_bell_tower` |
| `training_method:heartlands_royal_armoury` | `quest:the_royal_commission` |
| `training_method:heartlands_royal_armoury` | `area:heartlands_royal_district` |
| `training_method:heartlands_royal_herbalist` | `area:heartlands_royal_district` |
| `training_method:heartlands_royal_orchard` | `area:heartlands_royal_district` |
| `training_method:heartlands_thursday_market_thieving` | `area:heartlands_market_square` |
| `training_method:herblore_attack_potions` | `quest:druidic_ritual` |
| `training_method:herblore_cleaning_herbs` | `quest:druidic_ritual` |
| `training_method:inkweald_backseam_camp_construction` | `area:inkweald_backseam_camps` |
| `training_method:inkweald_cradlewood_hauling_strength` | `area:inkweald_cradlewood` |
| `training_method:inkweald_cradlewood_singing_soft_wc` | `area:inkweald_cradlewood` |
| `training_method:inkweald_dream_arrow_volley` | `area:inkweald_half_light_range` |
| `training_method:inkweald_dream_forge_smithing` | `area:inkweald_dream_forge` |
| `training_method:inkweald_dream_iron_mining` | `area:inkweald_dream_forge` |
| `training_method:inkweald_dream_oak_wc` | `area:inkweald_cradlewood` |
| `training_method:inkweald_dreamless_rest_hp` | `area:inkweald_threshold_of_names` |
| `training_method:inkweald_glass_iron_jewelry` | `area:inkweald_dream_forge` |
| `training_method:inkweald_glass_iron_smithing` | `area:inkweald_dream_forge` |
| `training_method:inkweald_half_light_range_basic` | `area:inkweald_half_light_range` |
| `training_method:inkweald_mirror_glade_trial_attack` | `area:inkweald_mirror_glades` |
| `training_method:inkweald_mirror_glade_trial_defence` | `area:inkweald_mirror_glades` |
| `training_method:inkweald_mirror_glade_trial_hp` | `area:inkweald_mirror_glades` |
| `training_method:inkweald_mirror_glade_trial_strength` | `area:inkweald_mirror_glades` |
| `training_method:inkweald_threshold_prayer` | `area:inkweald_threshold_of_names` |
| `training_method:magic_burst_spells` | `quest:moryskah_requiem` |
| `training_method:magic_wilds_god_spells` | `quest:mage_arena` |
| `training_method:mining_volcanic_mine` | `quest:bone_voyage` |
| `training_method:moryskah_bog_charm_practice` | `area:moryskah_bog_witch_cottage` |
| `training_method:moryskah_bog_first_fog_farming` | `area:moryskah_bog_witch_cottage` |
| `training_method:moryskah_bog_witch_apprentice_hunter` | `area:moryskah_bog_witch_cottage` |
| `training_method:moryskah_bog_witch_resurrection_farm` | `area:moryskah_bog_witch_cottage` |
| `training_method:moryskah_cabaret_card_practice` | `area:moryskah_cabaret` |
| `training_method:moryskah_cabaret_crafting` | `area:moryskah_cabaret` |
| `training_method:moryskah_cabaret_hitpoints` | `area:moryskah_cabaret` |
| `training_method:moryskah_cabaret_matinee_hitpoints` | `area:moryskah_cabaret` |
| `training_method:moryskah_cabaret_stage_hunter` | `area:moryskah_cabaret_back_alley` |
| `training_method:moryskah_cabaret_stage_ranged` | `area:moryskah_cabaret` |
| `training_method:moryskah_chapel_construction` | `area:moryskah_silent_chapel` |
| `training_method:moryskah_chapel_organist_magic` | `area:moryskah_silent_chapel` |
| `training_method:moryskah_choir_magic` | `area:moryskah_silent_chapel` |
| `training_method:moryskah_dawn_ossuary_prayer` | `area:moryskah_silent_chapel` |
| `training_method:moryskah_director_cape_pilgrimage` | `area:moryskah_cabaret` |
| `training_method:moryskah_distiller_badge_practice` | `area:moryskah_wolfbane_distillery` |
| `training_method:moryskah_distiller_cape_pilgrimage` | `area:moryskah_wolfbane_distillery` |
| `training_method:moryskah_distillery_cooking` | `area:moryskah_wolfbane_distillery` |
| `training_method:moryskah_distillery_tax_thieving` | `area:moryskah_wolfbane_distillery` |
| `training_method:moryskah_ferry_midnight_runecrafting` | `area:moryskah_ferry` |
| `training_method:moryskah_ferry_runecrafting` | `area:moryskah_ferry` |
| `training_method:moryskah_ferry_sunrise_fishing` | `area:moryskah_ferry` |
| `training_method:moryskah_ferry_woodcutting` | `area:moryskah_forgotten_island` |
| `training_method:moryskah_ferryman_weekly_woodcut` | `area:moryskah_forgotten_island` |
| `training_method:moryskah_frostwyrm_slayer` | `area:moryskah_deep_bog` |
| `training_method:moryskah_grael_fishing` | `area:moryskah_bog_witch_cottage` |
| `training_method:moryskah_hamlet_construction` | `area:moryskah_forgotten_hamlet` |
| `training_method:moryskah_hamlet_fire_watch` | `area:moryskah_forgotten_hamlet` |
| `training_method:moryskah_hollow_choir_offerings` | `area:moryskah_silent_chapel` |
| `training_method:moryskah_hollow_midnight_magic` | `area:moryskah_silent_chapel` |
| `training_method:moryskah_immigration_thieving` | `area:moryskah_moonless_inn` |
| `training_method:moryskah_mausoleum_agility` | `area:moryskah_mausoleum_rooftops` |
| `training_method:moryskah_moonless_ledger_thieving` | `area:moryskah_moonless_inn` |
| `training_method:moryskah_mortuary_cooking` | `area:moryskah_moonless_inn` |
| `training_method:moryskah_reliquarist_badge_practice` | `area:moryskah_mausoleum_district` |
| `training_method:moryskah_reliquary_mining` | `area:moryskah_mausoleum_district` |
| `training_method:moryskah_rooftop_stormwalk_agility` | `area:moryskah_mausoleum_district` |
| `training_method:moryskah_season_bell_toll_prayer` | `area:moryskah_silent_chapel` |
| `training_method:moryskah_season_fog_walk` | `area:moryskah_mausoleum_district` |
| `training_method:moryskah_sigil_chapel_practice` | `area:moryskah_silent_chapel` |
| `training_method:moryskah_sigil_choir_practice` | `area:moryskah_silent_chapel` |
| `training_method:moryskah_sigil_moonless_practice` | `area:moryskah_moonless_inn` |
| `training_method:moryskah_silent_chapel_sanctum_magic` | `area:moryskah_silent_chapel_sanctum` |
| `training_method:moryskah_silent_chapel_smithing` | `area:moryskah_silent_chapel` |
| `training_method:moryskah_tallow_firemaking` | `area:moryskah_mausoleum_district` |
| `training_method:moryskah_unremembered_cape_pilgrimage` | `area:moryskah_ferry` |
| `training_method:moryskah_vampire_cabaret_performance_crafting` | `area:moryskah_cabaret` |
| `training_method:moryskah_wake_night_cooking` | `area:moryskah_moonless_inn` |
| `training_method:moryskah_wake_ranged` | `area:moryskah_mausoleum_district` |
| `training_method:moryskah_werewolf_tracker_hunter` | `area:moryskah_howling_moors` |
| `training_method:moryskah_wolfbane_distillery_herblore` | `area:moryskah_wolfbane_distillery` |
| `training_method:moryskah_wolfbane_still_firemaking` | `area:moryskah_wolfbane_distillery` |
| `training_method:moryskah_writer_cape_pilgrimage` | `area:moryskah_silent_chapel` |
| `training_method:prayer_ectofuntus` | `quest:moryskah_haunting` |
| `training_method:quirky_moryskah_cabaret_programme_signing` | `area:moryskah_cabaret` |
| `training_method:quirky_moryskah_chapel_bell_toll` | `area:moryskah_silent_chapel` |
| `training_method:quirky_moryskah_chapel_bellrope_pull` | `area:moryskah_silent_chapel` |
| `training_method:quirky_moryskah_distillery_churn` | `area:moryskah_wolfbane_distillery` |
| `training_method:quirky_moryskah_distillery_mash_taste` | `area:moryskah_wolfbane_distillery` |
| `training_method:quirky_moryskah_distillery_nightwatch` | `area:moryskah_wolfbane_distillery` |
| `training_method:quirky_moryskah_gate_rubbings` | `area:moryskah_mausoleum_district` |
| `training_method:quirky_moryskah_graveyard_weed` | `area:moryskah_mausoleum_district` |
| `training_method:quirky_moryskah_heron_ferryman` | `area:moryskah_ferry` |
| `training_method:quirky_moryskah_inn_signboard_relight` | `area:moryskah_moonless_inn` |
| `training_method:quirky_moryskah_inn_tankard_polish` | `area:moryskah_moonless_inn` |
| `training_method:quirky_moryskah_lost_and_found` | `area:moryskah_ferry` |
| `training_method:quirky_moryskah_thatcher_helper` | `area:moryskah_mausoleum_district` |
| `training_method:quirky_moryskah_well_letter_retrieve` | `area:moryskah_forgotten_hamlet` |
| `training_method:ranged_chinchompas` | `quest:moryskah_requiem` |
| `training_method:runecrafting_daeyalt_essence` | `quest:sins_of_the_father` |
| `training_method:smithing_cannonballs` | `quest:dwarf_cannon_quest` |
| `training_method:sootworks_beggars_gallery_master_lift` | `area:sootworks_beggars_gallery` |
| `training_method:sootworks_beggars_gallery_payday` | `area:sootworks_beggars_gallery` |
| `training_method:sootworks_brass_choir_grand_sermon` | `area:sootworks_brass_choir` |
| `training_method:sootworks_brass_choir_silent_hour` | `area:sootworks_brass_choir` |
| `training_method:sootworks_cathedral_crafting_bench` | `area:sootworks_forge_cathedral` |
| `training_method:sootworks_cathedral_quench_master` | `area:sootworks_forge_cathedral` |
| `training_method:sootworks_clockbeetle_master_runs` | `area:sootworks_clockbeetle_warrens` |
| `training_method:sootworks_deep_coal_dawn_fm` | `area:sootworks_deep_furnace` |
| `training_method:sootworks_deep_coal_master_burn` | `area:sootworks_deep_furnace` |
| `training_method:sootworks_deepwell_blood_moon_fishing` | `area:sootworks_deepwell` |
| `training_method:sootworks_deepwell_harpoon_fishing` | `area:sootworks_deepwell` |
| `training_method:sootworks_forge_apprentice_hitpoints` | `area:sootworks_forge_cathedral` |
| `training_method:sootworks_forge_cathedral_commission` | `area:sootworks_forge_cathedral` |
| `training_method:sootworks_heat_temper_master_defence` | `area:sootworks_forge_cathedral` |
| `training_method:sootworks_heretic_shot_caster_range` | `area:sootworks_tinker_yards` |
| `training_method:sootworks_imbue_hall_magic` | `area:sootworks_imbue_hall` |
| `training_method:sootworks_imbue_hall_press_perfect` | `area:sootworks_imbue_hall` |
| `training_method:sootworks_lantern_mine_master_seam` | `area:sootworks_lantern_mines` |
| `training_method:sootworks_organ_mass_prayer` | `area:sootworks_brass_choir` |
| `training_method:sootworks_pressure_pot_feast` | `area:sootworks_feast_kitchen` |
| `training_method:sootworks_pressure_pot_feast_night` | `area:sootworks_feast_kitchen` |
| `training_method:sootworks_pump_eight_elite` | `area:sootworks_pump_station` |
| `training_method:sootworks_pump_eight_shift_change` | `area:sootworks_pump_station` |
| `training_method:sootworks_rust_pits_master_still` | `area:sootworks_rust_pits` |
| `training_method:sootworks_shift_bell_chorus` | `area:sootworks_forge_cathedral` |
| `training_method:sootworks_steamfield_master_rotation` | `area:sootworks_steamfield` |
| `training_method:sootworks_steamfield_new_moon_farming` | `area:sootworks_steamfield` |
| `training_method:sootworks_tinker_master_dawn_fletching` | `area:sootworks_tinker_yards` |
| `training_method:sootworks_tinker_master_fletching` | `area:sootworks_tinker_yards` |
| `training_method:sootworks_tinker_workshop_attack` | `area:sootworks_tinker_yards` |
| `training_method:thieving_blackjacking` | `quest:feud_quest` |
| `training_method:veilwood_glass_cored_alloy_smithing` | `area:veilwood_glass_leaf_glades` |
| `training_method:veilwood_glass_glade_smithing` | `area:veilwood_glass_leaf_glades` |
| `training_method:veilwood_glass_leaf_knapping` | `area:veilwood_glass_leaf_glades` |
| `training_method:veilwood_glass_spider_hp` | `area:veilwood_glass_spider_hollow` |
| `training_method:veilwood_glass_stag_attack` | `area:veilwood_glass_stag_thicket` |
| `training_method:veilwood_glass_stag_hunter` | `area:veilwood_glass_stag_thicket` |
| `training_method:veilwood_hunters_grove_cooking` | `area:veilwood_hunters_grove` |
| `training_method:veilwood_mirror_stag_defence` | `area:veilwood_mirror_shallow` |
| `training_method:veilwood_mirror_stag_hp_parlay` | `area:veilwood_mirror_shallow` |
| `training_method:veilwood_moonhawk_ranged` | `area:veilwood_moonhawk_perch` |
| `training_method:veilwood_range_singing_arrows` | `area:veilwood_range` |
| `training_method:veilwood_stag_stone_binding_magic` | `area:veilwood_stag_stone` |
| `training_method:veilwood_threshold_bonfire` | `area:veilwood_threshold_wardens` |

…10 more not shown

## Dead-end islands — 1765 found

Nodes that nothing depends on. Some are legitimate terminal rewards (endgame bosses, cosmetic pets, capstone achievements). Others may be orphaned content that nothing gates behind it — in which case the "key" exists but has no downstream "door."

### By type breakdown

| Type | Dead-end count |
|------|---------------:|
| training_method | 882 |
| item_unlock | 216 |
| achievement | 118 |
| spell_unlock | 74 |
| recipe | 72 |
| area | 71 |
| quest | 59 |
| minigame | 47 |
| npc | 47 |
| prayer_unlock | 47 |
| teleport | 46 |
| raid | 32 |
| shop | 25 |
| boss | 23 |
| shortcut | 6 |

### First 100 dead-ends with type flag

Flag: `TERMINAL` = likely intended as a final reward (achievements, pets, raids). `REVIEW` = a quest/area/unlock with nothing downstream — likely orphaned.

| Node | Type | Name | Flag |
|------|------|------|------|
| `achievement:boneyard_diary_easy` | achievement | Boneyard Wastes Easy Diary | TERMINAL |
| `achievement:boneyard_diary_elite` | achievement | Boneyard Wastes Elite Diary | TERMINAL |
| `achievement:boneyard_diary_hard` | achievement | Boneyard Wastes Hard Diary | TERMINAL |
| `achievement:boneyard_diary_medium` | achievement | Boneyard Wastes Medium Diary | TERMINAL |
| `achievement:glass_desert_diary_easy` | achievement | Glass Desert Easy Diary | TERMINAL |
| `achievement:glass_desert_diary_elite` | achievement | Glass Desert Elite Diary | TERMINAL |
| `achievement:glass_desert_diary_hard` | achievement | Glass Desert Hard Diary | TERMINAL |
| `achievement:glass_desert_diary_medium` | achievement | Glass Desert Medium Diary | TERMINAL |
| `achievement:heartlands_diary_easy` | achievement | Heartlands Easy Diary | TERMINAL |
| `achievement:heartlands_diary_elite` | achievement | Heartlands Elite Diary | TERMINAL |
| `achievement:heartlands_diary_hard` | achievement | Heartlands Hard Diary | TERMINAL |
| `achievement:heartlands_diary_medium` | achievement | Heartlands Medium Diary | TERMINAL |
| `achievement:inkweald_diary_easy` | achievement | Inkweald Easy Diary | TERMINAL |
| `achievement:inkweald_diary_elite` | achievement | Inkweald Elite Diary | TERMINAL |
| `achievement:inkweald_diary_hard` | achievement | Inkweald Hard Diary | TERMINAL |
| `achievement:inkweald_diary_medium` | achievement | Inkweald Medium Diary | TERMINAL |
| `achievement:master_farmer_title` | achievement | Master Farmer title + permanent 10% herb yield bonus | TERMINAL |
| `achievement:moryskah_diary_easy` | achievement | Moryskah Easy Diary | TERMINAL |
| `achievement:moryskah_diary_elite` | achievement | Moryskah Elite Diary | TERMINAL |
| `achievement:moryskah_diary_hard` | achievement | Moryskah Hard Diary | TERMINAL |
| `achievement:moryskah_diary_medium` | achievement | Moryskah Medium Diary | TERMINAL |
| `achievement:saltbrine_diary_easy` | achievement | Saltbrine Reach Easy Diary | TERMINAL |
| `achievement:saltbrine_diary_elite` | achievement | Saltbrine Reach Elite Diary | TERMINAL |
| `achievement:saltbrine_diary_hard` | achievement | Saltbrine Reach Hard Diary | TERMINAL |
| `achievement:saltbrine_diary_medium` | achievement | Saltbrine Reach Medium Diary | TERMINAL |
| `achievement:sootworks_diary_easy` | achievement | Sootworks Easy Diary | TERMINAL |
| `achievement:sootworks_diary_elite` | achievement | Sootworks Elite Diary | TERMINAL |
| `achievement:sootworks_diary_hard` | achievement | Sootworks Hard Diary | TERMINAL |
| `achievement:sootworks_diary_medium` | achievement | Sootworks Medium Diary | TERMINAL |
| `achievement:veilwood_diary_easy` | achievement | Veilwood Easy Diary | TERMINAL |
| `achievement:veilwood_diary_elite` | achievement | Veilwood Elite Diary | TERMINAL |
| `achievement:veilwood_diary_hard` | achievement | Veilwood Hard Diary | TERMINAL |
| `achievement:veilwood_diary_medium` | achievement | Veilwood Medium Diary | TERMINAL |
| `area:ascendant_spire` | area | The spire atop the Inkweald dream | REVIEW |
| `area:boneyard_deep_dunes` | area | Immunity to Boneyard sandstorm disorientation — access deep dunes | REVIEW |
| `area:boneyard_first_empire_vault` | area | First Empire Vault — permanent bank access inside the ruins, rare relic respawns | REVIEW |
| `area:boneyard_kings_crypt` | area | Crypt of Kings — advanced slayer + all 3 Bones of Fallen Kings trial rooms unlocked at once | REVIEW |
| `area:boneyard_old_caravan_track` | area | Old Caravan Track — a pre-marked route with permanent respawn points for desert herbs and sand-wraiths. Only players who have walked the sister can navigate it without taking damage. | REVIEW |
| `area:boneyard_sealed_tomb` | area | Sealed Tomb of Senekhet | REVIEW |
| `area:crew_six_memorial` | area | Crew Six Memorial — small shrine in the foundry outer wall; interact for 20% smithing-xp buff, one hour, once per day. Only unlocks if you chose Tell Brun or Tell Vorath. | REVIEW |
| `area:deadhold_keep` | area | Deadhold Keep interior | REVIEW |
| `area:deep_sootworks_crew_seven_tunnel` | area | Crew Seven Tunnel — a permanently lit, permanently open deep-mine passage with unique ore (soot-vein copper) and a re-pressurable shortcut between Sootworks and Heartlands mines. | REVIEW |
| `area:drifting_market` | area | The Drifting Market | REVIEW |
| `area:drifting_market_private_cabin` | area | Nessa's private cabin — a second seat at the Drifting Market; access to off-charter goods that do not appear in the public stall. | REVIEW |
| `area:glass_desert_edge_keeper_trials` | area | Edge-Keeper Trials — BiS endgame combat training hub | REVIEW |
| `area:glass_desert_mirrored_spire_climb_area` | area | Mirrored Spire full agility course access | REVIEW |
| `area:glass_desert_new_sun_zone` | area | New Sun Zone — unlocked only if player chose to forge a new sun | REVIEW |
| `area:glass_desert_prophecy_chamber` | area | Prophecy Chamber — under Orin's tower, contains a reading table that foreshadows all remaining grandmaster quests | REVIEW |
| `area:glass_desert_sage_tower` | area | Sage's Tower (yours, if you chose to succeed Orin) — contains the prophecy table and a bank | REVIEW |
| `area:glass_desert_singing_glass_caverns` | area | Singing Glass Caverns full access | REVIEW |
| `area:glass_desert_witness_wall_area` | area | Witness Wall altar access + regional prayer hub | REVIEW |
| `area:heartlands_champions_guild` | area | Champions' Guild | REVIEW |
| `area:heartlands_chapel_altar_key` | area | You may, at any future longest night, unlock the chapel altar yourself — the ONLY time any player holds that key. | REVIEW |
| `area:heartlands_chapel_undercroft` | area | Chapel Undercroft — a small room under the altar, contains the finished prayer if you finished it | REVIEW |
| `area:heartlands_cooking_guild` | area | Heartlands Cooking Guild | REVIEW |
| `area:heartlands_crafting_guild` | area | Heartlands Crafting Guild | REVIEW |
| `area:heartlands_hidden_crypt` | area | Hidden crypt beneath the Chapel of the Last Light | REVIEW |
| `area:heartlands_private_kitchen` | area | Private Kitchen in the Guild — your own range, farm plot, and fishing pond on-site | REVIEW |
| `area:heartlands_reed_sister_cottage` | area | The sister's cottage — a private bank access point in the Heartlands, along with a vegetable patch that produces a unique seed if you posted the letter. | REVIEW |
| `area:heartlands_throne_room` | area | Throne Room with a permanent advisor seat — player gains political voice | REVIEW |
| `area:heartlands_warriors_guild` | area | Warriors' Guild | REVIEW |
| `area:inkweald_library_upper_stacks` | area | The upper stacks open. The shelves rearrange when you're not looking. | REVIEW |
| `area:inkweald_pageturn_court` | area | Pageturn Court opens. The door was always last. Now it opens. | REVIEW |
| `area:inkweald_second_door_chambers` | area | Second Door Chambers — seven layered dream rooms, each with a unique puzzle | REVIEW |
| `area:inkweald_third_grove` | area | Third Grove — a private meditative space, the mirror remains for future visits | REVIEW |
| `area:inner_crystal_caverns` | area | Inner Crystal Caverns — accessible only post-alignment, contains refraction-only herb patches, a mirror-forge for unique crafting, and Orin as a permanent consultant. | REVIEW |
| `area:lost_gods_crossroad_shrine` | area | Crossroad Shrine — a small temple appears at the seventh crossroad, accessible only to you | REVIEW |
| `area:marchlands_staging` | area | Marchlands staging camp | REVIEW |
| `area:moryskah_barrows_mounds` | area | Full Barrows tunnel + chest access | REVIEW |
| `area:moryskah_cabaret_royal_box` | area | Vampire Cabaret Royal Box — the only seat the director trusts her understudy in; the champagne is warm and iron-y | REVIEW |
| `area:moryskah_castle_throne` | area | Castle Malachar throne room — player gains a seat at the long supper where nothing is eaten and everybody is very polite | REVIEW |
| `area:moryskah_choir_loft` | area | Hollow Choir Loft — where the third voice lives; it is the only voice that remembers the entire hymn | REVIEW |
| `area:moryskah_hallowvale_district` | area | Hallowvale — the vampire quarter, late-game Moryskah content | REVIEW |
| `area:moryskah_haunted_mine_depths` | area | Haunted Mine — unique glowing coal that ignores smelting penalties | REVIEW |
| `area:moryskah_mortton_temple` | area | Mortton Temple — blessed pyre site, shade minigame | REVIEW |
| `area:moryskah_sisterhood_library` | area | Barrows Sisterhood Library — pew-by-pew access to the full archive of brother-wills, each of which has codicils the brothers wrote after their funerals | REVIEW |
| `area:moryskah_slayer_tower_basement` | area | Access to the Slayer Tower basement — creed stone, rare banshees, permanent respawns | REVIEW |
| `area:moryskah_werewolf_estate` | area | The Werewolf Estate — fully explorable, contains a private bank, a shrine, and a locked room | REVIEW |
| `area:moryskah_witchs_grove` | area | The Witch's Grove — a small perfect patch of her swamp that cannot be found by accident | REVIEW |
| `area:moryskah_wolfbane_distillery_back_vault` | area | Wolfbane Distillery back vault — deepest fermentation hall, only the foreman and the eldest distiller have ever set foot in it | REVIEW |
| `area:old_sun_cavern` | area | Old Sun Cavern — accessible only via the waxed compass after this quest. Contains a daily refreshable herb patch that grows ingredients not found elsewhere. | REVIEW |
| `area:pyramid_sixth_level_archive` | area | Pyramid Sixth-Level Archive — accessible only if the chain is complete. Each chosen ending grants a different entry cadence (never, monthly of Euthren, or permanent). | REVIEW |
| `area:saltbrine_counterfeit_vault` | area | Counterfeit Vault — a stash with three bank tabs that only you can access | REVIEW |
| `area:saltbrine_crows_nest_range` | area | Crow's Nest Range — sniper-shot rigging range, high-tier ranged training with storm-sway mechanic | REVIEW |
| `area:saltbrine_drifting_market` | area | The Drifting Market — floating bazaar that rotates between coastal ports; exclusive stock weekly | REVIEW |
| `area:saltbrine_ghost_anchorage` | area | Ghost Anchorage — unique fishing + ranged content | REVIEW |
| `area:saltbrine_scuttler_pits` | area | Scuttler Pits full access | REVIEW |
| `area:saltbrine_smugglers_cove` | area | Smuggler's Cove | REVIEW |
| `area:saltbrine_throne_rocks` | area | Throne Rocks — your seat, a private bank, and a balcony overlooking the open sea | REVIEW |
| `area:saltbrine_tower_upper` | area | The battlements of Saltbrine Tower | REVIEW |
| `area:saltbrine_wreck_coast` | area | The Wreck Coast — boat-only deep-water fishing grounds. Unique fish not found elsewhere. | REVIEW |
| `area:sootworks_forgotten_workshop` | area | Forgotten workshop — ancient smithing tools | REVIEW |
| `area:sootworks_foundation_seam` | area | Foundation Seam — unique mining area with hot-vein ore, fire-wight respawns | REVIEW |
| `area:sootworks_geyser_dock` | area | Geyser Dock — deepwell fishing spot + pressure-pot cooking station adjacent | REVIEW |
| `area:sootworks_pilgrim_cloister` | area | Pilgrim cloister — rest + prayer restore spot, Brass Choir side chapel | REVIEW |
| `area:sootworks_pump_eight_lower` | area | Lower Pump Eight — agility-exclusive sprint zone | REVIEW |
| `area:sootworks_slag_tunnels` | area | Slag Tunnels access — golem-spawn, pipehounds, deep-foundry monsters | REVIEW |
| `area:sootworks_titan_floor` | area | Titan Floor — a hangar deep below the Sootworks, your Titan rests here | REVIEW |
| `area:the_wilds_ent_grove` | area | Ent grove — level-thirty wilderness farming hub | REVIEW |
| `area:the_wilds_lava_maze` | area | Lava Maze runite cluster access — deep-wild mining node | REVIEW |

…1665 more not shown (full list in `data/progression-dag.json`)

## Truly orphaned quests

Quests that exist but nothing depends on their completion (no area gate, no downstream quest, no breakpoint chain). Candidates for review: either terminal rewards by design, or isolated content that needs a downstream tie-in.

Count: 59

- `quest:cooks_assistant` — Cook's Assistant (Novice)
- `quest:crucible_key` — The Forgemaster's Challenge (Experienced)
- `quest:dragon_slayer` — Dragon Slayer (Experienced)
- `quest:poison_trail` — The Poison Trail (Intermediate)
- `quest:sheep_shearer` — Sheep Shearer (Novice)
- `quest:the_assassins_ledger` — The Assassin's Ledger (Experienced)
- `quest:the_bone_colossus` — The Bone Colossus (Master)
- `quest:the_bone_flute` — The Bone Flute (Intermediate)
- `quest:the_canopy_war` — The Canopy War (Experienced)
- `quest:the_clockwork_courier` — The Clockwork Courier (Intermediate)
- `quest:the_clockwork_tyrant` — The Clockwork Tyrant (Master)
- `quest:the_colosseum_of_bones` — The Colosseum of Bones (Experienced)
- `quest:the_couriers_marathon` — The Courier's Marathon (Experienced)
- `quest:the_crystal_plague` — The Crystal Plague (Experienced)
- `quest:the_crystal_warden` — The Crystal Warden (Grandmaster)
- `quest:the_dream_cartographer` — The Dream Cartographer (Intermediate)
- `quest:the_drowned_cartographer` — The Drowned Cartographer (Experienced)
- `quest:the_eternal_hunt` — The Eternal Hunt (Grandmaster)
- `quest:the_eternal_pyre` — The Eternal Pyre (Intermediate)
- `quest:the_farmstead_siege` — The Farmstead Siege (Intermediate)
- `quest:the_fletchers_trial` — The Fletcher's Trial (Intermediate)
- `quest:the_flooded_vault` — The Flooded Vault (Intermediate)
- `quest:the_forge_beneath` — The Forge Beneath the City (Master)
- `quest:the_forge_of_four_fires` — The Forge of Four Fires (Experienced)
- `quest:the_fremennik_trials` — Trials of the Frost (Intermediate)
- `quest:the_glass_cutters_challenge` — The Glass Cutter's Challenge (Intermediate)
- `quest:the_grand_heist` — The Grand Heist (Master)
- `quest:the_haunted_lighthouse` — The Haunted Lighthouse (Intermediate)
- `quest:the_hollow_king` — The Hollow King (Grandmaster)
- `quest:the_ink_painters_masterpiece` — The Ink Painter's Masterpiece (Experienced)
- `quest:the_ink_smugglers` — The Ink Smugglers (Intermediate)
- `quest:the_jewellers_eye` — The Jeweller's Eye (Intermediate)
- `quest:the_kings_last_edict` — The King's Last Edict (Experienced)
- `quest:the_last_adventurer` — The Last Adventurer (Grandmaster)
- `quest:the_leviathans_wake` — The Leviathan's Wake (Master)
- `quest:the_lighthouse_cipher` — The Lighthouse Cipher (Experienced)
- `quest:the_lost_expedition` — The Lost Expedition (Master)
- `quest:the_merchants_gambit` — The Merchant's Gambit (Experienced)
- `quest:the_missing_miner` — The Missing Miner (Novice)
- `quest:the_moonlit_duel` — The Moonlit Duel (Experienced)
- `quest:the_plague_road` — The Plague Road (Master)
- `quest:the_runecasters_paradox` — The Runecaster's Paradox (Master)
- `quest:the_runic_lock` — The Runic Lock (Intermediate)
- `quest:the_saltbrine_regatta` — The Saltbrine Regatta (Intermediate)
- `quest:the_siege_of_hollow_mire` — The Siege of Hollow Mire (Master)
- `quest:the_silent_hunt` — The Silent Hunt (Intermediate)
- `quest:the_silent_witness` — The Silent Witness (Experienced)
- `quest:the_smugglers_web` — The Smuggler's Web (Master)
- `quest:the_song_before_words` — The Song Before Words (Experienced)
- `quest:the_spymasters_gambit` — The Spymaster's Gambit (Experienced)
- `quest:the_steamwrights_apprentice` — The Steamwright's Apprentice (Experienced)
- `quest:the_tax_collectors_bodyguard` — The Tax Collector's Bodyguard (Intermediate)
- `quest:the_tower_of_trials` — The Tower of Trials (Experienced)
- `quest:the_undertakers_burden` — The Undertaker's Burden (Experienced)
- `quest:the_veilwood_whittler` — The Veilwood Whittler (Intermediate)
- `quest:the_wandering_chef` — The Wandering Chef (Intermediate)
- `quest:the_werewolf_courier` — The Werewolf Courier (Intermediate)
- `quest:threads_of_the_weave` — Threads of the Weave (Master)
- `quest:underground_pass` — The Underground Pass (Experienced)

## Health verdict

- **Largest connected component:** 2442 / 2698 nodes (90.5%)
- **Breakpoint density:** 336 nodes unlock 5+ downstream (12.45%)
- **Dead-end ratio:** 1765 / 2698 (65.4%)
- **Cycle count:** 0
- **Broken refs:** 210

**Verdict:** CONNECTED METROIDVANIA — the graph is a single dominant web (>=80% of nodes in one component) with no circular gates. The balance diagnostic can plan paths end-to-end. Broken-ref count (210) reflects unregistered areas/quests referenced by training methods — these are fillable gaps, not structural breaks.

## Broken-ref breakdown

### Missing target by prefix

| Target prefix | Count |
|---------------|------:|
| `area:` | 174 |
| `quest:` | 36 |

### Referring node by type

| Referring type | Count |
|----------------|------:|
| training_method | 194 |
| achievement | 12 |
| minigame | 3 |
| quest | 1 |
