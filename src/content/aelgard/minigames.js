// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Minigames
// 6 minigames, each in a different region, each with unique rewards
// Every minigame fills a different attention tier and content niche
//
// Manifesto P04: Each minigame does something no other content does
// Manifesto P02: Spans Background → Max Focus attention
// Manifesto P08: Each minigame's reward is a breakpoint for some progression
// ══════════════════════════════════════════════════════════════════════════════

const items = require('../../data/items');
const npcs = require('../../world/npcs');
let rel = null;
try { rel = require('../../data/relationships'); } catch (e) { rel = null; }

const minigames = new Map();

function defineMinigame(opts) {
  minigames.set(opts.id, {
    id: opts.id, name: opts.name,
    region: opts.region, location: opts.location,
    type: opts.type, // 'combat', 'skilling', 'pvp', 'mixed'
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
  // Mirror into the global relationship registry so downstream tools see
  // all minigames (base + mega) in one place.
  if (rel && typeof rel.defineMinigame === 'function') {
    rel.defineMinigame({
      id: opts.id, name: opts.name,
      region: opts.region, location: opts.location,
      template: opts.template || null,
      type: opts.type,
      minPlayers: opts.minPlayers || 1,
      maxPlayers: opts.maxPlayers || 1,
      isPvP: opts.type === 'pvp',
      combatType: opts.type === 'pvp' ? 'PvP' : 'PvE',
      attention: opts.attention,
      levelReqs: opts.levelReqs || {},
      questReqs: opts.questReqs || [],
      skills_trained: opts.skills_trained || [],
      rewards: opts.rewards || [],
      unique_reward: opts.unique_reward || null,
      reward_currency: opts.pointCurrency || null,
      shop: opts.shop || [],
      stages: opts.stages || null,
      rooms: opts.rooms || null,
      description: opts.description || '',
      voice_flavor: opts.voice_flavor || '',
      duration_estimate_min: opts.duration_estimate_min || null,
      xpRewards: opts.xpRewards || {},
    });
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// 1. PEST CONTROL — Heartlands — group combat, void knight armour
// Attention: Active | Players: 5-25 | Unique: Only source of Void Knight gear
// ══════════════════════════════════════════════════════════════════════════════

defineMinigame({
  id: 'pest_control', name: 'Pest Control', region: 'Heartlands',
  location: 'Pest Control Island (boat from Heartlands harbour)',
  type: 'combat', minPlayers: 5, maxPlayers: 25, attention: 'Active',
  levelReqs: { attack: 40 },
  description: 'Defend the Void Knight from waves of pests. Destroy 4 portals before they overwhelm the island. Team-based combat.',
  pointCurrency: 'pest_control_points',
  rewards: ['Void knight equipment (BIS accuracy for all combat styles)', 'Combat XP rewards'],
});

items.define({ id: 30001, name: 'Void knight top', examine: 'Void Knight armour. Full set gives 10% accuracy to chosen style.', value: 0, category: 'armour', equipSlot: 'body', stats: { def_stab: 45, def_slash: 45, def_crush: 45, def_magic: 45, def_ranged: 45 }, equipReqs: { attack: 42, magic: 42, ranged: 42, defence: 42, hitpoints: 42, prayer: 22 }, tradeable: false });
items.define({ id: 30002, name: 'Void knight robe', examine: 'Void Knight leg armour.', value: 0, category: 'armour', equipSlot: 'legs', stats: { def_stab: 30, def_slash: 30, def_crush: 30, def_magic: 30, def_ranged: 30 }, equipReqs: { attack: 42, magic: 42, ranged: 42, defence: 42, hitpoints: 42, prayer: 22 }, tradeable: false });
items.define({ id: 30003, name: 'Void knight gloves', examine: 'Void Knight gloves.', value: 0, category: 'armour', equipSlot: 'hands', stats: {}, equipReqs: { attack: 42, magic: 42, ranged: 42, defence: 42, hitpoints: 42, prayer: 22 }, tradeable: false });
items.define({ id: 30004, name: 'Void melee helm', examine: 'Melee variant. +10% melee accuracy and damage with full set.', value: 0, category: 'armour', equipSlot: 'head', stats: {}, equipReqs: { attack: 42, magic: 42, ranged: 42, defence: 42, hitpoints: 42, prayer: 22 }, tradeable: false });
items.define({ id: 30005, name: 'Void ranger helm', examine: 'Ranged variant. +10% ranged accuracy and damage with full set.', value: 0, category: 'armour', equipSlot: 'head', stats: {}, equipReqs: { attack: 42, magic: 42, ranged: 42, defence: 42, hitpoints: 42, prayer: 22 }, tradeable: false });
items.define({ id: 30006, name: 'Void mage helm', examine: 'Magic variant. +45% magic accuracy with full set.', value: 0, category: 'armour', equipSlot: 'head', stats: {}, equipReqs: { attack: 42, magic: 42, ranged: 42, defence: 42, hitpoints: 42, prayer: 22 }, tradeable: false });

// ══════════════════════════════════════════════════════════════════════════════
// 2. SOOTWORKS FORGE (Blast Furnace) — skilling, fast smithing XP + profit
// Attention: Multitask | Players: 1-50 | Unique: Half-coal smelting
// ══════════════════════════════════════════════════════════════════════════════

defineMinigame({
  id: 'sootworks_forge', name: 'Sootworks Blast Forge', region: 'Sootworks',
  location: 'Sootworks Forge Hall',
  type: 'skilling', minPlayers: 1, maxPlayers: 50, attention: 'Multitask',
  levelReqs: { smithing: 30 },
  description: 'Use the dwarven blast furnace to smelt bars using half the normal coal. The most efficient smithing method in Aelgard.',
  xpRewards: { smithing: 'varies' },
  rewards: ['Half-coal smelting (steel = 1 coal instead of 2, mithril = 2 instead of 4)'],
});

// ══════════════════════════════════════════════════════════════════════════════
// 3. WINTERTODT EQUIVALENT — Veilwood — group firemaking boss
// Attention: Active | Players: 1-50 | Unique: Warm clothing, pyromancer outfit
// ══════════════════════════════════════════════════════════════════════════════

defineMinigame({
  id: 'spirit_pyre', name: 'Spirit Pyre', region: 'Veilwood',
  location: 'Sacred Grove (Veilwood)',
  type: 'mixed', minPlayers: 1, maxPlayers: 50, attention: 'Active',
  levelReqs: { firemaking: 50 },
  description: 'Feed the Spirit Pyre to keep the forest alive during the Long Dark. Chop roots, feed the fire, heal the pyromancers. A group firemaking boss.',
  pointCurrency: 'pyre_points',
  xpRewards: { firemaking: 'high', woodcutting: 'moderate', herblore: 'low', construction: 'low' },
  rewards: ['Pyromancer outfit (+2.5% firemaking XP)', 'Bruma torch (light source + FM bonus)', 'Warm gloves', 'Phoenix pet (1/5000)'],
});

items.define({ id: 30101, name: 'Pyromancer hat', examine: 'Part of the pyromancer outfit. Full set: +2.5% FM XP.', value: 5000, category: 'armour', equipSlot: 'head', stats: {}, equipReqs: { firemaking: 50 }, tradeable: false });
items.define({ id: 30102, name: 'Pyromancer top', examine: 'Pyromancer top.', value: 8000, category: 'armour', equipSlot: 'body', stats: {}, equipReqs: { firemaking: 50 }, tradeable: false });
items.define({ id: 30103, name: 'Pyromancer legs', examine: 'Pyromancer legs.', value: 6000, category: 'armour', equipSlot: 'legs', stats: {}, equipReqs: { firemaking: 50 }, tradeable: false });
items.define({ id: 30104, name: 'Pyromancer boots', examine: 'Pyromancer boots.', value: 4000, category: 'armour', equipSlot: 'feet', stats: {}, equipReqs: { firemaking: 50 }, tradeable: false });
items.define({ id: 30105, name: 'Bruma torch', examine: 'A perpetual flame. Light source and +2% FM XP.', value: 10000, category: 'tool', equipSlot: 'shield', stats: {}, equipReqs: { firemaking: 50 }, tradeable: false });

// ══════════════════════════════════════════════════════════════════════════════
// 4. CASTLE WARS — The Wilds — PvP capture the flag
// Attention: Max Focus | Players: 10-100 | Unique: Decorative armour (cosmetic)
// ══════════════════════════════════════════════════════════════════════════════

defineMinigame({
  id: 'castle_wars', name: 'Castle Wars', region: 'Wilds',
  location: 'Castle Wars arena (south Wilds)',
  type: 'pvp', minPlayers: 10, maxPlayers: 100, attention: 'Max Focus',
  levelReqs: {},
  description: 'Two teams fight to capture the opposing flag while defending their own. 20-minute rounds. The classic PvP minigame.',
  pointCurrency: 'castle_wars_tickets',
  rewards: ['Decorative armour (gold/white/dark cosmetic sets)', 'Halo headpiece'],
});

items.define({ id: 30201, name: 'Decorative armour (gold, body)', examine: 'Cosmetic gold armour from Castle Wars.', value: 0, category: 'armour', equipSlot: 'body', stats: { def_stab: 60, def_slash: 58, def_crush: 52 }, equipReqs: { defence: 40 }, tradeable: false });
items.define({ id: 30202, name: 'Castle wars halo', examine: 'A holy halo. +3 to all combat styles.', value: 0, category: 'armour', equipSlot: 'head', stats: { stab: 3, slash: 3, crush: 3, magic: 3, ranged: 3, prayer: 1 }, equipReqs: {}, tradeable: false });

// ══════════════════════════════════════════════════════════════════════════════
// 5. GUARDIANS OF THE RIFT — Inkweald — runecrafting minigame
// Attention: Active | Players: 1-50 | Unique: Raiments of the Eye outfit
// ══════════════════════════════════════════════════════════════════════════════

defineMinigame({
  id: 'guardians_rift', name: 'Guardians of the Rift', region: 'Inkweald',
  location: 'Dream Rift (Inkweald boundary)',
  type: 'skilling', minPlayers: 1, maxPlayers: 50, attention: 'Active',
  levelReqs: { runecrafting: 27 },
  description: 'Defend the Great Guardian from Abyssal creatures by crafting runes and powering barriers. The most engaging runecrafting training.',
  pointCurrency: 'abyssal_pearls',
  xpRewards: { runecrafting: 'high', mining: 'low', crafting: 'low' },
  rewards: ['Raiments of the Eye (60% more runes when crafting)', 'Abyssal lantern', 'Needle (rift guardian pet 1/5000)'],
});

items.define({ id: 30301, name: 'Hat of the eye', examine: 'Part of the Raiments. Full set: 60% more runes per essence.', value: 0, category: 'armour', equipSlot: 'head', stats: {}, equipReqs: { runecrafting: 27 }, tradeable: false });
items.define({ id: 30302, name: 'Robe top of the eye', examine: 'Part of the Raiments.', value: 0, category: 'armour', equipSlot: 'body', stats: {}, equipReqs: { runecrafting: 27 }, tradeable: false });
items.define({ id: 30303, name: 'Robe bottom of the eye', examine: 'Part of the Raiments.', value: 0, category: 'armour', equipSlot: 'legs', stats: {}, equipReqs: { runecrafting: 27 }, tradeable: false });
items.define({ id: 30304, name: 'Boots of the eye', examine: 'Part of the Raiments.', value: 0, category: 'armour', equipSlot: 'feet', stats: {}, equipReqs: { runecrafting: 27 }, tradeable: false });

// ══════════════════════════════════════════════════════════════════════════════
// 6. BARBARIAN ASSAULT — Saltbrine — team roles, no combat XP
// Attention: Max Focus | Players: 5 | Unique: Fighter torso (BIS strength body)
// ══════════════════════════════════════════════════════════════════════════════

defineMinigame({
  id: 'barbarian_assault', name: 'Barbarian Assault', region: 'Saltbrine',
  location: 'Saltbrine Outpost (north coast)',
  type: 'combat', minPlayers: 5, maxPlayers: 5, attention: 'Max Focus',
  levelReqs: { attack: 40 },
  description: 'Five players take five different roles (Attacker, Defender, Collector, Healer, Leader) to fight 10 waves of barbarians. Teamwork required.',
  pointCurrency: 'honour_points',
  rewards: ['Fighter torso (BIS melee body for strength bonus)', 'Penance Queen kill (pet chance)', 'Role-specific upgrades'],
});

items.define({ id: 30401, name: 'Fighter torso', examine: 'A torso that grants +4 melee strength. BIS for strength bonus.', value: 0, category: 'armour', equipSlot: 'body', stats: { def_stab: 65, def_slash: 60, def_crush: 55, melee_strength: 4 }, equipReqs: { defence: 40 }, tradeable: false });
items.define({ id: 30402, name: 'Penance skirt', examine: 'Skirt from Barbarian Assault. Prayer bonus.', value: 0, category: 'armour', equipSlot: 'legs', stats: { def_stab: 35, def_slash: 30, def_crush: 28, prayer: 3 }, equipReqs: { defence: 40 }, tradeable: false });

// ══════════════════════════════════════════════════════════════════════════════
// NPC ENTRIES for minigames
// ══════════════════════════════════════════════════════════════════════════════

npcs.defineNpc('void_knight_captain', { name: 'Void Knight Captain', combat: 0, maxHp: 1, aggressive: false, wanderRadius: 0, canMove: false, examine: 'Runs the Pest Control operation.', dialogue: { type: 'minigame', minigameId: 'pest_control' } });
npcs.defineNpc('pyromancer_leader', { name: 'Pyromancer Ignissa', combat: 0, maxHp: 1, aggressive: false, wanderRadius: 0, canMove: false, examine: 'Leader of the Spirit Pyre keepers.', dialogue: { type: 'minigame', minigameId: 'spirit_pyre' } });
npcs.defineNpc('rift_guardian_npc', { name: 'Great Guardian', combat: 0, maxHp: 1, aggressive: false, wanderRadius: 0, canMove: false, examine: 'A massive guardian of the Rift. Needs your help.', dialogue: { type: 'minigame', minigameId: 'guardians_rift' } });
npcs.defineNpc('ba_commander', { name: 'Commander Kira', combat: 0, maxHp: 1, aggressive: false, wanderRadius: 0, canMove: false, examine: 'Coordinates Barbarian Assault operations.', dialogue: { type: 'minigame', minigameId: 'barbarian_assault' } });

console.log(`[aelgard] ${minigames.size} minigames defined`);

module.exports = { defineMinigame, minigames };
