// ── Inferno Instance ──────────────────────────────────────────────────────────
// Orchestrates the full Inferno: arena setup, wave spawning, pillar management,
// Zuk fight with shield, and all mob AI coordination.

const instances = require('../../engine/instances');
const tick = require('../../engine/tick');
const tiles = require('../../world/tiles');
const walls = require('../../world/walls');
const npcs = require('../../world/npcs');
const entities = require('../../world/entities');
const projectiles = require('../../combat/projectiles');
const los = require('../../world/los');
const { WAVES, SPAWN_POSITIONS, NIBBLER_OFFSETS, PILLAR_POSITIONS, ARENA, TOTAL_WAVES } = require('./waves');
const mobs = require('./mobs');

// Ensure mob definitions are registered
mobs.registerAll();

// ── Start an Inferno instance for a player ──
function startInferno(player, sendFn, opts = {}) {
  const startWave = opts.startWave || 1;
  const endWave = opts.endWave || TOTAL_WAVES;
  const challenge = opts.challenge || null; // 'wave66', 'jads', 'zuk', 'gauntlet'

  // Snapshot player state for restoration
  const snapshot = { x: player.x, y: player.y, layer: player.layer };

  const instance = instances.create({
    type: 'inferno',
    playerId: player.id,
    totalWaves: endWave,
    waveDelayTicks: 7,
    challenge,
    startHp: player.hp,
    playerSnapshot: snapshot,

    setupArena(inst) {
      const layer = inst.layer;
      // Paint the arena floor
      for (let x = ARENA.minX; x <= ARENA.maxX; x++) {
        for (let y = ARENA.minY; y <= ARENA.maxY; y++) {
          tiles.setTile(x, y, tiles.T.FLOOR, layer);
        }
      }
      // Arena boundary walls
      for (let x = ARENA.minX - 1; x <= ARENA.maxX + 1; x++) {
        walls.setWallEdge(x, ARENA.minY - 1, walls.EDGE.S, layer);
        walls.setWallEdge(x, ARENA.maxY + 1, walls.EDGE.N, layer);
      }
      for (let y = ARENA.minY - 1; y <= ARENA.maxY + 1; y++) {
        walls.setWallEdge(ARENA.minX - 1, y, walls.EDGE.E, layer);
        walls.setWallEdge(ARENA.maxX + 1, y, walls.EDGE.W, layer);
      }

      // Create pillars (not for jad/zuk — pillars are gone by then)
      inst.pillars = {};
      const noPillars = challenge === 'jads' || challenge === 'zuk';
      if (noPillars) { /* no pillars for late-game challenges */ }
      else for (const [name, pos] of Object.entries(PILLAR_POSITIONS)) {
        const pillar = entities.create({
          name: `Pillar (${name})`,
          type: 'pillar',
          x: pos.x,
          y: pos.y,
          layer,
          size: 3,
          maxHp: 255,
          blocksLoS: true,
          blocksMovement: true,
          instance: inst.id,
          onDestroy(entity) {
            if (sendFn) sendFn(`The ${entity.name} has been destroyed!`);
          },
        });
        inst.pillars[name] = pillar.id;
      }

      // Define area
      tiles.defineArea(`inferno_${inst.id}`, {
        name: 'The Inferno',
        x1: ARENA.minX, y1: ARENA.minY,
        x2: ARENA.maxX, y2: ARENA.maxY,
        layer,
        safe: false,
        multicombat: true,
      });
    },

    onWaveStart(inst, waveNum) {
      if (sendFn) sendFn(`\n═══ Wave ${waveNum}/69 ═══`);

      if (waveNum === 67) {
        spawnJadWave(inst, sendFn);
        return;
      }
      if (waveNum === 68) {
        spawnTripleJadWave(inst, sendFn);
        return;
      }
      if (waveNum === 69) {
        spawnZukWave(inst, player, sendFn);
        return;
      }

      // Regular waves 1-66
      const waveDef = WAVES[waveNum];
      if (!waveDef) return;

      const [nibCount, batCount, blobCount, meleeCount, rangerCount, magerCount] = waveDef;
      const layer = inst.layer;

      // Shuffle spawn positions
      const positions = [...SPAWN_POSITIONS].sort(() => Math.random() - 0.5);
      let posIdx = 0;

      // Spawn order: magers first, then rangers, melees, blobs, bats
      const spawnList = [
        ...Array(magerCount).fill('jal_zek'),
        ...Array(rangerCount).fill('jal_xil'),
        ...Array(meleeCount).fill('jal_imkot'),
        ...Array(blobCount).fill('jal_ak'),
        ...Array(batCount).fill('jal_mejrah'),
      ];

      for (const defId of spawnList) {
        const pos = positions[posIdx % positions.length];
        posIdx++;
        // Clamp spawn position so large NPCs fit within arena
        const def = npcs.npcDefs.get(defId);
        const sz = def ? (def.size || 1) : 1;
        const sx = Math.min(pos.x, ARENA.maxX - sz + 1);
        const sy = Math.min(pos.y, ARENA.maxY - sz + 1);
        const npc = npcs.spawnNpc(defId, sx, sy, layer, { instance: inst.id });
        if (npc) {
          npc.stunned = 5; // 5 tick stun at spawn — time to see spawns and position
          npc.target = player; // Aggro to player
          if (sendFn) sendFn(`  ${npc.name} spawns at (${pos.x}, ${pos.y})`);
        }
      }

      // Spawn nibblers around pillars
      const nibPositions = [...NIBBLER_OFFSETS].sort(() => Math.random() - 0.5);
      for (let i = 0; i < nibCount && i < nibPositions.length; i++) {
        const nib = npcs.spawnNpc('jal_nib', nibPositions[i].x, nibPositions[i].y, layer, { instance: inst.id });
        if (nib) nib.stunned = 5;
      }

      // Give dead mob store to magers for resurrection
      const magers = [];
      for (const npc of npcs.npcs.values()) {
        if (npc.instance === inst.id && npc.defId === 'jal_zek' && !npc.dead) {
          magers.push(npc);
        }
      }
      // Store dead mob tracking on instance
      if (!inst.deadMobStore) inst.deadMobStore = [];
    },

    onWaveClear(inst, waveNum) {
      if (sendFn) sendFn(`Wave ${waveNum} cleared!`);
      inst.kills += countKills(inst);
    },

    onComplete(inst) {
      const damageTaken = (inst.startHp || 99) - player.hp;
      inst.damageTaken = damageTaken;
      if (sendFn) {
        const elapsed = inst.tickCount * 0.6;
        const mins = Math.floor(elapsed / 60);
        const secs = Math.floor(elapsed % 60);
        const grade = damageTaken === 0 ? 'PERFECT' : damageTaken <= 20 ? 'GREAT' : damageTaken <= 50 ? 'GOOD' : 'CLEAR';
        sendFn(`\nCHALLENGE COMPLETE! ${grade}`);
        sendFn(`Damage taken: ${damageTaken} | Time: ${mins}m ${secs}s`);
        sendFn(`\n╔══════════════════════════════════════╗`);
        sendFn(`║     INFERNO COMPLETE!                ║`);
        sendFn(`║     Time: ${mins}m ${secs}s (${inst.tickCount} ticks)     ║`);
        sendFn(`╚══════════════════════════════════════╝`);
      }
    },

    onFail(inst, reason) {
      if (sendFn) sendFn(`\nInferno failed: ${reason || 'You have died.'}`);
      // Restore player position
      if (inst.playerSnapshot) {
        player.x = inst.playerSnapshot.x;
        player.y = inst.playerSnapshot.y;
        player.layer = inst.playerSnapshot.layer;
      }
      instances.destroy(inst.id);
    },

    onTick(inst, currentTick) {
      // Process Inferno-specific NPC AI each tick
      const alive = npcs.getNpcsInInstance(inst.id);
      for (const npc of alive) {
        // Ensure all aggressive mobs target the player and can attack
        if (!npc.target && npc.aggressive) {
          npc.target = player;
          if (npc.nextAttackTick === Infinity) npc.nextAttackTick = currentTick + (npc.stunned || 0);
        }
        // Initialize attack timer if needed
        if (npc.target && npc.nextAttackTick === Infinity) npc.nextAttackTick = currentTick;
        // Run onAttack for mobs that have targets
        if (npc.onAttack && npc.target && !npc.dead && !npc.dying && !npc.stunned) {
          const result = npc.onAttack(npc, npc.target, currentTick);
          if (result && sendFn) {
            formatAttackMessage(npc, result, sendFn);
          }
        }
      }

      // Process projectile landings
      const landed = projectiles.processLandings(currentTick);
      for (const proj of landed) {
        handleProjectileLanding(proj, player, sendFn);
      }

      // Track dead mobs for mager resurrection
      for (const npc of alive) {
        if (npc.dying === 1 && npc.defId !== 'jal_nib' && npc.defId !== 'jal_zek') {
          if (!inst.deadMobStore) inst.deadMobStore = [];
          inst.deadMobStore.push({ defId: npc.defId, name: npc.name, maxHp: npc.maxHp, x: npc.x, y: npc.y });
          // Feed to magers
          for (const m of alive) {
            if (m.defId === 'jal_zek' && !m.dead && m.customState) {
              m.customState.deadMobStore.push({ defId: npc.defId, name: npc.name, maxHp: npc.maxHp, x: npc.x, y: npc.y });
            }
          }
        }
      }

      // Zuk set timer — spawn ranger+mager when timer expires
      const zuk = alive.find(n => n.defId === 'tzkal_zuk');
      if (zuk && zuk.customState.setTimer <= 0 && !zuk.customState.jadSpawned && zuk.customState.setsSpawned > 0) {
        // Timer just expired — spawn a set
        const ranger = npcs.spawnNpc('jal_xil', 15, 20, inst.layer, { instance: inst.id });
        const mager = npcs.spawnNpc('jal_zek', 35, 20, inst.layer, { instance: inst.id });
        if (ranger) { ranger.target = player; if (sendFn) sendFn('  Jal-Xil (Ranger) spawns!'); }
        if (mager) { mager.target = player; if (sendFn) sendFn('  Jal-Zek (Mager) spawns!'); }
        zuk.customState.setTimer = zuk.customState.setTimerMax;
      }

      // Zuk Jad spawn
      if (zuk && zuk.customState.jadSpawned && !zuk.customState._jadActuallySpawned) {
        zuk.customState._jadActuallySpawned = true;
        const jad = npcs.spawnNpc('jal_tok_jad', 25, 30, inst.layer, {
          instance: inst.id,
          attackSpeed: 8,
        });
        if (jad) {
          jad.target = player;
          jad.customState.isTriple = false;
          if (sendFn) sendFn('  JalTok-Jad spawns!');
        }
      }

      // Zuk enrage healers
      if (zuk && zuk.customState.enraged && !zuk.customState._healersActuallySpawned) {
        zuk.customState._healersActuallySpawned = true;
        const healerPositions = [
          { x: 15, y: 15 }, { x: 20, y: 15 }, { x: 30, y: 15 }, { x: 35, y: 15 },
        ];
        for (const pos of healerPositions) {
          const healer = npcs.spawnNpc('jal_mej_jak', pos.x, pos.y, inst.layer, { instance: inst.id });
          if (healer) {
            healer.customState.zukId = zuk.id;
            if (sendFn) sendFn('  JalMejJak (Zuk Healer) spawns!');
          }
        }
      }
    },
  });

  // Move player into instance
  player.layer = instance.layer;
  // Named starting tiles (community meta):
  // xZact tile: 2 south of bat safespot — for waves 1-49
  // Kelvino tile: 1 east of bat safespot — for waves 50+, fewest exposed spawns
  // North pillar at (28, 21) size 3. Bat safespot = west edge (27, 22)
  if (startWave >= 69) {
    player.x = 25; player.y = 15;  // Zuk: near shield
  } else {
    // Center of arena — OSRS default spawn point
    player.x = Math.floor((ARENA.minX + ARENA.maxX) / 2); // 25
    player.y = Math.floor((ARENA.minY + ARENA.maxY) / 2); // 28
  }
  player.instance = instance.id;

  // Skip to start wave
  if (startWave > 1) {
    instance.currentWave = startWave - 1; // startNextWave increments
  }
  instances.startNextWave(instance);

  return instance;
}

// ── Wave 67: Single Jad ──
function spawnJadWave(inst, sendFn) {
  if (sendFn) sendFn('  JalTok-Jad appears!');
  const jad = npcs.spawnNpc('jal_tok_jad', 25, 25, inst.layer, {
    instance: inst.id,
    attackSpeed: 8,
  });
  if (jad) {
    jad.customState.isTriple = false;
  }
}

// ── Wave 68: Triple Jads ──
function spawnTripleJadWave(inst, sendFn) {
  if (sendFn) sendFn('  THREE JalTok-Jads appear!');
  const positions = [{ x: 15, y: 25 }, { x: 25, y: 20 }, { x: 35, y: 25 }];
  const stunTimers = [1, 4, 7];
  for (let i = 0; i < 3; i++) {
    const jad = npcs.spawnNpc('jal_tok_jad', positions[i].x, positions[i].y, inst.layer, {
      instance: inst.id,
      attackSpeed: 9,
    });
    if (jad) {
      jad.stunned = stunTimers[i];
      jad.customState.isTriple = true;
    }
  }
}

// ── Wave 69: Zuk ──
function spawnZukWave(inst, player, sendFn) {
  if (sendFn) {
    sendFn('');
    sendFn('  ╔═══════════════════════════════════╗');
    sendFn('  ║       TzKal-Zuk awakens!          ║');
    sendFn('  ╚═══════════════════════════════════╝');
  }

  // Arena walls flanking Zuk (lava barrier) — InfernoTrainer: x=21 and x=29, y=0-8
  const layer = inst.layer;
  for (let y = ARENA.minY; y <= ARENA.minY + 8; y++) {
    tiles.setTile(21, y, tiles.T.LAVA || tiles.T.WALL, layer);
    tiles.setTile(29, y, tiles.T.LAVA || tiles.T.WALL, layer);
  }

  // Spawn Zuk at north end (InfernoTrainer: x=22, y=8)
  const zuk = npcs.spawnNpc('tzkal_zuk', 22, 8, inst.layer, {
    instance: inst.id,
  });
  if (zuk) {
    zuk.target = player;
  }

  // Spawn shield (InfernoTrainer: x=23, y=13, moves x=11 to x=35)
  const shield = entities.create({
    name: 'Ancestral Shield',
    type: 'shield',
    x: 23,
    y: 13,
    layer: inst.layer,
    size: 5,
    maxHp: 600,
    blocksMovement: false,
    blocksLoS: false,
    canMove: true,
    moveDirection: Math.random() < 0.5 ? -1 : 1,
    movePauseDuration: 5,
    moveBounds: { minX: 11, maxX: 35 },
    instance: inst.id,
    onDestroy(entity) {
      if (sendFn) sendFn('The Ancestral Shield has been destroyed!');
    },
  });

  if (zuk) zuk.customState.shieldId = shield.id;
}

// ── Handle projectile landing (prayer check on land) ──
function handleProjectileLanding(proj, player, sendFn) {
  if (proj.target.id !== player.id) return;

  let damage = proj.damage;

  // Check protection prayer at LAND tick (not attack tick)
  if (proj.checkPrayerOnLand && player.activePrayers) {
    if (projectiles.isPrayerBlocking(player.activePrayers, proj.prayerStyle)) {
      damage = 0; // Fully blocked by correct prayer
    }
  }

  if (damage > 0) {
    player.hp = Math.max(0, player.hp - damage);
    if (sendFn) sendFn(`${proj.source.name}'s ${proj.type} attack hits you for ${damage}. HP: ${player.hp}/${player.maxHp}`);

    // Special effects
    if (proj.onLand) {
      const effects = proj.onLand(proj);
      if (effects?.drainEnergy) {
        player.runEnergy = Math.max(0, player.runEnergy - effects.drainEnergy);
        if (sendFn) sendFn(`Your run energy is drained!`);
      }
    }

    if (player.hp <= 0) {
      const inst = instances.getByPlayer(player.id);
      if (inst) instances.fail(inst, 'You have died.');
    }
  } else {
    if (sendFn) sendFn(`${proj.source.name}'s ${proj.type} attack is blocked by prayer.`);
  }
}

// ── Format attack messages for display ──
function formatAttackMessage(npc, result, sendFn) {
  if (result.type === 'resurrect') {
    sendFn(`${npc.name} resurrects ${result.resurrected}!`);
  } else if (result.blocked) {
    sendFn(`${npc.name} attacks but is blocked by the ${result.blockedBy}.`);
  } else if (result.attackStyle) {
    // Jad attack — show style for prayer switching
    sendFn(`${npc.name} attacks with ${result.attackStyle}!`);
  }
}

function countKills(inst) {
  let count = 0;
  for (const npc of npcs.npcs.values()) {
    if (npc.instance === inst.id && npc.dead) count++;
  }
  return count;
}

// ── Get Inferno status for look command ──
function getInfernoLook(instance, player) {
  const alive = npcs.getNpcsInInstance(instance.id);
  const ents = entities.getInInstance(instance.id);

  let out = `\n═══ Wave ${instance.currentWave}/69 — The Inferno ═══\n`;

  // Pillars
  const pillars = ents.filter(e => e.type === 'pillar');
  if (pillars.length > 0) {
    out += '\nPillars:\n';
    for (const p of pillars) {
      const pct = Math.round((p.hp / p.maxHp) * 100);
      const bar = '█'.repeat(Math.round(pct / 10)) + '░'.repeat(10 - Math.round(pct / 10));
      out += `  ${p.name}: [${bar}] ${p.hp}/${p.maxHp}\n`;
    }
  }

  // Shield
  const shield = ents.find(e => e.type === 'shield');
  if (shield) {
    const behind = entities.isBehindShield(player.x, player.y, shield);
    out += `\nShield: HP ${shield.hp}/${shield.maxHp} at x=${shield.x} ${behind ? '(SAFE)' : '(EXPOSED!)'}`;
    out += ` moving ${shield.moveDirection > 0 ? '→' : '←'}\n`;
  }

  // Player
  out += `\nYou: (${player.x}, ${player.y}) | HP: ${player.hp}/${player.maxHp}`;
  out += ` | Prayer: ${player.prayerPoints}/${player.skills?.prayer?.level || 1}`;
  out += ` | Pray: ${formatPrayer(player)}\n`;

  // Active projectiles
  const projs = projectiles.getActive().filter(p => p.target.id === player.id);
  if (projs.length > 0) {
    out += '\nIncoming:\n';
    for (const p of projs) {
      const ticksLeft = p.landTick - tick.getTick();
      out += `  ${p.source.name} ${p.type} → lands in ${ticksLeft} tick${ticksLeft !== 1 ? 's' : ''}\n`;
    }
  }

  // Mobs
  if (alive.length > 0) {
    out += '\nMobs:\n';
    for (const npc of alive) {
      const dist = projectiles.chebyshevDistance(player.x, player.y, 1, npc.x, npc.y, npc.size);
      let status = '';
      if (npc.customState?.flickering) status = ' FLICKERING';
      if (npc.customState?.digging) status = ' DIGGING';
      if (npc.customState?.phase === 'scanning') status = ' SCANNING';
      if (npc.stunned > 0) status = ' (stunned)';
      if (npc.frozen > 0) status = ` (frozen ${npc.frozen}t)`;
      const hpPct = Math.round((npc.hp / npc.maxHp) * 100);
      out += `  [${npc.dead ? 'X' : '!'}] ${npc.name} (${npc.x},${npc.y}) HP:${hpPct}% dist:${dist}${status}\n`;
    }
  }

  return out;
}

function formatPrayer(player) {
  if (!player.activePrayers || player.activePrayers.size === 0) return 'None';
  const names = {
    protect_from_magic: 'Mage', protect_from_missiles: 'Range', protect_from_melee: 'Melee',
    rigour: 'Rigour', augury: 'Augury', piety: 'Piety',
    eagle_eye: 'Eagle Eye', mystic_might: 'Mystic Might',
  };
  return [...player.activePrayers].map(p => names[p] || p).join(', ');
}

module.exports = {
  startInferno,
  getInfernoLook,
};
