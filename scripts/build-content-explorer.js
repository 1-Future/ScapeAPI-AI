// ══════════════════════════════════════════════════════════════════════════════
// scripts/build-content-explorer.js
//
// Builds a self-contained, browsable, sortable HTML content explorer for the
// Scape MMO project under reports/explorer/. Opens in any browser — no server.
//
// Inputs:
//   data/intensity-catalog.json
//   data/intensity-catalog-report.md        (misery-zone flags for activities)
//   data/methods/*.json                     (525 methods)
//   data/items/equipment.json
//   data/items/consumables.json
//   data/items/resources.json
//   data/items/quest-items.json
//   data/items/reagents.json
//   data/bestiary/*.json                    (120 monsters)
//   data/bosses.json                        (15 boss bibles)
//   data/progression-dag.json
//   data/drop-tables.json
//   data/npc-bibles.json
//   src/content/aelgard/*.js                (quest regex extraction)
//
// Outputs (clean each run):
//   reports/explorer/index.html
//   reports/explorer/activities.html
//   reports/explorer/methods.html
//   reports/explorer/items.html
//   reports/explorer/monsters.html
//   reports/explorer/quests.html
//   reports/explorer/dag.html
//   reports/explorer/drop_tables.html
//   reports/explorer/npcs.html
//
// Styling: OSRS-parchment (cream #F7EFD8, umber #3A2E1F, Georgia serif) — see
// src/sim/render-html.js for the reference palette.
//
// Usage:
//   node scripts/build-content-explorer.js
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(REPO_ROOT, 'data');
const OUT_DIR = path.join(REPO_ROOT, 'reports', 'explorer');
const DIAGNOSTIC_REL = 'reports/diagnostic-2026-04-22T15-41-16-794Z.html';

// ─── Utilities ──────────────────────────────────────────────────────────────

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function safeReadJson(p) {
  try { return readJson(p); }
  catch (e) { return { __error: e.message }; }
}

function ensureCleanDir(dir) {
  if (fs.existsSync(dir)) {
    for (const f of fs.readdirSync(dir)) {
      const fp = path.join(dir, f);
      const st = fs.statSync(fp);
      if (st.isFile()) fs.unlinkSync(fp);
    }
  } else {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function escapeHtml(s) {
  if (s === null || s === undefined) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function truncate(s, n) {
  if (s === null || s === undefined) return '';
  const str = String(s);
  if (str.length <= n) return str;
  return str.slice(0, n - 1) + '…';
}

function fmtInt(n) {
  if (n === null || n === undefined || n === '') return '—';
  const v = Number(n);
  if (!Number.isFinite(v)) return '—';
  return v.toLocaleString('en-US');
}

function cellOrDash(v) {
  if (v === null || v === undefined || v === '') return '—';
  if (Array.isArray(v) && v.length === 0) return '—';
  return v;
}

// ─── Shared CSS (OSRS parchment) ────────────────────────────────────────────

const SHARED_CSS = `
:root {
  --cream:  #F7EFD8;
  --umber:  #3A2E1F;
  --ink:    #2A1F10;
  --sienna: #8B5A2B;
  --rust:   #A0522D;
  --gold:   #DFD0A8;
  --shade:  #EAE0C2;
  --rule:   #C8BC9B;
  --muted:  #8A7A5C;
  --ok:     #2F4F2F;
  --bad:    #8B0000;
}
html, body {
  margin: 0; padding: 0;
  background: var(--cream);
  color: var(--umber);
  font-family: Georgia, 'Palatino Linotype', 'Book Antiqua', Palatino, serif;
  font-size: 14px; line-height: 1.5;
}
main { max-width: 1320px; margin: 0 auto; padding: 28px 24px 56px; }
header { border-bottom: 2px solid var(--umber); padding-bottom: 10px; margin-bottom: 20px; }
header h1 { margin: 0 0 4px 0; font-size: 26px; letter-spacing: 0.5px; }
header .sub { font-style: italic; opacity: 0.78; }
.nav { margin: 10px 0 0; font-size: 13px; }
.nav a { color: var(--sienna); text-decoration: none; margin-right: 12px; }
.nav a:hover { text-decoration: underline; color: var(--rust); }
.nav a.current { color: var(--ink); font-weight: bold; }
h2 { border-bottom: 1px solid var(--rule); padding-bottom: 4px; margin-top: 28px; font-size: 20px; }
.muted { color: var(--muted); font-style: italic; }

.toolbar {
  display: flex;
  gap: 10px;
  align-items: center;
  margin: 12px 0 10px;
  flex-wrap: wrap;
}
.toolbar input[type="text"] {
  flex: 1;
  min-width: 260px;
  padding: 8px 12px;
  border: 1px solid var(--rule);
  background: var(--cream);
  color: var(--umber);
  font-family: inherit;
  font-size: 14px;
}
.toolbar input[type="text"]:focus {
  outline: none;
  border-color: var(--sienna);
  box-shadow: 0 0 0 2px rgba(139, 90, 43, 0.18);
}
.toolbar .status { font-size: 13px; color: var(--muted); white-space: nowrap; }
.toolbar .pager { font-size: 13px; }
.toolbar button {
  padding: 6px 12px;
  background: var(--shade);
  border: 1px solid var(--rule);
  color: var(--ink);
  font-family: inherit;
  font-size: 13px;
  cursor: pointer;
}
.toolbar button:hover:not(:disabled) { background: var(--gold); }
.toolbar button:disabled { opacity: 0.35; cursor: default; }
.toolbar .pager span { margin: 0 6px; }

table.data {
  width: 100%;
  border-collapse: collapse;
  margin-top: 6px;
  font-size: 13px;
}
table.data th, table.data td {
  border: 1px solid var(--rule);
  padding: 5px 8px;
  text-align: left;
  vertical-align: top;
}
table.data thead th {
  background: var(--gold);
  color: var(--ink);
  font-weight: bold;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  position: sticky;
  top: 0;
}
table.data thead th .sort-ind { color: var(--sienna); font-size: 11px; margin-left: 4px; }
table.data tbody tr:nth-child(even) td { background: var(--shade); }
table.data tbody tr.misery td { background: #F2D8D0 !important; }
table.data td.num { text-align: right; font-variant-numeric: tabular-nums; }
table.data td.truncated { max-width: 320px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

table.summary {
  border-collapse: collapse;
  margin: 10px 0 16px;
  font-size: 14px;
}
table.summary th, table.summary td {
  border: 1px solid var(--rule);
  padding: 6px 12px;
  text-align: left;
}
table.summary thead th { background: var(--gold); color: var(--ink); }
table.summary td.num { text-align: right; font-variant-numeric: tabular-nums; }
table.summary a { color: var(--sienna); text-decoration: none; }
table.summary a:hover { text-decoration: underline; }

footer { border-top: 1px solid var(--rule); padding-top: 10px; margin-top: 28px; font-size: 12px; opacity: 0.72; }
code { font-family: Consolas, 'Courier New', monospace; background: var(--shade); padding: 1px 4px; border-radius: 2px; font-size: 12px; }
`;

// ─── Shared JS (sortable + paginated + filter) ──────────────────────────────
// Uses an inline JSON blob (<script id="rows" type="application/json">) plus
// a column schema (<script id="cols" type="application/json">). Stable sort
// via index-tracking. Filter is case-insensitive across all columns.

const SHARED_JS = `
(function () {
  var rowsEl = document.getElementById('rows');
  var colsEl = document.getElementById('cols');
  if (!rowsEl || !colsEl) return;

  var DATA = JSON.parse(rowsEl.textContent);
  var COLS = JSON.parse(colsEl.textContent);
  var PAGE_SIZE = parseInt(document.body.getAttribute('data-page-size') || '100', 10);

  // attach original index for stable sort
  var ROWS = DATA.map(function (r, i) { r.__i = i; return r; });
  var view = ROWS.slice();

  var sortCol = null;
  var sortDir = 0;           // 1 = asc, -1 = desc
  var page = 0;
  var filterText = '';

  var tbody = document.getElementById('tbody');
  var thead = document.getElementById('thead');
  var filterInput = document.getElementById('filter');
  var statusEl = document.getElementById('status');
  var pagerEl = document.getElementById('pager');

  // Build header
  var thtr = document.createElement('tr');
  COLS.forEach(function (c, idx) {
    var th = document.createElement('th');
    th.textContent = c.label;
    if (c.num) th.className = 'num';
    var ind = document.createElement('span');
    ind.className = 'sort-ind';
    ind.textContent = '';
    th.appendChild(ind);
    th.addEventListener('click', function () { onSort(idx); });
    thtr.appendChild(th);
  });
  thead.appendChild(thtr);

  function normalize(v) {
    if (v === null || v === undefined || v === '') return null;
    return v;
  }

  function onSort(idx) {
    if (sortCol === idx) {
      sortDir = sortDir === 1 ? -1 : 1;
    } else {
      sortCol = idx;
      sortDir = 1;
    }
    var c = COLS[idx];
    var key = c.key;
    var isNum = !!c.num;
    view = ROWS.slice();
    view.sort(function (a, b) {
      var av = normalize(a[key]);
      var bv = normalize(b[key]);
      // nulls/empties sort last
      if (av === null && bv === null) return a.__i - b.__i;
      if (av === null) return 1;
      if (bv === null) return -1;
      var cmp;
      if (isNum) {
        var an = Number(av), bn = Number(bv);
        if (Number.isNaN(an) && Number.isNaN(bn)) cmp = 0;
        else if (Number.isNaN(an)) cmp = 1;
        else if (Number.isNaN(bn)) cmp = -1;
        else cmp = an - bn;
      } else {
        cmp = String(av).toLowerCase().localeCompare(String(bv).toLowerCase());
      }
      if (cmp === 0) return a.__i - b.__i;   // stable
      return cmp * sortDir;
    });
    applyFilter(false);
    updateIndicators();
    page = 0;
    render();
  }

  function updateIndicators() {
    var ths = thead.querySelectorAll('th .sort-ind');
    ths.forEach(function (span, i) {
      if (i === sortCol) span.textContent = sortDir === 1 ? ' ▲' : ' ▼';
      else span.textContent = '';
    });
  }

  var filteredView = view;
  function applyFilter(resetPage) {
    var q = (filterText || '').toLowerCase().trim();
    if (!q) {
      filteredView = view;
    } else {
      filteredView = view.filter(function (r) {
        for (var i = 0; i < COLS.length; i++) {
          var v = r[COLS[i].key];
          if (v === null || v === undefined) continue;
          if (String(v).toLowerCase().indexOf(q) !== -1) return true;
        }
        return false;
      });
    }
    if (resetPage) page = 0;
  }

  function render() {
    var total = filteredView.length;
    var totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (page >= totalPages) page = totalPages - 1;
    var start = page * PAGE_SIZE;
    var end = Math.min(start + PAGE_SIZE, total);
    var slice = filteredView.slice(start, end);

    // Build rows with innerHTML (fast)
    var html = '';
    for (var i = 0; i < slice.length; i++) {
      var r = slice[i];
      var rowClass = r.__misery ? 'misery' : '';
      html += '<tr' + (rowClass ? ' class="' + rowClass + '"' : '') + '>';
      for (var c = 0; c < COLS.length; c++) {
        var col = COLS[c];
        var v = r[col.key];
        if (v === null || v === undefined || v === '') v = '—';
        var cls = col.num ? ' class="num"' : (col.truncate ? ' class="truncated" title="' + escapeAttr(v) + '"' : '');
        html += '<td' + cls + '>' + escapeCell(v) + '</td>';
      }
      html += '</tr>';
    }
    tbody.innerHTML = html;

    statusEl.textContent = total.toLocaleString() + ' rows' + (filterText ? ' (filtered from ' + ROWS.length.toLocaleString() + ')' : '');
    if (total > PAGE_SIZE) {
      pagerEl.style.display = '';
      pagerEl.innerHTML = '';
      var prev = document.createElement('button');
      prev.textContent = '« Prev';
      prev.disabled = page === 0;
      prev.addEventListener('click', function () { if (page > 0) { page--; render(); } });
      var info = document.createElement('span');
      info.textContent = 'Page ' + (page + 1) + ' of ' + totalPages;
      var next = document.createElement('button');
      next.textContent = 'Next »';
      next.disabled = page >= totalPages - 1;
      next.addEventListener('click', function () { if (page < totalPages - 1) { page++; render(); } });
      pagerEl.appendChild(prev);
      pagerEl.appendChild(info);
      pagerEl.appendChild(next);
    } else {
      pagerEl.style.display = 'none';
      pagerEl.innerHTML = '';
    }
  }

  function escapeCell(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
  function escapeAttr(s) {
    return escapeCell(s).replace(/"/g, '&quot;');
  }

  if (filterInput) {
    var debounce = null;
    filterInput.addEventListener('input', function () {
      clearTimeout(debounce);
      var val = filterInput.value;
      debounce = setTimeout(function () {
        filterText = val;
        applyFilter(true);
        render();
      }, 90);
    });
  }

  render();
})();
`;

// ─── Page template ──────────────────────────────────────────────────────────

function navHtml(current) {
  const links = [
    ['index.html', 'Index'],
    ['activities.html', 'Activities'],
    ['methods.html', 'Methods'],
    ['items.html', 'Items'],
    ['monsters.html', 'Monsters'],
    ['quests.html', 'Quests'],
    ['dag.html', 'DAG'],
    ['drop_tables.html', 'Drop Tables'],
    ['npcs.html', 'NPCs'],
  ];
  return links.map(([href, label]) => {
    const cls = href === current ? ' class="current"' : '';
    return `<a href="${href}"${cls}>${label}</a>`;
  }).join('');
}

function renderTablePage(opts) {
  // opts: { title, subtitle, current, cols, rows, pageSize }
  const { title, subtitle, current, cols, rows } = opts;
  const pageSize = opts.pageSize || 100;
  const rowsJson = JSON.stringify(rows);
  const colsJson = JSON.stringify(cols);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>${escapeHtml(title)} — Scape Content Explorer</title>
<style>${SHARED_CSS}</style>
</head>
<body data-page-size="${pageSize}">
<main>
  <header>
    <h1>${escapeHtml(title)}</h1>
    <div class="sub">${escapeHtml(subtitle || '')}</div>
    <div class="nav">${navHtml(current)}</div>
  </header>

  <div class="toolbar">
    <input id="filter" type="text" placeholder="Filter rows (case-insensitive, matches any column)…" autocomplete="off"/>
    <div class="status" id="status"></div>
    <div class="pager" id="pager"></div>
  </div>

  <table class="data">
    <thead id="thead"></thead>
    <tbody id="tbody"></tbody>
  </table>

  <footer>
    Data slice from <code>${escapeHtml(new Date().toISOString())}</code>.
    Click a column header to sort. Click again to reverse. Hold the filter box for live narrowing.
  </footer>
</main>
<script id="rows" type="application/json">${rowsJson.replace(/</g, '\\u003c')}</script>
<script id="cols" type="application/json">${colsJson.replace(/</g, '\\u003c')}</script>
<script>${SHARED_JS}</script>
</body>
</html>`;
}

// ─── Misery-zone extraction (from intensity-catalog-report.md) ──────────────

function loadMiserySet(reportPath) {
  // Parse the "Top 20 worst offenders" table plus any other misery rows we can
  // scrape. The report lists activities by activity_id in column 1 of markdown
  // pipe-tables under "## Misery zones". We capture IDs that look like
  // activity_id strings (matches catalog keys).
  const set = new Set();
  let text;
  try { text = fs.readFileSync(reportPath, 'utf8'); }
  catch (_) { return set; }
  const lines = text.split(/\r?\n/);
  let inMisery = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith('## ')) inMisery = /misery zone/i.test(line);
    if (!inMisery) continue;
    if (!line.startsWith('|')) continue;
    // skip header + divider rows
    if (/^\|\s*Activity\s*\|/i.test(line)) continue;
    if (/^\|\s*-/.test(line)) continue;
    const cells = line.split('|').map(c => c.trim()).filter((_, i, a) => i !== 0 && i !== a.length - 1);
    if (!cells.length) continue;
    const id = cells[0];
    if (id && /^[a-z0-9_]+$/i.test(id.replace(/`/g, ''))) {
      set.add(id.replace(/`/g, ''));
    }
  }
  return set;
}

// ─── Activities page ────────────────────────────────────────────────────────

function buildActivities(miserySet) {
  const catalog = readJson(path.join(DATA_DIR, 'intensity-catalog.json'));
  const rows = [];
  let missingRegion = 0;
  for (const a of (catalog.activities || [])) {
    const region = a.region || '';
    if (!region || region === 'unknown') missingRegion++;
    rows.push({
      id: a.activity_id || '',
      activity_type: a.activity_type || '',
      skill: a.skill || '',
      intensity: a.intensity ?? '',
      base_xp_per_hour: a.base_xp_per_hour ?? '',
      base_gp_per_hour: a.base_gp_per_hour ?? '',
      level_required: a.level_required ?? '',
      region: region,
      source_file: a.source_file || '',
      __misery: miserySet.has(a.activity_id) ? 1 : 0,
    });
  }
  const cols = [
    { key: 'id', label: 'id' },
    { key: 'activity_type', label: 'activity_type' },
    { key: 'skill', label: 'skill' },
    { key: 'intensity', label: 'intensity', num: true },
    { key: 'base_xp_per_hour', label: 'base_xp_per_hour', num: true },
    { key: 'base_gp_per_hour', label: 'base_gp_per_hour', num: true },
    { key: 'level_required', label: 'level_required', num: true },
    { key: 'region', label: 'region' },
    { key: 'source_file', label: 'source_file', truncate: true },
  ];
  return {
    html: renderTablePage({
      title: 'Activities',
      subtitle: `${rows.length.toLocaleString()} activities indexed in intensity-catalog.json. ${miserySet.size} flagged as misery-zone (highlighted).`,
      current: 'activities.html',
      cols,
      rows,
    }),
    count: rows.length,
    issues: missingRegion > 0 ? [`${missingRegion} activities have no region / region="unknown"`] : [],
  };
}

// ─── Methods page ───────────────────────────────────────────────────────────

function buildMethods(miserySet) {
  const dir = path.join(DATA_DIR, 'methods');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();
  const rows = [];
  const issues = [];
  for (const f of files) {
    let j;
    try { j = readJson(path.join(dir, f)); }
    catch (e) { issues.push(`methods/${f}: parse error (${e.message})`); continue; }
    if (!Array.isArray(j.methods)) { issues.push(`methods/${f}: missing methods[] array`); continue; }
    for (const m of j.methods) {
      const region = (m.location && m.location.region) || '';
      const spot = (m.location && m.location.spot) || '';
      rows.push({
        skill: m.skill || j.skill || '',
        name: m.name || '',
        id: m.id || '',
        level_required: m.level_required ?? '',
        intensity: m.intensity ?? '',
        xp_per_hour: m.xp_per_hour ?? '',
        gp_per_hour: m.gp_per_hour ?? '',
        region,
        location_spot: spot,
        __misery: miserySet.has(m.id) ? 1 : 0,
      });
    }
  }
  const cols = [
    { key: 'skill', label: 'skill' },
    { key: 'name', label: 'name' },
    { key: 'id', label: 'id', truncate: true },
    { key: 'level_required', label: 'level_required', num: true },
    { key: 'intensity', label: 'intensity', num: true },
    { key: 'xp_per_hour', label: 'xp_per_hour', num: true },
    { key: 'gp_per_hour', label: 'gp_per_hour', num: true },
    { key: 'region', label: 'region' },
    { key: 'location_spot', label: 'location_spot', truncate: true },
  ];
  return {
    html: renderTablePage({
      title: 'Methods',
      subtitle: `${rows.length.toLocaleString()} methods aggregated from data/methods/*.json. Highlighted rows are misery-zone by id.`,
      current: 'methods.html',
      cols,
      rows,
    }),
    count: rows.length,
    issues,
  };
}

// ─── Items page ─────────────────────────────────────────────────────────────

function summarizeStats(stats) {
  if (!stats || typeof stats !== 'object') return '';
  const parts = [];
  for (const [k, v] of Object.entries(stats)) {
    if (v === 0 || v === null || v === undefined) continue;
    parts.push(`${k}:${v}`);
  }
  return parts.join(', ');
}

function buildItems() {
  const base = path.join(DATA_DIR, 'items');
  const specs = [
    { file: 'equipment.json',   category: 'equipment',   shape: 'array' },
    { file: 'consumables.json', category: 'consumable',  shape: 'array' },
    { file: 'resources.json',   category: 'resource',    shape: 'array' },
    { file: 'quest-items.json', category: 'quest_item',  shape: 'array' },
    { file: 'reagents.json',    category: 'reagent',     shape: 'reagents' },
  ];
  const rows = [];
  const issues = [];
  for (const spec of specs) {
    const p = path.join(base, spec.file);
    let arr;
    try {
      const j = readJson(p);
      if (spec.shape === 'array') {
        if (!Array.isArray(j)) { issues.push(`items/${spec.file}: expected top-level array`); continue; }
        arr = j;
      } else {
        if (!Array.isArray(j.reagents)) { issues.push(`items/${spec.file}: expected .reagents array`); continue; }
        arr = j.reagents;
      }
    } catch (e) { issues.push(`items/${spec.file}: parse error (${e.message})`); continue; }

    for (const it of arr) {
      if (!it || !it.id) issues.push(`items/${spec.file}: entry without id (${(it && it.name) || '?'})`);
      const tierSlot = it.slot
        ? `${it.slot}${it.tier_name ? ` / ${it.tier_name}` : ''}${typeof it.tier === 'number' ? ` (tier ${it.tier})` : ''}`
        : (it.category || spec.category);
      const stats = summarizeStats(it.stats);
      rows.push({
        id: it.id || '',
        category: spec.category,
        name: it.name || '',
        tier_slot: tierSlot,
        stats_summary: stats,
        value: it.value ?? '',
        tradeable: typeof it.tradeable === 'boolean' ? (it.tradeable ? 'yes' : 'no') : '',
        stackable: typeof it.stackable === 'boolean' ? (it.stackable ? 'yes' : 'no') : '',
        weight: it.weight ?? '',
        examine: it.examine || it.flavor || '',
      });
    }
  }
  const cols = [
    { key: 'id', label: 'id', truncate: true },
    { key: 'category', label: 'category' },
    { key: 'name', label: 'name' },
    { key: 'tier_slot', label: 'tier / slot' },
    { key: 'stats_summary', label: 'stats summary', truncate: true },
    { key: 'value', label: 'value', num: true },
    { key: 'tradeable', label: 'tradeable' },
    { key: 'stackable', label: 'stackable' },
    { key: 'weight', label: 'weight', num: true },
    { key: 'examine', label: 'examine', truncate: true },
  ];
  return {
    html: renderTablePage({
      title: 'Items',
      subtitle: `${rows.length.toLocaleString()} items across equipment, consumables, resources, quest-items, reagents.`,
      current: 'items.html',
      cols,
      rows,
    }),
    count: rows.length,
    issues,
  };
}

// ─── Monsters page (bestiary + bosses) ──────────────────────────────────────

function buildMonsters() {
  const rows = [];
  const issues = [];
  // Bestiary (120)
  const bestiaryDir = path.join(DATA_DIR, 'bestiary');
  const files = fs.readdirSync(bestiaryDir).filter(f => f.endsWith('.json')).sort();
  for (const f of files) {
    let j;
    try { j = readJson(path.join(bestiaryDir, f)); }
    catch (e) { issues.push(`bestiary/${f}: parse error (${e.message})`); continue; }
    if (!Array.isArray(j.monsters)) { issues.push(`bestiary/${f}: missing monsters[]`); continue; }
    for (const m of j.monsters) {
      rows.push({
        id: m.id || '',
        kind: 'monster',
        name: m.name || '',
        region: m.region || j._region || '',
        combat_level: m.combat_level ?? '',
        hp: m.hp ?? '',
        max_hit: m.max_hit ?? '',
        attack_style: m.attack_style || '',
        weakness: m.weakness || '',
        slayer_level_required: m.slayer_level_required ?? '',
        drop_table_id: m.drop_table_id || '',
      });
    }
  }
  // Bosses (15)
  let bosses;
  try { bosses = readJson(path.join(DATA_DIR, 'bosses.json')); }
  catch (e) { issues.push(`bosses.json: parse error (${e.message})`); bosses = null; }
  if (bosses && Array.isArray(bosses.bosses)) {
    for (const b of bosses.bosses) {
      rows.push({
        id: b.id || '',
        kind: 'boss',
        name: b.name || '',
        region: b.region || '',
        combat_level: b.combat_level ?? '',
        hp: b.hp ?? '',
        max_hit: b.max_hit ?? '',
        attack_style: (Array.isArray(b.tags) ? b.tags.join('/') : (b.attack_style || '')),
        weakness: b.weakness || '',
        slayer_level_required: b.slayer_level_required ?? '',
        drop_table_id: b.drop_table_id || '',
      });
    }
  }
  const cols = [
    { key: 'id', label: 'id', truncate: true },
    { key: 'kind', label: 'kind' },
    { key: 'name', label: 'name' },
    { key: 'region', label: 'region' },
    { key: 'combat_level', label: 'combat_level', num: true },
    { key: 'hp', label: 'hp', num: true },
    { key: 'max_hit', label: 'max_hit', num: true },
    { key: 'attack_style', label: 'attack_style' },
    { key: 'weakness', label: 'weakness' },
    { key: 'slayer_level_required', label: 'slayer_lvl', num: true },
    { key: 'drop_table_id', label: 'drop_table_id', truncate: true },
  ];
  return {
    html: renderTablePage({
      title: 'Monsters',
      subtitle: `${rows.length.toLocaleString()} entries — ${rows.filter(r => r.kind === 'monster').length} bestiary bibles + ${rows.filter(r => r.kind === 'boss').length} boss bibles.`,
      current: 'monsters.html',
      cols,
      rows,
    }),
    count: rows.length,
    issues,
  };
}

// ─── Quests page (regex scan of src/content/aelgard/*.js) ───────────────────

function scanQuests() {
  const dir = path.join(REPO_ROOT, 'src', 'content', 'aelgard');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort();
  const rows = [];
  const issues = [];
  // Primary regex — matches up to 20 KB of body per quest then searches for key
  // fields by simpler named regex. Region is inferred from filename/comments.
  const defineRe = /quests\.define\s*\(\s*['"]([a-z0-9_]+)['"]\s*,\s*\{([\s\S]*?)\n\}\s*\)/g;
  const seen = new Set();
  for (const f of files) {
    const full = path.join(dir, f);
    let text;
    try { text = fs.readFileSync(full, 'utf8'); }
    catch (e) { issues.push(`${f}: read error`); continue; }

    // Region hint from filename (heartlands.js, inkweald.js, etc.)
    const base = f.replace(/\.js$/, '');
    const regionHint = {
      heartlands: 'heartlands', sootworks: 'sootworks', moryskah: 'moryskah',
      boneyard: 'boneyard', 'boneyard-wastes': 'boneyard', glass_desert: 'glass_desert',
      'glass-desert': 'glass_desert', saltbrine: 'saltbrine', veilwood: 'veilwood',
      inkweald: 'inkweald', wilds: 'wilds',
    }[base] || '';

    let m;
    while ((m = defineRe.exec(text)) !== null) {
      const id = m[1];
      const body = m[2];
      if (seen.has(id)) { issues.push(`duplicate quest id: ${id} (in ${f})`); continue; }
      seen.add(id);

      const name = matchField(body, /name\s*:\s*['"`]([\s\S]*?)['"`]/);
      const description = matchField(body, /description\s*:\s*['"`]([\s\S]*?)['"`]/);
      const difficulty = matchField(body, /difficulty\s*:\s*['"`]([^'"`]*)['"`]/);
      const qp = matchField(body, /questPoints\s*:\s*(\d+)/);

      // requirements block — try to capture contents between balanced braces
      const reqIdx = body.search(/requirements\s*:\s*\{/);
      let skillReqs = '';
      let questPrereqs = '';
      if (reqIdx !== -1) {
        const sliceStart = body.indexOf('{', reqIdx);
        const reqBody = takeBalancedBlock(body, sliceStart);
        if (reqBody) {
          const sk = matchField(reqBody, /skills\s*:\s*\{([^}]*)\}/);
          if (sk) {
            skillReqs = sk.replace(/\s+/g, ' ')
              .replace(/,\s*$/, '')
              .split(',').map(s => s.trim()).filter(Boolean).join(', ');
          }
          const qu = matchField(reqBody, /quests\s*:\s*\[([^\]]*)\]/);
          if (qu) {
            questPrereqs = qu.replace(/['"`]/g, '').replace(/\s+/g, ' ').trim();
          }
        }
      }

      // Region: try body, then fall back to filename hint
      const regionFromBody = matchField(body, /region\s*:\s*['"`]([a-z_]+)['"`]/);
      const region = regionFromBody || regionHint;

      // Length estimate: count step entries in steps: [...]
      let length = '';
      const stepsIdx = body.indexOf('steps');
      if (stepsIdx !== -1) {
        const open = body.indexOf('[', stepsIdx);
        if (open !== -1) {
          const steps = takeBalancedArray(body, open);
          if (steps) {
            // count top-level { occurrences
            let depth = 0, count = 0;
            for (let i = 0; i < steps.length; i++) {
              const ch = steps[i];
              if (ch === '{') { if (depth === 0) count++; depth++; }
              else if (ch === '}') depth--;
            }
            length = count || '';
          }
        }
      }

      rows.push({
        id,
        name: name || id,
        difficulty: difficulty || '',
        qp: qp ? Number(qp) : '',
        skill_reqs: skillReqs,
        quest_prereqs: questPrereqs,
        region,
        length_steps: length,
        description: truncate(description || '', 140),
        source_file: `src/content/aelgard/${f}`,
      });
    }
  }
  return { rows, issues };
}

function matchField(body, re) {
  const m = body.match(re);
  return m ? m[1] : '';
}

function takeBalancedBlock(body, openIdx) {
  if (openIdx < 0 || body[openIdx] !== '{') return '';
  let depth = 0;
  for (let i = openIdx; i < body.length; i++) {
    const ch = body[i];
    if (ch === '{') depth++;
    else if (ch === '}') { depth--; if (depth === 0) return body.slice(openIdx + 1, i); }
  }
  return '';
}

function takeBalancedArray(body, openIdx) {
  if (openIdx < 0 || body[openIdx] !== '[') return '';
  let depth = 0;
  for (let i = openIdx; i < body.length; i++) {
    const ch = body[i];
    if (ch === '[') depth++;
    else if (ch === ']') { depth--; if (depth === 0) return body.slice(openIdx + 1, i); }
  }
  return '';
}

function buildQuests() {
  const { rows, issues } = scanQuests();
  const cols = [
    { key: 'id', label: 'id', truncate: true },
    { key: 'name', label: 'name' },
    { key: 'difficulty', label: 'difficulty' },
    { key: 'qp', label: 'QP', num: true },
    { key: 'skill_reqs', label: 'skill_reqs', truncate: true },
    { key: 'quest_prereqs', label: 'quest_prereqs', truncate: true },
    { key: 'region', label: 'region' },
    { key: 'length_steps', label: 'steps', num: true },
    { key: 'description', label: 'description', truncate: true },
    { key: 'source_file', label: 'source_file', truncate: true },
  ];
  return {
    html: renderTablePage({
      title: 'Quests',
      subtitle: `${rows.length.toLocaleString()} quest definitions scanned from src/content/aelgard/*.js via quests.define() regex.`,
      current: 'quests.html',
      cols,
      rows,
    }),
    count: rows.length,
    issues,
  };
}

// ─── DAG page ───────────────────────────────────────────────────────────────

function buildDag() {
  const dag = readJson(path.join(DATA_DIR, 'progression-dag.json'));
  const nodes = dag.nodes || [];
  const downstream = Object.create(null);
  for (const n of nodes) {
    if (Array.isArray(n.requires)) {
      for (const r of n.requires) {
        downstream[r] = (downstream[r] || 0) + 1;
      }
    }
  }
  const rows = [];
  const issues = [];
  let missingType = 0;
  for (const n of nodes) {
    if (!n.id) { issues.push('DAG node without id'); continue; }
    if (!n.type) missingType++;
    rows.push({
      id: n.id,
      type: n.type || '',
      name: n.name || '',
      region: n.region || '',
      tier: n.tier || '',
      prereq_count: Array.isArray(n.requires) ? n.requires.length : 0,
      downstream_count: downstream[n.id] || 0,
    });
  }
  if (missingType > 0) issues.push(`${missingType} DAG nodes missing type`);
  const cols = [
    { key: 'id', label: 'id', truncate: true },
    { key: 'type', label: 'type' },
    { key: 'name', label: 'name' },
    { key: 'region', label: 'region' },
    { key: 'tier', label: 'tier' },
    { key: 'prereq_count', label: 'prereq_count', num: true },
    { key: 'downstream_count', label: 'downstream_count', num: true },
  ];
  return {
    html: renderTablePage({
      title: 'Progression DAG',
      subtitle: `${rows.length.toLocaleString()} nodes — sort by downstream_count DESC to see the Marstead breakpoints.`,
      current: 'dag.html',
      cols,
      rows,
    }),
    count: rows.length,
    issues,
  };
}

// ─── Drop tables page ───────────────────────────────────────────────────────

function buildDropTables() {
  const dt = readJson(path.join(DATA_DIR, 'drop-tables.json'));
  const tables = dt.tables || {};
  const rows = [];
  const issues = [];
  for (const key of Object.keys(tables)) {
    const t = tables[key];
    if (!t || !t.id) { issues.push(`drop-tables: entry ${key} missing id`); continue; }
    rows.push({
      id: t.id,
      monster_id: t.monster_id || '',
      always_count: (t.always || []).length,
      common_count: (t.common || []).length,
      uncommon_count: (t.uncommon || []).length,
      rare_count: (t.rare || []).length,
      very_rare_count: (t.very_rare || []).length,
      collection_log_count: (t.collection_log_unique || []).length,
      reagent_pair_count: (t.reagent_pairs || []).length,
    });
  }
  const cols = [
    { key: 'id', label: 'id' },
    { key: 'monster_id', label: 'monster_id' },
    { key: 'always_count', label: 'always', num: true },
    { key: 'common_count', label: 'common', num: true },
    { key: 'uncommon_count', label: 'uncommon', num: true },
    { key: 'rare_count', label: 'rare', num: true },
    { key: 'very_rare_count', label: 'very_rare', num: true },
    { key: 'collection_log_count', label: 'clog', num: true },
    { key: 'reagent_pair_count', label: 'reagent_pairs', num: true },
  ];
  return {
    html: renderTablePage({
      title: 'Drop Tables',
      subtitle: `${rows.length.toLocaleString()} drop tables from data/drop-tables.json (design bible; runtime tables live in src/atoms).`,
      current: 'drop_tables.html',
      cols,
      rows,
    }),
    count: rows.length,
    issues,
  };
}

// ─── NPCs page ──────────────────────────────────────────────────────────────

function buildNpcs() {
  const j = readJson(path.join(DATA_DIR, 'npc-bibles.json'));
  const npcs = j.npcs || [];
  const rows = [];
  const issues = [];
  for (const n of npcs) {
    if (!n || !n.id) { issues.push(`npc-bibles: entry without id (${(n && n.name) || '?'})`); continue; }
    const voice = (n.voice && (n.voice.cadence || n.voice.vocabulary)) || '';
    rows.push({
      id: n.id,
      name: n.name || '',
      title: n.title_shown_to_players || '',
      region: n.region || '',
      location: n.location || '',
      role: n.role || '',
      archetype: n.archetype || '',
      voice_summary: truncate(voice, 80),
    });
  }
  const cols = [
    { key: 'id', label: 'id' },
    { key: 'name', label: 'name' },
    { key: 'title', label: 'title' },
    { key: 'region', label: 'region' },
    { key: 'location', label: 'location', truncate: true },
    { key: 'role', label: 'role', truncate: true },
    { key: 'archetype', label: 'archetype', truncate: true },
    { key: 'voice_summary', label: 'voice_summary', truncate: true },
  ];
  return {
    html: renderTablePage({
      title: 'NPCs',
      subtitle: `${rows.length.toLocaleString()} deep-bible NPCs for narrator + codex feeds.`,
      current: 'npcs.html',
      cols,
      rows,
    }),
    count: rows.length,
    issues,
  };
}

// ─── Index page ─────────────────────────────────────────────────────────────

function renderIndex(counts, issues, generatedAt) {
  const rows = [
    ['activities.html',  'Activities',   counts.activities,  'Every unlockable action across skilling, monsters, bosses, minigames.'],
    ['methods.html',     'Methods',      counts.methods,     'Per-skill curated training methods (agent 1).'],
    ['items.html',       'Items',        counts.items,       'Equipment, consumables, resources, quest items, reagents.'],
    ['monsters.html',    'Monsters',     counts.monsters,    'Bestiary bibles plus boss design bibles.'],
    ['quests.html',      'Quests',       counts.quests,      'Parsed from quests.define() via regex.'],
    ['dag.html',         'Progression DAG', counts.dag,      'Nodes + requires graph. Sort by downstream_count DESC for breakpoints.'],
    ['drop_tables.html', 'Drop Tables',  counts.drop_tables, 'Design-bible drop tables (philosophy + reagent pairs).'],
    ['npcs.html',        'NPCs',         counts.npcs,        'Deep-bible personas fed to the narrator and codex.'],
  ];
  const issueList = [];
  for (const [section, list] of Object.entries(issues)) {
    for (const msg of list) issueList.push(`<li><strong>${escapeHtml(section)}:</strong> ${escapeHtml(msg)}</li>`);
  }
  const issuesHtml = issueList.length
    ? `<ul>${issueList.join('\n')}</ul>`
    : '<p class="muted">No irregularities detected during this scan.</p>';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>Scape Content Explorer</title>
<style>${SHARED_CSS}</style>
</head>
<body>
<main>
  <header>
    <h1>Scape Content Explorer</h1>
    <div class="sub">Browsable snapshot of every v0.8 content table — sortable, filterable, self-contained.</div>
    <div class="nav">${navHtml('index.html')}</div>
  </header>

  <h2>Counts</h2>
  <table class="summary">
    <thead>
      <tr><th>Page</th><th>Rows</th><th>Description</th></tr>
    </thead>
    <tbody>
      ${rows.map(r => `<tr><td><a href="${r[0]}">${escapeHtml(r[1])}</a></td><td class="num">${fmtInt(r[2])}</td><td>${escapeHtml(r[3])}</td></tr>`).join('\n')}
    </tbody>
  </table>

  <h2>Also see</h2>
  <p>Latest balance diagnostic: <a href="../${escapeHtml(path.basename(DIAGNOSTIC_REL))}">${escapeHtml(path.basename(DIAGNOSTIC_REL))}</a>
     — full balance diagnostic rendered by <code>src/sim/render-html.js</code>.</p>

  <h2>Irregularities discovered during scan</h2>
  ${issuesHtml}

  <footer>
    Generated <code>${escapeHtml(generatedAt)}</code> by <code>scripts/build-content-explorer.js</code>. No external dependencies — every page loads from inline JSON.
  </footer>
</main>
</body>
</html>`;
}

// ─── Main ───────────────────────────────────────────────────────────────────

function main() {
  const generatedAt = new Date().toISOString();
  console.log(`[explorer] generating at ${generatedAt}`);
  ensureCleanDir(OUT_DIR);

  const miserySet = loadMiserySet(path.join(DATA_DIR, 'intensity-catalog-report.md'));
  console.log(`[explorer] misery-zone ids loaded: ${miserySet.size}`);

  const pages = {
    activities:   buildActivities(miserySet),
    methods:      buildMethods(miserySet),
    items:        buildItems(),
    monsters:     buildMonsters(),
    quests:       buildQuests(),
    dag:          buildDag(),
    drop_tables:  buildDropTables(),
    npcs:         buildNpcs(),
  };

  const counts = {};
  const issues = {};
  for (const [name, result] of Object.entries(pages)) {
    const outPath = path.join(OUT_DIR, `${name}.html`);
    fs.writeFileSync(outPath, result.html, 'utf8');
    const size = fs.statSync(outPath).size;
    console.log(`[explorer]   ${name}.html  rows=${result.count.toString().padStart(5)}  size=${(size / 1024).toFixed(1)} KB`);
    counts[name] = result.count;
    if (result.issues && result.issues.length) issues[name] = result.issues;
  }

  const indexHtml = renderIndex(counts, issues, generatedAt);
  fs.writeFileSync(path.join(OUT_DIR, 'index.html'), indexHtml, 'utf8');
  const indexSize = fs.statSync(path.join(OUT_DIR, 'index.html')).size;
  console.log(`[explorer]   index.html        size=${(indexSize / 1024).toFixed(1)} KB`);

  console.log('[explorer] done.');
  return { counts, issues };
}

if (require.main === module) {
  main();
}

module.exports = { main };
