// ══════════════════════════════════════════════════════════════════════════════
// Auth — HTTP session auth with RBAC
// Roles: admin > builder > player
// Sessions: HMAC-signed cookies (no extra deps, uses node crypto)
// Storage: data/auth/{name}.json (extends existing game auth files)
// ══════════════════════════════════════════════════════════════════════════════

const crypto = require('crypto');
const bcrypt = require('bcrypt');
const persistence = require('./engine/persistence');

// Server secret — generated on first boot, persisted across restarts
let SECRET = persistence.load('auth/_secret.json')?.secret;
if (!SECRET) {
  SECRET = crypto.randomBytes(32).toString('hex');
  persistence.save('auth/_secret.json', { secret: SECRET, created: Date.now() });
}

const ROLES = ['player', 'builder', 'admin'];
const ROLE_RANK = { player: 0, builder: 1, admin: 2 };
const COOKIE_NAME = 'scape_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

// ── Cookie helpers ──────────────────────────────────────────────────────────

function sign(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

function verify(token) {
  if (!token || !token.includes('.')) return null;
  const [data, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try { return JSON.parse(Buffer.from(data, 'base64url').toString()); }
  catch { return null; }
}

function parseCookies(req) {
  return (req.headers.cookie || '').split(';').reduce((acc, c) => {
    const [k, ...v] = c.trim().split('=');
    if (k) acc[k] = v.join('=');
    return acc;
  }, {});
}

function getSession(req) {
  const token = parseCookies(req)[COOKIE_NAME];
  if (!token) return null;
  const session = verify(token);
  if (!session || !session.name) return null;
  // Check session isn't expired
  if (session.exp && Date.now() > session.exp) return null;
  return session;
}

function setSessionCookie(res, session) {
  const token = sign(session);
  const cookie = `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}`;
  // Append to existing Set-Cookie headers
  const existing = res.getHeader('Set-Cookie') || [];
  const arr = Array.isArray(existing) ? existing : (existing ? [existing] : []);
  arr.push(cookie);
  res.setHeader('Set-Cookie', arr);
}

function clearSessionCookie(res) {
  const cookie = `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
  res.setHeader('Set-Cookie', cookie);
}

// ── Auth data ───────────────────────────────────────────────────────────────

function getAuthData(name) {
  return persistence.load(`auth/${name.toLowerCase()}.json`);
}

function saveAuthData(name, data) {
  persistence.save(`auth/${name.toLowerCase()}.json`, data);
}

function getRole(name) {
  const data = getAuthData(name);
  return data?.role || 'player';
}

function setRole(name, role) {
  if (!ROLES.includes(role)) return false;
  const data = getAuthData(name);
  if (!data) return false;
  data.role = role;
  saveAuthData(name, data);
  return true;
}

function hasRole(session, minRole) {
  if (!session) return false;
  const userRole = session.role || 'player';
  return (ROLE_RANK[userRole] || 0) >= (ROLE_RANK[minRole] || 0);
}

function listUsers() {
  const fs = require('fs');
  const path = require('path');
  const authDir = path.join(persistence.DATA_DIR, 'auth');
  if (!fs.existsSync(authDir)) return [];
  return fs.readdirSync(authDir)
    .filter(f => f.endsWith('.json') && !f.startsWith('_'))
    .map(f => {
      const data = persistence.load(`auth/${f}`);
      if (!data) return null;
      return { name: data.name, role: data.role || 'player', created: data.created };
    })
    .filter(Boolean)
    .sort((a, b) => ROLE_RANK[b.role] - ROLE_RANK[a.role] || a.name.localeCompare(b.name));
}

// ── HTTP API routes ─────────────────────────────────────────────────────────

async function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; if (body.length > 1e5) reject(new Error('Body too large')); });
    req.on('end', () => { try { resolve(JSON.parse(body)); } catch { resolve({}); } });
  });
}

async function handleAuthRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  const json = (data, status = 200) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };

  // POST /api/auth/login
  if (path === '/api/auth/login' && req.method === 'POST') {
    const body = await readBody(req);
    const { name, password } = body;
    if (!name || !password) return json({ error: 'Name and password required' }, 400);

    const data = getAuthData(name);
    if (!data) return json({ error: 'Account not found' }, 401);
    if (!bcrypt.compareSync(password, data.hash)) return json({ error: 'Wrong password' }, 401);

    // Bootstrap: if no admin exists, first login becomes admin
    let role = data.role || 'player';
    if (role === 'player' && !listUsers().some(u => u.role === 'admin')) {
      role = 'admin';
      data.role = 'admin';
      saveAuthData(name, data);
      console.log(`[auth] No admin found — promoted "${data.name}" to admin`);
    }

    const session = { name: data.name, role, exp: Date.now() + COOKIE_MAX_AGE * 1000 };
    setSessionCookie(res, session);
    return json({ ok: true, name: data.name, role });
  }

  // POST /api/auth/logout
  if (path === '/api/auth/logout' && req.method === 'POST') {
    clearSessionCookie(res);
    return json({ ok: true });
  }

  // GET /api/auth/me
  if (path === '/api/auth/me' && req.method === 'GET') {
    const session = getSession(req);
    if (!session) return json({ authenticated: false }, 401);
    return json({ authenticated: true, name: session.name, role: session.role });
  }

  // GET /api/auth/users — admin only
  if (path === '/api/auth/users' && req.method === 'GET') {
    const session = getSession(req);
    if (!hasRole(session, 'admin')) return json({ error: 'Admin required' }, 403);
    return json(listUsers());
  }

  // PUT /api/auth/users/:name/role — admin only
  const roleMatch = path.match(/^\/api\/auth\/users\/([^/]+)\/role$/);
  if (roleMatch && req.method === 'PUT') {
    const session = getSession(req);
    if (!hasRole(session, 'admin')) return json({ error: 'Admin required' }, 403);

    const targetName = decodeURIComponent(roleMatch[1]);
    const body = await readBody(req);
    if (!body.role || !ROLES.includes(body.role)) return json({ error: `Invalid role. Must be: ${ROLES.join(', ')}` }, 400);

    // Can't demote yourself
    if (targetName.toLowerCase() === session.name.toLowerCase() && body.role !== session.role) {
      return json({ error: "Can't change your own role" }, 400);
    }

    if (!setRole(targetName, body.role)) return json({ error: 'User not found' }, 404);
    return json({ ok: true, name: targetName, role: body.role });
  }

  // DELETE /api/auth/users/:name — admin only
  const deleteMatch = path.match(/^\/api\/auth\/users\/([^/]+)$/);
  if (deleteMatch && req.method === 'DELETE') {
    const session = getSession(req);
    if (!hasRole(session, 'admin')) return json({ error: 'Admin required' }, 403);

    const targetName = decodeURIComponent(deleteMatch[1]);
    if (targetName.toLowerCase() === session.name.toLowerCase()) {
      return json({ error: "Can't delete yourself" }, 400);
    }

    const data = getAuthData(targetName);
    if (!data) return json({ error: 'User not found' }, 404);

    const fs = require('fs');
    const filePath = require('path').join(persistence.DATA_DIR, 'auth', `${targetName.toLowerCase()}.json`);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return json({ ok: true });
  }

  return false; // Not handled
}

module.exports = {
  getSession, hasRole, setSessionCookie, clearSessionCookie,
  handleAuthRequest, getRole, setRole, listUsers,
  ROLES, ROLE_RANK,
};
