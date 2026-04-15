// ══════════════════════════════════════════════════════════════════════════════
// Voting — Chat Commands
//
// Installs /poll via the central commands registry.
//
// Usage:
//   const votingCommands = require('./engine/voting-commands');
//   votingCommands.register({ commands, voting });
//
// Commands:
//   /poll list                             — list active polls
//   /poll listall                          — list active + closed
//   /poll show <id>                        — show poll with results
//   /poll vote <id> <option|index>         — cast a vote
//   /poll unvote <id>                      — retract your vote (while open)
//   /poll create "<title>" <opt1,opt2,...> — admin only; days default 7
//   /poll close <id>                       — admin only; force-close a poll
//
// Secret ballot: the /poll show output reports aggregate counts only.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

function _isAdmin(p) {
  if (!p) return false;
  if (p.admin === true) return true;
  if (p.role === 'admin' || p.role === 'owner') return true;
  return false;
}

function _fmtTime(ms) {
  if (!ms) return 'never';
  const diff = ms - Date.now();
  if (diff <= 0) return 'expired';
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h`;
  const m = Math.floor((diff % 3600000) / 60000);
  return `${m}m`;
}

function _renderPoll(poll, results, showBars = true) {
  const lines = [];
  lines.push(`Poll #${poll.id}: ${poll.title}`);
  lines.push(`  by ${poll.createdByName}  ${poll.closed ? '(CLOSED)' : 'closes in ' + _fmtTime(poll.closesAt)}`);
  lines.push(`  ${results.total} vote${results.total === 1 ? '' : 's'}`);
  for (const r of results.results) {
    const bar = showBars ? _bar(r.pct) : '';
    lines.push(`    [${r.index}] ${r.label} — ${r.count} (${r.pct}%) ${bar}`);
  }
  if (results.winner) lines.push(`  Winner: ${results.winner}`);
  else if (results.tie) lines.push(`  Tie.`);
  return lines.join('\n');
}

function _bar(pct) {
  const len = 20;
  const filled = Math.round((pct / 100) * len);
  return '[' + '='.repeat(filled) + ' '.repeat(len - filled) + ']';
}

function _parseCreateArgs(raw) {
  // Accept either:
  //   poll create "My title" opt1,opt2,opt3
  //   poll create My Title | opt1, opt2, opt3
  //   poll create title,opt1,opt2
  // Returns { title, options, durationDays } or null.
  const rest = raw.replace(/^\s*poll\s+create\s+/i, '');
  if (!rest) return null;

  // Quoted title takes priority.
  const qm = rest.match(/^"([^"]+)"\s+(.+)$/);
  if (qm) {
    const title = qm[1];
    const opts = qm[2].split(',').map(s => s.trim()).filter(Boolean);
    return { title, options: opts };
  }
  // Pipe-separated title.
  if (rest.includes('|')) {
    const [titlePart, ...rem] = rest.split('|');
    const title = titlePart.trim();
    const opts = rem.join('|').split(',').map(s => s.trim()).filter(Boolean);
    return { title, options: opts };
  }
  // Fallback: first comma-separated token is title.
  const parts = rest.split(',').map(s => s.trim()).filter(Boolean);
  if (parts.length < 3) return null;
  return { title: parts[0], options: parts.slice(1) };
}

function register(opts) {
  const commands = opts && opts.commands;
  const voting = opts && opts.voting;
  if (!commands) throw new Error('voting-commands.register: commands required');
  if (!voting) throw new Error('voting-commands.register: voting required');

  function usage() {
    return [
      'Usage:',
      '  poll list                          active polls',
      '  poll listall                       active + closed',
      '  poll show <id>                     poll details + results',
      '  poll vote <id> <option|index>      cast your vote (one per poll)',
      '  poll unvote <id>                   retract your vote',
      '  poll create "<title>" opt1,opt2    admin: create a new poll',
      '  poll close <id>                    admin: close a poll',
    ].join('\n');
  }

  commands.register('poll', {
    help: 'Community polls: poll list/show/vote/create/close',
    category: 'General',
    fn: (p, args, raw) => {
      const sub = (args[0] || '').toLowerCase();
      if (!sub || sub === 'help') return usage();

      // ── list ─────────────────────────────────────────────────────────────
      if (sub === 'list' || sub === 'active') {
        voting.sweepExpired();
        const list = voting.listPolls('active');
        if (!list.length) return 'No active polls.';
        return list.map(p => {
          const line = `#${p.id} ${p.title} — ${p.total} votes — closes ${_fmtTime(p.closesAt)}`;
          return line;
        }).join('\n');
      }
      if (sub === 'listall' || sub === 'all') {
        const list = voting.listPolls('all');
        if (!list.length) return 'No polls yet.';
        return list.map(p => {
          const status = p.closed ? 'CLOSED' : _fmtTime(p.closesAt);
          return `#${p.id} ${p.title} — ${p.total} votes — ${status}`;
        }).join('\n');
      }

      // ── show ─────────────────────────────────────────────────────────────
      if (sub === 'show' || sub === 'view' || sub === 'info') {
        const id = parseInt(args[1], 10);
        if (!id) return 'Usage: poll show <id>';
        const poll = voting.getPoll(id);
        if (!poll) return 'No such poll.';
        const results = voting.getPollResults(id);
        return _renderPoll(poll, results, true);
      }

      // ── vote ─────────────────────────────────────────────────────────────
      if (sub === 'vote') {
        const id = parseInt(args[1], 10);
        if (!id) return 'Usage: poll vote <id> <option|index>';
        const choice = args.slice(2).join(' ').trim();
        if (!choice) return 'Usage: poll vote <id> <option|index>';
        const res = voting.vote(id, p.id, choice);
        if (!res.ok) return res.error;
        return `Voted: ${res.option}.`;
      }

      // ── unvote ───────────────────────────────────────────────────────────
      if (sub === 'unvote' || sub === 'retract') {
        const id = parseInt(args[1], 10);
        if (!id) return 'Usage: poll unvote <id>';
        const res = voting.unvote(id, p.id);
        if (!res.ok) return res.error;
        return 'Your vote has been retracted.';
      }

      // ── my vote ──────────────────────────────────────────────────────────
      if (sub === 'myvote' || sub === 'mine') {
        const id = parseInt(args[1], 10);
        if (!id) return 'Usage: poll myvote <id>';
        const v = voting.myVote(id, p.id);
        if (!v) return 'You have not voted on that poll.';
        return `Your vote on poll #${id}: ${v.label}.`;
      }

      // ── create (admin) ───────────────────────────────────────────────────
      if (sub === 'create' || sub === 'new') {
        if (!_isAdmin(p)) return 'Admin only.';
        const spec = _parseCreateArgs(raw);
        if (!spec) {
          return [
            'Usage:',
            '  poll create "<title>" opt1,opt2,opt3',
            '  poll create <title> | opt1, opt2, opt3',
          ].join('\n');
        }
        const res = voting.createPoll({
          title: spec.title,
          options: spec.options,
          createdBy: p.id,
          createdByName: p.name || 'admin',
        });
        if (!res.ok) return res.error;
        return `Poll #${res.poll.id} created: ${res.poll.title}`;
      }

      // ── close (admin) ────────────────────────────────────────────────────
      if (sub === 'close') {
        if (!_isAdmin(p)) return 'Admin only.';
        const id = parseInt(args[1], 10);
        if (!id) return 'Usage: poll close <id>';
        const res = voting.closePoll(id, p.id);
        if (!res.ok) return res.error;
        return `Poll #${id} closed.`;
      }

      return `Unknown subcommand: ${sub}\n${usage()}`;
    },
  });

  return true;
}

module.exports = { register };
