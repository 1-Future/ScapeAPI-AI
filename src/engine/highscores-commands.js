// ══════════════════════════════════════════════════════════════════════════════
// Highscores — Chat Commands
//
// Installs /hi (aliased /hiscores) via the central commands registry.
//
// Usage:
//   const hiscoresCommands = require('./engine/highscores-commands');
//   hiscoresCommands.register({
//     commands,           // src/engine/commands.js
//     highscores,         // src/engine/highscores.js
//     findPlayer,         // (name) => player
//     SKILLS,             // list of skill names
//   });
//
// Commands:
//   /hi me                — show own position across all boards
//   /hi <player>          — look up another player's positions (name search)
//   /hi <skill>           — top 10 for a skill
//   /hi overall           — top 10 overall XP
//   /hi boss <bossId>     — top 10 for a boss
//   /hi ca                — top 10 combat achievements
//   /hi diary             — top 10 diary
//   /hi clans             — top 10 clans
//   /hi ironman [skill]   — top 10 ironman
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const DEFAULT_SKILLS = [
  'attack', 'strength', 'defence', 'hitpoints', 'ranged', 'prayer', 'magic',
  'runecrafting', 'construction', 'agility', 'herblore', 'thieving',
  'crafting', 'fletching', 'slayer', 'hunter', 'mining', 'smithing',
  'fishing', 'cooking', 'firemaking', 'woodcutting', 'farming',
];

function _pad(s, w) {
  s = String(s);
  return s.length >= w ? s : s + ' '.repeat(w - s.length);
}

function _fmtNum(n) {
  n = n | 0;
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'm';
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'k';
  return String(n);
}

function _renderTop(title, entries, valueLabel = 'value') {
  if (!entries || entries.length === 0) {
    return `${title}\n  (no entries yet)`;
  }
  const lines = [title];
  for (const e of entries) {
    const rank = _pad('#' + e.rank, 4);
    const name = _pad((e.playerName || e.clanName || '').slice(0, 16), 16);
    const val = _fmtNum(e.value != null ? e.value : (e.totalXp || 0));
    const tag = e.variant ? ` [${e.variant}]` : '';
    lines.push(`  ${rank} ${name} ${val}${tag}`);
  }
  return lines.join('\n');
}

function register(opts) {
  const commands = opts && opts.commands;
  const highscores = opts && opts.highscores;
  if (!commands) throw new Error('highscores-commands.register: commands required');
  if (!highscores) throw new Error('highscores-commands.register: highscores required');

  const findPlayer = (typeof opts.findPlayer === 'function') ? opts.findPlayer : null;
  const SKILLS = Array.isArray(opts.SKILLS) ? opts.SKILLS : DEFAULT_SKILLS;

  function usage() {
    return [
      'Usage:',
      '  hi me                     your positions',
      '  hi <player>               look up a player',
      '  hi <skill>                top 10 for a skill',
      '  hi overall                top 10 total XP',
      '  hi boss <id>              top 10 for a boss',
      '  hi ca | diary | clans     top 10 boards',
      '  hi ironman [skill]        ironman board',
    ].join('\n');
  }

  commands.register('hi', {
    help: 'Hiscores: look up rankings.',
    category: 'General',
    aliases: ['hiscores', 'highscores'],
    fn: (p, args) => {
      const sub = (args[0] || '').toLowerCase();
      if (!sub) return usage();

      // /hi me — self
      if (sub === 'me' || sub === 'self') {
        // Ensure snapshot is fresh.
        highscores.updatePlayerSnapshot(p);
        const stats = highscores.getPlayerStats(p.id);
        if (!stats) return 'No hiscore data yet. Gain some XP first.';
        const lines = [`Hiscores for ${stats.playerName}:`];
        if (stats.ranks.overall) {
          lines.push(`  Overall: #${stats.ranks.overall.rank} (${_fmtNum(stats.ranks.overall.value)} xp)`);
        } else {
          lines.push(`  Overall: unranked`);
        }
        const rankedSkills = [];
        for (const s of SKILLS) {
          const r = stats.ranks.skills[s];
          if (r) rankedSkills.push(`    ${s} #${r.rank} (${_fmtNum(r.value)} xp)`);
        }
        if (rankedSkills.length) {
          lines.push('  Top skills:');
          lines.push(...rankedSkills.slice(0, 5));
        }
        if (stats.ranks.ca) lines.push(`  Combat Achievements: #${stats.ranks.ca.rank} (${stats.ranks.ca.value} pts)`);
        if (stats.ranks.diary) lines.push(`  Diary: #${stats.ranks.diary.rank} (${stats.ranks.diary.value} tiers)`);
        if (stats.ranks.ironman && stats.ranks.ironman.overall) {
          lines.push(`  Ironman Overall: #${stats.ranks.ironman.overall.rank}`);
        }
        return lines.join('\n');
      }

      // /hi overall
      if (sub === 'overall' || sub === 'total') {
        return _renderTop('Top 10 — Overall XP:', highscores.getOverallRanking(10));
      }

      // /hi ca
      if (sub === 'ca' || sub === 'achievements') {
        return _renderTop('Top 10 — Combat Achievements:', highscores.getCaRanking(10));
      }

      // /hi diary
      if (sub === 'diary') {
        return _renderTop('Top 10 — Achievement Diary:', highscores.getDiaryRanking(10));
      }

      // /hi clans
      if (sub === 'clans' || sub === 'clan') {
        const top = highscores.getClanRanking(10);
        if (!top.length) return 'Top 10 — Clans:\n  (no clans yet)';
        return top.map(e => `  #${e.rank} ${e.clanName} — ${_fmtNum(e.totalXp)} xp (${e.memberCount})`).join('\n');
      }

      // /hi boss <id>
      if (sub === 'boss') {
        const bossId = args[1];
        if (!bossId) return 'Usage: hi boss <bossId>';
        return _renderTop(`Top 10 — ${bossId} kc:`, highscores.getBossKcRanking(bossId, 10));
      }

      // /hi ironman [skill]
      if (sub === 'ironman' || sub === 'im') {
        const skill = args[1] ? args[1].toLowerCase() : null;
        if (skill && !SKILLS.includes(skill) && skill !== 'overall') {
          return `Unknown skill: ${skill}`;
        }
        return _renderTop(`Top 10 — Ironman${skill ? ' ' + skill : ''}:`, highscores.getIronmanRanking(skill, 10));
      }

      // /hi <skill>
      if (SKILLS.includes(sub)) {
        return _renderTop(`Top 10 — ${sub}:`, highscores.getSkillRanking(sub, 10));
      }

      // /hi <player>
      // Try direct snapshot lookup first, then fall through to online player.
      let found = highscores.findPlayerByName(sub);
      if (!found && findPlayer) {
        const other = findPlayer(sub);
        if (other) {
          highscores.updatePlayerSnapshot(other);
          found = highscores.findPlayerByName(other.name);
        }
      }
      if (!found) {
        return `Unknown player or skill: ${sub}\n${usage()}`;
      }
      const stats = highscores.getPlayerStats(found.playerId);
      if (!stats) return `No hiscore data for ${sub}.`;
      const lines = [`Hiscores for ${stats.playerName}:`];
      if (stats.ranks.overall) {
        lines.push(`  Overall: #${stats.ranks.overall.rank} (${_fmtNum(stats.ranks.overall.value)} xp)`);
      }
      const topSkills = SKILLS
        .map(s => ({ s, r: stats.ranks.skills[s] }))
        .filter(x => x.r)
        .sort((a, b) => a.r.rank - b.r.rank)
        .slice(0, 5);
      for (const { s, r } of topSkills) {
        lines.push(`  ${s} #${r.rank} (${_fmtNum(r.value)} xp)`);
      }
      if (stats.ranks.ca) lines.push(`  CA #${stats.ranks.ca.rank} (${stats.ranks.ca.value} pts)`);
      if (stats.ranks.diary) lines.push(`  Diary #${stats.ranks.diary.rank} (${stats.ranks.diary.value} tiers)`);
      return lines.join('\n');
    },
  });

  return true;
}

module.exports = { register };
