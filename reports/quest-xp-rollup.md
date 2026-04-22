# Quest XP Rollup

**Generated:** 2026-04-22
**Quests loaded:** 224
**Skills covered:** 23
**Total quest-reward XP (all skills):** 8,526,000
**Quests with `unlocks`:** 133 / 224
**Quests with `chain_next`:** 87 / 224

## Purpose

Diagnostic aid for the balance-diagnostic team. Shows where the
quest book distributes XP so "under-rewarded skill" gaps show up.

- **Total XP** = sum of `rewards.xp` across every quest that awards that skill.
- **#Quests** = distinct quests contributing any XP to the skill.
- **Top quest** = single highest-XP reward (useful for checking outliers).
- **Downstream DAG** = nodes unlocked (transitively) by completing the quest.

## Per-skill XP totals

| Skill | Total XP | #Quests | Top quest | Top XP |
|---|---:|---:|---|---:|
| magic | 1,478,800 | 102 | The Shrine Below (`the_shrine_below`) | 110,000 |
| prayer | 999,500 | 88 | The Twin-Tide Reconciled (`the_twin_tide_reconciled`) | 80,000 |
| agility | 688,600 | 85 | The Shrine Below (`the_shrine_below`) | 55,000 |
| thieving | 619,300 | 70 | The Pharaoh's Reckoning (`pharaohs_reckoning_prelude`) | 50,000 |
| attack | 509,300 | 53 | Coronation of the Revenant King (`the_wilds_grandmaster_crown`) | 40,000 |
| herblore | 499,350 | 64 | The Bog Witch's Final Curse (`the_bog_witchs_final_curse`) | 35,000 |
| hitpoints | 468,800 | 32 | The Shrine Below (`the_shrine_below`) | 50,000 |
| crafting | 430,750 | 75 | The Oath Unwritten (`the_oath_unwritten`) | 30,000 |
| mining | 410,900 | 56 | The Oath Unwritten (`the_oath_unwritten`) | 45,000 |
| smithing | 405,100 | 37 | The Oath Unwritten (`the_oath_unwritten`) | 85,000 |
| ranged | 315,600 | 28 | The Infernal Challenge (`infernal_challenge`) | 75,000 |
| construction | 262,900 | 25 | The Oath Unwritten (`the_oath_unwritten`) | 90,000 |
| fishing | 251,500 | 33 | The Twin-Tide Reconciled (`the_twin_tide_reconciled`) | 60,000 |
| hunter | 199,650 | 22 | The Twin-Tide Reconciled (`the_twin_tide_reconciled`) | 30,000 |
| runecrafting | 198,250 | 23 | The Shrine Below (`the_shrine_below`) | 25,000 |
| defence | 172,950 | 24 | The Alignment Beneath (`the_alignment_beneath`) | 35,000 |
| cooking | 114,650 | 23 | The Grand Feast (`the_heartlands_grandmaster_feast`) | 50,000 |
| firemaking | 105,700 | 20 | The Oath Unwritten (`the_oath_unwritten`) | 25,000 |
| farming | 104,800 | 18 | The Veilwood Grandmaster Rite (`the_veilwood_grandmaster_rite`) | 30,000 |
| slayer | 99,500 | 11 | The Slayer's Grandmaster Trial (`slayers_grandmaster_trial`) | 40,000 |
| strength | 82,450 | 16 | Dragon Slayer (`dragon_slayer`) | 18,650 |
| woodcutting | 68,100 | 20 | The Veilwood Grandmaster Rite (`the_veilwood_grandmaster_rite`) | 30,000 |
| fletching | 39,550 | 9 | The Seventh Moonsong, Sung (`the_seventh_moonsong_sung`) | 18,000 |

## Per-quest rollup (top 50 by total XP)

| Quest | Difficulty | QP | Total XP | Skills | Unlocks | Downstream |
|---|---|---:|---:|---|---:|---:|
| The Shrine Below (`the_shrine_below`) | Grandmaster | 5 | 445,000 | magic, prayer, agility +7 | 6 | 6 |
| The Twin-Tide Reconciled (`the_twin_tide_reconciled`) | Grandmaster | 5 | 424,000 | magic, prayer, fishing +6 | 6 | 6 |
| The Oath Unwritten (`the_oath_unwritten`) | Grandmaster | 5 | 420,000 | construction, smithing, mining +7 | 5 | 5 |
| The Seventh Moonsong, Sung (`the_seventh_moonsong_sung`) | Grandmaster | 5 | 388,000 | magic, prayer, attack +8 | 5 | 5 |
| Keeper Aureth's Seal (`keeper_aureths_seal`) | Grandmaster | 5 | 322,000 | magic, prayer, thieving +6 | 5 | 23 |
| The Alignment Beneath (`the_alignment_beneath`) | Grandmaster | 5 | 307,000 | magic, attack, defence +6 | 5 | 12 |
| The Veilwood Grandmaster Rite (`the_veilwood_grandmaster_rite`) | Grandmaster | 5 | 225,000 | agility, construction, farming +5 | 3 | 5 |
| The Second Question (`the_second_question`) | Grandmaster | 5 | 225,000 | magic, prayer, agility +6 | 5 | 78 |
| The Infernal Challenge (`infernal_challenge`) | Grandmaster | 2 | 195,000 | ranged, magic, prayer +2 | 3 | 10 |
| The Last Adventurer (`the_last_adventurer`) | Grandmaster | 5 | 187,000 | attack, strength, defence +20 | 0 | 0 |
| Nine Days to Pour Two Cold (`nine_days_to_pour_two_cold`) | Master | 4 | 157,000 | construction, smithing, thieving +5 | 4 | 10 |
| The Clockwork Heart (`sootworks_grandmaster_titan`) | Grandmaster | 5 | 130,000 | smithing, construction, crafting +2 | 3 | 3 |
| Sandglass Sage Ascension (`sandglass_sage_ascension`) | Grandmaster | 5 | 112,000 | magic, prayer, runecrafting +2 | 3 | 95 |
| The Seven Names on the Inner Spine (`the_seven_names_on_the_inner_spine`) | Master | 4 | 112,000 | agility, fishing, prayer +4 | 4 | 11 |
| Aureth's Fragment Score (`aureths_fragment_score`) | Master | 4 | 109,000 | magic, thieving, prayer +3 | 4 | 10 |
| The Pharaoh's Reckoning (`pharaohs_reckoning_prelude`) | Grandmaster | 5 | 105,000 | thieving, agility, magic +2 | 3 | 3 |
| Coronation of the Revenant King (`the_wilds_grandmaster_crown`) | Grandmaster | 5 | 105,000 | attack, ranged, prayer +2 | 3 | 5 |
| The Lost God Returns (`the_lost_god_returns`) | Grandmaster | 5 | 104,000 | prayer, magic, attack +2 | 3 | 3 |
| The Grand Feast (`the_heartlands_grandmaster_feast`) | Grandmaster | 5 | 103,000 | cooking, farming, fishing +2 | 3 | 3 |
| The Spire's Foot (`the_spires_foot`) | Master | 4 | 103,000 | thieving, mining, magic +4 | 4 | 11 |
| The Calendar Before the Calendar (`the_calendar_before_the_calendar`) | Master | 4 | 98,000 | magic, thieving, crafting +4 | 4 | 28 |
| The Fight Caves (`fight_caves`) | Grandmaster | 1 | 97,000 | ranged, prayer, hitpoints +1 | 2 | 15 |
| The Soot-Mouth Seven (`the_soot_mouth_seven`) | Master | 4 | 95,000 | smithing, mining, firemaking +3 | 4 | 4 |
| The Shattered Covenant (`the_shattered_covenant`) | Grandmaster | 5 | 92,000 | attack, magic, prayer +5 | 0 | 3 |
| The Last Light of the Old Sun (`the_last_light`) | Grandmaster | 5 | 88,000 | attack, magic, prayer +4 | 3 | 11 |
| Admiral's Last Voyage (`admirals_last_voyage`) | Grandmaster | 5 | 83,000 | fishing, attack, ranged +2 | 3 | 3 |
| The Cartography Grandmaster (`the_cartography_grandmaster`) | Grandmaster | 4 | 79,000 | agility, thieving, firemaking +2 | 3 | 3 |
| Crew Six, After the Pour (`crew_six_after_the_pour`) | Master | 4 | 75,000 | smithing, mining, thieving +3 | 4 | 42 |
| The Final Threshold (`exodus_key`) | Grandmaster | 5 | 75,000 | attack, magic, ranged +6 | 1 | 1 |
| The Last Prayer (`the_last_prayer`) | Grandmaster | 4 | 74,000 | prayer, attack, magic +2 | 3 | 3 |
| The Slayer's Grandmaster Trial (`slayers_grandmaster_trial`) | Grandmaster | 4 | 71,000 | slayer, attack, ranged +2 | 3 | 3 |
| The World Wound (`the_world_wound`) | Grandmaster | 5 | 70,000 | magic, prayer, runecrafting +2 | 0 | 1 |
| Waking the Dreaming One (`the_inkweald_grandmaster_dream`) | Grandmaster | 5 | 69,000 | magic, herblore, runecrafting +2 | 3 | 12 |
| The Last Dragon — Part 3: Veldrak (`the_last_dragon_p3`) | Grandmaster | 5 | 65,000 | attack, strength, defence +3 | 1 | 210 |
| The Barrows Brothers (`barrows_brothers`) | Experienced | 2 | 63,000 | attack, magic, prayer +2 | 2 | 5 |
| The Bog Witch's Final Curse (`the_bog_witchs_final_curse`) | Grandmaster | 4 | 63,000 | herblore, prayer, magic +2 | 3 | 3 |
| The Cipher We Lost (`the_cipher_we_lost`) | Master | 4 | 62,000 | thieving, magic, prayer +2 | 4 | 28 |
| The Architect of Ruin (`the_architect_of_ruin`) | Grandmaster | 5 | 61,000 | construction, smithing, magic +2 | 0 | 4 |
| The Eternal Hunt (`the_eternal_hunt`) | Grandmaster | 5 | 60,000 | hunter, slayer, ranged +2 | 0 | 0 |
| The Crystal Key (`coa_key`) | Master | 3 | 57,000 | mining, magic, agility +2 | 2 | 3 |
| The Werewolf's Dilemma (`the_werewolfs_dilemma`) | Experienced | 2 | 53,000 | herblore, prayer, magic +1 | 2 | 10 |
| The Map That Was Never Drawn (`the_map_that_was_never_drawn`) | Master | 4 | 53,000 | thieving, crafting, firemaking +2 | 4 | 21 |
| Gailin's Last Residue (`gailins_last_residue`) | Experienced | 3 | 49,000 | magic, prayer, fishing +3 | 4 | 16 |
| The Hollow King (`the_hollow_king`) | Grandmaster | 5 | 44,000 | attack, magic, prayer +2 | 0 | 0 |
| The Counterfeit Empire (`the_counterfeit_empire`) | Master | 3 | 43,000 | thieving, crafting, magic +1 | 3 | 7 |
| The Dream of the Fifth Moonsong (`the_dream_of_the_fifth_moonsong`) | Experienced | 3 | 42,500 | magic, prayer, herblore +2 | 4 | 15 |
| The Weeping Glass and the Shard That Sings (`the_weeping_glass_and_the_shard_that_sings`) | Experienced | 3 | 42,500 | magic, thieving, prayer +2 | 4 | 21 |
| The Bellows Wheel's Second Name (`the_bellows_wheels_second_name`) | Experienced | 3 | 41,500 | crafting, thieving, agility +2 | 4 | 20 |
| The Crystal Warden (`the_crystal_warden`) | Grandmaster | 5 | 40,000 | defence, magic, mining +2 | 0 | 0 |
| The Comet of Ash (`the_comet_of_ash`) | Master | 4 | 40,000 | magic, herblore, prayer +2 | 3 | 3 |

## Critical-path quests (top 25 by downstream DAG value)

Quests whose completion opens the largest subtree of the
progression DAG. These are what the planner prioritises for
unlock-chasing bots.

| Quest | Downstream | Total XP | Unlocks | Chain next |
|---|---:|---:|---:|---|
| Sand and Secrets (`sand_and_secrets`) | 773 | 2,000 | 1 | relics_of_the_old_world |
| The Bog Witch's Bargain (`the_bog_witchs_bargain`) | 585 | 2,300 | 2 | the_bog_witchs_hunger |
| Sootworks Rising (`sootworks_rising`) | 479 | 8,500 | 2 | the_forge_beneath |
| Blood Rites (`blood_rites`) | 328 | 10,000 | 1 | — |
| The Glass Prophecy (`the_glass_prophecy`) | 259 | 9,000 | 0 | the_last_dragon_p1 |
| The Inkweald Door (`the_inkweald_door`) | 225 | 7,000 | 1 | the_hollow_choirs_song |
| The Last Dragon — Part 1: Awakening (`the_last_dragon_p1`) | 221 | 16,000 | 0 | the_last_dragon_p2 |
| Echoes of the Deep (`echoes_of_the_deep`) | 214 | 12,000 | 2 | prophecy_fragments |
| The Last Dragon — Part 2: The Dragon Gate (`the_last_dragon_p2`) | 211 | 10,000 | 0 | the_last_dragon_p3 |
| The Last Dragon — Part 3: Veldrak (`the_last_dragon_p3`) | 210 | 65,000 | 1 | the_last_light |
| Foundations of the Fallen (`foundations_of_the_fallen`) | 179 | 6,000 | 2 | — |
| Desert Treasure (`desert_treasure`) | 141 | 23,000 | 1 | — |
| The Scholar's Cipher (`the_scholars_cipher`) | 111 | 10,000 | 3 | — |
| Prophecy Fragments (`prophecy_fragments`) | 103 | 21,000 | 3 | sandglass_sage_ascension |
| Sandglass Sage Ascension (`sandglass_sage_ascension`) | 95 | 112,000 | 3 | — |
| Pirate King (`pirate_king`) | 92 | 4,000 | 2 | the_pirate_kings_gold |
| The Second Question (`the_second_question`) | 78 | 225,000 | 5 | — |
| The Green Thumb (`the_green_thumb`) | 59 | 1,800 | 1 | the_druids_covenant |
| Relics of the Old World (`relics_of_the_old_world`) | 59 | 6,000 | 0 | pharaohs_reckoning_prelude |
| The Drifting Market Charter (`drifting_market_charter`) | 51 | 7,500 | 1 | rfd_start |
| The Sootworks Heist (`the_sootworks_heist`) | 48 | 11,500 | 0 | — |
| The Glyph Beneath the Glyph (`the_glyph_beneath_the_glyph`) | 45 | 3,600 | 3 | the_month_that_was_omitted |
| Lunar Diplomacy (`lunar_diplomacy`) | 43 | 21,000 | 2 | — |
| The Inkweald Second Door (`the_inkweald_second_door`) | 42 | 30,000 | 3 | the_inkweald_grandmaster_dream |
| Crew Six, After the Pour (`crew_six_after_the_pour`) | 42 | 75,000 | 4 | the_map_that_was_never_drawn |

## Quests awarding zero XP (0)

_None — every quest awards at least 1 skill XP._

---

_Generated by `scripts/gen-quest-xp-rollup.js`._
