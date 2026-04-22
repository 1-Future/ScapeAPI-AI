// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Quest Blitz
// 30 new quests across all 8 regions + The Wilds.
// Categories:
//   1. Skill introduction quests (5): farming, construction, hunter, runecrafting, firemaking
//   2. Region lore chains (8): one per region
//   3. Multi-region adventures (8): spanning 3+ regions each
//   4. Combat challenges (5): boss-gated with unique mechanics
//   5. Social/group quests (4): multiplayer-oriented
//
// Every skill appears in at least one quest. 10+ quests span 2+ regions.
// ══════════════════════════════════════════════════════════════════════════════

const quests = require('../../data/quests');

// ══════════════════════════════════════════════════════════════════════════════
// SKILL INTRODUCTION QUESTS (5)
// ══════════════════════════════════════════════════════════════════════════════

// ── 1. Roots of the Old Growth (Farming deep-dive) ───────────────────────────
// Regions: Heartlands → Veilwood
quests.define('roots_of_the_old_growth', {
  name: 'Roots of the Old Growth',
  description: 'An ancient tree in the Heartlands is dying. The only hope is a forbidden grafting technique known to the Veilwood druids — but the ritual demands more than seeds.',
  difficulty: 'Intermediate',
  questPoints: 2,
  requirements: { skills: { farming: 25, herblore: 20, woodcutting: 15 } },
  steps: [
    { text: 'Speak with Elder Marwen beside the withering Great Ash in Heartlands.' },
    { text: 'Harvest bark samples from the dying tree using a pruning knife (Farming 15).' },
    { text: 'Travel to Veilwood and locate the Druid Circle south of the canopy lake.' },
    { text: 'Convince Archdruid Elara to teach you the Rootsong technique by gathering 5 Moonroot bulbs from the forest floor (Farming 25).' },
    { text: 'Prepare a soil restoration potion from the bulbs and sacred water (Herblore 20).' },
    { text: 'Chop a living branch from the Heart-Oak with the druid\'s blessing (Woodcutting 15).' },
    { text: 'Return to the Heartlands and perform the grafting ritual under moonlight.' },
    { text: 'Protect the sapling from 3 waves of blighted insects (combat, any style).' },
    { text: 'Speak with Elder Marwen as the Great Ash blooms again.' },
  ],
  rewards: {
    xp: { farming: 3000, herblore: 1500, woodcutting: 800 },
    items: [{ id: 101, name: 'Coins', count: 4000 }, { id: 12460, name: 'Druid\'s planting dibber', count: 1 }],
    questPoints: 2,
    unlocks: ["item_unlock:roots_of_the_old_growth_completion"],
  },
});

// ── 2. Foundations of the Fallen (Construction intro) ─────────────────────────
// Regions: Heartlands → Sootworks
quests.define('foundations_of_the_fallen', {
  name: 'Foundations of the Fallen',
  description: 'A ruined chapel in the Heartlands holds secrets beneath its collapsed floor. You must rebuild it — but the lost dwarven engineering techniques lie buried in the Sootworks.',
  difficulty: 'Intermediate',
  questPoints: 2,
  requirements: { skills: { construction: 20, mining: 20, smithing: 15 } },
  steps: [
    { text: 'Investigate the collapsed Chapel of the Last Light in eastern Heartlands.' },
    { text: 'Mine 10 limestone blocks from the chapel quarry (Mining 20).' },
    { text: 'Discover that the original builders used Sootworks deep-stone techniques.' },
    { text: 'Travel to the Sootworks and find Foreman Grukk in the Steam District.' },
    { text: 'Learn the Sootworks joint technique by smithing 5 reinforced brackets (Smithing 15).' },
    { text: 'Return to the chapel and lay the foundation using the new technique (Construction 20).' },
    { text: 'Rebuild the chapel walls — place 4 wall segments correctly to pass the structural check.' },
    { text: 'Raise the roof beam using a pulley system you construct on-site.' },
    { text: 'Light the chapel lantern and discover the hidden crypt beneath the altar.' },
    { text: 'Report your findings to the Heartlands Archives.' },
  ],
  rewards: {
    xp: { construction: 3500, mining: 1500, smithing: 1000 },
    items: [{ id: 101, name: 'Coins', count: 5000 }, { id: 14001, name: 'Builder\'s hammer', count: 1 }],
    questPoints: 2,
    unlocks: ["area:heartlands_hidden_crypt", "recipe:sootworks_joint"],
  },
});

// ── 3. The Silent Hunt (Hunter intro) ─────────────────────────────────────────
// Regions: Veilwood → Boneyard Wastes
quests.define('the_silent_hunt', {
  name: 'The Silent Hunt',
  description: 'A rare creature has escaped from Veilwood into the Boneyard Wastes. Track it across two biomes using techniques no ordinary adventurer knows.',
  difficulty: 'Intermediate',
  questPoints: 2,
  requirements: { skills: { hunter: 20, agility: 15, crafting: 15 } },
  steps: [
    { text: 'Meet Ranger Hale at the Veilwood perimeter, where tracks lead into the open desert.' },
    { text: 'Craft a set of pitfall traps from Veilwood timber and vine rope (Crafting 15).' },
    { text: 'Follow the creature\'s trail through the Veilwood canopy — navigate 3 agility obstacles (Agility 15).' },
    { text: 'The tracks cross into the Boneyard Wastes. Adjust your gear for desert tracking.' },
    { text: 'Set box traps near the oasis where the creature drinks at dusk (Hunter 20).' },
    { text: 'Wait for nightfall and approach the creature without spooking it — stealth check.' },
    { text: 'Capture the Shade Lynx alive in a reinforced cage.' },
    { text: 'Return the Shade Lynx to Ranger Hale in Veilwood.' },
  ],
  rewards: {
    xp: { hunter: 3000, agility: 1200, crafting: 1000 },
    items: [{ id: 101, name: 'Coins', count: 3500 }, { id: 14010, name: 'Ranger\'s noose wand', count: 1 }],
    questPoints: 2,
    unlocks: ["item_unlock:the_silent_hunt_completion"],
  },
});

// ── 4. The Essence Convergence (Runecrafting intro) ───────────────────────────
// Regions: Heartlands → The Inkweald
quests.define('the_essence_convergence', {
  name: 'The Essence Convergence',
  description: 'The runic altars are weakening. A wizard in the Heartlands believes the answer lies in the Inkweald, where raw magical essence bleeds through the dreamscape.',
  difficulty: 'Intermediate',
  questPoints: 2,
  requirements: { skills: { runecrafting: 20, magic: 20, mining: 15 } },
  steps: [
    { text: 'Speak with Wizard Theron at the Heartlands Runecrafting Guild.' },
    { text: 'Mine 15 rune essence from the essence mine beneath the guild (Mining 15).' },
    { text: 'Craft a batch of air runes to demonstrate your skill (Runecrafting 15).' },
    { text: 'Theron reveals the altars need Dream Essence — only found in the Inkweald.' },
    { text: 'Travel to the Inkweald and navigate the shifting paths to the Essence Rift.' },
    { text: 'Channel magic through 3 unstable nodes to stabilize the rift (Magic 20).' },
    { text: 'Collect 5 Dream Essence fragments from the stabilized rift (Runecrafting 20).' },
    { text: 'Return to the Heartlands and infuse the altar with Dream Essence.' },
    { text: 'Craft the first Dream Rune — a new type only you can make.' },
  ],
  rewards: {
    xp: { runecrafting: 3500, magic: 2000, mining: 800 },
    items: [{ id: 14020, name: 'Dream rune', count: 50 }, { id: 14021, name: 'Essence pouch (small)', count: 1 }],
    questPoints: 2,
    unlocks: ["item_unlock:the_essence_convergence_completion"],
    chain_next: 'the_runecasters_paradox',
  },
});

// ── 5. The Eternal Pyre (Firemaking challenge) ────────────────────────────────
// Regions: Moryskah → Boneyard Wastes
quests.define('the_eternal_pyre', {
  name: 'The Eternal Pyre',
  description: 'The sacred flame of Moryskah has died for the first time in a thousand years. To relight it, you must trek into the Boneyard Wastes and retrieve fire from the heart of the sun-scorched earth.',
  difficulty: 'Intermediate',
  questPoints: 2,
  requirements: { skills: { firemaking: 25, woodcutting: 20, prayer: 15 } },
  steps: [
    { text: 'Visit the Temple of Embers in Moryskah and witness the dead flame.' },
    { text: 'Speak with Priestess Vanya about the ritual of rekindling.' },
    { text: 'Chop sanctified yew logs from the cemetery grove (Woodcutting 20).' },
    { text: 'Travel to the Boneyard Wastes and find the Sunscorch Crater.' },
    { text: 'Survive the heat by building a series of shade fires along the path (Firemaking 20).' },
    { text: 'Reach the crater core and light a signal pyre to summon the Solar Wisp (Firemaking 25).' },
    { text: 'Capture the Solar Wisp in a blessed lantern (Prayer 15).' },
    { text: 'Return to Moryskah through the desert night, keeping the wisp fed with logs.' },
    { text: 'Relight the sacred flame and speak with Priestess Vanya.' },
  ],
  rewards: {
    xp: { firemaking: 3000, woodcutting: 1500, prayer: 1000 },
    items: [{ id: 101, name: 'Coins', count: 4500 }, { id: 14030, name: 'Tinderbox of the Pyre', count: 1 }],
    questPoints: 2,
    unlocks: ["item_unlock:the_eternal_pyre_completion"],
  },
});

// ══════════════════════════════════════════════════════════════════════════════
// REGION LORE CHAINS (8) — one per region
// ══════════════════════════════════════════════════════════════════════════════

// ── 6. The King's Last Edict (Heartlands lore) ───────────────────────────────
quests.define('the_kings_last_edict', {
  name: "The King's Last Edict",
  description: 'A sealed letter from the last king of the Heartlands has been found in the castle archives. Its contents could rewrite the history of Aelgard.',
  difficulty: 'Experienced',
  questPoints: 3,
  requirements: { skills: { thieving: 35, magic: 30, crafting: 25 }, quests: ['foundations_of_the_fallen'] },
  steps: [
    { text: 'Speak with Archivist Lenna in Castle Heartstone\'s library.' },
    { text: 'The letter is sealed with a magical lock — attempt to pick it (Thieving 35).' },
    { text: 'The seal resists. Research the king\'s cipher in the restricted section.' },
    { text: 'Cast a reveal enchantment on the wax seal (Magic 30).' },
    { text: 'The letter references a hidden chamber beneath the throne room.' },
    { text: 'Craft a replica key from the impressions in the letter\'s margins (Crafting 25).' },
    { text: 'Enter the hidden chamber and solve the king\'s puzzle — 3 rotating pillars that align by era.' },
    { text: 'Read the true edict: the king abdicated willingly, sealing something beneath the castle.' },
    { text: 'Defeat the Sealed Guardian (level 90) that the king imprisoned.' },
    { text: 'Return to Archivist Lenna with the truth.' },
  ],
  rewards: {
    xp: { thieving: 4000, magic: 3000, crafting: 2000 },
    items: [{ id: 101, name: 'Coins', count: 10000 }, { id: 14100, name: 'Crown shard', count: 1 }],
    questPoints: 3,
    unlocks: ["item_unlock:the_kings_last_edict_completion"],
  },
});

// ── 7. Bones of the First Empire (Boneyard Wastes lore) ──────────────────────
quests.define('bones_of_the_first_empire', {
  name: 'Bones of the First Empire',
  description: 'Sandstorms have uncovered ruins older than any known civilization. What lies beneath the Boneyard Wastes predates Aelgard itself.',
  difficulty: 'Experienced',
  questPoints: 3,
  requirements: { skills: { mining: 40, prayer: 30, hitpoints: 35 } },
  steps: [
    { text: 'Speak with Professor Sandil at the Desert Research Camp.' },
    { text: 'Mine through the exposed rock face to reveal the entrance (Mining 40).' },
    { text: 'Navigate the collapsing tunnels — survive 3 cave-in traps (Hitpoints 35 needed to endure).' },
    { text: 'Discover murals depicting a civilization that existed before the gods arrived.' },
    { text: 'Pray at the ancient altar to translate the murals (Prayer 30).' },
    { text: 'The murals reveal the First Empire was destroyed by the very gods now worshipped.' },
    { text: 'Defeat the Fossil Sentinel (level 95) that guards the deepest chamber.' },
    { text: 'Recover the First Empire\'s chronicle tablet.' },
    { text: 'Return to Professor Sandil — decide whether to publish or bury the truth.' },
  ],
  rewards: {
    xp: { mining: 5000, prayer: 3000, hitpoints: 2000 },
    items: [{ id: 101, name: 'Coins', count: 8000 }, { id: 14101, name: 'First Empire amulet', count: 1 }],
    questPoints: 3,
    unlocks: ["item_unlock:bones_of_the_first_empire_completion"],
  },
});

// ── 8. Blood Beneath the Boughs (Moryskah lore) ─────────────────────────────
quests.define('blood_beneath_the_boughs', {
  name: 'Blood Beneath the Boughs',
  description: 'The swamp trees of Moryskah are bleeding. Literally. Something ancient stirs in the root network, and the local vampyres are terrified — which means everyone else should be too.',
  difficulty: 'Experienced',
  questPoints: 3,
  requirements: { skills: { slayer: 35, herblore: 30, agility: 25 } },
  steps: [
    { text: 'Investigate the bleeding trees near the village of Hollow Mire.' },
    { text: 'Collect samples of the red sap and identify it (Herblore 30).' },
    { text: 'The sap is alive — a parasitic organism feeding on the swamp\'s magic.' },
    { text: 'Track the root system through the bog using agility shortcuts (Agility 25).' },
    { text: 'Discover the source: a Bloodwood Heart, a creature fused with the swamp itself.' },
    { text: 'Slay the Bloodwood Heart (Slayer 35 required, immune to normal weapons).' },
    { text: 'Use a silver-tipped axe to sever the root tendrils — 5 must be cut before the heart regenerates.' },
    { text: 'Purify the central root with the herblore antidote you crafted.' },
    { text: 'Report to the Hollow Mire elder. The vampyres send an emissary to thank you — uneasily.' },
  ],
  rewards: {
    xp: { slayer: 5000, herblore: 3000, agility: 2000 },
    items: [{ id: 14102, name: 'Bloodwood stake', count: 1 }, { id: 101, name: 'Coins', count: 7000 }],
    questPoints: 3,
    unlocks: ["item_unlock:blood_beneath_the_boughs_completion"],
    chain_next: 'the_siege_of_hollow_mire',
  },
});

// ── 9. The Song Before Words (Veilwood lore) ─────────────────────────────────
quests.define('the_song_before_words', {
  name: 'The Song Before Words',
  description: 'The elves of Veilwood speak of a melody older than language — a song that shaped the forest. An elf musician believes she can reconstruct it, but she needs help gathering the notes.',
  difficulty: 'Experienced',
  questPoints: 3,
  requirements: { skills: { fletching: 35, magic: 30, woodcutting: 25 } },
  steps: [
    { text: 'Speak with Lyricist Aelwen at the Veilwood amphitheatre.' },
    { text: 'Fletch a resonance bow from singing-wood — a special timber that vibrates at magical frequencies (Fletching 35).' },
    { text: 'Fire the resonance bow at 4 ancient standing stones to capture their tones (Woodcutting 25 to harvest bowstring vines).' },
    { text: 'Each stone emits a different note. Record the sequence.' },
    { text: 'A fifth stone is missing — use magic to locate its buried remains (Magic 30).' },
    { text: 'Unearth the final stone and capture its note.' },
    { text: 'Play the full 5-note melody at the amphitheatre.' },
    { text: 'The forest responds: a hidden grove opens, revealing the First Glade — where the elves first awoke.' },
    { text: 'Speak with the memory of the First Elf, preserved in amber light.' },
  ],
  rewards: {
    xp: { fletching: 4500, magic: 3000, woodcutting: 2000 },
    items: [{ id: 14103, name: 'Singing-wood longbow', count: 1 }, { id: 101, name: 'Coins', count: 6000 }],
    questPoints: 3,
    unlocks: ["item_unlock:the_song_before_words_completion"],
  },
});

// ── 10. The Cogfather's Paradox (Sootworks lore) ─────────────────────────────
quests.define('the_cogfathers_paradox', {
  name: "The Cogfather's Paradox",
  description: 'The original architect of the Sootworks — the Cogfather — left behind a machine that was never finished. The dwarves say it can think. They also say it drove its creator mad.',
  difficulty: 'Master',
  questPoints: 4,
  requirements: { skills: { smithing: 50, construction: 40, crafting: 35 } },
  steps: [
    { text: 'Speak with Chief Engineer Brondi in the Sootworks Central Forge.' },
    { text: 'Descend to Level 7, the sealed workshop of the Cogfather.' },
    { text: 'Smith a master key from soot-iron and mithril alloy to open the vault door (Smithing 50).' },
    { text: 'Inside, find the Paradox Engine — a half-built clockwork brain.' },
    { text: 'Read the Cogfather\'s journal: he tried to build a machine that could question its own existence.' },
    { text: 'Craft the 3 missing components: a memory coil, a logic gate, and a doubt spring (Crafting 35).' },
    { text: 'Install the components using precision construction techniques (Construction 40).' },
    { text: 'The machine activates and asks you a riddle about the nature of purpose.' },
    { text: 'Answer the riddle. The machine either accepts your answer or poses a harder one — 3 rounds.' },
    { text: 'The Paradox Engine reveals the Cogfather\'s final secret: the Sootworks was built to contain something, not create something.' },
  ],
  rewards: {
    xp: { smithing: 8000, construction: 6000, crafting: 4000 },
    items: [{ id: 14104, name: 'Cogfather\'s wrench', count: 1 }, { id: 101, name: 'Coins', count: 15000 }],
    questPoints: 4,
    unlocks: ["item_unlock:the_cogfathers_paradox_completion"],
  },
});

// ── 11. The Drowned Cartographer (Saltbrine Reach lore) ──────────────────────
quests.define('the_drowned_cartographer', {
  name: 'The Drowned Cartographer',
  description: 'A ghost ship has appeared off Saltbrine harbour. Aboard it: maps to places that shouldn\'t exist. The cartographer who drew them has been dead for 200 years — but he wants to finish his atlas.',
  difficulty: 'Experienced',
  questPoints: 3,
  requirements: { skills: { fishing: 35, crafting: 30, prayer: 20 } },
  steps: [
    { text: 'Witness the ghost ship appear at Saltbrine harbour at midnight.' },
    { text: 'Row out to the ship — fish for bait to distract the spectral sea serpents around the hull (Fishing 35).' },
    { text: 'Board the ship and speak with the ghost of Cartographer Maelvin.' },
    { text: 'He asks you to finish his final map — he needs 3 coast drawings from places he never reached alive.' },
    { text: 'Sketch the Saltbrine cliffs using charcoal and parchment you craft (Crafting 30).' },
    { text: 'Sketch the reef from the harbour lighthouse.' },
    { text: 'Pray to calm Maelvin\'s spirit so he can read your sketches (Prayer 20).' },
    { text: 'Maelvin completes the atlas and reveals that the maps show an island that rises once per century — soon.' },
    { text: 'The ghost ship fades. Maelvin leaves the atlas in your hands.' },
  ],
  rewards: {
    xp: { fishing: 4000, crafting: 2500, prayer: 1500 },
    items: [{ id: 14105, name: 'Maelvin\'s atlas', count: 1 }, { id: 101, name: 'Coins', count: 7500 }],
    questPoints: 3,
    unlocks: ["item_unlock:the_drowned_cartographer_completion"],
  },
});

// ── 12. The Dreamer's Debt (The Inkweald lore) ───────────────────────────────
quests.define('the_dreamers_debt', {
  name: "The Dreamer's Debt",
  description: 'The Inkweald is someone\'s dream. That someone is waking up. If the dreamer opens their eyes, the entire surreal forest and everything in it ceases to exist.',
  difficulty: 'Master',
  questPoints: 4,
  requirements: { skills: { magic: 50, runecrafting: 35, herblore: 30 } },
  steps: [
    { text: 'Enter the Inkweald and notice reality flickering — trees blink out and return.' },
    { text: 'Speak with the Ink Keeper, a being who maintains the dream\'s coherence.' },
    { text: 'The Ink Keeper explains: the Dreamer was a powerful mage who created the Inkweald as a refuge, but their body is dying in the waking world.' },
    { text: 'Brew a Dream Anchor potion to stabilize the forest (Herblore 30).' },
    { text: 'Craft 10 Anchor Runes from raw dream essence (Runecrafting 35).' },
    { text: 'Place the runes at 5 cardinal points throughout the Inkweald.' },
    { text: 'Cast a binding spell at each point to tether the dream to reality (Magic 50).' },
    { text: 'The Dreamer manifests — a projection of a dying mage from a forgotten era.' },
    { text: 'Choose: let the Dreamer wake (destroying the Inkweald) or keep them asleep forever (saving the forest but condemning the Dreamer).' },
    { text: 'Whichever you choose, report the outcome to the Ink Keeper.' },
  ],
  rewards: {
    xp: { magic: 8000, runecrafting: 5000, herblore: 3000 },
    items: [{ id: 14106, name: 'Ink Keeper\'s quill', count: 1 }, { id: 14020, name: 'Dream rune', count: 100 }],
    questPoints: 4,
    unlocks: ["item_unlock:the_dreamers_debt_completion"],
    chain_next: 'the_dream_eater',
  },
});

// ── 13. The Prism Throne (Glass Desert lore) ─────────────────────────────────
quests.define('the_prism_throne', {
  name: 'The Prism Throne',
  description: 'At the centre of the Glass Desert sits a throne made of living crystal. It has been empty for millennia. The crystals say it is waiting for someone — and they are getting impatient.',
  difficulty: 'Grandmaster',
  questPoints: 5,
  requirements: { skills: { mining: 60, magic: 55, defence: 50, smithing: 45 } },
  steps: [
    { text: 'Navigate the Glass Desert labyrinth to reach the Crystal Spire at the centre.' },
    { text: 'The Spire Guardian blocks your path. Survive its refractive beam attack (Defence 50).' },
    { text: 'Mine prismatic ore from the throne\'s base — the hardest material in Aelgard (Mining 60).' },
    { text: 'Smith the ore into a Crown of Refraction (Smithing 45).' },
    { text: 'Place the crown on the throne. The crystals respond — they project memories of the Glass Desert\'s origin.' },
    { text: 'The desert was once an ocean. A god crystallized it in a single breath to trap something beneath.' },
    { text: 'Cast a deep-seeing spell to view what lies beneath the glass floor (Magic 55).' },
    { text: 'Beneath the desert: a sleeping titan, its heartbeat visible as shimmering heat waves.' },
    { text: 'The throne demands a warden. Choose: sit the throne yourself (binding you to a weekly check-in duty) or refuse (the titan stirs slightly, future consequences unknown).' },
    { text: 'Leave the Glass Desert. The crystals hum behind you.' },
  ],
  rewards: {
    xp: { mining: 12000, magic: 10000, defence: 6000, smithing: 5000 },
    items: [{ id: 14107, name: 'Prism shard', count: 1 }, { id: 101, name: 'Coins', count: 25000 }],
    questPoints: 5,
    unlocks: ["item_unlock:the_prism_throne_completion"],
  },
});

// ══════════════════════════════════════════════════════════════════════════════
// MULTI-REGION ADVENTURES (8) — each spans 3+ regions
// ══════════════════════════════════════════════════════════════════════════════

// ── 14. The Merchant's Gambit ────────────────────────────────────────────────
// Regions: Heartlands → Saltbrine Reach → Sootworks → Veilwood
quests.define('the_merchants_gambit', {
  name: "The Merchant's Gambit",
  description: 'A merchant prince is assembling the rarest trade goods from every corner of Aelgard. He needs a capable courier — and the competitors are willing to kill.',
  difficulty: 'Experienced',
  questPoints: 3,
  requirements: { skills: { thieving: 30, cooking: 25, crafting: 20, agility: 20 } },
  steps: [
    { text: 'Meet Merchant Prince Davos at the Heartlands Grand Bazaar.' },
    { text: 'Receive the manifest: 4 items from 4 regions, all needed within 3 game days.' },
    { text: 'Travel to Saltbrine Reach. Acquire smoked kraken tentacle from the dockside chef (Cooking 25).' },
    { text: 'A rival merchant\'s thugs ambush you at the docks. Fight or flee.' },
    { text: 'Travel to the Sootworks. Steal a prototype clockwork music box from a locked display case (Thieving 30).' },
    { text: 'Escape the Sootworks guards through the steam vents (Agility 20).' },
    { text: 'Travel to Veilwood. Craft an elven crystal pendant from raw materials (Crafting 20).' },
    { text: 'Return to Heartlands and deliver all 4 items to Davos.' },
    { text: 'Davos reveals the items form a set — when combined, they create a master trader\'s key.' },
  ],
  rewards: {
    xp: { thieving: 4000, cooking: 2000, crafting: 2000, agility: 1500 },
    items: [{ id: 101, name: 'Coins', count: 12000 }, { id: 14200, name: 'Trader\'s signet ring', count: 1 }],
    questPoints: 3,
    unlocks: ["item_unlock:the_merchants_gambit_completion"],
  },
});

// ── 15. The Plague Road ──────────────────────────────────────────────────────
// Regions: Moryskah → Boneyard Wastes → Heartlands → Veilwood
quests.define('the_plague_road', {
  name: 'The Plague Road',
  description: 'A sickness is spreading from Moryskah along the trade roads. You must trace its origin, find a cure, and inoculate three regions before it becomes a pandemic.',
  difficulty: 'Master',
  questPoints: 4,
  requirements: { skills: { herblore: 45, farming: 35, prayer: 25, cooking: 20 } },
  steps: [
    { text: 'Investigate the first victims in Moryskah\'s Hollow Mire.' },
    { text: 'Collect plague samples and identify the pathogen (Herblore 35).' },
    { text: 'The plague originated from the Boneyard Wastes — an ancient spore released by miners.' },
    { text: 'Travel to the Boneyard Wastes and locate the breached tomb where the spore was disturbed.' },
    { text: 'Grow a counter-agent from the spore\'s own root system (Farming 35).' },
    { text: 'Brew the antidote using desert herbs and Moryskah swamp water (Herblore 45).' },
    { text: 'Travel to the Heartlands and inoculate the garrison. Cook medicinal broth for the soldiers (Cooking 20).' },
    { text: 'Travel to Veilwood. Convince the elves to accept your cure — pray at their shrine to earn trust (Prayer 25).' },
    { text: 'Administer the cure across all 3 regions. The plague recedes.' },
    { text: 'Return to Moryskah and report to the healers.' },
  ],
  rewards: {
    xp: { herblore: 8000, farming: 4000, prayer: 2500, cooking: 1500 },
    items: [{ id: 14201, name: 'Plague doctor\'s mask', count: 1 }, { id: 101, name: 'Coins', count: 10000 }],
    questPoints: 4,
    unlocks: ["item_unlock:the_plague_road_completion"],
  },
});

// ── 16. The Courier's Marathon ───────────────────────────────────────────────
// Regions: Saltbrine → Heartlands → Sootworks → Moryskah → Boneyard Wastes
quests.define('the_couriers_marathon', {
  name: "The Courier's Marathon",
  description: 'The Aelgard Postal Service is running its annual relay race through 5 regions. Win the race and earn a permanent speed bonus in all postal routes.',
  difficulty: 'Experienced',
  questPoints: 3,
  requirements: { skills: { agility: 40, ranged: 25, cooking: 20 } },
  steps: [
    { text: 'Register at the Saltbrine Reach post office. The race starts at dawn.' },
    { text: 'Sprint through the Saltbrine docks — agility course with rope swings and cargo nets (Agility 30).' },
    { text: 'Cook quick-energy food at the Heartlands checkpoint to maintain stamina (Cooking 20).' },
    { text: 'Navigate the Sootworks steam tunnels — dodge venting geysers (Agility 35).' },
    { text: 'Cross the Moryskah swamp — shoot down blockade webs from swamp spiders with your bow (Ranged 25).' },
    { text: 'Final sprint through the Boneyard Wastes dunes — the hardest agility stretch (Agility 40).' },
    { text: 'Cross the finish line. Your time is compared against NPC competitors.' },
    { text: 'Attend the awards ceremony at Saltbrine harbour.' },
  ],
  rewards: {
    xp: { agility: 6000, ranged: 2000, cooking: 1000 },
    items: [{ id: 14202, name: 'Courier\'s boots', count: 1 }, { id: 101, name: 'Coins', count: 8000 }],
    questPoints: 3,
    unlocks: ["item_unlock:the_couriers_marathon_completion"],
  },
});

// ── 17. The Iron Pilgrimage ──────────────────────────────────────────────────
// Regions: Heartlands → Sootworks → Boneyard Wastes → Glass Desert
quests.define('the_iron_pilgrimage', {
  name: 'The Iron Pilgrimage',
  description: 'A dwarven smith challenges you to forge a blade using ore from 4 regions. Each ore must be smelted at the site where it was mined. The result: a weapon that carries the strength of all Aelgard.',
  difficulty: 'Master',
  questPoints: 4,
  requirements: { skills: { smithing: 55, mining: 50, attack: 40, strength: 35 } },
  steps: [
    { text: 'Accept the challenge from Mastersmith Durgan in the Heartlands forge.' },
    { text: 'Mine Heartstone ore from the castle quarry (Mining 35).' },
    { text: 'Smelt it on-site into a Heartstone ingot (Smithing 40).' },
    { text: 'Travel to the Sootworks. Mine deep-iron from Level 5 (Mining 45).' },
    { text: 'Smelt deep-iron at the Sootworks magma forge (Smithing 50).' },
    { text: 'Travel to the Boneyard Wastes. Mine sun-bleached steel from an exposed vein (Mining 50).' },
    { text: 'Smelt it using a makeshift desert forge (Smithing 55).' },
    { text: 'Travel to the Glass Desert. Mine a crystal core — the blade\'s heart.' },
    { text: 'Combine all 4 ingots and the crystal core at any anvil (Smithing 55).' },
    { text: 'Test the blade on a combat dummy — perform a special attack combo (Attack 40, Strength 35).' },
  ],
  rewards: {
    xp: { smithing: 10000, mining: 8000, attack: 3000, strength: 2000 },
    items: [{ id: 14203, name: 'Pilgrimage blade', count: 1 }],
    questPoints: 4,
    unlocks: ["item_unlock:the_iron_pilgrimage_completion"],
    chain_next: 'the_god_forge',
  },
});

// ── 18. Threads of the Weave ─────────────────────────────────────────────────
// Regions: The Inkweald → Veilwood → Moryskah → Glass Desert
quests.define('threads_of_the_weave', {
  name: 'Threads of the Weave',
  description: 'A rift in the Inkweald is leaking dream-stuff into the real world. Track the magical threads across 4 regions and sew reality back together before the boundaries collapse.',
  difficulty: 'Master',
  questPoints: 4,
  requirements: { skills: { magic: 50, crafting: 40, runecrafting: 30, herblore: 25 } },
  steps: [
    { text: 'Enter the Inkweald and find the Rift Warden, who is barely holding reality together.' },
    { text: 'Craft a Reality Needle from condensed dream-thread (Crafting 40).' },
    { text: 'The rift has split into 3 tendrils reaching across Aelgard. Track the first to Veilwood.' },
    { text: 'In Veilwood, the tendril is corrupting the forest. Craft sealing runes (Runecrafting 30) and stitch it closed (Magic 40).' },
    { text: 'Track the second tendril to Moryskah, where it is merging swamp creatures with dream beings.' },
    { text: 'Brew a separation elixir (Herblore 25) and close the tendril (Magic 45).' },
    { text: 'The third tendril reaches the Glass Desert. It is the strongest.' },
    { text: 'Channel all your remaining magical energy to seal the final rift (Magic 50).' },
    { text: 'Return to the Inkweald. The Rift Warden is restored. Reality is stable — for now.' },
  ],
  rewards: {
    xp: { magic: 10000, crafting: 5000, runecrafting: 4000, herblore: 2000 },
    items: [{ id: 14204, name: 'Reality needle', count: 1 }, { id: 101, name: 'Coins', count: 12000 }],
    questPoints: 4,
    unlocks: ["item_unlock:threads_of_the_weave_completion"],
  },
});

// ── 19. The Aelgard Atlas ────────────────────────────────────────────────────
// Regions: ALL 8 regions
quests.define('the_aelgard_atlas', {
  name: 'The Aelgard Atlas',
  description: 'The Cartographers\' Guild is compiling the definitive map of Aelgard. They need a surveyor brave enough to visit every region and sketch its landmarks. Nobody has ever completed the circuit.',
  difficulty: 'Grandmaster',
  questPoints: 5,
  requirements: { skills: { agility: 45, crafting: 40, mining: 35, woodcutting: 30, fishing: 30 } },
  steps: [
    { text: 'Accept the commission from Guildmaster Pell at the Heartlands Cartographers\' Hall.' },
    { text: 'Sketch the Heartlands: Castle Heartstone from the western bluff (Crafting 30).' },
    { text: 'Sketch the Boneyard Wastes: the Great Skull formation (survive a sandstorm).' },
    { text: 'Sketch Moryskah: the Crimson Spire from across the bog (Agility 35 to reach the viewpoint).' },
    { text: 'Sketch Veilwood: the Crown Canopy, the tallest tree (Woodcutting 30 to climb with spikes).' },
    { text: 'Sketch the Sootworks: the Grand Cogwheel from the observation platform (Mining 35 to clear rubble).' },
    { text: 'Sketch Saltbrine Reach: the Lighthouse of Tides from a fishing boat (Fishing 30 to reach the spot).' },
    { text: 'Sketch the Inkweald: the Mirror Lake — but it keeps shifting. Pin it with crafting tools (Crafting 40).' },
    { text: 'Sketch the Glass Desert: the Prism Throne from the Crystal Overlook (Agility 45 to climb).' },
    { text: 'Return to Guildmaster Pell with all 8 sketches. The atlas is published in your name.' },
  ],
  rewards: {
    xp: { agility: 8000, crafting: 6000, mining: 3000, woodcutting: 2500, fishing: 2500 },
    items: [{ id: 14205, name: 'Aelgard atlas (completed)', count: 1 }, { id: 101, name: 'Coins', count: 20000 }],
    questPoints: 5,
    unlocks: ["item_unlock:the_aelgard_atlas_completion"],
  },
});

// ── 20. The Smuggler's Web ───────────────────────────────────────────────────
// Regions: Saltbrine Reach → Moryskah → Sootworks → The Wilds
quests.define('the_smugglers_web', {
  name: "The Smuggler's Web",
  description: 'Contraband is flooding Saltbrine Reach — cursed artefacts from Moryskah, illegal clockwork weapons from the Sootworks, and worse. Follow the supply chain to its source in the Wilds.',
  difficulty: 'Master',
  questPoints: 4,
  requirements: { skills: { thieving: 45, ranged: 35, fletching: 30, agility: 30 } },
  steps: [
    { text: 'Speak with Inspector Carla at Saltbrine Reach customs.' },
    { text: 'Pickpocket a dockworker to find a coded manifest (Thieving 35).' },
    { text: 'Decode the manifest — it references Moryskah and the Sootworks.' },
    { text: 'Travel to Moryskah. Infiltrate the Cursed Relics warehouse. Pick the lock (Thieving 45).' },
    { text: 'Find evidence linking the operation to a Sootworks arms dealer.' },
    { text: 'Travel to the Sootworks. Fletch surveillance darts tipped with tracking powder (Fletching 30).' },
    { text: 'Tag the arms dealer\'s shipment and follow it through the steam tunnels (Agility 30).' },
    { text: 'The shipment leads to The Wilds. Confront the smuggling boss and their guards.' },
    { text: 'Defeat the Smuggler King (level 110) using ranged combat in the open wilderness (Ranged 35).' },
    { text: 'Return evidence to Inspector Carla. The network is dismantled.' },
  ],
  rewards: {
    xp: { thieving: 7000, ranged: 4000, fletching: 3000, agility: 2500 },
    items: [{ id: 14206, name: 'Inspector\'s badge', count: 1 }, { id: 101, name: 'Coins', count: 15000 }],
    questPoints: 4,
    unlocks: ["item_unlock:the_smugglers_web_completion"],
  },
});

// ── 21. The Lost Expedition ──────────────────────────────────────────────────
// Regions: Heartlands → Boneyard Wastes → Glass Desert → The Inkweald
quests.define('the_lost_expedition', {
  name: 'The Lost Expedition',
  description: 'An expedition left the Heartlands 6 months ago heading for the Glass Desert. They never returned. Their last letter mentioned "a door that shouldn\'t be there." Find them.',
  difficulty: 'Master',
  questPoints: 4,
  requirements: { skills: { hunter: 40, firemaking: 30, strength: 35, magic: 30 } },
  steps: [
    { text: 'Read the expedition\'s final letter at the Heartlands Adventurers\' Guild.' },
    { text: 'Travel to the Boneyard Wastes. Track the expedition\'s trail using desert tracking techniques (Hunter 40).' },
    { text: 'Find their abandoned camp. Light their cold fire pit to search for clues at night (Firemaking 30).' },
    { text: 'The trail continues into the Glass Desert. Follow it past the crystal maze.' },
    { text: 'Find "the door" — a portal carved into a crystal monolith, shimmering with dream energy.' },
    { text: 'Force the portal open (Strength 35) and step through.' },
    { text: 'You emerge in the Inkweald. The expedition is here, alive but lost in the dream.' },
    { text: 'Use magic to anchor a path back to the real world (Magic 30).' },
    { text: 'Lead the expedition back through the portal. It collapses behind you.' },
    { text: 'Return to the Heartlands. The expedition leader tells you the Inkweald wanted them to stay.' },
  ],
  rewards: {
    xp: { hunter: 6000, firemaking: 3000, strength: 3000, magic: 3000 },
    items: [{ id: 14207, name: 'Expedition leader\'s journal', count: 1 }, { id: 101, name: 'Coins', count: 11000 }],
    questPoints: 4,
    unlocks: ["item_unlock:the_lost_expedition_completion"],
  },
});

// ══════════════════════════════════════════════════════════════════════════════
// COMBAT CHALLENGES (5) — boss-gated with unique mechanics
// ══════════════════════════════════════════════════════════════════════════════

// ── 22. The Bone Colossus ────────────────────────────────────────────────────
// Region: Boneyard Wastes
quests.define('the_bone_colossus', {
  name: 'The Bone Colossus',
  description: 'A giant skeleton has assembled itself from the remains of a thousand warriors in the Boneyard Wastes. It grows larger each day. Destroy it before it reaches the Heartlands.',
  difficulty: 'Master',
  questPoints: 4,
  requirements: { skills: { attack: 55, prayer: 40, slayer: 40, mining: 30 } },
  steps: [
    { text: 'Speak with Watch Commander Thane at the Boneyard outpost.' },
    { text: 'Scout the Bone Colossus from a distance — it is absorbing nearby skeletons.' },
    { text: 'Mine blessed silver ore from the sacred mine near the outpost (Mining 30).' },
    { text: 'Have the outpost smith forge silver weapons from the ore.' },
    { text: 'Pray at the Boneyard shrine for the Bonecrusher blessing (Prayer 40).' },
    { text: 'Approach the Bone Colossus. Phase 1: destroy its legs by attacking the knee joints (Attack 45).' },
    { text: 'Phase 2: it collapses but fights from the ground. Slay the skeleton core controlling it (Slayer 40).' },
    { text: 'Phase 3: the core splits into 5 bone wraiths. Destroy all 5 using the silver weapons (Attack 55).' },
    { text: 'Shatter the Colossus Heart — the central bone that held it all together.' },
    { text: 'Report to Watch Commander Thane.' },
  ],
  rewards: {
    xp: { attack: 8000, prayer: 5000, slayer: 5000, mining: 2000 },
    items: [{ id: 14300, name: 'Colossus bone shard', count: 1 }, { id: 101, name: 'Coins', count: 12000 }],
    questPoints: 4,
    unlocks: ["item_unlock:the_bone_colossus_completion"],
  },
});

// ── 23. The Siren of Saltbrine ───────────────────────────────────────────────
// Region: Saltbrine Reach
quests.define('the_siren_of_saltbrine', {
  name: 'The Siren of Saltbrine',
  description: 'Ships are vanishing off the Saltbrine coast. Sailors speak of a voice that compels them to sail into the rocks. The Siren is real — and she is ancient.',
  difficulty: 'Master',
  questPoints: 4,
  requirements: { skills: { ranged: 50, magic: 40, fishing: 35, crafting: 30 } },
  steps: [
    { text: 'Speak with Harbourmaster Quinn about the missing ships.' },
    { text: 'Craft enchanted earplugs from wax and dream-coral to resist the Siren\'s song (Crafting 30).' },
    { text: 'Sail out at night. Fish to lure the Siren\'s minions — the Deepwater Thralls (Fishing 35).' },
    { text: 'Fight off 3 waves of Deepwater Thralls on the ship deck.' },
    { text: 'The Siren appears. Phase 1: she attacks with sonic blasts. Counter with magic barriers (Magic 40).' },
    { text: 'Phase 2: she submerges and summons a whirlpool. Shoot her with enchanted bolts when she surfaces (Ranged 45).' },
    { text: 'Phase 3: she takes human form and fights on deck. Pure ranged combat (Ranged 50).' },
    { text: 'The Siren is defeated. She reveals she was cursed — not evil by choice.' },
    { text: 'Choose: break the curse (she becomes an ally NPC) or banish her permanently.' },
  ],
  rewards: {
    xp: { ranged: 8000, magic: 5000, fishing: 3000, crafting: 2000 },
    items: [{ id: 14301, name: 'Siren\'s conch', count: 1 }, { id: 101, name: 'Coins', count: 14000 }],
    questPoints: 4,
    unlocks: ["item_unlock:the_siren_of_saltbrine_completion"],
    chain_next: 'the_leviathans_wake',
  },
});

// ── 24. The Clockwork Tyrant ─────────────────────────────────────────────────
// Region: Sootworks
quests.define('the_clockwork_tyrant', {
  name: 'The Clockwork Tyrant',
  description: 'A rogue automaton has seized control of the Sootworks Lower Foundry. It is building an army of clockwork soldiers. Shut it down before the dwarves lose their home.',
  difficulty: 'Master',
  questPoints: 4,
  requirements: { skills: { strength: 50, smithing: 40, construction: 30, defence: 40 } },
  steps: [
    { text: 'Speak with Chief Engineer Brondi — the Lower Foundry is sealed and under siege from within.' },
    { text: 'Build a battering ram from salvaged parts to breach the foundry gate (Construction 30).' },
    { text: 'Fight through corridors of clockwork soldiers — each wave is stronger.' },
    { text: 'Reach the control room. The Tyrant has welded the doors shut.' },
    { text: 'Smith a thermal lance to cut through the welded door (Smithing 40).' },
    { text: 'Phase 1: the Clockwork Tyrant attacks with spinning blade arms. Block and counter (Defence 40).' },
    { text: 'Phase 2: it activates a magnetic field. You must use pure strength to push through and reach its core (Strength 45).' },
    { text: 'Phase 3: tear the Tyrant\'s power source out by hand (Strength 50). It fights back with electrical shocks.' },
    { text: 'The Tyrant shuts down. Brondi\'s engineers reclaim the foundry.' },
  ],
  rewards: {
    xp: { strength: 8000, smithing: 5000, construction: 3000, defence: 4000 },
    items: [{ id: 14302, name: 'Tyrant\'s power core', count: 1 }, { id: 101, name: 'Coins', count: 13000 }],
    questPoints: 4,
    unlocks: ["item_unlock:the_clockwork_tyrant_completion"],
  },
});

// ── 25. The Hollow King ──────────────────────────────────────────────────────
// Regions: Moryskah → The Inkweald
quests.define('the_hollow_king', {
  name: 'The Hollow King',
  description: 'The vampyre lord of Moryskah has found a way to enter the Inkweald and feed on dreams directly. If he succeeds, he becomes unkillable. Stop him in the space between sleep and death.',
  difficulty: 'Grandmaster',
  questPoints: 5,
  requirements: { skills: { attack: 60, magic: 55, prayer: 45, slayer: 45, herblore: 35 } },
  steps: [
    { text: 'Receive an urgent summons from the Hollow Mire elder — the vampyre lord Morvek has vanished into the Inkweald.' },
    { text: 'Brew a Dream Walker elixir to follow him (Herblore 35).' },
    { text: 'Enter the Inkweald through the Moryskah gate. The dreamscape is warped by Morvek\'s presence.' },
    { text: 'Track Morvek through 3 nightmare realms he has corrupted.' },
    { text: 'In each realm, pray to dispel his corruption (Prayer 45) and slay a Nightmare Sentinel (Slayer 45).' },
    { text: 'Reach Morvek at the Dream Nexus. He has already begun feeding.' },
    { text: 'Phase 1: Morvek attacks with shadow magic. Counter with holy spells (Magic 50, Prayer 45).' },
    { text: 'Phase 2: he transforms into the Hollow King — a towering dream-vampyre. Melee combat required (Attack 60).' },
    { text: 'Phase 3: he fractures into 3 copies. Use magic to identify the real one (Magic 55) then deliver the killing blow.' },
    { text: 'Morvek is destroyed. The Inkweald heals. Return through the Moryskah gate.' },
  ],
  rewards: {
    xp: { attack: 15000, magic: 12000, prayer: 8000, slayer: 6000, herblore: 3000 },
    items: [{ id: 14303, name: 'Hollow crown', count: 1 }, { id: 14304, name: 'Morvek\'s fang', count: 1 }],
    questPoints: 5,
    unlocks: ["item_unlock:the_hollow_king_completion"],
  },
});

// ── 26. The Crystal Warden ───────────────────────────────────────────────────
// Region: Glass Desert
quests.define('the_crystal_warden', {
  name: 'The Crystal Warden',
  description: 'The Glass Desert\'s guardian has gone berserk. A living crystal golem the size of a castle, it was meant to protect travellers. Now it destroys them. Something cracked its mind.',
  difficulty: 'Grandmaster',
  questPoints: 5,
  requirements: { skills: { defence: 60, magic: 50, mining: 45, hitpoints: 50, ranged: 40 } },
  steps: [
    { text: 'Witness the Crystal Warden demolishing a caravan at the Glass Desert border.' },
    { text: 'Speak with the survivors. The Warden changed after the last earthquake.' },
    { text: 'Mine resonant crystal shards from the Warden\'s footprints to analyze the corruption (Mining 45).' },
    { text: 'The corruption is magical — a rune lodged in its core is broadcasting madness.' },
    { text: 'Phase 1: the Warden stomps and fires crystal beams. Survive the barrage (Defence 55, Hitpoints 50).' },
    { text: 'Phase 2: shatter the armour plates on its legs with ranged attacks to expose the core pathway (Ranged 40).' },
    { text: 'Phase 3: climb the Warden (agility check) and reach its chest cavity.' },
    { text: 'Cast a dispel on the corrupted rune lodged in its core (Magic 50).' },
    { text: 'The Warden calms. It kneels and allows you to extract the corrupted rune (Defence 60 to withstand residual energy).' },
    { text: 'The Crystal Warden resumes its patrol. The Glass Desert is safe again.' },
  ],
  rewards: {
    xp: { defence: 15000, magic: 10000, mining: 5000, hitpoints: 6000, ranged: 4000 },
    items: [{ id: 14305, name: 'Warden\'s crystal heart', count: 1 }, { id: 101, name: 'Coins', count: 20000 }],
    questPoints: 5,
    unlocks: ["item_unlock:the_crystal_warden_completion"],
  },
});

// ══════════════════════════════════════════════════════════════════════════════
// SOCIAL / GROUP QUESTS (4) — benefit from or require multiple players
// ══════════════════════════════════════════════════════════════════════════════

// ── 27. The Great Aelgard Bake-Off ──────────────────────────────────────────
// Region: Heartlands (with ingredients from Saltbrine + Veilwood)
quests.define('the_great_aelgard_bakeoff', {
  name: 'The Great Aelgard Bake-Off',
  description: 'The annual Heartlands baking competition is open to teams. Gather ingredients from across Aelgard, cook the ultimate dish, and compete against NPC (and player) teams.',
  difficulty: 'Intermediate',
  questPoints: 2,
  requirements: { skills: { cooking: 35, farming: 20, fishing: 20 } },
  steps: [
    { text: 'Register your team (1-4 players) at the Heartlands Festival Grounds.' },
    { text: 'Receive the mystery ingredient list — items from 3 regions.' },
    { text: 'One player fishes for golden carp from Saltbrine Reach (Fishing 20).' },
    { text: 'One player harvests starfruit from Veilwood (Farming 20).' },
    { text: 'One player gathers flour and butter from the Heartlands market.' },
    { text: 'Reconvene at the Festival kitchen. Solo players must do all 3 trips themselves.' },
    { text: 'Cook the Grand Aelgard Cake together — each player handles one stage (Cooking 35 for the lead baker).' },
    { text: 'Present the cake to the judges. Scoring is based on ingredient quality and cooking success rate.' },
    { text: 'Win or lose, everyone gets the Festival Apron. Winners get the Golden Whisk.' },
  ],
  rewards: {
    xp: { cooking: 4000, farming: 1500, fishing: 1500 },
    items: [{ id: 14400, name: 'Festival apron', count: 1 }, { id: 101, name: 'Coins', count: 6000 }],
    questPoints: 2,
    unlocks: ["item_unlock:the_great_aelgard_bakeoff_completion"],
    chain_next: 'the_ambassadors_soup',
  },
});

// ── 28. The Sootworks Heist ──────────────────────────────────────────────────
// Regions: Sootworks → Saltbrine Reach
quests.define('the_sootworks_heist', {
  name: 'The Sootworks Heist',
  description: 'A corrupt industrialist has stolen the Sootworks\' master blueprint and locked it in a Saltbrine vault. Assemble a crew and steal it back. Each role requires different skills.',
  difficulty: 'Experienced',
  questPoints: 3,
  requirements: { skills: { thieving: 40, agility: 30, smithing: 25, magic: 20 } },
  steps: [
    { text: 'Meet Foreman Grukk in the Sootworks. He explains the blueprint\'s theft.' },
    { text: 'Recruit your crew (1-4 players). Solo players fill all roles themselves.' },
    { text: 'The Lockpick: disable the vault\'s outer defences in Saltbrine (Thieving 40).' },
    { text: 'The Acrobat: navigate the laser-like alarm grid inside the vault (Agility 30).' },
    { text: 'The Forger: smith a decoy blueprint to leave in place of the real one (Smithing 25).' },
    { text: 'The Distraction: cast illusion magic on the guards outside (Magic 20).' },
    { text: 'Execute the heist in sequence. If any role fails, the alarm triggers and guards attack.' },
    { text: 'Escape Saltbrine with the real blueprint. Flee across the rooftops (Agility 30).' },
    { text: 'Return the blueprint to Foreman Grukk. The Sootworks is whole again.' },
  ],
  rewards: {
    xp: { thieving: 5000, agility: 3000, smithing: 2000, magic: 1500 },
    items: [{ id: 14401, name: 'Heist mask', count: 1 }, { id: 101, name: 'Coins', count: 10000 }],
    questPoints: 3,
    unlocks: ["item_unlock:the_sootworks_heist_completion"],
  },
});

// ── 29. The Wilds Expedition ─────────────────────────────────────────────────
// Region: The Wilds (PvP zone)
quests.define('the_wilds_expedition', {
  name: 'The Wilds Expedition',
  description: 'The Adventurers\' Guild is sending a team into the Wilds to map the uncharted northern reaches. Strength in numbers is advised — the Wilds are PvP territory and monsters here don\'t play fair.',
  difficulty: 'Master',
  questPoints: 4,
  requirements: { skills: { hitpoints: 50, woodcutting: 35, firemaking: 30, hunter: 30, cooking: 25 } },
  steps: [
    { text: 'Assemble your expedition party (2-5 players recommended) at the Wilds border gate.' },
    { text: 'Enter the Wilds. Immediately set up a base camp — chop logs (Woodcutting 35) and build a fire (Firemaking 30).' },
    { text: 'Hunt wild game for food supplies (Hunter 30). Cook provisions for the journey (Cooking 25).' },
    { text: 'Push north through increasingly dangerous territory. PvP encounters are possible.' },
    { text: 'Reach the first waypoint: the Charred Ruins. Map the area and survive an ambush.' },
    { text: 'Reach the second waypoint: the Frozen Altar. A powerful Wilds boss guards it.' },
    { text: 'Defeat the Wilds Stalker (level 120) — a boss designed for groups (Hitpoints 50 to survive its attacks).' },
    { text: 'Map the Frozen Altar region. Plant the Adventurers\' Guild flag.' },
    { text: 'Return to the border gate alive. Any player who survives gets full rewards.' },
  ],
  rewards: {
    xp: { hitpoints: 6000, woodcutting: 3000, firemaking: 2500, hunter: 2500, cooking: 1500 },
    items: [{ id: 14402, name: 'Wilds explorer\'s cape', count: 1 }, { id: 101, name: 'Coins', count: 15000 }],
    questPoints: 4,
    unlocks: ["item_unlock:the_wilds_expedition_completion"],
    chain_next: 'the_hunt_for_the_wilds_king',
  },
});

// ── 30. The Tower of Trials ──────────────────────────────────────────────────
// Regions: Heartlands → Sootworks → Veilwood
quests.define('the_tower_of_trials', {
  name: 'The Tower of Trials',
  description: 'A magical tower has appeared in the Heartlands. It has 5 floors, each testing a different discipline. Only teams that combine all their strengths will reach the top.',
  difficulty: 'Experienced',
  questPoints: 3,
  requirements: { skills: { attack: 35, magic: 30, ranged: 25, defence: 25, construction: 20 } },
  steps: [
    { text: 'Gather your party (1-4 players) at the base of the Tower of Trials in the Heartlands.' },
    { text: 'Floor 1 — The Gauntlet: melee combat challenge against increasingly tough enemies (Attack 35, Defence 25).' },
    { text: 'Floor 2 — The Puzzle Chamber: build a bridge from scattered materials to cross a chasm (Construction 20).' },
    { text: 'Floor 3 — The Shooting Gallery: ranged accuracy test with moving targets (Ranged 25).' },
    { text: 'Floor 4 — The Arcane Maze: navigate a shifting magical labyrinth using spell detection (Magic 30).' },
    { text: 'Floor 5 — The Summit: fight the Tower Guardian, which adapts to your combat style.' },
    { text: 'The Guardian cycles through melee, ranged, and magic phases. Teams can split roles; soloists must switch styles.' },
    { text: 'Defeat the Guardian and claim the Tower Crest.' },
    { text: 'The tower vanishes. It will reappear in a different region next week (repeatable).' },
  ],
  rewards: {
    xp: { attack: 4000, magic: 3500, ranged: 3000, defence: 2500, construction: 1500 },
    items: [{ id: 14403, name: 'Tower crest', count: 1 }, { id: 101, name: 'Coins', count: 8000 }],
    questPoints: 3,
    unlocks: ["item_unlock:the_tower_of_trials_completion"],
  },
});

console.log('[aelgard] Quest blitz: 30 quests loaded');
