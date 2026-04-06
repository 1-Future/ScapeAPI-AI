// ══════════════════════════════════════════════════════════════════════════════
// ATOM: Forced Movement
// Player must move or take damage. Acid walks, fire walls, expanding zones.
// ══════════════════════════════════════════════════════════════════════════════

class ForcedMovement {
  /**
   * @param {Object} opts
   * @param {number} opts.damagePerTick  - damage if player doesn't move
   * @param {number} opts.duration       - ticks the effect lasts
   * @param {Function} [opts.isSafe]     - (x, y) => boolean, check if tile is safe
   * @param {Function} [opts.onDamage]   - called when player takes damage
   */
  constructor(opts) {
    this.damagePerTick = opts.damagePerTick || 5;
    this.duration = opts.duration || 30;
    this.remaining = opts.duration || 30;
    this.isSafe = opts.isSafe || (() => true);
    this.onDamage = opts.onDamage || null;
    this.lastX = null;
    this.lastY = null;
    this.active = false;
  }

  start(playerX, playerY) {
    this.active = true;
    this.remaining = this.duration;
    this.lastX = playerX;
    this.lastY = playerY;
  }

  tick(playerX, playerY) {
    if (!this.active) return { damage: 0 };

    this.remaining--;
    if (this.remaining <= 0) {
      this.active = false;
      return { damage: 0, ended: true };
    }

    const moved = playerX !== this.lastX || playerY !== this.lastY;
    const safe = this.isSafe(playerX, playerY);
    this.lastX = playerX;
    this.lastY = playerY;

    if (!moved || !safe) {
      if (this.onDamage) this.onDamage(this.damagePerTick);
      return { damage: this.damagePerTick, moved, safe };
    }

    return { damage: 0, moved, safe };
  }

  get isActive() { return this.active; }
}

module.exports = ForcedMovement;
