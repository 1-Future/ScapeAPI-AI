// ── HTTP API for ScapeAPI ──────────────────────────────────────────────────────
// Lets external tools (Claude Code, curl, etc.) send commands and get responses
// without maintaining a WebSocket connection.
//
// POST /cmd { "player": "name", "command": "look" }
// GET /events/:player — get queued events since last poll
// GET /status/:player — get player status

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
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

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

module.exports = { setupHttpApi, queueEvent, drainEvents, addNpcPrompt };
