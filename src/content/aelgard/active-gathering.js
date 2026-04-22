// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Active Gathering Methods
//
// Manifesto P02 (Attention Calibration): Every skill needs methods across the
// full AFK → Max Focus spectrum. Currently all gathering is Background tier.
// These methods fill the Active and Max Focus tiers.
//
// Design Knobs (P13) for each method documented inline.
// ══════════════════════════════════════════════════════════════════════════════

const items = require('../../data/items');
const npcs = require('../../world/npcs');
const quests = require('../../data/quests');

// ══════════════════════════════════════════════════════════════════════════════
// FISHING — Saltbrine Trawler (Active fishing minigame)
//
// Knobs: XP/hr HIGH (55k), Prereqs MEDIUM (Fishing 35 + Pirate King quest),
//        Resource MEDIUM (fish + unique rewards), Inventory HIGH (non-stackable catch),
//        Cost LOW, Danger MEDIUM (waves can damage you), Complexity HIGH (repair boat,
//        haul nets, dodge waves), Attention ACTIVE (70-90%)
//
// Compare to: AFK fishing at 20-35k XP/hr. This is 2x the XP but demands constant
// input. Trade-off: attention for speed. Neither dominates the other.
// ══════════════════════════════════════════════════════════════════════════════

items.define({ id: 13001, name: 'Trawler net', examine: 'A large fishing net. Used for trawler fishing at Saltbrine.', value: 200, category: 'tool', weight: 2 });
items.define({ id: 13002, name: 'Anglerfish (raw)', examine: 'A raw anglerfish caught from the trawler.', value: 300, category: 'fishing', weight: 0.5 });
items.define({ id: 13003, name: 'Anglerfish', examine: 'Heals up to 22 HP based on your Hitpoints level.', value: 500, category: 'food', weight: 0.5 });
items.define({ id: 13004, name: 'Pearl fishing rod', examine: 'A rod crafted from Saltbrine pearls. +5% catch rate.', value: 10000, category: 'tool', equipSlot: 'weapon', speed: 5, stats: {}, equipReqs: { fishing: 50 } });
items.define({ id: 13005, name: "Angler's outfit (hat)", examine: 'Part of the angler outfit. Full set gives +2.5% fishing XP.', value: 5000, category: 'armour', equipSlot: 'head', stats: {}, equipReqs: { fishing: 35 } });
items.define({ id: 13006, name: "Angler's outfit (top)", examine: 'Part of the angler outfit.', value: 8000, category: 'armour', equipSlot: 'body', stats: {}, equipReqs: { fishing: 35 } });
items.define({ id: 13007, name: "Angler's outfit (legs)", examine: 'Part of the angler outfit.', value: 6000, category: 'armour', equipSlot: 'legs', stats: {}, equipReqs: { fishing: 35 } });
items.define({ id: 13008, name: "Angler's outfit (boots)", examine: 'Part of the angler outfit.', value: 4000, category: 'armour', equipSlot: 'feet', stats: {}, equipReqs: { fishing: 35 } });

// NPC at Saltbrine harbour
npcs.defineNpc('trawler_captain_reed', {
  name: 'Captain Reed', combat: 0, maxHp: 1, size: 1,
  aggressive: false, wanderRadius: 0, canMove: false,
  examine: 'Runs the Saltbrine Trawler. "Come fish with me, or fish alone. Either way, fish."',
  dialogue: { type: 'minigame', minigameId: 'saltbrine_trawler' },
});

// ══════════════════════════════════════════════════════════════════════════════
// WOODCUTTING — Storm Felling in Veilwood (Max Focus)
//
// Knobs: XP/hr VERY HIGH (70k), Prereqs HIGH (WC 50 + Veilwood Covenant quest),
//        Resource HIGH (veilwood bark + spirit seeds), Inventory MEDIUM,
//        Cost LOW, Danger HIGH (storm lightning can kill you), Complexity HIGH
//        (dodge lightning, chop between strikes, manage stamina), Attention MAX (100%)
//
// Compare to: AFK willows at 40k. This is 1.75x XP but you can literally die.
// Trade-off: danger + focus for speed + unique resources.
// ══════════════════════════════════════════════════════════════════════════════

items.define({ id: 13101, name: 'Stormwood log', examine: 'A log struck by lightning during a Veilwood storm. Crackles with energy.', value: 400, category: 'woodcutting', weight: 2 });
items.define({ id: 13102, name: 'Stormwood bow', examine: 'A bow made from storm-struck wood. Ranged attacks have a chance to shock.', value: 30000, category: 'weapon', equipSlot: 'weapon', speed: 4, stats: { ranged: 55, ranged_strength: 5 }, equipReqs: { ranged: 45, woodcutting: 50 } });
items.define({ id: 13103, name: 'Lightning-split kindling', examine: 'Kindling from a tree split by lightning. Burns incredibly hot.', value: 50, category: 'firemaking', stackable: true, weight: 0 });

// ══════════════════════════════════════════════════════════════════════════════
// MINING — Blast Mining in the Sootworks (Active)
//
// Knobs: XP/hr HIGH (60k), Prereqs HIGH (Mining 45 + Sootworks Rising quest),
//        Resource HIGH (mixed ores, some rare), Inventory MEDIUM (ores not stackable),
//        Cost MEDIUM (blast powder consumed), Danger MEDIUM (can take damage from
//        misplaced charges), Complexity HIGH (place dynamite, time the blast, collect
//        before it collapses), Attention ACTIVE (70-90%)
//
// Compare to: AFK iron at 35k. This is 1.7x but costs blast powder and can hurt you.
// Trade-off: cost + danger + attention for speed + mixed ore output.
// ══════════════════════════════════════════════════════════════════════════════

items.define({ id: 13201, name: 'Blast ore', examine: 'Mixed ore from a blast mining explosion. Smelt at a furnace to see what you get.', value: 100, category: 'mining', weight: 2 });
items.define({ id: 13202, name: 'Volcanic ash', examine: 'Ash from the deep Sootworks. Used in high-level farming.', value: 80, category: 'farming', stackable: true, weight: 0 });
items.define({ id: 13203, name: 'Blast mining helmet', examine: 'A reinforced helmet. Reduces blast damage by 50%. Part of the blast mining set.', value: 15000, category: 'armour', equipSlot: 'head', stats: { def_crush: 10 }, equipReqs: { mining: 45 } });

// ══════════════════════════════════════════════════════════════════════════════
// COOKING — Feast Preparation (Active group cooking)
//
// Knobs: XP/hr VERY HIGH (250k), Prereqs MEDIUM (Cooking 60),
//        Resource HIGH (produces feast platters that heal 30 HP in raids),
//        Cost HIGH (expensive ingredients), Danger NONE,
//        Complexity HIGH (multi-step: prepare, season, time the oven, plate),
//        Attention ACTIVE (70%)
//
// Compare to: AFK shark cooking at 210k. This is higher XP AND produces raid food,
// but the cost knob is turned way up (expensive ingredients) and it requires active play.
// ══════════════════════════════════════════════════════════════════════════════

items.define({ id: 13301, name: 'Feast platter', examine: 'A carefully prepared feast. Heals 30 HP in a single bite. Only usable in raids.', value: 2000, category: 'food', weight: 1 });
items.define({ id: 13302, name: 'Seasoning mix', examine: 'A blend of herbs and spices for feast preparation.', value: 50, category: 'cooking', weight: 0.1 });
items.define({ id: 13303, name: 'Raw feast ingredients', examine: 'Shark, lobster, and herbs bundled for feast cooking.', value: 800, category: 'cooking', weight: 2 });

// ══════════════════════════════════════════════════════════════════════════════
// MINING — Volcanic Core Mining (Max Focus endgame)
//
// Knobs: XP/hr EXTREME (80k), Prereqs VERY HIGH (Mining 75 + Forge Beneath quest),
//        Resource HIGH (volcanic cores for BIS pickaxe), Inventory LOW (cores stackable),
//        Cost NONE, Danger EXTREME (lava flows, cave-ins, heat damage every 10 ticks),
//        Complexity MAX (navigate shifting lava, mine windows of 3-5 ticks between flows),
//        Attention MAX (100%)
//
// Compare to: AFK mithril at 40k. This is 2x but actively trying to kill you.
// Trade-off: maximum danger + maximum focus for maximum XP + unique rewards.
// ══════════════════════════════════════════════════════════════════════════════

items.define({ id: 13401, name: 'Volcanic core', examine: 'A fragment of solidified magma. Used to forge the infernal pickaxe.', value: 5000, category: 'mining', stackable: true, weight: 0.5 });
items.define({ id: 13402, name: 'Infernal pickaxe', examine: 'A pickaxe forged in volcanic fire. Has a chance to auto-smelt ores.', value: 100000, category: 'weapon', equipSlot: 'weapon', speed: 5, stats: { stab: 4, melee_strength: 3 }, equipReqs: { attack: 1, mining: 75 } });

// ══════════════════���═══════════════════════════════════════════════════════════
// QUEST — Unlocks for active methods
// ══════════════════════════════════════════════════════════════════════════════

quests.define('the_trawlers_call', {
  name: "The Trawler's Call",
  description: 'Captain Reed needs a crew for the most dangerous fishing grounds off Saltbrine. Prove yourself worthy.',
  difficulty: 'Intermediate',
  questPoints: 2,
  requirements: { skills: { fishing: 35, agility: 20, crafting: 15 }, quests: ['pirate_king'] },
  steps: [
    { text: 'Talk to Captain Reed at Saltbrine harbour.' },
    { text: 'Repair the trawler hull (Crafting 15).' },
    { text: 'Navigate the obstacle course on the ship mast (Agility 20).' },
    { text: 'Complete a trial fishing run and catch 10 fish without the net breaking.' },
    { text: 'Return to Captain Reed.' },
  ],
  rewards: {
    xp: { fishing: 2000, crafting: 500, agility: 500 },
    items: [{ id: 13001, name: 'Trawler net', count: 1 }],
    questPoints: 2,
    unlocks: ["item_unlock:the_trawlers_call_completion"],
  },
});

quests.define('stormwood_rite', {
  name: 'Stormwood Rite',
  description: 'The elves speak of trees that grow stronger when struck by lightning. Learn the rite to harvest them — if you survive the storm.',
  difficulty: 'Experienced',
  questPoints: 2,
  requirements: { skills: { woodcutting: 50, prayer: 25, agility: 30 }, quests: ['the_veilwood_covenant'] },
  steps: [
    { text: 'Talk to Ranger Lyris about the storm trees.' },
    { text: 'Travel to the sacred grove during a storm event.' },
    { text: 'Survive 3 lightning strikes by dodging (Agility 30).' },
    { text: 'Pray at the storm altar to receive the Stormwood blessing (Prayer 25).' },
    { text: 'Chop a storm tree during the next lightning strike.' },
    { text: 'Return to Lyris with the Stormwood log.' },
  ],
  rewards: {
    xp: { woodcutting: 3000, prayer: 1000, agility: 1000 },
    items: [{ id: 13101, name: 'Stormwood log', count: 5 }],
    questPoints: 2,
    unlocks: ["item_unlock:stormwood_rite_completion"],
  },
});

console.log('[aelgard] Active gathering methods loaded');
