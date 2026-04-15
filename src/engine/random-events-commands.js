// ══════════════════════════════════════════════════════════════════════════════
// Random Events + Daily Challenge — Chat Commands
//
// Registers the four player-facing commands into the existing command registry
// without touching src/server.js or src/commands/all.js.
//
// Commands:
//   /event respond <response> [arg]   — respond to a pending random event
//                                        (response in: accept, refuse, fight,
//                                         flee, answer)
//   /event list                       — list this player's active events
//   /challenge status                 — show today's challenge
//   /challenge claim                  — claim today's reward when complete
//   /challenge history                — last 10 claimed challenges
//
// Bootstrap:
//   const commands = require('./engine/commands');
//   require('./engine/random-events-commands').register({ commands });
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const randomEvents = require('./random-events');
const daily = require('./daily-challenge');

function fmtOutcome(outcome) {
  if (!outcome) return '';
  if (typeof outcome === 'string') return outcome;
  if (outcome.message) return outcome.message;
  if (outcome.reason)  return outcome.reason;
  return JSON.stringify(outcome);
}

function fmtChallenge(s) {
  if (!s) return 'No daily challenge available.';
  const verb = {
    kill: 'Kill', cook: 'Cook', fish: 'Fish', chop: 'Chop', mine: 'Mine',
    smelt: 'Smelt', craft: 'Craft', fletch: 'Fletch', thieve: 'Pickpocket',
    hunt: 'Hunt', farm: 'Harvest', bury: 'Bury', minigame: 'Complete',
    visit: 'Visit', random_event: 'Complete a random event',
    clue: 'Complete clue (tier:', firemake: 'Burn', agility: 'Complete agility laps',
    ge_profit: 'Earn GE profit of', drop: 'Obtain the rare drop', bank: 'Bank',
  }[s.type] || s.type;
  const target = s.type === 'visit' ? '9 regions' : s.targetName;
  const reward = s.rewardType === 'coins'
    ? `${s.reward} coins`
    : `${s.reward} ${s.rewardSkill || ''} XP`;
  const state = s.claimed ? '[CLAIMED]' : s.complete ? '[READY TO CLAIM]' : `[${s.progress}/${s.goal}]`;
  return [
    `Daily Challenge ${state}`,
    `  id:       ${s.id}`,
    `  task:     ${verb} ${s.goal} ${target}`,
    `  region:   ${s.region || 'any'}`,
    `  tier:     ${s.tier} (x${daily.tierMultiplier(s.tier)})`,
    `  reward:   ${reward}`,
    s.multiDay ? '  note:     multi-day objective; survives day rollover' : '',
  ].filter(Boolean).join('\n');
}

function register(opts) {
  opts = opts || {};
  const commands = opts.commands || require('./commands');

  // ── /event ────────────────────────────────────────────────────────────────
  commands.register('event', {
    category: 'Random Events',
    help: '/event respond <response> [arg] | /event list',
    fn: (p, args) => {
      const sub = (args && args[0] ? String(args[0]) : '').toLowerCase();
      if (sub === 'list' || sub === '' || sub === undefined) {
        const active = randomEvents.listActiveEvents(p);
        if (!active.length) return 'No active random events.';
        return active.map(e => {
          return [
            `── ${e.name} (${e.id}) ──`,
            e.greeting,
            `Options: ${e.options.join(', ')}`,
            e.data && e.data.question ? `Prompt: ${e.data.question}` : '',
          ].filter(Boolean).join('\n');
        }).join('\n\n');
      }
      if (sub === 'respond') {
        const response = args[1] ? String(args[1]).toLowerCase() : '';
        if (!response) return 'Usage: /event respond <accept|refuse|fight|flee|answer> [arg]';
        const arg = args.slice(2).join(' ');
        const result = randomEvents.respondToEvent(p, response, arg);
        if (!result.ok) return result.reason || 'Response failed.';
        return fmtOutcome(result.outcome) || `Responded: ${response}.`;
      }
      // Quick shorthand: "/event accept" without "respond"
      if (['accept','refuse','fight','flee','answer'].includes(sub)) {
        const arg = args.slice(1).join(' ');
        const result = randomEvents.respondToEvent(p, sub, arg);
        if (!result.ok) return result.reason || 'Response failed.';
        return fmtOutcome(result.outcome) || `Responded: ${sub}.`;
      }
      return 'Usage: /event respond <response> [arg] | /event list';
    },
  });

  // ── /challenge ────────────────────────────────────────────────────────────
  commands.register('challenge', {
    category: 'Dailies',
    help: '/challenge status | /challenge claim | /challenge history',
    fn: (p, args) => {
      const sub = (args && args[0] ? String(args[0]) : 'status').toLowerCase();

      if (sub === 'status' || sub === '' || sub === undefined) {
        const s = daily.status(p);
        return fmtChallenge(s);
      }

      if (sub === 'claim') {
        const result = daily.claim(p);
        if (!result.ok) return result.reason || 'Cannot claim.';
        if (result.applied && result.applied.type === 'coins') {
          return `Claimed. +${result.applied.amount} coins.`;
        }
        if (result.applied && result.applied.type === 'xp') {
          return `Claimed. +${result.applied.amount} ${result.applied.skill} XP.`;
        }
        return 'Claimed.';
      }

      if (sub === 'history') {
        const h = daily.history(p);
        if (!h.length) return 'No completed challenges yet.';
        const last = h.slice(-10).reverse();
        const lines = ['── Daily Challenge History ──'];
        for (const rec of last) {
          const r = rec.rewardType === 'coins' ? `${rec.reward}c` : `${rec.reward} ${rec.rewardSkill} XP`;
          lines.push(`  ${rec.dateKey}  ${rec.id}  → ${r}`);
        }
        return lines.join('\n');
      }

      return 'Usage: /challenge status | claim | history';
    },
  });

  // ── /dailychallenge alias ─────────────────────────────────────────────────
  // Some legacy help text refers to /dailychallenge; keep both callable.
  commands.register('dailychallenge', {
    category: 'Dailies',
    help: 'Alias for /challenge',
    fn: (p, args) => commands.commands.get('challenge').fn(p, args),
  });
}

module.exports = { register };
