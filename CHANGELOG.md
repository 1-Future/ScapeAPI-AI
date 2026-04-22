# Changelog

## v0.9-play-api-tier2 — 2026-04-22

Data-wiring + content-expansion pass. Landed via Waves A+B+C (15 parallel agents across
~6 hours, two rate-limit recoveries). The v0.8 diagnostic showed Scape's skeleton was complete but
its nervous system was missing — quests had no machine-readable rewards, DAG references broke
silently, 47% of monsters had no drops, diary achievements gated nothing. v0.9 closes those.

### Bot-perceivability (primary v0.9 targets)

First 30-day diagnostic with the v0.9 planner hit both primary structural targets:

| Metric | v0.8 | v0.9 | Target |
|---|---:|---:|---:|
| Quests completed by unlimited | 0 | **37** | ≥30 HIT |
| Unique actions by unlimited | 15 | **170** | ≥50 HIT 3.4× |
| Quests with `unlocks:[...]` | 0 | **220/220** | ≥200 HIT |
| Quests with `chain_next` | 0 | **87** | ≥50 HIT |
| Misery zone count | 506 | **0** | ≤250 HIT |
| Monsters with no drops | 46.9% | **0%** | ≤15% HIT |
| Dangling drop-table refs | 84 | **0** | 0 HIT |
| Broken DAG refs | 210 | ~40 | ≤30 (near) |

XP ratios moved but remain below stretch targets (v0.8 → v0.9):
- `low/unlim` 0.023 → 0.034 (target 0.15)
- `medium/unlim` 0.059 → 0.083 (target 0.25)
- `high/unlim` 0.117 → 0.170 (target 0.40)

These are content-balance dials not structural bugs — unlimited still out-earns low because
the catalog's highest XP rates live in late-game content casuals can't afford to do often. Next
content balance pass can tune without another planner rewrite.

### Data wiring (the nervous system)

- **C1: 216 quests codemodded to `unlocks:[dag_node_id]` arrays** via
  `C:\Users\username\ScapeAI\scripts\codemod-quest-unlocks.js`. Parses trailing
  `// Unlocks: X` prose comments into machine-readable refs validated against
  `C:\Users\username\ScapeAI\data\progression-dag.json`. 121 unresolved refs logged to
  `C:\Users\username\ScapeAI\reports\_c1_unresolved.md` for future content passes.
- **C2: 87 multi-part chain quests got `chain_next:"quest_id"`** wiring the v0.8 chains 1-5 +
  RfD + Dragon Slayer series + the_last_dragon trilogy into traversable chains.
- **C3-C4: 4 stub quests repaired** (`the_werewolfs_dilemma`, `barrows_brothers`, `fight_caves`,
  `infernal_challenge`) + 13 Novice quests raised to 1-5k XP floor + 8 raid-prereqs got unique
  items + downstream unlock refs.
- **C5-C7, C15: 210 broken DAG refs → ~40**. 21 prefix-drift renames (`quest:missing_miner` →
  `quest:the_missing_miner`), 6 spurious retracts, 60 missing area nodes created in
  `C:\Users\username\ScapeAI\data\progression-dag.json`, DAG-builder lint rule installed to
  catch future `the_` prefix drift at build time.
- **C10: Two collection-log catalogues reconciled.**
  `C:\Users\username\ScapeAI\src\content\aelgard\pets-collection.js` (143 orphan entries engine
  never read) merged into `C:\Users\username\ScapeAI\data\collection-log.json` (authoritative).
  Catalog 209 → 210 entries; pets-collection.js reduced to pet-item registry with deprecation stubs.
- **C11: 58 diary DAG gates wired.** 0 downstream nodes required diary achievements in v0.8;
  now 25 elite + 18 hard + 15 medium downstream nodes gate on diary completion (rooftop
  shortcuts, elite-clue steps, region boss access).

### Content expansion

- **525 → 525** methods unchanged but the catalog now has **97 mid-tier moneymakers** (was 55) plus
  12 non-Inferno band-10 methods and 5 non-combat 5M+ methods (rune running, GE arbitrage, dream
  elixir, dreamwood elite, spice-feast catering).
- **Combat Achievements: 307 → 581** (+274). H4 added 99 CAs across 33 zero-coverage bosses (3 per
  boss with boss-specific mechanics, 4% kc ratio vs 35% baseline). H5 added 82 Master + 55 GM
  tasks. Target was ≥430 — exceeded.
- **Diary tasks: 320 → 540** across 9 regions × 4 tiers × 15 (was 8 regions × 4 tiers × 10). Wilds
  diary newly authored (60 tasks). Task variety rebalanced: skilling 31%, exploration 9%, clue 2.5×
  target, minigame 1.8× target. 5 elite stat-bonus rewards, 3 medium skilling-outfit pieces, 9
  elite pet-reward options, Moryskah + Sootworks bank teleports added.
- **Slayer masters: 3 → 9.** Harbourmaster Jorel (Saltbrine c50), Bonewarden Drusa (Boneyard c60),
  Widow Maeve (Moryskah c70), Ranger Hefin (Veilwood c75), Blastwarden Torka (Sootworks c80),
  Oracle Nimiel (Glass Desert c85). Fills the combat 40-85 ladder crater.
- **Drop tables: 84 new `dt_*` tables** created in `data/drop-tables.json` (bestiary coverage
  30% → 100%). 15 Pillar-4 shared-rare violations corrected (Blood rune was dropped by 35
  sources, etc.). 16 bosses previously without coll-log uniques now have at least 1 each.
  **832/832 combat monsters** now have drops (was 47% zero-drop).

### Catalog fixes

- **C13: `crafting_craft_zenyte_amulet` 3.75B gp/hr overflow** → 4.35M (units bug).
- **C14: 401 stub gp-values rederived** from drop-tables × kill rates via
  `C:\Users\username\ScapeAI\scripts\rederive-gp-per-hr.js`.
- **C16-C17: 293 misery zones buffed + 134 `kill_mega_*` intensity retags.** Combined with
  **H18/M7: 63 `osrs_canon:true` flags** added to intentional parity drudges excluded from
  median computation. Codemod at `C:\Users\username\ScapeAI\scripts\codemod-misery-buff.js`
  runs on every catalog rebuild — **misery count 506 → 0**.
- **M13-M15: band 9-10 skill coverage.** Every previously median-zero skill (RC, smithing,
  construction, fletching, farming, thieving, hunter, herblore, crafting) now has 2-3 endgame
  methods.

### Planner (C8/C9)

- `C:\Users\username\ScapeAI\src\sim\goal-planner.js` rewritten (476 lines). Quest-pursuit:
  synthesises virtual `quest-action::<id>` entries scored by
  `direct_xp + direct_item_gp + downstream_DAG_value × GP_EQUIV`, with downstream computed
  via reverse-adjacency DP over progression-dag.json (cycle-guarded). Quest disappears from
  feasibility post-completion.
- Novelty bonus: `1 / (1 + touch_count)` where touch_count is the action-id's hits in the
  last 100 picks (`BotState.touchHistory` ring buffer). Brand-new actions get ~1 bonus point.
- 26 new planner tests (43 → 69 total sim tests; project-wide 153 → 179).

### Analysis artifacts

- `C:\Users\username\ScapeAI\reports\v0.9-master-roadmap.md` — 59-task prioritized roadmap from
  9 gap audits. Drove this entire wave.
- `C:\Users\username\ScapeAI\reports\diagnostic-post-v0.9-waveC.html` — post-v0.9 diagnostic.
- `C:\Users\username\ScapeAI\reports\quest-xp-rollup.md` — M11 per-skill quest XP totals
  (8.5M XP across 224 quests, top-50 by XP, top-25 by downstream value).
- `C:\Users\username\ScapeAI\reports\explorer\money-making-guide.md` — 78KB M16 denormalized
  MMG view (top-50 per tier, per-region rankings, non-combat 5M+ callout, intensity heatmap).
- `C:\Users\username\ScapeAI\reports\lore-coherence-atlas.md` — 3 emergent meta-arcs identified:
  "The Eclipse Beneath" (cosmic, 47 seeds), "The Unwritten Pacts" (political, 34 seeds), "The
  Long Composition" (cultural, 29 seeds). Biggest load-bearing NPCs: Malachar (13 refs),
  Mirelda (12), Keeper Aureth (11). Most isolated region: Wilds (5 cross-refs, 3 natural
  bridges available).
- `C:\Users\username\ScapeAI\reports\osrs-gap-analysis.md`, `quest-reward-audit.md`,
  `misery-zone-fixes.md`, `broken-dag-refs-plan.md`, `drop-table-coverage.md`,
  `ca-expansion-plan.md`, `coll-log-audit.md`, `moneymaking-audit.md`, `diary-audit.md` —
  9 underlying gap audits.

### Deferred to v1.0+

- Coll-log drop rate rebalance (avg-luck completion still ~142,500hr vs 12,000hr target)
- 6 of 184 remaining broken DAG refs point at genuinely unwritten Scape-native quests
  (content-agent work)
- 6 OSRS-heritage quest placeholders need Scape-native replacements
- OSRS wiki offline mirror diff pass (HTTrack crawl in progress at
  `C:\Users\username\osrs-wiki-mirror\` — feeds future codex fill-out)
- Travel-cost annotations (bank distance, teleport routes, shortcut unlocks per account)
- Niche power dimension (damage_multipliers × class_tags per item/monster)
- Tradeoff economics (`gp_cost_per_hour` supplies-consumed field on methods)
- LOW tier roadmap items (L1-L6: minigame count +9, firemaking dedup, Explorer's diary, etc.)

### What's next

- **v1.0-play-api-complete** — final content balance tuning + XP-ratio targets hit + all 184
  broken DAG refs resolved + 30+ bosses with full text-encoded rotations. ~85% OSRS parity.
- Then **v1.1-build-api-v1** — formal content CRUD for the Bot/Human Build quadrants.
- Then **v1.2-human-play-gui** — RSC-stills billboard renderer over Play API.

---

## v0.8-play-api-tier1 — 2026-04-22

Tier-1 content depth + balance diagnostic. Landed via a 5-agent parallel burn (methods + quests + progression DAG + intensity catalog + sim).

### Content density

- **525 methods** across all 23 skills at `C:\Users\username\ScapeAI\data\methods\*.json` —
  every 10-level bracket (23 skills × 10 brackets = 230 slots) has 2+ methods at different
  intensities, with at least one intensity 1-2 AFK baseline (Marstead Pillar 1 compliance).
- **30 new Marstead quests** in 5 coherent chains at
  `C:\Users\username\ScapeAI\src\content\aelgard\quests-v0.8-chain-{1..5}.js`. Each chain is
  6 quests escalating novice → grandmaster; each ends in a unique non-interchangeable unlock
  (Aureth spellbook / Oath-Sworn smithing tier / Stormcrown tide-teleport + tide-walking /
  Moonsong 7-buff system / Pilgrim's Draught pre-cataclysm reagent). Cross-chain dependencies
  create Metroidvania bleed. Total repo quest count: **193** (163 pre + 30 new).

### Structural analysis

- **Progression DAG** at `C:\Users\username\ScapeAI\data\progression-dag.json` — 2,698 nodes,
  4,945 edges, 0 cycles, 210 broken refs (content gaps, not breaks), 336 breakpoints
  (nodes unlocking 5+ downstream), 90.5% connected component. Health verdict: connected
  Metroidvania. Region-gate areas dominate the breakpoint list (Wilds unlocks 91, Sootworks 88).
- **Intensity catalog** at `C:\Users\username\ScapeAI\data\intensity-catalog.json` — 2,117
  activities tagged with intensity 1-10, xp/hr, gp/hr, region. Full band coverage (every
  intensity 1-10 has 5+ activities). 506 misery zones flagged; RC 1-77 is the systemic
  offender (OSRS-parity time tax).

### Balance diagnostic (new subsystem)

- **Design doc** at `C:\Users\username\ScapeAI\docs\balance-diagnostic.md` — 4-account probe
  (low=200 / medium=500 / high=1000 / unlimited=∞ attention bar caps), identical decision
  logic, per-action drain, session ends at bar=0 or 8hr cap.
- **Sim engine** at `C:\Users\username\ScapeAI\src\sim\` — 7 files, 1,374 LOC:
  attention-bar, event-log, state, goal-planner, hyperspeed-runner, CLI, stubs.
- **HTML renderer** at `C:\Users\username\ScapeAI\src\sim\render-html.js` — 460 lines,
  single-file output, OSRS parchment palette, 4-column headline table + progression SVG +
  activity mix bars + ratio callouts + gap callouts.
- **43 new tests** (total suite now **153 tests**, was 110).

### First 30-day diagnostic

Output: `C:\Users\username\ScapeAI\reports\diagnostic-2026-04-22T15-41-16-794Z.html`

Ran 30 simulated days × 4 accounts against full v0.8 data (2,117 activities, 2,698 DAG nodes):

| | low | medium | high | unlimited |
|---|---|---|---|---|
| Total XP | 405k | 1.02M | 2.05M | 17.4M |
| Total GP | 181k | 457k | 918k | 6.48M |
| Highest skill | 63 | 73 | 80 | 99 |
| Unlocks reached | 581 | 587 | 589 | 618 |
| Unique actions | 6 | 6 | 6 | 15 |
| Quests completed | 0 | 0 | 0 | 0 |

**Ratios (all out of target bands):**
- `low / unlimited = 0.023 xp, 0.028 gp` — target 0.2-0.4. Casuals ~10× underserved.
- `medium / unlimited = 0.059 xp, 0.071 gp` — target ~0.5.
- `high / unlimited = 0.117 xp, 0.142 gp` — target 0.7-0.9.

**Signals for v0.9:**
1. Goal planner doesn't pursue quests effectively (0 quests completed despite 193 available).
2. Repetition trap — capped accounts funnel into 6 of 2,117 activities. Need novelty/exploration term in scoring.
3. Content under-serves mid-intensity constrained play. Ratios suggest top methods are backloaded into very high-intensity endgame.

### Follow-up tasks queued

- Task 16: completion-time calculator (hours-to-complete-all per account, 8,760hr target)
- Task 17: travel costs annotation (bank distance, teleport routes, shortcut unlocks)
- Task 18: tradeoff economics (gp_cost, +XP-GP vs +GP-XP classification)
- Task 19: niche power dimension (damage multipliers × class tags)
- Task 20 (new): fix quest pursuit in goal planner
- Task 21 (new): action diversity / novelty term to break repetition trap

### Not in v0.8 (still deferred)

- Real pixel art / sprites
- Real audio files
- 2D renderer / billboard sprite loader
- Production deployment (localhost only)
- PvP / Wilderness / spatial minigames
- Build API (bot-callable content CRUD)
- Build GUI polish

---

## v0.7-content-foundation — 2026-04-22

First tagged milestone in Scape's four-quadrant build path (bot/human × play/build, APIs first).
This is the **Play API content foundation** — engine audited + hardened, content registry deep
enough for a bot to play meaningfully against it. Human Play GUI, Build API, and Build GUI are
deferred to later tags.

Landed via a 4-agent parallel burn (foundation + items + quests + bestiary lanes, non-overlapping files).

### Engine foundation (wave 0)

- **14 orphaned subsystems wired** into `src/server.js`: accessibility, account (+security, save-states),
  bot-detection, channels (+quickchat), moderation (+rules), clue-commands, housing-commands,
  clan-commands (+hall/territory/bingo), random-events + daily-challenge, raid-invocations,
  ge-events, collection-log, diary. These were silent failures — modules existed in `src/engine/`
  but their `/commands` never registered at runtime. Now all report `[server] <module> wired`.
- **Test harness stood up**: vitest installed, `npm test` + `npm run test:watch`. 15 files /
  **110 tests** / all green / ~390ms. Covers XP tables, combat damage, bank, GE, tick, events,
  death, prayer, magic, gathering, processing, commands, items, skill manifest, subsystem boot.
- **23-skill declarative registry** at `src/engine/skills/` — uniform
  `{id, name, category, xpTable, actions, equipment, unlocks, capstone}` shape across all OSRS
  skills. New `/skills` command for introspection. Skills were scattered across `src/skills/`,
  `src/combat/`, `*-runner.js`, `data/slayer.js`, `data/recipes.js`; now unified.
- **CLAUDE.md** written at repo root documenting the real engine structure + subsystem inventory.

### Item database (wave 2)

- **1,064 new canonical items** in `data/items/` (additive to ~780 legacy items, zero ID collisions):
  - 431 equipment across 11 Scape tiers (Tinroot → Pigiron → Coalsteel → Brassforge → Quicksilver →
    Blacksteel → Darkiron → Runeforge → Dragonsteel → Aeldra → Wyrmforged)
  - 179 consumables (regional food, potions, teleports, cures)
  - 354 resources (ores, logs, fish, herbs, runes, seeds, hides)
  - 51 quest items
  - 49 reagents + **63 reagent pairs** (Marstead Pillar 3 — new items consume old, never deprecate)
  - 322 recipes
- Encounter-specific BiS: `scythe_of_vitur` (multi-target), `twisted_bow` (scales with target magic),
  `arclight` (vs demons), `veil_king_crown` (night-only prayer), `sunforged_greatsword` (day-only).
- Degradation loop: Aeldra/Wyrmforged gear requires `aeldra_recharge` / `wyrmforge_flame` recipes.
- Baked tradeoffs: `iron_ale` (+str/-atk), `fey_ribbon_cloak` (inf run, -10% def),
  `corrupted_ring` (+PvP/-PvE).

### Bestiary + drop tables (wave 2)

- **Bestiary bible layer** at `data/bestiary/`: 120 JSON entries across all 9 regions + 15 boss
  bibles. Mirrors `data/npc-bibles.json` structure (voice, drives, relationships, ecology).
- Pre-existing code-side bestiary verified: 506+ monsters across
  `src/atoms/definitions/monsters*.js` and `src/content/aelgard/monsters*.js`, 87 bosses,
  517 drop rows. Bible layer is additive, not duplicating stat spines.
- **36 drop tables** in `data/drop-tables.json` with Marstead reagent system — 27 new reagent pairs.
  Examples: `chapel_ash × 3 + any_blade → salted_blade` keeps bronze through dragon relevant;
  `ancient_crystal + ancient_hilt → voidwaker` for Wilds endgame.
- 12 encounter-specific BiS weapons defined.

### Quest content (wave 3)

- **20 new Marstead-compliant quests** at `src/content/aelgard/quests-burn-wave3{,-part2,-part3}.js`,
  wired into the server.js Aelgard content block (required at boot).
- 189 stages, 58 QP, all 9 regions + Drifting Market touched.
- 3 Novice / 3 Intermediate / 7 Experienced / 4 Master / 2 Grandmaster.
- 2 GM quests with 5+hr length, 15 stages each, 6-region traversal, 9-skill gates, 8-item laundry lists.
- 20/20 obtuse objectives + non-degenerate rewards + multi-skill gates.
- Seeded from existing NPC bibles' drives/fears/secrets — not templated.
- Total repo quest count: **163** (143 pre-existing across 5 content packs + 20 new).

Sample titles (showing the Marstead tabletop-RPG feel, zero "kill 10 boars"):
- *The Ambassador's Soup* — taste a 30-year-old three-course meal that is also an expunged-record
  confession; decide whether to publish, bury, or anonymise.
- *Walk Wide, Guest* — escort a victim's sister to her brother's death-place carrying a specific
  laundry list and a strict word-count.
- *The Second Question* (GM) — ask the question the Hermit has waited 41 years to hear; let the
  Old Sun (which is the moon) rise, refuse, or accept one favour.
- *The Alignment Beneath* (GM) — descend past Veldrak, past your own future-self, into the Wyrm's
  geometry. Align / preserve / refuse; change Aelgard's canon light.

### Memory corrections vs prior burn_v2 claims

- "7,000+ test assertions passing" — **FABRICATED**. Verified zero `.test.js` files existed before
  this wave. v0.7 ships the first real harness (110 tests).
- "143 existing quests" — **REAL**. Prior audit checked wrong path (only `src/data/quests.js`);
  real quests live in `src/content/aelgard/quests-*.js`.
- "24 engine subsystems wired live" — **PARTIAL**. 14 were orphaned modules that silently failed
  to register their commands at runtime. Fixed this wave.
- "110 new monsters + 517 drop rows" — **REAL**. Verified by bestiary agent.

### Not in v0.7 (deferred by design)

- Real pixel art / sprite assets (1,980+ manifest entries still point at nothing)
- Real audio/music files (535 cues defined, no files)
- 2D renderer / billboard sprite loader (play2d.html prototype exists, unused)
- Production deployment to sc4p3.com (localhost:2223 only)
- PvP / Wilderness / spatial minigames (require 2D)
- Build API (bot-callable content CRUD)
- Build GUI polish

### What's next

Per the four-quadrant roadmap:

- **v0.8-play-api-tier1** — skill-method depth, farming ticks, runecrafting network,
  slayer masters + boss rotation, POH construction
- **v0.9-play-api-tier2** — diaries, collection log, clue scrolls, music registry, tutorial
- **v1.0-play-api-complete** — 30+ bosses text-encoded, raid text sequences, ~85% OSRS parity
- **v1.1-build-api-v1** — formal content-CRUD API
- **v1.2-human-play-gui** — RSC-stills billboard renderer over the Play API
- **v1.3-human-build-gui** — `/builder` polished over the Build API

The **Bot Playthrough Simulator** (tiered day → hour → 5-min → minute HTML rollup) is the
acceptance test for Bot Play quadrant — runs a Marstead-aware heuristic bot through the
Play API at hyperspeed, produces a stat-rich HTML artifact. Consumes v0.7 content.
