// ── Projectile System ─────────────────────────────────────────────────────────
// Delayed damage delivery. Projectiles fly for N ticks, then land.
// Prayer is checked on LAND tick, not attack tick (critical for Jad).
// Source: OldSchoolSDK/osrs-sdk Projectile.ts + RangedWeapon.ts

const tick = require('../engine/tick');

const activeProjectiles = []; // { id, source, target, type, damage, maxHit, landTick, onLand, spell?, aoe? }
let nextProjectileId = 1;

// ── Hit delay formulas (OSRS-accurate) ──
// Distance = Chebyshev distance between closest tiles of source and target
function meleeHitDelay() { return 1; }

function rangedHitDelay(distance) {
  return Math.floor((3 + distance) / 6) + 1;
}

function magicHitDelay(distance) {
  return Math.floor((1 + distance) / 3) + 1;
}

function blowpipeHitDelay(distance) {
  return Math.floor(distance / 6) + 1;
}

// Chebyshev distance (accounts for multi-tile NPCs via size)
function chebyshevDistance(sx, sy, sSize, tx, ty, tSize) {
  sSize = sSize || 1;
  tSize = tSize || 1;
  // Find closest tiles between two hitboxes
  const sMinX = sx, sMaxX = sx + sSize - 1;
  const sMinY = sy, sMaxY = sy + sSize - 1;
  const tMinX = tx, tMaxX = tx + tSize - 1;
  const tMinY = ty, tMaxY = ty + tSize - 1;

  let dx = 0, dy = 0;
  if (sMaxX < tMinX) dx = tMinX - sMaxX;
  else if (tMaxX < sMinX) dx = sMinX - tMaxX;
  if (sMaxY < tMinY) dy = tMinY - sMaxY;
  else if (tMaxY < sMinY) dy = sMinY - tMaxY;

  return Math.max(dx, dy);
}

// ── Create a projectile ──
// opts: {
//   source: { x, y, size?, name? },
//   target: { x, y, size?, name?, id? },
//   type: 'melee' | 'ranged' | 'magic' | 'blowpipe',
//   damage: number (pre-rolled, or null to roll on land),
//   maxHit: number,
//   hitChance: number (0-1, used if damage is null),
//   spell: string? (for magic),
//   onLand: function(projectile, currentTick)? (custom land handler),
//   checkPrayerOnLand: boolean (default true for ranged/magic),
//   prayerStyle: 'melee' | 'ranged' | 'magic' (what protection prayer blocks this),
//   isPlayerAttack: boolean (player attacks get +1 delay),
//   delayOverride: number? (skip formula, use this delay),
//   aoe: { radius, maxTargets }? (for chinchompas, barrage),
// }
function create(opts) {
  const currentTick = tick.getTick();
  const dist = chebyshevDistance(
    opts.source.x, opts.source.y, opts.source.size || 1,
    opts.target.x, opts.target.y, opts.target.size || 1
  );

  let delay;
  if (opts.delayOverride !== undefined) {
    delay = opts.delayOverride;
  } else {
    switch (opts.type) {
      case 'melee': delay = meleeHitDelay(); break;
      case 'ranged': delay = rangedHitDelay(dist); break;
      case 'magic': delay = magicHitDelay(dist); break;
      case 'blowpipe': delay = blowpipeHitDelay(dist); break;
      default: delay = 1;
    }
    // Player attacks get +1 tick delay
    if (opts.isPlayerAttack) delay += 1;
  }

  const proj = {
    id: nextProjectileId++,
    source: opts.source,
    target: opts.target,
    type: opts.type,
    damage: opts.damage,
    maxHit: opts.maxHit || 0,
    hitChance: opts.hitChance || 0,
    spell: opts.spell || null,
    prayerStyle: opts.prayerStyle || opts.type,
    checkPrayerOnLand: opts.checkPrayerOnLand !== false,
    onLand: opts.onLand || null,
    aoe: opts.aoe || null,
    landTick: currentTick + delay,
    createTick: currentTick,
    distance: dist,
  };

  activeProjectiles.push(proj);
  return proj;
}

// ── Process projectiles (called during projectiles tick phase) ──
// Returns array of landed projectiles for the combat system to handle
function processLandings(currentTick) {
  const landed = [];
  for (let i = activeProjectiles.length - 1; i >= 0; i--) {
    if (activeProjectiles[i].landTick <= currentTick) {
      landed.push(activeProjectiles.splice(i, 1)[0]);
    }
  }
  return landed;
}

// Get all active projectiles (for display/tracking)
function getActive() {
  return activeProjectiles;
}

// Get projectiles targeting a specific entity
function getTargeting(targetId) {
  return activeProjectiles.filter(p => p.target.id === targetId);
}

// Cancel all projectiles from a source (e.g., NPC died)
function cancelFrom(sourceId) {
  for (let i = activeProjectiles.length - 1; i >= 0; i--) {
    if (activeProjectiles[i].source.id === sourceId) activeProjectiles.splice(i, 1);
  }
}

// Cancel all projectiles targeting an entity (e.g., target died)
function cancelTargeting(targetId) {
  for (let i = activeProjectiles.length - 1; i >= 0; i--) {
    if (activeProjectiles[i].target.id === targetId) activeProjectiles.splice(i, 1);
  }
}

// Check if a prayer blocks this projectile's style
function isPrayerBlocking(activePrayers, prayerStyle) {
  const protections = {
    melee: 'protect_from_melee',
    ranged: 'protect_from_missiles',
    magic: 'protect_from_magic',
  };
  const requiredPrayer = protections[prayerStyle];
  return requiredPrayer && activePrayers.has(requiredPrayer);
}

module.exports = {
  create, processLandings, getActive, getTargeting,
  cancelFrom, cancelTargeting, isPrayerBlocking,
  chebyshevDistance,
  meleeHitDelay, rangedHitDelay, magicHitDelay, blowpipeHitDelay,
};
