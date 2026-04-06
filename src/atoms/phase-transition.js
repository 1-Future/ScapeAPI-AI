// ══════════════════════════════════════════════════════════════════════════════
// ATOM: Phase Transition
// Switch from one behavior set to another based on a trigger.
// ══════════════════════════════════════════════════════════════════════════════

class PhaseTransition {
  /**
   * @param {Object} opts
   * @param {Object[]} opts.phases - [{ name, trigger, onEnter, onTick, onExit }]
   *   trigger: (context) => boolean — checked every tick, transitions when true
   *   Phases are checked in order; first matching trigger wins.
   * @param {string} [opts.startPhase] - initial phase name (default: first phase)
   */
  constructor(opts) {
    this.phases = new Map();
    this.phaseOrder = [];
    for (const p of opts.phases) {
      this.phases.set(p.name, p);
      this.phaseOrder.push(p.name);
    }
    this.currentPhase = opts.startPhase || this.phaseOrder[0];
    this.ticksInPhase = 0;

    // Enter initial phase
    const initial = this.phases.get(this.currentPhase);
    if (initial?.onEnter) initial.onEnter();
  }

  /** Process one tick. Checks triggers and transitions if needed. */
  tick(context = {}) {
    this.ticksInPhase++;

    // Run current phase tick
    const current = this.phases.get(this.currentPhase);
    if (current?.onTick) current.onTick(this.ticksInPhase, context);

    // Check triggers for phase transitions
    for (const [name, phase] of this.phases) {
      if (name === this.currentPhase) continue;
      if (phase.trigger && phase.trigger(context)) {
        this.transitionTo(name);
        break;
      }
    }
  }

  /** Force transition to a specific phase. */
  transitionTo(phaseName) {
    if (!this.phases.has(phaseName)) return false;
    if (phaseName === this.currentPhase) return false;

    const old = this.phases.get(this.currentPhase);
    if (old?.onExit) old.onExit();

    this.currentPhase = phaseName;
    this.ticksInPhase = 0;

    const next = this.phases.get(phaseName);
    if (next?.onEnter) next.onEnter();

    return true;
  }

  get phase() { return this.currentPhase; }
  get ticks() { return this.ticksInPhase; }
}

module.exports = PhaseTransition;
