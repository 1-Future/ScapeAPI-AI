// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — World Layout
// Tile terrain, named areas, NPC/monster/resource spawns for all 8 regions.
//
// World map overview (each region ~60x60 tiles):
//
//   Y=0  ┌─────────────────────────────────────────────────┐
//        │                  THE WILDS (PvP)                  │
//   Y=60 ├──────────┬──────────┬──────────┬─────────────────┤
//        │ VEILWOOD │HEARTLANDS│ SOOTWORKS│                  │
//        │ (forest) │ (starter)│(undergnd)│  GLASS DESERT    │
//   Y=120├──────────┼──────────┼──────────┤  (endgame)       │
//        │ SALTBRINE│ BONEYARD │ MORYSKAH │                  │
//        │ (coast)  │ (desert) │ (swamp)  │                  │
//   Y=180├──────────┴──────────┴──────────┴─────────────────┤
//        │                  THE INKWEALD                      │
//   Y=240└───────────────────────────────────────────────────┘
//        X=0      X=60     X=120     X=180              X=240
//
// Heartlands center: (100, 90) — matches existing town
// ══════════════════════════════════════════════════════════════════════════════

const tiles = require('../../world/tiles');
const objects = require('../../world/objects');
const npcsModule = require('../../world/npcs');

const T = tiles.T;

function fillArea(x1, y1, x2, y2, tileType) {
  for (let x = x1; x <= x2; x++) for (let y = y1; y <= y2; y++) tiles.setTile(x, y, tileType);
}

function spawnWorld() {
  // ════════════════════════════════════════════════════════════════════════
  // REGION: BONEYARD WASTES (x: 90-150, y: 120-180) — desert south of Heartlands
  // ════════════════════════════════════════════════════════════════════════

  // Desert terrain
  fillArea(90, 145, 150, 180, T.SAND);
  // Oasis
  fillArea(110, 155, 115, 160, T.WATER);
  fillArea(108, 153, 117, 162, T.SAND); // Sand around oasis
  tiles.setTile(116, 157, T.GRASS); // Oasis grass

  tiles.defineArea('boneyard_wastes', { name: 'Boneyard Wastes', x1: 90, y1: 145, x2: 150, y2: 180, safe: false });
  tiles.defineArea('boneyard_oasis', { name: 'Boneyard Oasis', x1: 108, y1: 153, x2: 117, y2: 162, safe: true });

  // Nomad camp at oasis
  fillArea(118, 155, 122, 159, T.FLOOR);
  npcsModule.spawnNpc('nomad_trader_razak', 120, 157);
  npcsModule.spawnNpc('archaeologist_veris', 119, 155);
  npcsModule.spawnNpc('hermit_old_sun', 122, 158);

  // Monsters — scattered across the wastes
  npcsModule.spawnNpc('sand_crab', 95, 150); npcsModule.spawnNpc('sand_crab', 100, 152);
  npcsModule.spawnNpc('sand_crab', 105, 148); npcsModule.spawnNpc('sand_crab', 110, 150);
  npcsModule.spawnNpc('desert_wolf', 98, 160); npcsModule.spawnNpc('desert_wolf', 104, 165);
  npcsModule.spawnNpc('skeleton', 130, 155); npcsModule.spawnNpc('skeleton', 132, 158);
  npcsModule.spawnNpc('skeleton', 135, 153); npcsModule.spawnNpc('skeleton_mage', 133, 160);
  npcsModule.spawnNpc('giant_scarab', 100, 170); npcsModule.spawnNpc('giant_scarab', 105, 172);
  npcsModule.spawnNpc('dust_devil', 140, 165); npcsModule.spawnNpc('dust_devil', 142, 168);
  npcsModule.spawnNpc('mummy', 145, 175); npcsModule.spawnNpc('mummy', 148, 178);
  npcsModule.spawnNpc('bone_crawler', 125, 170); npcsModule.spawnNpc('bone_crawler', 128, 173);

  // Bosses
  npcsModule.spawnNpc('azhmari', 140, 178);
  npcsModule.spawnNpc('bog_hydra', 92, 175);

  // ════════════════════════════════════════════════════════════════════════
  // REGION: MORYSKAH (x: 150-210, y: 120-180) — gothic swamp east
  // ════════════════════════════════════════════════════════════════════════

  fillArea(150, 120, 210, 180, T.SWAMP);
  // Paths through swamp
  fillArea(155, 130, 155, 170, T.PATH); // Main north-south path
  fillArea(155, 140, 190, 140, T.PATH); // East-west crossroad
  // Village clearing
  fillArea(170, 135, 185, 145, T.FLOOR);
  // Slayer tower
  fillArea(195, 125, 205, 135, T.FLOOR);
  // Castle Malachar
  fillArea(190, 165, 205, 178, T.FLOOR);
  fillArea(190, 165, 205, 165, T.WALL); // Castle north wall
  fillArea(190, 178, 205, 178, T.WALL); // Castle south wall

  tiles.defineArea('moryskah', { name: 'Moryskah', x1: 150, y1: 120, x2: 210, y2: 180, safe: false });
  tiles.defineArea('moryskah_village', { name: 'Moryskah Village', x1: 170, y1: 135, x2: 185, y2: 145, safe: true });
  tiles.defineArea('slayer_tower', { name: 'Slayer Tower', x1: 195, y1: 125, x2: 205, y2: 135, safe: false, multicombat: true });
  tiles.defineArea('castle_malachar', { name: 'Castle Malachar', x1: 190, y1: 165, x2: 205, y2: 178, safe: false });

  // Village NPCs
  npcsModule.spawnNpc('father_dorin', 172, 138);
  npcsModule.spawnNpc('apothecary_nira', 175, 140);
  npcsModule.spawnNpc('slayer_master_varrek', 198, 128);
  objects.placeObject('bank_booth', 180, 138);
  npcsModule.spawnNpc('bog_witch_grael', 160, 170); // Deep swamp

  // Monsters
  npcsModule.spawnNpc('ghast', 158, 150); npcsModule.spawnNpc('ghast', 162, 155);
  npcsModule.spawnNpc('ghast', 155, 160); npcsModule.spawnNpc('ghast', 165, 148);
  npcsModule.spawnNpc('banshee', 198, 127); npcsModule.spawnNpc('banshee', 200, 130);
  npcsModule.spawnNpc('crawling_hand', 196, 126); npcsModule.spawnNpc('crawling_hand', 202, 128);
  npcsModule.spawnNpc('vampyre_juvenile', 188, 155); npcsModule.spawnNpc('vampyre_juvenile', 192, 158);
  npcsModule.spawnNpc('vampyre_noble', 195, 170);
  npcsModule.spawnNpc('werewolf', 170, 160); npcsModule.spawnNpc('werewolf', 175, 165);
  npcsModule.spawnNpc('werewolf_alpha', 168, 168);
  npcsModule.spawnNpc('aberrant_spectre', 200, 132); npcsModule.spawnNpc('aberrant_spectre', 203, 134);
  npcsModule.spawnNpc('revenant_imp', 180, 170);

  // Boss
  npcsModule.spawnNpc('count_malachar', 198, 172);

  // ════════════════════════════════════════════════════════════════════════
  // REGION: VEILWOOD (x: 30-90, y: 60-120) — enchanted forest west
  // ════════════════════════════════════════════════════════════════════════

  fillArea(30, 60, 90, 120, T.DARK_GRASS);
  // Dense tree cover
  for (let x = 32; x < 88; x += 4) for (let y = 62; y < 118; y += 5) {
    if (Math.random() < 0.6) tiles.setTile(x, y, T.TREE);
  }
  // Elven clearing
  fillArea(55, 80, 70, 95, T.GRASS);
  fillArea(58, 83, 67, 92, T.FLOOR); // Elven village
  // Sacred grove
  fillArea(40, 100, 50, 110, T.GRASS);

  tiles.defineArea('veilwood', { name: 'Veilwood', x1: 30, y1: 60, x2: 90, y2: 120, safe: false });
  tiles.defineArea('elven_village', { name: 'Elven Village', x1: 58, y1: 83, x2: 67, y2: 92, safe: true });
  tiles.defineArea('sacred_grove', { name: 'Sacred Grove', x1: 40, y1: 100, x2: 50, y2: 110, safe: false });

  // NPCs
  npcsModule.spawnNpc('elven_ranger_lyris', 60, 85);
  npcsModule.spawnNpc('elven_fletcher_tarin', 63, 88);
  objects.placeObject('bank_booth', 65, 86);

  // Trees for woodcutting
  objects.placeObject('oak', 50, 75); objects.placeObject('oak', 52, 78);
  objects.placeObject('willow', 45, 85); objects.placeObject('willow', 47, 88);
  objects.placeObject('maple', 42, 95); objects.placeObject('maple', 44, 98);
  objects.placeObject('yew', 38, 105); objects.placeObject('yew', 40, 108);

  // Monsters
  npcsModule.spawnNpc('moss_sprite', 50, 70); npcsModule.spawnNpc('moss_sprite', 55, 72);
  npcsModule.spawnNpc('timber_wolf', 65, 68); npcsModule.spawnNpc('timber_wolf', 70, 72);
  npcsModule.spawnNpc('ent', 48, 90); npcsModule.spawnNpc('ent', 45, 95);
  npcsModule.spawnNpc('unicorn', 60, 100); npcsModule.spawnNpc('unicorn', 65, 105);
  npcsModule.spawnNpc('fungal_mage', 38, 108); npcsModule.spawnNpc('fungal_mage', 42, 112);
  npcsModule.spawnNpc('shadow_panther', 35, 75); npcsModule.spawnNpc('shadow_panther', 38, 80);
  npcsModule.spawnNpc('elder_druid', 44, 105);

  // Boss
  npcsModule.spawnNpc('the_veilmother', 42, 108);

  // ════════════════════════════════════════════════════════════════════════
  // REGION: SOOTWORKS (x: 150-210, y: 60-120) — underground east
  // ════════════════════════════════════════════════════════════════════════

  fillArea(150, 60, 210, 120, T.ROCK);
  // Tunnels (carved paths through rock)
  fillArea(155, 80, 205, 80, T.FLOOR); // Main east-west tunnel
  fillArea(180, 65, 180, 115, T.FLOOR); // Main north-south tunnel
  // Forge hall
  fillArea(165, 75, 195, 85, T.FLOOR);
  // Mine shafts
  fillArea(155, 95, 170, 110, T.FLOOR);
  // Deep vein (boss area)
  fillArea(195, 100, 208, 115, T.FLOOR);

  tiles.defineArea('sootworks', { name: 'The Sootworks', x1: 150, y1: 60, x2: 210, y2: 120, safe: false });
  tiles.defineArea('sootworks_forge', { name: 'Sootworks Forge Hall', x1: 165, y1: 75, x2: 195, y2: 85, safe: true });
  tiles.defineArea('deep_vein', { name: 'The Deep Vein', x1: 195, y1: 100, x2: 208, y2: 115, safe: false, multicombat: true });

  // NPCs
  npcsModule.spawnNpc('forgemaster_brun', 175, 80);
  npcsModule.spawnNpc('dwarven_smith_hald', 180, 78);
  npcsModule.spawnNpc('gnome_engineer_fizz', 185, 82);
  objects.placeObject('bank_booth', 170, 80);
  objects.placeObject('furnace', 178, 76); objects.placeObject('furnace', 182, 76);
  objects.placeObject('anvil', 178, 84); objects.placeObject('anvil', 182, 84);

  // Mining nodes
  objects.placeObject('coal_rock', 158, 98); objects.placeObject('coal_rock', 160, 100);
  objects.placeObject('coal_rock', 162, 102); objects.placeObject('coal_rock', 164, 98);
  objects.placeObject('iron_rock', 156, 105); objects.placeObject('iron_rock', 158, 107);
  objects.placeObject('mithril_rock', 165, 108); objects.placeObject('mithril_rock', 167, 106);

  // Monsters
  npcsModule.spawnNpc('mine_spider', 160, 95); npcsModule.spawnNpc('mine_spider', 163, 98);
  npcsModule.spawnNpc('rock_golem', 168, 105); npcsModule.spawnNpc('rock_golem', 170, 108);
  npcsModule.spawnNpc('clockwork_sentry', 188, 90); npcsModule.spawnNpc('clockwork_sentry', 192, 88);
  npcsModule.spawnNpc('lava_beast', 200, 105); npcsModule.spawnNpc('lava_beast', 203, 108);
  npcsModule.spawnNpc('rogue_automaton', 198, 110); npcsModule.spawnNpc('rogue_automaton', 205, 112);

  // Bosses
  npcsModule.spawnNpc('vorath', 202, 108);
  npcsModule.spawnNpc('the_soot_king', 200, 114);

  // ════════════════════════════════════════════════════════════════════════
  // REGION: SALTBRINE REACH (x: 30-90, y: 120-180) — coast southwest
  // ════════════════════════════════════════════════════════════════════════

  fillArea(30, 120, 90, 180, T.SAND);
  // Ocean
  fillArea(30, 165, 90, 180, T.WATER);
  // Harbour
  fillArea(50, 155, 70, 164, T.FLOOR);
  // Beach
  fillArea(30, 160, 90, 164, T.SAND);
  // Pirate cove
  fillArea(75, 145, 88, 158, T.FLOOR);

  tiles.defineArea('saltbrine', { name: 'Saltbrine Reach', x1: 30, y1: 120, x2: 90, y2: 180, safe: false });
  tiles.defineArea('saltbrine_harbour', { name: 'Saltbrine Harbour', x1: 50, y1: 155, x2: 70, y2: 164, safe: true });
  tiles.defineArea('pirate_cove', { name: 'Pirate Cove', x1: 75, y1: 145, x2: 88, y2: 158, safe: false });

  // NPCs
  npcsModule.spawnNpc('harbourmaster_cole', 55, 158);
  npcsModule.spawnNpc('fishmonger_mara', 60, 160);
  objects.placeObject('bank_booth', 58, 156);

  // Fishing spots along coast
  objects.placeObject('fishing_spot', 45, 164); objects.placeObject('fishing_spot', 50, 164);
  objects.placeObject('fly_fishing_spot', 55, 164); objects.placeObject('fly_fishing_spot', 60, 164);
  objects.placeObject('cage_fishing_spot', 65, 164); objects.placeObject('cage_fishing_spot', 70, 164);

  // Range for cooking
  objects.placeObject('range', 62, 158);

  // Monsters
  npcsModule.spawnNpc('seagull', 52, 162); npcsModule.spawnNpc('seagull', 58, 163);
  npcsModule.spawnNpc('rock_crab_coastal', 40, 160); npcsModule.spawnNpc('rock_crab_coastal', 42, 162);
  npcsModule.spawnNpc('rock_crab_coastal', 44, 161); npcsModule.spawnNpc('rock_crab_coastal', 46, 163);
  npcsModule.spawnNpc('pirate', 78, 148); npcsModule.spawnNpc('pirate', 80, 150);
  npcsModule.spawnNpc('pirate', 82, 152); npcsModule.spawnNpc('pirate_captain', 85, 150);
  npcsModule.spawnNpc('sea_snake', 35, 158); npcsModule.spawnNpc('sea_snake', 38, 160);
  npcsModule.spawnNpc('lobstrosity', 72, 162); npcsModule.spawnNpc('lobstrosity', 75, 160);
  npcsModule.spawnNpc('siren', 48, 170); npcsModule.spawnNpc('siren', 55, 172);

  // Boss
  npcsModule.spawnNpc('kraken_saltbrine', 60, 175);

  // ════════════════════════════════════════════════════════════════════════
  // REGION: INKWEALD (x: 60-180, y: 190-240) — dream forest south
  // ════════════════════════════════════════════════════════════════════════

  fillArea(60, 190, 180, 240, T.DARK_GRASS);
  // Surreal terrain patches
  for (let x = 65; x < 175; x += 8) for (let y = 195; y < 235; y += 8) {
    const r = Math.random();
    if (r < 0.2) tiles.setTile(x, y, T.FLOWER);
    else if (r < 0.35) tiles.setTile(x, y, T.BUSH);
  }
  // Boundary camp
  fillArea(90, 192, 105, 200, T.FLOOR);
  // Deep Inkweald — raid zone
  fillArea(120, 220, 145, 238, T.FLOOR);

  tiles.defineArea('inkweald', { name: 'The Inkweald', x1: 60, y1: 190, x2: 180, y2: 240, safe: false });
  tiles.defineArea('inkweald_boundary', { name: 'Inkweald Boundary Camp', x1: 90, y1: 192, x2: 105, y2: 200, safe: true });
  tiles.defineArea('resonance_chamber', { name: 'The Resonance Chamber', x1: 120, y1: 220, x2: 145, y2: 238, safe: false, multicombat: true });

  // NPCs
  npcsModule.spawnNpc('lucid_keeper_yara', 95, 195);
  objects.placeObject('bank_booth', 100, 195);

  // Monsters
  npcsModule.spawnNpc('dream_wisp', 100, 210); npcsModule.spawnNpc('dream_wisp', 110, 208);
  npcsModule.spawnNpc('dream_wisp', 120, 212);
  npcsModule.spawnNpc('thought_stalker', 80, 215); npcsModule.spawnNpc('thought_stalker', 85, 220);
  npcsModule.spawnNpc('mirror_golem', 130, 210); npcsModule.spawnNpc('mirror_golem', 140, 215);
  npcsModule.spawnNpc('ink_horror', 150, 225); npcsModule.spawnNpc('ink_horror', 155, 228);
  npcsModule.spawnNpc('sleepwalker', 110, 220); npcsModule.spawnNpc('sleepwalker', 115, 225);

  // Bosses
  npcsModule.spawnNpc('inkweald_muse', 135, 225);
  npcsModule.spawnNpc('hollow_choir_conductor', 132, 232);

  // ════════════════════════════════════════════════════════════════════════
  // REGION: GLASS DESERT (x: 210-270, y: 60-180) — endgame east
  // ════════════════════════════════════════════════════════════════════════

  fillArea(210, 60, 270, 180, T.SAND);
  // Crystal formations (unwalkable)
  for (let x = 215; x < 265; x += 6) for (let y = 65; y < 175; y += 8) {
    if (Math.random() < 0.3) tiles.setTile(x, y, T.ROCK);
  }
  // Crystal Wyrm arena (existing Crystal Caverns area gets expanded)
  fillArea(240, 100, 260, 120, T.FLOOR);
  // Glass Tyrant arena
  fillArea(230, 140, 250, 160, T.FLOOR);
  // Veldrak arena (massive)
  fillArea(215, 70, 245, 95, T.FLOOR);
  // Outpost
  fillArea(215, 125, 225, 135, T.FLOOR);

  tiles.defineArea('glass_desert', { name: 'The Glass Desert', x1: 210, y1: 60, x2: 270, y2: 180, safe: false });
  tiles.defineArea('glass_outpost', { name: 'Glass Desert Outpost', x1: 215, y1: 125, x2: 225, y2: 135, safe: true });
  tiles.defineArea('glass_tyrant_arena', { name: 'Glass Tyrant Arena', x1: 230, y1: 140, x2: 250, y2: 160, safe: false, multicombat: true });
  tiles.defineArea('veldrak_arena', { name: "Veldrak's Domain", x1: 215, y1: 70, x2: 245, y2: 95, safe: false, multicombat: true });

  // NPCs
  npcsModule.spawnNpc('crystal_sage_orin', 218, 128);
  npcsModule.spawnNpc('crystal_merchant_zel', 222, 130);
  objects.placeObject('bank_booth', 220, 132);

  // Crystal mining nodes
  for (let i = 0; i < 6; i++) {
    const x = 225 + Math.floor(Math.random() * 20);
    const y = 110 + Math.floor(Math.random() * 20);
    tiles.setTile(x, y, T.ROCK);
  }

  // Monsters
  npcsModule.spawnNpc('glass_spider', 220, 105); npcsModule.spawnNpc('glass_spider', 225, 108);
  npcsModule.spawnNpc('glass_spider', 230, 103);
  npcsModule.spawnNpc('prism_wizard', 240, 110); npcsModule.spawnNpc('prism_wizard', 245, 115);
  npcsModule.spawnNpc('glass_golem', 250, 130); npcsModule.spawnNpc('glass_golem', 255, 135);
  npcsModule.spawnNpc('crystal_bat', 235, 95); npcsModule.spawnNpc('crystal_bat', 240, 90);
  npcsModule.spawnNpc('refracted_elemental', 248, 145); npcsModule.spawnNpc('refracted_elemental', 252, 148);

  // Bosses
  npcsModule.spawnNpc('the_glass_tyrant', 240, 150);
  npcsModule.spawnNpc('veldrak', 230, 82);

  // ════════════════════════════════════════════════════════════════════════
  // REGION: THE WILDS (x: 60-210, y: 0-55) — PvP wilderness north
  // ════════════════════════════════════════════════════════════════════════

  fillArea(60, 0, 210, 55, T.DARK_GRASS);
  // Ruins
  fillArea(120, 20, 140, 35, T.FLOOR);
  // Lava pit
  fillArea(150, 10, 165, 25, T.LAVA);

  tiles.defineArea('the_wilds', { name: 'The Wilds', x1: 60, y1: 0, x2: 210, y2: 55, safe: false, pvp: true });
  tiles.defineArea('wilds_ruins', { name: 'Abandoned Ruins', x1: 120, y1: 20, x2: 140, y2: 35, safe: false, pvp: true, multicombat: true });

  // Warning signs at border
  objects.placeObject('warning_sign', 100, 58);
  objects.placeObject('warning_sign', 140, 58);
  objects.placeObject('warning_sign', 180, 58);

  // ════════════════════════════════════════════════════════════════════════
  // REGION CONNECTIONS — paths between regions
  // ════════════════════════════════════════════════════════════════════════

  // Heartlands → Boneyard Wastes (south road continues)
  fillArea(99, 130, 101, 145, T.PATH);

  // Heartlands → Veilwood (west road)
  fillArea(60, 89, 90, 91, T.PATH);

  // Heartlands → Sootworks (east road through hills)
  fillArea(120, 89, 150, 91, T.PATH);

  // Heartlands → Wilds (north road)
  fillArea(99, 55, 101, 65, T.PATH);

  // Boneyard → Moryskah (east)
  fillArea(148, 150, 152, 152, T.PATH);

  // Veilwood → Saltbrine (south along coast)
  fillArea(59, 118, 61, 122, T.PATH);

  // Moryskah → Inkweald (south)
  fillArea(168, 178, 170, 192, T.PATH);

  // Sootworks → Glass Desert (east)
  fillArea(208, 89, 212, 91, T.PATH);

  console.log('[aelgard] World layout spawned — 8 regions + wilds + connections');
}

module.exports = { spawnWorld };
