#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// scripts/gen-quest-xp-rollup.js
//
// Produces `reports/quest-xp-rollup.md` — a skill-by-skill summary of the XP
// Scape quests collectively award, plus downstream DAG-unlock counts. A
// diagnostic aid, not a balance lever: answers questions like "is Slayer
// under-rewarded by the quest book?" or "which quest is the single biggest
// XP source for Magic?".
//
// Output format (markdown):
//   - Table: Skill | Total XP | #Quests | Top source | Top quest XP
//   - Table: Quest | Difficulty | Total XP | Skills covered | Downstream
//   - Summary stats block
//
// Reads:
//   - quest-loader (snapshot of 220+ quest records)
//   - data/progression-dag.json (downstream counts)
//
// Writes:
//   - reports/quest-xp-rollup.md
//
// Usage:
//   node scripts/gen-quest-xp-rollup.js
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const fs   = require('fs');
const path = require('path');
const { loadQuests } = require('../src/sim/quest-loader');
const { buildDownstreamValueMap } = require('../src/sim/goal-planner');

// ─── Helpers ────────────────────────────────────────────────────────────────
function num(n) { return Number(n || 0).toLocaleString('en-US'); }

function loadRawDag() {
  const p = path.join(__dirname, '..', 'data', 'progression-dag.json');
  if (!fs.existsSync(p)) return null;
  const raw = JSON.parse(fs.readFileSync(p, 'utf8'));

  // Raw DAG has array nodes with string-array requires. Normalise to the
  // shape buildDownstreamValueMap expects.
  const nodes = {};
  if (Array.isArray(raw.nodes)) {
    for (const n of raw.nodes) {
      nodes[n.id] = {
        label:        n.name || n.id,
        type:         n.type,
        region:       n.region || null,
        _rawRequires: n.requires || [],
      };
    }
  }
  return { nodes };
}

function skillXpRollup(quests) {
  const bySkill = Object.create(null);
  for (const q of quests) {
    const xp = (q.rewards && q.rewards.xp) || {};
    for (const [skill, amt] of Object.entries(xp)) {
      if (!bySkill[skill]) bySkill[skill] = { total: 0, questCount: 0, top: null };
      bySkill[skill].total += amt;
      bySkill[skill].questCount += 1;
      if (!bySkill[skill].top || amt > bySkill[skill].top.amt) {
        bySkill[skill].top = { id: q.id, name: q.name, amt };
      }
    }
  }
  return bySkill;
}

function questRollup(quests, downstreamMap) {
  const rows = [];
  for (const q of quests) {
    const xp = (q.rewards && q.rewards.xp) || {};
    const total = Object.values(xp).reduce((a, b) => a + b, 0);
    const skills = Object.keys(xp);
    const downstream = downstreamMap[`quest:${q.id}`] || 0;
    const unlocks = (q.rewards && Array.isArray(q.rewards.unlocks)) ? q.rewards.unlocks.length : 0;
    rows.push({
      id:        q.id,
      name:      q.name,
      difficulty:q.difficulty || '—',
      qp:        q.questPoints || 1,
      total,
      skills,
      downstream,
      unlocks,
      chain_next: q.rewards && q.rewards.chain_next,
    });
  }
  return rows;
}

// ─── Markdown render ───────────────────────────────────────────────────────
function renderMarkdown({ quests, bySkill, questRows, downstreamMap, generatedAt }) {
  const lines = [];
  lines.push('# Quest XP Rollup');
  lines.push('');
  lines.push(`**Generated:** ${generatedAt}`);
  lines.push(`**Quests loaded:** ${quests.length}`);
  lines.push(`**Skills covered:** ${Object.keys(bySkill).length}`);
  lines.push(`**Total quest-reward XP (all skills):** ${num(Object.values(bySkill).reduce((a, b) => a + b.total, 0))}`);
  const withUnlocks = quests.filter(q => Array.isArray(q.rewards && q.rewards.unlocks) && q.rewards.unlocks.length).length;
  const withChain = quests.filter(q => q.rewards && q.rewards.chain_next).length;
  lines.push(`**Quests with \`unlocks\`:** ${withUnlocks} / ${quests.length}`);
  lines.push(`**Quests with \`chain_next\`:** ${withChain} / ${quests.length}`);
  lines.push('');

  lines.push('## Purpose');
  lines.push('');
  lines.push('Diagnostic aid for the balance-diagnostic team. Shows where the');
  lines.push('quest book distributes XP so "under-rewarded skill" gaps show up.');
  lines.push('');
  lines.push('- **Total XP** = sum of `rewards.xp` across every quest that awards that skill.');
  lines.push('- **#Quests** = distinct quests contributing any XP to the skill.');
  lines.push('- **Top quest** = single highest-XP reward (useful for checking outliers).');
  lines.push('- **Downstream DAG** = nodes unlocked (transitively) by completing the quest.');
  lines.push('');

  // ─── Table 1: per-skill ───────────────────────────────────────────────────
  lines.push('## Per-skill XP totals');
  lines.push('');
  lines.push('| Skill | Total XP | #Quests | Top quest | Top XP |');
  lines.push('|---|---:|---:|---|---:|');
  const skillsSorted = Object.entries(bySkill).sort((a, b) => b[1].total - a[1].total);
  for (const [skill, info] of skillsSorted) {
    const top = info.top
      ? `${info.top.name} (\`${info.top.id}\`)`
      : '—';
    const topXp = info.top ? num(info.top.amt) : '—';
    lines.push(`| ${skill} | ${num(info.total)} | ${info.questCount} | ${top} | ${topXp} |`);
  }
  lines.push('');

  // ─── Table 2: per-quest rollup ────────────────────────────────────────────
  lines.push('## Per-quest rollup (top 50 by total XP)');
  lines.push('');
  lines.push('| Quest | Difficulty | QP | Total XP | Skills | Unlocks | Downstream |');
  lines.push('|---|---|---:|---:|---|---:|---:|');
  const top50 = questRows.slice().sort((a, b) => b.total - a.total).slice(0, 50);
  for (const q of top50) {
    const skillList = q.skills.length > 3 ? `${q.skills.slice(0, 3).join(', ')} +${q.skills.length - 3}` : q.skills.join(', ');
    lines.push(`| ${q.name} (\`${q.id}\`) | ${q.difficulty} | ${q.qp} | ${num(q.total)} | ${skillList || '—'} | ${q.unlocks} | ${q.downstream} |`);
  }
  lines.push('');

  // ─── Table 3: top downstream (critical-path quests) ───────────────────────
  lines.push('## Critical-path quests (top 25 by downstream DAG value)');
  lines.push('');
  lines.push('Quests whose completion opens the largest subtree of the');
  lines.push('progression DAG. These are what the planner prioritises for');
  lines.push('unlock-chasing bots.');
  lines.push('');
  lines.push('| Quest | Downstream | Total XP | Unlocks | Chain next |');
  lines.push('|---|---:|---:|---:|---|');
  const top25 = questRows.slice().sort((a, b) => b.downstream - a.downstream).slice(0, 25);
  for (const q of top25) {
    lines.push(`| ${q.name} (\`${q.id}\`) | ${q.downstream} | ${num(q.total)} | ${q.unlocks} | ${q.chain_next || '—'} |`);
  }
  lines.push('');

  // ─── Table 4: quests awarding zero XP ────────────────────────────────────
  const xpless = questRows.filter(q => q.total === 0);
  lines.push(`## Quests awarding zero XP (${xpless.length})`);
  lines.push('');
  if (xpless.length === 0) {
    lines.push('_None — every quest awards at least 1 skill XP._');
  } else {
    lines.push('These quests reward only items / unlocks / quest-points. Audit each:');
    lines.push('are they stub records, or intentional item-only rewards?');
    lines.push('');
    lines.push('| Quest | Difficulty | QP | Unlocks |');
    lines.push('|---|---|---:|---:|');
    for (const q of xpless) {
      lines.push(`| ${q.name} (\`${q.id}\`) | ${q.difficulty} | ${q.qp} | ${q.unlocks} |`);
    }
  }
  lines.push('');

  lines.push('---');
  lines.push('');
  lines.push('_Generated by `scripts/gen-quest-xp-rollup.js`._');
  return lines.join('\n') + '\n';
}

// ─── Main ──────────────────────────────────────────────────────────────────
function main() {
  const quests = loadQuests({ silent: true });
  if (!quests || quests.length === 0) {
    console.error('[quest-xp-rollup] no quests loaded — aborting');
    process.exit(1);
  }

  const rawDag = loadRawDag();
  const downstreamMap = rawDag ? buildDownstreamValueMap(rawDag) : {};

  const bySkill  = skillXpRollup(quests);
  const questRows = questRollup(quests, downstreamMap);
  const md = renderMarkdown({
    quests, bySkill, questRows, downstreamMap,
    generatedAt: new Date().toISOString().slice(0, 10),
  });

  const outPath = path.join(__dirname, '..', 'reports', 'quest-xp-rollup.md');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, md, 'utf8');
  console.log(`[quest-xp-rollup] wrote ${outPath}`);
  console.log(`[quest-xp-rollup] ${quests.length} quests, ${Object.keys(bySkill).length} skills`);
}

if (require.main === module) main();

module.exports = { loadRawDag, skillXpRollup, questRollup, renderMarkdown };
