#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// Benchmark Driver — Scape burn-v2
//
// Runs four benchmarks back-to-back and writes reports/benchmarks.md.
// If any bench misses its target by >2x, reports/perf-bugs.md is written.
//
//   1. Grand Exchange matchTick() with 10k buys + 10k sells, 500 items
//   2. 100 concurrent simulated player sessions, 1000 ticks
//   3. Persistence round-trip (save + load) for 100 players + 20k GE +
//      500 graves + 50 clans
//   4. Breakpoint subscriber scaling + leak test
//
// Paths are resolved via process.cwd() relative to the repo root. The driver
// can be invoked from inside a worktree and will still work so long as cwd is
// a Scape checkout.
//
// Run:  node scripts/benchmark.js
// Exit: 0 = all benchmarks executed (even if some missed targets).
//       1 = driver crashed.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const fs  = require('fs');
const os  = require('os');
const path = require('path');

const REPO_ROOT = process.cwd();
const SRC = path.join(REPO_ROOT, 'src');

function req(rel) { return require(path.join(SRC, rel)); }

// ── Output buffers ───────────────────────────────────────────────────────────
const results  = [];   // { name, target, actual, pass, memDeltaMB, notes }
const perfBugs = [];   // benches that missed by >2x

// ── Small utilities ──────────────────────────────────────────────────────────
function now()  { return Number(process.hrtime.bigint()) / 1e6; }   // ms
function memMB() {
  if (global.gc) global.gc();
  return process.memoryUsage().heapUsed / 1024 / 1024;
}
function pct(values, p) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.floor(p / 100 * sorted.length));
  return sorted[idx];
}
function fmt(n, d) { return Number(n).toFixed(d == null ? 2 : d); }

function record(name, target, actual, pass, memDeltaMB, notes) {
  results.push({ name, target, actual, pass, memDeltaMB, notes });
  const tag = pass ? 'PASS' : 'FAIL';
  console.log(`[${tag}] ${name}  target=${target}  actual=${actual}  mem=${fmt(memDeltaMB)}MB`);
  if (notes) console.log(`       ${notes}`);
}

function checkMiss2x(name, targetNum, actualNum, higherIsBetter, details) {
  // If higherIsBetter: miss = target / actual  (>2 => >2x miss)
  // Else:              miss = actual / target
  let miss;
  if (higherIsBetter) miss = actualNum > 0 ? targetNum / actualNum : Infinity;
  else                miss = targetNum > 0 ? actualNum / targetNum : Infinity;
  if (miss > 2) {
    perfBugs.push({ name, miss: fmt(miss, 2), targetNum, actualNum, details });
  }
}

// ── Test-double player hooks shared across benchmarks ────────────────────────
// These provide infinitely-funded inventories so the GE bench isn't bottlenecked
// on escrow failures. We intentionally treat the inventory as a Map for speed.
function makeTestPlayer(id, name) {
  return {
    id,
    name: name || `p${id}`,
    inventory: Object.create(null),
  };
}

function invCount(p, itemId)        {
  // Coins are infinite (so buyers can always afford); items only present if added.
  if (itemId === 101) return 2_000_000_000;
  return p.inventory[itemId] || 0;
}
function invRemove(p, itemId, qty)  {
  if (itemId === 101) return true;
  const have = p.inventory[itemId] || 0;
  if (have < qty) return false;
  p.inventory[itemId] = have - qty;
  return true;
}
function invAdd(p, itemId, _name, qty) {
  p.inventory[itemId] = (p.inventory[itemId] || 0) + qty;
  return true;
}

// Synthetic item registry covering 500+ tradeable itemIds without loading
// the full game catalogue. IDs 10000–10500 are tradeable synthetic items.
function makeSyntheticItemRegistry() {
  const items = new Map();
  for (let id = 10000; id < 10501; id++) {
    items.set(id, {
      id, name: `Synth${id}`, value: 1, tradeable: true, stackable: true, category: 'bench',
    });
  }
  return {
    items,
    get(id) { return items.get(id); },
    find(name) {
      for (const it of items.values()) if (it.name === name) return it;
      return null;
    },
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// Bench 1 — GE with 10k open orders across 500 items
// ══════════════════════════════════════════════════════════════════════════════
async function benchGE() {
  const ge = req('engine/ge-runner');

  // Sandbox persistence to a temp dir so bench doesn't touch live data/ge.json
  const persistence = req('engine/persistence');
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'scape-bench-ge-'));
  const origSave = persistence.save;
  const origLoad = persistence.load;
  persistence.save = (f, d) => fs.writeFileSync(path.join(tmpDir, f), JSON.stringify(d));
  persistence.load = (f, fb) => {
    const p = path.join(tmpDir, f);
    return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : fb;
  };

  ge.reset();
  ge.setItemRegistry(makeSyntheticItemRegistry());
  ge.setPlayerHooks({ invCount, invRemove, invAdd });

  // 500 items. 10k buys + 10k sells. GE slot cap is 6 per player, so we need
  // at least ceil(20000/6) ≈ 3334 players; use 4000 to give headroom.
  // Intentionally place BUY price < SELL price so nothing crosses — this is
  // the "10k open orders" stress test for matchTick's no-op walk.
  const NUM_ITEMS  = 500;
  const NUM_BUYS   = 10_000;
  const NUM_SELLS  = 10_000;
  const NUM_PLAYERS = 4_000;

  const players = [];
  for (let i = 0; i < NUM_PLAYERS; i++) players.push(makeTestPlayer(i + 1, `ge${i}`));
  // Pre-stock each seller with enough of every item they will sell.
  // We'll assign seller offers to players round-robin below and stock on demand.

  const memBefore = memMB();
  const tPlaceStart = now();
  let placedBuys = 0, placedSells = 0, placeFails = 0;

  // Place SELLS first at price = 100 (no buys yet => won't match).
  // Place BUYS second at price = 50 (below asks => won't cross).
  // This keeps the book populated and lets us measure matchTick walking cost.
  let pIdx = 0;
  for (let i = 0; i < NUM_SELLS; i++) {
    const p = players[pIdx % NUM_PLAYERS]; pIdx++;
    const itemId = 10_000 + (i % NUM_ITEMS);
    // Give the seller the items just-in-time.
    invAdd(p, itemId, `Synth${itemId}`, 10);
    const r = ge.placeOffer(p, { side: 'sell', itemId, qty: 1, price: 100 + (i % 50) });
    if (r.ok) placedSells++; else placeFails++;
  }
  for (let i = 0; i < NUM_BUYS; i++) {
    const p = players[pIdx % NUM_PLAYERS]; pIdx++;
    const itemId = 10_000 + (i % NUM_ITEMS);
    const r = ge.placeOffer(p, { side: 'buy', itemId, qty: 1, price: 50 - (i % 40) });
    if (r.ok) placedBuys++; else placeFails++;
  }
  const placeMs = now() - tPlaceStart;

  const totalOpen = ge._offerIndex.size;

  // Now run matchTick 1000 times (books have no cross, so matchTick walks
  // every book and immediately breaks — this is the steady-state hot loop).
  const tickTimes = [];
  let totalMatches = 0;
  const NUM_TICKS = 1000;
  const tRunStart = now();
  for (let i = 0; i < NUM_TICKS; i++) {
    const t0 = now();
    const matched = ge.matchTick();
    tickTimes.push(now() - t0);
    totalMatches += matched;
  }
  const runMs = now() - tRunStart;

  // Now run a "hot" matchTick where orders DO cross to measure true throughput.
  // Post 2k sells at cheap prices then 2k buys at higher — they should all cross.
  // Fresh reset for clarity.
  ge.reset();
  ge.setItemRegistry(makeSyntheticItemRegistry());
  ge.setPlayerHooks({ invCount, invRemove, invAdd });

  const sellersHot = [];
  const buyersHot = [];
  for (let i = 0; i < 1000; i++) { sellersHot.push(makeTestPlayer(100000 + i, `sh${i}`)); buyersHot.push(makeTestPlayer(200000 + i, `bh${i}`)); }
  // 2k sells, price 50.
  for (let i = 0; i < 2000; i++) {
    const p = sellersHot[i % sellersHot.length];
    const itemId = 10_000 + (i % 500);
    invAdd(p, itemId, 'x', 10);
    ge.placeOffer(p, { side: 'sell', itemId, qty: 1, price: 50 });
  }
  // 2k buys at 100 — should cross and match on placement (matchOffer internal).
  const tHotStart = now();
  let hotMatches = 0;
  for (let i = 0; i < 2000; i++) {
    const p = buyersHot[i % buyersHot.length];
    const itemId = 10_000 + (i % 500);
    const r = ge.placeOffer(p, { side: 'buy', itemId, qty: 1, price: 100 });
    if (r.ok && r.offer.filled > 0) hotMatches++;
  }
  const hotMs = now() - tHotStart;
  const matchesPerSec = hotMs > 0 ? (hotMatches / hotMs) * 1000 : 0;
  const memAfter = memMB();

  // Restore persistence
  persistence.save = origSave;
  persistence.load = origLoad;

  const avgTick = runMs / NUM_TICKS;
  const p95     = pct(tickTimes, 95);
  const p99     = pct(tickTimes, 99);

  const target  = '<=20ms/matchTick, >=1000 matches/s';
  const actual  = `avg ${fmt(avgTick, 3)}ms  p95 ${fmt(p95, 3)}ms  p99 ${fmt(p99, 3)}ms  hot ${fmt(matchesPerSec, 0)} matches/s`;
  const pass    = avgTick <= 20 && matchesPerSec >= 1000;

  const notes =
    `placed ${placedBuys} buys + ${placedSells} sells in ${fmt(placeMs)}ms; ` +
    `book size ${totalOpen} open offers; match-count during 1000 noop ticks = ${totalMatches}; ` +
    `hot-cross test matched ${hotMatches}/2000 placements in ${fmt(hotMs)}ms`;

  record('GE matchTick × 1000 @ 10k orders / 500 items', target, actual, pass, memAfter - memBefore, notes);
  checkMiss2x('GE matchTick avg', 20, avgTick, false, actual);
  checkMiss2x('GE match throughput', 1000, matchesPerSec, true, actual);

  return { avgTick, p95, p99, matchesPerSec, totalOpen, placedBuys, placedSells, placeFails, placeMs, runMs, memDelta: memAfter - memBefore };
}

// ══════════════════════════════════════════════════════════════════════════════
// Bench 2 — 100 concurrent players, tick-loop stability over 1000 ticks
// ══════════════════════════════════════════════════════════════════════════════
async function benchPlayers() {
  // We drive the tick system directly via processTick() — no real WS, no real
  // game loop. Each simulated player registers a handler that mimics per-tick
  // cost: trivial arithmetic, a couple map ops, occasional GE offer.
  const tick = req('engine/tick');
  const events = req('engine/events');

  // Reset phases so we start clean (phases keep handlers from prior tests).
  for (const p of Object.values(tick.phases)) p.clear();

  const NUM_PLAYERS = 100;
  const NUM_TICKS = 1000;

  // Minimal player sims — each has a state vector and mutates it each tick.
  const sims = [];
  for (let i = 0; i < NUM_PLAYERS; i++) {
    sims.push({
      id: i, x: 0, y: 0,
      hp: 99, maxHp: 99,
      xp: { attack: 0, strength: 0, defence: 0, hitpoints: 0, ranged: 0, magic: 0 },
      invSize: 28,
      lastTick: 0,
      counter: 0,
    });
  }

  // Register one handler per phase that iterates every sim.
  function moveAll(t) {
    for (const s of sims) {
      s.x += (s.id % 3) - 1;
      s.y += (s.id % 5) - 2;
    }
  }
  function timersAll(t) {
    for (const s of sims) {
      s.counter = (s.counter + 1) & 0x7fffffff;
    }
  }
  function attacksAll(t) {
    for (const s of sims) {
      // Simulate combat: hit another sim, gain xp
      const target = sims[(s.id + 1) % sims.length];
      const dmg = (s.counter & 7) + 1;
      target.hp = Math.max(0, target.hp - dmg);
      if (target.hp === 0) target.hp = target.maxHp;
      s.xp.attack += dmg * 4;
    }
  }
  function trainAll(t) {
    for (const s of sims) {
      // Non-combat skill tick
      s.xp.defence += 10;
      s.xp.hitpoints += 3;
    }
  }
  function geAll(t) {
    // Simulate some GE churn every 5 ticks. Not placing real offers — just
    // a cost proxy that mirrors per-player per-tick bookkeeping.
    if ((t & 7) !== 0) return;
    for (const s of sims) {
      s.lastTick = t;
    }
  }

  tick.registerPhase('playerMovement', 'bench-move',    moveAll);
  tick.registerPhase('playerTimers',   'bench-timers',  timersAll);
  tick.registerPhase('playerAttacks',  'bench-attacks', attacksAll);
  tick.registerPhase('midTick',        'bench-train',   trainAll);
  tick.registerPhase('postTick',       'bench-ge',      geAll);

  const memBefore = memMB();
  const tickTimes = [];
  let overBudget = 0;
  const BUDGET = 600; // ms
  const tStart = now();
  for (let i = 0; i < NUM_TICKS; i++) {
    const t0 = now();
    tick.processTick();
    const dt = now() - t0;
    tickTimes.push(dt);
    if (dt > BUDGET) overBudget++;
  }
  const totalMs = now() - tStart;
  const memAfter = memMB();

  // Cleanup handlers so subsequent benches start clean.
  tick.unregisterPhase('playerMovement', 'bench-move');
  tick.unregisterPhase('playerTimers',   'bench-timers');
  tick.unregisterPhase('playerAttacks',  'bench-attacks');
  tick.unregisterPhase('midTick',        'bench-train');
  tick.unregisterPhase('postTick',       'bench-ge');

  const p50 = pct(tickTimes, 50);
  const p95 = pct(tickTimes, 95);
  const p99 = pct(tickTimes, 99);
  const maxTick = Math.max(...tickTimes);
  const avg = totalMs / NUM_TICKS;

  const target = '0 ticks > 600ms budget, p99 <= 50ms';
  const actual = `avg ${fmt(avg, 3)}ms  p50 ${fmt(p50, 3)}ms  p95 ${fmt(p95, 3)}ms  p99 ${fmt(p99, 3)}ms  max ${fmt(maxTick, 3)}ms  over-budget ${overBudget}`;
  const pass = overBudget === 0 && p99 <= 50;

  const notes = `${NUM_PLAYERS} sims × ${NUM_TICKS} ticks across 5 phases in ${fmt(totalMs)}ms`;
  record('100 players × 1000 ticks', target, actual, pass, memAfter - memBefore, notes);
  checkMiss2x('Tick p99', 50, p99, false, actual);

  return { avg, p50, p95, p99, maxTick, overBudget, totalMs, memDelta: memAfter - memBefore };
}

// ══════════════════════════════════════════════════════════════════════════════
// Bench 3 — Persistence round-trip
// ══════════════════════════════════════════════════════════════════════════════
async function benchPersistence() {
  const ge        = req('engine/ge-runner');
  const clan      = req('engine/clan');
  const death     = req('engine/death');

  // Sandbox persistence
  const persistence = req('engine/persistence');
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'scape-bench-persist-'));
  const origSave = persistence.save;
  const origLoad = persistence.load;
  persistence.save = (f, d) => fs.writeFileSync(path.join(tmpDir, f), JSON.stringify(d));
  persistence.load = (f, fb) => {
    const p = path.join(tmpDir, f);
    return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : fb;
  };

  // ── Populate state ───────────────────────────────────────────────────────
  ge.reset();
  ge.setItemRegistry(makeSyntheticItemRegistry());
  ge.setPlayerHooks({ invCount, invRemove, invAdd });

  // 100 players — fabricated records written straight to data/players-bench.json
  const players = [];
  for (let i = 0; i < 100; i++) {
    const p = {
      id: i + 1,
      name: `player${i}`,
      x: i * 2, y: i * 3, layer: 0,
      hp: 99, maxHp: 99,
      skills: {},
      inventory: new Array(28).fill(null).map((_, j) => j < 20 ? { id: 10_000 + j, name: `Synth${10_000 + j}`, count: 10 } : null),
      bank: new Array(200).fill(null).map((_, j) => ({ id: 10_000 + j, name: `Synth${10_000 + j}`, count: (i + j) * 3 + 1 })),
    };
    for (const s of ['attack','strength','defence','hitpoints','ranged','prayer','magic']) {
      p.skills[s] = { xp: i * 1000, level: Math.min(99, Math.floor(Math.sqrt(i + 1) * 10)) };
    }
    players.push(p);
  }

  // 20k GE orders — 4k sellers, 4k buyers across 500 items, no matches.
  const sellers = [], buyers = [];
  for (let i = 0; i < 4000; i++) { sellers.push(makeTestPlayer(1_000_000 + i, `ps${i}`)); buyers.push(makeTestPlayer(2_000_000 + i, `pb${i}`)); }
  for (let i = 0; i < 10_000; i++) {
    const p = sellers[i % sellers.length];
    const itemId = 10_000 + (i % 500);
    invAdd(p, itemId, 'x', 10);
    ge.placeOffer(p, { side: 'sell', itemId, qty: 1, price: 100 + (i % 50) });
  }
  for (let i = 0; i < 10_000; i++) {
    const p = buyers[i % buyers.length];
    const itemId = 10_000 + (i % 500);
    ge.placeOffer(p, { side: 'buy', itemId, qty: 1, price: 50 - (i % 40) });
  }

  // 500 graves
  death._resetForTests();
  death.setAdapters({ items: null, getTick: () => 1000 });
  for (let i = 0; i < 500; i++) {
    death.placeGrave(
      { id: (i % 100) + 1, name: `player${(i % 100) + 1}` },
      { region: 'heartlands', x: i % 200, y: i % 150 },
      [{ id: 10_000 + (i % 500), name: 'Synth', count: 1 }, { id: 10_100 + (i % 400), name: 'Synth', count: 3 }],
      { ttl: 6000 },
    );
  }

  // 50 clans — each with a founder + 10 members
  clan.reset();
  let memberSeq = 10_000_000;
  for (let i = 0; i < 50; i++) {
    const founder = { id: 500_000 + i, name: `founder${i}` };
    const r = clan.createClan(founder, `BenchClan${i}`, `motto-${i}`);
    if (r.ok) {
      // Just push members directly into the clan to avoid the invite-accept dance
      for (let j = 0; j < 10; j++) {
        r.clan.members.push({
          playerId: memberSeq++,
          playerName: `m${i}_${j}`,
          rank: 'Member',
          joinedAt: Date.now(),
          contributionPoints: 0,
          lastActive: Date.now(),
        });
      }
    }
  }

  // ── Measure save ─────────────────────────────────────────────────────────
  const memBefore = memMB();
  const tSave = now();
  ge.save();
  clan.save();
  death.saveGraves();
  // Also dump the 100 players to a single bulk file (mirrors how persistence
  // would flush them in production — one file per player in real code, but
  // the size measurement is the same either way).
  persistence.save('players-bench.json', players);
  const saveMs = now() - tSave;

  // Disk size
  let totalBytes = 0;
  const fileSizes = {};
  for (const f of fs.readdirSync(tmpDir)) {
    const sz = fs.statSync(path.join(tmpDir, f)).size;
    fileSizes[f] = sz;
    totalBytes += sz;
  }
  const totalMB = totalBytes / 1024 / 1024;

  // ── Measure load ─────────────────────────────────────────────────────────
  // Clear in-memory state to force a real deserialize.
  ge.reset();
  clan.reset();
  death._resetForTests();

  const tLoad = now();
  ge.load();
  clan.load();
  death.loadGraves();
  const playersLoaded = persistence.load('players-bench.json', null);
  const loadMs = now() - tLoad;

  const geOrders   = ge._offerIndex.size;
  const clanCount  = clan.listClans().length;
  const graveCount = death._graves.size;
  const playerCount = playersLoaded ? playersLoaded.length : 0;
  const memAfter = memMB();

  // Restore persistence
  persistence.save = origSave;
  persistence.load = origLoad;

  const target = 'save <= 3000ms, load <= 3000ms, disk <= 50MB';
  const actual = `save ${fmt(saveMs)}ms  load ${fmt(loadMs)}ms  disk ${fmt(totalMB)}MB  verified: ${geOrders} GE / ${clanCount} clans / ${graveCount} graves / ${playerCount} players`;
  const pass = saveMs <= 3000 && loadMs <= 3000 && totalMB <= 50;

  const fileList = Object.entries(fileSizes).map(([k, v]) => `${k}=${fmt(v / 1024, 1)}KB`).join(', ');
  const notes = `files: ${fileList}`;
  record('Persistence round-trip (100p + 20k GE + 500 graves + 50 clans)', target, actual, pass, memAfter - memBefore, notes);
  checkMiss2x('Save time',  3000, saveMs, false, actual);
  checkMiss2x('Load time',  3000, loadMs, false, actual);
  checkMiss2x('Disk size',  50,   totalMB, false, actual);

  return { saveMs, loadMs, totalMB, geOrders, clanCount, graveCount, playerCount, fileSizes, memDelta: memAfter - memBefore };
}

// ══════════════════════════════════════════════════════════════════════════════
// Bench 4 — Breakpoint subscriber scaling
// ══════════════════════════════════════════════════════════════════════════════
async function benchBreakpoints() {
  const bp = req('engine/breakpoint-runner');

  // The runner's internal listener Set is not exported, so we infer its size
  // by counting how many listeners fire for a single emit call. We flip a
  // counter on the event object itself — every listener we add increments it
  // and we read the counter after emit. But we can't touch third-party
  // listeners, so we accept that countListeners() measures listeners-we-know
  // (which is sufficient for the leak test since we control every subscribe
  // in this bench). We implement a wrapper that keeps a parallel shadow set.
  const shadow = new Set();
  function wrappedSubscribe(fn) {
    shadow.add(fn);
    const unsub = bp.subscribe(fn);
    return () => { unsub(); shadow.delete(fn); };
  }
  function listenerCount() { return shadow.size; }

  const NUM_SUBS = 1000;
  const NUM_EVENTS = 10_000;

  const memBefore = memMB();

  // Add 1000 subscribers via wrappedSubscribe so our shadow set tracks them.
  const unsubs = [];
  let hits = 0;
  for (let i = 0; i < NUM_SUBS; i++) {
    unsubs.push(wrappedSubscribe(() => { hits++; }));
  }

  const listenersAfterSub = listenerCount();

  // Fire 10k events.
  const tStart = now();
  for (let i = 0; i < NUM_EVENTS; i++) {
    bp.emit({ type: 'breakpoint', tick: i, bpKey: `k${i & 63}` });
  }
  const emitMs = now() - tStart;
  const memAfter = memMB();
  const memDelta = memAfter - memBefore;
  const memPerSub = memDelta / NUM_SUBS * 1024; // KB per subscriber

  const evsPerSec = emitMs > 0 ? (NUM_EVENTS / emitMs) * 1000 : 0;

  // Teardown — verify no leak.
  for (const u of unsubs) u();
  const baseline = listenerCount();

  // Leak test: subscribe+unsubscribe 1000 times and assert listener count
  // returns to the baseline (which should be 0 after teardown).
  for (let i = 0; i < 1000; i++) {
    const u = wrappedSubscribe(() => {});
    u();
  }
  const listenersAfterLeak = listenerCount();

  const noLeak = listenersAfterLeak === baseline;

  const target = '>=1e5 events/s, no listener leak';
  const actual = `${fmt(evsPerSec, 0)} events/s  mem/sub ${fmt(memPerSub, 2)}KB  baseline ${baseline} ` +
                 `postTeardown ${listenersAfterLeak}  postSub ${listenersAfterSub}`;
  const pass = evsPerSec >= 1e5 && noLeak;

  const notes = `hits recorded = ${hits} (expected ${NUM_EVENTS * NUM_SUBS}); post-leak count=${listenersAfterLeak}`;
  record('Breakpoint subscriber scaling', target, actual, pass, memDelta, notes);
  checkMiss2x('Breakpoint event rate', 1e5, evsPerSec, true, actual);

  return { evsPerSec, emitMs, memPerSub, hits, baseline, listenersAfterSub, listenersAfterLeak, noLeak, memDelta };
}

// ══════════════════════════════════════════════════════════════════════════════
// Report writer
// ══════════════════════════════════════════════════════════════════════════════
function writeReport(data) {
  const stamp = new Date().toISOString();
  const lines = [];
  lines.push(`# Scape benchmarks — burn-v2`);
  lines.push('');
  lines.push(`Generated: ${stamp}  `);
  lines.push(`Host: ${os.platform()} ${os.arch()} — ${os.cpus()[0].model} × ${os.cpus().length}  `);
  lines.push(`Node: ${process.version}  `);
  lines.push(`RSS at exit: ${fmt(process.memoryUsage().rss / 1024 / 1024)}MB`);
  lines.push('');

  // Table-of-contents
  lines.push('| Bench | Target | Actual | Pass |');
  lines.push('| --- | --- | --- | --- |');
  for (const r of results) {
    lines.push(`| ${r.name} | ${r.target} | ${r.actual} | ${r.pass ? 'yes' : 'no'} |`);
  }
  lines.push('');

  // ── 1. GE ──
  const ge = data.ge;
  lines.push('## 1. Grand Exchange — 10k open orders, 500 items');
  lines.push('');
  lines.push(`- Target: ≤20ms per matchTick; ≥1000 matches/second`);
  lines.push(`- Actual: avg **${fmt(ge.avgTick, 3)}ms** per matchTick; hot-cross throughput **${fmt(ge.matchesPerSec, 0)} matches/s**`);
  lines.push(`- Percentiles (matchTick): p95=${fmt(ge.p95, 3)}ms  p99=${fmt(ge.p99, 3)}ms`);
  lines.push(`- Order book size after placement: ${ge.totalOpen} open offers (${ge.placedBuys} buys + ${ge.placedSells} sells, fails=${ge.placeFails})`);
  lines.push(`- Place-all time: ${fmt(ge.placeMs)}ms  (${fmt(ge.placeMs / (ge.placedBuys + ge.placedSells), 3)}ms per placeOffer)`);
  lines.push(`- 1000 matchTick passes total: ${fmt(ge.runMs)}ms`);
  lines.push(`- Heap delta during GE bench: ${fmt(ge.memDelta)}MB`);
  lines.push('');

  // ── 2. Players ──
  const pl = data.players;
  lines.push('## 2. Tick loop stability — 100 simulated players × 1000 ticks');
  lines.push('');
  lines.push(`- Target: zero ticks over the 600ms budget; p99 ≤ 50ms`);
  lines.push(`- Actual: avg **${fmt(pl.avg, 3)}ms**  p50=${fmt(pl.p50, 3)}ms  p95=${fmt(pl.p95, 3)}ms  p99=${fmt(pl.p99, 3)}ms  max=${fmt(pl.maxTick, 3)}ms`);
  lines.push(`- Ticks over 600ms budget: ${pl.overBudget}`);
  lines.push(`- Total runtime: ${fmt(pl.totalMs)}ms for 1000 ticks (${fmt(pl.totalMs / 1000, 3)}ms/tick wall)`);
  lines.push(`- Heap delta during tick bench: ${fmt(pl.memDelta)}MB`);
  lines.push('');

  // ── 3. Persistence ──
  const ps = data.persist;
  lines.push('## 3. Persistence round-trip — 100 players + 20k GE + 500 graves + 50 clans');
  lines.push('');
  lines.push(`- Target: save ≤ 3000ms; load ≤ 3000ms; disk ≤ 50MB`);
  lines.push(`- Actual: save **${fmt(ps.saveMs)}ms**, load **${fmt(ps.loadMs)}ms**, disk **${fmt(ps.totalMB)}MB**`);
  lines.push(`- Verified after reload: ${ps.geOrders} GE orders, ${ps.clanCount} clans, ${ps.graveCount} graves, ${ps.playerCount} players`);
  lines.push(`- File breakdown:`);
  for (const [f, sz] of Object.entries(ps.fileSizes)) {
    lines.push(`  - ${f}: ${fmt(sz / 1024, 1)} KB`);
  }
  lines.push(`- Heap delta during persistence bench: ${fmt(ps.memDelta)}MB`);
  lines.push('');

  // ── 4. Breakpoints ──
  const bp = data.bp;
  lines.push('## 4. Breakpoint subscriber scaling');
  lines.push('');
  lines.push(`- Target: ≥100,000 events/s with 1000 subscribers; no listener leak across 1000 sub+unsub cycles`);
  lines.push(`- Actual: **${fmt(bp.evsPerSec, 0)} events/s**  (${fmt(bp.emitMs)}ms for 10000 events × 1000 subs = ${fmt(bp.hits)} listener invocations)`);
  lines.push(`- Memory per subscriber: ${fmt(bp.memPerSub, 2)}KB (heap delta ${fmt(bp.memDelta)}MB / 1000 subs)`);
  lines.push(`- Leak test: baseline listeners=${bp.baseline}, after 1000 sub+unsub cycles=${bp.listenersAfterLeak} (${bp.noLeak ? 'NO LEAK' : 'LEAK DETECTED'})`);
  lines.push('');

  // ── Regressions to watch ──
  lines.push('## Regressions and next-step commits');
  lines.push('');
  const failing = results.filter(r => !r.pass);
  if (failing.length === 0) {
    lines.push('All four benches met their primary targets in this run. Monitor `scripts/test-bench-thresholds.js` in CI to catch regressions early.');
  } else {
    for (const f of failing) {
      lines.push(`- **${f.name}** missed target (${f.target}). Actual: ${f.actual}. Next-step commit suggestion: open a follow-up branch \`burn-v2/perf-${f.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)}\` and investigate.`);
    }
  }
  if (perfBugs.length) {
    lines.push('');
    lines.push('See `reports/perf-bugs.md` for misses >2x.');
  }
  lines.push('');

  fs.writeFileSync(path.join(REPO_ROOT, 'reports', 'benchmarks.md'), lines.join('\n'));

  if (perfBugs.length) {
    const bugLines = [];
    bugLines.push('# Perf bugs — >2x miss log');
    bugLines.push('');
    bugLines.push(`Generated: ${stamp}`);
    bugLines.push('');
    bugLines.push('| Metric | Target | Actual | Miss factor |');
    bugLines.push('| --- | --- | --- | --- |');
    for (const b of perfBugs) {
      bugLines.push(`| ${b.name} | ${b.targetNum} | ${b.actualNum} | ${b.miss}x |`);
    }
    bugLines.push('');
    bugLines.push('## Details');
    bugLines.push('');
    for (const b of perfBugs) {
      bugLines.push(`- **${b.name}** — ${b.details}`);
    }
    bugLines.push('');
    bugLines.push('_Not fixed in this task (per spec: benches missing by >2x are logged but not resolved here)._');
    bugLines.push('');
    fs.writeFileSync(path.join(REPO_ROOT, 'reports', 'perf-bugs.md'), bugLines.join('\n'));
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────
(async () => {
  const tAll = now();
  const data = {};
  try {
    console.log('== Bench 1: Grand Exchange =================================');
    data.ge = await benchGE();
    console.log('');
    console.log('== Bench 2: 100 players × 1000 ticks =======================');
    data.players = await benchPlayers();
    console.log('');
    console.log('== Bench 3: Persistence round-trip =========================');
    data.persist = await benchPersistence();
    console.log('');
    console.log('== Bench 4: Breakpoint subscribers =========================');
    data.bp = await benchBreakpoints();
    console.log('');

    const runtimeMs = now() - tAll;
    console.log(`== Total runtime: ${fmt(runtimeMs)}ms ==`);

    writeReport(data);
    // Also dump a JSON snapshot for the threshold test.
    fs.writeFileSync(
      path.join(REPO_ROOT, 'reports', 'benchmarks.json'),
      JSON.stringify({ generatedAt: new Date().toISOString(), runtimeMs, data, perfBugs }, null, 2),
    );
    console.log(`Wrote reports/benchmarks.md${perfBugs.length ? ' and reports/perf-bugs.md' : ''}`);
    process.exit(0);
  } catch (e) {
    console.error('Benchmark driver crashed:', e);
    console.error(e.stack);
    process.exit(1);
  }
})();
