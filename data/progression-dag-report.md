# Progression DAG — v0.8 Burn Findings

Generated: 2026-04-22T17:20:04.990Z

## Totals

- **Nodes:** 2907
- **Edges:** 4943

### Node counts by type

| Type | Count |
|------|-------|
| training_method | 896 |
| skill_level | 579 |
| quest | 373 |
| item_unlock | 262 |
| area | 189 |
| achievement | 122 |
| spell_unlock | 78 |
| recipe | 72 |
| npc | 69 |
| boss | 62 |
| teleport | 48 |
| prayer_unlock | 47 |
| minigame | 47 |
| raid | 32 |
| shop | 25 |
| shortcut | 6 |

## Top 20 breakpoints (>=5 downstream)

A breakpoint is a node whose completion unlocks 5 or more other nodes. These are the Marstead "this changes everything" moments.

| Rank | Node | Type | Downstream | Sample unlocks |
|------|------|------|-----------:|----------------|
| 1 | `area:sootworks` — The Sootworks | area | 97 | `area:sootworks_beggars_gallery`, `area:sootworks_brass_choir`, `area:sootworks_deepwell`, `area:sootworks_feast_kitchen`, `area:sootworks_forge_cathedral` |
| 2 | `area:the_wilds` — The Wilds | area | 93 | `area:the_wilds_kbd_lair`, `area:the_wilds_mithril_pocket`, `training_method:agility_wilds_course`, `training_method:attack_wilds_revenants`, `training_method:construction_wilds_fortifications` |
| 3 | `area:heartlands` — The Heartlands | area | 59 | `area:heartlands_capital`, `area:heartlands_chapel`, `area:heartlands_fishing_guild`, `area:heartlands_grand_cathedral`, `area:heartlands_hedge_wise_cottage` |
| 4 | `area:glass_desert` — The Glass Desert | area | 54 | `training_method:glass_desert_crystal_arrow_fletching`, `training_method:glass_desert_crystal_cored_plate`, `training_method:glass_desert_crystal_corn_master_farm`, `training_method:glass_desert_crystal_hunter_falconry`, `training_method:glass_desert_crystal_hunter_slayer` |
| 5 | `area:saltbrine_reach` — Saltbrine Reach | area | 53 | `training_method:quirky_saltbrine_barnacle_scraping`, `training_method:quirky_saltbrine_bilge_pumping`, `training_method:quirky_saltbrine_knot_tying`, `training_method:quirky_saltbrine_lantern_carry`, `training_method:quirky_saltbrine_net_mending` |
| 6 | `area:moryskah` — Moryskah | area | 52 | `area:moryskah_bog_witch_cottage`, `area:moryskah_cabaret`, `area:moryskah_deep_bog`, `area:moryskah_ferry`, `area:moryskah_forgotten_hamlet` |
| 7 | `quest:blood_rites` — Blood Rites | quest | 44 | `achievement:moryskah_diary_hard`, `area:moryskah_barrows`, `area:moryskah_cabaret`, `area:moryskah_mausoleum_district`, `area:moryskah_silent_chapel` |
| 8 | `area:inkweald` — The Inkweald | area | 39 | `area:inkweald_backseam_camps`, `area:inkweald_cradlewood`, `area:inkweald_dream_forge`, `area:inkweald_half_light_range`, `area:inkweald_mirror_glades` |
| 9 | `area:boneyard_wastes` — The Boneyard Wastes | area | 36 | `area:boneyard_boil_pits`, `area:boneyard_burnt_library`, `area:boneyard_hyena_markets`, `area:boneyard_quarrymaster_camp`, `area:boneyard_salt_cisterns` |
| 10 | `quest:the_bog_witchs_bargain` — The Bog Witch's Bargain | quest | 30 | `achievement:moryskah_diary_medium`, `area:moryskah`, `area:moryskah_bog_witch_cottage`, `area:moryskah_deep_bog`, `area:moryskah_wolfbane_distillery` |
| 11 | `quest:desert_treasure` — Desert Treasure | quest | 27 | `achievement:boneyard_diary_elite`, `area:boneyard_pyramid`, `quest:pharaohs_reckoning_prelude`, `quest:sandglass_sage_ascension`, `quest:the_lost_god_returns` |
| 12 | `skill:hitpoints:70` — Hitpoints 70 | skill_level | 27 | `minigame:marchlands`, `quest:fight_caves`, `quest:lucid_nightmare_key`, `quest:the_last_light`, `skill:hitpoints:75` |
| 13 | `area:veilwood` — Veilwood | area | 26 | `area:veilwood_glass_leaf_glades`, `area:veilwood_hunters_grove`, `area:veilwood_mirror_shallow`, `area:veilwood_moonhawk_perch`, `area:veilwood_range` |
| 14 | `quest:lunar_diplomacy` — Lunar Diplomacy | quest | 24 | `achievement:veilwood_diary_elite`, `area:inkweald_lunar_plane`, `quest:gauntlet_key`, `quest:the_lost_god_returns`, `quest:the_veilwood_grandmaster_rite` |
| 15 | `skill:attack:70` — Attack 70 | skill_level | 23 | `achievement:heartlands_diary_elite`, `achievement:moryskah_diary_elite`, `achievement:sootworks_diary_elite`, `area:moryskah_castle_malachar`, `item_unlock:abyssal_whip` |
| 16 | `skill:magic:55` — Magic 55 | skill_level | 23 | `achievement:inkweald_diary_hard`, `quest:coa_key`, `quest:halds_letter_to_kael`, `quest:nine_days_to_pour_two_cold`, `quest:prism_labyrinth_key` |
| 17 | `skill:prayer:60` — Prayer 60 | skill_level | 21 | `achievement:inkweald_diary_elite`, `achievement:moryskah_diary_elite`, `area:moryskah_castle_malachar`, `area:sootworks_brass_choir`, `minigame:moryskah_reliquary_defence` |
| 18 | `quest:shades_of_moryskah` — Shades of Moryskah | quest | 21 | `area:deadhold_keep`, `area:moryskah_ferry`, `area:moryskah_forgotten_island`, `minigame:deadhold`, `training_method:moryskah_ferry_midnight_runecrafting` |
| 19 | `skill:agility:50` — Agility 50 | skill_level | 20 | `area:moryskah_castle_malachar`, `minigame:boneyard_rogue_warrens`, `quest:coa_key`, `quest:halds_letter_to_kael`, `quest:prophecy_fragments` |
| 20 | `skill:magic:70` — Magic 70 | skill_level | 19 | `minigame:glass_desert_shardforge`, `minigame:marchlands`, `quest:gauntlet_key`, `quest:lucid_nightmare_key`, `quest:pharaohs_reckoning_prelude` |

## Clusters (connected components with 5+ nodes) — 8 found

| # | Size | Top types | Top regions | Sample IDs |
|---|-----:|-----------|-------------|------------|
| 1 | 2680 | training_method(868), skill_level(579), quest(358) | Moryskah(24), Sootworks(22), Heartlands(19) | `achievement:boneyard_diary_easy`, `achievement:boneyard_diary_elite`, `achievement:boneyard_diary_hard`, `achievement:boneyard_diary_medium`, `achievement:glass_desert_diary_easy` |
| 2 | 7 | achievement(6), boss(1) | — | `boss:vorkath`, `combat_achievement:ca_vorkath_1000`, `combat_achievement:ca_vorkath_200`, `combat_achievement:ca_vorkath_50`, `combat_achievement:ca_vorkath_fast` |
| 3 | 7 | achievement(6), boss(1) | — | `boss:zulrah`, `combat_achievement:ca_zulrah_1000`, `combat_achievement:ca_zulrah_200`, `combat_achievement:ca_zulrah_50`, `combat_achievement:ca_zulrah_fast` |
| 4 | 5 | achievement(4), boss(1) | — | `boss:all`, `combat_achievement:ca_all_bosses`, `combat_achievement:ca_all_pets`, `combat_achievement:ca_all_raids`, `combat_achievement:ca_speed_all` |
| 5 | 5 | achievement(4), boss(1) | — | `boss:barrows`, `combat_achievement:ca_barrows_1`, `combat_achievement:ca_barrows_10`, `combat_achievement:ca_barrows_full_dharok`, `combat_achievement:ca_barrows_unique` |
| 6 | 5 | achievement(4), boss(1) | — | `boss:coa`, `combat_achievement:ca_coa_complete`, `combat_achievement:ca_coa_deathless`, `combat_achievement:ca_coa_solo`, `combat_achievement:ca_coa_speed` |
| 7 | 5 | achievement(4), boss(1) | — | `boss:crystal_wyrm`, `combat_achievement:ca_wyrm_fast`, `combat_achievement:ca_wyrm_kill`, `combat_achievement:ca_wyrm_no_damage`, `combat_achievement:ca_wyrm_no_pillar` |
| 8 | 5 | achievement(4), boss(1) | — | `boss:veldrak`, `combat_achievement:ca_veldrak_duo`, `combat_achievement:ca_veldrak_fast`, `combat_achievement:ca_veldrak_kill`, `combat_achievement:ca_veldrak_no_food` |

## Cycles — 0 found

No circular prerequisites detected.

## Broken prereqs — 23 found

A node references a prerequisite id that does not exist in the DAG. Either the referenced content is missing, or the id has typoed.

| Node | Missing prereq |
|------|----------------|
| `achievement:saltbrine_diary_elite` | `quest:barbarian_assault` |
| `achievement:saltbrine_diary_medium` | `quest:saltbrine_agility_course` |
| `achievement:sootworks_diary_elite` | `quest:soot_king_raid` |
| `achievement:wilds_diary_elite` | `quest:wilderness_collection_log` |
| `achievement:wilds_diary_hard` | `quest:wilderness_agility_course_perfectly` |
| `achievement:wilds_diary_hard` | `quest:deeper_wilds` |
| `minigame:deadhold` | `quest:priest_in_peril` |
| `minigame:moryskah_burgh_ramble` | `quest:the_fen_pilgrimage` |
| `minigame:veilwood_poacher_rounds` | `quest:the_rangers_trust` |
| `quest:the_letter_unposted` | `quest:the_trawlers_call` |
| `training_method:agility_seers_course` | `quest:inkweald_archives` |
| `training_method:boneyard_fossil_prayer` | `quest:bone_voyage` |
| `training_method:cooking_karambwan_1tick` | `quest:tai_bwo_wannai_trio` |
| `training_method:defence_chinchompa_stacking` | `quest:moryskah_requiem` |
| `training_method:fishing_monkfish_chill` | `quest:swan_song` |
| `training_method:heartlands_bell_tower_agility` | `quest:the_tiled_rooftops` |
| `training_method:heartlands_capital_agility` | `quest:the_tiled_rooftops` |
| `training_method:magic_burst_spells` | `quest:moryskah_requiem` |
| `training_method:mining_volcanic_mine` | `quest:bone_voyage` |
| `training_method:prayer_ectofuntus` | `quest:moryskah_haunting` |
| `training_method:ranged_chinchompas` | `quest:moryskah_requiem` |
| `training_method:smithing_cannonballs` | `quest:dwarf_cannon_quest` |
| `training_method:thieving_blackjacking` | `quest:feud_quest` |

## Dead-end islands — 1860 found

Nodes that nothing depends on. Some are legitimate terminal rewards (endgame bosses, cosmetic pets, capstone achievements). Others may be orphaned content that nothing gates behind it — in which case the "key" exists but has no downstream "door."

### By type breakdown

| Type | Dead-end count |
|------|---------------:|
| training_method | 896 |
| item_unlock | 262 |
| achievement | 122 |
| spell_unlock | 78 |
| area | 76 |
| recipe | 72 |
| npc | 69 |
| quest | 57 |
| teleport | 48 |
| minigame | 47 |
| prayer_unlock | 47 |
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
| `achievement:wilds_diary_easy` | achievement | Wilds Easy Diary | TERMINAL |
| `achievement:wilds_diary_elite` | achievement | Wilds Elite Diary | TERMINAL |
| `achievement:wilds_diary_hard` | achievement | Wilds Hard Diary | TERMINAL |
| `achievement:wilds_diary_medium` | achievement | Wilds Medium Diary | TERMINAL |
| `area:ascendant_spire` | area | The spire atop the Inkweald dream | REVIEW |
| `area:boneyard_first_empire_vault` | area | First Empire Vault — permanent bank access inside the ruins, rare relic respawns | REVIEW |
| `area:boneyard_kings_crypt` | area | Crypt of Kings — advanced slayer + all 3 Bones of Fallen Kings trial rooms unlocked at once | REVIEW |
| `area:boneyard_old_caravan_track` | area | Old Caravan Track — a pre-marked route with permanent respawn points for desert herbs and sand-wraiths. Only players who have walked the sister can navigate it without taking damage. | REVIEW |
| `area:boneyard_sealed_tomb` | area | Sealed Tomb of Senekhet | REVIEW |
| `area:crew_six_memorial` | area | Crew Six Memorial — small shrine in the foundry outer wall; interact for 20% smithing-xp buff, one hour, once per day. Only unlocks if you chose Tell Brun or Tell Vorath. | REVIEW |
| `area:deadhold_keep` | area | Deadhold Keep interior | REVIEW |
| `area:deep_sootworks_crew_seven_tunnel` | area | Crew Seven Tunnel — a permanently lit, permanently open deep-mine passage with unique ore (soot-vein copper) and a re-pressurable shortcut between Sootworks and Heartlands mines. | REVIEW |
| `area:drifting_market` | area | The Drifting Market | REVIEW |
| `area:drifting_market_private_cabin` | area | Nessa's private cabin — a second seat at the Drifting Market; access to off-charter goods that do not appear in the public stall. | REVIEW |
| `area:furnace_two_inner_chamber` | area | Furnace Two Inner Chamber (Oath-Sworn forge) — accessible only to pact-walkers. Contains the Oath-Sworn alloys tier and Fizz's calibration bench. | REVIEW |
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
| `area:refraction_threshold_audience` | area | Refraction Threshold Audience — a ritual approach site at the Wyrm's outer ring, usable for future tide-song petitions. No combat; pure ritual. | REVIEW |
| `area:saltbrine_counterfeit_vault` | area | Counterfeit Vault — a stash with three bank tabs that only you can access | REVIEW |
| `area:saltbrine_crows_nest_range` | area | Crow's Nest Range — sniper-shot rigging range, high-tier ranged training with storm-sway mechanic | REVIEW |
| `area:saltbrine_drifting_market` | area | The Drifting Market — floating bazaar that rotates between coastal ports; exclusive stock weekly | REVIEW |
| `area:saltbrine_ghost_anchorage` | area | Ghost Anchorage — unique fishing + ranged content | REVIEW |
| `area:saltbrine_scuttler_pits` | area | Scuttler Pits full access | REVIEW |
| `area:saltbrine_smugglers_cove` | area | Smuggler's Cove | REVIEW |
| `area:saltbrine_throne_rocks` | area | Throne Rocks — your seat, a private bank, and a balcony overlooking the open sea | REVIEW |
| `area:saltbrine_tower_upper` | area | The battlements of Saltbrine Tower | REVIEW |
| `area:saltbrine_wreck_coast` | area | The Wreck Coast — boat-only deep-water fishing grounds. Unique fish not found elsewhere. | REVIEW |
| `area:shrine_below_font` | area | Shrine Below Font — accessible only to the chain's completer (and, if REVIVE ending, to future pilgrims). Produces a unique reagent (Pilgrim's Draught) used in late-game Prayer, Magic, and Runecrafting tiers that require pre-cataclysm material. | REVIEW |
| `area:sootworks_forgotten_workshop` | area | Forgotten workshop — ancient smithing tools | REVIEW |
| `area:sootworks_foundation_seam` | area | Foundation Seam — unique mining area with hot-vein ore, fire-wight respawns | REVIEW |
| `area:sootworks_geyser_dock` | area | Geyser Dock — deepwell fishing spot + pressure-pot cooking station adjacent | REVIEW |

…1760 more not shown (full list in `data/progression-dag.json`)

## Truly orphaned quests

Quests that exist but nothing depends on their completion (no area gate, no downstream quest, no breakpoint chain). Candidates for review: either terminal rewards by design, or isolated content that needs a downstream tie-in.

Count: 57

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

- **Largest connected component:** 2680 / 2907 nodes (92.2%)
- **Breakpoint density:** 343 nodes unlock 5+ downstream (11.80%)
- **Dead-end ratio:** 1860 / 2907 (64.0%)
- **Cycle count:** 0
- **Broken refs:** 23

**Verdict:** CONNECTED METROIDVANIA — the graph is a single dominant web (>=80% of nodes in one component) with no circular gates. The balance diagnostic can plan paths end-to-end. Broken-ref count (23) reflects unregistered areas/quests referenced by training methods — these are fillable gaps, not structural breaks.

## Broken-ref breakdown

### Missing target by prefix

| Target prefix | Count |
|---------------|------:|
| `quest:` | 23 |

### Referring node by type

| Referring type | Count |
|----------------|------:|
| training_method | 13 |
| achievement | 6 |
| minigame | 3 |
| quest | 1 |

## v0.9 Wave A2 fix-pass summary

- **New area nodes added (C6):** 65 (skipped: 0)
- **Renames applied (C5):** 20
- **Retracts applied (C7):** 4
- **Duplicate requires removed:** 403

## DAG-builder lint (C15)

Catches drift-style naming errors at build time. `drift` and `wilds` buckets should be zero after C5 renames land; `other-missing` drops as content-pending quests ship.

- **Drift (`quest:<bare>` → `quest:the_<bare>`):** 0
- **Wilds (`area:the_wilds_*` → `area:wilds_*`):** 0
- **Other missing targets:** 23
