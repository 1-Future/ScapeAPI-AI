// ══════════════════════════════════════════════════════════════════════════════
// AGILITY SHORTCUTS: Every notable shortcut in the game
// ══════════════════════════════════════════════════════════════════════════════

const { define } = require('../mechanic');

const SHORTCUTS = [
  { id: 'short-varrock-south', name: 'Varrock South Fence',    level: 13, area: 'Varrock' },
  { id: 'short-falador-wall',  name: 'Falador Crumbling Wall', level: 5,  area: 'Falador' },
  { id: 'short-taverly-pipe',  name: 'Taverly Pipe Squeeze',   level: 70, area: 'Taverly' },
  { id: 'short-gwd-rock',     name: 'GWD Boulder',             level: 60, area: 'God Wars' },
  { id: 'short-shilo-stepping',name:'Shilo Stepping Stones',   level: 77, area: 'Shilo Village' },
  { id: 'short-yanille-wall',  name: 'Yanille Wall',           level: 40, area: 'Yanille' },
  { id: 'short-coal-truck-log',name: 'Coal Truck Log Balance', level: 20, area: 'Seers' },
  { id: 'short-ardougne-log',  name: 'Ardougne Log Balance',   level: 33, area: 'Ardougne' },
  { id: 'short-slayer-tower-chain',name:'Slayer Tower Chain', level: 61, area: 'Morytania' },
  { id: 'short-slayer-tower-spike',name:'Slayer Tower Spike', level: 71, area: 'Morytania' },
  { id: 'short-lumbridge-stile',name:'Lumbridge Stile',       level: 1,  area: 'Lumbridge' },
  { id: 'short-draynor-stepping',name:'Draynor Stepping Stone',level: 31, area: 'Draynor' },
  { id: 'short-karamja-stepping',name:'Karamja Stepping Stone',level: 15, area: 'Karamja' },
  { id: 'short-brimhaven-vine',name: 'Brimhaven Vine',        level: 87, area: 'Brimhaven' },
  { id: 'short-mos-leharmless', name: 'Mos Le Harmless Cave', level: 82, area: "Mos Le'Harmless" },
  { id: 'short-troll-stronghold',name:'Troll Stronghold Rock', level: 47, area: 'Troll Stronghold' },
  { id: 'short-waterfall-ledge',name: 'Waterfall Ledge',      level: 1,  area: 'Baxtorian' },
  { id: 'short-arandar-pass',  name: 'Arandar Rock Climb',    level: 59, area: 'Tirannwn' },
  { id: 'short-kalphite-wall', name: 'Kalphite Wall',         level: 86, area: 'Kalphite Lair' },
  { id: 'short-fossil-island-rock',name:'Fossil Island Rocks',level: 64, area: 'Fossil Island' },
  { id: 'short-rev-cave-jump', name: 'Rev Cave Jump',         level: 65, area: 'Wilderness' },
  { id: 'short-corporeal-cave',name: 'Corp Cave Crevice',     level: 73, area: 'Corp Cave' },
  { id: 'short-kourend-lake',  name: 'Kourend Lake Jump',     level: 73, area: 'Kourend' },
  { id: 'short-stronghold-gap',name: 'Stronghold Gap',        level: 72, area: 'Stronghold' },
  { id: 'short-cerberus-shortcut',name:'Cerberus Shortcut',  level: 91, area: 'Cerberus Lair' },
  { id: 'short-prifddinas-rock',name:'Prifddinas Rock Climb',level: 80, area: 'Prifddinas' },
];

for (const s of SHORTCUTS) {
  define({
    id: s.id, name: s.name, type: 'shortcut',
    requires: { levels: { agility: s.level } },
    atoms: {
      periodicAction: { interval: 3, successRate: 1.0, successMessage: `You take the shortcut.` },
    },
    config: { area: s.area }
  });
}

console.log(`[defs] Agility Shortcuts: ${SHORTCUTS.length} shortcuts`);
