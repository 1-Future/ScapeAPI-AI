// Simple game client — run with: node play.js
const WebSocket = require('ws');
const readline = require('readline');

const ws = new WebSocket('ws://localhost:2223');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout, prompt: '' });

const YELLOW = '\x1b[38;2;254;255;1m';
const RESET = '\x1b[0m';
const DIM = '\x1b[2m';
const BOLD = '\x1b[1m';

ws.on('open', () => {
  rl.prompt();
});

ws.on('message', (data) => {
  const msg = JSON.parse(data);
  if (msg.text) {
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);
    console.log(`${YELLOW}${msg.text}${RESET}`);
    rl.prompt();
  }
});

ws.on('close', () => {
  console.log(`${DIM}Disconnected.${RESET}`);
  process.exit();
});

ws.on('error', (e) => {
  console.error(`Connection failed: ${e.message}`);
  process.exit(1);
});

rl.on('line', (line) => {
  if (line.trim()) ws.send(line.trim());
  rl.prompt();
});

rl.on('close', () => {
  ws.close();
  process.exit();
});
