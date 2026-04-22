// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — v0.8 Chain 4: VEILWOOD MOONSONG (6 quests)
//
// Central narrative thread:
//   The Inkweald Muse has been missing a specific set of compositions — not
//   unfinished works, but finished works that went missing before the
//   Inkweald could absorb them. Seven moonsongs, composed over forty years
//   by a Veilwood lute-maker named Tarras Veil (died thirty years ago,
//   second cousin by elven reckoning to Fletcher Tarin), were burned by
//   Elder Druid Sael on the same winter solstice he first burned a letter
//   to Lyris. The burning was a theological mistake. The moonsongs were
//   not dangerous; they were, Sael privately realised within a month,
//   necessary.
//
//   The Veilwood must recover the seven moonsongs. Each has one surviving
//   witness — one partial singer, one listener, one mute instrument, one
//   animal who has held the melody in pattern, one dreamed rendition in
//   the Inkweald, one fragmentary score in the Boneyard archive (Aureth's
//   wing), and one — the seventh — that exists nowhere except in Sael's
//   own memory, which he has, for thirty years, refused to render.
//
//   The grandmaster is the seventh moonsong — and Sael's apology to Lyris,
//   carried through the song's singing. The chain unlocks a unique
//   musical-empowerment buff system (moonsong buffs) that no other content
//   can grant.
//
// Difficulty arc:
//   1. Novice       — The Whittler's Silent Lute
//   2. Intermediate — The Badger Who Remembers
//   3. Experienced  — The Burned Page in the Chapel
//   4. Experienced  — The Dream of the Fifth Moonsong
//   5. Master       — Aureth's Fragment Score
//   6. Grandmaster  — The Seventh Moonsong, Sung
//
// Globetrotting:
//   Veilwood, Heartlands (Dorin's chapel — Sael burned the letter there),
//   Inkweald (Yara, the Muse), Boneyard (Aureth's wing — chain-1 bleed),
//   Moryskah (the badger's warren), Saltbrine (the singer's granddaughter).
//
// Final reward (Grandmaster):
//   Unique moonsong buff spellbook — seven moonsongs grant distinct,
//   non-interchangeable buffs. Also: the apology carried, canon.
//
// NPC seeds: elder_druid_sael, ranger_lyris, fletcher_tarin,
// the_veilwood_whittler (in-canon carver), lucid_keeper_yara, the_inkweald_muse,
// the_hollow_choir_conductor (adversary for the seventh moonsong). New named
// NPC: Tarras Veil (lute-maker, dead thirty years; appears in dreamed form).
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
// 1. THE WHITTLER'S SILENT LUTE — novice (~30 min)
//    Seed: Veilwood whittler (in-canon NPC from quirky-interactions/veilwood
//    content). A lute made by Tarras Veil thirty-two years ago has arrived
//    at the whittler's bench. The whittler cannot, for the first time in
//    his craft, find the body's voice. Investigate.
// ══════════════════════════════════════════════════════════════════════════════
quests.define('the_whittlers_silent_lute', {
  name: "The Whittler's Silent Lute",
  description: "A battered lute has come to the Veilwood whittler's bench. The lute is Tarras Veil's — a maker whose signature is a small wooden bird carved into the heel, visible only with the right angle of firelight. The whittler cannot find the lute's voice. He has tuned it, restrung it, re-braced it. The lute refuses to ring. He suspects the lute is holding a memory instead of a note. He asks, in Veilwood fashion — not as a question — whether you would listen.",
  difficulty: 'Novice', questPoints: 1,
  requirements: { skills: { crafting: 25, magic: 20, fletching: 18 } },
  steps: [
    { text: "Travel to the Veilwood whittler's bench, high in the canopy. Present yourself to the whittler. Do not carry any weapon — the canopy platform refuses weapon-bearers for this errand." },
    { text: "Accept the silent lute. Examine the heel for the wooden-bird signature (Crafting 25). The bird is there, and it has a second, smaller carving inside its beak — a glyph neither Heartlands nor Veilwood. The whittler has not noticed this inner carving." },
    { text: "Copy the glyph carefully (Fletching 18, using a small stub of chalk the whittler gives you). Do not press too hard; the wood remembers." },
    { text: "Ask Fletcher Tarin at the Veilwood gate whether his cousin Tarras Veil left any instruments behind. Tarin will say, carefully, that seven lutes were made in Tarras's last decade and that four were accounted for. The whittler's is the fifth. Two remain missing." },
    { text: "Return to the whittler with Tarin's count. The whittler will, after a long pause, tell you that the glyph inside the bird's beak is a musical rest — a silent measure before a song begins. The lute is waiting for the song that was never sung on it." },
    { text: "Ask the whittler to whom Tarras most often brought his completed lutes. He will name Tarras's patron: Elder Druid Sael. He will not volunteer why Sael is a painful name; observe but do not ask." },
    { text: "Place the lute on the whittler's bench under the west skylight. Magic 20 to coax the lute to ring a single note at full moonlight. The note will be short, clear, and a key the whittler does not have in his tuning kit — it is a Veilwood lute-maker's dead key." },
    { text: "The whittler will give you the lute on loan. Do not tune it. Do not restring it. Carry it on your back without striking anything. The lute is yours, in trust, for the duration of the chain." },
  ],
  rewards: {
    qp: 1,
    xp: { crafting: 2200, magic: 1500, fletching: 1100 },
    items: [{ id: 'tarras_silent_lute', name: "Tarras Veil's Silent Lute", count: 1 }],
    questPoints: 1,
    unlocks: ["item_unlock:carries_tarras_lute", "item_unlock:tarras_silent_lute", "npc:whittler_partial_trust"],
  },
});
defineUnlock('the_whittlers_silent_lute', {
  name: "The Whittler's Silent Lute",
  unlocks: [
    { type: 'item_equip', id: 'tarras_silent_lute', description: "Tarras Veil's Silent Lute — off-hand / pocket; held only during this chain. As you recover moonsongs, the lute learns them. At chain's end it gains its voice permanently. Non-tradeable." },
    { type: 'dialogue_flag', id: 'carries_tarras_lute', description: 'You carry the lute. NPCs who knew Tarras will recognise it and, in rare exchanges, hum a fragment of a song at you.' },
    { type: 'npc', id: 'whittler_partial_trust', description: 'The Veilwood whittler will, from this quest on, accept wood-trade at fair value. He previously accepted only by introduction.' },
  ],
  lore_notes: "Tarras Veil was a Veilwood lute-maker with seven final compositions — the seven moonsongs — each tuned for one specific lute. Six of the seven lutes are accounted for, variously. The seventh is the one Sael has been hiding. The silent-lute is the fifth; its moonsong is the fifth moonsong, held by Yara's Inkweald dream.",
});

// ══════════════════════════════════════════════════════════════════════════════
// 2. THE BADGER WHO REMEMBERS — intermediate (~70 min)
//    Seed: mirelda_bog_witch. Tarras visited Moryskah exactly once, to
//    play the second moonsong for an audience of three: Mirelda, a bog
//    witch's apprentice since passed, and a badger who was Mirelda's
//    companion at the time. Mirelda has forgotten the tune. The badger
//    is still alive.
// ══════════════════════════════════════════════════════════════════════════════
quests.define('the_badger_who_remembers', {
  name: "The Badger Who Remembers",
  description: "Tarras Veil played the second moonsong to an audience of three in a Moryskah stilt-house thirty-one years ago. Two of the three are dead. The third — a badger Mirelda named Stub — is very old, nearly blind, and still alive in a warren at the northern bog's edge. Badgers remember in patterns. You must find Stub, observe the pattern, translate it back into the song, and bring the song to Mirelda to confirm.",
  difficulty: 'Intermediate', questPoints: 2,
  requirements: { skills: { hunter: 45, magic: 40, herblore: 40, agility: 35 }, quests: ['the_whittlers_silent_lute', 'the_bog_witchs_errand'] },
  steps: [
    { text: "Visit Mirelda at her stilt-house. Do not ask directly about Tarras or the song. Ask about Stub. She will, without softening, tell you where the warren is and that Stub will not come to you. You will have to wait on him." },
    { text: "Travel to the warren. Bring a lamp of moryskah-mint (Herblore 40 to mix the oil) — not any other light. The mint is what Stub remembers as safe." },
    { text: "Sit at the warren's outer rim at dusk. Do not sleep. Do not speak. Wait five in-game hours (Hunter 45 to read the badger's movement patterns without disturbing them). Stub will emerge on the fourth hour if your light is correct." },
    { text: "Observe Stub's digging pattern. Badgers dig in meaningful sequences when remembering — a warren-badger who was present at a musical event will, in age, replay the event's rhythm in their digging. Record the rhythm on a wax tablet (Agility 35 to stay still while writing)." },
    { text: "The rhythm is, by itself, not a melody — it is only the beat. You need a pitch. For that you must lean your silent lute against the warren's outer wall, which will, at the badger's next dig, hum in sympathy (Magic 40 to coax the sympathetic ring). Copy the sympathetic note together with the rhythm. That pairing is the second moonsong's main phrase." },
    { text: "Return to Mirelda with the main phrase. Play it for her on a simple flute (she will lend you one). She will, on hearing it, frown once, then nod. She will hum a countermelody she did not know she remembered until she heard you play." },
    { text: "The lute on your back will, without being played, vibrate at the melody. Mirelda will notice. She will ask how you got the lute. Say only 'the whittler'. She will say 'good' once. She will not ask again." },
    { text: "Travel back to the Veilwood whittler. Present the melody (not the countermelody — keep that in your memory). The whittler will engrave the melody's first two bars onto the inside of the lute's upper brace. The lute has now learned one moonsong." },
  ],
  rewards: {
    qp: 2,
    xp: { hunter: 5500, magic: 4200, herblore: 3800, agility: 3200 },
    items: [{ id: 'second_moonsong_melody', name: 'Second Moonsong (melody memorised)', count: 1 }],
    questPoints: 2,
    unlocks: ["item_unlock:second_moonsong_melody", "npc:stub_trusts_you", "training_method:warren_listening_hunter"],
  },
});
defineUnlock('the_badger_who_remembers', {
  name: "The Badger Who Remembers",
  unlocks: [
    { type: 'item_equip', id: 'second_moonsong_melody', description: 'Second Moonsong (melody memorised) — pocket; grants a passive Herblore XP buff (+3% in Moryskah) while carried. Combines with other moonsongs in the grandmaster.' },
    { type: 'training_method', id: 'warren_listening_hunter', description: 'Warren-Listening — hunter training method at the badger warren, observes rhythm-patterns. High attention, medium XP, produces warren-residue reagent for herblore.' },
    { type: 'npc', id: 'stub_trusts_you', description: 'Stub will, from now on, emerge at your arrival without waiting. He will lead you to other warrens if you bring mint-oil.' },
  ],
  lore_notes: "The Veilwood moonsongs are a sevenfold composition; each carries a specific worldly affect when played on Tarras's lute. The second is Moryskah-themed and offers herbal potency in its area. Each subsequent recovered moonsong adds its area's affect.",
});

// ══════════════════════════════════════════════════════════════════════════════
// 3. THE BURNED PAGE IN THE CHAPEL — experienced (~90 min)
//    Seed: father_dorin + elder_druid_sael. On the same winter solstice
//    Sael burned the moonsongs, he also burned (for the first time) a
//    letter to Lyris in Dorin's chapel firepit. The chapel's firepit
//    preserves burned things, occasionally, in the ash. Find the
//    remaining first-moonsong fragment in the ash.
// ══════════════════════════════════════════════════════════════════════════════
quests.define('the_burned_page_in_the_chapel', {
  name: "The Burned Page in the Chapel",
  description: "On the winter solstice thirty years ago, Elder Druid Sael travelled to Father Dorin's Chapel of the Last Light to burn two things: a letter he had written to Ranger Lyris, and the seven moonsongs Tarras Veil had entrusted to him. Dorin, who did not know what was burning, provided the firepit. The chapel firepit sometimes preserves — Dorin has long suspected — a trace of what it has consumed. The first moonsong's trace, if anywhere, is in that ash.",
  difficulty: 'Experienced', questPoints: 3,
  requirements: { skills: { prayer: 55, magic: 55, thieving: 45, herblore: 45, crafting: 40 }, quests: ['the_badger_who_remembers'] },
  steps: [
    { text: "Visit Father Dorin at the chapel. Ask, courteously, whether he has retained the ash from the winter solstice thirty years ago. He will, after a long moment, nod. The ash is kept — not for preservation, but because Dorin has never felt he had the right to remove it." },
    { text: "Dorin will lead you to the chapel's underfloor ash-bin. The bin has not been opened in twenty-one years. It will not open without a blessing (Prayer 55). Dorin will perform the blessing with you — the chapel's rules require two voices for an old bin." },
    { text: "Inside the bin are forty years of ashes. The relevant year's ash is midway down. You must lift it out without disturbing the upper layers. Magic 55 to separate by lifting charm." },
    { text: "Sift the year's ash (Herblore 45 for the botanical sorting — moonsong parchment was elf-paper, a mix of reed-pulp and a specific Veilwood leaf). A small unburnt fragment — a single bar of notation — will rise to the top. This is the first moonsong's opening bar." },
    { text: "Dorin will ask, quietly, whether Sael also burned a letter that night. Answer honestly that you believe so. Dorin will, for the first time in thirty years, say that he read a single line of the letter before Sael arrived — it was face-up on the pew for twelve seconds. The line is: 'I was wrong about the sapling'. Dorin has never told anyone else." },
    { text: "Carry the fragment and the line to Fletcher Tarin (not to Sael — not yet). Tarin will recognise the fragment — it is his cousin's handwriting on elf-paper. He will also recognise the line, which is the line Lyris has been privately waiting to hear from Sael for eighty years. Tarin will not, however, deliver either to Lyris; the delivery is not his." },
    { text: "Return to the whittler. Show him the fragment. He will engrave it onto the lute's lower brace (Crafting 40). The lute now carries two moonsongs — the second on the upper, the first on the lower." },
    { text: "Leave the chapel's year-ash resealed. Dorin will handle the blessing to close. Do not take any other year's ash. The chapel trusts you now. Do not exploit the trust." },
    { text: "Thieving 45 check — you will, on the way out of the chapel, notice a second fragment sticking partway through the bin-lid. Decide: leave it (the chapel judges that the line is not yet ready to be read) or pocket it (it will prove, later, useful — but Dorin trusted you). The ending branches this choice follows into the grandmaster." },
  ],
  rewards: {
    qp: 3,
    xp: { prayer: 11000, magic: 10000, thieving: 7000, herblore: 7500, crafting: 4500 },
    items: [{ id: 'first_moonsong_fragment', name: 'First Moonsong (opening bar)', count: 1 }],
    questPoints: 3,
    unlocks: ["item_unlock:first_moonsong_fragment", "item_unlock:read_saels_burn_line", "npc:dorin_ash_keeper_trust", "training_method:chapel_ash_sifting_herblore"],
  },
});
defineUnlock('the_burned_page_in_the_chapel', {
  name: "The Burned Page in the Chapel",
  unlocks: [
    { type: 'item_equip', id: 'first_moonsong_fragment', description: 'First Moonsong (opening bar) — pocket; grants a Prayer XP buff (+3% in the Heartlands) while carried. Combines with other moonsongs in the grandmaster.' },
    { type: 'dialogue_flag', id: 'read_saels_burn_line', description: "You know the line Sael wrote to Lyris. This line will be referenced in the grandmaster. If you pocketed the second fragment (betraying Dorin's trust), that also branches the ending." },
    { type: 'npc', id: 'dorin_ash_keeper_trust', description: 'Dorin will now let you perform the blessing on any old bin in the chapel alone. No other NPC has this standing.' },
    { type: 'training_method', id: 'chapel_ash_sifting_herblore', description: 'Chapel Ash-Sifting — herblore method at the chapel bin, low yield, high theological reputation gain. Reputation matters for Prayer tier training.' },
  ],
  lore_notes: "The 'I was wrong about the sapling' line is the apology Sael has never delivered. The chain is, in one reading, an elaborate route for that apology to land — without Sael having to say it as himself. The grandmaster is where the land happens.",
});

// ══════════════════════════════════════════════════════════════════════════════
// 4. THE DREAM OF THE FIFTH MOONSONG — experienced (~2 hours)
//    Seed: lucid_keeper_yara + the_inkweald_muse. The fifth moonsong
//    has survived only as a dreamed rendition in the Inkweald. To hear
//    it you must enter the dream — lucidly, with Yara's ward, under the
//    Muse's cooperation. The Muse will, if the player has met her
//    correctly, give the dreamed rendition back.
// ══════════════════════════════════════════════════════════════════════════════
quests.define('the_dream_of_the_fifth_moonsong', {
  name: "The Dream of the Fifth Moonsong",
  description: "The fifth of Tarras Veil's moonsongs was never played aloud by its composer. He dreamed it, once, in the Inkweald, and the Inkweald absorbed it. The Muse holds the rendition. Lucid Keeper Yara will allow you to enter the dream in controlled conditions, with specific wards, and only if the Muse has not been signed. If you signed the Muse in The Draft Signature, that choice is folded in here — the rendition is lost to you. If you did not sign, the rendition is available but the Muse will demand a careful exchange.",
  difficulty: 'Experienced', questPoints: 3,
  requirements: {
    skills: { magic: 65, prayer: 58, herblore: 55, crafting: 50, agility: 50 },
    quests: ['the_burned_page_in_the_chapel', 'the_inkweald_door', 'the_draft_signature'],
  },
  steps: [
    { text: "Visit Yara at the dream-shore. Carry the silent lute. Yara will, without your asking, tell you that the lute has two moonsongs carved on it — she can see them in the longer thought." },
    { text: "Yara will offer you a small vial of dream-sap. Crafting 50 to seal it into a lucid-ward amulet. Wear the amulet before crossing the shore — it binds your wakefulness to your waking self while your dream-self listens to the Muse." },
    { text: "Cross the shore. Walk the dream-path. At the first grove, do not speak. At the second grove, a dreamed version of Tarras Veil will be walking away from you. Do not call out. Follow, at twenty paces, to the third grove." },
    { text: "At the third grove, the Muse will be present. If you SIGNED the Muse in The Draft Signature, she will greet you with 'the composition is finished — there is no rendition to give'. The quest ends here with partial credit and the fifth moonsong is lost for this playthrough. Proceed to the epilogue steps only." },
    { text: "If you did NOT sign the Muse (left the quill or partial), she will, after a measure, offer to play the fifth moonsong on a single condition: you must, in return, give her the countermelody Mirelda hummed that does not appear on the wax tablet (Magic 65 to render the countermelody audibly in the dream-space)." },
    { text: "Accept the exchange — or refuse. Refusing ends the quest at partial credit. Accepting: hum the countermelody. The Muse will weave it into the fifth moonsong. The combined piece will, for approximately seven minutes in the dream, be the most complete thing in Aelgard's memory." },
    { text: "At the seventh minute, the Muse will release the rendition. Carry it out of the dream by carrying the lute — the lute will hold it, temporarily, during your return (Herblore 55 for a dream-stabiliser tea Yara will brew before your return; Agility 50 to walk out without stumbling)." },
    { text: "Return to the whittler. The whittler will engrave the fifth moonsong onto the lute's central brace. The lute has now learned three moonsongs — first (lower), second (upper), fifth (central)." },
    { text: "Visit Yara on your return. She will not ask whether you signed or did not sign. She will, however, know. She will say 'the longer thought is not shorter today'. Accept this as farewell. Leave." },
    { text: "EPILOGUE (if Muse was previously SIGNED): Yara will give you, separately, a written transcription of the fifth moonsong that she copied from the Muse before the signing. It is incomplete — missing the countermelody. The chain's grandmaster, if you pursue it, will compensate with a different fifth-moonsong variant." },
  ],
  rewards: {
    qp: 3,
    xp: { magic: 13000, prayer: 9000, herblore: 8000, crafting: 6500, agility: 6000 },
    items: [{ id: 'fifth_moonsong_dreamed', name: 'Fifth Moonsong (dreamed or transcribed)', count: 1 }],
    questPoints: 3,
    unlocks: ["item_unlock:fifth_moonsong_dreamed", "item_unlock:heard_fifth_moonsong", "npc:yara_full_trust", "training_method:lucid_dreaming_magic"],
  },
});
defineUnlock('the_dream_of_the_fifth_moonsong', {
  name: "The Dream of the Fifth Moonsong",
  unlocks: [
    { type: 'item_equip', id: 'fifth_moonsong_dreamed', description: 'Fifth Moonsong — pocket; grants a Magic XP buff (+3% in Inkweald/Veilwood) while carried. State (dreamed vs transcribed) affects the grandmaster ending quality.' },
    { type: 'dialogue_flag', id: 'heard_fifth_moonsong', description: 'You have heard the fifth moonsong (in whichever form). This unlocks a unique Yara line and a unique Muse line in future chain content.' },
    { type: 'npc', id: 'yara_full_trust', description: 'Yara will, from this quest on, teach you one dream-magic spell per in-game season. Her trust is earned permanently.' },
    { type: 'training_method', id: 'lucid_dreaming_magic', description: 'Lucid Dreaming — magic method at the dream-shore; requires the ward amulet. High attention, mid-high XP, occasional dreamed reagent drops.' },
  ],
  lore_notes: "Tarras Veil dreamed the fifth moonsong while grieving his first student's death. The countermelody — held by Mirelda — is a Moryskah lullaby. The two together form a Veilwood-Moryskah synthesis that is theologically remarkable, which is part of why Sael burned the moonsongs: not because they were dangerous, but because they proposed a kinship Sael was not yet ready to affirm.",
});

// ══════════════════════════════════════════════════════════════════════════════
// 5. AURETH'S FRAGMENT SCORE — master (~3 hours)
//    Seed: Keeper Aureth (chain-1 bleed) + archaeologist_veris. The third,
//    fourth, and sixth moonsongs are recorded as fragmentary scores in
//    Keeper Aureth's pre-Crown archive — a pre-Euthren era cantorial
//    manuscript that predates Tarras Veil by seven centuries, but which
//    Tarras somehow recovered and incorporated. Retrieve the three
//    fragments. Three quests' worth of moonsong content, compressed into
//    a single master.
// ══════════════════════════════════════════════════════════════════════════════
quests.define('aureths_fragment_score', {
  name: "Aureth's Fragment Score",
  description: "Three of Tarras Veil's seven moonsongs — the third, fourth, and sixth — are, unaccountably, recorded in Keeper Aureth's pre-Crown archive on a cantorial manuscript that predates Tarras by seven centuries. Tarras must have, at some point, entered the archive and retrieved the fragments. No living being knows how. You, who have completed Keeper Aureth's Seal, can re-enter in Euthren or via your chosen ending. Retrieve the three fragments.",
  difficulty: 'Master', questPoints: 4,
  requirements: {
    skills: { magic: 75, thieving: 70, prayer: 65, crafting: 62, herblore: 60, runecrafting: 60 },
    quests: ['the_dream_of_the_fifth_moonsong', 'keeper_aureths_seal'],
  },
  steps: [
    { text: "Prepare for archive entry. If your chain-1 ending was SEAL (sealed deeper), wait until the next in-game Euthren. If FREE, request Aureth's company for the visit. If TAKE HER PLACE — your own character holds the archive; you visit yourself, which is a unique solo loop (Magic 75 to not destabilise the loop)." },
    { text: "At the archive's ninth corridor (not reached in the grandmaster chain-1 quest), a cantorial manuscript is shelved behind a waxed curtain. The wax is Aureth's signature seal. Removing the curtain is a Prayer 65 courtesy; forcing it is a Thieving 70 and incurs an ending-penalty." },
    { text: "Copy the manuscript's third-moonsong fragment onto pressure-paper (Crafting 62). The fragment is a Sootworks-themed melody, which is historically impossible — the Sootworks' deep foundries did not exist seven centuries ago. Veris, in her marginalia, has written 'this is the question'." },
    { text: "Copy the fourth-moonsong fragment. It is a Glass Desert-themed melody, and the harmonic intervals match Azhmari Sand Prince incantation patterns. Runecrafting 60 to read the glyph-notation." },
    { text: "Copy the sixth-moonsong fragment. It is a Saltbrine-themed melody, and it is, without question, a Stormcrown reef-song. This is the chain-3 bleed — the reef-song you memorised in The Twin-Tide. Compare the fragments to your memory; they match." },
    { text: "Before leaving the archive, Aureth (or your own loop-self) will say one thing: 'Tarras visited in the year he died. He sang the seventh moonsong here. He did not take that one with him.' This is the first confirmation that the seventh moonsong was never lost — it was left." },
    { text: "Return via Razak to the Veilwood whittler's bench. Present the three fragments in order. The whittler will engrave them on the lute's side-braces (Herblore 60 for a wood-stabiliser poultice so the carving does not split the side)." },
    { text: "The lute now carries six moonsongs. The seventh is missing. The lute, for the first time, will ring without being played — a single held note, at full moonlight, lasting seventeen seconds." },
    { text: "Visit Yara. Show her the six-moonsong lute. She will, without speaking, walk you into the dream-shore and back out in a single breath. You will emerge holding a single note — the tonic of the seventh moonsong — but not its melody." },
    { text: "Visit the Hermit at the Old Sun shrine. The Hermit will close one eye. They will say 'the seventh is in a keeper who is still living'. They will not name the keeper. You will know: it is Sael." },
  ],
  rewards: {
    qp: 4,
    xp: { magic: 30000, thieving: 22000, prayer: 18000, crafting: 14000, herblore: 13000, runecrafting: 12000 },
    items: [{ id: 'six_moonsong_lute', name: 'Six-Moonsong Lute (chain-bound)', count: 1 }],
    questPoints: 4,
    unlocks: ["item_unlock:knows_seventh_is_with_sael", "item_unlock:six_moonsong_lute", "npc:aureth_musical_confidante", "training_method:archive_cantorial_transcription"],
  },
});
defineUnlock('aureths_fragment_score', {
  name: "Aureth's Fragment Score",
  unlocks: [
    { type: 'item_equip', id: 'six_moonsong_lute', description: 'Six-Moonsong Lute (chain-bound) — Tarras\'s silent lute, now holding six of seven moonsongs. Passive buff: +3% XP in any of the six regions the moonsongs were found. Seventh moonsong required for full effect.' },
    { type: 'training_method', id: 'archive_cantorial_transcription', description: 'Archive Cantorial Transcription — magic training method in Aureth\'s archive, requires chain-1 completion. Grants manuscript reagents that feed into Runecrafting unique tiers.' },
    { type: 'dialogue_flag', id: 'knows_seventh_is_with_sael', description: 'You know the seventh moonsong is with Sael. This line unlocks the grandmaster quest.' },
    { type: 'npc', id: 'aureth_musical_confidante', description: "Aureth (or your loop-self, per chain-1 ending) will correspond with you on musical-archival matters, once per in-game month." },
  ],
  lore_notes: "Tarras visited the archive in his final year, at Aureth's invitation — or at her loop's invitation; the timing is impossible but the archive's temporal physics permits it. The seventh moonsong was not archived because Tarras intended it to be played once, in public, by Sael. Sael was not ready. The moonsong remained in Sael's memory.",
});

// ══════════════════════════════════════════════════════════════════════════════
// 6. THE SEVENTH MOONSONG, SUNG — grandmaster, 14-stage, 5+ hour
//    Seed: elder_druid_sael + ranger_lyris + the_inkweald_muse + the
//    Hollow Choir's Conductor (adversary). Sael must sing the seventh
//    moonsong aloud — the apology to Lyris he has never delivered, the
//    composition Tarras Veil left for him to render. The Hollow Choir
//    Conductor will attempt to claim the seventh moonsong as the
//    missing voice for his own hollow symphony. You must contest the
//    claim.
// ══════════════════════════════════════════════════════════════════════════════
quests.define('the_seventh_moonsong_sung', {
  name: "The Seventh Moonsong, Sung",
  description: "Six moonsongs are on the lute. The seventh is in Elder Druid Sael's memory, unrendered for thirty years. Sael has been, privately, waiting to be asked — not to apologise, but to sing. The Hollow Choir Conductor, meanwhile, has realised the seventh moonsong is the missing voice his three-century symphony requires, and he will send the choir to claim it on the night the lute is readied. The rendition will happen in the Veilwood canopy, at full moon, with Lyris present, with Fletcher Tarin as witness, and with the Conductor's choir contested at the grove's edge. You, carrying the lute, decide whose song gets sung first and whose gets finished.",
  difficulty: 'Grandmaster', questPoints: 5,
  requirements: {
    skills: { magic: 92, prayer: 85, attack: 78, defence: 78, ranged: 78, agility: 80, crafting: 75, herblore: 70, fletching: 70, runecrafting: 70, hitpoints: 92 },
    quests: ['aureths_fragment_score', 'the_draft_signature', 'the_inkweald_grandmaster_dream'],
    combat_level: 115,
    items_brought: [
      'tarras_silent_lute',
      'first_moonsong_fragment',
      'second_moonsong_melody',
      'fifth_moonsong_dreamed',
      'six_moonsong_lute',
      'old_sun_sigil',
    ],
  },
  steps: [
    { text: "Approach Elder Druid Sael at the inner sanctum oak. Do not present the six-moonsong lute directly. Present, first, the first-moonsong fragment from Dorin's chapel ash. Sael will, on seeing it, close his eyes for a full minute. Wait." },
    { text: "Sael will then tell you, without prompting, the line Dorin read off the pew: 'I was wrong about the sapling'. If you carried that line as dialogue flag, he will continue. If not, he will ask whether you will permit him to dictate it aloud now; accept." },
    { text: "Sael will ask for the lute. Present it. He will, for the first time in thirty years, hold a Tarras Veil lute. He will ask, 'does it have six'. Say 'yes, Elder'. He will nod once. He will then say, 'I can sing a seventh. I will sing it once'." },
    { text: "Travel with Sael to the canopy outpost — the first time he has been here in eighty years. Lyris will be at the rail. Do not rehearse with Sael on the way. He will not need rehearsal." },
    { text: "Fletcher Tarin arrives by silent elven courtesy. He carries a small token — the wooden-bird signature carved by Tarras on a spare brace, never used. He places it on the rail between Sael and Lyris without speaking." },
    { text: "At the rail, Sael will begin to sing the seventh moonsong. The lute will play itself. The six carved moonsongs will rise in sympathetic harmony. Magic 92 to hold the polyphony stable; Prayer 85 to keep the canopy's permission steady." },
    { text: "On the third verse, the Hollow Choir's Conductor will arrive at the grove's edge with his choir (Inkweald boss-tier adversaries). The Conductor will demand the seventh moonsong as the missing voice. Sael will not stop singing. You must defend the grove — not by killing the choir (they cannot be killed; they are dreamed), but by singing back." },
    { text: "Combat-adjacent phase. You must hold the grove's perimeter for the duration of Sael's song. Attack 78 / Defence 78 / Ranged 78 for physical defense; Magic 92 to render counter-verses; Agility 80 to move between four canopy platforms. The choir has four pressure points, each platform. Hold each for ninety seconds." },
    { text: "At the mid-song, the Muse will appear — from the Inkweald side — and will address the Conductor directly. If you did not sign the Muse, she will refuse the Conductor's claim; the choir will recede at her word. If you did sign the Muse, she is the Conductor's ally now, and you must defeat the claim by a different path — presenting Yara's transcription (the alternate fifth moonsong) as a substitute voice. This is the second ending branch." },
    { text: "Sael's song reaches the seventh verse. Lyris has, during the song, placed her palm on Sael's forearm — the first contact between them in eighty years. Sael does not turn his head. He finishes the song. The lute rings for seven seconds after his last word and goes silent." },
    { text: "The Conductor will recede — either at the Muse's word or at the substitute's acceptance. The choir will disperse back into the Inkweald. The canopy is quiet. Lyris will, after a long pause, speak three words to Sael: 'the canopy remembers'. Sael will nod once." },
    { text: "Sael will hand the lute back to you. The lute has, now, learned the seventh moonsong permanently. It has a voice. Its strings ring without being played, lightly, whenever you pass a grove where any of the seven regional moonsongs are sung." },
    { text: "Decide. (1) GIFT — you give the lute back to the Veilwood whittler; it becomes a permanent shrine-instrument, playable by anyone who completes the chain after you. No personal benefit, but the chain's moonsong buff system becomes semi-public. (2) KEEP — you keep the lute; its buffs are yours alone, exclusively and non-tradeably, for the rest of your character's play. (3) BURY — you bury the lute at Tarras Veil's unmarked grave in the Veilwood; the buffs dissolve into the Veilwood's canopy, granting every Veilwood visitor a small ambient XP bonus while in that region. Non-personal, region-wide." },
    { text: "Return to the whittler with your choice. He will, whichever you chose, nod. He will then, for the first time in your acquaintance, hum — and the hum is, unmistakably, a fragment of a new moonsong. Tarras Veil had eight. The eighth is for a future chain." },
  ],
  rewards: {
    qp: 5,
    xp: { magic: 100000, prayer: 60000, attack: 25000, defence: 25000, ranged: 25000, agility: 30000, crafting: 22000, herblore: 18000, fletching: 18000, runecrafting: 20000, hitpoints: 45000 },
    items: [{ id: 'moonsong_lute_rendered', name: 'Moonsong Lute (Rendered)', count: 1 }],
    questPoints: 5,
    unlocks: ["area:veilwood_canopy_outpost_sael_visits", "item_unlock:moonsong_lute_rendered", "item_unlock:seventh_moonsong_ending_chosen", "npc:sael_apology_delivered", "spell_unlock:moonsong_buff_system"],
  },
});
defineUnlock('the_seventh_moonsong_sung', {
  name: "The Seventh Moonsong, Sung",
  unlocks: [
    { type: 'spellbook', id: 'moonsong_buff_system', description: "Moonsong Buff System — UNIQUE non-interchangeable buff set. Each of the seven moonsongs grants a distinct buff when the lute is struck at its native region: (1) First (Heartlands) — Prayer XP +5% for 30 min; (2) Second (Moryskah) — Herblore +5%; (3) Third (Sootworks) — Smithing +5%; (4) Fourth (Glass Desert) — Runecrafting +5%; (5) Fifth (Inkweald/Veilwood) — Magic +5%; (6) Sixth (Saltbrine) — Fishing +5%; (7) Seventh (Veilwood canopy) — grants a one-time 'apology heard' emote that only activates during the Veilwood/Inkweald grandmaster content. Stacks with moonsong-specific training methods." },
    { type: 'item_equip', id: 'moonsong_lute_rendered', description: 'Moonsong Lute (Rendered) — off-hand; if you chose KEEP, bound to you. If GIFT, accessible at the whittler for any chain-completed player (including your alts). If BURY, absent but region-effect active. Unique to this chain, chosen ending.' },
    { type: 'npc', id: 'sael_apology_delivered', description: "Elder Druid Sael has, by singing, apologised. Future Veilwood content will treat Sael and Lyris as reconciled. Sael's winter-solstice letter-burning will stop." },
    { type: 'area', id: 'veilwood_canopy_outpost_sael_visits', description: 'The canopy outpost will, from this chain on, receive Sael once a year at winter solstice. He will sit with Lyris on the rail without speaking. The outpost gains a small ambient XP buff on that single day.' },
    { type: 'dialogue_flag', id: 'seventh_moonsong_ending_chosen', description: 'Your ending (GIFT / KEEP / BURY) is permanent and affects future Veilwood/Inkweald content. All three are canon.' },
  ],
  lore_notes: "This grandmaster is the delivery vehicle for a thirty-year-overdue apology. It is also the only way in Aelgard to obtain the moonsong buff system. The eighth moonsong hinted at in the final step is a deliberate future-content hook for a subsequent wave; no existing content references it yet.",
});

console.log('[v0.8-chain-4] Veilwood Moonsong: 6 quests loaded');
