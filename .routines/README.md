# Scape Routines

Claude Code Routines that run autonomously in Anthropic's cloud to keep Scape's content healthy and growing.

## Setup

Routines live at **https://claude.ai/code/routines**. They are NOT managed from this repo — they're account-level configs in your claude.ai cloud. This folder just holds the prompts and supporting scripts.

### Prerequisites

- Claude plan: Pro, Max, Team, or Enterprise
- Claude Code on the web enabled
- GitHub account connected to claude.ai
- Claude GitHub App installed on `1-Future/ScapeAPI-AI` (required for GitHub triggers)

## Available routines

### 1. integrity-check (GitHub push trigger)

**Fires:** on every push to `main`

**What it does:** Runs `scripts/integrity-check.js`, which executes the region analyzer + multi-agent divergence sim, writes a timestamped report to `reports/`, and diffs against the previous report. If a region dropped by 5+ depth points OR the divergence verdict flipped to degenerate, opens a GitHub issue.

**Prompt:** see [`integrity-check.md`](./integrity-check.md)

**How to create it:**
1. Go to https://claude.ai/code/routines
2. Click **New routine**, name it "Scape Integrity Check"
3. Paste the prompt from `integrity-check.md`
4. Add repository: `1-Future/ScapeAPI-AI`
5. Environment: Default is fine (just needs Node + git)
6. Trigger: **GitHub event** → select repo → event: **Push** → branch filter: `main`
7. Save

### 2. nightly-content (Scheduled trigger)

**Fires:** once per day at 02:00 local time (or set via `/schedule update`)

**What it does:** Runs `scripts/gap-report.js` to find the thinnest region, drafts ONE new training method + ONE new quest to fill the biggest gap, opens a PR for review. Runs the analyzer before and after to verify the additions help.

**Prompt:** see [`nightly-content.md`](./nightly-content.md)

**How to create it:**
1. Use CLI: `/schedule` and describe "nightly Scape content draft at 2am"
   — OR —
2. Web: https://claude.ai/code/routines → New routine
3. Paste prompt from `nightly-content.md`
4. Repository: `1-Future/ScapeAPI-AI`
5. Trigger: **Schedule** → Daily → 02:00
6. Save

### 3. live-narrator (API trigger, post-engine-bridge)

**Fires:** when the Scape server POSTs an event to the routine's webhook endpoint

**Status:** Not yet active. Waiting on engine bridge (see `ENGINE-BRIDGE-ROADMAP.md`).

**What it will do:** Server-side game events (RL agent beats wave 42, player completes prestige quest, new collection log entry) POST to Claude's routine endpoint with event context. Claude writes 2-3 sentences of flavor text and commits them to `public/events.json` for the spectator to display.

## Supporting scripts

- `scripts/integrity-check.js` — audit content health, diff against previous
- `scripts/gap-report.js` — find thinnest region, output structured gaps

Both scripts run locally too:

```
node scripts/integrity-check.js
node scripts/gap-report.js
```

## The reports/ directory

Integrity reports accumulate here with timestamps. `latest.json` always points to the most recent run. Consider .gitignoring individual timestamped files and only committing `latest.json` if the repo grows noisy.

## Why routines

At 262 training methods + 142 breakpoints + 69 quests across 9 regions, manual auditing is impossible. Routines are a persistent second pair of eyes that keeps the game coherent while you sleep.

See `ENGINE-BRIDGE-ROADMAP.md` for the work that makes routine #3 viable.
