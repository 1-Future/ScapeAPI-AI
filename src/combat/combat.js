// ── Combat System (Tier 5) ────────────────────────────────────────────────────
// OSRS-accurate: accuracy roll, max hit, attack speed, XP distribution

const player = require('../player/player');

// Attack styles and their XP distribution
const STYLES = {
  accurate:   { atk: 4, str: 0, def: 0, bonus: 'attack', invisible: 3 },
  aggressive: { atk: 0, str: 4, def: 0, bonus: 'strength', invisible: 3 },
  defensive:  { atk: 0, str: 0, def: 4, bonus: 'defence', invisible: 3 },
  controlled: { atk: 1.33, str: 1.33, def: 1.33, bonus: 'shared', invisible: 1 },
};

// Prayer multipliers { prayer_name: { attack, strength, defence } }
const PRAYER_BOOSTS = {
  clarity_of_thought:  { attack: 1.05 },
  improved_reflexes:   { attack: 1.10 },
  incredible_reflexes: { attack: 1.15 },
  mystic_will:         { attack: 1.05, defence: 1.05 },
  burst_of_strength:   { strength: 1.05 },
  superhuman_strength: { strength: 1.10 },
  ultimate_strength:   { strength: 1.15 },
  thick_skin:          { defence: 1.05 },
  rock_skin:           { defence: 1.10 },
  steel_skin:          { defence: 1.15 },
  chivalry:            { attack: 1.15, strength: 1.18, defence: 1.20 },
  piety:               { attack: 1.20, strength: 1.23, defence: 1.25 },
};

function getPrayerMultiplier(activePrayers, stat) {
  let mult = 1.0;
  for (const prayer of activePrayers) {
    const boost = PRAYER_BOOSTS[prayer];
    if (boost && boost[stat]) mult = Math.max(mult, boost[stat]);
  }
  return mult;
}

// Equipment bonus from equipment object { slot: { stats: { ... } } }
function getEquipBonus(equipment, stat) {
  let total = 0;
  for (const item of Object.values(equipment)) {
    if (item?.stats?.[stat]) total += item.stats[stat];
  }
  return total;
}

// Effective level = (base_level + potion_boost + style_bonus + 8) × prayer_mult
function effectiveLevel(p, skill) {
  const style = STYLES[p.attackStyle] || STYLES.accurate;
  const base = player.getLevel(p, skill);
  const potionBoost = (p.boosts && p.boosts[skill] && p.boosts[skill].ticksLeft > 0) ? p.boosts[skill].amount : 0;
  const styleBonus = style.bonus === skill || style.bonus === 'shared' ? style.invisible : 0;
  const prayerMult = getPrayerMultiplier(p.activePrayers, skill);
  return Math.floor((base + potionBoost + styleBonus + 8) * prayerMult);
}

// Max hit (melee) = floor(0.5 + effective_str × (str_bonus + 64) / 640)
function maxHitMelee(p) {
  const effStr = effectiveLevel(p, 'strength');
  const strBonus = getEquipBonus(p.equipment, 'melee_strength');
  return Math.floor(0.5 + effStr * (strBonus + 64) / 640);
}

// Attack roll = effective_attack × (equipment_bonus + 64)
function attackRoll(p, bonusType = 'slash') {
  const effAtk = effectiveLevel(p, 'attack');
  const equipBonus = getEquipBonus(p.equipment, bonusType);
  return effAtk * (equipBonus + 64);
}

// Defence roll for NPC
function npcDefenceRoll(npc, bonusType = 'slash') {
  const defLevel = npc.stats?.defence || 1;
  const defBonus = npc.stats?.[`def_${bonusType}`] || 0;
  return (defLevel + 9) * (defBonus + 64);
}

// Accuracy: if atk > def, acc = 1 - (def+2)/(2×(atk+1)); else acc = atk/(2×(def+1))
function accuracy(atkRoll, defRoll) {
  if (atkRoll > defRoll) {
    return 1 - (defRoll + 2) / (2 * (atkRoll + 1));
  } else {
    return atkRoll / (2 * (defRoll + 1));
  }
}

// Perform a melee attack
function meleeAttack(attacker, defender) {
  const atkRoll = attackRoll(attacker);
  const defRoll = typeof defender.stats !== 'undefined'
    ? npcDefenceRoll(defender)
    : attackRoll(defender); // PvP: use defender's defence roll

  const hitChance = accuracy(atkRoll, defRoll);
  const hit = Math.random() < hitChance;
  const maxDmg = maxHitMelee(attacker);
  const damage = hit ? Math.floor(Math.random() * (maxDmg + 1)) : 0;

  return { hit, damage, maxHit: maxDmg, accuracy: hitChance };
}

// XP from combat damage
function combatXp(p, damage) {
  const style = STYLES[p.attackStyle] || STYLES.accurate;
  const results = {};
  if (style.atk > 0) {
    const xp = damage * style.atk;
    const lvl = player.addXp(p, 'attack', xp);
    results.attack = xp;
    if (lvl) results.levelUp = { skill: 'attack', level: lvl };
  }
  if (style.str > 0) {
    const xp = damage * style.str;
    const lvl = player.addXp(p, 'strength', xp);
    results.strength = xp;
    if (lvl) results.levelUp = { skill: 'strength', level: lvl };
  }
  if (style.def > 0) {
    const xp = damage * style.def;
    const lvl = player.addXp(p, 'defence', xp);
    results.defence = xp;
    if (lvl) results.levelUp = { skill: 'defence', level: lvl };
  }
  // Always get 1.33 HP XP per damage
  const hpXp = damage * 1.33;
  const hpLvl = player.addXp(p, 'hitpoints', hpXp);
  results.hitpoints = hpXp;
  if (hpLvl) results.hpLevelUp = { skill: 'hitpoints', level: hpLvl };
  return results;
}

// Attack speed (ticks between attacks). Default unarmed = 4
function getAttackSpeed(p) {
  const weapon = p.equipment.weapon;
  return weapon?.speed || 4;
}

// ── Ranged Combat (feature 4) ──────────────────────────────────────────────────

// Check if player has a bow equipped and arrows in ammo slot
function hasRangedSetup(p) {
  const weapon = p.equipment.weapon;
  if (!weapon) return false;
  const wname = weapon.name.toLowerCase();
  if (!wname.includes('bow')) return false;
  const ammo = p.equipment.ammo;
  if (!ammo) return false;
  const aname = ammo.name.toLowerCase();
  if (!aname.includes('arrow')) return false;
  return true;
}

// Effective ranged level
function effectiveRangedLevel(p) {
  const base = player.getLevel(p, 'ranged');
  const potionBoost = (p.boosts && p.boosts.ranged && p.boosts.ranged.ticksLeft > 0) ? p.boosts.ranged.amount : 0;
  const styleBonus = 8; // simplified
  return Math.floor(base + potionBoost + styleBonus);
}

// Ranged max hit: floor(0.5 + effective_ranged * (ranged_str + 64) / 640)
function maxHitRanged(p) {
  const effRng = effectiveRangedLevel(p);
  const rngStr = getEquipBonus(p.equipment, 'ranged_strength');
  return Math.floor(0.5 + effRng * (rngStr + 64) / 640);
}

// Ranged attack roll
function rangedAttackRoll(p) {
  const effRng = effectiveRangedLevel(p);
  const equipBonus = getEquipBonus(p.equipment, 'ranged');
  return effRng * (equipBonus + 64);
}

// Perform a ranged attack
function rangedAttack(attacker, defender) {
  const atkRoll = rangedAttackRoll(attacker);
  const defRoll = typeof defender.stats !== 'undefined'
    ? npcDefenceRoll(defender, 'ranged')
    : rangedAttackRoll(defender);

  const hitChance = accuracy(atkRoll, defRoll);
  const hit = Math.random() < hitChance;
  const maxDmg = maxHitRanged(attacker);
  const damage = hit ? Math.floor(Math.random() * (maxDmg + 1)) : 0;

  return { hit, damage, maxHit: maxDmg, accuracy: hitChance };
}

// Ranged XP: 4 per damage to ranged, 1.33 per damage to HP
function rangedCombatXp(p, damage) {
  const results = {};
  const xp = damage * 4;
  const lvl = player.addXp(p, 'ranged', xp);
  results.ranged = xp;
  if (lvl) results.levelUp = { skill: 'ranged', level: lvl };
  const hpXp = damage * 1.33;
  const hpLvl = player.addXp(p, 'hitpoints', hpXp);
  results.hitpoints = hpXp;
  if (hpLvl) results.hpLevelUp = { skill: 'hitpoints', level: hpLvl };
  return results;
}

// Get ranged attack range (tiles)
function getRangedRange(p) {
  const weapon = p.equipment.weapon;
  if (!weapon) return 1;
  const wname = weapon.name.toLowerCase();
  if (wname.includes('shortbow')) return 7;
  if (wname.includes('longbow')) return 10;
  return 7;
}

// ── Magic Combat (feature 5) ──────────────────────────────────────────────────

const COMBAT_SPELLS = {
  'wind strike': { runes: [{ id: 270, count: 1 }, { id: 274, count: 1 }], maxHit: 2, baseXp: 5.5, levelReq: 1 },
  'water strike': { runes: [{ id: 271, count: 1 }, { id: 270, count: 1 }, { id: 274, count: 1 }], maxHit: 4, baseXp: 7.5, levelReq: 5 },
  'earth strike': { runes: [{ id: 272, count: 2 }, { id: 270, count: 1 }, { id: 274, count: 1 }], maxHit: 6, baseXp: 9.5, levelReq: 9 },
  'fire strike': { runes: [{ id: 273, count: 3 }, { id: 270, count: 2 }, { id: 274, count: 1 }], maxHit: 8, baseXp: 11.5, levelReq: 13 },
  'wind bolt': { runes: [{ id: 270, count: 2 }, { id: 276, count: 1 }], maxHit: 9, baseXp: 13.5, levelReq: 17 },
  'water bolt': { runes: [{ id: 271, count: 2 }, { id: 270, count: 2 }, { id: 276, count: 1 }], maxHit: 10, baseXp: 16.5, levelReq: 23 },
  'earth bolt': { runes: [{ id: 272, count: 3 }, { id: 270, count: 2 }, { id: 276, count: 1 }], maxHit: 11, baseXp: 19.5, levelReq: 29 },
  'fire bolt': { runes: [{ id: 273, count: 4 }, { id: 270, count: 3 }, { id: 276, count: 1 }], maxHit: 12, baseXp: 22.5, levelReq: 35 },
  'wind blast': { runes: [{ id: 270, count: 3 }, { id: 277, count: 1 }], maxHit: 13, baseXp: 25.5, levelReq: 41 },
  'water blast': { runes: [{ id: 271, count: 3 }, { id: 270, count: 3 }, { id: 277, count: 1 }], maxHit: 14, baseXp: 28.5, levelReq: 47 },
  'earth blast': { runes: [{ id: 272, count: 4 }, { id: 270, count: 3 }, { id: 277, count: 1 }], maxHit: 15, baseXp: 31.5, levelReq: 53 },
  'fire blast': { runes: [{ id: 273, count: 5 }, { id: 270, count: 4 }, { id: 277, count: 1 }], maxHit: 16, baseXp: 34.5, levelReq: 59 },
};

// Magic accuracy based on magic level + magic bonus
function magicAttackRoll(p) {
  const base = player.getLevel(p, 'magic');
  const potionBoost = (p.boosts && p.boosts.magic && p.boosts.magic.ticksLeft > 0) ? p.boosts.magic.amount : 0;
  const effMagic = Math.floor(base + potionBoost + 8);
  const equipBonus = getEquipBonus(p.equipment, 'magic');
  return effMagic * (equipBonus + 64);
}

function magicAttack(p, defender, spell) {
  const spellDef = COMBAT_SPELLS[spell];
  if (!spellDef) return null;

  const atkRoll = magicAttackRoll(p);
  const defRoll = typeof defender.stats !== 'undefined'
    ? npcDefenceRoll(defender, 'magic')
    : magicAttackRoll(defender);

  const hitChance = accuracy(atkRoll, defRoll);
  const hit = Math.random() < hitChance;
  const damage = hit ? Math.floor(Math.random() * (spellDef.maxHit + 1)) : 0;

  return { hit, damage, maxHit: spellDef.maxHit, accuracy: hitChance, baseXp: spellDef.baseXp };
}

// Magic XP: 2 per damage + base XP per cast
function magicCombatXp(p, damage, baseXp) {
  const results = {};
  const xp = damage * 2 + baseXp;
  const lvl = player.addXp(p, 'magic', xp);
  results.magic = xp;
  if (lvl) results.levelUp = { skill: 'magic', level: lvl };
  const hpXp = damage * 1.33;
  const hpLvl = player.addXp(p, 'hitpoints', hpXp);
  results.hitpoints = hpXp;
  if (hpLvl) results.hpLevelUp = { skill: 'hitpoints', level: hpLvl };
  return results;
}

module.exports = {
  STYLES, meleeAttack, combatXp, maxHitMelee,
  attackRoll, npcDefenceRoll, accuracy,
  effectiveLevel, getEquipBonus, getAttackSpeed, getPrayerMultiplier,
  // Ranged
  hasRangedSetup, maxHitRanged, rangedAttack, rangedCombatXp, getRangedRange,
  // Magic
  COMBAT_SPELLS, magicAttack, magicCombatXp, magicAttackRoll,
};
