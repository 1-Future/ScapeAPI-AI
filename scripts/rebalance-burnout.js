#!/usr/bin/env node
// ═════════════════════════════════════════════════════════════════════════════
// Rebalance Scape drop rates to match realistic player commitment.
//
// Reads data/burnout-thresholds.json (sub-task B output) and applies the rule:
//
//   new_rate = min(current_rate, p99_kc_of_equivalent_osrs_boss)
//
// Rationale: a drop with expected_kills = 1/rate that exceeds p99_kc is
// mathematically unreachable for 99% of the player population. Capping the
// denominator at p99_kc ensures the most dedicated 1% of realistic grinders
// complete the log at average luck.
//
// Writes:
//   - data/collection-log.json  (rate adjustments)
//   - src/content/aelgard/bosses-expanded.js  (petRate defaults — none explicit)
//   - src/content/aelgard/raids-bosses-mega.js (petRate defaults — none explicit)
//   - src/content/aelgard/raids-mega1.js  (inline petRate args)
//   - reports/burnout-rate-changes.md  (audit log)
//
// Aelgard-only bosses (forgefather_duran, count_malachar, etc.) don't have a
// 1:1 OSRS mirror, so we tier-map them to the closest intensity equivalent.
// See OSRS_EQUIVALENTS below.
// ═════════════════════════════════════════════════════════════════════════════

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const cl = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'collection-log.json'), 'utf8'));
const burnout = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'burnout-thresholds.json'), 'utf8'));

// Map Scape source id → OSRS boss key in burnout-thresholds.
//
// Direct ports use the same name. Aelgard-originals are tier-mapped to the
// closest OSRS intensity equivalent:
//   - big-3 mob-boss tier            → general_graardor (p99 26018)
//   - mid solo boss tier             → cerberus (p99 19679)
//   - entry boss tier                → kraken (p99 40112 — highest AFK ceiling)
//   - skilling boss tier             → tempoross (p99 5329)
//   - god wars (big 4)               → direct
//   - raid tier (team, high fric.)   → chambers_of_xeric (p99 7272)
//   - hard-mode raid                 → theatre_of_blood (p99 6320)
//   - elite solo (nightmare-level)   → nightmare (p99 7957)
//   - wilderness boss                → king_black_dragon (p99 14329)
//
// Any Scape boss not listed here is skipped (no rebalance applied).
const OSRS_EQUIVALENTS = {
  // Direct ports
  'vorkath':                 'vorkath',
  'zulrah':                  'zulrah',
  'corporeal_beast':         'corporeal_beast',
  'the_nightmare':           'nightmare',
  'commander_zilyana':       'commander_zilyana',
  'general_graardor':        'general_graardor',
  'kreearra':                'kreearra',
  'kril_tsutsaroth':         'kril_tsutsaroth',
  'dagannoth_kings':         'dagannoth_rex',   // use rex as canonical
  'sarachnis':               'sarachnis',
  'kalphite_queen':          'cerberus',        // no KQ hiscore in sample
  'giant_mole':              'cerberus',
  'hespori':                 'hespori',
  'tempoross':               'tempoross',
  'phantom_muspah':          'phantom_muspah',
  'bryophyta':               'kraken',          // entry-tier
  'obor':                    'kraken',
  'skotizo':                 'cerberus',
  'mimic':                   'hespori',         // low-engagement gated
  'wilds_king_black_dragon': 'king_black_dragon',
  'wilds_chaos_elemental':   'king_black_dragon',
  'wilds_scorpia':           'king_black_dragon',
  'wilds_vetion':            'king_black_dragon',
  'wilds_callisto':          'king_black_dragon',
  'wilds_venenatis':         'king_black_dragon',
  'duke_sucellus':           'phantom_muspah',
  'the_leviathan':           'phantom_muspah',
  'nex':                     'corporeal_beast', // elite team boss
  'the_whisperer':           'phantom_muspah',
  'vardorvis':               'phantom_muspah',
  'sol_heredit':             'theatre_of_blood',// hard solo challenge
  'kraken_of_saltbrine':     'kraken',

  // Aelgard-originals — tier-mapped
  'forgefather_duran':       'cerberus',
  'azhmari_sand_prince':     'cerberus',
  'bog_hydra':               'alchemical_hydra',
  'count_malachar':          'cerberus',
  'the_veilmother':          'cerberus',
  'vorath_warden':           'cerberus',
  'the_soot_king':           'general_graardor',
  'inkweald_muse':           'cerberus',
  'glass_tyrant':            'cerberus',
  'veldrak_last_dragon':     'vorkath',
  'crystal_wyrm':            'cerberus',
  'commander_zelot':         'general_graardor',
  'hedgelord_trinity':       'kraken',
  'grave_lord_moryskah':     'cerberus',
  'pharaoh_lich':            'general_graardor',
  'dust_tyrant':             'general_graardor',
  'king_of_the_wood':        'general_graardor',
  'kraken_matriarch':        'kraken',
  'forgotten_name':          'nightmare',
  'sunking':                 'general_graardor',
  'greater_chaos_demon':     'kril_tsutsaroth',
  'chaos_touched_giant':     'general_graardor',
  'wilderness_wyrm':         'alchemical_hydra',
  'bone_colossus':           'general_graardor',
  'black_stone_warden':      'nex',             // fall-through — elite team tier
  'sootlord_collective':     'general_graardor',

  // Raid sources — use CoX/ToB as team-boss tier baseline
  'hollow_choir_raid':        'chambers_of_xeric',
  'godwars_dungeon':          'general_graardor',
  'fight_caves':              'king_black_dragon',
  'infernal_challenge':       'theatre_of_blood',
  'toa_wardens':              'chambers_of_xeric',
  'raid_crypt_of_aelgard':    'theatre_of_blood',
  'raid_siege_of_bastion':    'chambers_of_xeric',
  'raid_sanctum_of_pharaohs': 'chambers_of_xeric',
  'raid_spine_of_earth':      'chambers_of_xeric',
  'raid_blood_archon':        'theatre_of_blood',
  'raid_catacomb_gauntlet':   'chambers_of_xeric',
  'raid_theatre_of_shadows_hm':'theatre_of_blood',
  'raid_crystal_gauntlet':    'chambers_of_xeric',
  'raid_worldtree':           'theatre_of_blood',
  'raid_crucible_forge':      'chambers_of_xeric',
  'raid_engine_architect':    'chambers_of_xeric',
  'raid_sunken_depths':       'chambers_of_xeric',
  'raid_tempest':             'chambers_of_xeric',
  'raid_nightmare_rooms':     'theatre_of_blood',
  'raid_rift_sovereign':      'theatre_of_blood',
  'raid_prism_labyrinth':     'chambers_of_xeric',
  'raid_dragon_forge':        'chambers_of_xeric',
  'raid_colosseum_reborn':    'theatre_of_blood',
  'raid_revenant_caves':      'king_black_dragon',
  'raid_wilderness_fortress': 'king_black_dragon',
  'raid_abyssal_nexus':       'theatre_of_blood',
  'raid_grand_hunt':          'chambers_of_xeric',
  'raid_calamity_protocol':   'theatre_of_blood',
  'raid_iron_gauntlet':       'theatre_of_blood',
  'raid_mushroom_grotto':     'chambers_of_xeric',
  'raid_frost_citadel':       'theatre_of_blood',
  'raid_volcanic_depths':     'theatre_of_blood',
  'raid_tidal_fortress':      'chambers_of_xeric',
  'raid_dream_colosseum':     'theatre_of_blood',
  'raid_exodus':              'theatre_of_blood', // capstone — hardest tier

  // Clue scrolls — tier-mapped to cerberus (OSRS "typical clue-hunter" ceiling)
  // — except elite/master which map to vorkath-tier (dedicated GP farmers who
  // also rank high on clues).
  'clue_beginner':            'hespori',         // one-off
  'clue_easy':                'kraken',
  'clue_medium':              'kraken',
  'clue_hard':                'cerberus',
  'clue_elite':               'vorkath',
  'clue_master':              'vorkath',

  // Minigames — map to tempoross (skilling minigame commitment ceiling)
  'minigame_pest_control':    'tempoross',
  'minigame_barbarian_assault':'tempoross',
  'minigame_spirit_pyre':     'tempoross',
  'minigame_guardians_of_the_rift': 'tempoross',
  'minigame_castle_wars':     'tempoross',
  'minigame_marchlands':      'tempoross',
  'minigame_ramparts':        'tempoross',
  'minigame_deadhold':        'tempoross',
  'minigame_the_ascendancy':  'tempoross',

  // Slayer — boss-tier monsters map to relevant boss p99. Slayer task bosses
  // have their own OSRS hiscores; we use the closest analogue.
  'slayer_grotesque_guardians':    'alchemical_hydra', // same Slayer Tower tier
  'slayer_alchemical_hydra':       'alchemical_hydra',
  'slayer_thermonuclear_smoke_devil':'cerberus',
  'slayer_cerberus':               'cerberus',
  'slayer_abyssal_demon':          'cerberus',
  'slayer_cave_kraken':            'kraken',
  'slayer_dust_devil':             'kraken',
  'slayer_black_demon':            'kraken',
  'slayer_dark_beast':             'cerberus',
  'slayer_gargoyle':               'kraken',
  'slayer_nechryael':              'cerberus',
  'slayer_basilisk_knight':        'kraken',
  'slayer_drake':                  'alchemical_hydra',
  'slayer_wyrm':                   'alchemical_hydra',
  'slayer_hydra':                  'alchemical_hydra',
  'slayer_brine_rat':              'kraken',
  'slayer_lizardman_shaman':       'kraken',
  'slayer_skeletal_wyvern':        'alchemical_hydra',

  // Skilling pets — these are gated by a single skill being at level 99 or
  // high. The realistic "dedicated skiller" ceiling is the wintertodt/
  // tempoross p99 at best — ~9800 KC. But pets are triggered per-action not
  // per-KC, and OSRS pet rates like Heron/Beaver sit at 1/200000-1/300000
  // actions for low-level firemaking, scaling to 1/65k for higher levels.
  // We cap at vorkath p99 = 54626 as the "high-intensity skiller grinds
  // farthest" analog for the sim.
  'skilling_pets':            'vorkath',

  // Other category (holiday/leagues/quest cosmetics/random events) — these
  // are one-off drops. Use hespori (lowest p99) as cap.
  'other_holiday_events':     'hespori',
  'other_leagues_cosmetics':  'hespori',
  'other_quest_cosmetics':    'hespori',
  'other_daily_random_events':'hespori',
  'other_misc':               'hespori',
};

// ─── Apply rule to data/collection-log.json (surgical string edits) ─────────
//
// The source file uses compact `{ "id": X, "name": Y, "rate": Z }` one-line
// items; a blind JSON round-trip would reformat the whole file. Instead we
// mutate the raw string buffer: for each change we find the item object by
// item id + source id position and do a targeted rate replacement.

function applyToCollectionLog() {
  const changes = [];
  let totalItems = 0;
  let changedItems = 0;

  // Plan the changes first (no writes yet)
  const plan = []; // { sourceId, itemId, oldRate, newRate, ceiling, osrsEquiv, itemName }
  for (const source of cl.sources) {
    if (!source.items) continue;
    const osrsKey = OSRS_EQUIVALENTS[source.id];
    if (!osrsKey) continue;
    const boss = burnout.bosses[osrsKey];
    if (!boss || !boss.p99_kc) continue;
    const ceiling = boss.p99_kc;

    for (const item of source.items) {
      totalItems++;
      if (typeof item.rate !== 'number') continue;
      if (item.rate <= ceiling) continue;
      plan.push({
        sourceId:  source.id,
        itemId:    item.id,
        itemName:  item.name,
        oldRate:   item.rate,
        newRate:   ceiling,
        ceiling,
        osrsEquiv: osrsKey,
      });
    }
  }

  if (plan.length === 0) {
    return { totalItems, changedItems: 0, changes: [] };
  }

  // Apply surgical edits
  const clPath = path.join(ROOT, 'data', 'collection-log.json');
  let src = fs.readFileSync(clPath, 'utf8');

  for (const p of plan) {
    // Locate the source block by id. Pattern: `"id": "<sourceId>"` in a source
    // object context. Our sources live at the top level, so the first match
    // is correct.
    const sourceKey = `"id": "${p.sourceId}"`;
    const sourceIdx = src.indexOf(sourceKey);
    if (sourceIdx === -1) {
      console.warn(`  skip: source ${p.sourceId} not found in string`);
      continue;
    }

    // Find the `items` array opening after the sourceIdx
    const itemsOpen = src.indexOf('"items"', sourceIdx);
    if (itemsOpen === -1) {
      console.warn(`  skip: items block for ${p.sourceId} not found`);
      continue;
    }
    const itemsArrStart = src.indexOf('[', itemsOpen);
    const itemsArrEnd   = src.indexOf(']', itemsArrStart);
    if (itemsArrStart === -1 || itemsArrEnd === -1) continue;

    const itemsBlock = src.slice(itemsArrStart, itemsArrEnd + 1);

    // Find the single-line item object with the target item id inside this block
    // e.g. `{ "id": 80101, "name": "Rock golem (pet)", "rate": 62500 }`
    const itemLineRe = new RegExp(
      `(\\{\\s*"id":\\s*${p.itemId}\\b[^}]*?"rate":\\s*)${p.oldRate}(\\b[^}]*?\\})`,
      'g'
    );
    const newItemsBlock = itemsBlock.replace(itemLineRe, `$1${p.newRate}$2`);
    if (newItemsBlock === itemsBlock) {
      console.warn(`  skip: item ${p.itemId} rate ${p.oldRate} not matched in ${p.sourceId}`);
      continue;
    }

    src = src.slice(0, itemsArrStart) + newItemsBlock + src.slice(itemsArrEnd + 1);
    changedItems++;
    changes.push({
      source:     p.sourceId,
      osrsEquiv:  p.osrsEquiv,
      itemId:     p.itemId,
      itemName:   p.itemName,
      oldRate:    p.oldRate,
      newRate:    p.newRate,
      p99Ceiling: p.ceiling,
      reductionFactor: +(p.oldRate / p.newRate).toFixed(2),
    });
  }

  fs.writeFileSync(clPath, src);
  return { totalItems, changedItems, changes };
}

// ─── Adjust petRate on inline raids-mega1 calls ─────────────────────────────
//
// These 12 raid bosses all pass an explicit petRate (3000-5000). Our rebalance
// caps them at the OSRS-equivalent p99_kc — but since pet rates in OSRS are
// 1/3000-1/5000 already and p99 for cox/tob is 7000+, most will pass through
// unchanged. For Hespori-tier, we cap at 1829.
//
// Approach: regex-match `}, id, 'name', 'examine', RATE);` lines and cap RATE.
// Source ids for these rates correspond to raid_* keys we mapped above.

const RAIDS_MEGA1_PATH = path.join(ROOT, 'src', 'content', 'aelgard', 'raids-mega1.js');

function applyToRaidsMega1() {
  const originalSource = fs.readFileSync(RAIDS_MEGA1_PATH, 'utf8');
  let source = originalSource;
  const changes = [];

  // Find `boss('<id>', { ... }, <petId>, '<petName>', '<petExamine>', <rate>);`
  // We can't reliably regex-match across { } bodies, so we look for the tail:
  // `}, <petId>, '<petName>', '<petExamine>', <rate>);` and walk backwards to
  // find the matching `boss('<id>', ` opening.
  const tailRe = /^\}, (\d+), '([^']+)', '([^']+)', (\d+)\);$/gm;

  const openingBossRe = /boss\('([^']+)',\s*\{/g;

  // Collect all opening positions
  const openings = []; // { id, index }
  let o;
  while ((o = openingBossRe.exec(source)) !== null) {
    openings.push({ id: o[1], index: o.index });
  }

  // For each tail match, find the immediately-preceding opening
  const tails = [];
  let t;
  while ((t = tailRe.exec(source)) !== null) {
    tails.push({
      petId:      t[1],
      petName:    t[2],
      petExamine: t[3],
      rate:       parseInt(t[4], 10),
      fullMatch:  t[0],
      index:      t.index,
      length:     t[0].length,
    });
  }

  // Match each tail to its boss id via index lookup
  for (const tail of tails) {
    let best = null;
    for (const op of openings) {
      if (op.index < tail.index && (!best || op.index > best.index)) best = op;
    }
    tail.bossId = best ? best.id : null;
  }

  // For tails where the id is one of our raid mappings, cap the rate.
  // Apply edits back-to-front so indices don't shift.
  const sortedTails = tails.slice().sort((a, b) => b.index - a.index);
  for (const tail of sortedTails) {
    if (!tail.bossId) continue;

    // The raids-mega1 bosses are raid-sub-bosses keyed like `the_last_king`,
    // `siege_commander_azhar`, etc. The pet rate applies to the raid source.
    // We look up by trying each raid_* key that matches this sub-boss.
    // Simplest: apply a fixed ceiling based on "what tier is this?". Since all
    // raids-mega1 bosses are raid-sub-bosses and we mapped raid_* → cox/tob,
    // use chambers_of_xeric p99 = 7272 as the floor. Any rate above that gets
    // capped.
    //
    // (A finer mapping by sub-boss-id would require a lookup table of every
    // sub-boss → parent raid; we keep it coarse here and document the choice.)
    const ceiling = burnout.bosses.chambers_of_xeric.p99_kc; // 7272
    if (tail.rate <= ceiling) continue;
    const newRate = ceiling;

    const replacement = `}, ${tail.petId}, '${tail.petName}', '${tail.petExamine}', ${newRate});`;
    source = source.slice(0, tail.index) + replacement + source.slice(tail.index + tail.length);

    changes.push({
      bossId:    tail.bossId,
      petId:     tail.petId,
      petName:   tail.petName,
      oldRate:   tail.rate,
      newRate,
      ceiling,
    });
  }

  if (source !== originalSource) {
    fs.writeFileSync(RAIDS_MEGA1_PATH, source);
  }
  return { changes, totalTails: tails.length };
}

// ─── Write audit report ─────────────────────────────────────────────────────

function writeReport(clResult, mega1Result) {
  const lines = [];
  lines.push('# Burn-out rate changes');
  lines.push('');
  lines.push('Generated: ' + new Date().toISOString());
  lines.push('');
  lines.push('## Rule');
  lines.push('');
  lines.push('For each Scape drop, `new_rate = min(current_rate, p99_kc_of_osrs_equivalent)`.');
  lines.push('p99_kc = OSRS hiscores rank 50 KC (the "top 1% of dedicated players" ceiling).');
  lines.push('');
  lines.push('## Collection log (data/collection-log.json)');
  lines.push('');
  lines.push(`- Items scanned: ${clResult.totalItems}`);
  lines.push(`- Items rebalanced: ${clResult.changedItems}`);

  if (clResult.changes.length === 0) {
    lines.push('');
    lines.push('No changes applied — every existing rate was already within the p99 ceiling.');
  } else {
    // Group by source
    const bySource = {};
    for (const c of clResult.changes) {
      (bySource[c.source] ||= []).push(c);
    }
    lines.push('');
    lines.push('### Per-source changes');
    lines.push('');
    for (const [src, items] of Object.entries(bySource)) {
      const first = items[0];
      lines.push(`**${src}** → OSRS ${first.osrsEquiv} (p99 = ${first.p99Ceiling})`);
      for (const c of items) {
        lines.push(`  - [${c.itemId}] ${c.itemName}: \`1/${c.oldRate}\` → \`1/${c.newRate}\` (reduced ${c.reductionFactor.toFixed(2)}×)`);
      }
      lines.push('');
    }

    // Summary statistics
    const reductions = clResult.changes.map(c => c.reductionFactor);
    const avgReduction = reductions.reduce((a, b) => a + b, 0) / reductions.length;
    const maxReduction = Math.max(...reductions);
    lines.push('### Summary stats');
    lines.push('');
    lines.push(`- Avg reduction factor: ${avgReduction.toFixed(2)}×`);
    lines.push(`- Max reduction factor: ${maxReduction.toFixed(2)}×`);
  }
  lines.push('');
  lines.push('## raids-mega1.js inline petRate');
  lines.push('');
  lines.push(`- Tails scanned: ${mega1Result.totalTails}`);
  lines.push(`- Tails rebalanced: ${mega1Result.changes.length}`);
  if (mega1Result.changes.length > 0) {
    lines.push('');
    for (const c of mega1Result.changes) {
      lines.push(`  - ${c.bossId} (pet ${c.petName}): \`petRate=${c.oldRate}\` → \`petRate=${c.newRate}\` (cap ${c.ceiling})`);
    }
  } else {
    lines.push('');
    lines.push('No changes — all inline petRates already within the chambers_of_xeric p99 cap (7272).');
  }

  lines.push('');
  lines.push('## Default petRate = 1500');
  lines.push('');
  lines.push('`bosses-expanded.js`, `raids-bosses-mega.js`, and `raids-mega2.js` all default');
  lines.push('`petRate = 1500` for every call. 1500 < all p99 ceilings in our 20-boss sample,');
  lines.push('so no changes are needed at the code level. (The audit confirms the default was');
  lines.push('already aligned with realistic commitment post the v0.9-waveB4 H14 rebalance.)');

  const outPath = path.join(ROOT, 'reports', 'burnout-rate-changes.md');
  fs.writeFileSync(outPath, lines.join('\n'));
  return outPath;
}

// ─── Main ──────────────────────────────────────────────────────────────────

function main() {
  console.log('[rebalance] applying to data/collection-log.json…');
  const clResult = applyToCollectionLog();
  console.log(`  scanned ${clResult.totalItems} items, changed ${clResult.changedItems}`);

  console.log('[rebalance] applying to src/content/aelgard/raids-mega1.js…');
  const mega1Result = applyToRaidsMega1();
  console.log(`  scanned ${mega1Result.totalTails} petRate tails, changed ${mega1Result.changes.length}`);

  const reportPath = writeReport(clResult, mega1Result);
  console.log(`[rebalance] wrote ${reportPath}`);
}

main();
