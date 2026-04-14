// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Heartlands Deepening (Flagship Region #1)
//
// Target: push Heartlands from 68/100 to 85+ depth score.
// Heartlands is the starter hub. It needs to be enormous, safe, and
// richly interconnected — the region where locked accounts could max nearly
// everything and still discover content after 300 hours.
//
// This file ADDS content. The existing heartlands.js stays intact.
//
// Goals:
//   - All 23 skills self-sufficient in Heartlands
//   - 8+ quests, each with a unique non-degenerate unlock
//   - Full hub infrastructure (GE, all guilds, achievement diary)
//   - The Grand Feast prestige goal fully wired
//   - Cross-region exports that make Heartlands critical to everyone
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const rel = require('../../data/relationships');

// ══════════════════════════════════════════════════════════════════════════════
// NEW HEARTLANDS EXPORTS — items that other regions need
// ══════════════════════════════════════════════════════════════════════════════

// Heartlands has abundant standard resources — everyone needs them
rel.registerItemSource(90001, { type: 'gathering', sourceId: 'heartlands_flax_field', sourceName: 'Flax Field', region: 'heartlands', details: 'Flax. Core fletching/crafting material. Spun into bowstring.', obscure: false });
rel.registerItemSource(90002, { type: 'gathering', sourceId: 'heartlands_clay_pit', sourceName: 'Clay Pit', region: 'heartlands', details: 'Clay. Crafting & construction. Wet for pottery or use as mortar.', obscure: false });
rel.registerItemSource(90003, { type: 'drop', sourceId: 'heartlands_goblin', sourceName: 'Goblin', region: 'heartlands', details: 'Goblin mail — only source of small armor tiers. OBSCURE: a specific armor piece grants +1 crafting at any Heartlands altar.', obscure: true });
rel.registerItemSource(90004, { type: 'gathering', sourceId: 'heartlands_vineyard', sourceName: 'Heartlands Vineyard', region: 'heartlands', details: 'Heartlands grapes. Cooking/herblore. Wine production starts here.', obscure: false });
rel.registerItemSource(90005, { type: 'shop', sourceId: 'heartlands_apothecary', sourceName: 'Heartlands Apothecary', region: 'heartlands', details: 'Vials of water — the base for every potion in Aelgard.', obscure: false });
rel.registerItemSource(90006, { type: 'drop', sourceId: 'heartlands_guard_captain', sourceName: 'Guard Captain', region: 'heartlands', details: 'Heartlands steel. Smithing component with +5% durability bonus.', obscure: false });
rel.registerItemSource(90007, { type: 'gathering', sourceId: 'heartlands_lakeside_reed', sourceName: 'Lakeside Reed', region: 'heartlands', details: 'Papyrus reed. Only source of paper — needed for every scroll in Aelgard.', obscure: true });

// ══════════════════════════════════════════════════════════════════════════════
// 8 NEW HEARTLANDS QUESTS WITH OBSCURE UNLOCKS
// Every quest gives something UNIQUE — area, training method, shop, or key item
// ══════════════════════════════════════════════════════════════════════════════

rel.defineQuestUnlock('the_blacksmiths_apprentice', {
  name: "The Blacksmith's Apprentice",
  unlocks: [
    { type: 'training_method', id: 'heartlands_master_anvil', description: 'Access to Master Smith Bron\'s private anvil — 1 tile from bank + 5% smithing XP' },
    { type: 'item_equip', id: 'apprentices_hammer', description: "Apprentice's Hammer — lighter, never breaks, works on all tiers up to rune" },
  ],
});

rel.defineQuestUnlock('the_missing_deeds', {
  name: 'The Missing Deeds',
  unlocks: [
    { type: 'training_method', id: 'heartlands_thieving_mansion', description: 'Access to the Noble Mansion thieving route — 50k thieving XP/hr in safe zone' },
    { type: 'shop', id: 'heartlands_black_market', description: 'Black Market fence — sells thieving-exclusive items and buys stolen goods at higher rates' },
  ],
});

rel.defineQuestUnlock('the_grain_rot', {
  name: 'The Grain Rot',
  unlocks: [
    { type: 'training_method', id: 'heartlands_farming_rotation', description: 'Teaches 4-field crop rotation — permanent +15% farming yield in Heartlands' },
    { type: 'recipe', id: 'heartlands_fertilizer', description: 'Heartlands super-compost recipe — prevents disease on ALL farming patches' },
  ],
});

rel.defineQuestUnlock('the_drowned_miller', {
  name: 'The Drowned Miller',
  unlocks: [
    { type: 'area', id: 'heartlands_old_mill', description: 'Old Mill — flour processing, haunted farming (ghost-touched crops grant 2x XP)' },
    { type: 'recipe', id: 'spirit_bread', description: 'Spirit Bread recipe — heals 2x HP, creates slight prayer bonus' },
  ],
});

rel.defineQuestUnlock('the_guild_trials', {
  name: 'The Guild Trials',
  unlocks: [
    { type: 'area', id: 'heartlands_all_guilds', description: 'Simultaneous access to all 6 Heartlands guilds (cooking, fishing, crafting, mining, warriors, magic)' },
    { type: 'item_equip', id: 'guild_medallion', description: 'Guild Medallion — reduces all guild entry requirements by 5 levels' },
  ],
});

rel.defineQuestUnlock('the_royal_falconer', {
  name: 'The Royal Falconer',
  unlocks: [
    { type: 'training_method', id: 'heartlands_falconry', description: 'Falconry — unique hunter method. Fast XP + meat drops. ONLY way to catch kebbits without traps.' },
    { type: 'item_equip', id: 'royal_falcon', description: 'Royal Falcon pet — +10% hunter success rate anywhere in Aelgard' },
  ],
});

rel.defineQuestUnlock('the_paper_forge', {
  name: 'The Paper Forge',
  unlocks: [
    { type: 'training_method', id: 'heartlands_papermaking', description: 'Papermaking station — turns reeds into paper. Feeds the entire Aelgard scroll economy.' },
    { type: 'recipe', id: 'aelgard_scroll_base', description: 'Scroll crafting base — required for ALL teleport scrolls in every region' },
  ],
});

rel.defineQuestUnlock('the_culinaromancers_curse', {
  name: "The Culinaromancer's Curse",
  unlocks: [
    { type: 'boss', id: 'evil_chef_heartlands', description: 'The Evil Chef — Grand Feast prestige boss. 3 phases: Soup, Main, Dessert. Drops Culinaromancer Gloves.' },
    { type: 'item_equip', id: 'culinaromancer_gloves', description: 'Culinaromancer Gloves — BIS melee gloves in early-mid game. Iconic prestige reward.' },
    { type: 'area', id: 'heartlands_grand_hall', description: 'The Grand Hall — permanent Heartlands teleport hub with all 6 guild masters' },
  ],
});

// ══════════════════════════════════════════════════════════════════════════════
// NEW HEARTLANDS TRAINING METHODS — unblock self-sufficiency gaps
// Using the analyzer output to target skills that weren't self-sufficient
// ══════════════════════════════════════════════════════════════════════════════

// DEFENCE — new methods covering bracket gaps
rel.defineTrainingMethod('heartlands_guard_patrol', {
  skill: 'defence', name: 'Guard Patrol Drills',
  levelRange: [1, 40],
  xpPerHour: 18000,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['heartlands'] },
  resourceOutput: { produces: [{ name: 'Guard stipend', perHour: 1000 }], net: 'profit' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'afk',
  inputs: [{ name: 'Basic food', perHour: 5, source: 'heartlands_food' }],
  description: 'Patrol the Heartlands walls with the guard corps. Defensive stance. Boring but safe.',
  location: 'Heartlands',
});

rel.defineTrainingMethod('heartlands_noble_bodyguard', {
  skill: 'defence', name: 'Noble Bodyguard Work',
  levelRange: [30, 75],
  xpPerHour: 52000,
  prerequisites: { skills: { defence: 30 }, quests: ['the_missing_deeds'], items: [], areas: ['heartlands'] },
  resourceOutput: { produces: [{ name: 'Noble tips', perHour: 25000 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 0,
  danger: 'medium', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Mid-tier food', perHour: 15, source: 'cooking' }],
  description: 'Escort Heartlands nobles between guilds. Occasional assassination attempts provide combat practice.',
  location: 'Heartlands',
});

// HITPOINTS — add AFK option at low levels and active option at high levels
rel.defineTrainingMethod('heartlands_infirmary_patient', {
  skill: 'hitpoints', name: 'Infirmary Practice Ward',
  levelRange: [1, 30],
  xpPerHour: 8000,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['heartlands'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 500,
  danger: 'low', complexity: 'trivial', attention: 'afk',
  inputs: [{ name: 'Bandages', perHour: 10, source: 'heartlands_apothecary' }],
  description: 'Practice taking damage at the Apothecary infirmary. Healers patch you up. Pure HP training.',
  location: 'Heartlands',
});

// CONSTRUCTION — unblock low levels with a proper starter method
rel.defineTrainingMethod('heartlands_carpenter_apprentice', {
  skill: 'construction', name: 'Carpenter Apprentice Work',
  levelRange: [1, 30],
  xpPerHour: 16000,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['heartlands'] },
  resourceOutput: { produces: [], net: 'loss' },
  bankingFrequency: 'frequent', costPerHour: 5000,
  danger: 'none', complexity: 'simple', attention: 'low',
  inputs: [{ name: 'Logs', perHour: 600, source: 'woodcutting' }, { name: 'Nails', perHour: 200, source: 'smithing' }],
  description: 'Help local carpenters build houses. Slow XP but no house needed.',
  location: 'Heartlands',
});

// THIEVING — add early Heartlands option
rel.defineTrainingMethod('heartlands_market_pickpocket', {
  skill: 'thieving', name: 'Heartlands Market Pickpocketing',
  levelRange: [1, 45],
  xpPerHour: 22000,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['heartlands'] },
  resourceOutput: { produces: [{ name: 'Gold coins', perHour: 8000 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 0,
  danger: 'low', complexity: 'simple', attention: 'low',
  inputs: [],
  description: 'Pickpocket marketgoers. Getting caught = small fine, no real danger.',
  location: 'Heartlands',
});

// FLETCHING — unblock with a starter path tied to flax
rel.defineTrainingMethod('heartlands_bowstring_spinning', {
  skill: 'fletching', name: 'Bowstring Spinning',
  levelRange: [10, 50],
  xpPerHour: 45000,
  prerequisites: { skills: { fletching: 10 }, quests: [], items: [], areas: ['heartlands'] },
  resourceOutput: { produces: [{ name: 'Bowstring', perHour: 1500 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'afk',
  inputs: [{ name: 'Flax', perHour: 1500, source: 'heartlands_flax_field' }],
  description: 'Spin flax into bowstring on the spinning wheel. Produces THE key fletching input.',
  location: 'Heartlands',
});

rel.defineTrainingMethod('heartlands_novice_fletching', {
  skill: 'fletching', name: 'Novice Arrow Fletching',
  levelRange: [1, 30],
  xpPerHour: 20000,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['heartlands'] },
  resourceOutput: { produces: [{ name: 'Bronze arrows', perHour: 2000 }], net: 'neutral' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'afk',
  inputs: [{ name: 'Logs', perHour: 200, source: 'woodcutting' }, { name: 'Bronze arrowheads', perHour: 2000, source: 'smithing' }],
  description: 'Fletch basic arrows for the Heartlands militia. Low XP but produces ammo.',
  location: 'Heartlands',
});

// SLAYER — unblock with a starter slayer master
rel.defineTrainingMethod('heartlands_slayer_turael', {
  skill: 'slayer', name: 'Heartlands Novice Slayer',
  levelRange: [1, 40],
  xpPerHour: 16000,
  prerequisites: { skills: {}, quests: ['the_slayers_first_mark'], items: [], areas: ['heartlands'] },
  resourceOutput: { produces: [{ name: 'Gold coins', perHour: 12000 }, { name: 'Slayer points', perHour: 15 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'low', complexity: 'moderate', attention: 'low',
  inputs: [{ name: 'Basic food', perHour: 20, source: 'cooking' }],
  description: 'Novice slayer tasks from the Heartlands lodge. Chickens, rats, cows, goblins. Safe learning.',
  location: 'Heartlands',
});

// MINING — add a dedicated Heartlands mining method (not just generic copper/tin)
rel.defineTrainingMethod('heartlands_deep_mines', {
  skill: 'mining', name: 'Heartlands Deep Mines',
  levelRange: [45, 85],
  xpPerHour: 72000,
  prerequisites: { skills: { mining: 45 }, quests: [], items: [], areas: ['heartlands_mining_guild'] },
  resourceOutput: { produces: [{ name: 'Mithril ore', perHour: 180 }, { name: 'Adamantite ore', perHour: 60 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'simple', attention: 'low',
  inputs: [],
  description: 'Mining Guild deep shafts. Free mithril/adamant ore. No PKers, no competition.',
  location: 'Heartlands',
});

// FARMING — Heartlands farming guild method
rel.defineTrainingMethod('heartlands_farming_rotation', {
  skill: 'farming', name: 'Heartlands 4-Field Rotation',
  levelRange: [30, 99],
  xpPerHour: 55000,
  prerequisites: { skills: { farming: 30 }, quests: ['the_grain_rot'], items: [], areas: ['heartlands'] },
  resourceOutput: { produces: [{ name: 'Herbs (varied)', perHour: 200 }, { name: 'Crops', perHour: 500 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 3000,
  danger: 'none', complexity: 'moderate', attention: 'low',
  inputs: [{ name: 'Herb seeds', perHour: 20, source: 'ge_or_drops' }, { name: 'Heartlands fertilizer', perHour: 100, source: 'farming_guild' }],
  description: 'Rotate 4 Heartlands fields through wheat → potato → herb → allotment. +15% yield via rotation.',
  location: 'Heartlands',
  breakpointAt: 30,
});

// HERBLORE — Heartlands apothecary method
rel.defineTrainingMethod('heartlands_apothecary_mixing', {
  skill: 'herblore', name: 'Apothecary Potion Mixing',
  levelRange: [1, 60],
  xpPerHour: 60000,
  prerequisites: { skills: { herblore: 3 }, quests: [], items: [], areas: ['heartlands'] },
  resourceOutput: { produces: [{ name: 'Potions', perHour: 300 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'simple', attention: 'medium',
  inputs: [{ name: 'Clean herbs', perHour: 300, source: 'farming' }, { name: 'Vial of water', perHour: 300, source: 'heartlands_apothecary' }],
  description: 'Mix potions at the Heartlands Apothecary. Clean herb + secondary + vial. Bread-and-butter herblore.',
  location: 'Heartlands',
});

// FISHING — add Heartlands river/lake fishing at multiple tiers
rel.defineTrainingMethod('heartlands_river_fishing', {
  skill: 'fishing', name: 'Heartlands River Fishing',
  levelRange: [1, 50],
  xpPerHour: 35000,
  prerequisites: { skills: {}, quests: [], items: [{ name: 'Fishing rod' }], areas: ['heartlands'] },
  resourceOutput: { produces: [{ name: 'Raw trout', perHour: 100 }, { name: 'Raw salmon', perHour: 50 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'afk',
  inputs: [{ name: 'Feathers', perHour: 100, source: 'heartlands_chicken' }],
  description: 'Fly-fish the Heartlands river. Produces the core food supply for most of Aelgard.',
  location: 'Heartlands',
});

// FISHING GUILD — higher tier method
rel.defineTrainingMethod('heartlands_fishing_guild', {
  skill: 'fishing', name: 'Heartlands Fishing Guild',
  levelRange: [68, 99],
  xpPerHour: 85000,
  prerequisites: { skills: { fishing: 68 }, quests: [], items: [], areas: ['heartlands_fishing_guild'] },
  resourceOutput: { produces: [{ name: 'Raw shark', perHour: 180 }, { name: 'Raw swordfish', perHour: 90 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 0,
  danger: 'none', complexity: 'simple', attention: 'low',
  inputs: [],
  description: 'Fishing Guild harpoon area. Best pure-fishing method for sharks.',
  location: 'Heartlands',
});

// ══════════════════════════════════════════════════════════════════════════════
// MORE QUIRKY INTERACTIONS IN HEARTLANDS
// ══════════════════════════════════════════════════════════════════════════════

rel.defineTrainingMethod('quirky_heartlands_well_bucket', {
  skill: 'strength',
  name: '[Quirky] Haul the Well Bucket',
  levelRange: [1, 99],
  xpPerHour: 2000,
  prerequisites: { skills: {}, quests: [], items: [{ name: 'Bucket' }], areas: ['heartlands'] },
  resourceOutput: { produces: [{ name: 'Jug of water', perHour: 200 }], net: 'profit' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'high',
  inputs: [],
  description: 'Haul a heavy bucket up the village well. Tiny strength XP per lift. Produces water.',
  location: 'Heartlands',
});

rel.defineTrainingMethod('quirky_heartlands_scarecrow_kick', {
  skill: 'attack',
  name: '[Quirky] Kick the Scarecrow',
  levelRange: [1, 99],
  xpPerHour: 1200,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['heartlands'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'high',
  inputs: [],
  description: 'Kick the farm scarecrow repeatedly. Gives the tiniest attack XP. The farmer watches, bemused.',
  location: 'Heartlands',
});

rel.defineTrainingMethod('quirky_heartlands_library_study', {
  skill: 'magic',
  name: '[Quirky] Read the Spell Tome',
  levelRange: [1, 99],
  xpPerHour: 1800,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['heartlands'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'low',
  inputs: [],
  description: 'Browse the Heartlands library. Tiny magic XP per page turned.',
  location: 'Heartlands',
});

rel.defineTrainingMethod('quirky_heartlands_horse_groom', {
  skill: 'hunter',
  name: '[Quirky] Groom the Stable Horses',
  levelRange: [1, 99],
  xpPerHour: 1500,
  prerequisites: { skills: {}, quests: [], items: [{ name: 'Brush' }], areas: ['heartlands'] },
  resourceOutput: { produces: [{ name: 'Horsehair', perHour: 50 }], net: 'profit' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'low',
  inputs: [],
  description: 'Brush the Heartlands stable horses. Unusual hunter XP. Horsehair sells to fletchers.',
  location: 'Heartlands',
});

rel.defineTrainingMethod('quirky_heartlands_church_bell', {
  skill: 'strength',
  name: '[Quirky] Ring the Church Bell',
  levelRange: [1, 99],
  xpPerHour: 2500,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['heartlands'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'high',
  inputs: [],
  description: 'Pull the church bell rope. Heavy work. The priest tolerates it for a few hours a day.',
  location: 'Heartlands',
});

rel.defineTrainingMethod('quirky_heartlands_woodpile_stack', {
  skill: 'woodcutting',
  name: '[Quirky] Stack the Woodpile',
  levelRange: [1, 99],
  xpPerHour: 1000,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['heartlands'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'medium',
  inputs: [],
  description: 'Organize the town woodpile. Technically woodcutting XP. Really just being helpful.',
  location: 'Heartlands',
});

// ══════════════════════════════════════════════════════════════════════════════
// BREAKPOINTS — Heartlands-specific threshold moments
// ══════════════════════════════════════════════════════════════════════════════

rel.defineBreakpoint({
  type: 'quest_complete', trigger: { quest: 'the_culinaromancers_curse' },
  description: 'Grand Feast complete. Culinaromancer Gloves equipped. Best melee gloves until Barrows. This IS the Heartlands prestige moment.',
  unlocks: [
    { type: 'item_equip', id: 'culinaromancer_gloves', description: 'BIS early-mid melee gloves' },
    { type: 'area', id: 'heartlands_grand_hall', description: 'Grand Hall teleport hub' },
  ],
  importance: 'transformative',
});

rel.defineBreakpoint({
  type: 'quest_complete', trigger: { quest: 'the_guild_trials' },
  description: 'Guild Medallion acquired. Every Heartlands guild 5 levels easier to access. Shortcuts the whole early-mid game.',
  unlocks: [{ type: 'item_equip', id: 'guild_medallion', description: 'Guild level requirements -5' }],
  importance: 'major',
});

rel.defineBreakpoint({
  type: 'quest_complete', trigger: { quest: 'the_paper_forge' },
  description: 'Paper economy unlocked. Heartlands becomes the scroll producer for all of Aelgard. Cross-region dependency critical.',
  unlocks: [{ type: 'training_method', id: 'heartlands_papermaking', description: 'Papermaking station' }],
  importance: 'major',
});

rel.defineBreakpoint({
  type: 'skill_level', trigger: { skill: 'farming', level: 32 },
  description: 'Ranarr seeds via Heartlands rotation. THE farming money breakthrough — each run nets ~80k profit at this level.',
  unlocks: [{ type: 'training_method', id: 'heartlands_farming_rotation', description: 'Full 4-field ranarr rotation' }],
  importance: 'major',
});

// ══════════════════════════════════════════════════════════════════════════════
// ITEM SOURCES & USES — dense web so nothing is orphaned
// ══════════════════════════════════════════════════════════════════════════════

// Flax touches 3 skills
rel.registerItemUse(90001, { type: 'recipe', targetId: 'bowstring', targetName: 'Bowstring (Fletching)', region: 'heartlands', details: 'Spin flax into bowstring.', obscure: false });
rel.registerItemUse(90001, { type: 'recipe', targetId: 'fishing_net_fabric', targetName: 'Fishing Net (Crafting)', region: 'heartlands', details: 'Craft into fishing nets.', obscure: true });
rel.registerItemUse(90001, { type: 'recipe', targetId: 'linen_wraps', targetName: 'Linen Wraps (Prayer)', region: 'heartlands', details: 'Prayer offering wraps. Cross-region with Boneyard.', obscure: true });

// Clay touches 3 skills
rel.registerItemUse(90002, { type: 'recipe', targetId: 'pottery_pie_dish', targetName: 'Pottery Pie Dish', region: 'heartlands', details: 'Crafting: pie dishes for cooking.', obscure: false });
rel.registerItemUse(90002, { type: 'recipe', targetId: 'construction_mortar', targetName: 'Construction Mortar', region: 'heartlands', details: 'Mortar base for POH construction.', obscure: false });
rel.registerItemUse(90002, { type: 'recipe', targetId: 'clay_poultice', targetName: 'Clay Poultice', region: 'heartlands', details: 'Obscure: herblore secondary for healing poultices.', obscure: true });

// Papyrus reed — cross-region critical
rel.registerItemUse(90007, { type: 'recipe', targetId: 'paper', targetName: 'Paper', region: 'heartlands', details: 'Only source of paper in Aelgard.', obscure: false });
rel.registerItemUse(90007, { type: 'recipe', targetId: 'teleport_scrolls', targetName: 'Teleport Scrolls', region: null, details: 'Paper is required for every scroll in every region. MASSIVE cross-region demand.', obscure: false });

console.log('[aelgard] Heartlands Deep loaded: 8 quests, 14 training methods, 6 quirky interactions, 4 breakpoints, dense item web');
