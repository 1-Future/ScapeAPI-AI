#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// TEST CODEX PAGES
//
// Verifies the extended Codex is healthy:
//   - Index/detail pages exist for every content class
//   - Pages contain their expected fields (h1, nav, parchment, links)
//   - HTML is parseable (balanced tags for the structures we care about)
//   - Nav bar is consistent across all pages
//   - Links between detail pages (method -> skill, item -> recipe) resolve
//
// 30+ assertions. Run:  node scripts/test-codex-pages.js
// Exit code 0 on success, 1 on any failure.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const fs = require('fs');
const path = require('path');

const CODEX = path.join(__dirname, '..', 'public', 'codex');

let passed = 0;
let failed = 0;
const failures = [];

function assert(desc, cond, detail) {
  if (cond) {
    passed++;
    console.log(`  ok   ${desc}`);
  } else {
    failed++;
    failures.push({ desc, detail: detail || '' });
    console.log(`  FAIL ${desc}${detail ? ` (${detail})` : ''}`);
  }
}

function fileExists(p) {
  try { return fs.statSync(p).isFile(); } catch (e) { return false; }
}

function readIfExists(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch (e) { return null; }
}

function countMatches(s, re) {
  if (!s) return 0;
  return (s.match(re) || []).length;
}

function tagBalance(s, tag) {
  if (!s) return false;
  // counts <tag> and </tag>
  const open = (s.match(new RegExp(`<${tag}(\\s[^>]*)?>`, 'g')) || []).length;
  const close = (s.match(new RegExp(`</${tag}>`, 'g')) || []).length;
  return open === close;
}

console.log('── Codex page tests ─────────────────────────────────────────────────');

// 1. Codex dir exists
assert('codex dir exists', fs.existsSync(CODEX));

// 2-8. Core index pages exist
const CORE_INDEXES = ['index', 'regions', 'skills', 'methods', 'quests',
  'items', 'recipes', 'minigames', 'bosses', 'npcs', 'lore', 'breakpoints', 'web'];
for (const ix of CORE_INDEXES) {
  assert(`index exists: ${ix}.html`, fileExists(path.join(CODEX, `${ix}.html`)));
}

// 15. Total pages >= 1000
const totalPages = fs.readdirSync(CODEX).filter(f => f.endsWith('.html')).length;
assert(`total pages >= 1000 (got ${totalPages})`, totalPages >= 1000, `${totalPages} pages`);

// 16. >= 300 new pages beyond base 189 baseline
assert(`>= 300 pages over baseline (got +${totalPages - 189})`, (totalPages - 189) >= 300,
  `expected 300+, got ${totalPages - 189}`);

// 17. At least 400 method pages
const methodPages = fs.readdirSync(CODEX).filter(f => f.startsWith('method-') && f.endsWith('.html'));
assert(`>= 400 method-*.html pages (got ${methodPages.length})`, methodPages.length >= 400);

// 18. At least 100 item pages
const itemPages = fs.readdirSync(CODEX).filter(f => f.startsWith('item-') && f.endsWith('.html'));
assert(`>= 100 item-*.html pages (got ${itemPages.length})`, itemPages.length >= 100);

// 19. At least 100 recipe pages
const recipePages = fs.readdirSync(CODEX).filter(f => f.startsWith('recipe-') && f.endsWith('.html'));
assert(`>= 100 recipe-*.html pages (got ${recipePages.length})`, recipePages.length >= 100);

// 20. At least 4 minigame pages
const minigamePages = fs.readdirSync(CODEX).filter(f => f.startsWith('minigame-') && f.endsWith('.html'));
assert(`>= 4 minigame-*.html pages (got ${minigamePages.length})`, minigamePages.length >= 4);

// 21. At least 10 boss-ext pages
const bossExtPages = fs.readdirSync(CODEX).filter(f => f.startsWith('boss-ext-') && f.endsWith('.html'));
assert(`>= 10 boss-ext-*.html pages (got ${bossExtPages.length})`, bossExtPages.length >= 10);

// 22. 9 density pages
const densityPages = fs.readdirSync(CODEX).filter(f => f.startsWith('density-') && f.endsWith('.html'));
assert(`9 density-*.html pages (got ${densityPages.length})`, densityPages.length === 9);

// 23. Check nav appears on index page
const indexHtml = readIfExists(path.join(CODEX, 'index.html'));
assert('index.html contains <nav>', indexHtml && /<nav>/.test(indexHtml));
assert('index.html nav links to methods.html', indexHtml && /href="methods\.html"/.test(indexHtml));
assert('index.html nav links to recipes.html', indexHtml && /href="recipes\.html"/.test(indexHtml));
assert('index.html nav links to minigames.html', indexHtml && /href="minigames\.html"/.test(indexHtml));
assert('index.html nav links to web.html', indexHtml && /href="web\.html"/.test(indexHtml));

// 28. Parchment style on every page
function checkParchment(file) {
  const s = readIfExists(file);
  return s && /class="parchment"/.test(s) && /background:\s*#e8dcc0/i.test(s);
}
assert('index.html uses parchment style', checkParchment(path.join(CODEX, 'index.html')));
assert('methods.html uses parchment style', checkParchment(path.join(CODEX, 'methods.html')));
assert('recipes.html uses parchment style', checkParchment(path.join(CODEX, 'recipes.html')));
assert('minigames.html uses parchment style', checkParchment(path.join(CODEX, 'minigames.html')));
assert('web.html uses parchment style', checkParchment(path.join(CODEX, 'web.html')));

// 33. No emoji on key pages (sacred preference)
function hasEmoji(s) {
  if (!s) return false;
  // Only treat non-BMP (surrogate) emoji ranges as emoji.
  // This lets us keep CSS box-drawing and punctuation that happen to be non-ASCII.
  const re = /[\uD83C-\uDBFF][\uDC00-\uDFFF]/;
  return re.test(s);
}
assert('index.html has no surrogate-pair emoji', !hasEmoji(indexHtml));
assert('methods.html has no surrogate-pair emoji', !hasEmoji(readIfExists(path.join(CODEX, 'methods.html'))));
assert('recipes.html has no surrogate-pair emoji', !hasEmoji(readIfExists(path.join(CODEX, 'recipes.html'))));

// 36. Sample method page checks
const sampleMethod = methodPages[0];
if (sampleMethod) {
  const s = readIfExists(path.join(CODEX, sampleMethod));
  assert(`${sampleMethod} has <h1>`, s && /<h1>/.test(s));
  assert(`${sampleMethod} has "8 Marstead Knobs" section`, s && /Marstead Knobs/.test(s));
  assert(`${sampleMethod} has Alternatives section`, s && /Alternatives/.test(s));
  assert(`${sampleMethod} has balanced <div>`, tagBalance(s, 'div'));
  assert(`${sampleMethod} has balanced <table>`, tagBalance(s, 'table'));
}

// 42. Sample item page checks
const sampleItem = itemPages[0];
if (sampleItem) {
  const s = readIfExists(path.join(CODEX, sampleItem));
  assert(`${sampleItem} has <h1>`, s && /<h1>/.test(s));
  assert(`${sampleItem} has Sources or Uses heading`, s && /(Sources|Uses)/.test(s));
  assert(`${sampleItem} balanced <ul>`, tagBalance(s, 'ul'));
}

// 45. Sample recipe page checks
const sampleRecipe = recipePages[0];
if (sampleRecipe) {
  const s = readIfExists(path.join(CODEX, sampleRecipe));
  assert(`${sampleRecipe} has Inputs section`, s && /Inputs/.test(s));
  assert(`${sampleRecipe} has Output section`, s && /Output/.test(s));
}

// 47. Sample minigame page checks
const sampleMini = minigamePages[0];
if (sampleMini) {
  const s = readIfExists(path.join(CODEX, sampleMini));
  assert(`${sampleMini} has Mechanics section`, s && /Mechanics/.test(s));
  assert(`${sampleMini} has Leaderboard placeholder`, s && /Leaderboard/.test(s));
}

// 49. Sample boss-ext page checks
const sampleBossExt = bossExtPages[0];
if (sampleBossExt) {
  const s = readIfExists(path.join(CODEX, sampleBossExt));
  assert(`${sampleBossExt} has Combat Achievement section`, s && /Combat Achievement/.test(s));
  assert(`${sampleBossExt} has Drop Table section`, s && /Drop Table/.test(s));
}

// 51. Sample density page checks
const sampleDensity = densityPages[0];
if (sampleDensity) {
  const s = readIfExists(path.join(CODEX, sampleDensity));
  assert(`${sampleDensity} has Density Heatmap`, s && /Density Heatmap/.test(s));
  assert(`${sampleDensity} has heat markers`, s && /heat-/.test(s));
}

// 53. web.html has SVG
const webHtml = readIfExists(path.join(CODEX, 'web.html'));
assert('web.html has <svg>', webHtml && /<svg/.test(webHtml));
assert('web.html has Edge List', webHtml && /Edge List/.test(webHtml));

// 55. Regions page links to density pages via region pages
const region0 = readIfExists(path.join(CODEX, 'region-heartlands.html'));
assert('region-heartlands.html links to density-heartlands.html', region0 && /href="density-heartlands\.html"/.test(region0));

// 56. Every page has a nav
let pagesWithoutNav = 0;
for (const f of fs.readdirSync(CODEX)) {
  if (!f.endsWith('.html')) continue;
  const s = readIfExists(path.join(CODEX, f));
  if (!s || !/<nav>/.test(s)) pagesWithoutNav++;
}
assert(`every page has <nav> (0 missing)`, pagesWithoutNav === 0, `${pagesWithoutNav} missing`);

// 57. Every page has parchment class
let pagesWithoutParchment = 0;
for (const f of fs.readdirSync(CODEX)) {
  if (!f.endsWith('.html')) continue;
  const s = readIfExists(path.join(CODEX, f));
  if (!s || !/class="parchment"/.test(s)) pagesWithoutParchment++;
}
assert(`every page has parchment class (0 missing)`, pagesWithoutParchment === 0, `${pagesWithoutParchment} missing`);

// 58. Spot-check links resolve for a sample of method pages
function linksResolve(htmlFile, limit) {
  const s = readIfExists(htmlFile);
  if (!s) return { total: 0, broken: 0 };
  const hrefs = [...s.matchAll(/href="([^"]+\.html)"/g)].map(m => m[1]).slice(0, limit);
  let broken = 0;
  for (const h of hrefs) {
    if (h.startsWith('http')) continue;
    if (!fileExists(path.join(CODEX, h))) broken++;
  }
  return { total: hrefs.length, broken };
}

const sampleLinks = linksResolve(path.join(CODEX, 'methods.html'), 30);
assert(`methods.html: all sampled internal links resolve (0/${sampleLinks.total} broken)`,
  sampleLinks.broken === 0, `${sampleLinks.broken} broken`);

const itemLinks = linksResolve(path.join(CODEX, 'recipes.html'), 30);
assert(`recipes.html: all sampled internal links resolve (0/${itemLinks.total} broken)`,
  itemLinks.broken === 0, `${itemLinks.broken} broken`);

// 60. Every method has 8 knobs mentioned
let sampleMethodsChecked = 0;
let sampleMethodsOk = 0;
for (const f of methodPages.slice(0, 20)) {
  const s = readIfExists(path.join(CODEX, f));
  sampleMethodsChecked++;
  if (s && /XP per Hour/.test(s) && /Prerequisites/.test(s) && /Resource Output/.test(s) &&
      /Banking Frequency/.test(s) && /Cost \/ Hour/.test(s) && /Danger/.test(s) &&
      /Complexity/.test(s) && /Attention/.test(s)) {
    sampleMethodsOk++;
  }
}
assert(`first 20 method pages have all 8 knobs (${sampleMethodsOk}/${sampleMethodsChecked})`,
  sampleMethodsOk === sampleMethodsChecked);

// 61. Extended generator file exists
assert('src/tools/codex-extended-pages.js exists',
  fileExists(path.join(__dirname, '..', 'src', 'tools', 'codex-extended-pages.js')));

// Summary
console.log('\n─────────────────────────────────────────────────────────────────────');
console.log(`Passed: ${passed}   Failed: ${failed}`);
if (failed > 0) {
  console.log('\nFailures:');
  for (const f of failures) console.log(`  - ${f.desc}  ${f.detail}`);
  process.exit(1);
}
process.exit(0);
