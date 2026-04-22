// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Quest Series Extensions (burn-v2)
//
// Completes partial quest series and adds cross-region world quests.
// Every quest here unlocks a UNIQUE thing (Metroidvania rule).
// Every quest has a matching narrative entry in data/quest-narratives.json
// with hook/premise/steps/twist/resolution/dialogue.
//
// Series completed:
//   - Slayer chain      (first_mark → gauntlet → creed → grandmaster_trial)
//   - Bog Witch chain   (errand → bargain → hunger → final_curse)
//   - Werewolf chain    (dilemma → lineage → reckoning)
//   - Pirate King chain (pirate_king → gold → throne → admirals_last_voyage)
//   - Druid chain       (green_thumb → druids_covenant → veilwood_grandmaster_rite)
//   - Inkweald chain    (inkweald_door → second_door → grandmaster_dream)
//   - Glass Prophecy    (prophecy_fragments → last_dragon_p1 → sandglass_sage_ascension)
//   - Foundations chain (foundations_of_the_fallen → foundations_of_flame → sootworks_grandmaster_titan)
//   - Sand and Secrets  (sand_and_secrets → cartographers_debt → pharaohs_reckoning_prelude)
//   - Into the Wilds    (into_the_wilds → revenant_oath → wilds_grandmaster_crown)
//   - Counterfeit chain (counterfeit_ring → counterfeit_empire)
//   - Heartlands patrol (patrol → uprising → grandmaster_feast)
//
// World quests (span 3+ regions):
//   - the_comet_of_ash           (5 regions)
//   - the_merchant_empires_fall  (4 regions)
//   - the_wandering_plague       (3 regions)
//   - the_lost_god_returns       (6 regions)
//
// Plus miniquest/capstone: the_boneyard_first_empire_rite, the_inkweald_mirror,
// the_cartography_grandmaster, the_last_prayer
//
// Voice notes:
//   - Heartlands: plain warmth
//   - Moryskah: long trailing clauses
//   - Sootworks: short, soot-mouthed
//   - Veilwood: inverted grammar
//   - Saltbrine: sailor cadence
//   - Boneyard: parched prophet
//   - Glass Desert: minimal, glass-edged
//   - Inkweald: dream-blur
//   - Wilds: cold, clipped
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const quests = require('../../data/quests');
const rel = require('../../data/relationships');

// ══════════════════════════════════════════════════════════════════════════════
// SLAYER CHAIN — first_mark → gauntlet → creed → grandmaster_trial
// ══════════════════════════════════════════════════════════════════════════════

quests.define('the_slayers_creed', {
  name: "The Slayer's Creed",
  description: "Slayer Master Varrek cannot teach you the last of his craft. For that you must go to a tower older than Moryskah, and carve your name in a stone no one has read in sixty years.",
  difficulty: 'Experienced', questPoints: 2,
  requirements: { skills: { slayer: 50, attack: 55, prayer: 40, agility: 35 }, quests: ['slayers_gauntlet'] },
  steps: [
    { text: 'Travel to the abandoned Slayer Tower at the eastern edge of Moryskah.' },
    { text: "Find the Creed Stone in the tower's sealed basement — six names are already carved on it." },
    { text: 'Hunt one creature for each name without a task scroll — the creed demands knowledge, not orders.' },
    { text: 'Return to carve your name beneath the sixth.' },
    { text: 'A seventh name appears above yours as you carve. Survive whatever it summons.' },
    { text: 'Report back to Varrek with the creed-mark on your palm.' },
  ],
  rewards: {
    xp: { slayer: 9000, attack: 4000, prayer: 2000 },
    items: [{ id: 101, name: 'Coins', count: 9000 }],
    questPoints: 2,
    unlocks: ["area:moryskah_slayer_tower_basement", "item_unlock:slayers_creed_ring", "training_method:creed_slayer_tasks"],
    chain_next: 'slayers_grandmaster_trial',
  },
});

rel.defineQuestUnlock('the_slayers_creed', {
  name: "The Slayer's Creed",
  unlocks: [
    { type: 'training_method', id: 'creed_slayer_tasks', description: 'Unscrolled slayer tasks — the creed marks what needs killing, no master required' },
    { type: 'item_equip', id: 'slayers_creed_ring', description: "Slayer's Creed Ring — 5% damage boost vs any creature a master has ever assigned" },
    { type: 'area', id: 'moryskah_slayer_tower_basement', description: 'Access to the Slayer Tower basement — creed stone, rare banshees, permanent respawns' },
  ],
});

quests.define('slayers_grandmaster_trial', {
  name: "The Slayer's Grandmaster Trial",
  description: "You have a creed-mark on your palm. Varrek hands you a sealed envelope and tells you it is not a task. It is a list of every creature in Aelgard nobody else will touch. Finish it or give the ring back.",
  difficulty: 'Grandmaster', questPoints: 4,
  requirements: { skills: { slayer: 85, attack: 80, ranged: 75, magic: 75, prayer: 70, agility: 70, hitpoints: 85 }, quests: ['the_slayers_creed', 'infernal_challenge'] },
  steps: [
    { text: 'Open the envelope. Nine creatures. One per region.' },
    { text: 'Hunt the Heartlands null-hound — a dog that forgets itself when you look at it.' },
    { text: 'Hunt the Boneyard sandwraith — she eats your water, not your blood.' },
    { text: 'Hunt the Moryskah laundry-wight — she washes the dead and does not stop.' },
    { text: 'Hunt the Veilwood moonhawk-king — larger than a man, and he remembers your face.' },
    { text: 'Hunt the Sootworks rust-snake — coils in a cooling pipe that must not cool.' },
    { text: 'Hunt the Saltbrine grief-eel — she lives in the wake of a specific shipwreck.' },
    { text: 'Hunt the Inkweald sleep-fox — the one that dreams of being hunted by you.' },
    { text: 'Hunt the Glass Desert prism-cat — refracts into three when struck, kill all three in one minute.' },
    { text: 'Hunt the Wilds throne-crow — it crowns the dying. Kill it before it crowns you.' },
    { text: 'Return the nine trophies to Varrek. Cut the creed-mark from your palm onto the stone.' },
  ],
  rewards: {
    xp: { slayer: 40000, attack: 10000, ranged: 8000, magic: 8000, prayer: 5000 },
    items: [{ id: 101, name: 'Coins', count: 50000 }],
    questPoints: 4,
    unlocks: ["item_unlock:grandmaster_slayer_helmet", "npc:varrek_retired", "training_method:self_assigned_slayer"],
  },
});

rel.defineQuestUnlock('slayers_grandmaster_trial', {
  name: "The Slayer's Grandmaster Trial",
  unlocks: [
    { type: 'item_equip', id: 'grandmaster_slayer_helmet', description: 'Grandmaster Slayer Helmet — combines creed ring, full helm slot, +15% slayer damage all regions' },
    { type: 'npc', id: 'varrek_retired', description: 'Varrek retires. You inherit his ledger — assign yourself slayer tasks at any master location.' },
    { type: 'training_method', id: 'self_assigned_slayer', description: 'Self-assigned slayer tasks — pick your own target, half the XP, no cooldown' },
  ],
});

// ══════════════════════════════════════════════════════════════════════════════
// BOG WITCH CHAIN — errand → bargain → hunger → final_curse
// ══════════════════════════════════════════════════════════════════════════════

quests.define('the_bog_witchs_hunger', {
  name: "The Bog Witch's Hunger",
  description: "The Bog Witch, who once took your bargain and taught you her recipes, cannot keep herself fed any more; the swamp, which is not a swamp the way other places are not deserts, is turning away from her, and if it turns away long enough she will become something she does not want her apprentice to see her as.",
  difficulty: 'Experienced', questPoints: 2,
  requirements: { skills: { herblore: 60, farming: 50, fishing: 45, prayer: 40 }, quests: ['the_bog_witchs_bargain'] },
  steps: [
    { text: 'Return to her cottage, which, you will notice, has moved slightly north of where you left it.' },
    { text: 'Hear what she will and will not say about the hunger, which she calls a draught.' },
    { text: 'Gather the three foods she cannot ask for directly — a Veilwood pear not yet ripe, a Heartlands loaf baked by a person who is praying, and a fish caught in a net woven in Saltbrine for exactly this purpose.' },
    { text: 'Bring them to her without speaking on the return journey.' },
    { text: 'Watch her eat. Do not comfort her afterwards — she has asked you not to.' },
    { text: 'Walk the perimeter of her patch once, widdershins, and leave the path where she tells you to leave it.' },
  ],
  rewards: {
    xp: { herblore: 7000, farming: 4000, fishing: 2500, prayer: 2000 },
    items: [{ id: 101, name: 'Coins', count: 6000 }],
    questPoints: 2,
    unlocks: ["npc:bog_witch_grandmaster", "recipe:witchs_long_broth", "training_method:moryskah_widdershins_herbing"],
    chain_next: 'the_bog_witchs_final_curse',
  },
});

rel.defineQuestUnlock('the_bog_witchs_hunger', {
  name: "The Bog Witch's Hunger",
  unlocks: [
    { type: 'recipe', id: 'witchs_long_broth', description: "Witch's Long Broth — an herblore recipe that does not use a vial, feeds the drinker for an entire day of travel" },
    { type: 'npc', id: 'bog_witch_grandmaster', description: 'Bog Witch now teaches grandmaster herblore — extends potion effect durations by 20 per cent' },
    { type: 'training_method', id: 'moryskah_widdershins_herbing', description: 'Widdershins herb patch — harvest at dusk for triple yield, but the patch watches you' },
  ],
});

quests.define('the_bog_witchs_final_curse', {
  name: "The Bog Witch's Final Curse",
  description: "The Witch, who took your bargain and who took your food and who you are now very nearly calling family, will not be a witch much longer; there is a curse on her, older than the swamp and older than her, and she would like you to help her finish it before it finishes her.",
  difficulty: 'Grandmaster', questPoints: 4,
  requirements: { skills: { herblore: 85, prayer: 70, magic: 70, farming: 70, attack: 70 }, quests: ['the_bog_witchs_hunger', 'blood_rites'] },
  steps: [
    { text: 'Return to her at the dark of the moon — she will be smaller than you remember.' },
    { text: 'Learn the curse: she was cursed by her own teacher to inherit the swamp, and she has inherited it, and the swamp is now inheriting her.' },
    { text: "Break the curse's three anchors — a locket in Heartlands, a grave in Moryskah, a stone in the Wilds — without letting anyone see you do it." },
    { text: 'Return to the cottage, which will not be where you left it.' },
    { text: 'Brew the dissolution potion over seven hours (Herblore 85).' },
    { text: 'Fight whatever crawls out of her when the curse breaks. It will be shaped like her. It will not be her.' },
    { text: 'Bury what remains, and plant the moryskah tree over it.' },
  ],
  rewards: {
    xp: { herblore: 35000, prayer: 8000, magic: 8000, farming: 6000, attack: 6000 },
    items: [{ id: 101, name: 'Coins', count: 40000 }],
    questPoints: 4,
    unlocks: ["area:moryskah_witchs_grove", "boss:the_swamp_made_flesh", "item_unlock:bog_witchs_hat"],
  },
});

rel.defineQuestUnlock('the_bog_witchs_final_curse', {
  name: "The Bog Witch's Final Curse",
  unlocks: [
    { type: 'item_equip', id: 'bog_witchs_hat', description: "Bog Witch's Hat — her hat. Fits you now. Halves potion ingredient cost at any herblore bench." },
    { type: 'boss', id: 'the_swamp_made_flesh', description: 'The Swamp Made Flesh — optional repeatable grandmaster boss in her old cottage, drops unique herblore secondaries' },
    { type: 'area', id: 'moryskah_witchs_grove', description: "The Witch's Grove — a small perfect patch of her swamp that cannot be found by accident" },
  ],
});

// ══════════════════════════════════════════════════════════════════════════════
// WEREWOLF CHAIN — dilemma → lineage → reckoning
// ══════════════════════════════════════════════════════════════════════════════

quests.define('the_werewolfs_lineage', {
  name: "The Werewolf's Lineage",
  description: "Whatever choice you made at the end of The Werewolf's Dilemma, a stranger has come looking for you; she is either the cured werewolf's sister or the empowered werewolf's daughter, depending on what you chose, and she is here because her line, which is long, is not ready to be over with.",
  difficulty: 'Experienced', questPoints: 2,
  requirements: { skills: { prayer: 50, thieving: 45, attack: 55, herblore: 50 }, quests: ['the_werewolfs_dilemma'] },
  steps: [
    { text: 'Meet her at the chapel on the Heartlands-Moryskah border at the hour the bells ring wrong.' },
    { text: 'Hear out the family history, which she will tell you standing, because sitting in front of an outsider is forbidden in her blood.' },
    { text: 'Recover the family ledger from the house a cousin burnt down four generations ago — a thieving puzzle in the ash-vault beneath.' },
    { text: "Cure or empower the next generation's heir — a child, not yet turned — by the method you chose the first time." },
    { text: 'Stand witness at the ceremony (Prayer 50).' },
    { text: 'Accept the family-token, which is not a reward — it is a debt she is paying.' },
  ],
  rewards: {
    xp: { prayer: 6000, thieving: 4000, attack: 3000, herblore: 3000 },
    items: [{ id: 101, name: 'Coins', count: 7500 }],
    questPoints: 2,
    unlocks: ["area:moryskah_werewolf_estate", "item_unlock:werewolf_family_token", "recipe:silvered_steel_alloy"],
    chain_next: 'the_werewolfs_reckoning',
  },
});

rel.defineQuestUnlock('the_werewolfs_lineage', {
  name: "The Werewolf's Lineage",
  unlocks: [
    { type: 'item_equip', id: 'werewolf_family_token', description: 'Werewolf Family Token — summons the heir once per week as a combat ally of scaling power' },
    { type: 'area', id: 'moryskah_werewolf_estate', description: 'The Werewolf Estate — fully explorable, contains a private bank, a shrine, and a locked room' },
    { type: 'recipe', id: 'silvered_steel_alloy', description: 'Silvered Steel alloy — smithing recipe that lets any melee weapon count as silver against werewolves' },
  ],
});

quests.define('the_werewolfs_reckoning', {
  name: "The Werewolf's Reckoning",
  description: "The family is old, and the oldest of them, who has been locked in the high tower since before the kingdom had its present name, has asked for you by title; she knows what you chose, she knows what you did next, and she would like to settle a matter that has been open for, in her words, a considerable portion of the century.",
  difficulty: 'Grandmaster', questPoints: 4,
  requirements: { skills: { attack: 80, prayer: 75, thieving: 70, magic: 65, herblore: 70 }, quests: ['the_werewolfs_lineage', 'sins_of_malachar'] },
  steps: [
    { text: 'Travel to the estate at the hour the tower door will open.' },
    { text: 'Climb the tower, which has more stairs each time you look up.' },
    { text: 'Meet the matriarch, who is enormous, and who will offer you tea you must drink.' },
    { text: 'Hear the matter: a pact broken before the city was a city. She asks you to close it.' },
    { text: 'Hunt down the last descendant of the pact-breaker (Thieving 70 to find, Attack 80 to settle).' },
    { text: 'Return to the matriarch with proof. Do not lie about any part of it.' },
    { text: 'Accept the marrow-right. It is given only once a generation.' },
  ],
  rewards: {
    xp: { attack: 15000, prayer: 8000, thieving: 6000, magic: 5000, herblore: 5000 },
    items: [{ id: 101, name: 'Coins', count: 45000 }],
    questPoints: 4,
    unlocks: ["boss:moryskah_tower_matriarch_spar", "item_unlock:werewolf_matriarchs_tooth", "prayer_unlock:marrow_right"],
  },
});

rel.defineQuestUnlock('the_werewolfs_reckoning', {
  name: "The Werewolf's Reckoning",
  unlocks: [
    { type: 'prayer', id: 'marrow_right', description: 'Marrow-Right prayer — once per day, the matriarch fights at your side for one minute' },
    { type: 'item_equip', id: 'werewolf_matriarchs_tooth', description: "The Matriarch's Tooth — amulet, grants lycanthrope-sight (see werewolves in crowds), +5 prayer" },
    { type: 'boss', id: 'moryskah_tower_matriarch_spar', description: 'Tower Sparring — repeatable 1-on-1 vs the matriarch. She holds back. Mostly.' },
  ],
});

// ══════════════════════════════════════════════════════════════════════════════
// PIRATE KING CHAIN — pirate_king → gold → throne → admirals_last_voyage
// ══════════════════════════════════════════════════════════════════════════════

quests.define('the_pirate_kings_gold', {
  name: "The Pirate King's Gold",
  description: "You made a pirate king, or you made him tolerate you, and now he wants his gold back — not the Saltbrine treasury's, his, personally, which was taken a long time ago by a woman who is no longer alive but whose vaults still very much are. Step lively and bring a pick.",
  difficulty: 'Experienced', questPoints: 2,
  requirements: { skills: { thieving: 55, mining: 50, agility: 50, magic: 40 }, quests: ['pirate_king'] },
  steps: [
    { text: 'Sign aboard the Broken Crown at Saltbrine wharf — two gold on the barrel, not a copper more.' },
    { text: 'Sail to the drowned vault off the Reach on a moonless tide.' },
    { text: "Dive to the vault door and spring the triple-lock (Thieving 55, Agility 50)." },
    { text: 'Mine through the coral-crust that has grown since the lock was last opened (Mining 50).' },
    { text: 'Read the inventory aloud, in full, to prove you are not a thief on a thief.' },
    { text: 'Return to the pirate king with his gold and his ledger. Let him weigh you.' },
  ],
  rewards: {
    xp: { thieving: 7000, mining: 6000, agility: 5000, magic: 3000 },
    items: [{ id: 101, name: 'Coins', count: 15000 }],
    questPoints: 2,
    unlocks: ["item_unlock:broken_crown_charter", "shop:pirate_kings_quartermaster", "shortcut:saltbrine_smugglers_tunnel"],
    chain_next: 'the_pirate_kings_throne',
  },
});

rel.defineQuestUnlock('the_pirate_kings_gold', {
  name: "The Pirate King's Gold",
  unlocks: [
    { type: 'shortcut', id: 'saltbrine_smugglers_tunnel', description: 'Smugglers tunnel — walk under the Reach from Saltbrine to the open sea cliffs in one minute' },
    { type: 'item_equip', id: 'broken_crown_charter', description: 'Broken Crown Charter — free charter-ship travel anywhere the flag is respected' },
    { type: 'shop', id: 'pirate_kings_quartermaster', description: "Pirate King's Quartermaster — unique naval items, thieves-cant discount" },
  ],
});

quests.define('the_pirate_kings_throne', {
  name: "The Pirate King's Throne",
  description: "The pirate king is tired. He will say he isn't, and he will drink, and he will fight, but he is tired. He wants to abdicate, and he wants to abdicate to someone he likes, which is, probably, you. First, you must take the Throne Rocks without killing anyone who is sorry about it.",
  difficulty: 'Master', questPoints: 3,
  requirements: { skills: { attack: 70, ranged: 65, thieving: 65, prayer: 50, agility: 60 }, quests: ['the_pirate_kings_gold', 'monkey_business'] },
  steps: [
    { text: 'Sail to the Throne Rocks — a chain of three crags nobody lives on by choice.' },
    { text: 'Take the first rock by a captain duel at dawn (Attack 70).' },
    { text: 'Take the second rock by outshooting a sniper from three hundred paces (Ranged 65).' },
    { text: 'Take the third rock by not being seen at all (Thieving 65, Agility 60).' },
    { text: 'Return to the Broken Crown. Eat a last meal with the pirate king.' },
    { text: 'Accept the crown. It is surprisingly light.' },
  ],
  rewards: {
    xp: { attack: 10000, ranged: 8000, thieving: 8000, prayer: 4000, agility: 5000 },
    items: [{ id: 101, name: 'Coins', count: 30000 }],
    questPoints: 3,
    unlocks: ["area:saltbrine_throne_rocks", "item_unlock:pirate_kings_crown", "npc:saltbrine_quartermaster_promoted"],
    chain_next: 'admirals_last_voyage',
  },
});

rel.defineQuestUnlock('the_pirate_kings_throne', {
  name: "The Pirate King's Throne",
  unlocks: [
    { type: 'item_equip', id: 'pirate_kings_crown', description: "Pirate King's Crown — head slot, +3 prayer, commands respect in any coastal town" },
    { type: 'area', id: 'saltbrine_throne_rocks', description: 'Throne Rocks — your seat, a private bank, and a balcony overlooking the open sea' },
    { type: 'npc', id: 'saltbrine_quartermaster_promoted', description: 'Your quartermaster will now charter any vessel you name, for a fee' },
  ],
});

quests.define('admirals_last_voyage', {
  name: "Admiral's Last Voyage",
  description: "You are a pirate king now; you have a coastline to protect, and the Kraken — the actual Kraken, not one of her children — has been seen off the deep grounds. Assemble your fleet. It is time to go out one last time, not as a raider, but as an admiral.",
  difficulty: 'Grandmaster', questPoints: 5,
  requirements: { skills: { fishing: 85, attack: 80, ranged: 80, prayer: 65, hitpoints: 85 }, quests: ['the_pirate_kings_throne'] },
  steps: [
    { text: 'Summon the council of captains at the Throne Rocks.' },
    { text: 'Charter every ship flagged under the Broken Crown — six of them, each with a name.' },
    { text: 'Sail to the deep grounds in formation. The sea will know you are coming.' },
    { text: 'First strike: harpoon the Kraken at five hundred fathoms (Fishing 85, Ranged 80).' },
    { text: 'Second strike: board the surface tentacle before it drags a ship under (Attack 80).' },
    { text: 'Third strike: finish her in the open water, captain to captain.' },
    { text: 'Tow the body home. Feed Saltbrine for a month. Drink on the Broken Crown until you cannot stand.' },
  ],
  rewards: {
    xp: { fishing: 40000, attack: 15000, ranged: 12000, prayer: 6000, hitpoints: 10000 },
    items: [{ id: 101, name: 'Coins', count: 70000 }],
    questPoints: 5,
    unlocks: ["boss:deep_kraken_repeatable", "item_unlock:kraken_tentacle_whip", "training_method:admirals_deep_fishing"],
  },
});

rel.defineQuestUnlock('admirals_last_voyage', {
  name: "Admiral's Last Voyage",
  unlocks: [
    { type: 'item_equip', id: 'kraken_tentacle_whip', description: 'Kraken Tentacle Whip — BIS one-handed slash weapon until the Wyrm tier' },
    { type: 'boss', id: 'deep_kraken_repeatable', description: 'Deep Kraken — repeatable boss fight for tentacle drops and sailors-necklace charges' },
    { type: 'training_method', id: 'admirals_deep_fishing', description: "Admiral's deep grounds fishing — AFK-capable level 85+ fishing with rare kraken-meat rolls" },
  ],
});

// ══════════════════════════════════════════════════════════════════════════════
// DRUID CHAIN — green_thumb → druids_covenant → veilwood_grandmaster_rite
// ══════════════════════════════════════════════════════════════════════════════

quests.define('the_druids_covenant', {
  name: "The Druid's Covenant",
  description: "Done, the green thumb is. Known, the druids' circle is. Asked, you have not yet been. Tonight, a covenant is offered — inverted in grammar, plain in its demand: become their kin in all but blood, or leave the Veilwood with what you already have.",
  difficulty: 'Experienced', questPoints: 2,
  requirements: { skills: { farming: 60, herblore: 55, woodcutting: 50, prayer: 50 }, quests: ['the_green_thumb'] },
  steps: [
    { text: 'To the druids\' circle go, at the hour the moss turns silver.' },
    { text: 'Of the seven covenant-trees, a cutting from each take — permission, first, you must ask of the tree itself.' },
    { text: 'Graft the seven cuttings onto a covenant-staff (Woodcutting 50, Farming 60).' },
    { text: 'Brew the covenant-draught from three patches you planted in The Green Thumb (Herblore 55).' },
    { text: 'Drink the draught; speak the words the druids taught you backwards, which is the only way.' },
    { text: 'Accept or refuse. Either choice, the Veilwood remembers.' },
  ],
  rewards: {
    xp: { farming: 8000, herblore: 5000, woodcutting: 4000, prayer: 3000 },
    items: [{ id: 101, name: 'Coins', count: 6500 }],
    questPoints: 2,
    unlocks: ["item_unlock:druids_covenant_staff", "prayer_unlock:covenant_rest", "training_method:veilwood_covenant_patches"],
    chain_next: 'the_veilwood_grandmaster_rite',
  },
});

rel.defineQuestUnlock('the_druids_covenant', {
  name: "The Druid's Covenant",
  unlocks: [
    { type: 'item_equip', id: 'druids_covenant_staff', description: "Druid's Covenant Staff — main-hand for druids; heals on hit when wielded during daylight in Veilwood" },
    { type: 'training_method', id: 'veilwood_covenant_patches', description: 'Covenant patches — a seven-part farming rotation unique to Veilwood with bonus seed drops' },
    { type: 'prayer', id: 'covenant_rest', description: 'Covenant Rest — instant prayer-point regeneration when standing on living Veilwood grass' },
  ],
});

quests.define('the_veilwood_grandmaster_rite', {
  name: 'The Veilwood Grandmaster Rite',
  description: "Spoken of, not often, is the Inner Rite — the ritual by which the Veilwood chooses one outsider per century to walk the inner sanctum as if born there. Asked, you have been. Ready, whether you are, the woods will decide.",
  difficulty: 'Grandmaster', questPoints: 5,
  requirements: { skills: { agility: 80, construction: 80, farming: 80, herblore: 80, hunter: 75, mining: 75, smithing: 75, woodcutting: 80 }, quests: ['the_druids_covenant', 'lunar_diplomacy'] },
  steps: [
    { text: 'At the eight skill-gates of the Veilwood, kneel and offer proof — a mastery of each of the eight covenant skills.' },
    { text: 'Walk the canopy-bridge barefoot, with what you carry in your own hands (Agility 80).' },
    { text: 'Build a shrine of Veilwood ironwood, no nails, no mortar (Construction 80, Smithing 75).' },
    { text: 'Raise a Great Ash seedling to full height in one night, by farming alone (Farming 80, Herblore 80).' },
    { text: 'Hunt the Moon Elder without weapons — only traps (Hunter 75).' },
    { text: 'Mine the one crystal-node that grows inside the shrine you built (Mining 75).' },
    { text: 'Stand before the Seren Shade. Survive her greeting.' },
    { text: 'Accept the Elder Crown. Do not put it on. Carry it home.' },
  ],
  rewards: {
    xp: { agility: 30000, construction: 30000, farming: 30000, herblore: 30000, hunter: 25000, mining: 25000, smithing: 25000, woodcutting: 30000 },
    items: [{ id: 101, name: 'Coins', count: 100000 }],
    questPoints: 5,
    unlocks: ["area:veilwood_moonwell", "item_unlock:elder_crown", "training_method:seren_crystal_crafting"],
  },
});

rel.defineQuestUnlock('the_veilwood_grandmaster_rite', {
  name: 'The Veilwood Grandmaster Rite',
  unlocks: [
    { type: 'item_equip', id: 'elder_crown', description: 'Elder Crown — head slot, +1 to every Veilwood skill level for methods in the Inner Sanctum' },
    { type: 'area', id: 'veilwood_moonwell', description: 'The Moonwell — only outsider-accessible spring in the Inner Sanctum, infinite prayer refill once per day' },
    { type: 'training_method', id: 'seren_crystal_crafting', description: "Seren's crystal crafting — best crystal gear in Aelgard, Veilwood Inner Sanctum only" },
  ],
});

// ══════════════════════════════════════════════════════════════════════════════
// INKWEALD CHAIN — inkweald_door → second_door → grandmaster_dream
// ══════════════════════════════════════════════════════════════════════════════

quests.define('the_inkweald_second_door', {
  name: 'The Inkweald Second Door',
  description: "A door, there was; a second door, you now find, sleeping behind the first. Opens it does only for the dreamer who has already woken once. Remembered, you were, by what you did not see the first time.",
  difficulty: 'Master', questPoints: 3,
  requirements: { skills: { magic: 75, herblore: 65, runecrafting: 55, agility: 60 }, quests: ['the_inkweald_door'] },
  steps: [
    { text: 'Return to the first door. Sleep on its threshold — only there will the second appear.' },
    { text: 'Pass the second door without waking the sleeper who guards it.' },
    { text: "Gather three dream-fragments from the lucid keepers' vaults (Magic 75)." },
    { text: 'Weave a dream-net from moonlit spidersilk (Runecrafting 55, Herblore 65).' },
    { text: 'Catch what crawls out of the second door at the moment it opens (Agility 60).' },
    { text: 'Carry it home without looking at it. Name it on arrival — whatever comes to mind is correct.' },
  ],
  rewards: {
    xp: { magic: 15000, herblore: 6000, runecrafting: 4000, agility: 5000 },
    items: [{ id: 101, name: 'Coins', count: 20000 }],
    questPoints: 3,
    unlocks: ["area:inkweald_second_door_chambers", "item_unlock:dreamers_sigil", "spell_unlock:lucid_spellbook"],
    chain_next: 'the_inkweald_grandmaster_dream',
  },
});

rel.defineQuestUnlock('the_inkweald_second_door', {
  name: 'The Inkweald Second Door',
  unlocks: [
    { type: 'spellbook', id: 'lucid_spellbook', description: 'Lucid spellbook — deeper than Dream Magic; includes Borrow Dream, Rewind Minute, Shared Eyes' },
    { type: 'area', id: 'inkweald_second_door_chambers', description: 'Second Door Chambers — seven layered dream rooms, each with a unique puzzle' },
    { type: 'item_equip', id: 'dreamers_sigil', description: "Dreamer's Sigil — grants the Lucid spellbook while equipped, even outside Inkweald" },
  ],
});

quests.define('the_inkweald_grandmaster_dream', {
  name: 'Waking the Dreaming One',
  description: "Sleeps still, the Dreaming One does, but not soundly. Yours the choice is now: wake her, and take the dream into the waking world, or bind her deeper, and let the Inkweald stay a dream. Either way, walked you must have, the dream labyrinth first.",
  difficulty: 'Grandmaster', questPoints: 5,
  requirements: { skills: { magic: 85, herblore: 75, runecrafting: 70, agility: 60, prayer: 65 }, quests: ['the_inkweald_second_door'] },
  steps: [
    { text: 'Enter the Dream Labyrinth through the second door, after three nights of preparation brews.' },
    { text: 'Solve the five lucid riddles — each riddle is a room, each room is a dream you had and forgot.' },
    { text: "Meet the Dreaming One at the labyrinth's heart. She will speak in your own voice." },
    { text: 'Choose: wake her (world gains a new kind of magic), bind her deeper (world stays stable, you gain her sigil), or walk out without choosing (rarer third outcome).' },
    { text: 'Depending on your choice, fight her avatar, or complete her binding ritual, or simply leave.' },
    { text: 'Return to the waking world. Something has followed you back.' },
  ],
  rewards: {
    xp: { magic: 40000, herblore: 10000, runecrafting: 8000, agility: 5000, prayer: 6000 },
    items: [{ id: 101, name: 'Coins', count: 80000 }],
    questPoints: 5,
    unlocks: ["boss:the_dreaming_one_repeatable", "item_unlock:dream_talisman", "item_unlock:lucid_staff"],
  },
});

rel.defineQuestUnlock('the_inkweald_grandmaster_dream', {
  name: 'Waking the Dreaming One',
  unlocks: [
    { type: 'item_equip', id: 'lucid_staff', description: 'Lucid Staff — BIS magic staff for lucid/dream spells, +15% spell damage in Inkweald' },
    { type: 'item_equip', id: 'dream_talisman', description: 'Dream Talisman — teleports to the last place you dreamt of (server-side history, last 7 days)' },
    { type: 'boss', id: 'the_dreaming_one_repeatable', description: 'The Dreaming One — repeatable grandmaster boss in whichever ending state you chose' },
  ],
});

// ══════════════════════════════════════════════════════════════════════════════
// GLASS PROPHECY — prophecy_fragments → last_dragon_p1 → sandglass_sage_ascension
// (Glass Prophecy already exists as a quest, we fill BEFORE and AFTER)
// ══════════════════════════════════════════════════════════════════════════════

quests.define('prophecy_fragments', {
  name: 'Prophecy Fragments',
  description: 'Crystal Sage Orin can read three lines of the Glass Prophecy. There are nine. Find the other six fragments — they are in six regions. The desert is thirsty. Hurry.',
  difficulty: 'Experienced', questPoints: 3,
  requirements: { skills: { thieving: 55, magic: 50, agility: 50, prayer: 45 }, quests: ['echoes_of_the_deep'] },
  steps: [
    { text: 'Meet Crystal Sage Orin at his tower. He will show you the three fragments he owns.' },
    { text: 'Recover the Heartlands fragment — a page in the cathedral choir-book nobody sings from.' },
    { text: 'Recover the Moryskah fragment — a tooth in a reliquary nobody opens.' },
    { text: 'Recover the Veilwood fragment — a leaf in a book that closes itself.' },
    { text: 'Recover the Sootworks fragment — a rivet in a wall nobody taps.' },
    { text: 'Recover the Saltbrine fragment — a barnacle on a hull nobody scrapes.' },
    { text: 'Recover the Inkweald fragment — a line from a dream you have not had yet.' },
    { text: 'Return to Orin with all six. Watch the whole prophecy resolve on his table.' },
  ],
  rewards: {
    xp: { thieving: 8000, magic: 5000, agility: 5000, prayer: 3000 },
    items: [{ id: 101, name: 'Coins', count: 18000 }],
    questPoints: 3,
    unlocks: ["area:glass_desert_prophecy_chamber", "item_unlock:orins_spectacles", "teleport:orins_tower_teleport"],
    chain_next: 'sandglass_sage_ascension',
  },
});

rel.defineQuestUnlock('prophecy_fragments', {
  name: 'Prophecy Fragments',
  unlocks: [
    { type: 'item_equip', id: 'orins_spectacles', description: "Orin's Spectacles — let you read any prophecy glyph in Aelgard, reveal hidden dialogue on NPCs" },
    { type: 'teleport', id: 'orins_tower_teleport', description: "Orin's Tower teleport rune — always-available teleport to Glass Desert edge" },
    { type: 'area', id: 'glass_desert_prophecy_chamber', description: "Prophecy Chamber — under Orin's tower, contains a reading table that foreshadows all remaining grandmaster quests" },
  ],
});

quests.define('sandglass_sage_ascension', {
  name: 'Sandglass Sage Ascension',
  description: "The prophecy is whole. Orin has read the last line. It was his name, and yours, and a date. Walk the desert. The glass is listening.",
  difficulty: 'Grandmaster', questPoints: 5,
  requirements: { skills: { magic: 90, prayer: 80, runecrafting: 75, herblore: 75, hitpoints: 90 }, quests: ['prophecy_fragments', 'the_last_dragon_p3', 'desert_treasure'] },
  steps: [
    { text: 'Return to Orin. Find his tower empty, the prophecy unrolled, a note pinned with a shard of the wyrm.' },
    { text: 'Follow the note to the Glass Lake — which forms only when the sun has not set for three days.' },
    { text: 'Walk across the Glass Lake without breaking the surface (Prayer 80, Agility 70 softly recommended).' },
    { text: 'Meet the Sandglass Sage — who is Orin, or who Orin has become, or who Orin was always going to be.' },
    { text: 'Challenge him to the ascension rite: three rounds of magic, one round of silence.' },
    { text: 'Make the choice: succeed him (you become the next Sandglass Sage), walk away (he remains), or break the glass (Aelgard loses sages, gains something new).' },
  ],
  rewards: {
    xp: { magic: 50000, prayer: 20000, runecrafting: 15000, herblore: 12000, hitpoints: 15000 },
    items: [{ id: 101, name: 'Coins', count: 120000 }],
    questPoints: 5,
    unlocks: ["area:glass_desert_sage_tower", "item_unlock:sandglass_staff", "spell_unlock:prophecy_magic"],
  },
});

rel.defineQuestUnlock('sandglass_sage_ascension', {
  name: 'Sandglass Sage Ascension',
  unlocks: [
    { type: 'item_equip', id: 'sandglass_staff', description: 'Sandglass Staff — BIS magic staff Glass Desert-only, resets one cooldown per minute' },
    { type: 'spellbook', id: 'prophecy_magic', description: 'Prophecy Magic — a fourth spellbook; spells read the server log and foretell boss mechanics once per day' },
    { type: 'area', id: 'glass_desert_sage_tower', description: "Sage's Tower (yours, if you chose to succeed Orin) — contains the prophecy table and a bank" },
  ],
});

// ══════════════════════════════════════════════════════════════════════════════
// FOUNDATIONS CHAIN — foundations_of_the_fallen → foundations_of_flame → sootworks_grandmaster_titan
// ══════════════════════════════════════════════════════════════════════════════

quests.define('foundations_of_flame', {
  name: 'Foundations of Flame',
  description: "Fallen. Fell. Now fire. Soot found a hot vein under the Crypt. Boss is bigger than last time. Bring a pick and a prayer. One of each will do.",
  difficulty: 'Experienced', questPoints: 2,
  requirements: { skills: { mining: 60, smithing: 55, firemaking: 50, construction: 50 }, quests: ['foundations_of_the_fallen'] },
  steps: [
    { text: 'Meet Forgemaster Brun at the Crypt shaft. He spits twice, then nods.' },
    { text: 'Sink a new shaft to the hot vein (Mining 60, Construction 50).' },
    { text: 'Tap the fire-iron — a molten ore that cools when carried in silence (Smithing 55).' },
    { text: 'Light the Foundation Furnace from below (Firemaking 50).' },
    { text: 'Fight the flame-wight that crawls out of the seam. Short fight. Hot fight.' },
    { text: 'Bring Brun the first bar. He pockets it. You get the second.' },
  ],
  rewards: {
    xp: { mining: 8000, smithing: 7000, firemaking: 4000, construction: 4000 },
    items: [{ id: 101, name: 'Coins', count: 12000 }],
    questPoints: 2,
    unlocks: ["area:sootworks_foundation_seam", "recipe:fire_iron_alloy", "training_method:foundation_furnace_smithing"],
    chain_next: 'sootworks_grandmaster_titan',
  },
});

rel.defineQuestUnlock('foundations_of_flame', {
  name: 'Foundations of Flame',
  unlocks: [
    { type: 'recipe', id: 'fire_iron_alloy', description: 'Fire-iron alloy — smithing recipe, ore-carrier must be silent the whole journey' },
    { type: 'training_method', id: 'foundation_furnace_smithing', description: 'Foundation Furnace smithing — 25% XP boost, requires fire-iron inputs' },
    { type: 'area', id: 'sootworks_foundation_seam', description: 'Foundation Seam — unique mining area with hot-vein ore, fire-wight respawns' },
  ],
});

quests.define('sootworks_grandmaster_titan', {
  name: 'The Clockwork Heart',
  description: "Big bastard needs a heart. Brun's been pacing. Five bars of fire-iron. Two of silver. One of you. Soot's waiting.",
  difficulty: 'Grandmaster', questPoints: 5,
  requirements: { skills: { smithing: 90, construction: 85, crafting: 80, mining: 80, attack: 80 }, quests: ['foundations_of_flame', 'dragon_slayer_aelgard'] },
  steps: [
    { text: 'Gather materials: 5 fire-iron bars, 2 silvered-steel bars, 1 Sootworks clockwork core.' },
    { text: 'Smith the Clockwork Heart at the Foundation Furnace (Smithing 90). Takes one hour. Do not walk away.' },
    { text: 'Install the heart in the Sootworks Titan, inert in the deep forge (Construction 85, Crafting 80).' },
    { text: 'Wake the Titan. It will not like you at first. Let it pace.' },
    { text: 'Fight the Titan, hand to hammer. No summons, no food, no prayer switches (Attack 80).' },
    { text: 'Win, and it kneels. Lose, and Brun pulls you out before the hammer comes down.' },
    { text: 'Accept the Titan as your summon. It will follow one person, once it has chosen.' },
  ],
  rewards: {
    xp: { smithing: 50000, construction: 25000, crafting: 20000, mining: 20000, attack: 15000 },
    items: [{ id: 101, name: 'Coins', count: 100000 }],
    questPoints: 5,
    unlocks: ["area:sootworks_titan_floor", "item_unlock:steampunk_greataxe", "npc:sootworks_titan_companion"],
  },
});

rel.defineQuestUnlock('sootworks_grandmaster_titan', {
  name: 'The Clockwork Heart',
  unlocks: [
    { type: 'item_equip', id: 'steampunk_greataxe', description: 'Steampunk Greataxe — two-hand slash, BIS until the wyrm tier, consumes fire-iron bars as charges' },
    { type: 'npc', id: 'sootworks_titan_companion', description: 'Sootworks Titan — permanent combat summon, takes 1 fire-iron bar per fight to run' },
    { type: 'area', id: 'sootworks_titan_floor', description: 'Titan Floor — a hangar deep below the Sootworks, your Titan rests here' },
  ],
});

// ══════════════════════════════════════════════════════════════════════════════
// SAND AND SECRETS — sand_and_secrets → cartographers_debt → pharaohs_reckoning_prelude
// ══════════════════════════════════════════════════════════════════════════════

quests.define('the_cartographers_debt', {
  name: "The Cartographer's Debt",
  description: "The desert owes no water; the cartographer owes the desert a map. Whispered it was that her last map was wrong — whispered it was that the dunes moved to prove her wrong. Walk with her, if you would, and balance the ledger.",
  difficulty: 'Experienced', questPoints: 2,
  requirements: { skills: { agility: 55, thieving: 50, firemaking: 45, herblore: 40 }, quests: ['sand_and_secrets'] },
  steps: [
    { text: 'Find Cartographer Nessa in the Boneyard market. She will not look up when you approach — there is a map half-drawn.' },
    { text: 'Walk with her to the Singing Dunes at sunset, which is when the dunes consent to be measured.' },
    { text: 'Survey the seven landmarks she cannot survey alone — three by agility, two by thieving past sand-wraiths, two by reading old glyphs.' },
    { text: 'Return to her tent at dawn. Burn the old map in front of her (Firemaking 45).' },
    { text: "Help her redraw it — the new map is a joint work, and both your names go on it." },
    { text: 'Drink the water she offers. It is the last of her supply. She is paying a debt.' },
  ],
  rewards: {
    xp: { agility: 6000, thieving: 5000, firemaking: 3000, herblore: 2500 },
    items: [{ id: 101, name: 'Coins', count: 10000 }],
    questPoints: 2,
    unlocks: ["item_unlock:nessas_new_map", "npc:cartographer_partnership", "training_method:singing_dunes_survey"],
  },
});

rel.defineQuestUnlock('the_cartographers_debt', {
  name: "The Cartographer's Debt",
  unlocks: [
    { type: 'item_equip', id: 'nessas_new_map', description: "Nessa's New Map — right-click any Boneyard tile to teleport once per hour; updates when dunes move" },
    { type: 'training_method', id: 'singing_dunes_survey', description: 'Singing Dunes survey — repeatable agility/thieving method, bonus XP at sunset only' },
    { type: 'npc', id: 'cartographer_partnership', description: 'Nessa takes you on as partner — commission new maps for unique teleport unlocks' },
  ],
});

quests.define('pharaohs_reckoning_prelude', {
  name: "The Pharaoh's Reckoning",
  description: "Sealed the tomb was, for a long hot time; sealed it no longer is. Pharaoh Senekhet wakes. Three mummy lords walk. Defile the tomb, before the tomb defiles the desert. The prophet is thirsty; the prophet speaks anyway.",
  difficulty: 'Grandmaster', questPoints: 5,
  requirements: { skills: { thieving: 85, agility: 75, magic: 70, prayer: 65, hitpoints: 85 }, quests: ['the_cartographers_debt', 'desert_treasure'] },
  steps: [
    { text: 'Read the new map. The tomb is not where Orin thought. Correct him — politely.' },
    { text: 'Breach the pyramid wards (Thieving 85, Magic 70).' },
    { text: 'Solve the three antechamber puzzles — slide, light, prayer.' },
    { text: 'Defeat the three mummy lords, one per chamber. Each fights differently.' },
    { text: 'Reach the pharaoh. Hear his reckoning — a list of grudges, each older than the kingdom.' },
    { text: 'Defeat Pharaoh Senekhet. Do not loot until he stops twitching.' },
    { text: 'Claim the Ankh. Walk out through the collapse — the tomb is closing for good.' },
  ],
  rewards: {
    xp: { thieving: 50000, agility: 20000, magic: 15000, prayer: 10000, hitpoints: 10000 },
    items: [{ id: 101, name: 'Coins', count: 90000 }],
    questPoints: 5,
    unlocks: ["boss:senekhet_repeatable", "item_unlock:ankh_of_rebirth", "item_unlock:pharaohs_crown"],
    chain_next: 'the_boneyard_first_empire_rite',
  },
});

rel.defineQuestUnlock('pharaohs_reckoning_prelude', {
  name: "The Pharaoh's Reckoning",
  unlocks: [
    { type: 'item_equip', id: 'ankh_of_rebirth', description: 'Ankh of Rebirth — amulet, one per-day free respawn without item loss, +3 prayer' },
    { type: 'item_equip', id: 'pharaohs_crown', description: "Pharaoh's Crown — head slot, +2 prayer, grants Sand Form (brief sand-storm immunity) once per hour" },
    { type: 'boss', id: 'senekhet_repeatable', description: 'Pharaoh Senekhet repeatable — grandmaster boss in the re-sealed tomb with unique drops' },
  ],
});

// ══════════════════════════════════════════════════════════════════════════════
// INTO THE WILDS — into_the_wilds → revenant_oath → wilds_grandmaster_crown
// ══════════════════════════════════════════════════════════════════════════════

quests.define('the_revenant_oath', {
  name: 'The Revenant Oath',
  description: "Wilds, north. Cold. The revenants remember oaths. You will make one. Keep it. Or don't.",
  difficulty: 'Experienced', questPoints: 2,
  requirements: { skills: { attack: 65, ranged: 60, prayer: 55, agility: 50, hitpoints: 65 }, quests: ['into_the_wilds'] },
  steps: [
    { text: 'Cross into the deep Wilds at the black obelisk. Kneel. Speak the oath Ranger Tomas taught you.' },
    { text: 'Do not attack the first revenant that approaches. It will test you.' },
    { text: 'Accept the first revenant task — kill three PKers who attack you unprovoked. Do not initiate.' },
    { text: 'Return to the obelisk alive, with three skulls in a sack.' },
    { text: 'Bind the oath to a relic. The relic will bleed if you break the oath.' },
    { text: 'Walk out of the Wilds carrying the relic. You will be followed.' },
  ],
  rewards: {
    xp: { attack: 8000, ranged: 6000, prayer: 4000, agility: 4000, hitpoints: 4000 },
    items: [{ id: 101, name: 'Coins', count: 20000 }],
    questPoints: 2,
    unlocks: ["area:wilds_obelisk_safe_point", "item_unlock:revenant_oath_relic", "training_method:wilds_sworn_revenant_hunt"],
  },
});

rel.defineQuestUnlock('the_revenant_oath', {
  name: 'The Revenant Oath',
  unlocks: [
    { type: 'item_equip', id: 'revenant_oath_relic', description: "Revenant Oath Relic — pocket slot, +15% damage vs revenants, bleeds if you break the oath (kill anyone unprovoked)" },
    { type: 'area', id: 'wilds_obelisk_safe_point', description: 'Black Obelisk — a single safe spot in deep Wilds (bank access, one-way teleport out)' },
    { type: 'training_method', id: 'wilds_sworn_revenant_hunt', description: 'Sworn revenant hunt — PvP-safe revenant combat while oath is unbroken, unique ether drops' },
  ],
});

quests.define('the_wilds_grandmaster_crown', {
  name: 'Coronation of the Revenant King',
  description: "King. Revenant. Deep Wilds. He crowns the dying; you will crown him ended. Do it fast. PKers come.",
  difficulty: 'Grandmaster', questPoints: 5,
  requirements: { skills: { attack: 85, ranged: 85, prayer: 80, hitpoints: 90, magic: 70 }, quests: ['the_revenant_oath', 'wilderness_sword'] },
  steps: [
    { text: 'Equip the Wilderness Blade and the Revenant Oath Relic. Enter the Wilds from any direction but south.' },
    { text: 'Reach the Revenant King\'s throne in the deepest Wilds. Survive ambushes.' },
    { text: 'Do not speak with him — he will try to crown you. Attack within ten seconds of arrival.' },
    { text: 'Phase 1: he duels with a rusted sword older than Aelgard.' },
    { text: 'Phase 2: he calls six revenant knights. Kill him before they close.' },
    { text: 'Phase 3: he drops the crown. Pick it up. Leave before the Wilds collapses his throne.' },
    { text: 'Return to Ranger Tomas. Hand him the crown. He will refuse it. Put it on.' },
  ],
  rewards: {
    xp: { attack: 40000, ranged: 20000, prayer: 15000, hitpoints: 20000, magic: 10000 },
    items: [{ id: 101, name: 'Coins', count: 120000 }],
    questPoints: 5,
    unlocks: ["area:wilds_revenant_throne", "item_unlock:revenant_ether_mace", "item_unlock:wilderness_crown"],
  },
});

rel.defineQuestUnlock('the_wilds_grandmaster_crown', {
  name: 'Coronation of the Revenant King',
  unlocks: [
    { type: 'item_equip', id: 'wilderness_crown', description: 'Wilderness Crown — head slot, +15% damage in Wilds, revenants will not attack first' },
    { type: 'item_equip', id: 'revenant_ether_mace', description: 'Revenant Ether Mace — crush weapon, BIS Wilds-only, consumes ether per hit' },
    { type: 'area', id: 'wilds_revenant_throne', description: "Revenant Throne — your throne now, a private camp in deep Wilds with PvP-safe bank" },
  ],
});

// ══════════════════════════════════════════════════════════════════════════════
// COUNTERFEIT EMPIRE — counterfeit_ring → counterfeit_empire
// ══════════════════════════════════════════════════════════════════════════════

quests.define('the_counterfeit_empire', {
  name: 'The Counterfeit Empire',
  description: "Aye, one ring was small beer. Three regions' worth of fake coin is another tot entire. The smugglers' cove has grown fangs. Bring the loupe, and a longer knife than the last time.",
  difficulty: 'Master', questPoints: 3,
  requirements: { skills: { thieving: 75, crafting: 65, magic: 55, attack: 65 }, quests: ['the_counterfeit_ring'] },
  steps: [
    { text: "At the Smugglers' Cove, ask after a woman named Mother Oreline. Nobody answers. Leave her a bronze coin on the bar." },
    { text: 'She finds you. She offers tea. Accept. Her tea is real — everything else in the cove is not.' },
    { text: 'Infiltrate the counterfeit empire across Saltbrine, Heartlands, and Moryskah (Thieving 75).' },
    { text: 'Identify the three mints. Each has a lieutenant. Each lieutenant has a weakness.' },
    { text: 'Dismantle or absorb the empire, player choice — dismantle means fight, absorb means become the mint.' },
    { text: 'Return to Ruven Mourn with evidence (dismantle path) or with a new pouch of fakes he can re-stamp (absorb path).' },
  ],
  rewards: {
    xp: { thieving: 20000, crafting: 10000, magic: 5000, attack: 8000 },
    items: [{ id: 101, name: 'Coins', count: 50000 }],
    questPoints: 3,
    unlocks: ["area:saltbrine_counterfeit_vault", "item_unlock:mother_orelines_loupe", "shop:fence_network"],
  },
});

rel.defineQuestUnlock('the_counterfeit_empire', {
  name: 'The Counterfeit Empire',
  unlocks: [
    { type: 'item_equip', id: 'mother_orelines_loupe', description: "Mother Oreline's Loupe — upgraded Inspector's Loupe, identifies all fakes at a glance, +10% thieving" },
    { type: 'shop', id: 'fence_network', description: 'Fence Network — sell any stolen/counterfeit item at premium prices, cross-region shop' },
    { type: 'area', id: 'saltbrine_counterfeit_vault', description: 'Counterfeit Vault — a stash with three bank tabs that only you can access' },
  ],
});

// ══════════════════════════════════════════════════════════════════════════════
// HEARTLANDS PATROL — patrol → uprising → grandmaster_feast
// ══════════════════════════════════════════════════════════════════════════════

quests.define('the_heartlands_uprising', {
  name: 'The Heartlands Uprising',
  description: "Captain Alden looks tired. The Heartlands does not rebel, as a rule, but a rule is a thing that can be broken. There is a rally in the south fields, and Alden would rather you walked into it before he had to send the militia.",
  difficulty: 'Experienced', questPoints: 2,
  requirements: { skills: { thieving: 50, attack: 55, prayer: 45, agility: 45 }, quests: ['heartlands_patrol', 'forge_of_duran'] },
  steps: [
    { text: 'Meet Captain Alden at the town square at noon. He looks tired. He always does, now.' },
    { text: 'Walk south to the rally. Listen before you speak. The grievances are real.' },
    { text: 'Identify the ringleader — not the loudest, the quietest (Thieving 50).' },
    { text: 'Negotiate with the ringleader. Three outcomes: disperse, reform, revolt.' },
    { text: 'If revolt: defend the town square alongside Alden (Attack 55).' },
    { text: 'Return to Alden. He pours you the bad whisky, which is what he drinks when he means it.' },
  ],
  rewards: {
    xp: { thieving: 5000, attack: 5000, prayer: 3000, agility: 2500 },
    items: [{ id: 101, name: 'Coins', count: 8000 }],
    questPoints: 2,
    unlocks: ["item_unlock:aldens_patrol_cloak", "npc:alden_quartermaster", "training_method:heartlands_patrol_drills"],
  },
});

rel.defineQuestUnlock('the_heartlands_uprising', {
  name: 'The Heartlands Uprising',
  unlocks: [
    { type: 'item_equip', id: 'aldens_patrol_cloak', description: "Alden's Patrol Cloak — back slot, +2 prayer, Heartlands NPCs volunteer information" },
    { type: 'npc', id: 'alden_quartermaster', description: 'Alden promotes you to patrol quartermaster — access militia stores, request backup once per day' },
    { type: 'training_method', id: 'heartlands_patrol_drills', description: 'Patrol drills — repeatable combat-training method with militia NPCs, no item loss on death' },
  ],
});

quests.define('the_heartlands_grandmaster_feast', {
  name: 'The Grand Feast',
  description: "Master Chef Oleander has heard of you. Host the Grand Feast at the Cooking Guild. Ten courses. Heartlands ingredients only. The Royal Court will attend. The Master Chef title will be earned, or a very public failure will follow.",
  difficulty: 'Grandmaster', questPoints: 5,
  requirements: { skills: { cooking: 90, farming: 80, fishing: 75, herblore: 70, hunter: 65 }, quests: ['the_heartlands_uprising', 'rfd_finale'] },
  steps: [
    { text: 'Accept the commission from Master Chef Oleander at the Cooking Guild.' },
    { text: 'Source ten courses from Heartlands farms, rivers, woods, and hunts — no import allowed.' },
    { text: 'Plan the menu with Oleander and the pastry second. Taste tests are brutal.' },
    { text: 'Cook every course yourself, within two hours, on feast night (Cooking 90).' },
    { text: 'Serve the Royal Court. One of them will complain. Handle it without losing your head.' },
    { text: 'Survive dessert. A rogue chef poisons the ninth course — you must catch it (Herblore 70).' },
    { text: 'Fight the rogue chef in the kitchen after service. Do not break the plates.' },
    { text: 'Earn the title. Oleander hands you her apron.' },
  ],
  rewards: {
    xp: { cooking: 50000, farming: 20000, fishing: 15000, herblore: 10000, hunter: 8000 },
    items: [{ id: 101, name: 'Coins', count: 100000 }],
    questPoints: 5,
    unlocks: ["area:heartlands_private_kitchen", "item_unlock:culinaromancer_gloves_pristine", "item_unlock:master_chef_apron"],
  },
});

rel.defineQuestUnlock('the_heartlands_grandmaster_feast', {
  name: 'The Grand Feast',
  unlocks: [
    { type: 'item_equip', id: 'master_chef_apron', description: "Master Chef's Apron — chest slot, halves burn rate at any range, cooking XP +10%" },
    { type: 'item_equip', id: 'culinaromancer_gloves_pristine', description: "Pristine Culinaromancer Gloves — upgrade of Barrows Gloves with cooking bonuses" },
    { type: 'area', id: 'heartlands_private_kitchen', description: 'Private Kitchen in the Guild — your own range, farm plot, and fishing pond on-site' },
  ],
});

// ══════════════════════════════════════════════════════════════════════════════
// WORLD QUESTS — span 3+ regions each
// ══════════════════════════════════════════════════════════════════════════════

quests.define('the_comet_of_ash', {
  name: 'The Comet of Ash',
  description: "A comet fell out of the wrong sky seven nights ago. It landed in the Boneyard. Its ash is spreading. Five regions report strange weather. Track the comet; understand what it was; decide what to do with what it left.",
  difficulty: 'Master', questPoints: 4,
  requirements: { skills: { magic: 70, herblore: 60, prayer: 60, agility: 60, runecrafting: 55 }, quests: ['prophecy_fragments'] },
  steps: [
    { text: 'Start at Crystal Sage Orin. He has plotted the trajectory on his table.' },
    { text: 'Heartlands: a crop circle of ash where the comet grazed the sky — sample it, talk to the farmer.' },
    { text: 'Sootworks: the comet singed the deep-forge chimney — collect the soot-glass residue.' },
    { text: 'Veilwood: moonhawks are confused, flying in reversed spirals — observe for a full night.' },
    { text: 'Boneyard: the crater, still warm — extract a shard from the core.' },
    { text: 'Glass Desert: the comet was already expected here, and the sandglass sage knows why.' },
    { text: 'Combine the five samples at Orin\'s table. The comet is a message. Decipher it.' },
    { text: 'Decide: bury the comet, broadcast its message, or hold it as a private secret.' },
  ],
  rewards: {
    xp: { magic: 15000, herblore: 8000, prayer: 6000, agility: 6000, runecrafting: 5000 },
    items: [{ id: 101, name: 'Coins', count: 35000 }],
    questPoints: 4,
    unlocks: ["item_unlock:comet_shard_pendant", "spell_unlock:comet_minor_prophecy", "training_method:comet_ash_runecrafting"],
  },
});

rel.defineQuestUnlock('the_comet_of_ash', {
  name: 'The Comet of Ash',
  unlocks: [
    { type: 'item_equip', id: 'comet_shard_pendant', description: 'Comet Shard Pendant — amulet, +3 to magic/prayer, once per day sends a message to any player on the server' },
    { type: 'spellbook', id: 'comet_minor_prophecy', description: 'Minor Prophecy spells — three cantrips appended to your current spellbook (read item, read intent, read weather)' },
    { type: 'training_method', id: 'comet_ash_runecrafting', description: 'Comet Ash Runecrafting — rare runecrafting method using comet residue, unique rune output' },
  ],
});

quests.define('the_merchant_empires_fall', {
  name: "The Merchant Empire's Fall",
  description: "The Drifting Market Charter is a piece of paper; the Drifting Market itself is an empire of favours and fakes, and it is about to collapse. Save it, inherit it, or watch it burn — whichever suits you, but four regions are waiting on the answer.",
  difficulty: 'Master', questPoints: 4,
  requirements: { skills: { thieving: 70, crafting: 65, magic: 55, cooking: 50 }, quests: ['drifting_market_charter', 'the_counterfeit_empire'] },
  steps: [
    { text: 'Board the Drifting Market at its current dock (Heartlands this week).' },
    { text: 'Meet the four regional factionheads — Heartlands guild rep, Moryskah relic broker, Sootworks ore cartel, Saltbrine pirate king proxy.' },
    { text: 'Each factionhead gives you a book of their grievances. Each book contradicts the others.' },
    { text: 'Negotiate, blackmail, or expose — player choice per factionhead.' },
    { text: 'Convene the council at the Drifting Market. Broker peace, coup, or split.' },
    { text: 'Survive the assassination attempt at the council dinner (poisoned wine).' },
    { text: 'Stand by your outcome. The market either drifts on, shatters into four, or becomes yours.' },
  ],
  rewards: {
    xp: { thieving: 12000, crafting: 8000, magic: 5000, cooking: 4000 },
    items: [{ id: 101, name: 'Coins', count: 40000 }],
    questPoints: 4,
    unlocks: ["item_unlock:market_charter_seal", "shop:drifting_market_private_shops", "teleport:market_ring_teleport"],
  },
});

rel.defineQuestUnlock('the_merchant_empires_fall', {
  name: "The Merchant Empire's Fall",
  unlocks: [
    { type: 'item_equip', id: 'market_charter_seal', description: 'Market Charter Seal — ring slot, grants discounts or partial ownership at the Drifting Market depending on outcome' },
    { type: 'shop', id: 'drifting_market_private_shops', description: 'Four new specialty shops reopen on the Drifting Market, each region-coded' },
    { type: 'teleport', id: 'market_ring_teleport', description: 'Ring-bound teleport to the Drifting Market regardless of its current dock' },
  ],
});

quests.define('the_wandering_plague', {
  name: 'The Wandering Plague',
  description: 'A plague walks the roads between Heartlands, Moryskah, and the Boneyard — it does not care for borders, weather, or prayers. Trace its carrier; find its origin; cure it or contain it before the next caravan dies coughing.',
  difficulty: 'Experienced', questPoints: 3,
  requirements: { skills: { herblore: 65, prayer: 55, thieving: 50, agility: 50 }, quests: ['the_bog_witchs_bargain'] },
  steps: [
    { text: 'Examine a dying caravaner at the Heartlands border post (Herblore 65).' },
    { text: 'Follow the backtrail to Moryskah — the plague started in a village behind the fog.' },
    { text: 'Interview the three survivors. One is lying. Identify which (Thieving 50).' },
    { text: 'Track the true source into the Boneyard, where a specific well has been spat into by a specific thing.' },
    { text: 'Secure the well. Brew the three-region antidote at the Bog Witch\'s cottage.' },
    { text: 'Deliver the antidote to the caravan routes. Administer personally to the worst-hit.' },
  ],
  rewards: {
    xp: { herblore: 15000, prayer: 6000, thieving: 4000, agility: 4000 },
    items: [{ id: 101, name: 'Coins', count: 18000 }],
    questPoints: 3,
    unlocks: ["item_unlock:plague_doctors_mask", "npc:plague_doctor_npc", "recipe:three_region_antidote"],
  },
});

rel.defineQuestUnlock('the_wandering_plague', {
  name: 'The Wandering Plague',
  unlocks: [
    { type: 'recipe', id: 'three_region_antidote', description: 'Three-Region Antidote — herblore recipe requiring ingredients from all three regions, cures every non-unique disease in Aelgard' },
    { type: 'item_equip', id: 'plague_doctors_mask', description: "Plague Doctor's Mask — head slot, poison immunity, +5% herblore success" },
    { type: 'npc', id: 'plague_doctor_npc', description: 'Plague Doctor travels the three regions — dispenses daily rare-herb assignments' },
  ],
});

quests.define('the_lost_god_returns', {
  name: 'The Lost God Returns',
  description: "Six regions have reported a stranger at the crossroads — same face, same voice, same promise. The old histories name her the Lost God. She is testing you across six regions simultaneously, and the world will be changed by your answers.",
  difficulty: 'Grandmaster', questPoints: 5,
  requirements: { skills: { prayer: 85, magic: 80, attack: 75, thieving: 70, herblore: 70 }, quests: ['rfd_finale', 'desert_treasure', 'lunar_diplomacy'] },
  steps: [
    { text: 'Meet the stranger at the Heartlands crossroad — she asks you to lie to a stranger on her behalf.' },
    { text: 'Meet her at the Moryskah crossroad — she asks you to leave a grave unvisited.' },
    { text: 'Meet her at the Boneyard crossroad — she asks you to pour out your water.' },
    { text: 'Meet her at the Veilwood crossroad — she asks you to cut down a tree you promised you would not.' },
    { text: 'Meet her at the Saltbrine crossroad — she asks you to burn a letter unread.' },
    { text: 'Meet her at the Sootworks crossroad — she asks you to forge a weapon you will never wield.' },
    { text: 'She returns to Glass Desert. She asks what you learned. There is no correct answer.' },
    { text: 'She offers apotheosis. Accept, refuse, or propose a third thing. The server remembers.' },
  ],
  rewards: {
    xp: { prayer: 40000, magic: 25000, attack: 15000, thieving: 12000, herblore: 12000 },
    items: [{ id: 101, name: 'Coins', count: 150000 }],
    questPoints: 5,
    unlocks: ["area:lost_gods_crossroad_shrine", "item_unlock:lost_gods_sigil", "prayer_unlock:lost_gods_mercy"],
  },
});

rel.defineQuestUnlock('the_lost_god_returns', {
  name: 'The Lost God Returns',
  unlocks: [
    { type: 'prayer', id: 'lost_gods_mercy', description: "Lost God's Mercy prayer — once per week, any single death is undone (requires keeping the relic in inventory)" },
    { type: 'item_equip', id: 'lost_gods_sigil', description: "Lost God's Sigil — neck slot, bound to your apotheosis outcome, stats vary by path chosen" },
    { type: 'area', id: 'lost_gods_crossroad_shrine', description: 'Crossroad Shrine — a small temple appears at the seventh crossroad, accessible only to you' },
  ],
});

// ══════════════════════════════════════════════════════════════════════════════
// ADDITIONAL MINIQUEST / CAPSTONE — unique unlocks
// ══════════════════════════════════════════════════════════════════════════════

quests.define('the_boneyard_first_empire_rite', {
  name: 'The First Empire Rite',
  description: "The Architect of Ruin built with the bones of the First Empire; the bones remember being built with. Walk the rite the Architect refused to walk — nine steps, nine stones, nine names none living have spoken.",
  difficulty: 'Master', questPoints: 3,
  requirements: { skills: { prayer: 70, mining: 65, magic: 60, thieving: 55 }, quests: ['bones_of_the_first_empire', 'the_architect_of_ruin'] },
  steps: [
    { text: 'Enter the First Empire ruins at the Boneyard edge. Bring no water.' },
    { text: 'At each of the nine stones, speak the name carved on the stone — do not guess, read.' },
    { text: 'A ninth stone has no name. Carve one. It must be yours.' },
    { text: 'Walk the rite in order, without backtracking (Agility 55 recommended, Prayer 70 required).' },
    { text: 'The First Empire Queen rises. Speak with her; do not fight.' },
    { text: 'Accept her blessing or her refusal — both are permanent.' },
  ],
  rewards: {
    xp: { prayer: 15000, mining: 8000, magic: 6000, thieving: 4000 },
    items: [{ id: 101, name: 'Coins', count: 25000 }],
    questPoints: 3,
    unlocks: ["area:boneyard_first_empire_vault", "item_unlock:first_empire_signet", "prayer_unlock:first_empire_blessing"],
  },
});

rel.defineQuestUnlock('the_boneyard_first_empire_rite', {
  name: 'The First Empire Rite',
  unlocks: [
    { type: 'prayer', id: 'first_empire_blessing', description: 'First Empire Blessing prayer — once per day, resurrect as sand for ten seconds in the Boneyard' },
    { type: 'area', id: 'boneyard_first_empire_vault', description: 'First Empire Vault — permanent bank access inside the ruins, rare relic respawns' },
    { type: 'item_equip', id: 'first_empire_signet', description: 'First Empire Signet — ring, grants the First Empire Queen as a one-time quest-answer oracle (any quest, any question)' },
  ],
});

quests.define('the_inkweald_mirror', {
  name: 'The Inkweald Mirror',
  description: "A mirror there is, in the Inkweald's third grove, that shows not your face but the face of what you will have become, if you continue; sought, few have; walked away, fewer still; laughed, none.",
  difficulty: 'Experienced', questPoints: 2,
  requirements: { skills: { magic: 60, herblore: 55, prayer: 45, thieving: 40 }, quests: ['the_inkweald_door'] },
  steps: [
    { text: 'Into the third grove go — at noon, when the Inkweald pretends to be awake.' },
    { text: 'The mirror will be covered. Uncover it alone.' },
    { text: 'Look. Do not flinch, and do not leave before the mirror has finished.' },
    { text: "Name what you saw — the mirror will not release you until the name is spoken." },
    { text: 'Take the shard the mirror gives you — a single splinter, which is what you will have cost yourself.' },
  ],
  rewards: {
    xp: { magic: 6000, herblore: 4000, prayer: 3000, thieving: 2500 },
    items: [{ id: 101, name: 'Coins', count: 8000 }],
    questPoints: 2,
    unlocks: ["area:inkweald_third_grove", "item_unlock:inkweald_mirror_shard", "training_method:inkweald_mirror_meditation"],
  },
});

rel.defineQuestUnlock('the_inkweald_mirror', {
  name: 'The Inkweald Mirror',
  unlocks: [
    { type: 'item_equip', id: 'inkweald_mirror_shard', description: "Mirror Shard — pocket slot, reveals one PKer's intent per day, shows you a glimpse of one possible future once per session" },
    { type: 'training_method', id: 'inkweald_mirror_meditation', description: 'Mirror meditation — AFK prayer method unique to the third grove, scales with your mirrored-future' },
    { type: 'area', id: 'inkweald_third_grove', description: 'Third Grove — a private meditative space, the mirror remains for future visits' },
  ],
});

quests.define('the_cartography_grandmaster', {
  name: 'The Cartography Grandmaster',
  description: "Every region mapped has now been; mapped the space between them has not. Asked, Cartographer Nessa is, to draw the Map of Maps — the living atlas of Aelgard. Her partner, you are. Walk every border with her.",
  difficulty: 'Grandmaster', questPoints: 4,
  requirements: { skills: { agility: 80, thieving: 70, firemaking: 60, herblore: 60, fishing: 60 }, quests: ['the_cartographers_debt', 'the_aelgard_atlas'] },
  steps: [
    { text: 'Meet Nessa at the Boneyard market. She will have a cart. You will have a spare pair of boots.' },
    { text: 'Walk the Heartlands-Moryskah border at dusk. Measure it.' },
    { text: 'Walk the Moryskah-Boneyard border at midnight. Measure it.' },
    { text: 'Walk the Boneyard-Glass Desert border at noon. Measure it.' },
    { text: 'Walk the Glass Desert-Inkweald dream border — there is no daylight to measure it by.' },
    { text: 'Walk the Inkweald-Veilwood border by scent only.' },
    { text: 'Walk the Veilwood-Sootworks border underground.' },
    { text: 'Walk the Sootworks-Saltbrine border along the drainage canal.' },
    { text: 'Walk the Saltbrine-Wilds border in the company of a revenant who owes you a favour.' },
    { text: 'Return to Nessa. Draw the Map of Maps together at her new table — the table is larger than last time.' },
  ],
  rewards: {
    xp: { agility: 40000, thieving: 15000, firemaking: 8000, herblore: 8000, fishing: 8000 },
    items: [{ id: 101, name: 'Coins', count: 75000 }],
    questPoints: 4,
    unlocks: ["item_unlock:map_of_maps", "npc:nessa_retired", "training_method:border_running_agility"],
  },
});

rel.defineQuestUnlock('the_cartography_grandmaster', {
  name: 'The Cartography Grandmaster',
  unlocks: [
    { type: 'item_equip', id: 'map_of_maps', description: 'Map of Maps — consumes a slot, teleport to ANY previously-visited location once per hour, updates in real time' },
    { type: 'training_method', id: 'border_running_agility', description: 'Border running — agility method at any region border with unique XP bonuses' },
    { type: 'npc', id: 'nessa_retired', description: 'Nessa retires from field work — you inherit her commission ledger, assign yourself map-quests for rewards' },
  ],
});

quests.define('the_last_prayer', {
  name: 'The Last Prayer',
  description: "There is a prayer nobody alive has finished. Its three verses are in three places — a chapel in Heartlands, a wight's mouth in Moryskah, and a revenant's crown in the Wilds. Finish the prayer; decide whether to say it.",
  difficulty: 'Grandmaster', questPoints: 4,
  requirements: { skills: { prayer: 85, attack: 70, magic: 65, thieving: 60, hitpoints: 75 }, quests: ['blood_rites', 'the_revenant_oath'] },
  steps: [
    { text: 'At the Heartlands chapel, read the first verse aloud — it was written on the altar but is scratched over.' },
    { text: 'In Moryskah, find the wight whose mouth hums the second verse — kill it without silencing the hum.' },
    { text: 'In the Wilds, take the third verse from the revenant king (or the throne, if you have it).' },
    { text: 'Return to the chapel. Speak all three verses in order. A hole will open in the air.' },
    { text: 'Decide: finish the prayer (world-affecting choice), leave it unfinished (it will wait), or overwrite the last verse with your own.' },
  ],
  rewards: {
    xp: { prayer: 40000, attack: 10000, magic: 8000, thieving: 6000, hitpoints: 10000 },
    items: [{ id: 101, name: 'Coins', count: 80000 }],
    questPoints: 4,
    unlocks: ["area:heartlands_chapel_undercroft", "item_unlock:last_prayer_sigil", "prayer_unlock:last_prayer_unique"],
  },
});

rel.defineQuestUnlock('the_last_prayer', {
  name: 'The Last Prayer',
  unlocks: [
    { type: 'prayer', id: 'last_prayer_unique', description: 'The Last Prayer — one-per-day, effect depends on ending chosen (revive, smite, or rewrite)' },
    { type: 'item_equip', id: 'last_prayer_sigil', description: 'Last Prayer Sigil — ring, +5 prayer, auto-activates once per fight when you hit 1 hp' },
    { type: 'area', id: 'heartlands_chapel_undercroft', description: 'Chapel Undercroft — a small room under the altar, contains the finished prayer if you finished it' },
  ],
});

// ══════════════════════════════════════════════════════════════════════════════

console.log('[aelgard] quest series extensions loaded (32 quests)');
