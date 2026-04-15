// ══════════════════════════════════════════════════════════════════════════════
// Accessibility — Chat Commands
//
// Installs the `/accessibility` family via the central command registry. Does
// not touch src/commands/all.js or src/server.js — server bootstrap calls:
//
//   const acc = require('./engine/accessibility');
//   const accCmds = require('./engine/accessibility-commands');
//   accCmds.register({ commands, accessibility: acc, getTick: () => tick });
//
// Commands:
//   /accessibility prefs                         show current prefs
//   /accessibility set <key> <value>             set one preference
//   /accessibility keymap <action> <key>         rebind one key
//   /accessibility preview                       describe each option
//   /accessibility reset                         restore defaults
//
// Aliases: /a11y, /access
//
// All mutations route through accessibility.setPrefs() so validation is
// centralized. Errors surface as plain text (no exceptions thrown).
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

function usage() {
  return [
    'Usage:',
    '  accessibility prefs                       show current settings',
    '  accessibility set <key> <value>           set one preference',
    '  accessibility keymap <action> <key>       rebind one action',
    '  accessibility preview                     describe each option',
    '  accessibility reset                       restore defaults',
    '',
    'Keys for `set`:',
    '  colorblind      none | deuteranopia | protanopia | tritanopia | achromatopsia',
    '  textSize        1.0 .. 2.0',
    '  highContrast    on | off',
    '  reducedMotion   on | off',
    '  tts             on | off',
    '  screenReader    on | off',
    '  locale          <short string, e.g. "en">',
  ].join('\n');
}

// Coerce player input to the type the validator expects.
function _coerce(key, raw) {
  switch (key) {
    case 'textSize':
      { const n = Number(raw); return isFinite(n) ? n : raw; }
    case 'highContrast':
    case 'reducedMotion':
    case 'tts':
    case 'screenReader': {
      const s = String(raw).toLowerCase();
      if (s === 'on' || s === 'true' || s === '1' || s === 'yes')  return true;
      if (s === 'off' || s === 'false' || s === '0' || s === 'no') return false;
      return raw; // let the validator reject it
    }
    default:
      return String(raw);
  }
}

function register(opts) {
  const commands = opts && opts.commands;
  const accessibility = opts && opts.accessibility;
  if (!commands)      throw new Error('accessibility-commands.register: commands module required');
  if (!accessibility) throw new Error('accessibility-commands.register: accessibility module required');

  if (typeof opts.getTick === 'function') accessibility.setTickSource(opts.getTick);

  commands.register('accessibility', {
    help: 'Accessibility settings: colorblind, text size, TTS, key remap, etc.',
    category: 'General',
    aliases: ['a11y', 'access'],
    fn: (p, args) => {
      const sub = (args[0] || '').toLowerCase();

      // /accessibility prefs  (also the default if no sub)
      if (sub === 'prefs' || sub === 'status' || sub === '' || sub === 'show' || sub === 'get') {
        return accessibility.summarize(p);
      }

      // /accessibility preview
      if (sub === 'preview' || sub === 'help' || sub === 'explain') {
        return accessibility.previewAll();
      }

      // /accessibility reset
      if (sub === 'reset' || sub === 'defaults') {
        accessibility.resetPrefs(p);
        return accessibility.getTranslatedText(
          p, 'accessibility.reset',
          'Accessibility settings restored to defaults.') +
          '\n' + accessibility.summarize(p);
      }

      // /accessibility keymap <action> <key>
      if (sub === 'keymap' || sub === 'rebind' || sub === 'bind') {
        const action = (args[1] || '').toLowerCase();
        const key = args.slice(2).join(' ');
        if (!action || !key) {
          return 'Usage: accessibility keymap <action> <key>\n' +
                 'Actions: ' + accessibility.ACTIONS.join(', ');
        }
        if (accessibility.ACTIONS.indexOf(action) < 0) {
          return `Unknown action "${action}". Valid actions: ${accessibility.ACTIONS.join(', ')}`;
        }
        const res = accessibility.setPrefs(p, { keyRemap: { [action]: key } });
        if (!res.ok) return `Rebind failed: ${res.reason}`;
        return `Bound ${action} to "${key}".`;
      }

      // /accessibility set <key> <value>
      if (sub === 'set' || sub === 'toggle') {
        const key = args[1];
        if (!key) return 'Usage: accessibility set <key> <value>\n' + usage();
        // Reset shortcut: `accessibility set keymap default` wipes the remap.
        if (key === 'keymap' && (args[2] || '').toLowerCase() === 'default') {
          const res = accessibility.setPrefs(p, {
            keyRemap: Object.assign({}, accessibility.DEFAULT_KEYMAP) });
          if (!res.ok) return `Rebind failed: ${res.reason}`;
          return 'Key remap reset to defaults.';
        }
        if (args.length < 3) {
          return `Provide a value. Usage: accessibility set ${key} <value>`;
        }
        const raw = args.slice(2).join(' ');
        const value = _coerce(key, raw);
        const patch = { [key]: value };
        const res = accessibility.setPrefs(p, patch);
        if (!res.ok) return `Rejected: ${res.reason}`;
        return `Set ${key} = ${JSON.stringify(value)}.`;
      }

      return usage();
    },
  });
}

module.exports = { register, usage };
