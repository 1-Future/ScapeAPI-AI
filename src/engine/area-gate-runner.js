// ══════════════════════════════════════════════════════════════════════════════
// Area Gate Runner — bridges relationship-registry area gates → engine
//
// Combines two registries:
//   - tiles.areas (engine-side bounding boxes from world-layout.js)
//   - rel.canAccessArea (relationship-side gate requirements)
//
// Public API:
//   canEnter(p, areaId) → { allowed, missing[] }   // pure check
//   enter(p, areaId)    → { ok, reason?, x, y }    // checks gate + teleports
//   listAccessible(p)   → [{ id, name }]           // areas the player can enter
//
// Sub-system #3 of the Engine Bridge (see ENGINE-BRIDGE-ROADMAP.md).
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const tiles = require('../world/tiles');
const player = require('../player/player');
const rel = require('../data/relationships');

// Adapter so canAccessArea can call player.getLevel(p, skill) — the registry
// expects this shape since it's content-layer agnostic.
function getLevel(p, skill) { return player.getLevel(p, skill); }

function canEnter(p, areaId) {
  return rel.canAccessArea(p, areaId, getLevel);
}

function entryPoint(areaId) {
  // Use the centroid of the area's bounding box from tiles.areas.
  // Falls back to null if the area isn't physically defined yet.
  const a = tiles.areas.get(areaId);
  if (!a) return null;
  return {
    x: Math.floor((a.x1 + a.x2) / 2),
    y: Math.floor((a.y1 + a.y2) / 2),
    layer: a.layer || 0,
  };
}

function enter(p, areaId) {
  const gate = rel.getAreaGate(areaId);
  if (!gate) return { ok: false, reason: `unknown area: ${areaId}` };

  const access = canEnter(p, areaId);
  if (!access.allowed) {
    return { ok: false, reason: `missing: ${access.missing.join(', ')}`, missing: access.missing };
  }

  const point = entryPoint(areaId);
  if (!point) return { ok: false, reason: `area "${areaId}" has no physical bounds defined` };

  // Consume any items marked consumed by the gate
  const inv = require('../player/player');
  for (const item of (gate.requires.items || [])) {
    if (item.consumed && item.id) inv.invRemove(p, item.id, 1);
  }

  p.x = point.x;
  p.y = point.y;
  p.layer = point.layer;
  p.path = [];
  return { ok: true, x: p.x, y: p.y, name: gate.name };
}

function listAccessible(p) {
  const out = [];
  for (const [areaId, gate] of rel.listAreaGates()) {
    const access = canEnter(p, areaId);
    if (access.allowed) out.push({ id: areaId, name: gate.name, region: gate.region });
  }
  return out;
}

function listAll(p) {
  // For the player: every gated area + whether they can enter it
  const out = [];
  for (const [areaId, gate] of rel.listAreaGates()) {
    const access = canEnter(p, areaId);
    out.push({ id: areaId, name: gate.name, region: gate.region, allowed: access.allowed, missing: access.missing });
  }
  return out;
}

module.exports = { canEnter, enter, entryPoint, listAccessible, listAll };
