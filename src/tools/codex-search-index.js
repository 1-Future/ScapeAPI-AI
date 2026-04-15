#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// CODEX SEARCH INDEX GENERATOR
//
// Walks all authored content (JSON + content .js + relationship registry) and
// produces `public/codex/search-index.json` — a client-side full-text search
// corpus with pre-computed IDF weights.
//
// Client (`public/codex/search.html`) loads the index, tokenises the query,
// scores every document with BM25, and ranks results grouped by entity type.
//
// Regenerate with: node src/tools/codex-search-index.js
//
// Design notes:
//   - No external libs. Vanilla JS tokeniser. Stopword list baked in.
//   - Tokens per doc are deduped + sorted for compression.
//   - Snippet = first ~200 chars of the most narrative field.
//   - IDF = log((N - df + 0.5) / (df + 0.5) + 1)  (BM25 idf variant)
//
// "The Codex is the primary human interface" — v1 plan
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const fs = require('fs');
const path = require('path');

// ── Paths ────────────────────────────────────────────────────────────────────
const ROOT     = path.join(__dirname, '..', '..');
const DATA_DIR = path.join(ROOT, 'data');
const OUT_DIR  = path.join(ROOT, 'public', 'codex');
const OUT_FILE = path.join(OUT_DIR, 'search-index.json');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// ── Stopwords (English ~120 most common, tuned for OSRS/lore prose) ──────────
const STOPWORDS = new Set((
  'a about above after again against all am an and any are as at be because been ' +
  'before being below between both but by can could did do does doing down during ' +
  'each few for from further had has have having he her here hers herself him himself ' +
  'his how i if in into is it its itself just me more most my myself no nor not now ' +
  'of off on once only or other our ours ourselves out over own same she should so ' +
  'some such than that the their theirs them themselves then there these they this ' +
  'those through to too under until up very was we were what when where which while ' +
  'who whom why will with you your yours yourself yourselves also would one two three ' +
  'four five six seven eight nine ten been don theres youre youll ill hes shes ' +
  'thats wont cant wasnt isnt arent wouldnt couldnt shouldnt'
).split(/\s+/).filter(Boolean));

// ── Tokeniser ────────────────────────────────────────────────────────────────
function tokenise(text) {
  if (!text) return [];
  return String(text)
    .toLowerCase()
    .replace(/[_\-]/g, ' ')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .split(/\s+/)
    .filter(t => t && t.length >= 2 && t.length <= 24 && !STOPWORDS.has(t));
}

function uniqueSorted(arr) {
  const set = new Set(arr);
  return [...set].sort();
}

// ── Safe JSON loader ─────────────────────────────────────────────────────────
function readJson(relPath) {
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA_DIR, relPath), 'utf8'));
  } catch (e) {
    console.warn(`[codex-search] could not read ${relPath}: ${e.message}`);
    return null;
  }
}

// ── Snippet helper: pick a narrative field, strip markup, clip to 200 chars ─
function snippet(text, max = 200) {
  if (!text) return '';
  const clean = String(text).replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut) + '…';
}

// ── Corpus ───────────────────────────────────────────────────────────────────
const docs = []; // { id, type, title, snippet, url, tokens }

function addDoc({ id, type, title, snippet: snip, url, text }) {
  if (!id || !type || !title) return;
  const tokens = uniqueSorted(tokenise(text || [title, snip].filter(Boolean).join(' ')));
  docs.push({
    id,
    type,
    title: String(title),
    snippet: snip ? String(snip) : '',
    url: url || '',
    tokens,
  });
}

// ── 1. lore.json — regions, bosses, prestige goals, signature items ─────────
const lore = readJson('lore.json') || {};
for (const r of lore.regions || []) {
  const text = [
    r.name, r.tagline, r.history_long, r.current_state, r.geography,
    ...(r.factions || []).map(f => `${f.name || ''} ${f.description || ''} ${f.attitude_to_player || ''}`),
    ...(r.landmarks || []).map(l => `${l.name || ''} ${l.description || ''} ${l.secret || ''}`),
    r.weather, r.colors, r.music_mood,
  ].filter(Boolean).join(' ');
  addDoc({
    id: `lore:${r.id}`,
    type: 'lore',
    title: r.name || r.id,
    snippet: snippet(r.tagline || r.history_long || r.current_state),
    url: `lore-${r.id}.html`,
    text,
  });
}
for (const b of lore.bosses || []) {
  const id = b.id || b.name;
  const text = [b.name, b.region, b.bestiary, b.kill_cry, b.tier ? `tier ${b.tier}` : ''].filter(Boolean).join(' ');
  addDoc({
    id: `boss:${id}`,
    type: 'boss',
    title: b.name || id,
    snippet: snippet(b.bestiary || b.kill_cry),
    url: `boss-${id}.html`,
    text,
  });
}
for (const p of lore.prestige_goals || []) {
  const id = p.id || p.name;
  const text = [p.name, p.region, p.description, (p.bosses || []).join(' '), (p.uniqueItems || []).join(' ')].filter(Boolean).join(' ');
  addDoc({
    id: `prestige:${id}`,
    type: 'prestige',
    title: p.name || id,
    snippet: snippet(p.description),
    url: `region-${p.region || 'heartlands'}.html`,
    text,
  });
}
for (const i of lore.signature_items || []) {
  const id = i.id || i.name;
  const text = [i.name, i.region, i.description].filter(Boolean).join(' ');
  addDoc({
    id: `signature_item:${id}`,
    type: 'item',
    title: i.name || id,
    snippet: snippet(i.description),
    url: `items.html`,
    text,
  });
}

// ── 2. quest-narratives.json — rich per-quest prose ─────────────────────────
const narratives = readJson('quest-narratives.json');
const narrativeList = Array.isArray(narratives) ? narratives : (narratives?.quests || []);
const narrativeQuestIds = new Set();
for (const q of narrativeList) {
  const id = q.id || (q.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  if (!id) continue;
  narrativeQuestIds.add(id);
  const steps = (q.steps || []).map(s => `${s.objective || ''} ${s.location || ''} ${s.flavor || ''}`).join(' ');
  const dialogue = (q.dialogue_beats || []).map(b => `${b.speaker || ''} ${b.line || ''}`).join(' ');
  const text = [
    q.title, q.hook, q.premise, steps, q.twist, q.resolution, q.unlocks_prose,
    dialogue, q.difficulty, q.length, (q.cross_region || []).join(' '),
  ].filter(Boolean).join(' ');
  addDoc({
    id: `quest:${id}`,
    type: 'quest',
    title: q.title || id,
    snippet: snippet(q.hook || q.premise),
    url: `quest-${id}.html`,
    text,
  });
}

// ── 3. npc-bibles.json — NPC personality bibles ──────────────────────────────
const bibles = readJson('npc-bibles.json');
const npcList = Array.isArray(bibles) ? bibles : (bibles?.npcs || []);
for (const n of npcList) {
  const id = n.id || (n.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  if (!id) continue;
  const voice = n.voice || {};
  const drives = n.drives || {};
  const rels = (n.relationships || []).map(r => `${r.with || ''} ${r.nature || ''}`).join(' ');
  const dpat = n.dialogue_patterns || {};
  const opinions = n.opinions || {};
  const text = [
    n.name, n.title_shown_to_players, n.region, n.location, n.role, n.archetype,
    voice.cadence, voice.vocabulary, voice.silences,
    (voice.example_lines || []).join(' '),
    (voice.verbal_tics || []).join(' '),
    n.background,
    drives.wants, drives.fears, drives.secret,
    rels,
    opinions.on_the_player, opinions.on_quests,
    dpat.greeting_first, dpat.greeting_regular, dpat.rejects_request,
    dpat.accepts_help, dpat.breakthrough_moment, dpat.farewell,
  ].filter(Boolean).join(' ');
  addDoc({
    id: `npc:${id}`,
    type: 'npc',
    title: n.name ? (n.title_shown_to_players ? `${n.name}, ${n.title_shown_to_players}` : n.name) : id,
    snippet: snippet(n.archetype || n.background),
    url: `npc-${id}.html`,
    text,
  });
}

// ── 4. sprite-manifest.json, sprite-palettes.json ────────────────────────────
//    These aren't primary documents, but every region palette and each
//    catalogued sprite family contributes searchable keywords.
const sprites = readJson('sprite-manifest.json') || {};
for (const [cat, catData] of Object.entries(sprites.categories || {})) {
  if (!catData || typeof catData !== 'object') continue;
  const entries = Object.entries(catData.entries || catData.items || catData).filter(([k]) => !k.startsWith('_'));
  for (const [id, def] of entries) {
    if (!def || typeof def !== 'object') continue;
    const text = [id, def.name, def.description, def.region, def.notes].filter(Boolean).join(' ');
    if (!text) continue;
    addDoc({
      id: `sprite:${cat}:${id}`,
      type: 'sprite',
      title: def.name || id,
      snippet: snippet(def.description || def.notes),
      url: `index.html`,
      text: `${cat} ${text}`,
    });
  }
}

const palettes = readJson('sprite-palettes.json') || {};
for (const [region, p] of Object.entries(palettes)) {
  if (region.startsWith('_') || !p || typeof p !== 'object') continue;
  const text = [region, p.mood, p.avoid, (p.dominant || []).join(' '), (p.accent || []).join(' ')].filter(Boolean).join(' ');
  addDoc({
    id: `palette:${region}`,
    type: 'palette',
    title: `${region} palette`,
    snippet: snippet(p.mood),
    url: `region-${region}.html`,
    text,
  });
}

// ── 5. collection-log.json ───────────────────────────────────────────────────
const clog = readJson('collection-log.json') || {};
for (const s of clog.sources || []) {
  const items = (s.items || []).map(i => i.name || '').join(' ');
  const text = [s.name, s.region, s.category, items, s.completionReward || ''].filter(Boolean).join(' ');
  addDoc({
    id: `collection:${s.id}`,
    type: 'collection',
    title: `${s.name} — collection log`,
    snippet: snippet(items || `${s.category} source in ${s.region}`),
    url: s.category === 'boss' ? `boss-${s.id}.html` : `items.html`,
    text,
  });
}

// ── 6. diaries/*.json ────────────────────────────────────────────────────────
const diariesDir = path.join(DATA_DIR, 'diaries');
if (fs.existsSync(diariesDir)) {
  for (const f of fs.readdirSync(diariesDir).filter(x => x.endsWith('.json'))) {
    let d;
    try { d = JSON.parse(fs.readFileSync(path.join(diariesDir, f), 'utf8')); }
    catch (e) { continue; }
    const region = d.region || f.replace('.json', '');
    const tasks = [];
    for (const [tier, tierData] of Object.entries(d.tiers || {})) {
      for (const t of tierData.tasks || []) {
        tasks.push(`${tier}: ${t.description || ''}`);
      }
    }
    const text = [d.name, d.summary, region, tasks.join(' ')].filter(Boolean).join(' ');
    addDoc({
      id: `diary:${region}`,
      type: 'diary',
      title: d.name || `${region} Diary`,
      snippet: snippet(d.summary),
      url: `region-${region}.html`,
      text,
    });
  }
}

// ── 7. animation-manifest.json, audio-manifest.json (lightweight) ───────────
const anim = readJson('animation-manifest.json') || {};
for (const [id, def] of Object.entries(anim.animations || {})) {
  if (!def || typeof def !== 'object') continue;
  const text = [id, def.description, def.category, def.notes].filter(Boolean).join(' ');
  if (!text) continue;
  addDoc({
    id: `animation:${id}`,
    type: 'animation',
    title: id,
    snippet: snippet(def.description),
    url: `index.html`,
    text,
  });
}

const audio = readJson('audio-manifest.json') || {};
// audio-manifest has multiple top-level categories (music, ambient, sfx, vocal)
for (const cat of ['music', 'ambient', 'sfx', 'vocal_stings', 'vocals']) {
  const bucket = audio[cat];
  if (!bucket) continue;
  const entries = Array.isArray(bucket) ? bucket.map((e, i) => [e.id || `${cat}_${i}`, e]) : Object.entries(bucket);
  for (const [id, def] of entries) {
    if (!def || typeof def !== 'object' || id.startsWith('_')) continue;
    const text = [id, cat, def.description, def.mood, def.region, def.trigger, def.notes].filter(Boolean).join(' ');
    if (!text) continue;
    addDoc({
      id: `audio:${cat}:${id}`,
      type: 'audio',
      title: def.name || id,
      snippet: snippet(def.description || def.mood),
      url: `index.html`,
      text,
    });
  }
}

// ── 8. Relationship registry — load content .js to populate rel.* ───────────
const rel = require('../data/relationships');

// Load every content file so the registry is fully populated.
const contentDir = path.join(ROOT, 'src', 'content', 'aelgard');
if (fs.existsSync(contentDir)) {
  for (const f of fs.readdirSync(contentDir).filter(x => x.endsWith('.js'))) {
    try { require(path.join(contentDir, f)); }
    catch (e) { /* content file failed to load — safe to skip */ }
  }
}

// 8a. Training methods
const SKILLS = [
  'attack', 'strength', 'defence', 'hitpoints', 'ranged', 'prayer', 'magic',
  'runecrafting', 'construction', 'agility', 'herblore', 'thieving',
  'crafting', 'fletching', 'slayer', 'hunter', 'mining', 'smithing',
  'fishing', 'cooking', 'firemaking', 'woodcutting', 'farming',
];
for (const skill of SKILLS) {
  for (const m of rel.listMethodsForSkill(skill)) {
    const xp = Array.isArray(m.xpPerHour) ? `${m.xpPerHour[0]} ${m.xpPerHour[1]}` : String(m.xpPerHour);
    const text = [
      m.name, m.description, m.skill, m.location, m.attention, m.complexity,
      m.danger, m.bankingFrequency, `level ${m.levelRange[0]} ${m.levelRange[1]}`,
      `xp ${xp}`, (m.inputs || []).map(i => i.name).join(' '),
    ].filter(Boolean).join(' ');
    addDoc({
      id: `method:${m.id}`,
      type: 'training_method',
      title: m.name,
      snippet: snippet(m.description || `${m.skill} ${m.levelRange[0]}-${m.levelRange[1]} at ${m.location || 'unknown'}`),
      url: `skill-${m.skill}.html`,
      text,
    });
  }
}

// 8b. Breakpoints
for (const skill of SKILLS) {
  for (const bp of rel.getBreakpointsForSkill(skill)) {
    const unlockText = (bp.unlocks || []).map(u => `${u.type || ''} ${u.description || u.id || ''}`).join(' ');
    const text = [
      skill, `level ${bp.trigger.level}`, bp.importance, bp.description, unlockText,
    ].filter(Boolean).join(' ');
    addDoc({
      id: `breakpoint:${skill}:${bp.trigger.level}`,
      type: 'breakpoint',
      title: `${skill} ${bp.trigger.level} — ${bp.importance || 'minor'}`,
      snippet: snippet(bp.description),
      url: `skill-${skill}.html`,
      text,
    });
  }
}

// 8c. Area gates
for (const [areaId, gate] of rel.listAreaGates()) {
  const reqSkills = Object.entries(gate.requires.skills || {}).map(([s, l]) => `${s} ${l}`).join(' ');
  const reqQuests = (gate.requires.quests || []).join(' ');
  const text = [gate.name, gate.description, gate.region, reqSkills, reqQuests].filter(Boolean).join(' ');
  addDoc({
    id: `area:${areaId}`,
    type: 'area',
    title: gate.name || areaId,
    snippet: snippet(gate.description),
    url: gate.region ? `region-${gate.region}.html` : `regions.html`,
    text,
  });
}

// 8d. Quest unlocks — add any quest not already represented via narratives.
for (const [qId, qu] of (function* () {
  // rel doesn't expose a list iterator — reuse getQuestUnlocks against
  // the narrativeQuestIds set + a curated snapshot we can see.
  // We re-require the quest-unlocks module so we can enumerate defined ids.
  try {
    const QU_FILE = path.join(ROOT, 'src', 'content', 'aelgard', 'quest-unlocks.js');
    const src = fs.readFileSync(QU_FILE, 'utf8');
    const ids = new Set();
    const re = /defineQuestUnlock\(\s*['"]([a-z0-9_\-]+)['"]/gi;
    let m;
    while ((m = re.exec(src))) ids.add(m[1]);
    for (const id of ids) {
      const data = rel.getQuestUnlocks(id);
      if (data) yield [id, data];
    }
  } catch (e) { /* skip */ }
})()) {
  if (narrativeQuestIds.has(qId)) {
    // Already covered by quest-narratives; merge unlock keywords into existing doc.
    const existing = docs.find(d => d.id === `quest:${qId}`);
    if (existing) {
      const extra = (qu.unlocks || []).map(u => `${u.type || ''} ${u.description || u.id || ''}`).join(' ');
      const merged = uniqueSorted([...existing.tokens, ...tokenise(extra)]);
      existing.tokens = merged;
    }
    continue;
  }
  const unlockText = (qu.unlocks || []).map(u => `${u.type || ''} ${u.description || u.id || ''}`).join(' ');
  addDoc({
    id: `quest:${qId}`,
    type: 'quest',
    title: qu.name || qId,
    snippet: snippet(unlockText || `Quest: ${qu.name || qId}`),
    url: `quest-${qId}.html`,
    text: `${qu.name || qId} ${unlockText}`,
  });
}

// 8e. Combinations (recipes)
{
  // rel doesn't expose listCombinations — iterate via internal state by
  // probing known result IDs defined in item-ecosystem. Fallback: skip silently.
  try {
    const IE_FILE = path.join(ROOT, 'src', 'content', 'aelgard', 'item-ecosystem.js');
    const src = fs.readFileSync(IE_FILE, 'utf8');
    const ids = new Set();
    const re = /defineCombination\(\s*['"]([a-z0-9_\-]+)['"]/gi;
    let m;
    while ((m = re.exec(src))) ids.add(m[1]);
    for (const rid of ids) {
      const c = rel.getCombination(rid);
      if (!c) continue;
      const inputs = (c.inputs || []).map(i => i.name || i.id || '').join(' ');
      const text = [c.resultName, inputs, c.skill, c.station, c.description, `level ${c.level}`].filter(Boolean).join(' ');
      addDoc({
        id: `recipe:${rid}`,
        type: 'recipe',
        title: c.resultName || rid,
        snippet: snippet(c.description || `${c.skill || ''} level ${c.level} · ${inputs}`),
        url: `items.html`,
        text,
      });
    }
  } catch (e) { /* skip */ }
}

// 8f. Degradable items
for (const [itemId, deg] of rel.listDegradableItems()) {
  const text = [deg.itemName, deg.description, deg.rechargeNpc, deg.revertsTo, `charges ${deg.maxCharges}`].filter(Boolean).join(' ');
  addDoc({
    id: `degradable:${itemId}`,
    type: 'item',
    title: deg.itemName || `item ${itemId}`,
    snippet: snippet(deg.description || `degradable · ${deg.maxCharges} charges`),
    url: `items.html`,
    text,
  });
}

// ── 9. IDF table across the corpus ──────────────────────────────────────────
const df = Object.create(null);
for (const d of docs) {
  for (const t of d.tokens) df[t] = (df[t] || 0) + 1;
}
const N = docs.length || 1;
const idf = Object.create(null);
for (const [t, f] of Object.entries(df)) {
  // BM25 IDF (log-normalised) — always positive because of the +1
  idf[t] = +(Math.log((N - f + 0.5) / (f + 0.5) + 1)).toFixed(4);
}

// ── 10. Sizecheck + write ───────────────────────────────────────────────────
const output = {
  generated: new Date().toISOString(),
  totals: {
    documents: docs.length,
    uniqueTerms: Object.keys(idf).length,
  },
  documents: docs,
  idf,
};

// Ensure types counts for inspection
const typeCounts = {};
for (const d of docs) typeCounts[d.type] = (typeCounts[d.type] || 0) + 1;
output.typeCounts = typeCounts;

fs.writeFileSync(OUT_FILE, JSON.stringify(output));

const bytes = fs.statSync(OUT_FILE).size;
console.log(`[codex-search] wrote ${OUT_FILE}`);
console.log(`[codex-search] ${docs.length} documents, ${Object.keys(idf).length} unique terms, ${(bytes / 1024).toFixed(1)} KB`);
console.log(`[codex-search] types: ${Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}=${v}`).join(', ')}`);

// Export for tests
module.exports = { tokenise, uniqueSorted, snippet, STOPWORDS };
