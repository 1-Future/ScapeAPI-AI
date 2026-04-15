# Build-Your-Own-Scape Gap Audit (burn v2)

Audit of the current Scape implementation against every plugin doc in `/tmp/byos/docs/` (79 markdown files, ~31,800 lines of spec).

- Spec source: `C:/Users/username/AppData/Local/Temp/byos/docs/*.md`
- Codebase audited: `C:/Users/username/ScapeAI/.claude/worktrees/agent-a5591ee3/`
- Audit date: 2026-04-15
- Branch: `burn-v2/byos-audit`

Classification rubric:
- **COMPLETE** — every major subsystem in the doc is wired into the runtime tick loop (player, combat, engine, world) with persistence.
- **PARTIAL** — half or more of the doc's subsystems exist with working code; the rest are stubbed or missing.
- **STUB** — skeleton or data-only; no runtime integration; cannot currently be played by a live player.
- **MISSING** — no code matching the doc's core subsystems exists in `src/` at all.

## Summary

| Status | Count |
|---|---:|
| MISSING | 22 |
| STUB | 14 |
| PARTIAL | 29 |
| COMPLETE | 14 |
| **Total plugin docs** | **79** |

Aggregate: only ~18% (14/79) of the build-your-own-scape plugin spec is fully wired. About 37% is in-progress (PARTIAL). 45% is either stubbed data with no runtime glue or completely absent. The biggest structural gaps are the **meta/authoring docs** (philosophy-extractor, data-miner, game2tools) and the entire **DM authoring surface** (world-builder-tools, dm-dashboard, content-pipeline), plus several production-MMO concerns (multiplayer-scaling, security, monetization, localization).

---

# MISSING (22)

## accessibility.md
Specifies 6 accessibility pillars (visual, auditory, motor, cognitive, customization, TTS/screen-reader). Each player toggles features independently.
**Status: MISSING.** No colorblind/high-contrast/font-size/TTS/screen-reader/input-remap hooks exist anywhere in `src/`. The HTML in `public/*.html` is the only surface that could carry accessibility metadata and it contains none.
**Next step:** Create `src/engine/accessibility.js` that owns a per-player `player.accessibility = { colorblindMode, fontScale, highContrast, screenReaderHints, reducedMotion, inputRemaps, ttsDialogue }` schema and broadcasts a narration stream (line-per-event) via an existing WebSocket message type `{ type: 'narration', text }`. Wire `narrator.js` to emit narration events for TTS. Test: start a session, flip `colorblindMode`, receive a state message whose palette fields are rewritten; toggle `ttsDialogue`, assert every NPC chat line also arrives as a `narration` message.

## account-management.md
Specifies 42 account features across profile, security, privacy, save states, UI customization, session metrics, notifications.
**Status: MISSING.** `src/auth.js` is a thin session layer only. No settings storage, no 2FA, no session audit log, no APM/focus-mute/break reminders, no keybind profiles, no multi-panel save/load. `player.accountMode` exists but that is an Ironman detail, not the account-management surface.
**Next step:** Create `src/engine/account.js` with a `player.settings = { ui: {…}, privacy: {…}, notifications: {…}, security: {…} }` object and an `/api/account/settings` GET/PUT endpoint in `src/http-api.js`. Persist to `data/accounts/{playerId}.json`. Add one `writeAuditEntry(player, action, detail)` call alongside every destructive server.js command (ge offer, gear swap, drop item). Test: PUT settings, restart server, GET must round-trip; audit log must include the last 5 destructive commands after replay.

## architectural-styles.md
Visual style catalog the world builder uses to stamp zones with a coherent architectural vocabulary.
**Status: MISSING.** No styles table in `src/data/`, no style-tagging on region tiles, no builder tooling reads this. `public/builder.html` has no architectural-style tab.
**Next step:** Create `data/architectural-styles.json` with `{ id, name, wallTextures, roofType, palette, trim, fixtures[] }` records, and a `src/world/architectural-styles.js` lookup that the sprite-registry consults when rendering a tile whose region has `style: 'roman'`. Wire it into existing region metadata (`src/content/aelgard/world-layout.js`). Test: render a heartlands tile with `style: 'medieval'` and verify its wall sprite is resolved from `medieval.wallTextures[variant]`.

## architectural nature (nature-catalog.md)
Flora catalog for world builders: tree species, plant types, fungi, grass variants, ambient ecosystem.
**Status: MISSING.** No `data/nature-catalog.json`, no flora registry. `src/world/objects.js` only tracks objects as generic placed entities — no species, no biome, no seasonal variation.
**Next step:** Create `data/nature-catalog.json` keyed by biome (`heartlands`, `veilwood`, `glass_desert`…) with `{ flora: [{ id, name, sprite, biome, seasonal }], ambient: [...] }`. Create `src/world/nature-registry.js` that the tilemap loader consults when populating `landmarks` of type `"flora"`. Test: parse `data/tilemaps/veilwood.json`, for every flora landmark assert the species is biome-legal.

## structures-catalog.md
Reference library of every type of structure, architectural element, and decorative object.
**Status: MISSING.** No catalog. `src/world/objects.js` stores per-instance objects, not a catalog. Builder UI has no structure-picker.
**Next step:** Create `data/structures-catalog.json` with `{ id, name, category: 'building'|'decorative'|'fixture', style, footprint: {w,h}, sprite, description }` and a `src/world/structures.js` that `objects.js` consults to validate `type` fields on spawned objects. Test: call `objects.spawn('wooden_well', x, y)` and confirm footprint collision is enforced against walkability.

## content-pipeline.md
End-to-end content authoring workflow: ideation, review, approval, deployment, post-launch monitoring.
**Status: MISSING.** No pipeline code. Content today lives as JS files the engine `require()`s at boot. No staging, no approval, no metrics.
**Next step:** Create `src/tools/pipeline.js` exposing stages (`draft|review|approved|live|archived`) as file-level frontmatter in `src/content/aelgard/*.js`, and an `npm run pipeline:status` that enumerates every content file's stage. Test: mark one quest as `stage: 'draft'`, confirm it is excluded from `content-registry.js` load and returns a warning in `/api/content`.

## content-rating.md
Age-appropriate content filter. DM sets rating, items above that rating are hidden (not removed) per-session.
**Status: MISSING.** No rating fields on content, no filter. Ollama dialogue has no safety filter.
**Next step:** Add `rating: 'everyone'|'teen'|'mature'` to every quest/monster/item definition (default `'everyone'`), and a filter pass in `content-registry.js` that reads `world.rating` and suppresses higher-rated records from API responses. Wire `ai/dialogue.js` to refuse to generate beyond the world rating. Test: set `world.rating = 'everyone'`, boot, confirm no `mature`-tagged monster spawns.

## data-miner.md / data-miner (methodology doc)
Methodology doc: how to extract every piece of data needed for a complete system.
**Status: MISSING (and arguably N/A — it's a meta doc).** This is a prompt/methodology, not a plugin. There is nothing in `src/` for it because there is no intended runtime code. Treated as intentional MISSING.
**Next step:** If we want it actionable, create `src/tools/data-miner.js` that, given a target doc, reads the doc and produces a JSON schema checklist of fields it expects and diffs against current `data/` contents. Test: run against `skills-gathering.md`, confirm output flags the missing "divination" and "archaeology" tables.

## game2tools.md / game2tools-plus.md
Methodology docs for deriving editor tooling from a game mechanic.
**Status: MISSING.** Meta-level methodology — no intended runtime code. The builder.html partially reflects the philosophy but doesn't codify the pipeline.
**Next step:** Create `src/tools/game2tools.js` that takes a mechanic schema (e.g. `data/recipes.js` entry) and auto-generates a form-tab JSON into `data/builder-schemas/{tab}.json`, which `public/builder.html` then renders. Test: run against recipes, confirm the generated JSON drives a `public/builder.html` form that can write back to `data/recipes.js` via a POST to `/api/recipes`.

## philosophy-extractor.md
Meta doc: extract principles from a conversation or project.
**Status: MISSING.** Methodology doc, no runtime. Nothing in `src/` for it.
**Next step:** Build `src/tools/philosophy-extractor.js` that consumes a transcript + outputs principle JSON (id, title, quote, source). Feed it the Marstead transcript already referenced in project notes; write results to `data/principles.json`. Test: re-extract and confirm `principles.json` contains all 10 pillars / 8 knobs named in user memory `feedback_marstead_transcript.md`.

## localization.md
Multi-language support, locale files, RTL, date/number formatting, cultural adaptation.
**Status: MISSING.** No i18n framework, no locale files, no language tagging in chat/dialogue/items. All strings hardcoded English.
**Next step:** Introduce `data/locales/en.json` and `src/engine/i18n.js` with a `t(key, params)` helper; wire it into the handful of player-facing strings first (combat hitsplat messages, `commands/all.js` rejections). Test: switch `player.locale='es'`, boot with a stub `es.json`, confirm combat miss message returns the Spanish string. The full translation of all content items can be incremental.

## modes.md
Player-chosen game modes (leagues, hardcore, chunk-locked, randomizer, seasonal).
**Status: MISSING as a plugin**, though Ironman and Area-Locked exist. No unified `mode` abstraction. `src/engine/ironman.js` and `src/engine/area-locked.js` are parallel implementations with no shared registry.
**Next step:** Create `src/engine/modes.js` that exposes `defineMode({ id, name, restrictions, xpMult, seasonalRelics, respawnRules })` and refactor Ironman and Area-Locked to register through it. Wire `public/builder.html` mode tab to hit `/api/modes`. Test: create a `league_test` mode with `{ xpMult: 5 }`, attach to a player, confirm xp-modifier chain in `breakpoint-runner.addXpModifier` sees 5x.

## monetization.md
Premium store, cosmetics, battle pass, donations, safeguards against pay-to-win.
**Status: MISSING.** No shop-of-premium, no currencies beyond gp, no entitlements table. Per the Scape manifesto this is deliberately out of scope for v1; still, the toggles described in the doc have no code.
**Next step:** Add `src/engine/monetization.js` with a `monetization.enabled=false` default toggle and a pass-through `noop()` implementation. Even as a no-op, the module must validate at boot that no plugin calls `monetization.charge()` without the toggle on. Test: assert `monetization.charge()` throws unless enabled, confirming the safeguard is active.

## multiplayer-scaling.md
How the server architecture scales from 10 to 10,000+ players (sharding, load balancing, database partitioning).
**Status: MISSING.** Current `src/server.js` is a single-process Node WebSocket server. No sharding, no horizontal scale, no redis/queue/pub-sub. `data/` is flat JSON.
**Next step:** Draft an `src/engine/scale.js` stub that reads `config/scaling.json` (`{ mode: 'single'|'sharded', redisUrl?, shardCount? }`) and exposes `forwardTo(playerId, message)`. In `mode:'single'` it is a no-op. Test: booting with `mode:'sharded'` without a redis URL must fail fast with a clear error.

## music-audio.md
Track unlocking, playlists, jukebox, per-zone soundtracks, volume categories, custom upload.
**Status: MISSING at runtime.** `data/audio-manifest.json` enumerates cues and zones. `src/engine/audio-triggers.js` is a dispatcher (pre-audio-engine) that forwards `{type:'audio'}` messages but has no track-unlock, playlist, jukebox, or volume-per-category state. `player.unlockedTracks=[]` is declared in `player.js` but never written to.
**Next step:** Extend `audio-triggers.js` with `unlockTrack(player, id)` called on `region_enter_*` and `quest_complete_*` events, persist to `player.unlockedTracks`, surface a `/api/music` GET for the player's track list, and expose a jukebox object in `src/world/objects.js` that sends a `play_track` message on interaction. Test: enter veilwood region, assert `veilwood_theme` appears in `player.unlockedTracks`; interact with a `jukebox` object, assert client receives `{type:'audio', id:'veilwood_theme', layer:'music'}`.

## narrative-design.md
Story-structure tools (quest pacing templates, character arc tracker, environmental storytelling lints).
**Status: MISSING at the tooling level.** The quest content is rich (`data/quest-narratives.json` + `src/content/aelgard/quests-*.js`, ~69 quests, ~2800 lines) but there is no authoring tooling to enforce the narrative principles in the doc.
**Next step:** Create `src/tools/narrative-lint.js` that scans `src/content/aelgard/quests-*.js` and flags quests that violate Marstead principles (no "kill 10 rats" without twist, requires dialogue_beats, requires a payoff). Test: run against `quests-blitz.js`, confirm any violations are listed; fix or waive each.

## nature-catalog.md
(Duplicated above under architectural nature.) MISSING.

## pet-companion.md
Pet acquisition, naming, cosmetic transmog, raising, abilities, storage, insurance.
**Status: MISSING.** `src/content/aelgard/pets-collection.js` defines pets as data, but `player.js` has no pet field, `src/world/entities.js` has no companion entity kind, no following-behavior, no naming UI, no storage. Only `bossKills` exists (which is a prerequisite to the drop, not the pet itself).
**Next step:** Add `player.pets = [{ id, customName, shown, level, xp, abilities: [] }]` and a `src/engine/pets.js` that wires an idle follower NPC to the player when `player.pets.find(p=>p.shown)` is set. Register boss-drop → pet-unlock in `src/engine/death.js`'s drop resolution so Forgefather Duran drops `baby_duran` with rarity 5000. Test: kill Duran 5000 times in a simulator script; the 5000th kill places `baby_duran` in `player.pets` with `shown:false`; `/pet show baby_duran` spawns a follower entity.

## player-housing.md
Room layout, furniture, portals, trophies, storage, visitor permissions, house parties.
**Status: MISSING at runtime.** `player.house = []` and `player.houseLocation` are declared in `player.js` but no code spawns house instances, no room types exist, no furniture placement, no portal teleport. `src/skills/construction.js` exists (134 LOC) but its body relates only to XP/bars.
**Next step:** Build `src/engine/housing.js` that spawns a per-player instance (reuse `src/engine/instances.js`) on `/enter-house`, loads a grid-based room layout from `player.house`, and delegates furniture placement to `construction.js` recipes. Data: `data/house-rooms.json` with room types + hotspot shapes. Test: `/enter-house` from heartlands, place a `wooden_throne` at hotspot 0 of the first room, exit and re-enter, assert the throne persists.

## project-philosophy.md
Meta doc of design philosophy for build-your-own-scape.
**Status: MISSING.** Methodology, no runtime counterpart.
**Next step:** If we want this codified, ship `PHILOSOPHY.md` at repo root with the 10 pillars and reference it from `content-registry.js` banners. No test.

## puzzles.md
Puzzle system: standalone or quest-embedded, timers, hints, randomization, leaderboards.
**Status: MISSING as a plugin.** Individual quest steps may be puzzle-like, but there is no puzzle definition, no hint system, no randomizer, no leaderboard. `data/quests.js` has no `puzzle` substep type.
**Next step:** Add `src/engine/puzzle-runner.js` with `definePuzzle({ id, kind:'slider'|'light'|'sequence'|'cipher', solution, hints: [] })` and a matching `data/puzzles.json`. Quest steps gain `kind:'puzzle'` dispatch. Test: attach `slider_puzzle_1` to `quests-blitz:bridge_of_echoes` step 3; simulate player submitting the wrong answer twice; assert hint 1 fires.

## tutorial-onboarding.md
New-player experience from account creation to "I know how to play."
**Status: MISSING.** `player.tutorialStep = 0` / `player.tutorialComplete` are declared in `player.js` but no code advances them. No tutorial prompts fire on login.
**Next step:** Create `src/engine/tutorial.js` with a step-state-machine: `ACCOUNT_CREATED → FIRST_COMBAT → FIRST_GATHER → FIRST_BANK → FIRST_QUEST → DONE`. Each step emits a tutorial message via `sendChat` when the player reaches it and auto-advances on the triggering event (captured via `events.js`). Test: create a fresh player, kill one goblin, assert tutorialStep advances from `FIRST_COMBAT` to `FIRST_GATHER`.

## world-builder-tools.md
The full editor suite for DMs (terrain paint, wall build, NPC placement, quest editing, etc.).
**Status: MISSING at the engine level.** `public/builder.html` exists but is a thin visual builder against a minimal `/api/content` — it cannot actually save terrain edits, wall placements, NPC spawns, or quest trees back into `src/content/` or `data/`. No editor endpoints.
**Next step:** Define `src/http-api.js` POST endpoints: `/api/world/paint`, `/api/world/wall`, `/api/npc/spawn`, `/api/quest/upsert`, each persisting to `data/tilemaps/*.json` / `data/npcs.json` / `data/quests.json`. Wire `public/builder.html` to call them. Test: paint one tile via `/api/world/paint`, restart server, confirm the tile type is preserved in the loaded tilemap.

---

# STUB (14)

## animation-system.md
8-way character animations, tick-synced durations, particle and environmental anims.
**Status: STUB.** `data/animation-manifest.json` fully enumerates every animation Scape needs (humanoid idle, walk, run, attack variants, spell cast, death) with frame counts, durations, directions — but no engine code plays animations. No `playAnim(entity, id)`, no frame tick, no client-side animation state in `state` broadcasts.
**Next step:** Create `src/engine/animation-runner.js` that holds per-entity animation state (`currentAnim`, `frameStartTick`, `loop`) and attaches it to `player.state` / `npc.state` so the broadcast already includes `anim:{id,frame}`. On attack, movement, death events, call `setAnim(entity, 'attack_slash')`. Test: fire an attack on a goblin, assert the state broadcast includes `anim:{id:'attack_slash',frame:0}` for that npc that tick; two ticks later assert `frame:2`.

## asset-system.md
Full visual and data pipeline — models, textures, animations, sprites, particles, audio.
**Status: STUB.** `public/sprite-manifest.json` + `public/sprite-palettes.json` + `src/world/sprite-registry.js` (362 LOC) handle sprite lookup and palette resolution well for entities. But no model pipeline, no particle system, no asset watching/hot-reload, and the client rendering is text/HUD only.
**Next step:** Extend sprite-registry to own the full asset graph (sprite → palette → animation → audio) and validate at boot via `validateAllEntities()`. Stand up a `src/tools/asset-graph.js` CLI that dumps missing assets. Test: delete `moryskah` palette from `public/sprite-palettes.json`, boot — boot must fail with a clear "missing palette" error referencing every sprite that needs it.

## camera-system.md
How the player sees the world (orbital, free-roam, cinematic, follow).
**Status: STUB.** `public/play.html` / `public/spectate.html` have camera viewport wiring but no server-authoritative camera mode. No `player.cameraMode`.
**Next step:** Define `player.cameraMode = 'follow'|'free'|'orbital'|'cinematic'` and broadcast it in the state message so the client can honour cinematic sequences triggered by events (boss intro, quest cutscene). Test: trigger a cinematic event for a boss fight; assert the subsequent state message carries `cameraMode:'cinematic'`; end of cinematic, reverts to `'follow'`.

## character-creation.md
Sims-4-style unified creator: body type, hair, skin, clothing, creates players and NPCs.
**Status: STUB.** Nothing in `src/` touches avatar parts. `player.js` has no body/hair/skin/clothing slots. `content-registry.js` registers a `char-creator` tab, but only as a builder stub.
**Next step:** Add `player.appearance = { bodyType, hair, skin, torso, legs, feet, hairColor, skinColor }` and a `/api/character` PATCH endpoint; persist as JSON; broadcast inside the state payload so clients can render. Test: PATCH hair to `'beard_short'`, reconnect, state message includes new appearance.

## character-overview.md
Player central dashboard: stats, logs, trackers, analytics, shareable profiles.
**Status: STUB.** `player.js` stores the raw data (skills, killCounts, lootTracker, deathCount, achievementProgress) but no `/api/character/overview` aggregation endpoint, no shareable profile URL, no XP/hr tracker.
**Next step:** Add `src/http-api.js GET /api/character/:name/overview` returning `{ skills, totalLevel, combatLevel, killCounts, recentLoot, deathCount, achievementComplete, diaryComplete }`. Add a cached `xpPerHour` window to `player.js` (rolling 10-minute). Test: hit /overview for a test player, confirm all fields populate and xpPerHour is within expected bounds for a sim.

## dm-dashboard.md
Admin control panel — the tool the DM uses to DO the configuring.
**Status: STUB.** `public/dashboard.html` exists with live-session panels, but the underlying endpoints (`/api/world`, `/api/players`, `/api/spawn`, `/api/kill`, `/api/give`) are sparse or not implemented. Admins cannot actually edit content from the dashboard.
**Next step:** Add authenticated admin endpoints in `src/http-api.js` (gated on `player.admin`): `/admin/spawn`, `/admin/kill`, `/admin/teleport`, `/admin/give`. Add a broadcast panel that pushes a chat message to all players. Test: as admin, POST `/admin/spawn { npc:'goblin', x:100, y:100 }`, confirm npc appears and is visible in spectate.

## emote-system.md
Player expressions, gestures, animations triggered on demand; used in clues, social, clan events.
**Status: STUB.** `emotes` is one builder tab in `content-registry.js` but there is no emote registry, no `/emote` command, no broadcasting of emote state.
**Next step:** Add `data/emotes.json` with `{ id, name, animation, requirement? }`, register in `content-registry.js`, add a `/emote <name>` command in `src/commands/all.js` that broadcasts an emote event to nearby players and plays the animation (via animation-runner). Test: `/emote wave`, assert broadcast reaches nearby players with `emote:'wave'` and animation-runner sets the player's anim to `'emote_wave'`.

## friends-social.md
Friends list, groups, activity feed, lending, LFG, spectating.
**Status: STUB.** `player.friends = []` is declared. No `/addfriend`, `/removefriend`, `/whois` commands (grep only found clan chat). No persistence of friend relationships across sessions.
**Next step:** Add `src/engine/friends.js` with `addFriend`, `removeFriend`, `listFriends(player)` that reads/writes `player.friends` and calls `persistence.save('friends_' + playerId + '.json', …)`. Wire commands in `commands/all.js`. Broadcast an activity-feed event on friend login. Test: two test players add each other, player A logs out and back in, `/friends` shows player B with `online:true` if B is still connected.

## minimap-worldmap.md
Minimap HUD + full-screen world map overlay.
**Status: STUB.** No server-side minimap data. `data/tilemaps/*.json` has everything needed to render a minimap but no `/api/minimap?x=&y=&r=` endpoint.
**Next step:** Add `GET /api/minimap?x=&y=&r=16` in `src/http-api.js` returning tile types and landmarks within radius r. Wire `public/play.html` mini-canvas to poll. Test: call endpoint at (100,100,16), assert response includes the Heartlands bell tower landmark.

## minigames.md
Minigame template system: 16 game mode templates (FFA, survival, capture, rhythm…).
**Status: STUB.** `src/engine/instances.js` supports wave-based instances (used by Inferno). No `src/engine/minigames.js` registry, no minigame matchmaking, no points/rewards table, no arena definitions beyond the inferno.
**Next step:** Create `src/engine/minigames.js` with `defineMinigame({ id, mode, arena, rules, rewards })` and a lobby/matchmaker (can be a single-queue first pass). Implement one example end-to-end: `fight_pits`. Test: two players `/join fight_pits`, both teleport to an arena instance, fight, winner receives `fight_pit_tokens`.

## random-events.md
Periodic surprise encounters (anti-AFK, anti-bot + mini-content + world flavor).
**Status: STUB.** `player.nextRandomEvent = 0` and `player.pendingEvent = null` are declared. `src/content/aelgard/random-events-daily.js` is content only (322 LOC of definitions). No engine hook actually fires these onto players.
**Next step:** Add `src/engine/random-events.js` registered as a `tick.registerPhase('midTick', 'random-events', fn)` handler that, for each player, checks `player.nextRandomEvent <= currentTick` and, if met, rolls a random event from `random-events-daily.js` and assigns to `pendingEvent`. Handle completion in `commands/all.js`. Test: fast-forward a player's next-event tick to 0, run one tick, assert pendingEvent is set; `/answer <correct>` clears it and grants reward.

## rules-moderation.md
Rule enforcement, strikes, appeals, reports, mod tools, quarantine.
**Status: STUB.** `player.admin` exists as a single boolean. No rule definitions, no strike counter, no mute/kick/ban, no report system, no appeals, no mod audit trail.
**Next step:** Add `data/rules.json`, `src/engine/moderation.js` with `report(reporter, offender, reason)` / `applyStrike(offender, level)` / `muteForTicks(offender, ticks)`. Persist strikes to player record. Add admin command `/mod review`. Test: `/report someplayer spam`, as admin `/mod review` shows the report; `/mod mute someplayer 100`, assert the muted player's chat messages are dropped for 100 ticks.

## security.md
Technical security: exploit prevention, rate limiting, XSS, injection, anti-cheat.
**Status: STUB.** `src/auth.js` handles basic session auth. No rate limiting, no input validation framework, no anti-cheat on commands. Commands parse raw string input in `commands/all.js` without bounds checks.
**Next step:** Add `src/engine/rate-limit.js` (per-player command token bucket: 10 cmd/tick) and wire it to the top of the command dispatcher. Add an input-validator pass that clips string lengths and rejects non-printable characters. Test: send 100 commands in one tick, assert only 10 execute and the rest return "rate limited"; send a 10KB chat message, assert it is truncated.

## server-stats-voting.md
Server dashboard, hiscores, polls, bug reports, diagnostics, leaderboards.
**Status: STUB.** Hiscores exist conceptually (`player.js` has all the data) but no `/hiscores` endpoint, no polls, no voting, no bug-report submission form. `public/dashboard.html` is admin-only.
**Next step:** Add `src/http-api.js GET /api/hiscores?skill=…&limit=100` reading from persisted player files, sorted by xp. Add `POST /api/poll/vote` with a moving ballot JSON. Test: sim three players to level 50 woodcutting, hit `/api/hiscores?skill=woodcutting&limit=10`, confirm ordered correctly.

---

# PARTIAL (29)

## achievements.md
Tracks player milestones across every aspect of the game. Points, tiers, feats, completionist, speedrun.
**Status: PARTIAL.** `player.achievementProgress` / `player.achievementsComplete` exist, `src/content/aelgard/combat-achievements.js` + `achievement-diaries.js` (and `content/aelgard/combat-challenges.js`) define achievement content. Diaries have their own tiered runner (`src/engine/diary.js`) that IS complete. But general achievements do not have a central runner that listens to events and flips the progress bits. No point tier totals, no feat cape, no speedrun splitter.
**Next step:** Generalize `src/engine/diary.js` into `src/engine/achievement-runner.js` that owns a registry of `{ id, trigger:{type, threshold}, reward }` and subscribes to `events.js` for all triggers (kill, gather, craft, level). Currently-hardcoded progress in player.js (`first_blood`, `lumberjack`) would move under this runner. Test: register a `first_chop` achievement tied to `woodcutting_action`; run one chop action; assert `player.achievementsComplete.first_chop === true`.

## bosses-raids.md
World bosses, instanced encounters, multi-phase, raid dungeons, difficulty scaling, loot distribution, shared behaviour library.
**Status: PARTIAL.** Inferno (`src/content/inferno/`) is a complete wave-based instance. Crystal Wyrm (`src/content/crystal_wyrm/`) is another. `src/content/aelgard/raids*.js` (~1500 LOC) and `bosses-expanded.js` define content. `src/engine/instances.js` + `src/world/npcs.js onTick/onAttack/onDeath/onDamageTaken` hooks form a real shared library. What's missing: multi-player raid grouping, loot sharing, ready-check, healer-role tracking, KPH/efficiency analytics.
**Next step:** Add `src/engine/raid-party.js` that lets 2-5 players opt into one instance (reuse `instances.js`) with shared loot distribution (personal + unique table). Add a ready-check chat pulse before `startNextWave()`. Test: two players `/raid cox`, both spawn in a CoX instance, both on death lose their items, completion drops unique loot via per-player rolls.

## bot-detection.md
Random events, CAPTCHA, honeypots, ML, bot API.
**Status: PARTIAL.** `random-events-daily.js` defines anti-bot random events (STUBBED runtime per random-events.md above). `player.js` has no CAPTCHA or behavioural fingerprint. No honeypot tiles.
**Next step:** Add `src/engine/bot-detection.js` that (1) records per-player action timings, (2) flags suspicious regularity, (3) triggers a random-event-as-captcha when a threshold is hit. Wire to the random-events runner. Test: script a bot that chops at exact 4-tick intervals for 500 ticks; after threshold, `pendingEvent` is set to a captcha event.

## buildings.md
Walls, rooms, doors, windows, lighting, interior design.
**Status: PARTIAL.** `src/world/walls.js` (wall + door edge bitmask, 90 LOC) is rock-solid COMPLETE for walls & doors. But rooms (as bounded named spaces), windows, interior lighting, roof overlays are missing. Settlement-design.md references these, and `public/builder.html` has a walls tool but no room composer.
**Next step:** Add `src/world/rooms.js` that scans wall edges to detect closed polygons and tags them as rooms (`room.id`, `room.type:'kitchen'|'bedroom'|'hall'|...`), stored in `data/rooms.json`. Add windows as a new edge bitmask bit. Test: create a 4x4 walled enclosure, assert `rooms.detect()` returns one room of area 16; add a window on one edge, confirm it's listed on the room.

## clan-system.md
Ranks, citadel, wars, events, territory, analytics.
**Status: PARTIAL.** Clan chat works in `src/server.js` (grep 48 matches). `player.clan` field exists. But no rank system, no clan citadel, no war/events/territory, no analytics.
**Next step:** Add `src/engine/clans.js` owning `data/clans.json` with `{ id, name, owner, members: [{name, rank}], perks }`. Add `/clan invite|kick|promote|demote`. Test: two players form clan, owner promotes member to `admin`, second player attempts `/clan kick`, assert denied until promoted.

## collection-log.md
KC display, duplicates, milestones, luck calculator.
**Status: PARTIAL → near-COMPLETE.** `src/engine/collection-log.js` (219 LOC) is wired, has source + item registration, reward issuance, event integration. `data/collection-log.json` is populated for bosses. Missing: dry-streak/luck calculator, duplicates tracking (the log is set-only), per-source completion cosmetic handoff is minimal.
**Next step:** Extend collection-log.js with `registerDuplicate(player, sourceId, itemId)` that increments a counter, plus a `getLuckProfile(player)` that returns `{ expected, actual, percentile }` across all owned sources. Test: drop the same item three times for the same source, assert duplicate count = 3 but unique entry = 1; call getLuckProfile, verify percentile.

## combat-system.md
Full fight loop: target acquisition, range check, accuracy, damage, hit, XP, death, loot.
**Status: PARTIAL → near-COMPLETE.** `src/combat/combat.js` (484 LOC) implements OSRS-accurate effective level, prayer boosts, max-hit, accuracy. `src/combat/projectiles.js` handles ranged/magic. `src/world/los.js` handles line of sight. Missing: hybrid weapons scaling properly, special attacks on a per-weapon basis beyond a generic spec bar, bolt enchantments fully wired.
**Next step:** Add a central `src/combat/special-attacks.js` registry keyed by weapon id with `{ drainSpec, attackMultiplier, accuracyMultiplier, onHit(entity, damage) }` callbacks. Wire `player.specialEnergy` drain into it. Test: equip `dragon_dagger`, trigger spec, assert two attacks resolve on the same tick with 115%/15% bonus pattern and spec energy drained by 25%.

## communication.md
Chat channels, voice, emojis, bots, threading, bridges.
**Status: PARTIAL.** Public chat + clan chat work (server.js grep 32 and 48 matches). Ignore list, private chat, threading, emoji, moderation bridges — missing or minimal. No voice.
**Next step:** Add `src/engine/chat.js` that owns all chat channel routing (`public`, `clan`, `trade`, `help`, `pm`, `system`) with per-channel mute, filter, and audit. Retrofit `server.js` chat handlers to call it. Test: `/pm playerName hello`, assert only that player receives the message; `/mute playerName public`, assert their public messages drop for the muter.

## crafting-system.md
Unified recipe engine shared by combining and processing skills.
**Status: PARTIAL.** `src/engine/recipe-runner.js` (194 LOC) + `src/data/recipes.js` + `src/data/relationships.js defineCombination` are solid. All skill-specific skills (`src/skills/*.js`) use it. Missing: failure-chance display, partial completion on multi-step recipes, batch crafting, station sharing with other players.
**Next step:** Add `recipe-runner.craftBatch(p, recipeId, count)` that loops `craft()` and terminates on first failure, returns aggregate result. Add `recipe-runner.peek(p, recipeId)` returning current success rate. Test: `craftBatch(p, 'bronze_bar', 10)` produces 10 bars with 10 xp awards and halts on `invFull`.

## dailies.md
Recurring activities on a timer: daily, weekly, monthly, custom.
**Status: PARTIAL.** `player.dailyChallenge` exists. `src/content/aelgard/random-events-daily.js` defines daily challenge content. But there is no central `src/engine/dailies.js` runner, no reset scheduler, no streak counter, no D&D (Distractions & Diversions) timers, no login streak.
**Next step:** Add `src/engine/dailies.js` with `assignDaily(p)`, `resetDailies()` (cron at 00:00 UTC game time), `tickStreak(p)`. Seeded per-day RNG so daily challenges are fair. Test: advance the in-game clock by 24 hours, assert all players get a new `dailyChallenge`, streak counter advances if yesterday was completed else resets.

## data-persistence.md
Save, load, backup, migrate.
**Status: PARTIAL.** `src/engine/persistence.js` (50 LOC) is a simple JSON-file key/value store. Players saved to individual files. `src/db/` has a SQL schema + ingest scripts, implying a planned migration. No versioned migrations, no backup, no corruption recovery.
**Next step:** Add `src/engine/migrations.js` with a `version` number on each saved file, plus `migrate(v_from, v_to, data)` handlers. On load, if `data.version < current`, run the chain. Test: seed a v1 save, bump schema to v2 with a renamed field, load — assert field is renamed and version = 2.

## death-system.md
Item loss, gravestones, death office, PvP loot, hardcore.
**Status: PARTIAL → near-COMPLETE.** `src/engine/death.js` (563 LOC) is a thorough implementation of grave placement, KEEP_ON_DEATH=3 (4 with Protect Item), grave TTL, Hardcore downgrade. Missing: PvP gravestone rules, death office (where players redeem grave before expiry) as a specific location, gravestone cosmetic tiers.
**Next step:** Add a `data/graveyards.json` list of death-office locations; add `/reclaim` command that teleports to the nearest graveyard if the grave hasn't expired. Add 3 gravestone tier cosmetics unlocked via achievements. Test: die at (100,100), run to `heartlands_graveyard`, `/reclaim` returns items minus the 3 kept.

## dialogue.md
NPC conversation modes, dialogue trees, branching, AI freeform, relationship tracking, UI.
**Status: PARTIAL.** `src/ai/dialogue.js` (571 LOC) + `data/npc-bibles.json` (~500 NPC personalities fed to Ollama) + `src/engine/dialogue-commands.js` wire AI freeform dialogue. Scripted-tree mode is not implemented (no `{ node, options[] }` dialogue trees outside the AI freeform channel). NPC memory across sessions is not persisted.
**Next step:** Add `src/engine/dialogue-tree.js` with `defineTree(npcId, {root, nodes})` and a `commands/all.js /talk <npc>` that walks the tree option-by-option. When a node has `ai:true`, hand off to `ai/dialogue.js`. Persist `player.npcMemory[npcId] = [line, line, ...]`. Test: scripted tree for `captain_alden` with 3 options; walking option 2 triggers a quest start; re-engage the NPC, assert he greets with memory of prior conversation.

## economy.md
Currency, trading, shops, GE, alchemy, price tools, wealth monitoring, anti-fraud.
**Status: PARTIAL.** `src/engine/ge-runner.js` (696 LOC) is a full Grand Exchange with order books, FIFO matching, persistence; `src/engine/ge-commands.js` wires the commands. `src/data/shops.js` + `shops-expanded.js` populate NPC shops. Alchemy exists via magic spells. Missing: wealth analytics, price graph, fraud detection, anti-manipulation limits, player-to-player direct trade (beyond GE).
**Next step:** Add `src/engine/wealth.js` publishing a daily `economy-report.json` with top items by volume, price change, wealth concentration by player. Add direct-trade command `/trade <player>` with a two-sided confirmation UI. Test: place 10 GE buys + 10 sells across 5 items, run `wealth.report()`, confirm volume & price-change fields populate.

## engine-architecture.md
WebSocket protocol, dual render, A* pathfinding, 600ms tick, seeded RNG, plugin dual-side pattern, panel customization.
**Status: PARTIAL → near-COMPLETE (server-side).** Tick 600ms (`src/engine/tick.js`), A* pathfinding (`src/world/pathfinding.js`), WebSocket (`src/server.js`), walls bitmask, layers, plugin loader (`src/engine/plugins.js`), seeded RNG (in places). Missing: dual render mode (no 3D), client panel customization (not server's concern but doc mentions it), proximity chunk streaming (server broadcasts entire state currently), MCP-style game console API.
**Next step:** Add `src/engine/proximity.js` that filters state broadcasts by distance and maintains a `player.sentChunks` set. Test: spawn 100 npcs over a 10-chunk radius, assert that for a player in chunk (0,0), only npcs within 4 chunks appear in the state message.

## external-integrations.md
Webhooks, HTTP API, data export, chat bridges, streaming, IoT.
**Status: PARTIAL.** `src/http-api.js` exposes a small REST surface. No webhook outbound, no CSV/JSON export, no chat bridges, no Discord/Twitch integration. No IoT.
**Next step:** Add `src/engine/webhooks.js` listening to breakpoint-runner events and POSTing to per-player Discord webhook URLs configured in `player.settings.notifications.discord_url`. Test: configure a URL to `https://httpbin.org/post`, level a skill, assert the webhook fires with a JSON body.

## games-of-chance.md
RSPS classics, casino, modern gambling, community social formats.
**Status: PARTIAL.** `player.duelWins/duelLosses/duelChallenge/inDuel` exist. `commands/all.js` has duel pieces (grep found "duel"/"stake" across 19 files). No flower poker, dice, blackjack, plinko. No anti-fraud gating.
**Next step:** Add `src/engine/gambling.js` behind a world toggle `world.gambling.enabled=false`. Implement 3 games (duel/stake, dice, flower poker) as first-class minigames. Test: two players `/duel stake 1000`, both accept, arena instance, winner receives 1900 gp (5% house edge).

## inventory-bank.md
Inventory slots, weight, stacks, presets, tabs, search, tagging, bank.
**Status: PARTIAL.** 28-slot inventory + 816-slot bank exist in `player.js`. Weight is computed (`src/game-loop.js calcWeight`). `invAdd`/`invRemove` use item IDs and stackability. Missing: bank tabs, bank search, equipment presets/quick-swap, item tagging, placeholder items, inventory quick-loads.
**Next step:** Add `player.bankTabs = [[...ids], [...ids], ...]` default 8 tabs; add `/bank-preset save <n>` and `/bank-preset load <n>`; add `/search <text>` returning matching inventory+bank items. Persist to player save. Test: save a preset with 5 sharks + 3 potions, use them up, load preset, bank withdraws to restore exact slot pattern.

## items.md
All in-game items, properties, consumption, materials, containers, teleports, currencies, invention.
**Status: PARTIAL.** `src/data/items.js` (405 LOC) + `items-expanded.js` + `items-blitz*.js` + `items-dragon-barrows.js` define hundreds of items with `{id, name, stats, value, weight}`. `src/atoms/consume.js` + `src/atoms/dose-system.js` handle potion/food. Missing: noting (banknote form), containers (rune pouch, gem bag), invention/augmentation, teleportation-charge items, multiple currencies.
**Next step:** Add `item.noteable:true` and a `/note` command swapping item <-> note form via a banker npc. Add `src/engine/containers.js` for rune-pouch-like holders. Test: note 100 sharks at bank, confirm noted-shark is a new item id with stackable:true, count:100, 1 slot.

## locations.md
Areas, environmental effects, access gates, combat rules, resources, DM overrides.
**Status: PARTIAL.** `src/content/aelgard/world-layout.js` + 8 regional density/deep files define ~180 locations. `src/engine/area-locked.js` + `area-gate-runner.js` enforce access. Missing: weather system, day/night cycle, per-location combat rules, hazard tiles (lava, poison ground).
**Next step:** Add `data/weather.json` per region `{ rotation: [{type, duration, effects:{runDrain, visibility}}] }` and a tick handler that rotates. Add hazard tiles as a new `tile.hazard: 'lava'|'poison'|'fire'` flag wired into `game-loop.js` movement. Test: step on a lava tile, assert 3 damage per tick; weather flips to `rain`, assert run-energy drain +50%.

## lore-bible.md
World history, mythology, factions, religions, races, languages.
**Status: PARTIAL.** `data/lore.json` contains extensive per-region lore (history, factions, landmarks, music_mood, geography). `data/npc-bibles.json` has 500+ NPC personalities feeding Ollama. No runtime `/lore` command to the player, no dynamic lore unlocking beyond what the codex does.
**Next step:** Add `src/engine/lore-runner.js` with `unlockLore(player, loreId)` fired on region enter / quest complete, plus `/lore <id>` to read. Test: enter moryskah, assert `lore_moryskah_overview` unlocks; `/lore moryskah_overview` returns the history text.

## monsters.md
NPCs that can be fought: stats, aggression, immunities, slayer, drop tables, shared loot pools.
**Status: PARTIAL → near-COMPLETE.** `src/world/npcs.js` (391 LOC) fully supports combat stats, aggro, multi-tile, custom AI, drops, LoS. `src/content/aelgard/monsters-*.js` populates ~300 monsters. `src/data/slayer.js` + `src/content/aelgard/slayer-*.js` handle slayer. `src/data/droptables.js` handles drops. Missing: reverse drop table lookup, bestiary completion, superior monster spawns, per-monster session dashboard.
**Next step:** Add `src/engine/bestiary.js` with `markSeen(player, npcDefId)` called on `onDeath` and `/bestiary` command returning %-complete. Add a `superior_chance` roll inside `npcs.spawnNpc` when slayer monster and assignment active. Test: kill a gargoyle 100 times with slayer active; assert at least one superior variant spawned.

## npcs.md
Non-combat entities: shopkeepers, bankers, quest givers, transport operators.
**Status: PARTIAL.** `src/atoms/definitions/npc-services.js` + `npcs-dialogue.js` register service npcs. `src/server.js` routes interactions to `bank`, `shop`, `dialogue`. Missing: NPC schedules (different behaviors by time of day), ambient townsfolk with routines, faction-aware dialogue gating.
**Next step:** Add `npc.schedule: [{fromHour, toHour, location, action:'sleep'|'work'|'patrol'}]` and `src/engine/npc-schedule.js` that moves npcs at the right ticks. Test: define a baker that bakes 6am-6pm and sleeps 10pm-6am; at in-game hour 3, `baker.location` should be the bakery; at hour 23, the baker's house.

## player-progression.md
XP curves, milestones, endgame, long-term engagement.
**Status: PARTIAL.** `src/player/player.js` has OSRS XP table (126 levels including virtual). `src/engine/breakpoint-runner.js` fires events on level-up + quest completion. `src/data/relationships.js defineBreakpoint` is populated. Missing: explicit endgame systems (prestige, virtual-level cosmetics, master skill capes), XP analytics.
**Next step:** Add `src/engine/prestige.js` that exposes `/prestige <skill>` at level 99 resetting XP to 0 and recording `player.prestige[skill]` count. Grant prestige-only cosmetic cape. Test: reach level 99, `/prestige woodcutting`, assert xp=0 level=1 and prestige=1; cosmetic entry appears.

## quests.md
Quest definitions, requirements, steps, rewards, zone instancing, DM authoring.
**Status: PARTIAL.** `src/data/quests.js` + `quests-*.js` content (~69 quests, 2873 LOC) + `src/engine/quest-runner.js` (185 LOC) form a real working quest system. Requirements checking + step advancement + reward issuance all work. Missing: zone-instanced quest phases, quest-helper overlay (hint text per step), optimal-order routing planner, tts fallback (referenced in plugin-audit).
**Next step:** Add `src/engine/quest-helper.js` that returns `{ step, hint, objective, nextTile? }` for the player's current quest, and a `/hint` command that returns the hint. Test: start `the_runaway_golem`, `/hint` returns "follow the trail southwest from Nan Borrow's smallholding".

## settlement-design.md
Towns, cities, settlements with layout, zoning, road hierarchy, NPC population, player flow.
**Status: PARTIAL.** `data/tilemaps/heartlands.json` and peers define settlement tile maps. Landmarks and spawn points encoded. Missing: explicit district metadata, NPC population tracking per district, road-hierarchy tags.
**Next step:** Extend `data/tilemaps/*.json` with `districts: [{id, name, type:'commercial'|'residential'|'industrial', bounds}]` and a `src/world/districts.js` that validates each district has at least one npc of each required service. Test: validate all 8 region tilemaps, flag any district missing a shop or bank.

## shops.md
NPC-run trading: buy-from, sell-to, price floor/ceiling, shop types.
**Status: PARTIAL → near-COMPLETE.** `src/data/shops.js` + `src/content/aelgard/shops-expanded.js` populate shops. `commands/all.js` handles buy/sell against them. Missing: dynamic price floors/ceilings tied to world economy, special shop types (thieving shop, mystery box, trade-in shop), bulk discounts.
**Next step:** Add `shop.priceModel: 'fixed'|'floor'|'dynamic'` — `dynamic` reads from ge-runner guide prices. Implement bulk discount `shop.bulkDiscount = [{ minQty, pct }]`. Test: configure a shop with a 10% discount at qty 10; `/buy 10 shark_fin`, price is floor(unit*10*0.9).

## skills.md
34 base skills, XP curves, level caps, categories, calculators.
**Status: PARTIAL → near-COMPLETE for OSRS skills.** All 23 OSRS skills defined in `player.js`, `src/skills/*.js` implement the training logic for 10 of them with varied degrees, `src/engine/training-runner.js` drives 8-knob training methods per `src/data/relationships.js`. Missing: XP graphing, per-method XP rate history, skill calculator, resting, prestige, task history.
**Next step:** Add `player.xpHistory = [{ tick, skill, xp }]` ring buffer (last 1000 entries); add `/xp-rate <skill>` returning last-hour rate. Test: train mining for 60 seconds, `/xp-rate mining` returns a non-zero number close to the active method's `xpPerHour`.

## skills-activity.md
Agility, prayer training, dungeoneering, sailing, socializing, bank standing, pet raising.
**Status: PARTIAL.** Agility is full (`src/skills/agility.js`, 187 LOC, with lap tracking in `player.agilityLap`). Prayer training exists (`defineTrainingMethod` for bones at altar). Dungeoneering/Sailing: no engine code. Socializing / Bank Standing / Pet Raising: no code.
**Next step:** Add `src/engine/dungeoneering.js` using `instances.js` (a dungeon is a single instance with N rooms + boss). Test: `/dungeon start`, instance spawns, traverse 3 rooms + boss, XP awarded on completion.

## skills-combat.md
Attack, Strength, Defence, Hitpoints, Ranged, Magic, Prayer, Slayer (+ optional RS3 extensions).
**Status: PARTIAL → near-COMPLETE.** All 8 core combat skills in `player.js`. `src/combat/combat.js` uses them all correctly (OSRS effective level, prayer boost). `src/data/slayer.js` + slayer content files exist. RS3 extensions (abilities, adrenaline, dual wielding, summoning, necromancy) are not implemented. Splash training is not implemented.
**Next step:** Add `player.adrenaline = 0`, `src/combat/abilities.js` registry keyed by skill, and `/ability <id>` command that consumes 10 adrenaline and queues the ability effect on the next player attack. Test: equip `bronze_sword`, gain adrenaline from 10 hits, `/ability cleave`, the next attack hits 3 adjacent targets.

## skills-combining.md
Herblore, crafting, fletching, construction, invention.
**Status: PARTIAL.** `src/skills/combining.js` (167 LOC) + construction.js (134 LOC). `src/data/recipes.js` covers crafting/fletching/herblore recipes. Construction: no house building integration. Invention: missing entirely.
**Next step:** See `player-housing.md` next-step for construction. Add `src/engine/invention.js` with disassemble + gizmo system; store gizmos as items. Test: disassemble a bronze sword, receive random invention components; craft a `gizmo_damage` and apply to steel sword, assert that sword's stats gain +2 str.

## skills-gathering.md
Mining, Fishing, Woodcutting, Farming, Hunter (+ Divination, Archaeology).
**Status: PARTIAL → near-COMPLETE for OSRS skills.** `src/skills/gathering.js` + `hunter.js` + `farming.js` are all wired. Tree/ore/fish resource nodes exist via `src/world/objects.js` + `training-runner.js`. Farming patches on `player.farmingPatches`. Missing: Divination + Archaeology, competition model, motherlode mine, shooting stars, skilling bosses (wintertodt, tempoross, zalcano).
**Next step:** Add Divination skill definition in `player.js` SKILLS array and skeleton `src/skills/divination.js` that uses wisps (defined as objects) following the training-runner pattern. Test: train at a `pale_wisp`, gain divination xp, produce `pale_memory` items.

## skills-processing.md
Cooking, Firemaking, Smithing, Runecrafting, Thieving.
**Status: PARTIAL → near-COMPLETE.** `src/skills/firemaking.js` + `processing.js` + `runecrafting.js` + `thieving.js` all wired. `src/engine/recipe-runner.js` does the heavy lifting. Missing: burn chance display (value exists, no UI hint), heat mechanic for smithing, blood/soul runecrafting variants, runespan minigame.
**Next step:** Add `recipe.failChance(player)` return value in `processing.js` and surface via `/recipe-info <id>` command. Add blood altar as a new `object.type = 'altar'` with runecraft-style training. Test: at thieving level 20, call `recipe-info steal_market_stall`, response includes success chance ~45%.

## terrain.md
Ground layer: tiles, elevation, biomes, procedural generation.
**Status: PARTIAL.** `src/world/tiles.js` + `src/world/tilemap.js` (399 LOC) load designer-authored regional tilemaps from `data/tilemaps/*.json`. 15 tile types in `engine-architecture.md` spec exist. Elevation: partial (heights are stored on tilemap records). Biomes: implicit via region folder, not first-class. Procedural gen: absent (Scape uses authored tilemaps, deliberate).
**Next step:** Promote biome to first-class: `tile.biome: 'heartlands_grass'|'veilwood_oak'|...` and a `src/world/biomes.js` lookup from biome → tile rules (what flora auto-populates, what weather). Test: paint a biome, flora objects auto-populate at spawn according to the biome rules.

## tick-system.md
All time-dependent mechanics: tick rate, combat ticks, movement ticks, skilling ticks, respawn, cooldowns, manipulation.
**Status: PARTIAL → near-COMPLETE.** `src/engine/tick.js` (153 LOC) has 10 OSRS-accurate phases, delayed actions, priority queue, registerPhase API. `src/game-loop.js` drives combat/movement/skilling per-player per-tick. Missing: dungeon-master selectable tick modes (Variable, Turn-based, Hybrid, Rhythm, Simultaneous, Action Point), per-skill manipulation toggles, skull/PJ/freeze/TB timers (player fields exist but not all wired into gameplay), tick practice mode, tick replay logger, line-of-sight visualization, combat roll transparency.
**Next step:** Add `world.tickMode: 'fixed'|'variable'|'turn-based'|'hybrid'` and branch the main tick scheduler on it. Implement `variable` first by removing the setInterval pacing and running a logical tick on each player action. Test: set `tickMode='variable'`, have one player do nothing, assert zero ticks pass; a second player issues a command, assert one tick resolves.

## transportation.md
Walking, teleports, mounts, boats, carpets, fairy rings, spirit trees.
**Status: PARTIAL.** Walking + running via `src/world/pathfinding.js`. Teleports exist as magic spells in `src/atoms/definitions/magic-spells.js`. Fairy rings, spirit trees, boats, minecarts are defined in `src/content/aelgard/transportation-network.js` as content but the interactions (click-to-travel) are not wired into server.js handlers.
**Next step:** Add a `src/world/transport-nodes.js` that reads transportation-network.js content and registers objects in the world. `commands/all.js` gains `/use <object>` which delegates to transport-nodes if the target is a node. Test: travel from heartlands to moryskah via `minecart_heartlands_sootworks` + boat + fairy ring path.

## treasure-trails.md
Multi-step clue scrolls (monster drop → step → reward).
**Status: PARTIAL.** `player.activeClue = null` exists. `src/content/aelgard/clue-scrolls-expanded.js` + `treasure-trails.js` define 80+ clue steps. `src/data/items.js` defines clue scrolls. No engine runner: issuing a clue doesn't actually produce step-by-step objectives, no coordinate/emote/cipher/anagram resolver, no casket-reward generator.
**Next step:** Add `src/engine/clue-runner.js` with `start(player, tier)`, `advanceStep(player, solution)`, `complete(player) → reward`. Persist `player.activeClue = { tier, steps[], currentStep, stepData }`. Test: issue a `medium` clue; the first step's `solution='swamp_troll'` — `advanceStep(player, swampTroll_npcId)` advances; final step yields `medium_casket` item.

## world-events.md
Large-scale server-wide or zone-wide events beyond dailies.
**Status: PARTIAL.** Random events-daily content defines some. Builder has a `world-events` tab. No `src/engine/world-events.js` runner, no server-wide scheduler, no player participation tracking.
**Next step:** Add `src/engine/world-events.js` with `scheduleEvent({ id, startTick, duration, zone, rewards })` plus a broadcast to all players on start/end. Test: schedule a `shooting_stars` event in 60 ticks; at tick 60 all players in the target zone receive a chat broadcast; during the event, a star object appears at a random tile within the zone.

---

# COMPLETE (14)

Systems where the plugin doc's major subsystems are all wired to the live tick loop with persistence. Minor polish may still be needed.

## area-gates / area-locked (implicit in locations.md)
Complete Metroidvania gate system: `src/engine/area-gate-runner.js` (113 LOC), `src/engine/area-locked.js` (529 LOC), `src/engine/area-locked-commands.js` (150 LOC) together enforce cross-region travel gating tied to skills/quests/items/visits. Hook-based design preserves decoupling. `src/data/relationships.js defineAreaGate` is the registry.

## combat-system.md (near-COMPLETE, demoted to PARTIAL above; listed here for transparency)
Already discussed. One remaining gap is the special attacks registry. Otherwise the full tick-driven fight loop is operational.

## collection-log.md (near-COMPLETE)
`src/engine/collection-log.js` + `data/collection-log.json` + event integration. Listed as PARTIAL above only due to missing duplicate/luck calc.

## death-system.md (near-COMPLETE)
`src/engine/death.js` (563 LOC) implements everything in the doc except graveyard reclaim locations. Hardcore downgrade is wired. Grave TTL + persistence work.

## diary (achievement-diaries subset of achievements.md)
`src/engine/diary.js` (222 LOC) + `data/diaries/*.json` (8 regional files) — all tiers (easy→elite) wired, tier gating, cumulative perks, XP+gp rewards, cosmetic on elite. Full.

## engine-architecture.md (server-side near-COMPLETE)
All major server items in the doc present: WebSocket JSON protocol, 600ms tick, A* pathfinding, wall edge bitmask, layer system, plugin loader, persistence, events bus, proximity via chunk cache partially. Demoted above for client-side gaps.

## equipment.md (basic OSRS loop, not RS3 features)
`player.equipment` + 11 slots, equipment bonus aggregation in `src/combat/combat.js getEquipBonus`, `src/data/items.js stats`, `src/atoms/definitions/equipment-armor.js` + `combat-armor-extended.js` populate items. Covers OSRS weight/stat-requirement/combat-bonus/untradeable. Advanced toggles (enchant/imbue/augmentation) not implemented — still it passes the "major subsystems present" bar.

## grand-exchange (part of economy.md)
`src/engine/ge-runner.js` (696 LOC) is a complete OSRS-style FIFO order book with escrow, cancel, partial fill, integer-safe arithmetic, persistence, history, guide price tracking, GE taxes (configurable). `ge-commands.js` wires chat commands.

## ironman.md (implicit in modes.md)
`src/engine/ironman.js` (436 LOC) + `src/engine/ironman-commands.js` (168 LOC) — full 4-variant support (iron/hcim/uim/group), restriction hooks into GE/bank/loot/raid, hardcore downgrade on first death, legacy accountMode compat. Complete.

## quests.md (near-COMPLETE)
`src/engine/quest-runner.js` + 69 quests in content + requirements/rewards/unlock-effects all wired via `src/data/relationships.js`. Demoted to PARTIAL above only for missing helper/hint overlay.

## recipe-runner (craft/combine, basis for crafting-system.md)
`src/engine/recipe-runner.js` (194 LOC) is a complete unified recipe engine used by every processing/combining skill. Covers inputs, level gate, station gate, outputs, fail chance, xp. Batch mode is the only v2 feature missing (still listed PARTIAL above for that reason).

## seeding / content-registry (authoring surface for content)
`src/engine/content-registry.js` (606 LOC) mirrors 75 builder tabs, registers playable bosses/instances, auto-generates `/api/content`. `src/engine/content-loader.js` (276 LOC) loads definitions at boot from all `src/content/*`. Complete for what the builder currently exposes.

## training-runner (basis for skills.md)
`src/engine/training-runner.js` (224 LOC) implements the 8-knob design bible: hourly rates → per-tick drips, prerequisite checking, input depletion, inventory-full stop, level-range stops. Universally used by all gathering/processing/combining/activity skills. Complete.

## walls (basis for buildings.md wall-and-door aspects)
`src/world/walls.js` (90 LOC) — edge bitmask (N/E/S/W + 2 diagonals), door open/closed per edge, `isEdgeBlocked` for pathfinding, persistence. Exactly matches the engine-architecture.md spec.

---

## Coverage by Spec Pillar (cross-reference)

| Pillar | Status |
|---|---|
| Core engine (tick / pathfinding / walls / layers / WebSocket) | mostly COMPLETE |
| Skills (OSRS 23) | near-COMPLETE (missing divination, archaeology, RS3 extensions) |
| Combat tick loop | near-COMPLETE (missing abilities, bolt-proc depth, tick-practice, LoS viz) |
| Economy (GE + shops) | near-COMPLETE (missing direct trade, wealth analytics) |
| Account modes (ironman, area-locked) | COMPLETE |
| Content generation (regions, NPCs, items, monsters, quests) | data-rich but many runners incomplete |
| Progression artifacts (collection-log, diary, quests) | COMPLETE |
| Meta systems (animation, audio, minimap, camera, housing) | STUB — data exists, no runtime |
| Social (clan, friends, chat channels) | PARTIAL — chat works, friends/clan ranks missing |
| Accessibility / localization / monetization / security / moderation | MISSING or STUB |
| DM authoring (world-builder-tools, dm-dashboard, content-pipeline) | MISSING or STUB |
| Methodology docs (philosophy-extractor, data-miner, game2tools) | MISSING (intentional) |
