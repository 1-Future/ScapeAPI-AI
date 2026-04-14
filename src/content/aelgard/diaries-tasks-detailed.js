// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Detailed Achievement Diary Tasks
// Expands the diary system from outline tasks to 200+ specific tasks
// Each task requires real gameplay — not "have level X" but "DO something at level X"
//
// These tasks are the glue that connects all systems. They force players to:
// - Visit every part of every region
// - Use every training method
// - Kill specific monsters with specific strategies
// - Complete multi-step objectives that span skills
//
// Manifesto P03: Self-direction. Players pick which diary to work on.
// Manifesto P08: Each tier completion is a breakpoint with real rewards.
// Manifesto P09: Tasks require breadth across all skills.
// ══════════════════════════════════════════════════════════════════════════════

const diaryTasks = new Map();

function defineTask(region, tier, tasks) {
  const key = `${region}_${tier}`;
  diaryTasks.set(key, tasks);
}

// ══════════════════════════════════════════════════════════════════════════════
// HEARTLANDS — 10 tasks per tier = 40 tasks
// ══════════════════════════════════════════════════════════════════════════════

defineTask('heartlands', 'easy', [
  'Mine a copper ore and a tin ore',
  'Smelt a bronze bar at the town furnace',
  'Smith a bronze dagger on the town anvil',
  'Catch a shrimp at the Heartlands fishing spot',
  'Cook a shrimp without burning it',
  'Kill a chicken and bury its bones',
  'Chop a normal tree and light the logs',
  'Complete the Heartlands Patrol quest',
  'Buy a bronze sword from Kael\'s Smithy',
  'Pickpocket a man or woman in town',
]);

defineTask('heartlands', 'medium', [
  'Kill a Hill giant in the eastern hills',
  'Smith an iron dagger on the town anvil',
  'Complete the Missing Miner quest',
  'Catch a trout at the fly fishing spot',
  'Cook a trout on the town range without burning it',
  'Reach the top of the Heartlands rooftop agility course',
  'Clean a grimy guam leaf',
  'Mix an attack potion',
  'Plant and harvest a potato from the Heartlands allotment',
  'Sell an item on the Grand Exchange',
]);

defineTask('heartlands', 'hard', [
  'Kill a lesser demon in the Heartlands dungeon',
  'Complete the Forge of Duran quest',
  'Craft a sapphire ring (requires crafting 20)',
  'Fletch a maple shortbow and string it',
  'Complete a full lap of the rooftop course without failing',
  'Bury a dragon bone on the Heartlands altar',
  'Use the Heartlands teleport spell',
  'Pickpocket a paladin',
  'Kill a Moss giant with magic',
  'Catch a lobster at the Saltbrine coast and cook it in Heartlands',
]);

defineTask('heartlands', 'elite', [
  'Defeat Forgefather Duran in under 2 minutes',
  'Build a gilded altar in your player-owned house',
  'Complete a full herb run (harvest from all 7 patches)',
  'Craft 100 nature runes in a single trip',
  'Smith a rune platebody from scratch (mine ore, smelt, smith)',
  'Kill a Greater demon with only magic',
  'Chop a yew tree in the Heartlands',
  'Catch and cook a shark',
  'Mix a saradomin brew',
  'Complete all Heartlands quests',
]);

// ══════════════════════════════════════════════════════════════════════════════
// BONEYARD WASTES — 10 tasks per tier = 40 tasks
// ══════════════════════════════════════════════════════════════════════════════

defineTask('boneyard', 'easy', [
  'Kill a sand crab',
  'Mine a soot-iron ore',
  'Drink a cactus water',
  'Kill a desert wolf',
  'Kill 3 skeletons in the wastes',
  'Buy supplies from Razak\'s Desert Supplies',
  'Collect a bone shard from a bone crawler',
  'Bury bones at the oasis',
  'Travel from the Heartlands to the Boneyard',
  'Pick up a scarab shell',
]);

defineTask('boneyard', 'medium', [
  'Complete the Sand and Secrets quest',
  'Kill a dust devil with ranged',
  'Mine sandstone (mining 35)',
  'Kill a giant scarab and collect its shell',
  'Navigate the pyramid entrance',
  'Use a desert amulet',
  'Kill a skeleton mage',
  'Make a bone cleaver (if obtained from Azhmari)',
  'Collect 10 bone shards in one trip',
  'Pickpocket a warrior in the nomad camp',
]);

defineTask('boneyard', 'hard', [
  'Defeat the Bog Hydra',
  'Kill a fossil guardian',
  'Complete the Relics of the Old World quest',
  'Mine granite (mining 45)',
  'Kill a mummy and survive the poison',
  'Collect a fossilized fang',
  'Smith a soot-iron weapon',
  'Use the Ancient Magicks spellbook in the Boneyard',
  'Kill a skeletal wyvern',
  'Reach the bottom of the pyramid dungeon',
]);

defineTask('boneyard', 'elite', [
  'Defeat Azhmari in under 3 minutes',
  'Complete the Desert Treasure quest',
  'Kill 100 skeletons in the Boneyard',
  'Collect all 3 Azhmari unique drops',
  'Mine a runite ore in the desert',
  'Complete all Boneyard quests',
  'Kill a camel warrior',
  'Use Ice Barrage on a dust devil stack',
  'Survive 5 minutes in the deep pyramid without food',
  'Complete an elite clue step in the Boneyard',
]);

// ══════════════════════════════════════════════════════════════════════════════
// MORYSKAH — 10 tasks per tier = 40 tasks
// ══════════════════════════════════════════════════════════════════════════════

defineTask('moryskah', 'easy', [
  'Enter Moryskah from the Heartlands',
  'Kill a ghast',
  'Buy holy water from Apothecary Nira',
  'Enter the slayer tower',
  'Kill a crawling hand in the tower',
  'Talk to Father Dorin',
  'Pick up ectoplasm from a ghast',
  'Kill 5 ghasts without leaving the swamp',
  'Buy a silver sickle',
  'Bury bones in Moryskah',
]);

defineTask('moryskah', 'medium', [
  'Complete The Bog Witch\'s Bargain',
  'Kill a banshee with a proper nosepeg equipped',
  'Pickpocket a vampyre juvenile',
  'Kill an aberrant spectre in the slayer tower',
  'Collect a vial of blood from a vampyre',
  'Use a silver sickle against a vampyre (bonus damage)',
  'Kill a werewolf with melee',
  'Navigate to the Bog Witch without dying to ghasts',
  'Collect 5 wolfbane herbs',
  'Enter the Moryskah slayer tower upper floor',
]);

defineTask('moryskah', 'hard', [
  'Complete the Blood Rites quest',
  'Kill a vyrewatch',
  'Complete one Barrows run (kill all 6 brothers)',
  'Kill a bloodveld in the catacombs',
  'Get a Barrows equipment piece from the chest',
  'Kill a gargoyle (slayer 75)',
  'Kill a nechryael (slayer 80)',
  'Navigate Castle Malachar without dying',
  'Forge a silver stake at the Sootworks using Moryskah materials',
  'Collect all 3 Malachar unique drops',
]);

defineTask('moryskah', 'elite', [
  'Defeat Count Malachar solo',
  'Kill 200 vampyres in Moryskah',
  'Complete all Moryskah quests',
  'Kill an abyssal demon in the catacombs (slayer 85)',
  'Craft blood runes at the blood altar',
  'Kill Cerberus (slayer 91)',
  'Complete the Barrows collection log',
  'Use Blood Barrage on a vampyre stack',
  'Kill a dark beast (slayer 90)',
  'Complete an elite clue step in Castle Malachar',
]);

// ══════════════════════════════════════════════════════════════════════════════
// VEILWOOD — 10 tasks per tier = 40 tasks
// ══════════════════════════════════════════════════════════════════════════════

defineTask('veilwood', 'easy', [
  'Chop an oak tree in Veilwood',
  'Set a bird snare and catch a crimson swift',
  'Kill a moss sprite',
  'Talk to Ranger Lyris',
  'Buy a druid staff from Fletcher Tarin',
  'Enter the elven village',
  'Pick a moonpetal from the deeper forest',
  'Kill a timber wolf',
  'Fletch a shortbow from Veilwood logs',
  'Catch a bird in the forest',
]);

defineTask('veilwood', 'medium', [
  'Complete the Veilwood Covenant quest',
  'Chop a maple tree in Veilwood',
  'Fletch a yew shortbow',
  'Kill an ent',
  'Set a box trap and catch a grey chinchompa',
  'Brew a divination potion using Veilwood ingredients',
  'Use an elven bow against a shadow panther',
  'Navigate the sacred grove',
  'Collect 5 spirit seeds',
  'Kill a unicorn and bury its bones',
]);

defineTask('veilwood', 'hard', [
  'Complete the Stormwood Rite quest',
  'Chop a stormwood log during a storm event',
  'Catch a red chinchompa (hunter 63)',
  'Kill the corrupted Elder Druid',
  'Fletch a magic shortbow',
  'Set up and check a yew birdhouse',
  'Kill a tree spirit',
  'Use the Lunar spellbook\'s Cure Plant on a Veilwood farming patch',
  'Collect 10 moonpetals in one trip',
  'Kill a dire wolf pack (5 wolves without banking)',
]);

defineTask('veilwood', 'elite', [
  'Defeat The Veilmother',
  'Chop a magic tree in Veilwood',
  'Complete the Lunar Diplomacy quest',
  'Catch 100 chinchompas in Veilwood',
  'Complete all Veilwood quests',
  'Fletch and enchant a stormwood bow',
  'Complete the Fletcher\'s Trial quest',
  'Kill all 3 Veilwood boss-tier creatures',
  'Harvest 20 herbs from the Veilwood farming patch in one run',
  'Complete a hard clue step in the sacred grove',
]);

// ══════════════════════════════════════════════════════════════════════════════
// SOOTWORKS — 10 tasks per tier = 40 tasks
// ══════════════════════════════════════════════════════════════════════════════

defineTask('sootworks', 'easy', [
  'Enter the Sootworks from the Heartlands',
  'Mine coal in the Sootworks mines',
  'Smith a bronze bar at the Sootworks furnace',
  'Kill a mine spider',
  'Buy a dwarven stout from Vendor Grit',
  'Take the steam tram to the lower levels',
  'Talk to Forgemaster Brun',
  'Use the Sootworks anvil',
  'Mine 10 coal in one trip',
  'Kill 3 mine spiders',
]);

defineTask('sootworks', 'medium', [
  'Complete Sootworks Rising quest',
  'Use the Blast Forge (half-coal smelting)',
  'Kill a rock golem with magic',
  'Smith a mithril platebody',
  'Mine mithril ore in the Sootworks',
  'Complete a lap of the Sootworks Pipe Network agility course',
  'Kill a clockwork sentry with ranged',
  'Collect 10 clockwork gears',
  'Smith soot-iron weapons for a full set',
  'Kill a crazed miner',
]);

defineTask('sootworks', 'hard', [
  'Complete The Forge Beneath the City quest',
  'Kill an iron dragon with magic',
  'Smith an adamant platebody',
  'Complete a full Sootworks Pipe Network lap without failing',
  'Kill a rogue automaton',
  'Mine adamantite ore in the deep mines',
  'Kill a lava beast without taking fire damage',
  'Smelt a runite bar at the Blast Forge',
  'Kill Vorath, Warden of the Deep Vein',
  'Collect 50 blast powder',
]);

defineTask('sootworks', 'elite', [
  'Defeat the Soot King in a group of 3+',
  'Kill a steel dragon',
  'Smith a rune platebody from bars you smelted',
  'Mine a volcanic core (mining 75)',
  'Complete all Sootworks quests',
  'Kill a mithril dragon with magic only',
  'Complete the Dragon Slayer of Aelgard quest',
  'Kill 50 iron dragons',
  'Use the infernal pickaxe (auto-smelt) in the Sootworks',
  'Complete an elite clue step in the deep vein',
]);

// ══════════════════════════════════════════════════════════════════════════════
// SALTBRINE — 10 tasks per tier = 40 tasks
// ══════════════════════════════════════════════════════════════════════════════

defineTask('saltbrine', 'easy', [
  'Catch a shrimp at the Saltbrine coast',
  'Kill a pirate',
  'Buy from Fishmonger Mara\'s shop',
  'Enter the pirate cove',
  'Kill a rock crab',
  'Cook a sardine at the harbour range',
  'Collect a barnacle shell',
  'Talk to Harbourmaster Cole',
  'Catch 5 fish at any Saltbrine spot',
  'Kill a seagull (sorry)',
]);

defineTask('saltbrine', 'medium', [
  'Complete the Pirate King quest',
  'Catch a lobster at the coast (fishing 40)',
  'Complete a lap of the Saltbrine Harbour agility course',
  'Kill a sea snake without getting poisoned',
  'Cook a lobster without burning it',
  'Kill a pirate captain',
  'Catch a swordfish (fishing 50)',
  'Complete the Trawler\'s Call quest',
  'Participate in a Saltbrine Trawler run',
  'Buy a harpoon from the fish shop',
]);

defineTask('saltbrine', 'hard', [
  'Complete Whispers from the Depths quest',
  'Catch a shark (fishing 76)',
  'Cook a shark without burning it',
  'Kill a dagannoth',
  'Complete a round of Barbarian Assault',
  'Defeat the Pirate Captain boss instance',
  'Catch a monkfish (fishing 62)',
  'Craft an anglerfish from the Trawler',
  'Kill a lobstrosity',
  'Collect a Saltbrine pearl from a pirate captain',
]);

defineTask('saltbrine', 'elite', [
  'Defeat the Kraken of Saltbrine',
  'Catch a dark crab in the Wilds (fishing 85)',
  'Complete Barbarian Assault with all roles',
  'Earn a Fighter torso from Barbarian Assault',
  'Complete all Saltbrine quests',
  'Catch an anglerfish (fishing 82)',
  'Kill a sea troll with magic',
  'Complete an elite clue step in the harbour',
  'Get 99 fishing',
  'Kill the Kraken 50 times',
]);

// ══════════════════════════════════════════════════════════════════════════════
// INKWEALD — 10 tasks per tier = 40 tasks
// ══════════════════════════════════════════════════════════════════════════════

defineTask('inkweald', 'easy', [
  'Enter the Inkweald',
  'Kill a dream wisp',
  'Collect an inkblot fragment',
  'Talk to Lucid Keeper Yara',
  'Buy an item from Dream Merchant Zyx',
  'Survive 1 minute in the Inkweald without taking damage',
  'Collect 3 echo petals',
  'Kill 3 dream wisps',
  'Use a prayer at the boundary camp',
  'Bank at the Inkweald boundary bank',
]);

defineTask('inkweald', 'medium', [
  'Complete The Inkweald Door quest',
  'Kill an ink horror',
  'Complete a lap of the Inkweald Dreamwalk agility course',
  'Collect 10 inkblot fragments in one trip',
  'Kill a thought stalker with ranged',
  'Brew a wakefulness potion',
  'Participate in Guardians of the Rift',
  'Craft cosmic runes at the cosmic altar (Inkweald)',
  'Kill a mirror golem with crush',
  'Collect a lucid essence',
]);

defineTask('inkweald', 'hard', [
  'Defeat the Inkweald Muse (5-player)',
  'Complete The Hollow Choir\'s Song quest',
  'Kill 50 ink horrors',
  'Complete a full Dreamwalk lap without failing',
  'Collect a nightmare shard',
  'Kill a sleepwalker',
  'Craft soul runes at the soul altar (RC 90)',
  'Earn a piece of the Raiments of the Eye',
  'Kill a false self (mirror enemy)',
  'Complete a hard clue step in the Inkweald',
]);

defineTask('inkweald', 'elite', [
  'Defeat the Hollow Choir (8-player raid)',
  'Complete all Inkweald quests',
  'Get a Harmonic blade or Silence bow from the Choir',
  'Kill 200 dream creatures',
  'Complete an elite clue step in the resonance chamber',
  'Earn the full Raiments of the Eye set',
  'Kill a dream dragon',
  'Craft wrath runes at the wrath altar',
  'Kill a memory devourer without losing prayer',
  'Complete the Aelgard Atlas quest',
]);

// ══════════════════════════════════════════════════════════════════════════════
// GLASS DESERT — 10 tasks per tier = 40 tasks
// ══════════════════════════════════════════════════════════════════════════════

defineTask('glass_desert', 'easy', [
  'Enter the Glass Desert',
  'Mine a crystal node',
  'Kill a glass spider',
  'Talk to Crystal Sage Orin',
  'Buy crystal shards from Merchant Zel',
  'Collect 5 crystal shards',
  'Kill 3 glass spiders',
  'Bank at the Glass Desert outpost',
  'Survive 2 minutes in the Glass Desert',
  'Kill a crystal bat',
]);

defineTask('glass_desert', 'medium', [
  'Complete The Glass Prophecy quest',
  'Kill a prism wizard with ranged',
  'Mine 20 crystal shards in one trip',
  'Kill a glass golem with crush',
  'Collect a prism lens',
  'Use a crystal arrow against a glass creature',
  'Kill a refracted elemental',
  'Navigate to the Crystal Wyrm lair entrance',
  'Collect a refracted essence',
  'Kill 10 prism wizards',
]);

defineTask('glass_desert', 'hard', [
  'Defeat the Crystal Wyrm',
  'Complete The Last Dragon Part 1',
  'Kill a crystal dragon',
  'Collect a Wyrm Scale piece',
  'Mine amethyst (mining 92)',
  'Kill a sand wraith with ranged',
  'Complete a hard clue step in the Glass Tyrant arena',
  'Kill 50 glass desert creatures',
  'Use the ancient magicks in the Glass Desert',
  'Defeat The Glass Tyrant',
]);

defineTask('glass_desert', 'elite', [
  'Defeat Veldrak, the Last Dragon',
  'Complete The Last Light of the Old Sun',
  'Complete all Glass Desert quests',
  'Kill the Crystal Wyrm 100 times',
  'Get a Veldrak unique drop',
  'Complete the Infernal Challenge (69 waves)',
  'Complete all Glass Desert collection log entries',
  'Kill a drake',
  'Complete the Chambers of Aelgard raid',
  'Earn the Infernal cape',
]);

const totalTasks = [...diaryTasks.values()].reduce((s, tasks) => s + tasks.length, 0);
console.log(`[aelgard] Detailed diary tasks: ${totalTasks} tasks across 8 regions × 4 tiers`);

module.exports = { diaryTasks, defineTask };
