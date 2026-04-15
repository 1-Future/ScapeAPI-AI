// ── Runecrafting altar definitions ───────────────────────────────────────────
// Salvaged from ScapeAPI old fork (src/commands/all.js :: RC_ALTARS). Lifted
// into its own module so rune-crafting content — altars, tiara mapping,
// talisman binding — has a home outside the monolithic command file.
//
// Each altar specifies:
//   runeId, runeName  — what you get back per essence
//   level             — runecrafting level required
//   xp                — base xp per essence crafted
//   multiLevels       — cumulative-multiplier unlock levels (OSRS-accurate).
//                       The first entry is the base unlock; every subsequent
//                       level grants one more rune per essence.
//
// Source: ScapeAPI fork @ /src/commands/all.js :: RC_ALTARS
// -----------------------------------------------------------------------------

'use strict';

const RC_ALTARS = {
  air_altar:   { runeId: 270, runeName: 'Air rune',   level: 1,  xp: 5,   multiLevels: [1, 11, 22, 33, 44, 55, 66, 77, 88, 99] },
  water_altar: { runeId: 271, runeName: 'Water rune', level: 5,  xp: 6,   multiLevels: [5, 19, 38, 57, 76, 95] },
  earth_altar: { runeId: 272, runeName: 'Earth rune', level: 9,  xp: 6.5, multiLevels: [9, 26, 52, 78] },
  fire_altar:  { runeId: 273, runeName: 'Fire rune',  level: 14, xp: 7,   multiLevels: [14, 35, 70] },
};

// Compute rune multiplier for a given rc level at an altar. Mirrors the logic
// the old commands/all.js craftrunes handler used inline: walk multiLevels and
// subtract one so the base unlock gives 1x rather than 2x.
function runesPerEssence(altarId, rcLevel) {
  const altar = RC_ALTARS[altarId];
  if (!altar) return 0;
  if (rcLevel < altar.level) return 0;
  let multi = 1;
  for (const lvl of altar.multiLevels) {
    if (rcLevel >= lvl) multi++;
  }
  return Math.max(1, multi - 1);
}

function list() {
  return Object.entries(RC_ALTARS).map(([id, a]) => ({ id, ...a }));
}

module.exports = { RC_ALTARS, runesPerEssence, list };
