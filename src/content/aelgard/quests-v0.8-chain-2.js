// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — v0.8 Chain 2: THE SOOTWORKS SILENT PACT (6 quests)
//
// Central narrative thread:
//   Furnace Two's outer pressure ring has one winter left. Engineer Fizz has
//   been saying so for eleven months. Forgemaster Brun has, for the same
//   eleven months, been filing her reports into a drawer that is also from
//   eighteen seventy-six. Crew Six-careful work demands the ring be replaced.
//   Replacing it requires Furnace Two off-line for nine days. Vorath cannot
//   order a nine-day stoppage without the Crown noticing. The Crown's
//   attention is precisely what Vorath is trying to avoid, because the Crown
//   would like to nationalise the Sootworks on the pretext of any emergency.
//
//   The Sootworks crews have, unofficially, been forming a silent pact: if
//   Fizz's report is correct, the crews will strike for nine days, pay
//   themselves out of a black-ledger pool Hilde has been assembling for
//   seven years, and replace the ring under their own oath — not the
//   Crown's. Brun must sign the pact, though not aloud. Vorath must bless
//   the pact, though not on paper. Hald must accept the responsibility he
//   does not yet know is his. The player threads the three meetings.
//
// Difficulty arc:
//   1. Novice       — The Report Filed Twice
//   2. Intermediate — Hilde's Black Ledger
//   3. Experienced  — The Bellows Wheel's Second Name
//   4. Experienced  — Hald's Letter to Kael
//   5. Master       — Nine Days to Pour Two Cold
//   6. Grandmaster  — The Oath Unwritten
//
// Globetrotting:
//   Sootworks, Heartlands (Hilde, Kael), Moryskah (supply route),
//   Saltbrine (offshore funder meet). The grandmaster finale requires a
//   ritual walk between all four regions.
//
// Final reward (Grandmaster):
//   Unique forge access at Furnace Two's rebuilt ring — crafts a tier of
//   gear (Oath-Sworn alloys) nobody outside the silent pact can make.
//
// NPC seeds: forgemaster_brun, engineer_fizz, vorath_warden, smith_hald,
// smith_kael, merchant_hilde, drunken_dwarf_ossen. Sister storyline pulled
// from Vorath's bible (his elder sister who walked out 31 years ago).
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
// 1. THE REPORT FILED TWICE — novice (~25 min)
//    Seed: engineer_fizz + forgemaster_brun. Fizz has written her eleventh
//    identical report on Furnace Two's outer pressure ring. Brun has filed
//    the last ten. Fizz is going to hand you the eleventh personally and ask
//    you, without ever phrasing it as a question, to watch the drawer.
// ══════════════════════════════════════════════════════════════════════════════
quests.define('the_report_filed_twice', {
  name: "The Report Filed Twice",
  description: "Engineer Fizz has finished her eleventh report on Furnace Two's outer pressure ring. The tolerances have crept. The part is from eighteen seventy-six. The drawer Brun files into is also from eighteen seventy-six. Fizz will not hand you the report in the Annex — she will hand it to you at the Soot-Mouth tavern, during a pour-break, while discussing the year of the bar-nails.",
  difficulty: 'Novice', questPoints: 1,
  requirements: { skills: { construction: 20, thieving: 15, crafting: 15 } },
  steps: [
    { text: "Visit the Soot-Mouth at the end of the second shift. Order water, not stout. Ossen will take notice." },
    { text: "Fizz will arrive alone. She will not greet you. She will put a folded sheet on the bar beside your glass and begin discussing the year eighteen seventy-six in specific detail. Do not unfold the sheet at the bar." },
    { text: "Walk the sheet to Brun's pour-office. Furnace Two will be pouring when you arrive. Do not enter during a pour. Wait in the outer corridor until the bell strikes." },
    { text: "Hand the sheet to Brun. He will take it without looking up. He will file it into the drawer directly below his hand. Note the drawer. Note the time." },
    { text: "Return to Fizz at the Annex. She will not ask which drawer. She will name it: third drawer, left column, labelled 'Two outer ring'. She will also tell you it contains the ten previous reports." },
    { text: "At third shift (Construction 20 to know the quiet hour), re-enter the pour-office. Brun is at the furnace floor. Open the drawer (Thieving 15 — Brun has no lock; he has trust)." },
    { text: "Remove the eleventh report. Do not take the other ten. Place a copy you will prepare (Crafting 15) in the file's place — the copy you made at Fizz's Annex the hour before, which Fizz has already initialled in the date-year-corner with 'received, acted, year eighteen seventy-six'." },
    { text: "Deliver the original eleventh report to Hilde at her Heartlands General Store. Do not ask what she will do with it. Accept the tea she puts on the stove." },
  ],
  rewards: {
    qp: 1,
    xp: { construction: 1500, thieving: 900, crafting: 800 },
    items: [{ id: 'fizzs_year_mark', name: "Fizz's Year-Mark (blank)", count: 1 }],
    questPoints: 1,
  },
});
defineUnlock('the_report_filed_twice', {
  name: "The Report Filed Twice",
  unlocks: [
    { type: 'item_equip', id: 'fizzs_year_mark', description: "Fizz's Year-Mark — pocket; lets you read the installation-year of any Sootworks part at a glance. Required for every subsequent quest in this chain." },
    { type: 'dialogue_flag', id: 'hilde_knows_fizz_report', description: "Hilde holds the report. This unlocks her 'black ledger' dialogue in chain-quest 2." },
    { type: 'npc', id: 'fizz_partial_trust', description: 'Fizz now speaks to you at tolerances instead of greetings. She will, once per in-game week, tell you the year of any single item you hold up.' },
  ],
  lore_notes: "The duplicate report in Brun's drawer is acceptable within the silent pact — Brun will find it, recognise it as a duplicate not the original, and understand that someone has moved on his behalf. He does not speak of this.",
});

// ══════════════════════════════════════════════════════════════════════════════
// 2. HILDE'S BLACK LEDGER — intermediate (~90 min)
//    Seed: merchant_hilde + forgemaster_brun (by proxy). The report is now in
//    Hilde's hands. She has been keeping, for seven years, a black-ledger pool
//    intended to cover a nine-day Sootworks strike. The pool is not complete.
//    She needs one more contribution, from a specific Saltbrine source, that
//    will only pay if the player carries the written ask personally.
// ══════════════════════════════════════════════════════════════════════════════
quests.define('hildes_black_ledger', {
  name: "Hilde's Black Ledger",
  description: "Hilde has, for seven years, been assembling a black-ledger pool to fund a nine-day Sootworks strike nobody has authorised. Six contributors have paid in. The seventh — a Saltbrine party whose name is not written anywhere — is owed the courtesy of a personal ask. Hilde will not go to Saltbrine herself. She would like you, friend, to carry the ask, receive the reply, and return without knowing what is in the parcel you bring back.",
  difficulty: 'Intermediate', questPoints: 2,
  requirements: { skills: { thieving: 45, agility: 40, crafting: 35, fishing: 30 }, quests: ['the_report_filed_twice'] },
  steps: [
    { text: "At Hilde's back counter, accept the sealed ask. The seal is plain wax. The wax is stamped with a small circle with a dot inside. Do not ask what the stamp means." },
    { text: "Travel to Saltbrine. Do not go to the harbourmaster's office. Do not go to Mara's stall. Go, instead, to the Salt-Pickled Crow and ask Innkeeper Vash for 'the back-room table'. Say the word 'friend' once and only once." },
    { text: "Vash will nod. She will pour you a drink you did not order and point at the back-room door. In the back room is a woman — not Nessa, her partner — who will accept the ask, open it in front of you, and put it face-down on the table." },
    { text: "The woman will tell you to wait three tides. During those three tides, do not leave Saltbrine. Fish off Mara's quay at low water — she will let you use her pole, for a price that is not money (Fishing 30)." },
    { text: "After the third tide, the woman will hand you a heavy tin box. Do not open it. Do not shake it. Do not weigh it by hand. Carry it in a net so the weight is dispersed (Crafting 35)." },
    { text: "Return to Heartlands. On the road, a pair of travellers will try to buy the box from you. Neither is what they appear. Refuse the first offer with politeness; refuse the second by leaving the road and rejoining it past the next bend (Agility 40)." },
    { text: "Deliver the box to Hilde. Do not watch her open it. She will pour tea, thank you, and — without looking at you — mention that the box contains 'nine days' worth of loaves'. Accept the phrase. Do not translate it." },
    { text: "Before you leave, Hilde will hand you a list of six names plus the Saltbrine woman's — not her partner's — seven names in total. Each is a contributor to the black ledger. The list is for your safekeeping only (Thieving 45 to burn it legibly if ever you must)." },
  ],
  rewards: {
    qp: 2,
    xp: { thieving: 6500, agility: 5000, crafting: 3500, fishing: 3200 },
    items: [{ id: 'black_ledger_contributors_list', name: 'Black Ledger Contributors List (sealed)', count: 1 }],
    questPoints: 2,
  },
});
defineUnlock('hildes_black_ledger', {
  name: "Hilde's Black Ledger",
  unlocks: [
    { type: 'item_equip', id: 'black_ledger_contributors_list', description: 'Black Ledger Contributors List — pocket, sealed; while held, any of the seven contributor NPCs will recognise you as a pact-friend and grant a one-time 20% price discount on their shop goods. List is lost forever if burned. Unique to this chain.' },
    { type: 'dialogue_flag', id: 'nine_days_of_loaves', description: "You have carried the phrase 'nine days' worth of loaves' to Hilde. This unlocks Vorath's receiving dialogue in chain-quest 6." },
    { type: 'npc', id: 'vash_back_room_access', description: 'Innkeeper Vash will, from now on, seat you at the back-room table without your asking. You are the only adventurer in Aelgard with that standing seat.' },
    { type: 'training_method', id: 'saltbrine_quay_fishing_pact', description: "Mara's Quay (pact-price) — fishing method, Mara rents her pole for a non-monetary favour each use, grants double the tide-pool yield." },
  ],
  lore_notes: "The Saltbrine contributor is the woman from the portrait — alive, in the Drifting Market under the name Nessa. Her partner in the Crow back-room is her lover. Neither of them will be named in the black ledger. The box contains stackable stamped notes — the chain's only usable currency at Furnace Two.",
});

// ══════════════════════════════════════════════════════════════════════════════
// 3. THE BELLOWS WHEEL'S SECOND NAME — experienced (~2 hours)
//    Seed: smith_kael + smith_hald + forgemaster_brun. The bellows wheel of
//    Kael's Heartlands smithy has a name carved inside the rim. The bellows
//    wheel of Brun's Furnace Two has, also, a name carved inside the rim.
//    Both are the same name. Neither smith knows. You must verify it without
//    either disassembling the wheel, and deliver the knowledge to Hald.
// ══════════════════════════════════════════════════════════════════════════════
quests.define('the_bellows_wheels_second_name', {
  name: "The Bellows Wheel's Second Name",
  description: "Kael's grandmother carved her name inside the rim of the Heartlands smithy's bellows wheel ninety years ago. The wheelwright who installed it (a gnome, long dead) did the same at Furnace Two twenty years later — same name, different wheel. Neither Kael nor Brun knows this. Hald, who writes to Kael anonymously, has begun to suspect. He is not yet certain, and will not be, unless you verify without disassembling either wheel. You are the only neutral party in Aelgard who could do this.",
  difficulty: 'Experienced', questPoints: 3,
  requirements: { skills: { crafting: 55, thieving: 50, agility: 50, smithing: 50, magic: 45 }, quests: ['hildes_black_ledger'] },
  steps: [
    { text: "At Kael's Heartlands smithy, offer to help at the bellows during a heat Kael is working alone. He will accept if you have brought him a single Sootworks-stock bar (which Hald will give you, wordlessly, on request)." },
    { text: "While Kael works the anvil, you work the bellows. During the down-stroke, position a mirror-charm (Magic 45 to craft at Fizz's Annex) on the inner rim. Read the engraving in the mirror's backing over three bellows cycles." },
    { text: "Do not write the name down at Kael's smithy. Keep it in memory. Kael's shop is not a place to carry Sootworks business in ink." },
    { text: "Travel to Furnace Two during Brun's third-shift walk-through. Hald will be alone at Furnace Three's secondary anvil. Ask him, without naming the errand, to cover Brun's walk-through for twelve minutes. He will, after a look, agree." },
    { text: "At Furnace Two's bellows wheel, reposition the mirror-charm on the inner rim. The rim is too hot for direct contact — you must lower the charm on a wire (Crafting 55, Smithing 50, Agility 50)." },
    { text: "Read the engraving in the mirror. The name is the same. Commit it to memory a second time." },
    { text: "Return to Hald at Furnace Three. Say the name aloud. Hald will close his eyes for exactly one bellow's worth of time. Then he will say 'right then' and pour his next heat without comment." },
    { text: "Walk back to Kael's smithy. Do not say the name to Kael. Instead, tell him you have recently met a Sootworks smith named Hald who writes clean letters. Kael will say 'mm' in a way that is not disagreement. He will hand you a small bar of stock, unpromised." },
    { text: "Travel to the Sootworks and hand the bar to Hald. Tell him Kael believes the writer is a good smith. Hald will, for the first time in three years of correspondence, write a letter that ends with his own name. You will carry the letter back to Kael personally." },
    { text: "Kael will read the letter in front of you, fold it once, and put it on the forge-rim — not in the fire, just on the rim. It will not burn. He will say 'right' and nothing more. The two smiths have now, effectively, met." },
  ],
  rewards: {
    qp: 3,
    xp: { crafting: 11000, thieving: 8500, agility: 7500, smithing: 9000, magic: 5500 },
    items: [{ id: 'wheelwrights_mirror_charm', name: "Wheelwright's Mirror-Charm", count: 1 }],
    questPoints: 3,
  },
});
defineUnlock('the_bellows_wheels_second_name', {
  name: "The Bellows Wheel's Second Name",
  unlocks: [
    { type: 'item_equip', id: 'wheelwrights_mirror_charm', description: "Wheelwright's Mirror-Charm — pocket; reveals the installation-engraving of any wheel, bellows, or bearing in Aelgard. Combined with Fizz's Year-Mark, reveals the full provenance of any Sootworks part." },
    { type: 'dialogue_flag', id: 'named_the_wheelwright', description: "You spoke the wheelwright's name (Rennid Wrightwheel) to Hald. Hald will now refer to his smithy as 'Rennid's line' in private. Kael does not use the name." },
    { type: 'npc', id: 'kael_hald_correspondence_formal', description: 'Kael and Hald now write to each other by name. Their correspondence is, functionally, the foundation of the silent pact — a Heartlands smith and a Sootworks smith agreeing without a treaty.' },
    { type: 'training_method', id: 'kael_hald_joint_smithing', description: 'Joint Smithing (Kael/Hald line) — if you are at either smithy and the other is on duty, XP rate is +10% while you work stock marked with the wheelwright symbol.' },
  ],
  lore_notes: "Rennid Wrightwheel was a gnome wheelwright from the Sootworks Foundry District who travelled to the Heartlands at sixty to install the Kael smithy wheel. He died, unknown to Kael's family, two years later in a Moryskah bog — a fact the Bog Witch Grael knows and has never mentioned.",
});

// ══════════════════════════════════════════════════════════════════════════════
// 4. HALD'S LETTER TO KAEL — experienced (~90 min)
//    Seed: smith_hald + smith_kael. Now that the two smiths have written to
//    each other by name, Hald must deliver a more consequential letter — one
//    in which he accepts, on behalf of the Sootworks deputy line, the
//    responsibility he does not yet know is his. Fizz and Vorath must both
//    see this letter before it reaches Kael, without Hald knowing either
//    saw it.
// ══════════════════════════════════════════════════════════════════════════════
quests.define('halds_letter_to_kael', {
  name: "Hald's Letter to Kael",
  description: "Hald has, for the first time, written a letter in which he accepts a responsibility he does not yet realise is his. The letter is addressed to Smith Kael. It does not name the responsibility. Fizz, whose paranoia has saved lives, needs to read it. Vorath, whose oath holds the Sootworks together, needs to read it. Neither may be seen reading it. You are the one who moves it.",
  difficulty: 'Experienced', questPoints: 3,
  requirements: { skills: { thieving: 58, magic: 55, crafting: 50, agility: 50, runecrafting: 45 }, quests: ['the_bellows_wheels_second_name'] },
  steps: [
    { text: "At Furnace Three, accept the letter from Hald. Do not look at the addressee. Hald will watch you take the letter; if he sees your eyes drift to the envelope, he will take it back and the quest locks for three days." },
    { text: "Walk the letter to Fizz's Annex. Do not knock — Fizz has asked the annex door to be left open at third shift. Place the letter, sealed, on the workbench. Fizz will read it through the envelope using a technique she has refused to name (Magic 55 to reproduce for your own records)." },
    { text: "Fizz will not open the letter. She will write, on a strip of paper that is not paper (Runecrafting 45 to identify the substance), a single two-digit number and slide it under the letter. The number is the year of the part the responsibility is about. Keep the strip separate from the letter." },
    { text: "Carry the letter and the strip to the Deep Vein audience chamber. Vorath will receive you on the understanding that you have not been seen by any other foreman on the way (Agility 50, Thieving 58). Do not take the direct route." },
    { text: "In the Deep Vein, hand Vorath the letter and the strip. Vorath will not open the letter. He will read the strip. He will tap his ring against the table once. He will hand you a second strip, also not paper, with a second two-digit number. Do not read it." },
    { text: "Walk to the Heartlands. Deliver the sealed letter to Kael. Do not hand him either strip. Kael will open the letter, read it, fold it, and place it on the forge-rim without looking at you. He will say 'right'." },
    { text: "Return to Fizz. Show her the second strip. She will read it, add a third digit in her own hand, and hand it back. The strip now reads as a tolerance plus two years: it is the oldest part in Furnace Two, the part that would need to be replaced, and the year by which the silent pact is planning to replace it." },
    { text: "Burn the strip in Fizz's forge-scraps. Crafting 50 to burn it without ash residue. Fizz will chirp like her clockwork bird without smiling." },
    { text: "Return to Hald at Furnace Three. Do not mention the strip. Do not mention either reading. Ask him whether he will drink with you at the Soot-Mouth that evening. He will, for the first time in your acquaintance, say 'right then' as a greeting." },
  ],
  rewards: {
    qp: 3,
    xp: { thieving: 10000, magic: 9500, crafting: 7000, agility: 6500, runecrafting: 5500 },
    items: [{ id: 'unread_pact_strip', name: 'Unread Pact Strip', count: 1 }],
    questPoints: 3,
  },
});
defineUnlock('halds_letter_to_kael', {
  name: "Hald's Letter to Kael",
  unlocks: [
    { type: 'item_equip', id: 'unread_pact_strip', description: "Unread Pact Strip — pocket; a second strip you kept on your person. It cannot be read by anyone including you until the Grandmaster quest is initiated, at which point it becomes the Oath Strip of the pact. Non-tradeable." },
    { type: 'dialogue_flag', id: 'strip_silent_triangle', description: 'You have moved messages between Hald, Fizz, Vorath, and Kael without any of them acknowledging the messages in writing. This is the triangle of the silent pact.' },
    { type: 'npc', id: 'vorath_audience_direct', description: "Vorath will, from now on, accept your requests without the customary three months' paperwork. You are one of exactly three adventurers with this standing." },
    { type: 'training_method', id: 'annex_open_door_runecrafting', description: "Annex at Third Shift — runecrafting method at Fizz's bench during third shift; attention level high, rate medium, grants strip-paper reagent unique to this chain." },
  ],
  lore_notes: "The Oath Strip will, in the grandmaster, show the full oath of the silent pact. Until then it is blank. Fizz's 'not paper' is a substrate only the Sootworks crews make — iron-filing-infused linen, used only for contracts that must be destroyed cleanly after action.",
});

// ══════════════════════════════════════════════════════════════════════════════
// 5. NINE DAYS TO POUR TWO COLD — master (~4 hours)
//    Seed: forgemaster_brun + engineer_fizz + vorath_warden + drunken_dwarf_ossen.
//    Furnace Two must go cold for nine days. The strike must be felt, not
//    announced. Ossen's maps from the Grand Heist quest become operationally
//    critical: the crews must re-route coal, ore, and ingot deliveries
//    through tunnels Brun cannot officially know about. A Crown inspector
//    arrives on day five — coincidentally, or not. You must walk the
//    inspector away from Furnace Two without his realising he has been
//    walked.
// ══════════════════════════════════════════════════════════════════════════════
quests.define('nine_days_to_pour_two_cold', {
  name: "Nine Days to Pour Two Cold",
  description: "Furnace Two must go cold for nine days so the outer pressure ring can be replaced. Brun cannot order the stoppage. Vorath cannot bless it in public. Fizz has drawn the critical-path diagram. Ossen's drawer-notes are the only map of the re-routed tunnels. A Crown inspector arrives on day five, as the weather turns and the Sootworks is most visibly quiet. You must keep the pact intact — for nine days, through the inspector's visit, without any oath being spoken aloud in any room the inspector might be in.",
  difficulty: 'Master', questPoints: 4,
  requirements: {
    skills: { construction: 70, smithing: 68, thieving: 65, mining: 65, crafting: 60, agility: 60, firemaking: 55, magic: 55 },
    quests: ['halds_letter_to_kael', 'the_map_that_was_never_drawn', 'crew_six_after_the_pour'],
  },
  steps: [
    { text: "Day 1 (in-game). Present the black ledger contributors list to Vash at the Salt-Pickled Crow. She will hand you Ossen's re-routing notes (previously her back-room guest for one night, uninvited by her but accommodated)." },
    { text: "Walk the re-routing notes into the Sootworks via the Moryskah supply road, not the Heartlands route. The Heartlands route has Crown eyes this week (Agility 60)." },
    { text: "Day 2. Deliver the first three days of rations to the offline crews — stamped notes from Hilde's tin, one per pair of hands, none in Brun's or Vorath's hand." },
    { text: "Day 3. Furnace Two goes cold. Brun, wordlessly, relocates to Furnace Three. Fizz takes up position at the outer pressure ring with two apprentices. Your job is to fetch the new ring — cast by Hald at Furnace Three from stock Kael shipped in on Vash's back-route (Smithing 68 to cast-check)." },
    { text: "Day 4. Dress-fit the new ring. Construction 70 to align. You must work in twenty-minute windows while Fizz sleeps — she has refused to sleep for three days; the apprentices and you rotate her off by deception (Mining 65 to dig a replacement job for her that is actually unnecessary)." },
    { text: "Day 5. The Crown inspector arrives. Meet him at the Heartlands-Sootworks border and walk him, slowly, the long way around. Do not lie. Do not show him the direct road. Discuss the weather. Mention Ossen's tavern with a laugh. The inspector must not reach Furnace Two today." },
    { text: "The inspector will ask to see Furnace Two. Lead him instead to Furnace One — identical from the inspector's vantage. Furnace One is pouring. He will be satisfied with the heat and the noise. Do not let him walk around the back. Magic 55 to reinforce an illusion of the Furnace Two chimney's smoke." },
    { text: "Day 6. The inspector leaves. Do not celebrate. Ossen will, in the Soot-Mouth, toast you by a year (eighteen seventy-six) rather than a name. Accept the toast." },
    { text: "Day 7-8. The ring is sealed. Fizz's apprentices take the last two days of work. You fetch Kael from the Heartlands — for the first time in his adult life, he leaves the Heartlands to see the Sootworks Furnace. Travel with him down the Moryskah route (he refuses the Heartlands route on principle). He will speak three sentences the entire walk." },
    { text: "Day 9. Kael inspects the ring. He says 'mm' twice. The ring holds. Furnace Two re-lights at dawn on day ten. Brun pours the first heat without ceremony. Kael is there. Vorath is there. Fizz is asleep in her annex for the first time in nine days." },
    { text: "After the pour, walk with Hald, Kael, Fizz, Brun, and Vorath to the Deep Vein audience chamber. None of them speak on the walk. Vorath taps his ring against the table. That is the sealing of the pact. No words are said." },
  ],
  rewards: {
    qp: 4,
    xp: { construction: 35000, smithing: 32000, thieving: 20000, mining: 22000, crafting: 15000, agility: 14000, firemaking: 9000, magic: 10000 },
    items: [{ id: 'nine_days_tally_stick', name: 'Nine Days Tally-Stick', count: 1 }],
    questPoints: 4,
  },
});
defineUnlock('nine_days_to_pour_two_cold', {
  name: "Nine Days to Pour Two Cold",
  unlocks: [
    { type: 'item_equip', id: 'nine_days_tally_stick', description: 'Nine Days Tally-Stick — pocket; while held, your player can treat any nine consecutive in-game days as a single tick for ration, skill-decay, and quest-timer purposes. Non-tradeable, unique to this chain.' },
    { type: 'training_method', id: 'ring_replacement_construction', description: 'Ring Replacement (Furnace Two) — construction method that recurs every seven in-game years, requires full pact coordination. Grants triple XP but needs six other players or NPCs on schedule.' },
    { type: 'dialogue_flag', id: 'pact_nine_day_held', description: "The nine-day pour was held. The crews now regard you as 'pact-hands'. This unlocks the grandmaster quest." },
    { type: 'npc', id: 'crown_inspector_blind', description: 'The Crown inspector does not know what he did not see. He will return in seven in-game years. Until then you are clear to work unseen operations in the Sootworks.' },
  ],
  lore_notes: "Kael has not, in adult life, left the Heartlands. Walking to the Sootworks for this inspection is the only surface-exit he will make until his death. This is, within the chain, the most private revelation: the Heartlands smith crossed regions to confirm a pact his region's Crown must not know about.",
});

// ══════════════════════════════════════════════════════════════════════════════
// 6. THE OATH UNWRITTEN — grandmaster, 14-stage, 5+ hour
//    Seed: all Sootworks NPCs + Vorath's elder sister, returned from the
//    Glass Desert after thirty-one years. The pact is held, but the oath
//    has not been sworn. Oaths cannot be written; they must be walked.
//    The walker is the one person who carried every message in the chain
//    without ever being named in any of them.
// ══════════════════════════════════════════════════════════════════════════════
quests.define('the_oath_unwritten', {
  name: "The Oath Unwritten",
  description: "The pact is held. The ring is replaced. The pour has resumed. But the oath has not been sworn — and an oath that is only pact is not yet an oath. Sootworks oaths are walked, not written. The walker must be neutral (not Brun, not Fizz, not Hald, not Vorath), must have carried every message (no other adventurer has), must be willing to never speak of the walk again (Sootworks law), and must be accompanied by the one person Vorath has been waiting thirty-one years to speak with — his elder sister, who walked out of the Wardenship and, last autumn, walked back in.",
  difficulty: 'Grandmaster', questPoints: 5,
  requirements: {
    skills: { construction: 85, smithing: 85, mining: 80, crafting: 75, agility: 80, firemaking: 75, magic: 75, prayer: 70, thieving: 75, hitpoints: 90 },
    quests: ['nine_days_to_pour_two_cold', 'the_map_that_was_never_drawn', 'the_last_dragon_p3'],
    combat_level: 110,
    items_brought: [
      'fizzs_year_mark',
      'wheelwrights_mirror_charm',
      'unread_pact_strip',
      'black_ledger_contributors_list',
      'nine_days_tally_stick',
      'old_sun_sigil',
    ],
  },
  steps: [
    { text: "At the Deep Vein audience chamber, Vorath will hand you a sealed invitation. The invitation is addressed to no one; the seal is his ring. Do not open it. Carry it to the Glass Desert." },
    { text: "At the Glass Desert's Azhmari outpost, ask for 'the dwarf woman who watches the shard-mirror'. She will be at the mirror, standing motionless, carrying herself as if she has not yet decided whether to sit. Present the invitation to her. She will accept it without reading it." },
    { text: "She will walk back to the Sootworks with you. The walk is six days. She does not speak the first three. On the fourth, she will ask whether Vorath still drinks stout on her leaving-day anniversary. Answer honestly: once a year, one stout. She will laugh once, without smiling." },
    { text: "Arrive at the Deep Vein. Vorath will have not slept for two days waiting. He will open the door himself. The sister — her name is Durra — will walk in without ceremony. You will stand in the corridor with Ossen, who has arrived, unbidden, with a bottle of the right stout." },
    { text: "After an hour of silence from inside the chamber, Vorath will open the door. The eleven-word note is on the table. Durra has, finally, spoken the twelve-word reply. Vorath will, for the first time in thirty-one years, weep — once — and stop, and call you inside." },
    { text: "Vorath will hand you the Oath Strip (your Unread Pact Strip becomes legible as you hold it in the audience chamber). The strip now bears the full oath of the silent pact. Read it aloud, slowly. Do not ask questions about it. Magic 75 to read without the strip burning; Prayer 70 to read without losing a word." },
    { text: "Walk the oath. Begin at Furnace Two — touch the new outer pressure ring with the mirror-charm, year-mark, and tally-stick in hand (Smithing 85, Construction 85). The ring will hum at a frequency that Fizz's bird recognises and will not chirp." },
    { text: "From Furnace Two, walk to Kael's Heartlands smithy. Touch the bellows wheel's inner rim without disassembling (Mining 80 to feel the engraving through the iron). The wheel will hum the same frequency." },
    { text: "From Kael's smithy, walk to the Salt-Pickled Crow. Place the black ledger contributors list on the back-room table. Vash will nod. The list will not burn." },
    { text: "From the Crow, walk to the Mortton apothecary. Nira will be waiting (she has been written to, anonymously, by Durra). She will add a poultice to your pack — a rare Moryskah binding that will keep the oath whole for your lifetime (Herblore-related, but free here because Nira refuses payment for oath-work)." },
    { text: "From Mortton, walk to the Boneyard caravan post. Razak will give you water and salt without charge. Do not drink yet." },
    { text: "From the caravan post, walk to Ossen's stool at the Soot-Mouth. Ossen will pour a stout and set a second glass across from himself. Drink the water Razak gave you in the second glass. Do not drink the stout." },
    { text: "Walk back to the Deep Vein one final time. Hand the Oath Strip to Vorath. He will burn it in the lamp. The strip's ash is, by Sootworks law, now the oath. Keep a small pinch of the ash — Agility 80 and Crafting 75 to collect it cleanly. This ash is the only legal proof the oath was sworn, and it exists in exactly one place: on your person, in a small tin Ossen has, quietly, slipped into your hand." },
    { text: "Decide. (1) KEEP the ash — the oath binds you as the silent pact's neutral walker for all future Sootworks contingencies; you gain permanent Furnace Two access but may never again speak publicly on Sootworks matters. (2) BURY the ash at Kael's forge-rim — the oath binds the Heartlands smith line to the pact; Kael receives the Sootworks as kin, and you gain a rare cross-region crafting table. (3) SCATTER the ash at the Azhmari shard-mirror — the oath is, with Durra's blessing, a pan-regional pact; you gain no personal tie, but unlock a unique Oath-Sworn alloy tier that only silent-pact holders may forge." },
  ],
  rewards: {
    qp: 5,
    xp: { construction: 90000, smithing: 85000, mining: 45000, crafting: 30000, agility: 30000, firemaking: 25000, magic: 25000, prayer: 22000, thieving: 28000, hitpoints: 40000 },
    items: [{ id: 'oath_ash_tin', name: 'Oath Ash Tin', count: 1 }],
    questPoints: 5,
  },
});
defineUnlock('the_oath_unwritten', {
  name: "The Oath Unwritten",
  unlocks: [
    { type: 'area', id: 'furnace_two_inner_chamber', description: "Furnace Two Inner Chamber (Oath-Sworn forge) — accessible only to pact-walkers. Contains the Oath-Sworn alloys tier and Fizz's calibration bench." },
    { type: 'training_method', id: 'oath_sworn_smithing', description: "Oath-Sworn Smithing — smithing tier unique to the silent pact. Produces Oath-Sworn plate/chain/ring items that degrade but can be re-forged only here. Non-interchangeable with any other smithing tier. Ceiling: higher-tier XP per action than any other smithing method." },
    { type: 'item_equip', id: 'oath_ash_tin', description: 'Oath Ash Tin — pocket; the tin itself is a proof-of-oath and grants you the title "Pact Walker" visible to other players. Effect depends on your choice: (1) KEEP — permanent Furnace Two access and silent oath-keeper status; (2) BURY — Kael smithy gains a permanent Sootworks-alloy bench; (3) SCATTER — Oath-Sworn alloys available to you at any silent-pact contributor.' },
    { type: 'npc', id: 'durra_sister_of_vorath', description: 'Durra, Vorath\'s elder sister, is now a named NPC in the world. Her status depends on your ending: (1) she remains in the Deep Vein as co-advisor; (2) she travels between regions as a neutral mediator; (3) she returns to the Glass Desert but writes monthly.' },
    { type: 'spellbook', id: 'pact_spellbook', description: "Pact Walker's Spellbook — three utility spells: Silent Route (walks unseen between Sootworks and Heartlands for 20 minutes, once per day), Oath-Sealed (locks one inventory slot against theft, permanent while the tin is held), and Bellows' Second Name (identifies any smithing-forged item's maker by region and year)." },
  ],
  lore_notes: "This grandmaster is, in one reading, the Sootworks version of 'The Second Question' — not a metaphysical revelation, but a political one. The Crown does not know the pact exists. It will not know unless a future quest-writer chooses to expose it, and that choice has non-degenerate consequences. All three endings are canon; they determine which pact-variants exist in the world.",
});

console.log('[v0.8-chain-2] Sootworks Silent Pact: 6 quests loaded');
