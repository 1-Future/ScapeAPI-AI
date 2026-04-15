#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// CODEX SEARCH TESTS
//
// Validates:
//   1. The generated search-index.json has the expected shape.
//   2. The tokeniser exported by codex-search-index.js behaves sanely.
//   3. A re-implementation of the client BM25 scorer produces the expected
//      ranking for known queries (bog witch, moryskah, inferno, etc.).
//   4. Every public/codex/*.html page includes the Search nav link.
//   5. The client search.html page exists and exposes the required hooks.
//
// Run: node scripts/test-codex-search.js
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const INDEX_FILE = path.join(ROOT, 'public', 'codex', 'search-index.json');
const SEARCH_HTML = path.join(ROOT, 'public', 'codex', 'search.html');
const CODEX_DIR = path.join(ROOT, 'public', 'codex');

let passed = 0;
let failed = 0;
function assert(label, cond, detail) {
  const tag = cond ? 'PASS' : 'FAIL';
  console.log(`[${tag}] ${label}${detail !== undefined ? '  ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) : ''}`);
  if (cond) passed++; else failed++;
}

// ── Import the generator's helpers ───────────────────────────────────────────
// The generator runs at require time (it writes search-index.json), so ensure
// we have a fresh index by requiring it (side effect: regenerates). The
// module.exports gives us { tokenise, uniqueSorted, snippet, STOPWORDS }.
delete require.cache[require.resolve('../src/tools/codex-search-index.js')];
const genTools = require('../src/tools/codex-search-index.js');

// ── 1. Tokeniser sanity ──────────────────────────────────────────────────────
{
  const { tokenise, uniqueSorted, snippet, STOPWORDS } = genTools;
  assert('tokenise exported as function', typeof tokenise === 'function');
  assert('uniqueSorted exported as function', typeof uniqueSorted === 'function');
  assert('snippet exported as function', typeof snippet === 'function');
  assert('STOPWORDS is a Set', STOPWORDS instanceof Set);

  const t1 = tokenise("The Bog Witch's Bargain");
  assert('tokenise lowercases and strips punctuation', !t1.some(t => /[A-Z']/.test(t)), t1);
  assert('tokenise removes stopwords', !t1.includes('the'), t1);
  assert('tokenise keeps lore words', t1.includes('bog') && t1.includes('witch') && t1.includes('bargain'), t1);

  const t2 = tokenise('moryskah_swamp-deep');
  assert('tokenise splits underscores and hyphens', t2.includes('moryskah') && t2.includes('swamp') && t2.includes('deep'), t2);

  const t3 = tokenise('a an the and or but it is was');
  assert('tokenise filters all-stopword input to empty', t3.length === 0, t3);

  const t4 = tokenise('');
  assert('tokenise handles empty string', Array.isArray(t4) && t4.length === 0);

  const t5 = tokenise(null);
  assert('tokenise handles null', Array.isArray(t5) && t5.length === 0);

  const u = uniqueSorted(['b', 'a', 'b', 'c', 'a']);
  assert('uniqueSorted returns sorted unique', JSON.stringify(u) === JSON.stringify(['a', 'b', 'c']), u);

  const s1 = snippet('a'.repeat(300));
  assert('snippet clips long text with ellipsis', s1.length <= 205 && s1.endsWith('…'), s1.length);

  const s2 = snippet('short text');
  assert('snippet passes short text through', s2 === 'short text', s2);

  const s3 = snippet(null);
  assert('snippet handles null', s3 === '');
}

// ── 2. Index shape ───────────────────────────────────────────────────────────
assert('search-index.json exists', fs.existsSync(INDEX_FILE));
const raw = fs.readFileSync(INDEX_FILE, 'utf8');
let idx = null;
try { idx = JSON.parse(raw); } catch (e) { /* handled below */ }
assert('search-index.json is valid JSON', idx !== null);

if (idx) {
  assert('index has documents array', Array.isArray(idx.documents) && idx.documents.length > 0, { count: idx.documents?.length });
  assert('index has idf object', idx.idf && typeof idx.idf === 'object', { idfKeys: idx.idf ? Object.keys(idx.idf).length : 0 });
  assert('index has generated timestamp', typeof idx.generated === 'string' && idx.generated.length > 0);
  assert('index has typeCounts', idx.typeCounts && typeof idx.typeCounts === 'object');

  // Every doc has required fields
  const sample = idx.documents.slice(0, 100);
  const allHaveFields = sample.every(d =>
    typeof d.id === 'string' && typeof d.type === 'string' &&
    typeof d.title === 'string' && Array.isArray(d.tokens)
  );
  assert('documents have {id,type,title,tokens}', allHaveFields);

  // Token arrays are unique and sorted (per generator design)
  const firstDocTokens = idx.documents[0].tokens;
  const sortedCheck = [...firstDocTokens].sort((a, b) => a.localeCompare(b));
  assert('document tokens are sorted', JSON.stringify(firstDocTokens) === JSON.stringify(sortedCheck));
  assert('document tokens are unique', new Set(firstDocTokens).size === firstDocTokens.length);

  // Has the expected types
  const types = new Set(idx.documents.map(d => d.type));
  for (const required of ['quest', 'npc', 'training_method', 'breakpoint', 'lore']) {
    assert(`index has ${required} documents`, types.has(required));
  }

  // Known entities present
  const hasBogWitch = idx.documents.some(d => /bog.*witch/i.test(d.title));
  assert('bog witch quest/npc found', hasBogWitch);

  const hasMoryskah = idx.documents.some(d => /moryskah/i.test(d.title) || /moryskah/i.test(d.id));
  assert('moryskah entry found', hasMoryskah);

  const hasInferno = idx.documents.some(d => /inferno/i.test(d.title) || d.tokens.includes('inferno'));
  assert('inferno entry found', hasInferno);

  // IDF positive and finite
  const idfVals = Object.values(idx.idf);
  assert('all IDF values are finite positive', idfVals.every(v => typeof v === 'number' && isFinite(v) && v >= 0), {
    sample: idfVals.slice(0, 3),
  });

  // IDF covers all corpus terms (every token in every doc has an IDF entry)
  let missingIdf = 0;
  for (const d of idx.documents) {
    for (const t of d.tokens) if (idx.idf[t] === undefined) missingIdf++;
  }
  assert('every document token has an IDF entry', missingIdf === 0, { missingIdf });

  // Rare terms have higher IDF than common terms (sanity check BM25 maths)
  const termDocCounts = {};
  for (const d of idx.documents) for (const t of d.tokens) termDocCounts[t] = (termDocCounts[t] || 0) + 1;
  const sortedByDf = Object.entries(termDocCounts).sort((a, b) => a[1] - b[1]);
  const rare = sortedByDf[0];
  const common = sortedByDf[sortedByDf.length - 1];
  assert('rare term has higher IDF than common term',
    idx.idf[rare[0]] > idx.idf[common[0]],
    { rare: `${rare[0]}=${idx.idf[rare[0]]}`, common: `${common[0]}=${idx.idf[common[0]]}` });

  // ── 3. Simulate client BM25 scorer — ensure expected ranking ────────────
  const BM25_K1 = 1.2, BM25_B = 0.75;
  const AVG_LEN = idx.documents.reduce((n, d) => n + d.tokens.length, 0) / idx.documents.length;

  function scoreDoc(doc, queryTokens) {
    const set = doc._set || (doc._set = new Set(doc.tokens));
    let score = 0, matched = 0;
    for (const qt of queryTokens) {
      if (!set.has(qt)) continue;
      matched++;
      const idf = idx.idf[qt] || 0;
      const dl = doc.tokens.length || 1;
      const norm = 1 - BM25_B + BM25_B * (dl / AVG_LEN);
      const tfNorm = (1 * (BM25_K1 + 1)) / (1 + BM25_K1 * norm);
      score += idf * tfNorm;
    }
    const titleLower = doc.title.toLowerCase();
    for (const qt of queryTokens) if (titleLower.includes(qt)) score += 1.5;
    if (matched > 1) score *= 1 + 0.12 * (matched - 1);
    return { score, matched };
  }

  function searchSim(query) {
    const qTokens = genTools.tokenise(query);
    const hits = [];
    for (const d of idx.documents) {
      const { score, matched } = scoreDoc(d, qTokens);
      if (matched > 0) hits.push({ d, score });
    }
    hits.sort((a, b) => b.score - a.score);
    return hits.slice(0, 30);
  }

  // Known queries → expected entity match
  {
    const hits = searchSim('bog witch');
    assert('query "bog witch" returns results', hits.length > 0, { count: hits.length });
    const top3 = hits.slice(0, 3).map(h => h.d.title.toLowerCase());
    assert('query "bog witch" ranks bog witch entities top 3',
      top3.some(t => /bog/.test(t) && /witch/.test(t)), top3);
  }
  {
    const hits = searchSim('moryskah');
    assert('query "moryskah" returns results', hits.length > 0);
    const top1 = hits[0]?.d;
    assert('query "moryskah" top hit is moryskah-related',
      top1 && (/moryskah/i.test(top1.title) || /moryskah/i.test(top1.id)),
      top1 && { title: top1.title, id: top1.id });
  }
  {
    const hits = searchSim('prayer');
    assert('query "prayer" returns results', hits.length > 0);
    // Should bring up prayer skills, prayer training methods, prayer breakpoints
    const types = new Set(hits.map(h => h.d.type));
    assert('query "prayer" spans multiple entity types', types.size >= 2, [...types]);
  }
  {
    const hits = searchSim('infernal cape');
    assert('query "infernal cape" returns results', hits.length > 0);
    // Best hit is probably a breakpoint, quest, or signature item
    assert('query "infernal cape" top hit mentions inferno/infernal',
      hits[0] && /infer/i.test(hits[0].d.title + ' ' + (hits[0].d.snippet || '')),
      hits[0] && hits[0].d.title);
  }
  {
    const hits = searchSim('');
    assert('empty query returns zero hits', hits.length === 0);
  }
  {
    const hits = searchSim('xyzzyqwerty');
    assert('nonsense query returns zero hits', hits.length === 0);
  }
  {
    // Two-term queries should reward coverage
    const single = searchSim('witch');
    const dual = searchSim('bog witch');
    // At least one shared top candidate where the 2-term score dominates
    const bogWitchDoc = idx.documents.find(d => /bog/i.test(d.title) && /witch/i.test(d.title));
    if (bogWitchDoc) {
      const sSingle = scoreDoc(bogWitchDoc, genTools.tokenise('witch')).score;
      const sDual   = scoreDoc(bogWitchDoc, genTools.tokenise('bog witch')).score;
      assert('two-term query scores higher than single term for matching doc', sDual > sSingle,
        { single: sSingle.toFixed(2), dual: sDual.toFixed(2) });
    } else {
      assert('two-term coverage bonus (skipped — no bog witch doc)', true);
    }
  }

  // ── 4. Size sanity ─────────────────────────────────────────────────────
  const sizeKb = fs.statSync(INDEX_FILE).size / 1024;
  assert('index size under 5 MB', sizeKb < 5 * 1024, { sizeKb: sizeKb.toFixed(1) });
  assert('index has >=500 documents', idx.documents.length >= 500, { count: idx.documents.length });
}

// ── 5. search.html presence & hooks ──────────────────────────────────────────
assert('search.html exists', fs.existsSync(SEARCH_HTML));
const searchHtml = fs.readFileSync(SEARCH_HTML, 'utf8');
assert('search.html loads search-index.json', searchHtml.includes('search-index.json'));
assert('search.html references BM25', /BM25/i.test(searchHtml));
assert('search.html has #query input', /id="query"/.test(searchHtml));
assert('search.html has #results container', /id="results"/.test(searchHtml));
assert('search.html has filter chips container', /id="filters"/.test(searchHtml));
assert('search.html supports #q=… hash', /#q=|q=/.test(searchHtml) && /parseHash/.test(searchHtml));
assert('search.html exposes __CodexSearch test hook', /__CodexSearch/.test(searchHtml));
assert('search.html uses parchment palette', /#e8dcc0/.test(searchHtml) && /#7a1f1a/.test(searchHtml));
assert('search.html contains no emoji chars (Unicode > U+2700 block test)',
  !/[\uD83C-\uDBFF][\uDC00-\uDFFF]|\u26A0|\u2699/.test(searchHtml));

// ── 6. Nav link present on every codex page ──────────────────────────────────
{
  const files = fs.readdirSync(CODEX_DIR).filter(f => f.endsWith('.html'));
  assert('codex has >= 100 HTML pages', files.length >= 100, { count: files.length });
  let missing = 0, missingExamples = [];
  for (const f of files) {
    const content = fs.readFileSync(path.join(CODEX_DIR, f), 'utf8');
    if (!/href="search\.html"/.test(content)) {
      missing++;
      if (missingExamples.length < 5) missingExamples.push(f);
    }
  }
  assert('every codex HTML page links to search.html', missing === 0, { missing, missingExamples });
}

// ── 7. Generator is idempotent ──────────────────────────────────────────────
{
  const before = fs.readFileSync(INDEX_FILE);
  delete require.cache[require.resolve('../src/tools/codex-search-index.js')];
  require('../src/tools/codex-search-index.js');
  const after = fs.readFileSync(INDEX_FILE);
  // Compare documents and idf — the generated timestamp will differ, so parse
  const b = JSON.parse(before);
  const a = JSON.parse(after);
  assert('generator is idempotent on documents',
    JSON.stringify(a.documents) === JSON.stringify(b.documents));
  assert('generator is idempotent on idf',
    JSON.stringify(a.idf) === JSON.stringify(b.idf));
}

// ── Summary ─────────────────────────────────────────────────────────────────
console.log('');
console.log(`${passed} passed, ${failed} failed (${passed + failed} total)`);
process.exit(failed === 0 ? 0 : 1);
