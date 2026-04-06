// ══════════════════════════════════════════════════════════════════════════════
// NPCs: Common NPCs with services and dialogue
// ══════════════════════════════════════════════════════════════════════════════

const { define } = require('../mechanic');

const NPCS = [
  // Banks
  { id: 'npc-banker',          name: 'Banker',              service: 'bank',     dialogue: 'I would like to access my bank account, please.' },
  { id: 'npc-grand-exchange',  name: 'Grand Exchange Clerk',service: 'ge',       dialogue: 'I would like to set up a trade, please.' },
  // Shops
  { id: 'npc-general-store',   name: 'Shopkeeper',          service: 'shop',     dialogue: 'Can I see your wares?' },
  { id: 'npc-sword-shop',      name: 'Sword Shop Owner',    service: 'shop',     dialogue: 'I would like to see your swords.' },
  { id: 'npc-rune-shop',       name: 'Rune Shop Owner',     service: 'shop',     dialogue: 'I need some runes.' },
  { id: 'npc-archery-shop',    name: 'Archery Shop Owner',  service: 'shop',     dialogue: 'I need some ranged supplies.' },
  { id: 'npc-staff-shop',      name: 'Zaff',                service: 'shop',     dialogue: 'Can I buy a staff?' },
  { id: 'npc-gem-trader',      name: 'Gem Trader',          service: 'shop',     dialogue: 'I need some gems.' },
  { id: 'npc-charter-crewmember',name:'Charter Crewmember', service: 'transport',dialogue: 'Where would you like to go?' },
  // Trainers
  { id: 'npc-combat-tutor',    name: 'Melee Combat Tutor',  service: 'tutor',    dialogue: 'Can you teach me about combat?' },
  { id: 'npc-ranged-tutor',    name: 'Ranged Combat Tutor', service: 'tutor',    dialogue: 'Can you teach me about ranged?' },
  { id: 'npc-magic-tutor',     name: 'Magic Combat Tutor',  service: 'tutor',    dialogue: 'Can you teach me about magic?' },
  { id: 'npc-lumbridge-guide',  name: 'Lumbridge Guide',    service: 'guide',    dialogue: 'Welcome! How can I help you?' },
  // Quest NPCs
  { id: 'npc-cook',            name: 'Cook',                service: 'quest',    dialogue: 'What am I to do?' },
  { id: 'npc-duke-horacio',    name: 'Duke Horacio',        service: 'quest',    dialogue: 'Greetings, what brings you to my castle?' },
  { id: 'npc-hans',            name: 'Hans',                service: 'info',     dialogue: 'How long have I been here?' },
  { id: 'npc-father-aereck',   name: 'Father Aereck',       service: 'quest',    dialogue: 'Welcome to the church.' },
  { id: 'npc-explorer-jack',   name: 'Explorer Jack',       service: 'info',     dialogue: 'I love exploring!' },
  { id: 'npc-bob',             name: 'Bob',                 service: 'repair',   dialogue: 'I can repair your barrows equipment.' },
  { id: 'npc-oziach',          name: 'Oziach',              service: 'quest',    dialogue: 'You want to prove yourself worthy?' },
  // Skill-specific
  { id: 'npc-murphy',          name: 'Murphy',              service: 'fishing',  dialogue: 'Want to go trawling?' },
  { id: 'npc-estate-agent',    name: 'Estate Agent',        service: 'poh',      dialogue: 'I can help you with your house.' },
  { id: 'npc-sawmill-operator',name: 'Sawmill Operator',    service: 'planks',   dialogue: 'I can make planks for you.' },
  { id: 'npc-perdu',           name: 'Perdu',               service: 'reclaim',  dialogue: 'Lost something? I might have it.' },
  { id: 'npc-decanting',       name: 'Bob Barter',          service: 'decant',   dialogue: 'I can decant your potions.' },
  // Random event NPCs
  { id: 'npc-genie',           name: 'Genie',               service: 'random',   dialogue: 'I can grant you experience in any skill.' },
  { id: 'npc-quiz-master',     name: 'Quiz Master',         service: 'random',   dialogue: 'Answer my questions!' },
  { id: 'npc-certers',         name: 'Mysterious Old Man',  service: 'random',   dialogue: 'I have a puzzle for you.' },
  { id: 'npc-rick-turpentine', name: 'Rick Turpentine',     service: 'random',   dialogue: 'Stand and deliver!' },
  { id: 'npc-sandwich-lady',   name: 'Sandwich Lady',       service: 'random',   dialogue: 'Would you like a baguette?' },
  // Important service NPCs
  { id: 'npc-kolodion',        name: 'Kolodion',            service: 'mage_arena', dialogue: 'Want to fight in the Mage Arena?' },
  { id: 'npc-krystilia',       name: 'Krystilia',           service: 'wildy_slayer', dialogue: 'I can assign you a wilderness task.' },
  { id: 'npc-lars',            name: 'Lars',                service: 'canoe',    dialogue: 'Want to take a canoe?' },
  { id: 'npc-doomsayer',       name: 'Doomsayer',           service: 'warnings', dialogue: 'I can toggle your warning messages.' },
  { id: 'npc-makeover-mage',   name: 'Makeover Mage',       service: 'appearance', dialogue: 'I can change your look!' },
];

for (const n of NPCS) {
  define({
    id: n.id, name: n.name, type: 'npc',
    atoms: {
      dialogue: { npcName: n.name, tree: { start: { lines: [n.dialogue], next: null } } },
    },
    config: { service: n.service }
  });
}

console.log(`[defs] NPCs: ${NPCS.length} NPCs`);
