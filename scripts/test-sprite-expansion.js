#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// test-sprite-expansion.js  (burn v2)
//
// Coverage for scripts/expand-sprite-manifest.js. Validates that the expanded
// data/sprite-manifest.json actually contains the expected wave-1 content and
// that the dead-entry pruning worked.
//
// Usage:
//   node scripts/test-sprite-expansion.js
//
// Exits 0 on success, 1 on any assertion failure.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MANIFEST = path.join(ROOT, 'data', 'sprite-manifest.json');
const PALETTES = path.join(ROOT, 'data', 'sprite-palettes.json');

let passed = 0;
let failed = 0;
const failures = [];

function assert(cond, desc, detail) {
  if (cond) {
    passed++;
    process.stdout.write('  ok  ' + desc + '\n');
  } else {
    failed++;
    failures.push({ desc, detail });
    process.stdout.write('  FAIL ' + desc + (detail ? ' — ' + detail : '') + '\n');
  }
}

function assertEq(actual, expected, desc) {
  assert(actual === expected, desc, `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

function assertGte(actual, expected, desc) {
  assert(actual >= expected, desc, `expected >= ${expected}, got ${actual}`);
}

function main() {
  console.log('── test-sprite-expansion ──────────────────────────────');

  assert(fs.existsSync(MANIFEST), 'manifest file exists');
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));

  assert(fs.existsSync(PALETTES), 'palettes file exists');
  const palettes = JSON.parse(fs.readFileSync(PALETTES, 'utf8'));

  const sprites = manifest.sprites;
  assert(Array.isArray(sprites), 'manifest.sprites is an array');

  // ── Size sanity ──────────────────────────────────────────────────────────
  assertGte(sprites.length, 2400, 'manifest has >= 2400 entries after expansion');
  assert(!!manifest._expanded_at, 'manifest has _expanded_at timestamp');
  assertEq(manifest._expansion_version, '1.1.0-burn-v2', 'expansion version stamp is set');

  // ── Monsters (110) ───────────────────────────────────────────────────────
  const monsterSprites = sprites.filter(s => s.category === 'monster' && s.entity && String(s.entity.defId).startsWith('mega_'));
  assertGte(monsterSprites.length, 110, 'at least 110 mega monster sprites');

  const monstersByRegion = {};
  for (const s of monsterSprites) {
    monstersByRegion[s.region] = (monstersByRegion[s.region] || 0) + 1;
  }
  assertGte(monstersByRegion.heartlands || 0,   10, 'Heartlands gets >= 10 mega monsters');
  assertGte(monstersByRegion.moryskah || 0,     15, 'Moryskah gets >= 15 mega monsters');
  assertGte(monstersByRegion.boneyard || 0,     12, 'Boneyard gets >= 12 mega monsters');
  assertGte(monstersByRegion.veilwood || 0,     12, 'Veilwood gets >= 12 mega monsters');
  assertGte(monstersByRegion.sootworks || 0,    12, 'Sootworks gets >= 12 mega monsters');
  assertGte(monstersByRegion.saltbrine || 0,    12, 'Saltbrine gets >= 12 mega monsters');
  assertGte(monstersByRegion.inkweald || 0,     12, 'Inkweald gets >= 12 mega monsters');
  assertGte(monstersByRegion.glass_desert || 0, 10, 'Glass Desert gets >= 10 mega monsters');
  assertGte(monstersByRegion.wilds || 0,        15, 'Wilds gets >= 15 mega monsters');

  // Every mega-monster sprite has a walk + attack + death frame.
  const allFrames = monsterSprites.every(s =>
    Array.isArray(s.frames) && s.frames.includes('walk') && s.frames.includes('attack') && s.frames.includes('death'));
  assert(allFrames, 'every mega monster sprite has walk/attack/death frames');

  // ── Minigames (40) ───────────────────────────────────────────────────────
  const minigameIcons  = sprites.filter(s => s.id.startsWith('ui/minigame_') && s.id.endsWith('_icon'));
  const minigameArenas = sprites.filter(s => s.minigame_ref && s.category === 'landmark');
  assertGte(minigameIcons.length,  40, '40 minigame UI icon sprites');
  assertGte(minigameArenas.length, 40, '40 minigame arena landmark sprites');

  // Specific minigames — sanity the wilds + glass-desert ones ended up in
  // their region arenas.
  const shardWars = sprites.find(s => s.id === 'wilds/arena_wilds_shard_wars');
  assert(!!shardWars, 'wilds shard wars arena sprite present');
  assertEq(shardWars && shardWars.region, 'wilds', 'shard wars arena is in wilds region');

  const shardforge = sprites.find(s => s.id === 'glass_desert/arena_glass_desert_shardforge');
  assert(!!shardforge, 'glass desert shardforge arena sprite present');

  // ── Combinations (61) ────────────────────────────────────────────────────
  const combos = sprites.filter(s => s.combination_ref && s.category === 'item');
  assertGte(combos.length, 61, 'at least 61 combination result sprites');
  const combo95001 = sprites.find(s => s.combination_ref && s.combination_ref.defId === 95001);
  assert(!!combo95001, 'first mega combo (95001 Bog-Witch Tempered Scimitar) has sprite');
  assertEq(combo95001 && combo95001.region, 'moryskah', 'Bog-Witch combo sprite is in moryskah');

  // ── Wilds FX (16) ────────────────────────────────────────────────────────
  const wildsFx = sprites.filter(s => s.category === 'fx' && s.region === 'wilds');
  assertGte(wildsFx.length, 16, '16 Wilds PvP FX sprites');

  const mustHaveFx = [
    'fx/fx_wilds_teleblock',
    'fx/fx_wilds_vengeance',
    'fx/fx_wilds_glory_recharge',
    'fx/fx_wilds_skull_timer',
    'fx/fx_wilds_smite',
    'fx/fx_wilds_protect_item',
    'fx/fx_wilds_logout_tab',
    'fx/fx_wilds_clan_wars_portal',
    'fx/fx_wilds_ferox_enclave',
    'fx/fx_wilds_deep_wild_drop_bonus',
  ];
  for (const fx of mustHaveFx) {
    assert(!!sprites.find(s => s.id === fx), `wilds PvP FX present: ${fx}`);
  }

  // ── Tile variants ────────────────────────────────────────────────────────
  const wildsVariants = sprites.filter(s => s.region === 'wilds' && s.variant_of);
  const glassVariants = sprites.filter(s => s.region === 'glass_desert' && s.variant_of);
  assertGte(wildsVariants.length, 27, 'wilds tile variants >= 27 (9 bases x 3)');
  assertGte(glassVariants.length, 27, 'glass desert tile variants >= 27 (9 bases x 3)');

  // Each variant references an existing base sprite id.
  const spriteById = new Map(sprites.map(s => [s.id, s]));
  for (const v of [...wildsVariants, ...glassVariants]) {
    assert(spriteById.has(v.variant_of), `tile variant base exists: ${v.variant_of}`);
  }

  // ── Palette variants ─────────────────────────────────────────────────────
  assert(!!palettes.wilds.tile_variants, 'wilds palette carries tile_variants map');
  assert(!!palettes.glass_desert.tile_variants, 'glass_desert palette carries tile_variants map');
  assertGte(Object.keys(palettes.wilds.tile_variants).length, 9, 'wilds has >= 9 tile-variant entries');
  assertGte(Object.keys(palettes.glass_desert.tile_variants).length, 9, 'glass_desert has >= 9 tile-variant entries');

  // ── Dead-entry pruning ───────────────────────────────────────────────────
  const bibleOnly = sprites.filter(s => s.bible_only === true);
  assertGte(bibleOnly.length, 37, 'at least 37 bible-only NPCs are marked bible_only');
  for (const s of bibleOnly) {
    assert(!s.entity, `bible_only sprite has no entity binding: ${s.id}`);
  }

  // ── Category re-counting ─────────────────────────────────────────────────
  assert(typeof manifest.categories === 'object', 'manifest.categories recomputed');
  assertGte(manifest.categories.monster.count, 376, 'monsters category count >= 376 (266 + 110)');

  // ── Validator must show 0 missing AND fewer-than-37 dead ─────────────────
  const sr = require(path.join(ROOT, 'src', 'world', 'sprite-registry'));
  sr._reload();
  const report = sr.validateAllEntities();
  assertEq(report.stats.missing, 0, 'validator: 0 missing sprites');
  assert(report.stats.dead < 37, `validator: dead entries (${report.stats.dead}) < 37`);

  // ── Final tally ──────────────────────────────────────────────────────────
  console.log('');
  console.log(`──  ${passed} passed,  ${failed} failed  ──`);
  if (failed > 0) {
    console.log('');
    for (const f of failures) console.log('  FAIL', f.desc, f.detail ? `(${f.detail})` : '');
    process.exit(1);
  }
  process.exit(0);
}

main();
