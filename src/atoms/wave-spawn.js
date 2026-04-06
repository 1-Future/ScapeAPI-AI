// ══════════════════════════════════════════════════════════════════════════════
// ATOM: Wave Spawn
// Spawn a group of entities at defined locations. Optionally sequential.
// ══════════════════════════════════════════════════════════════════════════════

class WaveSpawn {
  /**
   * @param {Object} opts
   * @param {Object[][]} opts.waves    - array of waves, each wave is array of spawn defs
   *                                     [{ type, x, y, count, delay }]
   * @param {Function} opts.onSpawn    - (spawnDef, waveNum) called for each entity spawned
   * @param {Function} [opts.onWaveStart] - (waveNum, spawns) called when wave begins
   * @param {Function} [opts.onWaveEnd]   - (waveNum) called when all entities in wave are dead
   * @param {Function} [opts.onComplete]  - called when all waves done
   */
  constructor(opts) {
    this.waves = opts.waves || [];
    this.onSpawn = opts.onSpawn;
    this.onWaveStart = opts.onWaveStart || null;
    this.onWaveEnd = opts.onWaveEnd || null;
    this.onComplete = opts.onComplete || null;
    this.currentWave = 0;
    this.active = false;
    this.spawnedEntities = []; // track for wave completion
  }

  /** Start spawning from wave 1 (or specified wave). */
  start(fromWave = 1) {
    this.currentWave = fromWave - 1; // will increment on nextWave
    this.active = true;
    this.nextWave();
  }

  /** Spawn the next wave. */
  nextWave() {
    this.currentWave++;
    if (this.currentWave > this.waves.length) {
      this.active = false;
      if (this.onComplete) this.onComplete(this.currentWave - 1);
      return false;
    }

    const spawns = this.waves[this.currentWave - 1];
    this.spawnedEntities = [];

    if (this.onWaveStart) this.onWaveStart(this.currentWave, spawns);

    for (const spawn of spawns) {
      const count = spawn.count || 1;
      for (let i = 0; i < count; i++) {
        const entity = this.onSpawn(spawn, this.currentWave, i);
        if (entity) this.spawnedEntities.push(entity);
      }
    }

    return true;
  }

  /** Call when an entity from the current wave dies. Checks wave completion. */
  entityDied(entity) {
    this.spawnedEntities = this.spawnedEntities.filter(e => e !== entity);
    if (this.spawnedEntities.length === 0 && this.active) {
      if (this.onWaveEnd) this.onWaveEnd(this.currentWave);
    }
  }

  /** Check if current wave is complete (all spawned entities dead). */
  get isWaveComplete() { return this.spawnedEntities.length === 0; }
  get isComplete() { return this.currentWave >= this.waves.length && this.isWaveComplete; }
  get wave() { return this.currentWave; }
  get totalWaves() { return this.waves.length; }
  get remaining() { return this.spawnedEntities.length; }
}

module.exports = WaveSpawn;
