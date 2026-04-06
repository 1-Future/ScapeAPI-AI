// ══════════════════════════════════════════════════════════════════════════════
// LOCATIONS: Every major area/region as a mechanic entry
// ══════════════════════════════════════════════════════════════════════════════

const { define } = require('../mechanic');

const LOCATIONS = [
  // Free-to-play
  { id: 'loc-lumbridge',      name: 'Lumbridge',           type: 'town',     reqs: {} },
  { id: 'loc-varrock',        name: 'Varrock',             type: 'city',     reqs: {} },
  { id: 'loc-falador',        name: 'Falador',             type: 'city',     reqs: {} },
  { id: 'loc-draynor',        name: 'Draynor Village',     type: 'town',     reqs: {} },
  { id: 'loc-al-kharid',      name: 'Al Kharid',           type: 'town',     reqs: {} },
  { id: 'loc-edgeville',      name: 'Edgeville',           type: 'town',     reqs: {} },
  { id: 'loc-barbarian-village',name:'Barbarian Village',  type: 'town',     reqs: {} },
  { id: 'loc-port-sarim',     name: 'Port Sarim',          type: 'port',     reqs: {} },
  { id: 'loc-rimmington',     name: 'Rimmington',          type: 'town',     reqs: {} },
  { id: 'loc-wilderness',     name: 'Wilderness',          type: 'danger',   reqs: {} },
  // Members cities
  { id: 'loc-ardougne',       name: 'Ardougne',            type: 'city',     reqs: {} },
  { id: 'loc-camelot',        name: 'Camelot/Seers',       type: 'city',     reqs: {} },
  { id: 'loc-catherby',       name: 'Catherby',            type: 'town',     reqs: {} },
  { id: 'loc-yanille',        name: 'Yanille',             type: 'town',     reqs: {} },
  { id: 'loc-karamja',        name: 'Karamja',             type: 'island',   reqs: {} },
  { id: 'loc-brimhaven',      name: 'Brimhaven',           type: 'town',     reqs: {} },
  { id: 'loc-shilo-village',  name: 'Shilo Village',       type: 'town',     reqs: { quests: ['shilo_village'] } },
  { id: 'loc-canifis',        name: 'Canifis',             type: 'town',     reqs: { quests: ['priest_in_peril'] } },
  { id: 'loc-mort-myre',      name: 'Mort Myre Swamp',     type: 'danger',   reqs: {} },
  { id: 'loc-burgh-de-rott',  name: 'Burgh de Rott',       type: 'town',     reqs: {} },
  { id: 'loc-meiyerditch',    name: 'Meiyerditch',         type: 'town',     reqs: {} },
  { id: 'loc-darkmeyer',      name: 'Darkmeyer',           type: 'town',     reqs: { quests: ['sins_of_father'] } },
  { id: 'loc-rellekka',       name: 'Rellekka',            type: 'town',     reqs: { quests: ['fremmy_trials'] } },
  { id: 'loc-neitiznot',      name: 'Neitiznot',           type: 'town',     reqs: { quests: ['fremmy_isles'] } },
  { id: 'loc-jatizso',        name: 'Jatizso',             type: 'town',     reqs: { quests: ['fremmy_isles'] } },
  { id: 'loc-trollheim',      name: 'Trollheim',           type: 'mountain', reqs: {} },
  { id: 'loc-keldagrim',      name: 'Keldagrim',           type: 'city',     reqs: {} },
  { id: 'loc-zanaris',        name: 'Zanaris',             type: 'realm',    reqs: { quests: ['lost_city'] } },
  { id: 'loc-miscellania',    name: 'Miscellania',         type: 'island',   reqs: {} },
  { id: 'loc-lunar-isle',     name: 'Lunar Isle',          type: 'island',   reqs: { quests: ['lunar_diplomacy'] } },
  { id: 'loc-ape-atoll',      name: 'Ape Atoll',           type: 'island',   reqs: { quests: ['monkey_madness'] } },
  { id: 'loc-tirannwn',       name: 'Tirannwn',            type: 'forest',   reqs: { quests: ['regicide'] } },
  { id: 'loc-prifddinas',     name: 'Prifddinas',          type: 'city',     reqs: { quests: ['song_of_elves'] } },
  { id: 'loc-fossil-island',  name: 'Fossil Island',       type: 'island',   reqs: { quests: ['bone_voyage'] } },
  // Kourend
  { id: 'loc-kourend',        name: 'Great Kourend',       type: 'city',     reqs: {} },
  { id: 'loc-arceuus',        name: 'Arceuus',             type: 'district', reqs: {} },
  { id: 'loc-hosidius',       name: 'Hosidius',            type: 'district', reqs: {} },
  { id: 'loc-lovakengj',      name: 'Lovakengj',           type: 'district', reqs: {} },
  { id: 'loc-piscarilius',    name: 'Piscarilius',         type: 'district', reqs: {} },
  { id: 'loc-shayzien',       name: 'Shayzien',            type: 'district', reqs: {} },
  { id: 'loc-mount-karuulm',  name: 'Mount Karuulm',       type: 'mountain', reqs: {} },
  // Dungeons
  { id: 'loc-stronghold-slayer',name:'Stronghold Slayer Cave',type: 'dungeon', reqs: {} },
  { id: 'loc-catacombs',      name: 'Catacombs of Kourend',type: 'dungeon',  reqs: {} },
  { id: 'loc-taverly-dungeon',name: 'Taverly Dungeon',     type: 'dungeon',  reqs: {} },
  { id: 'loc-brimhaven-dungeon',name:'Brimhaven Dungeon',  type: 'dungeon',  reqs: {} },
  { id: 'loc-slayer-tower',   name: 'Slayer Tower',        type: 'dungeon',  reqs: {} },
  { id: 'loc-god-wars',       name: 'God Wars Dungeon',    type: 'dungeon',  reqs: { levels: { agility: 60, strength: 60 } } },
  { id: 'loc-tzhaar-city',    name: 'TzHaar City',         type: 'dungeon',  reqs: {} },
  { id: 'loc-kalphite-lair',  name: 'Kalphite Lair',       type: 'dungeon',  reqs: {} },
  { id: 'loc-abyss',          name: 'The Abyss',           type: 'dungeon',  reqs: {} },
  { id: 'loc-rev-caves',      name: 'Revenant Caves',      type: 'dungeon',  reqs: {} },
  // Desert
  { id: 'loc-pollnivneach',   name: 'Pollnivneach',        type: 'town',     reqs: {} },
  { id: 'loc-nardah',         name: 'Nardah',              type: 'town',     reqs: {} },
  { id: 'loc-sophanem',       name: 'Sophanem',            type: 'city',     reqs: {} },
  { id: 'loc-menaphos',       name: 'Menaphos (gate)',     type: 'city',     reqs: {} },
  // Newer areas
  { id: 'loc-varlamore',      name: 'Varlamore',           type: 'region',   reqs: {} },
  { id: 'loc-cam-torum',      name: 'Cam Torum',           type: 'city',     reqs: {} },
  { id: 'loc-civitas-illa',   name: 'Civitas illa Fortis',  type: 'city',     reqs: {} },
];

for (const l of LOCATIONS) {
  define({
    id: l.id, name: l.name, type: 'location',
    atoms: {},
    config: { locationType: l.type, requirements: l.reqs }
  });
}

console.log(`[defs] Locations: ${LOCATIONS.length} areas`);
