// ── Quest System (10.1) ───────────────────────────────────────────────────────
// Multi-step quests with requirements and rewards

const quests = new Map(); // id → quest def

function define(id, opts) {
  quests.set(id, {
    id,
    name: opts.name || id,
    description: opts.description || '',
    difficulty: opts.difficulty || 'Novice', // Novice, Intermediate, Experienced, Master, Grandmaster
    questPoints: opts.questPoints || 1,
    requirements: opts.requirements || {}, // { skills: { attack: 10 }, quests: ['cooks_assistant'], items: [] }
    steps: opts.steps || [], // [{ text, action, check }]
    rewards: opts.rewards || {}, // { xp: { cooking: 300 }, items: [{ id, count }], questPoints: 1 }
  });
}

function getQuest(id) { return quests.get(id); }
function listAll() { return [...quests.values()]; }

function getStatus(player, questId) {
  if (!player.questProgress) player.questProgress = {};
  return player.questProgress[questId] || { started: false, step: 0, complete: false };
}

function meetsRequirements(player, quest, getLevel) {
  if (quest.requirements.skills) {
    for (const [skill, level] of Object.entries(quest.requirements.skills)) {
      if (getLevel(player, skill) < level) return false;
    }
  }
  if (quest.requirements.quests) {
    for (const qId of quest.requirements.quests) {
      if (!getStatus(player, qId).complete) return false;
    }
  }
  return true;
}

function startQuest(player, questId) {
  if (!player.questProgress) player.questProgress = {};
  player.questProgress[questId] = { started: true, step: 0, complete: false };
}

function advanceStep(player, questId) {
  const status = getStatus(player, questId);
  const quest = quests.get(questId);
  if (!quest || status.complete) return null;
  status.step++;
  if (status.step >= quest.steps.length) {
    status.complete = true;
    return 'complete';
  }
  player.questProgress[questId] = status;
  return status.step;
}

function getQuestPoints(player) {
  let total = 0;
  for (const [id, status] of Object.entries(player.questProgress || {})) {
    if (status.complete) {
      const q = quests.get(id);
      if (q) total += q.questPoints;
    }
  }
  return total;
}

// ── Define quests ─────────────────────────────────────────────────────────────

define('cooks_assistant', {
  name: "Cook's Assistant",
  description: "The cook in Lumbridge Castle needs your help to make a cake for Duke Horacio's birthday party.",
  difficulty: 'Novice',
  questPoints: 1,
  requirements: {},
  steps: [
    { text: 'Talk to the Cook in Lumbridge Castle kitchen.' },
    { text: 'Bring the cook an egg, a bucket of milk, and a pot of flour.', items: ['egg', 'bucket of milk', 'pot of flour'] },
    { text: 'Talk to the Cook again to complete the quest.' },
  ],
  rewards: { xp: { cooking: 300 }, questPoints: 1 },
});

define('sheep_shearer', {
  name: 'Sheep Shearer',
  description: 'Fred the Farmer needs 20 balls of wool.',
  difficulty: 'Novice',
  questPoints: 1,
  requirements: {},
  steps: [
    { text: 'Talk to Fred the Farmer north of Lumbridge.' },
    { text: 'Bring Fred 20 balls of wool.' },
    { text: 'Talk to Fred again to complete the quest.' },
  ],
  rewards: { xp: { crafting: 150 }, items: [{ id: 101, count: 60 }], questPoints: 1 },
});

define('rune_mysteries', {
  name: 'Rune Mysteries',
  description: 'Discover the secret of rune crafting.',
  difficulty: 'Novice',
  questPoints: 1,
  requirements: {},
  steps: [
    { text: 'Talk to Duke Horacio in Lumbridge Castle.' },
    { text: 'Bring the air talisman to Aubury in Varrock.' },
    { text: 'Return to Duke Horacio.' },
  ],
  rewards: { xp: { runecrafting: 250 }, questPoints: 1 },
});

define('dragon_slayer', {
  name: 'Dragon Slayer',
  description: 'Prove yourself a champion by slaying the dragon Elvarg.',
  difficulty: 'Experienced',
  questPoints: 2,
  requirements: { skills: { attack: 1 }, quests: [] },
  steps: [
    { text: 'Talk to the Guildmaster in the Champions Guild.' },
    { text: 'Obtain an anti-dragon shield from Duke Horacio.' },
    { text: 'Collect map pieces from Melzar, Wormbrain, and the Oracle.' },
    { text: 'Sail to Crandor and enter Elvarg\'s lair.' },
    { text: 'Defeat Elvarg the dragon.' },
  ],
  rewards: { xp: { strength: 18650, defence: 18650 }, questPoints: 2 },
});

module.exports = { define, getQuest, listAll, getStatus, meetsRequirements, startQuest, advanceStep, getQuestPoints, quests };
