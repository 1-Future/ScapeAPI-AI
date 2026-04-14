// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Pet System + Collection Log
//
// PETS: Every boss has a 1/3000-1/5000 pet drop. Every skill has a skilling pet.
// Minigames have pets too. ~45 pets total. Each pet is hundreds of hours to obtain.
//
// COLLECTION LOG: Tracks every unique item obtained from every source.
// Filling the log IS the endgame. Thousands of hours.
//
// These two systems alone multiply every piece of existing content by 10x hours.
// A player who "completes" Forgefather Duran in 1 kill now has motivation to kill
// it 3000+ times for the pet. A player who finishes all quests still has hundreds
// of collection log slots to fill.
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
// COLLECTION LOG — every unique drop source tracked
// ══════════════════════════════════════════════════════════════════════════════

const collectionLog = new Map();

function defineLogSection(opts) {
  collectionLog.set(opts.id, {
    id: opts.id,
    name: opts.name,
    category: opts.category, // 'bosses', 'clues', 'minigames', 'raids', 'other'
    items: opts.items, // [{ id, name }] — items to track
    killCount: opts.killCount || false, // track kill count?
  });
}

// ── Boss Logs ──────────────────────────────────────────────────────────────

defineLogSection({ id: 'log_duran', name: 'Forgefather Duran', category: 'bosses', killCount: true,
  items: [{ id: 3010, name: "Duran's hammer" }, { id: 80001, name: 'Baby Duran' }] });

defineLogSection({ id: 'log_azhmari', name: 'Azhmari', category: 'bosses', killCount: true,
  items: [{ id: 4050, name: "Azhmari's crown" }, { id: 4051, name: 'Sandstorm staff' }, { id: 4052, name: 'Bone cleaver' }, { id: 80002, name: 'Sand Prince Jr.' }] });

defineLogSection({ id: 'log_hydra', name: 'Bog Hydra', category: 'bosses', killCount: true,
  items: [{ id: 4060, name: 'Hydra scale' }, { id: 4061, name: 'Hydra leather body' }, { id: 80003, name: 'Hydra cub' }] });

defineLogSection({ id: 'log_malachar', name: 'Count Malachar', category: 'bosses', killCount: true,
  items: [{ id: 5050, name: "Malachar's signet" }, { id: 5051, name: 'Sanguine cape' }, { id: 5052, name: 'Bloodwood staff' }, { id: 80004, name: 'Count Malachar Jr.' }] });

defineLogSection({ id: 'log_veilmother', name: 'The Veilmother', category: 'bosses', killCount: true,
  items: [{ id: 6050, name: "Veilmother's heartwood" }, { id: 6051, name: 'Verdant plate' }, { id: 6052, name: 'Root whip' }, { id: 80005, name: 'Veil sprout' }] });

defineLogSection({ id: 'log_vorath', name: 'Vorath', category: 'bosses', killCount: true,
  items: [{ id: 7050, name: "Vorath's anvil ring" }, { id: 7051, name: 'Molten maul' }, { id: 80006, name: 'Mini anvil' }] });

defineLogSection({ id: 'log_soot_king', name: 'The Soot King', category: 'bosses', killCount: true,
  items: [{ id: 7060, name: 'Soot King crown' }, { id: 80007, name: 'Soot golem' }] });

defineLogSection({ id: 'log_kraken_saltbrine', name: 'Kraken of Saltbrine', category: 'bosses', killCount: true,
  items: [{ id: 8050, name: 'Kraken tentacle' }, { id: 8051, name: 'Tidal amulet' }, { id: 8052, name: 'Abyssal trident' }, { id: 80008, name: 'Baby kraken' }] });

defineLogSection({ id: 'log_muse', name: 'Inkweald Muse', category: 'bosses', killCount: true,
  items: [{ id: 9050, name: "Muse's mask" }, { id: 9051, name: 'Dreamweaver staff' }, { id: 80009, name: 'Dream wisp pet' }] });

defineLogSection({ id: 'log_choir', name: 'Hollow Choir', category: 'raids', killCount: true,
  items: [{ id: 9060, name: 'Choir sigil' }, { id: 9061, name: 'Harmonic blade' }, { id: 9062, name: 'Silence bow' }, { id: 80010, name: 'Harmonic note' }] });

defineLogSection({ id: 'log_glass_tyrant', name: 'Glass Tyrant', category: 'bosses', killCount: true,
  items: [{ id: 10050, name: 'Glass crown' }, { id: 10051, name: 'Prismatic blade' }, { id: 80011, name: 'Glass shard pet' }] });

defineLogSection({ id: 'log_veldrak', name: 'Veldrak', category: 'bosses', killCount: true,
  items: [{ id: 10060, name: 'Dragon shard' }, { id: 10061, name: "Veldrak's talon" }, { id: 10062, name: "Veldrak's scale mail" }, { id: 80012, name: 'Veldrak hatchling' }] });

defineLogSection({ id: 'log_crystal_wyrm', name: 'Crystal Wyrm', category: 'bosses', killCount: true,
  items: [{ id: 2010, name: 'Wyrm scale platebody' }, { id: 2011, name: 'Wyrm scale platelegs' }, { id: 2012, name: 'Wyrm scale helm' }, { id: 2015, name: 'Crystal wyrm fang' }, { id: 80013, name: 'Wyrm scale pet' }] });

// Wilderness bosses
defineLogSection({ id: 'log_chaos_ele', name: 'Chaos Elemental', category: 'bosses', killCount: true,
  items: [{ id: 80014, name: 'Chaos blob' }] });
defineLogSection({ id: 'log_scorpia', name: 'Scorpia', category: 'bosses', killCount: true,
  items: [{ id: 22007, name: 'Imbued heart' }, { id: 80015, name: 'Scorpia offspring' }] });
defineLogSection({ id: 'log_vetion', name: "Vet'ion", category: 'bosses', killCount: true,
  items: [{ id: 24001, name: 'Berserker ring' }, { id: 22008, name: 'Eternal gem' }, { id: 80016, name: "Vet'ion skull" }] });
defineLogSection({ id: 'log_callisto', name: 'Callisto', category: 'bosses', killCount: true,
  items: [{ id: 24004, name: 'Warrior ring' }, { id: 80017, name: 'Callisto cub' }] });
defineLogSection({ id: 'log_venenatis', name: 'Venenatis', category: 'bosses', killCount: true,
  items: [{ id: 24005, name: 'Ring of suffering' }, { id: 80018, name: 'Venenatis spiderling' }] });
defineLogSection({ id: 'log_kbd', name: 'King Black Dragon', category: 'bosses', killCount: true,
  items: [{ id: 20010, name: 'Dragon full helm' }, { id: 80027, name: 'Prince Black Dragon' }] });

// Slayer bosses
defineLogSection({ id: 'log_cerberus', name: 'Cerberus', category: 'bosses', killCount: true,
  items: [{ id: 31020, name: 'Primordial crystal' }, { id: 31021, name: 'Pegasian crystal' }, { id: 31022, name: 'Eternal crystal' }, { id: 80021, name: 'Hellpuppy' }] });
defineLogSection({ id: 'log_abyssal', name: 'Abyssal Sire/Demon', category: 'bosses', killCount: true,
  items: [{ id: 22001, name: 'Abyssal whip' }, { id: 80020, name: 'Skotos' }] });
defineLogSection({ id: 'log_cave_kraken', name: 'Cave Kraken', category: 'bosses', killCount: true,
  items: [{ id: 22004, name: 'Trident of the seas' }, { id: 80022, name: 'Kraken pet' }] });

// ── Clue Log ──────────────────────────────────────────────────────────────

defineLogSection({ id: 'log_clue_beginner', name: 'Beginner Clues', category: 'clues',
  items: [{ id: 12501, name: 'Uncut sapphire' }] });

defineLogSection({ id: 'log_clue_medium', name: 'Medium Clues', category: 'clues',
  items: [{ id: 23020, name: 'Ranger boots' }, { id: 23021, name: 'Wizard boots' }, { id: 23003, name: 'Black platebody (t)' }] });

defineLogSection({ id: 'log_clue_hard', name: 'Hard Clues', category: 'clues',
  items: [{ id: 23001, name: 'Rune platebody (t)' }, { id: 23002, name: 'Rune platebody (g)' }, { id: 23022, name: "Robin Hood hat" }, { id: 23010, name: 'Holy book' }, { id: 23011, name: 'Book of darkness' }] });

defineLogSection({ id: 'log_clue_elite', name: 'Elite Clues', category: 'clues',
  items: [{ id: 23030, name: 'Third-age platebody' }, { id: 23031, name: 'Third-age platelegs' }, { id: 23032, name: 'Third-age full helm' }, { id: 23033, name: 'Third-age range top' }, { id: 23034, name: 'Third-age mage hat' }] });

// ── Barrows Log ───────────────────────────────────────────────────────────

defineLogSection({ id: 'log_barrows', name: 'Barrows', category: 'bosses', killCount: true,
  items: [
    { id: 21001, name: "Dharok's greataxe" }, { id: 21002, name: "Dharok's helm" }, { id: 21003, name: "Dharok's platebody" }, { id: 21004, name: "Dharok's platelegs" },
    { id: 21011, name: "Guthan's warspear" }, { id: 21012, name: "Guthan's helm" }, { id: 21013, name: "Guthan's platebody" }, { id: 21014, name: "Guthan's chainskirt" },
    { id: 21021, name: "Verac's flail" }, { id: 21022, name: "Verac's helm" }, { id: 21023, name: "Verac's brassard" }, { id: 21024, name: "Verac's plateskirt" },
    { id: 21031, name: "Ahrim's staff" }, { id: 21032, name: "Ahrim's hood" }, { id: 21033, name: "Ahrim's robe top" }, { id: 21034, name: "Ahrim's robe bottom" },
    { id: 21041, name: "Karil's crossbow" }, { id: 21042, name: "Karil's coif" }, { id: 21043, name: "Karil's leathertop" }, { id: 21044, name: "Karil's leatherskirt" },
    { id: 21051, name: "Torag's hammers" }, { id: 21052, name: "Torag's helm" }, { id: 21053, name: "Torag's platebody" }, { id: 21054, name: "Torag's platelegs" },
  ]
});

// ── Minigame Logs ─────────────────────────────────────────────────────────

defineLogSection({ id: 'log_pest_control', name: 'Pest Control', category: 'minigames',
  items: [{ id: 30001, name: 'Void knight top' }, { id: 30004, name: 'Void melee helm' }, { id: 30005, name: 'Void ranger helm' }, { id: 30006, name: 'Void mage helm' }, { id: 80201, name: 'Lil creator' }] });

defineLogSection({ id: 'log_barb_assault', name: 'Barbarian Assault', category: 'minigames',
  items: [{ id: 30401, name: 'Fighter torso' }, { id: 30402, name: 'Penance skirt' }] });

defineLogSection({ id: 'log_spirit_pyre', name: 'Spirit Pyre', category: 'minigames',
  items: [{ id: 30101, name: 'Pyromancer hat' }, { id: 30102, name: 'Pyromancer top' }, { id: 30103, name: 'Pyromancer legs' }, { id: 30104, name: 'Pyromancer boots' }, { id: 30105, name: 'Bruma torch' }, { id: 80109, name: 'Phoenix' }] });

defineLogSection({ id: 'log_gotr', name: 'Guardians of the Rift', category: 'minigames',
  items: [{ id: 30301, name: 'Hat of the eye' }, { id: 30302, name: 'Robe top of the eye' }, { id: 30303, name: 'Robe bottom of the eye' }, { id: 30304, name: 'Boots of the eye' }, { id: 80107, name: 'Rift guardian' }] });

// ── Skilling Pet Log ──────────────────────────────────────────────────────

defineLogSection({ id: 'log_skilling_pets', name: 'Skilling Pets', category: 'other',
  items: [
    { id: 80101, name: 'Rock golem (pet)' }, { id: 80102, name: 'Heron' }, { id: 80103, name: 'Beaver' },
    { id: 80104, name: 'Giant squirrel' }, { id: 80105, name: 'Tangleroot' }, { id: 80106, name: 'Rocky' },
    { id: 80107, name: 'Rift guardian' }, { id: 80108, name: 'Herbi' }, { id: 80109, name: 'Phoenix' },
    { id: 80110, name: 'Chompy chick' }, { id: 80111, name: 'Nexling' },
  ]
});

// ── God Wars Log ──────────────────────────────────────────────────────────

defineLogSection({ id: 'log_godwars', name: 'God Wars Dungeon', category: 'bosses', killCount: true,
  items: [
    { id: 26003, name: 'Bandos chestplate' }, { id: 26004, name: 'Bandos tassets' }, { id: 26005, name: 'Bandos godsword' },
    { id: 26006, name: 'Armadyl chestplate' }, { id: 26007, name: 'Armadyl chainskirt' }, { id: 26008, name: 'Armadyl crossbow' },
    { id: 26009, name: 'Ancestral hat' }, { id: 26010, name: 'Ancestral robe top' }, { id: 26011, name: 'Ancestral robe bottom' },
    { id: 26012, name: 'Twisted bow' }, { id: 26013, name: 'Scythe of vitur' },
  ]
});

// ══════════════════════════════════════════════════════════════════════════════
// Hour estimates per collection log completion
// ══════════════════════════════════════════════════════════════════════════════
//
// Each boss pet at 1/3000 × ~30 kills/hr = 100 hours average per pet
// 27 boss pets × 100 hours = 2,700 hours just for boss pets
// 11 skilling pets × ~250k actions / ~300 actions/hr = ~830 hours each = 9,130 hours
// Barrows full log (24 items at 1/17 per chest, ~15 chests/hr) = ~40 hours
// Clue log (hundreds of unique items across 4 tiers) = 500+ hours
// God Wars log (rare drops across multiple bosses) = 500+ hours
// Minigame logs = 200+ hours
//
// TOTAL COLLECTION LOG COMPLETION: ~13,000+ hours
// + Max all skills (99 in 23 skills): ~2,000 hours
// + 81 quests: ~200 hours
// + Achievement diaries: ~300 hours
// + All content explored: ~500 hours
//
// GRAND TOTAL MEANINGFUL CONTENT: ~16,000+ hours
// With 200M XP all skills goal: ~50,000+ hours
// With all pets + collection log + 200M + all achievements: ~100,000+ hours
//
// This is WITHOUT inflated drop rates or artificial grind.
// Every hour is spent doing something with a purpose.
// ══════════════════════════════════════════════════════════════════════════════

// Count totals
const totalPets = pets.length;
const totalLogSlots = [...collectionLog.values()].reduce((s, section) => s + section.items.length, 0);
const totalLogSections = collectionLog.size;

console.log(`[aelgard] Pet system: ${totalPets} pets defined`);
console.log(`[aelgard] Collection log: ${totalLogSections} sections, ${totalLogSlots} unique items tracked`);

module.exports = { pets, collectionLog, defineLogSection };
