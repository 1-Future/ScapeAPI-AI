# ScapeAPI Salvage Report — Burn v2

**Date:** 2026-04-15
**Branch:** `burn-v2/scapeapi-salvage`
**Fork source:** `/tmp/scape-repos/ScapeAPI/` (mirrored into `.old-scapeapi-ref/` for diffing)
**Target:** `C:\Users\username\ScapeAI` (this worktree)

## Executive summary

The old ScapeAPI fork is a **strict subset** of the current Scape repo. Every
directory, file, command, data table, engine subsystem, and server function
that exists in the old fork also exists in the current tree — usually with
significantly more functionality. No features, tests, or docs are exclusive
to the old codebase.

Concretely:

- **0** commands exist in the old codebase that don't exist in the new.
- **0** data tables (droptables, shops, recipes, quests, ge, slayer) differ
  byte-for-byte; all six are identical.
- **0** tests existed in the old codebase (new has 20+ scripts in `scripts/`).
- **0** `IMPLEMENTATION.md` deltas — the two files are byte-identical.
- **0** engine modules were lost in the rewrite — new has 21 engine modules,
  old had 6; every old module carries forward.

So strictly "unique to old" = 0.

The salvage value is instead in **code-hygiene retrievals**: the old fork had
a simpler, cleaner structure that got overgrown as the Inferno rewrite,
breakpoint runner, GE, area-locking, etc. were stacked onto `src/commands/all.js`.
The old version is a useful reference for:

1. Extracting the embedded `const` data tables inside `all.js` into dedicated
   modules so new content authors don't have to edit the 3366-line monolith.
2. A small piece of map UI (column-header and row-gutter) that was nicer in
   the old renderer but dropped during the Inferno-aware rewrite.
3. Keeping the pre-OSRS-accurate combat formulas around for regression
   testing and RL-agent warm-up.

## Classification

Because "unique to old" is empty, the classification below flips to a
**delta audit** — categories describe the relationship of old-only code
fragments (simpler variants, embedded tables, dropped polish) to new code.

### WORTH-PORTING — 8 items

These were lifted from inline-in-`all.js` into dedicated modules. New code is
identical in value and shape to both old and new inline copies; no callers
change. Port adds separation-of-concerns, not behavior.

| # | Source location (old) | Ported to | Reason |
|---|---|---|---|
| 1 | `src/commands/all.js :: SEED_DATA`        | `src/data/seed-data.js`    | Farming expansion has a home outside the 3.3k-line commands file |
| 2 | `src/commands/all.js :: BONE_XP`          | `src/data/bone-xp.js`      | Bone references (drops, quests, prayer scripts) can import without pulling the whole commands module |
| 3 | `src/commands/all.js :: RC_ALTARS`        | `src/data/rc-altars.js`    | Runecrafting content modularization + shared `runesPerEssence()` helper |
| 4 | `src/commands/all.js :: HOUSE_ROOMS`      | `src/data/house-rooms.js`  | POH room/furniture catalog lives outside the command registrar |
| 5 | `src/commands/all.js :: BOSS_INFO`        | `src/data/boss-info.js`    | Boss compendium lives with other data tables |
| 6 | `src/commands/all.js :: ACHIEVEMENTS`     | `src/data/achievements.js` | 32 achievements + lamp-id helper, extractable for quest rewards and audit |
| 7 | `src/commands/all.js :: generateMap()` gutter | `src/world/map-gutter.js` | Restore old column-`v` and row-`> ` markers as opt-in decorator |
| 8 | `src/combat/combat.js` (pre-rewiki formulas) | `src/combat/combat-legacy.js` | Pin the old formulas for diff/regression/RL-warmup |

### SUPERSEDED — 17 items (not ported, current is strictly better)

Old shipped a simpler/less-capable implementation that the current code has
already rewritten. Leaving these in place would regress.

| # | Subsystem | Old behavior | New behavior (superseding) |
|---|---|---|---|
| 1  | `combat/combat.js` effective level | `floor((level+pot+style+8)*prayer)` — floor applied to whole | OSRS-accurate `floor((level+pot)*prayer) + style + 8` |
| 2  | Prayer boosts | 11 melee-only prayers | 22 prayers including Sharp Eye, Hawk Eye, Eagle Eye, Rigour, Mystic Lore, Mystic Might, Augury |
| 3  | Magic combat | flat +8 effective magic | Prayer-aware effective magic |
| 4  | Ranged range detection | 3 weapon keyword cases | 7 keyword cases covering blowpipe, darts, knives, thrownaxe |
| 5  | Attack-speed inference | weapon.speed only | weapon-name heuristic (2h/halberd=7, battleaxe=6, longsword=5, etc.) |
| 6  | NPC defence roll | one formula for all styles | Magic gets its own (magic_level + 9) branch |
| 7  | Melee attack | no weakness/resistance | `meleeAttackWithWeakness` with tags + `effective_vs` gear |
| 8  | Eat cooldown | single 3-tick `nextEatTick` | 3-track eating (food + potion + combo food) |
| 9  | Map renderer | 15x15 fixed grid | variable, instance-aware, path directionality, cardinal area labels |
| 10 | NPC system | wander + respawn only | multi-tile size, onTick/onAttack/onDeath hooks, LOS, dying animation, block/move flags |
| 11 | Pathfinding | A* | A* with optional blockedTiles set |
| 12 | Player state | 47 fields | 50 fields (adds activeTraining, questProgress, breakpointsHit, breakpointHistory) |
| 13 | `engine/commands.js` | plain dispatch | adds spam-protection (`nnn`→`n`), ws param, structured unknown result |
| 14 | `engine/tick.js` | 4-priority linear loop | 10-phase OSRS-ordered tick (preTick, npcTimers, ..., postTick) |
| 15 | `world/tiles.js` unwalkable set | no EMPTY | includes EMPTY (prevents walk-into-void) |
| 16 | `data/items.js` | 204 defines, no `equipSlot` on ammo | 240 defines, ammo has `equipSlot: 'ammo'`, full Inferno loadout |
| 17 | Event bus | fire-and-forget | same but now routes through `breakpoint-runner` for XP milestones |

### OBSOLETE — 0 items

Nothing in the old fork is obsolete in the sense of "delete on sight" —
everything is either already present or is an older version of something
present.

## New engine modules added since the fork (for context)

These did not exist in the old fork; they're the main reason the current
codebase is 2x the size:

- `src/engine/area-gate-runner.js`, `area-locked.js`, `area-locked-commands.js`
- `src/engine/audio-triggers.js`
- `src/engine/breakpoint-runner.js`
- `src/engine/collection-log.js`
- `src/engine/content-loader.js`, `content-registry.js`
- `src/engine/death.js`, `death-commands.js`
- `src/engine/dialogue-commands.js`
- `src/engine/diary.js`
- `src/engine/ge-commands.js`, `ge-events.js`, `ge-runner.js`
- `src/engine/instances.js`
- `src/engine/ironman.js`, `ironman-commands.js`
- `src/engine/quest-runner.js`, `recipe-runner.js`, `training-runner.js`
- `src/world/entities.js`, `los.js`, `sprite-registry.js`, `tilemap.js`
- `src/combat/projectiles.js`
- `src/ai/*`, `src/atoms/*`, `src/content/*`, `src/db/*`, `src/skills/*`, `src/tools/*`
- `src/auth.js`, `game-loop.js`, `http-api.js`, `training-bridge.js`, `training-bridge-wyrm.js`
- `src/data/relationships.js`

## Deliverables

### New source files

| Path | Purpose |
|---|---|
| `src/data/seed-data.js` | Farming seed catalog (extracted) |
| `src/data/bone-xp.js` | Prayer bone XP table (extracted) |
| `src/data/rc-altars.js` | Runecrafting altar defs + `runesPerEssence` helper |
| `src/data/house-rooms.js` | POH rooms & furniture catalog |
| `src/data/boss-info.js` | Boss compendium |
| `src/data/achievements.js` | Achievement registry + lamp-id resolver |
| `src/world/map-gutter.js` | Opt-in ASCII gutter decorator for `/map` |
| `src/combat/combat-legacy.js` | Pre-wiki combat formulas for regression & RL |

### New test script

| Path | Assertions |
|---|---|
| `scripts/test-salvage-ports.js` | 57 pass, 0 fail |

### Existing tests verified unbroken

| Script | Result |
|---|---|
| `scripts/test-death.js` | 70/70 pass |
| `scripts/test-breakpoint-runner.js` | pass |
| `scripts/test-collection-diary.js` | 465/465 pass |
| `scripts/test-recipe-runner.js` | pass |

## Methodology

1. Copied the reference repo into `.old-scapeapi-ref/` (gitignored via the
   worktree's exclude) to enable reads by the diff tools.
2. Ran `diff -q` on every top-level directory pair to enumerate add/remove/
   modify buckets.
3. Extracted command registration names from both `all.js` variants with
   regex, then `comm -23` to enumerate commands-only-in-old (result: empty).
4. Byte-compared every data table in `src/data/` (all six identical).
5. Diffed IMPLEMENTATION.md, ai-player.js, play.js (all identical).
6. Read the differing files — `combat/combat.js`, `player/player.js`,
   `world/*.js`, `engine/tick.js`, `engine/commands.js`, `commands/all.js` —
   to classify every delta as WORTH-PORTING / SUPERSEDED / OBSOLETE.
7. Identified eight extraction opportunities and one polish port.
8. Built 57 assertions around the extracted modules to pin values/shapes.
9. Verified baseline tests still pass post-port.

## Surprising finding

**The old fork has zero test scripts.** Every `scripts/test-*.js` file
(20 files, ~1500+ assertions) is new. The old fork shipped to production on
the strength of manual testing and the live RL agent as the test harness.
Burn v2 inherits a much safer base — every subsystem now has a node-script
regression test, which is why this salvage could be done aggressively
without fear of silent regressions.
