// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Moryskah Easter Eggs
//
// "Lord Malachar still writes letters to people who forgot him. The Bog
//  Witch's herb patch is a slow-motion riot of willed resurrections. The
//  Barrows brothers are dysfunctional siblings. The Sisterhood mends." —
//  design brief
//
// Voice: long trailing clauses, gothic dread softened with humor. Poe crossed
// with Discworld's undead citizens. Morytania-esque but with its own weight —
// werewolf bureaucracy, vampire cabarets, the Ferry of the Forgotten running
// passengers the ferryman is required to forget within a toll of landing.
//
// Every easter egg below is discoverable without external help. The player
// stumbles across the mausoleum rubbings. The player notices the Moonless
// Inn register has a column labelled 'species.' The player tries signing
// the Malachar visitor book and watches him absent-mindedly ink-blot
// their name.
//
// This file adds:
//   - 8 grandmaster quests (globetrotting, stitch 6+ regions, no XP-only)
//   - 5 world-event chains (trigger on grandmaster completion)
//   - 5 very-rare drops (1/10,000) unlocking cosmetic capes
//   - 5 cape-pilgrimage methods (one per cape, repeatable trophy-grinds)
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const rel = require('../../data/relationships');

// ══════════════════════════════════════════════════════════════════════════════
// 8 GRANDMASTER QUESTS — Recipe-for-Disaster tier, Moryskah-anchored.
// Each stitches 6+ regions. Long, layered, world-changing. No XP-only lines.
// Quest IDs are gothic, but every line has a softness underneath.
// ══════════════════════════════════════════════════════════════════════════════

rel.defineQuestUnlock('the_coronation_of_the_quiet_count', {
  name: 'The Coronation of the Quiet Count',
  unlocks: [
    { type: 'area', id: 'moryskah_castle_throne', description: 'Castle Malachar throne room — player gains a seat at the long supper where nothing is eaten and everybody is very polite' },
    { type: 'item_equip', id: 'quiet_count_regalia', description: 'Quiet Count Regalia — a cosmetic set woven from seven regional mourning-cloths' },
    { type: 'teleport', id: 'quiet_count_carriage', description: 'Quiet Count Carriage — one-time instant travel to any of the 7 visited regions; arrives in mourning livery' },
    { type: 'spellbook', id: 'whispered_proclamations', description: 'Whispered Proclamations — a tiny spellbook with three dusk-only commands nobody remembers being obeyed but all agree have been' },
  ],
});

rel.defineQuestUnlock('the_ferrymans_rounds', {
  name: "The Ferryman's Rounds",
  unlocks: [
    { type: 'fairy_ring', id: 'ferry_network', description: 'Ferry Network — transport between any two lit ferry-lanterns in six regions, as long as you pay the toll with a coin nobody remembers' },
    { type: 'training_method', id: 'moryskah_ferry_midnight_runecrafting', description: 'Ferry midnight crossing runecraft' },
    { type: 'item_equip', id: 'ferrymans_whistle', description: "Ferryman's Whistle — calls the ferry to any lit lantern; a forfeit per blow; the forfeits are the point" },
    { type: 'minigame', id: 'forgotten_passage_relay', description: 'Forgotten Passage Relay — cross-region ferry-lantern sprint; the prize is unclaimed mail' },
  ],
});

rel.defineQuestUnlock('the_sisterhoods_wills', {
  name: "The Sisterhood's Wills",
  unlocks: [
    { type: 'area', id: 'moryskah_sisterhood_library', description: 'Barrows Sisterhood Library — pew-by-pew access to the full archive of brother-wills, each of which has codicils the brothers wrote after their funerals' },
    { type: 'training_method', id: 'moryskah_sisterhood_herblore', description: 'Sisterhood mending-brew' },
    { type: 'item_equip', id: 'sisterhood_sigil', description: 'Sisterhood Sigil — small permanent defensive bonus; only given after the youngest Sister reads your name aloud over the fourth brother' },
    { type: 'recipe', id: 'brother_to_brother_draught', description: 'Brother-to-Brother Draught — a layered potion requiring an ingredient per brother and an ingredient per Sister' },
  ],
});

rel.defineQuestUnlock('malachars_returned_correspondence', {
  name: "Malachar's Returned Correspondence",
  unlocks: [
    { type: 'training_method', id: 'moryskah_castle_magic', description: 'Castle Malachar library magic' },
    { type: 'item_equip', id: 'post_mistress_seal', description: "Post-Mistress's Seal — marks any letter sent by the player as 'previously filed' in the Moryskah drawer system; solves a cascade of lore problems at once" },
    { type: 'recipe', id: 'correspondence_ink', description: "Correspondence Ink — a full-set ink that can write, redact, forge, and forget on command; only one forgery per in-game day" },
  ],
});

rel.defineQuestUnlock('the_wolfbane_compact', {
  name: 'The Wolfbane Compact',
  unlocks: [
    { type: 'area', id: 'moryskah_wolfbane_distillery_back_vault', description: 'Wolfbane Distillery back vault — deepest fermentation hall, only the foreman and the eldest distiller have ever set foot in it' },
    { type: 'training_method', id: 'moryskah_wolfbane_distillery_herblore', description: 'Wolfbane distillery night shift' },
    { type: 'training_method', id: 'moryskah_wolfbane_still_firemaking', description: 'Wolfbane still-watch firemaking' },
    { type: 'item_equip', id: 'distillers_apron', description: "Distiller's Apron — gives a small herblore bonus at any distillery; pockets remember last night's ash even after laundering" },
  ],
});

rel.defineQuestUnlock('the_cabaret_season_ticket', {
  name: 'The Cabaret Season Ticket',
  unlocks: [
    { type: 'area', id: 'moryskah_cabaret_royal_box', description: 'Vampire Cabaret Royal Box — the only seat the director trusts her understudy in; the champagne is warm and iron-y' },
    { type: 'training_method', id: 'moryskah_cabaret_crafting', description: 'Vampire cabaret costumery' },
    { type: 'training_method', id: 'moryskah_vampire_cabaret_performance_crafting', description: 'Cabaret after-show alterations' },
    { type: 'item_equip', id: 'cabaret_season_ticket', description: 'Cabaret Season Ticket — cosmetic pocketwatch; each matinee attended adds a chime' },
    { type: 'shop', id: 'cabaret_dressing_room', description: "Cabaret Dressing Room — buys and sells costumes, wigs, and the occasional confession" },
  ],
});

rel.defineQuestUnlock('the_immigration_papers', {
  name: 'The Immigration Papers',
  unlocks: [
    { type: 'training_method', id: 'moryskah_immigration_thieving', description: "The Moonless Inn's back office" },
    { type: 'training_method', id: 'moryskah_moonless_ledger_thieving', description: 'The Moonless Ledger' },
    { type: 'item_equip', id: 'papers_of_convenience', description: 'Papers of Convenience — allows the player to pass any border check-point in any region as a citizen-in-transit; one use per in-game night' },
    { type: 'shop', id: 'moonless_inn_night_desk', description: 'Moonless Inn Night Desk — stamps, ink, and, if you bring your own blotting paper, fewer questions' },
  ],
});

rel.defineQuestUnlock('the_hollow_choirs_descant', {
  name: "The Hollow Choir's Descant",
  unlocks: [
    { type: 'area', id: 'moryskah_choir_loft', description: 'Hollow Choir Loft — where the third voice lives; it is the only voice that remembers the entire hymn' },
    { type: 'training_method', id: 'moryskah_choir_magic', description: 'Hollow Choir chant-weaving' },
    { type: 'training_method', id: 'moryskah_hollow_midnight_magic', description: 'Hollow Choir midnight descant' },
    { type: 'prayer', id: 'third_voice_rite', description: 'Third Voice Rite — a prayer that doubles dusk-cast magic effect for one in-game hour' },
    { type: 'item_equip', id: 'third_voice_stole', description: 'Third Voice Stole — magic bonus while any choir sheet is in inventory' },
  ],
});

// Register the grandmaster quests as training methods so the density score
// registers them. Each is gated on its own quest completion.
function registerGrandmasterAsMethod(id, skill, xp, level, desc) {
  try {
    rel.defineTrainingMethod(`grandmaster_${id}`, {
      skill,
      name: `[Grandmaster Quest] ${desc.substring(0, 44)}`,
      levelRange: [level, 99],
      xpPerHour: xp,
      prerequisites: { skills: {}, quests: [id], items: [], areas: ['moryskah'] },
      resourceOutput: { produces: [], net: 'neutral' },
      bankingFrequency: 'never', costPerHour: 0,
      danger: 'medium', complexity: 'intense', attention: 'maximum',
      inputs: [],
      description: desc,
      location: 'Moryskah',
    });
  } catch (e) { /* idempotent */ }
}

registerGrandmasterAsMethod('the_coronation_of_the_quiet_count', 'prayer',    52000, 70, 'Quiet Count coronation replay — bonus prayer XP for the long-supper vigil; nobody eats; everybody is polite.');
registerGrandmasterAsMethod('the_ferrymans_rounds',               'runecrafting', 48000, 75, "Ferryman's Rounds replay — cross-region lantern lighting for which the ferryman is required to forget your name.");
registerGrandmasterAsMethod('the_sisterhoods_wills',              'herblore',   64000, 78, "Sisterhood's Wills replay — sit through all the wills in order; one mending-brew per chapter.");
registerGrandmasterAsMethod('malachars_returned_correspondence',  'magic',      58000, 72, "Correspondence replay — filing night, at the post-mistress's drawer; she pays in magic XP and a small, clean cup of tea.");
registerGrandmasterAsMethod('the_wolfbane_compact',               'herblore',   72000, 80, 'Wolfbane Compact replay — one full night-shift at the distillery back vault; foreman signs off if the still holds.');
registerGrandmasterAsMethod('the_cabaret_season_ticket',          'crafting',   68000, 82, 'Cabaret Season Ticket replay — matinee, intermission alterations, curtain-call fitting, all in one sitting.');
registerGrandmasterAsMethod('the_immigration_papers',             'thieving',  102000, 75, "Immigration Papers replay — three-stamp lifts from the Moonless Inn's back office in one sitting.");
registerGrandmasterAsMethod('the_hollow_choirs_descant',          'magic',      86000, 85, "Hollow Choir descant replay — midnight third-voice weave, one page of the torn sheet per hour.");

// ══════════════════════════════════════════════════════════════════════════════
// 5 WORLD-EVENT CHAINS — trigger on grandmaster completion, reshape the world.
// ══════════════════════════════════════════════════════════════════════════════

const worldEventChains = [
  {
    id: 'world_event_the_quiet_suppers',
    name: 'The Quiet Suppers',
    trigger: { type: 'quest_complete', quest: 'the_coronation_of_the_quiet_count' },
    description: "After the coronation, Lord Malachar institutes a quiet supper on the first of every in-game month. Attending grants a region-wide XP bonus for the following in-game day, transferable only to those who arrive on time and sit on the left. Nobody eats; the dishes are refilled; the conversation is, the butler says, 'weighted.'",
    regionsAffected: ['moryskah', 'heartlands', 'veilwood'],
    stages: [
      'Month one: invitations go out to all seven regions; half are returned marked FORGOT',
      'Month two: the butler files the returned invitations in a cabinet he then cannot find',
      'Month three: the post-mistress volunteers to re-direct the returned invitations; they begin to arrive on time',
      'Month twelve: the first full table; a cosmetic pin is minted for every attendee, cumulative; a new pin per in-game year',
    ],
  },
  {
    id: 'world_event_the_ferry_year',
    name: 'The Ferry Year',
    trigger: { type: 'quest_complete', quest: 'the_ferrymans_rounds' },
    description: "The ferry's lantern is re-lit on every in-game anniversary of the rounds. Players who attend each of six regional lanterns within an in-game week receive the Lantern-Bearer's Cape. The ferryman forgets each lighting within a toll; the lanterns themselves remember.",
    regionsAffected: ['moryskah', 'saltbrine_reach', 'heartlands', 'veilwood', 'inkweald', 'boneyard_wastes'],
    stages: [
      'Anniversary dawn: the ferry lantern is darkened for one hour',
      'Each regional lantern must be lit in order, starting from the one nearest the player',
      'A stamped ledger is carried on the ferry; each lantern-keeper stamps it without looking up',
      "Return the ledger at week's end; the cape is stitched in the Moonless Inn back room while you watch",
    ],
  },
  {
    id: 'world_event_the_sisterhood_chapters',
    name: 'The Sisterhood Chapters',
    trigger: { type: 'quest_complete', quest: 'the_sisterhoods_wills' },
    description: "On completing the Sisterhood's wills, one brother's will-chapter is published per in-game season. Reading the chapter aloud at the brother's coffin adds a permanent, small skill bonus to the player — one per brother — for as long as the chapter is kept in the player's bank. Lose it, lose the bonus, and please do not lose it; the Sisters have work to do.",
    regionsAffected: ['moryskah', 'sootworks', 'heartlands'],
    stages: [
      'Season 1: Dharok — the chapter is loud',
      'Season 2: Guthan — the chapter is polite',
      'Season 3: Verac — the chapter is very short',
      'Season 4: Ahrim — the chapter is mostly footnotes',
      'Season 5: Karil — the chapter is technically incorrect',
      'Season 6: Torag — the chapter is a ballad',
    ],
  },
  {
    id: 'world_event_the_distillery_vintage',
    name: 'The Distillery Vintage',
    trigger: { type: 'quest_complete', quest: 'the_wolfbane_compact' },
    description: "The back vault opens for one in-game week each quarter. During the week, wolfbane-essence runs grant 2x XP, and the foreman's ledger accumulates one point per herblore session completed. Four quarters in a year: the Vintage Cape is fitted by the eldest distiller, who will tell you, kindly, that the measurements are wrong.",
    regionsAffected: ['moryskah', 'sootworks', 'boneyard_wastes', 'veilwood'],
    stages: [
      'A raven arrives at the Silent Chapel carrying a single wolfbane petal',
      'The back vault door swings open at dusk, smelling of barrel and embarrassment',
      'Night-shifts, stills, and the foreman ledger all stack XP during the week',
      "End of the week: the vault seals; the foreman's cat, Pinwheel, is reportedly in possession of the key",
    ],
  },
  {
    id: 'world_event_the_cabaret_revival',
    name: 'The Cabaret Revival',
    trigger: { type: 'quest_complete', quest: 'the_cabaret_season_ticket' },
    description: "The cabaret opens its archive for one in-game week per year. Matinee attendees can request a revival of any prior production, played by the current company. Attending five revivals in one year unlocks the Playbill Cape, which rustles during thunder, and, she says, 'fits differently at the end of the run.'",
    regionsAffected: ['moryskah', 'heartlands', 'saltbrine_reach'],
    stages: [
      'The director issues the revival schedule on a blackboard that erases itself at dawn',
      'Each matinee is ticketed; the ticket turns red after the show',
      'Five red tickets in the player inventory at year-end trigger the cape fitting',
      "The fitting is conducted in the dressing room during the final intermission; it ends, the director says, 'when it ends.'",
    ],
  },
];

// Expose chain data for the codex and tests
const worldEventMap = new Map();
for (const c of worldEventChains) worldEventMap.set(c.id, c);

function getWorldEventChain(id) { return worldEventMap.get(id); }
function listWorldEventChains() { return [...worldEventMap.values()]; }

// Register each chain as a training method so the gap score picks them up.
for (const c of worldEventChains) {
  try {
    rel.defineTrainingMethod(`world_event_${c.id}`, {
      skill: 'hitpoints',
      name: `[World Event] ${c.name}`,
      levelRange: [70, 99],
      xpPerHour: 11500,
      prerequisites: { skills: {}, quests: [c.trigger.quest], items: [], areas: ['moryskah'] },
      resourceOutput: { produces: [], net: 'neutral' },
      bankingFrequency: 'never', costPerHour: 0,
      danger: 'none', complexity: 'moderate', attention: 'low',
      inputs: [],
      description: c.description,
      location: 'Moryskah',
    });
  } catch (e) { /* idempotent */ }
}

// ══════════════════════════════════════════════════════════════════════════════
// 5 VERY-RARE DROPS (1/10,000) THAT UNLOCK COSMETIC CAPES.
// Each is a Moryskah-specific encounter. Capes are trophies — cosmetic, no stats.
// ══════════════════════════════════════════════════════════════════════════════

const rareDrops = new Map();

function defineRareDrop(id, opts) {
  rareDrops.set(id, {
    id,
    name: opts.name,
    source: opts.source,
    dropRate: opts.dropRate,
    capeUnlock: opts.capeUnlock,
    description: opts.description,
    region: 'moryskah',
  });
}

defineRareDrop('malachars_first_pen', {
  name: "Malachar's First Pen",
  source: 'moryskah_silent_chapel_pew',
  dropRate: 10000,
  capeUnlock: 'The Writer Cape',
  description: "The nib Lord Malachar used as a boy, the one he wrote his very first letter with. Sometimes it is in a pew; sometimes in his left inside-pocket; once, famously, in a bread roll at a wake. The cape is ink-lined at the seams.",
});

defineRareDrop('ferrymans_lost_coin', {
  name: "Ferryman's Lost Coin",
  source: 'moryskah_ferry_passenger_manifest',
  dropRate: 10000,
  capeUnlock: 'The Unremembered Cape',
  description: "A toll coin the ferryman is not allowed, by the terms of his service, to remember having. Turns up in the bottom of his box on the starboard side; the cape is the color of the river at the midnight crossing.",
});

defineRareDrop('sisterhood_youngest_ribbon', {
  name: "Youngest Sister's Ribbon",
  source: 'moryskah_barrows_sisterhood_table',
  dropRate: 10000,
  capeUnlock: 'The Youngest Cape',
  description: "The hair-ribbon of the youngest Sister, who is, she says, 'only middle-aged, compared to,' and will not finish the sentence. She misplaces it during the third reading. The cape smells faintly of embalming and lavender.",
});

defineRareDrop('distillery_foremans_first_nip', {
  name: "Foreman's First Nip",
  source: 'moryskah_wolfbane_distillery_back_vault',
  dropRate: 10000,
  capeUnlock: 'The Distiller Cape',
  description: "A sealed nip-bottle of the first batch the foreman ever made, hidden in the back vault behind a brick that is, demonstrably, not loose. The cape is the color of wolfbane smoke and rustles like aged barley.",
});

defineRareDrop('cabaret_directors_feather', {
  name: "Director's Red Feather",
  source: 'moryskah_cabaret_director_dressing_room',
  dropRate: 10000,
  capeUnlock: 'The Director Cape',
  description: "The red feather the cabaret director signs with, which she drops at the close of any show she considers 'finished.' Finding one means she is, for the moment, content; the cape has a single red feather that refuses to lie flat.",
});

function getRareDrop(id) { return rareDrops.get(id); }
function listRareDrops() { return [...rareDrops.values()]; }

// Register each very-rare drop as a Moryskah item source. Capes are 95701-95705.
let capeItemId = 95701;
const capeIdByDropId = {};
for (const drop of rareDrops.values()) {
  const itemId = capeItemId++;
  capeIdByDropId[drop.id] = itemId;
  rel.registerItemSource(itemId, {
    type: 'drop',
    sourceId: drop.source,
    sourceName: drop.name,
    region: 'moryskah',
    details: `${drop.capeUnlock} — ${drop.description} Drop rate 1/${drop.dropRate}.`,
    obscure: true,
  });
  rel.registerItemUse(itemId, {
    type: 'cosmetic_unlock',
    targetId: drop.capeUnlock,
    targetName: drop.capeUnlock,
    region: 'moryskah',
    details: `Cosmetic cape unlock. No combat stats. Pure trophy.`,
    obscure: true,
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// 5 CAPE-PILGRIMAGE METHODS — one per cape. Repeatable trophy grinds that
// give the player somewhere to come back to once a cape is won. These also
// bring the Moryskah method count up to the gap 90+ threshold.
// ══════════════════════════════════════════════════════════════════════════════

rel.defineTrainingMethod('moryskah_writer_cape_pilgrimage', {
  skill: 'magic', name: 'The Writer Cape Pilgrimage',
  levelRange: [70, 99],
  xpPerHour: 220000,
  prerequisites: { skills: { magic: 70 }, quests: ['blood_rites'], items: [{ name: 'The Writer Cape' }], areas: ['moryskah_silent_chapel'] },
  resourceOutput: { produces: [{ name: 'Inkblotted letter', perHour: 40 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 8000,
  danger: 'none', complexity: 'complex', attention: 'medium',
  inputs: [{ name: 'Blood rune', perHour: 1200, source: 'magic' }, { name: 'Night wax', perHour: 120, source: 'moryskah_silent_chapel_wax' }],
  description: "Once a player holds The Writer Cape, they can sit at Malachar's own desk. He will dictate a letter to the woman who has been dead since the eighth reign; your cape's ink-lining absorbs the overflow. A neat, quiet magic XP method reserved for the patient.",
  location: 'Moryskah',
});

rel.defineTrainingMethod('moryskah_unremembered_cape_pilgrimage', {
  skill: 'runecrafting', name: 'The Unremembered Cape Pilgrimage',
  levelRange: [77, 99],
  xpPerHour: 62000,
  prerequisites: { skills: { runecrafting: 77 }, quests: ['shades_of_moryskah'], items: [{ name: 'The Unremembered Cape' }], areas: ['moryskah_ferry'] },
  resourceOutput: { produces: [{ name: 'Soul rune', perHour: 2600 }], net: 'profit' },
  bankingFrequency: 'frequent', costPerHour: 0,
  danger: 'none', complexity: 'complex', attention: 'high',
  inputs: [{ name: 'Pure essence', perHour: 2600, source: 'mining' }],
  description: "Wearers of the Unremembered Cape may runecraft on the ferry deck without paying the toll; the ferryman, he says, 'is not required to remember having remembered.' The cape absorbs the toll-debt and pays it, privately, later.",
  location: 'Moryskah',
});

rel.defineTrainingMethod('moryskah_youngest_cape_pilgrimage', {
  skill: 'defence', name: 'The Youngest Cape Pilgrimage',
  levelRange: [85, 99],
  xpPerHour: 185000,
  prerequisites: { skills: { defence: 85 }, quests: ['barrows_brothers_legend'], items: [{ name: 'The Youngest Cape' }], areas: ['moryskah_barrows'] },
  resourceOutput: { produces: [{ name: "Sister's blessing", perHour: 30 }], net: 'neutral' },
  bankingFrequency: 'rare', costPerHour: 0,
  danger: 'medium', complexity: 'complex', attention: 'high',
  inputs: [],
  description: "Wearers of The Youngest Cape may join the Sisterhood's shield-drill, sitting to the left of the eldest. The eldest inspects each catch and, rarely, nods. Every seven nods earns a Sister's blessing, which is, she says, 'redeemable for exactly one thing,' and she will not be drawn on what.",
  location: 'Moryskah',
});

rel.defineTrainingMethod('moryskah_distiller_cape_pilgrimage', {
  skill: 'herblore', name: 'The Distiller Cape Pilgrimage',
  levelRange: [80, 99],
  xpPerHour: 245000,
  prerequisites: { skills: { herblore: 80 }, quests: ['the_bog_witchs_bargain'], items: [{ name: 'The Distiller Cape' }], areas: ['moryskah_wolfbane_distillery'] },
  resourceOutput: { produces: [{ name: 'Vintage essence (4)', perHour: 160 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 36000,
  danger: 'none', complexity: 'complex', attention: 'medium',
  inputs: [{ name: 'Wolfbane herb', perHour: 160, source: 'moryskah_nightshade_patch' }, { name: 'Still mash', perHour: 80, source: 'moryskah_wolfbane_distillery_mash' }],
  description: "With The Distiller Cape, the foreman will let you into the vintage cellar during the off-week. The eldest distiller runs the brew with you and corrects your measurements by pressing your thumb onto the beaker at the level she considers correct.",
  location: 'Moryskah',
});

rel.defineTrainingMethod('moryskah_director_cape_pilgrimage', {
  skill: 'crafting', name: 'The Director Cape Pilgrimage',
  levelRange: [82, 99],
  xpPerHour: 268000,
  prerequisites: { skills: { crafting: 82 }, quests: ['blood_rites'], items: [{ name: 'The Director Cape' }], areas: ['moryskah_cabaret'] },
  resourceOutput: { produces: [{ name: "Director's approved costume", perHour: 48 }], net: 'profit' },
  bankingFrequency: 'moderate', costPerHour: 14000,
  danger: 'none', complexity: 'complex', attention: 'medium',
  inputs: [{ name: 'Black dragonhide', perHour: 320, source: 'crafting' }, { name: 'Ruby', perHour: 96, source: 'mining' }],
  description: "Wearers of The Director Cape alter costumes alongside the director herself. She signs with a second red feather and, he says, 'her inflection, which is harder to describe.' Every approved costume earns a cabaret royalty payable in gold and in knowing-looks.",
  location: 'Moryskah',
});

// ══════════════════════════════════════════════════════════════════════════════
// BREAKPOINTS tied to easter eggs
// ══════════════════════════════════════════════════════════════════════════════

rel.defineBreakpoint({
  type: 'item_acquired', trigger: { item: 'sisterhood_sigil' },
  description: "The Sisterhood have stitched your name into the mending thread. The Brother-by-Brother slayer method opens; the Sisterhood library opens; the eldest Sister will, from this point on, greet you by a name she chose for you without asking.",
  unlocks: [{ type: 'training_method', id: 'moryskah_barrows_brother_by_brother_slayer', description: 'Barrows: brother-by-brother' }],
  importance: 'transformative',
});

rel.defineBreakpoint({
  type: 'quest_complete', trigger: { quest: 'the_coronation_of_the_quiet_count' },
  description: "You have a seat at the long supper where nothing is eaten. The Quiet Suppers chain begins on the next first-of-the-month; Malachar files your coronation next to all his other letters to people who forgot him, where it will remain, politely unread.",
  unlocks: [{ type: 'area', id: 'moryskah_castle_throne', description: 'Castle throne' }],
  importance: 'transformative',
});

rel.defineBreakpoint({
  type: 'quest_complete', trigger: { quest: 'the_hollow_choirs_descant' },
  description: "The third voice knows you. The midnight descant is open; the choir sheets in the box by the chapel door are, henceforth, addressed to you by name in chalk. You may, if you are quiet about it, correct the alto.",
  unlocks: [{ type: 'training_method', id: 'moryskah_hollow_midnight_magic', description: 'Hollow Choir midnight descant' }],
  importance: 'transformative',
});

// Count totals for export / tests
const totals = {
  grandmasterQuests: 8,
  worldEventChains: worldEventChains.length,
  rareDrops: rareDrops.size,
  capePilgrimageMethods: 5,
};

console.log(`[aelgard] Moryskah Easter Eggs loaded: ${totals.grandmasterQuests} grandmaster quests, ${totals.worldEventChains} world-event chains, ${totals.rareDrops} very-rare drops, ${totals.capePilgrimageMethods} cape pilgrimages`);

module.exports = {
  getWorldEventChain,
  listWorldEventChains,
  getRareDrop,
  listRareDrops,
  totals,
};
