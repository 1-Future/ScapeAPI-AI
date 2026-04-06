// ══════════════════════════════════════════════════════════════════════════════
// SYSTEM PLUGINS: Core engine features from Build Your Own Scape design docs
// These are meta-mechanics — the systems that content mechanics plug into.
// ══════════════════════════════════════════════════════════════════════════════

const { define } = require('../mechanic');

const SYSTEMS = [
  // Equipment systems
  { id: 'sys-weight',         name: 'Weight System',            desc: 'Items contribute to carry weight, affecting run energy drain', category: 'engine' },
  { id: 'sys-degradation',    name: 'Item Degradation',         desc: 'Items lose durability through use and require repair', category: 'economy' },
  { id: 'sys-stat-reqs',      name: 'Stat Requirements',        desc: 'Items require minimum skill levels to equip', category: 'engine' },
  { id: 'sys-combat-bonuses',  name: 'Combat Bonuses',          desc: 'Items provide offensive and defensive stat modifiers', category: 'combat' },
  { id: 'sys-set-bonuses',    name: 'Set Bonuses',              desc: 'Wearing multiple items from a set grants additional effects', category: 'combat' },
  { id: 'sys-enchanting',     name: 'Enchanting',               desc: 'Items can be enchanted using skills and materials', category: 'skill' },
  { id: 'sys-imbuing',        name: 'Imbuing',                  desc: 'Items can be imbued through minigames or achievements', category: 'skill' },
  { id: 'sys-weapon-scaling', name: 'Weapon Scaling',            desc: 'Weapon damage scales with player progression or conditions', category: 'combat' },
  { id: 'sys-special-attacks', name: 'Special Attack System',   desc: 'Weapons have unique special attack abilities consuming energy', category: 'combat' },
  { id: 'sys-fashion',        name: 'Fashion/Transmog',          desc: 'Items support cosmetic appearance overrides', category: 'visual' },
  { id: 'sys-untradeables',   name: 'Untradeable Items',        desc: 'Certain items cannot be traded between players', category: 'economy' },

  // Skill systems
  { id: 'sys-xp-curves',      name: 'XP Curve System',          desc: 'Level progression follows exponential XP table', category: 'engine' },
  { id: 'sys-level-caps',     name: 'Level Caps',               desc: 'Skills have maximum levels (99, 120, or custom)', category: 'engine' },
  { id: 'sys-milestones',     name: 'Skill Milestones',         desc: 'Levels unlock new content, abilities, and items', category: 'engine' },
  { id: 'sys-skill-cape',     name: 'Skill Capes',              desc: '99 in a skill earns a cape with emote and perk', category: 'achievement' },
  { id: 'sys-virtual-levels', name: 'Virtual Levels',           desc: 'Track XP progress beyond 99 up to 200M', category: 'tracking' },
  { id: 'sys-boosted-levels', name: 'Boosted Levels',           desc: 'Potions and prayers temporarily increase effective level', category: 'combat' },
  { id: 'sys-skill-calc',     name: 'Skill Calculator',         desc: 'Calculate XP needed, actions required, time estimates', category: 'tool' },

  // Combat systems
  { id: 'sys-combat-triangle', name: 'Combat Triangle',         desc: 'Melee beats ranged, ranged beats magic, magic beats melee', category: 'combat' },
  { id: 'sys-prayer-system',  name: 'Prayer System',            desc: 'Activatable buffs that drain prayer points over time', category: 'combat' },
  { id: 'sys-slayer-system',  name: 'Slayer System',            desc: 'Task-based monster killing with level requirements', category: 'combat' },
  { id: 'sys-hitpoints',      name: 'Hitpoints System',         desc: 'Health, damage, healing, death mechanics', category: 'combat' },
  { id: 'sys-run-energy',     name: 'Run Energy System',        desc: 'Movement energy drain and restoration', category: 'movement' },
  { id: 'sys-poison',         name: 'Poison System',            desc: 'Damage over time that decreases, curable by antidote', category: 'combat' },
  { id: 'sys-venom',          name: 'Venom System',             desc: 'Stronger DOT that increases, requires anti-venom', category: 'combat' },
  { id: 'sys-freeze',         name: 'Freeze/Snare System',      desc: 'Immobilize target for N ticks', category: 'combat' },

  // Quest systems
  { id: 'sys-quest-points',   name: 'Quest Point System',       desc: 'Quests award QP, total QP unlocks content', category: 'quest' },
  { id: 'sys-quest-helper',   name: 'Quest Helper',             desc: 'Step-by-step guidance overlay', category: 'tool' },
  { id: 'sys-quest-series',   name: 'Quest Series',             desc: 'Quests chain into storylines with sequential requirements', category: 'quest' },
  { id: 'sys-quest-replay',   name: 'Quest Replay',             desc: 'Replay completed quests for fun (no rewards)', category: 'quest' },

  // Economy systems
  { id: 'sys-ge-system',      name: 'Grand Exchange',           desc: 'Centralized marketplace with buy/sell offers', category: 'economy' },
  { id: 'sys-trading',        name: 'Player Trading',           desc: 'Direct item/coin exchange between players', category: 'economy' },
  { id: 'sys-alchemy',        name: 'Alchemy System',           desc: 'Convert items to coins via high/low alchemy', category: 'economy' },
  { id: 'sys-price-tracking', name: 'Price Tracking',           desc: 'Track GE prices over time, graphs, alerts', category: 'tool' },
  { id: 'sys-item-stacking',  name: 'Item Stacking',            desc: 'Some items stack in inventory, most dont', category: 'engine' },
  { id: 'sys-noting',         name: 'Item Noting',              desc: 'Convert items to noted form for bank/trade', category: 'engine' },
  { id: 'sys-coin-pouch',     name: 'Coin Pouch',               desc: 'Coins from thieving go to pouch, must open', category: 'economy' },

  // World systems
  { id: 'sys-tile-system',    name: 'Tile System',              desc: 'World divided into walkable/unwalkable tiles', category: 'engine' },
  { id: 'sys-chunk-system',   name: 'Chunk System',             desc: '64x64 tile regions for loading/streaming', category: 'engine' },
  { id: 'sys-wall-system',    name: 'Wall/Edge System',         desc: 'Per-tile-edge blocking for walls, fences, doors', category: 'engine' },
  { id: 'sys-pathfinding',    name: 'Pathfinding',              desc: 'A* algorithm for player and NPC movement', category: 'engine' },
  { id: 'sys-los',            name: 'Line of Sight',            desc: 'Raycasting for combat range and visibility', category: 'engine' },
  { id: 'sys-instancing',     name: 'Instance System',          desc: 'Create private copies of areas for bosses/minigames', category: 'engine' },
  { id: 'sys-day-night',      name: 'Day/Night Cycle',          desc: 'Optional visual and gameplay time cycle', category: 'visual' },
  { id: 'sys-weather',        name: 'Weather System',           desc: 'Rain, snow, fog affecting gameplay or visuals', category: 'visual' },

  // Social systems
  { id: 'sys-friends-list',   name: 'Friends List',             desc: 'Track online status, world of friends', category: 'social' },
  { id: 'sys-ignore-list',    name: 'Ignore List',              desc: 'Block messages from specific players', category: 'social' },
  { id: 'sys-clan-system',    name: 'Clan System',              desc: 'Player groups with ranks, chat, events', category: 'social' },
  { id: 'sys-group-ironman',  name: 'Group Ironman',            desc: 'Shared bank and prestige within small teams', category: 'mode' },
  { id: 'sys-chat-channels',  name: 'Chat Channels',            desc: 'Public, private, clan, group, trade chat', category: 'social' },

  // Account systems
  { id: 'sys-ironman',        name: 'Ironman Mode',             desc: 'Self-sufficient account, no trading', category: 'mode' },
  { id: 'sys-hardcore-iron',  name: 'Hardcore Ironman',         desc: 'Ironman with one life (death = downgrade)', category: 'mode' },
  { id: 'sys-ultimate-iron',  name: 'Ultimate Ironman',         desc: 'Ironman with no bank access', category: 'mode' },
  { id: 'sys-leagues',        name: 'Leagues/Seasonal',         desc: 'Temporary worlds with modified rules and relics', category: 'mode' },
  { id: 'sys-deadman',        name: 'Deadman Mode',             desc: 'PvP everywhere, XP loss on death', category: 'mode' },
  { id: 'sys-speedrunning',   name: 'Speedrunning',             desc: 'Timed quest completion with leaderboards', category: 'mode' },

  // Death systems
  { id: 'sys-gravestone',     name: 'Gravestone System',        desc: 'Items dropped at death location with timer', category: 'death' },
  { id: 'sys-item-reclaim',   name: 'Item Reclaim',             desc: 'Pay fee to recover items from Death', category: 'death' },
  { id: 'sys-hcim-death',     name: 'HCIM Death',               desc: 'Hardcore status lost on death', category: 'death' },
  { id: 'sys-safe-death',     name: 'Safe Deaths',              desc: 'Some content has no item loss (minigames, quests)', category: 'death' },

  // Misc systems
  { id: 'sys-collection-log', name: 'Collection Log',           desc: 'Track all unique drops, unlocks, completions', category: 'tracking' },
  { id: 'sys-hiscores',       name: 'Hiscores',                 desc: 'Global rankings by skill, boss KC, minigame score', category: 'tracking' },
  { id: 'sys-achievement-diary',name:'Achievement Diary System',desc: 'Region-based task lists with tiered rewards', category: 'achievement' },
  { id: 'sys-combat-achievements',name:'Combat Achievement System',desc:'Boss-specific challenges with tiered rewards', category: 'achievement' },
  { id: 'sys-loot-tracker',   name: 'Loot Tracker',             desc: 'Track drops, value, and rates per boss/activity', category: 'tool' },
  { id: 'sys-xp-tracker',     name: 'XP Tracker',               desc: 'Track XP gained per session, rates, goals', category: 'tool' },
  { id: 'sys-bank-tabs',      name: 'Bank Tab System',          desc: 'Organize bank into tabs with custom layouts', category: 'engine' },
  { id: 'sys-bank-presets',   name: 'Bank Presets',              desc: 'Save and load equipment/inventory configurations', category: 'engine' },
  { id: 'sys-ground-items',   name: 'Ground Item System',       desc: 'Items on ground visible to players, despawn timer', category: 'engine' },
  { id: 'sys-random-events',  name: 'Random Event System',      desc: 'Periodic interruptions with rewards', category: 'engine' },
  { id: 'sys-pet-system',     name: 'Pet System',               desc: 'Rare drops that follow player, insurable', category: 'tracking' },
  { id: 'sys-music-system',   name: 'Music System',             desc: 'Region-based tracks, unlock on visit', category: 'visual' },
  { id: 'sys-emote-system',   name: 'Emote System',             desc: 'Player animations for social interaction', category: 'visual' },
  { id: 'sys-fairy-ring',     name: 'Fairy Ring Network',        desc: 'Code-based teleport network', category: 'transport' },
  { id: 'sys-spirit-tree',    name: 'Spirit Tree Network',       desc: 'Tree-based teleport network, plantable', category: 'transport' },
];

for (const s of SYSTEMS) {
  define({
    id: s.id, name: s.name, type: 'system',
    atoms: {},
    config: { description: s.desc, category: s.category }
  });
}

console.log(`[defs] System Plugins: ${SYSTEMS.length} systems`);
