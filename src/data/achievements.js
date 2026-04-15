// ── Achievement definitions ──────────────────────────────────────────────────
// Salvaged from ScapeAPI old fork (src/commands/all.js :: ACHIEVEMENTS). The
// list stays identical to both old and new all.js; extracting it lets new
// content authors register achievements without editing the monolithic file.
//
// Reward shapes supported by the existing runner:
//   coins : number
//   xp    : { skillName: amount, ... }
//   lamp  : 'small' | 'medium' | 'large'  (maps to item ids 950, 951, 952)
//
// Types:
//   kill_any      — any NPC kill
//   kill          — specific NPC by name (lowercase)
//   skill_action  — any XP gain in target skill
//   coins         — total coins held at once
//   combat_level  — combat level reached
//   total_level   — sum of all skill levels
//   any_99        — any skill at 99
//   all_quests    — quest cape
//   wildy_level   — depth in wilderness reached
//   death         — number of deaths
//   slayer_tasks  — slayer tasks completed
//
// Source: ScapeAPI fork @ /src/commands/all.js :: ACHIEVEMENTS
// -----------------------------------------------------------------------------

'use strict';

const ACHIEVEMENTS = {
  first_blood:        { name: 'First Blood',         desc: 'Kill any NPC',                 goal: 1,       type: 'kill_any',    reward: { coins: 500 } },
  goblin_slayer:      { name: 'Goblin Slayer',       desc: 'Kill 100 goblins',             goal: 100,     type: 'kill',        target: 'goblin',       reward: { coins: 5000 } },
  lumberjack:         { name: 'Lumberjack',          desc: 'Chop 100 logs',                goal: 100,     type: 'skill_action', target: 'woodcutting', reward: { xp: { woodcutting: 5000 } } },
  master_chef:        { name: 'Master Chef',         desc: 'Cook 50 food',                 goal: 50,      type: 'skill_action', target: 'cooking',     reward: { xp: { cooking: 5000 } } },
  millionaire:        { name: 'Millionaire',         desc: 'Have 1,000,000 coins at once', goal: 1000000, type: 'coins',        reward: { lamp: 'large' } },
  max_combat:         { name: 'Max Combat',          desc: 'Reach combat level 126',       goal: 126,     type: 'combat_level', reward: { lamp: 'large' } },
  total_500:          { name: 'Total 500',           desc: 'Reach total level 500',        goal: 500,     type: 'total_level',  reward: { coins: 10000 } },
  total_1000:         { name: 'Total 1000',          desc: 'Reach total level 1000',       goal: 1000,    type: 'total_level',  reward: { coins: 50000 } },
  total_1500:         { name: 'Total 1500',          desc: 'Reach total level 1500',       goal: 1500,    type: 'total_level',  reward: { lamp: 'medium' } },
  total_2000:         { name: 'Total 2000',          desc: 'Reach total level 2000',       goal: 2000,    type: 'total_level',  reward: { lamp: 'large' } },
  max_skill:          { name: 'Skill Mastery',       desc: 'Reach level 99 in any skill',  goal: 99,      type: 'any_99',       reward: { lamp: 'large' } },
  all_quests:         { name: 'Quest Cape',          desc: 'Complete all quests',          goal: 1,       type: 'all_quests',   reward: { coins: 100000 } },
  cow_killer:         { name: 'Cow Killer',          desc: 'Kill 50 cows',                 goal: 50,      type: 'kill',         target: 'cow',         reward: { coins: 2000 } },
  chicken_chaser:     { name: 'Chicken Chaser',      desc: 'Kill 25 chickens',             goal: 25,      type: 'kill',         target: 'chicken',     reward: { coins: 1000 } },
  fisher_king:        { name: 'Fisher King',         desc: 'Catch 500 fish',               goal: 500,     type: 'skill_action', target: 'fishing',     reward: { xp: { fishing: 10000 } } },
  miner_49er:         { name: 'Miner 49er',          desc: 'Mine 200 ores',                goal: 200,     type: 'skill_action', target: 'mining',      reward: { xp: { mining: 10000 } } },
  wild_explorer:      { name: 'Wild Explorer',       desc: 'Reach Wilderness level 50',    goal: 50,      type: 'wildy_level',  reward: { coins: 25000 } },
  first_death:        { name: 'A Learning Experience', desc: 'Die for the first time',     goal: 1,       type: 'death',        reward: { coins: 100 } },
  pickpocket_100:     { name: 'Sticky Fingers',      desc: 'Pick 100 pockets',             goal: 100,     type: 'skill_action', target: 'thieving',    reward: { xp: { thieving: 5000 } } },
  hill_giant_hunter:  { name: 'Giant Hunter',        desc: 'Kill 50 hill giants',          goal: 50,      type: 'kill',         target: 'hill giant',  reward: { coins: 15000 } },
  demon_slayer:       { name: 'Demon Slayer',        desc: 'Kill 25 lesser demons',        goal: 25,      type: 'kill',         target: 'lesser demon', reward: { coins: 25000 } },
  dragon_slayer_ach:  { name: 'Dragon Slayer',       desc: 'Kill 10 green dragons',        goal: 10,      type: 'kill',         target: 'green dragon', reward: { coins: 50000 } },
  bone_collector:     { name: 'Bone Collector',      desc: 'Bury 200 bones',               goal: 200,     type: 'skill_action', target: 'prayer',      reward: { xp: { prayer: 5000 } } },
  smith_100:          { name: 'Hammer Time',         desc: 'Smith 100 items',              goal: 100,     type: 'skill_action', target: 'smithing',    reward: { xp: { smithing: 5000 } } },
  craft_master:       { name: 'Craft Master',        desc: 'Craft 100 items',              goal: 100,     type: 'skill_action', target: 'crafting',    reward: { xp: { crafting: 5000 } } },
  fire_starter:       { name: 'Fire Starter',        desc: 'Light 50 fires',               goal: 50,      type: 'skill_action', target: 'firemaking',  reward: { xp: { firemaking: 3000 } } },
  guard_robber:       { name: 'Guard Robber',        desc: 'Kill 25 guards',               goal: 25,      type: 'kill',         target: 'guard',       reward: { coins: 5000 } },
  slayer_10:          { name: 'Slayer Apprentice',   desc: 'Complete 10 slayer tasks',     goal: 10,      type: 'slayer_tasks', reward: { xp: { slayer: 5000 } } },
  skeleton_basher:    { name: 'Skeleton Basher',     desc: 'Kill 50 skeletons',            goal: 50,      type: 'kill',         target: 'skeleton',    reward: { coins: 5000 } },
  zombie_slayer:      { name: 'Zombie Slayer',       desc: 'Kill 50 zombies',              goal: 50,      type: 'kill',         target: 'zombie',      reward: { coins: 5000 } },
  agility_runner:     { name: 'Agility Runner',      desc: 'Complete 25 agility laps',     goal: 25,      type: 'skill_action', target: 'agility',     reward: { xp: { agility: 5000 } } },
  herb_collector:     { name: 'Herb Collector',      desc: 'Clean 50 herbs',               goal: 50,      type: 'skill_action', target: 'herblore',    reward: { xp: { herblore: 3000 } } },
};

// Lamp id resolver — matches the inline logic used in the old commands/all.js
// checkAchievement runner: small=950, medium=951, large=952.
const LAMP_ITEM_ID = { small: 950, medium: 951, large: 952 };

function lampIdFor(tier) {
  return Object.prototype.hasOwnProperty.call(LAMP_ITEM_ID, tier) ? LAMP_ITEM_ID[tier] : 952;
}

function lampNameFor(tier) {
  return `XP lamp (${tier})`;
}

function get(id) { return ACHIEVEMENTS[id] || null; }
function list() { return Object.entries(ACHIEVEMENTS).map(([id, a]) => ({ id, ...a })); }
function count() { return Object.keys(ACHIEVEMENTS).length; }

module.exports = { ACHIEVEMENTS, LAMP_ITEM_ID, lampIdFor, lampNameFor, get, list, count };
