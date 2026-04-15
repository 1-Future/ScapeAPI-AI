// ══════════════════════════════════════════════════════════════════════════════
// Trade — Chat Commands
//
// Installs the `/trade` command family, wiring the trade engine to the live
// server's player registry, item registry, and inventory helpers.
//
// Usage from server.js bootstrap:
//
//   const tradeCommands = require('./engine/trade-commands');
//   tradeCommands.register({
//     commands,         // src/engine/commands.js
//     items,            // src/data/items.js
//     playerLib,        // src/player/player.js
//     findPlayer,       // (name|id) => player
//     getTick,          // () => currentTick
//     notify,           // (player, payload) => void   (WS push)
//     ironman,          // src/engine/ironman.js  (optional)
//   });
//
// Commands installed:
//   /trade <playerName>                    send request
//   /trade accept [requestId]              accept most-recent (or by id)
//   /trade cancel                          cancel your current trade
//   /trade add <item...> [count]           add items to your offer
//   /trade remove <slot>                   remove by 1-indexed slot
//   /trade coins <amount>                  set your coin offer
//   /trade confirm                         double-confirm step
//   /trade status                          show current trade
//   /trade history [limit]                 past trades for you
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const trade = require('./trade');

// Flexible item lookup (matches ge-commands behaviour).
function findItemFlexible(items, query) {
  const exact = items.find(query);
  if (exact) return exact;
  const id = parseInt(query, 10);
  if (!isNaN(id)) {
    const def = items.get(id);
    if (def) return def;
  }
  if (typeof items.search === 'function') {
    const matches = items.search(query);
    if (matches.length === 1) return matches[0];
    if (matches.length > 1) {
      matches.sort((a, b) => a.name.length - b.name.length);
      return matches[0];
    }
  }
  return null;
}

function register(opts) {
  const commands = opts && opts.commands;
  const items = opts && opts.items;
  const playerLib = opts && opts.playerLib;
  const findPlayer = typeof opts.findPlayer === 'function' ? opts.findPlayer : null;
  const ironman = opts && opts.ironman;

  if (!commands) throw new Error('trade-commands.register: commands module required');
  if (!items)    throw new Error('trade-commands.register: items module required');
  if (!playerLib) throw new Error('trade-commands.register: playerLib module required');

  if (typeof opts.getTick === 'function') trade.setTickSource(opts.getTick);
  if (typeof findPlayer === 'function') {
    trade.setPlayerResolver((id) => {
      try { return findPlayer(id); } catch (_) { return null; }
    });
  }

  // Wire engine hooks.
  trade.setPlayerHooks({
    invCount:      (p, id)              => playerLib.invCount(p, id),
    invRemove:     (p, id, qty)         => {
      const removed = playerLib.invRemove(p, id, qty);
      return removed === qty;
    },
    invAdd:        (p, id, name, qty, st) => playerLib.invAdd(p, id, name, qty, st),
    invFreeSlots:  (p)                  => playerLib.invFreeSlots(p),
    getItemDef:    (id)                 => items.get(id),
    distance:      (a, b) => {
      if (!a || !b || a.x == null || b.x == null) return 0;
      // Chebyshev distance — matches OSRS interaction range semantics.
      const dx = Math.abs(a.x - b.x), dy = Math.abs(a.y - b.y);
      // If on different layers, treat as unreachable.
      if (a.layer !== b.layer) return 1e9;
      return Math.max(dx, dy);
    },
    isInCombat:    (p) => !!(p && p.combatTarget),
    isTradeMuted:  (p) => !!(p && p.tradeMuted),
    notify: typeof opts.notify === 'function'
      ? opts.notify
      : ((p, payload) => {}),
    canTrade: (a, b) => {
      if (ironman && typeof ironman.canTrade === 'function') {
        return ironman.canTrade(a, b);
      }
      return { allowed: true, reason: '' };
    },
  });

  // Register `/trade` verb.
  commands.register('trade', {
    help: 'Trade with another player: trade <name>/accept/cancel/add/remove/coins/confirm/status/history',
    category: 'Social',
    fn: (p, args) => {
      const sub = (args[0] || '').toLowerCase();

      // Explicit help.
      if (sub === 'help' || sub === '?') {
        return [
          'Trade commands:',
          '  trade <player>           send a request',
          '  trade accept [id]        accept latest (or by id)',
          '  trade cancel             cancel current trade',
          '  trade add <item> [n]     add items to offer',
          '  trade remove <slot>      remove a slot (1-indexed)',
          '  trade coins <amount>     set coin offer',
          '  trade confirm            double-confirm step',
          '  trade status             show current trade',
          '  trade history [n]        past trades',
        ].join('\n');
      }

      // Send request — `trade <name>` (the most common form).
      if (sub && sub !== 'accept' && sub !== 'cancel' && sub !== 'add'
          && sub !== 'remove' && sub !== 'coins' && sub !== 'confirm'
          && sub !== 'status' && sub !== 'history') {
        const name = args.join(' ').trim();
        if (!name) return 'Usage: trade <player>';
        let target = null;
        if (findPlayer) target = findPlayer(name);
        if (!target) return `No such player: ${name}`;
        const res = trade.requestTrade(p, target);
        if (!res.ok) return res.reason;
        return `Trade request sent to ${target.name || target.id}.`;
      }

      // trade accept [id]
      if (sub === 'accept') {
        const reqId = args[1] ? parseInt(args[1], 10) : null;
        const res = trade.acceptTrade(p, isNaN(reqId) ? null : reqId);
        if (!res.ok) return res.reason;
        return 'Trade accepted. Use `trade add <item> <count>`, `trade coins <n>`, then `trade confirm` twice.';
      }

      // trade cancel
      if (sub === 'cancel') {
        const res = trade.cancelTrade(p);
        if (!res.ok) return res.reason;
        return 'Trade cancelled. Items refunded.';
      }

      // trade add <item...> [count]
      if (sub === 'add') {
        if (args.length < 2) return 'Usage: trade add <item> [count]';
        // Last token may be a count.
        let countRaw = args[args.length - 1];
        let nameTokens = args.slice(1);
        let count = 1;
        const asInt = parseInt(countRaw, 10);
        if (!isNaN(asInt) && String(asInt) === countRaw && nameTokens.length >= 2) {
          count = asInt;
          nameTokens = nameTokens.slice(0, -1);
        }
        const name = nameTokens.join(' ').trim();
        if (!name) return 'Usage: trade add <item> [count]';
        const def = findItemFlexible(items, name);
        if (!def) return `Unknown item: "${name}".`;
        const res = trade.addItemToTrade(p, def.id, count);
        if (!res.ok) return res.reason;
        return `Added ${count}x ${def.name} to your offer.`;
      }

      // trade remove <slot>
      if (sub === 'remove') {
        const slot = parseInt(args[1], 10);
        if (isNaN(slot) || slot < 1) return 'Usage: trade remove <slot>';
        const res = trade.removeItemFromTrade(p, slot - 1);
        if (!res.ok) return res.reason;
        return `Removed slot ${slot}: ${res.slot.count}x ${res.slot.name}.`;
      }

      // trade coins <amount>
      if (sub === 'coins') {
        const n = parseInt(args[1], 10);
        if (isNaN(n) || n < 0) return 'Usage: trade coins <amount>';
        const res = trade.setCoinOffer(p, n);
        if (!res.ok) return res.reason;
        return `Coin offer set: ${res.coins}.`;
      }

      // trade confirm
      if (sub === 'confirm') {
        const res = trade.confirmTrade(p);
        if (!res.ok) return res.reason;
        if (res.completed) {
          const s = res.summary;
          return `Trade complete. You gave ${s.initiator.playerId === p.id ? s.initiator.coins : s.target.coins} coins and received ${s.initiator.playerId === p.id ? s.target.coins : s.initiator.coins}.`;
        }
        if (res.stage === 1) return 'Confirmed (stage 1). Waiting for the other trader.';
        return 'Confirmed (stage 2). Final lock-in; waiting on the other trader.';
      }

      // trade status
      if (sub === 'status' || sub === '') {
        const snap = trade.getOpenTrade(p);
        if (!snap) return 'No active trade. Use `trade <player>` to request one.';
        const lines = [`── Trade #${snap.id} ──`];
        const meKey = snap.initiator.playerId === p.id ? 'initiator' : 'target';
        const youKey = meKey === 'initiator' ? 'target' : 'initiator';
        const me = snap[meKey], you = snap[youKey];
        lines.push(`You offer (${me.slots.length} items + ${me.coins} coins):`);
        me.slots.forEach((s, i) => lines.push(`  [${i+1}] ${s.count}x ${s.name}`));
        lines.push(`You receive from ${you.playerName} (${you.slots.length} items + ${you.coins} coins):`);
        you.slots.forEach((s, i) => lines.push(`  [${i+1}] ${s.count}x ${s.name}`));
        lines.push(`Confirms: you [${me.confirmed[0]?'x':' '}${me.confirmed[1]?'x':' '}]  them [${you.confirmed[0]?'x':' '}${you.confirmed[1]?'x':' '}]`);
        return lines.join('\n');
      }

      // trade history [limit]
      if (sub === 'history') {
        const limit = parseInt(args[1], 10);
        const entries = trade.listHistory(p, isNaN(limit) ? 30 : limit);
        if (!entries.length) return 'No trade history.';
        const lines = ['── Recent trades ──'];
        for (const e of entries) {
          const iName = (e.initiator && e.initiator.name) || '?';
          const tName = (e.target && e.target.name) || '?';
          const iCoins = (e.initiator && e.initiator.coinsGave) || 0;
          const tCoins = (e.target && e.target.coinsGave) || 0;
          lines.push(`  #${e.tradeId} ${iName} <-> ${tName}  coins: ${iCoins}/${tCoins}`);
        }
        return lines.join('\n');
      }

      return [
        'Trade commands:',
        '  trade <player>',
        '  trade accept [requestId]',
        '  trade cancel',
        '  trade add <item> [count]',
        '  trade remove <slot>',
        '  trade coins <amount>',
        '  trade confirm',
        '  trade status',
        '  trade history',
      ].join('\n');
    },
  });

  // Drive the expiry sweeper on tick if the server provides one.
  if (opts.tick && typeof opts.tick.onTick === 'function') {
    opts.tick.onTick('trade-runner', () => { trade.tick(); });
  }
}

module.exports = { register };
