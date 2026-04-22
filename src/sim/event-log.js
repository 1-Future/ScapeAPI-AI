// ══════════════════════════════════════════════════════════════════════════════
// Event log — append-only, JSONL-safe.
//
// Every tick the runner emits exactly one event. The event log writes to a
// file as-you-go so a killed sim still produces a partial report. Use the
// in-memory `events[]` array for tests; use `flush()` for durable disk output.
//
// Event shape (mirrors docs/balance-diagnostic.md §4):
//   {
//     timestamp: ISO-8601 string,
//     sim_day:   integer 0-indexed,
//     tick:      integer monotonic per bot,
//     account:   'low' | 'medium' | 'high' | 'unlimited',
//     type:      'boot' | 'action' | 'session_end' | 'day_end' | 'goal_set' | 'gap',
//     action_id: string | null,
//     drain:     number (bar cost),
//     output:    { xp, gp, items, quest } | null,
//     state_snapshot: object
//   }
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const fs = require('fs');
const path = require('path');

const EVENT_TYPES = Object.freeze({
  BOOT:        'boot',
  ACTION:      'action',
  SESSION_END: 'session_end',
  DAY_END:     'day_end',
  GOAL_SET:    'goal_set',
  GAP:         'gap',
});

function isoNow() { return new Date().toISOString(); }

class EventLog {
  constructor({ outPath = null, bufferSize = 128 } = {}) {
    this.outPath = outPath;
    this.bufferSize = bufferSize;
    this.events = [];
    this.buffer = [];
    this._stream = null;

    if (outPath) {
      // Make sure the directory exists.
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      this._stream = fs.createWriteStream(outPath, { flags: 'w', encoding: 'utf8' });
    }
  }

  /**
   * Emit an event. Caller provides partial fields; log normalises.
   */
  emit(ev) {
    const normalised = Object.assign(
      {
        timestamp: isoNow(),
        sim_day:   0,
        tick:      0,
        account:   'unknown',
        type:      'action',
        action_id: null,
        drain:     0,
        output:    null,
        state_snapshot: null,
      },
      ev,
    );

    if (!Object.values(EVENT_TYPES).includes(normalised.type)) {
      throw new Error(`unknown event type: ${normalised.type}`);
    }

    this.events.push(normalised);
    if (this._stream) {
      this.buffer.push(JSON.stringify(normalised));
      if (this.buffer.length >= this.bufferSize) this._drainBuffer();
    }
    return normalised;
  }

  _drainBuffer() {
    if (!this._stream || this.buffer.length === 0) return;
    this._stream.write(this.buffer.join('\n') + '\n');
    this.buffer = [];
  }

  /** Force-write to disk. */
  flush() {
    this._drainBuffer();
  }

  /** Close the underlying stream. Safe to call on memory-only logs. */
  async close() {
    this._drainBuffer();
    if (this._stream) {
      await new Promise(res => this._stream.end(res));
      this._stream = null;
    }
  }

  /** Total event count. */
  size() { return this.events.length; }

  /** Filter helper used by tests + renderer. */
  filter(predicate) { return this.events.filter(predicate); }

  /** Events belonging to one account. */
  forAccount(archetype) { return this.events.filter(e => e.account === archetype); }

  /** Read a JSONL file into memory — used by the renderer. */
  static readFile(p) {
    const raw = fs.readFileSync(p, 'utf8');
    const out = [];
    for (const line of raw.split(/\r?\n/)) {
      const t = line.trim();
      if (!t) continue;
      try { out.push(JSON.parse(t)); } catch (e) { /* skip malformed */ }
    }
    return out;
  }
}

module.exports = { EventLog, EVENT_TYPES };
