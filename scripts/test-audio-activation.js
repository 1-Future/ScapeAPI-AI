#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// test-audio-activation.js — burn-v2 smoke test for end-to-end audio wiring.
//
// Covers:
//   - Manifest load + reverse indexes
//   - emitEvent fans out to the forwarder with correct layer + id
//   - Breakpoint → audio routing (minor/major/transformative + level_up stinger)
//   - Region entry → music + ambient + region sting (simulated day/night)
//   - Boss phase transition → vocal sting (when character matches)
//   - audio-wiring subscribing to combat/skill/UI/quest/GE/movement events
//   - Graceful fallback: dispatcher is no-op if manifest is not loaded
//
// Meant to be run standalone without the full server. Uses audio.snapshotEmit
// to capture messages instead of wiring a real WebSocket.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const assert = require('assert');

const audio = require('../src/engine/audio-triggers');
const audioWiring = require('../src/engine/audio-wiring');
const events = require('../src/engine/events');

let passCount = 0;
let failCount = 0;
function check(label, fn) {
  try {
    fn();
    passCount++;
    console.log(`  ok  ${label}`);
  } catch (e) {
    failCount++;
    console.error(`  FAIL ${label} — ${e.message}`);
  }
}

// ── Setup ──────────────────────────────────────────────────────────────────
audioWiring.attach();
const captured = [];
const unsubscribe = audio.snapshotEmit((target, msg) => { captured.push({ target, msg }); });
// Register a no-op forwarder so emitEvent also walks through the forwarder
// code path (catch-empty is fine; the snapshot tap captures the real data).
audio.registerForwarder(() => {});

function resetCapture() { captured.length = 0; }
function byLayer(layer) { return captured.filter(c => c.msg.layer === layer).map(c => c.msg); }
function byId(id) { return captured.filter(c => c.msg.id === id).map(c => c.msg); }
function byTrigger(trig) { return captured.filter(c => c.msg.trigger === trig).map(c => c.msg); }

// ── Manifest fundamentals ──────────────────────────────────────────────────
console.log('\n-- Manifest fundamentals --');
check('manifest loaded', () => assert(audio.isReady(), `not ready: ${audio.getError() || 'unknown'}`));
const manifest = audio.getManifest();
check('manifest has >= 100 music entries', () => assert(manifest.music.length >= 100, `got ${manifest.music.length}`));
check('manifest has >= 30 ambient_loops', () => assert(manifest.ambient_loops.length >= 30, `got ${manifest.ambient_loops.length}`));
check('manifest has >= 300 sfx', () => assert(manifest.sfx.length >= 300, `got ${manifest.sfx.length}`));
check('manifest has >= 50 vocal_stings', () => assert(manifest.vocal_stings.length >= 50, `got ${manifest.vocal_stings.length}`));

const knownEvents = audio.getKnownEvents();
check('known_events has ui_click', () => assert(knownEvents.has('ui_click')));
check('known_events has breakpoint_major', () => assert(knownEvents.has('breakpoint_major')));
check('known_events has boss_phase_transition', () => assert(knownEvents.has('boss_phase_transition')));

const triggerIndex = audio.getTriggerIndex();
check('trigger index: combat_hit_slash_light', () => assert((triggerIndex.get('combat_hit_slash_light') || []).length >= 1));
check('trigger index: ui_click', () => assert((triggerIndex.get('ui_click') || []).length >= 1));
check('trigger index: skill_mining_hit has multiple variants', () =>
  assert((triggerIndex.get('skill_mining_hit') || []).length >= 2, 'expected variants'));

// ── emitEvent basics ──────────────────────────────────────────────────────
console.log('\n-- emitEvent basics --');
resetCapture();
audio.emitEvent(42, 'ui_click', { src: 'test' });
check('ui_click emits at least one message', () => assert(captured.length >= 1, `captured ${captured.length}`));
check('ui_click emit carries correct trigger', () => assert(byTrigger('ui_click').length >= 1));
check('ui_click emit carries layer sfx', () => assert(byLayer('sfx').length >= 1));
check('ui_click message id matches manifest', () => {
  const ids = byTrigger('ui_click').map(m => m.id);
  assert(ids.includes('ui-click'), `got ids ${ids.join(',')}`);
});
check('emit target propagates to forwarder/tap', () => assert.strictEqual(captured[0].target, 42));

// ── Breakpoint → audio ────────────────────────────────────────────────────
console.log('\n-- Breakpoint routing --');
resetCapture();
const runner = require('../src/engine/breakpoint-runner');
runner.subscribe(() => {}); // warm listener set
// Manually invoke the audio-triggers-internal mapping:
check('breakpointToEvent minor', () => assert.strictEqual(audio._breakpointToEvent({ importance: 'minor' }), 'breakpoint_minor'));
check('breakpointToEvent major', () => assert.strictEqual(audio._breakpointToEvent({ importance: 'major' }), 'breakpoint_major'));
check('breakpointToEvent transformative', () =>
  assert.strictEqual(audio._breakpointToEvent({ importance: 'transformative' }), 'breakpoint_transformative'));
check('breakpointToLevelUp transformative', () =>
  assert.strictEqual(audio._breakpointToLevelUp({ importance: 'transformative' }), 'level_up_transformative'));

// ── Region audio (music + ambient + region_enter sting) ───────────────────
console.log('\n-- Region audio --');
resetCapture();
audio.emitRegionAudio(1, 'heartlands', 'day');
const musicHeartlands = byLayer('music');
const ambientHeartlands = byLayer('ambient');
check('region entry emits music layer', () => assert(musicHeartlands.length >= 1, `got ${musicHeartlands.length}`));
check('region entry emits ambient layer', () => assert(ambientHeartlands.length >= 1, `got ${ambientHeartlands.length}`));
check('region entry also emits region_enter_heartlands sfx', () =>
  assert(byTrigger('region_enter_heartlands').length >= 1));

resetCapture();
audio.emitRegionAudio(1, 'moryskah', 'night');
check('moryskah night emits music', () => assert(byLayer('music').length >= 1));
check('moryskah night emits ambient', () => assert(byLayer('ambient').length >= 1));

check('simulateDayNight day window', () => assert.strictEqual(audio.simulateDayNight(6000), 'day'));
check('simulateDayNight night window', () => assert.strictEqual(audio.simulateDayNight(18000), 'night'));
check('simulateDayNight wraps at 24000', () => assert.strictEqual(audio.simulateDayNight(24001), 'day'));

// ── Vocal sting lookup ────────────────────────────────────────────────────
console.log('\n-- Vocal stings --');
resetCapture();
const n = audio.emitVocalForBoss(1, 'lord_malachar', 'boss_phase_transition');
check('emitVocalForBoss returns >=1 for lord_malachar', () => assert(n >= 1, `got ${n}`));
check('vocal sting carries layer vocal', () => assert(byLayer('vocal').length >= 1));
check('vocal sting id matches manifest entry', () => {
  const ids = byLayer('vocal').map(m => m.id);
  assert(ids.some(id => id.startsWith('lord_malachar_')), `got ${ids.join(',')}`);
});

resetCapture();
const nMissing = audio.emitVocalForBoss(1, 'no_such_npc', 'boss_encounter_start');
check('unknown npc emits nothing', () => assert.strictEqual(nMissing, 0));
check('unknown npc capture empty', () => assert.strictEqual(captured.length, 0));

// ── audio-wiring hooks ────────────────────────────────────────────────────
console.log('\n-- audio-wiring event hooks --');
resetCapture();
events.emit('ui_click', { player: { id: 7 } });
check('ui_click event → emits ui-click sfx', () => assert(byId('ui-click').length >= 1));

resetCapture();
events.emit('combat_hit', { player: { id: 7 }, style: 'slash', heavy: true, damage: 14 });
check('combat_hit slash heavy → combat_hit_slash_heavy trigger', () =>
  assert(byTrigger('combat_hit_slash_heavy').length >= 1));

resetCapture();
events.emit('combat_hit', { player: { id: 7 }, style: 'ranged', heavy: false });
check('combat_hit ranged → combat_hit_ranged_arrow trigger', () =>
  assert(byTrigger('combat_hit_ranged_arrow').length >= 1));

resetCapture();
events.emit('combat_hit', { player: { id: 7 }, style: 'magic', heavy: false });
check('combat_hit magic → combat_hit_magic trigger (with ≥1 variant)', () =>
  assert(byTrigger('combat_hit_magic').length >= 1));

resetCapture();
events.emit('combat_miss', { player: { id: 7 } });
check('combat_miss → combat_miss trigger', () =>
  assert(byTrigger('combat_miss').length >= 1));

resetCapture();
events.emit('combat_block', { player: { id: 7 }, shield: true });
check('combat_block shield → combat_block_shield trigger', () =>
  assert(byTrigger('combat_block_shield').length >= 1));

resetCapture();
events.emit('npc_kill', { player: { id: 7 }, npc: { name: 'giant_rat' } });
check('npc_kill → combat_death_monster trigger', () =>
  assert(byTrigger('combat_death_monster').length >= 1));

resetCapture();
events.emit('npc_kill', { player: { id: 7 }, npc: { name: 'lord_malachar', boss: true } });
check('npc_kill boss → combat_death_monster_boss trigger', () =>
  assert(byTrigger('combat_death_monster_boss').length >= 1));

resetCapture();
events.emit('player_death', { player: { id: 7 } });
check('player_death → combat_death_player trigger', () =>
  assert(byTrigger('combat_death_player').length >= 1));

resetCapture();
events.emit('skill_action', { player: { id: 7 }, skill: 'mining' });
check('skill_action mining → skill_mining_hit trigger', () =>
  assert(byTrigger('skill_mining_hit').length >= 1));
check('skill_action mining → xp_drop trigger fires', () =>
  assert(byTrigger('xp_drop').length >= 1));

resetCapture();
events.emit('skill_action', { player: { id: 7 }, skill: 'woodcutting' });
check('skill_action woodcutting → skill_woodcutting_hit', () =>
  assert(byTrigger('skill_woodcutting_hit').length >= 1));

resetCapture();
events.emit('cook_burn', { player: { id: 7 } });
check('cook_burn → skill_cooking_food_burnt', () =>
  assert(byTrigger('skill_cooking_food_burnt').length >= 1));

resetCapture();
events.emit('pray_activate', { player: { id: 7 }, kind: 'piety' });
check('pray_activate piety → prayer_activate_piety', () =>
  assert(byTrigger('prayer_activate_piety').length >= 1));

resetCapture();
events.emit('cast_spell', { player: { id: 7 }, spellKey: 'fire_blast' });
check('cast_spell fire_blast → spell_cast_fire_blast', () =>
  assert(byTrigger('spell_cast_fire_blast').length >= 1));

resetCapture();
events.emit('inventory_pickup', { player: { id: 7 } });
check('inventory_pickup → inventory_pick_up trigger', () =>
  assert(byTrigger('inventory_pick_up').length >= 1));

resetCapture();
events.emit('inventory_equip', { player: { id: 7 } });
check('inventory_equip → inventory_equip trigger', () =>
  assert(byTrigger('inventory_equip').length >= 1));

resetCapture();
events.emit('bank_open', { player: { id: 7 } });
check('bank_open → bank_open trigger', () =>
  assert(byTrigger('bank_open').length >= 1));

resetCapture();
events.emit('shop_buy', { player: { id: 7 } });
check('shop_buy → shop_buy trigger', () =>
  assert(byTrigger('shop_buy').length >= 1));

resetCapture();
events.emit('quest_started', { player: { id: 7 }, quest: 'cooks_assistant' });
check('quest_started → quest_started trigger', () =>
  assert(byTrigger('quest_started').length >= 1));

resetCapture();
events.emit('quest_complete', { player: { id: 7 }, quest: 'cooks_assistant' });
check('quest_complete → quest_complete trigger', () =>
  assert(byTrigger('quest_complete').length >= 1));

resetCapture();
events.emit('ge_offer_placed', { player: { id: 7 }, item: 'logs' });
check('ge_offer_placed → grand_exchange_offer_post', () =>
  assert(byTrigger('grand_exchange_offer_post').length >= 1));

resetCapture();
events.emit('ge_offer_filled', { player: { id: 7 }, item: 'logs' });
check('ge_offer_filled → grand_exchange_offer_filled', () =>
  assert(byTrigger('grand_exchange_offer_filled').length >= 1));

resetCapture();
events.emit('level_up', { player: { id: 7 }, importance: 'transformative', skill: 'prayer', level: 43 });
check('level_up transformative → level_up_transformative trigger', () =>
  assert(byTrigger('level_up_transformative').length >= 1));

resetCapture();
events.emit('rare_drop', { player: { id: 7 }, item: 'dragon_chainbody' });
check('rare_drop → rare_drop trigger', () =>
  assert(byTrigger('rare_drop').length >= 1));

resetCapture();
events.emit('pet_drop', { player: { id: 7 }, pet: 'baby_rat' });
check('pet_drop → pet_drop trigger', () =>
  assert(byTrigger('pet_drop').length >= 1));

// ── Boss phase transition → vocal sting ────────────────────────────────────
resetCapture();
events.emit('boss_phase_transition', { player: { id: 7 }, npcId: 'lord_malachar' });
check('boss_phase_transition emits boss_phase_transition sfx', () =>
  assert(byTrigger('boss_phase_transition').length >= 1));
check('boss_phase_transition with known npc emits vocal layer', () =>
  assert(byLayer('vocal').length >= 1, `captured layers: ${captured.map(c => c.msg.layer).join(',')}`));

// ── Region change via player_move ──────────────────────────────────────────
resetCapture();
events.emit('player_login', { player: { id: 7, region: 'heartlands' }, ws: null });
check('player_login emits login', () => assert(byTrigger('login').length >= 1));
check('player_login with region emits music + ambient', () =>
  assert(byLayer('music').length + byLayer('ambient').length >= 2));

resetCapture();
const movingPlayer = { id: 8, region: 'heartlands', x: 0, y: 0, layer: 0 };
events.emit('player_move', { player: movingPlayer });
check('player_move first entry emits region music+ambient', () =>
  assert(byLayer('music').length + byLayer('ambient').length >= 2));

resetCapture();
events.emit('player_move', { player: movingPlayer });
check('player_move same region does NOT re-emit music', () =>
  assert.strictEqual(byLayer('music').length, 0));
check('player_move still emits footstep sfx', () =>
  assert(byTrigger('movement_footstep').length >= 1));

resetCapture();
movingPlayer.region = 'moryskah';
events.emit('player_move', { player: movingPlayer });
check('player_move region change emits new region music', () =>
  assert(byLayer('music').length >= 1));

// ── Footstep tile mapping ──────────────────────────────────────────────────
check('tileToFootstepTag grass', () => assert.strictEqual(audioWiring.tileToFootstepTag(1), 'grass'));
check('tileToFootstepTag sand', () => assert.strictEqual(audioWiring.tileToFootstepTag(6), 'sand'));
check('tileToFootstepTag bridge wood', () => assert.strictEqual(audioWiring.tileToFootstepTag(10), 'wood'));
check('tileToFootstepTag path stone', () => assert.strictEqual(audioWiring.tileToFootstepTag(4), 'stone'));
check('tileToFootstepTag swamp cloth-wet', () => assert.strictEqual(audioWiring.tileToFootstepTag(17), 'cloth-wet'));

// ── NPC bible cross-ref (optional, tolerant) ───────────────────────────────
check('lord_malachar present in npc-bibles', () =>
  assert(audioWiring.hasNpcBible('lord_malachar')));
check('hasNpcBible returns false for unknown', () =>
  assert(!audioWiring.hasNpcBible('no_such_npc_xxx')));

// ── Graceful fallback: simulate manifest missing ───────────────────────────
// We cannot delete the real file but we can exercise the no-op path by
// asking emitEvent with a trigger that has no mapping — nothing should
// throw and no message should land.
resetCapture();
audio.emitEvent(1, 'no_such_event_trigger_zzz', {});
check('unknown trigger silently no-ops', () => assert.strictEqual(captured.length, 0));

// ── Register runtime handler ───────────────────────────────────────────────
audio.registerHandler('ui_click', ['test-extra-chime']);
resetCapture();
audio.emitEvent(1, 'ui_click');
check('registerHandler extra id fires alongside manifest id', () =>
  assert(byId('test-extra-chime').length >= 1));

// ── Summary ────────────────────────────────────────────────────────────────
console.log(`\n== Audio Activation Test Results ==`);
console.log(`  PASS: ${passCount}`);
console.log(`  FAIL: ${failCount}`);
console.log(`  TOTAL: ${passCount + failCount}`);
unsubscribe();
audioWiring.detach();
process.exit(failCount === 0 ? 0 : 1);
