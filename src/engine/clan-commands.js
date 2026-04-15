// ══════════════════════════════════════════════════════════════════════════════
// Clan — Chat Commands
//
// Installs the `/clan` command family without modifying src/commands/all.js
// or src/server.js. Wires the four clan modules together through the shared
// engine command registry.
//
// Usage from server bootstrap:
//
//   const clanCommands = require('./engine/clan-commands');
//   clanCommands.register({
//     commands,                   // src/engine/commands.js
//     findPlayer,                 // (name|id) => player (required for invite/promote by name)
//     invAdd, invRemove, invCount,// inventory hooks so treasury donate/withdraw can move coins/items
//     getConstructionLevel,       // (player) => int (optional; default 99)
//     tick,                       // { onTick(id, fn) } optional — drives citadel + war resolution
//   });
//
// Commands installed:
//   /clan create <name> [motto...]
//   /clan invite <player>
//   /clan accept <clanId>
//   /clan leave
//   /clan kick <player>
//   /clan promote <player>
//   /clan demote <player>
//   /clan transfer <player>
//   /clan donate <coins|item>
//   /clan withdraw <coins|item-slot>
//   /clan status
//   /clan members
//   /clan hall enter | list | upgrade | build <room> | upgrade <room>
//   /clan bingo start [5|7] | status | claim <tileId> | end
//   /clan territory claim <region> | release <region> | declare <region>
//   /clan event create <name...> | join <id> | list
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const clan = require('./clan');
const hall = require('./clan-hall');
const bingo = require('./clan-bingo');
const territory = require('./clan-territory');

function fmt(n) {
  if (typeof n !== 'number') return String(n);
  if (n >= 1_000_000) return `${Math.floor(n / 1_000_000)}M`;
  if (n >= 1_000) return `${Math.floor(n / 1_000)}K`;
  return String(n);
}

function resolvePlayerRef(findPlayer, ref) {
  if (!findPlayer) return null;
  // Accept numeric id or name.
  const n = parseInt(ref, 10);
  if (!isNaN(n)) {
    const p = findPlayer(n);
    if (p) return p;
  }
  return findPlayer(ref);
}

function register(opts) {
  const commands = opts && opts.commands;
  if (!commands) throw new Error('clan-commands.register: commands module required');

  const findPlayer = typeof opts.findPlayer === 'function' ? opts.findPlayer : null;
  const invAdd = typeof opts.invAdd === 'function' ? opts.invAdd : () => false;
  const invRemove = typeof opts.invRemove === 'function' ? opts.invRemove : () => false;
  const invCount = typeof opts.invCount === 'function' ? opts.invCount : () => 0;
  const getConstructionLevel = typeof opts.getConstructionLevel === 'function'
    ? opts.getConstructionLevel : () => 99;

  commands.register('clan', {
    help: 'Clan system: create, invite, hall, bingo, territory, events.',
    category: 'Social',
    aliases: ['guild'],
    fn: (p, args) => {
      const sub = (args[0] || '').toLowerCase();

      if (!sub) return usage();

      // ── create ──────────────────────────────────────────────────────────
      if (sub === 'create') {
        const name = args[1];
        if (!name) return 'Usage: clan create <name> [motto...]';
        const motto = args.slice(2).join(' ');
        const res = clan.createClan(p, name, motto);
        if (!res.ok) return res.error;
        return `Clan "${res.clan.name}" founded (id ${res.clan.id}). You are Owner.`;
      }

      // ── join / accept / leave ───────────────────────────────────────────
      if (sub === 'accept' || sub === 'join') {
        const cid = parseInt(args[1], 10);
        if (isNaN(cid)) return 'Usage: clan accept <clanId>';
        const res = clan.accept(p, cid);
        if (!res.ok) return res.error;
        return `Joined ${res.clan.name}.`;
      }
      if (sub === 'leave') {
        const res = clan.leave(p);
        if (!res.ok) return res.error;
        return res.disbanded ? 'Left the clan. The clan has been disbanded.' : 'Left the clan.';
      }

      // All further commands require clan membership.
      const myClan = clan.getByPlayer(p.id);
      if (!myClan) return 'You are not in a clan. Use: clan create <name>';

      // ── invite ──────────────────────────────────────────────────────────
      if (sub === 'invite') {
        const ref = args[1];
        if (!ref) return 'Usage: clan invite <player>';
        const target = resolvePlayerRef(findPlayer, ref);
        if (!target) return `Player not found: ${ref}.`;
        const res = clan.invite(myClan, target.id, p.id);
        if (!res.ok) return res.error;
        return `Invited ${target.name || target.id} to ${myClan.name}.`;
      }

      // ── kick ────────────────────────────────────────────────────────────
      if (sub === 'kick') {
        const ref = args[1];
        if (!ref) return 'Usage: clan kick <player>';
        const target = resolvePlayerRef(findPlayer, ref);
        if (!target) return `Player not found: ${ref}.`;
        const res = clan.kick(myClan, target.id, p.id);
        if (!res.ok) return res.error;
        return `Kicked ${target.name || target.id}.`;
      }

      // ── promote / demote ────────────────────────────────────────────────
      if (sub === 'promote') {
        const ref = args[1];
        if (!ref) return 'Usage: clan promote <player>';
        const target = resolvePlayerRef(findPlayer, ref);
        if (!target) return `Player not found: ${ref}.`;
        const res = clan.promote(myClan, target.id, p.id);
        if (!res.ok) return res.error;
        if (res.pending) return `Promotion pending — ${res.needsVotes} more vote(s) from General+ required.`;
        return `Promoted ${target.name || target.id} to ${res.rank}.`;
      }
      if (sub === 'demote') {
        const ref = args[1];
        if (!ref) return 'Usage: clan demote <player>';
        const target = resolvePlayerRef(findPlayer, ref);
        if (!target) return `Player not found: ${ref}.`;
        const res = clan.demote(myClan, target.id, p.id);
        if (!res.ok) return res.error;
        return `Demoted ${target.name || target.id} to ${res.rank}.`;
      }

      // ── transfer ownership ──────────────────────────────────────────────
      if (sub === 'transfer') {
        const ref = args[1];
        if (!ref) return 'Usage: clan transfer <player>';
        const target = resolvePlayerRef(findPlayer, ref);
        if (!target) return `Player not found: ${ref}.`;
        const res = clan.transferOwnership(myClan, target.id, p.id);
        if (!res.ok) return res.error;
        return `Ownership transferred to ${target.name || target.id}.`;
      }

      // ── donate / withdraw ──────────────────────────────────────────────
      if (sub === 'donate') {
        const amount = parseInt(args[1], 10);
        if (isNaN(amount) || amount <= 0) return 'Usage: clan donate <coins>';
        if (invCount(p, 101) < amount) return `You do not have ${amount} coins.`;
        if (!invRemove(p, 101, amount)) return 'Failed to remove coins.';
        const res = clan.donate(p, { coins: amount });
        if (!res.ok) { invAdd(p, 101, 'Coins', amount, true); return res.error; }
        return `Donated ${fmt(amount)} coins. Treasury: ${fmt(myClan.treasury.coins)} coins.`;
      }
      if (sub === 'withdraw') {
        const amount = parseInt(args[1], 10);
        if (isNaN(amount) || amount <= 0) return 'Usage: clan withdraw <coins>';
        const res = clan.withdraw(p, { coins: amount });
        if (!res.ok) return res.error;
        invAdd(p, 101, 'Coins', res.payout.coins, true);
        return `Withdrew ${fmt(res.payout.coins)} coins.`;
      }

      // ── status / members ────────────────────────────────────────────────
      if (sub === 'status' || sub === 'info') {
        const lines = [];
        lines.push(`── ${myClan.name} (id ${myClan.id}) ──`);
        if (myClan.motto) lines.push(`  "${myClan.motto}"`);
        lines.push(`  Founded: ${new Date(myClan.foundedAt).toISOString().slice(0, 10)}`);
        lines.push(`  Members: ${myClan.members.length}/${myClan.settings.memberCap}`);
        lines.push(`  Hall tier: ${myClan.hall.tier}   Rooms: ${myClan.hall.rooms.length}`);
        lines.push(`  Treasury: ${fmt(myClan.treasury.coins)} coins + ${myClan.treasury.items.length} items`);
        lines.push(`  Territory: ${myClan.territory.length} regions`);
        lines.push(`  Wins: ${myClan.wins.wars} wars, ${myClan.wins.bingo} bingos`);
        const m = clan.findMember(myClan, p.id);
        if (m) lines.push(`  Your rank: ${m.rank}   Contribution: ${m.contributionPoints}`);
        return lines.join('\n');
      }
      if (sub === 'members') {
        const lines = ['── Members ──'];
        const sorted = myClan.members.slice().sort((a, b) =>
          clan.memberRankIndex(myClan, b.playerId) - clan.memberRankIndex(myClan, a.playerId));
        for (const m of sorted) {
          lines.push(`  [${m.rank}] ${m.playerName || m.playerId}   CP:${m.contributionPoints}`);
        }
        return lines.join('\n');
      }

      // ── hall ────────────────────────────────────────────────────────────
      if (sub === 'hall') {
        const sub2 = (args[1] || '').toLowerCase();
        if (sub2 === 'enter' || !sub2) {
          const res = hall.enterHall(myClan, p);
          if (!res.ok) return res.error;
          return `Entered the ${myClan.name} hall (tier ${res.tier}, ${res.rooms.length} rooms).`;
        }
        if (sub2 === 'list' || sub2 === 'rooms') {
          const rooms = hall.listRooms(myClan);
          const lines = ['── Hall Rooms ──'];
          for (const r of rooms) {
            const state = r.built ? `tier ${r.currentTier} — ${r.currentPerk}` : 'not built';
            const next = r.nextCost ? `next: tier ${r.nextTier} @ ${fmt(r.nextCost)} coins, construction ${r.nextConstruction}` : 'maxed';
            lines.push(`  ${r.type.padEnd(10)} ${r.name.padEnd(18)} ${state}    ${next}`);
          }
          return lines.join('\n');
        }
        if (sub2 === 'upgrade' && !args[2]) {
          const res = hall.upgradeHall(myClan, p.id);
          if (!res.ok) return res.error;
          return `Hall upgraded to tier ${res.tier} for ${fmt(res.cost)} coins.`;
        }
        if (sub2 === 'build') {
          const type = (args[2] || '').toLowerCase();
          if (!type) return 'Usage: clan hall build <room>';
          const res = hall.buildRoom(myClan, type, p.id, { constructionLevel: getConstructionLevel(p) });
          if (!res.ok) return res.error;
          return `Built ${res.room.name} (tier ${res.room.tier}): ${res.room.perk}`;
        }
        if (sub2 === 'upgrade' && args[2]) {
          const type = (args[2] || '').toLowerCase();
          const res = hall.upgradeRoom(myClan, type, p.id, { constructionLevel: getConstructionLevel(p) });
          if (!res.ok) return res.error;
          return `Upgraded ${res.room.name} to tier ${res.room.tier}: ${res.room.perk}`;
        }
        return 'Usage: clan hall enter | list | upgrade | build <room> | upgrade <room>';
      }

      // ── bingo ───────────────────────────────────────────────────────────
      if (sub === 'bingo') {
        const sub2 = (args[1] || '').toLowerCase();
        if (sub2 === 'start') {
          const size = parseInt(args[2], 10) || 5;
          const res = bingo.startBingo(myClan, p.id, { size, tiles: [], prize: { coins: 100_000 } });
          if (!res.ok) return res.error;
          return `Started ${size}x${size} bingo. Configure tiles via the admin UI.`;
        }
        if (sub2 === 'status' || !sub2) {
          const st = bingo.bingoStatus(myClan);
          if (!st.active) return 'No active bingo.';
          return `Bingo ${st.size}x${st.size}: ${st.claimed}/${st.total} tiles claimed. Line won: ${!!st.winsByType.line}. Full won: ${!!st.winsByType.full}.`;
        }
        if (sub2 === 'claim') {
          const tileId = args[2];
          if (!tileId) return 'Usage: clan bingo claim <tileId>';
          const res = bingo.claimBingoTile(myClan, p, tileId);
          if (!res.ok) return res.error;
          let msg = `Claimed ${tileId}.`;
          if (res.line) msg += ' LINE WIN!';
          if (res.full) msg += ' FULL HOUSE!';
          return msg;
        }
        if (sub2 === 'end') {
          const res = bingo.endBingo(myClan, p.id);
          if (!res.ok) return res.error;
          return 'Bingo ended.';
        }
        return 'Usage: clan bingo start [5|7] | status | claim <tileId> | end';
      }

      // ── territory ───────────────────────────────────────────────────────
      if (sub === 'territory') {
        const sub2 = (args[1] || '').toLowerCase();
        const regionId = args[2];
        if (sub2 === 'claim') {
          if (!regionId) return 'Usage: clan territory claim <region>';
          const res = territory.claimTerritory(myClan, regionId, p.id);
          if (!res.ok) return res.error;
          return `Claimed region ${regionId}.`;
        }
        if (sub2 === 'release') {
          if (!regionId) return 'Usage: clan territory release <region>';
          const res = territory.releaseTerritory(myClan, regionId, p.id);
          if (!res.ok) return res.error;
          return `Released ${regionId}.`;
        }
        if (sub2 === 'declare') {
          if (!regionId) return 'Usage: clan territory declare <region>';
          const owner = territory.getTerritoryOwner(regionId);
          const res = territory.declareTerritoryWar(myClan, regionId, owner, p.id);
          if (!res.ok) return res.error;
          return `War declared on ${regionId}. PvP window in ~${Math.round(territory.WAR_WINDOW_MS / 3600000)}h.`;
        }
        if (sub2 === 'list' || !sub2) {
          const lines = ['── Territory ──'];
          for (const r of myClan.territory) lines.push(`  ${r}`);
          if (myClan.territory.length === 0) lines.push('  (none)');
          return lines.join('\n');
        }
        return 'Usage: clan territory claim|release|declare|list';
      }

      // ── events ──────────────────────────────────────────────────────────
      if (sub === 'event') {
        const sub2 = (args[1] || '').toLowerCase();
        if (sub2 === 'create') {
          if (!clan.canDo(myClan, p.id, 'createEvent')) return 'Insufficient rank to create events.';
          const name = args.slice(2).join(' ').trim();
          if (!name) return 'Usage: clan event create <name>';
          const ev = {
            id: myClan.events.length + 1,
            name,
            type: 'generic',
            createdBy: p.id,
            createdAt: Date.now(),
            attendees: [],
            scheduled: null,
            completed: false,
          };
          myClan.events.push(ev);
          return `Created event "${name}" (id ${ev.id}).`;
        }
        if (sub2 === 'join') {
          const eid = parseInt(args[2], 10);
          const ev = myClan.events.find(e => e.id === eid);
          if (!ev) return 'Event not found.';
          if (!ev.attendees.includes(p.id)) ev.attendees.push(p.id);
          return `Joined event ${ev.name}.`;
        }
        if (sub2 === 'list' || !sub2) {
          const lines = ['── Clan Events ──'];
          for (const ev of myClan.events) {
            lines.push(`  [${ev.id}] ${ev.name}   attendees:${ev.attendees.length}${ev.completed ? ' (done)' : ''}`);
          }
          if (myClan.events.length === 0) lines.push('  (none)');
          return lines.join('\n');
        }
        return 'Usage: clan event create <name> | join <id> | list';
      }

      return usage();
    },
  });

  // Drive war resolution + citadel ticks if a tick source is provided.
  if (opts.tick && typeof opts.tick.onTick === 'function') {
    let lastCheck = 0;
    opts.tick.onTick('clan-territory', () => {
      const now = Date.now();
      // Check wars once per 60 seconds of real time (avoid spamming).
      if (now - lastCheck < 60_000) return;
      lastCheck = now;
      territory.tickWars();
      for (const c of clan.listClans()) hall.accumulateCitadelResources(c);
    });
  }
}

function usage() {
  return [
    'Clan commands:',
    '  clan create <name> [motto]',
    '  clan invite <player>        clan accept <clanId>      clan leave',
    '  clan kick <player>          clan promote <player>     clan demote <player>',
    '  clan transfer <player>      clan status               clan members',
    '  clan donate <coins>         clan withdraw <coins>',
    '  clan hall enter | list | upgrade | build <room> | upgrade <room>',
    '  clan bingo start | status | claim <tileId> | end',
    '  clan territory claim | release | declare | list <region>',
    '  clan event create | join | list',
  ].join('\n');
}

module.exports = { register };
