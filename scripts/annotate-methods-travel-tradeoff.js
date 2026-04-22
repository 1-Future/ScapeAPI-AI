// ══════════════════════════════════════════════════════════════════════════════
// scripts/annotate-methods-travel-tradeoff.js
//
// Burn-wave0 task 17 + task 18:
//   1. Travel-cost annotation. OSRS players weigh "one-tile-closer-to-bank"
//      heavily (Song of the Elves principle). For every method in
//      data/methods/*.json we attach:
//        travel_time_to_bank_seconds — seconds per round trip
//        nearest_teleport            — string | null (walk-only)
//        banking_trip_cost           — { gp, intensity }
//        travel_region_multiplier    — 0..1.0 additive factor already baked in
//        effective_xp_per_hour       — base * active_min / (active_min + travel_min)
//        effective_gp_per_hour       — base * same ratio
//
//   2. Tradeoff annotation. Supplies burn. For every method we attach:
//        gp_cost_per_hour            — supplies consumed (cannonballs, pots,
//                                       runes, seeds, ores, food, etc.)
//        net_gp_per_hour             — gp_per_hour - gp_cost_per_hour
//        tradeoff_profile            — +XP+GP | +XP-GP | +GP-XP | +XP 0GP | misery
//
// The annotator is deterministic and idempotent — running it again over an
// already-annotated file produces identical output (tweaks are based solely
// on the input method's region / spot / name / skill / intensity / produces).
//
// Reference calibration (from task brief):
//   AFK willows      → gp_cost=0,      bank_travel=30s
//   Blast furnace    → gp_cost~300k/hr, bank_travel=0   (at bank)
//   Cannon slayer    → gp_cost~200k/hr, bank_travel=var
//   Zulrah           → gp_cost~100k/hr, bank_travel=15s (nearby tele)
//   Vorkath          → gp_cost~150k/hr, bank_travel=20s
//
// Own:    data/methods/*.json, this script.
// DoNot:  any other file referenced by the forbidden list in the brief.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const METHODS_DIR = path.join(REPO_ROOT, 'data', 'methods');
const REPORTS_DIR = path.join(REPO_ROOT, 'reports');

// ══════════════════════════════════════════════════════════════════════════════
// Region travel profile
// Each region has:
//   base_walk_seconds — seconds to walk to the nearest bank from an average spot
//   multiplier         — applied to base in addition to spot-level hints
//   tele                — default teleport to use for that region's bank
//   tele_cost           — GP per cast for the default teleport (rune cost)
// ══════════════════════════════════════════════════════════════════════════════

const REGION_PROFILE = {
  heartlands:    { base_walk: 25, multiplier: 0.00, tele: 'Heartlands Teleport (Lumbrick)', tele_cost: 35 },
  saltbrine:     { base_walk: 22, multiplier: 0.00, tele: 'Saltbrine Teleport (Harbor)',    tele_cost: 55 },
  sootworks:     { base_walk: 32, multiplier: 0.10, tele: 'Sootworks Teleport (Forge Hall)', tele_cost: 65 },
  moryskah:      { base_walk: 38, multiplier: 0.20, tele: 'Moryskah Teleport (Village)',    tele_cost: 85 },
  boneyard:      { base_walk: 42, multiplier: 0.20, tele: 'Senntisten Teleport (Ancient)',  tele_cost: 180 },
  veilwood:      { base_walk: 35, multiplier: 0.10, tele: 'Necklace of Passage',             tele_cost: 0,   consumable: true },
  inkweald:      { base_walk: 45, multiplier: 0.20, tele: 'Moonclan Teleport (Lunar)',       tele_cost: 110 },
  glass_desert:  { base_walk: 55, multiplier: 0.50, tele: 'Glass Desert Pendant',            tele_cost: 0,   consumable: true },
  wilds:         { base_walk: 48, multiplier: 0.30, tele: 'Amulet of Glory (Wilds edge)',    tele_cost: 0,   consumable: true },
  multi:         { base_walk: 30, multiplier: 0.00, tele: 'Ring of Wealth (GE)',             tele_cost: 0,   consumable: true },
};

// Default if region is missing from profile.
const DEFAULT_REGION = { base_walk: 35, multiplier: 0.15, tele: null, tele_cost: 0 };

// ══════════════════════════════════════════════════════════════════════════════
// Spot keyword profile
// Detected from location.spot text. Multipliers and overrides on top of region.
// ══════════════════════════════════════════════════════════════════════════════

// Keywords that indicate the spot is AT or adjacent to a bank — zero travel.
const AT_BANK_KEYWORDS = [
  'bank', 'furnace', 'anvil', 'ge ', 'grand exchange', 'blast furnace',
  'spinning wheel', "potter's wheel", 'tannery', 'pottery', 'crafting guild',
  'fishing guild', 'mining guild', 'farming guild', 'loom',
  'altar + bank', 'lumbrick bench', 'whisperthorn bench', 'chelser bench',
  'harbor square', 'lumbrick market', 'town square', 'poh', 'house',
  'player-owned',
];

// Keywords for "central near bank" — short travel (~10-20s).
const CENTRAL_KEYWORDS = [
  'central', 'square', 'marketplace', 'market', 'hub', 'outskirts', 'edge',
  'shrine', 'shanty row',  // saltbrine central
  'harbour', 'harbor',
  'drifting market', 'saltbrine drifting market',
];

// Keywords for "remote" spots — +50-100% travel.
const REMOTE_KEYWORDS = [
  'deep', 'remote', 'hidden', 'secluded', 'abyss', 'crag', 'trench',
  'catacombs', 'crypt', 'tomb', 'pyramid', 'mausoleum', 'underwater',
  'cavern', 'cavernous', 'fae grove', 'dream-wood', 'deep forest',
  'subterran', 'sewer', 'lair', 'den',  'arena', 'shrine',
  'lucent', 'resonance chamber', 'ironshade',
  'lava pit', 'lv20 wilderness', 'lv22 wilderness', 'lv30 wilderness',
  'apex', 'shattercrag', 'penseurlake dream-grove',
];

// Keywords for "deep wilderness" — dangerous, extra travel risk (+100%).
const DEEP_WILDS_KEYWORDS = [
  'lv30 wilderness', 'lv40 wilderness', 'kbd', 'callisto', 'vet\'ion',
  'venenatis', 'artio', 'calvar', 'chaos elemental',
];

// Keywords that imply the spot has a direct teleport (~1s click).
const INSTANT_TELE_SPOTS = [
  'poh', 'gilded altar', 'altar', 'player-owned',
  'fairy ring', 'spirit tree', 'tele',
];

// ══════════════════════════════════════════════════════════════════════════════
// Skill-family travel defaults
// Some skills by design are "at the bank" (smithing anvils, crafting benches,
// cooking ranges, herblore benches, fletching — you park and bank). Others are
// "field work" (woodcutting, mining, fishing, hunter, farming).
// ══════════════════════════════════════════════════════════════════════════════

const SKILL_AT_BANK = new Set([
  'smithing', 'cooking', 'herblore', 'fletching', 'crafting', 'construction',
  'prayer', 'runecrafting',  // runecrafting altars aren't bank but we treat the
                             // round-trip cost inside the method (running ess).
]);

const SKILL_FIELD = new Set([
  'woodcutting', 'mining', 'fishing', 'hunter', 'farming', 'firemaking',
  'thieving', 'agility', 'slayer', 'attack', 'strength', 'defence', 'ranged',
  'magic', 'hitpoints',
]);

// ══════════════════════════════════════════════════════════════════════════════
// Supplies cost profile — inferred from skill + method name + produces + reqs.
// Per-hour figures are calibrated against OSRS wiki moneymaker guides and the
// task-brief reference activities (cannonballs 200k/hr, pots 100k/hr, brews
// 150k/hr, blast furnace 300k/hr input).
// ══════════════════════════════════════════════════════════════════════════════

function inferSuppliesCostPerHour(method) {
  const skill = (method.skill || '').toLowerCase();
  const intensity = Number(method.intensity) || 1;
  const name = (method.name || '').toLowerCase();
  const desc = (method.description || '').toLowerCase();
  const spot = (method.location?.spot || '').toLowerCase();
  const items = (method.requires?.items || []).map(s => String(s).toLowerCase());
  const xp = Number(method.xp_per_hour) || 0;
  const gp = Number(method.gp_per_hour) || 0;

  // Tag helpers
  const has = (kw) => name.includes(kw) || desc.includes(kw) || spot.includes(kw);
  const hasItem = (pattern) => items.some(i => i.includes(pattern));

  let cost = 0;

  // --- Combat/slayer supplies (pots, food, runes) ------------------------
  if (['slayer', 'attack', 'strength', 'defence', 'ranged', 'magic', 'hitpoints'].includes(skill)) {
    // Boss-tier: brews, restores, antifires — 100k-200k/hr
    if (has('zulrah') || has('vorkath') || has('vampire lord') || has('kraken')
        || has('coral reaver') || has('desecrator') || has('leviathan')
        || has('marauder') || has('corrupted gauntlet') || has('hydra')) {
      cost = intensity >= 8 ? 180_000 : intensity >= 6 ? 120_000 : 80_000;
    }
    // Chinning (chinchompas burn fast) — 150k-250k/hr
    else if (has('chinning') || has('chinchompa') || hasItem('chinchompa')) {
      cost = 180_000;
    }
    // Cannon slayer — 200k/hr in cannonballs
    else if (has('cannon') || hasItem('cannonball') || hasItem('cannon_ball')) {
      cost = 200_000;
    }
    // Ranged/magic combat with runes+food — 40k-80k/hr
    else if (skill === 'magic' || skill === 'ranged') {
      // Low-tier spells (wind strike) are very cheap (<5k/hr).
      if (has('wind strike') || has('water strike') || has('earth strike')
          || has('curse') || has('confuse') || has('bolt cow') || has('arrow'
           + ' cow') || hasItem('air_rune') && intensity <= 2) {
        cost = 2_500;
      } else if (has('teleport') || has('tele ')) {
        // Tele spam — rune cost but low xp
        cost = 25_000;
      } else if (has('alch') || has('alchemy')) {
        cost = 60_000;
      } else if (has('splash')) {
        cost = 8_000;
      } else if (intensity >= 6) {
        cost = 70_000;
      } else if (intensity >= 4) {
        cost = 40_000;
      } else {
        cost = 15_000;
      }
    }
    // Melee active combat — food burn only
    else if (intensity >= 6) {
      cost = 60_000;
    } else if (intensity >= 4) {
      cost = 25_000;
    } else if (intensity >= 3) {
      cost = 10_000;
    } else {
      cost = 3_000;  // AFK safespot — minimal food
    }

    // Prayer-pot heavy methods (prayer-flick, safe spots with prayer)
    if (has('prayer') || has('flick') || has('piety') || has('chivalry')) {
      cost += 50_000;
    }
  }

  // --- Firemaking ---------------------------------------------------------
  else if (skill === 'firemaking') {
    // Logs burn equal to xp/hr divided by log xp. Rough: 20-80k/hr in logs.
    if (has('magic log') || has('magic pyre') || has('redwood')) cost = 200_000;
    else if (has('yew')) cost = 140_000;
    else if (has('maple')) cost = 55_000;
    else if (has('willow')) cost = 28_000;
    else if (has('oak')) cost = 12_000;
    else cost = 6_000;
  }

  // --- Cooking (raw fish/meat cost) ---------------------------------------
  else if (skill === 'cooking') {
    if (has('shark') || has('anglerfish')) cost = 180_000;
    else if (has('monkfish') || has('swordfish')) cost = 80_000;
    else if (has('lobster') || has('salmon')) cost = 40_000;
    else if (has('trout')) cost = 15_000;
    else if (has('karambwan')) cost = 150_000;
    else if (has('dark crab') || has('dragonfruit')) cost = 220_000;
    else if (has('bread') || has('shrimp') || has('meat')) cost = 3_000;
    else if (intensity >= 4) cost = 60_000;
    else cost = 8_000;
  }

  // --- Smithing (ores + coal in, bars/items out) --------------------------
  else if (skill === 'smithing') {
    if (has('blast furnace') || spot.includes('blast furnace') || has('blast ')) {
      // Blast furnace: primary+coal cost. Scales with tier.
      if (has('runite') || has('rune ')) cost = 800_000;
      else if (has('adamant')) cost = 400_000;
      else if (has('mithril')) cost = 260_000;
      else if (has('steel')) cost = 300_000;
      else if (has('soot-iron') || has('soot iron')) cost = 120_000;
      else cost = 200_000;
    } else if (has('gilded') || has('gold bar') || has('goldsmith')) {
      cost = 40_000;  // gold ore buy-in
    } else if (has('runite') || has('rune ')) cost = 380_000;
    else if (has('adamant')) cost = 220_000;
    else if (has('mithril')) cost = 140_000;
    else if (has('steel')) cost = 90_000;
    else if (has('iron')) cost = 40_000;
    else if (has('bronze')) cost = 1_500;  // bronze = copper+tin, ~1-2 gp/bar
    else cost = 5_000;  // baseline for untagged smithing
  }

  // --- Herblore (grimy + secondary) ---------------------------------------
  else if (skill === 'herblore') {
    if (has('clean') && intensity <= 2) cost = 0;  // pure clean = profit
    else if (has('saradomin brew') || has('super restore') || has('anti-venom')) cost = 320_000;
    else if (has('prayer potion') || has('sanfew')) cost = 240_000;
    else if (has('super combat') || has('combat potion') || has('super strength')) cost = 180_000;
    else if (has('torstol') || has('ranarr')) cost = 160_000;
    else if (has('snapdragon') || has('cadantine') || has('dwarf weed')) cost = 140_000;
    else if (has('harralander') || has('tarromin')) cost = 50_000;
    else if (has('guam') || has('marrentill')) cost = 15_000;
    else if (intensity >= 4) cost = 100_000;
    else cost = 30_000;
  }

  // --- Fletching (logs + strings) -----------------------------------------
  else if (skill === 'fletching') {
    if (has('redwood')) cost = 280_000;
    else if (has('magic')) cost = 200_000;
    else if (has('yew')) cost = 120_000;
    else if (has('maple')) cost = 55_000;
    else if (has('willow')) cost = 25_000;
    else if (has('oak')) cost = 10_000;
    else if (has('dart') || has('broad')) cost = 140_000;
    else if (has('bolt') && intensity >= 4) cost = 80_000;
    else cost = 5_000;
  }

  // --- Crafting (hides, gems, vials, glass) -------------------------------
  else if (skill === 'crafting') {
    if (has('zenyte') || has('torture') || has('anguish') || has('suffering')) cost = 900_000;
    else if (has('fury') || has('onyx') || has('dragonstone')) cost = 420_000;
    else if (has('diamond') || has('emerald bolt')) cost = 140_000;
    else if (has('ruby') || has('sapphire') || has('emerald')) cost = 60_000;
    else if (has('dragon leather') || has('green dragon') || has('blue dragon')
             || has('red dragon') || has('black dragon')) cost = 300_000;
    else if (has('battlestaff') || has('lantadyme') || has('mystic')) cost = 180_000;
    else if (has('leather') || has('cowhide')) cost = 20_000;
    else if (has('glass') || has('molten glass')) cost = 25_000;
    else if (has('wool') || has('pot') || has('bowl')) cost = 2_000;
    else if (intensity >= 4) cost = 80_000;
    else cost = 8_000;
  }

  // --- Construction (planks + nails, rock for stone, altars) --------------
  else if (skill === 'construction') {
    if (has('mahogany') || has('gnome bench') || has('teleport throne')
        || has('boss-room portal') || has('dungeon (portal)')) cost = 850_000;
    else if (has('teak') || has('oak larder') || has('kitchen') || has('gilded altar')
             || has('altar (chapel)')) cost = 320_000;
    else if (has('oak') || has('bookcase') || has('study')) cost = 160_000;
    else if (has('chair') || has('plank ') || has('regular')) cost = 50_000;
    else if (intensity >= 4) cost = 200_000;
    else cost = 40_000;
  }

  // --- Runecrafting (essence cost) ----------------------------------------
  else if (skill === 'runecrafting') {
    // RC: essence input is ~300 gp/essence for pure ess. Output runes are the
    // gp_per_hour. Cost is the essence buy-in.
    if (has('wrath') || has('soul') || has('blood')) cost = 180_000;
    else if (has('death')) cost = 140_000;
    else if (has('law') || has('nature')) cost = 90_000;
    else if (has('chaos') || has('cosmic')) cost = 50_000;
    else if (has('astral') || has('body') || has('mind')) cost = 25_000;
    else cost = 15_000;
  }

  // --- Farming (seeds + compost) ------------------------------------------
  else if (skill === 'farming') {
    if (has('magic tree') || has('spirit tree') || has('celastrus')) cost = 200_000;
    else if (has('yew tree') || has('palm') || has('redwood')) cost = 80_000;
    else if (has('maple tree') || has('mahogany') || has('teak')) cost = 40_000;
    else if (has('torstol') || has('snapdragon')) cost = 120_000;
    else if (has('ranarr') || has('kwuarm')) cost = 60_000;
    else if (has('willow tree') || has('oak tree') || has('herb')) cost = 20_000;
    else if (has('allotment') || has('hops') || has('potato') || has('seed')) cost = 5_000;
    else cost = 10_000;
  }

  // --- Mining / Woodcutting / Fishing / Hunter / Firemaking (mostly $0) ---
  // Field gathering: no supplies — just an axe/pickaxe/net. Some exceptions
  // below (cannonballs as slayer/thieving not mining).
  else if (skill === 'mining' || skill === 'woodcutting' || skill === 'fishing'
           || skill === 'hunter' || skill === 'thieving' || skill === 'agility') {
    // Paydirt / motherlode needs nothing. Motherlode 0gp.
    // Thieving pickpocketing needs 0gp. Blackjacking needs a blackjack.
    // Hunter: some traps burn bait (bird snares, butterfly nets, etc.)
    if (skill === 'hunter' && has('chinchompa')) cost = 0;  // gathered, not burned
    else if (skill === 'hunter' && (has('drift net') || has('net trap'))) cost = 5_000;
    else if (skill === 'fishing' && has('barbarian')) cost = 2_000;  // feathers
    else if (skill === 'fishing' && (has('karambwan') || has('karambwanji'))) cost = 4_000;
    else cost = 0;
  }

  // --- Prayer (bone cost for altars) --------------------------------------
  else if (skill === 'prayer') {
    if (has('dragon bone') || has('wyvern') || has('superior')) cost = 320_000;
    else if (has('dagannoth') || has('big bone')) cost = 140_000;
    else if (has('altar') || has('gilded') || has('chaos altar') || has('offering')) cost = 80_000;
    else cost = 20_000;
  }

  // Apply sanity cap — misery/zero methods shouldn't exceed realistic burn.
  // Anything more expensive than best-in-slot moneymaker is a bug.
  if (cost > 2_000_000) cost = 2_000_000;

  return cost;
}

// ══════════════════════════════════════════════════════════════════════════════
// Travel-time computation
// Returns { travel_time_to_bank_seconds, nearest_teleport, banking_trip_cost,
//           travel_region_multiplier }
// ══════════════════════════════════════════════════════════════════════════════

function computeTravel(method) {
  const region = (method.location?.region || 'heartlands').toLowerCase();
  const spotRaw = method.location?.spot || '';
  const spot = spotRaw.toLowerCase();
  const skill = (method.skill || '').toLowerCase();
  const name = (method.name || '').toLowerCase();
  const intensity = Number(method.intensity) || 1;

  const profile = REGION_PROFILE[region] || DEFAULT_REGION;
  const regionMult = profile.multiplier;

  // Base walk seconds starts with region baseline.
  let base = profile.base_walk;

  // Spot modifiers ------------------------------------------------------------
  const hasKw = (arr) => arr.some(kw => spot.includes(kw) || name.includes(kw));

  // AT-bank spots: 0 travel. The skill stack happens at the bank tile.
  if (hasKw(AT_BANK_KEYWORDS)) {
    base = 0;
  }
  // Central spots: short (~8-15s)
  else if (hasKw(CENTRAL_KEYWORDS)) {
    base = Math.max(8, Math.round(base * 0.4));
  }
  // Instant-tele spots: ~3s
  else if (hasKw(INSTANT_TELE_SPOTS)) {
    base = 3;
  }
  // Remote spots: double travel
  else if (hasKw(REMOTE_KEYWORDS)) {
    base = Math.round(base * 1.75);
  }

  // Deep-wilds: double on top of whatever we've got (dangerous, often no tele).
  if (hasKw(DEEP_WILDS_KEYWORDS)) {
    base = Math.round(base * 1.5);
  }

  // Skill-family adjustment: bench skills (smithing/cooking/crafting) are
  // usually at the bank unless the spot explicitly says otherwise.
  if (SKILL_AT_BANK.has(skill) && base > 0 && hasKw(AT_BANK_KEYWORDS)) {
    base = 0;
  }

  // Apply region multiplier (wilds +30%, etc).
  let travel = Math.round(base * (1 + regionMult));

  // High-intensity combat is clustered around teleports (quick access).
  if (intensity >= 8 && travel > 0 && travel > 25) {
    travel = Math.min(travel, 30);
  }

  // Wilds/Glass Desert remote bosses keep a floor — Scape avoids zero-travel
  // bosses.
  if (region === 'wilds' && travel < 20) travel = 20;
  if (region === 'glass_desert' && travel < 25) travel = 25;

  // Pick the teleport.
  let tele = profile.tele;
  // Walk-only: if the spot says "walk" or the region is missing a tele for
  // quest reasons, null it.
  if (travel >= 60 && /walk[- ]?only|no tele|no teleport/.test(spot + ' ' + name)) {
    tele = null;
  }
  // Zero-travel (at-bank): no tele needed for bank return.
  if (travel === 0) {
    tele = null;
  }

  // Banking trip cost: gp = tele cost (if travel > 10s), intensity = clicks
  // needed per trip (walk-run-click = higher intensity than one-click tele).
  let tripGp = 0;
  let tripIntensity = 0;
  if (travel === 0) {
    tripGp = 0;
    tripIntensity = 0;  // don't leave the bank
  } else if (travel <= 10) {
    tripGp = 0;
    tripIntensity = 1;  // click bank, deposit, click back
  } else if (profile.consumable) {
    // Jewellery-style consumable — charge cost ~2000 gp per charge
    tripGp = Math.round(2000 / 4);  // 4 charges = 500 gp amortized
    tripIntensity = 2;
  } else if (tele && profile.tele_cost > 0) {
    tripGp = profile.tele_cost;
    tripIntensity = 2;
  } else {
    tripGp = 0;
    tripIntensity = 3;  // full walk round-trip
  }

  return {
    travel_time_to_bank_seconds: travel,
    nearest_teleport: tele,
    banking_trip_cost: { gp: tripGp, intensity: tripIntensity },
    travel_region_multiplier: regionMult,
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// Effective XP + tradeoff profile
// ══════════════════════════════════════════════════════════════════════════════

// Trips per hour heuristic. Bench skills (smithing/cooking) trip ~6-10 per
// hour (inventory of 27 burns through in ~6 minutes). Field skills (mining,
// woodcutting) trip ~2-4 per hour (28 logs at 2s each = 56s cut + 30s travel
// = ~1.5 min per trip at mid-tier). Combat trips ~2-3 per hour (full inv of
// loot). AFK skilling trips 0.5-2 per hour.
function tripsPerHour(method) {
  const skill = (method.skill || '').toLowerCase();
  const intensity = Number(method.intensity) || 1;
  const travel = method.travel_time_to_bank_seconds || 0;

  if (travel === 0) return 0;  // at-bank: no trips

  // Attack/Strength/Defence/HP/Ranged/Magic (combat drop-loot): few trips.
  if (['attack', 'strength', 'defence', 'hitpoints'].includes(skill)) {
    return intensity >= 7 ? 4 : intensity >= 5 ? 3 : 2;
  }
  if (['ranged', 'magic'].includes(skill)) {
    return intensity >= 6 ? 5 : 3;
  }
  if (skill === 'slayer') {
    return intensity >= 7 ? 3 : 2;
  }
  // Bench skills with inputs — banking every 6 min.
  if (['herblore', 'fletching', 'crafting', 'cooking'].includes(skill)) {
    return 8;
  }
  if (skill === 'smithing') return 6;  // longer per-bar cycles
  // Field gatherers — infrequent banking.
  if (['woodcutting', 'mining', 'fishing', 'hunter'].includes(skill)) {
    return intensity <= 2 ? 1.5 : intensity >= 4 ? 4 : 3;
  }
  if (skill === 'thieving') return 3;
  if (skill === 'agility') return 0.5;  // marks of grace, rarely
  if (skill === 'firemaking') return intensity >= 4 ? 4 : 2;
  if (skill === 'farming') return 1;  // per run-around
  if (skill === 'runecrafting') return 12;  // heavy ess trips
  if (skill === 'prayer') return 4;  // bring bones, go back
  if (skill === 'construction') return 8;  // butler trips
  return 2;
}

function computeEffective(method) {
  const base_xp = Number(method.xp_per_hour) || 0;
  const base_gp = Number(method.gp_per_hour) || 0;
  const travel = method.travel_time_to_bank_seconds || 0;
  const trips = tripsPerHour(method);

  // Round-trip travel per hour in minutes.
  const travel_seconds_per_hour = travel * 2 * trips;  // there-and-back
  const travel_minutes = travel_seconds_per_hour / 60;
  const active_minutes = Math.max(1, 60 - travel_minutes);

  const ratio = active_minutes / (active_minutes + travel_minutes);
  const effective_xp = Math.round(base_xp * ratio);
  const effective_gp = Math.round(base_gp * ratio);

  return {
    effective_xp_per_hour: effective_xp,
    effective_gp_per_hour: effective_gp,
    travel_minutes_per_hour: Math.round(travel_minutes * 10) / 10,
    active_minutes_per_hour: Math.round(active_minutes * 10) / 10,
    trips_per_hour: trips,
  };
}

function classifyTradeoff(method, netGp) {
  const xp = Number(method.xp_per_hour) || 0;
  const gp = Number(method.gp_per_hour) || 0;
  const intensity = Number(method.intensity) || 1;

  // Misery = method offers neither meaningful XP nor meaningful GP relative
  // to its intensity. Marstead lens: if it burns your time AND your bank for
  // tiny gains, it's misery — cut it.
  //  (a) High-intensity methods with deeply negative net AND low xp
  //  (b) Any intensity with net deeply negative AND xp below a low floor
  //  (c) Very low xp + low gp relative to intensity band
  const MISERY_NET_FLOOR = -500_000;
  if (netGp <= MISERY_NET_FLOOR && xp < 40_000) return 'misery';
  if (xp < 5_000 && netGp < 5_000) return 'misery';
  if (intensity >= 6 && xp < 20_000 && netGp < 10_000) return 'misery';

  // Tradeoff flavors.
  //  +XP+GP  — both XP and net-gp meaningfully positive
  //  +GP-XP  — net gp dominates, xp is an afterthought (gp >> xp)
  //  +XP-GP  — net gp negative, burn supplies for XP
  //  +XP 0GP — xp gain, gp roughly neutral
  const positiveNet = netGp >= 10_000;
  const negativeNet = netGp < -10_000;
  const ratio = xp > 0 ? gp / xp : Infinity;  // gp-per-xp ratio

  // +GP-XP: gp output dominates while xp is average/low for the intensity
  // band. Typical at high thieving (master farmer, necropolis run), high
  // magic (alch), thieving stalls, stake-and-loot. Relative: gp is >= 15×
  // xp/hr AND xp is below what the intensity band typically yields.
  // Intensity band typical xp (rough): band*20000, so int 4 = 80k xp/hr.
  const bandTypicalXp = intensity * 20_000;
  if (positiveNet && xp > 0 && gp >= xp * 15 && xp < bandTypicalXp) {
    return '+GP-XP';
  }

  if (positiveNet) return '+XP+GP';
  if (negativeNet && xp >= 20_000) return '+XP-GP';
  if (Math.abs(netGp) < 10_000) return '+XP 0GP';
  if (negativeNet) return '+XP-GP';
  return '+XP 0GP';
}

// ══════════════════════════════════════════════════════════════════════════════
// Main pipeline
// ══════════════════════════════════════════════════════════════════════════════

function annotateMethod(method, opts = {}) {
  const { travelOnly = false, tradeoffOnly = false } = opts;
  const doTravel = !tradeoffOnly;
  const doTradeoff = !travelOnly;

  if (doTravel) {
    // 1. Travel
    const travel = computeTravel(method);
    method.travel_time_to_bank_seconds = travel.travel_time_to_bank_seconds;
    method.nearest_teleport = travel.nearest_teleport;
    method.banking_trip_cost = travel.banking_trip_cost;
    method.travel_region_multiplier = travel.travel_region_multiplier;

    // 2. Effective
    const eff = computeEffective(method);
    method.effective_xp_per_hour = eff.effective_xp_per_hour;
    method.effective_gp_per_hour = eff.effective_gp_per_hour;
    method.travel_minutes_per_hour = eff.travel_minutes_per_hour;
    method.active_minutes_per_hour = eff.active_minutes_per_hour;
    method.trips_per_hour = eff.trips_per_hour;
  }

  if (doTradeoff) {
    // 3. Supplies
    const gpCost = inferSuppliesCostPerHour(method);
    method.gp_cost_per_hour = gpCost;
    const netGp = (Number(method.gp_per_hour) || 0) - gpCost;
    method.net_gp_per_hour = netGp;

    // 4. Tradeoff profile
    method.tradeoff_profile = classifyTradeoff(method, netGp);
  }

  return method;
}

function run(opts = {}) {
  const { travelOnly = false, tradeoffOnly = false } = opts;
  if (!fs.existsSync(METHODS_DIR)) {
    console.error(`[annotate] ${METHODS_DIR} missing`);
    process.exit(1);
  }
  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

  const travelHistogram = {
    0: 0, '1-10': 0, '11-20': 0, '21-30': 0, '31-45': 0,
    '46-60': 0, '61-90': 0, '91+': 0,
  };
  const tradeoffCounts = {
    '+XP+GP': 0, '+XP-GP': 0, '+GP-XP': 0, '+XP 0GP': 0, 'misery': 0,
  };
  const skillTouch = {};
  const regionTouch = {};
  let totalMethods = 0;
  let filesTouched = 0;
  const samples = [];  // for rederive report

  for (const fname of fs.readdirSync(METHODS_DIR)) {
    if (!fname.endsWith('.json')) continue;
    const full = path.join(METHODS_DIR, fname);
    let parsed;
    try { parsed = JSON.parse(fs.readFileSync(full, 'utf8')); }
    catch (e) { console.warn(`[annotate] skip ${fname}: ${e.message}`); continue; }
    if (!Array.isArray(parsed.methods)) continue;

    const skillKey = parsed.skill || fname.replace('.json', '');
    skillTouch[skillKey] = 0;

    for (const m of parsed.methods) {
      annotateMethod(m, { travelOnly, tradeoffOnly });
      totalMethods++;
      skillTouch[skillKey]++;

      // Travel histogram bucketing
      const t = m.travel_time_to_bank_seconds;
      if (t === 0) travelHistogram['0']++;
      else if (t <= 10) travelHistogram['1-10']++;
      else if (t <= 20) travelHistogram['11-20']++;
      else if (t <= 30) travelHistogram['21-30']++;
      else if (t <= 45) travelHistogram['31-45']++;
      else if (t <= 60) travelHistogram['46-60']++;
      else if (t <= 90) travelHistogram['61-90']++;
      else travelHistogram['91+']++;

      tradeoffCounts[m.tradeoff_profile] = (tradeoffCounts[m.tradeoff_profile] || 0) + 1;

      const r = (m.location?.region || '?').toLowerCase();
      regionTouch[r] = (regionTouch[r] || 0) + 1;

      // Keep first 10 samples (diverse skills) for the report.
      if (samples.length < 50) {
        samples.push({
          id: m.id,
          skill: skillKey,
          intensity: m.intensity,
          region: r,
          spot: m.location?.spot,
          base_xp_per_hour: m.xp_per_hour,
          effective_xp_per_hour: m.effective_xp_per_hour,
          base_gp_per_hour: m.gp_per_hour,
          gp_cost_per_hour: m.gp_cost_per_hour,
          net_gp_per_hour: m.net_gp_per_hour,
          travel_s: m.travel_time_to_bank_seconds,
          nearest_teleport: m.nearest_teleport,
          tradeoff_profile: m.tradeoff_profile,
        });
      }
    }

    fs.writeFileSync(full, JSON.stringify(parsed, null, 2) + '\n');
    filesTouched++;
  }

  // Write report
  const report = {
    generated_at: new Date().toISOString(),
    files_touched: filesTouched,
    total_methods: totalMethods,
    methods_per_skill: skillTouch,
    methods_per_region: regionTouch,
    travel_time_histogram: travelHistogram,
    tradeoff_profile_counts: tradeoffCounts,
    samples,
  };
  fs.writeFileSync(
    path.join(REPORTS_DIR, '_annotate_methods_travel_tradeoff.json'),
    JSON.stringify(report, null, 2),
  );

  // Console summary
  console.log(`[annotate] ${totalMethods} methods across ${filesTouched} files`);
  console.log('[annotate] travel-time histogram:');
  for (const [k, v] of Object.entries(travelHistogram)) console.log(`  ${k} s: ${v}`);
  console.log('[annotate] tradeoff-profile counts:');
  for (const [k, v] of Object.entries(tradeoffCounts)) console.log(`  ${k}: ${v}`);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const travelOnly = args.includes('--travel-only');
  const tradeoffOnly = args.includes('--tradeoff-only');
  run({ travelOnly, tradeoffOnly });
}

module.exports = {
  annotateMethod,
  computeTravel,
  computeEffective,
  inferSuppliesCostPerHour,
  classifyTradeoff,
  tripsPerHour,
  REGION_PROFILE,
};
