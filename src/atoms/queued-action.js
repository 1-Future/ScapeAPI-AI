// ══════════════════════════════════════════════════════════════════════════════
// ATOM: Queued Action
// Waits for current action to finish, then executes. One-deep queue.
//
// Examples:
//   - Click attack while eating — attack queues until eat delay ends
//   - Click to walk while in combat — movement queues until attack resolves
//   - Click to fish while moving — fishing starts when you arrive
// ══════════════════════════════════════════════════════════════════════════════

class QueuedAction {
  constructor() {
    this.current = null;  // { name, ticksLeft, onComplete }
    this.queued = null;   // { name, action }
  }

  /** Set the current blocking action. */
  setCurrent(name, ticks, onComplete) {
    this.current = { name, ticksLeft: ticks, onComplete: onComplete || null };
  }

  /** Queue an action to run after current finishes. Replaces any existing queue. */
  queue(name, action) {
    this.queued = { name, action };
  }

  /** Process one tick. Returns the action that executed, if any. */
  tick() {
    if (this.current) {
      this.current.ticksLeft--;
      if (this.current.ticksLeft <= 0) {
        const completed = this.current;
        this.current = null;
        if (completed.onComplete) completed.onComplete();

        // Execute queued action
        if (this.queued) {
          const q = this.queued;
          this.queued = null;
          if (q.action) q.action();
          return { executed: q.name };
        }
        return { completed: completed.name };
      }
    }
    return null;
  }

  /** Clear everything. */
  clear() {
    this.current = null;
    this.queued = null;
  }

  get isBusy() { return this.current !== null; }
  get hasQueued() { return this.queued !== null; }
  get currentAction() { return this.current?.name || null; }
  get queuedAction() { return this.queued?.name || null; }
}

module.exports = QueuedAction;
