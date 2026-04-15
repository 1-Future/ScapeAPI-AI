#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// MULTI-AGENT SIMULATOR
//
// Runs 9 distinct OSRS player archetypes through 3000 hours of Scape each,
// then reports on whether they take meaningfully different paths through
// the game. If they all converge on the same route, the game is degenerate.
// If they diverge, the routing is truly unsolvable (Marstead's "traveling
// salesman" effect).
//
// Archetypes:
//   Efficiency Andy — max XP/hr, follow the meta
//   AFK Andy        — only afk/low attention
//   Money Maker     — max gp/hr, profit-weighted
//   PvM Rusher      — rush combat + prayer + herblore for bossing
//   Skiller         — no combat at all
//   Quester         — prioritize quest prerequisites
//   Ironman         — can't buy inputs, must self-supply
//   Candy Looper    — random weighted picks, simulated distraction
//   Casual          — only short-session friendly (afk/low/medium)
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const rel = require('../data/relationships');

require('../content/aelgard/area-gates');
require('../content/aelgard/quest-unlocks');
require('../content/aelgard/item-ecosystem');
require('../content/aelgard/training-knobs');
require('../content/aelgard/breakpoints');
try { require('../content/aelgard/skill-web'); } catch (e) {}
try { require('../content/aelgard/heartlands-deep'); } catch (e) {}
try { require('../content/aelgard/heartlands-density'); } catch (e) {}
try { require('../content/aelgard/moryskah-deep'); } catch (e) {}
try { require('../content/aelgard/moryskah-density'); } catch (e) {}
try { require('../content/aelgard/sootworks-deep'); } catch (e) {}
try { require('../content/aelgard/sootworks-density'); } catch (e) {}
try { require('../content/aelgard/saltbrine-deep'); } catch (e) {}
try { require('../content/aelgard/saltbrine-density'); } catch (e) {}
try { require('../content/aelgard/veilwood-deep'); } catch (e) {}
try { require('../content/aelgard/veilwood-density'); } catch (e) {}
try { require('../content/aelgard/boneyard-deep'); } catch (e) {}
try { require('../content/aelgard/boneyard-density'); } catch (e) {}
try { require('../content/aelgard/glass-desert-deep'); } catch (e) {}
try { require('../content/aelgard/glass-desert-density'); } catch (e) {}
try { require('../content/aelgard/inkweald-deep'); } catch (e) {}
try { require('../content/aelgard/inkweald-density'); } catch (e) {}
try { require('../content/aelgard/wilds-deep'); } catch (e) {}
try { require('../content/aelgard/wilds-density'); } catch (e) {}
try { require('../content/aelgard/mid-tier-regions'); } catch (e) {}
try { require('../content/aelgard/universal-items'); } catch (e) {}
try { require('../content/aelgard/special-regions'); } catch (e) {}
try { require('../content/aelgard/cross-region-web'); } catch (e) {}
try { require('../content/aelgard/quirky-interactions'); } catch (e) {}

// ── XP Table ─────────────────────────────────────────────────────────────────
const XP_TABLE = [0];
for (let lvl = 1; lvl < 99; lvl++) {
  XP_TABLE.push(Math.floor(XP_TABLE[lvl - 1] + Math.floor(lvl + 300 * Math.pow(2, lvl / 7)) / 4));
}
function xpForLevel(lvl) { return XP_TABLE[Math.min(lvl, 99) - 1] || 0; }
function levelForXp(xp) {
  for (let l = 98; l >= 1; l--) { if (xp >= XP_TABLE[l]) return l + 1; }
  return 1;
}

const SKILLS = [
  'attack', 'strength', 'defence', 'hitpoints', 'ranged', 'prayer', 'magic',
  'runecrafting', 'construction', 'agility', 'herblore', 'thieving',
  'crafting', 'fletching', 'slayer', 'hunter', 'mining', 'smithing',
  'fishing', 'cooking', 'firemaking', 'woodcutting', 'farming',
];
const COMBAT_SKILLS = new Set(['attack', 'strength', 'defence', 'hitpoints', 'ranged', 'magic', 'prayer', 'slayer']);
const GATHERING_SKILLS = new Set(['mining', 'fishing', 'woodcutting', 'hunter', 'farming', 'runecrafting']);

// ══════════════════════════════════════════════════════════════════════════════
// PERSONALITY PROFILES
// Each personality has:
//   filter(method, player)    — returns false to reject the method outright
//   score(method, player, base) — modifies the base score
//   description               — one-line description
// ══════════════════════════════════════════════════════════════════════════════

const PERSONALITIES = {
  'Efficiency Andy': {
    description: 'Max XP/hr. Follows the optimal meta. No distractions.',
    filter: () => true,
    score: (method, player, base) => {
      // XP/hr dominates everything
      const xp = Array.isArray(method.xpPerHour) ? method.xpPerHour[1] : method.xpPerHour;
      return xp / 100;  // Pure XP score. Breakpoints and diversity irrelevant.
    },
  },

  'AFK Andy': {
    description: 'Only afk/low attention methods. Playing while watching TV.',
    filter: (method) => method.attention === 'afk' || method.attention === 'low',
    score: (method, player, base) => {
      const xp = Array.isArray(method.xpPerHour) ? method.xpPerHour[1] : method.xpPerHour;
      // Prefer lower attention within allowed range
      const attentionPref = method.attention === 'afk' ? 50 : 20;
      return base + attentionPref + xp / 200;
    },
  },

  'Money Maker': {
    description: 'Max gp/hr. Profit-weighted. Will buy XP when needed.',
    filter: () => true,
    score: (method, player, base) => {
      // Estimate gp/hr from resourceOutput or negative costPerHour
      let gpPerHour = -method.costPerHour;  // negative cost = profit
      if (method.resourceOutput && method.resourceOutput.produces) {
        for (const p of method.resourceOutput.produces) {
          if (p.name && p.name.toLowerCase().includes('gold')) {
            gpPerHour += p.perHour || 0;
          }
        }
      }
      return base + gpPerHour / 5000;
    },
  },

  'PvM Rusher': {
    description: 'Rush combat + prayer + herblore. Wants to boss ASAP.',
    filter: () => true,
    score: (method, player, base) => {
      const priorityCombatSkills = ['attack', 'strength', 'defence', 'hitpoints', 'ranged', 'prayer', 'magic', 'herblore'];
      if (priorityCombatSkills.includes(method.skill)) {
        return base + 80;
      }
      return base - 20;
    },
  },

  'Skiller': {
    description: 'No combat ever. Pure skilling account. Level 3 hp forever.',
    filter: (method) => !COMBAT_SKILLS.has(method.skill) && method.skill !== 'attack' && method.skill !== 'slayer',
    score: (method, player, base) => {
      // Prefer gathering skills that produce items
      if (GATHERING_SKILLS.has(method.skill)) return base + 30;
      return base;
    },
  },

  'Quester': {
    description: 'Quest cape run. Prioritizes skill levels that quests need.',
    filter: () => true,
    score: (method, player, base) => {
      // Boost skills that gate quests (roughly the ones with many quest prerequisites)
      const questGatingSkills = ['agility', 'crafting', 'thieving', 'magic', 'herblore', 'smithing', 'mining', 'fishing', 'cooking'];
      if (questGatingSkills.includes(method.skill)) {
        return base + 40;
      }
      // Also heavily favor methods that unlock quests
      if (method.prerequisites && method.prerequisites.quests && method.prerequisites.quests.length > 0) {
        return base + 30;
      }
      return base;
    },
  },

  'Ironman': {
    description: 'Cannot buy inputs. Must self-supply via own skills.',
    filter: (method, player) => {
      // Reject methods where inputs cannot be self-produced
      const inputs = method.inputs || [];
      for (const inp of inputs) {
        const produced = player.produced || {};
        if (!produced[inp.name] && inp.source !== '' && inp.source !== 'shop') {
          // Haven't produced this input yet and it can't be shopped
          // But allow methods that consume common resources the player has produced
          if (!Object.keys(produced).some(n => n.toLowerCase().includes(inp.name.toLowerCase().split(' ')[0]))) {
            // Soft reject if not produced — but don't hard reject (ironman still has to train)
          }
        }
      }
      return true;
    },
    score: (method, player, base) => {
      // Producer skills become much more valuable for ironmen
      if (GATHERING_SKILLS.has(method.skill)) return base + 50;
      // Methods with no inputs (pure training) are good
      if (!method.inputs || method.inputs.length === 0) return base + 20;
      return base;
    },
  },

  'Candy Looper': {
    description: 'Distracted. Random-weighted picks. "Ooh a piece of candy."',
    filter: () => true,
    score: (method, player, base) => {
      // Heavy random factor to simulate "ooh shiny"
      return base * 0.3 + Math.random() * 200;
    },
  },

  'Casual': {
    description: 'Plays 1-2 hour sessions. Won\'t touch max-attention content.',
    filter: (method) => method.attention !== 'maximum' && method.danger !== 'extreme',
    score: (method, player, base) => {
      // Strongly prefers afk/low/medium, penalizes dangerous content
      if (method.attention === 'afk') return base + 40;
      if (method.attention === 'low') return base + 30;
      if (method.attention === 'medium') return base + 15;
      if (method.attention === 'high') return base - 20;
      return base;
    },
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// PLAYER STATE
// ══════════════════════════════════════════════════════════════════════════════

function createPlayer() {
  const skills = {};
  for (const s of SKILLS) skills[s] = { xp: 0, level: 1 };
  skills.hitpoints = { xp: xpForLevel(10), level: 10 };
  return {
    skills,
    hoursPlayed: 0,
    skillHours: {},
    methodsUsed: new Set(),
    methodsUsedOrder: [],  // chronological list of methods
    breakpoints: [],
    areasVisited: new Set(['heartlands']),
    produced: {},  // items produced (for ironman check)
  };
}

function getLevel(player, skill) { return player.skills[skill]?.level || 1; }
function addXp(player, skill, amount) {
  const s = player.skills[skill];
  if (!s) return null;
  s.xp += amount;
  const newLvl = levelForXp(s.xp);
  if (newLvl > s.level) {
    const oldLvl = s.level;
    s.level = newLvl;
    return { skill, oldLvl, newLvl };
  }
  return null;
}

// ══════════════════════════════════════════════════════════════════════════════
// SIMULATION (per personality)
// ══════════════════════════════════════════════════════════════════════════════

function baseScore(method, player) {
  const skill = method.skill;
  const currentLvl = getLevel(player, skill);
  if (currentLvl >= 99) return -1;

  const xpPerHour = Array.isArray(method.xpPerHour) ? (method.xpPerHour[0] + method.xpPerHour[1]) / 2 : method.xpPerHour;

  // Simple base score: balanced heuristic (similar to original sim but simpler)
  const nearBreakpoints = rel.getBreakpointsForSkill(skill)
    .filter(bp => bp.trigger.level > currentLvl && bp.trigger.level <= currentLvl + 10).length;

  let gatesNeedingSkill = 0;
  for (const [, gate] of rel.listAreaGates()) {
    const req = gate.requires.skills?.[skill];
    if (req && req > currentLvl) gatesNeedingSkill++;
  }

  const hoursOnSkill = player.skillHours[skill] || 0;
  const diversityBonus = hoursOnSkill === 0 ? 50 : 0;

  return (nearBreakpoints * 30) + (gatesNeedingSkill * 20) + Math.min(xpPerHour / 2000, 50) + diversityBonus;
}

function simulatePersonality(personalityName, maxHours) {
  const personality = PERSONALITIES[personalityName];
  const player = createPlayer();

  for (let hour = 0; hour < maxHours; hour++) {
    player.hoursPlayed = hour;

    // Gather available methods
    const available = [];
    for (const skill of SKILLS) {
      const methods = rel.listMethodsForSkill(skill);
      for (const m of methods) {
        const lvl = getLevel(player, skill);
        if (lvl >= 99) continue;
        if (lvl < m.levelRange[0] || lvl > m.levelRange[1]) continue;
        // Check skill prereqs
        const prereqs = m.prerequisites || {};
        let ok = true;
        for (const [s, l] of Object.entries(prereqs.skills || {})) {
          if (getLevel(player, s) < l) { ok = false; break; }
        }
        if (!ok) continue;
        // Check personality filter
        if (!personality.filter(m, player)) continue;
        available.push(m);
      }
    }

    if (available.length === 0) break;

    // Score every method with personality override
    const scored = available.map(m => ({
      method: m,
      score: personality.score(m, player, baseScore(m, player)),
    }));
    scored.sort((a, b) => b.score - a.score);

    const chosen = scored[0].method;
    player.methodsUsed.add(chosen.id);
    player.methodsUsedOrder.push({ hour, id: chosen.id, skill: chosen.skill, name: chosen.name });
    player.skillHours[chosen.skill] = (player.skillHours[chosen.skill] || 0) + 1;

    const xp = Array.isArray(chosen.xpPerHour) ? (chosen.xpPerHour[0] + chosen.xpPerHour[1]) / 2 : chosen.xpPerHour;
    const levelUp = addXp(player, chosen.skill, xp);

    // Record produced items (for ironman)
    if (chosen.resourceOutput && chosen.resourceOutput.produces) {
      for (const p of chosen.resourceOutput.produces) {
        player.produced[p.name] = (player.produced[p.name] || 0) + (p.perHour || 1);
      }
    }

    // Check breakpoints
    if (levelUp) {
      const bps = rel.getBreakpointsForSkill(chosen.skill)
        .filter(bp => bp.trigger.level > levelUp.oldLvl && bp.trigger.level <= levelUp.newLvl);
      for (const bp of bps) {
        player.breakpoints.push({ hour, skill: chosen.skill, level: bp.trigger.level, importance: bp.importance });
      }
    }
  }

  return player;
}

// ══════════════════════════════════════════════════════════════════════════════
// DIVERGENCE ANALYSIS
// ══════════════════════════════════════════════════════════════════════════════

function jaccardSimilarity(setA, setB) {
  const a = new Set(setA), b = new Set(setB);
  const intersection = [...a].filter(x => b.has(x)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : intersection / union;
}

function computeDivergence(results) {
  const names = Object.keys(results);
  const matrix = {};
  for (const name of names) {
    matrix[name] = {};
    for (const other of names) {
      if (name === other) continue;
      const methodsA = results[name].methodsUsed;
      const methodsB = results[other].methodsUsed;
      matrix[name][other] = jaccardSimilarity(methodsA, methodsB);
    }
  }
  return matrix;
}

// ══════════════════════════════════════════════════════════════════════════════
// REPORT
// ══════════════════════════════════════════════════════════════════════════════

function printPersonalityReport(name, player) {
  const totalHours = player.hoursPlayed;
  const skillLevels = SKILLS.map(s => ({ skill: s, level: getLevel(player, s) }));
  skillLevels.sort((a, b) => b.level - a.level);

  const maxedCount = skillLevels.filter(s => s.level >= 99).length;
  const totalLevel = skillLevels.reduce((sum, s) => sum + s.level, 0);

  // Top 3 most-trained skills
  const byHours = SKILLS.map(s => ({ skill: s, hours: player.skillHours[s] || 0 })).sort((a, b) => b.hours - a.hours);

  const transformativeBps = player.breakpoints.filter(b => b.importance === 'transformative');

  console.log(`\n┌─ ${name.padEnd(20)}${'─'.repeat(45 - name.length)}`);
  console.log(`│ ${PERSONALITIES[name].description}`);
  console.log(`│ Total level: ${totalLevel} | Skills maxed: ${maxedCount}/23 | Breakpoints: ${player.breakpoints.length} | Methods: ${player.methodsUsed.size}`);
  console.log(`│ Top skills: ${byHours.slice(0, 5).map(s => `${s.skill}(${s.hours}h)`).join(', ')}`);
  console.log(`│ Transformative moments: ${transformativeBps.length}`);
  console.log(`└${'─'.repeat(60)}`);
}

function printDivergenceMatrix(matrix) {
  console.log('\n══════════════════════════════════════════════════════════════════════════════');
  console.log('  DIVERGENCE MATRIX (Jaccard similarity of methods used — lower = more different)');
  console.log('══════════════════════════════════════════════════════════════════════════════\n');

  const names = Object.keys(matrix);
  const shortNames = names.map(n => n.split(' ')[0].substring(0, 8));

  // Header
  console.log(' '.repeat(12) + shortNames.map(n => n.padStart(9)).join(''));

  for (let i = 0; i < names.length; i++) {
    const row = names[i];
    const shortRow = shortNames[i].padEnd(12);
    const cells = names.map(col => {
      if (row === col) return '    --   ';
      const sim = matrix[row][col];
      return (sim * 100).toFixed(0).padStart(4) + '%    ';
    }).join('');
    console.log(shortRow + cells);
  }

  console.log('');
  // Overall stats
  const allSims = [];
  for (const a of names) for (const b of names) if (a !== b) allSims.push(matrix[a][b]);
  const avgSim = allSims.reduce((s, x) => s + x, 0) / allSims.length;
  const maxSim = Math.max(...allSims);
  const minSim = Math.min(...allSims);
  console.log(`Average similarity: ${(avgSim * 100).toFixed(1)}%`);
  console.log(`Most similar pair: ${(maxSim * 100).toFixed(1)}%`);
  console.log(`Most different pair: ${(minSim * 100).toFixed(1)}%`);
  console.log('');
  if (avgSim > 0.7) console.log('VERDICT: Personalities are converging on similar paths. Game may be degenerate.');
  else if (avgSim > 0.5) console.log('VERDICT: Moderate divergence. Game has real choices but shared backbone.');
  else console.log('VERDICT: High divergence. Personalities take genuinely different paths. Game is non-degenerate.');
}

function printSharedAndUniqueContent(results) {
  console.log('\n══════════════════════════════════════════════════════════════════════════════');
  console.log('  SHARED vs UNIQUE CONTENT');
  console.log('══════════════════════════════════════════════════════════════════════════════\n');

  const methodCounts = new Map();
  for (const [name, player] of Object.entries(results)) {
    for (const mId of player.methodsUsed) {
      methodCounts.set(mId, (methodCounts.get(mId) || 0) + 1);
    }
  }

  const universal = [];
  const unique = {};
  for (const [name] of Object.entries(results)) unique[name] = [];

  for (const [mId, count] of methodCounts) {
    if (count === Object.keys(results).length) universal.push(mId);
    else if (count === 1) {
      for (const [name, player] of Object.entries(results)) {
        if (player.methodsUsed.has(mId)) { unique[name].push(mId); break; }
      }
    }
  }

  console.log(`Universally used methods (${universal.length}): methods every personality picked`);
  for (const mId of universal.slice(0, 10)) {
    const m = rel.getTrainingMethod(mId);
    if (m) console.log(`  ${m.skill.padEnd(14)} ${m.name}`);
  }
  if (universal.length > 10) console.log(`  ... and ${universal.length - 10} more`);
  console.log('');

  console.log('Personality-unique picks (methods only this archetype chose):');
  for (const [name, ids] of Object.entries(unique)) {
    if (ids.length === 0) continue;
    console.log(`  ${name.padEnd(18)} (${ids.length} unique):`);
    for (const mId of ids.slice(0, 3)) {
      const m = rel.getTrainingMethod(mId);
      if (m) console.log(`    ${m.skill}/${m.name} (${m.attention})`);
    }
  }
  console.log('');
}

function printOverallStats(results) {
  console.log('\n══════════════════════════════════════════════════════════════════════════════');
  console.log('  PATH SUMMARY BY PERSONALITY');
  console.log('══════════════════════════════════════════════════════════════════════════════');
  for (const [name, player] of Object.entries(results)) {
    printPersonalityReport(name, player);
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// CLI
// ══════════════════════════════════════════════════════════════════════════════

const args = process.argv.slice(2);
const hoursIdx = args.indexOf('--hours');
const hours = hoursIdx >= 0 ? parseInt(args[hoursIdx + 1]) || 1500 : 1500;

console.log(`Running ${Object.keys(PERSONALITIES).length} personalities for ${hours} hours each...\n`);

const start = Date.now();
const results = {};
for (const name of Object.keys(PERSONALITIES)) {
  process.stdout.write(`  ${name}... `);
  const player = simulatePersonality(name, hours);
  results[name] = player;
  console.log(`done (${player.methodsUsed.size} methods, ${player.breakpoints.length} breakpoints)`);
}
const elapsed = Date.now() - start;
console.log(`\nTotal simulation time: ${elapsed}ms (${(hours * Object.keys(PERSONALITIES).length / (elapsed / 1000)).toFixed(0)} sim-hours/sec)`);

printOverallStats(results);
const matrix = computeDivergence(results);
printDivergenceMatrix(matrix);
printSharedAndUniqueContent(results);
