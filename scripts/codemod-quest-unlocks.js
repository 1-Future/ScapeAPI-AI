#!/usr/bin/env node
/* eslint-disable no-console */
// ── Codemod: quest unlocks + chain_next (v0.9 Wave A1) ─────────────────────────
//
// Purpose:
//   - C1: Populate `unlocks: ["<dag_node_id>", ...]` for every quest by joining
//         the DAG's `source_quest` -> [node_id] reverse-map, plus parsing trailing
//         `// Unlocks: X` comments into a known-ref-prefix lookup.
//         STRICT MODE: refs are validated against data/progression-dag.json.
//         Unresolved refs are dropped from the written array and LOGGED to
//         reports/_c1_unresolved.md. No synthesized `<quest>_completion`
//         fallbacks — a quest with no resolvable refs gets `unlocks: []`.
//   - C2: Populate `chain_next: "<next_quest_id>"` for multi-part chains.
//         Chain detection combines:
//           * explicit naming patterns (rfd_*, the_last_dragon_p1/p2/p3)
//           * v0.8-chain file ordering (each file's 6 quests are sequential)
//           * `requires.quests: [prev]` single-prereq detection.
//   - Runs dry by default. `--write` to mutate files.
//
// Modes:
//   (default)        — both C1 (unlocks) and C2 (chain_next)
//   --only-unlocks   — C1 only
//   --only-chains    — C2 only
//   --write          — actually mutate files (default is dry-run)
//   --verbose        — per-file edit counts
//
// Safety:
//   - Idempotent. Re-running finds nothing to change.
//   - C1 REWRITES existing `unlocks: [...]` arrays with a DAG-validated set.
//     Resolved refs stay; unresolved refs are dropped (+ logged).
//     Preserves the `// Unlocks:` lore comment.
//   - C2 never rewrites an existing `chain_next:` key.
// ────────────────────────────────────────────────────────────────────────────────

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DAG_PATH = path.join(ROOT, 'data', 'progression-dag.json');
const CONTENT_DIR = path.join(ROOT, 'src', 'content', 'aelgard');
const UNRESOLVED_LOG = path.join(ROOT, 'reports', '_c1_unresolved.md');

const QUEST_FILES = [
  'active-gathering.js',
  'boneyard-wastes.js',
  'glass-desert.js',
  'heartlands.js',
  'inkweald.js',
  'moryskah.js',
  'quests-blitz.js',
  'quests-burn-wave3.js',
  'quests-burn-wave3-part2.js',
  'quests-burn-wave3-part3.js',
  'quests-expanded.js',
  'quests-mega.js',
  'quests-series-extensions.js',
  'quests-series.js',
  'quests-v0.8-chain-1.js',
  'quests-v0.8-chain-2.js',
  'quests-v0.8-chain-3.js',
  'quests-v0.8-chain-4.js',
  'quests-v0.8-chain-5.js',
  'raid-prerequisites.js',
  'saltbrine.js',
  'sootworks.js',
  'veilwood.js',
];

// ── Explicit chain overrides ──────────────────────────────────────────────────
// (source_id -> next_id). Wins over prereq-inference.
const EXPLICIT_CHAINS = {
  // Recipe for Disaster
  rfd_start: 'rfd_heartlands',
  rfd_heartlands: 'rfd_moryskah',
  rfd_moryskah: 'rfd_sootworks',
  rfd_sootworks: 'rfd_finale',
  // Last Dragon trilogy
  the_last_dragon_p1: 'the_last_dragon_p2',
  the_last_dragon_p2: 'the_last_dragon_p3',
  // Bog Witch chain
  the_bog_witchs_errand: 'the_bog_witchs_bargain',
  the_bog_witchs_bargain: 'the_bog_witchs_hunger',
  the_bog_witchs_hunger: 'the_bog_witchs_final_curse',
  the_bog_witchs_final_curse: 'the_bog_witchs_legacy',
  // Werewolf chain
  the_werewolfs_dilemma: 'the_werewolfs_lineage',
  the_werewolfs_lineage: 'the_werewolfs_reckoning',
  // Pirate King chain
  pirate_king: 'the_pirate_kings_gold',
  the_pirate_kings_gold: 'the_pirate_kings_throne',
  the_pirate_kings_throne: 'admirals_last_voyage',
  // Slayer Creed chain
  the_slayers_first_mark: 'slayers_gauntlet',
  slayers_gauntlet: 'the_slayers_creed',
  the_slayers_creed: 'slayers_grandmaster_trial',
  // Fight cave chain
  fight_caves: 'infernal_challenge',
  // Veilwood / druid chain
  the_veilwood_covenant: 'the_druids_covenant',
  the_druids_covenant: 'the_veilwood_grandmaster_rite',
  // Heartlands civic chain
  heartlands_patrol: 'the_missing_miner',
  the_missing_miner: 'forge_of_duran',
  // Sootworks
  sootworks_rising: 'the_forge_beneath',
  the_forge_beneath: 'foundations_of_flame',
  foundations_of_flame: 'sootworks_grandmaster_titan',
  // Inkweald door chain
  the_inkweald_door: 'the_hollow_choirs_song',
  the_hollow_choirs_song: 'the_inkweald_second_door',
  the_inkweald_second_door: 'the_inkweald_grandmaster_dream',
  // Boneyard
  sand_and_secrets: 'relics_of_the_old_world',
  relics_of_the_old_world: 'pharaohs_reckoning_prelude',
  pharaohs_reckoning_prelude: 'the_boneyard_first_empire_rite',
  // Glass Desert
  the_glass_prophecy: 'the_last_dragon_p1',
  the_last_dragon_p3: 'the_last_light',
  the_last_light: 'prophecy_fragments',
  prophecy_fragments: 'sandglass_sage_ascension',
  // Saltbrine
  whispers_from_the_depths: 'sunken_temple_key',
  // Raid unlock chains (by difficulty progression)
  kings_crypt_key: 'crucible_key',
  crucible_key: 'sunken_temple_key',
  sunken_temple_key: 'prism_labyrinth_key',
  prism_labyrinth_key: 'coa_key',
  coa_key: 'tos_key',
  tos_key: 'toa_key',
  toa_key: 'blood_sanctum_key',
  blood_sanctum_key: 'lucid_nightmare_key',
  lucid_nightmare_key: 'gauntlet_key',
  gauntlet_key: 'exodus_key',
};

// v0.8 chain files: each contains 6 quests in explicit narrative order.
// We set chain_next by file-order for these.
const V08_CHAIN_FILES = [
  'quests-v0.8-chain-1.js',
  'quests-v0.8-chain-2.js',
  'quests-v0.8-chain-3.js',
  'quests-v0.8-chain-4.js',
  'quests-v0.8-chain-5.js',
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function loadDag() {
  const raw = fs.readFileSync(DAG_PATH, 'utf8');
  const dag = JSON.parse(raw);
  const byQuest = new Map();
  const dagNodeIds = new Set();
  for (const node of dag.nodes) {
    if (node.id) dagNodeIds.add(node.id);
    if (node.source_quest) {
      if (!byQuest.has(node.source_quest)) byQuest.set(node.source_quest, []);
      byQuest.get(node.source_quest).push(node.id);
    }
  }
  return { byQuest, dagNodeIds };
}

function readQuestFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function writeQuestFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
}

function findMatchingBrace(s, openIdx) {
  if (s[openIdx] !== '{') return -1;
  let depth = 0;
  for (let i = openIdx; i < s.length; i++) {
    const ch = s[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function findMatchingBracket(s, openIdx) {
  if (s[openIdx] !== '[') return -1;
  let depth = 0;
  for (let i = openIdx; i < s.length; i++) {
    const ch = s[i];
    if (ch === '[') depth++;
    else if (ch === ']') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

// Find every quest definition block in a file.
function parseQuests(content) {
  const results = [];
  const defineRe = /quests\.define\('([^']+)',\s*\{/g;
  let m;
  while ((m = defineRe.exec(content)) !== null) {
    const id = m[1];
    const objStart = content.indexOf('{', m.index + m[0].length - 1);
    if (objStart === -1) continue;
    const end = findMatchingBrace(content, objStart);
    if (end === -1) continue;

    const block = content.slice(objStart, end + 1);

    // Find rewards: { ... }
    const rewardsMatch = block.match(/(\s+)rewards:\s*\{/);
    if (!rewardsMatch) {
      results.push({ id, blockStart: objStart, blockEnd: end, hasUnlocks: false, hasChainNext: false, skipReason: 'no_rewards_block' });
      continue;
    }
    const relRewardsStart = rewardsMatch.index + rewardsMatch[0].length - 1;
    const absRewardsStart = objStart + relRewardsStart;
    const absRewardsEnd = findMatchingBrace(content, absRewardsStart);
    if (absRewardsEnd === -1) continue;
    const rewardsBody = content.slice(absRewardsStart, absRewardsEnd + 1);

    // Parse prereqs (requirements.quests: [...])
    const prereqs = [];
    const reqMatch = block.match(/requirements:\s*\{([^}]*)\}/);
    if (reqMatch) {
      const questsMatch = reqMatch[1].match(/quests:\s*\[([^\]]*)\]/);
      if (questsMatch) {
        const ids = (questsMatch[1].match(/'([^']+)'/g) || []).map(s => s.slice(1, -1));
        prereqs.push(...ids);
      }
    }
    if (prereqs.length === 0) {
      const multilineReqMatch = block.match(/quests:\s*\[([^\]]+)\]/);
      if (multilineReqMatch) {
        const ids = (multilineReqMatch[1].match(/'([^']+)'/g) || []).map(s => s.slice(1, -1));
        prereqs.push(...ids);
      }
    }

    // Locate unlocks: [...] (in-rewards). Records absolute indices.
    let unlocksStart = -1, unlocksEnd = -1, currentRefs = [];
    const unlocksRe = /unlocks:\s*\[/g;
    let um;
    while ((um = unlocksRe.exec(rewardsBody)) !== null) {
      const relBracketStart = um.index + um[0].length - 1; // '[' position within rewards body
      const absBracketStart = absRewardsStart + relBracketStart;
      const absBracketEnd = findMatchingBracket(content, absBracketStart);
      if (absBracketEnd === -1) break;
      unlocksStart = absBracketStart;
      unlocksEnd = absBracketEnd;
      const arrBody = content.slice(absBracketStart + 1, absBracketEnd);
      currentRefs = (arrBody.match(/"([^"]+)"/g) || []).map(s => s.slice(1, -1));
      break; // take first one
    }
    const hasUnlocks = unlocksStart !== -1;
    const hasChainNext = /\n\s+chain_next:\s*['"]/.test(rewardsBody);

    // Parse difficulty + XP
    const diffMatch = block.match(/difficulty:\s*'([^']+)'/);
    const difficulty = diffMatch ? diffMatch[1] : null;
    let totalXp = 0;
    const xpMatch = block.match(/xp:\s*\{([^}]*)\}/);
    if (xpMatch) {
      const nums = xpMatch[1].match(/:\s*(\d+)/g) || [];
      for (const n of nums) totalXp += parseInt(n.slice(1).trim(), 10);
    }
    const itemsMatch = block.match(/items:\s*\[([^\]]*)\]/);
    const hasItems = itemsMatch ? itemsMatch[1].trim().length > 0 : false;

    results.push({
      id,
      blockStart: objStart,
      blockEnd: end,
      rewardsStart: absRewardsStart,
      rewardsEnd: absRewardsEnd,
      prereqs,
      hasUnlocks,
      hasChainNext,
      unlocksStart,
      unlocksEnd,
      currentRefs,
      difficulty,
      totalXp,
      hasItems,
    });
  }
  return results;
}

// Slug-ify a comment's free-text tail so we can pattern-match against DAG node ids.
function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

// Given a comment's free text, emit candidate DAG ref prefixes by keyword heuristics.
// (e.g., "Moryskah border lantern network" -> ["teleport:moryskah_border_lanterns"]).
// Only refs that resolve against dagIds survive.
function candidatesFromComment(text, dagIds) {
  const out = [];
  const slug = slugify(text);
  if (!slug) return out;
  const prefixes = ['area', 'training_method', 'item_unlock', 'teleport', 'shortcut', 'shop', 'npc', 'boss', 'minigame', 'recipe', 'spell_unlock', 'prayer_unlock'];
  // Exact match on a fully-qualified prefix:slug hit
  for (const p of prefixes) {
    const candidate = `${p}:${slug}`;
    if (dagIds.has(candidate)) out.push(candidate);
  }
  // Also try splitting on '_' and progressively trimming
  const parts = slug.split('_');
  for (let n = parts.length; n >= 3 && out.length === 0; n--) {
    const trimmed = parts.slice(0, n).join('_');
    for (const p of prefixes) {
      const c = `${p}:${trimmed}`;
      if (dagIds.has(c)) out.push(c);
    }
  }
  return out;
}

// Collect ref candidates for a given quest.
// Sources (union, DAG-validated):
//   (1) DAG source_quest reverse-map (byQuest)
//   (2) Existing currentRefs that already resolve (don't throw them away)
//   (3) Trailing `// Unlocks: <text>` comment inside the rewards block —
//       heuristic match against DAG prefixes
//   (4) Raid-prereq quests (file = raid-prerequisites.js): raid:<slug> when it
//       resolves
function collectCandidates(q, block, dagIds, byQuest) {
  const refs = new Set();
  const unresolved = new Set();

  // (1) DAG source_quest reverse-map
  for (const r of (byQuest.get(q.id) || [])) {
    if (dagIds.has(r)) refs.add(r);
    else unresolved.add(r); // defensive
  }

  // (2) Keep existing refs that resolve
  for (const r of (q.currentRefs || [])) {
    if (dagIds.has(r)) refs.add(r);
    else unresolved.add(r);
  }

  // (3) // Unlocks: comment heuristic
  const commentMatch = block.match(/\/\/\s*Unlocks:\s*([^\n]+)/i);
  if (commentMatch) {
    for (const c of candidatesFromComment(commentMatch[1], dagIds)) {
      refs.add(c);
    }
  }

  // (4) Raid-prereq file heuristic
  if (q.file === 'raid-prerequisites.js') {
    const raidMap = {
      coa_key: 'raid:chambers_of_aelgard',
      tos_key: 'raid:theatre_of_shadows',
      toa_key: 'raid:tombs_of_aelgard',
      gauntlet_key: 'raid:the_gauntlet',
      kings_crypt_key: 'raid:king_s_crypt',
      blood_sanctum_key: 'raid:blood_sanctum',
      crucible_key: 'raid:crucible',
      sunken_temple_key: 'raid:sunken_temple',
      lucid_nightmare_key: 'raid:lucid_nightmare',
      prism_labyrinth_key: 'raid:prism_labyrinth',
      exodus_key: 'raid:the_exodus',
    };
    const r = raidMap[q.id];
    if (r && dagIds.has(r)) refs.add(r);
  }

  return { refs: [...refs], unresolved: [...unresolved] };
}

function splitTopLevelCommas(s) {
  const parts = [];
  let buf = '';
  let depth = 0;
  let inStr = null;
  let escape = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (escape) { buf += ch; escape = false; continue; }
    if (ch === '\\') { buf += ch; escape = true; continue; }
    if (inStr) {
      buf += ch;
      if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { buf += ch; inStr = ch; continue; }
    if (ch === '{' || ch === '[' || ch === '(') { depth++; buf += ch; continue; }
    if (ch === '}' || ch === ']' || ch === ')') { depth--; buf += ch; continue; }
    if (ch === ',' && depth === 0) { parts.push(buf); buf = ''; continue; }
    buf += ch;
  }
  if (buf.trim()) parts.push(buf);
  return parts;
}

// ── Main ──────────────────────────────────────────────────────────────────────

function main(argv) {
  const writeMode = argv.includes('--write');
  const verbose = argv.includes('--verbose');
  const onlyUnlocks = argv.includes('--only-unlocks');
  const onlyChains = argv.includes('--only-chains');
  const doUnlocks = !onlyChains;
  const doChains = !onlyUnlocks;

  const { byQuest, dagNodeIds } = loadDag();
  console.log(`[codemod] Loaded DAG: ${dagNodeIds.size} nodes, ${byQuest.size} source_quest refs.`);

  // Pass 1 — parse all files, build global quest registry.
  const allQuests = new Map();
  const fileOrder = new Map();
  for (const fileName of QUEST_FILES) {
    const filePath = path.join(CONTENT_DIR, fileName);
    const content = readQuestFile(filePath);
    const parsed = parseQuests(content);
    const ids = [];
    for (const q of parsed) {
      q.file = fileName;
      q.filePath = filePath;
      allQuests.set(q.id, q);
      ids.push(q.id);
    }
    fileOrder.set(fileName, ids);
  }
  console.log(`[codemod] Parsed ${allQuests.size} quest definitions across ${QUEST_FILES.length} files.`);

  // Pass 2 — compute chain_next for each quest.
  const chainNext = new Map();
  for (const [from, to] of Object.entries(EXPLICIT_CHAINS)) {
    if (allQuests.has(from) && allQuests.has(to)) chainNext.set(from, to);
  }
  for (const fileName of V08_CHAIN_FILES) {
    const ids = fileOrder.get(fileName) || [];
    for (let i = 0; i < ids.length - 1; i++) {
      if (!chainNext.has(ids[i])) chainNext.set(ids[i], ids[i + 1]);
    }
  }
  const successorCount = new Map();
  for (const q of allQuests.values()) {
    if (q.prereqs.length === 1) {
      const p = q.prereqs[0];
      if (!successorCount.has(p)) successorCount.set(p, []);
      successorCount.get(p).push(q.id);
    }
  }
  for (const [p, nexts] of successorCount) {
    if (!chainNext.has(p) && nexts.length === 1 && allQuests.has(p) && allQuests.has(nexts[0])) {
      chainNext.set(p, nexts[0]);
    }
  }
  console.log(`[codemod] Computed chain_next for ${chainNext.size} quests.`);

  // Pass 3 — compute per-quest unlocks list (DAG-validated).
  const questUnlocks = new Map();
  const unresolvedByQuest = new Map(); // id -> [{ref, source}]
  let totalResolved = 0;
  let dagHits = 0, keepHits = 0, commentHits = 0, raidHits = 0;

  for (const q of allQuests.values()) {
    const content = fs.readFileSync(q.filePath, 'utf8');
    const block = content.slice(q.blockStart, q.blockEnd + 1);
    const before = { dag: byQuest.has(q.id), kept: q.currentRefs.filter(r => dagNodeIds.has(r)).length, existingBadRefs: q.currentRefs.filter(r => !dagNodeIds.has(r)) };
    const { refs, unresolved } = collectCandidates(q, block, dagNodeIds, byQuest);
    if (refs.length) questUnlocks.set(q.id, refs);
    totalResolved += refs.length;
    if (before.dag) dagHits++;
    if (before.kept > 0) keepHits++;
    // Detect comment contribution
    const cm = block.match(/\/\/\s*Unlocks:\s*([^\n]+)/i);
    if (cm && candidatesFromComment(cm[1], dagNodeIds).length > 0) commentHits++;
    if (q.file === 'raid-prerequisites.js' && refs.some(r => r.startsWith('raid:'))) raidHits++;

    // Record everything unresolved (existing bad refs, not new synthesized)
    const unresolvedForThis = [...new Set([...unresolved, ...before.existingBadRefs])];
    if (unresolvedForThis.length) {
      unresolvedByQuest.set(q.id, unresolvedForThis.map(r => ({ ref: r, source: q.currentRefs.includes(r) ? 'existing' : 'dag_source_quest' })));
    }
  }
  console.log(`[codemod] ${questUnlocks.size} quests have at least one resolvable ref (${totalResolved} total).`);
  console.log(`           breakdown: dag=${dagHits} kept_existing=${keepHits} comment_matched=${commentHits} raid=${raidHits}`);
  console.log(`           quests with unresolved refs being DROPPED: ${unresolvedByQuest.size}`);

  // Pass 4 — write unresolved log.
  if (doUnlocks) {
    writeUnresolvedLog(unresolvedByQuest, allQuests, writeMode);
  }

  // Pass 5 — rewrite each file.
  let totalUnlocksWritten = 0;
  let totalChainsWritten = 0;
  let totalQuestsEdited = 0;
  const perFileCounts = {};

  for (const fileName of QUEST_FILES) {
    const filePath = path.join(CONTENT_DIR, fileName);
    let content = readQuestFile(filePath);
    const parsed = parseQuests(content);
    let fileChanges = 0;
    for (let i = parsed.length - 1; i >= 0; i--) {
      const q = parsed[i];
      const unlocks = doUnlocks ? (questUnlocks.get(q.id) || []) : null;
      const nextId = doChains ? (chainNext.get(q.id) || null) : null;

      // C1 handling
      let c1Edit = null; // { kind: 'rewrite'|'insert', ... }
      if (doUnlocks) {
        if (q.hasUnlocks) {
          // Compare currentRefs to computed unlocks. If different → rewrite.
          const sortedCurrent = [...q.currentRefs].sort().join(',');
          const sortedNew = [...(unlocks || [])].sort().join(',');
          if (sortedCurrent !== sortedNew) {
            c1Edit = { kind: 'rewrite', unlocks: unlocks || [] };
          }
        } else if (unlocks && unlocks.length > 0) {
          c1Edit = { kind: 'insert', unlocks };
        }
      }
      const needsChainNext = doChains && nextId && !q.hasChainNext;
      if (!c1Edit && !needsChainNext) continue;
      if (!q.rewardsStart) continue;

      // Compute indentation from the `rewards:` line.
      const rewardsLineStart = content.lastIndexOf('\n', q.rewardsStart) + 1;
      const rewardsLineIndent = content.slice(rewardsLineStart).match(/^(\s*)/)[1];
      const itemIndent = rewardsLineIndent + '  ';

      // Apply C1 rewrite (in-place replacement of the unlocks array).
      if (c1Edit && c1Edit.kind === 'rewrite') {
        const arr = c1Edit.unlocks.map(u => JSON.stringify(u)).join(', ');
        const newArr = `[${arr}]`;
        // Replace content[q.unlocksStart .. q.unlocksEnd] with newArr
        content = content.slice(0, q.unlocksStart) + newArr + content.slice(q.unlocksEnd + 1);
        totalUnlocksWritten++;
        fileChanges++;
        totalQuestsEdited++;
        // After this rewrite, we must re-parse (indices shift). Do nothing more
        // for this quest on this pass — the re-scan loop will catch chain_next
        // needs on the next run. But we still handle chain_next here if the
        // delta is a pure removal/update (same-length shrink).
        // Simpler: re-parse fully after a C1 rewrite.
        const reparsed = parseQuests(content);
        const q2 = reparsed.find(x => x.id === q.id);
        if (!q2) continue;
        q.rewardsStart = q2.rewardsStart;
        q.rewardsEnd = q2.rewardsEnd;
        q.hasChainNext = q2.hasChainNext;
      }

      // C1 insert (new unlocks key into rewards block).
      if (c1Edit && c1Edit.kind === 'insert') {
        const endIdx = q.rewardsEnd;
        const endLineStart = content.lastIndexOf('\n', endIdx) + 1;
        const arr = c1Edit.unlocks.map(u => JSON.stringify(u)).join(', ');
        const inserts = `${itemIndent}unlocks: [${arr}],\n`;
        content = content.slice(0, endLineStart) + inserts + content.slice(endLineStart);
        totalUnlocksWritten++;
        fileChanges++;
        totalQuestsEdited++;
        // Re-parse to refresh indices for chain_next below.
        const reparsed = parseQuests(content);
        const q2 = reparsed.find(x => x.id === q.id);
        if (!q2) continue;
        q.rewardsStart = q2.rewardsStart;
        q.rewardsEnd = q2.rewardsEnd;
        q.hasChainNext = q2.hasChainNext;
      }

      // C2 insert (chain_next).
      if (doChains && nextId && !q.hasChainNext) {
        const endIdx = q.rewardsEnd;
        const endLineStart = content.lastIndexOf('\n', endIdx) + 1;
        const inserts = `${itemIndent}chain_next: '${nextId}',\n`;
        content = content.slice(0, endLineStart) + inserts + content.slice(endLineStart);
        totalChainsWritten++;
        fileChanges++;
        totalQuestsEdited++;
      }
    }
    if (fileChanges > 0) {
      perFileCounts[fileName] = fileChanges;
      if (writeMode) writeQuestFile(filePath, content);
      if (verbose) console.log(`  ${fileName}: ${fileChanges} edits`);
    }
  }

  console.log('');
  console.log(`[codemod] Summary:`);
  console.log(`  quests edited: ${totalQuestsEdited}`);
  console.log(`  unlocks rewrites/inserts: ${totalUnlocksWritten}`);
  console.log(`  chain_next fields written: ${totalChainsWritten}`);
  console.log(`  mode: ${writeMode ? 'WRITE' : 'DRY-RUN (--write to apply)'} / ${doUnlocks && doChains ? 'unlocks+chains' : (doUnlocks ? 'unlocks only' : 'chains only')}`);
  if (Object.keys(perFileCounts).length > 0) {
    console.log(`  per-file:`);
    for (const [f, n] of Object.entries(perFileCounts)) {
      console.log(`    ${f}: ${n}`);
    }
  }
}

function writeUnresolvedLog(unresolvedByQuest, allQuests, writeMode) {
  const lines = [];
  lines.push('# C1 unresolved unlock refs');
  lines.push('');
  lines.push('Refs that were present in a quest\'s `unlocks:` array or in the DAG\'s');
  lines.push('`source_quest` reverse-map but could not be resolved against');
  lines.push('`data/progression-dag.json`. The codemod drops these from the quest');
  lines.push('file\'s `unlocks:` array on write.');
  lines.push('');
  lines.push(`Total quests with unresolved refs: ${unresolvedByQuest.size}`);
  let totalUnresolved = 0;
  for (const [, list] of unresolvedByQuest) totalUnresolved += list.length;
  lines.push(`Total unresolved refs dropped: ${totalUnresolved}`);
  lines.push('');
  lines.push('| Quest ID | File | Dropped ref | Source |');
  lines.push('|---|---|---|---|');
  const sortedIds = [...unresolvedByQuest.keys()].sort();
  for (const id of sortedIds) {
    const q = allQuests.get(id);
    const file = q ? q.file : '?';
    for (const { ref, source } of unresolvedByQuest.get(id)) {
      lines.push(`| \`${id}\` | ${file} | \`${ref}\` | ${source} |`);
    }
  }
  const out = lines.join('\n') + '\n';
  if (writeMode) {
    fs.writeFileSync(UNRESOLVED_LOG, out, 'utf8');
    console.log(`[codemod] Wrote unresolved log: ${UNRESOLVED_LOG} (${totalUnresolved} refs across ${unresolvedByQuest.size} quests).`);
  } else {
    console.log(`[codemod] (dry-run) would write unresolved log to ${UNRESOLVED_LOG} (${totalUnresolved} refs across ${unresolvedByQuest.size} quests).`);
  }
}

if (require.main === module) {
  main(process.argv.slice(2));
}

module.exports = { main };
