// ══════════════════════════════════════════════════════════════════════════════
// Tutorial Steps — Aelgard new-player journey
//
// A data-only module. 34 ordered steps guiding a fresh player from the
// Heartlands spawn through the first major breakpoints, into the wider game.
// The engine (`src/engine/tutorial.js`) consumes this list; the content here is
// the authoritative curriculum.
//
// Each step:
//   id        — snake_case unique identifier
//   title     — short label (parchment tabular header)
//   hint      — in-game hint text shown to the player
//   trigger   — { type, ...payload } matched against events:
//                 command        — a command verb was executed (args = verb)
//                 distance       — cumulative tiles walked since step start
//                 xp             — xp earned in a skill at or above threshold
//                 level          — any skill reached the required level
//                 total_level    — sum of all skill levels reaches threshold
//                 item_acquired  — item id/name entered inventory
//                 item_cooked    — player completed a cooking recipe
//                 fire_lit       — firemaking burn action
//                 tree_chopped   — woodcutting action completed
//                 npc_kill       — monster name killed (target in `name`)
//                 pickup         — player picked up a ground item
//                 bank_opened    — bank interface opened
//                 quest_started  — quest id started
//                 quest_complete — quest id completed
//                 dialogue       — dialogue started with an NPC
//                 ge_opened      — Grand Exchange opened
//                 prayer_toggled — any prayer activated
//                 combat_style   — attack style changed
//                 ironman_set    — ironman variant selected
//                 arealocked_set — area-locked mode selected
//                 save           — /save command issued
//                 clan_joined    — player joined or created a clan
//                 codex_opened   — player viewed codex
//                 breakpoint     — any breakpoint fired
//                 manual         — only advanceable via explicit action (replay etc.)
//   reward    — optional: { xp: { skill: amount }, item: { id, count } }
//
// No emojis. No Marstead reference. Parchment-style copy throughout.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const STEPS = [
  // ── Grounding ──────────────────────────────────────────────────────────────
  {
    id: 'welcome_look',
    title: 'Welcome to Aelgard',
    hint: 'A parchment notice appears in your hand. Type `look` to study your surroundings.',
    trigger: { type: 'command', verb: 'look', aliases: ['l'] },
    reward: { xp: { hitpoints: 25 } },
  },
  {
    id: 'move_5_tiles',
    title: 'Find Your Feet',
    hint: 'Walk five tiles in any direction. Try `n`, `s`, `e`, or `w`.',
    trigger: { type: 'distance', amount: 5 },
    reward: { xp: { agility: 25 } },
  },
  {
    id: 'check_skills',
    title: 'Know Thy Numbers',
    hint: 'Your ledger of skills matters here. Type `skills` (or `stats`) to inspect them.',
    trigger: { type: 'command', verb: 'skills', aliases: ['stats', 'levels'] },
    reward: { xp: { hitpoints: 25 } },
  },
  {
    id: 'check_inventory',
    title: 'Your Pack',
    hint: 'You will carry up to 28 items. Type `inventory` (or `i`) to see what is yours.',
    trigger: { type: 'command', verb: 'inventory', aliases: ['i', 'inv'] },
    reward: { item: { id: 200, count: 2 } }, // 2 logs
  },
  {
    id: 'examine_surroundings',
    title: 'Read the World',
    hint: 'Every object tells you something. Try `examine self` or `examine tree`.',
    trigger: { type: 'command', verb: 'examine', aliases: ['ex'] },
    reward: { xp: { hitpoints: 25 } },
  },

  // ── Gathering ──────────────────────────────────────────────────────────────
  {
    id: 'chop_first_tree',
    title: 'First Timber',
    hint: 'Find a tree and `chop` it. Logs are the backbone of most crafts.',
    trigger: { type: 'tree_chopped' },
    reward: { xp: { woodcutting: 50 } },
  },
  {
    id: 'light_first_fire',
    title: 'Kindle a Flame',
    hint: 'With logs in hand, use a `tinderbox` on them, or type `light logs` on a clear tile.',
    trigger: { type: 'fire_lit' },
    reward: { xp: { firemaking: 60 } },
  },
  {
    id: 'fish_or_mine',
    title: 'Of the Earth or the Sea',
    hint: 'Gather a raw resource. `fish` at a spot, or `mine` at a rock. Either will do.',
    trigger: { type: 'command', verb: 'fish', aliases: ['mine', 'net'] },
    reward: { xp: { fishing: 40 } },
  },
  {
    id: 'cook_a_shrimp',
    title: 'The Humble Shrimp',
    hint: 'Raw food must be cooked. Use raw shrimps on a fire, or type `cook shrimps` at a range.',
    trigger: { type: 'item_acquired', itemId: 230 },
    reward: { xp: { cooking: 30 }, item: { id: 230, count: 3 } },
  },

  // ── Combat ─────────────────────────────────────────────────────────────────
  {
    id: 'equip_weapon',
    title: 'Arm Yourself',
    hint: 'A naked fist goes only so far. Use `equip bronze sword` if you have one, or any weapon.',
    trigger: { type: 'command', verb: 'equip', aliases: ['wield', 'wear'] },
    reward: { item: { id: 401, count: 1 } }, // bronze sword
  },
  {
    id: 'fight_a_cow',
    title: 'First Blood',
    hint: 'A cow grazes nearby. `attack cow` to engage. Keep an eye on your health.',
    trigger: { type: 'npc_kill', name: 'cow' },
    reward: { xp: { attack: 40, strength: 40 } },
  },
  {
    id: 'pick_up_loot',
    title: 'Spoils',
    hint: 'Dead monsters leave drops. Walk over an item and `pickup` it (or stand on it and `take`).',
    trigger: { type: 'pickup' },
    reward: { xp: { hitpoints: 50 } },
  },
  {
    id: 'eat_food',
    title: 'A Warrior Eats',
    hint: 'Low health? `eat shrimps` (or any cooked food). You cannot fight when dead.',
    trigger: { type: 'command', verb: 'eat' },
    reward: { item: { id: 230, count: 5 } },
  },
  {
    id: 'combat_style',
    title: 'Styles of War',
    hint: 'Try `style aggressive` or `style defensive`. Each trains a different stat.',
    trigger: { type: 'combat_style' },
    reward: { xp: { attack: 50, defence: 50 } },
  },

  // ── Economy ────────────────────────────────────────────────────────────────
  {
    id: 'visit_shop',
    title: 'Commerce',
    hint: 'Shops sell essentials. Find a shopkeeper and type `shop` once near them.',
    trigger: { type: 'command', verb: 'shop', aliases: ['trade'] },
    reward: { item: { id: 101, count: 200 } },
  },
  {
    id: 'open_bank',
    title: 'The Bank',
    hint: 'Your pack fills fast. Find a banker (villages, cities) and `bank` to store items.',
    trigger: { type: 'bank_opened' },
    reward: { xp: { hitpoints: 50 } },
  },
  {
    id: 'deposit_withdraw',
    title: 'Move the Coin',
    hint: 'At a bank, `deposit logs` or `withdraw coins 100`. Learn the rhythm now, thank yourself later.',
    trigger: { type: 'command', verb: 'deposit', aliases: ['withdraw'] },
    reward: { xp: { hitpoints: 25 } },
  },
  {
    id: 'grand_exchange',
    title: 'The Grand Exchange',
    hint: 'When you have wealth to spend, open the Grand Exchange with `ge` from any GE clerk.',
    trigger: { type: 'ge_opened' },
    reward: { xp: { hitpoints: 50 } },
  },

  // ── Progression hooks ──────────────────────────────────────────────────────
  {
    id: 'first_skill_10',
    title: 'First Milestone',
    hint: 'Reach level 10 in any skill. Every skill has its own reward ladder.',
    trigger: { type: 'level', amount: 10 },
    reward: { xp: { hitpoints: 100 } },
  },
  {
    id: 'first_total_50',
    title: 'A Well-Rounded Start',
    hint: 'Your total level measures breadth. Reach a total of 50.',
    trigger: { type: 'total_level', amount: 50 },
    reward: { xp: { hitpoints: 100 } },
  },
  {
    id: 'first_breakpoint',
    title: 'Things Change',
    hint: 'Some levels do more than add a number. Keep training until something shifts — a new capability, a new area, a new tier.',
    trigger: { type: 'breakpoint' },
    reward: { xp: { hitpoints: 150 } },
  },
  {
    id: 'first_quest_start',
    title: 'An Errand',
    hint: 'Quests define Aelgard. Type `quest list`, pick one, then `quest start <id>`.',
    trigger: { type: 'quest_started' },
    reward: { xp: { hitpoints: 100 } },
  },
  {
    id: 'first_quest_finish',
    title: 'Errand Run',
    hint: 'Finish the quest you started. Talk through the dialogue, solve the problem, report back.',
    trigger: { type: 'quest_complete' },
    reward: { xp: { hitpoints: 250 } },
  },
  {
    id: 'dialogue_flow',
    title: 'Speak Well',
    hint: 'Talk to any NPC. Type `talk <name>` to begin. Dialogue is alive here — read carefully.',
    trigger: { type: 'dialogue' },
    reward: { xp: { hitpoints: 50 } },
  },

  // ── Prayer / magic ─────────────────────────────────────────────────────────
  {
    id: 'bury_bones',
    title: 'Bones to the Earth',
    hint: 'Pick up bones from a kill and `bury` them. Prayer begins here.',
    trigger: { type: 'command', verb: 'bury' },
    reward: { xp: { prayer: 20 } },
  },
  {
    id: 'toggle_prayer',
    title: 'Faith in Action',
    hint: 'Reach prayer level 1+, then `pray <prayer>` to activate a prayer (e.g. `pray thick skin`).',
    trigger: { type: 'prayer_toggled' },
    reward: { xp: { prayer: 50 } },
  },
  {
    id: 'cast_spell',
    title: 'The First Spell',
    hint: 'With runes in your pack, `cast wind strike on <target>`. Magic costs runes, but it cuts from range.',
    trigger: { type: 'command', verb: 'cast' },
    reward: { xp: { magic: 50 } },
  },

  // ── Persistence / identity ─────────────────────────────────────────────────
  {
    id: 'save_state',
    title: 'Preserve the Thread',
    hint: 'Progress is saved automatically, but you may force it with `save` at any time.',
    trigger: { type: 'command', verb: 'save' },
    reward: { xp: { hitpoints: 50 } },
  },
  {
    id: 'set_home',
    title: 'A Place to Return',
    hint: 'Pick a safe tile and `sethome` there. On death you respawn at your chosen home.',
    trigger: { type: 'command', verb: 'sethome' },
    reward: { xp: { hitpoints: 50 } },
  },
  {
    id: 'map_yourself',
    title: 'Where You Stand',
    hint: 'Type `map` (or `where`) to see a parchment of your region and your position on it.',
    trigger: { type: 'command', verb: 'map', aliases: ['where', 'minimap'] },
    reward: { xp: { hitpoints: 25 } },
  },

  // ── Modes / community ──────────────────────────────────────────────────────
  {
    id: 'consider_ironman',
    title: 'The Iron Path',
    hint: 'If you want the self-sufficient journey, consider `/ironman start ironman`. Permanent choice.',
    trigger: { type: 'manual', auto_advance_on_ironman: true },
    reward: { xp: { hitpoints: 50 } },
  },
  {
    id: 'consider_arealocked',
    title: 'The Locked Land',
    hint: 'A stricter path: `/areamode start <region>`. Confine yourself to one region until you clear it.',
    trigger: { type: 'manual', auto_advance_on_arealocked: true },
    reward: { xp: { hitpoints: 50 } },
  },
  {
    id: 'join_or_create_clan',
    title: 'Company on the Road',
    hint: 'Travellers band together. `clan create <name>` or `clan invite <player>` to form a band.',
    trigger: { type: 'clan_joined' },
    reward: { xp: { hitpoints: 75 } },
  },
  {
    id: 'open_codex',
    title: 'The Codex',
    hint: 'The Codex is your library of Aelgard — quests, regions, items, bosses. Type `codex` to open it.',
    trigger: { type: 'codex_opened' },
    reward: { xp: { hitpoints: 100 } },
  },

  // ── Graduation ─────────────────────────────────────────────────────────────
  {
    id: 'graduate',
    title: 'You Are Your Own',
    hint: 'The tutorial is done. The world is open. Try `quest list`, travel north, or pick a skill and push it to 99.',
    trigger: { type: 'command', verb: 'help' },
    reward: { xp: { hitpoints: 500 }, item: { id: 101, count: 1000 } },
  },
];

// Freeze so downstream cannot mutate accidentally.
for (const s of STEPS) Object.freeze(s);

function list() {
  return STEPS.slice();
}

function count() {
  return STEPS.length;
}

function at(index) {
  return STEPS[index] || null;
}

function byId(id) {
  return STEPS.find(s => s.id === id) || null;
}

module.exports = { STEPS, list, count, at, byId };
