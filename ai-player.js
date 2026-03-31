// AI Player — connects to the game and plays via Claude
// Usage: ANTHROPIC_API_KEY=sk-... node ai-player.js [name]
//    or: set key in .env file

const WebSocket = require('ws');

const API_KEY = process.env.ANTHROPIC_API_KEY;
const PLAYER_NAME = process.argv[2] || 'Claude';
const GAME_URL = process.env.GAME_URL || 'ws://localhost:2223';
const MODEL = process.env.MODEL || 'claude-sonnet-4-6';

if (!API_KEY) {
  console.error('Set ANTHROPIC_API_KEY environment variable.');
  console.error('  Windows:  set ANTHROPIC_API_KEY=sk-ant-...');
  console.error('  Linux:    export ANTHROPIC_API_KEY=sk-ant-...');
  process.exit(1);
}

const YELLOW = '\x1b[38;2;254;255;1m';
const CYAN = '\x1b[36m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

// Game state buffer — collect messages between AI turns
let messageBuffer = [];
let thinking = false;
let turnCount = 0;

const SYSTEM_PROMPT = `You are playing a text-based MMORPG called OpenScape. You control a character by typing commands.

IMPORTANT RULES:
- Respond with ONLY a single game command. Nothing else. No explanations, no quotes, no markdown.
- Valid commands include: look, n, s, e, w, ne, nw, se, sw, goto [x] [y], attack [npc], chop, mine, fish, cook [item], skills, inv, equip [item], eat [item], talk [npc], shop, buy [slot], nearby, map, status, help
- Explore the world, fight monsters, gather resources, level up skills
- When you see loot on the ground, pick it up with: pickup [item name]
- Check your surroundings frequently with: look or nearby
- If your HP is low, eat food or retreat
- Try to make progress — don't just stand around
- Play like a real player would: explore, train, quest

You are ${PLAYER_NAME}. Play the game.`;

async function askClaude(gameText) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 50,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: `Game output:\n${gameText}\n\nWhat command do you type?` }
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.content[0].text.trim().split('\n')[0].trim(); // First line only
}

// Connect to game
const ws = new WebSocket(GAME_URL);

ws.on('open', () => {
  console.log(`${DIM}Connected to ${GAME_URL}${RESET}`);
  ws.send(`login ${PLAYER_NAME}`);
});

ws.on('message', async (data) => {
  const msg = JSON.parse(data);
  if (!msg.text) return;

  // Display game output
  console.log(`${YELLOW}${msg.text}${RESET}`);
  messageBuffer.push(msg.text);

  // Don't interrupt if AI is already thinking
  if (thinking) return;

  // Wait a beat for multiple messages to arrive, then think
  clearTimeout(ws._thinkTimer);
  ws._thinkTimer = setTimeout(async () => {
    if (messageBuffer.length === 0) return;

    const fullText = messageBuffer.join('\n');
    messageBuffer = [];
    thinking = true;
    turnCount++;

    try {
      console.log(`${DIM}[AI thinking...]${RESET}`);
      const command = await askClaude(fullText);
      console.log(`${CYAN}> ${command}${RESET}`);
      ws.send(command);
    } catch (e) {
      console.error(`${DIM}[AI error: ${e.message}]${RESET}`);
    } finally {
      thinking = false;
    }
  }, 1500); // Wait 1.5s for messages to settle before AI responds
});

ws.on('close', () => {
  console.log(`${DIM}Disconnected.${RESET}`);
  process.exit();
});

ws.on('error', (e) => {
  console.error(`Connection error: ${e.message}`);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => { ws.close(); process.exit(); });
