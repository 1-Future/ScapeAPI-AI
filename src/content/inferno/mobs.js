// ── Inferno Mob Definitions ───────────────────────────────────────────────────
// All 10 Inferno mob types with OSRS-accurate stats and AI behaviors.
// Source: OldSchoolSDK/osrs-sdk + InfernoTrainer (exact stats and mechanics)

const npcs = require('../../world/npcs');
const los = require('../../world/los');
const projectiles = require('../../combat/projectiles');
const entities = require('../../world/entities');
const tick = require('../../engine/tick');

// ═══════════════════════════════════════════════════════════════════════════════
// 1. JAL-NIB (Nibbler) — Level 32, Size 1x1
// Attacks pillars, not players. No auto-retaliate. 0-4 random damage per hit.
// ═══════════════════════════════════════════════════════════════════════════════
function defineNibbler() {
  npcs.defineNpc('jal_nib', {
    name: 'Jal-Nib',
    examine: 'A small nibbler that attacks pillars.',
    combat: 32,
    maxHp: 10,
    stats: { attack: 1, strength: 1, defence: 15, def_stab: -20, def_slash: -20, def_crush: -20, def_magic: -20, def_ranged: -20 },
    attackSpeed: 4,
    attackRange: 1,
    maxHit: 4,
    size: 1,
    aggressive: false,
    autoRetaliate: false,
    blocksMobs: false,
    wanderRadius: 0,
    respawnTicks: 0, // No respawn in Inferno
    attackStyle: 'melee',
    canMelee: true,
    onSpawn(npc) {
      npc.customState.targetPillar = null;
    },
    onTick(npc, currentTick) {
      if (npc.dead || npc.dying > 0) return;
      // Find nearest alive pillar to target
      if (!npc.customState.targetPillar) {
        const pillars = entities.getInInstance(npc.instance).filter(e => e.type === 'pillar' && !e.dead);
        if (pillars.length === 0) return;
        let nearest = null, nearDist = Infinity;
        for (const p of pillars) {
          const d = Math.abs(npc.x - p.x) + Math.abs(npc.y - p.y);
          if (d < nearDist) { nearest = p; nearDist = d; }
        }
        npc.customState.targetPillar = nearest?.id;
        npc.target = nearest ? { x: nearest.x + 1, y: nearest.y + 1 } : null;
      }
      // Attack pillar if adjacent
      const pillar = npc.customState.targetPillar ? entities.get(npc.customState.targetPillar) : null;
      if (!pillar || pillar.dead) {
        npc.customState.targetPillar = null;
        npc.target = null;
        return;
      }
      npc.target = { x: pillar.x + 1, y: pillar.y + 1 };
      const dist = projectiles.chebyshevDistance(npc.x, npc.y, 1, pillar.x, pillar.y, pillar.size);
      if (dist <= 1 && currentTick >= npc.nextAttackTick) {
        const dmg = Math.floor(Math.random() * 5); // 0-4
        entities.damage(pillar, dmg, npc);
        npc.nextAttackTick = currentTick + npc.attackSpeed;
      }
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. JAL-MEJRAH (Bat) — Level 85, Size 2x2
// Ranged attacker. Drains 300 run energy per hit.
// ═══════════════════════════════════════════════════════════════════════════════
function defineBat() {
  npcs.defineNpc('jal_mejrah', {
    name: 'Jal-MejRah',
    examine: 'A bat-like creature that drains energy.',
    combat: 85,
    maxHp: 25,
    stats: { attack: 1, strength: 1, defence: 55, ranged: 120, magic: 120,
             def_stab: 30, def_slash: 30, def_crush: 30, def_magic: -20, def_ranged: 45 },
    attackSpeed: 3,
    attackRange: 4,
    maxHit: 14,
    size: 2,
    aggressive: true,
    aggroRange: 15,
    attackStyle: 'ranged',
    canMelee: false,
    respawnTicks: 0,
    onAttack(npc, target, currentTick) {
      if (currentTick < npc.nextAttackTick) return null;
      const dist = projectiles.chebyshevDistance(npc.x, npc.y, npc.size, target.x, target.y, 1);
      if (dist > npc.attackRange) return null;
      if (!npc.instance && !los.npcHasLoS(npc.x, npc.y, npc.size, target.x, target.y, npc.layer, npc.attackRange)) return null;

      npc.nextAttackTick = currentTick + npc.attackSpeed;
      const damage = Math.floor(Math.random() * (npc.maxHit + 1));
      projectiles.create({
        source: { x: npc.x, y: npc.y, size: npc.size, id: npc.id, name: npc.name },
        target: { x: target.x, y: target.y, size: 1, id: target.id },
        type: 'ranged',
        damage,
        prayerStyle: 'ranged',
        checkPrayerOnLand: true,
        onLand(proj) {
          return { damage: proj.damage, drainEnergy: 300 }; // Special: drain run energy
        },
      });
      return { type: 'ranged', damage };
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. JAL-AK (Blob) — Level 165, Size 3x3
// Prayer scanner: scans overhead, waits 3 ticks, attacks with OPPOSITE style.
// Splits into 3 bloblets on death.
// ═══════════════════════════════════════════════════════════════════════════════
function defineBlob() {
  npcs.defineNpc('jal_ak', {
    name: 'Jal-Ak',
    examine: 'A blob that scans your prayers.',
    combat: 165,
    maxHp: 40,
    stats: { attack: 160, strength: 160, defence: 95, ranged: 160, magic: 160,
             def_stab: 0, def_slash: 0, def_crush: 0, def_magic: 0, def_ranged: 0 },
    attackSpeed: 3, // Effectively 6 (3 scan + 3 attack)
    attackRange: 15,
    maxHit: 29,
    size: 3,
    aggressive: true,
    aggroRange: 15,
    attackStyle: 'magic',
    canMelee: true,
    respawnTicks: 0,
    onSpawn(npc) {
      npc.customState.scanResult = null; // null, 'magic', 'ranged', 'none'
      npc.customState.scanTick = 0;
      npc.customState.phase = 'idle'; // idle, scanning, attacking
    },
    onTick(npc, currentTick) {
      if (npc.dead || npc.dying > 0 || !npc.target) return;
      const target = npc.target;
      if (!target.activePrayers) return;

      // Blob scan cycle: scan → wait 3 ticks → attack → repeat
      if (npc.customState.phase === 'idle') {
        // Check LoS before scanning
        if (!npc.instance && !los.npcHasLoS(npc.x, npc.y, npc.size, target.x, target.y, npc.layer, npc.attackRange)) {
          npc.ticksWithoutLoS++;
          return;
        }
        // Scan player's overhead prayer
        if (target.activePrayers.has('protect_from_magic')) {
          npc.customState.scanResult = 'magic';
        } else if (target.activePrayers.has('protect_from_missiles')) {
          npc.customState.scanResult = 'ranged';
        } else {
          npc.customState.scanResult = 'none';
        }
        npc.customState.phase = 'scanning';
        npc.customState.scanTick = currentTick;
        npc.nextAttackTick = currentTick + 3;
      }

      if (npc.customState.phase === 'scanning' && currentTick >= npc.nextAttackTick) {
        npc.customState.phase = 'attacking';
      }
    },
    onAttack(npc, target, currentTick) {
      if (npc.customState.phase !== 'attacking') return null;

      const dist = projectiles.chebyshevDistance(npc.x, npc.y, npc.size, target.x, target.y, 1);

      // Determine attack style: OPPOSITE of what was scanned
      let attackStyle;
      if (npc.customState.scanResult === 'magic') {
        attackStyle = 'ranged'; // Player was praying magic, attack with ranged
      } else if (npc.customState.scanResult === 'ranged') {
        attackStyle = 'magic'; // Player was praying ranged, attack with magic
      } else {
        attackStyle = Math.random() < 0.5 ? 'magic' : 'ranged'; // Random if no prayer
      }

      const damage = Math.floor(Math.random() * (npc.maxHit + 1));
      projectiles.create({
        source: { x: npc.x, y: npc.y, size: npc.size, id: npc.id, name: npc.name },
        target: { x: target.x, y: target.y, size: 1, id: target.id },
        type: attackStyle === 'magic' ? 'magic' : 'ranged',
        damage,
        prayerStyle: attackStyle,
        checkPrayerOnLand: true,
      });

      // Reset cycle
      npc.customState.phase = 'idle';
      npc.customState.scanResult = null;
      npc.nextAttackTick = currentTick + 3;
      return { type: attackStyle, damage, scanned: npc.customState.scanResult };
    },
    onDeath(npc, killer, currentTick) {
      // Spawn 3 bloblets at blob's location
      const bloblets = [
        { defId: 'jal_ak_rek_xil', dx: 1, dy: -1 },  // Range bloblet
        { defId: 'jal_ak_rek_ket', dx: 0, dy: 0 },    // Melee bloblet
        { defId: 'jal_ak_rek_mej', dx: 2, dy: -2 },   // Magic bloblet
      ];
      for (const b of bloblets) {
        const spawned = npcs.spawnNpc(b.defId, npc.x + b.dx, npc.y + b.dy, npc.layer, {
          instance: npc.instance,
        });
        if (spawned) {
          spawned.stunned = 4; // 4 tick cooldown before bloblets can act
          spawned.nextAttackTick = currentTick + 4;
        }
      }
    },
  });

  // Bloblets (spawned when blob dies)
  npcs.defineNpc('jal_ak_rek_xil', {
    name: 'Jal-AkRek-Xil', examine: 'A ranged bloblet.', combat: 70, maxHp: 15,
    stats: { attack: 1, strength: 1, defence: 95, ranged: 120, def_stab: 0, def_slash: 0, def_crush: 0, def_magic: -20, def_ranged: 0 },
    attackSpeed: 4, attackRange: 15, maxHit: 14, size: 1, aggressive: true, attackStyle: 'ranged', respawnTicks: 0,
    onAttack(npc, target, ct) {
      if (ct < npc.nextAttackTick) return null;
      if (!npc.instance && !los.npcHasLoS(npc.x, npc.y, 1, target.x, target.y, npc.layer, 15)) return null;
      npc.nextAttackTick = ct + npc.attackSpeed;
      const dmg = Math.floor(Math.random() * (npc.maxHit + 1));
      projectiles.create({ source: { x: npc.x, y: npc.y, size: 1, id: npc.id }, target: { x: target.x, y: target.y, size: 1, id: target.id }, type: 'ranged', damage: dmg, prayerStyle: 'ranged', checkPrayerOnLand: true });
      return { type: 'ranged', damage: dmg };
    },
  });

  npcs.defineNpc('jal_ak_rek_ket', {
    name: 'Jal-AkRek-Ket', examine: 'A melee bloblet.', combat: 70, maxHp: 15,
    stats: { attack: 120, strength: 95, defence: 95, def_stab: 0, def_slash: 0, def_crush: 0, def_magic: -20, def_ranged: 0 },
    attackSpeed: 4, attackRange: 1, maxHit: 14, size: 1, aggressive: true, attackStyle: 'melee', respawnTicks: 0,
  });

  npcs.defineNpc('jal_ak_rek_mej', {
    name: 'Jal-AkRek-Mej', examine: 'A magic bloblet.', combat: 70, maxHp: 15,
    stats: { attack: 1, strength: 1, defence: 95, magic: 120, def_stab: 0, def_slash: 0, def_crush: 0, def_magic: -20, def_ranged: 0 },
    attackSpeed: 4, attackRange: 15, maxHit: 14, size: 1, aggressive: true, attackStyle: 'magic', respawnTicks: 0,
    onAttack(npc, target, ct) {
      if (ct < npc.nextAttackTick) return null;
      if (!npc.instance && !los.npcHasLoS(npc.x, npc.y, 1, target.x, target.y, npc.layer, 15)) return null;
      npc.nextAttackTick = ct + npc.attackSpeed;
      const dmg = Math.floor(Math.random() * (npc.maxHit + 1));
      projectiles.create({ source: { x: npc.x, y: npc.y, size: 1, id: npc.id }, target: { x: target.x, y: target.y, size: 1, id: target.id }, type: 'magic', damage: dmg, prayerStyle: 'magic', checkPrayerOnLand: true });
      return { type: 'magic', damage: dmg };
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. JAL-IMKOT (Meleer) — Level 240, Size 4x4
// Melee only. Digs underground after 38+ ticks without LoS, teleports to player.
// ═══════════════════════════════════════════════════════════════════════════════
function defineMeleer() {
  npcs.defineNpc('jal_imkot', {
    name: 'Jal-ImKot',
    examine: 'A powerful melee fighter that can dig through the ground.',
    combat: 240,
    maxHp: 75,
    stats: { attack: 210, strength: 290, defence: 120,
             def_stab: 65, def_slash: 65, def_crush: 65, def_magic: 30, def_ranged: 5 },
    attackSpeed: 4,
    attackRange: 1,
    maxHit: 49,
    size: 4,
    aggressive: true,
    aggroRange: 15,
    attackStyle: 'melee',
    respawnTicks: 0,
    onSpawn(npc) {
      npc.customState.digging = false;
      npc.customState.digTick = 0;
      npc.customState.postDigFreeze = 0;
    },
    onTick(npc, currentTick) {
      if (npc.dead || npc.dying > 0 || !npc.target) return;
      const target = npc.target;
      if (!target.x && target.x !== 0) return;

      // Track LoS time — in instances, check if pillar blocks LoS
      let hasLoS = true;
      if (npc.instance) {
        const ents = entities.getInInstance(npc.instance);
        for (const e of ents) {
          if (!e.blocksMovement || e.dead) continue;
          // Simple: pillar blocks LoS if it's between NPC and target
          const esz = e.size || 1;
          const npcCx = npc.x + (npc.size||1)/2, npcCy = npc.y + (npc.size||1)/2;
          const tCx = target.x, tCy = target.y;
          const eCx = e.x + esz/2, eCy = e.y + esz/2;
          // Check if entity center is roughly between NPC and target
          const minX = Math.min(npcCx, tCx) - 1, maxX = Math.max(npcCx, tCx) + 1;
          const minY = Math.min(npcCy, tCy) - 1, maxY = Math.max(npcCy, tCy) + 1;
          if (eCx >= minX && eCx <= maxX && eCy >= minY && eCy <= maxY) {
            hasLoS = false; break;
          }
        }
      } else {
        hasLoS = los.npcHasLoS(npc.x, npc.y, npc.size, target.x, target.y, npc.layer, 1);
      }
      if (hasLoS) {
        npc.ticksWithoutLoS = 0;
      } else {
        npc.ticksWithoutLoS++;
      }

      // Post-dig freeze
      if (npc.customState.postDigFreeze > 0) {
        npc.customState.postDigFreeze--;
        return;
      }

      // Dig mechanic: after 50 ticks without LoS, dig to player position
      if (!npc.customState.digging && npc.ticksWithoutLoS >= 50) {
        const shouldDig = true;
        if (shouldDig) {
          npc.customState.digging = true;
          npc.customState.digTick = currentTick;
          npc.frozen = 6; // Freeze for 6 ticks during dig
        }
      }

      // After dig animation completes, teleport to player
      if (npc.customState.digging && currentTick >= npc.customState.digTick + 6) {
        npc.customState.digging = false;
        npc.ticksWithoutLoS = 0;
        // Teleport adjacent to player (try SW, under, NW, SE)
        const tryOffsets = [
          { dx: -(npc.size), dy: 0 },  // SW
          { dx: 0, dy: 0 },            // Under
          { dx: -(npc.size), dy: -(npc.size) }, // NW
          { dx: 1, dy: 0 },            // SE
        ];
        for (const off of tryOffsets) {
          const nx = target.x + off.dx, ny = target.y + off.dy;
          if (npcs.canNpcMoveTo(npc, nx, ny)) {
            npc.x = nx;
            npc.y = ny;
            break;
          }
        }
        npc.nextAttackTick = currentTick + 6;
        npc.customState.postDigFreeze = 2;
        npc.frozen = 2;
      }
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. JAL-XIL (Ranger) — Level 370, Size 3x3
// Standard ranged attacker. Can melee if close (50% chance).
// ═══════════════════════════════════════════════════════════════════════════════
function defineRanger() {
  npcs.defineNpc('jal_xil', {
    name: 'Jal-Xil',
    examine: 'A powerful ranged attacker.',
    combat: 370,
    maxHp: 125,
    stats: { attack: 140, strength: 180, defence: 60, ranged: 250, magic: 90,
             def_stab: 45, def_slash: 45, def_crush: 45, def_magic: 60, def_ranged: 0 },
    attackSpeed: 4,
    attackRange: 15,
    maxHit: 46,
    size: 3,
    aggressive: true,
    aggroRange: 15,
    attackStyle: 'ranged',
    canMelee: true,
    respawnTicks: 0,
    onAttack(npc, target, currentTick) {
      if (currentTick < npc.nextAttackTick) return null;
      const dist = projectiles.chebyshevDistance(npc.x, npc.y, npc.size, target.x, target.y, 1);

      // Can switch to melee if adjacent (50% chance)
      if (dist <= 1 && npc.canMelee && Math.random() < 0.5) {
        npc.nextAttackTick = currentTick + npc.attackSpeed;
        const damage = Math.floor(Math.random() * (35 + 1)); // Melee max hit ~35
        return { type: 'melee', damage, style: 'crush' };
      }

      if (!npc.instance && !los.npcHasLoS(npc.x, npc.y, npc.size, target.x, target.y, npc.layer, npc.attackRange)) return null;
      npc.nextAttackTick = currentTick + npc.attackSpeed;
      const damage = Math.floor(Math.random() * (npc.maxHit + 1));
      projectiles.create({
        source: { x: npc.x, y: npc.y, size: npc.size, id: npc.id, name: npc.name },
        target: { x: target.x, y: target.y, size: 1, id: target.id },
        type: 'ranged',
        damage,
        prayerStyle: 'ranged',
        checkPrayerOnLand: true,
      });
      return { type: 'ranged', damage };
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. JAL-ZEK (Mager) — Level 490, Size 4x4
// Magic attacker. 1-tick flicker before attack. 10% chance to resurrect dead mobs.
// ═══════════════════════════════════════════════════════════════════════════════
function defineMager() {
  npcs.defineNpc('jal_zek', {
    name: 'Jal-Zek',
    examine: 'A powerful mage that can resurrect the dead.',
    combat: 490,
    maxHp: 220,
    stats: { attack: 370, strength: 510, defence: 260, ranged: 510, magic: 300,
             def_stab: 260, def_slash: 260, def_crush: 260, def_magic: 100, def_ranged: 260 },
    attackSpeed: 4,
    attackRange: 15,
    maxHit: 70,
    size: 4,
    aggressive: true,
    aggroRange: 15,
    attackStyle: 'magic',
    canMelee: true,
    respawnTicks: 0,
    onSpawn(npc) {
      npc.customState.flickering = false;
      npc.customState.flickerTick = 0;
      npc.customState.deadMobStore = []; // IDs of mobs that died this wave (for resurrection)
    },
    onTick(npc, currentTick) {
      if (npc.dead || npc.dying > 0) return;

      // Flicker 1 tick before attack
      if (currentTick === npc.nextAttackTick - 1) {
        npc.customState.flickering = true;
      } else {
        npc.customState.flickering = false;
      }
    },
    onAttack(npc, target, currentTick) {
      if (currentTick < npc.nextAttackTick) return null;
      const dist = projectiles.chebyshevDistance(npc.x, npc.y, npc.size, target.x, target.y, 1);

      // Melee if adjacent (50% chance)
      if (dist <= 1 && npc.canMelee && Math.random() < 0.5) {
        npc.nextAttackTick = currentTick + npc.attackSpeed;
        npc.customState.flickering = false;
        const damage = Math.floor(Math.random() * (45 + 1));
        return { type: 'melee', damage, style: 'stab' };
      }

      if (!npc.instance && !los.npcHasLoS(npc.x, npc.y, npc.size, target.x, target.y, npc.layer, npc.attackRange)) return null;

      npc.nextAttackTick = currentTick + npc.attackSpeed;
      npc.customState.flickering = false;

      // 10% chance to resurrect a dead mob instead of attacking (not in Zuk wave)
      if (npc.customState.deadMobStore.length > 0 && Math.random() < 0.1) {
        const resData = npc.customState.deadMobStore.shift();
        // Spawn resurrected mob at half HP
        const resNpc = npcs.spawnNpc(resData.defId, resData.x, resData.y, npc.layer, {
          instance: npc.instance,
          maxHp: Math.floor(resData.maxHp / 2),
        });
        if (resNpc) resNpc.hp = Math.floor(resData.maxHp / 2);
        npc.nextAttackTick = currentTick + 8; // Resurrection costs 8 tick delay
        return { type: 'resurrect', resurrected: resData.name };
      }

      const damage = Math.floor(Math.random() * (npc.maxHit + 1));
      projectiles.create({
        source: { x: npc.x, y: npc.y, size: npc.size, id: npc.id, name: npc.name },
        target: { x: target.x, y: target.y, size: 1, id: target.id },
        type: 'magic',
        damage,
        prayerStyle: 'magic',
        checkPrayerOnLand: true,
      });
      return { type: 'magic', damage };
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. JAL-TOK-JAD (Jad) — Level 900, Size 5x5
// Random 50/50 mage/range. Prayer checked on projectile LAND (3 tick delay).
// Spawns healers at 50% HP.
// ═══════════════════════════════════════════════════════════════════════════════
function defineJad() {
  npcs.defineNpc('jal_tok_jad', {
    name: 'JalTok-Jad',
    examine: 'The TzHaar champion. Pray correctly or die.',
    combat: 900,
    maxHp: 350,
    stats: { attack: 750, strength: 1020, defence: 480, ranged: 1020, magic: 510,
             def_stab: 0, def_slash: 0, def_crush: 0, def_magic: 0, def_ranged: 0 },
    attackSpeed: 8,
    attackRange: 15,
    maxHit: 113,
    size: 5,
    aggressive: true,
    aggroRange: 20,
    attackStyle: 'magic',
    flinchDelay: 2,
    respawnTicks: 0,
    onSpawn(npc) {
      npc.customState.healersSpawned = false;
      npc.customState.attackCount = 0;
    },
    onTick(npc, currentTick) {
      if (npc.dead || npc.dying > 0) return;
      // Spawn healers at 50% HP
      if (!npc.customState.healersSpawned && npc.hp <= Math.floor(npc.maxHp / 2)) {
        npc.customState.healersSpawned = true;
        const healerCount = npc.customState.isTriple ? 3 : 5;
        for (let i = 0; i < healerCount; i++) {
          const hx = npc.x + (i % 3) * 2;
          const hy = npc.y + npc.size + 1 + Math.floor(i / 3);
          const healer = npcs.spawnNpc('yt_hur_kot', hx, hy, npc.layer, {
            instance: npc.instance,
          });
          if (healer) {
            healer.customState.jadId = npc.id;
            healer.target = { x: npc.x, y: npc.y }; // Start by healing Jad
          }
        }
        npc.autoRetaliate = false;
      }
    },
    onAttack(npc, target, currentTick) {
      if (currentTick < npc.nextAttackTick) return null;
      // Skip LoS check in instances (virtual layers have no tile data)
      if (!npc.instance && !los.npcHasLoS(npc.x, npc.y, npc.size, target.x, target.y, npc.layer, npc.attackRange)) return null;

      npc.nextAttackTick = currentTick + npc.attackSpeed;
      npc.customState.attackCount++;

      const dist = projectiles.chebyshevDistance(npc.x, npc.y, npc.size, target.x, target.y, 1);

      // Jad uses all 3 combat styles: melee if in range, otherwise random mage/range
      let attackStyle;
      if (dist <= 1) {
        // In melee range — can use any of the 3 styles
        const roll = Math.random();
        if (roll < 0.33) attackStyle = 'melee';
        else if (roll < 0.66) attackStyle = 'magic';
        else attackStyle = 'ranged';
      } else {
        // Out of melee range — random mage or range
        attackStyle = Math.random() < 0.5 ? 'magic' : 'ranged';
      }

      const damage = Math.floor(Math.random() * (npc.maxHit + 1));

      if (attackStyle === 'melee') {
        // Melee is instant, no projectile
        return { type: 'melee', damage, prayerStyle: 'melee', attackStyle: 'MELEE' };
      }

      // CRITICAL: Prayer is checked when projectile LANDS (3 tick delay)
      projectiles.create({
        source: { x: npc.x, y: npc.y, size: npc.size, id: npc.id, name: npc.name },
        target: { x: target.x, y: target.y, size: 1, id: target.id },
        type: attackStyle === 'magic' ? 'magic' : 'ranged',
        damage,
        prayerStyle: attackStyle,
        checkPrayerOnLand: true, // Prayer checked at land tick, not attack tick
        delayOverride: 3, // Fixed 3-tick delay
      });

      return { type: attackStyle, damage, attackStyle: attackStyle === 'magic' ? 'MAGE' : 'RANGE' };
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. YT-HURKOT (Jad Healer) — Level 141, Size 1x1
// Heals Jad if aggro'd to Jad. Attacks player if aggro'd to player.
// ═══════════════════════════════════════════════════════════════════════════════
function defineJadHealer() {
  npcs.defineNpc('yt_hur_kot', {
    name: 'Yt-HurKot',
    examine: 'A healer that restores Jad.',
    combat: 141,
    maxHp: 60,
    stats: { attack: 165, strength: 125, defence: 100, ranged: 150, magic: 150,
             def_stab: 0, def_slash: 0, def_crush: 0, def_magic: 0, def_ranged: 0 },
    attackSpeed: 4,
    attackRange: 1,
    maxHit: 16,
    size: 1,
    aggressive: false,
    attackStyle: 'melee',
    respawnTicks: 0,
    onTick(npc, currentTick) {
      if (npc.dead || npc.dying > 0) return;
      const jad = npc.customState.jadId ? npcs.getNpc(npc.customState.jadId) : null;
      // If Jad is dead, healer dies too
      if (jad && jad.dead) { npc.dying = 1; return; }
      // If aggro'd to Jad, heal Jad
      if (jad && !npc.customState.aggroPlayer && currentTick >= npc.nextAttackTick) {
        const dist = projectiles.chebyshevDistance(npc.x, npc.y, 1, jad.x, jad.y, jad.size);
        if (dist <= 1) {
          const heal = Math.floor(Math.random() * 20); // 0-19
          jad.hp = Math.min(jad.maxHp, jad.hp + heal);
          npc.nextAttackTick = currentTick + npc.attackSpeed;
        } else {
          npc.target = { x: jad.x, y: jad.y };
        }
      }
    },
    onDamageTaken(npc, damage, attacker) {
      // Aggro to player when attacked
      npc.customState.aggroPlayer = true;
      npc.target = attacker;
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 9. TZKAL-ZUK — Level 1400, Size 7x7
// Unblockable typeless damage. Shield mechanic. Spawns sets on timer.
// Enrages at 240 HP (speed 10 → 7).
// ═══════════════════════════════════════════════════════════════════════════════
function defineZuk() {
  npcs.defineNpc('tzkal_zuk', {
    name: 'TzKal-Zuk',
    examine: 'The final boss of the Inferno. Unblockable damage.',
    combat: 1400,
    maxHp: 1200,
    stats: { attack: 350, strength: 600, defence: 234, ranged: 400, magic: 150,
             def_stab: 0, def_slash: 0, def_crush: 0, def_magic: 350, def_ranged: 100 },
    attackSpeed: 10,
    attackRange: 50, // Hits anywhere in arena
    maxHit: 251,
    size: 7,
    aggressive: true,
    canMove: false, // Zuk doesn't move
    attackStyle: 'typeless',
    respawnTicks: 0,
    onSpawn(npc) {
      npc.customState.setTimer = 72; // First set spawns after 72 ticks
      npc.customState.setTimerMax = 350; // Subsequent sets on 350 tick timer
      npc.customState.setsSpawned = 0;
      npc.customState.jadSpawned = false;
      npc.customState.enraged = false;
      npc.customState.healersSpawned = false;
      npc.customState.shieldId = null;
    },
    onTick(npc, currentTick) {
      if (npc.dead || npc.dying > 0) return;

      // Set timer countdown
      if (npc.customState.setTimer > 0) {
        npc.customState.setTimer--;
        if (npc.customState.setTimer <= 0 && !npc.customState.jadSpawned) {
          // Spawn ranger + mager set
          npc.customState.setsSpawned++;
          npc.customState.setTimer = npc.customState.setTimerMax;
          // Spawn event handled by inferno.js onTick
        }
      }

      // Jad spawn at HP < 480
      if (!npc.customState.jadSpawned && npc.hp <= 480) {
        npc.customState.jadSpawned = true;
        npc.customState.setTimer = 0; // Pause set timer
        // Jad spawn handled by inferno.js
      }

      // Enrage at HP < 240
      if (!npc.customState.enraged && npc.hp <= 240) {
        npc.customState.enraged = true;
        npc.attackSpeed = 7;
        npc.customState.healersSpawned = true;
        // Healer spawn handled by inferno.js
      }
    },
    onAttack(npc, target, currentTick) {
      if (currentTick < npc.nextAttackTick) return null;
      npc.nextAttackTick = currentTick + npc.attackSpeed;

      // Check if player is behind shield
      const shield = npc.customState.shieldId ? entities.get(npc.customState.shieldId) : null;
      if (shield && !shield.dead && entities.isBehindShield(target.x, target.y, shield)) {
        // Hit shield instead
        entities.damage(shield, 0, npc); // Zuk hits shield for 0 (shield just blocks)
        return { type: 'typeless', damage: 0, blocked: true, blockedBy: 'shield' };
      }

      // Unblockable typeless damage — prayer does NOT reduce this
      const damage = Math.floor(Math.random() * (npc.maxHit + 1));
      return { type: 'typeless', damage, unblockable: true };
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 10. JAL-MEJ-JAK (Zuk Healer) — Level 240, Size 3x3
// Heals Zuk. Drops AoE sparks on player.
// ═══════════════════════════════════════════════════════════════════════════════
function defineZukHealer() {
  npcs.defineNpc('jal_mej_jak', {
    name: 'JalMejJak',
    examine: 'A healer for TzKal-Zuk.',
    combat: 240,
    maxHp: 75,
    stats: { attack: 150, strength: 100, defence: 80, magic: 150,
             def_stab: 0, def_slash: 0, def_crush: 0, def_magic: 0, def_ranged: 0 },
    attackSpeed: 3,
    attackRange: 15,
    maxHit: 24,
    size: 3,
    canMove: false, // Zuk healers don't move
    aggressive: false,
    attackStyle: 'magic',
    respawnTicks: 0,
    onSpawn(npc) {
      npc.customState.zukId = null;
      npc.customState.aggroPlayer = false;
    },
    onTick(npc, currentTick) {
      if (npc.dead || npc.dying > 0) return;
      const zuk = npc.customState.zukId ? npcs.getNpc(npc.customState.zukId) : null;
      // If not aggro'd to player, heal Zuk
      if (zuk && !npc.customState.aggroPlayer && currentTick >= npc.nextAttackTick) {
        const heal = Math.floor(Math.random() * 25); // 0-24
        zuk.hp = Math.min(zuk.maxHp, zuk.hp + heal);
        npc.nextAttackTick = currentTick + npc.attackSpeed;
      }
    },
    onDamageTaken(npc, damage, attacker) {
      npc.customState.aggroPlayer = true;
      npc.target = attacker;
    },
    onAttack(npc, target, currentTick) {
      if (!npc.customState.aggroPlayer) return null;
      if (currentTick < npc.nextAttackTick) return null;
      npc.nextAttackTick = currentTick + npc.attackSpeed;
      // AoE spark attack — 3 sparks around player
      const damage = Math.floor(Math.random() * (npc.maxHit + 1));
      return { type: 'magic', damage, aoe: true };
    },
  });
}

// ── Register all Inferno NPC definitions ──
function registerAll() {
  defineNibbler();
  defineBat();
  defineBlob();
  defineMeleer();
  defineRanger();
  defineMager();
  defineJad();
  defineJadHealer();
  defineZuk();
  defineZukHealer();
}

module.exports = { registerAll };
