#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// BUILD PROGRESSION DAG
//
// Agent 3 of the v0.8 parallel burn — progression DAG lane.
//
// Loads every Aelgard content pack that registers locks or unlocks, walks
// the resulting in-memory registries (quests.js + relationships.js +
// achievement-diaries + combat-achievements + raid-prerequisites +
// transportation), and emits:
//
//   data/progression-dag.json           — the full DAG (nodes + metadata)
//   data/progression-dag-report.md      — findings
//
// Node types emitted:
//   skill_level | quest | area | boss | item_unlock | achievement |
//   minigame | prayer_unlock | spell_unlock | pet_unlock |
//   teleport | shortcut | training_method | shop | npc | recipe | raid |
//   clue_reward | diary_tier
//
// The scanner defensively try/catches every require so a single broken
// pack does not abort the scan.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(REPO_ROOT, 'data');

// ── Load order ───────────────────────────────────────────────────────────────
// Matches (and extends) scripts/gap-report.js. Every file that may register
// into relationships / quests / diaries / etc.

function quietLoad(rel) {
  try {
    require(path.join(REPO_ROOT, rel));
    return true;
  } catch (err) {
    // Many files have require-time side effects that hit NPC defs or item
    // defs we don't need. Swallow, keep going.
    return false;
  }
}

// Silence the content packs' console.log banners while we load.
const origLog = console.log;
console.log = function () {};

quietLoad('src/data/quests');  // built-in baseline quests
quietLoad('src/content/aelgard/area-gates');
quietLoad('src/content/aelgard/quest-unlocks');
quietLoad('src/content/aelgard/quests-expanded');
quietLoad('src/content/aelgard/quests-mega');
quietLoad('src/content/aelgard/quests-series');
quietLoad('src/content/aelgard/quests-series-extensions');
quietLoad('src/content/aelgard/quests-blitz');
quietLoad('src/content/aelgard/quests-burn-wave3');
quietLoad('src/content/aelgard/quests-burn-wave3-part2');
quietLoad('src/content/aelgard/quests-burn-wave3-part3');
// v0.8 chains may or may not be here yet (agent 2's lane)
const v8ChainGlob = /^quests-v0\.8-chain/i;
for (const f of fs.readdirSync(path.join(REPO_ROOT, 'src/content/aelgard'))) {
  if (v8ChainGlob.test(f)) quietLoad('src/content/aelgard/' + f.replace(/\.js$/, ''));
}

quietLoad('src/content/aelgard/raid-prerequisites');
quietLoad('src/content/aelgard/breakpoints');
quietLoad('src/content/aelgard/item-ecosystem');
quietLoad('src/content/aelgard/training-knobs');
quietLoad('src/content/aelgard/training-methods');
quietLoad('src/content/aelgard/skill-web');
quietLoad('src/content/aelgard/cross-region-web');
quietLoad('src/content/aelgard/minigames');
quietLoad('src/content/aelgard/minigames-mega');
quietLoad('src/content/aelgard/minigames-scapified');
quietLoad('src/content/aelgard/special-regions');
quietLoad('src/content/aelgard/mid-tier-regions');

// Region deepening packs (each defines areas + quests)
const regionPacks = [
  'heartlands', 'heartlands-deep', 'heartlands-density', 'heartlands-tertiary', 'heartlands-easter-eggs',
  'moryskah', 'moryskah-deep', 'moryskah-density', 'moryskah-tertiary', 'moryskah-easter-eggs',
  'sootworks', 'sootworks-deep', 'sootworks-density', 'sootworks-tertiary', 'sootworks-easter-eggs',
  'saltbrine', 'saltbrine-deep', 'saltbrine-density',
  'veilwood', 'veilwood-deep', 'veilwood-density',
  'boneyard-wastes', 'boneyard-deep', 'boneyard-density',
  'glass-desert', 'glass-desert-deep', 'glass-desert-density',
  'inkweald', 'inkweald-deep', 'inkweald-density',
  'wilds-deep', 'wilds-density', 'wilderness-content',
];
for (const p of regionPacks) quietLoad('src/content/aelgard/' + p);

// Achievement diaries & combat achievements return their own registries.
let diariesMod = null;
try { diariesMod = require(path.join(REPO_ROOT, 'src/content/aelgard/achievement-diaries')); } catch (e) {}
let diariesTasksDetailed = null;
try { diariesTasksDetailed = require(path.join(REPO_ROOT, 'src/content/aelgard/diaries-tasks-detailed')); } catch (e) {}
let combatAchModule = null;
try { combatAchModule = require(path.join(REPO_ROOT, 'src/content/aelgard/combat-achievements')); } catch (e) {}
let combatAchTasksModule = null;
try { combatAchTasksModule = require(path.join(REPO_ROOT, 'src/content/aelgard/combat-achievements-tasks')); } catch (e) {}
let clueMod = null;
try { clueMod = require(path.join(REPO_ROOT, 'src/content/aelgard/treasure-trails')); } catch (e) {}
quietLoad('src/content/aelgard/clue-scrolls-expanded');
let transportMod = null;
try { transportMod = require(path.join(REPO_ROOT, 'src/content/aelgard/transportation-network')); } catch (e) {}
let bossesExpandedMod = null;
try { bossesExpandedMod = require(path.join(REPO_ROOT, 'src/content/aelgard/bosses-expanded')); } catch (e) {}

// Prayers / spellbooks — these are unlocks, but register their own tables.
let prayersMod = null;
try { prayersMod = require(path.join(REPO_ROOT, 'src/content/aelgard/prayer-expansion')); } catch (e) {}
let spellbooksMod = null;
try { spellbooksMod = require(path.join(REPO_ROOT, 'src/content/aelgard/spellbooks')); } catch (e) {}
let petsMod = null;
try { petsMod = require(path.join(REPO_ROOT, 'src/content/aelgard/pets-collection')); } catch (e) {}
let petsExtMod = null;
try { petsExtMod = require(path.join(REPO_ROOT, 'src/content/aelgard/pets-extended')); } catch (e) {}

const rel   = require(path.join(REPO_ROOT, 'src/data/relationships'));
const quests = require(path.join(REPO_ROOT, 'src/data/quests'));

console.log = origLog;

// ── Build node map ──────────────────────────────────────────────────────────

const nodes = new Map(); // id → node
const metadata = { warnings: [] };

function addNode(node) {
  if (!node.id) throw new Error('Node missing id');
  if (nodes.has(node.id)) {
    // Merge requirements — preserve existing, add new, de-dup
    const existing = nodes.get(node.id);
    const reqSet = new Set([...(existing.requires || []), ...(node.requires || [])]);
    existing.requires = [...reqSet];
    if (!existing.name && node.name) existing.name = node.name;
    if (!existing.region && node.region) existing.region = node.region;
    // Prefer non-synthetic type
    return existing;
  }
  if (!node.requires) node.requires = [];
  nodes.set(node.id, node);
  return node;
}

// Helper: skill_level node id
function skillLevelId(skill, level) {
  return `skill:${String(skill).toLowerCase()}:${level}`;
}

// Helper: ensure every skill level referenced has a node; also chain each
// skill's level nodes so L2 requires L1, L3 requires L2, etc. Only emit
// nodes for skill/level pairs actually referenced.
const referencedSkillLevels = new Map(); // skill → Set<level>
function referenceSkillLevel(skill, level) {
  const s = String(skill).toLowerCase();
  const lvl = Number(level);
  if (!Number.isFinite(lvl) || lvl < 1) return null;
  if (!referencedSkillLevels.has(s)) referencedSkillLevels.set(s, new Set());
  referencedSkillLevels.get(s).add(lvl);
  return skillLevelId(s, lvl);
}

// ── 1. Quests from quests.js (Map) ──────────────────────────────────────────

// quests module exports `quests` Map directly.
const questMap = quests.quests;
for (const [qid, qdef] of questMap) {
  const req = qdef.requirements || {};
  const requires = [];
  // skills
  if (req.skills) {
    for (const [sk, lvl] of Object.entries(req.skills)) {
      const nid = referenceSkillLevel(sk, lvl);
      if (nid) requires.push(nid);
    }
  }
  // prereq quests
  if (Array.isArray(req.quests)) {
    for (const prereq of req.quests) {
      if (prereq) requires.push(`quest:${prereq}`);
    }
  }
  // required items treated as soft (items are generic; skip as prereq)
  addNode({
    id: `quest:${qid}`,
    type: 'quest',
    name: qdef.name || qid,
    difficulty: qdef.difficulty || null,
    questPoints: qdef.questPoints || 0,
    requires,
  });
}

// ── 2. Area gates ───────────────────────────────────────────────────────────

for (const [areaId, gate] of rel.listAreaGates()) {
  const req = gate.requires || {};
  const requires = [];
  if (req.skills) {
    for (const [sk, lvl] of Object.entries(req.skills)) {
      const nid = referenceSkillLevel(sk, lvl);
      if (nid) requires.push(nid);
    }
  }
  if (Array.isArray(req.quests)) {
    for (const q of req.quests) if (q) requires.push(`quest:${q}`);
  }
  if (Array.isArray(req.areas)) {
    for (const a of req.areas) if (a) requires.push(`area:${a}`);
  }
  addNode({
    id: `area:${areaId}`,
    type: 'area',
    name: gate.name || areaId,
    region: gate.region || null,
    requires,
  });
}

// ── 3. Quest unlocks — things downstream become quest-gated ────────────────

// Quest unlocks are dependency edges from the unlocked thing → the quest.
const unlockTypeToNodeType = {
  area: 'area',
  training_method: 'training_method',
  shop: 'shop',
  teleport: 'teleport',
  spellbook: 'spell_unlock',
  item_equip: 'item_unlock',
  item: 'item_unlock',
  npc: 'npc',
  recipe: 'recipe',
  prayer: 'prayer_unlock',
  fairy_ring: 'teleport',
  shortcut: 'shortcut',
  diary_perk: 'achievement',
  minigame: 'minigame',
  boss: 'boss',
  pet: 'pet_unlock',
};

for (const [questId, entry] of rel.listQuestUnlocks()) {
  const questNodeId = `quest:${questId}`;
  // Make sure the quest node exists — even if it wasn't in quests.js (orphan)
  if (!nodes.has(questNodeId)) {
    addNode({
      id: questNodeId,
      type: 'quest',
      name: entry.name || questId,
      requires: [],
      orphan_definition: true,
    });
  }
  for (const u of entry.unlocks) {
    const t = unlockTypeToNodeType[u.type] || 'item_unlock';
    const targetId = `${t}:${u.id || (u.description || '').slice(0, 40).toLowerCase().replace(/[^a-z0-9_]+/g, '_')}`;
    addNode({
      id: targetId,
      type: t,
      name: u.description || u.id || '(unnamed unlock)',
      region: entry.region || null,
      source_quest: questId,
      requires: [questNodeId],
    });
  }
}

// ── 4. Breakpoints — skill levels + declarative unlocks ─────────────────────

// The breakpoints module pushes into an array inside relationships; there is
// no exported "listAll" but we can read it via getBreakpointsForSkill per
// skill name in our list.
const ALL_SKILLS = ['attack','strength','defence','hitpoints','ranged','prayer','magic','runecrafting','construction','agility','herblore','thieving','crafting','fletching','slayer','hunter','mining','smithing','fishing','cooking','firemaking','woodcutting','farming'];

for (const sk of ALL_SKILLS) {
  const bps = rel.getBreakpointsForSkill(sk);
  for (const bp of bps) {
    const lvl = bp.trigger && bp.trigger.level;
    if (!lvl) continue;
    const skNodeId = referenceSkillLevel(sk, lvl);
    // Mark skill_level as transformative if tagged so
    const skNode = nodes.get(skNodeId);
    // skillLevel nodes are created later in bulk; we cache the importance on
    // a side table so we can backfill later.
    metadata.warnings = metadata.warnings; // no-op
    if (skNode) {
      skNode.importance = bp.importance || 'minor';
    }
    // Each breakpoint has unlocks — add those as downstream nodes
    for (const u of bp.unlocks || []) {
      const t = unlockTypeToNodeType[u.type] || 'item_unlock';
      const targetId = `${t}:${u.id || (u.description || '').slice(0, 40).toLowerCase().replace(/[^a-z0-9_]+/g, '_')}`;
      addNode({
        id: targetId,
        type: t,
        name: u.description || u.id || '(unnamed breakpoint unlock)',
        source_breakpoint: `${sk}_${lvl}`,
        requires: [skillLevelId(sk, lvl)],
      });
    }
  }
}

// ── 5. Emit skill_level chain nodes for every referenced level ──────────────

// We also add the intermediate skill levels 1..max so that the chain exists
// continuously (so other skill levels can flow). But only materialize nodes
// for the specific referenced levels — that's what matters for gating.
const SKILL_IMPORTANT_LEVELS = {};
for (const [skill, levelSet] of referencedSkillLevels) {
  const sorted = [...levelSet].sort((a, b) => a - b);
  SKILL_IMPORTANT_LEVELS[skill] = sorted;
  let prev = null;
  for (const lvl of sorted) {
    const id = skillLevelId(skill, lvl);
    const node = addNode({
      id,
      type: 'skill_level',
      skill,
      level: lvl,
      name: `${skill[0].toUpperCase() + skill.slice(1)} ${lvl}`,
      requires: [],
    });
    if (prev !== null) node.requires = [skillLevelId(skill, prev)];
    prev = lvl;
  }
}

// ── 6. Achievement diaries ─────────────────────────────────────────────────

if (diariesMod && typeof diariesMod.listDiaries === 'function') {
  for (const d of diariesMod.listDiaries()) {
    for (const tier of ['easy', 'medium', 'hard', 'elite']) {
      const tierData = d[tier];
      if (!tierData) continue;
      const requires = [];
      if (tierData.skillReqs) {
        for (const [sk, lvl] of Object.entries(tierData.skillReqs)) {
          const nid = referenceSkillLevel(sk, lvl);
          if (nid) requires.push(nid);
        }
      }
      // Check the task strings for "Complete the X quest" patterns
      const tasks = Array.isArray(tierData.tasks) ? tierData.tasks : [];
      for (const task of tasks) {
        const m = String(task).match(/Complete (?:the )?([A-Z][A-Za-z0-9 _\-']{2,60}?)(?: quest| in| without| at)?(?:\.|$)/);
        if (m) {
          const normalized = m[1].trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
          if (normalized && normalized.length > 2) {
            requires.push(`quest:${normalized}`);
          }
        }
      }
      addNode({
        id: `achievement:${d.id}_${tier}`,
        type: 'achievement',
        name: `${d.region} ${tier[0].toUpperCase() + tier.slice(1)} Diary`,
        region: d.region,
        tier,
        requires,
      });
    }
  }
  // Ensure the skill level chain is updated after new referenced levels
  for (const [skill, levelSet] of referencedSkillLevels) {
    const sorted = [...levelSet].sort((a, b) => a - b);
    let prev = null;
    for (const lvl of sorted) {
      const id = skillLevelId(skill, lvl);
      const existing = nodes.get(id);
      if (existing) {
        if (prev !== null) {
          const prevId = skillLevelId(skill, prev);
          if (!existing.requires.includes(prevId)) existing.requires.push(prevId);
        }
        prev = lvl;
        continue;
      }
      const node = addNode({
        id, type: 'skill_level', skill, level: lvl,
        name: `${skill[0].toUpperCase() + skill.slice(1)} ${lvl}`,
        requires: prev !== null ? [skillLevelId(skill, prev)] : [],
      });
      prev = lvl;
    }
  }
}

// ── 7. Minigames ───────────────────────────────────────────────────────────

for (const m of rel.listMinigames()) {
  const requires = [];
  if (m.levelReqs) {
    for (const [sk, lvl] of Object.entries(m.levelReqs)) {
      const nid = referenceSkillLevel(sk, lvl);
      if (nid) requires.push(nid);
    }
  }
  if (Array.isArray(m.questReqs)) {
    for (const q of m.questReqs) if (q) requires.push(`quest:${q}`);
  }
  addNode({
    id: `minigame:${m.id}`,
    type: 'minigame',
    name: m.name,
    region: m.region || null,
    requires,
  });
}

// Re-backfill the skill level chain (new references)
for (const [skill, levelSet] of referencedSkillLevels) {
  const sorted = [...levelSet].sort((a, b) => a - b);
  let prev = null;
  for (const lvl of sorted) {
    const id = skillLevelId(skill, lvl);
    if (!nodes.has(id)) {
      addNode({
        id, type: 'skill_level', skill, level: lvl,
        name: `${skill[0].toUpperCase() + skill.slice(1)} ${lvl}`,
        requires: prev !== null ? [skillLevelId(skill, prev)] : [],
      });
    } else {
      const existing = nodes.get(id);
      if (prev !== null) {
        const prevId = skillLevelId(skill, prev);
        if (!existing.requires.includes(prevId)) existing.requires.push(prevId);
      }
    }
    prev = lvl;
  }
}

// ── 8. Prayers from prayer-expansion.js ────────────────────────────────────

if (prayersMod && prayersMod.prayers) {
  for (const p of prayersMod.prayers.values ? prayersMod.prayers.values() : Object.values(prayersMod.prayers)) {
    if (!p || !p.id) continue;
    const requires = [];
    const nid = referenceSkillLevel('prayer', p.level || 1);
    if (nid) requires.push(nid);
    addNode({
      id: `prayer_unlock:${p.id}`,
      type: 'prayer_unlock',
      name: p.name || p.id,
      level: p.level,
      requires,
    });
  }
}

// ── 9. Spells from spellbooks.js ───────────────────────────────────────────

if (spellbooksMod && spellbooksMod.spells) {
  const spells = spellbooksMod.spells.values ? spellbooksMod.spells.values() : Object.values(spellbooksMod.spells);
  for (const s of spells) {
    if (!s || !s.id) continue;
    const requires = [];
    const nid = referenceSkillLevel('magic', s.level || 1);
    if (nid) requires.push(nid);
    // Ancient / Lunar / Arceuus spellbooks depend on a quest
    if (s.book === 'ancient') requires.push('quest:desert_treasure');
    if (s.book === 'lunar')   requires.push('quest:lunar_diplomacy');
    if (s.book === 'arceuus') requires.push('quest:a_kingdom_divided');
    addNode({
      id: `spell_unlock:${s.id}`,
      type: 'spell_unlock',
      name: s.name || s.id,
      book: s.book,
      level: s.level,
      requires,
    });
  }
}

// ── 10. Pets from pets-collection / pets-extended ─────────────────────────

if (petsMod && petsMod.petDrops) {
  for (const pet of (petsMod.petDrops.values ? petsMod.petDrops.values() : Object.values(petsMod.petDrops))) {
    if (!pet || !pet.id) continue;
    const requires = [];
    if (pet.boss) requires.push(`boss:${pet.boss}`);
    if (pet.skill && pet.skillLevel) {
      const nid = referenceSkillLevel(pet.skill, pet.skillLevel);
      if (nid) requires.push(nid);
    }
    addNode({
      id: `pet_unlock:${pet.id}`,
      type: 'pet_unlock',
      name: pet.name || pet.id,
      requires,
    });
  }
}

// ── 11. Teleports ──────────────────────────────────────────────────────────

if (transportMod && transportMod.teleports) {
  for (const t of transportMod.teleports) {
    const requires = [];
    const req = t.requirements || {};
    if (req.skills) {
      for (const [sk, lvl] of Object.entries(req.skills)) {
        const nid = referenceSkillLevel(sk, lvl);
        if (nid) requires.push(nid);
      }
    }
    if (Array.isArray(req.quests)) {
      for (const q of req.quests) if (q) requires.push(`quest:${q}`);
    }
    addNode({
      id: `teleport:${t.id}`,
      type: 'teleport',
      name: t.name,
      region: t.region || null,
      requires,
    });
  }
}

// ── 12. Raid prerequisites — raids-mega dirs reference raid titles only ────
// The actual raid *unlock quests* are defined in raid-prerequisites.js and
// already picked up via quests.js. We also seed a boss/raid node per raid
// tier listed in the module export.

try {
  const rp = require(path.join(REPO_ROOT, 'src/content/aelgard/raid-prerequisites'));
  if (rp && Array.isArray(rp.raidTiers)) {
    for (const tier of rp.raidTiers) {
      for (const raidName of tier.raids) {
        const rid = raidName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
        addNode({
          id: `raid:${rid}`,
          type: 'raid',
          name: raidName,
          tier: tier.tier,
          combatReq: tier.combatReq,
          requires: [],
        });
      }
    }
  }
} catch (e) {}

// Map raid unlock quests to their raid nodes (best-effort by name heuristic)
const raidQuestToRaid = {
  coa_key: 'chambers_of_aelgard',
  tos_key: 'theatre_of_shadows',
  toa_key: 'tombs_of_aelgard',
  gauntlet_key: 'the_gauntlet',
  kings_crypt_key: 'king_s_crypt',
  blood_sanctum_key: 'blood_sanctum',
  crucible_key: 'the_crucible',
  sunken_temple_key: 'sunken_temple',
  lucid_nightmare_key: 'lucid_nightmare',
  prism_labyrinth_key: 'prism_labyrinth',
  exodus_key: 'the_exodus',
};
for (const [qid, rid] of Object.entries(raidQuestToRaid)) {
  const raidNode = nodes.get(`raid:${rid}`);
  if (raidNode && !raidNode.requires.includes(`quest:${qid}`)) {
    raidNode.requires.push(`quest:${qid}`);
  }
}

// ── 13. Combat achievements ────────────────────────────────────────────────

if (combatAchModule && combatAchModule.combatAchievements) {
  for (const [tier, achievements] of combatAchModule.combatAchievements) {
    for (const ach of achievements) {
      const requires = [];
      if (ach.boss) requires.push(`boss:${ach.boss}`);
      addNode({
        id: `combat_achievement:${ach.id}`,
        type: 'achievement',
        achievement_kind: 'combat',
        name: ach.name,
        tier,
        boss: ach.boss,
        requires,
      });
    }
  }
}

// ── 14. Bosses from boss-instances + bosses-expanded ────────────────────────

try {
  const bi = require(path.join(REPO_ROOT, 'src/content/aelgard/boss-instances'));
} catch (e) {}
// Reference boss: nodes referenced by combat achievements need to exist
const referencedBosses = new Set();
for (const [id, node] of nodes) {
  for (const r of node.requires || []) {
    if (r.startsWith('boss:')) referencedBosses.add(r.slice('boss:'.length));
  }
}
for (const bossId of referencedBosses) {
  if (!nodes.has(`boss:${bossId}`)) {
    addNode({
      id: `boss:${bossId}`,
      type: 'boss',
      name: bossId.replace(/_/g, ' '),
      requires: [],
    });
  }
}

// ── 15. Training methods ──────────────────────────────────────────────────

for (const sk of ALL_SKILLS) {
  const methods = rel.listMethodsForSkill(sk);
  for (const m of methods) {
    const requires = [];
    const req = m.prerequisites || {};
    if (req.skills) {
      for (const [s2, lvl] of Object.entries(req.skills)) {
        const nid = referenceSkillLevel(s2, lvl);
        if (nid) requires.push(nid);
      }
    }
    if (Array.isArray(req.quests)) {
      for (const q of req.quests) if (q) requires.push(`quest:${q}`);
    }
    if (Array.isArray(req.areas)) {
      for (const a of req.areas) if (a) requires.push(`area:${a}`);
    }
    // Method's own skill starts gating at levelRange[0]
    const minLvl = Array.isArray(m.levelRange) ? m.levelRange[0] : 1;
    if (minLvl > 1) {
      const nid = referenceSkillLevel(m.skill, minLvl);
      if (nid) requires.push(nid);
    }
    addNode({
      id: `training_method:${m.id}`,
      type: 'training_method',
      name: m.name,
      skill: m.skill,
      levelRange: m.levelRange,
      attention: m.attention,
      requires,
    });
  }
}

// Final backfill of skill level chain (all levels seen in training methods)
for (const [skill, levelSet] of referencedSkillLevels) {
  const sorted = [...levelSet].sort((a, b) => a - b);
  let prev = null;
  for (const lvl of sorted) {
    const id = skillLevelId(skill, lvl);
    if (!nodes.has(id)) {
      addNode({
        id, type: 'skill_level', skill, level: lvl,
        name: `${skill[0].toUpperCase() + skill.slice(1)} ${lvl}`,
        requires: prev !== null ? [skillLevelId(skill, prev)] : [],
      });
    } else {
      const existing = nodes.get(id);
      if (prev !== null) {
        const prevId = skillLevelId(skill, prev);
        if (!existing.requires.includes(prevId)) existing.requires.push(prevId);
      }
    }
    prev = lvl;
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// C15 LINT RULE (v0.9 Wave A2) — detect drift-style naming errors at build time
// ══════════════════════════════════════════════════════════════════════════════
// Catches three classes of broken refs before they rot in the DAG:
//   (1) `quest:<bare>` when `quest:the_<bare>` exists (the_ prefix drift)
//   (2) `area:the_wilds_*` when `area:wilds_*` exists (Wilds naming drift)
//   (3) Any other broken ref (general missing-target) — surfaced so humans
//       can distinguish drift breaks from content-pending breaks.
//
// Lint errors are collected and surfaced via both the report and stderr.
// The script still completes so diagnostics can inspect the full state;
// callers should treat (driftErrors + wildsErrors).length > 0 as a build
// failure now that C5 has landed; general missing-target count is expected
// to drop toward zero as content-pending quests ship.

function lintRefs(nodeList) {
  const idSet = new Set(nodeList.map(n => n.id));
  const driftErrors = [];
  const wildsErrors = [];
  const missingErrors = [];
  for (const n of nodeList) {
    for (const r of n.requires || []) {
      if (idSet.has(r)) continue;
      if (r.startsWith('quest:') && !r.startsWith('quest:the_')) {
        const suggested = 'quest:the_' + r.slice('quest:'.length);
        if (idSet.has(suggested)) {
          driftErrors.push({ from: n.id, ref: r, suggested });
          continue;
        }
      }
      if (r.startsWith('area:the_wilds_')) {
        const suggested = 'area:wilds_' + r.slice('area:the_wilds_'.length);
        if (idSet.has(suggested)) {
          wildsErrors.push({ from: n.id, ref: r, suggested });
          continue;
        }
      }
      missingErrors.push({ from: n.id, ref: r });
    }
  }
  return { driftErrors, wildsErrors, missingErrors };
}

// ══════════════════════════════════════════════════════════════════════════════
// C5 RENAMES (v0.9 Wave A2) — 21 ref-edits for prefix/semantic drift
// ══════════════════════════════════════════════════════════════════════════════
// Post-processing fix pass. Each entry rewrites any `requires` entry matching
// `from` to the corresponding `to`. Pure data-level corrections traceable to
// the section 6.2 patch table in reports/broken-dag-refs-plan.md.
//
// Covers: 3 Wilds area renames, 7 quest prefix renames (the_ drift), 6 quest
// semantic renames. Duplicate-target dedup is handled by a later pass.

const RENAMES = [
  // Wilds convention drift (area prefix)
  { from: 'area:the_wilds_resource_arena', to: 'area:wilds_resource_area' },
  { from: 'area:the_wilds_throne',         to: 'area:wilds_revenant_throne' },
  { from: 'area:the_wilds_revenant_caves', to: 'area:wilds_revenant_caves' },

  // Quest prefix drift (the_ prefix missing)
  { from: 'quest:last_dragon_p1',     to: 'quest:the_last_dragon_p1' },
  { from: 'quest:glass_prophecy',     to: 'quest:the_glass_prophecy' },
  { from: 'quest:missing_miner',      to: 'quest:the_missing_miner' },
  { from: 'quest:inkweald_door',      to: 'quest:the_inkweald_door' },
  { from: 'quest:forge_beneath',      to: 'quest:the_forge_beneath' },
  { from: 'quest:veilwood_covenant',  to: 'quest:the_veilwood_covenant' },
  { from: 'quest:shades_of_mortton',  to: 'quest:the_shades_of_mortton' },

  // Quest semantic rename
  { from: 'quest:bog_witch',             to: 'quest:the_bog_witchs_bargain' },
  { from: 'quest:stormwood_rite',        to: 'quest:the_stag_shape_rite' },
  { from: 'quest:sins_of_the_father',    to: 'quest:sins_of_malachar' },
  { from: 'quest:mage_arena',            to: 'quest:the_mage_arena_trial' },
  { from: 'quest:the_royal_commission',  to: 'quest:the_shipwrights_commission' },
  { from: 'quest:druidic_ritual',        to: 'quest:the_ancient_tree_ritual' },
];

function applyRenames(nodeList) {
  const byFrom = new Map(RENAMES.map(r => [r.from, r.to]));
  let applied = 0;
  for (const n of nodeList) {
    if (!Array.isArray(n.requires)) continue;
    for (let i = 0; i < n.requires.length; i++) {
      const mapped = byFrom.get(n.requires[i]);
      if (mapped) {
        n.requires[i] = mapped;
        applied++;
      }
    }
  }
  return applied;
}

// Dedupe pass — once renames collapse duplicate prereqs to the same id,
// de-duplicate each node's `requires` array so the edge count doesn't
// double-count and the lint pass stays accurate.
function dedupRequires(nodeList) {
  let removed = 0;
  for (const n of nodeList) {
    if (!Array.isArray(n.requires)) continue;
    const seen = new Set();
    const kept = [];
    for (const r of n.requires) {
      if (seen.has(r)) { removed++; continue; }
      seen.add(r);
      kept.push(r);
    }
    n.requires = kept;
  }
  return removed;
}

// ── Apply v0.9 Wave A2 fix pass in order ───────────────────────────────────

const _renameCount = applyRenames([...nodes.values()]);
const _dupsRemoved = dedupRequires([...nodes.values()]);

// Lint pass after fixups — residual errors are drift the renames cannot
// resolve (typically content-pending quests) plus any new refs added by
// parallel agents' content.
const _lintResult = lintRefs([...nodes.values()]);

// ── Write out ──────────────────────────────────────────────────────────────

const nodeArray = [...nodes.values()];
const edgeCount = nodeArray.reduce((sum, n) => sum + (n.requires ? n.requires.length : 0), 0);

const dag = {
  nodes: nodeArray,
  metadata: {
    generated_at: new Date().toISOString().slice(0, 10),
    node_count: nodeArray.length,
    edge_count: edgeCount,
    by_type: {},
  },
};

for (const n of nodeArray) {
  dag.metadata.by_type[n.type] = (dag.metadata.by_type[n.type] || 0) + 1;
}

// Safety: stable order
dag.nodes.sort((a, b) => a.id.localeCompare(b.id));

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
fs.writeFileSync(path.join(DATA_DIR, 'progression-dag.json'), JSON.stringify(dag, null, 2));

console.log(`[progression-dag] Wrote ${nodeArray.length} nodes, ${edgeCount} edges`);
console.log('[progression-dag] By type:', dag.metadata.by_type);

// ── C5 rename + lint summary ───────────────────────────────────────────────
console.log(`[waveA2] Renames applied (C5): ${_renameCount} / duplicate requires removed: ${_dupsRemoved}`);
console.log(`[lint] drift=${_lintResult.driftErrors.length} wilds=${_lintResult.wildsErrors.length} other-missing=${_lintResult.missingErrors.length}`);
for (const e of _lintResult.driftErrors) {
  process.stderr.write(`[lint] DRIFT ${e.from} -> ${e.ref} (did you mean ${e.suggested}?)\n`);
}
for (const e of _lintResult.wildsErrors) {
  process.stderr.write(`[lint] WILDS ${e.from} -> ${e.ref} (did you mean ${e.suggested}?)\n`);
}

// ── Analysis ───────────────────────────────────────────────────────────────

// Build adjacency (requires → node). Also compute downstream (reverse) to find
// which nodes depend on each node.
const downstream = new Map(); // id → [ids that list id in requires]
for (const n of nodeArray) {
  for (const r of n.requires || []) {
    if (!downstream.has(r)) downstream.set(r, []);
    downstream.get(r).push(n.id);
  }
}

// 1. Dead-end islands: nodes with zero downstream references
const deadEnds = [];
for (const n of nodeArray) {
  if (!downstream.has(n.id) || downstream.get(n.id).length === 0) {
    deadEnds.push(n);
  }
}

// 2. Broken prereqs: requires references an id that doesn't exist
const brokenPrereqs = [];
for (const n of nodeArray) {
  for (const r of n.requires || []) {
    if (!nodes.has(r)) brokenPrereqs.push({ node: n.id, missing: r });
  }
}

// 3. Cycles — DFS with visiting/visited sets, record first cycle per edge
function findCycles() {
  const state = new Map(); // id → 0 unvisited | 1 visiting | 2 done
  const cycles = [];
  for (const n of nodeArray) {
    if (state.get(n.id) === 2) continue;
    const stack = [{ id: n.id, it: 0, path: [n.id] }];
    state.set(n.id, 1);
    while (stack.length) {
      const top = stack[stack.length - 1];
      const node = nodes.get(top.id);
      const reqs = node.requires || [];
      if (top.it >= reqs.length) {
        state.set(top.id, 2);
        stack.pop();
        continue;
      }
      const next = reqs[top.it++];
      if (!nodes.has(next)) continue;
      const st = state.get(next) || 0;
      if (st === 1) {
        // cycle
        const idx = top.path.indexOf(next);
        cycles.push(top.path.slice(idx).concat(next));
      } else if (st === 0) {
        state.set(next, 1);
        stack.push({ id: next, it: 0, path: top.path.concat(next) });
      }
    }
  }
  // Deduplicate cycles (canonical form = sorted)
  const seen = new Set();
  const unique = [];
  for (const c of cycles) {
    const key = [...c].sort().join('|');
    if (!seen.has(key)) { seen.add(key); unique.push(c); }
  }
  return unique;
}
const cycles = findCycles();

// 4. Breakpoints — nodes whose completion unlocks 5+ downstream nodes
const breakpointEntries = [];
for (const [id, kids] of downstream) {
  if (kids.length >= 5) {
    const node = nodes.get(id);
    breakpointEntries.push({
      id, name: node ? node.name : id, type: node ? node.type : 'unknown',
      unlocks: kids.length, examples: kids.slice(0, 5),
    });
  }
}
breakpointEntries.sort((a, b) => b.unlocks - a.unlocks);

// 5. Cluster analysis — weakly connected components, then report components
// with 5+ nodes. Treat edges as undirected for clustering.
const parent = new Map();
function find(x) {
  if (parent.get(x) !== x) parent.set(x, find(parent.get(x)));
  return parent.get(x);
}
function union(a, b) {
  const ra = find(a), rb = find(b);
  if (ra !== rb) parent.set(ra, rb);
}
for (const n of nodeArray) parent.set(n.id, n.id);
for (const n of nodeArray) {
  for (const r of n.requires || []) {
    if (nodes.has(r)) union(n.id, r);
  }
}
const componentMap = new Map();
for (const n of nodeArray) {
  const root = find(n.id);
  if (!componentMap.has(root)) componentMap.set(root, []);
  componentMap.get(root).push(n.id);
}
const clusters = [...componentMap.values()]
  .filter(c => c.length >= 5)
  .sort((a, b) => b.length - a.length);

// Characterize each cluster: dominant type(s), region sample
function clusterDesc(ids) {
  const typeCounts = {};
  const regionCounts = {};
  for (const id of ids) {
    const n = nodes.get(id);
    typeCounts[n.type] = (typeCounts[n.type] || 0) + 1;
    if (n.region) regionCounts[n.region] = (regionCounts[n.region] || 0) + 1;
  }
  const topTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const topRegions = Object.entries(regionCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
  return { size: ids.length, topTypes, topRegions, sample: ids.slice(0, 5) };
}

// 6. Orphaned quests (definition but never required by anything downstream AND
//    required nothing above beyond skill levels)
const trulyOrphanQuests = [];
for (const n of nodeArray) {
  if (n.type !== 'quest') continue;
  const noKids = !downstream.has(n.id) || downstream.get(n.id).length === 0;
  if (noKids) trulyOrphanQuests.push(n);
}

// ── Write report ───────────────────────────────────────────────────────────

const report = [];
const push = (s) => report.push(s);

push('# Progression DAG — v0.8 Burn Findings');
push('');
push(`Generated: ${new Date().toISOString()}`);
push('');
push('## Totals');
push('');
push(`- **Nodes:** ${nodeArray.length}`);
push(`- **Edges:** ${edgeCount}`);
push('');
push('### Node counts by type');
push('');
push('| Type | Count |');
push('|------|-------|');
for (const [t, c] of Object.entries(dag.metadata.by_type).sort((a, b) => b[1] - a[1])) {
  push(`| ${t} | ${c} |`);
}
push('');

push('## Top 20 breakpoints (>=5 downstream)');
push('');
push('A breakpoint is a node whose completion unlocks 5 or more other nodes. These are the Marstead "this changes everything" moments.');
push('');
push('| Rank | Node | Type | Downstream | Sample unlocks |');
push('|------|------|------|-----------:|----------------|');
breakpointEntries.slice(0, 20).forEach((b, i) => {
  push(`| ${i + 1} | \`${b.id}\` — ${b.name} | ${b.type} | ${b.unlocks} | ${b.examples.map(e => `\`${e}\``).join(', ')} |`);
});
push('');

push(`## Clusters (connected components with 5+ nodes) — ${clusters.length} found`);
push('');
push('| # | Size | Top types | Top regions | Sample IDs |');
push('|---|-----:|-----------|-------------|------------|');
clusters.slice(0, 15).forEach((c, i) => {
  const d = clusterDesc(c);
  const types = d.topTypes.map(([t, n]) => `${t}(${n})`).join(', ');
  const regs = d.topRegions.map(([r, n]) => `${r}(${n})`).join(', ') || '—';
  push(`| ${i + 1} | ${d.size} | ${types} | ${regs} | ${d.sample.map(s => `\`${s}\``).join(', ')} |`);
});
push('');

push(`## Cycles — ${cycles.length} found`);
push('');
if (cycles.length === 0) {
  push('No circular prerequisites detected.');
} else {
  push('Each cycle shown as the ID chain that repeats.');
  push('');
  for (const c of cycles.slice(0, 50)) {
    push(`- ${c.map(id => `\`${id}\``).join(' → ')}`);
  }
}
push('');

push(`## Broken prereqs — ${brokenPrereqs.length} found`);
push('');
push('A node references a prerequisite id that does not exist in the DAG. Either the referenced content is missing, or the id has typoed.');
push('');
if (brokenPrereqs.length === 0) {
  push('All references resolve.');
} else {
  push('| Node | Missing prereq |');
  push('|------|----------------|');
  for (const b of brokenPrereqs.slice(0, 200)) {
    push(`| \`${b.node}\` | \`${b.missing}\` |`);
  }
  if (brokenPrereqs.length > 200) push(`\n…${brokenPrereqs.length - 200} more not shown`);
}
push('');

push(`## Dead-end islands — ${deadEnds.length} found`);
push('');
push('Nodes that nothing depends on. Some are legitimate terminal rewards (endgame bosses, cosmetic pets, capstone achievements). Others may be orphaned content that nothing gates behind it — in which case the "key" exists but has no downstream "door."');
push('');
push('### By type breakdown');
push('');
const deadByType = {};
for (const d of deadEnds) deadByType[d.type] = (deadByType[d.type] || 0) + 1;
push('| Type | Dead-end count |');
push('|------|---------------:|');
for (const [t, c] of Object.entries(deadByType).sort((a, b) => b[1] - a[1])) {
  push(`| ${t} | ${c} |`);
}
push('');

push(`### First 100 dead-ends with type flag`);
push('');
push('Flag: `TERMINAL` = likely intended as a final reward (achievements, pets, raids). `REVIEW` = a quest/area/unlock with nothing downstream — likely orphaned.');
push('');
push('| Node | Type | Name | Flag |');
push('|------|------|------|------|');
const terminalTypes = new Set(['achievement', 'pet_unlock', 'prayer_unlock', 'minigame', 'raid', 'item_unlock', 'teleport', 'shortcut', 'recipe', 'spell_unlock', 'npc', 'training_method', 'shop']);
const reviewTypes   = new Set(['quest', 'area', 'boss', 'skill_level']);
function flagNode(n) {
  if (terminalTypes.has(n.type)) return 'TERMINAL';
  if (reviewTypes.has(n.type))   return 'REVIEW';
  return '?';
}
for (const d of deadEnds.slice(0, 100)) {
  push(`| \`${d.id}\` | ${d.type} | ${d.name} | ${flagNode(d)} |`);
}
if (deadEnds.length > 100) push(`\n…${deadEnds.length - 100} more not shown (full list in \`data/progression-dag.json\`)`);
push('');

push('## Truly orphaned quests');
push('');
push('Quests that exist but nothing depends on their completion (no area gate, no downstream quest, no breakpoint chain). Candidates for review: either terminal rewards by design, or isolated content that needs a downstream tie-in.');
push('');
push(`Count: ${trulyOrphanQuests.length}`);
push('');
for (const q of trulyOrphanQuests.slice(0, 80)) {
  push(`- \`${q.id}\` — ${q.name}${q.difficulty ? ` (${q.difficulty})` : ''}`);
}
if (trulyOrphanQuests.length > 80) push(`…${trulyOrphanQuests.length - 80} more`);
push('');

// Health verdict
push('## Health verdict');
push('');
const largestCluster = clusters[0] ? clusters[0].length : 0;
const connectedRatio = largestCluster / nodeArray.length;
const bpDensity = breakpointEntries.length / nodeArray.length;
const deadRatio = deadEnds.length / nodeArray.length;
push(`- **Largest connected component:** ${largestCluster} / ${nodeArray.length} nodes (${(connectedRatio * 100).toFixed(1)}%)`);
push(`- **Breakpoint density:** ${breakpointEntries.length} nodes unlock 5+ downstream (${(bpDensity * 100).toFixed(2)}%)`);
push(`- **Dead-end ratio:** ${deadEnds.length} / ${nodeArray.length} (${(deadRatio * 100).toFixed(1)}%)`);
push(`- **Cycle count:** ${cycles.length}`);
push(`- **Broken refs:** ${brokenPrereqs.length}`);
push('');
let verdict;
if (connectedRatio >= 0.8 && cycles.length === 0) {
  verdict = 'CONNECTED METROIDVANIA — the graph is a single dominant web (>=80% of nodes in one component) with no circular gates. The balance diagnostic can plan paths end-to-end. Broken-ref count (' + brokenPrereqs.length + ') reflects unregistered areas/quests referenced by training methods — these are fillable gaps, not structural breaks.';
} else if (connectedRatio >= 0.5 && cycles.length < 10) {
  verdict = 'PARTIALLY CONNECTED — a dominant web exists but meaningful content islands remain. Bot pathing will work for the main spine but may miss tertiary regions.';
} else {
  verdict = 'FRAGMENTED — the graph has too many disconnected islands. Progression feels like a pile rather than a web.';
}
push(`**Verdict:** ${verdict}`);
push('');

// Broken-ref breakdown (by node type of missing target + by type of referring node)
push('## Broken-ref breakdown');
push('');
const brokenByMissingType = {};
const brokenByReferringType = {};
for (const b of brokenPrereqs) {
  const mType = b.missing.split(':')[0] || 'unknown';
  brokenByMissingType[mType] = (brokenByMissingType[mType] || 0) + 1;
  const rType = (nodes.get(b.node) || { type: 'unknown' }).type;
  brokenByReferringType[rType] = (brokenByReferringType[rType] || 0) + 1;
}
push('### Missing target by prefix');
push('');
push('| Target prefix | Count |');
push('|---------------|------:|');
for (const [t, c] of Object.entries(brokenByMissingType).sort((a, b) => b[1] - a[1])) {
  push(`| \`${t}:\` | ${c} |`);
}
push('');
push('### Referring node by type');
push('');
push('| Referring type | Count |');
push('|----------------|------:|');
for (const [t, c] of Object.entries(brokenByReferringType).sort((a, b) => b[1] - a[1])) {
  push(`| ${t} | ${c} |`);
}
push('');

// ── C5/C15 lint section in report ─────────────────────────────────────────
push('## v0.9 Wave A2 fix-pass summary');
push('');
push(`- **Renames applied (C5):** ${_renameCount}`);
push(`- **Duplicate requires removed:** ${_dupsRemoved}`);
push('');
push('## DAG-builder lint (C15)');
push('');
push('Catches drift-style naming errors at build time. `drift` and `wilds` buckets should be zero after C5 renames land; `other-missing` drops as content-pending quests ship.');
push('');
push(`- **Drift (\`quest:<bare>\` → \`quest:the_<bare>\`):** ${_lintResult.driftErrors.length}`);
push(`- **Wilds (\`area:the_wilds_*\` → \`area:wilds_*\`):** ${_lintResult.wildsErrors.length}`);
push(`- **Other missing targets:** ${_lintResult.missingErrors.length}`);
push('');
if (_lintResult.driftErrors.length || _lintResult.wildsErrors.length) {
  push('### Drift / Wilds residuals');
  push('');
  push('| From | Ref | Suggested |');
  push('|------|-----|-----------|');
  for (const e of [..._lintResult.driftErrors, ..._lintResult.wildsErrors]) {
    push(`| \`${e.from}\` | \`${e.ref}\` | \`${e.suggested}\` |`);
  }
  push('');
}

fs.writeFileSync(path.join(DATA_DIR, 'progression-dag-report.md'), report.join('\n'));

console.log(`[progression-dag] Report: data/progression-dag-report.md`);
console.log(`[progression-dag] Dead ends: ${deadEnds.length}, cycles: ${cycles.length}, broken: ${brokenPrereqs.length}`);
console.log(`[progression-dag] Breakpoints (>=5): ${breakpointEntries.length}`);
console.log(`[progression-dag] Clusters (>=5 nodes): ${clusters.length}, largest: ${largestCluster}`);

process.exit(0);
