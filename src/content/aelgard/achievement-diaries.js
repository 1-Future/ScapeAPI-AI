// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Achievement Diary System
// 8 regions × 4 tiers (Easy/Medium/Hard/Elite) = 32 diary completions
// Each tier rewards QOL upgrades for that region
//
// Manifesto P03: Self-direction — player picks which region to focus
// Manifesto P08: Each tier completion is a breakpoint (unlock teleport, boost, etc)
// Manifesto P09: Tasks require multiple skills — no single-skill completion
// ══════════════════════════════════════════════════════════════════════════════

const diaries = new Map();
const items = require('../../data/items');

function defineDiary(opts) {
  diaries.set(opts.id, {
    id: opts.id, region: opts.region,
    easy: opts.easy, medium: opts.medium, hard: opts.hard, elite: opts.elite,
    rewards: opts.rewards,
  });
}

function getDiary(id) { return diaries.get(id); }
function listDiaries() { return [...diaries.values()]; }

// ── Diary reward items (lamps) ─────────────────────────────────────────────

items.define({ id: 32001, name: 'Heartlands diary lamp (easy)', examine: 'Grants 2,500 XP to any skill.', value: 0, category: 'misc', tradeable: false });
items.define({ id: 32002, name: 'Heartlands diary lamp (medium)', examine: 'Grants 7,500 XP to any skill above level 40.', value: 0, category: 'misc', tradeable: false });
items.define({ id: 32003, name: 'Heartlands diary lamp (hard)', examine: 'Grants 15,000 XP to any skill above level 60.', value: 0, category: 'misc', tradeable: false });
items.define({ id: 32004, name: 'Heartlands diary lamp (elite)', examine: 'Grants 50,000 XP to any skill above level 75.', value: 0, category: 'misc', tradeable: false });

// ══════════════════════════════════════════════════════════════════════════════

defineDiary({
  id: 'heartlands_diary', region: 'Heartlands',
  easy: {
    tasks: [
      'Mine a copper and tin ore', 'Cook a shrimp', 'Complete the Heartlands Patrol quest',
      'Kill a goblin', 'Buy an item from a shop', 'Chop a normal tree',
      'Catch a shrimp at the fishing spot', 'Bury a set of bones',
    ],
    skillReqs: { mining: 1, cooking: 1, woodcutting: 1, fishing: 1, prayer: 1 },
  },
  medium: {
    tasks: [
      'Complete the Missing Miner quest', 'Smith a bronze bar',
      'Cook a trout without burning it', 'Kill a Hill giant',
      'Reach the top of the Heartlands rooftop agility course',
      'Clean a grimy herb', 'Pickpocket a man',
    ],
    skillReqs: { mining: 5, smithing: 1, cooking: 15, agility: 1, herblore: 3, thieving: 1 },
  },
  hard: {
    tasks: [
      'Complete the Forge of Duran quest', 'Kill a Lesser demon',
      'Craft a sapphire ring', 'Fletch a maple shortbow',
      'Complete a lap of the Heartlands rooftop without failing',
      'Bury dragon bones at the town altar',
    ],
    skillReqs: { attack: 20, crafting: 20, fletching: 50, agility: 10, prayer: 1 },
  },
  elite: {
    tasks: [
      'Kill a Greater demon', 'Build a gilded altar in your house',
      'Complete a full herb run (all 7 patches)', 'Craft 100 nature runes in one trip',
      'Defeat Forgefather Duran in under 2 minutes',
    ],
    skillReqs: { attack: 70, construction: 75, farming: 50, runecrafting: 44 },
  },
  rewards: {
    easy: 'Heartlands teleport (unlimited), +5% XP in Heartlands',
    medium: 'Heartlands bank teleport, noted bones from monsters',
    hard: 'Heartlands GE teleport, +10% shop discount',
    elite: 'Heartlands elite gear (cosmetic), instant altar access',
  },
});

defineDiary({
  id: 'boneyard_diary', region: 'Boneyard Wastes',
  easy: { tasks: ['Kill a sand crab', 'Mine soot-iron ore', 'Drink cactus water', 'Kill a skeleton'], skillReqs: { mining: 25, attack: 1 } },
  medium: { tasks: ['Complete Sand and Secrets', 'Kill a dust devil', 'Pickpocket a warrior'], skillReqs: { mining: 20, thieving: 25 } },
  hard: { tasks: ['Defeat Azhmari', 'Kill a fossil guardian', 'Complete Relics of the Old World'], skillReqs: { attack: 30, mining: 30 } },
  elite: { tasks: ['Kill Azhmari in under 3 minutes', 'Complete the Desert Treasure quest'], skillReqs: { magic: 50, attack: 50 } },
  rewards: {
    easy: 'Boneyard teleport, noted fossils',
    medium: 'Oasis bank access, +10% scarab shell drop rate',
    hard: 'Desert amulet upgrade (teleport charges), pyramid shortcut',
    elite: 'Unlimited desert teleport, sandstorm immunity',
  },
});

defineDiary({
  id: 'moryskah_diary', region: 'Moryskah',
  easy: { tasks: ['Kill a ghast', 'Buy an item from the apothecary', 'Enter the slayer tower'], skillReqs: { attack: 1 } },
  medium: { tasks: ['Complete Bog Witch quest', 'Kill a banshee', 'Pickpocket a vampyre'], skillReqs: { herblore: 15, thieving: 45 } },
  hard: { tasks: ['Complete Blood Rites', 'Kill a vyrewatch', 'Complete Barrows Brothers'], skillReqs: { attack: 40, prayer: 30 } },
  elite: { tasks: ['Defeat Count Malachar solo', 'Kill 100 vampyres', 'Complete all Moryskah quests'], skillReqs: { attack: 70, prayer: 60 } },
  rewards: {
    easy: 'Moryskah teleport, holy water refill',
    medium: 'Slayer tower shortcut, +10% ectoplasm drops',
    hard: 'Barrows teleport, free barrows repair',
    elite: 'Blood altar teleport, +10% blood rune output',
  },
});

defineDiary({
  id: 'veilwood_diary', region: 'Veilwood',
  easy: { tasks: ['Chop an oak tree in Veilwood', 'Catch a bird', 'Kill a moss sprite'], skillReqs: { woodcutting: 15, hunter: 1 } },
  medium: { tasks: ['Complete Veilwood Covenant', 'Chop a maple tree', 'Fletch a shortbow'], skillReqs: { woodcutting: 20, fletching: 15 } },
  hard: { tasks: ['Complete Stormwood Rite', 'Catch a red chinchompa', 'Kill an Ent'], skillReqs: { woodcutting: 50, hunter: 63 } },
  elite: { tasks: ['Defeat The Veilmother', 'Chop a magic tree in Veilwood', 'Complete Lunar Diplomacy'], skillReqs: { woodcutting: 75, magic: 65 } },
  rewards: {
    easy: 'Veilwood teleport, +5% bird catch rate',
    medium: 'Elven village bank access, +10% WC in Veilwood',
    hard: 'Storm tree access, +5% chin catch rate',
    elite: 'Magic tree shortcut, unlimited Veilwood teleport',
  },
});

defineDiary({
  id: 'sootworks_diary', region: 'Sootworks',
  easy: { tasks: ['Mine coal', 'Smith a bronze bar', 'Kill a mine spider'], skillReqs: { mining: 30, smithing: 1 } },
  medium: { tasks: ['Complete Sootworks Rising', 'Use the Blast Forge', 'Kill a rock golem'], skillReqs: { mining: 30, smithing: 25 } },
  hard: { tasks: ['Complete Forge Beneath', 'Kill an iron dragon', 'Smith an adamant bar'], skillReqs: { smithing: 70, attack: 50 } },
  elite: { tasks: ['Kill a steel dragon', 'Complete the Soot King raid', 'Smith a runite bar'], skillReqs: { smithing: 85, attack: 70 } },
  rewards: {
    easy: 'Sootworks teleport, noted coal from golems',
    medium: 'Blast Forge access (half coal), +10% soot-iron yield',
    hard: 'Deep mine shortcut, +5% smithing success',
    elite: 'Unlimited Sootworks teleport, auto-smelt at furnace',
  },
});

defineDiary({
  id: 'saltbrine_diary', region: 'Saltbrine Reach',
  easy: { tasks: ['Catch a shrimp at Saltbrine', 'Kill a pirate', 'Buy from fish shop'], skillReqs: { fishing: 1, attack: 1 } },
  medium: { tasks: ['Complete Pirate King', 'Catch a lobster', 'Complete the Saltbrine agility course'], skillReqs: { fishing: 40, agility: 20, attack: 25 } },
  hard: { tasks: ['Complete Whispers from the Depths', 'Catch a swordfish', 'Kill a dagannoth'], skillReqs: { fishing: 50, attack: 40 } },
  elite: { tasks: ['Defeat the Kraken of Saltbrine', 'Complete Barbarian Assault', 'Catch a shark'], skillReqs: { fishing: 76, attack: 60 } },
  rewards: {
    easy: 'Saltbrine teleport, +5% catch rate at coast',
    medium: 'Harbour bank teleport, noted fish from fishing',
    hard: 'Kraken shortcut, +10% pearl chance from Trawler',
    elite: 'Unlimited Saltbrine teleport, double fish at coast',
  },
});

defineDiary({
  id: 'inkweald_diary', region: 'Inkweald',
  easy: { tasks: ['Enter the Inkweald', 'Kill a dream wisp', 'Collect an inkblot fragment'], skillReqs: { magic: 35 } },
  medium: { tasks: ['Complete Inkweald Door', 'Kill an ink horror', 'Complete a lap of the Dreamwalk'], skillReqs: { magic: 35, agility: 70 } },
  hard: { tasks: ['Defeat the Inkweald Muse (5-player)', 'Collect 50 inkblot fragments', 'Complete the Hollow Choir quest'], skillReqs: { attack: 60, magic: 55 } },
  elite: { tasks: ['Defeat the Hollow Choir (8-player raid)', 'Complete all Inkweald quests', 'Collect a Nightmare shard'], skillReqs: { attack: 80, magic: 75, prayer: 60 } },
  rewards: {
    easy: 'Inkweald teleport, dream wisp spawn rate +10%',
    medium: 'Boundary camp bank, Dreamwalk shortcut',
    hard: 'Muse arena shortcut, +10% lucid essence drops',
    elite: 'Unlimited Inkweald teleport, dream state HP regen doubles',
  },
});

defineDiary({
  id: 'glass_desert_diary', region: 'Glass Desert',
  easy: { tasks: ['Mine a crystal node', 'Kill a glass spider', 'Enter the Glass Desert'], skillReqs: { mining: 70 } },
  medium: { tasks: ['Complete Glass Prophecy', 'Kill a prism wizard', 'Collect 100 crystal shards'], skillReqs: { mining: 40, magic: 40 } },
  hard: { tasks: ['Defeat Crystal Wyrm', 'Kill a crystal dragon', 'Complete Last Dragon P1'], skillReqs: { attack: 60, mining: 50 } },
  elite: { tasks: ['Defeat Veldrak', 'Defeat The Glass Tyrant', 'Complete The Last Light quest', 'Complete the Infernal Challenge'], skillReqs: { attack: 90, magic: 85, prayer: 75 } },
  rewards: {
    easy: 'Glass Desert teleport, noted crystal shards',
    medium: 'Outpost bank access, +10% crystal shard mining',
    hard: 'Crystal Wyrm shortcut, dragonfire immunity in Glass Desert',
    elite: 'Unlimited Glass Desert teleport, double crystal node respawn',
  },
});

defineDiary({
  id: 'wilds_diary', region: 'Wilds',
  easy: { tasks: ['Enter the Wilds at level 1', 'Kill a chaos druid', 'Mine rune essence at chaos altar', 'Pickpocket a mage of Zamorak'], skillReqs: { attack: 1, mining: 1, thieving: 15 } },
  medium: { tasks: ['Kill a chaos elemental', 'Kill a lava dragon', 'Mine runite ore', 'Craft a chaos rune'], skillReqs: { attack: 40, mining: 85, runecrafting: 35 } },
  hard: { tasks: ['Kill a revenant dragon', 'Complete the Wilderness agility course perfectly', 'Complete the Deeper Wilds quest', 'Runecraft 50 wrath runes'], skillReqs: { attack: 60, agility: 60, runecrafting: 95 } },
  elite: { tasks: ['Defeat the Chaos Avatar raid', 'Defeat Corporeal Beast solo', 'Earn all 3 Voidwaker pieces', 'Complete the Wilderness collection log'], skillReqs: { attack: 85, magic: 75, prayer: 70, runecrafting: 99 } },
  rewards: {
    easy: 'Wilderness ditch teleport (3/day), +5% chaos rune drop from chaos druids',
    medium: 'Wilderness sword I teleports (Edgeville + Gamers Grotto + Dark Warrior fortress)',
    hard: 'Wilderness sword II teleports, +15% rune/wrath runecrafting yield',
    elite: 'Unlimited Wilderness lever teleport, chaos altar permanent +50% runecrafting/prayer XP (stat-bonus), Chaos Cub pet chance, +25% rare drop from Wilds bosses',
  },
});

console.log(`[aelgard] ${diaries.size} achievement diaries defined (${diaries.size * 4} tier completions)`);

module.exports = { defineDiary, getDiary, listDiaries, diaries };
