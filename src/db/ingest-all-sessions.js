#!/usr/bin/env node
// Batch ingest ALL session files into the database

const fs = require('fs');
const path = require('path');
const db = require('./index');

const DATA_DIR = process.argv[2] || path.join(__dirname, '..', '..', 'osrs-data');

async function ingestFile(filepath) {
  const content = fs.readFileSync(filepath, 'utf8');
  const lines = content.split('\n').filter(l => l.trim());
  if (!lines.length) return 0;

  const filename = path.basename(filepath);
  const sessionId = await db.createSession('osrs_capture', { source: 'ScapeTickTracker', file: filename });
  const episodeId = await db.createEpisode(sessionId, 1, filename.replace('.jsonl', ''), 'osrs_live');

  let count = 0;
  for (const line of lines) {
    let data;
    try { data = JSON.parse(line); } catch { continue; }

    const tick = data.tickNumber || count;
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
       c.activePrayers || [], 0, data.world?.nearbyNpcs?.length || 0]
    ).catch(() => {});

    // Events
    if (data.hitsplats) for (const h of data.hitsplats) {
      await db.query(`INSERT INTO tick_events (episode_id, tick_num, event_type, source_name, target_name, data) VALUES ($1,$2,'hitsplat',$3,$4,$5)`,
        [episodeId, tick, h.actorName, h.actorName, JSON.stringify({ damage: h.damage, type: h.hitsplatType })]).catch(() => {});
    }
    if (c.playerHitsplats) for (const h of c.playerHitsplats) {
      await db.query(`INSERT INTO tick_events (episode_id, tick_num, event_type, source_name, target_name, data) VALUES ($1,$2,'player_hitsplat',$3,'player',$4)`,
        [episodeId, tick, c.targetName || 'unknown', JSON.stringify({ damage: h.damage, type: h.type })]).catch(() => {});
    }
    if (c.targetHitsplats) for (const h of c.targetHitsplats) {
      await db.query(`INSERT INTO tick_events (episode_id, tick_num, event_type, source_name, target_name, data) VALUES ($1,$2,'target_hitsplat','player',$3,$4)`,
        [episodeId, tick, c.targetName || 'unknown', JSON.stringify({ damage: h.damage, type: h.type })]).catch(() => {});
    }
    if (data.chatMessages) for (const msg of data.chatMessages) {
      await db.query(`INSERT INTO tick_events (episode_id, tick_num, event_type, source_name, data) VALUES ($1,$2,'chat',$3,$4)`,
        [episodeId, tick, msg.sender || 'system', JSON.stringify(msg)]).catch(() => {});
    }
    if (data.xpDrops) for (const xp of data.xpDrops) {
      await db.query(`INSERT INTO tick_events (episode_id, tick_num, event_type, source_name, data) VALUES ($1,$2,'xp_drop','player',$3)`,
        [episodeId, tick, JSON.stringify(xp)]).catch(() => {});
    }
    if (data.projectiles) for (const proj of data.projectiles) {
      await db.query(`INSERT INTO tick_events (episode_id, tick_num, event_type, source_name, data) VALUES ($1,$2,'projectile','osrs',$3)`,
        [episodeId, tick, JSON.stringify(proj)]).catch(() => {});
    }
    if (data.interaction && data.interaction.interactionType !== 'none') {
      await db.query(`INSERT INTO tick_events (episode_id, tick_num, event_type, source_name, target_name, data) VALUES ($1,$2,'interaction','player',$3,$4)`,
        [episodeId, tick, data.interaction.targetName || 'unknown', JSON.stringify(data.interaction)]).catch(() => {});
    }

    // Nearby NPCs
    if (data.world?.nearbyNpcs) for (const npc of data.world.nearbyNpcs) {
      await db.query(`INSERT INTO tick_npcs (episode_id, tick_num, npc_name, npc_id, x, y, hp, max_hp, has_los) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [episodeId, tick, npc.name, npc.index, npc.worldX, npc.worldY, npc.healthRatio, npc.healthScale, npc.isInteracting]).catch(() => {});
    }

    count++;
    if (count % 500 === 0) process.stdout.write(`  ${count}/${lines.length}\r`);
  }

  await db.endEpisode(episodeId, 'session_end', 0, 0, 0, count, {}, 0).catch(() => {});
  return count;
}

async function main() {
  console.log('Batch ingesting all OSRS sessions...\n');

  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.jsonl')).sort();
  let totalTicks = 0;

  for (const file of files) {
    const filepath = path.join(DATA_DIR, file);
    const size = fs.statSync(filepath).size;
    if (size === 0) { console.log(`  SKIP ${file} (empty)`); continue; }

    process.stdout.write(`  ${file} (${(size/1024/1024).toFixed(1)}MB)... `);
    const count = await ingestFile(filepath);
    totalTicks += count;
    console.log(`${count} ticks`);
  }

  console.log(`\nDone. ${totalTicks} total ticks ingested.`);
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
