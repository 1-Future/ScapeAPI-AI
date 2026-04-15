// ── Boss compendium — short descriptions for the /boss command ────────────────
// Salvaged from ScapeAPI old fork (src/commands/all.js :: BOSS_INFO). Lifted
// out so new bosses — Jad, Zuk, Wyrm, etc. — can register an entry without
// growing the monolithic command file.
//
// Each entry:
//   defId   — npc defId the kill-count is tracked against
//   name    — display label
//   combat  — rough combat level (metadata only)
//   hp      — number or string (supports "100 each" for Barrows)
//   desc    — player-facing description of phases / mechanics / location
//
// Source: ScapeAPI fork @ /src/commands/all.js :: BOSS_INFO
// -----------------------------------------------------------------------------

'use strict';

const BOSS_INFO = {
  'king black dragon': {
    defId: 'king_black_dragon',
    name: 'King Black Dragon',
    combat: 276,
    hp: 255,
    desc: '3 phases (170/85 HP). Dragonfire every 5 ticks (10 dmg, anti-dragon shield reduces to 1). Location: KBD Lair (NE wilderness).',
  },
  'giant mole': {
    defId: 'giant_mole',
    name: 'Giant Mole',
    combat: 230,
    hp: 200,
    desc: 'Digs underground at 50% HP and teleports. Re-emerges after 5 ticks. Location: Mole Den (SW).',
  },
  'barrows': {
    defId: 'barrows',
    name: 'Barrows Brothers',
    combat: 115,
    hp: '100 each',
    desc: '6 brothers fought sequentially. Dharok: hits harder at low HP. Verac: hits through prayer. Guthan: heals on hit. Location: Barrows (E).',
  },
};

function get(name) {
  if (!name) return null;
  return BOSS_INFO[String(name).toLowerCase()] || null;
}

function list() {
  return Object.entries(BOSS_INFO).map(([key, b]) => ({ key, ...b }));
}

module.exports = { BOSS_INFO, get, list };
