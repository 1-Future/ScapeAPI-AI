// ══════════════════════════════════════════════════════════════════════════════
// audio-wiring.js — Connects engine events to the audio dispatcher.
//
// Import once at boot (after audio-triggers has a registered forwarder).
// Emissions are fire-and-forget — never block a tick. Every hook is wrapped
// in try/catch so no audio failure can take down the tick loop.
//
// Covers the canonical burn-v2 event surface:
//   - Combat: hit_*, miss, block, death, respawn
//   - Skilling: mine, chop, fish, cook, smith, fletch, craft, smelt, fire,
//               pray, cast, hunter, farm, thieve, runecraft
//   - UI: click, inventory_*, bank_*, shop_*, level_up_*
//   - Breakpoint: handled by audio-triggers itself
//   - Quest: start, step, complete
//   - GE: offer_placed, partial_match, complete
//   - Movement: footstep_<tile>, doors, teleports
//   - Region entry: emits music + ambient + region sting
//   - Boss phase transitions: emits vocal_sting if mapped
//
// Dependencies:
//   - src/engine/events.js — pub/sub for engine events
//   - src/engine/audio-triggers.js — manifest-backed dispatcher
//   - src/engine/tick.js — for simulated time-of-day
//   - data/npc-bibles.json — boss → vocal lookup (tolerant if missing)
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const path = require('path');
const fs = require('fs');

const events = require('./events');
const audio = require('./audio-triggers');
let tickMod = null;
try { tickMod = require('./tick'); } catch (_) { /* tests may not load tick */ }

// ── NPC bible lookup (optional) ─────────────────────────────────────────────

let npcBible = new Map();           // npcId → npc bible entry
let npcBibleError = null;

function loadNpcBible() {
  try {
    const p = path.join(__dirname, '..', '..', 'data', 'npc-bibles.json');
    const raw = fs.readFileSync(p, 'utf8');
    const data = JSON.parse(raw);
    npcBible = new Map();
    for (const n of data.npcs || []) {
      if (n.id) npcBible.set(n.id, n);
    }
  } catch (e) {
    npcBibleError = e.message;
    npcBible = new Map();
  }
}
loadNpcBible();

// ── Helpers ─────────────────────────────────────────────────────────────────

function safe(fn) {
  return function (...args) {
    try { return fn.apply(null, args); }
    catch (e) { /* swallow — audio must never block a tick */ }
  };
}

function playerTarget(data) {
  if (!data) return null;
  if (data.ws && typeof data.ws.send === 'function') return data.ws;
  if (data.player && data.player.id != null) return data.player.id;
  if (data.playerId != null) return data.playerId;
  return null;
}

// Safe wrapper for emitEvent — resolves target automatically.
function emit(data, eventType, context) {
  const target = playerTarget(data);
  if (target == null) return;
  audio.emitEvent(target, eventType, context || {});
}

// ── Tile type → footstep trigger (client distinguishes by id variant) ───────
// All footsteps share trigger `movement_footstep` per the manifest; the tile
// tag flows through context so the client can pick the right variant id.
function tileToFootstepTag(tile) {
  // From src/world/tiles.js T enum: GRASS=1, WATER=2, TREE=3, PATH=4, ROCK=5,
  // SAND=6, WALL=7, FLOOR=8, DOOR=9, BRIDGE=10, FISH_SPOT=11, FLOWER=12,
  // BUSH=13, DARK_GRASS=14, SNOW=15, LAVA=16, SWAMP=17.
  switch (tile | 0) {
    case 1: return 'grass';
    case 4: return 'stone';      // PATH
    case 5: return 'stone';      // ROCK tile edge
    case 6: return 'sand';
    case 8: return 'stone';      // FLOOR treated as stone
    case 10: return 'wood';      // BRIDGE
    case 14: return 'grass';
    case 15: return 'snow';
    case 16: return 'lava-edge';
    case 17: return 'cloth-wet'; // SWAMP
    case 2: return 'water-shallow';
    default: return 'dirt';
  }
}

// ── Skilling map (skill_action fires {player, skill, subtype?, tier?}) ──────
const SKILL_MAP = {
  mining: 'skill_mining_hit',
  woodcutting: 'skill_woodcutting_hit',
  fishing: 'skill_fishing_catch',
  cooking: 'skill_cooking_food_ready',
  smithing: 'skill_smithing_anvil_hit',
  fletching: 'skill_fletching_knife',
  crafting: 'skill_crafting_pot',
  firemaking: 'skill_firemaking_light',
  herblore: 'skill_herblore_mix',
  prayer: 'prayer_bones_use',
  magic: 'spell_cast_wind_strike',
  hunter: 'skill_hunter_trap_catch',
  farming: 'skill_farming_harvest',
  thieving: 'skill_thieving_pickpocket_success',
  runecrafting: 'skill_runecrafting_rune_formed',
  agility: 'skill_agility_vault',
  slayer: 'skill_slayer_item_use',
  construction: 'skill_construction_build',
};

// ── Attach hooks (idempotent — safe to call twice) ───────────────────────────

let attached = false;

function attach() {
  if (attached) return;
  attached = true;

  // ── Player lifecycle ──────────────────────────────────────────────────────
  events.on('player_login', 'audio.login', safe((data) => {
    emit(data, 'login');
    // Region ambient fires when player's region is known.
    const p = data && data.player;
    if (p && p.region) {
      const tod = audio.simulateDayNight(tickMod ? tickMod.getTick() : 0);
      audio.emitRegionAudio(playerTarget(data), p.region, tod);
    }
  }));
  events.on('player_logout', 'audio.logout', safe((data) => emit(data, 'logout')));

  // ── Movement (region change + footsteps) ─────────────────────────────────
  events.on('player_move', 'audio.move', safe((data) => {
    const p = data && data.player;
    if (!p) return;
    const prevRegion = p._audioLastRegion;
    const curRegion = p.region;
    if (curRegion && curRegion !== prevRegion) {
      p._audioLastRegion = curRegion;
      const tod = audio.simulateDayNight(tickMod ? tickMod.getTick() : 0);
      audio.emitRegionAudio(playerTarget(data), curRegion, tod);
    }
    // Footstep — lazy-require tiles so tests without world still work.
    try {
      const tiles = require('../world/tiles');
      const tile = tiles.tileAt(p.x, p.y, p.layer || 0);
      emit(data, 'movement_footstep', { tag: tileToFootstepTag(tile), tile });
    } catch (_) {
      emit(data, 'movement_footstep', { tag: 'dirt' });
    }
  }));

  // ── Combat hits (server fires discrete events) ────────────────────────────
  events.on('combat_hit', 'audio.combat_hit', safe((data) => {
    if (!data) return;
    // style: 'slash'|'stab'|'crush'|'ranged'|'magic'; weight: 'light'|'heavy'.
    const style = (data.style || 'slash').toLowerCase();
    const weight = data.heavy ? 'heavy' : 'light';
    const trig = style === 'ranged'
      ? 'combat_hit_ranged_arrow'
      : style === 'magic'
        ? 'combat_hit_magic'
        : `combat_hit_${style}_${weight}`;
    emit(data, trig, { style, weight, dmg: data.damage });
  }));
  events.on('combat_miss', 'audio.combat_miss', safe((data) => emit(data, 'combat_miss')));
  events.on('combat_block', 'audio.combat_block', safe((data) => {
    const trig = data && data.shield ? 'combat_block_shield' : 'combat_block_armour';
    emit(data, trig);
  }));
  events.on('combat_parry', 'audio.combat_parry', safe((data) => emit(data, 'combat_block_shield')));
  events.on('combat_engage', 'audio.combat_engage', safe((data) => {
    const trig = data && data.boss ? 'combat_engage_boss' : 'combat_engage';
    emit(data, trig);
  }));
  events.on('combat_critical', 'audio.combat_critical', safe((data) => emit(data, 'combat_critical')));
  events.on('player_death', 'audio.player_death', safe((data) => emit(data, 'combat_death_player')));
  events.on('player_respawn', 'audio.respawn', safe((data) => emit(data, 'death_respawn')));
  events.on('npc_kill', 'audio.npc_kill', safe((data) => {
    const npc = data && data.npc;
    if (!npc) return emit(data, 'combat_death_monster');
    if (npc.boss || npc.isBoss) return emit(data, 'combat_death_monster_boss');
    emit(data, 'combat_death_monster', { name: npc.name });
  }));

  // ── Boss phase transition → vocal sting + generic phase SFX ──────────────
  events.on('boss_phase_transition', 'audio.boss_phase', safe((data) => {
    emit(data, 'boss_phase_transition');
    const npcId = (data && (data.npcId || (data.npc && data.npc.defId))) || null;
    if (npcId) {
      // First try manifest vocal_stings mapped to this character.
      const fired = audio.emitVocalForBoss(playerTarget(data) || null, npcId, 'boss_phase_transition');
      // If no character-specific sting, check that the npc exists in bibles to
      // confirm it's a known NPC (purely informational — no emission needed).
      if (!fired && npcBible.has(npcId)) {
        // No per-character sting defined; rely on the generic phase SFX above.
      }
    }
  }));
  events.on('boss_encounter_start', 'audio.boss_start', safe((data) => {
    emit(data, 'boss_encounter_start');
    const npcId = data && (data.npcId || (data.npc && data.npc.defId));
    if (npcId) audio.emitVocalForBoss(playerTarget(data) || null, npcId, 'boss_encounter_start');
  }));
  events.on('boss_defeat', 'audio.boss_defeat', safe((data) => {
    emit(data, 'boss_defeat');
    const npcId = data && (data.npcId || (data.npc && data.npc.defId));
    if (npcId) audio.emitVocalForBoss(playerTarget(data) || null, npcId, 'boss_defeat');
  }));
  events.on('boss_enrage', 'audio.boss_enrage', safe((data) => emit(data, 'boss_enrage')));

  events.on('skill_action', 'audio.skill_action', safe((data) => {
    if (!data || !data.skill) return;
    const skill = String(data.skill).toLowerCase();
    const trig = SKILL_MAP[skill];
    if (trig) emit(data, trig, { skill, subtype: data.subtype, tier: data.tier });
    // XP drop chime (every skill action potentially awards XP).
    emit(data, 'xp_drop', { skill });
  }));

  // ── Fine-grained skill events (if emitted by subsystems) ─────────────────
  events.on('cook_success', 'audio.cook_ok', safe((d) => emit(d, 'skill_cooking_food_ready')));
  events.on('cook_burn', 'audio.cook_burn', safe((d) => emit(d, 'skill_cooking_food_burnt')));
  events.on('smelt_bar', 'audio.smelt_bar', safe((d) => emit(d, 'skill_smithing_furnace_smelt')));
  events.on('smith_hammer', 'audio.smith_hammer', safe((d) => emit(d, 'skill_smithing_anvil_hit')));
  events.on('fletch_bow', 'audio.fletch_bow', safe((d) => emit(d, 'skill_fletching_string')));
  events.on('craft_pot', 'audio.craft_pot', safe((d) => emit(d, 'skill_crafting_pot')));
  events.on('light_fire', 'audio.light_fire', safe((d) => emit(d, 'skill_firemaking_light')));
  events.on('pray_activate', 'audio.pray_activate', safe((d) => {
    const kind = (d && d.kind) || 'protect_melee';
    emit(d, `prayer_activate_${kind}`);
  }));
  events.on('cast_spell', 'audio.cast_spell', safe((d) => {
    const spellKey = (d && d.spellKey) || 'wind_strike';
    emit(d, `spell_cast_${spellKey}`);
  }));
  events.on('mine_rock', 'audio.mine_rock', safe((d) => emit(d, 'skill_mining_hit', { tier: d && d.tier })));
  events.on('chop_tree', 'audio.chop_tree', safe((d) => emit(d, 'skill_woodcutting_hit', { tier: d && d.tier })));
  events.on('fish_catch', 'audio.fish_catch', safe((d) => emit(d, 'skill_fishing_catch', { tier: d && d.tier })));
  events.on('hunter_catch', 'audio.hunter_catch', safe((d) => emit(d, 'skill_hunter_trap_catch')));
  events.on('farm_harvest', 'audio.farm_harvest', safe((d) => emit(d, 'skill_farming_harvest')));
  events.on('farm_plant', 'audio.farm_plant', safe((d) => emit(d, 'skill_farming_plant')));
  events.on('thieve_success', 'audio.thieve_ok', safe((d) => emit(d, 'skill_thieving_pickpocket_success')));
  events.on('thieve_fail', 'audio.thieve_fail', safe((d) => emit(d, 'skill_thieving_pickpocket_fail')));
  events.on('runecraft_altar', 'audio.rc_altar', safe((d) => emit(d, 'skill_runecrafting_altar_use')));

  // ── UI / Inventory ───────────────────────────────────────────────────────
  events.on('ui_click', 'audio.ui_click', safe((d) => emit(d, 'ui_click')));
  events.on('inventory_pickup', 'audio.inv_pickup', safe((d) => emit(d, 'inventory_pick_up')));
  events.on('inventory_drop', 'audio.inv_drop', safe((d) => emit(d, 'inventory_drop')));
  events.on('inventory_equip', 'audio.inv_equip', safe((d) => emit(d, 'inventory_equip')));
  events.on('inventory_unequip', 'audio.inv_unequip', safe((d) => emit(d, 'inventory_unequip')));
  events.on('inventory_eat', 'audio.inv_eat', safe((d) => emit(d, 'inventory_eat')));
  events.on('inventory_drink', 'audio.inv_drink', safe((d) => emit(d, 'inventory_drink')));

  // ── Bank ─────────────────────────────────────────────────────────────────
  events.on('bank_open', 'audio.bank_open', safe((d) => emit(d, 'bank_open')));
  events.on('bank_close', 'audio.bank_close', safe((d) => emit(d, 'bank_close')));
  events.on('bank_deposit', 'audio.bank_deposit', safe((d) => emit(d, 'bank_deposit')));
  events.on('bank_withdraw', 'audio.bank_withdraw', safe((d) => emit(d, 'bank_withdraw')));

  // ── Shop ─────────────────────────────────────────────────────────────────
  events.on('shop_open', 'audio.shop_open', safe((d) => emit(d, 'shop_open')));
  events.on('shop_buy', 'audio.shop_buy', safe((d) => emit(d, 'shop_buy')));
  events.on('shop_sell', 'audio.shop_sell', safe((d) => emit(d, 'shop_sell')));
  events.on('gp_gain', 'audio.gp_gain', safe((d) => emit(d, 'shop_sell', { reason: 'gp_gain' })));
  events.on('gp_spend', 'audio.gp_spend', safe((d) => emit(d, 'shop_buy', { reason: 'gp_spend' })));

  // ── Quest ────────────────────────────────────────────────────────────────
  events.on('quest_started', 'audio.quest_started', safe((d) => emit(d, 'quest_started')));
  events.on('quest_step_complete', 'audio.quest_step', safe((d) => emit(d, 'quest_step_complete')));
  events.on('quest_complete', 'audio.quest_complete', safe((d) => emit(d, 'quest_complete')));

  // ── Grand Exchange ───────────────────────────────────────────────────────
  events.on('ge_offer_placed', 'audio.ge_placed', safe((d) => emit(d, 'grand_exchange_offer_post')));
  events.on('ge_offer_partial', 'audio.ge_partial', safe((d) => emit(d, 'grand_exchange_offer_post', { partial: true })));
  events.on('ge_offer_filled', 'audio.ge_filled', safe((d) => emit(d, 'grand_exchange_offer_filled')));
  events.on('ge_offer_abort', 'audio.ge_abort', safe((d) => emit(d, 'grand_exchange_offer_abort')));

  // ── Level-up bell (gp_gain, level-up events already covered via breakpoints) ─
  events.on('level_up', 'audio.level_up', safe((d) => {
    const imp = (d && d.importance) || 'minor';
    const trig = imp === 'transformative' ? 'level_up_transformative'
      : imp === 'major' ? 'level_up_major' : 'level_up_minor';
    emit(d, trig, { skill: d && d.skill, level: d && d.level });
  }));

  // ── Misc ────────────────────────────────────────────────────────────────
  events.on('rare_drop', 'audio.rare_drop', safe((d) => emit(d, 'rare_drop')));
  events.on('pet_drop', 'audio.pet_drop', safe((d) => emit(d, 'pet_drop')));
  events.on('clue_scroll_drop', 'audio.clue_drop', safe((d) => emit(d, 'clue_scroll_drop')));
  events.on('achievement_unlocked', 'audio.ach_unlocked', safe((d) => emit(d, 'achievement_unlocked')));
  events.on('diary_step_complete', 'audio.diary_step', safe((d) => emit(d, 'diary_step_complete')));
  events.on('diary_tier_complete', 'audio.diary_tier', safe((d) => emit(d, 'diary_tier_complete')));
  events.on('wilderness_enter', 'audio.wildy_enter', safe((d) => emit(d, 'wilderness_enter')));
  events.on('wilderness_leave', 'audio.wildy_leave', safe((d) => emit(d, 'wilderness_leave')));
}

function detach() {
  // Tests use this to clean up.
  if (!attached) return;
  const names = [
    'player_login','player_logout','player_move','combat_hit','combat_miss',
    'combat_block','combat_parry','combat_engage','combat_critical','player_death',
    'player_respawn','npc_kill','boss_phase_transition','boss_encounter_start',
    'boss_defeat','boss_enrage','skill_action','cook_success','cook_burn',
    'smelt_bar','smith_hammer','fletch_bow','craft_pot','light_fire','pray_activate',
    'cast_spell','mine_rock','chop_tree','fish_catch','hunter_catch','farm_harvest',
    'farm_plant','thieve_success','thieve_fail','runecraft_altar','ui_click',
    'inventory_pickup','inventory_drop','inventory_equip','inventory_unequip',
    'inventory_eat','inventory_drink','bank_open','bank_close','bank_deposit',
    'bank_withdraw','shop_open','shop_buy','shop_sell','gp_gain','gp_spend',
    'quest_started','quest_step_complete','quest_complete','ge_offer_placed',
    'ge_offer_partial','ge_offer_filled','ge_offer_abort','level_up','rare_drop',
    'pet_drop','clue_scroll_drop','achievement_unlocked','diary_step_complete',
    'diary_tier_complete','wilderness_enter','wilderness_leave',
  ];
  for (const n of names) events.off(n, `audio.${n.replace(/^[a-z]+_/, '')}`);
  attached = false;
}

module.exports = {
  attach,
  detach,
  tileToFootstepTag,
  SKILL_MAP,
  isAttached: () => attached,
  hasNpcBible: (id) => npcBible.has(id),
  getNpcBible: (id) => npcBible.get(id) || null,
  reloadNpcBible: loadNpcBible,
};
