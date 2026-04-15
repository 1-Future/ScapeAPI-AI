// ══════════════════════════════════════════════════════════════════════════════
// Ironman Account Mode — Core
//
// "Iron Man is not a challenge mode. It is the way the game was meant to be
// played." (Manifesto principle 15)
//
// This module owns the full restriction policy for four account variants:
//
//   ironman           — no trading, no GE, no looting other players' drops,
//                       no accepting items in raids you didn't earn
//   hardcore_ironman  — same as ironman, plus: on first death the account is
//                       downgraded to regular ironman (hardcore is lost forever)
//   ultimate_ironman  — same as ironman, plus: no bank access. Carry everything
//                       on you (inventory + equipment) between sessions.
//   group_ironman     — same as ironman, plus: can trade/share with up to 4
//                       group members (5 total including the player)
//
// Design notes:
//   - Restrictions are SOFT. canX() returns { allowed, reason } — callers
//     decide how to present the rejection. No crashes, no invisible punishment.
//   - Once enabled, the mode is permanent (modeSet = true). Group membership
//     is mutable (invite/leave) but the base variant is not.
//   - Legacy `player.accountMode` is kept in sync with the new variant so the
//     existing GE/loot/bank checks (which read accountMode directly) keep
//     working without further edits.
//
// Player shape additions (persisted through server.js's JSON dump):
//   player.ironman = {
//     variant: 'ironman' | 'hardcore_ironman' | 'ultimate_ironman' | 'group_ironman',
//     enabledAt: tick,
//     group: [memberId, ...],         // group_ironman only, max 4 others
//     hardcoreDied: boolean,           // set once, then never cleared
//     downgradedFrom: string | null,   // e.g. 'hardcore_ironman' after a death
//   }
//
// Downstream hooks (wired by other files):
//   - ge-runner.js     -> check canUseGE before placeOffer (via hook in the
//                         placeOffer entry point)
//   - death.js         -> call onDeath(player) for hardcore downgrade + event
//   - server.js        -> check canLoot in the pickup command (already present
//                         via accountMode; kept compatible)
//   - server.js bank   -> check canBank (already present via accountMode)
//   - raids            -> canAcceptInvite gates raid item acceptance
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const events = require('./events');

// ── Variants ────────────────────────────────────────────────────────────────
const VARIANTS = Object.freeze({
  ironman: 'ironman',
  hardcore_ironman: 'hardcore_ironman',
  ultimate_ironman: 'ultimate_ironman',
  group_ironman: 'group_ironman',
});

const VARIANT_LABELS = Object.freeze({
  ironman: 'Ironman',
  hardcore_ironman: 'Hardcore Ironman',
  ultimate_ironman: 'Ultimate Ironman',
  group_ironman: 'Group Ironman',
});

// Map new variants to the legacy `player.accountMode` string used by existing
// checks in server.js (pickup, bank) and death.js (grave mode).
const LEGACY_MODE = Object.freeze({
  ironman: 'ironman',
  hardcore_ironman: 'hcim',
  ultimate_ironman: 'uim',
  group_ironman: 'ironman',
});

const GROUP_CAP = 4;                 // up to 4 OTHER members (5-person groups)

// Optional tick source; defaults to 0 if the server doesn't inject one.
let getTick = () => 0;

function setTickSource(fn) {
  if (typeof fn === 'function') getTick = fn;
}

// ── Enable / check ──────────────────────────────────────────────────────────

/**
 * enableMode(player, variant)
 * Permanently enable an ironman variant on the player. Returns
 * { ok: true, variant } or { ok: false, reason } if the mode cannot be set
 * (unknown variant, already set, etc.).
 *
 * Initial state:
 *   - player.ironman.group starts empty; for group_ironman the player invites
 *     others via groupAdd()
 *   - Legacy `accountMode` / `modeSet` fields are kept in sync so existing
 *     checks elsewhere in the codebase keep working.
 */
function enableMode(player, variant) {
  if (!player || typeof player !== 'object') {
    return { ok: false, reason: 'No player.' };
  }
  if (!VARIANTS[variant]) {
    return { ok: false, reason: `Unknown variant: ${variant}.` };
  }
  if (player.ironman && player.ironman.variant) {
    return { ok: false, reason: 'Account mode already set and cannot be changed.' };
  }
  player.ironman = {
    variant,
    enabledAt: getTick(),
    group: [],
    hardcoreDied: false,
    downgradedFrom: null,
  };
  // Keep legacy fields in sync (read by pickup, bank, GE status icon, etc.).
  player.accountMode = LEGACY_MODE[variant];
  player.modeSet = true;
  return { ok: true, variant };
}

function isIronman(player) {
  return !!(player && player.ironman && player.ironman.variant);
}

function getVariant(player) {
  return player && player.ironman ? player.ironman.variant : null;
}

function isGroupMember(player, otherId) {
  if (!player || !player.ironman) return false;
  if (player.ironman.variant !== VARIANTS.group_ironman) return false;
  if (otherId == null) return false;
  const group = player.ironman.group || [];
  return group.indexOf(otherId) >= 0;
}

// ── Restriction checks — return { allowed, reason } ─────────────────────────

function canTrade(player, otherPlayer) {
  if (!isIronman(player)) return { allowed: true, reason: '' };
  const otherId = otherPlayer && (otherPlayer.id != null ? otherPlayer.id : otherPlayer);
  if (player.ironman.variant === VARIANTS.group_ironman) {
    if (isGroupMember(player, otherId)) {
      return { allowed: true, reason: 'Group member.' };
    }
    return {
      allowed: false,
      reason: 'As a Group Ironman, you can only trade with members of your group.',
    };
  }
  return {
    allowed: false,
    reason: 'As an Ironman, you cannot trade with other players.',
  };
}

function canUseGE(player) {
  if (!isIronman(player)) return { allowed: true, reason: '' };
  return {
    allowed: false,
    reason: 'As an Ironman, you cannot use the Grand Exchange.',
  };
}

/**
 * canLoot(player, dropOwnerId)
 * dropOwnerId is the player id of whoever earned the drop (killing blow or
 * drop owner). null/undefined means "no owner" which every ironman can loot.
 */
function canLoot(player, dropOwnerId) {
  if (!isIronman(player)) return { allowed: true, reason: '' };
  if (dropOwnerId == null) return { allowed: true, reason: 'Unowned drop.' };
  if (dropOwnerId === player.id) {
    return { allowed: true, reason: 'You earned this drop.' };
  }
  // Group ironman: group members' drops are fair game.
  if (player.ironman.variant === VARIANTS.group_ironman
      && isGroupMember(player, dropOwnerId)) {
    return { allowed: true, reason: 'Group member drop.' };
  }
  return {
    allowed: false,
    reason: "As an Ironman, you cannot pick up another player's drop.",
  };
}

function canBank(player) {
  if (!isIronman(player)) return true;
  return player.ironman.variant !== VARIANTS.ultimate_ironman;
}

/**
 * canAcceptInvite(player, raid)
 * raid = { id, members: [{ playerId, contribution }] } — used by future raid
 * code. The rule: an ironman can only accept raid items if the raid recognises
 * their contribution as equal-or-greater. For now we approximate with a
 * `contributionEqual` boolean on the raid object or a membership check.
 *
 * If no raid object is supplied, the answer is a plain no (ironmen must
 * contribute). This intentionally errs on the side of safety.
 */
function canAcceptInvite(player, raid) {
  if (!isIronman(player)) return { allowed: true, reason: '' };
  if (!raid || typeof raid !== 'object') {
    return { allowed: false, reason: 'No raid context.' };
  }
  // Group ironman members of the same group are always allowed (the group's
  // whole point is shared progression).
  if (player.ironman.variant === VARIANTS.group_ironman
      && Array.isArray(raid.members)) {
    const everyoneGroupMate = raid.members.every(
      m => m.playerId === player.id || isGroupMember(player, m.playerId));
    if (everyoneGroupMate) return { allowed: true, reason: 'All raid members are in your group.' };
  }
  // The raid must explicitly flag the ironman's contribution as equal.
  if (raid.contributionEqual === true) {
    return { allowed: true, reason: 'Contribution was equal.' };
  }
  // Specific per-player contribution flag.
  if (Array.isArray(raid.members)) {
    const me = raid.members.find(m => m.playerId === player.id);
    if (me && me.contributionEqual === true) {
      return { allowed: true, reason: 'Your contribution was equal.' };
    }
  }
  return {
    allowed: false,
    reason: 'As an Ironman, you cannot accept raid items unless your contribution was equal.',
  };
}

// ── Group management (group_ironman only) ───────────────────────────────────

/**
 * groupAdd(player, memberId)
 * Add a member to a group_ironman's group. Returns { ok, reason }.
 * Enforces the 4-member cap (player + 4 = 5 total, the OSRS ceiling).
 */
function groupAdd(player, memberId) {
  if (!isIronman(player)) {
    return { ok: false, reason: 'Not an ironman.' };
  }
  if (player.ironman.variant !== VARIANTS.group_ironman) {
    return { ok: false, reason: 'Only Group Ironmen can form groups.' };
  }
  if (memberId == null) return { ok: false, reason: 'Invalid member id.' };
  if (memberId === player.id) return { ok: false, reason: "You can't add yourself." };
  const group = player.ironman.group || (player.ironman.group = []);
  if (group.indexOf(memberId) >= 0) {
    return { ok: false, reason: 'Already in your group.' };
  }
  if (group.length >= GROUP_CAP) {
    return { ok: false, reason: `Group is full (max ${GROUP_CAP} other members).` };
  }
  group.push(memberId);
  events.emit('ironman:group_added', {
    type: 'ironman:group_added',
    playerId: player.id,
    memberId,
    groupSize: group.length,
    tick: getTick(),
  });
  return { ok: true, reason: 'Added.', group: group.slice() };
}

/**
 * groupRemove(player, memberId)
 * Remove a member from the group. Returns { ok, reason }.
 */
function groupRemove(player, memberId) {
  if (!isIronman(player)) return { ok: false, reason: 'Not an ironman.' };
  if (player.ironman.variant !== VARIANTS.group_ironman) {
    return { ok: false, reason: 'Only Group Ironmen can manage groups.' };
  }
  const group = player.ironman.group || [];
  const idx = group.indexOf(memberId);
  if (idx < 0) return { ok: false, reason: 'Not in your group.' };
  group.splice(idx, 1);
  events.emit('ironman:group_removed', {
    type: 'ironman:group_removed',
    playerId: player.id,
    memberId,
    groupSize: group.length,
    tick: getTick(),
  });
  return { ok: true, reason: 'Removed.', group: group.slice() };
}

/**
 * groupLeave(player)
 * The player permanently leaves their group. The variant downgrades to
 * regular `ironman` — you cannot un-downgrade. Returns { ok, reason }.
 */
function groupLeave(player) {
  if (!isIronman(player)) return { ok: false, reason: 'Not an ironman.' };
  if (player.ironman.variant !== VARIANTS.group_ironman) {
    return { ok: false, reason: 'You are not in a Group Ironman group.' };
  }
  const prevGroup = (player.ironman.group || []).slice();
  player.ironman.group = [];
  player.ironman.variant = VARIANTS.ironman;
  player.ironman.downgradedFrom = VARIANTS.group_ironman;
  player.accountMode = LEGACY_MODE.ironman;
  events.emit('ironman:group_left', {
    type: 'ironman:group_left',
    playerId: player.id,
    exMembers: prevGroup,
    tick: getTick(),
  });
  return { ok: true, reason: 'You left your group. Variant downgraded to Ironman.' };
}

// ── Death hook (called from death.js) ───────────────────────────────────────

/**
 * onDeath(player)
 * Hardcore ironman: first death downgrades the variant permanently and fires
 * a `hardcore_died` event. Non-hardcore variants are untouched.
 */
function onDeath(player) {
  if (!isIronman(player)) return null;
  if (player.ironman.variant !== VARIANTS.hardcore_ironman) return null;
  if (player.ironman.hardcoreDied) return null; // already downgraded

  player.ironman.variant = VARIANTS.ironman;
  player.ironman.hardcoreDied = true;
  player.ironman.downgradedFrom = VARIANTS.hardcore_ironman;
  player.accountMode = LEGACY_MODE.ironman;

  const payload = {
    type: 'hardcore_died',
    playerId: player.id,
    playerName: player.name || null,
    tick: getTick(),
  };
  events.emit('hardcore_died', payload);
  return payload;
}

// ── Readable restriction summary ────────────────────────────────────────────

/**
 * restrictionsFor(player) -> [string, ...]
 * Human-readable list of what this mode forbids. Used by `/ironman status`
 * and anywhere else that wants to surface the rules to the player.
 */
function restrictionsFor(player) {
  if (!isIronman(player)) return ['No restrictions — you are on a normal account.'];
  const v = player.ironman.variant;
  const out = [];
  switch (v) {
    case VARIANTS.ironman:
      out.push('Cannot trade with other players.');
      out.push('Cannot use the Grand Exchange.');
      out.push("Cannot pick up other players' drops.");
      out.push('Cannot accept raid items you did not help earn.');
      break;
    case VARIANTS.hardcore_ironman:
      out.push('Cannot trade with other players.');
      out.push('Cannot use the Grand Exchange.');
      out.push("Cannot pick up other players' drops.");
      out.push('Cannot accept raid items you did not help earn.');
      out.push('First death downgrades this account to regular Ironman.');
      break;
    case VARIANTS.ultimate_ironman:
      out.push('Cannot trade with other players.');
      out.push('Cannot use the Grand Exchange.');
      out.push("Cannot pick up other players' drops.");
      out.push('Cannot accept raid items you did not help earn.');
      out.push('Cannot use the bank — inventory + equipment only.');
      break;
    case VARIANTS.group_ironman:
      out.push('Cannot trade with players outside your group.');
      out.push('Cannot use the Grand Exchange.');
      out.push("Cannot pick up drops from players outside your group.");
      out.push('Cannot accept raid items unless the raid is all group mates.');
      out.push(`Group capacity: up to ${GROUP_CAP} other members.`);
      break;
    default:
      out.push('Unknown variant.');
  }
  if (player.ironman.downgradedFrom) {
    out.push(`(Downgraded from ${VARIANT_LABELS[player.ironman.downgradedFrom] || player.ironman.downgradedFrom}.)`);
  }
  return out;
}

function labelFor(player) {
  const v = getVariant(player);
  return v ? (VARIANT_LABELS[v] || v) : 'Normal';
}

// ── GE hook registration ────────────────────────────────────────────────────
// ge-runner.js doesn't know about ironman. We install a tiny wrapper around
// its placeOffer so every GE offer runs through the ironman check first.
// The wrapper is idempotent; calling installGEHook() twice is safe.

let _geHookInstalled = false;

function installGEHook(geRunner) {
  if (_geHookInstalled || !geRunner || typeof geRunner.placeOffer !== 'function') return false;
  const original = geRunner.placeOffer;
  geRunner.placeOffer = function ironmanGuardedPlaceOffer(player, opts) {
    const check = canUseGE(player);
    if (!check.allowed) {
      return { ok: false, error: check.reason };
    }
    return original.call(this, player, opts);
  };
  _geHookInstalled = true;
  return true;
}

// ── Exports ─────────────────────────────────────────────────────────────────

module.exports = {
  // Enable / check.
  enableMode, isIronman, getVariant, isGroupMember, labelFor,

  // Restriction checks.
  canTrade, canUseGE, canLoot, canBank, canAcceptInvite,

  // Group management.
  groupAdd, groupRemove, groupLeave,

  // Death hook.
  onDeath,

  // Readable summaries.
  restrictionsFor,

  // Wiring.
  setTickSource, installGEHook,

  // Constants.
  VARIANTS, VARIANT_LABELS, LEGACY_MODE, GROUP_CAP,
};
