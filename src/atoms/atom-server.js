// ══════════════════════════════════════════════════════════════════════════════
// ATOM SERVER BRIDGE — Connects the atom engine to the existing game server
// This module is called when the main command system returns {unknown: true}
// ══════════════════════════════════════════════════════════════════════════════

// Load all definitions on first require
let loaded = false;
let engine = null;

function ensureLoaded() {
  if (loaded) return;
  loaded = true;
  try {
    require('./definitions');
    const { GameEngine } = require('./engine');
    const { populateWorld } = require('./world-builder');
    engine = new GameEngine();
    populateWorld(engine);
    console.log('[atoms] Atom engine loaded with', require('./mechanic').list().length, 'mechanics');
  } catch (err) {
    console.error('[atoms] Failed to load atom engine:', err.message);
  }
}

/**
 * Handle a command that the main server didn't recognize.
 * @param {Object} player - the server's player object
 * @param {string} input - the raw command string
 * @returns {string[]|null} - array of messages, or null if not handled
 */
function handleCommand(player, input) {
  ensureLoaded();
  if (!engine) return null;

  const verb = input.trim().toLowerCase().split(/\s+/)[0];

  // Only handle commands the atom engine knows about
  const atomVerbs = [
    'mine','fish','chop','cook','smelt','smith','fletch','craft',
    'light','spin','tan','bury','pray',
    'eat','drink',
  ];

  if (!atomVerbs.includes(verb)) return null;

  // Sync server player state to atom player
  const atomPlayer = engine.getPlayer(player.name || player.displayName || 'Player');

  // Copy skills from server player to atom player
  if (player.skills) {
    for (const [skill, data] of Object.entries(player.skills)) {
      if (typeof data === 'object' && data.level !== undefined) {
        atomPlayer.skills[skill] = { level: data.level, xp: data.xp || 0 };
      }
    }
  }

  // Copy HP/PP
  atomPlayer.hp = player.hp || atomPlayer.hp;
  atomPlayer.maxHp = player.maxHp || atomPlayer.maxHp;
  atomPlayer.prayerPoints = player.prayerPoints || atomPlayer.prayerPoints;
  atomPlayer.x = player.x || 0;
  atomPlayer.y = player.y || 0;

  // Copy inventory
  if (player.inventory) {
    atomPlayer.inventory = [...player.inventory];
  }

  // Process the command
  const msgs = engine.processCommand(atomPlayer.name, input);

  // Sync atom player state back to server player
  if (player.inventory) {
    for (let i = 0; i < 28; i++) {
      player.inventory[i] = atomPlayer.inventory[i];
    }
  }
  player.hp = atomPlayer.hp;
  player.prayerPoints = atomPlayer.prayerPoints;

  // Copy XP gains back
  if (player.skills) {
    for (const [skill, data] of Object.entries(atomPlayer.skills)) {
      if (player.skills[skill]) {
        player.skills[skill].xp = data.xp;
        player.skills[skill].level = data.level;
      }
    }
  }

  return msgs.length > 0 ? msgs : null;
}

module.exports = { handleCommand };
