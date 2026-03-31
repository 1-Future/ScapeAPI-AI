// ── Persistence Layer (0.4) ───────────────────────────────────────────────────
// Save/load game state as JSON files. Auto-save every 30s.

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const saveHandlers = []; // { id, fn }

function ensureDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function save(filename, data) {
  const filepath = path.join(DATA_DIR, filename);
  fs.mkdirSync(path.dirname(filepath), { recursive: true });
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

function load(filename, fallback = null) {
  const filepath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filepath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch (e) {
    console.error(`[persist] Error loading ${filename}:`, e.message);
    return fallback;
  }
}

function onSave(id, fn) {
  saveHandlers.push({ id, fn });
}

function saveAll() {
  for (const { id, fn } of saveHandlers) {
    try { fn(); } catch (e) { console.error(`[persist:${id}]`, e.message); }
  }
}

let autoSaveInterval = null;
function startAutoSave(ms = 30000) {
  if (autoSaveInterval) return;
  autoSaveInterval = setInterval(saveAll, ms);
}
function stopAutoSave() {
  if (autoSaveInterval) { clearInterval(autoSaveInterval); autoSaveInterval = null; }
}

module.exports = { save, load, onSave, saveAll, startAutoSave, stopAutoSave, DATA_DIR };
