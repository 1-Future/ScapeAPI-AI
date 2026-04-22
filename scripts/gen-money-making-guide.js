// ══════════════════════════════════════════════════════════════════════════════
// scripts/gen-money-making-guide.js
//
// Generates reports/explorer/money-making-guide.md — denormalized view of
// data/intensity-catalog.json surfacing the top 50 moneymakers per gp-tier,
// plus per-region rankings, intensity heatmap, and non-combat 5M+ callout.
//
// Read-only. Depends on data/intensity-catalog.json (built by
// scripts/build-intensity-catalog.js).
//
// Source: v0.9 roadmap M16.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const CATALOG = path.join(REPO_ROOT, 'data', 'intensity-catalog.json');
const OUT = path.join(REPO_ROOT, 'reports', 'explorer', 'money-making-guide.md');

const cat = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));
const acts = cat.activities;

const TIERS = [
  ['5M+',       a => a.base_gp_per_hour >= 5_000_000],
  ['2-5M',      a => a.base_gp_per_hour >= 2_000_000 && a.base_gp_per_hour < 5_000_000],
  ['1-2M',      a => a.base_gp_per_hour >= 1_000_000 && a.base_gp_per_hour < 2_000_000],
  ['500k-1M',   a => a.base_gp_per_hour >= 500_000   && a.base_gp_per_hour < 1_000_000],
  ['250-500k',  a => a.base_gp_per_hour >= 250_000   && a.base_gp_per_hour < 500_000],
  ['100-250k',  a => a.base_gp_per_hour >= 100_000   && a.base_gp_per_hour < 250_000],
  ['50-100k',   a => a.base_gp_per_hour >= 50_000    && a.base_gp_per_hour < 100_000],
  ['1-50k',     a => a.base_gp_per_hour >= 1_000     && a.base_gp_per_hour < 50_000],
];

const INTENSITY_LABELS = {
  1: 'AFK', 2: 'Light', 3: 'Attentive', 4: 'Tick', 5: 'Active',
  6: 'Prayer-flick', 7: 'PvM', 8: 'Prayer-swap', 9: 'Raid', 10: 'Inferno',
};

function row(a) {
  const reqs = [];
  if (a.level_required > 1) reqs.push('lvl ' + a.level_required);
  if (a.gating && a.gating.quests && a.gating.quests.length) {
    reqs.push('Q: ' + a.gating.quests.slice(0, 2).join(', ') + (a.gating.quests.length > 2 ? '...' : ''));
  }
  const reqStr = reqs.length ? reqs.join(' | ') : '—';
  const gpFmt = (a.base_gp_per_hour || 0).toLocaleString();
  const xpFmt = (a.base_xp_per_hour || 0).toLocaleString();
  const skill = a.skill || '—';
  const region = a.region || '—';
  const notes = (a.notes || '').replace(/\|/g, ' ').replace(/\n/g, ' ').substring(0, 80);
  return '| ' + a.activity_id + ' | ' + gpFmt + ' | ' + xpFmt + ' | int ' + a.intensity +
    ' (' + (INTENSITY_LABELS[a.intensity] || '?') + ') | ' + skill + ' | ' + region +
    ' | ' + reqStr + ' | ' + notes + ' |';
}

let md = '# Scape Money Making Guide\n\n';
md += '*Denormalized view of `data/intensity-catalog.json`. Auto-generated for M16.*\n\n';
md += '**Total catalog:** ' + acts.length + ' activities. **Last regen:** ' + cat.generated_at + '.\n\n';
md += '**Intensity legend:** 1 = pure AFK · 2 = light interaction · 3 = attentive skilling · 4 = tick-locked · 5 = active · 6 = prayer-flick / 3-tick · 7 = PvM rotation · 8 = prayer+swap / high-stakes · 9 = raid · 10 = Inferno / max-effort.\n\n';
md += '**Categories:** `combat`/kill_* methods are boss/mob farming; skilling methods trade xp + gp; `instance`/`minigame`/`raid` entries are repeatable encounters. `trainmethod_*` entries are XP-focused with gp secondary.\n\n';
md += '---\n\n';

// Summary table
md += '## Summary — method count per tier\n\n';
md += '| Tier | Methods | Median gp/hr | Top method |\n';
md += '|---|---:|---:|---|\n';
for (const [name, pred] of TIERS) {
  const inTier = acts.filter(pred);
  inTier.sort((a, b) => b.base_gp_per_hour - a.base_gp_per_hour);
  if (!inTier.length) { md += '| ' + name + ' | 0 | — | — |\n'; continue; }
  const median = inTier[Math.floor(inTier.length / 2)].base_gp_per_hour;
  const top = inTier[0];
  md += '| ' + name + ' | ' + inTier.length + ' | ' + median.toLocaleString() + ' | ' +
    top.activity_id + ' (' + top.base_gp_per_hour.toLocaleString() + ') |\n';
}
md += '\n---\n\n';

// Per-tier top 50
for (const [name, pred] of TIERS) {
  const inTier = acts.filter(pred);
  inTier.sort((a, b) => b.base_gp_per_hour - a.base_gp_per_hour);
  const top50 = inTier.slice(0, 50);
  md += '## Tier: ' + name + ' gp/hr\n\n';
  md += '**Activities in band:** ' + inTier.length + '. **Showing top ' + top50.length + '** by gp/hr.\n\n';
  if (top50.length === 0) { md += '*No entries.*\n\n---\n\n'; continue; }
  md += '| Activity | gp/hr | xp/hr | Intensity | Skill | Region | Requirements | Notes |\n';
  md += '|---|---:|---:|---|---|---|---|---|\n';
  for (const a of top50) md += row(a) + '\n';
  md += '\n---\n\n';
}

// Region ranking
md += '## Best per region (top 10 by gp/hr, ≥100k gp/hr only)\n\n';
const regions = [...new Set(acts.map(a => a.region))].sort();
for (const r of regions) {
  const rActs = acts.filter(a => a.region === r && a.base_gp_per_hour >= 100000);
  rActs.sort((a, b) => b.base_gp_per_hour - a.base_gp_per_hour);
  const top = rActs.slice(0, 10);
  md += '### ' + r + '\n\n';
  if (!top.length) { md += '*No methods ≥100k gp/hr.*\n\n'; continue; }
  md += '| Activity | gp/hr | Int | Skill | Level | Notes |\n';
  md += '|---|---:|---|---|---:|---|\n';
  for (const a of top) {
    const notes = (a.notes || '').replace(/\|/g, ' ').substring(0, 60);
    md += '| ' + a.activity_id + ' | ' + (a.base_gp_per_hour || 0).toLocaleString() +
      ' | ' + a.intensity + ' | ' + (a.skill || '-') + ' | ' + (a.level_required || 1) +
      ' | ' + notes + ' |\n';
  }
  md += '\n';
}
md += '\n---\n\n';

// Non-combat 5M+ callout
md += '## Non-combat 5M+ elite methods (M15 target: OSRS rune/flip/processing analogues)\n\n';
const COMBAT_SKILLS = new Set(['attack','strength','defence','hitpoints','ranged','magic','slayer','prayer','combat']);
const nonCombat5m = acts.filter(a =>
  a.base_gp_per_hour >= 5_000_000 &&
  !a.activity_id.startsWith('kill_') &&
  !COMBAT_SKILLS.has(a.skill) &&
  a.activity_type !== 'boss_kill'
);
nonCombat5m.sort((a, b) => b.base_gp_per_hour - a.base_gp_per_hour);
md += '*Passive/processing methods ≥5M gp/hr. These fill the endgame gap from boss-dominated catalog.*\n\n';
if (!nonCombat5m.length) {
  md += '*None found.*\n\n';
} else {
  md += '| Activity | gp/hr | Skill | Region | Intensity | Notes |\n';
  md += '|---|---:|---|---|---|---|\n';
  for (const a of nonCombat5m) {
    const notes = (a.notes || '').replace(/\|/g, ' ').substring(0, 80);
    md += '| ' + a.activity_id + ' | ' + (a.base_gp_per_hour || 0).toLocaleString() +
      ' | ' + (a.skill || '-') + ' | ' + (a.region || '-') + ' | int ' + a.intensity +
      ' | ' + notes + ' |\n';
  }
}
md += '\n---\n\n';

// Intensity × tier heatmap
md += '## Intensity × gp-tier heatmap (method count per cell)\n\n';
const intensityRowLabels = ['1 AFK','2 Light','3 Attentive','4 Tick','5 Active','6 Prayer-flick','7 PvM','8 Prayer-swap','9 Raid','10 Inferno'];
md += '| Intensity | 0 | 1-50k | 50-100k | 100-250k | 250-500k | 500k-1M | 1-2M | 2-5M | 5M+ |\n';
md += '|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|\n';
for (let i = 1; i <= 10; i++) {
  const buckets = [
    a => a.base_gp_per_hour <= 0,
    a => a.base_gp_per_hour > 0 && a.base_gp_per_hour < 50_000,
    a => a.base_gp_per_hour >= 50_000 && a.base_gp_per_hour < 100_000,
    a => a.base_gp_per_hour >= 100_000 && a.base_gp_per_hour < 250_000,
    a => a.base_gp_per_hour >= 250_000 && a.base_gp_per_hour < 500_000,
    a => a.base_gp_per_hour >= 500_000 && a.base_gp_per_hour < 1_000_000,
    a => a.base_gp_per_hour >= 1_000_000 && a.base_gp_per_hour < 2_000_000,
    a => a.base_gp_per_hour >= 2_000_000 && a.base_gp_per_hour < 5_000_000,
    a => a.base_gp_per_hour >= 5_000_000,
  ];
  const cells = buckets.map(b => acts.filter(a => a.intensity === i && b(a)).length);
  md += '| ' + intensityRowLabels[i - 1] + ' | ' + cells.join(' | ') + ' |\n';
}
md += '\n---\n\n';

md += '*End of guide. Regenerate via `node scripts/gen-money-making-guide.js`.*\n';

fs.writeFileSync(OUT, md);
console.log('wrote', OUT, '(' + md.length + ' bytes)');
console.log('non-combat 5M+:', nonCombat5m.length);
for (const a of nonCombat5m) console.log('  -', a.activity_id, a.base_gp_per_hour);
