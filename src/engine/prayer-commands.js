// ══════════════════════════════════════════════════════════════════════════════
// Prayer — Chat Commands
//
// Installs /pray and /prayer (toggle + altar + status + clear) via the central
// command registry without touching src/commands/all.js.
//
// Register from the server bootstrap:
//
//   const prayerCommands = require('./engine/prayer-commands');
//   prayerCommands.register({ commands, prayerRunner });
//
// Commands installed:
//   /pray <prayer>              toggle a named prayer
//   /prayer points              show current/max prayer points
//   /prayer clear               deactivate all prayers
//   /prayer list                list active prayers with drain rate
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const playerLib = require('../player/player');

function usage() {
  return [
    'Usage:',
    '  pray <prayer_id>       toggle a prayer (e.g. `pray piety`)',
    '  prayer points          show current/max prayer points',
    '  prayer clear           deactivate all prayers',
    '  prayer list            list active prayers with per-tick drain',
  ].join('\n');
}

function normaliseId(raw) {
  return (raw || '').trim().toLowerCase().replace(/\s+/g, '_');
}

function register(opts) {
  const commands     = opts && opts.commands;
  const prayerRunner = (opts && opts.prayerRunner) || require('./prayer-runner');
  const overridePray = !!(opts && opts.overridePray); // default: don't stomp on the existing all.js /pray
  if (!commands) throw new Error('prayer-commands.register: commands module required');

  if (overridePray) {
    // /pray <prayer>        — toggle a single prayer via prayer-runner
    commands.register('pray', {
      help: 'Toggle prayer: pray <id> (e.g. pray piety)',
      category: 'Combat',
      fn: (p, args) => {
        const raw = (args[0] || '').toLowerCase();
        if (!raw || raw === 'off') {
          const n = prayerRunner.clear(p);
          return n ? `Deactivated ${n} prayer(s).` : 'No prayers active.';
        }
        const id = normaliseId(args.join(' '));
        const res = prayerRunner.activate(p, id);
        if (!res.ok) return res.reason;
        if (res.toggled === 'off') return `${res.prayer.name} off. Prayer: ${p.prayerPoints}/${playerLib.getLevel(p, 'prayer')}`;
        return `${res.prayer.name} on. Prayer: ${p.prayerPoints}/${playerLib.getLevel(p, 'prayer')}`;
      },
    });
  }

  // /prayer <sub>         — points, clear, list
  commands.register('prayer', {
    help: 'Prayer sub-commands: prayer points | prayer clear | prayer list',
    category: 'Combat',
    fn: (p, args) => {
      const sub = (args[0] || '').toLowerCase();

      if (sub === 'points' || sub === '' || sub === 'status') {
        const max = playerLib.getLevel(p, 'prayer');
        const active = prayerRunner.listActive(p);
        let out = `Prayer: ${p.prayerPoints}/${max}`;
        if (active.length) out += `\nActive: ${active.join(', ')}`;
        return out;
      }

      if (sub === 'clear' || sub === 'off') {
        const n = prayerRunner.clear(p);
        return n ? `Deactivated ${n} prayer(s).` : 'No prayers active.';
      }

      if (sub === 'list' || sub === 'active') {
        const active = prayerRunner.listActive(p);
        if (!active.length) return 'No prayers active.';
        const drain = prayerRunner.drainRate(p);
        const lines = [`Active prayers (drain ${drain.toFixed(3)} pts/tick):`];
        for (const id of active) {
          const def = prayerRunner.getDef(id);
          lines.push(`  ${id}${def ? ' — ' + def.effect : ''}`);
        }
        return lines.join('\n');
      }

      if (sub === 'help') return usage();

      return usage();
    },
  });
}

module.exports = { register, usage };
