// ── Wall & Door System (2.5, 2.6) ────────────────────────────────────────────
// Per-tile edge bitmask. Walls block movement, doors can be opened/closed.

const persistence = require('../engine/persistence');

const EDGE = { N: 1, E: 2, S: 4, W: 8, DIAG_NE: 16, DIAG_NW: 32 };
const OPPOSITE = { [EDGE.N]: EDGE.S, [EDGE.S]: EDGE.N, [EDGE.E]: EDGE.W, [EDGE.W]: EDGE.E };

const wallEdges = new Map();  // "layer_x_y" → bitmask
const doorEdges = new Map();  // "layer_x_y" → bitmask
const openDoors = new Map();  // "layer_x_y" → bitmask (which edges are currently open)

function edgeKey(x, y, layer = 0) { return `${layer}_${x}_${y}`; }

function getWallEdge(x, y, layer = 0) { return wallEdges.get(edgeKey(x, y, layer)) || 0; }
function setWallEdge(x, y, mask, layer = 0) {
  const key = edgeKey(x, y, layer);
  if (mask === 0) wallEdges.delete(key);
  else wallEdges.set(key, mask);
}

function getDoorEdge(x, y, layer = 0) { return doorEdges.get(edgeKey(x, y, layer)) || 0; }
function setDoorEdge(x, y, mask, layer = 0) {
  const key = edgeKey(x, y, layer);
  if (mask === 0) doorEdges.delete(key);
  else doorEdges.set(key, mask);
}

function isDoorOpen(x, y, edge, layer = 0) {
  return ((openDoors.get(edgeKey(x, y, layer)) || 0) & edge) !== 0;
}

function toggleDoor(x, y, edge, layer = 0) {
  const key = edgeKey(x, y, layer);
  const current = openDoors.get(key) || 0;
  openDoors.set(key, current ^ edge);
  return (current ^ edge) & edge; // returns true if now open
}

// Check if movement from (fx,fy) to (tx,ty) is blocked by a wall or closed door
function isEdgeBlocked(fx, fy, tx, ty, layer = 0) {
  const dx = tx - fx, dy = ty - fy;
  let edge = 0;
  if (dy === -1 && dx === 0) edge = EDGE.N;
  else if (dy === 1 && dx === 0) edge = EDGE.S;
  else if (dx === 1 && dy === 0) edge = EDGE.E;
  else if (dx === -1 && dy === 0) edge = EDGE.W;
  else if (dx === 1 && dy === -1) edge = EDGE.DIAG_NE;
  else if (dx === -1 && dy === -1) edge = EDGE.DIAG_NW;
  else return false;

  // Check wall on source tile
  if ((getWallEdge(fx, fy, layer) & edge) && !isDoorOpen(fx, fy, edge, layer)) return true;

  // Check wall on destination tile (opposite direction)
  const opp = OPPOSITE[edge];
  if (opp && (getWallEdge(tx, ty, layer) & opp) && !isDoorOpen(tx, ty, opp, layer)) return true;

  // Diagonal movement: also check the two cardinal tiles we pass through
  if (Math.abs(dx) === 1 && Math.abs(dy) === 1) {
    // Check if blocked going through the two adjacent tiles
    const ex = dx === 1 ? EDGE.E : EDGE.W;
    const ey = dy === -1 ? EDGE.N : EDGE.S;
    if ((getWallEdge(fx, fy, layer) & ex) && !isDoorOpen(fx, fy, ex, layer)) return true;
    if ((getWallEdge(fx, fy, layer) & ey) && !isDoorOpen(fx, fy, ey, layer)) return true;
  }

  return false;
}

function saveWalls() {
  const walls = {}; for (const [k, v] of wallEdges) walls[k] = v;
  const doors = {}; for (const [k, v] of doorEdges) doors[k] = v;
  const open = {}; for (const [k, v] of openDoors) open[k] = v;
  persistence.save('walls.json', { walls, doors, open });
}

function loadWalls() {
  const data = persistence.load('walls.json', { walls: {}, doors: {}, open: {} });
  for (const [k, v] of Object.entries(data.walls || {})) wallEdges.set(k, v);
  for (const [k, v] of Object.entries(data.doors || {})) doorEdges.set(k, v);
  for (const [k, v] of Object.entries(data.open || {})) openDoors.set(k, v);
  console.log(`[walls] Loaded ${wallEdges.size} walls, ${doorEdges.size} doors`);
}

module.exports = {
  EDGE, getWallEdge, setWallEdge, getDoorEdge, setDoorEdge,
  isDoorOpen, toggleDoor, isEdgeBlocked,
  saveWalls, loadWalls,
};
