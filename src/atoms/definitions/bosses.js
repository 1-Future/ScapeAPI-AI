// ══════════════════════════════════════════════════════════════════════════════
// BOSS DEFINITIONS: Major bosses with phase configs
// ══════════════════════════════════════════════════════════════════════════════

const { define } = require('../mechanic');

const BOSSES = [
  // GWD
  { id: 'boss-general-graardor', name: 'General Graardor', combat: 624, hp: 255, maxHit: 60, speed: 6, style: 'melee', def: 250, phases: [] },
  { id: 'boss-kreearra',        name: "Kree'arra",        combat: 580, hp: 255, maxHit: 71, speed: 4, style: 'ranged', def: 200, phases: [] },
  { id: 'boss-zilyana',         name: 'Commander Zilyana',combat: 596, hp: 255, maxHit: 31, speed: 2, style: 'melee', def: 180, phases: [] },
  { id: 'boss-kril',            name: "K'ril Tsutsaroth", combat: 650, hp: 255, maxHit: 49, speed: 6, style: 'melee', def: 230, phases: [] },
  { id: 'boss-nex',             name: 'Nex',              combat: 1001,hp: 3400,maxHit: 60, speed: 4, style: 'magic', def: 250, phases: ['smoke','shadow','blood','ice','zaros'] },

  // Slayer bosses
  { id: 'boss-cerberus',        name: 'Cerberus',         combat: 318, hp: 600, maxHit: 23, speed: 4, style: 'melee', def: 110, phases: ['ghosts'] },
  { id: 'boss-abyssal-sire',    name: 'Abyssal Sire',     combat: 350, hp: 400, maxHit: 32, speed: 5, style: 'magic', def: 150, phases: ['awake','stunned','spawns','final'] },
  { id: 'boss-kraken',          name: 'Kraken',           combat: 291, hp: 255, maxHit: 28, speed: 4, style: 'magic', def: 80,  phases: [] },
  { id: 'boss-thermonuclear',   name: 'Thermonuclear Smoke Devil', combat: 301, hp: 240, maxHit: 22, speed: 4, style: 'magic', def: 110, phases: [] },
  { id: 'boss-grotesque-guard', name: 'Grotesque Guardians', combat: 328, hp: 450, maxHit: 25, speed: 4, style: 'melee', def: 220, phases: ['dusk','dawn','combined'] },
  { id: 'boss-alchemical-hydra',name: 'Alchemical Hydra', combat: 426, hp: 1100,maxHit: 26, speed: 5, style: 'ranged', def: 180, phases: ['green','blue','red','grey'] },

  // Solo bosses
  { id: 'boss-zulrah',          name: 'Zulrah',           combat: 725, hp: 500, maxHit: 41, speed: 4, style: 'magic', def: 300, phases: ['green_mage','blue_range','red_melee','jad'] },
  { id: 'boss-vorkath',         name: 'Vorkath',          combat: 732, hp: 750, maxHit: 32, speed: 5, style: 'magic', def: 214, phases: ['normal','zombified_spawn','acid'] },
  { id: 'boss-galvek',          name: 'Galvek',           combat: 608, hp: 1200,maxHit: 50, speed: 6, style: 'magic', def: 200, phases: ['fire','air','water','earth'] },
  { id: 'boss-jad',             name: 'TzTok-Jad',        combat: 702, hp: 250, maxHit: 97, speed: 8, style: 'magic', def: 480, phases: ['jad','healers'] },
  { id: 'boss-zuk',             name: 'TzKal-Zuk',        combat: 1400,hp: 1200,maxHit: 251,speed: 10,style: 'magic', def: 234, phases: ['shield','sets','jads','enrage'] },
  { id: 'boss-nightmare',       name: 'The Nightmare',    combat: 814, hp: 2400,maxHit: 50, speed: 6, style: 'magic', def: 200, phases: ['normal','totems','sleepwalkers','parasite'] },
  { id: 'boss-phantom-muspah',  name: 'Phantom Muspah',  combat: 436, hp: 1000,maxHit: 30, speed: 4, style: 'magic', def: 150, phases: ['melee','ranged','shield'] },
  { id: 'boss-duke-sucellus',   name: 'Duke Sucellus',    combat: 628, hp: 800, maxHit: 25, speed: 4, style: 'magic', def: 180, phases: ['awake','mushroom','enraged'] },
  { id: 'boss-vardorvis',       name: 'Vardorvis',        combat: 578, hp: 700, maxHit: 30, speed: 4, style: 'melee', def: 215, phases: ['normal','axes','strangled'] },
  { id: 'boss-leviathan',       name: 'The Leviathan',    combat: 612, hp: 800, maxHit: 35, speed: 5, style: 'magic', def: 190, phases: ['normal','boulders','shadow'] },
  { id: 'boss-whisperer',       name: 'The Whisperer',    combat: 596, hp: 850, maxHit: 28, speed: 4, style: 'magic', def: 210, phases: ['normal','tentacles','screams'] },
  { id: 'boss-corp',            name: 'Corporeal Beast',  combat: 785, hp: 2000,maxHit: 51, speed: 5, style: 'magic', def: 310, phases: ['dark_core'] },

  // Wilderness
  { id: 'boss-callisto',        name: 'Callisto',         combat: 470, hp: 255, maxHit: 60, speed: 5, style: 'melee', def: 250, phases: [] },
  { id: 'boss-vetion',          name: "Vet'ion",          combat: 454, hp: 255, maxHit: 50, speed: 5, style: 'melee', def: 395, phases: ['orange','purple'] },
  { id: 'boss-venenatis',       name: 'Venenatis',        combat: 464, hp: 255, maxHit: 50, speed: 4, style: 'magic', def: 200, phases: [] },
  { id: 'boss-chaos-elemental', name: 'Chaos Elemental',  combat: 305, hp: 250, maxHit: 28, speed: 4, style: 'magic', def: 100, phases: [] },
  { id: 'boss-scorpia',         name: 'Scorpia',          combat: 225, hp: 200, maxHit: 16, speed: 4, style: 'melee', def: 180, phases: ['guardians'] },
  { id: 'boss-chaos-fanatic',   name: 'Chaos Fanatic',    combat: 202, hp: 225, maxHit: 32, speed: 4, style: 'magic', def: 50,  phases: [] },
  { id: 'boss-crazy-archaeo',   name: 'Crazy Archaeologist',combat: 204, hp: 225, maxHit: 30, speed: 5, style: 'ranged', def: 20, phases: [] },
  { id: 'boss-king-black-drag', name: 'King Black Dragon', combat: 276, hp: 255, maxHit: 25, speed: 4, style: 'melee', def: 120, phases: [] },

  // Raids bosses (simplified)
  { id: 'boss-great-olm',       name: 'Great Olm',        combat: 1043,hp: 1500,maxHit: 30, speed: 4, style: 'magic', def: 175, phases: ['head','left_hand','right_hand','final'] },
  { id: 'boss-verzik',          name: 'Verzik Vitur',     combat: 1040,hp: 2600,maxHit: 78, speed: 6, style: 'magic', def: 200, phases: ['p1_shield','p2_nylocas','p3_melee'] },
  { id: 'boss-wardens',         name: 'The Wardens',      combat: 780, hp: 880, maxHit: 40, speed: 5, style: 'magic', def: 150, phases: ['obelisk','p2_core','p3_enrage'] },

  // DKS
  { id: 'boss-dagannoth-rex',    name: 'Dagannoth Rex',    combat: 303, hp: 255, maxHit: 26, speed: 4, style: 'melee', def: 255, phases: [] },
  { id: 'boss-dagannoth-prime',  name: 'Dagannoth Prime',  combat: 303, hp: 255, maxHit: 50, speed: 4, style: 'magic', def: 255, phases: [] },
  { id: 'boss-dagannoth-supreme',name: 'Dagannoth Supreme',combat: 303, hp: 255, maxHit: 30, speed: 4, style: 'ranged', def: 128, phases: [] },

  // Other
  { id: 'boss-giant-mole',     name: 'Giant Mole',        combat: 230, hp: 200, maxHit: 21, speed: 4, style: 'melee', def: 60,  phases: ['dig'] },
  { id: 'boss-kbd',             name: 'KBD',              combat: 276, hp: 255, maxHit: 25, speed: 4, style: 'melee', def: 120, phases: [] },
  { id: 'boss-sarachnis',      name: 'Sarachnis',         combat: 318, hp: 400, maxHit: 31, speed: 4, style: 'melee', def: 120, phases: ['minions'] },
  { id: 'boss-skotizo',        name: 'Skotizo',           combat: 321, hp: 450, maxHit: 38, speed: 4, style: 'melee', def: 200, phases: ['altars'] },
  { id: 'boss-mimic',          name: 'The Mimic',         combat: 236, hp: 200, maxHit: 30, speed: 4, style: 'melee', def: 100, phases: [] },
  { id: 'boss-bryophyta',      name: 'Bryophyta',         combat: 128, hp: 115, maxHit: 14, speed: 4, style: 'melee', def: 80,  phases: ['growthlings'] },
  { id: 'boss-obor',           name: 'Obor',              combat: 106, hp: 120, maxHit: 16, speed: 4, style: 'melee', def: 60,  phases: [] },
  { id: 'boss-deranged-archaeo',name:'Deranged Archaeologist',combat: 276, hp: 250, maxHit: 30, speed: 4, style: 'ranged', def: 40, phases: [] },
];

for (const b of BOSSES) {
  define({
    id: b.id, name: b.name, type: 'boss',
    config: { combat: b.combat, hp: b.hp, maxHit: b.maxHit, speed: b.speed, defence: b.def, phases: b.phases },
    atoms: {
      cooldown: { duration: b.speed },
      hitCheck: { maxHit: b.maxHit, style: b.style, bonus: b.def },
      flinch: { attackSpeed: b.speed },
      ...(b.phases.length > 0 ? { phaseTransition: { phases: b.phases } } : {}),
      lootDrop: { table: [{ name: 'Bones', weight: 1, min: 1, max: 1, always: true }] },
    }
  });
}

console.log(`[defs] Bosses: ${BOSSES.length} bosses`);
