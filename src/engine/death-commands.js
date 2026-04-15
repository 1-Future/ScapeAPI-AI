// ══════════════════════════════════════════════════════════════════════════════
// Death — Chat Commands
//
// Player-facing handlers for the death/respawn subsystem. Wires to the chat
// command registry without touching src/commands/all.js or src/server.js.
//
// Usage from the server bootstrap (called ONCE on startup):
//
//   const deathCommands = require('./engine/death-commands');
//   deathCommands.register({
//     commands,                // src/engine/commands.js
//     death,                   // src/engine/death.js (already registered)
//     items,                   // src/data/items
//   });
//
// Commands installed:
//   /claim [graveId]       — picks up grave contents if within 1 tile
//   /graves                — lists this player's unclaimed graves
//   /sethome <region>      — sets respawn point to a region the player visited
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

// ── Hard-coded teleport targets per known region ─────────────────────────────
// These are "Lumbridge-equivalent" home points for each Aelgard region. The
// coordinates come from world-layout.js ("Heartlands center: (100, 90)") and
// sensible defaults for the other seven regions defined in that file.
const REGION_HOMES = Object.freeze({
  heartlands:      { region: 'heartlands',      x: 100, y: 90  },
  boneyard_wastes: { region: 'boneyard_wastes', x: 120, y: 150 },
  veilwood:        { region: 'veilwood',        x: 50,  y: 80  },
  sootworks:       { region: 'sootworks',       x: 160, y: 95  },
  glass_desert:    { region: 'glass_desert',    x: 210, y: 160 },
  saltbrine:       { region: 'saltbrine',       x: 60,  y: 180 },
  inkweald:        { region: 'inkweald',        x: 40,  y: 40  },
  moryskah:        { region: 'moryskah',        x: 200, y: 40  },
});

function ticksToHuman(ticks) {
  const seconds = Math.max(0, Math.floor(ticks * 0.6));
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}m ${sec}s`;
}

function register(opts) {
  opts = opts || {};
  const commands = opts.commands;
  const death = opts.death;
  if (!commands) throw new Error('death-commands.register: commands module required');
  if (!death)    throw new Error('death-commands.register: death module required');

  // Utility — current tick (prefer the adapter that death.js was registered
  // with; fall back to tick.js).
  let getTick = opts.getTick;
  if (!getTick) {
    try { const tick = require('./tick'); getTick = () => tick.getTick(); }
    catch (_) { getTick = () => 0; }
  }

  // ── /claim [graveId] ──────────────────────────────────────────────────────
  commands.register('claim', {
    category: 'Death',
    help: 'Claim dropped items from a grave (use near the grave).',
    aliases: ['loot-grave'],
    fn: (player, args) => {
      let graveId = args && args[0] ? String(args[0]) : null;

      if (!graveId) {
        // Most recent grave owned by this player that hasn't expired.
        const mine = death.listGraves({ ownerId: player.id })
          .filter(g => !g.memorial)
          .sort((a, b) => b.placedAt - a.placedAt);
        if (!mine.length) return 'You have no unclaimed graves.';
        graveId = mine[0].id;
      }

      const grave = death.getGrave(graveId);
      if (!grave) return `No grave with id ${graveId}.`;

      const result = death.claimGrave(player, graveId);
      if (!result.ok) {
        switch (result.reason) {
          case 'not_found':           return 'That grave is gone.';
          case 'expired':             return 'That grave has expired. The items are lost.';
          case 'too_far':             return 'You must stand next to the grave to claim it.';
          case 'ironman_owner_only':  return 'Only the owner of this grave can loot it.';
          case 'memorial':            return 'This is a memorial. It is not lootable.';
          default:                    return `Cannot claim grave: ${result.reason}.`;
        }
      }
      const count = result.items.length;
      const remaining = result.remaining || 0;
      if (remaining > 0) {
        return `Reclaimed ${count} item(s). ${remaining} left in the grave — free up inventory space.`;
      }
      return `Reclaimed ${count} item(s) from your grave.`;
    },
  });

  // ── /graves ──────────────────────────────────────────────────────────────
  commands.register('graves', {
    category: 'Death',
    help: 'List your unclaimed graves.',
    aliases: ['mygraves'],
    fn: (player) => {
      const list = death.listGraves({ ownerId: player.id });
      if (!list.length) return 'You have no active graves.';
      const now = getTick();
      const lines = ['Your graves:'];
      list.sort((a, b) => b.placedAt - a.placedAt);
      for (const g of list) {
        const loc = g.location;
        const items = g.items || [];
        const itemSummary = items.length === 0 ? '(empty)'
          : items.slice(0, 4).map(it => `${it.name || it.id}${it.count > 1 ? ` x${it.count}` : ''}`).join(', ')
            + (items.length > 4 ? `, +${items.length - 4} more` : '');
        let timeLeft;
        if (g.memorial) timeLeft = 'memorial';
        else if (g.expiresAt === Infinity) timeLeft = 'permanent';
        else timeLeft = ticksToHuman(g.expiresAt - now);
        lines.push(`  ${g.id} — ${loc.region} (${loc.x},${loc.y}) — ${itemSummary} — ${timeLeft}`);
      }
      return lines.join('\n');
    },
  });

  // ── /sethome <region> ────────────────────────────────────────────────────
  commands.register('sethome', {
    category: 'Death',
    help: 'Set your respawn point to a region you have visited.',
    fn: (player, args) => {
      if (!args || !args.length) {
        const cur = death.getRespawnPoint(player);
        return `Respawn point: ${cur.region} (${cur.x}, ${cur.y}). Usage: /sethome <region>`;
      }
      const regionKey = String(args[0]).toLowerCase().replace(/[^a-z_]/g, '');
      const target = REGION_HOMES[regionKey];
      if (!target) {
        return `Unknown region. Known: ${Object.keys(REGION_HOMES).join(', ')}.`;
      }
      // Must have visited the region.
      const visited = player.visitedRegions;
      let hasVisited = false;
      if (visited) {
        if (typeof visited.has === 'function') hasVisited = visited.has(regionKey);
        else if (Array.isArray(visited))         hasVisited = visited.includes(regionKey);
        else if (typeof visited === 'object')    hasVisited = !!visited[regionKey];
      }
      if (regionKey === 'heartlands') hasVisited = true; // Always allowed — the starter town.
      if (!hasVisited) {
        return `You must visit ${regionKey} at least once before you can set your home there.`;
      }
      death.setRespawnPoint(player, target);
      return `Your respawn point is now ${target.region} (${target.x}, ${target.y}).`;
    },
  });
}

module.exports = { register, REGION_HOMES };
