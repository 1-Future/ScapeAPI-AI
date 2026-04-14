// Load all mechanic definitions
// OSRS-verbatim files (bosses, shops, quests, quests-extended, slayer, slayer-extended,
// pets, teleports, fairy-rings, music-tracks) were deleted to rebuild Aelgard-native.
// All original IP content lives in src/content/aelgard/*.

require('./skills-gathering');
require('./skills-processing');
require('./skills-activity');
require('./combat');
require('./monsters');
require('./magic-spells');
require('./smithing-items');
require('./farming');
require('./hunter');
require('./prayers');
require('./construction');
require('./equipment-armor');
require('./minigames');
require('./npcs-dialogue');
require('./diaries-achievements');
require('./monsters-extended');
require('./agility-shortcuts');
require('./special-items');
require('./locations');
require('./system-plugins');
require('./items-comprehensive');
require('./drop-tables');
require('./spells-utility-extended');
require('./combat-armor-extended');
require('./npc-services');
require('./transportation-extended');
require('./unique-mechanics');
require('./boss-palette');
require('./from-database');

const { list } = require('../mechanic');

// Summary
const byType = {};
for (const m of list()) byType[m.type] = (byType[m.type] || 0) + 1;
console.log(`[defs] Total: ${list().length} mechanics`);
Object.entries(byType).sort((a,b) => b[1]-a[1]).forEach(([t,c]) => console.log(`[defs]   ${t}: ${c}`));
