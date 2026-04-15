// ══════════════════════════════════════════════════════════════════════════════
// Tutorial — Chat Commands
//
// Wires the /tutorial command family into the central command registry. The
// server bootstrap calls register({ commands, tutorial }) once during startup.
//
// Sub-commands:
//   /tutorial              — show status (default)
//   /tutorial status       — same as above, explicit
//   /tutorial hint         — re-show the current step hint
//   /tutorial skip         — permanently skip the tutorial (one-way)
//   /tutorial replay       — replay from step 1, ungated; rewards suppressed
//
// Output style: parchment-friendly plain text. No emojis, no colour codes.
// The progress bar uses `#` filled / `-` empty, 24 columns wide.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const defaultTutorial = require('./tutorial');

function renderStatus(tutorial, player) {
  const s = tutorial.status(player);
  const bar = tutorial.progressBar(player);
  if (s.complete) {
    const tag = s.skipped ? ' (skipped)' : s.replay ? ' (replay complete)' : '';
    return [
      `── Tutorial${tag} ──`,
      `${bar}`,
      `Status: COMPLETE — the world is yours.`,
      `Type \`/tutorial replay\` to revisit the steps out of curiosity.`,
    ].join('\n');
  }
  const cur = s.current;
  const out = [
    `── Tutorial ──`,
    `${bar}  (${s.percent}%)`,
  ];
  if (cur) {
    out.push(`Current: ${cur.title}`);
    out.push(`  ${cur.hint}`);
  }
  out.push('');
  out.push('Sub-commands: status | hint | skip | replay');
  return out.join('\n');
}

function register(opts) {
  opts = opts || {};
  const commands = opts.commands || require('./commands');
  const tutorial = opts.tutorial || defaultTutorial;

  commands.register('tutorial', {
    category: 'General',
    help: 'Tutorial: /tutorial [status|hint|skip|replay]',
    fn: (player, args) => {
      const sub = (args && args[0] ? String(args[0]) : '').toLowerCase();

      // Ensure state is initialised — defensive for older saves that pre-date
      // the new fields.
      tutorial.initPlayer(player);

      // ── status (default) ─────────────────────────────────────────────────
      if (!sub || sub === 'status' || sub === 'progress' || sub === 'progress-bar') {
        return renderStatus(tutorial, player);
      }

      // ── hint ─────────────────────────────────────────────────────────────
      if (sub === 'hint' || sub === 'help') {
        return tutorial.hint(player);
      }

      // ── skip ─────────────────────────────────────────────────────────────
      if (sub === 'skip') {
        if (player.tutorialComplete) {
          return 'The tutorial is already complete. Nothing to skip.';
        }
        const result = tutorial.skip(player);
        if (!result.ok) return `Cannot skip: ${result.reason}`;
        return [
          '── Tutorial Skipped ──',
          'The parchment folds itself and tucks into your pack.',
          result.message,
          'The world is open. Type `help` for the full command list.',
        ].join('\n');
      }

      // ── replay ───────────────────────────────────────────────────────────
      if (sub === 'replay' || sub === 'reset' || sub === 'restart') {
        const result = tutorial.replay(player);
        if (!result.ok) return `Cannot replay: ${result.reason}`;
        return [
          '── Tutorial Replay ──',
          'The parchment is fresh again. Rewards are suppressed this time.',
          renderStatus(tutorial, player),
        ].join('\n');
      }

      return 'Usage: /tutorial [status|hint|skip|replay]';
    },
  });
}

module.exports = { register, renderStatus };
