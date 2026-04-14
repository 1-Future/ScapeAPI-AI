// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Slayer Creatures + Dragon Tiers
// Slayer-only monsters that require a slayer level to harm.
// Each drops unique items unavailable from any other source (P04).
// ══════════════════════════════════════════════════════════════════════════════

const npcs = require('../../world/npcs');
const droptables = require('../../data/droptables');
const items = require('../../data/items');
const slayer = require('../../data/slayer');

function mob(defId, def, drops) {
  npcs.defineNpc(defId, def);
  if (drops) droptables.define(defId, drops);
}

// ══════════════════════════════════════════════════════════════════════════════
// SLAYER CREATURES — ordered by slayer level requirement
// ══════════════════════════════════════════════════════════════════════════════

// Level 1 — Cave bugs
mob('cave_bug', { name: 'Cave bug', combat: 12, maxHp: 10, maxHit: 2, stats: { attack: 6, strength: 5, defence: 4 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: false, wanderRadius: 3, respawnTicks: 25, examine: 'A cave-dwelling insect.', weakness: 'crush', tags: ['beast'] },
  { always: [], main: [{ id: 101, name: 'Coins', weight: 15, min: 2, max: 10 }, { id: 0, name: 'Nothing', weight: 15, min: 0, max: 0 }] });

// Level 15 — Banshees (already defined, add slayer req)

// Level 17 — Cave slime
mob('cave_slime', { name: 'Cave slime', combat: 23, maxHp: 22, maxHit: 3, stats: { attack: 12, strength: 10, defence: 8 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 3, wanderRadius: 3, respawnTicks: 30, examine: 'A slimy cave creature. Poisonous.', weakness: 'magic', tags: ['beast'], poisonDamage: 2 });

// Level 25 — Mogres (underwater in Saltbrine)
mob('mogre', { name: 'Mogre', combat: 32, maxHp: 30, maxHit: 5, stats: { attack: 18, strength: 20, defence: 15 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 4, wanderRadius: 4, respawnTicks: 35, examine: 'An underwater ogre-like creature.', weakness: 'ranged', tags: ['beast'] },
  { always: [], main: [{ id: 101, name: 'Coins', weight: 12, min: 10, max: 50 }, { id: 2306, name: 'Raw shark', weight: 3, min: 1, max: 1 }, { id: 0, name: 'Nothing', weight: 10, min: 0, max: 0 }] });

// Level 35 — Turoths (requires leaf-bladed weapon)
items.define({ id: 31001, name: 'Leaf-bladed sword', examine: 'A sword made from a special leaf. Required to harm turoths and kurasks.', value: 40000, category: 'weapon', equipSlot: 'weapon', speed: 4, stats: { stab: 67, slash: 55, melee_strength: 50 }, equipReqs: { attack: 50, slayer: 35 } });

mob('turoth', { name: 'Turoth', combat: 83, maxHp: 76, maxHit: 8, stats: { attack: 55, strength: 52, defence: 50 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: false, aggroRange: 3, wanderRadius: 3, respawnTicks: 45, examine: 'A plant-like creature. Requires a leaf-bladed weapon.', weakness: 'slash', tags: ['plant'], resistance: 'magic' },
  { always: [], main: [{ id: 101, name: 'Coins', weight: 10, min: 30, max: 120 }, { id: 12005, name: 'Grimy ranarr', weight: 3, min: 1, max: 1 }, { id: 11359, name: 'Nature rune', weight: 5, min: 5, max: 15 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });

// Level 50 — Kurasks (also requires leaf-bladed weapon)
mob('kurask', { name: 'Kurask', combat: 106, maxHp: 97, maxHit: 10, stats: { attack: 68, strength: 65, defence: 60 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: false, aggroRange: 3, wanderRadius: 3, respawnTicks: 50, examine: 'A larger relative of the turoth.', weakness: 'slash', tags: ['plant'], resistance: 'magic' },
  { always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 60, max: 250 }, { id: 22006, name: 'Leaf-bladed battleaxe', weight: 1, min: 1, max: 1 }, { id: 12005, name: 'Grimy ranarr', weight: 3, min: 1, max: 2 }, { id: 0, name: 'Nothing', weight: 5, min: 0, max: 0 }] });

// Level 58 — Cave horrors (Black Mask drop — BIS slayer helm ingredient)
items.define({ id: 31010, name: 'Black mask', examine: 'A terrifying mask. Boosts melee accuracy and damage by 16.67% on slayer tasks.', value: 200000, category: 'armour', equipSlot: 'head', stats: { melee_strength: 3, def_stab: 10, def_slash: 12, def_crush: 8 }, equipReqs: { defence: 20, slayer: 58 } });

mob('cave_horror', { name: 'Cave horror', combat: 80, maxHp: 55, maxHit: 9, stats: { attack: 50, strength: 55, defence: 35 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 5, wanderRadius: 4, respawnTicks: 45, examine: 'A terrifying cave creature.', weakness: 'slash', tags: ['beast', 'shadow'] },
  { always: [], main: [{ id: 101, name: 'Coins', weight: 10, min: 40, max: 150 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }], tertiary: [{ id: 31010, name: 'Black mask', chance: 512, min: 1, max: 1 }] });

// Level 60 — Basilisks (Basilisk jaw for BIS str helm)
mob('basilisk', { name: 'Basilisk', combat: 61, maxHp: 75, maxHit: 8, stats: { attack: 42, strength: 40, defence: 45 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: false, aggroRange: 3, wanderRadius: 3, respawnTicks: 50, examine: 'A reptile whose gaze petrifies. Bring a mirror shield.', weakness: 'crush', tags: ['beast', 'armoured'] },
  { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 40, max: 120 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }], tertiary: [{ id: 22009, name: 'Basilisk jaw', chance: 1000, min: 1, max: 1 }] });

// Level 65 — Smoke devils
mob('smoke_devil', { name: 'Smoke devil', combat: 160, maxHp: 185, maxHit: 16, stats: { attack: 100, strength: 95, defence: 90 }, attackSpeed: 4, attackRange: 4, attackStyle: 'magic', aggressive: true, aggroRange: 5, wanderRadius: 3, respawnTicks: 55, examine: 'A demonic creature of smoke. Coughs violently.', weakness: 'ranged', tags: ['demon'], resistance: 'magic' },
  { always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 100, max: 400 }, { id: 11353, name: 'Fire rune', weight: 5, min: 20, max: 50 }, { id: 12009, name: 'Grimy snapdragon', weight: 2, min: 1, max: 1 }, { id: 22005, name: 'Mystic smoke staff', weight: 1, min: 1, max: 1 }, { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 }] });

// Level 75 — Gargoyles (already in monsters-expanded)

// Level 80 — Abyssal demons (Abyssal whip drop)
mob('abyssal_demon', { name: 'Abyssal demon', combat: 124, maxHp: 150, maxHit: 13, stats: { attack: 78, strength: 82, defence: 70 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: false, aggroRange: 4, wanderRadius: 4, respawnTicks: 50, examine: 'A demon from the Abyss. Teleports around erratically.', weakness: 'slash', tags: ['demon'], resistance: 'magic' },
  { always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 80, max: 300 }, { id: 11357, name: 'Death rune', weight: 4, min: 5, max: 15 }, { id: 0, name: 'Nothing', weight: 5, min: 0, max: 0 }], tertiary: [{ id: 22001, name: 'Abyssal whip', chance: 512, min: 1, max: 1 }] });

// Level 87 — Kraken (slayer boss)
mob('cave_kraken', { name: 'Cave kraken', combat: 127, maxHp: 125, maxHit: 12, stats: { attack: 75, strength: 70, defence: 65 }, attackSpeed: 4, attackRange: 5, attackStyle: 'magic', aggressive: false, aggroRange: 3, wanderRadius: 2, respawnTicks: 55, examine: 'A smaller kraken in the underwater caves.', weakness: 'slash', tags: ['beast'], resistance: 'magic' },
  { always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 60, max: 200 }, { id: 11357, name: 'Death rune', weight: 4, min: 5, max: 12 }, { id: 0, name: 'Nothing', weight: 5, min: 0, max: 0 }], tertiary: [{ id: 22004, name: 'Trident of the seas', chance: 512, min: 1, max: 1 }] });

// Level 91 — Cerberus (slayer boss in Moryskah)
items.define({ id: 31020, name: 'Primordial crystal', examine: 'Used to upgrade dragon boots to Primordial boots (BIS melee boots).', value: 800000, category: 'crafting', weight: 0.2 });
items.define({ id: 31021, name: 'Pegasian crystal', examine: 'Used to upgrade ranger boots to Pegasian boots (BIS ranged boots).', value: 600000, category: 'crafting', weight: 0.2 });
items.define({ id: 31022, name: 'Eternal crystal', examine: 'Used to upgrade wizard boots to Eternal boots (BIS magic boots).', value: 500000, category: 'crafting', weight: 0.2 });

mob('cerberus', { name: 'Cerberus', combat: 318, maxHp: 600, maxHit: 23, stats: { attack: 200, strength: 190, defence: 150 }, attackSpeed: 4, attackRange: 4, attackStyle: 'magic', size: 3, aggressive: true, aggroRange: 5, wanderRadius: 0, respawnTicks: 100, examine: 'A three-headed hellhound. Slayer level 91 required.', weakness: 'crush', tags: ['demon', 'boss'], resistance: 'ranged' },
  { always: [{ id: 106, name: 'Big bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 5, min: 500, max: 2000 }, { id: 11358, name: 'Blood rune', weight: 3, min: 10, max: 25 }, { id: 0, name: 'Nothing', weight: 3, min: 0, max: 0 }], tertiary: [{ id: 31020, name: 'Primordial crystal', chance: 512, min: 1, max: 1 }, { id: 31021, name: 'Pegasian crystal', chance: 512, min: 1, max: 1 }, { id: 31022, name: 'Eternal crystal', chance: 512, min: 1, max: 1 }] });

// ══════════════════════════════════════════════════════════════════════════════
// DRAGONS — full tier progression
// ══════════════════════════════════════════════════════════════════════════════

mob('green_dragon', { name: 'Green dragon', combat: 79, maxHp: 75, maxHit: 8, stats: { attack: 55, strength: 55, defence: 50 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 4, wanderRadius: 4, respawnTicks: 50, examine: 'A green dragon. Breathes dragonfire. Bring a shield.', weakness: 'stab', tags: ['dragon'] },
  { always: [{ id: 107, name: 'Dragon bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 8, min: 40, max: 150 }, { id: 11359, name: 'Nature rune', weight: 5, min: 5, max: 15 }, { id: 0, name: 'Nothing', weight: 5, min: 0, max: 0 }] });

mob('blue_dragon', { name: 'Blue dragon', combat: 111, maxHp: 105, maxHit: 10, stats: { attack: 70, strength: 68, defence: 65 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: false, aggroRange: 3, wanderRadius: 3, respawnTicks: 55, examine: 'A blue dragon. Stronger than green.', weakness: 'stab', tags: ['dragon'] },
  { always: [{ id: 107, name: 'Dragon bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 8, min: 80, max: 300 }, { id: 12503, name: 'Uncut ruby', weight: 3, min: 1, max: 1 }, { id: 0, name: 'Nothing', weight: 5, min: 0, max: 0 }] });

mob('red_dragon', { name: 'Red dragon', combat: 152, maxHp: 140, maxHit: 14, stats: { attack: 90, strength: 88, defence: 85 }, attackSpeed: 4, attackRange: 1, attackStyle: 'melee', aggressive: true, aggroRange: 5, wanderRadius: 3, respawnTicks: 60, examine: 'A red dragon. Very dangerous.', weakness: 'stab', tags: ['dragon'] },
  { always: [{ id: 107, name: 'Dragon bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 6, min: 200, max: 600 }, { id: 11358, name: 'Blood rune', weight: 3, min: 5, max: 12 }, { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 }] });

mob('black_dragon', { name: 'Black dragon', combat: 227, maxHp: 190, maxHit: 19, stats: { attack: 140, strength: 135, defence: 130 }, attackSpeed: 4, attackRange: 4, attackStyle: 'ranged', size: 3, aggressive: true, aggroRange: 5, wanderRadius: 3, respawnTicks: 80, examine: 'A massive black dragon. The strongest chromatic dragon.', weakness: 'stab', tags: ['dragon'], resistance: 'magic' },
  { always: [{ id: 107, name: 'Dragon bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 5, min: 400, max: 1200 }, { id: 20012, name: 'Dragon platelegs', weight: 1, min: 1, max: 1 }, { id: 0, name: 'Nothing', weight: 3, min: 0, max: 0 }] });

// King Black Dragon (wilderness boss)
mob('king_black_dragon', { name: 'King Black Dragon', combat: 276, maxHp: 255, maxHit: 25, stats: { attack: 170, strength: 165, defence: 180 }, attackSpeed: 4, attackRange: 5, attackStyle: 'magic', size: 4, aggressive: true, aggroRange: 5, wanderRadius: 0, respawnTicks: 150, examine: 'The king of the black dragons. Three heads.', weakness: 'stab', tags: ['dragon', 'boss'], resistance: 'magic' },
  { always: [{ id: 107, name: 'Dragon bones', min: 2, max: 2 }], main: [{ id: 101, name: 'Coins', weight: 5, min: 1000, max: 5000 }, { id: 20010, name: 'Dragon full helm', weight: 1, min: 1, max: 1 }, { id: 0, name: 'Nothing', weight: 3, min: 0, max: 0 }] });

// ── Add slayer creatures to Varrek's task list ─────────────────────────────

slayer.defineMaster('varrek_expanded', {
  name: 'Slayer Master Varrek (expanded)', combatReq: 80, slayerReq: 50,
  tasks: [
    { monster: 'turoth', weight: 5, min: 50, max: 80, slayerReq: 35 },
    { monster: 'kurask', weight: 4, min: 50, max: 80, slayerReq: 50 },
    { monster: 'cave horror', weight: 4, min: 50, max: 80, slayerReq: 58 },
    { monster: 'basilisk', weight: 4, min: 60, max: 90, slayerReq: 60 },
    { monster: 'smoke devil', weight: 3, min: 80, max: 120, slayerReq: 65 },
    { monster: 'gargoyle', weight: 4, min: 80, max: 120, slayerReq: 75 },
    { monster: 'nechryael', weight: 3, min: 80, max: 120, slayerReq: 80 },
    { monster: 'abyssal demon', weight: 3, min: 100, max: 150, slayerReq: 85 },
    { monster: 'cave kraken', weight: 2, min: 80, max: 120, slayerReq: 87 },
    { monster: 'cerberus', weight: 1, min: 3, max: 15, slayerReq: 91 },
    { monster: 'dark beast', weight: 2, min: 10, max: 30, slayerReq: 90 },
    // Dragons
    { monster: 'green dragon', weight: 5, min: 30, max: 60 },
    { monster: 'blue dragon', weight: 4, min: 30, max: 60 },
    { monster: 'red dragon', weight: 2, min: 20, max: 40 },
    { monster: 'black dragon', weight: 1, min: 10, max: 30 },
    { monster: 'iron dragon', weight: 2, min: 20, max: 40 },
    { monster: 'steel dragon', weight: 1, min: 10, max: 30 },
  ],
});

console.log('[aelgard] Slayer creatures + dragon tiers loaded');
