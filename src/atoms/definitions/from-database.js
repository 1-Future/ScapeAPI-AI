// ══════════════════════════════════════════════════════════════════════════════
// MASS IMPORT: Convert all design doc plugins from PostgreSQL into atom defs
// This bridges the 13,580 database entries to runnable mechanic configs.
// ══════════════════════════════════════════════════════════════════════════════

const { define, list } = require('../mechanic');

// Map database categories to atom compositions
const CATEGORY_ATOMS = {
  combat: {
    atoms: { hitCheck: { maxHit: 1, style: 'melee' }, cooldown: { duration: 4 } },
    type: 'combat',
  },
  movement: {
    atoms: { cooldown: { duration: 1 } },
    type: 'movement',
  },
  defense: {
    atoms: { consume: {} },
    type: 'defense',
  },
  skills: {
    atoms: { periodicAction: { interval: 4, successRate: 0.9 }, xpDrop: { skills: {} } },
    type: 'skill',
  },
  economy: {
    atoms: { cooldown: { duration: 1 } },
    type: 'economy',
  },
  spawning: {
    atoms: { timer: { duration: 100 } },
    type: 'spawning',
  },
  targeting: {
    atoms: { cooldown: { duration: 1 } },
    type: 'targeting',
  },
  visual: {
    atoms: {},
    type: 'visual',
  },
  engine: {
    atoms: {},
    type: 'system',
  },
  atoms: {
    atoms: {},
    type: 'atom',
  },
};

/**
 * Import all mechanics from the database that don't have atom definitions yet.
 * Call this after requiring the database module.
 */
async function importFromDatabase(db) {
  // Get all mechanics that aren't already defined in code
  const existing = new Set(list().map(m => m.id));

  const rows = await db.queryAll(`
    SELECT id, name, description, category_id, render_tier, status
    FROM mechanics
    WHERE id NOT IN (${[...existing].map((_, i) => `$${i + 1}`).join(',')})
    ORDER BY category_id, name
    LIMIT 15000
  `, [...existing]);

  let count = 0;
  for (const row of rows) {
    const catConfig = CATEGORY_ATOMS[row.category_id] || CATEGORY_ATOMS.engine;

    define({
      id: row.id,
      name: row.name || row.id,
      type: catConfig.type,
      atoms: { ...catConfig.atoms },
      config: {
        description: row.description || '',
        dbCategory: row.category_id,
        renderTier: row.render_tier || 'text',
        status: row.status || 'not_implemented',
      }
    });
    count++;
  }

  console.log(`[defs] Database import: ${count} mechanics from PostgreSQL`);
  return count;
}

/**
 * Sync: import from DB without async (reads existing defs from file cache).
 * Used when DB isn't available — generates placeholder definitions.
 */
function importPlaceholders() {
  // Generate placeholder definitions for common plugin patterns
  const PLUGIN_PATTERNS = [
    // Skills - each skill has ~20 plugins
    ...['attack','strength','defence','ranged','magic','hitpoints','prayer',
        'runecraft','construction','agility','herblore','thieving','crafting',
        'fletching','slayer','hunter','mining','smithing','fishing','cooking',
        'firemaking','woodcutting','farming'].flatMap(skill => [
      { id: `sys-${skill}-xp-curve`, name: `${skill} XP Curve`, type: 'system' },
      { id: `sys-${skill}-milestones`, name: `${skill} Milestones`, type: 'system' },
      { id: `sys-${skill}-cape`, name: `${skill} Skill Cape`, type: 'equipment' },
      { id: `sys-${skill}-boost`, name: `${skill} Boost`, type: 'passive' },
      { id: `sys-${skill}-calc`, name: `${skill} Calculator`, type: 'system' },
      { id: `sys-${skill}-analytics`, name: `${skill} Analytics`, type: 'system' },
      { id: `sys-${skill}-tracker`, name: `${skill} XP Tracker`, type: 'system' },
    ]),
    // Equipment plugins per slot
    ...['head','cape','neck','weapon','body','shield','legs','gloves','boots','ring','ammo'].flatMap(slot => [
      { id: `sys-slot-${slot}-bonuses`, name: `${slot} Slot Bonuses`, type: 'system' },
      { id: `sys-slot-${slot}-reqs`, name: `${slot} Slot Requirements`, type: 'system' },
      { id: `sys-slot-${slot}-cosmetic`, name: `${slot} Slot Cosmetics`, type: 'system' },
    ]),
    // Boss plugins per boss type
    ...['phases','enrage','minions','safezone','loot-table','unique-drops',
        'instance-scaling','death-mechanic','respawn-timer','combat-diary'].map(feature => ({
      id: `sys-boss-${feature}`, name: `Boss ${feature.replace(/-/g, ' ')}`, type: 'system'
    })),
    // Minigame plugins
    ...['matchmaking','spectating','rewards-shop','seasonal-mode','team-balancing',
        'leaderboard','tutorial','practice-mode','hard-mode','collection-log'].map(feature => ({
      id: `sys-mini-${feature}`, name: `Minigame ${feature.replace(/-/g, ' ')}`, type: 'system'
    })),
    // Economy plugins
    ...['tax','price-floor','price-ceiling','buy-limit','anti-manipulation',
        'item-sink','alch-value','trade-history','flip-tracker','margin-calc'].map(feature => ({
      id: `sys-econ-${feature}`, name: `Economy ${feature.replace(/-/g, ' ')}`, type: 'system'
    })),
    // Social plugins
    ...['friends-list','ignore-list','clan-rank','clan-event','clan-citadel',
        'group-finder','mentoring','streaming','replay','screenshot'].map(feature => ({
      id: `sys-social-${feature}`, name: `Social ${feature.replace(/-/g, ' ')}`, type: 'system'
    })),
    // World plugins
    ...['chunk-loading','tile-rendering','wall-collision','door-state','npc-spawn',
        'object-interaction','ground-item','respawn-point','instance-create','area-effect'].map(feature => ({
      id: `sys-world-${feature}`, name: `World ${feature.replace(/-/g, ' ')}`, type: 'system'
    })),
    // Account plugins
    ...['profile','security','2fa','recovery','display-name','email-verify',
        'membership','play-time','login-streak','referral'].map(feature => ({
      id: `sys-account-${feature}`, name: `Account ${feature.replace(/-/g, ' ')}`, type: 'system'
    })),
    // Moderation plugins
    ...['report','mute','ban','appeal','chat-filter','profanity',
        'bot-detection','macro','rate-limit','quarantine'].map(feature => ({
      id: `sys-mod-${feature}`, name: `Moderation ${feature.replace(/-/g, ' ')}`, type: 'system'
    })),
  ];

  let count = 0;
  const existing = new Set(list().map(m => m.id));

  for (const p of PLUGIN_PATTERNS) {
    if (existing.has(p.id)) continue;
    define({
      id: p.id,
      name: p.name,
      type: p.type,
      atoms: {},
      config: { generated: true }
    });
    count++;
  }

  console.log(`[defs] Placeholder systems: ${count} system plugins`);
  return count;
}

// Auto-run placeholders on require
importPlaceholders();

module.exports = { importFromDatabase, importPlaceholders };
