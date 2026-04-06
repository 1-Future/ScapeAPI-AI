// ══════════════════════════════════════════════════════════════════════════════
// ATOM: Aggression
// NPC aggression mechanics. Aggro range, combat level check, tolerance timer.
// NPCs stop being aggressive after ~10-20 minutes in an area.
// ══════════════════════════════════════════════════════════════════════════════

class Aggro {
  /**
   * @param {Object} opts
   * @param {number} opts.range         - tile radius for aggro detection
   * @param {number} [opts.combatLevel] - NPC combat level (for level-based aggro)
   * @param {boolean} [opts.always]     - always aggressive regardless of level
   * @param {number} [opts.toleranceTicks] - ticks before NPC becomes tolerant (default 1000 = 10 min)
   * @param {boolean} [opts.multiCombat] - can attack players already in combat
   */
  constructor(opts) {
    this.range = opts.range || 3;
    this.combatLevel = opts.combatLevel || 0;
    this.always = opts.always || false;
    this.toleranceTicks = opts.toleranceTicks || 1000;
    this.multiCombat = opts.multiCombat || false;

    this.toleranceCounter = new Map(); // playerId → ticks in range
    this.currentTarget = null;
  }

  /**
   * Check if this NPC should aggro a player.
   * @param {Object} npc - { x, y, combatLevel }
   * @param {Object} player - { x, y, combatLevel, id, inCombat }
   * @returns {{ shouldAggro: boolean, reason: string }}
   */
  check(npc, player) {
    // Distance check
    const dist = Math.max(Math.abs(npc.x - player.x), Math.abs(npc.y - player.y));
    if (dist > this.range) return { shouldAggro: false, reason: 'out_of_range' };

    // Already targeting someone else and not multi
    if (this.currentTarget && this.currentTarget !== player.id && !this.multiCombat) {
      return { shouldAggro: false, reason: 'already_targeting' };
    }

    // Player already in combat and not multi
    if (player.inCombat && !this.multiCombat) {
      return { shouldAggro: false, reason: 'player_in_combat' };
    }

    // Level check: NPCs only aggro players with combat level <= NPC level * 2
    if (!this.always) {
      if (player.combatLevel > this.combatLevel * 2) {
        return { shouldAggro: false, reason: 'player_too_high_level' };
      }
    }

    // Tolerance check
    const ticks = this.toleranceCounter.get(player.id) || 0;
    if (ticks >= this.toleranceTicks) {
      return { shouldAggro: false, reason: 'tolerant' };
    }

    return { shouldAggro: true, reason: 'aggressive' };
  }

  /**
   * Tick — increment tolerance counters for nearby players.
   * @param {string} playerId
   */
  tickTolerance(playerId) {
    const current = this.toleranceCounter.get(playerId) || 0;
    this.toleranceCounter.set(playerId, current + 1);
  }

  /**
   * Reset tolerance (player leaves and comes back, or logs out).
   * @param {string} playerId
   */
  resetTolerance(playerId) {
    this.toleranceCounter.delete(playerId);
  }

  setTarget(playerId) { this.currentTarget = playerId; }
  clearTarget() { this.currentTarget = null; }

  get hasTarget() { return this.currentTarget !== null; }
}

module.exports = Aggro;
