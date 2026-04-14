// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Random Events + Daily Content
//
// Random events: surprise encounters while skilling/training. Reward XP lamps.
// Dailies: recurring content that gives reason to log in every day.
// Birdhouse runs, farming runs, battlestaves, herb boxes.
//
// These create the "I should log in today" loop without being punishing.
// Missing a day costs nothing. Doing it every day compounds progress.
// ══════════════════════════════════════════════════════════════════════════════

const items = require('../../data/items');

// ── Random Event Definitions ───────────────────────────────────────────────

const randomEvents = [];

function defineRandomEvent(opts) {
  randomEvents.push({
    id: opts.id, name: opts.name,
    triggerSkill: opts.triggerSkill || 'any', // which skill triggers this
    chance: opts.chance || 0.001, // per action chance
    type: opts.type, // 'quiz', 'combat', 'puzzle', 'dialogue', 'minigame'
    reward: opts.reward,
    description: opts.description,
  });
}

defineRandomEvent({ id: 're_genie', name: 'Genie', type: 'dialogue', triggerSkill: 'any', chance: 0.0005,
  reward: { type: 'xp_lamp', amount: 'level * 10' }, description: 'A genie appears with an XP lamp. Choose which skill to use it on.' });
defineRandomEvent({ id: 're_quiz_master', name: 'Quiz Master', type: 'quiz', triggerSkill: 'any', chance: 0.0003,
  reward: { type: 'mystery_box' }, description: 'Answer a trivia question about Aelgard for a mystery box.' });
defineRandomEvent({ id: 're_evil_bob', name: 'Evil Chicken', type: 'combat', triggerSkill: 'any', chance: 0.0002,
  reward: { type: 'feathers', amount: 100 }, description: 'An evil chicken attacks! Kill it for feathers.' });
defineRandomEvent({ id: 're_maze', name: 'Maze', type: 'puzzle', triggerSkill: 'any', chance: 0.0003,
  reward: { type: 'coins', amount: 'combat_level * 100' }, description: 'Navigate a small maze for a coin reward.' });
defineRandomEvent({ id: 're_drill_demon', name: 'Drill Demon', type: 'minigame', triggerSkill: 'any', chance: 0.0003,
  reward: { type: 'costume_piece' }, description: 'Follow the drill demon\'s orders (emotes) for a camo outfit piece.' });
defineRandomEvent({ id: 're_rock_golem_re', name: 'Rock Golem', type: 'combat', triggerSkill: 'mining', chance: 0.001,
  reward: { type: 'ore', amount: 10 }, description: 'A rock golem spawns while mining! Kill it for bonus ore.' });
defineRandomEvent({ id: 're_tree_spirit_re', name: 'Tree Spirit', type: 'combat', triggerSkill: 'woodcutting', chance: 0.001,
  reward: { type: 'logs', amount: 10 }, description: 'A tree spirit spawns while chopping! Kill it for bonus logs.' });
defineRandomEvent({ id: 're_river_troll', name: 'River Troll', type: 'combat', triggerSkill: 'fishing', chance: 0.001,
  reward: { type: 'fish', amount: 10 }, description: 'A river troll spawns while fishing! Kill it for bonus fish.' });
defineRandomEvent({ id: 're_shade_re', name: 'Shade', type: 'combat', triggerSkill: 'prayer', chance: 0.001,
  reward: { type: 'bones', amount: 5 }, description: 'A shade appears while burying bones! Kill it for dragon bones.' });
defineRandomEvent({ id: 're_sandwich_lady', name: 'Sandwich Lady', type: 'dialogue', triggerSkill: 'any', chance: 0.0005,
  reward: { type: 'food', amount: 5 }, description: 'The Sandwich Lady offers you free food! Pick the right item.' });

// ── Random Event Items ─────────────────────────────────────────────────────

items.define({ id: 85001, name: 'XP lamp (small)', examine: 'A small experience lamp. Grants XP equal to level × 10 in a chosen skill.', value: 0, category: 'misc', tradeable: false });
items.define({ id: 85002, name: 'XP lamp (medium)', examine: 'A medium experience lamp. Grants XP equal to level × 25 in a chosen skill.', value: 0, category: 'misc', tradeable: false });
items.define({ id: 85003, name: 'XP lamp (large)', examine: 'A large experience lamp. Grants XP equal to level × 50 in a chosen skill.', value: 0, category: 'misc', tradeable: false });
items.define({ id: 85004, name: 'Mystery box', examine: 'Open for a random reward. Could be anything.', value: 0, category: 'misc', tradeable: false });

// Costume pieces from random events (cosmetic only)
items.define({ id: 85010, name: 'Camo top', examine: 'Camouflage top from the Drill Demon.', value: 0, category: 'armour', equipSlot: 'body', stats: {}, tradeable: false });
items.define({ id: 85011, name: 'Camo bottoms', examine: 'Camouflage bottoms.', value: 0, category: 'armour', equipSlot: 'legs', stats: {}, tradeable: false });
items.define({ id: 85012, name: 'Camo helmet', examine: 'Camouflage helmet.', value: 0, category: 'armour', equipSlot: 'head', stats: {}, tradeable: false });
items.define({ id: 85013, name: 'Lederhosen hat', examine: 'A traditional hat from the Freaky Forester.', value: 0, category: 'armour', equipSlot: 'head', stats: {}, tradeable: false });
items.define({ id: 85014, name: 'Zombie outfit (head)', examine: 'A zombie mask from Gravedigger.', value: 0, category: 'armour', equipSlot: 'head', stats: {}, tradeable: false });
items.define({ id: 85015, name: 'Zombie outfit (top)', examine: 'A zombie top.', value: 0, category: 'armour', equipSlot: 'body', stats: {}, tradeable: false });

// ── Daily Content ──────────────────────────────────────────────────────────

const dailies = [];

function defineDaily(opts) {
  dailies.push({
    id: opts.id, name: opts.name,
    type: opts.type, // 'shop', 'activity', 'passive'
    resetInterval: opts.resetInterval || 'daily', // daily, weekly, monthly
    reward: opts.reward,
    requirements: opts.requirements || {},
    description: opts.description,
  });
}

// Shop dailies (buy limited stock that resets daily)
defineDaily({ id: 'daily_battlestaves', name: 'Battlestaff purchase', type: 'shop', resetInterval: 'daily',
  reward: '10 battlestaves at 7k each (GE value ~9k = ~20k profit/day)',
  requirements: { quests: ['desert_treasure'] },
  description: 'Buy 10 battlestaves from Aubury in the Heartlands daily. Consistent small profit.' });

defineDaily({ id: 'daily_herb_box', name: 'Herb box purchase', type: 'shop', resetInterval: 'daily',
  reward: '15 herb boxes (10 random herbs each, ~150 herbs/day)',
  requirements: {},
  description: 'Buy herb boxes from the NMZ reward shop for points. Passive herb income.' });

defineDaily({ id: 'daily_sand', name: 'Bert delivers sand', type: 'passive', resetInterval: 'daily',
  reward: '84 buckets of sand delivered to bank (crafting supply)',
  requirements: { quests: ['the_jewellers_eye'] },
  description: 'After completing the quest, Bert delivers 84 sand buckets daily.' });

// Activity dailies
defineDaily({ id: 'daily_birdhouse', name: 'Birdhouse run', type: 'activity', resetInterval: '50min',
  reward: 'Bird nests (seeds, rings) + hunter XP',
  requirements: { skills: { hunter: 9 } },
  description: 'Check and reset 4 birdhouse traps. Takes 2 minutes. Repeatable every 50 minutes.' });

defineDaily({ id: 'daily_herb_run', name: 'Herb run', type: 'activity', resetInterval: '80min',
  reward: '7 patches × ~8 herbs = ~56 herbs per run',
  requirements: { skills: { farming: 32 } },
  description: 'Plant and harvest ranarrs at 7 herb patches across Aelgard. Takes 5 minutes per run.' });

defineDaily({ id: 'daily_tree_run', name: 'Tree run', type: 'activity', resetInterval: 'daily',
  reward: 'Massive farming XP (tree patches give 3k-13k XP each)',
  requirements: { skills: { farming: 15 } },
  description: 'Check health of trees at 5 tree patches. Best farming XP method.' });

defineDaily({ id: 'daily_seaweed', name: 'Seaweed run', type: 'activity', resetInterval: '40min',
  reward: 'Giant seaweed (crafting supply)',
  requirements: { skills: { farming: 23 } },
  description: 'Harvest giant seaweed from underwater patches. Used for glass crafting.' });

// Weekly activities
defineDaily({ id: 'weekly_tears', name: 'Tears of Guthix', type: 'activity', resetInterval: 'weekly',
  reward: 'XP in your lowest skill (amount based on quest points)',
  requirements: { quests: ['heartlands_patrol'] },
  description: 'Once per week, collect tears that give XP to your lowest skill.' });

defineDaily({ id: 'weekly_kingdom', name: 'Manage Kingdom', type: 'passive', resetInterval: 'weekly',
  reward: 'Resources collected by your subjects (herbs, ore, fish, wood)',
  requirements: { quests: ['the_fremennik_trials'] },
  description: 'Collect resources from your managed kingdom. Invest money for better returns.' });

defineDaily({ id: 'weekly_shooting_star', name: 'Shooting Star', type: 'activity', resetInterval: 'daily',
  reward: 'Star dust (exchange for supplies) + mining XP',
  requirements: { skills: { mining: 10 } },
  description: 'A shooting star lands somewhere in Aelgard. Find and mine it for rewards.' });

console.log(`[aelgard] Random events: ${randomEvents.length}, Dailies: ${dailies.length}`);

module.exports = { randomEvents, defineRandomEvent, dailies, defineDaily };
