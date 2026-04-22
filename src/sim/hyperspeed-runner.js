// ══════════════════════════════════════════════════════════════════════════════
// Hyperspeed runner — boots 4 bot accounts, simulates N days in parallel.
//
// "Hyperspeed" means the wall-clock is disconnected from sim time. The runner
// executes actions back-to-back with zero delay; only `state.day_ms` advances.
// A session ends when the bar is empty OR day_ms exceeds 8 hours. Day rollover
// refills the bar and clears `day_ms`.
//
// Output: a JSONL event log at reports/diagnostic-<ts>.jsonl.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const path = require('path');
const fs   = require('fs');

const { AttentionBar, CAPS } = require('./attention-bar');
const { EventLog, EVENT_TYPES } = require('./event-log');
const { BotState }            = require('./state');
const { GoalPlanner }         = require('./goal-planner');
const { loadCatalog }         = require('./stub-catalog');
const { loadDag }             = require('./stub-dag');

const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000;
const ARCHETYPES = ['low', 'medium', 'high', 'unlimited'];

// ─── Helpers ────────────────────────────────────────────────────────────────
function fmtTimestampForFilename() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function resolveOutputPath(reportsDir = null) {
  const dir = reportsDir || path.join(__dirname, '..', '..', 'reports');
  fs.mkdirSync(dir, { recursive: true });
  const ts = fmtTimestampForFilename();
  return path.join(dir, `diagnostic-${ts}.jsonl`);
}

// ─── Seed targets — pulled from the DAG's first few hops ───────────────────
function seedTargets(dag) {
  return {
    targetSkills:   ['mining', 'woodcutting', 'fishing', 'cooking', 'attack', 'agility'],
    targetQuests:   ['cook-assistant', 'tree-gnome'],
    targetDagNodes: Object.keys(dag.nodes || {}).filter(k => k !== 'start').slice(0, 10),
  };
}

// ─── One bot's lifecycle ───────────────────────────────────────────────────
class Bot {
  constructor({ archetype, catalog, dag, log, seed }) {
    this.archetype = archetype;
    this.state     = new BotState(archetype);
    this.bar       = new AttentionBar(archetype);
    this.planner   = new GoalPlanner({ catalog, dag, seed });
    this.log       = log;
    this.catalog   = catalog;
    this.dag       = dag;
    this._ticksThisSession = 0;
    this._eightHourEndFires = 0;
  }

  boot() {
    this.log.emit({
      account:   this.archetype,
      type:      EVENT_TYPES.BOOT,
      sim_day:   this.state.sim_day,
      tick:      this.state.tick,
      drain:     0,
      state_snapshot: {
        ...this.state.snapshot(),
        ...this.bar.snapshot(),
      },
    });
  }

  /**
   * Run one sim-day's worth of actions. Returns nothing; events flow to the log.
   */
  runOneDay(targets) {
    // Ensure planner has goals — seed on first day, rotate thereafter.
    if (this.state.sim_day === 0) {
      this.planner._rotateGoals(this.state, targets.targetSkills, targets.targetQuests, targets.targetDagNodes);
      const goalSummary = this.planner.goals.map(g => g.id);
      this.log.emit({
        account: this.archetype,
        type:    EVENT_TYPES.GOAL_SET,
        sim_day: this.state.sim_day,
        tick:    this.state.tick,
        drain:   0,
        state_snapshot: { goals: goalSummary },
      });
    }

    let sessionEndReason = null;
    while (!sessionEndReason) {
      // Budget checks
      if (this.bar.isExhausted()) { sessionEndReason = 'bar depleted'; break; }
      if (this.state.day_ms >= EIGHT_HOURS_MS) { sessionEndReason = '8h cap'; break; }

      const pick = this.planner.pick(this.state, this.bar);
      if (!pick || !pick.activity) {
        this.log.emit({
          account:   this.archetype,
          type:      EVENT_TYPES.GAP,
          sim_day:   this.state.sim_day,
          tick:      this.state.tick,
          drain:     0,
          state_snapshot: { reason: (pick && pick.reason) || 'unknown' },
        });
        sessionEndReason = 'gap';
        break;
      }

      // Apply. Drain and time advance.
      const activity = pick.activity;
      const drain    = pick.drain || (activity.intensity || 2);
      const timeCost = activity.time_ms || 3000;

      this.state.apply(activity);
      this.bar.drain(drain);
      this.state.day_ms += timeCost;
      this.state.tick += 1;

      // Record activity-level unlocks if the DAG mentions them.
      for (const nodeId of Object.keys(this.dag.nodes || {})) {
        if (this.state.unlocks.has(nodeId)) continue;
        const node = this.dag.nodes[nodeId];
        if (this.state.satisfies(node.requires)) this.state.unlocks.add(nodeId);
      }

      this.log.emit({
        account:   this.archetype,
        type:      EVENT_TYPES.ACTION,
        sim_day:   this.state.sim_day,
        tick:      this.state.tick,
        action_id: activity.id,
        drain,
        output:    activity.base_output,
        state_snapshot: {
          ...this.bar.snapshot(),
          day_ms: this.state.day_ms,
          levels: this.state.snapshot().levels,
          gp:     this.state.gp,
          quests: [...this.state.quests],
        },
      });

      // Goal rotation check
      this.planner.maybeRotate(this.state, targets.targetSkills, targets.targetQuests, targets.targetDagNodes);
    }

    // Session end + day end events
    this.log.emit({
      account:   this.archetype,
      type:      EVENT_TYPES.SESSION_END,
      sim_day:   this.state.sim_day,
      tick:      this.state.tick,
      drain:     0,
      state_snapshot: {
        reason:  sessionEndReason,
        ...this.bar.snapshot(),
        day_ms:  this.state.day_ms,
      },
    });

    this.log.emit({
      account:   this.archetype,
      type:      EVENT_TYPES.DAY_END,
      sim_day:   this.state.sim_day,
      tick:      this.state.tick,
      drain:     0,
      state_snapshot: {
        totalXp:       this.state.totalXp(),
        gp:            this.state.gp,
        highestLevel:  this.state.highestLevel(),
        quests:        [...this.state.quests],
        unlocks:       [...this.state.unlocks].length,
      },
    });

    // Roll day over
    this.state.sim_day += 1;
    this.state.day_ms = 0;
    this.bar.refill();
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────────────
async function runDiagnostic({
  days = 30,
  accounts = ARCHETYPES,
  seed = 1,
  reportsDir = null,
} = {}) {
  const { catalog, source: catalogSource } = loadCatalog();
  const { dag, source: dagSource }         = loadDag();
  const targets = seedTargets(dag);

  const outPath = resolveOutputPath(reportsDir);
  const log = new EventLog({ outPath });

  const bots = accounts.map((arch, idx) => new Bot({
    archetype: arch,
    catalog,
    dag,
    log,
    seed: seed + idx * 7919,
  }));

  for (const b of bots) b.boot();

  for (let d = 0; d < days; d++) {
    for (const b of bots) b.runOneDay(targets);
  }

  log.flush();
  await log.close();

  return {
    outPath,
    events: log.events.length,
    catalogSource,
    dagSource,
    accounts: accounts.slice(),
    days,
  };
}

module.exports = { runDiagnostic, Bot, ARCHETYPES, EIGHT_HOURS_MS, seedTargets };
