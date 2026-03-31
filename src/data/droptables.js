// ── Drop Table System (9.1) ───────────────────────────────────────────────────
// Weighted drop tables with always/main/tertiary separation

const tables = new Map(); // monsterId → { always, main, tertiary }

function define(monsterId, opts) {
  tables.set(monsterId, {
    always: opts.always || [], // always dropped
    main: opts.main || [], // weighted main table
    tertiary: opts.tertiary || [], // rare independent rolls (pet, clue)
  });
}

function roll(monsterId) {
  const table = tables.get(monsterId);
  if (!table) return [];
  const drops = [];

  // Always drops
  for (const d of table.always) {
    const count = d.min + Math.floor(Math.random() * (d.max - d.min + 1));
    if (count > 0) drops.push({ id: d.id, name: d.name, count });
  }

  // Main table (weighted)
  if (table.main.length > 0) {
    const totalWeight = table.main.reduce((s, d) => s + d.weight, 0);
    let r = Math.random() * totalWeight;
    for (const d of table.main) {
      r -= d.weight;
      if (r <= 0) {
        if (d.id === 0) break; // "Nothing" drop
        const count = d.min + Math.floor(Math.random() * (d.max - d.min + 1));
        if (count > 0) drops.push({ id: d.id, name: d.name, count });
        break;
      }
    }
  }

  // Tertiary (independent rolls)
  for (const d of table.tertiary) {
    if (Math.random() < 1 / d.rate) {
      drops.push({ id: d.id, name: d.name, count: d.count || 1 });
    }
  }

  return drops;
}

// ── Define drop tables ────────────────────────────────────────────────────────

define('chicken', {
  always: [{ id: 100, name: 'Bones', min: 1, max: 1 }, { id: 104, name: 'Feather', min: 5, max: 15 }],
  main: [
    { id: 105, name: 'Raw chicken', weight: 10, min: 1, max: 1 },
  ],
});

define('cow', {
  always: [{ id: 100, name: 'Bones', min: 1, max: 1 }, { id: 102, name: 'Cowhide', min: 1, max: 1 }],
  main: [
    { id: 103, name: 'Raw beef', weight: 10, min: 1, max: 1 },
  ],
});

define('goblin', {
  always: [{ id: 100, name: 'Bones', min: 1, max: 1 }],
  main: [
    { id: 101, name: 'Coins', weight: 10, min: 1, max: 5 },
    { id: 270, name: 'Air rune', weight: 3, min: 1, max: 6 },
    { id: 274, name: 'Mind rune', weight: 3, min: 1, max: 4 },
    { id: 0, name: 'Nothing', weight: 5, min: 0, max: 0 },
  ],
  tertiary: [
    { id: 900, name: 'Clue scroll (beginner)', rate: 128, count: 1 },
  ],
});

define('guard', {
  always: [{ id: 100, name: 'Bones', min: 1, max: 1 }],
  main: [
    { id: 101, name: 'Coins', weight: 8, min: 15, max: 60 },
    { id: 212, name: 'Iron ore', weight: 2, min: 1, max: 1 },
    { id: 251, name: 'Iron bar', weight: 1, min: 1, max: 1 },
    { id: 0, name: 'Nothing', weight: 3, min: 0, max: 0 },
  ],
});

define('hill_giant', {
  always: [{ id: 106, name: 'Big bones', min: 1, max: 1 }],
  main: [
    { id: 101, name: 'Coins', weight: 6, min: 10, max: 80 },
    { id: 212, name: 'Iron ore', weight: 3, min: 1, max: 1 },
    { id: 279, name: 'Law rune', weight: 1, min: 1, max: 2 },
    { id: 278, name: 'Nature rune', weight: 2, min: 2, max: 6 },
    { id: 322, name: 'Limpwurt root', weight: 2, min: 1, max: 1 },
    { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 },
  ],
  tertiary: [
    { id: 901, name: 'Giant key', rate: 128, count: 1 },
  ],
});

define('lesser_demon', {
  always: [{ id: 100, name: 'Bones', min: 1, max: 1 }],
  main: [
    { id: 101, name: 'Coins', weight: 5, min: 30, max: 132 },
    { id: 273, name: 'Fire rune', weight: 3, min: 2, max: 12 },
    { id: 276, name: 'Chaos rune', weight: 2, min: 2, max: 6 },
    { id: 253, name: 'Gold bar', weight: 1, min: 1, max: 1 },
    { id: 254, name: 'Mithril bar', weight: 1, min: 1, max: 1 },
    { id: 430, name: 'Mithril scimitar', weight: 1, min: 1, max: 1 },
    { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 },
  ],
});

define('green_dragon', {
  always: [{ id: 107, name: 'Dragon bones', min: 1, max: 1 }],
  main: [
    { id: 101, name: 'Coins', weight: 4, min: 44, max: 220 },
    { id: 278, name: 'Nature rune', weight: 3, min: 3, max: 12 },
    { id: 255, name: 'Adamantite bar', weight: 1, min: 1, max: 1 },
    { id: 440, name: 'Adamant scimitar', weight: 1, min: 1, max: 1 },
    { id: 0, name: 'Nothing', weight: 3, min: 0, max: 0 },
  ],
});

// ── Boss drop tables ──────────────────────────────────────────────────────────

define('king_black_dragon', {
  always: [{ id: 107, name: 'Dragon bones', min: 1, max: 1 }],
  main: [
    { id: 101, name: 'Coins', weight: 5, min: 1000, max: 5000 },
    { id: 280, name: 'Blood rune', weight: 3, min: 10, max: 30 },
    { id: 277, name: 'Death rune', weight: 3, min: 15, max: 45 },
    { id: 256, name: 'Runite bar', weight: 1, min: 1, max: 3 },
    { id: 450, name: 'Rune scimitar', weight: 1, min: 1, max: 1 },
    { id: 0, name: 'Nothing', weight: 2, min: 0, max: 0 },
  ],
  tertiary: [
    { id: 730, name: 'Draconic visage', rate: 5000, count: 1 },
    { id: 731, name: 'KBD head', rate: 128, count: 1 },
    { id: 902, name: 'Clue scroll (medium)', rate: 64, count: 1 },
  ],
});

define('giant_mole', {
  always: [{ id: 732, name: 'Mole claw', min: 1, max: 1 }, { id: 733, name: 'Mole skin', min: 1, max: 1 }],
  main: [
    { id: 101, name: 'Coins', weight: 5, min: 500, max: 2000 },
    { id: 215, name: 'Mithril ore', weight: 3, min: 1, max: 3 },
    { id: 204, name: 'Yew logs', weight: 3, min: 1, max: 5 },
    { id: 0, name: 'Nothing', weight: 3, min: 0, max: 0 },
  ],
  tertiary: [
    { id: 902, name: 'Clue scroll (medium)', rate: 64, count: 1 },
  ],
});

define('barrows_chest', {
  always: [],
  main: [
    { id: 101, name: 'Coins', weight: 10, min: 5000, max: 15000 },
    { id: 280, name: 'Blood rune', weight: 5, min: 50, max: 150 },
    { id: 277, name: 'Death rune', weight: 5, min: 50, max: 150 },
    { id: 276, name: 'Chaos rune', weight: 5, min: 100, max: 300 },
    { id: 734, name: "Dharok's greataxe", weight: 1, min: 1, max: 1 },
    { id: 735, name: "Verac's flail", weight: 1, min: 1, max: 1 },
    { id: 736, name: "Guthan's warspear", weight: 1, min: 1, max: 1 },
    { id: 737, name: "Ahrim's staff", weight: 1, min: 1, max: 1 },
    { id: 738, name: "Karil's crossbow", weight: 1, min: 1, max: 1 },
    { id: 739, name: "Torag's hammers", weight: 1, min: 1, max: 1 },
  ],
  tertiary: [],
});

// Add medium clue to higher-level monsters
define('hill_giant', {
  always: [{ id: 106, name: 'Big bones', min: 1, max: 1 }],
  main: [
    { id: 101, name: 'Coins', weight: 6, min: 10, max: 80 },
    { id: 212, name: 'Iron ore', weight: 3, min: 1, max: 1 },
    { id: 279, name: 'Law rune', weight: 1, min: 1, max: 2 },
    { id: 278, name: 'Nature rune', weight: 2, min: 2, max: 6 },
    { id: 322, name: 'Limpwurt root', weight: 2, min: 1, max: 1 },
    { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 },
  ],
  tertiary: [
    { id: 901, name: 'Giant key', rate: 128, count: 1 },
    { id: 902, name: 'Clue scroll (medium)', rate: 128, count: 1 },
  ],
});

module.exports = { define, roll, tables };
