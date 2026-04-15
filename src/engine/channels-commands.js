// ══════════════════════════════════════════════════════════════════════════════
// Channels — Chat Commands (burn-v2)
//
// Installs the chat-command family via the central command registry in
// src/engine/commands.js. Callers pass a small adapter so this module can
// (a) find other players by name, (b) enumerate the online population, and
// (c) know the server's current tick if it matters for the log meta.
//
// Usage from the server bootstrap:
//
//   const channelsCommands = require('./engine/channels-commands');
//   channelsCommands.register({
//     commands,                 // src/engine/commands.js
//     channels,                 // src/engine/channels.js
//     quickchat,                // src/content/aelgard/quickchat-presets
//     findPlayer,               // (name) => player
//     listPlayers,              // () => player[]   (optional, for audiences)
//     deliver,                  // (recipient, message) => void   (optional)
//   });
//
// Commands installed:
//   /say    <msg>                public chat
//   /tell   <player> <msg>       private whisper
//   /clan   <msg>                clan chat
//   /trade  <msg>                trade channel
//   /help   <msg>                help channel
//   /region <msg>                region chat
//   /f      <player> <msg>       friends chat to a single friend
//   /qc     <preset_id>          quick chat preset
//   /channel list                list accessible channels
//   /channel mute   <channel>    mute a channel for yourself
//   /channel unmute <channel>    unmute a channel
//   /friends add|remove|list     friends list management
//   /ignore add|remove|list      ignore list management
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

// ── Helpers ────────────────────────────────────────────────────────────────
function joinRest(args, from = 0) {
  return args.slice(from).join(' ').trim();
}

function resolvePlayer(findPlayer, nameOrId) {
  if (!findPlayer || !nameOrId) return null;
  return findPlayer(nameOrId) || null;
}

function formatSendResult(res, channelMeta) {
  if (res.ok) {
    const tag = channelMeta ? `[${channelMeta.tag}] ` : '';
    return `${tag}${res.message.speakerName}: ${res.message.text}`;
  }
  return `[${channelMeta ? channelMeta.tag : '?'}] ${res.reason}`;
}

function deliverToAudience(res, deliver, listPlayers, ctx) {
  if (!res || !res.ok) return 0;
  if (!deliver || !listPlayers) return 0;
  const audience = res.audienceFn(listPlayers());
  let n = 0;
  for (const r of audience) {
    try { deliver(r, res.message); n++; } catch (e) { /* non-fatal */ }
  }
  return n;
}

// ── Register ────────────────────────────────────────────────────────────────
function register(opts) {
  const commands = opts && opts.commands;
  const channels = opts && opts.channels;
  const quickchat = opts && opts.quickchat;
  if (!commands) throw new Error('channels-commands.register: commands module required');
  if (!channels) throw new Error('channels-commands.register: channels module required');
  if (!quickchat) throw new Error('channels-commands.register: quickchat module required');
  const findPlayer = typeof opts.findPlayer === 'function' ? opts.findPlayer : null;
  const listPlayers = typeof opts.listPlayers === 'function' ? opts.listPlayers : null;
  const deliver = typeof opts.deliver === 'function' ? opts.deliver : null;

  // /say <msg>
  commands.register('say', {
    help: 'Speak publicly to nearby players (20 tiles).',
    category: 'Chat',
    aliases: ['s', 'public'],
    fn: (p, args) => {
      const text = joinRest(args);
      if (!text) return 'Usage: say <msg>';
      const res = channels.sendMessage(p, 'public', text);
      deliverToAudience(res, deliver, listPlayers, {});
      return formatSendResult(res, channels.CHANNELS.public);
    },
  });

  // /tell <player> <msg>
  commands.register('tell', {
    help: 'Send a private whisper: tell <player> <msg>',
    category: 'Chat',
    aliases: ['msg', 'w', 'whisper'],
    fn: (p, args) => {
      const targetName = args[0];
      const text = joinRest(args, 1);
      if (!targetName || !text) return 'Usage: tell <player> <msg>';
      const target = resolvePlayer(findPlayer, targetName);
      if (!target) return `Player '${targetName}' not found.`;
      if (target.id === p.id) return 'Cannot whisper yourself.';
      // Recipient has ignored us?
      if (channels.isIgnored(target, p.id)) {
        return `${target.name || targetName} is unavailable.`;
      }
      const ctx = { recipient: target };
      const res = channels.sendMessage(p, 'private', text, { ctx, recipientId: target.id });
      if (res.ok && deliver) { try { deliver(target, res.message); } catch (e) { /* noop */ } }
      return formatSendResult(res, channels.CHANNELS.private);
    },
  });

  // /clan <msg>
  commands.register('clan', {
    help: 'Send a message to your clan channel.',
    category: 'Chat',
    fn: (p, args) => {
      const text = joinRest(args);
      if (!text) return 'Usage: clan <msg>';
      const res = channels.sendMessage(p, 'clan', text);
      deliverToAudience(res, deliver, listPlayers, {});
      return formatSendResult(res, channels.CHANNELS.clan);
    },
  });

  // /trade <msg>
  commands.register('trade', {
    help: 'Post to the global trade channel.',
    category: 'Chat',
    fn: (p, args) => {
      const text = joinRest(args);
      if (!text) return 'Usage: trade <msg>';
      const res = channels.sendMessage(p, 'trade', text);
      deliverToAudience(res, deliver, listPlayers, {});
      return formatSendResult(res, channels.CHANNELS.trade);
    },
  });

  // /help <msg>
  commands.register('help', {
    help: 'Ask a question in the global help channel.',
    category: 'Chat',
    aliases: ['newbie'],
    fn: (p, args) => {
      const text = joinRest(args);
      if (!text) return 'Usage: help <msg>';
      const res = channels.sendMessage(p, 'help', text);
      deliverToAudience(res, deliver, listPlayers, {});
      return formatSendResult(res, channels.CHANNELS.help);
    },
  });

  // /region <msg>
  commands.register('region', {
    help: 'Chat with everyone in the same region.',
    category: 'Chat',
    fn: (p, args) => {
      const text = joinRest(args);
      if (!text) return 'Usage: region <msg>';
      const res = channels.sendMessage(p, 'region', text, {
        ctx: { regionId: p.region || p.regionId || null },
      });
      deliverToAudience(res, deliver, listPlayers, { regionId: p.region || p.regionId || null });
      return formatSendResult(res, channels.CHANNELS.region);
    },
  });

  // /f <player> <msg>
  commands.register('f', {
    help: 'Friends chat: f <player> <msg>',
    category: 'Chat',
    aliases: ['friend'],
    fn: (p, args) => {
      const targetName = args[0];
      const text = joinRest(args, 1);
      if (!targetName || !text) return 'Usage: f <player> <msg>';
      const target = resolvePlayer(findPlayer, targetName);
      if (!target) return `Player '${targetName}' not found.`;
      if (!channels.isFriend(p, target.id) && !channels.isFriend(target, p.id)) {
        return 'Not on your friends list.';
      }
      const res = channels.sendMessage(p, 'friends', text, {
        ctx: { recipient: target },
        recipientId: target.id,
      });
      if (res.ok && deliver) { try { deliver(target, res.message); } catch (e) { /* noop */ } }
      return formatSendResult(res, channels.CHANNELS.friends);
    },
  });

  // /qc <preset_id>
  commands.register('qc', {
    help: 'Quick chat: qc <preset_id>. List with `qc list` or category with `qc greet`.',
    category: 'Chat',
    aliases: ['quick'],
    fn: (p, args) => {
      const sub = (args[0] || '').toLowerCase();
      if (!sub || sub === 'list') {
        const cats = quickchat.listCategories();
        return `Categories: ${cats.join(', ')}. Usage: qc <preset_id>`;
      }
      if (sub === 'cats') {
        return `Categories: ${quickchat.listCategories().join(', ')}`;
      }
      // If arg is a category name, print its presets.
      const catPresets = quickchat.presetsByCategory(sub);
      if (catPresets.length) {
        return catPresets.map(x => `  ${x.id} — "${x.text}"`).join('\n');
      }
      const preset = quickchat.presetById(sub);
      if (!preset) return `Unknown preset '${sub}'. Use 'qc list' or 'qc <category>'.`;
      const res = channels.sendMessage(p, 'quickchat', preset.text, {
        meta: { presetId: preset.id, category: preset.category },
      });
      deliverToAudience(res, deliver, listPlayers, {});
      return formatSendResult(res, channels.CHANNELS.quickchat);
    },
  });

  // /channel list | mute | unmute
  commands.register('channel', {
    help: 'Channel controls: channel list | mute <id> | unmute <id>',
    category: 'Chat',
    aliases: ['ch'],
    fn: (p, args) => {
      const sub = (args[0] || '').toLowerCase();
      if (!sub || sub === 'list') {
        const list = channels.listAccessibleChannels(p);
        const lines = list.map(e => {
          const status = e.canSend ? 'send' : 'view-only';
          const muted = e.muted ? ' (muted)' : '';
          const note = e.reason ? ` — ${e.reason}` : '';
          return `  [${e.tag}] ${e.name} — ${status}${muted}${note}`;
        });
        return ['Channels:'].concat(lines).join('\n');
      }
      if (sub === 'mute' || sub === 'unmute') {
        const id = (args[1] || '').toLowerCase();
        if (!id) return `Usage: channel ${sub} <channel>`;
        const r = sub === 'mute' ? channels.mute(p, id) : channels.unmute(p, id);
        if (!r.ok) return r.reason;
        return `${sub === 'mute' ? 'Muted' : 'Unmuted'} ${id}.`;
      }
      return 'Usage: channel list | mute <id> | unmute <id>';
    },
  });

  // /friends add | remove | list
  commands.register('friends', {
    help: 'Friends list: friends add <player> | remove <player> | list',
    category: 'Chat',
    fn: (p, args) => {
      const sub = (args[0] || '').toLowerCase();
      if (!sub || sub === 'list') {
        channels.ensureState(p);
        const list = p.friends || [];
        if (!list.length) return 'Friends list empty.';
        return `Friends (${list.length}): ${list.join(', ')}`;
      }
      const targetName = args[1];
      if (!targetName) return `Usage: friends ${sub} <player>`;
      const t = resolvePlayer(findPlayer, targetName);
      const targetId = t && t.id != null ? t.id : targetName;
      if (sub === 'add') {
        const r = channels.addFriend(p, targetId);
        return r.ok ? `Added ${targetId} to friends.` : r.reason;
      }
      if (sub === 'remove' || sub === 'del') {
        const r = channels.removeFriend(p, targetId);
        return r.ok ? `Removed ${targetId} from friends.` : r.reason;
      }
      return 'Usage: friends add|remove|list';
    },
  });

  // /ignore add | remove | list
  commands.register('ignore', {
    help: 'Ignore list (private): ignore add <player> | remove <player> | list',
    category: 'Chat',
    fn: (p, args) => {
      const sub = (args[0] || '').toLowerCase();
      if (!sub || sub === 'list') {
        channels.ensureState(p);
        const list = p.ignored || [];
        if (!list.length) return 'Ignore list empty.';
        return `Ignored (${list.length}): ${list.join(', ')}`;
      }
      const targetName = args[1];
      if (!targetName) return `Usage: ignore ${sub} <player>`;
      const t = resolvePlayer(findPlayer, targetName);
      const targetId = t && t.id != null ? t.id : targetName;
      if (sub === 'add') {
        const r = channels.ignore(p, targetId);
        return r.ok ? `Ignored ${targetId}.` : r.reason;
      }
      if (sub === 'remove' || sub === 'del' || sub === 'un') {
        const r = channels.unignore(p, targetId);
        return r.ok ? `Unignored ${targetId}.` : r.reason;
      }
      return 'Usage: ignore add|remove|list';
    },
  });
}

module.exports = { register };
