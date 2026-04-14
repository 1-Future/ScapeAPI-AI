// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Leagues / Seasonal Game Modes
// Seasonal content that gives the entire game a fresh experience every few months.
// Each league is 6-8 weeks, fresh server, everyone starts from 0.
// Relic system: choose permanent buffs at XP milestones.
// Task system: complete tasks for points, points for rewards.
//
// THIS is infinite replayability. Every league is the same game but played
// completely differently due to relic choices and task priorities.
// Manifesto P03: Self-direction (pick your own relics/path)
// Manifesto P06: Permanent progress via transferable rewards
// ══════════════════════════════════════════════════════════════════════════════

const items = require('../../data/items');

// ── Relic Tiers ────────────────────────────────────────────────────────────
// At each tier milestone, choose 1 of 3 relics. Choice is permanent for the league.

const relicTiers = [
  {
    tier: 1, pointsRequired: 0, name: 'Starting Relic',
    options: [
      { id: 'production_master', name: 'Production Master', effect: '+50% processing speed (cooking, smithing, herblore, crafting, fletching)' },
      { id: 'endless_harvest', name: 'Endless Harvest', effect: 'Double resources from gathering (mining, fishing, woodcutting, farming, hunter)' },
      { id: 'swift_blade', name: 'Swift Blade', effect: '+20% attack speed in combat' },
    ],
  },
  {
    tier: 2, pointsRequired: 500, name: 'Movement Relic',
    options: [
      { id: 'fairy_flight', name: 'Fairy Flight', effect: 'Unlimited teleportation to any fairy ring without staff' },
      { id: 'eternal_jeweller', name: 'Eternal Jeweller', effect: 'Jewellery never loses charges. Infinite teleports.' },
      { id: 'recall', name: 'Last Recall', effect: 'Teleport back to your last location at will (1 min cooldown)' },
    ],
  },
  {
    tier: 3, pointsRequired: 2000, name: 'Combat Relic',
    options: [
      { id: 'blood_fury', name: 'Blood Fury', effect: 'All melee attacks heal 10% of damage dealt' },
      { id: 'chain_magic', name: 'Chain Magic', effect: 'Spells hit 2 additional targets in multi-combat' },
      { id: 'quick_shot', name: 'Quick Shot', effect: 'Ranged attacks have 20% chance to fire twice' },
    ],
  },
  {
    tier: 4, pointsRequired: 5000, name: 'Skilling Relic',
    options: [
      { id: 'greedy_gatherer', name: 'Greedy Gatherer', effect: 'Triple XP from gathering skills' },
      { id: 'draining_strikes', name: 'Draining Strikes', effect: 'Combat XP is tripled' },
      { id: 'treasure_seeker', name: 'Treasure Seeker', effect: '10x clue scroll drop rate, 2x clue rewards' },
    ],
  },
  {
    tier: 5, pointsRequired: 10000, name: 'Mastery Relic',
    options: [
      { id: 'weapon_specialist', name: 'Weapon Specialist', effect: 'Spec bar regenerates 50% faster. Special attacks cost 50% less.' },
      { id: 'alchemist', name: 'Alchemist', effect: 'High alchemy gives 150% value. Items sell to shops at 200% value.' },
      { id: 'infernal_gathering', name: 'Infernal Gathering', effect: 'Resources are automatically processed when gathered (ores auto-smelt, fish auto-cook, logs auto-burn)' },
    ],
  },
  {
    tier: 6, pointsRequired: 25000, name: 'Endgame Relic',
    options: [
      { id: 'absolute_unit', name: 'Absolute Unit', effect: 'Max hit increased by 50%. Prayer doesn\'t drain.' },
      { id: 'xp_cascade', name: 'XP Cascade', effect: '8x XP in your 3 lowest skills' },
      { id: 'drop_enhancer', name: 'Drop Enhancer', effect: 'Rare drop table is 5x more likely. Boss uniques 3x more common.' },
    ],
  },
];

// ── League Tasks ───────────────────────────────────────────────────────────
// Tasks are objectives that earn league points. 5 tiers of difficulty.

const leagueTaskTiers = {
  easy: { points: 10, count: 200, examples: ['Kill 1 chicken', 'Catch 1 shrimp', 'Complete 1 quest'] },
  medium: { points: 40, count: 150, examples: ['Kill Forgefather Duran', 'Mine 100 iron ore', 'Complete a clue scroll'] },
  hard: { points: 100, count: 100, examples: ['Kill Zulrah', 'Get 99 in any skill', 'Complete a hard diary'] },
  elite: { points: 250, count: 60, examples: ['Kill the Glass Tyrant', 'Complete all quests', 'Get 10 unique boss drops'] },
  master: { points: 750, count: 30, examples: ['Complete the Inferno', 'Solo CoA', 'Max total level', 'Get all pets'] },
};

// Total possible points: 200×10 + 150×40 + 100×100 + 60×250 + 30×750 = 2000 + 6000 + 10000 + 15000 + 22500 = 55,500

// ── League Reward Shop ─────────────────────────────────────────────────────
// Points earned in leagues transfer to the main game as league points.
// Spend on cosmetic rewards that are ONLY available through leagues.

const leagueRewards = [];

function defineLeagueReward(opts) {
  leagueRewards.push(opts);
  if (opts.itemId) items.define(opts.item);
}

// Trophy tiers (earned automatically)
items.define({ id: 98001, name: 'Bronze league trophy', examine: 'Earned by reaching 2,500 points in a league.', value: 0, category: 'misc', tradeable: false });
items.define({ id: 98002, name: 'Iron league trophy', examine: 'Earned by reaching 5,000 points.', value: 0, category: 'misc', tradeable: false });
items.define({ id: 98003, name: 'Steel league trophy', examine: 'Earned by reaching 10,000 points.', value: 0, category: 'misc', tradeable: false });
items.define({ id: 98004, name: 'Mithril league trophy', examine: 'Earned by reaching 20,000 points.', value: 0, category: 'misc', tradeable: false });
items.define({ id: 98005, name: 'Adamant league trophy', examine: 'Earned by reaching 35,000 points.', value: 0, category: 'misc', tradeable: false });
items.define({ id: 98006, name: 'Rune league trophy', examine: 'Earned by reaching 50,000+ points. The highest tier.', value: 0, category: 'misc', tradeable: false });
items.define({ id: 98007, name: 'Dragon league trophy', examine: 'Top 1% of all league participants. Exclusive.', value: 0, category: 'misc', tradeable: false });

// Purchasable cosmetic rewards
items.define({ id: 98101, name: 'Twisted league horns', examine: 'Cosmetic headpiece from leagues. Shows league participation.', value: 0, category: 'armour', equipSlot: 'head', stats: {}, tradeable: false });
items.define({ id: 98102, name: 'Trailblazer graceful', examine: 'Recoloured graceful outfit from leagues. Purely cosmetic.', value: 0, category: 'armour', equipSlot: 'body', stats: {}, tradeable: false });
items.define({ id: 98103, name: 'Shattered relics trophy', examine: 'A miniature relic display.', value: 0, category: 'misc', tradeable: false });
items.define({ id: 98104, name: 'League cannon ornament kit', examine: 'Recolour your cannon with league colours.', value: 0, category: 'misc', tradeable: false });
items.define({ id: 98105, name: 'League home teleport animation', examine: 'A unique teleport animation for league participants.', value: 0, category: 'misc', tradeable: false });

// ── League History ─────────────────────────────────────────────────────────
// Each league has a theme that changes how the game is played.

const leagueHistory = [
  {
    id: 'league_1', name: 'Twisted League',
    theme: 'Locked to one region (chosen at start). Must complete all content in that region.',
    duration: '6 weeks',
    uniqueMechanic: 'Region locking forces creative solutions. What regions have all the resources you need?',
  },
  {
    id: 'league_2', name: 'Trailblazer League',
    theme: 'Unlock regions one at a time. Start with 2, earn more through points.',
    duration: '8 weeks',
    uniqueMechanic: 'Choose which regions to unlock. Different unlock orders create different experiences.',
  },
  {
    id: 'league_3', name: 'Shattered Relics League',
    theme: 'Random relic fragments. Collect fragments to unlock relics in random order.',
    duration: '6 weeks',
    uniqueMechanic: 'You don\'t choose relics — you find them. Adapt to what you get.',
  },
  {
    id: 'league_4', name: 'Raging Echoes League',
    theme: 'Every boss has an echo version with harder mechanics and better drops.',
    duration: '8 weeks',
    uniqueMechanic: 'Echo bosses: same boss, 2x HP, 1 extra mechanic, 3x drop rate.',
  },
  {
    id: 'league_5', name: 'Deadman League',
    theme: 'PvP everywhere. Lose items on death. Faster XP rates. Final tournament.',
    duration: '4 weeks + 1 week tournament',
    uniqueMechanic: 'Build your account fast, survive PvP, compete in final-hour tournament for prizes.',
  },
];

console.log(`[aelgard] Leagues: ${relicTiers.length} relic tiers, ${Object.keys(leagueTaskTiers).length} task tiers, ${leagueRewards.length + 12} rewards, ${leagueHistory.length} league templates`);

module.exports = { relicTiers, leagueTaskTiers, leagueRewards, leagueHistory };
