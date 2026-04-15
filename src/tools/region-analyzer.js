#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// REGION DEPTH ANALYZER
//
// Backwards reachability analysis scoped to a single Aelgard region.
// Tests whether a region is deep enough to support an area-locked account
// journey (Swampletics-style).
//
// For each region it reports:
//   - Content density (obtainable items, reachable recipes, unique exports)
//   - Skill ceilings (max achievable level per skill if locked)
//   - Supply chain independence (self-sufficient vs import-dependent)
//   - Obscure connections discovered (the "Temple Trekking gives bowstrings" magic)
//   - Quirky interactions (ambient world objects that give XP)
//   - Prestige goal status (reachable, blocked, marginal)
//   - Content gaps (what to add to make the region deeper)
//   - Depth score (0-100)
//
// Usage:
//   node src/tools/region-analyzer.js --region Moryskah
//   node src/tools/region-analyzer.js --all
//   node src/tools/region-analyzer.js --compare
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const rel = require('../data/relationships');

// Load all content
require('../content/aelgard/area-gates');
require('../content/aelgard/quest-unlocks');
require('../content/aelgard/item-ecosystem');
require('../content/aelgard/training-knobs');
require('../content/aelgard/breakpoints');
try { require('../content/aelgard/skill-web'); } catch (e) { /* optional */ }
try { require('../content/aelgard/heartlands-deep'); } catch (e) { /* optional */ }
try { require('../content/aelgard/heartlands-density'); } catch (e) { /* optional */ }
try { require('../content/aelgard/heartlands-tertiary'); } catch (e) { /* optional */ }
try { require('../content/aelgard/heartlands-easter-eggs'); } catch (e) { /* optional */ }
try { require('../content/aelgard/moryskah-deep'); } catch (e) { /* optional */ }
try { require('../content/aelgard/moryskah-density'); } catch (e) { /* optional */ }
try { require('../content/aelgard/moryskah-tertiary'); } catch (e) { /* optional */ }
try { require('../content/aelgard/moryskah-easter-eggs'); } catch (e) { /* optional */ }
try { require('../content/aelgard/sootworks-deep'); } catch (e) { /* optional */ }
try { require('../content/aelgard/sootworks-density'); } catch (e) { /* optional */ }
try { require('../content/aelgard/saltbrine-deep'); } catch (e) { /* optional */ }
try { require('../content/aelgard/saltbrine-density'); } catch (e) { /* optional */ }
try { require('../content/aelgard/veilwood-deep'); } catch (e) { /* optional */ }
try { require('../content/aelgard/veilwood-density'); } catch (e) { /* optional */ }
try { require('../content/aelgard/boneyard-deep'); } catch (e) { /* optional */ }
try { require('../content/aelgard/boneyard-density'); } catch (e) { /* optional */ }
try { require('../content/aelgard/glass-desert-deep'); } catch (e) { /* optional */ }
try { require('../content/aelgard/glass-desert-density'); } catch (e) { /* optional */ }
try { require('../content/aelgard/inkweald-deep'); } catch (e) { /* optional */ }
try { require('../content/aelgard/inkweald-density'); } catch (e) { /* optional */ }
try { require('../content/aelgard/wilds-deep'); } catch (e) { /* optional */ }
try { require('../content/aelgard/wilds-density'); } catch (e) { /* optional */ }
try { require('../content/aelgard/mid-tier-regions'); } catch (e) { /* optional */ }
try { require('../content/aelgard/universal-items'); } catch (e) { /* optional */ }
try { require('../content/aelgard/special-regions'); } catch (e) { /* optional */ }
try { require('../content/aelgard/combinations-mega'); } catch (e) { /* optional */ }
try { require('../content/aelgard/recipes-mega'); } catch (e) { /* optional */ }

let PRESTIGE_GOALS = {};
try {
  const cross = require('../content/aelgard/cross-region-web');
  PRESTIGE_GOALS = cross.PRESTIGE_GOALS || {};
} catch (e) { /* optional */ }

let quirky = null;
try { quirky = require('../content/aelgard/quirky-interactions'); } catch (e) { /* optional */ }

// ── Region name normalization ─────────────────────────────────────────────────
// area-gates use snake_case IDs (heartlands, moryskah, saltbrine_reach)
// training methods use human names ('Heartlands', 'Saltbrine Reach', 'Moryskah')

const REGION_IDS = [
  'heartlands', 'boneyard_wastes', 'veilwood', 'sootworks',
  'moryskah', 'inkweald', 'saltbrine_reach', 'glass_desert', 'the_wilds',
];

const REGION_LABELS = {
  'heartlands':        'Heartlands',
  'boneyard_wastes':   'Boneyard Wastes',
  'veilwood':          'Veilwood',
  'sootworks':         'Sootworks',
  'moryskah':          'Moryskah',
  'inkweald':          'Inkweald',
  'saltbrine_reach':   'Saltbrine Reach',
  'glass_desert':      'Glass Desert',
  'the_wilds':         'The Wilds',
};

function normalizeRegion(input) {
  if (!input) return null;
  const lower = input.toLowerCase().replace(/ /g, '_');
  if (REGION_IDS.includes(lower)) return lower;
  // Try matching against labels
  for (const [id, label] of Object.entries(REGION_LABELS)) {
    if (label.toLowerCase() === input.toLowerCase()) return id;
  }
  return null;
}

// ── Skills list ───────────────────────────────────────────────────────────────
const SKILLS = [
  'attack', 'strength', 'defence', 'hitpoints', 'ranged', 'prayer', 'magic',
  'runecrafting', 'construction', 'agility', 'herblore', 'thieving',
  'crafting', 'fletching', 'slayer', 'hunter', 'mining', 'smithing',
  'fishing', 'cooking', 'firemaking', 'woodcutting', 'farming',
];

// ── Gather all item IDs from registries ───────────────────────────────────────
// Since the relationship module doesn't expose a listAllItems function, we walk
// the registries we do have access to.

function collectAllItemIds() {
  const ids = new Set();
  // From all combinations
  // (we can't enumerate combinations directly, so we'll sample known ID ranges)
  for (let id = 1; id <= 99999; id++) {
    if (rel.getCombination(id)) ids.add(id);
    const sources = rel.getItemSources(id);
    if (sources && sources.length > 0) ids.add(id);
    const uses = rel.getItemUses(id);
    if (uses && uses.length > 0) ids.add(id);
  }
  return ids;
}

// ── Main analysis function ────────────────────────────────────────────────────

function analyzeRegion(regionId) {
  const regionLabel = REGION_LABELS[regionId] || regionId;

  // Step 1: Collect items directly obtainable in this region
  const obtainable = new Set();
  const obtainableNames = new Set();
  const obscureConnections = [];

  // From item source registrations tagged to this region
  for (let id = 1; id <= 99999; id++) {
    const sources = rel.getItemSources(id);
    if (!sources) continue;
    for (const src of sources) {
      if (src.region === regionId || src.region === regionLabel || src.region === null) {
        if (src.region === regionId || src.region === regionLabel) {
          obtainable.add(id);
          obtainableNames.add(src.sourceName || `item_${id}`);
          if (src.obscure) {
            obscureConnections.push({
              itemId: id,
              source: src.sourceName,
              details: src.details,
              direction: 'source',
            });
          }
        }
      }
    }
  }

  // From training methods in this region (mining/fishing/woodcutting produce items)
  const methodsInRegion = [];
  for (const skill of SKILLS) {
    for (const method of rel.listMethodsForSkill(skill)) {
      if (method.location === regionLabel) {
        methodsInRegion.push(method);
        // Add produced items to obtainable
        if (method.resourceOutput && method.resourceOutput.produces) {
          for (const p of method.resourceOutput.produces) {
            obtainableNames.add(p.name);
          }
        }
      }
    }
  }

  // From area gates — items required to enter
  // (these are items the player must HAVE, not items obtainable here)

  // Step 2: Flood-fill the recipe graph
  let iteration = 0;
  let expanded = true;
  const reachableViaRecipes = new Set();
  while (expanded && iteration < 10) {
    expanded = false;
    iteration++;
    for (let id = 1; id <= 99999; id++) {
      const combo = rel.getCombination(id);
      if (!combo) continue;
      if (obtainable.has(id) || reachableViaRecipes.has(id)) continue;
      // Check if all inputs are obtainable
      let allInputsAvailable = true;
      for (const input of combo.inputs) {
        const inputId = input.id;
        const inputName = input.name;
        if (!obtainable.has(inputId) && !reachableViaRecipes.has(inputId) &&
            !obtainableNames.has(inputName)) {
          allInputsAvailable = false;
          break;
        }
      }
      if (allInputsAvailable) {
        reachableViaRecipes.add(id);
        obtainableNames.add(combo.resultName);
        expanded = true;
      }
    }
  }

  // Step 3: Determine skill ceilings
  const skillCeilings = {};
  const skillStatus = {};
  for (const skill of SKILLS) {
    const methods = methodsInRegion.filter(m => m.skill === skill);
    if (methods.length === 0) {
      skillCeilings[skill] = 1;
      skillStatus[skill] = 'hard_blocked';
    } else {
      const maxLevel = Math.max(...methods.map(m => m.levelRange[1]));
      skillCeilings[skill] = maxLevel;

      // Check if any method has inputs obtainable in region
      let selfSufficient = false;
      let hasAnyMethod = false;
      for (const m of methods) {
        hasAnyMethod = true;
        const inputs = m.inputs || [];
        if (inputs.length === 0) {
          selfSufficient = true;
          break;
        }
        let allInputsAvailable = true;
        for (const inp of inputs) {
          if (!obtainableNames.has(inp.name)) {
            allInputsAvailable = false;
            break;
          }
        }
        if (allInputsAvailable) {
          selfSufficient = true;
          break;
        }
      }
      skillStatus[skill] = selfSufficient ? 'self_sufficient' :
                           hasAnyMethod ? 'needs_imports' : 'hard_blocked';
    }
  }

  // Step 4: Prestige goal analysis
  const goal = PRESTIGE_GOALS[regionId];
  let goalStatus = null;
  if (goal) {
    const required = goal.requirements?.skills || {};
    const missingSkills = [];
    for (const [skill, lvl] of Object.entries(required)) {
      if (skillCeilings[skill] < lvl) {
        missingSkills.push({ skill, needed: lvl, achievable: skillCeilings[skill] });
      }
    }
    let status = 'reachable';
    if (missingSkills.length > 0) {
      status = missingSkills.length > Object.keys(required).length / 2 ? 'blocked' : 'marginal';
    }
    goalStatus = {
      name: goal.name,
      status,
      missingSkills,
      flavor: goal.flavor,
    };
  }

  // Step 5: Cross-region imports needed
  const imports = [];
  for (const m of methodsInRegion) {
    for (const inp of (m.inputs || [])) {
      if (!obtainableNames.has(inp.name)) {
        imports.push({ method: m.name, skill: m.skill, needs: inp.name, source: inp.source });
      }
    }
  }

  // Step 6: Quirky interactions in this region
  const quirkyInRegion = quirky ? quirky.listQuirkyForRegion(regionId) : [];

  // Step 7: Compute depth score (0-100)
  const skillCoverage = SKILLS.filter(s => skillStatus[s] !== 'hard_blocked').length / SKILLS.length;
  const selfSufficient = SKILLS.filter(s => skillStatus[s] === 'self_sufficient').length / SKILLS.length;
  const itemDensity = Math.min(obtainable.size / 50, 1.0);  // benchmark: 50 items
  const recipeDensity = Math.min(reachableViaRecipes.size / 15, 1.0);  // benchmark: 15 recipes
  const goalReachable = goalStatus?.status === 'reachable' ? 1.0 :
                        goalStatus?.status === 'marginal' ? 0.5 : 0.0;

  const score = Math.round(
    skillCoverage * 30 +
    selfSufficient * 20 +
    itemDensity * 15 +
    recipeDensity * 15 +
    goalReachable * 20
  );

  return {
    regionId,
    regionLabel,
    methodsInRegion: methodsInRegion.length,
    obtainableItems: obtainable.size,
    reachableRecipes: reachableViaRecipes.size,
    floodFillIterations: iteration,
    skillCeilings,
    skillStatus,
    obscureConnections,
    imports,
    quirkyInteractions: quirkyInRegion.length,
    quirkyList: quirkyInRegion,
    goalStatus,
    score,
  };
}

// ── Content gap detection ─────────────────────────────────────────────────────

function generateGapReport(analysis) {
  const gaps = [];

  // Hard-blocked skills
  const blocked = SKILLS.filter(s => analysis.skillStatus[s] === 'hard_blocked');
  if (blocked.length > 0) {
    gaps.push(`Hard-blocked skills (no methods available): ${blocked.join(', ')}`);
    gaps.push(`  Suggestion: Add at least one training method for each — or one quirky interaction.`);
  }

  // Skills with only imports
  const importsOnly = SKILLS.filter(s => analysis.skillStatus[s] === 'needs_imports');
  if (importsOnly.length > 0) {
    gaps.push(`Import-dependent skills: ${importsOnly.join(', ')}`);
    gaps.push(`  Suggestion: Add a producer skill or drop source in this region.`);
  }

  // Goal check
  if (analysis.goalStatus) {
    if (analysis.goalStatus.status === 'blocked') {
      gaps.push(`Prestige goal "${analysis.goalStatus.name}" is BLOCKED`);
      for (const m of analysis.goalStatus.missingSkills) {
        gaps.push(`  ${m.skill}: need ${m.needed}, can reach ${m.achievable}`);
      }
    } else if (analysis.goalStatus.status === 'marginal') {
      gaps.push(`Prestige goal "${analysis.goalStatus.name}" is MARGINAL — close but missing:`);
      for (const m of analysis.goalStatus.missingSkills) {
        gaps.push(`  ${m.skill}: need ${m.needed}, can reach ${m.achievable}`);
      }
    }
  }

  // Low depth score
  if (analysis.score < 50) {
    gaps.push(`LOW DEPTH SCORE (${analysis.score}/100) — region needs significant content expansion.`);
  } else if (analysis.score < 70) {
    gaps.push(`Moderate depth score (${analysis.score}/100) — region is playable but shallow.`);
  }

  return gaps;
}

// ── Report printer ────────────────────────────────────────────────────────────

function printRegionReport(analysis) {
  const gaps = generateGapReport(analysis);

  console.log('\n══════════════════════════════════════════════════════════════');
  console.log(`  REGION DEPTH ANALYSIS: ${analysis.regionLabel}`);
  console.log('══════════════════════════════════════════════════════════════\n');

  console.log('Content Density:');
  console.log(`  Training methods in region:    ${analysis.methodsInRegion}`);
  console.log(`  Items obtainable directly:     ${analysis.obtainableItems}`);
  console.log(`  Items reachable via recipes:   ${analysis.reachableRecipes} (after ${analysis.floodFillIterations} flood iterations)`);
  console.log(`  Quirky interactions:           ${analysis.quirkyInteractions}`);
  console.log('');

  console.log('Skill Ceilings (max level if locked to region):');
  const sortedSkills = SKILLS.slice().sort((a, b) => analysis.skillCeilings[b] - analysis.skillCeilings[a]);
  for (const skill of sortedSkills) {
    const lvl = analysis.skillCeilings[skill];
    const status = analysis.skillStatus[skill];
    const marker = status === 'self_sufficient' ? '+' :
                   status === 'needs_imports'    ? '~' :
                                                    'x';
    const note = status === 'self_sufficient' ? 'self-sufficient' :
                 status === 'needs_imports'    ? 'needs imports' :
                                                  'HARD BLOCKED';
    console.log(`  ${marker} ${skill.padEnd(14)} ${String(lvl).padStart(2)}    (${note})`);
  }
  console.log('');

  const selfSufficientSkills = SKILLS.filter(s => analysis.skillStatus[s] === 'self_sufficient');
  const importSkills = SKILLS.filter(s => analysis.skillStatus[s] === 'needs_imports');
  const blockedSkills = SKILLS.filter(s => analysis.skillStatus[s] === 'hard_blocked');
  console.log('Supply Chain Independence:');
  console.log(`  Self-sufficient: ${selfSufficientSkills.length} skills (${selfSufficientSkills.join(', ') || 'none'})`);
  console.log(`  Imports needed:  ${importSkills.length} skills (${importSkills.join(', ') || 'none'})`);
  console.log(`  Hard-blocked:    ${blockedSkills.length} skills (${blockedSkills.join(', ') || 'none'})`);
  console.log('');

  if (analysis.obscureConnections.length > 0) {
    console.log(`Obscure Connections Discovered: ${analysis.obscureConnections.length}`);
    for (const oc of analysis.obscureConnections.slice(0, 8)) {
      console.log(`  - ${oc.source}: ${oc.details}`);
    }
    if (analysis.obscureConnections.length > 8) {
      console.log(`  ... and ${analysis.obscureConnections.length - 8} more`);
    }
    console.log('');
  }

  if (analysis.quirkyList.length > 0) {
    console.log(`Quirky World Interactions (lifeline training methods):`);
    for (const q of analysis.quirkyList) {
      console.log(`  - ${q.name} [${q.skill}]: ${q.xpPerClick} xp/click (~${q.xpPerClick * q.clicksPerHour}/hr)`);
    }
    console.log('');
  }

  if (analysis.imports.length > 0) {
    console.log(`Cross-Region Imports Required (${analysis.imports.length} items):`);
    const uniqueImports = new Map();
    for (const imp of analysis.imports) {
      const key = imp.needs;
      if (!uniqueImports.has(key)) uniqueImports.set(key, []);
      uniqueImports.get(key).push(`${imp.skill}/${imp.method}`);
    }
    for (const [item, consumers] of uniqueImports) {
      console.log(`  ${item} (used by: ${consumers.slice(0, 3).join(', ')}${consumers.length > 3 ? '...' : ''})`);
    }
    console.log('');
  }

  if (analysis.goalStatus) {
    console.log(`Prestige Goal: "${analysis.goalStatus.name}"`);
    const statusMark = analysis.goalStatus.status === 'reachable' ? '+ REACHABLE' :
                       analysis.goalStatus.status === 'marginal'  ? '~ MARGINAL' :
                                                                    'x BLOCKED';
    console.log(`  Status: ${statusMark}  (${analysis.goalStatus.flavor})`);
    if (analysis.goalStatus.missingSkills.length > 0) {
      console.log('  Missing requirements:');
      for (const m of analysis.goalStatus.missingSkills) {
        console.log(`    ${m.skill}: need ${m.needed}, max reachable ${m.achievable}`);
      }
    }
    console.log('');
  }

  if (gaps.length > 0) {
    console.log('Content Gaps (what to add to deepen this region):');
    for (const gap of gaps) {
      console.log(`  ${gap}`);
    }
    console.log('');
  }

  console.log(`Content Depth Score: ${analysis.score}/100`);
  let rating = '';
  if (analysis.score >= 85) rating = 'Excellent — Swampletics-tier depth';
  else if (analysis.score >= 70) rating = 'Good — locked-account viable';
  else if (analysis.score >= 50) rating = 'Shallow — playable but thin';
  else rating = 'Empty shell — needs major expansion';
  console.log(`Rating: ${rating}`);
  console.log('');
}

// ── Compare mode ──────────────────────────────────────────────────────────────

function printComparisonTable(analyses) {
  console.log('\n══════════════════════════════════════════════════════════════════════════════');
  console.log('  REGION DEPTH COMPARISON');
  console.log('══════════════════════════════════════════════════════════════════════════════\n');

  const headers = ['Region', 'Methods', 'Items', 'Recipes', 'Skills', 'SelfSuff', 'Goal', 'Score'];
  const widths = [20, 8, 7, 8, 8, 9, 11, 6];
  const headerLine = headers.map((h, i) => h.padEnd(widths[i])).join('');
  console.log(headerLine);
  console.log('─'.repeat(headerLine.length));

  for (const a of analyses.sort((x, y) => y.score - x.score)) {
    const skillCount = SKILLS.filter(s => a.skillStatus[s] !== 'hard_blocked').length;
    const ssCount = SKILLS.filter(s => a.skillStatus[s] === 'self_sufficient').length;
    const goalLabel = a.goalStatus ?
      (a.goalStatus.status === 'reachable' ? '+ OK' :
       a.goalStatus.status === 'marginal'  ? '~ MARG' :
                                             'x BLK') : '-';

    const row = [
      a.regionLabel.padEnd(widths[0]),
      String(a.methodsInRegion).padEnd(widths[1]),
      String(a.obtainableItems).padEnd(widths[2]),
      String(a.reachableRecipes).padEnd(widths[3]),
      `${skillCount}/23`.padEnd(widths[4]),
      `${ssCount}/23`.padEnd(widths[5]),
      goalLabel.padEnd(widths[6]),
      `${a.score}/100`.padEnd(widths[7]),
    ].join('');
    console.log(row);
  }
  console.log('');

  // Summary stats
  const scores = analyses.map(a => a.score);
  const avg = Math.round(scores.reduce((s, x) => s + x, 0) / scores.length);
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);
  console.log(`Overall: avg=${avg}, best=${maxScore}, worst=${minScore}`);
  console.log('');
  console.log('Rating guide:');
  console.log('  85+   Excellent — Swampletics-tier depth');
  console.log('  70+   Good — locked-account viable');
  console.log('  50+   Shallow — playable but thin');
  console.log('  <50   Empty shell — needs expansion');
  console.log('');
}

// ── CLI ───────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const regionIdx = args.indexOf('--region');
const compareMode = args.includes('--compare');
const allMode = args.includes('--all') || compareMode;

if (allMode) {
  const analyses = REGION_IDS.map(r => analyzeRegion(r));
  if (compareMode) {
    printComparisonTable(analyses);
  } else {
    for (const a of analyses) printRegionReport(a);
    printComparisonTable(analyses);
  }
} else if (regionIdx >= 0) {
  const regionArg = args[regionIdx + 1];
  if (!regionArg) {
    console.error('Error: --region requires a region name');
    console.error('Valid regions: ' + REGION_IDS.join(', '));
    process.exit(1);
  }
  const regionId = normalizeRegion(regionArg);
  if (!regionId) {
    console.error(`Unknown region: ${regionArg}`);
    console.error('Valid regions: ' + REGION_IDS.join(', '));
    process.exit(1);
  }
  const analysis = analyzeRegion(regionId);
  printRegionReport(analysis);
} else {
  console.log('Usage:');
  console.log('  node src/tools/region-analyzer.js --region <name>');
  console.log('  node src/tools/region-analyzer.js --all');
  console.log('  node src/tools/region-analyzer.js --compare');
  console.log('');
  console.log('Regions: ' + REGION_IDS.join(', '));
}
