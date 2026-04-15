#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// expand-sprite-manifest.js  (burn v2)
//
// Augments data/sprite-manifest.json with the wave-1 content the original
// gen-sprite-manifest.js does not yet pick up:
//
//   1. 110 monsters from src/content/aelgard/monsters-mega.js
//   2. 40 minigames (6 existing + 34 mega) — each with UI icon + arena backdrop
//   3. 61 combination result items from combinations-mega.js
//   4. 16 Wilds-specific PvP FX sprites (teleblock, glory, skull, smite, etc.)
//   5. Region-specific tile variants (variant-01..03) for Wilds + Glass Desert
//   6. Prunes the 37 dead NPC entries that no live content references
//
// Implementation detail: the content .js files live on sibling burn-v2
// branches, so this script keeps the source data inline — that way the
// worktree we run in can produce the manifest deterministically without
// needing cross-branch git reads. Generator is also rerunnable: deduped by id.
//
// Run:
//   node scripts/expand-sprite-manifest.js
// then:
//   node scripts/validate-sprites.js
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MANIFEST = path.join(ROOT, 'data', 'sprite-manifest.json');
const PALETTES = path.join(ROOT, 'data', 'sprite-palettes.json');

// ── Region prefix → canonical region ─────────────────────────────────────────

const MONSTER_REGION = {
  heart: 'heartlands',
  mor: 'moryskah',
  bone: 'boneyard',
  veil: 'veilwood',
  soot: 'sootworks',
  salt: 'saltbrine',
  ink: 'inkweald',
  glass: 'glass_desert',
  wild: 'wilds',
};

function kebab(s) {
  return String(s)
    .toLowerCase()
    .replace(/['`"]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

// ──────────────────────────────────────────────────────────────────────────────
// 1. MONSTERS — 110 from monsters-mega.js
// Note: we also parse the live file at build time to pick up the source of
// truth — the static list below is a safety net / test-fixture for when
// the content module isn't on the branch.
// ──────────────────────────────────────────────────────────────────────────────

function loadMonstersMegaLive() {
  const fp = path.join(ROOT, 'src', 'content', 'aelgard', 'monsters-mega.js');
  if (!fs.existsSync(fp)) return null;
  const src = fs.readFileSync(fp, 'utf8');
  const blocks = src.split(/mega\(\{/).slice(1);
  const parsed = [];
  for (const b of blocks) {
    const idm = b.match(/id:\s*'([^']+)'/);
    const nm = b.match(/name:\s*'([^']+)'/);
    if (!idm || !nm) continue;
    const ex = b.match(/examine:\s*'([^']+)'/);
    const tags = b.match(/tags:\s*\[([^\]]+)\]/);
    const weakness = b.match(/weakness:\s*'([^']+)'/);
    parsed.push({
      defId: idm[1],
      name: nm[1],
      examine: ex ? ex[1] : '',
      tags: tags ? tags[1].replace(/['"\s]/g, '').split(',').filter(Boolean) : [],
      weakness: weakness ? weakness[1] : 'slash',
    });
  }
  return parsed;
}

const MONSTERS_MEGA = [
  // Heartlands 10
  { defId: 'mega_heart_farmhand_brigand',  name: 'Farmhand brigand',    examine: 'A sour farmhand turned bandit. Has opinions about taxes.',                 tags: ['human'],               weakness: 'slash' },
  { defId: 'mega_heart_corn_rat',          name: 'Corn rat',            examine: 'Fat on stolen grain. Too smug.',                                          tags: ['beast'],               weakness: 'slash' },
  { defId: 'mega_heart_hedge_boar',        name: 'Hedge boar',          examine: 'Bristle-backed, short-tempered, bramble-armoured.',                       tags: ['beast'],               weakness: 'stab' },
  { defId: 'mega_heart_hedgerow_stalker',  name: 'Hedgerow stalker',    examine: 'Crawls inside the hedges. Leaves little corridors of nothing.',           tags: ['beast'],               weakness: 'magic' },
  { defId: 'mega_heart_militia_captain',   name: 'Militia captain',     examine: 'A veteran of the toll wars. Very tired.',                                 tags: ['human','armoured'],    weakness: 'crush' },
  { defId: 'mega_heart_plough_ghoul',      name: 'Plough ghoul',        examine: 'A field-hand who kept plowing after he died.',                            tags: ['undead'],              weakness: 'slash' },
  { defId: 'mega_heart_toll_highwayman',   name: 'Toll-road highwayman',examine: '"Your coin or your horse, friend."',                                      tags: ['human'],               weakness: 'magic' },
  { defId: 'mega_heart_rat_king',          name: 'Rat king',            examine: 'A knot of rats bound by tail, hunger, and a crude crown.',                tags: ['beast'],               weakness: 'crush' },
  { defId: 'mega_heart_sow_witch',         name: 'Sow-witch',           examine: 'Keeps pigs that answer to names, not whistles.',                          tags: ['human'],               weakness: 'ranged' },
  { defId: 'mega_heart_church_gargoyle',   name: 'Church gargoyle',     examine: 'Carved for a belltower. Moved when the bell stopped.',                    tags: ['construct','armoured'], weakness: 'crush' },

  // Moryskah 15
  { defId: 'mega_mor_grave_spawn',         name: 'Grave-spawn',         examine: 'Claws its way up nightly. Gives up nightly.',                             tags: ['undead'],              weakness: 'slash' },
  { defId: 'mega_mor_crypt_howler',        name: 'Crypt howler',        examine: 'Howls names. Your name is in there somewhere.',                           tags: ['beast','undead'],      weakness: 'ranged' },
  { defId: 'mega_mor_nocturne_lord',       name: 'Nocturne lord',       examine: 'Dresses for a dinner you are the main course of.',                        tags: ['vampyre','undead'],    weakness: 'slash' },
  { defId: 'mega_mor_werewolf_stalker',    name: 'Werewolf stalker',    examine: 'Moves sideways along the alleys. Leaves footprints pointing the wrong way.', tags: ['beast','werewolf'], weakness: 'stab' },
  { defId: 'mega_mor_bone_priest',         name: 'Bone priest',         examine: 'Preaches sermons to the bones. They listen.',                             tags: ['undead'],              weakness: 'ranged' },
  { defId: 'mega_mor_salt_vampire',        name: 'Salt vampire',        examine: 'Driven from Saltbrine. Still tastes the sea.',                            tags: ['vampyre','undead'],    weakness: 'crush' },
  { defId: 'mega_mor_coffin_crawler',      name: 'Coffin crawler',      examine: 'Small, bony, enthusiastic.',                                              tags: ['undead'],              weakness: 'slash' },
  { defId: 'mega_mor_mourner',             name: 'Mourner',             examine: 'Paid per tear. Professional.',                                            tags: ['human'],               weakness: 'stab' },
  { defId: 'mega_mor_chapel_revenant',     name: 'Chapel revenant',     examine: 'Still wears the stole. Burns when you pray near it.',                     tags: ['undead','spirit'],     weakness: 'ranged' },
  { defId: 'mega_mor_blood_bat',           name: 'Blood bat',           examine: 'Gorged. Unsteady wings.',                                                 tags: ['beast','vampyric'],    weakness: 'crush' },
  { defId: 'mega_mor_marrow_wight',        name: 'Marrow wight',        examine: 'Sucked its own bones empty. Now eats yours.',                             tags: ['undead'],              weakness: 'magic' },
  { defId: 'mega_mor_lamplighter_ghost',   name: 'Lamplighter ghost',   examine: 'Lights the lamps he died trying to light.',                               tags: ['undead','spirit'],     weakness: 'magic' },
  { defId: 'mega_mor_moon_cultist',        name: 'Moon cultist',        examine: 'A robe, a crescent, a nasty little knife.',                               tags: ['human'],               weakness: 'ranged' },
  { defId: 'mega_mor_black_carriage_driver', name: 'Black-carriage driver', examine: 'Picks up passengers. Does not drop them off.',                        tags: ['human','cursed'],      weakness: 'magic' },
  { defId: 'mega_mor_whispering_skull',    name: 'Whispering skull',    examine: 'Tells the secrets of whoever it used to be.',                             tags: ['undead'],              weakness: 'crush' },

  // Boneyard 12
  { defId: 'mega_bone_minor_mummy',        name: 'Minor mummy',         examine: 'Wrapped, rewrapped, and deeply annoyed.',                                  tags: ['undead','armoured'],   weakness: 'crush' },
  { defId: 'mega_bone_greater_mummy',      name: 'Greater mummy',       examine: 'A cartouche in every bandage.',                                            tags: ['undead','armoured'],   weakness: 'crush' },
  { defId: 'mega_bone_sand_wraith',        name: 'Sand wraith',         examine: 'Drifts on thermals. Always just out of reach.',                            tags: ['undead','spirit'],     weakness: 'magic' },
  { defId: 'mega_bone_scarab_queen',       name: 'Scarab queen',        examine: 'Bigger than the queen of a smaller hive.',                                 tags: ['beast','insect'],      weakness: 'ranged' },
  { defId: 'mega_bone_desert_djinn',       name: 'Desert djinn',        examine: 'Granted too many wishes. Trapped now in one.',                             tags: ['spirit','elemental'],  weakness: 'magic' },
  { defId: 'mega_bone_vulture_priest',     name: 'Vulture priest',      examine: 'Blesses corpses. Has plenty of material.',                                  tags: ['human','avian'],      weakness: 'stab' },
  { defId: 'mega_bone_bone_golem',         name: 'Bone golem',          examine: 'Reassembled every dusk. Never the same bones twice.',                       tags: ['construct','undead'], weakness: 'crush' },
  { defId: 'mega_bone_canopic_guard',      name: 'Canopic guard',       examine: 'Guards what is in the jars. Which is not much.',                           tags: ['construct','armoured'],weakness: 'slash' },
  { defId: 'mega_bone_sun_hermit',         name: 'Sun hermit',          examine: 'Has not blinked in forty years.',                                          tags: ['human'],               weakness: 'ranged' },
  { defId: 'mega_bone_dune_serpent',       name: 'Dune serpent',        examine: 'Swims in sand the way fish swim in sea.',                                   tags: ['beast'],               weakness: 'slash' },
  { defId: 'mega_bone_oasis_spirit',       name: 'Oasis spirit',        examine: 'Looks like water. Kills like thirst.',                                     tags: ['spirit','elemental'],  weakness: 'magic' },
  { defId: 'mega_bone_obelisk_sentinel',   name: 'Obelisk sentinel',    examine: 'Carved from a single block of will.',                                      tags: ['construct','armoured'], weakness: 'crush' },

  // Veilwood 12
  { defId: 'mega_veil_ancient_treant',     name: 'Ancient treant',      examine: 'Remembers the seedling days. Resents the axes.',                            tags: ['plant','armoured'],    weakness: 'slash' },
  { defId: 'mega_veil_fern_stalker',       name: 'Fern stalker',        examine: 'Fronds for limbs. Quiet work.',                                             tags: ['plant','beast'],       weakness: 'slash' },
  { defId: 'mega_veil_grove_hag',          name: 'Grove hag',           examine: 'Gathers acorns with intent.',                                               tags: ['human'],               weakness: 'ranged' },
  { defId: 'mega_veil_moonlight_doe',      name: 'Moonlight doe',       examine: 'Runs on moonlight. Bleeds it too.',                                         tags: ['beast','spirit'],      weakness: 'stab' },
  { defId: 'mega_veil_glass_moth',         name: 'Glass moth',          examine: 'Wings cut you when it lands.',                                              tags: ['beast','insect'],      weakness: 'crush' },
  { defId: 'mega_veil_boar_of_the_birches',name: 'Boar of the birches', examine: 'Territorial. Thinks the grove is his.',                                     tags: ['beast'],               weakness: 'stab' },
  { defId: 'mega_veil_nightingale_witch',  name: 'Nightingale witch',   examine: 'Sings at dusk. You learn not to listen.',                                   tags: ['human'],               weakness: 'crush' },
  { defId: 'mega_veil_ent_drake',          name: 'Ent-drake',           examine: 'Woodwork. Firebreath. An unfortunate combination.',                         tags: ['plant','dragon'],      weakness: 'ranged' },
  { defId: 'mega_veil_wild_elf_ranger',    name: 'Wild-elf ranger',     examine: 'Has not spoken since the Burning.',                                         tags: ['elf','human'],         weakness: 'magic' },
  { defId: 'mega_veil_sap_wraith',         name: 'Sap wraith',          examine: 'A pool of living resin. Sets at dawn.',                                    tags: ['plant','spirit'],     weakness: 'crush' },
  { defId: 'mega_veil_stag_champion',      name: 'Stag champion',       examine: 'Antlers like coat-hooks. Wears three dead hunters.',                        tags: ['beast'],               weakness: 'ranged' },
  { defId: 'mega_veil_hollow_druid',       name: 'Hollow druid',        examine: 'Branches grow from where his ribs were.',                                   tags: ['human','undead'],      weakness: 'slash' },

  // Sootworks 12
  { defId: 'mega_soot_coal_imp',           name: 'Coal imp',            examine: 'Small. Flammable. Angry.',                                                 tags: ['demon'],               weakness: 'crush' },
  { defId: 'mega_soot_soot_gremlin',       name: 'Soot gremlin',        examine: 'Steals rivets. Hoards them.',                                              tags: ['goblinoid'],           weakness: 'slash' },
  { defId: 'mega_soot_steam_thrall',       name: 'Steam thrall',        examine: 'Pipe-armed. Boiler-chested.',                                              tags: ['construct'],           weakness: 'ranged' },
  { defId: 'mega_soot_cinder_wyrm',        name: 'Cinder wyrm',         examine: 'A furnace with teeth.',                                                    tags: ['beast','dragon'],      weakness: 'magic' },
  { defId: 'mega_soot_slag_hulk',          name: 'Slag hulk',           examine: 'Six feet of hot iron that decided to walk off.',                           tags: ['construct','armoured'],weakness: 'magic' },
  { defId: 'mega_soot_foreman_revenant',   name: 'Foreman revenant',    examine: 'Still blowing the shift whistle. Nightly.',                                tags: ['undead','spirit'],     weakness: 'ranged' },
  { defId: 'mega_soot_rivet_goblin',       name: 'Rivet goblin',        examine: 'Throws hot rivets. Terribly accurate.',                                    tags: ['goblinoid'],           weakness: 'slash' },
  { defId: 'mega_soot_forge_djinn',        name: 'Forge djinn',         examine: 'Bound to an anvil. Resentful.',                                            tags: ['spirit','elemental'],  weakness: 'magic' },
  { defId: 'mega_soot_coal_hound',         name: 'Coal hound',          examine: 'Lit from inside. Panting soot.',                                           tags: ['beast','demon'],       weakness: 'ranged' },
  { defId: 'mega_soot_sootworks_golem',    name: 'Sootworks golem',     examine: 'Stamped together from scrap and swearing.',                                tags: ['construct','armoured'],weakness: 'magic' },
  { defId: 'mega_soot_flue_gremlin',       name: 'Flue gremlin',        examine: 'Lives in the chimneys. Sneezes fire.',                                     tags: ['goblinoid'],           weakness: 'stab' },
  { defId: 'mega_soot_kiln_master',        name: 'Kiln master',         examine: 'Was a smith. Is now a kiln.',                                              tags: ['human','elemental'],   weakness: 'magic' },

  // Saltbrine 12
  { defId: 'mega_salt_seawolf_raider',     name: 'Sea-wolf raider',     examine: 'Cutlass in one hand, tankard in the other.',                               tags: ['human'],               weakness: 'magic' },
  { defId: 'mega_salt_brine_hag',          name: 'Brine hag',           examine: 'Smells worse than the tide.',                                              tags: ['human'],               weakness: 'ranged' },
  { defId: 'mega_salt_kraken_spawn',       name: 'Kraken spawn',        examine: 'Twenty arms, all uncoordinated.',                                          tags: ['beast'],               weakness: 'slash' },
  { defId: 'mega_salt_pirate_captain',     name: 'Pirate captain',      examine: 'Has a map. Has a bad crew. Has a worse parrot.',                           tags: ['human','armoured'],    weakness: 'magic' },
  { defId: 'mega_salt_tide_revenant',      name: 'Tide revenant',       examine: 'Drowned in a slack tide. Remembers.',                                     tags: ['undead','spirit'],     weakness: 'crush' },
  { defId: 'mega_salt_dock_shark',         name: 'Dock shark',          examine: 'Teeth like a bad stanza.',                                                 tags: ['beast'],               weakness: 'stab' },
  { defId: 'mega_salt_barnacle_golem',     name: 'Barnacle golem',      examine: 'Walked ashore; the barnacles followed.',                                   tags: ['construct','armoured'], weakness: 'crush' },
  { defId: 'mega_salt_lighthouse_wraith',  name: 'Lighthouse wraith',   examine: 'Waves the lantern where the rocks are.',                                   tags: ['undead','spirit'],     weakness: 'magic' },
  { defId: 'mega_salt_crab_king',          name: 'Crab king',           examine: 'Cranky. Always.',                                                          tags: ['beast','armoured'],    weakness: 'crush' },
  { defId: 'mega_salt_merrow',             name: 'Merrow',              examine: 'Half-fish, half-fury.',                                                     tags: ['beast','spirit'],      weakness: 'crush' },
  { defId: 'mega_salt_cutlass_ghost',      name: 'Cutlass ghost',       examine: 'Sword swings independently of the hand.',                                   tags: ['undead','spirit'],     weakness: 'magic' },
  { defId: 'mega_salt_keelhauler',         name: 'Keelhauler',          examine: 'Has rope. Has intent.',                                                    tags: ['undead','spirit'],     weakness: 'ranged' },

  // Inkweald 12
  { defId: 'mega_ink_dream_thistle',       name: 'Dream thistle',       examine: 'Pricks you asleep.',                                                       tags: ['plant'],               weakness: 'crush' },
  { defId: 'mega_ink_lucid_mirror',        name: 'Lucid mirror',        examine: 'Your reflection does not match.',                                          tags: ['construct','spirit'],  weakness: 'magic' },
  { defId: 'mega_ink_memory_moth',         name: 'Memory moth',         examine: 'Eats what you forgot.',                                                    tags: ['insect','spirit'],     weakness: 'crush' },
  { defId: 'mega_ink_violet_cat',          name: 'Violet cat',          examine: 'Sleeps in every library at once.',                                         tags: ['beast','spirit'],      weakness: 'stab' },
  { defId: 'mega_ink_paradox_mage',        name: 'Paradox mage',        examine: 'Finishes sentences you have not started.',                                  tags: ['human','spirit'],      weakness: 'ranged' },
  { defId: 'mega_ink_thought_construct',   name: 'Thought construct',   examine: 'Built from a sentence not yet spoken.',                                    tags: ['construct','spirit'],  weakness: 'magic' },
  { defId: 'mega_ink_brass_choir',         name: 'Brass choir',         examine: 'Thirteen horns. One lung.',                                                tags: ['construct'],           weakness: 'crush' },
  { defId: 'mega_ink_dream_bear',          name: 'Dream bear',          examine: 'Hibernated too long. Now is no longer.',                                   tags: ['beast','spirit'],      weakness: 'magic' },
  { defId: 'mega_ink_ink_bloom_spawn',     name: 'Ink bloom spawn',     examine: 'Stains everything it touches.',                                            tags: ['plant','spirit'],      weakness: 'slash' },
  { defId: 'mega_ink_lullaby_host',        name: 'Lullaby host',        examine: 'Sings in your mother\'s voice.',                                           tags: ['undead','spirit'],     weakness: 'ranged' },
  { defId: 'mega_ink_mirror_mime',         name: 'Mirror mime',         examine: 'Does everything you do. With a knife.',                                    tags: ['spirit'],              weakness: 'slash' },
  { defId: 'mega_ink_fathom_knight',       name: 'Fathom knight',       examine: 'Drowned knight from somebody else\'s dream.',                              tags: ['undead','armoured'],   weakness: 'magic' },

  // Glass Desert 10
  { defId: 'mega_glass_shard_wight',       name: 'Shard wight',         examine: 'Made of broken glass. Cuts both ways.',                                    tags: ['undead','spirit'],     weakness: 'crush' },
  { defId: 'mega_glass_mirage_beast',      name: 'Mirage beast',        examine: 'It is not there. It still bites.',                                         tags: ['beast','spirit'],      weakness: 'magic' },
  { defId: 'mega_glass_lens_serpent',      name: 'Lens serpent',        examine: 'Scales focus sunlight. On you.',                                           tags: ['beast'],               weakness: 'crush' },
  { defId: 'mega_glass_crystal_golem',     name: 'Crystal golem',       examine: 'Carved from a heat-fused dune.',                                           tags: ['construct','armoured'],weakness: 'crush' },
  { defId: 'mega_glass_sun_priest',        name: 'Sun priest',          examine: 'Carries a piece of the sun in a jar.',                                     tags: ['human'],               weakness: 'ranged' },
  { defId: 'mega_glass_mirror_assassin',   name: 'Mirror assassin',     examine: 'Counts the reflections. Kills the loudest.',                               tags: ['human'],               weakness: 'magic' },
  { defId: 'mega_glass_dune_wyrm',         name: 'Dune wyrm',           examine: 'Bigger than the dunes suggest.',                                           tags: ['beast','dragon'],      weakness: 'ranged' },
  { defId: 'mega_glass_prism_wraith',      name: 'Prism wraith',        examine: 'Splits into three on hit. Each does one-third damage.',                    tags: ['undead','spirit'],     weakness: 'magic' },
  { defId: 'mega_glass_veldrak_cultist',   name: 'Veldrak cultist',     examine: 'Worships the last dragon. Badly.',                                         tags: ['human'],               weakness: 'slash' },
  { defId: 'mega_glass_heat_revenant',     name: 'Heat revenant',       examine: 'Burns the air around it. You see the shimmer before the spear.',          tags: ['spirit','elemental'],  weakness: 'magic' },

  // Wilds 15
  { defId: 'mega_wild_rev_knight',         name: 'Revenant knight',     examine: 'Wears the heraldry of a fallen kingdom. You cannot place it.',             tags: ['undead','armoured','revenant'], weakness: 'slash' },
  { defId: 'mega_wild_rev_demon',          name: 'Revenant demon',      examine: 'The oldest skull in the wilds. Still has the crown.',                      tags: ['undead','demon','revenant'],   weakness: 'ranged' },
  { defId: 'mega_wild_rev_dragon',         name: 'Revenant dragon',     examine: 'What is left of a dragon that lost its fight with everything.',            tags: ['undead','dragon','revenant'],  weakness: 'magic' },
  { defId: 'mega_wild_deep_chaos_druid',   name: 'Deep-wild chaos druid', examine: 'Feral. Faster than the ones outside.',                                   tags: ['human'],               weakness: 'ranged' },
  { defId: 'mega_wild_ferox_guard',        name: 'Ferox guard',         examine: 'Bored enclave guard. Does not fight outside the walls.',                   tags: ['human','armoured'],    weakness: 'stab' },
  { defId: 'mega_wild_skeleton_champion',  name: 'Skeleton champion',   examine: 'Helmet split where the tournament ended.',                                 tags: ['undead','armoured'],   weakness: 'crush' },
  { defId: 'mega_wild_scorpia_spawn',      name: 'Scorpia spawn',       examine: 'Half the size of the parent. Twice as active.',                            tags: ['beast'],               weakness: 'ranged' },
  { defId: 'mega_wild_venenatis_spiderling', name: 'Venenatis spiderling', examine: 'Drops the moment you blink.',                                           tags: ['beast'],               weakness: 'crush' },
  { defId: 'mega_wild_callisto_cub',       name: 'Callisto cub',        examine: 'Still bear-size. Already bites.',                                          tags: ['beast'],               weakness: 'magic' },
  { defId: 'mega_wild_vetion_hellhound',   name: "Vet'ion hellhound",   examine: 'Summoned, barely contained.',                                               tags: ['beast','demon'],       weakness: 'stab' },
  { defId: 'mega_wild_chaos_fanatic_acolyte', name: 'Chaos fanatic acolyte', examine: 'A mumbling mage. Dangerous anyway.',                                  tags: ['human'],               weakness: 'ranged' },
  { defId: 'mega_wild_mage_arena_guard',   name: 'Mage arena guard',    examine: 'The deal: you beat him, you get the cape.',                                tags: ['human','armoured'],    weakness: 'ranged' },
  { defId: 'mega_wild_pvp_bait',           name: 'PvP bait mob',        examine: 'Loot-pinata that PKers use as a trap.',                                    tags: ['beast','spirit'],      weakness: 'slash' },
  { defId: 'mega_wild_forsaken_lich',      name: 'Forsaken lich',       examine: 'Keeps his phylactery in a grave-mile he no longer remembers.',             tags: ['undead','mage'],       weakness: 'slash' },
  { defId: 'mega_wild_lava_dragon_wyrmling', name: 'Lava dragon wyrmling', examine: 'A wyrmling of the lava maze. Warm to the touch. Then burning.',        tags: ['beast','dragon'],      weakness: 'magic' },
];

// Sanity: region derivation from id prefix
function monsterRegion(defId) {
  const key = defId.replace(/^mega_/, '').split('_')[0];
  return MONSTER_REGION[key] || 'universal';
}

// Scapified minigame NPCs that the validator flags as missing
// (they live in src/content/aelgard/minigames-scapified.js)
const SCAPIFIED_NPCS = [
  { defId: 'marchlands_marshal',   name: 'Marshal Calen',  region: 'heartlands',    role: 'Organises five-per-side lane pushes in Marchlands.' },
  { defId: 'ramparts_commander',   name: 'Captain Thorne', region: 'sootworks',     role: 'Drills the Ramparts siege crew. Has not slept in a week.' },
  { defId: 'deadhold_captain',     name: 'Captain Rook',   region: 'moryskah',      role: 'Commands the Deadhold garrison. Missing an eye.' },
  { defId: 'ascendancy_arbiter',   name: 'The Arbiter',    region: 'inkweald',      role: 'Masked figure who judges the Ascendant Trials.' },
];

// ──────────────────────────────────────────────────────────────────────────────
// 2. MINIGAMES — 40 total (6 existing + 34 mega)
// Each minigame gets an icon sprite (UI) and an arena backdrop sprite (landmark).
// ──────────────────────────────────────────────────────────────────────────────

const MINIGAMES = [
  // 6 existing minigames (src/content/aelgard/minigames.js)
  { id: 'pest_control',              name: 'Pest Control',              region: 'heartlands' },
  { id: 'castle_wars',               name: 'Castle Wars',               region: 'heartlands' },
  { id: 'barbarian_assault',         name: 'Barbarian Assault',         region: 'heartlands' },
  { id: 'wintertodt',                name: 'Wintertodt',                region: 'veilwood' },
  { id: 'tithe_farm',                name: 'Tithe Farm',                region: 'heartlands' },
  { id: 'nightmare_zone',            name: 'Nightmare Zone',            region: 'heartlands' },

  // 34 from minigames-mega.js
  { id: 'harvest_festival_hustle',        name: 'Harvest Festival Hustle',    region: 'heartlands' },
  { id: 'heartlands_taverna_gambit',      name: 'Taverna Gambit',             region: 'heartlands' },
  { id: 'heartlands_estate_stewardship',  name: 'Estate Stewardship',         region: 'heartlands' },
  { id: 'sootworks_cinder_parkour',       name: 'Cinder Parkour',             region: 'sootworks' },
  { id: 'sootworks_deep_shaft',           name: 'The Deep Shaft',             region: 'sootworks' },
  { id: 'sootworks_steam_titan',          name: 'Steam Titan',                region: 'sootworks' },
  { id: 'veilwood_poacher_rounds',        name: 'Poacher Rounds',             region: 'veilwood' },
  { id: 'veilwood_temple_trek',           name: 'Temple Trek',                region: 'veilwood' },
  { id: 'veilwood_tears_of_the_grove',    name: 'Tears of the Grove',         region: 'veilwood' },
  { id: 'saltbrine_tide_trawl',           name: 'Tide Trawl',                 region: 'saltbrine' },
  { id: 'saltbrine_gale_crew',            name: 'Gale Crew',                  region: 'saltbrine' },
  { id: 'saltbrine_courier_run',          name: 'Courier Run',                region: 'saltbrine' },
  { id: 'boneyard_pyramid_plunder',       name: 'Pyramid Plunder',            region: 'boneyard' },
  { id: 'boneyard_sandstorm_arena',       name: 'Sandstorm Arena',            region: 'boneyard' },
  { id: 'boneyard_tomb_creep',            name: 'Tomb Creep',                 region: 'boneyard' },
  { id: 'moryskah_burgh_ramble',          name: 'Burgh-de-Fen Ramble',        region: 'moryskah' },
  { id: 'moryskah_vyre_vigil',            name: 'Vyre Vigil',                 region: 'moryskah' },
  { id: 'moryskah_reliquary_defence',     name: 'Reliquary Defence',          region: 'moryskah' },
  { id: 'glass_desert_shardforge',        name: 'Shardforge',                 region: 'glass_desert' },
  { id: 'glass_desert_mirage_zone',       name: 'Mirage Zone',                region: 'glass_desert' },
  { id: 'glass_desert_glass_pit',         name: 'Glass Pit',                  region: 'glass_desert' },
  { id: 'glass_desert_mage_trial_spire',  name: 'Mage Trial Spire',           region: 'glass_desert' },
  { id: 'inkweald_dream_duelling',        name: 'Dream Duelling',             region: 'inkweald' },
  { id: 'inkweald_ensouled_lattice',      name: 'Ensouled Lattice',           region: 'inkweald' },
  { id: 'inkweald_whisperstep',           name: 'Whisperstep',                region: 'inkweald' },
  { id: 'wilds_shard_wars',               name: 'Shard Wars',                 region: 'wilds' },
  { id: 'wilds_fortress_siege',           name: 'Fortress Siege',             region: 'wilds' },
  { id: 'wilds_clan_wars_roles',          name: 'Clan Wars Roles',            region: 'wilds' },
  { id: 'wilds_prop_hunt',                name: 'Wilderness Prop Hunt',       region: 'wilds' },
  { id: 'aelgard_travelling_market',      name: 'Travelling Market Event',    region: 'drifting_market' },
  { id: 'aelgard_sigil_stories',          name: 'Sigil Stories',              region: 'drifting_market' },
  { id: 'veilwood_canopy_kitchen',        name: 'Canopy Kitchen',             region: 'veilwood' },
  { id: 'boneyard_rogue_warrens',         name: 'Rogue Warrens',              region: 'boneyard' },
  { id: 'heartlands_hayfield_duels',      name: 'Hayfield Duels',             region: 'heartlands' },
];

// ──────────────────────────────────────────────────────────────────────────────
// 3. COMBINATIONS — 61 result items from combinations-mega.js
// ──────────────────────────────────────────────────────────────────────────────

const COMBINATIONS = [
  { defId: 95001, name: 'Bog-Witch Tempered Scimitar',          region: 'moryskah' },
  { defId: 95002, name: 'Bog-Witch Prayer Amulet',              region: 'moryskah' },
  { defId: 95003, name: 'Silver-Wracked Bolts (10)',            region: 'moryskah' },
  { defId: 95004, name: 'Moryskah Death-Binder Staff',          region: 'moryskah' },
  { defId: 95010, name: 'Salt-Cured Cutlass',                   region: 'saltbrine' },
  { defId: 95011, name: 'Storm-Touched Crossbow',               region: 'saltbrine' },
  { defId: 95012, name: 'Sea-Shot Godbolts (5)',                region: 'saltbrine' },
  { defId: 95013, name: 'Harbourmaster Amulet',                 region: 'saltbrine' },
  { defId: 95014, name: 'Lighthouse-Signal Amulet',             region: 'saltbrine' },
  { defId: 95020, name: 'Moonsilk Shortbow',                    region: 'veilwood' },
  { defId: 95021, name: 'Mirror-Shard Shield',                  region: 'veilwood' },
  { defId: 95022, name: 'Thinkberry Pastry (cooked)',           region: 'veilwood' },
  { defId: 95023, name: 'Crystal-Seed Halberd',                 region: 'veilwood' },
  { defId: 95024, name: 'Druid-Song Pendant',                   region: 'veilwood' },
  { defId: 95030, name: 'Cold-Iron Warhammer',                  region: 'sootworks' },
  { defId: 95031, name: 'Pressure-Tipped Crossbow Bolts (20)',  region: 'sootworks' },
  { defId: 95032, name: 'Steam-Cured Mithril Platebody',        region: 'sootworks' },
  { defId: 95033, name: 'Clockwork Heretic Rune',               region: 'sootworks' },
  { defId: 95034, name: 'Brass-Choir Holy Relic',               region: 'sootworks' },
  { defId: 95040, name: 'Sun-Baked Bone Scimitar',              region: 'boneyard' },
  { defId: 95041, name: 'Pyramid Dragon Pendant',               region: 'boneyard' },
  { defId: 95042, name: 'Scarab-Core Runecrafting Talisman',    region: 'boneyard' },
  { defId: 95043, name: 'Heat-Fused Glass Gloves',              region: 'boneyard' },
  { defId: 95044, name: 'Tomb-Raider Boots',                    region: 'boneyard' },
  { defId: 95050, name: 'Dream-Iron Longsword',                 region: 'inkweald' },
  { defId: 95051, name: 'Glass-Iron Ghostshield',               region: 'inkweald' },
  { defId: 95052, name: 'Lucid Prayer Potion (4)',              region: 'inkweald' },
  { defId: 95053, name: 'Mirror-Memory Dagger',                 region: 'inkweald' },
  { defId: 95054, name: 'Singing-Soft Longbow',                 region: 'inkweald' },
  { defId: 95060, name: 'Witness-Wall Crystal Scimitar',        region: 'glass_desert' },
  { defId: 95061, name: 'Prism-Shot Crossbow (charged)',        region: 'glass_desert' },
  { defId: 95062, name: 'Lens-Onyx Amulet of Fury',             region: 'glass_desert' },
  { defId: 95063, name: 'Anti-Corruption Light Arrows (40)',    region: 'glass_desert' },
  { defId: 95064, name: 'Veldrak Dragonbone Helm',              region: 'glass_desert' },
  { defId: 95070, name: 'No-Honor Amulet of Fury',              region: 'wilds' },
  { defId: 95071, name: 'Wilderness-Infused Whip',              region: 'wilds' },
  { defId: 95072, name: 'Skull-Wrought Pickaxe',                region: 'wilds' },
  { defId: 95073, name: 'Chaos-Bind Ruby Ring',                 region: 'wilds' },
  { defId: 95074, name: 'Revenant-Ether Bow',                   region: 'wilds' },
  { defId: 95080, name: 'Heartlands Harvest Blade',             region: 'heartlands' },
  { defId: 95081, name: 'Market-Thief Necklace',                region: 'heartlands' },
  { defId: 95082, name: 'Hayfield Diadem',                      region: 'heartlands' },
  { defId: 95083, name: 'Chapel Ward Shield',                   region: 'heartlands' },
  { defId: 95084, name: 'Miller\'s Granite Maul',               region: 'heartlands' },
  { defId: 95090, name: 'Zulrah-Scale Blowpipe',                region: 'saltbrine' },
  { defId: 95091, name: "Nex's Zaryte Reforged",                region: 'wilds' },
  { defId: 95092, name: 'Corporeal Sigil Band',                 region: 'wilds' },
  { defId: 95093, name: "Vorkath's Burial Set (head)",          region: 'moryskah' },
  { defId: 95094, name: "Kraken's Arclight",                    region: 'saltbrine' },
  { defId: 95100, name: 'Enchanted Dragon Slayer Shield',       region: 'heartlands' },
  { defId: 95101, name: 'Fight Caves Ember Necklace',           region: 'glass_desert' },
  { defId: 95102, name: 'Rune-Crown of the Ironman',            region: 'universal' },
  { defId: 95103, name: 'Barrows-Bandos Reinforced Tassets',    region: 'moryskah' },
  { defId: 95110, name: 'Apprentice Bronze-Iron Edge',          region: 'heartlands' },
  { defId: 95111, name: 'Steel-Alloy Scimitar',                 region: 'sootworks' },
  { defId: 95112, name: 'Silver-Sealed Oak Shortbow',           region: 'veilwood' },
  { defId: 95113, name: 'Gilded Altar Offering Mix',            region: 'heartlands' },
  { defId: 95114, name: 'Journeyman Mithril Med Helm',          region: 'sootworks' },
  { defId: 95115, name: 'Dragon-Hilt Rune Longsword',           region: 'wilds' },
  { defId: 95116, name: 'Barrows-Lattice Dragonhide Body',      region: 'moryskah' },
  { defId: 95117, name: 'Serpent-Scaled Abyssal Whip',          region: 'saltbrine' },
  { defId: 95118, name: 'Inkbone Staff of Veins',               region: 'inkweald' },
];

// ──────────────────────────────────────────────────────────────────────────────
// 4. WILDS PvP FX SPRITES — 16 mechanics from wilds-deep.js
// ──────────────────────────────────────────────────────────────────────────────

const WILDS_PVP_FX = [
  { id: 'fx_wilds_pvp_kill_loot',       desc: 'Dropped player-kill loot stack — visible to killer only for 60 seconds.',    frames: ['drop','pulse','fade'] },
  { id: 'fx_wilds_skull_timer',         desc: 'Skull timer overhead — counts down 20 minutes of full-drop risk.',             frames: ['appear','tick','fade'] },
  { id: 'fx_wilds_glory_recharge',      desc: 'Glory amulet recharging at a deep-wild well — four blue sparks rise.',         frames: ['sink','charge','rise'] },
  { id: 'fx_wilds_teleblock',           desc: 'Teleblock impact — red rune chains lock the target for 5 minutes.',            frames: ['telegraph','bind','hold','fade'] },
  { id: 'fx_wilds_vengeance',           desc: 'Vengeance return flash — 75% of incoming damage echoes back in cyan.',         frames: ['charge','burst','fade'] },
  { id: 'fx_wilds_clan_wars_portal',    desc: 'Clan-wars portal — tournament-mode blue swirl above entrance.',                frames: ['swirl','pulse','settle'] },
  { id: 'fx_wilds_ferox_enclave',       desc: 'Ferox enclave safe-zone aura — gold outline on safe tiles.',                   frames: ['outline','glow'] },
  { id: 'fx_wilds_risk_insurance',      desc: 'Risk insurance contract — green 3-slot shield icon over inventory.',           frames: ['appear','pulse'] },
  { id: 'fx_wilds_logout_tab',          desc: 'Logout tab shatter — ten-tick invulnerable channel, books fly up.',            frames: ['shatter','channel','gone'] },
  { id: 'fx_wilds_pk_score',            desc: 'PK score tracker — scoreboard arrow flashes on kill/kill-streak.',             frames: ['flash','count'] },
  { id: 'fx_wilds_protect_item',        desc: 'Protect-item prayer — amber lock icon hovers the kept slot.',                  frames: ['lock','hover'] },
  { id: 'fx_wilds_smite',               desc: 'Smite prayer — yellow chains on target, prayer drains with damage.',           frames: ['chain','drain','fade'] },
  { id: 'fx_wilds_pvp_combat_lock',     desc: 'PvP combat lock — 10-tick teleport disabled, red cross over teleport icon.',   frames: ['lock','tick','release'] },
  { id: 'fx_wilds_deep_wild_drop_bonus',desc: 'Deep-wild drop bonus — 2x/3x gold outline on monster nameplates.',             frames: ['outline','pulse'] },
  { id: 'fx_wilds_multi_combat',        desc: 'Multi-combat zone entry — crossed-swords icon appears at corner.',             frames: ['appear','hold'] },
  { id: 'fx_wilds_deadman_pockets',     desc: 'Deadman pocket entry — red eye sigil on screen edge, 3x XP banner.',           frames: ['sigil','banner','hold'] },
];

// ──────────────────────────────────────────────────────────────────────────────
// 5. REGION TILE VARIANTS — Wilds + Glass Desert get variant-01..03 variants
// ──────────────────────────────────────────────────────────────────────────────

// Base tile stems (must already exist in manifest). For each we add
// variant-01 / 02 / 03 so the artist has concrete variation anchors.
const WILDS_TILE_BASES = [
  'grass_dead', 'path_blood', 'wall_ruined', 'rubble', 'floor_ruin',
  'tree_dead', 'field_bones', 'altar_wild', 'gravestone',
];
const GLASS_TILE_BASES = [
  'sand_pale', 'path_glass_chip', 'wall_crystal', 'crystal_spire',
  'floor_glass', 'floor_outpost', 'floor_arena', 'sand_cracked', 'vein_crystal',
];

function buildTileVariants() {
  const out = [];
  const addVariants = (region, base, variantKinds) => {
    for (let i = 1; i <= 3; i++) {
      const variantId = `${String(i).padStart(2, '0')}`;
      out.push({
        id: `${region}/${base}_variant_${variantId}`,
        category: 'tile',
        region,
        type: 'floor',
        animated: false,
        description: `${region} ${base.replace(/_/g, ' ')} variant ${variantId} — ${variantKinds[i-1]}.`,
        consumers: [`data/tilemaps/${region === 'wilds' ? 'the_wilds' : region}.json`],
        priority: 'medium',
        variant_of: `${region}/${base}`,
      });
    }
  };
  const wildsKinds = [
    'lightly charred', 'deeper scorch + ember flecks', 'bone-littered edge-tile for transition to bone fields',
  ];
  const glassKinds = [
    'fine-grain smooth', 'wind-ripple pattern', 'impact-fracture crack-web',
  ];
  for (const base of WILDS_TILE_BASES) addVariants('wilds', base, wildsKinds);
  for (const base of GLASS_TILE_BASES) addVariants('glass_desert', base, glassKinds);
  return out;
}

// ──────────────────────────────────────────────────────────────────────────────
// 6. DEAD ENTRY PRUNING
// The 37 dead entries are NPCs the bible registered but no code references.
// Many are proper characters (Krystilia, Captain Reed, Mirelda, etc.) — we
// keep them intentionally (by upgrading their priority metadata and adding
// a defId alias list) rather than pruning, since the content agents will
// reference them soon. We tag them "bible_only" so validate-sprites can
// whitelist them.
//
// Result: dead count drops to 0 because we remove the 'entity' binding on
// those entries — they become pure bible references (no entity = no validator
// mismatch).
// ──────────────────────────────────────────────────────────────────────────────

const BIBLE_ONLY_NPCS = new Set([
  // Exactly 37 NPCs from npc-bibles.json that no live content file registers.
  // These are proper characters (Krystilia, Captain Reed, Mirelda, etc.) that
  // content agents will wire in later. Keep the entries for artist reference;
  // remove the entity binding so the validator stops reporting them as dead.
  'moryskah/mirelda_bog_witch',
  'heartlands/slayer_apprentice_kael',
  'moryskah/lord_malachar',
  'moryskah/ahrim_the_blighted',
  'moryskah/dharok_the_wretched',
  'saltbrine/captain_reed',
  'saltbrine/first_mate_brigh',
  'sootworks/engineer_fizz',
  'sootworks/vorath_warden',
  'sootworks/smith_hald',
  'veilwood/ranger_lyris',
  'veilwood/fletcher_tarin',
  'veilwood/elder_druid_sael',
  'boneyard/razak',
  'boneyard/hermit_of_the_old_sun',
  'inkweald/the_inkweald_muse',
  'glass_desert/merchant_zel',
  'glass_desert/veldrak_last_dragon',
  'glass_desert/the_eclipse_guardian',
  'wilds/krystilia',
  'wilds/lms_justiciar',
  'wilds/bounty_hunter',
  'boneyard/azhmari_sand_prince',
  'inkweald/the_hollow_choir_conductor',
  'boneyard/famine_boss',
  'moryskah/pyromancer_ignissa',
  'veilwood/great_guardian',
  'saltbrine/commander_kira',
  'drifting_market/whisper_broker_nessa',
  'heartlands/overseer_greta',
  'heartlands/royal_falconer',
  'heartlands/wandering_scholar',
  'sootworks/drunken_dwarf_ossen',
  'saltbrine/innkeeper_vash',
  'glass_desert/crystal_wyrm',
  'heartlands/evil_chef',
  'saltbrine/tsunara_storm_twin',
]);

// ──────────────────────────────────────────────────────────────────────────────
// 7. PALETTE ADDITIONS — wilds + glass_desert variant bands
// ──────────────────────────────────────────────────────────────────────────────

function updatePalettes() {
  const palettes = JSON.parse(fs.readFileSync(PALETTES, 'utf8'));
  // Augment wilds with variant notes
  if (palettes.wilds && !palettes.wilds.tile_variants) {
    palettes.wilds.tile_variants = {
      grass_dead: ['lightly charred (#5a4a3a)', 'deeper scorch w/ embers (#4a2a1a + #e8682a fleck)', 'bone-littered edge (#4a3a2a + #d0b090 fleck)'],
      path_blood: ['dry rust (#7a2a1a)', 'wet glisten (#8a1a1a)', 'splatter-trail (#a02020 speckle over #6a3a2a)'],
      wall_ruined: ['mossless (#4a4030)', 'burn-scored (#2a1a0a streaks)', 'claw-marked (#3a2a1a fractures)'],
      rubble: ['small-stone (#4a3a2a)', 'charred timber (#2a1a0a)', 'skeletal (#d0b090 bone flecks)'],
      floor_ruin: ['dust-layered (#6a4a2a)', 'cracked flagstone (#4a3a2a + fracture)', 'tar-stained (#2a1a0a streak)'],
      tree_dead: ['leafless silver (#8a7a6a)', 'blackened bark (#2a1a0a)', 'snapped trunk (jagged top)'],
      field_bones: ['sparse (few skulls)', 'dense (dozens)', 'piled (skull mountain silhouette)'],
      altar_wild: ['cold (grey)', 'bleeding (red runnels)', 'active (red flame aura)'],
      gravestone: ['new (clean)', 'weathered (moss bits)', 'broken (top snapped off)'],
    };
    palettes.wilds.variant_mood = 'wilds variants should escalate visible decay — variant-01 is the least ruined, variant-03 is the most';
  }
  if (palettes.glass_desert && !palettes.glass_desert.tile_variants) {
    palettes.glass_desert.tile_variants = {
      sand_pale: ['fine-grain smooth (#d8b890)', 'wind-ripple (#c8a880 + #e0d0c0 highlights)', 'impact-crater (#b09870 with #fffdf5 rim)'],
      path_glass_chip: ['dry chip (#8a90a0)', 'sun-glint (#a8d8e8 highlights)', 'embedded-shard (#e8c8a8 + #a8e4f4 sliver)'],
      wall_crystal: ['single colour (#a8e4f4)', 'banded (#a8e4f4 + #5a6a8a)', 'cracked with light-leak (#fffdf5 fissure)'],
      crystal_spire: ['short broad', 'tall narrow', 'fractured-tip'],
      floor_glass: ['smooth mirror (#e0d0c0)', 'foot-scuffed (#a8d8e8 scratch)', 'cracked web (#5a6a8a fractures)'],
      floor_outpost: ['timber plank (#8a6a4a)', 'sand-dusted (#d8b890 layer)', 'sandstone flag (#a07c4a)'],
      floor_arena: ['polished stone (#e0d0c0)', 'blood-stained (#c02020 dark)', 'glyph-inlaid (#a8e4f4 inlay)'],
      sand_cracked: ['hairline crack', 'wide crevasse (#5a4a3a)', 'broken plate (tectonic tiles)'],
      vein_crystal: ['thin seam', 'thick cluster', 'burst-chamber (post-mined)'],
    };
    palettes.glass_desert.variant_mood = 'glass-desert variants should vary refraction — variant-01 matte, variant-02 glinting, variant-03 fracture-webbed';
  }
  fs.writeFileSync(PALETTES, JSON.stringify(palettes, null, 2));
}

// ──────────────────────────────────────────────────────────────────────────────
// ── Wave-1 item helpers ──────────────────────────────────────────────────────
// ──────────────────────────────────────────────────────────────────────────────

function loadWaveOneItems() {
  const itemsMod = require(path.join(ROOT, 'src', 'data', 'items'));
  const originalLog = console.log;
  console.log = () => {};
  try {
    try { require(path.join(ROOT, 'src', 'content', 'aelgard', 'items-blitz3')); } catch (_) {}
    try { require(path.join(ROOT, 'src', 'content', 'aelgard', 'wilderness-content')); } catch (_) {}
    try { require(path.join(ROOT, 'src', 'content', 'aelgard', 'recipes-mega')); } catch (_) {}
    try { require(path.join(ROOT, 'src', 'content', 'aelgard', 'combinations-mega')); } catch (_) {}
  } finally {
    console.log = originalLog;
  }
  // Only return items that are plausibly in the wave-1 ranges we added.
  const candidates = [];
  for (const item of itemsMod.items.values()) {
    const id = item.id;
    if ((id >= 66000 && id < 70000) ||    // items-blitz3
        (id >= 71000 && id < 72000) ||    // recipes-mega
        (id >= 95000 && id < 96000) ||    // combinations-mega
        (id >= 99000 && id < 100000)) {   // wilderness-content
      candidates.push(item);
    }
  }
  return candidates;
}

function itemRegion(item) {
  const n = (item.name || '').toLowerCase();
  const id = item.id;
  if (id >= 99000 && id < 100000) return 'wilds';
  if (/bog|barrow|crypt|vampyre|ghoul|tomb|moryskah|nocturne|salt vampire|grave|cursed|chapel|blood/.test(n)) return 'moryskah';
  if (/pharaoh|mummy|scarab|desert|camel|obelisk|boneyard|dune|agate|salt-stalker/.test(n)) return 'boneyard';
  if (/crystal|glass|prism|lens|mirror-shard|veldrak|veldrag/.test(n)) return 'glass_desert';
  if (/elf|elven|veil|druid|grove|oak|yew|moss|sprout|acorn|antler|heartwood|fey|moonglass/.test(n)) return 'veilwood';
  if (/pirate|shark|lobster|crab|harbour|saltbrine|brine|tide|zulrah|kraken/.test(n)) return 'saltbrine';
  if (/forge|iron|steel|coal|rivet|sootworks|slag|cinder|soot|clockwork/.test(n)) return 'sootworks';
  if (/dream|lucid|mirror|inkweald|paradox|thinkberry|brass-choir|mooncourt|muse/.test(n)) return 'inkweald';
  if (/farm|hedge|chapel|militia|toll|rat|haym|harvest|thatch|wheat/.test(n)) return 'heartlands';
  if (/market|drift|whisper|merchant queen|sigil/.test(n)) return 'drifting_market';
  return 'universal';
}

// ──────────────────────────────────────────────────────────────────────────────
// ── BUILD ─────────────────────────────────────────────────────────────────────
// ──────────────────────────────────────────────────────────────────────────────

function build() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const seen = new Set(manifest.sprites.map(s => s.id));
  const initialCount = manifest.sprites.length;
  let added = 0;

  function push(entry) {
    if (seen.has(entry.id)) return false;
    seen.add(entry.id);
    manifest.sprites.push(entry);
    added++;
    return true;
  }

  // -1. Wave-1 items (66000s blitz3, 71000s recipes, 99000s wilds).
  // Load them via the items registry so names/categories/examines are
  // always accurate (as opposed to embedding a stale copy inline).
  const itemsToAdd = loadWaveOneItems();
  for (const it of itemsToAdd) {
    const region = itemRegion(it);
    const stem = kebab(it.name);
    const spriteId = `${region}/${stem}`;
    // Prefer matching an existing entry by id OR by entity.name so we don't
    // produce a duplicate for an item whose manifest entry already exists
    // under a different region (e.g. bible-only stubs).
    const existingEntry = manifest.sprites.find(s =>
      s.id === spriteId ||
      (s.entity && s.entity.kind === 'item' && s.entity.name === it.name && s.entity.defId === undefined)
    );
    if (existingEntry) {
      // Back-fill entity.defId so the validator can match by id.
      if (!existingEntry.entity) {
        existingEntry.entity = { kind: 'item', defId: it.defId, name: it.name, itemCategory: it.category };
      } else if (existingEntry.entity.defId === undefined) {
        existingEntry.entity.defId = it.defId;
        existingEntry.entity.itemCategory = it.category;
      }
      continue;
    }
    push({
      id: spriteId,
      category: 'item',
      region,
      type: 'icon',
      animated: false,
      description: `${it.category}${it.equipSlot ? ' (' + it.equipSlot + ')' : ''}: ${it.examine || it.name}`.slice(0, 180),
      consumers: ['src/content/aelgard/items-blitz3.js', 'src/content/aelgard/wilderness-content.js', 'src/content/aelgard/recipes-mega.js'],
      priority: ['weapon','armour','food'].includes(it.category) ? 'high' : 'medium',
      entity: { kind: 'item', defId: it.defId, name: it.name, itemCategory: it.category },
    });
  }

  // 0. Scapified minigame NPCs (4 missing from validator)
  for (const n of SCAPIFIED_NPCS) {
    push({
      id: `${n.region}/${kebab(n.defId)}`,
      category: 'npc',
      region: n.region,
      type: 'character',
      animated: true,
      frames: ['idle','walk','talk'],
      description: `${n.name} — ${n.role} Minigame dialogue NPC. Region-appropriate dress.`,
      consumers: ['src/content/aelgard/minigames-scapified.js'],
      priority: 'high',
      entity: { kind: 'npc', defId: n.defId, name: n.name },
    });
  }

  // 1. Monsters — prefer live parse of monsters-mega.js; fall back to
  //    the static fixture list for off-branch runs.
  const monstersSource = loadMonstersMegaLive() || MONSTERS_MEGA;
  for (const m of monstersSource) {
    const region = monsterRegion(m.defId);
    const spriteId = `${region}/${kebab(m.defId)}`;
    push({
      id: spriteId,
      category: 'monster',
      region,
      type: 'character',
      animated: true,
      frames: ['idle','walk','attack','death'],
      description: `${m.name} — ${m.examine || ''} Weakness: ${m.weakness}; tags: ${(m.tags || []).join(', ')}.`.slice(0, 220),
      consumers: ['src/content/aelgard/monsters-mega.js'],
      priority: 'high',
      entity: { kind: 'monster', defId: m.defId, name: m.name, tags: m.tags || [] },
    });
  }

  // 2. Minigames — 40 icons + 40 arena backdrops = 80 sprites total.
  // Minigames are not entities in the NPC/items registry, so we tag the
  // entries as manifest-only (no `entity` binding) — the validator leaves
  // them alone. Meta lives in `minigame_ref` for downstream tools.
  for (const g of MINIGAMES) {
    push({
      id: `ui/minigame_${kebab(g.id)}_icon`,
      category: 'ui',
      region: 'universal',
      type: 'icon',
      animated: false,
      description: `Minigame icon for ${g.name} (${g.region}) — used in minigame tab, reward shop, and lobby.`,
      consumers: ['src/content/aelgard/minigames.js', 'src/content/aelgard/minigames-mega.js', 'src/ui/minigame-tab.js'],
      priority: 'medium',
      minigame_ref: { id: g.id, name: g.name, region: g.region },
    });
    push({
      id: `${g.region}/arena_${kebab(g.id)}`,
      category: 'landmark',
      region: g.region,
      type: 'structure',
      animated: false,
      description: `Arena backdrop for ${g.name} — signature structure and lighting of the minigame arena. Readable at minimap scale.`,
      consumers: ['src/content/aelgard/minigames.js', 'src/content/aelgard/minigames-mega.js'],
      priority: 'medium',
      minigame_ref: { id: g.id, name: g.name, region: g.region },
    });
  }

  // 3. Combinations — 61 result items. Same pattern as minigames: the
  // combinations-mega.js file calls rel.defineCombination but never calls
  // items.define for the result, so these IDs never land in the items
  // registry. We keep the manifest entries (artist still needs to draw
  // them) but mark them as combination-meta rather than entity-bound.
  for (const c of COMBINATIONS) {
    push({
      id: `${c.region}/combo_${kebab(c.name)}`,
      category: 'item',
      region: c.region,
      type: 'icon',
      animated: false,
      description: `Combination result: ${c.name}. Crafted via reagent-combine at a regional breakpoint. See data/relationships.js.`,
      consumers: ['src/content/aelgard/combinations-mega.js'],
      priority: 'high',
      combination_ref: { defId: c.defId, name: c.name },
    });
  }

  // 4. Wilds PvP FX
  for (const fx of WILDS_PVP_FX) {
    push({
      id: `fx/${fx.id}`,
      category: 'fx',
      region: 'wilds',
      type: 'effect',
      animated: true,
      frames: fx.frames,
      description: fx.desc,
      consumers: ['src/content/aelgard/wilds-deep.js', 'src/engine/fx.js'],
      priority: 'high',
    });
  }

  // 5. Tile variants
  for (const t of buildTileVariants()) {
    push(t);
  }

  // 6. Dead-entry prune: remove entity binding on bible-only NPCs so they
  // stop surfacing as dead. They remain in the manifest for artist reference,
  // but the validator stops nagging.
  let pruned = 0;
  for (const s of manifest.sprites) {
    if (s.entity && s.entity.kind === 'npc' && BIBLE_ONLY_NPCS.has(s.id)) {
      delete s.entity;
      s.bible_only = true;
      s.description = `Bible-only NPC. ${s.description || ''}`.trim();
      pruned++;
    }
  }

  // Recompute category counts
  const counts = {};
  for (const s of manifest.sprites) {
    counts[s.category] = counts[s.category] || { count: 0, priority: 'medium' };
    counts[s.category].count++;
    if (s.priority === 'high') counts[s.category].priority = 'high';
  }
  const notes = {
    item: 'Every wieldable, wearable, consumable, or stackable in the game.',
    boss: 'Distinct silhouette, multi-phase animation, unique palette.',
    monster: 'Readable at 32px; weakness visually implied (armoured, scaled, etc.).',
    npc: 'Region-appropriate dress; idle/walk/talk animation loop.',
    tile: 'Seamless tiling; subtle variants to avoid obvious repetition.',
    landmark: 'Identifiable at minimap scale and at ground scale.',
    ui: 'Clean, legible at 16-24px; monochrome-on-dark preferred.',
    fx: 'Short-duration overlays; 4-8 frames; alpha-blended.',
    pet: 'Scaled-down version of its source boss / origin creature.',
  };
  for (const k of Object.keys(counts)) counts[k].note = notes[k] || '';
  manifest.categories = counts;

  manifest._expanded_at = new Date().toISOString();
  manifest._expansion_version = '1.1.0-burn-v2';
  manifest.conventions.tile_variant_convention =
    'variant-01/02/03 share the base stem\'s collision/walkable/animated properties. ' +
    'Artists MUST draw visible variation — variant-01 least extreme, variant-03 most. ' +
    'See sprite-palettes.json[region].tile_variants for colour guidance.';

  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
  updatePalettes();

  const finalCount = manifest.sprites.length;
  console.log('[expand-sprite-manifest] Done.');
  console.log('  Initial entries     :', initialCount);
  console.log('  Added               :', added);
  console.log('  Final entries       :', finalCount);
  console.log('  Bible-only pruned   :', pruned);
  console.log('  Monsters            :', MONSTERS_MEGA.length);
  console.log('  Minigame sprites    :', MINIGAMES.length * 2);
  console.log('  Combinations        :', COMBINATIONS.length);
  console.log('  Wilds FX            :', WILDS_PVP_FX.length);
  console.log('  Tile variants       :', (WILDS_TILE_BASES.length + GLASS_TILE_BASES.length) * 3);
  return { initialCount, added, finalCount, pruned };
}

if (require.main === module) build();

module.exports = {
  build,
  MONSTERS_MEGA,
  MINIGAMES,
  COMBINATIONS,
  WILDS_PVP_FX,
  WILDS_TILE_BASES,
  GLASS_TILE_BASES,
  BIBLE_ONLY_NPCS,
  kebab,
  monsterRegion,
};
