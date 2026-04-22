# Combat Achievement Coverage — Gap Audit & Expansion Plan

**Date:** 2026-04-22
**Target:** OSRS parity (user asked 528; actual OSRS live count is **637**)
**Sources audited:**
- `src/content/aelgard/combat-achievements-tasks.js` (main pack, per-boss tasks)
- `src/content/aelgard/combat-achievements.js` (legacy pack, 85 tasks)
- `data/progression-dag.json` (118 achievement nodes: 85 CA + 32 diary + 1 misc)
- `data/bosses.json` (15 bible entries) + all `bosses-*`/`raids-*`/`monsters-mega*` files (67 `boss()` registrations)
- `oldschool.runescape.wiki/w/Combat_Achievements` (live reference: 637 total)

---

## 1. Summary

| Metric | Scape | OSRS (target 528) | OSRS (actual live 637) |
|---|---|---|---|
| Total CA tasks (main pack) | **246** | 528 | 637 |
| Total CA tasks (main + legacy deduped) | **307** | — | — |
| Coverage vs 528 | **47%** | 100% | — |
| Coverage vs live 637 | **39%** | — | 100% |
| Gap to 528 | **282** | — | — |
| Registered bosses in bestiary | 67 | — | ~80 |
| Bosses with ≥1 CA | 34 | — | ~80 |
| Bosses with **zero** CAs | **33** | — | 0 |

### Per-tier histogram (main pack vs 528 target scaled to OSRS live ratios)

| Tier | Scape have | OSRS-scaled target | Gap |
|---|---|---|---|
| Easy | 25 | 31 | **-6** |
| Medium | 48 | 46 | **+2** (over) |
| Hard | 55 | 66 | **-11** |
| Elite | 58 | 126 | **-68** |
| Master | 33 | 131 | **-98** |
| Grandmaster | 27 | 127 | **-100** |

**Shape diagnosis:** Scape is front-loaded. Easy/Medium/Hard tiers are ~75% complete; Elite/Master/Grandmaster are ~25% complete. OSRS weights heavily toward endgame (Master/Grandmaster = 47% of total). Scape currently sits at 24%. The gap is almost entirely in high-tier content.

---

## 2. Per-Boss Task Count Matrix

### Bosses covered (34 total) — main pack

| Count | Bosses |
|---|---|
| 9 tasks | corporeal_beast, the_nightmare, veldrak |
| 8 tasks | forgefather_duran, giant_mole, obor_heartlands, bryophyta_heartlands, dagannoth_rex/prime/supreme, zulrah, vorkath, commander_zilyana, general_graardor, kreearra, kril_tsutsaroth, crystal_wyrm, pirate_captain, the_glass_tyrant |
| 7 tasks | kalphite_queen, kraken_saltbrine, cerberus, skotizo_moryskah, sarachnis_moryskah, the_veilmother, vorath, duke_sucellus_sootworks, inkweald_muse, hollow_choir_conductor, the_soot_king |
| 5 tasks | sol_heredit_colosseum |
| 3 tasks | the_whisperer_inkweald, vardorvis_sootworks, phantom_muspah_inkweald |

### Bosses with ZERO CAs (33 — priority expansion targets)

**Raids / raid sub-bosses (12):**
`tos_hm_maiden`, `tos_hm_bloat`, `tos_hm_nylocas`, `tos_hm_sotetseg`, `tos_hm_verzik`, `gauntlet_hunllef`, `nex_wilds_gwd`, `tempoross_saltbrine`, `the_leviathan_saltbrine`, `hespori_veilwood`, `worldtree_heart`, `sanctum_pharaoh`

**Catacombs wave-boss set (14):**
`catacomb_bonelord`, `catacomb_wraith_matron`, `catacomb_flesh_golem`, `catacomb_shade_warden`, `catacomb_abomination`, `catacomb_blood_witch`, `catacomb_crypt_knight`, `catacomb_plaguebearer`, `catacomb_soul_collector`, `catacomb_ghast_sovereign`, `catacomb_barrow_wight`, `catacomb_revenant_lord`, `catacomb_grave_hound`, `catacomb_lich`, `catacomb_necromancer`

**Nightmare dream-set (5):**
`nightmare_mirror`, `nightmare_inferno_beast`, `nightmare_merchant`, `nightmare_sleepwalker`, `nightmare_lucid_core`, `nightmare_void_walker`, `nightmare_tranquil`

**One-offs (7):**
`mimic_clue`, `commander_zelot_heartlands`, `crypt_last_king`, `siege_commander`, `spine_parasite`, `blood_archon`, `crucible_forgemaster`, `engine_architect`, `sunken_sea_priest`, `tempest_storm_elemental`, `rift_sovereign`

---

## 3. Task-Type Variety Analysis

### Main pack (246 tasks)

| Category | Count | % | OSRS analogue |
|---|---|---|---|
| kc (kill count) | 86 | 35% | Grind tasks (healthy weight) |
| perfection | 41 | 17% | "No damage" / "Perfect X" |
| speed | 30 | 12% | Under-N-seconds |
| restriction | 29 | 12% | No food / no prayer |
| gear | 28 | 11% | Style-specific |
| mechanic | 17 | 7% | Phase-specific drill |
| solo | 15 | 6% | Team boss soloed |

**Diagnosis:** Variety is healthy; categories match OSRS taxonomy. KC tasks (35%) are slightly high vs OSRS (~25%); mechanic tasks (7%) are low. Expansion should skew away from kc and toward mechanic + speed + perfection.

---

## 4. Priority Expansion — 50 New CAs

Proposals reference actual mechanics from `data/bosses.json` and `bosses-expanded.js`. Each line: **boss × type × tier × description**.

### Tier: Grandmaster (25 new — highest gap)

1. **nex_wilds_gwd × perfection × GM** — "Phase-Perfect Zaros": clear all 5 phases without dying or switching out of the canonical prayer for each phase.
2. **nex_wilds_gwd × speed × GM** — "Nex Sub-5": kill Nex in under 5 minutes solo.
3. **tos_hm_verzik × perfection × GM** — "Red Eyes": clear Verzik P3 without any tornado hitting any player.
4. **tos_hm_sotetseg × mechanic × GM** — "Maze Solo": solo the dark-world maze every appearance across a full ToS clear.
5. **tos_hm_nylocas × mechanic × GM** — "Style-Perfect Nylos": 100% correct style on every Nylocas across a HM clear.
6. **tos_hm_bloat × restriction × GM** — "Vegan Bloat": clear Bloat HM without eating.
7. **tos_hm_maiden × speed × GM** — "Speed Maiden": kill Maiden HM in under 90 seconds.
8. **gauntlet_hunllef × perfection × GM** — "Corrupted Perfection": Hunllef CG solo, no chip damage (no hit from Hunllef lands).
9. **inferno × perfection × GM** — "Flawless Jad Wave": no prayer-swap errors on any Jad wave across a full Inferno.
10. **sanctum_pharaoh × restriction × GM** — "Decree-Obedient": clear Pharaoh Lich honoring every decree (never violating a constraint).
11. **veldrak × solo × GM** — "Lone Dragonender": solo Veldrak below 50 HP ending total.
12. **coa (CoA raid) × perfection × GM** — "Chambers Deathless Solo": solo CoA with zero deaths across every room.
13. **corporeal_beast × solo × GM** — "Sub-4 Solo Corp": solo Corp in under 4 minutes.
14. **the_forgotten_name × mechanic × GM** — "Named Kill": clear Forgotten-Name while the name-inversion ticks are ALL active (survive full phase-2 enrage).
15. **worldtree_heart × speed × GM** — "Heartstop": kill Worldtree Heart in under 3 minutes.
16. **the_whisperer_inkweald × restriction × GM** — "Wide-Awake": clear Whisperer without entering the dream portal (waking-only damage race).
17. **phantom_muspah_inkweald × perfection × GM** — "Triple-Pray Perfect": phase-3 enrage cleared with 100% correct-form prayer switches.
18. **vardorvis_sootworks × perfection × GM** — "Heal-Pool Zero": clear Vardorvis without any heal-pool tick.
19. **sol_heredit_colosseum × speed × GM** — "Colosseum Gold": clear 12-wave colosseum in under 20 minutes.
20. **toa × perfection × GM** — "Expert Flawless": ToA 500+ with zero deaths.
21. **duke_sucellus_sootworks × restriction × GM** — "Gasless Duke": no gas-vent detonation hits across the fight.
22. **the_leviathan_saltbrine × perfection × GM** — "Dry Leviathan": clear without any submerge-sweep damage.
23. **gauntlet_hunllef × speed × GM** — "Corrupted Speed": CG Hunllef sub-40 seconds.
24. **nex_wilds_gwd × solo × GM** — "Alone Against Zaros": solo Nex.
25. **all × mechanic × GM** — "Grandmaster Trifecta": hold top-3 speed on CoA + ToS + ToA simultaneously.

### Tier: Master (15 new)

26. **nightmare_mirror × mechanic × M** — "Mirror Match": defeat reflected form without dealing damage to yourself via mirror-bounce.
27. **nightmare_void_walker × perfection × M** — "Dream-Untouched": kill Void Walker phase without any dream-pool damage.
28. **tempoross_saltbrine × speed × M** — "Storm Surge": defeat Tempoross with boat HP above 90%.
29. **hespori_veilwood × restriction × M** — "Barehanded Hespori": kill Hespori with no weapon equipped.
30. **blood_archon × perfection × M** — "Bloodless": kill Blood Archon while at max HP the entire fight.
31. **catacomb_lich × solo × M** — "Lichbane": solo Catacomb Lich at raid-tier difficulty.
32. **catacomb_ghast_sovereign × mechanic × M** — "Sovereign Silenced": kill Ghast Sovereign without it casting a single spectral summon.
33. **crypt_last_king × speed × M** — "Kingkiller": under 3 minutes.
34. **crucible_forgemaster × restriction × M** — "Cold Forge": kill Forgemaster without taking any fire damage.
35. **siege_commander × gear × M** — "Siege Melee-Only": kill Siege Commander using only melee.
36. **engine_architect × perfection × M** — "Architectless": kill Engine Architect without any gear-gear interaction trigger.
37. **spine_parasite × mechanic × M** — "Parasite Purge": kill Spine Parasite before it completes a single tether.
38. **sunken_sea_priest × speed × M** — "Drowned Priest": under 2 minutes.
39. **rift_sovereign × solo × M** — "Rift Walker": solo Rift Sovereign.
40. **tempest_storm_elemental × restriction × M** — "Calm Eye": kill without any storm-phase damage landing.

### Tier: Elite (10 new)

41. **tos_hm_bloat × kc × E** — "Bloat Expert": 50 ToS HM Bloat clears.
42. **tos_hm_maiden × gear × E** — "Maiden in Rags": kill Maiden HM using tier-50 armor or below.
43. **gauntlet_hunllef × kc × E** — "CG 10x": 10 Corrupted Gauntlet clears.
44. **tempoross_saltbrine × kc × E** — "Storm Chaser": 100 Tempoross rewards-permitted clears.
45. **hespori_veilwood × kc × E** — "Garden Keeper": 25 Hespori kills.
46. **catacomb_flesh_golem × mechanic × E** — "Golem Dismember": kill Flesh Golem by dismembering all 4 limbs before HP dies.
47. **catacomb_shade_warden × speed × E** — "Warden Swift": under 90 seconds.
48. **nightmare_merchant × gear × E** — "Merchant Refuser": kill without equipping any merchant-dropped item.
49. **catacomb_revenant_lord × restriction × E** — "Wildy-Pure": kill Revenant Lord in the wilds without protect-item prayer.
50. **mimic_clue × solo × E** — "Trap Sprung": solo Mimic at master-clue difficulty.

---

## 5. Reward Scaling Proposal

Scape already defines **Ghommal's hilt 1-6** (items 83001-83006). Extend with:

| Tier | New reward (Scape-flavored) |
|---|---|
| Easy | Ghommal's hilt 1 + **1 Heartlands daily teleport** |
| Medium | Hilt 2 + **+2% drop rate at Heartlands/Boneyard bosses** |
| Hard | Hilt 3 + **Ghommal's ward** (small shield, +5% PvM damage) |
| Elite | Hilt 4 + **Soot-cape** (combinable cape override) |
| Master | Hilt 5 + **Marstead's lucky coin** (5% charge preservation on charged items) |
| Grandmaster | Hilt 6 + **Sol Heredit's Crown** (cosmetic BIS override), unlocks Colosseum Gold trim |

Each tier should also grant a permanent perk per the manifesto P02 (Breakpoint-visible): every 50 CA points unlocks a permanent quality-of-life perk (antiban cooldown reduction, prayer-tick visual, etc.) instead of raw GP.

---

## Recommendations

1. **Priority-0:** Close the 33-boss zero-coverage gap. Target 3 CAs per zero-CA boss (99 new tasks, puts Scape at ~345 / 528).
2. **Priority-1:** Bulk-add Master/Grandmaster tasks — current 60 combined vs 258 OSRS-scaled target. Add 120 tasks here to reach 180/258.
3. **Priority-2:** Rebalance tier ratios toward the OSRS shape (Master + Grandmaster = 47% of total).
4. **Priority-3:** Expand the mechanic/restriction share of task types from 19% to 30% (OSRS-like).
5. **Preserve:** The existing 7-category taxonomy (`kc/gear/speed/restriction/perfection/mechanic/solo`) already mirrors OSRS — no new categories needed.

Full parity with OSRS 637 target requires adding **391 new tasks**; 528 target requires **282**. A concrete 50-task priority list appears in section 4.
