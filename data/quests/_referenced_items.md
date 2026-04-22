# Burn Wave 3 — Quest-Referenced Item IDs (for items agent)

These item IDs are **referenced** by 20 new burn-wave3 quests but may not yet be
defined in `data/items/` or `src/content/aelgard/items-*.js`. Items agent should
scan this list post-merge and either (a) define any missing items, or (b) patch
the quest files with real existing IDs if the concept already exists.

All IDs are snake_case. Inventory category hints in parentheses.

## Unique Quest Rewards (non-degenerate, Marstead rule)

| ID | Quest | Slot / Role | Notes |
|--|--|--|--|
| `jess_of_quiet_thanks` | the_falconers_quiet_debt | glove | Hunter: traps don't spook songbirds within 12 tiles |
| `palate_of_the_grand_hall` | the_ambassadors_soup | cape | +2% cooking burn reduction, ending-dependent inscription |
| `bels_cipher_crib` | the_scholars_cipher | pocket | Reads cipher-tagged notes globally |
| `counter_sung_salve_recipe` | the_counter_sung_salve | consumable | Recipe item; reveals the "Counter-Sung Salve" herblore recipe |
| `knife_scar_sigil` | the_portrait_at_the_back_of_the_bar | pocket | Unique teleport Mara↔Nessa |
| `first_torven_tally` | the_lamp_behind_the_desk | pocket | Grants private seam mining access 1h/day |
| `pre_pour_ledger_copy` | crew_six_after_the_pour | quest item | Copy of Crew Six evidence |
| `brazers_guilty_apron` | crew_six_after_the_pour | body | -12% smithing burn chance; ending-inscribed |
| `brothers_glass_marble` | walk_wide_guest | pocket | -50% sandstorm/heat damage while held |
| `old_sun_sigil` | the_second_question | ring | Once-per-account overwrite of one future quest outcome |
| `yaras_quill` | the_draft_signature | pocket | Once/day writes a 1-hr skill-check ward |
| `live_ink_jar` | the_draft_signature | consumable | Ingredient for live-ink crafting |
| `reeds_knot_thread` | the_charter_nobody_writes | pocket | Re-ties if severed; binds crafted containers (pickpocket-proof) |
| `sessens_last_jess` | sessens_last_flight | glove | Bonds to next hunter-trained bird; +5 effective hunter while that bird lives |
| `kin_rite_brass_bell` | sessens_last_flight | pocket | Silences hunter-trap noise penalty; Boneyard 50% faster recharge |
| `crew_seven_tally_frame` | the_soot_mouth_seven | decorative quest item | Goes on Crow wall NPC-side |
| `hald_loaned_hammer` | the_soot_mouth_seven | main-hand (smithing only) | +3 effective smithing, returns to Hald on death |
| `tsunaras_wave_sigil` | the_tide_that_did_not_rise | ring | Underwater only: +3 agility, wave-trail dash |
| `reeds_trip_log` | the_letter_unposted | pocket | Shows Bittern-catchable species per-region once/day |
| `third_cipher_final_crib` | the_cipher_we_lost | pocket | ONLY way to read pre-current-Crown dispatches |
| `wyrm_scale_cape` | the_alignment_beneath | cape | Refracts 1 incoming attack/encounter; ending-inscribed |
| `lennas_smaller_net` | the_margin_net_refolded | pocket | Occasional double-catch at tide pools; no slot when in sack |
| `decoy_makers_stamp` | the_map_that_was_never_drawn | pocket | 1 forgery/day, passes most NPC checks |
| `longest_night_rite_token` | the_fourth_name_on_the_stone | pocket | Once/year ritual resets 1 grief/guilt flag |
| `palate_certification` | the_ambassadors_soup | quest flag-item | Tracks the ending chosen; tied to `palate_of_the_grand_hall` |

## Required Items Brought to Quests (consumables / pre-reqs)

These items are **consumed as inputs** by quests. Some are defined by the item
agent in other waves already (marked with *✓ expected*); others are newly
referenced and need definition.

| ID | Used by | Source (if known) |
|--|--|--|
| `waxed_desert_compass` | the_second_question | new — Boneyard caravan vendor |
| `ember_of_the_mire` | the_second_question, the_alignment_beneath | *✓ expected (bestiary/items agent)* |
| `dragon_bones` | the_second_question, the_alignment_beneath | *✓ expected (items agent / standard OSRS-parity)* |
| `fossilised_sun_coin` | the_second_question | new — Boneyard archaeology find |
| `unsigned_letter_from_a_scholar` | the_second_question | new — narrative item from the_scholars_cipher branch |
| `a_single_grain_of_glass` | the_second_question | new — given by Razak after walk_wide_guest |
| `tide_pool_jar_x5` (5 `tide_pool_jar`) | the_second_question, the_tide_that_did_not_rise | new — craftable at Saltbrine (Crafting ~30) |
| `veilwood_shade_cloth` | the_second_question, the_tide_that_did_not_rise, walk_wide_guest | new — Veilwood cloth tier (Crafting ~35) |
| `salt_wick` | the_second_question, the_tide_that_did_not_rise | new — Saltbrine firemaking utility, single-use |
| `veldraks_given_scale` | the_alignment_beneath | expected drop from the_last_dragon_p3 quest completion flow |
| `refraction_lens_x3` (3 `refraction_lens`) | the_alignment_beneath | new — Glass Desert crafting (Crafting ~65) |
| `lucid_ward_pendant` | the_alignment_beneath | new — Inkweald dream magic drop |
| `first_empire_signet` | the_alignment_beneath | *✓ expected* — unlocked by existing `the_boneyard_first_empire_rite` quest |

## Consumed Post-Ritual / Not Returned

- `salt_wick` (single-use, six copies consumed in `the_second_question`)
- `live_ink_jar` (ingredient for Inkweald live-ink crafting method post-`the_draft_signature`)
- `refraction_lens` (three consumed during `the_alignment_beneath`)

## Naming Conflicts To Resolve

None expected. All new IDs use `snake_case` and no existing ID in `data/items/`
or `src/content/aelgard/items-*.js` uses these (spot-checked against `items-blitz.js`,
`items-blitz2.js`, `items-blitz3.js`, `items-dragon-barrows.js`, `items-expanded.js`).
Items agent please confirm during merge.
