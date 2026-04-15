// ══════════════════════════════════════════════════════════════════════════════
// Clue-Scroll — Chat Commands
//
// Wires the clue-runner into the chat command registry. Intentionally
// side-effect-free on require; all wiring happens via register({ commands }).
// Mirrors the pattern in ge-commands.js and area-locked-commands.js.
//
// Commands installed:
//   /clue status                — show current clue + step + progress
//   /clue hint                  — re-display the current step hint
//   /clue dig                   — dig at the player's current tile
//   /clue anagram <answer>      — submit an anagram / cryptic / puzzle answer
//   /clue emote <emote>         — attempt an emote step (uses p.x,p.y)
//   /clue place <itemId>        — item-placement step
//   /clue complete              — claim reward (auto-called after last step)
//   /clue abandon               — scrap the active clue
//   /clue open <tier>           — open a clue scroll from inventory
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const runner = require('./clue-runner');

function stepBanner(p) {
  const clue = p.activeClue;
  if (!clue) return 'No active clue scroll.';
  const idx = clue.currentStep;
  const total = clue.steps.length;
  if (clue.solved) {
    return `── Clue scroll (${clue.tier}) ──\n  ALL ${total} STEPS SOLVED — use /clue complete to claim the reward.`;
  }
  const step = clue.steps[idx];
  const hint = step ? step.description : '(no hint available)';
  return `── Clue scroll (${clue.tier}) — step ${idx + 1}/${total} ──\n  ${hint}`;
}

function rewardLines(res) {
  if (!res || !res.ok) return `Failed: ${res && res.reason}`;
  const lines = [`Clue scroll (${res.tier}) complete! Rewards:`];
  for (const d of res.items) {
    if (d.collectionLogCompleted) {
      lines.push(`  COLLECTION LOG COMPLETE — ${d.reward ? (d.reward.cosmetic || d.reward.title) : 'milestone reward'}`);
      continue;
    }
    lines.push(`  ${d.name} x${d.count}${d.pet ? ' (PET!)' : ''}`);
  }
  if (res.uniqueRolled) lines.push(`  ** unique: ${res.uniqueRolled.name} **`);
  lines.push(`  total ${res.tier} clues completed: ${res.completed}`);
  return lines.join('\n');
}

function findScrollInInv(p, tier) {
  const id = runner.SCROLL_IDS[tier];
  if (!id) return -1;
  return Array.isArray(p.inventory) ? p.inventory.findIndex(s => s && s.id === id) : -1;
}

function register(opts) {
  opts = opts || {};
  const commands = opts.commands || require('./commands');
  if (!commands || !commands.register) throw new Error('clue-commands.register: commands module required');

  commands.register('clue', {
    category: 'Items',
    help: 'Clue scrolls: clue status | hint | dig | anagram <answer> | emote <emote> | place <itemId> | complete | abandon | open <tier>',
    fn: (p, args) => {
      const sub = (args && args[0] ? String(args[0]) : '').toLowerCase();

      // ── /clue status ───────────────────────────────────────────────────────
      if (!sub || sub === 'status') {
        if (!p.activeClue) return 'You have no active clue scroll. Use /clue open <tier> after getting one from a drop.';
        return stepBanner(p);
      }

      // ── /clue hint ─────────────────────────────────────────────────────────
      if (sub === 'hint') {
        if (!p.activeClue) return 'You have no active clue scroll.';
        return stepBanner(p);
      }

      // ── /clue open <tier> ──────────────────────────────────────────────────
      if (sub === 'open') {
        const tier = runner.canonTier(args[1]);
        if (!tier) return 'Usage: /clue open <beginner|medium|hard|elite|master>';
        if (p.activeClue) return 'You already have an active clue scroll. Abandon it first with /clue abandon.';
        const slot = findScrollInInv(p, tier);
        if (slot < 0) return `You have no ${tier} clue scroll in your inventory.`;
        // Consume the scroll
        const row = p.inventory[slot];
        if (row.count > 1) row.count -= 1; else p.inventory[slot] = null;
        const res = runner.startClue(p, tier);
        if (!res.ok) return `Cannot start clue: ${res.reason}`;
        return `You open the ${tier} clue scroll.\n${stepBanner(p)}`;
      }

      // ── /clue dig ──────────────────────────────────────────────────────────
      if (sub === 'dig') {
        if (!p.activeClue) return 'You dig but find nothing interesting.';
        const res = runner.attemptSolve(p, { x: p.x, y: p.y });
        if (!res.ok) return `Error: ${res.reason}`;
        if (!res.solved) return 'You dig but find nothing interesting.';
        if (res.complete) return `The last piece of the trail is here!\n${rewardLines(runner.giveReward(p))}`;
        return `Step solved! (${res.remaining} to go)\n${stepBanner(p)}`;
      }

      // ── /clue anagram <answer>  |  /clue solve <answer>  |  /clue puzzle ──
      if (sub === 'anagram' || sub === 'solve' || sub === 'puzzle' || sub === 'answer') {
        const answer = args.slice(1).join(' ');
        if (!answer) return `Usage: /clue ${sub} <answer>`;
        if (!p.activeClue) return 'You have no active clue scroll.';
        const res = runner.attemptSolve(p, { answer });
        if (!res.ok) return `Error: ${res.reason}`;
        if (!res.solved) return 'That is not the answer.';
        if (res.complete) return `Correct! The trail ends here.\n${rewardLines(runner.giveReward(p))}`;
        return `Correct! (${res.remaining} to go)\n${stepBanner(p)}`;
      }

      // ── /clue emote <emote> ────────────────────────────────────────────────
      if (sub === 'emote') {
        const emote = args[1];
        if (!emote) return 'Usage: /clue emote <wave|dance|bow|...>';
        if (!p.activeClue) return 'You have no active clue scroll.';
        const res = runner.attemptSolve(p, { emote });
        if (!res.ok) return `Error: ${res.reason}`;
        if (!res.solved) return 'That emote doesn\'t feel right, or you\'re in the wrong place.';
        if (res.complete) return `The spirits acknowledge you!\n${rewardLines(runner.giveReward(p))}`;
        return `Step solved! (${res.remaining} to go)\n${stepBanner(p)}`;
      }

      // ── /clue place <itemId> ───────────────────────────────────────────────
      if (sub === 'place') {
        const itemId = parseInt(args[1], 10);
        if (isNaN(itemId)) return 'Usage: /clue place <itemId>';
        if (!p.activeClue) return 'You have no active clue scroll.';
        const res = runner.attemptSolve(p, { itemId, x: p.x, y: p.y });
        if (!res.ok) return `Error: ${res.reason}`;
        if (!res.solved) return 'That item does not belong here.';
        if (res.complete) return `The offering is accepted.\n${rewardLines(runner.giveReward(p))}`;
        return `Step solved! (${res.remaining} to go)\n${stepBanner(p)}`;
      }

      // ── /clue complete ─────────────────────────────────────────────────────
      if (sub === 'complete' || sub === 'claim' || sub === 'reward') {
        if (!p.activeClue) return 'You have no active clue scroll.';
        if (!p.activeClue.solved) return `You have ${p.activeClue.steps.length - p.activeClue.currentStep} step(s) left.`;
        return rewardLines(runner.giveReward(p));
      }

      // ── /clue abandon ──────────────────────────────────────────────────────
      if (sub === 'abandon' || sub === 'drop' || sub === 'cancel') {
        const res = runner.abandonClue(p);
        if (!res.ok) return 'You have no active clue scroll.';
        return `You abandon the ${res.tier} clue scroll. Progress lost.`;
      }

      return 'Usage: /clue status | hint | dig | anagram <answer> | emote <emote> | place <itemId> | complete | abandon | open <tier>';
    },
  });

  // Back-compat alias used by the legacy digging UI. Only installs if the
  // host hasn't registered something called `dig` already (GE-style check).
  if (!commands.commands || !commands.commands.get || !commands.commands.get('dig')) {
    commands.register('dig', {
      category: 'Items',
      help: 'Dig at your current location (advances a clue if applicable).',
      fn: (p) => {
        if (!p.activeClue) return 'You dig but find nothing interesting.';
        const res = runner.attemptSolve(p, { x: p.x, y: p.y });
        if (!res.ok) return `Error: ${res.reason}`;
        if (!res.solved) return 'You dig but find nothing interesting.';
        if (res.complete) return `The last piece of the trail is here!\n${rewardLines(runner.giveReward(p))}`;
        return `Step solved! (${res.remaining} to go)\n${stepBanner(p)}`;
      },
    });
  }
}

module.exports = { register };
