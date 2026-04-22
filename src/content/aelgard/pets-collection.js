// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Pet Companion base registry
//
// HISTORY: This file formerly held TWO catalogues — pet item definitions AND a
// parallel in-memory `collectionLog` Map built via defineLogSection(). The
// collection-log half was ORPHAN DATA: the engine only reads
// data/collection-log.json (via src/engine/collection-log.js), so nothing ever
// consumed the Map built here. It silently disagreed with the JSON file.
//
// v0.9-waveA2 (C10, 2026-04-22) reconciled the two catalogues:
//   - every item in this file's former defineLogSection() calls is now in
//     data/collection-log.json (one genuinely missing item, Bandos godsword /
//     26005, was folded into general_graardor).
//   - the defineLogSection() helper + in-memory Map have been removed.
//   - this file is now ONLY a pet-item registry (id, name, rate) consumed by
//     pets-extended.js (which drives src/engine/pets.js at runtime).
//
// The `collectionLog` export is retained as a frozen empty Map for backward
// compatibility with any importer that still destructures it; it now emits a
// deprecation warning on first access via the getter below. New code MUST read
// src/engine/collection-log.js + data/collection-log.json.
//
// Drop rates + source refs for pet unlocks live on the `pets` array below and
// in data/droptables.js (authoritative).
// ══════════════════════════════════════════════════════════════════════════════

const items = require('../../data/items');

// ══════════════════════════════════════════════════════════════════════════════
// PET ITEMS — every pet is an inventory item that can be dropped or insured
// ══════════════════════════════════════════════════════════════════════════════

const pets = [];
function pet(id, name, examine, source, rate) {
  items.define({ id, name, examine, value: 0, category: 'pet', tradeable: false, weight: 0 });
  pets.push({ id, name, source, rate, examine });
}

// ── Boss Pets ──────────────────────────────────────────────────────────────

// Heartlands
pet(80001, 'Baby Duran', "Forgefather Duran's offspring. Tiny but angry.", 'Forgefather Duran', '1/3000');

// Boneyard Wastes
pet(80002, 'Sand Prince Jr.', 'A miniature Azhmari. Still regal.', 'Azhmari, The Sand Prince', '1/3000');
pet(80003, 'Hydra cub', 'One head is enough at this size.', 'Bog Hydra', '1/4000');

// Moryskah
pet(80004, 'Count Malachar Jr.', 'A tiny vampire lord. Wears a little cape.', 'Count Malachar', '1/3000');

// Veilwood
pet(80005, 'Veil sprout', 'A cutting from the Veilmother. It grows slowly.', 'The Veilmother', '1/3000');

// Sootworks
pet(80006, 'Mini anvil', "A tiny Vorath. Clinks when it walks.", 'Vorath, Warden of the Deep Vein', '1/3000');
pet(80007, 'Soot golem', 'A tiny soot king. Leaves ash footprints.', 'The Soot King', '1/5000');

// Saltbrine
pet(80008, 'Baby kraken', 'A tiny kraken. Only has 4 tentacles so far.', 'Kraken of Saltbrine', '1/3000');

// Inkweald
pet(80009, 'Dream wisp pet', 'A tame dream wisp. Follows you while you sleep.', 'Inkweald Muse', '1/4000');
pet(80010, 'Harmonic note', 'A crystallized note from the Hollow Choir.', 'Hollow Choir Conductor', '1/5000');

// Glass Desert
pet(80011, 'Glass shard pet', 'A tiny living crystal. Refracts light beautifully.', 'The Glass Tyrant', '1/4000');
pet(80012, 'Veldrak hatchling', "The last dragon's first child. Aelgard's rarest pet.", 'Veldrak, the Last Dragon', '1/5000');
pet(80013, 'Wyrm scale pet', 'A baby crystal wyrm. Harmless. Mostly.', 'Crystal Wyrm', '1/3000');

// Wilderness bosses
pet(80014, 'Chaos blob', 'A fragment of the Chaos Elemental. Unpredictable.', 'Chaos Elemental', '1/3000');
pet(80015, 'Scorpia offspring', 'A baby scorpion queen. Still stings.', 'Scorpia', '1/3000');
pet(80016, "Vet'ion skull", "A tiny floating skull. Vet'ion's pet.", "Vet'ion", '1/3000');
pet(80017, 'Callisto cub', 'A tiny bear cub from the deep wilderness.', 'Callisto', '1/3000');
pet(80018, 'Venenatis spiderling', 'A baby Venenatis. Surprisingly cute.', 'Venenatis', '1/3000');

// Slayer bosses
pet(80019, 'Noon', 'A gargoyle that only appears at noon.', 'Grotesque Guardians', '1/3000');
pet(80020, 'Skotos', 'A dark beast pet from the catacombs.', 'Dark beast (superior)', '1/3000');
pet(80021, 'Hellpuppy', 'A tiny hellhound. Very hot to the touch.', 'Cerberus', '1/3000');
pet(80022, 'Kraken pet', 'A miniature cave kraken.', 'Cave Kraken (boss)', '1/3000');
pet(80023, 'Smoke devil pet', 'A tiny smoke devil. Coughs.', 'Thermonuclear smoke devil', '1/3000');

// Metal dragon pets
pet(80024, 'Iron baby dragon', 'A tiny iron dragon hatchling.', 'Iron dragon', '1/5000');

// Inferno
pet(80025, 'Jal-nib-rek', 'A tiny TzKal-Zuk. The ultimate flex.', 'Infernal Challenge (wave 69)', '1/100');

// Fight Caves
pet(80026, 'TzRek-Jad', 'A tiny Jad. Slams its little fists.', 'Fight Caves (wave 63)', '1/200');

// KBD
pet(80027, 'Prince Black Dragon', 'A baby KBD. Three tiny heads.', 'King Black Dragon', '1/3000');

// ── Skilling Pets ─────────────────────────────────────────────────────────
// Each skill has a pet obtainable while training. Rate: 1/(level × 25) per action.
// Higher level = slightly more common, but still extremely rare.

pet(80101, 'Rock golem (pet)', 'A tiny rock golem. Follows you while mining.', 'Mining (any rock)', '~1/250k actions');
pet(80102, 'Heron', 'A fishing heron. Stands beside you while fishing.', 'Fishing (any spot)', '~1/250k actions');
pet(80103, 'Beaver', 'A woodcutting beaver. Chews on things.', 'Woodcutting (any tree)', '~1/250k actions');
pet(80104, 'Giant squirrel', 'An agility squirrel. Very fast.', 'Agility (any course)', '~1/30k laps');
pet(80105, 'Tangleroot', 'A tiny tree spirit. Grows over time.', 'Farming (any harvest)', '~1/7000 harvests');
pet(80106, 'Rocky', 'A raccoon thieving pet.', 'Thieving (any pickpocket)', '~1/250k actions');
pet(80107, 'Rift guardian', 'A tiny guardian from the Rift.', 'Runecrafting (any altar)', '~1/250k crafts');
pet(80108, 'Herbi', 'A tiny herbiboar. Sniffs herbs.', 'Herblore (any mix)', '~1/7000 potions');
pet(80109, 'Phoenix', 'A fiery phoenix. Rises from ashes.', 'Firemaking (Spirit Pyre minigame)', '1/5000');
pet(80110, 'Chompy chick', 'A baby chinchompa.', 'Hunter (any trap)', '~1/250k catches');
pet(80111, 'Nexling', 'A tiny construct that orbits your head.', 'Construction (any furniture)', '~1/250k builds');

// ── Minigame Pets ─────────────────────────────────────────────────────────

pet(80201, 'Lil creator', 'A tiny Void Knight.', 'Pest Control (1/5000 games)', '1/5000');
pet(80202, 'Bloodhound', 'A tracking dog from treasure trails.', 'Master clue scroll (1/1000)', '1/1000');

// ══════════════════════════════════════════════════════════════════════════════
// DEPRECATED: collectionLog Map
//
// Formerly this file built a second collection-log catalogue via
// defineLogSection(). That catalogue was orphan — the engine only reads
// data/collection-log.json. As of v0.9-waveA2 (C10) the data has been merged
// into the JSON; the Map is now empty. Accessing it emits a deprecation
// warning (once per process). Do not add new entries here — edit
// data/collection-log.json instead.
// ══════════════════════════════════════════════════════════════════════════════

const collectionLog = new Map();
let _warnedCollectionLog = false;
function _warnDeprecated(op) {
  if (_warnedCollectionLog) return;
  _warnedCollectionLog = true;
  console.warn(
    '[pets-collection] DEPRECATED: pets-collection.js `collectionLog` Map is no longer '
    + 'populated (reconciled into data/collection-log.json at v0.9-waveA2 C10). '
    + 'Called .' + op + '(). Read the catalogue via src/engine/collection-log.js instead.'
  );
}
// Wrap mutators so any stray consumer is flagged but doesn't crash.
const origSet = collectionLog.set.bind(collectionLog);
collectionLog.set = function (...args) { _warnDeprecated('set'); return origSet(...args); };

function defineLogSection(_opts) {
  _warnDeprecated('defineLogSection');
  // no-op — new entries must go into data/collection-log.json
}

// ══════════════════════════════════════════════════════════════════════════════

// Count totals
const totalPets = pets.length;

console.log(`[aelgard] Pet system: ${totalPets} pets defined (collection log → data/collection-log.json)`);

module.exports = { pets, collectionLog, defineLogSection };
