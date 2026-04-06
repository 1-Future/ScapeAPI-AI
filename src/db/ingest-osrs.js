#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// OSRS Tick Ingester — watches ScapeTickTracker JSONL files and streams
// real OSRS game data into the Scape database.
//
// Run while playing: node src/db/ingest-osrs.js
// It watches ~/.runelite/scapeticktracker/ for new session files,
// tails them in real-time, and inserts every tick into PostgreSQL.
//
// This gives us:
// - Ground truth data from real OSRS to compare against our engine
// - Combat formulas validation (real accuracy rolls, real max hits)
// - Movement verification (real pathfinding, real tick timing)
// - Automatic mechanic discovery (what events happen, in what order)
// ══════════════════════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');
const db = require('./index');

const WATCH_DIR = process.argv[2] ||
  path.join(process.env.HOME || process.env.USERPROFILE, '.runelite', 'scapeticktracker');

let sessionId = null;
let episodeId = null;
let tickCount = 0;
let lastFileSize = 0;
let currentFile = null;

// ── Find the latest session file ────────────────────────────────────────────

function getLatestSessionFile() {
  if (!fs.existsSync(WATCH_DIR)) {
    console.error(`[ingest] Watch directory not found: ${WATCH_DIR}`);
    return null;
  }
  const files = fs.readdirSync(WATCH_DIR)
    .filter(f => f.endsWith('.jsonl'))
    .sort()
    .reverse();
  return files[0] ? path.join(WATCH_DIR, files[0]) : null;
}

// ── Parse one TickData JSON line and insert into database ───────────────────

async function ingestTick(line) {
  let data;
  try {
    data = JSON.parse(line);
  } catch {
    return; // skip malformed lines
  }

  if (!episodeId) {
    // Create session and episode on first tick
    sessionId = await db.createSession('osrs_capture', {
      source: 'ScapeTickTracker',
      file: currentFile,
    });
    episodeId = await db.createEpisode(sessionId, 1, null, 'osrs_live');
    console.log(`[ingest] New session: ${sessionId}`);
  }

  const tick = data.tickNumber || tickCount;
  tickCount++;

  // ── Player state ──
  const p = data.player || {};
  const c = data.combat || {};

  await db.query(
    `INSERT INTO ticks (episode_id, tick_num,
      player_x, player_y, player_hp, player_max_hp, player_pp, player_max_pp,
      player_run, player_weapon, in_combat, target_name, target_x, target_y,
      target_hp, target_max_hp, distance_to_target, active_prayers, wave, mob_count)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)`,
    [episodeId, tick,
     p.worldX, p.worldY, p.currentHealth, p.maxHealth, p.currentPrayer, p.maxPrayer,
     p.runEnergy, p.weaponItemId ? String(p.weaponItemId) : null,
     c.inCombat || false, c.targetName || null, c.targetWorldX, c.targetWorldY,
     c.targetHealthRatio, c.targetHealthScale, c.distanceToTarget,
     c.activePrayers || [], 0,
     data.world?.nearbyNpcs?.length || 0]
  ).catch(err => console.error('[ingest:tick]', err.message));

  // ── Hitsplats ──
  if (data.hitsplats) {
    for (const h of data.hitsplats) {
      await db.query(
        `INSERT INTO tick_events (episode_id, tick_num, event_type, source_type, source_name, target_type, target_name, data)
        VALUES ($1, $2, 'hitsplat', $3, $4, $5, $6, $7)`,
        [episodeId, tick, h.actorType, h.actorName, h.actorType, h.actorName,
         JSON.stringify({ damage: h.damage, type: h.hitsplatType })]
      ).catch(() => {});
    }
  }

  // ── Player hitsplats ──
  if (c.playerHitsplats) {
    for (const h of c.playerHitsplats) {
      await db.query(
        `INSERT INTO tick_events (episode_id, tick_num, event_type, source_type, source_name, target_type, target_name, data)
        VALUES ($1, $2, 'player_hitsplat', 'npc', $3, 'player', 'player', $4)`,
        [episodeId, tick, c.targetName || 'unknown',
         JSON.stringify({ damage: h.damage, type: h.type })]
      ).catch(() => {});
    }
  }

  // ── Target hitsplats ──
  if (c.targetHitsplats) {
    for (const h of c.targetHitsplats) {
      await db.query(
        `INSERT INTO tick_events (episode_id, tick_num, event_type, source_type, source_name, target_type, target_name, data)
        VALUES ($1, $2, 'target_hitsplat', 'player', 'player', 'npc', $3, $4)`,
        [episodeId, tick, c.targetName || 'unknown',
         JSON.stringify({ damage: h.damage, type: h.type })]
      ).catch(() => {});
    }
  }

  // ── Projectiles ──
  if (data.projectiles) {
    for (const proj of data.projectiles) {
      await db.query(
        `INSERT INTO tick_events (episode_id, tick_num, event_type, source_type, source_name, data)
        VALUES ($1, $2, 'projectile', 'system', 'osrs', $3)`,
        [episodeId, tick, JSON.stringify(proj)]
      ).catch(() => {});
    }
  }

  // ── XP drops ──
  if (data.xpDrops) {
    for (const xp of data.xpDrops) {
      await db.query(
        `INSERT INTO tick_events (episode_id, tick_num, event_type, source_type, source_name, data)
        VALUES ($1, $2, 'xp_drop', 'player', 'player', $3)`,
        [episodeId, tick, JSON.stringify(xp)]
      ).catch(() => {});
    }
  }

  // ── Chat messages ──
  if (data.chatMessages) {
    for (const msg of data.chatMessages) {
      await db.query(
        `INSERT INTO tick_events (episode_id, tick_num, event_type, source_type, source_name, data)
        VALUES ($1, $2, 'chat', 'system', $3, $4)`,
        [episodeId, tick, msg.sender || 'system', JSON.stringify(msg)]
      ).catch(() => {});
    }
  }

  // ── Nearby NPCs ──
  if (data.world?.nearbyNpcs) {
    for (const npc of data.world.nearbyNpcs) {
      await db.query(
        `INSERT INTO tick_npcs (episode_id, tick_num, npc_name, npc_id, x, y, hp, max_hp, size, has_los, target)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1, $9, $10)`,
        [episodeId, tick, npc.name, npc.index, npc.worldX, npc.worldY,
         npc.healthRatio, npc.healthScale, npc.isInteracting, null]
      ).catch(() => {});
    }
  }

  // ── Interaction state ──
  if (data.interaction && data.interaction.interactionType !== 'none') {
    await db.query(
      `INSERT INTO tick_events (episode_id, tick_num, event_type, source_type, source_name, target_type, target_name, data)
      VALUES ($1, $2, 'interaction', 'player', 'player', $3, $4, $5)`,
      [episodeId, tick, data.interaction.interactionType || 'unknown',
       data.interaction.targetName || 'unknown',
       JSON.stringify(data.interaction)]
    ).catch(() => {});
  }

  // Progress output
  if (tickCount % 100 === 0) {
    console.log(`[ingest] ${tickCount} ticks ingested`);
  }
}

// ── Tail a file and process new lines ───────────────────────────────────────

function tailFile(filepath) {
  const stat = fs.statSync(filepath);
  lastFileSize = stat.size;
  currentFile = filepath;

  console.log(`[ingest] Tailing: ${filepath}`);
  console.log(`[ingest] File size: ${lastFileSize} bytes`);

  // Process any existing content first
  if (lastFileSize > 0) {
    const content = fs.readFileSync(filepath, 'utf8');
    const lines = content.split('\n').filter(l => l.trim());
    console.log(`[ingest] Processing ${lines.length} existing ticks...`);
    (async () => {
      for (const line of lines) {
        await ingestTick(line);
      }
      console.log(`[ingest] Caught up. Watching for new ticks...`);
    })();
  }

  // Watch for new content
  fs.watchFile(filepath, { interval: 600 }, async (curr, prev) => {
    if (curr.size <= prev.size) return; // no new data

    // Read only the new bytes
    const fd = fs.openSync(filepath, 'r');
    const newSize = curr.size - prev.size;
    const buffer = Buffer.alloc(newSize);
    fs.readSync(fd, buffer, 0, newSize, prev.size);
    fs.closeSync(fd);

    const newContent = buffer.toString('utf8');
    const lines = newContent.split('\n').filter(l => l.trim());
    for (const line of lines) {
      await ingestTick(line);
    }
  });
}

// ── Watch for new session files ─────────────────────────────────────────────

function watchForNewSessions() {
  if (!fs.existsSync(WATCH_DIR)) {
    console.log(`[ingest] Creating watch directory: ${WATCH_DIR}`);
    fs.mkdirSync(WATCH_DIR, { recursive: true });
  }

  // Check for new files every 5 seconds
  setInterval(() => {
    const latest = getLatestSessionFile();
    if (latest && latest !== currentFile) {
      console.log(`[ingest] New session file detected: ${path.basename(latest)}`);
      if (currentFile) {
        fs.unwatchFile(currentFile);
        // End the old episode
        if (episodeId) {
          db.endEpisode(episodeId, 'session_end', 0, 0, 0, tickCount, {}, 0).catch(() => {});
        }
        episodeId = null;
        tickCount = 0;
      }
      tailFile(latest);
    }
  }, 5000);
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('══════════════════════════════════════════');
  console.log('  OSRS Tick Ingester — ScapeTickTracker');
  console.log('══════════════════════════════════════════');
  console.log(`Watch dir: ${WATCH_DIR}`);
  console.log('');

  // Start with latest file if one exists
  const latest = getLatestSessionFile();
  if (latest) {
    tailFile(latest);
  } else {
    console.log('[ingest] No session files found. Waiting for RuneLite to start recording...');
  }

  // Keep watching for new sessions
  watchForNewSessions();

  console.log('[ingest] Running. Play OSRS with ScapeTickTracker enabled.');
  console.log('[ingest] Press Ctrl+C to stop.\n');
}

main().catch(err => {
  console.error('Ingester failed:', err);
  process.exit(1);
});
