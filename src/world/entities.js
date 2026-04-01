// ── Destructible Entity System ────────────────────────────────────────────────
// Entities with HP that can be damaged and destroyed.
// Used for: Inferno pillars (block LoS, attacked by nibblers)
//           Zuk shield (moves, blocks Zuk's damage)
//           Any future destructible objects

const tick = require('../engine/tick');
const walls = require('./walls');

let nextEntityId = 1;
const entities = new Map(); // id → entity

function create(opts) {
  const id = nextEntityId++;
  const entity = {
    id,
    name: opts.name || 'Entity',
    type: opts.type || 'destructible', // destructible, shield, pillar
    x: opts.x,
    y: opts.y,
    layer: opts.layer || 0,
    size: opts.size || 1, // tile footprint
    hp: opts.maxHp || 100,
    maxHp: opts.maxHp || 100,
    dead: false,
    instance: opts.instance || null,

    // LoS blocking: if true, this entity blocks line of sight
    blocksLoS: opts.blocksLoS !== undefined ? opts.blocksLoS : false,
    // Movement blocking: if true, this entity blocks NPC/player movement
    blocksMovement: opts.blocksMovement !== undefined ? opts.blocksMovement : false,

    // Movement (for Zuk shield)
    canMove: opts.canMove || false,
    moveDirection: opts.moveDirection || 0, // -1=left, 0=none, 1=right
    moveSpeed: opts.moveSpeed || 1, // tiles per tick
    movePause: 0, // ticks remaining in pause at boundary
    movePauseDuration: opts.movePauseDuration || 5,
    moveBounds: opts.moveBounds || null, // { minX, maxX } — shield bounces between these

    // Hooks
    onDamage: opts.onDamage || null, // fn(entity, damage, source)
    onDestroy: opts.onDestroy || null, // fn(entity)
    onTick: opts.onTick || null, // fn(entity, currentTick)

    // Custom state
    state: opts.state || {},
  };

  entities.set(id, entity);

  // If this entity blocks movement, place walls around its edges
  if (entity.blocksMovement) placeEntityWalls(entity);

  return entity;
}

function get(id) { return entities.get(id); }

function getAt(x, y, layer, instanceId) {
  for (const e of entities.values()) {
    if (e.dead || e.layer !== layer) continue;
    if (instanceId !== undefined && e.instance !== instanceId) continue;
    if (x >= e.x && x < e.x + e.size && y >= e.y && y < e.y + e.size) return e;
  }
  return null;
}

function getInInstance(instanceId) {
  const result = [];
  for (const e of entities.values()) {
    if (e.instance === instanceId && !e.dead) result.push(e);
  }
  return result;
}

function damage(entity, amount, source) {
  if (entity.dead) return;
  entity.hp = Math.max(0, entity.hp - amount);
  if (entity.onDamage) entity.onDamage(entity, amount, source);
  if (entity.hp <= 0) {
    entity.dead = true;
    if (entity.blocksMovement) removeEntityWalls(entity);
    if (entity.onDestroy) entity.onDestroy(entity);
  }
}

function remove(id) {
  const entity = entities.get(id);
  if (entity && entity.blocksMovement) removeEntityWalls(entity);
  entities.delete(id);
}

function removeInstance(instanceId) {
  for (const [id, e] of entities) {
    if (e.instance === instanceId) {
      if (e.blocksMovement) removeEntityWalls(e);
      entities.delete(id);
    }
  }
}

// ── Place walls around entity edges to block movement ──
function placeEntityWalls(entity) {
  const size = entity.size || 1;
  for (let ox = 0; ox < size; ox++) {
    for (let oy = 0; oy < size; oy++) {
      let mask = 0;
      if (oy === 0) mask |= walls.EDGE.N; // North edge of bottom row
      if (oy === size - 1) mask |= walls.EDGE.S; // South edge of top row
      if (ox === 0) mask |= walls.EDGE.W; // West edge of left column
      if (ox === size - 1) mask |= walls.EDGE.E; // East edge of right column
      if (mask) {
        const key = `entity_${entity.id}_${ox}_${oy}`;
        const existing = walls.getWallEdge(entity.x + ox, entity.y + oy, entity.layer);
        walls.setWallEdge(entity.x + ox, entity.y + oy, existing | mask, entity.layer);
      }
    }
  }
}

function removeEntityWalls(entity) {
  const size = entity.size || 1;
  for (let ox = 0; ox < size; ox++) {
    for (let oy = 0; oy < size; oy++) {
      let mask = 0;
      if (oy === 0) mask |= walls.EDGE.N;
      if (oy === size - 1) mask |= walls.EDGE.S;
      if (ox === 0) mask |= walls.EDGE.W;
      if (ox === size - 1) mask |= walls.EDGE.E;
      if (mask) {
        const existing = walls.getWallEdge(entity.x + ox, entity.y + oy, entity.layer);
        walls.setWallEdge(entity.x + ox, entity.y + oy, existing & ~mask, entity.layer);
      }
    }
  }
}

// ── Shield movement (Zuk shield bounces left/right) ──
function moveShield(entity) {
  if (!entity.canMove || entity.dead || !entity.moveBounds) return;

  if (entity.movePause > 0) {
    entity.movePause--;
    return;
  }

  // Remove old walls before moving
  if (entity.blocksMovement) removeEntityWalls(entity);

  entity.x += entity.moveDirection * entity.moveSpeed;

  // Bounce at boundaries
  if (entity.x <= entity.moveBounds.minX) {
    entity.x = entity.moveBounds.minX;
    entity.moveDirection = 1;
    entity.movePause = entity.movePauseDuration;
  } else if (entity.x >= entity.moveBounds.maxX) {
    entity.x = entity.moveBounds.maxX;
    entity.moveDirection = -1;
    entity.movePause = entity.movePauseDuration;
  }

  // Place new walls at new position
  if (entity.blocksMovement) placeEntityWalls(entity);
}

// ── Entity tick (called during NPC timer phase) ──
function entityTick(currentTick) {
  for (const entity of entities.values()) {
    if (entity.dead) continue;
    if (entity.canMove) moveShield(entity);
    if (entity.onTick) entity.onTick(entity, currentTick);
  }
}

// ── Check if a point is behind a shield (relative to Zuk) ──
function isBehindShield(px, py, shieldEntity, threatX) {
  if (!shieldEntity || shieldEntity.dead) return false;
  const shieldLeft = shieldEntity.x;
  const shieldRight = shieldEntity.x + shieldEntity.size - 1;
  // Player must be within shield's X range and south of shield
  return px >= shieldLeft && px <= shieldRight && py > shieldEntity.y;
}

module.exports = {
  create, get, getAt, getInInstance,
  damage, remove, removeInstance,
  entityTick, moveShield, isBehindShield,
  entities,
};
