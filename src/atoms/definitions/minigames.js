// ══════════════════════════════════════════════════════════════════════════════
// MINIGAMES: Every major minigame as a mechanic config
// ══════════════════════════════════════════════════════════════════════════════

const { define } = require('../mechanic');

const MINIGAMES = [
  { id: 'mini-pest-control',   name: 'Pest Control',         type: 'combat',    roundTicks: 333, players: '5-25', rewards: ['void_knight_equipment'] },
  { id: 'mini-barb-assault',   name: 'Barbarian Assault',    type: 'teamwork',  roundTicks: 500, players: '5',    rewards: ['fighter_torso', 'penance_queen'] },
  { id: 'mini-castle-wars',    name: 'Castle Wars',          type: 'pvp',       roundTicks: 1200,players: '5-100',rewards: ['decorative_armour', 'halo'] },
  { id: 'mini-soul-wars',      name: 'Soul Wars',            type: 'pvp',       roundTicks: 800, players: '10-60',rewards: ['soul_cape', 'pet_midnight'] },
  { id: 'mini-lms',            name: 'Last Man Standing',    type: 'pvp',       roundTicks: 600, players: '24',   rewards: ['halos', 'ornament_kits'] },
  { id: 'mini-fight-caves',    name: 'Fight Caves',          type: 'wave',      roundTicks: 0,   players: '1',    rewards: ['fire_cape'] },
  { id: 'mini-inferno',        name: 'The Inferno',          type: 'wave',      roundTicks: 0,   players: '1',    rewards: ['infernal_cape'] },
  { id: 'mini-gauntlet',       name: 'The Gauntlet',         type: 'solo',      roundTicks: 600, players: '1',    rewards: ['crystal_armour_seed', 'blade_of_saeldor'] },
  { id: 'mini-cg',             name: 'Corrupted Gauntlet',   type: 'solo',      roundTicks: 600, players: '1',    rewards: ['enhanced_crystal_weapon_seed'] },
  { id: 'mini-colosseum',      name: 'Fortis Colosseum',     type: 'wave',      roundTicks: 0,   players: '1',    rewards: ['dizanas_quiver', 'sunfire_splinters'] },
  { id: 'mini-gotr',           name: 'Guardians of the Rift',type: 'skilling',  roundTicks: 400, players: '1-200',rewards: ['outfit', 'abyssal_lantern', 'needle'] },
  { id: 'mini-wintertodt',     name: 'Wintertodt',           type: 'skilling',  roundTicks: 500, players: '1-200',rewards: ['pyromancer_outfit', 'phoenix_pet'] },
  { id: 'mini-tempoross',      name: 'Tempoross',            type: 'skilling',  roundTicks: 400, players: '1-200',rewards: ['fishing_outfit', 'tiny_tempor'] },
  { id: 'mini-hallowed-sep',   name: 'Hallowed Sepulchre',   type: 'agility',   roundTicks: 300, players: '1',    rewards: ['hallowed_equipment', 'ring_of_endurance'] },
  { id: 'mini-volcanic-mine',  name: 'Volcanic Mine',        type: 'skilling',  roundTicks: 250, players: '1-50', rewards: ['mining_xp'] },
  { id: 'mini-tithe-farm',     name: 'Tithe Farm',           type: 'skilling',  roundTicks: 0,   players: '1',    rewards: ['farmer_outfit', 'seed_box'] },
  { id: 'mini-mahogany-homes', name: 'Mahogany Homes',       type: 'skilling',  roundTicks: 0,   players: '1',    rewards: ['construction_outfit'] },
  { id: 'mini-trouble-brewing',name: 'Trouble Brewing',      type: 'team',      roundTicks: 1200,players: '2-10', rewards: ['pieces_of_eight'] },
  { id: 'mini-nightmare-zone', name: 'Nightmare Zone',       type: 'combat',    roundTicks: 0,   players: '1',    rewards: ['imbued_rings', 'herb_boxes'] },
  { id: 'mini-warriors-guild', name: "Warriors' Guild",      type: 'combat',    roundTicks: 0,   players: '1',    rewards: ['defenders'] },
  { id: 'mini-mage-training',  name: 'Mage Training Arena',  type: 'skilling',  roundTicks: 0,   players: '1',    rewards: ['infinity_robes', 'bones_to_peaches'] },
  { id: 'mini-rogues-den',     name: "Rogues' Den",          type: 'agility',   roundTicks: 0,   players: '1',    rewards: ['rogues_outfit'] },
  { id: 'mini-brimhaven-agil', name: 'Brimhaven Agility',    type: 'agility',   roundTicks: 0,   players: '1',    rewards: ['graceful_recolor'] },
  { id: 'mini-raids-cox',      name: 'Chambers of Xeric',    type: 'raid',      roundTicks: 0,   players: '1-100',rewards: ['twisted_bow', 'elder_maul', 'kodai_wand'] },
  { id: 'mini-raids-tob',      name: 'Theatre of Blood',     type: 'raid',      roundTicks: 0,   players: '2-5', rewards: ['scythe_of_vitur', 'ghrazi_rapier', 'avernic_defender'] },
  { id: 'mini-raids-toa',      name: 'Tombs of Amascut',     type: 'raid',      roundTicks: 0,   players: '1-8', rewards: ['tumekens_shadow', 'masori_armour', 'osmumtens_fang'] },
  { id: 'mini-shooting-stars', name: 'Shooting Stars',       type: 'skilling',  roundTicks: 0,   players: '1+',  rewards: ['star_fragments', 'celestial_ring'] },
  { id: 'mini-gnome-restaurant',name:'Gnome Restaurant',     type: 'skilling',  roundTicks: 0,   players: '1',    rewards: ['gnome_scarf', 'mint_cake'] },
];

for (const m of MINIGAMES) {
  define({
    id: m.id, name: m.name, type: 'minigame',
    atoms: {
      ...(m.roundTicks > 0 ? { round: { activeTicks: m.roundTicks } } : {}),
      ...(m.type === 'wave' ? { waveSpawn: { waves: [] } } : {}),
      ...(m.type === 'combat' || m.type === 'pvp' ? { hitCheck: { maxHit: 0, style: 'melee' } } : {}),
      ...(m.type === 'skilling' ? { periodicAction: { interval: 4, successRate: 0.9 } } : {}),
      lootDrop: { table: m.rewards.map(r => ({ name: r, weight: 1, min: 1, max: 1 })) },
      xpDrop: { skills: {} },
    },
    config: { players: m.players, minigameType: m.type, rewards: m.rewards }
  });
}

console.log(`[defs] Minigames: ${MINIGAMES.length} minigames`);
