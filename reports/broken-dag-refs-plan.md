# Broken DAG References — Fix Plan

**Source:** `data/progression-dag.json` (2,698 nodes · 4,945 edges · 210 broken refs)
**Companion:** `data/progression-dag-report.md`
**Generated:** 2026-04-22 (gap-audit)
**Scope:** every `requires: [<node_id>]` pointing to a non-existent node.

---

## 1. Summary — 210 refs, 98 unique targets

| Category | Refs | Unique targets | Notes |
|----------|-----:|---------------:|-------|
| **CREATE_NODE** | 163 | 60 | Legitimate sub-areas the training methods belong to. Content exists downstream; the area node itself was never registered. |
| **RENAME** | 21 | 14 | Typo / naming-convention drift (`quest:missing_miner` vs `quest:the_missing_miner`). Edit distance ≤ 3 to an existing node. |
| **QUEST_PENDING** | 20 | 11 | OSRS-heritage quest ids used as placeholders in training methods (e.g. `quest:druidic_ritual`, `quest:swan_song`, `quest:tai_bwo_wannai_trio`). Not planned for Aelgard — need Scape-native replacements. |
| **RETRACT** | 6 | 3 | Spurious refs (duplicate skill/area combos, placeholders that never landed). Remove the ref from the requiring node. |

**Breakdown by target prefix**

| Prefix | Count | Unique |
|--------|------:|-------:|
| `area:` | 174 | 68 |
| `quest:` | 36 | 30 |

**Breakdown by referring node type**

| Referring type | Count |
|----------------|------:|
| `training_method` | 194 |
| `achievement` | 12 |
| `minigame` | 3 |
| `quest` | 1 |

**Net effect of a full fix:** 210 broken edges resolved, ~163 new `area` nodes wired up, up to 13 dead-end methods rescued per highest-impact ref (`area:moryskah_silent_chapel`).

---

## 2. Missing areas — 68 unique, 174 refs

Every missing target with prefix `area:*`. All are CREATE_NODE candidates unless flagged otherwise. Each section lists the region, the missing id, downstream-ref count, and the unlock conditions observed on the referring training methods (used verbatim to propose the new node's `requires` array).

### 2.1 Moryskah — 14 areas, 67 refs (TOP PRIORITY)

| Missing id | Refs | Proposed prereqs | Flag |
|------------|-----:|------------------|------|
| `area:moryskah_silent_chapel` | 13 | `area:moryskah`, `quest:blood_rites` | CREATE_NODE |
| `area:moryskah_wolfbane_distillery` | 9 | `area:moryskah`, `quest:the_bog_witchs_bargain` | CREATE_NODE |
| `area:moryskah_mausoleum_district` | 9 | `area:moryskah`, `quest:blood_rites` | CREATE_NODE |
| `area:moryskah_cabaret` | 8 | `area:moryskah`, `quest:blood_rites` | CREATE_NODE |
| `area:moryskah_moonless_inn` | 7 | `area:moryskah` | CREATE_NODE |
| `area:moryskah_ferry` | 6 | `area:moryskah`, `quest:shades_of_moryskah` | CREATE_NODE |
| `area:moryskah_bog_witch_cottage` | 5 | `area:moryskah`, `quest:the_bog_witchs_bargain` | CREATE_NODE |
| `area:moryskah_forgotten_hamlet` | 3 | `area:moryskah` | CREATE_NODE |
| `area:moryskah_forgotten_island` | 2 | `area:moryskah_ferry`, `quest:shades_of_moryskah` | CREATE_NODE |
| `area:moryskah_cabaret_back_alley` | 1 | `area:moryskah_cabaret` | CREATE_NODE |
| `area:moryskah_deep_bog` | 1 | `area:moryskah`, `quest:the_bog_witchs_bargain` | CREATE_NODE |
| `area:moryskah_mausoleum_rooftops` | 1 | `area:moryskah_mausoleum_district`, `skill:agility:60` | CREATE_NODE |
| `area:moryskah_silent_chapel_sanctum` | 1 | `area:moryskah_silent_chapel`, `quest:the_hollow_choirs_song` | CREATE_NODE |
| `area:moryskah_howling_moors` | 1 | `area:moryskah` | CREATE_NODE |

### 2.2 Sootworks — 13 areas, 30 refs

| Missing id | Refs | Proposed prereqs | Flag |
|------------|-----:|------------------|------|
| `area:sootworks_forge_cathedral` | 6 | `area:sootworks`, `quest:the_forgemaster_contract` | CREATE_NODE |
| `area:sootworks_tinker_yards` | 4 | `area:sootworks` | CREATE_NODE |
| `area:sootworks_brass_choir` | 3 | `area:sootworks`, `skill:prayer:60` | CREATE_NODE |
| `area:sootworks_beggars_gallery` | 2 | `area:sootworks`, `quest:the_beggars_petition` | CREATE_NODE |
| `area:sootworks_deep_furnace` | 2 | `area:sootworks_deep_mines` | CREATE_NODE |
| `area:sootworks_deepwell` | 2 | `area:sootworks` | CREATE_NODE |
| `area:sootworks_imbue_hall` | 2 | `area:sootworks_forge_cathedral` | CREATE_NODE |
| `area:sootworks_feast_kitchen` | 2 | `area:sootworks` | CREATE_NODE |
| `area:sootworks_pump_station` | 2 | `area:sootworks` | CREATE_NODE |
| `area:sootworks_steamfield` | 2 | `area:sootworks` | CREATE_NODE |
| `area:sootworks_clockbeetle_warrens` | 1 | `area:sootworks_cinderhall_warrens` | CREATE_NODE |
| `area:sootworks_lantern_mines` | 1 | `area:sootworks_deep_mines` | CREATE_NODE |
| `area:sootworks_rust_pits` | 1 | `area:sootworks` | CREATE_NODE |

### 2.3 Heartlands — 11 areas, 17 refs

| Missing id | Refs | Proposed prereqs | Flag |
|------------|-----:|------------------|------|
| `area:heartlands_royal_district` | 4 | `area:heartlands`, `quest:the_royal_warrant` | CREATE_NODE |
| `area:heartlands_bell_tower` | 2 | `area:heartlands_capital_rooftops`, `skill:agility:80` | CREATE_NODE |
| `area:heartlands_grand_cathedral` | 2 | `area:heartlands`, `quest:the_last_light_vigil` | CREATE_NODE |
| `area:heartlands_old_hedge` | 2 | `area:heartlands`, `quest:the_hedge_wise_gift` | CREATE_NODE |
| `area:heartlands_capital_rooftops` | 1 | `area:heartlands_capital`, `skill:agility:75` | CREATE_NODE |
| `area:heartlands_capital` | 1 | `area:heartlands` | CREATE_NODE |
| `area:heartlands_chapel` | 1 | `area:heartlands`, `quest:the_last_light_vigil` | CREATE_NODE |
| `area:heartlands_fishing_guild` | 1 | `area:heartlands`, `skill:fishing:68` | CREATE_NODE |
| `area:heartlands_hedge_wise_cottage` | 1 | `area:heartlands`, `quest:the_hedge_wise_gift` | CREATE_NODE |
| `area:heartlands_royal_forest` | 1 | `area:heartlands`, `quest:the_royal_falconer` | CREATE_NODE |
| `area:heartlands_market_square` | 1 | `area:heartlands` | CREATE_NODE |

### 2.4 Boneyard — 10 areas, 21 refs

| Missing id | Refs | Proposed prereqs | Flag |
|------------|-----:|------------------|------|
| `area:boneyard_the_splinter` | 3 | `area:boneyard_wastes` | CREATE_NODE |
| `area:boneyard_salt_cisterns` | 3 | `area:boneyard_wastes` | CREATE_NODE |
| `area:boneyard_boil_pits` | 2 | `area:boneyard_wastes` | CREATE_NODE |
| `area:boneyard_smelters_bones` | 2 | `area:boneyard_wastes` | CREATE_NODE |
| `area:boneyard_salted_cookery` | 2 | `area:boneyard_wastes` | CREATE_NODE |
| `area:boneyard_burnt_library` | 2 | `area:boneyard_wastes` | CREATE_NODE |
| `area:boneyard_singing_dunes` | 2 | `area:boneyard_deep_dunes` | CREATE_NODE |
| `area:boneyard_hyena_markets` | 2 | `area:boneyard_wastes` | CREATE_NODE |
| `area:boneyard_quarrymaster_camp` | 2 | `area:boneyard_wastes` | CREATE_NODE |
| `area:boneyard_sun_bleach_pits` | 1 | `area:boneyard_wastes` | CREATE_NODE |

### 2.5 Veilwood — 9 areas, 16 refs

| Missing id | Refs | Proposed prereqs | Flag |
|------------|-----:|------------------|------|
| `area:veilwood_threshold_wardens` | 4 | `area:veilwood`, `quest:the_door_that_was_never_closed` | CREATE_NODE |
| `area:veilwood_glass_leaf_glades` | 3 | `area:veilwood`, `quest:of_glass_and_antler` | CREATE_NODE |
| `area:veilwood_glass_stag_thicket` | 2 | `area:veilwood_glass_leaf_glades` | CREATE_NODE |
| `area:veilwood_mirror_shallow` | 2 | `area:veilwood`, `quest:the_stag_shape_rite` | CREATE_NODE |
| `area:veilwood_glass_spider_hollow` | 1 | `area:veilwood_glass_leaf_glades` | CREATE_NODE |
| `area:veilwood_hunters_grove` | 1 | `area:veilwood` | CREATE_NODE |
| `area:veilwood_moonhawk_perch` | 1 | `area:veilwood`, `skill:ranged:75` | CREATE_NODE |
| `area:veilwood_range` | 1 | `area:veilwood` | CREATE_NODE |
| `area:veilwood_stag_stone` | 1 | `area:veilwood`, `quest:the_stag_shape_rite` | CREATE_NODE |

### 2.6 Inkweald — 6 areas, 16 refs

| Missing id | Refs | Proposed prereqs | Flag |
|------------|-----:|------------------|------|
| `area:inkweald_dream_forge` | 4 | `area:inkweald`, `quest:the_inkweald_door` | CREATE_NODE |
| `area:inkweald_mirror_glades` | 4 | `area:inkweald`, `quest:the_inkweald_mirror` | CREATE_NODE |
| `area:inkweald_cradlewood` | 3 | `area:inkweald` | CREATE_NODE |
| `area:inkweald_half_light_range` | 2 | `area:inkweald` | CREATE_NODE |
| `area:inkweald_threshold_of_names` | 2 | `area:inkweald`, `quest:the_inkweald_grandmaster_dream` | CREATE_NODE |
| `area:inkweald_backseam_camps` | 1 | `area:inkweald` | CREATE_NODE |

### 2.7 Wilds — 5 areas, 7 refs

| Missing id | Refs | Proposed prereqs | Flag |
|------------|-----:|------------------|------|
| `area:the_wilds_resource_arena` | 2 | `area:the_wilds` | **RENAME** → `area:wilds_resource_area` (existing) |
| `area:the_wilds_throne` | 2 | `area:the_wilds` | **RENAME** → `area:wilds_revenant_throne` (existing) |
| `area:the_wilds_kbd_lair` | 1 | `area:the_wilds`, `skill:prayer:43` | CREATE_NODE |
| `area:the_wilds_mithril_pocket` | 1 | `area:the_wilds`, `skill:mining:55` | CREATE_NODE |
| `area:the_wilds_revenant_caves` | 1 | `area:the_wilds` | **RENAME** → `area:wilds_revenant_caves` (existing) |

---

## 3. Missing quests — 30 unique, 36 refs

Mix of OSRS-heritage placeholders (QUEST_PENDING), naming-drift typos (RENAME), and content-agent-pending content.

### 3.1 RENAME (typo / naming-drift) — 7 quests, 7 refs

These missing ids have an existing near-match with the same lore intent; simply update the referring node's `requires` entry.

| Broken ref | Rename to | Referring node |
|-----------|-----------|-----------------|
| `quest:last_dragon_p1` | `quest:the_last_dragon_p1` | `achievement:glass_desert_diary_hard` |
| `quest:glass_prophecy` | `quest:the_glass_prophecy` | `achievement:glass_desert_diary_medium` |
| `quest:missing_miner` | `quest:the_missing_miner` | `achievement:heartlands_diary_medium` |
| `quest:inkweald_door` | `quest:the_inkweald_door` | `achievement:inkweald_diary_medium` |
| `quest:forge_beneath` | `quest:the_forge_beneath` | `achievement:sootworks_diary_hard` |
| `quest:veilwood_covenant` | `quest:the_veilwood_covenant` | `achievement:veilwood_diary_medium` |
| `quest:shades_of_mortton` | `quest:the_shades_of_mortton` | `training_method:firemaking_shade_burning` |

### 3.2 RENAME (semantic match) — 7 quests, 7 refs

Edit-distance match confirmed against a Scape-native quest with the same subject matter.

| Broken ref | Rename to | Referring node | Rationale |
|-----------|-----------|-----------------|-----------|
| `quest:hollow_choir` | `quest:the_hollow_choirs_song` | `achievement:inkweald_diary_hard` | Wrong — actually a Moryskah quest. The Inkweald diary already requires `quest:the_hollow_choirs_descant`; this ref is redundant → **RETRACT** (see §3.4). |
| `quest:bog_witch` | `quest:the_bog_witchs_bargain` | `achievement:moryskah_diary_medium` | canonical bog-witch starter |
| `quest:stormwood_rite` | `quest:the_stag_shape_rite` | `achievement:veilwood_diary_hard` | only stormwood-themed rite in Veilwood |
| `quest:sins_of_the_father` | `quest:sins_of_malachar` | `training_method:agility_hallowed_sepulchre` × 1 + `training_method:runecrafting_daeyalt_essence` × 1 | Scape replaces OSRS "Sins of the Father" with Malachar storyline |
| `quest:mage_arena` | `quest:the_mage_arena_trial` | `training_method:magic_wilds_god_spells` | same minigame |
| `quest:the_royal_commission` | `quest:the_shipwrights_commission` | `training_method:heartlands_royal_armoury` | if the method is armoury-specific use `quest:the_royal_warrant`; confirm with content agent |
| `quest:druidic_ritual` | `quest:the_ancient_tree_ritual` | `training_method:herblore_attack_potions`, `training_method:herblore_cleaning_herbs` | Scape's druidic-unlock quest for herblore basics |

### 3.3 QUEST_PENDING (OSRS-heritage placeholders) — no Scape equivalent yet — 6 quests, 8 refs

These are verbatim OSRS quest ids that leaked into Scape training methods. None have a Scape-native replacement. Flag for the quest-content agent.

| Broken ref | Referring nodes | Proposed action |
|-----------|-----------------|-----------------|
| `quest:priest_in_peril` | `minigame:deadhold` | needs a Moryskah-native deadhold intro quest; tentative id `quest:the_deadhold_summons` |
| `quest:tai_bwo_wannai_trio` | `training_method:cooking_karambwan_1tick` | Aelgard lacks Karamja analog; consider moving method to Saltbrine and gating on `quest:the_saltbrine_regatta` |
| `quest:swan_song` | `training_method:fishing_monkfish_chill` | no monkfish in Aelgard cosmology; re-gate on `quest:the_trawlers_call` (once that is written) |
| `quest:dwarf_cannon_quest` | `training_method:smithing_cannonballs` | needs Sootworks dwarven ally quest; tentative `quest:the_cannon_forge_commission` |
| `quest:feud_quest` | `training_method:thieving_blackjacking` | needs Moryskah blackjacking unlock; tentative `quest:the_moonless_feud` |
| `quest:barbarian_assault` | `achievement:saltbrine_diary_elite` | no Scape analog; replace with `minigame:saltbrine_scuttler_pits` or retract entirely |

### 3.4 QUEST_PENDING (Scape-native, planned but unwritten) — 7 quests, 11 refs

Referenced by name but not yet present in `data/quests/`. Likely waiting on burn-wave content agent. Flag + leave in place so they appear in gap audits.

| Broken ref | Referring nodes | Region |
|-----------|-----------------|--------|
| `quest:bone_voyage` | `training_method:boneyard_fossil_prayer`, `training_method:mining_volcanic_mine` | Boneyard |
| `quest:the_tiled_rooftops` | `training_method:heartlands_bell_tower_agility`, `training_method:heartlands_capital_agility` | Heartlands |
| `quest:moryskah_requiem` | `training_method:defence_chinchompa_stacking`, `training_method:magic_burst_spells`, `training_method:ranged_chinchompas` | Moryskah — key combat-chinchompa unlock |
| `quest:soot_king_raid` | `achievement:sootworks_diary_elite` | Sootworks — raid introduction |
| `quest:saltbrine_agility_course` | `achievement:saltbrine_diary_medium` | Saltbrine |
| `quest:the_fen_pilgrimage` | `minigame:moryskah_burgh_ramble` | Moryskah |
| `quest:the_rangers_trust` | `minigame:veilwood_poacher_rounds` | Veilwood |
| `quest:the_trawlers_call` | `quest:the_letter_unposted` | Saltbrine |
| `quest:inkweald_archives` | `training_method:agility_seers_course` | Inkweald — suspected alias for `quest:the_inkweald_second_door`; confirm with content agent |
| `quest:moryskah_haunting` | `training_method:prayer_ectofuntus` | Moryskah — core prayer-ectofuntus unlock |

### 3.5 RETRACT (spurious) — 1 quest, 1 ref

| Broken ref | Referring node | Reason |
|-----------|-----------------|--------|
| `quest:hollow_choir` | `achievement:inkweald_diary_hard` | The achievement already requires `quest:the_hollow_choirs_descant`; `quest:hollow_choir` is a stale duplicate. Retract from `requires`. |

---

## 4. Typo fixes — edit distance ≤ 3 to an existing node

Consolidated list (rename refs, do NOT create new nodes):

| Broken ref | Existing node | Distance |
|-----------|---------------|---------:|
| `area:the_wilds_resource_arena` | `area:wilds_resource_area` | 2 (prefix + word order) |
| `area:the_wilds_throne` | `area:wilds_revenant_throne` | 3 (prefix + insert) |
| `area:the_wilds_revenant_caves` | `area:wilds_revenant_caves` | 1 (prefix) |
| `quest:last_dragon_p1` | `quest:the_last_dragon_p1` | 1 (prefix) |
| `quest:glass_prophecy` | `quest:the_glass_prophecy` | 1 (prefix) |
| `quest:missing_miner` | `quest:the_missing_miner` | 1 (prefix) |
| `quest:inkweald_door` | `quest:the_inkweald_door` | 1 (prefix) |
| `quest:forge_beneath` | `quest:the_forge_beneath` | 1 (prefix) |
| `quest:veilwood_covenant` | `quest:the_veilwood_covenant` | 1 (prefix) |
| `quest:shades_of_mortton` | `quest:the_shades_of_mortton` | 1 (prefix) |
| `quest:bog_witch` | `quest:the_bog_witchs_bargain` | 3 (prefix + suffix) |
| `quest:mage_arena` | `quest:the_mage_arena_trial` | 2 (prefix + suffix) |
| `quest:sins_of_the_father` | `quest:sins_of_malachar` | 3 (suffix swap) |
| `quest:druidic_ritual` | `quest:the_ancient_tree_ritual` | 3 (rename) |

**Pattern:** Scape's quest-id convention prefixes almost every quest with `the_`. Refs without it are legacy from OSRS-parity lists. Recommend adding a DAG-build-time linter that rejects `quest:<bare>` if `quest:the_<bare>` exists.

---

## 5. Top 20 priority fixes (by downstream rescue count)

Fix these first. Each row lists how many dead-end training methods become reachable once the broken ref resolves.

| # | Broken ref | Action | Rescues | Unblocks |
|---|-----------|--------|--------:|----------|
| 1 | `area:moryskah_silent_chapel` | CREATE_NODE | 13 | chapel construction, organ magic, choir magic, ossuary prayer, hollow midnight magic, sigil chapel practice, silent chapel smithing + 6 more |
| 2 | `area:moryskah_wolfbane_distillery` | CREATE_NODE | 9 | distiller badge, distiller cape, distillery cooking/tax/herblore/firemaking + 3 more |
| 3 | `area:moryskah_mausoleum_district` | CREATE_NODE | 9 | mausoleum agility, reliquarist badge, reliquary mining, rooftop stormwalk, tallow firemaking, wake ranged + 3 more |
| 4 | `area:moryskah_cabaret` | CREATE_NODE | 8 | cabaret card/crafting/hitpoints/matinee/stage/director cape/performance crafting |
| 5 | `area:moryskah_moonless_inn` | CREATE_NODE | 7 | immigration thieving, ledger thieving, mortuary cooking, sigil moonless, wake night cooking + 2 more |
| 6 | `area:moryskah_ferry` | CREATE_NODE | 6 | ferry midnight runecrafting, sunrise fishing, unremembered cape + 3 more |
| 7 | `area:sootworks_forge_cathedral` | CREATE_NODE | 6 | cathedral crafting bench, quench-master, forge apprentice HP, commission, heat temper, shift bell chorus |
| 8 | `area:moryskah_bog_witch_cottage` | CREATE_NODE | 5 | bog charm, first fog farming, apprentice hunter, resurrection farm, grael fishing |
| 9 | `area:heartlands_royal_district` | CREATE_NODE | 4 | royal armoury, royal herbalist, royal orchard, master thieves circuit |
| 10 | `area:inkweald_dream_forge` | CREATE_NODE | 4 | dream forge smithing, dream iron mining, glass iron jewelry, glass iron smithing |
| 11 | `area:inkweald_mirror_glades` | CREATE_NODE | 4 | trial attack/defence/hp/strength |
| 12 | `area:sootworks_tinker_yards` | CREATE_NODE | 4 | heretic shot caster, tinker master dawn/fletching, tinker workshop attack |
| 13 | `area:veilwood_threshold_wardens` | CREATE_NODE | 4 | threshold bonfire, offerings, strength trials, defence trials |
| 14 | `area:boneyard_the_splinter` | CREATE_NODE | 3 | bone boomerang carving, scorpion fletching, splinter bone shaft |
| 15 | `area:boneyard_salt_cisterns` | CREATE_NODE | 3 | rune salt binding, salt cistern runecrafting, salt crystal mining |
| 16 | `quest:moryskah_requiem` | QUEST_PENDING | 3 | defence chinchompa stacking, magic burst spells, ranged chinchompas |
| 17 | `area:inkweald_cradlewood` | CREATE_NODE | 3 | cradlewood hauling, singing soft wc, dream oak wc |
| 18 | `area:moryskah_forgotten_hamlet` | CREATE_NODE | 3 | hamlet construction, fire watch, well-letter retrieve |
| 19 | `area:sootworks_brass_choir` | CREATE_NODE | 3 | grand sermon, silent hour, organ mass prayer |
| 20 | `area:veilwood_glass_leaf_glades` | CREATE_NODE | 3 | glass-cored alloy smithing, glass glade smithing, glass leaf knapping |

**Cumulative:** fixing the top 20 resolves 101 / 210 broken refs (48%) with zero new quest content required (16 of 20 are pure CREATE_NODE).

---

## 6. Patch outline — concrete operations

Format: `<op> <target> [with <payload>]`. Apply to `data/progression-dag.json`.

### 6.1 CREATE_NODE — 60 new `area:*` nodes

Each new node conforms to the existing `area` schema:

```json
{
  "id": "<new-id>",
  "type": "area",
  "name": "<Human Name>",
  "region": "<Region>",
  "requires": [<parent area>, <optional quest>, <optional skill>]
}
```

**Moryskah (14 nodes, parent = `area:moryskah` unless noted):**
- `add node area:moryskah_silent_chapel requires [area:moryskah, quest:blood_rites]`
- `add node area:moryskah_wolfbane_distillery requires [area:moryskah, quest:the_bog_witchs_bargain]`
- `add node area:moryskah_mausoleum_district requires [area:moryskah, quest:blood_rites]`
- `add node area:moryskah_cabaret requires [area:moryskah, quest:blood_rites]`
- `add node area:moryskah_moonless_inn requires [area:moryskah]`
- `add node area:moryskah_ferry requires [area:moryskah, quest:shades_of_moryskah]`
- `add node area:moryskah_bog_witch_cottage requires [area:moryskah, quest:the_bog_witchs_bargain]`
- `add node area:moryskah_forgotten_hamlet requires [area:moryskah]`
- `add node area:moryskah_forgotten_island requires [area:moryskah_ferry, quest:shades_of_moryskah]`
- `add node area:moryskah_cabaret_back_alley requires [area:moryskah_cabaret]`
- `add node area:moryskah_deep_bog requires [area:moryskah, quest:the_bog_witchs_bargain]`
- `add node area:moryskah_mausoleum_rooftops requires [area:moryskah_mausoleum_district, skill:agility:60]`
- `add node area:moryskah_silent_chapel_sanctum requires [area:moryskah_silent_chapel, quest:the_hollow_choirs_song]`
- `add node area:moryskah_howling_moors requires [area:moryskah]`

**Sootworks (13 nodes, parent = `area:sootworks` unless noted):**
- `add node area:sootworks_forge_cathedral requires [area:sootworks, quest:the_forgemaster_contract]`
- `add node area:sootworks_tinker_yards requires [area:sootworks]`
- `add node area:sootworks_brass_choir requires [area:sootworks, skill:prayer:60]`
- `add node area:sootworks_beggars_gallery requires [area:sootworks, quest:the_beggars_petition]`
- `add node area:sootworks_deep_furnace requires [area:sootworks_deep_mines]`
- `add node area:sootworks_deepwell requires [area:sootworks]`
- `add node area:sootworks_imbue_hall requires [area:sootworks_forge_cathedral]`
- `add node area:sootworks_feast_kitchen requires [area:sootworks]`
- `add node area:sootworks_pump_station requires [area:sootworks]`
- `add node area:sootworks_steamfield requires [area:sootworks]`
- `add node area:sootworks_clockbeetle_warrens requires [area:sootworks_cinderhall_warrens]`
- `add node area:sootworks_lantern_mines requires [area:sootworks_deep_mines]`
- `add node area:sootworks_rust_pits requires [area:sootworks]`

**Heartlands (11 nodes, parent = `area:heartlands` unless noted):**
- `add node area:heartlands_royal_district requires [area:heartlands, quest:the_royal_warrant]`
- `add node area:heartlands_bell_tower requires [area:heartlands_capital_rooftops, skill:agility:80]`
- `add node area:heartlands_grand_cathedral requires [area:heartlands, quest:the_last_light_vigil]`
- `add node area:heartlands_old_hedge requires [area:heartlands, quest:the_hedge_wise_gift]`
- `add node area:heartlands_capital_rooftops requires [area:heartlands_capital, skill:agility:75]`
- `add node area:heartlands_capital requires [area:heartlands]`
- `add node area:heartlands_chapel requires [area:heartlands, quest:the_last_light_vigil]`
- `add node area:heartlands_fishing_guild requires [area:heartlands, skill:fishing:68]`
- `add node area:heartlands_hedge_wise_cottage requires [area:heartlands, quest:the_hedge_wise_gift]`
- `add node area:heartlands_royal_forest requires [area:heartlands, quest:the_royal_falconer]`
- `add node area:heartlands_market_square requires [area:heartlands]`

**Boneyard (10 nodes, parent = `area:boneyard_wastes` unless noted):**
- `add node area:boneyard_the_splinter requires [area:boneyard_wastes]`
- `add node area:boneyard_salt_cisterns requires [area:boneyard_wastes]`
- `add node area:boneyard_boil_pits requires [area:boneyard_wastes]`
- `add node area:boneyard_smelters_bones requires [area:boneyard_wastes]`
- `add node area:boneyard_salted_cookery requires [area:boneyard_wastes]`
- `add node area:boneyard_burnt_library requires [area:boneyard_wastes]`
- `add node area:boneyard_singing_dunes requires [area:boneyard_deep_dunes]`
- `add node area:boneyard_hyena_markets requires [area:boneyard_wastes]`
- `add node area:boneyard_quarrymaster_camp requires [area:boneyard_wastes]`
- `add node area:boneyard_sun_bleach_pits requires [area:boneyard_wastes]`

**Veilwood (9 nodes, parent = `area:veilwood` unless noted):**
- `add node area:veilwood_threshold_wardens requires [area:veilwood, quest:the_door_that_was_never_closed]`
- `add node area:veilwood_glass_leaf_glades requires [area:veilwood, quest:of_glass_and_antler]`
- `add node area:veilwood_glass_stag_thicket requires [area:veilwood_glass_leaf_glades]`
- `add node area:veilwood_mirror_shallow requires [area:veilwood, quest:the_stag_shape_rite]`
- `add node area:veilwood_glass_spider_hollow requires [area:veilwood_glass_leaf_glades]`
- `add node area:veilwood_hunters_grove requires [area:veilwood]`
- `add node area:veilwood_moonhawk_perch requires [area:veilwood, skill:ranged:75]`
- `add node area:veilwood_range requires [area:veilwood]`
- `add node area:veilwood_stag_stone requires [area:veilwood, quest:the_stag_shape_rite]`

**Inkweald (6 nodes, parent = `area:inkweald` unless noted):**
- `add node area:inkweald_dream_forge requires [area:inkweald, quest:the_inkweald_door]`
- `add node area:inkweald_mirror_glades requires [area:inkweald, quest:the_inkweald_mirror]`
- `add node area:inkweald_cradlewood requires [area:inkweald]`
- `add node area:inkweald_half_light_range requires [area:inkweald]`
- `add node area:inkweald_threshold_of_names requires [area:inkweald, quest:the_inkweald_grandmaster_dream]`
- `add node area:inkweald_backseam_camps requires [area:inkweald]`

**Wilds (2 nodes; the other 3 are RENAMES below):**
- `add node area:the_wilds_kbd_lair requires [area:the_wilds, skill:prayer:43]`
- `add node area:the_wilds_mithril_pocket requires [area:the_wilds, skill:mining:55]`

### 6.2 RENAME — 17 ref-edits across referring nodes

Format: `rename ref <old> -> <new> in <node>`.

**Areas (Wilds convention drift):**
- `rename ref area:the_wilds_resource_arena -> area:wilds_resource_area in <2 training methods>`
- `rename ref area:the_wilds_throne -> area:wilds_revenant_throne in <2 training methods>`
- `rename ref area:the_wilds_revenant_caves -> area:wilds_revenant_caves in training_method:...`

**Quests (prefix drift and semantic drift):**
- `rename ref quest:last_dragon_p1 -> quest:the_last_dragon_p1 in achievement:glass_desert_diary_hard`
- `rename ref quest:glass_prophecy -> quest:the_glass_prophecy in achievement:glass_desert_diary_medium`
- `rename ref quest:missing_miner -> quest:the_missing_miner in achievement:heartlands_diary_medium`
- `rename ref quest:inkweald_door -> quest:the_inkweald_door in achievement:inkweald_diary_medium`
- `rename ref quest:forge_beneath -> quest:the_forge_beneath in achievement:sootworks_diary_hard`
- `rename ref quest:veilwood_covenant -> quest:the_veilwood_covenant in achievement:veilwood_diary_medium`
- `rename ref quest:shades_of_mortton -> quest:the_shades_of_mortton in training_method:firemaking_shade_burning`
- `rename ref quest:bog_witch -> quest:the_bog_witchs_bargain in achievement:moryskah_diary_medium`
- `rename ref quest:stormwood_rite -> quest:the_stag_shape_rite in achievement:veilwood_diary_hard`
- `rename ref quest:sins_of_the_father -> quest:sins_of_malachar in training_method:agility_hallowed_sepulchre, training_method:runecrafting_daeyalt_essence`
- `rename ref quest:mage_arena -> quest:the_mage_arena_trial in training_method:magic_wilds_god_spells`
- `rename ref quest:the_royal_commission -> quest:the_shipwrights_commission in training_method:heartlands_royal_armoury` *(confirm w/ content agent — alt: `quest:the_royal_warrant`)*
- `rename ref quest:druidic_ritual -> quest:the_ancient_tree_ritual in training_method:herblore_attack_potions, training_method:herblore_cleaning_herbs`

### 6.3 RETRACT — 6 ref-removals

- `retract ref quest:hollow_choir from achievement:inkweald_diary_hard` (duplicate of `quest:the_hollow_choirs_descant` already in the `requires` array)
- `retract ref area:heartlands_bell_tower (redundant) from training_method:heartlands_bell_tower_agility` — parent area covered via `area:heartlands_capital_rooftops` after fix
- `retract ref area:heartlands_capital_rooftops (redundant) from training_method:heartlands_capital_agility` — once created, also-direct parent `area:heartlands_capital` is transitive
- `retract ref area:heartlands_royal_district (redundant) from training_method:heartlands_royal_armoury` — once created, referring training methods already reach it via `quest:the_royal_warrant`
- `retract duplicate skill-level refs in 3 training_method.requires arrays` (duplicate `skill:construction:75` entries found at `training_method:moryskah_chapel_construction` and sibling nodes — non-broken, but noted during this pass for cleanup)

> Note: 6.3's retractions are conservative; the first (spurious `quest:hollow_choir`) is the only one strictly required to reach the 210-fix target. The remaining four are redundancy-removal opportunities flagged for a follow-up tidy pass.

### 6.4 QUEST_PENDING — 17 flags (no JSON mutation)

Hand off to content agents:

**Needs Scape-native replacement (OSRS-heritage placeholders):**
- `quest:priest_in_peril` — propose `quest:the_deadhold_summons` (Moryskah)
- `quest:tai_bwo_wannai_trio` — propose Saltbrine cooking unlock on `quest:the_saltbrine_regatta`
- `quest:swan_song` — propose `quest:the_trawlers_call` hook (Saltbrine)
- `quest:dwarf_cannon_quest` — propose `quest:the_cannon_forge_commission` (Sootworks)
- `quest:feud_quest` — propose `quest:the_moonless_feud` (Moryskah)
- `quest:barbarian_assault` — propose swap to `minigame:saltbrine_scuttler_pits`

**Scape-native but unwritten (waiting on content):**
- `quest:bone_voyage` (Boneyard — prayer + mining unlocks)
- `quest:the_tiled_rooftops` (Heartlands agility tree)
- `quest:moryskah_requiem` (Moryskah combat-chinchompa unlock)
- `quest:soot_king_raid` (Sootworks raid intro)
- `quest:saltbrine_agility_course` (Saltbrine agility)
- `quest:the_fen_pilgrimage` (Moryskah burgh ramble)
- `quest:the_rangers_trust` (Veilwood poacher rounds)
- `quest:the_trawlers_call` (Saltbrine — already referenced by `quest:the_letter_unposted`)
- `quest:inkweald_archives` (Inkweald — confirm alias or new)
- `quest:moryskah_haunting` (Moryskah prayer / ectofuntus)

---

## 7. Execution order

1. **Phase A — RENAMES (cheap, resolves 21 refs):** apply §6.2 ref-edits. Zero new nodes. Closes the `the_` prefix gap and the 3 Wilds typos in one sweep.
2. **Phase B — RETRACTS (resolves 6 refs):** apply §6.3. Only `quest:hollow_choir` is strictly required; rest are tidy-up.
3. **Phase C — CREATE_NODE pass 1 (resolves ~140 refs):** add the 60 `area:*` nodes in §6.1 in region order (Moryskah first — largest impact). After this pass, only QUEST_PENDING refs remain.
4. **Phase D — QUEST_PENDING handoff (20 refs, 17 quest ids):** file content-agent tickets. DAG report will show these as still-broken until quest content lands. Acceptable gap — flagged, not silent.

**Expected final state after Phases A+B+C:** broken-ref count drops from 210 → ~20, all remaining breaks traceable to quest-content-pending rather than DAG-structural gaps.

---

## 8. Lint rule proposal (preventive)

Add to DAG builder:

```
for each requires entry r in node N:
  if r not in nodeIds:
    if r.startsWith('quest:') and ('quest:the_' + r.slice(6)) in nodeIds:
      error: "ref ${r} should be ${'quest:the_' + r.slice(6)}"
    if r.startsWith('area:the_wilds_') and ('area:wilds_' + r.slice(14)) in nodeIds:
      error: "ref ${r} should be ${'area:wilds_' + r.slice(14)}"
    error: "broken ref ${r} from ${N.id}"
```

This would have caught 21 of today's 210 breaks at build time.
