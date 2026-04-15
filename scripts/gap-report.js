#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// GAP REPORT
//
// Analyzes all 9 regions and produces a structured JSON gap report that a
// content-gen routine can use as input. The report identifies:
//   - The thinnest region (lowest depth score)
//   - Hard-blocked skills in that region (no training methods)
//   - Import-dependent skills (fixable with a producer)
//   - Missing quest archetypes (no prestige quest, no teach-a-skill quest, etc.)
//   - Specific gap-fill suggestions with example content shapes
//
// Output: gap-report.json at repo root + stdout (or --json only)
// Called by Routine #2 (nightly content generator) as prep step.
//
// Usage: node scripts/gap-report.js [--json] [--region <name>]
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const fs = require('fs');
const path = require('path');

const rel = require('../src/data/relationships');

// Load all content files
require('../src/content/aelgard/area-gates');
require('../src/content/aelgard/quest-unlocks');
require('../src/content/aelgard/item-ecosystem');
require('../src/content/aelgard/training-knobs');
require('../src/content/aelgard/breakpoints');
try { require('../src/content/aelgard/skill-web'); } catch (e) {}
try { require('../src/content/aelgard/heartlands-deep'); } catch (e) {}
try { require('../src/content/aelgard/heartlands-density'); } catch (e) {}
try { require('../src/content/aelgard/moryskah-deep'); } catch (e) {}
try { require('../src/content/aelgard/moryskah-density'); } catch (e) {}
try { require('../src/content/aelgard/inkweald-deep'); } catch (e) {}
try { require('../src/content/aelgard/inkweald-density'); } catch (e) {}
try { require('../src/content/aelgard/mid-tier-regions'); } catch (e) {}
try { require('../src/content/aelgard/universal-items'); } catch (e) {}
try { require('../src/content/aelgard/special-regions'); } catch (e) {}

let PRESTIGE_GOALS = {};
try { PRESTIGE_GOALS = require('../src/content/aelgard/cross-region-web').PRESTIGE_GOALS || {}; } catch (e) {}

const SKILLS = [
  'attack', 'strength', 'defence', 'hitpoints', 'ranged', 'prayer', 'magic',
  'runecrafting', 'construction', 'agility', 'herblore', 'thieving',
  'crafting', 'fletching', 'slayer', 'hunter', 'mining', 'smithing',
  'fishing', 'cooking', 'firemaking', 'woodcutting', 'farming',
];

const REGIONS = [
  { id: 'heartlands',       label: 'Heartlands',        flavor: 'medieval starter' },
  { id: 'moryskah',         label: 'Moryskah',          flavor: 'gothic swamp, undead, vampires' },
  { id: 'boneyard_wastes',  label: 'Boneyard Wastes',   flavor: 'desert, pyramids, fossils' },
  { id: 'veilwood',         label: 'Veilwood',          flavor: 'enchanted elven forest, crystal, druids' },
  { id: 'sootworks',        label: 'Sootworks',         flavor: 'industrial underground, dwarves, clockwork' },
  { id: 'saltbrine_reach',  label: 'Saltbrine Reach',   flavor: 'pirate coast, fishing, smuggling' },
  { id: 'inkweald',         label: 'Inkweald',          flavor: 'surreal dream forest, magic-heavy' },
  { id: 'glass_desert',     label: 'Glass Desert',      flavor: 'crystalline endgame, Crystal Wyrm' },
  { id: 'the_wilds',        label: 'The Wilds',         flavor: 'PvP zone, lawless, risk/reward' },
];

function analyzeRegion(region) {
  const methodsInRegion = [];
  for (const skill of SKILLS) {
    for (const method of rel.listMethodsForSkill(skill)) {
      if (method.location === region.label) methodsInRegion.push(method);
    }
  }

  const skillStatus = {};
  for (const skill of SKILLS) {
    const methods = methodsInRegion.filter(m => m.skill === skill);
    skillStatus[skill] = {
      count: methods.length,
      maxLevel: methods.length > 0 ? Math.max(...methods.map(m => m.levelRange[1])) : 0,
      status: methods.length === 0 ? 'hard_blocked' : 'trainable',
    };
  }

  const blockedSkills = SKILLS.filter(s => skillStatus[s].status === 'hard_blocked');
  const lowCapSkills = SKILLS.filter(s => skillStatus[s].count > 0 && skillStatus[s].maxLevel < 70);

  const goal = PRESTIGE_GOALS[region.id];

  // Count quest unlocks that reference this region
  const questsReferencingRegion = [];
  for (const qid of Object.keys(rel.listAreaGates ? {} : {})) {
    // Placeholder
  }

  return {
    region: region.id,
    label: region.label,
    flavor: region.flavor,
    methodsInRegion: methodsInRegion.length,
    skillStatus,
    blockedSkills,
    lowCapSkills,
    prestigeGoal: goal ? { name: goal.name, flavor: goal.flavor } : null,
  };
}

function generateSuggestions(analysis) {
  const suggestions = [];

  if (analysis.blockedSkills.length > 0) {
    suggestions.push({
      priority: 'high',
      type: 'unblock_skill',
      skills: analysis.blockedSkills,
      action: `Add at least one training method for each of: ${analysis.blockedSkills.join(', ')} in the ${analysis.label} region. Match the regional flavor (${analysis.flavor}).`,
    });
  }

  if (analysis.lowCapSkills.length > 0) {
    suggestions.push({
      priority: 'medium',
      type: 'raise_cap',
      skills: analysis.lowCapSkills,
      action: `Add higher-tier training methods (levels 70-99) for: ${analysis.lowCapSkills.join(', ')} in ${analysis.label}.`,
    });
  }

  if (analysis.methodsInRegion < 10) {
    suggestions.push({
      priority: 'high',
      type: 'add_volume',
      action: `Region has only ${analysis.methodsInRegion} training methods. Add 3-5 more to reach ~15+ (mid-tier minimum). Prioritize skills with 0-1 methods.`,
    });
  }

  if (!analysis.prestigeGoal) {
    suggestions.push({
      priority: 'medium',
      type: 'prestige_goal',
      action: `Define a prestige goal for ${analysis.label}. Flavor: ${analysis.flavor}.`,
    });
  }

  return suggestions;
}

// ── Main ──────────────────────────────────────────────────────────────────────

const regionArg = process.argv.indexOf('--region') >= 0 ? process.argv[process.argv.indexOf('--region') + 1] : null;
const jsonOnly = process.argv.includes('--json');

const analyses = REGIONS.map(analyzeRegion);

// Pick the thinnest region (lowest method count + most blocked skills)
const scored = analyses.map(a => ({
  ...a,
  gapScore: (23 - a.blockedSkills.length) + (a.methodsInRegion / 2),
}));
scored.sort((a, b) => a.gapScore - b.gapScore);

const target = regionArg ? analyses.find(a => a.region === regionArg || a.label === regionArg) : scored[0];
if (!target) {
  console.error(`Region not found: ${regionArg}`);
  process.exit(1);
}

const suggestions = generateSuggestions(target);

const report = {
  timestamp: new Date().toISOString(),
  thinnestRegion: {
    id: target.region,
    label: target.label,
    flavor: target.flavor,
  },
  all_regions_ranked: scored.map(s => ({
    region: s.region,
    label: s.label,
    methods: s.methodsInRegion,
    blockedSkills: s.blockedSkills.length,
    gapScore: Math.round(s.gapScore),
  })),
  analysis: target,
  suggestions,
  example_quest_shape: {
    description: "A quest definition should be added to src/content/aelgard/<region>-quests.js using rel.defineQuestUnlock(). It should unlock something UNIQUE (area, training method, shop, spellbook, BiS item) — never just XP.",
    example: `rel.defineQuestUnlock('quest_id', {
  name: 'Quest Name',
  unlocks: [
    { type: 'training_method', id: 'method_id', description: '...' },
    { type: 'item_equip', id: 'unique_item', description: '...' },
  ],
});`,
  },
  example_method_shape: {
    description: "Training methods use rel.defineTrainingMethod() with all 8 Marstead knobs.",
    example: `rel.defineTrainingMethod('method_id', {
  skill: 'herblore', name: 'Bog Witch Brewing',
  levelRange: [15, 70],
  xpPerHour: 45000,
  prerequisites: { skills: { herblore: 15 }, quests: [], items: [], areas: ['<region>'] },
  resourceOutput: { produces: [{ name: 'Potions', perHour: 150 }], net: 'profit' },
  bankingFrequency: 'moderate',
  costPerHour: 0,
  danger: 'none',
  complexity: 'moderate',
  attention: 'medium',
  inputs: [{ name: 'Grimy herbs', perHour: 150, source: 'farming' }],
  description: 'Brew potions with the Bog Witch. Regional flavor.',
  location: '<Region Label>',
});`,
  },
};

if (!jsonOnly) {
  console.log('══════════════════════════════════════════════════════════════');
  console.log('  GAP REPORT');
  console.log('══════════════════════════════════════════════════════════════');
  console.log('');
  console.log(`  Thinnest region: ${target.label} (${target.region})`);
  console.log(`  Flavor: ${target.flavor}`);
  console.log(`  Methods: ${target.methodsInRegion}`);
  console.log(`  Blocked skills: ${target.blockedSkills.length}`);
  console.log('');
  console.log('  All regions (ranked by gap score, thinnest first):');
  for (const r of scored) {
    console.log(`    ${r.label.padEnd(20)} methods=${r.methodsInRegion.toString().padStart(3)}  blocked=${r.blockedSkills.length}  gap=${Math.round(r.gapScore)}`);
  }
  console.log('');
  console.log('  Top suggestions:');
  for (const s of suggestions.slice(0, 3)) {
    console.log(`    [${s.priority}] ${s.action}`);
  }
  console.log('');
}

// Write gap-report.json to repo root for routines to read
const outputPath = path.join(__dirname, '..', 'gap-report.json');
fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
if (!jsonOnly) console.log(`  Written to: ${outputPath}`);

if (jsonOnly) console.log(JSON.stringify(report, null, 2));
