// ══════════════════════════════════════════════════════════════════════════════
// Farming Skill — Patches, growth cycles, herb runs
//
// Farming is unique: it's TIME-GATED, not attention-gated.
// You plant, wait real time (or game ticks), then harvest.
// The "herb run" loop (plant at all patches, wait, harvest, replant) is one of
// the most beloved mechanics in OSRS — perfectly suited to mobile/AFK play.
//
// Design Knobs (P13):
//   XP/hr: LOW absolute (you can only harvest when grown), but HIGH XP/action
//   Attention: Multitask (5 min herb run every 80 min)
//   Cost: Seeds + compost (medium)
//   Unique value: Only reliable source of herbs for Herblore
//
// Manifesto P08: Breakpoints at 32 (ranarr), 62 (snapdragon), 73 (torstol)
// Manifesto P15: Iron Man farming is the herblore supply chain — critical
// ══════════════════════════════════════════════════════════════════════════════

const { xpToLevel } = require('./gathering');
const tick = require('../engine/tick');

// ── Patch types ────────────────────────────────────────────────────────────

const patches = new Map(); // patchId → patch state
const patchDefs = new Map(); // patchDefId → definition
const seedDefs = new Map(); // seedId → seed definition

function defineSeed(opts) {
  seedDefs.set(opts.seedId, {
    seedId: opts.seedId,
    seedName: opts.seedName,
    patchType: opts.patchType, // 'herb', 'allotment', 'tree'
    level: opts.level,
    plantXp: opts.plantXp,
    harvestXp: opts.harvestXp,
    productId: opts.productId,
    productName: opts.productName,
    minYield: opts.minYield || 3,
    maxYield: opts.maxYield || 12,
    growthTicks: opts.growthTicks, // ticks to fully grow
    diseaseChance: opts.diseaseChance || 0.10, // per growth stage
  });
}

function createPatch(patchId, patchType, region) {
  patches.set(patchId, {
    id: patchId,
    type: patchType,
    region,
    seedId: null,
    plantedAt: 0,
    growthStage: 0,
    maxGrowthStage: 4,
    diseased: false,
    dead: false,
    composted: false,
    supercomposted: false,
    harvestsRemaining: 0,
    owner: null,
  });
}

function getPatch(patchId) { return patches.get(patchId); }
function listPatches(region) {
  if (!region) return [...patches.values()];
  return [...patches.values()].filter(p => p.region === region);
}

// ── Plant a seed ───────────────────────────────────────────────────────────

function plant(player, patchId, seedId) {
  const patch = patches.get(patchId);
  if (!patch) return { error: 'unknown_patch' };
  if (patch.seedId) return { error: 'patch_occupied' };

  const seed = seedDefs.get(seedId);
  if (!seed) return { error: 'unknown_seed' };
  if (seed.patchType !== patch.type) return { error: 'wrong_patch_type' };

  const level = player.skills?.farming?.level || 1;
  if (level < seed.level) return { error: 'level_too_low', required: seed.level };

  // Consume seed from inventory
  const seedSlot = player.inventory.findIndex(s => s && s.id === seedId);
  if (seedSlot < 0) return { error: 'no_seed' };

  if (player.inventory[seedSlot].count > 1) {
    player.inventory[seedSlot].count--;
  } else {
    player.inventory[seedSlot] = null;
  }

  // Plant
  patch.seedId = seedId;
  patch.plantedAt = tick.getTick();
  patch.growthStage = 0;
  patch.maxGrowthStage = 4;
  patch.diseased = false;
  patch.dead = false;
  patch.harvestsRemaining = 0;
  patch.owner = player.name;

  // Grant plant XP
  if (!player.skills.farming) player.skills.farming = { level: 1, xp: 0 };
  player.skills.farming.xp += seed.plantXp;
  const newLevel = xpToLevel(player.skills.farming.xp);
  if (newLevel > player.skills.farming.level) player.skills.farming.level = newLevel;

  return { success: true, seed: seed.seedName, xp: seed.plantXp, growthTicks: seed.growthTicks };
}

// ── Check growth (called periodically or on inspect) ──────────────────────

function updateGrowth(patchId) {
  const patch = patches.get(patchId);
  if (!patch || !patch.seedId) return;
  if (patch.dead) return;

  const seed = seedDefs.get(patch.seedId);
  if (!seed) return;

  const currentTick = tick.getTick();
  const ticksSincePlant = currentTick - patch.plantedAt;
  const ticksPerStage = seed.growthTicks / patch.maxGrowthStage;
  const expectedStage = Math.min(patch.maxGrowthStage, Math.floor(ticksSincePlant / ticksPerStage));

  // Advance growth stages, checking disease at each
  while (patch.growthStage < expectedStage) {
    patch.growthStage++;
    if (!patch.diseased && !patch.dead) {
      let diseaseChance = seed.diseaseChance;
      if (patch.composted) diseaseChance *= 0.5;
      if (patch.supercomposted) diseaseChance *= 0.2;
      if (Math.random() < diseaseChance) {
        patch.diseased = true;
      }
    }
  }

  // Disease kills the crop after one more stage
  if (patch.diseased && patch.growthStage >= 2) {
    patch.dead = true;
  }

  // Fully grown — set harvests
  if (patch.growthStage >= patch.maxGrowthStage && !patch.dead && !patch.diseased) {
    if (patch.harvestsRemaining === 0) {
      const minY = seed.minYield + (patch.supercomposted ? 2 : patch.composted ? 1 : 0);
      patch.harvestsRemaining = minY + Math.floor(Math.random() * (seed.maxYield - minY + 1));
    }
  }
}

// ── Harvest ────────────────────────────────────────────────────────────────

function harvest(player, patchId) {
  const patch = patches.get(patchId);
  if (!patch || !patch.seedId) return { error: 'nothing_planted' };

  updateGrowth(patchId);

  if (patch.dead) {
    // Clear dead patch
    patch.seedId = null;
    return { error: 'crop_dead' };
  }
  if (patch.diseased) return { error: 'crop_diseased', hint: 'Use cure disease spell or compost' };
  if (patch.growthStage < patch.maxGrowthStage) {
    const seed = seedDefs.get(patch.seedId);
    const ticksRemaining = seed ? seed.growthTicks - (tick.getTick() - patch.plantedAt) : 0;
    return { error: 'not_grown', ticksRemaining: Math.max(0, ticksRemaining), stage: patch.growthStage, maxStage: patch.maxGrowthStage };
  }
  if (patch.harvestsRemaining <= 0) return { error: 'already_harvested' };

  const seed = seedDefs.get(patch.seedId);
  const freeSlot = player.inventory.findIndex(s => s === null);
  if (freeSlot < 0) return { error: 'inventory_full' };

  // Harvest one
  player.inventory[freeSlot] = { id: seed.productId, name: seed.productName, count: 1 };
  patch.harvestsRemaining--;

  // Grant XP
  if (!player.skills.farming) player.skills.farming = { level: 1, xp: 0 };
  player.skills.farming.xp += seed.harvestXp;
  const newLevel = xpToLevel(player.skills.farming.xp);
  if (newLevel > player.skills.farming.level) player.skills.farming.level = newLevel;

  // Clear patch when done
  if (patch.harvestsRemaining <= 0) {
    patch.seedId = null;
  }

  return {
    success: true,
    product: seed.productName,
    xp: seed.harvestXp,
    remaining: patch.harvestsRemaining,
    level: player.skills.farming.level,
  };
}

// ── Compost ────────────────────────────────────────────────────────────────

function compost(player, patchId, supercompost) {
  const patch = patches.get(patchId);
  if (!patch) return { error: 'unknown_patch' };
  if (patch.seedId) return { error: 'already_planted' };
  if (supercompost) {
    patch.supercomposted = true;
    patch.composted = false;
  } else {
    patch.composted = true;
    patch.supercomposted = false;
  }
  return { success: true, type: supercompost ? 'supercompost' : 'compost' };
}

// ══════════════════════════════════════════════════════════════════════════════
// SEED DEFINITIONS
// ══════════════════════════════════════════════════════════════════════════════

// Herb seeds — the core farming loop
defineSeed({ seedId: 12410, seedName: 'Guam seed', patchType: 'herb', level: 9, plantXp: 11, harvestXp: 12.5, productId: 12001, productName: 'Grimy guam', growthTicks: 1200, minYield: 3, maxYield: 12 });
defineSeed({ seedId: 12411, seedName: 'Marrentill seed', patchType: 'herb', level: 14, plantXp: 13.5, harvestXp: 15, productId: 12002, productName: 'Grimy marrentill', growthTicks: 1200, minYield: 3, maxYield: 12 });
defineSeed({ seedId: 12412, seedName: 'Tarromin seed', patchType: 'herb', level: 19, plantXp: 16, harvestXp: 18, productId: 12003, productName: 'Grimy tarromin', growthTicks: 1200, minYield: 3, maxYield: 12 });
defineSeed({ seedId: 12413, seedName: 'Harralander seed', patchType: 'herb', level: 26, plantXp: 21.5, harvestXp: 24, productId: 12004, productName: 'Grimy harralander', growthTicks: 1200, minYield: 3, maxYield: 12 });
defineSeed({ seedId: 12414, seedName: 'Ranarr seed', patchType: 'herb', level: 32, plantXp: 27, harvestXp: 30.5, productId: 12005, productName: 'Grimy ranarr', growthTicks: 1200, minYield: 3, maxYield: 10, diseaseChance: 0.12 });
defineSeed({ seedId: 12415, seedName: 'Snapdragon seed', patchType: 'herb', level: 62, plantXp: 87.5, harvestXp: 98.5, productId: 12009, productName: 'Grimy snapdragon', growthTicks: 1200, minYield: 3, maxYield: 9, diseaseChance: 0.15 });
defineSeed({ seedId: 12416, seedName: 'Torstol seed', patchType: 'herb', level: 73, plantXp: 100, harvestXp: 120, productId: 12013, productName: 'Grimy torstol', growthTicks: 1200, minYield: 3, maxYield: 8, diseaseChance: 0.18 });

// Allotment seeds
defineSeed({ seedId: 12401, seedName: 'Potato seed', patchType: 'allotment', level: 1, plantXp: 8, harvestXp: 9, productId: 14101, productName: 'Potato', growthTicks: 600, minYield: 3, maxYield: 10 });
defineSeed({ seedId: 12406, seedName: 'Strawberry seed', patchType: 'allotment', level: 31, plantXp: 26, harvestXp: 29, productId: 14102, productName: 'Strawberry', growthTicks: 900, minYield: 3, maxYield: 10 });
defineSeed({ seedId: 12407, seedName: 'Watermelon seed', patchType: 'allotment', level: 47, plantXp: 48.5, harvestXp: 54.5, productId: 14103, productName: 'Watermelon', growthTicks: 1200, minYield: 3, maxYield: 10 });

// Farming produce items
const items = require('../data/items');
items.define({ id: 14101, name: 'Potato', examine: 'A freshly harvested potato.', value: 5, category: 'food', weight: 0.3 });
items.define({ id: 14102, name: 'Strawberry', examine: 'A juicy strawberry.', value: 15, category: 'food', weight: 0.1 });
items.define({ id: 14103, name: 'Watermelon', examine: 'A ripe watermelon.', value: 40, category: 'food', weight: 1 });

// ══════════════════════════════════════════════════════════════════════════════
// CREATE PATCHES — one herb patch per region, allotments in Heartlands/Veilwood
// ══════════════════════════════════════════════════════════════════════════════

// Herb patches (the core loop — 7 patches = 7 herbs per run)
createPatch('herb_heartlands', 'herb', 'Heartlands');
createPatch('herb_veilwood', 'herb', 'Veilwood');
createPatch('herb_saltbrine', 'herb', 'Saltbrine');
createPatch('herb_sootworks', 'herb', 'Sootworks');
createPatch('herb_moryskah', 'herb', 'Moryskah');
createPatch('herb_boneyard', 'herb', 'Boneyard');
createPatch('herb_glass_desert', 'herb', 'Glass Desert');

// Allotment patches
createPatch('allotment_heartlands_1', 'allotment', 'Heartlands');
createPatch('allotment_heartlands_2', 'allotment', 'Heartlands');
createPatch('allotment_veilwood_1', 'allotment', 'Veilwood');
createPatch('allotment_veilwood_2', 'allotment', 'Veilwood');

module.exports = {
  defineSeed, createPatch, getPatch, listPatches,
  plant, harvest, compost, updateGrowth,
  seedDefs, patches,
};
