// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Expanded Clue Scroll System
// 200+ clue steps across 5 tiers (adding Master tier)
// Each step requires travel, knowledge, or combat.
//
// OSRS has ~400 clue steps. This brings us to 200+ which is meaningful.
// Completing all tiers at all difficulties = hundreds of hours.
// ══════════════════════════════════════════════════════════════════════════════

const { clueSteps, defineClueStep, rewardTables, defineRewardTable } = require('./treasure-trails');
const items = require('../../data/items');

// Master clue items
items.define({ id: 33005, name: 'Clue scroll (master)', examine: 'A master treasure trail clue. The hardest tier.', value: 0, category: 'clue', tradeable: false });
items.define({ id: 33014, name: 'Reward casket (master)', examine: 'Open for master clue rewards.', value: 0, category: 'clue', tradeable: false });

// Master-exclusive rewards
items.define({ id: 34001, name: 'Bloodhound', examine: 'A loyal bloodhound from master clue scrolls.', value: 0, category: 'pet', tradeable: false });
items.define({ id: 34002, name: '3rd age druidic robe top', examine: 'Ancient druidic robes. The rarest item in the game.', value: 100000000, category: 'armour', equipSlot: 'body', stats: { prayer: 11, def_magic: 15 }, equipReqs: {} });
items.define({ id: 34003, name: '3rd age druidic robe bottom', examine: 'Ancient druidic legs.', value: 80000000, category: 'armour', equipSlot: 'legs', stats: { prayer: 9, def_magic: 12 }, equipReqs: {} });
items.define({ id: 34004, name: '3rd age druidic cloak', examine: 'Ancient druidic cape.', value: 60000000, category: 'armour', equipSlot: 'cape', stats: { prayer: 7, def_magic: 8 }, equipReqs: {} });
items.define({ id: 34005, name: 'Ring of 3rd age', examine: 'An ancient ring of unimaginable value.', value: 50000000, category: 'jewellery', equipSlot: 'ring', stats: { stab: 4, slash: 4, crush: 4, ranged: 4, magic: 4, prayer: 4 }, equipReqs: {} });
items.define({ id: 34006, name: 'Gilded scimitar', examine: 'A golden rune scimitar. Cosmetic.', value: 500000, category: 'weapon', equipSlot: 'weapon', speed: 4, stats: { slash: 45, melee_strength: 44 }, equipReqs: { attack: 40 } });
items.define({ id: 34007, name: 'Gilded platebody', examine: 'A golden rune platebody. Cosmetic.', value: 1000000, category: 'armour', equipSlot: 'body', stats: { def_stab: 82, def_slash: 80, def_crush: 72 }, equipReqs: { defence: 40 } });
items.define({ id: 34008, name: 'Ankou mask', examine: 'A mask that makes you look like an ankou.', value: 200000, category: 'armour', equipSlot: 'head', stats: {}, equipReqs: {} });
items.define({ id: 34009, name: 'Mummy head', examine: 'Wrap yourself up. Cosmetic headpiece.', value: 200000, category: 'armour', equipSlot: 'head', stats: {}, equipReqs: {} });
items.define({ id: 34010, name: 'Samurai top', examine: 'Ornamental samurai armour top.', value: 300000, category: 'armour', equipSlot: 'body', stats: { def_stab: 40, def_slash: 42, def_crush: 38 }, equipReqs: { defence: 20 } });

// ══════════════════════════════════════════════════════════════════════════════
// EXPANDED STEPS — 30 per tier = 150 new steps
// ══════════════════════════════════════════════════════════════════════════════

// ── BEGINNER (10 more → 15 total) ─────────────────────────────────────────

defineClueStep({ id: 'b6', tier: 'beginner', type: 'coordinate', description: 'Dig at 104, 88 near Smith Kael.', region: 'Heartlands' });
defineClueStep({ id: 'b7', tier: 'beginner', type: 'riddle', description: 'She sells general goods. Find her.', solution: 'Merchant Hilde', region: 'Heartlands' });
defineClueStep({ id: 'b8', tier: 'beginner', type: 'coordinate', description: 'Dig at 95, 118 on the goblin road.', region: 'Heartlands' });
defineClueStep({ id: 'b9', tier: 'beginner', type: 'riddle', description: 'Patrol leader at the south road. Who gives the orders?', solution: 'Captain Alden', region: 'Heartlands' });
defineClueStep({ id: 'b10', tier: 'beginner', type: 'coordinate', description: 'Dig at 120, 100 near the giant rats.', region: 'Heartlands' });
defineClueStep({ id: 'b11', tier: 'beginner', type: 'emote', description: 'Wave at the bank booth in the Heartlands town.', region: 'Heartlands' });
defineClueStep({ id: 'b12', tier: 'beginner', type: 'riddle', description: 'Burns in the dark, tans in the sun. What am I?', solution: 'Tinderbox', region: 'Heartlands' });
defineClueStep({ id: 'b13', tier: 'beginner', type: 'coordinate', description: 'Dig at 80, 110 in the farming area.', region: 'Heartlands' });
defineClueStep({ id: 'b14', tier: 'beginner', type: 'riddle', description: 'I am found in walls but not in buildings. What am I?', solution: 'A door', region: 'Heartlands' });
defineClueStep({ id: 'b15', tier: 'beginner', type: 'coordinate', description: 'Dig at 110, 95 in the eastern town.', region: 'Heartlands' });

// ── MEDIUM (15 more → 23 total) ───────────────────────────────────────────

defineClueStep({ id: 'm9', tier: 'medium', type: 'coordinate', description: 'Dig at 60, 85 in the Veilwood elven village.', region: 'Veilwood' });
defineClueStep({ id: 'm10', tier: 'medium', type: 'riddle', description: 'Underground, he forges iron into steel into gold. Find the master.', solution: 'Forgemaster Brun', region: 'Sootworks' });
defineClueStep({ id: 'm11', tier: 'medium', type: 'emote', description: 'Dance at the Saltbrine harbour fish market.', region: 'Saltbrine' });
defineClueStep({ id: 'm12', tier: 'medium', type: 'coordinate', description: 'Dig at 140, 165 in the Boneyard desert.', region: 'Boneyard' });
defineClueStep({ id: 'm13', tier: 'medium', type: 'combat', description: 'Kill a goblin warrior and search its remains.', combatLevel: 13, region: 'Heartlands' });
defineClueStep({ id: 'm14', tier: 'medium', type: 'riddle', description: 'She brews potions in the deepest swamp. Who is she?', solution: 'Bog Witch Grael', region: 'Moryskah' });
defineClueStep({ id: 'm15', tier: 'medium', type: 'coordinate', description: 'Dig at 95, 195 at the Inkweald boundary.', region: 'Inkweald' });
defineClueStep({ id: 'm16', tier: 'medium', type: 'emote', description: 'Bow at the prayer altar in the Heartlands.', region: 'Heartlands' });
defineClueStep({ id: 'm17', tier: 'medium', type: 'coordinate', description: 'Dig at 165, 80 in the Sootworks forge hall.', region: 'Sootworks' });
defineClueStep({ id: 'm18', tier: 'medium', type: 'riddle', description: 'They sell bows and arrows. The target master.', solution: 'Bolt the Ranger', region: 'Saltbrine' });
defineClueStep({ id: 'm19', tier: 'medium', type: 'combat', description: 'Kill a hill giant and search its remains.', combatLevel: 28, region: 'Heartlands' });
defineClueStep({ id: 'm20', tier: 'medium', type: 'coordinate', description: 'Dig at 172, 138 in Moryskah village.', region: 'Moryskah' });
defineClueStep({ id: 'm21', tier: 'medium', type: 'emote', description: 'Clap at the Boneyard oasis while wearing full desert gear.', region: 'Boneyard' });
defineClueStep({ id: 'm22', tier: 'medium', type: 'riddle', description: 'Count my rings and you know my age. What am I?', solution: 'A tree', region: 'Veilwood' });
defineClueStep({ id: 'm23', tier: 'medium', type: 'coordinate', description: 'Dig at 220, 128 near the Glass Desert outpost.', region: 'Glass Desert' });

// ── HARD (15 more → 25 total) ─────────────────────────────────────────────

defineClueStep({ id: 'h11', tier: 'hard', type: 'coordinate', description: 'Dig at 85, 150 in the pirate cove.', region: 'Saltbrine' });
defineClueStep({ id: 'h12', tier: 'hard', type: 'combat', description: 'Kill a double agent (level 140) at the Veilwood sacred grove.', combatLevel: 140, region: 'Veilwood' });
defineClueStep({ id: 'h13', tier: 'hard', type: 'emote', description: 'Yawn at the Moryskah slayer tower entrance while wearing full Ahrim.', region: 'Moryskah' });
defineClueStep({ id: 'h14', tier: 'hard', type: 'riddle', description: 'I guard the deep forge but forgot my masters. What am I?', solution: 'Vorath', region: 'Sootworks' });
defineClueStep({ id: 'h15', tier: 'hard', type: 'coordinate', description: 'Dig at 200, 108 in the Sootworks deep vein.', region: 'Sootworks' });
defineClueStep({ id: 'h16', tier: 'hard', type: 'puzzle', description: 'Complete the light beam puzzle in the pyramid lower level.' });
defineClueStep({ id: 'h17', tier: 'hard', type: 'combat', description: 'Kill a double agent (level 120) at the Saltbrine harbour.', combatLevel: 120, region: 'Saltbrine' });
defineClueStep({ id: 'h18', tier: 'hard', type: 'emote', description: 'Cry at the Crystal Wyrm lair entrance while wielding a crystal weapon.', region: 'Glass Desert' });
defineClueStep({ id: 'h19', tier: 'hard', type: 'riddle', description: 'Six sleep in mounds, one sleeps deepest. Who guards the chest?', solution: 'The Barrows Brothers', region: 'Moryskah' });
defineClueStep({ id: 'h20', tier: 'hard', type: 'coordinate', description: 'Dig at 130, 225 deep inside the Inkweald.', region: 'Inkweald' });
defineClueStep({ id: 'h21', tier: 'hard', type: 'combat', description: 'Kill a double agent (level 150) at the God Wars dungeon entrance.', combatLevel: 150 });
defineClueStep({ id: 'h22', tier: 'hard', type: 'emote', description: 'Dance at General Graardor\'s chamber wearing full rune.', region: 'Wilds' });
defineClueStep({ id: 'h23', tier: 'hard', type: 'riddle', description: 'I split into three when I die. What am I?', solution: 'Blob/Jal-ak (bloblet split mechanic)' });
defineClueStep({ id: 'h24', tier: 'hard', type: 'puzzle', description: 'Complete the Celtic knot puzzle to reveal coordinates.' });
defineClueStep({ id: 'h25', tier: 'hard', type: 'coordinate', description: 'Dig at 160, 170 inside Bog Witch Grael\'s hut.', region: 'Moryskah' });

// ── ELITE (15 more → 23 total) ────────────────────────────────────────────

defineClueStep({ id: 'e9', tier: 'elite', type: 'coordinate', description: 'Dig at 198, 172 at Count Malachar\'s throne.', region: 'Moryskah' });
defineClueStep({ id: 'e10', tier: 'elite', type: 'combat', description: 'Kill a double agent (level 220) inside the Corp Beast lair.', combatLevel: 220 });
defineClueStep({ id: 'e11', tier: 'elite', type: 'emote', description: 'Jig on top of the Sootworks Pipe Network final platform.', region: 'Sootworks' });
defineClueStep({ id: 'e12', tier: 'elite', type: 'riddle', description: 'I was once a king but now I rule only bones. Where is my throne?', solution: 'Boneyard pyramid', region: 'Boneyard' });
defineClueStep({ id: 'e13', tier: 'elite', type: 'puzzle', description: 'Complete a 5x5 sliding puzzle.' });
defineClueStep({ id: 'e14', tier: 'elite', type: 'coordinate', description: 'Dig at the center of Veldrak\'s arena (230, 82).', region: 'Glass Desert' });
defineClueStep({ id: 'e15', tier: 'elite', type: 'emote', description: 'Spin at Zulrah\'s shrine wearing full Armadyl.', region: 'Saltbrine' });
defineClueStep({ id: 'e16', tier: 'elite', type: 'combat', description: 'Kill a double agent (level 250) at the lava dragon isle.', combatLevel: 250, region: 'Wilds' });
defineClueStep({ id: 'e17', tier: 'elite', type: 'riddle', description: 'Three heads but one body. Name all three.', solution: 'Rex, Prime, Supreme (Dagannoth Kings)' });
defineClueStep({ id: 'e18', tier: 'elite', type: 'coordinate', description: 'Dig at 150, 10 deep in the wilderness lava pit.', region: 'Wilds' });
defineClueStep({ id: 'e19', tier: 'elite', type: 'emote', description: 'Panic at The Nightmare\'s altar wearing full Inquisitor.', region: 'Inkweald' });
defineClueStep({ id: 'e20', tier: 'elite', type: 'riddle', description: 'The smith forgot but his creation remembers. Name it.', solution: 'Vorath', region: 'Sootworks' });
defineClueStep({ id: 'e21', tier: 'elite', type: 'combat', description: 'Kill a double agent (level 200) at the Hollow Choir entrance.', combatLevel: 200, region: 'Inkweald' });
defineClueStep({ id: 'e22', tier: 'elite', type: 'puzzle', description: 'Complete a lockbox puzzle using 4 keys found across 4 regions.' });
defineClueStep({ id: 'e23', tier: 'elite', type: 'coordinate', description: 'Dig at 60, 205 deep in the Inkweald forest.', region: 'Inkweald' });

// ── MASTER (30 steps — new tier) ──────────────────────────────────────────

defineClueStep({ id: 'ms1', tier: 'master', type: 'coordinate', description: 'Dig at the exact center of the Chambers of Aelgard entrance.', region: 'Glass Desert' });
defineClueStep({ id: 'ms2', tier: 'master', type: 'combat', description: 'Kill a double agent (level 300) inside Veldrak\'s domain.', combatLevel: 300, region: 'Glass Desert' });
defineClueStep({ id: 'ms3', tier: 'master', type: 'riddle', description: 'I sleep beneath crystal, wake to burn the world. Say my name.', solution: 'Veldrak' });
defineClueStep({ id: 'ms4', tier: 'master', type: 'emote', description: 'Perform the "flex" emote at the Inferno entrance wearing an Infernal cape.', region: 'Glass Desert' });
defineClueStep({ id: 'ms5', tier: 'master', type: 'puzzle', description: 'Complete a 7x7 sliding puzzle.' });
defineClueStep({ id: 'ms6', tier: 'master', type: 'coordinate', description: 'Dig at the Corporeal Beast lair entrance.', region: 'Wilds' });
defineClueStep({ id: 'ms7', tier: 'master', type: 'riddle', description: 'Four generals serve four gods. Name the one who poisons.', solution: "K'ril Tsutsaroth" });
defineClueStep({ id: 'ms8', tier: 'master', type: 'combat', description: 'Kill a double agent (level 350) at the Theatre of Shadows entrance.', combatLevel: 350, region: 'Moryskah' });
defineClueStep({ id: 'ms9', tier: 'master', type: 'emote', description: 'Bow at Commander Zilyana\'s chamber wearing full Saradomin blessed d\'hide.', region: 'Wilds' });
defineClueStep({ id: 'ms10', tier: 'master', type: 'coordinate', description: 'Dig at the Nightmare altar in deep Inkweald.', region: 'Inkweald' });
defineClueStep({ id: 'ms11', tier: 'master', type: 'riddle', description: 'I have 2000 hitpoints but no heart. What am I?', solution: 'Corporeal Beast' });
defineClueStep({ id: 'ms12', tier: 'master', type: 'puzzle', description: 'Navigate a 3D maze in the Inkweald dream space.' });
defineClueStep({ id: 'ms13', tier: 'master', type: 'combat', description: 'Kill a double agent (level 280) at Zulrah\'s shrine.', combatLevel: 280, region: 'Saltbrine' });
defineClueStep({ id: 'ms14', tier: 'master', type: 'emote', description: 'Cry at the Kalphite Queen lair wearing full Verac.', region: 'Boneyard' });
defineClueStep({ id: 'ms15', tier: 'master', type: 'coordinate', description: 'Dig at the deepest point of the Sootworks mine.', region: 'Sootworks' });
defineClueStep({ id: 'ms16', tier: 'master', type: 'riddle', description: 'She flies faster than any warrior. Who commands the sky god\'s army?', solution: "Kree'arra" });
defineClueStep({ id: 'ms17', tier: 'master', type: 'combat', description: 'Kill a double agent (level 320) at the King Black Dragon lair.', combatLevel: 320, region: 'Wilds' });
defineClueStep({ id: 'ms18', tier: 'master', type: 'emote', description: 'Jump for joy at the peak of the Sootworks Pipe Network wearing graceful.', region: 'Sootworks' });
defineClueStep({ id: 'ms19', tier: 'master', type: 'coordinate', description: 'Dig at 42, 170 deep in the Moryskah swamp.', region: 'Moryskah' });
defineClueStep({ id: 'ms20', tier: 'master', type: 'riddle', description: 'I guard three crystals behind three gates. Slayer 91 required.', solution: 'Cerberus' });
defineClueStep({ id: 'ms21', tier: 'master', type: 'puzzle', description: 'Complete a cryptic crossword about Aelgard lore.' });
defineClueStep({ id: 'ms22', tier: 'master', type: 'combat', description: 'Kill a double agent (level 350) at the Tombs of Aelgard entrance.', combatLevel: 350, region: 'Boneyard' });
defineClueStep({ id: 'ms23', tier: 'master', type: 'emote', description: 'Stomp at General Graardor\'s chamber wearing full Bandos.', region: 'Wilds' });
defineClueStep({ id: 'ms24', tier: 'master', type: 'coordinate', description: 'Dig at 100, 30 in the deep wilderness ruins.', region: 'Wilds' });
defineClueStep({ id: 'ms25', tier: 'master', type: 'riddle', description: 'She feeds on nightmares and births sleepwalkers. Where does she rest?', solution: 'The Nightmare (Inkweald)' });
defineClueStep({ id: 'ms26', tier: 'master', type: 'puzzle', description: 'Decode a cipher using the Aelgard alphabet (found in quest lore).' });
defineClueStep({ id: 'ms27', tier: 'master', type: 'coordinate', description: 'Dig at the center of the Theatre of Shadows entrance.', region: 'Moryskah' });
defineClueStep({ id: 'ms28', tier: 'master', type: 'emote', description: 'Beckon at the Glass Tyrant arena while wielding the Prismatic blade.', region: 'Glass Desert' });
defineClueStep({ id: 'ms29', tier: 'master', type: 'combat', description: 'Kill a double agent (level 400) at Scorpia\'s lair.', combatLevel: 400, region: 'Wilds' });
defineClueStep({ id: 'ms30', tier: 'master', type: 'riddle', description: 'The last of its kind, it sleeps in crystal. What guards its tomb?', solution: 'Crystal Wyrm (Glass Desert)' });

// ══════════════════════════════════════════════════════════════════════════════
// v0.9-waveB4 M1 EXPANSION — add 20-30 new steps per tier (pushes Scape's 117
// catalogued steps toward ~400 OSRS parity). The defineClueStep() calls below
// register via the tier Map in treasure-trails.js; generateClue() picks from
// the expanded pool.
// ══════════════════════════════════════════════════════════════════════════════

// ── MEDIUM (20 more → 43 total) ───────────────────────────────────────────

defineClueStep({ id: 'm24', tier: 'medium', type: 'coordinate', description: 'Dig at 70, 140 on the Saltbrine-Heartlands border road.', region: 'Saltbrine' });
defineClueStep({ id: 'm25', tier: 'medium', type: 'riddle', description: 'He records every ship in and out. Where does he work?', solution: 'Harbourmaster Kellen', region: 'Saltbrine' });
defineClueStep({ id: 'm26', tier: 'medium', type: 'emote', description: 'Salute in front of the Sootworks watchtower.', region: 'Sootworks' });
defineClueStep({ id: 'm27', tier: 'medium', type: 'coordinate', description: 'Dig at 155, 92 in the shallow Moryskah marshes.', region: 'Moryskah' });
defineClueStep({ id: 'm28', tier: 'medium', type: 'combat', description: 'Kill a crypt howler (level 66) and search its remains.', combatLevel: 66, region: 'Moryskah' });
defineClueStep({ id: 'm29', tier: 'medium', type: 'riddle', description: 'Crow-faced priest. Preaches in the bone temple.', solution: 'Bone priest', region: 'Moryskah' });
defineClueStep({ id: 'm30', tier: 'medium', type: 'coordinate', description: 'Dig at 185, 160 in the Inkweald clearing with the ink pond.', region: 'Inkweald' });
defineClueStep({ id: 'm31', tier: 'medium', type: 'emote', description: 'Bow at the Glass Desert sunrise obelisk.', region: 'Glass Desert' });
defineClueStep({ id: 'm32', tier: 'medium', type: 'puzzle', description: 'Solve the 4x4 tile slide to unlock the next dig site.' });
defineClueStep({ id: 'm33', tier: 'medium', type: 'coordinate', description: 'Dig at 210, 88 behind the Glass Desert caravanserai.', region: 'Glass Desert' });
defineClueStep({ id: 'm34', tier: 'medium', type: 'riddle', description: 'She sells linen and keeps ledger of who trades what.', solution: 'Weaver Nessa', region: 'Heartlands' });
defineClueStep({ id: 'm35', tier: 'medium', type: 'combat', description: 'Kill a hedge boar (level 28) and search its remains.', combatLevel: 28, region: 'Heartlands' });
defineClueStep({ id: 'm36', tier: 'medium', type: 'emote', description: 'Panic while standing in the Boneyard quicksand zone safely.', region: 'Boneyard' });
defineClueStep({ id: 'm37', tier: 'medium', type: 'coordinate', description: 'Dig at 58, 102 at the Heartlands grain silo.', region: 'Heartlands' });
defineClueStep({ id: 'm38', tier: 'medium', type: 'riddle', description: 'His forge never cools. His son never returned.', solution: 'Forgemaster Brun', region: 'Sootworks' });
defineClueStep({ id: 'm39', tier: 'medium', type: 'combat', description: 'Kill a church gargoyle (level 60) and search its remains.', combatLevel: 60, region: 'Heartlands' });
defineClueStep({ id: 'm40', tier: 'medium', type: 'puzzle', description: 'Align four mirrors to direct light into the keystone slot.' });
defineClueStep({ id: 'm41', tier: 'medium', type: 'coordinate', description: 'Dig at 78, 175 in the Saltbrine salt flats.', region: 'Saltbrine' });
defineClueStep({ id: 'm42', tier: 'medium', type: 'emote', description: 'Cheer at the Moryskah chapel midnight service.', region: 'Moryskah' });
defineClueStep({ id: 'm43', tier: 'medium', type: 'riddle', description: 'Woven from elvish bark. Sells the blue berries that stain.', solution: 'Bregan the Elven Vintner', region: 'Veilwood' });

// ── HARD (25 more → 50 total) ─────────────────────────────────────────────

defineClueStep({ id: 'h26', tier: 'hard', type: 'coordinate', description: 'Dig at 220, 118 in the Sootworks crucible annex.', region: 'Sootworks' });
defineClueStep({ id: 'h27', tier: 'hard', type: 'combat', description: 'Kill a double agent (level 160) on the Saltbrine shipyard.', combatLevel: 160, region: 'Saltbrine' });
defineClueStep({ id: 'h28', tier: 'hard', type: 'emote', description: 'Jig at the Tempoross fishing dock wearing full anglers outfit.', region: 'Saltbrine' });
defineClueStep({ id: 'h29', tier: 'hard', type: 'riddle', description: 'A king buried beneath a pyramid — his name starts the desert.', solution: 'Azhmari', region: 'Boneyard' });
defineClueStep({ id: 'h30', tier: 'hard', type: 'coordinate', description: 'Dig at 210, 140 at the Boneyard pyramid base.', region: 'Boneyard' });
defineClueStep({ id: 'h31', tier: 'hard', type: 'puzzle', description: 'Solve the 5x5 Celtic knot with 4 crossings.' });
defineClueStep({ id: 'h32', tier: 'hard', type: 'combat', description: 'Kill a double agent (level 130) at the Veilwood moonwell.', combatLevel: 130, region: 'Veilwood' });
defineClueStep({ id: 'h33', tier: 'hard', type: 'emote', description: 'Laugh at the Veilmother\'s heartwood while wielding a steel hatchet.', region: 'Veilwood' });
defineClueStep({ id: 'h34', tier: 'hard', type: 'riddle', description: 'It flies, it fishes, it speaks in sonic waves. What?', solution: "Kree'arra" });
defineClueStep({ id: 'h35', tier: 'hard', type: 'coordinate', description: 'Dig at 252, 160 just inside Veldrak\'s domain gate.', region: 'Glass Desert' });
defineClueStep({ id: 'h36', tier: 'hard', type: 'combat', description: 'Kill a double agent (level 145) at the Hollow Choir antechamber.', combatLevel: 145, region: 'Inkweald' });
defineClueStep({ id: 'h37', tier: 'hard', type: 'emote', description: 'Spin at the Sootworks deep vein while holding a dragon warhammer.', region: 'Sootworks' });
defineClueStep({ id: 'h38', tier: 'hard', type: 'puzzle', description: 'Navigate the light-beam maze in the Moryskah crypt.' });
defineClueStep({ id: 'h39', tier: 'hard', type: 'coordinate', description: 'Dig at 12, 195 in the Moryskah far-swamp.', region: 'Moryskah' });
defineClueStep({ id: 'h40', tier: 'hard', type: 'riddle', description: 'Shifts with the tide. Fishermen fear her song.', solution: 'Siren Matriarch', region: 'Saltbrine' });
defineClueStep({ id: 'h41', tier: 'hard', type: 'combat', description: 'Kill a werewolf stalker (level 85) and search its remains.', combatLevel: 85, region: 'Moryskah' });
defineClueStep({ id: 'h42', tier: 'hard', type: 'emote', description: 'Flap at Kree\'arra\'s shrine while wielding an armadyl crossbow.', region: 'Wilds' });
defineClueStep({ id: 'h43', tier: 'hard', type: 'coordinate', description: 'Dig at 150, 82 between the Moryskah chapel and the catacomb entrance.', region: 'Moryskah' });
defineClueStep({ id: 'h44', tier: 'hard', type: 'riddle', description: 'Three rings, three styles, three kings in one cave. Name the kings.', solution: 'Rex, Prime, Supreme', region: 'Saltbrine' });
defineClueStep({ id: 'h45', tier: 'hard', type: 'puzzle', description: 'Decode the Aelgardian rune sentence carved into the dungeon lintel.' });
defineClueStep({ id: 'h46', tier: 'hard', type: 'combat', description: 'Kill a nocturne lord (level 112) and search its remains.', combatLevel: 112, region: 'Moryskah' });
defineClueStep({ id: 'h47', tier: 'hard', type: 'emote', description: 'Cry at the Corporeal Beast cave opening wearing full spirit shield.', region: 'Wilds' });
defineClueStep({ id: 'h48', tier: 'hard', type: 'coordinate', description: 'Dig at 38, 15 at the wilderness rune ruins.', region: 'Wilds' });
defineClueStep({ id: 'h49', tier: 'hard', type: 'riddle', description: 'His twin served the sky. Who served the war god?', solution: 'General Graardor' });
defineClueStep({ id: 'h50', tier: 'hard', type: 'puzzle', description: 'Reassemble the shattered glyph tablet (9 pieces).' });

// ── ELITE (20 more → 43 total) ────────────────────────────────────────────

defineClueStep({ id: 'e24', tier: 'elite', type: 'coordinate', description: 'Dig at 245, 170 deep in the Wilds dragon graveyard.', region: 'Wilds' });
defineClueStep({ id: 'e25', tier: 'elite', type: 'combat', description: 'Kill a double agent (level 210) at the Bryophyta shrine.', combatLevel: 210, region: 'Heartlands' });
defineClueStep({ id: 'e26', tier: 'elite', type: 'emote', description: 'Dance at the ToA pyramid chamber wearing full Masori.', region: 'Boneyard' });
defineClueStep({ id: 'e27', tier: 'elite', type: 'riddle', description: 'He carries four axes that rotate forever. Who is he?', solution: 'Vardorvis', region: 'Sootworks' });
defineClueStep({ id: 'e28', tier: 'elite', type: 'coordinate', description: 'Dig at 258, 70 in the Glass Desert Colosseum arena sands.', region: 'Glass Desert' });
defineClueStep({ id: 'e29', tier: 'elite', type: 'puzzle', description: 'Solve the 6x6 coloured glyph puzzle.' });
defineClueStep({ id: 'e30', tier: 'elite', type: 'combat', description: 'Kill a double agent (level 260) inside the Whisperer dream arena.', combatLevel: 260, region: 'Inkweald' });
defineClueStep({ id: 'e31', tier: 'elite', type: 'emote', description: 'Jump for joy at Nex\'s altar wearing a full Torva set.', region: 'Wilds' });
defineClueStep({ id: 'e32', tier: 'elite', type: 'riddle', description: 'He stomped the duchy and left shockwave scars. Who is he?', solution: 'Duke Sucellus', region: 'Sootworks' });
defineClueStep({ id: 'e33', tier: 'elite', type: 'coordinate', description: 'Dig at 30, 228 in the Inkweald deep chapel.', region: 'Inkweald' });
defineClueStep({ id: 'e34', tier: 'elite', type: 'combat', description: 'Kill a double agent (level 240) at the Crystal Gauntlet entrance.', combatLevel: 240, region: 'Veilwood' });
defineClueStep({ id: 'e35', tier: 'elite', type: 'emote', description: 'Yawn at Tempoross\'s shrine wearing full spirit angler.', region: 'Saltbrine' });
defineClueStep({ id: 'e36', tier: 'elite', type: 'riddle', description: 'Her webs are steel. She wears her children as armour.', solution: 'Sarachnis', region: 'Moryskah' });
defineClueStep({ id: 'e37', tier: 'elite', type: 'coordinate', description: 'Dig at 92, 225 at Skotizo\'s sealed dais.', region: 'Moryskah' });
defineClueStep({ id: 'e38', tier: 'elite', type: 'puzzle', description: 'Light the 7 altars in the order the temple mural depicts.' });
defineClueStep({ id: 'e39', tier: 'elite', type: 'combat', description: 'Kill a double agent (level 275) at the Leviathan\'s harbour.', combatLevel: 275, region: 'Saltbrine' });
defineClueStep({ id: 'e40', tier: 'elite', type: 'emote', description: 'Salute at the Vardorvis forge wearing full Sunfire fanatic.', region: 'Sootworks' });
defineClueStep({ id: 'e41', tier: 'elite', type: 'riddle', description: 'Two rings are BIS for accuracy, one for strength. Name the third.', solution: 'Ultor ring' });
defineClueStep({ id: 'e42', tier: 'elite', type: 'coordinate', description: 'Dig at 180, 12 at the wilderness chaos altar.', region: 'Wilds' });
defineClueStep({ id: 'e43', tier: 'elite', type: 'puzzle', description: 'Reconstruct the glass-sigil mosaic from 16 shards.' });

// ── MASTER (20 more → 50 total) ───────────────────────────────────────────

defineClueStep({ id: 'ms31', tier: 'master', type: 'coordinate', description: 'Dig at the dead-centre of the Colosseum arena on Sol Heredit\'s spawn tile.', region: 'Glass Desert' });
defineClueStep({ id: 'ms32', tier: 'master', type: 'combat', description: 'Kill a double agent (level 380) at the Exodus capstone chamber.', combatLevel: 380 });
defineClueStep({ id: 'ms33', tier: 'master', type: 'emote', description: 'Perform the "raise the roof" emote atop the Worldtree heartwood.', region: 'Veilwood' });
defineClueStep({ id: 'ms34', tier: 'master', type: 'riddle', description: 'She has five phases and four minions. Name the final form.', solution: 'Zaros-phase Nex' });
defineClueStep({ id: 'ms35', tier: 'master', type: 'puzzle', description: 'Solve a 9x9 sliding puzzle under a 30-tick time limit.' });
defineClueStep({ id: 'ms36', tier: 'master', type: 'coordinate', description: 'Dig at 0, 0 — the origin of Aelgard\'s tile grid (Heartlands crossroads).', region: 'Heartlands' });
defineClueStep({ id: 'ms37', tier: 'master', type: 'combat', description: 'Kill a double agent (level 420) at the Rift sovereign\'s throne.', combatLevel: 420, region: 'Inkweald' });
defineClueStep({ id: 'ms38', tier: 'master', type: 'riddle', description: 'Rotates colours. Splits into three. Only one is real.', solution: 'The Refractor' });
defineClueStep({ id: 'ms39', tier: 'master', type: 'emote', description: 'Meditate at Tumeken\'s altar wearing full ToA Masori.', region: 'Boneyard' });
defineClueStep({ id: 'ms40', tier: 'master', type: 'coordinate', description: 'Dig at the exact centre of the Hollow Choir conductor\'s dais.', region: 'Inkweald' });
defineClueStep({ id: 'ms41', tier: 'master', type: 'puzzle', description: 'Play the correct 8-note melody on the choir organ.' });
defineClueStep({ id: 'ms42', tier: 'master', type: 'combat', description: 'Kill a double agent (level 370) at the Nightmare dream theatre.', combatLevel: 370, region: 'Inkweald' });
defineClueStep({ id: 'ms43', tier: 'master', type: 'riddle', description: 'He carries no axe but his arena swings four. Solve.', solution: 'Vardorvis (arena has 4 rotating axes)' });
defineClueStep({ id: 'ms44', tier: 'master', type: 'emote', description: 'Slow-clap at Sol Heredit\'s arena while wearing Dizana\'s quiver.', region: 'Glass Desert' });
defineClueStep({ id: 'ms45', tier: 'master', type: 'coordinate', description: 'Dig at 128, 128 — the exact midpoint of the Aelgard map.' });
defineClueStep({ id: 'ms46', tier: 'master', type: 'puzzle', description: 'Solve the master-tier cryptic crossword (11 across, 9 down).' });
defineClueStep({ id: 'ms47', tier: 'master', type: 'combat', description: 'Kill a double agent (level 395) at the Wilderness Fortress gate.', combatLevel: 395, region: 'Wilds' });
defineClueStep({ id: 'ms48', tier: 'master', type: 'riddle', description: 'Twelve waves of creatures, then a champion. Name the arena.', solution: 'Colosseum (Sol Heredit)' });
defineClueStep({ id: 'ms49', tier: 'master', type: 'emote', description: 'Raise-the-roof atop the Volcanic Depths caldera rim.', region: 'Sootworks' });
defineClueStep({ id: 'ms50', tier: 'master', type: 'coordinate', description: 'Dig at the exact tile Jal-nib-rek (pet) first spawned from Zuk\'s wave.', region: 'Glass Desert' });

// ── MASTER REWARD TABLE ───────────────────────────────────────────────────

defineRewardTable('master', {
  coinRange: [50000, 500000],
  items: [
    { id: 34002, name: '3rd age druidic robe top', weight: 1, min: 1, max: 1 },
    { id: 34003, name: '3rd age druidic robe bottom', weight: 1, min: 1, max: 1 },
    { id: 34004, name: '3rd age druidic cloak', weight: 1, min: 1, max: 1 },
    { id: 34005, name: 'Ring of 3rd age', weight: 1, min: 1, max: 1 },
    { id: 34006, name: 'Gilded scimitar', weight: 2, min: 1, max: 1 },
    { id: 34007, name: 'Gilded platebody', weight: 2, min: 1, max: 1 },
    { id: 34008, name: 'Ankou mask', weight: 3, min: 1, max: 1 },
    { id: 34009, name: 'Mummy head', weight: 3, min: 1, max: 1 },
    { id: 34010, name: 'Samurai top', weight: 2, min: 1, max: 1 },
    { id: 23030, name: 'Third-age platebody', weight: 1, min: 1, max: 1 },
    { id: 12505, name: 'Uncut dragonstone', weight: 5, min: 2, max: 5 },
    { id: 11358, name: 'Blood rune', weight: 5, min: 100, max: 500 },
    { id: 11363, name: 'Soul rune', weight: 3, min: 50, max: 200 },
    { id: 25003, name: 'Dragon bolts (e)', weight: 4, min: 100, max: 300 },
  ],
});

const totalNewSteps = 10 + 15 + 15 + 15 + 30; // beginner + medium + hard + elite + master (original expansion)
const waveB4NewSteps = 20 + 25 + 20 + 20; // M1: medium+hard+elite+master additions
console.log(`[aelgard] Clue scroll expansion: ${totalNewSteps + waveB4NewSteps} new steps (${waveB4NewSteps} added in waveB4 M1 sweep) + master tier with rewards`);
