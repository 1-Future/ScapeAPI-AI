// ══════════════════════════════════════════════════════════════════════════════
// Clan System — Core
//
// Manifesto 10 (solo-first): clans are entirely optional. Every clan feature
// augments play; no content is gated behind clan membership. A solo player
// has identical access to the world, skills, quests, and bosses as a clan
// member. The only thing the clan grants is optional social scaffolding:
// shared treasury, halls, territory bonuses, events.
//
// Anti-grief: destructive actions (kick, demote, transfer ownership, disband,
// treasury withdraw) are rank-gated. Promotions to General and above require
// two yes-votes from General+ (owner's vote counts + one other officer).
//
// Data model:
//   Clan {
//     id, name, motto, founder, foundedAt,
//     members: [{ playerId, rank, joinedAt, contributionPoints }],
//     ranks: [...],
//     hall: { tier, rooms: [...] },
//     treasury: { coins, items: [] },
//     territory: [regionIds],
//     citadel: { tier, resources: {...}, lastReset },
//     events: [active + history],
//     bingo: active | null,
//     achievements: [...],
//     invites: { [playerId]: inviterPlayerId },
//     pendingPromotions: { [playerId]: { targetRank, votes: Set<voterId>, issuedBy, issuedAt } }
//   }
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const persistence = require('./persistence');
const events = require('./events');

// ── Constants ────────────────────────────────────────────────────────────────
const RANKS = Object.freeze([
  'Recruit',    // 0
  'Member',     // 1
  'Corporal',   // 2
  'Sergeant',   // 3
  'Lieutenant', // 4
  'Captain',    // 5
  'General',    // 6
  'Admin',      // 7
  'Owner',      // 8
]);

const RANK_INDEX = Object.freeze(Object.fromEntries(RANKS.map((r, i) => [r, i])));

// Minimum rank to perform each destructive/privileged action.
const RANK_GATES = Object.freeze({
  invite:            RANK_INDEX.Corporal,
  kick:              RANK_INDEX.Sergeant,
  promote:           RANK_INDEX.Lieutenant,
  demote:            RANK_INDEX.Lieutenant,
  withdrawTreasury:  RANK_INDEX.Captain,
  createEvent:       RANK_INDEX.Sergeant,
  startBingo:        RANK_INDEX.Lieutenant,
  claimTerritory:    RANK_INDEX.General,
  declareWar:        RANK_INDEX.General,
  disband:           RANK_INDEX.Owner,
  transferOwnership: RANK_INDEX.Owner,
  editSettings:      RANK_INDEX.General,
  lendItem:          RANK_INDEX.Member,
});

// Rank at or above which two votes are required to promote to General+.
const VOTE_REQUIRED_RANK = RANK_INDEX.General;

const MAX_MEMBERS_DEFAULT = 500;
const MAX_TERRITORIES = 3;
const MAX_CLAN_NAME_LEN = 32;
const MAX_MOTTO_LEN = 128;

const CITADEL_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// ── State ────────────────────────────────────────────────────────────────────
const clans = new Map();        // clanId -> clan object
const playerIndex = new Map();  // playerId -> clanId (single-clan membership)
let nextClanId = 1;

// ── Utilities ────────────────────────────────────────────────────────────────
function sanitizeString(s, maxLen) {
  if (typeof s !== 'string') return '';
  return s.replace(/[\x00-\x1f\x7f]/g, '').slice(0, maxLen).trim();
}

function now() { return Date.now(); }

function findMember(clan, playerId) {
  if (!clan || !clan.members) return null;
  return clan.members.find(m => m.playerId === playerId) || null;
}

function memberRankIndex(clan, playerId) {
  const m = findMember(clan, playerId);
  if (!m) return -1;
  const idx = RANK_INDEX[m.rank];
  return typeof idx === 'number' ? idx : -1;
}

function canDo(clan, playerId, action) {
  const gate = RANK_GATES[action];
  if (gate === undefined) return false;
  const rank = memberRankIndex(clan, playerId);
  return rank >= gate;
}

function requiresVote(targetRank) {
  const idx = typeof targetRank === 'number' ? targetRank : RANK_INDEX[targetRank];
  return idx >= VOTE_REQUIRED_RANK;
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * createClan(leader, name, motto) — creates a clan with leader as Owner.
 * Returns { ok, clan } or { ok:false, error }.
 */
function createClan(leader, name, motto) {
  if (!leader || leader.id == null) return { ok: false, error: 'No leader.' };
  if (playerIndex.has(leader.id)) return { ok: false, error: 'Already in a clan.' };

  const cleanName = sanitizeString(name, MAX_CLAN_NAME_LEN);
  if (cleanName.length < 3) return { ok: false, error: 'Clan name must be at least 3 chars.' };
  for (const c of clans.values()) {
    if (c.name.toLowerCase() === cleanName.toLowerCase()) {
      return { ok: false, error: 'Clan name taken.' };
    }
  }

  const clan = {
    id: nextClanId++,
    name: cleanName,
    motto: sanitizeString(motto || '', MAX_MOTTO_LEN),
    founder: leader.id,
    foundedAt: now(),
    members: [
      { playerId: leader.id, playerName: leader.name || `player:${leader.id}`,
        rank: 'Owner', joinedAt: now(), contributionPoints: 0, lastActive: now() },
    ],
    ranks: RANKS.slice(),
    hall: { tier: 1, rooms: [] },
    treasury: { coins: 0, items: [] },
    territory: [],
    citadel: { tier: 0, resources: {}, lastReset: now() },
    events: [],
    bingo: null,
    achievements: [],
    invites: {},
    pendingPromotions: {},
    settings: {
      recruitmentStatus: 'Invite-Only', // Open | Application | Invite-Only | Closed
      memberCap: MAX_MEMBERS_DEFAULT,
      modules: {
        ranks: true, hall: true, coffer: true, bank: true,
        tax: false, events: true, achievements: true, avatar: false,
        wars: true, alliances: false, multiClan: false, broadcasting: true,
        polls: true, rankedWars: false, salary: false, autoRank: false,
        territory: true, guildFinder: true, subGroups: false,
        progression: true, contributionTracking: true, guildCrafting: false,
        lending: true, donations: true, proximityXP: false,
      },
    },
    lending: [],      // active loans
    donationTotals: {}, // playerId -> lifetime donated coins+item-value
    wins: { wars: 0, bingo: 0 },
    createdTick: now(),
    disbanded: false,
  };
  clans.set(clan.id, clan);
  playerIndex.set(leader.id, clan.id);
  events.emit('clan:created', { clan: snapshotClan(clan), leader });
  return { ok: true, clan };
}

/**
 * invite(clan, playerId, by) — create an invite for playerId, issued by `by`.
 */
function invite(clan, playerId, by) {
  if (!clan || clan.disbanded) return { ok: false, error: 'Clan not found.' };
  if (!canDo(clan, by, 'invite')) return { ok: false, error: 'Insufficient rank to invite.' };
  if (findMember(clan, playerId)) return { ok: false, error: 'Player already a member.' };
  if (playerIndex.has(playerId)) return { ok: false, error: 'Player already in a clan.' };
  if (clan.members.length >= clan.settings.memberCap) return { ok: false, error: 'Clan at member cap.' };
  clan.invites[playerId] = { by, at: now() };
  events.emit('clan:invite', { clanId: clan.id, playerId, by });
  return { ok: true, clanId: clan.id, playerId };
}

/**
 * accept(player, clanId) — player accepts an outstanding invite.
 */
function accept(player, clanId) {
  if (!player || player.id == null) return { ok: false, error: 'No player.' };
  if (playerIndex.has(player.id)) return { ok: false, error: 'Already in a clan.' };
  const clan = clans.get(clanId);
  if (!clan || clan.disbanded) return { ok: false, error: 'Clan not found.' };
  if (!clan.invites[player.id] && clan.settings.recruitmentStatus !== 'Open') {
    return { ok: false, error: 'No invite.' };
  }
  if (clan.members.length >= clan.settings.memberCap) return { ok: false, error: 'Clan at member cap.' };

  clan.members.push({
    playerId: player.id,
    playerName: player.name || `player:${player.id}`,
    rank: 'Recruit',
    joinedAt: now(),
    contributionPoints: 0,
    lastActive: now(),
  });
  delete clan.invites[player.id];
  playerIndex.set(player.id, clan.id);
  events.emit('clan:joined', { clanId: clan.id, playerId: player.id });
  return { ok: true, clan };
}

/**
 * leave(player) — voluntarily leaves the clan.
 * If the player is Owner, ownership must be transferred first, or the
 * clan is automatically disbanded (Owner is the last member) or passes
 * to the highest-ranking other member.
 */
function leave(player) {
  if (!player || player.id == null) return { ok: false, error: 'No player.' };
  const clanId = playerIndex.get(player.id);
  if (!clanId) return { ok: false, error: 'Not in a clan.' };
  const clan = clans.get(clanId);
  if (!clan) return { ok: false, error: 'Clan not found.' };
  const m = findMember(clan, player.id);
  if (!m) return { ok: false, error: 'Not a member.' };

  if (m.rank === 'Owner') {
    // Auto-transfer to highest ranking other member, else disband.
    const others = clan.members.filter(x => x.playerId !== player.id);
    if (others.length === 0) {
      clan.disbanded = true;
      playerIndex.delete(player.id);
      events.emit('clan:disbanded', { clanId: clan.id });
      return { ok: true, disbanded: true };
    }
    others.sort((a, b) => memberRankIndex(clan, b.playerId) - memberRankIndex(clan, a.playerId));
    others[0].rank = 'Owner';
    events.emit('clan:ownership_auto', { clanId: clan.id, newOwner: others[0].playerId });
  }
  clan.members = clan.members.filter(x => x.playerId !== player.id);
  playerIndex.delete(player.id);
  events.emit('clan:left', { clanId: clan.id, playerId: player.id });
  return { ok: true };
}

/**
 * kick(clan, targetId, by) — destructive; rank-gated.
 */
function kick(clan, targetId, by) {
  if (!clan || clan.disbanded) return { ok: false, error: 'Clan not found.' };
  if (!canDo(clan, by, 'kick')) return { ok: false, error: 'Insufficient rank to kick.' };
  if (targetId === by) return { ok: false, error: 'Cannot kick yourself.' };
  const byIdx = memberRankIndex(clan, by);
  const tgtIdx = memberRankIndex(clan, targetId);
  if (tgtIdx < 0) return { ok: false, error: 'Target not in clan.' };
  if (tgtIdx >= byIdx) return { ok: false, error: 'Cannot kick equal or higher rank.' };
  const m = findMember(clan, targetId);
  if (m.rank === 'Owner') return { ok: false, error: 'Cannot kick the Owner.' };
  clan.members = clan.members.filter(x => x.playerId !== targetId);
  playerIndex.delete(targetId);
  events.emit('clan:kicked', { clanId: clan.id, playerId: targetId, by });
  return { ok: true };
}

/**
 * promote(clan, targetId, by) — bump target by +1 rank.
 * If the new rank is >= General, requires two votes total (two-vote gate).
 * The first promote() call issues a pending promotion; the second caller
 * (who must be General+) finalizes it.
 */
function promote(clan, targetId, by) {
  if (!clan || clan.disbanded) return { ok: false, error: 'Clan not found.' };
  if (!canDo(clan, by, 'promote')) return { ok: false, error: 'Insufficient rank to promote.' };
  if (targetId === by) return { ok: false, error: 'Cannot promote yourself.' };
  const byIdx = memberRankIndex(clan, by);
  const tgtIdx = memberRankIndex(clan, targetId);
  if (tgtIdx < 0) return { ok: false, error: 'Target not in clan.' };
  if (tgtIdx >= byIdx) return { ok: false, error: 'Cannot promote to equal or higher rank.' };
  const newIdx = tgtIdx + 1;
  if (newIdx >= RANKS.length) return { ok: false, error: 'Already max rank.' };
  // Cannot create a second Owner via promote.
  if (RANKS[newIdx] === 'Owner') return { ok: false, error: 'Use transferOwnership.' };

  // Two-vote gate for General+ promotions.
  if (requiresVote(newIdx)) {
    const byRankIdx = memberRankIndex(clan, by);
    if (byRankIdx < VOTE_REQUIRED_RANK) {
      return { ok: false, error: 'Promotion to General+ requires a General or above to initiate.' };
    }
    const pending = clan.pendingPromotions[targetId];
    if (!pending) {
      clan.pendingPromotions[targetId] = {
        targetRank: RANKS[newIdx],
        votes: [by],
        issuedBy: by,
        issuedAt: now(),
      };
      events.emit('clan:promotion_pending', { clanId: clan.id, targetId, rank: RANKS[newIdx], by });
      return { ok: true, pending: true, needsVotes: 1 };
    }
    // Don't allow same voter twice.
    if (pending.votes.includes(by)) return { ok: false, error: 'You already voted.' };
    if (pending.targetRank !== RANKS[newIdx]) {
      return { ok: false, error: 'Pending promotion is for a different rank.' };
    }
    pending.votes.push(by);
    if (pending.votes.length >= 2) {
      const m = findMember(clan, targetId);
      m.rank = RANKS[newIdx];
      delete clan.pendingPromotions[targetId];
      events.emit('clan:promoted', { clanId: clan.id, targetId, rank: RANKS[newIdx] });
      return { ok: true, promoted: true, rank: RANKS[newIdx] };
    }
    return { ok: true, pending: true, needsVotes: 2 - pending.votes.length };
  }

  // Simple promote path (below General).
  const m = findMember(clan, targetId);
  m.rank = RANKS[newIdx];
  events.emit('clan:promoted', { clanId: clan.id, targetId, rank: RANKS[newIdx] });
  return { ok: true, promoted: true, rank: RANKS[newIdx] };
}

/**
 * demote(clan, targetId, by) — drop target by -1 rank.
 */
function demote(clan, targetId, by) {
  if (!clan || clan.disbanded) return { ok: false, error: 'Clan not found.' };
  if (!canDo(clan, by, 'demote')) return { ok: false, error: 'Insufficient rank to demote.' };
  if (targetId === by) return { ok: false, error: 'Cannot demote yourself.' };
  const byIdx = memberRankIndex(clan, by);
  const tgtIdx = memberRankIndex(clan, targetId);
  if (tgtIdx < 0) return { ok: false, error: 'Target not in clan.' };
  if (tgtIdx >= byIdx) return { ok: false, error: 'Cannot demote equal or higher rank.' };
  if (tgtIdx === 0) return { ok: false, error: 'Already lowest rank.' };
  const m = findMember(clan, targetId);
  m.rank = RANKS[tgtIdx - 1];
  events.emit('clan:demoted', { clanId: clan.id, targetId, rank: RANKS[tgtIdx - 1] });
  return { ok: true, rank: RANKS[tgtIdx - 1] };
}

/**
 * transferOwnership(clan, newOwnerId, by) — Owner-only.
 */
function transferOwnership(clan, newOwnerId, by) {
  if (!clan || clan.disbanded) return { ok: false, error: 'Clan not found.' };
  if (!canDo(clan, by, 'transferOwnership')) return { ok: false, error: 'Only the Owner can transfer.' };
  if (newOwnerId === by) return { ok: false, error: 'Already owner.' };
  const target = findMember(clan, newOwnerId);
  if (!target) return { ok: false, error: 'Target not in clan.' };
  const oldOwner = findMember(clan, by);
  oldOwner.rank = 'Admin';
  target.rank = 'Owner';
  events.emit('clan:ownership_transferred', { clanId: clan.id, from: by, to: newOwnerId });
  return { ok: true };
}

/**
 * donate(player, payload) — adds coins or items to the clan treasury.
 * payload: { coins?: number, item?: { id, name, qty } }
 * Updates the player's lifetime donationTotals for contribution tracking.
 */
function donate(player, payload) {
  if (!player || player.id == null) return { ok: false, error: 'No player.' };
  const clanId = playerIndex.get(player.id);
  if (!clanId) return { ok: false, error: 'Not in a clan.' };
  const clan = clans.get(clanId);
  if (!clan || clan.disbanded) return { ok: false, error: 'Clan not found.' };
  if (!clan.settings.modules.donations) return { ok: false, error: 'Donations disabled.' };

  payload = payload || {};
  const coins = (payload.coins | 0);
  const item = payload.item || null;

  if (coins > 0) {
    clan.treasury.coins += coins;
    clan.donationTotals[player.id] = (clan.donationTotals[player.id] || 0) + coins;
    const m = findMember(clan, player.id);
    if (m) m.contributionPoints += Math.max(1, Math.floor(coins / 1000));
  }
  if (item && item.id != null) {
    const qty = Math.max(1, item.qty | 0);
    clan.treasury.items.push({ id: item.id, name: item.name || `item:${item.id}`, qty, donor: player.id, at: now() });
    const m = findMember(clan, player.id);
    if (m) m.contributionPoints += qty;
  }
  events.emit('clan:donation', { clanId: clan.id, playerId: player.id, coins, item });
  return { ok: true, treasury: { coins: clan.treasury.coins, items: clan.treasury.items.length } };
}

/**
 * withdraw(player, payload) — rank-gated treasury withdrawal.
 * payload: { coins?, itemIndex? }
 * Returns a refund object describing what the caller should grant to the player.
 */
function withdraw(player, payload) {
  if (!player || player.id == null) return { ok: false, error: 'No player.' };
  const clanId = playerIndex.get(player.id);
  if (!clanId) return { ok: false, error: 'Not in a clan.' };
  const clan = clans.get(clanId);
  if (!clan || clan.disbanded) return { ok: false, error: 'Clan not found.' };
  if (!canDo(clan, player.id, 'withdrawTreasury')) {
    return { ok: false, error: 'Insufficient rank to withdraw from treasury.' };
  }

  payload = payload || {};
  const coins = Math.max(0, payload.coins | 0);
  const itemIndex = payload.itemIndex;

  let payout = { coins: 0, items: [] };
  if (coins > 0) {
    if (clan.treasury.coins < coins) return { ok: false, error: 'Treasury has insufficient coins.' };
    clan.treasury.coins -= coins;
    payout.coins = coins;
  }
  if (typeof itemIndex === 'number') {
    if (itemIndex < 0 || itemIndex >= clan.treasury.items.length) {
      return { ok: false, error: 'No such item.' };
    }
    const item = clan.treasury.items.splice(itemIndex, 1)[0];
    payout.items.push(item);
  }
  events.emit('clan:withdraw', { clanId: clan.id, playerId: player.id, payout });
  return { ok: true, payout };
}

/**
 * getByPlayer(playerId) -> clan or null
 */
function getByPlayer(playerId) {
  const cid = playerIndex.get(playerId);
  if (!cid) return null;
  return clans.get(cid) || null;
}

function getById(clanId) { return clans.get(clanId) || null; }
function listClans() { return [...clans.values()].filter(c => !c.disbanded); }

// ── Persistence ──────────────────────────────────────────────────────────────
function snapshotClan(clan) {
  return {
    id: clan.id,
    name: clan.name,
    motto: clan.motto,
    founder: clan.founder,
    foundedAt: clan.foundedAt,
    members: clan.members.slice(),
    ranks: clan.ranks.slice(),
    hall: { tier: clan.hall.tier, rooms: clan.hall.rooms.slice() },
    treasury: { coins: clan.treasury.coins, items: clan.treasury.items.slice() },
    territory: clan.territory.slice(),
    citadel: { ...clan.citadel },
    events: clan.events.slice(),
    bingo: clan.bingo ? { ...clan.bingo } : null,
    achievements: clan.achievements.slice(),
    settings: JSON.parse(JSON.stringify(clan.settings)),
    wins: { ...clan.wins },
    donationTotals: { ...clan.donationTotals },
    disbanded: clan.disbanded,
  };
}

function serialize() {
  const arr = [];
  for (const c of clans.values()) arr.push(snapshotClan(c));
  return { version: 1, nextClanId, clans: arr };
}

function deserialize(data) {
  reset();
  if (!data) return;
  if (data.nextClanId) nextClanId = data.nextClanId;
  if (Array.isArray(data.clans)) {
    for (const raw of data.clans) {
      const clan = {
        id: raw.id,
        name: raw.name,
        motto: raw.motto || '',
        founder: raw.founder,
        foundedAt: raw.foundedAt,
        members: raw.members || [],
        ranks: raw.ranks || RANKS.slice(),
        hall: raw.hall || { tier: 1, rooms: [] },
        treasury: raw.treasury || { coins: 0, items: [] },
        territory: raw.territory || [],
        citadel: raw.citadel || { tier: 0, resources: {}, lastReset: now() },
        events: raw.events || [],
        bingo: raw.bingo || null,
        achievements: raw.achievements || [],
        invites: raw.invites || {},
        pendingPromotions: raw.pendingPromotions || {},
        settings: raw.settings || { recruitmentStatus: 'Invite-Only', memberCap: MAX_MEMBERS_DEFAULT, modules: {} },
        lending: raw.lending || [],
        donationTotals: raw.donationTotals || {},
        wins: raw.wins || { wars: 0, bingo: 0 },
        disbanded: !!raw.disbanded,
      };
      clans.set(clan.id, clan);
      if (!clan.disbanded) {
        for (const m of clan.members) playerIndex.set(m.playerId, clan.id);
      }
    }
  }
}

function reset() {
  clans.clear();
  playerIndex.clear();
  nextClanId = 1;
}

function save() { persistence.save('clans.json', serialize()); }
function load() { deserialize(persistence.load('clans.json', null)); }

// Auto-register save handler (guarded so the test harness can opt out).
if (persistence && typeof persistence.onSave === 'function') {
  persistence.onSave('clan', save);
}

// ── Exports ──────────────────────────────────────────────────────────────────
module.exports = {
  // Main API.
  createClan, invite, accept, leave, kick,
  promote, demote, transferOwnership,
  donate, withdraw,
  getByPlayer, getById, listClans,

  // Persistence.
  save, load, serialize, deserialize, reset,

  // Helpers (exported for sibling modules to share clan-state access).
  findMember, memberRankIndex, canDo, snapshotClan, requiresVote,

  // Constants.
  RANKS, RANK_INDEX, RANK_GATES,
  MAX_MEMBERS_DEFAULT, MAX_TERRITORIES, VOTE_REQUIRED_RANK,

  // Internal accessors (sibling modules).
  _clans: clans, _playerIndex: playerIndex,
};
