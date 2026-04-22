// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Burn Wave 3 Quests (Part 2 — quests 8 through 14)
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
// 8. WALK WIDE, GUEST  — intermediate, reagent hunt (~60 min)
//    Seed: razak. Secret: miscounted water on the lost caravan. Quest: the
//    family of one of the lost caravan has arrived. They want closure.
//    Razak cannot guide them personally; he is afraid of the conversation.
// ══════════════════════════════════════════════════════════════════════════════
quests.define('walk_wide_guest', {
  name: "Walk Wide, Guest",
  description: "A Heartlands woman has arrived at Razak's caravan post carrying a child's hair ribbon and a polite request to be taken to the place where her brother died. Razak will not, himself, take her. He will send you, with a full skin of water and an exact list of things you must bring and an exact number of words he will let you say to her on the road.",
  difficulty: 'Intermediate', questPoints: 2,
  requirements: { skills: { agility: 45, cooking: 35, thieving: 25, hunter: 30 }, quests: ['sand_and_secrets'] },
  steps: [
    { text: "At Razak's caravan post in the Boneyard, accept the water-skin. Do not thank him yet. He considers the thanks premature." },
    { text: "Collect the laundry list in order, without substitutions: one waxed wheel of Heartlands bread, one jar of Saltbrine salt (not Sootworks salt, which he hates), one folded Veilwood shade-cloth, one paper-wrapped dried persimmon (the woman's favourite as a child, her brother told Razak once), three sheets of fig-leaf for wrapping the ribbon if the wind turns." },
    { text: "Meet the sister at the Heartlands-Boneyard border at dawn. She will be carrying no luggage, only the ribbon. Do not ask about the ribbon." },
    { text: "Walk the old caravan track, which Razak will not walk. The track crosses the Boneyard's dry wadi three times. Mark each crossing with a cairn (Agility 45 to lift the stones)." },
    { text: "At the second crossing, a sand-wraith will surface. It remembers the caravan. Give it no water, no salt, and no words. Walk past. If you speak, you will have to walk back." },
    { text: "At the place where the caravan ended — Razak has marked it on a piece of bone — lay out the six items. Let the sister do the order herself. Do not direct her." },
    { text: "Wait with her as long as she waits. She will not cry in front of you. She will whisper the ribbon's colour to the sand, which is the only word Razak permitted you to hear without participating." },
    { text: "Walk her back. At the first crossing, if the sand-wraith is still there, it will give you one thing — a single grain of glass that was the brother's pocket marble. Bring it to Razak without mentioning it to the sister." },
    { text: "Razak will count his water-skins twice in front of you. He will count them twice again. He will nod, once." },
  ],
  rewards: {
    qp: 2,
    xp: { agility: 6500, cooking: 2500, thieving: 2000, hunter: 3000 },
    items: [{ id: 'brothers_glass_marble', name: "Brother's Glass Marble", count: 1 }],
    questPoints: 2,
    unlocks: ["area:boneyard_old_caravan_track", "item_unlock:brothers_glass_marble", "npc:razak_counts_you_in"],
  },
});
defineUnlock('walk_wide_guest', {
  name: "Walk Wide, Guest",
  unlocks: [
    { type: 'item_equip', id: 'brothers_glass_marble', description: "Brother's Glass Marble — pocket; sandstorms and heat-effects do -50% damage to you while you hold it. Non-tradeable. Placed in bank, the protection ends." },
    { type: 'area', id: 'boneyard_old_caravan_track', description: 'Old Caravan Track — a pre-marked route with permanent respawn points for desert herbs and sand-wraiths. Only players who have walked the sister can navigate it without taking damage.' },
    { type: 'npc', id: 'razak_counts_you_in', description: 'Razak will now sell wind-knowledge at the fair price — cuts travel time across the Boneyard by 30% for your account.' },
  ],
  lore_notes: "The lost caravan is Razak's private shame. This quest does not cure it. It only lets him meet, once, the family he has avoided for thirty-eight years. Later Boneyard content builds on this. Do not let the player learn the water-count secret here; that is reserved for the Hermit's post-game riddles.",
});

// ══════════════════════════════════════════════════════════════════════════════
// 9. THE SECOND QUESTION  — grandmaster, 15-stage, 5+ hour, reagent hunt
//    Seed: hermit_of_the_old_sun. Secret: the Old Sun is the moon. The
//    player must be the first seeker in eight years to ask the right second
//    question — AND survive the answer. Globetrots 6 regions.
// ══════════════════════════════════════════════════════════════════════════════
quests.define('the_second_question', {
  name: "The Second Question",
  description: "The Hermit of the Old Sun has been at the Old Sun shrine, by Razak's count, forty-one years. The Hermit's first question is asked by every seeker. The Hermit's second question is not. If you have read enough, walked enough, lost enough, the second question will come to you uninvited, at dusk, six days deeper than the Pyramid — and the Old Sun will know.",
  difficulty: 'Grandmaster', questPoints: 5,
  requirements: {
    skills: { magic: 85, prayer: 80, agility: 75, herblore: 70, thieving: 70, hunter: 65, cooking: 60, crafting: 60, fishing: 60 },
    quests: ['sand_and_secrets', 'the_last_dragon_p3', 'sandglass_sage_ascension', 'the_scholars_cipher'],
    combat_level: 105,
    items_brought: [
      'waxed_desert_compass',
      'ember_of_the_mire',
      'dragon_bones',
      'fossilised_sun_coin',
      'unsigned_letter_from_a_scholar',
      'a_single_grain_of_glass',
      'tide_pool_jar_x5',
      'veilwood_shade_cloth',
      'salt_wick',
    ],
  },
  steps: [
    { text: "Travel first not to the Hermit, but to Razak. He will tell you there is no wind today for the six-day walk. Wait three in-game days at the caravan post. He will change his mind on the fourth." },
    { text: "On the walk, do not drink from the skin Razak gave you until the third dusk. On the third dusk, drink without being told. If Razak has taken a liking to you, the wind will turn at your back. If not, walk against it." },
    { text: "Arrive at the shrine. Ask the first question — 'do you have a quest'. The Hermit will close one eye. Wait." },
    { text: "Spend one full in-game day at the shrine without asking the second question. Fish the shrine well for a crystal-eyed fish you cannot eat. Keep the fish alive in one of your jars." },
    { text: "Read the walls in order. Nine alcove tablets, each inscribed in a different dead cult's script. Translate the fifth using Bel's cipher crib. The fifth is a prayer to a moon, not a sun." },
    { text: "Walk to the Glass Desert with the fish. At the Crystal Caverns' outer mouth, feed the fish to the refraction of the Crystal Wyrm. The refraction will answer with a single word you do not yet understand." },
    { text: "Return to the shrine. Offer the ember, the bones, the fossil coin, the unsigned letter, the grain of glass, the salt wick, the shade cloth, and the fish's empty jar on the altar, in that order. Do not offer the waxed compass yet." },
    { text: "Now ask the second question. It will arrive in your mouth without you choosing the words. The Hermit will open both eyes." },
    { text: "Survive the Hermit's answer. The answer is a shape, not words — a seven-minute meditation during which the shrine's walls invert. Prayer 80 to not lose yourself. Magic 85 to hold the wrapping." },
    { text: "Walk, at dusk, to the six edges of Aelgard in order: Heartlands-Moryskah border, Moryskah-Boneyard dry wadi, Boneyard-Glass Desert shard-line, Glass Desert-Inkweald dream threshold, Inkweald-Veilwood root-bridge, Veilwood-Sootworks mine chimney. At each edge, burn a salt wick and speak one syllable of the answer." },
    { text: "Return to the shrine. The Hermit is now eight years younger than when you met them. Speak the answer in full. The Hermit will age again, correctly." },
    { text: "Offer the waxed compass. The Hermit will un-waxe it with a thumb and hand it back. The compass now points not north but to the Old Sun's last resting place." },
    { text: "Follow the compass into the Old Sun's last resting place — a cavern beneath the Crystal Wyrm. The Crystal Wyrm will not interfere if you have already aligned with it; if you have not, you must defeat a refraction-phase guardian." },
    { text: "At the centre of the cavern, the Old Sun — which is the moon — is waiting to rise. You can let it (end the eclipse, world-affecting choice, permanent Aelgard time-of-day shift by +20 minutes of perceived daylight), refuse it (the Old Sun stays set, the Hermit continues their vigil for another forty-one years), or take its single, unspoken offer (the Old Sun gifts you the next impossible thing you ask for — once, in any future quest, you may overwrite a single outcome)." },
    { text: "Return to the Hermit with your choice. They will close both eyes. If they die in your presence, bury them with the waxed compass in their hands." },
  ],
  rewards: {
    qp: 5,
    xp: { magic: 80000, prayer: 60000, agility: 25000, herblore: 20000, thieving: 15000, hunter: 10000, cooking: 5000, crafting: 5000, fishing: 5000 },
    items: [{ id: 'old_sun_sigil', name: "Old Sun Sigil", count: 1 }],
    questPoints: 5,
    unlocks: ["area:old_sun_cavern", "item_unlock:knows_the_moon_was_the_sun", "item_unlock:old_sun_sigil", "prayer_unlock:second_question_prayer", "teleport:old_sun_lastlight_teleport"],
  },
});
defineUnlock('the_second_question', {
  name: "The Second Question",
  unlocks: [
    { type: 'item_equip', id: 'old_sun_sigil', description: "Old Sun Sigil — ring slot; one-time use, lets you overwrite the outcome of any single future quest choice. Permanent in the world after use." },
    { type: 'prayer', id: 'second_question_prayer', description: 'Second Question Prayer — once per in-game week, ask any single NPC one question they would not otherwise answer. They will answer truthfully. Effect does not stack across accounts.' },
    { type: 'teleport', id: 'old_sun_lastlight_teleport', description: "Old Sun Lastlight — teleport to the Hermit's shrine. Only usable at dusk." },
    { type: 'area', id: 'old_sun_cavern', description: "Old Sun Cavern — accessible only via the waxed compass after this quest. Contains a daily refreshable herb patch that grows ingredients not found elsewhere." },
    { type: 'dialogue_flag', id: 'knows_the_moon_was_the_sun', description: "You know the Old Sun is the moon. This line unlocks in conversations with Crystal Sage Orin, the Inkweald Muse, and the Crystal Wyrm." },
  ],
  lore_notes: "This quest is the ONLY way to learn Aelgard's cosmological secret. It must NOT be summarised in any codex page, patch note, or in-game book. The player's playthrough is the only record. All downstream lore-tier content (Last Prayer, Cartography Grandmaster, and any future eclipse content) may reference 'those who asked the second question' without naming the answer.",
});

// ══════════════════════════════════════════════════════════════════════════════
// 10. THE DRAFT SIGNATURE  — experienced, puzzle + moral ambiguity (~2 hours)
//    Seed: the_inkweald_muse + lucid_keeper_yara. The Muse is made of
//    unfinished drafts. Yara wants the Muse to stay asleep; the Muse wants to
//    be finished. You are the first seeker in fifteen years whom Yara thinks
//    is "awake enough." Decide whether to finish the Muse.
// ══════════════════════════════════════════════════════════════════════════════
quests.define('the_draft_signature', {
  name: "The Draft Signature",
  description: "Lucid Keeper Yara has let you past the dream-shore. The Muse, which is the Inkweald's accumulation of every unfinished work ever dreamed into it, is in the third grove. Yara would like the Muse to remain drafted. The Muse would like, very much, to be signed. You carry a quill and whatever is left of your concentration.",
  difficulty: 'Experienced', questPoints: 3,
  requirements: { skills: { magic: 68, herblore: 55, crafting: 55, prayer: 50, thieving: 45 }, quests: ['the_inkweald_door', 'the_inkweald_second_door'] },
  steps: [
    { text: "At the dream-shore, accept Yara's quill. She will tell you its original owner. That name will not help you." },
    { text: "Walk the Inkweald path at noon. You must pass the first grove without dreaming. Wake yourself hourly (Prayer 50 check per grove)." },
    { text: "In the second grove, you will meet a dreamed version of yourself, older by fifteen years. Do not speak with her. Walk past." },
    { text: "In the third grove, the Muse will finish your sentence before you speak. Write down the corrected ending. You will need it later." },
    { text: "Collect three ink-seeds from the third grove's thornless bramble (Herblore 55). They resemble acorns filled with ink." },
    { text: "Grind the ink-seeds with a Glass Desert shard (Crafting 55, returns a jar of live ink)." },
    { text: "Listen to the Muse recite four fragments of poetry. Three are from dead Heartlands poets whose work survives only here. One is from a poet who has not yet been born in the Heartlands. Identify which (Magic 68 check)." },
    { text: "Decide: Sign the Muse (finish the accumulation — a permanent change to the Inkweald's residue), Leave the quill on the altar and walk away (the Muse stays drafted), or Sign a single one of the fragments and leave the rest (partial ending — a middle path Yara did not expect)." },
    { text: "Return to Yara. She will not ask which you chose. She will know by the weight of the quill." },
  ],
  rewards: {
    qp: 3,
    xp: { magic: 14000, herblore: 7000, crafting: 6000, prayer: 5000, thieving: 3500 },
    items: [{ id: 'live_ink_jar', name: 'Jar of Live Ink', count: 1 }],
    questPoints: 3,
    unlocks: ["item_unlock:yaras_quill", "npc:the_muse_ended", "training_method:inkweald_live_ink_crafting"],
  },
});
defineUnlock('the_draft_signature', {
  name: "The Draft Signature",
  unlocks: [
    { type: 'training_method', id: 'inkweald_live_ink_crafting', description: "Live-Ink Crafting — crafting method unique to the Inkweald. Products inscribed here grant xp-share with allied players within 8 tiles." },
    { type: 'item_equip', id: 'yaras_quill', description: "Yara's Quill — pocket, usable once per in-game day to write a short ward onto any object; ward persists one hour, protects one skill check from failure." },
    { type: 'npc', id: 'the_muse_ended', description: "If you chose Sign, the Muse retires and becomes a pen-pal for any player with a live-ink jar. If you chose Leave, the Muse remains a boss respawn. If you chose Partial, the Muse appears as an NPC art-tutor at the Drifting Market once per week." },
  ],
  lore_notes: "The Muse's unborn-poet fragment is canon. It is recited by an NPC who will be added in a later wave. This quest permanently changes the Inkweald's atmosphere; world events reference the player's choice.",
});

// ══════════════════════════════════════════════════════════════════════════════
// 11. THE CHARTER NOBODY WRITES  — experienced, heist/infiltration (~90 min)
//    Seed: whisper_broker_nessa + harbourmaster_cole + captain_reed. The
//    Drifting Market operates without an official charter. A Heartlands noble
//    has asked the Crown to revoke its 'implicit charter'. Nessa, Cole, and
//    the old skipper all independently want to stop it — without admitting
//    they want the same thing.
// ══════════════════════════════════════════════════════════════════════════════
quests.define('the_charter_nobody_writes', {
  name: "The Charter Nobody Writes",
  description: "The Drifting Market has never held a written charter. A Heartlands noble has filed a petition to the Crown asking, politely, for the Market's 'implicit charter' to be clarified out of existence. Nessa will not ask Cole for help. Cole will not offer. Captain Reed will not get involved on paper. You will have to move the paperwork between the three of them without ever putting two of their names on the same sheet.",
  difficulty: 'Experienced', questPoints: 3,
  requirements: { skills: { thieving: 60, agility: 55, crafting: 45, magic: 45 }, quests: ['drifting_market_charter', 'the_counterfeit_ring'] },
  steps: [
    { text: "At the Drifting Market, obtain the wax from Nessa's own candle without her offering it. She will offer a drink instead. Use the drink as misdirection." },
    { text: "At the Saltbrine harbourmaster's office, obtain Cole's official seal-mark on a blank page. He will offer you a sealed page instead. Leave. Return twice. On the third visit he will, without looking up, stamp a blank." },
    { text: "At the Bittern, ask Reed for nothing. He will ask you what you need. Answer only 'a knot'. He will tie a Saltbrine seafarer's knot in three motions. Copy the knot exactly onto a thread you provide (Crafting 45)." },
    { text: "Forge — legitimately — a new charter document using Nessa's wax on the outside, Cole's blank seal in the middle, and the knot as the binding (Thieving 60, Magic 45 for the securing enchant)." },
    { text: "Submit the document to the Heartlands chancery as an 'existing pre-filed charter uncovered during archive reorganisation'. A clerk will accept it without checking, because it bears three different valid marks." },
    { text: "The noble will file an objection. Attend the hearing as a nameless witness. Do not testify. Sit in the third row and do not look at Nessa, who will also be there under a different name." },
    { text: "The chancery will rule in favour of the charter. Return to Nessa. She will not acknowledge what you have done. She will raise your charter fee." },
    { text: "Return to Cole. He will look you in the eye for the first time. He will say 'Settled'. That is the entire conversation." },
    { text: "Return to Reed. He will untie the knot without looking at it and give you a length of thread. Keep it." },
  ],
  rewards: {
    qp: 3,
    xp: { thieving: 11000, agility: 6000, crafting: 5000, magic: 4000 },
    items: [{ id: 'reeds_knot_thread', name: "Reed's Knot-Thread", count: 1 }],
    questPoints: 3,
    unlocks: ["area:drifting_market_private_cabin", "item_unlock:cole_nessa_reed_quiet_trust", "item_unlock:reeds_knot_thread"],
  },
});
defineUnlock('the_charter_nobody_writes', {
  name: "The Charter Nobody Writes",
  unlocks: [
    { type: 'item_equip', id: 'reeds_knot_thread', description: "Reed's Knot-Thread — pocket, re-ties itself if severed. Worn while crafting, adds a 'binding' tag to any player-made container — contents cannot be pickpocketed by other players." },
    { type: 'area', id: 'drifting_market_private_cabin', description: "Nessa's private cabin — a second seat at the Drifting Market; access to off-charter goods that do not appear in the public stall." },
    { type: 'dialogue_flag', id: 'cole_nessa_reed_quiet_trust', description: "All three trust you at a level none of them would name aloud. You can deliver letters between any two of them without a charter fee." },
  ],
  lore_notes: "The Drifting Market still has no written charter that the Crown could, in principle, revoke. What you submitted was a decoy that the chancery now considers canonical. This is a small legal victory. It does not resolve the underlying noble politics.",
});

// ══════════════════════════════════════════════════════════════════════════════
// 12. SESSEN'S LAST FLIGHT  — intermediate, moral ambiguity (~40 min)
//    Seed: royal_falconer (Aldwin) + merchant_hilde. Aldwin's bird Sessen is
//    dying. Aldwin wants her to die in the mews. Hilde has been offered a
//    staggering sum for the bird's last feather by a Boneyard trader.
//    Decide.
// ══════════════════════════════════════════════════════════════════════════════
quests.define('sessens_last_flight', {
  name: "Sessen's Last Flight",
  description: "Sessen, the Royal Falconer's sixteen-year gyr, is dying. Aldwin wants her to die in the mews. Merchant Hilde has been offered a Boneyard sum for the bird's first-moult feather. Hilde will not ask Aldwin. Aldwin will not ask anyone. Hilde is, however, willing to ask you, and to split the payment generously.",
  difficulty: 'Intermediate', questPoints: 2,
  requirements: { skills: { hunter: 40, thieving: 30, crafting: 25 }, quests: ['the_falconers_quiet_debt'] },
  steps: [
    { text: "At Hilde's back door, hear the offer without accepting or refusing. Ask who the Boneyard trader is. She will say only 'a collector'." },
    { text: "Observe Sessen for a full day at the mews. Aldwin does not notice you; he notices only Sessen. Record the times she sleeps, the times she wakes, and the times she lifts her head to the window." },
    { text: "Travel to the Boneyard to meet the collector in person. Do not name Aldwin; Hilde has not. The collector is Razak's cousin — a nomad who keeps bird relics for a kin-rite you have not been told about." },
    { text: "Learn why the feather is wanted. It is wanted for a kin-rite that binds the death-flight of a Boneyard bird into an amulet. Sessen, not being a Boneyard bird, would not bind. The collector has misunderstood his own tradition." },
    { text: "Decide: Tell Hilde the offer is in error (cancels the sale; Hilde is mildly irritated but respects the honesty), Tell the collector but not Hilde (the sale quietly collapses, Hilde's reputation is undented), or Complete the sale anyway (Aldwin finds out within the month and never forgives any of you)." },
    { text: "If the sale does not go through, spend one in-game day at the mews with Aldwin. He will not know why you are there. Let him not know." },
    { text: "When Sessen dies — which will happen during your vigil or the night after — ask Aldwin for nothing. He will, unasked, braid her first-moult feather into a jess and give it to you." },
    { text: "Take the jess to the Boneyard collector. Tell him the feather is now sworn to an adopted bird — yours, if you ever hunt one. He will laugh once, drily, and give you his kin-rite brass bell." },
  ],
  rewards: {
    qp: 2,
    xp: { hunter: 6500, thieving: 3000, crafting: 2000 },
    items: [{ id: 'sessens_last_jess', name: "Sessen's Last Jess", count: 1 }],
    questPoints: 2,
    unlocks: ["item_unlock:kin_rite_brass_bell", "item_unlock:respected_by_razak_cousin", "item_unlock:sessens_last_jess", "npc:aldwin_softened"],
  },
});
defineUnlock('sessens_last_flight', {
  name: "Sessen's Last Flight",
  unlocks: [
    { type: 'item_equip', id: 'sessens_last_jess', description: "Sessen's Last Jess — glove slot; bonds to the next bird you train (hunter) for a permanent +5 to hunter level while that specific bird is alive; non-tradeable." },
    { type: 'item_equip', id: 'kin_rite_brass_bell', description: "Kin-Rite Brass Bell — pocket, silences the noise-penalty on hunter traps within 20 tiles; Boneyard-only bonus: traps there recharge 50% faster." },
    { type: 'npc', id: 'aldwin_softened', description: "Aldwin will now, once, say the phrase 'mind the glove' instead of 'visitor'. Do not point it out." },
    { type: 'dialogue_flag', id: 'respected_by_razak_cousin', description: "Razak's cousin, if you meet him again, will recognise you by the bell." },
  ],
  lore_notes: "Sessen dies in this quest regardless of player choice. The ending determines only where the feather goes. Aldwin does not take another bird.",
});

// ══════════════════════════════════════════════════════════════════════════════
// 13. THE SOOT-MOUTH SEVEN  — master, NPC-chain (4+ NPCs) (~4 hours)
//    Seed: drunken_dwarf_ossen + forgemaster_brun + vorath_warden + engineer_fizz
//    + smith_hald. A deep-tunnel expedition needs to re-walk the Sootworks'
//    lost seventh crew. Ossen's maps, Brun's authority, Fizz's valves, Vorath's
//    sign-off, Hald's hammer. You coordinate.
// ══════════════════════════════════════════════════════════════════════════════
quests.define('the_soot_mouth_seven', {
  name: "The Soot-Mouth Seven",
  description: "Crew Seven does not exist. It is the crew Ossen, Brun, Vorath, Fizz and Hald would — if they ever agreed to — put into the deep Sootworks tunnels that Ossen has kept in his drawer for eight years. None of them will propose it. You will propose it, on each of their behalves, without ever quoting what they said to each other.",
  difficulty: 'Master', questPoints: 4,
  requirements: {
    skills: { smithing: 75, mining: 70, firemaking: 60, thieving: 60, crafting: 55, agility: 60 },
    quests: ['crew_six_after_the_pour', 'sootworks_rising', 'the_sootworks_heist'],
  },
  steps: [
    { text: "Visit each of the five in a deliberate order — Ossen first, then Fizz, then Hald, then Brun, then Vorath — carrying no written message. They will pretend not to know you are going to the others." },
    { text: "Ask Ossen for a single page of the maps you may actually take. He will give you the one he hates the most, which is the one he drew while drunk on the Crew Six anniversary. It is the most accurate." },
    { text: "Ask Fizz for one valve she will personally certify as re-pressurable. She will name Furnace Three's auxiliary, which Brun has not touched in fourteen years." },
    { text: "Ask Hald for a hammer he will lend without telling Brun. He will refuse twice. On the third refusal, ask whether Brun has ever lent him a hammer. Hald will sigh and give you one." },
    { text: "Ask Brun for authorisation to hot-light one tunnel. He will refuse. Show him Ossen's drunk-map. He will go very still for a full minute, then sign." },
    { text: "Ask Vorath for a foundry audit pause of forty-eight hours. He will ask you what he is pausing. Answer honestly. He will pause it without naming the expedition." },
    { text: "Assemble a six-person crew — you, Ossen (if sober enough, which is a coin-flip), Fizz, Hald, Brun, and one other. The sixth slot matters; the sixth is traditionally the person who knows the dead. Choose between: Vorath, Smith Kael (Brun's long unmet correspondent), a player-friend (if grouped), or leave the slot empty (the missing name is the ghost-seat)." },
    { text: "Walk the tunnel from Furnace Three's auxiliary south-east for three hours (agility path, Firemaking 60 at six signalling points). Map as you go, correcting Ossen's drunk-map where it is wrong. It is wrong in two places." },
    { text: "At the third known chamber, find what Crew Six left behind — a tool-box, a boot, a tally card, a lamp. None are remains; the remains went to the chapel eight years ago. Take only the tally card." },
    { text: "Fizz will announce the auxiliary is overheating. Extinguish one signalling fire per minute for eight minutes to cool the tunnel (Firemaking 60, Mining 70 to vent). If you chose Brun for the sixth, he will help; if you chose Kael, he will not know how; if empty, the ghost-seat helps." },
    { text: "Return to the surface at dawn. Deliver the tally card to Greta at the Heartlands mine — the card bears her first husband's handwriting." },
    { text: "Greta will weep privately, once, before returning the card. Deliver the card to Brun's air vent. He will not be there. He will be in the Crow's back room, on a chair he has never sat in." },
    { text: "Drink with him. Do not speak. The card will, the next morning, be framed on the Crow's wall, above the table that is never reserved." },
  ],
  rewards: {
    qp: 4,
    xp: { smithing: 30000, mining: 22000, firemaking: 15000, thieving: 10000, crafting: 8000, agility: 10000 },
    items: [{ id: 'crew_seven_tally_frame', name: 'Crew Seven Tally (framed copy)', count: 1 }],
    questPoints: 4,
    unlocks: ["area:deep_sootworks_crew_seven_tunnel", "item_unlock:hald_loaned_hammer", "npc:sootworks_five_reconciled", "training_method:crew_seven_ventmining"],
  },
});
defineUnlock('the_soot_mouth_seven', {
  name: "The Soot-Mouth Seven",
  unlocks: [
    { type: 'area', id: 'deep_sootworks_crew_seven_tunnel', description: 'Crew Seven Tunnel — a permanently lit, permanently open deep-mine passage with unique ore (soot-vein copper) and a re-pressurable shortcut between Sootworks and Heartlands mines.' },
    { type: 'training_method', id: 'crew_seven_ventmining', description: "Vent-Mining — mining training method in the Crew Seven tunnel. High attention (cool the vent every 90 seconds) but grants a 35% xp bonus and unique ore drops." },
    { type: 'item_equip', id: 'hald_loaned_hammer', description: "Hald's Loaned Hammer — main-hand for smithing only, +3 smithing level equivalent at any anvil, returns to Hald on death; replaceable via dialogue." },
    { type: 'npc', id: 'sootworks_five_reconciled', description: "Ossen, Fizz, Hald, Brun, and Vorath will, exactly once per in-game year, meet in the back room of the Crow. You are the only player permitted to watch." },
  ],
  lore_notes: "This quest permanently reconciles the Sootworks' senior staff to the point where they can be in the same room. The tally card's handwriting is Greta's first husband's; Crew Six was the collapse that widowed her. Greta does not know, before this quest, that the first Torven died in the Sootworks and not the Heartlands mine. The card tells her.",
});

// ══════════════════════════════════════════════════════════════════════════════
// 14. THE TIDE THAT DID NOT RISE  — experienced, reagent hunt (~2 hours)
//    Seed: tsunara_storm_twin + captain_reed. Tsunara's twin Gailin is held
//    in the Crystal Wyrm's alignment. Tsunara cannot cross to reach him. The
//    Bittern is the only ship in Saltbrine shallow enough to cross the reef.
//    Reed will not sail there without a compelling reason.
// ══════════════════════════════════════════════════════════════════════════════
quests.define('the_tide_that_did_not_rise', {
  name: "The Tide That Did Not Rise",
  description: "The spring tide of Saltbrine has, for the first time in recorded seasons, failed to rise. Tsunara the storm-spirit is grieving harder than usual. Her twin Gailin is held inside the Crystal Wyrm's alignment, which is not a place but a geometry. Captain Reed's Bittern is the only hull shallow enough to reach the Stormcrown Reef at low water. He will need a reason that is not Tsunara's.",
  difficulty: 'Experienced', questPoints: 3,
  requirements: {
    skills: { fishing: 65, magic: 55, agility: 55, prayer: 45, crafting: 45 },
    quests: ['echoes_of_the_deep', 'the_last_dragon_p1'],
    items_brought: ['salt_wick', 'tide_pool_jar_x5', 'veilwood_shade_cloth'],
  },
  steps: [
    { text: "Stand on the Saltbrine shingle at spring tide and verify the water has not risen. Measure with five tide-pool jars filled at dawn." },
    { text: "At Reed's Bittern, do not name Tsunara. Name the tide. He will hum a tune, dry, and ask whether you are paying in Heartlands coin or in tide pool catch." },
    { text: "Pay in catch. Deliver three glasseels to Mara; she will forward two onto Reed as a silent endorsement and keep one." },
    { text: "Sail with Reed to the Stormcrown Reef at low water. Do not stand at the bow. He will mention, once, a soft board." },
    { text: "At the reef, offer the salt wick to Tsunara. She will not speak your name. She will wait." },
    { text: "Dive the reef (Agility 55, Fishing 65) to the refraction-point where Gailin is held. Do not swim beyond it; swimming beyond is the alignment, not the retrieval." },
    { text: "Collect a single grain of Gailin's residue. It will refract your own reflection sixteen ways. Do not look. Wrap it in the Veilwood shade-cloth." },
    { text: "Return to Tsunara. Offer the residue. She will not, yet, have Gailin back — but the tide will rise, once, in front of you. Stand in it." },
    { text: "Return to Reed on the Bittern. The Bittern's hull will creak harder on the return. Reed will laugh once, dry, and say nothing else." },
    { text: "Bring the wrapped residue to the Crystal Caverns' outer mouth — not the inner — and leave it on the threshold stone. The Crystal Wyrm will not acknowledge the gift. The Wyrm will have already moved the alignment a fraction, and you will know by the colour of the next dawn." },
  ],
  rewards: {
    qp: 3,
    xp: { fishing: 12000, magic: 8000, agility: 7000, prayer: 4000, crafting: 3500 },
    items: [{ id: 'tsunaras_wave_sigil', name: "Tsunara's Wave-Sigil", count: 1 }],
    questPoints: 3,
    unlocks: ["item_unlock:tsunara_recognises_you", "item_unlock:tsunaras_wave_sigil", "npc:reed_takes_the_cargo", "teleport:stormcrown_reef_access"],
  },
});
defineUnlock('the_tide_that_did_not_rise', {
  name: "The Tide That Did Not Rise",
  unlocks: [
    { type: 'item_equip', id: 'tsunaras_wave_sigil', description: "Tsunara's Wave-Sigil — ring; when worn underwater, grants +3 agility and a unique dash mechanic that leaves a wave-trail damaging nearby enemies. Useless on dry land." },
    { type: 'teleport', id: 'stormcrown_reef_access', description: 'Stormcrown Reef — permanent low-water access, unique tide-pool catch not available elsewhere (dream-coral, ghost-sprat).' },
    { type: 'npc', id: 'reed_takes_the_cargo', description: 'Captain Reed will, once per in-game week, carry you to any Saltbrine-shoreline region for free. He will mention the soft board every time.' },
    { type: 'dialogue_flag', id: 'tsunara_recognises_you', description: 'Tsunara, in future encounters, will not attack you on the first phase. She will accept instead a single gesture: wrap the shade-cloth once.' },
  ],
  lore_notes: "Tsunara's grief is now partially addressed but not resolved — her twin remains held. Any future 'align the Wyrm' content uses this quest as a prerequisite to a partial retrieval. The spring tide, going forward, rises correctly unless a future event disrupts it.",
});

console.log('[burn-wave3] quests 8-14 loaded');
// ── continued in quests-burn-wave3-part3.js ────────────────────────────────
try { require('./quests-burn-wave3-part3'); } catch (e) { console.warn('[burn-wave3] part3:', e.message); }
