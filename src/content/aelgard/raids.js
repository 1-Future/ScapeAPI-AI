// ==============================================================================
// Aelgard -- Raids
//
// Two endgame group raids, the biggest hour sinks in the game.
// Each run takes 30-60 minutes and drops the best items in the game.
//
// Manifesto:
//   P04 Non-degenerate  -- each room tests different skills/combat styles
//   P08 Breakpoint       -- completion unlocks BIS gear that changes how you play
//   P12 Encounter itemization -- different rooms need different gear setups
//   P13 Design knobs     -- HIGH attention, HIGH complexity, HIGH danger, HIGH reward
//
// RAID 1: Chambers of Aelgard (CoA) -- Glass Desert ruins, 3-5 players, 6 rooms
// RAID 2: Theatre of Shadows  (ToS) -- Castle Malachar, 4-5 players, 5 bosses
// ==============================================================================

const items = require('../../data/items');
const npcs = require('../../world/npcs');
const droptables = require('../../data/droptables');
const registry = require('../../engine/content-registry');

// ##############################################################################
//
//   SECTION 1 -- RAID UNIQUE ITEMS
//
//   IDs 90000-90099: Chambers of Aelgard uniques
//   IDs 90100-90199: Theatre of Shadows uniques
//   IDs 90200-90249: Shared raid supplies / materials
//
//   Design rule: every unique is BIS for a *specific scenario* but NOT
//   universally BIS. The player who only raids still wants items from
//   the other raid, from solo bosses, and from skilling.
//
// ##############################################################################

// ==========================================================================
// CHAMBERS OF AELGARD -- Unique Rewards
// ==========================================================================

// -- Dragon claws --
// BIS special attack weapon (two rapid hits that can stack enormous damage)
// but mediocre sustained DPS -- slow speed, low base stats outside spec.
// Use case: PvP KO weapon, boss finisher, Slayer spec weapon.
items.define({
  id: 90001,
  name: 'Dragon claws',
  examine: 'Razor-sharp claws of dragonkin origin. Their special attack strikes four times in rapid succession.',
  value: 10000000,
  category: 'weapon',
  equipSlot: 'weapon',
  speed: 4,
  stats: { slash: 57, melee_strength: 56 },
  equipReqs: { attack: 60 },
  special: {
    cost: 50,
    name: 'Slice and Dice',
    description: 'Four rapid hits. First hit sets the ceiling for the remaining three.',
    hits: 4,
    damageMultiplier: 1.0,
  },
});

// -- Dexterous prayer scroll --
// Unlocks Rigour prayer (ranged equivalent of Piety).
// Breakpoint item: transforms ranged from "decent" to "dominant" at bosses
// that are weak to ranged. Without it, melee Piety users always out-DPS you.
items.define({
  id: 90002,
  name: 'Dexterous prayer scroll',
  examine: 'An ancient scroll inscribed with the prayer of Rigour. Reading it will unlock the prayer permanently.',
  value: 12000000,
  category: 'prayer',
  tradeable: true,
  weight: 0.5,
  useEffect: 'unlock_prayer_rigour',
});

// -- Arcane prayer scroll --
// Unlocks Augury prayer (magic equivalent of Piety).
// Same breakpoint logic as Rigour -- magic DPS without Augury can't
// compete with melee Piety at magic-weak bosses.
items.define({
  id: 90003,
  name: 'Arcane prayer scroll',
  examine: 'An ancient scroll inscribed with the prayer of Augury. Reading it will unlock the prayer permanently.',
  value: 8000000,
  category: 'prayer',
  tradeable: true,
  weight: 0.5,
  useEffect: 'unlock_prayer_augury',
});

// -- Dragon hunter crossbow --
// BIS against anything tagged 'dragon'. +30% accuracy and +25% damage
// vs dragons, but otherwise worse than Armadyl crossbow for general use.
// Niche: dragon Slayer tasks, Veldrak, metal dragons in Sootworks.
items.define({
  id: 90004,
  name: 'Dragon hunter crossbow',
  examine: 'A crossbow imbued with dragonbane magic. Devastating against dragonkind.',
  value: 7000000,
  category: 'weapon',
  equipSlot: 'weapon',
  speed: 5,
  stats: { ranged: 95, prayer: 0 },
  equipReqs: { ranged: 65 },
  passiveEffect: {
    name: 'Dragonbane',
    description: '+30% accuracy and +25% damage against dragons.',
    targetTags: ['dragon'],
    accuracyBonus: 0.30,
    damageBonus: 0.25,
  },
});

// -- Dinh's bulwark --
// BIS tanking shield. Massive defensive stats, but you can't attack while
// wielding it. Use case: tanking raid rooms, protecting the grub at
// Vespula, face-tanking in Theatre P1 Verzik.
items.define({
  id: 90005,
  name: "Dinh's bulwark",
  examine: 'A colossal shield forged by the legendary smith Dinh. So heavy it requires both hands.',
  value: 5000000,
  category: 'armour',
  equipSlot: 'weapon',
  twoHanded: true,
  stats: {
    def_stab: 120, def_slash: 128, def_crush: 122,
    def_magic: -10, def_ranged: 115,
    melee_strength: 0,
  },
  equipReqs: { attack: 75, defence: 75 },
  passiveEffect: {
    name: 'Bulwark Stance',
    description: 'Cannot attack. Reduced incoming damage in multi-combat.',
    cannotAttack: true,
    multiCombatDamageReduction: 0.20,
  },
});

// -- Elder maul --
// BIS crush weapon for single massive hits. Slowest weapon in the game
// (speed 7) but highest single-hit max. BIS at Gargoyles, Tekton,
// anything with high defence that is weak to crush. Terrible DPS against
// low-defence targets where faster weapons win.
items.define({
  id: 90006,
  name: 'Elder maul',
  examine: 'A massive granite maul from the elder ages. Each swing lands like a mountain.',
  value: 6000000,
  category: 'weapon',
  equipSlot: 'weapon',
  twoHanded: true,
  speed: 7,
  stats: { crush: 147, melee_strength: 147 },
  equipReqs: { attack: 75, strength: 75 },
});

// -- Kodai wand --
// BIS magic weapon for sustained casting. Provides unlimited water runes
// and +15% chance to negate rune costs entirely. Highest magic accuracy
// of any 1H weapon, but no melee stats -- useless if you need to hybridize.
items.define({
  id: 90007,
  name: 'Kodai wand',
  examine: 'An ancient wand suffused with primordial water magic. Provides unlimited water runes.',
  value: 9000000,
  category: 'weapon',
  equipSlot: 'weapon',
  speed: 4,
  stats: { magic: 28, magic_strength: 15 },
  equipReqs: { magic: 75 },
  passiveEffect: {
    name: 'Kodai Augmentation',
    description: 'Unlimited water runes. 15% chance to negate rune cost on any spell.',
    unlimitedRunes: ['water'],
    runeNegateChance: 0.15,
  },
});

// -- Chambers supply drops (non-unique, used in points math) --
items.define({
  id: 90200,
  name: 'Ancient tablet',
  examine: 'A teleport tablet that returns you to the Chambers of Aelgard entrance.',
  value: 10000,
  category: 'teleport',
  tradeable: false,
  weight: 0.5,
});

items.define({
  id: 90201,
  name: 'Dark relic',
  examine: 'An artefact from the Chambers. Can be exchanged for Prayer experience.',
  value: 25000,
  category: 'misc',
  tradeable: false,
  weight: 2,
});

// ==========================================================================
// THEATRE OF SHADOWS -- Unique Rewards
// ==========================================================================

// -- Ghrazi rapier --
// BIS stab weapon. Highest stab accuracy and strength of any 1H melee
// weapon. But *only* for stab -- worse than Abyssal whip against
// slash-weak monsters, worse than Elder maul against crush-weak targets.
// Use case: dragons, Vespula (her chitin is weak to stab), Kalphites.
items.define({
  id: 90101,
  name: 'Ghrazi rapier',
  examine: 'A vampyric rapier of exquisite craftsmanship. The blade never dulls and drinks the blood it spills.',
  value: 12000000,
  category: 'weapon',
  equipSlot: 'weapon',
  speed: 4,
  stats: { stab: 94, melee_strength: 89 },
  equipReqs: { attack: 75 },
});

// -- Avernic defender --
// BIS melee off-hand. Upgrades the Dragon defender with better stats
// across the board, but only works with melee. Ranged and mage users
// get nothing from it. Attached permanently (cannot be recovered).
items.define({
  id: 90102,
  name: 'Avernic defender',
  examine: 'A defender hilt of Avernic demon origin. Combined with a Dragon defender, it becomes the strongest defender.',
  value: 8000000,
  category: 'armour',
  equipSlot: 'shield',
  stats: {
    stab: 30, slash: 29, crush: 28,
    def_stab: 30, def_slash: 29, def_crush: 28,
    def_magic: -5, def_ranged: -4,
    melee_strength: 8,
  },
  equipReqs: { attack: 70, defence: 70 },
});

// -- Sanguinesti staff --
// BIS magic weapon for healing sustain. 1 in 6 chance on hit to heal
// the caster for half the damage dealt. Highest magic accuracy of any
// powered staff, but requires blood runes as ammo (expensive to use).
// Worse raw DPS than Kodai + ice barrage, but the self-healing lets
// you bring fewer food slots.
items.define({
  id: 90103,
  name: 'Sanguinesti staff',
  examine: 'A staff carved from bloodwood and set with a crimson jewel. It feeds on the life force of its victims.',
  value: 14000000,
  category: 'weapon',
  equipSlot: 'weapon',
  speed: 4,
  stats: { magic: 25, magic_strength: 12 },
  equipReqs: { magic: 75 },
  ammoType: 'blood_rune',
  ammoCost: 3,
  passiveEffect: {
    name: 'Sanguine Drain',
    description: '1/6 chance per hit to heal for 50% of damage dealt.',
    healOnHitChance: 1 / 6,
    healOnHitPercent: 0.50,
  },
});

// -- Justiciar faceguard --
// BIS tank helmet. Part of the Justiciar set (3-piece effect).
// Individually: massive def stats but negative offensive bonuses.
// You sacrifice ALL damage to become nearly unkillable.
// Set effect: incoming damage reduced by percentage = (total armour / 3000).
items.define({
  id: 90104,
  name: 'Justiciar faceguard',
  examine: 'The helm of a Justiciar knight. Designed to endure, not to strike.',
  value: 4000000,
  category: 'armour',
  equipSlot: 'head',
  stats: {
    def_stab: 60, def_slash: 63, def_crush: 58,
    def_magic: -6, def_ranged: 58,
    prayer: 4,
    stab: -4, slash: -4, crush: -4,
    ranged: -4, magic: -4,
  },
  equipReqs: { defence: 75 },
  setId: 'justiciar',
});

// -- Justiciar chestguard --
items.define({
  id: 90105,
  name: 'Justiciar chestguard',
  examine: 'The cuirass of a Justiciar knight. Immovable as a fortress wall.',
  value: 8000000,
  category: 'armour',
  equipSlot: 'body',
  stats: {
    def_stab: 132, def_slash: 130, def_crush: 127,
    def_magic: -16, def_ranged: 142,
    prayer: 4,
    stab: -8, slash: -8, crush: -8,
    ranged: -8, magic: -8,
  },
  equipReqs: { defence: 75 },
  setId: 'justiciar',
});

// -- Justiciar legguards --
items.define({
  id: 90106,
  name: 'Justiciar legguards',
  examine: 'The greaves of a Justiciar knight. Built to hold the line.',
  value: 6000000,
  category: 'armour',
  equipSlot: 'legs',
  stats: {
    def_stab: 84, def_slash: 80, def_crush: 83,
    def_magic: -12, def_ranged: 88,
    prayer: 4,
    stab: -6, slash: -6, crush: -6,
    ranged: -6, magic: -6,
  },
  equipReqs: { defence: 75 },
  setId: 'justiciar',
  setEffect: {
    name: 'Justiciar Fortitude',
    pieces: ['justiciar_faceguard', 'justiciar_chestguard', 'justiciar_legguards'],
    description: 'Incoming damage reduced by (total armour rating / 3000) percent. At max gear this is roughly 8-10%.',
  },
});

// -- Lil' Zik pet --
items.define({
  id: 90107,
  name: "Lil' Zik",
  examine: 'A tiny Verzik Vitur. She hisses at everything.',
  value: 0,
  category: 'pet',
  tradeable: false,
  weight: 0,
});

// -- Verzik's crystal shard (supplies) --
items.define({
  id: 90108,
  name: "Verzik's crystal shard",
  examine: 'A shard from the Theatre of Shadows. Can be used to create Ghrazi armour.',
  value: 50000,
  category: 'crafting',
  tradeable: true,
  stackable: true,
  weight: 0.1,
});

// -- Vial of vyre blood (Theatre supply drop) --
items.define({
  id: 90109,
  name: 'Vial of vyre blood',
  examine: 'Concentrated vampyric blood. Used to charge the Sanguinesti staff and Scythe of vitur.',
  value: 5000,
  category: 'herblore',
  tradeable: true,
  stackable: true,
  weight: 0.1,
});

// -- Avernic defender hilt (raw drop, combined with Dragon defender) --
items.define({
  id: 90110,
  name: 'Avernic defender hilt',
  examine: 'A hilt that can be attached to a Dragon defender to create an Avernic defender. This cannot be undone.',
  value: 8000000,
  category: 'crafting',
  tradeable: true,
  weight: 1,
});


// ##############################################################################
//
//   SECTION 2 -- RAID BOSS DEFINITIONS
//
//   Every boss has full stats, weakness, tags, and a purpose within its raid.
//   Tags determine which items get passive bonuses against them.
//
// ##############################################################################

// ==========================================================================
// CHAMBERS OF AELGARD -- Room Bosses & Monsters
// ==========================================================================

// ---------- Room 1: Vanguards ----------
// Three bosses that MUST die within 10 ticks of each other or they heal.
// Forces the group to split into melee, ranged, and mage teams.
// P04: you can't just bring one combat style.
// P12: each sub-team needs different gear.

npcs.defineNpc('coa_vanguard_melee', {
  name: 'Vanguard Titan',
  combat: 310,
  maxHp: 400,
  maxHit: 38,
  stats: { attack: 180, strength: 170, defence: 200 },
  attackSpeed: 5,
  attackRange: 1,
  attackStyle: 'melee',
  size: 3,
  aggressive: true,
  aggroRange: 8,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A colossal armoured warrior. Weak to magic, devastates anyone in melee range.',
  weakness: 'magic',
  tags: ['raid', 'chambers', 'vanguard', 'armoured'],
  resistance: 'melee',
  raidRoom: 'vanguards',
  raidMechanic: 'Must die within 10 ticks of its partners or heals 33% HP.',
});

npcs.defineNpc('coa_vanguard_ranged', {
  name: 'Vanguard Deadeye',
  combat: 310,
  maxHp: 400,
  maxHit: 35,
  stats: { attack: 170, strength: 100, defence: 180 },
  attackSpeed: 4,
  attackRange: 10,
  attackStyle: 'ranged',
  size: 3,
  aggressive: true,
  aggroRange: 12,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A crystalline archer. Weak to melee, fires piercing bolts at range.',
  weakness: 'melee',
  tags: ['raid', 'chambers', 'vanguard'],
  resistance: 'ranged',
  raidRoom: 'vanguards',
  raidMechanic: 'Must die within 10 ticks of its partners or heals 33% HP.',
});

npcs.defineNpc('coa_vanguard_mage', {
  name: 'Vanguard Seer',
  combat: 310,
  maxHp: 400,
  maxHit: 36,
  stats: { attack: 175, strength: 95, defence: 190 },
  attackSpeed: 5,
  attackRange: 10,
  attackStyle: 'magic',
  size: 3,
  aggressive: true,
  aggroRange: 12,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A robed crystal mage. Weak to ranged, casts devastating area spells.',
  weakness: 'ranged',
  tags: ['raid', 'chambers', 'vanguard'],
  resistance: 'magic',
  raidRoom: 'vanguards',
  raidMechanic: 'Must die within 10 ticks of its partners or heals 33% HP.',
});

// ---------- Room 2: Tekton the Forge Guardian ----------
// Anvil phase: players must smith a key while Tekton rampages.
// P04: tests Smithing skill AND combat simultaneously.
// P12: bring a hammer, bring crush weapons (he's stone-bodied).
// When Tekton reaches the anvil he heals. You must lure him away.

npcs.defineNpc('coa_tekton', {
  name: 'Tekton, Forge Guardian',
  combat: 400,
  maxHp: 600,
  maxHit: 54,
  stats: { attack: 220, strength: 250, defence: 280 },
  attackSpeed: 5,
  attackRange: 1,
  attackStyle: 'melee',
  size: 4,
  aggressive: true,
  aggroRange: 10,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A golem forged in the chambers. Stone skin deflects blades and arrows. Crush it.',
  weakness: 'crush',
  tags: ['raid', 'chambers', 'construct', 'armoured'],
  resistance: 'ranged',
  raidRoom: 'tekton',
  phases: [
    {
      name: 'Active',
      hpThreshold: 1.0,
      description: 'Tekton attacks the nearest player. Every 15 ticks he walks to his anvil.',
      specialAttack: {
        name: 'Forge Slam',
        description: 'Slams the ground in a 3x3 AoE for 40-54 damage. 1 tick to dodge.',
        aoeSize: 3,
        damageRange: [40, 54],
        dodgeWindow: 1,
        tickInterval: 12,
      },
    },
    {
      name: 'Anvil Phase',
      hpThreshold: 0.5,
      description: 'Tekton retreats to the anvil and repairs himself. Players must smith the Chamber Key while a sub-team lures Tekton away.',
      healPerTick: 8,
      smithingReq: 55,
      keyItem: 'Chamber forge key',
    },
    {
      name: 'Enraged',
      hpThreshold: 0.25,
      description: 'Tekton glows red. Attack speed increases, max hit rises to 68. Must burn him down.',
      maxHitOverride: 68,
      attackSpeedOverride: 4,
    },
  ],
});

// ---------- Room 3: Vespula the Brood Mother ----------
// Protect the grub: a friendly NPC that Vespula's adds try to kill.
// If the grub dies, the room fails. Players must DPS Vespula while
// intercepting adds. Vespula herself is airborne (ranged/magic only).
// P04: melee players switch to add control, ranged DPS the boss.
// P12: anti-dragon shield useless here, need ranged + prayer.

npcs.defineNpc('coa_vespula', {
  name: 'Vespula, Brood Mother',
  combat: 350,
  maxHp: 500,
  maxHit: 32,
  stats: { attack: 190, strength: 130, defence: 200 },
  attackSpeed: 4,
  attackRange: 8,
  attackStyle: 'ranged',
  size: 3,
  aggressive: true,
  aggroRange: 15,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A massive insectoid queen suspended in the air. Projectiles and magic only.',
  weakness: 'stab',
  tags: ['raid', 'chambers', 'insect', 'airborne'],
  resistance: 'melee',
  raidRoom: 'vespula',
  phases: [
    {
      name: 'Airborne',
      hpThreshold: 1.0,
      description: 'Vespula flies above. Only ranged and magic can reach her. She spawns Vespine soldiers every 8 ticks.',
      spawnInterval: 8,
      spawnDefId: 'coa_vespine_soldier',
    },
    {
      name: 'Grounded',
      hpThreshold: 0.33,
      description: 'Vespula lands and becomes vulnerable to melee. Spawns accelerate to every 5 ticks. Enraged melee attacks for 44.',
      maxHitOverride: 44,
      spawnInterval: 5,
    },
  ],
});

npcs.defineNpc('coa_vespine_soldier', {
  name: 'Vespine soldier',
  combat: 85,
  maxHp: 50,
  maxHit: 12,
  stats: { attack: 60, strength: 55, defence: 40 },
  attackSpeed: 3,
  attackRange: 1,
  attackStyle: 'melee',
  size: 1,
  aggressive: true,
  aggroRange: 15,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A Vespine drone. It targets the grub.',
  weakness: 'slash',
  tags: ['raid', 'chambers', 'insect'],
  raidRoom: 'vespula',
  raidMechanic: 'Always aggros the Chamber Grub. Must be intercepted.',
  priorityTarget: 'chamber_grub',
});

npcs.defineNpc('coa_chamber_grub', {
  name: 'Chamber Grub',
  combat: 0,
  maxHp: 200,
  maxHit: 0,
  stats: { attack: 0, strength: 0, defence: 15 },
  attackSpeed: 0,
  attackRange: 0,
  attackStyle: 'none',
  size: 2,
  aggressive: false,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A grub feeding on the chamber walls. If it dies, the portal closes and the room fails.',
  weakness: 'none',
  tags: ['raid', 'chambers', 'protect'],
  raidRoom: 'vespula',
  raidMechanic: 'Friendly NPC. If it reaches 0 HP the room fails. Can be healed with Redemption prayer.',
});

// ---------- Room 4: Mystic Sanctum ----------
// Prayer puzzle: activate the correct prayers in the correct sequence
// within a time limit. Wrong prayers deal 40 damage to the whole team.
// P04: tests game knowledge (prayer), not just DPS.
// P13: HIGH attention -- one wrong flick wipes you.
// No boss, but the sanctum itself attacks on failure.

npcs.defineNpc('coa_sanctum_guardian', {
  name: 'Sanctum Guardian',
  combat: 250,
  maxHp: 350,
  maxHit: 30,
  stats: { attack: 160, strength: 120, defence: 160 },
  attackSpeed: 4,
  attackRange: 6,
  attackStyle: 'magic',
  size: 2,
  aggressive: true,
  aggroRange: 10,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A spirit bound to the Sanctum. It enforces the prayer trial.',
  weakness: 'ranged',
  tags: ['raid', 'chambers', 'spirit', 'undead'],
  resistance: 'magic',
  raidRoom: 'mystic_sanctum',
  phases: [
    {
      name: 'Prayer Trial',
      hpThreshold: 1.0,
      description: 'Announces a prayer sequence. Players must activate the correct overhead in order. Wrong prayer = 40 damage to team.',
      prayerSequenceLength: 5,
      failDamage: 40,
      ticksPerPrayer: 6,
    },
    {
      name: 'Wrath',
      hpThreshold: 0.4,
      description: 'Enraged. Attacks speed up and it alternates mage/range requiring prayer switching.',
      attackSpeedOverride: 3,
      alternatesStyle: true,
    },
  ],
});

// ---------- Room 5: The Ice Demon ----------
// Skilling room: players must chop logs (Woodcutting), light braziers
// (Firemaking), and lure them near the Ice Demon to thaw it. While
// frozen, the demon takes 80% reduced damage. While thawed, you DPS.
// P04: tests Woodcutting, Firemaking, AND combat.
// P12: bring an axe and a tinderbox alongside your combat gear.

npcs.defineNpc('coa_ice_demon', {
  name: 'The Ice Demon',
  combat: 340,
  maxHp: 500,
  maxHit: 42,
  stats: { attack: 200, strength: 180, defence: 250 },
  attackSpeed: 5,
  attackRange: 8,
  attackStyle: 'magic',
  size: 4,
  aggressive: true,
  aggroRange: 15,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A demon encased in ancient ice. Must be thawed with fire before it can be harmed.',
  weakness: 'slash',
  tags: ['raid', 'chambers', 'demon', 'ice'],
  resistance: 'magic',
  raidRoom: 'ice_demon',
  phases: [
    {
      name: 'Frozen',
      hpThreshold: 1.0,
      description: 'Takes 80% reduced damage. Players must chop nearby trees (Woodcutting 55+) and light braziers (Firemaking 50+) adjacent to the demon.',
      damageReduction: 0.80,
      woodcuttingReq: 55,
      firemakingReq: 50,
      brazierCount: 4,
      logsPerBrazier: 3,
      thawDuration: 30,
    },
    {
      name: 'Thawed',
      hpThreshold: 1.0,
      description: 'Takes full damage for 30 ticks. Attacks with ranged ice shards and melee swipes.',
      damageReduction: 0.0,
      specialAttack: {
        name: 'Blizzard',
        description: 'Covers a 5x5 area in ice. Standing in it deals 15 damage per tick.',
        aoeSize: 5,
        damagePerTick: 15,
        duration: 8,
        tickInterval: 15,
      },
    },
    {
      name: 'Refreezing',
      description: 'After thaw expires, refreezes. Must thaw again. Each refreeze makes next thaw require 1 more log per brazier.',
      damageReduction: 0.80,
    },
  ],
});

// ---------- Room 6: The Great Crystal Serpent (Final Boss) ----------
// 4-phase fight. Prayer switching, AoE dodging, team coordination.
// P13: maximum attention -- this is the hardest content in the game.
// P04: phase 1 tests range, phase 2 tests magic, phase 3 tests melee,
//      phase 4 tests all three in rapid switching.

npcs.defineNpc('coa_great_crystal_serpent', {
  name: 'The Great Crystal Serpent',
  combat: 500,
  maxHp: 900,
  maxHit: 60,
  stats: { attack: 280, strength: 260, defence: 300 },
  attackSpeed: 4,
  attackRange: 12,
  attackStyle: 'magic',
  size: 5,
  aggressive: true,
  aggroRange: 20,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'An ancient serpent of living crystal. It refracts light into lethal beams. The final guardian of the Chambers.',
  weakness: 'crush',
  tags: ['raid', 'chambers', 'serpent', 'boss', 'crystal'],
  raidRoom: 'great_crystal_serpent',
  phases: [
    {
      name: 'Phase 1: Emerald',
      hpRange: [1.0, 0.75],
      description: 'Serpent is green. Attacks with ranged crystal shards. Pray ranged. Spawns crystal fragments on the ground that explode after 3 ticks.',
      attackStyle: 'ranged',
      correctPrayer: 'protect_from_missiles',
      specialAttack: {
        name: 'Crystal Barrage',
        description: 'Fires 5 crystal shards at random tiles. Each shard explodes for 25 damage in 1x1 after 3 ticks.',
        shardCount: 5,
        shardDamage: 25,
        detonationDelay: 3,
        tickInterval: 10,
      },
    },
    {
      name: 'Phase 2: Sapphire',
      hpRange: [0.75, 0.50],
      description: 'Serpent turns blue. Attacks with magic. Pray magic. Periodically drains prayer (5 points per drain attack).',
      attackStyle: 'magic',
      correctPrayer: 'protect_from_magic',
      specialAttack: {
        name: 'Soul Siphon',
        description: 'Drains 5 prayer points from all players in range. Restores Serpent HP equal to total prayer drained.',
        prayerDrain: 5,
        healPerDrain: true,
        tickInterval: 12,
      },
    },
    {
      name: 'Phase 3: Ruby',
      hpRange: [0.50, 0.25],
      description: 'Serpent turns red. Melee only -- wraps around the arena. Pray melee. Tail swipe AoE every 8 ticks.',
      attackStyle: 'melee',
      correctPrayer: 'protect_from_melee',
      specialAttack: {
        name: 'Tail Swipe',
        description: 'Sweeps its tail across a 7-tile wide line. 45 damage. Must stand at the correct end.',
        aoeWidth: 7,
        damage: 45,
        tickInterval: 8,
      },
    },
    {
      name: 'Phase 4: Prismatic',
      hpRange: [0.25, 0.0],
      description: 'Serpent cycles through all colours every 4 ticks. Must prayer-switch rapidly. Spawns crystal mirrors that reflect damage. Kill the mirrors or your own attacks heal the boss.',
      cycleInterval: 4,
      attackStyles: ['ranged', 'magic', 'melee'],
      correctPrayers: ['protect_from_missiles', 'protect_from_magic', 'protect_from_melee'],
      mirrors: {
        name: 'Crystal Mirror',
        count: 2,
        hp: 60,
        reflectPercent: 1.0,
        description: 'Reflects all damage dealt to the Serpent back as healing. Destroy them first.',
      },
      enrageMultiplier: 1.5,
      specialAttack: {
        name: 'Prismatic Beam',
        description: 'Fires a beam that rotates around the arena. Standing in it deals 30 damage per tick. Must follow the safe zone.',
        damagePerTick: 30,
        rotationSpeed: 1,
        beamWidth: 2,
        tickInterval: 6,
      },
    },
  ],
});


// ==========================================================================
// THEATRE OF SHADOWS -- Boss Definitions
// ==========================================================================

// ---------- Boss 1: The Maiden of Shadows ----------
// Blood attack: targets a player, leaves blood pools on the ground.
// Adds spawn from blood pools. If pools are not frozen, adds overwhelm.
// P04: must manage ground (movement) while DPSing.
// P12: bring a freeze spell or ice arrows + food for blood damage.

npcs.defineNpc('tos_maiden', {
  name: 'The Maiden of Shadows',
  combat: 380,
  maxHp: 700,
  maxHit: 40,
  stats: { attack: 200, strength: 180, defence: 210 },
  attackSpeed: 5,
  attackRange: 8,
  attackStyle: 'magic',
  size: 4,
  aggressive: true,
  aggroRange: 15,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A maiden suspended in shadow. Blood seeps from her hands.',
  weakness: 'ranged',
  tags: ['raid', 'theatre', 'vampyre', 'undead', 'shadow'],
  resistance: 'melee',
  raidRoom: 'maiden',
  phases: [
    {
      name: 'Phase 1',
      hpRange: [1.0, 0.70],
      description: 'Maiden attacks with blood magic. Periodically targets a player with Blood Throw -- if it hits, a blood pool spawns underneath them.',
      specialAttack: {
        name: 'Blood Throw',
        description: 'Throws a blood projectile at a player. If not dodged, spawns a 3x3 blood pool that drains 6 HP/tick while standing on it and spawns a Nylocas Matomenos after 5 ticks.',
        poolSize: 3,
        poolDamagePerTick: 6,
        spawnDelay: 5,
        spawnDefId: 'tos_nylocas_matomenos',
        tickInterval: 10,
      },
    },
    {
      name: 'Phase 2',
      hpRange: [0.70, 0.30],
      description: 'Blood Spawns crawl toward the Maiden. If they reach her, she heals massively. Kill or freeze them.',
      spawnDefId: 'tos_blood_spawn',
      spawnInterval: 12,
      healOnContact: 50,
    },
    {
      name: 'Phase 3: Frenzy',
      hpRange: [0.30, 0.0],
      description: 'Maiden targets all players simultaneously with Blood Throw. Pools spawn under everyone. DPS race.',
      multiTarget: true,
      tickInterval: 8,
    },
  ],
});

npcs.defineNpc('tos_nylocas_matomenos', {
  name: 'Nylocas Matomenos',
  combat: 60,
  maxHp: 40,
  maxHit: 10,
  stats: { attack: 35, strength: 30, defence: 20 },
  attackSpeed: 3,
  attackRange: 1,
  attackStyle: 'melee',
  size: 1,
  aggressive: true,
  aggroRange: 10,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A blood-soaked Nylocas. It crawls toward the Maiden to heal her.',
  weakness: 'slash',
  tags: ['raid', 'theatre', 'nylocas'],
  raidRoom: 'maiden',
  raidMechanic: 'Walks toward the Maiden. If it reaches her, she heals 20 HP.',
});

npcs.defineNpc('tos_blood_spawn', {
  name: 'Blood Spawn',
  combat: 40,
  maxHp: 30,
  maxHit: 8,
  stats: { attack: 20, strength: 25, defence: 10 },
  attackSpeed: 4,
  attackRange: 1,
  attackStyle: 'melee',
  size: 1,
  aggressive: true,
  aggroRange: 20,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A globule of living blood. It seeks the Maiden.',
  weakness: 'magic',
  tags: ['raid', 'theatre', 'blood'],
  raidRoom: 'maiden',
  raidMechanic: 'Walks toward the Maiden. If it reaches her, she heals 50 HP. Can be frozen.',
  freezable: true,
});

// ---------- Boss 2: Pestilent Bloat ----------
// Walk around a sleeping boss. He wakes periodically and stomps.
// During stun windows (when he sleeps mid-walk) players DPS.
// P04: tests movement precision, not just gear.
// P13: HIGH danger -- one wrong step during active phase = 60+ damage.

npcs.defineNpc('tos_bloat', {
  name: 'Pestilent Bloat',
  combat: 420,
  maxHp: 800,
  maxHit: 60,
  stats: { attack: 240, strength: 220, defence: 170 },
  attackSpeed: 4,
  attackRange: 1,
  attackStyle: 'melee',
  size: 4,
  aggressive: true,
  aggroRange: 6,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A bloated, rotting giant that walks a circuit. Stay behind it.',
  weakness: 'slash',
  tags: ['raid', 'theatre', 'undead', 'armoured'],
  resistance: 'magic',
  raidRoom: 'bloat',
  phases: [
    {
      name: 'Walking',
      description: 'Bloat walks a rectangular circuit. His front deals 60 damage on contact. Stay behind or beside him. After 20-30 ticks of walking, he sleeps.',
      contactDamage: 60,
      circuitTicks: [20, 30],
      facingDamageArc: 180,
    },
    {
      name: 'Sleeping',
      description: 'Bloat falls down for 15 ticks. DPS window. After sleep, hands slam the ground for 40 AoE damage (5x5), then resumes walking.',
      sleepDuration: 15,
      wakeAttack: {
        name: 'Stomp',
        description: 'Slams the ground. 5x5 AoE for 40 damage. Move away before he wakes.',
        aoeSize: 5,
        damage: 40,
      },
    },
    {
      name: 'Enraged',
      hpThreshold: 0.30,
      description: 'Walks faster. Sleep duration reduced to 10 ticks. Flies occasionally drop from the ceiling dealing 15 damage in 1x1.',
      sleepDuration: 10,
      walkSpeedMultiplier: 1.5,
      flyDamage: 15,
      flyInterval: 6,
    },
  ],
});

// ---------- Boss 3: Nylocas Swarm ----------
// Waves of melee/range/mage spiders. MUST match attack style to their
// colour or they take 0 damage. Tests all three combat styles in one room.
// P04: the definition of non-degenerate -- you literally can't one-trick.
// P12: must bring melee, ranged, AND magic gear switches.

npcs.defineNpc('tos_nylocas_ischyros', {
  name: 'Nylocas Ischyros',
  combat: 70,
  maxHp: 30,
  maxHit: 14,
  stats: { attack: 55, strength: 50, defence: 40 },
  attackSpeed: 3,
  attackRange: 1,
  attackStyle: 'melee',
  size: 1,
  aggressive: true,
  aggroRange: 8,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A grey Nylocas. Must be killed with melee. Immune to ranged and magic.',
  weakness: 'melee',
  tags: ['raid', 'theatre', 'nylocas'],
  resistance: 'ranged',
  immunity: ['ranged', 'magic'],
  raidRoom: 'nylocas',
});

npcs.defineNpc('tos_nylocas_toxobolos', {
  name: 'Nylocas Toxobolos',
  combat: 70,
  maxHp: 30,
  maxHit: 14,
  stats: { attack: 55, strength: 50, defence: 40 },
  attackSpeed: 3,
  attackRange: 4,
  attackStyle: 'ranged',
  size: 1,
  aggressive: true,
  aggroRange: 8,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A green Nylocas. Must be killed with magic. Immune to melee and ranged.',
  weakness: 'magic',
  tags: ['raid', 'theatre', 'nylocas'],
  resistance: 'melee',
  immunity: ['melee', 'ranged'],
  raidRoom: 'nylocas',
});

npcs.defineNpc('tos_nylocas_hagios', {
  name: 'Nylocas Hagios',
  combat: 70,
  maxHp: 30,
  maxHit: 14,
  stats: { attack: 55, strength: 50, defence: 40 },
  attackSpeed: 3,
  attackRange: 4,
  attackStyle: 'magic',
  size: 1,
  aggressive: true,
  aggroRange: 8,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A blue Nylocas. Must be killed with ranged. Immune to melee and magic.',
  weakness: 'ranged',
  tags: ['raid', 'theatre', 'nylocas'],
  resistance: 'magic',
  immunity: ['melee', 'magic'],
  raidRoom: 'nylocas',
});

// Nylocas boss that spawns after all waves are cleared
npcs.defineNpc('tos_nylocas_vasilias', {
  name: 'Nylocas Vasilias',
  combat: 350,
  maxHp: 450,
  maxHit: 36,
  stats: { attack: 190, strength: 170, defence: 200 },
  attackSpeed: 4,
  attackRange: 6,
  attackStyle: 'melee',
  size: 3,
  aggressive: true,
  aggroRange: 12,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'The Nylocas Queen. Changes colour every 6 ticks -- match the attack style or deal 0 damage.',
  weakness: 'melee',
  tags: ['raid', 'theatre', 'nylocas', 'boss'],
  raidRoom: 'nylocas',
  phases: [
    {
      name: 'Colour Cycle',
      description: 'Cycles through grey (melee), green (magic), blue (ranged) every 6 ticks. Must match the correct style. Wrong style deals 0 damage.',
      cycleInterval: 6,
      styles: ['melee', 'magic', 'ranged'],
      immunityOnMismatch: true,
    },
  ],
});

// ---------- Boss 4: Sotetseg ----------
// Maze phase: one player is chosen and teleported to a shadow maze.
// They must navigate the maze in the shadow realm while the remaining
// players DPS Sotetseg. If the maze runner dies, the room fails.
// P04: tests individual navigation, not just group DPS.
// P13: HIGH attention for the maze runner -- one wrong tile kills.

npcs.defineNpc('tos_sotetseg', {
  name: 'Sotetseg',
  combat: 400,
  maxHp: 700,
  maxHit: 50,
  stats: { attack: 230, strength: 210, defence: 240 },
  attackSpeed: 5,
  attackRange: 10,
  attackStyle: 'magic',
  size: 4,
  aggressive: true,
  aggroRange: 15,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A creature between dimensions. It warps reality around it.',
  weakness: 'slash',
  tags: ['raid', 'theatre', 'demon', 'shadow'],
  raidRoom: 'sotetseg',
  phases: [
    {
      name: 'Phase 1',
      hpRange: [1.0, 0.66],
      description: 'Standard combat. Alternates magic and ranged attacks. Must prayer-switch every attack.',
      attackStyles: ['magic', 'ranged'],
      alternateEvery: 1,
      specialAttack: {
        name: 'Death Ball',
        description: 'Fires a large red orb at one player. If not split by stacking on the target, deals 121 damage. Split across all players in 1-tile radius.',
        baseDamage: 121,
        splitRadius: 1,
        tickInterval: 18,
      },
    },
    {
      name: 'Shadow Maze 1',
      hpThreshold: 0.66,
      description: 'One player is teleported to the shadow realm. They see a 10x10 maze and must walk the correct path. Wrong tiles deal 50 damage. Others DPS Sotetseg.',
      mazeSize: 10,
      wrongTileDamage: 50,
      timeLimit: 30,
    },
    {
      name: 'Phase 2',
      hpRange: [0.66, 0.33],
      description: 'Same as Phase 1 but attack speed increases. Death Ball frequency doubles.',
      attackSpeedOverride: 4,
      specialInterval: 12,
    },
    {
      name: 'Shadow Maze 2',
      hpThreshold: 0.33,
      description: 'Another maze, larger and with hazards. Maze size 14x14. Shadow hands reach from wrong tiles.',
      mazeSize: 14,
      wrongTileDamage: 70,
      timeLimit: 25,
    },
    {
      name: 'Phase 3: Final Stand',
      hpRange: [0.33, 0.0],
      description: 'No more mazes. Attack speed maxed. Death Ball every 8 ticks. Pure DPS race.',
      attackSpeedOverride: 3,
      specialInterval: 8,
    },
  ],
});

// ---------- Boss 5: Verzik Vitur, Queen of Shadows ----------
// The final boss. Three phases, each testing different skills.
// Phase 1: ranged only (she sits on her throne behind a shield).
// Phase 2: melee and magic hybrid. Summons Nylocas adds.
// Phase 3: massive AoE dodging, prayer switching, and DPS check.
// P08: drops THE best items in the game. Completing ToS = endgame.
// P13: the hardest single encounter. 20+ minute fight.

npcs.defineNpc('tos_verzik', {
  name: 'Verzik Vitur, Queen of Shadows',
  combat: 580,
  maxHp: 1200,
  maxHit: 78,
  stats: { attack: 320, strength: 300, defence: 350 },
  attackSpeed: 5,
  attackRange: 12,
  attackStyle: 'magic',
  size: 5,
  aggressive: true,
  aggroRange: 20,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'The vampyre queen. She has ruled the Theatre for a thousand years. This is her domain.',
  weakness: 'slash',
  tags: ['raid', 'theatre', 'vampyre', 'undead', 'boss', 'shadow'],
  raidRoom: 'verzik',
  phases: [
    {
      name: 'Phase 1: Throne',
      hpRange: [1.0, 0.80],
      description: 'Verzik sits on her throne behind a magical barrier. Only ranged attacks damage her. She hurls shadow bolts at the furthest player. Dawnbringer (given at entrance) is BIS for this phase.',
      attackStyle: 'magic',
      immunity: ['melee', 'magic'],
      specialWeapon: 'Dawnbringer',
      specialAttack: {
        name: 'Shadow Bolt',
        description: 'Targets the furthest player. 30-40 damage. Can be prayer-blocked (protect from magic).',
        damageRange: [30, 40],
        targeting: 'furthest',
        tickInterval: 5,
      },
    },
    {
      name: 'Phase 2: Melee',
      hpRange: [0.80, 0.40],
      description: 'Verzik leaves her throne. Attacks with melee and magic. Spawns Nylocas adds from the walls every 15 ticks. Periodically charges a player (can be sidestepped).',
      attackStyles: ['melee', 'magic'],
      alternateEvery: 2,
      spawnInterval: 15,
      spawnTypes: ['tos_nylocas_ischyros', 'tos_nylocas_toxobolos', 'tos_nylocas_hagios'],
      specialAttack: {
        name: 'Charge',
        description: 'Verzik targets a player and charges in a line. Deals 65 damage on contact. Sidestep to dodge.',
        damage: 65,
        dodgeable: true,
        tickInterval: 20,
      },
      electricalAttack: {
        name: 'Electric Discharge',
        description: 'Zaps all players within 3 tiles. 20 damage. Spread out.',
        range: 3,
        damage: 20,
        tickInterval: 12,
      },
    },
    {
      name: 'Phase 3: Desperation',
      hpRange: [0.40, 0.0],
      description: 'Verzik flies into the air and rains destruction. Green orbs (pray range), purple orbs (pray mage), and ground slams (pray melee) in rapid succession. Yellow pools spawn that heal her on contact. Web attack pins one player.',
      attackStyles: ['ranged', 'magic', 'melee'],
      cycleInterval: 3,
      specialAttacks: [
        {
          name: 'Web Pin',
          description: 'Pins one player in webs for 8 ticks. Other players must free them by attacking the webs (20 HP). Pinned player takes 10 damage/tick.',
          webHp: 20,
          pinDuration: 8,
          pinDamagePerTick: 10,
          tickInterval: 25,
        },
        {
          name: 'Yellow Pool',
          description: 'Spawns a glowing yellow pool. If any player stands on it, Verzik heals 100 HP. If nobody stands on it, it explodes for 50 damage to all.',
          healAmount: 100,
          explosionDamage: 50,
          tickInterval: 18,
        },
        {
          name: 'Tornado',
          description: 'Spawns 1 tornado per player that chases them. Contact deals 62 damage. Must kite while DPSing.',
          damageOnContact: 62,
          chaseSpeed: 2,
          duration: 15,
          tickInterval: 30,
        },
      ],
    },
  ],
});

// Dawnbringer -- special Theatre weapon for Verzik P1, obtained at entrance
items.define({
  id: 90111,
  name: 'Dawnbringer',
  examine: 'A staff of pure light. Effective against Verzik in her throne phase. Cannot leave the Theatre.',
  value: 0,
  category: 'weapon',
  equipSlot: 'weapon',
  speed: 4,
  tradeable: false,
  stats: { magic: 25, magic_strength: 20 },
  equipReqs: { magic: 70 },
  raidOnly: true,
  passiveEffect: {
    name: 'Dawn Strike',
    description: 'Hits Verzik through her barrier. Deals 20-35 damage per hit during P1. Useless outside the Theatre.',
    minDamage: 20,
    maxDamage: 35,
    targetOnly: 'tos_verzik',
  },
});


// ##############################################################################
//
//   SECTION 3 -- DROP TABLES
//
//   Chambers of Aelgard: points-based system.
//     - Every damage dealt, room completed, puzzle solved grants points.
//     - At the end of the raid, one unique roll per player based on points.
//     - Higher points = higher chance (but never guaranteed).
//     - Standard loot always drops (runes, herbs, seeds, supplies).
//
//   Theatre of Shadows: boss-specific tables.
//     - Each boss drops standard loot.
//     - Verzik drops unique table on kill.
//     - Completion chest at the end gives chance at uniques to all players.
//
// ##############################################################################

// ==========================================================================
// CHAMBERS OF AELGARD -- Drop Tables
// ==========================================================================

// Standard loot table (rolled per player on completion regardless of uniques)
droptables.define('coa_standard_loot', {
  always: [
    { id: 90200, name: 'Ancient tablet', min: 1, max: 1 },
  ],
  main: [
    // Runes
    { id: 11357, name: 'Death rune', weight: 8, min: 200, max: 600 },
    { id: 11358, name: 'Blood rune', weight: 6, min: 100, max: 400 },
    { id: 11363, name: 'Soul rune', weight: 4, min: 50, max: 200 },
    { id: 11364, name: 'Wrath rune', weight: 3, min: 30, max: 100 },
    // Herbs
    { id: 12013, name: 'Grimy torstol', weight: 5, min: 5, max: 15 },
    { id: 12009, name: 'Grimy snapdragon', weight: 6, min: 8, max: 20 },
    { id: 12005, name: 'Grimy ranarr', weight: 7, min: 10, max: 25 },
    // Ores and bars
    { id: 2116, name: 'Runite bar', weight: 3, min: 3, max: 8 },
    // Seeds
    { id: 12501, name: 'Ranarr seed', weight: 3, min: 1, max: 3 },
    { id: 12503, name: 'Snapdragon seed', weight: 2, min: 1, max: 2 },
    // Coins
    { id: 101, name: 'Coins', weight: 10, min: 20000, max: 80000 },
  ],
  tertiary: [
    { id: 90201, name: 'Dark relic', rate: 10, count: 1 },
  ],
});

// Unique table -- rolled based on points. One roll per player.
// Each unique has its own rate. More points = more rolls effectively.
// Base rate at 30,000 points. Rate improves linearly up to 65,000 pts.
droptables.define('coa_unique_loot', {
  always: [],
  main: [
    // Twisted bow and Ancestral already defined (ids 26012, 26009-26011)
    // so they appear here by reference only
    { id: 26012, name: 'Twisted bow', weight: 1, min: 1, max: 1 },
    { id: 90001, name: 'Dragon claws', weight: 2, min: 1, max: 1 },
    { id: 26009, name: 'Ancestral hat', weight: 2, min: 1, max: 1 },
    { id: 26010, name: 'Ancestral robe top', weight: 2, min: 1, max: 1 },
    { id: 26011, name: 'Ancestral robe bottom', weight: 2, min: 1, max: 1 },
    { id: 90002, name: 'Dexterous prayer scroll', weight: 3, min: 1, max: 1 },
    { id: 90003, name: 'Arcane prayer scroll', weight: 3, min: 1, max: 1 },
    { id: 90004, name: 'Dragon hunter crossbow', weight: 3, min: 1, max: 1 },
    { id: 90005, name: "Dinh's bulwark", weight: 3, min: 1, max: 1 },
    { id: 90006, name: 'Elder maul', weight: 3, min: 1, max: 1 },
    { id: 90007, name: 'Kodai wand', weight: 2, min: 1, max: 1 },
    { id: 0, name: 'Nothing', weight: 24, min: 0, max: 0 },
  ],
  tertiary: [],
});

// Individual room completion drop tables for raid points tracking
droptables.define('coa_vanguards', {
  always: [],
  main: [
    { id: 101, name: 'Coins', weight: 10, min: 5000, max: 15000 },
    { id: 11357, name: 'Death rune', weight: 5, min: 50, max: 150 },
    { id: 12304, name: 'Prayer potion(4)', weight: 4, min: 2, max: 4 },
    { id: 0, name: 'Nothing', weight: 3, min: 0, max: 0 },
  ],
});

droptables.define('coa_tekton', {
  always: [],
  main: [
    { id: 101, name: 'Coins', weight: 8, min: 5000, max: 20000 },
    { id: 2116, name: 'Runite bar', weight: 4, min: 2, max: 5 },
    { id: 12306, name: 'Super strength(4)', weight: 3, min: 2, max: 4 },
    { id: 0, name: 'Nothing', weight: 3, min: 0, max: 0 },
  ],
});

droptables.define('coa_vespula', {
  always: [],
  main: [
    { id: 101, name: 'Coins', weight: 8, min: 4000, max: 12000 },
    { id: 12308, name: 'Ranging potion(4)', weight: 4, min: 2, max: 4 },
    { id: 11105, name: 'Rune arrow', weight: 5, min: 50, max: 150 },
    { id: 0, name: 'Nothing', weight: 3, min: 0, max: 0 },
  ],
});

droptables.define('coa_sanctum', {
  always: [],
  main: [
    { id: 101, name: 'Coins', weight: 8, min: 3000, max: 10000 },
    { id: 12304, name: 'Prayer potion(4)', weight: 6, min: 3, max: 6 },
    { id: 11363, name: 'Soul rune', weight: 4, min: 20, max: 60 },
    { id: 0, name: 'Nothing', weight: 3, min: 0, max: 0 },
  ],
});

droptables.define('coa_ice_demon', {
  always: [],
  main: [
    { id: 101, name: 'Coins', weight: 8, min: 5000, max: 15000 },
    { id: 2206, name: 'Magic logs', weight: 4, min: 20, max: 60 },
    { id: 12307, name: 'Super defence(4)', weight: 3, min: 2, max: 4 },
    { id: 0, name: 'Nothing', weight: 3, min: 0, max: 0 },
  ],
});

droptables.define('coa_great_crystal_serpent', {
  always: [],
  main: [
    { id: 101, name: 'Coins', weight: 6, min: 10000, max: 40000 },
    { id: 10001, name: 'Crystal shard', weight: 5, min: 10, max: 30 },
    { id: 11364, name: 'Wrath rune', weight: 3, min: 20, max: 60 },
    { id: 10004, name: 'Refracted essence', weight: 2, min: 2, max: 5 },
    { id: 0, name: 'Nothing', weight: 2, min: 0, max: 0 },
  ],
});


// ==========================================================================
// THEATRE OF SHADOWS -- Drop Tables
// ==========================================================================

// Boss-specific loot (dropped per boss kill during the raid)
droptables.define('tos_maiden', {
  always: [],
  main: [
    { id: 101, name: 'Coins', weight: 10, min: 8000, max: 25000 },
    { id: 11358, name: 'Blood rune', weight: 6, min: 80, max: 250 },
    { id: 5001, name: 'Vial of blood', weight: 5, min: 5, max: 15 },
    { id: 12304, name: 'Prayer potion(4)', weight: 4, min: 2, max: 4 },
    { id: 0, name: 'Nothing', weight: 3, min: 0, max: 0 },
  ],
});

droptables.define('tos_bloat', {
  always: [],
  main: [
    { id: 101, name: 'Coins', weight: 8, min: 10000, max: 30000 },
    { id: 12305, name: 'Super attack(4)', weight: 3, min: 2, max: 4 },
    { id: 12306, name: 'Super strength(4)', weight: 3, min: 2, max: 4 },
    { id: 12313, name: 'Saradomin brew(4)', weight: 3, min: 2, max: 4 },
    { id: 0, name: 'Nothing', weight: 3, min: 0, max: 0 },
  ],
});

droptables.define('tos_nylocas_vasilias', {
  always: [],
  main: [
    { id: 101, name: 'Coins', weight: 8, min: 8000, max: 20000 },
    { id: 11357, name: 'Death rune', weight: 5, min: 100, max: 300 },
    { id: 11358, name: 'Blood rune', weight: 5, min: 80, max: 200 },
    { id: 12309, name: 'Magic potion(4)', weight: 3, min: 2, max: 4 },
    { id: 0, name: 'Nothing', weight: 3, min: 0, max: 0 },
  ],
});

droptables.define('tos_sotetseg', {
  always: [],
  main: [
    { id: 101, name: 'Coins', weight: 6, min: 15000, max: 40000 },
    { id: 11363, name: 'Soul rune', weight: 4, min: 50, max: 150 },
    { id: 11364, name: 'Wrath rune', weight: 3, min: 30, max: 80 },
    { id: 12304, name: 'Prayer potion(4)', weight: 4, min: 3, max: 6 },
    { id: 12314, name: 'Super restore(4)', weight: 3, min: 2, max: 4 },
    { id: 0, name: 'Nothing', weight: 2, min: 0, max: 0 },
  ],
});

// Verzik completion loot (standard)
droptables.define('tos_verzik_standard', {
  always: [
    { id: 90109, name: 'Vial of vyre blood', min: 10, max: 30 },
  ],
  main: [
    { id: 101, name: 'Coins', weight: 8, min: 30000, max: 100000 },
    { id: 11358, name: 'Blood rune', weight: 5, min: 200, max: 600 },
    { id: 11363, name: 'Soul rune', weight: 4, min: 100, max: 300 },
    { id: 11364, name: 'Wrath rune', weight: 3, min: 50, max: 150 },
    { id: 12013, name: 'Grimy torstol', weight: 3, min: 5, max: 15 },
    { id: 12009, name: 'Grimy snapdragon', weight: 4, min: 8, max: 20 },
    { id: 90108, name: "Verzik's crystal shard", weight: 5, min: 3, max: 10 },
  ],
});

// Verzik unique table (completion chest, one roll per player)
droptables.define('tos_unique_loot', {
  always: [],
  main: [
    // Scythe already defined (id: 26013)
    { id: 26013, name: 'Scythe of vitur', weight: 1, min: 1, max: 1 },
    { id: 90101, name: 'Ghrazi rapier', weight: 2, min: 1, max: 1 },
    { id: 90110, name: 'Avernic defender hilt', weight: 3, min: 1, max: 1 },
    { id: 90103, name: 'Sanguinesti staff', weight: 2, min: 1, max: 1 },
    { id: 90104, name: 'Justiciar faceguard', weight: 3, min: 1, max: 1 },
    { id: 90105, name: 'Justiciar chestguard', weight: 3, min: 1, max: 1 },
    { id: 90106, name: 'Justiciar legguards', weight: 3, min: 1, max: 1 },
    { id: 0, name: 'Nothing', weight: 32, min: 0, max: 0 },
  ],
  tertiary: [
    { id: 90107, name: "Lil' Zik", rate: 650, count: 1 },
  ],
});


// ##############################################################################
//
//   SECTION 4 -- RAID DEFINITIONS
//
//   The structural data for each raid: rooms, scaling, loot system,
//   requirements, and registration with the content registry.
//
// ##############################################################################

// ==========================================================================
// CHAMBERS OF AELGARD -- Raid Definition
// ==========================================================================

const CHAMBERS_OF_AELGARD = {
  id: 'chambers_of_aelgard',
  name: 'Chambers of Aelgard',
  shortName: 'CoA',
  description: 'Deep beneath the Glass Desert ruins lie the Chambers -- an ancient proving ground sealed since the fall of the Crystal Empire. Six rooms of escalating terror. Randomized. Merciless.',
  location: 'Glass Desert ruins, north of the Prismatic Oasis',
  region: 'glass_desert',

  // Scaling
  minPlayers: 3,
  maxPlayers: 5,
  scaling: {
    description: 'Boss HP scales linearly with party size. 3-player base, +25% HP per additional player.',
    baseMultiplier: 1.0,
    perPlayerMultiplier: 0.25,
  },

  // Estimated completion time
  estimatedTime: { min: 30, max: 55, unit: 'minutes' },

  // Requirements
  requirements: {
    combat: 90,
    skills: {
      smithing: 55,
      woodcutting: 55,
      firemaking: 50,
    },
    quests: [],
    items: ['Hammer', 'Axe', 'Tinderbox'],
  },

  // Room system -- randomized order each run (except final boss is always last)
  rooms: [
    {
      id: 'vanguards',
      name: 'The Vanguards',
      type: 'combat',
      description: 'Three champions of the old empire. They share a soul link -- if one is slain and the others survive, they resurrect. Kill them together.',
      bosses: ['coa_vanguard_melee', 'coa_vanguard_ranged', 'coa_vanguard_mage'],
      mechanic: 'simultaneousKill',
      simultaneousWindow: 10,
      failCondition: 'If any Vanguard is not within 10 ticks of the others dying, it heals 33%.',
      pointsOnClear: 5000,
      recommendedStyles: ['melee', 'ranged', 'magic'],
      arenaSize: { width: 30, height: 30 },
    },
    {
      id: 'tekton',
      name: 'Tekton, the Forge Guardian',
      type: 'combat_skilling',
      description: 'A golem of living stone guards an ancient forge. You must smith the Chamber Key on the anvil while fending off the guardian. He heals when he reaches his anvil.',
      bosses: ['coa_tekton'],
      mechanic: 'anvilPhase',
      skillingReq: { smithing: 55 },
      requiredItem: 'Hammer',
      pointsOnClear: 6000,
      recommendedStyles: ['crush'],
      arenaSize: { width: 25, height: 25 },
    },
    {
      id: 'vespula',
      name: 'Vespula, the Brood Mother',
      type: 'combat_protect',
      description: 'The brood mother hovers above while her soldiers assault the Chamber Grub. If the grub dies, the portal collapses. Protect the grub and kill the queen.',
      bosses: ['coa_vespula'],
      adds: ['coa_vespine_soldier'],
      protectTarget: 'coa_chamber_grub',
      mechanic: 'protectNpc',
      failCondition: 'Chamber Grub reaches 0 HP.',
      pointsOnClear: 5500,
      recommendedStyles: ['ranged', 'magic'],
      arenaSize: { width: 25, height: 30 },
    },
    {
      id: 'mystic_sanctum',
      name: 'The Mystic Sanctum',
      type: 'puzzle_combat',
      description: 'A spirit of the old sanctum demands proof of your piety. Activate the correct prayers in the correct sequence. Wrong answers are punished with divine wrath.',
      bosses: ['coa_sanctum_guardian'],
      mechanic: 'prayerPuzzle',
      puzzleConfig: {
        sequenceLength: 5,
        ticksPerPrayer: 6,
        failDamage: 40,
        prayers: ['protect_from_melee', 'protect_from_missiles', 'protect_from_magic', 'smite', 'redemption'],
      },
      pointsOnClear: 4500,
      recommendedStyles: ['ranged'],
      arenaSize: { width: 20, height: 20 },
    },
    {
      id: 'ice_demon',
      name: 'The Ice Demon',
      type: 'skilling_combat',
      description: 'An ancient demon sealed in ice. It can only be harmed while thawed. Chop the frozen trees around the room, light the braziers, and push them close to the demon.',
      bosses: ['coa_ice_demon'],
      mechanic: 'thawCycle',
      skillingReqs: { woodcutting: 55, firemaking: 50 },
      requiredItems: ['Axe', 'Tinderbox'],
      brazierCount: 4,
      logsPerBrazier: 3,
      thawDuration: 30,
      pointsOnClear: 5500,
      recommendedStyles: ['slash', 'melee'],
      arenaSize: { width: 28, height: 28 },
    },
    {
      id: 'great_crystal_serpent',
      name: 'The Great Crystal Serpent',
      type: 'boss',
      description: 'The final guardian. A serpent of living crystal with four phases, each more lethal than the last. Prayer switching, AoE dodging, and mirror destruction. The ultimate test.',
      bosses: ['coa_great_crystal_serpent'],
      mechanic: 'phasedBoss',
      alwaysLast: true,
      pointsOnClear: 10000,
      recommendedStyles: ['melee', 'ranged', 'magic'],
      arenaSize: { width: 35, height: 35 },
    },
  ],

  // Room randomization rules
  roomOrder: {
    description: 'Rooms 1-5 are shuffled randomly each raid. Room 6 (Great Crystal Serpent) is always last.',
    randomRooms: ['vanguards', 'tekton', 'vespula', 'mystic_sanctum', 'ice_demon'],
    fixedLast: 'great_crystal_serpent',
  },

  // Points system
  pointsSystem: {
    description: 'Points accumulate throughout the raid. Higher points = better chance at unique loot. Points are tracked per player.',
    sources: {
      damageDealt: { pointsPer: 1, description: '1 point per damage dealt to raid bosses/adds' },
      roomClear: { description: 'Flat bonus per room cleared (see room definitions)' },
      personalDamageTaken: { pointsPer: -0.5, description: 'Lose 0.5 points per damage taken (penalises sloppy play)' },
      skillingAction: { pointsPer: 10, description: '10 points per successful skilling action in Tekton/Ice Demon rooms' },
      puzzleCorrect: { pointsPer: 500, description: '500 points per correct prayer in Mystic Sanctum' },
      deathPenalty: { pointsPer: -4000, description: 'Lose 4000 points on death (can be negative)' },
    },
    uniqueRollThreshold: 6500,
    uniqueRollFormula: 'chance = min(1, points / 65000)',
    maxUniqueChance: 0.65,
    lootTable: 'coa_unique_loot',
    standardTable: 'coa_standard_loot',
  },

  // Recommended gear per room
  recommendedGear: {
    vanguards: {
      melee: ['Abyssal whip', 'Dragon scimitar', 'Barrows armour'],
      ranged: ['Rune crossbow', 'Armadyl crossbow', "Green dragonhide body"],
      magic: ['Mystic staff', 'Kodai wand', 'Mystic robe top'],
    },
    tekton: {
      primary: ['Elder maul', 'Dragon warhammer', 'Bandos godsword'],
      secondary: ['Hammer (for smithing phase)'],
    },
    vespula: {
      primary: ['Rune crossbow', 'Twisted bow'],
      secondary: ['Melee for add control'],
    },
    mystic_sanctum: {
      primary: ['Ranged gear (guardian is weak to ranged)'],
      utility: ['High prayer bonus gear', 'Prayer potions'],
    },
    ice_demon: {
      primary: ['Melee (slash)', 'Abyssal whip'],
      utility: ['Axe (Woodcutting)', 'Tinderbox (Firemaking)'],
    },
    great_crystal_serpent: {
      primary: ['All three combat styles', 'Max gear switches'],
      utility: ['Saradomin brews', 'Super restores', 'High prayer bonus'],
    },
  },
};


// ==========================================================================
// THEATRE OF SHADOWS -- Raid Definition
// ==========================================================================

const THEATRE_OF_SHADOWS = {
  id: 'theatre_of_shadows',
  name: 'Theatre of Shadows',
  shortName: 'ToS',
  description: 'Beneath Castle Malachar in Moryskah lies the Theatre -- Verzik Vitur\'s arena of horrors. Five bosses in fixed order. No randomisation. No mercy. The finest warriors enter. Most do not leave.',
  location: 'Castle Malachar basement, Moryskah',
  region: 'moryskah',

  // Scaling
  minPlayers: 4,
  maxPlayers: 5,
  scaling: {
    description: 'Boss HP scales with party size. 4-player base, +20% HP for the 5th player.',
    baseMultiplier: 1.0,
    perPlayerMultiplier: 0.20,
  },

  // Estimated completion time
  estimatedTime: { min: 35, max: 60, unit: 'minutes' },

  // Requirements
  requirements: {
    combat: 95,
    skills: {},
    quests: ['The Vampyre Bloodline'],
    items: [],
    recommended: {
      combat: 110,
      skills: { prayer: 77 },
      description: 'Rigour and Augury prayers strongly recommended. 90+ in all combat stats.',
    },
  },

  // Linear boss progression
  bosses: [
    {
      id: 'maiden',
      name: 'The Maiden of Shadows',
      order: 1,
      type: 'boss',
      description: 'A maiden of blood magic. Her attacks leave pools that spawn adds. Control the blood, control the fight.',
      bossDefId: 'tos_maiden',
      adds: ['tos_nylocas_matomenos', 'tos_blood_spawn'],
      mechanic: 'bloodPoolManagement',
      failCondition: 'Full team wipe.',
      recommendedStyles: ['ranged'],
      arenaSize: { width: 30, height: 30 },
    },
    {
      id: 'bloat',
      name: 'Pestilent Bloat',
      order: 2,
      type: 'boss',
      description: 'A rotting giant that walks a circuit. DPS during sleep windows. One wrong step in his path and you take 60.',
      bossDefId: 'tos_bloat',
      mechanic: 'circuitWalk',
      failCondition: 'Full team wipe.',
      recommendedStyles: ['melee'],
      arenaSize: { width: 25, height: 25 },
    },
    {
      id: 'nylocas',
      name: 'The Nylocas Swarm',
      order: 3,
      type: 'wave_boss',
      description: 'Waves of colour-coded spiders pour from the walls. Grey = melee, green = magic, blue = ranged. Match the style or deal 0. After all waves: the Nylocas Queen.',
      waves: {
        count: 20,
        perWave: { min: 3, max: 8 },
        spawnTypes: ['tos_nylocas_ischyros', 'tos_nylocas_toxobolos', 'tos_nylocas_hagios'],
        ticksBetweenWaves: 6,
      },
      bossDefId: 'tos_nylocas_vasilias',
      mechanic: 'styleMatching',
      failCondition: 'Full team wipe or 12+ Nylocas alive at once.',
      recommendedStyles: ['melee', 'ranged', 'magic'],
      arenaSize: { width: 28, height: 28 },
    },
    {
      id: 'sotetseg',
      name: 'Sotetseg',
      order: 4,
      type: 'boss',
      description: 'A creature between dimensions. Prayer-switch its attacks. Survive the Death Ball. And when the shadow realm calls, one of you must navigate the maze alone.',
      bossDefId: 'tos_sotetseg',
      mechanic: 'shadowMaze',
      mazeConfig: {
        playerCount: 1,
        mazeSize: [10, 14],
        wrongTileDamage: [50, 70],
        timeLimit: [30, 25],
      },
      failCondition: 'Full team wipe or maze runner dies.',
      recommendedStyles: ['melee', 'ranged'],
      arenaSize: { width: 28, height: 28 },
    },
    {
      id: 'verzik',
      name: 'Verzik Vitur, Queen of Shadows',
      order: 5,
      type: 'boss',
      description: 'The vampyre queen. Three phases of escalating chaos. Phase 1: ranged through the barrier with the Dawnbringer. Phase 2: melee and add management. Phase 3: everything at once.',
      bossDefId: 'tos_verzik',
      specialItem: { id: 90111, name: 'Dawnbringer', givenAtStart: true },
      mechanic: 'phasedBoss',
      failCondition: 'Full team wipe.',
      recommendedStyles: ['ranged', 'melee', 'magic'],
      arenaSize: { width: 35, height: 35 },
    },
  ],

  // Boss order is fixed
  bossOrder: {
    description: 'All five bosses are fought in fixed order. No skipping. No shortcuts.',
    fixed: true,
  },

  // Loot system
  lootSystem: {
    description: 'Each boss drops standard loot. After Verzik is killed, a completion chest spawns. Each player gets one roll on the standard Verzik table and one roll on the unique table.',
    bossLootTables: {
      maiden: 'tos_maiden',
      bloat: 'tos_bloat',
      nylocas: 'tos_nylocas_vasilias',
      sotetseg: 'tos_sotetseg',
    },
    completionTables: {
      standard: 'tos_verzik_standard',
      unique: 'tos_unique_loot',
    },
    uniqueRate: {
      description: 'Base 1/9.1 chance per player per completion (11%). Each death during the raid reduces chance by 2%.',
      baseChance: 0.11,
      deathPenalty: 0.02,
      minChance: 0.01,
    },
  },

  // Recommended gear
  recommendedGear: {
    maiden: {
      primary: ['Twisted bow', 'Armadyl crossbow', 'Rune crossbow'],
      secondary: ['Ice spells for blood spawns'],
    },
    bloat: {
      primary: ['Abyssal whip', 'Scythe of vitur', 'Ghrazi rapier'],
    },
    nylocas: {
      melee: ['Abyssal whip', 'Dragon scimitar'],
      ranged: ['Rune crossbow', 'Magic shortbow'],
      magic: ['Mystic staff', 'Sanguinesti staff'],
    },
    sotetseg: {
      primary: ['Melee (slash)', 'Ghrazi rapier'],
      utility: ['High prayer bonus', 'Stamina potion'],
    },
    verzik: {
      phase1: ['Dawnbringer (given)', 'Ranged weapons'],
      phase2: ['Melee weapons', 'Scythe of vitur'],
      phase3: ['All styles', 'Saradomin brews', 'Super restores'],
    },
  },
};


// ##############################################################################
//
//   SECTION 5 -- CONTENT REGISTRY REGISTRATION
//
//   Register both raids as playable content for the RL training system
//   and the builder. Includes action spaces and loadout configs.
//
// ##############################################################################

// ==========================================================================
// Register Chambers of Aelgard
// ==========================================================================

registry.registerPlayable('chambers_of_aelgard', {
  name: 'Chambers of Aelgard',
  description: 'Endgame 3-5 player raid in the Glass Desert ruins. 6 rooms, randomized order. Points-based loot.',
  source: 'aelgard',
  type: 'raid',
  challenges: {
    full: { description: 'Full Chambers completion' },
    vanguards: { description: 'Vanguards room only' },
    tekton: { description: 'Tekton room only' },
    vespula: { description: 'Vespula room only' },
    sanctum: { description: 'Mystic Sanctum room only' },
    ice_demon: { description: 'Ice Demon room only' },
    serpent: { description: 'Great Crystal Serpent only' },
  },
  mobDefs: [
    'coa_vanguard_melee', 'coa_vanguard_ranged', 'coa_vanguard_mage',
    'coa_tekton', 'coa_vespula', 'coa_vespine_soldier', 'coa_chamber_grub',
    'coa_sanctum_guardian', 'coa_ice_demon', 'coa_great_crystal_serpent',
  ],
  phases: CHAMBERS_OF_AELGARD.rooms.map(r => r.id),
  loadout: {
    level: 99,
    hpLevel: 99,
    equipment: ['Abyssal whip', 'Rune crossbow', 'Mystic staff', 'Bandos chestplate', 'Bandos tassets'],
    inventory: [
      { name: 'Saradomin brew(4)', count: 8 },
      { name: 'Super restore(4)', count: 12 },
      { name: 'Ranging potion(4)', count: 1 },
      { name: 'Super combat potion(4)', count: 1 },
      { name: 'Hammer', count: 1 },
      { name: 'Axe', count: 1 },
      { name: 'Tinderbox', count: 1 },
    ],
    prayers: ['protect_from_melee', 'protect_from_missiles', 'protect_from_magic', 'piety', 'rigour', 'augury'],
  },
  actionSpace: registry.buildActionSpace([
    'noop', 'brew', 'restore',
    'move_n', 'move_s', 'move_e', 'move_w',
    'move_ne', 'move_nw', 'move_se', 'move_sw',
    'target_boss', 'target_adds', 'target_grub',
    'pray_mage', 'pray_range', 'pray_melee', 'pray_off',
    'equip_melee', 'equip_ranged', 'equip_magic',
    'smith_key', 'chop_tree', 'light_brazier',
    'attack_mirror',
  ]),
  raidConfig: CHAMBERS_OF_AELGARD,
});

// ==========================================================================
// Register Theatre of Shadows
// ==========================================================================

registry.registerPlayable('theatre_of_shadows', {
  name: 'Theatre of Shadows',
  description: 'Endgame 4-5 player linear raid beneath Castle Malachar. 5 bosses, fixed order. The hardest content in the game.',
  source: 'aelgard',
  type: 'raid',
  challenges: {
    full: { description: 'Full Theatre completion' },
    maiden: { description: 'Maiden of Shadows only' },
    bloat: { description: 'Pestilent Bloat only' },
    nylocas: { description: 'Nylocas Swarm only' },
    sotetseg: { description: 'Sotetseg only' },
    verzik: { description: 'Verzik Vitur only' },
  },
  mobDefs: [
    'tos_maiden', 'tos_nylocas_matomenos', 'tos_blood_spawn',
    'tos_bloat',
    'tos_nylocas_ischyros', 'tos_nylocas_toxobolos', 'tos_nylocas_hagios', 'tos_nylocas_vasilias',
    'tos_sotetseg',
    'tos_verzik',
  ],
  phases: THEATRE_OF_SHADOWS.bosses.map(b => b.id),
  loadout: {
    level: 99,
    hpLevel: 99,
    equipment: ['Scythe of vitur', 'Ghrazi rapier', 'Armadyl crossbow', 'Sanguinesti staff', 'Bandos chestplate', 'Bandos tassets'],
    inventory: [
      { name: 'Saradomin brew(4)', count: 6 },
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
    'target_boss', 'target_adds',
    'pray_mage', 'pray_range', 'pray_melee', 'pray_off',
    'equip_melee', 'equip_ranged', 'equip_magic',
    'freeze_target', 'stack_on_player',
    'dodge_left', 'dodge_right',
    'attack_web', 'maze_move_n', 'maze_move_s', 'maze_move_e', 'maze_move_w',
  ]),
  raidConfig: THEATRE_OF_SHADOWS,
});


// ##############################################################################
//
//   SECTION 6 -- SUMMARY & EXPORT
//
// ##############################################################################

// Item count summary
const coaItems = [90001, 90002, 90003, 90004, 90005, 90006, 90007, 90200, 90201];
const tosItems = [90101, 90102, 90103, 90104, 90105, 90106, 90107, 90108, 90109, 90110, 90111];
const existingRefs = [26009, 26010, 26011, 26012, 26013];

// Boss count summary
const coaBosses = [
  'coa_vanguard_melee', 'coa_vanguard_ranged', 'coa_vanguard_mage',
  'coa_tekton', 'coa_vespula', 'coa_vespine_soldier', 'coa_chamber_grub',
  'coa_sanctum_guardian', 'coa_ice_demon', 'coa_great_crystal_serpent',
];
const tosBosses = [
  'tos_maiden', 'tos_nylocas_matomenos', 'tos_blood_spawn',
  'tos_bloat',
  'tos_nylocas_ischyros', 'tos_nylocas_toxobolos', 'tos_nylocas_hagios', 'tos_nylocas_vasilias',
  'tos_sotetseg', 'tos_verzik',
];

// Drop table count
const coaTables = [
  'coa_standard_loot', 'coa_unique_loot',
  'coa_vanguards', 'coa_tekton', 'coa_vespula', 'coa_sanctum', 'coa_ice_demon', 'coa_great_crystal_serpent',
];
const tosTables = [
  'tos_maiden', 'tos_bloat', 'tos_nylocas_vasilias', 'tos_sotetseg',
  'tos_verzik_standard', 'tos_unique_loot',
];

console.log('');
console.log('='.repeat(70));
console.log('  AELGARD RAIDS LOADED');
console.log('='.repeat(70));
console.log('');
console.log('  CHAMBERS OF AELGARD (CoA)');
console.log(`    Location:    Glass Desert ruins`);
console.log(`    Players:     ${CHAMBERS_OF_AELGARD.minPlayers}-${CHAMBERS_OF_AELGARD.maxPlayers}`);
console.log(`    Rooms:       ${CHAMBERS_OF_AELGARD.rooms.length} (${CHAMBERS_OF_AELGARD.rooms.length - 1} randomized + 1 final boss)`);
console.log(`    NPCs:        ${coaBosses.length} (bosses + adds + grub)`);
console.log(`    New items:   ${coaItems.length}`);
console.log(`    Drop tables: ${coaTables.length}`);
console.log(`    Uniques:     Twisted bow, Dragon claws, Ancestral (3pc), Dex scroll,`);
console.log(`                 Arcane scroll, DHCB, Dinh's bulwark, Elder maul, Kodai wand`);
console.log('');
console.log('  THEATRE OF SHADOWS (ToS)');
console.log(`    Location:    Castle Malachar, Moryskah`);
console.log(`    Players:     ${THEATRE_OF_SHADOWS.minPlayers}-${THEATRE_OF_SHADOWS.maxPlayers}`);
console.log(`    Bosses:      ${THEATRE_OF_SHADOWS.bosses.length} (fixed linear order)`);
console.log(`    NPCs:        ${tosBosses.length} (bosses + adds)`);
console.log(`    New items:   ${tosItems.length}`);
console.log(`    Drop tables: ${tosTables.length}`);
console.log(`    Uniques:     Scythe of vitur, Ghrazi rapier, Avernic defender,`);
console.log(`                 Sanguinesti staff, Justiciar (3pc), Lil' Zik pet`);
console.log('');
console.log(`  TOTALS: ${coaItems.length + tosItems.length} new items, ${coaBosses.length + tosBosses.length} NPCs, ${coaTables.length + tosTables.length} drop tables`);
console.log(`          + ${existingRefs.length} existing items referenced (Twisted bow, Scythe, Ancestral)`);
console.log('='.repeat(70));
console.log('');

module.exports = {
  CHAMBERS_OF_AELGARD,
  THEATRE_OF_SHADOWS,
};
