// Load all mechanic definitions
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
require('./bosses');
require('./construction');
require('./teleports');
require('./slayer');
require('./quests');
require('./equipment-armor');
require('./minigames');
require('./npcs-dialogue');
require('./diaries-achievements');
require('./monsters-extended');
require('./agility-shortcuts');
require('./fairy-rings');
require('./pets');
require('./quests-extended');
require('./special-items');
require('./locations');
require('./shops');
require('./music-tracks');
require('./system-plugins');
require('./items-comprehensive');
require('./drop-tables');
require('./spells-utility-extended');
require('./combat-armor-extended');
require('./npc-services');
require('./slayer-extended');
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
