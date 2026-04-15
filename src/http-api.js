// ── HTTP API for ScapeAPI ──────────────────────────────────────────────────────
// Lets external tools (Claude Code, curl, etc.) send commands and get responses
// without maintaining a WebSocket connection.
//
// POST /cmd { "player": "name", "command": "look" }
// GET /events/:player — get queued events since last poll
// GET /status/:player — get player status
//
// Builder endpoints (admin-only):
//   GET    /api/builder/schema/:type
//   GET    /api/builder/types
//   GET    /api/builder/entities/:type
//   GET    /api/builder/entities/:type/:id
//   POST   /api/builder/entities/:type
//   PUT    /api/builder/entities/:type/:id
//   DELETE /api/builder/entities/:type/:id
//   POST   /api/builder/publish
//   GET    /api/builder/stats
//   POST   /api/builder/validate/:type

const staging = require('./builder/staging');
let tilemapEditor = null;
try { tilemapEditor = require('./builder/tilemap-editor'); } catch {}
let _auth = null;
try { _auth = require('./auth'); } catch {}

const pendingResponses = new Map(); // requestId → { resolve, timeout }
const eventQueues = new Map(); // playerName → [messages]
const MAX_QUEUE = 100;

// ── NPC dialogue queue (for OpenClaw AI bridge) ────────────────────────────────
let _npcQueueSeq = 0;
const _npcQueue = [];           // [{ id, npcName, prompt, addedAt }]
const _npcCallbacks = new Map(); // id → sendFn

function addNpcPrompt(npcName, prompt, sendFn) {
  const id = ++_npcQueueSeq;
  _npcQueue.push({ id, npcName, prompt, addedAt: Date.now() });
  _npcCallbacks.set(id, sendFn);
  return id;
}

function queueEvent(playerName, text) {
  const lower = playerName.toLowerCase();
  if (!eventQueues.has(lower)) eventQueues.set(lower, []);
  const queue = eventQueues.get(lower);
  queue.push({ text, tick: Date.now() });
  if (queue.length > MAX_QUEUE) queue.shift();
}

function drainEvents(playerName) {
  const lower = playerName.toLowerCase();
  const queue = eventQueues.get(lower) || [];
  eventQueues.set(lower, []);
  return queue;
}

function setupHttpApi(server, { players, playersByName, commands, sendText, createPlayer, combatLevel, getLevel, totalLevel, tick, tiles, npcs, invFreeSlots }) {

  // Intercept HTTP requests before the default handler
  const originalListeners = server.listeners('request').slice();
  server.removeAllListeners('request');

  server.on('request', (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

    // ── Builder endpoints (admin-only) ────────────────────────────────────────
    // Only intercept path-based entity routes (/entities/:type[/:id]), where
    // :type is a word string. Pure numeric ids like /entities/1234 are the
    // legacy DB API and fall through to its handler.
    if (req.url.startsWith('/api/builder/schema/') ||
        req.url === '/api/builder/types' ||
        req.url === '/api/builder/publish' ||
        req.url === '/api/builder/stats' ||
        req.url === '/api/builder/preview' ||
        req.url === '/api/builder/rollback' ||
        req.url === '/api/builder/audit' ||
        req.url === '/api/builder/tilemap/regions' ||
        req.url.startsWith('/api/builder/tilemap/') ||
        req.url.startsWith('/api/builder/validate/') ||
        /^\/api\/builder\/entities\/[a-z_][a-z0-9_]*(\/|$|\?)/i.test(req.url)) {
      handleBuilderRequest(req, res);
      return;
    }

    // POST /cmd — send a command
    if (req.method === 'POST' && req.url === '/cmd') {
      let body = '';
      req.on('data', c => body += c);
      req.on('end', () => {
        try {
          const { player: playerName, command } = JSON.parse(body);
          if (!playerName || !command) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Need player and command fields' }));
            return;
          }

          // Find or create HTTP session player
          let p = playersByName.get(playerName.toLowerCase());
          if (!p) {
            // Auto-login for HTTP API
            p = createPlayer(players.size + 1000, playerName);
            p.admin = true;
            p.httpOnly = true;
            playersByName.set(playerName.toLowerCase(), p);
            queueEvent(playerName, `Logged in as ${playerName} (HTTP API).`);
          }

          const result = commands.execute(p, command);
          if (result) queueEvent(playerName, result);

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true, response: result || '', player: { x: p.x, y: p.y, hp: p.hp, maxHp: p.maxHp } }));
        } catch (e) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: e.message }));
        }
      });
      return;
    }

    // GET /events/:player — drain event queue
    if (req.method === 'GET' && req.url.startsWith('/events/')) {
      const playerName = decodeURIComponent(req.url.slice(8));
      const events = drainEvents(playerName);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ events }));
      return;
    }

    // GET /status/:player — player status
    if (req.method === 'GET' && req.url.startsWith('/status/')) {
      const playerName = decodeURIComponent(req.url.slice(8));
      const p = playersByName.get(playerName.toLowerCase());
      if (!p) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Player not found' }));
        return;
      }
      const area = tiles.getArea(p.x, p.y, p.layer);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        name: p.name, x: p.x, y: p.y, layer: p.layer,
        hp: p.hp, maxHp: p.maxHp,
        combat: combatLevel(p), totalLevel: totalLevel(p),
        area: area?.name || null,
        busy: p.busy, busyAction: p.busyAction,
      }));
      return;
    }

    // GET /npc-queue — return next pending NPC prompt (for OpenClaw AI bridge)
    if (req.method === 'GET' && req.url === '/npc-queue') {
      const item = _npcQueue[0] || null;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      if (item) {
        res.end(JSON.stringify({ pending: true, id: item.id, npcName: item.npcName, prompt: item.prompt }));
      } else {
        res.end(JSON.stringify({ pending: false }));
      }
      return;
    }

    // POST /npc-response — deliver AI response to waiting player
    if (req.method === 'POST' && req.url === '/npc-response') {
      let body = '';
      req.on('data', c => body += c);
      req.on('end', () => {
        try {
          const { id, text } = JSON.parse(body);
          const idx = _npcQueue.findIndex(i => i.id === id);
          if (idx >= 0) {
            const item = _npcQueue.splice(idx, 1)[0];
            const sendFn = _npcCallbacks.get(item.id);
            _npcCallbacks.delete(item.id);
            if (sendFn && text) sendFn(text);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true, npcName: item.npcName }));
          } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'No pending prompt with that id' }));
          }
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: e.message }));
        }
      });
      return;
    }

    // GET /world — world info
    if (req.method === 'GET' && req.url === '/world') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        tick: tick.getTick(),
        players: playersByName.size,
        npcs: npcs.npcs.size,
      }));
      return;
    }

    // Fall through to original handlers (WebSocket upgrade, etc.)
    for (const listener of originalListeners) {
      listener.call(server, req, res);
    }
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// BUILDER API — admin-only, writable, schema-driven entity editor
// ══════════════════════════════════════════════════════════════════════════════

function _readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', c => {
      body += c;
      if (body.length > 5e6) reject(new Error('Body too large'));
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try { resolve(JSON.parse(body)); }
      catch (e) { reject(new Error('Bad JSON: ' + e.message)); }
    });
  });
}

function _json(res, data, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function _requireAdmin(req, res) {
  if (!_auth) return true; // Auth module unavailable — allow (dev)
  const session = _auth.getSession(req);
  // Accept 'owner' as an alias for 'admin' (above admin in the role ladder).
  if (session && (session.role === 'admin' || session.role === 'owner')) return true;
  if (_auth.hasRole(session, 'admin')) return true;
  _json(res, { error: 'Admin role required' }, 403);
  return false;
}

function _sessionName(req) {
  if (!_auth) return 'dev';
  const s = _auth.getSession(req);
  return (s && s.name) || 'unknown';
}

async function handleBuilderRequest(req, res) {
  try {
    const url = req.url.split('?')[0];
    const method = req.method;

    if (!_requireAdmin(req, res)) return;

    // GET /api/builder/types
    if (method === 'GET' && url === '/api/builder/types') {
      return _json(res, { types: staging.listTypes() });
    }

    // GET /api/builder/stats
    if (method === 'GET' && url === '/api/builder/stats') {
      return _json(res, staging.stats());
    }

    // GET /api/builder/schema/:type
    let m = url.match(/^\/api\/builder\/schema\/([^/]+)$/);
    if (method === 'GET' && m) {
      const schema = staging.loadSchema(m[1]);
      if (!schema) return _json(res, { error: `Unknown type: ${m[1]}` }, 404);
      return _json(res, schema);
    }

    // POST /api/builder/validate/:type — test a record against the schema
    m = url.match(/^\/api\/builder\/validate\/([^/]+)$/);
    if (method === 'POST' && m) {
      const body = await _readBody(req);
      const result = staging.validate(m[1], body);
      return _json(res, result, result.ok ? 200 : 400);
    }

    // POST /api/builder/publish
    if (method === 'POST' && url === '/api/builder/publish') {
      const result = staging.publish({ playerId: _sessionName(req) });
      return _json(res, result, result.ok ? 200 : 400);
    }

    // GET /api/builder/preview — diff staged vs published + affected codex pages
    if (method === 'GET' && url === '/api/builder/preview') {
      const result = staging.preview();
      return _json(res, result, 200);
    }

    // POST /api/builder/rollback — revert to most recent snapshot
    if (method === 'POST' && url === '/api/builder/rollback') {
      const result = staging.rollback({ playerId: _sessionName(req) });
      return _json(res, result, result.ok ? 200 : 400);
    }

    // GET /api/builder/audit — read recent audit log entries
    if (method === 'GET' && url === '/api/builder/audit') {
      const entries = staging.readAuditLog(100);
      return _json(res, { entries });
    }

    // ── Tilemap editor routes ─────────────────────────────────────────────
    if (tilemapEditor) {
      // GET /api/builder/tilemap/regions — list all canonical regions
      if (method === 'GET' && url === '/api/builder/tilemap/regions') {
        return _json(res, {
          regions: tilemapEditor.listRegions(),
          staged: tilemapEditor.listStagedRegions(),
          palettes: tilemapEditor.loadPalettes(),
        });
      }

      // GET /api/builder/tilemap/:regionId — merged canonical+staged view
      let tm = url.match(/^\/api\/builder\/tilemap\/([a-z0-9_\-]+)$/i);
      if (method === 'GET' && tm) {
        const data = tilemapEditor.getMerged(tm[1]);
        if (!data) return _json(res, { error: `unknown region: ${tm[1]}` }, 404);
        const palette = tilemapEditor.getPalette(tm[1]);
        return _json(res, { tilemap: data, palette });
      }

      // GET /api/builder/tilemap/:regionId/palette — tile palette only
      tm = url.match(/^\/api\/builder\/tilemap\/([a-z0-9_\-]+)\/palette$/i);
      if (method === 'GET' && tm) {
        const palette = tilemapEditor.getPalette(tm[1]);
        if (!palette) return _json(res, { error: `unknown region: ${tm[1]}` }, 404);
        return _json(res, palette);
      }

      // POST /api/builder/tilemap/:regionId/tile — set single tile
      //   body: { col, row, code }
      tm = url.match(/^\/api\/builder\/tilemap\/([a-z0-9_\-]+)\/tile$/i);
      if (method === 'POST' && tm) {
        const body = await _readBody(req);
        const result = tilemapEditor.setTile(tm[1], body.col | 0, body.row | 0, body.code);
        return _json(res, result, result.ok ? 200 : 400);
      }

      // POST /api/builder/tilemap/:regionId/paint — bulk paint
      //   body: { edits: [{col,row,code}, ...] }
      tm = url.match(/^\/api\/builder\/tilemap\/([a-z0-9_\-]+)\/paint$/i);
      if (method === 'POST' && tm) {
        const body = await _readBody(req);
        const result = tilemapEditor.paintTiles(tm[1], body.edits || []);
        return _json(res, result, result.ok ? 200 : 400);
      }

      // DELETE /api/builder/tilemap/:regionId — discard staged tilemap
      tm = url.match(/^\/api\/builder\/tilemap\/([a-z0-9_\-]+)$/i);
      if (method === 'DELETE' && tm) {
        const result = tilemapEditor.discard(tm[1]);
        return _json(res, result, result.ok ? 200 : 404);
      }
    }

    // GET /api/builder/entities/:type  (list)
    m = url.match(/^\/api\/builder\/entities\/([^/]+)$/);
    if (method === 'GET' && m) {
      const entries = staging.list(m[1]);
      if (entries === null) return _json(res, { error: `Unknown type: ${m[1]}` }, 404);
      return _json(res, { type: m[1], entities: entries });
    }

    // POST /api/builder/entities/:type  (create)
    if (method === 'POST' && m) {
      const body = await _readBody(req);
      const result = staging.create(m[1], body);
      return _json(res, result, result.ok ? 201 : 400);
    }

    // GET /api/builder/entities/:type/:id
    m = url.match(/^\/api\/builder\/entities\/([^/]+)\/([^/]+)$/);
    if (method === 'GET' && m) {
      const ent = staging.get(m[1], m[2]);
      if (!ent) return _json(res, { error: 'not found' }, 404);
      return _json(res, ent);
    }

    // PUT /api/builder/entities/:type/:id
    if (method === 'PUT' && m) {
      const body = await _readBody(req);
      const result = staging.update(m[1], m[2], body);
      return _json(res, result, result.ok ? 200 : 400);
    }

    // DELETE /api/builder/entities/:type/:id
    if (method === 'DELETE' && m) {
      const result = staging.remove(m[1], m[2]);
      return _json(res, result, result.ok ? 200 : 404);
    }

    return _json(res, { error: 'Not found' }, 404);
  } catch (err) {
    return _json(res, { error: err.message || String(err) }, 500);
  }
}

module.exports = { setupHttpApi, queueEvent, drainEvents, addNpcPrompt, handleBuilderRequest };
