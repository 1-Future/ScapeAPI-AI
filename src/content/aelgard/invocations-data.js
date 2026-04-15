// ══════════════════════════════════════════════════════════════════════════════
// Aelgard -- Raid Invocation Data
//
// OSRS Tombs of Amascut-style invocation system. Players toggle invocations
// to scale raid difficulty up or down. Each invocation:
//   - adds a specific mechanic (or removes a player-favour mechanic)
//   - adds a raid-level point value (the "weight" in the point formula)
//   - has a category: combat_scaling | mechanic | positive
//
// Manifesto alignment:
//   P12 Encounter itemization -- higher invocations unlock better BiS rolls
//     that are encounter-specific (not universal upgrades).
//   P17 Trade-offs sacred    -- every invocation costs the player something
//     (more damage taken, more mechanics) for the point multiplier.
//
// This file contains invocation definitions ONLY. The engine logic lives in
// src/engine/raid-invocations.js. The invocations here are pure data and can
// be loaded/queried by both the engine and the builder UI.
//
// Coverage: 5 raids x 15-22 invocations each = 90+ invocations total.
//   - chambers_of_aelgard (CoA)
//   - theatre_of_shadows  (ToS)
//   - tombs_of_aelgard    (ToA)
//   - inferno             (Inferno)
//   - the_gauntlet        (Gauntlet / Crystal Wyrm instance equivalent)
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

// ── Invocation factory: creates an invocation record with defaults ──────────
//
// category options:
//   combat_scaling  -- tweaks numbers (HP, damage, accuracy, attack speed)
//   mechanic        -- enables a new hazard or disables a player tool
//   positive        -- ON by default; player can toggle OFF for LESS risk.
//                      Points go DOWN when disabled.
//
// An invocation's raidLevel field is the weight that contributes to raid level.
// Positive invocations have a NEGATIVE raidLevel: disabling them lowers the
// final raid level.
function inv(id, name, category, raidLevel, description, effect, extra) {
  return {
    id,
    name,
    category,
    raidLevel,
    description,
    effect: effect || {},
    defaultOn: category === 'positive',
    tradeoff: (extra && extra.tradeoff) || null,
    group: (extra && extra.group) || null,
    conflictsWith: (extra && extra.conflictsWith) || [],
    requiresLevel: (extra && extra.requiresLevel) || 0,
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// CHAMBERS OF AELGARD (CoA)
// ══════════════════════════════════════════════════════════════════════════════

const COA_INVOCATIONS = [
  // ── Positive invocations (default ON, toggle OFF for less risk/less points) ─
  inv('coa_normal_health', 'Normal Health', 'positive', -50,
    'Bosses at base HP. Toggle off to reduce boss HP by 20% (and points).',
    { hpMultiplier: 1.0 },
    { tradeoff: 'Less HP to chew through, but significantly fewer points.' }),
  inv('coa_standard_damage', 'Standard Damage', 'positive', -40,
    'Mob damage at base values. Toggle off to reduce incoming damage by 15%.',
    { damageMultiplier: 1.0 },
    { tradeoff: 'Forgiving survival but a smaller point pot.' }),

  // ── Combat scaling (8-12) ──────────────────────────────────────────────────
  inv('coa_acceleration', 'Acceleration', 'combat_scaling', 20,
    'Bosses gain 10% attack speed.',
    { bossAttackSpeedMultiplier: 1.10 },
    { tradeoff: 'Faster prayer flicks and less brew-time.' }),
  inv('coa_overclocked', 'Overclocked', 'combat_scaling', 40,
    'Bosses gain 20% attack speed.',
    { bossAttackSpeedMultiplier: 1.20 },
    { conflictsWith: ['coa_acceleration'],
      tradeoff: 'Significantly tighter combat window.' }),
  inv('coa_toughened_up', 'Toughened Up', 'combat_scaling', 25,
    'All monsters in the Chambers have 25% more HP.',
    { hpMultiplier: 1.25 },
    { tradeoff: 'Longer phases means more supply pressure.' }),
  inv('coa_walk_the_path', 'Walk the Path', 'mechanic', 30,
    'Player cannot run. Bosses that phase or charge become much more lethal.',
    { playerCanRun: false },
    { tradeoff: 'Every dodge must be pre-planned.' }),
  inv('coa_no_distraction', 'No Distraction', 'mechanic', 55,
    'Player cannot use any prayer (offensive or protective).',
    { prayerDisabled: true },
    { tradeoff: 'Punishing for phased bosses; forces pure mechanics.' }),
  inv('coa_aerial_assault', 'Aerial Assault', 'combat_scaling', 35,
    'Boss projectiles always hit (defence roll is bypassed).',
    { projectilesAlwaysHit: true },
    { tradeoff: 'Defence gear becomes nearly worthless.' }),
  inv('coa_harder_hits', 'Walk the Line', 'combat_scaling', 25,
    'All monsters hit 15% harder.',
    { damageMultiplier: 1.15 },
    { tradeoff: 'Every mistake stings more.' }),
  inv('coa_monster_accuracy', 'Penetration', 'combat_scaling', 25,
    'All monsters have +30% accuracy.',
    { monsterAccuracyMultiplier: 1.30 },
    { tradeoff: 'Defence-gear builds take a real hit.' }),
  inv('coa_prayer_drain', 'Thirsty Ghosts', 'combat_scaling', 20,
    'Prayer drain rate is doubled throughout the raid.',
    { prayerDrainMultiplier: 2.0 },
    { tradeoff: 'Prayer potions become supply rate-limiting.' }),
  inv('coa_boss_enrage', 'Insanity', 'combat_scaling', 50,
    'Bosses enrage at 50% HP: attack speed +1 tick, max hit +20%.',
    { enrageThreshold: 0.50, enrageSpeedBonus: 1, enrageDamageMultiplier: 1.20 },
    { tradeoff: 'Execute phase becomes a true DPS-check.' }),
  inv('coa_ancient_haste', 'Ancient Haste', 'combat_scaling', 50,
    'All boss attack speeds increased by 1 tick.',
    { bossAttackSpeedBonus: 1 },
    { conflictsWith: ['coa_acceleration', 'coa_overclocked'],
      tradeoff: 'Stacks with enrage windows for lethal combinations.' }),

  // ── Mechanic additions (3-5 per raid) ─────────────────────────────────────
  inv('coa_vanguards_desync', 'Sudden Vanguards', 'mechanic', 35,
    'Vanguards sync their HP every 10 ticks (must die within same tick).',
    { vanguardSyncInterval: 10 },
    { tradeoff: 'Precision DPS across 3 targets.' }),
  inv('coa_tekton_sparks', 'Searing Sparks', 'mechanic', 40,
    'Tekton ejects molten sparks while smithing -- AoE ground hazards.',
    { tektonSparkDamage: 15, tektonSparkInterval: 4 },
    { tradeoff: 'No standing still in the smithing phase.' }),
  inv('coa_vespula_swarms', 'Hive Mind', 'mechanic', 30,
    'Vespula spawns 2 extra soldiers every portal tick.',
    { vespulaSpawnBonus: 2 },
    { tradeoff: 'Adds management becomes the limiting factor.' }),
  inv('coa_serpent_beam', 'Beam of Death', 'mechanic', 55,
    'Great Crystal Serpent fires a room-wide beam every 12 ticks -- dodge or die.',
    { serpentBeamInterval: 12, serpentBeamDamage: 85 },
    { tradeoff: 'Movement overhead per phase.' }),
  inv('coa_ice_demon_freeze', 'Freezing Howl', 'mechanic', 25,
    'Ice Demon freezes a random player for 4 ticks every 20 ticks.',
    { iceDemonFreezeDuration: 4, iceDemonFreezeInterval: 20 },
    { tradeoff: 'Forces positional awareness.' }),
  inv('coa_no_food_drops', 'On a Diet', 'mechanic', 15,
    'Monsters no longer drop food during the raid.',
    { suppressFoodDrops: true },
    { tradeoff: 'Bring-in supplies must last the full run.' }),
  inv('coa_hardcore_run', 'Hardcore Run', 'mechanic', 75,
    'No deaths allowed. Any death ends the raid with zero rewards.',
    { freeDeaths: 0, failOnDeath: true },
    { tradeoff: 'Huge point multiplier; catastrophic on failure.' }),
];

// ══════════════════════════════════════════════════════════════════════════════
// THEATRE OF SHADOWS (ToS)
// ══════════════════════════════════════════════════════════════════════════════

const TOS_INVOCATIONS = [
  inv('tos_normal_health', 'Normal Health', 'positive', -50,
    'Bosses at base HP. Toggle off to reduce HP by 20%.',
    { hpMultiplier: 1.0 }),
  inv('tos_standard_damage', 'Standard Damage', 'positive', -40,
    'Mob damage at base values.',
    { damageMultiplier: 1.0 }),

  inv('tos_acceleration', 'Acceleration', 'combat_scaling', 20,
    'Bosses gain 10% attack speed.',
    { bossAttackSpeedMultiplier: 1.10 }),
  inv('tos_overclocked', 'Overclocked', 'combat_scaling', 40,
    'Bosses gain 20% attack speed.',
    { bossAttackSpeedMultiplier: 1.20 },
    { conflictsWith: ['tos_acceleration'] }),
  inv('tos_toughened_up', 'Toughened Up', 'combat_scaling', 25,
    'All Theatre bosses have 25% more HP.',
    { hpMultiplier: 1.25 }),
  inv('tos_walk_the_path', 'Walk the Path', 'mechanic', 30,
    'Player cannot run. Maze runner in Sotetseg phase becomes nearly impossible solo.',
    { playerCanRun: false }),
  inv('tos_no_distraction', 'No Distraction', 'mechanic', 60,
    'Player cannot use any prayer.',
    { prayerDisabled: true }),
  inv('tos_aerial_assault', 'Aerial Assault', 'combat_scaling', 35,
    'Boss projectiles always hit.',
    { projectilesAlwaysHit: true }),
  inv('tos_maiden_blood', 'Eternal Blood', 'mechanic', 45,
    'Maiden blood pools do not dissipate for the entire phase.',
    { maidenBloodPersistent: true },
    { tradeoff: 'Arena shrinks as the fight progresses.' }),
  inv('tos_bloat_stomps', 'Raging Bloat', 'mechanic', 40,
    'Bloat stomps send shockwaves dealing 30 damage in a 7-tile radius.',
    { bloatShockwaveRadius: 7, bloatShockwaveDamage: 30 }),
  inv('tos_nylo_chaos', 'Chaos Nylocas', 'mechanic', 50,
    'Nylocas style is randomized every wave (ignore colour).',
    { nyloStyleRandom: true },
    { tradeoff: 'Requires constant 3-way style switching.' }),
  inv('tos_sotetseg_death_ball', 'Death Ball Barrage', 'mechanic', 45,
    'Sotetseg fires 3 death balls instead of 1; maze runner must soak all 3.',
    { sotetsegDeathBalls: 3 }),
  inv('tos_verzik_enrage', 'Queen\'s Fury', 'mechanic', 55,
    'Verzik phase 3 starts at 75% HP instead of 35%.',
    { verzikP3Threshold: 0.75 },
    { tradeoff: 'Triple-menagerie phase lasts much longer.' }),
  inv('tos_monster_accuracy', 'Penetration', 'combat_scaling', 25,
    'All Theatre monsters have +30% accuracy.',
    { monsterAccuracyMultiplier: 1.30 }),
  inv('tos_harder_hits', 'Walk the Line', 'combat_scaling', 25,
    'All monsters hit 15% harder.',
    { damageMultiplier: 1.15 }),
  inv('tos_supply_drought', 'Blood Thinners', 'combat_scaling', 15,
    'Supply drops from all sources reduced by 50%.',
    { supplyDropMultiplier: 0.50 }),
  inv('tos_quiet_prayers', 'Quiet Prayers', 'combat_scaling', 40,
    'Protection prayers only block 50% of damage instead of 100%.',
    { protectionPrayerEffectiveness: 0.50 }),
  inv('tos_hardcore_run', 'Hardcore Run', 'mechanic', 75,
    'No deaths allowed. Any death ends the raid.',
    { freeDeaths: 0, failOnDeath: true }),
  inv('tos_ancient_haste', 'Ancient Haste', 'combat_scaling', 50,
    'All boss attack speeds increased by 1 tick.',
    { bossAttackSpeedBonus: 1 },
    { conflictsWith: ['tos_acceleration', 'tos_overclocked'] }),
];

// ══════════════════════════════════════════════════════════════════════════════
// TOMBS OF AELGARD (ToA) -- canonical invocation-first raid
// ══════════════════════════════════════════════════════════════════════════════

const TOA_INVOCATIONS = [
  inv('toa_normal_health', 'Normal Health', 'positive', -60,
    'Path bosses at base HP.',
    { hpMultiplier: 1.0 }),
  inv('toa_standard_damage', 'Standard Damage', 'positive', -40,
    'Mob damage at base values.',
    { damageMultiplier: 1.0 }),

  inv('toa_tougher_monsters', 'Toughened Up', 'combat_scaling', 25,
    'All monsters in the tombs have 25% more HP.',
    { hpMultiplier: 1.25 }),
  inv('toa_no_food_drops', 'On a Diet', 'mechanic', 15,
    'Monsters no longer drop food during the raid.',
    { suppressFoodDrops: true }),
  inv('toa_prayer_drain', 'Aerial Assault', 'combat_scaling', 20,
    'Prayer drain rate is doubled throughout the raid.',
    { prayerDrainMultiplier: 2.0 }),
  inv('toa_harder_hits', 'Walk the Line', 'combat_scaling', 25,
    'All monsters hit 15% harder.',
    { damageMultiplier: 1.15 }),
  inv('toa_less_time', 'Need for Speed', 'combat_scaling', 10,
    '30% less time between room transitions.',
    { transitionTimeMultiplier: 0.70 }),
  inv('toa_boss_enrage', 'Feeling Special', 'combat_scaling', 30,
    'Bosses enrage at 50% HP: attack speed +1, max hit +20%.',
    { enrageThreshold: 0.50, enrageSpeedBonus: 1, enrageDamageMultiplier: 1.20 }),
  inv('toa_deadly_prayers', 'Overclocked', 'combat_scaling', 20,
    'Incorrect overhead prayers deal 25 damage to the player.',
    { wrongPrayerDamage: 25 }),
  inv('toa_softcore', 'Softcore Run', 'mechanic', 5,
    'One free death per player. Second death is permanent.',
    { freeDeaths: 1 }),
  inv('toa_no_deaths', 'Hardcore Run', 'mechanic', 50,
    'No deaths allowed. Any death ends the raid.',
    { freeDeaths: 0, failOnDeath: true },
    { conflictsWith: ['toa_softcore'] }),
  inv('toa_monster_accuracy', 'Penetration', 'combat_scaling', 25,
    'All monsters have +30% accuracy.',
    { monsterAccuracyMultiplier: 1.30 }),
  inv('toa_double_specials', 'Not Just a Heads Up', 'mechanic', 35,
    'Bosses use special attacks twice as often.',
    { specialFrequencyMultiplier: 2.0 }),
  inv('toa_supply_drought', 'Blood Thinners', 'combat_scaling', 15,
    'Supply drops from all sources reduced by 50%.',
    { supplyDropMultiplier: 0.50 }),
  inv('toa_quiet_prayers', 'Quiet Prayers', 'combat_scaling', 40,
    'Protection prayers only block 50% of damage instead of 100%.',
    { protectionPrayerEffectiveness: 0.50 }),
  inv('toa_ancient_haste', 'Ancient Haste', 'combat_scaling', 50,
    'All boss attack speeds increased by 1 tick.',
    { bossAttackSpeedBonus: 1 }),
  inv('toa_walk_the_path', 'Walk the Path', 'mechanic', 30,
    'Player cannot run. Boulder dodges in Zebak become much harder.',
    { playerCanRun: false }),
  inv('toa_aerial_assault_hit', 'True Aim', 'combat_scaling', 35,
    'Boss projectiles always hit.',
    { projectilesAlwaysHit: true }),
  inv('toa_zebak_floods', 'Floods', 'mechanic', 40,
    'Zebak raises the river level every 15 ticks; losing ground means 50 dmg.',
    { zebakFloodInterval: 15, zebakFloodDamage: 50 }),
  inv('toa_kephri_guardian', 'Guardian Scarabs', 'mechanic', 45,
    'Kephri spawns an Elite Scarab every 20 ticks with 80 HP and 25 max hit.',
    { kephriEliteInterval: 20, kephriEliteHp: 80 }),
  inv('toa_akkha_mirror', 'Shattered Mirror', 'mechanic', 40,
    'Akkha spawns mirrors during phase transitions that reflect 30% of your DPS.',
    { akkhaMirrorReflect: 0.30 }),
  inv('toa_baba_rockfall', 'Ceiling Collapse', 'mechanic', 35,
    'Ba-Ba causes random rockfalls every 10 ticks regardless of phase.',
    { babaRockfallInterval: 10, babaRockfallDamage: 30 }),
  inv('toa_warden_enrage', 'Fused Fury', 'mechanic', 60,
    'Warden core exposure reduced to 4 ticks (from 10); window for damage is tiny.',
    { wardenCoreExposureTicks: 4 }),
];

// ══════════════════════════════════════════════════════════════════════════════
// INFERNO
// ══════════════════════════════════════════════════════════════════════════════

const INFERNO_INVOCATIONS = [
  inv('inferno_normal_health', 'Normal Health', 'positive', -50,
    'Mobs at base HP.',
    { hpMultiplier: 1.0 }),
  inv('inferno_standard_damage', 'Standard Damage', 'positive', -40,
    'Mob damage at base values.',
    { damageMultiplier: 1.0 }),

  inv('inferno_acceleration', 'Acceleration', 'combat_scaling', 20,
    'All mobs gain 10% attack speed.',
    { bossAttackSpeedMultiplier: 1.10 }),
  inv('inferno_overclocked', 'Overclocked', 'combat_scaling', 40,
    'All mobs gain 20% attack speed.',
    { bossAttackSpeedMultiplier: 1.20 },
    { conflictsWith: ['inferno_acceleration'] }),
  inv('inferno_toughened_up', 'Toughened Up', 'combat_scaling', 25,
    'All mobs have 25% more HP.',
    { hpMultiplier: 1.25 }),
  inv('inferno_walk_the_path', 'Walk the Path', 'mechanic', 40,
    'Player cannot run. Mager pillar dodges become much harder.',
    { playerCanRun: false }),
  inv('inferno_no_distraction', 'No Distraction', 'mechanic', 70,
    'Player cannot use any prayer. The 4-way flick becomes a death-check.',
    { prayerDisabled: true }),
  inv('inferno_aerial_assault', 'Aerial Assault', 'combat_scaling', 35,
    'All mob projectiles always hit.',
    { projectilesAlwaysHit: true }),
  inv('inferno_insanity', 'Insanity', 'combat_scaling', 50,
    'Random wave: a Zuk-scale enrage mechanic triggers with 50% uptime.',
    { randomEnrageWaves: true, enrageDamageMultiplier: 1.35 }),
  inv('inferno_double_jads', 'Double Jads', 'mechanic', 50,
    'Wave 68 spawns 4 Jads instead of 3.',
    { jadsOnTripleJadWave: 4 }),
  inv('inferno_zuk_spawn_rate', 'Zuk\'s Wrath', 'mechanic', 55,
    'Zuk shield moves 50% faster.',
    { zukShieldSpeedMultiplier: 1.50 }),
  inv('inferno_no_pillars', 'No Pillars', 'mechanic', 60,
    'Pillars in the center of the arena are disabled -- no line-of-sight shelter.',
    { pillarsDisabled: true }),
  inv('inferno_harder_hits', 'Walk the Line', 'combat_scaling', 25,
    'All monsters hit 15% harder.',
    { damageMultiplier: 1.15 }),
  inv('inferno_monster_accuracy', 'Penetration', 'combat_scaling', 25,
    'All monsters have +30% accuracy.',
    { monsterAccuracyMultiplier: 1.30 }),
  inv('inferno_prayer_drain', 'Thirsty Ghosts', 'combat_scaling', 20,
    'Prayer drain rate is doubled.',
    { prayerDrainMultiplier: 2.0 }),
  inv('inferno_quiet_prayers', 'Quiet Prayers', 'combat_scaling', 40,
    'Protection prayers block 50% of damage instead of 100%.',
    { protectionPrayerEffectiveness: 0.50 }),
  inv('inferno_no_food_drops', 'On a Diet', 'mechanic', 15,
    'No food drops from any source.',
    { suppressFoodDrops: true }),
  inv('inferno_hardcore_run', 'Hardcore Run', 'mechanic', 75,
    'No deaths allowed. Any death ends the raid.',
    { freeDeaths: 0, failOnDeath: true }),
  inv('inferno_ancient_haste', 'Ancient Haste', 'combat_scaling', 50,
    'All mob attack speeds increased by 1 tick.',
    { bossAttackSpeedBonus: 1 }),
];

// ══════════════════════════════════════════════════════════════════════════════
// THE GAUNTLET (solo minigame-raid, Crystal Wyrm equivalent)
// ══════════════════════════════════════════════════════════════════════════════

const GAUNTLET_INVOCATIONS = [
  inv('gauntlet_normal_health', 'Normal Health', 'positive', -50,
    'Hunllef at base HP.',
    { hpMultiplier: 1.0 }),
  inv('gauntlet_standard_damage', 'Standard Damage', 'positive', -40,
    'Hunllef at base damage.',
    { damageMultiplier: 1.0 }),

  inv('gauntlet_acceleration', 'Acceleration', 'combat_scaling', 20,
    'Hunllef gains 10% attack speed.',
    { bossAttackSpeedMultiplier: 1.10 }),
  inv('gauntlet_overclocked', 'Overclocked', 'combat_scaling', 40,
    'Hunllef gains 20% attack speed.',
    { bossAttackSpeedMultiplier: 1.20 },
    { conflictsWith: ['gauntlet_acceleration'] }),
  inv('gauntlet_toughened_up', 'Toughened Up', 'combat_scaling', 25,
    'Hunllef and demi-bosses have 25% more HP.',
    { hpMultiplier: 1.25 }),
  inv('gauntlet_short_prep', 'Rushed Prep', 'mechanic', 35,
    'Prep timer reduced from 10 minutes to 5 minutes.',
    { prepTimerMinutes: 5 }),
  inv('gauntlet_no_prep', 'No Prep', 'mechanic', 70,
    'No prep phase -- start the Hunllef fight with only your base kit.',
    { prepTimerMinutes: 0 },
    { conflictsWith: ['gauntlet_short_prep'] }),
  inv('gauntlet_walk_the_path', 'Walk the Path', 'mechanic', 30,
    'Player cannot run. Tornado dodges become death sentences.',
    { playerCanRun: false }),
  inv('gauntlet_no_distraction', 'No Distraction', 'mechanic', 60,
    'Player cannot use any prayer.',
    { prayerDisabled: true }),
  inv('gauntlet_aerial_assault', 'Aerial Assault', 'combat_scaling', 35,
    'Hunllef projectiles always hit.',
    { projectilesAlwaysHit: true }),
  inv('gauntlet_insanity', 'Insanity', 'combat_scaling', 50,
    'Hunllef switches attack style every 2 attacks instead of every 4.',
    { hunllefStyleSwitchInterval: 2 }),
  inv('gauntlet_tornadoes', 'Crystal Storm', 'mechanic', 45,
    'Tornadoes spawn twice as fast and move 50% faster.',
    { tornadoSpawnMultiplier: 2.0, tornadoSpeedMultiplier: 1.50 }),
  inv('gauntlet_weak_craftables', 'Weak Steel', 'mechanic', 40,
    'Crafted gear in the Gauntlet has 25% lower stats.',
    { craftedGearStatMultiplier: 0.75 }),
  inv('gauntlet_scarce_nodes', 'Barren Gauntlet', 'mechanic', 30,
    'Resource nodes (trees, ore, herbs) are 50% less common.',
    { nodeDensityMultiplier: 0.50 }),
  inv('gauntlet_harder_hits', 'Walk the Line', 'combat_scaling', 25,
    'All mobs hit 15% harder.',
    { damageMultiplier: 1.15 }),
  inv('gauntlet_monster_accuracy', 'Penetration', 'combat_scaling', 25,
    'All mobs have +30% accuracy.',
    { monsterAccuracyMultiplier: 1.30 }),
  inv('gauntlet_boss_enrage', 'Insanity Core', 'combat_scaling', 50,
    'Hunllef enrages at 50% HP: +1 attack speed, +20% max hit.',
    { enrageThreshold: 0.50, enrageSpeedBonus: 1, enrageDamageMultiplier: 1.20 }),
  inv('gauntlet_quiet_prayers', 'Quiet Prayers', 'combat_scaling', 40,
    'Protection prayers block 50% of damage instead of 100%.',
    { protectionPrayerEffectiveness: 0.50 }),
  inv('gauntlet_hardcore_run', 'Hardcore Run', 'mechanic', 75,
    'No deaths allowed. Any death ends the raid.',
    { freeDeaths: 0, failOnDeath: true }),
];

// ══════════════════════════════════════════════════════════════════════════════
// MASTER LOOKUP
// ══════════════════════════════════════════════════════════════════════════════

const INVOCATIONS_BY_RAID = {
  chambers_of_aelgard: COA_INVOCATIONS,
  theatre_of_shadows:  TOS_INVOCATIONS,
  tombs_of_aelgard:    TOA_INVOCATIONS,
  inferno:             INFERNO_INVOCATIONS,
  the_gauntlet:        GAUNTLET_INVOCATIONS,
};

// ── Raid point & loot configuration ─────────────────────────────────────────
//
// base_points    -- anchor reward before modifiers
// parTimeTicks   -- target time, beating it adds +10%
// uniqueTable    -- loot table id rolled for unique rolls
// standardTable  -- loot table id rolled for standard rolls
//
// Loot buckets (used across all raids):
//   0-999:    1 roll on standard
//   1000-1999: 2 rolls on standard
//   2000-2999: 3 rolls + chance at unique
//   3000+:    4 rolls + guaranteed unique
const RAID_POINT_CONFIG = {
  chambers_of_aelgard: {
    basePoints: 1500,
    parTimeTicks: 6000,
    uniqueTable: 'coa_unique_loot',
    standardTable: 'coa_standard_loot',
  },
  theatre_of_shadows: {
    basePoints: 1500,
    parTimeTicks: 7200,
    uniqueTable: 'tos_unique_loot',
    standardTable: 'tos_verzik_standard',
  },
  tombs_of_aelgard: {
    basePoints: 1500,
    parTimeTicks: 5400,
    uniqueTable: 'toa_unique_loot',
    standardTable: 'toa_standard_loot',
  },
  inferno: {
    basePoints: 2000,
    parTimeTicks: 10800,
    uniqueTable: 'inferno_unique_loot',
    standardTable: 'inferno_standard_loot',
  },
  the_gauntlet: {
    basePoints: 1200,
    parTimeTicks: 3600,
    uniqueTable: 'gauntlet_unique_loot',
    standardTable: 'gauntlet_standard_loot',
  },
};

// ── Invocation groups for UI categorization ─────────────────────────────────
const INVOCATION_CATEGORIES = ['positive', 'combat_scaling', 'mechanic'];

function getInvocationsForRaid(raidId) {
  return INVOCATIONS_BY_RAID[raidId] || null;
}

function getInvocation(raidId, invId) {
  const list = INVOCATIONS_BY_RAID[raidId];
  if (!list) return null;
  return list.find(i => i.id === invId) || null;
}

function getPointConfig(raidId) {
  return RAID_POINT_CONFIG[raidId] || null;
}

function getAllRaidIds() {
  return Object.keys(INVOCATIONS_BY_RAID);
}

// ── Stats summary ────────────────────────────────────────────────────────────
const totalInvocations = Object.values(INVOCATIONS_BY_RAID).reduce((s, l) => s + l.length, 0);
console.log(`[aelgard] Invocations loaded: ${totalInvocations} across ${Object.keys(INVOCATIONS_BY_RAID).length} raids`);

module.exports = {
  COA_INVOCATIONS,
  TOS_INVOCATIONS,
  TOA_INVOCATIONS,
  INFERNO_INVOCATIONS,
  GAUNTLET_INVOCATIONS,
  INVOCATIONS_BY_RAID,
  RAID_POINT_CONFIG,
  INVOCATION_CATEGORIES,
  getInvocationsForRaid,
  getInvocation,
  getPointConfig,
  getAllRaidIds,
};
