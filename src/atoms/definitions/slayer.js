// ══════════════════════════════════════════════════════════════════════════════
// SLAYER: Masters, tasks, and special mechanics
// ══════════════════════════════════════════════════════════════════════════════

const { define } = require('../mechanic');

const MASTERS = [
  { id: 'slayer-turael',    name: 'Turael',         combatReq: 3,  slayerReq: 1,  taskRange: [15, 50] },
  { id: 'slayer-mazchna',   name: 'Mazchna',        combatReq: 20, slayerReq: 1,  taskRange: [40, 70] },
  { id: 'slayer-vannaka',   name: 'Vannaka',        combatReq: 40, slayerReq: 1,  taskRange: [60, 120] },
  { id: 'slayer-chaeldar',  name: 'Chaeldar',       combatReq: 70, slayerReq: 1,  taskRange: [110, 170] },
  { id: 'slayer-konar',     name: 'Konar quo Maten',combatReq: 75, slayerReq: 1,  taskRange: [120, 170] },
  { id: 'slayer-nieve',     name: 'Nieve/Steve',    combatReq: 85, slayerReq: 1,  taskRange: [130, 200] },
  { id: 'slayer-duradel',   name: 'Duradel',        combatReq: 100,slayerReq: 50, taskRange: [130, 200] },
];

const TASKS = [
  { id: 'task-aberrant-spectres', name: 'Aberrant Spectres Task', slayerReq: 60, monster: 'mob-aberrant-spec' },
  { id: 'task-abyssal-demons',   name: 'Abyssal Demons Task',    slayerReq: 85, monster: 'mob-abyssal-demon' },
  { id: 'task-black-demons',     name: 'Black Demons Task',      slayerReq: 1,  monster: 'mob-black-demon' },
  { id: 'task-bloodvelds',       name: 'Bloodvelds Task',        slayerReq: 50, monster: 'mob-bloodveld' },
  { id: 'task-blue-dragons',     name: 'Blue Dragons Task',      slayerReq: 1,  monster: 'mob-blue-dragon' },
  { id: 'task-dark-beasts',      name: 'Dark Beasts Task',       slayerReq: 90, monster: 'mob-dark-beast' },
  { id: 'task-dust-devils',      name: 'Dust Devils Task',       slayerReq: 65, monster: 'mob-dust-devil' },
  { id: 'task-fire-giants',      name: 'Fire Giants Task',       slayerReq: 1,  monster: 'mob-fire-giant' },
  { id: 'task-gargoyles',        name: 'Gargoyles Task',         slayerReq: 75, monster: 'mob-gargoyle' },
  { id: 'task-greater-demons',   name: 'Greater Demons Task',    slayerReq: 1,  monster: 'mob-greater-demon' },
  { id: 'task-hellhounds',       name: 'Hellhounds Task',        slayerReq: 1,  monster: 'mob-hellhound' },
  { id: 'task-iron-dragons',     name: 'Iron Dragons Task',      slayerReq: 1,  monster: 'mob-iron-dragon' },
  { id: 'task-kurask',           name: 'Kurask Task',            slayerReq: 70, monster: 'mob-kurask' },
  { id: 'task-nechryael',        name: 'Nechryael Task',         slayerReq: 80, monster: 'mob-nechryael' },
  { id: 'task-smoke-devils',     name: 'Smoke Devils Task',      slayerReq: 93, monster: 'mob-smoke-devil' },
  { id: 'task-steel-dragons',    name: 'Steel Dragons Task',     slayerReq: 1,  monster: 'mob-steel-dragon' },
  { id: 'task-skeletal-wyverns', name: 'Skeletal Wyverns Task',  slayerReq: 72, monster: 'mob-wyvern' },
  { id: 'task-wyrms',            name: 'Wyrms Task',             slayerReq: 62, monster: 'mob-wyrm' },
  { id: 'task-drakes',           name: 'Drakes Task',            slayerReq: 84, monster: 'mob-drake' },
  { id: 'task-hydras',           name: 'Hydras Task',            slayerReq: 95, monster: 'mob-hydra' },
  { id: 'task-basilisk-knights', name: 'Basilisk Knights Task',  slayerReq: 60, monster: 'mob-basilisk-kn' },
  { id: 'task-dagannoth',        name: 'Dagannoth Task',         slayerReq: 1,  monster: 'mob-dagannoth' },
  { id: 'task-suqah',            name: 'Suqah Task',             slayerReq: 1,  monster: 'mob-suqah' },
  { id: 'task-tzhaar',           name: 'TzHaar Task',            slayerReq: 1,  monster: 'mob-tzhaar-ket' },
];

for (const m of MASTERS) {
  define({
    id: m.id, name: `Slayer Master: ${m.name}`, type: 'npc',
    atoms: {
      dialogue: { npcName: m.name, tree: {
        start: { lines: [`${m.name} can assign you a slayer task.`], choices: [
          { text: 'I need a new assignment', next: 'assign' },
          { text: 'Goodbye', next: null }
        ]},
        assign: { lines: ['Your new task is to slay some creatures. Off you go!'], next: null }
      }},
    },
    config: { combatReq: m.combatReq, slayerReq: m.slayerReq, taskRange: m.taskRange }
  });
}

for (const t of TASKS) {
  define({
    id: t.id, name: t.name, type: 'quest',
    requires: { levels: { slayer: t.slayerReq } },
    atoms: {
      timer: { duration: 150, name: 'task_count' },
      xpDrop: { skills: { slayer: 0 } },
      achievementTrigger: true,
    },
    config: { monster: t.monster }
  });
}

console.log(`[defs] Slayer: ${MASTERS.length} masters, ${TASKS.length} tasks = ${MASTERS.length + TASKS.length} mechanics`);
