// ══════════════════════════════════════════════════════════════════════════════
// ACHIEVEMENT DIARIES + CLUE SCROLLS + RANDOM EVENTS + EMOTES
// ══════════════════════════════════════════════════════════════════════════════

const { define } = require('../mechanic');

// ── ACHIEVEMENT DIARY AREAS ─────────────────────────────────────────────────
const DIARY_AREAS = [
  'Ardougne', 'Desert', 'Falador', 'Fremennik', 'Kandarin', 'Karamja',
  'Kourend & Kebos', 'Lumbridge & Draynor', 'Morytania', 'Varrock',
  'Western Provinces', 'Wilderness'
];
const DIARY_TIERS = ['Easy', 'Medium', 'Hard', 'Elite'];

let diaryCount = 0;
for (const area of DIARY_AREAS) {
  for (const tier of DIARY_TIERS) {
    const id = `diary-${area.toLowerCase().replace(/[^a-z]+/g, '-')}-${tier.toLowerCase()}`;
    define({
      id, name: `${area} ${tier} Diary`, type: 'achievement',
      atoms: {
        achievementTrigger: true,
        xpDrop: { skills: {} },
      },
      config: { area, tier, tasks: tier === 'Easy' ? 10 : tier === 'Medium' ? 12 : tier === 'Hard' ? 8 : 6 }
    });
    diaryCount++;
  }
}

// ── COMBAT ACHIEVEMENTS ─────────────────────────────────────────────────────
const CA_TIERS = ['Easy', 'Medium', 'Hard', 'Elite', 'Master', 'Grandmaster'];
let caCount = 0;
for (const tier of CA_TIERS) {
  define({
    id: `ca-tier-${tier.toLowerCase()}`, name: `Combat Achievements: ${tier}`, type: 'achievement',
    atoms: { achievementTrigger: true },
    config: { tier }
  });
  caCount++;
}

// ── CLUE SCROLLS ────────────────────────────────────────────────────────────
const CLUE_TIERS = [
  { tier: 'beginner', steps: '1-3',  rewards: ['mole_slippers', 'sandwich_lady_hat'] },
  { tier: 'easy',     steps: '2-4',  rewards: ['blue_beret', 'bronze_platebody_g'] },
  { tier: 'medium',   steps: '3-5',  rewards: ['ranger_boots', 'holy_sandals'] },
  { tier: 'hard',     steps: '4-6',  rewards: ['gilded_platebody', 'third_age_range'] },
  { tier: 'elite',    steps: '5-7',  rewards: ['third_age_druidic', 'rangers_tunic'] },
  { tier: 'master',   steps: '6-8',  rewards: ['bloodhound_pet', 'third_age_pickaxe'] },
];

for (const c of CLUE_TIERS) {
  define({
    id: `clue-${c.tier}`, name: `${c.tier.charAt(0).toUpperCase() + c.tier.slice(1)} Clue Scroll`, type: 'quest',
    atoms: {
      phaseTransition: { phases: ['step1', 'step2', 'step3', 'reward'] },
      lootDrop: { table: c.rewards.map(r => ({ name: r, weight: 1, min: 1, max: 1 })) },
      achievementTrigger: true,
    },
    config: { steps: c.steps, tier: c.tier }
  });
}

// ── RANDOM EVENTS ───────────────────────────────────────────────────────────
const RANDOM_EVENTS = [
  { id: 'random-genie',         name: 'Genie Random Event',         reward: 'xp_lamp' },
  { id: 'random-quiz',          name: 'Quiz Master Random Event',   reward: 'mystery_box' },
  { id: 'random-maze',          name: 'Maze Random Event',          reward: 'coins' },
  { id: 'random-mime',          name: 'Mime Random Event',          reward: 'mime_outfit' },
  { id: 'random-drill-demon',   name: 'Drill Demon Random Event',  reward: 'camo_outfit' },
  { id: 'random-surprise-exam', name: 'Surprise Exam',             reward: 'book_of_knowledge' },
  { id: 'random-certers',       name: 'Mysterious Old Man',        reward: 'gems' },
  { id: 'random-evil-twin',     name: 'Evil Twin (Molly)',         reward: 'coins' },
  { id: 'random-freaky-forester',name:'Freaky Forester',           reward: 'lumberjack_hat' },
  { id: 'random-frog-prince',   name: 'Kiss the Frog',            reward: 'frog_outfit' },
  { id: 'random-pinball',       name: 'Pinball Random Event',      reward: 'coins' },
  { id: 'random-prison-pete',   name: 'Prison Pete',               reward: 'coins' },
  { id: 'random-sandwich-lady', name: 'Sandwich Lady',             reward: 'food' },
  { id: 'random-rick-turpentine',name:'Rick Turpentine',           reward: 'coins' },
  { id: 'random-strange-plant', name: 'Strange Plant',             reward: 'fruit' },
  { id: 'random-bee-keeper',    name: 'Bee Keeper',                 reward: 'beekeeper_outfit' },
  { id: 'random-pillory',       name: 'Pillory Guard',             reward: 'coins' },
  { id: 'random-gravedigger',   name: 'Gravedigger (Leo)',         reward: 'zombie_outfit' },
  { id: 'random-jekyll-hyde',   name: 'Dr Jekyll',                  reward: 'potion' },
  { id: 'random-cap-hand',      name: "Cap'n Hand",                reward: 'pirate_outfit' },
  { id: 'random-sergeant-damien',name:'Sergeant Damien',           reward: 'camo_outfit' },
  { id: 'random-dunce',         name: 'Dunce (Surprise Exam)',     reward: 'book' },
  { id: 'random-niles',         name: 'Niles/Miles/Giles',         reward: 'emote' },
];

for (const r of RANDOM_EVENTS) {
  define({
    id: r.id, name: r.name, type: 'event',
    atoms: {
      dialogue: { npcName: r.name.split(' ')[0], tree: { start: { lines: ['A random event has appeared!'], next: null } } },
      lootDrop: { table: [{ name: r.reward, weight: 1, min: 1, max: 1 }] },
    },
    config: { reward: r.reward }
  });
}

// ── EMOTES ──────────────────────────────────────────────────────────────────
const EMOTES = [
  'Yes', 'No', 'Bow', 'Angry', 'Think', 'Wave', 'Shrug', 'Cheer', 'Beckon',
  'Laugh', 'Jump for Joy', 'Yawn', 'Dance', 'Jig', 'Spin', 'Headbang',
  'Cry', 'Blow Kiss', 'Panic', 'Raspberry', 'Clap', 'Salute', 'Goblin Bow',
  'Goblin Salute', 'Glass Box', 'Climb Rope', 'Lean', 'Glass Wall',
  'Idea', 'Stomp', 'Flap', 'Slap Head', 'Zombie Walk', 'Zombie Dance',
  'Scared', 'Bunny Hop', 'Skill Cape', 'Snowman Dance', 'Air Guitar',
  'Uri Transform', 'Smooth Dance', 'Crazy Dance', 'Premier Shield',
];

for (const e of EMOTES) {
  const id = `emote-${e.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  define({
    id, name: `Emote: ${e}`, type: 'emote',
    atoms: { instant: true },
    config: { animation: e }
  });
}

// ── COLLECTION LOG CATEGORIES ───────────────────────────────────────────────
const COLLECTION_CATS = [
  'Bosses', 'Raids', 'Clues', 'Minigames', 'Other',
];
for (const cat of COLLECTION_CATS) {
  define({
    id: `collection-${cat.toLowerCase()}`, name: `Collection Log: ${cat}`, type: 'tracking',
    atoms: { achievementTrigger: true },
    config: { category: cat }
  });
}

const total = diaryCount + caCount + CLUE_TIERS.length + RANDOM_EVENTS.length + EMOTES.length + COLLECTION_CATS.length;
console.log(`[defs] Achievements: ${diaryCount} diaries, ${caCount} CA tiers, ${CLUE_TIERS.length} clues, ${RANDOM_EVENTS.length} random events, ${EMOTES.length} emotes, ${COLLECTION_CATS.length} collection = ${total} mechanics`);
