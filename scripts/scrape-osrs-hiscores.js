#!/usr/bin/env node
// ═════════════════════════════════════════════════════════════════════════════
// Scrape per-boss KC distributions from OSRS hiscores.
//
// For each of 20 priority bosses we sample 7 rank points (1, 50, 200, 1000,
// 5000, 25000, 100000). Each page on the hiscore site shows 25 ranks, so the
// page number for rank R is ceil(R/25) and the target rank within the page is
// ((R-1) % 25) + 1.
//
// Output: data/osrs-hiscores-snapshot.json
//
// Rate limit: 2000ms between requests. Respectful scraping. Failed fetches are
// logged and the scrape continues.
// ═════════════════════════════════════════════════════════════════════════════

'use strict';

const fs = require('fs');
const path = require('path');

const BOSSES = [
  { key: 'vorkath',             table: 84, name: 'Vorkath' },
  { key: 'zulrah',              table: 88, name: 'Zulrah' },
  { key: 'phantom_muspah',      table: 59, name: 'Phantom Muspah' },
  { key: 'cerberus',            table: 30, name: 'Cerberus' },
  { key: 'kraken',              table: 50, name: 'Kraken' },
  { key: 'alchemical_hydra',    table: 21, name: 'Alchemical Hydra' },
  { key: 'corporeal_beast',     table: 36, name: 'Corporeal Beast' },
  { key: 'nightmare',           table: 56, name: 'Nightmare' },
  { key: 'hespori',             table: 47, name: 'Hespori' },
  { key: 'dagannoth_rex',       table: 39, name: 'Dagannoth Rex' },
  { key: 'general_graardor',    table: 44, name: 'General Graardor' },
  { key: 'kril_tsutsaroth',     table: 52, name: "K'ril Tsutsaroth" },
  { key: 'commander_zilyana',   table: 35, name: 'Commander Zilyana' },
  { key: 'kreearra',            table: 51, name: "Kree'Arra" },
  { key: 'king_black_dragon',   table: 49, name: 'King Black Dragon' },
  { key: 'sarachnis',           table: 60, name: 'Sarachnis' },
  { key: 'tempoross',           table: 67, name: 'Tempoross' },
  { key: 'wintertodt',          table: 85, name: 'Wintertodt' },
  { key: 'phosanis_nightmare',  table: 57, name: "Phosani's Nightmare" },
  { key: 'chambers_of_xeric',   table: 31, name: 'Chambers of Xeric' },
  { key: 'theatre_of_blood',    table: 74, name: 'Theatre of Blood' },
];

const SAMPLE_RANKS = [1, 50, 200, 1000, 5000, 25000, 100000];

const BASE = 'https://secure.runescape.com/m=hiscore_oldschool/overall';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function pageForRank(rank) {
  return Math.ceil(rank / 25);
}

function indexOnPage(rank) {
  return ((rank - 1) % 25); // 0-indexed position on the 25-row page
}

// The hiscore page is standard HTML with a table.personal-hiscores__row rows.
// Each row has 4 <td>s: rank, name, score (and level for overall). We extract
// the plain-text cells via a coarse regex — resilient to the incidental markup
// changes but brittle if they overhaul the layout.
function parseRowsFromHtml(html) {
  const rows = [];
  // Use a line-by-line approach — personal-hiscores rows always have this class.
  const rowRe = /<tr[^>]*class="[^"]*personal-hiscores__row[^"]*"[^>]*>([\s\S]*?)<\/tr>/g;
  let m;
  while ((m = rowRe.exec(html)) !== null) {
    const cellsHtml = m[1];
    const cellRe = /<td[^>]*>([\s\S]*?)<\/td>/g;
    const cells = [];
    let c;
    while ((c = cellRe.exec(cellsHtml)) !== null) {
      cells.push(c[1]
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim());
    }
    if (cells.length >= 3) {
      const rank  = parseInt(cells[0].replace(/[^\d]/g, ''), 10);
      const name  = cells[1];
      const score = parseInt(cells[2].replace(/[^\d]/g, ''), 10);
      if (Number.isFinite(rank) && Number.isFinite(score)) {
        rows.push({ rank, name, score });
      }
    }
  }
  return rows;
}

async function fetchPage(tableId, page) {
  const url = `${BASE}?category_type=1&table=${tableId}&page=${page}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'ScapeAI-burnout-calibration/1.0 (contact osrsshorts@gmail.com)',
      'Accept': 'text/html,application/xhtml+xml',
    },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const html = await res.text();
  const rows = parseRowsFromHtml(html);
  return { url, rows };
}

async function main() {
  const outPath = path.join(__dirname, '..', 'data', 'osrs-hiscores-snapshot.json');
  const snapshot = {
    $schema: 'scape.osrs-hiscores-snapshot.v1',
    generated: new Date().toISOString(),
    generatedFor: 'real-commitment-calibration',
    sampleRanks: SAMPLE_RANKS,
    notes: 'Per-boss KC at the 7 canonical sample ranks. KC = 0 or missing row means the rank does not exist for that boss (not enough players ranked).',
    bosses: {},
    failures: [],
  };

  // Batch requests: we need one page fetch per (boss, rank). Many of the 7 ranks
  // live on different pages, so we iterate boss × rank and dedupe by url to
  // minimise fetches (rank 1 and rank 50 span two pages, so they're two fetches).
  // In practice the dedupe gives us ~6 fetches per boss instead of 7.
  const cache = new Map();

  let totalFetches = 0;
  for (const boss of BOSSES) {
    console.log(`[scrape] ${boss.name} (table=${boss.table})`);
    snapshot.bosses[boss.key] = {
      name: boss.name,
      tableId: boss.table,
      samples: {},
    };

    for (const rank of SAMPLE_RANKS) {
      const page = pageForRank(rank);
      const idx  = indexOnPage(rank);
      const cacheKey = `${boss.table}:${page}`;

      let pageResult;
      if (cache.has(cacheKey)) {
        pageResult = cache.get(cacheKey);
      } else {
        try {
          pageResult = await fetchPage(boss.table, page);
          cache.set(cacheKey, pageResult);
          totalFetches++;
          console.log(`  page ${page} → ${pageResult.rows.length} rows`);
        } catch (e) {
          const msg = `${boss.name} rank ${rank} page ${page}: ${e.message}`;
          console.error(`  FAIL ${msg}`);
          snapshot.failures.push(msg);
          cache.set(cacheKey, null);
          await sleep(2000);
          continue;
        }
        await sleep(2000);
      }

      if (!pageResult) continue;

      const row = pageResult.rows[idx] || null;
      snapshot.bosses[boss.key].samples[`rank_${rank}`] = row ? {
        rank: row.rank, name: row.name, kc: row.score,
      } : { rank: null, name: null, kc: null };
    }

    // Flush incrementally so a crash doesn't lose work.
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(snapshot, null, 2));
  }

  snapshot.totalFetches = totalFetches;
  fs.writeFileSync(outPath, JSON.stringify(snapshot, null, 2));
  console.log(`\n[scrape] wrote ${outPath}`);
  console.log(`[scrape] ${totalFetches} fetches, ${snapshot.failures.length} failures`);
}

main().catch(e => { console.error(e); process.exit(1); });
