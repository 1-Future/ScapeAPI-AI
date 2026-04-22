// H15: Find remaining zero-drop mobs/bosses/defineNpcs across key files
const fs = require('fs');
const path = require('path');

function balancedParenEnd(content, start) {
  let depth = 0, inStr = false, strCh = '';
  for (let j = start; j < content.length; j++) {
    const c = content[j];
    if (inStr) {
      if (c === strCh && content[j - 1] !== '\\') inStr = false;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') { inStr = true; strCh = c; continue; }
    if (c === '(' || c === '{' || c === '[') depth++;
    else if (c === ')' || c === '}' || c === ']') {
      if (depth === 0 && c === ')') return j;
      depth--;
    }
  }
  return -1;
}

function countCommas(s) {
  let d = 0, inS = false, sc = '', c2 = 0;
  for (let j = 0; j < s.length; j++) {
    const c = s[j];
    if (inS) { if (c === sc && s[j - 1] !== '\\') inS = false; continue; }
    if (c === "'" || c === '"' || c === '`') { inS = true; sc = c; continue; }
    if (c === '(' || c === '{' || c === '[') d++;
    else if (c === ')' || c === '}' || c === ']') d--;
    else if (c === ',' && d === 0) c2++;
  }
  return c2;
}

function findCalls(content, funcName) {
  const results = [];
  let i = 0;
  while (i < content.length) {
    const m = content.indexOf(funcName + '(', i);
    if (m === -1) break;
    if (m > 0 && /[a-zA-Z0-9_]/.test(content[m - 1])) { i = m + funcName.length + 1; continue; }
    const start = m + funcName.length + 1;
    const end = balancedParenEnd(content, start);
    if (end < 0) { i = m + 1; continue; }
    const inner = content.substring(start, end);
    const commas = countCommas(inner);
    const idM = inner.match(/^\s*['"]([a-z0-9_]+)['"]/);
    if (idM) {
      results.push({ id: idM[1], args: commas + 1, start: m, end, callStart: start, callEnd: end });
    }
    i = end + 1;
  }
  return results;
}

const dir = 'src/content/aelgard';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
const report = {};

for (const f of files) {
  const filePath = path.join(dir, f);
  const content = fs.readFileSync(filePath, 'utf8');
  const mobs = findCalls(content, 'mob').filter(c => c.args === 2);
  const bosses = findCalls(content, 'boss').filter(c => c.args === 2);
  if (mobs.length + bosses.length > 0) {
    report[f] = { mobs: mobs.map(c => c.id), bosses: bosses.map(c => c.id) };
  }
}

console.log(JSON.stringify(report, null, 2));
let total = 0;
for (const f in report) {
  const n = report[f].mobs.length + report[f].bosses.length;
  total += n;
}
console.log('\nTOTAL mob/boss zero-drop calls:', total);
