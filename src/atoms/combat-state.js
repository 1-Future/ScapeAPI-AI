// ══════════════════════════════════════════════════════════════════════════════
// ATOM: Combat State
// Complete combat state machine for a player or NPC in combat.
// Manages attack timing, style, target, spec bar, freeze, projectiles.
// This is the composition layer — combines all combat atoms into one unit.
// ══════════════════════════════════════════════════════════════════════════════

const Cooldown = require('./cooldown');
const HitCheck = require('./hit-check');
const ProtectionCheck = require('./protection-check');
const Flinch = require('./flinch');
const SpecBar = require('./spec-bar');
const Freeze = require('./freeze');
const Projectile = require('./projectile');
const StyleMatch = require('./style-match');

class CombatState {
  /**
   * @param {Object} opts
   * @param {number} opts.attackSpeed  - ticks between attacks
   * @param {string} opts.attackStyle  - 'melee', 'ranged', 'magic'
   * @param {number} opts.attackRange  - tiles (1 for melee)
   * @param {number} opts.maxHit       - maximum damage
   * @param {Object} opts.stats        - { attack, strength, defence, ranged, magic }
   * @param {Object} opts.bonuses      - { attackBonus, strengthBonus, defBonus }
   */
  constructor(opts) {
    this.attackCooldown = new Cooldown(opts.attackSpeed || 4);
    this.attackStyle = opts.attackStyle || 'melee';
    this.attackRange = opts.attackRange || 1;
    this.maxHit = opts.maxHit || 1;
    this.stats = opts.stats || { attack: 1, strength: 1, defence: 1, ranged: 1, magic: 1 };
    this.bonuses = opts.bonuses || {};
    this.specBar = new SpecBar();
    this.freeze = new Freeze();
    this.projectiles = new Projectile.Manager();
    this.target = null;
    this.inCombat = false;
    this.lastAttackTick = -999;

    // Optional style matching (for demonic gorillas etc)
    this.styleMatcher = opts.styleMatch ? new StyleMatch(opts.styleMatch) : null;
  }

  setTarget(target) {
    this.target = target;
    this.inCombat = !!target;
  }

  clearTarget() {
    this.target = null;
    this.inCombat = false;
  }

  /**
   * Attempt a normal attack.
   * @param {Object} attacker - { x, y, stats, bonuses, activePrayers }
   * @param {Object} defender - { x, y, stats, bonuses, activePrayers, hp }
   * @returns {{ hit, damage, blocked, projectile } | null}
   */
  attack(attacker, defender) {
    if (!this.attackCooldown.isReady) return null;
    if (this.freeze.isFrozen && this.attackRange <= 1) return null; // frozen melee can't attack

    // Distance check
    const dist = Math.max(Math.abs(attacker.x - defender.x), Math.abs(attacker.y - defender.y));
    if (dist > this.attackRange) return null;

    this.attackCooldown.trigger();

    // Roll hit
    const result = HitCheck.roll(
      { level: this.stats.attack || this.stats.ranged || this.stats.magic,
        bonus: this.bonuses.attackBonus || 0, prayerMult: 1 },
      { level: defender.stats?.defence || 1, bonus: defender.bonuses?.defBonus || 0 },
      this.maxHit
    );

    // Check style matching (nylocas, demonic gorillas)
    if (this.styleMatcher) {
      const match = this.styleMatcher.check(this.attackStyle);
      if (!match.effective) {
        result.damage = 0;
        result.hit = false;
        result.styleBlocked = true;
      }
    }

    // Protection prayer check
    if (result.hit && defender.activePrayers) {
      const prot = ProtectionCheck.check({
        attackStyle: this.attackStyle,
        damage: result.damage,
        activeProtections: defender.activePrayers,
      });
      result.damage = prot.damage;
      result.blocked = prot.blocked;
    }

    // Ranged/magic = fire projectile
    if (this.attackRange > 1) {
      const proj = this.projectiles.fire({
        source: { x: attacker.x, y: attacker.y, name: attacker.name || 'attacker' },
        target: { x: defender.x, y: defender.y, name: defender.name || 'target' },
        style: this.attackStyle,
        damage: result.damage,
        delay: Projectile.calcDelay(this.attackStyle, dist),
      });
      result.projectile = proj;
    }

    return result;
  }

  /**
   * Attempt a special attack.
   * @param {number} cost - spec energy cost
   * @param {Object} attacker
   * @param {Object} defender
   * @param {Object} specOpts - { accuracyMod, damageMod, hits, effect }
   * @returns {Object|null}
   */
  specAttack(cost, attacker, defender, specOpts = {}) {
    if (!this.specBar.use(cost)) return null;

    const hits = specOpts.hits || 1;
    const results = [];

    for (let i = 0; i < hits; i++) {
      const accMod = specOpts.accuracyMod || 1.0;
      const dmgMod = specOpts.damageMod || 1.0;
      const maxHit = Math.floor(this.maxHit * dmgMod);

      const result = HitCheck.roll(
        { level: this.stats.attack || this.stats.ranged, bonus: Math.floor((this.bonuses.attackBonus || 0) * accMod) },
        { level: defender.stats?.defence || 1, bonus: defender.bonuses?.defBonus || 0 },
        maxHit
      );

      // Apply spec effects
      if (specOpts.effect === 'drain_defence' && result.hit) {
        result.defenceDrain = result.damage;
      }
      if (specOpts.effect === 'heal' && result.hit) {
        result.healAmount = Math.floor(result.damage * 0.5);
      }
      if (specOpts.effect === 'drain_prayer' && result.hit) {
        result.prayerDrain = Math.floor(result.damage / 4);
      }
      if (specOpts.effect === 'freeze') {
        result.freezeTicks = 33;
      }

      results.push(result);
    }

    return { hits: results, specCost: cost, totalDamage: results.reduce((s, r) => s + r.damage, 0) };
  }

  /** Tick — advance cooldowns, projectiles, freeze. */
  tick() {
    this.attackCooldown.tick();
    this.specBar.tick();
    this.freeze.tick();
    return this.projectiles.tick(); // returns landed projectiles
  }

  get canAttack() { return this.attackCooldown.isReady; }
  get isFrozen() { return this.freeze.isFrozen; }
  get specPercent() { return this.specBar.percent; }
}

module.exports = CombatState;
