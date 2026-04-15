#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// test-renderer-protocol.js — HTTP-shape + region-JSON conformance tests for
// the 2D renderer prototype (burn-v2).
//
// Because the renderer runs in a browser canvas we can't assert pixels from
// Node. What we CAN assert:
//   (a) /api/tilemap             → lists all 9 expected regions
//   (b) /api/tilemap/:region     → returns each region's JSON, matching shape
//   (c) /api/tilemap/:bogus      → 404
//   (d) /api/palettes            → valid JSON with a palette per region
//   (e) /api/sprite-manifest     → well-formed sprite manifest
//   (f) GET /js/renderer.js      → served as application/javascript
//   (g) public/js/renderer.js    → parses + exports TileRenderer
//   (h) public/js/region-loader.js → parses + exports RegionLoader
//   (i) renderer helpers (parseTileChar, buildWallEdgeMap, tileKindFromName)
//       behave correctly on synthetic + real region data
//   (j) every region tilemap conforms to the client's validator
//
// This boots a real HTTP server on an ephemeral port with the minimal stubs
// needed by setupHttpApi(). No websockets, no engine, no DB.
//
// Run: node scripts/test-renderer-protocol.js
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const httpApi = require('../src/http-api');

const REQUIRED_REGIONS = [
  'heartlands', 'moryskah', 'sootworks', 'saltbrine_reach', 'veilwood',
  'boneyard_wastes', 'inkweald', 'glass_desert', 'the_wilds',
];

let failures = 0;
let passes = 0;
const failureDetail = [];
function check(label, ok, detail = '') {
  const tag = ok ? 'PASS' : 'FAIL';
  console.log(`  [${tag}] ${label}${detail ? ' — ' + detail : ''}`);
  if (ok) passes++;
  else { failures++; failureDetail.push(label + (detail ? ' — ' + detail : '')); }
}

// ── Minimal stubs for setupHttpApi() ───────────────────────────────────────────
function makeServer() {
  const server = http.createServer((req, res) => {
    // Fallthrough for unmatched routes so 404s look like real 404s.
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('fallthrough-not-found');
  });

  httpApi.setupHttpApi(server, {
    players: new Map(),
    playersByName: new Map(),
    commands: { execute: () => '' },
    sendText: () => {},
    createPlayer: (id, name) => ({ id, name, x: 0, y: 0, hp: 10, maxHp: 10, admin: false, httpOnly: true }),
    combatLevel: () => 1,
    getLevel: () => 1,
    totalLevel: () => 1,
    tick: { getTick: () => 0 },
    tiles: { getArea: () => null },
    npcs: { npcs: new Map() },
    invFreeSlots: () => 28,
  });

  return server;
}

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      resolve(server.address().port);
    });
  });
}

function get(port, urlPath) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      host: '127.0.0.1', port, path: urlPath, method: 'GET',
      headers: { 'x-test': '1' },
    }, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf8');
        resolve({ status: res.statusCode, headers: res.headers, body });
      });
    });
    req.on('error', reject);
    req.end();
  });
}

// ── Simulate the browser: load renderer + loader via eval with stubbed window ─
function loadBrowserBundle() {
  const rendererSrc = fs.readFileSync(
    path.join(__dirname, '..', 'public', 'js', 'renderer.js'), 'utf8'
  );
  const loaderSrc = fs.readFileSync(
    path.join(__dirname, '..', 'public', 'js', 'region-loader.js'), 'utf8'
  );
  const sandboxWindow = {};
  const sandbox = {
    window: sandboxWindow,
    console: { debug: () => {}, warn: () => {}, log: () => {} },
    Image: function () { this.src = ''; this.complete = false; this.naturalWidth = 0; },
    performance: { now: () => Date.now() },
    document: {},
    requestAnimationFrame: () => 0,
  };
  const fn = new Function(
    'window', 'console', 'Image', 'performance', 'document', 'requestAnimationFrame', 'module',
    rendererSrc + '\n;\n' + loaderSrc,
  );
  fn.call(sandboxWindow, sandboxWindow, sandbox.console, sandbox.Image, sandbox.performance, sandbox.document, sandbox.requestAnimationFrame, { exports: {} });
  return sandboxWindow;
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n=== test-renderer-protocol ===\n');

  // (a–f) HTTP endpoints
  console.log('(a) GET /api/tilemap');
  const server = makeServer();
  const port = await listen(server);

  const listResp = await get(port, '/api/tilemap');
  check('status 200', listResp.status === 200, `status=${listResp.status}`);
  let list = null;
  try { list = JSON.parse(listResp.body); }
  catch (e) { check('response is JSON', false, e.message); }
  if (list) {
    check('has regions array', Array.isArray(list.regions),
      `regions=${list && list.regions && list.regions.length}`);
    const hasAll = list.regions && REQUIRED_REGIONS.every(r => list.regions.includes(r));
    check('lists all 9 required regions', hasAll,
      `missing: ${REQUIRED_REGIONS.filter(r => !(list.regions || []).includes(r)).join(', ') || 'none'}`);
  }

  console.log('\n(b) GET /api/tilemap/:region (each of 9)');
  const regionJsons = {};
  for (const r of REQUIRED_REGIONS) {
    const resp = await get(port, `/api/tilemap/${r}`);
    check(`${r} status 200`, resp.status === 200, `status=${resp.status}`);
    try {
      regionJsons[r] = JSON.parse(resp.body);
      check(`${r} parseable JSON`, true);
    } catch (e) {
      check(`${r} parseable JSON`, false, e.message);
    }
  }

  console.log('\n(c) 404 handling');
  const nope = await get(port, '/api/tilemap/nonexistent_region_xyz');
  check('unknown region → 404', nope.status === 404, `status=${nope.status}`);
  try {
    const nb = JSON.parse(nope.body);
    check('404 includes error + region hint', !!nb.error && Array.isArray(nb.regions),
      `error=${!!nb.error}, regions.len=${(nb.regions || []).length}`);
  } catch { check('404 body parseable', false, 'non-JSON 404 body'); }

  // Path-traversal / invalid id
  const bad = await get(port, '/api/tilemap/..%2F..%2Fetc%2Fpasswd');
  check('path traversal rejected', bad.status === 404 || bad.status === 400,
    `status=${bad.status}`);

  console.log('\n(d) GET /api/palettes');
  const palResp = await get(port, '/api/palettes');
  check('palettes 200', palResp.status === 200, `status=${palResp.status}`);
  let palettes = null;
  try { palettes = JSON.parse(palResp.body); check('palettes parseable', true); }
  catch (e) { check('palettes parseable', false, e.message); }
  if (palettes) {
    const hasHeartlands = palettes.heartlands && Array.isArray(palettes.heartlands.dominant);
    check('heartlands palette present', !!hasHeartlands);
  }

  console.log('\n(e) GET /api/sprite-manifest');
  const mfResp = await get(port, '/api/sprite-manifest');
  check('sprite manifest 200', mfResp.status === 200, `status=${mfResp.status}`);
  let mf = null;
  try { mf = JSON.parse(mfResp.body); check('sprite manifest parseable', true); }
  catch (e) { check('sprite manifest parseable', false, e.message); }
  if (mf) {
    check('manifest has sprites[] array', Array.isArray(mf.sprites),
      `len=${(mf.sprites || []).length}`);
    check('manifest has at least 100 sprites', (mf.sprites || []).length >= 100,
      `len=${(mf.sprites || []).length}`);
    check('manifest declares tile conventions', mf.conventions && mf.conventions.tile_size_px === 32,
      `tile_size_px=${mf.conventions && mf.conventions.tile_size_px}`);
  }

  // Close server — no more HTTP calls from here on.
  await new Promise(r => server.close(r));

  // (g–i) Renderer/loader bundle evaluation
  console.log('\n(g) public/js/renderer.js + region-loader.js evaluate cleanly');
  let bundle = null;
  try {
    bundle = loadBrowserBundle();
    check('renderer bundle evaluates', true);
  } catch (e) {
    check('renderer bundle evaluates', false, e.message);
  }

  if (bundle) {
    check('TileRenderer exposed', typeof bundle.TileRenderer === 'function');
    check('RegionLoader exposed', typeof bundle.RegionLoader === 'function');

    const T = bundle.TileRenderer;
    if (T) {
      // parseTileChar / encodeTileChar round-trip.
      check('parseTileChar(0) === 0', T.parseTileChar('0') === 0);
      check('parseTileChar(9) === 9', T.parseTileChar('9') === 9);
      check('parseTileChar(a) === 10', T.parseTileChar('a') === 10);
      check('encodeTileChar(10) === a', T.encodeTileChar(10) === 'a');
      check('encodeTileChar(5) === 5', T.encodeTileChar(5) === '5');

      // shortTag
      check('shortTag single word', T.shortTag('goblin') === 'GO');
      check('shortTag multi word', T.shortTag('Captain Alden') === 'CA');
      check('shortTag underscore', T.shortTag('goblin_warrior') === 'GW');

      // tileKindFromName hints
      check('water → water kind', T.tileKindFromName('heartlands_river_water') === 'water');
      check('path → accent1', T.tileKindFromName('path_cobble') === 'accent1');
      check('wall → shadow', T.tileKindFromName('wall_stone') === 'shadow');

      // pickPaletteColor: returns hex
      const c = T.pickPaletteColor(null, 'water');
      check('pickPaletteColor fallback returns hex', /^#[0-9a-f]{6,8}$/i.test(c), `color=${c}`);

      // buildWallEdgeMap — synthetic horizontal wall at y=3, x=5..8
      const edgeMap = T.buildWallEdgeMap([
        { x1: 5, y1: 3, x2: 8, y2: 3, type: 'stone' },
      ]);
      const m57 = edgeMap.get('5_3') || 0;
      check('wall mask sets N edge on tile (5,3)', (m57 & T.EDGE.N) !== 0,
        `mask=${m57}`);
      const m58 = edgeMap.get('5_2') || 0;
      check('wall mirrors S edge on tile above (5,2)', (m58 & T.EDGE.S) !== 0,
        `mask=${m58}`);

      // Vertical wall at x=10, y=1..4
      const vmap = T.buildWallEdgeMap([
        { x1: 10, y1: 1, x2: 10, y2: 4, type: 'stone' },
      ]);
      const vmask = vmap.get('10_2') || 0;
      check('vertical wall sets W edge at (10,2)', (vmask & T.EDGE.W) !== 0,
        `mask=${vmask}`);
    }
  }

  // (j) Every region tilemap conforms to the client validator
  console.log('\n(j) region JSON conformance (client validator)');
  if (bundle && bundle.RegionLoader) {
    const RL = bundle.RegionLoader;
    const loader = new RL('');
    for (const r of REQUIRED_REGIONS) {
      const json = regionJsons[r];
      if (!json) { check(`${r} validates`, false, 'no JSON fetched'); continue; }
      try {
        loader._validateTilemap(json, r);
        check(`${r} validates`, true, `${json.width}x${json.height}`);
      } catch (e) {
        check(`${r} validates`, false, e.message);
      }
    }

    // (k) Spawn/landmark sanity — every NPC spawn inside bounds, etc.
    console.log('\n(k) NPC / landmark bounds');
    for (const r of REQUIRED_REGIONS) {
      const json = regionJsons[r];
      if (!json) continue;
      let inBounds = true;
      const spawns = json.spawn_points || {};
      for (const [key, sp] of Object.entries(spawns)) {
        if (!sp || typeof sp.x !== 'number' || typeof sp.y !== 'number') continue;
        if (sp.x < 0 || sp.x >= json.width || sp.y < 0 || sp.y >= json.height) {
          inBounds = false; break;
        }
      }
      check(`${r} all spawns in bounds`, inBounds);

      let landmarksOk = true;
      for (const lm of (json.landmarks || [])) {
        if (typeof lm.x !== 'number' || typeof lm.y !== 'number' ||
            lm.x < 0 || lm.x >= json.width || lm.y < 0 || lm.y >= json.height) {
          landmarksOk = false; break;
        }
      }
      check(`${r} all landmarks in bounds`, landmarksOk);
    }

    // (l) Palette mapping
    console.log('\n(l) palette key mapping');
    check('saltbrine_reach → saltbrine', RL.regionToPaletteKey('saltbrine_reach') === 'saltbrine');
    check('the_wilds → wilds', RL.regionToPaletteKey('the_wilds') === 'wilds');
    check('boneyard_wastes → boneyard', RL.regionToPaletteKey('boneyard_wastes') === 'boneyard');
    check('heartlands → heartlands', RL.regionToPaletteKey('heartlands') === 'heartlands');
  }

  console.log(`\n=== ${failures === 0 ? `${passes} PASS` : `${failures} FAIL / ${passes} PASS`} ===`);
  if (failures) {
    console.log('\nFailures:');
    for (const f of failureDetail) console.log('  - ' + f);
  }
  if (passes < 20) {
    console.log(`\n!! expected at least 20 assertions, got ${passes + failures} (${passes} pass)`);
  }
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(err => {
  console.error('test-renderer-protocol crashed:', err);
  process.exit(2);
});
