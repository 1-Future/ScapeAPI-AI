// ==============================================================================
// Aelgard -- Raids Mega Pack 1
//
// 15 complete raids across all 8 regions of Aelgard.
// Each raid is a multi-room encounter with unique bosses, mechanics, and rewards.
//
// Manifesto:
//   P04 Non-degenerate   -- each raid demands mastery of different mechanics
//   P08 Breakpoint        -- BIS niche rewards change how you play
//   P12 Encounter itemiz. -- different raids need different gear setups
//   P13 Design knobs      -- difficulty, player count, and mechanics as tuning knobs
//
// Item IDs: 95000-95299  (unique items, pets, supplies)
// NPC  def IDs: all unique, prefixed by raid name
//
// RAID INDEX:
//   01. The King's Crypt          (Heartlands, solo/duo)
//   02. The Siege of Heartlands   (Heartlands, 5-20 players)
//   03. The Pharaoh's Sanctum     (Boneyard Wastes, 3-5 players)
//   04. Leviathan's Spine         (Boneyard Wastes, 4-8 players)
//   05. The Blood Sanctum         (Moryskah, 3-5 players)
//   06. Catacombs of the Damned   (Moryskah, solo/duo)
//   07. Theatre of Blood: HM      (Moryskah, 4-5 players)
//   08. The Gauntlet              (Veilwood, solo)
//   09. Root of the World Tree    (Veilwood, 3-8 players)
//   10. The Crucible              (Sootworks, 3-5 players)
//   11. The Deep Engine           (Sootworks, 4-8 players)
//   12. The Sunken Temple         (Saltbrine Reach, 3-5 players)
//   13. Tempest of Saltbrine      (Saltbrine Reach, 8-20 players)
//   14. The Lucid Nightmare       (Inkweald, solo)
//   15. The Consciousness Rift    (Inkweald, 4-8 players)
// ==============================================================================

const items = require('../../data/items');
const npcs = require('../../world/npcs');
const droptables = require('../../data/droptables');

// -- Helper: define boss NPC + drop table + pet in one call --
// v0.9-waveB4 H14: default boss-pet rate cut 2x (3000 → 1500). Explicit petChance
// still respected. See reports/coll-log-audit.md §5.
function boss(defId, def, drops, petId, petName, petExamine, petChance) {
  npcs.defineNpc(defId, def);
  if (drops) droptables.define(defId, drops);
  if (petId) {
    items.define({ id: petId, name: petName, examine: petExamine, value: 0, category: 'pet', tradeable: false, weight: 0 });
    if (drops && !drops.tertiary) drops.tertiary = [];
    if (drops) drops.tertiary.push({ id: petId, name: petName, chance: petChance || 1500, min: 1, max: 1 });
  }
}


// ##############################################################################
//
//   RAID 01 -- THE KING'S CRYPT
//   Region: Heartlands | Players: 1-2 | Difficulty: Mid
//
//   Beneath the castle of the Heartlands lies the crypt of the kingdom's
//   last true king. His ghost and his honour guard remain, bound by an
//   oath that outlasted death. The king's combat style shifts between
//   phases -- players must match it or suffer 5x damage.
//
//   3 rooms: Ghostly Knights -> Trapped Hallway -> The Last King
//
// ##############################################################################

// ==========================================================================
// RAID 01 ITEMS
// ==========================================================================

// -- Crown of the Last King --
// BIS prayer helmet. Highest prayer bonus of any helm in the game,
// plus moderate melee defence. The trade-off: zero offensive stats.
// Niche: prayer-heavy encounters (Inferno, long Slayer tasks, GWD).
items.define({
  id: 95000,
  name: 'Crown of the Last King',
  examine: 'A spectral crown that hums with ancient prayer. The last king\'s devotion made manifest.',
  value: 12000000,
  category: 'armour',
  equipSlot: 'head',
  tradeable: true,
  weight: 1.5,
  stats: {
    prayer: 12,
    def_stab: 30, def_slash: 34, def_crush: 28,
    def_magic: 8, def_ranged: 30,
    stab: 0, slash: 0, crush: 0,
    ranged: 0, magic: 0,
  },
  equipReqs: { defence: 70, prayer: 70 },
});

// -- Spectral Blade --
// Sword that deals full damage to ghost-type enemies (normally halved).
// Also +20% accuracy vs undead. Moderate melee stats otherwise.
// Niche: Moryskah content, barrows, revenants, any undead Slayer task.
items.define({
  id: 95001,
  name: 'Spectral blade',
  examine: 'A blade forged in the boundary between life and death. Ghosts cannot phase through its edge.',
  value: 8000000,
  category: 'weapon',
  equipSlot: 'weapon',
  tradeable: true,
  weight: 2.0,
  speed: 4,
  stats: { slash: 82, stab: 68, melee_strength: 76 },
  equipReqs: { attack: 70 },
  passiveEffect: {
    name: 'Ghostbane',
    description: 'Deals full damage to ghost-type enemies (ignores ghost damage reduction). +20% accuracy against undead.',
    ignoreGhostReduction: true,
    targetTags: ['undead', 'ghost'],
    accuracyBonus: 0.20,
  },
});

// -- Kingsguard signet --
// Ring with +3 prayer and +5 def to all styles. No offensive stats.
// Niche: tank ring for prayer-heavy content.
items.define({
  id: 95002,
  name: 'Kingsguard signet',
  examine: 'A ring bearing the seal of the Heartlands kingsguard. Its enchantment bolsters faith and armour.',
  value: 3000000,
  category: 'jewellery',
  equipSlot: 'ring',
  tradeable: true,
  weight: 0.1,
  stats: {
    prayer: 3,
    def_stab: 5, def_slash: 5, def_crush: 5,
    def_magic: 5, def_ranged: 5,
  },
  equipReqs: { prayer: 55 },
});

// -- Pet: Mini Last King --
items.define({
  id: 95003,
  name: 'Mini Last King',
  examine: 'A tiny spectral monarch. Still tries to knight people.',
  value: 0,
  category: 'pet',
  tradeable: false,
  weight: 0,
});


// ==========================================================================
// RAID 01 NPCs
// ==========================================================================

// Room 1: Ghostly Knights (x3 spawned per wave)
npcs.defineNpc('crypt_ghostly_knight', {
  name: 'Ghostly Knight',
  combat: 145,
  maxHp: 120,
  maxHit: 18,
  stats: { attack: 130, strength: 125, defence: 140 },
  attackSpeed: 5,
  attackRange: 1,
  attackStyle: 'melee',
  size: 1,
  aggressive: true,
  aggroRange: 8,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A spectral knight bound to the crypt by oath. Its armour shimmers with ghostly light.',
  weakness: 'magic',
  tags: ['raid', 'crypt', 'undead', 'ghost', 'knight'],
  resistance: 'melee',
});

droptables.define('crypt_ghostly_knight', {
  always: [],
  main: [
    { id: 101, name: 'Coins', weight: 10, min: 500, max: 2000 },
    { id: 0, name: 'Nothing', weight: 5, min: 0, max: 0 },
  ],
});

// Room 2: Trapped Hallway -- pressure plate trap NPC (damages if stepped on)
npcs.defineNpc('crypt_trap_sentinel', {
  name: 'Crypt Sentinel',
  combat: 180,
  maxHp: 150,
  maxHit: 22,
  stats: { attack: 160, strength: 150, defence: 130 },
  attackSpeed: 4,
  attackRange: 4,
  attackStyle: 'ranged',
  size: 2,
  aggressive: true,
  aggroRange: 10,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A stone sentinel animated by the crypt\'s magic. It hurls spectral bolts at intruders.',
  weakness: 'crush',
  tags: ['raid', 'crypt', 'undead', 'construct'],
  resistance: 'ranged',
});

droptables.define('crypt_trap_sentinel', {
  always: [],
  main: [
    { id: 101, name: 'Coins', weight: 8, min: 1000, max: 3000 },
    { id: 0, name: 'Nothing', weight: 7, min: 0, max: 0 },
  ],
});

// Room 3 / Final Boss: The Last King
boss('crypt_last_king', {
  name: 'The Last King',
  combat: 380,
  maxHp: 450,
  maxHit: 38,
  stats: { attack: 280, strength: 260, defence: 250 },
  attackSpeed: 4,
  attackRange: 1,
  attackStyle: 'melee',
  size: 3,
  aggressive: true,
  aggroRange: 12,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'The ghost of the last true king of the Heartlands. His crown still blazes with spectral fire.',
  weakness: 'magic',
  tags: ['raid', 'crypt', 'undead', 'ghost', 'boss', 'king'],
  resistance: 'melee',
  phases: [
    {
      name: 'Phase 1: Melee Oath',
      hpRange: [1.0, 0.66],
      description: 'The King fights with melee. Players must use melee or take 5x damage from his retribution aura.',
      attackStyle: 'melee',
      requiredCombatStyle: 'melee',
      wrongStyleMultiplier: 5.0,
    },
    {
      name: 'Phase 2: Ranged Oath',
      hpRange: [0.66, 0.33],
      description: 'The King draws a spectral bow. Players must switch to ranged or take 5x damage.',
      attackStyle: 'ranged',
      attackRange: 6,
      requiredCombatStyle: 'ranged',
      wrongStyleMultiplier: 5.0,
      maxHitOverride: 42,
    },
    {
      name: 'Phase 3: Magic Oath',
      hpRange: [0.33, 0.0],
      description: 'The King channels spectral magic. Players must use magic or take 5x damage. Enraged: attack speed +1.',
      attackStyle: 'magic',
      attackRange: 8,
      requiredCombatStyle: 'magic',
      wrongStyleMultiplier: 5.0,
      maxHitOverride: 46,
      attackSpeedOverride: 3,
    },
  ],
}, {
  always: [{ id: 107, name: 'Dragon bones', min: 1, max: 1 }],
  main: [
    { id: 95000, name: 'Crown of the Last King', weight: 1, min: 1, max: 1 },
    { id: 95001, name: 'Spectral blade', weight: 1, min: 1, max: 1 },
    { id: 95002, name: 'Kingsguard signet', weight: 2, min: 1, max: 1 },
    { id: 101, name: 'Coins', weight: 12, min: 50000, max: 150000 },
    { id: 11360, name: 'Law rune', weight: 5, min: 100, max: 300 },
    { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 },
  ],
}, 95003, 'Mini Last King', 'A tiny spectral monarch. Still tries to knight people.', 3000);


// ---------- Raid 01 Definition Object ----------
const RAID_01_KINGS_CRYPT = {
  id: 'kings_crypt',
  name: "The King's Crypt",
  region: 'heartlands',
  description: 'Descend into the crypt beneath the Heartlands castle to face the ghost of the last true king. Match his combat style in each phase -- or perish.',
  playerCount: { min: 1, max: 2 },
  difficulty: 'mid',
  estimatedTime: '15-25 minutes',
  rooms: [
    {
      id: 'ghostly_knights',
      name: 'The Honour Guard',
      description: 'Three ghostly knights patrol the antechamber. Defeat them to open the inner gate.',
      enemies: [
        { defId: 'crypt_ghostly_knight', count: 3 },
      ],
      mechanic: 'Kill all three knights. They use protect from melee -- use magic or ranged to break their guard.',
    },
    {
      id: 'trapped_hallway',
      name: 'The Gauntlet Corridor',
      description: 'A corridor lined with pressure plates and stone sentinels. Step carefully or be bombarded.',
      enemies: [
        { defId: 'crypt_trap_sentinel', count: 2 },
      ],
      mechanic: 'Pressure plates deal 15 damage if stepped on. Sentinels fire ranged projectiles. Navigate to the end while fighting.',
      hazards: [
        { type: 'pressure_plate', damage: 15, tileCount: 12 },
      ],
    },
    {
      id: 'last_king',
      name: 'The Throne Room',
      description: 'The Last King sits upon a spectral throne. He demands his challengers match his combat style -- refuse, and his retribution strikes with 5x force.',
      enemies: [
        { defId: 'crypt_last_king', count: 1 },
      ],
      mechanic: 'The King cycles through melee, ranged, and magic phases. Players MUST match his style or take 5x damage from his retribution aura.',
      isBossRoom: true,
    },
  ],
  uniqueRewards: [
    { id: 95000, name: 'Crown of the Last King', dropRate: '1/25' },
    { id: 95001, name: 'Spectral blade', dropRate: '1/25' },
    { id: 95002, name: 'Kingsguard signet', dropRate: '1/15' },
    { id: 95003, name: 'Mini Last King', dropRate: '1/3000' },
  ],
};


// ##############################################################################
//
//   RAID 02 -- THE SIEGE OF HEARTLANDS
//   Region: Heartlands | Players: 5-20 | Difficulty: Mid-High
//
//   The Heartlands are under siege. Enemies pour through the gates in
//   10 escalating waves. Players must fight, build barricades (Construction),
//   and heal allied NPCs (Herblore). A multi-skill raid where combat alone
//   is not enough.
//
//   10 waves + final wave boss: The Siege Commander
//
// ##############################################################################

// ==========================================================================
// RAID 02 ITEMS
// ==========================================================================

// -- Siege Commander's Cape --
// Multi-style cape: +4 to all attack styles, +6 to all defences, +2 prayer.
// Not BIS for any single style but BIS for hybridizing.
// Niche: content that requires switching between melee/ranged/magic mid-fight.
items.define({
  id: 95010,
  name: "Siege commander's cape",
  examine: 'A cape forged in the fires of siege warfare. Its wearer commanded all arts of combat.',
  value: 15000000,
  category: 'armour',
  equipSlot: 'cape',
  tradeable: true,
  weight: 1.0,
  stats: {
    stab: 4, slash: 4, crush: 4,
    ranged: 4, magic: 4,
    melee_strength: 2, ranged_strength: 2, magic_strength: 2,
    def_stab: 6, def_slash: 6, def_crush: 6,
    def_magic: 6, def_ranged: 6,
    prayer: 2,
  },
  equipReqs: { defence: 75 },
});

// -- Heartlands Banner --
// Off-hand banner. +2 to all combat stats for everyone in a 5-tile radius.
// Group utility item -- the boost stacks with prayers but not with other banners.
// Niche: group PvM, raids, world bosses.
items.define({
  id: 95011,
  name: 'Heartlands banner',
  examine: 'The banner of the Heartlands defenders. Its presence inspires nearby allies.',
  value: 10000000,
  category: 'armour',
  equipSlot: 'shield',
  tradeable: true,
  weight: 3.0,
  stats: {
    def_stab: 15, def_slash: 18, def_crush: 12,
    def_magic: 4, def_ranged: 14,
    prayer: 3,
  },
  equipReqs: { defence: 65 },
  passiveEffect: {
    name: 'Rally',
    description: '+2 invisible boost to attack, strength, ranged, and magic for all players within 5 tiles. Does not stack with other banners.',
    auraRadius: 5,
    auraBoost: { attack: 2, strength: 2, ranged: 2, magic: 2 },
    stackable: false,
  },
});

// -- Siege Crossbow --
// Slow, powerful crossbow with AoE bolt effect (hits 3x3 area).
// Low accuracy but devastating in multi-combat / wave content.
// Niche: wave defense, multi-combat Slayer, Siege raids.
items.define({
  id: 95012,
  name: 'Siege crossbow',
  examine: 'A heavy crossbow designed for fortification warfare. Its bolts explode on impact.',
  value: 6000000,
  category: 'weapon',
  equipSlot: 'weapon',
  tradeable: true,
  weight: 5.0,
  speed: 7,
  stats: { ranged: 80, ranged_strength: 90 },
  equipReqs: { ranged: 70 },
  passiveEffect: {
    name: 'Explosive Bolt',
    description: 'Bolts deal 50% of hit damage to all enemies in a 3x3 area around the target.',
    aoeDamagePercent: 0.50,
    aoeSize: 3,
  },
});

// -- Pet: Siege Hound --
items.define({
  id: 95013,
  name: 'Siege hound',
  examine: 'A small war dog from the siege. Barks at enemy NPCs.',
  value: 0,
  category: 'pet',
  tradeable: false,
  weight: 0,
});


// ==========================================================================
// RAID 02 NPCs
// ==========================================================================

// Wave enemies -- Siege Raiders (melee foot soldiers)
npcs.defineNpc('siege_raider', {
  name: 'Siege Raider',
  combat: 95,
  maxHp: 80,
  maxHit: 14,
  stats: { attack: 90, strength: 85, defence: 70 },
  attackSpeed: 4,
  attackRange: 1,
  attackStyle: 'melee',
  size: 1,
  aggressive: true,
  aggroRange: 10,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A foreign soldier attacking the Heartlands gates.',
  weakness: 'stab',
  tags: ['raid', 'siege', 'human', 'soldier'],
});

droptables.define('siege_raider', {
  always: [],
  main: [
    { id: 101, name: 'Coins', weight: 8, min: 200, max: 800 },
    { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 },
  ],
});

// Wave enemies -- Siege Archers (ranged)
npcs.defineNpc('siege_archer', {
  name: 'Siege Archer',
  combat: 110,
  maxHp: 70,
  maxHit: 16,
  stats: { attack: 100, strength: 90, defence: 60 },
  attackSpeed: 5,
  attackRange: 7,
  attackStyle: 'ranged',
  size: 1,
  aggressive: true,
  aggroRange: 12,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'An enemy archer loosing arrows at the Heartlands defenders.',
  weakness: 'magic',
  tags: ['raid', 'siege', 'human', 'archer'],
});

droptables.define('siege_archer', {
  always: [],
  main: [
    { id: 101, name: 'Coins', weight: 8, min: 200, max: 800 },
    { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 },
  ],
});

// Wave enemies -- Siege Mage (magic, appears wave 5+)
npcs.defineNpc('siege_war_mage', {
  name: 'Siege War Mage',
  combat: 160,
  maxHp: 100,
  maxHit: 22,
  stats: { attack: 150, strength: 120, defence: 100 },
  attackSpeed: 5,
  attackRange: 8,
  attackStyle: 'magic',
  size: 1,
  aggressive: true,
  aggroRange: 12,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'An enemy mage hurling fire at the barricades.',
  weakness: 'ranged',
  tags: ['raid', 'siege', 'human', 'mage'],
});

droptables.define('siege_war_mage', {
  always: [],
  main: [
    { id: 101, name: 'Coins', weight: 6, min: 500, max: 1500 },
    { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 },
  ],
});

// Wave enemies -- Battering Ram (object, targets barricades)
npcs.defineNpc('siege_battering_ram', {
  name: 'Battering Ram',
  combat: 200,
  maxHp: 300,
  maxHit: 0,
  stats: { attack: 1, strength: 1, defence: 200 },
  attackSpeed: 8,
  attackRange: 1,
  attackStyle: 'melee',
  size: 3,
  aggressive: false,
  aggroRange: 0,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A massive battering ram pushed by enemy soldiers. It targets the barricades.',
  weakness: 'slash',
  tags: ['raid', 'siege', 'construct'],
  canMove: true,
});

// Final Boss: The Siege Commander
boss('siege_commander', {
  name: 'The Siege Commander',
  combat: 450,
  maxHp: 800,
  maxHit: 42,
  stats: { attack: 300, strength: 290, defence: 270 },
  attackSpeed: 4,
  attackRange: 1,
  attackStyle: 'melee',
  size: 2,
  aggressive: true,
  aggroRange: 15,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'The commander of the siege forces. A towering warlord in obsidian plate.',
  weakness: 'stab',
  tags: ['raid', 'siege', 'human', 'boss', 'commander'],
  resistance: 'magic',
  phases: [
    {
      name: 'Phase 1: Vanguard',
      hpRange: [1.0, 0.60],
      description: 'The Commander fights with melee and calls reinforcements every 20 ticks.',
      reinforcementInterval: 20,
      reinforcementDefId: 'siege_raider',
      reinforcementCount: 2,
    },
    {
      name: 'Phase 2: Siege Tactics',
      hpRange: [0.60, 0.30],
      description: 'The Commander orders artillery fire -- AoE damage zones appear on the ground every 12 ticks.',
      artilleryDamage: 35,
      artillerySize: 3,
      artilleryInterval: 12,
      maxHitOverride: 48,
    },
    {
      name: 'Phase 3: Last Stand',
      hpRange: [0.30, 0.0],
      description: 'Enraged. Attack speed +1, summons elite guards. The barricades are targeted by everything.',
      attackSpeedOverride: 3,
      maxHitOverride: 55,
      eliteGuardDefId: 'siege_war_mage',
      eliteGuardCount: 3,
    },
  ],
}, {
  always: [{ id: 107, name: 'Dragon bones', min: 2, max: 2 }],
  main: [
    { id: 95010, name: "Siege commander's cape", weight: 1, min: 1, max: 1 },
    { id: 95011, name: 'Heartlands banner', weight: 1, min: 1, max: 1 },
    { id: 95012, name: 'Siege crossbow', weight: 1, min: 1, max: 1 },
    { id: 101, name: 'Coins', weight: 15, min: 75000, max: 250000 },
    { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 },
  ],
}, 95013, 'Siege hound', 'A small war dog from the siege. Barks at enemy NPCs.', 5000);


// ---------- Raid 02 Definition Object ----------
const RAID_02_SIEGE = {
  id: 'siege_of_heartlands',
  name: 'The Siege of Heartlands',
  region: 'heartlands',
  description: 'Defend the Heartlands gates against 10 waves of invaders. Build barricades, heal NPC defenders, and slay the Siege Commander. A true multi-skill raid.',
  playerCount: { min: 5, max: 20 },
  difficulty: 'mid-high',
  estimatedTime: '30-50 minutes',
  skillRequirements: { construction: 45, herblore: 40 },
  rooms: [
    { id: 'wave_1', name: 'Wave 1: Scouts', enemies: [{ defId: 'siege_raider', count: 5 }] },
    { id: 'wave_2', name: 'Wave 2: Footmen', enemies: [{ defId: 'siege_raider', count: 8 }, { defId: 'siege_archer', count: 3 }] },
    { id: 'wave_3', name: 'Wave 3: Archers', enemies: [{ defId: 'siege_archer', count: 8 }, { defId: 'siege_raider', count: 4 }] },
    { id: 'wave_4', name: 'Wave 4: Battering Ram', enemies: [{ defId: 'siege_battering_ram', count: 1 }, { defId: 'siege_raider', count: 6 }], mechanic: 'Destroy the battering ram before it breaks the gate. Repair barricades with Construction.' },
    { id: 'wave_5', name: 'Wave 5: War Mages', enemies: [{ defId: 'siege_war_mage', count: 4 }, { defId: 'siege_raider', count: 5 }], mechanic: 'Mages set barricades on fire. Use water buckets to extinguish.' },
    { id: 'wave_6', name: 'Wave 6: Full Assault', enemies: [{ defId: 'siege_raider', count: 8 }, { defId: 'siege_archer', count: 6 }, { defId: 'siege_war_mage', count: 2 }] },
    { id: 'wave_7', name: 'Wave 7: Bombardment', enemies: [{ defId: 'siege_raider', count: 6 }, { defId: 'siege_battering_ram', count: 2 }], mechanic: 'Two battering rams. Artillery fire from off-screen. Heal NPC defenders with Herblore.' },
    { id: 'wave_8', name: 'Wave 8: Elite Strike', enemies: [{ defId: 'siege_war_mage', count: 6 }, { defId: 'siege_archer', count: 6 }], mechanic: 'All enemies focus the weakest barricade section.' },
    { id: 'wave_9', name: 'Wave 9: The Vanguard', enemies: [{ defId: 'siege_raider', count: 10 }, { defId: 'siege_archer', count: 5 }, { defId: 'siege_war_mage', count: 5 }, { defId: 'siege_battering_ram', count: 1 }] },
    { id: 'wave_10', name: 'Wave 10: The Commander', enemies: [{ defId: 'siege_commander', count: 1 }, { defId: 'siege_war_mage', count: 3 }, { defId: 'siege_raider', count: 5 }], isBossRoom: true },
  ],
  mechanics: {
    barricades: { repairSkill: 'construction', repairLevel: 45, hpPerBarricade: 200, barricadeCount: 4 },
    npcDefenders: { healSkill: 'herblore', healLevel: 40, healAmount: 30, defenderCount: 6 },
    roles: ['fighter', 'builder', 'healer', 'archer'],
  },
  uniqueRewards: [
    { id: 95010, name: "Siege commander's cape", dropRate: '1/25' },
    { id: 95011, name: 'Heartlands banner', dropRate: '1/25' },
    { id: 95012, name: 'Siege crossbow', dropRate: '1/30' },
    { id: 95013, name: 'Siege hound', dropRate: '1/5000' },
  ],
};


// ##############################################################################
//
//   RAID 03 -- THE PHARAOH'S SANCTUM
//   Region: Boneyard Wastes | Players: 3-5 | Difficulty: High
//
//   A sealed tomb in the Boneyard Wastes. Sand pours into every room --
//   players must complete each room before the sand suffocates them.
//
//   4 rooms: Trapped Corridor -> Scarab Swarm -> Mummy Generals -> The Pharaoh
//
// ##############################################################################

// ==========================================================================
// RAID 03 ITEMS
// ==========================================================================

// -- Pharaoh's Sceptre (upgraded) --
// Unlimited teleport to pyramid entrances + high magic bonus.
// BIS for magic accuracy in 1H staff slot, but lower magic damage than Kodai.
// Niche: teleport utility + magic accuracy stick for PvM.
items.define({
  id: 95020,
  name: "Pharaoh's sceptre (a)",
  examine: 'An awakened sceptre of the desert pharaohs. Teleports without limit and channels immense magical power.',
  value: 20000000,
  category: 'weapon',
  equipSlot: 'weapon',
  tradeable: true,
  weight: 2.0,
  speed: 5,
  stats: { magic: 30, magic_strength: 10, prayer: 2 },
  equipReqs: { magic: 75 },
  passiveEffect: {
    name: 'Desert Passage',
    description: 'Unlimited teleports to all pyramid entrances in the Boneyard Wastes. No charge cost.',
    unlimitedTeleport: true,
    teleportDestinations: ['pyramid_entrance', 'pharaoh_sanctum', 'boneyard_oasis'],
  },
});

// -- Desert Ward --
// Shield with sand magic defensive aura. BIS magic defence shield.
// Reduces incoming magic damage by 10% while equipped. Strong ranged defence too.
// Niche: magic-heavy bosses, PvP vs mages.
items.define({
  id: 95021,
  name: 'Desert ward',
  examine: 'A shield carved from desert stone and enchanted with sand magic. It diffuses incoming spells.',
  value: 12000000,
  category: 'armour',
  equipSlot: 'shield',
  tradeable: true,
  weight: 4.0,
  stats: {
    def_stab: 35, def_slash: 38, def_crush: 40,
    def_magic: 25, def_ranged: 35,
    magic: 5, prayer: 3,
  },
  equipReqs: { defence: 75, magic: 60 },
  passiveEffect: {
    name: 'Sand Diffusion',
    description: 'Reduces incoming magic damage by 10%.',
    magicDamageReduction: 0.10,
  },
});

// -- Sand-forged khopesh --
// Fast stab/slash weapon with bonus damage in desert areas.
// +15% damage in Boneyard Wastes. Moderate stats outside the region.
// Niche: all Boneyard content, desert Slayer.
items.define({
  id: 95022,
  name: 'Sand-forged khopesh',
  examine: 'A curved sword forged from sanctum sand. It strikes harder in its home desert.',
  value: 7000000,
  category: 'weapon',
  equipSlot: 'weapon',
  tradeable: true,
  weight: 1.8,
  speed: 4,
  stats: { slash: 78, stab: 65, melee_strength: 72 },
  equipReqs: { attack: 70 },
  passiveEffect: {
    name: 'Desert Edge',
    description: '+15% damage when fighting in the Boneyard Wastes region.',
    regionBonus: 'boneyard_wastes',
    damageBonus: 0.15,
  },
});

// -- Pet: Baby Scarab Lord --
items.define({
  id: 95023,
  name: 'Baby Scarab Lord',
  examine: 'A tiny golden scarab. It rolls imaginary dung balls around your feet.',
  value: 0,
  category: 'pet',
  tradeable: false,
  weight: 0,
});


// ==========================================================================
// RAID 03 NPCs
// ==========================================================================

// Room 1: Corridor Trap -- Sand Golem sentries
npcs.defineNpc('sanctum_sand_golem', {
  name: 'Sand Golem',
  combat: 160,
  maxHp: 140,
  maxHit: 20,
  stats: { attack: 140, strength: 150, defence: 160 },
  attackSpeed: 5,
  attackRange: 1,
  attackStyle: 'melee',
  size: 2,
  aggressive: true,
  aggroRange: 8,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A golem formed from compacted tomb sand. It reforms if not destroyed quickly.',
  weakness: 'crush',
  tags: ['raid', 'sanctum', 'construct', 'desert'],
  resistance: 'stab',
});

droptables.define('sanctum_sand_golem', {
  always: [],
  main: [
    { id: 101, name: 'Coins', weight: 8, min: 500, max: 2000 },
    { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 },
  ],
});

// Room 2: Scarab Swarm room -- large scarab waves
npcs.defineNpc('sanctum_scarab_swarm', {
  name: 'Tomb Scarab',
  combat: 80,
  maxHp: 40,
  maxHit: 10,
  stats: { attack: 70, strength: 60, defence: 40 },
  attackSpeed: 3,
  attackRange: 1,
  attackStyle: 'melee',
  size: 1,
  aggressive: true,
  aggroRange: 15,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A golden tomb scarab. They attack in overwhelming numbers.',
  weakness: 'crush',
  tags: ['raid', 'sanctum', 'scarab', 'kalphite', 'desert'],
});

droptables.define('sanctum_scarab_swarm', {
  always: [],
  main: [
    { id: 101, name: 'Coins', weight: 5, min: 100, max: 500 },
    { id: 0, name: 'Nothing', weight: 10, min: 0, max: 0 },
  ],
});

// Room 3: Mummy Generals (2 mini-bosses fought together)
npcs.defineNpc('sanctum_mummy_general_melee', {
  name: 'General Khet',
  combat: 280,
  maxHp: 300,
  maxHit: 30,
  stats: { attack: 220, strength: 210, defence: 200 },
  attackSpeed: 4,
  attackRange: 1,
  attackStyle: 'melee',
  size: 2,
  aggressive: true,
  aggroRange: 10,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A mummified general. He wields a massive bronze khopesh and fights with ancient fury.',
  weakness: 'magic',
  tags: ['raid', 'sanctum', 'undead', 'mummy', 'boss', 'desert'],
  resistance: 'melee',
});

npcs.defineNpc('sanctum_mummy_general_magic', {
  name: 'General Ankhu',
  combat: 260,
  maxHp: 250,
  maxHit: 32,
  stats: { attack: 200, strength: 190, defence: 180 },
  attackSpeed: 5,
  attackRange: 6,
  attackStyle: 'magic',
  size: 2,
  aggressive: true,
  aggroRange: 10,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A mummified sorcerer general. She channels the desert winds as weapons.',
  weakness: 'ranged',
  tags: ['raid', 'sanctum', 'undead', 'mummy', 'boss', 'desert'],
  resistance: 'magic',
});

droptables.define('sanctum_mummy_general_melee', {
  always: [],
  main: [
    { id: 101, name: 'Coins', weight: 8, min: 5000, max: 15000 },
    { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 },
  ],
});

droptables.define('sanctum_mummy_general_magic', {
  always: [],
  main: [
    { id: 101, name: 'Coins', weight: 8, min: 5000, max: 15000 },
    { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 },
  ],
});

// Room 4 / Final Boss: The Pharaoh
boss('sanctum_pharaoh', {
  name: 'The Pharaoh',
  combat: 520,
  maxHp: 700,
  maxHit: 48,
  stats: { attack: 320, strength: 300, defence: 290 },
  attackSpeed: 4,
  attackRange: 6,
  attackStyle: 'magic',
  size: 3,
  aggressive: true,
  aggroRange: 15,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'The entombed pharaoh of the Boneyard dynasty. Sand and sorcery are his to command.',
  weakness: 'ranged',
  tags: ['raid', 'sanctum', 'undead', 'mummy', 'boss', 'pharaoh', 'desert'],
  resistance: 'melee',
  phases: [
    {
      name: 'Phase 1: Sand Storm',
      hpRange: [1.0, 0.65],
      description: 'The Pharaoh summons sandstorms. AoE damage zones sweep across the room. Magic attacks with sand blasts.',
      attackStyle: 'magic',
      sandstormDamage: 20,
      sandstormInterval: 10,
      sandstormWidth: 5,
    },
    {
      name: 'Phase 2: Scarab Swarm',
      hpRange: [0.65, 0.35],
      description: 'The Pharaoh summons scarab swarms that heal him if they reach him. Kill the scarabs while dodging sand.',
      scarabSpawnInterval: 8,
      scarabDefId: 'sanctum_scarab_swarm',
      scarabHealAmount: 40,
      maxHitOverride: 52,
    },
    {
      name: 'Phase 3: Sand Timer',
      hpRange: [0.35, 0.0],
      description: 'The room fills with sand. Players have 90 seconds to finish the Pharaoh or suffocate. Enraged: attack speed +1, max hit +10.',
      attackSpeedOverride: 3,
      maxHitOverride: 58,
      sandTimerSeconds: 90,
      suffocationDamage: 10,
      suffocationInterval: 3,
    },
  ],
}, {
  always: [{ id: 107, name: 'Dragon bones', min: 2, max: 2 }],
  main: [
    { id: 95020, name: "Pharaoh's sceptre (a)", weight: 1, min: 1, max: 1 },
    { id: 95021, name: 'Desert ward', weight: 1, min: 1, max: 1 },
    { id: 95022, name: 'Sand-forged khopesh', weight: 2, min: 1, max: 1 },
    { id: 101, name: 'Coins', weight: 14, min: 80000, max: 200000 },
    { id: 0, name: 'Nothing', weight: 5, min: 0, max: 0 },
  ],
}, 95023, 'Baby Scarab Lord', 'A tiny golden scarab. It rolls imaginary dung balls around your feet.', 3000);


// ---------- Raid 03 Definition Object ----------
const RAID_03_SANCTUM = {
  id: 'pharaohs_sanctum',
  name: "The Pharaoh's Sanctum",
  region: 'boneyard_wastes',
  description: 'Explore a sealed tomb in the Boneyard Wastes. Sand pours into every room -- complete each chamber before it suffocates you.',
  playerCount: { min: 3, max: 5 },
  difficulty: 'high',
  estimatedTime: '25-40 minutes',
  rooms: [
    {
      id: 'trapped_corridor',
      name: 'The Trapped Corridor',
      description: 'Sand golems patrol a corridor of crushing walls and dart traps.',
      enemies: [{ defId: 'sanctum_sand_golem', count: 4 }],
      mechanic: 'Sand fills the corridor. Complete in 3 minutes or take suffocation damage.',
      sandTimer: 180,
    },
    {
      id: 'scarab_swarm_room',
      name: 'The Scarab Pit',
      description: 'A chamber teeming with tomb scarabs. They pour from cracks in the walls endlessly.',
      enemies: [{ defId: 'sanctum_scarab_swarm', count: 20 }],
      mechanic: 'Kill 20 scarabs to seal the cracks. Sand rises -- 2.5 minutes before suffocation.',
      sandTimer: 150,
    },
    {
      id: 'mummy_generals',
      name: 'The War Chamber',
      description: 'Two mummified generals stand guard. They must be killed within 10 seconds of each other or the survivor resurrects the other.',
      enemies: [
        { defId: 'sanctum_mummy_general_melee', count: 1 },
        { defId: 'sanctum_mummy_general_magic', count: 1 },
      ],
      mechanic: 'Kill both generals within 10 seconds of each other. If one survives, it fully heals the other.',
      resurrectionWindow: 10,
    },
    {
      id: 'pharaoh_throne',
      name: 'The Throne of Sands',
      description: 'The Pharaoh rises from his sarcophagus. Sand pours from every surface. Kill him before the room fills completely.',
      enemies: [{ defId: 'sanctum_pharaoh', count: 1 }],
      mechanic: 'Sand timer: 90 seconds in phase 3. The room fills with sand, dealing escalating suffocation damage.',
      isBossRoom: true,
    },
  ],
  uniqueRewards: [
    { id: 95020, name: "Pharaoh's sceptre (a)", dropRate: '1/23' },
    { id: 95021, name: 'Desert ward', dropRate: '1/23' },
    { id: 95022, name: 'Sand-forged khopesh', dropRate: '1/15' },
    { id: 95023, name: 'Baby Scarab Lord', dropRate: '1/3000' },
  ],
};


// ##############################################################################
//
//   RAID 04 -- LEVIATHAN'S SPINE
//   Region: Boneyard Wastes | Players: 4-8 | Difficulty: High
//
//   A colossal leviathan fossil lies half-buried in the desert. Players
//   navigate across its skeleton, fighting creatures that live inside its
//   ribcage. The skeleton shifts -- floor tiles rearrange every 2 minutes.
//
//   5 rooms across the fossil: Tail -> Ribcage -> Gut -> Skull -> The Parasite
//
// ##############################################################################

// ==========================================================================
// RAID 04 ITEMS
// ==========================================================================

// -- Leviathan's Backbone --
// BIS 2H crush weapon for sustained DPS. Slower than a mace, faster than
// an elder maul. Each hit has a 10% chance to stun the target for 1 tick.
// Niche: crush-weak bosses where stun value matters (Gargoyles, Tekton, golems).
items.define({
  id: 95030,
  name: "Leviathan's backbone",
  examine: 'A weapon carved from the leviathan\'s spine. Each swing carries the weight of an ancient titan.',
  value: 18000000,
  category: 'weapon',
  equipSlot: 'weapon',
  twoHanded: true,
  tradeable: true,
  weight: 6.0,
  speed: 5,
  stats: { crush: 118, melee_strength: 124 },
  equipReqs: { attack: 78, strength: 78 },
  passiveEffect: {
    name: 'Titan Impact',
    description: '10% chance per hit to stun the target for 1 tick, delaying their next attack.',
    stunChance: 0.10,
    stunDuration: 1,
  },
});

// -- Fossilized Pendant --
// BIS strength amulet for crush builds. Highest crush-specific melee strength
// of any amulet, but negative slash and stab bonuses.
// Niche: paired with Leviathan's backbone or Elder maul for crush-only builds.
items.define({
  id: 95031,
  name: 'Fossilized pendant',
  examine: 'A pendant carved from leviathan bone. It amplifies crushing force at the cost of blade finesse.',
  value: 14000000,
  category: 'jewellery',
  equipSlot: 'amulet',
  tradeable: true,
  weight: 0.5,
  stats: {
    crush: 18,
    melee_strength: 14,
    stab: -5, slash: -5,
    def_stab: 3, def_slash: 3, def_crush: 8,
  },
  equipReqs: { strength: 75 },
});

// -- Fossil Fragment Shield --
// Tank shield made from leviathan bone. High melee defence, bonus vs large NPCs.
// Niche: tanking large bosses (size 3+), Corp Beast.
items.define({
  id: 95032,
  name: 'Fossil fragment shield',
  examine: 'A shield hewn from leviathan ribcage. Larger enemies struggle to bypass its ancient bulk.',
  value: 8000000,
  category: 'armour',
  equipSlot: 'shield',
  tradeable: true,
  weight: 5.0,
  stats: {
    def_stab: 55, def_slash: 60, def_crush: 52,
    def_magic: -8, def_ranged: 50,
    melee_strength: 0,
  },
  equipReqs: { defence: 75 },
  passiveEffect: {
    name: 'Titanic Guard',
    description: '+15% defence against NPCs with size 3 or larger.',
    largeBonusThreshold: 3,
    defenceBonus: 0.15,
  },
});

// -- Pet: Baby Leviathan --
items.define({
  id: 95033,
  name: 'Baby Leviathan',
  examine: 'A tiny skeletal leviathan. It swims through the air as if the desert were an ocean.',
  value: 0,
  category: 'pet',
  tradeable: false,
  weight: 0,
});


// ==========================================================================
// RAID 04 NPCs
// ==========================================================================

// Room 1: Tail -- Boneworms (melee, fast)
npcs.defineNpc('spine_boneworm', {
  name: 'Boneworm',
  combat: 120,
  maxHp: 90,
  maxHit: 14,
  stats: { attack: 110, strength: 100, defence: 80 },
  attackSpeed: 3,
  attackRange: 1,
  attackStyle: 'melee',
  size: 1,
  aggressive: true,
  aggroRange: 8,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A parasitic worm that has made the leviathan skeleton its home.',
  weakness: 'slash',
  tags: ['raid', 'spine', 'beast', 'worm'],
});

droptables.define('spine_boneworm', {
  always: [],
  main: [
    { id: 101, name: 'Coins', weight: 8, min: 300, max: 1200 },
    { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 },
  ],
});

// Room 2: Ribcage -- Fossil Spiders
npcs.defineNpc('spine_fossil_spider', {
  name: 'Fossil Spider',
  combat: 170,
  maxHp: 130,
  maxHit: 18,
  stats: { attack: 150, strength: 140, defence: 120 },
  attackSpeed: 4,
  attackRange: 1,
  attackStyle: 'melee',
  size: 2,
  aggressive: true,
  aggroRange: 8,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A massive spider that has woven webs between the ribs of the leviathan.',
  weakness: 'crush',
  tags: ['raid', 'spine', 'beast', 'spider'],
  poisonDamage: 6,
});

droptables.define('spine_fossil_spider', {
  always: [],
  main: [
    { id: 101, name: 'Coins', weight: 6, min: 800, max: 3000 },
    { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 },
  ],
});

// Room 3: Gut -- Acid Crawlers (magic, ranged acid attack)
npcs.defineNpc('spine_acid_crawler', {
  name: 'Acid Crawler',
  combat: 190,
  maxHp: 160,
  maxHit: 22,
  stats: { attack: 160, strength: 155, defence: 140 },
  attackSpeed: 5,
  attackRange: 5,
  attackStyle: 'magic',
  size: 2,
  aggressive: true,
  aggroRange: 10,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A creature that feeds on the leviathan\'s fossilized stomach acid. It spits corrosive bile.',
  weakness: 'ranged',
  tags: ['raid', 'spine', 'beast', 'crawler'],
  poisonDamage: 8,
});

droptables.define('spine_acid_crawler', {
  always: [],
  main: [
    { id: 101, name: 'Coins', weight: 6, min: 1000, max: 4000 },
    { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 },
  ],
});

// Room 4: Skull -- Skull Guardian (mini-boss)
npcs.defineNpc('spine_skull_guardian', {
  name: 'Skull Guardian',
  combat: 320,
  maxHp: 400,
  maxHit: 34,
  stats: { attack: 250, strength: 240, defence: 230 },
  attackSpeed: 5,
  attackRange: 1,
  attackStyle: 'melee',
  size: 3,
  aggressive: true,
  aggroRange: 12,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A creature that has nested inside the leviathan\'s skull. It guards its domain ferociously.',
  weakness: 'magic',
  tags: ['raid', 'spine', 'beast', 'boss', 'guardian'],
  resistance: 'ranged',
});

droptables.define('spine_skull_guardian', {
  always: [],
  main: [
    { id: 101, name: 'Coins', weight: 8, min: 5000, max: 15000 },
    { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 },
  ],
});

// Room 5 / Final Boss: The Parasite -- the creature that killed the leviathan
boss('spine_parasite', {
  name: 'The Parasite',
  combat: 480,
  maxHp: 750,
  maxHit: 46,
  stats: { attack: 310, strength: 300, defence: 280 },
  attackSpeed: 4,
  attackRange: 3,
  attackStyle: 'melee',
  size: 4,
  aggressive: true,
  aggroRange: 15,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'The ancient parasite that killed the leviathan from within. It has grown to monstrous size over millennia.',
  weakness: 'slash',
  tags: ['raid', 'spine', 'beast', 'boss', 'parasite'],
  resistance: 'magic',
  phases: [
    {
      name: 'Phase 1: Coiled',
      hpRange: [1.0, 0.60],
      description: 'The Parasite strikes from its coiled position. Melee attacks with tentacle swipes. Floor tiles shift every 2 minutes.',
      floorShiftInterval: 200,
    },
    {
      name: 'Phase 2: Uncoiled',
      hpRange: [0.60, 0.30],
      description: 'The Parasite uncoils, revealing its weak core. Spawns boneworm adds. Core takes 2x damage but is only exposed for 10 seconds every 30 seconds.',
      coreExposeDuration: 10,
      coreExposeInterval: 30,
      coreDamageMultiplier: 2.0,
      addSpawnDefId: 'spine_boneworm',
      addSpawnCount: 4,
      addSpawnInterval: 20,
      maxHitOverride: 52,
    },
    {
      name: 'Phase 3: Frenzy',
      hpRange: [0.30, 0.0],
      description: 'The Parasite goes into a frenzy. Attack speed doubles. Floor tiles shift every minute. Acid pools appear randomly.',
      attackSpeedOverride: 2,
      maxHitOverride: 38,
      floorShiftInterval: 100,
      acidPoolDamage: 15,
      acidPoolSpawnRate: 8,
    },
  ],
}, {
  always: [{ id: 107, name: 'Dragon bones', min: 3, max: 3 }],
  main: [
    { id: 95030, name: "Leviathan's backbone", weight: 1, min: 1, max: 1 },
    { id: 95031, name: 'Fossilized pendant', weight: 1, min: 1, max: 1 },
    { id: 95032, name: 'Fossil fragment shield', weight: 2, min: 1, max: 1 },
    { id: 101, name: 'Coins', weight: 14, min: 100000, max: 300000 },
    { id: 0, name: 'Nothing', weight: 5, min: 0, max: 0 },
  ],
}, 95033, 'Baby Leviathan', 'A tiny skeletal leviathan. It swims through the air as if the desert were an ocean.', 4000);


// ---------- Raid 04 Definition Object ----------
const RAID_04_SPINE = {
  id: 'leviathans_spine',
  name: "Leviathan's Spine",
  region: 'boneyard_wastes',
  description: 'Navigate across a colossal leviathan fossil in the desert. The skeleton shifts beneath your feet as you fight the creatures that dwell within.',
  playerCount: { min: 4, max: 8 },
  difficulty: 'high',
  estimatedTime: '30-45 minutes',
  rooms: [
    { id: 'tail', name: 'The Tail', description: 'Boneworms infest the tail section.', enemies: [{ defId: 'spine_boneworm', count: 8 }], mechanic: 'Floor tiles shift every 2 minutes. Stay on solid bone or fall into the sand below.' },
    { id: 'ribcage', name: 'The Ribcage', description: 'Fossil spiders have woven webs between the ribs.', enemies: [{ defId: 'spine_fossil_spider', count: 5 }], mechanic: 'Webs slow movement by 50%. Burn them with fire spells or a tinderbox.' },
    { id: 'gut', name: 'The Gut', description: 'Acid crawlers spit bile from the leviathan\'s fossilized stomach.', enemies: [{ defId: 'spine_acid_crawler', count: 4 }], mechanic: 'Acid pools on the ground deal 15 damage per tick. Lure enemies out of the acid.' },
    { id: 'skull', name: 'The Skull', description: 'A massive guardian has nested inside the leviathan\'s skull.', enemies: [{ defId: 'spine_skull_guardian', count: 1 }], mechanic: 'The guardian can headbutt, sending shockwaves in a line. Dodge to the sides.' },
    { id: 'parasite_core', name: 'The Core', description: 'Deep inside the skeleton, the ancient parasite that killed the leviathan still lives.', enemies: [{ defId: 'spine_parasite', count: 1 }], isBossRoom: true },
  ],
  uniqueRewards: [
    { id: 95030, name: "Leviathan's backbone", dropRate: '1/23' },
    { id: 95031, name: 'Fossilized pendant', dropRate: '1/23' },
    { id: 95032, name: 'Fossil fragment shield', dropRate: '1/15' },
    { id: 95033, name: 'Baby Leviathan', dropRate: '1/4000' },
  ],
};


// ##############################################################################
//
//   RAID 05 -- THE BLOOD SANCTUM
//   Region: Moryskah | Players: 3-5 | Difficulty: High
//
//   A cathedral deep in Moryskah where vampyres worship the Blood Archon.
//   Taking damage fills a blood meter -- at 100%, you become a thrall
//   (stunned, attacking allies) for 10 seconds.
//
//   4 rooms: Blood Fountain -> Thrall Pits -> Elder Vampyre -> Blood Archon
//
// ##############################################################################

// ==========================================================================
// RAID 05 ITEMS
// ==========================================================================

// -- Sanguine Rapier --
// BIS stab weapon with lifesteal. Heals 10% of damage dealt.
// Slightly lower raw DPS than Ghrazi rapier, but the sustain makes it
// BIS for long fights where food conservation matters.
// Niche: extended boss fights, Slayer tasks, solo bossing.
items.define({
  id: 95040,
  name: 'Sanguine rapier',
  examine: 'A rapier forged in vampire blood. Each strike siphons life from the victim.',
  value: 20000000,
  category: 'weapon',
  equipSlot: 'weapon',
  tradeable: true,
  weight: 1.5,
  speed: 4,
  stats: { stab: 89, slash: 60, melee_strength: 84 },
  equipReqs: { attack: 80 },
  passiveEffect: {
    name: 'Sanguine Drain',
    description: 'Heals for 10% of melee damage dealt on every hit.',
    healOnHitPercent: 0.10,
  },
});

// -- Blood Ward --
// Off-hand ward with prayer and magic defence. BIS for prayer preservation
// in magic-heavy encounters. The prayer bonus combined with the magic defence
// makes it ideal for tanking magic bosses.
// Niche: magic bosses, GWD, prayer-focused content.
items.define({
  id: 95041,
  name: 'Blood ward',
  examine: 'A ward soaked in sanctified blood. It shields both mind and spirit.',
  value: 15000000,
  category: 'armour',
  equipSlot: 'shield',
  tradeable: true,
  weight: 2.0,
  stats: {
    prayer: 8,
    magic: 12,
    def_stab: 20, def_slash: 22, def_crush: 18,
    def_magic: 20, def_ranged: 15,
  },
  equipReqs: { defence: 75, prayer: 65 },
});

// -- Bloodsworn Vambraces --
// Melee gloves with lifesteal. +3% healing on all melee hits while worn.
// Stacks with other lifesteal effects. Moderate offensive stats.
// Niche: sustain builds, solo bossing, Slayer efficiency.
items.define({
  id: 95042,
  name: 'Bloodsworn vambraces',
  examine: 'Gloves stained with ancient blood pacts. They draw vitality from every blow you strike.',
  value: 10000000,
  category: 'armour',
  equipSlot: 'hands',
  tradeable: true,
  weight: 0.5,
  stats: {
    stab: 8, slash: 8, crush: 8,
    melee_strength: 4,
    def_stab: 4, def_slash: 4, def_crush: 4,
  },
  equipReqs: { attack: 70, defence: 70 },
  passiveEffect: {
    name: 'Blood Pact',
    description: 'Heal 3% of melee damage dealt. Stacks with other lifesteal effects.',
    healOnHitPercent: 0.03,
    stackable: true,
  },
});

// -- Pet: Blood Bat --
items.define({
  id: 95043,
  name: 'Blood bat',
  examine: 'A tiny vampire bat. It hangs upside down from your shoulder.',
  value: 0,
  category: 'pet',
  tradeable: false,
  weight: 0,
});


// ==========================================================================
// RAID 05 NPCs
// ==========================================================================

// Room 1: Blood Fountain -- Bloodveld guardians
npcs.defineNpc('blood_sanctum_veld', {
  name: 'Sanctum Bloodveld',
  combat: 140,
  maxHp: 110,
  maxHit: 16,
  stats: { attack: 120, strength: 115, defence: 100 },
  attackSpeed: 4,
  attackRange: 1,
  attackStyle: 'melee',
  size: 2,
  aggressive: true,
  aggroRange: 8,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A bloated bloodveld that feeds from the cathedral\'s fountain.',
  weakness: 'slash',
  tags: ['raid', 'blood_sanctum', 'bloodveld', 'vampyre'],
});

droptables.define('blood_sanctum_veld', {
  always: [],
  main: [
    { id: 101, name: 'Coins', weight: 8, min: 500, max: 2000 },
    { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 },
  ],
});

// Room 2: Thrall Pits -- Thralls (fast, low HP, high damage)
npcs.defineNpc('blood_sanctum_thrall', {
  name: 'Blood Thrall',
  combat: 100,
  maxHp: 60,
  maxHit: 18,
  stats: { attack: 100, strength: 110, defence: 50 },
  attackSpeed: 3,
  attackRange: 1,
  attackStyle: 'melee',
  size: 1,
  aggressive: true,
  aggroRange: 12,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'A mindless thrall driven by blood frenzy. Fast and dangerous but fragile.',
  weakness: 'crush',
  tags: ['raid', 'blood_sanctum', 'undead', 'thrall'],
});

droptables.define('blood_sanctum_thrall', {
  always: [],
  main: [
    { id: 101, name: 'Coins', weight: 5, min: 200, max: 800 },
    { id: 0, name: 'Nothing', weight: 10, min: 0, max: 0 },
  ],
});

// Room 3: Elder Vampyre
npcs.defineNpc('blood_sanctum_elder', {
  name: 'Elder Vampyre',
  combat: 340,
  maxHp: 380,
  maxHit: 36,
  stats: { attack: 260, strength: 250, defence: 240 },
  attackSpeed: 4,
  attackRange: 1,
  attackStyle: 'melee',
  size: 2,
  aggressive: true,
  aggroRange: 10,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'An elder vampyre of immense power. Only blessed weapons can finish it.',
  weakness: 'crush',
  tags: ['raid', 'blood_sanctum', 'vampyre', 'boss'],
  resistance: 'ranged',
  requiresItemToKill: 'ivandis_flail',
});

droptables.define('blood_sanctum_elder', {
  always: [],
  main: [
    { id: 101, name: 'Coins', weight: 8, min: 10000, max: 30000 },
    { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 },
  ],
});

// Room 4 / Final Boss: Blood Archon
boss('blood_archon', {
  name: 'Blood Archon',
  combat: 560,
  maxHp: 850,
  maxHit: 50,
  stats: { attack: 340, strength: 330, defence: 300 },
  attackSpeed: 4,
  attackRange: 6,
  attackStyle: 'magic',
  size: 3,
  aggressive: true,
  aggroRange: 15,
  wanderRadius: 0,
  respawnTicks: 0,
  examine: 'The Blood Archon. Ancient ruler of the vampyre cathedral. His blood magic can turn warriors against their allies.',
  weakness: 'crush',
  tags: ['raid', 'blood_sanctum', 'vampyre', 'boss', 'archon'],
  resistance: 'ranged',
  phases: [
    {
      name: 'Phase 1: Blood Tide',
      hpRange: [1.0, 0.65],
      description: 'The Archon casts blood magic. Every hit you take fills your blood meter by 8%. At 100% you become a thrall for 10 seconds.',
      bloodMeterPerHit: 8,
      thrallDuration: 10,
      attackStyle: 'magic',
    },
    {
      name: 'Phase 2: Crimson Rain',
      hpRange: [0.65, 0.35],
      description: 'Blood rains from the ceiling. 3x3 AoE zones deal 20 damage every 6 ticks. Blood meter charges faster (12% per hit).',
      bloodMeterPerHit: 12,
      crimsonRainDamage: 20,
      crimsonRainSize: 3,
      crimsonRainInterval: 6,
      maxHitOverride: 55,
    },
    {
      name: 'Phase 3: Blood Puppet',
      hpRange: [0.35, 0.0],
      description: 'The Archon sacrifices HP to summon a blood puppet clone of the highest-DPS player. The clone has 200 HP and copies the player\'s stats.',
      cloneHp: 200,
      cloneInterval: 40,
      maxHitOverride: 58,
      attackSpeedOverride: 3,
      bloodMeterPerHit: 15,
    },
  ],
}, {
  always: [{ id: 107, name: 'Dragon bones', min: 2, max: 2 }],
  main: [
    { id: 95040, name: 'Sanguine rapier', weight: 1, min: 1, max: 1 },
    { id: 95041, name: 'Blood ward', weight: 1, min: 1, max: 1 },
    { id: 95042, name: 'Bloodsworn vambraces', weight: 2, min: 1, max: 1 },
    { id: 101, name: 'Coins', weight: 14, min: 100000, max: 250000 },
    { id: 0, name: 'Nothing', weight: 5, min: 0, max: 0 },
  ],
}, 95043, 'Blood bat', 'A tiny vampire bat. It hangs upside down from your shoulder.', 3000);


// ---------- Raid 05 Definition Object ----------
const RAID_05_BLOOD_SANCTUM = {
  id: 'blood_sanctum',
  name: 'The Blood Sanctum',
  region: 'moryskah',
  description: 'Descend into a vampyre cathedral in the heart of Moryskah. Taking damage fills your blood meter -- at 100%, you become a mindless thrall, attacking your allies.',
  playerCount: { min: 3, max: 5 },
  difficulty: 'high',
  estimatedTime: '25-40 minutes',
  rooms: [
    { id: 'blood_fountain', name: 'The Blood Fountain', description: 'Bloodvelds feed at a fountain of crimson. Clear them to proceed.', enemies: [{ defId: 'blood_sanctum_veld', count: 6 }], mechanic: 'The fountain heals enemies within 3 tiles for 5 HP per tick. Destroy the fountain first.' },
    { id: 'thrall_pits', name: 'The Thrall Pits', description: 'Thralls swarm from pits in the floor.', enemies: [{ defId: 'blood_sanctum_thrall', count: 12 }], mechanic: 'Blood meter mechanic active. Taking damage from thralls fills your blood bar. Manage aggro carefully.' },
    { id: 'elder_vampyre', name: 'The Elder Chamber', description: 'An elder vampyre blocks the path to the Archon.', enemies: [{ defId: 'blood_sanctum_elder', count: 1 }], mechanic: 'Requires blessed weaponry (Ivandis flail or equivalent) to deal the killing blow.' },
    { id: 'archon_throne', name: 'The Archon\'s Throne', description: 'The Blood Archon sits atop a throne of bones. His blood magic is devastating.', enemies: [{ defId: 'blood_archon', count: 1 }], isBossRoom: true },
  ],
  uniqueRewards: [
    { id: 95040, name: 'Sanguine rapier', dropRate: '1/23' },
    { id: 95041, name: 'Blood ward', dropRate: '1/23' },
    { id: 95042, name: 'Bloodsworn vambraces', dropRate: '1/15' },
    { id: 95043, name: 'Blood bat', dropRate: '1/3000' },
  ],
};


// ##############################################################################
//
//   RAID 06 -- CATACOMBS OF THE DAMNED
//   Region: Moryskah | Players: 1-2 | Difficulty: Extreme
//
//   A randomized dungeon beneath Moryskah. 5-8 rooms drawn from a pool
//   of 15 possible rooms, each with a unique mini-boss. Permadeath within
//   the raid: death resets you to room 1.
//
// ##############################################################################

// ==========================================================================
// RAID 06 ITEMS
// ==========================================================================

// -- Catacomb Crown --
// Helm that boosts all Slayer damage by 5%. No other offensive bonuses.
// Low defence stats. Niche: Slayer tasks exclusively.
items.define({
  id: 95050,
  name: 'Catacomb crown',
  examine: 'A crown salvaged from the catacombs. Its dark enchantment empowers the wearer against assigned targets.',
  value: 18000000,
  category: 'armour',
  equipSlot: 'head',
  tradeable: true,
  weight: 1.0,
  stats: {
    def_stab: 12, def_slash: 14, def_crush: 10,
    def_magic: 2, def_ranged: 10,
  },
  equipReqs: { defence: 65, slayer: 75 },
  passiveEffect: {
    name: 'Slayer Supremacy',
    description: '+5% damage against your current Slayer assignment.',
    slayerDamageBonus: 0.05,
  },
});

// -- Soul Lantern --
// Light source that also regenerates prayer. +1 prayer point every 10 seconds.
// No combat stats. Equipped in shield slot.
// Niche: prayer regen in dark areas (catacombs, barrows), hands-free light source.
items.define({
  id: 95051,
  name: 'Soul lantern',
  examine: 'A lantern fueled by trapped souls. It illuminates the darkness and restores prayer.',
  value: 8000000,
  category: 'armour',
  equipSlot: 'shield',
  tradeable: true,
  weight: 1.5,
  stats: {
    prayer: 5,
  },
  equipReqs: { prayer: 60 },
  passiveEffect: {
    name: 'Soul Light',
    description: 'Acts as a permanent light source. Restores 1 prayer point every 10 seconds.',
    lightSource: true,
    prayerRegenRate: 1,
    prayerRegenInterval: 17,
  },
});

// -- Damned Amulet --
// Amulet that increases accuracy by 10% against undead. Moderate stats.
// Niche: Moryskah content, barrows, revenants.
items.define({
  id: 95052,
  name: 'Damned amulet',
  examine: 'An amulet forged in the catacombs. It resonates with the undead, guiding strikes to their weak points.',
  value: 6000000,
  category: 'jewellery',
  equipSlot: 'amulet',
  tradeable: true,
  weight: 0.3,
  stats: {
    stab: 8, slash: 8, crush: 8,
    ranged: 8, magic: 8,
    melee_strength: 3,
    prayer: 2,
  },
  equipReqs: { prayer: 50 },
  passiveEffect: {
    name: 'Undead Resonance',
    description: '+10% accuracy against undead enemies.',
    targetTags: ['undead'],
    accuracyBonus: 0.10,
  },
});

// -- Pet: Catacomb Wraith --
items.define({
  id: 95053,
  name: 'Catacomb wraith',
  examine: 'A tiny wraith from the catacombs. It phases through walls for fun.',
  value: 0,
  category: 'pet',
  tradeable: false,
  weight: 0,
});


// ==========================================================================
// RAID 06 NPCs -- Pool of 15 mini-bosses (5-8 drawn per run)
// ==========================================================================

const CATACOMB_MINI_BOSSES = [];

// Mini-boss 1: The Bonelord
boss('catacomb_bonelord', {
  name: 'The Bonelord',
  combat: 260,
  maxHp: 280,
  maxHit: 28,
  stats: { attack: 200, strength: 190, defence: 185 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee', size: 2,
  aggressive: true, aggroRange: 10, wanderRadius: 0, respawnTicks: 0,
  examine: 'A skeleton lord wreathed in necromantic flame.',
  weakness: 'crush', tags: ['raid', 'catacomb', 'undead', 'boss'],
}, {
  always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 5000, max: 15000 }, { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 }],
}, null, null, null);
CATACOMB_MINI_BOSSES.push('catacomb_bonelord');

// Mini-boss 2: The Wraith Matron
boss('catacomb_wraith_matron', {
  name: 'The Wraith Matron',
  combat: 280,
  maxHp: 260,
  maxHit: 30,
  stats: { attack: 210, strength: 200, defence: 170 },
  attackSpeed: 4, attackRange: 6, attackStyle: 'magic', size: 2,
  aggressive: true, aggroRange: 12, wanderRadius: 0, respawnTicks: 0,
  examine: 'A spectral matron who commands lesser wraiths.',
  weakness: 'ranged', tags: ['raid', 'catacomb', 'undead', 'ghost', 'boss'],
}, {
  always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 5000, max: 15000 }, { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 }],
}, null, null, null);
CATACOMB_MINI_BOSSES.push('catacomb_wraith_matron');

// Mini-boss 3: The Flesh Golem
boss('catacomb_flesh_golem', {
  name: 'The Flesh Golem',
  combat: 300,
  maxHp: 350,
  maxHit: 32,
  stats: { attack: 220, strength: 230, defence: 210 },
  attackSpeed: 5, attackRange: 1, attackStyle: 'melee', size: 3,
  aggressive: true, aggroRange: 8, wanderRadius: 0, respawnTicks: 0,
  examine: 'A grotesque golem stitched from corpses. It regenerates health when standing in blood pools.',
  weakness: 'magic', tags: ['raid', 'catacomb', 'undead', 'construct', 'boss'],
}, {
  always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 5000, max: 15000 }, { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 }],
}, null, null, null);
CATACOMB_MINI_BOSSES.push('catacomb_flesh_golem');

// Mini-boss 4: The Shade Warden
boss('catacomb_shade_warden', {
  name: 'The Shade Warden',
  combat: 270,
  maxHp: 240,
  maxHit: 26,
  stats: { attack: 200, strength: 195, defence: 200 },
  attackSpeed: 4, attackRange: 5, attackStyle: 'ranged', size: 2,
  aggressive: true, aggroRange: 10, wanderRadius: 0, respawnTicks: 0,
  examine: 'A shade that guards the deeper passages. It fires shadow bolts that drain prayer.',
  weakness: 'magic', tags: ['raid', 'catacomb', 'undead', 'shade', 'boss'],
}, {
  always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 5000, max: 15000 }, { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 }],
}, null, null, null);
CATACOMB_MINI_BOSSES.push('catacomb_shade_warden');

// Mini-boss 5: The Abomination
boss('catacomb_abomination', {
  name: 'The Abomination',
  combat: 310,
  maxHp: 400,
  maxHit: 34,
  stats: { attack: 240, strength: 250, defence: 200 },
  attackSpeed: 5, attackRange: 1, attackStyle: 'melee', size: 3,
  aggressive: true, aggroRange: 8, wanderRadius: 0, respawnTicks: 0,
  examine: 'A massive undead beast. It slams the ground, creating shockwaves.',
  weakness: 'ranged', tags: ['raid', 'catacomb', 'undead', 'beast', 'boss'],
}, {
  always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 8000, max: 20000 }, { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 }],
}, null, null, null);
CATACOMB_MINI_BOSSES.push('catacomb_abomination');

// Mini-boss 6: The Blood Witch
boss('catacomb_blood_witch', {
  name: 'The Blood Witch',
  combat: 290,
  maxHp: 230,
  maxHit: 32,
  stats: { attack: 215, strength: 200, defence: 170 },
  attackSpeed: 4, attackRange: 7, attackStyle: 'magic', size: 1,
  aggressive: true, aggroRange: 12, wanderRadius: 0, respawnTicks: 0,
  examine: 'A witch who draws power from spilled blood. Heals every time she hits you.',
  weakness: 'ranged', tags: ['raid', 'catacomb', 'undead', 'mage', 'boss'],
}, {
  always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 5000, max: 15000 }, { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 }],
}, null, null, null);
CATACOMB_MINI_BOSSES.push('catacomb_blood_witch');

// Mini-boss 7: The Crypt Knight
boss('catacomb_crypt_knight', {
  name: 'The Crypt Knight',
  combat: 285,
  maxHp: 320,
  maxHit: 30,
  stats: { attack: 220, strength: 215, defence: 230 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee', size: 1,
  aggressive: true, aggroRange: 10, wanderRadius: 0, respawnTicks: 0,
  examine: 'An armoured undead knight. Extremely high defence. Must be crushed.',
  weakness: 'crush', tags: ['raid', 'catacomb', 'undead', 'knight', 'armoured', 'boss'],
}, {
  always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 5000, max: 15000 }, { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 }],
}, null, null, null);
CATACOMB_MINI_BOSSES.push('catacomb_crypt_knight');

// Mini-boss 8: The Plaguebearer
boss('catacomb_plaguebearer', {
  name: 'The Plaguebearer',
  combat: 275,
  maxHp: 250,
  maxHit: 24,
  stats: { attack: 195, strength: 180, defence: 175 },
  attackSpeed: 4, attackRange: 4, attackStyle: 'ranged', size: 2,
  aggressive: true, aggroRange: 10, wanderRadius: 0, respawnTicks: 0,
  examine: 'A diseased corpse that spews toxic gas. Standing near it poisons you.',
  weakness: 'magic', tags: ['raid', 'catacomb', 'undead', 'boss'],
  poisonDamage: 8,
}, {
  always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 5000, max: 15000 }, { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 }],
}, null, null, null);
CATACOMB_MINI_BOSSES.push('catacomb_plaguebearer');

// Mini-boss 9: The Soul Collector
boss('catacomb_soul_collector', {
  name: 'The Soul Collector',
  combat: 300,
  maxHp: 270,
  maxHit: 28,
  stats: { attack: 225, strength: 210, defence: 190 },
  attackSpeed: 5, attackRange: 8, attackStyle: 'magic', size: 2,
  aggressive: true, aggroRange: 12, wanderRadius: 0, respawnTicks: 0,
  examine: 'A spectral entity that collects souls. Drains prayer and special attack energy.',
  weakness: 'melee', tags: ['raid', 'catacomb', 'undead', 'ghost', 'boss'],
}, {
  always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 5000, max: 15000 }, { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 }],
}, null, null, null);
CATACOMB_MINI_BOSSES.push('catacomb_soul_collector');

// Mini-boss 10: The Ghast Sovereign
boss('catacomb_ghast_sovereign', {
  name: 'The Ghast Sovereign',
  combat: 295,
  maxHp: 310,
  maxHit: 30,
  stats: { attack: 230, strength: 220, defence: 195 },
  attackSpeed: 4, attackRange: 3, attackStyle: 'melee', size: 2,
  aggressive: true, aggroRange: 10, wanderRadius: 0, respawnTicks: 0,
  examine: 'The king of ghasts. Rots food in your inventory on every attack.',
  weakness: 'slash', tags: ['raid', 'catacomb', 'undead', 'ghast', 'boss'],
}, {
  always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 8000, max: 20000 }, { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 }],
}, null, null, null);
CATACOMB_MINI_BOSSES.push('catacomb_ghast_sovereign');

// Mini-boss 11: The Barrow Wight
boss('catacomb_barrow_wight', {
  name: 'The Barrow Wight',
  combat: 280,
  maxHp: 290,
  maxHit: 28,
  stats: { attack: 210, strength: 205, defence: 220 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee', size: 2,
  aggressive: true, aggroRange: 10, wanderRadius: 0, respawnTicks: 0,
  examine: 'An ancient warrior entombed in a barrow. Drains your combat stats on hit.',
  weakness: 'magic', tags: ['raid', 'catacomb', 'undead', 'boss'],
}, {
  always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 5000, max: 15000 }, { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 }],
}, null, null, null);
CATACOMB_MINI_BOSSES.push('catacomb_barrow_wight');

// Mini-boss 12: The Revenant Lord
boss('catacomb_revenant_lord', {
  name: 'The Revenant Lord',
  combat: 320,
  maxHp: 350,
  maxHit: 35,
  stats: { attack: 250, strength: 240, defence: 210 },
  attackSpeed: 4, attackRange: 6, attackStyle: 'magic', size: 2,
  aggressive: true, aggroRange: 12, wanderRadius: 0, respawnTicks: 0,
  examine: 'A powerful revenant lord. Switches attack styles every 4 attacks.',
  weakness: 'crush', tags: ['raid', 'catacomb', 'undead', 'revenant', 'boss'],
}, {
  always: [], main: [{ id: 101, name: 'Coins', weight: 6, min: 10000, max: 30000 }, { id: 0, name: 'Nothing', weight: 3, min: 0, max: 0 }],
}, null, null, null);
CATACOMB_MINI_BOSSES.push('catacomb_revenant_lord');

// Mini-boss 13: The Grave Hound
boss('catacomb_grave_hound', {
  name: 'The Grave Hound',
  combat: 265,
  maxHp: 300,
  maxHit: 26,
  stats: { attack: 200, strength: 210, defence: 180 },
  attackSpeed: 3, attackRange: 1, attackStyle: 'melee', size: 2,
  aggressive: true, aggroRange: 10, wanderRadius: 0, respawnTicks: 0,
  examine: 'A massive undead hound. It attacks twice per turn.',
  weakness: 'stab', tags: ['raid', 'catacomb', 'undead', 'beast', 'boss'],
}, {
  always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 5000, max: 15000 }, { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 }],
}, null, null, null);
CATACOMB_MINI_BOSSES.push('catacomb_grave_hound');

// Mini-boss 14: The Lich
boss('catacomb_lich', {
  name: 'The Lich',
  combat: 330,
  maxHp: 280,
  maxHit: 36,
  stats: { attack: 260, strength: 240, defence: 200 },
  attackSpeed: 5, attackRange: 8, attackStyle: 'magic', size: 1,
  aggressive: true, aggroRange: 14, wanderRadius: 0, respawnTicks: 0,
  examine: 'A lich of terrible power. Must destroy its phylactery to prevent resurrection.',
  weakness: 'melee', tags: ['raid', 'catacomb', 'undead', 'mage', 'boss'],
}, {
  always: [], main: [{ id: 101, name: 'Coins', weight: 6, min: 10000, max: 25000 }, { id: 0, name: 'Nothing', weight: 3, min: 0, max: 0 }],
}, null, null, null);
CATACOMB_MINI_BOSSES.push('catacomb_lich');

// Mini-boss 15: The Necromancer
boss('catacomb_necromancer', {
  name: 'The Necromancer',
  combat: 340,
  maxHp: 300,
  maxHit: 34,
  stats: { attack: 250, strength: 230, defence: 210 },
  attackSpeed: 5, attackRange: 7, attackStyle: 'magic', size: 1,
  aggressive: true, aggroRange: 12, wanderRadius: 0, respawnTicks: 0,
  examine: 'A necromancer who raises fallen enemies. Kill his summons before they overwhelm you.',
  weakness: 'ranged', tags: ['raid', 'catacomb', 'undead', 'mage', 'boss'],
}, {
  always: [], main: [{ id: 101, name: 'Coins', weight: 6, min: 10000, max: 25000 }, { id: 0, name: 'Nothing', weight: 3, min: 0, max: 0 }],
}, null, null, null);
CATACOMB_MINI_BOSSES.push('catacomb_necromancer');


// ---------- Raid 06 Definition Object ----------
const RAID_06_CATACOMBS = {
  id: 'catacombs_of_the_damned',
  name: 'Catacombs of the Damned',
  region: 'moryskah',
  description: 'A randomized dungeon beneath Moryskah. Each run draws 5-8 rooms from a pool of 15. Every room has a unique mini-boss. Death resets you to room 1.',
  playerCount: { min: 1, max: 2 },
  difficulty: 'extreme',
  estimatedTime: '20-45 minutes',
  roomPool: CATACOMB_MINI_BOSSES,
  roomCountRange: { min: 5, max: 8 },
  mechanics: {
    permadeath: true,
    deathPenalty: 'restart_from_room_1',
    noResupply: true,
  },
  uniqueRewards: [
    { id: 95050, name: 'Catacomb crown', dropRate: '1/30', source: 'final room completion' },
    { id: 95051, name: 'Soul lantern', dropRate: '1/20', source: 'final room completion' },
    { id: 95052, name: 'Damned amulet', dropRate: '1/15', source: 'any room completion' },
    { id: 95053, name: 'Catacomb wraith', dropRate: '1/3500', source: 'final room completion' },
  ],
};

// The Catacomb rewards come from the raid completion chest, not individual bosses.
// Separate reward table for the final chest.
droptables.define('catacombs_reward_chest', {
  always: [{ id: 101, name: 'Coins', min: 50000, max: 200000 }],
  main: [
    { id: 95050, name: 'Catacomb crown', weight: 1, min: 1, max: 1 },
    { id: 95051, name: 'Soul lantern', weight: 2, min: 1, max: 1 },
    { id: 95052, name: 'Damned amulet', weight: 3, min: 1, max: 1 },
    { id: 101, name: 'Coins', weight: 10, min: 100000, max: 400000 },
    { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 },
  ],
  tertiary: [
    { id: 95053, name: 'Catacomb wraith', chance: 3500, min: 1, max: 1 },
  ],
});


// ##############################################################################
//
//   RAID 07 -- THEATRE OF BLOOD: HARD MODE
//   Region: Moryskah | Players: 4-5 | Difficulty: Extreme
//
//   The same Theatre of Shadows bosses, but with 50% more HP, additional
//   mechanics per boss, and no banking between bosses. Limited supplies only.
//
// ##############################################################################

// ==========================================================================
// RAID 07 ITEMS
// ==========================================================================

// -- Sanguine Scythe ornament kit (cosmetic) --
items.define({
  id: 95060,
  name: 'Sanguine scythe ornament kit',
  examine: 'A cosmetic upgrade kit for the Scythe of Vitur. Turns it a deep crimson.',
  value: 25000000,
  category: 'cosmetic',
  tradeable: true,
  weight: 0.1,
});

// -- Sanguinesti staff upgrade --
// Upgrades the Sanguinesti staff: max hit +5, heal chance improved from 1/6 to 1/4.
// Attached permanently. Makes it the definitive sustain staff.
items.define({
  id: 95061,
  name: 'Holy ornament kit',
  examine: 'A sacred jewel upgrade for the Sanguinesti staff. Increases its maximum hit and heal frequency.',
  value: 30000000,
  category: 'crafting',
  tradeable: true,
  weight: 0.2,
});

items.define({
  id: 95062,
  name: 'Sanguinesti staff (e)',
  examine: 'An enhanced Sanguinesti staff. Higher max hit and heals on 1 in 4 attacks.',
  value: 50000000,
  category: 'weapon',
  equipSlot: 'weapon',
  tradeable: false,
  weight: 2.0,
  speed: 4,
  stats: { magic: 28, magic_strength: 17 },
  equipReqs: { magic: 82 },
  ammoType: 'blood_rune',
  ammoCost: 3,
  passiveEffect: {
    name: 'Enhanced Sanguine Drain',
    description: '1/4 chance per hit to heal for 50% of damage dealt. +5 max hit over base staff.',
    healOnHitChance: 1 / 4,
    healOnHitPercent: 0.50,
    maxHitBonus: 5,
  },
});

// -- HM Justiciar faceguard --
// Cosmetic HM recolor + slight stat boost (+2 prayer over normal).
items.define({
  id: 95063,
  name: 'Sanguine Justiciar faceguard',
  examine: 'A blood-red Justiciar faceguard from the hardened Theatre. Slightly improved stats.',
  value: 12000000,
  category: 'armour',
  equipSlot: 'head',
  tradeable: true,
  weight: 2.0,
  stats: {
    def_stab: 62, def_slash: 65, def_crush: 60,
    def_magic: -5, def_ranged: 60,
    prayer: 6,
    stab: -3, slash: -3, crush: -3,
    ranged: -3, magic: -3,
  },
  equipReqs: { defence: 78 },
  setId: 'justiciar',
});

// -- Pet: Lil' Verzik --
items.define({
  id: 95064,
  name: "Lil' Verzik",
  examine: 'A tiny Verzik Vitur. She practices her web attack on spiders.',
  value: 0,
  category: 'pet',
  tradeable: false,
  weight: 0,
});


// ==========================================================================
// RAID 07 NPCs -- Hard Mode variants of ToS bosses
// ==========================================================================

// HM Maiden of Sugadinti
boss('tos_hm_maiden', {
  name: 'The Maiden of Sugadinti (HM)',
  combat: 580,
  maxHp: 525,
  maxHit: 45,
  stats: { attack: 300, strength: 280, defence: 260 },
  attackSpeed: 4, attackRange: 6, attackStyle: 'magic', size: 4,
  aggressive: true, aggroRange: 15, wanderRadius: 0, respawnTicks: 0,
  examine: 'The Maiden, empowered by hard mode. Blood spawns are faster and deadlier.',
  weakness: 'ranged', tags: ['raid', 'tos', 'tos_hm', 'vampyre', 'boss'],
  resistance: 'melee',
  phases: [
    { name: 'Phase 1', hpRange: [1.0, 0.70], description: 'Blood spawns walk toward the Maiden. If they reach her, she heals 100 HP each. Spawns every 8 ticks (faster than normal).', spawnInterval: 8, healPerSpawn: 100 },
    { name: 'Phase 2', hpRange: [0.70, 0.30], description: 'Blood tornados chase players. Double blood spawns.', tornadoDamage: 30, spawnInterval: 6, healPerSpawn: 100 },
    { name: 'Phase 3', hpRange: [0.30, 0.0], description: 'Enraged. Attack speed +1. Blood spawns every 4 ticks. Tornados move faster.', attackSpeedOverride: 3, spawnInterval: 4 },
  ],
}, {
  always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 10000, max: 30000 }, { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 }],
}, null, null, null);

// HM Pestilent Bloat
boss('tos_hm_bloat', {
  name: 'The Pestilent Bloat (HM)',
  combat: 520,
  maxHp: 450,
  maxHit: 50,
  stats: { attack: 280, strength: 300, defence: 240 },
  attackSpeed: 6, attackRange: 1, attackStyle: 'melee', size: 3,
  aggressive: true, aggroRange: 10, wanderRadius: 0, respawnTicks: 0,
  examine: 'The Bloat in hard mode. Its stomp deals massive AoE damage. Falling meat is more frequent.',
  weakness: 'slash', tags: ['raid', 'tos', 'tos_hm', 'undead', 'boss'],
  phases: [
    { name: 'Walking', description: 'The Bloat walks in a rectangle. Attack it from behind when it stops. In HM, it turns faster and walk duration is shorter.', turnInterval: 6 },
    { name: 'Stomp', description: 'The Bloat stomps, dealing 40 damage in a 5x5 area. In HM, stomps hit a 7x7 area.', stompDamage: 40, stompSize: 7 },
  ],
}, {
  always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 10000, max: 30000 }, { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 }],
}, null, null, null);

// HM Nylocas Vasilias
boss('tos_hm_nylocas', {
  name: 'Nylocas Vasilias (HM)',
  combat: 560,
  maxHp: 480,
  maxHit: 42,
  stats: { attack: 290, strength: 275, defence: 270 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee', size: 3,
  aggressive: true, aggroRange: 10, wanderRadius: 0, respawnTicks: 0,
  examine: 'The Nylocas king in hard mode. Style changes are more frequent and adds spawn faster.',
  weakness: 'current_style', tags: ['raid', 'tos', 'tos_hm', 'boss'],
  phases: [
    { name: 'Melee Form', description: 'Green form. Weak to melee. In HM, style changes every 8 ticks instead of 12.', attackStyle: 'melee', styleChangeInterval: 8 },
    { name: 'Ranged Form', description: 'Blue form. Weak to ranged.', attackStyle: 'ranged', styleChangeInterval: 8 },
    { name: 'Magic Form', description: 'Grey form. Weak to magic.', attackStyle: 'magic', styleChangeInterval: 8 },
  ],
}, {
  always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 10000, max: 30000 }, { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 }],
}, null, null, null);

// HM Sotetseg
boss('tos_hm_sotetseg', {
  name: 'Sotetseg (HM)',
  combat: 600,
  maxHp: 600,
  maxHit: 50,
  stats: { attack: 320, strength: 310, defence: 280 },
  attackSpeed: 4, attackRange: 8, attackStyle: 'magic', size: 3,
  aggressive: true, aggroRange: 15, wanderRadius: 0, respawnTicks: 0,
  examine: 'Sotetseg in hard mode. The maze is more complex and his big ball attack hits harder.',
  weakness: 'ranged', tags: ['raid', 'tos', 'tos_hm', 'demon', 'boss'],
  resistance: 'melee',
  phases: [
    { name: 'Phase 1', hpRange: [1.0, 0.66], description: 'Attacks with magic and ranged. Big red ball targets one player for 70 damage, split between nearby players. In HM, ball damage is 100.', bigBallDamage: 100 },
    { name: 'Maze Phase', hpThreshold: 0.66, description: 'Players enter the shadow realm and must navigate a maze of red tiles. In HM, the maze has 40% more red tiles.', mazeExtraTiles: 0.40 },
    { name: 'Phase 2', hpRange: [0.66, 0.0], description: 'Enraged. Big ball every 10 ticks. Death ball (50 damage AoE) added in HM.', bigBallInterval: 10, deathBallDamage: 50 },
  ],
}, {
  always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 10000, max: 30000 }, { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 }],
}, null, null, null);

// HM Verzik Vitur
boss('tos_hm_verzik', {
  name: 'Verzik Vitur (HM)',
  combat: 680,
  maxHp: 900,
  maxHit: 60,
  stats: { attack: 360, strength: 350, defence: 320 },
  attackSpeed: 4, attackRange: 8, attackStyle: 'magic', size: 4,
  aggressive: true, aggroRange: 15, wanderRadius: 0, respawnTicks: 0,
  examine: 'Lady Verzik Vitur in hard mode. All three phases are deadlier. The final phase has a purple tornado.',
  weakness: 'stab', tags: ['raid', 'tos', 'tos_hm', 'vampyre', 'boss'],
  resistance: 'magic',
  phases: [
    { name: 'Phase 1: Throne', hpRange: [1.0, 0.70], description: 'Verzik sits on her throne. Only the Dawnbringer can damage her. In HM, she fires faster and has a shield that must be broken.', attackStyle: 'magic', shieldHp: 150 },
    { name: 'Phase 2: Melee', hpRange: [0.70, 0.40], description: 'Verzik charges. Lightning attacks, bomb attacks. In HM, bombs explode in 5x5 instead of 3x3.', attackStyle: 'melee', bombSize: 5 },
    { name: 'Phase 3: True Form', hpRange: [0.40, 0.0], description: 'Verzik transforms. Webs, green ball, yellows mechanic. In HM, a purple tornado chases the lowest-HP player.', attackStyle: 'magic', purpleTornadoDamage: 40, maxHitOverride: 70, attackSpeedOverride: 3 },
  ],
}, {
  always: [{ id: 107, name: 'Dragon bones', min: 3, max: 3 }],
  main: [
    { id: 95060, name: 'Sanguine scythe ornament kit', weight: 1, min: 1, max: 1 },
    { id: 95061, name: 'Holy ornament kit', weight: 1, min: 1, max: 1 },
    { id: 95063, name: 'Sanguine Justiciar faceguard', weight: 2, min: 1, max: 1 },
    { id: 101, name: 'Coins', weight: 12, min: 150000, max: 400000 },
    { id: 0, name: 'Nothing', weight: 5, min: 0, max: 0 },
  ],
}, 95064, "Lil' Verzik", 'A tiny Verzik Vitur. She practices her web attack on spiders.', 3000);


// ---------- Raid 07 Definition Object ----------
const RAID_07_TOB_HM = {
  id: 'theatre_of_blood_hm',
  name: 'Theatre of Blood: Hard Mode',
  region: 'moryskah',
  description: 'The Theatre of Shadows bosses with 50% more HP, additional mechanics, and no banking between fights. The ultimate Moryskah challenge.',
  playerCount: { min: 4, max: 5 },
  difficulty: 'extreme',
  estimatedTime: '40-60 minutes',
  rooms: [
    { id: 'maiden_hm', name: 'The Maiden of Sugadinti (HM)', enemies: [{ defId: 'tos_hm_maiden', count: 1 }], isBossRoom: true, mechanic: 'Blood spawns every 8 ticks (vs 12 normal). Tornados in phase 2.' },
    { id: 'bloat_hm', name: 'The Pestilent Bloat (HM)', enemies: [{ defId: 'tos_hm_bloat', count: 1 }], isBossRoom: true, mechanic: '7x7 stomp area. Faster turning.' },
    { id: 'nylocas_hm', name: 'Nylocas Vasilias (HM)', enemies: [{ defId: 'tos_hm_nylocas', count: 1 }], isBossRoom: true, mechanic: 'Style changes every 8 ticks. Faster add spawns.' },
    { id: 'sotetseg_hm', name: 'Sotetseg (HM)', enemies: [{ defId: 'tos_hm_sotetseg', count: 1 }], isBossRoom: true, mechanic: '40% more maze tiles. Death ball AoE added.' },
    { id: 'verzik_hm', name: 'Verzik Vitur (HM)', enemies: [{ defId: 'tos_hm_verzik', count: 1 }], isBossRoom: true, mechanic: 'Shield in P1. 5x5 bombs in P2. Purple tornado in P3.' },
  ],
  mechanics: {
    noBanking: true,
    sharedSupplyPool: true,
    hpMultiplier: 1.5,
  },
  uniqueRewards: [
    { id: 95060, name: 'Sanguine scythe ornament kit', dropRate: '1/30' },
    { id: 95061, name: 'Holy ornament kit', dropRate: '1/30' },
    { id: 95063, name: 'Sanguine Justiciar faceguard', dropRate: '1/20' },
    { id: 95064, name: "Lil' Verzik", dropRate: '1/3000' },
  ],
};


// ##############################################################################
//
//   RAID 08 -- THE GAUNTLET
//   Region: Veilwood | Players: 1 (solo) | Difficulty: High-Extreme
//
//   Enter with NO gear. Gather resources, craft weapons and armour from
//   the environment, then fight the crystalline boss. Everything is made
//   on the fly. Speed and efficiency determine success.
//
//   3 phases: Gather (2 min) -> Prep (1 min) -> Boss fight
//
// ##############################################################################

// ==========================================================================
// RAID 08 ITEMS
// ==========================================================================

// -- Crystal Armour Seed --
// Used to craft crystal armour (helm, body, legs) or crystal weapons.
// The seed is the raw material; crafting it requires Smithing + Crafting.
items.define({
  id: 95070,
  name: 'Crystal armour seed',
  examine: 'A seed of living crystal from the Gauntlet. Sing to it at a crystal singing bowl to shape armour or weapons.',
  value: 4000000,
  category: 'crafting',
  tradeable: true,
  weight: 0.5,
});

// -- Crystal Helm --
items.define({
  id: 95071,
  name: 'Crystal helm',
  examine: 'A helm of living crystal. Strong across all styles but degrades with use.',
  value: 6000000,
  category: 'armour',
  equipSlot: 'head',
  tradeable: false,
  weight: 1.5,
  stats: {
    def_stab: 32, def_slash: 35, def_crush: 30,
    def_magic: 10, def_ranged: 30,
    ranged: 6, magic: 6,
    prayer: 1,
  },
  equipReqs: { defence: 70 },
  degrades: true,
  chargesMax: 2500,
});

// -- Crystal Body --
items.define({
  id: 95072,
  name: 'Crystal body',
  examine: 'A chestpiece of living crystal. Excellent hybrid armour that degrades.',
  value: 18000000,
  category: 'armour',
  equipSlot: 'body',
  tradeable: false,
  weight: 3.0,
  stats: {
    def_stab: 68, def_slash: 72, def_crush: 64,
    def_magic: 20, def_ranged: 65,
    ranged: 15, magic: 15,
    prayer: 3,
  },
  equipReqs: { defence: 70 },
  degrades: true,
  chargesMax: 2500,
});

// -- Crystal Legs --
items.define({
  id: 95073,
  name: 'Crystal legs',
  examine: 'Leg armour of living crystal. Solid hybrid defence that degrades.',
  value: 12000000,
  category: 'armour',
  equipSlot: 'legs',
  tradeable: false,
  weight: 2.5,
  stats: {
    def_stab: 48, def_slash: 52, def_crush: 44,
    def_magic: 14, def_ranged: 46,
    ranged: 10, magic: 10,
    prayer: 2,
  },
  equipReqs: { defence: 70 },
  degrades: true,
  chargesMax: 2500,
});

// -- Blade of Saeldor --
// BIS slash weapon. Highest slash accuracy and strength of any 1H weapon.
// Degrades and requires crystal shards to recharge. Expensive to maintain.
// Niche: slash-weak bosses and Slayer tasks. Competes with Ghrazi rapier (stab).
items.define({
  id: 95074,
  name: 'Blade of Saeldor',
  examine: 'A blade of unparalleled crystal clarity. The finest slash weapon ever crafted.',
  value: 30000000,
  category: 'weapon',
  equipSlot: 'weapon',
  tradeable: false,
  weight: 1.5,
  speed: 4,
  stats: { slash: 94, stab: 55, melee_strength: 89 },
  equipReqs: { attack: 80 },
  degrades: true,
  chargesMax: 10000,
});

// -- Enhanced Crystal Weapon Seed --
// Rare drop used to create the Blade of Saeldor or Bow of Faerdhinen.
items.define({
  id: 95075,
  name: 'Enhanced crystal weapon seed',
  examine: 'A rare seed of perfected crystal. Can be shaped into the Blade of Saeldor or the Bow of Faerdhinen.',
  value: 50000000,
  category: 'crafting',
  tradeable: true,
  weight: 0.5,
});

// -- Pet: Youngllef --
items.define({
  id: 95076,
  name: 'Youngllef',
  examine: 'A tiny crystalline creature. It hums softly.',
  value: 0,
  category: 'pet',
  tradeable: false,
  weight: 0,
});


// ==========================================================================
// RAID 08 NPCs
// ==========================================================================

// Gathering phase enemies -- Crystal Creatures (weak, drop resources)
npcs.defineNpc('gauntlet_crystal_bear', {
  name: 'Crystalline Bear',
  combat: 120,
  maxHp: 80,
  maxHit: 12,
  stats: { attack: 100, strength: 95, defence: 70 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee', size: 2,
  aggressive: false, aggroRange: 4, wanderRadius: 3, respawnTicks: 0,
  examine: 'A bear made of living crystal. It drops crystal shards when slain.',
  weakness: 'crush', tags: ['raid', 'gauntlet', 'crystal', 'beast'],
});
droptables.define('gauntlet_crystal_bear', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 480, max: 1440 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

npcs.defineNpc('gauntlet_crystal_dragon', {
  name: 'Crystalline Dragon',
  combat: 180,
  maxHp: 140,
  maxHit: 18,
  stats: { attack: 150, strength: 140, defence: 130 },
  attackSpeed: 5, attackRange: 5, attackStyle: 'magic', size: 3,
  aggressive: true, aggroRange: 6, wanderRadius: 2, respawnTicks: 0,
  examine: 'A dragon of pure crystal. Tougher than the other creatures. Drops better resources.',
  weakness: 'ranged', tags: ['raid', 'gauntlet', 'crystal', 'dragon', 'beast'],
});
droptables.define('gauntlet_crystal_dragon', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 720, max: 2160 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

npcs.defineNpc('gauntlet_crystal_dark_beast', {
  name: 'Crystalline Dark Beast',
  combat: 160,
  maxHp: 120,
  maxHit: 16,
  stats: { attack: 130, strength: 125, defence: 110 },
  attackSpeed: 4, attackRange: 4, attackStyle: 'ranged', size: 2,
  aggressive: true, aggroRange: 6, wanderRadius: 3, respawnTicks: 0,
  examine: 'A dark beast formed from crystal. It drops weaponframe components.',
  weakness: 'magic', tags: ['raid', 'gauntlet', 'crystal', 'beast'],
});
droptables.define('gauntlet_crystal_dark_beast', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 640, max: 1920 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });

// Boss: Crystalline Hunllef
boss('gauntlet_hunllef', {
  name: 'Crystalline Hunllef',
  combat: 560,
  maxHp: 600,
  maxHit: 46,
  stats: { attack: 350, strength: 340, defence: 300 },
  attackSpeed: 5, attackRange: 8, attackStyle: 'magic', size: 4,
  aggressive: true, aggroRange: 20, wanderRadius: 0, respawnTicks: 0,
  examine: 'The Hunllef. A crystalline predator of enormous power. Cycles between ranged and magic attacks.',
  weakness: 'current_style',
  tags: ['raid', 'gauntlet', 'crystal', 'boss', 'hunllef'],
  phases: [
    {
      name: 'Ranged Phase',
      description: 'The Hunllef fires crystalline bolts. Pray ranged. Stomps every 8 ticks creating a damaging floor tile. After 6 attacks, switches to magic.',
      attackStyle: 'ranged',
      attacksBeforeSwitch: 6,
      stompDamage: 25,
      stompInterval: 8,
    },
    {
      name: 'Magic Phase',
      description: 'The Hunllef casts crystal orbs. Pray magic. Tornado follows the player. After 6 attacks, switches to ranged.',
      attackStyle: 'magic',
      attacksBeforeSwitch: 6,
      tornadoDamage: 20,
    },
  ],
}, {
  always: [],
  main: [
    { id: 95070, name: 'Crystal armour seed', weight: 3, min: 1, max: 1 },
    { id: 95075, name: 'Enhanced crystal weapon seed', weight: 1, min: 1, max: 1 },
    { id: 101, name: 'Coins', weight: 12, min: 100000, max: 300000 },
    { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 },
  ],
}, 95076, 'Youngllef', 'A tiny crystalline creature. It hums softly.', 4000);


// ---------- Raid 08 Definition Object ----------
const RAID_08_GAUNTLET = {
  id: 'the_gauntlet',
  name: 'The Gauntlet',
  region: 'veilwood',
  description: 'Enter with NO gear. Gather resources from crystalline creatures, craft weapons and armour at singing bowls, then face the Crystalline Hunllef. Speed and efficiency are everything.',
  playerCount: { min: 1, max: 1 },
  difficulty: 'high',
  estimatedTime: '8-15 minutes',
  rooms: [
    {
      id: 'gathering_phase',
      name: 'Gathering Phase',
      description: 'Explore procedurally generated rooms. Kill crystal creatures for resources. Gather ore, herbs, fish, and crystal shards.',
      enemies: [
        { defId: 'gauntlet_crystal_bear', count: 6 },
        { defId: 'gauntlet_crystal_dragon', count: 2 },
        { defId: 'gauntlet_crystal_dark_beast', count: 4 },
      ],
      timeLimit: 120,
      mechanic: 'Kill creatures and gather nodes. Resources are used to craft gear in the prep phase.',
    },
    {
      id: 'prep_phase',
      name: 'Preparation Phase',
      description: 'Use singing bowls to craft crystal weapons and armour from gathered resources. Cook fish and mix potions.',
      timeLimit: 60,
      mechanic: 'Craft T1 or T2 weapons and armour. Better materials = stronger gear. Two different weapon types recommended.',
    },
    {
      id: 'hunllef_arena',
      name: 'The Hunllef',
      description: 'Face the Crystalline Hunllef with your crafted gear. It alternates between ranged and magic. Floor tiles degrade over time.',
      enemies: [{ defId: 'gauntlet_hunllef', count: 1 }],
      isBossRoom: true,
      mechanic: 'Pray correctly (ranged/magic cycles). Avoid floor tiles. Kill the tornado. Switch weapons when the Hunllef switches styles.',
    },
  ],
  mechanics: {
    noExternalGear: true,
    proceduralGeneration: true,
    resourceGathering: true,
    craftingRequired: true,
  },
  uniqueRewards: [
    { id: 95070, name: 'Crystal armour seed', dropRate: '1/8' },
    { id: 95075, name: 'Enhanced crystal weapon seed', dropRate: '1/50' },
    { id: 95076, name: 'Youngllef', dropRate: '1/4000' },
  ],
};


// ##############################################################################
//
//   RAID 09 -- ROOT OF THE WORLD TREE
//   Region: Veilwood | Players: 3-8 | Difficulty: High
//
//   Descend through the roots of the World Tree. The deeper you go, the
//   more nature magic buffs enemies. Fire is the counter. 5 rooms descending
//   from the surface to the tree's pulsing heart.
//
// ##############################################################################

// ==========================================================================
// RAID 09 ITEMS
// ==========================================================================

// -- Heartwood Staff --
// BIS nature magic staff. Autocast nature spells with +20% damage.
// But negative fire magic bonus. Niche: nature spell DPS, Farming guild,
// Veilwood content.
items.define({
  id: 95080,
  name: 'Heartwood staff',
  examine: 'A staff grown from the World Tree\'s heartwood. It channels nature magic with terrifying efficiency.',
  value: 25000000,
  category: 'weapon',
  equipSlot: 'weapon',
  tradeable: true,
  weight: 3.0,
  speed: 4,
  stats: { magic: 32, magic_strength: 20, prayer: 3 },
  equipReqs: { magic: 80 },
  passiveEffect: {
    name: 'Heartwood Channel',
    description: '+20% damage with nature spells. -10% damage with fire spells. Autocast nature spells.',
    natureDamageBonus: 0.20,
    fireDamagePenalty: 0.10,
    autocastType: 'nature',
  },
});

// -- Root Shield --
// BIS tank shield for magic encounters. Highest magic defence of any shield.
// Also provides HP regeneration (+2 HP every 30 seconds while in combat).
// Low melee defence compared to other tank shields.
items.define({
  id: 95081,
  name: 'Root shield',
  examine: 'A shield woven from World Tree roots. It drinks magic like soil drinks rain.',
  value: 20000000,
  category: 'armour',
  equipSlot: 'shield',
  tradeable: true,
  weight: 5.0,
  stats: {
    def_stab: 30, def_slash: 35, def_crush: 28,
    def_magic: 35, def_ranged: 25,
    prayer: 4,
  },
  equipReqs: { defence: 75 },
  passiveEffect: {
    name: 'Root Vitality',
    description: 'Regenerate 2 HP every 30 seconds while in combat. BIS magic defence.',
    combatHpRegen: 2,
    regenInterval: 50,
  },
});

// -- Vine Whip --
// Whip upgrade with +5% accuracy in the Veilwood region. Degrades.
// Slightly lower stats than Abyssal whip but with the region bonus
// it outperforms in Veilwood content.
items.define({
  id: 95082,
  name: 'Vine whip',
  examine: 'A whip grown from World Tree vines. It thrives in its native forest.',
  value: 8000000,
  category: 'weapon',
  equipSlot: 'weapon',
  tradeable: true,
  weight: 1.0,
  speed: 4,
  stats: { slash: 80, melee_strength: 82 },
  equipReqs: { attack: 75 },
  degrades: true,
  chargesMax: 10000,
  passiveEffect: {
    name: 'Forest Bond',
    description: '+5% accuracy when fighting in the Veilwood region.',
    regionBonus: 'veilwood',
    accuracyBonus: 0.05,
  },
});

// -- Pet: Sproutling --
items.define({
  id: 95083,
  name: 'Sproutling',
  examine: 'A tiny World Tree sprout. It tries to root itself wherever you stand still.',
  value: 0,
  category: 'pet',
  tradeable: false,
  weight: 0,
});


// ==========================================================================
// RAID 09 NPCs
// ==========================================================================

// Room 1: Vine Puzzle -- Vine Stalkers (fast, low HP)
npcs.defineNpc('worldtree_vine_stalker', {
  name: 'Vine Stalker',
  combat: 130,
  maxHp: 90,
  maxHit: 14,
  stats: { attack: 115, strength: 110, defence: 85 },
  attackSpeed: 3, attackRange: 1, attackStyle: 'melee', size: 1,
  aggressive: true, aggroRange: 8, wanderRadius: 0, respawnTicks: 0,
  examine: 'A plant creature that attacks with thorny vines. Weak to fire.',
  weakness: 'fire', tags: ['raid', 'worldtree', 'plant', 'nature'],
});

droptables.define('worldtree_vine_stalker', {
  always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 300, max: 1200 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }],
});

// Room 2: Root Guardian (mini-boss)
npcs.defineNpc('worldtree_root_guardian', {
  name: 'Root Guardian',
  combat: 280,
  maxHp: 350,
  maxHit: 30,
  stats: { attack: 220, strength: 210, defence: 230 },
  attackSpeed: 5, attackRange: 1, attackStyle: 'melee', size: 3,
  aggressive: true, aggroRange: 10, wanderRadius: 0, respawnTicks: 0,
  examine: 'A massive root creature that guards the deeper passages. Nearly immune to non-fire attacks.',
  weakness: 'fire', tags: ['raid', 'worldtree', 'plant', 'boss', 'nature'],
  resistance: 'ranged',
});

droptables.define('worldtree_root_guardian', {
  always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 5000, max: 15000 }, { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 }],
});

// Room 3: Fungal Chamber -- Spore Beasts
npcs.defineNpc('worldtree_spore_beast', {
  name: 'Spore Beast',
  combat: 200,
  maxHp: 180,
  maxHit: 22,
  stats: { attack: 170, strength: 165, defence: 150 },
  attackSpeed: 4, attackRange: 4, attackStyle: 'ranged', size: 2,
  aggressive: true, aggroRange: 10, wanderRadius: 0, respawnTicks: 0,
  examine: 'A fungal creature that releases toxic spores. The deeper you go, the stronger they become.',
  weakness: 'fire', tags: ['raid', 'worldtree', 'plant', 'fungus', 'nature'],
  poisonDamage: 6,
});

droptables.define('worldtree_spore_beast', {
  always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 1000, max: 4000 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }],
});

// Room 4: Core Beast
npcs.defineNpc('worldtree_core_beast', {
  name: 'Core Beast',
  combat: 360,
  maxHp: 450,
  maxHit: 38,
  stats: { attack: 280, strength: 270, defence: 260 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee', size: 3,
  aggressive: true, aggroRange: 12, wanderRadius: 0, respawnTicks: 0,
  examine: 'A creature that feeds on the World Tree\'s core energy. It hits harder the deeper you are.',
  weakness: 'fire', tags: ['raid', 'worldtree', 'beast', 'boss', 'nature'],
  resistance: 'magic',
});

droptables.define('worldtree_core_beast', {
  always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 8000, max: 25000 }, { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 }],
});

// Room 5 / Final Boss: World Tree Heart
boss('worldtree_heart', {
  name: 'The World Tree Heart',
  combat: 600,
  maxHp: 900,
  maxHit: 52,
  stats: { attack: 360, strength: 350, defence: 320 },
  attackSpeed: 5, attackRange: 8, attackStyle: 'magic', size: 5,
  aggressive: true, aggroRange: 20, wanderRadius: 0, respawnTicks: 0,
  examine: 'The corrupted heart of the World Tree. Nature magic gone mad. Only fire can purify it.',
  weakness: 'fire',
  tags: ['raid', 'worldtree', 'plant', 'boss', 'nature', 'heart'],
  resistance: 'nature',
  phases: [
    {
      name: 'Phase 1: Corruption',
      hpRange: [1.0, 0.60],
      description: 'The Heart fires nature blasts and spawns vine tendrils. Nature magic buffs it by 10% per 30 seconds. Use fire to counteract.',
      natureBuff: 0.10,
      natureBuffInterval: 50,
      tendrilDefId: 'worldtree_vine_stalker',
      tendrilCount: 3,
      tendrilInterval: 20,
    },
    {
      name: 'Phase 2: Overgrowth',
      hpRange: [0.60, 0.30],
      description: 'Roots erupt from the ground in 3x3 zones. Standing on roots heals the Heart by 20 HP/tick. Must burn roots with fire spells.',
      rootHealPerTick: 20,
      rootSize: 3,
      rootSpawnInterval: 12,
      maxHitOverride: 58,
    },
    {
      name: 'Phase 3: Purification',
      hpRange: [0.30, 0.0],
      description: 'The Heart is vulnerable. All nature buffs expire. It lashes out wildly. Enraged: attack speed +1. AoE pollen clouds deal 25 damage.',
      attackSpeedOverride: 4,
      maxHitOverride: 62,
      pollenCloudDamage: 25,
      pollenCloudSize: 4,
      pollenCloudInterval: 8,
    },
  ],
}, {
  always: [{ id: 107, name: 'Dragon bones', min: 3, max: 3 }],
  main: [
    { id: 95080, name: 'Heartwood staff', weight: 1, min: 1, max: 1 },
    { id: 95081, name: 'Root shield', weight: 1, min: 1, max: 1 },
    { id: 95082, name: 'Vine whip', weight: 2, min: 1, max: 1 },
    { id: 101, name: 'Coins', weight: 14, min: 100000, max: 350000 },
    { id: 0, name: 'Nothing', weight: 5, min: 0, max: 0 },
  ],
}, 95083, 'Sproutling', 'A tiny World Tree sprout. It tries to root itself wherever you stand still.', 3500);


// ---------- Raid 09 Definition Object ----------
const RAID_09_WORLD_TREE = {
  id: 'root_of_world_tree',
  name: 'Root of the World Tree',
  region: 'veilwood',
  description: 'Descend through the roots of the World Tree. Nature magic buffs enemies the deeper you go -- fire is the only counter. Reach the corrupted heart and purify it.',
  playerCount: { min: 3, max: 8 },
  difficulty: 'high',
  estimatedTime: '30-45 minutes',
  rooms: [
    { id: 'vine_puzzle', name: 'The Vine Web', description: 'Navigate a maze of living vines while fighting vine stalkers.', enemies: [{ defId: 'worldtree_vine_stalker', count: 8 }], mechanic: 'Vines block pathways. Burn them with fire spells or a hatchet.' },
    { id: 'root_guardian', name: 'The Root Guardian', description: 'A massive root creature blocks the descent.', enemies: [{ defId: 'worldtree_root_guardian', count: 1 }], mechanic: 'Nearly immune to non-fire attacks. Bring fire runes or a fire staff.' },
    { id: 'fungal_chamber', name: 'The Fungal Chamber', description: 'Spore beasts release toxic clouds. The spores heal enemies and damage players.', enemies: [{ defId: 'worldtree_spore_beast', count: 6 }], mechanic: 'Standing in spore clouds poisons you. Burn the fungus to clear the air.' },
    { id: 'core_beast', name: 'The Core Beast', description: 'A massive creature that feeds on the tree\'s energy.', enemies: [{ defId: 'worldtree_core_beast', count: 1 }], mechanic: 'Nature buff: +10% damage to the Core Beast every 30 seconds if you don\'t use fire.' },
    { id: 'world_tree_heart', name: 'The World Tree Heart', description: 'The corrupted heart of the World Tree. Nature magic incarnate, gone mad.', enemies: [{ defId: 'worldtree_heart', count: 1 }], isBossRoom: true },
  ],
  mechanics: {
    depthScaling: true,
    natureBuff: { perRoom: 0.10, counterElement: 'fire' },
    fireRequired: true,
  },
  uniqueRewards: [
    { id: 95080, name: 'Heartwood staff', dropRate: '1/25' },
    { id: 95081, name: 'Root shield', dropRate: '1/25' },
    { id: 95082, name: 'Vine whip', dropRate: '1/15' },
    { id: 95083, name: 'Sproutling', dropRate: '1/3500' },
  ],
};


// ##############################################################################
//
//   RAID 10 -- THE CRUCIBLE
//   Region: Sootworks | Players: 3-5 | Difficulty: High
//
//   A dwarven forge challenge deep in the Sootworks. 5 rooms, each a
//   different forge trial. Heat meter mechanic -- the environment gets
//   hotter and hotter. Must cool off or take escalating damage.
//
// ##############################################################################

// ==========================================================================
// RAID 10 ITEMS
// ==========================================================================

// -- Crucible Plate --
// BIS melee body for strength builds. Highest melee strength bonus of any
// body armour, but lower defence than Bandos chestplate.
// Niche: max hit setups, strength training, DPS-focused bossing.
items.define({
  id: 95090,
  name: 'Crucible plate',
  examine: 'A chestplate forged in the Crucible\'s hottest fire. It channels raw physical power.',
  value: 28000000,
  category: 'armour',
  equipSlot: 'body',
  tradeable: true,
  weight: 8.0,
  stats: {
    melee_strength: 10,
    def_stab: 58, def_slash: 62, def_crush: 55,
    def_magic: -15, def_ranged: 52,
    stab: 0, slash: 0, crush: 0,
  },
  equipReqs: { defence: 75, strength: 75 },
});

// -- Magma Helm --
// Fire-immune helm. Complete fire damage immunity while worn.
// Moderate combat stats. Niche: any content with fire (dragons, TzHaar,
// Sootworks furnace rooms, lava environments).
items.define({
  id: 95091,
  name: 'Magma helm',
  examine: 'A helm forged from cooled magma. Fire cannot harm its wearer.',
  value: 15000000,
  category: 'armour',
  equipSlot: 'head',
  tradeable: true,
  weight: 3.0,
  stats: {
    def_stab: 28, def_slash: 30, def_crush: 26,
    def_magic: -4, def_ranged: 25,
    melee_strength: 2,
  },
  equipReqs: { defence: 70 },
  passiveEffect: {
    name: 'Magma Guard',
    description: 'Complete immunity to fire-type damage.',
    fireImmunity: true,
  },
});

// -- Forgemaster's Hammer --
// Melee weapon that doubles as a smithing tool. +10% Smithing XP while
// equipped. BIS crush accuracy for 1H weapons (ties with dragon warhammer).
items.define({
  id: 95092,
  name: "Forgemaster's hammer",
  examine: 'The personal hammer of the Crucible\'s forgemaster. It shapes metal and skulls with equal ease.',
  value: 12000000,
  category: 'weapon',
  equipSlot: 'weapon',
  tradeable: true,
  weight: 3.5,
  speed: 5,
  stats: { crush: 95, melee_strength: 85 },
  equipReqs: { attack: 70, smithing: 60 },
  passiveEffect: {
    name: 'Master Smith',
    description: '+10% Smithing XP while equipped. Can be used as a smithing hammer.',
    smithingXpBonus: 0.10,
    smithingTool: true,
  },
});

// -- Pet: Smoldering Coal --
items.define({
  id: 95093,
  name: 'Smoldering coal',
  examine: 'A tiny sentient coal from the Crucible. It leaves small scorch marks wherever it rolls.',
  value: 0,
  category: 'pet',
  tradeable: false,
  weight: 0,
});


// ==========================================================================
// RAID 10 NPCs
// ==========================================================================

// Room 1: Anvil Test -- Animated Armour
npcs.defineNpc('crucible_animated_armour', {
  name: 'Animated Armour',
  combat: 160,
  maxHp: 150,
  maxHit: 18,
  stats: { attack: 140, strength: 130, defence: 160 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee', size: 1,
  aggressive: true, aggroRange: 8, wanderRadius: 0, respawnTicks: 0,
  examine: 'A suit of armour animated by forge magic. It fights with mechanical precision.',
  weakness: 'crush', tags: ['raid', 'crucible', 'construct', 'armoured'],
  resistance: 'stab',
});

droptables.define('crucible_animated_armour', {
  always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 500, max: 2000 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }],
});

// Room 2: Lava Crossing -- Lava Elementals
npcs.defineNpc('crucible_lava_elemental', {
  name: 'Lava Elemental',
  combat: 200,
  maxHp: 180,
  maxHit: 24,
  stats: { attack: 170, strength: 180, defence: 140 },
  attackSpeed: 5, attackRange: 4, attackStyle: 'magic', size: 2,
  aggressive: true, aggroRange: 10, wanderRadius: 0, respawnTicks: 0,
  examine: 'A sentient lava flow. Its touch scorches everything.',
  weakness: 'water', tags: ['raid', 'crucible', 'elemental', 'fire'],
  resistance: 'fire',
});

droptables.define('crucible_lava_elemental', {
  always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 1000, max: 3000 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }],
});

// Room 3: Golem Arena -- Forge Golems
npcs.defineNpc('crucible_forge_golem', {
  name: 'Forge Golem',
  combat: 280,
  maxHp: 350,
  maxHit: 30,
  stats: { attack: 230, strength: 240, defence: 250 },
  attackSpeed: 5, attackRange: 1, attackStyle: 'melee', size: 3,
  aggressive: true, aggroRange: 8, wanderRadius: 0, respawnTicks: 0,
  examine: 'A golem forged from molten metal. Extremely tanky. Weak to water magic.',
  weakness: 'water', tags: ['raid', 'crucible', 'construct', 'golem', 'boss'],
  resistance: 'melee',
});

droptables.define('crucible_forge_golem', {
  always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 5000, max: 15000 }, { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 }],
});

// Room 4: Steam Maze -- Steam Vents (trap NPC, ranged)
npcs.defineNpc('crucible_steam_vent', {
  name: 'Steam Vent',
  combat: 150,
  maxHp: 100,
  maxHit: 20,
  stats: { attack: 130, strength: 120, defence: 100 },
  attackSpeed: 6, attackRange: 6, attackStyle: 'ranged', size: 1,
  aggressive: true, aggroRange: 8, wanderRadius: 0, respawnTicks: 0,
  examine: 'A pressurized steam vent. It blasts scalding steam at intruders.',
  weakness: 'crush', tags: ['raid', 'crucible', 'construct', 'trap'],
  canMove: false,
});

droptables.define('crucible_steam_vent', {
  always: [], main: [{ id: 0, name: 'Nothing', weight: 1, min: 0, max: 0 }],
});

// Room 5 / Final Boss: The Forgemaster
boss('crucible_forgemaster', {
  name: 'The Forgemaster',
  combat: 520,
  maxHp: 700,
  maxHit: 48,
  stats: { attack: 330, strength: 320, defence: 290 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee', size: 2,
  aggressive: true, aggroRange: 15, wanderRadius: 0, respawnTicks: 0,
  examine: 'The master of the Crucible. A dwarven spirit bound to eternal smithing. His hammer strikes shatter the earth.',
  weakness: 'magic',
  tags: ['raid', 'crucible', 'boss', 'dwarf', 'construct'],
  resistance: 'ranged',
  phases: [
    {
      name: 'Phase 1: Hammer Strikes',
      hpRange: [1.0, 0.60],
      description: 'The Forgemaster strikes with his hammer. Each hit increases the heat meter by 5. Dodge the shockwave lines.',
      heatPerHit: 5,
      shockwaveDamage: 30,
      shockwaveWidth: 1,
      shockwaveLength: 8,
    },
    {
      name: 'Phase 2: Molten Pour',
      hpRange: [0.60, 0.30],
      description: 'The Forgemaster pours molten metal across the arena. Lava pools form. Heat meter climbs faster (+8 per hit).',
      heatPerHit: 8,
      lavaDamage: 20,
      lavaPoolCount: 4,
      lavaPoolInterval: 10,
      maxHitOverride: 54,
    },
    {
      name: 'Phase 3: Crucible Ignition',
      hpRange: [0.30, 0.0],
      description: 'The entire arena heats up. Heat meter climbs passively (+3 per tick). Cool down at water barrels or die. Enraged attacks.',
      passiveHeatPerTick: 3,
      attackSpeedOverride: 3,
      maxHitOverride: 60,
      waterBarrelCooldown: 50,
    },
  ],
}, {
  always: [{ id: 107, name: 'Dragon bones', min: 2, max: 2 }],
  main: [
    { id: 95090, name: 'Crucible plate', weight: 1, min: 1, max: 1 },
    { id: 95091, name: 'Magma helm', weight: 1, min: 1, max: 1 },
    { id: 95092, name: "Forgemaster's hammer", weight: 2, min: 1, max: 1 },
    { id: 101, name: 'Coins', weight: 14, min: 100000, max: 300000 },
    { id: 0, name: 'Nothing', weight: 5, min: 0, max: 0 },
  ],
}, 95093, 'Smoldering coal', 'A tiny sentient coal from the Crucible. It leaves small scorch marks wherever it rolls.', 3500);


// ---------- Raid 10 Definition Object ----------
const RAID_10_CRUCIBLE = {
  id: 'the_crucible',
  name: 'The Crucible',
  region: 'sootworks',
  description: 'A dwarven forge challenge deep in the Sootworks. Five rooms of increasingly brutal forge trials. The heat meter climbs constantly -- cool off or burn.',
  playerCount: { min: 3, max: 5 },
  difficulty: 'high',
  estimatedTime: '25-40 minutes',
  rooms: [
    { id: 'anvil_test', name: 'The Anvil Test', description: 'Animated armour attacks. Forge-based puzzle.', enemies: [{ defId: 'crucible_animated_armour', count: 5 }], mechanic: 'Heat meter starts. Armour must be defeated to unlock the next door.' },
    { id: 'lava_crossing', name: 'The Lava Crossing', description: 'Cross a room of lava flows while fighting lava elementals.', enemies: [{ defId: 'crucible_lava_elemental', count: 4 }], mechanic: 'Lava tiles deal 10 damage per tick. Safe tiles shift every 30 seconds.' },
    { id: 'golem_arena', name: 'The Golem Arena', description: 'Two forge golems in a circular arena.', enemies: [{ defId: 'crucible_forge_golem', count: 2 }], mechanic: 'Golems heal each other if within 5 tiles. Keep them separated.' },
    { id: 'steam_maze', name: 'The Steam Maze', description: 'Navigate a maze of pressurized steam vents.', enemies: [{ defId: 'crucible_steam_vent', count: 8 }], mechanic: 'Vents blast steam in cardinal directions. Destroy them or dodge their blasts.' },
    { id: 'forgemaster', name: 'The Forgemaster', description: 'The spirit of the Crucible\'s creator.', enemies: [{ defId: 'crucible_forgemaster', count: 1 }], isBossRoom: true },
  ],
  mechanics: {
    heatMeter: { maxHeat: 100, heatDamageThreshold: 60, heatDamagePerTick: 5, cooldownSources: ['water_barrel', 'ice_spell'] },
  },
  uniqueRewards: [
    { id: 95090, name: 'Crucible plate', dropRate: '1/25' },
    { id: 95091, name: 'Magma helm', dropRate: '1/25' },
    { id: 95092, name: "Forgemaster's hammer", dropRate: '1/15' },
    { id: 95093, name: 'Smoldering coal', dropRate: '1/3500' },
  ],
};


// ##############################################################################
//
//   RAID 11 -- THE DEEP ENGINE
//   Region: Sootworks | Players: 4-8 | Difficulty: Extreme
//
//   A massive broken clockwork machine in the deepest Sootworks. Players
//   navigate 6 rooms of malfunctioning components, operating levers in
//   correct sequence to disable traps. Teamwork is mandatory.
//
// ##############################################################################

// ==========================================================================
// RAID 11 ITEMS
// ==========================================================================

// -- Architect's Blueprint --
// Tradeable item used to craft BIS construction furniture.
// Not equipment itself but the recipe for the best construction items.
items.define({
  id: 95100,
  name: "Architect's blueprint",
  examine: 'A complex blueprint from the Deep Engine\'s architect. Used to build advanced construction items.',
  value: 15000000,
  category: 'crafting',
  tradeable: true,
  weight: 0.5,
});

// -- Engine Core --
// Ranged weapon that fires mechanical bolts. Highest ranged strength of
// any crossbow, but requires special "mechanical bolts" as ammo (crafted
// from Sootworks materials). Slow but devastating.
items.define({
  id: 95101,
  name: 'Engine core',
  examine: 'A weapon salvaged from the Deep Engine. It fires precision-machined bolts with extreme force.',
  value: 22000000,
  category: 'weapon',
  equipSlot: 'weapon',
  tradeable: true,
  weight: 4.0,
  speed: 6,
  stats: { ranged: 100, ranged_strength: 105 },
  equipReqs: { ranged: 80 },
  ammoType: 'mechanical_bolt',
  passiveEffect: {
    name: 'Precision Engineering',
    description: 'Each bolt has a 15% chance to ignore 50% of the target\'s ranged defence.',
    armourPierceChance: 0.15,
    armourPiercePercent: 0.50,
  },
});

// -- Clockwork Gloves --
// Gloves with +2 attack speed on ranged while worn (effectively -1 tick
// on ranged weapon speed). No melee or magic benefit.
// Niche: ranged DPS in situations where attack speed matters more than accuracy.
items.define({
  id: 95102,
  name: 'Clockwork gloves',
  examine: 'Gloves fitted with tiny clockwork mechanisms. They accelerate the loading of ranged weapons.',
  value: 18000000,
  category: 'armour',
  equipSlot: 'hands',
  tradeable: true,
  weight: 0.5,
  stats: {
    ranged: 10, ranged_strength: 2,
    def_stab: 2, def_slash: 2, def_crush: 2,
  },
  equipReqs: { ranged: 75 },
  passiveEffect: {
    name: 'Clockwork Loader',
    description: 'Ranged weapon attack speed improved by 1 tick.',
    rangedSpeedBonus: -1,
  },
});

// -- Mechanical Bolts (ammo for Engine Core) --
items.define({
  id: 95103,
  name: 'Mechanical bolt',
  examine: 'A precision-machined bolt designed for the Engine Core. Devastating on impact.',
  value: 500,
  category: 'ammo',
  tradeable: true,
  stackable: true,
  weight: 0,
  stats: { ranged_strength: 12 },
});

// -- Pet: Mini Automaton --
items.define({
  id: 95104,
  name: 'Mini automaton',
  examine: 'A tiny clockwork automaton from the Deep Engine. It follows you around, clicking and whirring.',
  value: 0,
  category: 'pet',
  tradeable: false,
  weight: 0,
});


// ==========================================================================
// RAID 11 NPCs
// ==========================================================================

// Room 1: Gear Room -- Gear Beasts (mechanical)
npcs.defineNpc('engine_gear_beast', {
  name: 'Gear Beast',
  combat: 190,
  maxHp: 160,
  maxHit: 20,
  stats: { attack: 160, strength: 155, defence: 170 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee', size: 2,
  aggressive: true, aggroRange: 8, wanderRadius: 0, respawnTicks: 0,
  examine: 'A creature made of interlocking gears. It grinds anything in its path.',
  weakness: 'magic', tags: ['raid', 'engine', 'construct', 'mechanical'],
  resistance: 'ranged',
});

droptables.define('engine_gear_beast', {
  always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 800, max: 3000 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }],
});

// Room 2: Piston Corridor -- Pistons (trap) + Cog Crawlers
npcs.defineNpc('engine_cog_crawler', {
  name: 'Cog Crawler',
  combat: 160,
  maxHp: 120,
  maxHit: 16,
  stats: { attack: 140, strength: 130, defence: 120 },
  attackSpeed: 3, attackRange: 1, attackStyle: 'melee', size: 1,
  aggressive: true, aggroRange: 10, wanderRadius: 0, respawnTicks: 0,
  examine: 'A spider-like machine that crawls along the walls. Fast and annoying.',
  weakness: 'crush', tags: ['raid', 'engine', 'construct', 'mechanical'],
});

droptables.define('engine_cog_crawler', {
  always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 400, max: 1500 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }],
});

// Room 3: Furnace -- Furnace Guardian
npcs.defineNpc('engine_furnace_guardian', {
  name: 'Furnace Guardian',
  combat: 300,
  maxHp: 400,
  maxHit: 34,
  stats: { attack: 240, strength: 250, defence: 230 },
  attackSpeed: 5, attackRange: 5, attackStyle: 'magic', size: 3,
  aggressive: true, aggroRange: 12, wanderRadius: 0, respawnTicks: 0,
  examine: 'A construct powered by the furnace. It launches fireballs and heats the room.',
  weakness: 'water', tags: ['raid', 'engine', 'construct', 'boss', 'fire'],
  resistance: 'fire',
});

droptables.define('engine_furnace_guardian', {
  always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 5000, max: 15000 }, { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 }],
});

// Room 4: Control Room -- Malfunctioning Turrets (ranged, stationary)
npcs.defineNpc('engine_turret', {
  name: 'Defense Turret',
  combat: 200,
  maxHp: 150,
  maxHit: 22,
  stats: { attack: 180, strength: 170, defence: 160 },
  attackSpeed: 4, attackRange: 8, attackStyle: 'ranged', size: 1,
  aggressive: true, aggroRange: 10, wanderRadius: 0, respawnTicks: 0,
  examine: 'A malfunctioning defense turret. It fires at anything that moves.',
  weakness: 'crush', tags: ['raid', 'engine', 'construct', 'mechanical', 'trap'],
  canMove: false,
});

droptables.define('engine_turret', {
  always: [], main: [{ id: 0, name: 'Nothing', weight: 1, min: 0, max: 0 }],
});

// Room 5: Engine Core -- Core Golem (mini-boss)
npcs.defineNpc('engine_core_golem', {
  name: 'Core Golem',
  combat: 380,
  maxHp: 500,
  maxHit: 40,
  stats: { attack: 280, strength: 290, defence: 270 },
  attackSpeed: 5, attackRange: 1, attackStyle: 'melee', size: 4,
  aggressive: true, aggroRange: 10, wanderRadius: 0, respawnTicks: 0,
  examine: 'A massive golem powered by the engine\'s core. It must be shut down via the control panel.',
  weakness: 'magic', tags: ['raid', 'engine', 'construct', 'golem', 'boss'],
  resistance: 'melee',
});

droptables.define('engine_core_golem', {
  always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 10000, max: 25000 }, { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 }],
});

// Room 6 / Final Boss: The Architect
boss('engine_architect', {
  name: 'The Architect',
  combat: 580,
  maxHp: 850,
  maxHit: 52,
  stats: { attack: 350, strength: 340, defence: 310 },
  attackSpeed: 4, attackRange: 8, attackStyle: 'magic', size: 3,
  aggressive: true, aggroRange: 15, wanderRadius: 0, respawnTicks: 0,
  examine: 'The creator of the Deep Engine. A dwarven genius driven mad by his creation. He commands the machine itself.',
  weakness: 'melee',
  tags: ['raid', 'engine', 'boss', 'dwarf', 'construct', 'architect'],
  resistance: 'ranged',
  phases: [
    {
      name: 'Phase 1: Control',
      hpRange: [1.0, 0.65],
      description: 'The Architect commands turrets and gear beasts. Players must operate levers in sequence (A-C-B-D) to disable the turrets. Wrong sequence = 30 damage.',
      leverSequence: ['A', 'C', 'B', 'D'],
      wrongLeverDamage: 30,
      turretDefId: 'engine_turret',
      turretCount: 4,
    },
    {
      name: 'Phase 2: Overdrive',
      hpRange: [0.65, 0.35],
      description: 'The Engine goes into overdrive. Pistons slam randomly. Gears rotate on the floor. The Architect teleports every 15 seconds.',
      pistonDamage: 25,
      pistonInterval: 6,
      teleportInterval: 25,
      maxHitOverride: 58,
    },
    {
      name: 'Phase 3: Meltdown',
      hpRange: [0.35, 0.0],
      description: 'The Engine is melting down. 3-minute timer to kill the Architect or the room explodes. Constant environmental damage.',
      meltdownTimer: 180,
      environmentalDamage: 8,
      environmentalInterval: 5,
      attackSpeedOverride: 3,
      maxHitOverride: 64,
    },
  ],
}, {
  always: [{ id: 107, name: 'Dragon bones', min: 3, max: 3 }],
  main: [
    { id: 95100, name: "Architect's blueprint", weight: 1, min: 1, max: 1 },
    { id: 95101, name: 'Engine core', weight: 1, min: 1, max: 1 },
    { id: 95102, name: 'Clockwork gloves', weight: 2, min: 1, max: 1 },
    { id: 95103, name: 'Mechanical bolt', weight: 5, min: 100, max: 500 },
    { id: 101, name: 'Coins', weight: 12, min: 150000, max: 400000 },
    { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 },
  ],
}, 95104, 'Mini automaton', 'A tiny clockwork automaton from the Deep Engine. It follows you around, clicking and whirring.', 4000);


// ---------- Raid 11 Definition Object ----------
const RAID_11_DEEP_ENGINE = {
  id: 'the_deep_engine',
  name: 'The Deep Engine',
  region: 'sootworks',
  description: 'A massive broken clockwork machine in the deepest Sootworks. Navigate 6 rooms of malfunctioning components. Operate levers in the correct sequence to disable traps. Teamwork is mandatory.',
  playerCount: { min: 4, max: 8 },
  difficulty: 'extreme',
  estimatedTime: '40-60 minutes',
  rooms: [
    { id: 'gear_room', name: 'The Gear Room', description: 'Interlocking gears fill the room. Gear beasts patrol.', enemies: [{ defId: 'engine_gear_beast', count: 5 }], mechanic: 'Rotating gears on the floor deal 10 damage if touched. Navigate around them.' },
    { id: 'piston_corridor', name: 'The Piston Corridor', description: 'Pistons slam down at regular intervals. Cog crawlers infest the walls.', enemies: [{ defId: 'engine_cog_crawler', count: 8 }], mechanic: 'Pistons slam every 4 ticks, dealing 25 damage. Time your movement between slams.' },
    { id: 'furnace', name: 'The Furnace', description: 'A massive furnace powers the engine. Its guardian protects it.', enemies: [{ defId: 'engine_furnace_guardian', count: 1 }], mechanic: 'Heat meter mechanic. The furnace heats the room. Cool off at vents.' },
    { id: 'control_room', name: 'The Control Room', description: 'Malfunctioning turrets fire at everything. Operate the control panel to shut them down.', enemies: [{ defId: 'engine_turret', count: 6 }], mechanic: 'Lever puzzle: correct sequence shuts down turrets. Wrong sequence deals 30 damage and resets.' },
    { id: 'engine_core', name: 'The Engine Core', description: 'The core golem powers the machine. Shut it down via the control panel while fighting it.', enemies: [{ defId: 'engine_core_golem', count: 1 }], mechanic: 'Must operate 4 shutdown levers around the room while tanking the golem. Requires coordination.' },
    { id: 'architect_chamber', name: 'The Architect\'s Chamber', description: 'The mad dwarven architect who built the engine. He commands the machine against you.', enemies: [{ defId: 'engine_architect', count: 1 }], isBossRoom: true },
  ],
  mechanics: {
    leverPuzzles: true,
    teamCoordination: true,
    environmentalHazards: true,
  },
  uniqueRewards: [
    { id: 95100, name: "Architect's blueprint", dropRate: '1/25' },
    { id: 95101, name: 'Engine core', dropRate: '1/25' },
    { id: 95102, name: 'Clockwork gloves', dropRate: '1/15' },
    { id: 95104, name: 'Mini automaton', dropRate: '1/4000' },
  ],
};


// ##############################################################################
//
//   RAID 12 -- THE SUNKEN TEMPLE
//   Region: Saltbrine Reach | Players: 3-5 | Difficulty: High
//
//   An underwater temple. Oxygen management is the core mechanic.
//   Players must find air pockets or use oxygen potions. Running out
//   of oxygen means rapid, escalating damage.
//
//   4 rooms: Kelp Maze -> Guardian Fish -> Treasure Vault -> Sea Priest
//
// ##############################################################################

// ==========================================================================
// RAID 12 ITEMS
// ==========================================================================

// -- Trident of the Depths --
// BIS magic weapon with healing. Each hit has a 25% chance to heal for 8 HP.
// Higher magic accuracy than standard trident. Requires death runes + chaos runes.
// Niche: sustained magic DPS with self-healing.
items.define({
  id: 95110,
  name: 'Trident of the Depths',
  examine: 'A trident salvaged from the sunken temple. It channels the ocean\'s healing power.',
  value: 25000000,
  category: 'weapon',
  equipSlot: 'weapon',
  tradeable: true,
  weight: 2.5,
  speed: 4,
  stats: { magic: 30, magic_strength: 18 },
  equipReqs: { magic: 82 },
  ammoType: 'death_chaos_rune',
  ammoCost: { death: 1, chaos: 5 },
  passiveEffect: {
    name: 'Ocean Healing',
    description: '25% chance per hit to heal for 8 HP.',
    healOnHitChance: 0.25,
    healOnHitFlat: 8,
  },
});

// -- Coral Helm --
items.define({
  id: 95111,
  name: 'Coral helm',
  examine: 'A helm grown from deep-sea coral. BIS magic tank headgear.',
  value: 10000000,
  category: 'armour',
  equipSlot: 'head',
  tradeable: true,
  weight: 2.0,
  stats: {
    magic: 8, prayer: 2,
    def_stab: 20, def_slash: 22, def_crush: 18,
    def_magic: 15, def_ranged: 18,
  },
  equipReqs: { magic: 75, defence: 75 },
  setId: 'coral',
});

// -- Coral Body --
items.define({
  id: 95112,
  name: 'Coral body',
  examine: 'A chestpiece of living coral. Strong magic defence with moderate melee protection.',
  value: 22000000,
  category: 'armour',
  equipSlot: 'body',
  tradeable: true,
  weight: 4.0,
  stats: {
    magic: 22, prayer: 4,
    def_stab: 45, def_slash: 48, def_crush: 42,
    def_magic: 35, def_ranged: 40,
  },
  equipReqs: { magic: 75, defence: 75 },
  setId: 'coral',
});

// -- Coral Legs --
items.define({
  id: 95113,
  name: 'Coral legs',
  examine: 'Leg armour of living coral. Completes the coral set for the ultimate magic tank.',
  value: 15000000,
  category: 'armour',
  equipSlot: 'legs',
  tradeable: true,
  weight: 3.0,
  stats: {
    magic: 14, prayer: 3,
    def_stab: 32, def_slash: 35, def_crush: 30,
    def_magic: 25, def_ranged: 28,
  },
  equipReqs: { magic: 75, defence: 75 },
  setId: 'coral',
  setEffect: {
    name: 'Coral Shell',
    pieces: ['coral_helm', 'coral_body', 'coral_legs'],
    description: 'Full set: +10% magic defence. Incoming magic damage reduced by 8%.',
    magicDefenceBonus: 0.10,
    magicDamageReduction: 0.08,
  },
});

// -- Pet: Baby Kraken --
items.define({
  id: 95114,
  name: 'Baby kraken',
  examine: 'A tiny kraken from the sunken temple. It squirts water at people you don\'t like.',
  value: 0,
  category: 'pet',
  tradeable: false,
  weight: 0,
});


// ==========================================================================
// RAID 12 NPCs
// ==========================================================================

// Room 1: Kelp Maze -- Kelp Tanglers
npcs.defineNpc('sunken_kelp_tangler', {
  name: 'Kelp Tangler',
  combat: 130,
  maxHp: 100,
  maxHit: 14,
  stats: { attack: 110, strength: 105, defence: 90 },
  attackSpeed: 4, attackRange: 3, attackStyle: 'melee', size: 2,
  aggressive: true, aggroRange: 6, wanderRadius: 0, respawnTicks: 0,
  examine: 'A mass of animated kelp. It wraps around victims and drags them deeper.',
  weakness: 'slash', tags: ['raid', 'sunken', 'plant', 'aquatic'],
});

droptables.define('sunken_kelp_tangler', {
  always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 300, max: 1200 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }],
});

// Room 2: Guardian Fish -- Abyssal Guardian
npcs.defineNpc('sunken_abyssal_guardian', {
  name: 'Abyssal Guardian',
  combat: 300,
  maxHp: 350,
  maxHit: 32,
  stats: { attack: 240, strength: 230, defence: 220 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee', size: 3,
  aggressive: true, aggroRange: 10, wanderRadius: 0, respawnTicks: 0,
  examine: 'A massive deep-sea fish that guards the inner temple. Its jaw can crush coral.',
  weakness: 'magic', tags: ['raid', 'sunken', 'beast', 'fish', 'boss', 'aquatic'],
  resistance: 'ranged',
});

droptables.define('sunken_abyssal_guardian', {
  always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 5000, max: 15000 }, { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 }],
});

// Room 3: Treasure Vault -- Animated Treasures (fight to open chests)
npcs.defineNpc('sunken_animated_chest', {
  name: 'Animated Treasure',
  combat: 180,
  maxHp: 200,
  maxHit: 22,
  stats: { attack: 150, strength: 160, defence: 180 },
  attackSpeed: 5, attackRange: 1, attackStyle: 'melee', size: 2,
  aggressive: false, aggroRange: 3, wanderRadius: 0, respawnTicks: 0,
  examine: 'A treasure chest animated by the temple\'s magic. It bites.',
  weakness: 'crush', tags: ['raid', 'sunken', 'construct', 'aquatic'],
  resistance: 'magic',
});

droptables.define('sunken_animated_chest', {
  always: [{ id: 101, name: 'Coins', min: 10000, max: 50000 }],
  main: [{ id: 0, name: 'Nothing', weight: 1, min: 0, max: 0 }],
});

// Room 4 / Final Boss: The Sea Priest
boss('sunken_sea_priest', {
  name: 'The Sea Priest',
  combat: 540,
  maxHp: 750,
  maxHit: 48,
  stats: { attack: 330, strength: 310, defence: 290 },
  attackSpeed: 4, attackRange: 8, attackStyle: 'magic', size: 2,
  aggressive: true, aggroRange: 15, wanderRadius: 0, respawnTicks: 0,
  examine: 'The high priest of the sunken temple. He commands the ocean itself. His magic drains oxygen from the room.',
  weakness: 'ranged',
  tags: ['raid', 'sunken', 'boss', 'priest', 'aquatic'],
  resistance: 'melee',
  phases: [
    {
      name: 'Phase 1: Tidal Wave',
      hpRange: [1.0, 0.60],
      description: 'The Sea Priest casts water magic. Tidal waves sweep across the room every 12 ticks (dodge by moving perpendicular). Oxygen drains at normal rate.',
      tidalWaveDamage: 35,
      tidalWaveInterval: 12,
      oxygenDrainRate: 1,
    },
    {
      name: 'Phase 2: Whirlpool',
      hpRange: [0.60, 0.30],
      description: 'Whirlpools appear and pull players toward the center. Oxygen drains faster (2x). Air pocket count reduced.',
      whirlpoolDamage: 20,
      whirlpoolPullStrength: 2,
      oxygenDrainRate: 2,
      maxHitOverride: 54,
    },
    {
      name: 'Phase 3: Drowning',
      hpRange: [0.30, 0.0],
      description: 'The room floods completely. No more air pockets. Oxygen drains at 3x. The Sea Priest attacks faster. Kill him before you drown.',
      oxygenDrainRate: 3,
      noAirPockets: true,
      attackSpeedOverride: 3,
      maxHitOverride: 58,
    },
  ],
}, {
  always: [{ id: 107, name: 'Dragon bones', min: 2, max: 2 }],
  main: [
    { id: 95110, name: 'Trident of the Depths', weight: 1, min: 1, max: 1 },
    { id: 95111, name: 'Coral helm', weight: 1, min: 1, max: 1 },
    { id: 95112, name: 'Coral body', weight: 1, min: 1, max: 1 },
    { id: 95113, name: 'Coral legs', weight: 1, min: 1, max: 1 },
    { id: 101, name: 'Coins', weight: 14, min: 100000, max: 300000 },
    { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 },
  ],
}, 95114, 'Baby kraken', 'A tiny kraken from the sunken temple. It squirts water at people you don\'t like.', 3500);


// ---------- Raid 12 Definition Object ----------
const RAID_12_SUNKEN_TEMPLE = {
  id: 'the_sunken_temple',
  name: 'The Sunken Temple',
  region: 'saltbrine_reach',
  description: 'Explore a flooded temple beneath Saltbrine Reach. Oxygen management is everything -- find air pockets, use oxygen potions, or drown.',
  playerCount: { min: 3, max: 5 },
  difficulty: 'high',
  estimatedTime: '25-40 minutes',
  rooms: [
    { id: 'kelp_maze', name: 'The Kelp Maze', description: 'Navigate through animated kelp that tangles and slows.', enemies: [{ defId: 'sunken_kelp_tangler', count: 6 }], mechanic: 'Kelp slows movement by 50%. Find air pockets to refill oxygen.' },
    { id: 'guardian_fish', name: 'The Guardian Fish', description: 'A massive abyssal fish guards the passage.', enemies: [{ defId: 'sunken_abyssal_guardian', count: 1 }], mechanic: 'The guardian creates water jets that push players away. Stay close for melee or use ranged/magic.' },
    { id: 'treasure_vault', name: 'The Treasure Vault', description: 'Animated treasure chests protect the temple\'s riches.', enemies: [{ defId: 'sunken_animated_chest', count: 4 }], mechanic: 'Each chest drops supplies when killed. Limited air pockets in this room.' },
    { id: 'sea_priest', name: 'The Sea Priest\'s Sanctum', description: 'The high priest of the sunken temple commands the ocean against you.', enemies: [{ defId: 'sunken_sea_priest', count: 1 }], isBossRoom: true },
  ],
  mechanics: {
    oxygenBar: { maxOxygen: 100, drainPerTick: 1, drowningDamage: 10, drowningInterval: 3, airPocketRefill: 50 },
    oxygenPotions: { brewable: true, herbloreLevel: 55, refillAmount: 40 },
  },
  uniqueRewards: [
    { id: 95110, name: 'Trident of the Depths', dropRate: '1/25' },
    { id: 95111, name: 'Coral helm', dropRate: '1/23' },
    { id: 95112, name: 'Coral body', dropRate: '1/23' },
    { id: 95113, name: 'Coral legs', dropRate: '1/23' },
    { id: 95114, name: 'Baby kraken', dropRate: '1/3500' },
  ],
};


// ##############################################################################
//
//   RAID 13 -- TEMPEST OF SALTBRINE
//   Region: Saltbrine Reach | Players: 8-20 | Difficulty: Mid-High
//
//   A world event raid. A massive storm hits Saltbrine. Players repair ships,
//   rescue NPCs, fight sea monsters, and kill the Storm Elemental.
//   Phases progress on a timer regardless of player actions.
//
// ##############################################################################

// ==========================================================================
// RAID 13 ITEMS
// ==========================================================================

// -- Storm Bow --
// Ranged weapon with a lightning proc. 20% chance per hit to strike the
// target with lightning for 15 bonus damage. BIS for multi-target content.
items.define({
  id: 95120,
  name: 'Storm bow',
  examine: 'A bow charged with the fury of the tempest. Its arrows carry lightning.',
  value: 18000000,
  category: 'weapon',
  equipSlot: 'weapon',
  twoHanded: true,
  tradeable: true,
  weight: 2.0,
  speed: 4,
  stats: { ranged: 85, ranged_strength: 70 },
  equipReqs: { ranged: 75 },
  passiveEffect: {
    name: 'Lightning Strike',
    description: '20% chance per hit to deal 15 bonus lightning damage to the target.',
    lightningProcChance: 0.20,
    lightningDamage: 15,
  },
});

// -- Tempest Boots --
// BIS ranged boots with +1 movement speed. Fastest boots in the game.
// Trade-off: lower defence than pegasian boots but the speed is invaluable.
items.define({
  id: 95121,
  name: 'Tempest boots',
  examine: 'Boots infused with storm energy. The wearer moves with the speed of wind.',
  value: 20000000,
  category: 'armour',
  equipSlot: 'feet',
  tradeable: true,
  weight: 0.5,
  stats: {
    ranged: 8, ranged_strength: 2,
    def_stab: 5, def_slash: 5, def_crush: 5,
    def_magic: 5, def_ranged: 5,
  },
  equipReqs: { ranged: 75, defence: 70 },
  passiveEffect: {
    name: 'Storm Speed',
    description: '+1 movement speed (run energy drains 30% slower).',
    movementSpeedBonus: 1,
    runEnergyDrainReduction: 0.30,
  },
});

// -- Sailor's Charm --
// Amulet that provides +10% accuracy and damage against sea creatures.
// Also acts as a breathing apparatus (water breathing).
items.define({
  id: 95122,
  name: "Sailor's charm",
  examine: 'A charm carried by the bravest sailors. It wards against the deep and quickens strikes against sea beasts.',
  value: 8000000,
  category: 'jewellery',
  equipSlot: 'amulet',
  tradeable: true,
  weight: 0.3,
  stats: {
    stab: 6, slash: 6, crush: 6,
    ranged: 6, magic: 6,
    melee_strength: 3,
  },
  equipReqs: {},
  passiveEffect: {
    name: 'Sea Hunter',
    description: '+10% accuracy and damage against aquatic/sea creatures. Acts as water breathing apparatus.',
    targetTags: ['aquatic', 'sea'],
    accuracyBonus: 0.10,
    damageBonus: 0.10,
    waterBreathing: true,
  },
});

// -- Pet: Storm Petrel --
items.define({
  id: 95123,
  name: 'Storm petrel',
  examine: 'A tiny storm bird. It rides the winds around your head.',
  value: 0,
  category: 'pet',
  tradeable: false,
  weight: 0,
});


// ==========================================================================
// RAID 13 NPCs
// ==========================================================================

// Wave enemies -- Sea Serpent
npcs.defineNpc('tempest_sea_serpent', {
  name: 'Sea Serpent',
  combat: 200,
  maxHp: 180,
  maxHit: 22,
  stats: { attack: 170, strength: 165, defence: 150 },
  attackSpeed: 4, attackRange: 3, attackStyle: 'melee', size: 3,
  aggressive: true, aggroRange: 10, wanderRadius: 0, respawnTicks: 0,
  examine: 'A sea serpent driven to the surface by the tempest.',
  weakness: 'ranged', tags: ['raid', 'tempest', 'beast', 'sea', 'aquatic'],
});

droptables.define('tempest_sea_serpent', {
  always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 1000, max: 4000 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }],
});

// Wave enemies -- Storm Crabs
npcs.defineNpc('tempest_storm_crab', {
  name: 'Storm Crab',
  combat: 140,
  maxHp: 120,
  maxHit: 16,
  stats: { attack: 120, strength: 115, defence: 130 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee', size: 2,
  aggressive: true, aggroRange: 8, wanderRadius: 0, respawnTicks: 0,
  examine: 'A massive crab empowered by storm energy.',
  weakness: 'crush', tags: ['raid', 'tempest', 'beast', 'sea', 'aquatic', 'armoured'],
});

droptables.define('tempest_storm_crab', {
  always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 500, max: 2000 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }],
});

// Wave enemies -- Drowned Pirate
npcs.defineNpc('tempest_drowned_pirate', {
  name: 'Drowned Pirate',
  combat: 160,
  maxHp: 130,
  maxHit: 18,
  stats: { attack: 140, strength: 130, defence: 110 },
  attackSpeed: 4, attackRange: 5, attackStyle: 'ranged', size: 1,
  aggressive: true, aggroRange: 10, wanderRadius: 0, respawnTicks: 0,
  examine: 'A drowned pirate risen by the storm. It fires a spectral pistol.',
  weakness: 'magic', tags: ['raid', 'tempest', 'undead', 'sea'],
});

droptables.define('tempest_drowned_pirate', {
  always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 500, max: 2000 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }],
});

// Wave boss -- Leviathan (mid-raid boss)
npcs.defineNpc('tempest_leviathan', {
  name: 'Storm Leviathan',
  combat: 400,
  maxHp: 600,
  maxHit: 40,
  stats: { attack: 300, strength: 290, defence: 260 },
  attackSpeed: 5, attackRange: 6, attackStyle: 'ranged', size: 5,
  aggressive: true, aggroRange: 15, wanderRadius: 0, respawnTicks: 0,
  examine: 'A massive sea creature drawn to the surface by the tempest. It can capsize ships.',
  weakness: 'magic', tags: ['raid', 'tempest', 'beast', 'sea', 'aquatic', 'boss'],
  resistance: 'melee',
});

droptables.define('tempest_leviathan', {
  always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 15000, max: 50000 }, { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 }],
});

// Final Boss: Storm Elemental
boss('tempest_storm_elemental', {
  name: 'The Storm Elemental',
  combat: 620,
  maxHp: 1200,
  maxHit: 55,
  stats: { attack: 380, strength: 370, defence: 330 },
  attackSpeed: 4, attackRange: 10, attackStyle: 'magic', size: 5,
  aggressive: true, aggroRange: 20, wanderRadius: 0, respawnTicks: 0,
  examine: 'The living heart of the tempest. A colossal elemental of wind, lightning, and fury.',
  weakness: 'ranged',
  tags: ['raid', 'tempest', 'elemental', 'boss', 'storm'],
  resistance: 'melee',
  phases: [
    {
      name: 'Phase 1: Thunder',
      hpRange: [1.0, 0.65],
      description: 'The Elemental hurls lightning bolts. 3x3 AoE zones strike every 8 ticks. Attacks with magic at range.',
      lightningDamage: 30,
      lightningSize: 3,
      lightningInterval: 8,
    },
    {
      name: 'Phase 2: Gale Force',
      hpRange: [0.65, 0.35],
      description: 'Wind pushes all players 2 tiles in a random direction every 10 ticks. Spawns storm crabs. Lightning faster (every 6 ticks).',
      windPushDistance: 2,
      windPushInterval: 10,
      addDefId: 'tempest_storm_crab',
      addCount: 4,
      addInterval: 25,
      lightningInterval: 6,
      maxHitOverride: 60,
    },
    {
      name: 'Phase 3: Eye of the Storm',
      hpRange: [0.35, 0.0],
      description: 'The Elemental creates a calm zone in its center. Only players inside the eye take reduced damage. Outside = constant 15 damage/tick. Enraged attacks.',
      eyeRadius: 4,
      outsideDamagePerTick: 15,
      attackSpeedOverride: 3,
      maxHitOverride: 65,
    },
  ],
}, {
  always: [{ id: 107, name: 'Dragon bones', min: 5, max: 5 }],
  main: [
    { id: 95120, name: 'Storm bow', weight: 1, min: 1, max: 1 },
    { id: 95121, name: 'Tempest boots', weight: 1, min: 1, max: 1 },
    { id: 95122, name: "Sailor's charm", weight: 2, min: 1, max: 1 },
    { id: 101, name: 'Coins', weight: 14, min: 100000, max: 350000 },
    { id: 0, name: 'Nothing', weight: 5, min: 0, max: 0 },
  ],
}, 95123, 'Storm petrel', 'A tiny storm bird. It rides the winds around your head.', 5000);


// ---------- Raid 13 Definition Object ----------
const RAID_13_TEMPEST = {
  id: 'tempest_of_saltbrine',
  name: 'Tempest of Saltbrine',
  region: 'saltbrine_reach',
  description: 'A massive storm hits Saltbrine Reach. Repair ships, rescue NPCs, fight sea monsters, and slay the Storm Elemental. Phases progress on a timer -- act fast or the town is lost.',
  playerCount: { min: 8, max: 20 },
  difficulty: 'mid-high',
  estimatedTime: '30-50 minutes',
  worldEvent: true,
  rooms: [
    { id: 'wave_1_serpents', name: 'Phase 1: Sea Serpents', description: 'Sea serpents attack the docks.', enemies: [{ defId: 'tempest_sea_serpent', count: 8 }], timerSeconds: 180, mechanic: 'Repair damaged ships (Construction 50) while fighting.' },
    { id: 'wave_2_crabs', name: 'Phase 2: Storm Crabs', description: 'Storm crabs storm the beach.', enemies: [{ defId: 'tempest_storm_crab', count: 12 }, { defId: 'tempest_drowned_pirate', count: 6 }], timerSeconds: 180, mechanic: 'Rescue stranded NPCs. Carry them to the safe zone.' },
    { id: 'wave_3_leviathan', name: 'Phase 3: The Leviathan', description: 'A massive leviathan surfaces and tries to capsize the fleet.', enemies: [{ defId: 'tempest_leviathan', count: 1 }, { defId: 'tempest_sea_serpent', count: 4 }], timerSeconds: 240, mechanic: 'Ballista on the ships deal extra damage. Assign dedicated gunners.' },
    { id: 'wave_4_elemental', name: 'Phase 4: The Storm Elemental', description: 'The heart of the tempest materializes. Kill it to end the storm.', enemies: [{ defId: 'tempest_storm_elemental', count: 1 }], isBossRoom: true },
  ],
  mechanics: {
    realTimePhases: true,
    shipRepair: { skill: 'construction', level: 50, repairTime: 10 },
    npcRescue: { rescueCount: 8, rewardPerRescue: 5000 },
    ballista: { damage: 50, cooldown: 8, requiresOperator: true },
  },
  uniqueRewards: [
    { id: 95120, name: 'Storm bow', dropRate: '1/30' },
    { id: 95121, name: 'Tempest boots', dropRate: '1/30' },
    { id: 95122, name: "Sailor's charm", dropRate: '1/15' },
    { id: 95123, name: 'Storm petrel', dropRate: '1/5000' },
  ],
};


// ##############################################################################
//
//   RAID 14 -- THE LUCID NIGHTMARE
//   Region: Inkweald | Players: 1 (solo) | Difficulty: Extreme
//
//   7 rooms representing dream states. Each room warps game mechanics
//   (gravity reversed, skills swapped, items randomized). Sanity meter
//   mechanic -- lose sanity from damage and time. At 0 = ejected.
//
// ##############################################################################

// ==========================================================================
// RAID 14 ITEMS
// ==========================================================================

// -- Nightmare Staff Upgrade Orb --
// A 4th orb type for the Nightmare Staff. All combat styles benefit.
// +5% damage and +5% accuracy regardless of style (melee/ranged/magic).
// Niche: hybrid setups, content requiring frequent style switches.
items.define({
  id: 95130,
  name: 'Nightmare orb (lucid)',
  examine: 'An orb of crystallized nightmare. When attached to a Nightmare Staff, it empowers all combat styles equally.',
  value: 40000000,
  category: 'crafting',
  tradeable: true,
  weight: 0.5,
});

items.define({
  id: 95131,
  name: 'Lucid nightmare staff',
  examine: 'A Nightmare Staff enhanced with the Lucid orb. It empowers melee, ranged, and magic equally.',
  value: 60000000,
  category: 'weapon',
  equipSlot: 'weapon',
  tradeable: false,
  weight: 2.5,
  speed: 4,
  stats: { magic: 26, magic_strength: 18, stab: 15, slash: 15, crush: 15, ranged: 15 },
  equipReqs: { magic: 82, attack: 70 },
  passiveEffect: {
    name: 'Lucid Power',
    description: '+5% damage and +5% accuracy with all combat styles (melee, ranged, magic).',
    allStylesDamageBonus: 0.05,
    allStylesAccuracyBonus: 0.05,
  },
});

// -- Dream Sigil --
// BIS hybrid amulet for all 3 styles. Equal bonuses to melee, ranged,
// and magic. Lower individual stats than Fury or Anguish, but the
// balanced spread makes it BIS when switching styles mid-fight.
items.define({
  id: 95132,
  name: 'Dream sigil',
  examine: 'A sigil from the lucid nightmare. It balances the wearer\'s combat energies across all disciplines.',
  value: 30000000,
  category: 'jewellery',
  equipSlot: 'amulet',
  tradeable: true,
  weight: 0.3,
  stats: {
    stab: 10, slash: 10, crush: 10,
    ranged: 10, magic: 10,
    melee_strength: 6, ranged_strength: 4, magic_strength: 4,
    def_stab: 5, def_slash: 5, def_crush: 5,
    def_magic: 5, def_ranged: 5,
    prayer: 3,
  },
  equipReqs: { hitpoints: 75 },
});

// -- Lucid Ring --
// Ring that gives +2% damage for each protection prayer active.
// Since only one protection prayer can be active, max is +2%.
// But in the Lucid Nightmare, game rules warp and multiple can be active.
items.define({
  id: 95133,
  name: 'Lucid ring',
  examine: 'A ring shaped from dream logic. It rewards the faithful with power.',
  value: 12000000,
  category: 'jewellery',
  equipSlot: 'ring',
  tradeable: true,
  weight: 0.1,
  stats: {
    prayer: 4,
  },
  equipReqs: { prayer: 70 },
  passiveEffect: {
    name: 'Dream Faith',
    description: '+2% damage per active protection prayer.',
    damagePerActivePrayer: 0.02,
  },
});

// -- Pet: Dreamling --
items.define({
  id: 95134,
  name: 'Dreamling',
  examine: 'A tiny creature from the lucid nightmare. It shifts between forms -- sometimes a cat, sometimes a fish, sometimes geometry.',
  value: 0,
  category: 'pet',
  tradeable: false,
  weight: 0,
});


// ==========================================================================
// RAID 14 NPCs -- 7 dream-state bosses
// ==========================================================================

// Room 1: Denial -- The Mirror
boss('nightmare_mirror', {
  name: 'The Mirror',
  combat: 300,
  maxHp: 280,
  maxHit: 28,
  stats: { attack: 230, strength: 220, defence: 210 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee', size: 2,
  aggressive: true, aggroRange: 10, wanderRadius: 0, respawnTicks: 0,
  examine: 'A reflection of yourself. It copies your combat style and stats.',
  weakness: 'current_style', tags: ['raid', 'nightmare', 'dream', 'boss'],
}, {
  always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 5000, max: 15000 }, { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 }],
}, null, null, null);

// Room 2: Anger -- The Inferno Beast
boss('nightmare_inferno_beast', {
  name: 'The Inferno Beast',
  combat: 340,
  maxHp: 320,
  maxHit: 36,
  stats: { attack: 260, strength: 270, defence: 190 },
  attackSpeed: 3, attackRange: 1, attackStyle: 'melee', size: 3,
  aggressive: true, aggroRange: 12, wanderRadius: 0, respawnTicks: 0,
  examine: 'A manifestation of rage. Its attacks get stronger the lower its HP.',
  weakness: 'magic', tags: ['raid', 'nightmare', 'dream', 'beast', 'boss'],
}, {
  always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 5000, max: 15000 }, { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 }],
}, null, null, null);

// Room 3: Bargaining -- The Merchant of Lies
boss('nightmare_merchant', {
  name: 'The Merchant of Lies',
  combat: 280,
  maxHp: 250,
  maxHit: 24,
  stats: { attack: 210, strength: 200, defence: 220 },
  attackSpeed: 5, attackRange: 6, attackStyle: 'magic', size: 1,
  aggressive: true, aggroRange: 12, wanderRadius: 0, respawnTicks: 0,
  examine: 'A dream merchant who offers deals too good to be true. His magic warps your inventory.',
  weakness: 'melee', tags: ['raid', 'nightmare', 'dream', 'mage', 'boss'],
}, {
  always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 5000, max: 15000 }, { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 }],
}, null, null, null);

// Room 4: Depression -- The Void Walker
boss('nightmare_void_walker', {
  name: 'The Void Walker',
  combat: 320,
  maxHp: 350,
  maxHit: 30,
  stats: { attack: 240, strength: 230, defence: 250 },
  attackSpeed: 4, attackRange: 8, attackStyle: 'magic', size: 2,
  aggressive: true, aggroRange: 14, wanderRadius: 0, respawnTicks: 0,
  examine: 'A creature from the void between dreams. Gravity is reversed in its presence.',
  weakness: 'ranged', tags: ['raid', 'nightmare', 'dream', 'void', 'boss'],
}, {
  always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 8000, max: 20000 }, { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 }],
}, null, null, null);

// Room 5: Acceptance -- The Tranquil Guardian
boss('nightmare_tranquil', {
  name: 'The Tranquil Guardian',
  combat: 350,
  maxHp: 400,
  maxHit: 20,
  stats: { attack: 260, strength: 200, defence: 300 },
  attackSpeed: 6, attackRange: 1, attackStyle: 'melee', size: 3,
  aggressive: true, aggroRange: 8, wanderRadius: 0, respawnTicks: 0,
  examine: 'A serene guardian. It does not hit hard, but its defence is nearly impenetrable. Find its weakness through patience.',
  weakness: 'stab', tags: ['raid', 'nightmare', 'dream', 'boss'],
}, {
  always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 8000, max: 20000 }, { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 }],
}, null, null, null);

// Room 6: The Sleepwalker (skill-swap room)
boss('nightmare_sleepwalker', {
  name: 'The Sleepwalker',
  combat: 360,
  maxHp: 380,
  maxHit: 34,
  stats: { attack: 270, strength: 260, defence: 240 },
  attackSpeed: 4, attackRange: 4, attackStyle: 'ranged', size: 2,
  aggressive: true, aggroRange: 10, wanderRadius: 0, respawnTicks: 0,
  examine: 'A figure that walks between dreams. Your combat skills are randomly swapped while in its presence.',
  weakness: 'crush', tags: ['raid', 'nightmare', 'dream', 'boss'],
}, {
  always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 8000, max: 20000 }, { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 }],
}, null, null, null);

// Room 7 / Final Boss: The Lucid Core
boss('nightmare_lucid_core', {
  name: 'The Lucid Core',
  combat: 580,
  maxHp: 700,
  maxHit: 50,
  stats: { attack: 360, strength: 350, defence: 310 },
  attackSpeed: 4, attackRange: 8, attackStyle: 'magic', size: 4,
  aggressive: true, aggroRange: 20, wanderRadius: 0, respawnTicks: 0,
  examine: 'The core of the lucid nightmare. A being of pure dream energy. All game rules warp in its presence.',
  weakness: 'current_style',
  tags: ['raid', 'nightmare', 'dream', 'boss', 'core'],
  phases: [
    {
      name: 'Phase 1: Fragmented',
      hpRange: [1.0, 0.60],
      description: 'The Core attacks with random styles. Items in your inventory shuffle positions every 15 seconds. Sanity drains at 2/tick.',
      randomStyleInterval: 4,
      inventoryShuffleInterval: 25,
      sanityDrainRate: 2,
    },
    {
      name: 'Phase 2: Lucid',
      hpRange: [0.60, 0.30],
      description: 'The Core becomes partially lucid. It targets your weakest stat. Equipment stats are inverted (defence becomes offence). Sanity drains at 3/tick.',
      targetWeakestStat: true,
      statInversion: true,
      sanityDrainRate: 3,
      maxHitOverride: 56,
    },
    {
      name: 'Phase 3: Awakening',
      hpRange: [0.30, 0.0],
      description: 'The Core is waking up. All warps active simultaneously. Sanity drains at 5/tick. Kill it before you lose your mind.',
      allWarpsActive: true,
      sanityDrainRate: 5,
      attackSpeedOverride: 3,
      maxHitOverride: 62,
    },
  ],
}, {
  always: [],
  main: [
    { id: 95130, name: 'Nightmare orb (lucid)', weight: 1, min: 1, max: 1 },
    { id: 95132, name: 'Dream sigil', weight: 1, min: 1, max: 1 },
    { id: 95133, name: 'Lucid ring', weight: 2, min: 1, max: 1 },
    { id: 101, name: 'Coins', weight: 14, min: 100000, max: 350000 },
    { id: 0, name: 'Nothing', weight: 5, min: 0, max: 0 },
  ],
}, 95134, 'Dreamling', 'A tiny creature from the lucid nightmare. It shifts between forms -- sometimes a cat, sometimes a fish, sometimes geometry.', 3500);


// ---------- Raid 14 Definition Object ----------
const RAID_14_LUCID_NIGHTMARE = {
  id: 'the_lucid_nightmare',
  name: 'The Lucid Nightmare',
  region: 'inkweald',
  description: 'A solo dream survival raid. 7 rooms, each warping game mechanics (gravity reversed, skills swapped, items shuffled). Sanity meter -- lose sanity from damage and time. At zero, you are ejected.',
  playerCount: { min: 1, max: 1 },
  difficulty: 'extreme',
  estimatedTime: '20-35 minutes',
  rooms: [
    { id: 'denial', name: 'The Mirror (Denial)', description: 'Fight a copy of yourself.', enemies: [{ defId: 'nightmare_mirror', count: 1 }], mechanic: 'The Mirror copies your exact stats and equipment. Find a way to outplay yourself.' },
    { id: 'anger', name: 'The Inferno Beast (Anger)', description: 'A beast that gets stronger as you damage it.', enemies: [{ defId: 'nightmare_inferno_beast', count: 1 }], mechanic: 'Damage increases as HP drops. Rush it down or play defensively.' },
    { id: 'bargaining', name: 'The Merchant of Lies (Bargaining)', description: 'A dream merchant warps your inventory.', enemies: [{ defId: 'nightmare_merchant', count: 1 }], mechanic: 'Your inventory items are randomly swapped to different items. Food might become junk. Adapt.' },
    { id: 'depression', name: 'The Void Walker (Depression)', description: 'Gravity is reversed.', enemies: [{ defId: 'nightmare_void_walker', count: 1 }], mechanic: 'Movement is reversed (north = south, east = west). Ranged projectiles curve.' },
    { id: 'acceptance', name: 'The Tranquil Guardian (Acceptance)', description: 'Nearly impenetrable defence.', enemies: [{ defId: 'nightmare_tranquil', count: 1 }], mechanic: 'Must find the right attack style (stab). Wrong styles deal 1 damage.' },
    { id: 'sleepwalker', name: 'The Sleepwalker', description: 'Your combat skills are randomly swapped.', enemies: [{ defId: 'nightmare_sleepwalker', count: 1 }], mechanic: 'Attack/Strength/Defence/Ranged/Magic levels randomly swap every 20 seconds.' },
    { id: 'lucid_core', name: 'The Lucid Core', description: 'The heart of the nightmare. All warps active.', enemies: [{ defId: 'nightmare_lucid_core', count: 1 }], isBossRoom: true },
  ],
  mechanics: {
    sanityMeter: { maxSanity: 100, drainPerTick: 1, drainPerDamageTaken: 2, atZero: 'ejected', sanityRestoreItems: ['dream_potion'] },
    gameWarps: ['gravity_reverse', 'skill_swap', 'item_shuffle', 'stat_inversion', 'style_lock'],
  },
  uniqueRewards: [
    { id: 95130, name: 'Nightmare orb (lucid)', dropRate: '1/30' },
    { id: 95132, name: 'Dream sigil', dropRate: '1/25' },
    { id: 95133, name: 'Lucid ring', dropRate: '1/15' },
    { id: 95134, name: 'Dreamling', dropRate: '1/3500' },
  ],
};


// ##############################################################################
//
//   RAID 15 -- THE CONSCIOUSNESS RIFT
//   Region: Inkweald | Players: 4-8 | Difficulty: Extreme
//
//   Fight creatures from another dimension leaking through a rift.
//   5 waves + final boss. Each wave is a different dimension (fire/ice/
//   shadow/light/void). Players get random dimension affinity each wave --
//   must fight matching enemies for bonus damage.
//
// ##############################################################################

// ==========================================================================
// RAID 15 ITEMS
// ==========================================================================

// -- Rift Blade --
// Weapon that changes attack style based on target weakness.
// Automatically uses the target's weakest defence stat. Moderate base stats
// but the adaptive nature makes it universally useful.
// Niche: Slayer tasks with mixed monsters, multi-boss content.
items.define({
  id: 95140,
  name: 'Rift blade',
  examine: 'A blade forged in the space between dimensions. It shifts to exploit every enemy\'s weakness.',
  value: 35000000,
  category: 'weapon',
  equipSlot: 'weapon',
  tradeable: true,
  weight: 2.0,
  speed: 4,
  stats: { stab: 75, slash: 75, crush: 75, melee_strength: 80 },
  equipReqs: { attack: 80 },
  passiveEffect: {
    name: 'Dimensional Shift',
    description: 'Automatically attacks with the style the target is weakest against (stab/slash/crush). +10% accuracy when this effect triggers.',
    autoWeakness: true,
    autoWeaknessAccuracyBonus: 0.10,
  },
});

// -- Void Armour Upgrade Kit --
// Upgrades Void Knight equipment: +5% damage boost (from 10% to 15% for the set).
// Consumed on use. Applied to the Void Knight robes.
items.define({
  id: 95141,
  name: 'Void upgrade kit',
  examine: 'A kit from the dimensional rift. Upgrades Void Knight equipment for +5% additional damage.',
  value: 25000000,
  category: 'crafting',
  tradeable: true,
  weight: 0.3,
});

// -- Rift Walker's Boots --
// Boots that grant a 5% chance to dodge attacks entirely (0 damage taken).
// No combat stats. Niche: survivability in endgame content.
items.define({
  id: 95142,
  name: "Rift walker's boots",
  examine: 'Boots that phase slightly between dimensions. Attacks sometimes pass through the wearer.',
  value: 20000000,
  category: 'armour',
  equipSlot: 'feet',
  tradeable: true,
  weight: 0.5,
  stats: {
    def_stab: 8, def_slash: 8, def_crush: 8,
    def_magic: 8, def_ranged: 8,
  },
  equipReqs: { defence: 75 },
  passiveEffect: {
    name: 'Phase Shift',
    description: '5% chance to completely dodge an incoming attack (0 damage taken).',
    dodgeChance: 0.05,
  },
});

// -- Dimensional Sigil --
// Off-hand that boosts damage by 3% against enemies from a different
// dimension/realm tag. Stacks with the Rift Blade.
items.define({
  id: 95143,
  name: 'Dimensional sigil',
  examine: 'A sigil that resonates with dimensional energy. It empowers strikes against creatures from other realms.',
  value: 12000000,
  category: 'armour',
  equipSlot: 'shield',
  tradeable: true,
  weight: 1.0,
  stats: {
    prayer: 4,
    def_stab: 10, def_slash: 10, def_crush: 10,
    def_magic: 10, def_ranged: 10,
  },
  equipReqs: { prayer: 60 },
  passiveEffect: {
    name: 'Dimensional Resonance',
    description: '+3% damage against enemies with a dimensional/rift tag.',
    targetTags: ['dimensional', 'rift', 'void'],
    damageBonus: 0.03,
  },
});

// -- Pet: Rift Anomaly --
items.define({
  id: 95144,
  name: 'Rift anomaly',
  examine: 'A tiny tear in reality. It floats behind you, occasionally showing glimpses of other worlds.',
  value: 0,
  category: 'pet',
  tradeable: false,
  weight: 0,
});


// ==========================================================================
// RAID 15 NPCs
// ==========================================================================

// Wave 1: Fire Dimension
npcs.defineNpc('rift_fire_demon', {
  name: 'Rift Fire Demon',
  combat: 250,
  maxHp: 220,
  maxHit: 28,
  stats: { attack: 200, strength: 210, defence: 170 },
  attackSpeed: 4, attackRange: 5, attackStyle: 'magic', size: 2,
  aggressive: true, aggroRange: 10, wanderRadius: 0, respawnTicks: 0,
  examine: 'A demon from the fire dimension. It radiates intense heat.',
  weakness: 'water', tags: ['raid', 'rift', 'demon', 'fire', 'dimensional'],
  resistance: 'fire',
});

npcs.defineNpc('rift_fire_imp', {
  name: 'Rift Fire Imp',
  combat: 140,
  maxHp: 100,
  maxHit: 16,
  stats: { attack: 120, strength: 115, defence: 90 },
  attackSpeed: 3, attackRange: 3, attackStyle: 'magic', size: 1,
  aggressive: true, aggroRange: 12, wanderRadius: 0, respawnTicks: 0,
  examine: 'A small fire imp from the rift. Fast and annoying.',
  weakness: 'water', tags: ['raid', 'rift', 'demon', 'fire', 'dimensional'],
});

droptables.define('rift_fire_demon', {
  always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 3000, max: 10000 }, { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 }],
});
droptables.define('rift_fire_imp', {
  always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 500, max: 2000 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }],
});

// Wave 2: Ice Dimension
npcs.defineNpc('rift_ice_wyrm', {
  name: 'Rift Ice Wyrm',
  combat: 270,
  maxHp: 250,
  maxHit: 30,
  stats: { attack: 210, strength: 220, defence: 200 },
  attackSpeed: 5, attackRange: 4, attackStyle: 'ranged', size: 3,
  aggressive: true, aggroRange: 10, wanderRadius: 0, respawnTicks: 0,
  examine: 'A frozen wyrm from the ice dimension. Its breath freezes players in place.',
  weakness: 'fire', tags: ['raid', 'rift', 'beast', 'ice', 'dimensional'],
  resistance: 'water',
});

npcs.defineNpc('rift_frost_sprite', {
  name: 'Rift Frost Sprite',
  combat: 150,
  maxHp: 90,
  maxHit: 14,
  stats: { attack: 130, strength: 110, defence: 100 },
  attackSpeed: 3, attackRange: 6, attackStyle: 'magic', size: 1,
  aggressive: true, aggroRange: 12, wanderRadius: 0, respawnTicks: 0,
  examine: 'A frost sprite from the rift. It slows player movement.',
  weakness: 'fire', tags: ['raid', 'rift', 'elemental', 'ice', 'dimensional'],
});

droptables.define('rift_ice_wyrm', {
  always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 3000, max: 10000 }, { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 }],
});
droptables.define('rift_frost_sprite', {
  always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 500, max: 2000 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }],
});

// Wave 3: Shadow Dimension
npcs.defineNpc('rift_shadow_stalker', {
  name: 'Rift Shadow Stalker',
  combat: 280,
  maxHp: 230,
  maxHit: 32,
  stats: { attack: 220, strength: 215, defence: 180 },
  attackSpeed: 3, attackRange: 1, attackStyle: 'melee', size: 2,
  aggressive: true, aggroRange: 12, wanderRadius: 0, respawnTicks: 0,
  examine: 'A shadow creature that strikes from the darkness. Hard to hit, hits hard.',
  weakness: 'light', tags: ['raid', 'rift', 'shadow', 'dimensional'],
  resistance: 'shadow',
});

npcs.defineNpc('rift_shade', {
  name: 'Rift Shade',
  combat: 160,
  maxHp: 110,
  maxHit: 18,
  stats: { attack: 140, strength: 130, defence: 120 },
  attackSpeed: 4, attackRange: 4, attackStyle: 'magic', size: 1,
  aggressive: true, aggroRange: 10, wanderRadius: 0, respawnTicks: 0,
  examine: 'A shade leaking through the rift. It drains prayer points.',
  weakness: 'light', tags: ['raid', 'rift', 'shadow', 'dimensional', 'undead'],
});

droptables.define('rift_shadow_stalker', {
  always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 3000, max: 10000 }, { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 }],
});
droptables.define('rift_shade', {
  always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 500, max: 2000 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }],
});

// Wave 4: Light Dimension
npcs.defineNpc('rift_light_sentinel', {
  name: 'Rift Light Sentinel',
  combat: 290,
  maxHp: 280,
  maxHit: 30,
  stats: { attack: 230, strength: 220, defence: 230 },
  attackSpeed: 4, attackRange: 6, attackStyle: 'ranged', size: 2,
  aggressive: true, aggroRange: 12, wanderRadius: 0, respawnTicks: 0,
  examine: 'A sentinel of pure light. Its beams are blinding and precise.',
  weakness: 'shadow', tags: ['raid', 'rift', 'light', 'dimensional', 'construct'],
  resistance: 'light',
});

npcs.defineNpc('rift_light_wisp', {
  name: 'Rift Light Wisp',
  combat: 140,
  maxHp: 80,
  maxHit: 12,
  stats: { attack: 120, strength: 100, defence: 110 },
  attackSpeed: 3, attackRange: 8, attackStyle: 'magic', size: 1,
  aggressive: true, aggroRange: 14, wanderRadius: 0, respawnTicks: 0,
  examine: 'A wisp of concentrated light. Small but numerous.',
  weakness: 'shadow', tags: ['raid', 'rift', 'light', 'dimensional'],
});

droptables.define('rift_light_sentinel', {
  always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 3000, max: 10000 }, { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 }],
});
droptables.define('rift_light_wisp', {
  always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 500, max: 2000 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }],
});

// Wave 5: Void Dimension
npcs.defineNpc('rift_void_beast', {
  name: 'Rift Void Beast',
  combat: 310,
  maxHp: 300,
  maxHit: 34,
  stats: { attack: 250, strength: 240, defence: 220 },
  attackSpeed: 4, attackRange: 1, attackStyle: 'melee', size: 3,
  aggressive: true, aggroRange: 10, wanderRadius: 0, respawnTicks: 0,
  examine: 'A creature from the void. It exists in the gaps between dimensions.',
  weakness: 'magic', tags: ['raid', 'rift', 'void', 'beast', 'dimensional'],
});

npcs.defineNpc('rift_void_tendril', {
  name: 'Rift Void Tendril',
  combat: 170,
  maxHp: 120,
  maxHit: 20,
  stats: { attack: 150, strength: 145, defence: 130 },
  attackSpeed: 3, attackRange: 5, attackStyle: 'magic', size: 1,
  aggressive: true, aggroRange: 12, wanderRadius: 0, respawnTicks: 0,
  examine: 'A tendril of void energy. It lashes out at anything with a heartbeat.',
  weakness: 'melee', tags: ['raid', 'rift', 'void', 'dimensional'],
});

droptables.define('rift_void_beast', {
  always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 3000, max: 10000 }, { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 }],
});
droptables.define('rift_void_tendril', {
  always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 1000, max: 3000 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }],
});

// Final Boss: The Rift Sovereign
boss('rift_sovereign', {
  name: 'The Rift Sovereign',
  combat: 650,
  maxHp: 1000,
  maxHit: 58,
  stats: { attack: 400, strength: 390, defence: 350 },
  attackSpeed: 4, attackRange: 10, attackStyle: 'magic', size: 5,
  aggressive: true, aggroRange: 20, wanderRadius: 0, respawnTicks: 0,
  examine: 'The ruler of the dimension beyond the rift. It commands fire, ice, shadow, light, and void simultaneously.',
  weakness: 'current_affinity',
  tags: ['raid', 'rift', 'boss', 'dimensional', 'sovereign', 'void'],
  phases: [
    {
      name: 'Phase 1: Dimensional Flux',
      hpRange: [1.0, 0.60],
      description: 'The Sovereign cycles through dimensional affinities every 20 ticks (fire -> ice -> shadow -> light -> void). Players get random affinity each cycle. Matching affinity = +50% damage. Wrong affinity = -50% damage.',
      affinityCycleInterval: 20,
      matchBonus: 0.50,
      mismatchPenalty: 0.50,
      affinityOrder: ['fire', 'ice', 'shadow', 'light', 'void'],
    },
    {
      name: 'Phase 2: Convergence',
      hpRange: [0.60, 0.30],
      description: 'Two dimensions overlap simultaneously. Players must handle mechanics from both dimensions. Affinity bonuses still apply.',
      simultaneousDimensions: 2,
      maxHitOverride: 64,
      spawnAdds: true,
      addDefIds: ['rift_fire_imp', 'rift_frost_sprite', 'rift_shade', 'rift_light_wisp', 'rift_void_tendril'],
      addCount: 3,
      addInterval: 20,
    },
    {
      name: 'Phase 3: The Rift Tears Open',
      hpRange: [0.30, 0.0],
      description: 'All five dimensions converge. Chaos. All affinity bonuses removed. The Sovereign attacks with all styles randomly. 2-minute enrage timer -- after 2 minutes, it one-shots everyone.',
      allDimensionsActive: true,
      enrageTimer: 120,
      enrageInstakill: true,
      attackSpeedOverride: 3,
      maxHitOverride: 70,
    },
  ],
}, {
  always: [{ id: 107, name: 'Dragon bones', min: 5, max: 5 }],
  main: [
    { id: 95140, name: 'Rift blade', weight: 1, min: 1, max: 1 },
    { id: 95141, name: 'Void upgrade kit', weight: 1, min: 1, max: 1 },
    { id: 95142, name: "Rift walker's boots", weight: 1, min: 1, max: 1 },
    { id: 95143, name: 'Dimensional sigil', weight: 2, min: 1, max: 1 },
    { id: 101, name: 'Coins', weight: 12, min: 200000, max: 500000 },
    { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 },
  ],
}, 95144, 'Rift anomaly', 'A tiny tear in reality. It floats behind you, occasionally showing glimpses of other worlds.', 4000);


// ---------- Raid 15 Definition Object ----------
const RAID_15_CONSCIOUSNESS_RIFT = {
  id: 'consciousness_rift',
  name: 'The Consciousness Rift',
  region: 'inkweald',
  description: 'Fight creatures from five dimensions leaking through a rift in the Inkweald. Players receive random dimensional affinity each wave -- match your affinity to enemies for bonus damage.',
  playerCount: { min: 4, max: 8 },
  difficulty: 'extreme',
  estimatedTime: '35-55 minutes',
  rooms: [
    { id: 'fire_wave', name: 'Wave 1: Fire Dimension', description: 'Fire demons and imps pour through the rift.', enemies: [{ defId: 'rift_fire_demon', count: 4 }, { defId: 'rift_fire_imp', count: 8 }], mechanic: 'Players with fire affinity deal +50% damage. Others deal -50%.' },
    { id: 'ice_wave', name: 'Wave 2: Ice Dimension', description: 'Ice wyrms and frost sprites emerge.', enemies: [{ defId: 'rift_ice_wyrm', count: 3 }, { defId: 'rift_frost_sprite', count: 8 }], mechanic: 'Ice breath freezes players for 3 ticks. Break free with fire attacks.' },
    { id: 'shadow_wave', name: 'Wave 3: Shadow Dimension', description: 'Shadow stalkers and shades attack from the darkness.', enemies: [{ defId: 'rift_shadow_stalker', count: 4 }, { defId: 'rift_shade', count: 6 }], mechanic: 'Visibility reduced. Light sources help. Shadow creatures drain prayer.' },
    { id: 'light_wave', name: 'Wave 4: Light Dimension', description: 'Light sentinels and wisps flood the area.', enemies: [{ defId: 'rift_light_sentinel', count: 3 }, { defId: 'rift_light_wisp', count: 10 }], mechanic: 'Blinding flashes stun players for 2 ticks every 15 seconds.' },
    { id: 'void_wave', name: 'Wave 5: Void Dimension', description: 'Void beasts and tendrils tear through reality.', enemies: [{ defId: 'rift_void_beast', count: 3 }, { defId: 'rift_void_tendril', count: 6 }], mechanic: 'Gravity warps. Players teleported randomly every 20 seconds.' },
    { id: 'sovereign', name: 'The Rift Sovereign', description: 'The ruler of the dimension beyond. All five elements converge.', enemies: [{ defId: 'rift_sovereign', count: 1 }], isBossRoom: true },
  ],
  mechanics: {
    dimensionalAffinity: {
      dimensions: ['fire', 'ice', 'shadow', 'light', 'void'],
      matchBonus: 0.50,
      mismatchPenalty: 0.50,
      randomAssignment: true,
      reassignPerWave: true,
    },
  },
  uniqueRewards: [
    { id: 95140, name: 'Rift blade', dropRate: '1/30' },
    { id: 95141, name: 'Void upgrade kit', dropRate: '1/30' },
    { id: 95142, name: "Rift walker's boots", dropRate: '1/25' },
    { id: 95143, name: 'Dimensional sigil', dropRate: '1/15' },
    { id: 95144, name: 'Rift anomaly', dropRate: '1/4000' },
  ],
};


// ##############################################################################
//
//   EXPORTS & REGISTRATION
//
// ##############################################################################

const ALL_RAIDS = [
  RAID_01_KINGS_CRYPT,
  RAID_02_SIEGE,
  RAID_03_SANCTUM,
  RAID_04_SPINE,
  RAID_05_BLOOD_SANCTUM,
  RAID_06_CATACOMBS,
  RAID_07_TOB_HM,
  RAID_08_GAUNTLET,
  RAID_09_WORLD_TREE,
  RAID_10_CRUCIBLE,
  RAID_11_DEEP_ENGINE,
  RAID_12_SUNKEN_TEMPLE,
  RAID_13_TEMPEST,
  RAID_14_LUCID_NIGHTMARE,
  RAID_15_CONSCIOUSNESS_RIFT,
];

console.log('[aelgard] Raids mega pack 1: 15 raids loaded');

module.exports = {
  ALL_RAIDS,
  CATACOMB_MINI_BOSSES,
  RAID_01_KINGS_CRYPT,
  RAID_02_SIEGE,
  RAID_03_SANCTUM,
  RAID_04_SPINE,
  RAID_05_BLOOD_SANCTUM,
  RAID_06_CATACOMBS,
  RAID_07_TOB_HM,
  RAID_08_GAUNTLET,
  RAID_09_WORLD_TREE,
  RAID_10_CRUCIBLE,
  RAID_11_DEEP_ENGINE,
  RAID_12_SUNKEN_TEMPLE,
  RAID_13_TEMPEST,
  RAID_14_LUCID_NIGHTMARE,
  RAID_15_CONSCIOUSNESS_RIFT,
};
