// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Combat Challenges Expansion
//
// More Infernos, Colosseums, Duo Bosses, Wave Challenges.
// These are the hardest solo/duo content in the game. Each one is
// hundreds of hours to complete, thousands to master.
//
// Manifesto P02: MAX FOCUS content. Every tick matters.
// Manifesto P08: Each completion is a life-changing breakpoint (BIS cape, weapon)
// Manifesto P13: Highest danger, complexity, attention. Compensates with BIS rewards.
// ══════════════════════════════════════════════════════════════════════════════

const items = require('../../data/items');
const npcs = require('../../world/npcs');
const droptables = require('../../data/droptables');

// ══════════════════════════════════════════════════════════════════════════════
// WAVE CHALLENGES — Inferno/Colosseum style
// ══════════════════════════════════════════════════════════════════════════════

const waveChallenges = [];

function defineWaveChallenge(opts) {
  waveChallenges.push(opts);
  // Define the reward items
  if (opts.rewardItems) {
    for (const item of opts.rewardItems) {
      items.define(item);
    }
  }
  // Define wave monsters
  if (opts.monsters) {
    for (const m of opts.monsters) {
      npcs.defineNpc(m.defId, m);
    }
  }
}

// ── 1. The Inferno (already exists — documenting here) ────────────────────
// 69 waves. BIS melee cape. The hardest solo challenge.

// ── 2. Fight Caves (already exists — documenting here) ────────────────────
// 63 waves. Fire cape. Mid-game challenge.

// ── 3. The Colosseum (already referenced — fully defining here) ───────────
defineWaveChallenge({
  id: 'colosseum', name: 'The Colosseum of Aelgard',
  region: 'Glass Desert', type: 'solo_waves',
  waves: 12, description: 'A gladiator arena with 12 waves. After each wave, choose a modifier that makes the next wave harder. Higher modifiers = better rewards.',
  mechanic: 'Invocation-style modifiers chosen between waves. Each modifier adds to your "glory" score. Higher glory = better unique chance.',
  modifiers: [
    'Berserk: monsters deal 20% more damage',
    'Swift: monsters attack 1 tick faster',
    'Doom: if you eat, you take 5 damage',
    'Myopia: prayer drain doubled',
    'Blasphemy: protection prayers only reduce 50% damage',
    'Relentless: monsters do not flinch',
    'Solarflare: the arena damages you every 10 ticks',
    'Frailty: your max HP is reduced by 20%',
    'Drought: no potion drops between waves',
    'Hunted: a spectral hunter chases you throughout',
  ],
  monsters: [
    { defId: 'colo_jaguar', name: 'Jaguar warrior', combat: 100, maxHp: 80, maxHit: 12, stats: { attack: 65, strength: 60, defence: 50 }, attackSpeed: 3, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 6, wanderRadius: 3, respawnTicks: 0, examine: 'A fast arena fighter.', weakness: 'stab', tags: ['human'] },
    { defId: 'colo_shaman', name: 'Arena shaman', combat: 120, maxHp: 90, maxHit: 15, stats: { attack: 75, strength: 60, defence: 55 }, attackSpeed: 4, attackRange: 6, attackStyle: 'magic', aggressive: true, aggroRange: 8, wanderRadius: 2, respawnTicks: 0, examine: 'Casts powerful arena spells.', weakness: 'ranged', tags: ['human'], resistance: 'magic' },
    { defId: 'colo_minotaur', name: 'Arena minotaur', combat: 180, maxHp: 200, maxHit: 25, stats: { attack: 120, strength: 130, defence: 100 }, attackSpeed: 5, attackRange: 1, attackStyle: 'melee', size: 2, aggressive: true, aggroRange: 6, wanderRadius: 0, respawnTicks: 0, examine: 'The penultimate arena challenger.', weakness: 'magic', tags: ['beast'], resistance: 'ranged' },
    { defId: 'sol_heredit_boss', name: 'Sol Heredit', combat: 420, maxHp: 600, maxHit: 35, stats: { attack: 250, strength: 240, defence: 230 }, attackSpeed: 4, attackRange: 3, attackStyle: 'melee', size: 3, aggressive: true, aggroRange: 8, wanderRadius: 0, respawnTicks: 0, examine: 'The undefeated champion of the Colosseum.', weakness: 'slash', tags: ['boss', 'human'] },
  ],
  rewardItems: [
    { id: 97001, name: "Dizana's quiver", examine: 'BIS ranged cape. Boosts bolt special proc chance by 10%.', value: 0, category: 'armour', equipSlot: 'cape', stats: { ranged: 7, ranged_strength: 3, prayer: 2, def_stab: 10, def_slash: 10, def_crush: 10, def_magic: 10, def_ranged: 10 }, equipReqs: {}, tradeable: false },
    { id: 97002, name: 'Sunfire fanatic helm', examine: 'Part of the sunfire fanatic set. Melee + prayer hybrid.', value: 0, category: 'armour', equipSlot: 'head', stats: { prayer: 6, melee_strength: 3, def_stab: 30, def_slash: 32, def_crush: 28, def_ranged: 26 }, equipReqs: { defence: 65, prayer: 50 }, tradeable: false },
    { id: 97003, name: 'Sunfire fanatic body', examine: 'Part of the sunfire fanatic set.', value: 0, category: 'armour', equipSlot: 'body', stats: { prayer: 8, melee_strength: 4, def_stab: 80, def_slash: 85, def_crush: 75, def_ranged: 70 }, equipReqs: { defence: 65, prayer: 50 }, tradeable: false },
    { id: 97004, name: 'Sunfire fanatic legs', examine: 'Part of the sunfire fanatic set.', value: 0, category: 'armour', equipSlot: 'legs', stats: { prayer: 6, melee_strength: 2, def_stab: 55, def_slash: 52, def_crush: 48, def_ranged: 45 }, equipReqs: { defence: 65, prayer: 50 }, tradeable: false },
  ],
  pet: { id: 97010, name: 'Smol heredit', examine: 'A tiny Colosseum champion.' },
});
items.define({ id: 97010, name: 'Smol heredit', examine: 'A tiny Colosseum champion. Still flexes.', value: 0, category: 'pet', tradeable: false });

// ── 4. The Moryskah Inferno — 50-wave undead gauntlet ────────────────────
defineWaveChallenge({
  id: 'moryskah_inferno', name: 'The Crypt Inferno',
  region: 'Moryskah', type: 'solo_waves',
  waves: 50, description: 'A 50-wave undead gauntlet beneath the Moryskah catacombs. All monsters are undead. Silver weapons get bonus damage. Final boss: The Crypt Lord.',
  mechanic: 'Every 10 waves, a prayer-draining mechanic activates. Wave 50 boss requires prayer switching between 3 overheads simultaneously (boss + 2 adds).',
  monsters: [
    { defId: 'crypt_skeleton', name: 'Crypt skeleton', combat: 30, maxHp: 25, maxHit: 4, stats: { attack: 18, strength: 16, defence: 12 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 5, wanderRadius: 2, respawnTicks: 0, examine: 'A skeleton from the crypts.', weakness: 'crush', tags: ['undead'] },
    { defId: 'crypt_ghost', name: 'Crypt ghost', combat: 50, maxHp: 35, maxHit: 6, stats: { attack: 30, strength: 22, defence: 20 }, attackSpeed: 4, attackRange: 5, attackStyle: 'magic', aggressive: true, aggroRange: 6, wanderRadius: 3, respawnTicks: 0, examine: 'A ghost that drains prayer.', weakness: 'magic', tags: ['undead', 'spirit'], resistance: 'melee' },
    { defId: 'crypt_vampyre', name: 'Crypt vampyre', combat: 80, maxHp: 70, maxHit: 10, stats: { attack: 50, strength: 48, defence: 40 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 5, wanderRadius: 3, respawnTicks: 0, examine: 'A vampyre from the deep crypt.', weakness: 'slash', tags: ['undead', 'vampyre'] },
    { defId: 'crypt_lord', name: 'The Crypt Lord', combat: 380, maxHp: 500, maxHit: 30, stats: { attack: 220, strength: 200, defence: 200 }, attackSpeed: 4, attackRange: 5, attackStyle: 'magic', size: 3, aggressive: true, aggroRange: 8, wanderRadius: 0, respawnTicks: 0, examine: 'Lord of the Moryskah crypts. The final test.', weakness: 'slash', tags: ['undead', 'boss', 'vampyre'] },
  ],
  rewardItems: [
    { id: 97101, name: 'Crypt cape', examine: 'BIS melee cape for undead content. +15% damage to undead.', value: 0, category: 'armour', equipSlot: 'cape', stats: { melee_strength: 6, prayer: 4, def_stab: 11, def_slash: 11, def_crush: 11, def_magic: 11, def_ranged: 11 }, equipReqs: {}, tradeable: false },
    { id: 97102, name: "Crypt Lord's sword", examine: 'A sword forged from bones and blood. BIS vs undead.', value: 0, category: 'weapon', equipSlot: 'weapon', speed: 4, stats: { slash: 85, melee_strength: 85, prayer: 4 }, equipReqs: { attack: 75 }, tradeable: false },
  ],
  pet: { id: 97110, name: 'Lil crypt lord', examine: 'A tiny undead lord.' },
});
items.define({ id: 97110, name: 'Lil crypt lord', examine: 'A tiny Crypt Lord. Still drains prayer.', value: 0, category: 'pet', tradeable: false });

// ── 5. The Sootworks Crucible Trials — 30-wave forge challenge ────────────
defineWaveChallenge({
  id: 'crucible_trials', name: 'The Crucible Trials',
  region: 'Sootworks', type: 'solo_waves',
  waves: 30, description: 'A 30-wave challenge in the Sootworks Crucible. Constructs and golems. Must manage heat — environment gets hotter each wave. At wave 30: The Molten Titan.',
  mechanic: 'Heat meter rises 3% per wave. At 100% heat, you take 10 damage per tick. Must use cooling stations between waves (limited uses). Strategy: rush fast or die to heat.',
  monsters: [
    { defId: 'crucible_construct', name: 'Crucible construct', combat: 45, maxHp: 50, maxHit: 6, stats: { attack: 28, strength: 25, defence: 30 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 4, wanderRadius: 2, respawnTicks: 0, examine: 'A construct forged in the crucible.', weakness: 'magic', tags: ['construct', 'armoured'], resistance: 'ranged' },
    { defId: 'crucible_elemental', name: 'Crucible elemental', combat: 70, maxHp: 65, maxHit: 9, stats: { attack: 42, strength: 45, defence: 35 }, attackSpeed: 4, attackRange: 3, attackStyle: 'magic', aggressive: true, aggroRange: 5, wanderRadius: 3, respawnTicks: 0, examine: 'A fire elemental from the forge.', weakness: 'ranged', tags: ['elemental'], resistance: 'melee' },
    { defId: 'molten_titan', name: 'The Molten Titan', combat: 350, maxHp: 450, maxHit: 28, stats: { attack: 200, strength: 210, defence: 180 }, attackSpeed: 5, attackRange: 3, attackStyle: 'melee', size: 4, aggressive: true, aggroRange: 8, wanderRadius: 0, respawnTicks: 0, examine: 'A titan of molten metal. The Crucible\'s guardian.', weakness: 'magic', tags: ['elemental', 'construct', 'boss'], resistance: 'melee' },
  ],
  rewardItems: [
    { id: 97201, name: 'Magma cape', examine: 'BIS cape for crush attacks. Immune to fire.', value: 0, category: 'armour', equipSlot: 'cape', stats: { crush: 2, melee_strength: 5, prayer: 1, def_stab: 10, def_slash: 10, def_crush: 10, def_magic: 10, def_ranged: 10 }, equipReqs: {}, tradeable: false },
    { id: 97202, name: 'Titan\'s maul', examine: 'A massive hammer forged from the Titan\'s core. Slow but devastating.', value: 0, category: 'weapon', equipSlot: 'weapon', speed: 7, stats: { crush: 130, melee_strength: 140 }, equipReqs: { attack: 75, strength: 75 }, tradeable: false },
  ],
  pet: { id: 97210, name: 'Magma golem pet', examine: 'A tiny Molten Titan.' },
});
items.define({ id: 97210, name: 'Magma golem pet', examine: 'A tiny Molten Titan. Very warm.', value: 0, category: 'pet', tradeable: false });

// ── 6. Saltbrine Sea Gauntlet — 40-wave underwater challenge ──────────────
defineWaveChallenge({
  id: 'sea_gauntlet', name: 'The Sea Gauntlet',
  region: 'Saltbrine', type: 'solo_waves',
  waves: 40, description: 'An underwater combat gauntlet. Must manage oxygen alongside combat. Waves of sea creatures, final boss: The Abyssal Leviathan.',
  mechanic: 'Oxygen bar — depletes constantly. Must reach air pockets between waves. Running out = rapid damage. Higher waves have fewer air pockets.',
  monsters: [
    { defId: 'gauntlet_crab', name: 'Armoured crab', combat: 35, maxHp: 40, maxHit: 5, stats: { attack: 20, strength: 18, defence: 30 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 3, wanderRadius: 2, respawnTicks: 0, examine: 'A heavily armoured crab.', weakness: 'crush', tags: ['beast', 'armoured'] },
    { defId: 'gauntlet_siren', name: 'Deep siren', combat: 70, maxHp: 55, maxHit: 9, stats: { attack: 42, strength: 30, defence: 28 }, attackSpeed: 4, attackRange: 6, attackStyle: 'magic', aggressive: true, aggroRange: 7, wanderRadius: 3, respawnTicks: 0, examine: 'Sings a deadly song.', weakness: 'ranged', tags: ['spirit'], resistance: 'melee' },
    { defId: 'gauntlet_shark', name: 'Frenzied shark', combat: 90, maxHp: 85, maxHit: 12, stats: { attack: 55, strength: 60, defence: 35 }, attackSpeed: 3, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 6, wanderRadius: 5, respawnTicks: 0, examine: 'A maddened shark.', weakness: 'stab', tags: ['beast'] },
    { defId: 'abyssal_leviathan', name: 'The Abyssal Leviathan', combat: 400, maxHp: 550, maxHit: 32, stats: { attack: 230, strength: 220, defence: 210 }, attackSpeed: 4, attackRange: 6, attackStyle: 'magic', size: 5, aggressive: true, aggroRange: 10, wanderRadius: 0, respawnTicks: 0, examine: 'A creature from the deepest abyss. Massive.', weakness: 'stab', tags: ['beast', 'boss'], resistance: 'magic' },
  ],
  rewardItems: [
    { id: 97301, name: 'Abyssal cape', examine: 'BIS ranged cape for underwater/sea content. +10% damage to sea creatures.', value: 0, category: 'armour', equipSlot: 'cape', stats: { ranged: 5, ranged_strength: 2, prayer: 2, def_stab: 10, def_slash: 10, def_crush: 10, def_magic: 10, def_ranged: 10 }, equipReqs: {}, tradeable: false },
    { id: 97302, name: 'Leviathan\'s trident', examine: 'A trident torn from the Leviathan. BIS magic DPS underwater.', value: 0, category: 'weapon', equipSlot: 'weapon', speed: 4, stats: { magic: 28, magic_strength: 22, stab: 20 }, equipReqs: { magic: 80, attack: 70 }, tradeable: false },
  ],
  pet: { id: 97310, name: 'Lil leviathan', examine: 'A baby Abyssal Leviathan.' },
});
items.define({ id: 97310, name: 'Lil leviathan', examine: 'A baby Abyssal Leviathan. Surprisingly gentle.', value: 0, category: 'pet', tradeable: false });

// ── 7. Inkweald Dream Arena — infinite scaling challenge ──────────────────
defineWaveChallenge({
  id: 'dream_arena', name: 'The Dream Arena',
  region: 'Inkweald', type: 'infinite_waves',
  waves: 'Infinite (scaling)', description: 'An infinite wave challenge that scales with each wave. Leaderboard-based. How far can you go? Every 10 waves gives a checkpoint reward. World record holders get a cosmetic.',
  mechanic: 'Enemies scale +5% stats per wave. No limit. Wave 100 = 5x stats. Leaderboard tracks highest wave reached. Top 10 get golden versions of dream items.',
  monsters: [
    { defId: 'dream_fighter', name: 'Dream fighter', combat: 50, maxHp: 40, maxHit: 6, stats: { attack: 30, strength: 28, defence: 22 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 4, wanderRadius: 2, respawnTicks: 0, examine: 'A fighter from the dream. Stats scale with wave.', weakness: 'magic', tags: ['spirit'] },
    { defId: 'dream_mage', name: 'Dream mage', combat: 60, maxHp: 35, maxHit: 8, stats: { attack: 35, strength: 20, defence: 25 }, attackSpeed: 5, attackRange: 6, attackStyle: 'magic', aggressive: true, aggroRange: 6, wanderRadius: 2, respawnTicks: 0, examine: 'A mage from the dream.', weakness: 'ranged', tags: ['spirit'] },
    { defId: 'dream_ranger', name: 'Dream ranger', combat: 55, maxHp: 38, maxHit: 7, stats: { attack: 32, strength: 25, defence: 20 }, attackSpeed: 4, attackRange: 6, attackStyle: 'ranged', aggressive: true, aggroRange: 6, wanderRadius: 2, respawnTicks: 0, examine: 'A ranger from the dream.', weakness: 'melee', tags: ['spirit'] },
  ],
  rewardItems: [
    { id: 97401, name: 'Dream cape', examine: 'Awarded for reaching wave 50 in the Dream Arena. Changes colour with each 10-wave milestone.', value: 0, category: 'armour', equipSlot: 'cape', stats: { stab: 2, slash: 2, crush: 2, ranged: 2, magic: 2, prayer: 3, def_stab: 12, def_slash: 12, def_crush: 12, def_magic: 12, def_ranged: 12 }, equipReqs: {}, tradeable: false },
  ],
});

// ══════════════════════════════════════════════════════════════════════════════
// DUO BOSSES — designed specifically for 2 players
// ══════════════════════════════════════════════════════════════════════════════

const duoBosses = [];

function defineDuoBoss(opts) {
  duoBosses.push(opts);
  npcs.defineNpc(opts.defId, opts.npc);
  if (opts.drops) droptables.define(opts.defId, opts.drops);
  if (opts.pet) items.define(opts.pet);
  for (const item of (opts.rewardItems || [])) items.define(item);
}

// ── 1. The Twin Wyrms — Glass Desert ──────────────────────────────────────
defineDuoBoss({
  id: 'twin_wyrms', name: 'The Twin Wyrms',
  region: 'Glass Desert', players: '2 (exactly)',
  description: 'Two crystal wyrms that share HP. One attacks with ranged, one with magic. Each player must tank one wyrm. If a wyrm is not being attacked, it heals the other.',
  mechanic: 'Split attention required. Both must be DPSed simultaneously or they heal. Players must communicate prayer switches.',
  defId: 'twin_wyrm_alpha', npc: {
    name: 'Twin Wyrm (Alpha)', combat: 380, maxHp: 400, maxHit: 28,
    stats: { attack: 220, strength: 200, defence: 200 },
    attackSpeed: 4, attackRange: 5, attackStyle: 'magic', size: 3,
    aggressive: true, aggroRange: 8, wanderRadius: 0, respawnTicks: 150,
    examine: 'The alpha of the twin wyrms. Attacks with magic.',
    weakness: 'ranged', tags: ['dragon', 'boss'],
  },
  drops: {
    always: [{ id: 107, name: 'Dragon bones', min: 2, max: 2 }],
    main: [{ id: 101, name: 'Coins', weight: 5, min: 10000, max: 40000 }, { id: 10001, name: 'Crystal shard', weight: 5, min: 20, max: 50 }],
    tertiary: [{ id: 97501, name: 'Twin wyrm fang', chance: 256, min: 1, max: 1 }],
  },
  rewardItems: [
    { id: 97501, name: 'Twin wyrm fang', examine: 'A fang from the twin wyrms. BIS stab+slash hybrid weapon.', value: 5000000, category: 'weapon', equipSlot: 'weapon', speed: 4, stats: { stab: 75, slash: 75, melee_strength: 78 }, equipReqs: { attack: 75 } },
  ],
  pet: { id: 97510, name: 'Twin wyrmling', examine: 'A baby twin wyrm. Has two heads.', value: 0, category: 'pet', tradeable: false },
});

// ── 2. The Brothers Duran — Heartlands ────────────────────────────────────
npcs.defineNpc('twin_wyrm_beta', {
  name: 'Twin Wyrm (Beta)', combat: 380, maxHp: 400, maxHit: 26,
  stats: { attack: 210, strength: 200, defence: 210 },
  attackSpeed: 4, attackRange: 6, attackStyle: 'ranged', size: 3,
  aggressive: true, aggroRange: 8, wanderRadius: 0, respawnTicks: 150,
  examine: 'The beta of the twin wyrms. Attacks with ranged.',
  weakness: 'magic', tags: ['dragon', 'boss'],
});
droptables.define('twin_wyrm_beta', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 380, max: 1140 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });

defineDuoBoss({
  id: 'brothers_duran', name: 'The Brothers Duran',
  region: 'Heartlands', players: '2',
  description: 'The Forgefather had a brother. Now both attack simultaneously. One uses melee, one uses magic. Must split and tank both.',
  mechanic: 'At 50% HP they swap positions and combat styles. Requires gear switches.',
  defId: 'duran_elder', npc: {
    name: 'Elder Duran', combat: 280, maxHp: 350, maxHit: 22,
    stats: { attack: 160, strength: 150, defence: 170 },
    attackSpeed: 4, attackRange: 1, attackStyle: 'melee', size: 2,
    aggressive: true, aggroRange: 6, wanderRadius: 0, respawnTicks: 120,
    examine: 'The elder Duran brother. Master of the hammer.',
    weakness: 'stab', tags: ['boss', 'armoured', 'human'],
  },
  drops: {
    always: [{ id: 106, name: 'Big bones', min: 2, max: 2 }],
    main: [{ id: 101, name: 'Coins', weight: 5, min: 5000, max: 20000 }],
    tertiary: [{ id: 97601, name: "Duran's masterwork hammer", chance: 512, min: 1, max: 1 }],
  },
  rewardItems: [
    { id: 97601, name: "Duran's masterwork hammer", examine: 'The combined work of both Duran brothers. BIS crush weapon with +5 smithing boost.', value: 3000000, category: 'weapon', equipSlot: 'weapon', speed: 5, stats: { crush: 95, melee_strength: 100 }, equipReqs: { attack: 70, strength: 65 } },
  ],
  pet: { id: 97610, name: 'Duran brothers pet', examine: 'Two tiny smiths arguing about technique.', value: 0, category: 'pet', tradeable: false },
});
npcs.defineNpc('duran_younger', {
  name: 'Younger Duran', combat: 260, maxHp: 300, maxHit: 20,
  stats: { attack: 150, strength: 130, defence: 140 },
  attackSpeed: 5, attackRange: 6, attackStyle: 'magic', size: 2,
  aggressive: true, aggroRange: 8, wanderRadius: 0, respawnTicks: 120,
  examine: 'The younger Duran brother. Master of the enchanted forge.',
  weakness: 'ranged', tags: ['boss', 'human'], resistance: 'magic',
});
droptables.define('duran_younger', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 260, max: 780 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });

// ── 3. Pestilence & Famine — Moryskah ────────────────────────────────────
defineDuoBoss({
  id: 'pestilence_famine', name: 'Pestilence & Famine',
  region: 'Moryskah', players: '2',
  description: 'Two horsemen of the apocalypse found in the deep Moryskah swamp. Pestilence poisons, Famine drains food. Both must die within 10 ticks of each other or the survivor resurrects the other.',
  mechanic: 'Synchronized kill required. Pestilence constantly poisons players. Famine destroys food in inventory every 30 seconds. Communication critical.',
  defId: 'pestilence', npc: {
    name: 'Pestilence', combat: 320, maxHp: 380, maxHit: 24,
    stats: { attack: 180, strength: 170, defence: 180 },
    attackSpeed: 4, attackRange: 4, attackStyle: 'magic', size: 2,
    aggressive: true, aggroRange: 8, wanderRadius: 0, respawnTicks: 150,
    examine: 'The horseman of pestilence. Everything it touches rots.',
    weakness: 'slash', tags: ['boss', 'undead'], poisonDamage: 6,
  },
  drops: {
    always: [{ id: 107, name: 'Dragon bones', min: 2, max: 2 }],
    main: [{ id: 101, name: 'Coins', weight: 5, min: 8000, max: 30000 }],
    tertiary: [{ id: 97701, name: 'Pestilent rod', chance: 256, min: 1, max: 1 }],
  },
  rewardItems: [
    { id: 97701, name: 'Pestilent rod', examine: 'A staff that spreads disease. 25% chance to poison targets. BIS for venom builds.', value: 4000000, category: 'weapon', equipSlot: 'weapon', speed: 4, stats: { magic: 22, magic_strength: 18, crush: 5 }, equipReqs: { magic: 75 } },
    { id: 97702, name: 'Famine ring', examine: 'A ring that absorbs life from enemies. Heals 5% of damage dealt.', value: 3000000, category: 'jewellery', equipSlot: 'ring', stats: { melee_strength: 4, ranged_strength: 4, magic_strength: 4 }, equipReqs: {} },
  ],
  pet: { id: 97710, name: 'Lil horseman', examine: 'A tiny horseman. Looks hungry and sick.', value: 0, category: 'pet', tradeable: false },
});
npcs.defineNpc('famine', {
  name: 'Famine', combat: 310, maxHp: 360, maxHit: 22,
  stats: { attack: 175, strength: 180, defence: 160 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee', size: 2,
  aggressive: true, aggroRange: 6, wanderRadius: 0, respawnTicks: 150,
  examine: 'The horseman of famine. Destroys your food.',
  weakness: 'magic', tags: ['boss', 'undead'], resistance: 'melee',
});
droptables.define('famine', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 310, max: 930 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });

// ── 4. The Storm Twins — Saltbrine ───────────────────────────────────────
defineDuoBoss({
  id: 'storm_twins', name: 'The Storm Twins',
  region: 'Saltbrine', players: '2',
  description: 'Twin sea elementals that control thunder and rain. One creates lightning strikes (dodge), the other creates tidal waves (high ground). Must split to survive.',
  mechanic: 'Arena splits in half. Each player gets one twin. The arena shifts every 60 seconds — twins swap sides. Players must adapt.',
  defId: 'storm_twin_thunder', npc: {
    name: 'Thundara', combat: 300, maxHp: 350, maxHit: 25,
    stats: { attack: 180, strength: 170, defence: 160 },
    attackSpeed: 3, attackRange: 8, attackStyle: 'magic', size: 2,
    aggressive: true, aggroRange: 10, wanderRadius: 0, respawnTicks: 120,
    examine: 'The thunder twin. Lightning strikes the ground around her.',
    weakness: 'stab', tags: ['elemental', 'boss'], resistance: 'magic',
  },
  drops: {
    always: [],
    main: [{ id: 101, name: 'Coins', weight: 5, min: 10000, max: 35000 }],
    tertiary: [{ id: 97801, name: 'Storm blade', chance: 256, min: 1, max: 1 }],
  },
  rewardItems: [
    { id: 97801, name: 'Storm blade', examine: 'A blade of condensed lightning. 20% chance to stun target for 1 tick on hit.', value: 4000000, category: 'weapon', equipSlot: 'weapon', speed: 4, stats: { slash: 80, melee_strength: 78, magic: 5 }, equipReqs: { attack: 75 } },
    { id: 97802, name: 'Tidal ward', examine: 'A shield of compressed water. BIS magic+ranged hybrid off-hand.', value: 3000000, category: 'armour', equipSlot: 'shield', stats: { magic: 8, ranged: 8, def_stab: 20, def_slash: 22, def_crush: 18, def_magic: 15, def_ranged: 15, prayer: 2 }, equipReqs: { defence: 70 } },
  ],
  pet: { id: 97810, name: 'Storm wisp', examine: 'A tiny storm. Crackles with electricity.', value: 0, category: 'pet', tradeable: false },
});
npcs.defineNpc('storm_twin_rain', {
  name: 'Tsunara', combat: 290, maxHp: 340, maxHit: 23,
  stats: { attack: 170, strength: 160, defence: 170 },
  attackSpeed: 4, attackRange: 6, attackStyle: 'ranged', size: 2,
  aggressive: true, aggroRange: 8, wanderRadius: 0, respawnTicks: 120,
  examine: 'The rain twin. Tidal waves crash across the arena.',
  weakness: 'magic', tags: ['elemental', 'boss'], resistance: 'ranged',
});
droptables.define('storm_twin_rain', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 290, max: 870 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });

// ── 5. The Architect & The Destroyer — Sootworks ─────────────────────────
defineDuoBoss({
  id: 'architect_destroyer', name: 'The Architect & The Destroyer',
  region: 'Sootworks', players: '2',
  description: 'Two ancient dwarven constructs. The Architect builds defences for itself. The Destroyer breaks your defences. One player tanks each. If the Architect finishes building, it becomes immune.',
  mechanic: 'The Architect spawns barriers every 20 seconds. The Destroyer charges at players, breaking shields. Players must DPS the Architect before it becomes immune while the other player kites the Destroyer.',
  defId: 'the_architect_boss', npc: {
    name: 'The Architect', combat: 340, maxHp: 420, maxHit: 18,
    stats: { attack: 190, strength: 150, defence: 220 },
    attackSpeed: 5, attackRange: 5, attackStyle: 'magic', size: 3,
    aggressive: true, aggroRange: 8, wanderRadius: 0, respawnTicks: 150,
    examine: 'An ancient dwarven construct that builds defences.',
    weakness: 'crush', tags: ['construct', 'boss', 'armoured'], resistance: 'ranged',
  },
  drops: {
    always: [],
    main: [{ id: 101, name: 'Coins', weight: 4, min: 15000, max: 50000 }, { id: 7003, name: 'Clockwork gear', weight: 5, min: 20, max: 50 }],
    tertiary: [{ id: 97901, name: 'Architect\'s blueprint', chance: 256, min: 1, max: 1 }],
  },
  rewardItems: [
    { id: 97901, name: "Architect's blueprint", examine: 'A schematic from the Architect. Unlocks BIS construction items. Non-tradeable.', value: 0, category: 'misc', tradeable: false },
    { id: 97902, name: 'Destroyer\'s core', examine: 'The core of the Destroyer. BIS melee ring for charged special attacks (auto-recharges spec 25% faster).', value: 5000000, category: 'jewellery', equipSlot: 'ring', stats: { melee_strength: 6, crush: 4 }, equipReqs: {} },
  ],
  pet: { id: 97910, name: 'Tiny architect', examine: 'A tiny construct that builds tiny things.', value: 0, category: 'pet', tradeable: false },
});
npcs.defineNpc('the_destroyer_boss', {
  name: 'The Destroyer', combat: 360, maxHp: 380, maxHit: 30,
  stats: { attack: 210, strength: 220, defence: 180 },
  attackSpeed: 3, attackRange: 1, attackStyle: 'melee', size: 3,
  aggressive: true, aggroRange: 10, wanderRadius: 0, respawnTicks: 150,
  examine: 'An ancient dwarven construct that destroys everything.',
  weakness: 'magic', tags: ['construct', 'boss'], resistance: 'melee',
});
droptables.define('the_destroyer_boss', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 360, max: 1080 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });

console.log(`[aelgard] Combat challenges: ${waveChallenges.length} wave challenges + ${duoBosses.length} duo bosses loaded`);

module.exports = { waveChallenges, duoBosses };
