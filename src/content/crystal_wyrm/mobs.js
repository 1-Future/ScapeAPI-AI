// ── Crystal Wyrm Content Pack — Mob Definitions ─────────────────────────────
// Redesigned as a combat puzzle per Boss-Builder-Inject principles.
//
// CRYSTALLITE — Magic attacker, targets pillars if not aggro'd, heals boss in P2
// CRYSTAL WYRM — 3-phase boss with overlapping threats:
//   P1: Ranged barrage + crystallite adds fire magic = prayer contention
//   P2: AoE ground slam + prayer-scan + healing adds = 3 competing demands
//   P3: Blitz speed + pillar destruction + endless adds = DPS race

const npcs = require('../../world/npcs');
const projectiles = require('../../combat/projectiles');
const entities = require('../../world/entities');

// ═══════════════════════════════════════════════════════════════════════════════
// CRYSTALLITE — Level 85, Size 1x1, Magic attacker
// Targets pillars if player hasn't aggro'd them. In Phase 2+ heals the boss.
// ═══════════════════════════════════════════════════════════════════════════════
function defineCrystallite() {
  npcs.defineNpc('crystallite', {
    name: 'Crystallite',
    examine: 'A small creature made of living crystal.',
    combat: 85,
    maxHp: 40,
    stats: {
      attack: 1, strength: 1, defence: 50, magic: 80, ranged: 1,
      def_stab: 20, def_slash: 20, def_crush: -20, def_magic: 10, def_ranged: 30,
    },
    attackSpeed: 4,
    attackRange: 6,
    maxHit: 14,
    size: 1,
    aggressive: true,
    aggroRange: 8,
    wanderRadius: 0,
    respawnTicks: 0,
    attackStyle: 'magic',
    canMelee: false,
    autoRetaliate: true,
    blocksMobs: false,

    onSpawn(npc) {
      npc.customState = {
        targetPillar: null,  // entity ID of pillar to attack
        healMode: false,     // true in P2+ — heals boss instead of attacking player
        healTarget: null,    // boss NPC id
        lastHealTick: 0,
      };
    },

    onTick(npc, currentTick) {
      if (npc.dead || npc.dying > 0) return;
      const cs = npc.customState;

      // Healing disabled for now — adds attack player/pillars instead
      // TODO: re-enable once base fight is tuned
      // if (cs.healMode && cs.healTarget && (!npc.target || !npc.target.hp)) { ... }

      // If no player target, attack nearest pillar
      if (!npc.target || typeof npc.target === 'object') {
        if (!cs.targetPillar) {
          const ents = entities.getInInstance(npc.instance);
          const pillars = ents.filter(e => e.type === 'pillar' && !e.dead);
          if (pillars.length) {
            let nearest = null, nearDist = Infinity;
            for (const p of pillars) {
              const d = Math.abs(npc.x - p.x) + Math.abs(npc.y - p.y);
              if (d < nearDist) { nearest = p; nearDist = d; }
            }
            cs.targetPillar = nearest?.id;
          }
        }
        // Attack pillar if close enough
        const pillar = cs.targetPillar ? entities.get(cs.targetPillar) : null;
        if (pillar && !pillar.dead) {
          const dist = Math.max(Math.abs(npc.x - pillar.x), Math.abs(npc.y - pillar.y));
          if (dist <= 1 && currentTick >= (npc.nextAttackTick || 0)) {
            entities.damage(pillar, Math.floor(Math.random() * 6) + 2, npc);
            npc.nextAttackTick = currentTick + npc.attackSpeed;
          }
        }
      }
    },

    onAttack(npc, target, currentTick) {
      // Magic projectile at player
      const dist = projectiles.chebyshevDistance(npc.x, npc.y, 1, target.x, target.y, 1);
      const flight = Math.max(1, Math.floor(dist / 3));
      const damage = Math.floor(Math.random() * (npc.maxHit + 1));
      projectiles.create({
        source: npc, target, style: 'magic',
        damage, delay: flight, totalDelay: flight,
        checkPrayerOnLand: true, prayerStyle: 'magic',
      });
      return { type: 'magic', damage, delay: flight };
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// CRYSTAL WYRM — Level 350, Size 4x4, 3-phase combat puzzle
//
// Phase 1 — Crystal Shell (100%-66% HP)
//   Boss: ranged barrage (3 projectiles, pray ranged)
//   Adds: 2 crystallites spawn at pillars (magic, pray magic)
//   PUZZLE: Prayer contention. Pillar one threat, pray the other.
//           Adds attack pillars if not aggro'd. Lose pillars = lose P3 safety.
//
// Phase 2 — Shattered Core (66%-33% HP)
//   Boss: AoE ground slam every 6 ticks (2-tile radius, 30-50 dmg, must move)
//   Boss: Prayer-scans player, attacks with OPPOSITE style (3-tick delay)
//   Adds: Switch to healing mode — heal boss 8 HP/5 ticks if alive
//   PUZZLE: Move from AoE + prayer-switch the scan + kill healers. 3 demands/tick.
//
// Phase 3 — Enraged (below 33% HP)
//   Boss: Attack speed 3 ticks (blitz principle)
//   Boss: Destroys one pillar every 40 ticks (shrinking safe space)
//   Boss: Alternates magic/ranged with 2-tick tell
//   Adds: Respawn every 30 ticks (endless, DPS race)
//   PUZZLE: Prayer switch at blitz speed + protect pillars + manage adds + DPS race
// ═══════════════════════════════════════════════════════════════════════════════
function defineCrystalWyrm() {
  npcs.defineNpc('crystal_wyrm', {
    name: 'Crystal Wyrm',
    examine: 'An ancient wyrm made of living crystal. Its body pulses with energy.',
    combat: 450,
    maxHp: 500,
    stats: {
      attack: 250, strength: 220, defence: 250, magic: 250, ranged: 250,
      def_stab: 100, def_slash: 120, def_crush: 60, def_magic: 50, def_ranged: 100,
    },
    attackSpeed: 5,
    attackRange: 8,
    maxHit: 70,
    size: 4,
    aggressive: true,
    aggroRange: 20,
    wanderRadius: 0,
    respawnTicks: 0,
    attackStyle: 'ranged',
    canMelee: true,
    autoRetaliate: true,

    onSpawn(npc) {
      npc.customState = {
        phase: 1,
        phaseTransitioned: { 2: false, 3: false },
        // Phase 1
        p1AddsSpawned: false,
        // Phase 2
        lastSlamTick: 0,
        scanResult: null,      // null, 'magic', 'ranged', 'none'
        scanPhase: 'idle',     // idle, scanning, attacking
        scanTick: 0,
        // Phase 3
        lastPillarDestroyTick: 0,
        lastAddRespawnTick: 0,
        nextAttackStyle: null, // for 2-tick tell
        tellTick: 0,
      };
    },

    onTick(npc, currentTick) {
      if (npc.dead || npc.dying > 0) return;
      const hpPct = npc.hp / npc.maxHp;
      const cs = npc.customState;

      // ── Phase transitions ──
      if (hpPct <= 0.33 && !cs.phaseTransitioned[3]) {
        cs.phase = 3;
        cs.phaseTransitioned[3] = true;
        npc.attackSpeed = 3; // Blitz
        cs.lastPillarDestroyTick = currentTick;
        cs.lastAddRespawnTick = currentTick;
      } else if (hpPct <= 0.66 && !cs.phaseTransitioned[2]) {
        cs.phase = 2;
        cs.phaseTransitioned[2] = true;
        npc.attackSpeed = 5;
        cs.lastSlamTick = currentTick;

        // Switch existing adds to heal mode
        const alive = npcs.getNpcsInInstance(npc.instance);
        for (const add of alive) {
          if (add.defId === 'crystallite' && add.customState) {
            add.customState.healMode = true;
            add.customState.healTarget = npc.id;
          }
        }
      }

      // ── Phase 1: Spawn initial adds at pillars ──
      if (cs.phase === 1 && !cs.p1AddsSpawned) {
        cs.p1AddsSpawned = true;
        // Spawn 2 crystallites near different pillars
        const ents = entities.getInInstance(npc.instance);
        const pillars = ents.filter(e => e.type === 'pillar' && !e.dead);
        for (let i = 0; i < Math.min(2, pillars.length); i++) {
          const p = pillars[i];
          const add = npcs.spawnNpc('crystallite', p.x + 2, p.y, npc.layer, { instance: npc.instance });
          if (add) {
            add.customState.targetPillar = p.id;
          }
        }
      }

      // ── Phase 2: AoE ground slam every 6 ticks ──
      if (cs.phase === 2 && currentTick >= cs.lastSlamTick + 6) {
        cs.lastSlamTick = currentTick;
        // Damage everything within 2 tiles of boss center
        const cx = npc.x + 2, cy = npc.y + 2; // center of 4x4
        const alive = npcs.getNpcsInInstance(npc.instance);
        // Find the player (target)
        if (npc.target && npc.target.hp !== undefined) {
          const player = npc.target;
          const dx = Math.abs(player.x - cx), dy = Math.abs(player.y - cy);
          if (Math.max(dx, dy) <= 3) {
            // Ground slam hits — typeless damage, can't be prayed against
            const slamDmg = Math.floor(Math.random() * 30) + 45; // 45-74
            player.hp = Math.max(0, player.hp - slamDmg);
          }
        }
      }

      // ── Phase 2: Prayer scan cycle ──
      if (cs.phase === 2) {
        if (cs.scanPhase === 'idle' && npc.target && npc.target.activePrayers) {
          // Start scan
          const target = npc.target;
          if (target.activePrayers.has('protect_from_magic')) {
            cs.scanResult = 'magic';
          } else if (target.activePrayers.has('protect_from_missiles')) {
            cs.scanResult = 'ranged';
          } else {
            cs.scanResult = 'none';
          }
          cs.scanPhase = 'scanning';
          cs.scanTick = currentTick;
        }
        if (cs.scanPhase === 'scanning' && currentTick >= cs.scanTick + 3) {
          cs.scanPhase = 'attacking';
        }
      }

      // ── Phase 3: Destroy a pillar every 40 ticks ──
      if (cs.phase === 3 && currentTick >= cs.lastPillarDestroyTick + 40) {
        cs.lastPillarDestroyTick = currentTick;
        const ents = entities.getInInstance(npc.instance);
        const pillars = ents.filter(e => e.type === 'pillar' && !e.dead);
        if (pillars.length > 0) {
          // Destroy the pillar with lowest HP
          const weakest = pillars.reduce((a, b) => a.hp < b.hp ? a : b);
          entities.damage(weakest, weakest.hp, npc); // Instant kill
        }
      }

      // ── Phase 3: Respawn adds every 30 ticks ──
      if (cs.phase === 3 && currentTick >= cs.lastAddRespawnTick + 30) {
        cs.lastAddRespawnTick = currentTick;
        const alive = npcs.getNpcsInInstance(npc.instance);
        const addCount = alive.filter(n => n.defId === 'crystallite' && !n.dead).length;
        if (addCount < 3) {
          // Spawn at random position in arena
          const sx = npc.x + Math.floor(Math.random() * 8) - 4;
          const sy = npc.y + Math.floor(Math.random() * 8) - 4;
          const add = npcs.spawnNpc('crystallite', sx, sy, npc.layer, { instance: npc.instance });
          if (add) {
            add.customState.healMode = true;
            add.customState.healTarget = npc.id;
            if (npc.target) add.target = npc.target;
          }
        }
      }

      // ── Phase 3: 2-tick attack tell ──
      if (cs.phase === 3) {
        if (!cs.nextAttackStyle || currentTick >= cs.tellTick + 2) {
          cs.nextAttackStyle = Math.random() < 0.5 ? 'magic' : 'ranged';
          cs.tellTick = currentTick;
        }
      }
    },

    onAttack(npc, target, currentTick) {
      const cs = npc.customState;
      const dist = projectiles.chebyshevDistance(npc.x, npc.y, npc.size, target.x, target.y, 1);

      // ══ Phase 1: Crystal Barrage — 3 ranged projectiles ══
      if (cs.phase === 1) {
        const flight = Math.max(1, Math.floor(dist / 3));
        let totalDmg = 0;
        for (let i = 0; i < 3; i++) {
          const dmg = Math.floor(Math.random() * 24); // 0-23 per shard
          totalDmg += dmg;
          projectiles.create({
            source: npc, target, style: 'ranged',
            damage: dmg, delay: flight + i, totalDelay: flight + i,
            checkPrayerOnLand: true, prayerStyle: 'ranged',
          });
        }
        return { type: 'ranged', damage: totalDmg, delay: flight };
      }

      // ══ Phase 2: Prayer-scan attack ══
      if (cs.phase === 2) {
        if (cs.scanPhase === 'attacking') {
          // Attack with OPPOSITE of what was scanned
          let attackStyle;
          if (cs.scanResult === 'magic') attackStyle = 'ranged';
          else if (cs.scanResult === 'ranged') attackStyle = 'magic';
          else attackStyle = Math.random() < 0.5 ? 'magic' : 'ranged';

          const flight = Math.max(1, Math.floor(dist / 3));
          const damage = Math.floor(Math.random() * (npc.maxHit + 1));
          projectiles.create({
            source: npc, target, style: attackStyle,
            damage, delay: flight, totalDelay: flight,
            checkPrayerOnLand: true, prayerStyle: attackStyle,
          });

          // Reset scan cycle
          cs.scanPhase = 'idle';
          cs.scanResult = null;
          return { type: attackStyle, damage, delay: flight };
        }
        // During scanning, fire a weaker ranged attack
        const flight = Math.max(1, Math.floor(dist / 3));
        const dmg = Math.floor(Math.random() * 15);
        projectiles.create({
          source: npc, target, style: 'ranged',
          damage: dmg, delay: flight, totalDelay: flight,
          checkPrayerOnLand: true, prayerStyle: 'ranged',
        });
        return { type: 'ranged', damage: dmg, delay: flight };
      }

      // ══ Phase 3: Blitz alternating magic/ranged with 2-tick tell ══
      if (cs.phase === 3) {
        const style = cs.nextAttackStyle || 'magic';
        const flight = Math.max(1, Math.floor(dist / 3));
        const damage = Math.floor(Math.random() * (npc.maxHit + 1));
        projectiles.create({
          source: npc, target, style,
          damage, delay: flight, totalDelay: flight,
          checkPrayerOnLand: true, prayerStyle: style,
        });
        // Queue next tell
        cs.nextAttackStyle = null;
        cs.tellTick = currentTick;
        return { type: style, damage, delay: flight };
      }

      return null;
    },

    onDeath(npc, killer, currentTick) {
      // Kill all remaining adds
      const alive = npcs.getNpcsInInstance(npc.instance);
      for (const add of alive) {
        if (add.defId === 'crystallite' && !add.dead) {
          add.hp = 0;
          add.dead = true;
        }
      }
    },
  });
}

function registerAll() {
  defineCrystallite();
  defineCrystalWyrm();
}

module.exports = { registerAll };
