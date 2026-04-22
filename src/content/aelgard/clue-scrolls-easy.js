// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Easy Clue Scroll tier (v0.9-waveB4 H8)
//
// OSRS ships an Easy tier (~45 steps) between Beginner (18) and Medium (70).
// Scape v0.8 skipped it entirely. This file:
//   - defines the clue/casket items (ids 33020, 33021)
//   - registers 45 clue steps via defineClueStep({tier:'easy', ...})
//   - registers an Easy reward table with ~45 cosmetic trim/gilded items
//
// Collection-log category `clue_easy` in data/collection-log.json tracks
// 45 unique drops from the Easy casket. This mirrors the OSRS design:
// Easy clues introduce the trimmed/gold trimmed aesthetic before hard-mode
// runes and third-age gear.
//
// Consumers:
//   - src/engine/collection-log.js (reads data/collection-log.json)
//   - src/content/aelgard/treasure-trails.js (core defineClueStep, rollReward)
//   - src/content/aelgard/clue-scrolls-expanded.js (parallel tier expansions)
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const {
  defineClueStep,
  defineRewardTable,
} = require('./treasure-trails');
const items = require('../../data/items');

// ── Clue scroll + casket items ────────────────────────────────────────────────

items.define({
  id: 33020,
  name: 'Clue scroll (easy)',
  examine: 'An easy treasure trail clue. A step up from beginner.',
  value: 0,
  category: 'clue',
  tradeable: false,
  weight: 0,
});
items.define({
  id: 33021,
  name: 'Reward casket (easy)',
  examine: 'Open for easy clue rewards.',
  value: 0,
  category: 'clue',
  tradeable: false,
  weight: 0,
});

// ── Easy reward items (23100–23144 + 23050–23052 beginner overflow) ──────────
// Most items here are trimmed or gold-trimmed variants of low-to-mid tier
// armour. Value is conservative — these are cosmetic rewards, not BIS.

function cos(id, name, slot, stats = {}, examine = null) {
  items.define({
    id,
    name,
    examine: examine || `${name}. A cosmetic treasure-trail reward.`,
    value: 40000,
    category: 'armour',
    equipSlot: slot,
    stats,
    equipReqs: {},
  });
}

// Black trimmed / gold-trimmed set (smith chain trim pattern)
cos(23100, 'Black platebody (t)', 'body', { def_stab: 58, def_slash: 60, def_crush: 52 });
cos(23101, 'Black plateskirt (t)', 'legs', { def_stab: 30, def_slash: 32, def_crush: 28 });
cos(23102, 'Black platelegs (t)', 'legs', { def_stab: 30, def_slash: 32, def_crush: 28 });
cos(23103, 'Black full helm (t)', 'head', { def_stab: 14, def_slash: 12, def_crush: 18 });
cos(23104, 'Black kiteshield (t)', 'shield', { def_stab: 32, def_slash: 30, def_crush: 26 });
cos(23105, 'Black platebody (g)', 'body', { def_stab: 58, def_slash: 60, def_crush: 52 });
cos(23106, 'Black plateskirt (g)', 'legs', { def_stab: 30, def_slash: 32, def_crush: 28 });
cos(23107, 'Black platelegs (g)', 'legs', { def_stab: 30, def_slash: 32, def_crush: 28 });
cos(23108, 'Black full helm (g)', 'head', { def_stab: 14, def_slash: 12, def_crush: 18 });
cos(23109, 'Black kiteshield (g)', 'shield', { def_stab: 32, def_slash: 30, def_crush: 26 });

// Ranger / mage trimmed — new players' first cosmetic upgrade
cos(23110, 'Studded chaps (trimmed)', 'legs', { def_ranged: 5 });
cos(23111, 'Studded body (trimmed)', 'body', { def_ranged: 8 });
cos(23112, 'Leather body (gold)', 'body', { def_ranged: 4 });
cos(23113, 'Leather chaps (gold)', 'legs', { def_ranged: 2 });
cos(23114, 'Wizard hat (trimmed)', 'head', { magic: 2 });
cos(23115, 'Wizard robe (trimmed)', 'body', { magic: 3 });
cos(23116, 'Wizard skirt (trimmed)', 'legs', { magic: 2 });

// Monk's gold-trim
cos(23117, "Monk's robe top (g)", 'body', { prayer: 3 });
cos(23118, "Monk's robe bottom (g)", 'legs', { prayer: 2 });

// HAM trimmed
cos(23119, 'Ham shirt (trimmed)', 'body', { def_stab: 4, def_slash: 5, def_crush: 3 });

// Bronze trims (gear intro)
cos(23120, 'Large bronze bar (ornamental)', 'shield', { def_slash: 6 });
cos(23121, 'Bronze chain (t)', 'body', { def_stab: 4 });

// Plate trim ladder iron -> adamant
cos(23122, 'Iron plate (t)', 'body', { def_stab: 20, def_slash: 24, def_crush: 18 });
cos(23123, 'Steel plate (t)', 'body', { def_stab: 30, def_slash: 32, def_crush: 28 });
cos(23124, 'Mithril plate (t)', 'body', { def_stab: 40, def_slash: 42, def_crush: 38 });
cos(23125, 'Adamant plate (t)', 'body', { def_stab: 50, def_slash: 54, def_crush: 48 });
cos(23126, 'Adamant plate (g)', 'body', { def_stab: 50, def_slash: 54, def_crush: 48 });
cos(23127, 'Adamant helm (t)', 'head', { def_stab: 11, def_slash: 9, def_crush: 12 });
cos(23128, 'Adamant helm (g)', 'head', { def_stab: 11, def_slash: 9, def_crush: 12 });
cos(23129, 'Adamant kiteshield (t)', 'shield', { def_stab: 25, def_slash: 28, def_crush: 21 });
cos(23130, 'Adamant kiteshield (g)', 'shield', { def_stab: 25, def_slash: 28, def_crush: 21 });

// Metal boots (bronze → adamant line)
cos(23131, 'Bronze boots', 'feet', { def_stab: 2, def_slash: 2, def_crush: 2 });
cos(23132, 'Iron boots', 'feet', { def_stab: 3, def_slash: 3, def_crush: 3 });
cos(23133, 'Steel boots', 'feet', { def_stab: 5, def_slash: 5, def_crush: 5 });
cos(23134, 'Mithril boots', 'feet', { def_stab: 7, def_slash: 7, def_crush: 7 });
cos(23135, 'Adamant boots', 'feet', { def_stab: 9, def_slash: 9, def_crush: 9 });

// Masks + bandanas (cosmetic, no stats)
items.define({ id: 23136, name: 'Highwayman mask', examine: 'A classic masked-bandit mask.', value: 20000, category: 'armour', equipSlot: 'head', stats: {}, equipReqs: {} });
items.define({ id: 23137, name: 'Pirate bandana (red)', examine: 'A red pirate bandana.', value: 20000, category: 'armour', equipSlot: 'head', stats: {}, equipReqs: {} });
items.define({ id: 23138, name: 'Pirate bandana (blue)', examine: 'A blue pirate bandana.', value: 20000, category: 'armour', equipSlot: 'head', stats: {}, equipReqs: {} });
items.define({ id: 23139, name: 'Pirate bandana (brown)', examine: 'A brown pirate bandana.', value: 20000, category: 'armour', equipSlot: 'head', stats: {}, equipReqs: {} });
items.define({ id: 23140, name: 'Pirate bandana (white)', examine: 'A white pirate bandana.', value: 20000, category: 'armour', equipSlot: 'head', stats: {}, equipReqs: {} });

// Trophies
items.define({ id: 23141, name: 'Easy casket trophy pennant', examine: 'A displayable trophy from completing an easy clue.', value: 50000, category: 'misc', tradeable: false, weight: 1 });
items.define({ id: 23142, name: 'Amulet of fury (Easy recolour)', examine: 'A cosmetic recoloured amulet of fury. No bonus stats.', value: 60000, category: 'jewellery', equipSlot: 'neck', stats: {}, equipReqs: {} });
items.define({ id: 23143, name: 'Blue headband', examine: 'A classic headband.', value: 5000, category: 'armour', equipSlot: 'head', stats: {}, equipReqs: {} });
items.define({ id: 23144, name: 'Brown headband', examine: 'A classic headband.', value: 5000, category: 'armour', equipSlot: 'head', stats: {}, equipReqs: {} });

// Beginner overflow (ids 23050+ — referenced from collection-log.json beginner)
items.define({ id: 23050, name: 'Wooden shield (t)', examine: 'A trimmed wooden shield.', value: 2000, category: 'armour', equipSlot: 'shield', stats: { def_stab: 3 }, equipReqs: {} });
items.define({ id: 23051, name: "Monk's robe (trimmed)", examine: "Trimmed monk's robe.", value: 4000, category: 'armour', equipSlot: 'body', stats: { prayer: 2 }, equipReqs: {} });
items.define({ id: 23052, name: 'Amulet of bounty', examine: 'A cosmetic clue amulet from beginner caskets.', value: 3000, category: 'jewellery', equipSlot: 'neck', stats: {}, equipReqs: {} });

// ══════════════════════════════════════════════════════════════════════════════
// EASY TIER CLUE STEPS — 45 steps
// Designed to:
//   - Span all 9 regions (Heartlands heavy early, Boneyard/Moryskah mid)
//   - Mix coordinate, riddle, emote, combat (L20-40), and simple puzzle steps
//   - Require no quest gates (unlike Hard/Elite)
// Shuffled per roll by treasure-trails.js:generateClue('easy'); default length 5.
// ══════════════════════════════════════════════════════════════════════════════

// Heartlands (15 steps)
defineClueStep({ id: 'ez1',  tier: 'easy', type: 'coordinate', description: 'Dig at 110, 98 between the farm gate and the cow pasture.', region: 'Heartlands' });
defineClueStep({ id: 'ez2',  tier: 'easy', type: 'riddle', description: 'Sells bronze and iron. Strikes when the anvil is hot.', solution: 'Smith Kael', region: 'Heartlands' });
defineClueStep({ id: 'ez3',  tier: 'easy', type: 'emote', description: 'Bow at the Heartlands town fountain.', region: 'Heartlands' });
defineClueStep({ id: 'ez4',  tier: 'easy', type: 'coordinate', description: 'Dig at 82, 112 at the windmill shadow.', region: 'Heartlands' });
defineClueStep({ id: 'ez5',  tier: 'easy', type: 'combat', description: 'Kill a goblin raider (level 12) and search its remains.', combatLevel: 12, region: 'Heartlands' });
defineClueStep({ id: 'ez6',  tier: 'easy', type: 'riddle', description: 'I watch the gate but never speak. Who am I?', solution: 'Town Guard', region: 'Heartlands' });
defineClueStep({ id: 'ez7',  tier: 'easy', type: 'coordinate', description: 'Dig at 95, 126 behind the chapel.', region: 'Heartlands' });
defineClueStep({ id: 'ez8',  tier: 'easy', type: 'emote', description: 'Wave at the Heartlands bank entrance.', region: 'Heartlands' });
defineClueStep({ id: 'ez9',  tier: 'easy', type: 'riddle', description: 'She hands out flour when the mill spins. Who is she?', solution: 'Miller Rosa', region: 'Heartlands' });
defineClueStep({ id: 'ez10', tier: 'easy', type: 'coordinate', description: 'Dig at 108, 92 south of the smithy.', region: 'Heartlands' });
defineClueStep({ id: 'ez11', tier: 'easy', type: 'combat', description: 'Kill a farm brigand (level 14) and search its remains.', combatLevel: 14, region: 'Heartlands' });
defineClueStep({ id: 'ez12', tier: 'easy', type: 'emote', description: 'Clap at the Heartlands market square noon bell.', region: 'Heartlands' });
defineClueStep({ id: 'ez13', tier: 'easy', type: 'riddle', description: 'Five-fingered grain stealer. Kill it and pull a message from its teeth.', solution: 'Corn rat', region: 'Heartlands' });
defineClueStep({ id: 'ez14', tier: 'easy', type: 'puzzle', description: 'Solve the 3x3 sliding numbers tile (easy).', region: 'Heartlands' });
defineClueStep({ id: 'ez15', tier: 'easy', type: 'coordinate', description: 'Dig at 100, 138 at the roadside shrine.', region: 'Heartlands' });

// Saltbrine (6 steps) — fishing village
defineClueStep({ id: 'ez16', tier: 'easy', type: 'coordinate', description: 'Dig at 60, 150 on the Saltbrine pier head.', region: 'Saltbrine' });
defineClueStep({ id: 'ez17', tier: 'easy', type: 'riddle', description: 'She sells cod by the pound and rumours by the glance.', solution: 'Fishmonger Mara', region: 'Saltbrine' });
defineClueStep({ id: 'ez18', tier: 'easy', type: 'emote', description: 'Dance on the harbour dock at low tide.', region: 'Saltbrine' });
defineClueStep({ id: 'ez19', tier: 'easy', type: 'combat', description: 'Kill a reefdog (level 36) and search its remains.', combatLevel: 36, region: 'Saltbrine' });
defineClueStep({ id: 'ez20', tier: 'easy', type: 'coordinate', description: 'Dig at 55, 162 near the harbourmaster’s lodge.', region: 'Saltbrine' });
defineClueStep({ id: 'ez21', tier: 'easy', type: 'riddle', description: 'Drops barnacle shells — bites anglers who forget their nets.', solution: 'Reefdog', region: 'Saltbrine' });

// Sootworks (5 steps)
defineClueStep({ id: 'ez22', tier: 'easy', type: 'coordinate', description: 'Dig at 170, 78 outside the Forgemaster’s hall.', region: 'Sootworks' });
defineClueStep({ id: 'ez23', tier: 'easy', type: 'riddle', description: 'Tends fires, forgets his family. Who is the crazed miner?', solution: 'Crazed miner', region: 'Sootworks' });
defineClueStep({ id: 'ez24', tier: 'easy', type: 'emote', description: 'Bow at the Sootworks forge altar while wearing full bronze.', region: 'Sootworks' });
defineClueStep({ id: 'ez25', tier: 'easy', type: 'coordinate', description: 'Dig at 162, 85 near the coal chute.', region: 'Sootworks' });
defineClueStep({ id: 'ez26', tier: 'easy', type: 'combat', description: 'Kill a rust-golem (level 62) and search its remains.', combatLevel: 62, region: 'Sootworks' });

// Boneyard (5 steps) — desert
defineClueStep({ id: 'ez27', tier: 'easy', type: 'coordinate', description: 'Dig at 120, 155 at the Boneyard oasis palm.', region: 'Boneyard' });
defineClueStep({ id: 'ez28', tier: 'easy', type: 'riddle', description: 'Once a pharaoh, now only wraps and dust. Where does it rest?', solution: 'Tomb of the First Pharaoh', region: 'Boneyard' });
defineClueStep({ id: 'ez29', tier: 'easy', type: 'emote', description: 'Cheer at the pyramid entrance at dusk.', region: 'Boneyard' });
defineClueStep({ id: 'ez30', tier: 'easy', type: 'combat', description: 'Kill a shield scarab (level 42) and search its remains.', combatLevel: 42, region: 'Boneyard' });
defineClueStep({ id: 'ez31', tier: 'easy', type: 'coordinate', description: 'Dig at 135, 167 near a dune marker.', region: 'Boneyard' });

// Moryskah (5 steps) — undead swamp
defineClueStep({ id: 'ez32', tier: 'easy', type: 'coordinate', description: 'Dig at 175, 135 in the Moryskah village graveyard.', region: 'Moryskah' });
defineClueStep({ id: 'ez33', tier: 'easy', type: 'riddle', description: 'She brews potions of unlikely colours. Name her.', solution: 'Bog Witch Grael', region: 'Moryskah' });
defineClueStep({ id: 'ez34', tier: 'easy', type: 'emote', description: 'Yawn at the Moryskah village tavern.', region: 'Moryskah' });
defineClueStep({ id: 'ez35', tier: 'easy', type: 'coordinate', description: 'Dig at 165, 130 at the crossroads cairn.', region: 'Moryskah' });
defineClueStep({ id: 'ez36', tier: 'easy', type: 'combat', description: 'Kill a grave-spawn (level 38) and search its remains.', combatLevel: 38, region: 'Moryskah' });

// Veilwood (4 steps)
defineClueStep({ id: 'ez37', tier: 'easy', type: 'coordinate', description: 'Dig at 60, 95 at the mirror-deer clearing.', region: 'Veilwood' });
defineClueStep({ id: 'ez38', tier: 'easy', type: 'riddle', description: 'Antlered and crowned, he patrols the mossy grove. Who?', solution: 'King of the Wood', region: 'Veilwood' });
defineClueStep({ id: 'ez39', tier: 'easy', type: 'emote', description: 'Dance in the Veilwood elven village square.', region: 'Veilwood' });
defineClueStep({ id: 'ez40', tier: 'easy', type: 'coordinate', description: 'Dig at 50, 110 at the moonwell.', region: 'Veilwood' });

// Inkweald (3 steps) — dream forest
defineClueStep({ id: 'ez41', tier: 'easy', type: 'coordinate', description: 'Dig at 95, 200 at the ink-stained stump.', region: 'Inkweald' });
defineClueStep({ id: 'ez42', tier: 'easy', type: 'riddle', description: 'Footnote-sized but sharp. Kill one for a page.', solution: 'Footnote fiend', region: 'Inkweald' });
defineClueStep({ id: 'ez43', tier: 'easy', type: 'combat', description: 'Kill a page-spawn (level 20) and search its remains.', combatLevel: 20, region: 'Inkweald' });

// Glass Desert (2 steps)
defineClueStep({ id: 'ez44', tier: 'easy', type: 'coordinate', description: 'Dig at 215, 100 near the glass-smith outpost.', region: 'Glass Desert' });
defineClueStep({ id: 'ez45', tier: 'easy', type: 'emote', description: 'Jump for joy at the first crystal geode you find.', region: 'Glass Desert' });

// ── EASY REWARD TABLE ─────────────────────────────────────────────────────────

defineRewardTable('easy', {
  coinRange: [500, 2500],
  items: [
    // Black trim / gold variants
    { id: 23100, name: 'Black platebody (t)', weight: 3, min: 1, max: 1 },
    { id: 23101, name: 'Black plateskirt (t)', weight: 3, min: 1, max: 1 },
    { id: 23102, name: 'Black platelegs (t)', weight: 3, min: 1, max: 1 },
    { id: 23103, name: 'Black full helm (t)', weight: 3, min: 1, max: 1 },
    { id: 23104, name: 'Black kiteshield (t)', weight: 3, min: 1, max: 1 },
    { id: 23105, name: 'Black platebody (g)', weight: 3, min: 1, max: 1 },
    { id: 23106, name: 'Black plateskirt (g)', weight: 3, min: 1, max: 1 },
    { id: 23107, name: 'Black platelegs (g)', weight: 3, min: 1, max: 1 },
    { id: 23108, name: 'Black full helm (g)', weight: 3, min: 1, max: 1 },
    { id: 23109, name: 'Black kiteshield (g)', weight: 3, min: 1, max: 1 },
    // Studded / leather cosmetics
    { id: 23110, name: 'Studded chaps (trimmed)', weight: 4, min: 1, max: 1 },
    { id: 23111, name: 'Studded body (trimmed)', weight: 4, min: 1, max: 1 },
    { id: 23112, name: 'Leather body (gold)', weight: 4, min: 1, max: 1 },
    { id: 23113, name: 'Leather chaps (gold)', weight: 4, min: 1, max: 1 },
    // Wizard / monk cosmetics
    { id: 23114, name: 'Wizard hat (trimmed)', weight: 4, min: 1, max: 1 },
    { id: 23115, name: 'Wizard robe (trimmed)', weight: 4, min: 1, max: 1 },
    { id: 23116, name: 'Wizard skirt (trimmed)', weight: 4, min: 1, max: 1 },
    { id: 23117, name: "Monk's robe top (g)", weight: 4, min: 1, max: 1 },
    { id: 23118, name: "Monk's robe bottom (g)", weight: 4, min: 1, max: 1 },
    { id: 23119, name: 'Ham shirt (trimmed)', weight: 5, min: 1, max: 1 },
    // Bronze ornamentals
    { id: 23120, name: 'Large bronze bar (ornamental)', weight: 5, min: 1, max: 1 },
    { id: 23121, name: 'Bronze chain (t)', weight: 5, min: 1, max: 1 },
    // Plate ladder
    { id: 23122, name: 'Iron plate (t)', weight: 4, min: 1, max: 1 },
    { id: 23123, name: 'Steel plate (t)', weight: 4, min: 1, max: 1 },
    { id: 23124, name: 'Mithril plate (t)', weight: 4, min: 1, max: 1 },
    { id: 23125, name: 'Adamant plate (t)', weight: 4, min: 1, max: 1 },
    { id: 23126, name: 'Adamant plate (g)', weight: 4, min: 1, max: 1 },
    { id: 23127, name: 'Adamant helm (t)', weight: 4, min: 1, max: 1 },
    { id: 23128, name: 'Adamant helm (g)', weight: 4, min: 1, max: 1 },
    { id: 23129, name: 'Adamant kiteshield (t)', weight: 4, min: 1, max: 1 },
    { id: 23130, name: 'Adamant kiteshield (g)', weight: 4, min: 1, max: 1 },
    // Metal boots (bronze → adamant)
    { id: 23131, name: 'Bronze boots', weight: 5, min: 1, max: 1 },
    { id: 23132, name: 'Iron boots', weight: 5, min: 1, max: 1 },
    { id: 23133, name: 'Steel boots', weight: 5, min: 1, max: 1 },
    { id: 23134, name: 'Mithril boots', weight: 5, min: 1, max: 1 },
    { id: 23135, name: 'Adamant boots', weight: 5, min: 1, max: 1 },
    // Masks / bandanas
    { id: 23136, name: 'Highwayman mask', weight: 3, min: 1, max: 1 },
    { id: 23137, name: 'Pirate bandana (red)', weight: 3, min: 1, max: 1 },
    { id: 23138, name: 'Pirate bandana (blue)', weight: 3, min: 1, max: 1 },
    { id: 23139, name: 'Pirate bandana (brown)', weight: 3, min: 1, max: 1 },
    { id: 23140, name: 'Pirate bandana (white)', weight: 3, min: 1, max: 1 },
    // Trophy + headbands
    { id: 23141, name: 'Easy casket trophy pennant', weight: 1, min: 1, max: 1 },
    { id: 23142, name: 'Amulet of fury (Easy recolour)', weight: 1, min: 1, max: 1 },
    { id: 23143, name: 'Blue headband', weight: 5, min: 1, max: 1 },
    { id: 23144, name: 'Brown headband', weight: 5, min: 1, max: 1 },
    // Misc consumables
    { id: 11357, name: 'Death rune', weight: 3, min: 10, max: 40 },
    { id: 12503, name: 'Uncut ruby', weight: 2, min: 1, max: 2 },
  ],
});

// ── SUMMARY ──────────────────────────────────────────────────────────────────

console.log('[aelgard] Easy clue tier: 45 steps + 45 reward items registered (waveB4 H8)');

module.exports = {
  tier: 'easy',
  totalSteps: 45,
  rewardItemCount: 45,
};
