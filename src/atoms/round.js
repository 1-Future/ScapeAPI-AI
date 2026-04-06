// ══════════════════════════════════════════════════════════════════════════════
// ATOM: Round
// A timed segment of gameplay: start → active → end → reward.
// The core of all minigames, wave-based content, and timed challenges.
// ══════════════════════════════════════════════════════════════════════════════

const Countdown = require('./countdown');
const Timer = require('./timer');

class Round {
  /**
   * @param {Object} opts
   * @param {number} [opts.countdownTicks]  - pre-round countdown duration
   * @param {number} [opts.activeTicks]     - active round duration (0 = unlimited)
   * @param {Function} [opts.onCountdown]   - (remaining, message) during countdown
   * @param {Function} opts.onStart         - called when round begins
   * @param {Function} [opts.onTick]        - called every tick during active phase
   * @param {Function} opts.onEnd           - called when round ends
   * @param {Function} [opts.onReward]      - called after end for reward distribution
   */
  constructor(opts) {
    this.phase = 'idle'; // idle → countdown → active → ended
    this.onStart = opts.onStart;
    this.onEnd = opts.onEnd;
    this.onReward = opts.onReward || null;
    this.onTickFn = opts.onTick || null;
    this.roundNumber = 0;

    this.countdown = opts.countdownTicks ? new Countdown({
      duration: opts.countdownTicks,
      onAnnounce: opts.onCountdown || null,
      onExpire: () => this._beginActive(),
      autoStart: false,
    }) : null;

    this.activeTimer = opts.activeTicks ? new Timer({
      duration: opts.activeTicks,
      onExpire: () => this.end(),
      autoStart: false,
    }) : null;

    this.ticksInPhase = 0;
  }

  /** Start a new round (begins countdown if configured, otherwise goes straight to active). */
  begin() {
    this.roundNumber++;
    this.ticksInPhase = 0;

    if (this.countdown) {
      this.phase = 'countdown';
      this.countdown.start();
    } else {
      this._beginActive();
    }
  }

  _beginActive() {
    this.phase = 'active';
    this.ticksInPhase = 0;
    if (this.onStart) this.onStart(this.roundNumber);
    if (this.activeTimer) this.activeTimer.start();
  }

  /** End the current round. */
  end(reason) {
    if (this.phase !== 'active') return;
    this.phase = 'ended';
    if (this.activeTimer) this.activeTimer.stop();
    if (this.onEnd) this.onEnd(this.roundNumber, this.ticksInPhase, reason);
    if (this.onReward) this.onReward(this.roundNumber);
  }

  /** Process one tick. */
  tick() {
    this.ticksInPhase++;

    if (this.phase === 'countdown' && this.countdown) {
      this.countdown.tick();
    } else if (this.phase === 'active') {
      if (this.activeTimer) this.activeTimer.tick();
      if (this.onTickFn) this.onTickFn(this.ticksInPhase, this.roundNumber);
    }
  }

  /** Reset to idle. */
  reset() {
    this.phase = 'idle';
    this.ticksInPhase = 0;
    if (this.countdown) this.countdown.reset();
    if (this.activeTimer) this.activeTimer.reset();
  }

  get isActive() { return this.phase === 'active'; }
  get isCountdown() { return this.phase === 'countdown'; }
  get isEnded() { return this.phase === 'ended'; }
  get isIdle() { return this.phase === 'idle'; }
  get currentPhase() { return this.phase; }
}

module.exports = Round;
