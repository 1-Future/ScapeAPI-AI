// ══════════════════════════════════════════════════════════════════════════════
// QUEST DEFINITIONS: Every OSRS quest as a mechanic config
// ══════════════════════════════════════════════════════════════════════════════

const { define } = require('../mechanic');

const QUESTS = [
  // F2P
  { id: 'quest-cooks-assistant',    name: "Cook's Assistant",           qp: 1,  difficulty: 'novice',    reqs: {}, rewards: { cooking: 300 } },
  { id: 'quest-sheep-shearer',      name: 'Sheep Shearer',             qp: 1,  difficulty: 'novice',    reqs: {}, rewards: { crafting: 150 } },
  { id: 'quest-romeo-juliet',       name: 'Romeo & Juliet',            qp: 5,  difficulty: 'novice',    reqs: {}, rewards: {} },
  { id: 'quest-rune-mysteries',     name: 'Rune Mysteries',            qp: 1,  difficulty: 'novice',    reqs: {}, rewards: {} },
  { id: 'quest-demon-slayer',       name: 'Demon Slayer',              qp: 3,  difficulty: 'novice',    reqs: {}, rewards: {} },
  { id: 'quest-restless-ghost',     name: 'The Restless Ghost',        qp: 1,  difficulty: 'novice',    reqs: {}, rewards: { prayer: 1125 } },
  { id: 'quest-ernest-chicken',     name: 'Ernest the Chicken',        qp: 4,  difficulty: 'novice',    reqs: {}, rewards: {} },
  { id: 'quest-vampire-slayer',     name: 'Vampire Slayer',            qp: 3,  difficulty: 'intermediate', reqs: {}, rewards: { attack: 4825 } },
  { id: 'quest-imp-catcher',        name: 'Imp Catcher',               qp: 1,  difficulty: 'novice',    reqs: {}, rewards: { magic: 875 } },
  { id: 'quest-prince-ali',         name: 'Prince Ali Rescue',         qp: 3,  difficulty: 'intermediate', reqs: {}, rewards: {} },
  { id: 'quest-dorics-quest',       name: "Doric's Quest",             qp: 1,  difficulty: 'novice',    reqs: {}, rewards: { mining: 1300 } },
  { id: 'quest-black-knights',      name: "Black Knights' Fortress",   qp: 3,  difficulty: 'intermediate', reqs: { quest_points: 12 }, rewards: {} },
  { id: 'quest-goblin-diplomacy',   name: 'Goblin Diplomacy',          qp: 5,  difficulty: 'novice',    reqs: {}, rewards: { crafting: 200 } },
  { id: 'quest-knights-sword',      name: "The Knight's Sword",        qp: 1,  difficulty: 'intermediate', reqs: { mining: 10 }, rewards: { smithing: 12725 } },
  { id: 'quest-dragon-slayer',      name: 'Dragon Slayer',             qp: 2,  difficulty: 'experienced', reqs: { quest_points: 32 }, rewards: { strength: 18650, defence: 18650 } },
  { id: 'quest-corsair-curse',      name: 'The Corsair Curse',         qp: 2,  difficulty: 'novice',    reqs: {}, rewards: {} },
  { id: 'quest-shield-arrav',       name: 'Shield of Arrav',           qp: 1,  difficulty: 'novice',    reqs: {}, rewards: {} },
  { id: 'quest-pirate-treasure',    name: "Pirate's Treasure",         qp: 2,  difficulty: 'novice',    reqs: {}, rewards: {} },
  { id: 'quest-misthalin-mystery',  name: 'Misthalin Mystery',         qp: 1,  difficulty: 'novice',    reqs: {}, rewards: { crafting: 600 } },
  { id: 'quest-below-ice-mountain', name: 'Below Ice Mountain',        qp: 1,  difficulty: 'novice',    reqs: { quest_points: 16 }, rewards: {} },

  // Members - Short
  { id: 'quest-druidic-ritual',     name: 'Druidic Ritual',            qp: 4,  difficulty: 'novice',    reqs: {}, rewards: { herblore: 250 } },
  { id: 'quest-lost-city',          name: 'Lost City',                 qp: 3,  difficulty: 'intermediate', reqs: { crafting: 31, woodcutting: 36 }, rewards: {} },
  { id: 'quest-priest-in-peril',    name: 'Priest in Peril',           qp: 1,  difficulty: 'novice',    reqs: {}, rewards: { prayer: 1406 } },
  { id: 'quest-nature-spirit',      name: 'Nature Spirit',             qp: 2,  difficulty: 'novice',    reqs: { priest_in_peril: true }, rewards: { crafting: 3000, herblore: 2000 } },
  { id: 'quest-waterfall',          name: 'Waterfall Quest',           qp: 1,  difficulty: 'intermediate', reqs: {}, rewards: { attack: 13750, strength: 13750 } },
  { id: 'quest-tree-gnome-village', name: 'Tree Gnome Village',        qp: 2,  difficulty: 'intermediate', reqs: {}, rewards: { attack: 11450 } },
  { id: 'quest-grand-tree',         name: 'The Grand Tree',            qp: 5,  difficulty: 'experienced', reqs: { agility: 25 }, rewards: { attack: 18400, agility: 7900, magic: 2150 } },
  { id: 'quest-monkey-madness',     name: 'Monkey Madness I',          qp: 3,  difficulty: 'master',    reqs: { tree_gnome_village: true, grand_tree: true }, rewards: { attack: 35000, strength: 35000, defence: 35000, hitpoints: 35000 } },
  { id: 'quest-desert-treasure',    name: 'Desert Treasure',           qp: 3,  difficulty: 'master',    reqs: { magic: 50, thieving: 53, firemaking: 50, slayer: 10 }, rewards: { magic: 20000 } },
  { id: 'quest-lunar-diplomacy',    name: 'Lunar Diplomacy',           qp: 2,  difficulty: 'experienced', reqs: { magic: 65, crafting: 61, mining: 60 }, rewards: { magic: 5000 } },
  { id: 'quest-animal-magnetism',   name: 'Animal Magnetism',          qp: 1,  difficulty: 'intermediate', reqs: { slayer: 18, crafting: 19, ranged: 30, woodcutting: 35 }, rewards: { crafting: 1000, fletching: 1000, slayer: 1000 } },
  { id: 'quest-horror-from-deep',   name: 'Horror from the Deep',      qp: 2,  difficulty: 'intermediate', reqs: { agility: 35 }, rewards: {} },
  { id: 'quest-bone-voyage',        name: 'Bone Voyage',               qp: 1,  difficulty: 'intermediate', reqs: { kudos: 100 }, rewards: {} },
  { id: 'quest-recipe-disaster',    name: 'Recipe for Disaster',       qp: 10, difficulty: 'grandmaster', reqs: { cooking: 70, quest_points: 175 }, rewards: { cooking: 20000 } },
  { id: 'quest-regicide',           name: 'Regicide',                  qp: 3,  difficulty: 'master',    reqs: { agility: 56, crafting: 10 }, rewards: { agility: 13750 } },
  { id: 'quest-roving-elves',       name: 'Roving Elves',              qp: 1,  difficulty: 'master',    reqs: { regicide: true }, rewards: { strength: 10000 } },
  { id: 'quest-song-of-the-elves',  name: 'Song of the Elves',         qp: 4,  difficulty: 'grandmaster', reqs: { agility: 70, construction: 70, farming: 70, herblore: 70, hunter: 70, mining: 70, smithing: 70, woodcutting: 70 }, rewards: {} },
  { id: 'quest-dragon-slayer-2',    name: 'Dragon Slayer II',          qp: 5,  difficulty: 'grandmaster', reqs: { quest_points: 200, magic: 75, smithing: 70, mining: 68, crafting: 62, agility: 60, thieving: 60, construction: 50, hitpoints: 50 }, rewards: {} },
  { id: 'quest-sins-of-father',     name: 'Sins of the Father',        qp: 2,  difficulty: 'master',    reqs: { woodcutting: 62, fletching: 60, crafting: 56, agility: 52, attack: 50, slayer: 50, magic: 49 }, rewards: {} },
  { id: 'quest-a-taste-of-hope',    name: 'A Taste of Hope',           qp: 1,  difficulty: 'experienced', reqs: { crafting: 48, agility: 45, attack: 40, herblore: 40, slayer: 38 }, rewards: {} },
  { id: 'quest-mm2',                name: 'Monkey Madness II',         qp: 4,  difficulty: 'grandmaster', reqs: { slayer: 69, crafting: 70, hunter: 60, agility: 55, thieving: 55, firemaking: 60 }, rewards: { slayer: 25000, agility: 20000 } },
  { id: 'quest-fremmy-exiles',      name: 'The Fremennik Exiles',      qp: 2,  difficulty: 'master',    reqs: { crafting: 65, slayer: 60, fishing: 60, smithing: 60, runecraft: 55 }, rewards: {} },
  { id: 'quest-night-at-theatre',   name: 'A Night at the Theatre',    qp: 2,  difficulty: 'master',    reqs: {}, rewards: {} },
  { id: 'quest-beneath-cursed-sands',name:'Beneath Cursed Sands',      qp: 2,  difficulty: 'master',    reqs: { agility: 62, crafting: 55, firemaking: 55, mining: 55 }, rewards: {} },
];

for (const q of QUESTS) {
  const xpRewards = {};
  if (q.rewards) {
    for (const [skill, xp] of Object.entries(q.rewards)) {
      xpRewards[skill] = xp;
    }
  }

  define({
    id: q.id, name: q.name, type: 'quest',
    requires: { levels: q.reqs },
    atoms: {
      dialogue: { npcName: 'Quest NPC', tree: { start: { lines: [`Begin quest: ${q.name}`], next: null } } },
      phaseTransition: { phases: ['not_started', 'in_progress', 'complete'] },
      ...(Object.keys(xpRewards).length > 0 ? { xpDrop: { skills: xpRewards } } : {}),
      achievementTrigger: true,
    },
    config: { questPoints: q.qp, difficulty: q.difficulty, rewards: q.rewards }
  });
}

console.log(`[defs] Quests: ${QUESTS.length} quests`);
