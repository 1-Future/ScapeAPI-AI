// ── Line of Sight System ──────────────────────────────────────────────────────
// Bresenham-variant raycasting matching OSRS LoS mechanics.
// Source: OldSchoolSDK/osrs-sdk LineOfSight.ts (Woox's analysis)
//
// Key rules:
// - Melee range (r=1): special adjacency check, not raycasting
// - Ranged/Magic: Bresenham ray from source to target
// - Walls block LoS per-edge (directional masks)
// - Multi-tile NPCs: check from closest tile on hitbox

const walls = require('./walls');
const tiles = require('./tiles');

// ── Directional LoS masks ──
// These correspond to wall edges that block line of sight
const LOS_MASK = {
  FULL: 0x3F,   // All edges block
  N: walls.EDGE.N,
  E: walls.EDGE.E,
  S: walls.EDGE.S,
  W: walls.EDGE.W,
};

// ── Melee adjacency check (range 1) ──
// For melee, we check if source is adjacent to ANY tile on target's hitbox
// and that no wall blocks the edge between them
function isMeleeAdjacent(sx, sy, tx, ty, tSize, layer) {
  tSize = tSize || 1;

  for (let ox = 0; ox < tSize; ox++) {
    for (let oy = 0; oy < tSize; oy++) {
      const bx = tx + ox, by = ty + oy;
      const dx = sx - bx, dy = sy - by;

      // Must be exactly adjacent (including diagonal)
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) continue;
      if (dx === 0 && dy === 0) continue; // On top of (not adjacent)

      // Check wall between source and this hitbox tile
      if (!walls.isEdgeBlocked(sx, sy, bx, by, layer)) return true;
    }
  }
  return false;
}

// ── Find closest tile on a multi-tile NPC to a point ──
function closestTileOnHitbox(px, py, nx, ny, nSize) {
  nSize = nSize || 1;
  const cx = Math.max(nx, Math.min(px, nx + nSize - 1));
  const cy = Math.max(ny, Math.min(py, ny + nSize - 1));
  return { x: cx, y: cy };
}

// ── Bresenham LoS raycasting ──
// Returns true if there is clear line of sight from (x1,y1) to (x2,y2)
// Checks wall edges along the ray path
function hasLineOfSight(x1, y1, x2, y2, layer) {
  layer = layer || 0;

  if (x1 === x2 && y1 === y2) return true;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const dxAbs = Math.abs(dx);
  const dyAbs = Math.abs(dy);

  // Walk along the longer axis using Bresenham-style stepping
  if (dxAbs >= dyAbs) {
    // Step along X axis
    const xStep = dx > 0 ? 1 : -1;
    const ySlope = dyAbs === 0 ? 0 : (dy << 16) / dxAbs;
    let yFixed = (y1 << 16) + 0x8000; // Start at center of tile (16-bit fixed point)

    let cx = x1;
    for (let i = 0; i < dxAbs; i++) {
      const nx = cx + xStep;
      const cy = yFixed >> 16;
      yFixed += (dy > 0 ? 1 : -1) * ((dyAbs << 16) / dxAbs);
      const ny = yFixed >> 16;

      // Check wall on horizontal step
      if (walls.isEdgeBlocked(cx, cy, nx, cy, layer)) return false;

      // If Y also changed, check the diagonal is clear
      if (ny !== cy) {
        if (walls.isEdgeBlocked(cx, cy, cx, ny, layer)) return false;
        if (walls.isEdgeBlocked(nx, cy, nx, ny, layer)) return false;
      }

      cx = nx;
    }
  } else {
    // Step along Y axis
    const yStep = dy > 0 ? 1 : -1;
    const xSlope = dxAbs === 0 ? 0 : (dx << 16) / dyAbs;
    let xFixed = (x1 << 16) + 0x8000;

    let cy = y1;
    for (let i = 0; i < dyAbs; i++) {
      const ny = cy + yStep;
      const cx = xFixed >> 16;
      xFixed += (dx > 0 ? 1 : -1) * ((dxAbs << 16) / dyAbs);
      const nx = xFixed >> 16;

      // Check wall on vertical step
      if (walls.isEdgeBlocked(cx, cy, cx, ny, layer)) return false;

      // If X also changed, check the diagonal is clear
      if (nx !== cx) {
        if (walls.isEdgeBlocked(cx, cy, nx, cy, layer)) return false;
        if (walls.isEdgeBlocked(cx, ny, nx, ny, layer)) return false;
      }

      cy = ny;
    }
  }

  return true;
}

// ── NPC to Player LoS ──
// For multi-tile NPCs, checks from the CLOSEST tile on the NPC hitbox to the player
function npcHasLoS(npcX, npcY, npcSize, playerX, playerY, layer, range) {
  range = range || 15;
  npcSize = npcSize || 1;

  const closest = closestTileOnHitbox(playerX, playerY, npcX, npcY, npcSize);
  const dist = Math.max(Math.abs(closest.x - playerX), Math.abs(closest.y - playerY));

  if (dist > range) return false;

  // Melee range: use adjacency check
  if (range === 1) return isMeleeAdjacent(playerX, playerY, npcX, npcY, npcSize, layer);

  return hasLineOfSight(closest.x, closest.y, playerX, playerY, layer);
}

// ── Player to NPC LoS ──
function playerHasLoS(playerX, playerY, npcX, npcY, npcSize, layer, range) {
  range = range || 15;
  npcSize = npcSize || 1;

  const closest = closestTileOnHitbox(playerX, playerY, npcX, npcY, npcSize);
  const dist = Math.max(Math.abs(closest.x - playerX), Math.abs(closest.y - playerY));

  if (dist > range) return false;

  if (range === 1) return isMeleeAdjacent(playerX, playerY, npcX, npcY, npcSize, layer);

  return hasLineOfSight(playerX, playerY, closest.x, closest.y, layer);
}

// ── Check if an entity can be safespotted from a position ──
// Returns true if there's a wall/pillar between player and NPC that blocks LoS
function isSafespotted(playerX, playerY, npcX, npcY, npcSize, layer) {
  npcSize = npcSize || 1;
  const closest = closestTileOnHitbox(playerX, playerY, npcX, npcY, npcSize);
  return !hasLineOfSight(closest.x, closest.y, playerX, playerY, layer);
}

module.exports = {
  hasLineOfSight, npcHasLoS, playerHasLoS,
  isMeleeAdjacent, isSafespotted,
  closestTileOnHitbox, LOS_MASK,
};
