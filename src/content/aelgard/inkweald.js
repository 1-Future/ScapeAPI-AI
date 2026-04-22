// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — The Inkweald
// Surreal dream forest. Puzzle-heavy, shifting geometry. Endgame raid zone.
// High level (combat 60-150+). No OSRS analog — fully original.
// ══════════════════════════════════════════════════════════════════════════════

const items = require('../../data/items');
const npcs = require('../../world/npcs');
const quests = require('../../data/quests');
const droptables = require('../../data/droptables');

// ── Items ──────────────────────────────────────────────────────────────────

items.define({ id: 9001, name: 'Inkblot fragment', examine: 'A piece of solidified dream. Shifts shape when you look away.', value: 400, category: 'crafting', weight: 0 });
items.define({ id: 9002, name: 'Lucid essence', examine: 'Concentrated awareness. Lets you see through illusions.', value: 800, category: 'herblore', weight: 0.1 });
items.define({ id: 9003, name: 'Dream thread', examine: 'Thread spun from sleeping thoughts.', value: 250, category: 'crafting', weight: 0 });
items.define({ id: 9004, name: 'Nightmare shard', examine: 'A crystallized fragment of pure terror.', value: 1500, category: 'crafting', weight: 0.3 });
items.define({ id: 9005, name: 'Echo petal', examine: 'A flower that repeats the last sound it heard when crushed.', value: 100, category: 'herblore', weight: 0.1 });

// Boss uniques — Inkweald Muse (group puzzle boss)
items.define({ id: 9050, name: "Muse's mask", examine: 'A mask that lets you perceive hidden truths. The world looks different through it.', value: 70000, category: 'armour', equipSlot: 'head', stats: { magic: 6, prayer: 5, def_magic: 15, def_stab: 5, def_slash: 5, def_crush: 5 }, equipReqs: { magic: 50, prayer: 40 } });
items.define({ id: 9051, name: 'Dreamweaver staff', examine: 'A staff that bends reality around its wielder.', value: 85000, category: 'weapon', equipSlot: 'weapon', speed: 4, stats: { magic: 28, magic_strength: 20 }, equipReqs: { magic: 60 } });

// Hollow Choir (endgame raid) uniques
items.define({ id: 9060, name: 'Choir sigil', examine: 'A sigil that resonates with impossible harmonics.', value: 100000, category: 'armour', equipSlot: 'neck', stats: { magic: 12, ranged: 12, melee_strength: 6, prayer: 5 }, equipReqs: { hitpoints: 70 } });
items.define({ id: 9061, name: 'Harmonic blade', examine: 'A sword that vibrates at a frequency that disrupts armour.', value: 120000, category: 'weapon', equipSlot: 'weapon', speed: 4, stats: { slash: 72, melee_strength: 70 }, equipReqs: { attack: 65 } });
items.define({ id: 9062, name: 'Silence bow', examine: 'A bow that fires arrows of compressed silence. They make no sound until impact.', value: 110000, category: 'weapon', equipSlot: 'weapon', speed: 4, stats: { ranged: 68, ranged_strength: 12 }, equipReqs: { ranged: 65 } });

// ── Monsters ───────────────────────────────────────────────────────────────

npcs.defineNpc('dream_wisp', {
  name: 'Dream wisp', combat: 40, maxHp: 30, maxHit: 6,
  stats: { attack: 20, strength: 15, defence: 20 },
  attackSpeed: 4, attackRange: 4, attackStyle: 'magic',
  aggressive: false, wanderRadius: 8, respawnTicks: 40,
  examine: 'A floating mote of light that drifts through the dream forest.',
  weakness: 'magic', tags: ['spirit', 'elemental'], resistance: 'melee',
});

npcs.defineNpc('thought_stalker', {
  name: 'Thought stalker', combat: 60, maxHp: 65, maxHit: 9,
  stats: { attack: 40, strength: 35, defence: 30 },
  attackSpeed: 3, attackRange: 1, attackStyle: 'melee',
  aggressive: true, aggroRange: 6, wanderRadius: 6, respawnTicks: 50,
  examine: 'A predator that hunts by sensing conscious thought.',
  weakness: 'ranged', tags: ['beast', 'shadow'], // stay at distance, it can't sense ranged attacks as easily
});

npcs.defineNpc('mirror_golem', {
  name: 'Mirror golem', combat: 70, maxHp: 85, maxHit: 10,
  stats: { attack: 45, strength: 40, defence: 50 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee', size: 2,
  aggressive: false, aggroRange: 3, wanderRadius: 2, respawnTicks: 70,
  examine: 'A golem made of reflective surfaces. Your attacks seem to hurt you too.',
  weakness: 'crush', tags: ['construct', 'elemental'], resistance: 'ranged', // reflects projectiles
});
droptables.define('mirror_golem', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 210, max: 420 }, { id: 9001, name: 'Inkblot fragment', weight: 5, min: 1, max: 2 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });

npcs.defineNpc('ink_horror', {
  name: 'Ink horror', combat: 80, maxHp: 100, maxHit: 13,
  stats: { attack: 55, strength: 50, defence: 40 },
  attackSpeed: 4, attackRange: 3, attackStyle: 'magic', size: 2,
  aggressive: true, aggroRange: 5, wanderRadius: 4, respawnTicks: 65,
  examine: 'A shapeless mass of living ink. It screams in colours.',
  weakness: 'slash', tags: ['elemental', 'shadow'], resistance: 'magic', // made of dream-stuff, magic feeds it
});

npcs.defineNpc('sleepwalker', {
  name: 'Sleepwalker', combat: 55, maxHp: 50, maxHit: 8,
  stats: { attack: 30, strength: 35, defence: 25 },
  attackSpeed: 5, attackRange: 1, attackStyle: 'melee',
  aggressive: false, aggroRange: 2, wanderRadius: 10, respawnTicks: 60,
  examine: 'Someone trapped in the dream forest. Their eyes are open but they see nothing.',
  weakness: 'stab', tags: ['human'], // still physically human, stab wakes them... or kills them
});
droptables.define('sleepwalker', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 165, max: 330 }, { id: 9001, name: 'Inkblot fragment', weight: 5, min: 1, max: 2 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });

// Bosses
npcs.defineNpc('inkweald_muse', {
  name: 'The Inkweald Muse', combat: 160, maxHp: 400, maxHit: 20,
  stats: { attack: 100, strength: 80, defence: 100 },
  attackSpeed: 4, attackRange: 6, attackStyle: 'magic', size: 3,
  aggressive: false, wanderRadius: 0, respawnTicks: 400,
  examine: 'A dream-entity that creates illusions indistinguishable from reality. 5-player puzzle boss.',
  weakness: 'ranged', tags: ['spirit', 'boss'], resistance: 'magic', // illusions absorb magic, ranged cuts through
});

npcs.defineNpc('hollow_choir_conductor', {
  name: 'The Hollow Choir — Conductor', combat: 250, maxHp: 600, maxHit: 30,
  stats: { attack: 140, strength: 120, defence: 150 },
  attackSpeed: 4, attackRange: 8, attackStyle: 'magic', size: 4,
  aggressive: false, wanderRadius: 0, respawnTicks: 600,
  examine: 'The leader of the Hollow Choir. An endgame raid boss for 8 players.',
  weakness: 'crush', tags: ['spirit', 'boss'], // shatter the resonance with blunt force
  // Phases change weakness: P1=crush, P2=magic, P3=ranged — forces style switching
});

// ── Drop tables ────────────────────────────────────────────────────────────

droptables.define('dream_wisp', {
  always: [], main: [
    { id: 9001, name: 'Inkblot fragment', weight: 15, min: 1, max: 2 },
    { id: 9005, name: 'Echo petal', weight: 10, min: 1, max: 1 },
    { id: 0, name: 'Nothing', weight: 20, min: 0, max: 0 },
  ],
});

droptables.define('thought_stalker', {
  always: [{ id: 100, name: 'Bones', min: 1, max: 1 }],
  main: [
    { id: 101, name: 'Coins', weight: 12, min: 50, max: 150 },
    { id: 9001, name: 'Inkblot fragment', weight: 10, min: 1, max: 3 },
    { id: 9002, name: 'Lucid essence', weight: 3, min: 1, max: 1 },
    { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 },
  ],
});

droptables.define('ink_horror', {
  always: [], main: [
    { id: 9001, name: 'Inkblot fragment', weight: 10, min: 2, max: 5 },
    { id: 9004, name: 'Nightmare shard', weight: 3, min: 1, max: 1 },
    { id: 9003, name: 'Dream thread', weight: 5, min: 1, max: 2 },
    { id: 101, name: 'Coins', weight: 8, min: 80, max: 250 },
    { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 },
  ],
});

droptables.define('inkweald_muse', {
  always: [{ id: 107, name: 'Dragon bones', min: 1, max: 1 }],
  main: [
    { id: 101, name: 'Coins', weight: 6, min: 5000, max: 15000 },
    { id: 9004, name: 'Nightmare shard', weight: 5, min: 3, max: 6 },
    { id: 9002, name: 'Lucid essence', weight: 4, min: 3, max: 5 },
  ],
  tertiary: [
    { id: 9050, name: "Muse's mask", chance: 128, min: 1, max: 1 },
    { id: 9051, name: 'Dreamweaver staff', chance: 128, min: 1, max: 1 },
  ],
});

droptables.define('hollow_choir_conductor', {
  always: [{ id: 107, name: 'Dragon bones', min: 2, max: 2 }],
  main: [
    { id: 101, name: 'Coins', weight: 4, min: 20000, max: 50000 },
    { id: 9004, name: 'Nightmare shard', weight: 5, min: 5, max: 10 },
    { id: 9002, name: 'Lucid essence', weight: 4, min: 5, max: 8 },
  ],
  tertiary: [
    { id: 9060, name: 'Choir sigil', chance: 256, min: 1, max: 1 },
    { id: 9061, name: 'Harmonic blade', chance: 256, min: 1, max: 1 },
    { id: 9062, name: 'Silence bow', chance: 512, min: 1, max: 1 },
  ],
});

// ── NPCs ───────────────────────────────────────────────────────────────────

npcs.defineNpc('lucid_keeper_yara', {
  name: 'Lucid Keeper Yara', combat: 0, maxHp: 1, size: 1,
  aggressive: false, wanderRadius: 0, canMove: false,
  examine: 'A scholar who maintains consciousness inside the Inkweald. She appears to be dreaming and awake simultaneously.',
  dialogue: { type: 'quest', questId: 'the_inkweald_door' },
});

// ── Quests ──────────────────────────────────────────────────────────────────

quests.define('the_inkweald_door', {
  name: 'The Inkweald Door',
  description: 'Lucid Keeper Yara guards the boundary between the waking world and the dream forest. Something is weakening the barrier.',
  difficulty: 'Experienced',
  questPoints: 2,
  requirements: { skills: { magic: 35, prayer: 25, ranged: 20, agility: 25 } }, // Ranged to hit dream targets, Agility for shifting corridors
  steps: [
    { text: 'Talk to Lucid Keeper Yara at the Inkweald boundary.' },
    { text: 'Enter the Inkweald and survive the orientation trial (3 puzzle rooms).' },
    { text: 'Collect 5 Lucid essence from dream creatures.' },
    { text: 'Brew a wakefulness potion using Lucid essence and Echo petals.' },
    { text: 'Use the potion to see the Inkweald\'s true layout.' },
    { text: 'Seal the three breach points that are weakening the barrier.' },
    { text: 'Return to Yara.' },
  ],
  rewards: {
    xp: { magic: 4000, prayer: 2000, hitpoints: 1000 },
    items: [{ id: 101, name: 'Coins', count: 5000 }, { id: 9002, name: 'Lucid essence', count: 5 }],
    questPoints: 2,
    unlocks: ["spell_unlock:dream_magic"],
    chain_next: 'the_hollow_choirs_song',
  },
});

quests.define('the_hollow_choirs_song', {
  name: "The Hollow Choir's Song",
  description: 'Deep inside the Inkweald, something is singing. The song reshapes reality around it. Assemble a team of 8 and silence it.',
  difficulty: 'Grandmaster',
  questPoints: 5,
  requirements: { quests: ['the_inkweald_door'], skills: { attack: 60, magic: 55, prayer: 50, hitpoints: 60 } },
  steps: [
    { text: 'Return to Lucid Keeper Yara and ask about the singing.' },
    { text: 'Assemble a team of 8 players.' },
    { text: 'Enter the deep Inkweald together.' },
    { text: 'Navigate the shifting corridors (changes every 30 seconds).' },
    { text: 'Defeat the Hollow Choir — Conductor in the resonance chamber.' },
    { text: 'Escape the collapsing dream before the Inkweald seals.' },
    { text: 'Return to Yara with the Choir\'s silence.' },
  ],
  rewards: {
    xp: { attack: 10000, magic: 10000, prayer: 5000, hitpoints: 5000 },
    items: [{ id: 101, name: 'Coins', count: 25000 }],
    questPoints: 5,
    unlocks: ["item_unlock:the_hollow_choirs_song_completion"],
    chain_next: 'the_inkweald_second_door',
  },
});

console.log('[aelgard] Inkweald content loaded');
