// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Treasure Trail (Clue Scroll) System
// 4 tiers: Beginner, Medium, Hard, Elite
// Each clue is a chain of 3-12 steps: coordinates, riddles, emotes, puzzles
// Reward caskets contain items from the clue reward table
//
// Manifesto P02: Background-to-Active attention (clue hunting is self-directed)
// Manifesto P03: Self-direction — massive exploration reward
// Manifesto P08: Breakpoint — completing a hard clue unlocks rare cosmetics
// ══════════════════════════════════════════════════════════════════════════════

const items = require('../../data/items');

const clueSteps = new Map();
const rewardTables = new Map();

function defineClueStep(opts) {
  if (!clueSteps.has(opts.tier)) clueSteps.set(opts.tier, []);
  clueSteps.get(opts.tier).push({
    id: opts.id, type: opts.type, // 'coordinate', 'riddle', 'emote', 'combat', 'puzzle'
    description: opts.description,
    solution: opts.solution || null,
    region: opts.region || null,
    combatLevel: opts.combatLevel || 0,
  });
}

function defineRewardTable(tier, rewards) {
  rewardTables.set(tier, rewards);
}

function generateClue(tier) {
  const steps = clueSteps.get(tier);
  if (!steps || steps.length === 0) return null;
  const lengths = { beginner: 3, medium: 5, hard: 8, elite: 12 };
  const count = lengths[tier] || 5;
  // Shuffle and pick
  const shuffled = [...steps].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

function rollReward(tier) {
  const table = rewardTables.get(tier);
  if (!table) return [];
  const drops = [];
  // Always: coins
  drops.push({ id: 101, name: 'Coins', count: table.coinRange[0] + Math.floor(Math.random() * (table.coinRange[1] - table.coinRange[0])) });
  // Roll 2-4 items from the table
  const rollCount = 2 + Math.floor(Math.random() * 3);
  for (let i = 0; i < rollCount; i++) {
    const totalWeight = table.items.reduce((s, item) => s + item.weight, 0);
    let roll = Math.random() * totalWeight;
    for (const item of table.items) {
      roll -= item.weight;
      if (roll <= 0) {
        const count = item.min + Math.floor(Math.random() * (item.max - item.min + 1));
        if (count > 0) drops.push({ id: item.id, name: item.name, count });
        break;
      }
    }
  }
  return drops;
}

// ── Clue scroll items ──────────────────────────────────────────────────────

items.define({ id: 33001, name: 'Clue scroll (beginner)', examine: 'A beginner treasure trail clue.', value: 0, category: 'clue', tradeable: false, weight: 0 });
items.define({ id: 33002, name: 'Clue scroll (medium)', examine: 'A medium treasure trail clue.', value: 0, category: 'clue', tradeable: false, weight: 0 });
items.define({ id: 33003, name: 'Clue scroll (hard)', examine: 'A hard treasure trail clue.', value: 0, category: 'clue', tradeable: false, weight: 0 });
items.define({ id: 33004, name: 'Clue scroll (elite)', examine: 'An elite treasure trail clue.', value: 0, category: 'clue', tradeable: false, weight: 0 });
items.define({ id: 33010, name: 'Reward casket (beginner)', examine: 'Open for beginner clue rewards.', value: 0, category: 'clue', tradeable: false, weight: 0 });
items.define({ id: 33011, name: 'Reward casket (medium)', examine: 'Open for medium clue rewards.', value: 0, category: 'clue', tradeable: false, weight: 0 });
items.define({ id: 33012, name: 'Reward casket (hard)', examine: 'Open for hard clue rewards.', value: 0, category: 'clue', tradeable: false, weight: 0 });
items.define({ id: 33013, name: 'Reward casket (elite)', examine: 'Open for elite clue rewards.', value: 0, category: 'clue', tradeable: false, weight: 0 });

// ══════════════════════════════════════════════════════════════════════════════
// CLUE STEPS — per tier
// ══════════════════════════════════════════════════════════════════════════════

// Beginner steps (Heartlands only, easy)
defineClueStep({ id: 'b1', tier: 'beginner', type: 'coordinate', description: 'Dig at 100, 90 in the Heartlands town square.', region: 'Heartlands' });
defineClueStep({ id: 'b2', tier: 'beginner', type: 'riddle', description: 'Talk to the man who sells bronze swords.', solution: 'Smith Kael', region: 'Heartlands' });
defineClueStep({ id: 'b3', tier: 'beginner', type: 'coordinate', description: 'Dig at 82, 98 in the cow field.', region: 'Heartlands' });
defineClueStep({ id: 'b4', tier: 'beginner', type: 'riddle', description: 'I guard the town but never sleep. Find me.', solution: 'Guard', region: 'Heartlands' });
defineClueStep({ id: 'b5', tier: 'beginner', type: 'coordinate', description: 'Dig near the fishing spot at 96, 104.', region: 'Heartlands' });

// Medium steps (multiple regions)
defineClueStep({ id: 'm1', tier: 'medium', type: 'coordinate', description: 'Dig at 120, 157 near the Boneyard oasis.', region: 'Boneyard' });
defineClueStep({ id: 'm2', tier: 'medium', type: 'riddle', description: 'The fishmonger sells more than fish. What does she know?', solution: 'Fishmonger Mara', region: 'Saltbrine' });
defineClueStep({ id: 'm3', tier: 'medium', type: 'emote', description: 'Wave at the Veilwood elven village entrance.', region: 'Veilwood' });
defineClueStep({ id: 'm4', tier: 'medium', type: 'coordinate', description: 'Dig at 175, 80 in the Sootworks forge hall.', region: 'Sootworks' });
defineClueStep({ id: 'm5', tier: 'medium', type: 'riddle', description: 'A dwarf who lost his way underground. Find the crazed miner.', solution: 'Crazed miner', region: 'Sootworks' });
defineClueStep({ id: 'm6', tier: 'medium', type: 'combat', description: 'Kill a Boneyard skeleton and search its remains.', combatLevel: 25, region: 'Boneyard' });
defineClueStep({ id: 'm7', tier: 'medium', type: 'coordinate', description: 'Dig at 55, 158 in Saltbrine harbour.', region: 'Saltbrine' });
defineClueStep({ id: 'm8', tier: 'medium', type: 'emote', description: 'Dance in the Moryskah village square.', region: 'Moryskah' });

// Hard steps (all regions, combat encounters)
defineClueStep({ id: 'h1', tier: 'hard', type: 'coordinate', description: 'Dig at 198, 172 inside Castle Malachar.', region: 'Moryskah' });
defineClueStep({ id: 'h2', tier: 'hard', type: 'combat', description: 'Kill a double agent (level 130) at the Wilds ruins.', combatLevel: 130, region: 'Wilds' });
defineClueStep({ id: 'h3', tier: 'hard', type: 'puzzle', description: 'Solve the sliding puzzle (15-puzzle) to decode the next step.' });
defineClueStep({ id: 'h4', tier: 'hard', type: 'riddle', description: 'She keeps the dream boundary. Who is she?', solution: 'Lucid Keeper Yara', region: 'Inkweald' });
defineClueStep({ id: 'h5', tier: 'hard', type: 'coordinate', description: 'Dig at 240, 150 in the Glass Tyrant arena.', region: 'Glass Desert' });
defineClueStep({ id: 'h6', tier: 'hard', type: 'emote', description: 'Bow at the Crystal Sage Orin while wearing full rune.', region: 'Glass Desert' });
defineClueStep({ id: 'h7', tier: 'hard', type: 'combat', description: 'Kill a double agent (level 108) at the Sootworks deep vein.', combatLevel: 108, region: 'Sootworks' });
defineClueStep({ id: 'h8', tier: 'hard', type: 'riddle', description: 'The three-headed dog guards a gate. Name its master.', solution: 'Cerberus', region: 'Moryskah' });
defineClueStep({ id: 'h9', tier: 'hard', type: 'coordinate', description: 'Dig at 42, 108 in the Veilwood sacred grove.', region: 'Veilwood' });
defineClueStep({ id: 'h10', tier: 'hard', type: 'puzzle', description: 'Navigate the light beam puzzle in the Boneyard pyramid.' });

// Elite steps (hardest content, endgame requirements)
defineClueStep({ id: 'e1', tier: 'elite', type: 'coordinate', description: 'Dig at 230, 82 in Veldrak\'s arena.', region: 'Glass Desert' });
defineClueStep({ id: 'e2', tier: 'elite', type: 'combat', description: 'Kill a double agent (level 180) in the Inkweald resonance chamber.', combatLevel: 180, region: 'Inkweald' });
defineClueStep({ id: 'e3', tier: 'elite', type: 'puzzle', description: 'Solve the Celtic knot puzzle.' });
defineClueStep({ id: 'e4', tier: 'elite', type: 'riddle', description: 'Six brothers sleep in mounds of earth. Disturb them all.', solution: 'Barrows Brothers', region: 'Moryskah' });
defineClueStep({ id: 'e5', tier: 'elite', type: 'emote', description: 'Perform the dragon emote at the King Black Dragon lair wearing full dragon.', region: 'Wilds' });
defineClueStep({ id: 'e6', tier: 'elite', type: 'coordinate', description: 'Dig at 132, 232 in the Hollow Choir chamber.', region: 'Inkweald' });
defineClueStep({ id: 'e7', tier: 'elite', type: 'riddle', description: 'The last dragon sleeps beneath crystal. What is its name?', solution: 'Veldrak', region: 'Glass Desert' });
defineClueStep({ id: 'e8', tier: 'elite', type: 'combat', description: 'Kill a double agent (level 200) at the lava pit in the deep Wilds.', combatLevel: 200, region: 'Wilds' });

// ══════════════════════════════════════════════════════════════════════════════
// REWARD TABLES — per tier
// ══════════════════════════════════════════════════════════════════════════════

defineRewardTable('beginner', {
  coinRange: [50, 500],
  items: [
    { id: 11100, name: 'Bronze arrow', weight: 10, min: 10, max: 50 },
    { id: 2001, name: 'Bread', weight: 8, min: 3, max: 10 },
    { id: 12501, name: 'Uncut sapphire', weight: 3, min: 1, max: 1 },
    { id: 11350, name: 'Air rune', weight: 5, min: 10, max: 50 },
  ],
});

defineRewardTable('medium', {
  coinRange: [500, 5000],
  items: [
    { id: 12502, name: 'Uncut emerald', weight: 5, min: 1, max: 2 },
    { id: 12503, name: 'Uncut ruby', weight: 3, min: 1, max: 1 },
    { id: 23020, name: 'Ranger boots', weight: 1, min: 1, max: 1 },
    { id: 23021, name: 'Wizard boots', weight: 1, min: 1, max: 1 },
    { id: 11104, name: 'Adamant arrow', weight: 5, min: 20, max: 100 },
    { id: 11357, name: 'Death rune', weight: 3, min: 10, max: 30 },
    { id: 23003, name: 'Black platebody (t)', weight: 2, min: 1, max: 1 },
  ],
});

defineRewardTable('hard', {
  coinRange: [2000, 20000],
  items: [
    { id: 12504, name: 'Uncut diamond', weight: 4, min: 1, max: 2 },
    { id: 12505, name: 'Uncut dragonstone', weight: 2, min: 1, max: 1 },
    { id: 23001, name: 'Rune platebody (t)', weight: 2, min: 1, max: 1 },
    { id: 23002, name: 'Rune platebody (g)', weight: 1, min: 1, max: 1 },
    { id: 23010, name: 'Holy book', weight: 1, min: 1, max: 1 },
    { id: 23011, name: 'Book of darkness', weight: 1, min: 1, max: 1 },
    { id: 23022, name: "Robin Hood hat", weight: 1, min: 1, max: 1 },
    { id: 11105, name: 'Rune arrow', weight: 4, min: 30, max: 100 },
    { id: 11358, name: 'Blood rune', weight: 3, min: 10, max: 40 },
  ],
});

defineRewardTable('elite', {
  coinRange: [10000, 100000],
  items: [
    { id: 23030, name: 'Third-age platebody', weight: 1, min: 1, max: 1 },
    { id: 23031, name: 'Third-age platelegs', weight: 1, min: 1, max: 1 },
    { id: 23032, name: 'Third-age full helm', weight: 1, min: 1, max: 1 },
    { id: 23033, name: 'Third-age range top', weight: 1, min: 1, max: 1 },
    { id: 23034, name: 'Third-age mage hat', weight: 1, min: 1, max: 1 },
    { id: 12505, name: 'Uncut dragonstone', weight: 3, min: 1, max: 3 },
    { id: 25003, name: 'Dragon bolts (e)', weight: 3, min: 50, max: 200 },
    { id: 11358, name: 'Blood rune', weight: 4, min: 50, max: 200 },
    { id: 11363, name: 'Soul rune', weight: 2, min: 20, max: 80 },
  ],
});

console.log(`[aelgard] Treasure trail system: ${[...clueSteps.values()].reduce((s, arr) => s + arr.length, 0)} clue steps across 4 tiers`);

module.exports = { defineClueStep, defineRewardTable, generateClue, rollReward, clueSteps, rewardTables };
