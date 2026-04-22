// ==============================================================================
// Aelgard -- Raids & Bosses Mega Expansion
//
// RAID 3: Tombs of Aelgard (ToA) -- Boneyard Wastes pyramid, 1-8 players
// 15 additional bosses across all regions (entry / mid / endgame)
//
// Manifesto:
//   P04 Non-degenerate   -- invocation system forces mastery, not cheese
//   P08 Breakpoint        -- Torva, Virtus, Masori, Tumeken's shadow = new ceilings
//   P12 Encounter itemiz. -- every boss rewards a specific niche
//   P13 Design knobs      -- invocations ARE the knob: 0 to 600 difficulty
//
// Item IDs: 92000-92199  (unique items + materials)
// Pet  IDs: 83001-83020  (boss pets)
// NPC def IDs: all unique, prefixed by region or raid
//
// ==============================================================================

const items = require('../../data/items');
const npcs = require('../../world/npcs');
const droptables = require('../../data/droptables');
const registry = require('../../engine/content-registry');

// Helper -- same pattern as bosses-expanded.js
function boss(defId, def, drops, petId, petName, petExamine) {
  npcs.defineNpc(defId, def);
  if (drops) droptables.define(defId, drops);
  if (petId) {
    items.define({ id: petId, name: petName, examine: petExamine, value: 0, category: 'pet', tradeable: false, weight: 0 });
    if (drops && !drops.tertiary) drops.tertiary = [];
    if (drops) drops.tertiary.push({ id: petId, name: petName, chance: 3000, min: 1, max: 1 });
  }
}


// ##############################################################################
//
//   SECTION 1 -- TOMBS OF AELGARD UNIQUE ITEMS
//
//   IDs 92000-92049: ToA uniques + materials
//
//   Key innovation: invocation system.
//   Higher raid level = harder monsters + better unique rates.
//   Base 0 = entry. 150 = normal. 300 = expert. 600 = max.
//
// ##############################################################################

// ---------- Osmumten's fang ----------
// BIS stab weapon against high-defence targets.
// Accuracy formula doubles effective accuracy vs targets with defence > 200.
// Worse than Ghrazi rapier against low-def targets (lower raw max hit).
// Niche: endgame bosses with high def (Nex, Corp, Tekton, etc).
items.define({
  id: 92000,
  name: "Osmumten's fang",
  examine: "A fang of the desert pharaoh Osmumten. Its edge finds gaps in the thickest armour.",
  value: 15000000,
  category: 'weapon',
  equipSlot: 'weapon',
  speed: 5,
  stats: { stab: 105, slash: 75, melee_strength: 103 },
  equipReqs: { attack: 82 },
  passiveEffect: {
    name: 'Fang Precision',
    description: 'Accuracy roll is doubled against targets with defence level > 200. Minimum hit is 15% of max hit.',
    highDefThreshold: 200,
    accuracyMultiplier: 2.0,
    minHitPercent: 0.15,
  },
});

// ---------- Masori armour set (3 pieces) ----------
// BIS ranged DPS armour. Glass cannon: highest ranged attack and strength
// bonuses in the game, but defence stats are LOWER than black dragonhide.
// Trade-off: you hit harder but die faster. Perfect for experienced raiders.
items.define({
  id: 92001,
  name: 'Masori mask',
  examine: 'A mask of the Masori order. Feather-light and razor-sharp. Offers little protection.',
  value: 8000000,
  category: 'armour',
  equipSlot: 'head',
  stats: {
    ranged: 12, ranged_strength: 4,
    def_stab: 3, def_slash: 5, def_crush: 7,
    def_magic: -1, def_ranged: 8,
  },
  equipReqs: { ranged: 80, defence: 80 },
  setId: 'masori',
});

items.define({
  id: 92002,
  name: 'Masori body',
  examine: 'A chestpiece of the Masori order. Built for speed and lethality, not survival.',
  value: 25000000,
  category: 'armour',
  equipSlot: 'body',
  stats: {
    ranged: 31, ranged_strength: 8,
    def_stab: 12, def_slash: 18, def_crush: 22,
    def_magic: -4, def_ranged: 24,
  },
  equipReqs: { ranged: 80, defence: 80 },
  setId: 'masori',
});

items.define({
  id: 92003,
  name: 'Masori chaps',
  examine: 'Leg armour of the Masori order. Ventilated for agility. Will not save you from a direct hit.',
  value: 18000000,
  category: 'armour',
  equipSlot: 'legs',
  stats: {
    ranged: 17, ranged_strength: 4,
    def_stab: 6, def_slash: 9, def_crush: 12,
    def_magic: -3, def_ranged: 14,
  },
  equipReqs: { ranged: 80, defence: 80 },
  setId: 'masori',
  setEffect: {
    name: 'Masori Focus',
    pieces: ['masori_mask', 'masori_body', 'masori_chaps'],
    description: 'Full set: +5% ranged max hit. Incoming damage increased by 10% (glass cannon).',
    rangedDamageBonus: 0.05,
    incomingDamageIncrease: 0.10,
  },
});

// ---------- Lightbearer ring ----------
// Halves special attack energy restore time (from 50 seconds to 25).
// No combat stats at all. Trade-off: you give up a ring slot (Berserker
// ring, Archers ring, etc) for much more frequent specs.
// Niche: bosses where spec weapon is critical (DWH at Tekton, claws at Verzik).
items.define({
  id: 92004,
  name: 'Lightbearer',
  examine: 'A ring that channels the light of Tumeken. Special attack energy restores twice as fast.',
  value: 5000000,
  category: 'jewellery',
  equipSlot: 'ring',
  stats: {},
  equipReqs: {},
  passiveEffect: {
    name: 'Light of Tumeken',
    description: 'Special attack energy restores at double the normal rate.',
    specRestoreMultiplier: 2.0,
  },
});

// ---------- Elidinis' ward ----------
// BIS magic shield. Can be upgraded with an Arcane sigil for even better stats.
// Base version is good; upgraded version is strictly BIS.
items.define({
  id: 92005,
  name: "Elidinis' ward",
  examine: "A ward blessed by the goddess Elidinis. Shields the wielder's mind.",
  value: 8000000,
  category: 'armour',
  equipSlot: 'shield',
  stats: {
    magic: 25, magic_strength: 5, prayer: 3,
    def_stab: 40, def_slash: 42, def_crush: 38,
    def_magic: 5, def_ranged: 38,
  },
  equipReqs: { magic: 80, defence: 80, prayer: 60 },
});

items.define({
  id: 92006,
  name: "Elidinis' ward (f)",
  examine: "An Elidinis' ward fortified with an Arcane sigil. The ultimate magic shield.",
  value: 25000000,
  category: 'armour',
  equipSlot: 'shield',
  stats: {
    magic: 30, magic_strength: 8, prayer: 5,
    def_stab: 53, def_slash: 55, def_crush: 52,
    def_magic: 8, def_ranged: 52,
  },
  equipReqs: { magic: 80, defence: 80, prayer: 70 },
});

// ---------- Shadow of Tumeken / Tumeken's shadow ----------
// Powered staff. Damage scales with magic level.
// At 99 magic: 44 max hit per tick. BIS magic DPS by a wide margin.
// But: requires 5 soul runes + 5 chaos runes per cast (extremely expensive).
// Also 3x slower than harmonised Nightmare staff for standard spells.
// Niche: any boss weak to magic where you can afford the rune cost.
items.define({
  id: 92007,
  name: "Shadow of Tumeken",
  examine: 'An uncharged shadow staff. Requires a soul and chaos rune charge to awaken.',
  value: 5000000,
  category: 'weapon',
  weight: 2.5,
});

items.define({
  id: 92008,
  name: "Tumeken's shadow",
  examine: "The shadow of a god. Its magic triples your offensive power. The most devastating staff ever created.",
  value: 80000000,
  category: 'weapon',
  equipSlot: 'weapon',
  twoHanded: true,
  speed: 5,
  stats: { magic: 35, magic_strength: 25 },
  equipReqs: { magic: 85 },
  ammoType: 'soul_chaos_rune',
  ammoCost: { soul: 5, chaos: 5 },
  passiveEffect: {
    name: 'Shadow Power',
    description: 'Triples magic attack and magic strength from equipment (applied before roll). Max hit scales with magic level.',
    magicMultiplier: 3.0,
    levelScaling: true,
    maxHitAtLevel99: 44,
  },
});

// ---------- Thread of Elidinis ----------
// Used to repair degraded Masori armour. Consumable.
items.define({
  id: 92009,
  name: 'Thread of Elidinis',
  examine: 'A sacred thread. Can repair worn Masori armour to pristine condition.',
  value: 2000000,
  category: 'crafting',
  tradeable: true,
  weight: 0.1,
});

// ---------- Keris partisan ----------
// Melee weapon effective against kalphite/scarab type monsters.
// +33% accuracy and +25% damage vs kalphite/scarab tags.
// Can be upgraded with three different jewels for different effects.
items.define({
  id: 92010,
  name: 'Keris partisan',
  examine: 'A weapon of the desert warriors. Designed to pierce insectoid armour.',
  value: 500000,
  category: 'weapon',
  equipSlot: 'weapon',
  speed: 4,
  stats: { stab: 68, melee_strength: 62 },
  equipReqs: { attack: 65 },
  passiveEffect: {
    name: 'Insectbane',
    description: '+33% accuracy and +25% damage against kalphite and scarab monsters. 1/51 chance to deal triple damage.',
    targetTags: ['kalphite', 'scarab'],
    accuracyBonus: 0.33,
    damageBonus: 0.25,
    tripleHitChance: 1 / 51,
  },
});

// ---------- Breach of the scarab (Keris upgrade) ----------
items.define({
  id: 92011,
  name: 'Breach of the scarab',
  examine: 'A jewel pried from the Scarab God. Attach to the Keris partisan for armour-piercing strikes.',
  value: 3000000,
  category: 'crafting',
  weight: 0.3,
});

items.define({
  id: 92012,
  name: 'Keris partisan of breaching',
  examine: 'A Keris partisan set with the Breach of the Scarab. Ignores 33% of target defence.',
  value: 4000000,
  category: 'weapon',
  equipSlot: 'weapon',
  speed: 4,
  stats: { stab: 78, melee_strength: 72 },
  equipReqs: { attack: 80 },
  passiveEffect: {
    name: 'Insectbane+',
    description: 'Insectbane effect plus ignores 33% of target defence on every hit.',
    targetTags: ['kalphite', 'scarab'],
    accuracyBonus: 0.33,
    damageBonus: 0.25,
    tripleHitChance: 1 / 51,
    defenceReduction: 0.33,
  },
});

// ---------- Eye of the corruptor (Keris upgrade) ----------
items.define({
  id: 92013,
  name: 'Eye of the corruptor',
  examine: 'A pulsing eye jewel. Attach to the Keris partisan. 1 in 3 hits corrupts the target for triple damage.',
  value: 5000000,
  category: 'crafting',
  weight: 0.3,
});

items.define({
  id: 92014,
  name: 'Keris partisan of corruption',
  examine: 'A Keris partisan set with the Eye of the Corruptor. Corrupts enemies on 1/3 of hits for 3x damage.',
  value: 6000000,
  category: 'weapon',
  equipSlot: 'weapon',
  speed: 4,
  stats: { stab: 74, melee_strength: 68 },
  equipReqs: { attack: 80 },
  passiveEffect: {
    name: 'Corruption',
    description: '1/3 chance per hit to corrupt the target, dealing 3x damage that hit. Especially devastating vs kalphite/scarab.',
    corruptChance: 1 / 3,
    corruptDamageMultiplier: 3.0,
    targetTags: ['kalphite', 'scarab'],
    accuracyBonus: 0.33,
    damageBonus: 0.25,
  },
});

// ---------- Jewel of the sun (Keris upgrade) ----------
items.define({
  id: 92015,
  name: 'Jewel of the sun',
  examine: 'A radiant amber jewel. Attach to the Keris partisan. Heals the wielder on kalphite kills.',
  value: 4000000,
  category: 'crafting',
  weight: 0.3,
});

items.define({
  id: 92016,
  name: 'Keris partisan of the sun',
  examine: 'A Keris partisan set with the Jewel of the Sun. Heals the wielder when slaying kalphite creatures.',
  value: 5000000,
  category: 'weapon',
  equipSlot: 'weapon',
  speed: 4,
  stats: { stab: 74, melee_strength: 68 },
  equipReqs: { attack: 80 },
  passiveEffect: {
    name: 'Solar Leech',
    description: 'Heals 8 HP on every kalphite/scarab kill. Insectbane effect included.',
    healOnKill: 8,
    targetTags: ['kalphite', 'scarab'],
    accuracyBonus: 0.33,
    damageBonus: 0.25,
    tripleHitChance: 1 / 51,
  },
});

// ---------- Tomb supplies (non-unique, used in raid) ----------
items.define({
  id: 92040,
  name: 'Scarab amulet',
  examine: 'A teleport to the Tombs of Aelgard entrance.',
  value: 10000,
  category: 'teleport',
  tradeable: false,
  weight: 0.5,
});

items.define({
  id: 92041,
  name: 'Tomb relic',
  examine: 'An artefact from the Tombs. Exchange for Prayer or Crafting experience.',
  value: 30000,
  category: 'misc',
  tradeable: false,
  weight: 2,
});

items.define({
  id: 92042,
  name: 'Lily of the sands',
  examine: 'A rare desert flower found in the tombs. Used to recharge Masori armour.',
  value: 50000,
  category: 'crafting',
  tradeable: true,
  stackable: true,
  weight: 0.1,
});


// ##############################################################################
//
//   SECTION 2 -- TOMBS OF AELGARD: INVOCATION SYSTEM
//
// ##############################################################################

const TOA_INVOCATIONS = [
  {
    id: 'tougher_monsters',
    name: 'Toughened Up',
    description: 'All monsters in the tombs have 25% more HP.',
    raidLevelIncrease: 25,
    effect: { hpMultiplier: 1.25 },
  },
  {
    id: 'no_food_drops',
    name: 'On a Diet',
    description: 'Monsters no longer drop food during the raid.',
    raidLevelIncrease: 15,
    effect: { suppressFoodDrops: true },
  },
  {
    id: 'prayer_drain',
    name: 'Aerial Assault',
    description: 'Prayer drain rate is doubled throughout the raid.',
    raidLevelIncrease: 20,
    effect: { prayerDrainMultiplier: 2.0 },
  },
  {
    id: 'harder_hits',
    name: 'Walk the Line',
    description: 'All monsters hit 15% harder.',
    raidLevelIncrease: 25,
    effect: { damageMultiplier: 1.15 },
  },
  {
    id: 'less_time',
    name: 'Need for Speed',
    description: '30% less time between room transitions.',
    raidLevelIncrease: 10,
    effect: { transitionTimeMultiplier: 0.70 },
  },
  {
    id: 'boss_enrage',
    name: 'Feeling Special',
    description: 'Bosses enrage at 50% HP: attack speed +1, max hit +20%.',
    raidLevelIncrease: 30,
    effect: { enrageThreshold: 0.50, enrageSpeedBonus: 1, enrageDamageMultiplier: 1.20 },
  },
  {
    id: 'deadly_prayers',
    name: 'Overclocked',
    description: 'Incorrect overhead prayers deal 25 damage to the player.',
    raidLevelIncrease: 20,
    effect: { wrongPrayerDamage: 25 },
  },
  {
    id: 'softcore',
    name: 'Softcore Run',
    description: 'One free death per player. Second death is permanent.',
    raidLevelIncrease: 5,
    effect: { freeDeaths: 1 },
  },
  {
    id: 'no_deaths',
    name: 'Hardcore Run',
    description: 'No deaths allowed. Any death ends the raid.',
    raidLevelIncrease: 50,
    effect: { freeDeaths: 0, failOnDeath: true },
  },
  {
    id: 'monster_accuracy',
    name: 'Penetration',
    description: 'All monsters have +30% accuracy.',
    raidLevelIncrease: 25,
    effect: { monsterAccuracyMultiplier: 1.30 },
  },
  {
    id: 'double_specials',
    name: 'Not Just a Heads Up',
    description: 'Bosses use special attacks twice as often.',
    raidLevelIncrease: 35,
    effect: { specialFrequencyMultiplier: 2.0 },
  },
  {
    id: 'supply_drought',
    name: 'Blood Thinners',
    description: 'Supply drops from all sources reduced by 50%.',
    raidLevelIncrease: 15,
    effect: { supplyDropMultiplier: 0.50 },
  },
  {
    id: 'quiet_prayers',
    name: 'Quiet Prayers',
    description: 'Protection prayers only block 50% of damage instead of 100%.',
    raidLevelIncrease: 40,
    effect: { protectionPrayerEffectiveness: 0.50 },
  },
  {
    id: 'ancient_haste',
    name: 'Ancient Haste',
    description: 'All boss attack speeds increased by 1 tick.',
    raidLevelIncrease: 50,
    effect: { bossAttackSpeedBonus: 1 },
  },
];


// ##############################################################################
//
//   SECTION 3 -- TOMBS OF AELGARD: BOSS DEFINITIONS
//
//   4 path bosses + 1 final boss
//   Every boss has full stats, weakness, tags, phases, and mechanics.
//
// ##############################################################################

// ---------- Path of the Serpent: Zebak ----------
// Crocodile boss. Water arena with river current.
// Dodge boulders rolling down the river while DPSing.
// When enraged, spawns jug of poison that must be destroyed.
npcs.defineNpc('toa_zebak', {
  name: 'Zebak',
  combat: 460,
  maxHp: 580,
  maxHit: 44,
  stats: { attack: 250, strength: 240, defence: 220 },
  attackSpeed: 5,
  attackRange: 6,
  attackStyle: 'ranged',
  size: 5,
  aggressive: true,
  aggroRange: 12,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'An ancient crocodilian guardian. The river obeys its will.',
  weakness: 'magic',
  tags: ['raid', 'tombs', 'beast', 'boss'],
  resistance: 'melee',
  raidRoom: 'serpent_path',
  phases: [
    {
      name: 'Phase 1: River',
      hpRange: [1.0, 0.50],
      description: 'Zebak attacks with ranged water blasts. Boulders roll down the river every 8 ticks. Standing in the river pushes you downstream.',
      attackStyle: 'ranged',
      specialAttack: {
        name: 'Boulder Wave',
        description: 'Boulders roll down the river in 3 lanes. Stand between them or take 35 damage.',
        boulderDamage: 35,
        laneCount: 3,
        tickInterval: 8,
      },
    },
    {
      name: 'Phase 2: Enrage',
      hpRange: [0.50, 0.0],
      description: 'Zebak roars. Acid jugs spawn on the banks -- destroy them before they explode for 50 AoE. Attack speed increases. Boulders every 6 ticks.',
      maxHitOverride: 52,
      attackSpeedOverride: 4,
      acidJug: {
        name: 'Acid Jug',
        hp: 40,
        explosionDamage: 50,
        aoeSize: 3,
        spawnInterval: 12,
      },
    },
  ],
});

// ---------- Path of the Scarab: Kephri ----------
// Giant scarab boss. Spawn management + shield mechanic.
// Kephri periodically raises an arcane shield. Must kill the
// scarab swarms to break the shield, then DPS the boss.
npcs.defineNpc('toa_kephri', {
  name: 'Kephri',
  combat: 440,
  maxHp: 550,
  maxHit: 38,
  stats: { attack: 230, strength: 220, defence: 260 },
  attackSpeed: 5,
  attackRange: 4,
  attackStyle: 'melee',
  size: 4,
  aggressive: true,
  aggroRange: 10,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A colossal scarab that has guarded these tombs for millennia. Its carapace deflects blades.',
  weakness: 'crush',
  tags: ['raid', 'tombs', 'scarab', 'kalphite', 'boss', 'armoured'],
  resistance: 'ranged',
  raidRoom: 'scarab_path',
  phases: [
    {
      name: 'Phase 1: Active',
      hpRange: [1.0, 0.60],
      description: 'Kephri attacks with melee and spawns scarab swarms every 10 ticks. Kill the swarms before they reach Kephri or she heals 30 HP each.',
      spawnInterval: 10,
      spawnDefId: 'toa_scarab_swarm',
      healPerSwarm: 30,
    },
    {
      name: 'Shield Phase',
      hpThreshold: 0.60,
      description: 'Kephri raises an arcane shield (200 HP). Must destroy the shield before you can damage her. While shielded, she spawns swarms twice as fast.',
      shieldHp: 200,
      spawnInterval: 5,
    },
    {
      name: 'Phase 2: Desperate',
      hpRange: [0.60, 0.0],
      description: 'Shield broken. Kephri enrages: attack speed +1, dung ball attack (rolling boulder in 5-tile line for 40 dmg).',
      attackSpeedOverride: 4,
      specialAttack: {
        name: 'Dung Ball',
        description: 'Rolls a dung ball in a line toward a player. 5-tile line, 40 damage on contact.',
        damage: 40,
        lineLength: 5,
        tickInterval: 10,
      },
    },
  ],
});

npcs.defineNpc('toa_scarab_swarm', {
  name: 'Scarab Swarm',
  combat: 50,
  maxHp: 25,
  maxHit: 8,
  stats: { attack: 40, strength: 35, defence: 20 },
  attackSpeed: 3,
  attackRange: 1,
  attackStyle: 'melee',
  size: 1,
  aggressive: true,
  aggroRange: 15,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A swarm of tomb scarabs. They seek their queen to restore her.',
  weakness: 'crush',
  tags: ['raid', 'tombs', 'scarab', 'kalphite'],
  raidRoom: 'scarab_path',
  raidMechanic: 'Walks toward Kephri. If it reaches her, she heals 30 HP.',
  priorityTarget: 'toa_kephri',
});
droptables.define('toa_scarab_swarm', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 200, max: 600 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

// ---------- Path of the Sun: Akkha ----------
// Warrior boss. 4 elemental phases, each requiring a different prayer.
// Shadow (pray melee) -> Lightning (pray ranged) -> Fire (pray magic) -> Ice (pray melee).
// Phase transitions have AoE that must be dodged.
npcs.defineNpc('toa_akkha', {
  name: 'Akkha',
  combat: 480,
  maxHp: 640,
  maxHit: 48,
  stats: { attack: 270, strength: 260, defence: 240 },
  attackSpeed: 4,
  attackRange: 1,
  attackStyle: 'melee',
  size: 3,
  aggressive: true,
  aggroRange: 10,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A warrior blessed by four elements. Each phase demands a different prayer.',
  weakness: 'stab',
  tags: ['raid', 'tombs', 'warrior', 'boss'],
  raidRoom: 'sun_path',
  phases: [
    {
      name: 'Shadow Phase',
      hpRange: [1.0, 0.75],
      description: 'Akkha channels shadow. Melee attacks. Pray melee. Leaves shadow trails on the ground (2 dmg/tick if stood on).',
      attackStyle: 'melee',
      correctPrayer: 'protect_from_melee',
      specialAttack: {
        name: 'Shadow Trail',
        description: 'Leaves shadow on tiles he walks over. Standing on shadow deals 2 damage per tick for 10 ticks.',
        damagePerTick: 2,
        duration: 10,
      },
    },
    {
      name: 'Lightning Phase',
      hpRange: [0.75, 0.50],
      description: 'Akkha crackles with lightning. Ranged attacks. Pray ranged. Lightning orbs track players -- dodge them.',
      attackStyle: 'ranged',
      correctPrayer: 'protect_from_missiles',
      specialAttack: {
        name: 'Lightning Orbs',
        description: '2 lightning orbs spawn and track random players. Contact deals 30 damage.',
        orbCount: 2,
        orbDamage: 30,
        orbSpeed: 2,
        tickInterval: 12,
      },
    },
    {
      name: 'Fire Phase',
      hpRange: [0.50, 0.25],
      description: 'Akkha bursts into flame. Magic attacks. Pray magic. Fire walls close in from arena edges.',
      attackStyle: 'magic',
      correctPrayer: 'protect_from_magic',
      specialAttack: {
        name: 'Fire Wall',
        description: 'Fire walls close in from 2 edges, shrinking the safe zone. 25 damage per tick in fire.',
        wallDamage: 25,
        shrinkRate: 1,
        tickInterval: 15,
      },
    },
    {
      name: 'Ice Phase',
      hpRange: [0.25, 0.0],
      description: 'Akkha freezes. Melee attacks that also drain prayer (5 per hit). Pray melee. Floor ices over -- reduced movement speed.',
      attackStyle: 'melee',
      correctPrayer: 'protect_from_melee',
      prayerDrainPerHit: 5,
      movementSpeedReduction: 0.50,
      maxHitOverride: 56,
    },
  ],
});

// ---------- Path of the Shadow: Ba-Ba ----------
// Baboon chief. Falling boulders + banana bomb throws.
// Ba-Ba throws exploding bananas at players and summons baboon thralls.
npcs.defineNpc('toa_baba', {
  name: 'Ba-Ba',
  combat: 450,
  maxHp: 520,
  maxHit: 42,
  stats: { attack: 240, strength: 250, defence: 200 },
  attackSpeed: 5,
  attackRange: 5,
  attackStyle: 'melee',
  size: 4,
  aggressive: true,
  aggroRange: 10,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'Chief of the tomb baboons. Throws explosive bananas and commands his troop.',
  weakness: 'slash',
  tags: ['raid', 'tombs', 'beast', 'boss'],
  resistance: 'magic',
  raidRoom: 'shadow_path',
  phases: [
    {
      name: 'Phase 1: Siege',
      hpRange: [1.0, 0.50],
      description: 'Ba-Ba attacks with melee and throws banana bombs at random tiles. Boulders fall from the ceiling every 12 ticks. Spawns 2 baboon thralls every 15 ticks.',
      specialAttack: {
        name: 'Banana Bomb',
        description: 'Throws an exploding banana at a random tile. 3x3 AoE, 30 damage. 2-tick fuse.',
        aoeSize: 3,
        damage: 30,
        fuseTime: 2,
        tickInterval: 8,
      },
      boulderFall: {
        description: 'Boulders fall from the ceiling onto random 2x2 areas.',
        damage: 35,
        aoeSize: 2,
        tickInterval: 12,
      },
      spawnInterval: 15,
      spawnDefId: 'toa_baboon_thrall',
      spawnCount: 2,
    },
    {
      name: 'Phase 2: Rampage',
      hpRange: [0.50, 0.0],
      description: 'Ba-Ba rampages. Charges at players (45 damage, dodge sideways). Banana bombs every 5 ticks. Boulders every 8 ticks. Baboon thralls every 10 ticks.',
      specialAttack: {
        name: 'Charge',
        description: 'Ba-Ba charges in a line toward a player. 45 damage on contact. Sidestep to dodge.',
        damage: 45,
        dodgeable: true,
        tickInterval: 15,
      },
      bananaBombInterval: 5,
      boulderInterval: 8,
      spawnInterval: 10,
      maxHitOverride: 50,
    },
  ],
});

npcs.defineNpc('toa_baboon_thrall', {
  name: 'Baboon Thrall',
  combat: 65,
  maxHp: 30,
  maxHit: 10,
  stats: { attack: 50, strength: 45, defence: 25 },
  attackSpeed: 3,
  attackRange: 1,
  attackStyle: 'melee',
  size: 1,
  aggressive: true,
  aggroRange: 10,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A tomb baboon loyal to Ba-Ba. Distracting but fragile.',
  weakness: 'slash',
  tags: ['raid', 'tombs', 'beast'],
  raidRoom: 'shadow_path',
});
droptables.define('toa_baboon_thrall', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 260, max: 780 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

// ---------- Final Boss: Warden of the Tombs ----------
// Two massive constructs. Obelisk phase then core phase.
// Phase 1: Fight the two Wardens simultaneously. They share an obelisk
//          that must be destroyed to prevent them from healing.
// Phase 2: Wardens fuse into a single entity with exposed core.
//          Core takes 5x damage but is only exposed for 10 ticks between
//          warden attacks. Must avoid skull projectiles and ground AoE.
npcs.defineNpc('toa_warden_elidinis', {
  name: 'Elidinis Warden',
  combat: 500,
  maxHp: 700,
  maxHit: 50,
  stats: { attack: 280, strength: 260, defence: 270 },
  attackSpeed: 5,
  attackRange: 8,
  attackStyle: 'magic',
  size: 5,
  aggressive: true,
  aggroRange: 15,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A colossal construct of divine magic. One half of the tomb guardians.',
  weakness: 'ranged',
  tags: ['raid', 'tombs', 'construct', 'boss', 'armoured'],
  resistance: 'melee',
  raidRoom: 'wardens',
});
droptables.define('toa_warden_elidinis', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 2000, max: 6000 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

npcs.defineNpc('toa_warden_tumeken', {
  name: 'Tumeken Warden',
  combat: 500,
  maxHp: 700,
  maxHit: 50,
  stats: { attack: 280, strength: 260, defence: 270 },
  attackSpeed: 5,
  attackRange: 1,
  attackStyle: 'melee',
  size: 5,
  aggressive: true,
  aggroRange: 10,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A colossal construct of divine fire. One half of the tomb guardians.',
  weakness: 'magic',
  tags: ['raid', 'tombs', 'construct', 'boss', 'armoured'],
  resistance: 'ranged',
  raidRoom: 'wardens',
});
droptables.define('toa_warden_tumeken', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 2000, max: 6000 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

npcs.defineNpc('toa_warden_obelisk', {
  name: 'Obelisk of the Tombs',
  combat: 0,
  maxHp: 300,
  maxHit: 0,
  stats: { attack: 0, strength: 0, defence: 150 },
  attackSpeed: 0,
  attackRange: 0,
  attackStyle: 'none',
  size: 2,
  aggressive: false,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'The obelisk tethers the two Wardens. Destroy it to stop them from healing.',
  weakness: 'magic',
  tags: ['raid', 'tombs', 'construct'],
  raidRoom: 'wardens',
  raidMechanic: 'Heals both Wardens for 20 HP per tick while alive. Must be destroyed to progress.',
});

npcs.defineNpc('toa_warden_fused', {
  name: 'Warden of the Tombs',
  combat: 600,
  maxHp: 1000,
  maxHit: 65,
  stats: { attack: 320, strength: 300, defence: 320 },
  attackSpeed: 5,
  attackRange: 10,
  attackStyle: 'magic',
  size: 7,
  aggressive: true,
  aggroRange: 20,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'The two Wardens fused into one. Its core is its only weakness.',
  weakness: 'ranged',
  tags: ['raid', 'tombs', 'construct', 'boss', 'armoured'],
  raidRoom: 'wardens',
  phases: [
    {
      name: 'Obelisk Phase',
      description: 'Both Wardens attack. Elidinis Warden uses magic, Tumeken Warden uses melee. The obelisk heals both for 20 HP/tick. Destroy the obelisk first.',
      wardenDefIds: ['toa_warden_elidinis', 'toa_warden_tumeken'],
      obeliskDefId: 'toa_warden_obelisk',
      obeliskHealPerTick: 20,
    },
    {
      name: 'Core Phase',
      description: 'Wardens fuse. Attacks with skull projectiles (pray mage) and ground slams (dodge). Every 20 ticks the core exposes for 10 ticks -- 5x damage during exposure. Enrages below 20% HP.',
      attackStyle: 'magic',
      specialAttacks: [
        {
          name: 'Skull Barrage',
          description: 'Fires 4 skull projectiles at random players. 40 damage each. Pray magic.',
          projectileCount: 4,
          damage: 40,
          tickInterval: 10,
        },
        {
          name: 'Ground Slam',
          description: 'Slams the ground in a 5x5 area around the Warden. 55 damage. Step back.',
          aoeSize: 5,
          damage: 55,
          tickInterval: 15,
        },
      ],
      coreExposure: {
        duration: 10,
        interval: 20,
        damageMultiplier: 5.0,
        description: 'Core becomes vulnerable for 10 ticks. All damage multiplied by 5.',
      },
      enrage: {
        hpThreshold: 0.20,
        description: 'Below 20% HP: attack speed +2, max hit 78, core exposure reduced to 6 ticks.',
        maxHitOverride: 78,
        attackSpeedOverride: 3,
        coreExposureDuration: 6,
      },
    },
  ],
});
droptables.define('toa_warden_fused', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 2400, max: 7200 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });


// ##############################################################################
//
//   SECTION 4 -- TOMBS OF AELGARD: DROP TABLES
//
//   Raid level affects unique drop rate:
//     Level 0 (entry):    1/60 per unique roll
//     Level 150 (normal): 1/30 per unique roll
//     Level 300 (expert): 1/15 per unique roll
//     Level 600 (max):    1/8  per unique roll
//
// ##############################################################################

// Standard loot (always rolled on completion)
droptables.define('toa_standard_loot', {
  always: [
    { id: 92040, name: 'Scarab amulet', min: 1, max: 1 },
  ],
  main: [
    { id: 101, name: 'Coins', weight: 10, min: 30000, max: 120000 },
    { id: 11357, name: 'Death rune', weight: 6, min: 200, max: 500 },
    { id: 11358, name: 'Blood rune', weight: 5, min: 150, max: 400 },
    { id: 11363, name: 'Soul rune', weight: 4, min: 100, max: 250 },
    { id: 12013, name: 'Grimy torstol', weight: 4, min: 5, max: 15 },
    { id: 12009, name: 'Grimy snapdragon', weight: 5, min: 8, max: 20 },
    { id: 2116, name: 'Runite bar', weight: 3, min: 3, max: 10 },
    { id: 92042, name: 'Lily of the sands', weight: 6, min: 3, max: 8 },
  ],
  tertiary: [
    { id: 92041, name: 'Tomb relic', rate: 8, count: 1 },
  ],
});

// Unique table -- rolled based on raid level
droptables.define('toa_unique_loot', {
  always: [],
  main: [
    { id: 92000, name: "Osmumten's fang", weight: 2, min: 1, max: 1 },
    { id: 92001, name: 'Masori mask', weight: 2, min: 1, max: 1 },
    { id: 92002, name: 'Masori body', weight: 2, min: 1, max: 1 },
    { id: 92003, name: 'Masori chaps', weight: 2, min: 1, max: 1 },
    { id: 92004, name: 'Lightbearer', weight: 3, min: 1, max: 1 },
    { id: 92005, name: "Elidinis' ward", weight: 2, min: 1, max: 1 },
    { id: 92007, name: 'Shadow of Tumeken', weight: 1, min: 1, max: 1 },
    { id: 92009, name: 'Thread of Elidinis', weight: 4, min: 1, max: 1 },
    { id: 92010, name: 'Keris partisan', weight: 3, min: 1, max: 1 },
    { id: 92011, name: 'Breach of the scarab', weight: 2, min: 1, max: 1 },
    { id: 92013, name: 'Eye of the corruptor', weight: 2, min: 1, max: 1 },
    { id: 92015, name: 'Jewel of the sun', weight: 2, min: 1, max: 1 },
    { id: 0, name: 'Nothing', weight: 23, min: 0, max: 0 },
  ],
  tertiary: [],
});

// Per-path drop tables
droptables.define('toa_zebak', {
  always: [],
  main: [
    { id: 101, name: 'Coins', weight: 8, min: 8000, max: 25000 },
    { id: 11358, name: 'Blood rune', weight: 5, min: 60, max: 180 },
    { id: 12308, name: 'Ranging potion(4)', weight: 3, min: 2, max: 4 },
    { id: 0, name: 'Nothing', weight: 3, min: 0, max: 0 },
  ],
});

droptables.define('toa_kephri', {
  always: [],
  main: [
    { id: 101, name: 'Coins', weight: 8, min: 6000, max: 20000 },
    { id: 12304, name: 'Prayer potion(4)', weight: 4, min: 2, max: 4 },
    { id: 12306, name: 'Super strength(4)', weight: 3, min: 2, max: 4 },
    { id: 0, name: 'Nothing', weight: 3, min: 0, max: 0 },
  ],
});

droptables.define('toa_akkha', {
  always: [],
  main: [
    { id: 101, name: 'Coins', weight: 8, min: 8000, max: 30000 },
    { id: 11357, name: 'Death rune', weight: 5, min: 80, max: 200 },
    { id: 12314, name: 'Super restore(4)', weight: 4, min: 2, max: 4 },
    { id: 0, name: 'Nothing', weight: 3, min: 0, max: 0 },
  ],
});

droptables.define('toa_baba', {
  always: [],
  main: [
    { id: 101, name: 'Coins', weight: 8, min: 5000, max: 18000 },
    { id: 12313, name: 'Saradomin brew(4)', weight: 4, min: 2, max: 4 },
    { id: 12305, name: 'Super attack(4)', weight: 3, min: 2, max: 4 },
    { id: 0, name: 'Nothing', weight: 3, min: 0, max: 0 },
  ],
});

droptables.define('toa_wardens', {
  always: [],
  main: [
    { id: 101, name: 'Coins', weight: 6, min: 15000, max: 50000 },
    { id: 11363, name: 'Soul rune', weight: 4, min: 80, max: 200 },
    { id: 11364, name: 'Wrath rune', weight: 3, min: 40, max: 100 },
    { id: 92042, name: 'Lily of the sands', weight: 3, min: 2, max: 5 },
    { id: 0, name: 'Nothing', weight: 2, min: 0, max: 0 },
  ],
});

// ToA pet -- Tumeken's guardian
items.define({
  id: 83001,
  name: "Tumeken's guardian",
  examine: 'A miniature Warden. It plods along behind you, radiating warmth.',
  value: 0,
  category: 'pet',
  tradeable: false,
  weight: 0,
});


// ##############################################################################
//
//   SECTION 5 -- TOMBS OF AELGARD: RAID DEFINITION
//
// ##############################################################################

const TOMBS_OF_AELGARD = {
  id: 'tombs_of_aelgard',
  name: 'Tombs of Aelgard',
  shortName: 'ToA',
  description: 'Beneath the Boneyard Wastes pyramid lie the Tombs -- a proving ground built by the desert gods. Solo or group. Choose your invocations. Set your own difficulty. The harder you make it, the better the rewards.',
  location: 'Boneyard Wastes pyramid, beneath the Great Pyramid',
  region: 'boneyard_wastes',

  // Scaling
  minPlayers: 1,
  maxPlayers: 8,
  scaling: {
    description: 'Boss HP scales with party size. Solo base. Each additional player adds 30% boss HP and 20% boss damage.',
    baseMultiplier: 1.0,
    perPlayerHpMultiplier: 0.30,
    perPlayerDamageMultiplier: 0.20,
  },

  // Estimated completion time
  estimatedTime: { min: 25, max: 50, unit: 'minutes' },

  // Requirements
  requirements: {
    combat: 80,
    skills: {},
    quests: [],
    items: [],
    recommended: {
      combat: 110,
      skills: { prayer: 77, magic: 85 },
      description: 'Rigour and Augury prayers recommended. 90+ all combat stats for expert invocations.',
    },
  },

  // Invocation system
  invocations: TOA_INVOCATIONS,
  raidLevels: {
    entry: { min: 0, max: 149, description: 'Entry mode. Reduced drop rates.' },
    normal: { min: 150, max: 299, description: 'Normal mode. Standard drop rates.' },
    expert: { min: 300, max: 599, description: 'Expert mode. Enhanced drop rates.' },
    max: { min: 600, max: Infinity, description: 'Max invocation. Best drop rates.' },
  },
  uniqueDropRates: {
    entry: 1 / 60,
    normal: 1 / 30,
    expert: 1 / 15,
    max: 1 / 8,
  },

  // Room system -- 4 paths (any order) then final boss
  rooms: [
    {
      id: 'serpent_path',
      name: 'Path of the Serpent',
      type: 'combat',
      description: 'A flooded river cavern guarded by Zebak, an ancient crocodilian. Dodge boulders in the current while fighting.',
      bosses: ['toa_zebak'],
      mechanic: 'riverDodge',
      recommendedStyles: ['magic'],
      arenaSize: { width: 30, height: 40 },
    },
    {
      id: 'scarab_path',
      name: 'Path of the Scarab',
      type: 'combat',
      description: 'A buried hive ruled by Kephri, the immortal scarab. Manage spawns and break her shield.',
      bosses: ['toa_kephri'],
      adds: ['toa_scarab_swarm'],
      mechanic: 'spawnManagement',
      recommendedStyles: ['crush', 'melee'],
      arenaSize: { width: 28, height: 28 },
    },
    {
      id: 'sun_path',
      name: 'Path of the Sun',
      type: 'combat',
      description: 'A sun-scorched arena where Akkha tests your prayer discipline. Four elements, four prayers.',
      bosses: ['toa_akkha'],
      mechanic: 'prayerSwitching',
      recommendedStyles: ['stab', 'melee'],
      arenaSize: { width: 25, height: 25 },
    },
    {
      id: 'shadow_path',
      name: 'Path of the Shadow',
      type: 'combat',
      description: 'A crumbling cavern ruled by Ba-Ba, chief of the tomb baboons. Dodge boulders and banana bombs.',
      bosses: ['toa_baba'],
      adds: ['toa_baboon_thrall'],
      mechanic: 'aoeAvoidance',
      recommendedStyles: ['slash', 'melee'],
      arenaSize: { width: 30, height: 30 },
    },
    {
      id: 'wardens',
      name: 'The Wardens',
      type: 'boss',
      description: 'Two colossal constructs guard the tomb\'s heart. Destroy the obelisk, then crack open the fused Warden\'s core.',
      bosses: ['toa_warden_elidinis', 'toa_warden_tumeken', 'toa_warden_fused'],
      adds: ['toa_warden_obelisk'],
      mechanic: 'phasedBoss',
      alwaysLast: true,
      recommendedStyles: ['ranged', 'magic', 'melee'],
      arenaSize: { width: 40, height: 40 },
    },
  ],

  roomOrder: {
    description: 'Four paths can be completed in any order. The Wardens are always the final encounter.',
    randomRooms: ['serpent_path', 'scarab_path', 'sun_path', 'shadow_path'],
    fixedLast: 'wardens',
  },

  // Loot system
  lootSystem: {
    description: 'Unique drop rate scales with raid level. Each player gets one unique roll on completion. Higher raid level = better odds. Standard loot always drops.',
    pathLootTables: {
      serpent_path: 'toa_zebak',
      scarab_path: 'toa_kephri',
      sun_path: 'toa_akkha',
      shadow_path: 'toa_baba',
      wardens: 'toa_wardens',
    },
    completionTables: {
      standard: 'toa_standard_loot',
      unique: 'toa_unique_loot',
    },
    petRate: {
      description: 'Pet rate scales with raid level: 1/5000 at entry, 1/3000 at normal, 1/1500 at expert, 1/800 at max.',
      entry: 1 / 5000,
      normal: 1 / 3000,
      expert: 1 / 1500,
      max: 1 / 800,
    },
    petId: 83001,
    petName: "Tumeken's guardian",
  },

  // Recommended gear
  recommendedGear: {
    serpent_path: {
      primary: ['Magic weapons (Zebak is weak to magic)'],
      utility: ['Food for boulder damage'],
    },
    scarab_path: {
      primary: ['Crush weapons (Kephri and swarms are armoured insects)'],
      utility: ['AoE for swarm clear'],
    },
    sun_path: {
      primary: ['Stab weapons (Akkha is weak to stab)'],
      utility: ['High prayer bonus for 4-phase prayer switching'],
    },
    shadow_path: {
      primary: ['Slash weapons (Ba-Ba and thralls weak to slash)'],
      utility: ['Stamina potions for dodging'],
    },
    wardens: {
      primary: ['All three combat styles', 'Ranged for Elidinis Warden', 'Magic for Tumeken Warden'],
      utility: ['Saradomin brews', 'Super restores'],
    },
  },
};


// ##############################################################################
//
//   SECTION 6 -- TOMBS OF AELGARD: CONTENT REGISTRY
//
// ##############################################################################

registry.registerPlayable('tombs_of_aelgard', {
  name: 'Tombs of Aelgard',
  description: 'Endgame 1-8 player raid beneath the Boneyard Wastes pyramid. Invocation system for scalable difficulty. 4 paths + final boss.',
  source: 'aelgard',
  type: 'raid',
  challenges: {
    full: { description: 'Full Tombs completion' },
    entry: { description: 'Entry mode (raid level 0)' },
    normal: { description: 'Normal mode (raid level 150)' },
    expert: { description: 'Expert mode (raid level 300)' },
    max: { description: 'Max invocations (raid level 600)' },
    zebak: { description: 'Zebak only' },
    kephri: { description: 'Kephri only' },
    akkha: { description: 'Akkha only' },
    baba: { description: 'Ba-Ba only' },
    wardens: { description: 'Wardens only' },
  },
  mobDefs: [
    'toa_zebak',
    'toa_kephri', 'toa_scarab_swarm',
    'toa_akkha',
    'toa_baba', 'toa_baboon_thrall',
    'toa_warden_elidinis', 'toa_warden_tumeken', 'toa_warden_obelisk', 'toa_warden_fused',
  ],
  phases: TOMBS_OF_AELGARD.rooms.map(r => r.id),
  loadout: {
    level: 99,
    hpLevel: 99,
    equipment: [
      "Osmumten's fang", 'Rune crossbow', 'Mystic staff',
      'Bandos chestplate', 'Bandos tassets',
    ],
    inventory: [
      { name: 'Saradomin brew(4)', count: 8 },
      { name: 'Super restore(4)', count: 10 },
      { name: 'Super combat potion(4)', count: 1 },
      { name: 'Ranging potion(4)', count: 1 },
      { name: 'Stamina potion(4)', count: 1 },
    ],
    prayers: ['protect_from_melee', 'protect_from_missiles', 'protect_from_magic', 'piety', 'rigour', 'augury'],
  },
  actionSpace: registry.buildActionSpace([
    'noop', 'brew', 'restore',
    'move_n', 'move_s', 'move_e', 'move_w',
    'move_ne', 'move_nw', 'move_se', 'move_sw',
    'target_boss', 'target_adds', 'target_obelisk', 'target_core',
    'pray_mage', 'pray_range', 'pray_melee', 'pray_off',
    'equip_melee', 'equip_ranged', 'equip_magic',
    'dodge_left', 'dodge_right', 'dodge_back',
  ]),
  raidConfig: TOMBS_OF_AELGARD,
});


// ##############################################################################
//
//   SECTION 7 -- 15 MORE BOSSES ACROSS ALL REGIONS
//
//   Entry-level (5), mid-level (5), endgame (5).
//   Each boss: full stats, weakness, tags, mechanic, drop table, pet, uniques.
//
// ##############################################################################


// ══════════════════════════════════════════════════════════════════════════════
// ENTRY-LEVEL BOSSES (combat 50-100)
// ══════════════════════════════════════════════════════════════════════════════

// ---------- Boss 1: Bryophyta ----------
// Moss giant boss in Heartlands. Drops Bryophyta's essence (BIS F2P staff).
// Mechanic: summons growthlings that root players in place.

items.define({
  id: 92050,
  name: "Bryophyta's essence",
  examine: "The living essence of Bryophyta. Attach to a battlestaff for the Bryophyta's staff.",
  value: 500000,
  category: 'crafting',
  weight: 0.5,
});

items.define({
  id: 92051,
  name: "Bryophyta's staff",
  examine: "A battlestaff infused with nature's essence. 1/15 chance to not consume a nature rune when casting. BIS for F2P magic.",
  value: 800000,
  category: 'weapon',
  equipSlot: 'weapon',
  speed: 5,
  stats: { magic: 15, magic_strength: 5 },
  equipReqs: { magic: 30 },
  passiveEffect: {
    name: 'Nature Conservation',
    description: '1/15 chance to not consume a nature rune when casting.',
    runeNegateChance: 1 / 15,
    runeType: 'nature',
  },
});

boss('bryophyta_heartlands', {
  name: 'Bryophyta', combat: 128, maxHp: 115, maxHit: 16,
  stats: { attack: 80, strength: 70, defence: 60 },
  attackSpeed: 5, attackRange: 1, attackStyle: 'melee', size: 3,
  aggressive: true, aggroRange: 6, wanderRadius: 0, respawnTicks: 60,
  examine: 'The queen of the moss giants. Roots erupt from the ground at her command.',
  weakness: 'slash', tags: ['boss', 'plant'],
  // Mechanic: summons 2 growthlings that root the nearest player in place for 5 ticks.
  // While rooted, Bryophyta attacks at double speed.
}, {
  always: [{ id: 106, name: 'Big bones', min: 1, max: 1 }],
  main: [
    { id: 101, name: 'Coins', weight: 6, min: 2000, max: 8000 },
    { id: 12005, name: 'Grimy ranarr', weight: 3, min: 1, max: 3 },
    { id: 11359, name: 'Nature rune', weight: 4, min: 30, max: 80 },
  ],
  tertiary: [
    { id: 92050, name: "Bryophyta's essence", chance: 118, min: 1, max: 1 },
  ],
}, 83002, 'Mossy', 'A tiny moss giant. Leaves sprout from its head.');

// ---------- Boss 2: Obor ----------
// Hill giant boss in Heartlands. Drops hill giant club (crush training).
// Mechanic: picks up and throws boulders. Earthquake stomp at 50% HP.

items.define({
  id: 92052,
  name: 'Hill giant club',
  examine: 'A massive club torn from an oak tree. Slow but devastating. BIS crush training weapon for mid-levels.',
  value: 300000,
  category: 'weapon',
  equipSlot: 'weapon',
  twoHanded: true,
  speed: 6,
  stats: { crush: 65, melee_strength: 70 },
  equipReqs: { attack: 30, strength: 30 },
});

boss('obor_heartlands', {
  name: 'Obor', combat: 106, maxHp: 120, maxHit: 18,
  stats: { attack: 70, strength: 80, defence: 50 },
  attackSpeed: 5, attackRange: 1, attackStyle: 'melee', size: 3,
  aggressive: true, aggroRange: 6, wanderRadius: 0, respawnTicks: 60,
  examine: 'A hill giant champion. He swings his club with reckless power.',
  weakness: 'magic', tags: ['boss', 'giant'],
  // Mechanic: picks up boulders and throws them at range (25 dmg, 2x2 AoE).
  // At 50% HP: earthquake stomp (all tiles around him deal 15 dmg for 3 ticks).
}, {
  always: [{ id: 106, name: 'Big bones', min: 1, max: 1 }],
  main: [
    { id: 101, name: 'Coins', weight: 6, min: 1500, max: 6000 },
    { id: 2116, name: 'Runite bar', weight: 1, min: 1, max: 1 },
  ],
  tertiary: [
    { id: 92052, name: 'Hill giant club', chance: 118, min: 1, max: 1 },
  ],
}, 83003, 'Obor Jr.', 'A tiny hill giant with a tiny club. Still angry.');

// ---------- Boss 3: Hespori ----------
// Farming boss in Veilwood. Grows from a Hespori seed. Drops farming items.
// Mechanic: roots that drain HP until cut. Blooms release poison spores.

items.define({
  id: 92053,
  name: 'Hespori seed',
  examine: 'A dark seed pulsing with life. Plant it in the Hespori patch and wait.',
  value: 20000,
  category: 'farming',
  tradeable: true,
  weight: 0.1,
});

items.define({
  id: 92054,
  name: 'Bottomless compost bucket',
  examine: 'A bucket that never runs out of compost. Holds up to 10,000 uses of any compost type.',
  value: 400000,
  category: 'tool',
  tradeable: true,
  weight: 1.5,
});

items.define({
  id: 92055,
  name: 'Iasor seed',
  examine: 'An ancient Anima seed. Plant in the Anima patch to reduce disease chance across all patches.',
  value: 200000,
  category: 'farming',
  tradeable: true,
  weight: 0.1,
});

boss('hespori_veilwood', {
  name: 'Hespori', combat: 84, maxHp: 100, maxHit: 14,
  stats: { attack: 60, strength: 55, defence: 45 },
  attackSpeed: 5, attackRange: 4, attackStyle: 'ranged', size: 3,
  aggressive: true, aggroRange: 8, wanderRadius: 0, respawnTicks: 0,
  examine: 'A monstrous plant grown from the Hespori seed. Its roots reach everywhere.',
  weakness: 'slash', tags: ['boss', 'plant'],
  // Mechanic: spawns 4 roots around the arena that drain 3 HP/tick. Cut them (Woodcutting 35+).
  // At 50% HP: releases poison spore clouds in 3x3 areas (8 dmg/tick, 5 tick duration).
}, {
  always: [],
  main: [
    { id: 12501, name: 'Ranarr seed', weight: 3, min: 1, max: 2 },
    { id: 12503, name: 'Snapdragon seed', weight: 2, min: 1, max: 1 },
    { id: 12013, name: 'Grimy torstol', weight: 2, min: 2, max: 4 },
    { id: 92053, name: 'Hespori seed', weight: 4, min: 1, max: 1 },
  ],
  tertiary: [
    { id: 92054, name: 'Bottomless compost bucket', chance: 35, min: 1, max: 1 },
    { id: 92055, name: 'Iasor seed', chance: 50, min: 1, max: 1 },
  ],
}, 83004, 'Hespori sprout', 'A tiny Hespori. It tries to root your boots.');

// ---------- Boss 4: Mimic ----------
// Rare clue scroll boss. Spawns from a treasure casket. Drops extra clue loot.
// Mechanic: disguises as loot pile. When attacked, reflects 50% damage for 3 ticks.

items.define({
  id: 92056,
  name: 'Mimic casket',
  examine: 'A casket that is definitely not alive. Definitely.',
  value: 100000,
  category: 'misc',
  weight: 3,
});

items.define({
  id: 92057,
  name: '3rd age ring',
  examine: 'A ring from the Third Age. Teleports the wearer to any clue scroll location.',
  value: 5000000,
  category: 'jewellery',
  equipSlot: 'ring',
  stats: { prayer: 4 },
  equipReqs: {},
  passiveEffect: {
    name: '3rd Age Teleport',
    description: 'Can teleport to any previously visited clue scroll location.',
    teleportType: 'clue_location',
  },
});

items.define({
  id: 92058,
  name: "Mimic's tongue",
  examine: 'A slimy tongue ripped from the Mimic. Cosmetic attachment for treasure caskets.',
  value: 150000,
  category: 'misc',
  weight: 0.5,
});

boss('mimic_clue', {
  name: 'Mimic', combat: 95, maxHp: 140, maxHit: 15,
  stats: { attack: 75, strength: 65, defence: 55 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee', size: 2,
  aggressive: true, aggroRange: 4, wanderRadius: 0, respawnTicks: 0,
  examine: 'It was a trap! The treasure chest was alive all along.',
  weakness: 'crush', tags: ['boss', 'mimic'],
  // Mechanic: disguises as a loot pile. First 3 ticks of combat: reflects 50% damage.
  // Periodically spits coins at player for ranged damage.
}, {
  always: [{ id: 101, name: 'Coins', min: 5000, max: 20000 }],
  main: [
    { id: 12505, name: 'Uncut dragonstone', weight: 3, min: 1, max: 2 },
    { id: 101, name: 'Coins', weight: 5, min: 10000, max: 30000 },
    { id: 92058, name: "Mimic's tongue", weight: 4, min: 1, max: 1 },
  ],
  tertiary: [
    { id: 92057, name: '3rd age ring', chance: 2000, min: 1, max: 1 },
  ],
}, 83005, 'Baby mimic', 'A tiny treasure chest. It bites.');

// ---------- Boss 5: Skotizo ----------
// Demon boss beneath Moryskah catacombs. Drops dark claw (slayer helm cosmetic).
// Mechanic: 4 altars around the arena reduce Skotizo's defence when activated.
//           Must activate altars to remove his dark shield.

items.define({
  id: 92059,
  name: 'Dark claw',
  examine: "A claw from Skotizo. Can be used to recolour the slayer helm to a dark variant.",
  value: 200000,
  category: 'misc',
  weight: 0.3,
});

items.define({
  id: 92060,
  name: 'Uncut onyx',
  examine: 'An uncut onyx gem. The rarest of all gems. Cut it for a beautiful onyx.',
  value: 3000000,
  category: 'gem',
  weight: 0.1,
});

items.define({
  id: 92061,
  name: 'Jar of darkness',
  examine: 'A jar containing pure darkness from the catacombs. A display piece.',
  value: 500000,
  category: 'misc',
  tradeable: true,
  weight: 1,
});

boss('skotizo_moryskah', {
  name: 'Skotizo', combat: 321, maxHp: 450, maxHit: 38,
  stats: { attack: 200, strength: 190, defence: 250 },
  attackSpeed: 5, attackRange: 6, attackStyle: 'magic', size: 4,
  aggressive: true, aggroRange: 10, wanderRadius: 0, respawnTicks: 0,
  examine: 'A greater demon lord sealed beneath the catacombs. Darkness is his armour.',
  weakness: 'slash', tags: ['boss', 'demon'],
  resistance: 'magic',
  // Mechanic: 4 altars around the arena. Activating an altar lowers Skotizo's defence by 60
  // and removes his dark shield (80% damage reduction). Shield regenerates after 20 ticks.
  // Must cycle through altars to maintain the vulnerability window.
}, {
  always: [{ id: 107, name: 'Dragon bones', min: 2, max: 2 }],
  main: [
    { id: 101, name: 'Coins', weight: 5, min: 15000, max: 40000 },
    { id: 11363, name: 'Soul rune', weight: 3, min: 30, max: 80 },
    { id: 92061, name: 'Jar of darkness', weight: 1, min: 1, max: 1 },
  ],
  tertiary: [
    { id: 92059, name: 'Dark claw', chance: 25, min: 1, max: 1 },
    { id: 92060, name: 'Uncut onyx', chance: 1000, min: 1, max: 1 },
  ],
}, 83006, 'Skotos', 'A tiny Skotizo. It hides in your shadow.');


// ══════════════════════════════════════════════════════════════════════════════
// MID-LEVEL BOSSES (combat 100-200)
// ══════════════════════════════════════════════════════════════════════════════

// ---------- Boss 6: Sarachnis ----------
// Spider boss in Moryskah. Drops Sarachnis cudgel (crush weapon).
// Mechanic: webs players to the floor, then summons spiderlings to swarm them.

items.define({
  id: 92070,
  name: 'Sarachnis cudgel',
  examine: 'A cudgel crafted from the legs of Sarachnis. BIS crush weapon for its level.',
  value: 600000,
  category: 'weapon',
  equipSlot: 'weapon',
  speed: 4,
  stats: { crush: 82, melee_strength: 70 },
  equipReqs: { attack: 65 },
});

items.define({
  id: 92071,
  name: 'Sraracha',
  examine: 'A jar containing a miniature Sarachnis. She weaves tiny webs.',
  value: 300000,
  category: 'misc',
  tradeable: true,
  weight: 1,
});

boss('sarachnis_moryskah', {
  name: 'Sarachnis', combat: 318, maxHp: 400, maxHit: 31,
  stats: { attack: 180, strength: 170, defence: 150 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee', size: 4,
  aggressive: true, aggroRange: 8, wanderRadius: 0, respawnTicks: 60,
  examine: 'The brood mother of Moryskah. Her webs are stronger than steel.',
  weakness: 'crush', tags: ['boss', 'spider'],
  resistance: 'ranged',
  // Mechanic: webs a player in place every 15 ticks (5 tick duration, must be cut).
  // Spawns 3 spiderlings that swarm the webbed player.
}, {
  always: [{ id: 106, name: 'Big bones', min: 1, max: 1 }],
  main: [
    { id: 101, name: 'Coins', weight: 5, min: 8000, max: 25000 },
    { id: 11358, name: 'Blood rune', weight: 3, min: 30, max: 80 },
    { id: 12005, name: 'Grimy ranarr', weight: 3, min: 2, max: 4 },
  ],
  tertiary: [
    { id: 92070, name: 'Sarachnis cudgel', chance: 384, min: 1, max: 1 },
    { id: 92071, name: 'Sraracha', chance: 3000, min: 1, max: 1 },
  ],
}, 83007, 'Sarachnis spawn', 'A tiny spider queen. Weaves webs on your gear.');

// ---------- Boss 7: Tempoross ----------
// Fishing boss in Saltbrine. Skill boss (fishing + cooking).
// Mechanic: fish harpoonfish, cook them, fire them at Tempoross with cannons.
//           Dodge tidal waves and whirlpools.

items.define({
  id: 92072,
  name: 'Spirit angler outfit piece',
  examine: 'Part of the Spirit Angler outfit. Full set gives +2.5% fishing experience.',
  value: 100000,
  category: 'armour',
  weight: 1,
});

items.define({
  id: 92073,
  name: 'Tome of water',
  examine: 'A tome that provides unlimited water runes while equipped and +20% damage to water spells.',
  value: 800000,
  category: 'armour',
  equipSlot: 'shield',
  stats: { magic: 8 },
  equipReqs: { magic: 50 },
  passiveEffect: {
    name: 'Aquatic Power',
    description: 'Unlimited water runes. +20% damage to water spells.',
    unlimitedRunes: ['water'],
    waterSpellBonus: 0.20,
  },
});

items.define({
  id: 92074,
  name: 'Dragon harpoon',
  examine: 'A dragon-metal harpoon. 20% faster fishing. Special attack boosts fishing level by 3.',
  value: 1500000,
  category: 'weapon',
  equipSlot: 'weapon',
  speed: 5,
  stats: { stab: 42, melee_strength: 35 },
  equipReqs: { attack: 60 },
  passiveEffect: {
    name: 'Dragon Efficiency',
    description: '20% faster fishing speed when equipped.',
    fishingSpeedBonus: 0.20,
  },
  special: {
    cost: 100,
    name: 'Fishstab',
    description: 'Boosts fishing level by 3 for 60 seconds.',
    fishingBoost: 3,
    duration: 100,
  },
});

boss('tempoross_saltbrine', {
  name: 'Tempoross', combat: 0, maxHp: 1200, maxHit: 20,
  stats: { attack: 0, strength: 0, defence: 100 },
  attackSpeed: 6, attackRange: 15, attackStyle: 'magic', size: 6,
  aggressive: true, aggroRange: 20, wanderRadius: 0, respawnTicks: 120,
  examine: 'A great spirit of the sea. It can only be fought with harpoons and cannons.',
  weakness: 'none', tags: ['boss', 'spirit', 'skilling'],
  // Mechanic: skill boss. Fish harpoonfish (Fishing 35+), cook them (Cooking 35+),
  // load into cannons to damage Tempoross. Dodge tidal waves (15 dmg, full row sweep).
  // Whirlpools appear and pull players in (12 dmg + stun 3 ticks).
}, {
  always: [],
  main: [
    { id: 101, name: 'Coins', weight: 6, min: 5000, max: 15000 },
    { id: 2306, name: 'Raw shark', weight: 4, min: 10, max: 25 },
    { id: 92072, name: 'Spirit angler outfit piece', weight: 2, min: 1, max: 1 },
  ],
  tertiary: [
    { id: 92073, name: 'Tome of water', chance: 1600, min: 1, max: 1 },
    { id: 92074, name: 'Dragon harpoon', chance: 8000, min: 1, max: 1 },
  ],
}, 83008, 'Tiny tempor', 'A miniature sea spirit. Makes puddles wherever you go.');

// ---------- Boss 8: Phantom Muspah ----------
// Magic boss in Inkweald. Drops ancient essence for buffing ancient spells.
// Mechanic: shape-shifts between ranged and melee forms mid-fight.
//           Must prayer-switch AND adapt positioning.

items.define({
  id: 92075,
  name: 'Ancient essence',
  examine: 'Concentrated magical essence from the Muspah. Used to create ancient sceptres and imbue ancient spells.',
  value: 50000,
  category: 'crafting',
  stackable: true,
  weight: 0.1,
});

items.define({
  id: 92076,
  name: 'Ancient sceptre',
  examine: 'A sceptre imbued with ancient essence. Increases ancient spell damage by 10% and reduces rune cost by 1.',
  value: 3000000,
  category: 'weapon',
  equipSlot: 'weapon',
  speed: 5,
  stats: { magic: 22, magic_strength: 15 },
  equipReqs: { magic: 70 },
  passiveEffect: {
    name: 'Ancient Attunement',
    description: '+10% ancient spell damage. Each ancient spell costs 1 fewer rune per type.',
    ancientDamageBonus: 0.10,
    runeReduction: 1,
  },
});

items.define({
  id: 92077,
  name: 'Venator bow',
  examine: 'A bow that fires bouncing shots. Each arrow can hit up to 3 targets in a line.',
  value: 5000000,
  category: 'weapon',
  equipSlot: 'weapon',
  speed: 4,
  stats: { ranged: 88, ranged_strength: 12 },
  equipReqs: { ranged: 75 },
  passiveEffect: {
    name: 'Ricochet',
    description: 'Arrows bounce to up to 2 additional targets within 3 tiles of each other.',
    bounceTargets: 2,
    bounceRange: 3,
  },
});

boss('phantom_muspah_inkweald', {
  name: 'Phantom Muspah', combat: 363, maxHp: 500, maxHit: 38,
  stats: { attack: 210, strength: 190, defence: 200 },
  attackSpeed: 4, attackRange: 8, attackStyle: 'magic', size: 4,
  aggressive: true, aggroRange: 10, wanderRadius: 0, respawnTicks: 50,
  examine: 'A spectral creature born from corrupted ancient magic. Shifts between forms.',
  weakness: 'ranged', tags: ['boss', 'spirit', 'ancient'],
  resistance: 'melee',
  // Mechanic: alternates between ranged form (pray ranged, fight at distance)
  // and melee form (pray melee, slam attacks in 3x3).
  // Shield form at 33% HP: immune to damage for 10 ticks, spawns 4 spikes.
}, {
  always: [{ id: 92075, name: 'Ancient essence', min: 10, max: 30 }],
  main: [
    { id: 101, name: 'Coins', weight: 5, min: 15000, max: 40000 },
    { id: 11363, name: 'Soul rune', weight: 3, min: 30, max: 80 },
    { id: 11357, name: 'Death rune', weight: 3, min: 60, max: 150 },
  ],
  tertiary: [
    { id: 92076, name: 'Ancient sceptre', chance: 500, min: 1, max: 1 },
    { id: 92077, name: 'Venator bow', chance: 800, min: 1, max: 1 },
  ],
}, 83009, 'Muspah wisp', 'A tiny Muspah. Shifts colour when you look away.');

// ---------- Boss 9: Duke Sucellus ----------
// Sootworks boss. Drops chromium ingots for BIS tools.
// Mechanic: stomps create shockwaves across the floor in cardinal lines.
//           Gas vents periodically fill quadrants with poison.

items.define({
  id: 92078,
  name: 'Chromium ingot',
  examine: 'A rare chromium ingot from the deep Sootworks. Used to forge BIS tools.',
  value: 800000,
  category: 'crafting',
  weight: 2,
});

items.define({
  id: 92079,
  name: 'Chromium pickaxe',
  examine: 'A pickaxe forged from chromium. The hardest pickaxe ever made. +15% mining speed over dragon.',
  value: 5000000,
  category: 'weapon',
  equipSlot: 'weapon',
  speed: 5,
  stats: { stab: 52, melee_strength: 48 },
  equipReqs: { attack: 70, mining: 71 },
  passiveEffect: {
    name: 'Chromium Edge',
    description: '+15% mining speed. Does not degrade.',
    miningSpeedBonus: 0.15,
  },
});

items.define({
  id: 92080,
  name: 'Chromium axe',
  examine: 'An axe forged from chromium. The finest woodcutting axe. +15% woodcutting speed over dragon.',
  value: 5000000,
  category: 'weapon',
  equipSlot: 'weapon',
  speed: 5,
  stats: { slash: 50, melee_strength: 46 },
  equipReqs: { attack: 70, woodcutting: 71 },
  passiveEffect: {
    name: 'Chromium Edge',
    description: '+15% woodcutting speed. Does not degrade.',
    woodcuttingSpeedBonus: 0.15,
  },
});

items.define({
  id: 92081,
  name: "Baron's eye",
  examine: "The Duke's petrified eye. Attach to a slayer helm for the Sootworks variant.",
  value: 500000,
  category: 'misc',
  weight: 0.3,
});

boss('duke_sucellus_sootworks', {
  name: 'Duke Sucellus', combat: 376, maxHp: 520, maxHit: 36,
  stats: { attack: 220, strength: 210, defence: 230 },
  attackSpeed: 5, attackRange: 1, attackStyle: 'melee', size: 4,
  aggressive: true, aggroRange: 8, wanderRadius: 0, respawnTicks: 60,
  examine: 'The Duke of the Deep Sootworks. His stomps create shockwaves through solid stone.',
  weakness: 'stab', tags: ['boss', 'demon', 'armoured'],
  resistance: 'ranged',
  // Mechanic: stomps create shockwaves in + pattern (cardinal lines).
  // Stand diagonally to avoid. Gas vents fill one quadrant with poison every 12 ticks.
  // At 30% HP: stomps create X pattern as well (nowhere completely safe, must keep moving).
}, {
  always: [{ id: 107, name: 'Dragon bones', min: 1, max: 1 }],
  main: [
    { id: 101, name: 'Coins', weight: 5, min: 15000, max: 45000 },
    { id: 2116, name: 'Runite bar', weight: 3, min: 2, max: 5 },
    { id: 92078, name: 'Chromium ingot', weight: 2, min: 1, max: 1 },
  ],
  tertiary: [
    { id: 92079, name: 'Chromium pickaxe', chance: 1500, min: 1, max: 1 },
    { id: 92080, name: 'Chromium axe', chance: 1500, min: 1, max: 1 },
    { id: 92081, name: "Baron's eye", chance: 128, min: 1, max: 1 },
  ],
}, 83010, 'Baron duke', 'A tiny Duke. Stomps and nothing happens.');

// ---------- Boss 10: The Leviathan ----------
// Sea boss in deep Saltbrine. Drops leviathan's lure (BIS fishing weapon).
// Mechanic: surfaces periodically. Breathe attack across the boat.
//           Players must run to the safe side of the vessel.

items.define({
  id: 92082,
  name: "Leviathan's lure",
  examine: "A lure crafted from the Leviathan's own whisker. Fish are irresistibly drawn to it. BIS fishing tool.",
  value: 8000000,
  category: 'weapon',
  equipSlot: 'weapon',
  speed: 5,
  stats: { stab: 48, melee_strength: 40 },
  equipReqs: { attack: 65 },
  passiveEffect: {
    name: 'Abyssal Lure',
    description: '+25% fishing speed. Access to exclusive deep-sea fishing spots.',
    fishingSpeedBonus: 0.25,
    unlockDeepSea: true,
  },
});

items.define({
  id: 92083,
  name: 'Leviathan scale',
  examine: 'A scale from the Leviathan. Can be used to fortify shields against water attacks.',
  value: 1000000,
  category: 'crafting',
  weight: 0.5,
});

items.define({
  id: 92084,
  name: 'Siren staff',
  examine: 'A trident-like staff that fires water bolts. Hits harder the closer you are to water.',
  value: 4000000,
  category: 'weapon',
  equipSlot: 'weapon',
  speed: 4,
  stats: { magic: 20, magic_strength: 18 },
  equipReqs: { magic: 72 },
  passiveEffect: {
    name: 'Tidal Surge',
    description: 'Damage increased by 15% when fighting near water tiles.',
    nearWaterBonus: 0.15,
  },
});

boss('the_leviathan_saltbrine', {
  name: 'The Leviathan', combat: 394, maxHp: 600, maxHit: 42,
  stats: { attack: 230, strength: 220, defence: 210 },
  attackSpeed: 5, attackRange: 10, attackStyle: 'magic', size: 6,
  aggressive: true, aggroRange: 15, wanderRadius: 0, respawnTicks: 80,
  examine: 'A sea serpent of impossible size. It surfaces to breathe destruction across the boat.',
  weakness: 'ranged', tags: ['boss', 'beast', 'sea'],
  resistance: 'melee',
  // Mechanic: fights from the water. Players stand on a boat.
  // Breathe attack sweeps across one half of the boat (left or right, random).
  // Players must run to the other side. 50 damage if caught.
  // At 40% HP: double breath (both sides in sequence, 3 tick gap).
}, {
  always: [{ id: 106, name: 'Big bones', min: 2, max: 2 }],
  main: [
    { id: 101, name: 'Coins', weight: 5, min: 20000, max: 60000 },
    { id: 2306, name: 'Raw shark', weight: 4, min: 15, max: 35 },
    { id: 92083, name: 'Leviathan scale', weight: 2, min: 1, max: 1 },
  ],
  tertiary: [
    { id: 92082, name: "Leviathan's lure", chance: 2000, min: 1, max: 1 },
    { id: 92084, name: 'Siren staff', chance: 1000, min: 1, max: 1 },
  ],
}, 83011, 'Lil leviathan', 'A miniature sea serpent. Splashes in puddles.');


// ══════════════════════════════════════════════════════════════════════════════
// ENDGAME BOSSES (combat 200+)
// ══════════════════════════════════════════════════════════════════════════════

// ---------- Boss 11: Nex ----------
// Ancient goddess in the Wilds GWD extension. Drops Torva armour (BIS melee).
// Mechanic: 5 phases (Smoke -> Shadow -> Blood -> Ice -> Zaros).
//           Each phase requires killing a mage minion to progress.

items.define({
  id: 92100,
  name: 'Torva full helm',
  examine: 'A helm of the ancient Torva set. BIS melee head armour with an HP boost.',
  value: 30000000,
  category: 'armour',
  equipSlot: 'head',
  stats: {
    def_stab: 62, def_slash: 64, def_crush: 59,
    def_magic: -1, def_ranged: 58,
    melee_strength: 6, prayer: 1, hitpoints: 6,
  },
  equipReqs: { defence: 80 },
  setId: 'torva',
});

items.define({
  id: 92101,
  name: 'Torva platebody',
  examine: 'A platebody of the ancient Torva set. BIS melee body armour. Grants an HP boost.',
  value: 60000000,
  category: 'armour',
  equipSlot: 'body',
  stats: {
    def_stab: 140, def_slash: 142, def_crush: 136,
    def_magic: -8, def_ranged: 150,
    melee_strength: 12, prayer: 1, hitpoints: 12,
  },
  equipReqs: { defence: 80 },
  setId: 'torva',
});

items.define({
  id: 92102,
  name: 'Torva platelegs',
  examine: 'Platelegs of the ancient Torva set. BIS melee leg armour with an HP boost.',
  value: 45000000,
  category: 'armour',
  equipSlot: 'legs',
  stats: {
    def_stab: 90, def_slash: 88, def_crush: 92,
    def_magic: -6, def_ranged: 96,
    melee_strength: 8, prayer: 1, hitpoints: 8,
  },
  equipReqs: { defence: 80 },
  setId: 'torva',
  setEffect: {
    name: 'Torva Fortitude',
    pieces: ['torva_full_helm', 'torva_platebody', 'torva_platelegs'],
    description: 'Full set: +26 hitpoints bonus (total). Each piece independently boosts max HP.',
  },
});

items.define({
  id: 92103,
  name: 'Nihil horn',
  examine: 'A horn from the Nihil beasts. Used to create the Zaryte crossbow.',
  value: 5000000,
  category: 'crafting',
  weight: 0.5,
});

items.define({
  id: 92104,
  name: 'Zaryte crossbow',
  examine: 'A crossbow of ancient origin. BIS crossbow -- highest ranged accuracy of any crossbow. Spec ignores prayer.',
  value: 15000000,
  category: 'weapon',
  equipSlot: 'weapon',
  speed: 5,
  stats: { ranged: 110, prayer: 2 },
  equipReqs: { ranged: 80 },
  special: {
    cost: 75,
    name: 'Zaryte Bolt',
    description: 'Fires a bolt that ignores all protection prayers and deals 20% extra damage.',
    ignoreProtection: true,
    damageMultiplier: 1.20,
  },
});

items.define({
  id: 92105,
  name: 'Ancient hilt',
  examine: 'A hilt of ancient design. Combine with a godsword blade for the Ancient godsword.',
  value: 8000000,
  category: 'crafting',
  weight: 0.5,
});

items.define({
  id: 92106,
  name: 'Ancient godsword',
  examine: 'The Ancient godsword. Its special attack deals damage and applies a blood mark that damages the target over time.',
  value: 15000000,
  category: 'weapon',
  equipSlot: 'weapon',
  speed: 6,
  stats: { slash: 132, melee_strength: 132 },
  equipReqs: { attack: 75 },
  special: {
    cost: 50,
    name: 'Blood Sacrifice',
    description: 'Strikes the target and applies a blood mark. After 8 ticks, deals 25 damage. If the target moves, it heals you instead.',
    markDamage: 25,
    markDelay: 8,
    healOnMove: 25,
  },
});

boss('nex_wilds_gwd', {
  name: 'Nex', combat: 1001, maxHp: 3400, maxHit: 60,
  stats: { attack: 340, strength: 320, defence: 320 },
  attackSpeed: 4, attackRange: 8, attackStyle: 'magic', size: 5,
  aggressive: true, aggroRange: 15, wanderRadius: 0, respawnTicks: 120,
  examine: 'An ancient goddess of Zaros. Five phases of divine wrath. Bring a team.',
  weakness: 'ranged', tags: ['boss', 'ancient', 'godwars'],
  resistance: 'melee',
  // Mechanic: 5 phases. Each phase a mage minion (Fumus/Umbra/Cruor/Glacies) must
  // be killed to advance. Smoke phase: accuracy debuff. Shadow phase: ranged attack.
  // Blood phase: heals on hit (must be prayed against). Ice phase: freezes players.
  // Zaros phase: all abilities, enraged.
}, {
  always: [{ id: 107, name: 'Dragon bones', min: 3, max: 3 }],
  main: [
    { id: 101, name: 'Coins', weight: 4, min: 50000, max: 200000 },
    { id: 11363, name: 'Soul rune', weight: 3, min: 80, max: 200 },
    { id: 11358, name: 'Blood rune', weight: 3, min: 100, max: 250 },
    { id: 2116, name: 'Runite bar', weight: 2, min: 5, max: 10 },
  ],
  tertiary: [
    { id: 92100, name: 'Torva full helm', chance: 258, min: 1, max: 1 },
    { id: 92101, name: 'Torva platebody', chance: 258, min: 1, max: 1 },
    { id: 92102, name: 'Torva platelegs', chance: 258, min: 1, max: 1 },
    { id: 92103, name: 'Nihil horn', chance: 258, min: 1, max: 1 },
    { id: 92105, name: 'Ancient hilt', chance: 516, min: 1, max: 1 },
  ],
}, 83012, 'Nexling', 'A miniature Nex. Whispers ancient curses.');

// ---------- Boss 12: Commander Zelot ----------
// Corrupted paladin boss in Heartlands depths. Drops prayer-boosting items.
// Mechanic: alternates between holy (pray melee) and corrupt (pray magic) phases.
//           Holy phase heals nearby players but hits hard. Corrupt phase drains prayer.

items.define({
  id: 92107,
  name: 'Devout boots',
  examine: 'Boots blessed through corruption. BIS prayer bonus boots (+5 prayer).',
  value: 4000000,
  category: 'armour',
  equipSlot: 'feet',
  stats: { prayer: 5, def_stab: 3, def_slash: 3, def_crush: 3, def_ranged: 3 },
  equipReqs: { defence: 60, prayer: 60 },
});

items.define({
  id: 92108,
  name: 'Holy sceptre',
  examine: "A sceptre of corrupted faith. Restores 2 prayer points per enemy killed while equipped.",
  value: 3000000,
  category: 'weapon',
  equipSlot: 'weapon',
  speed: 4,
  stats: { crush: 72, magic: 12, melee_strength: 60, prayer: 6 },
  equipReqs: { attack: 70, prayer: 65 },
  passiveEffect: {
    name: 'Faith Reclaimed',
    description: 'Restores 2 prayer points per enemy killed while this weapon is equipped.',
    prayerRestoreOnKill: 2,
  },
});

items.define({
  id: 92109,
  name: 'Zealot robes top',
  examine: 'Robes of the fallen zealot. Provides strong prayer bonus and decent magic defence.',
  value: 2500000,
  category: 'armour',
  equipSlot: 'body',
  stats: { prayer: 8, def_magic: 30, def_stab: 25, def_slash: 22, def_crush: 28 },
  equipReqs: { defence: 65, prayer: 65 },
});

boss('commander_zelot_heartlands', {
  name: 'Commander Zelot', combat: 420, maxHp: 600, maxHit: 44,
  stats: { attack: 260, strength: 250, defence: 230 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee', size: 2,
  aggressive: true, aggroRange: 8, wanderRadius: 0, respawnTicks: 80,
  examine: 'A paladin who fell to corruption. His faith twisted into something terrible.',
  weakness: 'slash', tags: ['boss', 'undead', 'holy'],
  resistance: 'ranged',
  // Mechanic: holy phase (pray melee) — swings a giant mace, 3x3 AoE slam every 10 ticks.
  // Corrupt phase (pray magic) — drains 8 prayer per hit, fires dark bolts.
  // Phase switch every 25% HP. Holy->Corrupt->Holy->Corrupt.
}, {
  always: [{ id: 107, name: 'Dragon bones', min: 2, max: 2 }],
  main: [
    { id: 101, name: 'Coins', weight: 5, min: 25000, max: 70000 },
    { id: 12304, name: 'Prayer potion(4)', weight: 4, min: 3, max: 6 },
    { id: 11363, name: 'Soul rune', weight: 3, min: 40, max: 100 },
  ],
  tertiary: [
    { id: 92107, name: 'Devout boots', chance: 512, min: 1, max: 1 },
    { id: 92108, name: 'Holy sceptre', chance: 1000, min: 1, max: 1 },
    { id: 92109, name: 'Zealot robes top', chance: 768, min: 1, max: 1 },
  ],
}, 83013, 'Zealot squire', 'A tiny corrupted squire. Prays in the wrong direction.');

// ---------- Boss 13: The Whisperer ----------
// Inkweald dream boss. Drops Virtus armour (BIS magic with prayer).
// Mechanic: pulls players into the dream world. In the dream, shadows
//           chase you while you must find and destroy nightmare pillars.
//           Real world: boss alternates magic/ranged. Prayer switching required.

items.define({
  id: 92110,
  name: 'Virtus mask',
  examine: 'A mask of ancient Virtus. BIS magic head armour with prayer bonus.',
  value: 25000000,
  category: 'armour',
  equipSlot: 'head',
  stats: {
    magic: 8, def_stab: 8, def_slash: 6, def_crush: 10,
    def_magic: 22, def_ranged: 4,
    magic_strength: 3, prayer: 3,
  },
  equipReqs: { magic: 80, defence: 80 },
  setId: 'virtus',
});

items.define({
  id: 92111,
  name: 'Virtus robe top',
  examine: 'A robe top of ancient Virtus. BIS magic body armour with prayer bonus.',
  value: 50000000,
  category: 'armour',
  equipSlot: 'body',
  stats: {
    magic: 22, def_stab: 28, def_slash: 20, def_crush: 32,
    def_magic: 52, def_ranged: 14,
    magic_strength: 6, prayer: 4,
  },
  equipReqs: { magic: 80, defence: 80 },
  setId: 'virtus',
});

items.define({
  id: 92112,
  name: 'Virtus robe bottom',
  examine: 'Robe bottoms of ancient Virtus. BIS magic leg armour with prayer bonus.',
  value: 38000000,
  category: 'armour',
  equipSlot: 'legs',
  stats: {
    magic: 15, def_stab: 18, def_slash: 14, def_crush: 22,
    def_magic: 36, def_ranged: 8,
    magic_strength: 4, prayer: 3,
  },
  equipReqs: { magic: 80, defence: 80 },
  setId: 'virtus',
  setEffect: {
    name: 'Virtus Resonance',
    pieces: ['virtus_mask', 'virtus_robe_top', 'virtus_robe_bottom'],
    description: 'Full set: +10% magic accuracy. Each successful magic hit has a 5% chance to restore 3 prayer points.',
    magicAccuracyBonus: 0.10,
    prayerRestoreChance: 0.05,
    prayerRestoreAmount: 3,
  },
});

items.define({
  id: 92113,
  name: 'Bellator ring',
  examine: 'A ring of the warrior. +6 melee strength. BIS for melee strength bonuses on a ring.',
  value: 12000000,
  category: 'jewellery',
  equipSlot: 'ring',
  stats: { melee_strength: 6, slash: 4, crush: 4, stab: 4 },
  equipReqs: { attack: 75 },
});

items.define({
  id: 92114,
  name: 'Magus ring',
  examine: 'A ring of the mage. +4 magic strength. BIS for magic damage bonuses on a ring.',
  value: 12000000,
  category: 'jewellery',
  equipSlot: 'ring',
  stats: { magic: 6, magic_strength: 4 },
  equipReqs: { magic: 75 },
});

boss('the_whisperer_inkweald', {
  name: 'The Whisperer', combat: 440, maxHp: 700, maxHit: 48,
  stats: { attack: 250, strength: 230, defence: 280 },
  attackSpeed: 4, attackRange: 10, attackStyle: 'magic', size: 4,
  aggressive: true, aggroRange: 12, wanderRadius: 0, respawnTicks: 80,
  examine: 'A being that exists between dreams and reality. Its whispers drag you into nightmares.',
  weakness: 'ranged', tags: ['boss', 'spirit', 'dream'],
  resistance: 'melee',
  // Mechanic: pulls one player into dream world every 25 ticks. In dream world:
  // shadows chase you (10 dmg/tick if caught), must find and destroy 2 nightmare pillars (30 HP each).
  // Real world: boss alternates magic (pray mage) and ranged (pray range) every 3 ticks.
  // At 25% HP: drags ALL players into dream world for final stand.
}, {
  always: [{ id: 107, name: 'Dragon bones', min: 2, max: 2 }],
  main: [
    { id: 101, name: 'Coins', weight: 4, min: 40000, max: 120000 },
    { id: 11363, name: 'Soul rune', weight: 3, min: 60, max: 150 },
    { id: 11358, name: 'Blood rune', weight: 3, min: 80, max: 200 },
  ],
  tertiary: [
    { id: 92110, name: 'Virtus mask', chance: 512, min: 1, max: 1 },
    { id: 92111, name: 'Virtus robe top', chance: 512, min: 1, max: 1 },
    { id: 92112, name: 'Virtus robe bottom', chance: 512, min: 1, max: 1 },
    { id: 92113, name: 'Bellator ring', chance: 1024, min: 1, max: 1 },
    { id: 92114, name: 'Magus ring', chance: 1024, min: 1, max: 1 },
  ],
}, 83014, 'Whisplet', 'A tiny Whisperer. Mutters secrets about your inventory.');

// ---------- Boss 14: Vardorvis ----------
// Sootworks deep forge demon. Drops ultor ring (BIS melee ring).
// Mechanic: four axes swing around the arena in a + pattern, rotating clockwise.
//           Vardorvis heals from any player standing in the axe paths.
//           Must DPS while navigating the rotating axes.

items.define({
  id: 92120,
  name: 'Ultor ring',
  examine: 'A ring of the destroyer. +12 melee strength. THE BIS melee ring.',
  value: 20000000,
  category: 'jewellery',
  equipSlot: 'ring',
  stats: { melee_strength: 12, stab: 2, slash: 2, crush: 2 },
  equipReqs: { attack: 80, strength: 80 },
});

items.define({
  id: 92121,
  name: 'Venator ring',
  examine: 'A ring of the hunter. +12 ranged strength. THE BIS ranged ring.',
  value: 20000000,
  category: 'jewellery',
  equipSlot: 'ring',
  stats: { ranged_strength: 12, ranged: 2 },
  equipReqs: { ranged: 80 },
});

items.define({
  id: 92122,
  name: 'Executioner axe',
  examine: "Vardorvis's executioner axe. Slow but devastating. Each successive hit on the same target deals +5% more damage (stacks 5 times).",
  value: 10000000,
  category: 'weapon',
  equipSlot: 'weapon',
  twoHanded: true,
  speed: 6,
  stats: { slash: 125, melee_strength: 118 },
  equipReqs: { attack: 80, strength: 75 },
  passiveEffect: {
    name: 'Executioner',
    description: 'Each successive hit on the same target deals +5% more damage, stacking up to 5 times (+25% max). Resets on target switch.',
    stackBonus: 0.05,
    maxStacks: 5,
    resetsOnSwitch: true,
  },
});

boss('vardorvis_sootworks', {
  name: 'Vardorvis', combat: 460, maxHp: 640, maxHit: 52,
  stats: { attack: 280, strength: 270, defence: 220 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee', size: 4,
  aggressive: true, aggroRange: 8, wanderRadius: 0, respawnTicks: 80,
  examine: 'A forge demon sealed in the deepest vein of the Sootworks. His axes never stop spinning.',
  weakness: 'stab', tags: ['boss', 'demon'],
  resistance: 'magic',
  // Mechanic: 4 giant axes rotate around the arena in a + pattern, clockwise.
  // Standing in an axe path deals 30 damage and heals Vardorvis 15 HP.
  // Must navigate between axes while maintaining melee distance.
  // At 33% HP: axes speed up (rotate 2x faster) and a 5th axe appears.
}, {
  always: [{ id: 107, name: 'Dragon bones', min: 2, max: 2 }],
  main: [
    { id: 101, name: 'Coins', weight: 4, min: 30000, max: 90000 },
    { id: 11357, name: 'Death rune', weight: 3, min: 80, max: 200 },
    { id: 11358, name: 'Blood rune', weight: 3, min: 60, max: 150 },
  ],
  tertiary: [
    { id: 92120, name: 'Ultor ring', chance: 1024, min: 1, max: 1 },
    { id: 92121, name: 'Venator ring', chance: 1024, min: 1, max: 1 },
    { id: 92122, name: 'Executioner axe', chance: 512, min: 1, max: 1 },
  ],
}, 83015, 'Butcher cub', 'A tiny Vardorvis. Spins constantly.');

// ---------- Boss 15: Sol Heredit ----------
// Colosseum champion in the Glass Desert. Drops Dizana's quiver (BIS ranged cape).
// Mechanic: wave-based Colosseum. 12 waves of escalating monsters, then
//           Sol Heredit as the final champion. Each wave offers a choice:
//           easier next wave (less loot) or harder next wave (more loot).

items.define({
  id: 92130,
  name: "Dizana's quiver",
  examine: "A divine quiver blessed by Dizana. BIS ranged cape slot. Ammunition never runs out for bolts and arrows.",
  value: 40000000,
  category: 'armour',
  equipSlot: 'cape',
  stats: {
    ranged: 6, ranged_strength: 10,
    def_stab: 4, def_slash: 4, def_crush: 4,
    def_magic: 8, def_ranged: 12,
    prayer: 2,
  },
  equipReqs: { ranged: 80 },
  passiveEffect: {
    name: 'Infinite Quiver',
    description: 'Bolts and arrows are never consumed. Saves ammunition permanently.',
    unlimitedAmmo: true,
  },
});

items.define({
  id: 92131,
  name: "Sunfire fanatic helm",
  examine: 'A helm forged in the Colosseum furnaces. Provides strong melee stats with prayer bonus.',
  value: 6000000,
  category: 'armour',
  equipSlot: 'head',
  stats: {
    def_stab: 50, def_slash: 54, def_crush: 48,
    def_magic: -4, def_ranged: 46,
    melee_strength: 4, prayer: 5,
  },
  equipReqs: { defence: 75, prayer: 70 },
});

items.define({
  id: 92132,
  name: "Sunfire fanatic cuirass",
  examine: 'A cuirass forged in the Colosseum furnaces. BIS melee+prayer hybrid body.',
  value: 12000000,
  category: 'armour',
  equipSlot: 'body',
  stats: {
    def_stab: 110, def_slash: 114, def_crush: 106,
    def_magic: -10, def_ranged: 118,
    melee_strength: 6, prayer: 6,
  },
  equipReqs: { defence: 75, prayer: 70 },
});

items.define({
  id: 92133,
  name: "Sunfire fanatic greaves",
  examine: 'Greaves forged in the Colosseum furnaces. Strong melee legs with prayer bonus.',
  value: 8000000,
  category: 'armour',
  equipSlot: 'legs',
  stats: {
    def_stab: 72, def_slash: 74, def_crush: 68,
    def_magic: -8, def_ranged: 76,
    melee_strength: 4, prayer: 4,
  },
  equipReqs: { defence: 75, prayer: 70 },
});

items.define({
  id: 92134,
  name: 'Echo crystal',
  examine: 'A crystal from the Colosseum that echoes combat. Used to upgrade weapons with a ricochet effect.',
  value: 5000000,
  category: 'crafting',
  weight: 0.3,
});

boss('sol_heredit_colosseum', {
  name: 'Sol Heredit', combat: 580, maxHp: 900, maxHit: 64,
  stats: { attack: 320, strength: 310, defence: 300 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee', size: 3,
  aggressive: true, aggroRange: 8, wanderRadius: 0, respawnTicks: 0,
  examine: 'The champion of the Colosseum. He has never been defeated. He intends to keep it that way.',
  weakness: 'stab', tags: ['boss', 'warrior', 'champion'],
  // Mechanic: Sol fights with all three styles. Prayer switching every 2-3 attacks.
  // Grapple attack: pulls player to him and slams for 50 damage (dodge by moving on pull tick).
  // Shield bash: 3x3 AoE stun (3 ticks) if not sidestepped.
  // At 20% HP: enrages, attack speed +2, max hit 78. Pure DPS race.
}, {
  always: [{ id: 107, name: 'Dragon bones', min: 2, max: 2 }],
  main: [
    { id: 101, name: 'Coins', weight: 4, min: 50000, max: 150000 },
    { id: 11364, name: 'Wrath rune', weight: 3, min: 50, max: 120 },
    { id: 11363, name: 'Soul rune', weight: 3, min: 60, max: 150 },
  ],
  tertiary: [
    { id: 92130, name: "Dizana's quiver", chance: 2500, min: 1, max: 1 },
    { id: 92131, name: 'Sunfire fanatic helm', chance: 500, min: 1, max: 1 },
    { id: 92132, name: 'Sunfire fanatic cuirass', chance: 500, min: 1, max: 1 },
    { id: 92133, name: 'Sunfire fanatic greaves', chance: 500, min: 1, max: 1 },
    { id: 92134, name: 'Echo crystal', chance: 200, min: 1, max: 1 },
  ],
}, 83016, 'Smol heredit', 'A tiny gladiator. Challenges ants to duels.');


// ##############################################################################
//
//   SECTION 8 -- SUMMARY & EXPORT
//
// ##############################################################################

// Item IDs defined in this file
const toaUniqueItems = [
  92000, 92001, 92002, 92003, 92004, 92005, 92006, 92007, 92008,
  92009, 92010, 92011, 92012, 92013, 92014, 92015, 92016,
  92040, 92041, 92042,
];

const bossUniqueItems = [
  // Entry
  92050, 92051, 92052, 92053, 92054, 92055, 92056, 92057, 92058, 92059, 92060, 92061,
  // Mid
  92070, 92071, 92072, 92073, 92074, 92075, 92076, 92077, 92078, 92079, 92080, 92081,
  92082, 92083, 92084,
  // Endgame
  92100, 92101, 92102, 92103, 92104, 92105, 92106, 92107, 92108, 92109,
  92110, 92111, 92112, 92113, 92114,
  92120, 92121, 92122,
  92130, 92131, 92132, 92133, 92134,
];

const petIds = [
  83001, 83002, 83003, 83004, 83005, 83006, 83007, 83008,
  83009, 83010, 83011, 83012, 83013, 83014, 83015, 83016,
];

// NPC definitions
const toaNpcs = [
  'toa_zebak', 'toa_kephri', 'toa_scarab_swarm',
  'toa_akkha', 'toa_baba', 'toa_baboon_thrall',
  'toa_warden_elidinis', 'toa_warden_tumeken', 'toa_warden_obelisk', 'toa_warden_fused',
];

const bossNpcs = [
  // Entry
  'bryophyta_heartlands', 'obor_heartlands', 'hespori_veilwood', 'mimic_clue', 'skotizo_moryskah',
  // Mid
  'sarachnis_moryskah', 'tempoross_saltbrine', 'phantom_muspah_inkweald', 'duke_sucellus_sootworks', 'the_leviathan_saltbrine',
  // Endgame
  'nex_wilds_gwd', 'commander_zelot_heartlands', 'the_whisperer_inkweald', 'vardorvis_sootworks', 'sol_heredit_colosseum',
];

// Drop tables
const toaTables = [
  'toa_standard_loot', 'toa_unique_loot',
  'toa_zebak', 'toa_kephri', 'toa_akkha', 'toa_baba', 'toa_wardens',
];

const bossTables = bossNpcs; // Each boss has its own drop table via the boss() helper

console.log('');
console.log('='.repeat(70));
console.log('  AELGARD RAIDS & BOSSES MEGA EXPANSION LOADED');
console.log('='.repeat(70));
console.log('');
console.log('  TOMBS OF AELGARD (ToA) -- RAID 3');
console.log('    Location:       Boneyard Wastes pyramid');
console.log(`    Players:        ${TOMBS_OF_AELGARD.minPlayers}-${TOMBS_OF_AELGARD.maxPlayers} (solo to group, scales)`);
console.log(`    Paths:          ${TOMBS_OF_AELGARD.rooms.length} (${TOMBS_OF_AELGARD.rooms.length - 1} paths + 1 final boss)`);
console.log(`    Invocations:    ${TOA_INVOCATIONS.length} (raid level 0-600)`);
console.log(`    NPCs:           ${toaNpcs.length}`);
console.log(`    Unique items:   ${toaUniqueItems.length}`);
console.log(`    Drop tables:    ${toaTables.length}`);
console.log("    Key uniques:    Osmumten's fang, Masori (3pc), Lightbearer,");
console.log("                    Elidinis' ward, Tumeken's shadow, Keris partisan (3 upgrades)");
console.log('');
console.log('  15 ADDITIONAL BOSSES');
console.log('    Entry-level:    Bryophyta, Obor, Hespori, Mimic, Skotizo');
console.log('    Mid-level:      Sarachnis, Tempoross, Phantom Muspah, Duke Sucellus, The Leviathan');
console.log('    Endgame:        Nex, Commander Zelot, The Whisperer, Vardorvis, Sol Heredit');
console.log(`    Boss NPCs:      ${bossNpcs.length}`);
console.log(`    Boss items:     ${bossUniqueItems.length}`);
console.log(`    Boss pets:      ${petIds.length}`);
console.log('    Key uniques:    Torva (3pc, BIS melee), Virtus (3pc, BIS magic+prayer),');
console.log("                    Ultor ring (BIS melee ring), Dizana's quiver (BIS ranged cape),");
console.log('                    Chromium tools, Zaryte crossbow, Ancient godsword');
console.log('');
console.log(`  TOTALS: ${toaUniqueItems.length + bossUniqueItems.length} items, ${toaNpcs.length + bossNpcs.length} NPCs, ${petIds.length} pets, ${toaTables.length + bossTables.length} drop tables`);
console.log('='.repeat(70));
console.log('');

module.exports = {
  TOMBS_OF_AELGARD,
  TOA_INVOCATIONS,
};
