// ══════════════════════════════════════════════════════════════════════════════
// Moderation — Chat command registration.
//
// Wires /report, /appeal, /rules, and the /admin family into the commands
// registry. Everything routes through src/engine/moderation.js so the role
// gating and audit log remain authoritative.
//
// Usage from the server bootstrap:
//
//   const modCommands = require('./engine/mod-commands');
//   modCommands.register({
//     commands,              // src/engine/commands.js
//     moderation,            // src/engine/moderation.js
//     rules,                 // src/engine/rules.js
//     findPlayer,            // (idOrName) -> player
//     getTick,               // () => tick
//     restoreSnapshot,       // (player, snapshotId) -> {ok, reason}   (optional)
//     invRemove, invAdd,     // player.js inventory helpers             (optional)
//   });
//
// Public commands:
//   report <player> <ruleId> <reason...>
//   appeal <strikeId> <reason...>
//   rules [list | show <ruleId>]
//   strikes                       — view your own
//
// Admin/mod commands (prefix "admin"):
//   admin reports list
//   admin reports review <id> <upheld|dismissed|escalated> [note...]
//   admin appeals list
//   admin appeals review <id> <approved|denied> [note...]
//   admin mute <player> [minutes] [reason...]
//   admin unmute <player> [reason...]
//   admin kick <player> [reason...]
//   admin ban <player> [days] [reason...]
//   admin unban <player> [reason...]
//   admin rollback <player> <snapshotId> [reason...]
//   admin transfer <fromPlayer> <toPlayer> <itemId> [count] [reason...]
//   admin broadcast <message...>
//   admin role <player> <role>     (owner-only)
//   admin audit [n]                (view last n audit entries)
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

function register(opts) {
  const commands = opts && opts.commands;
  const moderation = opts && opts.moderation;
  const rules = opts && opts.rules;
  if (!commands) throw new Error('mod-commands.register: commands required');
  if (!moderation) throw new Error('mod-commands.register: moderation required');
  if (!rules) throw new Error('mod-commands.register: rules required');

  const findPlayer = typeof opts.findPlayer === 'function' ? opts.findPlayer : null;
  const restoreSnapshot = typeof opts.restoreSnapshot === 'function' ? opts.restoreSnapshot : null;
  const invRemove = typeof opts.invRemove === 'function' ? opts.invRemove : null;
  const invAdd    = typeof opts.invAdd === 'function'    ? opts.invAdd    : null;
  if (typeof opts.getTick === 'function') moderation.setTickSource(opts.getTick);

  function resolvePlayer(token) {
    if (!token) return null;
    if (findPlayer) return findPlayer(token);
    return null;
  }

  // ── /rules ────────────────────────────────────────────────────────────────
  commands.register('rules', {
    help: 'Show the code of conduct: rules [list | show <ruleId>]',
    category: 'General',
    fn: (_p, args) => {
      const sub = (args[0] || 'list').toLowerCase();
      if (sub === 'list') {
        const lines = ['Code of Conduct:'];
        for (const r of rules.listRules()) {
          lines.push(`  [${r.severity.padEnd(6)}] ${r.id.padEnd(18)} ${r.title}`);
        }
        lines.push('Use `rules show <id>` for details.');
        return lines.join('\n');
      }
      if (sub === 'show') {
        const r = rules.getRule(args[1]);
        if (!r) return `Unknown rule: ${args[1]}`;
        const lines = [
          `Rule: ${r.title} (${r.id})`,
          `Severity: ${r.severity}`,
          r.description,
          'Escalation:',
        ];
        for (const rung of r.escalation) {
          const dur = rung.duration_days === null ? 'permanent'
            : rung.duration_days === 0 ? 'n/a'
            : `${rung.duration_days}d`;
          lines.push(`  ${rung.strikes}x -> ${rung.action} (${dur})`);
        }
        if (r.appealable === false) lines.push('(Not appealable.)');
        return lines.join('\n');
      }
      return 'Usage: rules [list | show <ruleId>]';
    },
  });

  // ── /strikes (self) ───────────────────────────────────────────────────────
  commands.register('strikes', {
    help: 'Show your own strike history',
    category: 'General',
    fn: (p) => {
      const arr = moderation.getStrikeHistory(p);
      if (!arr.length) return 'You have no strikes on record.';
      const lines = [`You have ${arr.length} strike(s):`];
      for (const s of arr) {
        const stat = s.active === false ? 'LIFTED' : 'ACTIVE';
        lines.push(`  [${stat}] ${s.id} ${s.ruleTitle} -> ${s.action} (${s.reason})`);
      }
      lines.push('Use `appeal <strikeId> <reason>` within 30 days.');
      return lines.join('\n');
    },
  });

  // ── /report <player> <ruleId> <reason...> ─────────────────────────────────
  commands.register('report', {
    help: 'Report a player: report <player> <ruleId> <reason...>',
    category: 'General',
    fn: (reporter, args) => {
      if (args.length < 2) return 'Usage: report <player> <ruleId> <reason...>';
      const target = resolvePlayer(args[0]);
      if (!target) return `Player not found: ${args[0]}`;
      if (String(target.id) === String(reporter.id)) return 'You cannot report yourself.';
      const ruleId = args[1];
      if (!rules.getRule(ruleId)) {
        return `Unknown rule: ${ruleId}. Use \`rules list\` to see ids.`;
      }
      const reason = args.slice(2).join(' ').trim();
      const res = moderation.recordIncident(reporter.id, target.id, ruleId, { reason });
      if (!res.ok) return res.reason;
      return `Report filed: ${res.id}. Thank you.`;
    },
  });

  // ── /appeal <strikeId> <reason...> ────────────────────────────────────────
  commands.register('appeal', {
    help: 'Appeal a strike: appeal <strikeId> <reason...>',
    category: 'General',
    fn: (p, args) => {
      if (args.length < 1) return 'Usage: appeal <strikeId> <reason...>';
      const strikeId = args[0];
      const reason = args.slice(1).join(' ').trim();
      const res = moderation.appeal(p, strikeId, reason);
      if (!res.ok) return res.reason;
      return `Appeal filed: ${res.id}.`;
    },
  });

  // ── /admin ... ────────────────────────────────────────────────────────────
  commands.register('admin', {
    help: 'Moderator/admin commands. See `admin help`.',
    category: 'Admin',
    fn: (actor, args) => {
      const sub = (args[0] || '').toLowerCase();

      if (!moderation.hasRole(actor, moderation.ROLES.moderator)) {
        return 'Admin only.';
      }

      if (sub === '' || sub === 'help') {
        return [
          'admin reports list                              ',
          'admin reports review <id> <upheld|dismissed|escalated> [note...]',
          'admin appeals list                              ',
          'admin appeals review <id> <approved|denied> [note...]',
          'admin mute <player> [minutes] [reason...]       ',
          'admin unmute <player> [reason...]               ',
          'admin kick <player> [reason...]                 ',
          'admin ban <player> [days] [reason...]           (admin+)',
          'admin unban <player> [reason...]                (admin+)',
          'admin rollback <player> <snapshotId> [reason...] (admin+)',
          'admin transfer <from> <to> <itemId> [count] [reason...] (admin+)',
          'admin broadcast <message...>                    ',
          'admin role <player> <role>                      (owner only)',
          'admin audit [n]                                 ',
        ].join('\n');
      }

      // ── reports ───────────────────────────────────────────────────────────
      if (sub === 'reports') {
        const op = (args[1] || 'list').toLowerCase();
        if (op === 'list') {
          const q = moderation.reviewQueue();
          if (!q.length) return 'No pending reports.';
          return q.map(r =>
            `  ${r.id}  target=${r.targetId}  rule=${r.ruleId}  reason="${r.reason || ''}"`
          ).join('\n');
        }
        if (op === 'review') {
          if (args.length < 4) {
            return 'Usage: admin reports review <id> <upheld|dismissed|escalated> [note...]';
          }
          const id = args[2];
          const resolution = args[3].toLowerCase();
          const note = args.slice(4).join(' ');
          const res = moderation.resolveIncident(id, resolution, actor, {
            resolveNote: note,
            getPlayerById: findPlayer ? (pid) => findPlayer(pid) : null,
          });
          if (!res.ok) return res.reason;
          let msg = `Report ${id} -> ${resolution}.`;
          if (res.strike) msg += ` Strike ${res.strike.id} applied (${res.strike.action}).`;
          return msg;
        }
        return 'Usage: admin reports <list|review>';
      }

      // ── appeals ───────────────────────────────────────────────────────────
      if (sub === 'appeals') {
        const op = (args[1] || 'list').toLowerCase();
        if (op === 'list') {
          const q = moderation.appealsQueue();
          if (!q.length) return 'No pending appeals.';
          return q.map(a =>
            `  ${a.id}  player=${a.playerId}  strike=${a.strikeId}  rule=${a.ruleId}  reason="${a.reason || ''}"`
          ).join('\n');
        }
        if (op === 'review') {
          if (args.length < 4) return 'Usage: admin appeals review <id> <approved|denied> [note...]';
          const id = args[2];
          const decision = args[3].toLowerCase();
          const note = args.slice(4).join(' ');
          const res = moderation.reviewAppeal(id, decision, actor, {
            note,
            getPlayerById: findPlayer ? (pid) => findPlayer(pid) : null,
          });
          if (!res.ok) return res.reason;
          return `Appeal ${id} -> ${decision}.${res.lifted ? ' Strike lifted.' : ''}`;
        }
        return 'Usage: admin appeals <list|review>';
      }

      // ── mute / unmute / kick ──────────────────────────────────────────────
      if (sub === 'mute') {
        const target = resolvePlayer(args[1]);
        if (!target) return `Player not found: ${args[1]}`;
        const minutes = Number(args[2]) || 60;
        const reason = args.slice(3).join(' ');
        const res = moderation.mute(actor, target, minutes, reason);
        return res.ok ? `Muted ${target.name || target.id} for ${minutes}m.` : res.reason;
      }
      if (sub === 'unmute') {
        const target = resolvePlayer(args[1]);
        if (!target) return `Player not found: ${args[1]}`;
        const reason = args.slice(2).join(' ');
        const res = moderation.unmute(actor, target, reason);
        return res.ok ? `Unmuted ${target.name || target.id}.` : res.reason;
      }
      if (sub === 'kick') {
        const target = resolvePlayer(args[1]);
        if (!target) return `Player not found: ${args[1]}`;
        const reason = args.slice(2).join(' ');
        const res = moderation.kick(actor, target, reason);
        return res.ok ? `Kicked ${target.name || target.id}.` : res.reason;
      }

      // ── ban / unban ───────────────────────────────────────────────────────
      if (sub === 'ban') {
        const target = resolvePlayer(args[1]);
        if (!target) return `Player not found: ${args[1]}`;
        const days = Number(args[2]) || 0;
        const reason = args.slice(3).join(' ');
        const res = moderation.ban(actor, target, days, reason);
        return res.ok ? `Banned ${target.name || target.id}${days > 0 ? ` for ${days}d` : ' permanently'}.` : res.reason;
      }
      if (sub === 'unban') {
        const target = resolvePlayer(args[1]);
        if (!target) return `Player not found: ${args[1]}`;
        const reason = args.slice(2).join(' ');
        const res = moderation.unban(actor, target, reason);
        return res.ok ? `Unbanned ${target.name || target.id}.` : res.reason;
      }

      // ── rollback ──────────────────────────────────────────────────────────
      if (sub === 'rollback') {
        const target = resolvePlayer(args[1]);
        if (!target) return `Player not found: ${args[1]}`;
        const snapshotId = args[2];
        if (!snapshotId) return 'Usage: admin rollback <player> <snapshotId> [reason...]';
        const reason = args.slice(3).join(' ');
        const res = moderation.rollback(actor, target, snapshotId, {
          restoreFn: restoreSnapshot, reason,
        });
        return res.ok ? `Rolled back ${target.name || target.id} to ${snapshotId}.` : res.reason;
      }

      // ── transfer ──────────────────────────────────────────────────────────
      if (sub === 'transfer') {
        if (args.length < 4) return 'Usage: admin transfer <from> <to> <itemId> [count] [reason...]';
        const from = resolvePlayer(args[1]);
        const to   = resolvePlayer(args[2]);
        if (!from || !to) return 'From or to not found.';
        const itemId = args[3];
        const count = Number(args[4]) || 1;
        const reason = args.slice(5).join(' ');
        const res = moderation.transfer(actor, from, to, itemId, count, {
          invRemove, invAdd, reason, itemName: itemId,
        });
        return res.ok ? `Transferred ${count}x ${itemId}: ${from.name || from.id} -> ${to.name || to.id}.` : res.reason;
      }

      // ── broadcast ─────────────────────────────────────────────────────────
      if (sub === 'broadcast') {
        const msg = args.slice(1).join(' ').trim();
        if (!msg) return 'Usage: admin broadcast <message...>';
        const res = moderation.broadcast(actor, msg);
        return res.ok ? `Broadcast sent.` : res.reason;
      }

      // ── role (owner only) ─────────────────────────────────────────────────
      if (sub === 'role') {
        const target = resolvePlayer(args[1]);
        if (!target) return `Player not found: ${args[1]}`;
        const newRole = args[2];
        const res = moderation.setRole(actor, target, newRole);
        return res.ok ? `Set role ${target.name || target.id}: ${res.from} -> ${res.to}.` : res.reason;
      }

      // ── audit ─────────────────────────────────────────────────────────────
      if (sub === 'audit') {
        const n = Math.min(50, Math.max(1, Number(args[1]) || 10));
        const all = moderation.readAudit();
        const tail = all.slice(-n);
        if (!tail.length) return 'No audit entries.';
        return tail.map(e => {
          const who = e.actor ? `${e.actor.name || e.actor.id}` : 'system';
          const tgt = e.target ? ` -> ${e.target.name || e.target.id}` : '';
          return `  t=${e.tick} ${e.action} by ${who}${tgt} ${JSON.stringify(e.payload || {})}`;
        }).join('\n');
      }

      return `Unknown admin sub-command: ${sub}. Try \`admin help\`.`;
    },
  });
}

module.exports = { register };
