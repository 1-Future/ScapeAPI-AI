// ══════════════════════════════════════════════════════════════════════════════
// MECHANIC COMPOSER — Turn config into live game systems
//
// A mechanic definition is a plain object that describes:
//   - What atoms it uses
//   - Their parameters
//   - How they wire together
//
// The composer reads the definition and produces a runnable mechanic
// that responds to tick() and action() calls.
//
// This is how 19 atoms become 14,000 mechanics.
// ══════════════════════════════════════════════════════════════════════════════

const Timer = require('./timer');
const Countdown = require('./countdown');
const Cooldown = require('./cooldown');
const TickCycle = require('./tick-cycle');
const PeriodicAction = require('./periodic-action');
const DelayedAction = require('./delayed-action');
const QueuedAction = require('./queued-action');
const HitCheck = require('./hit-check');
const ProtectionCheck = require('./protection-check');
const Flinch = require('./flinch');
const XpDrop = require('./xp-drop');
const LootDrop = require('./loot-drop');
const Broadcast = require('./broadcast');
const DoseSystem = require('./dose-system');
const Consume = require('./consume');
const Round = require('./round');
const WaveSpawn = require('./wave-spawn');
const PhaseTransition = require('./phase-transition');
const Dialogue = require('./dialogue');

class Mechanic {
  /**
   * Build a live mechanic from a definition.
   *
   * @param {Object} def - mechanic definition
   * @param {string} def.id          - unique identifier
   * @param {string} def.name        - display name
   * @param {string} def.type        - 'skill', 'combat', 'consumable', 'dialogue', 'minigame', 'passive'
   * @param {Object} def.atoms       - atom configurations (see below)
   * @param {Object} [def.requires]  - { level: {mining: 15}, items: ['pickaxe'], quests: [] }
   * @param {Object} [def.config]    - arbitrary extra config
   */
  constructor(def) {
    this.id = def.id;
    this.name = def.name;
    this.type = def.type;
    this.def = def;
    this.config = def.config || {};
    this.requires = def.requires || {};
    this.active = false;

    // Built atom instances
    this._atoms = {};
    this._events = []; // events emitted this tick

    this._build(def.atoms || {});
  }

  _build(atomDefs) {
    const self = this;
    const emit = (type, data) => self._events.push({ type, mechanic: self.id, ...data });

    // ── COOLDOWN ──
    if (atomDefs.cooldown) {
      this._atoms.cooldown = new Cooldown(atomDefs.cooldown.duration || 4);
    }

    // ── PERIODIC ACTION (skilling) ──
    if (atomDefs.periodicAction) {
      const pa = atomDefs.periodicAction;
      this._atoms.periodicAction = new PeriodicAction({
        interval: pa.interval || 4,
        successRate: pa.successRate || 1,
        onSuccess: (result) => {
          // Auto-wire XP drops
          if (atomDefs.xpDrop) {
            for (const [skill, amount] of Object.entries(atomDefs.xpDrop.skills || {})) {
              emit('xp_drop', { skill, amount });
            }
          }
          // Auto-wire loot drops
          if (atomDefs.lootDrop && atomDefs.lootDrop.table) {
            const drops = LootDrop.roll(atomDefs.lootDrop.table, atomDefs.lootDrop.rolls || 1);
            for (const drop of drops) {
              emit('loot', { item: drop.name, quantity: drop.quantity });
            }
          }
          // Success message
          if (pa.successMessage) {
            emit('message', { text: pa.successMessage });
          }
          emit('action_success', { attempt: result.totalAttempts || 0 });
        },
        onFail: (result) => {
          if (pa.failMessage) {
            emit('message', { text: pa.failMessage });
          }
          // Fail penalty (burn damage, stun, etc.)
          if (pa.failPenalty) {
            emit('fail_penalty', pa.failPenalty);
          }
          emit('action_fail', {});
        },
      });
    }

    // ── HIT CHECK (combat) ──
    if (atomDefs.hitCheck) {
      this._atoms.hitCheck = atomDefs.hitCheck; // stored as config, rolled on demand
    }

    // ── PROTECTION CHECK ──
    if (atomDefs.protectionCheck) {
      this._atoms.protectionCheck = atomDefs.protectionCheck;
    }

    // ── FLINCH ──
    if (atomDefs.flinch) {
      this._atoms.flinch = new Flinch(atomDefs.flinch.attackSpeed || 4);
    }

    // ── DELAYED ACTION (projectile) ──
    if (atomDefs.delayedAction) {
      this._atoms.delayedActionQueue = new DelayedAction.Queue();
    }

    // ── TICK CYCLE (passive effects) ──
    if (atomDefs.tickCycle) {
      const tc = atomDefs.tickCycle;
      this._atoms.tickCycle = new TickCycle({
        interval: tc.interval,
        rate: tc.rate,
        threshold: tc.threshold,
        onFire: () => {
          if (tc.effect) emit('tick_effect', tc.effect);
        },
      });
    }

    // ── CONSUME ──
    if (atomDefs.consume) {
      this._atoms.consume = atomDefs.consume; // effect definition
    }

    // ── DOSE SYSTEM ──
    if (atomDefs.doseSystem) {
      this._atoms.doseSystem = true;
    }

    // ── DIALOGUE ──
    if (atomDefs.dialogue) {
      this._atoms.dialogue = new Dialogue({
        npcName: atomDefs.dialogue.npcName || this.name,
        tree: atomDefs.dialogue.tree || {},
        onLine: (speaker, message) => emit('dialogue_line', { speaker, message }),
        onChoice: (choices) => emit('dialogue_choice', { choices: choices.map(c => c.text) }),
        onEnd: () => emit('dialogue_end', {}),
      });
    }

    // ── ROUND ──
    if (atomDefs.round) {
      const rd = atomDefs.round;
      this._atoms.round = new Round({
        countdownTicks: rd.countdownTicks,
        activeTicks: rd.activeTicks,
        onCountdown: (remaining, msg) => emit('countdown', { remaining, message: msg }),
        onStart: (num) => emit('round_start', { round: num }),
        onEnd: (num, ticks) => emit('round_end', { round: num, ticks }),
        onReward: rd.reward ? (num) => emit('reward', rd.reward) : null,
      });
    }

    // ── WAVE SPAWN ──
    if (atomDefs.waveSpawn) {
      this._atoms.waveSpawn = atomDefs.waveSpawn; // config stored, executed by game loop
    }

    // ── BROADCAST ──
    if (atomDefs.broadcast) {
      this._atoms.broadcast = atomDefs.broadcast;
    }

    // ── TIMER ──
    if (atomDefs.timer) {
      this._atoms.timer = new Timer({
        duration: atomDefs.timer.duration,
        repeat: atomDefs.timer.repeat || false,
        onExpire: () => emit('timer_expire', { name: atomDefs.timer.name || 'timer' }),
        onTick: atomDefs.timer.announce ? (remaining) => {
          if (remaining % atomDefs.timer.announceInterval === 0) {
            emit('timer_announce', { remaining });
          }
        } : null,
      });
    }
  }

  // ── LIFECYCLE ──

  /** Start the mechanic (begin skilling, enter combat, start dialogue). */
  start(context = {}) {
    this.active = true;
    this._events = [];
    if (this._atoms.periodicAction) this._atoms.periodicAction.start();
    if (this._atoms.tickCycle) this._atoms.tickCycle.start();
    if (this._atoms.round) this._atoms.round.begin();
    if (this._atoms.timer) this._atoms.timer.start();
    if (this._atoms.dialogue) this._atoms.dialogue.start(context);
  }

  /** Stop the mechanic. */
  stop() {
    this.active = false;
    if (this._atoms.periodicAction) this._atoms.periodicAction.stop();
    if (this._atoms.tickCycle) this._atoms.tickCycle.stop();
    if (this._atoms.timer) this._atoms.timer.stop();
  }

  /** Process one game tick. Returns array of events that happened. */
  tick(context = {}) {
    this._events = [];
    if (!this.active) return this._events;

    if (this._atoms.cooldown) this._atoms.cooldown.tick();
    if (this._atoms.periodicAction) this._atoms.periodicAction.tick();
    if (this._atoms.tickCycle) this._atoms.tickCycle.tick();
    if (this._atoms.delayedActionQueue) this._atoms.delayedActionQueue.tick();
    if (this._atoms.flinch) this._atoms.flinch.tick();
    if (this._atoms.round) this._atoms.round.tick();
    if (this._atoms.timer) this._atoms.timer.tick();

    return this._events;
  }

  /** Perform a one-shot action (attack, eat, drink). */
  action(actionType, context = {}) {
    this._events = [];

    if (actionType === 'attack' && this._atoms.hitCheck) {
      if (this._atoms.cooldown && !this._atoms.cooldown.tryUse()) {
        return [{ type: 'cooldown_blocked', mechanic: this.id }];
      }
      const hc = this._atoms.hitCheck;
      const result = HitCheck.roll(
        context.attacker || { level: 99, bonus: 0 },
        context.defender || { level: 1, bonus: 0 },
        hc.maxHit || 1
      );
      // Protection check
      if (result.hit && this._atoms.protectionCheck && context.targetProtections) {
        const prot = ProtectionCheck.check({
          attackStyle: hc.style || 'melee',
          damage: result.damage,
          activeProtections: context.targetProtections,
          isPvP: context.isPvP || false,
        });
        result.damage = prot.damage;
        result.blocked = prot.blocked;
      }
      this._events.push({ type: 'hit_result', mechanic: this.id, ...result });
      // XP on hit
      if (result.hit && this.def.atoms?.xpDrop?.skills) {
        const xpMult = result.damage / (hc.maxHit || 1); // scale XP with damage
        for (const [skill, baseAmount] of Object.entries(this.def.atoms.xpDrop.skills)) {
          this._events.push({ type: 'xp_drop', mechanic: this.id, skill, amount: Math.max(1, Math.round(baseAmount * result.damage / 10)) });
        }
      }
      return this._events;
    }

    if (actionType === 'consume' && this._atoms.consume) {
      if (this._atoms.cooldown && !this._atoms.cooldown.tryUse()) {
        return [{ type: 'cooldown_blocked', mechanic: this.id }];
      }
      // Dose check
      if (this._atoms.doseSystem && context.item) {
        const dose = DoseSystem.use(context.item);
        if (!dose.success) return [{ type: 'no_doses', mechanic: this.id }];
        this._events.push({ type: 'dose_used', mechanic: this.id, ...dose });
      }
      const effects = Consume.apply(context.player || {}, this._atoms.consume);
      this._events.push({ type: 'consumed', mechanic: this.id, ...effects });
      return this._events;
    }

    if (actionType === 'dialogue_advance' && this._atoms.dialogue) {
      this._atoms.dialogue.advance();
      return this._events;
    }

    if (actionType === 'dialogue_choose' && this._atoms.dialogue) {
      this._atoms.dialogue.choose(context.choiceIndex || 0);
      return this._events;
    }

    return this._events;
  }

  /** Check if requirements are met. */
  checkRequirements(player) {
    const req = this.requires;
    if (req.levels) {
      for (const [skill, level] of Object.entries(req.levels)) {
        if ((player.skills?.[skill]?.level || 1) < level) {
          return { met: false, reason: `Need ${skill} level ${level}` };
        }
      }
    }
    if (req.items) {
      for (const item of req.items) {
        // Caller must check inventory
      }
    }
    return { met: true };
  }

  get events() { return this._events; }
  get atoms() { return Object.keys(this._atoms); }
}

// ══════════════════════════════════════════════════════════════════════════════
// MECHANIC REGISTRY — Store and retrieve mechanic definitions
// ══════════════════════════════════════════════════════════════════════════════

const registry = new Map();

function define(def) {
  registry.set(def.id, def);
}

function create(id) {
  const def = registry.get(id);
  if (!def) throw new Error(`Unknown mechanic: ${id}`);
  return new Mechanic(def);
}

function get(id) {
  return registry.get(id);
}

function list() {
  return [...registry.values()];
}

module.exports = { Mechanic, define, create, get, list, registry };
