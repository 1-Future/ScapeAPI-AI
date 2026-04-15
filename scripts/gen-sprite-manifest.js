#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// gen-sprite-manifest.js
//
// One-shot generator that walks every content file (items, npcs, bosses, tiles,
// landmarks) and produces data/sprite-manifest.json. Run this ONCE whenever
// new content is added to regenerate the manifest.
//
// Output: data/sprite-manifest.json
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'data', 'sprite-manifest.json');

// ── Region inference helpers ─────────────────────────────────────────────────

const REGIONS = [
  'heartlands', 'moryskah', 'sootworks', 'saltbrine', 'veilwood',
  'boneyard', 'inkweald', 'glass_desert', 'wilds', 'drifting_market',
  'universal',
];

// Normalise name → kebab-case sprite stem.
function kebab(s) {
  return String(s)
    .toLowerCase()
    .replace(/['`"]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

// Heuristic: guess region for an item from its name.
function guessItemRegion(name) {
  const n = name.toLowerCase();
  if (/barrows|dharok|ahrim|karil|guthan|torag|verac/.test(n)) return 'moryskah';
  if (/dragon(hide|scimitar|long|dagger|spear|mace|batt|hal|plate|full|sq |boot|defender|pick|axe|harpoon)/.test(n)) return 'glass_desert';
  if (/(bronze|iron|steel|mithril|adamant|rune) (dagger|sword|scimitar|longsword|mace|battle|war|plate|chain|med|full|kite|sq|2h|arrow|bolt|dart|javelin|thrownaxe|knives|arrowtip|dart tip|nails|crossbow)/.test(n)) return 'sootworks';
  if (/rune|wand|staff|book of|ancient magicks|tome|grimoire|spellbook/.test(n)) return 'inkweald';
  if (/raw |cooked |shark|lobster|swordfish|karambwan|anglerfish|monkfish|trout|salmon|bass|tuna|cod|herring/.test(n)) return 'saltbrine';
  if (/crystal|elven|prifddinas|corrupted|divine/.test(n)) return 'veilwood';
  if (/sand|bone(s|_pile)|desert|pharaoh|mummy|sunfire|azhmari/.test(n)) return 'boneyard';
  if (/wild|chaos|revenant|wilderness|pvp/.test(n)) return 'wilds';
  if (/herb|potion|grimy|secondary|witch|ghoul|vampire|slayer (helm|master)/.test(n)) return 'moryskah';
  if (/log|axe|bow|arrow|fletch/.test(n)) return 'veilwood';
  if (/seed|farming|compost/.test(n)) return 'heartlands';
  return 'universal';
}

function guessNpcRegion(defId, name) {
  const n = (name || defId).toLowerCase();
  const id = defId.toLowerCase();
  for (const r of REGIONS) {
    if (id.includes(r) || n.includes(r.replace('_',' '))) return r;
  }
  if (/goblin|cow|chicken|rat|hill giant|moss giant|knight|guard|farmer|miller/.test(n)) return 'heartlands';
  if (/skeleton|zombie|ghoul|ghost|vampire|witch|crypt|mausoleum|malachar|ahrim|dharok|karil|guthan|torag|verac|barrow|ahrim/.test(n)) return 'moryskah';
  if (/pirate|kraken|sea|fish|mermaid|salt|tide|sailor|captain reed|harbour|dock|shipwright/.test(n)) return 'saltbrine';
  if (/dwarf|gnome|smith|soot|forge|coal|iron|steam|vorath|fizz|brun|hald/.test(n)) return 'sootworks';
  if (/elf|elven|dryad|druid|yew|oak ent|treant|moss|grove|veilmother|lyris/.test(n)) return 'veilwood';
  if (/scorpion|scarab|mummy|pharaoh|camel|hyena|nomad|sand|bone|oasis|azhmari|sun hermit/.test(n)) return 'boneyard';
  if (/lucid|dream|mirror|bloom|paradox|choir|boundary|resonance|paradox/.test(n)) return 'inkweald';
  if (/crystal|tyrant|veldrak|inferno|glass|mirage|sandstorm/.test(n)) return 'glass_desert';
  if (/chaos|wild|revenant|pvp|mage arena|obelisk/.test(n)) return 'wilds';
  if (/drifting|merchant queen/.test(n)) return 'drifting_market';
  return 'universal';
}

// ── ITEM extraction via live load ────────────────────────────────────────────

function loadAllItems() {
  const itemsMod = require(path.join(ROOT, 'src', 'data', 'items.js'));
  const contentFiles = [
    'src/content/aelgard/items-expanded.js',
    'src/content/aelgard/items-blitz.js',
    'src/content/aelgard/items-blitz2.js',
    'src/content/aelgard/items-dragon-barrows.js',
    'src/content/aelgard/universal-items.js',
    'src/content/aelgard/smithing-complete.js',
  ];
  // Silence noisy loads
  const log = console.log;
  console.log = () => {};
  for (const f of contentFiles) {
    try { require(path.join(ROOT, f)); } catch (e) { /* ignore */ }
  }
  console.log = log;
  return [...itemsMod.items.values()];
}

// Category → sprite category mapping
function itemSpriteCategory(cat) {
  const map = {
    weapon: 'item',
    armour: 'item',
    jewellery: 'item',
    rune: 'item',
    food: 'item',
    cooking: 'item',
    fishing: 'item',
    mining: 'item',
    farming: 'item',
    herblore: 'item',
    crafting: 'item',
    fletching: 'item',
    material: 'item',
    construction: 'item',
    ranged: 'item',
    prayer: 'item',
    magic: 'item',
    slayer: 'item',
    cosmetic: 'item',
    misc: 'item',
    quest: 'item',
    pet: 'pet',
  };
  return map[cat] || 'item';
}

function itemDescription(item) {
  const cat = item.category || 'misc';
  const slot = item.equipSlot ? ` (${item.equipSlot})` : '';
  const examine = (item.examine || '').replace(/\s+/g, ' ').trim();
  return `${cat}${slot}: ${examine || item.name}`.slice(0, 180);
}

// ── NPC / MONSTER / BOSS extraction via regex ─────────────────────────────────

function scanFiles(patterns, contentDir) {
  const files = fs.readdirSync(contentDir);
  const hits = [];
  for (const f of files) {
    const full = path.join(contentDir, f);
    const src = fs.readFileSync(full, 'utf8');
    for (const p of patterns) {
      let m;
      const re = new RegExp(p.re, 'g');
      while ((m = re.exec(src)) !== null) {
        hits.push({ file: f, defId: m[1], name: m[2] || null, kind: p.kind });
      }
    }
  }
  return hits;
}

function extractNpcs() {
  const dir = path.join(ROOT, 'src', 'content', 'aelgard');
  const patterns = [
    // mob('defId', { name: 'Name', ... })
    { re: "mob\\('([^']+)',\\s*\\{\\s*name:\\s*'([^']+)'", kind: 'monster' },
    // boss('defId', { name: 'Name', ... })
    { re: "boss\\('([^']+)',\\s*\\{\\s*name:\\s*'([^']+)'", kind: 'boss' },
    // npcs.defineNpc('defId', { name: 'Name', ... })
    { re: "npcs\\.defineNpc\\('([^']+)',\\s*\\{\\s*name:\\s*'([^']+)'", kind: 'npc' },
    // npcs.defineNpc('defId', {   (next line has name)
    { re: "npcs\\.defineNpc\\('([^']+)',\\s*\\{\\s*\\n\\s*name:\\s*'([^']+)'", kind: 'npc' },
  ];
  const hits = scanFiles(patterns, dir);
  // Dedupe by defId, preferring first occurrence
  const seen = new Map();
  for (const h of hits) {
    if (!seen.has(h.defId)) seen.set(h.defId, h);
  }
  return [...seen.values()];
}

// ── Tile extraction from tilemap JSON ────────────────────────────────────────

const REGION_ALIASES = {
  'boneyard_wastes': 'boneyard',
  'saltbrine_reach': 'saltbrine',
  'the_wilds': 'wilds',
};
function normalizeRegion(r) { return REGION_ALIASES[r] || r; }

function extractTiles() {
  const tilemapsDir = path.resolve(ROOT, '..', '..', '..', 'data', 'tilemaps');
  // Fallback: try alternate locations
  const candidates = [
    tilemapsDir,
    path.resolve(ROOT, 'data', 'tilemaps'),
    'C:/Users/username/ScapeAI/data/tilemaps',
  ];
  let dir = null;
  for (const c of candidates) {
    if (fs.existsSync(c)) { dir = c; break; }
  }
  if (!dir) {
    console.warn('[gen] No tilemaps directory found. Using inline tilemap schema.');
    return buildInlineTileLegends();
  }
  const out = [];
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.json')) continue;
    const tm = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const region = normalizeRegion(tm.id);
    for (const [tk, tv] of Object.entries(tm.tile_legend || {})) {
      if (!tv.sprite) continue;
      out.push({
        id: tv.sprite,
        category: 'tile',
        region,
        type: tv.walkable ? 'floor' : 'blocker',
        animated: tv.name === 'water' || tv.name === 'lava' || tv.name === 'mist_bog' || tv.name === 'blood_pool' || tv.name === 'ink_bloom',
        description: `${region} ${tv.name.replace(/_/g,' ')} tile`,
        consumers: [`data/tilemaps/${f}`],
        priority: 'high',
      });
    }
    for (const lm of tm.landmarks || []) {
      if (!lm.sprite) continue;
      out.push({
        id: lm.sprite,
        category: 'landmark',
        region,
        type: 'structure',
        animated: false,
        description: lm.label || lm.id,
        consumers: [`data/tilemaps/${f}`],
        priority: 'high',
      });
    }
  }
  return out;
}

// Inline legends (same content as data/tilemaps/*.json) — used when the JSON
// tilemaps aren't reachable (e.g. isolated worktree where /data is gitignored).
function buildInlineTileLegends() {
  const legends = {
    heartlands: {
      tiles: { grass: 'grass_01', path: 'path_cobble', wall: 'wall_stone', flowers: 'flowers', wheat: 'wheat_field', tree: 'tree_oak', water: 'water_river', floor: 'floor_wood', bridge: 'bridge_stone', fence: 'fence_wood' },
      landmarks: ['castle', 'chapel', 'market', 'forge', 'farm', 'well', 'goblin_hut'],
    },
    moryskah: {
      tiles: { swamp: 'swamp_water', path: 'path_planks', wall: 'wall_obsidian', rotwood: 'tree_rotwood', mist_bog: 'bog_mist', cobblestone: 'cobble_dark', graveyard: 'grave_floor', mausoleum: 'mausoleum_stone', witch_garden: 'garden_herbs', blood_pool: 'blood_pool' },
      landmarks: ['village_square', 'apothecary', 'tower_tall', 'castle', 'witch_hut', 'chapel'],
    },
    sootworks: {
      tiles: { soot: 'soot_floor', cobble: 'cobble', rock: 'rock_dark', iron_plate: 'floor_iron_plate', lava: 'lava', forge_stone: 'floor_forge', coal_vein: 'coal_vein', iron_vein: 'iron_vein', wall: 'wall_brickwork', gantry: 'gantry_metal', steam_pipe: 'pipe_steam' },
      landmarks: ['forge_great', 'cavern', 'cog_house', 'throne_iron', 'shaft_mouth', 'crucible'],
    },
    saltbrine: {
      tiles: { sand: 'sand_wet', path: 'path_plank', wall: 'wall_clinker', water: 'water_ocean', shallows: 'water_shallow', dock: 'floor_dock', rocky_shore: 'rocks', tide_pool: 'tide_pool', sea_grass: 'sea_grass', wreck: 'shipwreck' },
      landmarks: ['harbour_main', 'cove_pirate', 'stall', 'lighthouse', 'yard_ship', 'buoy'],
    },
    veilwood: {
      tiles: { dark_grass: 'grass_dark', path: 'path_moss', wall: 'wall_living_wood', fern: 'fern', tree_oak: 'tree_oak', tree_yew: 'tree_yew', tree_ancient: 'tree_ancient', floor: 'floor_polished_wood', glow_moss: 'moss_luminous', stream: 'stream' },
      landmarks: ['elf_pavilion', 'wood_hut', 'altar_living', 'grotto_dark', 'menhir', 'waterfall'],
    },
    boneyard: {
      tiles: { sand: 'sand_pale', path: 'path_bones', wall: 'wall_sandstone', bone_pile: 'bones', oasis: 'water_oasis', tent_floor: 'canvas_floor', palm: 'palm_tree', cracked: 'sand_cracked', cactus: 'cactus', sandstone: 'sandstone_floor' },
      landmarks: ['oasis_lily', 'tent_canvas', 'pyramid', 'ossuary', 'obelisk', 'mud_hut'],
    },
    inkweald: {
      tiles: { dream_grass: 'grass_violet', path: 'path_dream', wall: 'wall_glass', flower: 'flower_lucid', bush: 'bush_thought', mirror_pond: 'pond_mirror', shade: 'shade_violet', floor: 'floor_brass', ink_bloom: 'bloom_ink', thoughtcrack: 'crack_thought' },
      landmarks: ['camp_lucid', 'chamber_brass', 'pond_mirror', 'lodge_lucid', 'amphi_brass', 'menhir_violet'],
    },
    glass_desert: {
      tiles: { sand: 'sand_pale', path: 'path_glass_chip', wall: 'wall_crystal', crystal: 'crystal_spire', glass_floor: 'floor_glass', outpost_floor: 'floor_outpost', arena_stone: 'floor_arena', cracked: 'sand_cracked', lava_glass: 'lava_glass', crystal_vein: 'vein_crystal', mirage: 'mirage_water' },
      landmarks: ['outpost', 'arena_tyrant', 'arena_dragon', 'cavern_crystal', 'chamber_heart', 'inferno_door'],
    },
    wilds: {
      tiles: { dark_grass: 'grass_dead', path: 'path_blood', wall: 'wall_ruined', lava: 'lava_pit', rubble: 'rubble', ruin_floor: 'floor_ruin', tree_dead: 'tree_dead', bone_field: 'field_bones', wild_altar: 'altar_wild', gravestone: 'gravestone', level_marker: 'marker_wild_level' },
      landmarks: ['ruin_great', 'lava_great', 'altar_chaos', 'obelisk_rune', 'arena_pvp', 'gate_wild', 'pillars_mage'],
    },
  };

  const out = [];
  for (const [region, spec] of Object.entries(legends)) {
    for (const [tileName, stem] of Object.entries(spec.tiles)) {
      const animated = /water|lava|mist|blood|bloom|stream|mirage|steam/.test(tileName + stem);
      out.push({
        id: `${region}/${stem}`,
        category: 'tile',
        region,
        type: ['wall','tree','crystal','cactus','palm','rotwood','rubble','gravestone','mausoleum','wreck','ink_bloom'].some(b => tileName.includes(b) || stem.includes(b)) ? 'blocker' : 'floor',
        animated,
        description: `${region} ${tileName.replace(/_/g,' ')} tile`,
        consumers: [`data/tilemaps/${region === 'saltbrine' ? 'saltbrine_reach' : region === 'wilds' ? 'the_wilds' : region}.json`],
        priority: 'high',
      });
    }
    for (const lm of spec.landmarks) {
      out.push({
        id: `${region}/${lm}`,
        category: 'landmark',
        region,
        type: 'structure',
        animated: false,
        description: `${region} ${lm.replace(/_/g,' ')}`,
        consumers: [`data/tilemaps/${region === 'saltbrine' ? 'saltbrine_reach' : region === 'wilds' ? 'the_wilds' : region}.json`],
        priority: 'high',
      });
    }
  }
  return out;
}

// ── UI icon generation ───────────────────────────────────────────────────────

const SKILLS = [
  'attack','strength','defence','hitpoints','ranged','magic','prayer',
  'mining','smithing','woodcutting','fletching','fishing','cooking','firemaking',
  'crafting','herblore','agility','thieving','slayer','farming','runecrafting',
  'hunter','construction',
];

const COMBAT_STYLES = ['melee_stab','melee_slash','melee_crush','melee_controlled','ranged_accurate','ranged_rapid','ranged_longrange','magic_autocast','magic_defensive'];

const PRAYERS = [
  'thick_skin','burst_of_strength','clarity_of_thought','rock_skin','superhuman_strength','improved_reflexes','rapid_restore','rapid_heal','protect_item',
  'steel_skin','ultimate_strength','incredible_reflexes','protect_magic','protect_ranged','protect_melee','eagle_eye','mystic_might','retribution','redemption','smite','preserve',
  'chivalry','piety','rigour','augury',
];

const SPELLBOOKS = ['standard','ancient','lunar','arceuus'];

const UI_WIDGETS = [
  'inventory_slot','equipment_slot','quest_tab','combat_tab','skills_tab','prayer_tab','magic_tab','emotes_tab','music_tab','friends_tab','clan_tab','settings_tab','logout_btn',
  'minimap_frame','compass_rose','health_orb','prayer_orb','run_orb','special_orb','xp_drop','xp_counter','chat_box','dialog_frame','tooltip_frame','context_menu',
  'ge_slot_available','ge_slot_buying','ge_slot_selling','coin_stack_1','coin_stack_100','coin_stack_1k','coin_stack_10k','coin_stack_100k','coin_stack_1m',
  'keyboard_hint','loading_spinner','chevron_up','chevron_down','chevron_left','chevron_right','close_x','cursor_default','cursor_attack','cursor_walk','cursor_examine','cursor_use',
  'icon_attack','icon_defence','icon_strength','icon_ranged','icon_magic','icon_prayer','icon_hp','icon_weight','icon_boon',
];

// ── FX generation ────────────────────────────────────────────────────────────

const FX_TYPES = [
  // Combat hit splats
  {id:'hit_damage_red',       desc:'Red damage splat 1-9',                    animated:true, frames:['appear','hold','fade']},
  {id:'hit_damage_big',       desc:'Red damage splat 10-99',                  animated:true, frames:['appear','hold','fade']},
  {id:'hit_damage_huge',      desc:'Red damage splat 100+',                   animated:true, frames:['appear','hold','fade']},
  {id:'hit_zero',             desc:'Blue zero-damage splat',                  animated:true, frames:['appear','hold','fade']},
  {id:'hit_poison',           desc:'Green poison tick splat',                 animated:true, frames:['appear','hold','fade']},
  {id:'hit_venom',            desc:'Dark green venom tick splat',             animated:true, frames:['appear','hold','fade']},
  {id:'hit_disease',          desc:'Yellow-orange disease splat',             animated:true, frames:['appear','hold','fade']},
  {id:'hit_heal',             desc:'Green heal splat',                        animated:true, frames:['appear','hold','fade']},
  {id:'hit_crit',             desc:'Critical hit flash',                      animated:true, frames:['appear','hold','fade']},

  // Projectiles
  {id:'proj_arrow_bronze',    desc:'Arrow projectile bronze tier',            animated:true, frames:['fly']},
  {id:'proj_arrow_dragon',    desc:'Arrow projectile end-game',               animated:true, frames:['fly']},
  {id:'proj_bolt_iron',       desc:'Crossbow bolt',                           animated:true, frames:['fly']},
  {id:'proj_spell_fire',      desc:'Fire spell projectile',                   animated:true, frames:['fly','impact']},
  {id:'proj_spell_water',     desc:'Water spell projectile',                  animated:true, frames:['fly','impact']},
  {id:'proj_spell_earth',     desc:'Earth spell projectile',                  animated:true, frames:['fly','impact']},
  {id:'proj_spell_air',       desc:'Air spell projectile',                    animated:true, frames:['fly','impact']},
  {id:'proj_spell_ice',       desc:'Ice barrage projectile',                  animated:true, frames:['fly','impact']},
  {id:'proj_spell_blood',     desc:'Blood barrage projectile',                animated:true, frames:['fly','impact']},
  {id:'proj_spell_shadow',    desc:'Shadow barrage projectile',               animated:true, frames:['fly','impact']},
  {id:'proj_spell_smoke',     desc:'Smoke barrage projectile',                animated:true, frames:['fly','impact']},

  // Casting glyphs
  {id:'cast_glyph_offensive', desc:'Red rune glyph at caster feet',           animated:true, frames:['rise','rotate','fade']},
  {id:'cast_glyph_utility',   desc:'Blue rune glyph for teleport/utility',    animated:true, frames:['rise','rotate','fade']},
  {id:'cast_glyph_ancient',   desc:'Ancient magicks sigil',                   animated:true, frames:['rise','rotate','fade']},
  {id:'cast_glyph_lunar',     desc:'Lunar spellbook moon glyph',              animated:true, frames:['rise','rotate','fade']},
  {id:'cast_glyph_arceuus',   desc:'Arceuus purple glyph',                    animated:true, frames:['rise','rotate','fade']},

  // System/utility
  {id:'fx_level_up',          desc:'Level-up sparkle and banner',             animated:true, frames:['burst','ring','settle']},
  {id:'fx_xp_drop',           desc:'XP text flying up right edge',            animated:true, frames:['fade_in','drift','fade_out']},
  {id:'fx_teleport_in',       desc:'Teleport arrival spell',                  animated:true, frames:['spiral','flash']},
  {id:'fx_teleport_out',      desc:'Teleport departure spell',                animated:true, frames:['flash','spiral']},
  {id:'fx_teleport_ancient',  desc:'Ancient teleport with bone circle',       animated:true, frames:['bones','pulse','vanish']},
  {id:'fx_teleport_home',     desc:'Slow home-teleport channel',              animated:true, frames:['ring','rise','flash']},
  {id:'fx_death_player',      desc:'Player death — bones, skull, chat line',  animated:true, frames:['fall','skull']},
  {id:'fx_death_npc',         desc:'NPC death — bones only',                  animated:true, frames:['fall','bones']},
  {id:'fx_heal_aura',         desc:'Heal-over-time green mist',               animated:true, frames:['pulse']},
  {id:'fx_prayer_activate',   desc:'Prayer-icon flare when toggled on',       animated:true, frames:['flash']},
  {id:'fx_prayer_drain_flash',desc:'Prayer drain red flash',                  animated:true, frames:['flash']},
  {id:'fx_special_drain',     desc:'Spec-attack yellow bar flash',            animated:true, frames:['flash']},
  {id:'fx_combat_engage',     desc:'Combat engage crossed-swords icon',       animated:false, frames:['static']},
  {id:'fx_out_of_combat',     desc:'Out-of-combat timer icon',                animated:false, frames:['static']},

  // Boss phase transitions
  {id:'fx_boss_enrage',       desc:'Boss enrage aura — red shockwave',        animated:true, frames:['shock','pulse','settle']},
  {id:'fx_boss_phase_break',  desc:'Phase break — screen shake and particles',animated:true, frames:['shake','particle','settle']},
  {id:'fx_boss_summon',       desc:'Summon minion portal',                    animated:true, frames:['portal','exit']},
  {id:'fx_boss_stomp',        desc:'Ground-stomp shockwave',                  animated:true, frames:['stomp','wave']},
  {id:'fx_boss_beam',         desc:'Charged beam telegraph line',             animated:true, frames:['telegraph','fire','fade']},

  // Environmental
  {id:'fx_smoke_forge',       desc:'Forge chimney smoke',                     animated:true, frames:['rise']},
  {id:'fx_campfire',          desc:'Campfire flames',                         animated:true, frames:['flicker']},
  {id:'fx_torch',             desc:'Wall/hand torch flames',                  animated:true, frames:['flicker']},
  {id:'fx_waterfall',         desc:'Waterfall spray',                         animated:true, frames:['flow']},
  {id:'fx_mist',              desc:'Ambient ground mist',                     animated:true, frames:['drift']},
  {id:'fx_rain',              desc:'Rain overlay',                            animated:true, frames:['fall']},
  {id:'fx_snow',              desc:'Snow overlay',                            animated:true, frames:['drift']},
  {id:'fx_ember',              desc:'Drifting embers (Sootworks/Wilds)',      animated:true, frames:['drift']},
];

// ── Build manifest ───────────────────────────────────────────────────────────

function build() {
  const sprites = [];

  // 1. Items — kebab-stem by name, disambiguate by defId when multiple items
  // normalise to the same stem (e.g. 'Antivenom(4)' and 'Antivenom+(4)').
  const allItems = loadAllItems();
  const usedItemIds = new Set();
  for (const item of allItems) {
    const region = guessItemRegion(item.name);
    const category = itemSpriteCategory(item.category);
    let stem = kebab(item.name);
    let spriteId = `${region}/${stem}`;
    if (usedItemIds.has(spriteId)) {
      spriteId = `${region}/${stem}_${item.id}`;
    }
    usedItemIds.add(spriteId);
    sprites.push({
      id: spriteId,
      category,
      region,
      type: 'icon',
      animated: false,
      description: itemDescription(item),
      consumers: ['src/content/aelgard/items-*.js', 'src/content/aelgard/universal-items.js', 'src/content/aelgard/smithing-complete.js'],
      priority: ['weapon','armour','food','pet'].includes(item.category) ? 'high' : 'medium',
      entity: { kind: 'item', defId: item.id, name: item.name, itemCategory: item.category },
    });
  }

  // 2. NPCs / Monsters / Bosses
  const npcHits = extractNpcs();
  for (const hit of npcHits) {
    const region = guessNpcRegion(hit.defId, hit.name);
    const stem = kebab(hit.defId);
    const isBoss = hit.kind === 'boss';
    const isMonster = hit.kind === 'monster';
    const frames = isBoss
      ? ['idle','walk','attack','cast','death','phase_transition']
      : isMonster
      ? ['idle','walk','attack','death']
      : ['idle','walk','talk'];
    sprites.push({
      id: `${region}/${stem}`,
      category: hit.kind,
      region,
      type: 'character',
      animated: true,
      frames,
      description: bossDescription(hit),
      consumers: [`src/content/aelgard/${hit.file}`],
      priority: isBoss ? 'high' : isMonster ? 'high' : 'medium',
      entity: { kind: hit.kind, defId: hit.defId, name: hit.name },
    });
  }

  // 3. NPC bibles — cross-reference and promote descriptions
  const biblesPath = path.resolve(ROOT, '..', '..', '..', 'data', 'npc-bibles.json');
  const altBibles = 'C:/Users/username/ScapeAI/data/npc-bibles.json';
  let bibles = null;
  if (fs.existsSync(biblesPath)) bibles = JSON.parse(fs.readFileSync(biblesPath,'utf8'));
  else if (fs.existsSync(altBibles)) bibles = JSON.parse(fs.readFileSync(altBibles,'utf8'));
  if (bibles) {
    const byId = new Map(sprites.filter(s => s.entity && s.entity.kind === 'npc').map(s => [s.entity.defId, s]));
    for (const npc of bibles.npcs) {
      const entry = byId.get(npc.id);
      if (entry) {
        // Upgrade description using bible archetype
        entry.description = `${npc.archetype}. ${npc.role}.`.slice(0, 200);
        entry.region = npc.region;
        entry.id = `${npc.region}/${kebab(npc.id)}`;
        entry.consumers = [...new Set([...(entry.consumers||[]), 'data/npc-bibles.json'])];
      } else {
        // Bible-only NPC — add a new entry
        sprites.push({
          id: `${npc.region}/${kebab(npc.id)}`,
          category: 'npc',
          region: npc.region,
          type: 'character',
          animated: true,
          frames: ['idle','walk','talk'],
          description: `${npc.archetype}. ${npc.role}.`.slice(0, 200),
          consumers: ['data/npc-bibles.json'],
          priority: 'high',
          entity: { kind: 'npc', defId: npc.id, name: npc.name || npc.title_shown_to_players },
        });
      }
    }
  }

  // 4. Tiles
  const tileSprites = extractTiles();
  for (const t of tileSprites) sprites.push(t);

  // 5. UI
  for (const skill of SKILLS) {
    sprites.push({
      id: `ui/skill_${skill}`,
      category: 'ui',
      region: 'universal',
      type: 'icon',
      animated: false,
      description: `Skill icon for ${skill} — used in skills tab, xp drops, level-up banners.`,
      consumers: ['src/ui/skills-tab.js'],
      priority: 'high',
    });
  }
  for (const cs of COMBAT_STYLES) {
    sprites.push({
      id: `ui/combat_${cs}`,
      category: 'ui',
      region: 'universal',
      type: 'icon',
      animated: false,
      description: `Combat style icon for ${cs.replace(/_/g,' ')}.`,
      consumers: ['src/ui/combat-tab.js'],
      priority: 'high',
    });
  }
  for (const sb of SPELLBOOKS) {
    sprites.push({
      id: `ui/spellbook_${sb}`,
      category: 'ui',
      region: 'universal',
      type: 'icon',
      animated: false,
      description: `Spellbook tab ${sb}.`,
      consumers: ['src/ui/magic-tab.js'],
      priority: 'medium',
    });
  }
  for (const p of PRAYERS) {
    sprites.push({
      id: `ui/prayer_${p}`,
      category: 'ui',
      region: 'universal',
      type: 'icon',
      animated: false,
      description: `Prayer icon for ${p.replace(/_/g,' ')}.`,
      consumers: ['src/ui/prayer-tab.js'],
      priority: 'medium',
    });
  }
  for (const w of UI_WIDGETS) {
    sprites.push({
      id: `ui/${w}`,
      category: 'ui',
      region: 'universal',
      type: 'widget',
      animated: false,
      description: `UI widget ${w.replace(/_/g,' ')}.`,
      consumers: ['src/ui/*.js'],
      priority: 'medium',
    });
  }

  // 6. FX
  for (const fx of FX_TYPES) {
    sprites.push({
      id: `fx/${fx.id}`,
      category: 'fx',
      region: 'universal',
      type: 'effect',
      animated: fx.animated,
      frames: fx.frames,
      description: fx.desc,
      consumers: ['src/engine/fx.js'],
      priority: fx.id.startsWith('hit_') || fx.id.startsWith('fx_level') || fx.id.startsWith('fx_death') ? 'high' : 'medium',
    });
  }

  // Dedupe by id (keep first)
  const seen = new Set();
  const dedup = [];
  for (const s of sprites) {
    if (seen.has(s.id)) continue;
    seen.add(s.id);
    dedup.push(s);
  }

  const manifest = {
    _generated_by: 'scripts/gen-sprite-manifest.js',
    _generated_at: new Date().toISOString(),
    _version: '1.0.0',
    conventions: {
      directory: 'public/sprites/{category}/{region}/{id}.png',
      animation_sheet: 'public/sprites/{category}/{region}/{id}_sheet.png',
      tile_size_px: 32,
      character_size_px: 48,
      item_icon_px: 32,
      ui_icon_px: 24,
      naming_rule: 'kebab-case, region-prefixed for region-exclusive assets',
      frame_conventions: 'idle=0, walk_cycle=1-4, attack=5-8, cast=9-12, death=13-15, gather=16-19',
      palette_source: 'data/sprite-palettes.json — consult for per-region colour guidance',
      style_notes: 'Low-res pixel art, 16-24 colour palette per region, readable silhouette at 32px.',
    },
    categories: bucketCounts(dedup),
    regions: REGIONS,
    sprites: dedup,
  };

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(manifest, null, 2));
  console.log(`[gen-sprite-manifest] Wrote ${dedup.length} sprite entries to ${path.relative(ROOT, OUT)}`);
  return dedup.length;
}

function bossDescription(hit) {
  const n = hit.name.toLowerCase();
  if (hit.kind === 'boss') {
    return `${hit.name} — boss encounter. Distinct silhouette; multi-phase animation set; region-themed palette.`;
  }
  if (hit.kind === 'monster') {
    const tags = [];
    if (/demon/.test(n)) tags.push('horned, red-skinned');
    if (/skeleton|undead|zombie|ghost|ghoul|vampire/.test(n)) tags.push('undead, bone-visible');
    if (/goblin|orc|hobgoblin/.test(n)) tags.push('goblinoid, green-grey');
    if (/dragon|wyvern|wyrm/.test(n)) tags.push('scaly, winged');
    if (/spider|scorpion/.test(n)) tags.push('chitinous, many-legged');
    if (/giant|troll|ogre/.test(n)) tags.push('huge, lumbering');
    if (/elemental/.test(n)) tags.push('particle-formed, translucent');
    const silhouette = tags.length ? tags.join(', ') : 'standard humanoid or beast';
    return `${hit.name} — monster. ${silhouette}. Clear weapon tell for its attack animation.`;
  }
  return `${hit.name} — NPC. Neutral idle + walk + talk loop; region-appropriate dress.`;
}

function bucketCounts(sprites) {
  const counts = {};
  for (const s of sprites) {
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
  return counts;
}

if (require.main === module) build();

module.exports = { build };
