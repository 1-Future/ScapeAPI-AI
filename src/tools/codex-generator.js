#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// CODEX GENERATOR
//
// Generates a browsable static Codex from the relationship registry.
// Output: public/codex/index.html + per-entity pages.
//
// The Codex is Aelgard's wiki — every quest, item, region, breakpoint,
// training method, and recipe, cross-referenced so you can follow the web.
//
// "The Codex is the primary human interface" — v1 plan
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const fs = require('fs');
const path = require('path');

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
try { require('../content/aelgard/mid-tier-regions'); } catch (e) {}
try { require('../content/aelgard/universal-items'); } catch (e) {}
try { require('../content/aelgard/special-regions'); } catch (e) {}
try { require('../content/aelgard/minigames'); } catch (e) {}
try { require('../content/aelgard/minigames-mega'); } catch (e) {}
let PRESTIGE_GOALS = {};
try { PRESTIGE_GOALS = require('../content/aelgard/cross-region-web').PRESTIGE_GOALS || {}; } catch (e) {}
let quirky = null;
try { quirky = require('../content/aelgard/quirky-interactions'); } catch (e) {}

// ── Output directory ──────────────────────────────────────────────────────────
const OUT_DIR = path.join(__dirname, '..', '..', 'public', 'codex');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const SKILLS = [
  'attack', 'strength', 'defence', 'hitpoints', 'ranged', 'prayer', 'magic',
  'runecrafting', 'construction', 'agility', 'herblore', 'thieving',
  'crafting', 'fletching', 'slayer', 'hunter', 'mining', 'smithing',
  'fishing', 'cooking', 'firemaking', 'woodcutting', 'farming',
];

// ── Shared CSS (OSRS parchment style, sacred per user prefs) ──────────────────
const CSS = `
<style>
  body {
    font-family: ui-monospace, 'Cascadia Code', 'Consolas', monospace;
    background: #3e3529;
    color: #e8dcc0;
    margin: 0;
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
  }
  .parchment {
    background: #e8dcc0;
    color: #2c1810;
    padding: 30px 40px;
    border: 3px solid #8b6f47;
    border-radius: 4px;
    box-shadow: 0 0 20px rgba(0,0,0,0.5);
    margin: 20px 0;
  }
  h1 {
    color: #7a1f1a;
    border-bottom: 2px solid #8b6f47;
    padding-bottom: 10px;
  }
  h2 { color: #5a3a1a; margin-top: 30px; }
  h3 { color: #6b4423; }
  a { color: #7a1f1a; text-decoration: none; border-bottom: 1px dotted #7a1f1a; }
  a:hover { background: #d4c49c; }
  nav { margin-bottom: 20px; }
  nav a { margin-right: 15px; font-weight: bold; }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 15px 0;
  }
  th, td {
    text-align: left;
    padding: 6px 10px;
    border-bottom: 1px solid #c4a970;
  }
  th { background: #d4c49c; color: #2c1810; }
  tr:hover { background: #d4c49c; }
  .tag {
    display: inline-block;
    padding: 2px 8px;
    margin: 2px;
    border-radius: 3px;
    font-size: 11px;
    font-weight: bold;
  }
  .tag-region { background: #4a6b8a; color: #fff; }
  .tag-skill  { background: #5a7f4a; color: #fff; }
  .tag-trans  { background: #8a1f1a; color: #fff; }
  .tag-major  { background: #a86a2a; color: #fff; }
  .tag-minor  { background: #6a6a6a; color: #fff; }
  .tag-afk    { background: #3a5a2a; color: #fff; }
  .tag-low    { background: #4a7a3a; color: #fff; }
  .tag-medium { background: #8a7a2a; color: #fff; }
  .tag-high   { background: #a85a2a; color: #fff; }
  .tag-maximum{ background: #8a1f1a; color: #fff; }
  .tag-obscure{ background: #6a4a2a; color: #fff; font-style: italic; }
  .stat-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    margin: 15px 0;
  }
  .stat-cell {
    background: #d4c49c;
    padding: 10px;
    border-radius: 3px;
    text-align: center;
  }
  .stat-cell .value {
    font-size: 24px;
    font-weight: bold;
    color: #7a1f1a;
  }
  .stat-cell .label {
    font-size: 11px;
    color: #5a3a1a;
    text-transform: uppercase;
  }
  .description {
    font-style: italic;
    color: #5a3a1a;
    margin: 10px 0;
    padding: 10px;
    background: #d4c49c;
    border-left: 3px solid #8b6f47;
  }
  ul.loose li { margin-bottom: 8px; }
  details {
    margin: 10px 0;
    padding: 10px;
    background: #d4c49c;
    border-radius: 3px;
  }
  summary { cursor: pointer; font-weight: bold; }
</style>
`;

function page(title, body) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${title} — Aelgard Codex</title>${CSS}</head>
<body>
<nav>
  <a href="index.html">Home</a>
  <a href="regions.html">Regions</a>
  <a href="skills.html">Skills</a>
  <a href="quests.html">Quests</a>
  <a href="breakpoints.html">Breakpoints</a>
  <a href="items.html">Items</a>
</nav>
<div class="parchment">
${body}
</div>
</body></html>`;
}

function slug(s) { return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ══════════════════════════════════════════════════════════════════════════════
// INDEX PAGE
// ══════════════════════════════════════════════════════════════════════════════

function writeIndex() {
  const stats = rel.stats();
  const areaGates = rel.listAreaGates();
  const regionCount = new Set(areaGates.map(([, g]) => g.region)).size;
  const methodCount = SKILLS.reduce((n, s) => n + rel.listMethodsForSkill(s).length, 0);

  const body = `
<h1>The Aelgard Codex</h1>
<div class="description">
  The primary human interface to the game. Every quest, item, region, breakpoint,
  training method, and recipe — cross-referenced.
</div>

<div class="stat-grid">
  <div class="stat-cell"><div class="value">${regionCount}</div><div class="label">Regions</div></div>
  <div class="stat-cell"><div class="value">${stats.questUnlocks}</div><div class="label">Quests</div></div>
  <div class="stat-cell"><div class="value">${methodCount}</div><div class="label">Training Methods</div></div>
  <div class="stat-cell"><div class="value">${stats.breakpoints}</div><div class="label">Breakpoints</div></div>
  <div class="stat-cell"><div class="value">${stats.combinations}</div><div class="label">Recipes</div></div>
  <div class="stat-cell"><div class="value">${stats.itemSources}</div><div class="label">Item Sources</div></div>
  <div class="stat-cell"><div class="value">${stats.itemUses}</div><div class="label">Item Uses</div></div>
  <div class="stat-cell"><div class="value">${stats.degradableItems}</div><div class="label">Degradable Items</div></div>
</div>

<h2>Browse</h2>
<ul class="loose">
  <li><a href="regions.html">Regions</a> — the 8 lands of Aelgard plus The Wilds</li>
  <li><a href="skills.html">Skills</a> — 23 skills with all training methods</li>
  <li><a href="quests.html">Quests</a> — every quest with unique unlocks</li>
  <li><a href="breakpoints.html">Breakpoints</a> — the "this changes everything" moments</li>
  <li><a href="items.html">Items</a> — sources, uses, degradation, reagents</li>
</ul>

<h2>About the Codex</h2>
<p>
  Aelgard is structured as a Metroidvania. Every skill gates areas. Every quest
  unlocks something unique. Every item has multiple uses. Training methods trade
  off across 8 balance knobs: XP/hr, prerequisites, resource output, banking
  frequency, cost, danger, complexity, and attention.
</p>
<p>
  Use the Codex to plan your route, discover obscure connections, and understand
  what the next breakpoint unlocks before you grind toward it.
</p>
`;
  fs.writeFileSync(path.join(OUT_DIR, 'index.html'), page('Home', body));
}

// ══════════════════════════════════════════════════════════════════════════════
// REGIONS PAGES
// ══════════════════════════════════════════════════════════════════════════════

function writeRegions() {
  const REGIONS = [
    { id: 'heartlands',       label: 'Heartlands',        desc: 'Medieval starter kingdom. Safe, rich with guilds, farms, the central hub.' },
    { id: 'moryskah',         label: 'Moryskah',          desc: 'Gothic swamp. Vampires, werewolves, Barrows, blood rites.' },
    { id: 'boneyard_wastes',  label: 'Boneyard Wastes',   desc: 'Post-apocalyptic desert. Pyramids, fossils, mummies, scarabs.' },
    { id: 'veilwood',         label: 'Veilwood',          desc: 'Enchanted elven forest. Crystal trees, druids, moonpools.' },
    { id: 'sootworks',        label: 'Sootworks',         desc: 'Clockwork industrial underground. Dwarven forges, steam vents.' },
    { id: 'saltbrine_reach',  label: 'Saltbrine Reach',   desc: 'Pirate coast. Ships, smugglers, deep-sea fishing, pearl beds.' },
    { id: 'inkweald',         label: 'Inkweald',          desc: 'Surreal dream forest. Reality bends. Magic-heavy, weird-unique.' },
    { id: 'glass_desert',     label: 'Glass Desert',      desc: 'Crystalline endgame wasteland. Crystal Wyrm, Inferno, dragons.' },
    { id: 'the_wilds',        label: 'The Wilds',         desc: 'Lawless PvP zone. Superior rewards, constant danger.' },
  ];

  // Main regions index
  let indexBody = `<h1>Regions of Aelgard</h1>
<div class="description">Nine regions, each with its own identity, content, and prestige goal.</div>
<table>
  <tr><th>Region</th><th>Description</th><th>Prestige Goal</th></tr>`;

  for (const r of REGIONS) {
    const goal = PRESTIGE_GOALS[r.id];
    const goalLink = goal ? `<strong>${escapeHtml(goal.name)}</strong><br><small>${escapeHtml(goal.flavor || '')}</small>` : '<em>TBD</em>';
    indexBody += `
  <tr>
    <td><a href="region-${r.id}.html"><strong>${escapeHtml(r.label)}</strong></a></td>
    <td>${escapeHtml(r.desc)}</td>
    <td>${goalLink}</td>
  </tr>`;
  }
  indexBody += '</table>';
  fs.writeFileSync(path.join(OUT_DIR, 'regions.html'), page('Regions', indexBody));

  // Per-region page
  for (const r of REGIONS) {
    const methods = [];
    for (const s of SKILLS) {
      for (const m of rel.listMethodsForSkill(s)) {
        if (m.location === r.label) methods.push(m);
      }
    }
    methods.sort((a, b) => a.skill.localeCompare(b.skill));

    const goal = PRESTIGE_GOALS[r.id];
    const quirkies = quirky ? quirky.listQuirkyForRegion(r.id) : [];
    const areaGatesInRegion = rel.listAreaGates().filter(([, g]) => g.region === r.id);

    let body = `<h1>${escapeHtml(r.label)}</h1>
<div class="description">${escapeHtml(r.desc)}</div>

<div class="stat-grid">
  <div class="stat-cell"><div class="value">${methods.length}</div><div class="label">Training Methods</div></div>
  <div class="stat-cell"><div class="value">${areaGatesInRegion.length}</div><div class="label">Sub-areas</div></div>
  <div class="stat-cell"><div class="value">${quirkies.length}</div><div class="label">Quirky Interactions</div></div>
  <div class="stat-cell"><div class="value">${goal ? '1' : '0'}</div><div class="label">Prestige Goals</div></div>
</div>`;

    if (goal) {
      body += `
<h2>Prestige Goal: ${escapeHtml(goal.name)}</h2>
<div class="description">${escapeHtml(goal.description || '')}</div>
<p><strong>Required skills:</strong> ${Object.entries(goal.requirements?.skills || {}).map(([s, l]) => `<span class="tag tag-skill">${s} ${l}</span>`).join(' ')}</p>
${goal.bosses ? `<p><strong>Bosses:</strong> ${goal.bosses.map(b => escapeHtml(b)).join(', ')}</p>` : ''}
${goal.uniqueItems ? `<p><strong>Unique rewards:</strong> ${goal.uniqueItems.map(i => escapeHtml(i)).join(', ')}</p>` : ''}
`;
    }

    if (areaGatesInRegion.length > 0) {
      body += '<h2>Sub-areas</h2><ul class="loose">';
      for (const [aid, g] of areaGatesInRegion) {
        body += `<li><strong>${escapeHtml(g.name)}</strong>`;
        if (g.description) body += ` — ${escapeHtml(g.description)}`;
        const reqs = [];
        for (const [s, l] of Object.entries(g.requires.skills || {})) reqs.push(`${s} ${l}`);
        for (const q of (g.requires.quests || [])) reqs.push(`quest: ${q}`);
        if (reqs.length > 0) body += ` <small>[requires: ${reqs.join(', ')}]</small>`;
        body += '</li>';
      }
      body += '</ul>';
    }

    if (methods.length > 0) {
      body += `<h2>Training Methods (${methods.length})</h2>
<table>
  <tr><th>Skill</th><th>Method</th><th>Levels</th><th>XP/hr</th><th>Attention</th><th>Danger</th><th>Cost/hr</th></tr>`;
      for (const m of methods) {
        const xp = Array.isArray(m.xpPerHour) ? `${m.xpPerHour[0]}-${m.xpPerHour[1]}` : m.xpPerHour;
        body += `
  <tr>
    <td><span class="tag tag-skill">${m.skill}</span></td>
    <td><strong>${escapeHtml(m.name)}</strong><br><small>${escapeHtml(m.description || '')}</small></td>
    <td>${m.levelRange[0]}-${m.levelRange[1]}</td>
    <td>${xp.toLocaleString()}</td>
    <td><span class="tag tag-${m.attention}">${m.attention}</span></td>
    <td>${m.danger}</td>
    <td>${m.costPerHour < 0 ? `<strong>+${Math.abs(m.costPerHour)}</strong>` : m.costPerHour}</td>
  </tr>`;
      }
      body += '</table>';
    }

    if (quirkies.length > 0) {
      body += `<h2>Quirky Interactions (${quirkies.length})</h2>
<div class="description">Ambient world objects that grant tiny XP. Discoverable, flavorful, mathematically terrible — but sometimes a lifeline.</div>
<ul class="loose">`;
      for (const q of quirkies) {
        body += `<li><strong>${escapeHtml(q.name)}</strong> [${q.skill}] — ${q.xpPerClick} xp/click. <em>${escapeHtml(q.flavor || '')}</em></li>`;
      }
      body += '</ul>';
    }

    fs.writeFileSync(path.join(OUT_DIR, `region-${r.id}.html`), page(r.label, body));
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// SKILLS PAGES
// ══════════════════════════════════════════════════════════════════════════════

function writeSkills() {
  let indexBody = '<h1>Skills</h1><div class="description">23 skills. Every one required for full progression.</div><table><tr><th>Skill</th><th>Methods</th><th>Breakpoints</th></tr>';
  for (const s of SKILLS) {
    const methods = rel.listMethodsForSkill(s);
    const bps = rel.getBreakpointsForSkill(s);
    indexBody += `<tr><td><a href="skill-${s}.html"><strong>${s}</strong></a></td><td>${methods.length}</td><td>${bps.length}</td></tr>`;
  }
  indexBody += '</table>';
  fs.writeFileSync(path.join(OUT_DIR, 'skills.html'), page('Skills', indexBody));

  for (const s of SKILLS) {
    const methods = rel.listMethodsForSkill(s).sort((a, b) => a.levelRange[0] - b.levelRange[0]);
    const bps = rel.getBreakpointsForSkill(s).sort((a, b) => a.trigger.level - b.trigger.level);

    let body = `<h1>${s[0].toUpperCase() + s.slice(1)}</h1>
<div class="description">${methods.length} training methods. ${bps.length} breakpoints.</div>

<h2>Breakpoints</h2>
<ul class="loose">`;
    for (const bp of bps) {
      const tag = `tag-${bp.importance || 'minor'}`;
      body += `<li><span class="tag ${tag}">level ${bp.trigger.level}</span> <strong>${escapeHtml(bp.description || '')}</strong>`;
      if (bp.unlocks && bp.unlocks.length > 0) {
        body += `<br><small>unlocks: ${bp.unlocks.map(u => escapeHtml(u.description || u.id || '')).join(' · ')}</small>`;
      }
      body += '</li>';
    }
    body += '</ul>';

    body += `<h2>Training Methods</h2><table>
<tr><th>Method</th><th>Levels</th><th>XP/hr</th><th>Location</th><th>Attention</th><th>Danger</th><th>Cost</th></tr>`;
    for (const m of methods) {
      const xp = Array.isArray(m.xpPerHour) ? `${m.xpPerHour[0]}-${m.xpPerHour[1]}` : m.xpPerHour;
      body += `<tr>
  <td><strong>${escapeHtml(m.name)}</strong><br><small>${escapeHtml(m.description || '')}</small></td>
  <td>${m.levelRange[0]}-${m.levelRange[1]}</td>
  <td>${xp.toLocaleString()}</td>
  <td><span class="tag tag-region">${escapeHtml(m.location || '')}</span></td>
  <td><span class="tag tag-${m.attention}">${m.attention}</span></td>
  <td>${m.danger}</td>
  <td>${m.costPerHour < 0 ? `<strong>+${Math.abs(m.costPerHour)}</strong>` : m.costPerHour}</td>
</tr>`;
    }
    body += '</table>';

    fs.writeFileSync(path.join(OUT_DIR, `skill-${s}.html`), page(s, body));
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// QUESTS PAGE
// ══════════════════════════════════════════════════════════════════════════════

function writeQuests() {
  // There's no direct enumeration of quests, walk the registry by looping known IDs
  // We can get all quest IDs from the questUnlocks map via reflection on the API
  const quests = [];
  for (let i = 0; i < 500; i++) {
    // Not enumerable — use known ids through the relationship layer instead
  }
  // Workaround: enumerate from the content files by iterating defineQuestUnlock targets
  // Since rel doesn't expose listQuestUnlocks, we'll just list each quest from a hardcoded set
  const knownQuestIds = [
    'the_runaway_golem', 'the_tide_pool_collector', 'lamplighters_apprentice',
    'the_apprentice_trapper', 'the_stolen_runes', 'the_fencepost_problem',
    'the_bog_witchs_errand', 'target_practice', 'the_boneyard_compass',
    'the_slayers_first_mark', 'the_counterfeit_ring', 'sand_and_secrets',
    'the_green_thumb', 'foundations_of_the_fallen', 'the_bog_witchs_bargain',
    'pirate_king', 'slayers_gauntlet', 'sootworks_rising', 'into_the_wilds',
    'the_inkweald_door', 'desert_treasure', 'lunar_diplomacy', 'echoes_of_the_deep',
    'dragon_slayer_aelgard', 'blood_rites', 'the_last_dragon_p3',
    'sins_of_malachar', 'monkey_business', 'the_last_light',
    'song_of_the_elves_aelgard', 'rfd_finale', 'the_werewolfs_dilemma',
    'drifting_market_charter', 'fight_caves', 'infernal_challenge',
    'barrows_brothers', 'herb_run_mastery', 'wilderness_sword',
    'the_blacksmiths_apprentice', 'the_missing_deeds', 'the_grain_rot',
    'the_drowned_miller', 'the_guild_trials', 'the_royal_falconer',
    'the_paper_forge', 'the_culinaromancers_curse', 'ghosts_ahoy',
    'the_haunted_mine', 'the_shades_of_mortton', 'the_lycanthropy_cure',
    'the_darkness_of_hallowvale', 'the_bog_witchs_legacy', 'the_grave_robber',
    'barrows_brothers_legend', 'pharaohs_reckoning', 'the_desert_wanderer',
    'the_fossil_archaeologist', 'the_ancient_tree_ritual', 'the_crystal_apprentice',
    'the_dwarven_pact', 'beneath_the_foundry', 'the_krakens_challenge',
    'the_ghost_ship', 'waking_the_dreaming_one', 'the_paradox_philosopher',
    'slaying_the_crystal_wyrm', 'the_sun_priest', 'coronation_of_the_revenant_king',
    'the_rogue_chef',
  ];

  for (const qid of knownQuestIds) {
    const u = rel.getQuestUnlocks(qid);
    if (u) quests.push({ id: qid, data: u });
  }

  let body = `<h1>Quests of Aelgard</h1>
<div class="description">${quests.length} quests. Every quest unlocks something unique — an area, training method, shop, spellbook, or prestige item.</div>
<table>
  <tr><th>Quest</th><th>Unlocks</th></tr>`;
  for (const q of quests) {
    const unlocks = (q.data.unlocks || []).map(u => `<span class="tag tag-${u.type.includes('area') ? 'region' : u.type === 'boss' ? 'trans' : 'minor'}">${u.type}</span> ${escapeHtml(u.description || u.id || '')}`).join('<br>');
    body += `<tr>
  <td><strong>${escapeHtml(q.data.name)}</strong><br><small>${escapeHtml(q.id)}</small></td>
  <td>${unlocks}</td>
</tr>`;
  }
  body += '</table>';
  fs.writeFileSync(path.join(OUT_DIR, 'quests.html'), page('Quests', body));
}

// ══════════════════════════════════════════════════════════════════════════════
// BREAKPOINTS PAGE
// ══════════════════════════════════════════════════════════════════════════════

function writeBreakpoints() {
  const allBps = [];
  for (const s of SKILLS) {
    for (const bp of rel.getBreakpointsForSkill(s)) allBps.push(bp);
  }

  const transformative = rel.getTransformativeBreakpoints();

  let body = `<h1>Breakpoints</h1>
<div class="description">The "this changes everything" moments. Every significant threshold that permanently changes how you play.</div>

<h2>Transformative (${transformative.length})</h2>
<div class="description">The biggest moments. You remember these forever.</div>
<ul class="loose">`;
  for (const bp of transformative) {
    const trigger = bp.type === 'skill_level' ? `${bp.trigger.skill} ${bp.trigger.level}` :
                    bp.type === 'quest_complete' ? `quest: ${bp.trigger.quest}` :
                    bp.type === 'item_acquired' ? `item: ${bp.trigger.item}` : '?';
    body += `<li><span class="tag tag-trans">${escapeHtml(trigger)}</span> ${escapeHtml(bp.description || '')}</li>`;
  }
  body += '</ul>';

  // All by skill
  body += '<h2>By Skill</h2>';
  for (const s of SKILLS) {
    const bps = rel.getBreakpointsForSkill(s).sort((a, b) => a.trigger.level - b.trigger.level);
    if (bps.length === 0) continue;
    body += `<h3><a href="skill-${s}.html">${s}</a> (${bps.length})</h3><ul class="loose">`;
    for (const bp of bps) {
      const tag = `tag-${bp.importance || 'minor'}`;
      body += `<li><span class="tag ${tag}">level ${bp.trigger.level}</span> ${escapeHtml(bp.description || '')}</li>`;
    }
    body += '</ul>';
  }

  fs.writeFileSync(path.join(OUT_DIR, 'breakpoints.html'), page('Breakpoints', body));
}

// ══════════════════════════════════════════════════════════════════════════════
// ITEMS PAGE
// ══════════════════════════════════════════════════════════════════════════════

function writeItems() {
  // Collect all items with sources or uses
  const items = [];
  for (let id = 1; id <= 99999; id++) {
    const sources = rel.getItemSources(id);
    const uses = rel.getItemUses(id);
    if (sources.length > 0 || uses.length > 0) {
      items.push({ id, sources, uses });
    }
  }

  // Count obscure connections
  let obscureCount = 0;
  const byRegion = {};
  for (const i of items) {
    for (const s of i.sources) {
      if (s.obscure) obscureCount++;
      if (s.region) byRegion[s.region] = (byRegion[s.region] || 0) + 1;
    }
  }

  let body = `<h1>Item Economy</h1>
<div class="description">${items.length} items with registered sources or uses. ${obscureCount} obscure connections (the "Temple Trekking gives bowstrings" discoveries).</div>

<div class="stat-grid">
  <div class="stat-cell"><div class="value">${items.length}</div><div class="label">Indexed Items</div></div>
  <div class="stat-cell"><div class="value">${obscureCount}</div><div class="label">Obscure Connections</div></div>
  <div class="stat-cell"><div class="value">${rel.stats().combinations}</div><div class="label">Recipes</div></div>
  <div class="stat-cell"><div class="value">${rel.stats().degradableItems}</div><div class="label">Degradable</div></div>
</div>

<h2>Items by Region</h2>
<table><tr><th>Region</th><th>Native Items</th></tr>`;
  for (const [r, n] of Object.entries(byRegion).sort((a, b) => b[1] - a[1])) {
    body += `<tr><td>${escapeHtml(r)}</td><td>${n}</td></tr>`;
  }
  body += '</table>';

  // Obscure connections gallery
  body += '<h2>Obscure Connections</h2><div class="description">Unexpected supply chains that reward discovery.</div><ul class="loose">';
  let shown = 0;
  for (const i of items) {
    for (const s of i.sources) {
      if (s.obscure && shown < 40) {
        body += `<li><strong>${escapeHtml(s.sourceName || '?')}</strong> (${s.region || 'anywhere'}): ${escapeHtml(s.details || '')}</li>`;
        shown++;
      }
    }
  }
  body += '</ul>';
  if (shown < obscureCount) body += `<p><em>... and ${obscureCount - shown} more.</em></p>`;

  fs.writeFileSync(path.join(OUT_DIR, 'items.html'), page('Items', body));
}

// ══════════════════════════════════════════════════════════════════════════════
// GENERATE EVERYTHING
// ══════════════════════════════════════════════════════════════════════════════

console.log(`Generating Codex in ${OUT_DIR}...`);
writeIndex();          console.log('  ✓ index.html');
writeRegions();        console.log('  ✓ regions.html + 9 region pages');
writeSkills();         console.log('  ✓ skills.html + 23 skill pages');
writeQuests();         console.log('  ✓ quests.html');
writeBreakpoints();    console.log('  ✓ breakpoints.html');
writeItems();          console.log('  ✓ items.html');

// Count files
const files = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.html'));
console.log(`\nGenerated ${files.length} HTML pages in ${OUT_DIR}`);
console.log(`Open ${OUT_DIR}/index.html to browse the Codex.`);
