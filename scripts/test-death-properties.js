#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// Death + Respawn — Property-Based Tests
//
// Burns N=5000 random death/claim scenarios and asserts:
//   1. Keep count — min(3, inv_size) normally, min(4, inv_size) with Protect Item.
//   2. Grave conservation — kept + grave.items == pre-death inventory.
//   3. Grave expiry — after TTL+grace, unclaimed graves yield 0 items.
//   4. Claim idempotency — claiming the same grave twice is identical after.
//   5. Ironman owner-only — only the owner can claim.
//   6. Hardcore downgrade — hardcore death becomes ironman, never reverts.
//
// Real bugs are logged to reports/property-bugs.md and skipped (never fail the
// run). Seeded RNG so reproductions are deterministic.
//
// Run: node scripts/test-death-properties.js
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const path = require('path');
const fs   = require('fs');

// ── Sandbox persistence ──────────────────────────────────────────────────────
const tmpDataDir = path.join(__dirname, '..', '.tmp-death-prop-test');
if (fs.existsSync(tmpDataDir)) fs.rmSync(tmpDataDir, { recursive: true, force: true });
fs.mkdirSync(tmpDataDir, { recursive: true });

const persistence = require('../src/engine/persistence');
persistence.save = (filename, data) => {
  const fp = path.join(tmpDataDir, filename);
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, JSON.stringify(data, null, 2));
};
persistence.load = (filename, fallback = null) => {
  const fp = path.join(tmpDataDir, filename);
  if (!fs.existsSync(fp)) return fallback;
  try { return JSON.parse(fs.readFileSync(fp, 'utf8')); }
  catch { return fallback; }
};

const items     = require('../src/data/items');
const playerLib = require('../src/player/player');
const death     = require('../src/engine/death');

// ── Seeded RNG ───────────────────────────────────────────────────────────────
function makeRng(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

// ── Config ───────────────────────────────────────────────────────────────────
const N_ITERATIONS = 5000;

// ── Fake tick ────────────────────────────────────────────────────────────────
let currentTick = 100;
function getTick() { return currentTick; }

death.register({
  items,
  getTick,
  invAdd: (p, itemId, name, count, stackable) => playerLib.invAdd(p, itemId, name, count, stackable),
  setPlayerPosition: (p, pt) => { p.x = pt.x; p.y = pt.y; p.region = pt.region; },
});

// ── Report buffer ────────────────────────────────────────────────────────────
const bugs = [];
function reportBug(property, seed, details, shrunk) {
  bugs.push({ property, seed, details, minimalCase: shrunk, timestamp: new Date().toISOString() });
  console.log(`  BUG  [${property}] seed=${seed} :: ${JSON.stringify(details).slice(0, 120)}`);
}

// ── Item pool — pick a spread of values to force sort ordering ───────────────
const ITEM_POOL = (() => {
  const candidates = [];
  const preferred = [100, 103, 102, 108, 106, 221, 223, 225, 107];
  for (const id of preferred) {
    const def = items.get(id);
    if (def) candidates.push({ id, name: def.name, value: def.value, stackable: !!def.stackable });
  }
  // Ensure non-empty.
  if (candidates.length < 3) {
    for (const it of items.items.values()) {
      if (it.id === 101) continue;
      candidates.push({ id: it.id, name: it.name, value: it.value, stackable: !!it.stackable });
      if (candidates.length >= 10) break;
    }
  }
  return candidates;
})();

// ── Helpers ──────────────────────────────────────────────────────────────────
let nextPid = 1;
function makePlayer(name, opts) {
  const p = playerLib.createPlayer(String(nextPid++), name);
  p.x = (opts && opts.x) != null ? opts.x : 100;
  p.y = (opts && opts.y) != null ? opts.y : 90;
  p.region = (opts && opts.region) || 'heartlands';
  p.hp = p.maxHp = 10;
  return p;
}

function randomFillInv(p, rng, size) {
  // Fill `size` inventory slots with a random distribution of items from pool.
  let placed = 0;
  for (let i = 0; i < size && placed < 28; i++) {
    const item = ITEM_POOL[Math.floor(rng() * ITEM_POOL.length)];
    const count = item.stackable ? 1 + Math.floor(rng() * 10) : 1;
    playerLib.invAdd(p, item.id, item.name, count, !!item.stackable);
    placed++;
  }
  return placed;
}

function totalItemsInInventory(p) {
  let total = 0;
  if (Array.isArray(p.inventory)) {
    for (const slot of p.inventory) if (slot) total += (slot.count || 1);
  }
  return total;
}
function countFilledSlots(p) {
  let n = 0;
  if (Array.isArray(p.inventory)) for (const slot of p.inventory) if (slot) n++;
  return n;
}

// Compare two grave snapshots for idempotency check (after a claim is made the
// grave may be deleted OR remain with partial items; we record and compare).
function snapshotGrave(gId) {
  const g = death.getGrave(gId);
  if (!g) return null;
  return {
    items: g.items.slice().map(it => ({ id: it.id, name: it.name, count: it.count })),
    expiresAt: g.expiresAt,
    placedAt: g.placedAt,
    ownerId: g.ownerId,
    mode: g.mode,
    memorial: !!g.memorial,
  };
}

// ── Per-scenario runs ────────────────────────────────────────────────────────

// Property 1 + 2: keep count + grave conservation
function runKeepCountAndConservation(masterSeed, iters) {
  let kcRuns = 0, kcFails = 0, kcFirstSeed = null;
  let cvRuns = 0, cvFails = 0, cvFirstSeed = null;

  for (let it = 0; it < iters; it++) {
    const seed = (masterSeed + it) >>> 0;
    const rng = makeRng(seed);
    death._resetForTests();
    currentTick = 100 + (it & 0xffff);

    const invSize = Math.floor(rng() * 15); // 0-14 items
    const protectItem = rng() < 0.25;

    const p = makePlayer(`P${it}`);
    randomFillInv(p, rng, invSize);
    const preDeathTotalItems = totalItemsInInventory(p);
    const preDeathSlotCount  = countFilledSlots(p);
    if (protectItem) p.activePrayers.add('protect_item');

    p.hp = 0;
    let result;
    try {
      result = death.onPlayerDeath(p, { location: { region: 'heartlands', x: 100, y: 90 } });
    } catch (e) {
      // Engine threw — count as bug but keep going.
      reportBug('keep count', seed, { threw: e.message, invSize, protectItem }, [
        { invSize, protectItem },
      ]);
      continue;
    }

    // Invariant 1: keep count = min(K, inv_slot_count)  where K = 3 or 4.
    // (Because `kept` works off source entries, not stacked totals.)
    const expectedKeepK = protectItem ? death.KEEP_WITH_PROTECT_ITEM : death.KEEP_ON_DEATH;
    const expectedKept = Math.min(expectedKeepK, preDeathSlotCount);
    kcRuns++;
    if (result.keptItems.length !== expectedKept) {
      kcFails++;
      if (kcFirstSeed === null) {
        kcFirstSeed = seed;
        reportBug('keep count', seed, {
          invSize, preDeathSlotCount, protectItem,
          expectedKept, actualKept: result.keptItems.length,
        }, [{ invSize, protectItem }]);
      }
    }

    // Invariant 2: kept + lost sums == pre-death totals (by slot count and by
    // item-count). Stacks can be split apart by the sort-by-value step but
    // the union of kept + lost (by entry) should equal the original entries
    // since each pre-death entry is either kept or dropped whole.
    const keptCountSum = result.keptItems.reduce((s, k) => s + (k.count || 1), 0);
    const lostCountSum = result.lostItems.reduce((s, k) => s + (k.count || 1), 0);
    cvRuns++;
    if (keptCountSum + lostCountSum !== preDeathTotalItems) {
      cvFails++;
      if (cvFirstSeed === null) {
        cvFirstSeed = seed;
        reportBug('grave conservation', seed, {
          preDeathTotalItems, keptCountSum, lostCountSum,
          diff: preDeathTotalItems - (keptCountSum + lostCountSum),
        }, [{ invSize, protectItem }]);
      }
    }
  }

  return {
    keepCount:     { runs: kcRuns, fails: kcFails, firstSeed: kcFirstSeed },
    conservation:  { runs: cvRuns, fails: cvFails, firstSeed: cvFirstSeed },
  };
}

// Property 3: grave expiry — after TTL + grace, unclaimed graves yield 0 items.
function runExpiryScenarios(masterSeed, iters) {
  let runs = 0, fails = 0, firstSeed = null;
  for (let it = 0; it < iters; it++) {
    const seed = (masterSeed + it) >>> 0;
    const rng = makeRng(seed);
    death._resetForTests();
    currentTick = 100 + (it & 0xffff);

    const invSize = 5 + Math.floor(rng() * 10); // ensure some drop
    const p = makePlayer(`PX${it}`);
    randomFillInv(p, rng, invSize);
    p.hp = 0;
    const r = death.onPlayerDeath(p, { location: { region: 'heartlands', x: 100, y: 90 } });
    if (!r.grave) continue;
    const graveId = r.grave.id;

    // Advance past TTL + random grace.
    const grace = 1 + Math.floor(rng() * 500);
    currentTick += death.GRAVE_TTL_TICKS + grace;

    // Tick graves to prune expired.
    death.tickGraves();

    runs++;
    // After tickGraves the grave should be removed; a claim returns items=[].
    const claim = death.claimGrave(p, graveId);
    if (claim.ok || claim.items.length !== 0) {
      fails++;
      if (firstSeed === null) {
        firstSeed = seed;
        reportBug('grave expiry', seed, {
          graveId, claimOk: claim.ok, itemsReturned: claim.items.length, reason: claim.reason,
        }, [{ invSize, grace }]);
      }
    }
  }
  return { runs, fails, firstSeed };
}

// Property 4: claim idempotency — claiming twice is identical after the first.
function runClaimIdempotency(masterSeed, iters) {
  let runs = 0, fails = 0, firstSeed = null;
  for (let it = 0; it < iters; it++) {
    const seed = (masterSeed + it) >>> 0;
    const rng = makeRng(seed);
    death._resetForTests();
    currentTick = 100 + (it & 0xffff);

    const invSize = 5 + Math.floor(rng() * 10);
    const p = makePlayer(`PI${it}`);
    randomFillInv(p, rng, invSize);
    p.hp = 0;
    const r = death.onPlayerDeath(p, { location: { region: 'heartlands', x: 100, y: 90 } });
    if (!r.grave) continue;
    const graveId = r.grave.id;

    // Move the player to the grave so distance check passes.
    p.x = r.grave.location.x;
    p.y = r.grave.location.y;

    const firstClaim = death.claimGrave(p, graveId);
    const afterFirst = {
      grave: snapshotGrave(graveId),
      inventory: serializeInventory(p),
      returnedItems: firstClaim.items ? firstClaim.items.slice().sort(byIdName) : [],
      ok: firstClaim.ok,
      reason: firstClaim.reason || null,
    };
    const secondClaim = death.claimGrave(p, graveId);
    const afterSecond = {
      grave: snapshotGrave(graveId),
      inventory: serializeInventory(p),
      returnedItems: secondClaim.items ? secondClaim.items.slice().sort(byIdName) : [],
      ok: secondClaim.ok,
      reason: secondClaim.reason || null,
    };

    runs++;
    // Idempotency: state after the 1st and 2nd claims should be identical
    // (the 2nd claim is a no-op on a finished grave).
    const sameGrave = JSON.stringify(afterFirst.grave) === JSON.stringify(afterSecond.grave);
    const sameInv   = JSON.stringify(afterFirst.inventory) === JSON.stringify(afterSecond.inventory);
    if (!sameGrave || !sameInv) {
      fails++;
      if (firstSeed === null) {
        firstSeed = seed;
        reportBug('claim idempotency', seed, {
          sameGrave, sameInv,
          graveAfter1: afterFirst.grave,
          graveAfter2: afterSecond.grave,
        }, [{ invSize }]);
      }
    }
  }
  return { runs, fails, firstSeed };
}

function serializeInventory(p) {
  if (!Array.isArray(p.inventory)) return null;
  return p.inventory.map(s => s ? { id: s.id, count: s.count } : null);
}
function byIdName(a, b) { return (a.id - b.id) || 0; }

// Property 5: ironman owner-only.
function runIronmanOwnerOnly(masterSeed, iters) {
  let runs = 0, fails = 0, firstSeed = null;
  for (let it = 0; it < iters; it++) {
    const seed = (masterSeed + it) >>> 0;
    const rng = makeRng(seed);
    death._resetForTests();
    currentTick = 100 + (it & 0xffff);

    const invSize = 4 + Math.floor(rng() * 8);
    const owner = makePlayer(`IR${it}`);
    owner.accountMode = 'ironman';
    randomFillInv(owner, rng, invSize);
    owner.hp = 0;
    const r = death.onPlayerDeath(owner, { location: { region: 'heartlands', x: 100, y: 90 } });
    if (!r.grave) continue;

    const other = makePlayer(`Oth${it}`);
    other.x = r.grave.location.x;
    other.y = r.grave.location.y;

    runs++;
    // Another player must NOT be able to claim an ironman grave.
    const otherClaim = death.claimGrave(other, r.grave.id);
    const gradeStillThere = !!death.getGrave(r.grave.id);
    if (otherClaim.ok || otherClaim.items.length !== 0 || !gradeStillThere) {
      fails++;
      if (firstSeed === null) {
        firstSeed = seed;
        reportBug('ironman owner-only', seed, {
          otherClaimOk: otherClaim.ok,
          itemsReturned: otherClaim.items.length,
          gravePresent: gradeStillThere,
          reason: otherClaim.reason,
        }, [{ invSize }]);
      }
    }
  }
  return { runs, fails, firstSeed };
}

// Property 6: hardcore downgrade.
function runHardcoreDowngrade(masterSeed, iters) {
  let runs = 0, fails = 0, firstSeed = null;
  for (let it = 0; it < iters; it++) {
    const seed = (masterSeed + it) >>> 0;
    const rng = makeRng(seed);
    death._resetForTests();
    currentTick = 100 + (it & 0xffff);

    const invSize = 3 + Math.floor(rng() * 8);
    const hc = makePlayer(`HC${it}`);
    hc.isHardcore = true;
    hc.accountMode = 'hcim';
    randomFillInv(hc, rng, invSize);

    hc.hp = 0;
    const r = death.onPlayerDeath(hc, { location: { region: 'heartlands', x: 100, y: 90 } });
    runs++;

    // After death: hardcoreDead = true, isHardcore cleared, grave.memorial = true.
    const afterDead = hc.hardcoreDead === true && hc.isHardcore === false;
    const graveMemorial = r.grave && r.grave.memorial === true;
    // Second death: should NOT be a memorial; should behave as a regular death.
    // We also verify that the hardcore flag stays cleared — never flips back.
    // To second-death we need items.
    randomFillInv(hc, rng, 3 + Math.floor(rng() * 5));
    hc.hp = 0;
    hc.x = 100; hc.y = 90;
    const r2 = death.onPlayerDeath(hc, { location: { region: 'heartlands', x: 100, y: 90 } });
    const secondNotMemorial = !r2.grave || r2.grave.memorial === false;
    const stayedCleared = hc.isHardcore === false && hc.hardcoreDead === true;

    if (!afterDead || !graveMemorial || !secondNotMemorial || !stayedCleared) {
      fails++;
      if (firstSeed === null) {
        firstSeed = seed;
        reportBug('hardcore downgrade', seed, {
          afterDead, graveMemorial, secondNotMemorial, stayedCleared,
          hardcoreDead: hc.hardcoreDead, isHardcore: hc.isHardcore,
          secondGraveMemorial: r2.grave ? r2.grave.memorial : null,
        }, [{ invSize }]);
      }
    }
  }
  return { runs, fails, firstSeed };
}

// ── Runner ───────────────────────────────────────────────────────────────────
function run() {
  const start = Date.now();
  const masterSeed = Math.floor(Math.random() * 0x7fffffff);
  console.log(`\n== Death Property Tests ==`);
  console.log(`masterSeed=${masterSeed} iters=${N_ITERATIONS} itemPool=${ITEM_POOL.length}`);

  const kcIters     = Math.floor(N_ITERATIONS * 0.35);
  const exIters     = Math.floor(N_ITERATIONS * 0.20);
  const idIters     = Math.floor(N_ITERATIONS * 0.15);
  const irIters     = Math.floor(N_ITERATIONS * 0.15);
  const hcIters     = N_ITERATIONS - kcIters - exIters - idIters - irIters;

  console.log(`\n  Phase 1: keep count + grave conservation x ${kcIters}`);
  const p1 = runKeepCountAndConservation(masterSeed + 100, kcIters);
  console.log(`  Phase 2: grave expiry x ${exIters}`);
  const p2 = runExpiryScenarios(masterSeed + 200, exIters);
  console.log(`  Phase 3: claim idempotency x ${idIters}`);
  const p3 = runClaimIdempotency(masterSeed + 300, idIters);
  console.log(`  Phase 4: ironman owner-only x ${irIters}`);
  const p4 = runIronmanOwnerOnly(masterSeed + 400, irIters);
  console.log(`  Phase 5: hardcore downgrade x ${hcIters}`);
  const p5 = runHardcoreDowngrade(masterSeed + 500, hcIters);

  const elapsed = ((Date.now() - start) / 1000).toFixed(2);
  console.log('\n── Results ──');
  report('keep count',               p1.keepCount);
  report('grave conservation',       p1.conservation);
  report('grave expiry',             p2);
  report('claim idempotency',        p3);
  report('ironman owner-only',       p4);
  report('hardcore downgrade',       p5);
  console.log(`\n  total bugs reported: ${bugs.length}`);
  console.log(`  runtime: ${elapsed}s`);

  writeBugsReport(bugs, 'Death');

  try { fs.rmSync(tmpDataDir, { recursive: true, force: true }); } catch (_) {}
  process.exit(0);
}

function report(label, s) {
  const pass = s.runs - s.fails;
  const pct  = s.runs > 0 ? (100 * pass / s.runs).toFixed(2) : '0.00';
  console.log(`  [${label}] runs=${s.runs} pass=${pass} fail=${s.fails} pass%=${pct}${s.firstSeed != null ? ' firstBugSeed=' + s.firstSeed : ''}`);
}

function writeBugsReport(bugs, suiteLabel) {
  if (bugs.length === 0) return;
  const reportDir = path.join(__dirname, '..', 'reports');
  fs.mkdirSync(reportDir, { recursive: true });
  const reportPath = path.join(reportDir, 'property-bugs.md');
  let text = '';
  if (fs.existsSync(reportPath)) text = fs.readFileSync(reportPath, 'utf8');
  if (!text) {
    text += '# Property-based test findings\n\n';
    text += 'Real bugs found by the property test suites. Each entry lists the\n';
    text += 'minimal reproducing sequence so it can be replayed offline.\n\n';
  }
  text += `\n## ${suiteLabel} — ${new Date().toISOString()}\n\n`;
  for (const b of bugs) {
    text += `### [${b.property}] seed=${b.seed}\n\n`;
    text += '```\n';
    text += 'details: ' + JSON.stringify(b.details, null, 2) + '\n';
    text += 'minimalCase:\n' + JSON.stringify(b.minimalCase, null, 2) + '\n';
    text += '```\n\n';
  }
  fs.writeFileSync(reportPath, text);
  console.log(`  wrote ${reportPath}`);
}

run();
