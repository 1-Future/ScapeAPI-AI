// ══════════════════════════════════════════════════════════════════════════════
// Firemaking — Burn logs, bonfires, light sources
//
// Design Knobs (P13):
//   Log burning: 40-200k XP/hr, Background/Multitask, free, consumes logs
//   Bonfires: +50% XP but requires multiple players nearby (social)
//   Wintertodt-style: Active, high XP, rewards, group content
//
// Manifesto P04: Non-degenerate — FM provides light sources for dark areas,
//   bonfire HP boost, and is the only way to dispose of low-value logs profitably
// Manifesto P08: Breakpoints at 50 (bonfire boost), 85 (infernal axe usage)
// ══════════════════════════════════════════════════════════════════════════════

const { xpToLevel } = require('./gathering');

const logDefs = new Map();

function defineLog(opts) {
  logDefs.set(opts.logId, {
    logId: opts.logId,
    logName: opts.logName,
    level: opts.level,
    xp: opts.xp,
    burnTicks: opts.burnTicks || 4,
    lightLevel: opts.lightLevel || 1, // how much light the fire provides
    colour: opts.colour || 'orange',
  });
}

function getLog(logId) { return logDefs.get(logId); }

function burnLog(player, logId) {
  const def = logDefs.get(logId);
  if (!def) return { error: 'unknown_log' };

  const level = player.skills?.firemaking?.level || 1;
  if (level < def.level) return { error: 'level_too_low', required: def.level };

  // Check for log in inventory
  const slot = player.inventory.findIndex(s => s && s.id === logId);
  if (slot < 0) return { error: 'no_logs' };

  // Check for tinderbox
  const hasTinderbox = player.inventory.some(s => s && s.name === 'Tinderbox') ||
                       player.equipment?.weapon?.name === 'Tinderbox';
  if (!hasTinderbox) return { error: 'no_tinderbox' };

  // Consume log
  if (player.inventory[slot].count > 1) {
    player.inventory[slot].count--;
  } else {
    player.inventory[slot] = null;
  }

  // Grant XP
  if (!player.skills.firemaking) player.skills.firemaking = { level: 1, xp: 0 };
  player.skills.firemaking.xp += def.xp;
  const newLevel = xpToLevel(player.skills.firemaking.xp);
  if (newLevel > player.skills.firemaking.level) player.skills.firemaking.level = newLevel;

  return {
    success: true,
    log: def.logName,
    xp: def.xp,
    level: player.skills.firemaking.level,
  };
}

// ── Log definitions ────────────────────────────────────────────────────────

defineLog({ logId: 2201, logName: 'Logs', level: 1, xp: 40, burnTicks: 4 });
defineLog({ logId: 2202, logName: 'Oak logs', level: 15, xp: 60, burnTicks: 4 });
defineLog({ logId: 2203, logName: 'Willow logs', level: 30, xp: 90, burnTicks: 4 });
defineLog({ logId: 2204, logName: 'Maple logs', level: 45, xp: 135, burnTicks: 4 });
defineLog({ logId: 2205, logName: 'Yew logs', level: 60, xp: 202.5, burnTicks: 5 });
defineLog({ logId: 2206, logName: 'Magic logs', level: 75, xp: 303.8, burnTicks: 5 });
defineLog({ logId: 13101, logName: 'Stormwood log', level: 50, xp: 180, burnTicks: 3, lightLevel: 3, colour: 'blue' });

module.exports = { defineLog, getLog, burnLog, logDefs };
