# v0.8 Chain Quests — Referenced but Undefined

Catalog of items, NPCs, areas, spells, and monsters referenced by the 5 v0.8
quest chains that do NOT yet have registry definitions. Post-merge agents
should fulfill these in `data/items/`, `data/bestiary/`, `src/engine/spellbooks/`,
etc., to wire up the chain content.

## Chain 1 — The Boneyard Archivist

### Items
- `under_glyph_rubbing` — pocket slot, chain-gated
- `decree_rubbing_of_the_thirteenth` — pocket, invokes thirteenth-month immunity
- `consecration_rubbing_of_the_seventh` — pocket, reveals true grave carvings
- `pyramid_blue_pulse_pattern` — pocket, detects time-loop enchantments
- `hermits_bronze_key` — key slot, fits one lock only
- `pre_crown_calendar_roll` — pocket, reads pre-Crown-dated documents
- `aureths_codex_trio` — spellbook bundle (three codices)
- `aureths_scribes_ring` — ring, ages world ledgers on action

### NPCs
- `keeper_aureth` — scribe of the pre-Crown archive, dead-but-looped
- `durra_sister_of_vorath` — Vorath's elder sister (shared with Chain 2)
- chancery clerk (anonymous ally, referenced from chain-1 and burn-wave3)

### Areas
- `pyramid_sixth_level_archive` — three-state access (sealed/Euthren/permanent)

### Spellbook
- `aureths_spellbook` with three spells: Chorus of the Month Omitted,
  Seal Against Unravelling, Aureth's Reply

### Training Methods
- `chancery_archive_thieving` (nocturnal, gated)
- `shard_mirror_runecrafting` (Glass Desert, high-attention)

## Chain 2 — Sootworks Silent Pact

### Items
- `fizzs_year_mark` — pocket, reveals part installation-year
- `wheelwrights_mirror_charm` — pocket, reveals wheel provenance
- `unread_pact_strip` / `oath_strip` — pocket, blank until grandmaster
- `black_ledger_contributors_list` — pocket, pact-friend recognition
- `nine_days_tally_stick` — pocket, compresses 9 in-game days
- `oath_ash_tin` — pocket, Pact Walker title

### NPCs
- `durra` — Vorath's elder sister, returned from the Glass Desert
- Saltbrine back-room contributor (unnamed woman, Nessa's partner)
- Crown inspector (day 5 visitor, canonically oblivious)

### Areas
- `furnace_two_inner_chamber` — Oath-Sworn forge

### Spellbook
- `pact_spellbook` with Silent Route, Oath-Sealed, Bellows' Second Name

### Training Methods
- `oath_sworn_smithing` (unique smithing tier)
- `ring_replacement_construction` (recurrent every 7 in-game years)
- `annex_open_door_runecrafting` (strip-paper reagent)
- `kael_hald_joint_smithing`

## Chain 3 — Saltbrine Twin-Tide

### Items
- `stormcrown_tide_mark` — pocket, reads tide-marks
- `brighs_fold_weight_copy` — pocket, doubles net-carry
- `gailin_residue_shard` — pocket, calms storms once
- `reef_song_memory` — known-songs codex entry
- `inner_spine_seven_names` — pocket, extra tide-read
- `sea_foam_cup` — pocket, one-time wilderness-death revive

### NPCs
- `priestess_elenne` — seventh Stormcrown tide-priestess
- `lenna` — tide-pool elder (already referenced in burn-wave3 margin-net)
- `pilgrim_echo` (shared with Chain 5; see Chain 5 for primary definition)

### Areas
- `stormcrown_inner_spine_trail` — neap-tide accessible
- `refraction_threshold_audience` — ritual approach site

### Spellbook
- `reef_priest_spellbook` with Stillwater, Tide-Signal, Storm-Parry,
  Brine-Restore, Song-Echo

### Teleport
- `stormcrown_shrine_teleport` — unique, gated by neap tides and twin-moons

### Training Methods
- `stormcrown_fold_practice` (crafting at tide-pool)
- `saltbrine_quay_fishing_pact` (Mara's pole, pact-price)
- `tide_walking` (traversal at full/new moons)

## Chain 4 — Veilwood Moonsong

### Items
- `tarras_silent_lute` / `six_moonsong_lute` / `moonsong_lute_rendered` —
  off-hand/pocket, three states across the chain
- `first_moonsong_fragment` through `seventh_moonsong_fragment` — pocket each,
  regional XP buffs when carried
- First Moonsong (Heartlands, Prayer)
- Second Moonsong (Moryskah, Herblore)
- Third Moonsong (Sootworks, Smithing)
- Fourth Moonsong (Glass Desert, Runecrafting)
- Fifth Moonsong (Inkweald/Veilwood, Magic)
- Sixth Moonsong (Saltbrine, Fishing)
- Seventh Moonsong (Veilwood canopy, unique emote)

### NPCs
- `tarras_veil` — Veilwood lute-maker, died 30 years ago, appears dreamed
- Stub (badger) — Mirelda's companion, rhythm-keeper
- Sael's apprentice (unnamed, holds the bow from the Veilmother chain)

### Areas
- `veilwood_canopy_outpost_sael_visits` — annual solstice visit

### Spellbook
- `moonsong_buff_system` — 7 non-interchangeable regional buffs
- The Hollow Choir adversaries (for grandmaster; existing boss)

### Training Methods
- `warren_listening_hunter` (badger-rhythm observation)
- `chapel_ash_sifting_herblore` (Dorin's bin, theological rep)
- `lucid_dreaming_magic` (dream-shore, ward amulet required)
- `archive_cantorial_transcription` (magic in Aureth's archive)

## Chain 5 — Glass Desert Pilgrimage

### Items
- `pilgrims_token` — pocket, tracks station bindings
- `shade_held_in_trust` — pocket, shadow-less movement
- `desert_memory_oil_jar` — pocket, skill-check re-do (pilgrimage only)
- `singing_shard_tone_memory` — pocket, pilgrim-recognition tone
- `should_have_been_self_image` — pocket, +1% XP passive
- `companion_name_carved` — pocket, pairs-skill +2% buff
- `pilgrims_cape` — cape slot, UNIQUE
- `shrine_below_font_access` — sigil

### NPCs
- `pilgrim_echo` — 9-century-old pilgrim dreamed memory; completes at Station 6

### Areas
- `spire_north_face_step` — Station Five meditation spot
- `spire_foot_chamber` — Station Six underchamber beneath Zel's office
- `shrine_below_font` — grandmaster access, produces Pilgrim's Draught

### Teleport
- `shrine_below_teleport` — unique, 24-hour cooldown

### Training Methods
- `dry_well_meditation_prayer` (pilgrim-specific prayer points)
- `mid_ring_runecrafting` (pilgrim-grade rune-shards)
- `pilgrims_draught_runecrafting` (high-attention, font-based)

### Monsters
- Sand-scribes (off-route enforcement on the pilgrimage) — not yet in bestiary
- Dune-wraith (Azhmari's court proxy at Shrine Below) — not yet in bestiary

## Cross-Chain References (bleed-through)

- Chain 1 ↔ Chain 4: Aureth's archive contains three of Tarras's moonsong fragments
- Chain 1 ↔ Chain 5: Zel's ancestor is the first Keeper of the mortuary wing
- Chain 2 ↔ Chain 3: Black Ledger Contributors List touches the Saltbrine back-room; tide-priestess salt-wick is a Sootworks pact-contribution
- Chain 2 ↔ Chain 5: Decoy-Maker's Stamp from Chain 2 speeds Chain 5's forgery step
- Chain 3 ↔ Chain 4: Reef-song memory is the sixth moonsong; Stormcrown melody appears in Aureth's archive
- Chain 3 ↔ Chain 1 (via burn-wave3): Gailin's residue is held in the Wyrm's alignment — chain-3 grandmaster branches on Alignment Beneath ending
- All chains ↔ burn-wave3: Old Sun Sigil is the once-per-life override, re-referenced in every chain grandmaster's items_brought list

## Items from burn-wave3 reused in v0.8 (already defined)

- `old_sun_sigil` — ring, once-per-life override
- `waxed_desert_compass` — pocket
- `ember_of_the_mire`
- `dragon_bones`
- `veldraks_given_scale`
- `refraction_lens_x3`
- `lucid_ward_pendant`
- `first_empire_signet`
- `live_ink_jar`

## Quests referenced that exist in other packs

- `the_bog_witchs_bargain`, `the_bog_witchs_errand`, `the_bog_witchs_final_curse`
- `sand_and_secrets`, `relics_of_the_old_world`, `the_boneyard_compass`
- `the_last_dragon_p3`, `sandglass_sage_ascension`, `the_glass_prophecy`
- `the_second_question`, `the_scholars_cipher`, `the_cipher_we_lost`
- `the_tide_pool_collector`, `echoes_of_the_deep`, `the_trawlers_call`
- `the_siren_of_saltbrine`
- `the_inkweald_door`, `the_inkweald_second_door`, `the_draft_signature`,
  `the_inkweald_grandmaster_dream`
- `crew_six_after_the_pour`, `the_map_that_was_never_drawn`
- `keeper_aureths_seal` (chain-1 internal), `the_twin_tide_reconciled` (chain-3 internal)
- `heartlands_patrol`, `roots_of_the_old_growth`
- `the_alignment_beneath` (burn-wave3-part3; hard dep for chain-3 GM)

## Notes for post-merge agents

1. No item-bestiary entries were touched; this doc is the handoff.
2. Every chain grandmaster requires cross-chain items — items agent should
   prioritize the tokens / rubbings / strips in chains 1, 2, 3 so the master
   and grandmaster quests are completable.
3. The Pilgrim's Draught (chain 5) is deliberately designed as the only
   pre-cataclysm reagent; late-game recipes that require it should route
   through chain 5 or its REVIVE-ending repeatable variant.
4. Three of the chain grandmasters (1, 2, 5) reference `old_sun_sigil` in
   their items_brought — burn-wave3 defined this; ensure it persists.
5. Each chain grandmaster has three endings; all three are canon
   simultaneously. Downstream content (future waves) must branch accordingly
   rather than selecting one as "the" ending.
