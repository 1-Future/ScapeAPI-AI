// ── NPC System (3.2, 3.3, 5.7) ───────────────────────────────────────────────
// NPCs exist in the world, wander, fight back, die, respawn, drop loot

const tick = require('../engine/tick');
const tiles = require('./tiles');
const persistence = require('../engine/persistence');

let nextNpcId = 1;
const npcs = new Map(); // id → npc
const npcDefs = new Map(); // defId → template

function defineNpc(defId, opts) {
  npcDefs.set(defId, {
    name: opts.name || defId,
    examine: opts.examine || 'An NPC.',
    combat: opts.combat || 0,
    maxHp: opts.maxHp || 1,
    stats: opts.stats || { attack: 1, strength: 1, defence: 1 },
    attackSpeed: opts.attackSpeed || 4,
    maxHit: opts.maxHit || 1,
    aggressive: opts.aggressive || false,
    aggroRange: opts.aggroRange || 3,
    wanderRadius: opts.wanderRadius || 5,
    respawnTicks: opts.respawnTicks || 50,
    drops: opts.drops || [], // [{ id, name, weight, min, max }]
    dialogue: opts.dialogue || null,
    thieving: opts.thieving || null, // { level, xp, loot, stunDamage }
    poisonDamage: opts.poisonDamage || 0, // max poison damage (0 = no poison)
  });
}

function spawnNpc(defId, x, y, layer = 0) {
  const def = npcDefs.get(defId);
  if (!def) return null;
  const id = nextNpcId++;
  const npc = {
    id, defId, ...def,
    x, y, layer,
    spawnX: x, spawnY: y,
    hp: def.maxHp,
    target: null,
    nextAttackTick: 0,
    dead: false,
    respawnAt: 0,
    aggroTimers: new Map(), // playerId → tick when aggro started (for 10min timeout)
  };
  npcs.set(id, npc);
  return npc;
}

function getNpc(id) { return npcs.get(id); }

function getNpcsNear(x, y, range = 15, layer = 0) {
  const result = [];
  for (const npc of npcs.values()) {
    if (npc.dead || npc.layer !== layer) continue;
    if (Math.abs(npc.x - x) <= range && Math.abs(npc.y - y) <= range) result.push(npc);
  }
  return result;
}

function findNpcByName(name, x, y, range = 15, layer = 0) {
  const lower = name.toLowerCase();
  for (const npc of npcs.values()) {
    if (npc.dead || npc.layer !== layer) continue;
    if (Math.abs(npc.x - x) > range || Math.abs(npc.y - y) > range) continue;
    if (npc.name.toLowerCase() === lower) return npc;
  }
  return null;
}

// NPC tick: wander, combat, respawn
function npcTick(currentTick) {
  for (const npc of npcs.values()) {
    if (npc.dead) {
      if (currentTick >= npc.respawnAt) {
        npc.dead = false;
        npc.hp = npc.maxHp;
        npc.x = npc.spawnX;
        npc.y = npc.spawnY;
        npc.target = null;
      }
      continue;
    }
    // Wander (10% chance per tick if no target)
    if (!npc.target && Math.random() < 0.1) {
      const dx = Math.floor(Math.random() * 3) - 1;
      const dy = Math.floor(Math.random() * 3) - 1;
      const nx = npc.x + dx, ny = npc.y + dy;
      if (tiles.isWalkable(nx, ny, npc.layer)) {
        const dist = Math.abs(nx - npc.spawnX) + Math.abs(ny - npc.spawnY);
        if (dist <= npc.wanderRadius) { npc.x = nx; npc.y = ny; }
      }
    }
  }
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
  npcTick, rollDrops, npcs, npcDefs,
  saveNpcSpawns, loadNpcSpawns,
};
