// ══════════════════════════════════════════════════════════════════════════════
// Bank Commands (burn-v2 completion)
//
// Wires the new `src/engine/bank.js` engine into the slash-command surface and
// supersedes the legacy inline `bank` / `deposit` / `withdraw` handlers from
// `src/server.js`. Designed to be installed by `register({ commands, items, ...})`
// — same pattern used by other engine-commands modules (pets-commands,
// account-commands, etc.).
//
// All responses are short single-line / multi-line plain text suitable for the
// chat protocol. Right-click context menu emits a structured ws payload (see
// bank.buildContextMenu).
//
// Spec coverage:
//   /bank ............................ open & list current tab
//   /bank tab create <name>
//   /bank tab rename <id> <name>
//   /bank tab delete <id>
//   /bank tab list
//   /bank tab move <item> <tabId>
//   /bank deposit <item> [count] [tab]
//   /bank deposit-inv
//   /bank deposit-worn
//   /bank deposit-loot
//   /bank withdraw <item> [count|x|all]
//   /bank withdraw-1 / -5 / -10 / -all
//   /bank placeholder on|off
//   /bank search <query> [region]
//   /bank value
//   /bank menu <slot>             (debug — emits ws shape via stdout)
//   /examine <item>
//
// Note: the legacy handlers in server.js remain registered earlier; this module
// re-registers using the same canonical names which `commands.register` will
// overwrite — last write wins.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const bank = require('./bank');

function fmtCount(n) {
  if (n >= 10000000) return Math.floor(n / 1000000) + 'M';
  if (n >= 100000)   return Math.floor(n / 1000) + 'K';
  return String(n);
}

function joinNameAndCount(args) {
  // Try to parse trailing count as a number ("1", "5", "10", "all", "x"->prompt).
  if (!args.length) return { name: '', count: 1 };
  const last = String(args[args.length - 1]).toLowerCase();
  if (last === 'all') return { name: args.slice(0, -1).join(' '), count: 'all' };
  if (last === 'x')   return { name: args.slice(0, -1).join(' '), count: 'x' };
  const n = parseInt(last, 10);
  if (!isNaN(n) && args.length > 1) {
    return { name: args.slice(0, -1).join(' '), count: n };
  }
  return { name: args.join(' '), count: 1 };
}

function register(ctx) {
  if (!ctx || !ctx.commands || !ctx.items) {
    throw new Error('bank-commands.register: ctx.commands + ctx.items required');
  }
  const { commands, items } = ctx;
  const invAdd = ctx.invAdd || ((p, id, name, count, stackable) => {
    const player = require('../player/player');
    return player.invAdd(p, id, name, count, stackable);
  });
  const invFreeSlots = ctx.invFreeSlots || (require('../player/player').invFreeSlots);

  const bankCtx = { items, invAdd, invFreeSlots };

  // ── /bank (and subcommands) ───────────────────────────────────────────────
  commands.register('bank', {
    help: 'Bank: open / tab / deposit / withdraw / placeholder / search / value',
    category: 'Items',
    fn: (p, args) => {
      bank.ensureBankState(p);

      if (p.accountMode === 'uim') return "As an Ultimate Ironman, you can't use the bank.";

      const sub = (args[0] || '').toLowerCase();

      // Plain "bank" => open + show current tab (default 0 = All).
      if (!sub || sub === 'list' || sub === 'open') {
        const v = bank.viewTab(p, 0);
        if (!v.rows.length) return `── Bank (${p.bank.length}/${bank.BANK_SIZE}) ──\n  (empty)`;
        const lines = [`── Bank · All (${p.bank.length}/${bank.BANK_SIZE}) ──`];
        for (const r of v.rows.slice(0, 30)) {
          const tabLabel = r.tab > 0 ? ` [${r.tab}:${p.bankTabs[r.tab]}]` : '';
          const ph = r.placeholder ? ' (placeholder)' : '';
          lines.push(`  ${r.name}${r.count > 1 ? ' x' + fmtCount(r.count) : ''}${tabLabel}${ph}`);
        }
        if (v.rows.length > 30) lines.push(`  …and ${v.rows.length - 30} more`);
        return lines.join('\n');
      }

      // ── PIN gate informational helper ────────────────────────────────────
      if (sub === 'pin' || sub === 'pin?') {
        const r = bank.pinGate(p);
        return r.ok ? 'Bank PIN: verified or not required.' : `Bank PIN: ${r.reason}`;
      }

      // ── Tabs ─────────────────────────────────────────────────────────────
      if (sub === 'tab') {
        const op = (args[1] || '').toLowerCase();
        if (op === 'create') {
          const name = args.slice(2).join(' ');
          const r = bank.createTab(p, name);
          return r.ok ? `Created tab ${r.id}: ${r.name}` : `Tab create failed: ${r.reason}`;
        }
        if (op === 'rename') {
          const id = parseInt(args[2], 10);
          const name = args.slice(3).join(' ');
          const r = bank.renameTab(p, id, name);
          return r.ok ? `Renamed tab ${r.id} -> ${r.name}` : `Tab rename failed: ${r.reason}`;
        }
        if (op === 'delete') {
          const id = parseInt(args[2], 10);
          const r = bank.deleteTab(p, id);
          return r.ok
            ? `Deleted tab ${r.id}. ${r.itemsReassigned} item(s) moved to All.`
            : `Tab delete failed: ${r.reason}`;
        }
        if (op === 'move') {
          const itemName = args.slice(2, -1).join(' ');
          const id = parseInt(args[args.length - 1], 10);
          const def = items.find && items.find(itemName);
          if (!def) return `Unknown item "${itemName}".`;
          const r = bank.moveToTab(p, def.id, id);
          return r.ok ? `Moved ${def.name} to tab ${r.tab}.` : `Move failed: ${r.reason}`;
        }
        if (op === 'list' || !op) {
          const ts = bank.listTabs(p);
          const lines = ['── Bank tabs ──'];
          for (const t of ts) lines.push(`  [${t.id}] ${t.name || '(empty)'}`);
          return lines.join('\n');
        }
        if (op === 'view') {
          const r = bank.viewTab(p, args[2]);
          if (!r.rows.length) return `Tab "${r.name || r.tab}" empty.`;
          const lines = [`── Tab ${r.tab}: ${r.name || ''} ──`];
          for (const e of r.rows) lines.push(`  ${e.name}${e.count > 1 ? ' x' + fmtCount(e.count) : ''}${e.placeholder ? ' (placeholder)' : ''}`);
          return lines.join('\n');
        }
        return 'Tab subcommands: create <name> | rename <id> <name> | delete <id> | move <item> <tabId> | list | view <id|name>';
      }

      // ── Deposit ──────────────────────────────────────────────────────────
      if (sub === 'deposit-inv' || sub === 'depositinv') {
        const r = bank.depositInventory(p, bankCtx);
        return r.ok ? `Deposited inventory: ${r.count} item(s).` : `Deposit failed: ${r.reason}`;
      }
      if (sub === 'deposit-worn' || sub === 'depositworn') {
        const r = bank.depositWorn(p, bankCtx);
        return r.ok ? `Deposited worn: ${r.count} item(s).` : `Deposit failed: ${r.reason}`;
      }
      if (sub === 'deposit-loot' || sub === 'depositloot') {
        const r = bank.depositLoot(p, bankCtx);
        return r.ok ? `Deposited recent loot: ${r.count} item(s).` : `Deposit failed: ${r.reason}`;
      }
      if (sub === 'deposit') {
        // /bank deposit <item> [count] [tab]
        // Parse from end: optional tab name (last token), optional count before that.
        const rest = args.slice(1);
        if (!rest.length) return 'Usage: /bank deposit <item> [count] [tab]';

        // Heuristic: known tab name as last arg
        let tabName = null;
        const lastTok = rest[rest.length - 1];
        const tabId = bank.findTabIdByName(p, lastTok);
        if (tabId > 0) { tabName = lastTok; rest.pop(); }

        const parsed = joinNameAndCount(rest);
        const count = parsed.count === 'x' ? 1 : parsed.count;
        const r = bank.deposit(p, bankCtx, parsed.name, count, tabName);
        return r.ok
          ? `Deposited ${r.item} x${r.count}${r.tab ? ` (tab ${r.tab})` : ''}.`
          : `Deposit failed: ${r.reason}`;
      }

      // ── Withdraw quantity shortcuts ──────────────────────────────────────
      if (sub === 'withdraw-1' || sub === 'withdraw-5' || sub === 'withdraw-10' || sub === 'withdraw-all') {
        const count = sub === 'withdraw-all' ? 'all' : parseInt(sub.split('-')[1], 10);
        const name = args.slice(1).join(' ');
        const r = bank.withdraw(p, bankCtx, name, count);
        return r.ok ? `Withdrew ${r.item} x${r.count}.` : `Withdraw failed: ${r.reason}`;
      }
      if (sub === 'withdraw') {
        const rest = args.slice(1);
        if (!rest.length) return 'Usage: /bank withdraw <item> [count|all|x]';
        const parsed = joinNameAndCount(rest);
        const count = parsed.count === 'x' ? 1 : parsed.count; // X-prompt resolved by client; default 1
        const r = bank.withdraw(p, bankCtx, parsed.name, count);
        return r.ok ? `Withdrew ${r.item} x${r.count}.` : `Withdraw failed: ${r.reason}`;
      }

      // ── Placeholders ─────────────────────────────────────────────────────
      if (sub === 'placeholder' || sub === 'placeholders') {
        const flag = (args[1] || '').toLowerCase();
        if (flag !== 'on' && flag !== 'off') {
          return `Placeholders are ${p.placeholdersOn ? 'ON' : 'OFF'}. Use /bank placeholder on|off`;
        }
        const r = bank.setPlaceholders(p, flag === 'on');
        return `Placeholders ${r.on ? 'ON' : 'OFF'}.`;
      }

      // ── Search ───────────────────────────────────────────────────────────
      if (sub === 'search') {
        const q = args.slice(1).join(' ');
        if (!q) return 'Usage: /bank search <query>';
        // Optional: "...:region <region>" suffix
        let region = null;
        let cleanQ = q;
        const m = q.match(/^(.+?)\s+:region\s+(\S+)$/i);
        if (m) { cleanQ = m[1]; region = m[2]; }
        const matches = bank.search(p, bankCtx, cleanQ, { region });
        if (!matches.length) return `No bank items match "${cleanQ}".`;
        const lines = [`── Search: "${cleanQ}"${region ? ` region:${region}` : ''} (${matches.length}) ──`];
        for (const m2 of matches.slice(0, 30)) {
          lines.push(`  ${m2.name} x${fmtCount(m2.count)} [tab ${m2.tab}] (${m2.tags.slice(0, 4).join(',')})`);
        }
        return lines.join('\n');
      }

      // ── Value ────────────────────────────────────────────────────────────
      if (sub === 'value') {
        const v = bank.bankValue(p, bankCtx);
        const lines = [`── Bank Value ──`, `  Total: ${v.total.toLocaleString()} gp (${v.items} item types)`];
        if (v.top5.length) lines.push('  Top 5 most valuable:');
        for (const t of v.top5) lines.push(`    ${t.name} x${fmtCount(t.count)} @ ${t.unit.toLocaleString()} = ${t.value.toLocaleString()} gp`);
        return lines.join('\n');
      }

      // ── Right-click menu (debug; real client computes locally from ws msg) ──
      if (sub === 'menu') {
        const slot = parseInt(args[1], 10);
        if (isNaN(slot)) return 'Usage: /bank menu <slot>';
        const msg = bank.buildContextMenu(p, bankCtx, slot);
        return JSON.stringify(msg);
      }

      return 'Unknown bank subcommand. Try: list, tab, deposit, withdraw, placeholder, search, value.';
    },
  });

  // ── /deposit shortcut (legacy compat) ────────────────────────────────────
  commands.register('deposit', {
    help: 'Deposit: deposit <item> [count] [tab] | deposit-inv | deposit-worn | deposit-loot | deposit all',
    category: 'Items',
    fn: (p, args) => {
      bank.ensureBankState(p);
      if (!args.length) return 'Usage: deposit <item> [count] [tab] | all';
      const first = args[0].toLowerCase();
      if (first === 'all' || first === 'inv' || first === 'inventory') {
        const r = bank.depositInventory(p, bankCtx);
        return r.ok ? `Deposited inventory: ${r.count} item(s).` : `Deposit failed: ${r.reason}`;
      }
      if (first === 'worn') {
        const r = bank.depositWorn(p, bankCtx);
        return r.ok ? `Deposited worn: ${r.count} item(s).` : `Deposit failed: ${r.reason}`;
      }
      if (first === 'loot') {
        const r = bank.depositLoot(p, bankCtx);
        return r.ok ? `Deposited recent loot: ${r.count} item(s).` : `Deposit failed: ${r.reason}`;
      }

      // Optional last-arg tab name.
      const rest = args.slice();
      let tabName = null;
      const lastTok = rest[rest.length - 1];
      const tabId = bank.findTabIdByName(p, lastTok);
      if (tabId > 0) { tabName = lastTok; rest.pop(); }
      const parsed = joinNameAndCount(rest);
      const count = parsed.count === 'x' ? 1 : parsed.count;
      const r = bank.deposit(p, bankCtx, parsed.name, count, tabName);
      return r.ok
        ? `Deposited ${r.item} x${r.count}${r.tab ? ` (tab ${r.tab})` : ''}.`
        : `Deposit failed: ${r.reason}`;
    },
  });

  // ── /withdraw shortcut (legacy compat) ───────────────────────────────────
  commands.register('withdraw', {
    help: 'Withdraw: withdraw <item> [count|all|x]',
    category: 'Items',
    fn: (p, args) => {
      bank.ensureBankState(p);
      if (!args.length) return 'Usage: withdraw <item> [count|all|x]';
      const parsed = joinNameAndCount(args);
      const count = parsed.count === 'x' ? 1 : parsed.count;
      const r = bank.withdraw(p, bankCtx, parsed.name, count);
      return r.ok ? `Withdrew ${r.item} x${r.count}.` : `Withdraw failed: ${r.reason}`;
    },
  });

  // ── /examine ─────────────────────────────────────────────────────────────
  commands.register('examine', {
    help: 'examine <item> — return the item examine text',
    category: 'Items',
    fn: (p, args) => {
      const name = args.join(' ').trim();
      if (!name) return 'Usage: examine <item>';
      const r = bank.examine(bankCtx, name);
      if (!r.ok) return r.reason;
      return r.examine;
    },
  });

  return { ok: true };
}

module.exports = { register };
