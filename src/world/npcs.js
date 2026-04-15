// ── NPC System (3.2, 3.3, 5.7) ───────────────────────────────────────────────
// NPCs exist in the world, wander, fight back, die, respawn, drop loot
// Supports multi-tile NPCs (size > 1), custom AI behaviors, and LoS

const tick = require('../engine/tick');
const tiles = require('./tiles');
const persistence = require('../engine/persistence');
const los = require('./los');

let nextNpcId = 1;
const npcs = new Map(); // id → npc
const npcDefs = new Map(); // defId → template

function defineNpc(defId, opts) {
  // Pass through all caller-supplied fields (tags, weakness, resistance,
  // phases, raidRoom, etc.) — the defineNpc whitelist used to drop everything
  // we didn't explicitly know about, which broke boss metadata like `tags`.
  // Start from the raw opts then normalize required defaults on top.
  npcDefs.set(defId, {
    ...opts,
    name: opts.name || defId,
    examine: opts.examine || 'An NPC.',
    combat: opts.combat || 0,
    maxHp: opts.maxHp || 1,
    stats: opts.stats || { attack: 1, strength: 1, defence: 1 },
    attackSpeed: opts.attackSpeed || 4,
    attackRange: opts.attackRange || 1, // 1=melee, >1=ranged/magic
    maxHit: opts.maxHit || 1,
    size: opts.size || 1, // tile footprint (1=1x1, 2=2x2, etc.)
    aggressive: opts.aggressive || false,
    aggroRange: opts.aggroRange || 3,
    wanderRadius: opts.wanderRadius || 5,
    respawnTicks: opts.respawnTicks || 50,
    drops: opts.drops || [], // [{ id, name, weight, min, max }]
    dialogue: opts.dialogue || null,
    thieving: opts.thieving || null, // { level, xp, loot, stunDamage }
    poisonDamage: opts.poisonDamage || 0, // max poison damage (0 = no poison)
    attackStyle: opts.attackStyle || 'melee', // melee, ranged, magic
    canMelee: opts.canMelee !== undefined ? opts.canMelee : true, // can switch to melee when close
    // Custom AI hooks (for Inferno mobs, bosses, etc.)
    onSpawn: opts.onSpawn || null, // fn(npc)
    onTick: opts.onTick || null, // fn(npc, currentTick) — custom per-tick behavior
    onAttack: opts.onAttack || null, // fn(npc, target, currentTick) — custom attack logic
    onDeath: opts.onDeath || null, // fn(npc, killer, currentTick)
    onDamageTaken: opts.onDamageTaken || null, // fn(npc, damage, attacker, currentTick)
    autoRetaliate: opts.autoRetaliate !== undefined ? opts.autoRetaliate : true,
    blocksMobs: opts.blocksMobs !== undefined ? opts.blocksMobs : true, // nibblers don't block
    flinchDelay: opts.flinchDelay || null, // override default flinch (floor(speed/2))
    canMove: opts.canMove !== undefined ? opts.canMove : true,
    // Explicitly preserve tagging/combat-meta fields (redundant with ...opts
    // but serves as documentation of the boss-authoring contract):
    tags: Array.isArray(opts.tags) ? opts.tags.slice() : [],
    weakness: opts.weakness || null,
    resistance: opts.resistance || null,
  });
}

function spawnNpc(defId, x, y, layer = 0, overrides = {}) {
  const def = npcDefs.get(defId);
  if (!def) return null;
  const id = nextNpcId++;
  const npc = {
    id, defId, ...def, ...overrides,
    x, y, layer,
    spawnX: x, spawnY: y,
    hp: overrides.maxHp || def.maxHp,
    maxHp: overrides.maxHp || def.maxHp,
    target: null,
    nextAttackTick: Infinity,
    dead: false,
    dying: 0, // death animation ticks remaining
    respawnAt: 0,
    aggroTimers: new Map(),
    frozen: 0, // ticks remaining where NPC can't move
    stunned: 0, // ticks remaining where NPC can't act at all
    ticksWithoutLoS: 0, // for meleer dig mechanic
    lastAttackStyle: null, // for blob prayer scanning
    customState: {}, // per-mob custom state (scan result, dig status, etc.)
    instance: overrides.instance || null, // instance ID if in instanced content
  };
  npcs.set(id, npc);
  if (def.onSpawn) def.onSpawn(npc);
  return npc;
}

function getNpc(id) { return npcs.get(id); }

function getNpcsNear(x, y, range = 15, layer = 0, instanceId = null) {
  const result = [];
  for (const npc of npcs.values()) {
    if (npc.dead || npc.layer !== layer) continue;
    if (instanceId !== undefined && npc.instance !== instanceId) continue;
    // Check distance to closest tile on hitbox
    const closest = los.closestTileOnHitbox(x, y, npc.x, npc.y, npc.size || 1);
    if (Math.abs(closest.x - x) <= range && Math.abs(closest.y - y) <= range) result.push(npc);
  }
  return result;
}

function findNpcByName(name, x, y, range = 15, layer = 0, instanceId = null) {
  const lower = name.toLowerCase();
  for (const npc of npcs.values()) {
    if (npc.dead || npc.layer !== layer) continue;
    if (instanceId !== undefined && npc.instance !== instanceId) continue;
    const closest = los.closestTileOnHitbox(x, y, npc.x, npc.y, npc.size || 1);
    if (Math.abs(closest.x - x) > range || Math.abs(closest.y - y) > range) continue;
    if (npc.name.toLowerCase() === lower) return npc;
  }
  return null;
}

// ── Check if a multi-tile NPC can move to a position ──
function canNpcMoveTo(npc, nx, ny) {
  const size = npc.size || 1;
  for (let ox = 0; ox < size; ox++) {
    for (let oy = 0; oy < size; oy++) {
      if (!tiles.isWalkable(nx + ox, ny + oy, npc.layer)) return false;
    }
  }
  // Block movement into entities (pillars, etc.)
  if (npc.instance) {
    try {
      const entities = require('./entities');
      const ents = entities.getInInstance(npc.instance);
      for (const e of ents) {
        if (!e.blocksMovement || e.dead) continue;
        const esz = e.size || 1;
        if (nx + size > e.x && nx < e.x + esz && ny + size > e.y && ny < e.y + esz) return false;
      }
    } catch {}
  }
  // Soft NPC-to-NPC collision — blocks movement but allows push-through after 3 ticks stuck
  // This prevents clumping while avoiding gridlock
  if (!npc._stuckTicks) npc._stuckTicks = 0;
  let blocked = false;
  for (const other of npcs.values()) {
    if (other === npc || other.dead || other.layer !== npc.layer) continue;
    if (npc.instance !== undefined && other.instance !== npc.instance) continue;
    const osz = other.size || 1;
    if (nx + size > other.x && nx < other.x + osz && ny + size > other.y && ny < other.y + osz) {
      blocked = true;
      break;
    }
  }
  if (blocked) {
    npc._stuckTicks++;
    if (npc._stuckTicks < 3) return false; // block for 3 ticks
    // After 3 ticks, allow push-through to prevent deadlock
    npc._stuckTicks = 0;
  } else {
    npc._stuckTicks = 0;
  }
  return true;
}

// ── Check if player is "under" a multi-tile NPC ──
function isUnderNpc(px, py, npc) {
  const size = npc.size || 1;
  return px >= npc.x && px < npc.x + size && py >= npc.y && py < npc.y + size;
}

// ── OSRS-accurate NPC movement: 1 tile per tick towards target ──
function moveNpcTowards(npc, tx, ty) {
  if (!npc.canMove || npc.frozen > 0 || npc.stunned > 0) return;
  const size = npc.size || 1;

  // Sign-based 1-tile movement (OSRS NPC AI)
  let dx = Math.sign(tx - npc.x);
  let dy = Math.sign(ty - npc.y);

  if (dx === 0 && dy === 0) return;

  // OSRS large NPC movement: when diagonal to target, step cardinally (X first = west bias)
  // This is the "west lure" mechanic critical for Inferno safespotting
  if (size >= 2 && dx !== 0 && dy !== 0) {
    // Large NPCs try X (west/east) first, then Y, then diagonal as last resort
    if (canNpcMoveTo(npc, npc.x + dx, npc.y)) {
      npc.x += dx;
      return;
    }
    if (canNpcMoveTo(npc, npc.x, npc.y + dy)) {
      npc.y += dy;
      return;
    }
    if (canNpcMoveTo(npc, npc.x + dx, npc.y + dy)) {
      npc.x += dx;
      npc.y += dy;
      return;
    }
    return; // Stuck
  }

  // Small NPCs (size 1): try diagonal first
  if (dx !== 0 && dy !== 0) {
    if (canNpcMoveTo(npc, npc.x + dx, npc.y + dy)) {
      npc.x += dx;
      npc.y += dy;
      return;
    }
  }

  // Cardinal fallback
  if (dx !== 0 && canNpcMoveTo(npc, npc.x + dx, npc.y)) {
    npc.x += dx;
    return;
  }
  if (dy !== 0 && canNpcMoveTo(npc, npc.x, npc.y + dy)) {
    npc.y += dy;
    return;
  }

  // OSRS: when player is under NPC, NPC moves randomly to try to get them out
  // This prevents exploiting predictable movement patterns
  if (isUnderNpc(tx, ty, npc)) {
    // Random direction — not predictable like SW corner rule
    const dirs = [{dx:1,dy:0},{dx:-1,dy:0},{dx:0,dy:1},{dx:0,dy:-1}];
    // Shuffle
    for (let i = dirs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [dirs[i], dirs[j]] = [dirs[j], dirs[i]];
    }
    for (const d of dirs) {
      if (canNpcMoveTo(npc, npc.x + d.dx, npc.y + d.dy)) {
        npc.x += d.dx;
        npc.y += d.dy;
        break;
      }
    }
  }
}

// ── NPC timer tick: decrement cooldowns ──
function npcTimerTick(currentTick) {
  for (const npc of npcs.values()) {
    if (npc.dead) continue;
    if (npc.dying > 0) {
      npc.dying--;
      if (npc.dying <= 0) {
        npc.dead = true;
        npc.respawnAt = npc.respawnTicks > 0 ? currentTick + npc.respawnTicks : Infinity;
      }
      continue;
    }
    if (npc.frozen > 0) npc.frozen--;
    if (npc.stunned > 0) npc.stunned--;
    // Custom per-tick behavior (Inferno mobs, etc.)
    if (npc.onTick) npc.onTick(npc, currentTick);
  }
}

// ── NPC movement tick ──
function npcMovementTick(currentTick) {
  for (const npc of npcs.values()) {
    if (npc.dead || npc.dying > 0 || npc.stunned > 0 || npc.frozen > 0) continue;
    if (!npc.canMove) continue;

    // Respawn check
    if (npc.dead && currentTick >= npc.respawnAt) {
      npc.dead = false;
      npc.hp = npc.maxHp;
      npc.x = npc.spawnX;
      npc.y = npc.spawnY;
      npc.nextAttackTick = Infinity;
      npc.target = null;
      npc.dying = 0;
    }

    if (npc.target) {
      // OSRS movement rule (from InfernoTrainer osrs-sdk):
      // canMove() = !hasLOS && !frozen && !stunned && !dying
      // Mobs ONLY move when they do NOT have line of sight to their target.
      // Once they can see the target (and are in attack range), they plant and attack.
      const tx = typeof npc.target === 'object' && npc.target.x !== undefined ? npc.target.x : npc.target;
      const ty = typeof npc.target === 'object' && npc.target.y !== undefined ? npc.target.y : 0;
      if (typeof tx === 'number') {
        const npcSize = npc.size || 1;
        const atkRange = npc.attackRange || 1;

        // Check LoS from NPC to target
        let hasLoS = false;
        try {
          hasLoS = los.npcHasLoS(npc.x, npc.y, npcSize, tx, ty, npc.layer || 0, atkRange);
        } catch {}

        // canMove: no LoS, not frozen, not stunned, not dying
        const canMove = !hasLoS && (npc.frozen || 0) <= 0 && (npc.stunned || 0) <= 0 && !npc.dying;

        if (canMove) {
          // Player under NPC — random cardinal movement
          if (isUnderNpc(tx, ty, npc)) {
            moveNpcTowards(npc, tx, ty); // moveNpcTowards handles under-npc random movement
          } else {
            moveNpcTowards(npc, tx, ty);
          }
        }
      }
    } else {
      // Wander (10% chance per tick if no target)
      if (Math.random() < 0.1) {
        const dx = Math.floor(Math.random() * 3) - 1;
        const dy = Math.floor(Math.random() * 3) - 1;
        const nx = npc.x + dx, ny = npc.y + dy;
        if (canNpcMoveTo(npc, nx, ny)) {
          const dist = Math.abs(nx - npc.spawnX) + Math.abs(ny - npc.spawnY);
          if (dist <= npc.wanderRadius) { npc.x = nx; npc.y = ny; }
        }
      }
    }
  }
}

// ── NPC attack tick ──
function npcAttackTick(currentTick) {
  // Custom attack logic is handled by onAttack hooks in the instance system
  // This is the base NPC combat — simple melee retaliation
  for (const npc of npcs.values()) {
    if (npc.dead || npc.dying > 0 || npc.stunned > 0) continue;
    if (!npc.target || npc.combat <= 0) continue;
    if (npc.onAttack) continue; // Custom AI handles its own attacks

    // Base NPC attack (existing behavior preserved for non-Inferno mobs)
    if (currentTick < npc.nextAttackTick) continue;
    // Attack logic is handled in server.js combatTick for now
  }
}

// Legacy npcTick for backwards compatibility
function npcTick(currentTick) {
  npcTimerTick(currentTick);
  npcMovementTick(currentTick);
  npcAttackTick(currentTick);
}

// Get all NPCs in an instance
function getNpcsInInstance(instanceId) {
  const result = [];
  for (const npc of npcs.values()) {
    if (npc.instance === instanceId && !npc.dead) result.push(npc);
  }
  return result;
}

// Remove all NPCs in an instance (cleanup)
function removeInstanceNpcs(instanceId) {
  for (const [id, npc] of npcs) {
    if (npc.instance === instanceId) npcs.delete(id);
  }
}

// Kill an NPC (trigger death animation + onDeath)
function killNpc(npc, killer, currentTick) {
  npc.dying = 2; // 2-tick death animation
  npc.target = null;
  if (npc.onDeath) npc.onDeath(npc, killer, currentTick);
}

function rollDrops(npc) {
  const drops = [];
  for (const drop of npc.drops) {
    const roll = Math.random() * totalWeight(npc.drops);
    let cumulative = 0;
    for (const d of npc.drops) {
      cumulative += d.weight;
      if (roll < cumulative) {
        const count = d.min + Math.floor(Math.random() * (d.max - d.min + 1));
        if (count > 0) drops.push({ id: d.id, name: d.name, count });
        break;
      }
    }
    break; // One roll per kill (main table)
  }
  return drops;
}

function totalWeight(drops) {
  return drops.reduce((sum, d) => sum + d.weight, 0);
}

function saveNpcSpawns() {
  const spawns = [];
  for (const npc of npcs.values()) {
    spawns.push({ defId: npc.defId, x: npc.spawnX, y: npc.spawnY, layer: npc.layer });
  }
  persistence.save('npc_spawns.json', spawns);
}

function loadNpcSpawns() {
  const spawns = persistence.load('npc_spawns.json', []);
  for (const s of spawns) spawnNpc(s.defId, s.x, s.y, s.layer);
  console.log(`[npcs] Loaded ${spawns.length} NPC spawns`);
}

module.exports = {
  defineNpc, spawnNpc, getNpc, getNpcsNear, findNpcByName,
  npcTick, npcTimerTick, npcMovementTick, npcAttackTick,
  rollDrops, npcs, npcDefs,
  saveNpcSpawns, loadNpcSpawns,
  // Multi-tile + instance support
  canNpcMoveTo, isUnderNpc, moveNpcTowards,
  getNpcsInInstance, removeInstanceNpcs, killNpc,
};
