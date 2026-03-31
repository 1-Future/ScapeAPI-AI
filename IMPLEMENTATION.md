# OpenScapeAPI — Master Implementation Chronicle

Every mechanic, tool, and action to implement. Ordered by dependency chain.
Ordered by dependency. Formulas and data validated against OSRS wiki.

**Format per entry:**
- **What**: The mechanic
- **Depends on**: What must exist first
- **Commands**: The API surface (what players/AI type)
- **Properties**: Key data from design docs
- **Done when**: Acceptance criteria

---

## TIER 0 — ENGINE FOUNDATION

No game mechanics. Just the infrastructure everything else sits on.

### 0.1 Tick System
- **What**: The heartbeat. Every action in the game happens on a tick. 600ms default (OSRS standard).
- **Depends on**: Nothing — this is first
- **Commands**: `tick` (show current tick), `tickrate` (show/set tick rate)
- **Properties**: Tick rate (600ms), tick counter (monotonic), priority queue (0=movement, 1=player, 2=NPC, 3=world), PID rotation (optional)
- **Done when**: Server ticks at 600ms, actions can be scheduled N ticks in the future, priority ordering works

### 0.2 Command Parser
- **What**: Text input → parsed command → game action → text response
- **Depends on**: Nothing
- **Commands**: All commands flow through this. Format: `verb [target] [arguments]`
- **Properties**: Command registry, aliases, argument parsing, error messages, help system
- **Done when**: `help` lists all commands, invalid commands give clear errors, commands can be registered dynamically

### 0.3 Player Session
- **What**: A connected player with an ID, name, and state
- **Depends on**: 0.1 Tick System
- **Commands**: `login [name]`, `logout`, `whoami`, `players`
- **Properties**: Player ID (unique), display name, session start time, connection state
- **Done when**: Multiple players can connect simultaneously, each sees their own state

### 0.4 Persistence Layer
- **What**: Save and load game state across server restarts
- **Depends on**: 0.3 Player Session
- **Commands**: `save` (admin), `load` (admin)
- **Properties**: JSON flat files initially, auto-save interval (30s), graceful shutdown saves
- **Done when**: Server can restart without losing player positions, names, or world state

### 0.5 Event System
- **What**: Pub/sub for game events. Decouples systems.
- **Depends on**: 0.1 Tick System
- **Commands**: N/A (internal)
- **Properties**: Event types (player_move, player_login, npc_death, item_drop, etc.), handler registration, handler priority
- **Done when**: Systems can subscribe to events without direct references to each other

### 0.6 Plugin System
- **What**: Load game mechanics as pluggable modules
- **Depends on**: 0.5 Event System
- **Commands**: `plugins` (list loaded), `plugin [id]` (info)
- **Properties**: Plugin metadata (id, name, version, depends), server-side init/teardown, command registration, event hooks
- **Done when**: A mechanic can be added/removed by enabling/disabling a plugin without touching core code

---

## TIER 1 — WORLD EXISTENCE

The world exists. You can be in it. You can look around.

### 1.1 Coordinate System
- **What**: 2D tile grid. Every position is (x, y) on a plane.
- **Depends on**: 0.1 Tick System
- **Commands**: `pos` (show current position), `coords` (same)
- **Properties**: Integer coordinates, origin (0,0), no bounds (infinite grid), chunk size (64x64 for grouping)
- **Done when**: Every tile has a unique (x, y) address, positions reported correctly

### 1.2 Tile System
- **What**: Each tile has a type (grass, water, rock, etc.) that determines walkability and interactions
- **Depends on**: 1.1 Coordinate System
- **Commands**: `look` (describe current tile + surroundings), `tile [x] [y]` (inspect specific tile), `tiles` (list all tile types)
- **Properties**: Tile type enum (grass, water, tree, path, rock, sand, wall, floor, door, bridge, custom), walkability flag per type, speed modifier per type (sand = slower?)
- **Done when**: `look` returns correct tile type, unwalkable tiles block movement

### 1.3 Chunk System
- **What**: World divided into 64x64 tile chunks for efficient loading/storage
- **Depends on**: 1.2 Tile System
- **Commands**: `chunk` (show current chunk coords), `chunks` (show loaded chunks count)
- **Properties**: Chunk size (64x64), lazy loading (load on approach), unload after no players for 60s, binary storage (.bin for tiles, .json for metadata)
- **Done when**: Walking across chunk boundaries is seamless, chunks persist to disk

### 1.4 Layers / Planes
- **What**: Multiple vertical planes (ground floor, upper floor, basement). OSRS has 4 planes (0-3).
- **Depends on**: 1.3 Chunk System
- **Commands**: `layer` (show current), `layer [n]` (change — build mode only), `layers` (list all with content)
- **Properties**: Layer range (-1000 to 1000, but OSRS uses 0-3), independent tile data per layer, visibility (only see current layer)
- **Done when**: Layers are independent — painting on layer 1 doesn't affect layer 0

### 1.5 Regions / Areas
- **What**: Named areas that span multiple tiles. "Lumbridge", "Varrock", "Wilderness Level 10"
- **Depends on**: 1.2 Tile System
- **Commands**: `area` (show current area name), `areas` (list all defined areas)
- **Properties**: Area ID, name, bounding polygon (list of tile coords), properties (PvP zone, safe zone, multicombat, etc.)
- **Done when**: `area` returns the correct name based on your position

---

## TIER 2 — MOVEMENT & NAVIGATION

You can move through the world.

### 2.1 Walking (1 tile/tick)
- **What**: Move one tile per tick in any of 8 directions (N, NE, E, SE, S, SW, W, NW)
- **Depends on**: 1.2 Tile System, 0.1 Tick System
- **Commands**: `walk [direction]`, `walk [x] [y]`, `n`, `s`, `e`, `w`, `ne`, `nw`, `se`, `sw`
- **Properties**: Speed = 1 tile/tick, 8-directional, blocked by unwalkable tiles, blocked by wall edges
- **Done when**: Movement is exactly 1 tile per tick, all 8 directions work, walls block correctly

### 2.2 Running (2 tiles/tick)
- **What**: Move two tiles per tick. Drains run energy.
- **Depends on**: 2.1 Walking, 2.3 Run Energy
- **Commands**: `run [direction]`, `run [x] [y]`, `toggle run`
- **Properties**: Speed = 2 tiles/tick (moves twice per tick — first walk, then second walk in same tick), drains run energy per tile moved while running
- **Done when**: Running moves 2 tiles/tick, auto-falls back to walking at 0% energy

### 2.3 Run Energy
- **What**: Resource that drains while running, regenerates while walking/standing
- **Depends on**: 0.1 Tick System
- **Commands**: `energy` (show current %), `rest` (sit and regen faster)
- **Properties**: Max 10000 (displayed as 100%), drain rate depends on weight, regen rate depends on Agility level, resting multiplier (2x regen at musician, 3x at rest)
- **Done when**: Energy drains while running, regens while still, rates match OSRS formulas

### 2.4 Pathfinding (A*)
- **What**: Click a destination, the game finds the shortest walkable path
- **Depends on**: 2.1 Walking, 1.2 Tile System
- **Commands**: `goto [x] [y]` (pathfind and walk), `path [x] [y]` (show path without moving)
- **Properties**: A* algorithm, max path length (200 tiles?), respects wall/door edges, prefers cardinal over diagonal when equal, path recalculation on blockage
- **Done when**: Pathfinding matches OSRS behavior for simple and complex routes

### 2.5 Wall Blocking
- **What**: Walls on tile edges block movement and line of sight
- **Depends on**: 2.1 Walking, 1.2 Tile System
- **Commands**: `walls [x] [y]` (show wall edges on a tile — N/E/S/W/diag)
- **Properties**: Per-tile edge bitmask (N=1, E=2, S=4, W=8, diagNE=16, diagNW=32), walls block from both sides, line of sight blocking
- **Done when**: Walking into a wall is blocked, pathfinding routes around walls

### 2.6 Doors
- **What**: Openable/closeable wall segments. Open doors don't block movement.
- **Depends on**: 2.5 Wall Blocking
- **Commands**: `open [direction]` (open door on that edge), `close [direction]`, `doors` (list nearby doors)
- **Properties**: Door edge bitmask (same as walls), open state (boolean per edge), auto-close timer (configurable), interaction range (1 tile adjacent)
- **Done when**: Doors open/close, open doors are walkable, pathfinding accounts for door state

### 2.7 Stairs / Layer Transitions
- **What**: Move between layers (floors). Stairs, ladders, trapdoors.
- **Depends on**: 1.4 Layers, 2.1 Walking
- **Commands**: `climb up`, `climb down`, `climb [object]`
- **Properties**: Transition object at (x, y, layer), destination (x, y, layer), animation duration, one-way or two-way
- **Done when**: Climbing stairs changes your layer and position correctly

### 2.8 Teleportation
- **What**: Instant movement to a distant location. Bypasses pathfinding.
- **Depends on**: 1.1 Coordinate System
- **Commands**: `teleport [location_name]`, `teleport [x] [y]`, `home`
- **Properties**: Destination (x, y, layer), delay (ticks before move — home tele is ~16 ticks, spell tele is ~3 ticks), restrictions (combat, wilderness level, teleblock), cooldown
- **Done when**: Teleports move you after the correct delay, restrictions work

### 2.9 Weight System
- **What**: Items in inventory have weight. Total weight affects run energy drain.
- **Depends on**: 2.3 Run Energy
- **Commands**: `weight` (show current weight in kg)
- **Properties**: Per-item weight (kg, can be negative), total weight = sum of inventory + equipment, affects run energy drain formula
- **Done when**: Weight is calculated correctly from carried items, run energy drains faster when heavy

---

## TIER 3 — INTERACTION & OBJECTS

You can interact with things in the world.

### 3.1 Examine
- **What**: Look at an object/NPC/item to get a description
- **Depends on**: 1.2 Tile System
- **Commands**: `examine [target]`, `look at [target]`
- **Properties**: Examine text per entity (string), range (unlimited for examine)
- **Done when**: Every examinable thing returns its description

### 3.2 NPC System (Basic)
- **What**: Non-player characters exist at locations in the world
- **Depends on**: 1.1 Coordinate System, 0.1 Tick System
- **Commands**: `npcs` (list nearby NPCs), `npc [name]` (info about specific NPC)
- **Properties**: NPC ID, name, examine text, position (x, y), combat level (if attackable), wander range, respawn time, max HP, attack speed
- **Done when**: NPCs exist in the world, have correct properties, can be inspected

### 3.3 NPC Wander / Patrol
- **What**: NPCs walk randomly within their spawn area or follow patrol routes
- **Depends on**: 3.2 NPC System, 2.1 Walking
- **Commands**: N/A (passive behavior)
- **Properties**: Spawn point (x, y), wander radius (tiles), move chance per tick (%), patrol route (optional ordered list of waypoints)
- **Done when**: NPCs wander realistically within their designated area

### 3.4 NPC Dialogue
- **What**: Talk to NPCs. Branching conversation trees.
- **Depends on**: 3.2 NPC System
- **Commands**: `talk [npc_name]`, then option numbers (1, 2, 3) to choose dialogue branches
- **Properties**: Dialogue tree (nodes with text + child options), NPC speaker, player options (up to 5), conditions (quest state, skill level), rewards on completion
- **Done when**: Full dialogue trees work, branching choices lead to different responses

### 3.5 Ground Items
- **What**: Items that exist on the ground. Can be picked up.
- **Depends on**: 1.1 Coordinate System
- **Commands**: `items` (list items on current tile), `pickup [item_name]`, `drop [item_name]`
- **Properties**: Item ID, name, quantity, position (x, y), owner (who dropped), visibility phase (private → public → despawn), despawn timer
- **Done when**: Items appear on ground, can be picked up, despawn after correct time

### 3.6 Inventory System
- **What**: 28-slot container for carrying items
- **Depends on**: 3.5 Ground Items
- **Commands**: `inventory` / `inv` (list all items), `inv [slot]` (inspect slot), `use [item]`, `drop [item]`
- **Properties**: 28 slots, stackable flag per item, max stack (2,147,483,647), noted items (stackable version of any item), slot addressing (0-27)
- **Done when**: 28 slots work, stacking works, full inventory rejects new items correctly

### 3.7 Bank System
- **What**: Massive storage at bank locations. Items stack. Tabs for organization.
- **Depends on**: 3.6 Inventory System
- **Commands**: `bank` (open if near banker NPC), `deposit [item]`, `deposit all`, `withdraw [item] [amount]`, `bank search [query]`
- **Properties**: Capacity (configurable, default 816), 9 tabs, all items stack in bank, deposit/withdraw as noted, bank PIN (optional), preset loadouts
- **Done when**: Bank stores items, tabs work, search works, near-banker check works

### 3.8 Equipment System
- **What**: Wear items in equipment slots. Affects combat stats.
- **Depends on**: 3.6 Inventory System
- **Commands**: `equip [item]`, `unequip [slot]`, `equipment` / `gear` (show all slots), `stats` (show combat bonuses from gear)
- **Properties**: 11 slots (head, cape, neck, ammo, weapon, shield, body, legs, hands, feet, ring), per-slot item requirements (level, quest), stat bonuses per item, 2H weapons occupy weapon+shield
- **Done when**: Items equip to correct slots, stat bonuses calculate correctly, 2H weapons work

### 3.9 Object Interaction
- **What**: Interact with world objects (trees, rocks, anvils, furnaces, altars, etc.)
- **Depends on**: 1.2 Tile System
- **Commands**: `interact [object]`, `use [item] on [object]`, `objects` (list nearby interactable objects)
- **Properties**: Object ID, name, position (x, y), size (1x1, 2x2, etc.), actions (list of available verbs), interaction range
- **Done when**: Objects can be interacted with, correct actions are available, range checking works

---

## TIER 4 — SKILLS FOUNDATION

The XP and leveling system that everything else builds on.

### 4.1 XP and Level System
- **What**: Experience points earned from actions. Levels 1-99 with XP thresholds.
- **Depends on**: 0.3 Player Session
- **Commands**: `skills` (show all levels), `skill [name]` (show specific XP/level), `total` (total level)
- **Properties**: 23+ skills, XP range (0 to 200,000,000), level range (1-99, virtual 100-126), XP formula (OSRS standard), total level (sum of all skill levels)
- **Done when**: XP formula matches OSRS exactly, levels calculate correctly, total level sums correctly

### 4.2 Combat Level Calculation
- **What**: Single number representing combat power. Calculated from combat skill levels.
- **Depends on**: 4.1 XP and Level System
- **Commands**: `combat` (show combat level + breakdown)
- **Properties**: 7 contributing skills (Attack, Strength, Defence, HP, Prayer, Ranged, Magic), combat level range (3-126)
- **Done when**: Combat level matches OSRS formula for any stat combination

### 4.3 Skill List Definition
- **What**: Define all skills with their categories
- **Depends on**: 4.1 XP and Level System
- **Commands**: `skills` (show all), `skill [name]` (details)
- **Properties**: Skill name, category (Combat/Gathering/Processing/Combining/Activity), icon, members-only flag, max level (99, or 120 for some)
- **Skills list**: Attack, Strength, Defence, Hitpoints, Ranged, Prayer, Magic, Runecrafting, Construction, Agility, Herblore, Thieving, Crafting, Fletching, Slayer, Hunter, Mining, Smithing, Fishing, Cooking, Firemaking, Woodcutting, Farming
- **Done when**: All skills defined with correct categories

---

## TIER 5 — COMBAT SYSTEM

You can fight things. The core gameplay loop.

### 5.1 Attack Styles
- **What**: Choose how you fight (accurate, aggressive, defensive, controlled). Affects which skills get XP.
- **Depends on**: 4.3 Skill List
- **Commands**: `style` (show current), `style [name]` (change style)
- **Properties**: Style name, XP distribution (which skills and ratio), invisible level boost (+3 accurate, +3 aggressive, +1 controlled, +3 defensive), speed modifier
- **Done when**: Styles change XP distribution correctly, invisible boosts apply

### 5.2 Max Hit Calculation (Melee)
- **What**: Calculate maximum melee damage based on strength level, gear, prayer, style
- **Depends on**: 5.1 Attack Styles, 3.8 Equipment System
- **Commands**: `maxhit` (show current max hit with current gear/style)
- **Properties**: Effective strength level formula, equipment strength bonus, prayer multipliers (burst of strength +5%, ultimate +15%, piety +23%), void melee (+10%)
- **Done when**: Max hit matches OSRS for any gear/prayer/style combination

### 5.3 Accuracy Roll (Melee)
- **What**: Determine if an attack hits. Attack roll vs defence roll.
- **Depends on**: 5.2 Max Hit Calculation, 3.8 Equipment System
- **Commands**: `accuracy [target]` (show hit chance against target)
- **Properties**: Attack roll, defence roll, accuracy formula, effective attack level (level + style + 8) × prayer
- **Done when**: Hit rates match OSRS within statistical margin over 1000+ attacks

### 5.4 Damage Roll
- **What**: When a hit lands, roll damage between 0 and max hit (inclusive)
- **Depends on**: 5.3 Accuracy Roll
- **Commands**: N/A (automatic on hit)
- **Properties**: Damage = random(0, max_hit) inclusive, damage is integer, 0 damage on miss (different from 0-hit)
- **Done when**: Damage distribution is uniform 0 to max_hit, separate from accuracy check

### 5.5 Attack Speed
- **What**: How many ticks between attacks. Depends on weapon.
- **Depends on**: 0.1 Tick System, 3.8 Equipment System
- **Commands**: `speed` (show current attack speed in ticks)
- **Properties**: Per-weapon attack speed (ticks), rapid style = -1 tick for ranged, accurate style = no change, default unarmed = 4 ticks
- **Done when**: Attack intervals match OSRS weapon speeds exactly

### 5.6 HP and Death
- **What**: Hit points. When HP reaches 0, you die.
- **Depends on**: 5.4 Damage Roll
- **Commands**: `hp` (show current/max HP), `heal` (debug)
- **Properties**: HP = Hitpoints level × 1 (OSRS: level = max HP), HP regen (1 HP per 60 ticks / 36 seconds), death at 0 HP
- **Done when**: HP tracks correctly, death triggers at 0, HP regens at correct rate

### 5.7 NPC Combat
- **What**: NPCs can be attacked and fight back
- **Depends on**: 5.6 HP and Death, 3.2 NPC System
- **Commands**: `attack [npc_name]`, `flee` / `run away`
- **Properties**: NPC attack stats, defence stats, aggression (boolean + range), respawn time (ticks), death drop table, combat XP given on kill
- **Done when**: NPCs fight back, die correctly, respawn, drop items, give XP

### 5.8 Combat XP
- **What**: XP earned from combat. 4 XP per damage dealt (melee), distributed by style.
- **Depends on**: 5.7 NPC Combat, 5.1 Attack Styles
- **Commands**: N/A (automatic)
- **Properties**: 4 XP per damage dealt (base), style distribution, 1.33 HP XP per damage always, ranged: 4 XP ranged per damage, magic: 2 Magic XP + 2 HP XP base
- **Done when**: XP matches OSRS rates exactly per attack style

### 5.9 Auto-Retaliate
- **What**: Automatically fight back when attacked
- **Depends on**: 5.7 NPC Combat
- **Commands**: `retaliate` (toggle on/off), `retaliate status`
- **Properties**: Boolean toggle, retaliates on next tick after being hit, doesn't interrupt eating/potions
- **Done when**: Auto-retaliate responds correctly on/off

### 5.10 Prayer System (Basic)
- **What**: Overhead prayers that boost stats or protect from damage
- **Depends on**: 4.3 Skill List
- **Commands**: `pray [prayer_name]`, `pray off`, `prayers` (list available), `pray points` (show remaining)
- **Properties**: Prayer points = Prayer level, drain rate per prayer, multiple prayers stack drain, boost values (5/10/15/23% for stat prayers), protection prayers (melee/ranged/magic)
- **Done when**: Prayer drain matches OSRS rates, protection works, stat boosts apply correctly

### 5.11 Special Attack
- **What**: Weapon-specific special attacks that consume special attack energy
- **Depends on**: 5.5 Attack Speed, 3.8 Equipment System
- **Commands**: `special` / `spec` (use special attack), `spec energy` (show %)
- **Properties**: 100% max energy, regen 10% per 50 ticks (30s), per-weapon cost and effect, some specs guaranteed hit, some have unique mechanics
- **Done when**: Special attacks consume correct energy, effects apply, regen is correct

### 5.12 Ranged Combat
- **What**: Attack from distance with bows/crossbows. Uses ammo.
- **Depends on**: 5.3 Accuracy Roll, 3.8 Equipment System
- **Commands**: `attack [target]` (uses equipped ranged weapon), `ammo` (show equipped ammo)
- **Properties**: Ranged max hit = floor(0.5 + effective_ranged × (ranged_str + 64) / 640), ammo consumed per attack, range distance per weapon, rapid style = -1 tick speed
- **Done when**: Ranged combat works at distance, ammo is consumed, damage matches OSRS

### 5.13 Magic Combat
- **What**: Cast offensive spells. Uses runes.
- **Depends on**: 5.3 Accuracy Roll, 3.6 Inventory System
- **Commands**: `cast [spell] on [target]`, `spells` (list available), `runes` (show rune inventory)
- **Properties**: Per-spell: max hit, rune cost, required magic level, element (air/water/earth/fire), range, speed (5 ticks standard), autocast option
- **Done when**: Spells consume correct runes, deal correct max damage, accuracy works

### 5.14 Multicombat vs Single Combat
- **What**: Some areas allow multiple attackers, others only 1v1
- **Depends on**: 5.7 NPC Combat, 1.5 Regions
- **Commands**: `combat zone` (show if current area is multi or single)
- **Properties**: Per-area flag (single/multi), single combat timer (8 ticks), skull timer in PvP
- **Done when**: Single combat prevents piling, multi allows it

---

## TIER 6 — GATHERING SKILLS

You can harvest resources from the world.

### 6.1 Universal Gathering Mechanic
- **What**: The shared pattern all gathering skills use. Player + Tool + Node → Success Roll → Product + XP
- **Depends on**: 4.1 XP and Level System, 3.9 Object Interaction
- **Commands**: Varies by skill
- **Properties**: Success formula = 1 - (level_diff × factor), tool bonus (higher tier = higher success), node depletion (chance to deplete per success), respawn timer
- **Done when**: The base gathering function works and can be parameterized per skill

### 6.2 Woodcutting
- **What**: Chop trees for logs
- **Depends on**: 6.1 Universal Gathering
- **Commands**: `chop [tree]`, `chop` (nearest tree)
- **Properties**: Tree type (level req, XP, respawn range), axe tier (bronze→dragon, each +1 invisible level), success formula, bird nest chance (1/256)
- **Done when**: Chop rates match OSRS within statistical margin

### 6.3 Mining
- **What**: Mine rocks for ores
- **Depends on**: 6.1 Universal Gathering
- **Commands**: `mine [rock]`, `mine` (nearest rock)
- **Properties**: Rock type (level req, XP, ore produced, respawn range), pickaxe tier, success formula, gem chance (1/256 with charged amulet of glory)
- **Done when**: Mining rates match OSRS within statistical margin

### 6.4 Fishing
- **What**: Catch fish at fishing spots
- **Depends on**: 6.1 Universal Gathering
- **Commands**: `fish [spot]`, `fish` (nearest spot)
- **Properties**: Spot type (level req, XP, tool required, bait required, catch table), spot movement timer, bare-hand fishing option
- **Done when**: Catch rates match OSRS, spots move periodically

### 6.5 Farming
- **What**: Plant seeds, wait for growth, harvest crops
- **Depends on**: 6.1 Universal Gathering
- **Commands**: `plant [seed]`, `harvest`, `inspect [patch]`, `patches` (list nearby patches)
- **Properties**: Patch types (allotment, herb, tree, fruit tree, bush, hops), seed→crop mapping, growth stages (4-8), growth cycle (5 min), disease chance per stage, yield formula (level-based), compost tiers (normal/super/ultra)
- **Done when**: Growth timers match OSRS, disease works, yields are correct

### 6.6 Hunter
- **What**: Trap creatures for resources
- **Depends on**: 6.1 Universal Gathering
- **Commands**: `trap [type]`, `check trap`, `traps` (list placed traps)
- **Properties**: Trap type, creature type, catch rate formula, trap limit per hunter level, bait options, creature spawn rate
- **Done when**: Trap limits correct, catch rates match OSRS

---

## TIER 7 — PROCESSING SKILLS

You can transform raw resources into useful products.

### 7.1 Universal Processing Mechanic
- **What**: Shared pattern. Tool + Input + Station → Product + XP (with optional failure)
- **Depends on**: 4.1 XP and Level System, 3.6 Inventory System
- **Commands**: Varies by skill
- **Properties**: Recipe (inputs, outputs, level req, XP), tick duration, failure chance formula, station required (furnace, anvil, range, etc.)
- **Done when**: Base processing function works and is parameterizable

### 7.2 Cooking
- **What**: Cook raw food on ranges/fires. Can burn.
- **Depends on**: 7.1 Universal Processing, 3.9 Object Interaction
- **Commands**: `cook [item]`, `cook [item] on [object]`
- **Properties**: Per-food: raw item, cooked item, burnt item, level req, XP, stop-burn level, burn formula (linear interpolation), range bonus (reduces burn by ~5%), gauntlets bonus
- **Done when**: Burn rates match OSRS linear interpolation formula

### 7.3 Smithing
- **What**: Smelt ores into bars (furnace), smith bars into items (anvil)
- **Depends on**: 7.1 Universal Processing
- **Commands**: `smelt [bar]`, `smith [item]`, `smith` (open smithing interface)
- **Properties**: Smelting recipes (ore inputs → bar, level, XP, success rate), smithing recipes (bar count → item, level, XP, ticks), anvil + hammer required
- **Done when**: Smelting/smithing matches OSRS recipes and timing

### 7.4 Crafting
- **What**: Make jewelry, leather armor, pottery, glass
- **Depends on**: 7.1 Universal Processing
- **Commands**: `craft [item]`, `craft` (open crafting interface)
- **Properties**: Craft recipes (inputs → output, tools, stations, level, XP, ticks)
- **Done when**: All core craft recipes work with correct inputs and outputs

### 7.5 Fletching
- **What**: Make bows and arrows from logs and other materials
- **Depends on**: 7.1 Universal Processing
- **Commands**: `fletch [item]`, `string [bow]`
- **Properties**: Fletching recipes, knife required, bowstring source (spinning wheel from flax)
- **Done when**: Fletching recipes and XP match OSRS

### 7.6 Herblore
- **What**: Clean herbs and mix potions
- **Depends on**: 7.1 Universal Processing
- **Commands**: `clean [herb]`, `mix [potion]`, `potions` (list known recipes)
- **Properties**: Herb types (grimy → clean, level, XP), potion recipes (clean herb + secondary → potion(4), level, XP), dose system
- **Done when**: Herb cleaning and potion mixing match OSRS

### 7.7 Runecrafting
- **What**: Craft runes at altars from essence
- **Depends on**: 7.1 Universal Processing
- **Commands**: `craft runes` (at altar), `runes` (show rune pouch)
- **Properties**: Altar types, rune type per altar, multiplier levels, XP per essence, essence types (rune/pure), tiara/talisman access
- **Done when**: Rune multipliers match OSRS thresholds

### 7.8 Firemaking
- **What**: Burn logs on the ground for XP
- **Depends on**: 7.1 Universal Processing
- **Commands**: `light [log]`
- **Properties**: Log types (level req, XP), tinderbox required, fire duration, fire blocks tile movement, line-lighting mechanic
- **Done when**: Firemaking XP and mechanics match OSRS

---

## TIER 8 — ECONOMY

You can trade and commerce.

### 8.1 Item Definitions
- **What**: Every item in the game defined with properties
- **Depends on**: 3.6 Inventory System
- **Commands**: `item [name]` (show item properties), `items search [query]`
- **Properties**: Item ID, name, examine, tradeable, stackable, weight, noted form, high alch value, low alch value, buy limit (GE)
- **Done when**: Item definitions loaded and queryable

### 8.2 Trading (Player-to-Player)
- **What**: Two players exchange items directly
- **Depends on**: 3.6 Inventory System
- **Commands**: `trade [player]`, `offer [item] [amount]`, `accept`, `decline`
- **Properties**: Trade request, offer screen, confirmation screen, both-accept requirement, trade log
- **Done when**: Trading works with anti-scam double confirmation

### 8.3 Grand Exchange
- **What**: Automated marketplace. Post buy/sell offers, matched automatically.
- **Depends on**: 8.1 Item Definitions
- **Commands**: `ge buy [item] [quantity] [price]`, `ge sell [item] [quantity] [price]`, `ge offers` (show active), `ge price [item]` (show market price)
- **Properties**: 8 offer slots, buy limits per item, price matching (best price first), partial fills, 4-hour buy limit reset, 1% tax on sells (added 2022)
- **Done when**: GE matches offers correctly, buy limits work, price tracking works

### 8.4 Shops (NPC)
- **What**: NPCs sell items at fixed or dynamic prices
- **Depends on**: 3.4 NPC Dialogue, 8.1 Item Definitions
- **Commands**: `shop` (open if near shopkeeper), `buy [item] [amount]`, `sell [item] [amount]`, `shop stock` (show inventory)
- **Properties**: Shop ID, NPC owner, stock list (item + base quantity), price formula (based on stock level), restock rate, specialty vs general store
- **Done when**: Shops restock, prices scale with supply, buy/sell works

### 8.5 Alchemy (High/Low)
- **What**: Convert items to gold coins using magic spells
- **Depends on**: 5.13 Magic Combat, 8.1 Item Definitions
- **Commands**: `alch [item]` (high alch), `lowalch [item]`
- **Properties**: High alch value per item, low alch value per item, rune cost (1 nature + 5 fire for high alch), 5-tick cooldown
- **Done when**: Alch values match OSRS item definitions exactly

---

## TIER 9 — ADVANCED COMBAT & MONSTERS

Deeper combat mechanics and monster variety.

### 9.1 Monster Drop Tables
- **What**: When monsters die, they drop items based on weighted probability tables
- **Depends on**: 5.7 NPC Combat, 8.1 Item Definitions
- **Commands**: `drops [monster_name]` (show known drop table), `loot` (show last kill drops)
- **Properties**: Drop table entries (item ID, quantity range, weight/rarity, members-only), always drops, main drop table, tertiary drops (pet, clue), nothing drop weight
- **Done when**: Drop rates match OSRS within statistical margin over 1000+ kills

### 9.2 Slayer System
- **What**: Get assigned monsters to kill by Slayer masters for bonus XP
- **Depends on**: 5.7 NPC Combat, 3.4 NPC Dialogue
- **Commands**: `task` (show current slayer task), `slayer` (show slayer info), `talk [slayer_master]` (get new task)
- **Properties**: Slayer master list (combat req, task table), per-task weight, task count range, slayer XP = monster HP, slayer points rewards, unlock system (broader slayer rewards)
- **Done when**: Task assignment matches OSRS weighting, streak bonuses work

### 9.3 Boss Mechanics
- **What**: Special monsters with unique mechanics, phases, and valuable drops
- **Depends on**: 5.7 NPC Combat
- **Commands**: `boss [name]` (show info), `attack [boss]`, `kc [boss]` (show kill count)
- **Properties**: Boss stats, phase system (HP thresholds → behavior change), special attack patterns, instance system (solo/group), KC tracking, unique drop rates
- **Done when**: Boss fights have correct mechanics and phases

### 9.4 NPC Aggression
- **What**: Some NPCs attack players on sight based on combat level difference
- **Depends on**: 3.2 NPC System, 5.7 NPC Combat
- **Commands**: `aggro` (show which NPCs are aggressive toward you)
- **Properties**: Per-NPC aggression flag, aggro range (tiles), combat level threshold, aggro timer (ticks until de-aggro), re-aggro on area re-entry
- **Done when**: Aggression mechanics match OSRS — level-based, timed de-aggro

---

## TIER 10 — QUESTS & CONTENT

Structured gameplay experiences.

### 10.1 Quest System
- **What**: Multi-step storylines with requirements, dialogue, and rewards
- **Depends on**: 3.4 NPC Dialogue, 4.1 XP and Level System
- **Commands**: `quests` (list all), `quest [name]` (status/progress), `questlog` (current active quests)
- **Properties**: Quest ID, name, requirements (skills, quests, items), steps (ordered), NPC interactions per step, item requirements per step, rewards (XP, items, quest points, unlocks)
- **Done when**: Multi-step quests work with requirement gating and rewards

### 10.2 Quest Points
- **What**: Points earned from completing quests. Some content requires QP thresholds.
- **Depends on**: 10.1 Quest System
- **Commands**: `qp` (show quest points)
- **Properties**: Per-quest QP reward, total QP, QP requirements for content gates
- **Done when**: QP accumulate correctly, gates work

### 10.3 Achievement Diary
- **What**: Regional task lists with tier rewards (Easy/Medium/Hard/Elite)
- **Depends on**: 4.1 XP and Level System, 10.1 Quest System
- **Commands**: `diary [region]` (show tasks), `diaries` (show all completion %)
- **Properties**: Diary regions, tasks per tier, requirement types (skill level, quest, item, activity), tier rewards, passive perks
- **Done when**: Tasks track completion, tier rewards grant correctly

### 10.4 Collection Log
- **What**: Track unique items obtained from specific sources
- **Depends on**: 9.1 Monster Drop Tables
- **Commands**: `clog` (show collection log), `clog [category]` (show specific section)
- **Properties**: Categories, items per category (source + item), obtained flag per item per player, total slots, completion percentage
- **Done when**: Drops register in collection log, completion tracks correctly

---

## TIER 11 — SOCIAL SYSTEMS

Multiplayer interaction.

### 11.1 Chat System
- **What**: Public chat visible to nearby players
- **Depends on**: 0.3 Player Session
- **Commands**: `say [message]` (public chat), `shout [message]` (wider range)
- **Properties**: Public range (tiles), overhead duration (ticks), rate limit (messages per minute), chat effects (wave:, scroll:, shake:, slide:, etc.), censorship filter
- **Done when**: Chat visible to nearby players, effects work, rate limiting works

### 11.2 Private Messages
- **What**: Direct messages between players regardless of location
- **Depends on**: 0.3 Player Session
- **Commands**: `pm [player] [message]`, `reply [message]` (reply to last PM)
- **Properties**: Instant delivery, PM log, reply shortcut, online status check before send
- **Done when**: PMs work between any two online players

### 11.3 Friends List
- **What**: Track other players, see their online status
- **Depends on**: 0.3 Player Session
- **Commands**: `friends` (list), `friend add [name]`, `friend remove [name]`
- **Properties**: Friend list capacity, online/offline status tracking, world number display, add/remove
- **Done when**: Friends list shows online status correctly

### 11.4 Ignore List
- **What**: Block messages from specific players
- **Depends on**: 11.1 Chat System
- **Commands**: `ignore [name]`, `unignore [name]`, `ignores` (list)
- **Properties**: Ignore list capacity, blocks public chat + PM from ignored player
- **Done when**: Ignored players' messages are hidden

### 11.5 Clan System
- **What**: Player groups with shared chat, ranks, and permissions
- **Depends on**: 11.1 Chat System
- **Commands**: `clan` (show clan info), `clan chat [message]`, `clan join [name]`, `clan leave`, `clan kick [player]`
- **Properties**: Clan name, member capacity (500), rank hierarchy (Owner, Deputy, Mod, Sergeant, Corporal, Recruit, Guest), per-rank permissions, clan chat channel, clan bank (optional)
- **Done when**: Clan chat works, ranks control permissions

### 11.6 Trade/Duel
- **What**: Challenge players to a stake fight
- **Depends on**: 8.2 Trading, 5.7 NPC Combat
- **Commands**: `duel [player]`, `stake [item]`, `accept duel`
- **Properties**: Duel rules (toggle features on/off), stake items, arena instance, two-screen confirm, anti-scam measures
- **Done when**: Duels work with rules and staking

---

## TIER 12 — WORLD BUILDING (DM/Admin Tools)

Build the world. These are the editor commands.

### 12.1 Terrain Painting
- **What**: Place/change tile types
- **Depends on**: 1.2 Tile System
- **Commands**: `paint [x] [y] [tile_type]`, `fill [x1] [y1] [x2] [y2] [tile_type]`, `paint brush [size]`
- **Properties**: All tile types, color tinting, variant selection, brush size, flood fill
- **Done when**: All tile types can be placed, fill works, undo works

### 12.2 Wall Placement
- **What**: Place/remove walls on tile edges
- **Depends on**: 2.5 Wall Blocking
- **Commands**: `wall [x] [y] [edge]`, `wall line [x1] [y1] [x2] [y2]`, `wall rect [x1] [y1] [x2] [y2]`, `wall delete [x] [y]`
- **Properties**: Edge placement (N/E/S/W/diag), line drawing, rectangle rooms, wall textures
- **Done when**: Walls place correctly, line/rect tools work

### 12.3 NPC Placement
- **What**: Spawn NPCs at locations
- **Depends on**: 3.2 NPC System
- **Commands**: `spawn npc [name] [x] [y]`, `npc remove [id]`, `npc edit [id] [property] [value]`
- **Properties**: NPC type, position, wander radius, patrol route, dialogue tree, combat stats, drop table
- **Done when**: NPCs can be placed, configured, and removed

### 12.4 Object Placement
- **What**: Place interactable objects (trees, rocks, furnaces, banks, etc.)
- **Depends on**: 3.9 Object Interaction
- **Commands**: `place [object] [x] [y]`, `remove object [x] [y]`, `objects at [x] [y]`
- **Properties**: Object type, position, size, rotation, actions, interaction behavior
- **Done when**: Objects can be placed, interacted with, and removed

### 12.5 Area Definition
- **What**: Define named regions with properties
- **Depends on**: 1.5 Regions
- **Commands**: `area create [name] [x1] [y1] [x2] [y2]`, `area set [name] [property] [value]`, `area delete [name]`
- **Properties**: Area name, boundary, PvP flag, multicombat flag, music track, environmental effects
- **Done when**: Areas can be created and their properties affect gameplay

### 12.6 Item Definition
- **What**: Define new items with properties
- **Depends on**: 8.1 Item Definitions
- **Commands**: `item create [name]`, `item set [name] [property] [value]`, `item delete [name]`
- **Properties**: Full item property set (name, tradeable, stackable, weight, value, equip slot, stats, etc.)
- **Done when**: Custom items can be created and used in all systems

### 12.7 Quest Editor
- **What**: Create quests with steps, requirements, and rewards
- **Depends on**: 10.1 Quest System
- **Commands**: `quest create [name]`, `quest step add [quest] [description]`, `quest req [quest] [type] [value]`, `quest reward [quest] [type] [value]`
- **Properties**: Quest structure (steps, requirements, rewards, NPC assignments, item needs)
- **Done when**: Quests can be authored via commands and played through

### 12.8 Drop Table Editor
- **What**: Configure monster drop tables
- **Depends on**: 9.1 Monster Drop Tables
- **Commands**: `drops add [monster] [item] [weight] [min] [max]`, `drops remove [monster] [item]`, `drops test [monster] [count]` (simulate kills)
- **Properties**: Drop entries (item, weight, quantity range), always table, main table, tertiary table, rare drop table
- **Done when**: Drop tables can be configured and simulated

### 12.9 Shop Editor
- **What**: Create and configure NPC shops
- **Depends on**: 8.4 Shops
- **Commands**: `shop create [npc]`, `shop stock [npc] [item] [quantity] [price]`, `shop remove [npc] [item]`
- **Properties**: Shop stock, base prices, restock rate, specialty flag
- **Done when**: Shops can be created and configured

### 12.10 Recipe Editor
- **What**: Define crafting/processing recipes
- **Depends on**: 7.1 Universal Processing
- **Commands**: `recipe create [skill] [name]`, `recipe input [name] [item] [amount]`, `recipe output [name] [item] [amount]`, `recipe set [name] [property] [value]`
- **Properties**: Inputs, outputs, skill, level req, XP, ticks, station, tool, failure chance
- **Done when**: Recipes can be defined and used in processing skills

---

## TIER 13 — PLAYER HOUSING

Build your own space.

### 13.1 House System
- **What**: Personal buildable space with rooms and furniture
- **Depends on**: 1.4 Layers, 12.2 Wall Placement
- **Commands**: `house` (go to house), `house build`, `house room [type]`, `house furniture [item]`
- **Properties**: Room types (parlour, kitchen, bedroom, chapel, workshop, etc.), furniture tiers per hotspot, build requirements, max rooms (configurable), house location
- **Done when**: Rooms can be added, furniture placed, house is visitable

---

## TIER 14 — MINIGAMES & ACTIVITIES

Structured group content.

### 14.1 Minigame Framework
- **What**: Instanced gameplay with custom rules, matchmaking, and rewards
- **Depends on**: 5.7 NPC Combat, 10.1 Quest System
- **Commands**: `minigame [name]`, `minigame join [name]`, `minigame leave`, `minigames` (list available)
- **Properties**: Instance creation, player count (min/max), rules engine (per-minigame), reward points, reward shop, leaderboard
- **Done when**: Minigame framework supports custom rules and instancing

### 14.2 Treasure Trails (Clue Scrolls)
- **What**: Multi-step puzzle chains with tiered rewards
- **Depends on**: 9.1 Monster Drop Tables, 1.1 Coordinate System
- **Commands**: `clue` (show current step), `dig` (at coordinate clue), `emote [name]` (for emote clues)
- **Properties**: Clue tiers (beginner-master), step types, step count per tier, reward table per tier, unique rewards (cosmetics)
- **Done when**: Multi-step clue system works with various step types

---

## TIER 15 — META SYSTEMS

Systems that modify how other systems work.

### 15.1 Account Modes
- **What**: Ironman, Hardcore Ironman, Ultimate Ironman — restrict trading/banking/death
- **Depends on**: 0.3 Player Session
- **Commands**: `mode` (show current), `mode set [type]` (character creation only)
- **Properties**: Mode type, trading restriction, GE restriction, death penalty, banking restriction, group mode (GIM — shared bank within group)
- **Done when**: Each mode's restrictions are correctly enforced

### 15.2 Hiscores
- **What**: Ranked leaderboards per skill and activity
- **Depends on**: 4.1 XP and Level System
- **Commands**: `hiscores [skill]`, `rank [player]`, `rank me`
- **Properties**: Per-skill XP ranking, total level ranking, boss KC ranking, minimum threshold to appear (usually level 30+), mode-specific hiscores
- **Done when**: Rankings calculate and display correctly

### 15.3 Random Events
- **What**: Random interruptions that require player attention (anti-AFK)
- **Depends on**: 0.1 Tick System
- **Commands**: `dismiss` (dismiss random event NPC)
- **Properties**: Event types, trigger conditions (idle time, activity duration), event NPCs, rewards, dismissal option
- **Done when**: Random events trigger based on activity patterns

### 15.4 World/Server Selection
- **What**: Multiple game worlds with different rulesets
- **Depends on**: 0.3 Player Session
- **Commands**: `worlds` (list), `world [number]` (hop), `world info [number]`
- **Properties**: World number, type (normal, PvP, skill total req, etc.), region (US, UK, AU, DE), player count, activity label
- **Done when**: World hopping works with cooldown, world types have correct rules

---

## TIER 16 — PVP

Player vs Player combat.

### 16.1 Wilderness
- **What**: PvP zone with escalating risk based on depth
- **Depends on**: 5.7 NPC Combat, 1.5 Regions
- **Commands**: `wilderness` (show current level), `skull` (show skull status)
- **Properties**: Wilderness levels (1-56), combat bracket formula, teleport restrictions, skull timer (1500 ticks), items lost on death, loot mechanics
- **Done when**: Wilderness mechanics match OSRS — level-based brackets, skulling, item loss

### 16.2 Bounty Hunter
- **What**: Assigned PvP targets in wilderness for bonus rewards
- **Depends on**: 16.1 Wilderness
- **Commands**: `target` (show assigned target), `skip target`
- **Properties**: Target assignment, skip penalty, emblem system, reward shop
- **Done when**: Target assignment and rewards work

---

## TIER 17 — ADVANCED SKILLS

Skills that depend on multiple other systems.

### 17.1 Construction
- **What**: Build furniture and rooms in your player-owned house
- **Depends on**: 13.1 House System, 7.4 Crafting
- **Commands**: `build [furniture]`, `remove [furniture]`
- **Properties**: Furniture definitions (materials, level, XP), hotspot system (furniture type per room spot), progressive unlock
- **Done when**: Furniture builds in correct hotspots with correct requirements

### 17.2 Agility
- **What**: Navigate obstacle courses for XP. Affects run energy regeneration.
- **Depends on**: 2.3 Run Energy, 4.1 XP and Level System
- **Commands**: `cross [obstacle]`, `course` (show current course progress)
- **Properties**: Course definitions (ordered obstacles, per-obstacle XP, completion bonus), obstacle fail chance formula, marks of grace (random spawn on course, 1/X chance per obstacle), run energy regen bonus from Agility level
- **Done when**: Courses work, XP matches, fail chances match, marks of grace spawn correctly

### 17.3 Thieving
- **What**: Steal from stalls, pickpocket NPCs
- **Depends on**: 3.2 NPC System, 4.1 XP and Level System
- **Commands**: `pickpocket [npc]`, `steal from [stall]`
- **Properties**: Per-NPC thieving level req, XP, loot table, stun duration, stun damage, success rate formula
- **Done when**: Pickpocket rates match OSRS

### 17.4 Slayer (Full)
- **What**: Complete slayer system with rewards, unlocks, superiors
- **Depends on**: 9.2 Slayer System (basic)
- **Commands**: `slayer rewards`, `slayer unlock [reward]`, `slayer block [monster]`
- **Properties**: Slayer reward shop, block list (6 slots), preferred list, superior variants, slayer-only areas, slayer helmet imbue
- **Done when**: Full slayer reward system works

---

## TIER 18 — POLISH & COMPLETENESS

### 18.1 Emotes
- **What**: Character animations/expressions
- **Depends on**: 0.3 Player Session
- **Commands**: `emote [name]`, `emotes` (list available)
- **Properties**: Emote name, animation duration, unlock condition, loop flag
- **Done when**: All standard emotes available

### 18.2 Music System
- **What**: Area-specific background music that unlocks as you explore
- **Depends on**: 1.5 Regions
- **Commands**: `music` (now playing), `music list` (unlocked tracks), `music play [track]`
- **Properties**: Track ID, name, unlock condition (area visit, quest, boss kill), area assignments, music cape (all tracks unlocked)
- **Done when**: Tracks play per area, unlock tracking works

### 18.3 Examine Text Database
- **What**: Every object, NPC, and item has examine text
- **Depends on**: 3.1 Examine
- **Commands**: `examine [target]`
- **Properties**: Per-entity examine text string
- **Done when**: All entities have examine text

### 18.4 Tutorial
- **What**: Guided introduction for new players
- **Depends on**: 10.1 Quest System
- **Commands**: `tutorial skip` (if enabled), `tutorial progress`
- **Properties**: Tutorial steps (ordered), tasks per step, NPC guide, items provided, skills introduced, completion flag
- **Done when**: New players can complete tutorial and learn all basics

### 18.5 Death System
- **What**: What happens when you die — item loss, respawn, gravestone
- **Depends on**: 5.6 HP and Death
- **Commands**: `death info` (show death rules), `gravestone` (check if you have one)
- **Properties**: Items kept (3 by value, +1 with protect item), gravestone timer (15 min), death fee (scales with value), respawn location, safe death areas, hardcore death = permanent
- **Done when**: Death mechanics match OSRS — correct items kept, gravestone timer, death costs

---

## IMPLEMENTATION ORDER SUMMARY

```
TIER 0: Engine Foundation (6 items)
  └── Tick → Parser → Session → Persistence → Events → Plugins

TIER 1: World Existence (5 items)
  └── Coords → Tiles → Chunks → Layers → Regions

TIER 2: Movement (9 items)
  └── Walk → Run → Energy → Pathfinding → Walls → Doors → Stairs → Teleport → Weight

TIER 3: Interaction (9 items)
  └── Examine → NPCs → Wander → Dialogue → Ground Items → Inventory → Bank → Equipment → Objects

TIER 4: Skills Foundation (3 items)
  └── XP/Levels → Combat Level → Skill List

TIER 5: Combat (14 items)
  └── Styles → Max Hit → Accuracy → Damage → Speed → HP → NPC Combat → XP → Retaliate → Prayer → Special → Ranged → Magic → Multi/Single

TIER 6: Gathering (6 items)
  └── Universal Gathering → Woodcutting → Mining → Fishing → Farming → Hunter

TIER 7: Processing (8 items)
  └── Universal Processing → Cooking → Smithing → Crafting → Fletching → Herblore → Runecrafting → Firemaking

TIER 8: Economy (5 items)
  └── Item Defs → Trading → GE → Shops → Alchemy

TIER 9: Advanced Combat (4 items)
  └── Drop Tables → Slayer → Bosses → Aggression

TIER 10: Quests (4 items)
  └── Quest System → Quest Points → Achievement Diary → Collection Log

TIER 11: Social (6 items)
  └── Chat → PM → Friends → Ignore → Clans → Duel

TIER 12: World Building (10 items)
  └── Terrain → Walls → NPCs → Objects → Areas → Items → Quests → Drops → Shops → Recipes

TIER 13: Housing (1 item)
  └── House System

TIER 14: Minigames (2 items)
  └── Framework → Clue Scrolls

TIER 15: Meta Systems (4 items)
  └── Account Modes → Hiscores → Random Events → World Selection

TIER 16: PvP (2 items)
  └── Wilderness → Bounty Hunter

TIER 17: Advanced Skills (4 items)
  └── Construction → Agility → Thieving → Full Slayer

TIER 18: Polish (5 items)
  └── Emotes → Music → Examine DB → Tutorial → Death System

TOTAL: 107 mechanics to implement
```

---

