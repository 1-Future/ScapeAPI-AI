#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// Server integration test — burn-v2 wire-in
//
// Spins up the real server on a random port, connects a WebSocket client,
// creates a test player, and exercises every burn-v1 subsystem wired into
// server.js:
//   /ge status           (ge-commands + ge-runner)
//   /ge market <item>
//   /talk <npcId>        (dialogue-commands + ai/dialogue)
//   /bye
//   /graves              (death-commands + death)
//   /sethome
//   /areamode status     (area-locked-commands + area-locked)
//   /areamode next
//   /ironman status      (ironman-commands + ironman)
//
// Also probes:
//   - audio-triggers.registerForwarder is set (module singleton check)
//   - ironman→GE hook rejects a trade attempt after /ironman start ironman
//   - Death subsystem's /sethome + /graves round-trips
//
// Run: node scripts/test-server-integration.js
// Exit 0 on pass, 1 on any failure.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const path = require('path');
const { spawn } = require('child_process');
const net = require('net');
const WebSocket = require('ws');

// ── Reporting ────────────────────────────────────────────────────────────────
const results = [];
let failedCount = 0;
function check(label, cond, detail) {
  results.push({ label, ok: !!cond, detail });
  if (!cond) failedCount++;
  const tag = cond ? 'PASS' : 'FAIL';
  console.log(`[${tag}] ${label}${detail !== undefined ? '  ' + (typeof detail === 'string' ? detail.slice(0, 200) : JSON.stringify(detail).slice(0, 200)) : ''}`);
}

// ── Pick an available port ───────────────────────────────────────────────────
function pickPort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.listen(0, () => {
      const port = srv.address().port;
      srv.close(() => resolve(port));
    });
    srv.on('error', reject);
  });
}

// ── WebSocket helper with line-accumulating recorder ─────────────────────────
function connectWS(port) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://localhost:${port}`);
    const messages = [];
    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        messages.push(msg);
      } catch (_) {
        messages.push({ t: 'raw', text: raw.toString() });
      }
    });
    ws.on('open', () => resolve({ ws, messages }));
    ws.on('error', reject);
  });
}

function sendLine(ws, text) {
  ws.send(text);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Wait for a msg matching `predicate` within `timeoutMs`. Returns the msg or null.
async function waitFor(messages, predicate, timeoutMs = 3000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const hit = messages.find(predicate);
    if (hit) return hit;
    await sleep(50);
  }
  return null;
}

// Collect all 'msg' text lines received since index `from`. Returns joined text.
function textSince(messages, from) {
  return messages.slice(from).filter(m => m.t === 'msg').map(m => m.text).join('\n');
}

// Send a command and wait for a text response matching predicate (or a fixed delay).
async function sendAndWait(ws, messages, text, predicate, timeoutMs = 3000) {
  const before = messages.length;
  sendLine(ws, text);
  if (predicate) {
    const hit = await waitFor(messages, (m, i) => i >= before && m.t === 'msg' && predicate(m.text), timeoutMs);
    if (hit) return hit.text;
  }
  await sleep(500);
  return textSince(messages, before);
}

// ── Boot the real server as a child process ──────────────────────────────────
async function bootServer(port) {
  const serverPath = path.join(__dirname, '..', 'src', 'server.js');
  const env = { ...process.env, PORT: String(port) };
  const child = spawn(process.execPath, [serverPath], { env, stdio: ['ignore', 'pipe', 'pipe'] });
  let stdoutBuf = '';
  let stderrBuf = '';
  child.stdout.on('data', d => { stdoutBuf += d.toString(); });
  child.stderr.on('data', d => { stderrBuf += d.toString(); });

  // Wait for the "[server] ScapeAPI+AI running on" line.
  const readyRegex = /\[server\] ScapeAPI\+AI running on/;
  const burnWireRegex = /\[server\] burn-v2 subsystems wired/;
  const start = Date.now();
  while (Date.now() - start < 45000) {
    if (readyRegex.test(stdoutBuf)) break;
    if (child.exitCode !== null) throw new Error(`Server exited early (code ${child.exitCode}):\n${stdoutBuf}\n${stderrBuf}`);
    await sleep(200);
  }
  if (!readyRegex.test(stdoutBuf)) {
    child.kill('SIGTERM');
    throw new Error(`Server failed to boot within 45s. stdout:\n${stdoutBuf.slice(-2000)}\nstderr:\n${stderrBuf.slice(-2000)}`);
  }
  return { child, getStdout: () => stdoutBuf, getStderr: () => stderrBuf, wireSeen: () => burnWireRegex.test(stdoutBuf) };
}

// ── Main ─────────────────────────────────────────────────────────────────────
(async () => {
  let srv = null;
  let port = null;
  try {
    port = await pickPort();
    console.log(`[test] Booting server on port ${port}…`);
    srv = await bootServer(port);
    check('server booted without early exit', srv.child.exitCode === null);
    check('server wired burn-v2 subsystems', srv.wireSeen(), 'log line "[server] burn-v2 subsystems wired"');

    // Connect client.
    const { ws, messages } = await connectWS(port);
    check('WebSocket connected', ws.readyState === WebSocket.OPEN);

    // Register + login a fresh test player (unique name per run to avoid bcrypt collision).
    const playerName = `IT${Date.now() % 100000}`;
    const password = 'test123';

    await sleep(200); // welcome line
    check('received welcome message', messages.some(m => m.t === 'msg' && /Welcome to Scape/.test(m.text)));

    // Register → login flow — "register" falls through to login on success.
    let before = messages.length;
    sendLine(ws, `register ${playerName} ${password}`);
    await waitFor(messages, m => m.t === 'msg' && /Logged in as/.test(m.text), 5000);
    const loginLine = messages.slice(before).find(m => m.t === 'msg' && /Logged in as/.test(m.text));
    check('login after register', !!loginLine);
    if (!loginLine) throw new Error('Could not log in — abort');

    // ── /ge status ─────────────────────────────────────────────────────────
    // NOTE: the server command layer does not strip leading '/'. Commands are
    // issued bare (e.g. "ge status").
    const geStatus = await sendAndWait(ws, messages, 'ge status', t => /Grand Exchange/.test(t), 3000);
    check('/ge status header', /── Grand Exchange ──/.test(geStatus));
    check('/ge status shows empty slots', /\[1\] empty/.test(geStatus));
    check('/ge status lists 6 slots', /\[6\] empty/.test(geStatus));
    check('/ge status shows command hints', /ge buy\/sell/.test(geStatus));

    // ── /ge market bronze sword ────────────────────────────────────────────
    const geMarket = await sendAndWait(ws, messages, 'ge market bronze sword', t => /Guide:|Unknown item/.test(t), 3000);
    check('/ge market replies', typeof geMarket === 'string' && geMarket.length > 0);
    check('/ge market has Guide line or Unknown', /Guide:|Unknown item|not tradeable/.test(geMarket));

    // ── /ge buy with obviously insufficient funds ──────────────────────────
    const geBuy = await sendAndWait(ws, messages, 'ge buy bronze sword 1 99999999', t => /coins|placed/.test(t) || /Unknown/.test(t), 3000);
    check('/ge buy rejects or handles', typeof geBuy === 'string' && geBuy.length > 0);

    // ── /ironman status (before enabling) ──────────────────────────────────
    const ironStatus = await sendAndWait(ws, messages, 'ironman status', t => /Account mode/.test(t) || /Normal/.test(t), 3000);
    check('/ironman status replies', typeof ironStatus === 'string' && ironStatus.length > 0);
    check('/ironman status says Normal initially', /Normal|no restrictions/i.test(ironStatus));

    // ── /ironman start ironman ─────────────────────────────────────────────
    const ironStart = await sendAndWait(ws, messages, 'ironman start ironman', t => /Ironman|You are now/.test(t) || /reason/.test(t), 3000);
    check('/ironman start responded', typeof ironStart === 'string' && ironStart.length > 0);
    check('/ironman start confirms activation', /Ironman/.test(ironStart));

    // ── /ironman status (after enable) ─────────────────────────────────────
    const ironAfter = await sendAndWait(ws, messages, 'ironman status', t => /Account mode/.test(t) || /Ironman/i.test(t), 3000);
    check('/ironman status after enable mentions Ironman', /Ironman/i.test(ironAfter));

    // ── GE rejects trade after ironman (hook test) ─────────────────────────
    const geAfterIron = await sendAndWait(ws, messages, 'ge buy bronze sword 1 10', t => /ironman|restrict|forbid|Ironmen|placed/i.test(t) || /Unknown/.test(t), 3000);
    check('/ge buy rejected by ironman hook', /ironman|Ironmen|cannot|restricted|disabled|allowed/i.test(geAfterIron));

    // ── /graves ────────────────────────────────────────────────────────────
    const graves = await sendAndWait(ws, messages, 'graves', t => /graves|no active/i.test(t), 3000);
    check('/graves replies', typeof graves === 'string' && graves.length > 0);
    check('/graves says none for fresh player', /no active graves|You have no/i.test(graves));

    // ── /sethome (no args => show current) ─────────────────────────────────
    const home = await sendAndWait(ws, messages, 'sethome', t => /Respawn point|Usage/.test(t), 3000);
    check('/sethome with no args shows current', /Respawn point/.test(home) || /heartlands/i.test(home));

    // ── /sethome heartlands (should succeed — heartlands is always allowed) ─
    const setHome = await sendAndWait(ws, messages, 'sethome heartlands', t => /respawn point is now|Usage|region/.test(t), 3000);
    check('/sethome heartlands accepted', /respawn point is now.*heartlands/i.test(setHome));

    // ── /areamode status (not in area-locked yet) ──────────────────────────
    const area = await sendAndWait(ws, messages, 'areamode status', t => /Area-Locked|not in/i.test(t), 3000);
    check('/areamode status replies', typeof area === 'string' && area.length > 0);
    check('/areamode status says not in mode', /not in Area-Locked/i.test(area));

    // ── /areamode next — should 'not in mode' too ──────────────────────────
    const areaNext = await sendAndWait(ws, messages, 'areamode next', t => /Area-Locked|not in/i.test(t), 3000);
    check('/areamode next replies', typeof areaNext === 'string' && areaNext.length > 0);

    // ── /talk <npcId> — use a known bible id that likely exists ───────────
    // The dialogue-commands.register overrides the inline /talk and looks up
    // NPC bibles by id. Fallback returns a canned greeting.
    const talk = await sendAndWait(ws, messages, 'talk captain_alden', t => t.length > 0, 6000);
    check('/talk <npcId> returns text', typeof talk === 'string' && talk.length > 0);

    // ── /bye ───────────────────────────────────────────────────────────────
    const bye = await sendAndWait(ws, messages, 'bye', t => /nod|not talking|away/i.test(t), 3000);
    check('/bye replies', typeof bye === 'string' && bye.length > 0);

    // ── /ge cancel with bad slot ───────────────────────────────────────────
    const cancelBad = await sendAndWait(ws, messages, 'ge cancel 99', t => /Usage|empty|Unknown/i.test(t), 3000);
    check('/ge cancel with bad slot shows usage', /Usage|1-6/.test(cancelBad));

    // ── /ge collect with bad slot ──────────────────────────────────────────
    const collectBad = await sendAndWait(ws, messages, 'ge collect 99', t => /Usage|empty|Unknown/i.test(t), 3000);
    check('/ge collect with bad slot shows usage', /Usage|1-6/.test(collectBad));

    // ── No crash: fire a rapid-fire burst ──────────────────────────────────
    const burstStart = messages.length;
    sendLine(ws, 'ge status');
    sendLine(ws, 'graves');
    sendLine(ws, 'ironman status');
    sendLine(ws, 'areamode status');
    await sleep(1500);
    const burstText = textSince(messages, burstStart);
    check('burst of 4 commands produced responses', burstText.length > 50);
    check('no "Error:" after burst', !/Error:\s*[A-Za-z]/.test(burstText));

    // ── Server still alive? ────────────────────────────────────────────────
    check('server still running after battery', srv.child.exitCode === null);
    check('no uncaught exceptions on stderr', !/Uncaught|throw|TypeError|ReferenceError/.test(srv.getStderr()));

    // ── Audio-triggers singleton check — the forwarder should be set ──────
    // We validate indirectly: look for "[audio-triggers]" manifest-load warnings
    // that would indicate a failure. Successful load is silent.
    check('no audio-triggers load errors', !/\[audio-triggers\].*load failed/.test(srv.getStdout()));

    // ── /ironman group list (while solo ironman — not a GIM) ──────────────
    const groupList = await sendAndWait(ws, messages, 'ironman group list', t => /Group|not in a Group|empty/i.test(t), 3000);
    check('/ironman group list replies for solo ironman', /not in a Group Ironman|Group/i.test(groupList));

    // ── Cleanup: disconnect ws ─────────────────────────────────────────────
    ws.close();
    await sleep(300);

  } catch (e) {
    console.error('[test] Fatal:', e.stack || e.message);
    failedCount++;
  } finally {
    if (srv && srv.child && srv.child.exitCode === null) {
      srv.child.kill('SIGTERM');
      await sleep(500);
      if (srv.child.exitCode === null) srv.child.kill('SIGKILL');
    }
  }

  // ── Final summary ───────────────────────────────────────────────────────
  console.log('');
  console.log(`[test] ${results.length} checks, ${results.length - failedCount} passed, ${failedCount} failed`);
  if (failedCount > 0) {
    console.log('');
    console.log('[test] Failures:');
    for (const r of results) if (!r.ok) console.log(`  - ${r.label}`);
    process.exit(1);
  }
  console.log('[test] All assertions passed.');
  process.exit(0);
})();
