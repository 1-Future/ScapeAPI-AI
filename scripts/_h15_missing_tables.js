// Find combat defineNpc/boss calls in a specific file that don't have a droptables.define
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

const files = [
  'src/content/aelgard/raids.js',
  'src/content/aelgard/raids-mega1.js',
  'src/content/aelgard/raids-mega2.js',
  'src/content/aelgard/raids-bosses-mega.js',
  'src/content/aelgard/combat-challenges.js',
  'src/content/aelgard/minigames.js',
  'src/content/aelgard/minigames-mega.js',
  'src/content/aelgard/minigames-scapified.js',
];

const totalBy = {};
for (const f of files) {
  if (!fs.existsSync(f)) continue;
  const c = fs.readFileSync(f, 'utf8');
  let i = 0, missing = [];
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
      if (!re.test(c)) missing.push(id);
    }
    i = e + 1;
  }
  totalBy[f] = missing;
  if (missing.length) {
    console.log(f + ':', missing.length, 'missing tables');
    for (const id of missing) console.log('   -', id);
  }
}
