// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Expanded Drop Tables
// Fill in drops for monsters that were defined without tables.
// ══════════════════════════════════════════════════════════════════════════════

const droptables = require('../../data/droptables');

// Heartlands
droptables.define('mugger', { always: [], main: [{ id: 101, name: 'Coins', weight: 15, min: 1, max: 8 }, { id: 0, name: 'Nothing', weight: 10, min: 0, max: 0 }] });
droptables.define('thief', { always: [], main: [{ id: 101, name: 'Coins', weight: 12, min: 5, max: 30 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
droptables.define('scorpion', { always: [], main: [{ id: 101, name: 'Coins', weight: 10, min: 3, max: 15 }, { id: 0, name: 'Nothing', weight: 15, min: 0, max: 0 }] });
droptables.define('zombie', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 12, min: 3, max: 20 }, { id: 0, name: 'Nothing', weight: 10, min: 0, max: 0 }] });
droptables.define('bat', { always: [], main: [{ id: 100, name: 'Bones', weight: 15, min: 1, max: 1 }, { id: 0, name: 'Nothing', weight: 15, min: 0, max: 0 }] });
droptables.define('wolf', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 103, name: 'Raw beef', weight: 8, min: 1, max: 1 }, { id: 0, name: 'Nothing', weight: 12, min: 0, max: 0 }] });
droptables.define('earth_warrior', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 15, max: 60 }, { id: 11352, name: 'Earth rune', weight: 5, min: 5, max: 15 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
droptables.define('ghost', { always: [], main: [{ id: 101, name: 'Coins', weight: 10, min: 3, max: 15 }, { id: 0, name: 'Nothing', weight: 15, min: 0, max: 0 }] });

// Boneyard
droptables.define('jackal', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 103, name: 'Raw beef', weight: 8, min: 1, max: 1 }, { id: 0, name: 'Nothing', weight: 12, min: 0, max: 0 }] });
droptables.define('nomad_warrior', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 15, max: 60 }, { id: 4004, name: 'Bone shard', weight: 3, min: 1, max: 2 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
droptables.define('sand_worm', { always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 20, max: 80 }, { id: 4003, name: 'Glass sand', weight: 5, min: 2, max: 5 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });

// Moryskah
droptables.define('shade', { always: [], main: [{ id: 5004, name: 'Ectoplasm', weight: 8, min: 1, max: 2 }, { id: 101, name: 'Coins', weight: 8, min: 10, max: 40 }, { id: 0, name: 'Nothing', weight: 10, min: 0, max: 0 }] });
droptables.define('revenant_imp', { always: [], main: [{ id: 101, name: 'Coins', weight: 8, min: 30, max: 100 }, { id: 11356, name: 'Chaos rune', weight: 5, min: 5, max: 12 }, { id: 0, name: 'Nothing', weight: 6, min: 0, max: 0 }] });
droptables.define('bog_beast', { always: [], main: [{ id: 5005, name: 'Swamp tar', weight: 8, min: 2, max: 5 }, { id: 101, name: 'Coins', weight: 8, min: 20, max: 80 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });

// Veilwood
droptables.define('shadow_panther', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 10, min: 20, max: 80 }, { id: 6003, name: 'Moonpetal', weight: 2, min: 1, max: 1 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
droptables.define('elder_druid', { always: [], main: [{ id: 6005, name: 'Druid staff', weight: 2, min: 1, max: 1 }, { id: 6002, name: 'Veilwood bark', weight: 5, min: 1, max: 2 }, { id: 101, name: 'Coins', weight: 8, min: 40, max: 150 }, { id: 0, name: 'Nothing', weight: 5, min: 0, max: 0 }] });
droptables.define('root_demon', { always: [], main: [{ id: 6002, name: 'Veilwood bark', weight: 5, min: 1, max: 3 }, { id: 101, name: 'Coins', weight: 8, min: 30, max: 120 }, { id: 0, name: 'Nothing', weight: 5, min: 0, max: 0 }] });
droptables.define('grizzly_bear', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 103, name: 'Raw beef', weight: 10, min: 2, max: 3 }, { id: 0, name: 'Nothing', weight: 5, min: 0, max: 0 }] });

// Sootworks
droptables.define('cave_troll', { always: [{ id: 100, name: 'Bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 8, min: 20, max: 80 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });

// Saltbrine
droptables.define('reef_shark', { always: [], main: [{ id: 2306, name: 'Raw shark', weight: 5, min: 1, max: 1 }, { id: 101, name: 'Coins', weight: 8, min: 15, max: 50 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });
droptables.define('ghost_pirate', { always: [], main: [{ id: 101, name: 'Coins', weight: 10, min: 20, max: 80 }, { id: 8003, name: 'Pirate rum', weight: 5, min: 1, max: 1 }, { id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 }] });

// Wilds
droptables.define('mammoth', { always: [{ id: 106, name: 'Big bones', min: 1, max: 1 }], main: [{ id: 101, name: 'Coins', weight: 8, min: 50, max: 200 }, { id: 0, name: 'Nothing', weight: 5, min: 0, max: 0 }] });
droptables.define('lava_naga', { always: [], main: [{ id: 101, name: 'Coins', weight: 6, min: 80, max: 300 }, { id: 11358, name: 'Blood rune', weight: 3, min: 5, max: 12 }, { id: 0, name: 'Nothing', weight: 4, min: 0, max: 0 }] });

console.log('[aelgard] Expanded drop tables loaded');
