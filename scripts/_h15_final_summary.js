// H15 final summary: match audit methodology from drop-table-coverage.md
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

function findCalls(content, funcName, allowPrefix) {
  const results = [];
  let i = 0;
  while (i < content.length) {
    const m = content.indexOf(funcName + '(', i);
    if (m === -1) break;
    if (m > 0) {
      const prev = content[m - 1];
      if (/[a-zA-Z0-9_]/.test(prev)) {
        if (!allowPrefix) { i = m + funcName.length + 1; continue; }
        const ctx = content.substring(Math.max(0, m - 10), m);
        if (!ctx.endsWith('npcs.') && !ctx.endsWith('.')) { i = m + funcName.length + 1; continue; }
      }
    }
    const start = m + funcName.length + 1;
    const end = balanced(content, start);
    if (end < 0) { i = m + 1; continue; }
    const inner = content.substring(start, end);
    const commas = countCommas(inner);
    const idM = inner.match(/^\s*['"]([a-z0-9_]+)['"]/);
    if (idM) {
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
  if (fn.includes('raid')) return 'raid/multi-region';
  if (fn.includes('dungeon')) return 'dungeon/multi-region';
  if (fn.includes('slayer')) return 'slayer';
  if (fn.includes('combat-challenge')) return 'combat-challenge';
  if (fn.includes('minigame')) return 'minigames';
  if (fn.includes('atoms') || fn === 'monsters.js' || fn === 'monsters-extended.js') return 'unknown/atoms';
  return 'unknown';
}

const result = {
  bestiary: { total: 0, withTable: 0 },
  atoms: { total: 0, withDrops: 0 },
  code: { total: 0, withDrops: 0, zeroDrop: 0 },
  byRegion: {},
  zeroDropIds: [],
};

// Check bestiary coverage
const dt = JSON.parse(fs.readFileSync('data/drop-tables.json', 'utf8'));
const dtIds = new Set(dt.tables.map(t => t.id));
for (const f of fs.readdirSync('data/bestiary').filter(f => f.endsWith('.json'))) {
  const d = JSON.parse(fs.readFileSync('data/bestiary/' + f, 'utf8'));
  for (const m of (d.monsters || [])) {
    result.bestiary.total++;
    if (m.drop_table_id && dtIds.has(m.drop_table_id)) result.bestiary.withTable++;
  }
}

// Atoms coverage
for (const f of ['monsters.js', 'monsters-extended.js']) {
  const c = fs.readFileSync('src/atoms/definitions/' + f, 'utf8');
  const matches = c.match(/{\s*id:\s*'mob-[^']+'/g) || [];
  result.atoms.total += matches.length;
  // Check if buildLoot exists = all have drops
  if (/function\s+buildLoot/.test(c)) result.atoms.withDrops += matches.length;
}

// Code coverage
for (const dir of ['src/content/aelgard']) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
  for (const f of files) {
    const filePath = path.join(dir, f);
    const content = fs.readFileSync(filePath, 'utf8');
    const region = inferRegion(f);

    const check = (c, kind) => {
      // For mob/boss, args >= 3 means has drops. For defineNpc, check droptables.define
      result.code.total++;
      result.byRegion[region] = result.byRegion[region] || { total: 0, withDrops: 0 };
      result.byRegion[region].total++;
      let has = false;
      if (kind === 'mob' || kind === 'boss') {
        has = c.args >= 3;
      } else {
        has = hasDroptablesDefine(content, c.id);
      }
      if (has) {
        result.code.withDrops++;
        result.byRegion[region].withDrops++;
      } else {
        result.code.zeroDrop++;
        result.zeroDropIds.push({ file: f, id: c.id, kind });
      }
    };

    for (const c of findCalls(content, 'mob')) {
      if (c.hp === 0 && c.maxHit === 0) continue; // skip non-combat
      check(c, 'mob');
    }
    for (const c of findCalls(content, 'boss')) check(c, 'boss');
    for (const c of findCalls(content, 'defineNpc', true)) {
      if (c.hp > 0 && c.maxHit > 0 && !c.hasDialog) check(c, 'defineNpc');
    }
    // mega() calls in monsters-mega.js always call droptables.define internally
    for (const c of findCalls(content, 'mega')) {
      result.code.total++;
      result.byRegion[region] = result.byRegion[region] || { total: 0, withDrops: 0 };
      result.byRegion[region].total++;
      result.code.withDrops++;
      result.byRegion[region].withDrops++;
    }
  }
}

const totalMonsters = result.bestiary.total + result.atoms.total + result.code.total;
const totalWithDrops = result.bestiary.withTable + result.atoms.withDrops + result.code.withDrops;
const totalZero = result.code.zeroDrop + (result.bestiary.total - result.bestiary.withTable) + (result.atoms.total - result.atoms.withDrops);

console.log('=== H15 FINAL SUMMARY ===');
console.log('');
console.log('Bestiary:', result.bestiary.withTable + '/' + result.bestiary.total, '(' + (result.bestiary.withTable/result.bestiary.total*100).toFixed(1) + '%)');
console.log('Atoms (monsters.js+extended):', result.atoms.withDrops + '/' + result.atoms.total, '(' + (result.atoms.withDrops/result.atoms.total*100).toFixed(1) + '%)');
console.log('Code (aelgard/):', result.code.withDrops + '/' + result.code.total, '(' + (result.code.withDrops/result.code.total*100).toFixed(1) + '%)');
console.log('');
console.log('TOTAL monsters:', totalMonsters);
console.log('TOTAL with drops:', totalWithDrops);
console.log('TOTAL zero-drop:', totalZero);
console.log('Zero-drop rate:', (totalZero / totalMonsters * 100).toFixed(1) + '%');
console.log('');
console.log('By region:');
for (const [r, d] of Object.entries(result.byRegion).sort((a, b) => b[1].total - a[1].total)) {
  const pct = (d.withDrops / d.total * 100).toFixed(0) + '%';
  console.log(`  ${r}: ${d.withDrops}/${d.total} (${pct})`);
}
if (result.zeroDropIds.length) {
  console.log('\nZero-drop IDs:');
  for (const z of result.zeroDropIds) console.log(`  ${z.file}: ${z.id} (${z.kind})`);
}

fs.writeFileSync('reports/_h15_summary.json', JSON.stringify(result, null, 2));
