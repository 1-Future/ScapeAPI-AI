// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — v0.8 Chain 3: SALTBRINE TWIN-TIDE (6 quests)
//
// Central narrative thread:
//   Tsunara, the storm-spirit of Stormcrown Reef, fights alone as if still
//   paired. Her twin Gailin was extinguished two centuries ago by the Crystal
//   Wyrm's refraction — or was he? Tsunara knows Gailin is held in the
//   Wyrm's alignment. Tsunara cannot cross to reach him.
//
//   A tide-priestess named Elenne has tended the hidden shrine at Stormcrown
//   Reef's inner spine for eleven years. She is the seventh generation of
//   Stormcrown priestesses, and the last — no apprentice has presented in her
//   tenure. Her grief is not for herself but for the line; if she dies
//   untutored, the twin-tide phenomenon will unravel, and Saltbrine's
//   marine calendar, fishing cycles, and harbour-charters will all come
//   apart with it.
//
//   The chain reconciles the tide's loss: you bring Gailin's residue back
//   from the Wyrm's alignment, help Tsunara grieve publicly for the first
//   time, and in the grandmaster choose whether to restore the pair or
//   walk the reef's spine as the eighth priestess (or priest) yourself.
//
// Difficulty arc:
//   1. Novice       — The Priestess Who Does Not Speak
//   2. Intermediate — Lenna's Second Fold
//   3. Experienced  — The Tide That Did Not Break
//   4. Experienced  — Gailin's Last Residue
//   5. Master       — The Seven Names on the Inner Spine
//   6. Grandmaster  — The Twin-Tide Reconciled
//
// Globetrotting:
//   Saltbrine, Glass Desert (Crystal Wyrm's refraction anchor), Heartlands
//   (Dorin for last-rites counsel), Inkweald (Yara for dream-tide crossing),
//   Boneyard (Razak's wind-knowledge for the tide-walker).
//
// Final reward (Grandmaster):
//   Unique teleport to the hidden Stormcrown shrine + tide-walking ability
//   (can walk offshore tiles at full moon/new moon without boats).
//
// NPC seeds: tsunara_storm_twin, harbourmaster_cole, fishmonger_mara,
// captain_reed, first_mate_brigh, crystal_wyrm, crystal_sage_orin. New named
// NPC introduced within the chain: Priestess Elenne (seventh Stormcrown
// tide-priestess).
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
// 1. THE PRIESTESS WHO DOES NOT SPEAK — novice (~25 min)
//    Seed: fishmonger_mara + new NPC Priestess Elenne. A priestess has
//    stopped speaking. Mara noticed. Mara will not approach her directly
//    because Mara is not a Saltbrine-born woman (she is Marigold's Mercy
//    crew, which Elenne would notice, which would not help). You will.
// ══════════════════════════════════════════════════════════════════════════════
quests.define('the_priestess_who_does_not_speak', {
  name: "The Priestess Who Does Not Speak",
  description: "The seventh Stormcrown tide-priestess, Elenne, has not spoken at the quay for eleven days. Mara noticed on day four. Mara, who served under Cole on the Marigold's Mercy, cannot approach Elenne directly — Saltbrine-born Elenne would read Mara's sea-stance at a glance, and Mara's stance would remind Elenne of losses Elenne does not need reminding of. You are, by default, the one who carries Mara's question.",
  difficulty: 'Novice', questPoints: 1,
  requirements: { skills: { fishing: 22, prayer: 20, crafting: 15 } },
  steps: [
    { text: "Buy a penny-jaw at Mara's stall. Listen to her weather-talk. She will, in the middle of describing a northerly, say 'the priestess is quiet'. Do not ask more. Leave the stall." },
    { text: "Walk to the Stormcrown shrine-path — the narrow stair of broken tiles that climbs from the far end of the quay to the inner spine of the reef. Elenne's small chapel is at the base of the stair. Do not climb the stair. The stair is hers." },
    { text: "Enter the chapel. Elenne is standing with her back to the door, pouring tide-water into a shallow basin. Do not speak first. Wait at the threshold." },
    { text: "Sit on the stone bench at the chapel's east wall. Elenne will, after seven minutes (real time, not game time; a Saltbrine Sunday pause), turn and look at you. She will not speak." },
    { text: "Hold up the penny-jaw. Elenne will, after a moment, take it from you without a word and place it in the tide-basin. The penny-jaw will float, which penny-jaws do not do in fresh water — this water is, therefore, not fresh. You have confirmed the tide-basin is actively connected to the reef spine (a thing Mara suspected but could not verify)." },
    { text: "Catch a liar-fish at the low-water shelf beneath the chapel (Fishing 22). Liar-fish are unreliable at inshore spots; Mara's pole-loan from the earlier chain helps here if you carry it. Return the liar-fish to the chapel." },
    { text: "Place the liar-fish in the basin. It will not float. The basin rejects liar-fish — which means Elenne has not fed the basin liars in at least a month. She has therefore not been tending the weekly rite. You now know the depth of her silence." },
    { text: "Carve, with a fishing-knife point (Crafting 15), a single tide-mark on the chapel's outer lintel — the mark Mara has told you privately, which tells the next Saltbrine-born visitor that a non-priestess has noted the absence of the rite. Mara will, separately, ensure Vash at the Crow also knows." },
  ],
  rewards: {
    qp: 1,
    xp: { fishing: 1600, prayer: 1000, crafting: 700 },
    items: [{ id: 'stormcrown_tide_mark', name: 'Stormcrown Tide-Mark', count: 1 }],
    questPoints: 1,
  },
});
defineUnlock('the_priestess_who_does_not_speak', {
  name: "The Priestess Who Does Not Speak",
  unlocks: [
    { type: 'item_equip', id: 'stormcrown_tide_mark', description: 'Stormcrown Tide-Mark — pocket; lets you read every tide-mark in Saltbrine. Tide-marks carry Saltbrine-born-only information: which shrines are tended, which boats are overdue, which crews are offshore. Chain-gated; unique to this chain.' },
    { type: 'dialogue_flag', id: 'elenne_acknowledged', description: 'Elenne has registered you, non-verbally. She will, in future quests, continue not speaking until you reach the grandmaster. Her silence is not rudeness — it is tide-priestess mourning discipline.' },
    { type: 'npc', id: 'mara_tide_confidence', description: 'Mara will, from now on, share Saltbrine-specific news with you before Vash does. One rumour per in-game week.' },
  ],
  lore_notes: "Elenne's silence is not grief over a personal loss; it is the mourning discipline the Stormcrown priestesses observe when an apprentice does not present after the line's year-count passes a threshold. Elenne is the seventh, and no eighth has come. The line, by the reef's internal calendar, is effectively ending.",
});

// ══════════════════════════════════════════════════════════════════════════════
// 2. LENNA'S SECOND FOLD — intermediate (~60 min)
//    Seed: fishmonger_mara + first_mate_brigh + Priestess Elenne. The
//    margin-net quest had Lenna's smaller net. This quest has Lenna's
//    original net, which Lenna has been refolding daily for twelve years
//    to keep the tide-pool spots active. Elenne's silence has unsettled
//    Lenna, and Lenna's folding is off. Re-teach the fold, which Mara
//    learned from Cole, who learned it from Lenna's mother.
// ══════════════════════════════════════════════════════════════════════════════
quests.define('lennas_second_fold', {
  name: "Lenna's Second Fold",
  description: "Lenna has been refolding her original margin-net — not the smaller one — daily for twelve years, to keep the tide-pool spots spiritually active. She has been folding it wrong for six days. Elenne's silence has unsettled her. Mara, who learned the correct fold from Cole, who learned it from Lenna's mother, cannot re-teach Lenna directly (the same Marigold's Mercy awkwardness). You will be re-taught the fold in secret, and re-teach it to Lenna under the guise of asking for her help with something else.",
  difficulty: 'Intermediate', questPoints: 2,
  requirements: { skills: { fishing: 40, crafting: 35, agility: 35, thieving: 30 }, quests: ['the_priestess_who_does_not_speak', 'the_tide_pool_collector'] },
  steps: [
    { text: "At Mara's stall at first tide, accept a folded napkin. It is, in miniature, the correct Stormcrown fold. Mara will not teach you by demonstration — she will watch you unfold and re-fold the napkin six times. If you achieve the correct fold four out of six, she will nod. If not, come back at next tide." },
    { text: "Practise the fold alone for an in-game afternoon (Crafting 35). Use a small square of cloth you've bought from Hilde in the Heartlands — Hilde's squares are the correct stiffness. Do not use Saltbrine-square cloth; it is too supple." },
    { text: "Travel to the Crow at second tide. Brigh will be at his Wednesday table on a Tuesday — an irregularity that is deliberate. Show him the folded cloth. If you have folded correctly, he will order you a drink. If not, he will not acknowledge you." },
    { text: "Brigh will give you a small stone — a 'fold-weight' — that he has carried since he was a tide-pool kid trained by Mara. The weight guarantees Lenna recognises a genuine Stormcrown fold. Do not lose it; it is irreplaceable." },
    { text: "Walk to the tide-pool shingle. Lenna will be refolding the original margin-net, incorrectly, with her back to the sea. Do not correct her. Ask her, instead, to show you how to fold the fold-weight into a Stormcrown pocket for a small keepsake (Thieving 30 — the deception is gentle, not aggressive)." },
    { text: "Lenna will reach for her usual fold. Mid-fold, she will notice her hands know the wrong sequence. She will, in three breaths, re-sync. Then she will complete the fold correctly. Accept the finished pocket without comment." },
    { text: "Lenna will, without realising she has done so, turn to her original margin-net and re-fold it correctly in one pass. She will say nothing. She will not thank you. She never thanks four times in a row — three is her lifetime count." },
    { text: "Travel to Elenne's chapel. Place the fold-weight (now wrapped in the Stormcrown pocket Lenna made) on the tide-basin's east rim. The basin's surface will ripple without external wind. Elenne, still silent, will place her palm on the rim for the first time in two weeks (Agility 35 to kneel respectfully without knocking the rim; Fishing 40 to understand why the ripple matters)." },
    { text: "Return to Brigh at the Crow. Tell him Lenna re-folded. He will accept this by not looking at you, which is his highest acknowledgement." },
  ],
  rewards: {
    qp: 2,
    xp: { fishing: 6500, crafting: 4500, agility: 4000, thieving: 3000 },
    items: [{ id: 'brighs_fold_weight_copy', name: "Brigh's Fold-Weight (a copy)", count: 1 }],
    questPoints: 2,
  },
});
defineUnlock('lennas_second_fold', {
  name: "Lenna's Second Fold",
  unlocks: [
    { type: 'item_equip', id: 'brighs_fold_weight_copy', description: "Brigh's Fold-Weight (a copy) — pocket; Brigh had a duplicate made for you by a Veilwood whittler. Keeps nets from unfolding in your pack (doubles carry capacity of any fishing-net item). Chain-gated." },
    { type: 'npc', id: 'lenna_third_fold_trust', description: 'Lenna will now re-fold your nets for free when you visit. She will say one word: the direction of the wind.' },
    { type: 'dialogue_flag', id: 'basin_rippled_once', description: "Elenne's basin has rippled for your offering. Future quests in this chain will use this as prerequisite dialogue." },
    { type: 'training_method', id: 'stormcrown_fold_practice', description: "Stormcrown Fold Practice — crafting method at the tide-pool shingle; low-attention, grants cloth-related XP plus a chance of a Stormcrown Pocket reagent used in later chain quests." },
  ],
  lore_notes: "Lenna's mother was a Stormcrown tide-priestess candidate who chose nets over the shrine — one of two sisters, the other being Elenne's grandmother's friend. Lenna's fold-discipline is the shadow of a priestess-training she never completed.",
});

// ══════════════════════════════════════════════════════════════════════════════
// 3. THE TIDE THAT DID NOT BREAK — experienced (~100 min)
//    Seed: harbourmaster_cole + captain_reed + Priestess Elenne. On a
//    specific night three weeks ago, the tide at Stormcrown Reef did not
//    break at its appointed hour. Cole noted it. Reed noted it. Neither
//    told the other. Elenne, at the chapel, noticed the absence and went
//    silent the next morning. Investigate the missing tide; the answer is
//    in the Glass Desert.
// ══════════════════════════════════════════════════════════════════════════════
quests.define('the_tide_that_did_not_break', {
  name: "The Tide That Did Not Break",
  description: "Three weeks ago, the third tide of a specific night did not break at Stormcrown Reef. Cole noted the absence in his back-room chart. Reed noted it from the Bittern's deck. Neither mentioned it to the other. Elenne, who had been kneeling at the reef spine when it should have broken, went silent the next morning. The tide is the thing. The tide is always the thing. You must find out why the tide held.",
  difficulty: 'Experienced', questPoints: 3,
  requirements: { skills: { fishing: 55, magic: 55, agility: 55, thieving: 50, runecrafting: 45 }, quests: ['lennas_second_fold', 'echoes_of_the_deep'] },
  steps: [
    { text: "At Cole's office, ask for the back-room chart's Wednesday entry for the relevant week. Cole will not volunteer it — you must ask by naming the tide the chart will show is missing (second tide; not third; the chain trusts you to know the difference, because it was in fact second tide on a Wednesday, and Cole's chart marks Wednesday tides by blue ink, not red)." },
    { text: "Cole will hand you the chart. Do not copy the whole week. Copy only the Wednesday column (Thieving 50). Return the chart before he asks." },
    { text: "Travel to the Bittern at anchor. Reed is on deck. Ask him, casually, whether he's had any unusual weather lately. He will, after four beats, say 'a Wednesday tide that did not break'. If you do not volunteer that you know, he will stop there. If you do volunteer — gently, not all at once — he will describe the exact height and direction of the stillness." },
    { text: "With Cole's chart entry and Reed's observation, triangulate where the stillness radiated from. The answer is not Saltbrine. The answer is a point somewhere to the west-southwest — in the Glass Desert, at the Crystal Wyrm's outer refraction ring (Magic 55 to project the chart onto a proper map)." },
    { text: "Travel to the Glass Desert. Crystal Sage Orin will, without your asking, greet you with 'you are here about a tide'. He has been expecting you since Tuesday. He will show you a small logbook of refraction anomalies — on the Wednesday in question, the Wyrm's outer ring refracted a sea-sound it had not in two centuries." },
    { text: "The refraction pulled from Stormcrown Reef specifically. Orin hands you a shard of refracted tide — a small vial of water that moves like a sea-wave but does not wet your fingers (Runecrafting 45 to carry safely). The shard is Gailin's residue, released for a single instant when the Wyrm's alignment flickered that night." },
    { text: "Return to Saltbrine. Do not go to Elenne first. Go to Brigh at the Crow. Show him the shard. He will, unexpectedly, recognise it — his grandmother described such a thing to him once. Brigh will, for the first time, volunteer a memory: his grandmother was a Stormcrown tide-priestess candidate who chose the sea. The shard is a tide-priestess thing." },
    { text: "Walk to Elenne's chapel. Place the shard on the tide-basin's west rim (not east; east was Lenna's fold). The basin's surface will form a single standing wave. Elenne will speak her first word in weeks: 'Gailin'. No more. Walk out of the chapel without speaking." },
    { text: "Return to Brigh. Tell him the word Elenne spoke. He will not reply aloud. He will write, on a bar napkin, 'inform Cole tomorrow morning'. You will do so." },
    { text: "Cole will, when told the name Gailin, close his chart-drawer, pour two cups of harbour-tea, and say 'the second chart — we will look at the second chart today'. He will show you a very small chart of the reef's inner spine, drawn by Cole's predecessor forty years ago. The inner spine has a trail that no surface map contains. It leads to Elenne's hidden shrine." },
  ],
  rewards: {
    qp: 3,
    xp: { fishing: 9000, magic: 10000, agility: 8500, thieving: 6500, runecrafting: 5500 },
    items: [{ id: 'gailin_residue_shard', name: "Gailin's Residue Shard", count: 1 }],
    questPoints: 3,
  },
});
defineUnlock('the_tide_that_did_not_break', {
  name: "The Tide That Did Not Break",
  unlocks: [
    { type: 'item_equip', id: 'gailin_residue_shard', description: "Gailin's Residue Shard — pocket; carries a single instant of reef-tide, usable once to calm a storm encounter anywhere in the world. Unique; consumed on use in this chain's grandmaster." },
    { type: 'area', id: 'stormcrown_inner_spine_trail', description: 'Stormcrown Inner Spine Trail — accessible only with the second chart; leads to Elenne\'s shrine. Trail risk: agility checks per section, no map markers.' },
    { type: 'dialogue_flag', id: 'cole_second_chart_shared', description: "Cole has, for the first time, shown you the second chart. Brigh knows. Mara knows. Reed does not yet know." },
    { type: 'npc', id: 'orin_tide_correspondence', description: "Crystal Sage Orin will write you monthly with refraction updates that affect Stormcrown. This is the first correspondence Orin has offered outside his scholarly circle." },
  ],
  lore_notes: "The tide that did not break was Gailin's residue escaping the Wyrm's alignment for a single night. This is the first mechanical confirmation that Gailin is not extinguished — only held. Tsunara knows but cannot cross; this quest is the first step toward a mortal-carried crossing.",
});

// ══════════════════════════════════════════════════════════════════════════════
// 4. GAILIN'S LAST RESIDUE — experienced (~2 hours)
//    Seed: crystal_wyrm + crystal_sage_orin + tsunara_storm_twin. With
//    the shard identified, you must recover a larger residue — enough to
//    restore Gailin's presence at the reef, even if only partially.
//    The Wyrm will not release it lightly. You must petition, at the
//    refraction threshold, under the guidance of Orin.
// ══════════════════════════════════════════════════════════════════════════════
quests.define('gailins_last_residue', {
  name: "Gailin's Last Residue",
  description: "A single shard is enough to confirm Gailin is held. It is not enough to restore him. Orin knows the method — petition the Wyrm at refraction-threshold under a specific sea-song that no Saltbrine-born knows in full, but that Brigh's grandmother knew a quarter of, Mara knows a quarter of, Cole knows a quarter of, and Elenne must sing the last quarter. The song is ancient and has no written form. You are the only one who can collect all four quarters and carry them to the refraction.",
  difficulty: 'Experienced', questPoints: 3,
  requirements: { skills: { magic: 62, prayer: 55, fishing: 55, agility: 55, hunter: 50, thieving: 45 }, quests: ['the_tide_that_did_not_break'] },
  steps: [
    { text: "Ask Brigh for his grandmother's quarter. Brigh will not sing. He will hum — once, at the Crow, late at night when the tavern is empty except for you, him, and the cat. Listen twice. Do not ask for a third." },
    { text: "Ask Mara for her quarter. Mara will not hum or sing. She will recite the quarter as a list of fish-names, rhythmically, in a sequence that, if you know how to hear it, is the melody. Fishing 55 to hear." },
    { text: "Ask Cole for his quarter. Cole will say 'I cannot sing'. Then he will tap it out, on the harbourmaster's desk, with the butt of a kelp-chew, in a rhythm that is the melody's cadence without the pitch. You must match the cadence to Brigh's and Mara's pitches (Magic 62)." },
    { text: "Approach Elenne's chapel. The fourth quarter — Elenne's — she will not give without the first three. Present Brigh's hum, Mara's list, and Cole's cadence to her by performing them at the chapel threshold (Prayer 55 to perform without blasphemy). She will, on hearing the third, sing the fourth. Once. You must remember." },
    { text: "Carry the complete song (as a full memory; do not write it down, the song has no written form and the act of writing it destroys it) to the Glass Desert. Orin will walk with you to the Wyrm's outer refraction ring. He will not cross the ring with you." },
    { text: "At the refraction threshold, sing the song once. The Wyrm will refract a single answering note. Do not react. Sing the song again. The Wyrm will refract a sequence of three notes. Do not react. Sing a third time. The Wyrm will offer a larger residue of Gailin — a palm-sized pearl of condensed tide (Hunter 50 to catch it falling through the refraction; Agility 55 to not touch the Wyrm itself)." },
    { text: "The pearl will ask for a price. The price is not a fight — the Wyrm does not fight adventurers who have come carrying a tide-priestess song. The price is a memory of your own: the Wyrm will consume, permanently, your memory of the first fish you ever caught in any Saltbrine tide. You will know, in the future, that you have forgotten this fish. You will not be able to recover it." },
    { text: "Accept the price (or refuse, and the quest locks; the pearl cannot be taken without payment). Carry the pearl back to Saltbrine in a Stormcrown Pocket (made in the previous quest). Do not show it to anyone on the road." },
    { text: "At Elenne's chapel, place the pearl on the tide-basin's north rim. The basin will, for ninety seconds, display a reflection of Gailin as he was — a storm-twin's silhouette, recognisable to Tsunara if she were here to see. Elenne will, weeping silently (tide-priestess discipline — no sound, only tears), touch the pearl once. It will be, from that moment, partially dissolved into the basin." },
    { text: "Return to the Wyrm's outer refraction ring. Do not approach closer. Thank the Wyrm — in the reef-song's last note — without words. The Wyrm will refract a single note of acknowledgement. Orin will, from his position outside the ring, nod." },
  ],
  rewards: {
    qp: 3,
    xp: { magic: 13000, prayer: 9500, fishing: 8500, agility: 7500, hunter: 6000, thieving: 4500 },
    items: [{ id: 'reef_song_memory', name: 'Reef-Song (memorised)', count: 1 }],
    questPoints: 3,
  },
});
defineUnlock('gailins_last_residue', {
  name: "Gailin's Last Residue",
  unlocks: [
    { type: 'spellbook', id: 'reef_song_memory', description: 'Reef-Song (memorised) — special memory item, not equipped; appears in your known-songs codex. Lets you sing, once per in-game month, a verse that will calm any tide-related storm boss for thirty seconds. Non-interchangeable.' },
    { type: 'dialogue_flag', id: 'forgot_first_saltbrine_fish', description: 'You have permanently forgotten your first Saltbrine fish catch. NPCs who remember it (Mara, Brigh) will, in rare dialogue, remind you it happened without naming the fish.' },
    { type: 'npc', id: 'wyrm_partial_ally', description: "The Crystal Wyrm will, in the chain's grandmaster, refract in your favour rather than against you. This is not combat avoidance — it is a specific boon the Wyrm grants to tide-petitioners." },
    { type: 'area', id: 'refraction_threshold_audience', description: "Refraction Threshold Audience — a ritual approach site at the Wyrm's outer ring, usable for future tide-song petitions. No combat; pure ritual." },
  ],
  lore_notes: "The pearl is Gailin's last residue that can be surrendered without unraveling the Wyrm's alignment entirely. It is enough to let Tsunara, in the grandmaster, have one night of her twin's company before the Wyrm reclaims the residue. The memory-price is Marstead's principle at work: real, irreversible cost.",
});

// ══════════════════════════════════════════════════════════════════════════════
// 5. THE SEVEN NAMES ON THE INNER SPINE — master (~3 hours)
//    Seed: Priestess Elenne + all seven Stormcrown priestesses (six dead,
//    one living). Elenne must, before the grandmaster, acknowledge her
//    predecessors by walking the inner spine and reading the six names
//    carved on the reef. She has avoided this walk for eleven years. You
//    are the neutral party who can accompany her.
// ══════════════════════════════════════════════════════════════════════════════
quests.define('the_seven_names_on_the_inner_spine', {
  name: "The Seven Names on the Inner Spine",
  description: "Elenne has been the seventh Stormcrown priestess for eleven years. The inner spine of the reef, reached only via Cole's second chart, holds six names carved into submerged stone — her six predecessors. She has not walked the spine in eleven years. Her silence has been a substitute for the walk. Before the grandmaster is possible, the walk must be made. You are the neutral party who can accompany her, and the only outsider the spine will permit.",
  difficulty: 'Master', questPoints: 4,
  requirements: {
    skills: { agility: 72, fishing: 70, prayer: 68, magic: 65, hunter: 60, crafting: 55, herblore: 55 },
    quests: ['gailins_last_residue', 'the_siren_of_saltbrine', 'the_boneyard_compass'],
  },
  steps: [
    { text: "At Cole's office, present Brigh's fold-weight copy, Gailin's residue shard, and the reef-song memory. Cole will unlock the second-chart drawer. He will hand you a waxed copy of the inner-spine trail and say 'don't lose her'." },
    { text: "Travel to Elenne's chapel at low water before dawn. Do not speak. Hand her the waxed copy. She will, without speaking, put on a grey hooded robe — the first time in eleven years the Stormcrown robe has been worn outside the chapel." },
    { text: "Begin the walk. The inner spine trail is submerged at high water and exposed only at neap tides. Agility 72 to navigate the slick stones; Fishing 70 to read the tide-warnings carved at each junction (if the tide is turning, the warnings change colour and you must stop)." },
    { text: "At the first name — carved into a standing stone at knee height — Elenne will read the name aloud, softly. She will say one word about the priestess. Do not echo. Do not write." },
    { text: "At the second name, Elenne will not speak. You must read the name aloud instead. Prayer 68 to speak without blasphemy; the reef is listening. Do not mispronounce; mispronunciation returns the tide early." },
    { text: "At the third name, Elenne will collapse briefly. Herblore 55 — brew a Stormcrown restorative from the reef-weed at your feet. Administer. Do not carry her; the spine does not permit being carried." },
    { text: "At the fourth name, a figure will appear in the reef-water — one of the previous priestesses in refracted form. She will not speak. She will nod. You nod back. Elenne will kneel and touch the stone. Magic 65 to not be pulled into the refraction." },
    { text: "At the fifth name, the reef-spine narrows to a single stone's width. Hunter 60 to track which step is safe. One wrong step and the tide will claim you; Elenne cannot help you if you fall." },
    { text: "At the sixth name, the most recent predecessor, Elenne will finally weep audibly — the first sound she has made in eleven years that is not controlled discipline. Do not comment. Hold the waxed chart. Wait." },
    { text: "At the seventh name — Elenne's own name, carved already, in anticipation of her death — she will place her palm on the stone and, with the reef-song memory, sing a single verse. The reef will accept the verse. The tide will slacken for fifteen minutes to allow your return." },
    { text: "Return together to the chapel. Elenne will, for the first time, speak freely. She will say three things: (1) she is ready for the grandmaster, (2) the line must continue, (3) she will accept only a tide-reader of outsider blood, which Saltbrine law technically forbids and the reef has, by the seventh stone, overridden." },
    { text: "Return to Cole. Report the walk. Cole will, without ceremony, initial the chart in Brigh's hand and file it back in the second-chart drawer. He will then pour you a drink. You have never, to this point in any Saltbrine quest, seen Cole pour himself a drink in front of another person. Accept. Drink in silence. Leave without speaking." },
    { text: "Visit Mara. She will know, without asking, that the walk was made. She will say one sentence: 'she'll need you for the last one'. Do not confirm. Leave." },
  ],
  rewards: {
    qp: 4,
    xp: { agility: 27000, fishing: 24000, prayer: 20000, magic: 15000, hunter: 10000, crafting: 7500, herblore: 8500 },
    items: [{ id: 'inner_spine_seven_names', name: 'Inner-Spine Seven Names (memorised)', count: 1 }],
    questPoints: 4,
  },
});
defineUnlock('the_seven_names_on_the_inner_spine', {
  name: "The Seven Names on the Inner Spine",
  unlocks: [
    { type: 'item_equip', id: 'inner_spine_seven_names', description: 'Inner-Spine Seven Names (memorised) — pocket; while carried, Stormcrown-area tide tables read as one full extra tide per in-game day. Chain-gated.' },
    { type: 'area', id: 'stormcrown_inner_spine_trail_freely', description: "Stormcrown Inner-Spine Trail — now freely walkable by you (and only you) at any neap tide. Fishing here yields tide-priestess reagents unique to the chain." },
    { type: 'dialogue_flag', id: 'elenne_speaks', description: 'Elenne now speaks to you. Her dialogue is brief, precise, and tide-accurate. No other NPC hears her speak during this time period.' },
    { type: 'npc', id: 'mara_sister_confirmed', description: 'Mara, by acknowledging the walk, has confirmed her Saltbrine-born heritage to you. She will no longer hide her Marigold connection in your presence.' },
  ],
  lore_notes: "The seventh stone's name (Elenne) is carved in advance because Stormcrown law requires each priestess to carve her own in-waiting-stone at ordination. Elenne carved hers at nineteen. The line dies with her unless an outsider is accepted — which the reef has, in this walk, permitted for the first time in the line's history.",
});

// ══════════════════════════════════════════════════════════════════════════════
// 6. THE TWIN-TIDE RECONCILED — grandmaster, 14-stage, 5+ hour
//    Seed: all the above + tsunara_storm_twin + crystal_wyrm. The Wyrm has
//    agreed (via residue) to release Gailin's partial presence for one night.
//    Tsunara must be told, must accept, must fight without fighting. Elenne
//    must perform the reconciliation rite. You must choose, at the end,
//    whether to restore the pair fully, preserve the alignment, or walk
//    the reef-spine yourself as the eighth priest(ess).
// ══════════════════════════════════════════════════════════════════════════════
quests.define('the_twin_tide_reconciled', {
  name: "The Twin-Tide Reconciled",
  description: "Gailin's residue is held. Elenne is ready. Tsunara, the storm-twin who has fought as if still paired for two hundred years, must be told. She will not believe at first; the telling is the first half of the quest. The second half is the reconciliation — performed at Stormcrown Reef's inner spine, at the exact hour of twin-moon tide, with the Wyrm's cooperation. The third half — the choice at the end — is yours, and it is permanent. Three endings. The reef remembers each.",
  difficulty: 'Grandmaster', questPoints: 5,
  requirements: {
    skills: { magic: 90, prayer: 88, fishing: 82, agility: 82, hunter: 75, herblore: 70, crafting: 70, runecrafting: 70, hitpoints: 92 },
    quests: ['the_seven_names_on_the_inner_spine', 'the_siren_of_saltbrine', 'the_alignment_beneath'],
    combat_level: 113,
    items_brought: [
      'stormcrown_tide_mark',
      'brighs_fold_weight_copy',
      'gailin_residue_shard',
      'reef_song_memory',
      'inner_spine_seven_names',
      'old_sun_sigil',
      'veldraks_given_scale',
    ],
  },
  steps: [
    { text: "Sail the Bittern out to Stormcrown Reef with Reed, Brigh, Cole, Mara, and Elenne. This is the only ship-crewing in Aelgard that requires all five NPCs present; Reed will only sail for this if you have completed The Letter Unposted to any ending. No other ship may be used." },
    { text: "At the reef's outer edge, anchor. Cole will not step onto the reef; he will remain on deck as witness. Reed will. Mara will. Brigh will. Elenne will lead. You follow second." },
    { text: "At the reef's outer spine, you will sight Tsunara's storm-form. Do not approach. Sing the reef-song's first verse (solo — the others cannot sing the verse as outsiders). Tsunara will turn, the first time in two centuries she has acknowledged a non-storm-being. Magic 90 to hold the verse in the wind." },
    { text: "Walk the inner-spine trail to the seventh stone. Elenne will, at each of the previous six names, repeat the single word from the master-quest walk. This time, the words are different — they are no longer mournings, they are blessings." },
    { text: "At the seventh stone, Elenne will extend Gailin's residue pearl on her palm. The pearl will lift, without her releasing it, and hang in the air at the centre of the reef-spine. This is the reconciliation anchor. Prayer 88 to stabilise." },
    { text: "Call Tsunara to the spine. She will come, in storm-form, reluctantly. She will hover over the pearl and, for the first time, speak Gailin's name aloud. The Wyrm, refracting the reef, will hold the residue open for her." },
    { text: "Gailin's partial presence will manifest — not in storm-form, in song-form. The melody you memorised is his voice. Sing it through. Tsunara will, after a moment, sing her own half-remembered half of what was once their duet. The two halves are not quite the same. Elenne will, with the reef-song memory, bridge them. Fishing 82 to hold the tide at neap for the duration; Agility 82 to stand on the spine." },
    { text: "The duet completes. Tsunara, for the first time in two centuries, is still. The reef is silent. The tide has paused. Hunter 75 to catch a single transfigured tide-minnow that will only exist for this minute — it is Gailin's token of acknowledgement to you." },
    { text: "Elenne asks the three-way question. This is the choice. (1) RESTORE — Gailin is released fully, the Wyrm's alignment loses a piece of its geometry (which retroactively affects The Alignment Beneath), Tsunara rejoins her twin, the storm-twin boss becomes cooperative on the reef forever. (2) PRESERVE — Gailin returns into the Wyrm's alignment, Tsunara carries this night's duet as memory (not loss), the boss encounter continues but with new lore flags. (3) WALK — you, the player, become the eighth Stormcrown priest(ess); the chain's line continues; you accept permanent tide-duty at Stormcrown Reef, which ties your character to this shrine forever but grants unique permanent capacities (see unlocks)." },
    { text: "Perform the chosen rite. All three require the full inner-spine walk back, but with different invocations. Herblore 70 for any of the three; Crafting 70 for the reconciliation wafer; Runecrafting 70 for the binding." },
    { text: "Return to the Bittern. The crew will sail you back at the dawn tide. They will not speak of what you chose. Each of them will, in the following weeks, give you a single token that is their private acknowledgement. Cole's token is a kelp-chew chewed but unswallowed. Mara's is a liar-fish, dried and salted, that will not rot. Reed's is a page from his trip-log that says only 'the tide held'. Brigh's is the original fold-weight he gave to his grandmother's memory — a thing he had sworn never to surrender." },
    { text: "Walk, after a week, to Elenne's chapel. Your title has changed in the chain-record regardless of ending. If RESTORE: you are 'Tidespeaker'. If PRESERVE: 'Reefwarden'. If WALK: 'the Eighth'." },
    { text: "Sail one last time to Stormcrown Reef, alone, at the next twin-moon. Whatever you chose, the reef will give you one wordless gift at this solo visit — a sea-foam cup Elenne has left on the seventh stone, which contains exactly enough tide-water to, once in your character's lifetime, un-do one wilderness death. Consume the cup only when you mean it." },
    { text: "Report to Cole once more. He will pour two drinks. He will say, after drinking, 'the harbour's yours when I retire. You know it is. We will not write it down.' Accept by nodding. Nothing else." },
  ],
  rewards: {
    qp: 5,
    xp: { magic: 95000, prayer: 80000, fishing: 60000, agility: 45000, hunter: 30000, herblore: 25000, crafting: 22000, runecrafting: 22000, hitpoints: 45000 },
    items: [{ id: 'sea_foam_cup', name: 'Sea-Foam Cup (tide-reserve)', count: 1 }],
    questPoints: 5,
  },
});
defineUnlock('the_twin_tide_reconciled', {
  name: "The Twin-Tide Reconciled",
  unlocks: [
    { type: 'teleport', id: 'stormcrown_shrine_teleport', description: 'Stormcrown Shrine Teleport — UNIQUE; teleports you to the hidden inner-spine shrine. Usable only at neap tides and twin-moons. Non-interchangeable with any other teleport.' },
    { type: 'item_equip', id: 'sea_foam_cup', description: 'Sea-Foam Cup (tide-reserve) — pocket; one-time use, revives you from wilderness death with no item-loss. Refills only at Elenne\'s chapel at twin-moon tides after a multi-year cooldown. Unique.' },
    { type: 'training_method', id: 'tide_walking', description: "Tide-Walking — traversal method that activates at full and new moons. Lets you walk offshore tiles (shallow sea only) without a boat. Does not carry into deep water, does not stop storms. Unique to this chain." },
    { type: 'spellbook', id: 'reef_priest_spellbook', description: "Reef Priest Spellbook — five spells: Stillwater (freeze surface-level water in a 5-tile radius for 20s), Tide-Signal (message any Saltbrine NPC instantly once per day), Storm-Parry (reduces storm-damage by 80% for one fight per week), Brine-Restore (heals hp equal to your prayer level from a tide-pool), Song-Echo (casts the reef-song's first verse for a defensive boss debuff). Non-interchangeable with any other spellbook." },
    { type: 'npc', id: 'elenne_speaks_freely', description: 'Elenne now speaks freely. She is, after the chain, no longer silent. Her presence is Saltbrine-permanent, no longer under mourning-discipline. Her role in future content depends on your chosen ending.' },
    { type: 'dialogue_flag', id: 'chose_tide_reconciled', description: "Your ending is permanent and affects downstream Saltbrine content forever. Restore, Preserve, and Walk each have distinct canon. Future Saltbrine/Wilds content uses this as a foundational branch point." },
  ],
  lore_notes: "This chain is the Saltbrine arc's metaphysical peer to the Alignment Beneath. The three endings are all canon in simultaneity — the world holds the branchings. The Walk ending is particularly unusual in that it ties the player-character to the shrine permanently, which has multiplayer-adjacent consequences (your character 'walks the spine' on a schedule visible to other players in Saltbrine's shrine sub-area).",
});

console.log('[v0.8-chain-3] Saltbrine Twin-Tide: 6 quests loaded');
