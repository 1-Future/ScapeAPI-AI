// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Monsters MEGA (burn v2)
// 110 named monsters with full weighted drop tables across all 9 regions.
//
// Counts: Heartlands 10, Moryskah 15, Boneyard 12, Veilwood 12, Sootworks 12,
//         Saltbrine 12, Inkweald 12, Glass Desert 10, Wilds 15 = 110 total.
//
// Each entry registers: npc def (world/npcs), drop table (data/droptables),
// and an itemSource relationship for each drop (data/relationships).
//
// Drop rarity distribution target: ~10% always, ~40% common, ~30% uncommon,
// ~15% rare, ~5% very_rare.
//
// ID prefix for new defIds: mega_<region>_<name> — avoids collision with the
// 179 existing defIds across monsters-expanded/blitz/blitz2.
// ══════════════════════════════════════════════════════════════════════════════

const npcs = require('../../world/npcs');
const droptables = require('../../data/droptables');
const rel = require('../../data/relationships');

// Bucket to export so tests can introspect without double-parsing files.
const MEGA = [];

// ── helper ───────────────────────────────────────────────────────────────────
// mega({ id, name, level, hp, combat_style, attack_speed, max_hit, accuracy,
//        defence_{stab,slash,crush,magic,ranged}, aggressive, region,
//        slayer_task_eligible, slayer_level_required, xp_per_kill, sprite,
//        examine, weakness, tags, always_drops, drops, unique_drops })
function mega(m) {
  // 1. Register the NPC in the live world/npcs registry
  const attackRange = (m.combat_style === 'ranged' || m.combat_style === 'magic') ? 5 : 1;
  npcs.defineNpc(m.id, {
    name: m.name,
    examine: m.examine,
    combat: m.level,
    maxHp: m.hp,
    maxHit: m.max_hit,
    stats: {
      attack: m.accuracy,
      strength: m.accuracy,
      defence: Math.floor((m.defence_stab + m.defence_slash + m.defence_crush) / 3),
    },
    attackSpeed: m.attack_speed,
    attackRange,
    attackStyle: m.combat_style,
    aggressive: m.aggressive,
    aggroRange: m.aggressive ? 4 : 0,
    wanderRadius: 4,
    respawnTicks: 30 + Math.min(90, Math.floor(m.level / 2)),
    weakness: m.weakness || 'slash',
    tags: m.tags || [],
  });

  // 2. Collect drop entries for the droptables module. Normalise rarity →
  //    weight (common 25, uncommon 10, rare 4, very_rare 1). "always" rows
  //    go to the always bucket. Unique drops become tertiary rolls
  //    (chance expressed via weight of 1 / chance).
  const alwaysBucket = [];
  const mainBucket = [];
  const tertiaryBucket = [];

  const rarityWeight = {
    common: 25,
    uncommon: 10,
    rare: 4,
    very_rare: 1,
  };

  for (const drop of (m.always_drops || [])) {
    alwaysBucket.push({
      id: drop.item_id,
      name: drop.name || 'Drop',
      min: drop.quantity[0],
      max: drop.quantity[1],
    });
  }

  for (const drop of (m.drops || [])) {
    if (drop.rarity === 'always') {
      alwaysBucket.push({
        id: drop.item_id,
        name: drop.name || 'Drop',
        min: drop.quantity[0],
        max: drop.quantity[1],
      });
    } else {
      const weight = drop.weight || rarityWeight[drop.rarity] || 10;
      mainBucket.push({
        id: drop.item_id,
        name: drop.name || 'Drop',
        weight,
        min: drop.quantity[0],
        max: drop.quantity[1],
      });
    }
  }

  // Always include a "nothing" filler so weights sum > drops
  mainBucket.push({ id: 0, name: 'Nothing', weight: 8, min: 0, max: 0 });

  for (const u of (m.unique_drops || [])) {
    tertiaryBucket.push({
      id: u.item_id,
      name: u.name || 'Unique',
      chance: u.chance || 1024,
      min: 1,
      max: 1,
    });
  }

  droptables.define(m.id, {
    always: alwaysBucket,
    main: mainBucket,
    tertiary: tertiaryBucket,
  });

  // 3. Register an itemSource link for every drop so codex/gap-report can
  //    walk the monster→item graph.
  for (const d of [...alwaysBucket, ...mainBucket, ...tertiaryBucket]) {
    if (d.id && d.id !== 0) {
      rel.registerItemSource(d.id, { type: 'monster', source: m.id, region: m.region });
    }
  }

  // 4. Stash a copy for introspection (tests + codex).
  MEGA.push(m);
}

// ═══════════════════════════════════════════════════════════════════════════
// HEARTLANDS — 10 (farm pests, militia rivals, hedgerow beasts)
// ═══════════════════════════════════════════════════════════════════════════

mega({
  id: 'mega_heart_farmhand_brigand', name: 'Farmhand brigand', level: 14, hp: 18,
  combat_style: 'melee', attack_speed: 4, max_hit: 3, accuracy: 12,
  defence_stab: 8, defence_slash: 8, defence_crush: 6, defence_magic: 4, defence_ranged: 6,
  aggressive: true, region: 'heartlands', slayer_task_eligible: false, slayer_level_required: 0,
  xp_per_kill: 24, sprite: 'humans/brigand', weakness: 'slash', tags: ['human'], class_tags: ['human'],
  examine: 'A sour farmhand turned bandit. Has opinions about taxes.',
  always_drops: [{ item_id: 100, name: 'Bones', quantity: [1, 1] }],
  drops: [
    { item_id: 101, name: 'Coins', weight: 30, quantity: [5, 25], rarity: 'common' },
    { item_id: 66005, name: 'Harrowroot', weight: 15, quantity: [1, 2], rarity: 'common' },
    { item_id: 66002, name: 'Farm pest stinger', weight: 10, quantity: [1, 1], rarity: 'uncommon' },
    { item_id: 66006, name: 'Tinker lockpick', weight: 4, quantity: [1, 1], rarity: 'rare' },
  ],
  unique_drops: [{ item_id: 66201, name: 'Hedgelord pin', chance: 2048 }],
});

mega({
  id: 'mega_heart_corn_rat', name: 'Corn rat', level: 5, hp: 9,
  combat_style: 'melee', attack_speed: 4, max_hit: 2, accuracy: 4,
  defence_stab: 2, defence_slash: 2, defence_crush: 1, defence_magic: 1, defence_ranged: 2,
  aggressive: false, region: 'heartlands', slayer_task_eligible: true, slayer_level_required: 1,
  xp_per_kill: 12, sprite: 'beasts/corn_rat', weakness: 'slash', tags: ['beast'], class_tags: ['beast', 'slayer'],
  examine: 'Fat on stolen grain. Too smug.',
  always_drops: [{ item_id: 100, name: 'Bones', quantity: [1, 1] }],
  drops: [
    { item_id: 101, name: 'Coins', weight: 25, quantity: [1, 8], rarity: 'common' },
    { item_id: 66005, name: 'Harrowroot', weight: 10, quantity: [1, 1], rarity: 'uncommon' },
  ],
});

mega({
  id: 'mega_heart_hedge_boar', name: 'Hedge boar', level: 28, hp: 42,
  combat_style: 'melee', attack_speed: 4, max_hit: 6, accuracy: 22,
  defence_stab: 18, defence_slash: 16, defence_crush: 14, defence_magic: 8, defence_ranged: 12,
  aggressive: true, region: 'heartlands', slayer_task_eligible: true, slayer_level_required: 5,
  xp_per_kill: 58, sprite: 'beasts/hedge_boar', weakness: 'stab', tags: ['beast'], class_tags: ['armoured', 'beast', 'slayer'],
  examine: 'Bristle-backed, short-tempered, bramble-armoured.',
  always_drops: [{ item_id: 100, name: 'Bones', quantity: [1, 1] }],
  drops: [
    { item_id: 103, name: 'Raw beef', weight: 30, quantity: [1, 3], rarity: 'common' },
    { item_id: 66001, name: 'Hedgerow pelt', weight: 20, quantity: [1, 1], rarity: 'common' },
    { item_id: 101, name: 'Coins', weight: 12, quantity: [15, 45], rarity: 'uncommon' },
    { item_id: 66004, name: 'Thatch charm', weight: 3, quantity: [1, 1], rarity: 'rare' },
  ],
});

mega({
  id: 'mega_heart_hedgerow_stalker', name: 'Hedgerow stalker', level: 40, hp: 55,
  combat_style: 'melee', attack_speed: 3, max_hit: 7, accuracy: 30,
  defence_stab: 22, defence_slash: 20, defence_crush: 18, defence_magic: 12, defence_ranged: 18,
  aggressive: true, region: 'heartlands', slayer_task_eligible: true, slayer_level_required: 20,
  xp_per_kill: 82, sprite: 'beasts/hedge_stalker', weakness: 'magic', tags: ['beast'], class_tags: ['beast', 'slayer'],
  examine: 'Crawls inside the hedges. Leaves little corridors of nothing.',
  always_drops: [{ item_id: 100, name: 'Bones', quantity: [1, 1] }],
  drops: [
    { item_id: 66001, name: 'Hedgerow pelt', weight: 25, quantity: [1, 2], rarity: 'common' },
    { item_id: 101, name: 'Coins', weight: 15, quantity: [30, 90], rarity: 'uncommon' },
    { item_id: 66004, name: 'Thatch charm', weight: 4, quantity: [1, 1], rarity: 'rare' },
    { item_id: 12001, name: 'Grimy guam', weight: 8, quantity: [1, 2], rarity: 'uncommon' },
  ],
  unique_drops: [{ item_id: 66201, name: 'Hedgelord pin', chance: 1024 }],
});

mega({
  id: 'mega_heart_militia_captain', name: 'Militia captain', level: 48, hp: 60,
  combat_style: 'melee', attack_speed: 4, max_hit: 8, accuracy: 35,
  defence_stab: 28, defence_slash: 30, defence_crush: 24, defence_magic: 12, defence_ranged: 22,
  aggressive: false, region: 'heartlands', slayer_task_eligible: false, slayer_level_required: 0,
  xp_per_kill: 95, sprite: 'humans/militia_captain', weakness: 'crush', tags: ['human', 'armoured'], class_tags: ['armoured', 'human'],
  examine: 'A veteran of the toll wars. Very tired.',
  always_drops: [{ item_id: 100, name: 'Bones', quantity: [1, 1] }],
  drops: [
    { item_id: 101, name: 'Coins', weight: 28, quantity: [60, 180], rarity: 'common' },
    { item_id: 66003, name: 'Militia insignia', weight: 15, quantity: [1, 1], rarity: 'uncommon' },
    { item_id: 66006, name: 'Tinker lockpick', weight: 6, quantity: [1, 1], rarity: 'rare' },
    { item_id: 11357, name: 'Death rune', weight: 5, quantity: [2, 5], rarity: 'rare' },
  ],
});

mega({
  id: 'mega_heart_plough_ghoul', name: 'Plough ghoul', level: 35, hp: 45,
  combat_style: 'melee', attack_speed: 5, max_hit: 6, accuracy: 24,
  defence_stab: 14, defence_slash: 14, defence_crush: 10, defence_magic: 6, defence_ranged: 14,
  aggressive: true, region: 'heartlands', slayer_task_eligible: true, slayer_level_required: 15,
  xp_per_kill: 70, sprite: 'undead/plough_ghoul', weakness: 'slash', tags: ['undead'], class_tags: ['slayer', 'undead'],
  examine: 'A field-hand who kept plowing after he died.',
  always_drops: [{ item_id: 100, name: 'Bones', quantity: [1, 1] }],
  drops: [
    { item_id: 101, name: 'Coins', weight: 20, quantity: [20, 60], rarity: 'common' },
    { item_id: 66005, name: 'Harrowroot', weight: 18, quantity: [1, 3], rarity: 'common' },
    { item_id: 66020, name: 'Grave-spawn ichor', weight: 5, quantity: [1, 1], rarity: 'rare' },
  ],
});

mega({
  id: 'mega_heart_toll_highwayman', name: 'Toll-road highwayman', level: 22, hp: 28,
  combat_style: 'ranged', attack_speed: 4, max_hit: 5, accuracy: 18,
  defence_stab: 12, defence_slash: 12, defence_crush: 10, defence_magic: 8, defence_ranged: 10,
  aggressive: true, region: 'heartlands', slayer_task_eligible: false, slayer_level_required: 0,
  xp_per_kill: 44, sprite: 'humans/highwayman', weakness: 'magic', tags: ['human'], class_tags: ['human', 'ranged_user'],
  examine: '"Your coin or your horse, friend."',
  always_drops: [{ item_id: 100, name: 'Bones', quantity: [1, 1] }],
  drops: [
    { item_id: 101, name: 'Coins', weight: 35, quantity: [12, 60], rarity: 'common' },
    { item_id: 66003, name: 'Militia insignia', weight: 8, quantity: [1, 1], rarity: 'uncommon' },
    { item_id: 66006, name: 'Tinker lockpick', weight: 4, quantity: [1, 1], rarity: 'rare' },
  ],
});

mega({
  id: 'mega_heart_rat_king', name: 'Rat king', level: 55, hp: 80,
  combat_style: 'melee', attack_speed: 3, max_hit: 9, accuracy: 40,
  defence_stab: 25, defence_slash: 25, defence_crush: 18, defence_magic: 14, defence_ranged: 22,
  aggressive: true, region: 'heartlands', slayer_task_eligible: true, slayer_level_required: 30,
  xp_per_kill: 120, sprite: 'beasts/rat_king', weakness: 'crush', tags: ['beast'], class_tags: ['beast', 'slayer'],
  examine: 'A knot of rats bound by tail, hunger, and a crude crown.',
  always_drops: [{ item_id: 100, name: 'Bones', quantity: [1, 1] }],
  drops: [
    { item_id: 101, name: 'Coins', weight: 22, quantity: [80, 220], rarity: 'common' },
    { item_id: 66001, name: 'Hedgerow pelt', weight: 15, quantity: [2, 4], rarity: 'uncommon' },
    { item_id: 66002, name: 'Farm pest stinger', weight: 10, quantity: [2, 3], rarity: 'uncommon' },
    { item_id: 66004, name: 'Thatch charm', weight: 5, quantity: [1, 1], rarity: 'rare' },
    { item_id: 12504, name: 'Uncut diamond', weight: 1, quantity: [1, 1], rarity: 'very_rare' },
  ],
  unique_drops: [{ item_id: 66201, name: 'Hedgelord pin', chance: 512 }],
});

mega({
  id: 'mega_heart_sow_witch', name: 'Sow-witch', level: 32, hp: 36,
  combat_style: 'magic', attack_speed: 5, max_hit: 7, accuracy: 25,
  defence_stab: 10, defence_slash: 10, defence_crush: 8, defence_magic: 20, defence_ranged: 10,
  aggressive: true, region: 'heartlands', slayer_task_eligible: true, slayer_level_required: 10,
  xp_per_kill: 68, sprite: 'humans/sow_witch', weakness: 'ranged', tags: ['human'], class_tags: ['human', 'magic_user', 'slayer'],
  examine: 'Keeps pigs that answer to names, not whistles.',
  always_drops: [{ item_id: 100, name: 'Bones', quantity: [1, 1] }],
  drops: [
    { item_id: 101, name: 'Coins', weight: 20, quantity: [25, 70], rarity: 'common' },
    { item_id: 12001, name: 'Grimy guam', weight: 15, quantity: [1, 2], rarity: 'uncommon' },
    { item_id: 12002, name: 'Grimy marrentill', weight: 10, quantity: [1, 2], rarity: 'uncommon' },
    { item_id: 66005, name: 'Harrowroot', weight: 12, quantity: [1, 3], rarity: 'uncommon' },
    { item_id: 11352, name: 'Earth rune', weight: 6, quantity: [5, 12], rarity: 'rare' },
  ],
});

mega({
  id: 'mega_heart_church_gargoyle', name: 'Church gargoyle', level: 60, hp: 85,
  combat_style: 'melee', attack_speed: 4, max_hit: 10, accuracy: 45,
  defence_stab: 40, defence_slash: 38, defence_crush: 22, defence_magic: 18, defence_ranged: 30,
  aggressive: false, region: 'heartlands', slayer_task_eligible: true, slayer_level_required: 35,
  xp_per_kill: 140, sprite: 'construct/church_gargoyle', weakness: 'crush', tags: ['construct', 'armoured'], class_tags: ['armoured', 'construct', 'slayer'],
  examine: 'Carved for a belltower. Moved when the bell stopped.',
  always_drops: [],
  drops: [
    { item_id: 101, name: 'Coins', weight: 20, quantity: [80, 240], rarity: 'common' },
    { item_id: 2115, name: 'Adamantite bar', weight: 8, quantity: [1, 2], rarity: 'uncommon' },
    { item_id: 66003, name: 'Militia insignia', weight: 6, quantity: [1, 1], rarity: 'rare' },
    { item_id: 12504, name: 'Uncut diamond', weight: 3, quantity: [1, 1], rarity: 'very_rare' },
  ],
});

// ═══════════════════════════════════════════════════════════════════════════
// MORYSKAH — 15 (undead, vampires, werewolves, grave-spawn)
// ═══════════════════════════════════════════════════════════════════════════

mega({
  id: 'mega_mor_grave_spawn', name: 'Grave-spawn', level: 38, hp: 42,
  combat_style: 'melee', attack_speed: 4, max_hit: 6, accuracy: 24,
  defence_stab: 16, defence_slash: 14, defence_crush: 10, defence_magic: 8, defence_ranged: 14,
  aggressive: true, region: 'moryskah', slayer_task_eligible: true, slayer_level_required: 18,
  xp_per_kill: 78, sprite: 'undead/grave_spawn', weakness: 'slash', tags: ['undead'], class_tags: ['slayer', 'undead'],
  examine: 'Claws its way up nightly. Gives up nightly.',
  always_drops: [{ item_id: 100, name: 'Bones', quantity: [1, 1] }],
  drops: [
    { item_id: 101, name: 'Coins', weight: 22, quantity: [20, 70], rarity: 'common' },
    { item_id: 66020, name: 'Grave-spawn ichor', weight: 18, quantity: [1, 2], rarity: 'common' },
    { item_id: 66025, name: 'Coffin splinter', weight: 15, quantity: [1, 3], rarity: 'common' },
    { item_id: 66023, name: 'Grave ribbon', weight: 6, quantity: [1, 1], rarity: 'rare' },
  ],
});

mega({
  id: 'mega_mor_crypt_howler', name: 'Crypt howler', level: 66, hp: 78,
  combat_style: 'melee', attack_speed: 3, max_hit: 11, accuracy: 48,
  defence_stab: 30, defence_slash: 32, defence_crush: 20, defence_magic: 18, defence_ranged: 28,
  aggressive: true, region: 'moryskah', slayer_task_eligible: true, slayer_level_required: 40,
  xp_per_kill: 150, sprite: 'beasts/crypt_howler', weakness: 'ranged', tags: ['beast', 'undead'], class_tags: ['beast', 'slayer', 'undead'],
  examine: 'Howls names. Your name is in there somewhere.',
  always_drops: [{ item_id: 100, name: 'Bones', quantity: [1, 1] }],
  drops: [
    { item_id: 101, name: 'Coins', weight: 20, quantity: [70, 200], rarity: 'common' },
    { item_id: 66021, name: 'Werewolf claw', weight: 14, quantity: [1, 1], rarity: 'uncommon' },
    { item_id: 66028, name: 'Chapel ash', weight: 8, quantity: [1, 2], rarity: 'uncommon' },
    { item_id: 66024, name: 'Blood-silver coin', weight: 5, quantity: [1, 3], rarity: 'rare' },
  ],
});

mega({
  id: 'mega_mor_nocturne_lord', name: 'Nocturne lord', level: 112, hp: 140,
  combat_style: 'melee', attack_speed: 4, max_hit: 16, accuracy: 82,
  defence_stab: 55, defence_slash: 60, defence_crush: 40, defence_magic: 45, defence_ranged: 40,
  aggressive: true, region: 'moryskah', slayer_task_eligible: true, slayer_level_required: 70,
  xp_per_kill: 240, sprite: 'vampyre/nocturne_lord', weakness: 'slash', tags: ['vampyre', 'undead'], class_tags: ['slayer', 'undead', 'vampyre'],
  examine: 'Dresses for a dinner you are the main course of.',
  always_drops: [],
  drops: [
    { item_id: 101, name: 'Coins', weight: 18, quantity: [200, 600], rarity: 'common' },
    { item_id: 66022, name: 'Salt vampire fang', weight: 10, quantity: [1, 1], rarity: 'uncommon' },
    { item_id: 66026, name: 'Nocturne lace', weight: 12, quantity: [1, 2], rarity: 'uncommon' },
    { item_id: 11358, name: 'Blood rune', weight: 8, quantity: [8, 20], rarity: 'rare' },
    { item_id: 66027, name: 'Cursed signet', weight: 3, quantity: [1, 1], rarity: 'very_rare' },
  ],
  unique_drops: [{ item_id: 66202, name: 'Grave lord talisman', chance: 512 }],
});

mega({
  id: 'mega_mor_werewolf_stalker', name: 'Werewolf stalker', level: 85, hp: 100,
  combat_style: 'melee', attack_speed: 3, max_hit: 13, accuracy: 60,
  defence_stab: 38, defence_slash: 40, defence_crush: 28, defence_magic: 22, defence_ranged: 30,
  aggressive: true, region: 'moryskah', slayer_task_eligible: true, slayer_level_required: 55,
  xp_per_kill: 180, sprite: 'beasts/werewolf_stalker', weakness: 'stab', tags: ['beast', 'werewolf'], class_tags: ['beast', 'slayer'],
  examine: 'Moves sideways along the alleys. Leaves footprints pointing the wrong way.',
  always_drops: [{ item_id: 100, name: 'Bones', quantity: [1, 1] }],
  drops: [
    { item_id: 101, name: 'Coins', weight: 22, quantity: [120, 350], rarity: 'common' },
    { item_id: 66021, name: 'Werewolf claw', weight: 20, quantity: [1, 2], rarity: 'common' },
    { item_id: 103, name: 'Raw beef', weight: 12, quantity: [2, 3], rarity: 'uncommon' },
    { item_id: 66024, name: 'Blood-silver coin', weight: 5, quantity: [1, 2], rarity: 'rare' },
  ],
});

mega({
  id: 'mega_mor_bone_priest', name: 'Bone priest', level: 58, hp: 70,
  combat_style: 'magic', attack_speed: 5, max_hit: 10, accuracy: 42,
  defence_stab: 18, defence_slash: 18, defence_crush: 14, defence_magic: 35, defence_ranged: 20,
  aggressive: true, region: 'moryskah', slayer_task_eligible: true, slayer_level_required: 25,
  xp_per_kill: 115, sprite: 'undead/bone_priest', weakness: 'ranged', tags: ['undead'], class_tags: ['human', 'magic_user', 'slayer', 'undead'],
  examine: 'Preaches sermons to the bones. They listen.',
  always_drops: [{ item_id: 100, name: 'Bones', quantity: [1, 1] }],
  drops: [
    { item_id: 101, name: 'Coins', weight: 20, quantity: [60, 180], rarity: 'common' },
    { item_id: 66028, name: 'Chapel ash', weight: 15, quantity: [1, 3], rarity: 'common' },
    { item_id: 66025, name: 'Coffin splinter', weight: 10, quantity: [2, 4], rarity: 'uncommon' },
    { item_id: 11357, name: 'Death rune', weight: 5, quantity: [4, 10], rarity: 'rare' },
  ],
});

mega({
  id: 'mega_mor_salt_vampire', name: 'Salt vampire', level: 98, hp: 125,
  combat_style: 'melee', attack_speed: 4, max_hit: 14, accuracy: 70,
  defence_stab: 40, defence_slash: 45, defence_crush: 30, defence_magic: 35, defence_ranged: 28,
  aggressive: true, region: 'moryskah', slayer_task_eligible: true, slayer_level_required: 62,
  xp_per_kill: 205, sprite: 'vampyre/salt_vampire', weakness: 'crush', tags: ['vampyre', 'undead'], class_tags: ['slayer', 'undead', 'vampyre'],
  examine: 'Driven from Saltbrine. Still tastes the sea.',
  always_drops: [],
  drops: [
    { item_id: 101, name: 'Coins', weight: 18, quantity: [150, 400], rarity: 'common' },
    { item_id: 66022, name: 'Salt vampire fang', weight: 16, quantity: [1, 1], rarity: 'uncommon' },
    { item_id: 66104, name: 'Salt-vampire ichor', weight: 10, quantity: [1, 2], rarity: 'uncommon' },
    { item_id: 11358, name: 'Blood rune', weight: 6, quantity: [5, 15], rarity: 'rare' },
    { item_id: 66027, name: 'Cursed signet', weight: 2, quantity: [1, 1], rarity: 'very_rare' },
  ],
});

mega({
  id: 'mega_mor_coffin_crawler', name: 'Coffin crawler', level: 24, hp: 30,
  combat_style: 'melee', attack_speed: 5, max_hit: 4, accuracy: 14,
  defence_stab: 10, defence_slash: 8, defence_crush: 6, defence_magic: 4, defence_ranged: 10,
  aggressive: false, region: 'moryskah', slayer_task_eligible: true, slayer_level_required: 8,
  xp_per_kill: 48, sprite: 'undead/coffin_crawler', weakness: 'slash', tags: ['undead'], class_tags: ['slayer', 'undead'],
  examine: 'Small, bony, enthusiastic.',
  always_drops: [{ item_id: 100, name: 'Bones', quantity: [1, 1] }],
  drops: [
    { item_id: 101, name: 'Coins', weight: 25, quantity: [10, 40], rarity: 'common' },
    { item_id: 66025, name: 'Coffin splinter', weight: 20, quantity: [1, 3], rarity: 'common' },
    { item_id: 66020, name: 'Grave-spawn ichor', weight: 8, quantity: [1, 1], rarity: 'uncommon' },
  ],
});

mega({
  id: 'mega_mor_mourner', name: 'Mourner', level: 45, hp: 50,
  combat_style: 'melee', attack_speed: 4, max_hit: 7, accuracy: 30,
  defence_stab: 20, defence_slash: 20, defence_crush: 16, defence_magic: 25, defence_ranged: 18,
  aggressive: false, region: 'moryskah', slayer_task_eligible: false, slayer_level_required: 0,
  xp_per_kill: 88, sprite: 'humans/mourner', weakness: 'stab', tags: ['human'], class_tags: ['human'],
  examine: 'Paid per tear. Professional.',
  always_drops: [{ item_id: 100, name: 'Bones', quantity: [1, 1] }],
  drops: [
    { item_id: 101, name: 'Coins', weight: 25, quantity: [30, 90], rarity: 'common' },
    { item_id: 66023, name: 'Grave ribbon', weight: 18, quantity: [1, 2], rarity: 'common' },
    { item_id: 66026, name: 'Nocturne lace', weight: 6, quantity: [1, 1], rarity: 'rare' },
  ],
});

mega({
  id: 'mega_mor_chapel_revenant', name: 'Chapel revenant', level: 74, hp: 95,
  combat_style: 'magic', attack_speed: 4, max_hit: 12, accuracy: 55,
  defence_stab: 25, defence_slash: 25, defence_crush: 20, defence_magic: 40, defence_ranged: 25,
  aggressive: true, region: 'moryskah', slayer_task_eligible: true, slayer_level_required: 48,
  xp_per_kill: 158, sprite: 'undead/chapel_revenant', weakness: 'ranged', tags: ['undead', 'spirit'], class_tags: ['magic_user', 'shadow', 'slayer', 'undead'],
  examine: 'Still wears the stole. Burns when you pray near it.',
  always_drops: [],
  drops: [
    { item_id: 101, name: 'Coins', weight: 20, quantity: [80, 250], rarity: 'common' },
    { item_id: 66028, name: 'Chapel ash', weight: 18, quantity: [2, 4], rarity: 'common' },
    { item_id: 66027, name: 'Cursed signet', weight: 4, quantity: [1, 1], rarity: 'rare' },
    { item_id: 11357, name: 'Death rune', weight: 7, quantity: [5, 12], rarity: 'rare' },
  ],
});

mega({
  id: 'mega_mor_blood_bat', name: 'Blood bat', level: 19, hp: 22,
  combat_style: 'melee', attack_speed: 3, max_hit: 3, accuracy: 10,
  defence_stab: 4, defence_slash: 4, defence_crush: 2, defence_magic: 2, defence_ranged: 3,
  aggressive: true, region: 'moryskah', slayer_task_eligible: true, slayer_level_required: 3,
  xp_per_kill: 36, sprite: 'beasts/blood_bat', weakness: 'crush', tags: ['beast'], class_tags: ['beast', 'slayer'],
  examine: 'Gorged. Unsteady wings.',
  always_drops: [{ item_id: 100, name: 'Bones', quantity: [1, 1] }],
  drops: [
    { item_id: 5001, name: 'Vial of blood', weight: 20, quantity: [1, 2], rarity: 'common' },
    { item_id: 101, name: 'Coins', weight: 15, quantity: [5, 30], rarity: 'common' },
    { item_id: 66022, name: 'Salt vampire fang', weight: 2, quantity: [1, 1], rarity: 'very_rare' },
  ],
});

mega({
  id: 'mega_mor_marrow_wight', name: 'Marrow wight', level: 92, hp: 115,
  combat_style: 'melee', attack_speed: 4, max_hit: 13, accuracy: 65,
  defence_stab: 36, defence_slash: 38, defence_crush: 25, defence_magic: 30, defence_ranged: 32,
  aggressive: true, region: 'moryskah', slayer_task_eligible: true, slayer_level_required: 58,
  xp_per_kill: 195, sprite: 'undead/marrow_wight', weakness: 'crush', tags: ['undead'], class_tags: ['slayer', 'undead'],
  examine: 'Sucked its own bones empty. Now eats yours.',
  always_drops: [{ item_id: 106, name: 'Big bones', quantity: [1, 1] }],
  drops: [
    { item_id: 101, name: 'Coins', weight: 18, quantity: [140, 380], rarity: 'common' },
    { item_id: 66020, name: 'Grave-spawn ichor', weight: 14, quantity: [1, 2], rarity: 'uncommon' },
    { item_id: 66028, name: 'Chapel ash', weight: 10, quantity: [1, 3], rarity: 'uncommon' },
    { item_id: 11358, name: 'Blood rune', weight: 5, quantity: [4, 10], rarity: 'rare' },
  ],
});

mega({
  id: 'mega_mor_lamplighter_ghost', name: 'Lamplighter ghost', level: 29, hp: 28,
  combat_style: 'magic', attack_speed: 5, max_hit: 4, accuracy: 16,
  defence_stab: 6, defence_slash: 6, defence_crush: 4, defence_magic: 18, defence_ranged: 8,
  aggressive: false, region: 'moryskah', slayer_task_eligible: true, slayer_level_required: 12,
  xp_per_kill: 55, sprite: 'spirit/lamplighter_ghost', weakness: 'ranged', tags: ['undead', 'spirit'], class_tags: ['magic_user', 'shadow', 'slayer', 'undead'],
  examine: 'Lights the lamps he died trying to light.',
  always_drops: [],
  drops: [
    { item_id: 101, name: 'Coins', weight: 22, quantity: [15, 50], rarity: 'common' },
    { item_id: 5001, name: 'Vial of blood', weight: 10, quantity: [1, 1], rarity: 'uncommon' },
    { item_id: 66028, name: 'Chapel ash', weight: 8, quantity: [1, 2], rarity: 'uncommon' },
  ],
});

mega({
  id: 'mega_mor_moon_cultist', name: 'Moon cultist', level: 52, hp: 62,
  combat_style: 'magic', attack_speed: 4, max_hit: 9, accuracy: 36,
  defence_stab: 18, defence_slash: 18, defence_crush: 14, defence_magic: 32, defence_ranged: 16,
  aggressive: true, region: 'moryskah', slayer_task_eligible: false, slayer_level_required: 0,
  xp_per_kill: 105, sprite: 'humans/moon_cultist', weakness: 'ranged', tags: ['human'], class_tags: ['human', 'magic_user'],
  examine: 'A robe, a crescent, a nasty little knife.',
  always_drops: [{ item_id: 100, name: 'Bones', quantity: [1, 1] }],
  drops: [
    { item_id: 101, name: 'Coins', weight: 22, quantity: [40, 140], rarity: 'common' },
    { item_id: 66026, name: 'Nocturne lace', weight: 12, quantity: [1, 1], rarity: 'uncommon' },
    { item_id: 6003, name: 'Moonpetal', weight: 10, quantity: [1, 2], rarity: 'uncommon' },
    { item_id: 11357, name: 'Death rune', weight: 6, quantity: [3, 8], rarity: 'rare' },
  ],
});

mega({
  id: 'mega_mor_black_carriage_driver', name: 'Black-carriage driver', level: 82, hp: 95,
  combat_style: 'melee', attack_speed: 4, max_hit: 12, accuracy: 58,
  defence_stab: 32, defence_slash: 32, defence_crush: 24, defence_magic: 20, defence_ranged: 30,
  aggressive: true, region: 'moryskah', slayer_task_eligible: false, slayer_level_required: 0,
  xp_per_kill: 170, sprite: 'humans/carriage_driver', weakness: 'stab', tags: ['human', 'undead'], class_tags: ['human', 'undead'],
  examine: 'Picks up passengers. Does not drop them off.',
  always_drops: [{ item_id: 100, name: 'Bones', quantity: [1, 1] }],
  drops: [
    { item_id: 101, name: 'Coins', weight: 20, quantity: [120, 320], rarity: 'common' },
    { item_id: 66024, name: 'Blood-silver coin', weight: 12, quantity: [1, 3], rarity: 'uncommon' },
    { item_id: 66023, name: 'Grave ribbon', weight: 10, quantity: [1, 2], rarity: 'uncommon' },
    { item_id: 66027, name: 'Cursed signet', weight: 3, quantity: [1, 1], rarity: 'very_rare' },
  ],
});

mega({
  id: 'mega_mor_whispering_skull', name: 'Whispering skull', level: 38, hp: 35,
  combat_style: 'magic', attack_speed: 5, max_hit: 6, accuracy: 22,
  defence_stab: 12, defence_slash: 12, defence_crush: 8, defence_magic: 24, defence_ranged: 14,
  aggressive: true, region: 'moryskah', slayer_task_eligible: true, slayer_level_required: 15,
  xp_per_kill: 72, sprite: 'undead/whispering_skull', weakness: 'crush', tags: ['undead'], class_tags: ['magic_user', 'slayer', 'undead'],
  examine: 'Tells the secrets of whoever it used to be.',
  always_drops: [{ item_id: 100, name: 'Bones', quantity: [1, 1] }],
  drops: [
    { item_id: 101, name: 'Coins', weight: 22, quantity: [20, 75], rarity: 'common' },
    { item_id: 66025, name: 'Coffin splinter', weight: 14, quantity: [1, 3], rarity: 'uncommon' },
    { item_id: 66020, name: 'Grave-spawn ichor', weight: 8, quantity: [1, 1], rarity: 'uncommon' },
  ],
  unique_drops: [{ item_id: 66202, name: 'Grave lord talisman', chance: 2048 }],
});

// ═══════════════════════════════════════════════════════════════════════════
// BONEYARD — 12 (mummy tiers, scarabs, salt-stalkers, dust-dwellers)
// ═══════════════════════════════════════════════════════════════════════════

mega({
  id: 'mega_bone_minor_mummy', name: 'Minor mummy', level: 34, hp: 40,
  combat_style: 'melee', attack_speed: 5, max_hit: 5, accuracy: 22,
  defence_stab: 18, defence_slash: 16, defence_crush: 10, defence_magic: 10, defence_ranged: 16,
  aggressive: true, region: 'boneyard', slayer_task_eligible: true, slayer_level_required: 14,
  xp_per_kill: 68, sprite: 'undead/mummy_minor', weakness: 'slash', tags: ['undead'], class_tags: ['slayer', 'undead'],
  examine: 'Wrapped, rewrapped, and deeply annoyed.',
  always_drops: [{ item_id: 100, name: 'Bones', quantity: [1, 1] }],
  drops: [
    { item_id: 66040, name: 'Mummy wrap strip', weight: 24, quantity: [1, 3], rarity: 'common' },
    { item_id: 101, name: 'Coins', weight: 20, quantity: [25, 80], rarity: 'common' },
    { item_id: 4003, name: 'Glass sand', weight: 10, quantity: [2, 4], rarity: 'uncommon' },
    { item_id: 66045, name: 'Crypt charcoal', weight: 6, quantity: [1, 2], rarity: 'uncommon' },
  ],
});

mega({
  id: 'mega_bone_greater_mummy', name: 'Greater mummy', level: 78, hp: 95,
  combat_style: 'melee', attack_speed: 5, max_hit: 12, accuracy: 55,
  defence_stab: 38, defence_slash: 36, defence_crush: 24, defence_magic: 22, defence_ranged: 32,
  aggressive: true, region: 'boneyard', slayer_task_eligible: true, slayer_level_required: 50,
  xp_per_kill: 162, sprite: 'undead/mummy_greater', weakness: 'slash', tags: ['undead', 'armoured'], class_tags: ['armoured', 'slayer', 'undead'],
  examine: 'Wears its name on the wraps. The wraps are thick.',
  always_drops: [{ item_id: 106, name: 'Big bones', quantity: [1, 1] }],
  drops: [
    { item_id: 101, name: 'Coins', weight: 22, quantity: [140, 380], rarity: 'common' },
    { item_id: 66040, name: 'Mummy wrap strip', weight: 15, quantity: [2, 4], rarity: 'uncommon' },
    { item_id: 66046, name: 'Desert agate', weight: 6, quantity: [1, 1], rarity: 'rare' },
    { item_id: 66044, name: "Pharaoh's seal", weight: 2, quantity: [1, 1], rarity: 'very_rare' },
  ],
});

mega({
  id: 'mega_bone_pharaoh_lich', name: 'Pharaoh lich', level: 130, hp: 180,
  combat_style: 'magic', attack_speed: 4, max_hit: 18, accuracy: 95,
  defence_stab: 50, defence_slash: 50, defence_crush: 40, defence_magic: 65, defence_ranged: 45,
  aggressive: true, region: 'boneyard', slayer_task_eligible: true, slayer_level_required: 82,
  xp_per_kill: 290, sprite: 'undead/pharaoh_lich', weakness: 'ranged', tags: ['undead', 'boss'], class_tags: ['boss', 'magic_user', 'slayer', 'undead'],
  examine: 'Crowned, ancient, and very patient.',
  always_drops: [{ item_id: 106, name: 'Big bones', quantity: [2, 2] }],
  drops: [
    { item_id: 101, name: 'Coins', weight: 18, quantity: [400, 1200], rarity: 'common' },
    { item_id: 66044, name: "Pharaoh's seal", weight: 8, quantity: [1, 1], rarity: 'uncommon' },
    { item_id: 66040, name: 'Mummy wrap strip', weight: 14, quantity: [4, 8], rarity: 'uncommon' },
    { item_id: 11357, name: 'Death rune', weight: 6, quantity: [15, 30], rarity: 'rare' },
    { item_id: 66046, name: 'Desert agate', weight: 3, quantity: [1, 2], rarity: 'very_rare' },
  ],
  unique_drops: [{ item_id: 66203, name: 'Pharaoh scarab', chance: 256 }],
});

mega({
  id: 'mega_bone_shield_scarab', name: 'Shield scarab', level: 42, hp: 58,
  combat_style: 'melee', attack_speed: 4, max_hit: 7, accuracy: 30,
  defence_stab: 35, defence_slash: 30, defence_crush: 12, defence_magic: 10, defence_ranged: 28,
  aggressive: true, region: 'boneyard', slayer_task_eligible: true, slayer_level_required: 22,
  xp_per_kill: 85, sprite: 'beasts/shield_scarab', weakness: 'crush', tags: ['beast', 'armoured'], class_tags: ['armoured', 'beast', 'kalphite', 'slayer'],
  examine: 'Hard on top. Bring a hammer.',
  always_drops: [],
  drops: [
    { item_id: 66041, name: 'Scarab carapace', weight: 26, quantity: [1, 2], rarity: 'common' },
    { item_id: 101, name: 'Coins', weight: 20, quantity: [30, 90], rarity: 'common' },
    { item_id: 4003, name: 'Glass sand', weight: 10, quantity: [2, 5], rarity: 'uncommon' },
    { item_id: 66046, name: 'Desert agate', weight: 3, quantity: [1, 1], rarity: 'rare' },
  ],
});

mega({
  id: 'mega_bone_biter_scarab', name: 'Biter scarab', level: 58, hp: 65,
  combat_style: 'melee', attack_speed: 3, max_hit: 9, accuracy: 42,
  defence_stab: 22, defence_slash: 20, defence_crush: 10, defence_magic: 16, defence_ranged: 18,
  aggressive: true, region: 'boneyard', slayer_task_eligible: true, slayer_level_required: 32,
  xp_per_kill: 118, sprite: 'beasts/biter_scarab', weakness: 'slash', tags: ['beast'], class_tags: ['armoured', 'beast', 'kalphite', 'slayer'],
  examine: 'Agile, iridescent, disinclined to mercy.',
  always_drops: [],
  drops: [
    { item_id: 66041, name: 'Scarab carapace', weight: 22, quantity: [1, 3], rarity: 'common' },
    { item_id: 101, name: 'Coins', weight: 18, quantity: [50, 160], rarity: 'common' },
    { item_id: 4002, name: 'Fossilized fang', weight: 4, quantity: [1, 1], rarity: 'rare' },
  ],
});

mega({
  id: 'mega_bone_salt_stalker', name: 'Salt-stalker', level: 70, hp: 85,
  combat_style: 'melee', attack_speed: 4, max_hit: 11, accuracy: 50,
  defence_stab: 28, defence_slash: 30, defence_crush: 22, defence_magic: 18, defence_ranged: 24,
  aggressive: true, region: 'boneyard', slayer_task_eligible: true, slayer_level_required: 45,
  xp_per_kill: 148, sprite: 'beasts/salt_stalker', weakness: 'ranged', tags: ['beast'], class_tags: ['beast', 'slayer'],
  examine: 'Licks the salt flats. Licks your armour. Licks you.',
  always_drops: [{ item_id: 100, name: 'Bones', quantity: [1, 1] }],
  drops: [
    { item_id: 66042, name: 'Salt-stalker hide', weight: 24, quantity: [1, 2], rarity: 'common' },
    { item_id: 101, name: 'Coins', weight: 18, quantity: [80, 240], rarity: 'common' },
    { item_id: 4004, name: 'Bone shard', weight: 10, quantity: [2, 4], rarity: 'uncommon' },
    { item_id: 66104, name: 'Salt-vampire ichor', weight: 4, quantity: [1, 1], rarity: 'rare' },
  ],
});

mega({
  id: 'mega_bone_dust_dweller', name: 'Dust-dweller', level: 48, hp: 52,
  combat_style: 'magic', attack_speed: 4, max_hit: 8, accuracy: 34,
  defence_stab: 18, defence_slash: 16, defence_crush: 12, defence_magic: 28, defence_ranged: 20,
  aggressive: true, region: 'boneyard', slayer_task_eligible: true, slayer_level_required: 26,
  xp_per_kill: 96, sprite: 'spirit/dust_dweller', weakness: 'ranged', tags: ['elemental', 'spirit'], class_tags: ['elemental', 'magic_user', 'shadow', 'slayer'],
  examine: 'A drift of dust with teeth.',
  always_drops: [],
  drops: [
    { item_id: 66043, name: 'Dust-dweller tooth', weight: 26, quantity: [1, 2], rarity: 'common' },
    { item_id: 4003, name: 'Glass sand', weight: 18, quantity: [3, 8], rarity: 'uncommon' },
    { item_id: 101, name: 'Coins', weight: 18, quantity: [35, 110], rarity: 'common' },
    { item_id: 11350, name: 'Air rune', weight: 8, quantity: [5, 15], rarity: 'uncommon' },
  ],
});

mega({
  id: 'mega_bone_dust_tyrant', name: 'Dust tyrant', level: 95, hp: 120,
  combat_style: 'magic', attack_speed: 4, max_hit: 15, accuracy: 68,
  defence_stab: 30, defence_slash: 28, defence_crush: 22, defence_magic: 45, defence_ranged: 30,
  aggressive: true, region: 'boneyard', slayer_task_eligible: true, slayer_level_required: 62,
  xp_per_kill: 198, sprite: 'spirit/dust_tyrant', weakness: 'ranged', tags: ['elemental', 'boss'], class_tags: ['boss', 'elemental', 'magic_user', 'slayer'],
  examine: 'Claims the flats. Argues terms in dust-storms.',
  always_drops: [],
  drops: [
    { item_id: 66043, name: 'Dust-dweller tooth', weight: 22, quantity: [2, 4], rarity: 'common' },
    { item_id: 101, name: 'Coins', weight: 18, quantity: [180, 500], rarity: 'common' },
    { item_id: 4003, name: 'Glass sand', weight: 15, quantity: [6, 12], rarity: 'uncommon' },
    { item_id: 66046, name: 'Desert agate', weight: 5, quantity: [1, 2], rarity: 'rare' },
  ],
  unique_drops: [{ item_id: 66203, name: 'Pharaoh scarab', chance: 1024 }],
});

mega({
  id: 'mega_bone_sand_djinn', name: 'Sand djinn', level: 88, hp: 105,
  combat_style: 'magic', attack_speed: 4, max_hit: 14, accuracy: 60,
  defence_stab: 25, defence_slash: 25, defence_crush: 20, defence_magic: 40, defence_ranged: 22,
  aggressive: false, region: 'boneyard', slayer_task_eligible: true, slayer_level_required: 55,
  xp_per_kill: 182, sprite: 'spirit/sand_djinn', weakness: 'ranged', tags: ['elemental', 'spirit'], class_tags: ['elemental', 'magic_user', 'shadow', 'slayer'],
  examine: 'Bound to a broken lamp. Very litigious.',
  always_drops: [],
  drops: [
    { item_id: 101, name: 'Coins', weight: 18, quantity: [140, 380], rarity: 'common' },
    { item_id: 11350, name: 'Air rune', weight: 14, quantity: [10, 25], rarity: 'uncommon' },
    { item_id: 4003, name: 'Glass sand', weight: 12, quantity: [5, 10], rarity: 'uncommon' },
    { item_id: 66044, name: "Pharaoh's seal", weight: 2, quantity: [1, 1], rarity: 'very_rare' },
  ],
});

mega({
  id: 'mega_bone_canopic_guardian', name: 'Canopic guardian', level: 65, hp: 80,
  combat_style: 'melee', attack_speed: 5, max_hit: 10, accuracy: 44,
  defence_stab: 34, defence_slash: 32, defence_crush: 20, defence_magic: 18, defence_ranged: 28,
  aggressive: true, region: 'boneyard', slayer_task_eligible: false, slayer_level_required: 0,
  xp_per_kill: 135, sprite: 'construct/canopic_guardian', weakness: 'crush', tags: ['construct', 'armoured'], class_tags: ['armoured', 'construct'],
  examine: "Guards a jar with someone's lungs. Professional about it.",
  always_drops: [],
  drops: [
    { item_id: 101, name: 'Coins', weight: 20, quantity: [70, 220], rarity: 'common' },
    { item_id: 66040, name: 'Mummy wrap strip', weight: 12, quantity: [1, 3], rarity: 'uncommon' },
    { item_id: 66045, name: 'Crypt charcoal', weight: 10, quantity: [2, 4], rarity: 'uncommon' },
    { item_id: 66046, name: 'Desert agate', weight: 4, quantity: [1, 1], rarity: 'rare' },
  ],
});

mega({
  id: 'mega_bone_glass_cobra', name: 'Glass cobra', level: 32, hp: 36,
  combat_style: 'melee', attack_speed: 3, max_hit: 5, accuracy: 20,
  defence_stab: 14, defence_slash: 12, defence_crush: 16, defence_magic: 8, defence_ranged: 10,
  aggressive: true, region: 'boneyard', slayer_task_eligible: true, slayer_level_required: 12,
  xp_per_kill: 62, sprite: 'beasts/glass_cobra', weakness: 'slash', tags: ['beast'], class_tags: ['beast', 'slayer'],
  examine: 'Transparent. Venomous. Hard to see in the shimmer.',
  always_drops: [{ item_id: 100, name: 'Bones', quantity: [1, 1] }],
  drops: [
    { item_id: 101, name: 'Coins', weight: 22, quantity: [20, 70], rarity: 'common' },
    { item_id: 4003, name: 'Glass sand', weight: 18, quantity: [2, 5], rarity: 'uncommon' },
    { item_id: 66043, name: 'Dust-dweller tooth', weight: 6, quantity: [1, 1], rarity: 'rare' },
  ],
});

mega({
  id: 'mega_bone_tomb_raider', name: 'Tomb raider', level: 38, hp: 46,
  combat_style: 'ranged', attack_speed: 4, max_hit: 6, accuracy: 28,
  defence_stab: 16, defence_slash: 16, defence_crush: 12, defence_magic: 14, defence_ranged: 12,
  aggressive: true, region: 'boneyard', slayer_task_eligible: false, slayer_level_required: 0,
  xp_per_kill: 74, sprite: 'humans/tomb_raider', weakness: 'magic', tags: ['human'], class_tags: ['human', 'ranged_user'],
  examine: 'Your competition. Armed and hurried.',
  always_drops: [{ item_id: 100, name: 'Bones', quantity: [1, 1] }],
  drops: [
    { item_id: 101, name: 'Coins', weight: 26, quantity: [40, 140], rarity: 'common' },
    { item_id: 66040, name: 'Mummy wrap strip', weight: 10, quantity: [1, 2], rarity: 'uncommon' },
    { item_id: 66045, name: 'Crypt charcoal', weight: 6, quantity: [1, 2], rarity: 'uncommon' },
    { item_id: 66044, name: "Pharaoh's seal", weight: 1, quantity: [1, 1], rarity: 'very_rare' },
  ],
});

// ═══════════════════════════════════════════════════════════════════════════
// VEILWOOD — 12 (corrupted-forest things, mirror-deer, glass-spiders)
// ═══════════════════════════════════════════════════════════════════════════

mega({
  id: 'mega_veil_mirror_deer', name: 'Mirror-deer', level: 44, hp: 48,
  combat_style: 'melee', attack_speed: 3, max_hit: 7, accuracy: 28,
  defence_stab: 18, defence_slash: 18, defence_crush: 14, defence_magic: 28, defence_ranged: 20,
  aggressive: false, region: 'veilwood', slayer_task_eligible: true, slayer_level_required: 24,
  xp_per_kill: 88, sprite: 'beasts/mirror_deer', weakness: 'ranged', tags: ['beast'], class_tags: ['beast', 'slayer'],
  examine: "It sees you. You don't see it. Until it gores you.",
  always_drops: [{ item_id: 100, name: 'Bones', quantity: [1, 1] }],
  drops: [
    { item_id: 66060, name: 'Mirror-deer antler', weight: 22, quantity: [1, 2], rarity: 'common' },
    { item_id: 101, name: 'Coins', weight: 18, quantity: [40, 140], rarity: 'common' },
    { item_id: 66063, name: 'Moonglass shard', weight: 8, quantity: [1, 1], rarity: 'uncommon' },
    { item_id: 103, name: 'Raw beef', weight: 10, quantity: [1, 2], rarity: 'uncommon' },
  ],
});

mega({
  id: 'mega_veil_glass_spider', name: 'Glass-spider', level: 54, hp: 60,
  combat_style: 'melee', attack_speed: 3, max_hit: 9, accuracy: 38,
  defence_stab: 20, defence_slash: 12, defence_crush: 28, defence_magic: 16, defence_ranged: 18,
  aggressive: true, region: 'veilwood', slayer_task_eligible: true, slayer_level_required: 30,
  xp_per_kill: 114, sprite: 'beasts/glass_spider', weakness: 'crush', tags: ['beast'], class_tags: ['beast', 'slayer'],
  examine: 'Transparent, jagged, webs you in glass.',
  always_drops: [],
  drops: [
    { item_id: 66061, name: 'Glass-spider silk', weight: 24, quantity: [1, 3], rarity: 'common' },
    { item_id: 101, name: 'Coins', weight: 16, quantity: [50, 180], rarity: 'common' },
    { item_id: 66063, name: 'Moonglass shard', weight: 6, quantity: [1, 1], rarity: 'rare' },
  ],
});

mega({
  id: 'mega_veil_corrupted_dryad', name: 'Corrupted dryad', level: 68, hp: 80,
  combat_style: 'magic', attack_speed: 4, max_hit: 11, accuracy: 48,
  defence_stab: 22, defence_slash: 22, defence_crush: 18, defence_magic: 38, defence_ranged: 25,
  aggressive: true, region: 'veilwood', slayer_task_eligible: true, slayer_level_required: 42,
  xp_per_kill: 142, sprite: 'plant/corrupted_dryad', weakness: 'slash', tags: ['plant', 'spirit'], class_tags: ['magic_user', 'plant', 'shadow', 'slayer'],
  examine: 'Bark gone wrong. Leaves that whisper the wrong names.',
  always_drops: [],
  drops: [
    { item_id: 6002, name: 'Veilwood bark', weight: 22, quantity: [1, 3], rarity: 'common' },
    { item_id: 66062, name: 'Corrupted acorn', weight: 18, quantity: [1, 2], rarity: 'uncommon' },
    { item_id: 101, name: 'Coins', weight: 16, quantity: [80, 240], rarity: 'common' },
    { item_id: 66064, name: 'Veil heartwood', weight: 5, quantity: [1, 1], rarity: 'rare' },
  ],
});

mega({
  id: 'mega_veil_thornback_elk', name: 'Thornback elk', level: 51, hp: 62,
  combat_style: 'melee', attack_speed: 4, max_hit: 8, accuracy: 32,
  defence_stab: 22, defence_slash: 20, defence_crush: 16, defence_magic: 14, defence_ranged: 18,
  aggressive: true, region: 'veilwood', slayer_task_eligible: true, slayer_level_required: 28,
  xp_per_kill: 105, sprite: 'beasts/thornback_elk', weakness: 'magic', tags: ['beast', 'plant'], class_tags: ['beast', 'plant', 'slayer'],
  examine: 'Grown a thicket for a hide. Charges twice before caring.',
  always_drops: [{ item_id: 100, name: 'Bones', quantity: [1, 1] }],
  drops: [
    { item_id: 66060, name: 'Mirror-deer antler', weight: 12, quantity: [1, 1], rarity: 'uncommon' },
    { item_id: 66062, name: 'Corrupted acorn', weight: 15, quantity: [1, 2], rarity: 'uncommon' },
    { item_id: 103, name: 'Raw beef', weight: 14, quantity: [2, 3], rarity: 'uncommon' },
    { item_id: 101, name: 'Coins', weight: 16, quantity: [60, 170], rarity: 'common' },
  ],
});

mega({
  id: 'mega_veil_fey_archer', name: 'Fey archer', level: 76, hp: 88,
  combat_style: 'ranged', attack_speed: 4, max_hit: 12, accuracy: 58,
  defence_stab: 25, defence_slash: 25, defence_crush: 22, defence_magic: 30, defence_ranged: 22,
  aggressive: true, region: 'veilwood', slayer_task_eligible: false, slayer_level_required: 0,
  xp_per_kill: 160, sprite: 'fey/fey_archer', weakness: 'magic', tags: ['spirit'], class_tags: ['ranged_user', 'shadow'],
  examine: 'Borrows your arrows. Returns them point-first.',
  always_drops: [{ item_id: 100, name: 'Bones', quantity: [1, 1] }],
  drops: [
    { item_id: 101, name: 'Coins', weight: 20, quantity: [120, 330], rarity: 'common' },
    { item_id: 6003, name: 'Moonpetal', weight: 16, quantity: [1, 2], rarity: 'uncommon' },
    { item_id: 66065, name: 'Fey-wrought locket', weight: 3, quantity: [1, 1], rarity: 'rare' },
    { item_id: 11359, name: 'Nature rune', weight: 8, quantity: [6, 15], rarity: 'uncommon' },
  ],
});

mega({
  id: 'mega_veil_moonglass_warden', name: 'Moonglass warden', level: 90, hp: 110,
  combat_style: 'melee', attack_speed: 4, max_hit: 14, accuracy: 62,
  defence_stab: 38, defence_slash: 38, defence_crush: 20, defence_magic: 28, defence_ranged: 26,
  aggressive: true, region: 'veilwood', slayer_task_eligible: true, slayer_level_required: 58,
  xp_per_kill: 188, sprite: 'construct/moonglass_warden', weakness: 'crush', tags: ['construct'], class_tags: ['construct', 'human', 'slayer'],
  examine: 'Shatters when the moon is behind cloud. Reforms when it comes out.',
  always_drops: [],
  drops: [
    { item_id: 66063, name: 'Moonglass shard', weight: 24, quantity: [1, 3], rarity: 'common' },
    { item_id: 66061, name: 'Glass-spider silk', weight: 14, quantity: [1, 2], rarity: 'uncommon' },
    { item_id: 101, name: 'Coins', weight: 18, quantity: [160, 420], rarity: 'common' },
    { item_id: 66065, name: 'Fey-wrought locket', weight: 3, quantity: [1, 1], rarity: 'rare' },
  ],
  unique_drops: [{ item_id: 66204, name: 'Veil king circlet', chance: 512 }],
});

mega({
  id: 'mega_veil_root_stalker', name: 'Root stalker', level: 36, hp: 42,
  combat_style: 'melee', attack_speed: 5, max_hit: 6, accuracy: 24,
  defence_stab: 22, defence_slash: 16, defence_crush: 14, defence_magic: 10, defence_ranged: 20,
  aggressive: true, region: 'veilwood', slayer_task_eligible: true, slayer_level_required: 18,
  xp_per_kill: 74, sprite: 'plant/root_stalker', weakness: 'slash', tags: ['plant'], class_tags: ['beast', 'plant', 'slayer'],
  examine: 'Walks on its own roots. Tendril-quiet.',
  always_drops: [],
  drops: [
    { item_id: 6002, name: 'Veilwood bark', weight: 26, quantity: [1, 2], rarity: 'common' },
    { item_id: 66062, name: 'Corrupted acorn', weight: 18, quantity: [1, 2], rarity: 'uncommon' },
    { item_id: 101, name: 'Coins', weight: 16, quantity: [20, 70], rarity: 'common' },
  ],
});

mega({
  id: 'mega_veil_hollow_huntsman', name: 'Hollow huntsman', level: 62, hp: 72,
  combat_style: 'ranged', attack_speed: 4, max_hit: 10, accuracy: 44,
  defence_stab: 22, defence_slash: 22, defence_crush: 18, defence_magic: 18, defence_ranged: 18,
  aggressive: true, region: 'veilwood', slayer_task_eligible: true, slayer_level_required: 38,
  xp_per_kill: 128, sprite: 'undead/hollow_huntsman', weakness: 'magic', tags: ['undead'], class_tags: ['ranged_user', 'slayer', 'undead'],
  examine: 'Still hunting. Forgot what the prey was.',
  always_drops: [{ item_id: 100, name: 'Bones', quantity: [1, 1] }],
  drops: [
    { item_id: 101, name: 'Coins', weight: 20, quantity: [70, 210], rarity: 'common' },
    { item_id: 66060, name: 'Mirror-deer antler', weight: 10, quantity: [1, 1], rarity: 'uncommon' },
    { item_id: 103, name: 'Raw beef', weight: 12, quantity: [1, 2], rarity: 'uncommon' },
    { item_id: 66065, name: 'Fey-wrought locket', weight: 2, quantity: [1, 1], rarity: 'very_rare' },
  ],
});

mega({
  id: 'mega_veil_ink_cap_fungus', name: 'Ink-cap fungus', level: 28, hp: 30,
  combat_style: 'magic', attack_speed: 5, max_hit: 5, accuracy: 16,
  defence_stab: 8, defence_slash: 8, defence_crush: 6, defence_magic: 22, defence_ranged: 14,
  aggressive: false, region: 'veilwood', slayer_task_eligible: true, slayer_level_required: 10,
  xp_per_kill: 52, sprite: 'plant/ink_cap', weakness: 'crush', tags: ['plant'], class_tags: ['magic_user', 'plant', 'slayer'],
  examine: 'Spews black spores. Stains rich.',
  always_drops: [],
  drops: [
    { item_id: 66120, name: 'Page-spawn leaf', weight: 18, quantity: [1, 2], rarity: 'common' },
    { item_id: 6002, name: 'Veilwood bark', weight: 16, quantity: [1, 2], rarity: 'common' },
    { item_id: 101, name: 'Coins', weight: 14, quantity: [12, 45], rarity: 'common' },
    { item_id: 12001, name: 'Grimy guam', weight: 8, quantity: [1, 1], rarity: 'uncommon' },
  ],
});

mega({
  id: 'mega_veil_clockwork_owl', name: 'Clockwork owl', level: 41, hp: 38,
  combat_style: 'ranged', attack_speed: 3, max_hit: 6, accuracy: 26,
  defence_stab: 10, defence_slash: 10, defence_crush: 14, defence_magic: 14, defence_ranged: 10,
  aggressive: false, region: 'veilwood', slayer_task_eligible: true, slayer_level_required: 20,
  xp_per_kill: 82, sprite: 'construct/clockwork_owl', weakness: 'crush', tags: ['construct'], class_tags: ['construct', 'ranged_user', 'slayer'],
  examine: 'Its eyes tick. Its heart is a clock.',
  always_drops: [],
  drops: [
    { item_id: 66081, name: 'Clockwork spring', weight: 20, quantity: [1, 2], rarity: 'common' },
    { item_id: 101, name: 'Coins', weight: 16, quantity: [35, 110], rarity: 'common' },
    { item_id: 66063, name: 'Moonglass shard', weight: 6, quantity: [1, 1], rarity: 'rare' },
  ],
});

mega({
  id: 'mega_veil_glass_wolf', name: 'Glass wolf', level: 72, hp: 85,
  combat_style: 'melee', attack_speed: 3, max_hit: 11, accuracy: 52,
  defence_stab: 25, defence_slash: 14, defence_crush: 30, defence_magic: 20, defence_ranged: 22,
  aggressive: true, region: 'veilwood', slayer_task_eligible: true, slayer_level_required: 45,
  xp_per_kill: 150, sprite: 'beasts/glass_wolf', weakness: 'crush', tags: ['beast'], class_tags: ['beast', 'slayer'],
  examine: 'Runs in a pack. The pack runs on broken glass.',
  always_drops: [{ item_id: 100, name: 'Bones', quantity: [1, 1] }],
  drops: [
    { item_id: 66061, name: 'Glass-spider silk', weight: 16, quantity: [1, 2], rarity: 'uncommon' },
    { item_id: 66063, name: 'Moonglass shard', weight: 12, quantity: [1, 1], rarity: 'uncommon' },
    { item_id: 101, name: 'Coins', weight: 20, quantity: [100, 300], rarity: 'common' },
    { item_id: 66142, name: 'Crystal hunter pelt', weight: 4, quantity: [1, 1], rarity: 'rare' },
  ],
});

mega({
  id: 'mega_veil_king_of_the_wood', name: 'King of the Wood', level: 132, hp: 200,
  combat_style: 'melee', attack_speed: 4, max_hit: 19, accuracy: 98,
  defence_stab: 55, defence_slash: 55, defence_crush: 40, defence_magic: 45, defence_ranged: 40,
  aggressive: true, region: 'veilwood', slayer_task_eligible: true, slayer_level_required: 85,
  xp_per_kill: 320, sprite: 'boss/king_of_the_wood', weakness: 'magic', tags: ['plant', 'boss'], class_tags: ['boss', 'plant', 'slayer'],
  examine: 'Crowned with antlers. Crowned with moss. Crowned too long.',
  always_drops: [{ item_id: 106, name: 'Big bones', quantity: [1, 2] }],
  drops: [
    { item_id: 101, name: 'Coins', weight: 18, quantity: [500, 1300], rarity: 'common' },
    { item_id: 66064, name: 'Veil heartwood', weight: 12, quantity: [1, 2], rarity: 'uncommon' },
    { item_id: 66060, name: 'Mirror-deer antler', weight: 10, quantity: [2, 3], rarity: 'uncommon' },
    { item_id: 66065, name: 'Fey-wrought locket', weight: 5, quantity: [1, 1], rarity: 'rare' },
    { item_id: 66063, name: 'Moonglass shard', weight: 4, quantity: [2, 3], rarity: 'rare' },
  ],
  unique_drops: [{ item_id: 66204, name: 'Veil king circlet', chance: 256 }],
});

// ═══════════════════════════════════════════════════════════════════════════
// SOOTWORKS — 12 (clockwork constructs, forge-wraiths, rust-golems)
// ═══════════════════════════════════════════════════════════════════════════

mega({
  id: 'mega_soot_rust_golem', name: 'Rust-golem', level: 62, hp: 90,
  combat_style: 'melee', attack_speed: 5, max_hit: 10, accuracy: 42,
  defence_stab: 40, defence_slash: 36, defence_crush: 18, defence_magic: 22, defence_ranged: 34,
  aggressive: true, region: 'sootworks', slayer_task_eligible: true, slayer_level_required: 36,
  xp_per_kill: 130, sprite: 'construct/rust_golem', weakness: 'crush', tags: ['construct', 'armoured'], class_tags: ['armoured', 'construct', 'slayer'],
  examine: 'Oxide skin. Angry oxide skin.',
  always_drops: [],
  drops: [
    { item_id: 66080, name: 'Rust flake', weight: 28, quantity: [2, 6], rarity: 'common' },
    { item_id: 2112, name: 'Iron bar', weight: 14, quantity: [1, 3], rarity: 'uncommon' },
    { item_id: 101, name: 'Coins', weight: 18, quantity: [70, 220], rarity: 'common' },
    { item_id: 66083, name: 'Rust-golem core', weight: 2, quantity: [1, 1], rarity: 'very_rare' },
  ],
});

mega({
  id: 'mega_soot_clockwork_sentinel', name: 'Clockwork sentinel', level: 78, hp: 100,
  combat_style: 'ranged', attack_speed: 4, max_hit: 12, accuracy: 55,
  defence_stab: 35, defence_slash: 35, defence_crush: 22, defence_magic: 20, defence_ranged: 30,
  aggressive: true, region: 'sootworks', slayer_task_eligible: true, slayer_level_required: 48,
  xp_per_kill: 162, sprite: 'construct/clockwork_sentinel', weakness: 'magic', tags: ['construct', 'armoured'], class_tags: ['armoured', 'construct', 'ranged_user', 'slayer'],
  examine: 'Ticks on patrol. Off-duty never.',
  always_drops: [],
  drops: [
    { item_id: 66081, name: 'Clockwork spring', weight: 22, quantity: [1, 3], rarity: 'common' },
    { item_id: 66085, name: 'Oiled linkage', weight: 14, quantity: [1, 2], rarity: 'uncommon' },
    { item_id: 101, name: 'Coins', weight: 18, quantity: [120, 330], rarity: 'common' },
    { item_id: 7003, name: 'Clockwork gear', weight: 10, quantity: [1, 2], rarity: 'uncommon' },
  ],
});

mega({
  id: 'mega_soot_forge_wraith', name: 'Forge-wraith', level: 84, hp: 95,
  combat_style: 'magic', attack_speed: 4, max_hit: 13, accuracy: 60,
  defence_stab: 18, defence_slash: 18, defence_crush: 14, defence_magic: 42, defence_ranged: 22,
  aggressive: true, region: 'sootworks', slayer_task_eligible: true, slayer_level_required: 52,
  xp_per_kill: 178, sprite: 'spirit/forge_wraith', weakness: 'ranged', tags: ['spirit', 'elemental'], class_tags: ['elemental', 'magic_user', 'shadow', 'slayer', 'undead'],
  examine: 'Was a smith. Is now the heat.',
  always_drops: [],
  drops: [
    { item_id: 66082, name: 'Forge-wraith essence', weight: 20, quantity: [1, 2], rarity: 'common' },
    { item_id: 101, name: 'Coins', weight: 18, quantity: [140, 380], rarity: 'common' },
    { item_id: 11353, name: 'Fire rune', weight: 12, quantity: [15, 35], rarity: 'uncommon' },
    { item_id: 66083, name: 'Rust-golem core', weight: 3, quantity: [1, 1], rarity: 'rare' },
  ],
  unique_drops: [{ item_id: 66205, name: 'Sootlord ingot', chance: 1024 }],
});

mega({
  id: 'mega_soot_soot_sprite', name: 'Soot sprite', level: 18, hp: 20,
  combat_style: 'magic', attack_speed: 4, max_hit: 3, accuracy: 10,
  defence_stab: 6, defence_slash: 6, defence_crush: 4, defence_magic: 12, defence_ranged: 8,
  aggressive: true, region: 'sootworks', slayer_task_eligible: true, slayer_level_required: 2,
  xp_per_kill: 32, sprite: 'spirit/soot_sprite', weakness: 'ranged', tags: ['spirit', 'elemental'], class_tags: ['elemental', 'magic_user', 'shadow', 'slayer'],
  examine: 'A grubby little flame with opinions.',
  always_drops: [],
  drops: [
    { item_id: 66084, name: 'Soot-smothered cog', weight: 20, quantity: [1, 2], rarity: 'common' },
    { item_id: 66080, name: 'Rust flake', weight: 18, quantity: [1, 3], rarity: 'common' },
    { item_id: 101, name: 'Coins', weight: 12, quantity: [5, 25], rarity: 'common' },
    { item_id: 11353, name: 'Fire rune', weight: 6, quantity: [3, 8], rarity: 'uncommon' },
  ],
});

mega({
  id: 'mega_soot_gearbeast', name: 'Gearbeast', level: 46, hp: 70,
  combat_style: 'melee', attack_speed: 4, max_hit: 7, accuracy: 30,
  defence_stab: 30, defence_slash: 28, defence_crush: 12, defence_magic: 14, defence_ranged: 24,
  aggressive: true, region: 'sootworks', slayer_task_eligible: true, slayer_level_required: 24,
  xp_per_kill: 95, sprite: 'construct/gearbeast', weakness: 'crush', tags: ['construct'], class_tags: ['beast', 'construct', 'slayer'],
  examine: 'A boar made of cogs. A disastrous idea, cogently.',
  always_drops: [],
  drops: [
    { item_id: 66081, name: 'Clockwork spring', weight: 18, quantity: [1, 2], rarity: 'common' },
    { item_id: 7003, name: 'Clockwork gear', weight: 20, quantity: [1, 3], rarity: 'common' },
    { item_id: 66085, name: 'Oiled linkage', weight: 12, quantity: [1, 1], rarity: 'uncommon' },
    { item_id: 101, name: 'Coins', weight: 18, quantity: [40, 120], rarity: 'common' },
  ],
});

mega({
  id: 'mega_soot_bellows_imp', name: 'Bellows imp', level: 22, hp: 22,
  combat_style: 'magic', attack_speed: 4, max_hit: 4, accuracy: 14,
  defence_stab: 6, defence_slash: 6, defence_crush: 4, defence_magic: 16, defence_ranged: 10,
  aggressive: true, region: 'sootworks', slayer_task_eligible: false, slayer_level_required: 0,
  xp_per_kill: 40, sprite: 'demon/bellows_imp', weakness: 'ranged', tags: ['demon', 'elemental'], class_tags: ['demon', 'elemental', 'magic_user'],
  examine: 'Works the bellows. Pockets the change.',
  always_drops: [],
  drops: [
    { item_id: 101, name: 'Coins', weight: 22, quantity: [8, 35], rarity: 'common' },
    { item_id: 66084, name: 'Soot-smothered cog', weight: 16, quantity: [1, 2], rarity: 'common' },
    { item_id: 11353, name: 'Fire rune', weight: 10, quantity: [3, 8], rarity: 'uncommon' },
  ],
});

mega({
  id: 'mega_soot_smoker_dwarf', name: 'Smoker dwarf', level: 40, hp: 50,
  combat_style: 'melee', attack_speed: 4, max_hit: 7, accuracy: 26,
  defence_stab: 20, defence_slash: 20, defence_crush: 16, defence_magic: 12, defence_ranged: 18,
  aggressive: true, region: 'sootworks', slayer_task_eligible: false, slayer_level_required: 0,
  xp_per_kill: 84, sprite: 'humans/smoker_dwarf', weakness: 'stab', tags: ['human', 'dwarf'], class_tags: ['human'],
  examine: 'Smokes two pipes. Coughs fit to break teeth.',
  always_drops: [{ item_id: 100, name: 'Bones', quantity: [1, 1] }],
  drops: [
    { item_id: 101, name: 'Coins', weight: 22, quantity: [30, 100], rarity: 'common' },
    { item_id: 2104, name: 'Coal', weight: 16, quantity: [2, 5], rarity: 'common' },
    { item_id: 66084, name: 'Soot-smothered cog', weight: 10, quantity: [1, 2], rarity: 'uncommon' },
    { item_id: 7001, name: 'Soot-iron ore', weight: 6, quantity: [1, 2], rarity: 'rare' },
  ],
});

mega({
  id: 'mega_soot_furnace_horror', name: 'Furnace horror', level: 108, hp: 150,
  combat_style: 'melee', attack_speed: 5, max_hit: 16, accuracy: 78,
  defence_stab: 48, defence_slash: 48, defence_crush: 30, defence_magic: 35, defence_ranged: 40,
  aggressive: true, region: 'sootworks', slayer_task_eligible: true, slayer_level_required: 68,
  xp_per_kill: 228, sprite: 'demon/furnace_horror', weakness: 'magic', tags: ['demon', 'elemental', 'armoured'], class_tags: ['armoured', 'beast', 'demon', 'elemental', 'slayer'],
  examine: 'A demon that climbed out of a blast furnace. Smells like something new.',
  always_drops: [],
  drops: [
    { item_id: 101, name: 'Coins', weight: 18, quantity: [260, 720], rarity: 'common' },
    { item_id: 66082, name: 'Forge-wraith essence', weight: 16, quantity: [1, 2], rarity: 'uncommon' },
    { item_id: 2115, name: 'Adamantite bar', weight: 8, quantity: [1, 2], rarity: 'uncommon' },
    { item_id: 66083, name: 'Rust-golem core', weight: 5, quantity: [1, 1], rarity: 'rare' },
  ],
  unique_drops: [{ item_id: 66205, name: 'Sootlord ingot', chance: 512 }],
});

mega({
  id: 'mega_soot_iron_wight', name: 'Iron wight', level: 55, hp: 72,
  combat_style: 'melee', attack_speed: 4, max_hit: 9, accuracy: 40,
  defence_stab: 32, defence_slash: 30, defence_crush: 16, defence_magic: 18, defence_ranged: 26,
  aggressive: true, region: 'sootworks', slayer_task_eligible: true, slayer_level_required: 32,
  xp_per_kill: 115, sprite: 'undead/iron_wight', weakness: 'crush', tags: ['undead', 'armoured'], class_tags: ['armoured', 'slayer', 'undead'],
  examine: 'Rusted armour that moves without a body.',
  always_drops: [{ item_id: 100, name: 'Bones', quantity: [1, 1] }],
  drops: [
    { item_id: 66080, name: 'Rust flake', weight: 24, quantity: [2, 5], rarity: 'common' },
    { item_id: 2112, name: 'Iron bar', weight: 14, quantity: [1, 2], rarity: 'uncommon' },
    { item_id: 101, name: 'Coins', weight: 18, quantity: [60, 190], rarity: 'common' },
    { item_id: 66083, name: 'Rust-golem core', weight: 2, quantity: [1, 1], rarity: 'very_rare' },
  ],
});

mega({
  id: 'mega_soot_anvil_ogre', name: 'Anvil ogre', level: 72, hp: 110,
  combat_style: 'melee', attack_speed: 5, max_hit: 13, accuracy: 48,
  defence_stab: 34, defence_slash: 32, defence_crush: 20, defence_magic: 18, defence_ranged: 28,
  aggressive: true, region: 'sootworks', slayer_task_eligible: true, slayer_level_required: 44,
  xp_per_kill: 145, sprite: 'beasts/anvil_ogre', weakness: 'magic', tags: ['beast', 'armoured'], class_tags: ['armoured', 'beast', 'giant', 'slayer'],
  examine: 'Uses an anvil as a mace. The anvil uses him back.',
  always_drops: [{ item_id: 106, name: 'Big bones', quantity: [1, 1] }],
  drops: [
    { item_id: 2113, name: 'Steel bar', weight: 14, quantity: [1, 2], rarity: 'uncommon' },
    { item_id: 101, name: 'Coins', weight: 18, quantity: [100, 280], rarity: 'common' },
    { item_id: 7003, name: 'Clockwork gear', weight: 10, quantity: [1, 2], rarity: 'uncommon' },
    { item_id: 66085, name: 'Oiled linkage', weight: 8, quantity: [1, 1], rarity: 'rare' },
  ],
});

mega({
  id: 'mega_soot_steam_houndling', name: 'Steam houndling', level: 33, hp: 38,
  combat_style: 'melee', attack_speed: 3, max_hit: 5, accuracy: 22,
  defence_stab: 14, defence_slash: 12, defence_crush: 8, defence_magic: 14, defence_ranged: 16,
  aggressive: true, region: 'sootworks', slayer_task_eligible: true, slayer_level_required: 14,
  xp_per_kill: 66, sprite: 'construct/steam_houndling', weakness: 'stab', tags: ['construct'], class_tags: ['construct', 'slayer'],
  examine: 'Vents steam as it runs. Tastes of copper.',
  always_drops: [],
  drops: [
    { item_id: 66081, name: 'Clockwork spring', weight: 20, quantity: [1, 2], rarity: 'common' },
    { item_id: 7004, name: 'Steam valve', weight: 12, quantity: [1, 2], rarity: 'uncommon' },
    { item_id: 101, name: 'Coins', weight: 16, quantity: [18, 70], rarity: 'common' },
  ],
});

mega({
  id: 'mega_soot_slag_elemental', name: 'Slag elemental', level: 60, hp: 80,
  combat_style: 'magic', attack_speed: 4, max_hit: 10, accuracy: 42,
  defence_stab: 24, defence_slash: 24, defence_crush: 18, defence_magic: 30, defence_ranged: 22,
  aggressive: true, region: 'sootworks', slayer_task_eligible: true, slayer_level_required: 38,
  xp_per_kill: 125, sprite: 'spirit/slag_elemental', weakness: 'ranged', tags: ['elemental'], class_tags: ['elemental', 'magic_user', 'slayer'],
  examine: 'Poured out of a kiln and refuses to return.',
  always_drops: [],
  drops: [
    { item_id: 66082, name: 'Forge-wraith essence', weight: 18, quantity: [1, 2], rarity: 'common' },
    { item_id: 101, name: 'Coins', weight: 18, quantity: [70, 220], rarity: 'common' },
    { item_id: 11353, name: 'Fire rune', weight: 10, quantity: [10, 25], rarity: 'uncommon' },
    { item_id: 66080, name: 'Rust flake', weight: 12, quantity: [2, 4], rarity: 'uncommon' },
  ],
});

// ═══════════════════════════════════════════════════════════════════════════
// SALTBRINE — 12 (brine-trolls, kraken-spawn, salt-vampires, drowners)
// ═══════════════════════════════════════════════════════════════════════════

mega({
  id: 'mega_salt_brine_troll', name: 'Brine troll', level: 58, hp: 82,
  combat_style: 'melee', attack_speed: 5, max_hit: 10, accuracy: 38,
  defence_stab: 26, defence_slash: 26, defence_crush: 16, defence_magic: 16, defence_ranged: 22,
  aggressive: true, region: 'saltbrine', slayer_task_eligible: true, slayer_level_required: 30,
  xp_per_kill: 118, sprite: 'beasts/brine_troll', weakness: 'magic', tags: ['beast'], class_tags: ['beast', 'giant', 'slayer'],
  examine: 'Salt-crusted. Splits rocks with its teeth.',
  always_drops: [{ item_id: 106, name: 'Big bones', quantity: [1, 1] }],
  drops: [
    { item_id: 66100, name: 'Brine troll tusk', weight: 24, quantity: [1, 2], rarity: 'common' },
    { item_id: 101, name: 'Coins', weight: 18, quantity: [70, 210], rarity: 'common' },
    { item_id: 66105, name: 'Wreck-nail', weight: 14, quantity: [2, 4], rarity: 'uncommon' },
    { item_id: 8006, name: 'Coral fragment', weight: 8, quantity: [1, 2], rarity: 'uncommon' },
  ],
});

mega({
  id: 'mega_salt_kraken_spawn', name: 'Kraken-spawn', level: 68, hp: 85,
  combat_style: 'magic', attack_speed: 3, max_hit: 11, accuracy: 48,
  defence_stab: 18, defence_slash: 16, defence_crush: 14, defence_magic: 32, defence_ranged: 20,
  aggressive: true, region: 'saltbrine', slayer_task_eligible: true, slayer_level_required: 42,
  xp_per_kill: 142, sprite: 'beasts/kraken_spawn', weakness: 'slash', tags: ['beast'], class_tags: ['beast', 'magic_user', 'slayer'],
  examine: 'Small. Many. Chittering.',
  always_drops: [],
  drops: [
    { item_id: 66101, name: 'Kraken-spawn beak', weight: 22, quantity: [1, 2], rarity: 'common' },
    { item_id: 101, name: 'Coins', weight: 18, quantity: [80, 240], rarity: 'common' },
    { item_id: 2306, name: 'Raw shark', weight: 10, quantity: [1, 1], rarity: 'uncommon' },
    { item_id: 66102, name: 'Drowner lantern', weight: 3, quantity: [1, 1], rarity: 'rare' },
  ],
});

mega({
  id: 'mega_salt_drowner', name: 'Drowner', level: 52, hp: 65,
  combat_style: 'melee', attack_speed: 4, max_hit: 9, accuracy: 36,
  defence_stab: 20, defence_slash: 20, defence_crush: 16, defence_magic: 16, defence_ranged: 18,
  aggressive: true, region: 'saltbrine', slayer_task_eligible: true, slayer_level_required: 28,
  xp_per_kill: 106, sprite: 'undead/drowner', weakness: 'crush', tags: ['undead'], class_tags: ['slayer', 'undead'],
  examine: 'Came up from the wreck. Still sloshing.',
  always_drops: [{ item_id: 100, name: 'Bones', quantity: [1, 1] }],
  drops: [
    { item_id: 101, name: 'Coins', weight: 22, quantity: [50, 160], rarity: 'common' },
    { item_id: 66105, name: 'Wreck-nail', weight: 18, quantity: [2, 5], rarity: 'uncommon' },
    { item_id: 66103, name: 'Pickled heart', weight: 8, quantity: [1, 1], rarity: 'rare' },
    { item_id: 8003, name: 'Pirate rum', weight: 6, quantity: [1, 1], rarity: 'rare' },
  ],
});

mega({
  id: 'mega_salt_salt_vampire_spawn', name: 'Salt-vampire spawn', level: 42, hp: 48,
  combat_style: 'melee', attack_speed: 3, max_hit: 7, accuracy: 28,
  defence_stab: 14, defence_slash: 14, defence_crush: 12, defence_magic: 20, defence_ranged: 12,
  aggressive: true, region: 'saltbrine', slayer_task_eligible: true, slayer_level_required: 22,
  xp_per_kill: 88, sprite: 'vampyre/salt_vampire_spawn', weakness: 'crush', tags: ['vampyre', 'undead'], class_tags: ['slayer', 'undead', 'vampyre'],
  examine: 'Young. Hungry. Still flinches at gulls.',
  always_drops: [],
  drops: [
    { item_id: 66022, name: 'Salt vampire fang', weight: 14, quantity: [1, 1], rarity: 'uncommon' },
    { item_id: 66104, name: 'Salt-vampire ichor', weight: 18, quantity: [1, 2], rarity: 'common' },
    { item_id: 101, name: 'Coins', weight: 18, quantity: [30, 100], rarity: 'common' },
  ],
});

mega({
  id: 'mega_salt_tidewalker', name: 'Tidewalker', level: 80, hp: 105,
  combat_style: 'melee', attack_speed: 4, max_hit: 12, accuracy: 54,
  defence_stab: 28, defence_slash: 28, defence_crush: 22, defence_magic: 28, defence_ranged: 24,
  aggressive: true, region: 'saltbrine', slayer_task_eligible: true, slayer_level_required: 50,
  xp_per_kill: 168, sprite: 'beasts/tidewalker', weakness: 'magic', tags: ['beast'], class_tags: ['beast', 'slayer'],
  examine: 'Legs are kelp. Arms are anchor-chain. Teeth are whatever it ate yesterday.',
  always_drops: [{ item_id: 100, name: 'Bones', quantity: [1, 1] }],
  drops: [
    { item_id: 101, name: 'Coins', weight: 20, quantity: [140, 380], rarity: 'common' },
    { item_id: 66100, name: 'Brine troll tusk', weight: 12, quantity: [1, 1], rarity: 'uncommon' },
    { item_id: 2306, name: 'Raw shark', weight: 14, quantity: [1, 2], rarity: 'uncommon' },
    { item_id: 66102, name: 'Drowner lantern', weight: 4, quantity: [1, 1], rarity: 'rare' },
  ],
});

mega({
  id: 'mega_salt_kraken_matriarch', name: 'Kraken matriarch', level: 140, hp: 240,
  combat_style: 'magic', attack_speed: 4, max_hit: 20, accuracy: 100,
  defence_stab: 40, defence_slash: 35, defence_crush: 30, defence_magic: 55, defence_ranged: 40,
  aggressive: true, region: 'saltbrine', slayer_task_eligible: true, slayer_level_required: 88,
  xp_per_kill: 320, sprite: 'boss/kraken_matriarch', weakness: 'ranged', tags: ['beast', 'boss'], class_tags: ['beast', 'boss', 'magic_user', 'slayer'],
  examine: 'She is where all the sailors went.',
  always_drops: [{ item_id: 106, name: 'Big bones', quantity: [2, 2] }],
  drops: [
    { item_id: 101, name: 'Coins', weight: 18, quantity: [600, 1600], rarity: 'common' },
    { item_id: 66101, name: 'Kraken-spawn beak', weight: 16, quantity: [3, 6], rarity: 'uncommon' },
    { item_id: 66102, name: 'Drowner lantern', weight: 8, quantity: [1, 2], rarity: 'rare' },
    { item_id: 2306, name: 'Raw shark', weight: 14, quantity: [3, 5], rarity: 'uncommon' },
    { item_id: 11358, name: 'Blood rune', weight: 4, quantity: [10, 25], rarity: 'rare' },
  ],
  unique_drops: [{ item_id: 66206, name: 'Brine crown', chance: 256 }],
});

mega({
  id: 'mega_salt_reefdog', name: 'Reefdog', level: 36, hp: 44,
  combat_style: 'melee', attack_speed: 3, max_hit: 6, accuracy: 22,
  defence_stab: 14, defence_slash: 14, defence_crush: 10, defence_magic: 10, defence_ranged: 16,
  aggressive: true, region: 'saltbrine', slayer_task_eligible: true, slayer_level_required: 16,
  xp_per_kill: 72, sprite: 'beasts/reefdog', weakness: 'magic', tags: ['beast'], class_tags: ['beast', 'slayer'],
  examine: 'Sharkish dog. Doggish shark.',
  always_drops: [{ item_id: 100, name: 'Bones', quantity: [1, 1] }],
  drops: [
    { item_id: 2306, name: 'Raw shark', weight: 12, quantity: [1, 1], rarity: 'uncommon' },
    { item_id: 8004, name: 'Barnacle shell', weight: 18, quantity: [1, 3], rarity: 'common' },
    { item_id: 101, name: 'Coins', weight: 18, quantity: [20, 70], rarity: 'common' },
  ],
});

mega({
  id: 'mega_salt_coral_lancer', name: 'Coral lancer', level: 47, hp: 55,
  combat_style: 'ranged', attack_speed: 4, max_hit: 7, accuracy: 30,
  defence_stab: 18, defence_slash: 18, defence_crush: 14, defence_magic: 20, defence_ranged: 14,
  aggressive: true, region: 'saltbrine', slayer_task_eligible: true, slayer_level_required: 26,
  xp_per_kill: 96, sprite: 'beasts/coral_lancer', weakness: 'magic', tags: ['beast'], class_tags: ['beast', 'ranged_user', 'slayer'],
  examine: 'Fires coral spikes from its back.',
  always_drops: [],
  drops: [
    { item_id: 8006, name: 'Coral fragment', weight: 24, quantity: [1, 2], rarity: 'common' },
    { item_id: 101, name: 'Coins', weight: 18, quantity: [45, 140], rarity: 'common' },
    { item_id: 2306, name: 'Raw shark', weight: 8, quantity: [1, 1], rarity: 'uncommon' },
  ],
});

mega({
  id: 'mega_salt_wreckmarrow', name: 'Wreckmarrow', level: 64, hp: 78,
  combat_style: 'melee', attack_speed: 4, max_hit: 10, accuracy: 42,
  defence_stab: 24, defence_slash: 24, defence_crush: 18, defence_magic: 18, defence_ranged: 22,
  aggressive: true, region: 'saltbrine', slayer_task_eligible: true, slayer_level_required: 36,
  xp_per_kill: 132, sprite: 'undead/wreckmarrow', weakness: 'ranged', tags: ['undead'], class_tags: ['slayer', 'undead'],
  examine: 'A skeleton made of things the sea refused.',
  always_drops: [{ item_id: 100, name: 'Bones', quantity: [1, 1] }],
  drops: [
    { item_id: 66105, name: 'Wreck-nail', weight: 22, quantity: [3, 6], rarity: 'common' },
    { item_id: 101, name: 'Coins', weight: 18, quantity: [60, 180], rarity: 'common' },
    { item_id: 66103, name: 'Pickled heart', weight: 8, quantity: [1, 1], rarity: 'rare' },
  ],
});

mega({
  id: 'mega_salt_ashpool_drinker', name: 'Ashpool drinker', level: 54, hp: 64,
  combat_style: 'magic', attack_speed: 4, max_hit: 9, accuracy: 36,
  defence_stab: 16, defence_slash: 16, defence_crush: 14, defence_magic: 26, defence_ranged: 16,
  aggressive: false, region: 'saltbrine', slayer_task_eligible: true, slayer_level_required: 30,
  xp_per_kill: 108, sprite: 'beasts/ashpool_drinker', weakness: 'ranged', tags: ['beast'], class_tags: ['beast', 'magic_user', 'slayer'],
  examine: 'Laps at tidal ash-pools. Breathes steam.',
  always_drops: [],
  drops: [
    { item_id: 5001, name: 'Vial of blood', weight: 10, quantity: [1, 1], rarity: 'uncommon' },
    { item_id: 66104, name: 'Salt-vampire ichor', weight: 8, quantity: [1, 1], rarity: 'uncommon' },
    { item_id: 101, name: 'Coins', weight: 18, quantity: [40, 120], rarity: 'common' },
    { item_id: 8006, name: 'Coral fragment', weight: 14, quantity: [1, 2], rarity: 'uncommon' },
  ],
});

mega({
  id: 'mega_salt_lamprey_rider', name: 'Lamprey rider', level: 28, hp: 30,
  combat_style: 'ranged', attack_speed: 4, max_hit: 4, accuracy: 18,
  defence_stab: 8, defence_slash: 8, defence_crush: 6, defence_magic: 10, defence_ranged: 8,
  aggressive: true, region: 'saltbrine', slayer_task_eligible: false, slayer_level_required: 0,
  xp_per_kill: 54, sprite: 'humans/lamprey_rider', weakness: 'magic', tags: ['human'], class_tags: ['giant', 'human', 'ranged_user'],
  examine: 'Rides a giant lamprey. Don\'t ask. Really.',
  always_drops: [{ item_id: 100, name: 'Bones', quantity: [1, 1] }],
  drops: [
    { item_id: 101, name: 'Coins', weight: 24, quantity: [18, 65], rarity: 'common' },
    { item_id: 8003, name: 'Pirate rum', weight: 10, quantity: [1, 1], rarity: 'uncommon' },
    { item_id: 66105, name: 'Wreck-nail', weight: 8, quantity: [1, 2], rarity: 'uncommon' },
  ],
});

mega({
  id: 'mega_salt_sea_hag', name: 'Sea hag', level: 98, hp: 120,
  combat_style: 'magic', attack_speed: 4, max_hit: 15, accuracy: 72,
  defence_stab: 22, defence_slash: 22, defence_crush: 18, defence_magic: 48, defence_ranged: 20,
  aggressive: true, region: 'saltbrine', slayer_task_eligible: true, slayer_level_required: 65,
  xp_per_kill: 210, sprite: 'humans/sea_hag', weakness: 'ranged', tags: ['human', 'spirit'], class_tags: ['human', 'magic_user', 'shadow', 'slayer'],
  examine: 'Has sixteen husbands, all drowned. None regretted.',
  always_drops: [{ item_id: 100, name: 'Bones', quantity: [1, 1] }],
  drops: [
    { item_id: 101, name: 'Coins', weight: 20, quantity: [180, 480], rarity: 'common' },
    { item_id: 66103, name: 'Pickled heart', weight: 14, quantity: [1, 2], rarity: 'uncommon' },
    { item_id: 66104, name: 'Salt-vampire ichor', weight: 10, quantity: [1, 2], rarity: 'uncommon' },
    { item_id: 66102, name: 'Drowner lantern', weight: 4, quantity: [1, 1], rarity: 'rare' },
    { item_id: 12005, name: 'Grimy ranarr', weight: 6, quantity: [1, 2], rarity: 'rare' },
  ],
  unique_drops: [{ item_id: 66206, name: 'Brine crown', chance: 1024 }],
});

// ═══════════════════════════════════════════════════════════════════════════
// INKWEALD — 12 (page-spawn, mirror-stalkers, ink-shaped, forgotten-names)
// ═══════════════════════════════════════════════════════════════════════════

mega({
  id: 'mega_ink_page_spawn', name: 'Page-spawn', level: 30, hp: 35,
  combat_style: 'magic', attack_speed: 4, max_hit: 5, accuracy: 18,
  defence_stab: 4, defence_slash: 4, defence_crush: 2, defence_magic: 28, defence_ranged: 18,
  aggressive: true, region: 'inkweald', slayer_task_eligible: true, slayer_level_required: 12,
  xp_per_kill: 58, sprite: 'spirit/page_spawn', weakness: 'crush', tags: ['spirit'], class_tags: ['magic_user', 'shadow', 'slayer'],
  examine: 'Torn from a book. Still bleeds the text.',
  always_drops: [],
  drops: [
    { item_id: 66120, name: 'Page-spawn leaf', weight: 26, quantity: [2, 4], rarity: 'common' },
    { item_id: 101, name: 'Coins', weight: 16, quantity: [18, 60], rarity: 'common' },
    { item_id: 66124, name: 'Marginalia scrap', weight: 14, quantity: [1, 2], rarity: 'uncommon' },
    { item_id: 11359, name: 'Nature rune', weight: 6, quantity: [3, 8], rarity: 'rare' },
  ],
});

mega({
  id: 'mega_ink_mirror_stalker', name: 'Mirror-stalker', level: 62, hp: 72,
  combat_style: 'melee', attack_speed: 3, max_hit: 10, accuracy: 44,
  defence_stab: 22, defence_slash: 22, defence_crush: 18, defence_magic: 26, defence_ranged: 18,
  aggressive: true, region: 'inkweald', slayer_task_eligible: true, slayer_level_required: 38,
  xp_per_kill: 128, sprite: 'spirit/mirror_stalker', weakness: 'magic', tags: ['spirit'], class_tags: ['beast', 'shadow', 'slayer'],
  examine: 'Lives in reflections. You have to close the door.',
  always_drops: [],
  drops: [
    { item_id: 66123, name: 'Mirror-stalker fragment', weight: 22, quantity: [1, 2], rarity: 'common' },
    { item_id: 101, name: 'Coins', weight: 18, quantity: [70, 200], rarity: 'common' },
    { item_id: 66063, name: 'Moonglass shard', weight: 6, quantity: [1, 1], rarity: 'rare' },
    { item_id: 66124, name: 'Marginalia scrap', weight: 10, quantity: [1, 2], rarity: 'uncommon' },
  ],
});

mega({
  id: 'mega_ink_shaped', name: 'Ink-shaped', level: 88, hp: 110,
  combat_style: 'magic', attack_speed: 4, max_hit: 13, accuracy: 62,
  defence_stab: 20, defence_slash: 20, defence_crush: 14, defence_magic: 38, defence_ranged: 22,
  aggressive: true, region: 'inkweald', slayer_task_eligible: true, slayer_level_required: 56,
  xp_per_kill: 185, sprite: 'spirit/ink_shaped', weakness: 'ranged', tags: ['spirit'], class_tags: ['magic_user', 'shadow', 'slayer'],
  examine: 'A man-shape drawn in black. Keeps redrawing itself.',
  always_drops: [],
  drops: [
    { item_id: 66121, name: 'Ink-shaped heart', weight: 20, quantity: [1, 1], rarity: 'common' },
    { item_id: 66120, name: 'Page-spawn leaf', weight: 18, quantity: [2, 4], rarity: 'common' },
    { item_id: 101, name: 'Coins', weight: 18, quantity: [140, 380], rarity: 'common' },
    { item_id: 66122, name: 'Forgotten-name token', weight: 4, quantity: [1, 1], rarity: 'rare' },
  ],
  unique_drops: [{ item_id: 66207, name: 'Bound chapter', chance: 1024 }],
});

mega({
  id: 'mega_ink_forgotten_name', name: 'Forgotten-name', level: 120, hp: 160,
  combat_style: 'magic', attack_speed: 4, max_hit: 17, accuracy: 90,
  defence_stab: 28, defence_slash: 28, defence_crush: 22, defence_magic: 50, defence_ranged: 30,
  aggressive: true, region: 'inkweald', slayer_task_eligible: true, slayer_level_required: 78,
  xp_per_kill: 260, sprite: 'boss/forgotten_name', weakness: 'ranged', tags: ['spirit', 'boss'], class_tags: ['boss', 'magic_user', 'shadow', 'slayer'],
  examine: 'You felt it the moment it felt you. It thinks itself into being.',
  always_drops: [{ item_id: 106, name: 'Big bones', quantity: [1, 2] }],
  drops: [
    { item_id: 101, name: 'Coins', weight: 18, quantity: [420, 1100], rarity: 'common' },
    { item_id: 66122, name: 'Forgotten-name token', weight: 14, quantity: [1, 2], rarity: 'uncommon' },
    { item_id: 66121, name: 'Ink-shaped heart', weight: 10, quantity: [1, 1], rarity: 'uncommon' },
    { item_id: 66125, name: 'Chapter-bone', weight: 8, quantity: [1, 1], rarity: 'rare' },
    { item_id: 11357, name: 'Death rune', weight: 6, quantity: [12, 25], rarity: 'rare' },
  ],
  unique_drops: [{ item_id: 66207, name: 'Bound chapter', chance: 256 }],
});

mega({
  id: 'mega_ink_footnote_fiend', name: 'Footnote fiend', level: 20, hp: 22,
  combat_style: 'melee', attack_speed: 3, max_hit: 3, accuracy: 10,
  defence_stab: 6, defence_slash: 4, defence_crush: 2, defence_magic: 12, defence_ranged: 10,
  aggressive: false, region: 'inkweald', slayer_task_eligible: true, slayer_level_required: 5,
  xp_per_kill: 34, sprite: 'spirit/footnote_fiend', weakness: 'crush', tags: ['spirit'], class_tags: ['shadow', 'slayer'],
  examine: 'Small, pedantic, very sharp.',
  always_drops: [],
  drops: [
    { item_id: 66120, name: 'Page-spawn leaf', weight: 22, quantity: [1, 2], rarity: 'common' },
    { item_id: 66124, name: 'Marginalia scrap', weight: 20, quantity: [1, 2], rarity: 'common' },
    { item_id: 101, name: 'Coins', weight: 16, quantity: [6, 25], rarity: 'common' },
  ],
});

mega({
  id: 'mega_ink_chapter_hound', name: 'Chapter-hound', level: 58, hp: 70,
  combat_style: 'melee', attack_speed: 3, max_hit: 9, accuracy: 40,
  defence_stab: 22, defence_slash: 18, defence_crush: 14, defence_magic: 22, defence_ranged: 16,
  aggressive: true, region: 'inkweald', slayer_task_eligible: true, slayer_level_required: 32,
  xp_per_kill: 116, sprite: 'beasts/chapter_hound', weakness: 'magic', tags: ['beast', 'spirit'], class_tags: ['beast', 'shadow', 'slayer'],
  examine: 'Tracks by the smell of your last read page.',
  always_drops: [{ item_id: 100, name: 'Bones', quantity: [1, 1] }],
  drops: [
    { item_id: 66125, name: 'Chapter-bone', weight: 18, quantity: [1, 1], rarity: 'uncommon' },
    { item_id: 66120, name: 'Page-spawn leaf', weight: 20, quantity: [1, 3], rarity: 'common' },
    { item_id: 101, name: 'Coins', weight: 18, quantity: [55, 170], rarity: 'common' },
  ],
});

mega({
  id: 'mega_ink_editor_wraith', name: 'Editor wraith', level: 80, hp: 92,
  combat_style: 'magic', attack_speed: 4, max_hit: 12, accuracy: 54,
  defence_stab: 22, defence_slash: 22, defence_crush: 18, defence_magic: 36, defence_ranged: 22,
  aggressive: true, region: 'inkweald', slayer_task_eligible: true, slayer_level_required: 48,
  xp_per_kill: 166, sprite: 'spirit/editor_wraith', weakness: 'ranged', tags: ['spirit', 'undead'], class_tags: ['magic_user', 'shadow', 'slayer', 'undead'],
  examine: 'Strikes out what it does not approve. Including you.',
  always_drops: [],
  drops: [
    { item_id: 66124, name: 'Marginalia scrap', weight: 22, quantity: [1, 3], rarity: 'common' },
    { item_id: 66121, name: 'Ink-shaped heart', weight: 8, quantity: [1, 1], rarity: 'uncommon' },
    { item_id: 101, name: 'Coins', weight: 18, quantity: [130, 340], rarity: 'common' },
    { item_id: 66122, name: 'Forgotten-name token', weight: 3, quantity: [1, 1], rarity: 'rare' },
  ],
});

mega({
  id: 'mega_ink_spine_serpent', name: 'Spine-serpent', level: 50, hp: 58,
  combat_style: 'melee', attack_speed: 3, max_hit: 8, accuracy: 32,
  defence_stab: 20, defence_slash: 18, defence_crush: 14, defence_magic: 18, defence_ranged: 14,
  aggressive: true, region: 'inkweald', slayer_task_eligible: true, slayer_level_required: 28,
  xp_per_kill: 100, sprite: 'beasts/spine_serpent', weakness: 'slash', tags: ['beast'], class_tags: ['beast', 'slayer'],
  examine: 'Made entirely of vertebrae and rage.',
  always_drops: [{ item_id: 100, name: 'Bones', quantity: [2, 3] }],
  drops: [
    { item_id: 66125, name: 'Chapter-bone', weight: 14, quantity: [1, 2], rarity: 'uncommon' },
    { item_id: 101, name: 'Coins', weight: 18, quantity: [50, 150], rarity: 'common' },
    { item_id: 4004, name: 'Bone shard', weight: 16, quantity: [2, 4], rarity: 'common' },
  ],
});

mega({
  id: 'mega_ink_glossary_ogre', name: 'Glossary ogre', level: 70, hp: 95,
  combat_style: 'melee', attack_speed: 5, max_hit: 12, accuracy: 48,
  defence_stab: 30, defence_slash: 30, defence_crush: 20, defence_magic: 18, defence_ranged: 28,
  aggressive: true, region: 'inkweald', slayer_task_eligible: true, slayer_level_required: 42,
  xp_per_kill: 148, sprite: 'beasts/glossary_ogre', weakness: 'magic', tags: ['beast'], class_tags: ['beast', 'giant', 'slayer'],
  examine: 'Defines you at length before it hits you.',
  always_drops: [{ item_id: 106, name: 'Big bones', quantity: [1, 1] }],
  drops: [
    { item_id: 101, name: 'Coins', weight: 20, quantity: [100, 280], rarity: 'common' },
    { item_id: 66124, name: 'Marginalia scrap', weight: 18, quantity: [1, 2], rarity: 'uncommon' },
    { item_id: 66125, name: 'Chapter-bone', weight: 10, quantity: [1, 1], rarity: 'uncommon' },
    { item_id: 66122, name: 'Forgotten-name token', weight: 3, quantity: [1, 1], rarity: 'rare' },
  ],
});

mega({
  id: 'mega_ink_margin_spider', name: 'Margin spider', level: 24, hp: 26,
  combat_style: 'melee', attack_speed: 3, max_hit: 4, accuracy: 14,
  defence_stab: 6, defence_slash: 4, defence_crush: 10, defence_magic: 10, defence_ranged: 8,
  aggressive: true, region: 'inkweald', slayer_task_eligible: true, slayer_level_required: 6,
  xp_per_kill: 42, sprite: 'beasts/margin_spider', weakness: 'crush', tags: ['beast'], class_tags: ['beast', 'slayer'],
  examine: 'Skitters from margin to margin, leaving notes.',
  always_drops: [],
  drops: [
    { item_id: 66124, name: 'Marginalia scrap', weight: 24, quantity: [1, 2], rarity: 'common' },
    { item_id: 66120, name: 'Page-spawn leaf', weight: 16, quantity: [1, 2], rarity: 'common' },
    { item_id: 101, name: 'Coins', weight: 14, quantity: [8, 30], rarity: 'common' },
  ],
});

mega({
  id: 'mega_ink_librarian_shade', name: 'Librarian shade', level: 68, hp: 80,
  combat_style: 'magic', attack_speed: 4, max_hit: 10, accuracy: 46,
  defence_stab: 18, defence_slash: 18, defence_crush: 14, defence_magic: 30, defence_ranged: 20,
  aggressive: false, region: 'inkweald', slayer_task_eligible: true, slayer_level_required: 40,
  xp_per_kill: 140, sprite: 'undead/librarian_shade', weakness: 'crush', tags: ['undead', 'spirit'], class_tags: ['magic_user', 'shadow', 'slayer', 'undead'],
  examine: 'Shushes the wind. The wind obeys.',
  always_drops: [],
  drops: [
    { item_id: 66120, name: 'Page-spawn leaf', weight: 20, quantity: [2, 4], rarity: 'common' },
    { item_id: 66124, name: 'Marginalia scrap', weight: 18, quantity: [1, 3], rarity: 'common' },
    { item_id: 101, name: 'Coins', weight: 18, quantity: [80, 230], rarity: 'common' },
    { item_id: 66125, name: 'Chapter-bone', weight: 5, quantity: [1, 1], rarity: 'rare' },
  ],
});

mega({
  id: 'mega_ink_printer_demon', name: 'Printer demon', level: 102, hp: 130,
  combat_style: 'ranged', attack_speed: 4, max_hit: 14, accuracy: 72,
  defence_stab: 30, defence_slash: 30, defence_crush: 24, defence_magic: 28, defence_ranged: 28,
  aggressive: true, region: 'inkweald', slayer_task_eligible: true, slayer_level_required: 64,
  xp_per_kill: 218, sprite: 'demon/printer_demon', weakness: 'magic', tags: ['demon'], class_tags: ['demon', 'ranged_user', 'slayer'],
  examine: 'Spits movable type. Every letter stings.',
  always_drops: [],
  drops: [
    { item_id: 101, name: 'Coins', weight: 18, quantity: [220, 580], rarity: 'common' },
    { item_id: 66121, name: 'Ink-shaped heart', weight: 10, quantity: [1, 1], rarity: 'uncommon' },
    { item_id: 66122, name: 'Forgotten-name token', weight: 5, quantity: [1, 1], rarity: 'rare' },
    { item_id: 66120, name: 'Page-spawn leaf', weight: 18, quantity: [3, 6], rarity: 'common' },
  ],
  unique_drops: [{ item_id: 66207, name: 'Bound chapter', chance: 1024 }],
});

// ═══════════════════════════════════════════════════════════════════════════
// GLASS DESERT — 10 (crystal hunters, lens-cats, prism-stalkers)
// ═══════════════════════════════════════════════════════════════════════════

mega({
  id: 'mega_glass_lens_cat', name: 'Lens-cat', level: 62, hp: 70,
  combat_style: 'magic', attack_speed: 3, max_hit: 10, accuracy: 44,
  defence_stab: 22, defence_slash: 22, defence_crush: 18, defence_magic: 28, defence_ranged: 16,
  aggressive: true, region: 'glass_desert', slayer_task_eligible: true, slayer_level_required: 36,
  xp_per_kill: 128, sprite: 'beasts/lens_cat', weakness: 'crush', tags: ['beast'], class_tags: ['beast', 'magic_user', 'slayer'],
  examine: 'Focuses sunlight through its eyes. Targets your armour.',
  always_drops: [{ item_id: 100, name: 'Bones', quantity: [1, 1] }],
  drops: [
    { item_id: 66141, name: 'Lens-cat eye', weight: 14, quantity: [1, 1], rarity: 'uncommon' },
    { item_id: 66142, name: 'Crystal hunter pelt', weight: 12, quantity: [1, 1], rarity: 'uncommon' },
    { item_id: 101, name: 'Coins', weight: 18, quantity: [80, 220], rarity: 'common' },
    { item_id: 66143, name: 'Sunburst sand', weight: 16, quantity: [1, 3], rarity: 'common' },
  ],
});

mega({
  id: 'mega_glass_prism_stalker', name: 'Prism stalker', level: 78, hp: 92,
  combat_style: 'ranged', attack_speed: 4, max_hit: 13, accuracy: 56,
  defence_stab: 24, defence_slash: 24, defence_crush: 20, defence_magic: 30, defence_ranged: 20,
  aggressive: true, region: 'glass_desert', slayer_task_eligible: true, slayer_level_required: 48,
  xp_per_kill: 164, sprite: 'beasts/prism_stalker', weakness: 'magic', tags: ['beast'], class_tags: ['beast', 'ranged_user', 'slayer'],
  examine: 'Bends light into a hunter\'s shape and then into a bolt.',
  always_drops: [],
  drops: [
    { item_id: 66140, name: 'Prism tooth', weight: 20, quantity: [1, 2], rarity: 'common' },
    { item_id: 66143, name: 'Sunburst sand', weight: 18, quantity: [2, 4], rarity: 'common' },
    { item_id: 101, name: 'Coins', weight: 18, quantity: [120, 330], rarity: 'common' },
    { item_id: 66144, name: 'Mirage ribbon', weight: 4, quantity: [1, 1], rarity: 'rare' },
  ],
});

mega({
  id: 'mega_glass_crystal_hunter', name: 'Crystal hunter', level: 92, hp: 110,
  combat_style: 'melee', attack_speed: 4, max_hit: 14, accuracy: 64,
  defence_stab: 32, defence_slash: 30, defence_crush: 22, defence_magic: 30, defence_ranged: 24,
  aggressive: true, region: 'glass_desert', slayer_task_eligible: true, slayer_level_required: 60,
  xp_per_kill: 194, sprite: 'humans/crystal_hunter', weakness: 'ranged', tags: ['human', 'armoured'], class_tags: ['armoured', 'human', 'slayer'],
  examine: 'A nomad clad in cut glass. Carries a longer, sharper version of himself.',
  always_drops: [{ item_id: 100, name: 'Bones', quantity: [1, 1] }],
  drops: [
    { item_id: 66142, name: 'Crystal hunter pelt', weight: 22, quantity: [1, 2], rarity: 'common' },
    { item_id: 101, name: 'Coins', weight: 18, quantity: [150, 400], rarity: 'common' },
    { item_id: 66140, name: 'Prism tooth', weight: 12, quantity: [1, 1], rarity: 'uncommon' },
    { item_id: 66141, name: 'Lens-cat eye', weight: 4, quantity: [1, 1], rarity: 'rare' },
  ],
  unique_drops: [{ item_id: 66208, name: 'Crystal crown', chance: 1024 }],
});

mega({
  id: 'mega_glass_glass_djinn', name: 'Glass djinn', level: 110, hp: 140,
  combat_style: 'magic', attack_speed: 4, max_hit: 16, accuracy: 78,
  defence_stab: 28, defence_slash: 28, defence_crush: 22, defence_magic: 48, defence_ranged: 28,
  aggressive: true, region: 'glass_desert', slayer_task_eligible: true, slayer_level_required: 72,
  xp_per_kill: 232, sprite: 'spirit/glass_djinn', weakness: 'ranged', tags: ['spirit', 'elemental'], class_tags: ['elemental', 'magic_user', 'shadow', 'slayer'],
  examine: 'A wish bound in blown glass. Cracks when granted.',
  always_drops: [],
  drops: [
    { item_id: 101, name: 'Coins', weight: 18, quantity: [280, 720], rarity: 'common' },
    { item_id: 66144, name: 'Mirage ribbon', weight: 14, quantity: [1, 2], rarity: 'uncommon' },
    { item_id: 66141, name: 'Lens-cat eye', weight: 8, quantity: [1, 1], rarity: 'rare' },
    { item_id: 11350, name: 'Air rune', weight: 16, quantity: [15, 35], rarity: 'uncommon' },
  ],
  unique_drops: [{ item_id: 66208, name: 'Crystal crown', chance: 512 }],
});

mega({
  id: 'mega_glass_shard_lizard', name: 'Shard lizard', level: 34, hp: 40,
  combat_style: 'melee', attack_speed: 3, max_hit: 5, accuracy: 18,
  defence_stab: 16, defence_slash: 14, defence_crush: 20, defence_magic: 10, defence_ranged: 12,
  aggressive: true, region: 'glass_desert', slayer_task_eligible: true, slayer_level_required: 16,
  xp_per_kill: 66, sprite: 'beasts/shard_lizard', weakness: 'crush', tags: ['beast'], class_tags: ['beast', 'slayer'],
  examine: 'Scales of jagged glass. Tail ends in a sword.',
  always_drops: [{ item_id: 100, name: 'Bones', quantity: [1, 1] }],
  drops: [
    { item_id: 66140, name: 'Prism tooth', weight: 16, quantity: [1, 1], rarity: 'uncommon' },
    { item_id: 66143, name: 'Sunburst sand', weight: 22, quantity: [1, 3], rarity: 'common' },
    { item_id: 101, name: 'Coins', weight: 18, quantity: [25, 85], rarity: 'common' },
  ],
});

mega({
  id: 'mega_glass_mirage_leopard', name: 'Mirage leopard', level: 70, hp: 80,
  combat_style: 'melee', attack_speed: 3, max_hit: 11, accuracy: 50,
  defence_stab: 22, defence_slash: 22, defence_crush: 18, defence_magic: 26, defence_ranged: 18,
  aggressive: true, region: 'glass_desert', slayer_task_eligible: true, slayer_level_required: 42,
  xp_per_kill: 146, sprite: 'beasts/mirage_leopard', weakness: 'ranged', tags: ['beast'], class_tags: ['beast', 'slayer'],
  examine: 'Appears three times before it pounces.',
  always_drops: [{ item_id: 100, name: 'Bones', quantity: [1, 1] }],
  drops: [
    { item_id: 66144, name: 'Mirage ribbon', weight: 18, quantity: [1, 1], rarity: 'uncommon' },
    { item_id: 66142, name: 'Crystal hunter pelt', weight: 14, quantity: [1, 1], rarity: 'uncommon' },
    { item_id: 101, name: 'Coins', weight: 18, quantity: [100, 260], rarity: 'common' },
    { item_id: 66141, name: 'Lens-cat eye', weight: 3, quantity: [1, 1], rarity: 'rare' },
  ],
});

mega({
  id: 'mega_glass_sunburst_camel', name: 'Sunburst camel', level: 40, hp: 58,
  combat_style: 'melee', attack_speed: 5, max_hit: 7, accuracy: 24,
  defence_stab: 18, defence_slash: 18, defence_crush: 16, defence_magic: 12, defence_ranged: 14,
  aggressive: false, region: 'glass_desert', slayer_task_eligible: false, slayer_level_required: 0,
  xp_per_kill: 82, sprite: 'beasts/sunburst_camel', weakness: 'stab', tags: ['beast'], class_tags: ['beast'],
  examine: 'Glows a day after sunset. Smells strongly of warm sand.',
  always_drops: [{ item_id: 100, name: 'Bones', quantity: [1, 1] }],
  drops: [
    { item_id: 103, name: 'Raw beef', weight: 20, quantity: [1, 2], rarity: 'common' },
    { item_id: 66143, name: 'Sunburst sand', weight: 24, quantity: [2, 5], rarity: 'common' },
    { item_id: 101, name: 'Coins', weight: 18, quantity: [30, 90], rarity: 'common' },
  ],
});

mega({
  id: 'mega_glass_crystal_wraith', name: 'Crystal wraith', level: 86, hp: 100,
  combat_style: 'magic', attack_speed: 4, max_hit: 13, accuracy: 60,
  defence_stab: 25, defence_slash: 25, defence_crush: 22, defence_magic: 42, defence_ranged: 25,
  aggressive: true, region: 'glass_desert', slayer_task_eligible: true, slayer_level_required: 56,
  xp_per_kill: 180, sprite: 'spirit/crystal_wraith', weakness: 'crush', tags: ['spirit', 'undead'], class_tags: ['magic_user', 'shadow', 'slayer', 'undead'],
  examine: 'Was once crystal-cutter. Is now cut crystal.',
  always_drops: [],
  drops: [
    { item_id: 66141, name: 'Lens-cat eye', weight: 8, quantity: [1, 1], rarity: 'rare' },
    { item_id: 66140, name: 'Prism tooth', weight: 18, quantity: [1, 2], rarity: 'common' },
    { item_id: 101, name: 'Coins', weight: 18, quantity: [140, 360], rarity: 'common' },
    { item_id: 66144, name: 'Mirage ribbon', weight: 6, quantity: [1, 1], rarity: 'rare' },
  ],
});

mega({
  id: 'mega_glass_shard_falcon', name: 'Shard falcon', level: 54, hp: 58,
  combat_style: 'ranged', attack_speed: 3, max_hit: 8, accuracy: 36,
  defence_stab: 14, defence_slash: 14, defence_crush: 20, defence_magic: 18, defence_ranged: 14,
  aggressive: true, region: 'glass_desert', slayer_task_eligible: true, slayer_level_required: 28,
  xp_per_kill: 110, sprite: 'beasts/shard_falcon', weakness: 'crush', tags: ['beast'], class_tags: ['beast', 'ranged_user', 'slayer'],
  examine: 'Dives from height, trailing splinters.',
  always_drops: [{ item_id: 100, name: 'Bones', quantity: [1, 1] }],
  drops: [
    { item_id: 66140, name: 'Prism tooth', weight: 22, quantity: [1, 2], rarity: 'common' },
    { item_id: 66143, name: 'Sunburst sand', weight: 16, quantity: [2, 4], rarity: 'common' },
    { item_id: 101, name: 'Coins', weight: 18, quantity: [50, 150], rarity: 'common' },
  ],
});

mega({
  id: 'mega_glass_sunking', name: 'Sunking', level: 136, hp: 200,
  combat_style: 'magic', attack_speed: 4, max_hit: 20, accuracy: 100,
  defence_stab: 50, defence_slash: 50, defence_crush: 40, defence_magic: 55, defence_ranged: 42,
  aggressive: true, region: 'glass_desert', slayer_task_eligible: true, slayer_level_required: 90,
  xp_per_kill: 330, sprite: 'boss/sunking', weakness: 'ranged', tags: ['spirit', 'boss'], class_tags: ['boss', 'magic_user', 'shadow', 'slayer', 'undead'],
  examine: 'Wears the sun as a crown. Burns whatever looks too long.',
  always_drops: [{ item_id: 106, name: 'Big bones', quantity: [1, 2] }],
  drops: [
    { item_id: 101, name: 'Coins', weight: 18, quantity: [600, 1700], rarity: 'common' },
    { item_id: 66143, name: 'Sunburst sand', weight: 18, quantity: [6, 12], rarity: 'common' },
    { item_id: 66141, name: 'Lens-cat eye', weight: 10, quantity: [1, 2], rarity: 'uncommon' },
    { item_id: 66144, name: 'Mirage ribbon', weight: 8, quantity: [1, 2], rarity: 'rare' },
    { item_id: 11353, name: 'Fire rune', weight: 6, quantity: [20, 45], rarity: 'rare' },
  ],
  unique_drops: [{ item_id: 66208, name: 'Crystal crown', chance: 256 }],
});

// ═══════════════════════════════════════════════════════════════════════════
// WILDS — 15 (revenants, demons, chaos-touched variants, high-level PvM)
// ═══════════════════════════════════════════════════════════════════════════

mega({
  id: 'mega_wild_revenant_knight', name: 'Revenant knight', level: 120, hp: 170,
  combat_style: 'melee', attack_speed: 4, max_hit: 17, accuracy: 88,
  defence_stab: 55, defence_slash: 55, defence_crush: 40, defence_magic: 42, defence_ranged: 42,
  aggressive: true, region: 'wilds', slayer_task_eligible: true, slayer_level_required: 75,
  xp_per_kill: 260, sprite: 'undead/revenant_knight', weakness: 'magic', tags: ['undead', 'armoured'], class_tags: ['armoured', 'human', 'slayer', 'undead'],
  examine: 'Died pursuing treasure in the Wilds. Still pursuing.',
  always_drops: [{ item_id: 106, name: 'Big bones', quantity: [1, 1] }],
  drops: [
    { item_id: 101, name: 'Coins', weight: 20, quantity: [300, 900], rarity: 'common' },
    { item_id: 66160, name: 'Revenant ether', weight: 14, quantity: [1, 2], rarity: 'uncommon' },
    { item_id: 66163, name: 'Wilds trophy plate', weight: 6, quantity: [1, 1], rarity: 'rare' },
    { item_id: 11358, name: 'Blood rune', weight: 8, quantity: [10, 22], rarity: 'rare' },
  ],
  unique_drops: [{ item_id: 66209, name: 'Wilds warlord skull', chance: 1024 }],
});

mega({
  id: 'mega_wild_revenant_dragon', name: 'Revenant dragon', level: 152, hp: 210,
  combat_style: 'ranged', attack_speed: 4, max_hit: 20, accuracy: 105,
  defence_stab: 60, defence_slash: 60, defence_crush: 45, defence_magic: 48, defence_ranged: 48,
  aggressive: true, region: 'wilds', slayer_task_eligible: true, slayer_level_required: 85,
  xp_per_kill: 310, sprite: 'undead/revenant_dragon', weakness: 'stab', tags: ['undead', 'dragon'], class_tags: ['dragon', 'ranged_user', 'slayer', 'undead'],
  examine: 'A dragon whose bones refused to stay dead.',
  always_drops: [{ item_id: 107, name: 'Dragon bones', quantity: [1, 1] }],
  drops: [
    { item_id: 101, name: 'Coins', weight: 18, quantity: [500, 1400], rarity: 'common' },
    { item_id: 66160, name: 'Revenant ether', weight: 16, quantity: [2, 4], rarity: 'uncommon' },
    { item_id: 66161, name: 'Chaos-touched core', weight: 4, quantity: [1, 1], rarity: 'rare' },
    { item_id: 66164, name: 'Corrupted emblem', weight: 6, quantity: [1, 1], rarity: 'rare' },
  ],
  unique_drops: [{ item_id: 66209, name: 'Wilds warlord skull', chance: 512 }],
});

mega({
  id: 'mega_wild_chaos_demon', name: 'Chaos demon', level: 118, hp: 150,
  combat_style: 'magic', attack_speed: 4, max_hit: 16, accuracy: 82,
  defence_stab: 40, defence_slash: 42, defence_crush: 32, defence_magic: 42, defence_ranged: 38,
  aggressive: true, region: 'wilds', slayer_task_eligible: true, slayer_level_required: 70,
  xp_per_kill: 248, sprite: 'demon/chaos_demon', weakness: 'ranged', tags: ['demon'], class_tags: ['demon', 'magic_user', 'slayer'],
  examine: 'It bleeds the wrong colours.',
  always_drops: [],
  drops: [
    { item_id: 101, name: 'Coins', weight: 20, quantity: [260, 680], rarity: 'common' },
    { item_id: 66162, name: 'Demon hoof', weight: 18, quantity: [1, 2], rarity: 'uncommon' },
    { item_id: 66161, name: 'Chaos-touched core', weight: 6, quantity: [1, 1], rarity: 'rare' },
    { item_id: 11356, name: 'Chaos rune', weight: 10, quantity: [10, 25], rarity: 'uncommon' },
  ],
});

mega({
  id: 'mega_wild_greater_chaos_demon', name: 'Greater chaos demon', level: 148, hp: 200,
  combat_style: 'magic', attack_speed: 4, max_hit: 19, accuracy: 100,
  defence_stab: 48, defence_slash: 48, defence_crush: 38, defence_magic: 50, defence_ranged: 45,
  aggressive: true, region: 'wilds', slayer_task_eligible: true, slayer_level_required: 85,
  xp_per_kill: 305, sprite: 'demon/greater_chaos_demon', weakness: 'ranged', tags: ['demon', 'boss'], class_tags: ['boss', 'demon', 'magic_user', 'slayer'],
  examine: 'A chaos demon with a title, a grudge, and a cult.',
  always_drops: [{ item_id: 106, name: 'Big bones', quantity: [1, 1] }],
  drops: [
    { item_id: 101, name: 'Coins', weight: 18, quantity: [480, 1300], rarity: 'common' },
    { item_id: 66162, name: 'Demon hoof', weight: 18, quantity: [2, 3], rarity: 'uncommon' },
    { item_id: 66161, name: 'Chaos-touched core', weight: 10, quantity: [1, 1], rarity: 'rare' },
    { item_id: 66164, name: 'Corrupted emblem', weight: 6, quantity: [1, 1], rarity: 'rare' },
    { item_id: 11356, name: 'Chaos rune', weight: 8, quantity: [20, 40], rarity: 'rare' },
  ],
  unique_drops: [{ item_id: 66209, name: 'Wilds warlord skull', chance: 512 }],
});

mega({
  id: 'mega_wild_blood_reaper', name: 'Blood reaper', level: 135, hp: 180,
  combat_style: 'melee', attack_speed: 4, max_hit: 18, accuracy: 92,
  defence_stab: 48, defence_slash: 48, defence_crush: 35, defence_magic: 40, defence_ranged: 42,
  aggressive: true, region: 'wilds', slayer_task_eligible: true, slayer_level_required: 78,
  xp_per_kill: 290, sprite: 'undead/blood_reaper', weakness: 'slash', tags: ['undead'], class_tags: ['slayer', 'undead'],
  examine: 'Scythes a path through the Wilds.',
  always_drops: [{ item_id: 106, name: 'Big bones', quantity: [1, 1] }],
  drops: [
    { item_id: 101, name: 'Coins', weight: 20, quantity: [380, 1000], rarity: 'common' },
    { item_id: 5001, name: 'Vial of blood', weight: 14, quantity: [2, 5], rarity: 'uncommon' },
    { item_id: 11358, name: 'Blood rune', weight: 10, quantity: [8, 20], rarity: 'uncommon' },
    { item_id: 66164, name: 'Corrupted emblem', weight: 5, quantity: [1, 1], rarity: 'rare' },
    { item_id: 66165, name: 'Forsaken relic', weight: 2, quantity: [1, 1], rarity: 'very_rare' },
  ],
});

mega({
  id: 'mega_wild_chaos_touched_troll', name: 'Chaos-touched troll', level: 96, hp: 140,
  combat_style: 'melee', attack_speed: 5, max_hit: 15, accuracy: 66,
  defence_stab: 38, defence_slash: 38, defence_crush: 26, defence_magic: 26, defence_ranged: 30,
  aggressive: true, region: 'wilds', slayer_task_eligible: true, slayer_level_required: 55,
  xp_per_kill: 200, sprite: 'beasts/chaos_troll', weakness: 'magic', tags: ['beast'], class_tags: ['beast', 'giant', 'slayer'],
  examine: 'Big. Ugly. Arguing with itself in different voices.',
  always_drops: [{ item_id: 106, name: 'Big bones', quantity: [1, 1] }],
  drops: [
    { item_id: 101, name: 'Coins', weight: 20, quantity: [180, 480], rarity: 'common' },
    { item_id: 66161, name: 'Chaos-touched core', weight: 3, quantity: [1, 1], rarity: 'rare' },
    { item_id: 66162, name: 'Demon hoof', weight: 8, quantity: [1, 1], rarity: 'uncommon' },
    { item_id: 11356, name: 'Chaos rune', weight: 8, quantity: [5, 15], rarity: 'uncommon' },
  ],
});

mega({
  id: 'mega_wild_chaos_touched_giant', name: 'Chaos-touched giant', level: 112, hp: 170,
  combat_style: 'melee', attack_speed: 5, max_hit: 17, accuracy: 80,
  defence_stab: 40, defence_slash: 40, defence_crush: 28, defence_magic: 28, defence_ranged: 32,
  aggressive: true, region: 'wilds', slayer_task_eligible: true, slayer_level_required: 62,
  xp_per_kill: 240, sprite: 'beasts/chaos_giant', weakness: 'ranged', tags: ['beast', 'boss'], class_tags: ['beast', 'boss', 'giant', 'slayer'],
  examine: 'Eighteen feet. Six arms. One clear opinion.',
  always_drops: [{ item_id: 106, name: 'Big bones', quantity: [1, 1] }],
  drops: [
    { item_id: 101, name: 'Coins', weight: 20, quantity: [260, 700], rarity: 'common' },
    { item_id: 66161, name: 'Chaos-touched core', weight: 6, quantity: [1, 1], rarity: 'rare' },
    { item_id: 66162, name: 'Demon hoof', weight: 12, quantity: [1, 2], rarity: 'uncommon' },
    { item_id: 11356, name: 'Chaos rune', weight: 10, quantity: [10, 25], rarity: 'uncommon' },
    { item_id: 66163, name: 'Wilds trophy plate', weight: 4, quantity: [1, 1], rarity: 'rare' },
  ],
});

mega({
  id: 'mega_wild_pker_ghost', name: 'PKer ghost', level: 85, hp: 100,
  combat_style: 'ranged', attack_speed: 3, max_hit: 13, accuracy: 62,
  defence_stab: 28, defence_slash: 28, defence_crush: 22, defence_magic: 26, defence_ranged: 20,
  aggressive: true, region: 'wilds', slayer_task_eligible: true, slayer_level_required: 48,
  xp_per_kill: 178, sprite: 'undead/pker_ghost', weakness: 'magic', tags: ['undead', 'human'], class_tags: ['human', 'ranged_user', 'slayer', 'undead'],
  examine: 'Skulled in life. Still skulled.',
  always_drops: [{ item_id: 100, name: 'Bones', quantity: [1, 1] }],
  drops: [
    { item_id: 101, name: 'Coins', weight: 22, quantity: [150, 420], rarity: 'common' },
    { item_id: 66163, name: 'Wilds trophy plate', weight: 8, quantity: [1, 1], rarity: 'uncommon' },
    { item_id: 66160, name: 'Revenant ether', weight: 10, quantity: [1, 2], rarity: 'uncommon' },
    { item_id: 11356, name: 'Chaos rune', weight: 12, quantity: [5, 12], rarity: 'uncommon' },
  ],
});

mega({
  id: 'mega_wild_imbued_imp', name: 'Imbued imp', level: 45, hp: 50,
  combat_style: 'magic', attack_speed: 4, max_hit: 7, accuracy: 26,
  defence_stab: 12, defence_slash: 12, defence_crush: 8, defence_magic: 22, defence_ranged: 14,
  aggressive: true, region: 'wilds', slayer_task_eligible: false, slayer_level_required: 0,
  xp_per_kill: 88, sprite: 'demon/imbued_imp', weakness: 'ranged', tags: ['demon'], class_tags: ['demon', 'magic_user'],
  examine: 'A regular imp with dangerous ideas.',
  always_drops: [],
  drops: [
    { item_id: 101, name: 'Coins', weight: 22, quantity: [40, 140], rarity: 'common' },
    { item_id: 11356, name: 'Chaos rune', weight: 14, quantity: [3, 8], rarity: 'uncommon' },
    { item_id: 66162, name: 'Demon hoof', weight: 6, quantity: [1, 1], rarity: 'rare' },
  ],
});

mega({
  id: 'mega_wild_wilderness_wyrm', name: 'Wilderness wyrm', level: 160, hp: 230,
  combat_style: 'melee', attack_speed: 4, max_hit: 22, accuracy: 115,
  defence_stab: 55, defence_slash: 50, defence_crush: 42, defence_magic: 40, defence_ranged: 48,
  aggressive: true, region: 'wilds', slayer_task_eligible: true, slayer_level_required: 88,
  xp_per_kill: 340, sprite: 'beasts/wilderness_wyrm', weakness: 'ranged', tags: ['beast', 'dragon', 'boss'], class_tags: ['beast', 'boss', 'dragon', 'slayer'],
  examine: 'Not quite dragon, definitely wyrm, entirely dangerous.',
  always_drops: [{ item_id: 107, name: 'Dragon bones', quantity: [1, 1] }],
  drops: [
    { item_id: 101, name: 'Coins', weight: 18, quantity: [600, 1600], rarity: 'common' },
    { item_id: 66160, name: 'Revenant ether', weight: 14, quantity: [2, 4], rarity: 'uncommon' },
    { item_id: 66166, name: 'Black stone', weight: 4, quantity: [1, 1], rarity: 'rare' },
    { item_id: 66164, name: 'Corrupted emblem', weight: 8, quantity: [1, 2], rarity: 'rare' },
    { item_id: 11358, name: 'Blood rune', weight: 8, quantity: [15, 30], rarity: 'rare' },
  ],
  unique_drops: [{ item_id: 66209, name: 'Wilds warlord skull', chance: 256 }],
});

mega({
  id: 'mega_wild_fallen_paladin', name: 'Fallen paladin', level: 88, hp: 110,
  combat_style: 'melee', attack_speed: 4, max_hit: 13, accuracy: 65,
  defence_stab: 36, defence_slash: 38, defence_crush: 26, defence_magic: 30, defence_ranged: 28,
  aggressive: true, region: 'wilds', slayer_task_eligible: false, slayer_level_required: 0,
  xp_per_kill: 188, sprite: 'humans/fallen_paladin', weakness: 'stab', tags: ['human', 'undead'], class_tags: ['human', 'undead'],
  examine: 'Once swore an oath. Broke several.',
  always_drops: [{ item_id: 100, name: 'Bones', quantity: [1, 1] }],
  drops: [
    { item_id: 101, name: 'Coins', weight: 22, quantity: [200, 560], rarity: 'common' },
    { item_id: 66164, name: 'Corrupted emblem', weight: 10, quantity: [1, 1], rarity: 'uncommon' },
    { item_id: 66165, name: 'Forsaken relic', weight: 3, quantity: [1, 1], rarity: 'rare' },
    { item_id: 11357, name: 'Death rune', weight: 10, quantity: [8, 18], rarity: 'uncommon' },
  ],
});

mega({
  id: 'mega_wild_skull_priestess', name: 'Skull priestess', level: 125, hp: 150,
  combat_style: 'magic', attack_speed: 4, max_hit: 16, accuracy: 82,
  defence_stab: 28, defence_slash: 28, defence_crush: 22, defence_magic: 48, defence_ranged: 28,
  aggressive: true, region: 'wilds', slayer_task_eligible: true, slayer_level_required: 72,
  xp_per_kill: 260, sprite: 'humans/skull_priestess', weakness: 'ranged', tags: ['human', 'undead'], class_tags: ['human', 'magic_user', 'slayer', 'undead'],
  examine: 'Wears twelve skulls. Is working on thirteen.',
  always_drops: [{ item_id: 100, name: 'Bones', quantity: [1, 1] }],
  drops: [
    { item_id: 101, name: 'Coins', weight: 20, quantity: [320, 820], rarity: 'common' },
    { item_id: 11358, name: 'Blood rune', weight: 12, quantity: [10, 22], rarity: 'uncommon' },
    { item_id: 66164, name: 'Corrupted emblem', weight: 8, quantity: [1, 1], rarity: 'rare' },
    { item_id: 66165, name: 'Forsaken relic', weight: 3, quantity: [1, 1], rarity: 'rare' },
  ],
});

mega({
  id: 'mega_wild_tainted_nymph', name: 'Tainted nymph', level: 75, hp: 88,
  combat_style: 'magic', attack_speed: 3, max_hit: 11, accuracy: 55,
  defence_stab: 18, defence_slash: 18, defence_crush: 14, defence_magic: 34, defence_ranged: 20,
  aggressive: true, region: 'wilds', slayer_task_eligible: true, slayer_level_required: 40,
  xp_per_kill: 156, sprite: 'spirit/tainted_nymph', weakness: 'ranged', tags: ['spirit'], class_tags: ['magic_user', 'shadow', 'slayer'],
  examine: 'She was a spring nymph. The Wilds explained some things.',
  always_drops: [],
  drops: [
    { item_id: 101, name: 'Coins', weight: 22, quantity: [120, 340], rarity: 'common' },
    { item_id: 66160, name: 'Revenant ether', weight: 10, quantity: [1, 1], rarity: 'uncommon' },
    { item_id: 11359, name: 'Nature rune', weight: 12, quantity: [6, 15], rarity: 'uncommon' },
    { item_id: 66164, name: 'Corrupted emblem', weight: 4, quantity: [1, 1], rarity: 'rare' },
  ],
});

mega({
  id: 'mega_wild_bone_colossus', name: 'Bone colossus', level: 170, hp: 260,
  combat_style: 'melee', attack_speed: 5, max_hit: 24, accuracy: 120,
  defence_stab: 60, defence_slash: 60, defence_crush: 48, defence_magic: 45, defence_ranged: 50,
  aggressive: true, region: 'wilds', slayer_task_eligible: true, slayer_level_required: 92,
  xp_per_kill: 360, sprite: 'boss/bone_colossus', weakness: 'magic', tags: ['undead', 'boss', 'armoured'], class_tags: ['armoured', 'boss', 'giant', 'magic_user', 'slayer', 'undead'],
  examine: 'Built by necromancers. Outgrew them.',
  always_drops: [{ item_id: 106, name: 'Big bones', quantity: [3, 3] }],
  drops: [
    { item_id: 101, name: 'Coins', weight: 18, quantity: [800, 2100], rarity: 'common' },
    { item_id: 66165, name: 'Forsaken relic', weight: 8, quantity: [1, 1], rarity: 'rare' },
    { item_id: 66166, name: 'Black stone', weight: 5, quantity: [1, 1], rarity: 'rare' },
    { item_id: 66160, name: 'Revenant ether', weight: 14, quantity: [3, 5], rarity: 'uncommon' },
    { item_id: 11357, name: 'Death rune', weight: 8, quantity: [20, 40], rarity: 'rare' },
  ],
  unique_drops: [{ item_id: 66209, name: 'Wilds warlord skull', chance: 128 }],
});

mega({
  id: 'mega_wild_black_stone_warden', name: 'Black-stone warden', level: 180, hp: 280,
  combat_style: 'magic', attack_speed: 4, max_hit: 26, accuracy: 130,
  defence_stab: 60, defence_slash: 60, defence_crush: 52, defence_magic: 55, defence_ranged: 52,
  aggressive: true, region: 'wilds', slayer_task_eligible: true, slayer_level_required: 95,
  xp_per_kill: 400, sprite: 'boss/black_stone_warden', weakness: 'ranged', tags: ['construct', 'boss'], class_tags: ['boss', 'construct', 'human', 'magic_user', 'slayer'],
  examine: 'Guards the heart of the Wilds. Nothing gets past, including opinion.',
  always_drops: [],
  drops: [
    { item_id: 101, name: 'Coins', weight: 18, quantity: [1000, 2600], rarity: 'common' },
    { item_id: 66166, name: 'Black stone', weight: 10, quantity: [1, 2], rarity: 'rare' },
    { item_id: 66165, name: 'Forsaken relic', weight: 6, quantity: [1, 1], rarity: 'rare' },
    { item_id: 66161, name: 'Chaos-touched core', weight: 12, quantity: [1, 2], rarity: 'uncommon' },
    { item_id: 11358, name: 'Blood rune', weight: 8, quantity: [20, 45], rarity: 'rare' },
  ],
  unique_drops: [{ item_id: 66209, name: 'Wilds warlord skull', chance: 128 }],
});

// ═══════════════════════════════════════════════════════════════════════════

console.log(`[aelgard] monsters-mega loaded: ${MEGA.length} monsters across 9 regions`);

module.exports = { MEGA };
