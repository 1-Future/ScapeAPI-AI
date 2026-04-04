// ── Instance & Wave System ────────────────────────────────────────────────────
// Isolated arenas per player. Wave-based content (Inferno, Fight Caves, etc.)
// Each instance has its own NPC set, entities, and tick processing.

const tick = require('./tick');
const tiles = require('../world/tiles');
const walls = require('../world/walls');
const npcs = require('../world/npcs');
const entities = require('../world/entities');
const projectiles = require('../combat/projectiles');
const los = require('../world/los');

let nextInstanceId = 1;
const instances = new Map(); // id → instance

function create(opts) {
  const id = nextInstanceId++;
  const instance = {
    id,
    type: opts.type || 'generic', // 'inferno', 'fight_caves', etc.
    playerId: opts.playerId,
    layer: opts.layer || 100 + id, // Use high layer numbers to avoid world collision
    state: 'active', // active, paused, complete, failed

    // Wave system
    currentWave: 0,
    totalWaves: opts.totalWaves || 0,
    waveSpawns: opts.waveSpawns || [], // Array of wave definitions
    waveDelay: 0, // ticks until next wave starts
    waveDelayTicks: opts.waveDelayTicks || 7, // ticks between waves

    // Arena
    arenaWidth: opts.arenaWidth || 51,
    arenaHeight: opts.arenaHeight || 57,
    arenaOriginX: opts.arenaOriginX || 0,
    arenaOriginY: opts.arenaOriginY || 0,

    // Tracking
    startTick: tick.getTick(),
    tickCount: 0,
    kills: 0,

    // Hooks
    onWaveStart: opts.onWaveStart || null, // fn(instance, waveNumber)
    onWaveClear: opts.onWaveClear || null, // fn(instance, waveNumber)
    onComplete: opts.onComplete || null, // fn(instance)
    onFail: opts.onFail || null, // fn(instance)
    onTick: opts.onTick || null, // fn(instance, currentTick)
    setupArena: opts.setupArena || null, // fn(instance) — called once to build the arena

    // Entity/NPC refs
    entityIds: [], // tracked entity IDs in this instance
    npcIds: [], // tracked NPC IDs in this instance

    // Player state snapshot (for restoring on exit)
    playerSnapshot: opts.playerSnapshot || null,
  };

  instances.set(id, instance);

  // Build the arena
  if (instance.setupArena) instance.setupArena(instance);

  return instance;
}

function get(id) { return instances.get(id); }

function getByPlayer(playerId) {
  for (const inst of instances.values()) {
    if (inst.playerId === playerId && (inst.state === 'active' || inst.state === 'complete' || inst.state === 'failed')) return inst;
  }
  return null;
}

// ── Wave progression ──
function startNextWave(instance) {
  instance.currentWave++;
  if (instance.currentWave > instance.totalWaves) {
    instance.state = 'complete';
    if (instance.onComplete) instance.onComplete(instance);
    return;
  }

  if (instance.onWaveStart) instance.onWaveStart(instance, instance.currentWave);
}

function checkWaveClear(instance) {
  // Check if all NPCs in this instance are dead
  const alive = npcs.getNpcsInInstance(instance.id);
  if (alive.length === 0 && instance.currentWave > 0) {
    if (instance.onWaveClear) instance.onWaveClear(instance, instance.currentWave);
    // Start delay for next wave
    instance.waveDelay = instance.waveDelayTicks;
  }
}

// ── Instance tick ──
function instanceTick(currentTick) {
  for (const inst of instances.values()) {
    if (inst.state !== 'active') continue;
    inst.tickCount++;

    // Wave delay countdown
    if (inst.waveDelay > 0) {
      inst.waveDelay--;
      if (inst.waveDelay <= 0) {
        startNextWave(inst);
      }
      continue; // Don't process instance tick during wave transition
    }

    // Custom per-tick logic
    if (inst.onTick) inst.onTick(inst, currentTick);

    // Check wave clear if we have wave-based content
    if (inst.totalWaves > 0) checkWaveClear(inst);
  }
}

// ── Cleanup ──
function destroy(instanceId) {
  const inst = instances.get(instanceId);
  if (!inst) return;

  // Remove all NPCs and entities
  npcs.removeInstanceNpcs(instanceId);
  entities.removeInstance(instanceId);

  instances.delete(instanceId);
}

function fail(instance, reason) {
  instance.state = 'failed';
  if (instance.onFail) instance.onFail(instance, reason);
}

// ── Get instance status for display ──
function getStatus(instance) {
  const alive = npcs.getNpcsInInstance(instance.id);
  const ents = entities.getInInstance(instance.id);
  return {
    id: instance.id,
    type: instance.type,
    wave: instance.currentWave,
    totalWaves: instance.totalWaves,
    state: instance.state,
    npcsAlive: alive.length,
    npcList: alive.map(n => ({ name: n.name, hp: n.hp, maxHp: n.maxHp, x: n.x, y: n.y })),
    entities: ents.map(e => ({ name: e.name, hp: e.hp, maxHp: e.maxHp, x: e.x, y: e.y })),
    ticksElapsed: instance.tickCount,
    kills: instance.kills,
  };
}

// Register instance tick into the tick system
tick.registerPhase('npcTimers', 'instances', instanceTick);

module.exports = {
  create, get, getByPlayer, destroy, fail,
  startNextWave, checkWaveClear, getStatus,
  instances,
};
