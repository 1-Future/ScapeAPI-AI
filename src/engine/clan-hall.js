// ══════════════════════════════════════════════════════════════════════════════
// Clan Hall / Citadel
//
// Upgradable clan hall rooms. Construction-skill gated. Each room at tier T
// costs coins + citadel resources + a construction skill level requirement.
// Rooms provide passive perks — XP multipliers, free teleports, clan-wide
// buffs, trophy display, resource accumulation for the citadel, etc.
//
// Room types:
//   treasury         — coins/item vault tiers; raises treasury.maxCoins cap
//   citadel          — resource accumulator for clan perks; weekly drip
//   training         — XP multiplier rooms (per-skill scoped)
//   portal           — free teleport destinations to clan territories
//   banquet          — triggers clan-wide timed buffs on use
//   trophy           — displays completed achievements and first-to-achieve
//
// All mutations are gated through clan.canDo(... editSettings) so low-rank
// members can enter/view the hall but cannot upgrade it.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const clan = require('./clan');
const events = require('./events');

// ── Room catalog ─────────────────────────────────────────────────────────────
// Each room has up to 5 tiers. Tier 0 = not built. Each tier lists cost and
// construction level required. Higher tiers grow exponentially.
const ROOMS = Object.freeze({
  treasury: {
    name: 'Treasury',
    description: 'Secure vault for clan coins and items. Higher tiers expand capacity.',
    tiers: [
      { tier: 1, coins: 100_000,    construction: 10, perk: 'Holds 1M coins'   },
      { tier: 2, coins: 500_000,    construction: 25, perk: 'Holds 10M coins'  },
      { tier: 3, coins: 2_500_000,  construction: 50, perk: 'Holds 100M coins' },
      { tier: 4, coins: 10_000_000, construction: 70, perk: 'Holds 1B coins'   },
      { tier: 5, coins: 50_000_000, construction: 90, perk: 'Holds unlimited'  },
    ],
  },
  citadel: {
    name: 'Citadel',
    description: 'Generates resources each week for clan-wide perks.',
    tiers: [
      { tier: 1, coins: 200_000,    construction: 20, perk: '100 resources/week' },
      { tier: 2, coins: 1_000_000,  construction: 40, perk: '500 resources/week' },
      { tier: 3, coins: 5_000_000,  construction: 60, perk: '2k resources/week'  },
      { tier: 4, coins: 20_000_000, construction: 80, perk: '10k resources/week' },
      { tier: 5, coins: 75_000_000, construction: 95, perk: '50k resources/week' },
    ],
  },
  training: {
    name: 'Training Grounds',
    description: 'XP multiplier for skills trained in-hall.',
    tiers: [
      { tier: 1, coins: 300_000,    construction: 25, perk: '+1% XP multiplier' },
      { tier: 2, coins: 1_500_000,  construction: 45, perk: '+2% XP multiplier' },
      { tier: 3, coins: 7_500_000,  construction: 65, perk: '+3% XP multiplier' },
      { tier: 4, coins: 25_000_000, construction: 80, perk: '+5% XP multiplier' },
      { tier: 5, coins: 80_000_000, construction: 95, perk: '+7% XP multiplier' },
    ],
  },
  portal: {
    name: 'Portal Room',
    description: 'Free teleports to clan-controlled territories.',
    tiers: [
      { tier: 1, coins: 500_000,    construction: 30, perk: '1 destination'  },
      { tier: 2, coins: 2_500_000,  construction: 55, perk: '3 destinations' },
      { tier: 3, coins: 10_000_000, construction: 75, perk: '5 destinations' },
    ],
  },
  banquet: {
    name: 'Banquet Hall',
    description: 'Activates a clan-wide buff for a limited time.',
    tiers: [
      { tier: 1, coins: 400_000,   construction: 35, perk: '5 min XP buff /day'  },
      { tier: 2, coins: 2_000_000, construction: 60, perk: '15 min XP buff /day' },
      { tier: 3, coins: 8_000_000, construction: 80, perk: '30 min XP buff /day' },
    ],
  },
  trophy: {
    name: 'Trophy Room',
    description: 'Displays clan achievements and firsts.',
    tiers: [
      { tier: 1, coins: 150_000,   construction: 15, perk: '10 trophy slots' },
      { tier: 2, coins: 750_000,   construction: 40, perk: '50 trophy slots' },
      { tier: 3, coins: 3_000_000, construction: 65, perk: 'unlimited slots' },
    ],
  },
});

const HALL_MAX_TIER = 5;
const HALL_UPGRADE_COSTS = [0, 500_000, 2_000_000, 8_000_000, 25_000_000, 100_000_000];

// ── Helpers ──────────────────────────────────────────────────────────────────
function findRoom(clanObj, type) {
  return (clanObj.hall.rooms || []).find(r => r.type === type) || null;
}

function getTierDef(type, tier) {
  const cat = ROOMS[type];
  if (!cat) return null;
  return cat.tiers.find(t => t.tier === tier) || null;
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * upgradeHall(clanObj, by) — upgrades the overall hall tier. Gated by rank
 * (editSettings) and by the coins available in the treasury.
 */
function upgradeHall(clanObj, by) {
  if (!clanObj || clanObj.disbanded) return { ok: false, error: 'Clan not found.' };
  if (!clan.canDo(clanObj, by, 'editSettings')) return { ok: false, error: 'Insufficient rank.' };
  const currentTier = clanObj.hall.tier;
  if (currentTier >= HALL_MAX_TIER) return { ok: false, error: 'Hall already at max tier.' };
  const cost = HALL_UPGRADE_COSTS[currentTier + 1];
  if (clanObj.treasury.coins < cost) {
    return { ok: false, error: `Treasury needs ${cost} coins (has ${clanObj.treasury.coins}).` };
  }
  clanObj.treasury.coins -= cost;
  clanObj.hall.tier += 1;
  events.emit('clan:hall_upgraded', { clanId: clanObj.id, tier: clanObj.hall.tier, cost });
  return { ok: true, tier: clanObj.hall.tier, cost };
}

/**
 * buildRoom(clanObj, type, by, { constructionLevel }) — constructs a tier-1
 * room of the given type. Requires enough construction level from the caller
 * (supplied by the server bootstrap — we don't know the skill system from here)
 * plus coins from the treasury. Rank-gated.
 */
function buildRoom(clanObj, type, by, opts) {
  if (!clanObj || clanObj.disbanded) return { ok: false, error: 'Clan not found.' };
  if (!clan.canDo(clanObj, by, 'editSettings')) return { ok: false, error: 'Insufficient rank.' };
  const cat = ROOMS[type];
  if (!cat) return { ok: false, error: `Unknown room type: ${type}.` };
  if (findRoom(clanObj, type)) return { ok: false, error: `Already built: ${cat.name}.` };

  const tierDef = cat.tiers[0];
  const constructionLevel = (opts && opts.constructionLevel) | 0;
  if (constructionLevel < tierDef.construction) {
    return { ok: false, error: `Construction ${tierDef.construction} required (you have ${constructionLevel}).` };
  }
  if (clanObj.treasury.coins < tierDef.coins) {
    return { ok: false, error: `Need ${tierDef.coins} coins in treasury.` };
  }
  clanObj.treasury.coins -= tierDef.coins;
  const room = { type, name: cat.name, tier: tierDef.tier, perk: tierDef.perk, builtAt: Date.now(), builtBy: by };
  clanObj.hall.rooms.push(room);
  events.emit('clan:room_built', { clanId: clanObj.id, room, by });
  return { ok: true, room };
}

/**
 * upgradeRoom(clanObj, type, by, { constructionLevel }) — upgrades a room
 * to the next tier. Same gates as build.
 */
function upgradeRoom(clanObj, type, by, opts) {
  if (!clanObj || clanObj.disbanded) return { ok: false, error: 'Clan not found.' };
  if (!clan.canDo(clanObj, by, 'editSettings')) return { ok: false, error: 'Insufficient rank.' };
  const cat = ROOMS[type];
  if (!cat) return { ok: false, error: `Unknown room type: ${type}.` };
  const room = findRoom(clanObj, type);
  if (!room) return { ok: false, error: `Not built: ${cat.name}.` };
  const nextDef = getTierDef(type, room.tier + 1);
  if (!nextDef) return { ok: false, error: `${cat.name} already at max tier.` };
  const constructionLevel = (opts && opts.constructionLevel) | 0;
  if (constructionLevel < nextDef.construction) {
    return { ok: false, error: `Construction ${nextDef.construction} required.` };
  }
  if (clanObj.treasury.coins < nextDef.coins) {
    return { ok: false, error: `Need ${nextDef.coins} coins in treasury.` };
  }
  clanObj.treasury.coins -= nextDef.coins;
  room.tier = nextDef.tier;
  room.perk = nextDef.perk;
  events.emit('clan:room_upgraded', { clanId: clanObj.id, room, by });
  return { ok: true, room };
}

/**
 * enterHall(clanObj, player) — checks that the player is a member and the
 * clan has at least a tier-1 hall. Doesn't move the player; the server
 * bootstrap decides how "entering" maps to world coordinates.
 */
function enterHall(clanObj, player) {
  if (!clanObj || clanObj.disbanded) return { ok: false, error: 'Clan not found.' };
  if (!clan.findMember(clanObj, player.id)) return { ok: false, error: 'Not a member.' };
  return { ok: true, tier: clanObj.hall.tier, rooms: clanObj.hall.rooms.slice() };
}

/**
 * accumulateCitadelResources(clanObj) — called by the tick loop once per
 * "clan week" (every CITADEL_WEEK_MS). Accumulates resources based on the
 * citadel room tier. Safe to call more often — it no-ops if lastReset is
 * within the same week.
 */
function accumulateCitadelResources(clanObj) {
  const now = Date.now();
  if (!clanObj.citadel) clanObj.citadel = { tier: 0, resources: {}, lastReset: now };
  if (now - clanObj.citadel.lastReset < 7 * 24 * 60 * 60 * 1000) return { ok: false, skipped: true };
  const room = findRoom(clanObj, 'citadel');
  if (!room) return { ok: false, skipped: true };
  const dropRate = [0, 100, 500, 2000, 10000, 50000][room.tier] || 0;
  clanObj.citadel.resources.raw = (clanObj.citadel.resources.raw || 0) + dropRate;
  clanObj.citadel.lastReset = now;
  clanObj.citadel.tier = room.tier;
  events.emit('clan:citadel_tick', { clanId: clanObj.id, resources: clanObj.citadel.resources });
  return { ok: true, resources: clanObj.citadel.resources };
}

/**
 * getXPBoost(clanObj) — returns the percent XP boost from the training-ground
 * room. 0 if no room is built. Used by the server's XP pipeline when a player
 * trains within a clan-controlled zone.
 */
function getXPBoost(clanObj) {
  const room = findRoom(clanObj, 'training');
  if (!room) return 0;
  return [0, 1, 2, 3, 5, 7][room.tier] || 0;
}

/**
 * listRooms(clanObj) — return a stable view of the hall's rooms and the
 * catalog so UIs can show costs for the next tier.
 */
function listRooms(clanObj) {
  const out = [];
  for (const type of Object.keys(ROOMS)) {
    const cat = ROOMS[type];
    const room = findRoom(clanObj, type);
    const nextTier = room ? room.tier + 1 : 1;
    const nextDef = getTierDef(type, nextTier);
    out.push({
      type,
      name: cat.name,
      description: cat.description,
      built: !!room,
      currentTier: room ? room.tier : 0,
      currentPerk: room ? room.perk : null,
      nextTier: nextDef ? nextDef.tier : null,
      nextCost: nextDef ? nextDef.coins : null,
      nextConstruction: nextDef ? nextDef.construction : null,
    });
  }
  return out;
}

module.exports = {
  upgradeHall, buildRoom, upgradeRoom, enterHall,
  accumulateCitadelResources, getXPBoost, listRooms,
  ROOMS, HALL_MAX_TIER, HALL_UPGRADE_COSTS,
};
