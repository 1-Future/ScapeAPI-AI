// ── Crystal Wyrm Boss Instance ───────────────────────────────────────────────
// 3-phase boss fight in an instanced crystal arena.
// Phase 1: Crystal Shell — ranged barrage, avoid projectiles
// Phase 2: Shattered Core — AoE melee, crystallite adds spawn
// Phase 3: Enraged — prayer switching, double speed

const instances = require('../../engine/instances');
const tick = require('../../engine/tick');
const tiles = require('../../world/tiles');
const walls = require('../../world/walls');
const npcs = require('../../world/npcs');
const entities = require('../../world/entities');
const projectiles = require('../../combat/projectiles');
const mobs = require('./mobs');

// Ensure mob definitions are registered
mobs.registerAll();

const ARENA = {
  minX: 8, maxX: 28,
  minY: 8, maxY: 28,
  width: 21, height: 21,
};

const BOSS_SPAWN = { x: 15, y: 14 };    // center-ish
const PLAYER_SPAWN = { x: 18, y: 20 };  // south, within ACB range of boss

// Loot table — rolled on boss death
const LOOT_TABLE = [
  // always
  { id: 2000, name: 'Crystal shard', min: 20, max: 50, always: true },
  { id: 2006, name: 'Wyrm scale', min: 1, max: 1, always: true },
  // main table (weighted roll)
  { id: 2002, name: 'Shaped crystal', min: 5, max: 10, weight: 6 },
  { id: 101, name: 'Coins', min: 50000, max: 100000, weight: 5 },
  { id: 2003, name: 'Crystal lens', min: 1, max: 2, weight: 3 },
  { id: 2004, name: 'Crystal core', min: 1, max: 1, weight: 2 },
  // rare drops
  { id: 2015, name: 'Crystal wyrm fang', min: 1, max: 1, weight: 1 },
  { id: 2010, name: 'Wyrm scale platebody', min: 1, max: 1, weight: 1 },
  { id: 2011, name: 'Wyrm scale platelegs', min: 1, max: 1, weight: 1 },
  { id: 2012, name: 'Wyrm scale helm', min: 1, max: 1, weight: 1 },
];

function rollLoot() {
  const drops = [];
  // Always drops
  for (const item of LOOT_TABLE) {
    if (item.always) {
      const qty = item.min + Math.floor(Math.random() * (item.max - item.min + 1));
      drops.push({ id: item.id, name: item.name, count: qty });
    }
  }
  // Weighted main roll
  const mainItems = LOOT_TABLE.filter(i => !i.always && i.weight);
  const totalWeight = mainItems.reduce((s, i) => s + i.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const item of mainItems) {
    roll -= item.weight;
    if (roll <= 0) {
      const qty = item.min + Math.floor(Math.random() * (item.max - item.min + 1));
      drops.push({ id: item.id, name: item.name, count: qty });
      break;
    }
  }
  return drops;
}

function startCrystalWyrm(player, sendFn, opts = {}) {
  const snapshot = { x: player.x, y: player.y, layer: player.layer };

  const instance = instances.create({
    type: 'crystal_wyrm',
    playerId: player.id,
    totalWaves: 1,
    waveDelayTicks: 5,
    startHp: player.hp,
    playerSnapshot: snapshot,

    setupArena(inst) {
      const layer = inst.layer;
      // Paint arena floor
      for (let x = ARENA.minX; x <= ARENA.maxX; x++) {
        for (let y = ARENA.minY; y <= ARENA.maxY; y++) {
          tiles.setTile(x, y, tiles.T.FLOOR, layer);
        }
      }
      // Arena walls
      for (let x = ARENA.minX - 1; x <= ARENA.maxX + 1; x++) {
        walls.setWallEdge(x, ARENA.minY - 1, walls.EDGE.S, layer);
        walls.setWallEdge(x, ARENA.maxY + 1, walls.EDGE.N, layer);
      }
      for (let y = ARENA.minY - 1; y <= ARENA.maxY + 1; y++) {
        walls.setWallEdge(ARENA.minX - 1, y, walls.EDGE.E, layer);
        walls.setWallEdge(ARENA.maxX + 1, y, walls.EDGE.W, layer);
      }

      // 4 crystal pillars — strategic LoS blockers. Each blocks boss from one direction.
      // Losing pillars shrinks safe space. P3 boss destroys them on a timer.
      inst.pillars = [];
      const pillarPositions = [
        { x: 13, y: 13, name: 'northwest' },
        { x: 22, y: 13, name: 'northeast' },
        { x: 13, y: 22, name: 'southwest' },
        { x: 22, y: 22, name: 'southeast' },
      ];
      for (const pos of pillarPositions) {
        const pillar = entities.create({
          name: `Crystal Pillar (${pos.name})`,
          type: 'pillar',
          x: pos.x, y: pos.y, layer,
          size: 2,
          maxHp: 150,
          blocksLoS: true,
          blocksMovement: true,
          instance: inst.id,
          onDestroy(entity) {
            if (sendFn) sendFn(`The ${entity.name} shatters!`);
          },
        });
        inst.pillars.push(pillar.id);
      }

      tiles.defineArea(`crystal_wyrm_${inst.id}`, {
        name: 'Crystal Heart Chamber',
        x1: ARENA.minX, y1: ARENA.minY,
        x2: ARENA.maxX, y2: ARENA.maxY,
        layer, safe: false, multicombat: true,
      });
    },

    onWaveStart(inst, waveNum) {
      if (sendFn) {
        sendFn('');
        sendFn('The ground trembles violently...');
        sendFn('');
        sendFn('╔══════════════════════════════════════╗');
        sendFn('║       THE CRYSTAL WYRM AWAKENS       ║');
        sendFn('╚══════════════════════════════════════╝');
        sendFn('');
      }

      const layer = inst.layer;
      const boss = npcs.spawnNpc('crystal_wyrm', BOSS_SPAWN.x, BOSS_SPAWN.y, layer, { instance: inst.id });
      if (boss) {
        boss.stunned = 8; // 8 tick spawn delay
        boss.target = player;
        inst.bossId = boss.id;
        if (sendFn) sendFn(`The Crystal Wyrm emerges from the crystal heart! (HP: ${boss.maxHp})`);
      }
    },

    onWaveClear(inst) {
      // Boss defeated
    },

    onComplete(inst) {
      const damageTaken = (inst.startHp || 99) - player.hp;
      const elapsed = inst.tickCount * 0.6;
      const mins = Math.floor(elapsed / 60);
      const secs = Math.floor(elapsed % 60);

      // Roll and drop loot
      const loot = rollLoot();
      const items = require('../../data/items');
      const { invAdd } = require('../../player/player');

      if (sendFn) {
        sendFn('');
        sendFn('╔══════════════════════════════════════╗');
        sendFn('║     THE CRYSTAL WYRM IS DEFEATED!    ║');
        sendFn(`║     Time: ${String(mins).padStart(2)}m ${String(secs).padStart(2)}s (${inst.tickCount} ticks)          ║`);
        sendFn(`║     Damage taken: ${damageTaken}                  ║`);
        sendFn('╚══════════════════════════════════════╝');
        sendFn('');
        sendFn('Loot:');
      }

      for (const drop of loot) {
        invAdd(player, drop.id, drop.name, drop.count);
        if (sendFn) sendFn(`  ${drop.name} x${drop.count}`);
      }

      // Restore player position after a moment
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
      if (sendFn) sendFn(`\nYou have been defeated by the Crystal Wyrm: ${reason || 'You have died.'}`);
      if (inst.playerSnapshot) {
        player.x = inst.playerSnapshot.x;
        player.y = inst.playerSnapshot.y;
        player.layer = inst.playerSnapshot.layer;
      }
      player.instance = null;
      instances.destroy(inst.id);
    },

    onTick(inst, currentTick) {
      // Check if boss is in a new phase and announce
      const bossNpc = npcs.npcs.get(inst.bossId);
      if (!bossNpc || bossNpc.dead) return;

      const cs = bossNpc.customState;
      if (!cs) return;

      // Phase announcements (one-time)
      if (cs.phase === 2 && !inst._announcedP2) {
        inst._announcedP2 = true;
        if (sendFn) {
          sendFn('');
          sendFn('The Crystal Wyrm\'s shell shatters!');
          sendFn('Crystallites begin channeling healing energy into the Wyrm!');
          sendFn('Phase 2: Shattered Core — dodge the ground slam! Kill the healers! Switch prayers on the scan!');
        }
      }
      if (cs.phase === 3 && !inst._announcedP3) {
        inst._announcedP3 = true;
        if (sendFn) {
          sendFn('');
          sendFn('The Crystal Wyrm ENRAGES! The pillars begin to crack!');
          sendFn('Crystallites swarm endlessly from the walls!');
          sendFn('Phase 3: Enraged — prayer switch at double speed! Pillars are crumbling! Kill it before they\'re all gone!');
        }
      }

      // Process projectiles and NPC AI (handled by main engine loop)
      const alive = npcs.getNpcsInInstance(inst.id);
      for (const npc of alive) {
        if (!npc.target && npc.aggressive) {
          npc.target = player;
          if (npc.nextAttackTick === Infinity) npc.nextAttackTick = currentTick + (npc.stunned || 0);
        }
      }
    },
  });

  // Move player into instance
  player.x = PLAYER_SPAWN.x;
  player.y = PLAYER_SPAWN.y;
  player.layer = instance.layer;
  player.instance = instance.id;

  // Start the fight
  instances.startNextWave(instance);

  return instance;
}

module.exports = { startCrystalWyrm, ARENA, BOSS_SPAWN, PLAYER_SPAWN };
