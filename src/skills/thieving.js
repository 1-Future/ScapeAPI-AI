// ══════════════════════════════════════════════════════════════════════════════
// Thieving Skill — Pickpocket NPCs, steal from stalls
//
// Design Knobs (P13):
//   Pickpocketing: 20-80k XP/hr depending on target, Active attention,
//   moderate GP output, stun-on-fail, no prerequisites beyond level
//   Stall theft: 15-40k XP/hr, Multitask attention, items as output
//
// Manifesto P04: Non-degenerate — each target gives unique loot
// Manifesto P02: Attention spans Multitask (stalls) to Active (pickpocket)
// ══════════════════════════════════════════════════════════════════════════════

const { xpToLevel } = require('./gathering');

const targets = new Map();

function defineTarget(opts) {
  targets.set(opts.id, {
    id: opts.id,
    name: opts.name,
    type: opts.type, // 'pickpocket' or 'stall'
    level: opts.level,
    xp: opts.xp,
    stunDamage: opts.stunDamage || 1,
    stunTicks: opts.stunTicks || 5,
    successBase: opts.successBase || 0.5, // base success rate at level
    loot: opts.loot, // [{ id, name, min, max, weight }]
  });
}

function getTarget(id) { return targets.get(id); }
function listTargets(type) {
  if (!type) return [...targets.values()];
  return [...targets.values()].filter(t => t.type === type);
}

function attemptTheft(player, targetId) {
  const target = targets.get(targetId);
  if (!target) return { error: 'unknown_target' };

  const level = player.skills?.thieving?.level || 1;
  if (level < target.level) return { error: 'level_too_low', required: target.level };

  // Stun cooldown
  if (player._stunUntil && player._stunUntil > Date.now()) {
    return { error: 'stunned', remaining: Math.ceil((player._stunUntil - Date.now()) / 600) };
  }

  // Success rate scales with level above requirement
  const levelAbove = level - target.level;
  const chance = Math.min(0.95, target.successBase + levelAbove * 0.02);

  if (Math.random() >= chance) {
    // Failed — stunned
    player.hp = Math.max(1, player.hp - target.stunDamage);
    player._stunUntil = Date.now() + target.stunTicks * 600;
    return { success: false, stunDamage: target.stunDamage, stunTicks: target.stunTicks };
  }

  // Success — roll loot
  if (!player.skills.thieving) player.skills.thieving = { level: 1, xp: 0 };
  player.skills.thieving.xp += target.xp;
  const newLevel = xpToLevel(player.skills.thieving.xp);
  if (newLevel > player.skills.thieving.level) player.skills.thieving.level = newLevel;

  let lootItem = null;
  if (target.loot && target.loot.length > 0) {
    const totalWeight = target.loot.reduce((s, l) => s + l.weight, 0);
    let roll = Math.random() * totalWeight;
    for (const l of target.loot) {
      roll -= l.weight;
      if (roll <= 0) {
        const count = l.min + Math.floor(Math.random() * (l.max - l.min + 1));
        lootItem = { id: l.id, name: l.name, count };
        break;
      }
    }
  }

  return {
    success: true,
    xp: target.xp,
    loot: lootItem,
    level: player.skills.thieving.level,
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// TARGETS
// ══════════════════════════════════════════════════════════════════════════════

// Pickpocket NPCs
defineTarget({ id: 'pp_man', name: 'Man/Woman', type: 'pickpocket', level: 1, xp: 8, stunDamage: 1, stunTicks: 5, successBase: 0.55,
  loot: [{ id: 101, name: 'Coins', min: 3, max: 10, weight: 1 }] });
defineTarget({ id: 'pp_farmer', name: 'Farmer', type: 'pickpocket', level: 10, xp: 14.5, stunDamage: 1, stunTicks: 5, successBase: 0.50,
  loot: [{ id: 101, name: 'Coins', min: 5, max: 15, weight: 5 }, { id: 12410, name: 'Guam seed', min: 1, max: 1, weight: 3 }, { id: 12411, name: 'Marrentill seed', min: 1, max: 1, weight: 2 }] });
defineTarget({ id: 'pp_warrior', name: 'Warrior', type: 'pickpocket', level: 25, xp: 26, stunDamage: 2, stunTicks: 5, successBase: 0.45,
  loot: [{ id: 101, name: 'Coins', min: 10, max: 40, weight: 1 }] });
defineTarget({ id: 'pp_guard', name: 'Guard', type: 'pickpocket', level: 40, xp: 46.8, stunDamage: 2, stunTicks: 5, successBase: 0.40,
  loot: [{ id: 101, name: 'Coins', min: 20, max: 60, weight: 1 }] });
defineTarget({ id: 'pp_knight', name: 'Knight', type: 'pickpocket', level: 55, xp: 84.3, stunDamage: 3, stunTicks: 6, successBase: 0.40,
  loot: [{ id: 101, name: 'Coins', min: 30, max: 100, weight: 1 }] });
defineTarget({ id: 'pp_vampyre', name: 'Vampyre Juvenile', type: 'pickpocket', level: 45, xp: 60, stunDamage: 3, stunTicks: 6, successBase: 0.38,
  loot: [{ id: 5001, name: 'Vial of blood', min: 1, max: 2, weight: 3 }, { id: 101, name: 'Coins', min: 20, max: 80, weight: 5 }] });
defineTarget({ id: 'pp_elf', name: 'Elf', type: 'pickpocket', level: 65, xp: 120, stunDamage: 4, stunTicks: 6, successBase: 0.35,
  loot: [{ id: 101, name: 'Coins', min: 50, max: 200, weight: 4 }, { id: 12515, name: 'Dragonstone', min: 1, max: 1, weight: 1 }] });
defineTarget({ id: 'pp_dwarf', name: 'Dwarf', type: 'pickpocket', level: 35, xp: 40, stunDamage: 2, stunTicks: 5, successBase: 0.42,
  loot: [{ id: 101, name: 'Coins', min: 15, max: 50, weight: 5 }, { id: 7003, name: 'Clockwork gear', min: 1, max: 1, weight: 2 }] });

// Stall theft
defineTarget({ id: 'stall_cake', name: 'Baker\'s stall', type: 'stall', level: 5, xp: 16, stunDamage: 0, stunTicks: 3, successBase: 0.60,
  loot: [{ id: 2001, name: 'Bread', min: 1, max: 1, weight: 3 }] });
defineTarget({ id: 'stall_silk', name: 'Silk stall', type: 'stall', level: 20, xp: 24, stunDamage: 0, stunTicks: 3, successBase: 0.55,
  loot: [{ id: 6001, name: 'Elven silk', min: 1, max: 1, weight: 1 }] });
defineTarget({ id: 'stall_gem', name: 'Gem stall', type: 'stall', level: 45, xp: 50, stunDamage: 0, stunTicks: 4, successBase: 0.45,
  loot: [{ id: 12501, name: 'Uncut sapphire', min: 1, max: 1, weight: 4 }, { id: 12502, name: 'Uncut emerald', min: 1, max: 1, weight: 3 }, { id: 12503, name: 'Uncut ruby', min: 1, max: 1, weight: 2 }, { id: 12504, name: 'Uncut diamond', min: 1, max: 1, weight: 1 }] });

module.exports = { defineTarget, getTarget, listTargets, attemptTheft, targets };
