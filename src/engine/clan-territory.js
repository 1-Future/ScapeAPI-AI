// ══════════════════════════════════════════════════════════════════════════════
// Clan Territory Control
//
// Clans can claim sub-regions. Claiming a region grants:
//   - XP bonus for clan members in that territory (1-5%, scaling w/ hall tier)
//   - Exclusive daily tasks anchored to the region
//   - A tax on NPC shops the clan owns within the territory (configurable)
//
// Territories are contested by war declarations. A declaration opens a
// scheduled PvP window (default: 7 days out). During that window, members
// of either clan can fight to accumulate capture points. At the end, the
// clan with higher points holds/claims the region.
//
// Manifesto 10: territory bonuses are optional flavor. Solo players in the
// same region receive no penalty. The XP bonus is strictly additive for
// clan members; nothing is taken away from non-members.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const clan = require('./clan');
const events = require('./events');

// Regions are indexed by external id (string or number). The territory
// registry owns only (regionId -> owningClanId) and war state. Region
// geometry belongs to the world module.
const territories = new Map();   // regionId -> { clanId, claimedAt }
const wars = new Map();          // warId -> war spec
let nextWarId = 1;

const WAR_WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // 1 week
const WAR_DURATION_MS = 24 * 60 * 60 * 1000;   // 1 day of contested PvP
const XP_BONUS_BY_HALL_TIER = [0, 1, 2, 3, 4, 5]; // hall tier -> percent bonus

/**
 * claimTerritory(clanObj, regionId, by)
 * Can only claim an unclaimed region, and only if the clan has <= MAX_TERRITORIES.
 * Immediate: contested claims route through declareTerritoryWar().
 */
function claimTerritory(clanObj, regionId, by) {
  if (!clanObj || clanObj.disbanded) return { ok: false, error: 'Clan not found.' };
  if (!clan.canDo(clanObj, by, 'claimTerritory')) return { ok: false, error: 'Insufficient rank.' };
  if (!clanObj.settings.modules.territory) return { ok: false, error: 'Territory module disabled.' };
  if (clanObj.territory.length >= clan.MAX_TERRITORIES) {
    return { ok: false, error: `Max ${clan.MAX_TERRITORIES} territories reached.` };
  }
  const cur = territories.get(regionId);
  if (cur && cur.clanId !== clanObj.id) {
    return { ok: false, error: 'Region already claimed. Use declareTerritoryWar to contest.' };
  }
  if (cur && cur.clanId === clanObj.id) {
    return { ok: false, error: 'You already own this region.' };
  }
  territories.set(regionId, { clanId: clanObj.id, claimedAt: Date.now() });
  if (!clanObj.territory.includes(regionId)) clanObj.territory.push(regionId);
  events.emit('clan:territory_claimed', { clanId: clanObj.id, regionId });
  return { ok: true, regionId, clanId: clanObj.id };
}

/**
 * releaseTerritory(clanObj, regionId, by) — give up a region voluntarily.
 */
function releaseTerritory(clanObj, regionId, by) {
  if (!clanObj || clanObj.disbanded) return { ok: false, error: 'Clan not found.' };
  if (!clan.canDo(clanObj, by, 'claimTerritory')) return { ok: false, error: 'Insufficient rank.' };
  const cur = territories.get(regionId);
  if (!cur || cur.clanId !== clanObj.id) return { ok: false, error: 'You do not own this region.' };
  territories.delete(regionId);
  clanObj.territory = clanObj.territory.filter(r => r !== regionId);
  events.emit('clan:territory_released', { clanId: clanObj.id, regionId });
  return { ok: true };
}

/**
 * declareTerritoryWar(attackerClan, regionId, defenderClanId, by)
 * Schedules a PvP window against the current owner. The war fires after
 * WAR_WINDOW_MS. Both clans can accumulate capture points by winning
 * PvP skirmishes in the region during the war window.
 */
function declareTerritoryWar(attackerClan, regionId, defenderClanId, by) {
  if (!attackerClan || attackerClan.disbanded) return { ok: false, error: 'Clan not found.' };
  if (!clan.canDo(attackerClan, by, 'declareWar')) return { ok: false, error: 'Insufficient rank to declare war.' };
  const cur = territories.get(regionId);
  if (!cur) return { ok: false, error: 'Region is unclaimed. Use claimTerritory.' };
  if (cur.clanId === attackerClan.id) return { ok: false, error: 'Cannot attack your own territory.' };
  if (defenderClanId != null && cur.clanId !== defenderClanId) {
    return { ok: false, error: 'Defender does not own this region.' };
  }

  // One war per region at a time.
  for (const w of wars.values()) {
    if (w.regionId === regionId && !w.resolved) {
      return { ok: false, error: 'War already in progress for this region.' };
    }
  }

  const now = Date.now();
  const war = {
    id: nextWarId++,
    regionId,
    attackerId: attackerClan.id,
    defenderId: cur.clanId,
    declaredAt: now,
    scheduledStart: now + WAR_WINDOW_MS,
    scheduledEnd: now + WAR_WINDOW_MS + WAR_DURATION_MS,
    capturePoints: { attacker: 0, defender: 0 },
    resolved: false,
    winnerId: null,
  };
  wars.set(war.id, war);
  events.emit('clan:war_declared', { war });
  return { ok: true, war };
}

/**
 * recordWarKill(warId, killerClanId) — called by the PvP system during a war
 * window. Each kill awards 1 capture point to the killer's side.
 */
function recordWarKill(warId, killerClanId) {
  const war = wars.get(warId);
  if (!war) return { ok: false, error: 'War not found.' };
  if (war.resolved) return { ok: false, error: 'War already resolved.' };
  const now = Date.now();
  if (now < war.scheduledStart || now > war.scheduledEnd) {
    return { ok: false, error: 'War window not active.' };
  }
  if (killerClanId === war.attackerId) war.capturePoints.attacker += 1;
  else if (killerClanId === war.defenderId) war.capturePoints.defender += 1;
  else return { ok: false, error: 'Killer not in this war.' };
  return { ok: true, war };
}

/**
 * resolveWar(warId) — finalize the war. Called automatically when the window
 * ends (the server tick drives this). Winner takes the region; on tie, the
 * defender holds.
 */
function resolveWar(warId) {
  const war = wars.get(warId);
  if (!war) return { ok: false, error: 'War not found.' };
  if (war.resolved) return { ok: true, war };
  if (Date.now() < war.scheduledEnd) return { ok: false, error: 'War still active.' };

  const { attacker, defender } = war.capturePoints;
  const winnerId = attacker > defender ? war.attackerId : war.defenderId;
  war.resolved = true;
  war.winnerId = winnerId;

  const clanMod = clan; // reference clan module for mutation helpers
  if (winnerId === war.attackerId && winnerId !== war.defenderId) {
    // Transfer ownership.
    const attackerClan = clanMod.getById(war.attackerId);
    const defenderClan = clanMod.getById(war.defenderId);
    if (defenderClan) {
      defenderClan.territory = defenderClan.territory.filter(r => r !== war.regionId);
    }
    if (attackerClan) {
      territories.set(war.regionId, { clanId: attackerClan.id, claimedAt: Date.now() });
      if (!attackerClan.territory.includes(war.regionId)) attackerClan.territory.push(war.regionId);
      attackerClan.wins.wars = (attackerClan.wins.wars | 0) + 1;
    }
  } else {
    const defenderClan = clanMod.getById(war.defenderId);
    if (defenderClan) defenderClan.wins.wars = (defenderClan.wins.wars | 0) + 1;
  }

  events.emit('clan:war_resolved', { war });
  return { ok: true, war };
}

/**
 * tickWars() — sweep through wars and resolve those whose window has ended.
 * The server bootstrap should call this once per minute (or tick).
 */
function tickWars() {
  const resolved = [];
  for (const war of wars.values()) {
    if (!war.resolved && Date.now() >= war.scheduledEnd) {
      const res = resolveWar(war.id);
      if (res.ok) resolved.push(res.war);
    }
  }
  return resolved;
}

/**
 * getTerritoryOwner(regionId) — which clan owns this region, if any.
 */
function getTerritoryOwner(regionId) {
  const t = territories.get(regionId);
  return t ? t.clanId : null;
}

/**
 * getXPBonus(clanObj, regionId) — returns the percent XP bonus for members
 * of clanObj training in regionId. 0 if the clan doesn't own the region.
 */
function getXPBonus(clanObj, regionId) {
  if (!clanObj || !regionId) return 0;
  if (!clanObj.territory.includes(regionId)) return 0;
  const tier = Math.min((clanObj.hall && clanObj.hall.tier) | 0, XP_BONUS_BY_HALL_TIER.length - 1);
  return XP_BONUS_BY_HALL_TIER[tier] || 0;
}

/**
 * listTerritories() — all (regionId, clanId) pairs. Useful for world map rendering.
 */
function listTerritories() {
  const out = [];
  for (const [regionId, t] of territories) {
    out.push({ regionId, clanId: t.clanId, claimedAt: t.claimedAt });
  }
  return out;
}

function listWars() {
  return [...wars.values()];
}

function reset() {
  territories.clear();
  wars.clear();
  nextWarId = 1;
}

module.exports = {
  claimTerritory, releaseTerritory,
  declareTerritoryWar, recordWarKill, resolveWar, tickWars,
  getTerritoryOwner, getXPBonus, listTerritories, listWars,
  reset,
  _territories: territories, _wars: wars,
  WAR_WINDOW_MS, WAR_DURATION_MS,
};
