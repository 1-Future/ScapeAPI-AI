#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// CODEX LORE PAGES
//
// Augments the static Codex with per-quest, per-NPC, and per-region lore
// pages built from the JSON authored during the burn session:
//   data/lore.json             — region narratives, bosses, prestige, signature items
//   data/quest-narratives.json — every quest's hook/premise/steps/dialogue
//   data/npc-bibles.json       — NPC voice/background/drives/relationships
//
// Output: public/codex/quest-<id>.html, npc-<id>.html, lore-<region>.html,
// boss-<id>.html, plus an updated lore index and updated quests.html /
// regions.html that link into the new detail pages.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', '..', 'public', 'codex');
const DATA_DIR = path.join(__dirname, '..', '..', 'data');

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8')); }
  catch (e) { console.warn(`[codex-lore] could not read ${file}: ${e.message}`); return null; }
}

const lore = readJson('lore.json');
const quests = readJson('quest-narratives.json');
const bibles = readJson('npc-bibles.json');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// ── shared style + page helpers (parchment, sacred per user prefs) ───────────
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
  nav a { margin-right:15px; font-weight:bold; }
  .description { font-style:italic; color:#5a3a1a; padding:10px; background:#d4c49c; border-left:3px solid #8b6f47; margin:10px 0; }
  .meta { display:flex; flex-wrap:wrap; gap:10px; margin:10px 0; }
  .meta span { background:#d4c49c; padding:4px 10px; border-radius:3px; font-size:12px; }
  .speaker { font-weight:bold; color:#6b4423; margin-top:10px; }
  .line { margin:5px 0 15px 20px; font-style:italic; color:#3a2810; }
  .step { margin:10px 0; padding:10px; background:#d4c49c; border-left:3px solid #8b6f47; }
  .step .obj { font-weight:bold; }
  .step .flavor { font-size:13px; color:#5a3a1a; margin-top:4px; }
  blockquote { border-left:4px solid #8b6f47; padding-left:15px; color:#5a3a1a; font-style:italic; }
  ul.loose li { margin-bottom:8px; }
  details { margin:8px 0; padding:8px; background:#d4c49c; border-radius:3px; }
  summary { cursor:pointer; font-weight:bold; }
  pre { white-space: pre-wrap; word-break: break-word; }
</style>
`;

function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

function page(title, body) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${escapeHtml(title)} — Aelgard Codex</title>${CSS}</head>
<body>
<nav>
  <a href="index.html">Home</a>
  <a href="regions.html">Regions</a>
  <a href="skills.html">Skills</a>
  <a href="quests.html">Quests</a>
  <a href="lore.html">Lore</a>
  <a href="npcs.html">NPCs</a>
  <a href="bosses.html">Bosses</a>
  <a href="breakpoints.html">Breakpoints</a>
  <a href="items.html">Items</a>
  <a href="search.html">Search</a>
</nav>
<div class="parchment">
${body}
</div>
</body></html>`;
}

const slug = s => (s || '').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const para = s => `<p>${escapeHtml(s).replace(/\n\n+/g,'</p><p>').replace(/\n/g,'<br>')}</p>`;

let counts = { quests: 0, npcs: 0, regions: 0, bosses: 0, prestige: 0, items: 0 };

// ── Quest pages ──────────────────────────────────────────────────────────────
function writeQuestPages() {
  if (!quests) return;
  const list = quests.quests || quests;  // may be array or {quests:[...]}
  if (!Array.isArray(list)) return;
  for (const q of list) {
    const id = q.id || slug(q.title || 'unknown');
    const stepsHtml = (q.steps || []).map(s =>
      `<div class="step">
         <div><span style="color:#7a1f1a">[${escapeHtml(String(s.n || ''))}]</span> <span class="obj">${escapeHtml(s.objective || '')}</span></div>
         ${s.location ? `<div>Where: ${escapeHtml(s.location)}</div>` : ''}
         ${s.requires ? `<div>Requires: ${escapeHtml(typeof s.requires === 'string' ? s.requires : JSON.stringify(s.requires))}</div>` : ''}
         ${s.flavor ? `<div class="flavor">${escapeHtml(s.flavor)}</div>` : ''}
       </div>`
    ).join('\n');
    const dialogueHtml = (q.dialogue_beats || []).map(b =>
      `<div class="speaker">${escapeHtml(b.speaker || 'Unknown')}</div><div class="line">${escapeHtml(b.line || '')}</div>`
    ).join('\n');
    const cross = Array.isArray(q.cross_region) && q.cross_region.length ? `<div class="meta">${q.cross_region.map(r => `<span>${escapeHtml(r)}</span>`).join('')}</div>` : '';
    const body = `
<h1>${escapeHtml(q.title || id)}</h1>
<div class="meta">
  <span>${escapeHtml(q.difficulty || 'unspecified')}</span>
  <span>${escapeHtml(q.length || 'unspecified')}</span>
  <span>id: ${escapeHtml(id)}</span>
</div>
${cross}
<div class="description">${escapeHtml(q.hook || '')}</div>
<h2>Premise</h2>
${para(q.premise || '')}
${stepsHtml ? `<h2>Steps</h2>${stepsHtml}` : ''}
${q.twist ? `<h2>Twist</h2>${para(q.twist)}` : ''}
${q.resolution ? `<h2>Resolution</h2>${para(q.resolution)}` : ''}
${q.unlocks_prose ? `<h2>What it unlocks</h2><div class="description">${escapeHtml(q.unlocks_prose)}</div>` : ''}
${dialogueHtml ? `<h2>Dialogue</h2>${dialogueHtml}` : ''}
<p><a href="quests.html">← all quests</a></p>
`;
    fs.writeFileSync(path.join(OUT_DIR, `quest-${id}.html`), page(q.title || id, body));
    counts.quests++;
  }
  // Quest index (overwrites the simple quests.html)
  const idx = list.map(q => ({ id: q.id || slug(q.title), title: q.title, difficulty: q.difficulty, length: q.length, hook: (q.hook||'').slice(0, 200) }))
    .sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  const body = `
<h1>Quests</h1>
<div class="description">Every quest is a Metroidvania key. None give XP-only.</div>
<table style="width:100%; border-collapse:collapse">
<tr style="background:#d4c49c"><th align="left" style="padding:6px">Title</th><th align="left">Difficulty</th><th align="left">Length</th><th align="left">Hook</th></tr>
${idx.map(q => `<tr style="border-bottom:1px solid #c4a970"><td style="padding:6px"><a href="quest-${q.id}.html"><strong>${escapeHtml(q.title || q.id)}</strong></a></td><td>${escapeHtml(q.difficulty || '')}</td><td>${escapeHtml(q.length || '')}</td><td><small>${escapeHtml(q.hook)}…</small></td></tr>`).join('\n')}
</table>
`;
  fs.writeFileSync(path.join(OUT_DIR, 'quests.html'), page('Quests', body));
}

// ── NPC pages ────────────────────────────────────────────────────────────────
function writeNpcPages() {
  if (!bibles) return;
  const list = bibles.npcs || bibles;
  if (!Array.isArray(list)) return;
  for (const n of list) {
    const id = n.id || slug(n.name || 'unknown');
    const exampleLines = (n.voice && n.voice.example_lines) || [];
    const verbalTics = (n.voice && n.voice.verbal_tics) || [];
    const rels = (n.relationships || []).map(r => `<li><strong>${escapeHtml(r.with || '')}</strong> — ${escapeHtml(r.nature || '')}</li>`).join('\n');
    const dpat = n.dialogue_patterns || {};
    const opinions = n.opinions || {};
    const body = `
<h1>${escapeHtml(n.name || id)}${n.title_shown_to_players ? `, ${escapeHtml(n.title_shown_to_players)}` : ''}</h1>
<div class="meta">
  <span>${escapeHtml(n.region || 'unknown region')}</span>
  <span>${escapeHtml(n.role || '')}</span>
</div>
<div class="description">${escapeHtml(n.archetype || '')}</div>

<h2>Voice</h2>
${n.voice && n.voice.cadence ? `<p><strong>Cadence:</strong> ${escapeHtml(n.voice.cadence)}</p>` : ''}
${n.voice && n.voice.vocabulary ? `<p><strong>Vocabulary:</strong> ${escapeHtml(n.voice.vocabulary)}</p>` : ''}
${verbalTics.length ? `<p><strong>Verbal tics:</strong> ${verbalTics.map(t => `<em>${escapeHtml(t)}</em>`).join('; ')}</p>` : ''}
${n.voice && n.voice.silences ? `<p><strong>Silences:</strong> ${escapeHtml(n.voice.silences)}</p>` : ''}
${exampleLines.length ? `<h3>Example lines</h3>${exampleLines.map(l => `<blockquote>${escapeHtml(l)}</blockquote>`).join('\n')}` : ''}

${n.background ? `<h2>Background</h2>${para(n.background)}` : ''}

${n.drives ? `<h2>Drives</h2>
<ul class="loose">
  ${n.drives.wants ? `<li><strong>Wants:</strong> ${escapeHtml(n.drives.wants)}</li>` : ''}
  ${n.drives.fears ? `<li><strong>Fears:</strong> ${escapeHtml(n.drives.fears)}</li>` : ''}
  ${n.drives.secret ? `<li><strong>Secret:</strong> ${escapeHtml(n.drives.secret)}</li>` : ''}
</ul>` : ''}

${rels ? `<h2>Relationships</h2><ul class="loose">${rels}</ul>` : ''}

${Object.keys(opinions).length ? `<h2>Opinions</h2>
${opinions.on_the_player ? `<p><strong>On the player:</strong> ${escapeHtml(opinions.on_the_player)}</p>` : ''}
${opinions.on_other_regions ? `<p><strong>On other regions:</strong> ${typeof opinions.on_other_regions === 'string' ? escapeHtml(opinions.on_other_regions) : JSON.stringify(opinions.on_other_regions)}</p>` : ''}
${opinions.on_quests ? `<p><strong>On quests:</strong> ${escapeHtml(opinions.on_quests)}</p>` : ''}` : ''}

${Object.keys(dpat).length ? `<h2>Dialogue patterns</h2>
${dpat.greeting_first ? `<p><strong>Greeting (stranger):</strong> <em>${escapeHtml(dpat.greeting_first)}</em></p>` : ''}
${dpat.greeting_regular ? `<p><strong>Greeting (regular):</strong> <em>${escapeHtml(dpat.greeting_regular)}</em></p>` : ''}
${dpat.rejects_request ? `<p><strong>Refusal:</strong> <em>${escapeHtml(dpat.rejects_request)}</em></p>` : ''}
${dpat.accepts_help ? `<p><strong>Acceptance:</strong> <em>${escapeHtml(dpat.accepts_help)}</em></p>` : ''}
${dpat.breakthrough_moment ? `<p><strong>Breakthrough:</strong> <em>${escapeHtml(dpat.breakthrough_moment)}</em></p>` : ''}
${dpat.farewell ? `<p><strong>Farewell:</strong> <em>${escapeHtml(dpat.farewell)}</em></p>` : ''}` : ''}

<p><a href="npcs.html">← all npcs</a></p>
`;
    fs.writeFileSync(path.join(OUT_DIR, `npc-${id}.html`), page(n.name || id, body));
    counts.npcs++;
  }
  // NPC index
  const grouped = {};
  for (const n of list) {
    const r = n.region || 'unknown';
    (grouped[r] = grouped[r] || []).push(n);
  }
  const body = `
<h1>NPCs of Aelgard</h1>
<div class="description">${list.length} authored NPC personality bibles. Each is dialogue-ready for the Ollama-driven dialogue system.</div>
${Object.entries(grouped).sort().map(([region, npcs]) => `
<h2>${escapeHtml(region)}</h2>
<table style="width:100%; border-collapse:collapse">
<tr style="background:#d4c49c"><th align="left" style="padding:6px">Name</th><th align="left">Title</th><th align="left">Role</th><th align="left">Archetype</th></tr>
${npcs.map(n => `<tr style="border-bottom:1px solid #c4a970"><td style="padding:6px"><a href="npc-${n.id || slug(n.name)}.html"><strong>${escapeHtml(n.name)}</strong></a></td><td>${escapeHtml(n.title_shown_to_players || '')}</td><td>${escapeHtml(n.role || '')}</td><td><small>${escapeHtml(n.archetype || '')}</small></td></tr>`).join('\n')}
</table>
`).join('\n')}
`;
  fs.writeFileSync(path.join(OUT_DIR, 'npcs.html'), page('NPCs', body));
}

// ── Lore pages ───────────────────────────────────────────────────────────────
function writeLorePages() {
  if (!lore) return;
  const regions = lore.regions || [];
  const bosses = lore.bosses || [];
  const prestige = lore.prestige_goals || [];
  const items = lore.signature_items || [];

  for (const r of regions) {
    const factions = (r.factions || []).map(f => `<li><strong>${escapeHtml(f.name)}</strong> — ${escapeHtml(f.description || '')}${f.attitude_to_player ? ` (${escapeHtml(f.attitude_to_player)})` : ''}</li>`).join('\n');
    const landmarks = (r.landmarks || []).map(l => `<li><strong>${escapeHtml(l.name)}</strong> — ${escapeHtml(l.description || '')}${l.secret ? ` <em>(secret: ${escapeHtml(l.secret)})</em>` : ''}</li>`).join('\n');
    const body = `
<h1>${escapeHtml(r.name || r.id)}</h1>
${r.tagline ? `<div class="description">${escapeHtml(r.tagline)}</div>` : ''}
${r.history_long ? `<h2>History</h2>${para(r.history_long)}` : ''}
${r.current_state ? `<h2>Now</h2>${para(r.current_state)}` : ''}
${r.geography ? `<h2>Geography</h2>${para(r.geography)}` : ''}
${factions ? `<h2>Factions</h2><ul class="loose">${factions}</ul>` : ''}
${landmarks ? `<h2>Landmarks</h2><ul class="loose">${landmarks}</ul>` : ''}
${r.weather || r.colors || r.music_mood ? `<h2>Atmosphere</h2>
<ul class="loose">
  ${r.weather ? `<li><strong>Weather:</strong> ${escapeHtml(r.weather)}</li>` : ''}
  ${r.colors ? `<li><strong>Colors:</strong> ${escapeHtml(r.colors)}</li>` : ''}
  ${r.music_mood ? `<li><strong>Music:</strong> ${escapeHtml(r.music_mood)}</li>` : ''}
</ul>` : ''}
<p><a href="region-${r.id}.html">← gameplay-side region page</a> · <a href="lore.html">all regions</a></p>
`;
    fs.writeFileSync(path.join(OUT_DIR, `lore-${r.id}.html`), page(r.name || r.id, body));
    counts.regions++;
  }

  for (const b of bosses) {
    const body = `
<h1>${escapeHtml(b.name)}</h1>
<div class="meta"><span>${escapeHtml(b.region || '')}</span><span>tier ${escapeHtml(String(b.tier || ''))}</span></div>
${b.bestiary ? `<h2>Bestiary</h2>${para(b.bestiary)}` : ''}
${b.kill_cry ? `<blockquote>${escapeHtml(b.kill_cry)}</blockquote>` : ''}
<p><a href="bosses.html">← all bosses</a></p>
`;
    fs.writeFileSync(path.join(OUT_DIR, `boss-${b.id || slug(b.name)}.html`), page(b.name, body));
    counts.bosses++;
  }

  // Lore index
  const lorebody = `
<h1>The Lore of Aelgard</h1>
<div class="description">Region histories, boss bestiaries, prestige goals, signature items.</div>

<h2>Regions</h2>
<ul class="loose">
${regions.map(r => `<li><a href="lore-${r.id}.html"><strong>${escapeHtml(r.name)}</strong></a> — ${escapeHtml(r.tagline || '')}</li>`).join('\n')}
</ul>

<h2>Prestige Goals</h2>
<ul class="loose">
${prestige.map(p => `<li><strong>${escapeHtml(p.name)}</strong> (${escapeHtml(p.region || '')}) — ${escapeHtml((p.description || '').slice(0, 200))}</li>`).join('\n')}
</ul>

<h2>Signature Items</h2>
<ul class="loose">
${items.map(i => `<li><strong>${escapeHtml(i.name)}</strong> (${escapeHtml(i.region || '')}) — ${escapeHtml((i.description || '').slice(0, 200))}</li>`).join('\n')}
</ul>
`;
  fs.writeFileSync(path.join(OUT_DIR, 'lore.html'), page('Lore', lorebody));

  // Bosses index
  const bossesbody = `
<h1>The Bestiary</h1>
<div class="description">Tier 1 to tier 5. Crystal Wyrm at the apex.</div>
<table style="width:100%; border-collapse:collapse">
<tr style="background:#d4c49c"><th align="left" style="padding:6px">Name</th><th align="left">Region</th><th align="left">Tier</th></tr>
${bosses.sort((a, b) => (a.tier || 0) - (b.tier || 0)).map(b => `<tr style="border-bottom:1px solid #c4a970"><td style="padding:6px"><a href="boss-${b.id || slug(b.name)}.html"><strong>${escapeHtml(b.name)}</strong></a></td><td>${escapeHtml(b.region || '')}</td><td>${escapeHtml(String(b.tier || ''))}</td></tr>`).join('\n')}
</table>
`;
  fs.writeFileSync(path.join(OUT_DIR, 'bosses.html'), page('Bestiary', bossesbody));

  counts.prestige = prestige.length;
  counts.items = items.length;
}

writeQuestPages();
writeNpcPages();
writeLorePages();

console.log(`[codex-lore] wrote ${counts.quests} quest pages, ${counts.npcs} NPC pages, ${counts.regions} region lore pages, ${counts.bosses} boss bestiary pages.`);
console.log(`[codex-lore] indexes: lore.html, npcs.html, bosses.html (re)written; quests.html overlaid with narrative links.`);
