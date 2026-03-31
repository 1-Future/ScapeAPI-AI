// ── ScapeAI ────────────────────────────────────────────────────────────────────
// AI layer for ScapeAPI. Connects to the game, intercepts NPC dialogue,
// sends to Discord bot, streams response back. Can't break the game.
//
// Usage: node index.js
// Config: config.json (webhook URL, bot user ID, game URL)

const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));

const YELLOW = '\x1b[38;2;254;255;1m';
const CYAN = '\x1b[36m';
const DIM = '\x1b[2m';
const GREEN = '\x1b[32m';
const RESET = '\x1b[0m';

// ── Discord Webhook ───────────────────────────────────────────────────────────

async function sendToDiscord(prompt) {
  const res = await fetch(config.webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: prompt }),
  });
  if (!res.ok) console.error(`${DIM}[discord] Webhook error: ${res.status}${RESET}`);
  return res.ok;
}

// ── Discord Polling (reads bot responses back) ───────────────────────────────
// Same pattern as MiniScape/OpenScape. Polls channel every 3s, routes
// FUTURE BOT responses back to the player who asked.

const DISCORD_API = 'https://discord.com/api/v10';
let lastSeenMessageId = null;
let pendingNpcTalk = null; // { playerId, npcName, sendFn }
let pollTimer = null;

async function pollDiscordMessages() {
  const token = config.botToken || process.env.DISCORD_BOT_TOKEN;
  if (!token || !config.channelId) return;

  try {
    const url = lastSeenMessageId
      ? `${DISCORD_API}/channels/${config.channelId}/messages?after=${lastSeenMessageId}&limit=10`
      : `${DISCORD_API}/channels/${config.channelId}/messages?limit=1`;
    const res = await fetch(url, {
      headers: { 'Authorization': `Bot ${token}` }
    });
    if (!res.ok) {
      if (res.status !== 401) console.error(`[discord] Poll error: ${res.status}`);
      return;
    }
    const messages = await res.json();
    if (!Array.isArray(messages) || messages.length === 0) return;

    messages.reverse(); // oldest first

    // First poll: just record latest ID
    if (!lastSeenMessageId) {
      lastSeenMessageId = messages[messages.length - 1].id;
      console.log('[discord] Polling active');
      return;
    }

    for (const msg of messages) {
      lastSeenMessageId = msg.id;

      const text = (msg.content || '').trim().slice(0, 500);
      if (!text) continue;

      // Skip our own outgoing webhook messages (the prompts we send)
      // But don't skip bot responses — those could come via webhook OR bot user
      const isOurWebhook = msg.webhook_id && msg.author.id !== config.botUserId;
      if (isOurWebhook) continue;

      // Check if this is from FUTURE BOT (either as bot user or webhook)
      const isBot = msg.author.id === config.botUserId || msg.author.bot;

      if (isBot && pendingNpcTalk) {
        const { sendFn, npcName } = pendingNpcTalk;
        if (sendFn) sendFn(`${npcName}: "${text}"`);
        console.log(`[discord] AI response → ${npcName}: ${text.slice(0, 80)}`);
        pendingNpcTalk = null;
      } else if (isBot) {
        console.log(`[discord] Bot message (no pending talk): ${text.slice(0, 80)}`);
      }
    }
  } catch (e) {
    console.error('[discord] Poll error:', e.message);
  }
}

function startPolling() {
  if (pollTimer) return;
  const token = config.botToken || process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    console.log('[discord] No bot token — polling disabled. Set botToken in config.json or DISCORD_BOT_TOKEN env var.');
    return;
  }
  console.log('[discord] Starting message polling...');
  pollDiscordMessages();
  pollTimer = setInterval(pollDiscordMessages, config.pollInterval || 3000);
}

function stopPolling() {
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
}

function setPendingTalk(npcName, sendFn) {
  pendingNpcTalk = { npcName, sendFn };
}

// ── NPC Personality Templates ─────────────────────────────────────────────────

const PERSONALITIES = {
  // Default per NPC role
  shopkeeper: {
    traits: 'Friendly, merchant-minded, always trying to upsell',
    style: 'Mentions deals and prices casually in conversation',
  },
  guard: {
    traits: 'Stern, dutiful, suspicious of strangers',
    style: 'Short sentences, formal tone, references law and order',
  },
  farmer: {
    traits: 'Simple, hardworking, talks about weather and crops',
    style: 'Rural dialect, complains about pests and weather',
  },
  banker: {
    traits: 'Professional, careful, slightly condescending',
    style: 'Formal, mentions security and account safety',
  },
  quest_giver: {
    traits: 'Desperate, grateful, dramatic about their problem',
    style: 'Emphatic, begging for help, promises rewards',
  },
  warrior: {
    traits: 'Brave, boastful, loves combat stories',
    style: 'Loud, exclamation marks, talks about battles',
  },
  wizard: {
    traits: 'Mysterious, knowledgeable, speaks in riddles',
    style: 'Archaic language, references runes and magic',
  },
  general: {
    traits: 'Friendly, helpful, curious about adventurers',
    style: 'Casual, asks questions about the player\'s journey',
  },
};

// Per-NPC overrides (keyed by NPC defId)
const NPC_PROFILES = {
  hans: {
    personality: 'Friendly old man who walks around the castle. Loves welcoming new players. Knows how long everyone has been playing.',
    knowledge: 'Spawn island layout, basic game tips, player account age',
    role: 'general',
  },
  shopkeeper: {
    personality: 'Enthusiastic general store owner. Sells basic supplies. Thinks everything in the store is fascinating.',
    knowledge: 'General store stock, tool uses, beginner tips',
    role: 'shopkeeper',
  },
  cook: {
    personality: 'Stressed cook preparing for a birthday party. Needs ingredients desperately.',
    knowledge: 'Cook\'s Assistant quest, cooking recipes, kitchen location',
    role: 'quest_giver',
  },
  guard: {
    personality: 'Vigilant town guard. Patrols the area. Warns about dangers beyond town.',
    knowledge: 'Town safety, wilderness dangers, goblin activity',
    role: 'guard',
  },
  weapon_master: {
    personality: 'Grizzled veteran who now sells weapons. Has a story for every blade in the shop.',
    knowledge: 'Weapon stats, combat styles, training tips',
    role: 'warrior',
  },
  armour_seller: {
    personality: 'Proud armourer. Tests every piece personally. Thinks defence is more important than offence.',
    knowledge: 'Armour stats, defence training, equipment requirements',
    role: 'warrior',
  },
  aubury: {
    personality: 'Eccentric rune shop owner. Fascinated by magic. Knows the secret of runecrafting.',
    knowledge: 'Rune types, magic spells, Rune Mysteries quest, runecrafting altars',
    role: 'wizard',
  },
  slayer_master: {
    personality: 'No-nonsense slayer master. Assigns tasks bluntly. Respects only proven fighters.',
    knowledge: 'Monster weaknesses, slayer equipment, task rewards, slayer point shop',
    role: 'warrior',
  },
  banker: {
    personality: 'Efficient and slightly uptight. Manages everyone\'s valuables with obsessive care.',
    knowledge: 'Banking operations, item storage, security tips',
    role: 'banker',
  },
  fishing_tutor: {
    personality: 'Patient teacher who loves the water. Tells fishing stories that may or may not be true.',
    knowledge: 'Fishing spots, equipment, fish types, cooking tips',
    role: 'general',
  },
  mining_instructor: {
    personality: 'Enthusiastic about rocks. Gets excited about ore types. Covered in dust.',
    knowledge: 'Rock types, ore locations, pickaxe tiers, smithing basics',
    role: 'general',
  },
  tanner: {
    personality: 'Skilled craftsman. Smells of leather. Grumpy but fair.',
    knowledge: 'Leather crafting, cowhide processing, crafting skill',
    role: 'shopkeeper',
  },
  herbalist: {
    personality: 'Gentle, knowledgeable about plants. Slightly mysterious. Brew potions in the back.',
    knowledge: 'Herb types, potion recipes, farming patches, herblore training',
    role: 'wizard',
  },
};

// ── Prompt Builder ────────────────────────────────────────────────────────────

function buildPrompt(npcDefId, npcName, npcExamine, playerName, playerCombat, playerMessage, location, extra = {}) {
  const profile = NPC_PROFILES[npcDefId] || {};
  const roleKey = profile.role || 'general';
  const personality = PERSONALITIES[roleKey] || PERSONALITIES.general;

  const prompt = `[NPC: ${npcName} (${npcExamine}), near ${location}] ` +
    `${playerName} (combat ${playerCombat}) says: "${playerMessage}"\n` +
    `Personality: ${profile.personality || personality.traits}\n` +
    `Knowledge: ${profile.knowledge || 'General world knowledge'}\n` +
    `Respond in character as ${npcName}. Keep it short (1-2 sentences). Stay in Scape lore. Never break character.`;

  return prompt;
}

// ── Examine Text Generator ────────────────────────────────────────────────────

function buildExaminePrompt(entityType, name, properties) {
  return `Generate an examine text for a ${entityType} called "${name}" in an OSRS-style game.\n` +
    `Properties: ${JSON.stringify(properties)}\n` +
    `Style: Dry wit, puns welcome, 1 sentence max. Like OSRS examine texts.\n` +
    `Respond with ONLY the examine text, nothing else.`;
}

// ── Canned Fallbacks ──────────────────────────────────────────────────────────

const FALLBACK_DIALOGUES = {
  shopkeeper: [
    "Want to see my wares?",
    "I've got the best prices in town!",
    "Can I interest you in anything?",
  ],
  guard: [
    "Move along, citizen.",
    "Stay out of trouble.",
    "The town is safe under my watch.",
  ],
  farmer: [
    "The crops are growing well this season.",
    "Watch out for the chickens, they bite.",
    "Nothing like honest farm work.",
  ],
  banker: [
    "Your valuables are safe with us.",
    "Would you like to access your bank?",
    "We offer the finest security in the land.",
  ],
  general: [
    "Hello there, adventurer!",
    "Nice day for an adventure.",
    "Good luck out there!",
  ],
  warrior: [
    "Have you tested your blade lately?",
    "The wilderness is no place for the weak.",
    "Train hard, fight harder.",
  ],
  wizard: [
    "The runes hold many secrets...",
    "Magic flows through all things.",
    "Have you studied the ancient texts?",
  ],
  quest_giver: [
    "I could really use some help...",
    "Are you the adventurer I've heard about?",
    "Please, won't you help me?",
  ],
};

function getFallback(npcDefId) {
  const profile = NPC_PROFILES[npcDefId] || {};
  const roleKey = profile.role || 'general';
  const lines = FALLBACK_DIALOGUES[roleKey] || FALLBACK_DIALOGUES.general;
  return lines[Math.floor(Math.random() * lines.length)];
}

// ── Game Integration ──────────────────────────────────────────────────────────
// Connects to ScapeAPI as a service. Listens for AI-eligible events.

let gameWs = null;

function connectToGame() {
  console.log(`${DIM}[scape-ai] Connecting to ${config.gameUrl}...${RESET}`);
  gameWs = new WebSocket(config.gameUrl);

  gameWs.on('open', () => {
    console.log(`${GREEN}[scape-ai] Connected to ScapeAPI${RESET}`);
    // Login as AI service (not a player — just listens)
    gameWs.send('login ScapeAI');
  });

  gameWs.on('message', (data) => {
    const msg = JSON.parse(data);
    if (msg.text) {
      // Log game messages
      console.log(`${YELLOW}${msg.text}${RESET}`);
    }
  });

  gameWs.on('close', () => {
    console.log(`${DIM}[scape-ai] Disconnected. Reconnecting in 5s...${RESET}`);
    setTimeout(connectToGame, 5000);
  });

  gameWs.on('error', (e) => {
    console.error(`${DIM}[scape-ai] Connection error: ${e.message}${RESET}`);
  });
}

// ── Exports (for use as module) ───────────────────────────────────────────────

module.exports = {
  sendToDiscord,
  buildPrompt,
  buildExaminePrompt,
  getFallback,
  setPendingTalk,
  startPolling,
  stopPolling,
  NPC_PROFILES,
  PERSONALITIES,
  FALLBACK_DIALOGUES,
  config,
};

// ── CLI Mode ──────────────────────────────────────────────────────────────────

if (require.main === module) {
  console.log(`${GREEN}╔══════════════════════════════════╗${RESET}`);
  console.log(`${GREEN}║         ScapeAI v0.1.0           ║${RESET}`);
  console.log(`${GREEN}║  AI layer for ScapeAPI           ║${RESET}`);
  console.log(`${GREEN}╚══════════════════════════════════╝${RESET}`);
  console.log(`${DIM}Webhook: ${config.webhook.slice(0, 50)}...${RESET}`);
  console.log(`${DIM}Game: ${config.gameUrl}${RESET}`);
  console.log('');

  // Test: send a sample NPC prompt to Discord
  const testPrompt = buildPrompt('hans', 'Hans', 'A man walking around.', 'TestPlayer', 3, 'Hello!', 'Spawn Island');
  console.log(`${CYAN}Sample prompt:${RESET}`);
  console.log(testPrompt);
  console.log('');

  console.log(`${DIM}Sending test to Discord webhook...${RESET}`);
  sendToDiscord(testPrompt).then(ok => {
    if (ok) console.log(`${GREEN}Webhook working!${RESET}`);
    else console.log(`${DIM}Webhook failed — check config.json${RESET}`);

    // Connect to game
    connectToGame();
  });
}
