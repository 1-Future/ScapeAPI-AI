// ══════════════════════════════════════════════════════════════════════════════
// QUESTS EXTENDED: Every remaining OSRS quest
// ══════════════════════════════════════════════════════════════════════════════

const { define } = require('../mechanic');

const QUESTS = [
  // F2P remaining
  { id: 'quest-witchs-potion',     name: "Witch's Potion",          qp: 1, diff: 'novice' },
  { id: 'quest-witchs-house',      name: "Witch's House",           qp: 4, diff: 'intermediate' },
  { id: 'quest-x-marks-spot',      name: 'X Marks the Spot',        qp: 1, diff: 'novice' },

  // Members A-D
  { id: 'quest-big-chompy',        name: 'Big Chompy Bird Hunting', qp: 2, diff: 'intermediate' },
  { id: 'quest-biohazard',         name: 'Biohazard',               qp: 3, diff: 'intermediate' },
  { id: 'quest-cabin-fever',       name: 'Cabin Fever',             qp: 2, diff: 'experienced' },
  { id: 'quest-clock-tower',       name: 'Clock Tower',             qp: 1, diff: 'novice' },
  { id: 'quest-cold-war',          name: 'Cold War',                qp: 1, diff: 'intermediate' },
  { id: 'quest-contact',           name: 'Contact!',                qp: 1, diff: 'master' },
  { id: 'quest-creature-fenkenstrain', name: 'Creature of Fenkenstrain', qp: 2, diff: 'intermediate' },
  { id: 'quest-darkness-hallowvale', name: 'Darkness of Hallowvale', qp: 2, diff: 'intermediate' },
  { id: 'quest-death-plateau',     name: 'Death Plateau',           qp: 1, diff: 'novice' },
  { id: 'quest-death-dorgeshuun',  name: 'Death to the Dorgeshuun', qp: 1, diff: 'intermediate' },
  { id: 'quest-devious-minds',     name: 'Devious Minds',           qp: 1, diff: 'experienced' },
  { id: 'quest-dig-site',          name: 'The Dig Site',            qp: 2, diff: 'intermediate' },
  { id: 'quest-dream-mentor',      name: 'Dream Mentor',            qp: 2, diff: 'master' },
  { id: 'quest-dwarf-cannon',      name: 'Dwarf Cannon',            qp: 0, diff: 'novice' },
  { id: 'quest-eadgars-ruse',      name: "Eadgar's Ruse",          qp: 1, diff: 'experienced' },

  // E-G
  { id: 'quest-eagles-peak',       name: "Eagles' Peak",            qp: 2, diff: 'novice' },
  { id: 'quest-elemental-workshop-1', name: 'Elemental Workshop I', qp: 1, diff: 'novice' },
  { id: 'quest-elemental-workshop-2', name: 'Elemental Workshop II',qp: 1, diff: 'intermediate' },
  { id: 'quest-enakhras-lament',   name: "Enakhra's Lament",       qp: 2, diff: 'experienced' },
  { id: 'quest-enlightened-journey',name: 'Enlightened Journey',    qp: 1, diff: 'intermediate' },
  { id: 'quest-eyes-glouphrie',    name: 'The Eyes of Glouphrie',  qp: 2, diff: 'intermediate' },
  { id: 'quest-fairytale-1',       name: 'Fairytale I',             qp: 2, diff: 'experienced' },
  { id: 'quest-fairytale-2',       name: 'Fairytale II',            qp: 2, diff: 'experienced' },
  { id: 'quest-family-crest',      name: 'Family Crest',            qp: 1, diff: 'experienced' },
  { id: 'quest-fight-arena',       name: 'Fight Arena',             qp: 2, diff: 'intermediate' },
  { id: 'quest-fishing-contest',   name: 'Fishing Contest',         qp: 1, diff: 'novice' },
  { id: 'quest-forgettable-tale',  name: 'Forgettable Tale...',     qp: 2, diff: 'intermediate' },
  { id: 'quest-fremmy-trials',     name: 'The Fremennik Trials',    qp: 3, diff: 'intermediate' },
  { id: 'quest-fremmy-isles',      name: 'The Fremennik Isles',     qp: 1, diff: 'experienced' },
  { id: 'quest-garden-tranquility',name: 'Garden of Tranquillity',  qp: 1, diff: 'intermediate' },
  { id: 'quest-gertrudes-cat',     name: "Gertrude's Cat",          qp: 1, diff: 'novice' },
  { id: 'quest-ghosts-ahoy',       name: 'Ghosts Ahoy',            qp: 2, diff: 'intermediate' },
  { id: 'quest-getting-ahead',     name: 'Getting Ahead',           qp: 1, diff: 'intermediate' },
  { id: 'quest-grim-tales',        name: 'Grim Tales',              qp: 1, diff: 'master' },

  // H-L
  { id: 'quest-haunted-mine',      name: 'Haunted Mine',            qp: 2, diff: 'experienced' },
  { id: 'quest-hazeel-cult',       name: 'Hazeel Cult',             qp: 1, diff: 'novice' },
  { id: 'quest-heroes-quest',      name: "Heroes' Quest",           qp: 1, diff: 'experienced' },
  { id: 'quest-holy-grail',        name: 'Holy Grail',              qp: 2, diff: 'intermediate' },
  { id: 'quest-icthlarins-little-helper', name: "Icthlarin's Little Helper", qp: 2, diff: 'intermediate' },
  { id: 'quest-in-aid-of-myreque', name: 'In Aid of the Myreque',   qp: 2, diff: 'intermediate' },
  { id: 'quest-in-search-of-myreque',name:'In Search of the Myreque',qp: 2, diff: 'intermediate' },
  { id: 'quest-jungle-potion',     name: 'Jungle Potion',           qp: 1, diff: 'novice' },
  { id: 'quest-kings-ransom',      name: "King's Ransom",           qp: 1, diff: 'experienced' },
  { id: 'quest-legends-quest',     name: "Legends' Quest",          qp: 4, diff: 'master' },

  // M-P
  { id: 'quest-merlins-crystal',   name: "Merlin's Crystal",        qp: 6, diff: 'intermediate' },
  { id: 'quest-monks-friend',      name: "Monk's Friend",           qp: 1, diff: 'novice' },
  { id: 'quest-mountain-daughter', name: 'Mountain Daughter',       qp: 2, diff: 'intermediate' },
  { id: 'quest-mournings-end-1',   name: "Mourning's End I",        qp: 2, diff: 'master' },
  { id: 'quest-mournings-end-2',   name: "Mourning's End II",       qp: 2, diff: 'master' },
  { id: 'quest-murder-mystery',    name: 'Murder Mystery',          qp: 3, diff: 'novice' },
  { id: 'quest-my-arms-big-adventure',name:"My Arm's Big Adventure",qp: 1, diff: 'intermediate' },
  { id: 'quest-observatory',       name: 'Observatory Quest',       qp: 2, diff: 'novice' },
  { id: 'quest-olaf-quest',        name: "Olaf's Quest",            qp: 1, diff: 'intermediate' },
  { id: 'quest-one-small-favour',  name: 'One Small Favour',        qp: 2, diff: 'experienced' },
  { id: 'quest-plague-city',       name: 'Plague City',             qp: 1, diff: 'novice' },
  { id: 'quest-rag-and-bone-1',    name: 'Rag and Bone Man I',      qp: 1, diff: 'novice' },
  { id: 'quest-rag-and-bone-2',    name: 'Rag and Bone Man II',     qp: 1, diff: 'experienced' },
  { id: 'quest-ratcatchers',       name: 'Ratcatchers',             qp: 2, diff: 'intermediate' },

  // R-S
  { id: 'quest-recruitment-drive', name: 'Recruitment Drive',       qp: 1, diff: 'novice' },
  { id: 'quest-royal-trouble',     name: 'Royal Trouble',           qp: 1, diff: 'experienced' },
  { id: 'quest-rum-deal',          name: 'Rum Deal',                qp: 2, diff: 'experienced' },
  { id: 'quest-scorpion-catcher',  name: 'Scorpion Catcher',        qp: 1, diff: 'intermediate' },
  { id: 'quest-sea-slug',          name: 'Sea Slug',                qp: 1, diff: 'intermediate' },
  { id: 'quest-shades-of-mortton', name: 'Shades of Mortton',       qp: 3, diff: 'intermediate' },
  { id: 'quest-shadow-of-storm',   name: 'Shadow of the Storm',     qp: 1, diff: 'intermediate' },
  { id: 'quest-sheep-herder',      name: 'Sheep Herder',            qp: 4, diff: 'novice' },
  { id: 'quest-shilo-village',     name: 'Shilo Village',           qp: 2, diff: 'experienced' },
  { id: 'quest-slug-menace',       name: 'The Slug Menace',         qp: 1, diff: 'intermediate' },
  { id: 'quest-spirits-of-elid',   name: 'Spirits of the Elid',    qp: 2, diff: 'intermediate' },
  { id: 'quest-swan-song',         name: 'Swan Song',               qp: 2, diff: 'master' },
  { id: 'quest-tai-bwo-wannai',    name: 'Tai Bwo Wannai Trio',     qp: 2, diff: 'intermediate' },
  { id: 'quest-tale-of-righteous', name: 'Tale of the Righteous',   qp: 1, diff: 'intermediate' },
  { id: 'quest-tears-of-guthix',   name: 'Tears of Guthix',        qp: 1, diff: 'novice' },
  { id: 'quest-temple-of-ikov',    name: 'Temple of Ikov',          qp: 1, diff: 'experienced' },
  { id: 'quest-throne-of-misc',    name: 'Throne of Miscellania',   qp: 1, diff: 'experienced' },
  { id: 'quest-tourist-trap',      name: 'The Tourist Trap',        qp: 2, diff: 'intermediate' },
  { id: 'quest-tower-of-life',     name: 'Tower of Life',           qp: 2, diff: 'novice' },
  { id: 'quest-troll-romance',     name: 'Troll Romance',           qp: 2, diff: 'experienced' },
  { id: 'quest-troll-stronghold',  name: 'Troll Stronghold',        qp: 1, diff: 'experienced' },
  { id: 'quest-underground-pass',  name: 'Underground Pass',        qp: 5, diff: 'experienced' },

  // V-Z
  { id: 'quest-wanted',            name: 'Wanted!',                 qp: 1, diff: 'intermediate' },
  { id: 'quest-watchtower',        name: 'Watchtower',              qp: 4, diff: 'intermediate' },
  { id: 'quest-what-lies-below',   name: 'What Lies Below',         qp: 1, diff: 'intermediate' },
  { id: 'quest-zogre-flesh-eaters',name: 'Zogre Flesh Eaters',     qp: 1, diff: 'intermediate' },

  // Kourend questline
  { id: 'quest-client-of-kourend', name: 'Client of Kourend',       qp: 1, diff: 'novice' },
  { id: 'quest-depths-of-despair', name: 'Depths of Despair',       qp: 1, diff: 'intermediate' },
  { id: 'quest-queen-of-thieves',  name: 'Queen of Thieves',        qp: 1, diff: 'intermediate' },
  { id: 'quest-forsaken-tower',    name: 'The Forsaken Tower',      qp: 1, diff: 'intermediate' },
  { id: 'quest-ascent-of-arceuus', name: 'Ascent of Arceuus',      qp: 1, diff: 'intermediate' },
  { id: 'quest-architectural-alliance',name:'Architectural Alliance',qp: 0, diff: 'intermediate' },
  { id: 'quest-kingdom-divided',   name: 'A Kingdom Divided',       qp: 2, diff: 'experienced' },

  // Newer quests
  { id: 'quest-making-friends',    name: 'Making Friends with My Arm',qp: 2, diff: 'master' },
  { id: 'quest-land-of-goblins',   name: 'Land of the Goblins',     qp: 2, diff: 'experienced' },
  { id: 'quest-sleeping-giants',   name: 'Sleeping Giants',         qp: 1, diff: 'novice' },
  { id: 'quest-temple-of-eye',     name: 'Temple of the Eye',       qp: 1, diff: 'intermediate' },
  { id: 'quest-secrets-of-north',  name: 'Secrets of the North',    qp: 2, diff: 'master' },
  { id: 'quest-desert-treasure-2', name: 'Desert Treasure II',      qp: 5, diff: 'grandmaster' },
  { id: 'quest-while-guthix-sleeps',name:'While Guthix Sleeps',    qp: 5, diff: 'grandmaster' },
  { id: 'quest-twilight-swamp',    name: 'Twilight of the Swamp',   qp: 2, diff: 'master' },
  { id: 'quest-at-first-light',    name: 'At First Light',          qp: 1, diff: 'intermediate' },
  { id: 'quest-children-of-sun',   name: 'Children of the Sun',     qp: 1, diff: 'novice' },
  { id: 'quest-defender-of-varrock',name:'Defender of Varrock',     qp: 2, diff: 'experienced' },
  { id: 'quest-path-of-glouphrie', name: 'Path of Glouphrie',      qp: 2, diff: 'experienced' },
  { id: 'quest-perilous-moons',    name: 'Perilous Moons',          qp: 2, diff: 'experienced' },
];

for (const q of QUESTS) {
  define({
    id: q.id, name: q.name, type: 'quest',
    atoms: {
      dialogue: { npcName: 'Quest NPC', tree: { start: { lines: [`Begin: ${q.name}`], next: null } } },
      phaseTransition: { phases: ['not_started', 'in_progress', 'complete'] },
      achievementTrigger: true,
    },
    config: { questPoints: q.qp, difficulty: q.diff }
  });
}

console.log(`[defs] Quests Extended: ${QUESTS.length} more quests`);
