// ══════════════════════════════════════════════════════════════════════════════
// Hunter — Traps, birdhouses, creature tracking
//
// Design Knobs (P13):
//   Bird snares: 5-20k XP/hr, Background, free, produces feathers/bones
//   Box traps: 30-60k XP/hr, Multitask, free, produces chinchompas
//   Birdhouses: Time-gated (like farming), produces nests/seeds
//   Black chins: 80k+ XP/hr but in Wilds (PvP danger knob maxed)
//
// Manifesto P04: Only source of chinchompas (ranged weapon/ammo)
// Manifesto P06: Chin hunting in Wilds = danger for reward (P13 danger knob)
// ══════════════════════════════════════════════════════════════════════════════

const { xpToLevel } = require('./gathering');
const items = require('../data/items');

const trapDefs = new Map();
const birdhouseDefs = new Map();

function defineTrap(opts) {
  trapDefs.set(opts.id, {
    id: opts.id, name: opts.name,
    type: opts.type, // 'bird_snare', 'box_trap', 'net_trap', 'deadfall'
    level: opts.level, xp: opts.xp,
    catchRate: opts.catchRate || 0.5,
    checkTicks: opts.checkTicks || 10, // ticks between catch attempts
    loot: opts.loot || [],
    region: opts.region || null,
    dangerous: opts.dangerous || false, // in PvP zone?
  });
}

function defineBirdhouse(opts) {
  birdhouseDefs.set(opts.id, {
    id: opts.id, name: opts.name,
    level: opts.level,
    plantXp: opts.plantXp,
    harvestXp: opts.harvestXp,
    growthTicks: opts.growthTicks,
    loot: opts.loot || [],
  });
}

function attemptCatch(player, trapId) {
  const trap = trapDefs.get(trapId);
  if (!trap) return { error: 'unknown_trap' };

  const level = player.skills?.hunter?.level || 1;
  if (level < trap.level) return { error: 'level_too_low', required: trap.level };

  const levelAbove = Math.max(0, level - trap.level);
  const chance = Math.min(0.95, trap.catchRate + levelAbove * 0.015);
  const success = Math.random() < chance;

  if (!success) return { success: false };

  // Grant XP
  if (!player.skills.hunter) player.skills.hunter = { level: 1, xp: 0 };
  player.skills.hunter.xp += trap.xp;
  const newLevel = xpToLevel(player.skills.hunter.xp);
  if (newLevel > player.skills.hunter.level) player.skills.hunter.level = newLevel;

  // Roll loot
  let lootItem = null;
  if (trap.loot.length > 0) {
    const totalWeight = trap.loot.reduce((s, l) => s + l.weight, 0);
    let roll = Math.random() * totalWeight;
    for (const l of trap.loot) {
      roll -= l.weight;
      if (roll <= 0) {
        const count = l.min + Math.floor(Math.random() * (l.max - l.min + 1));
        lootItem = { id: l.id, name: l.name, count };
        break;
      }
    }
  }

  return { success: true, xp: trap.xp, loot: lootItem, level: player.skills.hunter.level };
}

// ── Trap definitions ───────────────────────────────────────────────────────

// Bird snares (low level, AFK)
defineTrap({ id: 'crimson_swift', name: 'Crimson swift', type: 'bird_snare', level: 1, xp: 34, catchRate: 0.40, checkTicks: 10, region: 'Heartlands',
  loot: [{ id: 12712, name: 'Feather', min: 5, max: 15, weight: 5 }, { id: 100, name: 'Bones', min: 1, max: 1, weight: 3 }] });
defineTrap({ id: 'golden_warbler', name: 'Golden warbler', type: 'bird_snare', level: 5, xp: 48, catchRate: 0.38, checkTicks: 10, region: 'Boneyard',
  loot: [{ id: 12712, name: 'Feather', min: 10, max: 20, weight: 5 }, { id: 100, name: 'Bones', min: 1, max: 1, weight: 3 }] });
defineTrap({ id: 'tropical_wagtail', name: 'Tropical wagtail', type: 'bird_snare', level: 19, xp: 96, catchRate: 0.35, checkTicks: 10, region: 'Saltbrine',
  loot: [{ id: 12712, name: 'Feather', min: 15, max: 30, weight: 5 }] });

// Box traps (chinchompas — ranged ammo)
items.define({ id: 15101, name: 'Grey chinchompa', examine: 'A small furry creature. Can be thrown as a ranged weapon. AoE damage.', value: 50, category: 'ranged', stackable: true, weight: 0, stats: { ranged_strength: 20 } });
items.define({ id: 15102, name: 'Red chinchompa', examine: 'A red chinchompa. Explodes on impact. AoE ranged.', value: 250, category: 'ranged', stackable: true, weight: 0, stats: { ranged_strength: 35 } });
items.define({ id: 15103, name: 'Black chinchompa', examine: 'A black chinchompa. Maximum AoE ranged damage. Only found in the Wilds.', value: 800, category: 'ranged', stackable: true, weight: 0, stats: { ranged_strength: 50 } });

defineTrap({ id: 'grey_chin', name: 'Grey chinchompa', type: 'box_trap', level: 53, xp: 198.5, catchRate: 0.45, checkTicks: 8, region: 'Veilwood',
  loot: [{ id: 15101, name: 'Grey chinchompa', min: 1, max: 1, weight: 1 }] });
defineTrap({ id: 'red_chin', name: 'Red chinchompa', type: 'box_trap', level: 63, xp: 265, catchRate: 0.40, checkTicks: 8, region: 'Boneyard',
  loot: [{ id: 15102, name: 'Red chinchompa', min: 1, max: 1, weight: 1 }] });
defineTrap({ id: 'black_chin', name: 'Black chinchompa', type: 'box_trap', level: 73, xp: 315, catchRate: 0.35, checkTicks: 8, region: 'Wilds', dangerous: true,
  loot: [{ id: 15103, name: 'Black chinchompa', min: 1, max: 1, weight: 1 }] });

// Deadfall traps
defineTrap({ id: 'spined_larupia', name: 'Spined larupia', type: 'deadfall', level: 31, xp: 180, catchRate: 0.40, checkTicks: 12, region: 'Veilwood',
  loot: [{ id: 100, name: 'Bones', min: 1, max: 1, weight: 3 }, { id: 102, name: 'Cowhide', min: 1, max: 2, weight: 2 }] });
defineTrap({ id: 'horned_graahk', name: 'Horned graahk', type: 'deadfall', level: 41, xp: 240, catchRate: 0.38, checkTicks: 12, region: 'Boneyard',
  loot: [{ id: 106, name: 'Big bones', min: 1, max: 1, weight: 3 }] });

// Net traps (Moryskah — unique swamp creatures)
items.define({ id: 15110, name: 'Swamp lizard', examine: 'A caught swamp lizard. Can be used as a salamander weapon (all 3 combat styles).', value: 150, category: 'weapon', equipSlot: 'weapon', speed: 5, stats: { slash: 20, ranged: 20, magic: 20 }, equipReqs: { attack: 30, ranged: 30, magic: 30 } });
defineTrap({ id: 'swamp_lizard', name: 'Swamp lizard', type: 'net_trap', level: 29, xp: 152, catchRate: 0.42, checkTicks: 10, region: 'Moryskah',
  loot: [{ id: 15110, name: 'Swamp lizard', min: 1, max: 1, weight: 1 }] });

// Birdhouse items
items.define({ id: 15120, name: 'Oak birdhouse', examine: 'Place in a birdhouse spot and wait. Produces nests over time.', value: 100, category: 'hunter', weight: 1 });
items.define({ id: 15121, name: 'Willow birdhouse', examine: 'A willow birdhouse. Better nest chance.', value: 200, category: 'hunter', weight: 1 });
items.define({ id: 15122, name: 'Maple birdhouse', examine: 'A maple birdhouse. Good nest drops.', value: 400, category: 'hunter', weight: 1 });
items.define({ id: 15123, name: 'Yew birdhouse', examine: 'A yew birdhouse. High-tier nests.', value: 800, category: 'hunter', weight: 1 });
items.define({ id: 15130, name: 'Bird nest', examine: 'A bird nest. May contain seeds or a ring.', value: 50, category: 'hunter', weight: 0.1 });

defineBirdhouse({ id: 'oak_birdhouse', name: 'Oak birdhouse', level: 9, plantXp: 15, harvestXp: 280, growthTicks: 3000, // ~30 min
  loot: [{ id: 15130, name: 'Bird nest', min: 1, max: 1, weight: 5 }, { id: 12410, name: 'Guam seed', min: 1, max: 1, weight: 3 }] });
defineBirdhouse({ id: 'willow_birdhouse', name: 'Willow birdhouse', level: 24, plantXp: 20, harvestXp: 560, growthTicks: 3000,
  loot: [{ id: 15130, name: 'Bird nest', min: 1, max: 2, weight: 5 }, { id: 12414, name: 'Ranarr seed', min: 1, max: 1, weight: 1 }] });
defineBirdhouse({ id: 'maple_birdhouse', name: 'Maple birdhouse', level: 44, plantXp: 25, harvestXp: 820, growthTicks: 3000,
  loot: [{ id: 15130, name: 'Bird nest', min: 1, max: 3, weight: 5 }, { id: 12415, name: 'Snapdragon seed', min: 1, max: 1, weight: 1 }] });
defineBirdhouse({ id: 'yew_birdhouse', name: 'Yew birdhouse', level: 59, plantXp: 30, harvestXp: 1020, growthTicks: 3000,
  loot: [{ id: 15130, name: 'Bird nest', min: 1, max: 4, weight: 5 }, { id: 12416, name: 'Torstol seed', min: 1, max: 1, weight: 1 }] });

module.exports = { defineTrap, defineBirdhouse, attemptCatch, trapDefs, birdhouseDefs };
