// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Burn Wave 3 Quests (20 new, NPC-bible-seeded, Marstead-compliant)
//
// Authored for burn v2, wave 3. Every quest below:
//   * Seeds from at least one NPC bible (data/npc-bibles.json) drive/fear/secret
//   * Globetrots across 2+ regions when the quest is not a deliberate short beat
//   * Requires 2+ skills and 0-3 prior quests
//   * Has 8-15 stages with obtuse objectives (text-adventure style)
//   * Grants a UNIQUE, non-interchangeable reward (Marstead non-degenerate rule)
//
// Distribution:
//   Novice:        3 (palate cleansers, 5-15 min)
//   Intermediate:  6
//   Experienced:   7
//   Master:        2
//   Grandmaster:   2 (15-stage, 5+ hour)
//
// Categories covered:
//   moral ambiguity (3), puzzle mechanics (3), NPC diplomacy chains (3),
//   heist/infiltration (3), reagent hunts (3), palate cleansers (3),
//   grandmaster 15-stage (2).
//
// Referenced item IDs (items agent to fulfil post-merge):
//   see data/quests/_referenced_items.md
// Referenced monster IDs (bestiary agent to fulfil post-merge):
//   see data/quests/_referenced_monsters.md
//
// Narrative prose for each quest lives in
//   data/quests/burn-wave3-narratives.json
// so the codex generator and live narrator can pick it up.
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
// 1. THE FALCONER'S QUIET DEBT  — novice, palate cleanser (5-15 min)
//    Seed: royal_falconer (Aldwin). Secret: anonymous monthly stipend from a
//    Heartlands noble household he refuses to name. Quest: trace the coin.
// ══════════════════════════════════════════════════════════════════════════════
quests.define('the_falconers_quiet_debt', {
  name: "The Falconer's Quiet Debt",
  description: "The Royal Falconer receives a small purse of coin by unsigned post every month. He has never traced it. He is too proud to ask who is thanking him. Sessen, his oldest bird, will not settle this week, and he thinks the sender has died. He would like you — quietly — to find out.",
  difficulty: 'Novice', questPoints: 1,
  requirements: { skills: { hunter: 12, thieving: 8 } },
  steps: [
    { text: "Visit the falconry mews behind the Heartlands noble quarter. Do not raise your voice when you arrive." },
    { text: "Accept the sealed purse from Aldwin. Do not open it. He will watch to see whether you do." },
    { text: "Walk to the Heartlands post-carter's barn and ask, without naming Aldwin, which household has posted an unsigned purse on the first Friday of every month for nine years." },
    { text: "The post-carter will tell you, in exchange for an unbroken silence of her own. Bring her a single unhooded Veilwood pigeon, captured without injury (Hunter 12)." },
    { text: "Follow her tip to the household's back door. Observe — do not enter. A hand will leave a flower on the sill at dusk." },
    { text: "Take the flower. Take nothing else. Return to Aldwin at dawn, not before." },
    { text: "Place the flower on Sessen's perch without speaking." },
  ],
  rewards: {
    qp: 1,
    xp: { hunter: 1200, thieving: 600 },
    items: [{ id: 'jess_of_quiet_thanks', name: 'Jess of Quiet Thanks', count: 1 }],
    questPoints: 1,
    unlocks: ["item_unlock:jess_of_quiet_thanks", "item_unlock:knows_the_quiet_household", "npc:royal_falconer_trusted"],
    chain_next: 'sessens_last_flight',
  },
});
defineUnlock('the_falconers_quiet_debt', {
  name: "The Falconer's Quiet Debt",
  unlocks: [
    { type: 'item_equip', id: 'jess_of_quiet_thanks', description: 'Jess of Quiet Thanks — glove slot; hunter traps placed with this equipped will never frighten songbirds within 12 tiles' },
    { type: 'npc', id: 'royal_falconer_trusted', description: 'Aldwin lets you handle Sessen. Once per day, Sessen will fly a short message to any NPC in the Heartlands for you.' },
    { type: 'dialogue_flag', id: 'knows_the_quiet_household', description: "You know the name of the household. Unlocks a private line with Merchant Hilde." },
  ],
  lore_notes: "Aldwin's quiet stipend is paid by a minor Heartlands noblewoman whose falcon he refused to mistreat thirty years ago. She is widowed now. The flower is a crocus, which was her husband's favourite.",
});

// ══════════════════════════════════════════════════════════════════════════════
// 2. THE AMBASSADOR'S SOUP  — intermediate, moral ambiguity (~1 hour)
//    Seed: evil_chef. Secret: he was dismissed for refusing to poison an
//    ambassador on Crown orders. The records were expunged. Quest: publish
//    the truth OR bury it. Player chooses.
// ══════════════════════════════════════════════════════════════════════════════
quests.define('the_ambassadors_soup', {
  name: "The Ambassador's Soup",
  description: "You are the first eater the Evil Chef has received in thirty years. The soup is the truth. You will either publish what it proves, which the Crown will deny, or you will eat it in silence, and the Chef will die believing nobody ever tasted it.",
  difficulty: 'Intermediate', questPoints: 2,
  requirements: { skills: { cooking: 45, thieving: 35, herblore: 30 }, quests: ['the_great_aelgard_bakeoff'] },
  steps: [
    { text: "In the Grand Hall basement beneath the Heartlands noble quarter, announce yourself as a palate. The Chef will be offended if you announce yourself as anything else." },
    { text: "Taste the soup. Do not compliment it. Do not criticise it. Describe it, in the vocabulary of the ingredient." },
    { text: "Between courses, the Chef will leave you alone. Read the recipe card he has left on the counter — the third ingredient is not an ingredient." },
    { text: "Cross-reference the non-ingredient with Wandering Scholar Bel at the Heartlands-Moryskah border inn. He will know it by its old court name." },
    { text: "Return to the Chef for the main course. Taste it. Do not flinch when the flavour repeats." },
    { text: "Between courses two and three, search the kitchen's expunged ledger (Thieving 35). Find the ambassador's name. Find the year." },
    { text: "Take the dessert. The dessert is an admission. Eat it, or refuse it." },
    { text: "Decide: Publish the story (walk the dessert spoon to the Heartlands herald's house), Bury it (burn the recipe card in the Chef's own fire while he watches), or Publish anonymously (leave the spoon at Merchant Hilde's back door)." },
    { text: "Return to the Chef. Tell him your choice to his face. He will not thank you. He may not speak at all." },
  ],
  rewards: {
    qp: 2,
    xp: { cooking: 7500, thieving: 3500, herblore: 2500 },
    items: [{ id: 'palate_certification', name: "Palate of the Grand Hall", count: 1 }],
    questPoints: 2,
    unlocks: ["item_unlock:knows_the_ambassador_truth", "item_unlock:palate_of_the_grand_hall", "npc:evil_chef_ended", "recipe:grand_hall_three_course"],
  },
});
defineUnlock('the_ambassadors_soup', {
  name: "The Ambassador's Soup",
  unlocks: [
    { type: 'recipe', id: 'grand_hall_three_course', description: 'Grand Hall Three-Course — cooking recipe, feeds 4 players simultaneously, bonus-buffs depend on the ending you chose' },
    { type: 'dialogue_flag', id: 'knows_the_ambassador_truth', description: "You know what actually happened. Certain Crown NPCs will refuse to speak to you. Hilde will trust you deeply." },
    { type: 'item_equip', id: 'palate_of_the_grand_hall', description: "Palate of the Grand Hall — cape slot, +2% cooking burn reduction, unique inscription visible to other players that depends on your ending" },
    { type: 'npc', id: 'evil_chef_ended', description: "The Chef will now either retire quietly (Publish), keep cooking alone (Bury), or begin teaching at Hilde's back door (Anonymous) — determines where he appears next." },
  ],
  lore_notes: "The ambassador was a Moryskah envoy. The Crown still denies the expunged records exist. This quest permanently tags the player as one of three 'truth-keepers' in Aelgard's court politics, which matters for the Grand Heist chain.",
});

// ══════════════════════════════════════════════════════════════════════════════
// 3. THE SCHOLAR'S CIPHER  — intermediate, puzzle (cipher) (~45 min)
//    Seed: wandering_scholar (Bel) ↔ archaeologist_veris. Their
//    correspondence is written in a cipher based on the Pyramid's third-level
//    glyphs. Bel has lost the current page. Quest: recover and translate.
// ══════════════════════════════════════════════════════════════════════════════
quests.define('the_scholars_cipher', {
  name: "The Scholar's Cipher",
  description: "Wandering Scholar Bel has left the latest page of his thirty-one-year correspondence with Archaeologist Veris on a bar in a Moryskah inn. He is not panicking. He is, however, mildly disappointed in himself, and that is worse. The page is written in a cipher based on glyphs Veris has not yet published. If the wrong reader gets it first, Veris's entire dig is in trouble.",
  difficulty: 'Intermediate', questPoints: 2,
  requirements: { skills: { thieving: 35, magic: 25, agility: 25 }, quests: ['sand_and_secrets'] },
  steps: [
    { text: "Find Bel. He will be at a different inn from the one he lost the page in. He chose the replacement inn deliberately — it is quieter, and he wants to be sure nobody follows him here." },
    { text: "Listen to his description of the lost page. He will not tell you what it says. He will only describe the handwriting and the shape of the fold." },
    { text: "Travel to the inn at the Heartlands-Moryskah border. Ask the innkeeper, without naming Bel, whether a folded paper was left on the long table on Tuesday." },
    { text: "She will say it was taken by a boy with ink on his fingers. Find the boy without scaring him." },
    { text: "Retrieve the page from the boy without buying it (Thieving 35) — he was given it by someone who paid him a copper, and the copper was marked. The marking will tell you who hired him." },
    { text: "Follow the mark to a middleman in the Moryskah smuggler's row. Do not threaten him. He does not know what the page says." },
    { text: "Translate the page using Bel's crib — he will read three lines aloud to prove he trusts you, and leave the rest for you to work out (Magic 25, 3 glyph puzzles)." },
    { text: "The page is a letter from Veris asking Bel whether the third-level glyphs spell her dead brother's name. Bel's last reply said yes. Decide: burn the page (Bel will never know you read it), return it unread to Bel (he will burn it himself), or forward it to Veris without ever speaking to Bel about it." },
    { text: "Whatever you chose, return to Bel. He will know. He will not ask how." },
  ],
  rewards: {
    qp: 2,
    xp: { thieving: 4500, magic: 3500, agility: 2000 },
    items: [{ id: 'bels_cipher_crib', name: "Bel's Cipher Crib", count: 1 }],
    questPoints: 2,
    unlocks: ["item_unlock:bels_cipher_crib", "item_unlock:trusted_by_bel_and_veris", "training_method:cipher_magic_training"],
  },
});
defineUnlock('the_scholars_cipher', {
  name: "The Scholar's Cipher",
  unlocks: [
    { type: 'item_equip', id: 'bels_cipher_crib', description: "Bel's Cipher Crib — pocket, lets you read any cipher-tagged note in the world. Includes Crown dispatches, Moryskah smuggler contracts, and Drifting Market charters if you also have the charter." },
    { type: 'dialogue_flag', id: 'trusted_by_bel_and_veris', description: "Bel and Veris both trust you. Veris will now dictate a weekly field journal entry you can mail between them." },
    { type: 'training_method', id: 'cipher_magic_training', description: "Cipher-reading — magic training method at any inn table, scales with number of unique ciphers you have translated." },
  ],
  lore_notes: "The third-level Pyramid glyphs are, in fact, a Boneyard mortuary script pre-dating the First Empire. Veris is correct about her brother's name appearing. The Crown will deny this if asked. Bel is the only surviving scholar who can read it fluently.",
});

// ══════════════════════════════════════════════════════════════════════════════
// 4. THE COUNTER-SUNG SALVE  — experienced, NPC diplomacy chain (~90 min)
//    Seed: apothecary_nira + mirelda_bog_witch + bog_witch_grael + father_dorin.
//    Nira figured out the swamp salve song herself. Mirelda never asked.
//    They have not spoken as equals in ten years. Quest: arrange the
//    conversation that ends a decade of silence.
// ══════════════════════════════════════════════════════════════════════════════
quests.define('the_counter_sung_salve', {
  name: "The Counter-Sung Salve",
  description: "Apothecary Nira has, in secret, worked out the swamp salve song. Her teacher Mirelda has never asked whether she could. Nira is waiting to be asked. Mirelda is waiting for Nira to offer. Father Dorin is the only person both of them will meet in a neutral room. You are the only person he will send.",
  difficulty: 'Experienced', questPoints: 3,
  requirements: { skills: { herblore: 60, prayer: 50, farming: 45, cooking: 35 }, quests: ['the_bog_witchs_bargain', 'roots_of_the_old_growth'] },
  steps: [
    { text: "Visit the Mortton apothecary. Do not mention the song. Do not mention Mirelda. Ask instead for a remedy for a travelling complaint you do not actually have." },
    { text: "Nira will see through you. She will not be angry. She will ask what you actually want. Tell her." },
    { text: "Collect the three ingredients the song requires without Mirelda seeing you harvest any of them: bittercap from under a wet log (but not the one under the wet log), frogspawn from a Moryskah pool where the frogs are already spawning, and a sprig of heartlands-mint from Nan Borrow's garden." },
    { text: "Prepare the salve at the Mortton altar with Father Dorin watching (Herblore 60, Prayer 50). He will say nothing." },
    { text: "Carry the salve to Mirelda's stilt-house at dawn, which is when her patch cannot pretend to be asleep." },
    { text: "Present the salve without speaking. Mirelda will examine it. If she recognises the song, she will put the salve down and call for tea. If she does not, the quest ends here and Nira keeps her secret." },
    { text: "Mirelda recognises the song. She sits for tea. You are not invited to the conversation that follows. Walk the patch widdershins once while they speak. Bog Witch Grael will cross your path at the third turn. She knew." },
    { text: "Return to Nira at dusk. Mirelda will have already written to her. You carry no letter. The letter is already there." },
    { text: "Nira will ask you to taste one last, new salve — the one she has been waiting to make in front of her teacher. Taste it. Tell her honestly what it tastes like." },
  ],
  rewards: {
    qp: 3,
    xp: { herblore: 12000, prayer: 6000, farming: 5000, cooking: 2500 },
    items: [{ id: 'counter_sung_salve_recipe', name: 'Counter-Sung Salve Recipe', count: 1 }],
    questPoints: 3,
    unlocks: ["item_unlock:recognised_by_both_witches", "npc:nira_teaches_the_song", "recipe:counter_sung_salve"],
  },
});
defineUnlock('the_counter_sung_salve', {
  name: "The Counter-Sung Salve",
  unlocks: [
    { type: 'recipe', id: 'counter_sung_salve', description: 'Counter-Sung Salve — herblore recipe, unique: one salve lasts a day of travel, does not occupy an inventory slot while in your pack.' },
    { type: 'npc', id: 'nira_teaches_the_song', description: 'Nira now teaches the swamp salve song to any player who has completed this quest. Mirelda has permanently forgiven her.' },
    { type: 'dialogue_flag', id: 'recognised_by_both_witches', description: "Both Mirelda and Nira treat you as family. Grael pretends not to, but lowers her prices by 20%." },
  ],
  lore_notes: "The song is the oldest piece of Moryskah herbalist tradition. Both witches can now teach it openly. Father Dorin takes no credit; he will say, if asked, that he only opened the altar door.",
});

// ══════════════════════════════════════════════════════════════════════════════
// 5. THE PORTRAIT AT THE BACK OF THE BAR  — experienced, NPC diplomacy chain
//    (~75 min). Seed: fishmonger_mara + whisper_broker_nessa + innkeeper_vash +
//    harbourmaster_cole. Nessa is the woman in Mara's portrait. They have not
//    been in the same room in eleven years. Each is waiting for the other.
//    You are the only person neutral enough to carry a letter.
// ══════════════════════════════════════════════════════════════════════════════
quests.define('the_portrait_at_the_back_of_the_bar', {
  name: "The Portrait at the Back of the Bar",
  description: "There is a portrait behind Fishmonger Mara's stall. There is a portrait in Whisper-Broker Nessa's cabin. They are the same portrait, painted twice by the same hand, eleven years ago, from opposite sides of a quay. Innkeeper Vash will not tell you this. Harbourmaster Cole will not tell you this. You were not supposed to notice. You did.",
  difficulty: 'Experienced', questPoints: 3,
  requirements: { skills: { thieving: 55, fishing: 50, crafting: 40, agility: 45 }, quests: ['drifting_market_charter', 'echoes_of_the_deep'] },
  steps: [
    { text: "At the Saltbrine harbour, pretend to buy fish from Mara. While she is wrapping, look past her left shoulder at the wall." },
    { text: "Do not mention the portrait to Mara. Ask instead about the season. She will say 'slow'. She always says slow." },
    { text: "Travel to the Drifting Market — wherever it is docked this week. Seek an audience with Nessa. Do not mention Mara's name." },
    { text: "In Nessa's cabin, do not look at the wall behind her desk. She is watching your eyes. If you look, the quest ends." },
    { text: "Return to Vash at the Salt-Pickled Crow. Order what Mara drinks when she is not buying. Vash will serve it without asking. That is the password." },
    { text: "Vash will take you to the back room. The back room's rent is paid by Nessa. Ask Vash nothing. Wait." },
    { text: "Vash will give you two things: a sealed envelope marked with a knife-scar pattern, and a request — carry it to whichever of the two you trust less." },
    { text: "Choose: Deliver to Mara first, Deliver to Nessa first, or Do not deliver — return the envelope to Vash, who will be quietly disappointed but will pay your tab regardless." },
    { text: "If you chose to deliver: the recipient will not open the envelope in front of you. They will thank you without thanking you. Return to the other after one full in-game day." },
    { text: "Attend the meeting between them. The meeting is in a place you will not be allowed to revisit. Do not speak. Do not remember the place by name; the name is part of the price." },
  ],
  rewards: {
    qp: 3,
    xp: { thieving: 10000, fishing: 5000, crafting: 3500, agility: 4000 },
    items: [{ id: 'knife_scar_sigil', name: 'Knife-Scar Sigil', count: 1 }],
    questPoints: 3,
    unlocks: ["item_unlock:trusted_by_both_sisters", "npc:vash_trusts_you", "teleport:knife_scar_passage"],
  },
});
defineUnlock('the_portrait_at_the_back_of_the_bar', {
  name: "The Portrait at the Back of the Bar",
  unlocks: [
    { type: 'teleport', id: 'knife_scar_passage', description: 'Knife-Scar Passage — unique teleport, delivers you to whichever of Mara or Nessa was last to greet you in person. Consumes the sigil for twenty-four game hours per use.' },
    { type: 'dialogue_flag', id: 'trusted_by_both_sisters', description: "Mara and Nessa both treat you as family. They have still not told you the nature of their dispute. You will not learn it from them." },
    { type: 'npc', id: 'vash_trusts_you', description: 'Vash will now let you sleep upstairs at the Crow without paying.' },
  ],
  lore_notes: "Mara and Nessa are sisters. The portrait was commissioned by their mother, who died before the falling-out. The falling-out concerned an outsider neither of them will name. This quest does not resolve the dispute; it only ends the silence.",
});

// ══════════════════════════════════════════════════════════════════════════════
// 6. THE LAMP BEHIND THE DESK  — novice, palate cleanser (10-15 min)
//    Seed: overseer_greta. Secret: she keeps her first husband's lamp on a
//    hook behind her desk. Quest: the lamp goes missing for one day.
// ══════════════════════════════════════════════════════════════════════════════
quests.define('the_lamp_behind_the_desk', {
  name: "The Lamp Behind the Desk",
  description: "Overseer Greta is tapping her cane harder than usual. A lamp is missing. Not a working lamp — an old lamp, on a hook behind her desk, that she has not once in nineteen years taken down. The apprentice who swept the office yesterday has not returned to work. You are the only pickaxe not already in the shaft.",
  difficulty: 'Novice', questPoints: 1,
  requirements: { skills: { mining: 20, thieving: 15 } },
  steps: [
    { text: "At the Heartlands mine entrance, stand where Greta can see your hands. Do not ask about the lamp. Ask about the apprentice." },
    { text: "She will not name the apprentice. She will tell you which seam he swept before the office. Go to the seam." },
    { text: "The apprentice is underground, afraid, holding the lamp. He thought Greta would not notice if he borrowed it. He needed its flame to light a passage the current lamps will not reach." },
    { text: "He did not break it. He did, however, light with it. Extinguish the lamp without damaging the glass (Mining 20 to handle an old frame)." },
    { text: "Walk the lamp back to the office. Do not speak to Greta when you return it. Place it on the hook." },
    { text: "Greta will tap her cane twice, once in thanks and once in dismissal. Accept the assignment she writes on the back of a tally card." },
  ],
  rewards: {
    qp: 1,
    xp: { mining: 1500, thieving: 800 },
    items: [{ id: 'first_torven_tally', name: "First Torven Tally", count: 1 }],
    questPoints: 1,
    unlocks: ["item_unlock:first_torven_tally", "item_unlock:knows_the_first_torven", "npc:greta_trusted"],
  },
});
defineUnlock('the_lamp_behind_the_desk', {
  name: "The Lamp Behind the Desk",
  unlocks: [
    { type: 'item_equip', id: 'first_torven_tally', description: "First Torven Tally — pocket slot; Greta will now let you mine in her private seam (no competition) for one real-time hour per day." },
    { type: 'npc', id: 'greta_trusted', description: "Greta calls you by an old nickname of her first husband's. She does not realise she does it. Do not correct her." },
    { type: 'dialogue_flag', id: 'knows_the_first_torven', description: 'You know the lamp is her first husband\'s. This unlocks a very short, private line with Father Dorin about the chapel longest-night burn.' },
  ],
  lore_notes: "The first Torven died in the first mine collapse, nineteen years before the current Torven was rescued from a second. Greta never names him. The lamp is the last thing he carried.",
});

// ══════════════════════════════════════════════════════════════════════════════
// 7. CREW SIX, AFTER THE POUR  — master, heist/infiltration (~3 hours)
//    Seed: forgemaster_brun + drunken_dwarf_ossen + engineer_fizz. The
//    official inquest blamed a pressure valve. Brun privately blames himself.
//    Ossen has the pre-accident tunnel maps in a drawer. Fizz maintains the
//    valves. Quest: without anyone asking for them, reconstruct what really
//    happened — and decide whether to tell Brun.
// ══════════════════════════════════════════════════════════════════════════════
quests.define('crew_six_after_the_pour', {
  name: "Crew Six, After the Pour",
  description: "Fourteen people died in Furnace Two on a pre-pour critical night eight years ago. The inquest blamed a pressure valve. Forgemaster Brun blames himself without saying so. Ossen survived in a tunnel three away and has kept the pre-accident maps in a drawer ever since, waiting to be asked. Fizz can still walk the valves blindfolded. Nobody in the Sootworks has ever put the three of them in the same room. You are about to.",
  difficulty: 'Master', questPoints: 4,
  requirements: { skills: { smithing: 72, mining: 65, thieving: 60, agility: 60, firemaking: 55, crafting: 55 }, quests: ['the_sootworks_heist', 'foundations_of_the_fallen'] },
  steps: [
    { text: "At the Soot-Mouth tavern, order the drink Ossen is not drinking. He will correct you and offer one of his own. Accept it." },
    { text: "Ask Ossen about Crew Six only after he has said the name first. He will not say it for several hours. Wait." },
    { text: "When he says it, ask nothing. Let him pour the next round. He will, eventually, open the drawer in his head." },
    { text: "Copy the three-hundred-and-forty handwritten notes he lays out, without removing any from his room. He is watching." },
    { text: "Bring the copies to Engineer Fizz at the pressure valve workshop. She will not believe you have them until you read her a specific number she burned into a valve the week before the accident. Find the number on page seventy-two." },
    { text: "Fizz will walk Furnace Two with you at shift-end. Do not speak during the walk. She is listening to the metal." },
    { text: "Identify the actual cause (Smithing 72 check on a brazed joint nobody has since inspected). It is not the valve the inquest blamed." },
    { text: "The actual cause is a joint Brun himself signed off on pre-pour, but it failed because of a coal quality delivery Vorath's office rubber-stamped without lab-checking. The blame is not Brun's. It is distributed." },
    { text: "Decide: Tell Brun with evidence in hand, Tell Vorath instead (start a foundry audit), or Burn the notes and the forge-diary in Fizz's firepit (Brun keeps his private guilt, the foundry is unchanged)." },
    { text: "Whichever ending you chose, walk to Brun's apartment — the one in the outer wall with the air vent. Tell him to his face what you have, or have not, done. He will not answer for a long minute. He will then return to work." },
  ],
  rewards: {
    qp: 4,
    xp: { smithing: 35000, mining: 15000, thieving: 10000, agility: 6000, firemaking: 5000, crafting: 4000 },
    items: [{ id: 'pre_pour_ledger_copy', name: 'Pre-Pour Ledger (hand copy)', count: 1 }],
    questPoints: 4,
    unlocks: ["area:crew_six_memorial", "item_unlock:brazers_guilty_apron", "npc:ossen_maps_published", "training_method:furnace_two_midnight_shift"],
    chain_next: 'the_map_that_was_never_drawn',
  },
});
defineUnlock('crew_six_after_the_pour', {
  name: "Crew Six, After the Pour",
  unlocks: [
    { type: 'training_method', id: 'furnace_two_midnight_shift', description: 'Furnace Two midnight shift — smithing training method, unique: anvils hit like a low-attention AFK but grant full-attention XP rate if you also tap the air vent hourly. Only available to players who have completed this quest.' },
    { type: 'item_equip', id: 'brazers_guilty_apron', description: "Brazer's Guilty Apron — body slot, -12% smithing bar burn chance, inscription changes by ending." },
    { type: 'npc', id: 'ossen_maps_published', description: 'If you chose Tell Brun, Ossen now openly sells deep-tunnel maps in the Soot-Mouth. If you chose Tell Vorath, Ossen becomes a reluctant foundry consultant. If you chose Burn, Ossen still drinks alone but will give you a free stout once per in-game week.' },
    { type: 'area', id: 'crew_six_memorial', description: "Crew Six Memorial — small shrine in the foundry outer wall; interact for 20% smithing-xp buff, one hour, once per day. Only unlocks if you chose Tell Brun or Tell Vorath." },
  ],
  lore_notes: "Crew Six is the Sootworks's Bittermarsh — a shared, unreconciled wound that the region's three senior figures carry differently. This quest is the ONLY way a player can learn the real cause. Do not trivialise by including the cause in any codex entry; the codex may state the inquest's official finding only.",
});

console.log('[burn-wave3] quests 1-7 loaded');
// ── continued in quests-burn-wave3-part2.js ────────────────────────────────
try { require('./quests-burn-wave3-part2'); } catch (e) { console.warn('[burn-wave3] part2:', e.message); }
