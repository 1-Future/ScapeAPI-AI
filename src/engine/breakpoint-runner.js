// ══════════════════════════════════════════════════════════════════════════════
// Breakpoint Runner — fires events when players cross transformative thresholds
//
// Built on rel.getBreakpointsForSkill / rel.getBreakpointsForQuest. The runner
// detects level crossings and quest completions, dedups via player.breakpointsHit,
// and emits a structured event the spectator/codex/UI can react to.
//
// Importance levels (Marstead): minor | major | transformative
//   - minor:          a tier-up like steel weapons
//   - major:          a new area, boss, capability
//   - transformative: "the game permanently changes" (e.g., prayer 43, magic 55)
//
// Sub-system #5 of the Engine Bridge (see ENGINE-BRIDGE-ROADMAP.md).
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const rel = require('../data/relationships');
const tick = require('./tick');
const player = require('../player/player');

// In-process listeners — server.js subscribes to forward to WebSocket clients.
const listeners = new Set();

function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

function emit(event) {
  for (const fn of listeners) {
    try { fn(event); } catch (e) { console.error('[breakpoint-runner] listener', e.message); }
  }
}

// ── XP modifier hooks ─────────────────────────────────────────────────────────
// Subscribers receive (player, skill, amount) and return a new amount (or the
// same amount). Chained — each hook sees the previous hook's output. Used by
// account-mode plugins (area-locked bonus XP, etc.) to transform XP without
// touching the base addXp pipeline.
const xpModifiers = new Set();

function addXpModifier(fn) { xpModifiers.add(fn); return () => xpModifiers.delete(fn); }

function applyXpModifiers(p, skill, amount) {
  let out = amount;
  for (const fn of xpModifiers) {
    try { out = fn(p, skill, out); }
    catch (e) { console.error('[breakpoint-runner] xp-modifier', e.message); }
  }
  return out;
}

// ── Key & dedup ───────────────────────────────────────────────────────────────

function bpKey(bp) {
  if (bp.type === 'skill_level') return `skill_level:${bp.trigger.skill}:${bp.trigger.level}`;
  if (bp.type === 'quest_complete') return `quest_complete:${bp.trigger.quest}`;
  if (bp.type === 'item_acquired') return `item_acquired:${bp.trigger.item}`;
  if (bp.type === 'achievement') return `achievement:${bp.trigger.achievement}`;
  return `unknown:${JSON.stringify(bp.trigger)}`;
}

function alreadyFired(p, bp) {
  if (!p.breakpointsHit) p.breakpointsHit = {};
  return p.breakpointsHit[bpKey(bp)] !== undefined;
}

function record(p, bp) {
  if (!p.breakpointsHit) p.breakpointsHit = {};
  if (!p.breakpointHistory) p.breakpointHistory = [];
  const t = tick.getTick();
  const key = bpKey(bp);
  p.breakpointsHit[key] = t;
  const event = {
    type: 'breakpoint',
    bpKey: key,
    bpType: bp.type,
    trigger: bp.trigger,
    importance: bp.importance,
    description: bp.description,
    unlocks: bp.unlocks || [],
    playerId: p.id,
    playerName: p.name,
    tick: t,
  };
  p.breakpointHistory.push(event);
  if (p.breakpointHistory.length > 50) p.breakpointHistory.shift();
  emit(event);
  return event;
}

// ── Detection: skill level crossings ──────────────────────────────────────────
// Call after addXp returns a new level. We look at every breakpoint on this
// skill ≤ newLevel and fire any not yet recorded — handles batched XP gains
// (e.g., quest reward) that skip multiple levels.

function checkSkillLevel(p, skill, newLevel) {
  const fired = [];
  const bps = rel.getBreakpointsForSkill(skill);
  for (const bp of bps) {
    if (bp.trigger.level > newLevel) continue;
    if (alreadyFired(p, bp)) continue;
    fired.push(record(p, bp));
  }
  return fired;
}

// ── Detection: quest completions ──────────────────────────────────────────────

function checkQuestComplete(p, questId) {
  const fired = [];
  const bps = rel.getBreakpointsForQuest(questId);
  for (const bp of bps) {
    if (alreadyFired(p, bp)) continue;
    fired.push(record(p, bp));
  }
  return fired;
}

// ── XP wrapper ────────────────────────────────────────────────────────────────
// Convenience wrapper that mirrors player.addXp's signature and triggers
// breakpoint detection automatically. Returns the same value addXp returns
// (new level if leveled, else null) so it's a drop-in replacement.

function addXpWithBreakpoints(p, skill, amount) {
  const before = player.getLevel(p, skill);
  // Apply any registered XP modifiers (area-locked bonus, etc.)
  const modified = applyXpModifiers(p, skill, amount);
  const newLevel = player.addXp(p, skill, modified);
  if (newLevel && newLevel > before) {
    checkSkillLevel(p, skill, newLevel);
  }
  return newLevel;
}

// ── Bootstrap: fire breakpoints for the levels the player ALREADY has ────────
// Used on login so a returning character with prayer 50 doesn't re-fire prayer
// 43, but a brand-new character gets the level-1 breakpoints recorded silently.

function bootstrap(p) {
  if (!p.breakpointsHit) p.breakpointsHit = {};
  for (const skill of ['attack','strength','defence','hitpoints','ranged','prayer','magic',
       'runecrafting','construction','agility','herblore','thieving','crafting',
       'fletching','slayer','hunter','mining','smithing','fishing','cooking',
       'firemaking','woodcutting','farming']) {
    const lvl = player.getLevel(p, skill);
    const bps = rel.getBreakpointsForSkill(skill);
    for (const bp of bps) {
      if (bp.trigger.level <= lvl && !alreadyFired(p, bp)) {
        // Silent record — don't emit on bootstrap
        p.breakpointsHit[bpKey(bp)] = -1;
      }
    }
  }
}

module.exports = {
  subscribe, emit,
  checkSkillLevel, checkQuestComplete,
  addXpWithBreakpoints,
  addXpModifier, applyXpModifiers,
  bootstrap,
  bpKey,
};
