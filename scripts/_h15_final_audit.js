// Final comprehensive H15 audit: count every monster-like definition and classify drop status
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
      const cbM = inner.match(/\bcombat\s*:\s*(\d+)/) || inner.match(/\bcombat_level\s*:\s*(\d+)/);
      const hpM = inner.match(/\bmaxHp\s*:\s*(\d+)/) || inner.match(/\bhp\s*:\s*(\d+)/);
      const mhM = inner.match(/\bmaxHit\s*:\s*(\d+)/) || inner.match(/\bmax_hit\s*:\s*(\d+)/);
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
  if (fn.includes('raid')) return 'raid';
  if (fn.includes('dungeon')) return 'dungeon';
  if (fn.includes('slayer')) return 'slayer';
  if (fn.includes('combat-challenge')) return 'combat-challenge';
  if (fn.includes('minigame')) return 'minigames';
  if (fn.includes('atoms')) return 'atoms';
  if (fn.includes('monsters-mega')) return 'mega-multi';
  return 'unknown';
}

const dirs = ['src/content/aelgard', 'src/atoms/definitions'];
let combatMonsters = 0, withDrops = 0, zeroDrop = 0;
const zeroDropByRegion = {};
const zeroDropIds = [];
const dropsByRegion = {};

for (const dir of dirs) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
  for (const f of files) {
    const filePath = path.join(dir, f);
    const content = fs.readFileSync(filePath, 'utf8');
    const region = inferRegion(f);

    // mob() and boss()
    for (const c of findCalls(content, 'mob')) {
      combatMonsters++;
      if (c.args >= 3) {
        withDrops++;
        dropsByRegion[region] = (dropsByRegion[region] || 0) + 1;
      } else {
        zeroDrop++;
        zeroDropByRegion[region] = (zeroDropByRegion[region] || 0) + 1;
        zeroDropIds.push({ file: f, id: c.id });
      }
    }
    for (const c of findCalls(content, 'boss')) {
      combatMonsters++;
      if (c.args >= 3) {
        withDrops++;
        dropsByRegion[region] = (dropsByRegion[region] || 0) + 1;
      } else {
        zeroDrop++;
        zeroDropByRegion[region] = (zeroDropByRegion[region] || 0) + 1;
        zeroDropIds.push({ file: f, id: c.id });
      }
    }
    // mega() — counts if the file has mega(
    for (const c of findCalls(content, 'mega')) {
      combatMonsters++;
      // mega always calls droptables.define internally
      withDrops++;
      dropsByRegion[region] = (dropsByRegion[region] || 0) + 1;
    }
    // defineNpc: count combat ones
    for (const c of findCalls(content, 'defineNpc', true)) {
      if (c.hp > 0 && c.maxHit > 0 && !c.hasDialog) {
        combatMonsters++;
        if (hasDroptablesDefine(content, c.id)) {
          withDrops++;
          dropsByRegion[region] = (dropsByRegion[region] || 0) + 1;
        } else {
          zeroDrop++;
          zeroDropByRegion[region] = (zeroDropByRegion[region] || 0) + 1;
          zeroDropIds.push({ file: f, id: c.id });
        }
      }
    }
    // atoms-style MONSTERS array in monsters.js and monsters-extended.js
    // These are now all covered by buildLoot(m)
    if (f === 'monsters.js' || f === 'monsters-extended.js') {
      const matches = content.match(/{\s*id:\s*'mob-[^']+'/g);
      if (matches) {
        combatMonsters += matches.length;
        withDrops += matches.length;
        dropsByRegion['atoms'] = (dropsByRegion['atoms'] || 0) + matches.length;
      }
    }
  }
}

console.log('=== FINAL H15 AUDIT ===');
console.log('Total combat monsters:', combatMonsters);
console.log('With drops:', withDrops);
console.log('Zero drops:', zeroDrop);
console.log('Zero-drop rate:', (zeroDrop / combatMonsters * 100).toFixed(1) + '%');
console.log('Drops rate:', (withDrops / combatMonsters * 100).toFixed(1) + '%');

console.log('\nCoverage by region:');
const allRegions = new Set([...Object.keys(dropsByRegion), ...Object.keys(zeroDropByRegion)]);
for (const r of allRegions) {
  const w = dropsByRegion[r] || 0;
  const z = zeroDropByRegion[r] || 0;
  const total = w + z;
  const pct = total > 0 ? (w / total * 100).toFixed(0) + '%' : 'n/a';
  console.log(`  ${r}: ${w}/${total} (${pct})`);
}

if (zeroDrop > 0) {
  console.log('\nZero-drop IDs:');
  for (const z of zeroDropIds.slice(0, 20)) console.log(`  ${z.file}: ${z.id}`);
}

fs.writeFileSync('reports/_h15_final.json', JSON.stringify({
  combatMonsters, withDrops, zeroDrop,
  dropsByRegion, zeroDropByRegion, zeroDropIds,
}, null, 2));
console.log('\nWritten to reports/_h15_final.json');
