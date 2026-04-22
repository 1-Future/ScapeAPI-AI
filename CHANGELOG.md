# Changelog

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
