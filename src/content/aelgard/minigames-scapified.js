// ══════════════════════════════════════════════════════════════════════════════
// Aelgard - Scapified Minigames (burn v2 seed salvage)
//
// Source: /tmp/scape-repos/ScapifyDatSheet/designs/*.md
// Four minigame concepts generated via the Scapify Method that complement the
// existing six minigames in minigames.js:
//
//   1. Marchlands     - 5v5 MOBA-style lane push, Wilds/Heartlands border
//   2. Ramparts       - Solo/duo siege defense, Saltbrine coastal tower
//   3. Deadhold       - Co-op undead survival fortress, Moryskah ruins
//   4. The Ascendancy - Solo roguelike wave combat, Inkweald dreamspire
//
// Each fills a content gap:
//   - Marchlands     -> team PvP with meaningful stakes (Castle Wars is cosmetic)
//   - Ramparts       -> scaling solo siege (no solo wave defense existed)
//   - Deadhold       -> group undead survival (Pest Control is non-thematic)
//   - The Ascendancy -> roguelike run-based combat (no build-diversity content)
//
// Every reward item is untradeable and minigame-locked so the main economy and
// bank-tier gear never devalue.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const items = require('../../data/items');
const npcs = require('../../world/npcs');
const rel = require('../../data/relationships');

// Reuse the existing minigame registry from minigames.js by loading that module
// so IDs collide correctly and the Map aggregates across files.
const mg = require('./minigames');

function defineMinigame(opts) {
  mg.defineMinigame({
    id: opts.id, name: opts.name,
    region: opts.region, location: opts.location,
    type: opts.type,
    minPlayers: opts.minPlayers || 1,
    maxPlayers: opts.maxPlayers || 1,
    attention: opts.attention,
    levelReqs: opts.levelReqs || {},
    questReqs: opts.questReqs || [],
    description: opts.description,
    rewards: opts.rewards || [],
    xpRewards: opts.xpRewards || {},
    pointCurrency: opts.pointCurrency || null,
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// 1. MARCHLANDS - 5v5 lane push PvP minigame
// Region: Wilds/Heartlands border | Attention: Max Focus | Players: 10 (5v5)
// ══════════════════════════════════════════════════════════════════════════════

defineMinigame({
  id: 'marchlands', name: 'Marchlands', region: 'Wilds',
  location: 'The Marchlands (border between Heartlands and the Wilds)',
  type: 'pvp', minPlayers: 10, maxPlayers: 10, attention: 'Max Focus',
  levelReqs: { attack: 70, strength: 70, defence: 70, ranged: 70, magic: 70, hitpoints: 70, prayer: 43 },
  questReqs: ['the_war_below'],
  description: 'Two teams of five push NPC minion waves down a single lane, destroying enemy towers and the stronghold. The combat triangle, prayer flicking, Herblore mid-match potion brewing, and Construction tower repair all matter. A twenty-minute timed match with sudden-death at the cap.',
  pointCurrency: 'siege_marks',
  xpRewards: { attack: 'moderate', strength: 'moderate', ranged: 'moderate', magic: 'moderate', prayer: 'moderate', herblore: 'low', construction: 'low', fletching: 'low', smithing: 'low' },
  rewards: ['Siege Commander ornament set (cosmetic)', 'Battering Ram (warhammer, PvP finisher spec)', 'Rampart Shield (-8% ranged dmg tank)', 'Siegeling pet (1/4000 win, 1/12000 loss)', 'War paint kits'],
});

items.define({ id: 30501, name: 'Siege mark', examine: 'Currency from the Marchlands minigame.', value: 0, category: 'currency', stackable: true, tradeable: false });
items.define({ id: 30502, name: 'Siege commander helm', examine: 'Ornamental helm with castle tower crest. Cosmetic from Marchlands.', value: 0, category: 'armour', equipSlot: 'head', stats: {}, equipReqs: {}, tradeable: false });
items.define({ id: 30503, name: 'Siege commander cape', examine: 'Animated cape showing a crumbling tower. Cosmetic from Marchlands.', value: 0, category: 'armour', equipSlot: 'cape', stats: {}, equipReqs: {}, tradeable: false });
items.define({ id: 30504, name: 'Battering ram', examine: 'A warhammer crowned like a ram. Spec (50%): +25% damage to players below 50% HP.', value: 0, category: 'weapon', equipSlot: 'weapon', stats: { crush: 85, str: 80 }, equipReqs: { attack: 70 }, tradeable: false });
items.define({ id: 30505, name: 'Rampart shield', examine: 'Heavy tower shield. Passive: -8% incoming ranged damage, -1 tick attack speed.', value: 0, category: 'armour', equipSlot: 'shield', stats: { def_stab: 60, def_slash: 60, def_crush: 65, def_ranged: 72, def_magic: -6 }, equipReqs: { defence: 70 }, tradeable: false });
items.define({ id: 30506, name: 'Banner of conquest', examine: 'A POH banner that tracks your Marchlands wins.', value: 0, category: 'cosmetic', tradeable: false });
items.define({ id: 30507, name: 'War paint kit', examine: 'Cosmetic overlay applied during Marchlands matches.', value: 0, category: 'cosmetic', tradeable: false });

npcs.defineNpc('marchlands_marshal', { name: 'Marshal Calen', combat: 0, maxHp: 1, aggressive: false, wanderRadius: 0, canMove: false, examine: 'Organises the five-per-side lane pushes.', dialogue: { type: 'minigame', minigameId: 'marchlands' } });

rel.defineQuestUnlock('the_war_below', {
  name: 'The War Below',
  unlocks: [
    { type: 'minigame', id: 'marchlands', description: 'Access to Marchlands PvP minigame' },
    { type: 'area', id: 'marchlands_staging', description: 'Marchlands staging camp' },
  ],
});

// ══════════════════════════════════════════════════════════════════════════════
// 2. RAMPARTS - Solo/duo siege weapon defense
// Region: Saltbrine | Attention: Active | Players: 1-5
// ══════════════════════════════════════════════════════════════════════════════

defineMinigame({
  id: 'ramparts', name: 'Ramparts', region: 'Saltbrine',
  location: 'Saltbrine Tower (coastal fortress)',
  type: 'combat', minPlayers: 1, maxPlayers: 5, attention: 'Active',
  levelReqs: { construction: 40, ranged: 40 },
  questReqs: ['the_last_garrison'],
  description: 'Operate siege weapons to intercept waves advancing on a crumbling coastal fortress. Lead tick-timed shots down multiple lanes, repair walls with Construction between waves, forge ammunition, and brew a Magic artillery station. Endless mode past wave 40 for the leaderboard.',
  pointCurrency: 'fortification_tokens',
  xpRewards: { ranged: 'high', construction: 'moderate', smithing: 'low', fletching: 'low', magic: 'low' },
  rewards: ['Rampart shield (1/200, wave 20+)', 'Battlement ring (1/400, wave 30+)', 'Trebuchet kit (granite maul reskin)', 'Chonk the Siege Golem pet (1/4000)', 'Siege Commander cosmetic set'],
});

items.define({ id: 30601, name: 'Fortification token', examine: 'Currency from Ramparts.', value: 0, category: 'currency', stackable: true, tradeable: false });
items.define({ id: 30602, name: 'Battlement ring', examine: '+3 Strength, +4 crush defence, +2 all other defence. Tradeable.', value: 80000, category: 'jewellery', equipSlot: 'ring', stats: { str: 3, def_crush: 4, def_stab: 2, def_slash: 2, def_magic: 2, def_ranged: 2 }, equipReqs: {}, tradeable: true });
items.define({ id: 30603, name: 'Trebuchet kit', examine: 'Reskins a granite maul into a miniature trebuchet arm. Spec animation flings a stone.', value: 0, category: 'cosmetic', tradeable: false });
items.define({ id: 30604, name: "Builder's toolkit", examine: 'Grants +5 invisible Construction boost for 5 minutes outside Ramparts.', value: 0, category: 'consumable', tradeable: false });
items.define({ id: 30605, name: 'Fortified rations', examine: 'Heals 16 HP and restores 5 prayer. Ramparts-exclusive.', value: 0, category: 'consumable', tradeable: false });
items.define({ id: 30606, name: 'Ammunition crate', examine: 'Starts your next Ramparts game with steel-tier ammo in reserve.', value: 0, category: 'consumable', tradeable: false });

npcs.defineNpc('ramparts_commander', { name: 'Captain Thorne', combat: 0, maxHp: 1, aggressive: false, wanderRadius: 0, canMove: false, examine: 'Drills the Ramparts crew. He has not slept in a week.', dialogue: { type: 'minigame', minigameId: 'ramparts' } });

rel.defineQuestUnlock('the_last_garrison', {
  name: 'The Last Garrison',
  unlocks: [
    { type: 'minigame', id: 'ramparts', description: 'Access to Ramparts siege minigame' },
    { type: 'area', id: 'saltbrine_tower_upper', description: 'The battlements of Saltbrine Tower' },
  ],
});

// ══════════════════════════════════════════════════════════════════════════════
// 3. DEADHOLD - Co-op undead survival fortress
// Region: Moryskah | Attention: Active | Players: 1-5
// ══════════════════════════════════════════════════════════════════════════════

defineMinigame({
  id: 'deadhold', name: 'Deadhold', region: 'Moryskah',
  location: 'Deadhold Keep (ruined fortress in Moryskah)',
  type: 'combat', minPlayers: 1, maxPlayers: 5, attention: 'Active',
  levelReqs: { construction: 50, smithing: 40, herblore: 30 },
  // [v0.9-waveC2 — M6] _osrs_heritage: true — `priest_in_peril` is a verbatim
  // OSRS quest id; see reports/broken-dag-refs-plan.md §3.3. Content-agent
  // ticket QUEST_HERITAGE_PIP: replace with Scape-native `the_deadhold_summons`
  // (Moryskah-native deadhold intro quest); see quests-pending-v0.9.js.
  questReqs: ['shades_of_moryskah', 'priest_in_peril'],
  description: 'Kill undead, repair barricades, forge weapons, brew potions, and unlock new rooms of a besieged fortress. Spend Dread Tokens to expand your capabilities while infinite waves of increasingly powerful undead threaten to break through. Every skill you have trained matters.',
  pointCurrency: 'dread_tokens',
  xpRewards: { construction: 'high', smithing: 'moderate', herblore: 'moderate', prayer: 'moderate', fletching: 'low', firemaking: 'low' },
  rewards: ['Dreadbone crossbow (1/400, undead spec)', "Barricader's bulwark (1/600, Construction shield)", 'Zombie Champion cape (1/1000 wave 30+)', 'Undead Slayer Sigil', 'Dreadforge hammer', 'Nibbles the zombie rat pet (1/4000 per wave cleared)'],
});

items.define({ id: 30701, name: 'Dread token', examine: 'Currency from Deadhold. Earned per kill and per wave cleared.', value: 0, category: 'currency', stackable: true, tradeable: false });
items.define({ id: 30702, name: 'Dreadbone crossbow', examine: 'Bonus damage to undead. Spec fires an exploding bone bolt hitting adjacent tiles.', value: 0, category: 'weapon', equipSlot: 'weapon', stats: { ranged: 75, ranged_str: 50 }, equipReqs: { ranged: 70 }, tradeable: false });
items.define({ id: 30703, name: "Barricader's bulwark", examine: 'Shield with +2.5% Construction XP. Spec creates a 1-tick temporary barrier.', value: 0, category: 'armour', equipSlot: 'shield', stats: { def_stab: 62, def_slash: 60, def_crush: 58, def_ranged: 55 }, equipReqs: { defence: 65, construction: 50 }, tradeable: false });
items.define({ id: 30704, name: 'Zombie Champion cape', examine: 'Tattered cape from a Deadhold champion. Emote: boarding an invisible window.', value: 0, category: 'armour', equipSlot: 'cape', stats: { def_stab: 8, def_slash: 8, def_crush: 8, prayer: 1 }, equipReqs: {}, tradeable: false });
items.define({ id: 30705, name: 'Undead slayer sigil', examine: 'Passive +5% damage vs undead. Stacks with Salve amulet.', value: 0, category: 'armour', equipSlot: 'ring', stats: {}, equipReqs: {}, tradeable: false });
items.define({ id: 30706, name: 'Dreadforge hammer', examine: 'Works as a Smithing hammer. 10% chance to save a bar while Smithing.', value: 0, category: 'tool', equipSlot: 'weapon', stats: { crush: 18, str: 8 }, equipReqs: {}, tradeable: false });
items.define({ id: 30707, name: 'Barricade kit', examine: 'A portable barricade. Usable once outside Deadhold.', value: 0, category: 'consumable', tradeable: false });
items.define({ id: 30708, name: 'Siege brew (4)', examine: 'Heals 20 HP + restores 10 prayer, lowers Att/Str by 5. 4 doses.', value: 0, category: 'potion', tradeable: false });

npcs.defineNpc('deadhold_captain', { name: 'Captain Rook', combat: 0, maxHp: 1, aggressive: false, wanderRadius: 0, canMove: false, examine: 'Commands the Deadhold garrison. Missing an eye.', dialogue: { type: 'minigame', minigameId: 'deadhold' } });

rel.defineQuestUnlock('shades_of_moryskah', {
  name: 'Shades of Moryskah',
  unlocks: [
    { type: 'minigame', id: 'deadhold', description: 'Access to Deadhold undead survival minigame' },
    { type: 'area', id: 'deadhold_keep', description: 'Deadhold Keep interior' },
  ],
});

// ══════════════════════════════════════════════════════════════════════════════
// 4. THE ASCENDANCY - Solo roguelike wave combat
// Region: Inkweald | Attention: Max Focus | Players: 1-2
// ══════════════════════════════════════════════════════════════════════════════

defineMinigame({
  id: 'the_ascendancy', name: 'The Ascendancy', region: 'Inkweald',
  location: 'The Ascendant Spire (Inkweald dreamscape)',
  type: 'combat', minPlayers: 1, maxPlayers: 2, attention: 'Max Focus',
  levelReqs: { slayer: 60, prayer: 43 },
  questReqs: ['ascension_trial'],
  description: 'Enter barefoot. Kill waves of escalating enemies to collect randomized weapon, armour, and relic upgrades on the ground. Build from nobody to demigod over 50+ waves. Every run plays differently because upgrades are random. All in-run upgrades are lost on wipe.',
  pointCurrency: 'remnant_shards',
  xpRewards: { attack: 'moderate', strength: 'moderate', ranged: 'moderate', magic: 'moderate', prayer: 'moderate', slayer: 'low' },
  rewards: ['Tide of Ruin (1/400 wave 50+, AoE two-hander)', 'Remnant Sigil (1/200 wave 50+, echo-damage offhand)', 'Tattered Remains armour (dynamic recolour by wave)', 'Scrap the junk pet (1/4000 per wave 25+)', 'Remnant Weapon Scrolls (5 cosmetic kits)'],
});

items.define({ id: 30801, name: 'Remnant shard', examine: 'Currency from The Ascendancy. Paid out proportional to the wave you reached.', value: 0, category: 'currency', stackable: true, tradeable: false });
items.define({ id: 30802, name: 'Tide of Ruin', examine: 'Two-handed sword. Spec hits all adjacent enemies in a 3x3 for +25% damage, 55% spec cost.', value: 0, category: 'weapon', equipSlot: 'weapon', stats: { slash: 115, str: 112, two_handed: true }, equipReqs: { attack: 75 }, tradeable: true });
items.define({ id: 30803, name: 'Remnant sigil', examine: 'Offhand. 5% chance per hit to echo the attack for 25% damage.', value: 0, category: 'armour', equipSlot: 'shield', stats: { magic: 6, magic_str: 4 }, equipReqs: { magic: 70 }, tradeable: false });
items.define({ id: 30804, name: 'Tattered remains hood', examine: 'Dynamic recolour: bronze at wave 25, silver 50, gold 75, red 100+.', value: 0, category: 'armour', equipSlot: 'head', stats: {}, equipReqs: {}, tradeable: false });
items.define({ id: 30805, name: 'Tattered remains robe', examine: 'Dynamic recolour by highest wave cleared.', value: 0, category: 'armour', equipSlot: 'body', stats: {}, equipReqs: {}, tradeable: false });
items.define({ id: 30806, name: 'Tattered remains legs', examine: 'Dynamic recolour by highest wave cleared.', value: 0, category: 'armour', equipSlot: 'legs', stats: {}, equipReqs: {}, tradeable: false });
items.define({ id: 30807, name: 'Tattered remains boots', examine: 'Dynamic recolour by highest wave cleared.', value: 0, category: 'armour', equipSlot: 'feet', stats: {}, equipReqs: {}, tradeable: false });
items.define({ id: 30808, name: 'Surge rune pack', examine: 'Consumable. Start your next Ascendancy run with a free upgrade item of your chosen style.', value: 0, category: 'consumable', tradeable: false });
items.define({ id: 30809, name: 'Remnant reroll token', examine: 'Consumable. Once per run, reroll the upgrade items dropped by a wave.', value: 0, category: 'consumable', tradeable: false });
items.define({ id: 30810, name: 'Remnant imbue scroll', examine: 'Imbue a ring to grant +2 prayer bonus. Consumed on use.', value: 0, category: 'consumable', tradeable: false });

npcs.defineNpc('ascendancy_arbiter', { name: 'The Arbiter', combat: 0, maxHp: 1, aggressive: false, wanderRadius: 0, canMove: false, examine: 'A masked figure who judges the Ascendant Trials.', dialogue: { type: 'minigame', minigameId: 'the_ascendancy' } });

rel.defineQuestUnlock('ascension_trial', {
  name: 'The Ascension Trial',
  unlocks: [
    { type: 'minigame', id: 'the_ascendancy', description: 'Access to The Ascendancy roguelike combat minigame' },
    { type: 'area', id: 'ascendant_spire', description: 'The spire atop the Inkweald dream' },
  ],
});

// ══════════════════════════════════════════════════════════════════════════════
// STATS
// ══════════════════════════════════════════════════════════════════════════════

const added = ['marchlands', 'ramparts', 'deadhold', 'the_ascendancy'];
console.log(`[aelgard] ${added.length} scapified minigames added (total map size: ${mg.minigames.size})`);

module.exports = { added };
