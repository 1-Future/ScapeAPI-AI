const fs = require('fs');
const c = fs.readFileSync('src/content/aelgard/slayer-expansion.js', 'utf8');
function balanced(content, start) {
  let depth = 0, inS = false, sc = '';
  for (let j = start; j < content.length; j++) {
    const ch = content[j];
    if (inS) { if (ch === sc && content[j - 1] !== '\\') inS = false; continue; }
    if (ch === "'" || ch === '"' || ch === '`') { inS = true; sc = ch; continue; }
    if (ch === '(' || ch === '{' || ch === '[') depth++;
    else if (ch === ')' || ch === '}' || ch === ']') {
      if (depth === 0 && ch === ')') return j;
      depth--;
    }
  }
  return -1;
}
let i = 0, missing = [];
while (i < c.length) {
  const m = c.indexOf('mob(', i);
  if (m === -1) break;
  if (m > 0 && /[a-zA-Z0-9_]/.test(c[m - 1])) { i = m + 4; continue; }
  const s = m + 4;
  const e = balanced(c, s);
  if (e < 0) break;
  const inner = c.substring(s, e);
  let commas = 0, d = 0, inS = false, sc = '';
  for (let j = 0; j < inner.length; j++) {
    const ch = inner[j];
    if (inS) { if (ch === sc && inner[j - 1] !== '\\') inS = false; continue; }
    if (ch === "'" || ch === '"' || ch === '`') { inS = true; sc = ch; continue; }
    if (ch === '(' || ch === '{' || ch === '[') d++;
    else if (ch === ')' || ch === '}' || ch === ']') d--;
    else if (ch === ',' && d === 0) commas++;
  }
  const idM = inner.match(/^\s*['"]([a-z0-9_]+)['"]/);
  if (idM && commas + 1 === 2) missing.push(idM[1]);
  i = e + 1;
}
console.log('Missing drops in slayer-expansion.js:', missing);
