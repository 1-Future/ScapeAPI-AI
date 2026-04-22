// H15 comprehensive zero-drop audit: match the original drop-table-coverage.md methodology
// Check every combat monster (hp>0, maxHit>0) across all content files for drop presence.
const fs = require('fs');
const path = require('path');

function balancedParenEnd(content, start) {
  let depth = 0, inStr = false, strCh = '';
  for (let j = start; j < content.length; j++) {
    const c = content[j];
    if (inStr) { if (c === strCh && content[j - 1] !== '\\') inStr = false; continue; }
    if (c === "'" || c === '"' || c === '`') { inStr = true; strCh = c; continue; }
    if (c === '(' || c === '{' || c === '[') depth++;
    else if (c === ')' || c === '}' || c === ']') {
      if (depth === 0 && c === ')') return j;
      depth--;
    }
  }
  return -1;
}

function findCalls(content, funcName, allowPrefix) {
  const results = [];
  let i = 0;
  while (i < content.length) {
    const m = content.indexOf(funcName + '(', i);
    if (m === -1) break;
    if (m > 0) {
      const prev = content[m - 1];
      if (/[a-zA-Z0-9_]/.test(prev)) {
        // allow if preceded by npcs. or similar for defineNpc
        if (!allowPrefix) { i = m + funcName.length + 1; continue; }
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
      const cbM = inner.match(/\bcombat\s*:\s*(\d+)/);
      const hpM = inner.match(/\bmaxHp\s*:\s*(\d+)/);
      const mhM = inner.match(/\bmaxHit\s*:\s*(\d+)/);
      const hasDialog = /\bdialogue\s*:\s*{/.test(inner);
      const hasDrops = / drops\s*:\s*\[/.test(inner) || / main\s*:\s*\[/.test(inner) || / always\s*:\s*\[/.test(inner);
      results.push({
        id: idM[1], args: commas + 1,
        cb: cbM ? +cbM[1] : 0,
        hp: hpM ? +hpM[1] : 0,
        maxHit: mhM ? +mhM[1] : 0,
        hasDialog, hasDropsInline: hasDrops,
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
  combatMonsters: 0,
  withAnyDrops: 0,
  zeroDrops: 0,
  zeroDropIds: [],
  zeroDropByFile: {},
  zeroDropByRegion: {},
};

function inferRegion(filename) {
  const fn = filename.toLowerCase();
  if (fn.includes('heart')) return 'heartlands';
  if (fn.includes('mory')) return 'moryskah';
  if (fn.includes('salt')) return 'saltbrine';
  if (fn.includes('bone')) return 'boneyard';
  if (fn.includes('glass')) return 'glass_desert';
  if (fn.includes('soot')) return 'sootworks';
  if (fn.includes('veil')) return 'veilwood';
  if (fn.includes('ink')) return 'inkweald';
  if (fn.includes('wild')) return 'wilds';
  if (fn.includes('raid')) return 'raid';
  if (fn.includes('dungeon')) return 'dungeon';
  if (fn.includes('slayer')) return 'slayer';
  if (fn.includes('combat-challenge')) return 'combat-challenge';
  if (fn.includes('minigames')) return 'minigames';
  return 'unknown';
}

for (const dir of dirs) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.js') && !f.includes('mega')); // skip monsters-mega (other agent lane)
  for (const f of files) {
    const filePath = path.join(dir, f);
    const content = fs.readFileSync(filePath, 'utf8');
    const region = inferRegion(f);

    // mob() and boss()
    for (const c of findCalls(content, 'mob')) {
      if (c.hp > 0 && c.maxHit >= 0) { // all mobs count as combat
        summary.combatMonsters++;
        const hasDrops = c.args >= 3;
        if (hasDrops) summary.withAnyDrops++;
        else {
          summary.zeroDrops++;
          summary.zeroDropIds.push({ file: f, id: c.id, cb: c.cb, kind: 'mob' });
          summary.zeroDropByFile[f] = (summary.zeroDropByFile[f] || 0) + 1;
          summary.zeroDropByRegion[region] = (summary.zeroDropByRegion[region] || 0) + 1;
        }
      }
    }
    for (const c of findCalls(content, 'boss')) {
      summary.combatMonsters++;
      const hasDrops = c.args >= 3;
      if (hasDrops) summary.withAnyDrops++;
      else {
        summary.zeroDrops++;
        summary.zeroDropIds.push({ file: f, id: c.id, cb: c.cb, kind: 'boss' });
        summary.zeroDropByFile[f] = (summary.zeroDropByFile[f] || 0) + 1;
        summary.zeroDropByRegion[region] = (summary.zeroDropByRegion[region] || 0) + 1;
      }
    }
    // defineNpc: only count if combat (hp>0, maxHit>0) and no dialogue
    for (const c of findCalls(content, 'defineNpc', true)) {
      if (c.hp > 0 && c.maxHit > 0 && !c.hasDialog) {
        summary.combatMonsters++;
        if (hasDroptablesDefine(content, c.id)) summary.withAnyDrops++;
        else {
          summary.zeroDrops++;
          summary.zeroDropIds.push({ file: f, id: c.id, cb: c.cb, kind: 'defineNpc' });
          summary.zeroDropByFile[f] = (summary.zeroDropByFile[f] || 0) + 1;
          summary.zeroDropByRegion[region] = (summary.zeroDropByRegion[region] || 0) + 1;
        }
      }
    }
  }
}

console.log('\n=== H15 COMPREHENSIVE AUDIT ===');
console.log('Total combat monsters (hp>0, maxHit>0):', summary.combatMonsters);
console.log('With any drops:', summary.withAnyDrops);
console.log('Zero drops:', summary.zeroDrops);
console.log('Zero-drop rate:', ((summary.zeroDrops / summary.combatMonsters) * 100).toFixed(1) + '%');

console.log('\nBy file (top 20):');
const sorted = Object.entries(summary.zeroDropByFile).sort((a, b) => b[1] - a[1]);
for (const [f, n] of sorted.slice(0, 20)) console.log(`  ${f}: ${n}`);

console.log('\nBy region:');
for (const [r, n] of Object.entries(summary.zeroDropByRegion)) console.log(`  ${r}: ${n}`);

fs.writeFileSync('reports/_h15_audit.json', JSON.stringify(summary, null, 2));
console.log('\nWritten to reports/_h15_audit.json');
