// ══════════════════════════════════════════════════════════════════════════════
// Database API — HTTP endpoints for querying game state, mechanics, training
// Mount on the game server's HTTP handler.
// ══════════════════════════════════════════════════════════════════════════════

const db = require('./index');
const auth = require('../auth');

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

    // ── Builder Persistence ──────────────────────────────────────────────
    // All builder routes require builder+ role

    // GET /api/builder/entities?tab_id=X — list user's entities for a tab
    if (path === '/api/builder/entities' && req.method === 'GET') {
      const session = auth.getSession(req);
      if (!auth.hasRole(session, 'builder')) { json({ error: 'Forbidden' }, 403); return true; }
      const tabId = url.searchParams.get('tab_id');
      if (!tabId) { json({ error: 'tab_id required' }, 400); return true; }
      const rows = await db.queryAll(
        'SELECT id, tab_id, name, data, created_at, updated_at FROM builder_entities WHERE tab_id = $1 AND created_by = $2 ORDER BY updated_at DESC',
        [tabId, session.name]
      );
      json(rows);
      return true;
    }

    // POST /api/builder/entities — create new entity
    if (path === '/api/builder/entities' && req.method === 'POST') {
      const session = auth.getSession(req);
      if (!auth.hasRole(session, 'builder')) { json({ error: 'Forbidden' }, 403); return true; }
      const body = await readBody(req);
      if (!body.tab_id || !body.name) { json({ error: 'tab_id and name required' }, 400); return true; }
      const result = await db.queryOne(
        `INSERT INTO builder_entities (tab_id, name, data, created_by)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (tab_id, name, created_by) DO UPDATE SET data = $3, updated_at = NOW()
         RETURNING id, tab_id, name`,
        [body.tab_id, body.name, JSON.stringify(body.data || {}), session.name]
      );
      // Hot-reload into engine
      try { const cl = require('../engine/content-loader'); cl.reloadEntity(body.tab_id, result.id); } catch {}
      json(result, 201);
      return true;
    }

    // PUT /api/builder/entities/:id — update entity
    if (path.match(/^\/api\/builder\/entities\/\d+$/) && req.method === 'PUT') {
      const session = auth.getSession(req);
      if (!auth.hasRole(session, 'builder')) { json({ error: 'Forbidden' }, 403); return true; }
      const entityId = parseInt(path.split('/').pop());
      const body = await readBody(req);

      // Verify ownership
      const existing = await db.queryOne('SELECT id, tab_id FROM builder_entities WHERE id = $1 AND created_by = $2', [entityId, session.name]);
      if (!existing) { json({ error: 'Not found' }, 404); return true; }

      const sets = ['updated_at = NOW()'];
      const params = [];
      let i = 1;
      if (body.name !== undefined) { sets.push(`name = $${i++}`); params.push(body.name); }
      if (body.data !== undefined) { sets.push(`data = $${i++}`); params.push(JSON.stringify(body.data)); }
      params.push(entityId);

      await db.query(`UPDATE builder_entities SET ${sets.join(', ')} WHERE id = $${i}`, params);
      // Hot-reload into engine
      try { const cl = require('../engine/content-loader'); cl.reloadEntity(existing.tab_id, entityId); } catch {}
      json({ ok: true, id: entityId });
      return true;
    }

    // DELETE /api/builder/entities/:id
    if (path.match(/^\/api\/builder\/entities\/\d+$/) && req.method === 'DELETE') {
      const session = auth.getSession(req);
      if (!auth.hasRole(session, 'builder')) { json({ error: 'Forbidden' }, 403); return true; }
      const entityId = parseInt(path.split('/').pop());
      const result = await db.query('DELETE FROM builder_entities WHERE id = $1 AND created_by = $2', [entityId, session.name]);
      if (result.rowCount === 0) { json({ error: 'Not found' }, 404); return true; }
      json({ ok: true });
      return true;
    }

    // POST /api/builder/entities/:id/duplicate
    if (path.match(/^\/api\/builder\/entities\/\d+\/duplicate$/) && req.method === 'POST') {
      const session = auth.getSession(req);
      if (!auth.hasRole(session, 'builder')) { json({ error: 'Forbidden' }, 403); return true; }
      const entityId = parseInt(path.split('/')[4]);
      const original = await db.queryOne('SELECT * FROM builder_entities WHERE id = $1 AND created_by = $2', [entityId, session.name]);
      if (!original) { json({ error: 'Not found' }, 404); return true; }
      const newName = original.name + ' (copy)';
      const result = await db.queryOne(
        `INSERT INTO builder_entities (tab_id, name, data, created_by) VALUES ($1, $2, $3, $4) RETURNING id, tab_id, name`,
        [original.tab_id, newName, JSON.stringify(original.data), session.name]
      );
      json(result, 201);
      return true;
    }

    // GET /api/builder/docs — list all available reference docs across repos
    if (path === '/api/builder/docs' && req.method === 'GET') {
      const fs = require('fs');
      const pathMod = require('path');
      const repos = [
        { id: 'spec', label: 'Game Spec (Build Your Own Scape)', dir: pathMod.join(__dirname, '..', '..', '..', 'build-your-own-scape', 'docs') },
        { id: 'manifesto', label: 'Scape Manifesto', dir: pathMod.join(__dirname, '..', '..', '..', 'ScapeManifesto', 'principles') },
        { id: 'manifesto-scape', label: 'Scape-Specific Doctrine', dir: pathMod.join(__dirname, '..', '..', '..', 'ScapeManifesto', 'scape-specific') },
        { id: 'injects', label: 'Builder Injects', dir: pathMod.join(__dirname, '..', '..', '..', 'Scape-Builder-Injects') },
      ];
      const result = {};
      for (const repo of repos) {
        try {
          const files = fs.readdirSync(repo.dir).filter(f => f.endsWith('.md'));
          result[repo.id] = { label: repo.label, files: files.map(f => ({ filename: f, name: f.replace(/\.md$/, '').replace(/^\d+-/, '').replace(/-/g, ' ') })) };
        } catch { result[repo.id] = { label: repo.label, files: [] }; }
      }
      json(result);
      return true;
    }

    // GET /api/builder/doc/:repo/:filename — serve doc from any connected repo
    // Also supports legacy /api/builder/doc/:filename (defaults to spec repo)
    if (path.startsWith('/api/builder/doc/') && req.method === 'GET') {
      const session = auth.getSession(req);
      if (!auth.hasRole(session, 'builder')) { json({ error: 'Forbidden' }, 403); return true; }
      const fs = require('fs');
      const pathMod = require('path');
      const parts = path.replace('/api/builder/doc/', '').split('/');
      let repoDir, filename;
      const repoDirs = {
        spec: pathMod.join(__dirname, '..', '..', '..', 'build-your-own-scape', 'docs'),
        manifesto: pathMod.join(__dirname, '..', '..', '..', 'ScapeManifesto', 'principles'),
        'manifesto-scape': pathMod.join(__dirname, '..', '..', '..', 'ScapeManifesto', 'scape-specific'),
        injects: pathMod.join(__dirname, '..', '..', '..', 'Scape-Builder-Injects'),
      };
      if (parts.length === 2 && repoDirs[parts[0]]) {
        repoDir = repoDirs[parts[0]];
        filename = decodeURIComponent(parts[1]);
      } else {
        // Legacy: single filename defaults to spec
        repoDir = repoDirs.spec;
        filename = decodeURIComponent(parts.join('/'));
      }
      if (!filename.endsWith('.md') || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        json({ error: 'Invalid filename' }, 400); return true;
      }
      const docPath = pathMod.join(repoDir, filename);
      if (!fs.existsSync(docPath)) { json({ error: 'Not found' }, 404); return true; }
      json({ filename, content: fs.readFileSync(docPath, 'utf8') });
      return true;
    }

    // POST /api/builder/persona-test — test persona prompt with Ollama
    if (path === '/api/builder/persona-test' && req.method === 'POST') {
      const session = auth.getSession(req);
      if (!auth.hasRole(session, 'builder')) { json({ error: 'Forbidden' }, 403); return true; }
      const body = await readBody(req);
      if (!body.systemPrompt) { json({ error: 'systemPrompt required' }, 400); return true; }
      try {
        const ollama = require('../ai/ollama');
        if (!ollama.isEnabled()) { json({ error: 'Ollama not running' }, 503); return true; }
        const prompt = body.systemPrompt + '\n\n' + (body.testMessage || 'Hello!');
        const text = await ollama.generate(prompt);
        json({ response: text || 'No response generated' });
      } catch (err) {
        json({ error: err.message }, 500);
      }
      return true;
    }

    // ══════════════════════════════════════════════════════════════════════
    // CONTENT API — All 75 builder tabs as REST resources
    // ══════════════════════════════════════════════════════════════════════

    const registry = require('../engine/content-registry');

    // GET /api/content — list all 75 tabs grouped by mode with entity counts
    if (path === '/api/content' && req.method === 'GET') {
      const counts = {};
      try {
        const rows = await db.queryAll('SELECT tab_id, count(*) as count FROM builder_entities GROUP BY tab_id');
        for (const r of rows) counts[r.tab_id] = parseInt(r.count);
      } catch {}

      const result = {};
      let total = 0;
      for (const [mode, categories] of Object.entries(registry.TAB_REGISTRY)) {
        result[mode] = {};
        for (const [cat, tabs] of Object.entries(categories)) {
          result[mode][cat] = tabs.map(t => {
            const count = counts[t.id] || 0;
            total += count;
            return { id: t.id, label: t.label, dropzone: t.dropzone, count };
          });
        }
      }
      result.playable = Object.keys(registry.PLAYABLE);
      result.total_entities = total;
      json(result);
      return true;
    }

    // GET /api/content/:tab_id — all entities for a tab
    if (path.match(/^\/api\/content\/[a-z0-9-]+$/) && req.method === 'GET') {
      const tabId = path.split('/')[3];
      const tabInfo = registry.getTab(tabId);
      if (!tabInfo) { json({ error: 'Unknown tab: ' + tabId }, 404); return true; }
      const rows = await db.queryAll(
        'SELECT id, tab_id, name, data, created_by, created_at, updated_at FROM builder_entities WHERE tab_id = $1 ORDER BY updated_at DESC',
        [tabId]
      );
      json({ tab_id: tabId, label: tabInfo.label, mode: tabInfo.mode, category: tabInfo.category, entities: rows });
      return true;
    }

    // GET /api/content/:tab_id/:id — single entity
    if (path.match(/^\/api\/content\/[a-z0-9-]+\/\d+$/) && req.method === 'GET') {
      const parts = path.split('/');
      const entityId = parseInt(parts[4]);
      const row = await db.queryOne('SELECT * FROM builder_entities WHERE id = $1', [entityId]);
      if (!row) { json({ error: 'Not found' }, 404); return true; }
      json(row);
      return true;
    }

    // POST /api/content/:tab_id — create entity
    if (path.match(/^\/api\/content\/[a-z0-9-]+$/) && req.method === 'POST') {
      const session = auth.getSession(req);
      if (!auth.hasRole(session, 'builder')) { json({ error: 'Forbidden' }, 403); return true; }
      const tabId = path.split('/')[3];
      if (!registry.getTab(tabId)) { json({ error: 'Unknown tab: ' + tabId }, 404); return true; }
      const body = await readBody(req);
      if (!body.name) { json({ error: 'name required' }, 400); return true; }
      const result = await db.queryOne(
        `INSERT INTO builder_entities (tab_id, name, data, created_by) VALUES ($1, $2, $3, $4)
         ON CONFLICT (tab_id, name, created_by) DO UPDATE SET data = $3, updated_at = NOW()
         RETURNING id, tab_id, name`,
        [tabId, body.name, JSON.stringify(body.data || {}), session.name]
      );
      // Hot-reload into engine
      try { const cl = require('../engine/content-loader'); cl.reloadEntity(tabId, result.id); } catch {}
      json(result, 201);
      return true;
    }

    // PUT /api/content/:tab_id/:id — update entity
    if (path.match(/^\/api\/content\/[a-z0-9-]+\/\d+$/) && req.method === 'PUT') {
      const session = auth.getSession(req);
      if (!auth.hasRole(session, 'builder')) { json({ error: 'Forbidden' }, 403); return true; }
      const tabId = path.split('/')[3];
      const entityId = parseInt(path.split('/')[4]);
      const body = await readBody(req);
      const existing = await db.queryOne('SELECT id FROM builder_entities WHERE id = $1 AND created_by = $2', [entityId, session.name]);
      if (!existing) { json({ error: 'Not found' }, 404); return true; }
      const sets = ['updated_at = NOW()'];
      const params = [];
      let i = 1;
      if (body.name !== undefined) { sets.push(`name = $${i++}`); params.push(body.name); }
      if (body.data !== undefined) { sets.push(`data = $${i++}`); params.push(JSON.stringify(body.data)); }
      params.push(entityId);
      await db.query(`UPDATE builder_entities SET ${sets.join(', ')} WHERE id = $${i}`, params);
      // Hot-reload into engine
      try { const cl = require('../engine/content-loader'); cl.reloadEntity(tabId, entityId); } catch {}
      json({ ok: true, id: entityId });
      return true;
    }

    // DELETE /api/content/:tab_id/:id — delete entity
    if (path.match(/^\/api\/content\/[a-z0-9-]+\/\d+$/) && req.method === 'DELETE') {
      const session = auth.getSession(req);
      if (!auth.hasRole(session, 'builder')) { json({ error: 'Forbidden' }, 403); return true; }
      const entityId = parseInt(path.split('/')[4]);
      const result = await db.query('DELETE FROM builder_entities WHERE id = $1 AND created_by = $2', [entityId, session.name]);
      if (result.rowCount === 0) { json({ error: 'Not found' }, 404); return true; }
      json({ ok: true });
      return true;
    }

    // POST /api/content/:tab_id/:id/duplicate — clone entity
    if (path.match(/^\/api\/content\/[a-z0-9-]+\/\d+\/duplicate$/) && req.method === 'POST') {
      const session = auth.getSession(req);
      if (!auth.hasRole(session, 'builder')) { json({ error: 'Forbidden' }, 403); return true; }
      const entityId = parseInt(path.split('/')[4]);
      const original = await db.queryOne('SELECT * FROM builder_entities WHERE id = $1 AND created_by = $2', [entityId, session.name]);
      if (!original) { json({ error: 'Not found' }, 404); return true; }
      const result = await db.queryOne(
        'INSERT INTO builder_entities (tab_id, name, data, created_by) VALUES ($1, $2, $3, $4) RETURNING id, tab_id, name',
        [original.tab_id, original.name + ' (copy)', JSON.stringify(original.data), session.name]
      );
      json(result, 201);
      return true;
    }

    // ══════════════════════════════════════════════════════════════════════
    // INSTANCE LIFECYCLE API
    // ══════════════════════════════════════════════════════════════════════

    const instances = require('../engine/instances');

    // POST /api/instances — start a new instance
    if (path === '/api/instances' && req.method === 'POST') {
      const session = auth.getSession(req);
      if (!auth.hasRole(session, 'builder')) { json({ error: 'Forbidden' }, 403); return true; }
      const body = await readBody(req);
      if (!body.type) { json({ error: 'type required' }, 400); return true; }
      const config = registry.getPlayable(body.type);
      if (!config) { json({ error: 'Unknown playable type: ' + body.type + '. Available: ' + Object.keys(registry.PLAYABLE).join(', ') }, 404); return true; }

      const playerName = body.player_name || 'rl_' + Date.now();
      const p = registry.createRlPlayer(body.type, playerName);

      // Store player reference for later lookup
      if (!global._rlPlayers) global._rlPlayers = new Map();
      global._rlPlayers.set(playerName, p);

      const messages = [];
      const sendFn = (msg) => messages.push(msg);
      const opts = body.options || {};
      if (body.challenge && config.challenges[body.challenge]) {
        Object.assign(opts, config.challenges[body.challenge]);
        opts.challenge = body.challenge;
      }

      const inst = config.startFn(p, sendFn, opts);
      if (!inst) { json({ error: 'Failed to start instance' }, 500); return true; }

      inst._rlPlayerName = playerName;
      inst._rlPlayer = p;

      json({
        instance_id: inst.id,
        type: body.type,
        player_name: playerName,
        state: inst.state,
        layer: inst.layer,
        messages,
      }, 201);
      return true;
    }

    // GET /api/instances — list all active instances
    if (path === '/api/instances' && req.method === 'GET') {
      const all = instances.listAll ? instances.listAll() : [];
      json({ instances: all.map(inst => ({
        id: inst.id, type: inst.type, state: inst.state,
        wave: inst.currentWave, total_waves: inst.totalWaves,
        ticks_elapsed: inst.tickCount, player: inst._rlPlayerName || null,
      }))});
      return true;
    }

    // GET /api/instances/:id — full instance state
    if (path.match(/^\/api\/instances\/\d+$/) && req.method === 'GET') {
      const instId = parseInt(path.split('/')[3]);
      const inst = instances.get(instId);
      if (!inst) { json({ error: 'Instance not found' }, 404); return true; }
      const p = inst._rlPlayer;
      if (!p) { json({ error: 'No player associated with instance' }, 400); return true; }
      json(registry.buildObservation(p, inst));
      return true;
    }

    // POST /api/instances/:id/pause
    if (path.match(/^\/api\/instances\/\d+\/pause$/) && req.method === 'POST') {
      const session = auth.getSession(req);
      if (!auth.hasRole(session, 'builder')) { json({ error: 'Forbidden' }, 403); return true; }
      const inst = instances.get(parseInt(path.split('/')[3]));
      if (!inst) { json({ error: 'Not found' }, 404); return true; }
      inst.state = 'paused';
      json({ ok: true, state: 'paused' });
      return true;
    }

    // POST /api/instances/:id/resume
    if (path.match(/^\/api\/instances\/\d+\/resume$/) && req.method === 'POST') {
      const session = auth.getSession(req);
      if (!auth.hasRole(session, 'builder')) { json({ error: 'Forbidden' }, 403); return true; }
      const inst = instances.get(parseInt(path.split('/')[3]));
      if (!inst) { json({ error: 'Not found' }, 404); return true; }
      inst.state = 'active';
      json({ ok: true, state: 'active' });
      return true;
    }

    // DELETE /api/instances/:id
    if (path.match(/^\/api\/instances\/\d+$/) && req.method === 'DELETE') {
      const session = auth.getSession(req);
      if (!auth.hasRole(session, 'builder')) { json({ error: 'Forbidden' }, 403); return true; }
      const instId = parseInt(path.split('/')[3]);
      const inst = instances.get(instId);
      if (!inst) { json({ error: 'Not found' }, 404); return true; }
      if (inst._rlPlayer && inst.playerSnapshot) {
        inst._rlPlayer.x = inst.playerSnapshot.x;
        inst._rlPlayer.y = inst.playerSnapshot.y;
        inst._rlPlayer.layer = inst.playerSnapshot.layer;
      }
      instances.destroy(instId);
      registry.cleanupInstance(instId);
      json({ ok: true });
      return true;
    }

    // ══════════════════════════════════════════════════════════════════════
    // RL API — Generic reset/step/observe for any playable content
    // ══════════════════════════════════════════════════════════════════════

    const tick = require('../engine/tick');
    const npcsModule = require('../world/npcs');

    // POST /api/rl/reset — fresh instance + observation + action space
    if (path === '/api/rl/reset' && req.method === 'POST') {
      const session = auth.getSession(req);
      if (!auth.hasRole(session, 'builder')) { json({ error: 'Forbidden' }, 403); return true; }
      const body = await readBody(req);
      if (!body.type) { json({ error: 'type required' }, 400); return true; }
      const config = registry.getPlayable(body.type);
      if (!config) { json({ error: 'Unknown type: ' + body.type }, 404); return true; }

      const playerName = body.player_name || 'rl_' + Date.now();

      // Destroy existing instance for this player
      if (!global._rlPlayers) global._rlPlayers = new Map();
      const existingPlayer = global._rlPlayers.get(playerName);
      if (existingPlayer) {
        const existingInst = instances.getByPlayer(existingPlayer.id);
        if (existingInst) { instances.destroy(existingInst.id); registry.cleanupInstance(existingInst.id); }
      }

      // Create fresh player and instance
      const p = registry.createRlPlayer(body.type, playerName);
      global._rlPlayers.set(playerName, p);

      const messages = [];
      const sendFn = (msg) => {
        messages.push(msg);
        // Also emit to event system
      };
      const opts = body.options || {};
      if (body.challenge && config.challenges[body.challenge]) {
        Object.assign(opts, config.challenges[body.challenge]);
        opts.challenge = body.challenge;
      }

      // Register RL tick handlers and set active player
      registry._ensureRlTicks();
      registry.setActiveRlPlayer(p);

      const inst = config.startFn(p, sendFn, opts);
      inst._rlPlayerName = playerName;
      inst._rlPlayer = p;
      inst.rlControlled = true;

      const observation = registry.buildObservation(p, inst);
      const actionSpace = config.actionSpace.map(a => ({ id: a.id, name: a.name, desc: a.desc }));

      json({
        instance_id: inst.id,
        observation,
        action_space: actionSpace,
        reward: 0,
        done: false,
        info: { type: body.type, challenge: body.challenge || 'full', messages },
      });
      return true;
    }

    // POST /api/rl/step — execute action, advance ticks, return state
    if (path === '/api/rl/step' && req.method === 'POST') {
      const session = auth.getSession(req);
      if (!auth.hasRole(session, 'builder')) { json({ error: 'Forbidden' }, 403); return true; }
      const body = await readBody(req);
      if (!body.instance_id) { json({ error: 'instance_id required' }, 400); return true; }

      const inst = instances.get(body.instance_id);
      if (!inst) { json({ error: 'Instance not found' }, 404); return true; }
      const p = inst._rlPlayer;
      if (!p) { json({ error: 'No player' }, 400); return true; }

      const config = registry.getPlayable(inst.type);
      if (!config) { json({ error: 'Unknown type' }, 500); return true; }

      // Ensure this player is the active RL player for tick processing
      registry.setActiveRlPlayer(p);

      // Snapshot previous state for reward computation
      const prevObs = registry.buildObservation(p, inst);

      // Execute action
      const actionId = body.action || 0;
      registry.executeAction(p, inst.type, actionId, inst);

      // Auto-target if no target
      if (!p.combatTarget || !npcsModule.getNpc(p.combatTarget) || npcsModule.getNpc(p.combatTarget).dead) {
        const alive = npcsModule.getNpcsInInstance(inst.id)
          .sort((a, b) => Math.max(Math.abs(a.x - p.x), Math.abs(a.y - p.y)) - Math.max(Math.abs(b.x - p.x), Math.abs(b.y - p.y)));
        if (alive[0]) { p.combatTarget = alive[0].id; p.busy = true; }
      }
      if (p.combatTarget && npcsModule.getNpc(p.combatTarget) && !npcsModule.getNpc(p.combatTarget).dead) {
        p.busy = true;
      }

      // Advance ticks
      const ticks = body.ticks || 1;
      const messages = [];
      for (let i = 0; i < ticks; i++) {
        tick.processTick();
        if (p.hp <= 0) break;
      }

      // Build new observation
      const done = inst.state === 'complete' || inst.state === 'failed' || p.hp <= 0;
      const nextObs = registry.buildObservation(p, inst);
      nextObs.state = done ? (inst.state === 'complete' ? 'complete' : 'failed') : 'active';

      // Compute reward
      const prevState = { ...prevObs, complete: false, dead: false };
      const nextState = { ...nextObs, complete: inst.state === 'complete', dead: p.hp <= 0 };
      const reward = config.computeReward(prevState, nextState);

      json({
        observation: nextObs,
        reward,
        done,
        truncated: false,
        info: { ticks_advanced: ticks, action: actionId, messages: messages.length },
      });
      return true;
    }

    // GET /api/rl/observe/:id — current observation without stepping
    if (path.match(/^\/api\/rl\/observe\/\d+$/) && req.method === 'GET') {
      const instId = parseInt(path.split('/')[4]);
      const inst = instances.get(instId);
      if (!inst) { json({ error: 'Instance not found' }, 404); return true; }
      const p = inst._rlPlayer;
      if (!p) { json({ error: 'No player' }, 400); return true; }
      json(registry.buildObservation(p, inst));
      return true;
    }

    // ══════════════════════════════════════════════════════════════════════
    // EVENT SYSTEM — SSE stream + polling
    // ══════════════════════════════════════════════════════════════════════

    // GET /api/events/:instance_id/stream — SSE
    if (path.match(/^\/api\/events\/\d+\/stream$/) && req.method === 'GET') {
      const instId = parseInt(path.split('/')[3]);
      const inst = instances.get(instId);
      if (!inst) { json({ error: 'Instance not found' }, 404); return true; }

      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      });
      res.write(`event: connected\ndata: {"instance_id":${instId},"type":"${inst.type}"}\n\n`);

      registry.subscribeSSE(instId, res);
      return true;
    }

    // GET /api/events/:instance_id/poll — buffered events
    if (path.match(/^\/api\/events\/\d+\/poll$/) && req.method === 'GET') {
      const instId = parseInt(path.split('/')[3]);
      json({ events: registry.drainEvents(instId) });
      return true;
    }

    // ══════════════════════════════════════════════════════════════════════
    // API DOCUMENTATION — self-describing
    // ══════════════════════════════════════════════════════════════════════

    if (path === '/api/docs' && req.method === 'GET') {
      json({
        version: '1.0.0',
        name: 'Scape Game API',
        description: 'The game is the API. 75 builder tabs as content resources. RL training. Instance control. Event streaming.',
        auth: { type: 'cookie', login: 'POST /api/auth/login', roles: ['player', 'builder', 'admin'] },
        endpoints: [
          // Content
          { method: 'GET', path: '/api/content', auth: 'none', desc: 'List all 75 builder tabs with entity counts' },
          { method: 'GET', path: '/api/content/:tab_id', auth: 'none', desc: 'All entities for a tab (items, monsters, quests, etc)' },
          { method: 'GET', path: '/api/content/:tab_id/:id', auth: 'none', desc: 'Single entity by ID' },
          { method: 'POST', path: '/api/content/:tab_id', auth: 'builder', desc: 'Create entity', body: '{name, data}' },
          { method: 'PUT', path: '/api/content/:tab_id/:id', auth: 'builder', desc: 'Update entity', body: '{name?, data?}' },
          { method: 'DELETE', path: '/api/content/:tab_id/:id', auth: 'builder', desc: 'Delete entity' },
          { method: 'POST', path: '/api/content/:tab_id/:id/duplicate', auth: 'builder', desc: 'Clone entity' },
          // Instances
          { method: 'POST', path: '/api/instances', auth: 'builder', desc: 'Start boss/content instance', body: '{type, player_name?, challenge?, options?}' },
          { method: 'GET', path: '/api/instances', auth: 'none', desc: 'List all active instances' },
          { method: 'GET', path: '/api/instances/:id', auth: 'none', desc: 'Full instance state (mobs, entities, projectiles, player)' },
          { method: 'POST', path: '/api/instances/:id/pause', auth: 'builder', desc: 'Pause instance' },
          { method: 'POST', path: '/api/instances/:id/resume', auth: 'builder', desc: 'Resume instance' },
          { method: 'DELETE', path: '/api/instances/:id', auth: 'builder', desc: 'Destroy instance' },
          // RL
          { method: 'POST', path: '/api/rl/reset', auth: 'builder', desc: 'Fresh RL instance + observation + action space', body: '{type, challenge?, player_name?}' },
          { method: 'POST', path: '/api/rl/step', auth: 'builder', desc: 'Execute action, advance ticks, return observation + reward', body: '{instance_id, action, ticks?}' },
          { method: 'GET', path: '/api/rl/observe/:id', auth: 'none', desc: 'Current observation without stepping' },
          // Events
          { method: 'GET', path: '/api/events/:instance_id/stream', auth: 'none', desc: 'SSE event stream for instance' },
          { method: 'GET', path: '/api/events/:instance_id/poll', auth: 'none', desc: 'Buffered events since last poll' },
          // Builder (legacy)
          { method: 'GET', path: '/api/builder/entities?tab_id=X', auth: 'builder', desc: 'List user entities for a tab' },
          { method: 'POST', path: '/api/builder/entities', auth: 'builder', desc: 'Create builder entity' },
          { method: 'PUT', path: '/api/builder/entities/:id', auth: 'builder', desc: 'Update builder entity' },
          { method: 'DELETE', path: '/api/builder/entities/:id', auth: 'builder', desc: 'Delete builder entity' },
          { method: 'GET', path: '/api/builder/doc/:filename', auth: 'builder', desc: 'Serve markdown doc' },
          { method: 'POST', path: '/api/builder/persona-test', auth: 'builder', desc: 'Test NPC persona with Ollama' },
          // Game
          { method: 'POST', path: '/cmd', auth: 'none', desc: 'Execute game command', body: '{player, command}' },
          { method: 'GET', path: '/status/:player', auth: 'none', desc: 'Player status' },
          { method: 'GET', path: '/events/:player', auth: 'none', desc: 'Drain player event queue' },
          { method: 'GET', path: '/world', auth: 'none', desc: 'World state (tick, players, NPCs)' },
          // Auth
          { method: 'POST', path: '/api/auth/login', auth: 'none', desc: 'Login', body: '{name, password}' },
          { method: 'POST', path: '/api/auth/logout', auth: 'none', desc: 'Logout' },
          { method: 'GET', path: '/api/auth/me', auth: 'none', desc: 'Current session' },
          // Meta
          { method: 'GET', path: '/api/health', auth: 'none', desc: 'Server health check' },
          { method: 'GET', path: '/api/docs', auth: 'none', desc: 'This documentation' },
        ],
        playable_content: Object.keys(registry.PLAYABLE),
        tab_count: registry.getAllTabIds().length,
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
