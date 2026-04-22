// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Quest Mega-Expansion
// 50 new quests bringing total to ~130.
// Categories:
//   1. Novice quests (10): early game, teach mechanics, 3-5 steps
//   2. Intermediate quests (15): mid game, 2+ regions, 5-7 steps
//   3. Experienced quests (12): late mid game, 3+ regions, 6-8 steps, bosses
//   4. Master quests (8): endgame, 3+ regions, 8-10 steps, hard bosses
//   5. Grandmaster quests (5): ultimate challenges, 4+ regions, 8-12 steps
//
// All 23 skills represented. No "kill 10 boars" quests. Every quest gates a
// breakpoint (area, item, ability, shortcut). Every quest is a journey.
// ══════════════════════════════════════════════════════════════════════════════

const quests = require('../../data/quests');

// ══════════════════════════════════════════════════════════════════════════════
// NOVICE QUESTS (10) — early game, teach mechanics
// ══════════════════════════════════════════════════════════════════════════════

// ── 1. The Runaway Golem ─────────────────────────────────────────────────────
// Region: Heartlands → Sootworks border
// Teaches: basic combat + crafting + mining interaction
// Gates: access to the Sootworks border mine shortcut
quests.define('the_runaway_golem', {
  name: 'The Runaway Golem',
  description: 'A dwarven apprentice\'s training golem has escaped from the Sootworks border workshop and is terrorizing Heartlands cattle. The golem isn\'t evil — just broken. Fix it or fight it.',
  difficulty: 'Novice',
  questPoints: 1,
  requirements: { skills: { attack: 5, mining: 5, crafting: 5 } },
  steps: [
    { text: 'Talk to Apprentice Nolly at the Heartlands eastern farm. She is panicking about her escaped golem.' },
    { text: 'Follow the trail of destroyed fences to locate the golem near the Sootworks border.' },
    { text: 'Mine a chunk of calming-ore from the exposed vein near the border (Mining 5).' },
    { text: 'Craft a control rod from the ore and a stick (Crafting 5).' },
    { text: 'Approach the golem and use the control rod. If it fails, fight the golem (Attack 5) to weaken it, then try again.' },
  ],
  rewards: {
    xp: { attack: 200, mining: 150, crafting: 150 },
    items: [{ id: 101, name: 'Coins', count: 300 }, { id: 15001, name: 'Golem repair manual', count: 1 }],
    questPoints: 1,
    // Unlocks: Sootworks border mine shortcut
    unlocks: ["item_unlock:golem_repair_manual", "shortcut:sootworks_border_mine"],
  },
});

// ── 2. The Tide Pool Collector ───────────────────────────────────────────────
// Region: Saltbrine Reach
// Teaches: fishing + cooking + herblore basics
// Gates: access to Saltbrine tide pool fishing spots
quests.define('the_tide_pool_collector', {
  name: 'The Tide Pool Collector',
  description: 'An old marine biologist on the Saltbrine coast needs help cataloguing the creatures in the tide pools before the storm season washes them away. She\'ll teach you to fish the pools in return.',
  difficulty: 'Novice',
  questPoints: 1,
  requirements: { skills: { fishing: 5, cooking: 5, herblore: 3 } },
  steps: [
    { text: 'Talk to Biologist Corwyn at the Saltbrine tide pools during low tide.' },
    { text: 'Fish 3 different specimens from the tide pools: a starling crab, a kelp eel, and a glass shrimp (Fishing 5).' },
    { text: 'Cook the kelp eel to preserve it for the catalogue (Cooking 5).' },
    { text: 'Prepare a preservation solution from seaweed extract to keep the shrimp alive (Herblore 3).' },
    { text: 'Return all 3 specimens to Corwyn. She teaches you the tide pool fishing technique.' },
  ],
  rewards: {
    xp: { fishing: 250, cooking: 100, herblore: 100 },
    items: [{ id: 101, name: 'Coins', count: 250 }, { id: 15002, name: 'Tide pool net', count: 1 }],
    questPoints: 1,
    // Unlocks: tide pool fishing spots (unique fish for early-game cooking XP)
    unlocks: ["item_unlock:tide_pool_net", "training_method:tide_pool_fishing"],
    chain_next: 'the_margin_net_refolded',
  },
});

// ── 3. Lamplighter's Apprentice ──────────────────────────────────────────────
// Region: Heartlands → Moryskah border
// Teaches: firemaking + woodcutting + prayer basics
// Gates: Moryskah border lantern network (fast travel between border posts)
quests.define('lamplighters_apprentice', {
  name: "Lamplighter's Apprentice",
  description: 'The Heartlands lantern network that lights the road to Moryskah has gone dark. The lamplighter is too old to walk the route. You must relight every lantern before nightfall, or the undead will cross the border.',
  difficulty: 'Novice',
  questPoints: 1,
  requirements: { skills: { firemaking: 8, woodcutting: 5, prayer: 3 } },
  steps: [
    { text: 'Talk to Old Lamplighter Voss at the Heartlands southern gate.' },
    { text: 'Chop kindling from the dead oak near the gate (Woodcutting 5).' },
    { text: 'Light the first 3 lanterns along the road using your tinderbox and kindling (Firemaking 5).' },
    { text: 'The 4th lantern is cracked. Pray at the nearby shrine to bless a replacement wick (Prayer 3).' },
    { text: 'Light the final 2 lanterns near the Moryskah border (Firemaking 8). The road is safe for another night.' },
  ],
  rewards: {
    xp: { firemaking: 300, woodcutting: 100, prayer: 100 },
    items: [{ id: 101, name: 'Coins', count: 200 }, { id: 15003, name: 'Voss\'s tinderbox', count: 1 }],
    questPoints: 1,
    // Unlocks: Moryskah border lantern network (fast travel)
    unlocks: ["item_unlock:voss_tinderbox", "teleport:moryskah_border_lanterns"],
  },
});

// ── 4. The Apprentice Trapper ────────────────────────────────────────────────
// Region: Veilwood
// Teaches: hunter + agility + crafting basics
// Gates: Veilwood canopy hunting grounds access
quests.define('the_apprentice_trapper', {
  name: 'The Apprentice Trapper',
  description: 'A Veilwood trapper wants to train a successor. She\'ll test you with three tasks: build a trap, set it in a hard-to-reach spot, and catch something nobody else has caught in a decade.',
  difficulty: 'Novice',
  questPoints: 1,
  requirements: { skills: { hunter: 5, agility: 5, crafting: 5 } },
  steps: [
    { text: 'Talk to Trapper Wynn at her cabin in the southern Veilwood.' },
    { text: 'Craft a snare trap from vine rope and bent branches (Crafting 5).' },
    { text: 'Climb the canopy path to reach the moonhawk nesting ridge (Agility 5).' },
    { text: 'Set the snare near the moonhawk feeding grounds and wait (Hunter 5).' },
    { text: 'Catch a moonhawk chick and bring it to Wynn. She names it and gives you access to the canopy hunting grounds.' },
  ],
  rewards: {
    xp: { hunter: 250, agility: 150, crafting: 150 },
    items: [{ id: 101, name: 'Coins', count: 300 }, { id: 15004, name: 'Canopy hunting permit', count: 1 }],
    questPoints: 1,
    // Unlocks: Veilwood canopy hunting grounds
    unlocks: ["item_unlock:canopy_hunting_permit"],
  },
});

// ── 5. The Stolen Runes ──────────────────────────────────────────────────────
// Region: Heartlands
// Teaches: runecrafting + thieving + magic basics
// Gates: access to the Heartlands rune shop discount
quests.define('the_stolen_runes', {
  name: 'The Stolen Runes',
  description: 'Someone broke into the Heartlands Rune Shop and stole the entire stock. The shopkeeper suspects the thieves are hiding in the old watchtower. Get the runes back — by any means necessary.',
  difficulty: 'Novice',
  questPoints: 1,
  requirements: { skills: { runecrafting: 5, thieving: 5, magic: 5 } },
  steps: [
    { text: 'Talk to Shopkeeper Ruven in the Heartlands Rune Shop. He\'s frantic.' },
    { text: 'Investigate the shop. Find a dropped lockpick and tracks leading north.' },
    { text: 'Follow the tracks to the old watchtower. The door is locked — pick it (Thieving 5).' },
    { text: 'Inside, the thieves have scattered runes everywhere. Cast a rune-attraction spell to gather them (Magic 5).' },
    { text: 'Craft replacement runes for the ones that shattered during the theft (Runecrafting 5). Return everything to Ruven.' },
  ],
  rewards: {
    xp: { runecrafting: 200, thieving: 150, magic: 200 },
    items: [{ id: 101, name: 'Coins', count: 400 }, { id: 15005, name: 'Ruven\'s rune pouch', count: 1 }],
    questPoints: 1,
    // Unlocks: permanent 10% discount at Heartlands Rune Shop
    unlocks: ["item_unlock:ruvens_rune_pouch", "shop:heartlands_rune_shop_discount"],
  },
});

// ── 6. The Fencepost Problem ─────────────────────────────────────────────────
// Region: Heartlands
// Teaches: construction + smithing + woodcutting basics
// Gates: Heartlands ranch teleport point
quests.define('the_fencepost_problem', {
  name: 'The Fencepost Problem',
  description: 'Rancher Greta\'s entire fence line collapsed overnight and her prize cattle have scattered across the Heartlands. Rebuild the fence, reinforce it with iron, and help her round up the herd.',
  difficulty: 'Novice',
  questPoints: 1,
  requirements: { skills: { construction: 3, smithing: 5, woodcutting: 5 } },
  steps: [
    { text: 'Talk to Rancher Greta at the Heartlands ranch. Her cows are everywhere.' },
    { text: 'Chop 10 fence posts from the nearby oak grove (Woodcutting 5).' },
    { text: 'Smith 10 iron nails to reinforce the joints (Smithing 5).' },
    { text: 'Build the new fence line around the ranch perimeter (Construction 3).' },
    { text: 'Round up the 5 scattered cows by herding them back through the gate.' },
  ],
  rewards: {
    xp: { construction: 200, smithing: 150, woodcutting: 150 },
    items: [{ id: 101, name: 'Coins', count: 350 }, { id: 15006, name: 'Rancher\'s bell', count: 1 }],
    questPoints: 1,
    // Unlocks: Heartlands ranch as a teleport destination
    unlocks: ["item_unlock:ranchers_bell", "teleport:heartlands_ranch"],
  },
});

// ── 7. The Bog Witch's Errand ────────────────────────────────────────────────
// Region: Moryskah
// Teaches: herblore + farming + prayer basics
// Gates: Moryskah herb patch access
quests.define('the_bog_witchs_errand', {
  name: "The Bog Witch's Errand",
  description: 'The infamous Bog Witch of Moryskah needs ingredients for a potion. She\'s not evil — just antisocial. Help her, and she\'ll let you use her herb patch. Refuse, and she\'ll curse your boots.',
  difficulty: 'Novice',
  questPoints: 1,
  requirements: { skills: { herblore: 5, farming: 5, prayer: 3 } },
  steps: [
    { text: 'Find the Bog Witch\'s hut in the eastern Moryskah swamp. Knock three times.' },
    { text: 'She needs 3 ingredients: swamp moss (gather from the bog), a blessed acorn (Prayer 3 at the swamp shrine), and a nightcap mushroom.' },
    { text: 'Plant the blessed acorn in her garden to grow a sapling overnight (Farming 5).' },
    { text: 'Mix the ingredients into a swamp salve following her recipe (Herblore 5).' },
    { text: 'Deliver the salve. The Bog Witch grants you access to her herb patch and teaches you a swamp herb recipe.' },
  ],
  rewards: {
    xp: { herblore: 250, farming: 150, prayer: 100 },
    items: [{ id: 101, name: 'Coins', count: 200 }, { id: 15007, name: 'Swamp salve recipe', count: 1 }],
    questPoints: 1,
    // Unlocks: Moryskah herb patch
    unlocks: ["recipe:swamp_salve", "training_method:moryskah_herb_patch"],
    chain_next: 'the_bog_witchs_bargain',
  },
});

// ── 8. Target Practice ───────────────────────────────────────────────────────
// Region: Heartlands → Veilwood border
// Teaches: ranged + fletching + agility basics
// Gates: Heartlands archery range (daily ranged XP bonus)
quests.define('target_practice', {
  name: 'Target Practice',
  description: 'The Heartlands militia is recruiting archers. Pass three trials at the archery range: fletch your own arrows, run an obstacle course, and hit a bullseye from 50 paces.',
  difficulty: 'Novice',
  questPoints: 1,
  requirements: { skills: { ranged: 5, fletching: 5, agility: 3 } },
  steps: [
    { text: 'Talk to Drill Sergeant Holt at the Heartlands archery range.' },
    { text: 'Trial 1: Fletch 15 bronze arrows from provided materials (Fletching 5).' },
    { text: 'Trial 2: Run the obstacle course — hurdles, rope climb, and balance beam (Agility 3).' },
    { text: 'Trial 3: Hit 3 out of 5 bullseyes at increasing distances using your crafted arrows (Ranged 5).' },
    { text: 'Report to Sergeant Holt for your militia badge. You now have permanent access to the archery range for daily practice.' },
  ],
  rewards: {
    xp: { ranged: 250, fletching: 200, agility: 100 },
    items: [{ id: 101, name: 'Coins', count: 250 }, { id: 15008, name: 'Militia archer\'s badge', count: 1 }],
    questPoints: 1,
    // Unlocks: Heartlands archery range daily XP bonus
    unlocks: ["item_unlock:militia_archers_badge", "training_method:archery_range_daily"],
  },
});

// ── 9. The Boneyard Compass ──────────────────────────────────────────────────
// Region: Boneyard Wastes
// Teaches: mining + smithing + defence basics
// Gates: Boneyard navigation compass (prevents getting lost in sandstorms)
quests.define('the_boneyard_compass', {
  name: 'The Boneyard Compass',
  description: 'Travellers keep getting lost in the Boneyard sandstorms. A desert guide offers to teach you the old compass technique — but first you must forge one from magnetite ore found only in the deep dunes.',
  difficulty: 'Novice',
  questPoints: 1,
  requirements: { skills: { mining: 8, smithing: 5, defence: 3 } },
  steps: [
    { text: 'Talk to Desert Guide Suri at the Boneyard Wastes waystation.' },
    { text: 'Venture into the dunes to find the magnetite deposit. Survive a scorpion ambush on the way (Defence 3).' },
    { text: 'Mine 3 magnetite chunks from the deposit (Mining 8).' },
    { text: 'Return to the waystation forge and smith a desert compass from the magnetite (Smithing 5).' },
    { text: 'Suri calibrates your compass and teaches you how to read it. You\'ll never get lost in Boneyard sandstorms again.' },
  ],
  rewards: {
    xp: { mining: 300, smithing: 200, defence: 100 },
    items: [{ id: 101, name: 'Coins', count: 300 }, { id: 15009, name: 'Boneyard compass', count: 1 }],
    questPoints: 1,
    // Unlocks: immunity to Boneyard sandstorm disorientation
    unlocks: ["area:boneyard_deep_dunes", "item_unlock:boneyard_compass_item"],
  },
});

// ── 10. The Slayer's First Mark ──────────────────────────────────────────────
// Region: Heartlands → Moryskah border
// Teaches: slayer + strength + hitpoints basics
// Gates: ability to receive Novice slayer tasks
quests.define('the_slayers_first_mark', {
  name: "The Slayer's First Mark",
  description: 'Every slayer must earn their first mark — a solo kill of a monster that resists normal combat. Slayer Apprentice Kael will teach you the technique, but you have to prove you can take a hit.',
  difficulty: 'Novice',
  questPoints: 1,
  requirements: { skills: { slayer: 3, strength: 5, hitpoints: 5 } },
  steps: [
    { text: 'Talk to Slayer Apprentice Kael at the Heartlands Slayer Lodge.' },
    { text: 'Kael explains the slayer technique: some monsters have a weak point only slayers can see. He marks your eyes with slayer dust.' },
    { text: 'Travel to the Moryskah border cave where a Crawling Hand nest has been reported.' },
    { text: 'Use the slayer technique to locate the Crawling Hands\' nerve cluster, then slay 5 of them (Slayer 3, Strength 5).' },
    { text: 'Survive the nest mother\'s counter-attack (Hitpoints 5). Return to Kael with a Crawling Hand trophy.' },
  ],
  rewards: {
    xp: { slayer: 200, strength: 200, hitpoints: 150 },
    items: [{ id: 101, name: 'Coins', count: 250 }, { id: 15010, name: 'Slayer\'s first mark', count: 1 }],
    questPoints: 1,
    // Unlocks: Novice slayer task assignments
    unlocks: ["npc:slayer_apprentice_kael", "training_method:novice_slayer_tasks"],
    chain_next: 'slayers_gauntlet',
  },
});

// ══════════════════════════════════════════════════════════════════════════════
// INTERMEDIATE QUESTS (15) — mid game, 2+ regions, 5-7 steps
// ══════════════════════════════════════════════════════════════════════════════

// ── 11. The Counterfeit Ring ─────────────────────────────────────────────────
// Regions: Heartlands → Saltbrine Reach
// Detective quest — investigate a crime across regions
// Gates: access to the Saltbrine Reach customs office (sell contraband legally)
quests.define('the_counterfeit_ring', {
  name: 'The Counterfeit Ring',
  description: 'Fake coins are flooding the Heartlands market. The forgeries are almost perfect — smelted with real gold but stamped with a die that doesn\'t match any royal mint. Follow the money.',
  difficulty: 'Intermediate',
  questPoints: 2,
  requirements: { skills: { smithing: 20, thieving: 20, crafting: 15 } },
  steps: [
    { text: 'Talk to Mint Inspector Galway at the Heartlands Treasury. He shows you a counterfeit coin.' },
    { text: 'Examine the coin at a forge — the alloy contains Saltbrine sea-gold, only found in one mine (Smithing 20 to identify).' },
    { text: 'Travel to Saltbrine Reach. Pickpocket the harbourmaster\'s assistant for shipping manifests (Thieving 20).' },
    { text: 'The manifests reveal a warehouse receiving "art supplies" from an unknown sender.' },
    { text: 'Break into the warehouse. Find a hidden forging room with coin dies and moulds.' },
    { text: 'Craft a replica coin from the dies to use as evidence (Crafting 15).' },
    { text: 'Confront the forger — a disgraced royal goldsmith. He surrenders peacefully if you show the evidence, or fights (level 45) if you don\'t.' },
  ],
  rewards: {
    xp: { smithing: 2000, thieving: 1500, crafting: 1000 },
    items: [{ id: 101, name: 'Coins', count: 5000 }, { id: 15101, name: 'Inspector\'s loupe', count: 1 }],
    questPoints: 2,
    // Unlocks: Saltbrine customs office access (sell contraband legally for better prices)
    unlocks: ["item_unlock:inspectors_loupe"],
    chain_next: 'the_counterfeit_empire',
  },
});

// ── 12. The Haunted Lighthouse ───────────────────────────────────────────────
// Regions: Saltbrine Reach → Moryskah
// Escort quest — protect an NPC through dangerous territory
// Gates: Saltbrine lighthouse teleport
quests.define('the_haunted_lighthouse', {
  name: 'The Haunted Lighthouse',
  description: 'The Saltbrine lighthouse has gone dark and ships are crashing on the rocks. The last keeper fled, screaming about ghosts. Escort the new keeper through the haunted cliffs and relight the beacon.',
  difficulty: 'Intermediate',
  questPoints: 2,
  requirements: { skills: { prayer: 20, firemaking: 15, defence: 20 } },
  steps: [
    { text: 'Meet Keeper Lira at Saltbrine harbour. She\'s terrified but determined.' },
    { text: 'Escort Lira along the cliff path. Ghosts attack in 3 waves — protect her (Defence 20).' },
    { text: 'At the lighthouse door, pray to weaken the spectral lock (Prayer 20).' },
    { text: 'Inside, the lighthouse is filled with ectoplasm. Clear each floor while keeping Lira safe.' },
    { text: 'Reach the top. The beacon\'s flame was extinguished by a ghost of a drowned sailor from Moryskah.' },
    { text: 'Put the ghost to rest with a prayer of passage (Prayer 15). Then relight the beacon (Firemaking 15).' },
    { text: 'Lira takes her post. The lighthouse shines again. Ships are safe.' },
  ],
  rewards: {
    xp: { prayer: 1500, firemaking: 1000, defence: 1500 },
    items: [{ id: 101, name: 'Coins', count: 4000 }, { id: 15102, name: 'Lighthouse keeper\'s key', count: 1 }],
    questPoints: 2,
    // Unlocks: Saltbrine lighthouse as a teleport destination
    unlocks: [],
  },
});

// ── 13. The Ink Smugglers ────────────────────────────────────────────────────
// Regions: The Inkweald → Heartlands
// Stealth quest — infiltrate a smuggling operation
// Gates: Inkweald border passage (shortcut into the dreamforest)
quests.define('the_ink_smugglers', {
  name: 'The Ink Smugglers',
  description: 'Dream-ink from the Inkweald is being smuggled into the Heartlands and sold as a dangerous recreational drug. Infiltrate the smuggling ring by posing as a buyer.',
  difficulty: 'Intermediate',
  questPoints: 2,
  requirements: { skills: { thieving: 25, agility: 20, herblore: 15 } },
  steps: [
    { text: 'Talk to Watchman Breck at the Heartlands eastern outpost. He suspects the dream-ink is entering through the old forest road.' },
    { text: 'Travel to the Inkweald border and find the smugglers\' trail. Navigate the dream-thorns using agility shortcuts (Agility 20).' },
    { text: 'Find the smugglers\' camp. Sneak past the perimeter guards (Thieving 20).' },
    { text: 'Pose as a buyer. The smugglers test you by asking you to identify real dream-ink from fakes (Herblore 15).' },
    { text: 'Once inside, steal the smugglers\' ledger from the boss\'s tent (Thieving 25).' },
    { text: 'Escape through the Inkweald dream-tunnels before they notice the ledger is gone.' },
    { text: 'Deliver the ledger to Watchman Breck. The ring is dismantled.' },
  ],
  rewards: {
    xp: { thieving: 2500, agility: 1500, herblore: 1000 },
    items: [{ id: 101, name: 'Coins', count: 5000 }, { id: 15103, name: 'Smuggler\'s shadow cloak', count: 1 }],
    questPoints: 2,
    // Unlocks: Inkweald border passage shortcut
    unlocks: [],
  },
});

// ── 14. The Bone Flute ───────────────────────────────────────────────────────
// Regions: Boneyard Wastes → Heartlands
// Crafting quest — build a magical instrument
// Gates: Boneyard flute (calms hostile desert creatures for 30s)
quests.define('the_bone_flute', {
  name: 'The Bone Flute',
  description: 'A Boneyard nomad plays a flute carved from dragon bone that calms even the most aggressive desert creatures. He\'ll teach you to make one — if you can find the right bone and tune it.',
  difficulty: 'Intermediate',
  questPoints: 2,
  requirements: { skills: { crafting: 25, mining: 20, prayer: 15 } },
  steps: [
    { text: 'Find Nomad Ashir at the Boneyard Wastes oasis camp.' },
    { text: 'He needs a bone from the Ancient Wyrm skeleton half-buried in the northern dunes.' },
    { text: 'Mine the bone free from the surrounding sandstone (Mining 20).' },
    { text: 'Carve the bone into a flute shape using precision crafting tools (Crafting 25).' },
    { text: 'The flute needs to be attuned. Pray at the Boneyard shrine to infuse it with calming energy (Prayer 15).' },
    { text: 'Play the flute near a hostile dust scorpion to test it. It works — the scorpion lies down.' },
    { text: 'Return to Ashir. He declares you a friend of the desert.' },
  ],
  rewards: {
    xp: { crafting: 2000, mining: 1000, prayer: 800 },
    items: [{ id: 15104, name: 'Bone flute', count: 1 }, { id: 101, name: 'Coins', count: 3500 }],
    questPoints: 2,
    // Unlocks: Bone flute (calms hostile desert creatures, 30s cooldown)
    unlocks: [],
  },
});

// ── 15. The Flooded Vault ────────────────────────────────────────────────────
// Regions: Sootworks → Saltbrine Reach
// Puzzle quest — logic and environmental problem-solving
// Gates: Sootworks deep vault access (high-level mining area)
quests.define('the_flooded_vault', {
  name: 'The Flooded Vault',
  description: 'The richest mining vault in the Sootworks flooded after an earthquake ruptured a pipe from Saltbrine\'s underground river. Drain it, fix it, and open the vault for the first time in 50 years.',
  difficulty: 'Intermediate',
  questPoints: 2,
  requirements: { skills: { construction: 20, mining: 20, fishing: 15 } },
  steps: [
    { text: 'Talk to Foreman Rika at the Sootworks Level 4 entrance. The vault is flooded.' },
    { text: 'Descend to the flooded vault. Fish out the debris blocking the drain grate (Fishing 15).' },
    { text: 'The drain leads to a Saltbrine underground river channel. Travel through it to find the rupture point.' },
    { text: 'Mine replacement stone blocks from the channel walls (Mining 20).' },
    { text: 'Rebuild the ruptured pipe using the stone blocks and mortar (Construction 20).' },
    { text: 'Return to the vault. The water is draining. Help Rika pump the last of it out.' },
    { text: 'The vault opens, revealing untouched ore veins. Rika grants you permanent mining access.' },
  ],
  rewards: {
    xp: { construction: 2000, mining: 1500, fishing: 800 },
    items: [{ id: 101, name: 'Coins', count: 4500 }, { id: 15105, name: 'Deep vault key', count: 1 }],
    questPoints: 2,
    // Unlocks: Sootworks deep vault mining area
    unlocks: [],
  },
});

// ── 16. The Werewolf Courier ─────────────────────────────────────────────────
// Regions: Moryskah → Veilwood
// Escort quest — protect a package through dangerous territory
// Gates: Moryskah-Veilwood bridge crossing (safe passage for future travel)
quests.define('the_werewolf_courier', {
  name: 'The Werewolf Courier',
  description: 'A Moryskah apothecary has brewed a cure for a Veilwood elf child\'s rare illness. The catch: the cure must be delivered fresh within one game day, through territory crawling with bandits and swamp beasts.',
  difficulty: 'Intermediate',
  questPoints: 2,
  requirements: { skills: { herblore: 20, agility: 20, attack: 15 } },
  steps: [
    { text: 'Talk to Apothecary Dresh in Moryskah village. The cure is ready but fragile.' },
    { text: 'Carry the cure through the Moryskah wetlands. The agility shortcuts keep it safer (Agility 15).' },
    { text: 'Bandits block the bridge to Veilwood. Fight through them or find a way around (Attack 15).' },
    { text: 'The cure is losing potency. Stabilize it with a herblore technique mid-journey (Herblore 20).' },
    { text: 'Cross the Moryskah-Veilwood bridge. The Veilwood border guards are suspicious — convince them the package is medicine, not poison.' },
    { text: 'Navigate the Veilwood canopy path to the healer\'s grove (Agility 20).' },
    { text: 'Deliver the cure. The elf child recovers. Both regions agree to keep the bridge open permanently.' },
  ],
  rewards: {
    xp: { herblore: 1500, agility: 1500, attack: 800 },
    items: [{ id: 101, name: 'Coins', count: 3500 }, { id: 15106, name: 'Bridge crossing token', count: 1 }],
    questPoints: 2,
    // Unlocks: Moryskah-Veilwood bridge crossing (safe passage)
    unlocks: [],
  },
});

// ── 17. The Glass Cutter's Challenge ─────────────────────────────────────────
// Regions: Glass Desert → Sootworks
// Skill mastery quest — prove expertise in crafting
// Gates: ability to cut prismatic gems (used in BIS jewellery)
quests.define('the_glass_cutters_challenge', {
  name: "The Glass Cutter's Challenge",
  description: 'The Glass Desert crystal cutters are the finest artisans in Aelgard. Their leader will teach you the prismatic cutting technique — but only if you can pass her three-stage practical exam.',
  difficulty: 'Intermediate',
  questPoints: 2,
  requirements: { skills: { crafting: 30, mining: 25, smithing: 20 } },
  steps: [
    { text: 'Travel to the Glass Cutters\' Guild in the Glass Desert. Talk to Guildmaster Crysta.' },
    { text: 'Stage 1: Mine 5 raw crystal shards from the desert floor without cracking them (Mining 25).' },
    { text: 'Stage 2: Smith a precision cutting tool from crystal-steel alloy at the guild forge (Smithing 20).' },
    { text: 'Stage 3: Cut a perfect prismatic gem from a raw shard. One crack and you fail (Crafting 30).' },
    { text: 'Crysta examines your gem under the desert sun. The refraction pattern must be flawless.' },
    { text: 'Travel to the Sootworks to purchase a jeweller\'s loupe — only made there. Return to Crysta for final certification.' },
    { text: 'Crysta certifies you. You can now cut prismatic gems anywhere in Aelgard.' },
  ],
  rewards: {
    xp: { crafting: 2500, mining: 1500, smithing: 1000 },
    items: [{ id: 15107, name: 'Glass cutter\'s certificate', count: 1 }, { id: 15108, name: 'Prismatic gem (unset)', count: 3 }],
    questPoints: 2,
    // Unlocks: ability to cut prismatic gems (used in BIS jewellery)
    unlocks: [],
  },
});

// ── 18. The Tax Collector's Bodyguard ────────────────────────────────────────
// Regions: Heartlands → Boneyard Wastes
// Escort/combat quest
// Gates: Boneyard Wastes trading post (new shop)
quests.define('the_tax_collectors_bodyguard', {
  name: "The Tax Collector's Bodyguard",
  description: 'The Heartlands tax collector must travel to the Boneyard Wastes to collect overdue tribute from the desert settlements. Nobody wants to protect him, because the desert clans hate taxes. You need the money.',
  difficulty: 'Intermediate',
  questPoints: 2,
  requirements: { skills: { defence: 25, strength: 20, cooking: 15 } },
  steps: [
    { text: 'Meet Tax Collector Finch at the Heartlands gate. He\'s carrying a large empty chest and wearing a very punchable expression.' },
    { text: 'Escort Finch through the borderlands. Cook provisions for the desert crossing (Cooking 15).' },
    { text: 'At the first settlement, Finch demands payment. The clan leader refuses. Talk them down or fight the clan champion (Strength 20).' },
    { text: 'At the second settlement, an ambush. Defend Finch from 2 waves of desert raiders (Defence 25).' },
    { text: 'At the third settlement, the clan has already prepared tribute. Suspicious — check for traps.' },
    { text: 'The tribute chest is booby-trapped. Disarm it and collect the real tribute.' },
    { text: 'Escort Finch back to the Heartlands. He\'s grateful and opens a trading post in the Boneyard for you.' },
  ],
  rewards: {
    xp: { defence: 2000, strength: 1500, cooking: 800 },
    items: [{ id: 101, name: 'Coins', count: 6000 }, { id: 15109, name: 'Boneyard trader\'s writ', count: 1 }],
    questPoints: 2,
    // Unlocks: Boneyard Wastes trading post
    unlocks: [],
  },
});

// ── 19. The Clockwork Courier ────────────────────────────────────────────────
// Regions: Sootworks → Heartlands
// Construction/crafting quest — build and program a clockwork messenger
// Gates: clockwork courier service (send items between banks for a fee)
quests.define('the_clockwork_courier', {
  name: 'The Clockwork Courier',
  description: 'The Sootworks postmaster wants to automate mail delivery using clockwork messengers. Help him build the first one, and the courier service is yours to use forever.',
  difficulty: 'Intermediate',
  questPoints: 2,
  requirements: { skills: { construction: 25, smithing: 20, crafting: 20 } },
  steps: [
    { text: 'Talk to Postmaster Grix in the Sootworks Steam District.' },
    { text: 'Smith the clockwork frame from soot-iron and brass gears (Smithing 20).' },
    { text: 'Craft the routing mechanism — a compass-driven navigation core (Crafting 20).' },
    { text: 'Assemble the courier at the Sootworks workshop bench (Construction 25).' },
    { text: 'Program the courier\'s route by walking it from the Sootworks to the Heartlands post office.' },
    { text: 'Test the courier by sending a letter to the Heartlands postmaster. Wait for confirmation.' },
    { text: 'The courier works. Grix grants you permanent access to the clockwork courier service.' },
  ],
  rewards: {
    xp: { construction: 2000, smithing: 1200, crafting: 1200 },
    items: [{ id: 101, name: 'Coins', count: 3500 }, { id: 15110, name: 'Courier activation key', count: 1 }],
    questPoints: 2,
    // Unlocks: clockwork courier service (send items between banks)
    unlocks: [],
  },
});

// ── 20. The Dream Cartographer ───────────────────────────────────────────────
// Regions: The Inkweald → Glass Desert
// Lore/exploration quest
// Gates: Inkweald dream-map (reveals hidden paths in the dreamforest)
quests.define('the_dream_cartographer', {
  name: 'The Dream Cartographer',
  description: 'The Inkweald shifts and changes like a dreaming mind. Nobody has ever successfully mapped it — until now. A scholar from the Glass Desert believes crystal lenses can freeze the dreamscape long enough to draw it.',
  difficulty: 'Intermediate',
  questPoints: 2,
  requirements: { skills: { magic: 25, crafting: 20, mining: 15 } },
  steps: [
    { text: 'Meet Scholar Prym at the Inkweald entrance. She carries prototype crystal lenses.' },
    { text: 'Enter the Inkweald. The paths change every 60 seconds.' },
    { text: 'Mine a dream-crystal node that occasionally surfaces in the forest floor (Mining 15).' },
    { text: 'Craft a stabilization lens from the dream-crystal (Crafting 20).' },
    { text: 'Use the lens at 4 different Inkweald crossroads to freeze and sketch each path configuration (Magic 25 to activate the lens).' },
    { text: 'Combine the 4 sketches into a composite dream-map.' },
    { text: 'Return to Prym. The map works — the Inkweald\'s pattern is fractal, not random. She gives you a copy.' },
  ],
  rewards: {
    xp: { magic: 2000, crafting: 1200, mining: 800 },
    items: [{ id: 15111, name: 'Inkweald dream-map', count: 1 }, { id: 101, name: 'Coins', count: 3000 }],
    questPoints: 2,
    // Unlocks: dream-map reveals hidden paths in the Inkweald
    unlocks: [],
  },
});

// ── 21. The Veilwood Whittler ────────────────────────────────────────────────
// Regions: Veilwood → Heartlands
// Crafting/fletching specialization quest
// Gates: Veilwood singing-wood bow crafting (special bow tier)
quests.define('the_veilwood_whittler', {
  name: 'The Veilwood Whittler',
  description: 'An elderly elf woodworker is the last person alive who knows how to shape singing-wood — the resonant timber that vibrates when drawn. Learn the dying art before it vanishes forever.',
  difficulty: 'Intermediate',
  questPoints: 2,
  requirements: { skills: { fletching: 25, woodcutting: 20, hunter: 15 } },
  steps: [
    { text: 'Find Elder Whittler Faolan in his hidden workshop deep in the Veilwood.' },
    { text: 'He\'ll only teach you if you can find a singing-wood tree. Track its unique birdsong using hunter techniques (Hunter 15).' },
    { text: 'Chop a singing-wood log — carefully, or the resonance dies (Woodcutting 20).' },
    { text: 'Faolan teaches you the shaping technique. Whittle the log into a bow stave (Fletching 20).' },
    { text: 'String the bow with silverthread from the Heartlands market. Travel there and back.' },
    { text: 'Fire the bow at Faolan\'s tuning stones. Adjust the tiller until it hums perfectly (Fletching 25).' },
    { text: 'Faolan certifies you. You can now craft singing-wood bows anywhere.' },
  ],
  rewards: {
    xp: { fletching: 2500, woodcutting: 1200, hunter: 800 },
    items: [{ id: 15112, name: 'Singing-wood shortbow', count: 1 }, { id: 101, name: 'Coins', count: 3000 }],
    questPoints: 2,
    // Unlocks: singing-wood bow crafting (special bow tier)
    unlocks: [],
  },
});

// ── 22. The Saltbrine Regatta ────────────────────────────────────────────────
// Regions: Saltbrine Reach → Boneyard Wastes coast
// Competition/sailing quest
// Gates: personal sailing boat (fast travel between coastal locations)
quests.define('the_saltbrine_regatta', {
  name: 'The Saltbrine Regatta',
  description: 'The annual Saltbrine sailing race is open to anyone brave enough to build their own boat and race it around the Boneyard coast. The winner gets a permanent mooring and their own vessel.',
  difficulty: 'Intermediate',
  questPoints: 2,
  requirements: { skills: { construction: 20, woodcutting: 25, agility: 20 } },
  steps: [
    { text: 'Register for the regatta at Saltbrine harbour with Racemaster Oakes.' },
    { text: 'Chop 15 teak planks from the coastal grove for your hull (Woodcutting 25).' },
    { text: 'Build your racing skiff at the Saltbrine drydock (Construction 20).' },
    { text: 'Launch your skiff. The race begins — navigate through the harbour gates.' },
    { text: 'Round the Boneyard coast buoy. Strong winds test your agility on the rigging (Agility 20).' },
    { text: 'A storm hits on the return leg. Repair your sail mid-race or lose time.' },
    { text: 'Cross the finish line. Place in the top 3 (out of 8 NPC racers) to earn the grand prize.' },
  ],
  rewards: {
    xp: { construction: 2000, woodcutting: 1500, agility: 1500 },
    items: [{ id: 101, name: 'Coins', count: 5000 }, { id: 15113, name: 'Racing skiff deed', count: 1 }],
    questPoints: 2,
    // Unlocks: personal sailing boat (fast travel between coastal locations)
    unlocks: [],
  },
});

// ── 23. The Runic Lock ───────────────────────────────────────────────────────
// Regions: Heartlands → The Inkweald
// Puzzle quest — magical lock requires multiple rune types
// Gates: Ancient Rune Vault (advanced runecrafting location)
quests.define('the_runic_lock', {
  name: 'The Runic Lock',
  description: 'Beneath the Heartlands library is a door sealed with a lock made of pure runic energy. It has resisted every mage for centuries. The key isn\'t a key — it\'s a sequence of runes crafted in the correct order.',
  difficulty: 'Intermediate',
  questPoints: 2,
  requirements: { skills: { runecrafting: 25, magic: 20, mining: 15 } },
  steps: [
    { text: 'Talk to Librarian Voss in the Heartlands underground archives. She\'s found the runic lock.' },
    { text: 'Examine the lock. It requires 5 different rune types inserted in a specific sequence.' },
    { text: 'Mine rune essence from the hidden deposit beneath the library (Mining 15).' },
    { text: 'Craft each rune type: air, water, earth, fire, and mind (Runecrafting 25).' },
    { text: 'The sequence is encoded in a riddle carved above the door. Solve the riddle.' },
    { text: 'Insert the runes in the correct order. The lock glows and the door opens (Magic 20 to channel the activation).' },
    { text: 'Inside: the Ancient Rune Vault, untouched for millennia. Report to Voss.' },
  ],
  rewards: {
    xp: { runecrafting: 2500, magic: 1500, mining: 800 },
    items: [{ id: 15114, name: 'Ancient rune mould', count: 1 }, { id: 101, name: 'Coins', count: 3500 }],
    questPoints: 2,
    // Unlocks: Ancient Rune Vault (advanced runecrafting location)
    unlocks: [],
  },
});

// ── 24. The Farmstead Siege ──────────────────────────────────────────────────
// Regions: Heartlands → Boneyard Wastes border
// Defence/farming quest — protect a settlement
// Gates: Heartlands farmstead (player-owned farm plot)
quests.define('the_farmstead_siege', {
  name: 'The Farmstead Siege',
  description: 'Desert raiders are attacking Heartlands border farms every night. The farmers need someone to fortify the farmstead, grow emergency food supplies, and hold the line until the militia arrives.',
  difficulty: 'Intermediate',
  questPoints: 2,
  requirements: { skills: { farming: 25, defence: 20, construction: 15 } },
  steps: [
    { text: 'Talk to Farmer Maren at the Heartlands border farmstead. The raiders hit again last night.' },
    { text: 'Plant quick-growing barricade hedges around the farmstead perimeter (Farming 20).' },
    { text: 'Build wooden palisades at the two weakest points (Construction 15).' },
    { text: 'Grow emergency food: potatoes and cabbages for the defenders (Farming 25).' },
    { text: 'Night falls. Defend the farmstead from 3 waves of desert raiders (Defence 20).' },
    { text: 'Dawn arrives. The militia finally shows up. The farmstead is saved.' },
    { text: 'Maren offers you your own plot on the farmstead as thanks.' },
  ],
  rewards: {
    xp: { farming: 2500, defence: 1500, construction: 1000 },
    items: [{ id: 101, name: 'Coins', count: 4000 }, { id: 15115, name: 'Farmstead plot deed', count: 1 }],
    questPoints: 2,
    // Unlocks: player-owned farm plot at the Heartlands border farmstead
    unlocks: [],
  },
});

// ── 25. The Wandering Chef ───────────────────────────────────────────────────
// Regions: Heartlands → Saltbrine Reach → Veilwood
// Cooking mastery quest — learn regional recipes
// Gates: Wandering Chef recipe book (cook regional dishes for better healing)
quests.define('the_wandering_chef', {
  name: 'The Wandering Chef',
  description: 'A legendary chef is travelling Aelgard, collecting one signature recipe from each region. She needs an assistant who can keep up. Travel with her, source ingredients, and learn dishes that heal better than anything on the market.',
  difficulty: 'Intermediate',
  questPoints: 2,
  requirements: { skills: { cooking: 30, fishing: 20, farming: 15 } },
  steps: [
    { text: 'Meet Chef Isolde at the Heartlands tavern. She\'s planning her route.' },
    { text: 'Lesson 1 (Heartlands): Source beef, potatoes, and gravy ingredients. Cook a Heartlands stew (Cooking 25).' },
    { text: 'Travel to Saltbrine Reach. Lesson 2: Fish for sea bass and gather salt (Fishing 20). Cook Saltbrine grilled sea bass (Cooking 30).' },
    { text: 'Travel to Veilwood. Lesson 3: Harvest starfruit and honeydew from the canopy (Farming 15). Cook Veilwood ambrosia (Cooking 30).' },
    { text: 'Return to the Heartlands. Isolde quizzes you on each recipe — recite the steps correctly.' },
    { text: 'Cook all 3 dishes in sequence without burning any. Isolde gives you her recipe book.' },
  ],
  rewards: {
    xp: { cooking: 3000, fishing: 1200, farming: 800 },
    items: [{ id: 15116, name: 'Isolde\'s recipe book', count: 1 }, { id: 101, name: 'Coins', count: 4000 }],
    questPoints: 2,
    // Unlocks: 3 regional dishes with enhanced healing properties
    unlocks: [],
  },
});

// ══════════════════════════════════════════════════════════════════════════════
// EXPERIENCED QUESTS (12) — late mid game, 3+ regions, 6-8 steps, bosses
// ══════════════════════════════════════════════════════════════════════════════

// ── 26. The Assassin's Ledger ────────────────────────────────────────────────
// Regions: Moryskah → Saltbrine Reach → Heartlands
// Detective/stealth quest — hunt an assassin across 3 regions
// Gates: Assassin's Guild contact (access to thieving contracts)
quests.define('the_assassins_ledger', {
  name: "The Assassin's Ledger",
  description: 'A string of murders across Aelgard all share the same calling card: a black feather. The assassin is professional, methodical, and two steps ahead of the law. You need to be three steps ahead.',
  difficulty: 'Experienced',
  questPoints: 3,
  requirements: { skills: { thieving: 40, agility: 35, ranged: 30 } },
  steps: [
    { text: 'Investigate the first crime scene in Moryskah. The victim was a vampyre lord. Find the black feather and trace its origin (Thieving 30).' },
    { text: 'The feather is from a Saltbrine reef-hawk. Travel to Saltbrine Reach.' },
    { text: 'The second victim is found at the docks — a merchant. Search the body and pick the assassin\'s trail lock (Thieving 40).' },
    { text: 'The trail leads through rooftop escape routes. Follow them (Agility 35).' },
    { text: 'You catch a glimpse of the assassin fleeing toward the Heartlands. Give chase.' },
    { text: 'In the Heartlands, the assassin sets a trap for you. Spot the tripwire and counter-ambush (Ranged 30).' },
    { text: 'Confront the assassin on the castle walls. They reveal they only kill those who deserve it — and offer you their ledger of targets. Take it or destroy it.' },
    { text: 'Return the ledger to the authorities (or keep it). Either way, you gain a contact in the underground.' },
  ],
  rewards: {
    xp: { thieving: 5000, agility: 3500, ranged: 2500 },
    items: [{ id: 101, name: 'Coins', count: 8000 }, { id: 15201, name: 'Black feather sigil', count: 1 }],
    questPoints: 3,
    // Unlocks: Assassin's Guild contact (thieving contracts for gold and XP)
    unlocks: [],
  },
});

// ── 27. The Forge of Four Fires ──────────────────────────────────────────────
// Regions: Sootworks → Boneyard Wastes → Moryskah → Heartlands
// Crafting/smithing epic — forge a legendary weapon
// Gates: ability to smith dragon-tier weapons
quests.define('the_forge_of_four_fires', {
  name: 'The Forge of Four Fires',
  description: 'An ancient smithing technique requires metal to be heated in four different kinds of fire: lava, desert sun, hellfire, and hearth flame. Each produces a different temper. Master all four, and you can forge dragon-tier weapons.',
  difficulty: 'Experienced',
  questPoints: 3,
  requirements: { skills: { smithing: 45, firemaking: 35, mining: 35, strength: 25 } },
  steps: [
    { text: 'Talk to Retired Forgemaster Durrak in the Sootworks. He describes the Four Fires technique.' },
    { text: 'Fire 1 — Lava: Smelt a steel bar at the Sootworks magma forge (Smithing 35). The heat requires strength to endure (Strength 25).' },
    { text: 'Fire 2 — Desert Sun: Travel to the Boneyard Wastes. Place the bar on the sun-stone at high noon and temper it (Smithing 40).' },
    { text: 'Fire 3 — Hellfire: Travel to Moryskah. Light a hellfire pyre in the cursed brazier at the Slayer Tower (Firemaking 35).' },
    { text: 'Hold the bar in the hellfire. Your hands burn — endure it.' },
    { text: 'Fire 4 — Hearth: Return to the Heartlands. Complete the final temper at a simple hearth fire (Firemaking 20).' },
    { text: 'The bar is now a quad-tempered ingot. Smith it into a dragon-tier weapon of your choice (Smithing 45).' },
    { text: 'Test the weapon on the training dummy. It cuts through steel like parchment. Report to Durrak.' },
  ],
  rewards: {
    xp: { smithing: 6000, firemaking: 3500, mining: 2500, strength: 2000 },
    items: [{ id: 15202, name: 'Quad-tempered dragon longsword', count: 1 }],
    questPoints: 3,
    // Unlocks: ability to smith dragon-tier weapons at any forge
    unlocks: [],
  },
});

// ── 28. The Silent Witness ───────────────────────────────────────────────────
// Regions: Heartlands → Moryskah → The Inkweald
// Lore/mystery quest — a ghost holds the key to ancient history
// Gates: Spirit Sight ability (see hidden ghost NPCs across Aelgard)
quests.define('the_silent_witness', {
  name: 'The Silent Witness',
  description: 'A ghost in the Heartlands graveyard has been trying to speak for decades, but cannot form words. She witnessed something terrible — and someone cast a silence curse to keep her quiet. Break the curse and learn what she saw.',
  difficulty: 'Experienced',
  questPoints: 3,
  requirements: { skills: { prayer: 35, magic: 30, herblore: 25 } },
  steps: [
    { text: 'Visit the Heartlands graveyard at midnight. The ghost appears, mouthing words with no sound.' },
    { text: 'Pray at the graveyard shrine to strengthen your connection to the spirit world (Prayer 30).' },
    { text: 'The ghost can now gesture. She points east — toward Moryskah.' },
    { text: 'Travel to Moryskah. Find the curse-breaker in the witches\' quarter. She needs ingredients for a silence-lifting potion.' },
    { text: 'Brew the potion: ghost orchid extract, silverbell dust, and moonwater (Herblore 25).' },
    { text: 'Return to the ghost. Administer the potion. She can speak — but the curse fights back.' },
    { text: 'Cast a sustained dispel to hold the curse at bay while she talks (Magic 30).' },
    { text: 'The ghost reveals she witnessed the founding of the Inkweald — it was created to imprison a god. Someone alive today knows and is keeping it secret. Pray to seal her testimony in the spirit record (Prayer 35).' },
  ],
  rewards: {
    xp: { prayer: 4500, magic: 3000, herblore: 2500 },
    items: [{ id: 15203, name: 'Spirit sight amulet', count: 1 }, { id: 101, name: 'Coins', count: 7000 }],
    questPoints: 3,
    // Unlocks: Spirit Sight ability (see hidden ghost NPCs across Aelgard)
    unlocks: [],
  },
});

// ── 29. The Canopy War ───────────────────────────────────────────────────────
// Regions: Veilwood → Moryskah → Heartlands
// Rivalry/faction quest — choose between elves and humans
// Gates: permanent faction alignment (elf or human allied shops)
quests.define('the_canopy_war', {
  name: 'The Canopy War',
  description: 'The elves of Veilwood and the humans of the Heartlands are on the brink of war over a border dispute. The Moryskah vampyres are fanning the flames, hoping both sides weaken each other. Pick a side — or try to stop the war entirely.',
  difficulty: 'Experienced',
  questPoints: 3,
  requirements: { skills: { ranged: 35, fletching: 30, agility: 30, magic: 25 } },
  steps: [
    { text: 'The conflict begins at the Veilwood-Heartlands border. Both sides have camps. Talk to both commanders.' },
    { text: 'Travel to Moryskah. Discover the vampyre provocation — a stolen elf relic planted on a human soldier.' },
    { text: 'Fletch enchanted arrows to use as proof-carriers (Fletching 30, Magic 25).' },
    { text: 'Navigate the Veilwood canopy to reach the elf war council before the attack launches (Agility 30).' },
    { text: 'CHOICE: Side with the elves (deliver proof to them, fight human scouts — Ranged 35). Side with the humans (deliver proof to them, fight elf rangers). Or present proof to both simultaneously (harder, requires surviving attacks from both sides).' },
    { text: 'If you chose peace: travel to Moryskah and confront the vampyre instigator. Defeat them in combat.' },
    { text: 'The war is averted — or one side wins. Your choice permanently affects which faction shops you can access.' },
    { text: 'Return to the winning side\'s commander (or both, if peace was achieved) for your reward.' },
  ],
  rewards: {
    xp: { ranged: 4000, fletching: 3000, agility: 3000, magic: 2000 },
    items: [{ id: 101, name: 'Coins', count: 8000 }, { id: 15204, name: 'Diplomat\'s signet', count: 1 }],
    questPoints: 3,
    // Unlocks: permanent faction alignment (elf-allied or human-allied shops, or both if peace)
    unlocks: [],
  },
});

// ── 30. The Undertaker's Burden ──────────────────────────────────────────────
// Regions: Moryskah → Boneyard Wastes → Heartlands
// Escort/defence quest — protect a wagon of sacred bones
// Gates: Moryskah sanctified burial ground (prayer training area)
quests.define('the_undertakers_burden', {
  name: "The Undertaker's Burden",
  description: 'The Moryskah undertaker must transport 100 sanctified bones to the Heartlands cathedral for proper burial. The route passes through the Boneyard Wastes, where the bones will attract every undead creature for miles.',
  difficulty: 'Experienced',
  questPoints: 3,
  requirements: { skills: { prayer: 35, defence: 30, strength: 30 } },
  steps: [
    { text: 'Meet Undertaker Ghull at the Moryskah chapel. His wagon is loaded with bones.' },
    { text: 'Bless the bones to reduce their undead-attracting aura (Prayer 30).' },
    { text: 'Begin the escort. The first attack comes at the Moryskah border — skeleton soldiers (Defence 25).' },
    { text: 'Enter the Boneyard Wastes. The aura intensifies. Fight off waves of zombies and ghouls (Strength 30).' },
    { text: 'At the Boneyard midpoint, a Bone Revenant rises — a mini-boss that reforms after each kill.' },
    { text: 'Pray to permanently destroy the Bone Revenant (Prayer 35). It crumbles to dust.' },
    { text: 'Cross into the Heartlands. One final ambush at the cathedral gates — skeletal warriors (Defence 30).' },
    { text: 'Deliver the bones to the cathedral. Ghull consecrates the burial ground in your honour.' },
  ],
  rewards: {
    xp: { prayer: 5000, defence: 3500, strength: 3000 },
    items: [{ id: 15205, name: 'Sanctified bone shard', count: 5 }, { id: 101, name: 'Coins', count: 7500 }],
    questPoints: 3,
    // Unlocks: Moryskah sanctified burial ground (enhanced prayer training)
    unlocks: [],
  },
});

// ── 31. The Spymaster's Gambit ───────────────────────────────────────────────
// Regions: Saltbrine Reach → Sootworks → The Wilds
// Stealth/intelligence quest — espionage across regions
// Gates: Wilds intelligence network (advanced warning of PvP encounters)
quests.define('the_spymasters_gambit', {
  name: "The Spymaster's Gambit",
  description: 'Aelgard\'s spymaster suspects a foreign power is funding the Wilds bandit clans. She needs an agent who can infiltrate, gather intelligence, and get out alive. Subtlety is mandatory — brute force will get you killed.',
  difficulty: 'Experienced',
  questPoints: 3,
  requirements: { skills: { thieving: 35, agility: 35, hunter: 25 } },
  steps: [
    { text: 'Meet Spymaster Eliza at a Saltbrine Reach safehouse. She briefs you on the mission.' },
    { text: 'Travel to the Sootworks and bug the arms dealer\'s office. Plant a listening device (Thieving 30).' },
    { text: 'Track the dealer\'s courier to the Wilds border using hunter techniques (Hunter 25).' },
    { text: 'Infiltrate the Wilds bandit stronghold. Scale the walls at night (Agility 35).' },
    { text: 'Inside, steal the foreign paymaster\'s correspondence (Thieving 35).' },
    { text: 'A guard spots you. Escape through the sewers — agility obstacles and tight squeezes (Agility 30).' },
    { text: 'Deliver the correspondence to Eliza. It confirms foreign funding.' },
    { text: 'Eliza establishes an intelligence network in the Wilds using your intel. You have permanent access.' },
  ],
  rewards: {
    xp: { thieving: 5000, agility: 4000, hunter: 2500 },
    items: [{ id: 101, name: 'Coins', count: 9000 }, { id: 15206, name: 'Spymaster\'s ring', count: 1 }],
    questPoints: 3,
    // Unlocks: Wilds intelligence network (advance warning of PvP encounters)
    unlocks: [],
  },
});

// ── 32. The Crystal Plague ───────────────────────────────────────────────────
// Regions: Glass Desert → Veilwood → Sootworks
// Herblore/investigation quest — cure a magical disease
// Gates: Glass Desert crystal healing springs
quests.define('the_crystal_plague', {
  name: 'The Crystal Plague',
  description: 'People in the Glass Desert are slowly turning to crystal. It starts at the fingertips and spreads inward. The cure requires ingredients from across Aelgard, and time is running out.',
  difficulty: 'Experienced',
  questPoints: 3,
  requirements: { skills: { herblore: 40, farming: 30, magic: 30 } },
  steps: [
    { text: 'Talk to Healer Oris in the Glass Desert settlement. Three patients are already half-crystallized.' },
    { text: 'Analyze the crystal growth on a patient. It\'s magical — a runaway enchantment, not natural (Magic 25).' },
    { text: 'The cure requires living sap from a Veilwood heart-oak. Travel to Veilwood and negotiate with the druids.' },
    { text: 'Grow the catalyst herb in enriched dream-soil (Farming 30). It must be harvested at peak potency.' },
    { text: 'Travel to the Sootworks for a precision glass distillation apparatus. Only their engineers can make one.' },
    { text: 'Brew the crystal dissolution potion — 5 ingredients, exact measurements, exact timing (Herblore 40).' },
    { text: 'Return to the Glass Desert. Administer the cure. Cast a stabilization enchantment as it works (Magic 30).' },
    { text: 'All three patients recover. Oris discovers the crystal springs can now be used safely for healing.' },
  ],
  rewards: {
    xp: { herblore: 5000, farming: 3000, magic: 3000 },
    items: [{ id: 15207, name: 'Crystal healing vial', count: 3 }, { id: 101, name: 'Coins', count: 8000 }],
    questPoints: 3,
    // Unlocks: Glass Desert crystal healing springs
    unlocks: [],
  },
});

// ── 33. The Colosseum of Bones ───────────────────────────────────────────────
// Regions: Boneyard Wastes → Moryskah → Heartlands
// Boss fight / combat puzzle quest
// Gates: Colosseum champion title + weekly boss instance
quests.define('the_colosseum_of_bones', {
  name: 'The Colosseum of Bones',
  description: 'Deep beneath the Boneyard Wastes lies a buried colosseum where an undead champion has defeated every challenger for a thousand years. To fight him, you must first earn the right by winning trials across three regions.',
  difficulty: 'Experienced',
  questPoints: 3,
  requirements: { skills: { attack: 45, hitpoints: 40, slayer: 30, prayer: 25 } },
  steps: [
    { text: 'Find the buried entrance to the Colosseum in the northern Boneyard Wastes.' },
    { text: 'The gatekeeper demands proof of worth: defeat the Trial of the Swamp in Moryskah (slay 3 swamp aberrants — Slayer 30).' },
    { text: 'Defeat the Trial of the Sword in the Heartlands (win a melee tournament against 5 NPCs — Attack 40).' },
    { text: 'Return to the Colosseum with proof of both trials.' },
    { text: 'Enter the arena. The undead champion rises — Lord Ossein, level 130.' },
    { text: 'Phase 1: Lord Ossein fights with a massive bone-blade. Melee combat (Attack 45, Hitpoints 40).' },
    { text: 'Phase 2: he shatters into a swarm of bone fragments. Pray to hold them at bay while you find the skull (Prayer 25).' },
    { text: 'Phase 3: shatter the skull. Lord Ossein reforms one last time for a final exchange of blows.' },
  ],
  rewards: {
    xp: { attack: 6000, hitpoints: 4000, slayer: 3000, prayer: 2000 },
    items: [{ id: 15208, name: 'Colosseum champion\'s belt', count: 1 }, { id: 101, name: 'Coins', count: 10000 }],
    questPoints: 3,
    // Unlocks: Colosseum champion title + weekly boss instance (repeatable loot)
    unlocks: [],
  },
});

// ── 34. The Ink Painter's Masterpiece ────────────────────────────────────────
// Regions: The Inkweald → Veilwood → Heartlands
// Lore/crafting quest — create a magical painting
// Gates: Ink Painter's canvas (portable bank deposit from anywhere)
quests.define('the_ink_painters_masterpiece', {
  name: "The Ink Painter's Masterpiece",
  description: 'An Inkweald painter creates art that becomes real — literally. A tree she paints will grow. A river she draws will flow. She wants to paint a masterpiece that connects three regions, but she needs help gathering paints from reality.',
  difficulty: 'Experienced',
  questPoints: 3,
  requirements: { skills: { crafting: 40, magic: 30, woodcutting: 30 } },
  steps: [
    { text: 'Find the Ink Painter, Seraphine, at her studio in the central Inkweald.' },
    { text: 'She needs 3 paints made from real-world materials to ground her art in reality.' },
    { text: 'Travel to Veilwood. Harvest heartwood sap from the oldest tree (Woodcutting 30) and craft green pigment (Crafting 30).' },
    { text: 'Travel to the Heartlands. Mine ochre from the clay pits and craft gold pigment (Crafting 35).' },
    { text: 'Return to the Inkweald. Craft the final pigment from dream-ink and silver dust (Crafting 40).' },
    { text: 'Seraphine begins painting. Channel magic to stabilize the art as it becomes real (Magic 30).' },
    { text: 'The masterpiece is complete: a painting that acts as a portal between three locations.' },
    { text: 'Seraphine gives you a miniature canvas — a pocket portal you can use to deposit items in your bank from anywhere.' },
  ],
  rewards: {
    xp: { crafting: 5000, magic: 3000, woodcutting: 2500 },
    items: [{ id: 15209, name: 'Seraphine\'s pocket canvas', count: 1 }],
    questPoints: 3,
    // Unlocks: portable bank deposit (use from anywhere, 10-minute cooldown)
    unlocks: [],
  },
});

// ── 35. The Lighthouse Cipher ────────────────────────────────────────────────
// Regions: Saltbrine Reach → Boneyard Wastes → Glass Desert
// Puzzle/detective quest — decode an ancient message
// Gates: Cipher ring (decode NPC hints for treasure trail clues)
quests.define('the_lighthouse_cipher', {
  name: 'The Lighthouse Cipher',
  description: 'The Saltbrine lighthouse contains a coded message in its beam pattern — different flash sequences each night. A mathematician believes the flashes encode the location of a treasure hidden before Aelgard was founded.',
  difficulty: 'Experienced',
  questPoints: 3,
  requirements: { skills: { magic: 35, runecrafting: 25, fishing: 25 } },
  steps: [
    { text: 'Talk to Mathematician Fen at the Saltbrine observatory. She\'s been recording flash patterns for months.' },
    { text: 'Craft a signal-capturing rune to record the pattern automatically (Runecrafting 25).' },
    { text: 'Set the rune at the lighthouse and wait one night cycle. Retrieve the recording.' },
    { text: 'Decode the pattern with Fen. It points to coordinates in the Boneyard Wastes.' },
    { text: 'Travel to the coordinates. The treasure is buried beneath a dried-up well. Fish a key fragment from the well (Fishing 25).' },
    { text: 'The key fragment glows — the rest is in the Glass Desert. Travel there.' },
    { text: 'Use magic to follow the key fragment\'s resonance to the second fragment (Magic 35).' },
    { text: 'Combine the fragments. The completed key unlocks a hidden chest buried in crystal sand. Inside: the Cipher Ring.' },
  ],
  rewards: {
    xp: { magic: 4000, runecrafting: 3000, fishing: 2000 },
    items: [{ id: 15210, name: 'Cipher ring', count: 1 }, { id: 101, name: 'Coins', count: 8000 }],
    questPoints: 3,
    // Unlocks: Cipher ring (decode hidden NPC hints for treasure trail clues)
    unlocks: [],
  },
});

// ── 36. The Steamwright's Apprentice ─────────────────────────────────────────
// Regions: Sootworks → Heartlands → Veilwood
// Crafting/construction chain — build a steam-powered device
// Gates: personal steam engine (boosts skilling speed at specific locations)
quests.define('the_steamwrights_apprentice', {
  name: "The Steamwright's Apprentice",
  description: 'The Sootworks\' greatest steamwright is dying and needs an apprentice to complete her life\'s work: a portable steam engine that can power any workshop. But the parts must come from across Aelgard.',
  difficulty: 'Experienced',
  questPoints: 3,
  requirements: { skills: { construction: 35, smithing: 30, woodcutting: 25, crafting: 25 } },
  steps: [
    { text: 'Meet Steamwright Venna in the Sootworks. She\'s bedridden but sharp as ever.' },
    { text: 'She needs 3 components. Part 1: Smith a pressure chamber from deep-iron (Smithing 30).' },
    { text: 'Part 2: Travel to the Heartlands. Craft the control valves from precision bronze (Crafting 25).' },
    { text: 'Part 3: Travel to Veilwood. Chop ironwood for the frame — the only wood that won\'t warp under steam heat (Woodcutting 25).' },
    { text: 'Return to Sootworks. Assemble the portable steam engine under Venna\'s direction (Construction 35).' },
    { text: 'Test the engine. It works — but overheats. Venna tells you to add a Veilwood heat sink.' },
    { text: 'Install the heat sink. The engine runs perfectly. Venna passes the blueprints to you.' },
    { text: 'Venna dies peacefully, knowing her life\'s work is complete. You keep the engine and the blueprints.' },
  ],
  rewards: {
    xp: { construction: 5000, smithing: 3000, woodcutting: 2000, crafting: 2000 },
    items: [{ id: 15211, name: 'Venna\'s portable steam engine', count: 1 }],
    questPoints: 3,
    // Unlocks: portable steam engine (boosts skilling speed at workshops)
    unlocks: [],
  },
});

// ── 37. The Moonlit Duel ─────────────────────────────────────────────────────
// Regions: Veilwood → Moryskah → The Wilds border
// Boss fight quest — fight an honourable opponent
// Gates: Moonlit blade (BIS for night-time combat)
quests.define('the_moonlit_duel', {
  name: 'The Moonlit Duel',
  description: 'A legendary swordsman wanders Aelgard, challenging the strongest fighters to duels under the full moon. If you can find him and fight with honour, he\'ll teach you his technique. If you cheat, he vanishes forever.',
  difficulty: 'Experienced',
  questPoints: 3,
  requirements: { skills: { attack: 45, strength: 35, agility: 30, defence: 30 } },
  steps: [
    { text: 'Hear rumours of the Moonlit Swordsman from tavern NPCs in Veilwood.' },
    { text: 'Track the swordsman through the Veilwood — he leaves silver footprints only visible at night.' },
    { text: 'He leads you to Moryskah. Follow the trail through the graveyard. Survive undead ambushes (Defence 30).' },
    { text: 'Find the swordsman at the Wilds border clearing under the full moon.' },
    { text: 'He challenges you. The rules: melee only, no prayers, no potions. Pure swordsmanship.' },
    { text: 'Duel Phase 1: test of speed. He attacks rapidly — dodge and counter (Agility 30, Attack 40).' },
    { text: 'Duel Phase 2: test of power. He blocks everything. Use strength-based attacks to break his guard (Strength 35, Attack 45).' },
    { text: 'The duel ends. Win or lose, he respects your honour. He teaches you the Moonlit Strike technique and gives you his spare blade.' },
  ],
  rewards: {
    xp: { attack: 5000, strength: 3500, agility: 2500, defence: 2000 },
    items: [{ id: 15212, name: 'Moonlit blade', count: 1 }],
    questPoints: 3,
    // Unlocks: Moonlit blade (BIS melee weapon during night-time)
    unlocks: [],
  },
});

// ══════════════════════════════════════════════════════════════════════════════
// MASTER QUESTS (8) — endgame, 3+ regions, 8-10 steps, hard bosses
// ══════════════════════════════════════════════════════════════════════════════

// ── 38. The Grand Heist ──────────────────────────────────────────────────────
// Regions: Heartlands → Sootworks → Saltbrine Reach → The Wilds
// Multi-phase stealth/combat quest — the ultimate heist
// Gates: Vault of Ages access (BIS equipment storage)
quests.define('the_grand_heist', {
  name: 'The Grand Heist',
  description: 'The Vault of Ages beneath the Heartlands castle contains artefacts from every era. It was sealed "permanently" 500 years ago. A reformed thief says he knows a way in — but it requires skills from across Aelgard and nerves of steel.',
  difficulty: 'Master',
  questPoints: 4,
  requirements: { skills: { thieving: 55, agility: 45, smithing: 40, construction: 35, magic: 30 } },
  steps: [
    { text: 'Meet the reformed thief, Old Fingers, in the Heartlands tavern basement. He lays out the heist plan.' },
    { text: 'Phase 1 — The Key: Travel to the Sootworks. Smith a skeleton key from a rare alloy that mimics any lock (Smithing 40).' },
    { text: 'Phase 2 — The Route: Travel to Saltbrine Reach. Old maps in the harbourmaster\'s archive show a forgotten sewer entrance. Steal them (Thieving 45).' },
    { text: 'Phase 3 — The Distraction: Travel to the Wilds border. Capture a wild firebeetle to use as a distraction (Agility 40).' },
    { text: 'Phase 4 — The Entry: Return to Heartlands. Navigate the sewers to the vault\'s underside (Agility 45).' },
    { text: 'Phase 5 — The Breach: Build a precision tunnel into the vault floor (Construction 35).' },
    { text: 'Phase 6 — The Vault: Inside, magical wards guard each alcove. Disarm them (Magic 30).' },
    { text: 'Phase 7 — The Lock: Pick the master vault door — the hardest lock in Aelgard (Thieving 55).' },
    { text: 'Phase 8 — The Choice: The vault contains priceless artefacts. Take one item (your choice of equipment type) and escape before the alarm resets.' },
    { text: 'Escape through the tunnel. Old Fingers seals it behind you. The vault is accessible to you from now on — legitimately.' },
  ],
  rewards: {
    xp: { thieving: 10000, agility: 6000, smithing: 4000, construction: 3000, magic: 2500 },
    items: [{ id: 15301, name: 'Vault of Ages key', count: 1 }, { id: 101, name: 'Coins', count: 20000 }],
    questPoints: 4,
    // Unlocks: Vault of Ages (BIS equipment storage, weekly loot chest)
    unlocks: [],
  },
});

// ── 39. The Siege of Hollow Mire ─────────────────────────────────────────────
// Regions: Moryskah → Heartlands → Veilwood
// Large-scale combat/defence quest — command a battle
// Gates: Hollow Mire fortress (player-owned stronghold in Moryskah)
quests.define('the_siege_of_hollow_mire', {
  name: 'The Siege of Hollow Mire',
  description: 'The vampyre armies have massed to overrun Hollow Mire. The village has no army — just you, a handful of allies, and whatever defences you can build in time. Hold the village through the night, or Moryskah falls.',
  difficulty: 'Master',
  questPoints: 4,
  requirements: { skills: { defence: 55, construction: 40, ranged: 40, magic: 35, prayer: 30 }, quests: ['blood_beneath_the_boughs'] },
  steps: [
    { text: 'Arrive at Hollow Mire. The vampyre army is 12 hours away. The village elder begs for help.' },
    { text: 'Build barricades and archer platforms around the village perimeter (Construction 40).' },
    { text: 'Travel to the Heartlands and recruit militia volunteers. They arrive by wagon.' },
    { text: 'Travel to Veilwood and request elven archers. They send 5 — better than 50 humans, they claim.' },
    { text: 'Night falls. Wave 1: vampyre thralls assault the east barricade. Command the defence (Defence 45).' },
    { text: 'Wave 2: a vampyre mage bombards the village with shadow fire. Counter-spell from the tower (Magic 35).' },
    { text: 'Wave 3: the vampyre general personally attacks. Engage in ranged combat from the archer platform (Ranged 40).' },
    { text: 'Wave 4: the barricades fail. Melee combat in the village streets (Defence 55).' },
    { text: 'Dawn approaches. Pray to accelerate the sunrise — holy magic repels the vampyre army (Prayer 30).' },
    { text: 'The vampyres retreat. Hollow Mire stands. The village elder grants you the fortress as a base of operations.' },
  ],
  rewards: {
    xp: { defence: 10000, construction: 6000, ranged: 5000, magic: 4000, prayer: 3000 },
    items: [{ id: 15302, name: 'Hollow Mire fortress key', count: 1 }, { id: 101, name: 'Coins', count: 18000 }],
    questPoints: 4,
    // Unlocks: Hollow Mire fortress (player-owned stronghold in Moryskah)
    unlocks: [],
  },
});

// ── 40. The God Forge ────────────────────────────────────────────────────────
// Regions: Sootworks → Glass Desert → Boneyard Wastes → The Inkweald
// Ultimate crafting quest — forge a godsword
// Gates: ability to forge godswords (T80 weapons)
quests.define('the_god_forge', {
  name: 'The God Forge',
  description: 'Legend speaks of a forge where the gods themselves made their weapons. It was dismantled and its components scattered across Aelgard. Reassemble the forge, and you can create weapons of divine power.',
  difficulty: 'Master',
  questPoints: 4,
  requirements: { skills: { smithing: 60, mining: 55, construction: 45, magic: 40 }, quests: ['the_iron_pilgrimage'] },
  steps: [
    { text: 'Discover the God Forge blueprints in the Sootworks restricted archives.' },
    { text: 'Component 1 — The Anvil of Wrath: mine it from the Glass Desert crystal core (Mining 55).' },
    { text: 'Component 2 — The Bellows of Wind: retrieve them from a sand-buried temple in the Boneyard Wastes. Survive the sand guardian.' },
    { text: 'Component 3 — The Quenching Pool: enter the Inkweald and capture a pool of liquid dream-essence (Magic 40).' },
    { text: 'Component 4 — The Hearth Eternal: found deep in the Sootworks Level 8, guarded by a magma wyrm (level 150).' },
    { text: 'Transport all components to the hidden God Forge cavern beneath the Sootworks.' },
    { text: 'Assemble the forge using ancient construction techniques (Construction 45).' },
    { text: 'Light the Hearth Eternal. The forge awakens.' },
    { text: 'Forge your first godsword: choose the god alignment (each grants different special attack) (Smithing 60).' },
    { text: 'The forge remains accessible to you. Future godswords require rare materials but no repeat quest.' },
  ],
  rewards: {
    xp: { smithing: 15000, mining: 10000, construction: 6000, magic: 5000 },
    items: [{ id: 15303, name: 'Godsword (player\'s choice)', count: 1 }],
    questPoints: 4,
    // Unlocks: God Forge access (craft T80 godswords)
    unlocks: [],
  },
});

// ── 41. The Dream Eater ──────────────────────────────────────────────────────
// Regions: The Inkweald → Moryskah → Glass Desert
// Boss fight quest — defeat a parasitic dream entity
// Gates: Dream Walker ability (enter dreams of sleeping NPCs for hidden content)
quests.define('the_dream_eater', {
  name: 'The Dream Eater',
  description: 'People across Aelgard are falling into comas — their dreams are being consumed by something inside the Inkweald. A parasitic entity called the Dream Eater is growing stronger with every mind it devours. Enter the dream world and destroy it before it becomes unstoppable.',
  difficulty: 'Master',
  questPoints: 4,
  requirements: { skills: { magic: 55, herblore: 45, slayer: 40, hitpoints: 50 }, quests: ['the_dreamers_debt'] },
  steps: [
    { text: 'Investigate the coma patients in the Moryskah hospital. Their brains are active but trapped.' },
    { text: 'Brew a Dream Walker elixir potent enough to enter someone else\'s dream (Herblore 45).' },
    { text: 'Enter a patient\'s dream. Inside, the dreamscape is being consumed — grey voids spreading.' },
    { text: 'Track the Dream Eater through 3 collapsing dream-layers. Each layer has a mini-boss tendril (Slayer 40).' },
    { text: 'The Dream Eater retreats to the Inkweald core. Follow it through the Glass Desert dream-mirror.' },
    { text: 'In the Inkweald core: the Dream Eater manifests. It is enormous — a writhing mass of stolen memories.' },
    { text: 'Phase 1: the Eater attacks with memory projections — fight dream versions of bosses you\'ve already beaten (Magic 45).' },
    { text: 'Phase 2: it wraps you in a nightmare. Break free using sheer willpower (Hitpoints 50 endurance check).' },
    { text: 'Phase 3: expose its true core and destroy it (Magic 55, Slayer 40). Stolen dreams pour out, returning to their owners.' },
    { text: 'Wake up. The coma patients recover. You retain the ability to walk through dreams.' },
  ],
  rewards: {
    xp: { magic: 12000, herblore: 6000, slayer: 6000, hitpoints: 5000 },
    items: [{ id: 15304, name: 'Dream Walker\'s eye', count: 1 }, { id: 101, name: 'Coins', count: 15000 }],
    questPoints: 4,
    // Unlocks: Dream Walker ability (enter sleeping NPC dreams for hidden content)
    unlocks: [],
  },
});

// ── 42. The Leviathan's Wake ─────────────────────────────────────────────────
// Regions: Saltbrine Reach → Boneyard Wastes coast → Glass Desert shore → The Wilds coast
// Sea boss quest — fight a world boss on the ocean
// Gates: Leviathan Slayer title + deep-sea fishing access
quests.define('the_leviathans_wake', {
  name: "The Leviathan's Wake",
  description: 'A sea creature the size of an island has been spotted off the coast of Aelgard. It surfaces once per century to feed. The last time it fed, it swallowed an entire fleet. You need a boat, a crew, and a weapon that can pierce its hide.',
  difficulty: 'Master',
  questPoints: 4,
  requirements: { skills: { ranged: 55, fishing: 45, construction: 35, hitpoints: 55 }, quests: ['the_siren_of_saltbrine'] },
  steps: [
    { text: 'Hear the Leviathan warning from Harbourmaster Quinn in Saltbrine Reach.' },
    { text: 'Build a reinforced warship at the Saltbrine drydock (Construction 35). Standard ships won\'t survive.' },
    { text: 'Fish for deepwater bait — the only thing that attracts the Leviathan to the surface (Fishing 45).' },
    { text: 'Sail along the Boneyard coast. Drop bait at the three ritual points.' },
    { text: 'The Leviathan surfaces near the Glass Desert shore. It is colossal.' },
    { text: 'Phase 1: it rams the ship. Survive the impact and repair the hull mid-fight (Hitpoints 50, Construction 30).' },
    { text: 'Phase 2: shoot harpoons into its hide to anchor it (Ranged 50).' },
    { text: 'Phase 3: it dives and surfaces beneath you. Leap to its back and fight across its body.' },
    { text: 'Phase 4: reach the Leviathan\'s head. Fire the killing shot into its eye (Ranged 55).' },
    { text: 'The Leviathan sinks. Its body creates a new reef — and a deep-sea fishing spot. Return to Quinn as a legend.' },
  ],
  rewards: {
    xp: { ranged: 12000, fishing: 8000, construction: 4000, hitpoints: 6000 },
    items: [{ id: 15305, name: 'Leviathan\'s eye', count: 1 }, { id: 101, name: 'Coins', count: 25000 }],
    questPoints: 4,
    // Unlocks: Leviathan Slayer title + deep-sea fishing at the new reef
    unlocks: [],
  },
});

// ── 43. The Runecaster's Paradox ─────────────────────────────────────────────
// Regions: Heartlands → The Inkweald → Glass Desert → Sootworks
// Magic/runecrafting endgame quest — unlock combination runes
// Gates: combination rune crafting (blood, soul, wrath runes)
quests.define('the_runecasters_paradox', {
  name: "The Runecaster's Paradox",
  description: 'A theoretical runecaster has discovered that runes can be combined — air and fire make smoke, water and earth make mud. But the ultimate combinations require materials from across Aelgard and a forge that shouldn\'t exist.',
  difficulty: 'Master',
  questPoints: 4,
  requirements: { skills: { runecrafting: 55, magic: 50, mining: 40, crafting: 35 }, quests: ['the_essence_convergence'] },
  steps: [
    { text: 'Meet Runecaster Nyx at the Heartlands Runecrafting Guild. She\'s proven combination runes are possible — in theory.' },
    { text: 'Travel to the Inkweald. Harvest dream-essence — the binding agent for combination runes (Mining 40 to extract it).' },
    { text: 'Travel to the Glass Desert. Find a crystal resonance chamber that can tune rune frequencies (Magic 45).' },
    { text: 'Tune 3 pairs of runes to compatible frequencies inside the chamber (Magic 50).' },
    { text: 'Travel to the Sootworks. Build a combination rune forge — it requires both heat and cold simultaneously (Crafting 35).' },
    { text: 'Craft your first combination rune: a smoke rune (air + fire + dream-essence) (Runecrafting 50).' },
    { text: 'Craft a blood rune: the hardest combination, requiring life energy (Runecrafting 55). Nyx warns this rune is dangerous.' },
    { text: 'Test the blood rune. It works — but drains your hitpoints when crafted. The cost of power.' },
    { text: 'Return to Nyx with samples. She publishes the research. Combination rune crafting is now available to you permanently.' },
  ],
  rewards: {
    xp: { runecrafting: 12000, magic: 8000, mining: 4000, crafting: 3000 },
    items: [{ id: 15306, name: 'Runecaster\'s tome', count: 1 }, { id: 15307, name: 'Blood rune', count: 100 }],
    questPoints: 4,
    // Unlocks: combination rune crafting (blood, soul, wrath runes)
    unlocks: [],
  },
});

// ── 44. The Hunt for the Wilds King ──────────────────────────────────────────
// Regions: The Wilds → Boneyard Wastes → Moryskah
// Hunter/combat endgame quest — track and fight the apex predator
// Gates: Wilds King trophy (BIS hunter cape)
quests.define('the_hunt_for_the_wilds_king', {
  name: 'The Hunt for the Wilds King',
  description: 'The Wilds King is a mythical beast — part bear, part dragon, part nightmare. Nobody who has seen it has survived to describe it accurately. Track it across the most dangerous terrain in Aelgard and bring back proof it exists.',
  difficulty: 'Master',
  questPoints: 4,
  requirements: { skills: { hunter: 55, attack: 50, hitpoints: 55, firemaking: 35 }, quests: ['the_wilds_expedition'] },
  steps: [
    { text: 'Talk to the Wilds Ranger Captain at the border fort. She shows you the claw marks — each one wider than a man.' },
    { text: 'Enter the Wilds. Track the beast using advanced hunter techniques (Hunter 45). Its prints burn the ground.' },
    { text: 'Set up a base camp. Light a perimeter of watch-fires to deter lesser predators (Firemaking 35).' },
    { text: 'The tracks lead into the Boneyard Wastes border. The beast is crossing regions.' },
    { text: 'Find its den in a canyon between the Wastes and Moryskah. Set a lure (Hunter 55).' },
    { text: 'The Wilds King emerges. It is enormous and terrifying.' },
    { text: 'Phase 1: it charges. Dodge and counter (Attack 45, Hitpoints 50).' },
    { text: 'Phase 2: it breathes shadow-fire. Find cover and flank it.' },
    { text: 'Phase 3: wounded, it becomes faster and more unpredictable. Deliver the killing blow (Attack 50, Hitpoints 55).' },
    { text: 'Claim the Wilds King\'s trophy. Return to the Ranger Captain. You are now a legend of the Wilds.' },
  ],
  rewards: {
    xp: { hunter: 12000, attack: 8000, hitpoints: 6000, firemaking: 3000 },
    items: [{ id: 15308, name: 'Wilds King trophy', count: 1 }, { id: 15309, name: 'Wilds King cape', count: 1 }],
    questPoints: 4,
    // Unlocks: Wilds King cape (BIS hunter cape)
    unlocks: [],
  },
});

// ── 45. The Council of Shadows ───────────────────────────────────────────────
// Regions: Heartlands → Moryskah → Saltbrine Reach → Sootworks
// Political intrigue/stealth/combat quest — expose a conspiracy
// Gates: Council intelligence briefings (weekly hints about upcoming content/events)
quests.define('the_council_of_shadows', {
  name: 'The Council of Shadows',
  description: 'Someone is pulling strings across Aelgard — manipulating wars, funding bandits, destabilizing trade. A secret council of powerful figures meets in a different location each month. Infiltrate the next meeting and expose them.',
  difficulty: 'Master',
  questPoints: 4,
  requirements: { skills: { thieving: 50, magic: 45, agility: 40, crafting: 35, defence: 35 } },
  steps: [
    { text: 'Spymaster Eliza contacts you. She\'s identified the Council of Shadows — 5 members from 5 regions, meeting in the Heartlands castle catacombs.' },
    { text: 'Travel to Moryskah. Steal a Council member\'s invitation token from their vampyre mansion (Thieving 45).' },
    { text: 'Travel to Saltbrine. Craft a disguise using the token and a face-changing amulet (Crafting 35, Magic 40).' },
    { text: 'Travel to the Sootworks. Acquire a recording device from the engineers (Crafting 30).' },
    { text: 'Return to the Heartlands. Enter the catacombs using the invitation (Thieving 50 to bypass final checkpoint).' },
    { text: 'Attend the Council meeting in disguise. Record their plans.' },
    { text: 'The Council detects your disguise. Fight your way out through their guards (Defence 35, Agility 40).' },
    { text: 'Escape the catacombs through a collapsing tunnel (Agility 40).' },
    { text: 'Deliver the recording to Eliza. The Council members are arrested — except one, who escapes.' },
    { text: 'Eliza establishes a permanent intelligence service. You have access to weekly briefings.' },
  ],
  rewards: {
    xp: { thieving: 10000, magic: 6000, agility: 5000, crafting: 4000, defence: 3000 },
    items: [{ id: 15310, name: 'Shadow council seal', count: 1 }, { id: 101, name: 'Coins', count: 20000 }],
    questPoints: 4,
    // Unlocks: weekly intelligence briefings (hints about upcoming events)
    unlocks: [],
  },
});

// ══════════════════════════════════════════════════════════════════════════════
// GRANDMASTER QUESTS (5) — ultimate challenges, 4+ regions, 8-12 steps
// ══════════════════════════════════════════════════════════════════════════════

// ── 46. The Shattered Covenant ───────────────────────────────────────────────
// Regions: ALL 8 regions
// World-affecting quest — the gods' pact is breaking
// Gates: Covenant Shard (access to divine abilities based on chosen god)
quests.define('the_shattered_covenant', {
  name: 'The Shattered Covenant',
  description: 'The ancient covenant between Aelgard\'s gods is breaking. Each god sealed a fragment of their power in a different region. As the covenant shatters, the fragments are awakening — and every faction in Aelgard wants them. Collect all 8 fragments before chaos consumes the world.',
  difficulty: 'Grandmaster',
  questPoints: 5,
  requirements: {
    skills: { attack: 70, magic: 65, prayer: 60, agility: 50, mining: 50, herblore: 45, thieving: 40, crafting: 40 },
    quests: ['echoes_of_the_deep', 'the_prism_throne'],
  },
  steps: [
    { text: 'Crystal Sage Orin contacts you with an urgent warning: the sky is cracking. The covenant that holds reality together is failing.' },
    { text: 'Fragment 1 — Heartlands: the fragment is in the king\'s hidden vault. Solve the royal puzzle lock to retrieve it (Thieving 40, Crafting 35).' },
    { text: 'Fragment 2 — Boneyard Wastes: buried beneath the First Empire ruins. Mine through cursed bedrock (Mining 50). Survive the guardian construct.' },
    { text: 'Fragment 3 — Moryskah: held by the vampyre council. Infiltrate their stronghold and negotiate or fight for it (Attack 60, Prayer 50).' },
    { text: 'Fragment 4 — Veilwood: woven into the roots of the Heart-Oak. The elves will only surrender it if you cure the tree\'s ancient sickness (Herblore 45).' },
    { text: 'Fragment 5 — Sootworks: powering the Paradox Engine. Removing it risks destroying the machine. Carefully extract it (Crafting 40, Mining 45).' },
    { text: 'Fragment 6 — Saltbrine Reach: sunk in the deepest trench. The siren\'s descendants guard it. Negotiate passage (Prayer 55).' },
    { text: 'Fragment 7 — The Inkweald: the Dreamer absorbed it. Enter the dream and extract it without waking them (Magic 65).' },
    { text: 'Fragment 8 — Glass Desert: fused with the sleeping titan\'s heart. Approach the titan and surgically remove the fragment (Agility 50, Attack 70).' },
    { text: 'Combine all 8 fragments at the Covenant Altar atop the highest peak in Aelgard.' },
    { text: 'CHOICE: Restore the old covenant (gods remain as they are) or forge a new covenant (gods are weakened but mortals gain divine abilities).' },
    { text: 'The sky heals. Aelgard is changed. Your choice echoes across the server.' },
  ],
  rewards: {
    xp: { attack: 25000, magic: 20000, prayer: 15000, agility: 8000, mining: 8000, herblore: 6000, thieving: 5000, crafting: 5000 },
    items: [{ id: 15401, name: 'Covenant shard', count: 1 }, { id: 101, name: 'Coins', count: 50000 }],
    questPoints: 5,
    // Unlocks: divine abilities based on chosen covenant path
    unlocks: [],
  },
});

// ── 47. The Architect of Ruin ────────────────────────────────────────────────
// Regions: Sootworks → Glass Desert → The Inkweald → Moryskah → Heartlands
// The escaped Council member from quest 45 returns
// Gates: Architect's Blueprints (build endgame player structures)
quests.define('the_architect_of_ruin', {
  name: 'The Architect of Ruin',
  description: 'The Council of Shadows member who escaped is building something in secret — a weapon that can unmake reality itself. They call themselves the Architect, and their blueprints are scattered across Aelgard. Find them, destroy the weapon, and stop the Architect before they rewrite the world.',
  difficulty: 'Grandmaster',
  questPoints: 5,
  requirements: {
    skills: { construction: 60, smithing: 55, magic: 55, defence: 50, mining: 45 },
    quests: ['the_council_of_shadows', 'the_cogfathers_paradox'],
  },
  steps: [
    { text: 'Spymaster Eliza summons you. The Architect has been spotted in the Sootworks deep levels, stealing Cogfather technology.' },
    { text: 'Travel to the Sootworks. Find the Architect\'s abandoned workshop on Level 9. Recover their blueprints (Mining 45 to clear rubble).' },
    { text: 'The blueprints describe a Reality Engine — a machine that can rewrite the laws of physics in a localized area.' },
    { text: 'Track the Architect to the Glass Desert. They\'re harvesting crystal resonance for the Engine. Sabotage the harvesting rig (Construction 50).' },
    { text: 'The Architect flees to the Inkweald. Follow them through a dream portal.' },
    { text: 'In the Inkweald, the Architect is testing the Engine. Reality warps around you. Navigate the distorted landscape (Magic 50).' },
    { text: 'Destroy the Engine\'s 3 anchor points using counter-construction techniques (Construction 60, Smithing 50).' },
    { text: 'The Architect retreats to Moryskah with the Engine\'s core. Pursue them to Castle Malachar.' },
    { text: 'Battle through the castle\'s enchanted defences (Defence 50, Magic 55).' },
    { text: 'Confront the Architect in the throne room. Boss fight: the Architect wields the Engine core, reshaping the room mid-fight (Smithing 55 to forge counter-devices on the fly).' },
    { text: 'Defeat the Architect. The Engine core shatters. Return to the Heartlands with the Architect\'s blueprints.' },
    { text: 'Eliza secures the blueprints. But you keep copies — the construction techniques are invaluable.' },
  ],
  rewards: {
    xp: { construction: 20000, smithing: 15000, magic: 12000, defence: 8000, mining: 6000 },
    items: [{ id: 15402, name: 'Architect\'s blueprints', count: 1 }, { id: 101, name: 'Coins', count: 40000 }],
    questPoints: 5,
    // Unlocks: Architect's Blueprints (build endgame player structures)
    unlocks: [],
  },
});

// ── 48. The Eternal Hunt ─────────────────────────────────────────────────────
// Regions: The Wilds → Veilwood → Boneyard Wastes → The Inkweald → Glass Desert
// Ultimate hunter/slayer quest — track the unkillable beast
// Gates: Eternal Hunter title + beast-tracking passive (see monster weak points)
quests.define('the_eternal_hunt', {
  name: 'The Eternal Hunt',
  description: 'Across the ages, hunters have spoken of the Everborn — a beast that cannot die permanently. It reforms after every kill, stronger than before. The only way to end it is to kill it in every region simultaneously. You need the skills, the speed, and allies across Aelgard.',
  difficulty: 'Grandmaster',
  questPoints: 5,
  requirements: {
    skills: { hunter: 65, slayer: 55, ranged: 55, agility: 50, herblore: 40 },
    quests: ['the_hunt_for_the_wilds_king', 'blood_beneath_the_boughs'],
  },
  steps: [
    { text: 'The Wilds Ranger Captain reports an impossible creature: it was killed yesterday and is alive today, larger.' },
    { text: 'Track the Everborn through the Wilds. Discover it leaves tracks in 5 regions simultaneously (Hunter 55).' },
    { text: 'Travel to Veilwood. Find the Everborn\'s lair entrance — a cave hidden behind a waterfall (Agility 50).' },
    { text: 'Inside, discover the beast\'s regeneration core: a magical organ that stores its life across multiple locations.' },
    { text: 'Travel to the Boneyard Wastes. Find the second regeneration node buried in bone-sand (Hunter 65).' },
    { text: 'Brew a regeneration-suppression potion (Herblore 40). You need 5 doses — one per node.' },
    { text: 'Inject the potion into the Boneyard node. It goes dormant (Slayer 45).' },
    { text: 'Travel to the Inkweald. The third node is inside a dream-beast echo. Slay it (Slayer 55, Ranged 50).' },
    { text: 'Travel to the Glass Desert. The fourth node is encased in crystal. Shatter it with ranged attacks (Ranged 55).' },
    { text: 'Return to the Wilds. The Everborn is weakened. Fight it — truly — for the last time.' },
    { text: 'The Everborn is a massive multi-phase boss. Kill it while it cycles through forms from each region. When it falls, it stays down.' },
    { text: 'Claim the Eternal Hunter title. The beast\'s tracking instincts are imprinted on you permanently.' },
  ],
  rewards: {
    xp: { hunter: 20000, slayer: 15000, ranged: 12000, agility: 8000, herblore: 5000 },
    items: [{ id: 15403, name: 'Everborn fang necklace', count: 1 }, { id: 15404, name: 'Eternal hunter\'s cape', count: 1 }],
    questPoints: 5,
    // Unlocks: Eternal Hunter title + passive beast-tracking (see monster weak points)
    unlocks: [],
  },
});

// ── 49. The World Wound ──────────────────────────────────────────────────────
// Regions: Glass Desert → Boneyard Wastes → Sootworks → Moryskah → The Inkweald
// Ultimate magic/prayer quest — heal a rift in reality
// Gates: World Mender ability (passive HP regeneration everywhere)
quests.define('the_world_wound', {
  name: 'The World Wound',
  description: 'A wound has opened in the sky above the Glass Desert — a tear in reality itself. Through it, things from outside Aelgard are leaking in. Close the wound before the world is consumed, or learn to live with what comes through.',
  difficulty: 'Grandmaster',
  questPoints: 5,
  requirements: {
    skills: { magic: 70, prayer: 65, runecrafting: 50, hitpoints: 60, farming: 40 },
    quests: ['the_dream_eater', 'the_shattered_covenant'],
  },
  steps: [
    { text: 'Witness the World Wound open above the Glass Desert. Reality-aberrations are pouring through.' },
    { text: 'Fight the first wave of aberrations. They don\'t follow normal combat rules — prayer and magic are essential (Magic 60, Prayer 55).' },
    { text: 'Travel to the Boneyard Wastes. The First Empire chronicles describe a similar event millennia ago. Research the ancient solution (Prayer 60).' },
    { text: 'The solution requires a Reality Suture — woven from the strongest magical threads in Aelgard.' },
    { text: 'Travel to the Sootworks. Mine reality-anchor ore from the deepest level — it exists between dimensions (Mining 45).' },
    { text: 'Craft the Reality Suture needle using combination runes and anchor ore (Runecrafting 50).' },
    { text: 'Travel to Moryskah. Grow a thread of living magic from a rare spore that feeds on death (Farming 40). The thread must be cultivated in cursed soil.' },
    { text: 'Travel to the Inkweald. Thread the needle through the dream-fabric to test it (Magic 70).' },
    { text: 'Return to the Glass Desert. Ascend to the wound using a crystal elevator.' },
    { text: 'Sew the wound shut. Each stitch is a boss fight — 5 aberration guardians try to hold the wound open (Hitpoints 60, Prayer 65).' },
    { text: 'The final stitch seals the wound. A scar remains in the sky — a reminder. Reality is whole again.' },
    { text: 'The Crystal Sage grants you the World Mender title. Your body regenerates faster in all regions.' },
  ],
  rewards: {
    xp: { magic: 25000, prayer: 20000, runecrafting: 10000, hitpoints: 10000, farming: 5000 },
    items: [{ id: 15405, name: 'Reality suture needle', count: 1 }, { id: 101, name: 'Coins', count: 50000 }],
    questPoints: 5,
    // Unlocks: World Mender ability (passive HP regeneration in all regions)
    unlocks: [],
  },
});

// ── 50. The Last Adventurer ──────────────────────────────────────────────────
// Regions: Heartlands → Veilwood → Saltbrine Reach → Sootworks → Boneyard Wastes → Moryskah → The Inkweald → Glass Desert
// The ultimate quest — a farewell tour of all of Aelgard
// Gates: Aelgard Champion title (cosmetic crown + all teleports unlocked)
quests.define('the_last_adventurer', {
  name: 'The Last Adventurer',
  description: 'You have done everything. Saved the world, forged godswords, healed reality. But there is one final quest: the Adventurers\' Guild\'s ultimate trial. Visit every region, complete a unique challenge in each, and return as the undisputed champion of Aelgard. No one has ever finished it.',
  difficulty: 'Grandmaster',
  questPoints: 5,
  requirements: {
    skills: { attack: 75, strength: 60, defence: 60, ranged: 60, magic: 60, prayer: 55, hitpoints: 65, cooking: 50, fishing: 45, woodcutting: 45, firemaking: 40, crafting: 50, fletching: 40, herblore: 45, agility: 50, thieving: 45, slayer: 50, farming: 40, runecrafting: 40, hunter: 45, mining: 50, smithing: 50, construction: 40 },
    quests: ['the_shattered_covenant', 'the_god_forge', 'the_world_wound'],
  },
  steps: [
    { text: 'Talk to the Guildmaster at the Heartlands Adventurers\' Guild. She presents the Champion\'s Scroll — 8 trials, one per region.' },
    { text: 'Trial 1 — Heartlands: Cook a feast for 100 soldiers using only foraged ingredients (Cooking 50, Farming 40).' },
    { text: 'Trial 2 — Veilwood: Navigate the entire canopy course blindfolded — using only sound and touch (Agility 50, Hunter 45).' },
    { text: 'Trial 3 — Saltbrine Reach: Catch the legendary Golden Leviathan fish that surfaces once per year (Fishing 45, Strength 60).' },
    { text: 'Trial 4 — Sootworks: Build a clockwork automaton from scratch that can pass a Turing test with the Paradox Engine (Construction 40, Smithing 50, Crafting 50).' },
    { text: 'Trial 5 — Boneyard Wastes: Survive 24 hours alone in the deep desert with no supplies — only your skills (Mining 50, Firemaking 40, Woodcutting 45, Hitpoints 65).' },
    { text: 'Trial 6 — Moryskah: Defeat the vampyre champion in single combat while under a curse that halves your stats (Attack 75, Defence 60, Prayer 55).' },
    { text: 'Trial 7 — The Inkweald: Craft a Dream Rune that contains an original thought — something the dream has never seen before (Runecrafting 40, Magic 60, Herblore 45).' },
    { text: 'Trial 8 — Glass Desert: Stand before the Prism Throne and answer its question truthfully. The throne reads your entire quest history. If you have acted with honour throughout, you pass. If not, you must atone.' },
    { text: 'Return to the Guildmaster with all 8 trial completions stamped on the Champion\'s Scroll.' },
    { text: 'The Guildmaster crowns you Champion of Aelgard. Every teleport in the game is unlocked. A statue of you appears in the Heartlands square.' },
  ],
  rewards: {
    xp: { attack: 20000, strength: 10000, defence: 10000, ranged: 10000, magic: 15000, prayer: 10000, hitpoints: 10000, cooking: 8000, fishing: 6000, woodcutting: 6000, firemaking: 5000, crafting: 8000, fletching: 5000, herblore: 6000, agility: 8000, thieving: 5000, slayer: 8000, farming: 5000, runecrafting: 5000, hunter: 6000, mining: 8000, smithing: 8000, construction: 5000 },
    items: [{ id: 15406, name: 'Champion\'s crown', count: 1 }, { id: 101, name: 'Coins', count: 100000 }],
    questPoints: 5,
    // Unlocks: Aelgard Champion title + cosmetic crown + all teleports unlocked
    unlocks: [],
  },
});

console.log('[aelgard] Quest mega-expansion: 50 quests loaded');
