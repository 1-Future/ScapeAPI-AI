# CLAUDE.md — Scape engine guide

This file is read by Claude Code automatically when the agent starts work in
this repo. It documents the REAL engine structure as of burn-wave0 (2026-04-22).

## What is Scape?

Scape is an OSRS-parity MMO built on Node.js with a thick-server / thin-client
architecture. Every mechanic is server-authoritative. The intended player is
the RL agent until 2D tile rendering lands. Every subsystem is API-first.

- **Repo:** github.com/1-Future/ScapeAPI-AI (branch: `main`)
- **Domain:** sc4p3.com
- **Design bible:** `.claude/projects/C--Users-username/memory/feedback_marstead_transcript.md`
  (10 pillars, 8 knobs, anti-WoW quest design)
- **World:** Aelgard, 9 regions — Heartlands, Sootworks, Moryskah, Boneyard,
  Glass Desert, Saltbrine, Veilwood, Inkweald, Wilds.

## Run the server

```bash
npm start            # node src/server.js (port 2223)
npm run dev          # same + --watch
```

PostgreSQL must be reachable (see `src/db/index.js`). Ollama optional — if
unreachable the narrator goes silent but the tick loop still runs.

## Run tests

```bash
npm test             # vitest run — single-fork, serial
npm run test:watch   # vitest watch
```

Tests live in `tests/unit/*.test.js`. As of burn-wave0 there are 110 tests
covering XP tables, combat damage, bank, GE, tick, events, death, prayer,
magic, gathering, processing, commands, items, skill manifest, and a boot
smoke for 28 orphan subsystems that used to silently fail to register.

## Entrypoint flow (`src/server.js`)

1. Load `ws` + `http` and instantiate a WebSocket + HTTP server on port 2223.
2. Require core engine modules (tick, events, commands, persistence,
   plugins) and register world objects (tiles, walls, npcs, objects).
3. Require data modules (items, recipes, shops, quests, droptables, slayer, ge).
4. Register every command family via `src/commands/all.js`.
5. Load Aelgard content packs (lines 3657-3734) — each region, items pack,
   quest pack, monsters pack, raid pack, etc. Many use `try / catch` so a
   broken pack doesn't abort boot.
6. Wire the breakpoint runner, narrator, combat-achievements event hooks.
7. Register the burn-v2 subsystem commands: GE, dialogue, death, area-locked,
   ironman, audio, tutorial, pets, bank, trade, prayer, magic, hiscores,
   voting.
8. **burn-wave0 addition** — wire the previously-orphaned subsystems:
   accessibility, account, bot-detection, channels, moderation, clue, housing,
   clan, random-events, daily-challenge, raid-invocations, ge-events,
   collection-log, diary.
9. Register the unified skill manifest (23 skills) and the `/skills` command.
10. Start persistence auto-save, HTTP API, admin dashboard, and
    `tick.startTicking()`.

## Subsystem inventory

Every module in `src/engine/`. "Wired" means `register()` or lifecycle hook
fires at boot. "Orphan" = the file existed but was never required from
`server.js` or any other boot-time entrypoint before burn-wave0.

### Wired before burn-wave0

| Module                     | Wired via                           |
|----------------------------|-------------------------------------|
| `tick`                     | require at top + `startTicking()`   |
| `events`                   | require at top                      |
| `commands`                 | require at top                      |
| `persistence`              | require + `startAutoSave()`         |
| `plugins`                  | require at top                      |
| `actions`                  | `commands/all.js`                   |
| `tutorial` + `-commands`   | explicit register (line 5078)       |
| `pets` + `-commands`       | register (line 52)                  |
| `ge-commands` + `ge-runner`| explicit register (line 4923)       |
| `dialogue-commands`        | explicit register (line 5024)       |
| `death` + `-commands`      | register + event hook (line 4926)   |
| `area-locked` + `-commands`| register (line 4927)                |
| `ironman` + `-commands`    | register (line 4929)                |
| `audio-triggers` + `-wiring`| forwarder + attach (line 4931)     |
| `bank-commands`            | register (line 5089)                |
| `trade-commands`           | register (line 5139)                |
| `prayer-runner` + `-commands`| register + used by combat.js      |
| `magic-runner` + `-commands`| register + used by combat.js       |
| `highscores` + `-commands` | register + attach (line 5158)       |
| `voting` + `-commands`     | register + sweeper (line 5159)     |
| `content-loader`           | `loadAllContent()` at boot          |
| `content-registry`         | required via content packs          |
| `instances`                | lazy-require in combat / boss paths |
| `spectate-bridge`          | required + used by breakpoints      |
| `breakpoint-runner`        | required + XP hook                  |
| `combat-achievements`      | event hook (line 3793)              |
| `admin-api`                | `init()` at boot                    |
| `quest-runner`             | `commands/all.js`                   |
| `training-runner`          | `commands/all.js`                   |
| `area-gate-runner`         | `commands/all.js`                   |
| `recipe-runner`            | `commands/all.js`                   |

### Wired as of burn-wave0 (previously orphaned)

| Module                     | Now wired via                                    |
|----------------------------|--------------------------------------------------|
| `accessibility` + `-cmds`  | `accessibility-commands.register`                |
| `account` + `-cmds`        | `account-commands.register`                      |
| `account-security`         | used by `account-commands` + `bank`              |
| `save-states`              | used by `account-commands`                       |
| `bot-detection` + `-cmds`  | `bot-detection-commands.register`                |
| `channels` + `-cmds`       | `channels-commands.register`                     |
| `moderation` + `rules`     | `mod-commands.register`                          |
| `clue-commands`            | `register({ commands })`                         |
| `housing` + `-cmds`        | `housing-commands.register`                      |
| `clan` + `-hall/territory/bingo/cmds`| `clan-commands.register` (internally loads the siblings) |
| `random-events` + `-cmds`  | `register` + `attachTickHook`                    |
| `daily-challenge`          | `attachTickHook`                                 |
| `raid-invocations`         | best-effort `register({ commands, tick })`       |
| `ge-events`                | `attach({ ge, events })`                         |
| `collection-log`           | `load()` at boot                                 |
| `diary`                    | `load()` at boot                                 |

### Net-new in burn-wave0

| Module                     | Purpose                                           |
|----------------------------|---------------------------------------------------|
| `src/engine/skills/`       | 23 skill manifests + index. Declarative-only.     |
| `/skills` command          | Enumerate + introspect any player's skill state.  |

## Skill stack

Gameplay implementations live in `src/skills/` and `src/combat/`. The
**declarative manifest** lives in `src/engine/skills/`. Each of the 23
OSRS-parity skills has a file exporting this shape:

```js
{
  id:         'mining',                // lowercase, matches SKILLS[]
  name:       'Mining',
  category:   'gathering' | 'processing' | 'support' | 'combat' | 'exploration',
  xpTable:    [0, 0, 83, ..., 13034431],
  actions:    [{ level, name, xpPer, baseTimeMs, requirements?, produces?, region, attention }],
  equipment:  [{ slot, name, level, provides? }],
  unlocks:    { 15: 'You can now mine Iron ore.', ... },
  capstone:   { level: 99, name, description },
}
```

The 23 skills (as enumerated in `src/player/player.js#SKILLS`):

Attack, Strength, Defence, Hitpoints, Ranged, Prayer, Magic, Runecrafting,
Construction, Agility, Herblore, Thieving, Crafting, Fletching, Slayer, Hunter,
Mining, Smithing, Fishing, Cooking, Firemaking, Woodcutting, Farming.

Action region names map to the 9 Aelgard regions. The
`attention` field classifies every action using the manifesto's P02 scale:
Background / Multitask / Active / Max Focus.

## Content data layout

`data/` at repo root holds world JSON:

- `npc-bibles.json` — bestiary narratives (OTHER AGENT'S LANE — do not touch)
- `items-*`, `items/` — item database (OTHER AGENT'S LANE)
- `quests/` — quest narratives + DSL (OTHER AGENT'S LANE)
- `tilemaps/` — per-region tile grids
- `walls.json`, `objects.json`, `npc_spawns.json` — world state
- `graves.json` — death graves persistence
- `highscores.json`, `polls.json`, `clans.json` — persistent feature state
- `collection-log.json`, `diaries/` — achievement state
- `audio-manifest.json`, `music-regions.json`, `sprite-manifest.json`,
  `sprite-palettes.json`, `item-visuals.json` — asset manifests

`src/content/aelgard/*.js` — Aelgard content packs. Hundreds of files, each
registering items / monsters / quests / recipes into the global registries at
require-time.

`src/content/inferno/` — Inferno wave challenge.

`src/content/crystal_wyrm/` — Crystal wyrm RL training content.

## Commit conventions

```
[burn-wave0] <summary>
```

When a pre-commit hook fails: investigate + create a NEW commit, never
`--amend` over a failed hook commit.

## Files you should NEVER touch during a burn

- `data/npc-bibles.json`
- `data/items/`, `data/items-*`
- `data/quests/`, `data/quest-*`
- `public/play.html`
