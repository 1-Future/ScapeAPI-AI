// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Boss Instance Factory
//
// Generic system for making Aelgard bosses into fightable instanced encounters.
// Each boss gets a 21x21 arena, phase transitions, and loot on kill.
// Registered as playable content for RL training and command-line play.
// ══════════════════════════════════════════════════════════════════════════════

const instances = require('../../engine/instances');
const tiles = require('../../world/tiles');
const walls = require('../../world/walls');
const npcs = require('../../world/npcs');
const entities = require('../../world/entities');
const registry = require('../../engine/content-registry');
const droptables = require('../../data/droptables');
const { invAdd } = require('../../player/player');

const ARENA = { minX: 8, maxX: 28, minY: 8, maxY: 28 };
const BOSS_SPAWN = { x: 18, y: 14 };
const PLAYER_SPAWN = { x: 18, y: 22 };

// ── Generic boss instance creator ──────────────────────────────────────────

function createBossInstance(config) {
  return function startBoss(player, sendFn, opts = {}) {
    const snapshot = { x: player.x, y: player.y, layer: player.layer };

    const instance = instances.create({
      type: config.typeId,
      playerId: player.id,
      totalWaves: 1,
      waveDelayTicks: 5,
      startHp: player.hp,
      playerSnapshot: snapshot,

      setupArena(inst) {
        const layer = inst.layer;
        for (let x = ARENA.minX; x <= ARENA.maxX; x++) {
          for (let y = ARENA.minY; y <= ARENA.maxY; y++) {
            tiles.setTile(x, y, config.floorTile || tiles.T.FLOOR, layer);
          }
        }
        for (let x = ARENA.minX - 1; x <= ARENA.maxX + 1; x++) {
          walls.setWallEdge(x, ARENA.minY - 1, walls.EDGE.S, layer);
          walls.setWallEdge(x, ARENA.maxY + 1, walls.EDGE.N, layer);
        }
        for (let y = ARENA.minY - 1; y <= ARENA.maxY + 1; y++) {
          walls.setWallEdge(ARENA.minX - 1, y, walls.EDGE.E, layer);
          walls.setWallEdge(ARENA.maxX + 1, y, walls.EDGE.W, layer);
        }
        // Custom arena setup
        if (config.setupArena) config.setupArena(inst, layer);
      },

      onWaveStart(inst) {
        if (sendFn) {
          sendFn('');
          sendFn(`╔${'═'.repeat(38)}╗`);
          sendFn(`║  ${config.title.padEnd(34)}  ║`);
          sendFn(`╚${'═'.repeat(38)}╝`);
          sendFn('');
        }

        const layer = inst.layer;
        const boss = npcs.spawnNpc(config.npcDefId, BOSS_SPAWN.x, BOSS_SPAWN.y, layer, { instance: inst.id });
        if (boss) {
          boss.stunned = 5;
          boss.target = player;
          inst.bossId = boss.id;
          if (sendFn) sendFn(`${config.bossName} appears! (HP: ${boss.maxHp})`);
        }

        // Spawn adds if configured
        if (config.adds) {
          for (const add of config.adds) {
            const npc = npcs.spawnNpc(add.defId, add.x || BOSS_SPAWN.x + 3, add.y || BOSS_SPAWN.y + 3, layer, { instance: inst.id });
            if (npc) npc.target = player;
          }
        }
      },

      onComplete(inst) {
        const damageTaken = (inst.startHp || 99) - player.hp;
        const elapsed = inst.tickCount * 0.6;
        const mins = Math.floor(elapsed / 60);
        const secs = Math.floor(elapsed % 60);

        // Roll loot from droptables
        const loot = droptables.roll(config.npcDefId);

        if (sendFn) {
          sendFn('');
          sendFn(`╔${'═'.repeat(38)}╗`);
          sendFn(`║  ${(config.bossName + ' DEFEATED!').padEnd(34)}  ║`);
          sendFn(`║  Time: ${mins}m ${secs}s (${inst.tickCount} ticks)`.padEnd(38) + '  ║');
          sendFn(`║  Damage taken: ${damageTaken}`.padEnd(38) + '  ║');
          sendFn(`╚${'═'.repeat(38)}╝`);
          sendFn('');
          if (loot.length) {
            sendFn('Loot:');
            for (const drop of loot) {
              invAdd(player, drop.id, drop.name, drop.count);
              sendFn(`  ${drop.name} x${drop.count}`);
            }
          }
        }

        setTimeout(() => {
          if (inst.playerSnapshot) {
            player.x = inst.playerSnapshot.x;
            player.y = inst.playerSnapshot.y;
            player.layer = inst.playerSnapshot.layer;
          }
          player.instance = null;
          instances.destroy(inst.id);
        }, 5000);
      },

      onFail(inst, reason) {
        if (sendFn) sendFn(`\nYou have been defeated by ${config.bossName}: ${reason || 'You have died.'}`);
        if (inst.playerSnapshot) {
          player.x = inst.playerSnapshot.x;
          player.y = inst.playerSnapshot.y;
          player.layer = inst.playerSnapshot.layer;
        }
        player.instance = null;
        instances.destroy(inst.id);
      },
    });

    // Move player into instance
    player.x = PLAYER_SPAWN.x;
    player.y = PLAYER_SPAWN.y;
    player.layer = instance.layer;
    player.instance = instance.id;

    return instance;
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// REGISTER ALL AELGARD BOSSES
// ══════════════════════════════════════════════════════════════════════════════

const BOSS_CONFIGS = [
  // Heartlands
  {
    typeId: 'forgefather_duran', npcDefId: 'forgefather_duran',
    bossName: 'Forgefather Duran', title: 'THE FORGEFATHER AWAKENS',
    loadout: { level: 50, hpLevel: 50, equipment: ['Rune scimitar', 'Rune platebody', 'Rune platelegs'], inventory: [{ name: 'Lobster', count: 10 }] },
  },
  // Boneyard Wastes
  {
    typeId: 'bog_hydra', npcDefId: 'bog_hydra',
    bossName: 'The Bog Hydra', title: 'THE BOG HYDRA RISES',
    floorTile: tiles.T.SWAMP,
    loadout: { level: 60, hpLevel: 60, equipment: ['Adamant crossbow', 'Green dragonhide body'], inventory: [{ name: 'Lobster', count: 12 }] },
  },
  {
    typeId: 'azhmari', npcDefId: 'azhmari',
    bossName: 'Azhmari, The Sand Prince', title: 'AZHMARI AWAKENS',
    floorTile: tiles.T.SAND,
    loadout: { level: 75, hpLevel: 75, equipment: ['Rune crossbow', 'Green dragonhide body'], inventory: [{ name: 'Shark', count: 15 }], prayers: ['protect_from_magic', 'eagle_eye'] },
  },
  // Moryskah
  {
    typeId: 'count_malachar', npcDefId: 'count_malachar',
    bossName: 'Count Malachar', title: 'COUNT MALACHAR RISES',
    floorTile: tiles.T.FLOOR,
    loadout: { level: 80, hpLevel: 80, equipment: ['Rune scimitar', 'Rune platebody'], inventory: [{ name: 'Shark', count: 18 }, { name: 'Prayer potion(4)', count: 4 }], prayers: ['protect_from_melee', 'piety'] },
  },
  // Veilwood
  {
    typeId: 'the_veilmother', npcDefId: 'the_veilmother',
    bossName: 'The Veilmother', title: 'THE VEILMOTHER STIRS',
    floorTile: tiles.T.DARK_GRASS,
    loadout: { level: 75, hpLevel: 75, equipment: ['Rune scimitar'], inventory: [{ name: 'Shark', count: 15 }], prayers: ['protect_from_magic'] },
  },
  // Sootworks
  {
    typeId: 'vorath', npcDefId: 'vorath',
    bossName: 'Vorath, Warden of the Deep Vein', title: 'VORATH ACTIVATES',
    floorTile: tiles.T.FLOOR,
    loadout: { level: 70, hpLevel: 70, equipment: ['Mystic staff', 'Mystic robe top'], inventory: [{ name: 'Shark', count: 14 }, { name: 'Prayer potion(4)', count: 3 }], prayers: ['protect_from_melee', 'mystic_might'] },
  },
  {
    typeId: 'the_soot_king', npcDefId: 'the_soot_king',
    bossName: 'The Soot King', title: 'THE SOOT KING EMERGES',
    floorTile: tiles.T.FLOOR,
    loadout: { level: 90, hpLevel: 90, equipment: ['Rune scimitar', 'Rune platebody'], inventory: [{ name: 'Shark', count: 20 }, { name: 'Super restore(4)', count: 4 }], prayers: ['protect_from_melee', 'piety'] },
  },
  // Saltbrine
  {
    typeId: 'kraken_saltbrine', npcDefId: 'kraken_saltbrine',
    bossName: 'Kraken of Saltbrine', title: 'THE KRAKEN SURFACES',
    floorTile: tiles.T.WATER,
    loadout: { level: 80, hpLevel: 80, equipment: ['Mystic staff', 'Mystic robe top'], inventory: [{ name: 'Shark', count: 16 }, { name: 'Prayer potion(4)', count: 4 }], prayers: ['mystic_might'] },
  },
  // Inkweald
  {
    typeId: 'inkweald_muse', npcDefId: 'inkweald_muse',
    bossName: 'The Inkweald Muse', title: 'THE MUSE MANIFESTS',
    floorTile: tiles.T.DARK_GRASS,
    loadout: { level: 85, hpLevel: 85, equipment: ['Rune crossbow'], inventory: [{ name: 'Shark', count: 18 }, { name: 'Super restore(4)', count: 4 }], prayers: ['protect_from_magic', 'rigour'] },
  },
  {
    typeId: 'hollow_choir', npcDefId: 'hollow_choir_conductor',
    bossName: 'The Hollow Choir', title: 'THE CHOIR BEGINS ITS SONG',
    floorTile: tiles.T.DARK_GRASS,
    loadout: { level: 99, hpLevel: 99, equipment: ['Rune scimitar', 'Rune platebody'], inventory: [{ name: 'Shark', count: 20 }, { name: 'Saradomin brew(4)', count: 6 }, { name: 'Super restore(4)', count: 8 }], prayers: ['protect_from_magic', 'piety'] },
  },
  // Glass Desert
  {
    typeId: 'the_glass_tyrant', npcDefId: 'the_glass_tyrant',
    bossName: 'The Glass Tyrant', title: 'THE GLASS TYRANT REFRACTS',
    floorTile: tiles.T.SAND,
    loadout: { level: 95, hpLevel: 95, equipment: ['Mystic staff', 'Mystic robe top'], inventory: [{ name: 'Shark', count: 20 }, { name: 'Saradomin brew(4)', count: 4 }, { name: 'Super restore(4)', count: 6 }], prayers: ['protect_from_magic', 'augury'] },
  },
  {
    typeId: 'veldrak', npcDefId: 'veldrak',
    bossName: 'Veldrak, the Last Dragon', title: 'VELDRAK AWAKENS',
    floorTile: tiles.T.SAND,
    loadout: { level: 99, hpLevel: 99, equipment: ['Rune scimitar', 'Rune platebody', 'Rune platelegs'], inventory: [{ name: 'Shark', count: 20 }, { name: 'Saradomin brew(4)', count: 8 }, { name: 'Super restore(4)', count: 12 }], prayers: ['protect_from_magic', 'piety'] },
  },
  // Pirate Captain (mini-boss)
  {
    typeId: 'pirate_captain_boss', npcDefId: 'pirate_captain',
    bossName: 'Pirate Captain', title: 'THE CAPTAIN DRAWS HIS BLADE',
    floorTile: tiles.T.FLOOR,
    loadout: { level: 40, hpLevel: 40, equipment: ['Steel scimitar'], inventory: [{ name: 'Lobster', count: 8 }] },
  },
];

// Register all bosses as playable content
for (const config of BOSS_CONFIGS) {
  const startFn = createBossInstance(config);

  registry.registerPlayable(config.typeId, {
    name: config.bossName,
    description: `Instanced boss fight: ${config.bossName}`,
    source: 'aelgard',
    challenges: { full: { description: `Full ${config.bossName} fight` } },
    mobDefs: [config.npcDefId],
    phases: null,
    loadout: {
      level: config.loadout.level || 99,
      hpLevel: config.loadout.hpLevel || 99,
      equipment: config.loadout.equipment || [],
      inventory: (config.loadout.inventory || []).map(i => ({ name: i.name, count: i.count || 1 })),
      prayers: config.loadout.prayers || [],
    },
    actionSpace: registry.buildActionSpace([
      'noop', 'brew', 'restore', 'move_n', 'move_s', 'move_e', 'move_w',
      'target_boss', 'target_adds', 'pray_mage', 'pray_range', 'pray_melee', 'noop',
    ]),
    startFn,
  });
}

console.log(`[aelgard] ${BOSS_CONFIGS.length} boss instances registered as playable content`);

module.exports = { createBossInstance, BOSS_CONFIGS };
