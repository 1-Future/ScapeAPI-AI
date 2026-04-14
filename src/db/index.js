// ══════════════════════════════════════════════════════════════════════════════
// Database Layer — PostgreSQL connection pool + query interface
// Every system in the engine uses this to persist and query structured data.
// ══════════════════════════════════════════════════════════════════════════════

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432'),
  database: process.env.PGDATABASE || 'scape',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  max: 20,                    // connection pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Test connection on load
pool.query('SELECT 1').then(() => {
  console.log('[db] Connected to PostgreSQL');
}).catch(err => {
  console.error('[db] PostgreSQL connection failed:', err.message);
  console.error('[db] Engine will run without database persistence.');
});

// ── Core query interface ────────────────────────────────────────────────────

async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  if (duration > 100) {
    console.warn(`[db] Slow query (${duration}ms): ${text.slice(0, 80)}`);
  }
  return result;
}

async function queryOne(text, params) {
  const result = await query(text, params);
  return result.rows[0] || null;
}

async function queryAll(text, params) {
  const result = await query(text, params);
  return result.rows;
}

// ── Batch insert helper (for high-throughput tick data) ──────────────────────

async function batchInsert(table, columns, rows) {
  if (!rows.length) return;
  const colStr = columns.join(', ');
  const placeholders = rows.map((row, ri) => {
    return '(' + columns.map((_, ci) => `$${ri * columns.length + ci + 1}`).join(', ') + ')';
  }).join(', ');
  const values = rows.flat();
  await query(`INSERT INTO ${table} (${colStr}) VALUES ${placeholders}`, values);
}

// ══════════════════════════════════════════════════════════════════════════════
// SESSION + EPISODE MANAGEMENT
// ══════════════════════════════════════════════════════════════════════════════

async function createSession(type = 'training', config = {}) {
  const result = await queryOne(
    'INSERT INTO sessions (session_type, config) VALUES ($1, $2) RETURNING id',
    [type, JSON.stringify(config)]
  );
  return result.id;
}

async function endSession(sessionId) {
  await query('UPDATE sessions SET ended_at = NOW() WHERE id = $1', [sessionId]);
}

async function createEpisode(sessionId, episodeNum, replayId, challenge = 'full') {
  const result = await queryOne(
    'INSERT INTO episodes (session_id, episode_num, replay_id, challenge) VALUES ($1, $2, $3, $4) RETURNING id',
    [sessionId, episodeNum, replayId, challenge]
  );
  return result.id;
}

async function endEpisode(episodeId, outcome, finalWave, finalHp, damageTaken, ticksSurvived, suppliesUsed = {}, maxWave = 0) {
  await query(
    `UPDATE episodes SET
      ended_at = NOW(), outcome = $2, final_wave = $3, final_hp = $4,
      damage_taken = $5, ticks_survived = $6, supplies_used = $7, max_wave = $8
    WHERE id = $1`,
    [episodeId, outcome, finalWave, finalHp, damageTaken, ticksSurvived, JSON.stringify(suppliesUsed), maxWave]
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TICK EVENT WRITER
// Buffers events during a tick, flushes to DB at tick end.
// Designed for high throughput — batches inserts, async writes.
// ══════════════════════════════════════════════════════════════════════════════

class TickWriter {
  constructor(episodeId) {
    this.episodeId = episodeId;
    this.tickNum = 0;
    this.tickBuffer = null;        // current tick snapshot
    this.eventBuffer = [];         // events this tick
    this.npcBuffer = [];           // NPC snapshots this tick
    this.projBuffer = [];          // projectile snapshots this tick
    this.writeQueue = [];          // async writes in flight
    this.enabled = true;
    this._flushInterval = null;
  }

  // Call at the START of each tick
  startTick(tickNum) {
    this.tickNum = tickNum;
    this.tickBuffer = null;
    this.eventBuffer = [];
    this.npcBuffer = [];
    this.projBuffer = [];
  }

  // Record player state snapshot for this tick
  setPlayerState(state) {
    this.tickBuffer = {
      episode_id: this.episodeId,
      tick_num: this.tickNum,
      player_x: state.x,
      player_y: state.y,
      player_hp: state.hp,
      player_max_hp: state.maxHp || 99,
      player_pp: state.pp,
      player_max_pp: state.maxPp || 99,
      player_run: state.run || 100,
      player_weapon: state.weapon || 'None',
      in_combat: state.inCombat || false,
      target_name: state.targetName || null,
      target_x: state.targetX,
      target_y: state.targetY,
      target_hp: state.targetHp,
      target_max_hp: state.targetMaxHp,
      distance_to_target: state.distToTarget,
      player_attack_cd: state.attackCd,
      active_prayers: state.prayers || [],
      wave: state.wave || 0,
      mob_count: state.mobCount || 0,
      action_id: state.actionId,
      action_name: state.actionName,
    };
  }

  // Record an event
  addEvent(type, { source, sourceType, target, targetType, data } = {}) {
    this.eventBuffer.push({
      episode_id: this.episodeId,
      tick_num: this.tickNum,
      event_type: type,
      source_type: sourceType || null,
      source_name: source || null,
      target_type: targetType || null,
      target_name: target || null,
      data: data || {},
    });
  }

  // Record NPC snapshot
  addNpc(npc) {
    this.npcBuffer.push({
      episode_id: this.episodeId,
      tick_num: this.tickNum,
      npc_name: npc.name,
      npc_id: npc.id,
      x: npc.x,
      y: npc.y,
      hp: npc.hp,
      max_hp: npc.maxHp,
      size: npc.size || 1,
      attack_style: npc.attackStyle || null,
      attack_delay: npc.attackDelay,
      has_los: npc.hasLos,
      dying: npc.dying || false,
      target: npc.target || null,
    });
  }

  // Record projectile snapshot
  addProjectile(proj) {
    this.projBuffer.push({
      episode_id: this.episodeId,
      tick_num: this.tickNum,
      source_name: proj.source,
      target_name: proj.target,
      style: proj.style,
      damage: proj.damage,
      remaining_delay: proj.remainingDelay,
      total_delay: proj.totalDelay,
    });
  }

  // Flush all buffered data to DB (call at END of each tick)
  async flush() {
    if (!this.enabled || !this.episodeId) return;

    const promises = [];

    // Write tick snapshot
    if (this.tickBuffer) {
      const t = this.tickBuffer;
      promises.push(query(
        `INSERT INTO ticks (episode_id, tick_num,
          player_x, player_y, player_hp, player_max_hp, player_pp, player_max_pp,
          player_run, player_weapon, in_combat, target_name, target_x, target_y,
          target_hp, target_max_hp, distance_to_target, player_attack_cd,
          active_prayers, wave, mob_count, action_id, action_name)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)`,
        [t.episode_id, t.tick_num, t.player_x, t.player_y, t.player_hp, t.player_max_hp,
         t.player_pp, t.player_max_pp, t.player_run, t.player_weapon, t.in_combat,
         t.target_name, t.target_x, t.target_y, t.target_hp, t.target_max_hp,
         t.distance_to_target, t.player_attack_cd, t.active_prayers,
         t.wave, t.mob_count, t.action_id, t.action_name]
      ).catch(err => console.error('[db:tick]', err.message)));
    }

    // Write events
    for (const e of this.eventBuffer) {
      promises.push(query(
        `INSERT INTO tick_events (episode_id, tick_num, event_type, source_type, source_name, target_type, target_name, data)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [e.episode_id, e.tick_num, e.event_type, e.source_type, e.source_name,
         e.target_type, e.target_name, JSON.stringify(e.data)]
      ).catch(err => console.error('[db:event]', err.message)));
    }

    // Write NPC snapshots
    for (const n of this.npcBuffer) {
      promises.push(query(
        `INSERT INTO tick_npcs (episode_id, tick_num, npc_name, npc_id, x, y, hp, max_hp, size, attack_style, attack_delay, has_los, dying, target)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
        [n.episode_id, n.tick_num, n.npc_name, n.npc_id, n.x, n.y, n.hp, n.max_hp,
         n.size, n.attack_style, n.attack_delay, n.has_los, n.dying, n.target]
      ).catch(err => console.error('[db:npc]', err.message)));
    }

    // Write projectiles
    for (const p of this.projBuffer) {
      promises.push(query(
        `INSERT INTO tick_projectiles (episode_id, tick_num, source_name, target_name, style, damage, remaining_delay, total_delay)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [p.episode_id, p.tick_num, p.source_name, p.target_name, p.style, p.damage,
         p.remaining_delay, p.total_delay]
      ).catch(err => console.error('[db:proj]', err.message)));
    }

    // Fire and forget — don't block the game tick
    Promise.all(promises).catch(() => {});
  }

  destroy() {
    this.enabled = false;
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// MECHANIC REGISTRY QUERIES
// ══════════════════════════════════════════════════════════════════════════════

async function getMechanics(filters = {}) {
  let where = [];
  let params = [];
  let i = 1;

  if (filters.category) { where.push(`m.category_id = $${i++}`); params.push(filters.category); }
  if (filters.status) { where.push(`m.status = $${i++}`); params.push(filters.status); }
  if (filters.render_tier) { where.push(`m.render_tier = $${i++}`); params.push(filters.render_tier); }
  if (filters.signed_off !== undefined) { where.push(`m.signed_off = $${i++}`); params.push(filters.signed_off); }

  const whereStr = where.length ? 'WHERE ' + where.join(' AND ') : '';
  return queryAll(`
    SELECT m.*, c.name as category_name,
      COALESCE(
        (SELECT json_agg(json_build_object('entity_type', mu.entity_type, 'entity_name', mu.entity_name, 'notes', mu.notes))
         FROM mechanic_usages mu WHERE mu.mechanic_id = m.id), '[]'
      ) as usages
    FROM mechanics m
    LEFT JOIN mechanic_categories c ON c.id = m.category_id
    ${whereStr}
    ORDER BY c.sort_order, m.name
  `, params);
}

async function updateMechanicStatus(mechanicId, status, verifiedAgainst = null) {
  await query(
    `UPDATE mechanics SET status = $2, verified_against = COALESCE($3, verified_against),
      verified_at = CASE WHEN $2 IN ('tested','verified') THEN NOW() ELSE verified_at END,
      updated_at = NOW()
    WHERE id = $1`,
    [mechanicId, status, verifiedAgainst]
  );
}

async function signOffMechanic(mechanicId, signedOffBy = 'human') {
  await query(
    `UPDATE mechanics SET signed_off = true, signed_off_at = NOW(), signed_off_by = $2, updated_at = NOW()
    WHERE id = $1`,
    [mechanicId, signedOffBy]
  );
}

async function getMechanicOverview(renderTier = null) {
  const tierFilter = renderTier ? `AND m.render_tier = '${renderTier}'` : '';
  return queryAll(`
    SELECT
      c.id as category_id, c.name as category_name,
      COUNT(m.id) as total,
      COUNT(CASE WHEN m.status = 'not_implemented' THEN 1 END) as not_implemented,
      COUNT(CASE WHEN m.status = 'implemented' THEN 1 END) as implemented,
      COUNT(CASE WHEN m.status = 'tested' THEN 1 END) as tested,
      COUNT(CASE WHEN m.status = 'verified' THEN 1 END) as verified,
      COUNT(CASE WHEN m.signed_off THEN 1 END) as signed_off,
      COUNT(CASE WHEN m.render_tier = 'text' THEN 1 END) as tier_text,
      COUNT(CASE WHEN m.render_tier = '2d' THEN 1 END) as tier_2d,
      COUNT(CASE WHEN m.render_tier = '3d' THEN 1 END) as tier_3d
    FROM mechanic_categories c
    LEFT JOIN mechanics m ON m.category_id = c.id ${tierFilter}
    GROUP BY c.id, c.name, c.sort_order
    ORDER BY c.sort_order
  `);
}

// ══════════════════════════════════════════════════════════════════════════════
// TRAINING ANALYTICS QUERIES
// ══════════════════════════════════════════════════════════════════════════════

async function getTrainingSummary(sessionId = null) {
  if (sessionId) {
    return queryOne('SELECT * FROM training_summary WHERE session_id = $1', [sessionId]);
  }
  return queryAll('SELECT * FROM training_summary ORDER BY session_start DESC');
}

async function getWaveProgression(sessionId, limit = 1000) {
  return queryAll(
    'SELECT * FROM wave_progression WHERE session_id = $1 ORDER BY episode_num DESC LIMIT $2',
    [sessionId, limit]
  );
}

async function getRecentEpisodes(limit = 50) {
  return queryAll(
    `SELECT e.*, s.session_type
     FROM episodes e
     LEFT JOIN sessions s ON s.id = e.session_id
     ORDER BY e.started_at DESC LIMIT $1`,
    [limit]
  );
}

// Debug query — find ticks where a condition is true
async function debugQuery(episodeId, conditions = {}) {
  let where = ['episode_id = $1'];
  let params = [episodeId];
  let i = 2;

  if (conditions.targetName) { where.push(`target_name = $${i++}`); params.push(conditions.targetName); }
  if (conditions.minHp !== undefined) { where.push(`player_hp >= $${i++}`); params.push(conditions.minHp); }
  if (conditions.maxHp !== undefined) { where.push(`player_hp <= $${i++}`); params.push(conditions.maxHp); }
  if (conditions.wave !== undefined) { where.push(`wave = $${i++}`); params.push(conditions.wave); }
  if (conditions.action) { where.push(`action_name = $${i++}`); params.push(conditions.action); }

  return queryAll(
    `SELECT * FROM ticks WHERE ${where.join(' AND ')} ORDER BY tick_num LIMIT 500`,
    params
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// BUILDER PERSISTENCE
// ══════════════════════════════════════════════════════════════════════════════

async function ensureBuilderTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS builder_entities (
      id          SERIAL PRIMARY KEY,
      tab_id      VARCHAR(64) NOT NULL,
      name        VARCHAR(255) NOT NULL,
      data        JSONB NOT NULL DEFAULT '{}',
      created_by  VARCHAR(64) NOT NULL,
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      updated_at  TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(tab_id, name, created_by)
    )
  `);
  await query('CREATE INDEX IF NOT EXISTS idx_builder_tab ON builder_entities(tab_id)');
  await query('CREATE INDEX IF NOT EXISTS idx_builder_owner ON builder_entities(created_by)');
}

// Run on startup (non-blocking)
ensureBuilderTable().catch(err => {
  console.error('[db] Failed to ensure builder_entities table:', err.message);
});

// ══════════════════════════════════════════════════════════════════════════════

module.exports = {
  pool,
  query, queryOne, queryAll, batchInsert,
  createSession, endSession,
  createEpisode, endEpisode,
  TickWriter,
  getMechanics, updateMechanicStatus, signOffMechanic, getMechanicOverview,
  getTrainingSummary, getWaveProgression, getRecentEpisodes, debugQuery,
};
