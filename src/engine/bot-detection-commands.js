// ══════════════════════════════════════════════════════════════════════════════
// Bot Detection — Chat Commands
//
// Installs the `/botscore`, `/honeypot`, `/botpolicy`, and `/mark-as-bot`
// commands via the central command registry.
//
// Privacy rules (enforced here, not in the core module):
//   - /botscore is admin-only, period. A non-admin calling /botscore gets the
//     standard "Admin only." reply from commands.execute.
//   - /honeypot place is admin-only.
//   - /botpolicy is visible to everyone (shows the server policy string).
//   - /mark-as-bot is available to every player.
//
// Usage:
//   const commands = require('./engine/commands');
//   const botCmds = require('./engine/bot-detection-commands');
//   botCmds.register({ commands, botDetection, findPlayer, getTick });
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

function usage() {
  return [
    'Bot detection commands:',
    '  /botpolicy                   show server policy (visible to all)',
    '  /mark-as-bot [on|off]        self-label your account as a bot',
    '  /botscore [playerId]         (admin) show bot score + breakdown',
    '  /honeypot place <kind> x y   (admin) place a honeypot',
    '  /honeypot list               (admin) list honeypots',
    '  /honeypot escalations        (admin) list pending review items',
  ].join('\n');
}

function register(opts) {
  opts = opts || {};
  const commands = opts.commands;
  const botDetection = opts.botDetection;
  if (!commands) throw new Error('bot-detection-commands.register: commands module required');
  if (!botDetection) throw new Error('bot-detection-commands.register: botDetection module required');

  const findPlayer = (typeof opts.findPlayer === 'function') ? opts.findPlayer : null;
  if (typeof opts.getTick === 'function') botDetection.setTickSource(opts.getTick);

  // ── /botpolicy ────────────────────────────────────────────────────────────
  commands.register('botpolicy', {
    help: 'Show the server bot policy.',
    category: 'General',
    fn: () => {
      const cfg = botDetection.getPolicy();
      const lines = [
        `Server bot policy: ${cfg.policy}`,
      ];
      switch (cfg.policy) {
        case botDetection.POLICIES.BAN:
          lines.push(`  Autoban threshold: ${cfg.banThreshold}. Detected bots are banned.`);
          break;
        case botDetection.POLICIES.ALLOW:
          lines.push('  Bots are welcome. No action is taken against them.');
          break;
        case botDetection.POLICIES.LICENSED:
          lines.push('  Bots must be licensed. Unlicensed automation is throttled.');
          break;
        case botDetection.POLICIES.ZONE_RESTRICTED:
          lines.push(`  Bots may only operate in: ${(cfg.botZones || []).join(', ') || '(no zones configured)'}`);
          break;
        default:
          lines.push('  (policy is custom)');
      }
      lines.push(`Self-labeled bots receive a ${Math.round((cfg.priceDiscount || 0) * 100)}% GE discount.`);
      lines.push('Use /mark-as-bot to self-label for transparency.');
      return lines.join('\n');
    },
  });

  // ── /mark-as-bot ─────────────────────────────────────────────────────────
  commands.register('mark-as-bot', {
    help: 'Self-label your account as a bot (transparency). [on|off]',
    category: 'Account',
    aliases: ['markasbot'],
    fn: (p, args) => {
      const sub = (args[0] || '').toLowerCase();
      let next = true;
      if (sub === 'off' || sub === 'false' || sub === '0' || sub === 'no') next = false;
      botDetection.markAsBot(p, next);
      if (next) {
        const cfg = botDetection.getPolicy();
        return [
          'Your account is now flagged as a bot.',
          `You will receive a ${Math.round((cfg.priceDiscount || 0) * 100)}% discount on GE prices.`,
          'Server policy: ' + cfg.policy + '.',
          'Use /mark-as-bot off to remove the flag.',
        ].join('\n');
      }
      return 'Bot flag removed from your account.';
    },
  });

  // ── /botscore ─────────────────────────────────────────────────────────────
  commands.register('botscore', {
    help: 'Show bot score for yourself or another player (admin only).',
    category: 'Admin',
    admin: true,
    fn: (p, args) => {
      let target = p;
      if (args[0]) {
        if (findPlayer) {
          const found = findPlayer(args[0]);
          if (!found) return `No such player: ${args[0]}`;
          target = found;
        } else {
          return 'findPlayer not wired — cannot look up by name.';
        }
      }
      const score = botDetection.getBotScore(target);
      const sig = target && target.botSignals;
      const analysis = sig && sig.lastAnalysis;
      const lines = [
        `Bot score for ${target.name || target.id}: ${score.toFixed(3)} (${label(score)})`,
      ];
      if (analysis && analysis.breakdown) {
        lines.push('Breakdown:');
        for (const [k, v] of Object.entries(analysis.breakdown)) {
          lines.push(`  ${k}: ${Number(v).toFixed(3)}`);
        }
      }
      lines.push(`Self-labeled: ${!!(sig && sig.isBot)}`);
      lines.push(`Honeypot hits: ${(sig && sig.honeypotHits) || 0}`);
      lines.push(`Escalated: ${!!(sig && sig.escalated)}`);
      return lines.join('\n');
    },
  });

  // ── /honeypot ─────────────────────────────────────────────────────────────
  commands.register('honeypot', {
    help: 'Place, list, or inspect honeypots (admin).',
    category: 'Admin',
    admin: true,
    fn: (p, args) => {
      const sub = (args[0] || '').toLowerCase();

      if (sub === 'place') {
        const kind = args[1];
        const x = Number(args[2]);
        const y = Number(args[3]);
        if (!kind) return `Usage: honeypot place <kind> [x y]. Kinds: ${Object.values(botDetection.HONEYPOT_KINDS).join(', ')}`;
        const res = botDetection.placeHoneypot(kind, x, y, { placedBy: p.id });
        if (!res.ok) return res.reason;
        return `Placed ${res.honeypot.kind} honeypot #${res.honeypot.id}`
          + (Number.isFinite(res.honeypot.x) ? ` at (${res.honeypot.x}, ${res.honeypot.y})` : '');
      }

      if (sub === 'list' || sub === '' || sub === undefined) {
        const hps = botDetection.listHoneypots();
        if (!hps.length) return '(no honeypots placed)';
        const lines = [`Honeypots (${hps.length}):`];
        for (const hp of hps) {
          const loc = Number.isFinite(hp.x) ? `(${hp.x}, ${hp.y})` : '(no loc)';
          lines.push(`  #${hp.id} ${hp.kind} ${loc} hits=${hp.triggered}`);
        }
        return lines.join('\n');
      }

      if (sub === 'remove' || sub === 'delete') {
        const id = Number(args[1]);
        if (!Number.isFinite(id)) return 'Usage: honeypot remove <id>';
        const ok = botDetection.removeHoneypot(id);
        return ok ? `Removed honeypot #${id}.` : `No such honeypot: ${id}`;
      }

      if (sub === 'escalations' || sub === 'queue') {
        const list = botDetection.getEscalations();
        if (!list.length) return '(no escalations)';
        const lines = [`Escalations (${list.length}):`];
        for (const e of list.slice(-10)) {
          lines.push(`  tick ${e.tick}: ${e.playerName || e.playerId} — ${e.reason} (score ${e.score.toFixed(3)})`);
        }
        return lines.join('\n');
      }

      return `Usage: honeypot <place|list|remove|escalations> ...`;
    },
  });
}

function label(score) {
  if (score >= 0.9) return 'very high';
  if (score >= 0.7) return 'high';
  if (score >= 0.5) return 'moderate';
  if (score >= 0.3) return 'low';
  return 'very low';
}

module.exports = { register, usage };
