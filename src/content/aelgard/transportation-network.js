// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Transportation Network
// Every travel method in the game. This is depth: OSRS has 50+ teleport
// methods, fairy rings, spirit trees, charter ships, canoes, gnome gliders.
// Each one is a breakpoint that changes how you play (P08).
//
// This creates hours because: unlocking teleports requires quests, items,
// levels, and region exploration. The JOURNEY to unlock them IS content.
// ══════════════════════════════════════════════════════════════════════════════

const items = require('../../data/items');

const teleports = [];
const transportRoutes = [];

function defineTeleport(opts) {
  teleports.push({
    id: opts.id, name: opts.name,
    type: opts.type, // 'spell', 'item', 'jewellery', 'fairy_ring', 'spirit_tree', 'other'
    destination: opts.destination,
    region: opts.region,
    requirements: opts.requirements || {},
    spellbook: opts.spellbook || null,
    charges: opts.charges || null,
    description: opts.description,
  });
}

function defineRoute(opts) {
  transportRoutes.push({
    id: opts.id, name: opts.name,
    type: opts.type, // 'boat', 'cart', 'tram', 'canoe', 'glider', 'balloon', 'shortcut'
    from: opts.from, to: opts.to,
    cost: opts.cost || 0,
    requirements: opts.requirements || {},
    description: opts.description,
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// SPELL TELEPORTS — Standard spellbook
// ══════════════════════════════════════════════════════════════════════════════

defineTeleport({ id: 'tp_heartlands', name: 'Heartlands Teleport', type: 'spell', destination: 'Heartlands town square', region: 'Heartlands', spellbook: 'standard', requirements: { skills: { magic: 25 } } });
defineTeleport({ id: 'tp_saltbrine', name: 'Saltbrine Teleport', type: 'spell', destination: 'Saltbrine harbour', region: 'Saltbrine', spellbook: 'standard', requirements: { skills: { magic: 37 } } });
defineTeleport({ id: 'tp_sootworks', name: 'Sootworks Teleport', type: 'spell', destination: 'Sootworks forge hall', region: 'Sootworks', spellbook: 'standard', requirements: { skills: { magic: 45 } } });
defineTeleport({ id: 'tp_moryskah', name: 'Moryskah Teleport', type: 'spell', destination: 'Moryskah village', region: 'Moryskah', spellbook: 'standard', requirements: { skills: { magic: 52 }, quests: ['the_bog_witchs_bargain'] } });
defineTeleport({ id: 'tp_house', name: 'Teleport to House', type: 'spell', destination: 'Player-owned house', spellbook: 'standard', requirements: { skills: { magic: 40 } } });

// ══════════════════════════════════════════════════════════════════════════════
// SPELL TELEPORTS — Ancient spellbook
// ══════════════════════════════════════════════════════════════════════════════

defineTeleport({ id: 'tp_ice_plateau', name: 'Ice Plateau Teleport', type: 'spell', destination: 'Northern Wilds (dangerous)', region: 'Wilds', spellbook: 'ancient', requirements: { skills: { magic: 89 }, quests: ['desert_treasure'] } });
defineTeleport({ id: 'tp_paddewwa', name: 'Paddewwa Teleport', type: 'spell', destination: 'Edgeville dungeon equivalent', region: 'Wilds', spellbook: 'ancient', requirements: { skills: { magic: 54 }, quests: ['desert_treasure'] } });
defineTeleport({ id: 'tp_senntisten', name: 'Senntisten Teleport', type: 'spell', destination: 'Boneyard digsite', region: 'Boneyard', spellbook: 'ancient', requirements: { skills: { magic: 60 }, quests: ['desert_treasure'] } });
defineTeleport({ id: 'tp_kharyrll', name: 'Kharyrll Teleport', type: 'spell', destination: 'Castle Malachar', region: 'Moryskah', spellbook: 'ancient', requirements: { skills: { magic: 66 }, quests: ['desert_treasure'] } });

// ══════════════════════════════════════════════════════════════════════════════
// SPELL TELEPORTS — Lunar spellbook
// ══════════════════════════════════════════════════════════════════════════════

defineTeleport({ id: 'tp_moonclan', name: 'Moonclan Teleport', type: 'spell', destination: 'Inkweald boundary', region: 'Inkweald', spellbook: 'lunar', requirements: { skills: { magic: 69 }, quests: ['lunar_diplomacy'] } });
defineTeleport({ id: 'tp_fishing_guild', name: 'Fishing Guild Teleport', type: 'spell', destination: 'Saltbrine fishing guild', region: 'Saltbrine', spellbook: 'lunar', requirements: { skills: { magic: 85 }, quests: ['lunar_diplomacy'] } });

// ══════════════════════════════════════════════════════════════════════════════
// [v0.9-waveC2 — M2] SPELL TELEPORTS — per-region expansion (standard/ancient/lunar)
// Closes the ~100-teleport parity gap. Each is Scape-flavored (uses Aelgard
// region lore + quest gates), never verbatim OSRS.
// ══════════════════════════════════════════════════════════════════════════════

// Standard-spellbook region expansions
defineTeleport({ id: 'tp_veilwood', name: 'Veilwood Teleport', type: 'spell', destination: 'Veilwood elven village', region: 'Veilwood', spellbook: 'standard', requirements: { skills: { magic: 58 }, quests: ['the_elven_accord'] }, description: 'Lands beneath the Crystalline Arch; costs an extra law rune if fog is thick.' });
defineTeleport({ id: 'tp_boneyard', name: 'Boneyard Teleport', type: 'spell', destination: 'Boneyard oasis camp', region: 'Boneyard', spellbook: 'standard', requirements: { skills: { magic: 48 } }, description: 'Desert winds ensure you arrive with sand in every pocket.' });
defineTeleport({ id: 'tp_glass_desert', name: 'Glass Desert Teleport', type: 'spell', destination: 'Glass Desert outpost', region: 'Glass Desert', spellbook: 'standard', requirements: { skills: { magic: 64 }, quests: ['the_shardwalker'] }, description: 'Glass dust shimmers in the air on arrival.' });
defineTeleport({ id: 'tp_inkweald', name: 'Inkweald Teleport', type: 'spell', destination: 'Inkweald boundary camp', region: 'Inkweald', spellbook: 'standard', requirements: { skills: { magic: 71 }, quests: ['the_dreaming_wound'] }, description: 'Caster must hold the ink-dipped focus; teleport fizzles on dream-incoherent players.' });
defineTeleport({ id: 'tp_drifting_market', name: 'Drifting Market Teleport', type: 'spell', destination: "Drifting Market's current mooring", region: 'Saltbrine', spellbook: 'standard', requirements: { skills: { magic: 55 }, quests: ['the_merchants_whisper'] }, description: 'Destination shifts daily; the spell chases the market wherever it moored at dawn.' });
defineTeleport({ id: 'tp_castle_malachar', name: 'Castle Malachar Teleport', type: 'spell', destination: 'Castle Malachar audience hall', region: 'Moryskah', spellbook: 'standard', requirements: { skills: { magic: 75 }, quests: ['the_bog_witchs_bargain', 'blood_in_the_halls'] }, description: 'Requires signet of safe-passage; casting without it drops you in the oubliette.' });

// Ancient-spellbook expansions — Scape's ancient magicks touch desert + wilds + deep dungeons
defineTeleport({ id: 'tp_annakarl', name: 'Annakarl Teleport', type: 'spell', destination: 'Deep Wilds demonic ruin', region: 'Wilds', spellbook: 'ancient', requirements: { skills: { magic: 78 }, quests: ['desert_treasure'] }, description: 'Lava-glazed flagstones; one of the four ancient city glyphs.' });
defineTeleport({ id: 'tp_carrallanger', name: 'Carrallanger Teleport', type: 'spell', destination: 'Graveyard of Shadows', region: 'Wilds', spellbook: 'ancient', requirements: { skills: { magic: 84 }, quests: ['desert_treasure'] }, description: 'The fourth ancient city. Clan wars thrive here.' });
defineTeleport({ id: 'tp_ghorrock', name: 'Ghorrock Teleport', type: 'spell', destination: 'Frozen Ghorrock prison', region: 'Wilds', spellbook: 'ancient', requirements: { skills: { magic: 96 }, quests: ['desert_treasure', 'the_iceforged_pact'] }, description: 'The coldest ancient spell. Freeze-walk active on arrival.' });

// Lunar-spellbook expansions — Scape's lunar magicks are utility + party support
defineTeleport({ id: 'tp_catherby', name: 'Saltbrine Shore Teleport', type: 'spell', destination: 'Saltbrine Shore — sandmoot beach', region: 'Saltbrine', spellbook: 'lunar', requirements: { skills: { magic: 72 }, quests: ['lunar_diplomacy'] }, description: 'Drops caster on tidepool-safe dunes west of the fishing guild.' });
defineTeleport({ id: 'tp_waterbirth', name: 'Tidemother Teleport', type: 'spell', destination: 'Tidemother sanctuary (underwater cavern)', region: 'Saltbrine', spellbook: 'lunar', requirements: { skills: { magic: 76 }, quests: ['lunar_diplomacy', 'the_trawlers_call'] }, description: 'Lunar-group teleport; can carry one linked party member per cast.' });
defineTeleport({ id: 'tp_khazard', name: 'Khazard Battlefield Teleport', type: 'spell', destination: 'Old battlefield memorial (Heartlands border)', region: 'Heartlands', spellbook: 'lunar', requirements: { skills: { magic: 78 }, quests: ['lunar_diplomacy'] }, description: 'Lands at the poppy-field cenotaph; quiet arrival, no sound.' });

// ══════════════════════════════════════════════════════════════════════════════
// [v0.9-waveC2 — M2] JEWELLERY TELEPORTS — 10 new charged trinkets
// Scape-flavored names; mixes crafter-gated + quest-gated tiers.
// ══════════════════════════════════════════════════════════════════════════════

defineTeleport({ id: 'tp_digsite_pendant', name: 'Digsite Pendant', type: 'jewellery', destination: 'Boneyard digsite / Sandcrown Ruin / Fossil vault', charges: 5, requirements: { quests: ['the_digsite'], skills: { crafting: 45 } }, description: 'Five charges, three destinations. Bonecrafter favourite.' });
defineTeleport({ id: 'tp_burning_amulet', name: 'Burning Amulet', type: 'jewellery', destination: 'Wilds lava pit / Ferox enclave / Ember caverns', charges: 5, requirements: { skills: { crafting: 70 } }, description: 'Drops you in level 25-35 Wilds zones. High-risk shortcut.' });
defineTeleport({ id: 'tp_necklace_of_binding', name: 'Necklace of Binding', type: 'jewellery', destination: 'Runecrafting altars (3 choices)', charges: 4, requirements: { skills: { crafting: 58, runecrafting: 60 } }, description: 'Scape-native alternative to binding tiara — quick-teleport to fire/water/earth altars.' });
defineTeleport({ id: 'tp_ring_of_shadows', name: 'Ring of Shadows', type: 'jewellery', destination: 'Moryskah catacombs / Inkweald boundary / Soulfen gallows', charges: 5, requirements: { quests: ['the_bog_witchs_bargain'], skills: { crafting: 74 } }, description: 'Black-iron ring enchanted with stygian haze. Slightly reduces aggro for 2 ticks on arrival.' });
defineTeleport({ id: 'tp_amulet_of_chemistry', name: 'Amulet of Chemistry', type: 'jewellery', destination: 'Heartlands herb shop / Veilwood apothecary / Boneyard alchemist', charges: 5, requirements: { skills: { crafting: 38 } }, description: 'Herblorist jewellery. Last charge also grants 5% potion-yield bonus on use.' });
defineTeleport({ id: 'tp_ferocious_ring', name: 'Ferocious Ring', type: 'jewellery', destination: 'Glass Desert beast-hide camp / Wilds mammoth grounds / Veldrak approach', charges: 3, requirements: { skills: { crafting: 89 }, quests: ['the_bonewright_order'] }, description: 'Hunter-tier ring. Grants +3% hunter trap success for 30 minutes after each use.' });
defineTeleport({ id: 'tp_amulet_of_forge', name: 'Amulet of the Forge', type: 'jewellery', destination: 'Sootworks forge hall / Smithing guild / Heartlands anvil row', charges: 6, requirements: { skills: { crafting: 62, smithing: 60 }, quests: ['sootworks_rising'] }, description: 'Sootworks-minted gold amulet. Every seventh charge restocks itself from ambient forge-heat.' });
defineTeleport({ id: 'tp_ring_of_the_tide', name: 'Ring of the Tide', type: 'jewellery', destination: 'Saltbrine harbour / Tidemother shrine / Fishing guild', charges: 4, requirements: { skills: { crafting: 54, fishing: 65 } }, description: 'Drips faint seawater for one tick after teleport. Free charter-ship discount while worn.' });
defineTeleport({ id: 'tp_necklace_of_archery', name: "Necklace of the Archer's Path", type: 'jewellery', destination: 'Heartlands ranging guild / Veilwood nock-range / Inkweald loose-shot hollow', charges: 4, requirements: { skills: { crafting: 48, ranged: 60 } }, description: 'Scape-native ranging trinket. Last-charge bonus: +5% arrow save for 10 minutes.' });
defineTeleport({ id: 'tp_ancient_wayfinder', name: 'Ancient Wayfinder Amulet', type: 'jewellery', destination: 'Any previously-visited Aelgard spirit tree (up to 3)', charges: 2, requirements: { quests: ['the_first_wayfinder'], skills: { crafting: 80, magic: 75 } }, description: 'Grandmaster endgame trinket; charges are scarce but destinations flexible.' });

// ══════════════════════════════════════════════════════════════════════════════
// JEWELLERY TELEPORTS — consumable charges
// ══════════════════════════════════════════════════════════════════════════════

defineTeleport({ id: 'tp_glory', name: 'Amulet of Glory', type: 'jewellery', destination: 'Heartlands / Boneyard / Wilds border / Saltbrine', charges: 4, requirements: { quests: [] }, description: '4 destinations, 4 charges. The universal teleport.' });
defineTeleport({ id: 'tp_games', name: 'Games Necklace', type: 'jewellery', destination: 'Pest Control / Castle Wars / Spirit Pyre', charges: 8, description: 'Teleport to minigame locations.' });
defineTeleport({ id: 'tp_dueling', name: 'Ring of Dueling', type: 'jewellery', destination: 'Castle Wars / Duel Arena', charges: 8 });
defineTeleport({ id: 'tp_skills', name: 'Skills Necklace', type: 'jewellery', destination: 'Mining Guild / Fishing Guild / Farming Guild / Crafting Guild', charges: 4 });
defineTeleport({ id: 'tp_combat', name: 'Combat Bracelet', type: 'jewellery', destination: 'Warriors Guild / Ranging Guild / Champions Guild', charges: 4 });
defineTeleport({ id: 'tp_slayer_ring', name: 'Slayer Ring', type: 'jewellery', destination: 'Slayer Tower / Moryskah catacombs / Sootworks mine', charges: 8, requirements: { skills: { slayer: 55, crafting: 75 } } });
defineTeleport({ id: 'tp_passage', name: 'Necklace of Passage', type: 'jewellery', destination: 'Inkweald boundary / Veilwood outpost / Wilds agility course', charges: 5 });
defineTeleport({ id: 'tp_wealth', name: 'Ring of Wealth', type: 'jewellery', destination: 'Grand Exchange / Heartlands / Wilds (dangerous)', charges: 5, description: 'Also improves rare drop table.' });
defineTeleport({ id: 'tp_seed_pod', name: 'Royal Seed Pod', type: 'item', destination: 'Grand Exchange (instant, 1-click)', requirements: { quests: ['monkey_business'] }, description: 'Instant teleport from anywhere. Even the Wilds up to level 30.' });

// ══════════════════════════════════════════════════════════════════════════════
// FAIRY RINGS — network of 40+ destinations, requires Dramen staff
// Each ring is a 3-letter code. Players memorize useful codes.
// THIS is deep content: learning the fairy ring network is hours of exploration.
// ══════════════════════════════════════════════════════════════════════════════

items.define({ id: 86001, name: 'Dramen staff', examine: 'Required to use fairy rings. Obtained from Lost City quest.', value: 0, category: 'weapon', equipSlot: 'weapon', speed: 5, stats: { magic: 10, crush: 10 }, equipReqs: {}, tradeable: false });
items.define({ id: 86002, name: 'Lunar staff', examine: 'Can also activate fairy rings. From Lunar Diplomacy.', value: 0, category: 'weapon', equipSlot: 'weapon', speed: 5, stats: { magic: 15, crush: 12 }, equipReqs: { magic: 65 }, tradeable: false });

const fairyRings = [
  { code: 'AKS', destination: 'Heartlands — south of town (near goblins)', region: 'Heartlands' },
  { code: 'BKR', destination: 'Heartlands — north (Wilds border)', region: 'Heartlands' },
  { code: 'CKR', destination: 'Boneyard — oasis camp', region: 'Boneyard' },
  { code: 'DKS', destination: 'Boneyard — pyramid entrance', region: 'Boneyard' },
  { code: 'ALP', destination: 'Moryskah — village square', region: 'Moryskah' },
  { code: 'BIP', destination: 'Moryskah — slayer tower', region: 'Moryskah' },
  { code: 'CIP', destination: 'Moryskah — Castle Malachar', region: 'Moryskah' },
  { code: 'ALQ', destination: 'Veilwood — elven village', region: 'Veilwood' },
  { code: 'BLQ', destination: 'Veilwood — sacred grove', region: 'Veilwood' },
  { code: 'CLQ', destination: 'Veilwood — deep forest', region: 'Veilwood' },
  { code: 'AKQ', destination: 'Sootworks — forge hall entrance', region: 'Sootworks' },
  { code: 'BKQ', destination: 'Sootworks — deep vein', region: 'Sootworks' },
  { code: 'AJS', destination: 'Saltbrine — harbour', region: 'Saltbrine' },
  { code: 'BJS', destination: 'Saltbrine — pirate cove', region: 'Saltbrine' },
  { code: 'CJS', destination: 'Saltbrine — fishing guild', region: 'Saltbrine' },
  { code: 'DJS', destination: 'Saltbrine — underwater caves', region: 'Saltbrine' },
  { code: 'AIS', destination: 'Inkweald — boundary camp', region: 'Inkweald' },
  { code: 'BIS', destination: 'Inkweald — deep dream (dangerous)', region: 'Inkweald' },
  { code: 'CIS', destination: 'Inkweald — resonance chamber entrance', region: 'Inkweald' },
  { code: 'AKP', destination: 'Glass Desert — outpost', region: 'Glass Desert' },
  { code: 'BKP', destination: 'Glass Desert — Crystal Wyrm lair entrance', region: 'Glass Desert' },
  { code: 'CKP', destination: 'Glass Desert — Veldrak approach', region: 'Glass Desert' },
  { code: 'DKP', destination: 'Glass Desert — Tombs of Aelgard entrance', region: 'Glass Desert' },
  { code: 'AJR', destination: 'Wilds — level 10', region: 'Wilds' },
  { code: 'BJR', destination: 'Wilds — ruins', region: 'Wilds' },
  { code: 'CJR', destination: 'Wilds — lava pit', region: 'Wilds' },
  { code: 'DJR', destination: 'Wilds — KBD lair entrance', region: 'Wilds' },
  { code: 'AIQ', destination: 'Farming — herb patch (Heartlands)', region: 'Heartlands' },
  { code: 'BIQ', destination: 'Farming — herb patch (Veilwood)', region: 'Veilwood' },
  { code: 'CIQ', destination: 'Farming — herb patch (Moryskah)', region: 'Moryskah' },
  { code: 'DIQ', destination: 'Farming — herb patch (Boneyard)', region: 'Boneyard' },
  { code: 'AJP', destination: 'Farming — herb patch (Sootworks)', region: 'Sootworks' },
  { code: 'BJP', destination: 'Farming — herb patch (Saltbrine)', region: 'Saltbrine' },
  { code: 'CJP', destination: 'Farming — herb patch (Glass Desert)', region: 'Glass Desert' },
  { code: 'DLP', destination: 'GWD — God Wars dungeon entrance', region: 'Wilds' },
  { code: 'ALS', destination: 'Slayer — cave entrance (Heartlands dungeon)', region: 'Heartlands' },
  { code: 'BLS', destination: 'Slayer — Moryskah catacombs', region: 'Moryskah' },
  { code: 'CLS', destination: 'Hunter — chinchompa area (Veilwood)', region: 'Veilwood' },
  { code: 'DIS', destination: 'Agility — Saltbrine course start', region: 'Saltbrine' },
  { code: 'AKR', destination: 'Agility — Sootworks course start', region: 'Sootworks' },
  // ──────────────────────────────────────────────────────────────────────────
  // [v0.9-waveC2 — M2] 8 new fairy-ring codes (filling the AIR/DKR/DIR/DLR
  // grid gaps). Each lands on a Scape-native destination.
  // ──────────────────────────────────────────────────────────────────────────
  { code: 'AIR', destination: 'Heartlands — north farming patch', region: 'Heartlands' },
  { code: 'DKR', destination: 'Wilds — Revenant caves antechamber', region: 'Wilds' },
  { code: 'DIR', destination: 'Inkweald — deep dream (dangerous)', region: 'Inkweald' },
  { code: 'DLR', destination: 'Moryskah — Soulfen gallows', region: 'Moryskah' },
  { code: 'BLP', destination: 'Boneyard — fossil vault approach', region: 'Boneyard' },
  { code: 'DLQ', destination: 'Veilwood — crystalline arch', region: 'Veilwood' },
  { code: 'ALR', destination: 'Saltbrine — Tidemother shrine (underwater)', region: 'Saltbrine' },
  { code: 'CLR', destination: 'Glass Desert — Tombs of Aelgard inner ring', region: 'Glass Desert' },
];

// ══════════════════════════════════════════════════════════════════════════════
// SPIRIT TREES — permanent teleport network for farmers
// Requires 83 Farming to plant. 4 locations. Instant travel between them.
// ══════════════════════════════════════════════════════════════════════════════

items.define({ id: 86010, name: 'Spirit tree seed', examine: 'Plant in a spirit tree patch. Takes 58 hours to grow. Permanent teleport.', value: 50000, category: 'farming', weight: 0.1 });

const spiritTrees = [
  { location: 'Heartlands town park', region: 'Heartlands', farmingLevel: 83 },
  { location: 'Veilwood elven village', region: 'Veilwood', farmingLevel: 83 },
  { location: 'Saltbrine harbour', region: 'Saltbrine', farmingLevel: 83 },
  { location: 'Sootworks surface entrance', region: 'Sootworks', farmingLevel: 83 },
  { location: 'Glass Desert outpost', region: 'Glass Desert', farmingLevel: 89 },
  // Player can plant their own in POH at 75 Construction
];

// ══════════════════════════════════════════════════════════════════════════════
// TRANSPORT ROUTES — boats, carts, trams, canoes, shortcuts
// ══════════════════════════════════════════════════════════════════════════════

// Boats
defineRoute({ id: 'boat_hs', name: 'Ferry to Saltbrine', type: 'boat', from: 'Heartlands dock', to: 'Saltbrine harbour', cost: 30, description: 'Regular ferry service.' });
defineRoute({ id: 'boat_sm', name: 'Ferry to Moryskah', type: 'boat', from: 'Saltbrine harbour', to: 'Moryskah swamp dock', cost: 50, description: 'Swamp ferry. Bring insect repellent.' });
defineRoute({ id: 'charter_any', name: 'Charter ship', type: 'boat', from: 'Any port', to: 'Any port', cost: 200, description: 'Expensive but goes anywhere with a dock.' });
defineRoute({ id: 'boat_pest', name: 'Boat to Pest Control', type: 'boat', from: 'Heartlands dock', to: 'Pest Control island', cost: 0 });

// Carts
defineRoute({ id: 'cart_hb', name: 'Cart to Boneyard', type: 'cart', from: 'Heartlands south gate', to: 'Boneyard oasis', cost: 20, description: 'Bumpy ride through the desert.' });

// Steam tram (Sootworks internal)
defineRoute({ id: 'tram_upper', name: 'Steam tram (upper)', type: 'tram', from: 'Sootworks forge hall', to: 'Sootworks upper mines', cost: 0, description: 'Free internal transport.' });
defineRoute({ id: 'tram_lower', name: 'Steam tram (lower)', type: 'tram', from: 'Sootworks forge hall', to: 'Sootworks deep vein', cost: 0, requirements: { quests: ['sootworks_rising'] } });

// Canoes (Woodcutting)
defineRoute({ id: 'canoe_1', name: 'Log canoe', type: 'canoe', from: 'Heartlands river', to: '1 station downstream', requirements: { skills: { woodcutting: 12 } } });
defineRoute({ id: 'canoe_2', name: 'Dugout canoe', type: 'canoe', from: 'Heartlands river', to: '2 stations downstream', requirements: { skills: { woodcutting: 27 } } });
defineRoute({ id: 'canoe_3', name: 'Stable dugout', type: 'canoe', from: 'Heartlands river', to: '3 stations downstream', requirements: { skills: { woodcutting: 42 } } });
defineRoute({ id: 'canoe_4', name: 'Waka canoe', type: 'canoe', from: 'Heartlands river', to: 'Wilds (one-way!)', requirements: { skills: { woodcutting: 57 } } });

// Agility shortcuts (region-specific, require levels)
defineRoute({ id: 'short_h1', name: 'Heartlands wall shortcut', type: 'shortcut', from: 'Heartlands east', to: 'Mining area', requirements: { skills: { agility: 10 } } });
defineRoute({ id: 'short_h2', name: 'Heartlands dungeon pipe', type: 'shortcut', from: 'Heartlands dungeon L1', to: 'Heartlands dungeon L2', requirements: { skills: { agility: 30 } } });
defineRoute({ id: 'short_m1', name: 'Moryskah swamp shortcut', type: 'shortcut', from: 'Moryskah border', to: 'Moryskah village', requirements: { skills: { agility: 25 } } });
defineRoute({ id: 'short_m2', name: 'Castle Malachar rope', type: 'shortcut', from: 'Castle Malachar entrance', to: 'Castle Malachar upper floor', requirements: { skills: { agility: 50 } } });
defineRoute({ id: 'short_v1', name: 'Veilwood log balance', type: 'shortcut', from: 'Veilwood entrance', to: 'Elven village', requirements: { skills: { agility: 35 } } });
defineRoute({ id: 'short_v2', name: 'Veilwood vine swing', type: 'shortcut', from: 'Veilwood grove', to: 'Deep forest', requirements: { skills: { agility: 55 } } });
defineRoute({ id: 'short_s1', name: 'Sootworks pipe crawl', type: 'shortcut', from: 'Sootworks upper', to: 'Sootworks lower', requirements: { skills: { agility: 40 } } });
defineRoute({ id: 'short_s2', name: 'Sootworks lava jump', type: 'shortcut', from: 'Sootworks mine', to: 'Deep vein', requirements: { skills: { agility: 65 } } });
defineRoute({ id: 'short_sb1', name: 'Saltbrine cliff climb', type: 'shortcut', from: 'Saltbrine coast', to: 'Pirate cove', requirements: { skills: { agility: 30 } } });
defineRoute({ id: 'short_sb2', name: 'Saltbrine underwater tunnel', type: 'shortcut', from: 'Saltbrine harbour', to: 'Kraken entrance', requirements: { skills: { agility: 60 } } });
defineRoute({ id: 'short_g1', name: 'Glass Desert crystal ledge', type: 'shortcut', from: 'Glass Desert outpost', to: 'Crystal Wyrm approach', requirements: { skills: { agility: 70 } } });
defineRoute({ id: 'short_g2', name: 'Glass Desert canyon rope', type: 'shortcut', from: 'Glass Desert east', to: 'Veldrak approach', requirements: { skills: { agility: 80 } } });
defineRoute({ id: 'short_i1', name: 'Inkweald dream bridge', type: 'shortcut', from: 'Inkweald boundary', to: 'Inkweald mid', requirements: { skills: { agility: 45 } } });
defineRoute({ id: 'short_i2', name: 'Inkweald void leap', type: 'shortcut', from: 'Inkweald mid', to: 'Resonance chamber', requirements: { skills: { agility: 75 } } });
defineRoute({ id: 'short_w1', name: 'Wilds web slash', type: 'shortcut', from: 'Wilds level 5', to: 'Wilds level 15', requirements: { items: ['knife'] } });
defineRoute({ id: 'short_w2', name: 'Wilds lava jump', type: 'shortcut', from: 'Wilds level 30', to: 'Wilds level 40', requirements: { skills: { agility: 50 } } });
defineRoute({ id: 'short_b1', name: 'Boneyard sand slide', type: 'shortcut', from: 'Boneyard surface', to: 'Pyramid entrance', requirements: { skills: { agility: 20 } } });
defineRoute({ id: 'short_b2', name: 'Boneyard fossil bridge', type: 'shortcut', from: 'Boneyard north', to: 'Boneyard south', requirements: { skills: { agility: 45 } } });

console.log(`[aelgard] Transportation: ${teleports.length} teleports, ${fairyRings.length} fairy rings, ${spiritTrees.length} spirit trees, ${transportRoutes.length} routes/shortcuts`);

module.exports = { teleports, transportRoutes, fairyRings, spiritTrees, defineTeleport, defineRoute };
