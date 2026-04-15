// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Minigames Mega Expansion (burn v2)
//
// Adds 32 new minigames bringing the total to 38 (6 base + 32 here).
// Covers all 16 BYOS game-mode templates across all 9 regions:
//   Heartlands, Sootworks, Veilwood, Saltbrine, Boneyard,
//   Moryskah, Glass Desert, Inkweald, Wilds.
//
// Design Bible (Marstead):
//   - Manifesto P04: Every minigame MUST give something UNIQUE
//     (not just coins or XP — a tool, spell, teleport, pet, outfit, cosmetic,
//      titles, or a mechanic not available elsewhere).
//   - Manifesto P02: Full attention spectrum — Background to Max Focus.
//   - Manifesto P08: Every minigame's unique reward is a downstream breakpoint.
//   - Skinned originals only. No IP copies.
//
// 16 BYOS templates covered:
//   1  wave_survival       — defend against escalating waves
//   2  capture_the_flag    — steal and return the opposing flag
//   3  battle_royale       — last standing in shrinking arena
//   4  objective_defence   — protect a structure or NPC
//   5  duel_1v1            — single combat, configurable rules
//   6  role_based_team     — each member a distinct role
//   7  gather_craft_fight  — collect → craft → fight
//   8  obstacle_course     — platforming against the clock
//   9  timed_collection    — grab most targets before timer
//  10  passive_management  — worker allocation, idle
//  11  escort_protect      — guide vulnerable NPC
//  12  skilling_boss       — defeat boss with non-combat skills
//  13  tower_climbing      — ascend progressively harder floors
//  14  board_game          — turn-based board with random events
//  15  stealth             — complete objectives undetected
//  16  delivery            — transport items under pressure
//
// Registered via rel.defineMinigame (added to relationships.js in this branch).
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const rel = require('../../data/relationships');

// ══════════════════════════════════════════════════════════════════════════════
// HEARTLANDS (starter hub) — 3 minigames
// Templates: timed_collection, board_game, passive_management
// ══════════════════════════════════════════════════════════════════════════════

rel.defineMinigame({
  id: 'harvest_festival_hustle',
  name: 'Harvest Festival Hustle',
  region: 'Heartlands',
  location: 'Heartlands Market Square (seasonal tent, always open)',
  template: 'timed_collection',
  minPlayers: 1, maxPlayers: 12,
  isPvP: false, combatType: 'none',
  attention: 'Active',
  levelReqs: { farming: 15, agility: 20 },
  skills_trained: ['farming', 'agility', 'thieving'],
  rewards: [
    'Cornucopia basket (+1 inventory slot while worn, cosmetic belt)',
    'Festival ribbons (unique emote unlocks)',
    'Scarecrow pet (1/2500)',
  ],
  unique_reward: 'Cornucopia basket — the only +1 inventory slot item in Aelgard',
  reward_currency: 'festival_tokens',
  shop: [
    { item: 'cornucopia_basket', cost: 800 },
    { item: 'festival_ribbon_red', cost: 120 },
    { item: 'festival_ribbon_gold', cost: 350 },
    { item: 'seed_packet_rare', cost: 200 },
  ],
  stages: [
    { name: 'Orchard Dash',    type: 'collection', timer_s: 120, target: 'Pick ripe apples before they rot' },
    { name: 'Pumpkin Haul',    type: 'collection', timer_s: 150, target: 'Lift pumpkins across the square without dropping them' },
    { name: 'Scarecrow Relay', type: 'obstacle',   timer_s: 90,  target: 'Agility course bonus round' },
  ],
  description: 'A frenzied village harvest: dodge cart wheels, pluck produce off the vines, and haul it back to the weighing station before the timer expires. Low barrier to entry, high ceiling on leaderboard.',
  voice_flavor: 'The auctioneer bellows over a fiddle. Children squeal, crates thud. Somewhere a goose is loose.',
  duration_estimate_min: 6,
});

rel.defineMinigame({
  id: 'heartlands_taverna_gambit',
  name: 'Taverna Gambit',
  region: 'Heartlands',
  location: 'The Lion & Lark tavern (upstairs back room)',
  template: 'board_game',
  minPlayers: 2, maxPlayers: 4,
  isPvP: false, combatType: 'none',
  attention: 'Multitask',
  levelReqs: {},
  skills_trained: ['thieving'],
  rewards: [
    'Tavern chip markers (can be traded in any Heartlands inn for room/board)',
    'Lark-shaped cloak clasp (unique cape attachment)',
    'Barkeep pet (1/3000)',
  ],
  unique_reward: 'Tavern chip — convert 1:1 into any Heartlands inn stay, unique off-ledger currency',
  reward_currency: 'tavern_chips',
  shop: [
    { item: 'lark_clasp', cost: 500 },
    { item: 'bawdy_songbook', cost: 75 },
    { item: 'tavern_dice_weighted', cost: 200 },
  ],
  stages: [
    { name: 'Roll',      type: 'board_move',  description: 'Roll dice to move across 36-tile ring board' },
    { name: 'Event',     type: 'random_event', description: 'Land tile: brawl, toast, steal, trade' },
    { name: 'Showdown',  type: 'final',       description: 'Final tile player triggers barroom scuffle' },
  ],
  description: 'A 36-tile ring board played atop the bar. Dice decide movement; tiles decide fate. Knock a pint over and your opponents all advance. Pure social chaos — a breakpoint for the "I wanted to chat between rolls" player.',
  voice_flavor: 'Lute in one corner, dice clacking in the other. Someone keeps singing the wrong verse.',
  duration_estimate_min: 15,
});

rel.defineMinigame({
  id: 'heartlands_estate_stewardship',
  name: 'Estate Stewardship',
  region: 'Heartlands',
  location: 'Heartlands Ledger Office (west end of town hall)',
  template: 'passive_management',
  minPlayers: 1, maxPlayers: 1,
  isPvP: false, combatType: 'none',
  attention: 'Background',
  levelReqs: { construction: 30, farming: 20 },
  questReqs: ['the_missing_deeds'],
  skills_trained: ['construction', 'farming', 'crafting'],
  rewards: [
    'Deeded parcel (unique rotating daily loot: crops, timber, ore, mixed)',
    'Steward signet ring (auto-collect daily allowances)',
    'Ledger quill (lets any scroll be written twice as fast, PoH only)',
  ],
  unique_reward: 'Deeded parcel — only offline idle resource generator in Aelgard that yields Heartlands-exclusive papyrus reed',
  reward_currency: 'royalty_coffer_shares',
  shop: [
    { item: 'steward_signet', cost: 1000 },
    { item: 'ledger_quill', cost: 1500 },
    { item: 'deed_upgrade_loam', cost: 400 },
    { item: 'deed_upgrade_orchard', cost: 600 },
    { item: 'deed_upgrade_quarry', cost: 800 },
  ],
  stages: [
    { name: 'Allocate', type: 'worker_assign', description: 'Assign tenants: farmers, quarrymen, loggers, vintners' },
    { name: 'Coffer',   type: 'fund',          description: 'Deposit gold to pay wages (gold sink)' },
    { name: 'Collect',  type: 'daily',         description: 'Once per day collect produce from allocation' },
  ],
  description: 'Inherit a minor parcel. Allocate tenants across jobs, pay their wages, and collect daily produce. The sovereign way to farm resources while you sleep — with a tax that gives back real rural atmosphere.',
  voice_flavor: 'Quill scratching, tenants shuffling hats. The cat sleeps on the ledger.',
  duration_estimate_min: 3,
});

// ══════════════════════════════════════════════════════════════════════════════
// SOOTWORKS (underground) — 3 minigames
// Templates: obstacle_course, tower_climbing, skilling_boss
// ══════════════════════════════════════════════════════════════════════════════

rel.defineMinigame({
  id: 'sootworks_cinder_parkour',
  name: 'Cinder Parkour',
  region: 'Sootworks',
  location: 'Cinder Shaft (underneath the Blast Forge)',
  template: 'obstacle_course',
  minPlayers: 1, maxPlayers: 1,
  isPvP: false, combatType: 'none',
  attention: 'Max Focus',
  levelReqs: { agility: 45, thieving: 40 },
  skills_trained: ['agility', 'thieving'],
  rewards: [
    'Sooty gloves (permanent +1 pickpocket success Sootworks only)',
    'Soot boots (silent step — halves NPC detection radius underground)',
    'Cinder cat pet (1/2000)',
  ],
  unique_reward: 'Soot boots — only footwear in Aelgard that halves NPC detection radius',
  reward_currency: 'cinder_sparks',
  shop: [
    { item: 'sooty_gloves', cost: 600 },
    { item: 'soot_boots', cost: 900 },
    { item: 'cinder_lantern', cost: 300 },
    { item: 'grease_pot', cost: 100 },
  ],
  stages: [
    { name: 'Chimney Climb', type: 'platform', timer_s: 60,  hazards: ['flame_jet', 'loose_brick'] },
    { name: 'Furnace Dodge', type: 'platform', timer_s: 90,  hazards: ['coal_cart', 'steam_vent'] },
    { name: 'Cinder Dash',   type: 'sprint',   timer_s: 45,  hazards: ['collapsing_floor'] },
  ],
  description: 'A solo parkour course through the live guts of the forge. Time a jump wrong and you singe. Steam vents telegraph two ticks ahead. Top-100 board posts weekly.',
  voice_flavor: 'Bellows whoosh, iron rings hiss cold water. Your own boots slap the catwalk.',
  duration_estimate_min: 5,
});

rel.defineMinigame({
  id: 'sootworks_deep_shaft',
  name: 'The Deep Shaft',
  region: 'Sootworks',
  location: 'Deep Shaft elevator (east tunnel, keypunched)',
  template: 'tower_climbing',
  minPlayers: 1, maxPlayers: 3,
  isPvP: false, combatType: 'PvE',
  attention: 'Active',
  levelReqs: { mining: 50, attack: 60 },
  skills_trained: ['mining', 'combat', 'prayer'],
  rewards: [
    'Deepstone amulet (+1 mining level underground, stacks)',
    'Molten dredge pet (1/3500)',
    'Dwarven mining helmet (built-in torch, never runs out)',
  ],
  unique_reward: 'Dwarven mining helmet — only permanent-light headpiece in Aelgard',
  reward_currency: 'deepstone_shards',
  shop: [
    { item: 'deepstone_amulet', cost: 2500 },
    { item: 'dwarven_mining_helm', cost: 4000 },
    { item: 'shaft_rope_coil', cost: 300 },
    { item: 'safety_pickaxe', cost: 1200 },
  ],
  stages: [
    { name: 'Floor 1: Coal',    type: 'mine_and_fight', floor: 1, enemy: 'coal_wraith' },
    { name: 'Floor 2: Iron',    type: 'mine_and_fight', floor: 2, enemy: 'iron_grub' },
    { name: 'Floor 3: Silver',  type: 'mine_and_fight', floor: 3, enemy: 'silvered_shade' },
    { name: 'Floor 4: Gold',    type: 'mine_and_fight', floor: 4, enemy: 'gilded_kobold' },
    { name: 'Floor 5: Mithril', type: 'mine_and_fight', floor: 5, enemy: 'mithril_spider' },
    { name: 'Floor 6: Molten',  type: 'boss',           floor: 6, enemy: 'molten_dredge' },
  ],
  description: 'A six-floor shaft. Each floor you must mine a quota AND defeat the tenant before the cage reopens. Failing a quota sends you back up one floor, not out.',
  voice_flavor: 'Dripping water counts the seconds. Your helmet lamp casts long shapes on the rock.',
  duration_estimate_min: 20,
});

rel.defineMinigame({
  id: 'sootworks_steam_titan',
  name: 'Steam Titan',
  region: 'Sootworks',
  location: 'Main Boiler (center of the forge floor)',
  template: 'skilling_boss',
  minPlayers: 3, maxPlayers: 12,
  isPvP: false, combatType: 'none',
  attention: 'Max Focus',
  levelReqs: { smithing: 70, crafting: 50, firemaking: 50 },
  skills_trained: ['smithing', 'crafting', 'firemaking', 'construction'],
  rewards: [
    'Titan-forged hammer (10% chance to double-smith, stackable consumable)',
    'Boiler key (permanent teleport to Main Boiler)',
    'Cog-wraith pet (1/4000)',
    'Riveted plate (unique crafting component, only boss drop)',
  ],
  unique_reward: 'Titan-forged hammer — only tool in Aelgard with a chance to double-produce bars per swing',
  reward_currency: 'steam_valves',
  shop: [
    { item: 'titan_hammer_charge', cost: 1800 },
    { item: 'boiler_key', cost: 6000 },
    { item: 'riveted_plate', cost: 2000 },
    { item: 'heat_shield_apron', cost: 1200 },
  ],
  stages: [
    { name: 'Patch',   type: 'skill_phase', skill: 'smithing',   target: 'Rivet leaking plates before pressure caps' },
    { name: 'Stoke',   type: 'skill_phase', skill: 'firemaking', target: 'Keep furnace temperature inside a narrow band' },
    { name: 'Fit',     type: 'skill_phase', skill: 'crafting',   target: 'Fit valve gaskets during low-pressure windows' },
    { name: 'Brace',   type: 'skill_phase', skill: 'construction', target: 'Reinforce brace struts before overload' },
    { name: 'Cooldown', type: 'finisher',   description: 'Survive the overpressure — no combat, all hands' },
  ],
  description: 'A twelve-meter iron giant that runs the whole forge. It does not attack; it overheats. Your job is to keep it stable. No combat stats matter — only smithing, firemaking, crafting, construction. The only multi-skill boss fight in the starter zone.',
  voice_flavor: 'A rising hum that fills the teeth. Steam sighs like a tired god.',
  duration_estimate_min: 18,
});

// ══════════════════════════════════════════════════════════════════════════════
// VEILWOOD (forest) — 3 minigames
// Templates: stealth, escort_protect, skilling_boss (alt)
// ══════════════════════════════════════════════════════════════════════════════

rel.defineMinigame({
  id: 'veilwood_poacher_rounds',
  name: 'Poacher Rounds',
  region: 'Veilwood',
  location: 'Old Ranger Post (north Veilwood, after Rangers\' Trust quest)',
  template: 'stealth',
  minPlayers: 1, maxPlayers: 4,
  isPvP: false, combatType: 'PvE',
  attention: 'Max Focus',
  levelReqs: { hunter: 45, thieving: 50, agility: 35 },
  questReqs: ['the_rangers_trust'],
  skills_trained: ['hunter', 'thieving', 'agility'],
  rewards: [
    'Ghillie cloak (unique: NPCs lose line of sight one tile earlier)',
    'Ranger whistle (recalls two random hunter trap contents)',
    'Lynx cub pet (1/2500)',
  ],
  unique_reward: 'Ghillie cloak — only item in Aelgard that reduces NPC LoS radius',
  reward_currency: 'ranger_marks',
  shop: [
    { item: 'ghillie_cloak', cost: 1400 },
    { item: 'ranger_whistle', cost: 700 },
    { item: 'quiet_step_soles', cost: 900 },
    { item: 'tracker_compass', cost: 300 },
  ],
  stages: [
    { name: 'Scout',   type: 'stealth', description: 'Tag every poacher camp without alerting them' },
    { name: 'Disarm',  type: 'stealth', description: 'Free trapped animals one at a time, within line-of-sight windows' },
    { name: 'Dossier', type: 'stealth', description: 'Slip past the ringleader to steal the contract scroll' },
  ],
  description: 'You do not fight poachers — you observe them. Each round is a two-hour mission condensed into ten minutes: tagging, disarming, lifting the evidence without ever being seen. Detection once = timer penalty. Twice = fail.',
  voice_flavor: 'Owl hoot overhead. Your breath clouds. A twig snaps that isn\'t yours.',
  duration_estimate_min: 12,
});

rel.defineMinigame({
  id: 'veilwood_temple_trek',
  name: 'Temple Trek',
  region: 'Veilwood',
  location: 'Sombrelight Chapel (southwest Veilwood)',
  template: 'escort_protect',
  minPlayers: 1, maxPlayers: 5,
  isPvP: false, combatType: 'PvE',
  attention: 'Active',
  levelReqs: { agility: 30, prayer: 28 },
  skills_trained: ['agility', 'prayer', 'herblore'],
  rewards: [
    'Sombrelight charm (halves prayer drain when escorting, passive)',
    'Pilgrim\'s staff (surface heal tick, single-charge daily)',
    'Chapel mouse pet (1/2000)',
  ],
  unique_reward: 'Sombrelight charm — only passive item that modifies prayer drain rate',
  reward_currency: 'lantern_lumen',
  shop: [
    { item: 'sombrelight_charm', cost: 1000 },
    { item: 'pilgrims_staff', cost: 700 },
    { item: 'bandage_kit', cost: 80 },
    { item: 'travel_cloak_heavy', cost: 400 },
  ],
  stages: [
    { name: 'Meet',  type: 'npc_start',   description: 'Pilgrim joins at the chapel. Their health bar is yours now.' },
    { name: 'Brook', type: 'path_hazard', hazards: ['bog_root', 'wisp_bite'] },
    { name: 'Grove', type: 'path_hazard', hazards: ['thorn_thicket', 'wolf_pack'] },
    { name: 'Ridge', type: 'path_hazard', hazards: ['falling_bough', 'frost_shade'] },
    { name: 'Shrine', type: 'objective', description: 'Deliver them alive to the shrine clearing' },
  ],
  description: 'Walk a frail pilgrim from the chapel to an upland shrine. They move slower than you. They will cough when a hazard is near. Branches from Saltbrine\'s Burgh de Rott Ramble — same framework, different climate.',
  voice_flavor: 'Wind in high needles. The pilgrim hums an old hymn you half recognize.',
  duration_estimate_min: 16,
});

rel.defineMinigame({
  id: 'veilwood_tears_of_the_grove',
  name: 'Tears of the Grove',
  region: 'Veilwood',
  location: 'Heartwood Weep (center of the Sacred Grove, once weekly)',
  template: 'skilling_boss',
  minPlayers: 1, maxPlayers: 1,
  isPvP: false, combatType: 'none',
  attention: 'Multitask',
  levelReqs: { woodcutting: 45 },
  skills_trained: ['any'],
  rewards: [
    'Weekly skill XP (player chooses lowest eligible skill, scaled)',
    'Grove sap (permanent untradeable healing item, 1 per week)',
    'Ancient acorn (tiny chance to grow a Heartwood sapling in your PoH)',
  ],
  unique_reward: 'Grove sap — only weekly untradeable panacea in Aelgard, cannot be farmed',
  reward_currency: 'tear_droplets',
  shop: [],
  stages: [
    { name: 'Collect', type: 'resource_gather', description: 'Draw tears into vials, three jars at once, switch as they fill' },
    { name: 'Choose',  type: 'skill_select',    description: 'Pick which skill drinks your collected tears' },
  ],
  description: 'Once per week (in-game week), the Heartwood weeps. Catch tears in three rotating jars. The tears convert into XP in a skill of your choosing — but always your lowest eligible skill benefits most. An unhurried, contemplative activity you cannot rush.',
  voice_flavor: 'Pines creak overhead like slow breathing. A single drop rings a glass jar.',
  duration_estimate_min: 20,
});

// ══════════════════════════════════════════════════════════════════════════════
// SALTBRINE (coast) — 3 minigames
// Templates: gather_craft_fight (trawler), role_based_team (nautical), delivery
// ══════════════════════════════════════════════════════════════════════════════

rel.defineMinigame({
  id: 'saltbrine_tide_trawl',
  name: 'Tide Trawl',
  region: 'Saltbrine',
  location: 'Saltbrine Pier (south pier, hourly boat)',
  template: 'gather_craft_fight',
  minPlayers: 3, maxPlayers: 15,
  isPvP: false, combatType: 'PvE',
  attention: 'Active',
  levelReqs: { fishing: 40, crafting: 30, smithing: 25 },
  skills_trained: ['fishing', 'crafting', 'smithing', 'firemaking'],
  rewards: [
    'Angler outfit (+2.5% fishing XP set bonus)',
    'Tempest bailing bucket (boat-mending only, permanent group tool)',
    'Heron pet (1/5000)',
    'Sealed chest (random high-tier fish + rare gem)',
  ],
  unique_reward: 'Angler outfit — only fishing-XP boost set in Aelgard',
  reward_currency: 'trawler_scales',
  shop: [
    { item: 'angler_hat', cost: 500 },
    { item: 'angler_top', cost: 800 },
    { item: 'angler_waders', cost: 600 },
    { item: 'angler_boots', cost: 400 },
    { item: 'tempest_bucket', cost: 1500 },
    { item: 'net_mending_kit', cost: 100 },
  ],
  stages: [
    { name: 'Gather',  type: 'gather', description: 'Pull nets, patch hull breaches, bail water all at once' },
    { name: 'Craft',   type: 'craft',  description: 'Forge hull patches from dredged scrap' },
    { name: 'Fend',    type: 'fight',  description: 'Fight off kraken pups that climb the hull' },
  ],
  description: 'A sinking boat, ten minutes, three emergencies at once. You can fish, mend, or fight — but never all three. Classic cooperative triage.',
  voice_flavor: 'Hull groan, gulls overhead, the captain swearing at the wheel.',
  duration_estimate_min: 10,
});

rel.defineMinigame({
  id: 'saltbrine_gale_crew',
  name: 'Gale Crew',
  region: 'Saltbrine',
  location: 'Gale Crew dockhouse (north harbour)',
  template: 'role_based_team',
  minPlayers: 4, maxPlayers: 4,
  isPvP: false, combatType: 'PvE',
  attention: 'Max Focus',
  levelReqs: { fishing: 50, sailing: 40 },
  skills_trained: ['fishing', 'sailing', 'combat'],
  rewards: [
    'Rigging gloves (role-locked: only helmsman can wear)',
    'Seahorn (recall boat, 1 charge daily, never degrades)',
    'Captain\'s hat (cosmetic, titled: "Captain <Name>")',
    'Krill pet (1/4500)',
  ],
  unique_reward: 'Seahorn — only item in Aelgard that teleports your ship, not your body',
  reward_currency: 'gale_coins',
  shop: [
    { item: 'rigging_gloves', cost: 900 },
    { item: 'seahorn', cost: 4000 },
    { item: 'captains_hat', cost: 2500 },
    { item: 'crow_nest_spyglass', cost: 700 },
    { item: 'harpoon_heavy', cost: 1200 },
  ],
  stages: [
    { name: 'Assign', type: 'role_pick', roles: ['Helmsman', 'Harpoonist', 'Sailmaster', 'Hold Boss'] },
    { name: 'Pursue', type: 'sail',      description: 'Chase a migrating pod of glow-whales' },
    { name: 'Strike', type: 'hunt',      description: 'Coordinated harpoon on the lead whale' },
    { name: 'Return', type: 'sail',      description: 'Sail back before a storm closes the bay' },
  ],
  description: 'A four-role hunt: Helmsman steers, Harpoonist strikes, Sailmaster trims, Hold Boss organizes catch. Each role has its own UI panel. No one can do two jobs. Sound-design heavy.',
  voice_flavor: 'Rope snaps taut. The harpoon sings through air. Someone yells "starboard!" wrong.',
  duration_estimate_min: 25,
});

rel.defineMinigame({
  id: 'saltbrine_courier_run',
  name: 'Courier Run',
  region: 'Saltbrine',
  location: 'Brine Post Office (harbour square)',
  template: 'delivery',
  minPlayers: 1, maxPlayers: 1,
  isPvP: false, combatType: 'PvE',
  attention: 'Active',
  levelReqs: { agility: 40, thieving: 35 },
  skills_trained: ['agility', 'thieving'],
  rewards: [
    'Courier sash (extra carry slots for stackable documents)',
    'Wax seal kit (lets player lock chests against 1 theft attempt)',
    'Swiftfoot boots (5% run-energy recovery bonus, coast only)',
    'Hermit crab pet (1/2500)',
  ],
  unique_reward: 'Wax seal kit — only player-usable lock mechanism for chests',
  reward_currency: 'postmark_tokens',
  shop: [
    { item: 'courier_sash', cost: 600 },
    { item: 'wax_seal_kit', cost: 1200 },
    { item: 'swiftfoot_boots', cost: 1400 },
    { item: 'lantern_signal', cost: 200 },
  ],
  stages: [
    { name: 'Sort',      type: 'puzzle',   description: 'Match letter addresses to postroutes' },
    { name: 'Run',       type: 'traverse', description: 'Hand-deliver along a parkour seafront route' },
    { name: 'Checkoff',  type: 'objective', description: 'Return the signed chits before the tide rolls in' },
  ],
  description: 'Letters, sealed packets, an urgent love note — all in your bag. Route them across the seafront. A pickpocket tries for your seal pouch every minute. Pure solo pressure mode.',
  voice_flavor: 'Gulls, horse hooves on planks, the clerk\'s bell.',
  duration_estimate_min: 8,
});

// ══════════════════════════════════════════════════════════════════════════════
// BONEYARD (desert) — 3 minigames
// Templates: battle_royale (sandstorm), tower_climbing (pyramid), stealth (tomb)
// ══════════════════════════════════════════════════════════════════════════════

rel.defineMinigame({
  id: 'boneyard_pyramid_plunder',
  name: 'Pyramid Plunder',
  region: 'Boneyard',
  location: 'Khardakh Pyramid (central Boneyard Wastes)',
  template: 'tower_climbing',
  minPlayers: 1, maxPlayers: 1,
  isPvP: false, combatType: 'PvE',
  attention: 'Max Focus',
  levelReqs: { thieving: 45, agility: 40 },
  skills_trained: ['thieving', 'agility'],
  rewards: [
    'Pharaoh\'s sceptre (unique teleport: 4 fixed desert locations, untradeable)',
    'Jewelled scarab (1 free pickpocket fail absorber per day)',
    'Golem key (unlocks deepest room, 1 charge)',
    'Shenanibis pet (1/3500)',
  ],
  unique_reward: 'Pharaoh\'s sceptre — only multi-destination teleport item in Aelgard with no rune cost',
  reward_currency: 'plunder_relics',
  shop: [
    { item: 'pharaohs_sceptre_charge', cost: 1500 },
    { item: 'jewelled_scarab', cost: 800 },
    { item: 'golem_key', cost: 2500 },
    { item: 'sandal_of_swiftness', cost: 1000 },
  ],
  stages: [
    { name: 'Antechamber', type: 'loot_room', difficulty: 1, timer_s: 30 },
    { name: 'Hallway',     type: 'loot_room', difficulty: 2, timer_s: 30 },
    { name: 'Burial Hall', type: 'loot_room', difficulty: 3, timer_s: 30 },
    { name: 'Vault',       type: 'loot_room', difficulty: 4, timer_s: 30 },
    { name: 'Sarcophagus', type: 'loot_room', difficulty: 5, timer_s: 30, boss_trap: 'mummy' },
  ],
  description: 'Five rooms. Each has four urns, a sarcophagus, and one or two traps. Loot as fast as possible. The mummy in room five wakes when you touch the sarcophagus — run or catch a sceptre-charge from the lucky haul.',
  voice_flavor: 'Dust falls through shafts of desert light. Something ancient shifts when you step.',
  duration_estimate_min: 3,
});

rel.defineMinigame({
  id: 'boneyard_sandstorm_arena',
  name: 'Sandstorm Arena',
  region: 'Boneyard',
  location: 'Basalt Ring (Boneyard southern flats, opens at duststorm)',
  template: 'battle_royale',
  minPlayers: 8, maxPlayers: 32,
  isPvP: true, combatType: 'PvP',
  attention: 'Max Focus',
  levelReqs: { attack: 60 },
  skills_trained: ['combat'],
  rewards: [
    'Dustcloak (+5% ranged accuracy inside sandstorms, flavor-locked)',
    'Basalt sigil (name title: "of the Ring")',
    'Sand jackal pet (1/6000)',
  ],
  unique_reward: 'Dustcloak — only weather-conditional accuracy modifier in Aelgard',
  reward_currency: 'basalt_chits',
  shop: [
    { item: 'dustcloak', cost: 3500 },
    { item: 'basalt_sigil', cost: 5000 },
    { item: 'sandwalker_boots', cost: 1800 },
    { item: 'replenishment_vial', cost: 250 },
  ],
  stages: [
    { name: 'Scatter', type: 'drop',   description: 'Parachute in from dunewagons, landed scattered' },
    { name: 'Scrap',   type: 'pvp',    description: '30 players, arena shrinks every 2 minutes with a sandstorm wall' },
    { name: 'Duel',    type: 'final',  description: 'Top 2 face off inside a basalt ring — arena locks' },
  ],
  description: 'A PvP battle royale in a dust ocean. Arena closes via an approaching sandstorm wall. The wall does damage. The dustcloak ONLY works during the shrinking phase. Rewards for win and for kills, separate currencies.',
  voice_flavor: 'Sand hissing through your teeth. You taste basalt.',
  duration_estimate_min: 15,
});

rel.defineMinigame({
  id: 'boneyard_tomb_creep',
  name: 'Tomb Creep',
  region: 'Boneyard',
  location: 'Nameless Tombs (eastern dunes)',
  template: 'stealth',
  minPlayers: 1, maxPlayers: 2,
  isPvP: false, combatType: 'PvE',
  attention: 'Max Focus',
  levelReqs: { thieving: 55, prayer: 30 },
  skills_trained: ['thieving', 'prayer'],
  rewards: [
    'Mask of Silence (halves footstep noise in tombs, permanent)',
    'Scarab of Deflection (1 ambush redirected per day)',
    'Tomb echo pet (1/3000)',
    'Papyrus of forgotten names (lore book reward for collection log)',
  ],
  unique_reward: 'Mask of Silence — only item that attenuates ingame footstep radius',
  reward_currency: 'tomb_whispers',
  shop: [
    { item: 'mask_of_silence', cost: 1600 },
    { item: 'scarab_deflection', cost: 1100 },
    { item: 'lockpick_fine', cost: 250 },
    { item: 'papyrus_scroll', cost: 50 },
  ],
  stages: [
    { name: 'Entry',   type: 'stealth', description: 'Slip past sentries that patrol in sight cones' },
    { name: 'Loot',    type: 'stealth', description: 'Lift six named relics without triggering runes' },
    { name: 'Exit',    type: 'stealth', description: 'Return — same path is now reversed and trapped' },
  ],
  description: 'A two-player stealth crawl. Line-of-sight cones are visible on the floor. Whispered comms matter — each footstep broadcasts. The only PvE stealth minigame that penalizes combat (attacking fails the run).',
  voice_flavor: 'Sand pouring through the narrow halls. Your heartbeat in your own ears.',
  duration_estimate_min: 14,
});

// ══════════════════════════════════════════════════════════════════════════════
// MORYSKAH (swamp) — 3 minigames
// Templates: escort_protect (Burgh-style), wave_survival (vyre), objective_defence
// ══════════════════════════════════════════════════════════════════════════════

rel.defineMinigame({
  id: 'moryskah_burgh_ramble',
  name: 'Burgh-de-Fen Ramble',
  region: 'Moryskah',
  location: 'Fen-Cairn crossroads (east Moryskah road)',
  template: 'escort_protect',
  minPlayers: 1, maxPlayers: 5,
  isPvP: false, combatType: 'PvE',
  attention: 'Active',
  levelReqs: { agility: 45, herblore: 40, combat_level: 60 },
  questReqs: ['the_fen_pilgrimage'],
  skills_trained: ['agility', 'herblore', 'combat'],
  rewards: [
    'Ivandis flail (+150% damage vs vyres, only effective anti-vyre weapon)',
    'Rod of ivandis (upgrade ingredient for the flail)',
    'Vyre noble garb (unique Moryskah infiltration disguise)',
    'Skulking drifter pet (1/4500)',
  ],
  unique_reward: 'Ivandis flail — only weapon in Aelgard with innate anti-vyre damage mult',
  reward_currency: 'fen_salt',
  shop: [
    { item: 'ivandis_flail_charge', cost: 2500 },
    { item: 'rod_of_ivandis', cost: 2000 },
    { item: 'vyre_noble_hat', cost: 1500 },
    { item: 'vyre_noble_top', cost: 2500 },
    { item: 'fen_bandage', cost: 80 },
  ],
  stages: [
    { name: 'Meet',     type: 'npc_start',  description: 'The Burgh townfolk gather — five villagers, one healer' },
    { name: 'Marsh',    type: 'path_hazard', hazards: ['fen_wight', 'gas_pocket'] },
    { name: 'Crossing', type: 'path_hazard', hazards: ['blood_hound', 'bone_mire'] },
    { name: 'Ruins',    type: 'combat_leg', description: 'Vyre patrols — keep villagers behind the tree line' },
    { name: 'Sanctum',  type: 'objective', description: 'Reach the sanctum with all villagers alive' },
  ],
  description: 'A Moryskah re-skin of Veilwood\'s temple trek but longer, darker, with active combat legs. Villagers will FIGHT poorly if you arm them — a core knob. Failing the escort mid-way lets you restart from the last waystone, not the start.',
  voice_flavor: 'Reed wind, distant wolves. One villager keeps humming a lullaby.',
  duration_estimate_min: 22,
});

rel.defineMinigame({
  id: 'moryskah_vyre_vigil',
  name: 'Vyre Vigil',
  region: 'Moryskah',
  location: 'Old Chapel of St. Vedra (abandoned, western fens)',
  template: 'wave_survival',
  minPlayers: 2, maxPlayers: 10,
  isPvP: false, combatType: 'PvE',
  attention: 'Max Focus',
  levelReqs: { attack: 70, prayer: 55 },
  skills_trained: ['combat', 'prayer'],
  rewards: [
    'Sanguine vestments (drain enemy HP as you hit, 5% per hit, moryskah only)',
    'Blessed stakes (one-shot vyre units, consumable)',
    'Wax chandelier pet (1/5000)',
    'Holy water vial (dispel effect on a single vyre per vigil)',
  ],
  unique_reward: 'Sanguine vestments — only lifesteal armor that is regionally bounded',
  reward_currency: 'vigil_candles',
  shop: [
    { item: 'sanguine_top', cost: 5000 },
    { item: 'sanguine_legs', cost: 5000 },
    { item: 'blessed_stakes_x10', cost: 600 },
    { item: 'holy_water_vial', cost: 300 },
  ],
  stages: [
    { name: 'Wave 1', type: 'wave', wave: 1, enemies: ['fledgling_vyre'] },
    { name: 'Wave 2', type: 'wave', wave: 2, enemies: ['vyre_hound'] },
    { name: 'Wave 3', type: 'wave', wave: 3, enemies: ['vyre_noble_minor'] },
    { name: 'Wave 4', type: 'wave', wave: 4, enemies: ['vyre_strigoi'] },
    { name: 'Wave 5', type: 'wave', wave: 5, enemies: ['vyre_count'] },
    { name: 'Dawn',   type: 'objective', description: 'Survive until dawn breaks through the broken rose window' },
  ],
  description: 'Hold the old chapel through five nightly waves. Dawn is the win condition, not kills. A single blessed torch must stay lit on the altar — if it goes out, all vyres gain armor. Requires one dedicated "torchkeeper" role.',
  voice_flavor: 'Stone echoes. A choir you can almost remember. Wings in the rafters.',
  duration_estimate_min: 18,
});

rel.defineMinigame({
  id: 'moryskah_reliquary_defence',
  name: 'Reliquary Defence',
  region: 'Moryskah',
  location: 'Grey Chapel of St. Anska',
  template: 'objective_defence',
  minPlayers: 3, maxPlayers: 10,
  isPvP: false, combatType: 'PvE',
  attention: 'Max Focus',
  levelReqs: { prayer: 60, construction: 50 },
  skills_trained: ['combat', 'prayer', 'construction'],
  rewards: [
    'Reliquary shield (auto-block on prayer, 1 proc per 3 minutes)',
    'Ward-stone (deployable barrier, single-use, 40 HP)',
    'Relic-polished coin (tradeable currency but cosmetic-only)',
    'Chapel cat pet (1/4000)',
  ],
  unique_reward: 'Reliquary shield — only shield with an auto-prayer-based damage block',
  reward_currency: 'sanctum_marks',
  shop: [
    { item: 'reliquary_shield', cost: 4500 },
    { item: 'ward_stone', cost: 800 },
    { item: 'consecration_oil', cost: 300 },
    { item: 'ossuary_key', cost: 1500 },
  ],
  stages: [
    { name: 'Fortify', type: 'build',  description: 'Reinforce windows with pew boards and ward-stones' },
    { name: 'Wave',    type: 'wave',   description: 'Three undead waves try to breach the sanctum' },
    { name: 'Rite',    type: 'prayer', description: 'Complete a consecration rite while enemies crash the doors' },
  ],
  description: 'You protect the relic, not the building. If the building falls but the relic remains, you win. A construction + prayer rite in the center, combat roles on the perimeter, and a timer.',
  voice_flavor: 'Incense heavy in the throat. Hands on candle wax drip. The door groans.',
  duration_estimate_min: 14,
});

// ══════════════════════════════════════════════════════════════════════════════
// GLASS DESERT (endgame) — 4 minigames
// Templates: gather_craft_fight (Stealing Creation), wave_survival (Nightmare Zone),
// duel_1v1 (TzHaar Fight Pits), tower_climbing (Mage Training Arena)
// ══════════════════════════════════════════════════════════════════════════════

rel.defineMinigame({
  id: 'glass_desert_shardforge',
  name: 'Shardforge',
  region: 'Glass Desert',
  location: 'The Last Glassworks (Glass Desert high dunes)',
  template: 'gather_craft_fight',
  minPlayers: 6, maxPlayers: 20,
  isPvP: true, combatType: 'Both',
  attention: 'Max Focus',
  levelReqs: { crafting: 70, smithing: 70, attack: 70, magic: 70 },
  skills_trained: ['crafting', 'smithing', 'combat'],
  rewards: [
    'Volatile blade (+25% damage in first 30s of a fight, decays)',
    'Elemental sand (stacks to craft a unique Glass spell focus)',
    'Shardforge anvil token (PoH decoration, grants unique craft emote)',
    'Emberling pet (1/5500)',
  ],
  unique_reward: 'Volatile blade — only weapon whose effect decays by duration in a fight',
  reward_currency: 'forge_fragments',
  shop: [
    { item: 'volatile_blade', cost: 8000 },
    { item: 'elemental_sand_x25', cost: 500 },
    { item: 'shardforge_anvil_token', cost: 2500 },
    { item: 'glass_focus', cost: 4500 },
  ],
  stages: [
    { name: 'Gather',  type: 'gather', description: 'Mine elemental sand, harvest volatile ores' },
    { name: 'Craft',   type: 'craft',  description: 'Forge weapons & armor that ONLY work this match' },
    { name: 'Fight',   type: 'pvp',    description: 'Two teams PvP with their crafted arsenal' },
  ],
  description: 'A three-phase reset minigame: two teams race to gather + craft + fight. All crafted items evaporate at match end. Points accrue from kills and successful captures of opponent sand. Nothing is retained except currency and reputation.',
  voice_flavor: 'Kiln roar. Glass snapping. The air above the dune line shimmers.',
  duration_estimate_min: 30,
});

rel.defineMinigame({
  id: 'glass_desert_mirage_zone',
  name: 'Mirage Zone',
  region: 'Glass Desert',
  location: 'Mirage Gate (southern Glass Desert)',
  template: 'wave_survival',
  minPlayers: 1, maxPlayers: 1,
  isPvP: false, combatType: 'PvE',
  attention: 'Multitask',
  levelReqs: { combat_level: 90 },
  skills_trained: ['combat'],
  rewards: [
    'Mirage vials (stat-boost potions with unique decay behaviors)',
    'Prayer-preserving amulet (stacks with regen-refresh, endgame only)',
    'Replica boss trophies (cosmetic PoH plaques)',
    'Dreamshade pet (1/6000)',
  ],
  unique_reward: 'Mirage vials — only potions in Aelgard whose effect duration varies by combat stat total',
  reward_currency: 'mirage_points',
  shop: [
    { item: 'mirage_absorption_potion', cost: 400 },
    { item: 'mirage_overload_potion', cost: 1200 },
    { item: 'prayer_preserve_amulet', cost: 7500 },
    { item: 'boss_trophy_replica', cost: 2500 },
  ],
  stages: [
    { name: 'Select', type: 'boss_select', description: 'Choose 3-5 previously defeated bosses to summon as mirages' },
    { name: 'Storm',  type: 'wave_endless', description: 'They all spawn together and again and again' },
    { name: 'Cap',    type: 'timer',       description: 'Survive until timer ends or you die' },
  ],
  description: 'You re-fight bosses you have ALREADY defeated. No pet drops, no gear drops — only points. A training ground for maxed players, and the only source of Mirage vials.',
  voice_flavor: 'Air shimmers wrong. A familiar roar from a boss you buried last month.',
  duration_estimate_min: 30,
});

rel.defineMinigame({
  id: 'glass_desert_glass_pit',
  name: 'The Glass Pit',
  region: 'Glass Desert',
  location: 'Coliseum in the Shattered Expanse',
  template: 'duel_1v1',
  minPlayers: 2, maxPlayers: 2,
  isPvP: true, combatType: 'PvP',
  attention: 'Max Focus',
  levelReqs: {},
  skills_trained: ['combat'],
  rewards: [
    'Pit champion sash (unique title "Champion of the Pit")',
    'Glass-tusk tooth (consumable adrenaline 1-hit boost)',
    'Pit spectator ticket (spectating reward: 25 XP lamp)',
  ],
  unique_reward: 'Pit champion sash — only title-granting sash in Aelgard',
  reward_currency: 'pit_crystal_chips',
  shop: [
    { item: 'pit_champion_sash', cost: 10000 },
    { item: 'glass_tusk_tooth', cost: 300 },
    { item: 'spectator_ticket', cost: 50 },
  ],
  stages: [
    { name: 'Rules',   type: 'negotiate',  description: 'Duel rules toggle screen — 11 options' },
    { name: 'Wager',   type: 'stake',      description: 'Optional wager with 1% tax' },
    { name: 'Fight',   type: 'duel',       description: 'Single combat until KO' },
  ],
  description: 'A 1v1 arena with full Duel Arena rule toggles (no melee, no prayer, no movement, obstacles, etc). Optional wager with 1% sink. Spectators pay to watch — they earn a small XP lamp from top matches.',
  voice_flavor: 'A whispered crowd. The pit-floor glass chimes as you step.',
  duration_estimate_min: 7,
});

rel.defineMinigame({
  id: 'glass_desert_mage_trial_spire',
  name: 'Mage Trial Spire',
  region: 'Glass Desert',
  location: 'Spire of the Glass Mage (obelisk, western Glass Desert)',
  template: 'tower_climbing',
  minPlayers: 1, maxPlayers: 1,
  isPvP: false, combatType: 'none',
  attention: 'Max Focus',
  levelReqs: { magic: 66, runecrafting: 55, crafting: 50 },
  skills_trained: ['magic', 'runecrafting', 'crafting'],
  rewards: [
    'Mage\'s book (unique spellbook: 4 extra utility spells no other book has)',
    'Infinity robes (unique +magic set, Glass-desert only)',
    'Hat of the arcane (pet-chance multiplier for magic training)',
    'Beacon ring pet (1/5500)',
  ],
  unique_reward: "Mage's book — only item in Aelgard granting 4 unique spells",
  reward_currency: 'pizzazz_points',
  shop: [
    { item: 'mages_book', cost: 12000 },
    { item: 'infinity_hat', cost: 1500 },
    { item: 'infinity_top', cost: 3000 },
    { item: 'infinity_legs', cost: 2500 },
    { item: 'infinity_boots', cost: 1500 },
    { item: 'infinity_gloves', cost: 1500 },
  ],
  rooms: [
    { id: 1, name: 'Telekinetic Theatre', type: 'puzzle', skill: 'magic',      description: 'Move statues across no-step tiles via telekinesis' },
    { id: 2, name: 'Alchemist\'s Chamber', type: 'puzzle', skill: 'magic',      description: 'Alch chosen items for points under AFK detection' },
    { id: 3, name: 'Enchantment Lattice',  type: 'puzzle', skill: 'runecrafting', description: 'Enchant correct jewelry while lattice rotates' },
    { id: 4, name: 'Graveyard of Runes',   type: 'puzzle', skill: 'crafting',   description: 'Craft runes against shade bosses who flee when hit by wrong element' },
  ],
  description: 'Four themed puzzle rooms. Enter one per visit, or roll the lattice to enter all four. Each room feeds a different currency track. The Mage\'s book is the ONLY uncontestable reason to ever come here.',
  voice_flavor: 'Glass wind chimes in a language you almost know.',
  duration_estimate_min: 25,
});

// ══════════════════════════════════════════════════════════════════════════════
// INKWEALD (dream rift) — 3 minigames
// Templates: gather_craft_fight (ensouled lattice), duel_1v1 (dream), stealth
// ══════════════════════════════════════════════════════════════════════════════

rel.defineMinigame({
  id: 'inkweald_dream_duelling',
  name: 'Dream Duelling',
  region: 'Inkweald',
  location: 'Reverie Colosseum (floating dream islet)',
  template: 'duel_1v1',
  minPlayers: 2, maxPlayers: 2,
  isPvP: true, combatType: 'PvP',
  attention: 'Max Focus',
  levelReqs: { magic: 60 },
  skills_trained: ['magic', 'combat'],
  rewards: [
    'Reverie cape (equip-only in dream zones, unique stat allotment)',
    'Dream gem (one-shot re-roll of a chosen combat action per day)',
    'Moth pet (1/4000)',
  ],
  unique_reward: 'Dream gem — only player ability that re-rolls a single combat action',
  reward_currency: 'reverie_shards',
  shop: [
    { item: 'reverie_cape', cost: 2500 },
    { item: 'dream_gem', cost: 900 },
    { item: 'lucid_charm', cost: 1600 },
    { item: 'hypnagogic_dust', cost: 200 },
  ],
  stages: [
    { name: 'Dream', type: 'zone_enter', description: 'Both players enter a shared dream map' },
    { name: 'Duel',  type: 'pvp_ability', description: 'Players gain rotating dream abilities at 30/60/90 seconds' },
    { name: 'Wake',  type: 'end',        description: 'KO or timer — neither keeps any item from the dream' },
  ],
  description: 'A PvP duel where neither player keeps any on-loss cost because the fight is a dream. Wager-locked to reverie_shards only. Unique rotating dream abilities inject per-fight randomness.',
  voice_flavor: 'Your own heartbeat in slow motion. Someone laughing three rooms away.',
  duration_estimate_min: 8,
});

rel.defineMinigame({
  id: 'inkweald_ensouled_lattice',
  name: 'Ensouled Lattice',
  region: 'Inkweald',
  location: 'Whispering Lattice (southeast Inkweald floodplain)',
  template: 'gather_craft_fight',
  minPlayers: 4, maxPlayers: 16,
  isPvP: true, combatType: 'Both',
  attention: 'Max Focus',
  levelReqs: { prayer: 55, crafting: 60, magic: 60 },
  skills_trained: ['prayer', 'crafting', 'magic', 'combat'],
  rewards: [
    'Soul lantern (lights a 3x3 area perpetually — only area-light in Aelgard)',
    'Ensouled bark (craft exclusive prayer-renewing spear)',
    'Dream moth swarm pet (1/5500)',
    'Lattice cipher scroll (collection log)',
  ],
  unique_reward: 'Soul lantern — only 3x3 permanent area-light in Aelgard',
  reward_currency: 'lattice_threads',
  shop: [
    { item: 'soul_lantern', cost: 4000 },
    { item: 'ensouled_spear_blueprint', cost: 3000 },
    { item: 'ensouled_bark_x5', cost: 250 },
    { item: 'prayer_renewal_mix', cost: 600 },
  ],
  stages: [
    { name: 'Harvest', type: 'gather', description: 'Pull dream-souls into bark vessels' },
    { name: 'Forge',   type: 'craft',  description: 'Weave vessels into short-lived weapons' },
    { name: 'Clash',   type: 'pvp',    description: 'Two teams skirmish — one tries to extinguish enemy core' },
  ],
  description: 'A re-skinned stealing-creation / gather-craft-fight in a living forest. Souls, not ore. Vessels, not bars. Teams build and clash — dream weapons dissolve when matches end.',
  voice_flavor: 'Moths fluttering across your vision. Every twig sings a single note.',
  duration_estimate_min: 25,
});

rel.defineMinigame({
  id: 'inkweald_whisperstep',
  name: 'Whisperstep',
  region: 'Inkweald',
  location: 'Dream Rift boundary (night only)',
  template: 'stealth',
  minPlayers: 1, maxPlayers: 1,
  isPvP: false, combatType: 'PvE',
  attention: 'Max Focus',
  levelReqs: { thieving: 65, agility: 60 },
  skills_trained: ['thieving', 'agility'],
  rewards: [
    'Shadow cloak (unique: invisible to dream guardians entirely)',
    'Silentfoot oil (one-use silent run for 60s)',
    'Nocturna pet (1/3500)',
    'Dream tome page (1 of 10 for the Inkweald codex)',
  ],
  unique_reward: 'Shadow cloak — only gear that grants categorical invisibility to a single NPC class',
  reward_currency: 'silent_feathers',
  shop: [
    { item: 'shadow_cloak', cost: 5000 },
    { item: 'silentfoot_oil', cost: 250 },
    { item: 'dream_tome_page', cost: 200 },
    { item: 'whispered_lockpick', cost: 800 },
  ],
  stages: [
    { name: 'Boundary', type: 'stealth', description: 'Cross the first ring without waking the guardians' },
    { name: 'Garden',   type: 'stealth', description: 'Lift moth-locked keys from sleeping dreamers' },
    { name: 'Archive',  type: 'stealth', description: 'Memorize one codex page and carry it out' },
  ],
  description: 'A solo stealth circuit through the dream boundary. No combat allowed; the moment you draw a weapon the entire rift closes. Every run you memorize one codex page — 10 pages unlock a unique spell.',
  voice_flavor: 'You can hear your own thoughts echo. The moths know your name.',
  duration_estimate_min: 18,
});

// ══════════════════════════════════════════════════════════════════════════════
// WILDS (PvP) — 4 minigames
// Templates: capture_the_flag (Soul Wars), objective_defence (Clan Wars portal),
// role_based_team (commander set), prop_hunt
// ══════════════════════════════════════════════════════════════════════════════

rel.defineMinigame({
  id: 'wilds_shard_wars',
  name: 'Shard Wars',
  region: 'Wilds',
  location: 'Ruined Bastion (central Wilds)',
  template: 'capture_the_flag',
  minPlayers: 10, maxPlayers: 100,
  isPvP: true, combatType: 'Both',
  attention: 'Max Focus',
  levelReqs: {},
  skills_trained: ['combat', 'prayer'],
  rewards: [
    'Soul-shard (redeemable for +1 level of the player\'s chosen skill, 99 cap)',
    'Ectoplasm bucket (unique PoH construction ingredient)',
    'Shardbearer cape (unique cape: absorbs 1 Wilds death annually)',
    'Banshee pet (1/5000)',
  ],
  unique_reward: 'Soul-shard — only in-game currency that converts 1:1 into XP at any level',
  reward_currency: 'soul_shard_tokens',
  shop: [
    { item: 'soul_shard_xp_lamp', cost: 2500 },
    { item: 'shardbearer_cape', cost: 9000 },
    { item: 'ectoplasm_bucket', cost: 400 },
    { item: 'banshee_whistle', cost: 700 },
  ],
  stages: [
    { name: 'Muster',   type: 'spawn',   description: 'Teams spawn at west/east bastions' },
    { name: 'Soul',     type: 'gather',  description: 'Kill Avatar to bind soul fragments to your team' },
    { name: 'Capture',  type: 'flag',    description: 'Steal opposing altar\'s shard and return home' },
    { name: 'Victory',  type: 'end',     description: 'Most captures in 20 minutes wins' },
  ],
  description: 'Two armies, one ritual altar each, soul fragments as the "flag". A PvP free-for-all with a central Avatar NPC that buffs whichever side feeds it more kills. The only avenue for soul-shard → XP conversion.',
  voice_flavor: 'Distant drums. The altar hums as a shard arrives.',
  duration_estimate_min: 25,
});

rel.defineMinigame({
  id: 'wilds_fortress_siege',
  name: 'Fortress Siege',
  region: 'Wilds',
  location: 'Blackiron Bastion (north Wilds)',
  template: 'objective_defence',
  minPlayers: 10, maxPlayers: 40,
  isPvP: true, combatType: 'Both',
  attention: 'Max Focus',
  levelReqs: { combat_level: 80 },
  skills_trained: ['combat', 'construction'],
  rewards: [
    'Seige-smith plate (unique body armor: +stat when inside claimed fortress)',
    'Blackiron banner (place to mark a PoH wall art trophy)',
    'Clan commander horn (broadcasts quick rally command to clanmates in Wilds)',
    'Iron gryphon pet (1/4500)',
  ],
  unique_reward: 'Seige-smith plate — only location-conditional stat bonus body armor in Aelgard',
  reward_currency: 'siege_coins',
  shop: [
    { item: 'seige_smith_top', cost: 8500 },
    { item: 'clan_commander_horn', cost: 3500 },
    { item: 'blackiron_banner', cost: 2500 },
    { item: 'ballista_bolt_x5', cost: 150 },
  ],
  stages: [
    { name: 'Prep',  type: 'build', description: 'Defenders set up ballistae, ward-stones, portcullis' },
    { name: 'Siege', type: 'combat', description: 'Attackers drive siege engines against walls' },
    { name: 'Hold',  type: 'objective', description: 'Defenders keep the banner standing 15 minutes' },
  ],
  description: 'Two asymmetric teams: defenders build and hold, attackers drive rams and walk through. The banner in the keep is the win con. Siege-engines are crafted live — construction matters as much as combat.',
  voice_flavor: 'Timber cracks. A ram-drum counting.',
  duration_estimate_min: 25,
});

rel.defineMinigame({
  id: 'wilds_clan_wars_roles',
  name: 'Clan Wars: Roles',
  region: 'Wilds',
  location: 'Neutral arena (PvP portal, south Wilds)',
  template: 'role_based_team',
  minPlayers: 6, maxPlayers: 12,
  isPvP: true, combatType: 'PvP',
  attention: 'Max Focus',
  levelReqs: { combat_level: 70 },
  skills_trained: ['combat', 'prayer', 'herblore'],
  rewards: [
    'Role-crest pieces (unique cosmetic cape, 6-piece)',
    'Champion brew (one-use revive potion in Wilds, limit 1 daily)',
    'Warhorn (Clan Hall trophy)',
  ],
  unique_reward: 'Champion brew — only in-game Wilds revive item (one-per-day)',
  reward_currency: 'warcoin',
  shop: [
    { item: 'champion_brew', cost: 1500 },
    { item: 'role_crest_attacker', cost: 1000 },
    { item: 'role_crest_tank', cost: 1000 },
    { item: 'role_crest_healer', cost: 1000 },
    { item: 'role_crest_mage', cost: 1000 },
    { item: 'role_crest_ranger', cost: 1000 },
    { item: 'role_crest_commander', cost: 1500 },
  ],
  stages: [
    { name: 'Assign',  type: 'role_pick', roles: ['Attacker', 'Tank', 'Healer', 'Mage', 'Ranger', 'Commander'] },
    { name: 'Rounds',  type: 'multi_round', description: 'Best of 3 rounds, role-swap allowed between' },
    { name: 'Victory', type: 'end' },
  ],
  description: 'Structured PvP for teams ready to focus. Every player picks a distinct role (no duplicates). Commander has no combat stats — just a whistle and an overview minimap. Pure tactical layer.',
  voice_flavor: 'The Commander\'s horn cuts through the din.',
  duration_estimate_min: 18,
});

rel.defineMinigame({
  id: 'wilds_prop_hunt',
  name: 'Wilderness Prop Hunt',
  region: 'Wilds',
  location: 'Wilderness Ruins (south Wilds, moonlit only)',
  template: 'stealth',
  minPlayers: 4, maxPlayers: 12,
  isPvP: true, combatType: 'PvP',
  attention: 'Max Focus',
  levelReqs: {},
  skills_trained: ['thieving'],
  rewards: [
    'Prop glamour charm (player can appear as a chosen prop for 20s, any zone)',
    'Hunter\'s whistle (globally recognized cosmetic title "The Hunter")',
    'Squirrel pet (1/3000)',
  ],
  unique_reward: 'Prop glamour charm — only item that lets you appear as an interactive prop',
  reward_currency: 'prop_tokens',
  shop: [
    { item: 'prop_glamour_charm', cost: 3000 },
    { item: 'hunters_whistle', cost: 1200 },
    { item: 'squirrel_nut', cost: 100 },
  ],
  stages: [
    { name: 'Disguise', type: 'prop_choose', description: 'Hiders select a prop shape from the arena' },
    { name: 'Hide',     type: 'hide_phase',  description: 'Freeze into place or relocate subtly' },
    { name: 'Hunt',     type: 'seek_phase',  description: 'Seekers click on suspected props' },
  ],
  description: 'Hiders disguise as physical objects scattered through ruined walls and braziers. Seekers right-click suspicious candles and urns. Correctly guessed hiders swap to seeker team. Last hider wins.',
  voice_flavor: 'Quiet. Too quiet. Then a wrong shuffle.',
  duration_estimate_min: 10,
});

// ══════════════════════════════════════════════════════════════════════════════
// CROSS-REGION / FLOATING — 2 minigames
// Templates: board_game (travelling), ccg (collectible cards)
// ══════════════════════════════════════════════════════════════════════════════

rel.defineMinigame({
  id: 'aelgard_travelling_market',
  name: 'Travelling Market',
  region: 'Heartlands',
  location: 'Moves on a weekly schedule: Heartlands → Saltbrine → Boneyard → Veilwood → Moryskah → Inkweald',
  template: 'delivery',
  minPlayers: 1, maxPlayers: 1,
  isPvP: false, combatType: 'none',
  attention: 'Background',
  levelReqs: {},
  skills_trained: ['agility'],
  rewards: [
    'Market stall permit (PoH: lets you host your own market stall, 1-day cooldown)',
    'Caravan token (one-time long-range teleport to any travelling market location)',
    'Travelling mouse pet (1/4500)',
  ],
  unique_reward: 'Market stall permit — only player-owned shopfront system in Aelgard',
  reward_currency: 'wayfare_chits',
  shop: [
    { item: 'market_stall_permit', cost: 3500 },
    { item: 'caravan_token', cost: 600 },
    { item: 'pamphlet_bundle', cost: 50 },
  ],
  stages: [
    { name: 'Meet',     type: 'delivery', description: 'Pick up packages on Monday from the caravan' },
    { name: 'Deliver',  type: 'delivery', description: 'Hand them off at each stop mid-week' },
    { name: 'Return',   type: 'delivery', description: 'Return signed logs on Saturday' },
  ],
  description: 'A weekly delivery loop that walks with the travelling merchants. Each day you meet the caravan at a new city and forward its packages. Pure background work, high reputation payoff.',
  voice_flavor: 'Wagon wheels crunching, dogs barking two villages away.',
  duration_estimate_min: 6,
});

rel.defineMinigame({
  id: 'aelgard_sigil_stories',
  name: 'Sigil Stories',
  region: 'Heartlands',
  location: 'Sigil parlors: 6 city taverns (cards travel with the player)',
  template: 'board_game',
  minPlayers: 2, maxPlayers: 2,
  isPvP: true, combatType: 'none',
  attention: 'Multitask',
  levelReqs: {},
  skills_trained: [],
  rewards: [
    'Sigil card packs (drop from bosses, quest rewards, shop buy)',
    'Ranked sigil rank (per-season rank title: Steel → Silver → Gold → Obsidian)',
    'Obsidian deck box (cosmetic: glowing deck holder for PoH)',
    'Sigil card sleeves (100+ cosmetic sleeves tied to world achievements)',
  ],
  unique_reward: 'Obsidian rank — only PvP progression track that is entirely non-combat',
  reward_currency: 'parlor_chips',
  shop: [
    { item: 'sigil_booster_pack', cost: 200 },
    { item: 'obsidian_deck_box', cost: 4000 },
    { item: 'card_sleeve_random', cost: 300 },
  ],
  stages: [
    { name: 'Draw',    type: 'card_phase', description: 'Players draw 5 cards from their deck' },
    { name: 'Play',    type: 'card_phase', description: 'Alternate turns placing sigils' },
    { name: 'Resolve', type: 'card_phase', description: 'Sigils fire in priority order' },
  ],
  description: 'A portable collectible card game played in taverns and on benches. Cards drop from bosses, quests, rare gathers. Deck-building, ranked matchmaking, season rotations — an entire second game bolted beside the main one.',
  voice_flavor: 'Cards slapping the bar. Someone quietly whistles.',
  duration_estimate_min: 12,
});

// ══════════════════════════════════════════════════════════════════════════════
// VEILWOOD extra — gnomish delivery (time-pressure food)
// ══════════════════════════════════════════════════════════════════════════════

rel.defineMinigame({
  id: 'veilwood_canopy_kitchen',
  name: 'Canopy Kitchen',
  region: 'Veilwood',
  location: 'Canopy Kitchen tree-balcony (upper Veilwood)',
  template: 'delivery',
  minPlayers: 1, maxPlayers: 1,
  isPvP: false, combatType: 'none',
  attention: 'Max Focus',
  levelReqs: { cooking: 55, agility: 40 },
  skills_trained: ['cooking', 'agility'],
  rewards: [
    'Chef\'s hat of speed (2% faster cook tick)',
    'Dual-tray pack (carry 2 dishes without stacking penalties)',
    'Tipjar pet (1/4000)',
    'Menu master token (unlock canopy-only recipes, permanent)',
  ],
  unique_reward: 'Menu master token — unlocks 12 recipes that exist nowhere else',
  reward_currency: 'canopy_tips',
  shop: [
    { item: 'chefs_hat_speed', cost: 1200 },
    { item: 'dual_tray', cost: 700 },
    { item: 'menu_master_token', cost: 3500 },
    { item: 'tipjar_pouch', cost: 300 },
  ],
  stages: [
    { name: 'Order',    type: 'ticket',   description: 'Customers shout orders — memorize' },
    { name: 'Cook',     type: 'cook',     description: 'Prepare dishes in correct order' },
    { name: 'Deliver',  type: 'traverse', description: 'Balcony parkour to the correct canopy seat' },
  ],
  description: 'A frantic food delivery game. Orders queue in spoken audio. Wrong seat = tip lost. Balcony platforms rotate over the trunk. You can never quite catch the pace — but you can rank against the weekly board.',
  voice_flavor: 'Clatter of tray-glass, chipper fiddle, a child asking when their pie is coming.',
  duration_estimate_min: 8,
});

// ══════════════════════════════════════════════════════════════════════════════
// BONEYARD extra — rogues' den parkour-thieving
// ══════════════════════════════════════════════════════════════════════════════

rel.defineMinigame({
  id: 'boneyard_rogue_warrens',
  name: 'Rogue Warrens',
  region: 'Boneyard',
  location: 'Warrens tunnel (hidden oasis, northeast Boneyard)',
  template: 'obstacle_course',
  minPlayers: 1, maxPlayers: 1,
  isPvP: false, combatType: 'none',
  attention: 'Max Focus',
  levelReqs: { thieving: 55, agility: 50 },
  skills_trained: ['thieving', 'agility'],
  rewards: [
    'Rogue\'s kit (unique outfit — 50% chance to double loot from all pickpockets)',
    'Lockpick master (unique untradeable: never breaks on failed pick)',
    'Warrens lynx pet (1/3500)',
  ],
  unique_reward: "Rogue's kit — only outfit that doubles pickpocket loot output",
  reward_currency: 'warren_marks',
  shop: [
    { item: 'rogues_mask', cost: 800 },
    { item: 'rogues_top', cost: 1200 },
    { item: 'rogues_legs', cost: 1200 },
    { item: 'rogues_boots', cost: 800 },
    { item: 'rogues_gloves', cost: 800 },
    { item: 'lockpick_master', cost: 2500 },
  ],
  stages: [
    { name: 'Entry',   type: 'parkour',    description: 'Climb/slide through 6 trap-laden halls' },
    { name: 'Vault',   type: 'safecrack',  description: 'Crack the Warrens safe without tripping pressure plates' },
    { name: 'Escape',  type: 'parkour',    description: 'Reverse the path before the Warren Warden wakes' },
  ],
  description: 'A solo parkour-thieving course. Every platform can crumble, every lock has a tell. One mistake drops you to the starter tier. The top-10 weekly list posts on the Boneyard noticeboard.',
  voice_flavor: 'Sand hissing. Cold silver lockplates. Somewhere a dog lifts an ear.',
  duration_estimate_min: 9,
});

// ══════════════════════════════════════════════════════════════════════════════
// HEARTLANDS extra — social battle royale (cozy FFA duel)
// ══════════════════════════════════════════════════════════════════════════════

rel.defineMinigame({
  id: 'heartlands_hayfield_duels',
  name: 'Hayfield Duels',
  region: 'Heartlands',
  location: 'East hayfield (across the wheat gate)',
  template: 'duel_1v1',
  minPlayers: 2, maxPlayers: 2,
  isPvP: true, combatType: 'PvP',
  attention: 'Active',
  levelReqs: {},
  skills_trained: ['combat'],
  rewards: [
    'Hayfield champion sash (bronze → silver → gold tiered)',
    'Straw hat of champion (cosmetic headpiece, rank-locked)',
    'Paper-target puppet (PoH training dummy, unique)',
  ],
  unique_reward: 'Paper-target puppet — only PoH training dummy that respawns instantly',
  reward_currency: 'hay_chips',
  shop: [
    { item: 'hayfield_sash_bronze', cost: 500 },
    { item: 'hayfield_sash_silver', cost: 1500 },
    { item: 'hayfield_sash_gold', cost: 3500 },
    { item: 'paper_target_puppet', cost: 2500 },
    { item: 'straw_hat_champ', cost: 900 },
  ],
  stages: [
    { name: 'Rules',  type: 'toggle_pick',  description: 'Pick from Heartlands-safe rule presets' },
    { name: 'Duel',   type: 'fight',        description: 'First to 3 knockdowns' },
    { name: 'Bow',    type: 'emote',        description: 'Winner bows; losing player forfeits ribbon' },
  ],
  description: 'A beginner-friendly duel field with safe deaths, no wagers, and a cozy tone. Every farmhand has an opinion on who will win. First to 3 knockdowns takes the sash. A pure on-ramp to PvP for Heartlands locals.',
  voice_flavor: 'Wheat swishing, children counting down, someone\'s mother yelling "be careful."',
  duration_estimate_min: 6,
});

// ══════════════════════════════════════════════════════════════════════════════
// STATS
// ══════════════════════════════════════════════════════════════════════════════

console.log(`[aelgard] minigames-mega loaded (${rel.listMinigames().length} total minigames registered)`);

module.exports = {
  // no local registry — all content registered via rel.defineMinigame
};
