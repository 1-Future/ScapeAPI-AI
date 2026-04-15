# ScapeTests Port Gaps — burn-v2/test-port

This document records the ScapeTests/ specs (markdown test documents) that
could not be ported into `scripts/test-*.js` during the burn-v2 test port. The
upstream `/tmp/scape-repos/ScapeTests/` repository contains 43 markdown spec
files (TEST-XXXX cases) plus an inferno-rl/ directory of Python RL training
code. Specs that map to features not present in the engine are logged here so
future waves can either implement the feature or formally drop the spec.

Ports that succeeded are in:
- `scripts/test-xp-curve.js` (76 assertions)
- `scripts/test-combat-formulas.js` (59 assertions)
- `scripts/test-inventory.js` (70 assertions)
- `scripts/test-tick-system.js` (60 assertions)
- `scripts/test-prayer-combat.js` (69 assertions)
- `scripts/test-ranged-magic.js` (130 assertions)
- `scripts/test-helpers.js` (shared assertion library, fixture builders, OSRS
  reference tables)

All 464 newly ported assertions pass under `node scripts/test-<name>.js`.

---

## Gaps: specs not ported because the feature is not in the engine

### Spec 01 — Tick System (partial gap)
- **TEST-0101** base tick rate at 100 ticks/60s: the engine exposes
  `tick.TICK_MS = 600` and `processTick()` but the wall-clock interval is not
  under test here (we drive it synchronously). Ported the constant + phase-
  ordering assertions; the literal 100-ticks-in-60s test is a simulation-timer
  test and out of scope for unit tests.
- **TEST-0102 / 0103** walking/running movement per tick: requires a
  player-movement sub-system that drives `x`/`y` from a path. The engine has
  `player.path` but no scripted path stepper available at unit-test scope.
- **TEST-0109 / 0110** tick manipulation (3-tick fishing, 2-tick woodcutting):
  training-runner emits items/XP as drip accumulators, not per-tick resource
  rolls. Tick manipulation is out of scope by design (Scape uses knob-driven
  training, not resource-per-tick rolls).
- **TEST-0113** special-attack energy regen at 10%/50 ticks: engine has
  `p.specialEnergy` but no regen tick registered.
- **TEST-0114** stat boost decay at 1 level/100 ticks: engine stores
  `p.boosts[skill].ticksLeft` but no global decay handler drives it in a way
  we can assert in unit tests.
- **TEST-0115** prayer flicking: activePrayers is a Set; there is no per-tick
  prayer-point drain handler to exercise flicking against.

### Spec 02 — Movement
All movement specs (TEST-0201..0215) rely on a pathfinding/movement engine
that isn't exposed at the player-library level in a way amenable to unit
tests. The engine-bridge integration test drives movement indirectly via
area-gate teleports. Out of scope for this port.

### Spec 07 — Combat Special Attacks
Special attack weapon definitions, spec-energy drain, and per-weapon special
effects do not exist in `src/combat/combat.js`. Skipped entirely.

### Spec 09 — Hitpoints (partial gap)
- **TEST-0901** base HP at level 10: covered in `test-xp-curve.js` via
  combatLevel(level-3 newbie) and in `test-inventory.js` via the fresh-player
  fixture.
- **TEST-0902** natural HP regen: engine has no passive regen tick registered
  at this layer; out of scope.
- **TEST-0903..0912** specific food-heal values, poison ticks, venom, and
  Redemption prayer: the engine's `FOOD_HEAL` table is defined but no `eat()`
  command path is exposed on a plain player fixture; the heal-table itself
  is verified indirectly in the engine-bridge integration test.

### Spec 10 — Gathering Skills
The gathering runners (`src/skills/gathering.js`, `processing.js`) are driven
by the training-runner knob system and already have the
`scripts/test-training-runner.js` + `scripts/test-training-depletion.js`
coverage. Specific TEST-1001 style per-rock success formulas are
knob-replaced in Scape, per the Marstead design bible.

### Spec 11, 12, 13 — Processing, Combining, Activity skills
Covered by the existing `scripts/test-recipe-runner.js` and
`scripts/test-training-runner.js`. Specific success-rate formulas from the
upstream specs (e.g., smithing failure rate, runecrafting tablet chance) use
knob-driven formulas in Scape rather than per-action rolls, so the numeric
expected values do not map directly.

### Spec 17 — Banking
Bank features (tabs, placeholders, presets, withdraw-as-noted, PIN) are not
modelled in the player.js bank array (currently a flat `[]`). The engine
exposes BANK_SIZE = 816 (verified in `test-inventory.js`) but the richer UI
features are out of scope.

### Spec 18 — Shops
No shop runner is present in the engine; `src/data/shops.js` lists shop data
but there is no buy/sell runner exposed for tests.

### Spec 19 — Grand Exchange
Already covered by the comprehensive `scripts/test-ge.js` (14 test groups).
The upstream spec maps 1:1 and no additional assertions are needed.

### Spec 20, 21, 22 — NPCs, Monsters, Bosses
Engine exposes `src/content/aelgard/` content registries but there is no
standalone npc/monster spawn-and-die harness at the unit-test layer.
The weakness/resistance tests in `scripts/test-combat-formulas.js` cover the
Scape-specific Manifesto P04 additions to the monster model.

### Spec 23 — Quests
Covered by existing `scripts/test-quest-runner.js`.

### Spec 24 — Slayer
Slayer runner exists (`src/data/slayer.js`) but there is no standalone harness
exposed at this layer. Out of scope for this port wave.

### Spec 25 — Food & Potions
Food heal values and potion boosts are defined but the eat/drink commands
register only inside `src/commands/all.js` against a ctx — tested indirectly
via the bury-bones flow in `test-prayer-combat.js`. Dedicated coverage is
worthwhile in a future wave but requires wiring the full commands ctx.

### Spec 26 — Death Mechanics
Already covered by existing `scripts/test-death.js`.

### Spec 27, 28, 29 — Terrain, Buildings, Transportation
World-level. Covered indirectly by `test-engine-bridge-integration.js` and
`test-tilemap.js`. No standalone unit-test target.

### Spec 30, 31 — Player Interaction, Chat
Multiplayer / chat features. No simulated-players harness exists. Out of scope.

### Spec 32, 33, 34 — Minigames, Clue Scrolls, Random Events
No runners are currently wired at the unit-test level. Out of scope.

### Spec 35, 36, 42 — Music, Emotes, Animations
Audio/animation triggers are covered by `scripts/validate-audio-triggers.js`
and `scripts/validate-sprites.js`. No additional combat-loop coverage needed.

### Spec 37 — Pets
Pet drop system not present in the engine.

### Spec 38 — Construction
Construction skill is declared in `src/skills/construction.js` but there is no
standalone harness. Out of scope.

### Spec 39 — Achievements
Covered by existing `scripts/test-collection-diary.js` (achievement-like data).

### Spec 40 — Account Modes
Covered by existing `scripts/test-ironman.js` (exhaustive — 4 variants, group
mechanics, GE hook, persistence).

### Spec 41 — Wilderness/PvP
PvP damage calculation is half-modelled (meleeAttack takes a `defender` that
is either NPC or player). No wilderness runner or skull mechanics at the
unit-test layer. The skull counter (`p.skull`) exists on the player object
but no tick handler decrements it in isolation.

### Spec 43 — Collection Log
Covered by existing `scripts/test-collection-diary.js`.

---

## Gaps: inferno-rl/ Python training code

`/tmp/scape-repos/ScapeTests/inferno-rl/` contains four Python files:
- `env.py` — gym-compatible environment wrapper
- `env_fast.py` — cached/vectorised variant
- `train.py` — PPO training entrypoint
- `train_parallel.py` — parallel-worker driver

These are Python RL harnesses that drive ScapeAPI-AI via a network API. They
do not have node/JS equivalents and would require a separate Python port
plus an HTTP mocking strategy. Out of scope for the JS test-port wave.

---

## Decisions

1. **Markdown specs are test designs, not executable tests.** The upstream
   repo is a set of behavioural contracts that document expected OSRS
   behaviour; porting them means turning each TEST-XXXX into Node assertions
   against the engine's equivalent function. Where the engine exposes the
   function directly (combat math, XP table, tick constants), ported.
   Where the engine routes through a ctx (commands, area gates, training),
   ported where a fixture ctx is feasible. Where the engine lacks the
   feature (special attack energy, movement path stepping, per-tick prayer
   drain), logged here.

2. **Test helpers consolidation.** Existing tests each defined their own
   `assert()` / `eq()` / `group()`. The new `scripts/test-helpers.js`
   consolidates: `makeReporter()`, `makeRng(seed)`, `sandboxPersistence(tag)`,
   `makePlayer(name)`, `freshBreakpoint(p)`, plus OSRS reference tables. No
   existing test was migrated to use it (would increase blast radius); the
   helper is opt-in for new tests. Future waves can migrate existing tests
   one at a time.

3. **Stochastic tests are seeded.** Combat-sim assertions use
   `makeRng(seed)` via a Math.random override rather than running a long
   sample. 500-iteration attack loops under a fixed seed are deterministic
   and will not flake.

4. **Scape-specific assertions added beyond the upstream.** The
   weakness/resistance/tag system (Manifesto P04) is not in the upstream
   OSRS-focused specs. Covered in `test-combat-formulas.js` under its own
   section so future waves can see the Scape-specific expectations.
