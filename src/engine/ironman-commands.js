// ══════════════════════════════════════════════════════════════════════════════
// Ironman — Chat Commands
//
// Installs the `/ironman` command family via the central command registry,
// without touching src/commands/all.js or src/server.js.
//
// Usage from the server bootstrap:
//
//   const ironmanCommands = require('./engine/ironman-commands');
//   ironmanCommands.register({
//     commands,          // src/engine/commands.js
//     ironman,           // src/engine/ironman.js
//     findPlayer,        // (name) => player (optional, for invite by name)
//     getTick,           // () => currentTick (optional)
//   });
//
// Commands installed:
//   /ironman start <variant>        enable mode permanently
//                                   variants: ironman | hardcore | ultimate | group
//   /ironman status                 show variant + restrictions
//   /ironman group invite <id|name> invite a player to a group_ironman group
//   /ironman group leave            leave the group, downgrade to regular ironman
//   /ironman group list             list current group members
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

// Variant aliases the player can type. Mapped to internal variant ids.
const VARIANT_ALIASES = Object.freeze({
  ironman:          'ironman',
  im:               'ironman',
  iron:             'ironman',
  hardcore:         'hardcore_ironman',
  hardcore_ironman: 'hardcore_ironman',
  hcim:             'hardcore_ironman',
  hard:             'hardcore_ironman',
  ultimate:         'ultimate_ironman',
  ultimate_ironman: 'ultimate_ironman',
  uim:              'ultimate_ironman',
  ult:              'ultimate_ironman',
  group:            'group_ironman',
  group_ironman:    'group_ironman',
  gim:              'group_ironman',
});

function usage() {
  return [
    'Usage:',
    '  ironman start <ironman|hardcore|ultimate|group>   enable mode (permanent)',
    '  ironman status                                     show variant + restrictions',
    '  ironman group invite <playerId|name>              (group only)',
    '  ironman group leave                                (group only) downgrade to regular ironman',
    '  ironman group list                                 list your group members',
  ].join('\n');
}

function register(opts) {
  const commands = opts && opts.commands;
  const ironman  = opts && opts.ironman;
  if (!commands) throw new Error('ironman-commands.register: commands module required');
  if (!ironman)  throw new Error('ironman-commands.register: ironman module required');

  const findPlayer = (typeof opts.findPlayer === 'function') ? opts.findPlayer : null;
  if (typeof opts.getTick === 'function') ironman.setTickSource(opts.getTick);

  commands.register('ironman', {
    help: 'Ironman account mode: ironman start/status/group',
    category: 'General',
    aliases: ['im'],
    fn: (p, args) => {
      const sub = (args[0] || '').toLowerCase();

      // ── ironman start <variant> ─────────────────────────────────────────
      if (sub === 'start' || sub === 'enable' || sub === 'set') {
        const raw = (args[1] || '').toLowerCase();
        if (!raw) return `Specify a variant.\n${usage()}`;
        const variant = VARIANT_ALIASES[raw];
        if (!variant) return `Unknown variant "${raw}". Options: ironman, hardcore, ultimate, group.`;
        const res = ironman.enableMode(p, variant);
        if (!res.ok) return res.reason;
        const lines = [`You are now a ${ironman.labelFor(p)}.`];
        for (const r of ironman.restrictionsFor(p)) lines.push('  - ' + r);
        return lines.join('\n');
      }

      // ── ironman status ──────────────────────────────────────────────────
      if (sub === 'status' || sub === '' || sub === 'info') {
        if (!ironman.isIronman(p)) {
          return [
            'Account mode: Normal (no restrictions).',
            'Use `ironman start <variant>` to become an Ironman. This is permanent.',
            'Variants: ironman, hardcore, ultimate, group.',
          ].join('\n');
        }
        const lines = [`Account mode: ${ironman.labelFor(p)}.`];
        for (const r of ironman.restrictionsFor(p)) lines.push('  - ' + r);
        if (ironman.getVariant(p) === ironman.VARIANTS.group_ironman) {
          const group = (p.ironman && p.ironman.group) || [];
          lines.push(`Group members (${group.length}/${ironman.GROUP_CAP}): ${group.length ? group.join(', ') : '(none)'}`);
        }
        return lines.join('\n');
      }

      // ── ironman group ... ────────────────────────────────────────────────
      if (sub === 'group') {
        const gSub = (args[1] || '').toLowerCase();

        // ironman group list
        if (gSub === 'list' || gSub === '') {
          if (!ironman.isIronman(p)) return 'You are not an Ironman.';
          if (ironman.getVariant(p) !== ironman.VARIANTS.group_ironman) {
            return 'You are not in a Group Ironman group.';
          }
          const group = (p.ironman && p.ironman.group) || [];
          if (!group.length) return 'Your group is empty. Invite with: ironman group invite <id|name>';
          return `Group members (${group.length}/${ironman.GROUP_CAP}): ${group.join(', ')}`;
        }

        // ironman group invite <id|name>
        if (gSub === 'invite' || gSub === 'add') {
          if (!ironman.isIronman(p)) return 'You are not an Ironman.';
          if (ironman.getVariant(p) !== ironman.VARIANTS.group_ironman) {
            return 'Only Group Ironmen can invite group members.';
          }
          const target = args.slice(2).join(' ').trim();
          if (!target) return 'Usage: ironman group invite <playerId|name>';

          let memberId = target;
          if (findPlayer) {
            const other = findPlayer(target);
            if (other && other.id != null) memberId = other.id;
          }
          const res = ironman.groupAdd(p, memberId);
          if (!res.ok) return res.reason;
          return `Added ${memberId} to your group. Size: ${res.group.length}/${ironman.GROUP_CAP}.`;
        }

        // ironman group remove <id|name>
        if (gSub === 'remove' || gSub === 'kick') {
          if (!ironman.isIronman(p)) return 'You are not an Ironman.';
          const target = args.slice(2).join(' ').trim();
          if (!target) return 'Usage: ironman group remove <playerId|name>';
          let memberId = target;
          if (findPlayer) {
            const other = findPlayer(target);
            if (other && other.id != null) memberId = other.id;
          }
          const res = ironman.groupRemove(p, memberId);
          if (!res.ok) return res.reason;
          return `Removed ${memberId}. Size: ${res.group.length}/${ironman.GROUP_CAP}.`;
        }

        // ironman group leave
        if (gSub === 'leave' || gSub === 'quit') {
          if (!ironman.isIronman(p)) return 'You are not an Ironman.';
          const res = ironman.groupLeave(p);
          return res.reason;
        }

        return `Unknown group sub-command: ${gSub}\n${usage()}`;
      }

      return usage();
    },
  });
}

module.exports = { register };
