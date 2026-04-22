// ══════════════════════════════════════════════════════════════════════════════
// HTML renderer — reads a diagnostic JSONL log + produces a single-file HTML
// report. No libraries. Inline SVG for charts.
//
// Style: OSRS-parchment. Cream background #F7EFD8, umber text #3A2E1F,
// serif font stack.
//
// Usage (library):
//   const { renderHtmlFromLog } = require('./render-html');
//   renderHtmlFromLog('reports/diagnostic-foo.jsonl', 'reports/diagnostic-foo.html');
//
// Usage (CLI):
//   node src/sim/render-html.js reports/diagnostic-foo.jsonl [out.html]
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const fs = require('fs');
const path = require('path');
const { EventLog, EVENT_TYPES } = require('./event-log');

// ─── Aggregation ────────────────────────────────────────────────────────────
function aggregate(events) {
  const byAccount = {};

  for (const ev of events) {
    const acct = ev.account || 'unknown';
    if (!byAccount[acct]) {
      byAccount[acct] = {
        archetype:     acct,
        totalXp:       0,
        totalGp:       0,
        totalDrain:    0,
        totalPlayMs:   0,
        quests:        new Set(),
        unlocks:       0,
        highestLevel:  1,
        ticks:         0,
        dailyXp:       {},          // sim_day → total XP at end of day
        actionCounts:  Object.create(null),  // action_id → { count, drain, time_ms }
        gapEvents:     [],
        cap:           null,
        sessionEnds:   [],
        days:          0,
      };
    }
    const a = byAccount[acct];

    if (ev.type === EVENT_TYPES.BOOT) {
      if (ev.state_snapshot && ev.state_snapshot.cap !== undefined) a.cap = ev.state_snapshot.cap;
    } else if (ev.type === EVENT_TYPES.ACTION) {
      a.ticks += 1;
      a.totalDrain += ev.drain || 0;
      if (ev.output) {
        if (ev.output.xp) {
          for (const xp of Object.values(ev.output.xp)) a.totalXp += xp;
        }
        if (typeof ev.output.gp === 'number') a.totalGp += ev.output.gp;
      }
      const id = ev.action_id || 'unknown';
      if (!a.actionCounts[id]) a.actionCounts[id] = { count: 0, drain: 0, time_ms: 0 };
      a.actionCounts[id].count += 1;
      a.actionCounts[id].drain += ev.drain || 0;
      // time_ms is not stored per-event directly; infer from day_ms delta below
      if (ev.state_snapshot) {
        if (ev.state_snapshot.levels) {
          for (const lvl of Object.values(ev.state_snapshot.levels)) {
            if (lvl > a.highestLevel) a.highestLevel = lvl;
          }
        }
        if (ev.state_snapshot.day_ms !== undefined) {
          a.totalPlayMs = Math.max(a.totalPlayMs, (ev.sim_day || 0) * 8 * 3600 * 1000 + ev.state_snapshot.day_ms);
        }
      }
    } else if (ev.type === EVENT_TYPES.DAY_END) {
      const snap = ev.state_snapshot || {};
      if (snap.totalXp !== undefined) a.dailyXp[ev.sim_day] = snap.totalXp;
      if (snap.gp !== undefined) a.totalGp = Math.max(a.totalGp, snap.gp);
      if (snap.highestLevel !== undefined && snap.highestLevel > a.highestLevel) a.highestLevel = snap.highestLevel;
      if (Array.isArray(snap.quests)) for (const q of snap.quests) a.quests.add(q);
      if (snap.unlocks !== undefined) a.unlocks = Math.max(a.unlocks, snap.unlocks);
      a.days = Math.max(a.days, (ev.sim_day || 0) + 1);
    } else if (ev.type === EVENT_TYPES.GAP) {
      a.gapEvents.push(ev);
    } else if (ev.type === EVENT_TYPES.SESSION_END) {
      a.sessionEnds.push(ev.state_snapshot && ev.state_snapshot.reason);
    }
  }

  return byAccount;
}

// ─── Formatting helpers ────────────────────────────────────────────────────
function fmtInt(n)    { if (!Number.isFinite(n)) return '∞'; return Math.round(n).toLocaleString('en-US'); }
function fmtHrs(ms)   { return `~${Math.round(ms / (3600 * 1000))}hr`; }
function fmtCap(cap)  { return cap === null ? '—' : (!Number.isFinite(cap) ? '∞' : fmtInt(cap)); }
function fmtCapTotalAttention(cap, days) {
  if (cap === null) return '—';
  if (!Number.isFinite(cap)) return `∞ (${fmtInt(1000 * days)}k)`; // rough visual placeholder
  return fmtInt(cap * days);
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ─── Content gap detection ─────────────────────────────────────────────────
function detectContentGaps(agg) {
  const callouts = [];
  for (const [arch, a] of Object.entries(agg)) {
    // Repetition trap — any single action > 35% of total drain, over the run.
    if (a.totalDrain > 0) {
      for (const [actionId, { drain }] of Object.entries(a.actionCounts)) {
        const pct = drain / a.totalDrain;
        if (pct >= 0.35) {
          callouts.push({
            severity: 'warn',
            archetype: arch,
            text: `[${arch}] ${actionId} consumed ${Math.round(pct*100)}% of total drain — repetition trap.`,
          });
        }
      }
    }
    // Gap events after day 2
    for (const g of a.gapEvents) {
      if (g.sim_day >= 2) {
        callouts.push({
          severity: 'error',
          archetype: arch,
          text: `[${arch}] sim_day ${g.sim_day}: no feasible action (${g.state_snapshot && g.state_snapshot.reason || 'unknown'}).`,
        });
      }
    }
  }
  return callouts;
}

// ─── Ratio analysis ────────────────────────────────────────────────────────
function computeRatios(agg) {
  const unlimited = agg.unlimited;
  const ratios = [];
  if (!unlimited || unlimited.totalXp === 0) return ratios;

  const order = ['low', 'medium', 'high'];
  for (const arch of order) {
    if (!agg[arch]) continue;
    const r = agg[arch].totalXp / unlimited.totalXp;
    const [lo, hi] = (arch === 'low') ? [0.20, 0.40]
                   : (arch === 'high') ? [0.70, 0.90]
                   :                     [0.40, 0.70]; // medium target
    const ok = r >= lo && r <= hi;
    ratios.push({
      archetype: arch,
      ratio: r,
      target: `${lo} – ${hi}`,
      ok,
    });
  }
  return ratios;
}

// ─── Progression SVG chart (lines) ─────────────────────────────────────────
function renderProgressionSvg(agg) {
  const width = 720;
  const height = 320;
  const marginL = 60;
  const marginR = 30;
  const marginT = 30;
  const marginB = 50;
  const plotW = width - marginL - marginR;
  const plotH = height - marginT - marginB;

  // Find max day + max XP across all accounts.
  let maxDay = 0;
  let maxXp  = 0;
  for (const a of Object.values(agg)) {
    for (const [d, xp] of Object.entries(a.dailyXp)) {
      const di = parseInt(d, 10);
      if (di > maxDay) maxDay = di;
      if (xp > maxXp) maxXp = xp;
    }
  }
  if (maxDay === 0 || maxXp === 0) {
    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#F7EFD8"/><text x="${width/2}" y="${height/2}" text-anchor="middle" fill="#3A2E1F" font-family="Georgia, serif">No data</text></svg>`;
  }

  // Round maxXp up to a nice number
  const niceMax = Math.pow(10, Math.floor(Math.log10(maxXp)));
  const chartMaxXp = Math.ceil(maxXp / niceMax) * niceMax;

  const colour = {
    low:       '#8B5A2B',
    medium:    '#A0522D',
    high:      '#2F4F2F',
    unlimited: '#1C1C3B',
  };

  const xFor = day => marginL + (day / maxDay) * plotW;
  const yFor = xp  => marginT + plotH - (xp / chartMaxXp) * plotH;

  const lines = [];
  for (const [arch, a] of Object.entries(agg)) {
    const points = [];
    // Fill in all days, using running max (XP monotonically increases)
    let running = 0;
    for (let d = 0; d <= maxDay; d++) {
      if (a.dailyXp[d] !== undefined) running = Math.max(running, a.dailyXp[d]);
      points.push(`${xFor(d).toFixed(1)},${yFor(running).toFixed(1)}`);
    }
    lines.push(`<polyline fill="none" stroke="${colour[arch] || '#3A2E1F'}" stroke-width="2.5" stroke-linejoin="round" points="${points.join(' ')}"/>`);
  }

  // X axis ticks every 5 days
  const xTicks = [];
  for (let d = 0; d <= maxDay; d += 5) {
    const x = xFor(d);
    xTicks.push(`<line x1="${x.toFixed(1)}" y1="${(marginT + plotH).toFixed(1)}" x2="${x.toFixed(1)}" y2="${(marginT + plotH + 4).toFixed(1)}" stroke="#3A2E1F" stroke-width="1"/>`);
    xTicks.push(`<text x="${x.toFixed(1)}" y="${(marginT + plotH + 18).toFixed(1)}" text-anchor="middle" fill="#3A2E1F" font-family="Georgia, serif" font-size="11">d${d}</text>`);
  }

  // Y axis ticks — 5 divisions
  const yTicks = [];
  for (let i = 0; i <= 5; i++) {
    const xpVal = (chartMaxXp / 5) * i;
    const y = yFor(xpVal);
    yTicks.push(`<line x1="${(marginL - 4).toFixed(1)}" y1="${y.toFixed(1)}" x2="${marginL.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#3A2E1F" stroke-width="1"/>`);
    yTicks.push(`<text x="${(marginL - 8).toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="end" fill="#3A2E1F" font-family="Georgia, serif" font-size="11">${fmtInt(xpVal)}</text>`);
  }

  // Axis lines
  const axes = [
    `<line x1="${marginL}" y1="${marginT + plotH}" x2="${marginL + plotW}" y2="${marginT + plotH}" stroke="#3A2E1F" stroke-width="1.5"/>`,
    `<line x1="${marginL}" y1="${marginT}"         x2="${marginL}"          y2="${marginT + plotH}" stroke="#3A2E1F" stroke-width="1.5"/>`,
  ];

  // Legend
  const legendItems = Object.entries(agg).map(([arch, _a], i) => {
    const x = marginL + 8;
    const y = marginT + 14 + i * 18;
    return `<rect x="${x}" y="${y - 10}" width="12" height="12" fill="${colour[arch] || '#3A2E1F'}"/>`
         + `<text x="${x + 18}" y="${y}" fill="#3A2E1F" font-family="Georgia, serif" font-size="12">${arch}</text>`;
  }).join('\n');

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#F7EFD8"/>
    ${axes.join('\n')}
    ${xTicks.join('\n')}
    ${yTicks.join('\n')}
    ${lines.join('\n')}
    <text x="${marginL + plotW/2}" y="${height - 10}" text-anchor="middle" fill="#3A2E1F" font-family="Georgia, serif" font-size="12">simulated day</text>
    <text x="14" y="${marginT + plotH/2}" text-anchor="middle" fill="#3A2E1F" font-family="Georgia, serif" font-size="12" transform="rotate(-90 14 ${marginT + plotH/2})">total XP</text>
    ${legendItems}
  </svg>`;
}

// ─── Activity mix bars ─────────────────────────────────────────────────────
function renderMixBarsForAccount(a) {
  // Top 10 actions by drain
  const entries = Object.entries(a.actionCounts)
    .map(([id, v]) => ({ id, ...v }))
    .sort((x, y) => y.drain - x.drain)
    .slice(0, 10);

  const total = a.totalDrain || 1;

  const rows = entries.map(e => {
    const pct = (e.drain / total) * 100;
    const flag = pct >= 35 ? ' style="color:#8B0000;font-weight:bold"' : '';
    return `
      <div class="mix-row">
        <div class="mix-label"${flag}>${escapeHtml(e.id)} <span class="muted">(${e.count}×)</span></div>
        <div class="mix-track"><div class="mix-fill" style="width:${pct.toFixed(1)}%"></div></div>
        <div class="mix-pct"${flag}>${pct.toFixed(1)}%</div>
      </div>`;
  }).join('');

  return `<section class="mix-block">
    <h3>${escapeHtml(a.archetype)} — activity mix (top 10 by drain)</h3>
    ${rows || '<p class="muted">no actions logged</p>'}
  </section>`;
}

// ─── Headline stats table ──────────────────────────────────────────────────
function renderHeadlineTable(agg, days) {
  const order = ['low', 'medium', 'high', 'unlimited'];
  const cols = order.filter(a => agg[a]);

  const row = (label, fn) => `<tr>
    <th class="rowhead">${escapeHtml(label)}</th>
    ${cols.map(a => `<td>${fn(agg[a])}</td>`).join('')}
  </tr>`;

  return `<table class="headline">
    <thead>
      <tr><th></th>${cols.map(a => `<th>${escapeHtml(a)}</th>`).join('')}</tr>
    </thead>
    <tbody>
      ${row('Total attention',   a => fmtCapTotalAttention(a.cap, a.days || days))}
      ${row('Active playtime',   a => fmtHrs(a.totalPlayMs))}
      ${row('Total XP',          a => fmtInt(a.totalXp))}
      ${row('Total GP',          a => fmtInt(a.totalGp))}
      ${row('Quests completed',  a => a.quests.size)}
      ${row('Highest skill',     a => a.highestLevel)}
      ${row('Unlocks reached',   a => a.unlocks)}
      ${row('Unique actions',    a => Object.keys(a.actionCounts).length)}
      ${row('Gap events',        a => a.gapEvents.length)}
    </tbody>
  </table>`;
}

// ─── Top-level HTML ────────────────────────────────────────────────────────
function renderHtml(events) {
  const agg = aggregate(events);
  const days = Math.max(1, ...Object.values(agg).map(a => a.days || 0));

  const headline      = renderHeadlineTable(agg, days);
  const progression   = renderProgressionSvg(agg);
  const mix           = Object.values(agg).map(renderMixBarsForAccount).join('\n');
  const ratios        = computeRatios(agg);
  const gaps          = detectContentGaps(agg);

  const ratiosHtml = ratios.length === 0
    ? '<p class="muted">No unlimited baseline data available for ratio analysis.</p>'
    : `<ul class="ratios">${ratios.map(r => `<li>
        <strong>${escapeHtml(r.archetype)} / unlimited</strong> =
        ${r.ratio.toFixed(3)}
        <span class="muted">(target ${r.target})</span>
        ${r.ok ? '<span class="ok">ok</span>' : '<span class="bad">out of band</span>'}
      </li>`).join('')}</ul>`;

  const gapsHtml = gaps.length === 0
    ? '<p class="muted">No content gaps detected above threshold.</p>'
    : `<ul class="gaps">${gaps.map(g => `<li class="${escapeHtml(g.severity)}">${escapeHtml(g.text)}</li>`).join('')}</ul>`;

  const runSummary = `Accounts: ${Object.keys(agg).join(', ')} · Days simulated: ${days} · Total events: ${events.length}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>Scape — Balance Diagnostic</title>
<style>
  :root {
    --cream:  #F7EFD8;
    --umber:  #3A2E1F;
    --sienna: #8B5A2B;
    --rust:   #A0522D;
    --forest: #2F4F2F;
    --ink:    #1C1C3B;
    --ok:     #2F4F2F;
    --bad:    #8B0000;
  }
  html, body {
    margin: 0; padding: 0;
    background: var(--cream);
    color: var(--umber);
    font-family: Georgia, 'Palatino Linotype', 'Book Antiqua', Palatino, serif;
    font-size: 15px; line-height: 1.55;
  }
  main { max-width: 980px; margin: 0 auto; padding: 32px 28px 64px; }
  header { border-bottom: 2px solid var(--umber); padding-bottom: 12px; margin-bottom: 24px; }
  header h1 { margin: 0; font-size: 28px; letter-spacing: 0.5px; }
  header .sub { font-style: italic; opacity: 0.78; }
  h2 { border-bottom: 1px solid #C8BC9B; padding-bottom: 4px; margin-top: 32px; font-size: 20px; }
  h3 { margin-top: 20px; font-size: 16px; }
  table.headline {
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0 24px;
  }
  table.headline th, table.headline td {
    border: 1px solid #C8BC9B;
    padding: 6px 10px;
    text-align: right;
  }
  table.headline thead th { background: #EAE0C2; text-align: center; text-transform: capitalize; }
  table.headline th.rowhead { text-align: left; background: #EAE0C2; font-weight: normal; }
  .mix-block { margin-bottom: 20px; }
  .mix-row {
    display: grid;
    grid-template-columns: 220px 1fr 60px;
    gap: 8px;
    align-items: center;
    margin-bottom: 3px;
    font-size: 13px;
  }
  .mix-label { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .mix-track { height: 12px; background: #EAE0C2; border: 1px solid #C8BC9B; position: relative; }
  .mix-fill  { height: 100%; background: var(--sienna); }
  .mix-pct   { text-align: right; }
  .muted { color: #8A7A5C; font-style: italic; }
  ul.ratios, ul.gaps { list-style: square; padding-left: 24px; }
  ul.ratios li, ul.gaps li { margin-bottom: 4px; }
  .ok  { color: var(--ok);  font-weight: bold; margin-left: 8px; }
  .bad { color: var(--bad); font-weight: bold; margin-left: 8px; }
  li.error { color: var(--bad); }
  li.warn  { color: var(--sienna); }
  footer { border-top: 1px solid #C8BC9B; padding-top: 10px; margin-top: 32px; font-size: 12px; opacity: 0.7; }
</style>
</head>
<body>
<main>
  <header>
    <h1>Balance Diagnostic</h1>
    <div class="sub">Scape content-grid calibration probe — burn-v0.8</div>
    <div class="muted">${escapeHtml(runSummary)}</div>
  </header>

  <h2>Headline</h2>
  ${headline}

  <h2>Progression — XP per simulated day</h2>
  ${progression}

  <h2>Ratios</h2>
  ${ratiosHtml}

  <h2>Activity mix</h2>
  ${mix}

  <h2>Content-gap callouts</h2>
  ${gapsHtml}

  <footer>
    Generated ${new Date().toISOString()} · see <code>docs/balance-diagnostic.md</code> for methodology.
  </footer>
</main>
</body>
</html>`;
}

// ─── Public entrypoints ────────────────────────────────────────────────────
function renderHtmlFromLog(jsonlPath, htmlPath) {
  const events = EventLog.readFile(jsonlPath);
  const html = renderHtml(events);
  fs.mkdirSync(path.dirname(htmlPath), { recursive: true });
  fs.writeFileSync(htmlPath, html, 'utf8');
  return { events: events.length, htmlPath };
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('usage: node src/sim/render-html.js <input.jsonl> [output.html]');
    process.exit(1);
  }
  const inp = args[0];
  const outp = args[1] || inp.replace(/\.jsonl$/, '.html');
  const r = renderHtmlFromLog(inp, outp);
  console.log(`rendered ${r.events} events → ${r.htmlPath}`);
}

if (require.main === module) main();

module.exports = {
  renderHtmlFromLog,
  renderHtml,
  aggregate,
  detectContentGaps,
  computeRatios,
};
