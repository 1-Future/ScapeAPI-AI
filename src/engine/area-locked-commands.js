// ══════════════════════════════════════════════════════════════════════════════
// Area-Locked — Chat Commands
//
// Player-facing handlers for the area-locked account mode. Registers via the
// existing command registry (src/engine/commands.js) without touching the
// monolithic commands/all.js or src/server.js.
//
// Usage from the server bootstrap (called ONCE on startup, after area-locked
// is attached):
//
//   const commands = require('./engine/commands');
//   const areaLockedCommands = require('./engine/area-locked-commands');
//   areaLockedCommands.register({ commands });
//
// Commands installed:
//   /areamode start <region>   — opt in, choose starting region (PERMANENT)
//   /areamode status           — show current region, unlocks, clear progress
//   /areamode next             — show what's blocking the next unlock
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const areaLocked = require('./area-locked');

function fmtProgress(check) {
  if (!check) return '';
  if (check.cleared) return 'ALL CONDITIONS MET — run /areamode clear to advance.';
  const lines = [];
  const p = check.progress || {};
  if (p.quest) {
    lines.push(`  quest ${p.quest.id}: ${p.quest.done ? 'done' : 'incomplete'}`);
  }
  if (p.quests) {
    for (const [q, done] of Object.entries(p.quests)) {
      lines.push(`  quest ${q}: ${done ? 'done' : 'incomplete'}`);
    }
  }
  if (p.bossKill) {
    for (const [b, v] of Object.entries(p.bossKill)) {
      lines.push(`  boss ${b}: ${v.have}/${v.need}`);
    }
  }
  if (p.skill) {
    for (const [s, v] of Object.entries(p.skill)) {
      lines.push(`  ${s}: ${v.have}/${v.need}`);
    }
  }
  if (p.totalLevel) {
    lines.push(`  total level: ${p.totalLevel.have}/${p.totalLevel.need}`);
  }
  return lines.join('\n');
}

function register(opts) {
  opts = opts || {};
  const commands = opts.commands || require('./commands');

  commands.register('areamode', {
    category: 'Account',
    help: 'Area-Locked account mode: /areamode start <region> | status | next | clear',
    fn: (player, args) => {
      const sub = (args && args[0] ? String(args[0]) : '').toLowerCase();

      // ── start ──────────────────────────────────────────────────────────────
      if (sub === 'start') {
        const region = args[1] ? String(args[1]) : null;
        if (!region) {
          return 'Usage: /areamode start <region>. Regions: heartlands, sootworks, moryskah, veilwood, boneyard, saltbrine, inkweald, glass_desert. PERMANENT choice.';
        }
        if (areaLocked.isAreaLocked(player)) {
          return 'You are already an Area-Locked Adventurer. The choice is permanent and cannot be undone.';
        }
        const result = areaLocked.enableMode(player, region);
        if (!result.ok) return `Cannot enable Area-Locked mode: ${result.reason}`;
        const canon = result.areaLocked.currentRegion;
        const cond = areaLocked.clearConditions(canon);
        return [
          `You are now an Area-Locked Adventurer, confined to ${canon}.`,
          `Clear condition: ${cond ? cond.description : '(none)'}`,
          `Bonus: +10% XP inside your current region. Cosmetic cape granted.`,
          `This choice is PERMANENT. You cannot exit this mode.`,
        ].join('\n');
      }

      // ── status ─────────────────────────────────────────────────────────────
      if (sub === 'status' || sub === '' || sub === undefined) {
        if (!areaLocked.isAreaLocked(player)) {
          return 'You are not in Area-Locked mode. Use: /areamode start <region>';
        }
        const s = areaLocked.status(player);
        const unlocked = s.unlockedRegions.join(', ') || '(none)';
        const bonus = `+${Math.round((s.xpBonus - 1) * 100)}%`;
        return [
          `Area-Locked Adventurer`,
          `  starting region: ${s.startingRegion}`,
          `  current region:  ${s.currentRegion}`,
          `  unlocked:        ${unlocked}`,
          `  regions cleared: ${s.clears}`,
          `  xp bonus:        ${bonus} (current region only)`,
          `  cape color:      ${s.capeColor}`,
          `  clear status:    ${s.currentClear.cleared ? 'READY TO CLEAR' : 'in progress'}`,
          s.currentClear.description ? `  condition: ${s.currentClear.description}` : '',
          fmtProgress(s.currentClear),
        ].filter(Boolean).join('\n');
      }

      // ── next ───────────────────────────────────────────────────────────────
      if (sub === 'next') {
        if (!areaLocked.isAreaLocked(player)) {
          return 'You are not in Area-Locked mode.';
        }
        const s = areaLocked.status(player);
        const check = s.currentClear;
        const nextRegion = s.nextRegion || '(final region — no further unlocks)';
        if (check.cleared) {
          return [
            `${s.currentRegion} is READY TO CLEAR. Run /areamode clear.`,
            `Next region after clear: ${nextRegion}`,
          ].join('\n');
        }
        return [
          `Blocking the next unlock (${nextRegion}):`,
          `  clear ${s.currentRegion} first.`,
          check.description ? `  condition: ${check.description}` : '',
          fmtProgress(check),
        ].filter(Boolean).join('\n');
      }

      // ── clear ──────────────────────────────────────────────────────────────
      if (sub === 'clear') {
        if (!areaLocked.isAreaLocked(player)) {
          return 'You are not in Area-Locked mode.';
        }
        const cur = player.areaLocked.currentRegion;
        const result = areaLocked.clearRegion(player, cur);
        if (!result.ok) {
          if (result.already) return `${cur} is already cleared.`;
          if (result.missing) return `Clear conditions not met:\n${result.missing.map(m => '  ' + m).join('\n')}`;
          return `Cannot clear: ${result.reason}`;
        }
        const next = result.unlocked ? ` Next region unlocked: ${result.unlocked}.` : ' No further regions — you are a full Area-Locked clear!';
        return `${cur} CLEARED.${next}`;
      }

      return 'Usage: /areamode start <region> | status | next | clear';
    },
  });
}

module.exports = { register };
