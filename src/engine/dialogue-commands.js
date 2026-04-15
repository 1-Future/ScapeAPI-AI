// ══════════════════════════════════════════════════════════════════════════════
// Dialogue Commands — /talk <npcId>, follow-up routing, /bye
//
// Exposes a single register(server) function. The server is expected to provide
// at minimum:
//   - server.commands     → engine/commands singleton (has .register(name, opts))
//   - server.findPlayer   → optional lookup by id/name (unused by this module)
//   - server.findNpc      → (npcId, player) → { id, x, y, layer, name } or null
//   - server.distance     → optional (a, b) → tiles; if absent we use Chebyshev
//
// Does NOT modify src/commands/all.js or src/server.js — bootstrap calls this
// module's register() explicitly at startup once dialogue is ready.
//
// Session model (per player):
//   player.activeDialogue = {
//     npcId,
//     npcName,
//     startedAt,     // tick
//     history: [{ role: 'player'|'npc', text, ts }, ...]  // capped at last 8 turns
//   }
//
// Lifecycle:
//   1. `/talk <npcId>` opens a session and sends a cold-open turn through
//      dialogue.talk(); NPC lines flow back via the command's return string.
//   2. Subsequent non-slash input is intercepted by routePlayerInput() — if
//      the player has an active dialogue and the NPC is still within 3 tiles,
//      the input is sent to dialogue.talk() as a follow-up line.
//   3. `/bye` or distance > 3 tears down the session.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const dialogue = require('../ai/dialogue');

const HISTORY_CAP = 8;
const WALK_AWAY_TILES = 3;

function chebyshev(a, b) {
  if (!a || !b) return Infinity;
  return Math.max(Math.abs((a.x || 0) - (b.x || 0)), Math.abs((a.y || 0) - (b.y || 0)));
}

function pushTurn(session, role, text) {
  session.history.push({ role, text, ts: Date.now() });
  while (session.history.length > HISTORY_CAP) session.history.shift();
}

function formatReply(session, response) {
  const npcName = session.npcName || session.npcId;
  const bodyLines = (response.lines || []).map(l => `${npcName}: "${l}"`);
  const optionLines = (response.options || []).length
    ? ['Options:', ...response.options.map((o, i) => `  ${i + 1}. ${o}`), '(Reply with your choice, or type `bye` to end.)']
    : ['(Reply to continue, or type `bye` to end.)'];
  return [...bodyLines, '', ...optionLines].join('\n').trim();
}

function endSession(player, reason) {
  const session = player && player.activeDialogue;
  if (!session) return null;
  delete player.activeDialogue;
  return { npcId: session.npcId, npcName: session.npcName, reason: reason || 'manual' };
}

// ── Core handlers ────────────────────────────────────────────────────────────
async function handleTalk(ctx, player, args) {
  const { findNpc } = ctx;
  const npcId = (args[0] || '').toLowerCase();
  if (!npcId) return 'Usage: /talk <npcId>';

  const bible = dialogue.getBible(npcId);
  if (!bible) {
    return `No record of "${npcId}" in the character registry.`;
  }

  const npc = findNpc ? findNpc(npcId, player) : null;
  // We allow talk without an npc world-object (for CLI / tests); in that case
  // there is no distance check.
  if (npc && chebyshev(npc, player) > WALK_AWAY_TILES + 3) {
    return `${bible.name} is too far away to hear you.`;
  }

  // Resume or start a session
  if (player.activeDialogue && player.activeDialogue.npcId === npcId) {
    // Already talking to them — treat as a prompt nudge.
    const response = await dialogue.talk(player, npcId, null, null, { history: player.activeDialogue.history });
    pushTurn(player.activeDialogue, 'npc', response.lines.join(' '));
    return formatReply(player.activeDialogue, response);
  }

  // End any prior conversation first.
  endSession(player, 'switched_npc');

  const session = {
    npcId,
    npcName: bible.name,
    startedAt: (ctx.tick && typeof ctx.tick.getTick === 'function') ? ctx.tick.getTick() : Date.now(),
    history: [],
  };
  player.activeDialogue = session;

  const response = await dialogue.talk(player, npcId, null, null, { history: session.history });
  pushTurn(session, 'npc', response.lines.join(' '));
  return formatReply(session, response);
}

async function handleBye(ctx, player) {
  if (!player.activeDialogue) return 'You are not talking to anyone.';
  const { npcName } = player.activeDialogue;
  endSession(player, 'bye');
  return `You nod to ${npcName || 'them'} and step away.`;
}

// Called by the engine on every player message BEFORE normal command parsing.
// If a session is active and the NPC is still in range, we route it and
// return the NPC's reply. Otherwise we return null (let normal parsing run).
async function routePlayerInput(ctx, player, rawInput) {
  const session = player && player.activeDialogue;
  if (!session) return null;
  const trimmed = (rawInput || '').trim();
  if (!trimmed) return null;

  // Allow players to drop into normal commands by prefixing with '/'
  if (trimmed.startsWith('/')) return null;

  // Distance check
  const { findNpc } = ctx;
  if (findNpc) {
    const npc = findNpc(session.npcId, player);
    if (!npc || chebyshev(npc, player) > WALK_AWAY_TILES) {
      const bible = dialogue.getBible(session.npcId);
      endSession(player, 'walked_away');
      return `You walk out of earshot. ${(bible && bible.name) || 'They'} no longer hear you.`;
    }
  }

  // Keywords that end the session inline.
  if (/^(bye|goodbye|farewell|leave)\b/i.test(trimmed)) {
    const { npcName } = session;
    endSession(player, 'bye');
    return `You nod to ${npcName || 'them'} and step away.`;
  }

  pushTurn(session, 'player', trimmed);
  const response = await dialogue.talk(player, session.npcId, trimmed, null, { history: session.history.slice(0, -1) });
  pushTurn(session, 'npc', response.lines.join(' '));
  return formatReply(session, response);
}

// ── Registration ─────────────────────────────────────────────────────────────
function register(server) {
  if (!server || !server.commands || typeof server.commands.register !== 'function') {
    throw new Error('dialogue-commands.register: server.commands.register is required');
  }

  const ctx = {
    findNpc: server.findNpc || null,
    tick: server.tick || null,
  };

  server.commands.register('talk', {
    help: 'Start a conversation with an NPC by id: /talk <npcId>',
    category: 'World',
    aliases: ['speak'],
    fn: (player, args) => {
      // The engine command layer is synchronous string-returning. We promise
      // back via the command reply path; for engines that don't await, the
      // caller can substitute a Promise-aware wrapper. We fall back to the
      // canned greeting synchronously while Ollama runs if the engine cannot
      // await.
      const promise = handleTalk(ctx, player, args);
      if (server.reply && typeof server.reply === 'function') {
        promise.then(text => server.reply(player, text))
               .catch(e => server.reply(player, `(dialogue error: ${e.message})`));
        return `You turn to address them.`;
      }
      return promise;
    },
  });

  server.commands.register('bye', {
    help: 'End the current conversation',
    category: 'World',
    aliases: ['farewell'],
    fn: (player) => {
      const promise = handleBye(ctx, player);
      if (server.reply && typeof server.reply === 'function') {
        promise.then(text => server.reply(player, text));
        return '';
      }
      return promise;
    },
  });

  // Wire the routePlayerInput hook. The server is expected to call this
  // BEFORE its regular command parsing (server.onInput).
  if (typeof server.setInputHook === 'function') {
    server.setInputHook(async (player, input) => {
      return await routePlayerInput(ctx, player, input);
    });
  }

  // Warm the bibles at startup so the first call doesn't pay the file read.
  dialogue.loadBibles();
  // Also start the cache persistence timer (60s).
  dialogue.startCachePersistence();

  return {
    unregister() {
      dialogue.stopCachePersistence();
    },
  };
}

module.exports = {
  register,
  handleTalk,
  handleBye,
  routePlayerInput,
  endSession,
  HISTORY_CAP,
  WALK_AWAY_TILES,
};
