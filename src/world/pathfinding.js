// ── Pathfinding (2.4) ─────────────────────────────────────────────────────────
// A* pathfinding respecting walls, doors, and unwalkable tiles

const tiles = require('./tiles');
const walls = require('./walls');

const MAX_PATH = 200;

function findPath(sx, sy, tx, ty, layer = 0) {
  if (sx === tx && sy === ty) return [];
  if (!tiles.isWalkable(tx, ty, layer)) return null;

  const open = [{ x: sx, y: sy, g: 0, h: heuristic(sx, sy, tx, ty), parent: null }];
  const closed = new Set();
  closed.add(`${sx},${sy}`);

  const dirs = [
    { dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
    { dx: -1, dy: -1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: 1, dy: 1 },
  ];

  while (open.length > 0) {
    // Find lowest f
    let bestIdx = 0;
    for (let i = 1; i < open.length; i++) {
      if ((open[i].g + open[i].h) < (open[bestIdx].g + open[bestIdx].h)) bestIdx = i;
    }
    const current = open.splice(bestIdx, 1)[0];

    if (current.x === tx && current.y === ty) {
      // Reconstruct path
      const path = [];
      let node = current;
      while (node.parent) { path.unshift({ x: node.x, y: node.y }); node = node.parent; }
      return path;
    }

    if (current.g >= MAX_PATH) continue;

    for (const { dx, dy } of dirs) {
      const nx = current.x + dx, ny = current.y + dy;
      const key = `${nx},${ny}`;
      if (closed.has(key)) continue;
      if (!tiles.isWalkable(nx, ny, layer)) { closed.add(key); continue; }
      if (walls.isEdgeBlocked(current.x, current.y, nx, ny, layer)) { closed.add(key); continue; }

      // Diagonal: also check the two cardinal tiles
      if (Math.abs(dx) === 1 && Math.abs(dy) === 1) {
        if (!tiles.isWalkable(current.x + dx, current.y, layer) ||
            !tiles.isWalkable(current.x, current.y + dy, layer)) {
          closed.add(key); continue;
        }
      }

      closed.add(key);
      const g = current.g + (Math.abs(dx) + Math.abs(dy) === 2 ? 1.414 : 1);
      open.push({ x: nx, y: ny, g, h: heuristic(nx, ny, tx, ty), parent: current });
    }
  }

  return null; // No path found
}

function heuristic(x1, y1, x2, y2) {
  // Chebyshev distance (allows diagonal)
  return Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
}

// Find path to a tile adjacent to (tx, ty) rather than to (tx, ty) itself
function findAdjacentPath(sx, sy, tx, ty, layer = 0) {
  if (Math.abs(sx - tx) <= 1 && Math.abs(sy - ty) <= 1) return []; // Already adjacent
  const dirs = [
    { dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
    { dx: -1, dy: -1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: 1, dy: 1 },
  ];
  let best = null;
  for (const { dx, dy } of dirs) {
    const ax = tx + dx, ay = ty + dy;
    if (!tiles.isWalkable(ax, ay, layer)) continue;
    if (ax === sx && ay === sy) return []; // Already adjacent
    const path = findPath(sx, sy, ax, ay, layer);
    if (path && (!best || path.length < best.length)) best = path;
  }
  return best;
}

module.exports = { findPath, findAdjacentPath, MAX_PATH };
