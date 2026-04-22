// ══════════════════════════════════════════════════════════════════════════════
// scripts/build-intensity-catalog.js
//
// Builds data/intensity-catalog.json and data/intensity-catalog-report.md
// from the union of:
//   - src/engine/skills/ (23 manifests — actions become skill_method entries)
//   - data/methods/ (agent 1's detailed methods — if present)
//   - src/content/aelgard/monsters*.js (every mob(...) call)
//   - src/content/aelgard/bosses*.js (every boss(...) call)
//   - src/content/aelgard/raids-bosses-mega.js (raid boss definitions)
//   - src/content/aelgard/raids*.js (raid encounters)
//   - src/content/aelgard/minigames*.js (every minigame entry)
//   - src/content/aelgard/slayer-*.js (slayer tasks)
//
// Intensity taxonomy (from burn-v0.8 agent 4 spec):
//   1 pure AFK          6 prayer-flick combat / 3-tick skilling
//   2 light interaction 7 PvM with rotation
//   3 attentive skilling 8 prayer+swap PvM / high-stakes slayer
//   4 tick-locked skill 9 raid rotation / coordinated
//   5 active mid-intensity 10 Inferno / max-effort
//
// Every entry carries:
//   activity_id, activity_type, skill, intensity, base_xp_per_hour,
//   base_gp_per_hour, region, level_required, gating, notes, source_file
//
// Misery zone: any entry >30% below its intensity band's median output (xp/hr
// for skilling/slayer, gp/hr for bossing) is flagged.
//
// Content gap: any intensity band (1..10) with <5 entries.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const DATA = path.join(REPO_ROOT, 'data');
const AELGARD = path.join(REPO_ROOT, 'src', 'content', 'aelgard');
const SKILLS_DIR = path.join(REPO_ROOT, 'src', 'engine', 'skills');
const METHODS_DIR = path.join(DATA, 'methods');

// Normalise attention string into a base intensity. This is the floor — mechanics
// and combat rating bump it.
const ATTENTION_TO_INTENSITY = {
  Background: 1,
  Multitask: 2,
  Active: 4,
  'Max Focus': 6,
};

// Approximate base xp/hr scaling off manifest (xpPer / baseTimeMs). Real-world
// numbers come from data/methods/*.json when the detailed file exists; this is
// the fallback baseline.
function xpPerHourFromAction(action) {
  const xp = Number(action.xpPer || 0);
  const ms = Number(action.baseTimeMs || 0);
  if (!xp || !ms) return 0;
  return Math.round(xp * (3600000 / ms));
}

// Rough price ladder for produces strings. Doesn't need to be exact; the sim
// agent can revalue. Values chosen from src/data/items.js primary ores, logs,
// fish, runes.
const PRODUCE_GP = new Map(Object.entries({
  'Copper ore': 4, 'Tin ore': 4, 'Iron ore': 17, 'Coal': 45, 'Mithril ore': 162,
  'Adamantite ore': 400, 'Runite ore': 6400, 'Crystal shard': 300,
  'Soot-iron ore': 50,
  // Smithing bars: profit margin per bar (sale minus ore/coal cost). Raw sale
  // prices overflowed (runite 12800 * 1000/hr = 12.8M, double-counting sale).
  'Bronze bar': 2, 'Iron bar': 8, 'Steel bar': 18, 'Mithril bar': 40,
  'Adamantite bar': 120, 'Runite bar': 450, 'Soot-iron bar': 18,
  'Blade of Soot': 0,
  'Logs': 1, 'Oak logs': 10, 'Willow logs': 20, 'Maple logs': 40,
  'Yew logs': 160, 'Magic logs': 600, 'Redwood logs': 550,
  'Raw shrimps': 2, 'Raw trout': 20, 'Raw salmon': 40, 'Raw lobster': 150,
  'Raw swordfish': 200, 'Raw shark': 500, 'Raw anglerfish': 600,
  'Raw monkfish': 300, 'Raw dark crab': 1500,
  'Shrimps': 3, 'Trout': 25, 'Salmon': 50, 'Lobster': 175, 'Swordfish': 250,
  'Shark': 700, 'Anglerfish': 900, 'Dark crab': 2200, 'Cooked chicken': 4,
  'Air rune': 6, 'Mind rune': 4, 'Water rune': 5, 'Earth rune': 5,
  'Fire rune': 5, 'Body rune': 5, 'Cosmetic rune': 80,
  'Cosmic rune': 140, 'Chaos rune': 75, 'Nature rune': 520,
  'Law rune': 200, 'Death rune': 180, 'Blood rune': 260, 'Wrath rune': 540,
  // Fletching: profit margin per bow strung (string cost + log conversion).
  // Raw sale prices overflowed (yew 800 * 2000/hr = 1.6M, magic 1500 * 2000 = 3M).
  'Arrow shaft': 1, 'Shortbow': 4, 'Oak shortbow': 8, 'Willow longbow': 16,
  'Maple longbow': 30, 'Yew longbow': 90, 'Magic longbow': 180,
  'Redwood shield': 80,
  // Clean-herb "value" is profit margin per clean (sale price minus grimy cost
  // minus bank time). Raw sale price overflows (Clean ranarr @ 7500*6000 = 45M).
  // Cleaning itself is ~100k gp/hr AFK in OSRS; set margins to ~20 gp per ranarr.
  'Clean guam': 1, 'Clean marrentill': 1, 'Clean tarromin': 2,
  'Clean harralander': 4, 'Clean ranarr': 20,
  // Potion values are per-4-dose profit vs secondary+vial (not gross sale).
  // Prayer/SR potions canonically yield ~600-800k gp/hr in OSRS (2000 doses/hr * ~350 margin).
  'Attack potion(4)': 20, 'Strength potion(4)': 40, 'Defence potion(4)': 50,
  'Prayer potion(4)': 350, 'Saradomin brew(4)': 200,
  'Super restore(4)': 400, 'Anti-venom+(4)': 500,
  'Leather': 20, 'Leather body': 40,
  // Cut-gem values are profit per cut (sale price minus uncut cost). Raw sale
  // prices overflowed (dragonstone @ 12000*2000/hr = 24M gp/hr, double-counting
  // sale against reagent burn). In OSRS cut vs uncut spreads are ~50-200 gp.
  'Sapphire': 40, 'Emerald': 60, 'Ruby': 90, 'Diamond': 180,
  'Dragonstone': 320,
  // Jewellery values are *profit margin per unit made*, not sale price — crafting
  // burns reagents, so gp/hr must reflect profit, not gross sale. Raw sale prices
  // would overflow gp/hr (zenyte @ 2.5M * 1500/hr = 3.75B, the C13 bug).
  // These profit figures match data/methods/crafting.json: fury 220k/hr, zenyte
  // 520k/hr at realistic ~180 amulets/hr rate.
  'Amulet of fury (uncharged)': 400, 'Amulet of torture': 2900,
  'Ferret': 0, 'Crimson feather': 80, 'Golden feather': 120,
  'Spotted fur': 900, 'Dark kebbit fur': 1500, 'Kyatt fur': 2800,
  'Grenwall spikes': 140, 'Impling jar': 1200, 'Black salamander': 3200,
  // Farming "produces" fires once per seed but baseTimeMs treats it as
  // per-second; actual farm cycle is tens of minutes. Scale values to a realistic
  // 10-cycle/hr yield — raw sale price overflowed (torstol 8000 * 2000 = 16M).
  'Potato (9 harvested)': 2, 'Guam herb': 1, 'Marrentill herb': 1,
  'Onion': 1, 'Ranarr herb': 35, 'Willow tree': 0, 'Yew tree': 0,
  'Magic tree': 0, 'Torstol herb': 40,
  'Chair (room)': 0, 'Bookcase (study)': 0, 'Oak larder (kitchen)': 0,
  'Altar (chapel)': 0, 'Gilded altar': 0, 'Teleport throne': 0,
  'Dungeon (portal)': 0, 'Boss-room portal': 0,
  'Fire (Logs)': 0, 'Fire (Oak)': 0, 'Fire (Willow)': 0, 'Fire (Maple)': 0,
  'Fire (Yew)': 0, 'Fire (Magic)': 0, 'Storm log XP': 0, 'Redwood ash': 120,
  'Task': 0,
}));

// Upper cap to catch unit-price bugs. Any single-action gp/hr above this is
// almost certainly a *1000 or sale-price-vs-profit error. 500M is above every
// OSRS elite moneymaker (Corporeal Beast peak ~40M, Nex ~20M, TBow scroll rate
// never exceeds 100M/hr even with perfect rolls). See C13 (zenyte overflow).
const GP_PER_HOUR_SANITY_CAP = 500_000_000;

function gpPerHourForAction(action) {
  const produce = action.produces;
  if (!produce) return 0;
  const gp = PRODUCE_GP.get(produce);
  if (gp == null) return 0;
  const ms = Number(action.baseTimeMs || 0);
  if (!ms) return 0;
  const raw = Math.round(gp * (3600000 / ms));
  return Math.min(raw, GP_PER_HOUR_SANITY_CAP);
}

// ══════════════════════════════════════════════════════════════════════════════
// Source 1: skill manifests
// ══════════════════════════════════════════════════════════════════════════════

function collectSkillActions(catalog) {
  const manifest = require(path.join(SKILLS_DIR, 'index.js'));
  let count = 0;
  for (const id of manifest.SKILL_IDS) {
    const m = manifest.get(id);
    if (!m) continue;
    for (const a of (m.actions || [])) {
      const baseIntensity = ATTENTION_TO_INTENSITY[a.attention] || 3;
      // combat skills: nudge up from baseline because the xpPer in these is
      // 4 per swing (damage driven). The actual intensity is driven by the
      // creature, not the swing. But for now, treat as the manifest's level.
      let intensity = baseIntensity;
      // Wilds-region actions tend to be higher intensity due to PK risk.
      if (/wilds/i.test(a.region)) intensity = Math.max(intensity, 4);
      const regionKey = String(a.region || 'Heartlands').toLowerCase().replace(/\s+/g, '_');
      catalog.push({
        activity_id: `${id}_${slug(a.name)}`,
        activity_type: 'skill_method',
        skill: id,
        intensity,
        base_xp_per_hour: xpPerHourFromAction(a),
        base_gp_per_hour: gpPerHourForAction(a),
        region: regionKey,
        level_required: a.level,
        gating: { quests: [], items: [], areas: [] },
        notes: `${a.name} — attention ${a.attention}`,
        source_file: `src/engine/skills/${id}.js`,
      });
      count++;
    }
  }
  return count;
}

// ══════════════════════════════════════════════════════════════════════════════
// Source 2: agent 1's methods (if present)
// ══════════════════════════════════════════════════════════════════════════════

function collectMethodFiles(catalog) {
  if (!fs.existsSync(METHODS_DIR)) return 0;
  let count = 0;
  for (const fname of fs.readdirSync(METHODS_DIR)) {
    if (!fname.endsWith('.json')) continue;
    const full = path.join(METHODS_DIR, fname);
    let parsed;
    try { parsed = JSON.parse(fs.readFileSync(full, 'utf8')); }
    catch (e) { continue; }
    const skill = parsed.skill;
    for (const m of (parsed.methods || [])) {
      const gating = {
        quests: m.requires?.quests || [],
        items: m.requires?.items || [],
        areas: [],
      };
      catalog.push({
        activity_id: m.id,
        activity_type: 'skill_method',
        skill: skill || m.skill,
        intensity: Number(m.intensity) || 1,
        base_xp_per_hour: Number(m.xp_per_hour) || 0,
        base_gp_per_hour: Number(m.gp_per_hour) || 0,
        region: (m.location?.region || 'heartlands').toLowerCase(),
        level_required: Number(m.level_required) || 1,
        gating,
        notes: m.description || m.marstead_note || '',
        source_file: `data/methods/${fname}`,
      });
      count++;
    }
  }
  return count;
}

// ══════════════════════════════════════════════════════════════════════════════
// Source 3: parse mob() + boss() calls from aelgard js
// ══════════════════════════════════════════════════════════════════════════════

// Regex for mob/boss calls. Negative lookbehind ensures we don't match
// overrideBoss, function boss, etc. Single-line match of the id + body.
const MOB_RE = /(?<![a-zA-Z_.])mob\(\s*'([a-z0-9_]+)'\s*,\s*\{([^}]*)\}/g;
const BOSS_RE = /(?<![a-zA-Z_.])boss\(\s*'([a-z0-9_]+)'\s*,\s*\{([^}]*)\}/g;
const DEFINE_NPC_RE = /npcs\.defineNpc\(\s*'([a-z0-9_]+)'\s*,\s*\{([^}]*)\}/gi;
// monsters-mega.js format: mega({ id, name, level, hp, combat_style, max_hit, region, tags, ... })
const MEGA_RE = /(?<![a-zA-Z_.])mega\(\s*\{/g;

function parseMobBody(body) {
  const out = {};
  // name: 'X'
  const mName = body.match(/\bname:\s*(['"])([^'"]+?)\1/);
  if (mName) out.name = mName[2];
  // combat, maxHp, maxHit, attackSpeed, attackRange, size
  for (const k of ['combat', 'maxHp', 'maxHit', 'attackSpeed', 'attackRange', 'size']) {
    const m = body.match(new RegExp('\\b' + k + ':\\s*(\\d+)'));
    if (m) out[k] = Number(m[1]);
  }
  // attackStyle
  const mStyle = body.match(/attackStyle:\s*['"]([^'"]+)['"]/);
  if (mStyle) out.attackStyle = mStyle[1];
  // weakness
  const mWeak = body.match(/weakness:\s*['"]([^'"]+)['"]/);
  if (mWeak) out.weakness = mWeak[1];
  // tags: [...]
  const mTags = body.match(/tags:\s*\[([^\]]*)\]/);
  if (mTags) {
    out.tags = mTags[1].split(',').map(t => t.replace(/['"\s]/g, '')).filter(Boolean);
  } else {
    out.tags = [];
  }
  // aggressive
  out.aggressive = /aggressive:\s*true/.test(body);
  // poisonDamage
  const mPoison = body.match(/poisonDamage:\s*(\d+)/);
  if (mPoison) out.poisonDamage = Number(mPoison[1]);
  // resistance
  const mRes = body.match(/resistance:\s*['"]([^'"]+)['"]/);
  if (mRes) out.resistance = mRes[1];
  return out;
}

// Region inferred from filename (best-effort).
function regionFromFilename(fname) {
  const name = path.basename(fname, '.js');
  const map = {
    heartlands: 'heartlands', 'heartlands-deep': 'heartlands',
    'heartlands-density': 'heartlands', 'heartlands-tertiary': 'heartlands',
    'heartlands-easter-eggs': 'heartlands',
    sootworks: 'sootworks', 'sootworks-deep': 'sootworks',
    'sootworks-density': 'sootworks', 'sootworks-tertiary': 'sootworks',
    'sootworks-easter-eggs': 'sootworks',
    moryskah: 'moryskah', 'moryskah-deep': 'moryskah',
    'moryskah-density': 'moryskah', 'moryskah-tertiary': 'moryskah',
    'moryskah-easter-eggs': 'moryskah',
    'boneyard-wastes': 'boneyard', 'boneyard-deep': 'boneyard',
    'boneyard-density': 'boneyard',
    'glass-desert': 'glass_desert', 'glass-desert-deep': 'glass_desert',
    'glass-desert-density': 'glass_desert',
    saltbrine: 'saltbrine', 'saltbrine-deep': 'saltbrine',
    'saltbrine-density': 'saltbrine',
    inkweald: 'inkweald', 'inkweald-deep': 'inkweald',
    'inkweald-density': 'inkweald',
  };
  return map[name] || 'unknown';
}

// Determine intensity from combat stats + tags.
function intensityForMonster(m, fname) {
  const tags = m.tags || [];
  const isBoss = tags.includes('boss') || /bosses|raid/.test(fname);
  const combat = m.combat || 0;
  let i = 3; // baseline for a monster

  if (isBoss) {
    // Boss floor 7; push up by max hit and mechanics.
    i = 7;
    if (combat >= 600) i = 8;
    if (combat >= 800) i = 9;
    // Inferno / tob / cox markers
    const name = (m.name || '').toLowerCase();
    if (/inferno|tzkal|jad|tzhaar/.test(name)) i = 10;
    if (/nightmare|verzik|nex/.test(name)) i = 9;
    return i;
  }
  // Regular monsters
  if (combat < 10) i = 1;              // rats, chickens — pure AFK
  else if (combat < 20) i = 2;         // goblins, low mobs
  else if (combat < 40) i = 3;         // mid-level grind
  else if (combat < 70) i = 4;         // higher slayer tasks
  else if (combat < 120) i = 5;
  else if (combat < 200) i = 6;
  else if (combat < 300) i = 7;
  else i = 7;
  // Elite task monsters (nechryael, gargoyle, dark beast) require prayer/mechanics.
  const name = (m.name || '').toLowerCase();
  if (/nechry|gargoyle|dark beast|abyssal|skotizo|muspah/.test(name)) i = Math.max(i, 7);
  if (/revenant|lava dragon/.test(name)) i = Math.max(i, 6); // PK risk
  if (/chaos elemental/.test(name)) i = Math.max(i, 8);
  // Poison attackers require food rotation.
  if (m.poisonDamage) i = Math.max(i, 3);
  // Aggressive multi-attackers nudge up.
  if (m.aggressive && combat >= 60) i = Math.max(i, 4);
  return Math.min(10, Math.max(1, i));
}

// Approximate xp/hr + gp/hr from monster combat level.
function combatPerHourFromStats(m) {
  // Roughly: a player can kill combat-N at K kills/hr.  At low level
  // ~= 400 kph (weak mobs), mid ~200, high ~=120, boss ~=30.
  const combat = m.combat || 1;
  let kph;
  if (combat < 20) kph = 500;
  else if (combat < 50) kph = 350;
  else if (combat < 100) kph = 220;
  else if (combat < 200) kph = 150;
  else if (combat < 400) kph = 80;
  else if (combat < 600) kph = 40;
  else kph = 25;
  // hp * 4 xp per hp (Hitpoints + combat skill), rough
  const xpPerKill = (m.maxHp || 10) * 4 * 1.33;
  const xp_per_hour = Math.round(kph * xpPerKill);
  // gp per kill approximated from combat level cubed factor — since we can't
  // execute drop tables here, use a heuristic.  Boss bodies get a boost.
  const isBoss = (m.tags || []).includes('boss');
  const base = isBoss ? combat * 800 : combat * 12;
  const gp_per_hour = Math.round(kph * base);
  return { xp_per_hour, gp_per_hour };
}

// Scan every aelgard *.js file for rel.defineTrainingMethod calls.
// Each call already carries skill / xpPerHour / levelRange / attention /
// danger / complexity — so mapping into the catalog is direct.
function collectRegionTrainingMethods(catalog) {
  let count = 0;
  const files = fs.readdirSync(AELGARD).filter(f => /\.js$/.test(f));
  for (const fname of files) {
    const full = path.join(AELGARD, fname);
    const src = fs.readFileSync(full, 'utf8');
    // Pattern: rel.defineTrainingMethod('id', { body })
    const re = /rel\.defineTrainingMethod\(\s*'([a-z0-9_]+)'\s*,\s*\{/g;
    let m;
    while ((m = re.exec(src))) {
      const id = m[1];
      const start = src.indexOf('{', m.index + m[0].length - 1);
      if (start === -1) continue;
      let depth = 0; let end = start;
      for (let i = start; i < src.length; i++) {
        if (src[i] === '{') depth++;
        else if (src[i] === '}') { depth--; if (depth === 0) { end = i; break; } }
      }
      const body = src.slice(start + 1, end);
      const skill = valStr(body, 'skill') || 'unknown';
      const name = valStr(body, 'name') || id;
      const xpPerHour = Number((body.match(/\bxpPerHour:\s*(\d+)/) || [])[1]) || 0;
      // levelRange: [min, max]
      const lr = body.match(/\blevelRange:\s*\[\s*(\d+)\s*,\s*(\d+)\s*\]/);
      const lvlMin = lr ? Number(lr[1]) : 1;
      const attention = (valStr(body, 'attention') || 'medium').toLowerCase();
      const danger = (valStr(body, 'danger') || 'none').toLowerCase();
      const complexity = (valStr(body, 'complexity') || 'simple').toLowerCase();
      // Map attention+complexity+danger to 1..10
      let intensity = 3;
      if (attention === 'afk') intensity = 1;
      else if (attention === 'low') intensity = 2;
      else if (attention === 'medium') intensity = 4;
      else if (attention === 'high') intensity = 6;
      else if (attention === 'intense' || attention === 'max focus') intensity = 7;
      if (complexity === 'complex' || complexity === 'intricate') intensity += 1;
      if (danger === 'medium') intensity += 1;
      if (danger === 'high') intensity += 2;
      if (danger === 'extreme' || danger === 'wilderness') intensity += 3;
      intensity = Math.min(10, Math.max(1, intensity));

      // GP/hr from resourceOutput (best-effort)
      let gp_per_hour = 0;
      const costM = body.match(/\bcostPerHour:\s*(\d+)/);
      const profitM = body.match(/\bnet:\s*['"](profit|loss)['"]/);
      if (profitM) {
        // Try: first produces.perHour number — rough estimate
        const coins = body.match(/perHour:\s*(\d+)/);
        if (profitM[1] === 'profit' && coins) gp_per_hour = Number(coins[1]);
        else if (profitM[1] === 'loss' && costM) gp_per_hour = -Number(costM[1]);
      }
      const region = (valStr(body, 'location') || 'unknown').toLowerCase().split(',')[0].trim().replace(/\s+/g, '_');
      // Pre-reqs
      const qMatch = body.match(/quests:\s*\[([^\]]*)\]/);
      const quests = qMatch ? qMatch[1].split(',').map(s => s.replace(/["'\s]/g, '')).filter(Boolean) : [];
      const aMatch = body.match(/areas:\s*\[([^\]]*)\]/);
      const areas = aMatch ? aMatch[1].split(',').map(s => s.replace(/["'\s]/g, '')).filter(Boolean) : [];
      // Easter-egg / quirky-interactions methods are intentionally tiny XP
      // rewards for flavour. Mark as composite so misery detection skips them.
      const isQuirky = /quirky|easter|wishing|signboard|beggar|polish|rubbing|dust|help|watch|carry|sign|dance|whistle/.test(id)
        || /easter-eggs|quirky-interactions|tertiary/.test(fname);
      catalog.push({
        activity_id: `trainmethod_${id}`,
        activity_type: 'skill_method',
        skill,
        intensity,
        base_xp_per_hour: xpPerHour,
        base_gp_per_hour: gp_per_hour,
        region,
        level_required: lvlMin,
        gating: { quests, items: [], areas },
        notes: `${name} — attention ${attention}, danger ${danger}, complexity ${complexity}`,
        source_file: `src/content/aelgard/${fname}`,
        is_composite: isQuirky || undefined,
      });
      count++;
    }
  }
  return count;
}

// Scan src/content/aelgard/training-methods.js for skill-specific defineNode /
// defineCourse / etc calls. These are additional skill methods beyond the 23
// manifest entries.
function collectTrainingMethods(catalog) {
  const f = path.join(AELGARD, 'training-methods.js');
  if (!fs.existsSync(f)) return 0;
  const src = fs.readFileSync(f, 'utf8');
  let count = 0;
  const PATTERNS = [
    // { regex, activityPrefix, skillFallback, produceKey }
    { re: /(?:gathering)\.defineNode\(\s*\{([^}]*)\}/g, prefix: 'gather_', skillFallback: 'mining' },
    { re: /(?:gathering)\.defineFishSpot\(\s*\{([^}]*)\}/g, prefix: 'fish_', skillFallback: 'fishing' },
    { re: /(?:gathering)\.defineTree\(\s*\{([^}]*)\}/g, prefix: 'chop_', skillFallback: 'woodcutting' },
    { re: /(?:processing)\.defineRecipe\(\s*\{([^}]*)\}/g, prefix: 'process_', skillFallback: 'cooking' },
    { re: /(?:agility)\.defineCourse\(\s*\{([^}]*)\}/g, prefix: 'course_', skillFallback: 'agility' },
    { re: /(?:hunter)\.defineTrap\(\s*\{([^}]*)\}/g, prefix: 'trap_', skillFallback: 'hunter' },
    { re: /(?:farming)\.definePatch\(\s*\{([^}]*)\}/g, prefix: 'farm_', skillFallback: 'farming' },
    { re: /(?:thieving)\.defineTarget\(\s*\{([^}]*)\}/g, prefix: 'pickpocket_', skillFallback: 'thieving' },
  ];
  for (const { re, prefix, skillFallback } of PATTERNS) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(src))) {
      const body = m[1];
      const id = valStr(body, 'id') || '';
      if (!id) continue;
      const skill = valStr(body, 'skill') || skillFallback;
      const level = Number((body.match(/\blevel:\s*(\d+)/) || [])[1]) || 1;
      const xp = Number((body.match(/\bxp:\s*([\d.]+)/) || [])[1]) || 0;
      // Heuristic intensity from xp density + whether depletes
      let intensity = 2;
      if (/depletes:\s*false/.test(body)) intensity = 1;
      if (/granite|sandstone|amethyst/.test(id)) intensity = 4;
      if (/tick|rotation|shattered|fey/.test(id)) intensity = 6;
      // Per-hour rough estimate: 300 cycles/hr at 3.6s baseline.
      const xp_per_hour = Math.round(xp * 300);
      catalog.push({
        activity_id: `${prefix}${id}`,
        activity_type: 'skill_method',
        skill,
        intensity,
        base_xp_per_hour: xp_per_hour,
        base_gp_per_hour: 0,
        region: 'unknown',
        level_required: level,
        gating: { quests: [], items: [], areas: [] },
        notes: `${valStr(body, 'name') || id} — training-methods.js`,
        source_file: `src/content/aelgard/training-methods.js`,
      });
      count++;
    }
  }
  return count;
}

// Also scan the Inferno content — it defines NPCs via npcs.defineNpc rather
// than mob()/boss() so the main loop misses it.
function collectInferno(catalog) {
  const dir = path.join(REPO_ROOT, 'src', 'content', 'inferno');
  if (!fs.existsSync(dir)) return 0;
  let count = 0;
  for (const f of fs.readdirSync(dir).filter(n => /\.js$/.test(n))) {
    const full = path.join(dir, f);
    const src = fs.readFileSync(full, 'utf8');
    DEFINE_NPC_RE.lastIndex = 0;
    let dm;
    while ((dm = DEFINE_NPC_RE.exec(src))) {
      const id = dm[1];
      const fullBodyStart = src.indexOf('{', dm.index);
      if (fullBodyStart === -1) continue;
      let depth = 0; let end = fullBodyStart;
      for (let i = fullBodyStart; i < src.length; i++) {
        if (src[i] === '{') depth++;
        else if (src[i] === '}') { depth--; if (depth === 0) { end = i; break; } }
      }
      const body = src.slice(fullBodyStart + 1, end);
      const m = parseMobBody(body);
      if (!m.combat) continue;
      const nameLower = (m.name || id).toLowerCase();
      let intensity = 9; // everything in Inferno is max-effort
      if (/zuk|tzkal|jad|triple/.test(nameLower) || /zuk|jad/.test(id)) intensity = 10;
      const { xp_per_hour, gp_per_hour } = combatPerHourFromStats(m);
      catalog.push({
        activity_id: `kill_${id}`,
        activity_type: 'boss',
        skill: 'combat',
        intensity,
        base_xp_per_hour: xp_per_hour,
        base_gp_per_hour: gp_per_hour,
        region: 'sootworks',
        level_required: 90,
        gating: { quests: ['tzhaar_fight_caves'], items: ['fire_cape'], areas: ['inferno'] },
        notes: `${m.name || id} — Inferno NPC, combat ${m.combat} hp ${m.maxHp}`,
        source_file: `src/content/inferno/${f}`,
        // Individual Inferno mobs are wave components, not standalone activities.
        // Mark them so the misery-median excludes them.
        is_composite: true,
      });
      count++;
    }
  }
  // Meta-instances for the highest-intensity content. These are aggregate
  // activities that describe a full challenge run — what a player "does" at
  // the endgame — distinct from "kill this one NPC" entries.
  const INSTANCES = [
    {
      id: 'challenge_inferno_full', int: 10, xp: 80000, gp: 25000000,
      region: 'sootworks', level: 92, q: ['tzhaar_fight_caves'],
      items: ['fire_cape'], areas: ['inferno'],
      notes: 'Full 69-wave Inferno run. Max-focus PvM — prayer flick, tile dance, Zuk shield kiting.',
      src: 'src/content/inferno/inferno.js',
    },
    {
      id: 'challenge_tzhaar_fight_cave', int: 9, xp: 60000, gp: 2800000,
      region: 'sootworks', level: 75, q: [],
      items: [], areas: ['fight_cave'],
      notes: 'TzTok-Jad 63-wave fight cave. Prayer-switching against Jad magic/ranged.',
      src: 'src/content/inferno/inferno.js',
    },
    {
      id: 'raid_chambers_of_aelgard_solo', int: 9, xp: 70000, gp: 4500000,
      region: 'glass_desert', level: 85, q: [], items: [], areas: ['chambers_of_aelgard'],
      notes: 'CoA solo run through 6 rooms: Vanguards, Tekton, Vespula, Guardians, Ice Demon, Great Crystal Serpent.',
      src: 'src/content/aelgard/raids.js',
    },
    {
      id: 'raid_chambers_of_aelgard_team', int: 9, xp: 90000, gp: 3800000,
      region: 'glass_desert', level: 80, q: [], items: [], areas: ['chambers_of_aelgard'],
      notes: 'CoA team run — 3-5 players, 30-45 min, drops dragon claws / arcane/dex scroll / twisted bow / dinhs.',
      src: 'src/content/aelgard/raids.js',
    },
    {
      id: 'raid_theatre_of_shadows', int: 9, xp: 80000, gp: 3500000,
      region: 'moryskah', level: 85, q: [], items: [], areas: ['theatre_of_shadows'],
      notes: 'ToS 5-boss raid (Maiden, Bloat, Nylocas, Sotetseg, Verzik). Requires coordinated prayer switching.',
      src: 'src/content/aelgard/raids.js',
    },
    {
      id: 'raid_theatre_of_shadows_hard_mode', int: 10, xp: 75000, gp: 4500000,
      region: 'moryskah', level: 90, q: [], items: [], areas: ['theatre_of_shadows_hm'],
      notes: 'ToS Hard Mode — mechanics compounded, HP/damage escalated. Drops HM-only titles.',
      src: 'src/content/aelgard/raids-mega1.js',
    },
    {
      id: 'raid_tombs_of_amascut', int: 9, xp: 70000, gp: 3200000,
      region: 'glass_desert', level: 85, q: [], items: [], areas: ['tombs_of_amascut'],
      notes: 'Desert raid — 4 path bosses + Warden. Scalable invocations (level system).',
      src: 'src/content/aelgard/raids-mega2.js',
    },
    {
      id: 'raid_tombs_of_amascut_expert', int: 10, xp: 65000, gp: 5500000,
      region: 'glass_desert', level: 93, q: [], items: [], areas: ['tombs_of_amascut'],
      notes: 'ToA expert (500+ invocation). Path-combined elite mechanics. Tumekens shadow drop.',
      src: 'src/content/aelgard/invocations-data.js',
    },
    {
      id: 'challenge_gauntlet', int: 9, xp: 55000, gp: 1800000,
      region: 'veilwood', level: 82, q: [], items: [], areas: ['gauntlet'],
      notes: 'Gauntlet — gather resources, craft kit, fight Hunllef. Single-player timer-pressured raid.',
      src: 'src/content/aelgard/raids-mega1.js',
    },
    {
      id: 'challenge_corrupted_gauntlet', int: 10, xp: 70000, gp: 3800000,
      region: 'veilwood', level: 90, q: [], items: [], areas: ['corrupted_gauntlet'],
      notes: 'Corrupted Gauntlet — harder Hunllef + tighter gather loop. Crystal armour seed drops.',
      src: 'src/content/aelgard/raids-mega1.js',
    },
    {
      id: 'challenge_tzhaar_ket_rak_6', int: 10, xp: 45000, gp: 2200000,
      region: 'sootworks', level: 85, q: ['tzhaar_fight_caves'], items: [], areas: ['ket_rak'],
      notes: 'TzHaar-Ket-Rak 6 jads simultaneously. Elite prayer flick — any mistake is fatal.',
      src: 'src/content/aelgard/combat-challenges.js',
    },
    {
      id: 'challenge_nex_solo', int: 9, xp: 85000, gp: 4800000,
      region: 'wilds', level: 90, q: [], items: [], areas: ['ancient_prison'],
      notes: 'Nex solo — 4-phase ancient prime. Full switch (mage/range/melee) required.',
      src: 'src/content/aelgard/raids-bosses-mega.js',
    },
    {
      id: 'challenge_phantom_muspah', int: 9, xp: 60000, gp: 3600000,
      region: 'inkweald', level: 85, q: [], items: [], areas: ['ice_chasm'],
      notes: 'Phantom Muspah — 3-phase prayer switch boss. Drops venator ring.',
      src: 'src/content/aelgard/bosses-expanded.js',
    },
  ];
  for (const ii of INSTANCES) {
    catalog.push({
      activity_id: ii.id, activity_type: 'instance', skill: 'combat',
      intensity: ii.int, base_xp_per_hour: ii.xp, base_gp_per_hour: ii.gp,
      region: ii.region, level_required: ii.level,
      gating: { quests: ii.q, items: ii.items, areas: ii.areas },
      notes: ii.notes, source_file: ii.src,
    });
    count++;
  }
  return count;
}

// Crystal wyrm content (RL training boss).
function collectCrystalWyrm(catalog) {
  const dir = path.join(REPO_ROOT, 'src', 'content', 'crystal_wyrm');
  if (!fs.existsSync(dir)) return 0;
  let count = 0;
  for (const f of fs.readdirSync(dir).filter(n => /\.js$/.test(n))) {
    const src = fs.readFileSync(path.join(dir, f), 'utf8');
    DEFINE_NPC_RE.lastIndex = 0;
    let dm;
    while ((dm = DEFINE_NPC_RE.exec(src))) {
      const id = dm[1];
      const start = src.indexOf('{', dm.index);
      if (start === -1) continue;
      let depth = 0; let end = start;
      for (let i = start; i < src.length; i++) {
        if (src[i] === '{') depth++;
        else if (src[i] === '}') { depth--; if (depth === 0) { end = i; break; } }
      }
      const body = src.slice(start + 1, end);
      const m = parseMobBody(body);
      if (!m.combat) continue;
      const intensity = /wyrm/.test(id) ? 8 : 5;
      const { xp_per_hour, gp_per_hour } = combatPerHourFromStats(m);
      catalog.push({
        activity_id: `kill_${id}`, activity_type: /wyrm/.test(id) ? 'boss' : 'monster',
        skill: 'combat', intensity,
        base_xp_per_hour: xp_per_hour, base_gp_per_hour: gp_per_hour,
        region: 'veilwood', level_required: /wyrm/.test(id) ? 80 : 60,
        gating: { quests: [], items: [], areas: ['crystal_wyrm_arena'] },
        notes: `${m.name || id} — Crystal Wyrm arena combat ${m.combat}`,
        source_file: `src/content/crystal_wyrm/${f}`,
      });
      count++;
    }
  }
  return count;
}

function collectMonstersAndBosses(catalog) {
  let count = 0;
  const files = fs.readdirSync(AELGARD).filter(f => /\.js$/.test(f));
  const processedIds = new Set();
  for (const fname of files) {
    const full = path.join(AELGARD, fname);
    const src = fs.readFileSync(full, 'utf8');
    // Region inference: prefer filename, else scan header comment.
    const regionGuess = regionFromFilename(fname);

    // Pass A: mob(...) definitions
    for (const re of [MOB_RE, BOSS_RE]) {
      re.lastIndex = 0;
      let match;
      while ((match = re.exec(src))) {
        const id = match[1];
        if (processedIds.has(id)) continue;
        processedIds.add(id);
        // We need the full def body; the simple regex above only captures the
        // first-level {...}. Grab from match start forward until balanced brace.
        const fullBodyStart = src.indexOf('{', match.index);
        if (fullBodyStart === -1) continue;
        let depth = 0; let end = fullBodyStart;
        for (let i = fullBodyStart; i < src.length; i++) {
          if (src[i] === '{') depth++;
          else if (src[i] === '}') { depth--; if (depth === 0) { end = i; break; } }
        }
        const body = src.slice(fullBodyStart + 1, end);
        const m = parseMobBody(body);
        m._rawId = id;
        m._isBoss = re === BOSS_RE || (m.tags || []).includes('boss');

        // Push raid-file bosses to intensity 9; Inferno chains to 10.
        let intensity = intensityForMonster(m, fname);
        if (/raids-mega1|raids-mega2|raids-bosses-mega/.test(fname) && m._isBoss) {
          intensity = Math.max(intensity, 9);
          const nm = (m.name || '').toLowerCase();
          const tagStr = (m.tags || []).join(',').toLowerCase();
          if (/inferno|jad|tzkal|tzhaar/.test(nm + ' ' + tagStr)) intensity = 10;
          if (/tob|verzik|sotetseg|tekton|vasa|muttadile/.test(nm + ' ' + tagStr)) intensity = Math.max(intensity, 9);
          if (/hm\b|challenge|gauntlet|corrupted/.test(nm + ' ' + tagStr)) intensity = Math.max(intensity, 9);
        }
        const { xp_per_hour, gp_per_hour } = combatPerHourFromStats(m);
        const region = regionFromHint(regionGuess, m, src, match.index);
        const activity_type = m._isBoss ? 'boss' : 'monster';
        catalog.push({
          activity_id: `kill_${id}`,
          activity_type,
          skill: 'combat',
          intensity,
          base_xp_per_hour: xp_per_hour,
          base_gp_per_hour: gp_per_hour,
          region,
          level_required: m._isBoss ? estimateBossLevelReq(m) : Math.max(1, Math.floor((m.combat || 1) / 3)),
          gating: { quests: [], items: [], areas: [] },
          notes: `${m.name || id} — combat ${m.combat} hp ${m.maxHp} maxHit ${m.maxHit}${m.tags?.length ? ' tags:' + m.tags.join('/') : ''}`,
          source_file: `src/content/aelgard/${fname}`,
        });
        count++;
      }
    }

    // Pass A.5: mega({ id: ... }) — monsters-mega.js helper form.
    MEGA_RE.lastIndex = 0;
    let meg;
    while ((meg = MEGA_RE.exec(src))) {
      const bodyStart = src.indexOf('{', meg.index);
      if (bodyStart === -1) continue;
      let depth = 0; let end = bodyStart;
      for (let i = bodyStart; i < src.length; i++) {
        if (src[i] === '{') depth++;
        else if (src[i] === '}') { depth--; if (depth === 0) { end = i; break; } }
      }
      const body = src.slice(bodyStart + 1, end);
      const mId = valStr(body, 'id');
      if (!mId) continue;
      if (processedIds.has(mId)) continue;
      processedIds.add(mId);
      // Normalise to mob shape
      const m = {
        name: valStr(body, 'name'),
        combat: Number((body.match(/\blevel:\s*(\d+)/) || [])[1]) || 0,
        maxHp: Number((body.match(/\bhp:\s*(\d+)/) || [])[1]) || 0,
        maxHit: Number((body.match(/\bmax_hit:\s*(\d+)/) || [])[1]) || 0,
        attackStyle: valStr(body, 'combat_style') || 'melee',
        weakness: valStr(body, 'weakness') || null,
        tags: valArrStr(body, 'tags'),
      };
      const xpPerKill = Number((body.match(/\bxp_per_kill:\s*(\d+)/) || [])[1]) || 0;
      const slayerLvl = Number((body.match(/\bslayer_level_required:\s*(\d+)/) || [])[1]) || 0;
      const region = (valStr(body, 'region') || 'unknown').toLowerCase().replace(/\s+/g, '_');
      const intensity = intensityForMonster(m, fname);
      let { xp_per_hour, gp_per_hour } = combatPerHourFromStats(m);
      if (xpPerKill > 0 && m.combat) {
        // Use explicit xp_per_kill when available (monsters-mega.js always has it).
        const kph = m.combat < 20 ? 500 : m.combat < 50 ? 350 : m.combat < 100 ? 220 : m.combat < 200 ? 150 : 80;
        xp_per_hour = Math.round(xpPerKill * kph);
      }
      const isBoss = (m.tags || []).includes('boss') || (m.combat || 0) >= 300;
      catalog.push({
        activity_id: `kill_${mId}`,
        activity_type: isBoss ? 'boss' : 'monster',
        skill: slayerLvl > 0 ? 'slayer' : 'combat',
        intensity,
        base_xp_per_hour: xp_per_hour,
        base_gp_per_hour: gp_per_hour,
        region,
        level_required: slayerLvl > 0 ? slayerLvl : (isBoss ? estimateBossLevelReq(m) : Math.max(1, Math.floor((m.combat || 1) / 3))),
        gating: { quests: [], items: [], areas: [] },
        notes: `${m.name || mId} — combat ${m.combat} hp ${m.maxHp} maxHit ${m.maxHit} ${(m.tags || []).length ? 'tags:' + m.tags.join('/') : ''}${slayerLvl > 0 ? ` slayerReq:${slayerLvl}` : ''}`,
        source_file: `src/content/aelgard/${fname}`,
      });
      count++;
    }

    // Pass B: npcs.defineNpc('id', { ... }) — used by raids.js, some region files.
    DEFINE_NPC_RE.lastIndex = 0;
    let dm;
    while ((dm = DEFINE_NPC_RE.exec(src))) {
      const id = dm[1];
      if (processedIds.has(id)) continue;
      const fullBodyStart = src.indexOf('{', dm.index);
      if (fullBodyStart === -1) continue;
      let depth = 0; let end = fullBodyStart;
      for (let i = fullBodyStart; i < src.length; i++) {
        if (src[i] === '{') depth++;
        else if (src[i] === '}') { depth--; if (depth === 0) { end = i; break; } }
      }
      const body = src.slice(fullBodyStart + 1, end);
      const m = parseMobBody(body);
      // Only accept NPCs with combat>0 (skippers, shopkeepers have combat:0)
      if (!m.combat) continue;
      processedIds.add(id);
      m._rawId = id;
      const tags = m.tags || [];
      const tagsLower = tags.join(',').toLowerCase();
      const idLower = id.toLowerCase();
      m._isBoss = /\b(boss|raid|tos|coa|tob|cox|toa|ancient)\b/.test(tagsLower)
        || /^(tos_|coa_|tob_|cox_|toa_|raid_|boss_)/.test(idLower)
        || (m.combat || 0) >= 300;

      let intensity = intensityForMonster(m, fname);
      if (/tos_|coa_/.test(idLower)) intensity = Math.max(intensity, 9);
      if (/verzik|nylocas_vasilias|maiden|bloat|sotetseg|ice_demon|great_crystal/.test(idLower)) intensity = Math.max(intensity, 9);
      if (/inferno|jad|tzkal|zuk/.test(idLower)) intensity = 10;
      const { xp_per_hour, gp_per_hour } = combatPerHourFromStats(m);
      const region = regionFromHint(regionGuess, m, src, dm.index);
      // tos_* / coa_* / tob_* / cox_* NPCs are raid-room components rather
      // than standalone kill activities. Flag them so misery detection skips.
      // Also mark any "copy"/"add"/"spawn"/"minion" NPCs with hp<=5 as puzzle
      // pieces rather than true combat activities.
      const is_composite = (/^(tos_|coa_|tob_|cox_|toa_|raid_)/.test(id)
        && !/(maiden|bloat|sotetseg|nylocas_vasilias|verzik|tekton|vespula|ice_demon|great_crystal|olm|akkha|zebak|kephri|ba_ba|warden)/.test(id))
        || ((m.maxHp || 0) <= 5)
        || /(copy|clone|spawn|add|minion|orb|egg|rubble|pillar|shade_pillar|npc_|object_)/.test(id);
      catalog.push({
        activity_id: `kill_${id}`,
        activity_type: m._isBoss ? 'boss' : 'monster',
        skill: 'combat',
        intensity,
        base_xp_per_hour: xp_per_hour,
        base_gp_per_hour: gp_per_hour,
        region,
        level_required: m._isBoss ? estimateBossLevelReq(m) : Math.max(1, Math.floor((m.combat || 1) / 3)),
        gating: { quests: [], items: [], areas: [] },
        notes: `${m.name || id} — combat ${m.combat} hp ${m.maxHp} maxHit ${m.maxHit}${tags.length ? ' tags:' + tags.join('/') : ''}`,
        source_file: `src/content/aelgard/${fname}`,
        is_composite: is_composite || undefined,
      });
      count++;
    }
  }
  return count;
}

function estimateBossLevelReq(m) {
  const c = m.combat || 100;
  if (c < 250) return 70;
  if (c < 500) return 80;
  if (c < 700) return 85;
  if (c < 900) return 90;
  return 93;
}

// Map a few boss tag heuristics to their region.
function regionFromTags(tags) {
  const t = new Set((tags || []).map(x => String(x).toLowerCase()));
  if (t.has('godwars')) return 'wilds';           // GWD dungeon lives under Wilds
  if (t.has('vampyre') || t.has('blood')) return 'moryskah';
  if (t.has('undead') && (t.has('ghost') || t.has('crypt') || t.has('wraith') || t.has('lich') || t.has('ghast')))
    return 'moryskah';
  if (t.has('dragon') && (t.has('undead') || t.has('icy'))) return 'boneyard';
  if (t.has('inferno') || t.has('tzhaar')) return 'sootworks';
  if (t.has('tob') || t.has('tos_hm')) return 'moryskah';
  if (t.has('cox') || t.has('raid_cox') || t.has('gauntlet') || t.has('crystal')) return 'veilwood';
  if (t.has('toa') || t.has('ancient') || t.has('pharaoh') || t.has('mummy') || t.has('desert') || t.has('sanctum'))
    return 'glass_desert';
  if (t.has('forge') || t.has('engine') || t.has('mechanical')) return 'sootworks';
  if (t.has('nightmare') || t.has('dream') || t.has('shade') || t.has('mirror')) return 'inkweald';
  if (t.has('sea') || t.has('tide') || t.has('storm') || t.has('pirate') || t.has('tempest'))
    return 'saltbrine';
  if (t.has('siege') || t.has('king') || (t.has('human') && t.has('commander'))) return 'heartlands';
  return null;
}

// Map raid location IDs + npc id prefixes to regions.
function regionFromIdPrefix(id) {
  const i = String(id || '').toLowerCase();
  if (/^tos_|tob_/.test(i)) return 'moryskah';        // Theatre of Shadows
  if (/^coa_|cox_/.test(i)) return 'glass_desert';    // CoA / Chambers
  if (/^toa_/.test(i)) return 'glass_desert';         // Tombs of Amascut
  if (/^gauntlet_|hunllef/.test(i)) return 'veilwood';
  if (/^crypt_|catacomb_/.test(i)) return 'moryskah';
  if (/^sanctum_|pharaoh|pyramid/.test(i)) return 'glass_desert';
  if (/^tempest_|storm_|sunken|kraken/.test(i)) return 'saltbrine';
  if (/^nightmare_|dream_|mirror|lucid/.test(i)) return 'inkweald';
  if (/^engine_|forge_|crucible|architect/.test(i)) return 'sootworks';
  if (/^worldtree_|spine_|blood_archon/.test(i)) return 'moryskah';
  if (/^rift_/.test(i)) return 'inkweald';
  if (/^siege_|last_king|royal|bandit/.test(i)) return 'heartlands';
  if (/^revenant_|chaos_|wilds_|pvp_/.test(i)) return 'wilds';
  return null;
}

// Find a region override in the surrounding source comments (e.g.,
// `// WILDS` header preceding the mob call).
function regionFromHint(fallback, m, src, idx) {
  const byTag = regionFromTags(m.tags);
  if (byTag) return byTag;
  // Also try id prefix if m._rawId is set (passed through for mob/boss calls).
  if (m._rawId) {
    const byPref = regionFromIdPrefix(m._rawId);
    if (byPref) return byPref;
  }
  const slice = src.slice(Math.max(0, idx - 2500), idx);
  const hits = [];
  for (const [k, v] of [
    [/wilds/i, 'wilds'],
    [/heartlands/i, 'heartlands'],
    [/sootworks/i, 'sootworks'],
    [/moryskah|myrebog/i, 'moryskah'],
    [/boneyard/i, 'boneyard'],
    [/glass\s*desert/i, 'glass_desert'],
    [/saltbrine/i, 'saltbrine'],
    [/veilwood/i, 'veilwood'],
    [/inkweald/i, 'inkweald'],
  ]) {
    // Prefer the last / nearest comment header. Match any `//` comment that
    // mentions the region name — not just `═` boxed ones.
    const reH = new RegExp('//[^\\n]*?\\b(' + k.source + ')\\b', 'gmi');
    let lm; let last = null;
    while ((lm = reH.exec(slice))) last = lm;
    if (last) hits.push({ start: last.index, region: v });
  }
  if (hits.length) {
    hits.sort((a, b) => b.start - a.start);
    return hits[0].region;
  }
  return fallback || 'unknown';
}

// ══════════════════════════════════════════════════════════════════════════════
// Source 4: minigames
// ══════════════════════════════════════════════════════════════════════════════

function attentionToIntensity(att) {
  const map = { Background: 2, Multitask: 3, Active: 5, 'Max Focus': 8, none: 2 };
  return map[att] || 4;
}

function collectMinigames(catalog) {
  let count = 0;
  // Base minigames.js exports a Map via module.exports.minigames
  const baseFile = path.join(AELGARD, 'minigames.js');
  if (fs.existsSync(baseFile)) {
    const src = fs.readFileSync(baseFile, 'utf8');
    // Parse each `defineMinigame({ ... })` block.
    const calls = findCalls(src, 'defineMinigame');
    for (const { body } of calls) {
      const id = valStr(body, 'id') || 'unknown';
      const name = valStr(body, 'name') || id;
      const region = (valStr(body, 'region') || 'unknown').toLowerCase().replace(/\s+/g, '_');
      const attention = valStr(body, 'attention') || 'Active';
      const type = valStr(body, 'type') || 'combat';
      let intensity = attentionToIntensity(attention);
      if (type === 'pvp') intensity = Math.max(intensity, 8);
      catalog.push({
        activity_id: `minigame_${id}`,
        activity_type: 'minigame',
        skill: 'mixed',
        intensity,
        base_xp_per_hour: 0,
        base_gp_per_hour: 0,
        region,
        level_required: parseLevelReqs(body),
        gating: { quests: [], items: [], areas: [] },
        notes: `${name} — type ${type} attention ${attention}`,
        source_file: `src/content/aelgard/minigames.js`,
      });
      count++;
    }
  }

  // mega + scapified — same shape but via rel.defineMinigame(...)
  for (const f of ['minigames-mega.js', 'minigames-scapified.js']) {
    const full = path.join(AELGARD, f);
    if (!fs.existsSync(full)) continue;
    const src = fs.readFileSync(full, 'utf8');
    const calls = findCalls(src, 'defineMinigame');
    for (const { body } of calls) {
      const id = valStr(body, 'id') || 'unknown';
      const name = valStr(body, 'name') || id;
      const region = (valStr(body, 'region') || 'unknown').toLowerCase().replace(/\s+/g, '_');
      const attention = valStr(body, 'attention') || 'Active';
      const tpl = valStr(body, 'template') || '';
      let intensity = attentionToIntensity(attention);
      // battle_royale / duel_1v1 / role_based_team push up
      if (/battle_royale|duel|capture_the_flag|wave_survival/.test(tpl)) intensity = Math.max(intensity, 6);
      if (/board_game|passive_management/.test(tpl)) intensity = Math.min(intensity, 3);
      if (valBool(body, 'isPvP')) intensity = Math.max(intensity, 8);
      catalog.push({
        activity_id: `minigame_${id}`,
        activity_type: 'minigame',
        skill: 'mixed',
        intensity,
        base_xp_per_hour: 0,
        base_gp_per_hour: 0,
        region,
        level_required: parseLevelReqs(body),
        gating: { quests: valArrStr(body, 'questReqs'), items: [], areas: [] },
        notes: `${name} — template ${tpl} attention ${attention}`,
        source_file: `src/content/aelgard/${f}`,
      });
      count++;
    }
  }

  return count;
}

// ══════════════════════════════════════════════════════════════════════════════
// Source 5: raid bosses (raids.js, raids-bosses-mega.js, raids-mega1/2.js)
// ══════════════════════════════════════════════════════════════════════════════

function collectRaids(catalog) {
  let count = 0;
  // Only special raid-layout calls — the boss() NPC definitions inside these
  // files are already covered by collectMonstersAndBosses. We look for
  // defineRaid-style wrapper calls (raid-level metadata, not the NPC defs).
  const raidFiles = [
    'raids.js', 'raids-mega1.js', 'raids-mega2.js', 'raids-bosses-mega.js',
  ];
  for (const f of raidFiles) {
    const full = path.join(AELGARD, f);
    if (!fs.existsSync(full)) continue;
    const src = fs.readFileSync(full, 'utf8');
    // Skip boss() — picked up by the monster/boss pass. Only count raid
    // container definitions here.
    for (const fn of ['defineRaid', 'raidBoss', 'defineBoss']) {
      const calls = findCalls(src, fn);
      for (const { body } of calls) {
        const id = valStr(body, 'id') || valStr(body, 'name') || `raid_${Math.random().toString(36).slice(2, 8)}`;
        const name = valStr(body, 'name') || id;
        const combat = Number((body.match(/\bcombat:\s*(\d+)/) || [])[1]) || 0;
        const maxHp = Number((body.match(/\bmaxHp:\s*(\d+)/) || [])[1]) || 0;
        // Raid bosses are intensity 8-10
        let intensity = 9;
        const nm = name.toLowerCase();
        if (/verzik|zebak|xarpus|sotetseg|maiden|bloat/.test(nm)) intensity = 9;
        if (/inferno|tzkal|jad/.test(nm)) intensity = 10;
        if (/olm|muttadile|guardian|tektiny/.test(nm)) intensity = 9;
        if (/akkha|kephri|ba_ba|ba-ba|baba|zebak|warden/.test(nm)) intensity = 9;
        const tags = (body.match(/tags:\s*\[([^\]]*)\]/) || [])[1] || '';
        if (/inferno|jad/.test(tags)) intensity = 10;

        const region = inferRegionFromString(name + ' ' + body + ' ' + f);
        catalog.push({
          activity_id: `raid_${slug(id)}`,
          activity_type: 'raid_boss',
          skill: 'combat',
          intensity,
          base_xp_per_hour: Math.round((maxHp || 200) * 4 * 1.33 * 30),
          base_gp_per_hour: Math.round((combat || 500) * 2000),
          region,
          level_required: 85,
          gating: { quests: [], items: [], areas: [] },
          notes: `${name} — raid boss combat ${combat} hp ${maxHp}`,
          source_file: `src/content/aelgard/${f}`,
        });
        count++;
      }
    }
  }
  return count;
}

// ══════════════════════════════════════════════════════════════════════════════
// Utilities
// ══════════════════════════════════════════════════════════════════════════════

function slug(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

// Find balanced-brace call bodies for `fn(`.
function findCalls(src, fn) {
  const out = [];
  const needle = fn + '(';
  let i = 0;
  while (i < src.length) {
    const idx = src.indexOf(needle, i);
    if (idx === -1) break;
    const start = src.indexOf('{', idx);
    if (start === -1) { i = idx + needle.length; continue; }
    let depth = 0; let end = start;
    for (let j = start; j < src.length; j++) {
      const ch = src[j];
      if (ch === '{') depth++;
      else if (ch === '}') { depth--; if (depth === 0) { end = j; break; } }
    }
    out.push({ body: src.slice(start + 1, end) });
    i = end + 1;
  }
  return out;
}

function valStr(body, key) {
  const m = body.match(new RegExp('\\b' + key + ':\\s*(["\'`])([^"\'`]+?)\\1'));
  return m ? m[2] : null;
}
function valBool(body, key) {
  return new RegExp('\\b' + key + ':\\s*true').test(body);
}
function valArrStr(body, key) {
  const m = body.match(new RegExp('\\b' + key + ':\\s*\\[([^\\]]*)\\]'));
  if (!m) return [];
  return m[1].split(',').map(s => s.replace(/["'`\s]/g, '')).filter(Boolean);
}
function parseLevelReqs(body) {
  const m = body.match(/levelReqs:\s*\{([^}]*)\}/);
  if (!m) return 1;
  const vals = [...m[1].matchAll(/(\d+)/g)].map(x => Number(x[1]));
  return vals.length ? Math.max(...vals) : 1;
}
function inferRegionFromString(s) {
  const table = [
    ['wilds', 'wilds'], ['heartland', 'heartlands'],
    ['sootworks|soot', 'sootworks'], ['moryskah|myrebog|moryska', 'moryskah'],
    ['boneyard', 'boneyard'], ['glass desert|glass_desert', 'glass_desert'],
    ['saltbrine', 'saltbrine'], ['veilwood|veil wood', 'veilwood'],
    ['inkweald|ink ', 'inkweald'],
  ];
  const lower = s.toLowerCase();
  for (const [k, v] of table) if (new RegExp(k).test(lower)) return v;
  return 'unknown';
}

// ══════════════════════════════════════════════════════════════════════════════
// Misery zone + gap detection
// ══════════════════════════════════════════════════════════════════════════════

// Combat manifest entries use xpPer=4 (per-swing) which is a bookkeeping
// artifact — the real XP per hour comes from killing monsters, not swinging
// the weapon in isolation. Exclude those from the output-median check but
// keep them counted for band coverage.
const COMBAT_MANIFEST_SKILLS = new Set(['attack', 'strength', 'defence', 'hitpoints', 'ranged', 'magic']);

function isManifestCombatSkillEntry(e) {
  return e.activity_type === 'skill_method'
    && COMBAT_MANIFEST_SKILLS.has(e.skill)
    && e.base_xp_per_hour > 0 && e.base_xp_per_hour < 12000;
}

// Cluster activities into "families" so misery is compared within like-for-like:
//   - skilling_xp — skill_methods, non-combat skilling
//   - combat      — monster / boss / instance / raid_boss
function activityFamily(e) {
  if (e.activity_type === 'skill_method' && e.skill !== 'combat' && !COMBAT_MANIFEST_SKILLS.has(e.skill)) return 'skilling_xp';
  if (e.activity_type === 'skill_method' && COMBAT_MANIFEST_SKILLS.has(e.skill)) return 'combat';
  if (['monster','boss','raid_boss','instance'].includes(e.activity_type)) return 'combat';
  return 'other';
}

function computeMiseryAndGaps(catalog) {
  const report = { miseryZones: [], gaps: [], bands: {}, skillCoverage: {}, totalActivities: catalog.length };
  const bands = {};
  for (let i = 1; i <= 10; i++) bands[i] = [];
  for (const e of catalog) {
    const b = Math.min(10, Math.max(1, Math.round(e.intensity)));
    bands[b].push(e);
  }
  for (let i = 1; i <= 10; i++) {
    const list = bands[i];
    // Compute SEPARATE medians per activity-family (skilling_xp vs combat).
    // Combat-manifest swing entries stay excluded, as do minigames, composites,
    // and osrs_canon-flagged entries (H18/M7 — canonical-slow paths players
    // accept; excluding keeps the median from being dragged down by them).
    const families = { skilling_xp: [], combat: [], other: [] };
    for (const e of list) {
      if (e.base_xp_per_hour <= 0) continue;
      if (isManifestCombatSkillEntry(e)) continue;
      if (e.activity_type === 'minigame') continue;
      if (e.activity_type === 'raid_boss') continue;
      if (e.is_composite) continue;
      if (e.osrs_canon) continue;
      families[activityFamily(e)].push(e);
    }
    function median(arr) {
      if (!arr.length) return 0;
      const s = arr.slice().sort((a, b) => a - b);
      return s[Math.floor(s.length / 2)];
    }
    const skillingMedian = median(families.skilling_xp.map(e => e.base_xp_per_hour));
    const combatMedian   = median(families.combat.map(e => e.base_xp_per_hour));

    report.bands[i] = {
      count: list.length,
      skilling_count: families.skilling_xp.length,
      combat_count:   families.combat.length,
      median_skilling_xp_per_hour: skillingMedian,
      median_combat_xp_per_hour: combatMedian,
    };
    if (list.length < 5) report.gaps.push({ band: i, count: list.length });

    for (const fam of ['skilling_xp', 'combat']) {
      const famMedian = fam === 'skilling_xp' ? skillingMedian : combatMedian;
      if (famMedian <= 0) continue;
      for (const e of families[fam]) {
        // osrs_canon is already filtered out of `families[fam]` above, so this
        // loop only sees non-canon candidates. Preserved as belt-and-braces.
        if (e.osrs_canon) continue;
        if (e.base_xp_per_hour < famMedian * 0.7) {
          report.miseryZones.push({
            band: i, family: fam,
            activity_id: e.activity_id, skill: e.skill, region: e.region,
            activity_type: e.activity_type,
            xp_per_hour: e.base_xp_per_hour, band_family_median_xp_per_hour: famMedian,
            deficit_pct: Math.round((1 - e.base_xp_per_hour / famMedian) * 100),
            notes: e.notes,
            source_file: e.source_file,
          });
        }
      }
    }
  }
  // Skill coverage matrix
  const bySkill = {};
  for (const e of catalog) {
    const k = e.skill || 'unknown';
    if (!bySkill[k]) bySkill[k] = new Set();
    bySkill[k].add(Math.min(10, Math.max(1, Math.round(e.intensity))));
  }
  for (const s of Object.keys(bySkill)) {
    report.skillCoverage[s] = {
      bands_covered: [...bySkill[s]].sort((a, b) => a - b),
      bands_missing: [1,2,3,4,5,6,7,8,9,10].filter(b => !bySkill[s].has(b)),
    };
  }
  // Region coverage matrix. Canonicalise aliases to one of the 9 Aelgard
  // region slugs so "the_wilds" + "wilds", "boneyard" + "boneyard_wastes"
  // merge into a single row.
  const REGION_CANON = {
    the_wilds: 'wilds', wilderness: 'wilds',
    boneyard_wastes: 'boneyard',
    saltbrine_reach: 'saltbrine',
    glass_desert_: 'glass_desert',
  };
  const byRegion = {};
  for (const e of catalog) {
    let k = (e.region || 'unknown');
    k = REGION_CANON[k] || k;
    if (!byRegion[k]) byRegion[k] = { bands: new Set(), count: 0 };
    byRegion[k].bands.add(Math.min(10, Math.max(1, Math.round(e.intensity))));
    byRegion[k].count++;
  }
  report.regionCoverage = {};
  for (const r of Object.keys(byRegion)) {
    report.regionCoverage[r] = {
      total_activities: byRegion[r].count,
      bands_covered: [...byRegion[r].bands].sort((a, b) => a - b),
      bands_missing: [1,2,3,4,5,6,7,8,9,10].filter(b => !byRegion[r].bands.has(b)),
    };
  }
  // Sort misery by deficit desc
  report.miseryZones.sort((a, b) => b.deficit_pct - a.deficit_pct);
  report.gaps.sort((a, b) => a.band - b.band);
  return report;
}

// ══════════════════════════════════════════════════════════════════════════════
// Niche power dimension — expected_power_per_hour
//
// Task #19 (v0.9-waveC): every combat activity (monster/boss/raid) annotates an
// `expected_power_per_hour` field:
//   expected_power_per_hour = kills_per_hour * sum over drops of (drop_rate × downstream_dag_value)
//
// Where:
//   - drop_rate     = probability of a single kill yielding the drop (drop weight
//                     ÷ total table weight, or 1/tertiary-chance for uniques).
//   - downstream_dag_value = number of progression-DAG nodes transitively requiring
//                     the item's unlock node (item_unlock:<id>). Falls back to a
//                     small baseline for coins/bones/runes so pure-junk drops
//                     still register a nonzero signal.
//
// This quantifies Marstead Pillar 4: "power is a vector, not a scalar." A boss
// that drops only junk is low-power. A boss dropping content-gating items
// (abyssal whip, fire cape, arclight) accrues proportionally larger power per
// hour at the same kph. The planner can then weight content-gating kills over
// pure-gp kills when the account needs unlocks.
// ══════════════════════════════════════════════════════════════════════════════

function buildDownstreamIndex() {
  // For every DAG node id, compute the count of nodes that transitively depend
  // on it (reverse-adjacency DP). Cycle-guarded. Returns Map<string, number>.
  const dagPath = path.join(DATA, 'progression-dag.json');
  if (!fs.existsSync(dagPath)) return new Map();
  const dag = JSON.parse(fs.readFileSync(dagPath, 'utf8'));
  const nodes = dag.nodes || [];
  const byId = new Map();
  for (const n of nodes) byId.set(n.id, n);
  // reverseEdges[id] = set of node ids that list `id` in their `requires`.
  const reverse = new Map();
  for (const n of nodes) reverse.set(n.id, new Set());
  for (const n of nodes) {
    for (const r of (n.requires || [])) {
      if (reverse.has(r)) reverse.get(r).add(n.id);
    }
  }
  // Transitive downstream: depth-first with memoisation + visited-guard.
  const cache = new Map();
  function downstream(id, stack = new Set()) {
    if (cache.has(id)) return cache.get(id);
    if (stack.has(id)) return 0;
    stack.add(id);
    const dependents = reverse.get(id) || new Set();
    const all = new Set(dependents);
    for (const d of dependents) {
      const sub = downstreamSet(d, stack);
      for (const s of sub) all.add(s);
    }
    stack.delete(id);
    cache.set(id, all.size);
    return all.size;
  }
  const setCache = new Map();
  function downstreamSet(id, stack) {
    if (setCache.has(id)) return setCache.get(id);
    if (stack.has(id)) return new Set();
    stack.add(id);
    const deps = reverse.get(id) || new Set();
    const all = new Set(deps);
    for (const d of deps) {
      const sub = downstreamSet(d, stack);
      for (const s of sub) all.add(s);
    }
    stack.delete(id);
    setCache.set(id, all);
    return all;
  }
  const counts = new Map();
  for (const n of nodes) counts.set(n.id, downstream(n.id));
  return counts;
}

// Item-name -> candidate DAG keys. Heuristic: lowercase snake name to match
// item_unlock:<name> style. Drop table entries carry `name: 'Abyssal whip'` so
// we snake-case it. Skips coins / bones / generic runes.
function itemNameToUnlockKey(name) {
  if (!name) return null;
  const s = String(name).trim().toLowerCase();
  if (/^(coins?|bones?|big bones|ashes?|nothing|empty vial|vial of water)$/.test(s)) return null;
  // Drop trailing (4) / (3) etc potion suffixes
  const cleaned = s.replace(/\([^)]+\)$/, '').trim();
  return 'item_unlock:' + cleaned.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

// Baseline downstream value for staple drops (coins, bones, common runes) so
// every activity registers nonzero power.
const BASELINE_ITEM_VALUE = {
  'Coins': 0.5,
  'Bones': 0.5,
  'Big bones': 0.8,
  'Dragon bones': 2.0,
  'Wyvern bones': 2.0,
  'Air rune': 0.5, 'Water rune': 0.5, 'Earth rune': 0.5, 'Fire rune': 0.5,
  'Mind rune': 0.5, 'Body rune': 0.5, 'Chaos rune': 1.0, 'Death rune': 1.5,
  'Nature rune': 1.5, 'Law rune': 1.5, 'Blood rune': 2.0, 'Wrath rune': 2.5,
};

// Equipment-id -> item value lookup, populated lazily. Used to add a scaled
// gp-value signal when an item is in equipment.json but not in the DAG.
let EQUIPMENT_BY_NAME = null;
function getEquipmentValue(name) {
  if (!EQUIPMENT_BY_NAME) {
    EQUIPMENT_BY_NAME = new Map();
    try {
      const eq = JSON.parse(fs.readFileSync(path.join(DATA, 'items', 'equipment.json'), 'utf8'));
      for (const it of eq) {
        if (it.name) EQUIPMENT_BY_NAME.set(String(it.name).toLowerCase(), it.value || 0);
        // also index by id with underscores->spaces for best-effort match
      }
    } catch (e) { /* ignore */ }
  }
  return EQUIPMENT_BY_NAME.get(String(name || '').toLowerCase()) || 0;
}

// Scale a raw gp-value into the power signal space. Log-scaled so a 1.4B
// twisted bow doesn't nuke the ranking.
function gpToPowerUnits(gp) {
  if (gp <= 0) return 0;
  // log10 mapping: 100gp -> 0.1, 10k -> 1, 1M -> 3, 100M -> 5, 1B -> 6
  return Math.max(0, Math.log10(gp) - 1);
}

// Rough kills-per-hour heuristic — mirrors `combatPerHourFromStats` but
// re-declared so annotatePower doesn't depend on the monster-parse pass.
function kphFromCombat(combat) {
  if (combat < 20) return 500;
  if (combat < 50) return 350;
  if (combat < 100) return 220;
  if (combat < 200) return 150;
  if (combat < 400) return 80;
  if (combat < 600) return 40;
  return 25;
}

// Parse every mob()/mega()/defineNpc definition's drop table and annotate
// matching catalog entries with expected_power_per_hour.
function annotatePowerPerHour(catalog, downstreamCounts) {
  // Build a lookup: activity_id -> catalog entry.
  const byActivityId = new Map();
  for (const e of catalog) byActivityId.set(e.activity_id, e);

  // Pass: parse every aelgard + inferno + crystal_wyrm file for drop tables
  // associated with each monster id.
  const ROOTS = [
    path.join(REPO_ROOT, 'src', 'content', 'aelgard'),
    path.join(REPO_ROOT, 'src', 'content', 'inferno'),
    path.join(REPO_ROOT, 'src', 'content', 'crystal_wyrm'),
  ];

  let annotated = 0;
  let zeroPower = 0;
  for (const root of ROOTS) {
    if (!fs.existsSync(root)) continue;
    for (const f of fs.readdirSync(root).filter(n => /\.js$/.test(n))) {
      const src = fs.readFileSync(path.join(root, f), 'utf8');

      // Pattern A: mob('id', {body}, {drops-object}). We already scan the def
      // body in collectMonstersAndBosses — here we need the SECOND-arg drops.
      // The drop-object carries `always:[...]`, `main:[...]`, `tertiary:[...]`.
      // We locate each mob() call and parse both arg-bodies.
      const mobRe = /(?<![a-zA-Z_.])mob\(\s*'([a-z0-9_]+)'\s*,\s*/g;
      let mm;
      while ((mm = mobRe.exec(src))) {
        const id = mm[1];
        const firstBraceStart = src.indexOf('{', mm.index + mm[0].length - 1);
        if (firstBraceStart === -1) continue;
        const firstEnd = balancedEnd(src, firstBraceStart);
        if (firstEnd === -1) continue;
        // Look for the second-arg brace (after the comma)
        let cursor = firstEnd + 1;
        while (cursor < src.length && /\s/.test(src[cursor])) cursor++;
        if (src[cursor] !== ',') { annotateFromDrops(id, null, byActivityId, downstreamCounts, (res) => { annotated += res.ok; zeroPower += res.zero; }); continue; }
        cursor++;
        while (cursor < src.length && /\s/.test(src[cursor])) cursor++;
        if (src[cursor] !== '{') continue;
        const secondEnd = balancedEnd(src, cursor);
        const dropBody = src.slice(cursor + 1, secondEnd);
        const drops = parseDropSections(dropBody);
        const res = annotateFromDrops(id, drops, byActivityId, downstreamCounts);
        annotated += res.ok; zeroPower += res.zero;
      }

      // Pattern B: mega({ id: 'x', ..., always_drops:[...], drops:[...], unique_drops:[...] })
      const megaRe = /(?<![a-zA-Z_.])mega\(\s*\{/g;
      let meg;
      while ((meg = megaRe.exec(src))) {
        const bodyStart = src.indexOf('{', meg.index);
        const bodyEnd = balancedEnd(src, bodyStart);
        if (bodyEnd === -1) continue;
        const body = src.slice(bodyStart + 1, bodyEnd);
        const id = valStr(body, 'id');
        if (!id) continue;
        const drops = parseMegaDrops(body);
        const res = annotateFromDrops(id, drops, byActivityId, downstreamCounts);
        annotated += res.ok; zeroPower += res.zero;
      }

      // Pattern C: boss('id', {body}, {drops}) — same shape as mob.
      const bossRe = /(?<![a-zA-Z_.])boss\(\s*'([a-z0-9_]+)'\s*,\s*/g;
      let bm;
      while ((bm = bossRe.exec(src))) {
        const id = bm[1];
        const firstBraceStart = src.indexOf('{', bm.index + bm[0].length - 1);
        if (firstBraceStart === -1) continue;
        const firstEnd = balancedEnd(src, firstBraceStart);
        let cursor = firstEnd + 1;
        while (cursor < src.length && /\s/.test(src[cursor])) cursor++;
        if (src[cursor] !== ',') continue;
        cursor++;
        while (cursor < src.length && /\s/.test(src[cursor])) cursor++;
        if (src[cursor] !== '{') continue;
        const secondEnd = balancedEnd(src, cursor);
        const dropBody = src.slice(cursor + 1, secondEnd);
        const drops = parseDropSections(dropBody);
        const res = annotateFromDrops(id, drops, byActivityId, downstreamCounts);
        annotated += res.ok; zeroPower += res.zero;
      }
    }
  }

  // Activities without drop tables get a low default based on intensity and
  // activity-type. Raid/instance entries at int 9-10 get a nonzero baseline.
  for (const e of catalog) {
    if (e.expected_power_per_hour == null) {
      if (e.activity_type === 'instance' || e.activity_type === 'raid_boss') {
        e.expected_power_per_hour = Math.round((e.intensity || 5) * 12);
      } else {
        e.expected_power_per_hour = 0;
      }
    }
  }

  return { annotated, zeroPower };
}

function balancedEnd(src, start) {
  if (src[start] !== '{') return -1;
  let depth = 0;
  for (let i = start; i < src.length; i++) {
    const c = src[i];
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) return i; }
    else if (c === '/' && src[i + 1] === '/') { while (i < src.length && src[i] !== '\n') i++; }
    else if (c === '/' && src[i + 1] === '*') {
      i += 2;
      while (i < src.length - 1 && !(src[i] === '*' && src[i + 1] === '/')) i++;
      i++;
    } else if (c === "'" || c === '"') {
      const q = c; i++;
      while (i < src.length && src[i] !== q) { if (src[i] === '\\') i++; i++; }
    }
  }
  return -1;
}

// Parse a mob/boss second-arg drop body: { always:[...], main:[...], tertiary:[...] }
function parseDropSections(body) {
  return {
    always: extractEntries(body, 'always'),
    main: extractEntries(body, 'main'),
    tertiary: extractEntries(body, 'tertiary'),
  };
}

// Parse mega()'s inline always_drops / drops / unique_drops with `rarity:`.
function parseMegaDrops(body) {
  const always = extractArray(body, 'always_drops');
  const drops = extractArray(body, 'drops');
  const unique = extractArray(body, 'unique_drops');
  const RARITY_WEIGHT = { always: null, common: 25, uncommon: 10, rare: 4, very_rare: 1 };
  const main = [];
  const tertiary = [];
  const alw = [];
  for (const d of always) alw.push({ name: d.name, weight: null, quantity: d.quantity });
  for (const d of drops) {
    if (d.rarity === 'always') { alw.push({ name: d.name, weight: null, quantity: d.quantity }); continue; }
    const weight = Number(d.weight) || RARITY_WEIGHT[d.rarity] || 10;
    main.push({ name: d.name, weight, quantity: d.quantity });
  }
  for (const d of unique) {
    tertiary.push({ name: d.name, chance: Number(d.chance) || 1024, quantity: [1, 1] });
  }
  return { always: alw, main, tertiary };
}

// Pull an array of { name, weight?, chance?, quantity? } from a section
function extractEntries(body, key) {
  const re = new RegExp(`\\b${key}:\\s*\\[`);
  const m = body.match(re);
  if (!m) return [];
  const startIdx = m.index + m[0].length - 1;
  const endIdx = findArrayEnd(body, startIdx);
  if (endIdx === -1) return [];
  const section = body.slice(startIdx + 1, endIdx);
  return parseEntryObjects(section);
}

function extractArray(body, key) {
  const re = new RegExp(`\\b${key}:\\s*\\[`);
  const m = body.match(re);
  if (!m) return [];
  const startIdx = m.index + m[0].length - 1;
  const endIdx = findArrayEnd(body, startIdx);
  if (endIdx === -1) return [];
  const section = body.slice(startIdx + 1, endIdx);
  return parseEntryObjects(section);
}

function findArrayEnd(s, startIdx) {
  if (s[startIdx] !== '[') return -1;
  let depth = 0;
  for (let i = startIdx; i < s.length; i++) {
    const c = s[i];
    if (c === '[') depth++;
    else if (c === ']') { depth--; if (depth === 0) return i; }
    else if (c === "'" || c === '"') {
      const q = c; i++;
      while (i < s.length && s[i] !== q) { if (s[i] === '\\') i++; i++; }
    }
  }
  return -1;
}

function parseEntryObjects(s) {
  // Each entry: { name: '..', weight: N, min: N, max: N } or chance:N
  const out = [];
  let depth = 0, start = -1;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '{') { if (depth === 0) start = i; depth++; }
    else if (c === '}') { depth--; if (depth === 0 && start !== -1) { out.push(parseOneEntry(s.slice(start, i + 1))); start = -1; } }
    else if (c === "'" || c === '"') {
      const q = c; i++;
      while (i < s.length && s[i] !== q) { if (s[i] === '\\') i++; i++; }
    }
  }
  return out;
}

function parseOneEntry(src) {
  const name = (src.match(/\bname:\s*(['"])([^'"]+?)\1/) || [])[2] || null;
  const weight = Number((src.match(/\bweight:\s*(\d+)/) || [])[1]) || null;
  const chance = Number((src.match(/\bchance:\s*(\d+)/) || [])[1]) || null;
  const min = Number((src.match(/\bmin:\s*(\d+)/) || [])[1]) || 1;
  const max = Number((src.match(/\bmax:\s*(\d+)/) || [])[1]) || 1;
  const quantity = (src.match(/\bquantity:\s*\[\s*(\d+)\s*,\s*(\d+)\s*\]/) || null);
  const rarity = (src.match(/\brarity:\s*(['"])([^'"]+?)\1/) || [])[2] || null;
  return {
    name, weight, chance, rarity,
    quantity: quantity ? [Number(quantity[1]), Number(quantity[2])] : [min, max],
  };
}

function dropValue(name, downstreamCounts) {
  if (!name) return 0;
  let power = 0;
  // 1. Progression-DAG downstream count — the primary signal. When the item
  //    unlocks content (fire cape -> inferno, abyssal whip -> bossing
  //    rotations, etc.) this is nonzero. Currently most item_unlock nodes are
  //    leaves so this contributes 0, but preserved so future DAG authors can
  //    raise these numbers without changing the planner.
  const key = itemNameToUnlockKey(name);
  if (key && downstreamCounts.has(key)) {
    power += downstreamCounts.get(key);
  }
  // 2. Equipment value — scaled log(gp). Makes high-tier unique drops register
  //    above coin/bone drops so boss power/hr correlates with drop-table worth.
  const gpVal = getEquipmentValue(name);
  if (gpVal > 0) power += gpToPowerUnits(gpVal);
  // 3. Baseline constants for coins/bones/runes so every activity registers nonzero.
  for (const [k, v] of Object.entries(BASELINE_ITEM_VALUE)) {
    if (String(name).toLowerCase() === k.toLowerCase()) return power + v;
  }
  // 4. Unknown named drop — small default (these are reagent / named-unique
  //    drops that exist in content but not yet in equipment.json or the DAG.
  //    Slight nonzero signal so the entry registers as "has drops".
  return power + 0.1;
}

function annotateFromDrops(monsterId, drops, byActivityId, downstreamCounts) {
  const activityId = `kill_${monsterId}`;
  const entry = byActivityId.get(activityId);
  if (!entry) return { ok: 0, zero: 0 };
  if (!drops) {
    entry.expected_power_per_hour = 0;
    return { ok: 0, zero: 1 };
  }

  // Compute per-drop value * drop_rate
  // rate(always) = 1.0
  // rate(main) = weight / totalMainWeight
  // rate(tertiary) = 1 / chance
  let perKillPower = 0;
  for (const d of drops.always || []) perKillPower += dropValue(d.name, downstreamCounts) * 1.0;
  const totalMainWeight = (drops.main || []).reduce((s, d) => s + (Number(d.weight) || 0), 0);
  if (totalMainWeight > 0) {
    for (const d of drops.main || []) {
      if (!d.name || /^nothing$/i.test(d.name)) continue;
      const rate = (Number(d.weight) || 0) / totalMainWeight;
      perKillPower += dropValue(d.name, downstreamCounts) * rate;
    }
  }
  for (const d of drops.tertiary || []) {
    const rate = 1 / Math.max(1, Number(d.chance) || 1024);
    perKillPower += dropValue(d.name, downstreamCounts) * rate;
  }

  // Extract combat level from entry.notes (`combat NN hp ...`) to estimate kph.
  const combat = Number((String(entry.notes || '').match(/combat\s+(\d+)/) || [])[1]) || 50;
  const kph = kphFromCombat(combat);
  entry.expected_power_per_hour = Math.round(perKillPower * kph * 100) / 100;
  if (entry.expected_power_per_hour <= 0.001) {
    // Ensure monotonic >0 for activities with at least one drop
    if (perKillPower > 0) entry.expected_power_per_hour = Math.round(perKillPower * kph * 100) / 100;
    else return { ok: 1, zero: 1 };
  }
  return { ok: 1, zero: 0 };
}

// ══════════════════════════════════════════════════════════════════════════════
// Main
// ══════════════════════════════════════════════════════════════════════════════

function main() {
  const catalog = [];
  console.log('[intensity] gathering skill actions...');
  const skills = collectSkillActions(catalog);
  console.log(`  ${skills} skill actions`);

  console.log('[intensity] gathering data/methods/...');
  const methods = collectMethodFiles(catalog);
  console.log(`  ${methods} detailed methods`);

  console.log('[intensity] gathering monsters + bosses...');
  const mobs = collectMonstersAndBosses(catalog);
  console.log(`  ${mobs} monster/boss entries`);

  console.log('[intensity] gathering training-methods.js nodes...');
  const tm = collectTrainingMethods(catalog);
  console.log(`  ${tm} training-method nodes`);

  console.log('[intensity] gathering region rel.defineTrainingMethod calls...');
  const rtm = collectRegionTrainingMethods(catalog);
  console.log(`  ${rtm} region training-method entries`);

  console.log('[intensity] gathering Inferno...');
  const inferno = collectInferno(catalog);
  console.log(`  ${inferno} Inferno mobs + instances`);

  console.log('[intensity] gathering Crystal Wyrm arena...');
  const wyrm = collectCrystalWyrm(catalog);
  console.log(`  ${wyrm} Crystal Wyrm mobs`);

  console.log('[intensity] gathering minigames...');
  const mini = collectMinigames(catalog);
  console.log(`  ${mini} minigames`);

  console.log('[intensity] gathering raid bosses...');
  const raids = collectRaids(catalog);
  console.log(`  ${raids} raid bosses`);

  // Deduplicate by activity_id, prefer later entries (agent 1 methods override manifest entries).
  const byId = new Map();
  for (const e of catalog) byId.set(e.activity_id, e);
  const dedup = [...byId.values()];

  // C14: stub-gp re-derivation. Training-knob entries came with perHour as item
  // quantity but parsed as coin rate, yielding 1-999 gp/hr stubs. Re-derive
  // from skill baseline × intensity scale. See scripts/rederive-gp-per-hr.js.
  const rederiver = require('./rederive-gp-per-hr.js');
  let rederived = 0;
  for (const e of dedup) {
    if (e.activity_type !== 'skill_method') continue;
    const gp = Number(e.base_gp_per_hour) || 0;
    if (gp < 1 || gp >= 1000) continue;
    e.base_gp_per_hour = rederiver.rederiveGp(e);
    e._gp_rederived = true;
    rederived++;
  }
  console.log(`[intensity] rederived ${rederived} stub gp/hr entries (C14)`);

  const out = {
    generated_at: new Date().toISOString(),
    total_activities: dedup.length,
    intensity_taxonomy: {
      1: 'pure AFK (click every 30s+)',
      2: 'light interaction (click every 10-20s)',
      3: 'attentive skilling (active loop, cook+bank)',
      4: 'tick-locked skilling / active low combat',
      5: 'active combat / mid-tick skilling',
      6: 'prayer-flick combat / 3-tick mining',
      7: 'PvM with rotation',
      8: 'prayer+swap PvM / high-stakes slayer',
      9: 'raid rotation / coordinated',
      10: 'Inferno / max-effort PvM',
    },
    activities: dedup,
  };

  // C16/C17/H13/H17/H18/M7/M12/M17 — run the misery-remediation codemod
  // in-process BEFORE writing the catalog + report. This keeps the fixes
  // deterministic on every build.
  const codemod = require('./codemod-misery-buff.js');
  const codemodCounts = codemod.applyAll(out.activities);
  console.log(`[intensity] codemod: canon=${codemodCounts.canon} m17=${codemodCounts.m17} c17=${codemodCounts.c17} h13=${codemodCounts.h13} h17=${codemodCounts.h17} c16=${codemodCounts.c16}`);

  // burn-wave0 Task 17 + 18 — append travel cost and tradeoff-economics
  // fields to every activity. See scripts/rederive-effective-xp.js for the
  // formula and scripts/annotate-methods-travel-tradeoff.js for the source
  // of the per-method annotations (populates data/methods/*.json).
  const effectiveRederiver = require('./rederive-effective-xp.js');
  const effLog = effectiveRederiver.rederive(out);
  console.log(`[intensity] effective-xp rederive: ${effLog.appended_annotation} from methods, ${effLog.filled_default} default-filled`);

  // v0.9-waveC Task #19 — niche-power dimension: annotate combat activities
  // with expected_power_per_hour = kph × sum(drop_rate × downstream_dag_value).
  // Reads progression-dag.json for downstream counts.
  console.log('[intensity] computing expected_power_per_hour...');
  const downstreamCounts = buildDownstreamIndex();
  console.log(`  loaded ${downstreamCounts.size} DAG nodes for downstream lookup`);
  const powerLog = annotatePowerPerHour(out.activities, downstreamCounts);
  console.log(`  ${powerLog.annotated} activities annotated, ${powerLog.zeroPower} left at zero`);

  fs.writeFileSync(path.join(DATA, 'intensity-catalog.json'), JSON.stringify(out, null, 2));

  const report = computeMiseryAndGaps(dedup);
  const md = renderReport(out, report);
  fs.writeFileSync(path.join(DATA, 'intensity-catalog-report.md'), md);

  console.log(`[intensity] wrote data/intensity-catalog.json (${dedup.length} entries)`);
  console.log(`[intensity] wrote data/intensity-catalog-report.md`);
  console.log(`[intensity] misery zones after codemod: ${report.miseryZones.length}`);
}

function renderReport(out, report) {
  const lines = [];
  lines.push('# Intensity Catalog Report');
  lines.push('');
  lines.push(`Generated ${out.generated_at}. ${out.total_activities} activities indexed.`);
  lines.push('');
  lines.push('## Intensity band histogram');
  lines.push('');
  lines.push('| Band | Total | Skilling | Combat | Skilling Median XP/hr | Combat Median XP/hr |');
  lines.push('|------|-------|----------|--------|----------------------|--------------------|');
  for (let i = 1; i <= 10; i++) {
    const b = report.bands[i] || { count: 0, skilling_count: 0, combat_count: 0, median_skilling_xp_per_hour: 0, median_combat_xp_per_hour: 0 };
    lines.push(`| ${i} | ${b.count} | ${b.skilling_count} | ${b.combat_count} | ${b.median_skilling_xp_per_hour} | ${b.median_combat_xp_per_hour} |`);
  }
  lines.push('');
  lines.push('_Total counts include minigames, composites, and combat-manifest swing entries. Skilling/Combat columns count only activities eligible for misery comparison._');
  lines.push('');
  lines.push('## Content gaps (bands with <5 activities)');
  lines.push('');
  if (report.gaps.length === 0) {
    lines.push('_None. Every intensity band has >=5 activities._');
  } else {
    for (const g of report.gaps) lines.push(`- Band ${g.band}: ${g.count} activities (need ${5 - g.count} more)`);
  }
  lines.push('');
  lines.push('## Misery zones (activities >30% below their band median)');
  lines.push('');
  if (report.miseryZones.length === 0) {
    lines.push('_None. All activities within 30% of their band median._');
  } else {
    lines.push(`Total: **${report.miseryZones.length}** misery entries across bands (family-aware: skilling vs combat medians computed separately).`);
    lines.push('');
    lines.push('### Top 20 worst offenders');
    lines.push('');
    lines.push('| Activity | Band | Family | Skill | Deficit % | XP/hr | Fam.Median | Source |');
    lines.push('|---|---|---|---|---|---|---|---|');
    for (const m of report.miseryZones.slice(0, 20)) {
      lines.push(`| ${m.activity_id} | ${m.band} | ${m.family} | ${m.skill} | -${m.deficit_pct}% | ${m.xp_per_hour} | ${m.band_family_median_xp_per_hour} | ${m.source_file} |`);
    }
  }
  lines.push('');
  lines.push('## Per-skill coverage matrix');
  lines.push('');
  lines.push('| Skill | Bands covered | Bands missing |');
  lines.push('|---|---|---|');
  for (const s of Object.keys(report.skillCoverage).sort()) {
    const c = report.skillCoverage[s];
    lines.push(`| ${s} | ${c.bands_covered.join(', ')} | ${c.bands_missing.join(', ') || 'none'} |`);
  }
  lines.push('');

  // v0.9-waveC Task #19 — niche-power: top-20 activities by expected_power_per_hour
  const poweredActs = (out.activities || [])
    .filter(a => Number(a.expected_power_per_hour || 0) > 0)
    .sort((a, b) => Number(b.expected_power_per_hour) - Number(a.expected_power_per_hour));
  lines.push('## Top 20 activities by expected_power_per_hour');
  lines.push('');
  lines.push('power = kph × sum(drop_rate × downstream_dag_value). Signals which kills the planner should weight above pure xp/gp when the account needs content-gating unlocks.');
  lines.push('');
  if (poweredActs.length === 0) {
    lines.push('_No activities registered nonzero power-per-hour. Check progression-dag.json coverage of item_unlock nodes._');
  } else {
    lines.push('| Rank | Activity | Type | Region | Intensity | XP/hr | GP/hr | Power/hr |');
    lines.push('|---|---|---|---|---|---|---|---|');
    for (let i = 0; i < Math.min(20, poweredActs.length); i++) {
      const a = poweredActs[i];
      lines.push(`| ${i + 1} | ${a.activity_id} | ${a.activity_type} | ${a.region} | ${a.intensity} | ${a.base_xp_per_hour} | ${a.base_gp_per_hour} | ${a.expected_power_per_hour} |`);
    }
  }
  lines.push('');
  lines.push(`_Total activities with nonzero power: **${poweredActs.length}** / ${out.activities.length}._`);
  lines.push('');
  lines.push('## Per-region coverage matrix');
  lines.push('');
  lines.push('| Region | # Activities | Bands covered | Bands missing |');
  lines.push('|---|---|---|---|');
  // Sort by aelgard canonical order + then alpha
  const regOrder = ['heartlands','sootworks','moryskah','boneyard','glass_desert','saltbrine','veilwood','inkweald','wilds'];
  const regSorted = Object.keys(report.regionCoverage).sort((a, b) => {
    const ai = regOrder.indexOf(a); const bi = regOrder.indexOf(b);
    if (ai >= 0 && bi >= 0) return ai - bi;
    if (ai >= 0) return -1;
    if (bi >= 0) return 1;
    return a.localeCompare(b);
  });
  for (const r of regSorted) {
    const c = report.regionCoverage[r];
    // Skip very-small/noise region buckets.
    if (c.total_activities < 5 && !regOrder.includes(r)) continue;
    lines.push(`| ${r} | ${c.total_activities} | ${c.bands_covered.join(', ')} | ${c.bands_missing.join(', ') || 'none'} |`);
  }
  lines.push('');
  return lines.join('\n');
}

main();
