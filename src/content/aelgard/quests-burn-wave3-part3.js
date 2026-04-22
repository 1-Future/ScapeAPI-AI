// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Burn Wave 3 Quests (Part 3 — quests 15 through 20)
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
// 15. THE LETTER UNPOSTED  — experienced, moral ambiguity (~90 min)
//    Seed: captain_reed + first_mate_brigh + fishmonger_mara. Reed has
//    written a letter to his sister in the Heartlands — 'when you read this'
//    — that he has not posted. Brigh knows the Bittern is dying. Mara is
//    Reed's creditor. Deliver (or don't) the letter before the hull gives.
// ══════════════════════════════════════════════════════════════════════════════
quests.define('the_letter_unposted', {
  name: "The Letter Unposted",
  description: "Captain Reed has written, on a quiet evening some months ago, a letter to his sister in the Heartlands that begins 'when you read this'. The letter is not posted. Brigh knows. Mara does not. The Bittern's hull has one bad winter left. You are the only person who has seen the letter without Reed meaning to show it.",
  difficulty: 'Experienced', questPoints: 3,
  requirements: { skills: { thieving: 50, agility: 50, crafting: 40, fishing: 50 }, quests: ['echoes_of_the_deep', 'the_trawlers_call'] },
  steps: [
    { text: "Observe the letter on Reed's desk on the Bittern. Do not take it. Do not mention it. Leave the Bittern." },
    { text: "Travel to Reed's sister in the Heartlands. Ask her, without naming Reed, whether she has had recent word from Saltbrine. She will say no. Ask whether she would want word." },
    { text: "Return to Saltbrine and find Brigh at the Salt-Pickled Crow. Order the Wednesday drink. Sit at his Wednesday table. Do not invite conversation." },
    { text: "Brigh will, eventually, ask what you want. Say 'the letter'. He will look at the ceiling for a full minute." },
    { text: "Brigh gives you three options he has privately weighed for months: deliver the letter yourself without Reed's permission, convince Reed to post it himself, or burn it so Reed is forced to write a second, better one." },
    { text: "If deliver: steal onto the Bittern at dusk (Thieving 50), take only the letter, do not disturb the chart on the chart-table. Post it at the Heartlands post-carter's barn. The sister will know it was stolen-in-good-faith and will not tell Reed who posted it." },
    { text: "If convince: sail one trip with Reed. At the end of the trip, tell him you have met his sister. Do not say how. He will either post the letter that week (good ending) or refuse and continue his silence (null ending)." },
    { text: "If burn: take the letter and burn it in Brigh's firepit. Brigh will not thank you. Reed, within the month, will write a new letter — longer, less 'when you read this'. You will never see the new letter, and the sister will receive it unscrambled." },
    { text: "Whichever ending: visit Fishmonger Mara. She knows something has changed without knowing what. Do not tell her. She will accept a silence in trade." },
  ],
  rewards: {
    qp: 3,
    xp: { thieving: 8000, agility: 6000, crafting: 3500, fishing: 6000 },
    items: [{ id: 'reeds_trip_log', name: "Reed's Trip Log (hand copy)", count: 1 }],
    questPoints: 3,
    unlocks: ["area:heartlands_reed_sister_cottage", "item_unlock:knows_the_bittern_is_failing", "item_unlock:reeds_trip_log", "npc:brigh_considers_you_family"],
  },
});
defineUnlock('the_letter_unposted', {
  name: "The Letter Unposted",
  unlocks: [
    { type: 'item_equip', id: 'reeds_trip_log', description: "Reed's Trip Log — pocket, reveals the location of every bittern-catchable species within a region; single-use per day. Non-tradeable." },
    { type: 'npc', id: 'brigh_considers_you_family', description: "Brigh will, in later content, consult you about his own decision to buy a boat. Your choice in this quest shifts his timeline." },
    { type: 'area', id: 'heartlands_reed_sister_cottage', description: "The sister's cottage — a private bank access point in the Heartlands, along with a vegetable patch that produces a unique seed if you posted the letter." },
    { type: 'dialogue_flag', id: 'knows_the_bittern_is_failing', description: 'You know. Brigh knows you know. Reed does not ask. This enables a later Master quest about the Bittern\'s final voyage.' },
  ],
  lore_notes: "The Bittern is, lore-wise, salvaged from the Marigold's Mercy. Reed has not told Cole. This quest does not reveal that fact; it only raises the stakes for the Bittern's eventual loss. The sister does not know about her brother's debt to Mara.",
});

// ══════════════════════════════════════════════════════════════════════════════
// 16. THE CIPHER WE LOST  — master, puzzle (3-part cipher) (~3 hours)
//    Seed: wandering_scholar (Bel) + archaeologist_veris + father_dorin.
//    A third cipher exists — used by the Heartlands academy before Bel was
//    exiled. The keys are scattered: one in a Crown dispatch Bel cannot
//    legally read, one on a gravestone Father Dorin will not let you read,
//    one on a Pyramid glyph Veris has not yet translated.
// ══════════════════════════════════════════════════════════════════════════════
quests.define('the_cipher_we_lost', {
  name: "The Cipher We Lost",
  description: "Before Bel was exiled from his academy chair, a third cipher was taught quietly to senior fellows. It has not been used in nineteen years. The three keys still exist, scattered by accident of history — one in a Crown dispatch Bel may not legally touch, one on a Heartlands gravestone Father Dorin has sealed with a blessing, one in a Pyramid glyph Veris has not yet translated because Bel lost the crib.",
  difficulty: 'Master', questPoints: 4,
  requirements: {
    skills: { thieving: 68, magic: 65, prayer: 55, agility: 60, crafting: 45 },
    quests: ['the_scholars_cipher', 'sand_and_secrets', 'relics_of_the_old_world'],
  },
  steps: [
    { text: "Begin at Bel, at whichever inn he is currently at. He will name three places, not by name, but by the mood the place carries: 'a room that locks twice', 'a stone that sings when rain falls', 'a glyph that does not look up'." },
    { text: "For the Crown dispatch: infiltrate the Heartlands chancery archive at night (Thieving 68). The dispatch is filed under a clerk-name that is the third cipher's own mnemonic key. You cannot copy the dispatch; you must memorise a single phrase." },
    { text: "For the gravestone: approach Father Dorin. Ask nothing. Bring him the Mortton bread he prefers, baked by someone praying as they bake (the Heartlands bakery will sell this if you ask the right thing)." },
    { text: "Father Dorin will walk with you to the gravestone. He will let you read it. The gravestone is his wife's, whom he does not mention in public. The epigraph is the second cipher key." },
    { text: "For the Pyramid glyph: travel with Veris to the third-level glyph wall. Bring her three rolls of pressure-paper (Crafting 45 to make), a lantern that will not flicker (Magic 65 for the steady-flame enchant), and the crib from Bel. The glyph that does not look up is on the ceiling." },
    { text: "Assemble the three keys. The cipher is read in an order that is not obvious — the order is the order the three keepers met in youth, which is Bel, then Veris's brother, then Dorin's wife. Bel will tell you in a single sentence which order that is." },
    { text: "Decode a single sealed letter Bel has kept in his satchel for nineteen years. The letter is from Dorin's wife to Veris's brother, sent via Bel, never delivered because the brother was dead before it arrived. The letter is a poem." },
    { text: "Decide: Return the decoded letter to Dorin (he will read it, close it, place it on the altar, bless the altar, and not speak of it for a month), give it to Veris (she will file it with the dig records as a historical document, a decision she will later regret), or burn it before anyone reads (Bel will ask if you burned it; tell him the truth)." },
    { text: "Return to Bel. The third cipher is now dead — no one alive knows it in full except you, Bel, and (if you burned the letter) one of you has already begun forgetting." },
  ],
  rewards: {
    qp: 4,
    xp: { thieving: 22000, magic: 18000, prayer: 10000, agility: 8000, crafting: 4000 },
    items: [{ id: 'third_cipher_final_crib', name: 'Third Cipher Final Crib', count: 1 }],
    questPoints: 4,
    unlocks: ["item_unlock:read_the_poem", "item_unlock:third_cipher_final_crib", "npc:dorin_private_sermon", "training_method:deep_archive_thieving"],
  },
});
defineUnlock('the_cipher_we_lost', {
  name: "The Cipher We Lost",
  unlocks: [
    { type: 'item_equip', id: 'third_cipher_final_crib', description: 'Third Cipher Final Crib — pocket; the ONLY way to read Crown dispatches written before the current Crown took office. Unique to the player who finishes this quest.' },
    { type: 'training_method', id: 'deep_archive_thieving', description: "Deep Archive Thieving — thieving method at the chancery after midnight, requires third-cipher crib to enter, grants unique forgery materials." },
    { type: 'npc', id: 'dorin_private_sermon', description: "Father Dorin will, once per in-game month, give you a private sermon of exactly three sentences that grants a prayer-xp buff for the next real-time hour." },
    { type: 'dialogue_flag', id: 'read_the_poem', description: "You have read the poem. This line unlocks a single exchange with Veris about her brother and a single exchange with the Hermit about unsent letters." },
  ],
  lore_notes: "The poem is a canon, in-world piece of literature. It should be written out once in a codex page (title only, no text) and referenced without quotation. Its full text is reserved for a future lore miniquest that requires the Old Sun Sigil.",
});

// ══════════════════════════════════════════════════════════════════════════════
// 17. THE ALIGNMENT BENEATH  — grandmaster, 15-stage, 5+ hour, reagent hunt
//    Seed: crystal_wyrm + crystal_sage_orin + veldrak_last_dragon + the
//    Hermit's secret. The Wyrm is what happens when light notices itself.
//    A final alignment is possible — by a player who has completed the
//    Second Question. Grandmaster 15-stage.
// ══════════════════════════════════════════════════════════════════════════════
quests.define('the_alignment_beneath', {
  name: "The Alignment Beneath",
  description: "Veldrak does not know the Crystal Wyrm is below him. Orin suspects. You know. The Wyrm wishes to be aligned. An alignment is not a fight; it is a geometry. Reach the Wyrm. Survive the geometry. Choose whether to complete the alignment or preserve the unlit.",
  difficulty: 'Grandmaster', questPoints: 5,
  requirements: {
    skills: { magic: 90, attack: 80, defence: 80, prayer: 80, ranged: 80, agility: 75, crafting: 70, herblore: 70, hitpoints: 90 },
    quests: ['the_last_dragon_p3', 'the_second_question', 'sandglass_sage_ascension'],
    combat_level: 115,
    items_brought: [
      'ember_of_the_mire',
      'dragon_bones',
      'veldraks_given_scale',
      'refraction_lens_x3',
      'lucid_ward_pendant',
      'first_empire_signet',
      'live_ink_jar',
      'old_sun_sigil',
    ],
  },
  steps: [
    { text: "Meet Crystal Sage Orin at the outer lip of the Crystal Caverns. Do not bring the Old Sun Sigil to this meeting; he will not continue if he sees it. Leave it in the bank." },
    { text: "Orin will walk you to a reflection-point that is not on any map. He will describe the angle of the Wyrm. Memorise the angle." },
    { text: "Return to the bank, retrieve the Sigil, and approach the reflection-point alone. Orin will not follow." },
    { text: "The entrance to the inner caverns opens by refraction. Hold the first of three lenses to the light. The entrance will appear for exactly forty seconds." },
    { text: "Descend. The first cavern is Veldrak's. Do not fight him. Offer a single scale he gave you in his own fight. He will part the path without acknowledging you." },
    { text: "In the second cavern, the light bends wrong. Walk by touching the wall, not by looking. Agility 75. Do not close your eyes; the light punishes closed eyes more than open ones." },
    { text: "In the third cavern, you will meet a refraction of yourself in a possible future. She carries a weapon you have not yet earned. Do not take the weapon she offers. Do not refuse it. Walk past as if she is not there. Prayer 80." },
    { text: "Align the second lens. The cavern's geometry rotates by a degree you can feel in your teeth. Cross the new gap." },
    { text: "The fourth cavern contains an ember the Moryskah swamp owes you. Burn the ember (Firemaking check from Herblore 70) and the ink-jar (Crafting check). The smoke and ink together will trace the angle to the Wyrm." },
    { text: "The Wyrm is not in a chamber. The Wyrm is the chamber. The alignment begins the moment you enter." },
    { text: "Phase 1 — prism. Every attack is refracted. Match the angle by rotating your stance three times in eight seconds. Attack 80, Defence 80." },
    { text: "Phase 2 — cleavage. The Wyrm speaks in the voice of every poet the Inkweald has ever remembered. Answer in Bel's third cipher. Magic 90, Ranged 80." },
    { text: "Phase 3 — alignment. The Wyrm is asking for your decision. Either: align (the Old Sun rises into its last resting place, the Wyrm dissolves into a permanent +1 stat of your choice, the world gains a new kind of light), preserve (walk backwards out of the chamber — the Wyrm dreams you away and you lose your lens memory, the Sigil, and the grain of glass, but gain a permanent +2 prayer), or refuse (the Wyrm, which does not wish you harm, becomes a respawnable boss; you take a one-time drop of the Wyrm-Scale cape and never can fight it again)." },
    { text: "Return to Orin at the reflection-point. He will know which ending you chose by the way your shadow casts. He will not ask which." },
    { text: "Return to the Hermit (if alive) or Hermit's shrine (if not). Leave a single lens on the altar. This is the price the Old Sun asked you for." },
  ],
  rewards: {
    qp: 5,
    xp: { magic: 90000, attack: 35000, defence: 35000, prayer: 40000, ranged: 30000, agility: 15000, crafting: 10000, herblore: 12000, hitpoints: 40000 },
    items: [{ id: 'wyrm_scale_cape', name: 'Wyrm-Scale Cape', count: 1 }],
    questPoints: 5,
    unlocks: ["area:inner_crystal_caverns", "item_unlock:saw_the_future_self", "item_unlock:wyrm_alignment_plus_one", "item_unlock:wyrm_scale_cape", "npc:orin_consulting"],
  },
});
defineUnlock('the_alignment_beneath', {
  name: "The Alignment Beneath",
  unlocks: [
    { type: 'item_equip', id: 'wyrm_scale_cape', description: "Wyrm-Scale Cape — cape; refracts one incoming attack per encounter into damage against the attacker. Inscription changes by ending chosen." },
    { type: 'stat_permanent', id: 'wyrm_alignment_plus_one', description: "If you chose Align: permanent +1 to a stat of your choice (selectable once, irreversible)." },
    { type: 'area', id: 'inner_crystal_caverns', description: 'Inner Crystal Caverns — accessible only post-alignment, contains refraction-only herb patches, a mirror-forge for unique crafting, and Orin as a permanent consultant.' },
    { type: 'npc', id: 'orin_consulting', description: "Orin will, post-quest, sell you answers to any single skill-related question in the world for a tithe of fifty of any ore." },
    { type: 'dialogue_flag', id: 'saw_the_future_self', description: "You saw yourself in a possible future. This enables a very small, very late Master miniquest about that weapon she carried." },
  ],
  lore_notes: "This quest completes the Old Sun / Crystal Wyrm / Veldrak triangle. The Wyrm is, in one reading, the original sun; Veldrak is the current day; the Old Sun (now the moon) has waited. Whichever ending the player chooses becomes canon for the world. Codex should show all three possible endings without indicating which occurred.",
});

// ══════════════════════════════════════════════════════════════════════════════
// 18. THE MARGIN-NET, REFOLDED  — novice, palate cleanser (~10 min)
//    Seed: fishmonger_mara (carrying forward from tide_pool_collector).
//    A new margin-net has snagged on a reef. Mara asks quietly; Lenna would
//    if she could bend. Short, warm, a beat between harder content.
// ══════════════════════════════════════════════════════════════════════════════
quests.define('the_margin_net_refolded', {
  name: "The Margin-Net, Refolded",
  description: "A margin-net is caught on a reef-toe at low water. It is Lenna's newer net, the one woven after the first. Lenna cannot bend enough anymore to fetch it herself. Mara will not ask you directly; she will mention the net while wrapping a fish, and look at the weather.",
  difficulty: 'Novice', questPoints: 1,
  requirements: { skills: { fishing: 25, agility: 20 }, quests: ['the_tide_pool_collector'] },
  steps: [
    { text: "At Mara's stall, buy a small fish you do not need. Listen to her comment on the weather. Do not ask about the net; she will mention it." },
    { text: "Go to Lenna at the tide-pool shingle. She will not confirm the net is hers. She will describe the fold of its weave, which is what you will identify it by." },
    { text: "Wait for low water. Walk to the reef-toe (Agility 20 to pick your way across the wet rock)." },
    { text: "Retrieve the net without tearing the loose middle (Fishing 25 to coil it properly). A seacup is trapped inside. Release it first." },
    { text: "Fold the net in Lenna's exact fold. If you get the fold wrong, she will re-fold it in front of you without comment, which is worse than a scolding." },
    { text: "Return it to Lenna. She will say thank you once. She has said thank you to exactly three people in her life." },
  ],
  rewards: {
    qp: 1,
    xp: { fishing: 1000, agility: 700 },
    items: [{ id: 'lennas_smaller_net', name: "Lenna's Smaller Net", count: 1 }],
    questPoints: 1,
    unlocks: ["item_unlock:lenna_said_thank_you", "item_unlock:lennas_smaller_net"],
  },
});
defineUnlock('the_margin_net_refolded', {
  name: "The Margin-Net, Refolded",
  unlocks: [
    { type: 'item_equip', id: 'lennas_smaller_net', description: "Lenna's Smaller Net — pocket; when fishing at tide pool spots, occasionally catches a second fish of a lower tier. Non-tradeable. Does not take an inventory slot when stored in a sack." },
    { type: 'dialogue_flag', id: 'lenna_said_thank_you', description: "You are the fourth person to whom Lenna has said thank you. A small NPC dialogue flag used by later quests." },
  ],
  lore_notes: "Lenna, Mara, and the tide pool margin are a small, warm cluster. This is a deliberate short beat between the Reed letter and larger Sootworks content. It is not prerequisite for anything else; that is the point.",
});

// ══════════════════════════════════════════════════════════════════════════════
// 19. THE MAP THAT WAS NEVER DRAWN  — master, heist/infiltration (~2.5 hours)
//    Seed: drunken_dwarf_ossen + engineer_fizz. A Heartlands noble wants to
//    buy Ossen's tunnel maps off him while he is drunk. Fizz wants them
//    destroyed before they leave his drawer. You must get them first,
//    intact, and decide their keeper.
// ══════════════════════════════════════════════════════════════════════════════
quests.define('the_map_that_was_never_drawn', {
  name: "The Map That Was Never Drawn",
  description: "A Heartlands noble has made Ossen a quiet, serious offer for the three-hundred-and-forty handwritten notes in his drawer. Ossen has not yet refused — he is, he admits, focused and not focused in equal measure. Engineer Fizz has asked you, privately, to destroy the drawer before the offer is accepted. You are the only person in Aelgard who could do either.",
  difficulty: 'Master', questPoints: 4,
  requirements: {
    skills: { thieving: 72, crafting: 60, firemaking: 55, agility: 65, magic: 55 },
    quests: ['crew_six_after_the_pour'],
  },
  steps: [
    { text: "At the Soot-Mouth, establish which day the noble's agent is due. Ossen will not tell you; his neighbour, the tavernkeeper, will, for a copper." },
    { text: "Copy Ossen's drawer in one single night. Not page by page — the drawer's entire layout. Thieving 72. Do not wake him." },
    { text: "At your own workbench, forge a convincing decoy drawer-worth of notes — same handwriting, same fold, same drunk-smudge where the real page seventy-two has a real smudge. Crafting 60. Magic 55 for the handwriting enchant." },
    { text: "Slide the decoy drawer into place. Take the real notes." },
    { text: "Meet the noble's agent at the Heartlands-Sootworks border at the appointed hour. Hand over the decoy. Do not hand over the real. Accept payment under a false name." },
    { text: "Return to Fizz. She will ask to destroy the real notes. Decide: let her (burn them in her firepit; the maps are gone forever), refuse (keep them on your own shelf; Ossen will eventually notice and ask), or split (burn half, keep the rest; Fizz will be disappointed but will not say so)." },
    { text: "Whichever you chose, return to Ossen. Do not mention the noble. Order his drink. Let him pour." },
    { text: "The agent will, two in-game weeks later, reveal the decoy. The noble will be publicly humiliated. A clerk in the chancery — the same clerk from the third cipher quest — will send you a single coin with no note." },
  ],
  rewards: {
    qp: 4,
    xp: { thieving: 26000, crafting: 8000, firemaking: 5000, agility: 9000, magic: 5000 },
    items: [{ id: 'decoy_makers_stamp', name: "Decoy-Maker's Stamp", count: 1 }],
    questPoints: 4,
    unlocks: ["item_unlock:decoy_makers_stamp", "item_unlock:possess_the_maps", "npc:clerk_silent_ally", "training_method:forgery_crafting_desk"],
  },
});
defineUnlock('the_map_that_was_never_drawn', {
  name: "The Map That Was Never Drawn",
  unlocks: [
    { type: 'item_equip', id: 'decoy_makers_stamp', description: "Decoy-Maker's Stamp — pocket; lets you create one per-day forgery of any simple document you have legitimately seen. Forgeries pass most NPC checks; they never pass Father Dorin's." },
    { type: 'training_method', id: 'forgery_crafting_desk', description: 'Forgery Crafting Desk — a bench in the Drifting Market that lets you combine thieving + crafting xp at below-average rate but with unique reputation yield.' },
    { type: 'npc', id: 'clerk_silent_ally', description: 'The chancery clerk will, from now on, forward one anonymous dispatch per in-game month to your bank.' },
    { type: 'dialogue_flag', id: 'possess_the_maps', description: 'If you kept any notes, you possess unique deep-Sootworks cartography. Enables a post-quest micro-activity: sell individual pages to specific NPCs (e.g. Brun would pay for one, Vorath for another).' },
  ],
  lore_notes: "The noble in this quest is the same filing-party who tried to revoke the Drifting Market's charter. This quest quietly damages his standing at court. Future Heartlands politics content uses this as a turning point.",
});

// ══════════════════════════════════════════════════════════════════════════════
// 20. THE FOURTH NAME ON THE STONE  — experienced, NPC-chain (3 NPCs) (~2 hours)
//    Seed: captain_alden + father_dorin + smith_kael. Alden writes names on
//    the longest night each year and burns them at the chapel. Dorin does
//    not ask. Kael does not ask. There is, this year, a fourth name being
//    added. Alden cannot write it himself. Only a neutral hand can.
// ══════════════════════════════════════════════════════════════════════════════
quests.define('the_fourth_name_on_the_stone', {
  name: "The Fourth Name on the Stone",
  description: "On the longest night each year, Captain Alden writes a list of names and burns it at the Heartlands chapel. Father Dorin unlocks the altar. Smith Kael is present but does not watch. The list has, for thirty-two years, been three names. This year, Alden cannot write the fourth. He needs a neutral hand — yours — to write it for him, and he will not say whose name it is until the moment you are holding the pen.",
  difficulty: 'Experienced', questPoints: 3,
  requirements: { skills: { prayer: 55, smithing: 50, crafting: 40, thieving: 35 }, quests: ['heartlands_patrol'] },
  steps: [
    { text: "Wait until the longest in-game night of the year. No steps progress before that date; the quest registers but does not advance." },
    { text: "Visit Father Dorin the morning of. Do not ask about the altar. Ask about the bread. He will nod once." },
    { text: "Visit Smith Kael the afternoon of. Do not ask about the chapel. Ask whether his fires need tending. He will say 'mm' and, wordlessly, hand you a small oval of cold iron." },
    { text: "Walk to Captain Alden at dusk. He will be writing in his ledger. The first three names are already written. The fourth line is empty. The quill is waiting." },
    { text: "Alden will tell you whose name he cannot write. It is the name of his captain at Bittermarsh, whose loss he privately attributes to himself. Alden will speak the name aloud, once, in a room that has not heard it in thirty-two years." },
    { text: "Write the name onto the list in Alden's hand as best you can mimic (Thieving 35 for the forgery, Crafting 40 for the pen pressure). Your forgery is not perfect; that is part of the meaning." },
    { text: "Walk with Alden, Dorin, and Kael to the chapel at full dark. Do not speak on the walk. Dorin unlocks the altar. Kael hands Alden the iron oval without looking at him; it is a rough-smithed bell, which Alden will, with no ceremony, place on top of the list." },
    { text: "Burn the list (Prayer 55). The bell will not burn. When the list is gone, Alden will hand you the bell. Do not thank him; thanking is reserved." },
    { text: "Return the bell to Kael the next morning. He will melt it back into stock. The forge fire has not gone out. He will say 'right' once, which for him is the equivalent of an embrace." },
  ],
  rewards: {
    qp: 3,
    xp: { prayer: 12000, smithing: 6000, crafting: 3500, thieving: 2500 },
    items: [{ id: 'longest_night_rite_token', name: 'Longest Night Rite Token', count: 1 }],
    questPoints: 3,
    unlocks: ["area:heartlands_chapel_altar_key", "item_unlock:longest_night_rite_token", "item_unlock:wrote_the_captains_name", "npc:alden_dorin_kael_inner_circle"],
  },
});
defineUnlock('the_fourth_name_on_the_stone', {
  name: "The Fourth Name on the Stone",
  unlocks: [
    { type: 'item_equip', id: 'longest_night_rite_token', description: "Longest Night Rite Token — pocket; grants a once-per-year ritual at the Heartlands chapel that resets a single 'grief' or 'guilt' dialogue flag set on you by another quest. Non-tradeable, ritual available only on the longest night." },
    { type: 'npc', id: 'alden_dorin_kael_inner_circle', description: "Alden, Dorin, and Kael will, once per in-game season, invite you to Friday drinks at the Crow. You are the fourth chair. The cat attends." },
    { type: 'dialogue_flag', id: 'wrote_the_captains_name', description: "You wrote it. This unlocks a very short conversation with Mirelda (the bog witch) about the two letters she and Alden exchanged during the Sootworks campaign, which were both burned." },
    { type: 'area', id: 'heartlands_chapel_altar_key', description: 'You may, at any future longest night, unlock the chapel altar yourself — the ONLY time any player holds that key.' },
  ],
  lore_notes: "The Bittermarsh captain's name is Aldric. This is the first time in thirty-two years the name has been spoken in the Heartlands. Alden's 'A wrinkle, lad' dialog now carries a second layer. Mirelda's character will not acknowledge the fact aloud, but her opinion of you will shift after this quest.",
});

// ══════════════════════════════════════════════════════════════════════════════

console.log('[burn-wave3] quests 15-20 loaded (20 total burn-wave3 quests)');
