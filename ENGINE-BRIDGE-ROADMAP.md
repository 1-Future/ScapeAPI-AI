# Engine Bridge Roadmap (Option A)

## The Problem
All the content we built lives in a parallel universe. The relationship registries (`src/data/relationships.js`, `src/content/aelgard/*`) hold ~260 training methods, 142 breakpoints, 69 quest unlocks, 35 combinations, 456 item sources — but the game engine (`src/server.js`) only knows how to run Inferno and Crystal Wyrm combat. Players can't actually train Mining, complete quests, enter gated areas, craft items, or hit breakpoints.

This roadmap describes the work to bridge that gap.

## Current Engine State
- `src/server.js` — 4,500 lines, tick loop, WebSocket, combat resolution, player state persistence
- `src/engine/content-registry.js` — registers "playable" content (Inferno, Crystal Wyrm) with mob defs, loadouts, reward functions
- `src/player/player.js` — player state shape with skills, inventory, equipment, quest progress, etc.
- `src/skills/gathering.js` + `src/skills/processing.js` — tick-handler APIs exist but only handful of nodes wired
- `src/world/npcs.js`, `src/world/entities.js` — NPC spawning and entity state
- Engine reads from hardcoded JS, NOT from the relationship layer we built

## Scope of the Bridge (5 sub-systems)

### 1. Training Method Execution (highest priority)
Every training method in the relationship registry needs a tick handler that executes when a player invokes it.

**Work:**
- Build `src/engine/training-runner.js` that takes a method ID + player + tick, resolves inputs/outputs/XP/cost
- Add WebSocket commands: `train <methodId>` to start, automatic tick progression
- When inputs are depleted (no food, no ore, no runes), method stops
- XP gained triggers the existing level-up path (which already fires via `addXp`)
- Resource production updates inventory

**Files to modify:**
- `src/server.js` — add `train` command handler
- `src/player/player.js` — add active-training state field
- Create `src/engine/training-runner.js`

**Estimated: 2-3 days**

### 2. Quest State & Completion
Right now the simulator auto-completes quests based on skill checks. The real engine needs actual quest step tracking and command-triggered completion.

**Work:**
- Load quest definitions into the engine (from `quests.js` data module + quest-unlocks registry)
- Player state: `questProgress[id] = { started, step, complete }` — already exists
- Commands: `quest start <id>`, `quest step`, `quest complete`
- When complete, apply unlocks: add items to inventory, register area access, update shop availability
- Events fired so the client can show "Quest complete!" notifications

**Files to modify:**
- `src/server.js` — quest command handlers
- Create `src/engine/quest-runner.js`

**Estimated: 2 days**

### 3. Area Gate Enforcement
When a player tries to enter an area, check the gate requirements.

**Work:**
- Extend the existing area/movement system to check gate requirements on teleport/travel attempts
- Rejection messages tell the player what they're missing ("You need Prayer 43 and completed 'The Bog Witch's Bargain'")
- Support gate requirement lookups via `rel.canAccessArea(player, areaId, getLevel)`

**Files to modify:**
- `src/server.js` — movement command handlers
- Likely `data/areas.json` — add `requires` field per area (sync with gates registry)

**Estimated: 1 day**

### 4. Recipe/Combination Execution
Cooking raw shark into cooked shark, smithing iron ore into iron bars, brewing potions, combining Hydra Claw + Zamorakian Hasta into Dragon Hunter Lance.

**Work:**
- `src/engine/recipe-runner.js` that takes a recipe ID + player, checks inputs, applies outputs, awards XP
- Both skill recipes (cooking, smithing) and combinations (reagent upgrades)
- Commands: `craft <recipeId>`, `combine <resultId>`
- Station requirements (range, furnace, anvil) checked against player location

**Files to modify:**
- Create `src/engine/recipe-runner.js`
- `src/server.js` — `craft` and `combine` command handlers

**Estimated: 2 days**

### 5. Breakpoint Events & Codex Notifications
When a player hits a breakpoint (skill 43 prayer, quest complete, item acquired), fire an event. The client can show a big transformative-breakpoint modal.

**Work:**
- Already have `rel.getBreakpointsForSkill(skill)` — detect these in the `addXp` level-up path
- Emit WebSocket event `{ type: 'breakpoint', importance, description, unlocks }`
- Client-side: show modal for transformative breakpoints, toast for major/minor
- Log to player's `breakpointsHit` history

**Files to modify:**
- `src/player/player.js` — add `breakpointsHit` array
- `src/server.js` — level-up path emits event
- `public/play.html` — client-side modal/toast (debug UI only for now)

**Estimated: 1 day**

## Sequencing

### Week 1
- Day 1-3: Training method execution (biggest lift, unblocks everything)
- Day 4-5: Quest state & completion (enables gates)

### Week 2
- Day 1: Area gate enforcement
- Day 2-3: Recipe/combination execution
- Day 4: Breakpoint events
- Day 5: Integration testing — run the RL agent through a full Aelgard journey

## Validation Plan
Once all 5 systems are wired:
- **RL agent runs the full game** — starts at level 1, trains up, completes quests, unlocks areas, hits breakpoints, reaches prestige goal
- **Session logs readable** — a viewer can follow along: "Hour 23: reached prayer 43, protection prayers unlocked"
- **Codex reflects live state** — player state queries hit the relationship registry, Codex pages show player-specific progress

## What this buys us
- Before: "the game is described in data"
- After: "the game is playable"
- The RL agent becomes the full-game playtester
- Humans can watch it play via the spectator
- We can test game design by running different agent personalities against the live engine
- 2D rendering becomes purely a visual layer on top of a game that already works

## Dependencies / Blockers
- None. All the data is ready. The engine just needs to consume it.
- The bridge uses the existing `rel.*` APIs — we don't need a separate data layer
- The `data/relationships.js` module is already loaded by the sim, can be loaded by the server the same way

## Out of scope
- 2D rendering (explicit deferral, per v1 plan)
- Polish on `play.html` — debug client only
- Multiplayer scaling
- Grand Exchange / trading (separate subsystem, not required for single-player validation)
- Dialogue system wired to Ollama (separate subsystem)

## File Manifest (new + modified)

### New files
- `src/engine/training-runner.js`
- `src/engine/quest-runner.js`
- `src/engine/recipe-runner.js`

### Modified files
- `src/server.js` — 4 new command handlers (train, quest, craft, combine) + breakpoint emit
- `src/player/player.js` — add activeTraining state + breakpointsHit array
- `data/areas.json` — add `requires` field synced with gates
- `public/play.html` — breakpoint modal/toast
