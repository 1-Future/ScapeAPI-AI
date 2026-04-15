#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// Smoke test for the writable Builder (burn v2).
//
// Tests both the staging module (direct calls) and the HTTP endpoints in
// src/http-api.js via a lightweight in-process harness. No external deps.
//
// Run: node scripts/test-builder.js
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

process.env.NODE_ENV = 'test';
process.env.SCAPE_BUILDER_ALLOW_WIPE = '1';

const http = require('http');
const fs = require('fs');
const path = require('path');

const staging = require('../src/builder/staging');
const httpApi = require('../src/http-api');

// ── Tiny assert framework ─────────────────────────────────────────────────────

let passed = 0, failed = 0;
const failures = [];

function assert(cond, label) {
  if (cond) { passed++; console.log(`  PASS  ${label}`); }
  else { failed++; failures.push(label); console.log(`  FAIL  ${label}`); }
}
function assertEq(actual, expected, label) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) { passed++; console.log(`  PASS  ${label}`); }
  else { failed++; failures.push(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`); console.log(`  FAIL  ${label}  got=${JSON.stringify(actual)} want=${JSON.stringify(expected)}`); }
}

function section(name) { console.log(`\n── ${name} ───────────────────────────────────`); }

// ── Wipe any leftover staging ─────────────────────────────────────────────────

staging._wipeForTests();

// ── SCHEMAS ───────────────────────────────────────────────────────────────────

section('Schema loading');
const types = staging.listSchemas();
assert(types.length >= 10, `listSchemas() has 10+ types (got ${types.length})`);
assert(types.includes('training_method'), 'schema: training_method registered');
assert(types.includes('quest'), 'schema: quest registered');
assert(types.includes('item'), 'schema: item registered');
assert(types.includes('monster'), 'schema: monster registered');
assert(types.includes('boss'), 'schema: boss registered');
assert(types.includes('recipe'), 'schema: recipe registered');
assert(types.includes('npc'), 'schema: npc registered');
assert(types.includes('area_gate'), 'schema: area_gate registered');
assert(types.includes('breakpoint'), 'schema: breakpoint registered');
assert(types.includes('minigame'), 'schema: minigame registered');
assert(types.includes('combination'), 'schema: combination registered');

const tmSchema = staging.loadSchema('training_method');
assert(!!tmSchema && Array.isArray(tmSchema.fields), 'training_method has fields[]');
assert(tmSchema.fields.some(f => f.key === 'knobs'), 'training_method schema includes `knobs` field');
const knobs = tmSchema.fields.find(f => f.key === 'knobs');
const knobKeys = (knobs.fields || []).map(f => f.key);
assert(knobKeys.includes('bankingFrequency'), 'knobs field includes bankingFrequency');
assert(knobKeys.includes('danger'), 'knobs field includes danger');
assert(knobKeys.includes('attention'), 'knobs field includes attention');

// ── VALIDATION ────────────────────────────────────────────────────────────────

section('Validation');

const bad = staging.validate('training_method', {});
assert(bad.ok === false, 'empty training_method fails validation');
assert(bad.errors.some(e => e.includes('id')), 'missing id is flagged');
assert(bad.errors.some(e => e.includes('name')), 'missing name is flagged');

const goodTm = {
  id: 'tm_test_attack_rats',
  name: 'Test: Attack Rats',
  skill: 'attack',
  levelRange: [1, 10],
  xpPerHour: 4000,
  description: 'Test method.',
  knobs: {
    resourceOutput: { net: 'neutral', produces: [{ name: 'Rat bone', perHour: 100 }] },
    bankingFrequency: 'rare',
    costPerHour: 0,
    danger: 'none',
    complexity: 'trivial',
    attention: 'afk',
    inputs: []
  }
};
const good = staging.validate('training_method', goodTm);
assert(good.ok === true, `valid training_method passes (errors: ${good.errors.join('; ')})`);

const badEnum = staging.validate('training_method',
  Object.assign({}, goodTm, { knobs: Object.assign({}, goodTm.knobs, { attention: 'zombie' }) }));
assert(badEnum.ok === false && badEnum.errors.some(e => e.includes('attention')),
  'invalid enum value rejected');

const badRange = staging.validate('training_method',
  Object.assign({}, goodTm, { levelRange: [50, 10] }));
assert(badRange.ok === false && badRange.errors.some(e => e.includes('min')),
  'inverted levelRange rejected');

const badTuple = staging.validate('training_method',
  Object.assign({}, goodTm, { levelRange: [1, 'ten'] }));
assert(badTuple.ok === false, 'non-integer in levelRange tuple rejected');

// ── CRUD ──────────────────────────────────────────────────────────────────────

section('CRUD — direct staging module');

let created = staging.create('training_method', goodTm);
assert(created.ok === true, `create training_method succeeds (err: ${JSON.stringify(created.errors)})`);
assert(created.entity.id === goodTm.id, 'created entity preserves supplied id');
assert(created.entity._dirty === true, 'new entity is marked _dirty');
assert(created.entity._published === false, 'new entity is not _published');

const list = staging.list('training_method');
assert(Array.isArray(list) && list.length === 1, 'list() returns 1 entity');
assert(list[0].id === goodTm.id, 'listed id matches');

const fetched = staging.get('training_method', goodTm.id);
assert(!!fetched && fetched.name === goodTm.name, 'get() returns full entity');

const updated = staging.update('training_method', goodTm.id, { name: 'Test: Attack Rats (renamed)' });
assert(updated.ok === true, 'update() succeeds');
assert(updated.entity.name === 'Test: Attack Rats (renamed)', 'update changed name');

const updateReadonly = staging.update('training_method', goodTm.id, { id: 'different_id' });
assert(updateReadonly.ok === false, 'updating readonly_after_create id is rejected');

const dupCreate = staging.create('training_method', goodTm);
assert(dupCreate.ok === false, 'creating duplicate id is rejected');

// Auto-id when id omitted
const autoIdRes = staging.create('item', {
  name: 'Test Auto ID Item',
  examine: 'auto-id test',
});
assert(autoIdRes.ok === true, 'create without id auto-generates one');
assert(typeof autoIdRes.entity.id === 'string' && autoIdRes.entity.id.length > 0, 'auto id is a string');

const removed = staging.remove('training_method', goodTm.id);
assert(removed.ok === true, 'remove() soft-deletes');
assert(fs.existsSync(removed.trashedAt), 'trashed file exists on disk');
assert(staging.get('training_method', goodTm.id) === null, 'entity gone from staging after remove');

const restored = staging.restore('training_method', goodTm.id);
assert(restored.ok === true, 'restore() recovers entity from trash');
assert(!!staging.get('training_method', goodTm.id), 'entity back in staging after restore');

// ── PUBLISH ───────────────────────────────────────────────────────────────────

section('Publish');

const pub = staging.publish();
assert(pub.ok === true, `publish() succeeds (errors: ${JSON.stringify(pub.errors || [])})`);
assert(pub.published >= 1, `publish reports at least 1 published (got ${pub.published})`);
assert(fs.existsSync(staging.OVERRIDES_FILE), '_overrides.json written');

const overrides = staging.readOverrides();
assert(!!overrides && !!overrides.types, 'overrides file is readable JSON');
assert(Array.isArray(overrides.types.training_method), 'overrides.types.training_method is an array');
assert(overrides.types.training_method.some(e => e.id === goodTm.id), 'published entity appears in overrides');

const refetched = staging.get('training_method', goodTm.id);
assert(refetched._published === true, 'published flag set on staged record');
assert(refetched._dirty === false, 'dirty flag cleared after publish');

// Publishing with a broken entity fails gracefully
// Write a bogus entity directly to staging to simulate corruption
const broken = {
  id: 'tm_broken',
  name: 'Broken',
  skill: 'attack',
  // missing levelRange, xpPerHour, knobs — should fail validation at publish
};
const brokenDir = path.join(staging.STAGING_ROOT, 'training_method');
fs.writeFileSync(path.join(brokenDir, 'tm_broken.json'), JSON.stringify(broken, null, 2));
const pubBroken = staging.publish();
assert(pubBroken.ok === false, 'publish fails when staged entity is invalid');
assert(Array.isArray(pubBroken.errors) && pubBroken.errors.some(e => e.id === 'tm_broken'),
  'publish errors list bad entity');

// Clean up broken entry for downstream tests
fs.unlinkSync(path.join(brokenDir, 'tm_broken.json'));

// ── STATS ─────────────────────────────────────────────────────────────────────

section('Stats');
const s = staging.stats();
assert(typeof s === 'object' && typeof s.total === 'number', 'stats() returns summary');
assert(s.types.training_method && typeof s.types.training_method.count === 'number', 'per-type stats present');

// ── HTTP ENDPOINTS ────────────────────────────────────────────────────────────

section('HTTP endpoints (no auth — dev mode)');

// Spin up a tiny HTTP server that routes ONLY through handleBuilderRequest,
// with auth stubbed to "admin" so we can exercise the routes end-to-end.
const origAuth = require('../src/auth');
const realGetSession = origAuth.getSession;
origAuth.getSession = () => ({ name: 'tester', role: 'admin', exp: Date.now() + 1000000 });

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api/builder/')) {
    return httpApi.handleBuilderRequest(req, res);
  }
  res.writeHead(404); res.end();
});

server.listen(0, async () => {
  const port = server.address().port;
  const base = `http://127.0.0.1:${port}`;

  async function req(method, p, body) {
    return new Promise((resolve, reject) => {
      const data = body ? JSON.stringify(body) : null;
      const r = http.request(base + p, {
        method,
        headers: Object.assign(
          { 'Accept': 'application/json' },
          data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {}
        ),
      }, (resp) => {
        let buf = '';
        resp.on('data', c => buf += c);
        resp.on('end', () => {
          let parsed = null;
          try { parsed = JSON.parse(buf); } catch {}
          resolve({ status: resp.statusCode, body: parsed, raw: buf });
        });
      });
      r.on('error', reject);
      if (data) r.write(data);
      r.end();
    });
  }

  // GET /api/builder/types
  const typesResp = await req('GET', '/api/builder/types');
  assert(typesResp.status === 200, 'GET /api/builder/types → 200');
  assert(Array.isArray(typesResp.body.types), 'types response has types[]');
  assert(typesResp.body.types.some(t => t.type === 'quest'), 'types list includes quest');

  // GET /api/builder/schema/:type
  const schemaResp = await req('GET', '/api/builder/schema/training_method');
  assert(schemaResp.status === 200, 'GET /api/builder/schema/training_method → 200');
  assert(schemaResp.body.type === 'training_method', 'schema endpoint returns correct type');

  // GET /api/builder/schema/:type (404)
  const schema404 = await req('GET', '/api/builder/schema/not_a_real_type');
  assert(schema404.status === 404, 'GET unknown schema → 404');

  // POST /api/builder/entities/:type — create
  const createPayload = {
    id: 'q_http_test',
    name: 'HTTP Test Quest',
    description: 'A quest authored via the HTTP test.',
    difficulty: 'Novice',
    questPoints: 1,
    steps: [{ text: 'Talk to the test NPC.', action: 'talk', target: 'npc_tester', check: 'dialogue_done' }],
  };
  const createResp = await req('POST', '/api/builder/entities/quest', createPayload);
  assert(createResp.status === 201, `POST create → 201 (got ${createResp.status} ${createResp.raw})`);
  assert(createResp.body.ok === true, 'POST create returns ok:true');
  assert(createResp.body.entity.id === 'q_http_test', 'created entity id matches');

  // GET single
  const getResp = await req('GET', '/api/builder/entities/quest/q_http_test');
  assert(getResp.status === 200, 'GET single entity → 200');
  assert(getResp.body.id === 'q_http_test', 'GET returns the entity');

  // GET list
  const listResp = await req('GET', '/api/builder/entities/quest');
  assert(listResp.status === 200, 'GET list → 200');
  assert(Array.isArray(listResp.body.entities), 'list response has entities[]');
  assert(listResp.body.entities.some(e => e.id === 'q_http_test'), 'created entity appears in list');

  // PUT update
  const putResp = await req('PUT', '/api/builder/entities/quest/q_http_test',
    { name: 'HTTP Test Quest (renamed)' });
  assert(putResp.status === 200, 'PUT update → 200');
  assert(putResp.body.entity.name === 'HTTP Test Quest (renamed)', 'PUT returns renamed entity');

  // PUT invalid — rejects
  const putBad = await req('PUT', '/api/builder/entities/quest/q_http_test',
    { difficulty: 'NotAValidDifficulty' });
  assert(putBad.status === 400, 'PUT with bad enum → 400');

  // POST validate
  const valResp = await req('POST', '/api/builder/validate/quest', {
    id: 'q_val_test', name: 'x', description: 'x', difficulty: 'Master', questPoints: 5,
    steps: [{ text: 'ok' }]
  });
  assert(valResp.status === 200 && valResp.body.ok === true, 'POST /validate accepts valid body');

  const valBad = await req('POST', '/api/builder/validate/quest', {});
  assert(valBad.status === 400 && valBad.body.ok === false, 'POST /validate rejects invalid body');

  // GET stats
  const statsResp = await req('GET', '/api/builder/stats');
  assert(statsResp.status === 200, 'GET stats → 200');
  assert(typeof statsResp.body.total === 'number', 'stats response has total');

  // DELETE
  const delResp = await req('DELETE', '/api/builder/entities/quest/q_http_test');
  assert(delResp.status === 200, 'DELETE → 200');

  const delAgain = await req('DELETE', '/api/builder/entities/quest/q_http_test');
  assert(delAgain.status === 404, 'DELETE on already-gone entity → 404');

  // 403 when not admin
  origAuth.getSession = () => ({ name: 'nobody', role: 'player', exp: Date.now() + 1000000 });
  const forbid = await req('GET', '/api/builder/types');
  assert(forbid.status === 403, 'Non-admin gets 403');

  origAuth.getSession = realGetSession;

  // POST /api/builder/publish
  // (Make a tiny valid entity first, then publish)
  origAuth.getSession = () => ({ name: 'tester', role: 'admin', exp: Date.now() + 1000000 });
  await req('POST', '/api/builder/entities/item', {
    id: 'itm_http_pub_test', name: 'HTTP Publish Test Item',
    examine: 'Just a test.', value: 1
  });
  const pubResp = await req('POST', '/api/builder/publish', {});
  assert(pubResp.status === 200 && pubResp.body.ok === true,
    `publish via HTTP → 200 (got ${pubResp.status} ${pubResp.raw})`);

  server.close();

  // ── SUMMARY ─────────────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════════════════════');
  console.log(`Passed: ${passed}   Failed: ${failed}   Total: ${passed + failed}`);
  if (failed > 0) {
    console.log('\nFailures:');
    failures.forEach(f => console.log('  - ' + f));
    process.exit(1);
  } else {
    console.log('All builder tests passed.');
    process.exit(0);
  }
});
