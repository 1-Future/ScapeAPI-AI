// ── Player (0.3) + Inventory (3.6) + Equipment (3.8) + Skills (4.1-4.3) ──────
// Everything about a connected player

const SPAWN_X = 100, SPAWN_Y = 100;
const INV_SIZE = 28;
const BANK_SIZE = 816;

// OSRS XP table: XP needed for level L
function xpForLevel(level) {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += Math.floor(i + 300 * Math.pow(2, i / 7));
  }
  return Math.floor(total / 4);
}

// Build XP table once
const XP_TABLE = [0];
for (let i = 1; i <= 126; i++) XP_TABLE[i] = xpForLevel(i);

function levelForXp(xp) {
  for (let i = 1; i < XP_TABLE.length; i++) {
    if (xp < XP_TABLE[i]) return i - 1;
  }
  return 99;
}

const SKILLS = [
  'attack', 'strength', 'defence', 'hitpoints', 'ranged', 'prayer', 'magic',
  'runecrafting', 'construction', 'agility', 'herblore', 'thieving',
  'crafting', 'fletching', 'slayer', 'hunter', 'mining', 'smithing',
  'fishing', 'cooking', 'firemaking', 'woodcutting', 'farming',
];

const COMBAT_SKILLS = ['attack', 'strength', 'defence', 'hitpoints', 'ranged', 'prayer', 'magic'];

const EQUIP_SLOTS = ['head', 'cape', 'neck', 'ammo', 'weapon', 'shield', 'body', 'legs', 'hands', 'feet', 'ring'];

function createPlayer(id, name) {
  const skills = {};
  for (const s of SKILLS) {
    skills[s] = { xp: 0, level: 1 };
  }
  skills.hitpoints = { xp: xpForLevel(10), level: 10 }; // Start at 10 HP

  return {
    id,
    name,
    admin: false,
    x: SPAWN_X,
    y: SPAWN_Y,
    layer: 0,
    path: [],
    running: false,
    runEnergy: 10000, // 100.0%
    weight: 0,

    // Combat
    hp: 10,
    maxHp: 10,
    combatTarget: null,
    attackStyle: 'accurate', // accurate, aggressive, defensive, controlled
    autoRetaliate: true,
    specialEnergy: 1000, // 100%
    nextAttackTick: 0,
    skull: 0, // ticks remaining
    activePrayers: new Set(),
    prayerPoints: 1, // = prayer level

    // Skills
    skills,

    // Inventory (array of {id, name, count} or null for empty slot)
    inventory: new Array(INV_SIZE).fill(null),

    // Bank
    bank: [],

    // Equipment
    equipment: {},

    // State
    busy: false, // doing an action (fishing, cooking, etc.)
    busyAction: null,
    connected: true,
    loginTick: 0,

    // Potion boosts: { skill: { amount, ticksLeft } }
    boosts: {},
    // Stun (thieving fail etc): ticks remaining where player can't act
    stunTicks: 0,
    // Agility lap tracking: { courseId, obstaclesDone: Set }
    agilityLap: null,

    // Poison: { damage, ticksUntilNext }
    poison: null,
    // Eat delay: tick when player can next eat
    nextEatTick: 0,
    // Hunter traps: [{ type, x, y, layer, placedTick, catches }]
    traps: [],
    // Farming patches: Map-like — stored as object { "layer_x_y": { seed, stage, growthTick, diseased } }
    farmingPatches: {},
    // Aggro timer: { "npcDefId": firstSeenTick } — tracks when NPCs first noticed this player
    aggroTimers: {},

    // ── Kill count tracking (feature 6) ──
    killCounts: {}, // { "goblin": 5, "cow": 12, ... }

    // ── Achievement system (feature 1) ──
    achievementProgress: {}, // { "first_blood": 1, "lumberjack": 47, ... }
    achievementsComplete: {}, // { "first_blood": true, ... }

    // ── Collection log (feature 2) ──
    collectionLog: {}, // { "boss_drops": [itemId, ...], "monster_drops": [...], "clue_rewards": [...], "skilling": [...] }

    // ── Account mode (feature 3) ──
    accountMode: null, // null = normal, 'ironman', 'hcim', 'uim'
    modeSet: false, // true after first set, cannot change

    // ── Daily challenges (feature 7) ──
    dailyChallenge: null, // { type, target, targetName, goal, progress, reward, rewardType, rewardSkill, generatedAt }

    // ── Loot tracker (feature 8) ──
    lootTracker: {}, // { "goblin": [{ id, name, count, value }], ... }
    lootTrackerTotal: 0, // total value this session

    // ── Server start time for game clock (feature 10) ──
    // (uses global tick)

    // ── Tutorial system ──
    tutorialStep: 0, // 0-9, 10 = complete
    tutorialComplete: false,

    // ── Random events ──
    nextRandomEvent: 0, // tick when next random event can trigger
    pendingEvent: null, // { type, data } — current pending random event

    // ── Death tracking / gravestone ──
    deathCount: 0,
    gravestone: null, // { x, y, layer, despawnTick }

    // ── Clan system ──
    clan: null, // clan name string

    // ── Friends list ──
    friends: [],

    // ── Player-Owned House (construction) ──
    house: [], // [{ type, furniture: { hotspot: furnitureId } }]
    houseLocation: null, // { x, y, layer } — saved position before entering house

    // ── Boss KC ──
    bossKills: {}, // { "king_black_dragon": 5, ... }

    // ── Treasure Trails (clue scrolls) ──
    activeClue: null, // { tier, steps, currentStep, stepData }

    // ── Duel Arena ──
    duelWins: 0,
    duelLosses: 0,
    duelChallenge: null, // { from, rules }
    inDuel: false,

    // ── Music system ──
    unlockedTracks: [], // ["Harmony", "Newbie Melody", ...]
    currentTrack: null,

    // ── Bounty Hunter ──
    bhTarget: null, // player id
    bhKills: 0,
    bhDeaths: 0,
    bhEmblemTier: 0,

    // ── Achievement Diary ──
    diaryProgress: {}, // { "lumbridge_easy": { chop_tree: true, ... } }
    diaryComplete: {}, // { "lumbridge_easy": true }
    diaryRewards: {}, // { "lumbridge_easy": true }
  };
}

function combatLevel(p) {
  const base = 0.25 * (getLevel(p, 'defence') + getLevel(p, 'hitpoints') + Math.floor(getLevel(p, 'prayer') / 2));
  const melee = 0.325 * (getLevel(p, 'attack') + getLevel(p, 'strength'));
  const ranged = 0.325 * Math.floor(getLevel(p, 'ranged') * 1.5);
  const magic = 0.325 * Math.floor(getLevel(p, 'magic') * 1.5);
  return Math.floor(base + Math.max(melee, ranged, magic));
}

function getLevel(p, skill) {
  return p.skills[skill]?.level || 1;
}

function getXp(p, skill) {
  return p.skills[skill]?.xp || 0;
}

// ── Level-up unlock messages ──
const LEVEL_UNLOCKS = {
  woodcutting: { 1: 'You can chop Trees.', 15: 'You can now chop Oak trees.', 30: 'You can now chop Willow trees.', 45: 'You can now chop Maple trees.', 60: 'You can now chop Yew trees.', 75: 'You can now chop Magic trees.', 99: 'You have mastered Woodcutting!' },
  mining: { 1: 'You can mine Copper and Tin.', 15: 'You can now mine Iron ore.', 30: 'You can now mine Coal.', 40: 'You can now mine Gold ore.', 55: 'You can now mine Mithril ore.', 70: 'You can now mine Adamantite ore.', 85: 'You can now mine Runite ore.', 99: 'You have mastered Mining!' },
  fishing: { 1: 'You can fish Shrimps.', 20: 'You can now fish Trout.', 40: 'You can now fish Lobster.', 62: 'You can now fish Monkfish.', 76: 'You can now fish Sharks.', 99: 'You have mastered Fishing!' },
  cooking: { 1: 'You can cook Shrimps.', 15: 'You can now cook Trout.', 30: 'You can now cook Lobster.', 40: 'You can now cook Swordfish.', 80: 'You can now cook Sharks.', 99: 'You have mastered Cooking!' },
  attack: { 1: 'Bronze weapons.', 5: 'You can now wield Steel weapons.', 10: 'You can now wield Black weapons.', 20: 'You can now wield Mithril weapons.', 30: 'You can now wield Adamant weapons.', 40: 'You can now wield Rune weapons.', 60: 'You can now wield Dragon weapons.', 99: 'You have mastered Attack!' },
  strength: { 10: 'Your max hit has increased.', 99: 'You have mastered Strength!' },
  defence: { 1: 'Bronze armour.', 5: 'You can now wear Steel armour.', 10: 'You can now wear Black armour.', 20: 'You can now wear Mithril armour.', 30: 'You can now wear Adamant armour.', 40: 'You can now wear Rune armour.', 60: 'You can now wear Dragon armour.', 99: 'You have mastered Defence!' },
  ranged: { 1: 'Bronze arrows.', 20: 'You can now use Steel arrows.', 40: 'You can now use Rune arrows.', 99: 'You have mastered Ranged!' },
  prayer: { 13: 'You can now use Superhuman Strength.', 25: 'You can now use Protect from Melee.', 43: 'You can now use Eagle Eye.', 99: 'You have mastered Prayer!' },
  magic: { 1: 'Wind Strike.', 25: 'You can now cast Varrock Teleport.', 31: 'You can now cast Lumbridge Teleport.', 55: 'You can now use High Alchemy.', 75: 'You can now cast Charge.', 99: 'You have mastered Magic!' },
  hitpoints: { 99: 'You have mastered Hitpoints!' },
  crafting: { 1: 'Basic crafting.', 99: 'You have mastered Crafting!' },
  smithing: { 1: 'Bronze bars.', 15: 'You can now smelt Iron bars.', 30: 'You can now smelt Steel bars.', 50: 'You can now smelt Mithril bars.', 70: 'You can now smelt Adamant bars.', 85: 'You can now smelt Rune bars.', 99: 'You have mastered Smithing!' },
  herblore: { 3: 'You can now clean Guam.', 99: 'You have mastered Herblore!' },
  agility: { 1: 'Town Rooftop Course.', 99: 'You have mastered Agility!' },
  thieving: { 1: 'Pickpocket Men.', 40: 'You can now pickpocket Guards.', 55: 'You can now pickpocket Knights.', 99: 'You have mastered Thieving!' },
  fletching: { 99: 'You have mastered Fletching!' },
  slayer: { 99: 'You have mastered Slayer!' },
  hunter: { 1: 'Bird snares.', 53: 'You can now use Box traps.', 99: 'You have mastered Hunter!' },
  firemaking: { 99: 'You have mastered Firemaking!' },
  farming: { 9: 'You can now plant Guam seeds.', 14: 'You can now plant Marrentill seeds.', 32: 'You can now plant Ranarr seeds.', 99: 'You have mastered Farming!' },
  runecrafting: { 99: 'You have mastered Runecrafting!' },
  construction: { 99: 'You have mastered Construction!' },
};

function addXp(p, skill, amount) {
  if (!p.skills[skill]) return;
  const before = p.skills[skill].level;
  p.skills[skill].xp = Math.min(200000000, p.skills[skill].xp + Math.floor(amount));
  p.skills[skill].level = levelForXp(p.skills[skill].xp);
  if (skill === 'hitpoints') {
    p.maxHp = p.skills.hitpoints.level;
    p.hp = Math.min(p.hp, p.maxHp);
  }
  if (skill === 'prayer') {
    p.prayerPoints = p.skills.prayer.level;
  }
  const after = p.skills[skill].level;
  return after > before ? after : null; // Returns new level if leveled up
}

function getLevelUpMessage(skill, level) {
  const unlocks = LEVEL_UNLOCKS[skill];
  if (!unlocks) return null;
  // Find the unlock message for this exact level
  if (unlocks[level]) return unlocks[level];
  return null;
}

function totalLevel(p) {
  let total = 0;
  for (const s of SKILLS) total += getLevel(p, s);
  return total;
}

// Inventory operations
function invAdd(p, itemId, name, count = 1, stackable = false) {
  if (stackable) {
    // Find existing stack
    const idx = p.inventory.findIndex(s => s && s.id === itemId);
    if (idx >= 0) { p.inventory[idx].count += count; return true; }
  }
  // Find empty slot
  for (let i = 0; i < INV_SIZE; i++) {
    if (!p.inventory[i]) {
      p.inventory[i] = { id: itemId, name, count: stackable ? count : 1 };
      if (!stackable && count > 1) {
        // Add remaining to next slots
        for (let j = 1; j < count; j++) {
          const slot = p.inventory.findIndex(s => s === null);
          if (slot < 0) return false; // Inv full
          p.inventory[slot] = { id: itemId, name, count: 1 };
        }
      }
      return true;
    }
  }
  return false; // Full
}

function invRemove(p, itemId, count = 1) {
  let removed = 0;
  for (let i = 0; i < INV_SIZE && removed < count; i++) {
    if (p.inventory[i] && p.inventory[i].id === itemId) {
      if (p.inventory[i].count <= (count - removed)) {
        removed += p.inventory[i].count;
        p.inventory[i] = null;
      } else {
        p.inventory[i].count -= (count - removed);
        removed = count;
      }
    }
  }
  return removed;
}

function invCount(p, itemId) {
  let total = 0;
  for (const slot of p.inventory) {
    if (slot && slot.id === itemId) total += slot.count;
  }
  return total;
}

function invFreeSlots(p) {
  return p.inventory.filter(s => s === null).length;
}

// Equipment
function equip(p, slot, item) {
  const old = p.equipment[slot] || null;
  p.equipment[slot] = item;
  if (old) invAdd(p, old.id, old.name, 1);
  return old;
}

function unequip(p, slot) {
  const item = p.equipment[slot];
  if (!item) return null;
  if (invFreeSlots(p) < 1) return null; // No room
  delete p.equipment[slot];
  invAdd(p, item.id, item.name, 1);
  return item;
}

// Get effective level including potion boosts
function getBoostedLevel(p, skill) {
  const base = getLevel(p, skill);
  const boost = p.boosts?.[skill];
  if (boost && boost.ticksLeft > 0) return base + boost.amount;
  return base;
}

// Calculate weight from inventory + equipment using item definitions getter
function calcWeight(p, itemsGet) {
  let w = 0;
  for (const slot of p.inventory) {
    if (slot) {
      const def = itemsGet(slot.id);
      if (def) w += def.weight * (slot.count || 1);
    }
  }
  for (const item of Object.values(p.equipment)) {
    if (item) {
      const def = itemsGet(item.id);
      if (def) w += def.weight;
    }
  }
  p.weight = Math.round(w * 100) / 100;
  return p.weight;
}

module.exports = {
  createPlayer, combatLevel,
  getLevel, getXp, addXp, totalLevel,
  getBoostedLevel, calcWeight,
  invAdd, invRemove, invCount, invFreeSlots,
  equip, unequip,
  SKILLS, COMBAT_SKILLS, EQUIP_SLOTS, INV_SIZE, BANK_SIZE,
  SPAWN_X, SPAWN_Y,
  XP_TABLE, xpForLevel, levelForXp,
  getLevelUpMessage, LEVEL_UNLOCKS,
};
