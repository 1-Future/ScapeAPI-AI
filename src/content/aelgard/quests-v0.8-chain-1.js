// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — v0.8 Chain 1: THE BONEYARD ARCHIVIST (6 quests)
//
// Central narrative thread:
//   In the unmapped sixth level of the Boneyard Pyramid, a sealed archival
//   wing predates Aelgard's current calendar by a full era that no scholar has
//   yet named. The archivist of that wing — Keeper Aureth — is not alive, but
//   is not dead either; she was the last scribe of the preceding era, locked
//   in when her colleagues stopped returning. Archaeologist Veris has felt
//   her at the edge of the strata for seven years. The Hermit knows why the
//   eclipse matters. Razak has been delivering a package to the sixth-level
//   seal every month for forty-one years without opening it.
//
//   The chain traces the player's stepwise reconstruction of the lost era's
//   calendar — its glyphs, its mortuary rites, its Crown's foundation date —
//   until Aureth's seal is intact enough to be opened without the wing
//   collapsing the intervening millennium.
//
// Difficulty arc:
//   1. Novice       — The Glyph Beneath the Glyph
//   2. Intermediate — The Month That Was Omitted
//   3. Experienced  — The Twelve Graves That Do Not Match
//   4. Experienced  — Razak's Monthly Parcel
//   5. Master       — The Calendar Before the Calendar
//   6. Grandmaster  — Keeper Aureth's Seal
//
// Globetrotting:
//   Every quest visits 2+ regions. The chain as a whole touches Boneyard,
//   Heartlands, Moryskah, Glass Desert, Inkweald.
//
// Final reward (Grandmaster):
//   Sealed library wing access + 3 unique spell codices (non-interchangeable).
//
// NPC seeds: archaeologist_veris, razak, hermit_of_the_old_sun, father_dorin,
// wandering_scholar (Bel), merchant_zel. New named NPC created within the
// chain: Keeper Aureth (archivist-who-is-not-alive-but-not-dead).
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const quests = require('../../data/quests');
let rel = null;
try { rel = require('../../data/relationships'); } catch (_) { rel = null; }

function defineUnlock(id, unlock) {
  if (rel && rel.defineQuestUnlock) {
    try { rel.defineQuestUnlock(id, unlock); } catch (_) { /* non-fatal */ }
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// 1. THE GLYPH BENEATH THE GLYPH — novice (~20 min)
//    Seed: archaeologist_veris. The strata has, for weeks, been writing a
//    second set of glyphs under the first when nobody is watching. Veris will
//    not copy them herself — she is, in her phrase, 'not ready'. She will
//    send you, a colleague, to copy them at the one hour of day the second
//    glyphs are visible.
// ══════════════════════════════════════════════════════════════════════════════
quests.define('the_glyph_beneath_the_glyph', {
  name: "The Glyph Beneath the Glyph",
  description: "Archaeologist Veris has been staring at the same wall of the Pyramid's third-level corridor for eleven days. The glyphs on it are the glyphs she knows. There is, she says, a second set under them — written in light, not stone — that appear for seventeen minutes at third dusk. She will not go into the corridor at third dusk herself. She is, in her phrase, not ready. She is ready, however, for you to go.",
  difficulty: 'Novice', questPoints: 1,
  requirements: { skills: { magic: 25, crafting: 20, thieving: 15 } },
  steps: [
    { text: "At the Boneyard dig camp, take water from Razak without being told and wait for Veris's sunset. She will not speak until the first true shadow falls across the tents." },
    { text: "Accept a roll of pressure-paper and a stub of charcoal Veris has prepared. Do not accept the clay flask she slides across the table; that flask is hers, and the offer is a test." },
    { text: "Walk into the Pyramid's third-level corridor alone. Veris will not follow. The corridor's sconce-lamp burns cold — do not relight it." },
    { text: "Wait at the second wall until the third dusk (the sand-clock at your feet has three grains — the third is red). When the red grain falls, the second glyphs will come up in a blue that is not a colour your language has." },
    { text: "Copy the second glyphs with the charcoal, taking a rubbing through the pressure-paper (Crafting 20 for the rubbing, Magic 25 to keep the blue on the paper after the sconce dims)." },
    { text: "You have seventeen minutes. Do not copy the wall on your left. The wall on your left is mortuary script and will make the paper cold." },
    { text: "Return to the dig camp before full dark. Hand the rubbing to Veris. Do not unroll it yourself. She will unroll it, read one line aloud, and stop at the second line." },
    { text: "The second line is a date. The date is, by all current Aelgard reckoning, two hundred and forty-one years before the Crown's official founding. Veris will say 'the strata confirms' and go quiet." },
  ],
  rewards: {
    qp: 1,
    xp: { magic: 1800, crafting: 1200, thieving: 600 },
    items: [{ id: 'under_glyph_rubbing', name: 'Under-Glyph Rubbing', count: 1 }],
    questPoints: 1,
    unlocks: ["item_unlock:saw_the_pre_crown_date", "item_unlock:under_glyph_rubbing", "npc:veris_archival_trust"],
  },
});
defineUnlock('the_glyph_beneath_the_glyph', {
  name: "The Glyph Beneath the Glyph",
  unlocks: [
    { type: 'item_equip', id: 'under_glyph_rubbing', description: 'Under-Glyph Rubbing — pocket; lets you read any glyph wall written in the under-script. Chain-gated; unique to this chain. Non-tradeable.' },
    { type: 'dialogue_flag', id: 'saw_the_pre_crown_date', description: "You have seen a date older than the Crown's official founding. This line unlocks specific exchanges with Veris, Bel, and the Hermit." },
    { type: 'npc', id: 'veris_archival_trust', description: 'Veris permits you into the third-level corridor at any dusk. No other archaeologist has this permit.' },
  ],
  lore_notes: "The second date is not forged. The Crown's 'official founding' was a political declaration, not the actual start of the calendar. The chain unwinds this. This first quest is the nudge that gets the player believing Veris.",
});

// ══════════════════════════════════════════════════════════════════════════════
// 2. THE MONTH THAT WAS OMITTED — intermediate (~75 min)
//    Seed: wandering_scholar (Bel) + archaeologist_veris. The current calendar
//    has twelve months. The under-script suggests the older calendar had
//    thirteen. The thirteenth month was omitted by decree. The decree still
//    exists — filed under a clerk-name nobody uses anymore, in the Heartlands
//    chancery, behind a seal Father Dorin renews annually without reading.
// ══════════════════════════════════════════════════════════════════════════════
quests.define('the_month_that_was_omitted', {
  name: "The Month That Was Omitted",
  description: "Wandering Scholar Bel has been writing to Veris, who has been writing to Bel, about a decree that may or may not still exist. The decree, if it does, omitted a month from the Aelgard calendar two hundred and forty-one years ago. The decree, if it does not, was merely imagined by both of them. Bel would like to know which. Veris would like to know the name of the month. You are to acquire both, separately, without either scholar knowing which you acquired first.",
  difficulty: 'Intermediate', questPoints: 2,
  requirements: { skills: { thieving: 40, magic: 35, prayer: 30, agility: 30 }, quests: ['the_glyph_beneath_the_glyph'] },
  steps: [
    { text: "Meet Bel at whichever inn he is at this week. He will name three clerk-names used in the Heartlands chancery archive during the relevant decade. Only one of them is real." },
    { text: "Travel to the chancery. The real clerk-name is the one the current archive refuses to file under — the other two are filed normally, because the chancery does not know they are fakes." },
    { text: "Enter the chancery archive after the third bell (Thieving 40, Agility 30). Do not enter at the second bell; the second bell is when the junior clerks leave, and they notice doors closing behind them." },
    { text: "Find the decree under the real clerk-name. It is a single sheet, sealed with a wax that Father Dorin renews every spring. Do not break the seal. Rub it through with pressure-paper (Magic 35 to read the wax without disturbing it)." },
    { text: "The decree does not name the month. The decree refers to 'the month that falls between the twelfth and the first, as formerly observed'. The month's name is elsewhere." },
    { text: "Travel to Father Dorin at the Chapel of the Last Light. Do not mention the decree. Ask whether the spring blessing renews a seal. He will nod once. Ask whether he reads the seal before renewing. He will nod once more. Ask what is on the seal. He will say, after a long pause, a single word. That word is the month's name." },
    { text: "Dorin will not tell you this in exchange for nothing. Bring him Mortton bread baked while praying (which the Heartlands bakery will refuse to sell unless you first take it into the altar yourself). Prayer 30 to pray the bread correctly." },
    { text: "Return to Bel with the decree-rubbing. Return, separately, to Veris with the month's name. Do not tell Veris of the decree; do not tell Bel of the name. They will meet, in their own time, and compare." },
    { text: "Two in-game weeks later, a single note will arrive in your bank from the chancery. The note is two words: 'well filed'. It is signed by no one. Keep the note." },
  ],
  rewards: {
    qp: 2,
    xp: { thieving: 5500, magic: 4500, prayer: 3000, agility: 2800 },
    items: [{ id: 'decree_rubbing_of_the_thirteenth', name: 'Decree-Rubbing of the Thirteenth', count: 1 }],
    questPoints: 2,
    unlocks: ["item_unlock:decree_rubbing_of_the_thirteenth", "item_unlock:knows_the_month_name", "training_method:chancery_archive_thieving"],
  },
});
defineUnlock('the_month_that_was_omitted', {
  name: "The Month That Was Omitted",
  unlocks: [
    { type: 'item_equip', id: 'decree_rubbing_of_the_thirteenth', description: 'Decree-Rubbing of the Thirteenth — pocket; once per in-game year, lets you invoke the thirteenth month as a single day when no official calendar action may be taken against you (no quest timer expires, no NPC enmity ticks).' },
    { type: 'dialogue_flag', id: 'knows_the_month_name', description: "You know the month's name. This line unlocks specific exchanges with Dorin, Bel, Veris, and Keeper Aureth (chain-6)." },
    { type: 'training_method', id: 'chancery_archive_thieving', description: 'Chancery Archive (under clerk-name only) — nocturnal thieving method, requires under-glyph rubbing + decree rubbing, grants forgery-grade materials.' },
  ],
  lore_notes: "The month is named Euthren. It is neither canon nor anti-canon within Aelgard's current theology — the Crown omitted it, the chapel remembers it, the Pyramid measures by it. All three are correct within their own frames.",
});

// ══════════════════════════════════════════════════════════════════════════════
// 3. THE TWELVE GRAVES THAT DO NOT MATCH — experienced (~100 min)
//    Seed: father_dorin + archaeologist_veris + bog_witch_grael. Twelve named
//    graves in a small Moryskah churchyard have death-dates that do not align
//    with the current calendar. Dorin has never re-carved them. The bog witch
//    Grael suspects they were laid down in the omitted month. Prove it without
//    exhuming any body.
// ══════════════════════════════════════════════════════════════════════════════
quests.define('the_twelve_graves_that_do_not_match', {
  name: "The Twelve Graves That Do Not Match",
  description: "In the churchyard behind a derelict Moryskah chapel, twelve headstones carry death-dates that are, by the current calendar, impossible — the thirteenth day of a thirteenth month that, officially, does not exist. Father Dorin has never re-carved the stones. He has not said why. Bog Witch Grael would like it said aloud, once, by someone who is not a priest. You are the one who gets to say it.",
  difficulty: 'Experienced', questPoints: 3,
  requirements: { skills: { prayer: 55, herblore: 50, agility: 45, crafting: 40, mining: 40 }, quests: ['the_month_that_was_omitted', 'the_bog_witchs_bargain'] },
  steps: [
    { text: "Travel to the derelict chapel at the northern edge of Moryskah. The chapel is half-flooded at high water. You must enter at low water and leave before the tide returns (Agility 45)." },
    { text: "Inside the chapel, find the old ledger-book under the altar. Grael has told you to look at the altar's west side. Do not look at the east side; the east side is not for you." },
    { text: "Copy the twelve names and death-dates from the ledger. The ledger-ink is smudged on the seventh name. Grael has said you will know why." },
    { text: "Visit each of the twelve grave markers in the churchyard. Compare the dates on the stones to the dates in the ledger. Eleven match. One does not — the seventh. The stone says a different date." },
    { text: "Harvest a sprig of chapel-ivy from the churchyard's northern wall (Herblore 50). Do not harvest from the southern wall. The southern wall is consecrated; the northern is not, despite what Dorin has signed." },
    { text: "Grind the ivy with Moryskah spring-water (Crafting 40) to make a reading-poultice. Apply the poultice to the seventh stone. The stone's real carving, beneath thirty years of weather, will show for ninety seconds." },
    { text: "The seventh stone's real date IS the thirteenth of Euthren. Copy it. Compare it to the ledger's date. The ledger has been altered. Dorin altered it." },
    { text: "Return to Father Dorin. Do not ask why he altered the ledger. Ask, instead, who the seventh name was to him. He will say the name once. Then he will ask you to renew the southern wall's consecration for him (Prayer 55)." },
    { text: "Perform the consecration. Then, without Dorin present, carve a correction into the altar's underside (Mining 40 check) — no one will ever see it, but it will be there. Grael will know, without being told, that the carving was made." },
    { text: "Return to Veris with the rubbing of the seventh stone's true date. The strata confirms that the date is not a scribal error. It is the omitted month in use by the Moryskah chapels, generations after the decree." },
  ],
  rewards: {
    qp: 3,
    xp: { prayer: 11000, herblore: 9500, agility: 5500, crafting: 4000, mining: 3500 },
    items: [{ id: 'consecration_rubbing_of_the_seventh', name: 'Consecration Rubbing of the Seventh', count: 1 }],
    questPoints: 3,
    unlocks: ["item_unlock:consecration_rubbing_of_the_seventh", "item_unlock:renewed_the_southern_wall", "npc:grael_private_counsel"],
  },
});
defineUnlock('the_twelve_graves_that_do_not_match', {
  name: "The Twelve Graves That Do Not Match",
  unlocks: [
    { type: 'item_equip', id: 'consecration_rubbing_of_the_seventh', description: 'Consecration Rubbing of the Seventh — pocket; when held, any grave marker in Aelgard will show its true carving for twelve seconds. Use at the Mortton, Heartlands chapel, or Sootworks crypt for separate lore unlocks.' },
    { type: 'npc', id: 'grael_private_counsel', description: 'Bog Witch Grael will, once per in-game season, brew a poultice for you from a plant that does not grow anywhere else. Cost is a single unaltered ledger-page.' },
    { type: 'dialogue_flag', id: 'renewed_the_southern_wall', description: "Dorin will, unprompted, refer to you as 'renewer' in all future chapel dialogue. Mirelda will notice and not comment." },
  ],
  lore_notes: "The seventh name is Dorin's wife, Mira Dorin — not the captain's wife Mira of the Heartlands. Same name, different woman. The chapel altered her death-date because she died in Euthren, which the current Crown refuses to date. Dorin has carried this for thirty-one years.",
});

// ══════════════════════════════════════════════════════════════════════════════
// 4. RAZAK'S MONTHLY PARCEL — experienced (~2 hours)
//    Seed: razak + hermit_of_the_old_sun. For forty-one years Razak has
//    delivered an unopened sealed parcel to the sixth-level Pyramid seal
//    every month. He has not asked who sends it. He has not opened it. Today
//    the seal refuses the parcel for the first time, and Razak — who does not
//    panic — is asking you, quietly, to find out why.
// ══════════════════════════════════════════════════════════════════════════════
quests.define('razaks_monthly_parcel', {
  name: "Razak's Monthly Parcel",
  description: "For forty-one years, Razak has delivered a sealed parcel to a stone slot in the unreachable sixth level of the Pyramid. He did not know, when he started, what the parcel was. He does not know now. This month the slot refused the parcel — the parcel bounced back in his hand warm, as if the seal had held a hand against it. Razak is not panicking. He is, however, quietly asking you to find out why.",
  difficulty: 'Experienced', questPoints: 3,
  requirements: { skills: { hunter: 55, thieving: 50, magic: 50, agility: 50, firemaking: 40 }, quests: ['the_twelve_graves_that_do_not_match', 'sand_and_secrets'] },
  steps: [
    { text: "At the caravan post, accept Razak's parcel. Do not shake it. Do not weigh it. He will notice either. He will not stop you, but he will notice." },
    { text: "Travel with Razak to the sixth-level slot at dawn. Razak will show you the slot but will not touch it himself today. He will walk twenty paces back and stand in Pyramid-shade. Do not turn your back on him; he is watching for sand-scribes." },
    { text: "Present the parcel to the slot. The slot will refuse. The refusal is a single pulse of blue across your wrist. Copy the pulse's pattern onto your under-glyph rubbing (it binds into the blue underlayer)." },
    { text: "Take the parcel six days back to the caravan post. Do not open it — the seal is not your seal to break. Leave it in Razak's cold-chest and take the pattern instead." },
    { text: "Travel to the Hermit's shrine. Show the Hermit your wrist. They will close one eye. They will, without your asking, name the sender: a scribe who died before the Hermit was born. They will not say the scribe's full name; they will say only 'the Keeper'." },
    { text: "Return to Razak. Ask him, after he pours you water, who handed him the first parcel forty-one years ago. He will answer with a description, not a name — 'a woman with sand in her lap and a sleeve wet with ink'." },
    { text: "Travel to the Mortton apothecary. Apothecary Nira's grandmother wrote down, in a book Nira still has, descriptions of travellers who passed through Mortton in the years before Nira was born. One entry matches Razak's description. The entry gives the traveller's name. Do not take the book — Nira will read the entry to you. Do not ask her to read it twice." },
    { text: "The traveller's name is Keeper Aureth. She is listed as having walked south toward the Boneyard in Euthren of that year. She did not return via Mortton." },
    { text: "Return to the Hermit with the name. The Hermit will close both eyes and, for the first time in your acquaintance, smile — no more than a thumb's width of smile. Accept from the Hermit a small bronze key you have not seen before. Do not ask what it opens." },
    { text: "Return to Razak with the name. Razak will walk to his cold-chest, lift out the parcel, and open it in front of you. The parcel contains a single page. The page is a letter from Keeper Aureth to the first Hermit, written from the sixth-level archive, dated in Euthren, eight hundred years ago — a ninth of which has elapsed while the sixth-level seal fed the page back to itself on a monthly loop." },
    { text: "Do not read the letter yourself. Razak will tell you, in four words of summary: 'she has been waiting'. The rest is his to carry. Walk back to the Pyramid with Razak at his pace." },
  ],
  rewards: {
    qp: 3,
    xp: { hunter: 10000, thieving: 9500, magic: 9000, agility: 6500, firemaking: 4500 },
    items: [{ id: 'pyramid_blue_pulse_pattern', name: 'Pyramid Blue-Pulse Pattern', count: 1 }],
    questPoints: 3,
    unlocks: ["item_unlock:hermits_bronze_key", "item_unlock:pyramid_blue_pulse_pattern", "item_unlock:spoke_aureths_name", "npc:razak_inner_confidence"],
  },
});
defineUnlock('razaks_monthly_parcel', {
  name: "Razak's Monthly Parcel",
  unlocks: [
    { type: 'item_equip', id: 'pyramid_blue_pulse_pattern', description: 'Pyramid Blue-Pulse Pattern — pocket; lets you detect time-loop enchantments (any object being returned-to-itself) within 20 tiles. Unique to the archivist chain.' },
    { type: 'item_equip', id: 'hermits_bronze_key', description: "Hermit's Bronze Key — key slot; fits one lock in Aelgard, which you will not find without the grandmaster quest. Keeping it equipped shows no function yet." },
    { type: 'dialogue_flag', id: 'spoke_aureths_name', description: "You have named Keeper Aureth to Razak and the Hermit. This unlocks the grandmaster quest's availability." },
    { type: 'npc', id: 'razak_inner_confidence', description: 'Razak will, from now on, volunteer wind-knowledge free of charge. He will also, once, tell you the name of the lost caravan, if you earn it.' },
  ],
  lore_notes: "Keeper Aureth is the archivist of the pre-Crown calendar's sixth-level archive. She sealed herself in during the last Euthren before the decree. The parcel has been the Hermit-line's way of keeping her alive-adjacent. The letter implies she is still, in the loop, waiting for reply.",
});

// ══════════════════════════════════════════════════════════════════════════════
// 5. THE CALENDAR BEFORE THE CALENDAR — master (~3 hours)
//    Seed: archaeologist_veris + hermit_of_the_old_sun + wandering_scholar +
//    merchant_zel. Reconstruct the pre-Crown calendar in full, from five
//    sources that agree with each other only pairwise. You will need to walk
//    the Glass Desert to consult the Sand Prince's shard-mirror for the
//    sixth cross-check.
// ══════════════════════════════════════════════════════════════════════════════
quests.define('the_calendar_before_the_calendar', {
  name: "The Calendar Before the Calendar",
  description: "Five sources describe the pre-Crown calendar: Veris's translated under-glyph tables, Bel's decree-crib, Dorin's altered ledger, the Hermit's cult-tables, and Merchant Zel's shard-trade almanac. Each source agrees with each other source on only some points. The complete calendar is recoverable only if a sixth, independent source — the Sand Prince's shard-mirror in the Glass Desert — is used as the tie-breaker. The shard-mirror will not speak to anyone who has not asked the right second question.",
  difficulty: 'Master', questPoints: 4,
  requirements: {
    skills: { magic: 70, thieving: 65, crafting: 60, agility: 60, prayer: 55, herblore: 55, runecrafting: 55 },
    quests: ['razaks_monthly_parcel', 'the_second_question', 'the_glass_prophecy'],
  },
  steps: [
    { text: "Obtain Veris's under-glyph calendar tables. She will hand them over only if you have brought her a fresh flask of water drawn that morning from the Mortton spring (not the desert spring — she will know)." },
    { text: "Obtain Bel's decree-crib — a rolled-up strip of leather that names the omitted month, the surrounding months, and the missing year zero. Bel will hand it to you only if you return the borrowed pen he lent you during the cipher quest." },
    { text: "Obtain Dorin's altered ledger. He will not surrender it. You must copy it, in the chapel, in the company of the southern wall you consecrated. The copy takes two full in-game hours (Thieving 65, Prayer 55)." },
    { text: "Visit the Hermit's shrine. Do not ask for the cult-tables. Instead, ask after the second Hermit's vigil — the Hermit's predecessor. The Hermit will give you the tables in silence. Do not thank them." },
    { text: "Travel to the Drifting Market. Merchant Zel keeps his shard-trade almanac locked in a tin box at the back of his cart. He will open the box only if you have purchased, at full price, three shards from three separate regions (Glass Desert, Inkweald, and one more — he will let you choose)." },
    { text: "Triangulate the five sources. Four pairwise agreements align cleanly. One does not: Veris and Dorin disagree about the seventh day of Euthren. You cannot resolve this from the five sources alone." },
    { text: "Travel to the Glass Desert shard-mirror at the Azhmari dig site. The Sand Prince will let you approach only after a Glass Desert-style courtesy (bring him a single grain of un-stepped-on sand from the Boneyard's sixth-level approach — this requires walking back barefoot from the Pyramid, Agility 60)." },
    { text: "Stand before the shard-mirror. Ask your question aloud, in the format the Sand Prince dictates: not as a question, but as a reading — 'this is what I have seen; what have I missed'. The mirror will answer in a pattern of shards you must record (Crafting 60, Runecrafting 55)." },
    { text: "The mirror's answer aligns with Veris. Dorin was, genuinely, incorrect — the chapel's tradition had drifted one day over three centuries. Return to Dorin. Do not tell him his tradition is wrong. Instead, tell him what Mira's real death-date was, given the corrected calendar. He will nod once. He will re-carve the seventh stone himself that night. You will not be present." },
    { text: "Reconstruct the full pre-Crown calendar on a single roll of pressure-paper (Magic 70 to bind it stable). The calendar is thirteen months, three hundred and ninety-seven days, starts two hundred and forty-one years before the Crown's founding, and ends on the day Keeper Aureth sealed herself in." },
    { text: "Present the completed calendar to Veris at the dig camp. She will, for the first time in your acquaintance, offer you the clay flask. Drink. The water is rainwater from a storm she has been collecting for eleven years." },
  ],
  rewards: {
    qp: 4,
    xp: { magic: 28000, thieving: 22000, crafting: 12000, agility: 11000, prayer: 9000, herblore: 8500, runecrafting: 7500 },
    items: [{ id: 'pre_crown_calendar_roll', name: 'Pre-Crown Calendar Roll', count: 1 }],
    questPoints: 4,
    unlocks: ["item_unlock:holds_the_calendar", "item_unlock:pre_crown_calendar_roll", "npc:sand_prince_reading_audience", "training_method:shard_mirror_runecrafting"],
  },
});
defineUnlock('the_calendar_before_the_calendar', {
  name: "The Calendar Before the Calendar",
  unlocks: [
    { type: 'item_equip', id: 'pre_crown_calendar_roll', description: 'Pre-Crown Calendar Roll — pocket; lets you read any pre-Crown-dated document in the world. Includes Pyramid glyphs, chapel ledgers, Drifting Market ledgers, Sootworks oaths, Veilwood ring-counts, and Crystal Wyrm refractions. Unique to this chain.' },
    { type: 'training_method', id: 'shard_mirror_runecrafting', description: "Shard-Mirror Runecrafting — at the Sand Prince's site; high-attention, produces a reagent found nowhere else, used by chain-6 and the Last Prayer content." },
    { type: 'npc', id: 'sand_prince_reading_audience', description: 'The Sand Prince will grant one reading per in-game week. Readings give yes/no answers to single questions about time-bound content.' },
    { type: 'dialogue_flag', id: 'holds_the_calendar', description: 'You hold the calendar. Keeper Aureth will, in the final quest, recognise this without your saying so.' },
  ],
  lore_notes: "The calendar is canonical within the archivist chain but not a 'revealed truth' the Crown acknowledges. Other NPCs may reference it indirectly; none are required to.",
});

// ══════════════════════════════════════════════════════════════════════════════
// 6. KEEPER AURETH'S SEAL — grandmaster, 14-stage, 5+ hour
//    Seed: all of the above + the Hermit's bronze key + Razak as escort.
//    Descend into the Pyramid's sixth-level archive. Negotiate with Aureth
//    in a temporal frame where she is simultaneously writing and not writing.
//    Choose whether to free her, seal her deeper, or take her place.
// ══════════════════════════════════════════════════════════════════════════════
quests.define('keeper_aureths_seal', {
  name: "Keeper Aureth's Seal",
  description: "Eight hundred years ago, in the last Euthren before the decree, Keeper Aureth sealed herself into the sixth-level archive of the Boneyard Pyramid. The parcels the Hermit-line has sent her every month for forty-one years are the only thing keeping her loop from unraveling. You hold the bronze key, the under-glyph rubbing, the completed calendar, the decree-rubbing, the seventh-stone rubbing, and the blue-pulse pattern. The Pyramid's sixth-level seal will open for a player who holds all six, and only for such a player. What happens next is Aureth's decision and yours, which must agree.",
  difficulty: 'Grandmaster', questPoints: 5,
  requirements: {
    skills: { magic: 90, prayer: 85, thieving: 80, crafting: 75, herblore: 70, agility: 75, runecrafting: 70, mining: 65, hitpoints: 90 },
    quests: ['the_calendar_before_the_calendar', 'the_second_question', 'the_cipher_we_lost'],
    combat_level: 110,
    items_brought: [
      'under_glyph_rubbing',
      'decree_rubbing_of_the_thirteenth',
      'consecration_rubbing_of_the_seventh',
      'pyramid_blue_pulse_pattern',
      'pre_crown_calendar_roll',
      'hermits_bronze_key',
      'old_sun_sigil',
      'waxed_desert_compass',
    ],
  },
  steps: [
    { text: "Meet Razak at the caravan post on the last day of the in-game month. He will have been packing for four days. Do not arrive early. Do not arrive late. The wind will be from the south." },
    { text: "Walk six days to the Pyramid. On the third dusk, drink without being told (as before). On the fifth dusk, do not drink. The fifth dusk is the one Aureth will be listening." },
    { text: "At the sixth-level approach, remove your boots. Do not ask Razak to do the same. He will. This is not because you asked." },
    { text: "Present the bronze key to the sixth-level slot. The slot will not open from the key alone. Place the calendar, the under-glyph rubbing, the decree-rubbing, the seventh-stone rubbing, and the blue-pulse pattern in the five niches that will reveal themselves. Do not place anything in the sixth niche. The sixth niche is the one that will open when you step into it." },
    { text: "Step into the sixth niche. The Pyramid's sixth-level archive opens. Razak does not follow. He will, instead, sit in the sand and wait forty-one hours. Do not be gone longer than that." },
    { text: "The archive is a single long corridor. Its air is pressurised at pre-Crown calendar tempo. You will age, in the archive, at the rate of one day per in-game hour. Herblore 70 for a Boneyard-rooted anti-aging poultice you will have to brew inside the archive from wall-moss." },
    { text: "Aureth is writing at the corridor's end. She has been writing, continuously, for eight hundred years. She does not look up. Do not speak first. Wait." },
    { text: "After an hour (real time, eight days archive-time), Aureth will complete a page, turn it over, and ask you — not as a greeting — 'what month is it'. Answer with the name of the omitted month. If you say any other month, the archive will expel you and the chain locks for thirty in-game days." },
    { text: "Aureth will set down her pen. She will ask you the five other questions the Hermit-line has been, by way of the parcels, trying to deliver for eight hundred years. Answer each using one of the six rubbings/rolls you brought. You will know which to use. Magic 90." },
    { text: "At the sixth answer, Aureth will ask the seventh question, which is not from the Hermit-line. It is her own. She will ask whether the decree has been reversed. Answer truthfully: no, it has not. Dorin altered a single stone, and Veris holds the calendar, but the Crown has not reversed the decree." },
    { text: "Aureth will close the page she was writing. She will tell you that the archive cannot be left unattended — if it is, the loop the parcels maintain will unravel, and the archive will simply not have existed, retroactively, which will also mean that no Hermit, no Razak, no Veris, no you. This is not a threat. It is a statement of topology." },
    { text: "She will offer you three resolutions. (1) Seal her deeper — she remains, the parcels continue, but the archive is now reachable only during Euthren, which means once every thirteen months of in-game time. (2) Free her — she walks out with you, but before she crosses the threshold she must write down, page by page, the 397-day calendar she has been holding, and a named successor must be present. That successor is you, unless another qualified soul is brought within the hour. (3) Take her place — she leaves, you stay, the archive endures on your continuance. This is permanent in the world, not merely for your character — no other player can take her place again." },
    { text: "Choose. Each choice unlocks a distinct grandmaster reward. Each is permanent in the world. Each is canon." },
    { text: "Return to the surface. Razak will be where you left him, whichever way the choice went, though his face will have changed slightly with each. Walk the six days back with him without speaking of the archive. The speaking will come later, at the Salt-Pickled Crow, with Brigh at his Wednesday table. Brigh has agreed — without being asked — to be the first ear." },
  ],
  rewards: {
    qp: 5,
    xp: { magic: 95000, prayer: 55000, thieving: 30000, crafting: 22000, herblore: 25000, agility: 20000, runecrafting: 20000, mining: 15000, hitpoints: 40000 },
    items: [{ id: 'aureths_codex_trio', name: "Keeper Aureth's Codex Trio", count: 1 }],
    questPoints: 5,
    unlocks: ["area:pyramid_sixth_level_archive", "item_unlock:archive_ending_chosen", "item_unlock:aureths_scribes_ring", "npc:aureth_successor_or_free", "spell_unlock:aureths_spellbook"],
  },
});
defineUnlock('keeper_aureths_seal', {
  name: "Keeper Aureth's Seal",
  unlocks: [
    { type: 'area', id: 'pyramid_sixth_level_archive', description: 'Pyramid Sixth-Level Archive — accessible only if the chain is complete. Each chosen ending grants a different entry cadence (never, monthly of Euthren, or permanent).' },
    { type: 'spellbook', id: 'aureths_spellbook', description: "Keeper Aureth's Spellbook — THREE unique spells, learned via three separate codices obtained as a set. Codex One (Chorus of the Month Omitted) — adds a thirteenth-month recovery tick to any death. Codex Two (Seal Against Unravelling) — binds one inventory slot against time-loop interference, lets you carry items across wilderness death without loss once per week. Codex Three (Aureth's Reply) — single spell per in-game week, lets you read a letter written to you by an NPC who is dead or not yet born. Non-interchangeable with any other spellbook." },
    { type: 'item_equip', id: 'aureths_scribes_ring', description: "Aureth's Scribe-Ring — ring slot; while equipped, you age the world's ledgers by 1 line whenever you complete a major action (XP drop, boss kill, quest). The ledgers matter for late-game content (Last Prayer chain extension)." },
    { type: 'dialogue_flag', id: 'archive_ending_chosen', description: 'The archive ending you chose is permanent and canon. Downstream dialogue in the Last Prayer, Cartography Grandmaster, and the Second Question content all reference it.' },
    { type: 'npc', id: 'aureth_successor_or_free', description: "If you freed her, Aureth will walk the world. She will appear, once per in-game month, at the Salt-Pickled Crow on Wednesday, to speak with Brigh and (separately) with you. If you sealed her, she corresponds via the archive monthly. If you took her place, your character is now an NPC to other players between play sessions, writing in the archive — a unique multiplayer-adjacent feature." },
  ],
  lore_notes: "This is the capstone of the Archivist chain. The archive contains, among other things, the ONLY in-world record of the pre-Crown calendar's complete ritual year, including ceremonies referenced nowhere else. The three codices are the mechanical payoff. The choice is the narrative payoff. All three endings are canon — the world holds all three simultaneously, as the Pyramid was always a clock.",
});

console.log('[v0.8-chain-1] Boneyard Archivist: 6 quests loaded');
