// ── Plugin System (0.6) ───────────────────────────────────────────────────────
// Load game mechanics as pluggable modules

const fs = require('fs');
const path = require('path');

const loaded = new Map(); // id → { meta, api }
const PLUGINS_DIR = path.join(__dirname, '..', '..', 'plugins');

function loadPlugins(engine) {
  if (!fs.existsSync(PLUGINS_DIR)) return;
  const config = path.join(PLUGINS_DIR, 'plugins.json');
  let pluginList = [];
  if (fs.existsSync(config)) {
    pluginList = JSON.parse(fs.readFileSync(config, 'utf8')).plugins || [];
  } else {
    // Auto-discover
    const dirs = fs.readdirSync(PLUGINS_DIR, { withFileTypes: true });
    pluginList = dirs.filter(d => d.isDirectory()).map(d => d.name);
  }

  for (const id of pluginList) {
    const pluginPath = path.join(PLUGINS_DIR, id, 'index.js');
    if (!fs.existsSync(pluginPath)) continue;
    try {
      const plugin = require(pluginPath);
      // Check dependencies
      for (const dep of (plugin.meta?.depends || [])) {
        if (!loaded.has(dep)) throw new Error(`Missing dependency: ${dep}`);
      }
      if (plugin.init) plugin.init(engine);
      loaded.set(id, { meta: plugin.meta || { name: id }, api: plugin.api || {} });
      console.log(`[plugin] Loaded: ${plugin.meta?.name || id}`);
    } catch (e) {
      console.error(`[plugin] Error loading ${id}:`, e.message);
    }
  }
}

function getPlugin(id) {
  return loaded.get(id);
}

function listPlugins() {
  return [...loaded.entries()].map(([id, p]) => ({ id, name: p.meta.name }));
}

module.exports = { loadPlugins, getPlugin, listPlugins };
