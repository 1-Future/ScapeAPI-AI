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
// burn-v2: mega monster expansion (110 monsters, 100+ drop items)
try { require('../content/aelgard/items-blitz3'); } catch (e) {}
try { require('../content/aelgard/monsters-mega'); } catch (e) {}
try { require('../content/aelgard/droptables-mega'); } catch (e) {}
try { require('../content/aelgard/combinations-mega'); } catch (e) {}
try { require('../content/aelgard/recipes-mega'); } catch (e) {}
try { require('../content/aelgard/minigames'); } catch (e) {}
try { require('../content/aelgard/minigames-mega'); } catch (e) {}

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
// DEEP TICK-BASED SIMULATION
//
// Tick-based replacement for the hour-based loop. 1 tick = 600ms game time.
// 10,000 ticks ~= 1.67 hours of game time per archetype.
//
// Decisions are made every DECISION_INTERVAL ticks. Between decisions the
// player "continues" the chosen method, accumulating XP per tick. This yields
// fine-grained event tracking (skill-ups, breakpoints, area entries, stuck
// detection) while still respecting personality preferences.
// ══════════════════════════════════════════════════════════════════════════════

const TICKS_PER_HOUR = 6000;           // 600 ms per tick
const DECISION_INTERVAL = 50;          // re-evaluate method every 50 ticks (~30s)
const AREA_VISIT_COOLDOWN = 250;       // ticks between new-area checks

// Build a region lookup for area gates (used by area-entry tracking).
function buildAreaRegionMap() {
  const m = new Map();
  for (const [id, gate] of rel.listAreaGates()) {
    m.set(id, gate.region || id);
  }
  return m;
}
const AREA_REGION_MAP = buildAreaRegionMap();

// Prestige goals copied from cross-region-web so we don't require the module
// (it exports only PRESTIGE_GOALS but loading it is benign; still, mirror the
// minimum data we need inline so the sim is resilient to refactors).
let PRESTIGE_GOALS = {};
try {
  const xr = require('../content/aelgard/cross-region-web');
  if (xr && xr.PRESTIGE_GOALS) PRESTIGE_GOALS = xr.PRESTIGE_GOALS;
} catch (e) {}

function meetsPrestigeRequirements(player, goal) {
  if (!goal || !goal.requirements || !goal.requirements.skills) return false;
  for (const [skill, lvl] of Object.entries(goal.requirements.skills)) {
    if (getLevel(player, skill) < lvl) return false;
  }
  return true;
}

// Starting region per archetype — used for prestige-goal check.
const ARCHETYPE_START_REGION = {
  'Efficiency Andy': 'heartlands',
  'AFK Andy':        'heartlands',
  'Money Maker':     'heartlands',
  'PvM Rusher':      'heartlands',
  'Skiller':         'heartlands',
  'Quester':         'heartlands',
  'Ironman':         'heartlands',
  'Candy Looper':    'heartlands',
  'Casual':          'heartlands',
};

function createDeepPlayer() {
  const base = createPlayer();
  return Object.assign(base, {
    ticksPlayed: 0,
    eventLog: [],              // every significant event with its tick
    skillUps: [],              // [{ tick, skill, from, to }]
    areaEntries: [],           // [{ tick, areaId, region }]
    methodSwitches: [],        // [{ tick, from, to, skill }]
    monstersKilled: 0,         // estimated from combat methods
    monstersByType: {},        // { monsterName: count }
    questsCompleted: [],       // [{ tick, questId, name }]
    questProgress: {},         // questId -> { complete }
    candyMoments: [],          // [{ tick, what, description }]
    stuckTicks: 0,             // how many ticks the player couldn't find a valid method
    stuckReasons: [],          // [{ tick, reason }]
    currentMethod: null,
    currentMethodStartTick: 0,
    visitedAreaIds: new Set(['heartlands']),
    regionsVisited: new Set(['heartlands']),
    prestigeReached: false,
  });
}

// Attempt to gate-check an area the method's prereqs might unlock.
function tryEnterAreasForMethod(player, method, tick) {
  const areas = (method.prerequisites && method.prerequisites.areas) || [];
  for (const areaId of areas) {
    if (player.visitedAreaIds.has(areaId)) continue;
    // Use rel.canAccessArea to decide if gate lets us in.
    const res = rel.canAccessArea(player, areaId, getLevel);
    if (res.allowed) {
      player.visitedAreaIds.add(areaId);
      const region = AREA_REGION_MAP.get(areaId) || areaId;
      player.regionsVisited.add(region);
      player.areaEntries.push({ tick, areaId, region });
      player.areasVisited.add(areaId);
      player.eventLog.push({ tick, type: 'area_entered', areaId, region });
    }
  }
  // Also check method.location if it's an area id
  if (method.location && !player.visitedAreaIds.has(method.location)) {
    const gate = rel.getAreaGate(method.location);
    if (gate) {
      const res = rel.canAccessArea(player, method.location, getLevel);
      if (res.allowed) {
        player.visitedAreaIds.add(method.location);
        const region = AREA_REGION_MAP.get(method.location) || method.location;
        player.regionsVisited.add(region);
        player.areaEntries.push({ tick, areaId: method.location, region });
        player.areasVisited.add(method.location);
        player.eventLog.push({ tick, type: 'area_entered', areaId: method.location, region });
      }
    }
  }
}

// Simulate completing quests for which prerequisites are implicitly met.
// This is a proxy: if the method references a quest the player hasn't done,
// and the player has the needed skill levels, mark quest as progressed. It's
// not a full quest simulation — it's a heuristic for tracking.
function maybeCompleteQuests(player, method, tick) {
  const quests = (method.prerequisites && method.prerequisites.quests) || [];
  for (const qId of quests) {
    if (player.questProgress[qId] && player.questProgress[qId].complete) continue;
    // If the player is USING a method that requires this quest, then by
    // implication they completed it. Mark done and log.
    player.questProgress[qId] = { complete: true, tick };
    const qu = rel.getQuestUnlocks(qId);
    const name = qu ? qu.name : qId;
    player.questsCompleted.push({ tick, questId: qId, name });
    player.eventLog.push({ tick, type: 'quest_completed', questId: qId, name });
  }
}

// Estimate monster kills from a combat method per tick.
function estimateKills(method, ticksRun) {
  if (!COMBAT_SKILLS.has(method.skill) || method.skill === 'prayer') return 0;
  // Roughly: 20-30 kills/hour at low level, 100-300 at high. Use xpPerHour/1000.
  const xp = Array.isArray(method.xpPerHour) ? method.xpPerHour[1] : method.xpPerHour;
  const killsPerHour = Math.max(10, Math.min(500, xp / 250));
  return (killsPerHour * ticksRun) / TICKS_PER_HOUR;
}

function gatherAvailableMethods(player, personality) {
  const available = [];
  for (const skill of SKILLS) {
    const methods = rel.listMethodsForSkill(skill);
    for (const m of methods) {
      const lvl = getLevel(player, skill);
      if (lvl >= 99) continue;
      if (lvl < m.levelRange[0] || lvl > m.levelRange[1]) continue;
      const prereqs = m.prerequisites || {};
      let ok = true;
      for (const [s, l] of Object.entries(prereqs.skills || {})) {
        if (getLevel(player, s) < l) { ok = false; break; }
      }
      if (!ok) continue;
      // Check area requirements — player must have been able to enter
      const reqAreas = prereqs.areas || [];
      let areaOk = true;
      for (const aId of reqAreas) {
        if (!player.visitedAreaIds.has(aId)) {
          const gate = rel.getAreaGate(aId);
          if (gate) {
            const res = rel.canAccessArea(player, aId, getLevel);
            if (!res.allowed) { areaOk = false; break; }
          }
        }
      }
      if (!areaOk) continue;
      if (!personality.filter(m, player)) continue;
      available.push(m);
    }
  }
  return available;
}

// Boredom factor: the more ticks a player has spent on a skill, the less
// attractive another session on the same skill becomes. This does NOT override
// personality preferences — it adds a small diminishing-returns tail that
// mirrors how real players naturally switch activities to avoid monotony.
function boredomPenalty(player, skill) {
  const ticksOnSkill = (player.skillHours[skill] || 0) * TICKS_PER_HOUR;
  // Penalty grows slowly: 0 at start, 10 after 500 ticks, 30 after 2000 ticks.
  return Math.min(40, Math.log2(1 + ticksOnSkill / 50) * 5);
}

function simulatePersonalityDeep(personalityName, maxTicks) {
  const personality = PERSONALITIES[personalityName];
  const player = createDeepPlayer();

  let chosen = null;
  let tickSinceDecision = 0;
  let ticksOnCurrent = 0;

  for (let tick = 0; tick < maxTicks; tick++) {
    player.ticksPlayed = tick + 1;

    // Decide on a method every DECISION_INTERVAL ticks (or if no method yet).
    if (chosen === null || tickSinceDecision >= DECISION_INTERVAL) {
      const available = gatherAvailableMethods(player, personality);

      if (available.length === 0) {
        player.stuckTicks++;
        if (player.stuckReasons.length < 50) {
          player.stuckReasons.push({
            tick,
            reason: 'no_available_methods',
            levels: SKILLS.map(s => `${s}:${getLevel(player, s)}`).join(','),
          });
        }
        // Advance tick budget — we're idle
        tickSinceDecision = 0;
        continue;
      }

      const scored = available.map(m => {
        const base = personality.score(m, player, baseScore(m, player));
        // Subtract boredom; Efficiency Andy and Ironman ignore boredom (grinding
        // mindset) to preserve their lock-in behavior, everyone else has a
        // mild natural-variation tail.
        const ignoresBoredom = personalityName === 'Efficiency Andy' || personalityName === 'Ironman';
        const adjusted = ignoresBoredom ? base : base - boredomPenalty(player, m.skill);
        return { method: m, score: adjusted };
      });
      scored.sort((a, b) => b.score - a.score);
      const next = scored[0].method;

      // Record switch if different from current
      if (chosen !== null && chosen.id !== next.id) {
        player.methodSwitches.push({
          tick,
          from: chosen.id,
          to: next.id,
          skill: next.skill,
          ticksOnPrevious: ticksOnCurrent,
        });
        player.eventLog.push({
          tick, type: 'method_switch',
          from: chosen.id, to: next.id, skill: next.skill,
        });
      } else if (chosen === null) {
        player.eventLog.push({ tick, type: 'method_start', id: next.id, skill: next.skill });
      }

      chosen = next;
      player.currentMethod = chosen.id;
      player.currentMethodStartTick = tick;
      player.methodsUsed.add(chosen.id);
      if (!player.methodsUsedOrder.find(e => e.id === chosen.id)) {
        player.methodsUsedOrder.push({ tick, id: chosen.id, skill: chosen.skill, name: chosen.name });
      }
      tickSinceDecision = 0;
      ticksOnCurrent = 0;

      // Register produced items (used by ironman filter and candy detection)
      if (chosen.resourceOutput && chosen.resourceOutput.produces) {
        for (const p of chosen.resourceOutput.produces) {
          player.produced[p.name] = (player.produced[p.name] || 0) + (p.perHour || 1);
        }
      }

      // Candy moment: low xpPerHour methods with quirky-feeling properties
      // Only fire once per method per player (the first time we pick it).
      if (!player._seenCandy) player._seenCandy = new Set();
      if (!player._seenCandy.has(chosen.id)) {
        const xpHour = Array.isArray(chosen.xpPerHour) ? chosen.xpPerHour[1] : chosen.xpPerHour;
        if (xpHour < 3000 && chosen.attention !== 'maximum') {
          player.candyMoments.push({
            tick, what: chosen.id, description: `Discovered low-XP flavor method ${chosen.name} (${chosen.skill})`,
          });
        }
        if (chosen.danger === 'extreme' || chosen.complexity === 'intense') {
          player.candyMoments.push({
            tick, what: chosen.id, description: `Entered high-stakes method ${chosen.name}`,
          });
        }
        // Quirky interactions are explicit candy — detect by id pattern
        if (chosen.id.includes('quirky_') || chosen.name.startsWith('[Quirky]')) {
          player.candyMoments.push({
            tick, what: chosen.id, description: `Quirky interaction: ${chosen.name}`,
          });
        }
        player._seenCandy.add(chosen.id);
      }

      // Attempt to enter any areas unlocked by this method's prereqs/location
      tryEnterAreasForMethod(player, chosen, tick);
      // Implicit quest completion (proxy)
      maybeCompleteQuests(player, chosen, tick);
    }

    // Apply XP for this tick (continuous accumulation)
    if (chosen) {
      const xpHour = Array.isArray(chosen.xpPerHour)
        ? (chosen.xpPerHour[0] + chosen.xpPerHour[1]) / 2
        : chosen.xpPerHour;
      const xpPerTick = xpHour / TICKS_PER_HOUR;
      const levelUp = addXp(player, chosen.skill, xpPerTick);
      player.skillHours[chosen.skill] = (player.skillHours[chosen.skill] || 0) + (1 / TICKS_PER_HOUR);

      if (levelUp) {
        player.skillUps.push({ tick, skill: chosen.skill, from: levelUp.oldLvl, to: levelUp.newLvl });
        player.eventLog.push({ tick, type: 'skill_up', skill: chosen.skill, from: levelUp.oldLvl, to: levelUp.newLvl });

        // Fire breakpoints for the level range crossed
        const bps = rel.getBreakpointsForSkill(chosen.skill)
          .filter(bp => bp.trigger.level > levelUp.oldLvl && bp.trigger.level <= levelUp.newLvl);
        for (const bp of bps) {
          player.breakpoints.push({
            tick, skill: chosen.skill, level: bp.trigger.level,
            importance: bp.importance, description: bp.description,
          });
          player.eventLog.push({
            tick, type: 'breakpoint',
            skill: chosen.skill, level: bp.trigger.level, importance: bp.importance,
          });
          if (bp.importance === 'transformative' && player.candyMoments.length < 200) {
            player.candyMoments.push({
              tick, what: `${chosen.skill}_${bp.trigger.level}`,
              description: bp.description || 'Transformative breakpoint',
            });
          }
        }

        // Level-up may unlock new areas — recheck
        tryEnterAreasForMethod(player, chosen, tick);
      }

      // Monster kill estimation (only if the chosen method is combat-flavored)
      if (COMBAT_SKILLS.has(chosen.skill) && chosen.skill !== 'prayer') {
        const addKills = estimateKills(chosen, 1);
        player.monstersKilled += addKills;
        const key = chosen.name;
        player.monstersByType[key] = (player.monstersByType[key] || 0) + addKills;
      }

      ticksOnCurrent++;
    }

    tickSinceDecision++;

    // Periodically check prestige goal
    if (tick % AREA_VISIT_COOLDOWN === 0) {
      const region = ARCHETYPE_START_REGION[personalityName] || 'heartlands';
      const goal = PRESTIGE_GOALS[region];
      if (!player.prestigeReached && goal && meetsPrestigeRequirements(player, goal)) {
        player.prestigeReached = true;
        player.prestigeReachedAt = tick;
        player.eventLog.push({ tick, type: 'prestige_reached', region, goal: goal.name });
      }
    }
  }

  return player;
}

// ══════════════════════════════════════════════════════════════════════════════
// DEEP REPORTING
// ══════════════════════════════════════════════════════════════════════════════

function buildDeepReport(results, meta) {
  const names = Object.keys(results);

  // Cross-archetype method usage
  const methodCounts = new Map();
  for (const [, p] of Object.entries(results)) {
    for (const mId of p.methodsUsed) {
      methodCounts.set(mId, (methodCounts.get(mId) || 0) + 1);
    }
  }

  const uniqueToOne = [];
  const universal = [];
  const shared = [];
  const byArchetypeUnique = {};
  for (const n of names) byArchetypeUnique[n] = [];

  for (const [mId, count] of methodCounts) {
    if (count === 1) {
      uniqueToOne.push(mId);
      for (const [n, p] of Object.entries(results)) {
        if (p.methodsUsed.has(mId)) { byArchetypeUnique[n].push(mId); break; }
      }
    } else if (count === names.length) {
      universal.push(mId);
    } else {
      shared.push({ id: mId, count });
    }
  }

  // Divergence matrix
  const matrix = computeDivergence(results);
  const sims = [];
  for (const a of names) for (const b of names) if (a !== b) sims.push(matrix[a][b]);
  const avgSim = sims.reduce((s, x) => s + x, 0) / sims.length;

  // Per-archetype detail
  const archetypes = {};
  for (const [n, p] of Object.entries(results)) {
    const levels = {};
    let totalLevel = 0;
    for (const s of SKILLS) {
      const lvl = getLevel(p, s);
      levels[s] = lvl;
      totalLevel += lvl;
    }
    const methodsSharedCount = [...p.methodsUsed].filter(m => methodCounts.get(m) > 1).length;
    const transformativeBps = p.breakpoints.filter(b => b.importance === 'transformative');
    const majorBps = p.breakpoints.filter(b => b.importance === 'major');

    // Compute divergence score: 1 - avg similarity to others
    let simSum = 0, simN = 0;
    for (const other of names) {
      if (other === n) continue;
      simSum += matrix[n][other] || 0; simN++;
    }
    const avgSimToOthers = simN > 0 ? simSum / simN : 0;
    const divergenceScore = 1 - avgSimToOthers;

    const topCandy = p.candyMoments.slice(0, 10);
    const stuck = p.stuckTicks > 0;
    const startRegion = ARCHETYPE_START_REGION[n] || 'heartlands';
    const prestigeGoal = PRESTIGE_GOALS[startRegion];

    archetypes[n] = {
      description: PERSONALITIES[n].description,
      ticksPlayed: p.ticksPlayed,
      finalLevels: levels,
      totalLevel,
      maxedSkills: Object.values(levels).filter(l => l >= 99).length,
      methodsUsedCount: p.methodsUsed.size,
      methodsShared: methodsSharedCount,
      methodsUnique: byArchetypeUnique[n].length,
      uniqueMethodIds: byArchetypeUnique[n].slice(0, 20),
      breakpointsTotal: p.breakpoints.length,
      breakpointsTransformative: transformativeBps.length,
      breakpointsMajor: majorBps.length,
      skillUps: p.skillUps.length,
      areasEntered: p.areaEntries.length,
      regionsVisited: [...p.regionsVisited],
      methodSwitches: p.methodSwitches.length,
      monstersKilledEstimate: Math.round(p.monstersKilled),
      monsterTypeDiversity: Object.keys(p.monstersByType).length,
      questsCompleted: p.questsCompleted.length,
      questList: p.questsCompleted.slice(0, 15).map(q => q.name),
      candyMoments: topCandy,
      stuck,
      stuckTicks: p.stuckTicks,
      stuckReasons: p.stuckReasons.slice(0, 5),
      startRegion,
      prestigeGoal: prestigeGoal ? prestigeGoal.name : null,
      prestigeReached: !!p.prestigeReached,
      prestigeReachedAt: p.prestigeReachedAt || null,
      divergenceScore: Number(divergenceScore.toFixed(4)),
      avgSimilarityToOthers: Number(avgSimToOthers.toFixed(4)),
      topSkills: SKILLS.map(s => ({ skill: s, hours: p.skillHours[s] || 0 }))
        .sort((a, b) => b.hours - a.hours).slice(0, 5),
      firstBreakpoints: p.breakpoints.slice(0, 5),
    };
  }

  // Threshold checks
  const thresholds = {
    unique_to_one_count: uniqueToOne.length,
    unique_to_one_target: 100,
    unique_to_one_pass: uniqueToOne.length >= 100,

    average_similarity: Number(avgSim.toFixed(4)),
    average_similarity_max: 0.40,
    average_similarity_pass: avgSim <= 0.40,

    max_total_level: Math.max(...Object.values(archetypes).map(a => a.totalLevel)),
    max_total_level_cap: 2100,
    max_total_level_pass: Object.values(archetypes).every(a => a.totalLevel < 2100),

    every_archetype_transformative: Object.values(archetypes).every(a => a.breakpointsTransformative >= 1),
    archetypes_without_transformative: Object.entries(archetypes)
      .filter(([, a]) => a.breakpointsTransformative === 0).map(([n]) => n),
  };

  return {
    meta,
    thresholds,
    archetypes,
    cross: {
      universalMethods: universal,
      universalCount: universal.length,
      uniqueToOneMethods: uniqueToOne,
      uniqueToOneCount: uniqueToOne.length,
      sharedMethods: shared.map(s => s.id),
      sharedMethodCount: shared.length,
      divergenceMatrix: matrix,
      averageSimilarity: Number(avgSim.toFixed(4)),
      minSimilarity: Number(Math.min(...sims).toFixed(4)),
      maxSimilarity: Number(Math.max(...sims).toFixed(4)),
    },
  };
}

function renderMarkdown(report) {
  const lines = [];
  const { meta, thresholds, archetypes, cross } = report;

  lines.push('# Multi-Agent Deep Simulation Report');
  lines.push('');
  lines.push(`Generated: ${meta.generatedAt}`);
  lines.push(`Ticks per archetype: ${meta.ticksPerArchetype} (~${(meta.ticksPerArchetype / TICKS_PER_HOUR).toFixed(2)} game-hours)`);
  lines.push(`Archetypes: ${meta.archetypeCount}`);
  lines.push(`Total simulated ticks: ${meta.totalTicks}`);
  lines.push(`Simulation wall time: ${meta.elapsedMs} ms`);
  lines.push('');

  lines.push('## Threshold Results');
  lines.push('');
  lines.push('| Metric | Value | Target | Result |');
  lines.push('|--------|-------|--------|--------|');
  lines.push(`| Unique-to-1-archetype methods | ${thresholds.unique_to_one_count} | >= ${thresholds.unique_to_one_target} | ${thresholds.unique_to_one_pass ? 'PASS' : 'FAIL'} |`);
  lines.push(`| Average route similarity | ${(thresholds.average_similarity * 100).toFixed(1)}% | <= ${(thresholds.average_similarity_max * 100).toFixed(0)}% | ${thresholds.average_similarity_pass ? 'PASS' : 'FAIL'} |`);
  lines.push(`| Max total level across archetypes | ${thresholds.max_total_level} | < ${thresholds.max_total_level_cap} | ${thresholds.max_total_level_pass ? 'PASS' : 'FAIL'} |`);
  lines.push(`| Every archetype hits transformative BP | ${thresholds.every_archetype_transformative ? 'yes' : 'no'} | yes | ${thresholds.every_archetype_transformative ? 'PASS' : 'FAIL'} |`);
  if (thresholds.archetypes_without_transformative.length > 0) {
    lines.push(`| Archetypes missing transformative | ${thresholds.archetypes_without_transformative.join(', ')} |  |  |`);
  }
  lines.push('');

  lines.push('## Cross-Archetype Summary');
  lines.push('');
  lines.push(`- Methods used by all ${meta.archetypeCount} archetypes: ${cross.universalCount}`);
  lines.push(`- Methods used by exactly 1 archetype: ${cross.uniqueToOneCount}`);
  lines.push(`- Methods used by 2-${meta.archetypeCount - 1} archetypes: ${cross.sharedMethodCount}`);
  lines.push(`- Average route similarity (Jaccard): ${(cross.averageSimilarity * 100).toFixed(1)}%`);
  lines.push(`- Min / Max pairwise similarity: ${(cross.minSimilarity * 100).toFixed(1)}% / ${(cross.maxSimilarity * 100).toFixed(1)}%`);
  lines.push('');

  lines.push('### Overlap Matrix (Jaccard %)');
  lines.push('');
  const names = Object.keys(archetypes);
  lines.push('| From \\ To | ' + names.map(n => n).join(' | ') + ' |');
  lines.push('|' + '---|'.repeat(names.length + 1));
  for (const n of names) {
    const row = [n];
    for (const m of names) {
      if (n === m) { row.push('--'); continue; }
      row.push(((cross.divergenceMatrix[n][m] || 0) * 100).toFixed(0) + '%');
    }
    lines.push('| ' + row.join(' | ') + ' |');
  }
  lines.push('');

  lines.push('### Universally-used Methods');
  lines.push('');
  if (cross.universalMethods.length === 0) {
    lines.push('_None — no method was picked by all archetypes. That is genuinely surprising._');
  } else {
    for (const mId of cross.universalMethods.slice(0, 30)) {
      const m = rel.getTrainingMethod(mId);
      if (m) lines.push(`- ${m.skill}/${m.name} (${mId})`);
    }
  }
  lines.push('');

  lines.push('### Methods Used By Only One Archetype (first 30)');
  lines.push('');
  for (const mId of cross.uniqueToOneMethods.slice(0, 30)) {
    const m = rel.getTrainingMethod(mId);
    if (m) lines.push(`- ${m.skill}/${m.name} (${mId})`);
  }
  lines.push('');

  lines.push('## Per-Archetype Reports');
  lines.push('');
  for (const [name, a] of Object.entries(archetypes)) {
    lines.push(`### ${name}`);
    lines.push('');
    lines.push(`_${a.description}_`);
    lines.push('');
    lines.push(`- Total level: **${a.totalLevel}** (maxed skills: ${a.maxedSkills}/23)`);
    lines.push(`- Methods: ${a.methodsUsedCount} used (${a.methodsUnique} unique to this archetype, ${a.methodsShared} shared)`);
    lines.push(`- Breakpoints: ${a.breakpointsTotal} total (${a.breakpointsTransformative} transformative, ${a.breakpointsMajor} major)`);
    lines.push(`- Areas entered: ${a.areasEntered} | Regions visited: ${a.regionsVisited.join(', ')}`);
    lines.push(`- Method switches: ${a.methodSwitches} | Quests completed: ${a.questsCompleted}`);
    lines.push(`- Monster kills (est): ${a.monstersKilledEstimate} across ${a.monsterTypeDiversity} monster types`);
    lines.push(`- Divergence score: ${(a.divergenceScore * 100).toFixed(1)}% (avg similarity to others: ${(a.avgSimilarityToOthers * 100).toFixed(1)}%)`);
    lines.push(`- Stuck: ${a.stuck ? 'yes, ' + a.stuckTicks + ' ticks' : 'no'}`);
    lines.push(`- Prestige goal (${a.startRegion}): ${a.prestigeGoal || 'n/a'} — ${a.prestigeReached ? 'REACHED at tick ' + a.prestigeReachedAt : 'not reached'}`);
    lines.push('');
    lines.push('**Final Skill Levels**');
    lines.push('');
    lines.push('| Skill | Level | Skill | Level | Skill | Level |');
    lines.push('|---|---|---|---|---|---|');
    const skillRows = Object.entries(a.finalLevels);
    for (let i = 0; i < skillRows.length; i += 3) {
      const row = [];
      for (let j = 0; j < 3; j++) {
        const entry = skillRows[i + j];
        if (entry) row.push(entry[0], entry[1]); else row.push('', '');
      }
      lines.push('| ' + row.join(' | ') + ' |');
    }
    lines.push('');
    if (a.candyMoments.length > 0) {
      lines.push('**Top Candy Moments**');
      lines.push('');
      for (const c of a.candyMoments.slice(0, 5)) {
        lines.push(`- tick ${c.tick}: ${c.description}`);
      }
      lines.push('');
    }
    if (a.stuck) {
      lines.push('**Stuck Analysis**');
      lines.push('');
      for (const r of a.stuckReasons) {
        lines.push(`- tick ${r.tick}: ${r.reason}`);
      }
      lines.push('');
    }
  }

  lines.push('## Verdict');
  lines.push('');
  const passCount = [
    thresholds.unique_to_one_pass,
    thresholds.average_similarity_pass,
    thresholds.max_total_level_pass,
    thresholds.every_archetype_transformative,
  ].filter(Boolean).length;
  lines.push(`**${passCount}/4 thresholds pass.**`);
  lines.push('');
  if (passCount === 4) {
    lines.push('The game is non-degenerate under this tick budget. Archetypes diverge meaningfully, no single route dominates, and every archetype experiences a transformative moment.');
  } else {
    lines.push('Review failing thresholds above. Degeneracy or missing content may need attention.');
  }
  lines.push('');

  return lines.join('\n');
}

// ══════════════════════════════════════════════════════════════════════════════
// CLI
// ══════════════════════════════════════════════════════════════════════════════

const args = process.argv.slice(2);
const hoursIdx = args.indexOf('--hours');
const hours = hoursIdx >= 0 ? parseInt(args[hoursIdx + 1]) || 1500 : 1500;
const deepFlag = args.includes('--deep');
const ticksIdx = args.indexOf('--ticks');
const ticks = ticksIdx >= 0 ? parseInt(args[ticksIdx + 1]) || 10000 : 10000;
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : 'reports';

if (deepFlag) {
  const path = require('path');
  const fs = require('fs');

  console.log(`Running ${Object.keys(PERSONALITIES).length} personalities for ${ticks} ticks each (~${(ticks / TICKS_PER_HOUR).toFixed(2)} game-hours)...`);
  console.log('');

  const start = Date.now();
  const results = {};
  for (const name of Object.keys(PERSONALITIES)) {
    process.stdout.write(`  ${name}... `);
    const player = simulatePersonalityDeep(name, ticks);
    results[name] = player;
    console.log(`done (${player.methodsUsed.size} methods, ${player.breakpoints.length} bps, ${player.skillUps.length} skill-ups, ${player.areaEntries.length} area entries)`);
  }
  const elapsed = Date.now() - start;

  const meta = {
    generatedAt: new Date().toISOString(),
    archetypeCount: Object.keys(PERSONALITIES).length,
    ticksPerArchetype: ticks,
    totalTicks: ticks * Object.keys(PERSONALITIES).length,
    elapsedMs: elapsed,
    decisionInterval: DECISION_INTERVAL,
    ticksPerHour: TICKS_PER_HOUR,
  };

  const report = buildDeepReport(results, meta);
  const md = renderMarkdown(report);

  // Ensure directory exists
  const absOut = path.isAbsolute(outDir) ? outDir : path.resolve(process.cwd(), outDir);
  if (!fs.existsSync(absOut)) fs.mkdirSync(absOut, { recursive: true });

  const jsonPath = path.join(absOut, 'multi-agent-10k.json');
  const mdPath = path.join(absOut, 'multi-agent-10k.md');
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  fs.writeFileSync(mdPath, md);

  console.log('');
  console.log(`Wall time: ${elapsed} ms`);
  console.log(`Wrote ${jsonPath}`);
  console.log(`Wrote ${mdPath}`);
  console.log('');
  console.log('Threshold results:');
  console.log(`  unique-to-1 methods:     ${report.thresholds.unique_to_one_count} / target ${report.thresholds.unique_to_one_target}  ${report.thresholds.unique_to_one_pass ? 'PASS' : 'FAIL'}`);
  console.log(`  avg route similarity:    ${(report.thresholds.average_similarity * 100).toFixed(1)}% / max ${(report.thresholds.average_similarity_max * 100).toFixed(0)}%   ${report.thresholds.average_similarity_pass ? 'PASS' : 'FAIL'}`);
  console.log(`  max total level:         ${report.thresholds.max_total_level} / cap ${report.thresholds.max_total_level_cap}  ${report.thresholds.max_total_level_pass ? 'PASS' : 'FAIL'}`);
  console.log(`  all have transformative: ${report.thresholds.every_archetype_transformative ? 'yes' : 'no'}  ${report.thresholds.every_archetype_transformative ? 'PASS' : 'FAIL'}`);

  process.exit(0);
}

// ── Legacy hour-based mode (preserved for `node src/tools/multi-agent-sim.js`) ─
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
