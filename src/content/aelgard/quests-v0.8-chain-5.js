// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — v0.8 Chain 5: GLASS DESERT PILGRIMAGE (6 quests)
//
// Central narrative thread:
//   Before the Glass Desert was glass — before the eclipse, before the
//   cataclysm that fused the sand — the desert was a pilgrimage route.
//   Three hundred pilgrims walked the route once a year, over twelve days,
//   from the Boneyard's caravan post to an inner shrine now buried beneath
//   the Crystal Spire. The route had thirteen stations (one for each month
//   of the pre-Crown calendar; chain-1 readers will smile). The route has
//   not been walked in nine centuries.
//
//   Seven stations still exist, buried or translocated:
//     1. The Well That Was (Boneyard, dry)
//     2. The Shadeless Cairn (Boneyard/Glass Desert border)
//     3. The Weeping Glass (Glass Desert outer ring)
//     4. The Shard That Sings (Glass Desert mid-ring)
//     5. The Mirrored Step (Glass Desert inner — Azhmari's throne-adjacent)
//     6. The Spire's Foot (beneath Merchant Zel's office)
//     7. The Shrine Below (sealed; Crystal Sage Orin knows of it)
//
//   The pilgrimage, completed once in full, grants a pilgrim's cape with a
//   unique bonus + access to a unique reagent generator (the Shrine Below's
//   font) that no other content produces.
//
//   Each quest in the chain re-opens one to two stations. The grandmaster
//   is the first complete pilgrimage in nine centuries and must be walked
//   without the player dying — failure resets the chain by one station.
//
// Difficulty arc:
//   1. Novice       — The Well That Was
//   2. Intermediate — The Shadeless Cairn
//   3. Experienced  — The Weeping Glass and the Shard That Sings
//   4. Experienced  — The Mirrored Step
//   5. Master       — The Spire's Foot
//   6. Grandmaster  — The Shrine Below (full twelve-day pilgrimage)
//
// Globetrotting:
//   Boneyard, Glass Desert, Heartlands (Zel's Heartlands file — she fears
//   it), Moryskah (Mirelda's pilgrim's salve recipe), Inkweald (Yara's
//   shrine-sleep tea), Saltbrine (Cole's old chart has a sea-route that
//   once connected to the pilgrimage).
//
// Final reward (Grandmaster):
//   Pilgrim's Cape (unique cape slot, unique bonus) + access to the Shrine
//   Below's reagent font (unique reagent no other method produces).
//
// NPC seeds: merchant_zel, razak, archaeologist_veris, crystal_sage_orin,
// azhmari_sand_prince, hermit_of_the_old_sun. New NPCs introduced within
// the chain: the Pilgrim-Echo (a dreamed memory of the route's last walker,
// nine centuries dead).
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
// 1. THE WELL THAT WAS — novice (~30 min)
//    Seed: razak + archaeologist_veris. A dry well at the caravan post
//    is, Veris suspects, Station One of the ancient pilgrimage. Razak
//    has never drawn from it because 'guests do not drink from dry
//    water'. Examine the well, find the station-marker, and begin the
//    route.
// ══════════════════════════════════════════════════════════════════════════════
quests.define('the_well_that_was', {
  name: "The Well That Was",
  description: "Razak's caravan post has, at its southeast corner, a stone well that has been dry for nine centuries. Nobody has drawn from it in that time. Razak has, characteristically, not asked why. Archaeologist Veris, who sometimes sips coffee in the post's shaded corner, has recently suggested — during one of her longer silences — that the well is, in her reading, Station One of an ancient pilgrimage route. Investigate whether she is right.",
  difficulty: 'Novice', questPoints: 1,
  requirements: { skills: { mining: 22, thieving: 18, magic: 18 } },
  steps: [
    { text: "At the caravan post, ask Razak — obliquely — whether the dry well has ever held water. He will say, 'not in my time, guest. Not in any time I have guested for'." },
    { text: "Examine the well's rim (Mining 22). Carvings are weathered but present. One of the carvings is a thirteen-pointed star — a calendar glyph from the pre-Crown era, meaning 'first station'." },
    { text: "Veris will, if present, confirm the glyph. If she is away at the dig, leave a note and wait one in-game day for her reply, which will arrive by Razak's hand." },
    { text: "Descend into the well (Thieving 18 to lower yourself without disturbing the rim; Magic 18 to conjure a small cold-flame — the well rejects warm light)." },
    { text: "At the well's bottom, there is a small stone basin with a dried residue of salt at its rim. The basin's underside is inscribed — in under-glyph script (chain-1 bleed; if you don't have the Under-Glyph Rubbing from chain-1, you can still proceed, but you'll read the inscription at 60% fidelity)." },
    { text: "The inscription is a pilgrim's invocation: 'the first water is the water I did not drink'. Copy it. Climb out. Do not disturb the salt residue; the basin is still consecrated by the invocation's residue." },
    { text: "Return to Razak and show him the invocation. He will, after reading it twice, stand very still for ten seconds. He will then pour you a cup of water from his own skin. Drink it slowly. Do not thank him; Razak's gift here is not a gift, it is a recognition." },
    { text: "Visit Veris with the invocation. She will log it as Station One confirmed. She will give you a pilgrim's token — a small stone coin with the thirteen-pointed star, which the subsequent stations will each bind to when you find them." },
  ],
  rewards: {
    qp: 1,
    xp: { mining: 2400, thieving: 1200, magic: 1400 },
    items: [{ id: 'pilgrims_token', name: "Pilgrim's Token (1 of 7 stations)", count: 1 }],
    questPoints: 1,
    unlocks: ["item_unlock:confirmed_station_one", "item_unlock:pilgrims_token", "training_method:dry_well_meditation_prayer"],
    chain_next: 'the_shadeless_cairn',
  },
});
defineUnlock('the_well_that_was', {
  name: "The Well That Was",
  unlocks: [
    { type: 'item_equip', id: 'pilgrims_token', description: "Pilgrim's Token — pocket; tracks your pilgrimage progress. At 1 station, functions as a minor shade-charm in the Boneyard (+2% stamina regen while in-region). Fully bound at 7 stations grants the grandmaster's eligibility." },
    { type: 'dialogue_flag', id: 'confirmed_station_one', description: "Veris and Razak both acknowledge your pilgrimage. Razak's water-gift is a lifetime courtesy; he will pour from his own skin once per real-time day henceforth." },
    { type: 'training_method', id: 'dry_well_meditation_prayer', description: "Dry Well Meditation — prayer training method at the well's rim; low XP but grants a pilgrim-specific prayer point used in later quests." },
  ],
  lore_notes: "The pilgrimage route has thirteen stations in canonical lore but only seven survive. Six were lost when the Glass Desert fused — the cataclysm erased them. The grandmaster walks the surviving seven. The other six remain, in the codex, as unreachable (for now).",
});

// ══════════════════════════════════════════════════════════════════════════════
// 2. THE SHADELESS CAIRN — intermediate (~75 min)
//    Seed: hermit_of_the_old_sun + razak. Station Two is a cairn on the
//    Boneyard/Glass Desert border where a pilgrim was expected to rest
//    at midday and name the Old Sun. The cairn is still there — but it
//    throws no shadow, on any day, at any hour. The Hermit knows why.
// ══════════════════════════════════════════════════════════════════════════════
quests.define('the_shadeless_cairn', {
  name: "The Shadeless Cairn",
  description: "Three days' walk south of the caravan post, on the shifting border between the Boneyard and the Glass Desert, stands a cairn of seven stacked stones. It is Station Two. The cairn throws no shadow — not at dawn, not at noon, not at dusk. Razak will not walk past it without bowing. The Hermit knows why. You must learn why before the cairn will accept your token.",
  difficulty: 'Intermediate', questPoints: 2,
  requirements: { skills: { prayer: 40, magic: 40, agility: 35, hunter: 30 }, quests: ['the_well_that_was'] },
  steps: [
    { text: "Travel with Razak three days south. Do not drink from his skin on the first day. Drink on the second. Skip the third. The cairn demands a thirst." },
    { text: "On arrival at noon, observe the cairn. It throws no shadow. Your own shadow is normal. Razak's is normal. The ground beneath the cairn is, however, visibly lighter than the surrounding ground." },
    { text: "Visit the Hermit at the Old Sun shrine (six days further deep into the Boneyard — a detour, but mandatory). The Hermit will close one eye and say, 'the cairn does not cast because the cairn is the shadow'. Do not ask for clarification; none will be offered." },
    { text: "At the Hermit's direction, bring back a single ember of the Old Sun shrine's eternal flame, sealed in a salt-lined jar (Herblore-adjacent but no explicit check; the Hermit supplies the jar)." },
    { text: "Return to the cairn at dusk. Place the salt-jar at the cairn's base. The ember will not extinguish, but it will cast a thirteen-pointed shadow-shape on the cairn's surface for exactly ninety seconds. Copy the shape (Magic 40 to record the reflection)." },
    { text: "The shape is a second pilgrim's invocation: 'the second shade is the shade I did not cast'. The cairn has been holding a shadow in trust for nine centuries, waiting for a pilgrim who would not cast one. You are that pilgrim, in this walk." },
    { text: "Kneel at the cairn and perform the invocation aloud (Prayer 40). Your own shadow will, for the duration of the invocation, vanish. This is disorienting. Do not move during it; move without a shadow and you may step off the world (Agility 35 to remain still)." },
    { text: "The cairn accepts your token. The token will now bind the second station. A second point of light appears on its face." },
    { text: "Leave the cairn. Do not look back until you have walked three hundred paces. Hunter 30 to keep your pace steady without looking." },
    { text: "Return to Razak at the caravan post. Report Station Two. Razak will, for the first time, ask whether you will continue the pilgrimage. Answer as you will; he will not judge either way." },
  ],
  rewards: {
    qp: 2,
    xp: { prayer: 5500, magic: 4500, agility: 3500, hunter: 3000 },
    items: [{ id: 'shade_held_in_trust', name: 'Shade Held In Trust', count: 1 }],
    questPoints: 2,
    unlocks: ["item_unlock:pilgrim_token_two", "item_unlock:shade_held_in_trust", "npc:hermit_pilgrim_acknowledgement"],
    chain_next: 'the_weeping_glass_and_the_shard_that_sings',
  },
});
defineUnlock('the_shadeless_cairn', {
  name: "The Shadeless Cairn",
  unlocks: [
    { type: 'item_equip', id: 'shade_held_in_trust', description: 'Shade Held In Trust — pocket; once per in-game day, lets you move without casting a shadow for 30 seconds. NPCs who rely on shadow-detection (specific thieving targets) lose their awareness of you during this. Chain-gated.' },
    { type: 'dialogue_flag', id: 'pilgrim_token_two', description: 'Two stations bound to your token. Razak now refers to you as a pilgrim, which is distinct from guest.' },
    { type: 'npc', id: 'hermit_pilgrim_acknowledgement', description: 'The Hermit now offers you, without payment, one Old Sun ember per in-game month. The ember is a reagent for the grandmaster.' },
  ],
  lore_notes: "The cairn's shadow was cast on the last day of the last pilgrimage, by a pilgrim who died at the cairn's base without completing the route. The cairn has been holding that shadow in trust. Your invocation does not release the shadow — it honours it.",
});

// ══════════════════════════════════════════════════════════════════════════════
// 3. THE WEEPING GLASS AND THE SHARD THAT SINGS — experienced (~2 hours)
//    Seed: crystal_sage_orin + azhmari_sand_prince. Stations Three and
//    Four are both in the Glass Desert's outer rings. Station Three is
//    a sheet of glass that weeps when a pilgrim approaches (it does not
//    weep for non-pilgrims; its tears are the desert's memory). Station
//    Four is a shard the size of a tooth that sings when struck in a
//    specific way. Orin knows where both are. Azhmari must grant passage
//    to Station Four, which is in his throne-adjacent sand.
// ══════════════════════════════════════════════════════════════════════════════
quests.define('the_weeping_glass_and_the_shard_that_sings', {
  name: "The Weeping Glass and the Shard That Sings",
  description: "Stations Three and Four lie, respectively, at the Glass Desert's outer ring (the Weeping Glass, a sheet of amber-tinted glass that weeps for pilgrims) and in the mid-ring (the Shard That Sings, a tooth-sized shard buried in sand adjacent to Azhmari's throne). Both must be reached, both must be bound, and Azhmari — who is bound by his own court's protocol — must grant passage to Station Four. Orin will walk with you to Station Three; he cannot cross to Station Four.",
  difficulty: 'Experienced', questPoints: 3,
  requirements: { skills: { magic: 60, thieving: 55, prayer: 50, agility: 50, crafting: 48 }, quests: ['the_shadeless_cairn', 'relics_of_the_old_world'] },
  steps: [
    { text: "At the Crystal Spire, ask Crystal Sage Orin to walk with you to the Weeping Glass. He will accept if you bring a single flask of water from Razak's skin — not from any other source." },
    { text: "Orin and you walk to the outer ring. Station Three is a head-high sheet of amber glass, set into the desert at an angle that catches no light directly. Do not touch the sheet yet." },
    { text: "Present the pilgrim's token to the sheet. If you have bound Stations One and Two correctly, the sheet will begin to weep — small droplets of refracted sand-oil form and run down its face. Catch the droplets in a crafted-glass jar (Crafting 48)." },
    { text: "The droplets are the desert's memory-oil. They are used at no other station. Do not drink the oil; the Hermit has warned that drinking carries a second pilgrimage's worth of memory, which would destabilise the first." },
    { text: "Orin will leave you at this point; he cannot cross the mid-ring. Walk alone to Azhmari's dune-throne (three nights in the right wind). Razak will, for the second time, tell you the right wind's name before you go." },
    { text: "At the dune-throne, bow once. Do not speak first. Azhmari will ask whether you are a guest of the throne or a pilgrim. Answer 'pilgrim, guest of the throne'. The combined answer is the canonical one; either alone is insufficient." },
    { text: "Azhmari will, after a long silence, permit passage to Station Four. He will give you a token-bow — a ceremonial gesture Razak will later confirm you must make at the Shard That Sings to complete the binding." },
    { text: "Walk into the sand adjacent to the throne. Station Four is a shard the size of a tooth, half-buried, catching sun in a way that implies it should not exist. Do not kick it free. Excavate with a courtesy-brush (Thieving 55 — the 'thieving' here is careful excavation, not theft)." },
    { text: "With the shard in hand, perform Azhmari's token-bow. Strike the shard on a single point (Magic 60 — the strike is magical-musical, not physical). The shard sings a pure tone. Copy the tone to memory; it is Station Four's invocation." },
    { text: "Your token binds Stations Three and Four simultaneously. The token now has four points of light. It grows noticeably warmer in your pocket when you cross stations — a pilgrim's growing weight." },
    { text: "Return to Azhmari. Bow once more. Walk back to the dune-throne's edge without looking at the throne. Agility 50 to maintain the pace of respect." },
    { text: "Walk back to Orin at the Spire. Do not walk the direct route; the pilgrimage rules require a wider return (Prayer 50 to know the longer path)." },
  ],
  rewards: {
    qp: 3,
    xp: { magic: 12000, thieving: 9000, prayer: 8000, agility: 7500, crafting: 6000 },
    items: [{ id: 'desert_memory_oil_jar', name: 'Desert Memory-Oil (jarred)', count: 1 }, { id: 'singing_shard_tone_memory', name: 'Singing Shard (tone memorised)', count: 1 }],
    questPoints: 3,
    unlocks: ["item_unlock:desert_memory_oil_jar", "item_unlock:pilgrim_token_four", "item_unlock:singing_shard_tone_memory", "training_method:mid_ring_runecrafting"],
    chain_next: 'the_mirrored_step',
  },
});
defineUnlock('the_weeping_glass_and_the_shard_that_sings', {
  name: "The Weeping Glass and the Shard That Sings",
  unlocks: [
    { type: 'item_equip', id: 'desert_memory_oil_jar', description: 'Desert Memory-Oil — pocket; consumed once grants a single re-do of a failed skill check (pilgrimage-related only). Non-tradeable, unique to this chain.' },
    { type: 'item_equip', id: 'singing_shard_tone_memory', description: 'Singing Shard (tone memorised) — pocket; lets you strike any crystal in Aelgard for a pilgrim-recognition tone. Certain hidden shrines respond to this tone.' },
    { type: 'dialogue_flag', id: 'pilgrim_token_four', description: 'Four stations bound. Orin now refers to you as a pilgrim-scholar. Azhmari has granted court-pilgrim standing.' },
    { type: 'training_method', id: 'mid_ring_runecrafting', description: 'Mid-Ring Runecrafting — runecrafting method at the Shard That Sings, medium attention, produces pilgrim-grade rune-shards for the grandmaster.' },
  ],
  lore_notes: "The memory-oil, consumed as part of the grandmaster (not before), provides the dreamed access to the six lost stations. It is the only way to 'visit' the missing stations without their being present.",
});

// ══════════════════════════════════════════════════════════════════════════════
// 4. THE MIRRORED STEP — experienced (~100 min)
//    Seed: crystal_sage_orin + the Pilgrim-Echo (new NPC). Station Five
//    is a single stone step buried under sand near the Spire's north
//    face. The step shows a reflection of you as you were — or will be —
//    at exactly the age you would have been if you had walked the
//    pilgrimage at the proper station in your life. The Pilgrim-Echo
//    stands on the step, mute, waiting.
// ══════════════════════════════════════════════════════════════════════════════
quests.define('the_mirrored_step', {
  name: "The Mirrored Step",
  description: "Station Five is a single stone step buried under nine centuries of drift, on the Crystal Spire's north face. Orin knows the approximate location; he has not excavated it. The step, when found and cleaned, shows a reflection of the pilgrim not as they are but as they would have been at the age they should have begun the walk. A Pilgrim-Echo — a mute dreamed memory of the route's last walker — stands on the step, waiting. She has waited nine centuries.",
  difficulty: 'Experienced', questPoints: 3,
  requirements: { skills: { magic: 65, prayer: 60, mining: 55, agility: 55, herblore: 50 }, quests: ['the_weeping_glass_and_the_shard_that_sings'] },
  steps: [
    { text: "At the Crystal Spire's north face, excavate the approximate location Orin has drawn on a small map. Mining 55 to remove drift carefully; the step is fragile at the corners. Do not hurry — the right depth is forty-one centimetres, not more." },
    { text: "Clean the step (Herblore 50 — a pilgrim's brush mix from moryskah-mint and Veilwood sap; Mirelda will brew it if asked politely). The step is a single rectangle of pre-cataclysm stone, unfused by the glass-era event." },
    { text: "Stand on the step. A mirror appears on its surface — you, at whatever age you would have begun this pilgrimage if you had lived in the last pilgrim's time. You may recognise yourself. You may not." },
    { text: "The Pilgrim-Echo will appear — not stepping onto the step but beside it. She is dressed in travel-leathers of a style no one has worn in nine centuries. She is mute. She looks at you without hostility." },
    { text: "Do not speak. The Echo will, after a beat, extend a hand — not to you, but past you. There is nothing there. Watch her hand. She is offering something to her own reflection in the step's mirror." },
    { text: "Offer the pilgrim's token in her hand's place (Agility 55 to reach in from the side without disturbing her stance). The token will, on being placed in the Echo's hand, fold into her palm for three seconds and then return to you — with Station Five's point of light added." },
    { text: "The Echo will, for the first time in nine centuries, blink. Prayer 60 to honour the blink without speaking of it." },
    { text: "The Echo turns and walks away — into the Spire's stonework, which parts for her and closes after. She is now free to continue to her own last station (Station Six, which is where her original walk ended). You will see her again there." },
    { text: "Take the step's reflection with you — Magic 65 to bind a single image of your-should-have-been-self to the token. This image grants a later passive effect (see unlocks)." },
    { text: "Return to Orin. Report Station Five bound. Orin will, for the first time, ask whether you intend to complete the walk. Say 'yes' aloud only if you mean it; 'yes' here is a binding commitment that, once spoken, cannot be revoked without a full reset of the chain." },
  ],
  rewards: {
    qp: 3,
    xp: { magic: 11000, prayer: 8500, mining: 8000, agility: 7000, herblore: 5500 },
    items: [{ id: 'should_have_been_self_image', name: 'Should-Have-Been Self (imaged)', count: 1 }],
    questPoints: 3,
    unlocks: ["area:spire_north_face_step", "item_unlock:pilgrim_token_five_committed", "item_unlock:should_have_been_self_image", "npc:pilgrim_echo_greets"],
    chain_next: 'the_spires_foot',
  },
});
defineUnlock('the_mirrored_step', {
  name: "The Mirrored Step",
  unlocks: [
    { type: 'item_equip', id: 'should_have_been_self_image', description: 'Should-Have-Been Self (imaged) — pocket; passive; grants +1% XP in every skill while carried, cumulative on pilgrimage-route only. The image ages naturally as your character ages.' },
    { type: 'dialogue_flag', id: 'pilgrim_token_five_committed', description: 'If you said yes at the final step, you are committed to the grandmaster. The chain cannot be reset without a full character-level pilgrimage-forfeit (returns token but voids all station bindings).' },
    { type: 'npc', id: 'pilgrim_echo_greets', description: 'The Pilgrim-Echo will, at Station Six, greet you silently. She is not an enemy; she is, in a sense, your co-pilgrim across nine centuries.' },
    { type: 'area', id: 'spire_north_face_step', description: "Crystal Spire North Face Step — a small private meditation spot at Station Five. Usable for a daily Should-Have-Been-Self prayer buff (+2% XP for 10 min, pilgrimage-only)." },
  ],
  lore_notes: "The Pilgrim-Echo is the last pilgrim of the final pilgrimage, who died before completing Station Six. Her reaching the end of the walk — via you — is, in a real sense, the chain's emotional axis. She is not a ghost in the malevolent sense; she is a completion-debt.",
});

// ══════════════════════════════════════════════════════════════════════════════
// 5. THE SPIRE'S FOOT — master (~3.5 hours)
//    Seed: merchant_zel. Station Six is directly beneath Merchant Zel's
//    quartermaster office — a buried chamber she has been standing above,
//    unknowingly, for eleven years. To reach it you must first gain Zel's
//    permission to excavate — which requires addressing Zel's Heartlands
//    file without pulling it. A long, delicate quest; Zel's character is
//    tested here as much as yours.
// ══════════════════════════════════════════════════════════════════════════════
quests.define('the_spires_foot', {
  name: "The Spire's Foot",
  description: "Station Six lies directly beneath Merchant Zel's quartermaster office. Zel has been standing above a station of the pilgrimage for eleven years without knowing. Excavating under the office requires Zel's permission, which requires — as she will phrase it — 'the Heartlands file being neither read nor pulled'. Hilde has, for three years, held Zel's real name in her back-room ledger as a contingency. You will become the instrument by which Zel's secret is formalised without being exposed, so that she can grant the excavation without losing her life.",
  difficulty: 'Master', questPoints: 4,
  requirements: {
    skills: { thieving: 72, mining: 70, magic: 65, crafting: 62, prayer: 60, agility: 60, herblore: 55 },
    quests: ['the_mirrored_step', 'sand_and_secrets', 'hildes_black_ledger'],
  },
  steps: [
    { text: "Visit Merchant Zel at the Spire. Present the pilgrim's token. She will, without looking at it, log it as 'patron, pilgrim, noted'. She will not volunteer the chamber under her office." },
    { text: "Travel to Archaeologist Veris. Ask, obliquely, whether Station Six has been identified in her notes. She will say 'I believe so, colleague. It is beneath a merchant's office. The merchant is not ready'. Veris will not name Zel." },
    { text: "Travel to Hilde in the Heartlands. Present the Black Ledger Contributors List (chain-2 bleed — if you have it). Hilde will recognise the chain-crossing and, after a long tea, acknowledge that she holds Zel's real-name file as a contingency." },
    { text: "Hilde will offer one option: a forged closure certificate for the Heartlands tax office, which would archive Zel's file as 'matter resolved' without being pulled or read. You must forge it (Thieving 72, Crafting 62; your chain-2 Decoy-Maker's Stamp, if you have it, speeds this)." },
    { text: "Travel to the Heartlands chancery archive. Insert the forged closure certificate (Magic 65 to slip past the night watch's magical detection; Agility 60 to reach the right drawer without disturbing the file)." },
    { text: "Do NOT read Zel's file. Do not even look at its tab. The forgery must be inserted blindly — this is a discipline check; reading the file voids the forgery's effect and exposes Zel posthumously even after her death. Prayer 60 to maintain the discipline." },
    { text: "Return to Hilde. Report the forgery filed. She will pour a second tea and say 'the file will sit closed for a generation. After that, I don't know'. This is the best guarantee Aelgard can offer." },
    { text: "Travel to Zel. Do not volunteer what you did. Present the pilgrim's token a second time with five points of light and the Should-Have-Been-Self image visible. Zel will look up, actually look up — the first time in your acquaintance she has broken ledger-focus." },
    { text: "Zel will say 'you know'. Do not confirm; do not deny. Zel will hand you a single key — the key to the office's underfloor. She will say 'don't damage the inventory; the chamber is yours'." },
    { text: "Excavate the underfloor chamber (Mining 70). The chamber is small, stone-lined, and contains a low stone altar. On the altar is Station Six's marker: a flat stone with the thirteen-pointed star and a single name, in under-glyph script, that is not the pilgrim-echo's — it is her companion's, who survived her final walk." },
    { text: "The companion's name is, by the archaeological record Veris holds, the first Keeper of the Boneyard Archive's mortuary wing. The chain-1 connection is explicit. Keeper Aureth was the seventh Keeper. The first Keeper was Zel's ancestor — which Zel does not know and will not, in this quest, be told." },
    { text: "Bind the token at Station Six (Herblore 55 for the pilgrim-mint binding dust — Mirelda teaches the recipe at this point, unprompted). Six points of light on the token. Return to Zel's office above ground." },
    { text: "Zel will not ask what you found. She will pour a cup of trading-coffee. She will say, in a quieter voice than any you have heard her use, 'logged'. You drink. You leave." },
  ],
  rewards: {
    qp: 4,
    xp: { thieving: 26000, mining: 22000, magic: 18000, crafting: 11000, prayer: 9500, agility: 9000, herblore: 7500 },
    items: [{ id: 'companion_name_carved', name: "Companion's Name (under-glyph)", count: 1 }],
    questPoints: 4,
    unlocks: ["area:spire_foot_chamber", "item_unlock:companion_name_carved", "item_unlock:pilgrim_token_six_private", "npc:zel_quiet_confidante"],
    chain_next: 'the_shrine_below',
  },
});
defineUnlock('the_spires_foot', {
  name: "The Spire's Foot",
  unlocks: [
    { type: 'item_equip', id: 'companion_name_carved', description: "Companion's Name (under-glyph) — pocket; while carried, the Mirrored Step's Should-Have-Been-Self image gains a second self — your pilgrim-companion. The image pair grants a unique +2% XP buff in pairs of skills (mining+thieving, magic+prayer, etc.)." },
    { type: 'dialogue_flag', id: 'pilgrim_token_six_private', description: 'Zel privately recognises your discipline. She will, from now on, give you a 25% trade discount on crystal equipment. No other NPC has this standing with Zel.' },
    { type: 'area', id: 'spire_foot_chamber', description: "Spire's Foot Chamber — a small private meditation and storage nook under Zel's office. Zel's key permits once-per-day access. Chamber contains a safe-box that persists your unique chain items." },
    { type: 'npc', id: 'zel_quiet_confidante', description: 'Zel now occasionally (once per in-game season) breaks ledger-silence to ask your counsel on a specific Spire matter. Her counsel is unique dialogue; no other player receives it.' },
  ],
  lore_notes: "The connection between Zel, the Spire, and the first Keeper of the Boneyard archive is deliberately underspecified — Zel does not know, and the player is told, but the chain does not surface it as a revelation. It is a quiet inheritance. Marstead's principle: no fanfare on lineage.",
});

// ══════════════════════════════════════════════════════════════════════════════
// 6. THE SHRINE BELOW — grandmaster, 14-stage, 5+ hour (12-day pilgrimage)
//    Seed: all above + hermit + crystal_sage_orin + the_pilgrim_echo.
//    Walk the complete twelve-day pilgrimage from Station One to the
//    Shrine Below, without dying, in a single unbroken attempt.
//    Failure resets by one station. The Shrine Below is sealed by the
//    full thirteen-glyph invocation — but only seven glyphs are on your
//    token. The other six are recoverable only by drinking the desert
//    memory-oil in the shrine's antechamber, which shows you the lost
//    six stations in a single seven-minute vision.
// ══════════════════════════════════════════════════════════════════════════════
quests.define('the_shrine_below', {
  name: "The Shrine Below",
  description: "The Pilgrimage is walked, not read. The grandmaster is the first complete walk in nine centuries — twelve in-game days, Station One through Station Seven, unbroken. You may not die; if you fall, the pilgrimage restarts with one station reset (lose the most recent binding). You may not teleport; you walk the route on foot or by the ancient sea-route Cole will show you for the Saltbrine-to-Boneyard segment. At the Shrine Below, you will drink the desert memory-oil and see the six lost stations in a dreamed vision. If the vision is honoured — if you record each lost station's invocation in your token — the shrine will open to you. If it is not, the shrine remains sealed.",
  difficulty: 'Grandmaster', questPoints: 5,
  requirements: {
    skills: { magic: 90, prayer: 88, agility: 85, mining: 80, hunter: 75, herblore: 75, thieving: 75, crafting: 70, runecrafting: 70, hitpoints: 92 },
    quests: ['the_spires_foot', 'the_second_question', 'keeper_aureths_seal'],
    combat_level: 115,
    items_brought: [
      'pilgrims_token',
      'shade_held_in_trust',
      'desert_memory_oil_jar',
      'singing_shard_tone_memory',
      'should_have_been_self_image',
      'companion_name_carved',
      'old_sun_sigil',
      'waxed_desert_compass',
    ],
  },
  steps: [
    { text: "Day 1: Begin at the caravan post. Perform Station One's invocation at the dry well. Razak will pour you water from his own skin — accept, drink, and do not refuse. Razak's parting gift is a single strip of salted flatbread you will need on Day 7." },
    { text: "Day 2-3: Walk three days south to the Shadeless Cairn. On Day 3 noon, perform Station Two's invocation. Your shadow vanishes for the performance. Do not step backwards during the vanishing." },
    { text: "Day 4: Cross the Boneyard/Glass Desert border. The border is, canonically, not a line but a slow transition. Walk without haste. Agility 85 to maintain the pilgrim pace; faster or slower will attract sand-scribes who would mark you as off-route." },
    { text: "Day 5: Reach the Weeping Glass. Orin will meet you at the border, walk you to Station Three, watch the glass weep, and leave you before the mid-ring. Bind Station Three. Hunter 75 to catch the refracted sand-oil before it sinks into the surrounding sand (a different technique than the earlier quest; the quantity is greater)." },
    { text: "Day 6: Reach the dune-throne. Bow to Azhmari. He will, this time, grant you the full pilgrimage-permission — which is distinct from court-pilgrim — and will walk a ceremonial seven paces beside you toward Station Four. Bind Station Four by striking the shard at the exact tone, sustaining for nine seconds. Magic 90." },
    { text: "Day 7: Eat Razak's salted flatbread. The bread is the only food you may consume on Day 7; other food, even water, voids the day and you must restart Day 6. Reach the Crystal Spire's north face. Bind Station Five. The Pilgrim-Echo is at Station Six's threshold, waiting. She will follow you from here." },
    { text: "Day 8: Enter Zel's office. Zel will, by prior arrangement, be absent — she has left you the key. Descend to the chamber. Bind Station Six. The Pilgrim-Echo completes her own walk by touching her companion's name. She smiles, silently, for the first time in nine centuries, and fades. Prayer 88 to honour the fading." },
    { text: "Day 9: Return to the Spire's ground floor. Zel has returned. She will hand you a sealed package — Orin's instructions for the Shrine Below. Do not open until Station Seven." },
    { text: "Day 10: Travel to the Shrine Below's antechamber. The route is through the Spire's basement-level into a corridor that has been dust-sealed for nine centuries. Mining 80 to open the seal without collapsing the corridor." },
    { text: "Day 11: In the antechamber, open Orin's package. It is a small ritual cup and the full desert memory-oil jar. Drink the oil (Herblore 75 to prepare the drink correctly — otherwise the vision is half-length and insufficient)." },
    { text: "Day 11 (continued): Enter the seven-minute vision. You see the six lost stations — a river that did not exist, a cave that is glass now, a forest that is sand, a city that is not, an island that is under, and a chapel whose ash is in Dorin's bin. Copy each invocation to the token (Magic 90; Runecrafting 70 for the binding). The token now has thirteen points of light, for the first time in nine centuries." },
    { text: "Day 11 (final): The vision ends. You are on your knees in the antechamber. Thieving 75 to not drop the token during the disorientation." },
    { text: "Day 12: Approach the Shrine Below's inner door. The door is glyph-sealed. Present the fully-bound token. The door recognises thirteen stations and opens." },
    { text: "Inside the Shrine Below: a single stone font with a slow trickle of a reagent that has no name. Orin, Veris, the Hermit, Zel, and Azhmari (via his court's official proxy — a single dune-wraith) are present, though only Orin is in the physical flesh. Accept the pilgrim's cape from the font — it materialises, woven from nine centuries of pilgrim-dust. Choose your ending. (1) REVIVE — declare the pilgrimage open to future pilgrims; you gain personal access to the font reagent, but others may walk the route after you (they must complete the full chain); the route becomes a repeatable pilgrimage for future players. (2) CLOSE — declare the pilgrimage closed in your lifetime; the font is yours exclusively, the shrine seals behind you, no other player may walk the route for the length of your character's play. (3) DEDICATE — dedicate the font to the Pilgrim-Echo; you receive no personal reagent-access, but the font's output is donated to the world — every player in Aelgard gains a 1% global XP buff while any player in the world holds the Pilgrim's Cape. Non-personal, kingdom-wide." },
  ],
  rewards: {
    qp: 5,
    xp: { magic: 110000, prayer: 70000, agility: 55000, mining: 35000, hunter: 28000, herblore: 27000, thieving: 25000, crafting: 20000, runecrafting: 25000, hitpoints: 50000 },
    items: [{ id: 'pilgrims_cape', name: "Pilgrim's Cape", count: 1 }, { id: 'shrine_below_font_access', name: "Shrine Below Font Access (sigil)", count: 1 }],
    questPoints: 5,
    unlocks: ["area:shrine_below_font", "item_unlock:completed_pilgrimage", "item_unlock:pilgrims_cape", "npc:pilgrim_echo_rested", "teleport:shrine_below_teleport", "training_method:pilgrims_draught_runecrafting"],
  },
});
defineUnlock('the_shrine_below', {
  name: "The Shrine Below",
  unlocks: [
    { type: 'item_equip', id: 'pilgrims_cape', description: "Pilgrim's Cape — cape slot; UNIQUE bonus: grants a thirteenth-station meditation buff that slowly regenerates prayer points and stamina in any desert, shrine, or archive area. The cape's inscription records your chosen ending; REVIVE inscribes 'open'; CLOSE 'sealed'; DEDICATE 'given'. Non-interchangeable with any other cape." },
    { type: 'area', id: 'shrine_below_font', description: "Shrine Below Font — accessible only to the chain's completer (and, if REVIVE ending, to future pilgrims). Produces a unique reagent (Pilgrim's Draught) used in late-game Prayer, Magic, and Runecrafting tiers that require pre-cataclysm material." },
    { type: 'training_method', id: 'pilgrims_draught_runecrafting', description: "Pilgrim's Draught Runecrafting — runecrafting method at the Shrine Below's font. High attention, exceptional XP, requires the cape; reagent yield depends on ending." },
    { type: 'teleport', id: 'shrine_below_teleport', description: "Shrine Below Teleport — UNIQUE; lets you return to the Shrine Below after completion, bypassing the twelve-day walk. Cooldown is 24 real-time hours. Unique to this chain." },
    { type: 'dialogue_flag', id: 'completed_pilgrimage', description: "You have walked the pilgrimage. NPCs across all nine regions will reference this. Razak, Veris, Orin, Zel, Azhmari, and the Hermit each offer a distinct private conversation locked behind this flag." },
    { type: 'npc', id: 'pilgrim_echo_rested', description: 'The Pilgrim-Echo is at rest. Her companion (Zel\'s ancestor) is, by implication, also at rest. Zel, though not told, feels it — she is, subtly, less paranoid about her Heartlands file in subsequent dialogue.' },
  ],
  lore_notes: "This grandmaster is the Glass Desert's counterpart to The Second Question — it is the region's metaphysical arc. The three endings are canon simultaneously (as with all grandmasters in v0.8). The Pilgrim's Draught produced at the font is deliberately designed to be the only pre-cataclysm reagent in the game; it cannot be produced any other way. Future content that requires it must route the player through this chain or its downstream repeatable variant (REVIVE ending only).",
});

console.log('[v0.8-chain-5] Glass Desert Pilgrimage: 6 quests loaded');
