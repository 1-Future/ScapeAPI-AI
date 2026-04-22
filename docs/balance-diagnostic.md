# Balance Diagnostic

**Status:** burn-v0.8 deliverable — calibration tool for the content grid.
**Last updated:** 2026-04-22
**Owner:** agent 5 (balance lane)

## 1. Purpose

The balance diagnostic is **not a player simulation**. It is a **calibration probe
for the content grid** — the intensity catalog, progression DAG, method book,
and quest chains that other burn-v0.8 lanes produce.

Put bluntly: we are not trying to predict what real people will do. We are
stress-testing whether the sum of all Scape content *lets* four archetypes of
player energy reach meaningful outcomes across a 30-day window. If a 1-hour /
day player can't finish the Boneyard chain in 30 days, that's a content gap,
not a player problem. If the 8-hour / day player bottoms out on identical
methods for six real days in a row, the intensity catalog has a hole.

### Why four accounts, why only the attention cap differs

The only thing we want to vary between bots is the **budget**. Everything else
— decision logic, action pool, goal-selection heuristic, randomness seed —
stays identical so any divergence in outcomes is attributable to the bar cap.

Think of it as a pressure test: same player, same water supply, four sizes of
bucket. If the small bucket comes up short on a quest chain, either the chain
is too expensive or our intensity grid over-charges the actions on the
critical path.

### What a "misery zone" looks like in the output

- **Efficiency cliff:** output-per-drain drops 40%+ between two adjacent
  unlocks and the cheaper option is locked behind a quest the low-attention
  bot never reaches.
- **Repetition trap:** one action accounts for more than 35% of the low-cap
  bot's day for more than 10 consecutive days.
- **Intensity hole:** no action exists at intensity ≤ X in a given category
  at the player's current unlock frontier — they are forced to pay more per
  tick than the design bible assumes.
- **Dead unlock:** the progression DAG opens a node, but every method behind
  that node scores lower than one already available — the unlock is
  ceremonial.

---

## 2. The 4-account design

Every bot boots with the same starting state: level 1 in every skill, empty
inventory, zero GP, Heartlands home region, no quest flags. Every bot pulls
decisions from the same policy. The only knob is the **attention bar cap**:

| Archetype  | Bar cap  | Typical daily spend (if drain avg ≈ 3) | Real-world analogue       |
|------------|----------|-----------------------------------------|---------------------------|
| low        | 200      | ~60-70 actions before refill needed     | one lunch break           |
| medium     | 500      | ~150-170 actions                        | commute + evening session |
| high       | 1000     | ~300-340 actions                        | committed hobby player    |
| unlimited  | Infinity | capped only by the 8-hour session wall  | streamer / no-lifer       |

**Bar refills** at the end of each simulated day. A day is 24 simulated hours;
the active play window is capped at **8 hours / day** even for the unlimited
bot. The bar never carries over.

**Why Infinity rather than a very large number:** we want the unlimited bot's
ceiling to be expressed by the 8-hour session cap and the action time cost,
not by whatever number we picked for "large". Using `Infinity` means the only
thing limiting the ceiling player is clock time and unlock gating — exactly
the right signal.

---

## 3. Per-action drain model

The drain model is deliberately simple. Every activity in the intensity
catalog declares a base `intensity` (1-5, following the manifesto P02 scale)
and a `base_output` (XP + GP). The runner multiplies:

```
drain_per_action   = activity.intensity × time_factor
output_per_action  = activity.base_output         // no multiplier — universal
```

`time_factor` defaults to 1. It is a hook: if we later decide that agility
shortcuts reduce drain by 10%, we multiply `time_factor` by 0.9 for that
action when the shortcut is unlocked. It is **not** a per-player multiplier.

**No player multiplier.** There is no "low-attention player is worse at
mining". Bar drain is universal. Output is universal. The only thing that
changes between bots is how many ticks they get per day.

Intensity mapping from the manifest `ATTENTION` enum (see
`src/engine/skills/_shape.js`):

| ATTENTION  | Intensity |
|------------|-----------|
| Background | 1         |
| Multitask  | 2         |
| Active     | 3         |
| Max Focus  | 5         |

Missing `attention` fields default to `2` (Multitask) — this matches the
Marstead "everyday knob" in the transcript.

---

## 4. Event log schema

The simulator is an append-only log. Every tick writes one JSONL line. The
renderer aggregates the log; nothing is stored twice.

```jsonc
{
  "timestamp":   "2026-04-22T14:03:11.418Z", // real-time wall clock
  "sim_day":     7,                           // 0-indexed simulated day
  "tick":        1241,                        // monotonic tick count
  "account":     "medium",                    // low | medium | high | unlimited
  "type":        "action",                    // boot | action | session_end | day_end | goal_set | gap
  "action_id":   "mining::mine-iron-rock",    // skill::slug, stable
  "drain":       2,                           // bar cost of this action
  "output": {
    "xp":        { "mining": 35 },            // skill → xp
    "gp":        12,                          // gp earned / spent (negative)
    "items":     [{ "id": "iron-ore", "qty": 1 }]
  },
  "state_snapshot": {
    "bar":       198,                         // bar remaining AFTER action
    "day_ms":    54_000,                      // ms spent in the simulated day so far
    "levels":    { "mining": 14 },            // only changed skills
    "goal":      "reach-mining-15"
  }
}
```

Event types:

- `boot` — bot starts a run. `state_snapshot` is the full initial state.
- `action` — an activity resolved. See above.
- `session_end` — bar hit 0 OR 8-hour wall. `state_snapshot.reason` explains.
- `day_end` — one simulated day closed. Bar refills before the next `boot`.
- `goal_set` — goal planner swapped the active goal. Includes reason.
- `gap` — policy hit a dead-end (no feasible action). Diagnostic trigger.

The log file is `reports/diagnostic-<ISO-timestamp>.jsonl`. Each account's
events are interleaved but tagged; the renderer splits by `account`.

---

## 5. Decision loop specification

```text
while bar_remaining > 0 and day_ms < 8h:
    feasible = filter_by_state(all_activities)
      // keeps actions whose level, inventory, quest flag, and area
      // requirements all pass.

    if feasible.length === 0:
        emit({ type: "gap", reason: "no feasible action" })
        break

    scored = score_by_goal_progress(feasible)
      // each active goal contributes a 0-1 score. Sum them. Apply a base
      // 0.1 for any feasible action so survival still beats nothing.

    ranked = scored.map(a => ({ a, efficiency: a.score / (a.drain || 1) }))
    ranked.sort(desc efficiency)

    top_k  = ranked.slice(0, 3)
    chosen = pick_with_small_randomness(top_k, epsilon = 0.1)
      // 10% chance of picking the 2nd or 3rd slot uniformly.

    if chosen.drain > bar_remaining * 1.5:
        // Can't afford — fall back to low-intensity alternative.
        low = feasible.filter(a => a.intensity <= 1)
        chosen = low.length ? weighted_pick(low) : null
        if chosen === null: break

    apply(chosen)           // XP, GP, inventory, flags
    bar_remaining -= chosen.drain
    day_ms        += chosen.time_ms
    log('action', chosen)

    if (bar_remaining === 0): log('session_end', 'bar depleted')
    if (day_ms >= 8h):         log('session_end', '8h cap')
```

Goals are a ranked list of 1-3 active entries. The planner uses this
priority order:

1. **Survival** — always present, baseline score 0.1. Prevents deadlock.
2. **Active quest next-step** — if a quest is mid-progress, its next
   requirement gets a 1.0 score on matching actions.
3. **Skill target** — e.g. "reach mining 15" unlocks the next tier.
4. **GP target** — accumulate GP for gear / houses. Scores trade-ins,
   high-value drops.
5. **Unlock chain node** — if the DAG shows a specific node within 2 hops,
   that node becomes a latent goal.

Exactly one entry from slots 2-5 is "active" at a time. The planner rotates
every 6 simulated hours or on goal completion.

---

## 6. Output format

### 6.1 Headline stats table

Four columns — low / medium / high / unlimited — with these rows:

```
                            low         medium       high        unlimited
Total attention          6,000        15,000      30,000         ∞ (Xk)
Active playtime          ~60hr        ~150hr      ~240hr         ~720hr
Total XP                  XXX            XXX         XXX            XXX
Total GP                  XXX            XXX         XXX            XXX
Quests completed            X              X           X              X
Highest skill              XX             XX          XX             XX
Unlocks reached            XX             XX          XX             XX
Unique actions taken       XX             XX          XX             XX
Misery zones               XX             XX          XX             XX
```

`Total attention = cap × days`. Active playtime is the sum of `time_ms` across
all logged actions. Unlocks = distinct action ids executed at least once.
Misery zones = count of 10-day repetition windows that exceeded the 35%
threshold on a single action.

### 6.2 Progression curves

Four-line SVG chart of total XP per simulated day. Colour-coded: low=umber,
medium=sienna, high=forest, unlimited=ink. Axes labelled in OSRS-parchment
style — cream background, no grid lines, ticks every 5 days / 50k XP.

### 6.3 Activity mix bars

For each bot, a horizontal stacked bar: the top 10 action ids by total drain
spent, as a percentage of that bot's total drain. Identifies where the bot
got stuck.

### 6.4 Content gap callouts

Rendered as a list of `<p class="gap">…</p>`:

- Every `type: "gap"` event, grouped by `action pool signature`.
- Every "dead unlock" — a skill tier or quest reward that nobody touched.
- Every "intensity hole" — a 5-level skill window with zero actions at
  intensity ≤ 1.

---

## 7. Success criteria

We deem the content grid **healthy** when the 30-day diagnostic shows:

| Metric                                 | Target                   |
|----------------------------------------|--------------------------|
| `low XP / unlimited XP`                | 0.20 – 0.40              |
| `high XP / unlimited XP`               | 0.70 – 0.90              |
| `low quests complete / unlimited`      | ≥ 0.50 on main chain     |
| No single action > 35% of daily drain  | for any bot, 10-day run  |
| Zero `gap` events after sim_day = 2    | (day 1-2 bootstrap ok)   |
| Highest skill reached by low           | ≥ 40                     |
| Highest skill reached by unlimited     | ≥ 85                     |

If `low/unlimited` falls below 0.2, low-cap play is not viable and we need
cheaper methods on the progression critical path. If it exceeds 0.4, the
high / unlimited bots aren't being rewarded for investment and we need
higher-ceiling content (raids, boss instances, endgame skills).

---

## 8. How to run

```bash
node src/sim 30            # 30 simulated days, default bot list
node src/sim 7  --seed=42  # 7 simulated days, deterministic seed
node src/sim -- --accounts=low,high    # subset of bots
```

The runner writes `reports/diagnostic-<ts>.jsonl`, then calls
`render-html.js` to produce `reports/diagnostic-<ts>.html` alongside it.

```bash
node src/sim/render-html.js reports/diagnostic-2026-04-22T14-30Z.jsonl
# → writes reports/diagnostic-2026-04-22T14-30Z.html
```

---

## 9. Non-goals

- Not modelling real-player ragequit / session length statistics.
- Not modelling social play (grouping, trading between bots).
- Not replacing the RL spectator agent. Different tool, different job.
- Not tuning individual action XP / GP values. That's the intensity lane's
  job; the diagnostic only reports the ratios that fall out.
- Not a bot for the live server. The sim runs in-process on a stub Play API.

---

## 10. Future work

- Wire the sim to the real Play API once `src/server.js` exposes a clean
  in-process fixture (it currently does via websocket, which is more
  machinery than a calibration tool needs).
- Feed the diagnostic output back into the progression DAG as a "confidence
  score" per node: did any bot ever use this unlock? Was it on a critical
  path?
- Generate a weekly HTML and commit it to `reports/history/` so we can
  track whether successive content waves improve the ratios.

---

*See `src/sim/` for the implementation. `src/sim/render-html.js` produces the
HTML. Sample output lives in `reports/diagnostic-*.html` after the first
successful run.*
