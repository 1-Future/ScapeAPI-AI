// ══════════════════════════════════════════════════════════════════════════════
// ATOM: Style Match
// Entity requires matching attack style to damage. Wrong style = immune/reduced.
// Demonic gorillas, nylocas, elemental weaknesses.
// ══════════════════════════════════════════════════════════════════════════════

class StyleMatch {
  /**
   * @param {Object} opts
   * @param {string[]} opts.styles          - possible styles ['melee','ranged','magic']
   * @param {string} [opts.currentStyle]    - starting vulnerable style
   * @param {number} [opts.switchAfter]     - switch after N blocked attacks
   * @param {boolean} [opts.random]         - random next style vs sequential
   * @param {Function} [opts.onSwitch]      - called when style changes
   */
  constructor(opts) {
    this.styles = opts.styles || ['melee', 'ranged', 'magic'];
    this.currentStyle = opts.currentStyle || this.styles[0];
    this.switchAfter = opts.switchAfter || 3;
    this.random = opts.random || false;
    this.onSwitch = opts.onSwitch || null;
    this.blockedCount = 0;
    this.currentIndex = this.styles.indexOf(this.currentStyle);
  }

  /**
   * Check if an attack style matches the current vulnerability.
   * @param {string} attackStyle - the style being used against this entity
   * @returns {{ effective: boolean, damageMultiplier: number }}
   */
  check(attackStyle) {
    if (attackStyle === this.currentStyle) {
      this.blockedCount = 0;
      return { effective: true, damageMultiplier: 1.0 };
    }

    this.blockedCount++;
    if (this.blockedCount >= this.switchAfter) {
      this._switch();
    }

    return { effective: false, damageMultiplier: 0 };
  }

  /**
   * For NPCs that switch their OWN attack style (demonic gorillas).
   * Switch after N attacks are blocked by player prayer.
   */
  attackBlocked() {
    this.blockedCount++;
    if (this.blockedCount >= this.switchAfter) {
      this._switch();
      return true;
    }
    return false;
  }

  _switch() {
    this.blockedCount = 0;
    if (this.random) {
      const others = this.styles.filter(s => s !== this.currentStyle);
      this.currentStyle = others[Math.floor(Math.random() * others.length)];
    } else {
      this.currentIndex = (this.currentIndex + 1) % this.styles.length;
      this.currentStyle = this.styles[this.currentIndex];
    }
    if (this.onSwitch) this.onSwitch(this.currentStyle);
  }

  get style() { return this.currentStyle; }
  get blocksUntilSwitch() { return this.switchAfter - this.blockedCount; }
}

module.exports = StyleMatch;
