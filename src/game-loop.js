// ── Game Loop — extracted tick logic for both server and headless training ──
// Each function processes ONE player per tick. The caller iterates players.

const tick = require('./engine/tick');
const tiles = require('./world/tiles');
const walls = require('./world/walls');
const npcs = require('./world/npcs');
const pathfinding = require('./world/pathfinding');
const combat = require('./combat/combat');
const items = require('./data/items');
const actions = require('./engine/actions');
const events = require('./engine/events');
const objects = require('./world/objects');
let pets = null;
try { pets = require('./engine/pets'); } catch (_) { pets = null; }

// Helper: get skill level
function getLevel(p, skill) {
  return p.skills?.[skill]?.level || 1;
}

// Helper: calc weight
function calcWeight(p, getItem) {
  let w = 0;
  for (const slot of p.inventory) {
    if (slot) { const def = getItem(slot.id); if (def?.weight) w += def.weight * (slot.count || 1); }
  }
  for (const item of Object.values(p.equipment || {})) {
    if (item) { const def = getItem(item.id); if (def?.weight) w += def.weight; }
  }
  p.weight = w;
}

// ── Movement tick for one player ──
function playerMovementTick(p, currentTick, sendFn) {
  if (p.path.length === 0) return;

  const step = p.path.shift();
  p.x = step.x;
  p.y = step.y;
  if (p._bankOpen) p._bankOpen = false;

  // Running: take second step
  if (p.running && p.path.length > 0 && p.runEnergy > 0) {
    const step2 = p.path.shift();
    p.x = step2.x;
    p.y = step2.y;
    calcWeight(p, (id) => items.get(id));
    const agilityLvl = getLevel(p, 'agility');
    const drain = Math.floor((67 + Math.max(0, p.weight)) * (300 - agilityLvl) / 300);
    p.runEnergy = Math.max(0, p.runEnergy - drain);
    if (p.runEnergy <= 0) {
      p.running = false;
      if (sendFn) sendFn("You're out of run energy.");
    }
  }

  if (actions.isActive(p)) actions.cancel(p);
  events.emit('player_move', { player: p });
}

// ── Combat tick for one player (vs NPC) ──
function playerCombatTick(p, currentTick, sendFn) {
  if (!p.combatTarget) return;
  const npc = npcs.getNpc(p.combatTarget);
  if (!npc || npc.dead) { p.combatTarget = null; p.busy = false; return; }

  const isRanged = combat.hasRangedSetup(p);
  const requiredRange = isRanged ? (combat.getRangedRange ? combat.getRangedRange(p) : 7) : 1;

  // Check range + LoS using closest tile on NPC hitbox (supports multi-tile NPCs)
  const losModule = require('./world/los');
  const npcSize = npc.size || 1;
  const closest = losModule.closestTileOnHitbox(p.x, p.y, npc.x, npc.y, npcSize);
  const dist = Math.max(Math.abs(p.x - closest.x), Math.abs(p.y - closest.y));
  let hasLoS = true;
  try {
    hasLoS = losModule.playerHasLoS(p.x, p.y, npc.x, npc.y, npcSize, p.layer, requiredRange);
  } catch {}

  if (dist > requiredRange || !hasLoS) {
    // Walk to closest tile on NPC hitbox, not just NPC anchor
    let blocked = null;
    if (p.instance) {
      try {
        const entities = require('./world/entities');
        const ents = entities.getInInstance(p.instance);
        blocked = new Set();
        for (const e of ents) {
          if (!e.blocksMovement || e.dead) continue;
          const sz = e.size || 1;
          for (let oy = 0; oy < sz; oy++) for (let ox = 0; ox < sz; ox++) blocked.add(`${e.x+ox},${e.y+oy}`);
        }
      } catch {}
    }
    const path = pathfinding.findPath(p.x, p.y, closest.x, closest.y, p.layer, blocked);
    if (path) {
      if (isRanged && path.length > requiredRange) p.path = path.slice(0, -(requiredRange));
      else if (path.length > 1) p.path = path.slice(0, -1);
    }
    return;
  }

  // NPC retaliates if in range (accounts for multi-tile NPC)
  const npcClosest = losModule.closestTileOnHitbox(p.x, p.y, npc.x, npc.y, npcSize);
  const npcDist = Math.max(Math.abs(p.x - npcClosest.x), Math.abs(p.y - npcClosest.y));
  if (!npc.dead && npc.combat > 0 && npcDist <= (npc.attackRange || 1)) {
    if (npc.nextAttackTick === Infinity) npc.nextAttackTick = currentTick + (npc.attackSpeed || 4);
    if (currentTick >= npc.nextAttackTick) {
      npc.nextAttackTick = currentTick + (npc.attackSpeed || 4);
      const npcAtkLevel = npc.stats?.attack || 1;
      const npcAtkBonus = npc.stats?.atk_bonus || 0;
      const npcAtkRoll = (npcAtkLevel + 9) * (npcAtkBonus + 64);
      const npcStyle = npc.attackStyle || 'slash';
      const playerDefRoll = combat.effectiveLevel(p, 'defence') * (combat.getEquipBonus(p.equipment, `def_${npcStyle}`) + 64);
      const npcHitChance = combat.accuracy(npcAtkRoll, playerDefRoll);
      const npcHit = Math.random() < npcHitChance;
      let npcDmg = npcHit ? Math.floor(Math.random() * ((npc.maxHit || 1) + 1)) : 0;
      // Protection prayer
      if (npcDmg > 0 && p.activePrayers?.size > 0) {
        const prayerMap = { melee: 'protect_from_melee', ranged: 'protect_from_missiles', magic: 'protect_from_magic' };
        const needed = prayerMap[npc.attackStyle || 'melee'];
        if (needed && p.activePrayers.has(needed)) npcDmg = 0;
      }
      p.hp = Math.max(0, p.hp - npcDmg);
      if (npcDmg > 0 && sendFn) sendFn(`The ${npc.name} hits you for ${npcDmg} damage. HP: ${p.hp}/${p.maxHp}`);
      if (p.hp <= 0) {
        if (sendFn) sendFn('Oh dear, you are dead!');
        events.emit('player_death', { player: p, killer: npc });
        return;
      }
    }
  }

  // Player attack
  if (currentTick < (p.nextAttackTick || 0)) return;
  p.nextAttackTick = currentTick + combat.getAttackSpeed(p);

  let result, combatType = 'melee';
  if (isRanged) {
    const ammo = p.equipment?.ammo;
    if (!ammo || (ammo.count || 0) < 1) {
      if (sendFn) sendFn('You have no arrows left!');
      p.combatTarget = null; p.busy = false;
      return;
    }
    ammo.count = (ammo.count || 1) - 1;
    if (ammo.count <= 0) delete p.equipment.ammo;
    result = combat.rangedAttack(p, npc);
    combatType = 'ranged';
  } else {
    result = combat.meleeAttack(p, npc);
  }

  const hpBefore = npc.hp;
  npc.hp = Math.max(0, npc.hp - result.damage);

  let msg = result.hit
    ? `You hit the ${npc.name} for ${result.damage} damage.`
    : `You miss the ${npc.name}.`;

  if (npc.hp <= 0) {
    npc.dead = true;
    npc.respawnAt = npc.respawnTicks > 0 ? currentTick + npc.respawnTicks : Infinity;
    p.combatTarget = null;
    p.busy = false;
    msg += ` The ${npc.name} is dead! (had ${hpBefore} HP)`;
    if (!p.killCounts) p.killCounts = {};
    const kcKey = npc.name.toLowerCase();
    p.killCounts[kcKey] = (p.killCounts[kcKey] || 0) + 1;
    events.emit('npc_kill', { player: p, npc, killCount: p.killCounts[kcKey] });
    if (npc.onDeath) npc.onDeath(npc, p, currentTick);
  }

  if (sendFn) sendFn(msg);

  // XP
  if (combatType === 'ranged') combat.rangedCombatXp(p, result.damage);
  else combat.combatXp(p, result.damage);
}

// ── World tick for one player (regen, prayer drain, poison, etc.) ──
function playerWorldTick(p, currentTick, sendFn) {
  // HP regen every 100 ticks
  if (currentTick % 100 === 0 && p.hp < p.maxHp && p.hp > 0) {
    p.hp = Math.min(p.maxHp, p.hp + 1);
  }

  // Prayer drain — OSRS-accurate formula (matches InfernoTrainer osrs-sdk)
  // Each prayer has a drain rate. Each tick: drainCounter += sum(drainRates).
  // When drainCounter > prayerDrainResistance (2 * prayerBonus + 60), drain 1 PP.
  // Reference: https://oldschool.runescape.wiki/w/Prayer#Prayer_drain_mechanics
  if (p.activePrayers?.size > 0) {
    const DRAIN_RATES = {
      'protect_from_magic': 12, 'protect_from_missiles': 12, 'protect_from_melee': 12,
      'rigour': 24, 'augury': 24, 'piety': 24,
      'eagle_eye': 12, 'mystic_might': 12, 'steel_skin': 8,
      'protect_item': 6, 'preserve': 3,
    };
    // Calculate prayer bonus from equipment
    let prayerBonus = 0;
    if (p.equipment) {
      for (const slot of Object.values(p.equipment)) {
        if (slot?.stats?.prayer) prayerBonus += slot.stats.prayer;
      }
    }
    const resistance = 2 * prayerBonus + 60;
    // Sum drain rates of all active prayers
    let drainThisTick = 0;
    for (const prayer of p.activePrayers) {
      drainThisTick += DRAIN_RATES[prayer] || 6; // Default 6 for unknown prayers
    }
    if (!p._prayerDrainCounter) p._prayerDrainCounter = 0;
    p._prayerDrainCounter += drainThisTick;
    while (p._prayerDrainCounter >= resistance) {
      p.prayerPoints--;
      p._prayerDrainCounter -= resistance;
    }
    if (p.prayerPoints <= 0) {
      p.prayerPoints = 0;
      p._prayerDrainCounter = 0;
      p.activePrayers.clear();
      if (sendFn) sendFn('You have run out of prayer points.');
    }
  }

  // Boost decay every 100 ticks
  if (p.boosts && currentTick % 100 === 0) {
    for (const [skill, boost] of Object.entries(p.boosts)) {
      if (boost.amount > 0) boost.amount = Math.max(0, boost.amount - 1);
      else if (boost.amount < 0) boost.amount = Math.min(0, boost.amount + 1);
      if (boost.amount === 0) delete p.boosts[skill];
    }
  }

  // Run energy restore while stationary
  if (p.path.length === 0 && p.runEnergy < 10000) {
    const agilityLvl = getLevel(p, 'agility');
    const regen = Math.floor(agilityLvl / 6) + 8;
    p.runEnergy = Math.min(10000, p.runEnergy + regen);
  }

  // Process tick-based actions
  actions.processTick(p, currentTick);

  // Pet companion tick — follower path-follow + affinity drip while summoned.
  if (pets && typeof pets.tick === 'function') {
    try { pets.tick(p, currentTick); } catch (e) { /* non-fatal */ }
  }
}

module.exports = {
  playerMovementTick,
  playerCombatTick,
  playerWorldTick,
  getLevel,
  calcWeight,
};
