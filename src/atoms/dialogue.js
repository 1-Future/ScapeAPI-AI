// ══════════════════════════════════════════════════════════════════════════════
// ATOM: Dialogue
// NPC dialogue system with branching, player choices, and state-awareness.
// ══════════════════════════════════════════════════════════════════════════════

class Dialogue {
  /**
   * @param {Object} opts
   * @param {string} opts.npcName
   * @param {Object} opts.tree - dialogue tree structure:
   *   {
   *     start: {
   *       lines: ['Hello adventurer!', 'What can I help with?'],
   *       choices: [
   *         { text: 'I need a quest', next: 'quest_offer' },
   *         { text: 'Goodbye', next: null }
   *       ]
   *     },
   *     quest_offer: {
   *       lines: ['I have a task for you...'],
   *       condition: (ctx) => !ctx.questComplete,  // only show if quest not done
   *       onEnter: (ctx) => { ... },               // side effect
   *       choices: [...]
   *     }
   *   }
   * @param {Function} [opts.onLine]   - (speaker, message, tickDelay) per line
   * @param {Function} [opts.onChoice] - (choices) when player must choose
   * @param {Function} [opts.onEnd]    - dialogue finished
   */
  constructor(opts) {
    this.npcName = opts.npcName;
    this.tree = opts.tree;
    this.onLine = opts.onLine || null;
    this.onChoice = opts.onChoice || null;
    this.onEnd = opts.onEnd || null;
    this.currentNode = null;
    this.lineIndex = 0;
    this.active = false;
    this.waitingForChoice = false;
    this.context = {};
  }

  /** Start dialogue from a node (default: 'start'). */
  start(context = {}, startNode = 'start') {
    this.context = context;
    this.active = true;
    this.waitingForChoice = false;
    this.goToNode(startNode);
  }

  /** Navigate to a specific dialogue node. */
  goToNode(nodeName) {
    if (!nodeName) {
      this.end();
      return;
    }

    const node = this.tree[nodeName];
    if (!node) {
      this.end();
      return;
    }

    // Check condition
    if (node.condition && !node.condition(this.context)) {
      // Skip to fallback or end
      if (node.fallback) {
        this.goToNode(node.fallback);
      } else {
        this.end();
      }
      return;
    }

    // Fire onEnter side effect
    if (node.onEnter) node.onEnter(this.context);

    this.currentNode = { name: nodeName, ...node };
    this.lineIndex = 0;
    this.waitingForChoice = false;
  }

  /** Advance dialogue by one line. Call this each tick or on player click. */
  advance() {
    if (!this.active || this.waitingForChoice) return null;
    if (!this.currentNode) { this.end(); return null; }

    const lines = this.currentNode.lines || [];

    if (this.lineIndex < lines.length) {
      const line = lines[this.lineIndex];
      this.lineIndex++;

      // Determine speaker — lines starting with player name are player lines
      const isPlayerLine = typeof line === 'object' && line.speaker === 'player';
      const speaker = isPlayerLine ? 'player' : this.npcName;
      const message = isPlayerLine ? line.text : line;

      if (this.onLine) this.onLine(speaker, message);
      return { speaker, message };
    }

    // Lines exhausted — show choices or auto-continue
    const choices = this.currentNode.choices;
    if (choices && choices.length > 0) {
      this.waitingForChoice = true;
      if (this.onChoice) this.onChoice(choices);
      return { choices };
    }

    // No choices, check for auto-next
    if (this.currentNode.next) {
      this.goToNode(this.currentNode.next);
      return this.advance();
    }

    this.end();
    return null;
  }

  /** Player selected a choice. */
  choose(choiceIndex) {
    if (!this.waitingForChoice || !this.currentNode?.choices) return;

    const choice = this.currentNode.choices[choiceIndex];
    if (!choice) return;

    this.waitingForChoice = false;

    // Show player's chosen text
    if (this.onLine && choice.text) {
      this.onLine('player', choice.text);
    }

    // Fire choice callback
    if (choice.onChoose) choice.onChoose(this.context);

    // Navigate to next node
    this.goToNode(choice.next);
  }

  /** End dialogue. */
  end() {
    this.active = false;
    this.currentNode = null;
    this.waitingForChoice = false;
    if (this.onEnd) this.onEnd(this.context);
  }

  get isActive() { return this.active; }
  get isWaitingForChoice() { return this.waitingForChoice; }
}

module.exports = Dialogue;
