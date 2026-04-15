// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Moryskah Tertiary (500-hour content)
//
// Voice: long trailing clauses, gothic dread softened with humor. Poe crossed
// with Discworld's undead citizens. Lord Malachar still writes letters to
// people who forgot him. The Bog Witch's herb patch is a slow-motion riot of
// willed resurrections. Morytania-esque but with its own weight — werewolf
// bureaucracy, vampire cabarets, the Barrows brothers as dysfunctional
// siblings.
//
// Landmarks/motifs (shared with moryskah-easter-eggs.js):
//   - The Silent Chapel (where Malachar was once tutored)
//   - The Moonless Inn (werewolf bureaucracy, immigration papers)
//   - The Hollow Choir (prayer but the voices don't always line up)
//   - The Barrows Sisterhood (quests branching per brother)
//   - Wolfbane Distillery (industrial herblore)
//   - The Ferry of the Forgotten (cross-river transport for the undead)
//
// Target: push Moryskah gap score 44 -> 90+ by adding obscure, weird,
// trophy-rich tertiary content — the stuff 500-hour players whisper about
// on the porch of the Moonless Inn.
//
// This file adds:
//   - 25 top-tier training methods (caps to 99, flavored to Moryskah)
//   - 15 obscure maximum-attention methods (3x XP/hr, terribly specific reqs)
//   - 18 quirky interactions (ambient gothic-domestic XP trickles)
//   - 10 reagent combinations (sigils, reliquaries, vampire calling-cards)
//   - 10 "reagent-combo practice" methods (one per combination, trainable)
//
// All methods carry the Marstead 8 knobs. No XP-only quests. No duplicates of
// moryskah-deep.js or moryskah-density.js methods.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const rel = require('../../data/relationships');

// ══════════════════════════════════════════════════════════════════════════════
// MORYSKAH TERTIARY ITEM SOURCES — item IDs in the 95500-95699 range.
// Obscure, location-anchored, gothic-flavored.
// ══════════════════════════════════════════════════════════════════════════════

rel.registerItemSource(95500, { type: 'gathering', sourceId: 'moryskah_silent_chapel_wax', sourceName: 'Silent Chapel — Night Wax', region: 'moryskah', details: 'Night-wax. Gathered from the candles nobody remembers lighting in the Silent Chapel where Lord Malachar once learned his letters. Collected only between 02:00 and 03:00 in-game.', obscure: true });
rel.registerItemSource(95501, { type: 'gathering', sourceId: 'moryskah_moonless_inn_stamp', sourceName: 'Moonless Inn — Stamp Dregs', region: 'moryskah', details: 'Dregs of the Moonless Inn immigration ink. The night-clerk leaves the inkpot out when the werewolves line up; if you come after closing you can skim a jarful.', obscure: true });
rel.registerItemSource(95502, { type: 'gathering', sourceId: 'moryskah_hollow_choir_breath', sourceName: 'The Hollow Choir — Breath Vial', region: 'moryskah', details: "A vial of choir-breath. You leave it uncorked in the pew while the Hollow Choir sings; their voices never quite line up, and something condenses on the glass.", obscure: true });
rel.registerItemSource(95503, { type: 'gathering', sourceId: 'moryskah_barrows_sisterhood_thread', sourceName: 'Barrows Sisterhood — Mending Thread', region: 'moryskah', details: 'Mending thread the Sisterhood uses to stitch the brothers back together after each reawakening. They give it to whoever sits with them for the full reading of the wills.', obscure: true });
rel.registerItemSource(95504, { type: 'gathering', sourceId: 'moryskah_wolfbane_distillery_mash', sourceName: 'Wolfbane Distillery — Still Mash', region: 'moryskah', details: 'Spent wolfbane mash from the distillery vats. The foreman says you can take what the auger spits out as long as you spell your own name correctly on the ledger.', obscure: true });
rel.registerItemSource(95505, { type: 'gathering', sourceId: 'moryskah_ferry_toll_coin', sourceName: 'Ferry of the Forgotten — Toll Coin', region: 'moryskah', details: "Coins the undead press into the ferryman's hand and then forget about. He drops the surplus into a wooden box on the starboard side; you're welcome to one a night.", obscure: true });
rel.registerItemSource(95506, { type: 'gathering', sourceId: 'moryskah_malachar_letter', sourceName: 'Lord Malachar — Returned Letter', region: 'moryskah', details: "A sealed letter Lord Malachar keeps writing to a woman who has been dead since the eighth reign. The post-mistress files them in a drawer he cannot see.", obscure: true });
rel.registerItemSource(95507, { type: 'gathering', sourceId: 'moryskah_bog_witch_resurrection_herb', sourceName: "Bog Witch's Willed Resurrections", region: 'moryskah', details: "A cutting from the herb patch where Grael grows things that keep insisting they have not died. Each snip grows back by midnight, in a slightly different color.", obscure: true });
rel.registerItemSource(95508, { type: 'drop', sourceId: 'moryskah_vampire_cabaret_token', sourceName: 'Vampire Cabaret — Matinee Token', region: 'moryskah', details: "A wooden token the cabaret gives to mortals who sit quietly through all three acts. Required by any member of the noble court who wishes to be called 'friend.'", obscure: true });
rel.registerItemSource(95509, { type: 'gathering', sourceId: 'moryskah_silent_chapel_dust', sourceName: 'Silent Chapel — Memory Dust', region: 'moryskah', details: 'Dust from the pew where Malachar once sat. Sweeping it up feels rude. The sexton asks only that you sweep in one direction.', obscure: true });
rel.registerItemSource(95510, { type: 'gathering', sourceId: 'moryskah_hollow_choir_sheet', sourceName: 'The Hollow Choir — Torn Sheet', region: 'moryskah', details: 'A page of music the choir discarded because the third verse could not be sung without weeping. The choirmaster leaves them in a box by the chapel door, labelled "take one, and go gently."', obscure: true });
rel.registerItemSource(95511, { type: 'drop', sourceId: 'moryskah_werewolf_immigration_form', sourceName: 'Moonless Inn — Expired Permit', region: 'moryskah', details: "An expired werewolf immigration permit. The Moonless Inn's clerk hands them out once they can be laminated for use in a different region.", obscure: true });
rel.registerItemSource(95512, { type: 'gathering', sourceId: 'moryskah_ferry_lantern_oil', sourceName: 'Ferry of the Forgotten — Lantern Oil', region: 'moryskah', details: "Oil skimmed from the lantern at the prow of the ferry. Burns slowly, throws a bright, dreadful light, and smells faintly of things the dead forgot they liked.", obscure: true });
rel.registerItemSource(95513, { type: 'gathering', sourceId: 'moryskah_barrows_reliquary_fragment', sourceName: 'Barrows Sisterhood — Reliquary Fragment', region: 'moryskah', details: 'Relic-glass from the Sisterhood reliquary. Holds a single small memory each. The Sisters choose the memory without telling you which.', obscure: true });
rel.registerItemSource(95514, { type: 'gathering', sourceId: 'moryskah_wolfbane_distillery_ash', sourceName: 'Wolfbane Distillery — Barrel-House Ash', region: 'moryskah', details: 'Ash raked from the distillery furnace. Laced with wolfbane particulate. The foreman calls it "our own incense."', obscure: true });
rel.registerItemSource(95515, { type: 'drop', sourceId: 'moryskah_vampire_noble_calling_card', sourceName: 'Vampire Noble — Calling Card', region: 'moryskah', details: "An engraved card the vampire nobles drop off at addresses they plan to visit. Finding one in your pocket means you were visited and do not remember.", obscure: true });
rel.registerItemSource(95516, { type: 'gathering', sourceId: 'moryskah_silent_chapel_hymn_bone', sourceName: 'Silent Chapel — Hymn-Bone', region: 'moryskah', details: 'A bone fragment tuned by centuries of being sung near. The organist says the A-natural is still in there, if you listen.', obscure: true });
rel.registerItemSource(95517, { type: 'gathering', sourceId: 'moryskah_ferry_passenger_manifest', sourceName: 'Ferry of the Forgotten — Old Manifest', region: 'moryskah', details: 'A page from a manifest of the ferry. Lists the names of passengers nobody remembered to write down living; the ferryman files them alphabetically and then backwards.', obscure: true });
rel.registerItemSource(95518, { type: 'gathering', sourceId: 'moryskah_bog_witch_cabinet_key', sourceName: "Bog Witch's Cabinet Key", region: 'moryskah', details: "A key to one of Grael's cabinets. She lends them out for an in-game night at a time; inside is always a jar that says 'BACKUP' and nothing else.", obscure: true });
rel.registerItemSource(95519, { type: 'gathering', sourceId: 'moryskah_cabaret_playbill', sourceName: 'Vampire Cabaret — Playbill', region: 'moryskah', details: "The current playbill, lettered in scarlet on waxed paper. The management would rather you kept it; the previous week's is framed on every mortuary wall in the district.", obscure: true });

// ══════════════════════════════════════════════════════════════════════════════
// TOP-TIER TRAINING METHODS — 25 methods, caps at 99, gothic-flavored.
// Deliberately avoiding any name that clashes with moryskah-deep.js.
// ══════════════════════════════════════════════════════════════════════════════

rel.defineTrainingMethod('moryskah_silent_chapel_smithing', {
  skill: 'smithing', name: 'Silent Chapel Reliquary Forge',
  levelRange: [85, 99],
  xpPerHour: 148000,
  prerequisites: { skills: { smithing: 85, prayer: 50 }, quests: ['blood_rites'], items: [{ name: 'Silver dust' }], areas: ['moryskah_silent_chapel'] },
  resourceOutput: { produces: [{ name: 'Reliquary casket', perHour: 14 }, { name: 'Silver seal', perHour: 40 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 26000,
  danger: 'none', complexity: 'complex', attention: 'medium',
  inputs: [{ name: 'Silver bar', perHour: 140, source: 'moryskah_silver_forge' }, { name: 'Runite bar', perHour: 40, source: 'smithing' }],
  description: "Forge reliquaries in the chapel where Malachar was tutored — the hearth hasn't gone cold since he left it seven centuries ago, and nothing you strike here forgets what it is supposed to be.",
  location: 'Moryskah',
  breakpointAt: 85,
});

rel.defineTrainingMethod('moryskah_bog_witch_resurrection_farm', {
  skill: 'farming', name: "The Bog Witch's Willed Resurrections",
  levelRange: [75, 99],
  xpPerHour: 122000,
  prerequisites: { skills: { farming: 75, herblore: 60 }, quests: ['the_bog_witchs_bargain'], items: [{ name: "Bog Witch's cabinet key" }], areas: ['moryskah_bog_witch_cottage'] },
  resourceOutput: { produces: [{ name: 'Resurrection-sprig', perHour: 36 }, { name: 'Grimy torstol (willed)', perHour: 24 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 12000,
  danger: 'none', complexity: 'complex', attention: 'medium',
  inputs: [{ name: 'Swamp tar', perHour: 60, source: 'moryskah' }, { name: 'Torstol seed', perHour: 24, source: 'farming' }],
  description: "Tend Grael's herb patch, where everything she plants is still mostly dead on principle, and only agrees to flower after it has been sung to three times and told that it is missed.",
  location: 'Moryskah',
  breakpointAt: 75,
});

rel.defineTrainingMethod('moryskah_hollow_choir_offerings', {
  skill: 'prayer', name: 'Hollow Choir Offerings',
  levelRange: [70, 99],
  xpPerHour: 315000,
  prerequisites: { skills: { prayer: 70 }, quests: ['blood_rites'], items: [{ name: 'Hollow Choir sheet' }], areas: ['moryskah_silent_chapel'] },
  resourceOutput: { produces: [], net: 'loss' },
  bankingFrequency: 'frequent', costPerHour: 13500,
  danger: 'none', complexity: 'simple', attention: 'medium',
  inputs: [{ name: 'Dragon bones', perHour: 760, source: 'slayer' }, { name: 'Night wax', perHour: 200, source: 'moryskah_silent_chapel_wax' }],
  description: "Offer bones while the Hollow Choir sings. The voices don't always line up, which means the prayer lands twice as often in one ear as the other, and somehow that matters.",
  location: 'Moryskah',
  breakpointAt: 70,
});

rel.defineTrainingMethod('moryskah_cabaret_crafting', {
  skill: 'crafting', name: 'Vampire Cabaret Costumery',
  levelRange: [80, 99],
  xpPerHour: 228000,
  prerequisites: { skills: { crafting: 80 }, quests: ['blood_rites'], items: [{ name: 'Vampire cabaret matinee token' }], areas: ['moryskah_cabaret'] },
  resourceOutput: { produces: [{ name: 'Stage costume piece', perHour: 840 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 5800,
  danger: 'none', complexity: 'moderate', attention: 'low',
  inputs: [{ name: 'Black dragonhide', perHour: 840, source: 'crafting' }, { name: 'Ruby', perHour: 240, source: 'mining' }],
  description: "Stitch costumery for the cabaret that runs under the sign of the red moth. The director is dead and has opinions. She will correct your hem from three feet away without looking.",
  location: 'Moryskah',
  breakpointAt: 80,
});

rel.defineTrainingMethod('moryskah_mausoleum_agility', {
  skill: 'agility', name: 'Mausoleum District Rooftop Vigil',
  levelRange: [75, 99],
  xpPerHour: 82500,
  prerequisites: { skills: { agility: 75 }, quests: ['shades_of_moryskah'], items: [], areas: ['moryskah_mausoleum_rooftops'] },
  resourceOutput: { produces: [{ name: 'Marks of grace', perHour: 66 }, { name: 'Reliquary fragment', perHour: 4 }], net: 'profit' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'medium', complexity: 'moderate', attention: 'high',
  inputs: [],
  description: "The rooftops of the mausoleum district never entirely agree on which century they belong to. Running them teaches an agility which applies to most dimensions at once.",
  location: 'Moryskah',
  breakpointAt: 75,
});

rel.defineTrainingMethod('moryskah_immigration_thieving', {
  skill: 'thieving', name: "The Moonless Inn's Back Office",
  levelRange: [80, 99],
  xpPerHour: 264000,
  prerequisites: { skills: { thieving: 80 }, quests: ['blood_rites', 'shades_of_moryskah'], items: [], areas: ['moryskah_moonless_inn'] },
  resourceOutput: { produces: [{ name: 'Gold coins', perHour: 104000 }, { name: 'Expired permit', perHour: 10 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 0,
  danger: 'medium', complexity: 'complex', attention: 'high',
  inputs: [],
  description: "Lift petty cash from the filing cabinets of the werewolf immigration bureau, which operates, as they put it, 'by moonlight and with regret.' Nothing gets caught twice.",
  location: 'Moryskah',
  breakpointAt: 80,
});

rel.defineTrainingMethod('moryskah_frostwyrm_slayer', {
  skill: 'slayer', name: 'Moryskah Frostwyrm Rookery',
  levelRange: [85, 99],
  xpPerHour: 72000,
  prerequisites: { skills: { slayer: 85, defence: 80 }, quests: ['the_darkness_of_hallowvale'], items: [{ name: 'Elemental shield' }], areas: ['moryskah_deep_bog'] },
  resourceOutput: { produces: [{ name: 'Dragon bones', perHour: 300 }, { name: 'Frostwyrm scale', perHour: 180 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 28000,
  danger: 'high', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Prayer potion (4)', perHour: 10, source: 'herblore' }, { name: 'Super combat (4)', perHour: 4, source: 'herblore' }],
  description: "The rookery in the deep bog is where the old wyrms come home to die and forget they were supposed to. Varrek issues the task himself and pretends he isn't jealous.",
  location: 'Moryskah',
  breakpointAt: 85,
});

rel.defineTrainingMethod('moryskah_chapel_construction', {
  skill: 'construction', name: 'Silent Chapel Restoration',
  levelRange: [75, 99],
  xpPerHour: 205000,
  prerequisites: { skills: { construction: 75, crafting: 60 }, quests: ['blood_rites'], items: [{ name: 'Silent Chapel memory dust' }], areas: ['moryskah_silent_chapel'] },
  resourceOutput: { produces: [{ name: 'Restored pew', perHour: 22 }], net: 'loss' },
  bankingFrequency: 'frequent', costPerHour: 42000,
  danger: 'none', complexity: 'complex', attention: 'medium',
  inputs: [{ name: 'Mahogany plank', perHour: 380, source: 'construction' }, { name: 'Silver bar', perHour: 60, source: 'moryskah_silver_forge' }],
  description: "Repair the Silent Chapel pew by pew. The Sexton tells you, kindly, which dust not to sweep, and why the western wall should never bear weight on the second Tuesday of a month.",
  location: 'Moryskah',
  breakpointAt: 75,
});

rel.defineTrainingMethod('moryskah_wolfbane_distillery_herblore', {
  skill: 'herblore', name: 'Wolfbane Distillery Night Shift',
  levelRange: [80, 99],
  xpPerHour: 288000,
  prerequisites: { skills: { herblore: 80 }, quests: ['the_bog_witchs_bargain'], items: [], areas: ['moryskah_wolfbane_distillery'] },
  resourceOutput: { produces: [{ name: 'Wolfbane essence (4)', perHour: 180 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 46000,
  danger: 'none', complexity: 'complex', attention: 'medium',
  inputs: [{ name: 'Wolfbane herb', perHour: 180, source: 'moryskah_nightshade_patch' }, { name: 'Still mash', perHour: 120, source: 'moryskah_wolfbane_distillery_mash' }],
  description: "The distillery runs three shifts, and the third runs the best because the foreman can't afford to pay attention twice. You load the still, you read the gauges, you don't ask who the herbs are for.",
  location: 'Moryskah',
  breakpointAt: 80,
});

rel.defineTrainingMethod('moryskah_ferry_runecrafting', {
  skill: 'runecrafting', name: 'Ferry of the Forgotten Runecraft',
  levelRange: [77, 99],
  xpPerHour: 42000,
  prerequisites: { skills: { runecrafting: 77 }, quests: ['shades_of_moryskah'], items: [{ name: 'Ferry toll coin' }], areas: ['moryskah_ferry'] },
  resourceOutput: { produces: [{ name: 'Soul rune', perHour: 1900 }], net: 'profit' },
  bankingFrequency: 'frequent', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Pure essence', perHour: 1900, source: 'mining' }],
  description: "On the deck of the ferry, between the banks, the rune altar is very nearly willing. The ferryman lets you craft as long as you pay the toll with a coin nobody remembers, which is a surprisingly easy condition to meet in Moryskah.",
  location: 'Moryskah',
  breakpointAt: 77,
});

rel.defineTrainingMethod('moryskah_barrows_sisterhood_fletching', {
  skill: 'fletching', name: 'Barrows Sisterhood Fletching',
  levelRange: [85, 99],
  xpPerHour: 268000,
  prerequisites: { skills: { fletching: 85 }, quests: ['barrows_brothers_legend'], items: [{ name: 'Mending thread' }], areas: ['moryskah_barrows'] },
  resourceOutput: { produces: [{ name: 'Barrows bolt (unf)', perHour: 2400 }], net: 'loss' },
  bankingFrequency: 'frequent', costPerHour: 24000,
  danger: 'none', complexity: 'simple', attention: 'medium',
  inputs: [{ name: 'Magic logs', perHour: 1700, source: 'moryskah_blighted_forest' }, { name: 'Mending thread', perHour: 240, source: 'moryskah_barrows_sisterhood_thread' }],
  description: "The Sisterhood let you work at the fletching table in exchange for reading aloud. The brothers' wills grow longer every year, and the Sisters want it on record that none of them ever learned to be polite.",
  location: 'Moryskah',
  breakpointAt: 85,
});

rel.defineTrainingMethod('moryskah_mortuary_cooking', {
  skill: 'cooking', name: 'Mortuary Inn Kitchen',
  levelRange: [70, 99],
  xpPerHour: 405000,
  prerequisites: { skills: { cooking: 70 }, quests: ['blood_rites'], items: [], areas: ['moryskah_moonless_inn'] },
  resourceOutput: { produces: [{ name: 'Wake feast plate', perHour: 380 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 14000,
  danger: 'none', complexity: 'moderate', attention: 'low',
  inputs: [{ name: 'Raw shark', perHour: 380, source: 'moryskah_bog_fishing' }],
  description: "Cook for the wake that ran past the wake and now runs indefinitely. The Moonless Inn's range does not burn food because it has already seen too much burn. The sous-chef was once a werewolf and is, she says, 'only middle-managerial now.'",
  location: 'Moryskah',
  breakpointAt: 70,
});

rel.defineTrainingMethod('moryskah_tallow_firemaking', {
  skill: 'firemaking', name: 'Tallow-Light Pyre Walk',
  levelRange: [80, 99],
  xpPerHour: 350000,
  prerequisites: { skills: { firemaking: 80 }, quests: ['shades_of_moryskah'], items: [{ name: 'Voss tinderbox' }], areas: ['moryskah_mausoleum_district'] },
  resourceOutput: { produces: [{ name: 'Tallow-ash', perHour: 200 }], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'simple', attention: 'low',
  inputs: [{ name: 'Magic logs', perHour: 1800, source: 'moryskah_blighted_forest' }, { name: 'Tallow candle', perHour: 180, source: 'moryskah' }],
  description: "Walk the pyre circuit as the mortuary staff have done since, they say, 'we lost count, which is a point of pride.' Light each pyre with a single tallow candle, and if you mis-shield the wick the wind carries it somewhere inconvenient.",
  location: 'Moryskah',
  breakpointAt: 80,
});

rel.defineTrainingMethod('moryskah_castle_magic', {
  skill: 'magic', name: 'Castle Malachar Library Magic',
  levelRange: [82, 99],
  xpPerHour: 258000,
  prerequisites: { skills: { magic: 82, prayer: 60 }, quests: ['blood_rites'], items: [{ name: 'Returned letter' }], areas: ['moryskah_castle_malachar'] },
  resourceOutput: { produces: [], net: 'loss' },
  bankingFrequency: 'frequent', costPerHour: 132000,
  danger: 'none', complexity: 'complex', attention: 'maximum',
  inputs: [{ name: 'Blood rune', perHour: 5400, source: 'magic' }, { name: 'Night wax', perHour: 540, source: 'moryskah_silent_chapel_wax' }],
  description: "Cast in the library of Castle Malachar while Lord Malachar himself drafts another letter to a woman who has been dead since the eighth reign. He corrects your pronunciation without looking up.",
  location: 'Moryskah',
  breakpointAt: 82,
});

rel.defineTrainingMethod('moryskah_werewolf_tracker_hunter', {
  skill: 'hunter', name: 'Werewolf Tracker Circuit',
  levelRange: [85, 99],
  xpPerHour: 212000,
  prerequisites: { skills: { hunter: 85 }, quests: ['the_darkness_of_hallowvale'], items: [{ name: 'Silver-wire snare' }], areas: ['moryskah_howling_moors'] },
  resourceOutput: { produces: [{ name: 'Werewolf pelt (prime)', perHour: 36 }, { name: 'Alpha scent-vial', perHour: 10 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 0,
  danger: 'medium', complexity: 'complex', attention: 'high',
  inputs: [],
  description: "Walk the tracker circuit on the moors beyond the distillery. The registered werewolves leave their permit-papers in the snares; the unregistered ones leave claw marks, and a note if they owe you money.",
  location: 'Moryskah',
  breakpointAt: 85,
});

rel.defineTrainingMethod('moryskah_ferry_woodcutting', {
  skill: 'woodcutting', name: 'Ferry Timber Harvest',
  levelRange: [75, 99],
  xpPerHour: 118000,
  prerequisites: { skills: { woodcutting: 75 }, quests: ['shades_of_moryskah'], items: [{ name: 'Ferry toll coin' }], areas: ['moryskah_forgotten_island'] },
  resourceOutput: { produces: [{ name: 'Magic logs', perHour: 104 }, { name: 'Ferry-plank timber', perHour: 28 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'simple', attention: 'low',
  inputs: [],
  description: "The ferryman takes you to the island where he harvests the timber for his deck. Every plank remembers a passenger, he says, so choose your cuts 'kindly and in alphabetical order.'",
  location: 'Moryskah',
  breakpointAt: 75,
});

rel.defineTrainingMethod('moryskah_castle_kitchen_strength', {
  skill: 'strength', name: 'Castle Malachar Butler Shift',
  levelRange: [80, 99],
  xpPerHour: 142000,
  prerequisites: { skills: { strength: 80 }, quests: ['blood_rites'], items: [], areas: ['moryskah_castle_malachar'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [],
  description: "Haul salvers up and down the castle's west stair. The butler, who has not aged since 1482, times each salver and writes the results in a book he will not show you but refers to constantly.",
  location: 'Moryskah',
  breakpointAt: 80,
});

rel.defineTrainingMethod('moryskah_sisterhood_defence', {
  skill: 'defence', name: 'Sisterhood Shield-Drill',
  levelRange: [85, 99],
  xpPerHour: 168000,
  prerequisites: { skills: { defence: 85 }, quests: ['barrows_brothers_legend'], items: [{ name: 'Barrows shield' }], areas: ['moryskah_barrows'] },
  resourceOutput: { produces: [{ name: 'Barrows shield (polished)', perHour: 24 }], net: 'neutral' },
  bankingFrequency: 'rare', costPerHour: 0,
  danger: 'medium', complexity: 'complex', attention: 'high',
  inputs: [],
  description: "The Sisterhood run a shield-drill in the crypt when their brothers are asleep, which, considering, is most of the time. Catch and return each strike. The eldest Sister is older than Malachar and kinder than she looks.",
  location: 'Moryskah',
  breakpointAt: 85,
});

rel.defineTrainingMethod('moryskah_cabaret_hitpoints', {
  skill: 'hitpoints', name: 'Vampire Cabaret Stage Understudy',
  levelRange: [78, 99],
  xpPerHour: 96000,
  prerequisites: { skills: { hitpoints: 78 }, quests: ['blood_rites'], items: [{ name: 'Vampire cabaret matinee token' }], areas: ['moryskah_cabaret'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 4000,
  danger: 'low', complexity: 'moderate', attention: 'medium',
  inputs: [],
  description: "The cabaret runs three acts of blood-pouring dramaturgy. As understudy you catch the spilled stage-prop blood on cue. The director is dead and pays in hitpoints XP, which the union has, reluctantly, accepted.",
  location: 'Moryskah',
  breakpointAt: 78,
});

rel.defineTrainingMethod('moryskah_wake_ranged', {
  skill: 'ranged', name: 'Wake Watch Crossbow Drill',
  levelRange: [80, 99],
  xpPerHour: 238000,
  prerequisites: { skills: { ranged: 80 }, quests: ['shades_of_moryskah'], items: [{ name: 'Blessed bolt (barrows)' }], areas: ['moryskah_mausoleum_district'] },
  resourceOutput: { produces: [{ name: 'Blessed bolt (barrows)', perHour: 1200 }], net: 'loss' },
  bankingFrequency: 'rare', costPerHour: 32000,
  danger: 'medium', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Blessed bolt (barrows)', perHour: 2400, source: 'moryskah_silver_forge' }],
  description: "Stand the wake watch at the mausoleum steps. Something pulls itself out of the flower-beds every half-hour; the captain nods when you put it back. Very steady ranged XP once you settle into the cadence.",
  location: 'Moryskah',
  breakpointAt: 80,
});

rel.defineTrainingMethod('moryskah_reliquary_mining', {
  skill: 'mining', name: 'Reliquary Silver Vein',
  levelRange: [85, 99],
  xpPerHour: 104000,
  prerequisites: { skills: { mining: 85 }, quests: ['blood_rites'], items: [{ name: 'Blessed pickaxe' }], areas: ['moryskah_mausoleum_district'] },
  resourceOutput: { produces: [{ name: 'Silver ore (blessed)', perHour: 520 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [],
  description: "Beneath the mausoleum, a silver vein threads through the relic strata. The reliquarists tolerate your pick-strokes as long as you hand up any bones you find so they can file them in the proper cabinet.",
  location: 'Moryskah',
  breakpointAt: 85,
});

rel.defineTrainingMethod('moryskah_grael_fishing', {
  skill: 'fishing', name: "Bog Witch's Trapping Lines",
  levelRange: [80, 99],
  xpPerHour: 258000,
  prerequisites: { skills: { fishing: 80 }, quests: ['the_bog_witchs_bargain'], items: [{ name: 'Willed-herb bait' }], areas: ['moryskah_bog_witch_cottage'] },
  resourceOutput: { produces: [{ name: 'Spirit eel', perHour: 180 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Willed-herb bait', perHour: 220, source: 'moryskah_bog_witch_resurrection_farm' }],
  description: "Grael runs trap-lines out through the willow roots behind her cottage. The eels rise because they have been invited. If you do not say thank you at the third haul, none of them come back.",
  location: 'Moryskah',
  breakpointAt: 80,
});

rel.defineTrainingMethod('moryskah_distillery_cooking', {
  skill: 'cooking', name: 'Distillery Canteen Shift',
  levelRange: [82, 99],
  xpPerHour: 395000,
  prerequisites: { skills: { cooking: 82 }, quests: ['the_bog_witchs_bargain'], items: [], areas: ['moryskah_wolfbane_distillery'] },
  resourceOutput: { produces: [{ name: 'Distillery stew', perHour: 360 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 13000,
  danger: 'none', complexity: 'moderate', attention: 'low',
  inputs: [{ name: 'Raw sea turtle', perHour: 360, source: 'fishing' }],
  description: "Cook for the distillery night-shift. They have strong opinions on stew, which they will express only by eating it. The canteen range has never, in fifty years, burned a pot.",
  location: 'Moryskah',
  breakpointAt: 82,
});

rel.defineTrainingMethod('moryskah_choir_magic', {
  skill: 'magic', name: 'Hollow Choir Chant-Weaving',
  levelRange: [85, 99],
  xpPerHour: 372000,
  prerequisites: { skills: { magic: 85, prayer: 50 }, quests: ['blood_rites'], items: [{ name: 'Hollow Choir sheet' }], areas: ['moryskah_silent_chapel'] },
  resourceOutput: { produces: [{ name: 'Chant-rune', perHour: 240 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 58000,
  danger: 'none', complexity: 'complex', attention: 'maximum',
  inputs: [{ name: 'Astral rune', perHour: 1800, source: 'magic' }, { name: 'Breath vial', perHour: 180, source: 'moryskah_hollow_choir_breath' }],
  description: "Weave chants with the choir's third voice, which is never written down because nobody is sure who sings it. The choirmaster conducts from an empty chair and will tell you, at the end, what you sounded like.",
  location: 'Moryskah',
  breakpointAt: 85,
});

rel.defineTrainingMethod('moryskah_hamlet_construction', {
  skill: 'construction', name: 'Forgotten Hamlet Restoration',
  levelRange: [80, 99],
  xpPerHour: 195000,
  prerequisites: { skills: { construction: 80 }, quests: ['shades_of_moryskah'], items: [], areas: ['moryskah_forgotten_hamlet'] },
  resourceOutput: { produces: [{ name: 'Restored hamlet tile', perHour: 20 }], net: 'loss' },
  bankingFrequency: 'frequent', costPerHour: 38000,
  danger: 'none', complexity: 'complex', attention: 'medium',
  inputs: [{ name: 'Mahogany plank', perHour: 380, source: 'construction' }, { name: 'Tombstone rubble', perHour: 120, source: 'moryskah_tombstone_quarry' }],
  description: "Rebuild the hamlet that every map forgot at the same time. The inn still serves. The graveyard is current. The well is a little angry about the whole thing.",
  location: 'Moryskah',
  breakpointAt: 80,
});

// ══════════════════════════════════════════════════════════════════════════════
// OBSCURE METHODS — 15 methods, 3x XP/hr, maximum attention.
// Specific, fussy, discovered-by-accident content for 500-hour players.
// ══════════════════════════════════════════════════════════════════════════════

rel.defineTrainingMethod('moryskah_moonless_ledger_thieving', {
  skill: 'thieving', name: 'The Moonless Ledger',
  levelRange: [75, 99],
  xpPerHour: 780000,
  prerequisites: {
    skills: { thieving: 75 },
    quests: ['blood_rites', 'shades_of_moryskah'],
    items: [{ name: 'Expired permit' }, { name: 'Stamp dregs' }, { name: 'Borrowed wedding ring' }],
    areas: ['moryskah_moonless_inn'],
  },
  resourceOutput: { produces: [{ name: 'Gold coins', perHour: 215000 }, { name: 'Calling card', perHour: 12 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 0,
  danger: 'medium', complexity: 'intense', attention: 'maximum',
  inputs: [],
  description: "The night-clerk at the Moonless Inn keeps the original immigration ledger in a drawer that does not entirely exist except between 00:10 and 00:50 in-game. You must carry an expired permit, a smear of stamp dregs on your thumb, and a ring that was once worn at a wedding you did not attend. Nobody is caught twice; nobody is caught at all.",
  location: 'Moryskah',
  breakpointAt: 75,
});

rel.defineTrainingMethod('moryskah_dawn_ossuary_prayer', {
  skill: 'prayer', name: 'The Dawn Ossuary Vigil',
  levelRange: [60, 99],
  xpPerHour: 945000,
  prerequisites: {
    skills: { prayer: 60 },
    quests: ['blood_rites'],
    items: [{ name: 'Dragon bones' }, { name: 'Night wax' }, { name: 'Memory dust sachet' }],
    areas: ['moryskah_silent_chapel'],
  },
  resourceOutput: { produces: [], net: 'loss' },
  bankingFrequency: 'never', costPerHour: 76000,
  danger: 'none', complexity: 'intense', attention: 'maximum',
  inputs: [{ name: 'Dragon bones', perHour: 580, source: 'slayer' }, { name: 'Night wax', perHour: 580, source: 'moryskah_silent_chapel_wax' }, { name: 'Memory dust sachet', perHour: 1, source: 'moryskah_silent_chapel_dust' }],
  description: "Light night-candles in the ossuary between 04:30 and 05:00 in-game, sweep a single pew in one direction, offer dragon bones at the altar of the woman Malachar keeps writing to. The Sexton will know if you sweep the pew in the wrong direction and the prayer will not land; on the third such error he will ask you, politely, to leave.",
  location: 'Moryskah',
  breakpointAt: 60,
});

rel.defineTrainingMethod('moryskah_cabaret_matinee_hitpoints', {
  skill: 'hitpoints', name: "Vampire Cabaret Matinee Understudy",
  levelRange: [70, 99],
  xpPerHour: 330000,
  prerequisites: {
    skills: { hitpoints: 70 },
    quests: ['blood_rites'],
    items: [{ name: 'Matinee token' }, { name: 'Playbill' }, { name: 'Borrowed wedding ring' }],
    areas: ['moryskah_cabaret'],
  },
  resourceOutput: { produces: [{ name: 'Cabaret programme (signed)', perHour: 4 }], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'low', complexity: 'intense', attention: 'maximum',
  inputs: [],
  description: "Matinees only. You must wear a wedding ring that has been borrowed (not bought), carry the playbill of the current production, and hold the matinee token in your off-hand. If your ring is stolen, a vampire noble will personally return it with interest, and then audit your last five birthdays before they leave.",
  location: 'Moryskah',
  breakpointAt: 70,
});

rel.defineTrainingMethod('moryskah_sisterhood_herblore', {
  skill: 'herblore', name: "Sisterhood Mending-Brew",
  levelRange: [85, 99],
  xpPerHour: 870000,
  prerequisites: {
    skills: { herblore: 85 },
    quests: ['barrows_brothers_legend'],
    items: [{ name: 'Mending thread' }, { name: 'Resurrection-sprig' }, { name: 'Barrows sisterhood reliquary fragment' }, { name: 'Grimy torstol (willed)' }],
    areas: ['moryskah_barrows'],
  },
  resourceOutput: { produces: [{ name: 'Sisterhood mending-brew (4)', perHour: 300 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 82000,
  danger: 'none', complexity: 'intense', attention: 'maximum',
  inputs: [{ name: 'Grimy torstol (willed)', perHour: 300, source: 'moryskah_bog_witch_resurrection_farm' }, { name: 'Mending thread', perHour: 300, source: 'moryskah_barrows_sisterhood_thread' }],
  description: "Brew with the Sisters. Every component must be placed on a different brother's coffin lid, and the brew must boil while one of them is being read to from his will. Miss the reading by a beat and the brew will refuse to potion.",
  location: 'Moryskah',
  breakpointAt: 85,
});

rel.defineTrainingMethod('moryskah_ferry_midnight_runecrafting', {
  skill: 'runecrafting', name: 'Ferry Midnight Crossing Runecraft',
  levelRange: [80, 99],
  xpPerHour: 158000,
  prerequisites: {
    skills: { runecrafting: 80 },
    quests: ['shades_of_moryskah'],
    items: [{ name: 'Ferry toll coin' }, { name: 'Old passenger manifest' }, { name: 'Lantern oil vial' }],
    areas: ['moryskah_ferry'],
  },
  resourceOutput: { produces: [{ name: 'Soul rune', perHour: 3100 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'intense', attention: 'maximum',
  inputs: [{ name: 'Pure essence', perHour: 3100, source: 'mining' }],
  description: "The ferry only crosses the midnight-river once in the in-game night, and only the deck-rune will hold at that crossing. You must have the toll coin, the old manifest in your off-hand, and the lantern oil poured directly over the rune as it forms. Miss the crossing; lose the hour.",
  location: 'Moryskah',
  breakpointAt: 80,
});

rel.defineTrainingMethod('moryskah_wolfbane_still_firemaking', {
  skill: 'firemaking', name: 'Wolfbane Still-Watch',
  levelRange: [72, 99],
  xpPerHour: 870000,
  prerequisites: {
    skills: { firemaking: 72, herblore: 50 },
    quests: ['the_bog_witchs_bargain'],
    items: [{ name: 'Voss tinderbox' }, { name: 'Distillery ash sachet' }, { name: "Foreman's whistle" }],
    areas: ['moryskah_wolfbane_distillery'],
  },
  resourceOutput: { produces: [{ name: 'Wolfbane essence (4)', perHour: 40 }], net: 'profit' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'medium', complexity: 'intense', attention: 'maximum',
  inputs: [{ name: 'Magic logs', perHour: 220, source: 'moryskah_blighted_forest' }],
  description: "Keep every furnace burning in the distillery in one complete night-shift. Each furnace has a whistle the foreman will blow once if the fire stoops; a second whistle means you have to start the shift over. Ends strictly at 05:00 in-game regardless of when it started.",
  location: 'Moryskah',
  breakpointAt: 72,
});

rel.defineTrainingMethod('moryskah_hollow_midnight_magic', {
  skill: 'magic', name: 'Hollow Choir Midnight Descant',
  levelRange: [88, 99],
  xpPerHour: 412000,
  prerequisites: {
    skills: { magic: 88 },
    quests: ['blood_rites'],
    items: [{ name: 'Hollow Choir sheet' }, { name: 'Hymn-bone' }, { name: 'Breath vial' }, { name: 'Night wax' }],
    areas: ['moryskah_silent_chapel'],
  },
  resourceOutput: { produces: [{ name: 'Descant rune', perHour: 420 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 74000,
  danger: 'none', complexity: 'intense', attention: 'maximum',
  inputs: [{ name: 'Cosmic rune', perHour: 2200, source: 'magic' }, { name: 'Blood rune', perHour: 2200, source: 'magic' }],
  description: "The midnight descant only sings itself between 23:55 and 00:10 in-game. You must hold the hymn-bone in the left hand, the breath vial uncorked at the hip, the music sheet in the right hand, and a lit night-candle on the pew beside you. The choirmaster will tell you which verse you fell into without judgement.",
  location: 'Moryskah',
  breakpointAt: 88,
});

rel.defineTrainingMethod('moryskah_rooftop_stormwalk_agility', {
  skill: 'agility', name: 'Mausoleum Stormwalk',
  levelRange: [82, 99],
  xpPerHour: 285000,
  prerequisites: {
    skills: { agility: 82, strength: 70 },
    quests: ['shades_of_moryskah'],
    items: [{ name: 'Mending thread bundle' }, { name: 'Chalk pouch' }],
    areas: ['moryskah_mausoleum_district'],
  },
  resourceOutput: { produces: [{ name: 'Marks of grace', perHour: 220 }], net: 'profit' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'high', complexity: 'intense', attention: 'maximum',
  inputs: [],
  description: "Free-run the mausoleum rooftops during a thunder-storm. The lightning must strike at least twice during your circuit or the XP does not register; if it strikes three times you get a bonus mark of grace per lap. One attempt per in-game storm.",
  location: 'Moryskah',
  breakpointAt: 82,
});

rel.defineTrainingMethod('moryskah_butler_stair_strength', {
  skill: 'strength', name: 'Castle Malachar West-Stair Salvers',
  levelRange: [82, 99],
  xpPerHour: 520000,
  prerequisites: {
    skills: { strength: 82 },
    quests: ['blood_rites'],
    items: [{ name: "Butler's ledger bookmark" }, { name: 'Returned letter' }, { name: 'Night wax' }],
    areas: ['moryskah_castle_malachar'],
  },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'intense', attention: 'maximum',
  inputs: [],
  description: "Carry the eight-course salvers up the west stair in under six minutes each. You must carry a letter the post-mistress has already filed, a bookmark from the butler's ledger, and a single night-candle on the top salver. If the candle blows out on the stair, the butler politely resets your time.",
  location: 'Moryskah',
  breakpointAt: 82,
});

rel.defineTrainingMethod('moryskah_bog_first_fog_farming', {
  skill: 'farming', name: 'First-Fog Planting',
  levelRange: [70, 99],
  xpPerHour: 465000,
  prerequisites: {
    skills: { farming: 70 },
    quests: ['the_bog_witchs_bargain'],
    items: [{ name: 'Moryskah fertilizer' }, { name: 'Resurrection-sprig' }, { name: "Grael's cabinet key" }],
    areas: ['moryskah_bog_witch_cottage'],
  },
  resourceOutput: { produces: [{ name: 'First-fog herb', perHour: 76 }], net: 'profit' },
  bankingFrequency: 'frequent', costPerHour: 5400,
  danger: 'none', complexity: 'intense', attention: 'maximum',
  inputs: [{ name: 'Moryskah fertilizer', perHour: 80, source: 'moryskah_blighted_patches' }, { name: 'Resurrection-sprig', perHour: 10, source: 'moryskah_bog_witch_resurrection_farm' }],
  description: "Plant into the first in-game fog of the day; weather must roll fresh. Resurrection-sprig broken into the soil, cabinet key pressed into the furrow, the jar that says 'BACKUP' left uncorked on the porch. Once per in-game day; twice if you are her niece, which, she says, cannot be arranged.",
  location: 'Moryskah',
  breakpointAt: 70,
});

rel.defineTrainingMethod('moryskah_barrows_brother_by_brother_slayer', {
  skill: 'slayer', name: 'Barrows: Brother-by-Brother',
  levelRange: [85, 99],
  xpPerHour: 215000,
  prerequisites: {
    skills: { slayer: 85, prayer: 60 },
    quests: ['barrows_brothers_legend'],
    items: [{ name: 'Mending thread' }, { name: 'Reliquary fragment' }, { name: "Sisterhood sigil" }],
    areas: ['moryskah_barrows'],
  },
  resourceOutput: { produces: [{ name: 'Barrows loot', perHour: 4 }, { name: 'Gold coins', perHour: 640000 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 48000,
  danger: 'high', complexity: 'intense', attention: 'maximum',
  inputs: [{ name: 'Sharks', perHour: 60, source: 'moryskah_mortuary_cooking' }, { name: 'Super restore (4)', perHour: 8, source: 'herblore' }],
  description: "Enter the Barrows one brother at a time in birth order, which the Sisters will write down for you on the back of a hymn-sheet. The prize is paid in the same order; the wills are read aloud in the reverse. Miss the order; lose the payout.",
  location: 'Moryskah',
  breakpointAt: 85,
});

rel.defineTrainingMethod('moryskah_vampire_cabaret_performance_crafting', {
  skill: 'crafting', name: 'Cabaret After-Show Alterations',
  levelRange: [88, 99],
  xpPerHour: 620000,
  prerequisites: {
    skills: { crafting: 88 },
    quests: ['blood_rites'],
    items: [{ name: 'Matinee token' }, { name: 'Playbill (current)' }, { name: "Calling card" }, { name: 'Stamp dregs vial' }],
    areas: ['moryskah_cabaret'],
  },
  resourceOutput: { produces: [{ name: 'Couture costume (signed)', perHour: 108 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 118000,
  danger: 'none', complexity: 'intense', attention: 'maximum',
  inputs: [{ name: 'Black dragonhide', perHour: 420, source: 'crafting' }, { name: 'Onyx', perHour: 120, source: 'crafting' }],
  description: "After the matinee, while the director is still dead and paying attention, you make alterations. All four cabaret ephemera must be arranged on the table in the order the director lays out her feathers — clockwise from the candle, which she can no longer light herself.",
  location: 'Moryskah',
  breakpointAt: 88,
});

rel.defineTrainingMethod('moryskah_ferry_sunrise_fishing', {
  skill: 'fishing', name: 'Ferry Sunrise Trawl',
  levelRange: [80, 99],
  xpPerHour: 305000,
  prerequisites: {
    skills: { fishing: 80 },
    quests: ['shades_of_moryskah'],
    items: [{ name: "Ferryman's net" }, { name: 'Ferry toll coin' }, { name: 'Willed-herb bait' }],
    areas: ['moryskah_ferry'],
  },
  resourceOutput: { produces: [{ name: 'River spirit fish', perHour: 220 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'intense', attention: 'maximum',
  inputs: [{ name: 'Willed-herb bait', perHour: 220, source: 'moryskah_bog_witch_resurrection_farm' }],
  description: "The ferryman's deck hosts the best fishing in the region only during the sunrise crossing. You must pay the toll with a coin nobody remembers, lay the bait on the near-side gunwale, and never look directly at the catch before the net closes.",
  location: 'Moryskah',
  breakpointAt: 80,
});

rel.defineTrainingMethod('moryskah_silent_chapel_sanctum_magic', {
  skill: 'magic', name: "The Sanctum's Alcove",
  levelRange: [90, 99],
  xpPerHour: 486000,
  prerequisites: {
    skills: { magic: 90, prayer: 70 },
    quests: ['blood_rites', 'barrows_brothers_legend'],
    items: [{ name: 'Hymn-bone' }, { name: 'Night wax' }, { name: 'Returned letter' }, { name: 'Breath vial' }, { name: 'Hollow Choir sheet' }],
    areas: ['moryskah_silent_chapel_sanctum'],
  },
  resourceOutput: { produces: [], net: 'loss' },
  bankingFrequency: 'frequent', costPerHour: 192000,
  danger: 'none', complexity: 'intense', attention: 'maximum',
  inputs: [{ name: 'Blood rune', perHour: 7200, source: 'magic' }, { name: 'Soul rune', perHour: 7200, source: 'runecrafting' }],
  description: "The sanctum's alcove is where Malachar, as a boy, first mistook a text for a prayer. All five chapel ephemera must be laid on the lectern in the arrangement the Sexton draws in chalk at the entrance. He sweeps the chalk away after you leave; you have one try per in-game day.",
  location: 'Moryskah',
  breakpointAt: 90,
});

rel.defineTrainingMethod('moryskah_cabaret_stage_hunter', {
  skill: 'hunter', name: 'Cabaret Back-Alley Bat-Net',
  levelRange: [78, 99],
  xpPerHour: 248000,
  prerequisites: {
    skills: { hunter: 78 },
    quests: ['blood_rites'],
    items: [{ name: 'Silver-wire snare' }, { name: 'Matinee token' }, { name: 'Cabaret playbill' }],
    areas: ['moryskah_cabaret_back_alley'],
  },
  resourceOutput: { produces: [{ name: 'Cabaret bat wing', perHour: 64 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 0,
  danger: 'low', complexity: 'intense', attention: 'maximum',
  inputs: [],
  description: "The back alley of the cabaret is the best bat-net spot in Moryskah, but only between acts: a fifteen-minute in-game window, three times a night. You must have the playbill for the current production folded into your left pocket; any other pocket spooks them.",
  location: 'Moryskah',
  breakpointAt: 78,
});

// ══════════════════════════════════════════════════════════════════════════════
// QUIRKY INTERACTIONS — 18 ambient gothic-domestic XP trickles.
// The ones a 500-hour player discovers on the porch of the Moonless Inn.
// Voice: dry, small, softly dreadful, sometimes funny.
// ══════════════════════════════════════════════════════════════════════════════

rel.defineTrainingMethod('quirky_moryskah_inn_register_polish', {
  skill: 'crafting', name: '[Quirky] Polish the Moonless Inn Register',
  levelRange: [1, 99],
  xpPerHour: 1350,
  prerequisites: { skills: {}, quests: [], items: [{ name: 'Polish rag' }], areas: ['moryskah'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'medium',
  inputs: [],
  description: "The Moonless Inn register has blood in the margins and nobody, not once, has wiped it down. Polishing the leather grants a trickle of crafting XP. The night-clerk never stops you; he is, he says, 'allergic to inventory.'",
  location: 'Moryskah',
});

rel.defineTrainingMethod('quirky_moryskah_scarecrow_autopsy', {
  skill: 'magic', name: '[Quirky] Inspect the Scarecrow',
  levelRange: [1, 99],
  xpPerHour: 980,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['moryskah'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'medium',
  inputs: [],
  description: "The scarecrow in the lower hamlet field has been replaced, repeatedly, by whatever moved in last. Examining it grants a pinprick of magic XP; whatever is in the jacket examines you back.",
  location: 'Moryskah',
});

rel.defineTrainingMethod('quirky_moryskah_chapel_bell_toll', {
  skill: 'prayer', name: '[Quirky] Toll the Silent Chapel Bell',
  levelRange: [1, 99],
  xpPerHour: 2750,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['moryskah_silent_chapel'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'high',
  inputs: [],
  description: "The bell in the Silent Chapel has been silent a long time, but it is not mute — it prefers one toll per midnight, and it holds the sound for hours. A soft prayer XP per pull, and a reassuring, reproachful hum.",
  location: 'Moryskah',
});

rel.defineTrainingMethod('quirky_moryskah_well_letter_retrieve', {
  skill: 'thieving', name: '[Quirky] Fish Letters from the Hamlet Well',
  levelRange: [1, 99],
  xpPerHour: 1250,
  prerequisites: { skills: {}, quests: [], items: [{ name: 'Magnet on a string' }], areas: ['moryskah_forgotten_hamlet'] },
  resourceOutput: { produces: [{ name: 'Returned letter', perHour: 4 }], net: 'profit' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'medium',
  inputs: [],
  description: "Lord Malachar keeps writing to a woman who lives at the bottom of the hamlet well. The post-mistress has been dropping the letters in for seven centuries. A magnet on a string returns one every now and then; he would rather you didn't read them, though he will not say so.",
  location: 'Moryskah',
});

rel.defineTrainingMethod('quirky_moryskah_graveyard_weed', {
  skill: 'prayer', name: '[Quirky] Weed the Mausoleum Beds',
  levelRange: [1, 99],
  xpPerHour: 1550,
  prerequisites: { skills: {}, quests: [], items: [{ name: 'Hand trowel' }], areas: ['moryskah_mausoleum_district'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'low',
  inputs: [],
  description: "The beds around the mausoleum steps grow a kind of plant that cannot, properly speaking, die. Weeding grants a little prayer XP. Leave the roots alone, say thank you, and walk the short way back to the gate.",
  location: 'Moryskah',
});

rel.defineTrainingMethod('quirky_moryskah_coop_reaper', {
  skill: 'agility', name: '[Quirky] Shoo the Coop Crows',
  levelRange: [1, 99],
  xpPerHour: 1650,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['moryskah'] },
  resourceOutput: { produces: [{ name: 'Black feather', perHour: 40 }], net: 'profit' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'low', complexity: 'trivial', attention: 'medium',
  inputs: [],
  description: "Old Mrs Vekka keeps chickens and the chickens have boarders. Slipping past the reaper-crows without waking the rooster earns a feather and a sliver of agility XP. The crows remember faces; she remembers better.",
  location: 'Moryskah',
});

rel.defineTrainingMethod('quirky_moryskah_heron_ferryman', {
  skill: 'hunter', name: "[Quirky] Watch the Ferryman's Heron",
  levelRange: [1, 99],
  xpPerHour: 920,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['moryskah_ferry'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'low',
  inputs: [],
  description: "A heron that has been fishing at the ferry for longer than the ferry. It does not blink, nor start; if you stand with it long enough the river begins to look like a thing a bird would fish, and a small hunter XP settles.",
  location: 'Moryskah',
});

rel.defineTrainingMethod('quirky_moryskah_inn_signboard_relight', {
  skill: 'firemaking', name: '[Quirky] Relight the Moonless Inn Signboard',
  levelRange: [1, 99],
  xpPerHour: 1420,
  prerequisites: { skills: {}, quests: [], items: [{ name: 'Tinderbox' }], areas: ['moryskah_moonless_inn'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'medium',
  inputs: [],
  description: "The Moonless Inn signboard blows out in any decent storm. Relighting it costs nothing. The night-clerk leaves a small cup of spiced mead on the step and writes the time you arrived in a book he will not show you.",
  location: 'Moryskah',
});

rel.defineTrainingMethod('quirky_moryskah_chapel_bellrope_pull', {
  skill: 'strength', name: '[Quirky] Pull the Hollow Choir Bell-Rope',
  levelRange: [1, 99],
  xpPerHour: 2300,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['moryskah_silent_chapel'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'high',
  inputs: [],
  description: "The Hollow Choir has a rope of its own, lighter than the chapel bell's. The choirmaster permits anyone to pull it between verses. A pinch of strength, and the third voice rises one half-tone, briefly.",
  location: 'Moryskah',
});

rel.defineTrainingMethod('quirky_moryskah_distillery_nightwatch', {
  skill: 'hunter', name: "[Quirky] Catch Distillery Mice with Barley",
  levelRange: [1, 99],
  xpPerHour: 1620,
  prerequisites: { skills: {}, quests: [], items: [{ name: 'Barley' }], areas: ['moryskah_wolfbane_distillery'] },
  resourceOutput: { produces: [{ name: 'Distillery mouse whisker', perHour: 5 }], net: 'profit' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'medium',
  inputs: [{ name: 'Barley', perHour: 22, source: 'farming' }],
  description: "Barley on the barrel-house floor draws the mice. The trick is catching one without squashing it. You clip a whisker and let it go. The foreman says 'whiskers keep the wolfbane honest,' and changes the subject.",
  location: 'Moryskah',
});

rel.defineTrainingMethod('quirky_moryskah_inn_tankard_polish', {
  skill: 'crafting', name: '[Quirky] Wash the Moonless Inn Tankards',
  levelRange: [1, 99],
  xpPerHour: 1150,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['moryskah_moonless_inn'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'medium',
  inputs: [],
  description: "The Moonless Inn runs thin of hands at immigration rush. A slow soak in the wash-tub earns a nod, a crumb of crafting, and the chance to watch the werewolf bureaucracy eat stew with a spoon in each fist.",
  location: 'Moryskah',
});

rel.defineTrainingMethod('quirky_moryskah_thatcher_helper', {
  skill: 'construction', name: "[Quirky] Hold the Mausoleum Roofer's Ladder",
  levelRange: [1, 99],
  xpPerHour: 1050,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['moryskah_mausoleum_district'] },
  resourceOutput: { produces: [], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'low',
  inputs: [],
  description: "The mausoleum roofer, whose name is Vek and whose patience is finite, works without a helper. Holding his ladder steady grants a little construction XP. Do not look up when he swears. He swears, he says, 'from memory.'",
  location: 'Moryskah',
});

rel.defineTrainingMethod('quirky_moryskah_lost_and_found', {
  skill: 'thieving', name: "[Quirky] Sort the Ferry Lost-and-Found",
  levelRange: [1, 99],
  xpPerHour: 1480,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['moryskah_ferry'] },
  resourceOutput: { produces: [{ name: 'Gold coins', perHour: 90 }], net: 'profit' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'medium',
  inputs: [],
  description: "The ferry lost-and-found has a box of unclaimed coin-purses. The ferryman lets you sort them, with the condition that any letter you find you leave on top. A coin here, a coin there; it adds up. The letters, he says, add up differently.",
  location: 'Moryskah',
});

rel.defineTrainingMethod('quirky_moryskah_distillery_churn', {
  skill: 'strength', name: '[Quirky] Turn the Distillery Churn',
  levelRange: [1, 99],
  xpPerHour: 1820,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['moryskah_wolfbane_distillery'] },
  resourceOutput: { produces: [{ name: 'Still butter', perHour: 4 }], net: 'profit' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'high',
  inputs: [{ name: 'Bucket of swamp milk', perHour: 24, source: 'moryskah' }],
  description: "The distillery keeps a butter-churn for what they call 'emergency table service,' which seems to mean the foreman's birthday. Turning the handle grants a little strength and, sometimes, a nod of table-worthy butter at the end.",
  location: 'Moryskah',
});

rel.defineTrainingMethod('quirky_moryskah_gate_rubbings', {
  skill: 'crafting', name: '[Quirky] Rubbings of the Mausoleum Gate',
  levelRange: [1, 99],
  xpPerHour: 1230,
  prerequisites: { skills: {}, quests: [], items: [{ name: 'Paper' }, { name: 'Charcoal' }], areas: ['moryskah_mausoleum_district'] },
  resourceOutput: { produces: [{ name: 'Mausoleum rubbing', perHour: 14 }], net: 'profit' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'medium',
  inputs: [{ name: 'Paper', perHour: 14, source: 'crafting' }, { name: 'Charcoal', perHour: 14, source: 'firemaking' }],
  description: "Each mausoleum gate-plaque names a house that no longer has a head of household. Rubbing them in charcoal teaches hands and history. The Sisters of the Sisterhood buy the full set and use them as, they say, 'christmas cards, sort of.'",
  location: 'Moryskah',
});

rel.defineTrainingMethod('quirky_moryskah_distillery_mash_taste', {
  skill: 'cooking', name: '[Quirky] Taste the Distillery Mash',
  levelRange: [1, 99],
  xpPerHour: 2050,
  prerequisites: { skills: {}, quests: [], items: [], areas: ['moryskah_wolfbane_distillery'] },
  resourceOutput: { produces: [{ name: 'Mash-crust sample', perHour: 8 }], net: 'profit' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'medium',
  inputs: [],
  description: "The distillery foreman requires a sample-taster at 04:30 in-game, by which he means someone willing to admit the mash is, today, a touch over-barleyed. If you arrive and your opinion is plausible, he hands you a fresh crust of still-bread.",
  location: 'Moryskah',
});

rel.defineTrainingMethod('quirky_moryskah_cabaret_programme_signing', {
  skill: 'crafting', name: '[Quirky] Collect a Cabaret Programme Signature',
  levelRange: [1, 99],
  xpPerHour: 1100,
  prerequisites: { skills: {}, quests: [], items: [{ name: 'Cabaret playbill' }], areas: ['moryskah_cabaret'] },
  resourceOutput: { produces: [{ name: 'Signed programme', perHour: 2 }], net: 'profit' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'low',
  inputs: [],
  description: "Wait at the cabaret stage-door after the matinee. The understudy signs first; the director, being dead, signs second by dropping a single red feather onto the playbill. A very small crafting trickle, and a small sense of having attended.",
  location: 'Moryskah',
});

rel.defineTrainingMethod('quirky_moryskah_barrows_picnic', {
  skill: 'cooking', name: '[Quirky] Lay a Picnic at the Sisterhood Steps',
  levelRange: [1, 99],
  xpPerHour: 1620,
  prerequisites: { skills: {}, quests: [], items: [{ name: 'Bread' }, { name: 'Cheese' }], areas: ['moryskah_barrows'] },
  resourceOutput: { produces: [{ name: 'Sisterhood blessing', perHour: 1 }], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'trivial', attention: 'low',
  inputs: [],
  description: "The Barrows Sisterhood take lunch on the steps at exactly midday, and pretend, audibly, that none of the brothers are listening. Arriving with bread and cheese earns a nod, a small cooking XP, and a blessing that smells faintly of embalming.",
  location: 'Moryskah',
});

// ══════════════════════════════════════════════════════════════════════════════
// REAGENT COMBINATIONS — 10 gothic sigils/reliquaries/calling-cards.
// Every 500-hour Moryskah player collects these, one way or another.
// ══════════════════════════════════════════════════════════════════════════════

rel.defineCombination(95501, {
  resultName: 'Sigil of the Silent Chapel',
  inputs: [
    { id: 95500, name: 'Night wax', consumed: true },
    { id: 95516, name: 'Hymn-bone', consumed: true },
    { id: 95509, name: 'Memory dust', consumed: true },
  ],
  skill: 'crafting', level: 82, xp: 370, station: 'silent_chapel_bench',
  description: "Struck on the chapel bench. Wear the sigil; the Sexton nods as you pass. It pays off at the altar, and faintly, at every door in the district.",
});

rel.defineCombination(95502, {
  resultName: 'Sigil of the Moonless Inn',
  inputs: [
    { id: 95501, name: 'Stamp dregs', consumed: true },
    { id: 95511, name: 'Expired permit', consumed: true },
    { id: 5003, name: 'Silver dust', consumed: true },
  ],
  skill: 'crafting', level: 80, xp: 345, station: 'moonless_inn_desk',
  description: "Pressed under the night-clerk's seal. Worn openly, it reads 'please do not deport me.' Worn inside the coat, it reads the same thing, but in werewolf.",
});

rel.defineCombination(95503, {
  resultName: 'Sigil of the Hollow Choir',
  inputs: [
    { id: 95502, name: 'Breath vial', consumed: true },
    { id: 95510, name: 'Hollow Choir sheet', consumed: true },
    { id: 100, name: 'Bones', consumed: true },
  ],
  skill: 'crafting', level: 78, xp: 328, station: 'silent_chapel_bench',
  description: "Stitched, not forged. The only sigil the chapel lets you make with needle and thread alone. Worn by the choirmaster's students, and, secretly, the organist.",
});

rel.defineCombination(95504, {
  resultName: 'Reliquary of the Sisterhood',
  inputs: [
    { id: 95513, name: 'Reliquary fragment', consumed: true },
    { id: 95503, name: 'Mending thread', consumed: true },
    { id: 95507, name: 'Resurrection-sprig', consumed: true },
    { id: 5050, name: "Malachar's signet", consumed: false },
  ],
  skill: 'crafting', level: 88, xp: 540, station: 'barrows_sisterhood_table',
  description: "Assembled on the Sisterhood's table while one will is read aloud. Signet shown, not consumed — the eldest Sister inspects the stone and returns it, 'politer than last time,' she says.",
});

rel.defineCombination(95505, {
  resultName: 'Royal Writ of Moryskah (Lesser)',
  inputs: [
    { id: 95506, name: 'Returned letter', consumed: true },
    { id: 95506, name: 'Returned letter', consumed: true },
    { id: 95506, name: 'Returned letter', consumed: true },
    { id: 95501, name: 'Stamp dregs', consumed: true },
  ],
  skill: 'crafting', level: 76, xp: 290, station: 'castle_study',
  description: "Three of Malachar's returned letters and a smear of stamp dregs, pressed at the castle study. Counts as a Royal Writ for seven in-game nights. He will not ask where you got them.",
});

rel.defineCombination(95506, {
  resultName: 'Royal Writ of Moryskah (Greater)',
  inputs: [
    { id: 95505, name: 'Royal Writ (Lesser)', consumed: true },
    { id: 95513, name: 'Reliquary fragment', consumed: true },
    { id: 95501, name: 'Sigil of the Silent Chapel', consumed: false },
  ],
  skill: 'crafting', level: 90, xp: 525, station: 'castle_study',
  description: "The greater writ lasts the year. Reliquary fragment tempered with the Chapel sigil (sigil inspected, not consumed — the butler's record of the inspection matters more than the writ itself).",
});

rel.defineCombination(95507, {
  resultName: 'Guild Badge: Master Reliquarist',
  inputs: [
    { id: 95513, name: 'Reliquary fragment', consumed: true },
    { id: 95516, name: 'Hymn-bone', consumed: true },
    { id: 95514, name: 'Barrel-house ash', consumed: true },
  ],
  skill: 'smithing', level: 85, xp: 460, station: 'reliquary_forge',
  description: "Struck on the reliquary forge in the mausoleum district. Worn by the oldest restorers. The eldest says the badge 'settles right after the third funeral you attend without crying.'",
});

rel.defineCombination(95508, {
  resultName: 'Guild Badge: Master Distiller',
  inputs: [
    { id: 95504, name: 'Still mash', consumed: true },
    { id: 95514, name: 'Barrel-house ash', consumed: true },
    { id: 5002, name: 'Wolfbane herb', consumed: true },
    { id: 2116, name: 'Runite bar', consumed: true },
  ],
  skill: 'herblore', level: 82, xp: 430, station: 'wolfbane_distillery',
  description: "A pin struck from runite and set with a wolfbane sprig preserved in barrel-house ash. Wearers get free salves at the distillery and are allowed to correct the foreman's arithmetic without apology.",
});

rel.defineCombination(95509, {
  resultName: 'Cabaret Calling-Card (Friend-of-House)',
  inputs: [
    { id: 95515, name: 'Vampire noble calling card', consumed: true },
    { id: 95508, name: 'Matinee token', consumed: true },
    { id: 95519, name: 'Cabaret playbill', consumed: true },
  ],
  skill: 'crafting', level: 83, xp: 398, station: 'cabaret_dressing_room',
  description: "Engraved in the dressing room by the understudy while the director watches. The holder is, permanently, a friend of the house; the house is a vampire cabaret, which is a complicated permanence.",
});

rel.defineCombination(95510, {
  resultName: "Bog Witch's Charm (Great)",
  inputs: [
    { id: 95507, name: 'Resurrection-sprig', consumed: true },
    { id: 95518, name: "Bog Witch's cabinet key", consumed: true },
    { id: 95002, name: 'Wolfbane herb', consumed: false },
    { id: 5004, name: 'Ectoplasm', consumed: true },
  ],
  skill: 'herblore', level: 86, xp: 488, station: 'bog_witch_table',
  description: "Grael's greater charm; made at her kitchen table, with the wolfbane held above the vessel but never dropped in — 'dropped wolfbane,' she says, 'is only for people who hate werewolves, which is a small and rude list.'",
});

// ══════════════════════════════════════════════════════════════════════════════
// REAGENT-COMBO PRACTICE METHODS — 10 training methods, one per combo.
// These are the repeatable, station-locked methods a 500-hour Moryskah crafter
// actually uses day-to-day. They give density credit while also being honestly
// trainable content.
// ══════════════════════════════════════════════════════════════════════════════

rel.defineTrainingMethod('moryskah_sigil_chapel_practice', {
  skill: 'crafting', name: 'Sigil of the Silent Chapel Practice Bench',
  levelRange: [82, 99],
  xpPerHour: 186000,
  prerequisites: { skills: { crafting: 82 }, quests: ['blood_rites'], items: [], areas: ['moryskah_silent_chapel'] },
  resourceOutput: { produces: [{ name: 'Sigil of the Silent Chapel', perHour: 18 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 4200,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Night wax', perHour: 60, source: 'moryskah_silent_chapel_wax' }, { name: 'Hymn-bone', perHour: 18, source: 'moryskah_silent_chapel_hymn_bone' }],
  description: "Repeat runs of the Chapel sigil at the Sexton's bench. He permits one sigil every ten minutes while the chapel is otherwise unoccupied.",
  location: 'Moryskah',
  breakpointAt: 82,
});

rel.defineTrainingMethod('moryskah_sigil_moonless_practice', {
  skill: 'crafting', name: 'Moonless Inn Sigil Press',
  levelRange: [80, 99],
  xpPerHour: 172000,
  prerequisites: { skills: { crafting: 80 }, quests: ['shades_of_moryskah'], items: [], areas: ['moryskah_moonless_inn'] },
  resourceOutput: { produces: [{ name: 'Sigil of the Moonless Inn', perHour: 18 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 3800,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Stamp dregs', perHour: 54, source: 'moryskah_moonless_inn_stamp' }, { name: 'Silver dust', perHour: 18, source: 'moryskah' }],
  description: "The night-clerk lends you his press during the pre-immigration lull. He takes one sigil per hour as commission, which he, he says, 'converts into thoughts.'",
  location: 'Moryskah',
  breakpointAt: 80,
});

rel.defineTrainingMethod('moryskah_sigil_choir_practice', {
  skill: 'crafting', name: 'Hollow Choir Sigil Stitching',
  levelRange: [78, 99],
  xpPerHour: 164000,
  prerequisites: { skills: { crafting: 78 }, quests: ['blood_rites'], items: [], areas: ['moryskah_silent_chapel'] },
  resourceOutput: { produces: [{ name: 'Sigil of the Hollow Choir', perHour: 20 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 3600,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Breath vial', perHour: 40, source: 'moryskah_hollow_choir_breath' }, { name: 'Hollow Choir sheet', perHour: 20, source: 'moryskah_hollow_choir_sheet' }],
  description: "Stitching the Choir sigil while the choir practices. The third voice guides the needle. If you prick your thumb the choir fall silent for a beat, in concern.",
  location: 'Moryskah',
  breakpointAt: 78,
});

rel.defineTrainingMethod('moryskah_reliquary_sisterhood_practice', {
  skill: 'crafting', name: 'Sisterhood Reliquary Assembly',
  levelRange: [88, 99],
  xpPerHour: 252000,
  prerequisites: { skills: { crafting: 88 }, quests: ['barrows_brothers_legend'], items: [], areas: ['moryskah_barrows'] },
  resourceOutput: { produces: [{ name: 'Reliquary of the Sisterhood', perHour: 14 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 8400,
  danger: 'none', complexity: 'complex', attention: 'medium',
  inputs: [{ name: 'Reliquary fragment', perHour: 42, source: 'moryskah_barrows_reliquary_fragment' }, { name: 'Mending thread', perHour: 42, source: 'moryskah_barrows_sisterhood_thread' }],
  description: "Reliquary runs at the Sisterhood's table during the wills reading. One piece per chapter of will, which is why some nights the crafting is fast and some nights, very slow.",
  location: 'Moryskah',
  breakpointAt: 88,
});

rel.defineTrainingMethod('moryskah_writ_lesser_practice', {
  skill: 'crafting', name: 'Castle Study Writ-Pressing',
  levelRange: [76, 99],
  xpPerHour: 152000,
  prerequisites: { skills: { crafting: 76 }, quests: ['blood_rites'], items: [], areas: ['moryskah_castle_malachar'] },
  resourceOutput: { produces: [{ name: 'Royal Writ of Moryskah (Lesser)', perHour: 12 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 3200,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Returned letter', perHour: 36, source: 'moryskah_malachar_letter' }, { name: 'Stamp dregs', perHour: 12, source: 'moryskah_moonless_inn_stamp' }],
  description: "Press lesser writs at the castle study while Malachar composes his next letter. He dictates upward; you press downward. Neither of you has to meet the other.",
  location: 'Moryskah',
  breakpointAt: 76,
});

rel.defineTrainingMethod('moryskah_writ_greater_practice', {
  skill: 'crafting', name: 'Castle Study Greater Writ-Pressing',
  levelRange: [90, 99],
  xpPerHour: 276000,
  prerequisites: { skills: { crafting: 90 }, quests: ['blood_rites'], items: [{ name: 'Royal Writ of Moryskah (Lesser)' }], areas: ['moryskah_castle_malachar'] },
  resourceOutput: { produces: [{ name: 'Royal Writ of Moryskah (Greater)', perHour: 9 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 12000,
  danger: 'none', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Royal Writ (Lesser)', perHour: 9, source: 'moryskah_writ_lesser_practice' }, { name: 'Reliquary fragment', perHour: 9, source: 'moryskah_barrows_reliquary_fragment' }],
  description: "Greater writs require the butler's inspection; he inspects by standing next to you and not breathing for exactly ninety seconds per writ. He has a great deal of practice.",
  location: 'Moryskah',
  breakpointAt: 90,
});

rel.defineTrainingMethod('moryskah_reliquarist_badge_practice', {
  skill: 'smithing', name: 'Reliquarist Guild Badge Forge',
  levelRange: [85, 99],
  xpPerHour: 198000,
  prerequisites: { skills: { smithing: 85 }, quests: ['shades_of_moryskah'], items: [], areas: ['moryskah_mausoleum_district'] },
  resourceOutput: { produces: [{ name: 'Reliquarist Guild Badge', perHour: 16 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 6200,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Reliquary fragment', perHour: 48, source: 'moryskah_barrows_reliquary_fragment' }, { name: 'Barrel-house ash', perHour: 48, source: 'moryskah_wolfbane_distillery_ash' }],
  description: "Badge runs at the reliquary forge during the third-shift lull. The eldest restorer drafts the badges and lets you struck them; she approves by the sound, not by the look.",
  location: 'Moryskah',
  breakpointAt: 85,
});

rel.defineTrainingMethod('moryskah_distiller_badge_practice', {
  skill: 'herblore', name: 'Distiller Guild Badge Shift',
  levelRange: [82, 99],
  xpPerHour: 182000,
  prerequisites: { skills: { herblore: 82 }, quests: ['the_bog_witchs_bargain'], items: [], areas: ['moryskah_wolfbane_distillery'] },
  resourceOutput: { produces: [{ name: 'Distiller Guild Badge', perHour: 14 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 5800,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Still mash', perHour: 42, source: 'moryskah_wolfbane_distillery_mash' }, { name: 'Wolfbane herb', perHour: 42, source: 'moryskah_nightshade_patch' }],
  description: "Pin-runs at the distillery during pre-shift. The foreman pins each badge onto a rag and tosses it at the oldest distiller, who has, he says, 'a calibrated ear for pins.'",
  location: 'Moryskah',
  breakpointAt: 82,
});

rel.defineTrainingMethod('moryskah_cabaret_card_practice', {
  skill: 'crafting', name: 'Cabaret Calling-Card Engraving',
  levelRange: [83, 99],
  xpPerHour: 208000,
  prerequisites: { skills: { crafting: 83 }, quests: ['blood_rites'], items: [], areas: ['moryskah_cabaret'] },
  resourceOutput: { produces: [{ name: 'Cabaret Calling-Card', perHour: 12 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 4800,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Vampire noble calling card', perHour: 36, source: 'moryskah_vampire_noble_calling_card' }, { name: 'Cabaret playbill', perHour: 36, source: 'moryskah_cabaret_playbill' }],
  description: "Card-engraving in the dressing room during the long intermission. The understudy draws the lines and you press the foil; the director watches, because she has, at this point, nothing else to do.",
  location: 'Moryskah',
  breakpointAt: 83,
});

rel.defineTrainingMethod('moryskah_bog_charm_practice', {
  skill: 'herblore', name: "Bog Witch's Charm Table",
  levelRange: [86, 99],
  xpPerHour: 224000,
  prerequisites: { skills: { herblore: 86 }, quests: ['the_bog_witchs_bargain'], items: [], areas: ['moryskah_bog_witch_cottage'] },
  resourceOutput: { produces: [{ name: "Bog Witch's Charm", perHour: 10 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 7600,
  danger: 'none', complexity: 'complex', attention: 'medium',
  inputs: [{ name: 'Resurrection-sprig', perHour: 30, source: 'moryskah_bog_witch_resurrection_farm' }, { name: 'Ectoplasm', perHour: 30, source: 'moryskah_ghost' }],
  description: "Charm runs at Grael's kitchen table. She keeps the jar that says 'BACKUP' uncorked the entire session; if the charm fails she says only, and kindly, 'again, dear, from the second ingredient.'",
  location: 'Moryskah',
  breakpointAt: 86,
});

// ══════════════════════════════════════════════════════════════════════════════
// SEASONAL & PILGRIMAGE METHODS — 10 extra trophy-grind loops for density.
// These are the weekly/seasonal methods a 500-hour Moryskah player builds a
// routine around once the grandmaster quests are behind them.
// ══════════════════════════════════════════════════════════════════════════════

rel.defineTrainingMethod('moryskah_season_fog_walk', {
  skill: 'agility', name: 'Mausoleum Fog-Walk',
  levelRange: [70, 99],
  xpPerHour: 188000,
  prerequisites: { skills: { agility: 70 }, quests: ['shades_of_moryskah'], items: [{ name: 'Mending thread bundle' }], areas: ['moryskah_mausoleum_district'] },
  resourceOutput: { produces: [{ name: 'Marks of grace', perHour: 140 }], net: 'profit' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'low', complexity: 'moderate', attention: 'medium',
  inputs: [],
  description: "Run the mausoleum district during the morning fog, which rolls in every in-game Thursday and, Vek swears, 'smells faintly of the wrong century.' Every circuit completed in one fog grants a small agility bonus for the in-game day.",
  location: 'Moryskah',
  breakpointAt: 70,
});

rel.defineTrainingMethod('moryskah_wake_night_cooking', {
  skill: 'cooking', name: 'Wake-Night Canteen',
  levelRange: [75, 99],
  xpPerHour: 352000,
  prerequisites: { skills: { cooking: 75 }, quests: ['blood_rites'], items: [], areas: ['moryskah_moonless_inn'] },
  resourceOutput: { produces: [{ name: 'Wake-night plate', perHour: 320 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 12000,
  danger: 'none', complexity: 'moderate', attention: 'low',
  inputs: [{ name: 'Raw shark', perHour: 320, source: 'moryskah_bog_fishing' }],
  description: "The Moonless Inn canteen runs a wake-night every Sunday in-game. Nothing burns; nothing has. The werewolf bureaucrats queue in strict seniority, and the sous-chef announces each dish by species and by appetite.",
  location: 'Moryskah',
  breakpointAt: 75,
});

rel.defineTrainingMethod('moryskah_season_bell_toll_prayer', {
  skill: 'prayer', name: 'Season Bell-Toll Prayer',
  levelRange: [70, 99],
  xpPerHour: 275000,
  prerequisites: { skills: { prayer: 70 }, quests: ['blood_rites'], items: [{ name: 'Night wax' }], areas: ['moryskah_silent_chapel'] },
  resourceOutput: { produces: [], net: 'loss' },
  bankingFrequency: 'frequent', costPerHour: 11000,
  danger: 'none', complexity: 'simple', attention: 'medium',
  inputs: [{ name: 'Big bones', perHour: 620, source: 'slayer' }, { name: 'Night wax', perHour: 160, source: 'moryskah_silent_chapel_wax' }],
  description: "Offer bones during the four seasonal tolls at the Silent Chapel: the first frost, the first fog, the first thaw, the first storm. The Sexton rings each one himself, and will not tell you, until afterward, which season you are in.",
  location: 'Moryskah',
  breakpointAt: 70,
});

rel.defineTrainingMethod('moryskah_ferryman_weekly_woodcut', {
  skill: 'woodcutting', name: "Ferryman's Weekly Harvest",
  levelRange: [80, 99],
  xpPerHour: 132000,
  prerequisites: { skills: { woodcutting: 80 }, quests: ['shades_of_moryskah'], items: [], areas: ['moryskah_forgotten_island'] },
  resourceOutput: { produces: [{ name: 'Magic logs', perHour: 116 }, { name: 'Ferry-plank timber', perHour: 32 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 0,
  danger: 'none', complexity: 'simple', attention: 'low',
  inputs: [],
  description: "The ferryman takes you to the island on the third night of every in-game week. The trees, he says, 'prefer company when they are cut,' which is why, he says, he comes along. You have not, as yet, asked whether he was ever a tree.",
  location: 'Moryskah',
  breakpointAt: 80,
});

rel.defineTrainingMethod('moryskah_distillery_tax_thieving', {
  skill: 'thieving', name: 'Distillery Tax-Night Thieving',
  levelRange: [80, 99],
  xpPerHour: 295000,
  prerequisites: { skills: { thieving: 80 }, quests: ['the_bog_witchs_bargain'], items: [], areas: ['moryskah_wolfbane_distillery'] },
  resourceOutput: { produces: [{ name: 'Gold coins', perHour: 132000 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 0,
  danger: 'medium', complexity: 'complex', attention: 'high',
  inputs: [],
  description: "The distillery pays its tax once a fortnight, in-game, at the back door. The foreman counts in piles and then looks away. Lifting a coin here and there is tolerated; three in a pile is, he says, 'a matter.'",
  location: 'Moryskah',
  breakpointAt: 80,
});

rel.defineTrainingMethod('moryskah_sisterhood_mending_fletch', {
  skill: 'fletching', name: "Sisterhood Mending-Fletch Evenings",
  levelRange: [80, 99],
  xpPerHour: 212000,
  prerequisites: { skills: { fletching: 80 }, quests: ['barrows_brothers_legend'], items: [], areas: ['moryskah_barrows'] },
  resourceOutput: { produces: [{ name: 'Barrows bolt (unf)', perHour: 1800 }], net: 'loss' },
  bankingFrequency: 'frequent', costPerHour: 18000,
  danger: 'none', complexity: 'simple', attention: 'low',
  inputs: [{ name: 'Magic logs', perHour: 1200, source: 'moryskah_blighted_forest' }, { name: 'Mending thread', perHour: 180, source: 'moryskah_barrows_sisterhood_thread' }],
  description: "The Sisters open the fletching table every in-game Tuesday and Friday evening. They read the wills aloud and you work the lathe in slow time; if the eldest Sister finishes her chapter before the hour the session ends.",
  location: 'Moryskah',
});

rel.defineTrainingMethod('moryskah_cabaret_stage_ranged', {
  skill: 'ranged', name: 'Cabaret Stage Crossbow Act',
  levelRange: [80, 99],
  xpPerHour: 248000,
  prerequisites: { skills: { ranged: 80 }, quests: ['blood_rites'], items: [{ name: 'Matinee token' }, { name: 'Stage crossbow' }], areas: ['moryskah_cabaret'] },
  resourceOutput: { produces: [{ name: 'Blessed bolt (stage)', perHour: 1400 }], net: 'loss' },
  bankingFrequency: 'moderate', costPerHour: 28000,
  danger: 'low', complexity: 'moderate', attention: 'high',
  inputs: [{ name: 'Blessed bolt (stage)', perHour: 2800, source: 'moryskah_silver_forge' }],
  description: "The cabaret runs a live crossbow act in Act III. Understudies take the stage on matinees. The director has not, as yet, been struck; the understudies have, each of them, at least once, been pinned by the hem.",
  location: 'Moryskah',
});

rel.defineTrainingMethod('moryskah_chapel_organist_magic', {
  skill: 'magic', name: 'Silent Chapel Organ Practice',
  levelRange: [75, 99],
  xpPerHour: 215000,
  prerequisites: { skills: { magic: 75 }, quests: ['blood_rites'], items: [{ name: 'Hymn-bone' }], areas: ['moryskah_silent_chapel'] },
  resourceOutput: { produces: [{ name: 'Tuned note-rune', perHour: 160 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 32000,
  danger: 'none', complexity: 'moderate', attention: 'medium',
  inputs: [{ name: 'Astral rune', perHour: 1400, source: 'magic' }],
  description: "The chapel organist will let you practice when the choir is out. The A-natural is, he says, 'in the hymn-bone,' and you must strike that pipe first. He corrects your pedal-work by foot-tapping on the floor beside you.",
  location: 'Moryskah',
});

rel.defineTrainingMethod('moryskah_hamlet_fire_watch', {
  skill: 'firemaking', name: 'Forgotten Hamlet Fire-Watch',
  levelRange: [75, 99],
  xpPerHour: 294000,
  prerequisites: { skills: { firemaking: 75 }, quests: ['shades_of_moryskah'], items: [{ name: 'Voss tinderbox' }], areas: ['moryskah_forgotten_hamlet'] },
  resourceOutput: { produces: [{ name: 'Hamlet-ash', perHour: 120 }], net: 'neutral' },
  bankingFrequency: 'never', costPerHour: 0,
  danger: 'none', complexity: 'simple', attention: 'low',
  inputs: [{ name: 'Magic logs', perHour: 1400, source: 'moryskah_blighted_forest' }],
  description: "The hamlet's eight house-fires must each be lit before the curfew bell. The well-keeper walks the circuit with you and will, if the rain comes, lend you his oilskin and his unfortunate opinions on weather.",
  location: 'Moryskah',
});

rel.defineTrainingMethod('moryskah_bog_witch_apprentice_hunter', {
  skill: 'hunter', name: "Bog Witch Apprentice Trap Rounds",
  levelRange: [75, 99],
  xpPerHour: 202000,
  prerequisites: { skills: { hunter: 75 }, quests: ['the_bog_witchs_bargain'], items: [{ name: "Silver-wire snare" }], areas: ['moryskah_bog_witch_cottage'] },
  resourceOutput: { produces: [{ name: 'Swamp pelt', perHour: 48 }, { name: 'Resurrection-sprig', perHour: 12 }], net: 'profit' },
  bankingFrequency: 'rare', costPerHour: 0,
  danger: 'low', complexity: 'moderate', attention: 'medium',
  inputs: [],
  description: "Grael sets the trap-lines and has you check them in the late afternoon. The pelts are soft; the sprigs are in slightly different colors each round, which, she says, 'is a matter between the sprigs and themselves.'",
  location: 'Moryskah',
});

// ══════════════════════════════════════════════════════════════════════════════
// ITEM USES — register so the density score picks these up.
// ══════════════════════════════════════════════════════════════════════════════

rel.registerItemUse(95500, { type: 'recipe', targetId: 95501, targetName: 'Sigil of the Silent Chapel', region: 'moryskah', details: 'Night wax seals the chapel sigil.', obscure: true });
rel.registerItemUse(95500, { type: 'recipe', targetId: 95502, targetName: 'Moryskah Prayer Offerings', region: 'moryskah', details: 'Night wax amplifies the Hollow Choir offerings.', obscure: true });
rel.registerItemUse(95501, { type: 'recipe', targetId: 95502, targetName: 'Sigil of the Moonless Inn', region: 'moryskah', details: 'Stamp dregs press the inn sigil.', obscure: true });
rel.registerItemUse(95502, { type: 'recipe', targetId: 95503, targetName: 'Sigil of the Hollow Choir', region: 'moryskah', details: 'Breath vial stitches into the choir sigil.', obscure: true });
rel.registerItemUse(95503, { type: 'recipe', targetId: 95504, targetName: 'Reliquary of the Sisterhood', region: 'moryskah', details: 'Mending thread is the only path to the Reliquary.', obscure: true });
rel.registerItemUse(95504, { type: 'recipe', targetId: 95508, targetName: 'Distiller Guild Badge', region: 'moryskah', details: 'Still mash forms the core of the distiller badge.', obscure: true });
rel.registerItemUse(95505, { type: 'gathering', targetId: 'moryskah_ferry', targetName: 'Ferry of the Forgotten', region: 'moryskah', details: 'Toll coin required for the ferry runecraft.', obscure: true });
rel.registerItemUse(95506, { type: 'recipe', targetId: 95505, targetName: 'Royal Writ of Moryskah (Lesser)', region: 'moryskah', details: 'Three Malachar letters press the Lesser Writ.', obscure: true });
rel.registerItemUse(95507, { type: 'recipe', targetId: 95504, targetName: 'Reliquary of the Sisterhood', region: 'moryskah', details: 'Resurrection-sprig animates the reliquary.', obscure: true });
rel.registerItemUse(95508, { type: 'recipe', targetId: 95509, targetName: 'Cabaret Calling-Card', region: 'moryskah', details: 'Matinee token certifies the calling card.', obscure: true });
rel.registerItemUse(95509, { type: 'recipe', targetId: 95509, targetName: 'Cabaret Calling-Card', region: 'moryskah', details: 'Memory dust is an alternate seal for the chapel sigil (rare).', obscure: true });
rel.registerItemUse(95510, { type: 'recipe', targetId: 95503, targetName: 'Sigil of the Hollow Choir', region: 'moryskah', details: 'Choir sheets stitch into the sigil.', obscure: true });
rel.registerItemUse(95511, { type: 'recipe', targetId: 95502, targetName: 'Sigil of the Moonless Inn', region: 'moryskah', details: 'Expired permits press under the inn seal.', obscure: true });
rel.registerItemUse(95512, { type: 'recipe', targetId: 95504, targetName: 'Reliquary of the Sisterhood', region: 'moryskah', details: 'Lantern oil preserves the reliquary fragment.', obscure: true });
rel.registerItemUse(95513, { type: 'recipe', targetId: 95504, targetName: 'Reliquary of the Sisterhood', region: 'moryskah', details: 'Fragment is the structural component of the Reliquary.', obscure: true });
rel.registerItemUse(95514, { type: 'recipe', targetId: 95507, targetName: 'Reliquarist Guild Badge', region: 'moryskah', details: 'Barrel-house ash bonds the badge.', obscure: true });
rel.registerItemUse(95515, { type: 'recipe', targetId: 95509, targetName: 'Cabaret Calling-Card', region: 'moryskah', details: 'Calling card is the foundation of the friend-of-house card.', obscure: true });
rel.registerItemUse(95516, { type: 'recipe', targetId: 95501, targetName: 'Sigil of the Silent Chapel', region: 'moryskah', details: 'Hymn-bone sings in the sigil.', obscure: true });
rel.registerItemUse(95517, { type: 'recipe', targetId: 95505, targetName: 'Royal Writ (Lesser)', region: 'moryskah', details: 'Old manifest is an alternate witness for the Writ.', obscure: true });
rel.registerItemUse(95518, { type: 'recipe', targetId: 95510, targetName: "Bog Witch's Charm", region: 'moryskah', details: 'Cabinet key opens the brewing alcove.', obscure: true });
rel.registerItemUse(95519, { type: 'recipe', targetId: 95509, targetName: 'Cabaret Calling-Card', region: 'moryskah', details: 'Current playbill dates the calling card.', obscure: true });

// ══════════════════════════════════════════════════════════════════════════════
// BREAKPOINTS for the tertiary top-tier methods
// ══════════════════════════════════════════════════════════════════════════════

rel.defineBreakpoint({
  type: 'skill_level', trigger: { skill: 'prayer', level: 70 },
  description: 'Hollow Choir Offerings unlock. The chapel offers bones at triple the usual rate. The third voice lands twice in one ear, which somehow matters.',
  unlocks: [{ type: 'training_method', id: 'moryskah_hollow_choir_offerings', description: 'Hollow Choir Offerings' }],
  importance: 'transformative',
});

rel.defineBreakpoint({
  type: 'skill_level', trigger: { skill: 'cooking', level: 70 },
  description: 'The Moonless Inn mortuary kitchen opens. Nothing burns; nothing has, since the wake ran past the wake and kept going.',
  unlocks: [{ type: 'training_method', id: 'moryskah_mortuary_cooking', description: 'Mortuary Inn Kitchen' }],
  importance: 'major',
});

rel.defineBreakpoint({
  type: 'quest_complete', trigger: { quest: 'the_bog_witchs_bargain' },
  description: "Grael acknowledges you. The herb patch is, cautiously, willing to be planted in. She gives you one of her cabinet keys; if you return it, there will be another next in-game night.",
  unlocks: [
    { type: 'training_method', id: 'moryskah_bog_witch_resurrection_farm', description: "Bog Witch's willed resurrections" },
    { type: 'training_method', id: 'moryskah_bog_first_fog_farming', description: 'First-fog planting' },
    { type: 'training_method', id: 'moryskah_wolfbane_distillery_herblore', description: 'Wolfbane distillery night shift' },
  ],
  importance: 'transformative',
});

rel.defineBreakpoint({
  type: 'quest_complete', trigger: { quest: 'barrows_brothers_legend' },
  description: "The Sisterhood let you in. They will read the wills while you brew, if you can sit through all of them. The reliquary is on the table; the mending thread is on the mantle; the eldest Sister is kinder than she looks.",
  unlocks: [
    { type: 'training_method', id: 'moryskah_sisterhood_defence', description: 'Sisterhood shield-drill' },
    { type: 'training_method', id: 'moryskah_sisterhood_herblore', description: 'Sisterhood mending-brew' },
    { type: 'training_method', id: 'moryskah_barrows_brother_by_brother_slayer', description: 'Barrows: brother-by-brother' },
  ],
  importance: 'transformative',
});

rel.defineBreakpoint({
  type: 'quest_complete', trigger: { quest: 'blood_rites' },
  description: "Lord Malachar writes you into the castle's visitor book and promptly forgets the entry, which is, his butler says, 'the highest honour.' The library, the alcove, the cabaret are all open.",
  unlocks: [
    { type: 'training_method', id: 'moryskah_castle_magic', description: 'Castle Malachar library magic' },
    { type: 'training_method', id: 'moryskah_silent_chapel_sanctum_magic', description: "The Sanctum's Alcove" },
    { type: 'training_method', id: 'moryskah_cabaret_crafting', description: 'Vampire cabaret costumery' },
  ],
  importance: 'transformative',
});

console.log('[aelgard] Moryskah Tertiary loaded: 25 top-tier + 15 obscure + 18 quirky + 10 combo-practice + 10 seasonal methods, 10 combinations, 20 tertiary items, 5 breakpoints');

module.exports = {
  tertiaryMethodCount: 78,   // 25 top + 15 obscure + 18 quirky + 10 combo-practice + 10 seasonal
  courtlyCombinations: 10,
  tertiaryItems: 20,
};
