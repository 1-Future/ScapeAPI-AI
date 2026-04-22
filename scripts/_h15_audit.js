// H15 audit: comprehensive zero-drop audit matching the original drop-table-coverage.md
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

function findCalls(content, funcName) {
  const results = [];
  let i = 0;
  while (i < content.length) {
    const m = content.indexOf(funcName + '(', i);
    if (m === -1) break;
    if (m > 0) {
      const prev = content[m - 1];
      if (/[a-zA-Z0-9_]/.test(prev)) {
        // allow 'npcs.defineNpc'
        const ctx = content.substring(Math.max(0, m - 10), m);
        if (!ctx.endsWith('npcs.') && !ctx.endsWith('.')) { i = m + funcName.length + 1; continue; }
      }
    }
    const start = m + funcName.length + 1;
    const end = balancedParenEnd(content, start);
    if (end < 0) { i = m + 1; continue; }
    const inner = content.substring(start, end);
    let commas = 0, d = 0, s = false, sc = '';
    for (let j = 0; j < inner.length; j++) {
      const c = inner[j];
      if (s) { if (c === sc && inner[j - 1] !== '\\') s = false; continue; }
      if (c === "'" || c === '"' || c === '`') { s = true; sc = c; continue; }
      if (c === '(' || c === '{' || c === '[') d++;
      else if (c === ')' || c === '}' || c === ']') d--;
      else if (c === ',' && d === 0) commas++;
    }
    const idM = inner.match(/^\s*['"]([a-z0-9_]+)['"]/);
    if (idM) {
      // Try to get combat, hp, maxHit
      const cbM = inner.match(/\bcombat\s*:\s*(\d+)/);
      const hpM = inner.match(/\bmaxHp\s*:\s*(\d+)/);
      const mhM = inner.match(/\bmaxHit\s*:\s*(\d+)/);
      const hasDialog = /\bdialogue\s*:\s*{/.test(inner);
      results.push({
        id: idM[1],
        args: commas + 1,
        cb: cbM ? +cbM[1] : 0,
        hp: hpM ? +hpM[1] : 0,
        maxHit: mhM ? +mhM[1] : 0,
        hasDialog,
        start: m,
        end,
      });
    }
    i = end + 1;
  }
  return results;
}

function hasDroptablesDefine(content, id) {
  const re = new RegExp(`droptables\\.define\\s*\\(\\s*['"]${id}['"]`);
  return re.test(content);
}

const dirs = ['src/content/aelgard', 'src/atoms/definitions'];
const summary = {
  totalMob: 0,
  totalBoss: 0,
  totalDefineNpc: 0,
  mobZeroDrops: [],
  bossZeroDrops: [],
  defineNpcCombatNoTable: [],
};

for (const dir of dirs) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
  for (const f of files) {
    const filePath = path.join(dir, f);
    const content = fs.readFileSync(filePath, 'utf8');

    for (const c of findCalls(content, 'mob')) {
      summary.totalMob++;
      if (c.args === 2) summary.mobZeroDrops.push({ file: f, id: c.id, cb: c.cb, hp: c.hp });
    }
    for (const c of findCalls(content, 'boss')) {
      summary.totalBoss++;
      if (c.args === 2) summary.bossZeroDrops.push({ file: f, id: c.id, cb: c.cb, hp: c.hp });
    }
    for (const c of findCalls(content, 'defineNpc')) {
      summary.totalDefineNpc++;
      // Skip if clearly non-combat dialogue NPC
      if (c.hasDialog || c.hp === 0 || c.maxHit === 0) continue;
      if (!hasDroptablesDefine(content, c.id)) {
        summary.defineNpcCombatNoTable.push({ file: f, id: c.id, cb: c.cb, hp: c.hp });
      }
    }
  }
}

console.log('Total mob() calls:', summary.totalMob);
console.log('Total boss() calls:', summary.totalBoss);
console.log('Total defineNpc() calls:', summary.totalDefineNpc);
console.log('Zero-drop mob() calls:', summary.mobZeroDrops.length);
console.log('Zero-drop boss() calls:', summary.bossZeroDrops.length);
console.log('Combat defineNpc w/o droptable:', summary.defineNpcCombatNoTable.length);

console.log('\nMob zero-drops by file:');
const byFile = {};
for (const c of summary.mobZeroDrops) byFile[c.file] = (byFile[c.file] || 0) + 1;
for (const [f, n] of Object.entries(byFile)) console.log(`  ${f}: ${n}`);

console.log('\nBoss zero-drops by file:');
const byFileB = {};
for (const c of summary.bossZeroDrops) byFileB[c.file] = (byFileB[c.file] || 0) + 1;
for (const [f, n] of Object.entries(byFileB)) console.log(`  ${f}: ${n}`);

console.log('\nCombat defineNpc zero-tables by file:');
const byFileN = {};
for (const c of summary.defineNpcCombatNoTable) byFileN[c.file] = (byFileN[c.file] || 0) + 1;
const sortedN = Object.entries(byFileN).sort((a, b) => b[1] - a[1]);
for (const [f, n] of sortedN) console.log(`  ${f}: ${n}`);

fs.writeFileSync('reports/_h15_audit.json', JSON.stringify(summary, null, 2));
console.log('\nWritten to reports/_h15_audit.json');
