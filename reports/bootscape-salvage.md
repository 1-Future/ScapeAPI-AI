# Bootscape / OpenScape / ScapifyDatSheet Seed Salvage Report

**Branch:** `burn-v2/seed-salvage`
**Date:** 2026-04-15
**Author:** burn-v2 agent a0580a50

---

## Sources Surveyed

### 1. `/tmp/scape-repos/bootscape/`

OSRS-era Jagex-style private server in TypeScript + RS2 scripts. Structure:

- `Client-TS/` — 3D Java-port client. Not applicable (rendering code).
- `Server/content/pack/*.pack` — binary asset packs (loc, npc, obj, model, anim, seq, inv, flo, etc.). Not applicable without the bootscape toolchain and would be OSRS-themed regardless.
- `Server/content/scripts/` — RS2 script bundles, mostly per-area / per-quest / per-skill implementations. The only data-shaped subtrees are:
  - `music/configs/music.dbtable` (~1167 rows of OSRS track names)
  - `music/configs/musicregion.dbtable` (map-square to track mapping)
  - `drop tables/scripts/*.rs2` (~70 per-monster drop procedure scripts)
  - `levelup/configs/levelup.dbtable` (level-up interface schema)

### 2. `/tmp/scape-repos/OpenScape/data/`

All 12 files are MiniScape tile-editor session output. Every non-empty file is a tile-coordinate-keyed dictionary tied to a specific MiniScape world — not portable to Aelgard.

### 3. `/tmp/scape-repos/ScapifyDatSheet/`

- `SCAPIFY.md` — 8-step design filter for translating any game concept into OSRS/Aelgard-native content.
- `IDEAS.md` — Curated index of four fully-designed minigame concepts.
- `designs/marchlands.md`, `ramparts.md`, `deadhold.md`, `ascendancy.md` — Complete per-design specs (core loop, skill integration, grind, stakes, social model, cousins, naming).

---

## What Was Useful

### Salvage A — Four Scapified Minigames

The existing `src/content/aelgard/minigames.js` defines six minigames (Pest Control, Sootworks Forge, Spirit Pyre, Castle Wars, Guardians of the Rift, Barbarian Assault). Each ScapifyDatSheet design fills a distinct gap:

| Minigame | Gap Filled | Distinguishing Feature |
|---|---|---|
| Marchlands | 5v5 PvP with real stakes (Castle Wars is cosmetic-only) | MOBA lane push with combat triangle + Herblore mid-match potion brewing |
| Ramparts | Solo scaling siege (nothing covered this) | Tick-timed siege-weapon projectile leading across 4 lanes |
| Deadhold | Co-op skill-driven undead survival (Pest Control is non-thematic) | Construction barricades, Smithing weapons, Herblore perks, Firemaking slow-zones |
| The Ascendancy | Roguelike build-diversity runs (no run-based content existed) | Walk in barefoot, randomized upgrade drops, 50+ waves |

Ported to `src/content/aelgard/minigames-scapified.js`. Added 4 minigames, 30 items (currencies, uniques, cosmetics, consumables), 4 minigame-host NPCs, and 4 quest-unlock relationships. All items are untradeable and minigame-locked so the main economy and bank-tier gear never devalue.

### Salvage B — Scapify Method JSON

`SCAPIFY.md`'s 8-step filter ported to `data/scapify-method.json` — structured so the builder AI can feed it to Claude as a schema when designing new Aelgard content. Includes pass criteria, output shape, and an index of registered outputs.

### Salvage C — Drop Tables for 10 Existing Monsters

Bootscape ships authentic OSRS drop-table RS2 scripts. `src/data/droptables.js` defines only 11 tables (chicken, cow, goblin, guard, hill_giant, lesser_demon, green_dragon, king_black_dragon, giant_mole, barrows_chest). The following NPCs exist in Aelgard but had no drop table: `man`, `woman`, `farmer`, `giant_rat`, `skeleton`, `unicorn`, `werewolf`, `zombie`, `pirate`, `moss_giant`.

Converted the RS2 `random(128)` / `random(512)` branch structures into our weighted-main + tertiary format, preserving approximate probabilities. Ported to `src/content/aelgard/drop-tables-bootscape.js`. Items map to canonical IDs already in `src/data/items.js`; new IDs (600-650 range) are reserved for items referenced but not yet defined (e.g. `raw_rat_meat`, `unicorn_horn`, `grey_wolf_fur`, `iron_platebody`, `cosmic_rune`).

### Salvage D — Region-to-Music Mapping

Bootscape's `musicregion.dbtable` maps OSRS map-squares to track IDs; the structure is useful even though the content is OSRS. Our `data/audio-manifest.json` ships 50+ authored Aelgard music cues but has no tile-coordinate lookup table. Ported the mapping pattern to `data/music-regions.json`, using region IDs that match `rel.defineAreaGate` and cue IDs that exist in the audio manifest. Covers all 10 regions (heartlands, moryskah, veilwood, sootworks, saltbrine, boneyard_wastes, inkweald, glass_desert, wilds, drifting_market), sub-area variants, dungeon defaults, 11 boss-fight cues, and all 10 minigame ambient cues.

### Salvage E — Minigame Reward Catalog

Ten minigames (six original + four scapified) aggregated into `data/minigame-rewards.json` with:
- 9 unique currencies
- 55 collection log slots across all ten
- 7 minigame pets
- Per-item drop-rate and unlock-condition metadata

This is the canonical reward table for the UI and the completionist tracker.

---

## What Was Not Useful (and Why)

| Source | Reason Skipped |
|---|---|
| Bootscape RS2 quest scripts (59 files) | Aelgard ships 69 native quests in `content/aelgard/quests-*.js`. OSRS quests would duplicate and off-theme. |
| Bootscape RS2 shop scripts | `content/aelgard/shops-expanded.js` already covers Aelgard shops with region-appropriate inventories. |
| Bootscape area scripts (alkharid, ardougne, camelot, falador, draynor, varrock, etc.) | All OSRS-specific names. Aelgard uses its own regions. |
| Bootscape skill scripts (skill_agility, skill_cooking, etc.) | `data/relationships.js` + `content/aelgard/training-methods.js` + `skill-web.js` are already complete. RS2 scripts are implementation, not authorable data. |
| Bootscape binary packs (`*.pack`) | Require the bootscape toolchain to unpack, and contain OSRS-themed 3D models / animations regardless. |
| Bootscape `music.dbrow` track names (~1167 OSRS tracks) | Our `audio-manifest.json` ships an authored Aelgard cue set. OSRS track names off-theme. |
| Bootscape `levelup.dbtable` | Defines an interface schema, not data. Our engine uses `src/engine/breakpoint-runner.js` hooked to `rel.defineBreakpoint()`. |
| OpenScape/data/*.json (12 files) | All either empty ({}) or MiniScape-world-specific tile-coordinate dictionaries. No semantic content portable to Aelgard. |
| ScapifyDatSheet IDEAS.md | Just index summaries of the four designs already ported via `designs/*.md`. |

---

## Deliverables Checklist

- [x] `reports/bootscape-salvage.md` — this file
- [x] 6 new files:
  - `src/content/aelgard/minigames-scapified.js`
  - `src/content/aelgard/drop-tables-bootscape.js`
  - `data/scapify-method.json`
  - `data/music-regions.json`
  - `data/minigame-rewards.json`
  - `data/bootscape-salvage-index.json`
- [x] 10+ test assertions: `scripts/test-seed-salvage.js`
- [x] Branch `burn-v2/seed-salvage` created
- [x] Every ported data file registers via `rel.*` or direct `data/` authoring
  - Minigames -> `mg.defineMinigame` + `items.define` + `npcs.defineNpc` + `rel.defineQuestUnlock`
  - Drop tables -> `droptables.define`
  - JSON data -> loaded directly by engine/UI

---

## Verification

Run the tests:

```
node scripts/test-seed-salvage.js
```

Validates that:
1. All four scapified minigames registered in the minigame map
2. Each minigame has an associated currency item
3. Each minigame has a dialogue NPC
4. Each minigame has a quest-unlock relationship
5. All ten new drop tables are reachable via `droptables.roll`
6. Drop tables always drop bones or big bones
7. `scapify-method.json` has all 8 steps
8. `music-regions.json` covers all 10 regions
9. `minigame-rewards.json` totals match per-minigame aggregation
10. `bootscape-salvage-index.json` lists every ported file
