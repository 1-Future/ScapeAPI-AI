# Scape Achievement Diary Coverage Audit

**Date:** 2026-04-22
**Scope:** Gap analysis of Scape's diary task coverage vs OSRS parity and manifesto P08 breakpoint targets.
**Sources:** `data/diaries/*.json`, `src/content/aelgard/achievement-diaries.js`, `src/content/aelgard/diaries-tasks-detailed.js`, `data/progression-dag.json`.

## 1. Summary

| Metric                             | Current | Target       | Gap       |
|------------------------------------|--------:|-------------:|----------:|
| Regions with diaries               | 8       | 9            | **-1 (Wilds missing)** |
| Diary tiers total                  | 32      | 36           | -4        |
| Total tasks                        | 320     | 540 (9×4×15) | **-220**  |
| Per-cell mean                      | 10.0    | 15           | -5        |
| Diary completion achievement nodes | 32      | 36           | -4        |
| Unique task-check types            | 93      | n/a          | healthy   |
| Downstream DAG gates from diaries  | **0**   | >36          | **BROKEN** |

**Headline findings.** Scape has exactly 10 tasks per cell — every region, every tier. Symmetric but shallow. OSRS averages ~12 with hard/elite stretching to 15+. The 9th region (**Wilds**) has zero diary coverage despite being one of the 9 canonical regions in `src/content/aelgard/`. More seriously, no node in `progression-dag.json` uses a diary achievement as a prerequisite — the 32 diary achievement nodes exist but gate nothing, violating P08 (breakpoints must unlock downstream content).

## 2. 9×4 Region × Tier Matrix (current task counts)

| Region        | Easy | Medium | Hard | Elite | Total |
|---------------|-----:|-------:|-----:|------:|------:|
| Heartlands    | 10   | 10     | 10   | 10    | 40    |
| Sootworks     | 10   | 10     | 10   | 10    | 40    |
| Moryskah      | 10   | 10     | 10   | 10    | 40    |
| Boneyard      | 10   | 10     | 10   | 10    | 40    |
| Glass Desert  | 10   | 10     | 10   | 10    | 40    |
| Saltbrine     | 10   | 10     | 10   | 10    | 40    |
| Veilwood      | 10   | 10     | 10   | 10    | 40    |
| Inkweald      | 10   | 10     | 10   | 10    | 40    |
| **Wilds**     | **0** | **0** | **0** | **0** | **0** |
| **Total**     | 80   | 80     | 80   | 80    | **320** |

Every non-Wilds cell is at the OSRS Easy-tier floor (~10). None reach OSRS Hard/Elite density (~12–15). The `achievement-diaries.js` outline file is thinner still (3–8 tasks per tier) but `data/diaries/*.json` is the canonical source loaded at runtime, so task count is 320.

## 3. Per-Region Reward Coverage

Every existing region-tier pair has three reward components: a **cape** (tier-coloured), a **diary lamp**, and a **perk block** (teleport / bank / shortcut / XP-mod). Coverage looks like this:

| Region        | Teleport tier | Bank teleport | Boss shortcut | XP/drop perk | Cosmetic cape | **Status** |
|---------------|---------------|---------------|---------------|--------------|---------------|-----------|
| Heartlands    | easy→elite    | medium        | —             | elite (+50% prayer XP) | all 4 tiers | complete |
| Boneyard      | easy→elite    | medium        | hard (pyramid)| elite (sandstorm imm.) | all 4 tiers | complete |
| Moryskah      | easy→elite    | —             | medium (slayer tower), hard (Barrows) | elite (+10% blood runes) | all 4 tiers | complete |
| Veilwood      | easy→elite    | medium (elven)| elite (magic tree) | medium (+10% WC) | all 4 tiers | complete |
| Sootworks     | easy→elite    | —             | hard (deep mine) | medium (Blast Forge) | all 4 tiers | complete |
| Saltbrine     | easy→elite    | medium (harbour) | hard (Kraken) | elite (double fish) | all 4 tiers | complete |
| Inkweald      | easy→elite    | easy (boundary) | hard (Muse arena) | medium (+10% inkblot) | all 4 tiers | complete |
| Glass Desert  | easy→elite    | medium (outpost) | hard (Wyrm) | medium (+10% shards) | all 4 tiers | complete |
| **Wilds**     | —             | —             | —             | —            | **missing**   | **missing**   |

Reward coverage is strong in depth (perk + cape + lamp stack) but uniform to the point of being predictable. Missing rewards to flag:
- No diary currently rewards a **stat bonus** akin to OSRS Ardougne-hard's 50% Thieving boost at the chaos altar.
- No diary grants **ironman/account unlocks** (e.g., early access to a shortcut normally requires a quest).
- No **pet or pet-metaframe reward** tied to any elite diary.
- Moryskah lacks a dedicated **bank teleport** perk (only Barrows teleport).
- Sootworks lacks a **bank teleport** perk entirely.
- No diary gates a **skilling outfit** piece (OSRS Ardougne-Elite / Karamja-Elite both do).

## 4. Task Variety Breakdown

Across the 320 tasks, 93 distinct `check.type` values are used. Aggregated into OSRS-style buckets:

| Bucket        | Count | % of tasks | OSRS parity target | Verdict |
|---------------|------:|-----------:|-------------------|---------|
| Combat        | 93    | 29%        | 25–30%            | healthy |
| Skilling      | 63    | 20%        | 30–35%            | **under** |
| Activity (agility/minigames/RC/clues/farming) | 46 | 14% | 15–20% | borderline |
| Quest completion | 32 | 10%        | 10–12%            | healthy |
| Exploration   | 12    | 4%         | 8–10%             | **under** |
| Other (utility, compound, obtain) | 74 | 23%    | 15–20%            | over-weighted |

**Observations.**
- Skilling is under-represented. OSRS diaries force level-gated skilling verbs (fletch-of-X, craft-of-Y, cast-on-patch) at high density; Scape is weighted toward kills and obtains.
- Only **12 exploration tasks total** across 320. OSRS has dozens of "enter area / use shortcut / climb ladder / speak to obscure NPC" tasks.
- Minigame tasks (`minigame_participate`, `minigame_complete`, `minigame_role_complete`) appear only 4 times total despite Scape having Trawler, Barbarian Assault, Guardians of the Rift, and Chambers of Aelgard. OSRS weights minigames heavily at medium/hard.
- Clue-step tasks appear 8 times, all in elite tiers. Should appear at medium/hard too.
- Compound tasks (sequence-of-things) appear 13 times — good for depth but concentrated in Heartlands and Boneyard.

## 5. DAG Cross-Reference

`data/progression-dag.json` has 2,698 nodes and 118 achievements. Of those, 32 are diary completions:

- `achievement:<region>_diary_<tier>` for 8 regions × 4 tiers = 32 (Wilds absent).

**Critical finding:** zero downstream DAG nodes list a diary achievement in their `requires` array. Diary completion currently **rewards** perks in the content files but does not **gate** any node in the progression graph. This is a wiring gap, not purely a content gap — P08 cannot hold without it. Target: each elite diary should gate at least 2 downstream breakpoints (e.g., a shortcut node, an elite-clue-step node, or a region-locked boss kill).

Other related nodes found:
- 58 `combat_achievement:ca_*` nodes exist as a parallel system (Barrows, Choir, Azhmari, CoA). These are separate from diaries and should stay separate.
- `achievement:master_farmer_title` exists standalone, confirming the schema supports non-diary achievements.

## 6. Priority Expansion — 100 New Task Concepts

The most impactful expansion is also the simplest: add the **Wilds diary** (all 4 tiers, 15 tasks each = 60 tasks) and top up each existing cell from 10→15 (32 cells × 5 = 160 new tasks). That overshoots 100 — below is a prioritised shortlist of 100 that closes the worst gaps first.

Ordering priority: (a) Wilds first (most missing), (b) highest-traffic regions next (Heartlands, Moryskah, Saltbrine), (c) fix under-weighted buckets (skilling, exploration, minigame, clue).

### 6.1 Wilds (NEW — 60 tasks, 15 per tier)

**Easy (15).** Enter the Wilds at level 1, 5, 10, 20; kill a chaos druid; mine a chaos altar rune node; chop a magic tree in Wilds; catch a dark crab (spot sighting, no fish); use the Wilderness obelisk; pickpocket a mage of Zamorak; bury bones at the chaos altar; survive 30 seconds above level-10 wilderness; buy from the chaos temple; loot a low-tier PK key; talk to the Mage of Zamorak; light a fire at the volcano.

**Medium (15).** Kill a chaos elemental; complete Lunar Diplomacy Part 1; kill a lava dragon; mine runite ore; kill a revenant imp; use a teleport lever; activate an altar prayer in Wilds; loot a medium clue from Wilds; runecraft chaos runes; catch a dark crab; kill a greater demon in the wilderness; navigate the Wilderness agility course (easy lap); use Wilderness sword I; cook food over a Wilds fire; skill using +1 altar prayer.

**Hard (15).** Complete a full Wilderness agility course lap without failing; kill a revenant dragon; mine 28 runite ore in a single trip; complete the Deeper Wilds quest; loot a hard clue from a PK drop; kill 100 mages of Zamorak; defeat the Chaos Elemental solo; activate Wilderness sword II teleport; survive 5 minutes at level-30 wilderness; kill an ancient wyvern; runecraft 50 wrath runes; complete a Fight Pits round with 8+ players; kill a cerberus pup (Wilds variant); smith a dragon-rune hybrid; collect a chaos reliquary.

**Elite (15).** Defeat the Chaos Avatar raid (8-player); complete all Wilderness quests; loot an elite clue from the Wilds; achieve the Wilderness speedrun under 10 minutes; complete the Wilderness collection log; earn 3rd-age weapon from PvP drop; catch 200 dark crabs; runecraft 1000 wrath runes; achieve 99 in a Wilds-only skill; kill Corporeal Beast solo; earn Voidwaker pieces; complete the Deep Wilds gauntlet; kill an elder demon; achieve 100% completion of Wilderness clue-scrolls; defeat every Wilds boss once.

### 6.2 Cross-region fill-ins (40 tasks total, 5 per existing region)

Concentrated on under-weighted buckets (skilling, exploration, minigame, clue). One task per region-tier focus point:

- **Heartlands (5).** Elite: complete a GE flip worth 1M+; Hard: use the Lunar Humidify spell on Heartlands patch; Medium: craft a dragonstone ring using teleport-charged materials; Easy: visit all 4 Heartlands shops in one trip; Medium: complete 3 medium clue steps within Heartlands.
- **Sootworks (5).** Elite: craft and charge a dragon-tipped pickaxe; Hard: complete 5 laps of the Pipe Network without resting; Medium: superheat a mithril bar using half-coal Blast Forge; Easy: use the steam tram all three stops; Easy: find and activate the Forgefather's shrine.
- **Moryskah (5).** Elite: perform a 4-brother Barrows speed-run under 3 minutes; Hard: craft a silver-tipped holy sickle using Moryskah materials; Medium: complete 5 Guardians of the Rift games; Easy: drink from every apothecary potion (Father Dorin's round); Medium: pickpocket a vampyre juvenile three consecutive times without failure.
- **Boneyard (5).** Elite: complete the pyramid collection log; Hard: use the Enchanted Lyre at the oasis; Medium: complete a medium clue step in the nomad camp; Easy: visit every desert waypoint; Easy: use a camel mount.
- **Glass Desert (5).** Elite: shear a refracted sheep (crafting 90); Hard: complete a hard clue step at the prism shrine; Medium: use a crystal fishing rod; Easy: use the crystal altar once; Medium: complete the Glass Desert agility toll shortcut.
- **Saltbrine (5).** Elite: solo a full Trawler run keeping the boat afloat; Hard: complete a Barbarian Assault wave 10; Medium: catch one of every Saltbrine fish in a single trip; Easy: use the harbourmaster's ferry; Easy: find the hidden pirate stash.
- **Veilwood (5).** Elite: craft a stormwood longbow (v); Hard: complete a hunter rumour chain; Medium: use the Lunar Plank Make spell on a Veilwood log; Easy: speak to every ranger at the sacred grove; Easy: use the Veilwood vine shortcut.
- **Inkweald (5).** Elite: achieve a perfect Dreamwalk lap under 90 seconds; Hard: complete 3 laps of Dreamwalk consecutively; Medium: turn in a lucid essence at the Muse shrine; Easy: sleep in a dream-bed; Easy: find all 4 echo petals in one trip.

### 6.3 Pure-skilling / minigame depth (wave of medium-priority fills)

Not enumerated to 100 — counts continue as: expand the minigame bucket by +20, clue-step bucket by +15, exploration by +15, and compound/chain tasks by +10 across all tiers.

## 7. Recommended Follow-Up

1. **Wire diary achievements into the DAG.** Add `requires: ['achievement:<region>_diary_<tier>']` to appropriate shortcut, elite clue, and region-boss nodes. Target: each elite diary gates >=2 downstream nodes; each hard diary gates >=1.
2. **Create `data/diaries/wilds.json`** matching the existing schema (60 tasks across 4 tiers).
3. **Append 5 tasks per existing tier** in the 8 JSON files to hit 15/cell → 540 total.
4. **Rebalance variety** — specifically raise skilling density and add at least 15 clue-step and 15 minigame tasks distributed across all regions.
5. **Add stat-bonus rewards** to at least 3 elite diaries and a skilling outfit piece reward to at least 2 medium diaries.
6. **Add Wilds-diary achievement nodes** (4) to `progression-dag.json` and assign downstream gating consistent with P08.

## Appendix A — Source File Paths

- `C:/Users/username/ScapeAI/src/content/aelgard/achievement-diaries.js` — 178 lines, outline definitions (8 regions).
- `C:/Users/username/ScapeAI/src/content/aelgard/diaries-tasks-detailed.js` — 475 lines, expanded prose tasks (8 regions × 4 tiers × 10).
- `C:/Users/username/ScapeAI/data/diaries/*.json` — 8 region JSON files, canonical loaded at boot.
- `C:/Users/username/ScapeAI/data/progression-dag.json` — 2,698 nodes, 118 achievements of which 32 are diary completions.

## Appendix B — Wilds Absence Confirmation

The CLAUDE.md subsystem map names 9 canonical Aelgard regions (Heartlands, Sootworks, Moryskah, Boneyard, Glass Desert, Saltbrine, Veilwood, Inkweald, **Wilds**). Every diary artefact — outline, detailed tasks, JSON, DAG achievement nodes — stops at 8 regions. Wilds is the single largest gap in the diary surface.
