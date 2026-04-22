// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Moryskah
// Gothic horror swampland. Vampires, werewolves, undead. Slayer tower.
// Mid-to-high level region (combat 40-100+).
// ══════════════════════════════════════════════════════════════════════════════

const items = require('../../data/items');
const npcs = require('../../world/npcs');
const shops = require('../../data/shops');
const quests = require('../../data/quests');
const droptables = require('../../data/droptables');

// ── Items: Moryskah unique ─────────────────────────────────────────────────

items.define({ id: 5001, name: 'Vial of blood', examine: 'A vial of thick, dark blood.', value: 50, category: 'herblore', weight: 0.3 });
items.define({ id: 5002, name: 'Wolfbane herb', examine: 'A pungent herb that repels werewolves.', value: 80, category: 'herblore', weight: 0.1 });
items.define({ id: 5003, name: 'Silver dust', examine: 'Ground silver. Burns the undead.', value: 120, category: 'crafting', weight: 0.2 });
items.define({ id: 5004, name: 'Ectoplasm', examine: 'Ghostly residue. Cold and slimy.', value: 30, category: 'prayer', weight: 0.5 });
items.define({ id: 5005, name: 'Swamp tar', examine: 'Thick, sticky tar from the Moryskah bogs.', value: 10, category: 'herblore', weight: 1 });
items.define({ id: 5006, name: 'Ghast remains', examine: 'What was left after a ghast was banished.', value: 5, category: 'misc', weight: 0.5 });
items.define({ id: 5007, name: 'Banshee vocal cord', examine: 'Still vibrating slightly.', value: 200, category: 'slayer', weight: 0.1 });
items.define({ id: 5008, name: 'Vampyre fang', examine: 'A razor-sharp fang. Still bloody.', value: 300, category: 'slayer', weight: 0.1 });
items.define({ id: 5009, name: 'Werewolf pelt', examine: 'A thick, matted pelt.', value: 250, category: 'crafting', weight: 2 });
items.define({ id: 5010, name: 'Silver sickle', examine: 'A blessed silver sickle. Effective against the undead.', value: 500, category: 'weapon', equipSlot: 'weapon', speed: 4, stats: { slash: 18, melee_strength: 16 }, equipReqs: { attack: 20 } });
items.define({ id: 5011, name: 'Holy water', examine: 'Blessed water in a ceramic vial.', value: 60, category: 'ranged', stackable: true, weight: 0 });

// Boss uniques — Count Malachar
items.define({ id: 5050, name: "Malachar's signet", examine: 'A ring of dark authority. Drains the life of those you strike.', value: 60000, category: 'jewellery', equipSlot: 'ring', stats: { melee_strength: 6, ranged_strength: 6, magic_strength: 3 }, equipReqs: { hitpoints: 50 } });
items.define({ id: 5051, name: 'Sanguine cape', examine: 'A blood-red cape that pulses with stolen life.', value: 50000, category: 'armour', equipSlot: 'cape', stats: { prayer: 5, def_stab: 8, def_slash: 8, def_crush: 8, def_magic: 8, def_ranged: 8 }, equipReqs: { prayer: 40 } });
items.define({ id: 5052, name: 'Bloodwood staff', examine: 'A staff carved from a tree that feeds on blood.', value: 45000, category: 'weapon', equipSlot: 'weapon', speed: 4, stats: { magic: 22, magic_strength: 15 }, equipReqs: { magic: 50 } });

// Quest items
items.define({ id: 5090, name: "Malachar's invitation", examine: 'An invitation to dine at Castle Malachar. Ominous.', value: 0, category: 'quest', tradeable: false });
items.define({ id: 5091, name: 'Consecrated ground vial', examine: 'Soil from sanctified ground. Burns vampyres.', value: 0, category: 'quest', tradeable: false });
items.define({ id: 5092, name: "Werewolf alpha's claw", examine: 'A trophy from the alpha. Proof of the pack\'s defeat.', value: 0, category: 'quest', tradeable: false });

// ══════════════════════════════════════════════════════════════════════════════
// MONSTERS — Moryskah
// ══════════════════════════════════════════════════════════════════════════════

npcs.defineNpc('ghast', {
  name: 'Ghast', combat: 30, maxHp: 15, maxHit: 5,
  stats: { attack: 15, strength: 12, defence: 5 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee',
  aggressive: true, aggroRange: 5, wanderRadius: 6, respawnTicks: 40,
  examine: 'A tortured spirit trapped in the swamp.',
  weakness: 'magic', tags: ['undead', 'spirit'], resistance: 'melee',
});

npcs.defineNpc('banshee', {
  name: 'Banshee', combat: 45, maxHp: 40, maxHit: 6,
  stats: { attack: 25, strength: 20, defence: 18 },
  attackSpeed: 4, attackRange: 4, attackStyle: 'magic',
  aggressive: true, aggroRange: 5, wanderRadius: 3, respawnTicks: 50,
  examine: 'A wailing spirit. Cover your ears.',
  weakness: 'crush', tags: ['undead', 'spirit'], resistance: 'ranged',
});

npcs.defineNpc('crawling_hand', {
  name: 'Crawling hand', combat: 18, maxHp: 16, maxHit: 3,
  stats: { attack: 10, strength: 8, defence: 6 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee',
  aggressive: true, aggroRange: 3, wanderRadius: 3, respawnTicks: 30,
  examine: 'A severed hand that still grasps.',
  weakness: 'slash', tags: ['undead'],
});
droptables.define('crawling_hand', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 36, max: 108 }, { id: 11357, name: 'Death rune', weight: 3, min: 2, max: 6 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });

npcs.defineNpc('vampyre_juvenile', {
  name: 'Vampyre juvenile', combat: 50, maxHp: 55, maxHit: 7,
  stats: { attack: 35, strength: 30, defence: 25 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee',
  aggressive: true, aggroRange: 4, wanderRadius: 4, respawnTicks: 55,
  examine: 'A young vampyre. Reckless and hungry.',
  weakness: 'slash', tags: ['vampyre', 'undead'], // silver weapons get +20% damage
});

npcs.defineNpc('vampyre_noble', {
  name: 'Vampyre noble', combat: 75, maxHp: 90, maxHit: 11,
  stats: { attack: 50, strength: 45, defence: 40 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee',
  aggressive: false, aggroRange: 3, wanderRadius: 3, respawnTicks: 80,
  examine: 'An elder vampyre. Calm, composed, deadly.',
  weakness: 'slash', tags: ['vampyre', 'undead'], resistance: 'ranged', // blocks arrows with cape
});

npcs.defineNpc('werewolf', {
  name: 'Werewolf', combat: 60, maxHp: 70, maxHit: 9,
  stats: { attack: 40, strength: 45, defence: 30 },
  attackSpeed: 3, attackRange: 1, attackStyle: 'melee',
  aggressive: true, aggroRange: 5, wanderRadius: 6, respawnTicks: 60,
  examine: 'A ferocious beast that was once human.',
  weakness: 'stab', tags: ['beast'], // thick hide, stab gets through
});

npcs.defineNpc('werewolf_alpha', {
  name: 'Werewolf alpha', combat: 85, maxHp: 110, maxHit: 13,
  stats: { attack: 55, strength: 60, defence: 40 },
  attackSpeed: 3, attackRange: 1, attackStyle: 'melee', size: 2,
  aggressive: true, aggroRange: 6, wanderRadius: 4, respawnTicks: 100,
  examine: 'The leader of the pack. Enormous.',
  weakness: 'stab', tags: ['beast'], resistance: 'magic', // primal, magic doesn't faze it
});

npcs.defineNpc('aberrant_spectre', {
  name: 'Aberrant spectre', combat: 65, maxHp: 75, maxHit: 9,
  stats: { attack: 40, strength: 35, defence: 30 },
  attackSpeed: 4, attackRange: 5, attackStyle: 'magic',
  aggressive: true, aggroRange: 5, wanderRadius: 3, respawnTicks: 55,
  examine: 'A distorted spirit. The smell is overwhelming.',
  weakness: 'ranged', tags: ['undead', 'spirit'], resistance: 'melee', // ethereal, hard to hit with swords
});

npcs.defineNpc('revenant_imp', {
  name: 'Revenant imp', combat: 40, maxHp: 35, maxHit: 8,
  stats: { attack: 30, strength: 25, defence: 15 },
  attackSpeed: 3, attackRange: 5, attackStyle: 'magic',
  aggressive: true, aggroRange: 6, wanderRadius: 5, respawnTicks: 120,
  examine: 'A ghostly imp from another plane. Glows faintly.',
  weakness: 'magic', tags: ['undead', 'spirit'], resistance: 'melee',
});
droptables.define('revenant_imp', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 80, max: 240 }, { id: 11357, name: 'Death rune', weight: 3, min: 2, max: 6 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });

// ── Boss: Count Malachar ───────────────────────────────────────────────────

npcs.defineNpc('count_malachar', {
  name: 'Count Malachar', combat: 150, maxHp: 350, maxHit: 22,
  stats: { attack: 100, strength: 90, defence: 110 },
  attackSpeed: 4, attackRange: 5, attackStyle: 'melee', size: 2,
  aggressive: false, wanderRadius: 0, respawnTicks: 400,
  examine: 'Lord of Castle Malachar. Has not aged in seven centuries.',
  weakness: 'slash', tags: ['vampyre', 'undead', 'boss'], resistance: 'ranged',
  // Silver weapons get +20% damage from vampyre tag. This makes the silver sickle
  // from the Moryskah apothecary a real choice despite lower base stats.
});

// ══════════════════════════════════════════════════════════════════════════════
// DROP TABLES — Moryskah
// ══════════════════════════════════════════════════════════════════════════════

droptables.define('ghast', {
  always: [],
  main: [
    { id: 5006, name: 'Ghast remains', weight: 30, min: 1, max: 1 },
    { id: 5004, name: 'Ectoplasm', weight: 15, min: 1, max: 1 },
    { id: 0, name: 'Nothing', weight: 20, min: 0, max: 0 },
  ],
});

droptables.define('banshee', {
  always: [],
  main: [
    { id: 5007, name: 'Banshee vocal cord', weight: 8, min: 1, max: 1 },
    { id: 101, name: 'Coins', weight: 20, min: 20, max: 60 },
    { id: 5004, name: 'Ectoplasm', weight: 10, min: 1, max: 2 },
    { id: 0, name: 'Nothing', weight: 12, min: 0, max: 0 },
  ],
});

droptables.define('vampyre_juvenile', {
  always: [],
  main: [
    { id: 5001, name: 'Vial of blood', weight: 20, min: 1, max: 2 },
    { id: 5008, name: 'Vampyre fang', weight: 5, min: 1, max: 1 },
    { id: 101, name: 'Coins', weight: 15, min: 30, max: 100 },
    { id: 0, name: 'Nothing', weight: 10, min: 0, max: 0 },
  ],
});

droptables.define('vampyre_noble', {
  always: [],
  main: [
    { id: 5001, name: 'Vial of blood', weight: 15, min: 2, max: 4 },
    { id: 5008, name: 'Vampyre fang', weight: 8, min: 1, max: 1 },
    { id: 101, name: 'Coins', weight: 10, min: 80, max: 300 },
    { id: 5003, name: 'Silver dust', weight: 5, min: 1, max: 2 },
    { id: 0, name: 'Nothing', weight: 5, min: 0, max: 0 },
  ],
});

droptables.define('werewolf', {
  always: [{ id: 100, name: 'Bones', min: 1, max: 1 }],
  main: [
    { id: 5009, name: 'Werewolf pelt', weight: 10, min: 1, max: 1 },
    { id: 101, name: 'Coins', weight: 15, min: 40, max: 120 },
    { id: 103, name: 'Raw beef', weight: 5, min: 1, max: 2 },
    { id: 0, name: 'Nothing', weight: 10, min: 0, max: 0 },
  ],
});

droptables.define('werewolf_alpha', {
  always: [{ id: 106, name: 'Big bones', min: 1, max: 1 }],
  main: [
    { id: 5009, name: 'Werewolf pelt', weight: 15, min: 1, max: 2 },
    { id: 101, name: 'Coins', weight: 10, min: 100, max: 400 },
    { id: 1402, name: 'Adamant scimitar', weight: 3, min: 1, max: 1 },
    { id: 5092, name: "Werewolf alpha's claw", weight: 2, min: 1, max: 1 },
  ],
});

droptables.define('aberrant_spectre', {
  always: [],
  main: [
    { id: 101, name: 'Coins', weight: 12, min: 50, max: 200 },
    { id: 5002, name: 'Wolfbane herb', weight: 8, min: 1, max: 2 },
    { id: 5003, name: 'Silver dust', weight: 5, min: 1, max: 1 },
    { id: 5004, name: 'Ectoplasm', weight: 8, min: 1, max: 3 },
    { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 },
  ],
});

droptables.define('count_malachar', {
  always: [{ id: 107, name: 'Dragon bones', min: 1, max: 1 }],
  main: [
    { id: 101, name: 'Coins', weight: 8, min: 2000, max: 8000 },
    { id: 5001, name: 'Vial of blood', weight: 10, min: 5, max: 10 },
    { id: 5008, name: 'Vampyre fang', weight: 5, min: 2, max: 3 },
    { id: 1511, name: 'Rune platebody', weight: 2, min: 1, max: 1 },
  ],
  tertiary: [
    { id: 5050, name: "Malachar's signet", chance: 128, min: 1, max: 1 },
    { id: 5051, name: 'Sanguine cape', chance: 128, min: 1, max: 1 },
    { id: 5052, name: 'Bloodwood staff', chance: 128, min: 1, max: 1 },
  ],
});

// ══════════════════════════════════════════════════════════════════════════════
// NPCs (non-combat) — Moryskah
// ══════════════════════════════════════════════════════════════════════════════

npcs.defineNpc('father_dorin', {
  name: 'Father Dorin', combat: 0, maxHp: 1, size: 1,
  aggressive: false, wanderRadius: 0, canMove: false,
  examine: 'A priest holding vigil at the border of the swamp. He looks exhausted.',
  dialogue: { type: 'quest', questId: 'the_bog_witchs_bargain' },
});

npcs.defineNpc('bog_witch_grael', {
  name: 'Bog Witch Grael', combat: 0, maxHp: 1, size: 1,
  aggressive: false, wanderRadius: 0, canMove: false,
  examine: 'An old woman who lives alone in the deepest part of the swamp. Her eyes glow faintly.',
  dialogue: { type: 'quest', questId: 'the_bog_witchs_bargain' },
});

npcs.defineNpc('slayer_master_varrek', {
  name: 'Slayer Master Varrek', combat: 0, maxHp: 1, size: 1,
  aggressive: false, wanderRadius: 0, canMove: false,
  examine: 'A grizzled slayer master with scars across every visible surface.',
  dialogue: { type: 'slayer' },
});

npcs.defineNpc('apothecary_nira', {
  name: 'Apothecary Nira', combat: 0, maxHp: 1, size: 1,
  aggressive: false, wanderRadius: 0, canMove: false,
  examine: 'A herbalist who specializes in anti-undead preparations.',
  dialogue: { type: 'shop', shopId: 'moryskah_apothecary' },
});

// ══════════════════════════════════════════════════════════════════════════════
// SHOPS — Moryskah
// ══════════════════════════════════════════════════════════════════════════════

shops.define('moryskah_apothecary', {
  name: "Nira's Apothecary", npc: 'Apothecary Nira', type: 'specialty',
  stock: [
    { id: 5010, name: 'Silver sickle', base: 3, price: 500 },
    { id: 5011, name: 'Holy water', base: 50, price: 60 },
    { id: 5002, name: 'Wolfbane herb', base: 10, price: 80 },
    { id: 5003, name: 'Silver dust', base: 5, price: 120 },
    { id: 5001, name: 'Vial of blood', base: 5, price: 50 },
  ],
  restockRate: 250,
});

// ══════════════════════════════════════════════════════════════════════════════
// QUESTS — Moryskah
// ══════════════════════════════════════════════════════════════════════════════

quests.define('the_bog_witchs_bargain', {
  name: "The Bog Witch's Bargain",
  description: "Father Dorin warns that the swamp is more dangerous than ever. The Bog Witch Grael might know why — but her help comes at a price.",
  difficulty: 'Intermediate',
  questPoints: 2,
  requirements: { skills: { herblore: 15, fishing: 10, cooking: 10 } }, // Fishing for swamp ingredients, Cooking to prepare the brew properly
  steps: [
    { text: 'Talk to Father Dorin at the Moryskah border.' },
    { text: 'Navigate the swamp to find Bog Witch Grael.' },
    { text: "Gather 5 Wolfbane herbs and 3 Swamp tar for Grael's brew." },
    { text: 'Deliver the ingredients to Grael and wait while she brews.' },
    { text: "Use Grael's ward to seal the ghast spawning point." },
    { text: 'Return to Father Dorin.' },
  ],
  rewards: {
    xp: { herblore: 1500, prayer: 800 },
    items: [{ id: 101, name: 'Coins', count: 2000 }, { id: 5010, name: 'Silver sickle', count: 1 }],
    questPoints: 2,
    unlocks: ["npc:bog_witch", "recipe:wolfbane_incense"],
    chain_next: 'the_bog_witchs_hunger',
  },
});

quests.define('blood_rites', {
  name: 'Blood Rites',
  description: "Vampyres have been raiding villages at the swamp's edge. The trail leads to Castle Malachar — and an invitation you didn't ask for.",
  difficulty: 'Experienced',
  questPoints: 3,
  requirements: { quests: ['the_bog_witchs_bargain'], skills: { attack: 40, defence: 35, prayer: 30, crafting: 25, agility: 20 } }, // Crafting for consecrated ground vial, Agility for castle navigation
  steps: [
    { text: 'Investigate the raided village south of the swamp.' },
    { text: "Find Malachar's invitation on a dead vampyre noble." },
    { text: "Travel to the Heartlands to consult the scholars about vampyre weaknesses." },
    { text: "Travel to the Sootworks to forge a silver stake (Crafting 25, requires silver bar)." },
    { text: "Return to Moryskah and enter Castle Malachar using the invitation." },
    { text: "Navigate the castle's trapped hallways (Agility 20)." },
    { text: "Discover Malachar's blood ritual chamber." },
    { text: "Disrupt the ritual by consecrating the ground." },
    { text: "Defeat Count Malachar." },
    { text: "Report back to Father Dorin." },
  ],
  rewards: {
    xp: { attack: 5000, prayer: 3000, defence: 2000 },
    items: [{ id: 101, name: 'Coins', count: 10000 }],
    questPoints: 3,
    unlocks: ["prayer_unlock:protect_from_undead"],
  },
});

// ══════════════════════════════════════════════════════════════════════════════

console.log('[aelgard] Moryskah content loaded');
