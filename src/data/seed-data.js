// ── Farming seed data ─────────────────────────────────────────────────────────
// Salvaged from ScapeAPI old fork, where this was a SEED_DATA const embedded
// inside src/commands/all.js. Extracted to a standalone module so future
// farming expansion (more herbs, allotments, fruit trees, bushes) can live
// here without re-inlining into the monolithic command file.
//
// Shape matches the original inline table exactly — callers look up seeds by
// item id. stages is the number of growth stages before harvest.
//
// Source: ScapeAPI fork @ /src/commands/all.js :: SEED_DATA
// Port target: used by commands 'plant' and 'harvest'.
//
// To extend without breaking: add new entries with unique item ids and keep
// the { name, herbId, herbName, level, xp, stages } shape. Nothing here
// mutates state — the tables are const data.
// -----------------------------------------------------------------------------

'use strict';

const SEED_DATA = {
  // Herb seeds (grow in herb patches; produce grimy herbs)
  600: { name: 'guam',       herbId: 300, herbName: 'Grimy guam',       level: 9,  xp: 11,   stages: 4 },
  601: { name: 'marrentill', herbId: 301, herbName: 'Grimy marrentill', level: 14, xp: 13.5, stages: 4 },
  602: { name: 'ranarr',     herbId: 304, herbName: 'Grimy ranarr',     level: 32, xp: 26.5, stages: 4 },
};

// Helpful lookups for code that already had `SEED_DATA[itemId]` — export the
// same literal, plus a couple of convenience accessors.
function get(itemId)      { return SEED_DATA[itemId] || null; }
function has(itemId)      { return Object.prototype.hasOwnProperty.call(SEED_DATA, itemId); }
function list()           { return Object.keys(SEED_DATA).map((id) => ({ id: Number(id), ...SEED_DATA[id] })); }
function levelFor(itemId) { return SEED_DATA[itemId]?.level || null; }

module.exports = { SEED_DATA, get, has, list, levelFor };
