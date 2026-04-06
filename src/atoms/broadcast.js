// ══════════════════════════════════════════════════════════════════════════════
// ATOM: Broadcast
// Announce something to players. Different scopes and styles.
// ══════════════════════════════════════════════════════════════════════════════

class Broadcast {
  /**
   * Create a broadcast message.
   * @param {Object} opts
   * @param {string} opts.message  - the text
   * @param {string} opts.scope    - 'self', 'area', 'world', 'global'
   * @param {string} [opts.type]   - 'system', 'loot', 'achievement', 'chat', 'tip'
   * @param {string} [opts.color]  - HTML color for styled messages
   * @param {Object} [opts.source] - { name, type } who triggered this
   */
  static create(opts) {
    return {
      message: opts.message,
      scope: opts.scope || 'self',
      type: opts.type || 'system',
      color: opts.color || null,
      source: opts.source || null,
      timestamp: Date.now(),
    };
  }

  /** System message to one player. */
  static toSelf(message) {
    return Broadcast.create({ message, scope: 'self', type: 'system' });
  }

  /** Loot announcement to nearby players. */
  static lootAnnounce(playerName, itemName) {
    return Broadcast.create({
      message: `${playerName} received a drop: ${itemName}`,
      scope: 'area',
      type: 'loot',
      color: '#005f00',
    });
  }

  /** Achievement/diary notification. */
  static achievement(message) {
    return Broadcast.create({
      message,
      scope: 'self',
      type: 'achievement',
      color: '#dc143c',
    });
  }

  /** Game tip. */
  static tip(message) {
    return Broadcast.create({ message, scope: 'self', type: 'tip' });
  }

  /** World-wide announcement. */
  static worldAnnounce(message) {
    return Broadcast.create({ message, scope: 'world', type: 'system' });
  }
}

module.exports = Broadcast;
