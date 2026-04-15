#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// CODEX EXTENDED PAGES
//
// Extends the static Codex with DETAIL pages for every training method, item,
// recipe, minigame, and boss. Plus per-region density maps and a cross-region
// web visualization.
//
// Output (all added to public/codex/, does NOT clobber existing pages):
//   method-<id>.html       — per-method detail: 8 knobs, prereqs, alternatives
//   item-<id>.html         — per-item detail: sources, uses, recipes, lore
//   recipe-<id>.html       — per-recipe detail: inputs, outputs, skill, station
//   minigame-<id>.html     — per-minigame detail: mechanics, rewards, flavor
//   boss-ext-<id>.html     — per-boss extension: CA tasks, drops, BiS, tier
//   density-<region>.html  — per-region skill density heatmap
//   web.html               — cross-region sources-uses SVG web
//   methods.html           — index of all training methods
//   recipes.html           — index of all recipes
//   minigames.html         — index of all minigames
//
// The OSRS parchment style is sacred per user prefs.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const fs = require('fs');
const path = require('path');

// ── Load content so the relationship registry is populated ───────────────────
require('../content/aelgard/area-gates');
require('../content/aelgard/quest-unlocks');
require('../content/aelgard/item-ecosystem');
require('../content/aelgard/training-knobs');
require('../content/aelgard/breakpoints');
try { require('../content/aelgard/skill-web'); } catch (e) {}
try { require('../content/aelgard/heartlands-deep'); } catch (e) {}
try { require('../content/aelgard/heartlands-density'); } catch (e) {}
try { require('../content/aelgard/moryskah-deep'); } catch (e) {}
try { require('../content/aelgard/moryskah-density'); } catch (e) {}
try { require('../content/aelgard/sootworks-deep'); } catch (e) {}
try { require('../content/aelgard/sootworks-density'); } catch (e) {}
try { require('../content/aelgard/sootworks-tertiary'); } catch (e) {}
try { require('../content/aelgard/sootworks-easter-eggs'); } catch (e) {}
try { require('../content/aelgard/saltbrine-deep'); } catch (e) {}
try { require('../content/aelgard/saltbrine-density'); } catch (e) {}
try { require('../content/aelgard/veilwood-deep'); } catch (e) {}
try { require('../content/aelgard/veilwood-density'); } catch (e) {}
try { require('../content/aelgard/boneyard-deep'); } catch (e) {}
try { require('../content/aelgard/boneyard-density'); } catch (e) {}
try { require('../content/aelgard/glass-desert-deep'); } catch (e) {}
try { require('../content/aelgard/glass-desert-density'); } catch (e) {}
try { require('../content/aelgard/inkweald-deep'); } catch (e) {}
try { require('../content/aelgard/inkweald-density'); } catch (e) {}
try { require('../content/aelgard/mid-tier-regions'); } catch (e) {}
try { require('../content/aelgard/universal-items'); } catch (e) {}
try { require('../content/aelgard/special-regions'); } catch (e) {}
try { require('../content/aelgard/cross-region-web'); } catch (e) {}

const rel = require('../data/relationships');

// combat achievements module
let combatAchievements = null;
try { combatAchievements = require('../content/aelgard/combat-achievements').combatAchievements; } catch (e) {}

// lore.json (for item/boss flavor)
let lore = null;
try { lore = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'data', 'lore.json'), 'utf8')); } catch (e) {}

// ── Minigames (not exported — parse file to extract) ────────────────────────
function loadMinigames() {
  const out = [];
  try {
    const src = fs.readFileSync(path.join(__dirname, '..', 'content', 'aelgard', 'minigames.js'), 'utf8');
    const re = /defineMinigame\(\{([\s\S]*?)^\}\);/gm;
    let m;
    while ((m = re.exec(src)) !== null) {
      const block = m[1];
      const mg = {};
      const fields = ['id', 'name', 'region', 'location', 'type', 'attention', 'description', 'pointCurrency'];
      for (const f of fields) {
        const r = new RegExp(`${f}:\\s*'([^']*)'`);
        const mm = r.exec(block);
        if (mm) mg[f] = mm[1];
      }
      const minRe = /minPlayers:\s*(\d+)/.exec(block);
      const maxRe = /maxPlayers:\s*(\d+)/.exec(block);
      if (minRe) mg.minPlayers = parseInt(minRe[1]);
      if (maxRe) mg.maxPlayers = parseInt(maxRe[1]);
      // rewards / levelReqs: simple array of quoted strings
      const rewRe = /rewards:\s*\[([^\]]*)\]/.exec(block);
      if (rewRe) {
        mg.rewards = (rewRe[1].match(/'([^']*)'/g) || []).map(s => s.slice(1, -1));
      }
      const lvRe = /levelReqs:\s*\{([^}]*)\}/.exec(block);
      if (lvRe) {
        mg.levelReqs = {};
        const re2 = /(\w+):\s*(\d+)/g;
        let m2;
        while ((m2 = re2.exec(lvRe[1])) !== null) mg.levelReqs[m2[1]] = parseInt(m2[2]);
      }
      if (mg.id) out.push(mg);
    }
  } catch (e) { console.warn('[codex-ext] minigames load failed:', e.message); }
  return out;
}

// ── Output directory ────────────────────────────────────────────────────────
const OUT_DIR = path.join(__dirname, '..', '..', 'public', 'codex');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const SKILLS = [
  'attack', 'strength', 'defence', 'hitpoints', 'ranged', 'prayer', 'magic',
  'runecrafting', 'construction', 'agility', 'herblore', 'thieving',
  'crafting', 'fletching', 'slayer', 'hunter', 'mining', 'smithing',
  'fishing', 'cooking', 'firemaking', 'woodcutting', 'farming',
];

const REGIONS = [
  { id: 'heartlands',       label: 'Heartlands' },
  { id: 'moryskah',         label: 'Moryskah' },
  { id: 'boneyard_wastes',  label: 'Boneyard Wastes' },
  { id: 'veilwood',         label: 'Veilwood' },
  { id: 'sootworks',        label: 'Sootworks' },
  { id: 'saltbrine_reach',  label: 'Saltbrine Reach' },
  { id: 'inkweald',         label: 'Inkweald' },
  { id: 'glass_desert',     label: 'Glass Desert' },
  { id: 'the_wilds',        label: 'The Wilds' },
];

// ── Shared CSS (OSRS parchment, sacred) ─────────────────────────────────────
const CSS = `
<style>
  body { font-family: ui-monospace, 'Cascadia Code', Consolas, monospace; background:#3e3529; color:#e8dcc0; margin:0 auto; padding:20px; max-width:1200px; }
  .parchment { background:#e8dcc0; color:#2c1810; padding:30px 40px; border:3px solid #8b6f47; border-radius:4px; box-shadow:0 0 20px rgba(0,0,0,.5); margin:20px 0; }
  h1 { color:#7a1f1a; border-bottom:2px solid #8b6f47; padding-bottom:10px; }
  h2 { color:#5a3a1a; margin-top:30px; }
  h3 { color:#6b4423; }
  a { color:#7a1f1a; border-bottom:1px dotted #7a1f1a; text-decoration:none; }
  a:hover { background:#d4c49c; }
  nav { margin-bottom:20px; }
  nav a { margin-right:12px; font-weight:bold; }
  .description { font-style:italic; color:#5a3a1a; padding:10px; background:#d4c49c; border-left:3px solid #8b6f47; margin:10px 0; }
  table { width:100%; border-collapse:collapse; margin:15px 0; }
  th, td { text-align:left; padding:6px 10px; border-bottom:1px solid #c4a970; }
  th { background:#d4c49c; color:#2c1810; }
  tr:hover { background:#d4c49c; }
  .tag { display:inline-block; padding:2px 8px; margin:2px; border-radius:3px; font-size:11px; font-weight:bold; }
  .tag-region { background:#4a6b8a; color:#fff; }
  .tag-skill  { background:#5a7f4a; color:#fff; }
  .tag-trans  { background:#8a1f1a; color:#fff; }
  .tag-major  { background:#a86a2a; color:#fff; }
  .tag-minor  { background:#6a6a6a; color:#fff; }
  .tag-afk    { background:#3a5a2a; color:#fff; }
  .tag-low    { background:#4a7a3a; color:#fff; }
  .tag-medium { background:#8a7a2a; color:#fff; }
  .tag-high   { background:#a85a2a; color:#fff; }
  .tag-maximum{ background:#8a1f1a; color:#fff; }
  .tag-obscure{ background:#6a4a2a; color:#fff; font-style:italic; }
  .knob-grid { display:grid; grid-template-columns:repeat(4, 1fr); gap:10px; margin:15px 0; }
  .knob { background:#d4c49c; padding:10px; border-radius:3px; }
  .knob .label { font-size:11px; color:#5a3a1a; text-transform:uppercase; font-weight:bold; }
  .knob .value { font-size:16px; color:#7a1f1a; font-weight:bold; margin-top:4px; }
  .knob .detail { font-size:11px; color:#3a2810; margin-top:2px; }
  .stat-grid { display:grid; grid-template-columns:repeat(4, 1fr); gap:10px; margin:15px 0; }
  .stat-cell { background:#d4c49c; padding:10px; border-radius:3px; text-align:center; }
  .stat-cell .value { font-size:24px; font-weight:bold; color:#7a1f1a; }
  .stat-cell .label { font-size:11px; color:#5a3a1a; text-transform:uppercase; }
  .heat { display:inline-block; width:40px; text-align:center; padding:4px; margin:1px; border-radius:3px; font-weight:bold; font-size:11px; }
  .heat-0 { background:#c4a970; color:#5a3a1a; }
  .heat-1 { background:#9ec49a; color:#1a3a1a; }
  .heat-3 { background:#6a9e6a; color:#fff; }
  .heat-5 { background:#3a7a3a; color:#fff; }
  .heat-10 { background:#1a5a1a; color:#fff; }
  ul.loose li { margin-bottom:8px; }
  details { margin:8px 0; padding:8px; background:#d4c49c; border-radius:3px; }
  summary { cursor:pointer; font-weight:bold; }
  .graph-wrap { overflow:auto; background:#d4c49c; padding:10px; border-radius:3px; }
  svg { background:#e8dcc0; }
</style>
`;

function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}
function slug(s) { return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

function page(title, body) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${escapeHtml(title)} — Aelgard Codex</title>${CSS}</head>
<body>
<nav>
  <a href="index.html">Home</a>
  <a href="regions.html">Regions</a>
  <a href="skills.html">Skills</a>
  <a href="methods.html">Methods</a>
  <a href="quests.html">Quests</a>
  <a href="items.html">Items</a>
  <a href="recipes.html">Recipes</a>
  <a href="minigames.html">Minigames</a>
  <a href="bosses.html">Bosses</a>
  <a href="npcs.html">NPCs</a>
  <a href="lore.html">Lore</a>
  <a href="breakpoints.html">Breakpoints</a>
  <a href="web.html">Web</a>
</nav>
<div class="parchment">
${body}
</div>
</body></html>`;
}

// ══════════════════════════════════════════════════════════════════════════════
// UPDATE EXISTING NAV: add new indexes to every existing codex page's <nav>
// ══════════════════════════════════════════════════════════════════════════════

function updateExistingNavs() {
  const files = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.html'));
  // regex to match old <nav>...</nav>
  const navRe = /<nav>[\s\S]*?<\/nav>/;
  const newNav = `<nav>
  <a href="index.html">Home</a>
  <a href="regions.html">Regions</a>
  <a href="skills.html">Skills</a>
  <a href="methods.html">Methods</a>
  <a href="quests.html">Quests</a>
  <a href="items.html">Items</a>
  <a href="recipes.html">Recipes</a>
  <a href="minigames.html">Minigames</a>
  <a href="bosses.html">Bosses</a>
  <a href="npcs.html">NPCs</a>
  <a href="lore.html">Lore</a>
  <a href="breakpoints.html">Breakpoints</a>
  <a href="web.html">Web</a>
</nav>`;
  let changed = 0;
  for (const f of files) {
    const p = path.join(OUT_DIR, f);
    const s = fs.readFileSync(p, 'utf8');
    if (navRe.test(s)) {
      const s2 = s.replace(navRe, newNav);
      if (s2 !== s) { fs.writeFileSync(p, s2); changed++; }
    }
  }
  return changed;
}

// ══════════════════════════════════════════════════════════════════════════════
// PER-METHOD PAGES
// ══════════════════════════════════════════════════════════════════════════════

function collectAllMethods() {
  const all = [];
  for (const s of SKILLS) for (const m of rel.listMethodsForSkill(s)) all.push(m);
  return all;
}

function writeMethodPages() {
  const all = collectAllMethods();
  let count = 0;
  const methodsByLabelSkillLevel = {};

  for (const m of all) {
    const xp = Array.isArray(m.xpPerHour) ? `${m.xpPerHour[0].toLocaleString()}-${m.xpPerHour[1].toLocaleString()}` : (m.xpPerHour || 0).toLocaleString();

    // alternatives at same level: same skill + overlapping range, excluding self
    const alts = rel.listMethodsForSkill(m.skill).filter(x =>
      x.id !== m.id &&
      x.levelRange[0] <= m.levelRange[1] &&
      x.levelRange[1] >= m.levelRange[0]
    ).sort((a, b) => a.levelRange[0] - b.levelRange[0]).slice(0, 20);

    // breakpoints triggered in this method's level range
    const bps = rel.getBreakpointsForSkill(m.skill).filter(b =>
      b.trigger && b.trigger.level != null &&
      b.trigger.level >= m.levelRange[0] && b.trigger.level <= m.levelRange[1]
    ).sort((a, b) => a.trigger.level - b.trigger.level);

    // related recipes: recipes at this skill within levels
    const relatedRecipes = [];
    // Iterate combinations by checking whatUsesItem indirectly; we'll just scan
    // via the internal list: for each produces item, check whatUsesItem
    const produced = (m.resourceOutput && m.resourceOutput.produces) || [];

    const prereqs = m.prerequisites || {};
    const skillReqs = prereqs.skills && Object.entries(prereqs.skills).map(([s, l]) => `<span class="tag tag-skill">${s} ${l}</span>`).join(' ');
    const questReqs = (prereqs.quests || []).map(q => `<a href="quest-${q}.html"><span class="tag tag-minor">quest: ${escapeHtml(q)}</span></a>`).join(' ');
    const itemReqs = (prereqs.items || []).map(i => `<span class="tag tag-minor">${escapeHtml(typeof i === 'string' ? i : (i.name || ''))}</span>`).join(' ');
    const areaReqs = (prereqs.areas || []).map(a => `<span class="tag tag-region">${escapeHtml(a)}</span>`).join(' ');

    const inputs = (m.inputs || []).map(i => `<li><strong>${escapeHtml(i.name)}</strong> — ${i.perHour}/hr from <em>${escapeHtml(i.source || 'unspecified')}</em></li>`).join('\n');
    const producesList = produced.map(p => `<li><strong>${escapeHtml(p.name || '')}</strong> — ${p.perHour || 0}/hr</li>`).join('\n');

    const body = `
<h1>${escapeHtml(m.name)}</h1>
<div class="description">${escapeHtml(m.description || '')}</div>

<div class="stat-grid">
  <div class="stat-cell"><div class="value">${m.skill}</div><div class="label">Skill</div></div>
  <div class="stat-cell"><div class="value">${m.levelRange[0]}-${m.levelRange[1]}</div><div class="label">Level Range</div></div>
  <div class="stat-cell"><div class="value">${xp}</div><div class="label">XP / Hour</div></div>
  <div class="stat-cell"><div class="value">${escapeHtml(m.location || '—')}</div><div class="label">Location</div></div>
</div>

<h2>The 8 Marstead Knobs</h2>
<div class="knob-grid">
  <div class="knob"><div class="label">1. XP per Hour</div><div class="value">${xp}</div></div>
  <div class="knob"><div class="label">2. Prerequisites</div><div class="value">${(skillReqs||questReqs||itemReqs||areaReqs) ? 'yes' : 'none'}</div><div class="detail">${skillReqs || ''} ${questReqs || ''}</div></div>
  <div class="knob"><div class="label">3. Resource Output</div><div class="value">${m.resourceOutput && m.resourceOutput.net || '—'}</div><div class="detail">${produced.length} items/hr</div></div>
  <div class="knob"><div class="label">4. Banking Frequency</div><div class="value">${escapeHtml(m.bankingFrequency || '—')}</div></div>
  <div class="knob"><div class="label">5. Cost / Hour</div><div class="value">${m.costPerHour < 0 ? `+${Math.abs(m.costPerHour).toLocaleString()}` : (m.costPerHour || 0).toLocaleString()} gp</div></div>
  <div class="knob"><div class="label">6. Danger</div><div class="value">${escapeHtml(m.danger || '—')}</div></div>
  <div class="knob"><div class="label">7. Complexity</div><div class="value">${escapeHtml(m.complexity || '—')}</div></div>
  <div class="knob"><div class="label">8. Attention</div><div class="value"><span class="tag tag-${m.attention}">${escapeHtml(m.attention || '—')}</span></div></div>
</div>

<h2>Prerequisites</h2>
<p>
  ${skillReqs ? `<strong>Skills:</strong> ${skillReqs}<br>` : ''}
  ${questReqs ? `<strong>Quests:</strong> ${questReqs}<br>` : ''}
  ${itemReqs ? `<strong>Items:</strong> ${itemReqs}<br>` : ''}
  ${areaReqs ? `<strong>Areas:</strong> ${areaReqs}<br>` : ''}
  ${!(skillReqs || questReqs || itemReqs || areaReqs) ? '<em>None — this method is available immediately.</em>' : ''}
</p>

${inputs ? `<h2>Inputs (Supply Chain)</h2><ul class="loose">${inputs}</ul>` : ''}
${producesList ? `<h2>Produces</h2><ul class="loose">${producesList}</ul>` : ''}

${bps.length ? `<h2>Breakpoints in Range</h2><ul class="loose">${bps.map(b => `<li><span class="tag tag-${b.importance||'minor'}">level ${b.trigger.level}</span> ${escapeHtml(b.description || '')}</li>`).join('\n')}</ul>` : ''}

<h2>Alternatives at Same Level</h2>
${alts.length ? `
<table>
<tr><th>Method</th><th>Levels</th><th>XP/hr</th><th>Attention</th><th>Danger</th></tr>
${alts.map(a => {
  const ax = Array.isArray(a.xpPerHour) ? `${a.xpPerHour[0]}-${a.xpPerHour[1]}` : a.xpPerHour;
  return `<tr><td><a href="method-${slug(a.id)}.html"><strong>${escapeHtml(a.name)}</strong></a></td><td>${a.levelRange[0]}-${a.levelRange[1]}</td><td>${ax.toLocaleString ? ax.toLocaleString() : ax}</td><td><span class="tag tag-${a.attention}">${a.attention}</span></td><td>${a.danger}</td></tr>`;
}).join('\n')}
</table>` : '<p><em>No alternatives registered for this level window.</em></p>'}

<p><a href="skill-${m.skill}.html">← ${m.skill}</a> · <a href="methods.html">all methods</a></p>
`;
    fs.writeFileSync(path.join(OUT_DIR, `method-${slug(m.id)}.html`), page(m.name, body));
    count++;

    // accumulate for density heatmap
    const attn = m.attention || 'afk';
    const key = `${m.skill}|${attn}`;
    methodsByLabelSkillLevel[key] = (methodsByLabelSkillLevel[key] || 0) + 1;
  }

  // Methods index
  const byRegion = {};
  for (const m of all) {
    const r = m.location || 'unknown';
    (byRegion[r] = byRegion[r] || []).push(m);
  }
  const bySkill = {};
  for (const m of all) (bySkill[m.skill] = bySkill[m.skill] || []).push(m);

  let idxBody = `<h1>Training Methods</h1>
<div class="description">${all.length} training methods registered, with all 8 Marstead knobs.</div>

<div class="stat-grid">
  <div class="stat-cell"><div class="value">${all.length}</div><div class="label">Total Methods</div></div>
  <div class="stat-cell"><div class="value">${SKILLS.length}</div><div class="label">Skills Covered</div></div>
  <div class="stat-cell"><div class="value">${Object.keys(byRegion).length}</div><div class="label">Regions</div></div>
  <div class="stat-cell"><div class="value">${all.filter(m => m.attention === 'afk').length}</div><div class="label">AFK Methods</div></div>
</div>

<h2>By Skill</h2>
<table><tr><th>Skill</th><th>Methods</th><th>Links</th></tr>
${Object.entries(bySkill).sort((a,b)=>b[1].length-a[1].length).map(([s, arr]) =>
  `<tr><td><a href="skill-${s}.html"><strong>${s}</strong></a></td><td>${arr.length}</td><td>${arr.slice(0, 5).map(m => `<a href="method-${slug(m.id)}.html">${escapeHtml(m.name)}</a>`).join(', ')}${arr.length > 5 ? ` <em>and ${arr.length - 5} more</em>` : ''}</td></tr>`
).join('\n')}
</table>

<h2>By Region</h2>
<table><tr><th>Region</th><th>Methods</th></tr>
${Object.entries(byRegion).sort((a,b)=>b[1].length-a[1].length).map(([r, arr]) =>
  `<tr><td>${escapeHtml(r)}</td><td>${arr.length}</td></tr>`
).join('\n')}
</table>

<h2>All Methods</h2>
<table><tr><th>Method</th><th>Skill</th><th>Levels</th><th>XP/hr</th><th>Attention</th><th>Location</th></tr>
${all.sort((a, b) => a.skill.localeCompare(b.skill) || a.levelRange[0] - b.levelRange[0]).map(m => {
  const ax = Array.isArray(m.xpPerHour) ? `${m.xpPerHour[0]}-${m.xpPerHour[1]}` : m.xpPerHour;
  return `<tr><td><a href="method-${slug(m.id)}.html"><strong>${escapeHtml(m.name)}</strong></a></td><td>${m.skill}</td><td>${m.levelRange[0]}-${m.levelRange[1]}</td><td>${ax.toLocaleString ? ax.toLocaleString() : ax}</td><td><span class="tag tag-${m.attention}">${m.attention}</span></td><td>${escapeHtml(m.location || '')}</td></tr>`;
}).join('\n')}
</table>
`;
  fs.writeFileSync(path.join(OUT_DIR, 'methods.html'), page('Methods', idxBody));

  return count;
}

// ══════════════════════════════════════════════════════════════════════════════
// PER-ITEM PAGES
// ══════════════════════════════════════════════════════════════════════════════

function collectAllItems() {
  // Scan the same ID range codex-generator uses plus a broader sweep
  const ids = new Set();
  // We can iterate faster by reading the internal registry via known IDs
  // Use the direct reg API: itemSources map keys via getItemSources/listItemSources
  // Not exposed — use same brute scan with a broader range to catch 87xxx, 90xxx, 91xxx
  for (let id = 1; id <= 99999; id++) {
    if (rel.getItemSources(id).length > 0 || rel.getItemUses(id).length > 0) ids.add(id);
  }
  return [...ids];
}

// Try to get an item name by synthesizing from sources/combinations
function synthItemName(id) {
  // First, check if there is a combination that produces this id
  const combo = rel.whatMakesItem(id);
  if (combo && combo.resultName) return combo.resultName;
  // Try each source for a hint
  const sources = rel.getItemSources(id);
  for (const s of sources) {
    if (s.details) {
      const first = String(s.details).split('.')[0].split(',')[0];
      if (first.length > 2 && first.length < 60) return first;
    }
  }
  return `Item #${id}`;
}

function writeItemPages() {
  const ids = collectAllItems();
  let count = 0;
  const itemLoreMap = {};
  if (lore && lore.signature_items) {
    for (const it of lore.signature_items) {
      itemLoreMap[slug(it.name || '')] = it;
      itemLoreMap[slug(it.id || '')] = it;
    }
  }

  // Cap at a reasonable number — we want ~200 item pages; pick items with richest data
  // Rank by len(sources)+len(uses)+hasCombo
  const ranked = ids.map(id => {
    const src = rel.getItemSources(id);
    const use = rel.getItemUses(id);
    const combo = rel.whatMakesItem(id);
    const used = rel.whatUsesItem(id);
    return { id, src, use, combo, used, score: src.length + use.length + (combo ? 3 : 0) + used.length };
  }).sort((a, b) => b.score - a.score);

  const toWrite = ranked.slice(0, 220); // keep page count bounded but high

  for (const item of toWrite) {
    const name = synthItemName(item.id);
    const sources = item.src.map(s => `<li><span class="tag tag-${s.obscure ? 'obscure' : (s.type === 'drop' ? 'trans' : 'minor')}">${escapeHtml(s.type)}</span> <strong>${escapeHtml(s.sourceName || s.sourceId || '')}</strong>${s.region ? ` <span class="tag tag-region">${escapeHtml(s.region)}</span>` : ''}${s.details ? ` — ${escapeHtml(s.details)}` : ''}</li>`).join('\n');
    const uses = item.use.map(u => `<li><span class="tag tag-${u.type === 'quest_req' ? 'major' : 'minor'}">${escapeHtml(u.type)}</span> <strong>${escapeHtml(u.targetName || u.targetId || '')}</strong>${u.details ? ` — ${escapeHtml(u.details)}` : ''}</li>`).join('\n');
    const usedInRecipes = item.used.map(u => `<li><a href="recipe-${u.resultId}.html"><strong>${escapeHtml(u.resultName)}</strong></a></li>`).join('\n');
    const madeBy = item.combo;

    // Find any lore
    const slugName = slug(name);
    const loreEntry = itemLoreMap[slugName];

    // Can be equipped with: very rough — check items sharing a combination
    // Skipping — would need item slot metadata we don't have here

    const body = `
<h1>${escapeHtml(name)}</h1>
<div class="description">Item #${item.id}. ${item.src.length} source(s), ${item.use.length} registered use(s).</div>

<div class="stat-grid">
  <div class="stat-cell"><div class="value">${item.src.length}</div><div class="label">Sources</div></div>
  <div class="stat-cell"><div class="value">${item.use.length}</div><div class="label">Uses</div></div>
  <div class="stat-cell"><div class="value">${item.used.length}</div><div class="label">In Recipes</div></div>
  <div class="stat-cell"><div class="value">${madeBy ? '1' : '0'}</div><div class="label">Crafted From</div></div>
</div>

${madeBy ? `
<h2>How It's Made</h2>
<div class="description">
  <strong>Recipe:</strong> <a href="recipe-${madeBy.resultId}.html">${escapeHtml(madeBy.resultName || '')}</a><br>
  <strong>Skill:</strong> ${escapeHtml(madeBy.skill || '')} level ${madeBy.level || 1} (${madeBy.xp || 0} xp)<br>
  <strong>Station:</strong> ${escapeHtml(madeBy.station || 'unspecified')}<br>
  <strong>Inputs:</strong> ${(madeBy.inputs || []).map(i => `${i.name || ('#' + (i.id || 'x'))}`).join(', ')}
</div>
` : ''}

${sources ? `<h2>Sources (where it comes from)</h2><ul class="loose">${sources}</ul>` : ''}
${uses ? `<h2>Uses (what it feeds)</h2><ul class="loose">${uses}</ul>` : ''}
${usedInRecipes ? `<h2>Used in Recipes</h2><ul class="loose">${usedInRecipes}</ul>` : ''}

${loreEntry ? `
<h2>Lore</h2>
<div class="description">
  <strong>${escapeHtml(loreEntry.name)}</strong> — ${escapeHtml(loreEntry.region || '')}<br>
  ${escapeHtml(loreEntry.description || '')}
</div>
` : ''}

<h2>Price Guide</h2>
<p><em>This item has no registered GE price. Check with merchants in-game.</em></p>

<p><a href="items.html">← all items</a></p>
`;
    fs.writeFileSync(path.join(OUT_DIR, `item-${item.id}.html`), page(name, body));
    count++;
  }

  return count;
}

// ══════════════════════════════════════════════════════════════════════════════
// PER-RECIPE PAGES
// ══════════════════════════════════════════════════════════════════════════════

function writeRecipePages() {
  // Access combinations via rel internal — use whatMakesItem loop
  // No direct list — iterate all possible result IDs we know about
  // Strategy: collect all itemIds, then check whatMakesItem for each
  const known = new Set();
  for (let id = 1; id <= 99999; id++) {
    const combo = rel.whatMakesItem(id);
    if (combo) known.add(id);
  }
  const all = [...known].map(id => ({ id, combo: rel.whatMakesItem(id) })).filter(x => x.combo);

  let count = 0;
  for (const rec of all) {
    const c = rec.combo;
    const altPaths = [];
    // alternative paths: other recipes with the same skill+result class would be a stretch
    // Find items that appear as inputs in other recipes too, to suggest side uses
    const inputUses = (c.inputs || []).map(i => {
      const uses = rel.whatUsesItem(i.id);
      return { input: i, otherUses: uses.filter(u => u.resultId !== rec.id).slice(0, 5) };
    });

    const body = `
<h1>${escapeHtml(c.resultName || 'Unnamed Recipe')}</h1>
<div class="description">${escapeHtml(c.description || 'No description.')}</div>

<div class="stat-grid">
  <div class="stat-cell"><div class="value">${escapeHtml(c.skill || '—')}</div><div class="label">Skill</div></div>
  <div class="stat-cell"><div class="value">${c.level || 1}</div><div class="label">Level</div></div>
  <div class="stat-cell"><div class="value">${c.xp || 0}</div><div class="label">XP</div></div>
  <div class="stat-cell"><div class="value">${escapeHtml(c.station || '—')}</div><div class="label">Station</div></div>
</div>

<h2>Inputs</h2>
${(c.inputs || []).length ? `<table><tr><th>Input</th><th>Consumed</th><th>Also Used In</th></tr>
${inputUses.map(({ input, otherUses }) => `
  <tr>
    <td><a href="item-${input.id}.html"><strong>${escapeHtml(input.name || ('#' + input.id))}</strong></a></td>
    <td>${input.consumed === false ? 'no' : 'yes'}</td>
    <td>${otherUses.length ? otherUses.map(u => `<a href="recipe-${u.resultId}.html">${escapeHtml(u.resultName)}</a>`).join(', ') : '<em>nothing else</em>'}</td>
  </tr>`).join('\n')}
</table>` : '<p><em>No inputs specified.</em></p>'}

<h2>Output</h2>
<p><a href="item-${c.resultId}.html"><strong>${escapeHtml(c.resultName || '')}</strong></a></p>

<h2>Alternative Paths</h2>
<p><em>No alternative paths currently registered.</em></p>

<p><a href="recipes.html">← all recipes</a></p>
`;
    fs.writeFileSync(path.join(OUT_DIR, `recipe-${rec.id}.html`), page(c.resultName || `recipe-${rec.id}`, body));
    count++;
  }

  // Recipes index
  const bySkill = {};
  for (const r of all) {
    const s = r.combo.skill || 'uncategorized';
    (bySkill[s] = bySkill[s] || []).push(r);
  }

  const body = `<h1>Recipes</h1>
<div class="description">${all.length} recipes registered. Every reagent path, every upgrade combination.</div>

<div class="stat-grid">
  <div class="stat-cell"><div class="value">${all.length}</div><div class="label">Total Recipes</div></div>
  <div class="stat-cell"><div class="value">${Object.keys(bySkill).length}</div><div class="label">Skills Involved</div></div>
</div>

<h2>By Skill</h2>
${Object.entries(bySkill).sort((a,b)=>b[1].length-a[1].length).map(([s, arr]) => `
<h3>${s} (${arr.length})</h3>
<table><tr><th>Result</th><th>Level</th><th>XP</th><th>Station</th></tr>
${arr.sort((a, b) => (a.combo.level || 0) - (b.combo.level || 0)).map(r => `<tr><td><a href="recipe-${r.id}.html"><strong>${escapeHtml(r.combo.resultName || '')}</strong></a></td><td>${r.combo.level || 1}</td><td>${r.combo.xp || 0}</td><td>${escapeHtml(r.combo.station || '')}</td></tr>`).join('\n')}
</table>
`).join('\n')}
`;
  fs.writeFileSync(path.join(OUT_DIR, 'recipes.html'), page('Recipes', body));
  return count;
}

// ══════════════════════════════════════════════════════════════════════════════
// PER-MINIGAME PAGES
// ══════════════════════════════════════════════════════════════════════════════

function writeMinigamePages() {
  const all = loadMinigames();
  let count = 0;
  for (const mg of all) {
    const rewards = (mg.rewards || []).map(r => `<li>${escapeHtml(r)}</li>`).join('\n');
    const levelReqs = Object.entries(mg.levelReqs || {}).map(([s, l]) => `<span class="tag tag-skill">${s} ${l}</span>`).join(' ');

    const body = `
<h1>${escapeHtml(mg.name || mg.id)}</h1>
<div class="description">${escapeHtml(mg.description || '')}</div>

<div class="stat-grid">
  <div class="stat-cell"><div class="value">${escapeHtml(mg.region || '')}</div><div class="label">Region</div></div>
  <div class="stat-cell"><div class="value">${escapeHtml(mg.type || '')}</div><div class="label">Type</div></div>
  <div class="stat-cell"><div class="value">${mg.minPlayers || 1}-${mg.maxPlayers || 1}</div><div class="label">Players</div></div>
  <div class="stat-cell"><div class="value">${escapeHtml(mg.attention || '')}</div><div class="label">Attention</div></div>
</div>

<h2>Mechanics</h2>
<p><strong>Location:</strong> ${escapeHtml(mg.location || '')}</p>
<p><strong>Level requirements:</strong> ${levelReqs || '<em>none</em>'}</p>
${mg.pointCurrency ? `<p><strong>Currency:</strong> <em>${escapeHtml(mg.pointCurrency)}</em></p>` : ''}

${rewards ? `<h2>Rewards</h2><ul class="loose">${rewards}</ul>` : ''}

<h2>Voice Flavor</h2>
<div class="description"><em>
  "${escapeHtml(mg.name || '')} calls to the bold. Points earned here buy things earned nowhere else."
</em></div>

<h2>Leaderboard</h2>
<p><em>Leaderboard placeholder — top 100 participants by points earned. Reset quarterly.</em></p>

<p><a href="minigames.html">← all minigames</a></p>
`;
    fs.writeFileSync(path.join(OUT_DIR, `minigame-${slug(mg.id)}.html`), page(mg.name || mg.id, body));
    count++;
  }

  // Minigames index
  const body = `<h1>Minigames</h1>
<div class="description">${all.length} minigames. Each one fills a unique attention tier and rewards something earned nowhere else.</div>

<table>
<tr><th>Name</th><th>Region</th><th>Type</th><th>Attention</th><th>Players</th></tr>
${all.map(mg => `<tr>
  <td><a href="minigame-${slug(mg.id)}.html"><strong>${escapeHtml(mg.name || mg.id)}</strong></a></td>
  <td>${escapeHtml(mg.region || '')}</td>
  <td>${escapeHtml(mg.type || '')}</td>
  <td>${escapeHtml(mg.attention || '')}</td>
  <td>${mg.minPlayers || 1}-${mg.maxPlayers || 1}</td>
</tr>`).join('\n')}
</table>
`;
  fs.writeFileSync(path.join(OUT_DIR, 'minigames.html'), page('Minigames', body));
  return count;
}

// ══════════════════════════════════════════════════════════════════════════════
// BOSS EXTENSION PAGES (adds combat achievement + drop info as boss-ext-*)
// ══════════════════════════════════════════════════════════════════════════════

function writeBossExtPages() {
  if (!combatAchievements) return 0;
  // Collect unique boss IDs across all tiers
  const tasksByBoss = {};
  const allTiers = ['easy', 'medium', 'hard', 'elite', 'master', 'grandmaster'];
  for (const tier of allTiers) {
    const tasks = combatAchievements.get(tier) || [];
    for (const t of tasks) {
      const b = t.boss || 'unknown';
      (tasksByBoss[b] = tasksByBoss[b] || []).push({ ...t, tier });
    }
  }
  // Enrich with lore bosses
  const loreBossMap = {};
  if (lore && lore.bosses) {
    for (const b of lore.bosses) {
      loreBossMap[b.id || slug(b.name)] = b;
      loreBossMap[slug(b.name)] = b;
    }
  }

  let count = 0;
  for (const [bossId, tasks] of Object.entries(tasksByBoss)) {
    const loreB = loreBossMap[bossId] || loreBossMap[slug(bossId)];
    // Rough tier: highest CA tier for this boss
    const tierOrder = { easy: 1, medium: 2, hard: 3, elite: 4, master: 5, grandmaster: 6 };
    const bestTier = tasks.reduce((acc, t) => (tierOrder[t.tier] > tierOrder[acc] ? t.tier : acc), 'easy');

    const body = `
<h1>${escapeHtml((loreB && loreB.name) || bossId)} — Combat Profile</h1>
<div class="description">Difficulty tier: <span class="tag tag-${bestTier === 'grandmaster' ? 'trans' : bestTier === 'master' ? 'major' : bestTier === 'elite' ? 'high' : bestTier === 'hard' ? 'medium' : 'minor'}">${bestTier}</span>. ${tasks.length} combat achievement tasks.</div>

<h2>Recommended Gear / Prayers</h2>
<div class="description">
  <strong>Weakness:</strong> Consult bestiary page for full mechanics.<br>
  <strong>Prayer:</strong> Protect from the boss's primary attack style.<br>
  <strong>Gear tier:</strong> Matches combat achievement tier — ${bestTier}.
</div>

<h2>Combat Achievement Tasks (${tasks.length})</h2>
<table>
<tr><th>Tier</th><th>Name</th><th>Description</th></tr>
${tasks.sort((a, b) => tierOrder[a.tier] - tierOrder[b.tier]).map(t => `<tr><td><span class="tag tag-${t.tier === 'grandmaster' ? 'trans' : t.tier === 'master' ? 'major' : 'minor'}">${t.tier}</span></td><td><strong>${escapeHtml(t.name)}</strong></td><td>${escapeHtml(t.desc || '')}</td></tr>`).join('\n')}
</table>

<h2>Drop Table</h2>
<p><em>See in-game drop table for full loot. Boss drops scale with tier; this boss is ${bestTier}-tier.</em></p>

${loreB && loreB.bestiary ? `<h2>Bestiary</h2><p>${escapeHtml(loreB.bestiary)}</p>` : ''}
${loreB && loreB.kill_cry ? `<blockquote>${escapeHtml(loreB.kill_cry)}</blockquote>` : ''}

<p><a href="boss-${bossId}.html">← boss bestiary</a> · <a href="bosses.html">all bosses</a></p>
`;
    fs.writeFileSync(path.join(OUT_DIR, `boss-ext-${slug(bossId)}.html`), page(`${bossId} — combat`, body));
    count++;
  }
  return count;
}

// ══════════════════════════════════════════════════════════════════════════════
// REGIONAL DENSITY HEATMAPS
// ══════════════════════════════════════════════════════════════════════════════

function writeDensityPages() {
  const ATTN = ['afk', 'low', 'medium', 'high', 'maximum'];
  let count = 0;
  for (const r of REGIONS) {
    // All methods in this region label (location matches)
    const methods = [];
    for (const s of SKILLS) {
      for (const m of rel.listMethodsForSkill(s)) {
        const loc = (m.location || '').toLowerCase();
        const rlabel = r.label.toLowerCase();
        const rid = r.id.replace(/_/g, ' ').toLowerCase();
        if (loc === rlabel || loc === r.label || loc.includes(rid) || loc.includes(rlabel)) {
          methods.push(m);
        }
      }
    }

    // Build matrix: rows=skills, cols=attention
    const matrix = {};
    for (const s of SKILLS) {
      matrix[s] = { afk: 0, low: 0, medium: 0, high: 0, maximum: 0, total: 0 };
    }
    for (const m of methods) {
      if (matrix[m.skill]) {
        matrix[m.skill][m.attention || 'afk']++;
        matrix[m.skill].total++;
      }
    }

    function heatClass(n) {
      if (n >= 10) return 'heat-10';
      if (n >= 5) return 'heat-5';
      if (n >= 3) return 'heat-3';
      if (n >= 1) return 'heat-1';
      return 'heat-0';
    }

    const body = `
<h1>${escapeHtml(r.label)} — Density Heatmap</h1>
<div class="description">How many training methods this region has per skill, broken down by attention tier.</div>

<div class="stat-grid">
  <div class="stat-cell"><div class="value">${methods.length}</div><div class="label">Total Methods</div></div>
  <div class="stat-cell"><div class="value">${Object.values(matrix).filter(v => v.total > 0).length}</div><div class="label">Skills With Content</div></div>
  <div class="stat-cell"><div class="value">${methods.filter(m => m.attention === 'afk').length}</div><div class="label">AFK Methods</div></div>
  <div class="stat-cell"><div class="value">${methods.filter(m => m.attention === 'high' || m.attention === 'maximum').length}</div><div class="label">High-Focus Methods</div></div>
</div>

<h2>Skill × Attention Matrix</h2>
<p><em>0 &lt; 1 &lt; 3 &lt; 5 &lt; 10+ methods. Gaps identify where this region needs more content.</em></p>
<table>
<tr><th>Skill</th><th>AFK</th><th>Low</th><th>Medium</th><th>High</th><th>Maximum</th><th>Total</th></tr>
${SKILLS.map(s => {
  const row = matrix[s];
  return `<tr>
    <td><a href="skill-${s}.html"><strong>${s}</strong></a></td>
    <td><span class="heat ${heatClass(row.afk)}">${row.afk}</span></td>
    <td><span class="heat ${heatClass(row.low)}">${row.low}</span></td>
    <td><span class="heat ${heatClass(row.medium)}">${row.medium}</span></td>
    <td><span class="heat ${heatClass(row.high)}">${row.high}</span></td>
    <td><span class="heat ${heatClass(row.maximum)}">${row.maximum}</span></td>
    <td><strong>${row.total}</strong></td>
  </tr>`;
}).join('\n')}
</table>

<h2>Methods by Skill</h2>
${SKILLS.filter(s => matrix[s].total > 0).map(s => `
<h3>${s} (${matrix[s].total})</h3>
<ul class="loose">
${methods.filter(m => m.skill === s).sort((a, b) => a.levelRange[0] - b.levelRange[0]).map(m => `<li><a href="method-${slug(m.id)}.html"><strong>${escapeHtml(m.name)}</strong></a> <span class="tag tag-${m.attention}">${m.attention}</span> ${m.levelRange[0]}-${m.levelRange[1]}</li>`).join('\n')}
</ul>
`).join('\n')}

<p><a href="region-${r.id}.html">← ${r.label} region</a></p>
`;
    fs.writeFileSync(path.join(OUT_DIR, `density-${r.id}.html`), page(`${r.label} density`, body));
    count++;
  }
  return count;
}

// ══════════════════════════════════════════════════════════════════════════════
// CROSS-REGION WEB VISUALIZATION (inline SVG)
// ══════════════════════════════════════════════════════════════════════════════

function writeWebViz() {
  // Collect obscure cross-region connections from itemSources where source region
  // differs from a "primary use" region. We don't have perfect metadata so we
  // fall back to: count of cross-region itemSources with obscure=true.
  const regionCenters = {};
  const W = 900, H = 700;
  const cx = W / 2, cy = H / 2;
  const radius = 260;
  const n = REGIONS.length;
  REGIONS.forEach((r, i) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    regionCenters[r.id] = {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
      label: r.label,
    };
  });

  // count connections
  const connections = {};
  for (let id = 1; id <= 99999; id++) {
    const sources = rel.getItemSources(id);
    const uses = rel.getItemUses(id);
    if (sources.length === 0) continue;
    const srcRegion = sources[0].region;
    if (!srcRegion) continue;
    for (const s of sources) {
      if (s.obscure && s.region && s.region !== srcRegion) {
        const key = [srcRegion, s.region].sort().join('|');
        connections[key] = (connections[key] || 0) + 1;
      }
    }
    for (const u of uses) {
      if (u.details) {
        // Scan for cross-region mentions
        for (const r of REGIONS) {
          if (r.id === srcRegion) continue;
          const rid = r.id.replace(/_/g, ' ').toLowerCase();
          if (u.details.toLowerCase().includes(rid) || u.details.toLowerCase().includes(r.label.toLowerCase())) {
            const key = [srcRegion, r.id].sort().join('|');
            connections[key] = (connections[key] || 0) + 1;
          }
        }
      }
    }
  }

  // edges
  const edges = Object.entries(connections)
    .map(([k, v]) => { const [a, b] = k.split('|'); return { a, b, weight: v }; })
    .filter(e => regionCenters[e.a] && regionCenters[e.b]);

  const maxW = Math.max(1, ...edges.map(e => e.weight));

  let svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
  // edges
  for (const e of edges) {
    const A = regionCenters[e.a];
    const B = regionCenters[e.b];
    const strokeW = 1 + (e.weight / maxW) * 6;
    svg += `<line x1="${A.x.toFixed(1)}" y1="${A.y.toFixed(1)}" x2="${B.x.toFixed(1)}" y2="${B.y.toFixed(1)}" stroke="#8b6f47" stroke-width="${strokeW.toFixed(2)}" opacity="0.65"/>`;
    // weight label
    const mx = (A.x + B.x) / 2;
    const my = (A.y + B.y) / 2;
    svg += `<text x="${mx.toFixed(1)}" y="${my.toFixed(1)}" text-anchor="middle" fill="#7a1f1a" font-size="10" font-weight="bold">${e.weight}</text>`;
  }
  // nodes
  for (const r of REGIONS) {
    const c = regionCenters[r.id];
    svg += `<circle cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="42" fill="#d4c49c" stroke="#7a1f1a" stroke-width="2"/>`;
    svg += `<text x="${c.x.toFixed(1)}" y="${(c.y + 4).toFixed(1)}" text-anchor="middle" fill="#2c1810" font-size="11" font-weight="bold">${escapeHtml(c.label)}</text>`;
  }
  svg += '</svg>';

  const body = `
<h1>The Aelgard Web</h1>
<div class="description">Every region produces items that other regions consume. Thicker lines = more cross-region reagents. Obscure connections are what turn grinders into explorers.</div>

<div class="stat-grid">
  <div class="stat-cell"><div class="value">${REGIONS.length}</div><div class="label">Regions</div></div>
  <div class="stat-cell"><div class="value">${edges.length}</div><div class="label">Connection Edges</div></div>
  <div class="stat-cell"><div class="value">${edges.reduce((s, e) => s + e.weight, 0)}</div><div class="label">Total Cross-Region Links</div></div>
  <div class="stat-cell"><div class="value">${maxW}</div><div class="label">Strongest Edge Weight</div></div>
</div>

<div class="graph-wrap">
${svg}
</div>

<h2>Edge List</h2>
<table>
<tr><th>Region A</th><th>Region B</th><th>Weight</th></tr>
${edges.sort((a, b) => b.weight - a.weight).map(e => `<tr><td><a href="region-${e.a}.html">${escapeHtml(regionCenters[e.a].label)}</a></td><td><a href="region-${e.b}.html">${escapeHtml(regionCenters[e.b].label)}</a></td><td><strong>${e.weight}</strong></td></tr>`).join('\n')}
</table>
`;
  fs.writeFileSync(path.join(OUT_DIR, 'web.html'), page('Web', body));
  return edges.length;
}

// ══════════════════════════════════════════════════════════════════════════════
// DRIVE
// ══════════════════════════════════════════════════════════════════════════════

console.log(`Generating extended Codex in ${OUT_DIR}...`);
const nMethods = writeMethodPages();       console.log(`  methods: ${nMethods} pages`);
const nItems = writeItemPages();           console.log(`  items: ${nItems} pages`);
const nRecipes = writeRecipePages();       console.log(`  recipes: ${nRecipes} pages`);
const nMini = writeMinigamePages();        console.log(`  minigames: ${nMini} pages`);
const nBossExt = writeBossExtPages();      console.log(`  boss ext: ${nBossExt} pages`);
const nDensity = writeDensityPages();      console.log(`  density: ${nDensity} pages`);
const nEdges = writeWebViz();              console.log(`  web viz: 1 page (${nEdges} edges)`);
const navChanged = updateExistingNavs();   console.log(`  nav updated on ${navChanged} existing pages`);

const total = nMethods + nItems + nRecipes + nMini + nBossExt + nDensity + 4; // +indexes
console.log(`\n[codex-ext] ${total} new/updated HTML pages written to ${OUT_DIR}`);
