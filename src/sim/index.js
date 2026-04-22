#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// src/sim — Balance diagnostic CLI entrypoint.
//
// Usage:
//   node src/sim 30                  # 30 simulated days, default bots
//   node src/sim 7 --seed=42         # deterministic run
//   node src/sim -- --accounts=low,high
//
// Produces:
//   reports/diagnostic-<ts>.jsonl
//   reports/diagnostic-<ts>.html
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const { runDiagnostic, ARCHETYPES } = require('./hyperspeed-runner');
const { renderHtmlFromLog }         = require('./render-html');
const path = require('path');

function parseArgs(argv) {
  const args = { days: 30, seed: 1, accounts: ARCHETYPES };
  for (const tok of argv.slice(2)) {
    if (/^\d+$/.test(tok)) { args.days = parseInt(tok, 10); continue; }
    if (tok.startsWith('--seed=')) { args.seed = parseInt(tok.slice(7), 10); continue; }
    if (tok.startsWith('--accounts=')) {
      args.accounts = tok.slice(11).split(',').filter(Boolean);
      continue;
    }
    if (tok === '--no-html') { args.noHtml = true; continue; }
    if (tok === '--help' || tok === '-h') {
      console.log('node src/sim [days] [--seed=N] [--accounts=low,medium,high,unlimited] [--no-html]');
      process.exit(0);
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv);

  console.log(`[sim] running ${args.days}-day diagnostic, accounts: ${args.accounts.join(',')}, seed: ${args.seed}`);
  const result = await runDiagnostic(args);
  console.log(`[sim] catalog: ${result.catalogSource}, dag: ${result.dagSource}, quests: ${result.questsSource} (${result.questsLoaded})`);
  console.log(`[sim] wrote ${result.events} events to ${result.outPath}`);

  if (!args.noHtml) {
    const htmlPath = result.outPath.replace(/\.jsonl$/, '.html');
    renderHtmlFromLog(result.outPath, htmlPath);
    console.log(`[sim] rendered HTML → ${htmlPath}`);
  }
}

if (require.main === module) {
  main().catch(e => { console.error(e); process.exit(1); });
}

module.exports = { parseArgs, main };
