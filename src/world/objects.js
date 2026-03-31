// ── World Objects (3.9) ───────────────────────────────────────────────────────
// Interactable objects: trees, rocks, banks, furnaces, etc.

const persistence = require('../engine/persistence');

const objectDefs = new Map(); // defId → template
const objects = new Map(); // "layer_x_y" → object
let nextObjId = 1;

function defineObject(defId, opts) {
  objectDefs.set(defId, {
    name: opts.name || defId,
    examine: opts.examine || 'An object.',
    actions: opts.actions || [], // ['chop', 'examine']
    skill: opts.skill || null,
    levelReq: opts.levelReq || 0,
    xp: opts.xp || 0,
    ticks: opts.ticks || 4,
    product: opts.product || null, // { id, name, count }
    toolRequired: opts.toolRequired || null,
    depletionChance: opts.depletionChance || 0.5,
    respawnTicks: opts.respawnTicks || 20,
    depleted: false,
  });
}

function placeObject(defId, x, y, layer = 0) {
  const def = objectDefs.get(defId);
  if (!def) return null;
  const key = `${layer}_${x}_${y}`;
  const obj = { id: nextObjId++, defId, x, y, layer, ...def, depleted: false, respawnAt: 0 };
  objects.set(key, obj);
  return obj;
}

function getObjectAt(x, y, layer = 0) {
  return objects.get(`${layer}_${x}_${y}`) || null;
}

function getObjectsNear(x, y, range = 15, layer = 0) {
  const result = [];
  for (const obj of objects.values()) {
    if (obj.layer !== layer) continue;
    if (Math.abs(obj.x - x) <= range && Math.abs(obj.y - y) <= range) result.push(obj);
  }
  return result;
}

function findObjectByName(name, x, y, range = 15, layer = 0) {
  const lower = name.toLowerCase();
  for (const obj of objects.values()) {
    if (obj.layer !== layer || obj.depleted) continue;
    if (Math.abs(obj.x - x) > range || Math.abs(obj.y - y) > range) continue;
    if (obj.name.toLowerCase() === lower) return obj;
  }
  return null;
}

function objectTick(currentTick) {
  for (const obj of objects.values()) {
    if (obj.depleted && currentTick >= obj.respawnAt) {
      obj.depleted = false;
    }
  }
}

function saveObjects() {
  const data = [];
  for (const obj of objects.values()) {
    data.push({ defId: obj.defId, x: obj.x, y: obj.y, layer: obj.layer });
  }
  persistence.save('objects.json', data);
}

function loadObjects() {
  const data = persistence.load('objects.json', []);
  for (const o of data) placeObject(o.defId, o.x, o.y, o.layer);
  console.log(`[objects] Loaded ${data.length} objects`);
}

module.exports = {
  defineObject, placeObject, getObjectAt, getObjectsNear, findObjectByName,
  objectTick, objectDefs, objects,
  saveObjects, loadObjects,
};
