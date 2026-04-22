// Check all combat defineNpc calls across content for missing droptables
const fs = require('fs');
const path = require('path');

function balanced(content, start) {
  let depth = 0, inS = false, sc = '';
  for (let j = start; j < content.length; j++) {
    const c = content[j];
    if (inS) { if (c === sc && content[j - 1] !== '\\') inS = false; continue; }
    if (c === "'" || c === '"' || c === '`') { inS = true; sc = c; continue; }
    if (c === '(' || c === '{' || c === '[') depth++;
    else if (c === ')' || c === '}' || c === ']') {
      if (depth === 0 && c === ')') return j;
      depth--;
    }
  }
  return -1;
}

const dir = 'src/content/aelgard';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

let total = 0;
const perFile = {};
for (const f of files) {
  const c = fs.readFileSync(path.join(dir, f), 'utf8');
  let i = 0, count = 0;
  while (i < c.length) {
    const m = c.indexOf('defineNpc(', i);
    if (m === -1) break;
    const s = m + 10;
    const e = balanced(c, s);
    if (e < 0) break;
    const inner = c.substring(s, e);
    const idM = inner.match(/^\s*['"]([a-z0-9_]+)['"]/);
    const mhM = inner.match(/\bmaxHit\s*:\s*(\d+)/);
    const hpM = inner.match(/\bmaxHp\s*:\s*(\d+)/);
    const hasDialog = /\bdialogue\s*:\s*{/.test(inner);
    if (idM && mhM && +mhM[1] > 0 && hpM && +hpM[1] > 0 && !hasDialog) {
      const id = idM[1];
      const re = new RegExp(`droptables\\.define\\s*\\(\\s*['"]${id}['"]`);
      if (!re.test(c)) {
        count++;
        if (!perFile[f]) perFile[f] = [];
        perFile[f].push(id);
      }
    }
    i = e + 1;
  }
  total += count;
}
console.log('Total combat defineNpc w/o droptable:', total);
for (const [f, ids] of Object.entries(perFile)) {
  console.log(`${f}: ${ids.length}`);
  for (const id of ids.slice(0, 3)) console.log(`    - ${id}`);
}
