# Burn Wave 3 — Quest-Referenced Monster IDs (for bestiary agent)

These monsters are **referenced** (usually as fight encounters or obstacles) by
20 new burn-wave3 quests but may not yet exist in `data/monsters*`,
`data/bestiary/`, or `src/content/aelgard/monsters-*.js`. Bestiary agent should
scan this list post-merge and define the missing ones or map to existing IDs.

All names are **region-consistent with existing bestiary tone**.

## Encounter-Tier Monsters (combat)

| ID | Quest | Region | Combat Tier | Notes |
|--|--|--|--|--|
| `sand_wraith_of_the_lost_caravan` | walk_wide_guest | Boneyard | mid-tier | Non-combat if player doesn't speak; otherwise mid-combat undead; unique drop: `brothers_glass_marble` (quest-only) |
| `dreamed_future_self` | the_draft_signature, the_alignment_beneath | Inkweald, Glass Desert | cameo/non-combat | Walks past player in 2nd/3rd grove; if attacked, counts as quest failure |
| `refraction_phase_guardian` | the_alignment_beneath | Glass Desert (Inner Crystal Caverns) | high-tier | Optional fight if Wyrm alignment not pre-met; refraction mechanic |
| `the_crystal_wyrm_alignment_phases` | the_alignment_beneath | Glass Desert (Inner Crystal Caverns) | grandmaster | **NOTE: the NPC `crystal_wyrm` bible already exists**; this references the fight phases (prism / cleavage / alignment). Bestiary agent please ensure encounter stats exist for all three phases. |
| `laundry_wight_slayer_target_variant` | — | Moryskah | referenced in existing `slayers_grandmaster_trial` | Already referenced by existing quest; listing for coordination |

## Non-Combat Named NPCs (referenced but not bible'd)

These are narrative-only named figures used once or twice. Bestiary agent does
not need full bibles for them, but a dialogue line or two would help the live
narrator.

| Name | Quest | Role |
|--|--|--|
| Nan Borrow | — | Already referenced in existing `the_runaway_golem` quest narrative |
| Grudd Coalwatch | — | Already referenced in existing `the_runaway_golem` |
| Lenna Fathomkeep | the_margin_net_refolded | Bent-backed tide-pool weaver; Saltbrine shingle NPC |
| Old Weaver Mollesh | — | Already in `the_tide_pool_collector` narrative |
| Farmer Aldwin | — | Already in `the_green_thumb` |
| Boy with ink on his fingers | the_scholars_cipher | One-scene Moryskah border-inn NPC |
| Moryskah middleman | the_scholars_cipher | Smuggler-row fence; silent handover scene |
| Heartlands post-carter (unnamed) | the_falconers_quiet_debt | One-scene barn NPC |
| Razak's cousin | sessens_last_flight | Boneyard bird-relic collector, kin-rite keeper |
| the sister (unnamed) | walk_wide_guest | Sister of lost-caravan victim |
| Reed's sister | the_letter_unposted | Heartlands farmer, Reed's sister (unnamed in-game; players never learn her name) |
| Heartlands chancery clerk | the_cipher_we_lost, the_map_that_was_never_drawn | Anonymous ally; delivers a coin once per month |
| Father Dorin's wife (deceased) | the_cipher_we_lost | Posthumous, referenced via gravestone and poem |
| Veris's brother (deceased) | the_scholars_cipher, the_cipher_we_lost | Posthumous, name unspoken |
| Aldric (deceased Bittermarsh captain) | the_fourth_name_on_the_stone | Posthumous; name spoken aloud exactly once in this quest |

## Existing NPCs Used as Quest-Givers (bible exists in data/npc-bibles.json)

For bestiary agent's reference — do not re-bible these. Just ensure spawn/dialogue
flags match post-merge:

- `royal_falconer` (used in 2 quests: the_falconers_quiet_debt, sessens_last_flight)
- `evil_chef` (the_ambassadors_soup)
- `wandering_scholar` (the_scholars_cipher, the_cipher_we_lost)
- `archaeologist_veris` (the_scholars_cipher, the_cipher_we_lost, the_second_question)
- `apothecary_nira` (the_counter_sung_salve)
- `mirelda_bog_witch` (the_counter_sung_salve)
- `bog_witch_grael` (the_counter_sung_salve)
- `father_dorin` (the_counter_sung_salve, the_cipher_we_lost, the_fourth_name_on_the_stone)
- `fishmonger_mara` (the_portrait_at_the_back_of_the_bar, the_letter_unposted, the_margin_net_refolded, the_tide_that_did_not_rise)
- `whisper_broker_nessa` (the_portrait_at_the_back_of_the_bar, the_charter_nobody_writes)
- `innkeeper_vash` (the_portrait_at_the_back_of_the_bar, the_soot_mouth_seven)
- `harbourmaster_cole` (the_portrait_at_the_back_of_the_bar, the_charter_nobody_writes)
- `overseer_greta` (the_lamp_behind_the_desk, the_soot_mouth_seven)
- `forgemaster_brun` (crew_six_after_the_pour, the_soot_mouth_seven)
- `engineer_fizz` (crew_six_after_the_pour, the_soot_mouth_seven, the_map_that_was_never_drawn)
- `drunken_dwarf_ossen` (crew_six_after_the_pour, the_soot_mouth_seven, the_map_that_was_never_drawn)
- `vorath_warden` (the_soot_mouth_seven)
- `smith_hald` (the_soot_mouth_seven)
- `smith_kael` (the_fourth_name_on_the_stone, the_soot_mouth_seven sixth-chair option)
- `razak` (walk_wide_guest, the_second_question, sessens_last_flight collector is his cousin)
- `hermit_of_the_old_sun` (the_second_question)
- `lucid_keeper_yara` (the_draft_signature)
- `the_inkweald_muse` (the_draft_signature)
- `captain_alden` (the_fourth_name_on_the_stone)
- `captain_reed` (the_letter_unposted, the_tide_that_did_not_rise, the_charter_nobody_writes)
- `first_mate_brigh` (the_letter_unposted)
- `tsunara_storm_twin` (the_tide_that_did_not_rise)
- `crystal_wyrm` (the_alignment_beneath)
- `crystal_sage_orin` (the_alignment_beneath)
- `veldrak_last_dragon` (the_alignment_beneath)
- `merchant_hilde` (the_falconers_quiet_debt, sessens_last_flight, the_ambassadors_soup "anonymous" ending)
