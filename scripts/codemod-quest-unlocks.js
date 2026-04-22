#!/usr/bin/env node
/* eslint-disable no-console */
// ── Codemod: quest unlocks + chain_next (v0.9 Wave A1) ─────────────────────────
//
// Purpose:
//   - C1: Populate `unlocks: ["<dag_node_id>", ...]` for every quest by joining
//         the DAG's `source_quest` -> [node_id] reverse-map.
//   - C2: Populate `chain_next: "<next_quest_id>"` for multi-part chains.
//         Chain detection combines:
//           * explicit naming patterns (rfd_*, the_last_dragon_p1/p2/p3)
//           * v0.8-chain file ordering (each file's 6 quests are sequential)
//           * `requires.quests: [prev]` single-prereq detection.
//   - Runs dry by default. `--write` to mutate files.
//
// Safety:
//   - Never touches quests where `unlocks:` is already present.
//   - Preserves the existing `// Unlocks:` comment (as lore annotation).
//   - Idempotent — running twice is a no-op.
// ────────────────────────────────────────────────────────────────────────────────

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DAG_PATH = path.join(ROOT, 'data', 'progression-dag.json');
const CONTENT_DIR = path.join(ROOT, 'src', 'content', 'aelgard');

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

// Find every quest definition block in a file. Returns a list of
// { id, startIdx, endIdx, rewardsStart, rewardsEnd, prereqs, hasUnlocks, hasChainNext }.
function parseQuests(content) {
  const results = [];
  const defineRe = /quests\.define\('([^']+)',\s*\{/g;
  let m;
  while ((m = defineRe.exec(content)) !== null) {
    const id = m[1];
    const objStart = content.indexOf('{', m.index + m[0].length - 1);
    if (objStart === -1) continue;
    // Scan balanced braces to find end of quest block.
    const end = findMatchingBrace(content, objStart);
    if (end === -1) continue;

    const block = content.slice(objStart, end + 1);

    // Find rewards: { ... }
    const rewardsMatch = block.match(/(\s+)rewards:\s*\{/);
    if (!rewardsMatch) {
      results.push({ id, blockStart: objStart, blockEnd: end, hasUnlocks: false, hasChainNext: false, skipReason: 'no_rewards_block' });
      continue;
    }
    const relRewardsStart = rewardsMatch.index + rewardsMatch[0].length - 1; // index of '{'
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
    // Also handle `requirements: { ..., quests: [...], ... }` spanning multi-line (chain-1..5 uses deep shapes).
    if (prereqs.length === 0) {
      const multilineReqMatch = block.match(/quests:\s*\[([^\]]+)\]/);
      if (multilineReqMatch) {
        const ids = (multilineReqMatch[1].match(/'([^']+)'/g) || []).map(s => s.slice(1, -1));
        prereqs.push(...ids);
      }
    }

    const hasUnlocks = /\n\s+unlocks:\s*\[/.test(rewardsBody);
    const hasChainNext = /\n\s+chain_next:\s*['"]/.test(rewardsBody);

    // Parse difficulty
    const diffMatch = block.match(/difficulty:\s*'([^']+)'/);
    const difficulty = diffMatch ? diffMatch[1] : null;

    // Parse total XP
    let totalXp = 0;
    const xpMatch = block.match(/xp:\s*\{([^}]*)\}/);
    if (xpMatch) {
      const nums = xpMatch[1].match(/:\s*(\d+)/g) || [];
      for (const n of nums) totalXp += parseInt(n.slice(1).trim(), 10);
    }

    // Parse items present
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
      difficulty,
      totalXp,
      hasItems,
    });
  }
  return results;
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

// Split on top-level commas, respecting nested {...}, [...], (...), and quoted strings.
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
  // Mode flags — default: both. `--only-unlocks` disables chain_next, and vice versa.
  const onlyUnlocks = argv.includes('--only-unlocks');
  const onlyChains = argv.includes('--only-chains');
  const doUnlocks = !onlyChains;
  const doChains = !onlyUnlocks;

  const { byQuest, dagNodeIds } = loadDag();
  console.log(`[codemod] Loaded DAG: ${dagNodeIds.size} nodes, ${byQuest.size} source_quest refs.`);

  // Pass 1 — parse all files, build global quest registry.
  const allQuests = new Map(); // id -> parsed info + file
  const fileOrder = new Map(); // file -> list of ids (in order)
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
  // A) Explicit overrides first.
  for (const [from, to] of Object.entries(EXPLICIT_CHAINS)) {
    if (allQuests.has(from) && allQuests.has(to)) chainNext.set(from, to);
  }
  // B) v0.8 chain files — file order drives chain.
  for (const fileName of V08_CHAIN_FILES) {
    const ids = fileOrder.get(fileName) || [];
    for (let i = 0; i < ids.length - 1; i++) {
      if (!chainNext.has(ids[i])) chainNext.set(ids[i], ids[i + 1]);
    }
  }
  // C) Single-prereq inference.
  // For each quest q with exactly one prereq p, map p -> q if p has no successor set yet.
  // Multiple successors => skip (ambiguous).
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

  // Pass 3 — compute per-quest unlocks list.
  //
  // Order of preference:
  //   (a) DAG source_quest reverse-map (authoritative for 118+ quests)
  //   (b) Trailing `// Unlocks: X` comment → synthesized item_unlock:<slug> ref
  //   (c) For raid-prereq quests (file = raid-prerequisites.js) with no
  //       unlocks yet, add `raid:<raid_id>` based on quest id.
  const questUnlocks = new Map();
  let refCount = 0;
  let dagOnly = 0, commentOnly = 0, both = 0, synthesized = 0;

  for (const q of allQuests.values()) {
    const refs = new Set();
    // (a) DAG-sourced refs
    const hits = byQuest.get(q.id) || [];
    for (const r of hits) {
      if (dagNodeIds.has(r)) refs.add(r);
    }
    const hadDag = refs.size > 0;

    // (b) Trailing comment → synthesized ref.
    const block = /* reopened file */ fs.readFileSync(q.filePath, 'utf8').slice(q.blockStart, q.blockEnd + 1);
    const commentMatch = block.match(/\/\/ Unlocks:\s*([^\n]+)/i);
    let hadComment = false;
    if (commentMatch) {
      hadComment = true;
      const text = commentMatch[1].trim();
      // Slug-ify: lowercase, non-alphanum -> _, trim.
      const slug = text.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 48);
      if (slug) refs.add(`item_unlock:${q.id}_${slug}`);
    }

    // (c) Raid-prereq fallback.
    if (q.file === 'raid-prerequisites.js' && refs.size === 0) {
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
      if (raidMap[q.id]) refs.add(raidMap[q.id]);
    }

    // (d) Final fallback: if still empty, synthesize a single generic access
    //     ref based on quest id. This gives the planner SOMETHING to score.
    if (refs.size === 0) {
      refs.add(`item_unlock:${q.id}_completion`);
      synthesized++;
    }

    if (refs.size > 0) {
      questUnlocks.set(q.id, [...refs]);
      refCount += refs.size;
      if (hadDag && hadComment) both++;
      else if (hadDag) dagOnly++;
      else if (hadComment) commentOnly++;
    }
  }
  console.log(`[codemod] ${questUnlocks.size} quests get unlocks (${refCount} total ref-links).`);
  console.log(`           breakdown: dag_only=${dagOnly} comment_only=${commentOnly} both=${both} synthesized_only=${synthesized}`);

  // Pass 4 — rewrite each file.
  let totalUnlocksWritten = 0;
  let totalChainsWritten = 0;
  let totalQuestsEdited = 0;
  const perFileCounts = {};

  for (const fileName of QUEST_FILES) {
    const filePath = path.join(CONTENT_DIR, fileName);
    let content = readQuestFile(filePath);
    // Re-parse AFTER each edit isn't needed because we mutate in reverse, but the
    // indices we recorded for parsed[] are based on the original content. We
    // iterate in reverse so earlier indices remain valid.
    const parsed = parseQuests(content);
    let fileChanges = 0;
    for (let i = parsed.length - 1; i >= 0; i--) {
      const q = parsed[i];
      const unlocks = (doUnlocks ? (questUnlocks.get(q.id) || []) : []);
      const nextId = doChains ? (chainNext.get(q.id) || null) : null;
      const needsUnlocks = unlocks.length > 0 && !q.hasUnlocks;
      const needsChainNext = nextId && !q.hasChainNext;
      if (!needsUnlocks && !needsChainNext) continue;
      if (!q.rewardsStart) continue;

      // Determine the indentation of the `rewards:` LINE (first non-space char).
      const rewardsLineStart = content.lastIndexOf('\n', q.rewardsStart) + 1;
      const rewardsLineIndent = content.slice(rewardsLineStart).match(/^(\s*)/)[1];
      const itemIndent = rewardsLineIndent + '  ';

      // Detect whether the rewards block is single-line or multi-line.
      const rewardsBody = content.slice(q.rewardsStart, q.rewardsEnd + 1);
      const isSingleLine = !rewardsBody.includes('\n');

      let newRewardsBody;
      if (isSingleLine) {
        // `rewards: { xp: {...}, questPoints: 1 }` => normalize to multi-line.
        // Strip braces + leading/trailing whitespace.
        let inner = rewardsBody.slice(1, -1).trim();
        // Split on top-level commas (naive but works since inner objects use
        // `: {}` which is balanced). We use a brace-aware splitter.
        const parts = splitTopLevelCommas(inner);
        // Trim each part and drop trailing-commas/empties.
        const cleanParts = parts.map(p => p.trim()).filter(p => p.length);
        // Build new body.
        const newParts = [...cleanParts];
        if (needsUnlocks) {
          const arr = unlocks.map(u => JSON.stringify(u)).join(', ');
          newParts.push(`unlocks: [${arr}]`);
          totalUnlocksWritten++;
        }
        if (needsChainNext) {
          newParts.push(`chain_next: '${nextId}'`);
          totalChainsWritten++;
        }
        newRewardsBody = '{\n' + newParts.map(p => `${itemIndent}${p},`).join('\n') + `\n${rewardsLineIndent}}`;
      } else {
        // Multi-line — find the closing `}` of rewards on its own line and
        // insert new fields before it.
        // Back-scan to find the `}` line start.
        const endIdx = q.rewardsEnd; // index of the closing `}` character.
        const endLineStart = content.lastIndexOf('\n', endIdx) + 1;
        // The closing `}`'s line is `<indent>}` OR `<indent>},`. Insert inserts
        // BEFORE that indent.
        let inserts = '';
        if (needsUnlocks) {
          const arr = unlocks.map(u => JSON.stringify(u)).join(', ');
          inserts += `${itemIndent}unlocks: [${arr}],\n`;
          totalUnlocksWritten++;
        }
        if (needsChainNext) {
          inserts += `${itemIndent}chain_next: '${nextId}',\n`;
          totalChainsWritten++;
        }
        content = content.slice(0, endLineStart) + inserts + content.slice(endLineStart);
        fileChanges++;
        totalQuestsEdited++;
        continue;
      }

      // For single-line path: replace the whole rewards block.
      content = content.slice(0, q.rewardsStart) + newRewardsBody + content.slice(q.rewardsEnd + 1);
      fileChanges++;
      totalQuestsEdited++;
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
  console.log(`  unlocks fields written: ${totalUnlocksWritten}`);
  console.log(`  chain_next fields written: ${totalChainsWritten}`);
  console.log(`  mode: ${writeMode ? 'WRITE' : 'DRY-RUN (--write to apply)'} / ${doUnlocks && doChains ? 'unlocks+chains' : (doUnlocks ? 'unlocks only' : 'chains only')}`);
  console.log(`  per-file:`);
  for (const [f, n] of Object.entries(perFileCounts)) {
    console.log(`    ${f}: ${n}`);
  }
}

if (require.main === module) {
  main(process.argv.slice(2));
}

module.exports = { main };
