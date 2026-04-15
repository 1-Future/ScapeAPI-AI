// ══════════════════════════════════════════════════════════════════════════════
// Quick Chat Presets (burn-v2)
//
// 60+ pre-scripted phrases organised by category. Accounts marked as
// `quickChatOnly: true` can only send messages via these presets.
//
// Every preset has:
//   id         short slug used with /qc <id>
//   category   one of: greetings, combat, skilling, trade, events, quest,
//              social, status, navigation, lfg, grouping
//   text       the fixed sentence players broadcast
//   tags       optional search tokens
//
// Ids are globally unique. Case-insensitive lookup via presetById().
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const PRESETS = Object.freeze([
  // ── Greetings (6) ────────────────────────────────────────────────────────
  { id: 'greet-hi',      category: 'greetings', text: 'Hi.' },
  { id: 'greet-hello',   category: 'greetings', text: 'Hello there.' },
  { id: 'greet-good',    category: 'greetings', text: 'Good to see you.' },
  { id: 'greet-bye',     category: 'greetings', text: 'Farewell.' },
  { id: 'greet-welcome', category: 'greetings', text: 'Welcome to Aelgard.' },
  { id: 'greet-gl',      category: 'greetings', text: 'Good luck out there.' },

  // ── Combat (10) ──────────────────────────────────────────────────────────
  { id: 'combat-food',     category: 'combat', text: 'I need food.' },
  { id: 'combat-praying',  category: 'combat', text: 'Praying now.' },
  { id: 'combat-runes',    category: 'combat', text: 'Out of runes.' },
  { id: 'combat-hp-low',   category: 'combat', text: 'HP getting low, careful.' },
  { id: 'combat-retreat',  category: 'combat', text: 'Retreating.' },
  { id: 'combat-flank',    category: 'combat', text: 'Flank from the side.' },
  { id: 'combat-stack',    category: 'combat', text: 'Stack on me.' },
  { id: 'combat-tanking',  category: 'combat', text: 'I will tank.' },
  { id: 'combat-dps',      category: 'combat', text: 'Switch to damage.' },
  { id: 'combat-res',      category: 'combat', text: 'Respawning, on my way back.' },

  // ── Skilling (8) ─────────────────────────────────────────────────────────
  { id: 'skill-train',     category: 'skilling', text: "Let's train skills together." },
  { id: 'skill-bank',      category: 'skilling', text: 'Banking first.' },
  { id: 'skill-mining',    category: 'skilling', text: "Let's mine here." },
  { id: 'skill-woodcut',   category: 'skilling', text: "Let's chop trees here." },
  { id: 'skill-fish',      category: 'skilling', text: "Let's fish here." },
  { id: 'skill-cook',      category: 'skilling', text: "Let's cook at the range." },
  { id: 'skill-craft',     category: 'skilling', text: "Let's craft together." },
  { id: 'skill-done',      category: 'skilling', text: 'Done with my inventory.' },

  // ── Trade (8) ────────────────────────────────────────────────────────────
  { id: 'trade-buy',       category: 'trade', text: 'Looking to buy.' },
  { id: 'trade-sell',      category: 'trade', text: 'Looking to sell.' },
  { id: 'trade-price',     category: 'trade', text: 'Fair price?' },
  { id: 'trade-highalch',  category: 'trade', text: 'Selling for high alch value.' },
  { id: 'trade-offer',     category: 'trade', text: 'Make me an offer.' },
  { id: 'trade-trading',   category: 'trade', text: "I'm at the Grand Exchange." },
  { id: 'trade-accept',    category: 'trade', text: 'Deal accepted.' },
  { id: 'trade-decline',   category: 'trade', text: 'Not interested, thanks.' },

  // ── Events (8) ───────────────────────────────────────────────────────────
  { id: 'event-boss',      category: 'events', text: 'Boss spawning now.' },
  { id: 'event-clue',      category: 'events', text: 'Clue dropped, want to join?' },
  { id: 'event-world-boss',category: 'events', text: 'World boss up, need help.' },
  { id: 'event-rare',      category: 'events', text: 'Rare event happening nearby.' },
  { id: 'event-raid',      category: 'events', text: 'Raid starting in 5 minutes.' },
  { id: 'event-minigame',  category: 'events', text: 'Minigame starting, need players.' },
  { id: 'event-tournament',category: 'events', text: 'Tournament sign-ups open.' },
  { id: 'event-ended',     category: 'events', text: 'Event ended, well played.' },

  // ── Quest (6) ────────────────────────────────────────────────────────────
  { id: 'quest-stuck',     category: 'quest', text: 'Stuck on this step.' },
  { id: 'quest-what',      category: 'quest', text: 'What should I do here?' },
  { id: 'quest-complete',  category: 'quest', text: 'Quest complete!' },
  { id: 'quest-start',     category: 'quest', text: 'Starting the quest now.' },
  { id: 'quest-help',      category: 'quest', text: 'Need help with a quest step.' },
  { id: 'quest-wiki',      category: 'quest', text: 'Checking the guide first.' },

  // ── Social (10) ──────────────────────────────────────────────────────────
  { id: 'social-yes',      category: 'social', text: 'Yes.' },
  { id: 'social-no',       category: 'social', text: 'No.' },
  { id: 'social-thanks',   category: 'social', text: 'Thanks!' },
  { id: 'social-gg',       category: 'social', text: 'GG.' },
  { id: 'social-brb',      category: 'social', text: 'BRB.' },
  { id: 'social-afk',      category: 'social', text: 'AFK for a bit.' },
  { id: 'social-nice',     category: 'social', text: 'Nice!' },
  { id: 'social-sorry',    category: 'social', text: 'Sorry about that.' },
  { id: 'social-lol',      category: 'social', text: 'Haha.' },
  { id: 'social-wp',       category: 'social', text: 'Well played.' },

  // ── Status (4) ───────────────────────────────────────────────────────────
  { id: 'status-lfg',      category: 'status', text: 'LFG.' },
  { id: 'status-busy',     category: 'status', text: 'Busy right now.' },
  { id: 'status-mentor',   category: 'status', text: 'Happy to mentor new players.' },
  { id: 'status-streaming',category: 'status', text: 'Streaming, say hi.' },

  // ── Navigation (4) ───────────────────────────────────────────────────────
  { id: 'nav-meet',        category: 'navigation', text: 'Meet me at the town square.' },
  { id: 'nav-tele',        category: 'navigation', text: 'Teleporting now.' },
  { id: 'nav-wait',        category: 'navigation', text: 'Wait up, please.' },
  { id: 'nav-follow',      category: 'navigation', text: 'Follow me.' },

  // ── Looking-For-Group (4) ────────────────────────────────────────────────
  { id: 'lfg-need-dps',    category: 'lfg', text: 'LFG: need damage.' },
  { id: 'lfg-need-tank',   category: 'lfg', text: 'LFG: need a tank.' },
  { id: 'lfg-need-healer', category: 'lfg', text: 'LFG: need a healer.' },
  { id: 'lfg-need-support',category: 'lfg', text: 'LFG: need support.' },

  // ── Grouping (4) ────────────────────────────────────────────────────────
  { id: 'group-form',      category: 'grouping', text: 'Forming a group now.' },
  { id: 'group-leave',     category: 'grouping', text: 'Leaving the group.' },
  { id: 'group-ready',     category: 'grouping', text: 'I am ready.' },
  { id: 'group-wait',      category: 'grouping', text: 'Hold on, not ready yet.' },
]);

// Fast lookups
const BY_ID = new Map(PRESETS.map(p => [p.id.toLowerCase(), p]));
const BY_CATEGORY = new Map();
for (const p of PRESETS) {
  if (!BY_CATEGORY.has(p.category)) BY_CATEGORY.set(p.category, []);
  BY_CATEGORY.get(p.category).push(p);
}

function presetById(id) {
  if (!id) return null;
  return BY_ID.get(String(id).toLowerCase()) || null;
}

function presetsByCategory(category) {
  if (!category) return [];
  return (BY_CATEGORY.get(category) || []).slice();
}

function listCategories() {
  return [...BY_CATEGORY.keys()];
}

function all() {
  return PRESETS.slice();
}

function search(query) {
  const q = String(query || '').toLowerCase().trim();
  if (!q) return [];
  return PRESETS.filter(p =>
    p.id.toLowerCase().includes(q) ||
    p.text.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q));
}

module.exports = {
  PRESETS,
  presetById,
  presetsByCategory,
  listCategories,
  all,
  search,
};
