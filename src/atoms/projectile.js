// ══════════════════════════════════════════════════════════════════════════════
// ATOM: Projectile
// Visible attack that travels from source to target over N ticks.
// Prayer is checked when projectile LANDS, not when it fires.
// Supports multi-projectile (scythe 3-hit, dark bow 2-arrow).
// ══════════════════════════════════════════════════════════════════════════════

const DelayedAction = require('./delayed-action');

class Projectile {
  /**
   * @param {Object} opts
   * @param {Object} opts.source      - { x, y, name }
   * @param {Object} opts.target      - { x, y, name }
   * @param {string} opts.style       - 'melee', 'ranged', 'magic'
   * @param {number} opts.damage      - pre-rolled damage
   * @param {number} opts.delay       - ticks until landing
   * @param {boolean} [opts.checkPrayerOnLand] - check prayer when landing (default true)
   * @param {Function} [opts.onLand]  - custom callback on landing
   */
  constructor(opts) {
    this.source = opts.source;
    this.target = opts.target;
    this.style = opts.style;
    this.damage = opts.damage;
    this.delay = opts.delay;
    this.remaining = opts.delay;
    this.checkPrayerOnLand = opts.checkPrayerOnLand !== false;
    this.onLand = opts.onLand || null;
    this.landed = false;
    this.cancelled = false;
  }

  tick() {
    if (this.landed || this.cancelled) return null;
    this.remaining--;
    if (this.remaining <= 0) {
      this.landed = true;
      return this._resolve();
    }
    return null;
  }

  _resolve() {
    const result = {
      source: this.source,
      target: this.target,
      style: this.style,
      damage: this.damage,
      checkPrayer: this.checkPrayerOnLand,
    };
    if (this.onLand) this.onLand(result);
    return result;
  }

  cancel() { this.cancelled = true; }
  get isDone() { return this.landed || this.cancelled; }
  get ticksLeft() { return this.remaining; }
}

/**
 * Calculate projectile delay based on distance (OSRS formula).
 * @param {string} style - 'ranged' or 'magic'
 * @param {number} distance - chebyshev distance
 * @returns {number} ticks until landing
 */
Projectile.calcDelay = function(style, distance) {
  if (style === 'melee') return 0;
  // OSRS: delay = 1 + floor(distance / 3) for most projectiles
  // Some weapons override (crossbow = 2 + floor(dist/6), etc.)
  return 1 + Math.floor(distance / 3);
};

/**
 * Manage a collection of in-flight projectiles.
 */
class ProjectileManager {
  constructor() {
    this.projectiles = [];
  }

  fire(opts) {
    if (!opts.delay && opts.delay !== 0) {
      opts.delay = Projectile.calcDelay(opts.style,
        Math.max(Math.abs(opts.source.x - opts.target.x), Math.abs(opts.source.y - opts.target.y)));
    }
    const proj = new Projectile(opts);
    this.projectiles.push(proj);
    return proj;
  }

  tick() {
    const landed = [];
    for (const p of this.projectiles) {
      const result = p.tick();
      if (result) landed.push(result);
    }
    this.projectiles = this.projectiles.filter(p => !p.isDone);
    return landed;
  }

  cancelAll() {
    for (const p of this.projectiles) p.cancel();
    this.projectiles = [];
  }

  /** Get projectiles targeting a specific entity. */
  incomingFor(targetName) {
    return this.projectiles.filter(p => !p.isDone && p.target.name === targetName);
  }

  get count() { return this.projectiles.length; }
}

module.exports = Projectile;
module.exports.Manager = ProjectileManager;
