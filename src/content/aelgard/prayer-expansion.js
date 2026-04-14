// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Prayer Expansion
// Complete prayer list (29 prayers), bone XP table, altar multipliers
// Prayer is a MASSIVE hour sink: 99 prayer requires ~3.3M XP
// Dragon bones at 72 XP each = ~46,000 bones to 99
// At gilded altar (3.5x) = ~13,000 bones = still hundreds of hours of boss killing
// ══════════════════════════════════════════════════════════════════════════════

const items = require('../../data/items');

// ── Complete Prayer List ───────────────────────────────────────────────────
// Stored as data for the engine to reference

const prayers = new Map();

function definePrayer(opts) {
  prayers.set(opts.id, {
    id: opts.id, name: opts.name,
    level: opts.level,
    drainRate: opts.drainRate, // points per minute at base
    type: opts.type, // 'overhead', 'stat', 'passive', 'special'
    effect: opts.effect,
    conflicts: opts.conflicts || [], // prayers that can't be active simultaneously
  });
}

// Stat boost prayers (low level)
definePrayer({ id: 'thick_skin', name: 'Thick Skin', level: 1, drainRate: 3, type: 'stat', effect: '+5% Defence' });
definePrayer({ id: 'burst_of_strength', name: 'Burst of Strength', level: 4, drainRate: 3, type: 'stat', effect: '+5% Strength' });
definePrayer({ id: 'clarity_of_thought', name: 'Clarity of Thought', level: 7, drainRate: 3, type: 'stat', effect: '+5% Attack' });
definePrayer({ id: 'sharp_eye', name: 'Sharp Eye', level: 8, drainRate: 3, type: 'stat', effect: '+5% Ranged' });
definePrayer({ id: 'mystic_will', name: 'Mystic Will', level: 9, drainRate: 3, type: 'stat', effect: '+5% Magic, +5% Defence' });

// Mid-level stat boosts
definePrayer({ id: 'rock_skin', name: 'Rock Skin', level: 10, drainRate: 6, type: 'stat', effect: '+10% Defence' });
definePrayer({ id: 'superhuman_strength', name: 'Superhuman Strength', level: 13, drainRate: 6, type: 'stat', effect: '+10% Strength' });
definePrayer({ id: 'improved_reflexes', name: 'Improved Reflexes', level: 16, drainRate: 6, type: 'stat', effect: '+10% Attack' });
definePrayer({ id: 'hawk_eye', name: 'Hawk Eye', level: 26, drainRate: 6, type: 'stat', effect: '+10% Ranged' });
definePrayer({ id: 'mystic_lore', name: 'Mystic Lore', level: 27, drainRate: 6, type: 'stat', effect: '+10% Magic, +10% Defence' });

// High-level stat boosts
definePrayer({ id: 'steel_skin', name: 'Steel Skin', level: 28, drainRate: 12, type: 'stat', effect: '+15% Defence' });
definePrayer({ id: 'ultimate_strength', name: 'Ultimate Strength', level: 31, drainRate: 12, type: 'stat', effect: '+15% Strength' });
definePrayer({ id: 'incredible_reflexes', name: 'Incredible Reflexes', level: 34, drainRate: 12, type: 'stat', effect: '+15% Attack' });
definePrayer({ id: 'eagle_eye', name: 'Eagle Eye', level: 44, drainRate: 12, type: 'stat', effect: '+15% Ranged' });
definePrayer({ id: 'mystic_might', name: 'Mystic Might', level: 45, drainRate: 12, type: 'stat', effect: '+15% Magic, +15% Defence' });

// Overhead protection prayers
definePrayer({ id: 'protect_from_magic', name: 'Protect from Magic', level: 37, drainRate: 12, type: 'overhead', effect: 'Block 100% magic damage (PvM), 40% (PvP)', conflicts: ['protect_from_missiles', 'protect_from_melee', 'retribution', 'redemption', 'smite'] });
definePrayer({ id: 'protect_from_missiles', name: 'Protect from Missiles', level: 40, drainRate: 12, type: 'overhead', effect: 'Block 100% ranged damage (PvM), 40% (PvP)', conflicts: ['protect_from_magic', 'protect_from_melee', 'retribution', 'redemption', 'smite'] });
definePrayer({ id: 'protect_from_melee', name: 'Protect from Melee', level: 43, drainRate: 12, type: 'overhead', effect: 'Block 100% melee damage (PvM), 40% (PvP)', conflicts: ['protect_from_magic', 'protect_from_missiles', 'retribution', 'redemption', 'smite'] });
definePrayer({ id: 'retribution', name: 'Retribution', level: 46, drainRate: 3, type: 'overhead', effect: 'On death: deal 25% of prayer level as AoE damage', conflicts: ['protect_from_magic', 'protect_from_missiles', 'protect_from_melee'] });
definePrayer({ id: 'redemption', name: 'Redemption', level: 49, drainRate: 6, type: 'overhead', effect: 'When below 10% HP: heal 25% of prayer level, drain all prayer', conflicts: ['protect_from_magic', 'protect_from_missiles', 'protect_from_melee'] });
definePrayer({ id: 'smite', name: 'Smite', level: 52, drainRate: 18, type: 'overhead', effect: 'Drain 25% of damage dealt from opponent prayer', conflicts: ['protect_from_magic', 'protect_from_missiles', 'protect_from_melee'] });

// Elite prayers (combat prayers from scroll unlocks)
definePrayer({ id: 'chivalry', name: 'Chivalry', level: 60, drainRate: 24, type: 'stat', effect: '+15% Attack, +18% Strength, +20% Defence' });
definePrayer({ id: 'piety', name: 'Piety', level: 70, drainRate: 24, type: 'stat', effect: '+20% Attack, +23% Strength, +25% Defence' });
definePrayer({ id: 'rigour', name: 'Rigour', level: 74, drainRate: 24, type: 'stat', effect: '+20% Ranged, +23% Ranged Strength, +25% Defence. Requires prayer scroll.' });
definePrayer({ id: 'augury', name: 'Augury', level: 77, drainRate: 24, type: 'stat', effect: '+25% Magic, +25% Defence. Requires prayer scroll.' });

// Passive prayers
definePrayer({ id: 'rapid_restore', name: 'Rapid Restore', level: 19, drainRate: 1, type: 'passive', effect: '2x stat restoration rate (not HP)' });
definePrayer({ id: 'rapid_heal', name: 'Rapid Heal', level: 22, drainRate: 2, type: 'passive', effect: '2x HP restoration rate' });
definePrayer({ id: 'protect_item', name: 'Protect Item', level: 25, drainRate: 2, type: 'passive', effect: 'Keep 1 extra item on death' });
definePrayer({ id: 'preserve', name: 'Preserve', level: 55, drainRate: 2, type: 'passive', effect: 'Boosted stats drain 50% slower. Requires prayer scroll.' });

// ── Bone XP Table (base XP, before altar multipliers) ─────────────────────

const BONE_XP = {
  'Bones': 4.5,
  'Big bones': 15,
  'Dragon bones': 72,
  'Superior dragon bones': 150,
  'Wyvern bones': 72,
  'Ensouled head': 130,
  'Leviathan bone': 25, // Boneyard unique
};

// Altar multipliers:
// Regular altar: 1x
// Ectofuntus: 4x (requires ectoplasm + bone meal grinding)
// Gilded altar (2 burners lit): 3.5x
// Chaos altar (wilderness): 3.5x but 50% chance bone is consumed without XP (risk)

// Dragon bones at gilded altar: 72 × 3.5 = 252 XP each
// To 99 prayer (3,258,594 XP): 12,931 dragon bones at gilded altar
// At 300 bones/hr: ~43 hours of altar use
// But GETTING 12,931 dragon bones (killing dragons): ~200 hours
// Total: ~250 hours for 99 prayer via dragon bones at gilded altar

// ── Additional prayer items ───────────────────────────────────────────────

items.define({ id: 81001, name: 'Bone meal', examine: 'Ground bone meal for the Ectofuntus.', value: 0, category: 'prayer', weight: 0.3 });
items.define({ id: 81002, name: 'Ectoplasm bucket', examine: 'A bucket of ectoplasm from the Moryskah temple.', value: 0, category: 'prayer', weight: 1 });
items.define({ id: 81003, name: 'Marble bones', examine: 'Petrified bones. High prayer XP when used on chaos altar.', value: 500, category: 'prayer', weight: 2 });

console.log(`[aelgard] Prayer expansion: ${prayers.size} prayers defined, altar system + bone XP table`);

module.exports = { prayers, definePrayer, BONE_XP };
