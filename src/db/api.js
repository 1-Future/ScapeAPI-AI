// ══════════════════════════════════════════════════════════════════════════════
// Database API — HTTP endpoints for querying game state, mechanics, training
// Mount on the game server's HTTP handler.
// ══════════════════════════════════════════════════════════════════════════════

const db = require('./index');

// ── Route handler ───────────────────────────────────────────────────────────
// Returns true if this module handled the request, false otherwise.

async function handleRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  // CORS for dashboard
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return true; }

  const json = (data, status = 200) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data, null, 2));
  };

  try {
    // ── Mechanics ──────────────────────────────────────────────────────────
    if (path === '/api/mechanics' && req.method === 'GET') {
      const category = url.searchParams.get('category');
      const status = url.searchParams.get('status');
      const render_tier = url.searchParams.get('render_tier');
      const signed_off = url.searchParams.get('signed_off');
      const filters = {};
      if (category) filters.category = category;
      if (status) filters.status = status;
      if (render_tier) filters.render_tier = render_tier;
      if (signed_off !== null && signed_off !== undefined) filters.signed_off = signed_off === 'true';
      json(await db.getMechanics(filters));
      return true;
    }

    if (path === '/api/mechanics/overview' && req.method === 'GET') {
      const renderTier = url.searchParams.get('render_tier');
      json(await db.getMechanicOverview(renderTier));
      return true;
    }

    if (path.startsWith('/api/mechanics/') && req.method === 'PUT') {
      const mechanicId = path.split('/')[3];
      const body = await readBody(req);
      if (body.status) {
        await db.updateMechanicStatus(mechanicId, body.status, body.verified_against);
      }
      if (body.signed_off) {
        await db.signOffMechanic(mechanicId, body.signed_off_by || 'human');
      }
      json({ ok: true, mechanic_id: mechanicId });
      return true;
    }

    // ── Recipes ──────────────────────────────────────────────────────────
    if (path === '/api/recipes' && req.method === 'GET') {
      const mechanicId = url.searchParams.get('mechanic_id');
      const atomId = url.searchParams.get('atom_id');
      if (mechanicId) {
        json(await db.queryAll(
          `SELECT r.*, a.name as atom_name, a.description as atom_desc
           FROM mechanic_recipes r
           JOIN mechanics a ON a.id = r.atom_id
           WHERE r.mechanic_id = $1 ORDER BY a.name`, [mechanicId]
        ));
      } else if (atomId) {
        json(await db.queryAll(
          `SELECT r.*, m.name as feature_name, m.category_id
           FROM mechanic_recipes r
           JOIN mechanics m ON m.id = r.mechanic_id
           WHERE r.atom_id = $1 ORDER BY m.name`, [atomId]
        ));
      } else {
        json(await db.queryAll(
          `SELECT r.atom_id, a.name as atom_name, COUNT(*) as used_in,
             array_agg(DISTINCT m.name ORDER BY m.name) as features
           FROM mechanic_recipes r
           JOIN mechanics a ON a.id = r.atom_id
           JOIN mechanics m ON m.id = r.mechanic_id
           GROUP BY r.atom_id, a.name ORDER BY COUNT(*) DESC`
        ));
      }
      return true;
    }

    // ── Training ──────────────────────────────────────────────────────────
    if (path === '/api/training/summary' && req.method === 'GET') {
      const sessionId = url.searchParams.get('session_id');
      json(await db.getTrainingSummary(sessionId));
      return true;
    }

    if (path === '/api/training/episodes' && req.method === 'GET') {
      const limit = parseInt(url.searchParams.get('limit') || '50');
      json(await db.getRecentEpisodes(limit));
      return true;
    }

    if (path === '/api/training/waves' && req.method === 'GET') {
      const sessionId = url.searchParams.get('session_id');
      const limit = parseInt(url.searchParams.get('limit') || '1000');
      if (!sessionId) { json({ error: 'session_id required' }, 400); return true; }
      json(await db.getWaveProgression(sessionId, limit));
      return true;
    }

    // ── Debug / Tick Query ────────────────────────────────────────────────
    if (path === '/api/ticks' && req.method === 'GET') {
      const episodeId = url.searchParams.get('episode_id');
      if (!episodeId) { json({ error: 'episode_id required' }, 400); return true; }
      const conditions = {};
      if (url.searchParams.get('target')) conditions.targetName = url.searchParams.get('target');
      if (url.searchParams.get('wave')) conditions.wave = parseInt(url.searchParams.get('wave'));
      if (url.searchParams.get('action')) conditions.action = url.searchParams.get('action');
      if (url.searchParams.get('min_hp')) conditions.minHp = parseInt(url.searchParams.get('min_hp'));
      if (url.searchParams.get('max_hp')) conditions.maxHp = parseInt(url.searchParams.get('max_hp'));
      json(await db.debugQuery(episodeId, conditions));
      return true;
    }

    if (path === '/api/ticks/events' && req.method === 'GET') {
      const episodeId = url.searchParams.get('episode_id');
      const tickNum = url.searchParams.get('tick');
      const eventType = url.searchParams.get('type');
      if (!episodeId) { json({ error: 'episode_id required' }, 400); return true; }

      let where = ['episode_id = $1'];
      let params = [episodeId];
      let i = 2;
      if (tickNum) { where.push(`tick_num = $${i++}`); params.push(parseInt(tickNum)); }
      if (eventType) { where.push(`event_type = $${i++}`); params.push(eventType); }

      const result = await db.queryAll(
        `SELECT * FROM tick_events WHERE ${where.join(' AND ')} ORDER BY tick_num, id LIMIT 1000`,
        params
      );
      json(result);
      return true;
    }

    if (path === '/api/ticks/npcs' && req.method === 'GET') {
      const episodeId = url.searchParams.get('episode_id');
      const tickNum = url.searchParams.get('tick');
      const npcName = url.searchParams.get('npc');
      if (!episodeId) { json({ error: 'episode_id required' }, 400); return true; }

      let where = ['episode_id = $1'];
      let params = [episodeId];
      let i = 2;
      if (tickNum) { where.push(`tick_num = $${i++}`); params.push(parseInt(tickNum)); }
      if (npcName) { where.push(`npc_name ILIKE $${i++}`); params.push(`%${npcName}%`); }

      const result = await db.queryAll(
        `SELECT * FROM tick_npcs WHERE ${where.join(' AND ')} ORDER BY tick_num, npc_name LIMIT 1000`,
        params
      );
      json(result);
      return true;
    }

    // ── OSRS Capture Checklist ──────────────────────────────────────────
    if (path === '/api/checklist' && req.method === 'GET') {
      const category = url.searchParams.get('category');
      const where = category ? 'WHERE category = $1' : '';
      const params = category ? [category] : [];
      json(await db.queryAll(
        `SELECT * FROM osrs_capture_checklist ${where} ORDER BY sort_order`, params
      ));
      return true;
    }

    if (path === '/api/checklist/summary' && req.method === 'GET') {
      json(await db.queryAll(`
        SELECT category, COUNT(*) as total,
          COUNT(CASE WHEN captured THEN 1 END) as done
        FROM osrs_capture_checklist GROUP BY category ORDER BY MIN(sort_order)
      `));
      return true;
    }

    if (path.startsWith('/api/checklist/') && req.method === 'PUT') {
      const itemId = decodeURIComponent(path.split('/')[3]);
      const body = await readBody(req);
      if (body.captured !== undefined) {
        await db.query(
          `UPDATE osrs_capture_checklist SET captured = $2,
            captured_at = CASE WHEN $2 THEN NOW() ELSE NULL END,
            notes = COALESCE($3, notes)
          WHERE id = $1`,
          [itemId, body.captured, body.notes || null]
        );
      }
      json({ ok: true });
      return true;
    }

    // ── Mechanic Test Results ──────────────────────────────────────────
    if (path === '/api/mechanic-tests' && req.method === 'GET') {
      const fs = require('fs');
      const testDir = require('path').join(__dirname, '..', '..', '..', 'ScapeTests', 'inferno-rl', 'mechanic-tests');
      try {
        if (!fs.existsSync(testDir)) { json([]); return true; }
        const files = fs.readdirSync(testDir).filter(f => f.endsWith('.json') && !f.startsWith('summary'));
        const results = files.map(f => {
          try { return JSON.parse(fs.readFileSync(require('path').join(testDir, f), 'utf8')); }
          catch { return null; }
        }).filter(Boolean);
        json(results);
      } catch { json([]); }
      return true;
    }

    if (path === '/api/mechanic-tests/summary' && req.method === 'GET') {
      const fs = require('fs');
      const testDir = require('path').join(__dirname, '..', '..', '..', 'ScapeTests', 'inferno-rl', 'mechanic-tests');
      try {
        const summaryFiles = fs.readdirSync(testDir).filter(f => f.startsWith('summary'));
        const summaries = summaryFiles.map(f => {
          try { return JSON.parse(fs.readFileSync(require('path').join(testDir, f), 'utf8')); }
          catch { return null; }
        }).filter(Boolean);
        json(summaries);
      } catch { json([]); }
      return true;
    }

    // ── SQL Query (raw — for AI debugging) ─────────────────────────────
    if (path === '/api/query' && req.method === 'POST') {
      const body = await readBody(req);
      if (!body.sql) { json({ error: 'sql required' }, 400); return true; }

      // Safety: only allow SELECT
      const trimmed = body.sql.trim().toLowerCase();
      if (!trimmed.startsWith('select')) {
        json({ error: 'Only SELECT queries allowed' }, 403);
        return true;
      }

      const result = await db.query(body.sql, body.params || []);
      json({
        rows: result.rows,
        rowCount: result.rowCount,
        fields: result.fields?.map(f => f.name),
      });
      return true;
    }

    // ── Health check ──────────────────────────────────────────────────────
    if (path === '/api/health') {
      const dbOk = await db.queryOne('SELECT 1 as ok').catch(() => null);
      json({
        status: dbOk ? 'healthy' : 'degraded',
        database: dbOk ? 'connected' : 'disconnected',
        uptime: process.uptime(),
      });
      return true;
    }

  } catch (err) {
    console.error('[api]', err.message);
    json({ error: err.message }, 500);
    return true;
  }

  return false; // Not handled by this module
}

// ── Helper: read request body as JSON ────────────────────────────────────────

function readBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch { resolve({}); }
    });
  });
}

module.exports = { handleRequest };
