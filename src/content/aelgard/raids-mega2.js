// ==============================================================================
// Aelgard -- Raids Mega Pack 2
//
// Raids #16-30: The second wave of endgame raid content.
// Spans every region of Aelgard plus cross-region and wilderness raids.
//
// Manifesto:
//   P04 Non-degenerate   -- every raid tests different skills, not just DPS
//   P08 Breakpoint        -- completion unlocks BIS gear that redefines builds
//   P12 Encounter itemiz. -- different raids demand different gear setups
//   P13 Design knobs      -- HIGH attention, HIGH complexity, HIGH danger, HIGH reward
//
// Item IDs: 96000-96199
// Pet  IDs: 84000-84014
// NPC def IDs: prefixed by raid name
//
// ==============================================================================

const items = require('../../data/items');
const npcs = require('../../world/npcs');
const droptables = require('../../data/droptables');


// Helper -- same pattern as raids-bosses-mega.js
// v0.9-waveB4 H14: boss-pet rate cut 2x (3000 → 1500). See reports/coll-log-audit.md §5.
function boss(defId, def, drops, petId, petName, petExamine, petRate = 1500) {
  npcs.defineNpc(defId, def);
  if (drops) droptables.define(defId, drops);
  if (petId) {
    items.define({ id: petId, name: petName, examine: petExamine, value: 0, category: 'pet', tradeable: false, weight: 0 });
    if (drops && !drops.tertiary) drops.tertiary = [];
    if (drops) drops.tertiary.push({ id: petId, name: petName, chance: petRate, min: 1, max: 1 });
  }
}


// ##############################################################################
//
//   GLASS DESERT RAIDS (3)
//
//   Raids 16-18. The endgame region's signature raids.
//   Crystal, dragon, and gladiatorial themes.
//
// ##############################################################################


// ══════════════════════════════════════════════════════════════════════════════
// RAID 16: THE PRISM LABYRINTH
// Solo/duo. Crystal maze with light-based wall mechanics.
// 4 phases: red, blue, green, white filters change which walls are solid.
// Boss: The Refractor (splits into 3, only 1 is real).
// ══════════════════════════════════════════════════════════════════════════════

// ---------- Prism ward ----------
// BIS magic off-hand. Highest magic attack of any shield-slot item.
// Trade-off: almost no defensive stats. Glass cannon off-hand.
items.define({
  id: 96000,
  name: 'Prism ward',
  examine: 'A crystalline ward that bends light around the wielder. Amplifies magical power at the expense of physical defence.',
  value: 22000000,
  category: 'armour',
  equipSlot: 'shield',
  stats: {
    magic: 35, magic_strength: 10, prayer: 2,
    def_stab: 8, def_slash: 10, def_crush: 6,
    def_magic: 12, def_ranged: 5,
  },
  equipReqs: { magic: 82, defence: 75 },
});

// ---------- Refractor's eye ----------
// Ring with +5% accuracy to all combat styles. No strength bonus.
// Trade-off: no max hit increase -- you give up Berserker/Archers ring
// strength for universal accuracy. BIS for tribrid setups.
items.define({
  id: 96001,
  name: "Refractor's eye",
  examine: 'A ring cut from the Refractor\'s core. Light bends around your attacks, making them unerringly accurate.',
  value: 15000000,
  category: 'jewellery',
  equipSlot: 'ring',
  stats: { stab: 6, slash: 6, crush: 6, ranged: 6, magic: 6 },
  equipReqs: {},
  passiveEffect: {
    name: 'Prismatic Focus',
    description: '+5% accuracy to all combat styles. Does not increase max hit.',
    globalAccuracyBonus: 0.05,
  },
});

// ---------- Chromatic shard ----------
// Crafting material from the labyrinth. Used to recharge Prism ward.
items.define({
  id: 96002,
  name: 'Chromatic shard',
  examine: 'A shard of living crystal that shifts colour in the light. Used to maintain prismatic equipment.',
  value: 30000,
  category: 'crafting',
  tradeable: true,
  stackable: true,
  weight: 0.1,
});

// --- Labyrinth minibosses ---

npcs.defineNpc('prism_sentinel_red', {
  name: 'Red Sentinel',
  combat: 220,
  maxHp: 250,
  maxHit: 28,
  stats: { attack: 150, strength: 140, defence: 130 },
  attackSpeed: 4,
  attackRange: 1,
  attackStyle: 'melee',
  size: 2,
  aggressive: true,
  aggroRange: 8,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A crystalline sentinel bathed in red light. It guards the first phase of the labyrinth.',
  weakness: 'magic',
  tags: ['raid', 'prism_labyrinth', 'crystal', 'construct'],
  resistance: 'melee',
  raidRoom: 'prism_red',
});
droptables.define('prism_sentinel_red', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 880, max: 2640 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

npcs.defineNpc('prism_sentinel_blue', {
  name: 'Blue Sentinel',
  combat: 240,
  maxHp: 280,
  maxHit: 30,
  stats: { attack: 160, strength: 120, defence: 160 },
  attackSpeed: 5,
  attackRange: 8,
  attackStyle: 'magic',
  size: 2,
  aggressive: true,
  aggroRange: 10,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A crystalline sentinel wreathed in blue energy. Its magic pierces through walls.',
  weakness: 'ranged',
  tags: ['raid', 'prism_labyrinth', 'crystal', 'construct'],
  resistance: 'magic',
  raidRoom: 'prism_blue',
});
droptables.define('prism_sentinel_blue', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 960, max: 2880 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

npcs.defineNpc('prism_sentinel_green', {
  name: 'Green Sentinel',
  combat: 260,
  maxHp: 300,
  maxHit: 32,
  stats: { attack: 170, strength: 150, defence: 150 },
  attackSpeed: 4,
  attackRange: 6,
  attackStyle: 'ranged',
  size: 2,
  aggressive: true,
  aggroRange: 10,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A crystalline sentinel glowing green. Fires prismatic bolts that track their target.',
  weakness: 'melee',
  tags: ['raid', 'prism_labyrinth', 'crystal', 'construct'],
  resistance: 'ranged',
  raidRoom: 'prism_green',
});
droptables.define('prism_sentinel_green', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 1040, max: 3120 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

// --- The Refractor (final boss) ---

npcs.defineNpc('prism_refractor', {
  name: 'The Refractor',
  combat: 450,
  maxHp: 680,
  maxHit: 48,
  stats: { attack: 250, strength: 230, defence: 260 },
  attackSpeed: 4,
  attackRange: 10,
  attackStyle: 'magic',
  size: 4,
  aggressive: true,
  aggroRange: 15,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A being of pure refracted light. It splits into copies of itself. Only one is real.',
  weakness: 'crush',
  tags: ['raid', 'prism_labyrinth', 'crystal', 'boss', 'construct'],
  resistance: 'magic',
  raidRoom: 'prism_boss',
  phases: [
    {
      name: 'Phase 1: Whole',
      hpRange: [1.0, 0.75],
      description: 'The Refractor attacks with prismatic beams. Rotates attack style every 6 ticks (magic -> ranged -> melee). Prayer switch required.',
      cycleInterval: 6,
      attackStyles: ['magic', 'ranged', 'melee'],
      correctPrayers: ['protect_from_magic', 'protect_from_missiles', 'protect_from_melee'],
      specialAttack: {
        name: 'Light Beam',
        description: 'Fires a beam that sweeps 90 degrees across the arena. 35 damage per tick in the beam.',
        damagePerTick: 35,
        sweepAngle: 90,
        beamWidth: 2,
        tickInterval: 12,
      },
    },
    {
      name: 'Phase 2: Split',
      hpRange: [0.75, 0.50],
      description: 'The Refractor splits into 3 copies. Only 1 is real. Fake copies take no damage but still attack. Real copy has a subtle shimmer. All copies use different attack styles.',
      copyCount: 3,
      realCopyIndicator: 'subtle_shimmer',
      fakeCopyDamage: 0,
      attackStyles: ['magic', 'ranged', 'melee'],
    },
    {
      name: 'Phase 3: Kaleidoscope',
      hpRange: [0.50, 0.25],
      description: 'Splits into 3 again, but now fakes explode if attacked for 40 damage. Must identify the real one before attacking.',
      copyCount: 3,
      fakeExplosionDamage: 40,
      identifyMechanic: 'The real Refractor casts a shadow. Fakes do not.',
    },
    {
      name: 'Phase 4: Prismatic Storm',
      hpRange: [0.25, 0.0],
      description: 'Reforms into one. Enraged. All walls in the maze flicker rapidly. Attack speed +2. Fires prismatic orbs that bounce off walls.',
      attackSpeedOverride: 2,
      maxHitOverride: 62,
      specialAttack: {
        name: 'Bouncing Orbs',
        description: '3 orbs bounce off maze walls, dealing 30 damage on contact. Each orb bounces 4 times before dissipating.',
        orbCount: 3,
        orbDamage: 30,
        bounceCount: 4,
        tickInterval: 8,
      },
    },
  ],
});

npcs.defineNpc('prism_refractor_copy', {
  name: 'Refracted Image',
  combat: 450,
  maxHp: 1,
  maxHit: 38,
  stats: { attack: 250, strength: 230, defence: 260 },
  attackSpeed: 4,
  attackRange: 10,
  attackStyle: 'magic',
  size: 4,
  aggressive: true,
  aggroRange: 15,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'Is this the real Refractor, or just a trick of the light?',
  weakness: 'none',
  tags: ['raid', 'prism_labyrinth', 'crystal', 'copy'],
  raidRoom: 'prism_boss',
  raidMechanic: 'Fake copy. Takes no real damage. Attacks players. Explodes for 40 damage in Phase 3 if struck.',
});
droptables.define('prism_refractor_copy', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 1800, max: 5400 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

// Drop tables

droptables.define('prism_labyrinth_standard', {
  always: [
    { id: 96002, name: 'Chromatic shard', min: 3, max: 8 },
  ],
  main: [
    { id: 101, name: 'Coins', weight: 8, min: 20000, max: 80000 },
    { id: 11357, name: 'Death rune', weight: 5, min: 150, max: 400 },
    { id: 11358, name: 'Blood rune', weight: 4, min: 100, max: 300 },
    { id: 11363, name: 'Soul rune', weight: 3, min: 50, max: 150 },
    { id: 0, name: 'Nothing', weight: 3, min: 0, max: 0 },
  ],
  tertiary: [
    { id: 96000, name: 'Prism ward', chance: 150, min: 1, max: 1 },
    { id: 96001, name: "Refractor's eye", chance: 200, min: 1, max: 1 },
  ],
});

// Pet: Lil' Prism
items.define({
  id: 84000,
  name: "Lil' Prism",
  examine: 'A tiny crystal being that refracts light into rainbows wherever it goes. Occasionally splits into two.',
  value: 0,
  category: 'pet',
  tradeable: false,
  weight: 0,
});

droptables.define('prism_refractor', {
  always: [],
  main: [
    { id: 101, name: 'Coins', weight: 6, min: 40000, max: 120000 },
    { id: 96002, name: 'Chromatic shard', weight: 5, min: 5, max: 15 },
    { id: 11363, name: 'Soul rune', weight: 4, min: 80, max: 200 },
    { id: 0, name: 'Nothing', weight: 2, min: 0, max: 0 },
  ],
  tertiary: [
    { id: 96000, name: 'Prism ward', chance: 60, min: 1, max: 1 },
    { id: 96001, name: "Refractor's eye", chance: 80, min: 1, max: 1 },
    { id: 84000, name: "Lil' Prism", chance: 1500, min: 1, max: 1 }, // v0.9-waveB4 H14: rate /2
  ],
});

const PRISM_LABYRINTH = {
  id: 'prism_labyrinth',
  name: 'The Prism Labyrinth',
  shortName: 'Prism',
  description: 'A crystal maze in the Glass Desert where walls appear and disappear based on light. Navigate four colour phases, defeat three sentinels, and face The Refractor -- a boss that splits into copies of itself.',
  location: 'Glass Desert, Crystal Caverns entrance',
  region: 'glass_desert',
  minPlayers: 1,
  maxPlayers: 2,
  estimatedTime: { min: 20, max: 40, unit: 'minutes' },
  requirements: {
    combat: 90,
    skills: {},
    quests: [],
    recommended: { combat: 110, skills: { magic: 85, prayer: 77 } },
  },
  rooms: [
    { id: 'prism_red', name: 'Red Phase', type: 'puzzle_combat', bosses: ['prism_sentinel_red'], mechanic: 'colourFilter', description: 'Red light filter. Only red-tinted walls are solid. Navigate to the sentinel.' },
    { id: 'prism_blue', name: 'Blue Phase', type: 'puzzle_combat', bosses: ['prism_sentinel_blue'], mechanic: 'colourFilter', description: 'Blue light filter. Wall layout changes entirely.' },
    { id: 'prism_green', name: 'Green Phase', type: 'puzzle_combat', bosses: ['prism_sentinel_green'], mechanic: 'colourFilter', description: 'Green light filter. Fake walls conceal dead ends.' },
    { id: 'prism_boss', name: 'The Refractor', type: 'boss', bosses: ['prism_refractor'], adds: ['prism_refractor_copy'], mechanic: 'splitBoss', description: 'White light. All walls visible. The Refractor awaits.' },
  ],
};


// ══════════════════════════════════════════════════════════════════════════════
// RAID 17: THE DRAGON FORGE
// 3-5 players. Veldrak's abandoned forge in the Glass Desert.
// Gather materials, smith a weapon mid-raid, fight the Forge Dragon.
// The weapon you forge determines what drop you can receive.
// ══════════════════════════════════════════════════════════════════════════════

// ---------- Dragonfire lance ----------
// BIS dragon-killing melee weapon. Essentially a melee Dragon hunter crossbow.
// +30% accuracy, +25% damage vs dragons. But mediocre base stats otherwise.
items.define({
  id: 96003,
  name: 'Dragonfire lance',
  examine: 'A lance forged in dragonfire and quenched in dragon blood. It yearns to slay its creators.',
  value: 25000000,
  category: 'weapon',
  equipSlot: 'weapon',
  speed: 5,
  stats: { stab: 85, melee_strength: 80 },
  equipReqs: { attack: 78 },
  passiveEffect: {
    name: 'Dragonbane Lance',
    description: '+30% accuracy and +25% damage against dragons.',
    targetTags: ['dragon'],
    accuracyBonus: 0.30,
    damageBonus: 0.25,
  },
});

// ---------- Dragon forge hammer ----------
// BIS crush 2-handed weapon. Highest single-hit max in the game.
// Speed 7 -- glacially slow. But when it lands, nothing survives.
items.define({
  id: 96004,
  name: 'Dragon forge hammer',
  examine: 'A warhammer forged in the heart of Veldrak\'s forge. Its weight alone could crush mountains.',
  value: 30000000,
  category: 'weapon',
  equipSlot: 'weapon',
  twoHanded: true,
  speed: 7,
  stats: { crush: 160, melee_strength: 162 },
  equipReqs: { attack: 80, strength: 80 },
  special: {
    cost: 60,
    name: 'Tectonic Slam',
    description: 'Slams the ground for guaranteed max hit. Reduces target defence by 30%.',
    hits: 1,
    guaranteedMaxHit: true,
    defenceReduction: 0.30,
  },
});

// ---------- Dragon visage ----------
// Combined with an anti-dragon shield to make the Dragonfire shield.
// The DFS provides massive fire resistance and decent all-around defence.
items.define({
  id: 96005,
  name: 'Dragon visage',
  examine: 'A scale from an ancient dragon. Can be smithed onto an anti-dragon shield by a master smith.',
  value: 20000000,
  category: 'crafting',
  tradeable: true,
  weight: 3,
});

items.define({
  id: 96006,
  name: 'Dragonfire shield',
  examine: 'An anti-dragon shield reinforced with a dragon visage. Absorbs and releases dragonfire.',
  value: 25000000,
  category: 'armour',
  equipSlot: 'shield',
  stats: {
    def_stab: 70, def_slash: 75, def_crush: 72,
    def_magic: 10, def_ranged: 68,
    melee_strength: 7, ranged_strength: 0,
  },
  equipReqs: { defence: 75 },
  passiveEffect: {
    name: 'Dragonfire Absorption',
    description: 'Absorbs dragonfire attacks. After absorbing 50 charges, can release a dragonfire bolt (25 damage, ranged).',
    dragonfireImmunity: true,
    maxCharges: 50,
    releaseDamage: 25,
  },
});

// ---------- Forge ingot ----------
// Raid-only material. Gathered during the ore vein room.
items.define({
  id: 96007,
  name: 'Forge ingot',
  examine: 'A superheated ingot from Veldrak\'s ore veins. Glows white-hot.',
  value: 50000,
  category: 'crafting',
  tradeable: false,
  weight: 2,
});

// --- Room 1: Ore Vein Guardians ---

npcs.defineNpc('forge_ore_golem', {
  name: 'Ore Vein Golem',
  combat: 200,
  maxHp: 220,
  maxHit: 25,
  stats: { attack: 130, strength: 140, defence: 180 },
  attackSpeed: 5,
  attackRange: 1,
  attackStyle: 'melee',
  size: 3,
  aggressive: true,
  aggroRange: 8,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A golem formed from crystallized ore. Its body is valuable but lethal to approach.',
  weakness: 'crush',
  tags: ['raid', 'dragon_forge', 'construct', 'armoured'],
  resistance: 'ranged',
  raidRoom: 'forge_ore_vein',
});
droptables.define('forge_ore_golem', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 800, max: 2400 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

// --- Room 2: Dragon Graveyard ---

npcs.defineNpc('forge_skeletal_dragon', {
  name: 'Skeletal Dragon',
  combat: 280,
  maxHp: 350,
  maxHit: 36,
  stats: { attack: 180, strength: 170, defence: 150 },
  attackSpeed: 5,
  attackRange: 6,
  attackStyle: 'magic',
  size: 4,
  aggressive: true,
  aggroRange: 12,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'The animated skeleton of a long-dead dragon. Blue fire burns in its eye sockets.',
  weakness: 'crush',
  tags: ['raid', 'dragon_forge', 'dragon', 'undead'],
  resistance: 'magic',
  raidRoom: 'forge_graveyard',
});
droptables.define('forge_skeletal_dragon', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 1120, max: 3360 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

// --- Room 3: Flame Chamber ---

npcs.defineNpc('forge_flame_guardian', {
  name: 'Flame Guardian',
  combat: 300,
  maxHp: 380,
  maxHit: 40,
  stats: { attack: 190, strength: 200, defence: 170 },
  attackSpeed: 4,
  attackRange: 8,
  attackStyle: 'magic',
  size: 3,
  aggressive: true,
  aggroRange: 10,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A living embodiment of dragonfire. Its flames melt steel.',
  weakness: 'ranged',
  tags: ['raid', 'dragon_forge', 'elemental', 'fire'],
  resistance: 'melee',
  raidRoom: 'forge_flame_chamber',
  specialAttack: {
    name: 'Flame Wave',
    description: 'Sends a wave of dragonfire across 5 tiles. 35 damage. Anti-dragon shields reduce to 10.',
    damage: 35,
    reducedDamage: 10,
    waveWidth: 5,
    tickInterval: 10,
  },
});
droptables.define('forge_flame_guardian', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 1200, max: 3600 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

// --- Room 4: The Forge Dragon (Final Boss) ---

npcs.defineNpc('forge_dragon_veldrak', {
  name: 'Veldrak, the Forge Dragon',
  combat: 520,
  maxHp: 850,
  maxHit: 58,
  stats: { attack: 290, strength: 280, defence: 300 },
  attackSpeed: 5,
  attackRange: 10,
  attackStyle: 'magic',
  size: 6,
  aggressive: true,
  aggroRange: 20,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'The master of the forge. A dragon so old its scales have fused with molten metal. Its breath is liquid fire.',
  weakness: 'stab',
  tags: ['raid', 'dragon_forge', 'dragon', 'boss', 'armoured'],
  resistance: 'magic',
  raidRoom: 'forge_boss',
  phases: [
    {
      name: 'Phase 1: Dragonfire',
      hpRange: [1.0, 0.70],
      description: 'Veldrak breathes fire across the arena. Must stand behind pillars or use anti-dragon shields. Alternates melee swipes with dragonfire breath.',
      attackStyles: ['melee', 'magic'],
      specialAttack: {
        name: 'Dragonfire Breath',
        description: 'Breathes fire in a 60-degree cone for 60 damage. Anti-dragon shield reduces to 15. Pillars block completely.',
        coneDamage: 60,
        shieldReduction: 15,
        coneAngle: 60,
        tickInterval: 10,
      },
    },
    {
      name: 'Phase 2: Forge Phase',
      hpRange: [0.70, 0.40],
      description: 'Veldrak lands on the forge. Players must use the Forge Ingots they collected to smith weapons at 3 anvils while Veldrak attacks. The weapon you forge determines your eligible unique drop.',
      smithingReq: 70,
      forgeOptions: [
        { weapon: 'lance', resultDrop: 96003, description: 'Forge a lance frame -- eligible for Dragonfire lance' },
        { weapon: 'hammer', resultDrop: 96004, description: 'Forge a hammer head -- eligible for Dragon forge hammer' },
        { weapon: 'visage', resultDrop: 96005, description: 'Forge a shield plate -- eligible for Dragon visage' },
      ],
      specialAttack: {
        name: 'Molten Slam',
        description: 'Slams a wing on one half of the arena. 50 damage. Switch sides.',
        damage: 50,
        areaPercent: 0.5,
        tickInterval: 12,
      },
    },
    {
      name: 'Phase 3: Enrage',
      hpRange: [0.40, 0.0],
      description: 'Veldrak enrages. Continuous dragonfire AoE on the ground. Attack speed +1. Max hit rises to 72. Must burn down quickly.',
      maxHitOverride: 72,
      attackSpeedOverride: 4,
      groundFireDamage: 8,
      groundFireTickInterval: 2,
    },
  ],
});

// Drop tables

droptables.define('dragon_forge_standard', {
  always: [
    { id: 107, name: 'Dragon bones', min: 5, max: 15 },
    { id: 96007, name: 'Forge ingot', min: 2, max: 5 },
  ],
  main: [
    { id: 101, name: 'Coins', weight: 7, min: 30000, max: 100000 },
    { id: 2116, name: 'Runite bar', weight: 4, min: 5, max: 15 },
    { id: 11358, name: 'Blood rune', weight: 4, min: 100, max: 300 },
    { id: 11363, name: 'Soul rune', weight: 3, min: 60, max: 150 },
    { id: 0, name: 'Nothing', weight: 3, min: 0, max: 0 },
  ],
  tertiary: [],
});

// Pet: Forge Whelp
items.define({
  id: 84001,
  name: 'Forge Whelp',
  examine: 'A baby dragon born in molten metal. It sneezes sparks and chews on iron bars.',
  value: 0,
  category: 'pet',
  tradeable: false,
  weight: 0,
});

droptables.define('forge_dragon_veldrak', {
  always: [
    { id: 107, name: 'Dragon bones', min: 10, max: 25 },
  ],
  main: [
    { id: 101, name: 'Coins', weight: 6, min: 60000, max: 200000 },
    { id: 96007, name: 'Forge ingot', weight: 4, min: 5, max: 12 },
    { id: 2116, name: 'Runite bar', weight: 3, min: 8, max: 20 },
    { id: 0, name: 'Nothing', weight: 2, min: 0, max: 0 },
  ],
  tertiary: [
    { id: 96003, name: 'Dragonfire lance', chance: 100, min: 1, max: 1 },
    { id: 96004, name: 'Dragon forge hammer', chance: 150, min: 1, max: 1 },
    { id: 96005, name: 'Dragon visage', chance: 80, min: 1, max: 1 },
    { id: 84001, name: 'Forge Whelp', chance: 1500, min: 1, max: 1 }, // v0.9-waveB4 H14: rate /2
  ],
});

const DRAGON_FORGE = {
  id: 'dragon_forge',
  name: 'The Dragon Forge',
  shortName: 'Forge',
  description: 'Enter Veldrak\'s abandoned forge in the Glass Desert. Gather materials from deadly rooms, smith a weapon mid-raid, and fight the Forge Dragon itself. The weapon you forge determines what unique you can receive.',
  location: 'Glass Desert, Veldrak\'s Forge',
  region: 'glass_desert',
  minPlayers: 3,
  maxPlayers: 5,
  estimatedTime: { min: 35, max: 55, unit: 'minutes' },
  requirements: {
    combat: 100,
    skills: { smithing: 70 },
    quests: [],
    recommended: { combat: 115, skills: { smithing: 85, prayer: 77 } },
  },
  rooms: [
    { id: 'forge_ore_vein', name: 'Ore Veins', type: 'gather_combat', bosses: ['forge_ore_golem'], mechanic: 'gatherIngots', description: 'Mine ore veins while fighting golems. Collect Forge Ingots for the assembly room.' },
    { id: 'forge_graveyard', name: 'Dragon Graveyard', type: 'combat', bosses: ['forge_skeletal_dragon'], mechanic: 'harvestBones', description: 'Fight skeletal dragons and harvest their bones for smithing flux.' },
    { id: 'forge_flame_chamber', name: 'Flame Chamber', type: 'combat', bosses: ['forge_flame_guardian'], mechanic: 'surviveHeat', description: 'Navigate a chamber of living flame. Heat damage accumulates.' },
    { id: 'forge_boss', name: 'The Forge Dragon', type: 'boss', bosses: ['forge_dragon_veldrak'], mechanic: 'forgeWeapon', description: 'Face Veldrak. Mid-fight, smith your chosen weapon at the forge.' },
  ],
};


// ══════════════════════════════════════════════════════════════════════════════
// RAID 18: THE COLOSSEUM
// Solo, 12 waves of increasing difficulty + Champion boss.
// Can quit after any wave for partial rewards. Die = nothing.
// ══════════════════════════════════════════════════════════════════════════════

// ---------- Dizana's quiver ----------
// BIS ranged cape. Bolt proc boost makes crossbows significantly better.
// Trade-off: no prayer bonus (Ava's gives prayer). Pure DPS choice.
items.define({
  id: 96008,
  name: "Dizana's quiver",
  examine: 'A divine quiver blessed by Dizana, goddess of the hunt. Bolts seem to find their mark by divine will.',
  value: 40000000,
  category: 'armour',
  equipSlot: 'cape',
  stats: {
    ranged: 8, ranged_strength: 4,
    def_stab: 6, def_slash: 6, def_crush: 6,
    def_magic: 6, def_ranged: 6,
  },
  equipReqs: { ranged: 80 },
  passiveEffect: {
    name: 'Divine Guidance',
    description: '+10% bolt special effect proc chance. Ava\'s effect (retrieves ammo). BIS ranged cape.',
    boltProcBonus: 0.10,
    ammoRetrieval: true,
  },
});

// ---------- Sunfire fanatic helm ----------
items.define({
  id: 96009,
  name: 'Sunfire fanatic helm',
  examine: 'A helm forged in the sacred sunfire of the Colosseum. Burns with righteous heat. Melee and prayer in harmony.',
  value: 15000000,
  category: 'armour',
  equipSlot: 'head',
  stats: {
    def_stab: 52, def_slash: 55, def_crush: 48,
    def_magic: -4, def_ranged: 50,
    melee_strength: 3, prayer: 6,
  },
  equipReqs: { defence: 75, prayer: 65 },
  setId: 'sunfire_fanatic',
});

// ---------- Sunfire fanatic cuirass ----------
items.define({
  id: 96010,
  name: 'Sunfire fanatic cuirass',
  examine: 'A breastplate of sunfire steel. Its warmth sustains the wearer\'s faith.',
  value: 30000000,
  category: 'armour',
  equipSlot: 'body',
  stats: {
    def_stab: 115, def_slash: 120, def_crush: 110,
    def_magic: -10, def_ranged: 118,
    melee_strength: 6, prayer: 8,
  },
  equipReqs: { defence: 75, prayer: 65 },
  setId: 'sunfire_fanatic',
});

// ---------- Sunfire fanatic greaves ----------
items.define({
  id: 96011,
  name: 'Sunfire fanatic greaves',
  examine: 'Greaves of sunfire steel. Each step leaves a faint glow.',
  value: 20000000,
  category: 'armour',
  equipSlot: 'legs',
  stats: {
    def_stab: 72, def_slash: 76, def_crush: 68,
    def_magic: -8, def_ranged: 74,
    melee_strength: 4, prayer: 7,
  },
  equipReqs: { defence: 75, prayer: 65 },
  setId: 'sunfire_fanatic',
  setEffect: {
    name: 'Sunfire Devotion',
    pieces: ['sunfire_fanatic_helm', 'sunfire_fanatic_cuirass', 'sunfire_fanatic_greaves'],
    description: 'Full set: prayer drain rate reduced by 33%. Melee attacks have a 10% chance to restore 2 prayer points.',
    prayerDrainReduction: 0.33,
    meleeHitPrayerRestoreChance: 0.10,
    meleeHitPrayerRestore: 2,
  },
});

// --- Colosseum wave NPCs (representative waves) ---

npcs.defineNpc('colosseum_gladiator', {
  name: 'Colosseum Gladiator',
  combat: 150,
  maxHp: 120,
  maxHit: 18,
  stats: { attack: 100, strength: 95, defence: 90 },
  attackSpeed: 4,
  attackRange: 1,
  attackStyle: 'melee',
  size: 1,
  aggressive: true,
  aggroRange: 8,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A Colosseum fighter. Skilled and relentless.',
  weakness: 'stab',
  tags: ['raid', 'colosseum', 'humanoid'],
  raidRoom: 'colosseum_early',
});
droptables.define('colosseum_gladiator', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 600, max: 1800 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

npcs.defineNpc('colosseum_beast', {
  name: 'Colosseum Manticore',
  combat: 280,
  maxHp: 300,
  maxHit: 32,
  stats: { attack: 180, strength: 170, defence: 140 },
  attackSpeed: 4,
  attackRange: 4,
  attackStyle: 'ranged',
  size: 3,
  aggressive: true,
  aggroRange: 10,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A beast captured for the Colosseum. Part lion, part scorpion, all danger.',
  weakness: 'magic',
  tags: ['raid', 'colosseum', 'beast'],
  raidRoom: 'colosseum_mid',
  specialAttack: {
    name: 'Tail Sting',
    description: 'Scorpion tail strike that poisons for 8 damage per tick for 5 ticks.',
    poisonDamage: 8,
    poisonDuration: 5,
    tickInterval: 10,
  },
});
droptables.define('colosseum_beast', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 1120, max: 3360 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

npcs.defineNpc('colosseum_shieldbearer', {
  name: 'Colosseum Shieldbearer',
  combat: 320,
  maxHp: 350,
  maxHit: 28,
  stats: { attack: 160, strength: 140, defence: 260 },
  attackSpeed: 5,
  attackRange: 1,
  attackStyle: 'melee',
  size: 2,
  aggressive: true,
  aggroRange: 6,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A heavily armoured Colosseum defender. Breaking through his guard requires patience.',
  weakness: 'crush',
  tags: ['raid', 'colosseum', 'humanoid', 'armoured'],
  resistance: 'ranged',
  raidRoom: 'colosseum_late',
});
droptables.define('colosseum_shieldbearer', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 1280, max: 3840 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

npcs.defineNpc('colosseum_mage', {
  name: 'Colosseum Warlock',
  combat: 340,
  maxHp: 280,
  maxHit: 38,
  stats: { attack: 200, strength: 100, defence: 160 },
  attackSpeed: 4,
  attackRange: 10,
  attackStyle: 'magic',
  size: 1,
  aggressive: true,
  aggroRange: 12,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A dark warlock forced to fight in the Colosseum. Fires devastating spells from range.',
  weakness: 'ranged',
  tags: ['raid', 'colosseum', 'humanoid', 'mage'],
  resistance: 'magic',
  raidRoom: 'colosseum_late',
});
droptables.define('colosseum_mage', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 1360, max: 4080 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

// --- Final Boss: The Champion of Aelgard ---

npcs.defineNpc('colosseum_champion', {
  name: 'The Champion of Aelgard',
  combat: 550,
  maxHp: 900,
  maxHit: 62,
  stats: { attack: 300, strength: 290, defence: 280 },
  attackSpeed: 4,
  attackRange: 1,
  attackStyle: 'melee',
  size: 3,
  aggressive: true,
  aggroRange: 10,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'The undefeated champion of the Colosseum. He has never fallen. You are next.',
  weakness: 'slash',
  tags: ['raid', 'colosseum', 'boss', 'humanoid', 'champion'],
  raidRoom: 'colosseum_champion',
  phases: [
    {
      name: 'Phase 1: Warrior',
      hpRange: [1.0, 0.75],
      description: 'The Champion fights with a sword and shield. Pray melee. Periodically shield-bashes (stuns for 3 ticks, 30 damage).',
      attackStyle: 'melee',
      correctPrayer: 'protect_from_melee',
      specialAttack: {
        name: 'Shield Bash',
        description: 'Bashes the player, stunning them for 3 ticks and dealing 30 damage.',
        stunDuration: 3,
        damage: 30,
        tickInterval: 12,
      },
    },
    {
      name: 'Phase 2: Berserker',
      hpRange: [0.75, 0.50],
      description: 'Throws his shield away. Dual-wields swords. Attack speed +2. No longer stunnable. Pray melee. Combo attacks that hit twice.',
      attackStyle: 'melee',
      correctPrayer: 'protect_from_melee',
      attackSpeedOverride: 2,
      comboHits: 2,
      maxHitOverride: 45,
    },
    {
      name: 'Phase 3: Arena Master',
      hpRange: [0.50, 0.25],
      description: 'Picks up a javelin and switches to ranged. Pray ranged. Arena traps activate -- spikes emerge from the floor every 8 ticks in random 3x3 areas.',
      attackStyle: 'ranged',
      correctPrayer: 'protect_from_missiles',
      attackRange: 8,
      maxHitOverride: 52,
      arenaTrap: {
        name: 'Floor Spikes',
        description: 'Spikes emerge from 3x3 floor tiles. 40 damage if standing on them.',
        aoeSize: 3,
        damage: 40,
        tickInterval: 8,
      },
    },
    {
      name: 'Phase 4: True Champion',
      hpRange: [0.25, 0.0],
      description: 'Enraged. Cycles all combat styles every 3 ticks. Attack speed 2. Max hit 70. The ultimate test of prayer switching and movement.',
      cycleInterval: 3,
      attackStyles: ['melee', 'ranged', 'magic'],
      correctPrayers: ['protect_from_melee', 'protect_from_missiles', 'protect_from_magic'],
      attackSpeedOverride: 2,
      maxHitOverride: 70,
      arenaTrap: {
        name: 'Champion\'s Fury',
        description: 'Entire arena edge becomes lethal. 50 damage/tick. Fighting space shrinks to 5x5.',
        edgeDamage: 50,
        safeAreaSize: 5,
      },
    },
  ],
});

// Drop tables

droptables.define('colosseum_standard', {
  always: [],
  main: [
    { id: 101, name: 'Coins', weight: 8, min: 15000, max: 60000 },
    { id: 11357, name: 'Death rune', weight: 5, min: 100, max: 300 },
    { id: 11358, name: 'Blood rune', weight: 4, min: 80, max: 200 },
    { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 },
  ],
  tertiary: [],
});

// Pet: Champion's Squire
items.define({
  id: 84002,
  name: "Champion's Squire",
  examine: 'A tiny armoured figure who follows you around, practicing sword swings on thin air. Occasionally trips over its own feet.',
  value: 0,
  category: 'pet',
  tradeable: false,
  weight: 0,
});

droptables.define('colosseum_champion', {
  always: [],
  main: [
    { id: 101, name: 'Coins', weight: 5, min: 80000, max: 250000 },
    { id: 11363, name: 'Soul rune', weight: 4, min: 100, max: 250 },
    { id: 11364, name: 'Wrath rune', weight: 3, min: 50, max: 120 },
    { id: 0, name: 'Nothing', weight: 2, min: 0, max: 0 },
  ],
  tertiary: [
    { id: 96008, name: "Dizana's quiver", chance: 100, min: 1, max: 1 },
    { id: 96009, name: 'Sunfire fanatic helm', chance: 150, min: 1, max: 1 },
    { id: 96010, name: 'Sunfire fanatic cuirass', chance: 200, min: 1, max: 1 },
    { id: 96011, name: 'Sunfire fanatic greaves', chance: 175, min: 1, max: 1 },
    { id: 84002, name: "Champion's Squire", chance: 4000, min: 1, max: 1 },
  ],
});

const COLOSSEUM = {
  id: 'colosseum',
  name: 'The Colosseum',
  shortName: 'Colo',
  description: 'A gladiatorial arena in the Glass Desert. 12 waves of increasing difficulty. Quit after any wave for partial rewards, or risk it all for the Champion\'s hoard. Death means you leave with nothing.',
  location: 'Glass Desert, The Grand Colosseum',
  region: 'glass_desert',
  minPlayers: 1,
  maxPlayers: 1,
  estimatedTime: { min: 30, max: 50, unit: 'minutes' },
  requirements: {
    combat: 95,
    skills: {},
    quests: [],
    recommended: { combat: 120, skills: { prayer: 77 } },
  },
  waveSystem: {
    totalWaves: 12,
    canQuitAfterWave: true,
    deathPenalty: 'lose_all_rewards',
    waveModifiers: [
      { wave: 4, modifier: 'Monsters have +10% accuracy' },
      { wave: 6, modifier: 'Prayer drain doubled' },
      { wave: 8, modifier: 'No food drops from monsters' },
      { wave: 10, modifier: 'Monster max hit +20%' },
      { wave: 12, modifier: 'The Champion of Aelgard appears' },
    ],
    partialRewardScaling: {
      wave4: 0.15,
      wave8: 0.40,
      wave12: 1.0,
    },
  },
};


// ##############################################################################
//
//   THE WILDS RAIDS (3)
//
//   Raids 19-21. PvP-enabled wilderness raids.
//   Maximum risk, maximum reward.
//
// ##############################################################################


// ══════════════════════════════════════════════════════════════════════════════
// RAID 19: REVENANT CAVES RAID
// 3-5 players, PvP-enabled raid.
// Fight through 6 rooms of revenants. Other players can attack you.
// ══════════════════════════════════════════════════════════════════════════════

// ---------- Craw's bow ----------
// BIS ranged weapon in the wilderness. Charges with ether.
// +50% accuracy and +50% damage in wilderness. Mediocre outside.
items.define({
  id: 96012,
  name: "Craw's bow",
  examine: 'A bow imbued with the spirit of the revenant hunter Craw. It grows powerful in the Wilderness.',
  value: 20000000,
  category: 'weapon',
  equipSlot: 'weapon',
  twoHanded: true,
  speed: 5,
  stats: { ranged: 75 },
  equipReqs: { ranged: 60 },
  passiveEffect: {
    name: 'Wilderness Power',
    description: '+50% accuracy and +50% damage while in the Wilderness. Requires revenant ether charges.',
    wildernessAccuracyBonus: 0.50,
    wildernessDamageBonus: 0.50,
    chargeItem: 'revenant_ether',
    chargesPerAttack: 1,
  },
});

// ---------- Viggora's chainmace ----------
// BIS melee weapon in the wilderness. Same ether charge mechanic.
items.define({
  id: 96013,
  name: "Viggora's chainmace",
  examine: 'A chainmace infused with the spirit of the revenant warrior Viggora. The wilderness fuels its rage.',
  value: 18000000,
  category: 'weapon',
  equipSlot: 'weapon',
  speed: 4,
  stats: { crush: 68, melee_strength: 65 },
  equipReqs: { attack: 60 },
  passiveEffect: {
    name: 'Wilderness Fury',
    description: '+50% accuracy and +50% damage while in the Wilderness. Requires revenant ether charges.',
    wildernessAccuracyBonus: 0.50,
    wildernessDamageBonus: 0.50,
    chargeItem: 'revenant_ether',
    chargesPerAttack: 1,
  },
});

// ---------- Thammaron's sceptre ----------
// BIS magic weapon in the wilderness. Same ether charge mechanic.
items.define({
  id: 96014,
  name: "Thammaron's sceptre",
  examine: 'A sceptre bearing the power of the revenant mage Thammaron. In the Wilderness, its magic is unmatched.',
  value: 16000000,
  category: 'weapon',
  equipSlot: 'weapon',
  speed: 4,
  stats: { magic: 22, magic_strength: 15 },
  equipReqs: { magic: 60 },
  passiveEffect: {
    name: 'Wilderness Dominion',
    description: '+50% accuracy and +50% damage while in the Wilderness. Requires revenant ether charges.',
    wildernessAccuracyBonus: 0.50,
    wildernessDamageBonus: 0.50,
    chargeItem: 'revenant_ether',
    chargesPerAttack: 1,
  },
});

// ---------- Revenant ether ----------
items.define({
  id: 96015,
  name: 'Revenant ether',
  examine: 'Ghostly energy extracted from slain revenants. Used to charge wilderness weapons.',
  value: 200,
  category: 'ammo',
  tradeable: true,
  stackable: true,
  weight: 0,
});

// --- Revenant NPCs ---

npcs.defineNpc('rev_imp', {
  name: 'Revenant Imp',
  combat: 120,
  maxHp: 80,
  maxHit: 14,
  stats: { attack: 70, strength: 60, defence: 50 },
  attackSpeed: 4,
  attackRange: 6,
  attackStyle: 'magic',
  size: 1,
  aggressive: true,
  aggroRange: 8,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'The ghost of a long-dead imp. It hurls ethereal bolts.',
  weakness: 'melee',
  tags: ['raid', 'revenant_caves', 'revenant', 'undead'],
  raidRoom: 'rev_room_1',
});
droptables.define('rev_imp', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 480, max: 1440 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

npcs.defineNpc('rev_cyclops', {
  name: 'Revenant Cyclops',
  combat: 220,
  maxHp: 200,
  maxHit: 26,
  stats: { attack: 140, strength: 150, defence: 120 },
  attackSpeed: 5,
  attackRange: 1,
  attackStyle: 'melee',
  size: 2,
  aggressive: true,
  aggroRange: 6,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'The ghost of a cyclops. Its ethereal fist still hits hard.',
  weakness: 'magic',
  tags: ['raid', 'revenant_caves', 'revenant', 'undead'],
  raidRoom: 'rev_room_3',
});
droptables.define('rev_cyclops', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 880, max: 2640 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

npcs.defineNpc('rev_dragon', {
  name: 'Revenant Dragon',
  combat: 350,
  maxHp: 400,
  maxHit: 40,
  stats: { attack: 200, strength: 190, defence: 180 },
  attackSpeed: 5,
  attackRange: 6,
  attackStyle: 'magic',
  size: 4,
  aggressive: true,
  aggroRange: 12,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'The ghost of a great dragon. Its spectral fire burns the soul.',
  weakness: 'ranged',
  tags: ['raid', 'revenant_caves', 'revenant', 'undead', 'dragon'],
  raidRoom: 'rev_room_5',
  specialAttack: {
    name: 'Spectral Flame',
    description: 'Breathes ghostly fire in a 3x3 area. 35 damage. Drains 10 prayer points.',
    damage: 35,
    prayerDrain: 10,
    aoeSize: 3,
    tickInterval: 10,
  },
});
droptables.define('rev_dragon', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 1400, max: 4200 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

// --- Boss: Revenant Maledictus ---

npcs.defineNpc('rev_maledictus', {
  name: 'Revenant Maledictus',
  combat: 460,
  maxHp: 650,
  maxHit: 52,
  stats: { attack: 260, strength: 240, defence: 220 },
  attackSpeed: 4,
  attackRange: 8,
  attackStyle: 'magic',
  size: 4,
  aggressive: true,
  aggroRange: 15,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'The revenant king. A spirit so powerful it bends the ether of the wilderness to its will.',
  weakness: 'crush',
  tags: ['raid', 'revenant_caves', 'revenant', 'undead', 'boss'],
  raidRoom: 'rev_boss',
  phases: [
    {
      name: 'Phase 1: Spectral',
      hpRange: [1.0, 0.60],
      description: 'Maledictus alternates magic and ranged attacks. Must prayer switch. Summons revenant minions every 12 ticks.',
      attackStyles: ['magic', 'ranged'],
      spawnInterval: 12,
      spawnDefIds: ['rev_imp', 'rev_cyclops'],
      spawnCount: 2,
    },
    {
      name: 'Phase 2: Ethereal Storm',
      hpRange: [0.60, 0.30],
      description: 'Maledictus becomes semi-transparent (50% damage reduction for 5 ticks, then vulnerable for 5 ticks, cycling). Ether bombs rain from the sky.',
      damageReductionCycle: { protected: 5, vulnerable: 5, reduction: 0.50 },
      specialAttack: {
        name: 'Ether Bomb',
        description: '3 ether bombs target random tiles. 2x2 AoE, 40 damage each. 2-tick fuse.',
        bombCount: 3,
        aoeSize: 2,
        damage: 40,
        fuseTime: 2,
        tickInterval: 8,
      },
    },
    {
      name: 'Phase 3: Wrath',
      hpRange: [0.30, 0.0],
      description: 'Fully corporeal. Attack speed +1. Max hit 65. Drains prayer on every hit (3 points). No minion spawns -- pure DPS race.',
      attackSpeedOverride: 3,
      maxHitOverride: 65,
      prayerDrainPerHit: 3,
    },
  ],
});

// Drop tables

// Pet: Ghostly Wisp
items.define({
  id: 84003,
  name: 'Ghostly Wisp',
  examine: 'A harmless ball of ether that orbits your head. Sometimes whispers the names of the dead.',
  value: 0,
  category: 'pet',
  tradeable: false,
  weight: 0,
});

droptables.define('rev_maledictus', {
  always: [
    { id: 96015, name: 'Revenant ether', min: 50, max: 150 },
  ],
  main: [
    { id: 101, name: 'Coins', weight: 6, min: 40000, max: 150000 },
    { id: 96015, name: 'Revenant ether', weight: 5, min: 100, max: 300 },
    { id: 11358, name: 'Blood rune', weight: 4, min: 100, max: 250 },
    { id: 0, name: 'Nothing', weight: 2, min: 0, max: 0 },
  ],
  tertiary: [
    { id: 96012, name: "Craw's bow", chance: 120, min: 1, max: 1 },
    { id: 96013, name: "Viggora's chainmace", chance: 120, min: 1, max: 1 },
    { id: 96014, name: "Thammaron's sceptre", chance: 120, min: 1, max: 1 },
    { id: 84003, name: 'Ghostly Wisp', chance: 3500, min: 1, max: 1 },
  ],
});

const REVENANT_CAVES_RAID = {
  id: 'revenant_caves_raid',
  name: 'Revenant Caves Raid',
  shortName: 'RevCaves',
  description: 'Fight through 6 rooms of increasingly powerful revenants in the Wilderness. PvP is enabled throughout. Other players may attack you at any time. Maximum risk, maximum reward.',
  location: 'The Wilds, Revenant Caves',
  region: 'the_wilds',
  minPlayers: 3,
  maxPlayers: 5,
  pvpEnabled: true,
  estimatedTime: { min: 20, max: 35, unit: 'minutes' },
  requirements: {
    combat: 80,
    skills: {},
    quests: [],
    recommended: { combat: 110 },
  },
};


// ══════════════════════════════════════════════════════════════════════════════
// RAID 20: THE WILDERNESS FORTRESS
// 8-20 players, siege raid. Assault a chaos fortress.
// Breach 3 walls, kill 3 commanders, destroy the core.
// ══════════════════════════════════════════════════════════════════════════════

// ---------- Fortress plate ----------
// BIS tank body armour. Massive melee defence but negative magic.
// Trades offensive stats for raw tanking power.
items.define({
  id: 96016,
  name: 'Fortress plate',
  examine: 'Armour forged from the walls of the Wilderness Fortress. Nearly impenetrable but impossibly heavy.',
  value: 35000000,
  category: 'armour',
  equipSlot: 'body',
  stats: {
    def_stab: 145, def_slash: 148, def_crush: 140,
    def_magic: -22, def_ranged: 150,
    melee_strength: 0, prayer: 2,
    stab: -8, slash: -8, crush: -8,
    ranged: -10, magic: -15,
  },
  equipReqs: { defence: 80 },
});

// ---------- War banner ----------
// 2H weapon that buffs nearby allies. +5% accuracy and damage to all
// allies within 4 tiles. The wielder cannot attack while holding it.
items.define({
  id: 96017,
  name: 'War banner',
  examine: 'A massive battle standard. Those who fight near it are inspired to greater feats. The bearer cannot attack.',
  value: 20000000,
  category: 'weapon',
  equipSlot: 'weapon',
  twoHanded: true,
  speed: 0,
  stats: {
    def_stab: 50, def_slash: 50, def_crush: 50,
    def_magic: 20, def_ranged: 50,
  },
  equipReqs: { attack: 70, defence: 70 },
  passiveEffect: {
    name: 'Rally',
    description: 'Cannot attack. All allies within 4 tiles gain +5% accuracy and +5% damage. Stacks with prayers.',
    cannotAttack: true,
    allyBuffRange: 4,
    allyAccuracyBonus: 0.05,
    allyDamageBonus: 0.05,
  },
});

// --- Fortress NPCs ---

npcs.defineNpc('fortress_gatekeeper', {
  name: 'Chaos Gatekeeper',
  combat: 250,
  maxHp: 320,
  maxHit: 30,
  stats: { attack: 160, strength: 170, defence: 200 },
  attackSpeed: 5,
  attackRange: 1,
  attackStyle: 'melee',
  size: 2,
  aggressive: true,
  aggroRange: 8,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A massive chaos warrior guarding the outer gate. His armour is forged from dark iron.',
  weakness: 'magic',
  tags: ['raid', 'wilderness_fortress', 'chaos', 'humanoid', 'armoured'],
  resistance: 'melee',
  raidRoom: 'fortress_gate',
});
droptables.define('fortress_gatekeeper', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 1000, max: 3000 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

npcs.defineNpc('fortress_archer', {
  name: 'Chaos Archer',
  combat: 200,
  maxHp: 180,
  maxHit: 24,
  stats: { attack: 150, strength: 80, defence: 120 },
  attackSpeed: 3,
  attackRange: 10,
  attackStyle: 'ranged',
  size: 1,
  aggressive: true,
  aggroRange: 15,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A chaos archer on the fortress walls. Fires rapidly from cover.',
  weakness: 'magic',
  tags: ['raid', 'wilderness_fortress', 'chaos', 'humanoid'],
  raidRoom: 'fortress_walls',
});
droptables.define('fortress_archer', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 800, max: 2400 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

npcs.defineNpc('fortress_commander_melee', {
  name: 'Commander Kragg',
  combat: 380,
  maxHp: 500,
  maxHit: 44,
  stats: { attack: 220, strength: 230, defence: 210 },
  attackSpeed: 4,
  attackRange: 1,
  attackStyle: 'melee',
  size: 3,
  aggressive: true,
  aggroRange: 10,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'The first commander of the fortress. A brute who crushes his enemies with an iron maul.',
  weakness: 'magic',
  tags: ['raid', 'wilderness_fortress', 'chaos', 'boss', 'humanoid'],
  resistance: 'melee',
  raidRoom: 'fortress_courtyard',
  phases: [
    {
      name: 'Phase 1',
      hpRange: [1.0, 0.50],
      description: 'Commander Kragg attacks with devastating melee. Pray melee. Periodically charges across the courtyard for 50 damage.',
      correctPrayer: 'protect_from_melee',
      specialAttack: {
        name: 'Berserker Charge',
        description: 'Charges in a line. 50 damage on contact. Creates rubble where he stops.',
        damage: 50,
        tickInterval: 15,
      },
    },
    {
      name: 'Phase 2: Enrage',
      hpRange: [0.50, 0.0],
      description: 'Kragg rips off his armour. Defence drops by 40% but attack speed +2 and max hit rises to 56.',
      defenceMultiplier: 0.60,
      attackSpeedOverride: 2,
      maxHitOverride: 56,
    },
  ],
});
droptables.define('fortress_commander_melee', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 1520, max: 4560 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

npcs.defineNpc('fortress_commander_ranged', {
  name: 'Commander Vex',
  combat: 360,
  maxHp: 450,
  maxHit: 38,
  stats: { attack: 200, strength: 100, defence: 180 },
  attackSpeed: 3,
  attackRange: 12,
  attackStyle: 'ranged',
  size: 2,
  aggressive: true,
  aggroRange: 15,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'The second commander. A sharpshooter who never misses from the battlements.',
  weakness: 'melee',
  tags: ['raid', 'wilderness_fortress', 'chaos', 'boss', 'humanoid'],
  resistance: 'ranged',
  raidRoom: 'fortress_battlements',
  phases: [
    {
      name: 'Phase 1',
      hpRange: [1.0, 0.50],
      description: 'Commander Vex fires from the battlements. Pray ranged. Calls reinforcement archers every 10 ticks.',
      correctPrayer: 'protect_from_missiles',
      spawnInterval: 10,
      spawnDefId: 'fortress_archer',
      spawnCount: 2,
    },
    {
      name: 'Phase 2: Barrage',
      hpRange: [0.50, 0.0],
      description: 'Vex fires a volley of 5 arrows at once, hitting a 3x3 area. Must keep moving.',
      specialAttack: {
        name: 'Arrow Volley',
        description: '5 arrows strike a 3x3 area. 35 damage each. Fires every 6 ticks.',
        arrowCount: 5,
        aoeSize: 3,
        damage: 35,
        tickInterval: 6,
      },
    },
  ],
});
droptables.define('fortress_commander_ranged', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 1440, max: 4320 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

npcs.defineNpc('fortress_commander_mage', {
  name: 'Commander Morvath',
  combat: 400,
  maxHp: 480,
  maxHit: 46,
  stats: { attack: 240, strength: 120, defence: 200 },
  attackSpeed: 4,
  attackRange: 10,
  attackStyle: 'magic',
  size: 2,
  aggressive: true,
  aggroRange: 12,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'The third commander. A chaos mage whose spells tear reality apart.',
  weakness: 'ranged',
  tags: ['raid', 'wilderness_fortress', 'chaos', 'boss', 'humanoid', 'mage'],
  resistance: 'magic',
  raidRoom: 'fortress_inner_keep',
  phases: [
    {
      name: 'Phase 1',
      hpRange: [1.0, 0.40],
      description: 'Morvath casts chaos magic. Pray magic. Teleports to a random location every 15 ticks. Leaves a chaos portal at his old location (20 damage if walked over).',
      correctPrayer: 'protect_from_magic',
      teleportInterval: 15,
      portalDamage: 20,
    },
    {
      name: 'Phase 2: Ritual',
      hpRange: [0.40, 0.0],
      description: 'Morvath begins a summoning ritual. Must be interrupted by dealing 100 damage in 8 ticks or he summons a Chaos Demon (combat 300).',
      ritualHpThreshold: 100,
      ritualWindow: 8,
      failSpawnDefId: 'fortress_chaos_demon',
      maxHitOverride: 55,
    },
  ],
});
droptables.define('fortress_commander_mage', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 1600, max: 4800 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

npcs.defineNpc('fortress_chaos_demon', {
  name: 'Chaos Demon',
  combat: 300,
  maxHp: 350,
  maxHit: 35,
  stats: { attack: 180, strength: 190, defence: 140 },
  attackSpeed: 4,
  attackRange: 1,
  attackStyle: 'melee',
  size: 3,
  aggressive: true,
  aggroRange: 10,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A demon summoned by Commander Morvath. It shouldn\'t be here.',
  weakness: 'slash',
  tags: ['raid', 'wilderness_fortress', 'demon'],
  raidRoom: 'fortress_inner_keep',
});
droptables.define('fortress_chaos_demon', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 1200, max: 3600 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

// --- Fortress Core ---

npcs.defineNpc('fortress_core', {
  name: 'Chaos Core',
  combat: 0,
  maxHp: 600,
  maxHit: 0,
  stats: { attack: 0, strength: 0, defence: 250 },
  attackSpeed: 0,
  attackRange: 0,
  attackStyle: 'none',
  size: 3,
  aggressive: false,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'The heart of the fortress. Destroy it to end the chaos. Regenerates HP if all three commanders are not killed first.',
  weakness: 'crush',
  tags: ['raid', 'wilderness_fortress', 'construct'],
  raidRoom: 'fortress_core',
  raidMechanic: 'Regenerates 30 HP/tick unless all 3 commanders are dead. Must be destroyed to complete the raid.',
});

// Drop tables

// Pet: Siege Ram
items.define({
  id: 84004,
  name: 'Siege Ram',
  examine: 'A tiny battering ram on wheels that follows you. It occasionally charges at doors and walls for no reason.',
  value: 0,
  category: 'pet',
  tradeable: false,
  weight: 0,
});

droptables.define('fortress_core', {
  always: [],
  main: [
    { id: 101, name: 'Coins', weight: 6, min: 50000, max: 200000 },
    { id: 11358, name: 'Blood rune', weight: 4, min: 150, max: 400 },
    { id: 11363, name: 'Soul rune', weight: 3, min: 80, max: 200 },
    { id: 2116, name: 'Runite bar', weight: 3, min: 5, max: 15 },
    { id: 0, name: 'Nothing', weight: 2, min: 0, max: 0 },
  ],
  tertiary: [
    { id: 96016, name: 'Fortress plate', chance: 200, min: 1, max: 1 },
    { id: 96017, name: 'War banner', chance: 150, min: 1, max: 1 },
    { id: 84004, name: 'Siege Ram', chance: 5000, min: 1, max: 1 },
  ],
});

const WILDERNESS_FORTRESS = {
  id: 'wilderness_fortress',
  name: 'The Wilderness Fortress',
  shortName: 'WildFort',
  description: 'A massive siege raid in the Wilderness. Assemble 8-20 players and assault a fortress held by chaos warriors. Breach 3 walls, slay 3 commanders, destroy the core. PvP is enabled in the approach.',
  location: 'The Wilds, Northern Fortress',
  region: 'the_wilds',
  minPlayers: 8,
  maxPlayers: 20,
  pvpEnabled: true,
  estimatedTime: { min: 40, max: 70, unit: 'minutes' },
  requirements: {
    combat: 85,
    skills: {},
    quests: [],
    recommended: { combat: 110 },
  },
};


// ══════════════════════════════════════════════════════════════════════════════
// RAID 21: THE ABYSSAL NEXUS
// 4-8 players. Dimensional rift in the wilderness.
// Zero-gravity combat. Gravity changes every 30 seconds.
// ══════════════════════════════════════════════════════════════════════════════

// ---------- Abyssal bludgeon ----------
// BIS crush training weapon. Highest DPS for training strength via crush.
// Special attack: damage scales with missing prayer points.
items.define({
  id: 96018,
  name: 'Abyssal bludgeon',
  examine: 'A weapon pieced together from three abyssal components. Each swing resonates with the power of the Abyss.',
  value: 12000000,
  category: 'weapon',
  equipSlot: 'weapon',
  twoHanded: true,
  speed: 4,
  stats: { crush: 102, melee_strength: 85 },
  equipReqs: { attack: 70, strength: 70 },
  special: {
    cost: 50,
    name: 'Penance',
    description: 'Damage increases by 0.5% for every prayer point below max. At 0 prayer, damage is +49.5%.',
    missingPrayerBonusPerPoint: 0.005,
  },
});

// ---------- Abyssal dagger ----------
// BIS spec weapon for stab. Two quick stab hits in one special attack.
// Mediocre sustained DPS but devastating spec bursts.
items.define({
  id: 96019,
  name: 'Abyssal dagger',
  examine: 'A dagger pulled from the Abyss. Its blade vibrates at a frequency that pierces all known armour.',
  value: 8000000,
  category: 'weapon',
  equipSlot: 'weapon',
  speed: 4,
  stats: { stab: 75, melee_strength: 60 },
  equipReqs: { attack: 70 },
  special: {
    cost: 25,
    name: 'Abyssal Puncture',
    description: 'Two rapid stab hits with 25% increased accuracy each. 25% spec cost means you can spec 4 times.',
    hits: 2,
    accuracyMultiplier: 1.25,
  },
});

// --- Abyssal Nexus NPCs ---

npcs.defineNpc('nexus_drifter', {
  name: 'Abyssal Drifter',
  combat: 180,
  maxHp: 150,
  maxHit: 20,
  stats: { attack: 110, strength: 100, defence: 90 },
  attackSpeed: 4,
  attackRange: 4,
  attackStyle: 'magic',
  size: 2,
  aggressive: true,
  aggroRange: 8,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A creature native to the Abyss. It drifts through zero-gravity with ease.',
  weakness: 'slash',
  tags: ['raid', 'abyssal_nexus', 'abyssal'],
  raidRoom: 'nexus_entry',
});
droptables.define('nexus_drifter', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 720, max: 2160 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

npcs.defineNpc('nexus_leech', {
  name: 'Abyssal Leech',
  combat: 150,
  maxHp: 100,
  maxHit: 15,
  stats: { attack: 90, strength: 80, defence: 60 },
  attackSpeed: 3,
  attackRange: 1,
  attackStyle: 'melee',
  size: 1,
  aggressive: true,
  aggroRange: 10,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A parasitic abyssal creature. It drains prayer points on each hit.',
  weakness: 'crush',
  tags: ['raid', 'abyssal_nexus', 'abyssal'],
  raidRoom: 'nexus_leech_pit',
  prayerDrainPerHit: 3,
});
droptables.define('nexus_leech', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 600, max: 1800 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

npcs.defineNpc('nexus_walker', {
  name: 'Abyssal Walker',
  combat: 240,
  maxHp: 250,
  maxHit: 28,
  stats: { attack: 150, strength: 140, defence: 130 },
  attackSpeed: 4,
  attackRange: 1,
  attackStyle: 'melee',
  size: 2,
  aggressive: true,
  aggroRange: 8,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'An abyssal being that has mastered gravity. It walks on walls and ceilings.',
  weakness: 'magic',
  tags: ['raid', 'abyssal_nexus', 'abyssal'],
  raidRoom: 'nexus_gravity_well',
});
droptables.define('nexus_walker', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 960, max: 2880 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

// --- Boss: The Nexus Warden ---

npcs.defineNpc('nexus_warden', {
  name: 'The Nexus Warden',
  combat: 480,
  maxHp: 720,
  maxHit: 55,
  stats: { attack: 270, strength: 260, defence: 250 },
  attackSpeed: 4,
  attackRange: 8,
  attackStyle: 'magic',
  size: 5,
  aggressive: true,
  aggroRange: 15,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'The guardian of the Abyssal Nexus. It controls gravity itself. Fighting it means fighting the laws of physics.',
  weakness: 'stab',
  tags: ['raid', 'abyssal_nexus', 'abyssal', 'boss'],
  resistance: 'magic',
  raidRoom: 'nexus_boss',
  phases: [
    {
      name: 'Phase 1: Standard Gravity',
      hpRange: [1.0, 0.70],
      description: 'Normal gravity. The Warden attacks with magic and melee. Pray magic at range, melee up close. Spawns abyssal portals that pull players toward them.',
      attackStyles: ['magic', 'melee'],
      specialAttack: {
        name: 'Gravity Well',
        description: 'Creates a portal that pulls players 3 tiles toward it every 2 ticks. Standing on it deals 30 damage/tick.',
        pullDistance: 3,
        pullInterval: 2,
        contactDamage: 30,
        portalDuration: 10,
        tickInterval: 15,
      },
    },
    {
      name: 'Phase 2: Inverted Gravity',
      hpRange: [0.70, 0.40],
      description: 'Gravity inverts. Players are pushed toward arena edges. Movement controls reverse. The Warden attacks from what was the ceiling.',
      movementReverse: true,
      edgeDamage: 20,
      attackStyle: 'ranged',
      correctPrayer: 'protect_from_missiles',
      maxHitOverride: 48,
    },
    {
      name: 'Phase 3: Zero Gravity',
      hpRange: [0.40, 0.0],
      description: 'Zero gravity. All combatants float. Movement becomes 3D. The Warden cycles all styles every 4 ticks. Abyssal vortices orbit the arena.',
      cycleInterval: 4,
      attackStyles: ['magic', 'ranged', 'melee'],
      correctPrayers: ['protect_from_magic', 'protect_from_missiles', 'protect_from_melee'],
      maxHitOverride: 65,
      attackSpeedOverride: 3,
      specialAttack: {
        name: 'Abyssal Vortex',
        description: 'Orbiting vortices that deal 25 damage on contact. 4 vortices, each orbiting at different speeds.',
        vortexCount: 4,
        vortexDamage: 25,
      },
    },
  ],
});

// Drop tables

// Pet: Lil' Rift
items.define({
  id: 84005,
  name: "Lil' Rift",
  examine: 'A tiny dimensional tear that follows you. Objects near it briefly float before crashing back down.',
  value: 0,
  category: 'pet',
  tradeable: false,
  weight: 0,
});

droptables.define('nexus_warden', {
  always: [],
  main: [
    { id: 101, name: 'Coins', weight: 6, min: 35000, max: 120000 },
    { id: 11363, name: 'Soul rune', weight: 4, min: 80, max: 200 },
    { id: 11358, name: 'Blood rune', weight: 4, min: 100, max: 250 },
    { id: 0, name: 'Nothing', weight: 2, min: 0, max: 0 },
  ],
  tertiary: [
    { id: 96018, name: 'Abyssal bludgeon', chance: 150, min: 1, max: 1 },
    { id: 96019, name: 'Abyssal dagger', chance: 100, min: 1, max: 1 },
    { id: 84005, name: "Lil' Rift", chance: 4000, min: 1, max: 1 },
  ],
});

const ABYSSAL_NEXUS = {
  id: 'abyssal_nexus',
  name: 'The Abyssal Nexus',
  shortName: 'Nexus',
  description: 'A dimensional rift in the Wilderness. Fight abyssal creatures in zero-gravity. Gravity changes every 30 seconds -- floor, ceiling, walls rotate. The laws of physics are suggestions.',
  location: 'The Wilds, Abyssal Rift',
  region: 'the_wilds',
  minPlayers: 4,
  maxPlayers: 8,
  pvpEnabled: true,
  estimatedTime: { min: 25, max: 45, unit: 'minutes' },
  requirements: {
    combat: 90,
    skills: {},
    quests: [],
    recommended: { combat: 110, skills: { prayer: 70 } },
  },
  gravityMechanic: {
    description: 'Gravity direction changes every 30 seconds. Tiles that were floor become wall or ceiling. Players must reposition constantly.',
    changeInterval: 50, // 50 ticks = 30 seconds
    directions: ['normal', 'inverted', 'left_wall', 'right_wall'],
  },
};


// ##############################################################################
//
//   CROSS-REGION RAIDS (3)
//
//   Raids 22-24. Span multiple regions or are region-agnostic.
//
// ##############################################################################


// ══════════════════════════════════════════════════════════════════════════════
// RAID 22: THE GRAND HUNT
// 3-5 players. Track a legendary creature across ALL 8 regions.
// Requires all skills. Final confrontation after visiting all regions.
// ══════════════════════════════════════════════════════════════════════════════

// ---------- Hunter's mark ----------
// BIS ranged amulet for hunter creatures. +15% damage to anything with
// the 'beast' tag. Decent ranged accuracy for general use.
items.define({
  id: 96020,
  name: "Hunter's mark",
  examine: 'A pendant carved from the tooth of the Legendary Beast. It pulses with predatory instinct.',
  value: 18000000,
  category: 'jewellery',
  equipSlot: 'amulet',
  stats: { ranged: 18, ranged_strength: 6, prayer: 2 },
  equipReqs: { ranged: 75 },
  passiveEffect: {
    name: 'Predator\'s Instinct',
    description: '+15% damage against targets with the beast tag.',
    targetTags: ['beast'],
    damageBonus: 0.15,
  },
});

// ---------- Tracking boots ----------
// Utility boots. Never lose tracking trails. +2 invisible Hunter boost.
// Trade-off: low combat stats. You give up Primordial/Pegasian boots.
items.define({
  id: 96021,
  name: 'Tracking boots',
  examine: 'Boots crafted from the Legendary Beast\'s hide. No trail goes cold while you wear them.',
  value: 10000000,
  category: 'armour',
  equipSlot: 'feet',
  stats: {
    def_stab: 8, def_slash: 8, def_crush: 8,
    def_magic: 2, def_ranged: 8,
  },
  equipReqs: { defence: 60 },
  passiveEffect: {
    name: 'Master Tracker',
    description: 'Tracking trails never expire. +2 invisible Hunter level boost.',
    trackingPermanent: true,
    hunterBoost: 2,
  },
});

// --- Grand Hunt NPCs ---

npcs.defineNpc('hunt_tracker_beast', {
  name: 'Legendary Beast (Tracking Phase)',
  combat: 180,
  maxHp: 250,
  maxHit: 22,
  stats: { attack: 120, strength: 110, defence: 100 },
  attackSpeed: 4,
  attackRange: 1,
  attackStyle: 'melee',
  size: 3,
  aggressive: false,
  aggroRange: 0,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'The Legendary Beast! But it senses you -- it will flee if you don\'t act fast.',
  weakness: 'ranged',
  tags: ['raid', 'grand_hunt', 'beast'],
  raidRoom: 'hunt_tracking',
  raidMechanic: 'Must be dealt 50 damage within 10 ticks or it teleports to the next region. Requires Hunter skill to locate.',
});
droptables.define('hunt_tracker_beast', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 720, max: 2160 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

npcs.defineNpc('hunt_regional_guardian_heartlands', {
  name: 'Heartlands Guardian Elk',
  combat: 200,
  maxHp: 280,
  maxHit: 24,
  stats: { attack: 130, strength: 120, defence: 110 },
  attackSpeed: 4,
  attackRange: 1,
  attackStyle: 'melee',
  size: 3,
  aggressive: true,
  aggroRange: 8,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A massive elk that guards the Heartlands passage. It will not let you pass without a fight.',
  weakness: 'slash',
  tags: ['raid', 'grand_hunt', 'beast'],
  raidRoom: 'hunt_heartlands',
});
droptables.define('hunt_regional_guardian_heartlands', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 800, max: 2400 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

npcs.defineNpc('hunt_regional_guardian_boneyard', {
  name: 'Boneyard Scarab Swarm',
  combat: 220,
  maxHp: 300,
  maxHit: 28,
  stats: { attack: 150, strength: 100, defence: 140 },
  attackSpeed: 3,
  attackRange: 3,
  attackStyle: 'magic',
  size: 2,
  aggressive: true,
  aggroRange: 8,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A swarm of desert scarabs blocking the trail. Crush them or lure them away.',
  weakness: 'crush',
  tags: ['raid', 'grand_hunt', 'scarab', 'kalphite'],
  raidRoom: 'hunt_boneyard',
});
droptables.define('hunt_regional_guardian_boneyard', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 880, max: 2640 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

// --- Final confrontation ---

npcs.defineNpc('hunt_legendary_beast', {
  name: 'The Legendary Beast',
  combat: 440,
  maxHp: 700,
  maxHit: 50,
  stats: { attack: 250, strength: 240, defence: 200 },
  attackSpeed: 4,
  attackRange: 6,
  attackStyle: 'melee',
  size: 5,
  aggressive: true,
  aggroRange: 15,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'The Legendary Beast, cornered at last. A creature of myth -- part stag, part dragon, part shadow. It will not go quietly.',
  weakness: 'ranged',
  tags: ['raid', 'grand_hunt', 'beast', 'boss', 'dragon'],
  resistance: 'magic',
  raidRoom: 'hunt_final',
  phases: [
    {
      name: 'Phase 1: Stag',
      hpRange: [1.0, 0.65],
      description: 'The beast fights in stag form. Charges at players. Fast melee attacks. Pray melee. Antler swipe hits a 3x3 area.',
      attackStyle: 'melee',
      correctPrayer: 'protect_from_melee',
      specialAttack: {
        name: 'Antler Swipe',
        description: 'Swipes antlers in a 3x3 arc. 40 damage. Knocks players back 2 tiles.',
        aoeSize: 3,
        damage: 40,
        knockback: 2,
        tickInterval: 10,
      },
    },
    {
      name: 'Phase 2: Dragon',
      hpRange: [0.65, 0.35],
      description: 'Transforms into dragon form. Flies and breathes fire. Pray magic. Dragonfire breath every 8 ticks (50 damage, anti-dragon shield reduces to 15).',
      attackStyle: 'magic',
      correctPrayer: 'protect_from_magic',
      attackRange: 10,
      specialAttack: {
        name: 'Dragonfire',
        description: 'Breathes fire in a cone. 50 damage, anti-dragon shield reduces to 15.',
        coneDamage: 50,
        shieldReduction: 15,
        tickInterval: 8,
      },
    },
    {
      name: 'Phase 3: Shadow',
      hpRange: [0.35, 0.0],
      description: 'Dissolves into shadow form. Attacks from all directions. Cycles styles every 3 ticks. Spawns shadow clones (15 HP each) that explode for 25 damage.',
      cycleInterval: 3,
      attackStyles: ['melee', 'ranged', 'magic'],
      correctPrayers: ['protect_from_melee', 'protect_from_missiles', 'protect_from_magic'],
      maxHitOverride: 60,
      shadowClone: {
        hp: 15,
        explosionDamage: 25,
        spawnInterval: 8,
        spawnCount: 3,
      },
    },
  ],
});

// Drop tables

// Pet: Tiny Hunter
items.define({
  id: 84006,
  name: 'Tiny Hunter',
  examine: 'A miniature version of the Legendary Beast. It cycles between stag, dragon, and shadow forms, seemingly at random.',
  value: 0,
  category: 'pet',
  tradeable: false,
  weight: 0,
});

droptables.define('hunt_legendary_beast', {
  always: [
    { id: 107, name: 'Dragon bones', min: 5, max: 10 },
  ],
  main: [
    { id: 101, name: 'Coins', weight: 6, min: 40000, max: 150000 },
    { id: 11358, name: 'Blood rune', weight: 4, min: 100, max: 300 },
    { id: 11363, name: 'Soul rune', weight: 3, min: 60, max: 150 },
    { id: 0, name: 'Nothing', weight: 2, min: 0, max: 0 },
  ],
  tertiary: [
    { id: 96020, name: "Hunter's mark", chance: 100, min: 1, max: 1 },
    { id: 96021, name: 'Tracking boots', chance: 80, min: 1, max: 1 },
    { id: 84006, name: 'Tiny Hunter', chance: 1500, min: 1, max: 1 }, // v0.9-waveB4 H14: rate /2
  ],
});

const GRAND_HUNT = {
  id: 'grand_hunt',
  name: 'The Grand Hunt',
  shortName: 'Hunt',
  description: 'Track a legendary creature that teleports between all 8 regions of Aelgard. Requires Hunter skill, mining, agility, herblore, and every combat style. The ultimate all-skills raid.',
  location: 'Starts in Heartlands, spans all regions',
  region: 'cross_region',
  minPlayers: 3,
  maxPlayers: 5,
  estimatedTime: { min: 45, max: 75, unit: 'minutes' },
  requirements: {
    combat: 85,
    skills: { hunter: 70, mining: 60, agility: 60, herblore: 55 },
    quests: [],
    recommended: { combat: 110, skills: { hunter: 85, mining: 75, agility: 75, herblore: 70, prayer: 70 } },
  },
  regionOrder: ['heartlands', 'boneyard_wastes', 'moryskah', 'veilwood', 'sootworks', 'saltbrine_reach', 'inkweald', 'glass_desert'],
  trackingMechanic: {
    description: 'Use Hunter skill to find tracks. Each region has a 5-minute window before the beast teleports. Must deal 50 damage to it before it flees. After visiting all 8 regions, final confrontation.',
    trackingLevel: 70,
    windowTicks: 500,
    damageThreshold: 50,
  },
};


// ══════════════════════════════════════════════════════════════════════════════
// RAID 23: THE CALAMITY PROTOCOL
// 5-20 players. World defense event. 4 defense points across the world.
// Coordination required -- teams at different locations synchronize actions.
// ══════════════════════════════════════════════════════════════════════════════

// ---------- Calamity ward ----------
// Best shield in the game. Highest combined defensive stats.
// Trade-off: very heavy, reduces movement speed by 1 tile.
items.define({
  id: 96022,
  name: 'Calamity ward',
  examine: 'A shield forged from the shell of the Calamity itself. The heaviest and most protective shield in existence.',
  value: 50000000,
  category: 'armour',
  equipSlot: 'shield',
  stats: {
    def_stab: 85, def_slash: 88, def_crush: 82,
    def_magic: 15, def_ranged: 80,
    prayer: 5,
  },
  equipReqs: { defence: 85 },
  passiveEffect: {
    name: 'Unyielding',
    description: 'Highest defensive stats of any shield. Reduces movement speed by 1 tile due to weight. 5% damage reduction from all sources.',
    movementPenalty: 1,
    damageReduction: 0.05,
  },
});

// ---------- Herald's staff ----------
// Support weapon. Buffs all nearby players. Decent magic damage on its own.
items.define({
  id: 96023,
  name: "Herald's staff",
  examine: 'A staff carried by the Heralds of Aelgard. Its light inspires allies and sears enemies.',
  value: 28000000,
  category: 'weapon',
  equipSlot: 'weapon',
  twoHanded: true,
  speed: 5,
  stats: { magic: 30, magic_strength: 18 },
  equipReqs: { magic: 80 },
  passiveEffect: {
    name: 'Herald\'s Inspiration',
    description: 'All allies within 5 tiles regenerate 1 HP and 1 prayer point every 6 ticks while you wield this staff.',
    allyBuffRange: 5,
    allyHpRegen: 1,
    allyPrayerRegen: 1,
    regenInterval: 6,
  },
});

// --- Calamity NPCs ---

npcs.defineNpc('calamity_tendril', {
  name: 'Calamity Tendril',
  combat: 200,
  maxHp: 180,
  maxHit: 22,
  stats: { attack: 130, strength: 120, defence: 100 },
  attackSpeed: 3,
  attackRange: 6,
  attackStyle: 'magic',
  size: 2,
  aggressive: true,
  aggroRange: 12,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A tentacle of the Calamity reaching through the rift. Destroy it before it anchors.',
  weakness: 'slash',
  tags: ['raid', 'calamity', 'corruption'],
  raidRoom: 'calamity_defense_point',
});
droptables.define('calamity_tendril', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 800, max: 2400 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

npcs.defineNpc('calamity_corruptor', {
  name: 'Calamity Corruptor',
  combat: 300,
  maxHp: 350,
  maxHit: 36,
  stats: { attack: 190, strength: 180, defence: 160 },
  attackSpeed: 4,
  attackRange: 8,
  attackStyle: 'magic',
  size: 3,
  aggressive: true,
  aggroRange: 10,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A herald of the Calamity. It corrupts the ground it walks on, damaging players who stand on it.',
  weakness: 'ranged',
  tags: ['raid', 'calamity', 'corruption', 'boss'],
  resistance: 'magic',
  raidRoom: 'calamity_breach',
  specialAttack: {
    name: 'Corruption Pool',
    description: 'Leaves corrupted ground in a 3x3 area. 10 damage/tick for 10 ticks.',
    aoeSize: 3,
    damagePerTick: 10,
    duration: 10,
    tickInterval: 8,
  },
});
droptables.define('calamity_corruptor', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 1200, max: 3600 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

npcs.defineNpc('calamity_shield_pylon', {
  name: 'Defense Pylon',
  combat: 0,
  maxHp: 400,
  maxHit: 0,
  stats: { attack: 0, strength: 0, defence: 80 },
  attackSpeed: 0,
  attackRange: 0,
  attackStyle: 'none',
  size: 2,
  aggressive: false,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A defense pylon that shields the surrounding area. If destroyed, the defense point falls.',
  weakness: 'none',
  tags: ['raid', 'calamity', 'defend'],
  raidRoom: 'calamity_defense_point',
  raidMechanic: 'Must be protected. If it reaches 0 HP, that defense point falls and the Calamity grows stronger.',
});

// --- Boss: The Calamity ---

npcs.defineNpc('calamity_boss', {
  name: 'The Calamity',
  combat: 580,
  maxHp: 1200,
  maxHit: 65,
  stats: { attack: 320, strength: 300, defence: 310 },
  attackSpeed: 5,
  attackRange: 15,
  attackStyle: 'magic',
  size: 7,
  aggressive: true,
  aggroRange: 20,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'An entity from beyond the world. It threatens all of Aelgard. This is the fight that determines everything.',
  weakness: 'crush',
  tags: ['raid', 'calamity', 'corruption', 'boss', 'endgame'],
  raidRoom: 'calamity_final',
  phases: [
    {
      name: 'Phase 1: The Breach',
      hpRange: [1.0, 0.75],
      description: 'The Calamity attacks all 4 defense points simultaneously. Teams must defend their pylons while dealing damage to tendrils. If a pylon falls, the Calamity heals 15% HP.',
      pylonCount: 4,
      pylonFailHeal: 0.15,
      tendrilSpawnInterval: 8,
      tendrilDefId: 'calamity_tendril',
    },
    {
      name: 'Phase 2: The Convergence',
      hpRange: [0.75, 0.45],
      description: 'All teams converge at the central rift. The Calamity manifests fully. Cycles attack styles every 5 ticks. Corruption pools spread across the arena.',
      cycleInterval: 5,
      attackStyles: ['magic', 'ranged', 'melee'],
      correctPrayers: ['protect_from_magic', 'protect_from_missiles', 'protect_from_melee'],
      corruptionPoolInterval: 10,
      corruptionPoolDamage: 12,
      corruptionPoolSize: 3,
    },
    {
      name: 'Phase 3: Core Exposure',
      hpRange: [0.45, 0.15],
      description: 'The Calamity\'s shell cracks, exposing a core. Core takes 3x damage but is only exposed for 8 ticks every 20 ticks. Spawns Corruptors continuously.',
      coreExposure: {
        duration: 8,
        interval: 20,
        damageMultiplier: 3.0,
      },
      spawnInterval: 10,
      spawnDefId: 'calamity_corruptor',
      spawnCount: 2,
      maxHitOverride: 75,
    },
    {
      name: 'Phase 4: Annihilation',
      hpRange: [0.15, 0.0],
      description: 'The Calamity enters death throes. Arena shrinks. Attack speed +2. Max hit 85. Core permanently exposed. DPS race -- if not killed in 60 ticks, it wipes everyone.',
      attackSpeedOverride: 3,
      maxHitOverride: 85,
      enrageTimer: 60,
      arenaShrinksTo: 6,
      corePermanentlyExposed: true,
    },
  ],
});

// Drop tables

// Pet: Shard of Calamity
items.define({
  id: 84007,
  name: 'Shard of Calamity',
  examine: 'A contained fragment of the Calamity. It pulses with dark energy but is harmless. Probably.',
  value: 0,
  category: 'pet',
  tradeable: false,
  weight: 0,
});

droptables.define('calamity_boss', {
  always: [],
  main: [
    { id: 101, name: 'Coins', weight: 5, min: 80000, max: 300000 },
    { id: 11363, name: 'Soul rune', weight: 4, min: 100, max: 300 },
    { id: 11364, name: 'Wrath rune', weight: 3, min: 60, max: 150 },
    { id: 11358, name: 'Blood rune', weight: 3, min: 150, max: 400 },
    { id: 0, name: 'Nothing', weight: 2, min: 0, max: 0 },
  ],
  tertiary: [
    { id: 96022, name: 'Calamity ward', chance: 250, min: 1, max: 1 },
    { id: 96023, name: "Herald's staff", chance: 200, min: 1, max: 1 },
    { id: 84007, name: 'Shard of Calamity', chance: 5000, min: 1, max: 1 },
  ],
});

const CALAMITY_PROTOCOL = {
  id: 'calamity_protocol',
  name: 'The Calamity Protocol',
  shortName: 'Calamity',
  description: 'A massive world defense event. A Calamity threatens Aelgard -- players stationed at 4 defense points across the world must coordinate to repel it. The biggest raid in the game.',
  location: 'Central Aelgard, 4 defense pylons across regions',
  region: 'cross_region',
  minPlayers: 5,
  maxPlayers: 20,
  estimatedTime: { min: 40, max: 60, unit: 'minutes' },
  requirements: {
    combat: 100,
    skills: {},
    quests: [],
    recommended: { combat: 120, skills: { prayer: 77 } },
  },
  defensePoints: [
    { id: 'heartlands_pylon', region: 'heartlands', description: 'Western defense pylon near the Heartlands wall' },
    { id: 'moryskah_pylon', region: 'moryskah', description: 'Eastern defense pylon at the Moryskah border' },
    { id: 'sootworks_pylon', region: 'sootworks', description: 'Underground defense pylon in the Sootworks depths' },
    { id: 'glass_desert_pylon', region: 'glass_desert', description: 'Southern defense pylon at the Glass Desert edge' },
  ],
};


// ══════════════════════════════════════════════════════════════════════════════
// RAID 24: THE IRON GAUNTLET
// Solo. Start with nothing. Gather, craft, fight through 10 rooms.
// Ultimate test of game knowledge. Every skill matters.
// ══════════════════════════════════════════════════════════════════════════════

// ---------- Ironman's mark ----------
// Cosmetic amulet with +1% XP boost to your lowest skill.
// Trade-off: nearly zero combat stats. Pure utility/prestige item.
items.define({
  id: 96024,
  name: "Ironman's mark",
  examine: 'A badge of honour awarded to those who conquered the Iron Gauntlet. The mark glows brighter near your weakest skill.',
  value: 5000000,
  category: 'jewellery',
  equipSlot: 'amulet',
  stats: { prayer: 3 },
  equipReqs: {},
  passiveEffect: {
    name: 'Iron Will',
    description: '+1% XP boost to your lowest skill. Cosmetic glow effect.',
    lowestSkillXpBoost: 0.01,
  },
});

// ---------- Master craftsman's ring ----------
// +2 invisible boost to all production skills. No combat stats.
// Trade-off: you give up a combat ring slot.
items.define({
  id: 96025,
  name: "Master craftsman's ring",
  examine: 'A ring forged in the Iron Gauntlet from materials gathered with nothing but bare hands and ingenuity.',
  value: 12000000,
  category: 'jewellery',
  equipSlot: 'ring',
  stats: {},
  equipReqs: {},
  passiveEffect: {
    name: 'Master\'s Touch',
    description: '+2 invisible level boost to Smithing, Crafting, Fletching, Herblore, Cooking, Runecrafting, and Construction.',
    skillBoosts: {
      smithing: 2, crafting: 2, fletching: 2, herblore: 2,
      cooking: 2, runecrafting: 2, construction: 2,
    },
  },
});

// --- Iron Gauntlet NPCs ---

npcs.defineNpc('gauntlet_hunllef_basic', {
  name: 'Gauntlet Hunllef',
  combat: 260,
  maxHp: 300,
  maxHit: 30,
  stats: { attack: 160, strength: 150, defence: 140 },
  attackSpeed: 5,
  attackRange: 6,
  attackStyle: 'magic',
  size: 3,
  aggressive: true,
  aggroRange: 10,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A crystalline beast that guards the Gauntlet rooms. Must be fought with whatever you\'ve crafted.',
  weakness: 'ranged',
  tags: ['raid', 'iron_gauntlet', 'crystal', 'beast'],
  raidRoom: 'gauntlet_room_4',
});
droptables.define('gauntlet_hunllef_basic', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 1040, max: 3120 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

npcs.defineNpc('gauntlet_dark_beast', {
  name: 'Gauntlet Dark Beast',
  combat: 300,
  maxHp: 340,
  maxHit: 35,
  stats: { attack: 180, strength: 170, defence: 160 },
  attackSpeed: 4,
  attackRange: 1,
  attackStyle: 'melee',
  size: 3,
  aggressive: true,
  aggroRange: 8,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A powerful dark beast that prowls the deeper Gauntlet rooms.',
  weakness: 'magic',
  tags: ['raid', 'iron_gauntlet', 'beast'],
  raidRoom: 'gauntlet_room_7',
});
droptables.define('gauntlet_dark_beast', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 1200, max: 3600 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

// --- Boss: The Corrupted Hunllef ---

npcs.defineNpc('gauntlet_corrupted_hunllef', {
  name: 'The Corrupted Hunllef',
  combat: 490,
  maxHp: 750,
  maxHit: 56,
  stats: { attack: 280, strength: 270, defence: 260 },
  attackSpeed: 5,
  attackRange: 8,
  attackStyle: 'magic',
  size: 4,
  aggressive: true,
  aggroRange: 15,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A Hunllef twisted by corruption. It attacks with all combat styles and the floor itself is lethal. You brought nothing -- you must use what you found.',
  weakness: 'none',
  tags: ['raid', 'iron_gauntlet', 'crystal', 'boss', 'corrupted'],
  raidRoom: 'gauntlet_boss',
  phases: [
    {
      name: 'Phase 1',
      hpRange: [1.0, 0.66],
      description: 'Attacks with magic and ranged, switching every 4 attacks. Must prayer switch. Floor tiles change colour -- standing on the wrong colour deals 8 damage/tick.',
      switchEvery: 4,
      attackStyles: ['magic', 'ranged'],
      correctPrayers: ['protect_from_magic', 'protect_from_missiles'],
      floorDamagePerTick: 8,
    },
    {
      name: 'Phase 2',
      hpRange: [0.66, 0.33],
      description: 'Adds melee to the rotation. Now cycles magic -> ranged -> melee, switching every 3 attacks. Tornado spawns that chase the player.',
      switchEvery: 3,
      attackStyles: ['magic', 'ranged', 'melee'],
      correctPrayers: ['protect_from_magic', 'protect_from_missiles', 'protect_from_melee'],
      tornado: {
        count: 2,
        damage: 15,
        speed: 2,
        spawnInterval: 12,
      },
    },
    {
      name: 'Phase 3',
      hpRange: [0.33, 0.0],
      description: 'Enraged. Switches style every 2 attacks. 4 tornadoes. Floor tiles change twice as fast. Max hit 70. This is the test.',
      switchEvery: 2,
      attackStyles: ['magic', 'ranged', 'melee'],
      correctPrayers: ['protect_from_magic', 'protect_from_missiles', 'protect_from_melee'],
      maxHitOverride: 70,
      tornado: {
        count: 4,
        damage: 20,
        speed: 3,
        spawnInterval: 8,
      },
      floorDamagePerTick: 12,
    },
  ],
});

// Drop tables

// Pet: Crystal Cub
items.define({
  id: 84008,
  name: 'Crystal Cub',
  examine: 'A baby Hunllef. It hasn\'t been corrupted yet. Follows you loyally and glows faintly.',
  value: 0,
  category: 'pet',
  tradeable: false,
  weight: 0,
});

droptables.define('gauntlet_corrupted_hunllef', {
  always: [],
  main: [
    { id: 101, name: 'Coins', weight: 6, min: 30000, max: 100000 },
    { id: 11363, name: 'Soul rune', weight: 4, min: 60, max: 150 },
    { id: 11358, name: 'Blood rune', weight: 4, min: 80, max: 200 },
    { id: 0, name: 'Nothing', weight: 2, min: 0, max: 0 },
  ],
  tertiary: [
    { id: 96024, name: "Ironman's mark", chance: 60, min: 1, max: 1 },
    { id: 96025, name: "Master craftsman's ring", chance: 100, min: 1, max: 1 },
    { id: 84008, name: 'Crystal Cub', chance: 4000, min: 1, max: 1 },
  ],
});

const IRON_GAUNTLET = {
  id: 'iron_gauntlet',
  name: 'The Iron Gauntlet',
  shortName: 'Gauntlet',
  description: 'Start with nothing. Gather resources, craft weapons and armour, and fight through 10 rooms. The ultimate test of game knowledge. Every skill matters. Solo only.',
  location: 'Accessible from any major city',
  region: 'cross_region',
  minPlayers: 1,
  maxPlayers: 1,
  estimatedTime: { min: 20, max: 35, unit: 'minutes' },
  requirements: {
    combat: 85,
    skills: { mining: 60, smithing: 60, woodcutting: 60, crafting: 60, cooking: 50, fishing: 50, herblore: 50, farming: 45, firemaking: 50 },
    quests: [],
    recommended: { combat: 110, skills: { mining: 80, smithing: 80, woodcutting: 80, crafting: 80, cooking: 70, fishing: 70, herblore: 70 } },
  },
  gauntletMechanic: {
    description: 'Enter with no items. Gather resources in 8 gather rooms (2 minutes each). Then fight through 2 combat rooms and the final boss using only crafted gear.',
    gatherRooms: 8,
    gatherTimePerRoom: 200, // ticks (2 minutes)
    combatRooms: 2,
    bossRoom: 1,
    craftableGear: [
      { tier: 'basic', description: 'T1 crystal weapons/armour (low stats)' },
      { tier: 'attuned', description: 'T2 attuned weapons/armour (medium stats)' },
      { tier: 'perfected', description: 'T3 perfected weapons/armour (high stats, requires rare resources)' },
    ],
  },
};


// ##############################################################################
//
//   THEMED RAIDS (6)
//
//   Raids 25-30. Each themed to a specific region.
//
// ##############################################################################


// ══════════════════════════════════════════════════════════════════════════════
// RAID 25: THE MUSHROOM GROTTO
// Veilwood, 3-5 players. Spore mechanics, stat drain, mushroom dragon.
// ══════════════════════════════════════════════════════════════════════════════

// ---------- Fungal staff ----------
// Magic weapon that applies stat drain on every hit.
// Trade-off: lower raw DPS than Kodai wand. Utility over power.
items.define({
  id: 96026,
  name: 'Fungal staff',
  examine: 'A staff grown from the heart of the Mycelium. Each spell cast spreads fungal spores that weaken the target.',
  value: 14000000,
  category: 'weapon',
  equipSlot: 'weapon',
  speed: 4,
  stats: { magic: 22, magic_strength: 10 },
  equipReqs: { magic: 72 },
  passiveEffect: {
    name: 'Spore Blight',
    description: 'Every successful magic hit drains the target\'s defence by 1 (stacks up to 20). Lasts until the target dies.',
    defenceDrainPerHit: 1,
    maxDrainStacks: 20,
  },
});

// ---------- Mycelium shield ----------
// Absorbs 10% of incoming damage as prayer points. Decent defence.
// Trade-off: less raw defence than spirit shields. Prayer sustain over tank.
items.define({
  id: 96027,
  name: 'Mycelium shield',
  examine: 'A shield woven from living mycelium. It converts a fraction of the pain you suffer into spiritual energy.',
  value: 16000000,
  category: 'armour',
  equipSlot: 'shield',
  stats: {
    def_stab: 50, def_slash: 52, def_crush: 48,
    def_magic: 8, def_ranged: 45,
    prayer: 4,
  },
  equipReqs: { defence: 70, prayer: 60 },
  passiveEffect: {
    name: 'Mycelium Absorption',
    description: '10% of incoming damage is converted to prayer point restoration instead of being taken as damage.',
    damageToPorayerPercent: 0.10,
  },
});

// --- Mushroom Grotto NPCs ---

npcs.defineNpc('grotto_spore_cloud', {
  name: 'Spore Cloud',
  combat: 160,
  maxHp: 120,
  maxHit: 16,
  stats: { attack: 100, strength: 80, defence: 70 },
  attackSpeed: 4,
  attackRange: 4,
  attackStyle: 'magic',
  size: 2,
  aggressive: true,
  aggroRange: 8,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A cloud of toxic spores. Standing near it drains your stats.',
  weakness: 'ranged',
  tags: ['raid', 'mushroom_grotto', 'fungal'],
  raidRoom: 'grotto_maze',
  passiveAura: {
    name: 'Toxic Spores',
    description: 'Drains 1 from all combat stats every 3 ticks to nearby players.',
    drainAmount: 1,
    drainInterval: 3,
    range: 3,
  },
});
droptables.define('grotto_spore_cloud', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 640, max: 1920 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

npcs.defineNpc('grotto_fungal_warrior', {
  name: 'Fungal Warrior',
  combat: 240,
  maxHp: 280,
  maxHit: 28,
  stats: { attack: 150, strength: 160, defence: 130 },
  attackSpeed: 5,
  attackRange: 1,
  attackStyle: 'melee',
  size: 2,
  aggressive: true,
  aggroRange: 6,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A humanoid figure overgrown with fungus. It swings a club of hardened mushroom.',
  weakness: 'slash',
  tags: ['raid', 'mushroom_grotto', 'fungal', 'humanoid'],
  raidRoom: 'grotto_warriors',
});
droptables.define('grotto_fungal_warrior', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 960, max: 2880 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

npcs.defineNpc('grotto_mycelium', {
  name: 'The Mycelium',
  combat: 320,
  maxHp: 400,
  maxHit: 34,
  stats: { attack: 190, strength: 150, defence: 180 },
  attackSpeed: 4,
  attackRange: 6,
  attackStyle: 'magic',
  size: 4,
  aggressive: true,
  aggroRange: 10,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'The heart of the fungal network. Tendrils of mycelium extend throughout the cave, sensing your every step.',
  weakness: 'slash',
  tags: ['raid', 'mushroom_grotto', 'fungal', 'boss'],
  resistance: 'magic',
  raidRoom: 'grotto_mycelium',
  phases: [
    {
      name: 'Networked',
      hpRange: [1.0, 0.50],
      description: 'The Mycelium attacks with root tendrils (melee) and spore clouds (magic). Connected to 4 root nodes that must be destroyed first -- while any root node lives, The Mycelium regenerates 15 HP/tick.',
      rootNodeCount: 4,
      rootNodeHp: 80,
      regenPerNode: 15,
      attackStyles: ['melee', 'magic'],
    },
    {
      name: 'Severed',
      hpRange: [0.50, 0.0],
      description: 'Root nodes destroyed. The Mycelium panics. Stat drain aura expands to full room. Attack speed +1. Releases toxic burst every 8 ticks (20 damage, 3x3 AoE).',
      attackSpeedOverride: 3,
      maxHitOverride: 42,
      toxicBurst: {
        damage: 20,
        aoeSize: 3,
        tickInterval: 8,
      },
    },
  ],
});
droptables.define('grotto_mycelium', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 1280, max: 3840 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

// --- Boss: Sporewing ---

npcs.defineNpc('grotto_sporewing', {
  name: 'Sporewing',
  combat: 460,
  maxHp: 680,
  maxHit: 50,
  stats: { attack: 260, strength: 250, defence: 240 },
  attackSpeed: 5,
  attackRange: 8,
  attackStyle: 'magic',
  size: 5,
  aggressive: true,
  aggroRange: 15,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A dragon made entirely of mushroom. Its breath is a cloud of spores so toxic they dissolve armour.',
  weakness: 'ranged',
  tags: ['raid', 'mushroom_grotto', 'fungal', 'dragon', 'boss'],
  resistance: 'magic',
  raidRoom: 'grotto_boss',
  phases: [
    {
      name: 'Phase 1: Aerial',
      hpRange: [1.0, 0.60],
      description: 'Sporewing flies. Ranged and magic only. Breathes spore clouds that reduce visibility and drain stats. Pray magic.',
      attackStyle: 'magic',
      correctPrayer: 'protect_from_magic',
      specialAttack: {
        name: 'Spore Breath',
        description: 'Breathes a 5x5 spore cloud. Players inside lose 2 from all combat stats per tick for 6 ticks. 15 damage per tick.',
        aoeSize: 5,
        statDrainPerTick: 2,
        damagePerTick: 15,
        duration: 6,
        tickInterval: 12,
      },
    },
    {
      name: 'Phase 2: Grounded',
      hpRange: [0.60, 0.30],
      description: 'Sporewing lands. Vulnerable to melee. Spawns fungal warriors every 10 ticks. Mushroom spikes erupt from the ground (2x2, 30 damage).',
      attackStyle: 'melee',
      correctPrayer: 'protect_from_melee',
      spawnInterval: 10,
      spawnDefId: 'grotto_fungal_warrior',
      spawnCount: 2,
      specialAttack: {
        name: 'Mushroom Spikes',
        description: 'Spikes erupt from 3 random 2x2 areas. 30 damage each.',
        spikeCount: 3,
        aoeSize: 2,
        damage: 30,
        tickInterval: 8,
      },
    },
    {
      name: 'Phase 3: Spore Storm',
      hpRange: [0.30, 0.0],
      description: 'Sporewing releases all its spores. Entire arena has stat drain (1 per tick). Attack speed +1. Alternates all styles every 3 ticks. Max hit 65.',
      cycleInterval: 3,
      attackStyles: ['magic', 'ranged', 'melee'],
      correctPrayers: ['protect_from_magic', 'protect_from_missiles', 'protect_from_melee'],
      maxHitOverride: 65,
      attackSpeedOverride: 4,
      globalStatDrain: 1,
    },
  ],
});

// Drop tables

// Pet: Sprout
items.define({
  id: 84009,
  name: 'Sprout',
  examine: 'A tiny mushroom with legs. It toddles along behind you, occasionally releasing harmless puffs of glowing spores.',
  value: 0,
  category: 'pet',
  tradeable: false,
  weight: 0,
});

droptables.define('grotto_sporewing', {
  always: [],
  main: [
    { id: 101, name: 'Coins', weight: 6, min: 30000, max: 100000 },
    { id: 11358, name: 'Blood rune', weight: 4, min: 80, max: 200 },
    { id: 12013, name: 'Grimy torstol', weight: 3, min: 5, max: 12 },
    { id: 0, name: 'Nothing', weight: 2, min: 0, max: 0 },
  ],
  tertiary: [
    { id: 96026, name: 'Fungal staff', chance: 120, min: 1, max: 1 },
    { id: 96027, name: 'Mycelium shield', chance: 100, min: 1, max: 1 },
    { id: 84009, name: 'Sprout', chance: 1500, min: 1, max: 1 }, // v0.9-waveB4 H14: rate /2
  ],
});

const MUSHROOM_GROTTO = {
  id: 'mushroom_grotto',
  name: 'The Mushroom Grotto',
  shortName: 'Grotto',
  description: 'An underground mushroom cave in Veilwood. Spore mechanics reduce vision and drain stats. Navigate the spore maze, fight fungal warriors, sever the Mycelium network, and face Sporewing -- a dragon made of mushroom.',
  location: 'Veilwood, Fungal Caverns',
  region: 'veilwood',
  minPlayers: 3,
  maxPlayers: 5,
  estimatedTime: { min: 25, max: 45, unit: 'minutes' },
  requirements: {
    combat: 85,
    skills: {},
    quests: [],
    recommended: { combat: 105, skills: { prayer: 70 } },
  },
};


// ══════════════════════════════════════════════════════════════════════════════
// RAID 26: THE FROST CITADEL
// Between Wilds and Heartlands, 4-8 players.
// Ice fortress. Slippery floors, freeze mechanics.
// ══════════════════════════════════════════════════════════════════════════════

// ---------- Frostbite blade ----------
// BIS slash weapon with freeze chance. 10% chance to freeze the target
// for 4 ticks on each hit. High slash accuracy.
items.define({
  id: 96028,
  name: 'Frostbite blade',
  examine: 'A sword of eternal ice. Its edge never dulls and its touch freezes the blood.',
  value: 22000000,
  category: 'weapon',
  equipSlot: 'weapon',
  speed: 4,
  stats: { slash: 98, melee_strength: 92 },
  equipReqs: { attack: 78 },
  passiveEffect: {
    name: 'Frostbite',
    description: '10% chance per hit to freeze the target in place for 4 ticks.',
    freezeChance: 0.10,
    freezeDuration: 4,
  },
});

// ---------- Ice crown ----------
// BIS magic helm. Immune to freeze effects.
// Trade-off: lower defence than Ancestral hat. Magic DPS + freeze immunity.
items.define({
  id: 96029,
  name: 'Ice crown',
  examine: 'A crown of living ice. It protects the wearer from all freezing effects and amplifies ice magic.',
  value: 20000000,
  category: 'armour',
  equipSlot: 'head',
  stats: {
    magic: 10, magic_strength: 4,
    def_stab: 5, def_slash: 6, def_crush: 4,
    def_magic: 10, def_ranged: 3,
    prayer: 2,
  },
  equipReqs: { magic: 78, defence: 70 },
  passiveEffect: {
    name: 'Frozen Crown',
    description: 'Immune to all freeze effects (ice barrage, boss freeze mechanics, etc).',
    freezeImmunity: true,
  },
});

// --- Frost Citadel NPCs ---

npcs.defineNpc('frost_ice_warrior', {
  name: 'Ice Warrior',
  combat: 200,
  maxHp: 200,
  maxHit: 24,
  stats: { attack: 130, strength: 120, defence: 120 },
  attackSpeed: 4,
  attackRange: 1,
  attackStyle: 'melee',
  size: 1,
  aggressive: true,
  aggroRange: 6,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A warrior encased in enchanted ice. Its attacks can freeze you in place.',
  weakness: 'crush',
  tags: ['raid', 'frost_citadel', 'ice', 'humanoid'],
  raidRoom: 'frost_bridge',
  freezeOnHitChance: 0.15,
  freezeDuration: 3,
});
droptables.define('frost_ice_warrior', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 800, max: 2400 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

npcs.defineNpc('frost_wyvern', {
  name: 'Frost Wyvern',
  combat: 320,
  maxHp: 380,
  maxHit: 36,
  stats: { attack: 190, strength: 180, defence: 170 },
  attackSpeed: 5,
  attackRange: 6,
  attackStyle: 'ranged',
  size: 4,
  aggressive: true,
  aggroRange: 12,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A wyvern whose breath is frozen wind. Elemental shield required to survive its icy blast.',
  weakness: 'magic',
  tags: ['raid', 'frost_citadel', 'ice', 'dragon', 'wyvern'],
  resistance: 'ranged',
  raidRoom: 'frost_wyvern_lair',
  specialAttack: {
    name: 'Ice Breath',
    description: 'Breathes icy wind in a cone. 40 damage without shield, 10 with elemental/mind/dragonfire shield. Freezes for 5 ticks without shield.',
    coneDamage: 40,
    shieldReduction: 10,
    freezeDuration: 5,
    tickInterval: 10,
  },
});
droptables.define('frost_wyvern', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 1280, max: 3840 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

npcs.defineNpc('frost_ice_golem', {
  name: 'Frost Golem',
  combat: 360,
  maxHp: 500,
  maxHit: 42,
  stats: { attack: 200, strength: 220, defence: 250 },
  attackSpeed: 6,
  attackRange: 1,
  attackStyle: 'melee',
  size: 4,
  aggressive: true,
  aggroRange: 8,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A massive golem of solid ice. Incredibly tough and incredibly slow.',
  weakness: 'crush',
  tags: ['raid', 'frost_citadel', 'ice', 'construct', 'armoured'],
  resistance: 'ranged',
  raidRoom: 'frost_golem_arena',
  phases: [
    {
      name: 'Intact',
      hpRange: [1.0, 0.40],
      description: 'Slow but devastating. Each hit deals up to 42. When hit with fire magic, takes 2x damage.',
      fireWeakness: 2.0,
    },
    {
      name: 'Crumbling',
      hpRange: [0.40, 0.0],
      description: 'Cracks appear. Attack speed +2. Launches ice chunks at random tiles (25 damage, 2x2 AoE). Fire weakness remains.',
      attackSpeedOverride: 4,
      specialAttack: {
        name: 'Ice Chunk',
        description: 'Throws ice chunks at 3 random tiles. 25 damage, 2x2 AoE each.',
        chunkCount: 3,
        aoeSize: 2,
        damage: 25,
        tickInterval: 6,
      },
    },
  ],
});
droptables.define('frost_ice_golem', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 1440, max: 4320 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

// --- Boss: The Frost Queen ---

npcs.defineNpc('frost_queen', {
  name: 'The Frost Queen',
  combat: 500,
  maxHp: 780,
  maxHit: 55,
  stats: { attack: 280, strength: 260, defence: 270 },
  attackSpeed: 4,
  attackRange: 10,
  attackStyle: 'magic',
  size: 3,
  aggressive: true,
  aggroRange: 15,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'The ruler of the Frost Citadel. Her gaze freezes the soul. Her magic shatters the frozen.',
  weakness: 'crush',
  tags: ['raid', 'frost_citadel', 'ice', 'boss', 'humanoid', 'mage'],
  resistance: 'ranged',
  raidRoom: 'frost_boss',
  phases: [
    {
      name: 'Phase 1: Ice Magic',
      hpRange: [1.0, 0.65],
      description: 'The Frost Queen attacks with ice magic. Pray magic. Periodically freezes the ground in expanding circles from her position. Move away when the ice starts spreading.',
      attackStyle: 'magic',
      correctPrayer: 'protect_from_magic',
      specialAttack: {
        name: 'Expanding Frost',
        description: 'Ice spreads outward from the Queen in a circle. 3 damage/tick while standing on ice. Circle expands 1 tile per tick for 5 ticks.',
        damagePerTick: 3,
        expansionRate: 1,
        maxRadius: 5,
        tickInterval: 15,
      },
    },
    {
      name: 'Phase 2: Blizzard',
      hpRange: [0.65, 0.35],
      description: 'Summons a blizzard. Visibility reduced to 3 tiles. Randomly attacks with melee, ranged, or magic. Must prayer switch with limited information.',
      visibilityRange: 3,
      attackStyles: ['melee', 'ranged', 'magic'],
      correctPrayers: ['protect_from_melee', 'protect_from_missiles', 'protect_from_magic'],
      maxHitOverride: 50,
    },
    {
      name: 'Phase 3: Absolute Zero',
      hpRange: [0.35, 0.0],
      description: 'The Queen channels Absolute Zero. All players are frozen for 2 ticks every 10 ticks. During freeze: take 15 damage. Must eat/brew between freezes. Attack speed +1. Max hit 68.',
      globalFreezeInterval: 10,
      globalFreezeDuration: 2,
      globalFreezeDamage: 15,
      attackSpeedOverride: 3,
      maxHitOverride: 68,
    },
  ],
});

// Drop tables

// Pet: Frostling
items.define({
  id: 84010,
  name: 'Frostling',
  examine: 'A tiny ice elemental that leaves frost wherever it walks. Your inventory occasionally frosts over. Harmlessly.',
  value: 0,
  category: 'pet',
  tradeable: false,
  weight: 0,
});

droptables.define('frost_queen', {
  always: [],
  main: [
    { id: 101, name: 'Coins', weight: 6, min: 40000, max: 150000 },
    { id: 11358, name: 'Blood rune', weight: 4, min: 100, max: 300 },
    { id: 11363, name: 'Soul rune', weight: 3, min: 80, max: 200 },
    { id: 0, name: 'Nothing', weight: 2, min: 0, max: 0 },
  ],
  tertiary: [
    { id: 96028, name: 'Frostbite blade', chance: 120, min: 1, max: 1 },
    { id: 96029, name: 'Ice crown', chance: 150, min: 1, max: 1 },
    { id: 84010, name: 'Frostling', chance: 3500, min: 1, max: 1 },
  ],
});

const FROST_CITADEL = {
  id: 'frost_citadel',
  name: 'The Frost Citadel',
  shortName: 'Frost',
  description: 'An ice fortress between the Wilds and Heartlands. Slippery floors, freeze mechanics, and enemies whose touch stops you cold. Cross the ice bridge, survive the wyvern, topple the golem, and dethrone the Frost Queen.',
  location: 'Northern Heartlands border, above the Wilds',
  region: 'heartlands',
  minPlayers: 4,
  maxPlayers: 8,
  estimatedTime: { min: 30, max: 50, unit: 'minutes' },
  requirements: {
    combat: 90,
    skills: {},
    quests: [],
    recommended: { combat: 110, skills: { magic: 80, prayer: 70 } },
  },
};


// ══════════════════════════════════════════════════════════════════════════════
// RAID 27: THE VOLCANIC DEPTHS
// Sootworks, 3-5 players. Active volcano. Heat damage accumulates.
// ══════════════════════════════════════════════════════════════════════════════

// ---------- Obsidian maul upgrade ----------
// BIS slow crush weapon. An upgrade kit applied to Elder maul.
// Higher stats than Elder maul with fire damage on every hit.
items.define({
  id: 96030,
  name: 'Obsidian maul',
  examine: 'An Elder maul reforged in volcanic obsidian. Each impact releases a burst of lava. The heaviest weapon in Aelgard.',
  value: 35000000,
  category: 'weapon',
  equipSlot: 'weapon',
  twoHanded: true,
  speed: 7,
  stats: { crush: 168, melee_strength: 170 },
  equipReqs: { attack: 80, strength: 80 },
  passiveEffect: {
    name: 'Volcanic Impact',
    description: 'Every hit deals an additional 5 fire damage that ignores defence.',
    bonusFireDamage: 5,
    ignoresDefence: true,
  },
});

// ---------- Volcanic whip ----------
// Whip variant with fire damage. Faster than Abyssal whip (speed 3 vs 4).
// Trade-off: lower base stats than Abyssal whip. Speed over power.
items.define({
  id: 96031,
  name: 'Volcanic whip',
  examine: 'An Abyssal whip infused with volcanic fire. It cracks faster and burns on contact.',
  value: 18000000,
  category: 'weapon',
  equipSlot: 'weapon',
  speed: 3,
  stats: { slash: 78, melee_strength: 72 },
  equipReqs: { attack: 75 },
  passiveEffect: {
    name: 'Searing Lash',
    description: 'Each hit deals an additional 3 fire damage. Fastest melee weapon in the game.',
    bonusFireDamage: 3,
  },
});

// --- Volcanic Depths NPCs ---

npcs.defineNpc('volcanic_obsidian_golem', {
  name: 'Obsidian Golem',
  combat: 280,
  maxHp: 350,
  maxHit: 32,
  stats: { attack: 170, strength: 180, defence: 200 },
  attackSpeed: 6,
  attackRange: 1,
  attackStyle: 'melee',
  size: 3,
  aggressive: true,
  aggroRange: 6,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A golem of volcanic obsidian. Its body radiates scorching heat.',
  weakness: 'crush',
  tags: ['raid', 'volcanic_depths', 'construct', 'fire', 'armoured'],
  resistance: 'magic',
  raidRoom: 'volcanic_crossing',
  passiveAura: {
    name: 'Radiant Heat',
    description: 'Deals 3 damage per tick to adjacent players.',
    damagePerTick: 3,
    range: 1,
  },
});
droptables.define('volcanic_obsidian_golem', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 1120, max: 3360 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

npcs.defineNpc('volcanic_lava_serpent', {
  name: 'Lava Serpent',
  combat: 300,
  maxHp: 320,
  maxHit: 35,
  stats: { attack: 180, strength: 170, defence: 140 },
  attackSpeed: 4,
  attackRange: 6,
  attackStyle: 'magic',
  size: 3,
  aggressive: true,
  aggroRange: 10,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A serpent born in magma. It spits molten rock at range.',
  weakness: 'ranged',
  tags: ['raid', 'volcanic_depths', 'serpent', 'fire'],
  raidRoom: 'volcanic_crossing',
});
droptables.define('volcanic_lava_serpent', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 1200, max: 3600 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

// --- Boss: Pyroclast ---

npcs.defineNpc('volcanic_pyroclast', {
  name: 'Pyroclast',
  combat: 480,
  maxHp: 720,
  maxHit: 54,
  stats: { attack: 270, strength: 260, defence: 250 },
  attackSpeed: 5,
  attackRange: 8,
  attackStyle: 'magic',
  size: 5,
  aggressive: true,
  aggroRange: 15,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A lava elemental of immense power. The volcano itself given form. Its core burns at the temperature of the sun.',
  weakness: 'ranged',
  tags: ['raid', 'volcanic_depths', 'elemental', 'fire', 'boss'],
  resistance: 'melee',
  raidRoom: 'volcanic_boss',
  phases: [
    {
      name: 'Phase 1: Molten Shell',
      hpRange: [1.0, 0.60],
      description: 'Pyroclast is encased in a molten shell. Takes 50% reduced melee damage (ranged/magic recommended). Throws lava bombs at random tiles. Ground heat damage accumulates.',
      meleeReduction: 0.50,
      specialAttack: {
        name: 'Lava Bomb',
        description: 'Throws lava bombs at 3 random tiles. 2x2 AoE, 35 damage. Leaves lava pool (5 damage/tick for 10 ticks).',
        bombCount: 3,
        aoeSize: 2,
        impactDamage: 35,
        poolDamagePerTick: 5,
        poolDuration: 10,
        tickInterval: 10,
      },
    },
    {
      name: 'Phase 2: Eruption',
      hpRange: [0.60, 0.30],
      description: 'Shell cracks. Pyroclast erupts, launching magma skyward. Falling magma hits random 3x3 areas for 40 damage. Must find cooling stations to reset heat damage.',
      specialAttack: {
        name: 'Magma Rain',
        description: 'Magma falls from above onto 4 random 3x3 areas. 40 damage each. Indicated 2 ticks before impact.',
        impactCount: 4,
        aoeSize: 3,
        damage: 40,
        warningTicks: 2,
        tickInterval: 8,
      },
      coolingStations: {
        description: 'Find cooling stations (steam vents) to reset accumulated heat damage. Heat adds 2 damage/tick while in the volcano.',
        heatDamagePerTick: 2,
        stationCount: 3,
        cooldownTicks: 30,
      },
    },
    {
      name: 'Phase 3: Core Meltdown',
      hpRange: [0.30, 0.0],
      description: 'Core exposed. Takes full damage from all styles. Attacks with all styles, switching every 4 ticks. Heat damage increases to 4/tick. Arena floor becomes 50% lava. Max hit 70.',
      cycleInterval: 4,
      attackStyles: ['magic', 'ranged', 'melee'],
      correctPrayers: ['protect_from_magic', 'protect_from_missiles', 'protect_from_melee'],
      maxHitOverride: 70,
      heatDamagePerTick: 4,
      lavaFloorPercent: 0.50,
      lavaDamagePerTick: 8,
    },
  ],
});

// Drop tables

// Pet: Ember
items.define({
  id: 84011,
  name: 'Ember',
  examine: 'A tiny flame elemental. It floats beside you, warming your hands on cold days and setting fire to things on warm days.',
  value: 0,
  category: 'pet',
  tradeable: false,
  weight: 0,
});

droptables.define('volcanic_pyroclast', {
  always: [],
  main: [
    { id: 101, name: 'Coins', weight: 6, min: 40000, max: 140000 },
    { id: 2116, name: 'Runite bar', weight: 4, min: 5, max: 15 },
    { id: 11357, name: 'Death rune', weight: 4, min: 100, max: 250 },
    { id: 0, name: 'Nothing', weight: 2, min: 0, max: 0 },
  ],
  tertiary: [
    { id: 96030, name: 'Obsidian maul', chance: 150, min: 1, max: 1 },
    { id: 96031, name: 'Volcanic whip', chance: 120, min: 1, max: 1 },
    { id: 84011, name: 'Ember', chance: 3500, min: 1, max: 1 },
  ],
});

const VOLCANIC_DEPTHS = {
  id: 'volcanic_depths',
  name: 'The Volcanic Depths',
  shortName: 'Volcanic',
  description: 'Descend into an active volcano beneath the Sootworks. Heat damage accumulates the longer you stay. Find cooling stations or die. Fight obsidian golems, lava serpents, and the Pyroclast itself.',
  location: 'Sootworks, Deep Volcanic Shaft',
  region: 'sootworks',
  minPlayers: 3,
  maxPlayers: 5,
  estimatedTime: { min: 25, max: 45, unit: 'minutes' },
  requirements: {
    combat: 90,
    skills: {},
    quests: [],
    recommended: { combat: 110, skills: { prayer: 70 } },
  },
  heatMechanic: {
    description: 'Heat damage accumulates at 1 damage per tick after 30 ticks in the volcano. Cooling stations reset the counter. Running out of cooling station charges means permanent accumulation.',
    baseHeatRate: 1,
    gracePeriod: 30,
    coolingStations: 3,
    stationCharges: 5,
  },
};


// ══════════════════════════════════════════════════════════════════════════════
// RAID 28: THE TIDAL FORTRESS
// Saltbrine, 4-8 players. Floods and drains with the tide.
// ══════════════════════════════════════════════════════════════════════════════

// ---------- Tidal trident ----------
// Magic weapon whose damage scales with prayer level.
// At 99 prayer: massive max hit. At low prayer: mediocre.
items.define({
  id: 96032,
  name: 'Tidal trident',
  examine: 'A trident infused with the power of the tides. Its magic grows stronger the deeper your faith.',
  value: 24000000,
  category: 'weapon',
  equipSlot: 'weapon',
  speed: 4,
  stats: { magic: 25, magic_strength: 15 },
  equipReqs: { magic: 78 },
  passiveEffect: {
    name: 'Tidal Faith',
    description: 'Magic damage scales with prayer level. At 99 prayer: +20% max hit. At 1 prayer: no bonus.',
    prayerScaling: true,
    maxPrayerBonus: 0.20,
  },
});

// ---------- Neptunite helm ----------
items.define({
  id: 96033,
  name: 'Neptunite helm',
  examine: 'A helm forged from neptunite ore dredged from the seafloor. Protects against both magic and ranged attacks.',
  value: 18000000,
  category: 'armour',
  equipSlot: 'head',
  stats: {
    magic: 6, ranged: 4,
    def_stab: 18, def_slash: 20, def_crush: 16,
    def_magic: 12, def_ranged: 14,
    prayer: 2,
  },
  equipReqs: { defence: 75, magic: 70, ranged: 70 },
  setId: 'neptunite',
});

// ---------- Neptunite robe top ----------
items.define({
  id: 96034,
  name: 'Neptunite robe top',
  examine: 'A robe top woven from neptunite thread. Hybrid armour that supports both magic and ranged combat.',
  value: 30000000,
  category: 'armour',
  equipSlot: 'body',
  stats: {
    magic: 18, ranged: 12,
    def_stab: 40, def_slash: 42, def_crush: 38,
    def_magic: 30, def_ranged: 35,
    prayer: 3,
  },
  equipReqs: { defence: 75, magic: 70, ranged: 70 },
  setId: 'neptunite',
  setEffect: {
    name: 'Tidal Resonance',
    pieces: ['neptunite_helm', 'neptunite_robe_top'],
    description: 'Full set: +5% magic and ranged accuracy. Switching between magic and ranged weapons has no tick delay.',
    magicAccuracyBonus: 0.05,
    rangedAccuracyBonus: 0.05,
    noSwitchDelay: true,
  },
});

// --- Tidal Fortress NPCs ---

npcs.defineNpc('tidal_crab_warrior', {
  name: 'Tidal Crab Warrior',
  combat: 220,
  maxHp: 260,
  maxHit: 26,
  stats: { attack: 140, strength: 150, defence: 170 },
  attackSpeed: 5,
  attackRange: 1,
  attackStyle: 'melee',
  size: 2,
  aggressive: true,
  aggroRange: 6,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'An armoured crab the size of a horse. Its claws can crush steel.',
  weakness: 'magic',
  tags: ['raid', 'tidal_fortress', 'beast', 'armoured'],
  resistance: 'ranged',
  raidRoom: 'tidal_low_tide',
});
droptables.define('tidal_crab_warrior', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 880, max: 2640 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

npcs.defineNpc('tidal_sea_witch', {
  name: 'Tidal Sea Witch',
  combat: 280,
  maxHp: 300,
  maxHit: 32,
  stats: { attack: 170, strength: 100, defence: 140 },
  attackSpeed: 4,
  attackRange: 8,
  attackStyle: 'magic',
  size: 2,
  aggressive: true,
  aggroRange: 10,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A witch of the deep seas. Her tidal magic controls the water levels in the fortress.',
  weakness: 'ranged',
  tags: ['raid', 'tidal_fortress', 'humanoid', 'mage'],
  resistance: 'magic',
  raidRoom: 'tidal_high_tide',
});
droptables.define('tidal_sea_witch', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 1120, max: 3360 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

npcs.defineNpc('tidal_kraken_tentacle', {
  name: 'Kraken Tentacle',
  combat: 300,
  maxHp: 280,
  maxHit: 30,
  stats: { attack: 180, strength: 170, defence: 120 },
  attackSpeed: 4,
  attackRange: 4,
  attackStyle: 'melee',
  size: 3,
  aggressive: true,
  aggroRange: 8,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A massive tentacle reaching from below the fortress. More tentacles stir in the depths.',
  weakness: 'slash',
  tags: ['raid', 'tidal_fortress', 'beast'],
  raidRoom: 'tidal_depths',
});
droptables.define('tidal_kraken_tentacle', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 1200, max: 3600 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

// --- Boss: Tidecaller Zarathan ---

npcs.defineNpc('tidal_zarathan', {
  name: 'Tidecaller Zarathan',
  combat: 500,
  maxHp: 750,
  maxHit: 52,
  stats: { attack: 280, strength: 250, defence: 260 },
  attackSpeed: 4,
  attackRange: 10,
  attackStyle: 'magic',
  size: 4,
  aggressive: true,
  aggroRange: 15,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'The Tidecaller commands the ocean. The fortress floods and drains at her will. Her magic is the sea itself.',
  weakness: 'ranged',
  tags: ['raid', 'tidal_fortress', 'boss', 'humanoid', 'mage'],
  resistance: 'magic',
  raidRoom: 'tidal_boss',
  phases: [
    {
      name: 'Phase 1: Low Tide',
      hpRange: [1.0, 0.70],
      description: 'Low tide. Full arena accessible. Zarathan attacks with water magic. Pray magic. Summons tidal waves that sweep across the arena in one direction.',
      attackStyle: 'magic',
      correctPrayer: 'protect_from_magic',
      specialAttack: {
        name: 'Tidal Wave',
        description: 'A wall of water sweeps across the arena from one side. 45 damage if hit. Jump over it (1-tick window) or stand behind a pillar.',
        damage: 45,
        dodgeWindow: 1,
        tickInterval: 12,
      },
    },
    {
      name: 'Phase 2: Rising Tide',
      hpRange: [0.70, 0.40],
      description: 'Tide rises. 40% of arena floods (standing in water: 5 damage/tick, movement -50%). Zarathan swims and becomes hard to hit (+30% defence). Summons kraken tentacles.',
      floodPercent: 0.40,
      waterDamagePerTick: 5,
      waterMovementReduction: 0.50,
      defenceBonus: 0.30,
      spawnInterval: 12,
      spawnDefId: 'tidal_kraken_tentacle',
      spawnCount: 2,
    },
    {
      name: 'Phase 3: High Tide',
      hpRange: [0.40, 0.0],
      description: 'High tide. 70% flooded. Only elevated platforms are safe. Zarathan cycles all styles every 3 ticks from the water. Tidal waves every 6 ticks. Max hit 65.',
      floodPercent: 0.70,
      safePlatforms: 4,
      cycleInterval: 3,
      attackStyles: ['magic', 'ranged', 'melee'],
      correctPrayers: ['protect_from_magic', 'protect_from_missiles', 'protect_from_melee'],
      maxHitOverride: 65,
      tidalWaveInterval: 6,
    },
  ],
});

// Drop tables

// Pet: Tidbit
items.define({
  id: 84012,
  name: 'Tidbit',
  examine: 'A miniature sea creature that rides the tides. It splashes water at passersby and seems to enjoy the chaos.',
  value: 0,
  category: 'pet',
  tradeable: false,
  weight: 0,
});

droptables.define('tidal_zarathan', {
  always: [],
  main: [
    { id: 101, name: 'Coins', weight: 6, min: 40000, max: 140000 },
    { id: 11358, name: 'Blood rune', weight: 4, min: 100, max: 300 },
    { id: 11363, name: 'Soul rune', weight: 3, min: 60, max: 180 },
    { id: 0, name: 'Nothing', weight: 2, min: 0, max: 0 },
  ],
  tertiary: [
    { id: 96032, name: 'Tidal trident', chance: 120, min: 1, max: 1 },
    { id: 96033, name: 'Neptunite helm', chance: 150, min: 1, max: 1 },
    { id: 96034, name: 'Neptunite robe top', chance: 180, min: 1, max: 1 },
    { id: 84012, name: 'Tidbit', chance: 4000, min: 1, max: 1 },
  ],
});

const TIDAL_FORTRESS = {
  id: 'tidal_fortress',
  name: 'The Tidal Fortress',
  shortName: 'Tidal',
  description: 'A sea fortress in Saltbrine Reach that floods and drains with the tide. Every 3 minutes the water level changes, opening and closing paths. Time your movements or drown.',
  location: 'Saltbrine Reach, Offshore Fortress',
  region: 'saltbrine_reach',
  minPlayers: 4,
  maxPlayers: 8,
  estimatedTime: { min: 30, max: 50, unit: 'minutes' },
  requirements: {
    combat: 90,
    skills: {},
    quests: [],
    recommended: { combat: 110, skills: { prayer: 70 } },
  },
  tideMechanic: {
    description: 'Tide changes every 3 minutes (300 ticks). Low tide: full arena accessible. Mid tide: 40% flooded. High tide: 70% flooded. Cycle repeats.',
    cycleInterval: 300,
    levels: ['low', 'mid', 'high'],
    floodPercents: { low: 0, mid: 0.40, high: 0.70 },
  },
};


// ══════════════════════════════════════════════════════════════════════════════
// RAID 29: THE DREAM COLOSSEUM
// Inkweald, solo. Fight dream versions of every boss you've ever killed.
// 20 waves. Bosses at 50% HP but use 2 mechanics simultaneously.
// ══════════════════════════════════════════════════════════════════════════════

// ---------- Dream fragment ----------
// Combine 10 for the BIS ring in the game.
items.define({
  id: 96035,
  name: 'Dream fragment',
  examine: 'A shard of crystallized dream. Ten of these can be combined into the Ring of Dreams -- the most powerful ring in Aelgard.',
  value: 5000000,
  category: 'crafting',
  tradeable: true,
  stackable: true,
  weight: 0,
});

items.define({
  id: 96036,
  name: 'Ring of Dreams',
  examine: 'A ring forged from ten dream fragments. It exists in all states simultaneously. The ultimate ring.',
  value: 80000000,
  category: 'jewellery',
  equipSlot: 'ring',
  stats: {
    stab: 8, slash: 8, crush: 8, ranged: 8, magic: 8,
    melee_strength: 6, ranged_strength: 4, magic_strength: 4,
    prayer: 4,
  },
  equipReqs: {},
  passiveEffect: {
    name: 'Lucid Power',
    description: 'Adapts to your combat style: +4% melee damage in melee, +4% ranged damage in ranged, +4% magic damage in magic. Stacks with other effects.',
    adaptiveDamageBonus: 0.04,
  },
});

// ---------- Lucid edge ----------
// Melee weapon with +10% accuracy in Inkweald. Decent stats outside.
items.define({
  id: 96037,
  name: 'Lucid edge',
  examine: 'A blade that exists between waking and dreaming. In the Inkweald, its edge is impossibly sharp.',
  value: 15000000,
  category: 'weapon',
  equipSlot: 'weapon',
  speed: 4,
  stats: { slash: 88, melee_strength: 82 },
  equipReqs: { attack: 75 },
  passiveEffect: {
    name: 'Dreamwalker',
    description: '+10% accuracy while in the Inkweald. Standard stats elsewhere.',
    inkwealdAccuracyBonus: 0.10,
  },
});

// --- Dream Colosseum NPCs ---

npcs.defineNpc('dream_shade', {
  name: 'Dream Shade',
  combat: 200,
  maxHp: 150,
  maxHit: 22,
  stats: { attack: 130, strength: 120, defence: 110 },
  attackSpeed: 4,
  attackRange: 4,
  attackStyle: 'magic',
  size: 2,
  aggressive: true,
  aggroRange: 8,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A shade formed from your memories. It wears the face of someone you once fought.',
  weakness: 'melee',
  tags: ['raid', 'dream_colosseum', 'dream', 'shade'],
  raidRoom: 'dream_wave',
});
droptables.define('dream_shade', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 800, max: 2400 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

npcs.defineNpc('dream_nightmare', {
  name: 'Dream Nightmare',
  combat: 350,
  maxHp: 400,
  maxHit: 38,
  stats: { attack: 200, strength: 190, defence: 180 },
  attackSpeed: 5,
  attackRange: 6,
  attackStyle: 'magic',
  size: 3,
  aggressive: true,
  aggroRange: 10,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'Your worst nightmare given form. It knows your weaknesses because it was born from them.',
  weakness: 'ranged',
  tags: ['raid', 'dream_colosseum', 'dream', 'nightmare'],
  resistance: 'magic',
  raidRoom: 'dream_wave',
  specialAttack: {
    name: 'Fear Pulse',
    description: 'Drains 5 prayer points and deals 20 damage. Cannot be protected against.',
    unavoidable: true,
    damage: 20,
    prayerDrain: 5,
    tickInterval: 12,
  },
});
droptables.define('dream_nightmare', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 1400, max: 4200 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

// --- Boss: The Dreamer ---

npcs.defineNpc('dream_final_boss', {
  name: 'The Dreamer',
  combat: 520,
  maxHp: 800,
  maxHit: 58,
  stats: { attack: 290, strength: 280, defence: 270 },
  attackSpeed: 4,
  attackRange: 10,
  attackStyle: 'magic',
  size: 4,
  aggressive: true,
  aggroRange: 15,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'The entity that rules the Dream Colosseum. A being of pure thought that can reshape reality. It is everything and nothing.',
  weakness: 'none',
  tags: ['raid', 'dream_colosseum', 'dream', 'boss'],
  raidRoom: 'dream_boss',
  phases: [
    {
      name: 'Phase 1: Your Memories',
      hpRange: [1.0, 0.70],
      description: 'The Dreamer takes the form of bosses from your kill log (scaled to your level). Fights with their mechanics at 50% HP but 2 mechanics active simultaneously. Pray based on the form.',
      formSource: 'player_kill_log',
      mechanicsActive: 2,
      hpScaling: 0.50,
    },
    {
      name: 'Phase 2: Your Fears',
      hpRange: [0.70, 0.40],
      description: 'The Dreamer becomes your worst fear. Uses the mechanics of the boss you\'ve died to most. Attack speed +1. Spawns nightmare adds.',
      formSource: 'player_death_log',
      attackSpeedOverride: 3,
      spawnInterval: 10,
      spawnDefId: 'dream_nightmare',
      spawnCount: 1,
    },
    {
      name: 'Phase 3: Your Potential',
      hpRange: [0.40, 0.0],
      description: 'The Dreamer takes YOUR form. Matches your combat stats exactly. Copies your prayers. Uses all 3 combat styles. The only way to win is to out-eat and out-pray yourself.',
      formSource: 'player_clone',
      matchesPlayerStats: true,
      copiesPrayers: true,
      cycleInterval: 4,
      attackStyles: ['melee', 'ranged', 'magic'],
      maxHitOverride: 65,
    },
  ],
});

// Drop tables

// Pet: Dreamling
items.define({
  id: 84013,
  name: 'Dreamling',
  examine: 'A small, translucent creature that shifts between forms. Sometimes it looks like you. Sometimes it looks like something you\'ve forgotten.',
  value: 0,
  category: 'pet',
  tradeable: false,
  weight: 0,
});

droptables.define('dream_final_boss', {
  always: [],
  main: [
    { id: 101, name: 'Coins', weight: 5, min: 50000, max: 180000 },
    { id: 11363, name: 'Soul rune', weight: 4, min: 100, max: 250 },
    { id: 11364, name: 'Wrath rune', weight: 3, min: 50, max: 120 },
    { id: 0, name: 'Nothing', weight: 2, min: 0, max: 0 },
  ],
  tertiary: [
    { id: 96035, name: 'Dream fragment', chance: 15, min: 1, max: 1 },
    { id: 96037, name: 'Lucid edge', chance: 150, min: 1, max: 1 },
    { id: 84013, name: 'Dreamling', chance: 4000, min: 1, max: 1 },
  ],
});

const DREAM_COLOSSEUM = {
  id: 'dream_colosseum',
  name: 'The Dream Colosseum',
  shortName: 'DreamColo',
  description: 'Fight dream versions of every boss you\'ve ever killed. 20 waves. Each boss has 50% HP but uses 2 mechanics simultaneously. Solo only. The ultimate test of personal skill.',
  location: 'Inkweald, The Dreaming Arena',
  region: 'inkweald',
  minPlayers: 1,
  maxPlayers: 1,
  estimatedTime: { min: 35, max: 60, unit: 'minutes' },
  requirements: {
    combat: 100,
    skills: {},
    quests: [],
    recommended: { combat: 120, skills: { prayer: 77 } },
  },
  waveSystem: {
    totalWaves: 20,
    bossSource: 'player_kill_log',
    bossHpScaling: 0.50,
    mechanicsActive: 2,
    finalBoss: 'dream_final_boss',
  },
};


// ══════════════════════════════════════════════════════════════════════════════
// RAID 30: THE EXODUS
// Glass Desert endgame, 5-10 players. The FINAL raid of Aelgard.
// 8 rooms representing each region's corruption. The Corruption itself.
// ══════════════════════════════════════════════════════════════════════════════

// ---------- Exodus blade ----------
// BIS melee weapon, tied with scythe. Highest sustained melee DPS.
// Speed 4, high slash AND strength. The melee endgame.
items.define({
  id: 96038,
  name: 'Exodus blade',
  examine: 'A sword forged from the essence of a dying world. It hums with the power of everything that was lost. The strongest melee weapon in Aelgard.',
  value: 100000000,
  category: 'weapon',
  equipSlot: 'weapon',
  speed: 4,
  stats: { slash: 110, stab: 90, melee_strength: 108 },
  equipReqs: { attack: 85 },
  passiveEffect: {
    name: 'Exodus',
    description: 'Each consecutive hit on the same target increases damage by 2%, stacking up to 10 times (20% max). Resets on target switch or miss.',
    consecutiveHitBonus: 0.02,
    maxStacks: 10,
  },
});

// ---------- Exodus ward ----------
// BIS all-around shield. Good defence across all styles.
// Not the best at any one thing, but the best overall.
items.define({
  id: 96039,
  name: 'Exodus ward',
  examine: 'A shield that exists between worlds. It protects against all forms of attack equally. The ultimate defensive ward.',
  value: 75000000,
  category: 'armour',
  equipSlot: 'shield',
  stats: {
    def_stab: 72, def_slash: 74, def_crush: 70,
    def_magic: 20, def_ranged: 68,
    prayer: 6,
    melee_strength: 3, ranged_strength: 2, magic_strength: 3,
  },
  equipReqs: { defence: 85 },
  passiveEffect: {
    name: 'World Shield',
    description: 'Reduces all incoming damage by 3%. Effective against all combat styles.',
    universalDamageReduction: 0.03,
  },
});

// ---------- Herald's cape ----------
// BIS cape for all styles. Replaces Fire cape, Ava's, God capes.
// Trade-off: requires completing The Exodus (hardest content in game).
items.define({
  id: 96040,
  name: "Herald's cape",
  examine: 'A cape worn by those who faced the Corruption and survived. It adapts to any combat style, making it the single best cape in Aelgard.',
  value: 60000000,
  category: 'armour',
  equipSlot: 'cape',
  stats: {
    stab: 4, slash: 4, crush: 4, ranged: 6, magic: 6,
    melee_strength: 6, ranged_strength: 4, magic_strength: 4,
    def_stab: 12, def_slash: 12, def_crush: 12,
    def_magic: 12, def_ranged: 12,
    prayer: 4,
  },
  equipReqs: {},
  passiveEffect: {
    name: 'Herald\'s Resolve',
    description: 'Adapts to combat style: +2% damage in your active style. Ava\'s ammo retrieval effect included.',
    adaptiveDamageBonus: 0.02,
    ammoRetrieval: true,
  },
});

// --- Exodus Room NPCs (1 per region) ---

npcs.defineNpc('exodus_corrupted_knight', {
  name: 'Corrupted Knight of Heartlands',
  combat: 350,
  maxHp: 400,
  maxHit: 38,
  stats: { attack: 210, strength: 200, defence: 190 },
  attackSpeed: 4,
  attackRange: 1,
  attackStyle: 'melee',
  size: 2,
  aggressive: true,
  aggroRange: 8,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A Heartlands knight consumed by corruption. His armour weeps black oil.',
  weakness: 'magic',
  tags: ['raid', 'exodus', 'corruption', 'humanoid', 'armoured'],
  resistance: 'melee',
  raidRoom: 'exodus_heartlands',
});
droptables.define('exodus_corrupted_knight', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 1400, max: 4200 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

npcs.defineNpc('exodus_corrupted_pharaoh', {
  name: 'Corrupted Pharaoh of the Wastes',
  combat: 370,
  maxHp: 420,
  maxHit: 40,
  stats: { attack: 220, strength: 180, defence: 200 },
  attackSpeed: 4,
  attackRange: 8,
  attackStyle: 'magic',
  size: 2,
  aggressive: true,
  aggroRange: 10,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A pharaoh of the Boneyard Wastes, risen and corrupted. Sand and shadow swirl around him.',
  weakness: 'ranged',
  tags: ['raid', 'exodus', 'corruption', 'undead'],
  resistance: 'magic',
  raidRoom: 'exodus_boneyard',
});
droptables.define('exodus_corrupted_pharaoh', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 1480, max: 4440 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

npcs.defineNpc('exodus_corrupted_vampyre', {
  name: 'Corrupted Vampyre of Moryskah',
  combat: 380,
  maxHp: 440,
  maxHit: 42,
  stats: { attack: 230, strength: 210, defence: 180 },
  attackSpeed: 4,
  attackRange: 6,
  attackStyle: 'melee',
  size: 2,
  aggressive: true,
  aggroRange: 8,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A vampyre of Moryskah, twisted beyond recognition. The corruption feeds on its undying hunger.',
  weakness: 'slash',
  tags: ['raid', 'exodus', 'corruption', 'vampyre', 'undead'],
  raidRoom: 'exodus_moryskah',
});
droptables.define('exodus_corrupted_vampyre', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 1520, max: 4560 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

npcs.defineNpc('exodus_corrupted_treant', {
  name: 'Corrupted Treant of Veilwood',
  combat: 360,
  maxHp: 500,
  maxHit: 36,
  stats: { attack: 200, strength: 220, defence: 220 },
  attackSpeed: 6,
  attackRange: 1,
  attackStyle: 'melee',
  size: 4,
  aggressive: true,
  aggroRange: 6,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'An ancient treant of Veilwood, its bark blackened and rotting. The forest weeps.',
  weakness: 'slash',
  tags: ['raid', 'exodus', 'corruption', 'plant'],
  resistance: 'magic',
  raidRoom: 'exodus_veilwood',
});
droptables.define('exodus_corrupted_treant', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 1440, max: 4320 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

npcs.defineNpc('exodus_corrupted_automaton', {
  name: 'Corrupted Automaton of Sootworks',
  combat: 400,
  maxHp: 480,
  maxHit: 44,
  stats: { attack: 240, strength: 230, defence: 250 },
  attackSpeed: 5,
  attackRange: 4,
  attackStyle: 'ranged',
  size: 3,
  aggressive: true,
  aggroRange: 10,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A Sootworks automaton overrun with corruption. Its gears grind with black ichor.',
  weakness: 'crush',
  tags: ['raid', 'exodus', 'corruption', 'construct', 'armoured'],
  resistance: 'ranged',
  raidRoom: 'exodus_sootworks',
  raidMechanic: 'Requires mining (75) to expose weak points in its armour. Without mining, takes 50% reduced damage.',
});
droptables.define('exodus_corrupted_automaton', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 1600, max: 4800 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

npcs.defineNpc('exodus_corrupted_captain', {
  name: 'Corrupted Captain of Saltbrine',
  combat: 370,
  maxHp: 420,
  maxHit: 40,
  stats: { attack: 220, strength: 200, defence: 180 },
  attackSpeed: 4,
  attackRange: 6,
  attackStyle: 'ranged',
  size: 2,
  aggressive: true,
  aggroRange: 10,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A pirate captain of Saltbrine Reach. The corruption has made him an immortal scourge of the seas.',
  weakness: 'magic',
  tags: ['raid', 'exodus', 'corruption', 'humanoid'],
  raidRoom: 'exodus_saltbrine',
  raidMechanic: 'Requires fishing (70) to lure him from his ship. Without fishing, he stays at range with +50% accuracy.',
});
droptables.define('exodus_corrupted_captain', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 1480, max: 4440 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

npcs.defineNpc('exodus_corrupted_dreamer', {
  name: 'Corrupted Dreamer of Inkweald',
  combat: 390,
  maxHp: 380,
  maxHit: 46,
  stats: { attack: 240, strength: 150, defence: 200 },
  attackSpeed: 4,
  attackRange: 10,
  attackStyle: 'magic',
  size: 2,
  aggressive: true,
  aggroRange: 12,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A dreamer of Inkweald who dreamed too deep. The corruption lives in its nightmares.',
  weakness: 'ranged',
  tags: ['raid', 'exodus', 'corruption', 'dream'],
  resistance: 'magic',
  raidRoom: 'exodus_inkweald',
});
droptables.define('exodus_corrupted_dreamer', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 1560, max: 4680 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

npcs.defineNpc('exodus_corrupted_crystal', {
  name: 'Corrupted Crystal of Glass Desert',
  combat: 420,
  maxHp: 500,
  maxHit: 48,
  stats: { attack: 250, strength: 240, defence: 260 },
  attackSpeed: 5,
  attackRange: 8,
  attackStyle: 'magic',
  size: 3,
  aggressive: true,
  aggroRange: 10,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A crystal formation from the Glass Desert, pulsing with corruption. The desert\'s beauty turned to malice.',
  weakness: 'crush',
  tags: ['raid', 'exodus', 'corruption', 'crystal', 'construct'],
  resistance: 'magic',
  raidRoom: 'exodus_glass_desert',
});
droptables.define('exodus_corrupted_crystal', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 1680, max: 5040 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

// --- Final Boss: The Corruption ---

npcs.defineNpc('exodus_corruption', {
  name: 'The Corruption',
  combat: 650,
  maxHp: 1500,
  maxHit: 72,
  stats: { attack: 350, strength: 340, defence: 350 },
  attackSpeed: 4,
  attackRange: 15,
  attackStyle: 'magic',
  size: 7,
  aggressive: true,
  aggroRange: 20,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'The source of all corruption in Aelgard. A force of entropy from beyond the world. This is the final battle.',
  weakness: 'none',
  tags: ['raid', 'exodus', 'corruption', 'boss', 'endgame', 'final'],
  raidRoom: 'exodus_final',
  phases: [
    {
      name: 'Phase 1: Eight Arms',
      hpRange: [1.0, 0.80],
      description: 'The Corruption extends 8 tendrils, one for each region. Each tendril uses the attack style it\'s weakest against (Heartlands tendril uses melee, Boneyard uses magic, etc). Must destroy all 8 tendrils before damaging the core.',
      tendrilCount: 8,
      tendrilHp: 150,
      tendrilStyles: ['melee', 'magic', 'melee', 'melee', 'ranged', 'ranged', 'magic', 'magic'],
      tendrilWeaknesses: ['magic', 'ranged', 'slash', 'slash', 'crush', 'magic', 'ranged', 'crush'],
    },
    {
      name: 'Phase 2: The Mirror',
      hpRange: [0.80, 0.55],
      description: 'The Corruption copies the attack pattern of whoever dealt the most damage in Phase 1. Targets that player specifically. Other players must DPS while the targeted player tanks.',
      copyTopDamager: true,
      maxHitOverride: 60,
      specialAttack: {
        name: 'Corruption Wave',
        description: 'A wave of corruption spreads from the boss in all directions. 3 tiles wide. 45 damage. Must jump over it.',
        waveWidth: 3,
        damage: 45,
        tickInterval: 10,
      },
    },
    {
      name: 'Phase 3: Dissolution',
      hpRange: [0.55, 0.25],
      description: 'The Corruption dissolves the arena. Floor tiles disappear one by one. Standing on nothing = instant death. Must keep moving. Cycles all styles every 3 ticks. Max hit 75.',
      floorDecayRate: 1, // tiles per tick
      cycleInterval: 3,
      attackStyles: ['magic', 'ranged', 'melee'],
      correctPrayers: ['protect_from_magic', 'protect_from_missiles', 'protect_from_melee'],
      maxHitOverride: 75,
      attackSpeedOverride: 3,
    },
    {
      name: 'Phase 4: Exodus',
      hpRange: [0.25, 0.0],
      description: 'The Corruption makes its final stand. The portal to another world opens. Arena is 5x5. All styles every 2 ticks. Max hit 85. Spawns corruption orbs that orbit the arena. 90-tick enrage timer -- if not killed, it consumes everything.',
      arenaSize: 5,
      cycleInterval: 2,
      attackStyles: ['magic', 'ranged', 'melee'],
      correctPrayers: ['protect_from_magic', 'protect_from_missiles', 'protect_from_melee'],
      maxHitOverride: 85,
      attackSpeedOverride: 2,
      enrageTimer: 90,
      orbitingOrbs: {
        count: 6,
        damage: 30,
        speed: 3,
      },
    },
  ],
});

// Drop tables

// Pet: Spark of Corruption
items.define({
  id: 84014,
  name: 'Spark of Corruption',
  examine: 'A contained spark of the Corruption. It writhes and pulses but cannot escape its crystalline prison. The rarest pet in Aelgard.',
  value: 0,
  category: 'pet',
  tradeable: false,
  weight: 0,
});

droptables.define('exodus_corruption', {
  always: [],
  main: [
    { id: 101, name: 'Coins', weight: 4, min: 100000, max: 500000 },
    { id: 11363, name: 'Soul rune', weight: 3, min: 150, max: 400 },
    { id: 11364, name: 'Wrath rune', weight: 3, min: 80, max: 200 },
    { id: 11358, name: 'Blood rune', weight: 3, min: 200, max: 500 },
    { id: 0, name: 'Nothing', weight: 1, min: 0, max: 0 },
  ],
  tertiary: [
    { id: 96038, name: 'Exodus blade', chance: 200, min: 1, max: 1 },
    { id: 96039, name: 'Exodus ward', chance: 250, min: 1, max: 1 },
    { id: 96040, name: "Herald's cape", chance: 300, min: 1, max: 1 },
    { id: 84014, name: 'Spark of Corruption', chance: 5000, min: 1, max: 1 },
  ],
});

const THE_EXODUS = {
  id: 'the_exodus',
  name: 'The Exodus',
  shortName: 'Exodus',
  description: 'The final raid of Aelgard. A portal to another world opens in the Glass Desert. Fight through 8 rooms representing each region\'s corruption, then face The Corruption itself. Every skill, every prayer, every piece of knowledge matters. This is the end.',
  location: 'Glass Desert, The World Gate',
  region: 'glass_desert',
  minPlayers: 5,
  maxPlayers: 10,
  estimatedTime: { min: 50, max: 80, unit: 'minutes' },
  requirements: {
    combat: 110,
    skills: { mining: 75, fishing: 70, woodcutting: 70, herblore: 70 },
    quests: [],
    recommended: { combat: 126, skills: { prayer: 77, mining: 85, fishing: 80, woodcutting: 80, herblore: 80 } },
  },
  rooms: [
    { id: 'exodus_heartlands', name: 'Corrupted Heartlands', type: 'combat', bosses: ['exodus_corrupted_knight'], description: 'The Heartlands consumed by corruption. Fight a fallen knight.' },
    { id: 'exodus_boneyard', name: 'Corrupted Boneyard', type: 'combat', bosses: ['exodus_corrupted_pharaoh'], description: 'The Boneyard Wastes rotting further. A pharaoh risen wrong.' },
    { id: 'exodus_moryskah', name: 'Corrupted Moryskah', type: 'combat', bosses: ['exodus_corrupted_vampyre'], description: 'Moryskah\'s darkness deepened. A vampyre beyond salvation.' },
    { id: 'exodus_veilwood', name: 'Corrupted Veilwood', type: 'combat', bosses: ['exodus_corrupted_treant'], description: 'Veilwood\'s enchantment turned foul. A treant rotting from within.' },
    { id: 'exodus_sootworks', name: 'Corrupted Sootworks', type: 'skill_combat', bosses: ['exodus_corrupted_automaton'], mechanic: 'mining', description: 'The Sootworks overrun. Mining skill required to expose weak points.' },
    { id: 'exodus_saltbrine', name: 'Corrupted Saltbrine', type: 'skill_combat', bosses: ['exodus_corrupted_captain'], mechanic: 'fishing', description: 'Saltbrine Reach drowned. Fishing skill required to lure the captain.' },
    { id: 'exodus_inkweald', name: 'Corrupted Inkweald', type: 'combat', bosses: ['exodus_corrupted_dreamer'], description: 'Inkweald\'s dreams turned nightmare. A dreamer lost forever.' },
    { id: 'exodus_glass_desert', name: 'Corrupted Glass Desert', type: 'combat', bosses: ['exodus_corrupted_crystal'], description: 'The Glass Desert shattered. A crystal turned weapon.' },
    { id: 'exodus_final', name: 'The Corruption', type: 'boss', bosses: ['exodus_corruption'], mechanic: 'phasedBoss', description: 'The source of all corruption. The final battle for Aelgard.', alwaysLast: true },
  ],
};


// ##############################################################################
//
//   SUMMARY & EXPORTS
//
// ##############################################################################

const RAIDS_MEGA_2 = {
  // Glass Desert
  PRISM_LABYRINTH,
  DRAGON_FORGE,
  COLOSSEUM,
  // The Wilds
  REVENANT_CAVES_RAID,
  WILDERNESS_FORTRESS,
  ABYSSAL_NEXUS,
  // Cross-Region
  GRAND_HUNT,
  CALAMITY_PROTOCOL,
  IRON_GAUNTLET,
  // Themed
  MUSHROOM_GROTTO,
  FROST_CITADEL,
  VOLCANIC_DEPTHS,
  TIDAL_FORTRESS,
  DREAM_COLOSSEUM,
  THE_EXODUS,
};

// ── Load summary ──────────────────────────────────────────────────────────────

console.log('');
console.log('='.repeat(70));
console.log('[aelgard] Raids mega pack 2: 15 raids loaded');
console.log('='.repeat(70));
console.log('');
console.log('  GLASS DESERT (3):');
console.log('    16. The Prism Labyrinth    -- solo/duo, crystal maze, light phases');
console.log('    17. The Dragon Forge       -- 3-5p, forge weapons mid-raid');
console.log('    18. The Colosseum          -- solo, 12 waves + Champion');
console.log('');
console.log('  THE WILDS (3):');
console.log('    19. Revenant Caves Raid    -- 3-5p, PvP-enabled, revenants');
console.log('    20. Wilderness Fortress    -- 8-20p, siege raid');
console.log('    21. Abyssal Nexus          -- 4-8p, zero-gravity combat');
console.log('');
console.log('  CROSS-REGION (3):');
console.log('    22. The Grand Hunt         -- 3-5p, all 8 regions, all skills');
console.log('    23. The Calamity Protocol  -- 5-20p, world defense event');
console.log('    24. The Iron Gauntlet      -- solo, start with nothing');
console.log('');
console.log('  THEMED (6):');
console.log('    25. Mushroom Grotto        -- Veilwood, 3-5p, spore mechanics');
console.log('    26. Frost Citadel          -- Heartlands/Wilds, 4-8p, freeze mechanics');
console.log('    27. Volcanic Depths        -- Sootworks, 3-5p, heat accumulation');
console.log('    28. Tidal Fortress         -- Saltbrine, 4-8p, tide flooding');
console.log('    29. Dream Colosseum        -- Inkweald, solo, fight your past');
console.log('    30. The Exodus             -- Glass Desert, 5-10p, THE FINAL RAID');
console.log('');
console.log('  Items:  96000-96040 (41 unique items)');
console.log('  Pets:   84000-84014 (15 raid pets)');
console.log('  Bosses: 55+ NPCs defined');
console.log('='.repeat(70));
console.log('');

module.exports = RAIDS_MEGA_2;
