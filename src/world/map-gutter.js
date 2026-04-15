// ── ASCII map gutter — column/row headers lifted from the old map command ────
// The ScapeAPI fork we branched from used a distinctive header/gutter style
// for the /map command that was dropped during the Inferno-aware rewrite:
//
//         v
//      >  @ . . T
//         . . . .
//
// The `v` marks the player column, the leading `>  ` marks the player row.
// It's a useful visual reference when the view gets large, but we don't want
// to force it on the current compact renderer. This module exposes a pure
// wrapper that decorates any 2D ASCII block with those gutters, so the
// /map command (or the spectator UI) can opt in via a flag.
//
// Source inspiration: ScapeAPI fork @ /src/commands/all.js :: generateMap()
// -----------------------------------------------------------------------------

'use strict';

// Add column header and row-gutter markers to an already-rendered ASCII grid.
// `grid` is the raw map string with newline row separators. `rx`/`ry` are
// the radii (grid is 2*rx+1 cols by 2*ry+1 rows). If `rx`/`ry` are omitted
// we infer them from the grid itself.
//
// Returns the decorated string. Pure, no mutation.
function applyGutter(grid, rx, ry) {
  if (typeof grid !== 'string' || !grid.length) return grid;
  const lines = grid.split('\n');
  // Drop trailing empty lines so we don't put a gutter on them.
  while (lines.length && lines[lines.length - 1] === '') lines.pop();
  if (!lines.length) return grid;

  // Infer radii from the shape if missing.
  const inferredRx = Math.floor(lines[0].length / 2);
  const inferredRy = Math.floor(lines.length / 2);
  const RX = Number.isFinite(rx) ? rx : inferredRx;
  const RY = Number.isFinite(ry) ? ry : inferredRy;

  // Header row: spaces + `v` over the player column.
  let header = '    ';
  for (let dx = -RX; dx <= RX; dx++) {
    header += (dx === 0) ? 'v' : ' ';
  }
  const out = [header];

  for (let dy = -RY, i = 0; i < lines.length; i++, dy++) {
    const marker = (dy === 0) ? ' > ' : '   ';
    out.push(marker + ' ' + lines[i]);
  }

  return out.join('\n');
}

// Build just the header string (useful when a caller already has its own row
// loop and wants to prepend the column marker).
function columnHeader(rx) {
  let h = '    ';
  for (let dx = -rx; dx <= rx; dx++) h += (dx === 0) ? 'v' : ' ';
  return h;
}

function rowPrefix(dy) {
  return (dy === 0) ? ' > ' : '   ';
}

module.exports = { applyGutter, columnHeader, rowPrefix };
