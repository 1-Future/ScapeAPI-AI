// ══════════════════════════════════════════════════════════════════════════════
// SMITHING: Every smithable item per metal tier
// ══════════════════════════════════════════════════════════════════════════════

const { define } = require('../mechanic');

const METALS = [
  { metal: 'Bronze',    level: 1,  xpPerBar: 12.5 },
  { metal: 'Iron',      level: 15, xpPerBar: 25 },
  { metal: 'Steel',     level: 30, xpPerBar: 37.5 },
  { metal: 'Mithril',   level: 50, xpPerBar: 50 },
  { metal: 'Adamant',   level: 70, xpPerBar: 62.5 },
  { metal: 'Rune',      level: 85, xpPerBar: 75 },
];

const ITEMS = [
  { suffix: 'dagger',     bars: 1, levelAdd: 0 },
  { suffix: 'axe',        bars: 1, levelAdd: 1 },
  { suffix: 'mace',       bars: 1, levelAdd: 2 },
  { suffix: 'med helm',   bars: 1, levelAdd: 3 },
  { suffix: 'sword',      bars: 1, levelAdd: 4 },
  { suffix: 'dart tips',  bars: 1, levelAdd: 4 },
  { suffix: 'nails',      bars: 1, levelAdd: 4 },
  { suffix: 'scimitar',   bars: 2, levelAdd: 5 },
  { suffix: 'arrowtips',  bars: 1, levelAdd: 5 },
  { suffix: 'longsword',  bars: 2, levelAdd: 6 },
  { suffix: 'knife',      bars: 1, levelAdd: 7 },
  { suffix: 'full helm',  bars: 2, levelAdd: 7 },
  { suffix: 'sq shield',  bars: 2, levelAdd: 8 },
  { suffix: 'warhammer',  bars: 3, levelAdd: 9 },
  { suffix: 'battleaxe',  bars: 3, levelAdd: 10 },
  { suffix: 'chainbody',  bars: 3, levelAdd: 11 },
  { suffix: 'kiteshield', bars: 3, levelAdd: 12 },
  { suffix: '2h sword',   bars: 3, levelAdd: 14 },
  { suffix: 'platelegs',  bars: 3, levelAdd: 16 },
  { suffix: 'plateskirt', bars: 3, levelAdd: 16 },
  { suffix: 'platebody',  bars: 5, levelAdd: 18 },
];

let count = 0;
for (const m of METALS) {
  for (const item of ITEMS) {
    const level = m.level + item.levelAdd;
    if (level > 99) continue;
    const id = `smith-${m.metal.toLowerCase()}-${item.suffix.replace(/\s+/g, '-')}`;
    const name = `Smith ${m.metal} ${item.suffix}`;
    define({
      id, name, type: 'skill',
      requires: { levels: { smithing: level } },
      atoms: {
        periodicAction: { interval: 4, successRate: 1.0, successMessage: `You smith a ${m.metal.toLowerCase()} ${item.suffix}.` },
        xpDrop: { skills: { smithing: m.xpPerBar * item.bars } },
        lootDrop: { table: [{ name: `${m.metal} ${item.suffix}`, weight: 1, min: 1, max: 1 }] },
      },
      config: { bars: item.bars, metal: m.metal }
    });
    count++;
  }
}

console.log(`[defs] Smithing items: ${count} mechanics`);
