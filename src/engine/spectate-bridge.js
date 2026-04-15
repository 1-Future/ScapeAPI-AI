// ══════════════════════════════════════════════════════════════════════════════
// spectate-bridge — burn-v2
//
// Centralised builders for the spectator WebSocket protocol. Keeping the
// shape builders in a dedicated, dependency-free module lets the server
// emit messages without re-implementing the schema and lets the protocol
// test (scripts/test-spectator-protocol.js) validate them without booting
// the whole server.
//
// Protocol summary (narrow, additive — every message has a `type` field):
//   { type: 'dialogue_update',   playerName, npcId, npcName, status, history }
//   { type: 'breakpoint_hit',    playerName, bpKey, bpType, trigger,
//                                importance, description, unlocks, tick, ts }
//   { type: 'inventory',         playerName, slots[28], freeSlots }
//   { type: 'combat_achievement',playerName, taskId, name, tier, ts }
//   { type: 'state_snapshot',    playerName, region, deathCount, accountMode,
//                                minigame, ca: { tiers: [...], totalComplete } }
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const INV_SIZE = 28;
const DIALOGUE_HISTORY_WIRE_CAP = 5;
const VALID_IMPORTANCE = new Set(['minor', 'major', 'transformative']);
const VALID_MODES = new Set(['normal', 'ironman', 'hcim', 'uim']);
const CA_TIERS = ['easy', 'medium', 'hard', 'elite', 'master', 'grandmaster'];

// ── dialogue_update ─────────────────────────────────────────────────────────
// If the player has no activeDialogue, we emit an `ended` message so the
// client can clear its panel. Otherwise we compute a status hint from the
// last turn: NPC just finished speaking → waiting_for_player. Player just
// finished speaking → npc_thinking. Empty history → npc_thinking (cold open).
function buildDialogueUpdate(player) {
  if (!player || !player.activeDialogue) {
    return {
      type: 'dialogue_update',
      playerName: player ? player.name : null,
      npcId: null,
      npcName: null,
      status: 'ended',
      history: [],
    };
  }
  const d = player.activeDialogue;
  const rawHistory = Array.isArray(d.history) ? d.history : [];
  // Trim to last N turns, preserving order
  const history = rawHistory.slice(-DIALOGUE_HISTORY_WIRE_CAP).map(h => ({
    role: h.role === 'player' ? 'player' : 'npc',
    text: String(h.text || ''),
    ts: typeof h.ts === 'number' ? h.ts : null,
  }));
  const last = history[history.length - 1];
  const status = !last ? 'npc_thinking'
               : last.role === 'npc' ? 'waiting_for_player'
               : 'npc_thinking';
  return {
    type: 'dialogue_update',
    playerName: player.name || null,
    npcId: d.npcId || null,
    npcName: d.npcName || null,
    status,
    history,
  };
}

// ── breakpoint_hit ──────────────────────────────────────────────────────────
// Accepts the event shape emitted by engine/breakpoint-runner. Wall-clock ts
// lets the spectator sort a mixed-player feed chronologically.
function buildBreakpointHit(event) {
  const importance = VALID_IMPORTANCE.has(event && event.importance)
    ? event.importance
    : 'minor';
  return {
    type: 'breakpoint_hit',
    playerName: event ? event.playerName || null : null,
    playerId: event ? event.playerId || null : null,
    bpKey: event ? event.bpKey || null : null,
    bpType: event ? event.bpType || null : null,
    trigger: event ? event.trigger || null : null,
    importance,
    description: event ? (event.description || '') : '',
    unlocks: Array.isArray(event && event.unlocks) ? event.unlocks : [],
    tick: typeof (event && event.tick) === 'number' ? event.tick : 0,
    ts: Date.now(),
  };
}

// ── inventory ──────────────────────────────────────────────────────────────
// Always a 28-slot array. Empty slots are `null` so the client can render
// them as blanks without extra checks. freeSlots is handy for a glance.
function buildInventory(player) {
  const slots = new Array(INV_SIZE).fill(null);
  const inv = (player && Array.isArray(player.inv)) ? player.inv : [];
  for (let i = 0; i < INV_SIZE; i++) {
    const s = inv[i];
    if (!s) continue;
    slots[i] = {
      id: s.id != null ? s.id : null,
      name: typeof s.name === 'string' ? s.name : String(s.name || ''),
      count: typeof s.count === 'number' ? s.count : 1,
    };
  }
  const freeSlots = slots.filter(s => s === null).length;
  return {
    type: 'inventory',
    playerName: (player && player.name) || null,
    slots,
    freeSlots,
  };
}

// ── combat_achievement ─────────────────────────────────────────────────────
function buildCombatAchievement({ playerId, playerName, taskId, name, tier }) {
  return {
    type: 'combat_achievement',
    playerId: playerId != null ? playerId : null,
    playerName: playerName || null,
    taskId: taskId || null,
    name: name || null,
    tier: typeof tier === 'string' ? tier : null,
    ts: Date.now(),
  };
}

// ── state_snapshot ─────────────────────────────────────────────────────────
// A low-frequency message (throttle in the server — every ~2s or on change).
// Collects the stable bits a spectator side-rail wants: region, minigame,
// deaths, account mode, CA progress per tier.
function buildStateSnapshot(player) {
  const area = (player && player.area) || {};
  const minigame = (player && player.activeMinigame) ? {
    id: player.activeMinigame.id || null,
    name: player.activeMinigame.name || player.activeMinigame.id || 'Unknown',
    wave: typeof player.activeMinigame.wave === 'number' ? player.activeMinigame.wave : null,
    phase: player.activeMinigame.phase || null,
  } : null;
  const mode = player && VALID_MODES.has(player.accountMode) ? player.accountMode : null;
  const hc = mode === 'hcim';

  // CA: count achievementsComplete by tier, if the player has the combat
  // achievements registry loaded. Defensive — safe if missing.
  const caTiers = CA_TIERS.map(tier => ({ tier, complete: 0, total: 0 }));
  try {
    // Lazy require so the test script doesn't need the content tree.
    const mod = require('../content/aelgard/combat-achievements');
    if (mod && mod.combatAchievements) {
      for (const t of CA_TIERS) {
        const list = mod.combatAchievements.get(t) || [];
        const entry = caTiers.find(x => x.tier === t);
        entry.total = list.length;
        if (player && player.achievementsComplete) {
          for (const ach of list) {
            if (player.achievementsComplete[ach.id]) entry.complete++;
          }
        }
      }
    }
  } catch (_e) {
    // No CA module available (e.g., test harness) — leave zeros.
  }
  const totalComplete = caTiers.reduce((s, t) => s + t.complete, 0);
  const totalTotal = caTiers.reduce((s, t) => s + t.total, 0);

  return {
    type: 'state_snapshot',
    playerName: (player && player.name) || null,
    playerId: (player && player.id) || null,
    region: {
      id: area.id || null,
      name: area.name || 'Unknown',
      subArea: area.subArea || null,
    },
    deathCount: typeof (player && player.deathCount) === 'number' ? player.deathCount : 0,
    accountMode: mode,
    hardcore: hc,
    minigame,
    ca: {
      tiers: caTiers,
      totalComplete,
      totalTotal,
    },
    ts: Date.now(),
  };
}

module.exports = {
  INV_SIZE,
  DIALOGUE_HISTORY_WIRE_CAP,
  CA_TIERS,
  buildDialogueUpdate,
  buildBreakpointHit,
  buildInventory,
  buildCombatAchievement,
  buildStateSnapshot,
};
