// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Complete Spellbook System
// Three spellbooks: Standard, Ancient Magicks, Lunar
// Each spell has: level req, rune costs, max hit/effect, base XP
//
// Manifesto P04: Non-degenerate — each spellbook excels at different content
//   Standard: versatile, teleports + combat + enchanting
//   Ancient: AoE damage + freezing (best for slayer/multi-combat)
//   Lunar: support, healing, utility (best for group/skilling)
// Manifesto P12: No universal best — switch books based on what you're doing
// ══════════════════════════════════════════════════════════════════════════════

// Rune IDs: air=11350, water=11351, earth=11352, fire=11353, mind=11354,
// body=11355, chaos=11356, death=11357, blood=11358, nature=11359,
// law=11360, cosmic=11361, astral=11362, soul=11363, wrath=11364

const spells = new Map();

function defineSpell(opts) {
  spells.set(opts.id, {
    id: opts.id, name: opts.name,
    book: opts.book, // 'standard', 'ancient', 'lunar'
    type: opts.type, // 'combat', 'teleport', 'utility', 'enchant'
    level: opts.level,
    runes: opts.runes, // [{ id, count }]
    maxHit: opts.maxHit || 0,
    baseXp: opts.baseXp || 0,
    effect: opts.effect || null, // freeze, heal, etc
    description: opts.description || '',
  });
}

function getSpell(id) { return spells.get(id); }
function listSpells(book) {
  if (!book) return [...spells.values()];
  return [...spells.values()].filter(s => s.book === book);
}

// ══════════════════════════════════════════════════════════════════════════════
// STANDARD SPELLBOOK — versatile, teleports, combat, enchanting
// ══════════════════════════════════════════════════════════════════════════════

// Combat — strike/bolt/blast/wave/surge progression
defineSpell({ id: 'wind_strike', name: 'Wind Strike', book: 'standard', type: 'combat', level: 1, maxHit: 2, baseXp: 5.5, runes: [{ id: 11350, count: 1 }, { id: 11354, count: 1 }], description: 'A basic air attack.' });
defineSpell({ id: 'water_strike', name: 'Water Strike', book: 'standard', type: 'combat', level: 5, maxHit: 4, baseXp: 7.5, runes: [{ id: 11351, count: 1 }, { id: 11350, count: 1 }, { id: 11354, count: 1 }] });
defineSpell({ id: 'earth_strike', name: 'Earth Strike', book: 'standard', type: 'combat', level: 9, maxHit: 6, baseXp: 9.5, runes: [{ id: 11352, count: 2 }, { id: 11350, count: 1 }, { id: 11354, count: 1 }] });
defineSpell({ id: 'fire_strike', name: 'Fire Strike', book: 'standard', type: 'combat', level: 13, maxHit: 8, baseXp: 11.5, runes: [{ id: 11353, count: 3 }, { id: 11350, count: 2 }, { id: 11354, count: 1 }] });
defineSpell({ id: 'wind_bolt', name: 'Wind Bolt', book: 'standard', type: 'combat', level: 17, maxHit: 9, baseXp: 13.5, runes: [{ id: 11350, count: 2 }, { id: 11356, count: 1 }] });
defineSpell({ id: 'water_bolt', name: 'Water Bolt', book: 'standard', type: 'combat', level: 23, maxHit: 10, baseXp: 16.5, runes: [{ id: 11351, count: 2 }, { id: 11350, count: 2 }, { id: 11356, count: 1 }] });
defineSpell({ id: 'earth_bolt', name: 'Earth Bolt', book: 'standard', type: 'combat', level: 29, maxHit: 11, baseXp: 19.5, runes: [{ id: 11352, count: 3 }, { id: 11350, count: 2 }, { id: 11356, count: 1 }] });
defineSpell({ id: 'fire_bolt', name: 'Fire Bolt', book: 'standard', type: 'combat', level: 35, maxHit: 12, baseXp: 22.5, runes: [{ id: 11353, count: 4 }, { id: 11350, count: 3 }, { id: 11356, count: 1 }] });
defineSpell({ id: 'wind_blast', name: 'Wind Blast', book: 'standard', type: 'combat', level: 41, maxHit: 13, baseXp: 25.5, runes: [{ id: 11350, count: 3 }, { id: 11357, count: 1 }] });
defineSpell({ id: 'water_blast', name: 'Water Blast', book: 'standard', type: 'combat', level: 47, maxHit: 14, baseXp: 28.5, runes: [{ id: 11351, count: 3 }, { id: 11350, count: 3 }, { id: 11357, count: 1 }] });
defineSpell({ id: 'earth_blast', name: 'Earth Blast', book: 'standard', type: 'combat', level: 53, maxHit: 15, baseXp: 31.5, runes: [{ id: 11352, count: 4 }, { id: 11350, count: 3 }, { id: 11357, count: 1 }] });
defineSpell({ id: 'fire_blast', name: 'Fire Blast', book: 'standard', type: 'combat', level: 59, maxHit: 16, baseXp: 34.5, runes: [{ id: 11353, count: 5 }, { id: 11350, count: 4 }, { id: 11357, count: 1 }] });
defineSpell({ id: 'wind_wave', name: 'Wind Wave', book: 'standard', type: 'combat', level: 62, maxHit: 17, baseXp: 36, runes: [{ id: 11350, count: 5 }, { id: 11358, count: 1 }] });
defineSpell({ id: 'fire_surge', name: 'Fire Surge', book: 'standard', type: 'combat', level: 95, maxHit: 24, baseXp: 60, runes: [{ id: 11353, count: 10 }, { id: 11350, count: 7 }, { id: 11364, count: 1 }], description: 'The strongest standard combat spell.' });

// Teleports
defineSpell({ id: 'heartlands_teleport', name: 'Heartlands Teleport', book: 'standard', type: 'teleport', level: 25, baseXp: 35, runes: [{ id: 11350, count: 3 }, { id: 11353, count: 1 }, { id: 11360, count: 1 }] });
defineSpell({ id: 'saltbrine_teleport', name: 'Saltbrine Teleport', book: 'standard', type: 'teleport', level: 37, baseXp: 47, runes: [{ id: 11351, count: 1 }, { id: 11352, count: 1 }, { id: 11360, count: 1 }] });
defineSpell({ id: 'sootworks_teleport', name: 'Sootworks Teleport', book: 'standard', type: 'teleport', level: 45, baseXp: 55, runes: [{ id: 11353, count: 2 }, { id: 11360, count: 1 }] });
defineSpell({ id: 'moryskah_teleport', name: 'Moryskah Teleport', book: 'standard', type: 'teleport', level: 52, baseXp: 62, runes: [{ id: 11358, count: 1 }, { id: 11360, count: 2 }], description: 'Requires completion of Bog Witch quest.' });
defineSpell({ id: 'teleport_to_house', name: 'Teleport to House', book: 'standard', type: 'teleport', level: 40, baseXp: 30, runes: [{ id: 11350, count: 1 }, { id: 11352, count: 1 }, { id: 11360, count: 1 }] });

// Utility
defineSpell({ id: 'high_alchemy', name: 'High Level Alchemy', book: 'standard', type: 'utility', level: 55, baseXp: 65, runes: [{ id: 11353, count: 5 }, { id: 11359, count: 1 }], description: 'Converts items to gold (60% of value).' });
defineSpell({ id: 'low_alchemy', name: 'Low Level Alchemy', book: 'standard', type: 'utility', level: 21, baseXp: 31, runes: [{ id: 11353, count: 3 }, { id: 11359, count: 1 }], description: 'Converts items to gold (40% of value).' });
defineSpell({ id: 'superheat', name: 'Superheat Item', book: 'standard', type: 'utility', level: 43, baseXp: 53, runes: [{ id: 11353, count: 4 }, { id: 11359, count: 1 }], description: 'Smelts an ore without a furnace.' });
defineSpell({ id: 'bones_to_bananas', name: 'Bones to Bananas', book: 'standard', type: 'utility', level: 15, baseXp: 25, runes: [{ id: 11352, count: 2 }, { id: 11351, count: 2 }, { id: 11359, count: 1 }], description: 'Turns bones in inventory into bananas.' });
defineSpell({ id: 'telegrab', name: 'Telekinetic Grab', book: 'standard', type: 'utility', level: 33, baseXp: 43, runes: [{ id: 11350, count: 1 }, { id: 11360, count: 1 }], description: 'Pick up distant items without moving.' });

// Enchant jewellery
defineSpell({ id: 'enchant_sapphire', name: 'Lvl-1 Enchant', book: 'standard', type: 'enchant', level: 7, baseXp: 17.5, runes: [{ id: 11351, count: 1 }, { id: 11361, count: 1 }], description: 'Enchant sapphire jewellery.' });
defineSpell({ id: 'enchant_emerald', name: 'Lvl-2 Enchant', book: 'standard', type: 'enchant', level: 27, baseXp: 37, runes: [{ id: 11350, count: 3 }, { id: 11361, count: 1 }], description: 'Enchant emerald jewellery.' });
defineSpell({ id: 'enchant_ruby', name: 'Lvl-3 Enchant', book: 'standard', type: 'enchant', level: 49, baseXp: 59, runes: [{ id: 11353, count: 5 }, { id: 11361, count: 1 }], description: 'Enchant ruby jewellery.' });
defineSpell({ id: 'enchant_diamond', name: 'Lvl-4 Enchant', book: 'standard', type: 'enchant', level: 57, baseXp: 67, runes: [{ id: 11352, count: 10 }, { id: 11361, count: 1 }], description: 'Enchant diamond jewellery.' });
defineSpell({ id: 'enchant_dragonstone', name: 'Lvl-5 Enchant', book: 'standard', type: 'enchant', level: 68, baseXp: 78, runes: [{ id: 11351, count: 15 }, { id: 11352, count: 15 }, { id: 11361, count: 1 }], description: 'Enchant dragonstone jewellery.' });

// ══════════════════════════════════════════════════════════════════════════════
// ANCIENT MAGICKS — AoE damage + freezing. Best for slayer/multi-combat.
// Unlocked by Desert Treasure quest.
// ══════════════════════════════════════════════════════════════════════════════

// Rush → Burst → Blitz → Barrage progression for each element
// Smoke: poison, Shadow: drain stats, Blood: heal on hit, Ice: freeze

// Ice spells (freeze duration increases with tier)
defineSpell({ id: 'ice_rush', name: 'Ice Rush', book: 'ancient', type: 'combat', level: 58, maxHit: 16, baseXp: 34, effect: 'freeze:8', runes: [{ id: 11351, count: 2 }, { id: 11356, count: 2 }, { id: 11357, count: 2 }], description: 'Freezes target for 8 ticks.' });
defineSpell({ id: 'ice_burst', name: 'Ice Burst', book: 'ancient', type: 'combat', level: 70, maxHit: 22, baseXp: 40, effect: 'freeze:16,aoe:3x3', runes: [{ id: 11351, count: 4 }, { id: 11356, count: 4 }, { id: 11357, count: 2 }], description: 'AoE freeze. 3x3 area.' });
defineSpell({ id: 'ice_blitz', name: 'Ice Blitz', book: 'ancient', type: 'combat', level: 82, maxHit: 26, baseXp: 46, effect: 'freeze:25', runes: [{ id: 11351, count: 3 }, { id: 11358, count: 2 }, { id: 11357, count: 2 }], description: 'Long freeze on single target.' });
defineSpell({ id: 'ice_barrage', name: 'Ice Barrage', book: 'ancient', type: 'combat', level: 94, maxHit: 30, baseXp: 52, effect: 'freeze:33,aoe:3x3', runes: [{ id: 11351, count: 6 }, { id: 11358, count: 2 }, { id: 11357, count: 4 }], description: 'The strongest AoE freeze. Devastating in multi-combat.' });

// Blood spells (heal 25% of damage dealt)
defineSpell({ id: 'blood_rush', name: 'Blood Rush', book: 'ancient', type: 'combat', level: 56, maxHit: 15, baseXp: 33, effect: 'heal:25%', runes: [{ id: 11358, count: 1 }, { id: 11356, count: 2 }, { id: 11357, count: 2 }] });
defineSpell({ id: 'blood_burst', name: 'Blood Burst', book: 'ancient', type: 'combat', level: 68, maxHit: 21, baseXp: 39, effect: 'heal:25%,aoe:3x3', runes: [{ id: 11358, count: 2 }, { id: 11356, count: 4 }, { id: 11357, count: 2 }] });
defineSpell({ id: 'blood_blitz', name: 'Blood Blitz', book: 'ancient', type: 'combat', level: 80, maxHit: 25, baseXp: 45, effect: 'heal:25%', runes: [{ id: 11358, count: 4 }, { id: 11357, count: 2 }] });
defineSpell({ id: 'blood_barrage', name: 'Blood Barrage', book: 'ancient', type: 'combat', level: 92, maxHit: 29, baseXp: 51, effect: 'heal:25%,aoe:3x3', runes: [{ id: 11358, count: 4 }, { id: 11357, count: 4 }, { id: 11363, count: 1 }], description: 'AoE damage that heals you. BIS for sustained slayer.' });

// Smoke spells (poison)
defineSpell({ id: 'smoke_rush', name: 'Smoke Rush', book: 'ancient', type: 'combat', level: 50, maxHit: 13, baseXp: 30, effect: 'poison:2', runes: [{ id: 11353, count: 1 }, { id: 11350, count: 1 }, { id: 11356, count: 2 }, { id: 11357, count: 2 }] });
defineSpell({ id: 'smoke_barrage', name: 'Smoke Barrage', book: 'ancient', type: 'combat', level: 86, maxHit: 27, baseXp: 48, effect: 'poison:4,aoe:3x3', runes: [{ id: 11353, count: 4 }, { id: 11350, count: 4 }, { id: 11358, count: 2 }, { id: 11357, count: 4 }] });

// Shadow spells (drain stats)
defineSpell({ id: 'shadow_rush', name: 'Shadow Rush', book: 'ancient', type: 'combat', level: 52, maxHit: 14, baseXp: 31, effect: 'drain:attack:10%', runes: [{ id: 11352, count: 1 }, { id: 11350, count: 1 }, { id: 11356, count: 2 }, { id: 11357, count: 2 }, { id: 11363, count: 1 }] });
defineSpell({ id: 'shadow_barrage', name: 'Shadow Barrage', book: 'ancient', type: 'combat', level: 88, maxHit: 28, baseXp: 49, effect: 'drain:attack:15%,aoe:3x3', runes: [{ id: 11352, count: 4 }, { id: 11350, count: 4 }, { id: 11358, count: 2 }, { id: 11357, count: 4 }, { id: 11363, count: 2 }] });

// ══════════════════════════════════════════════════════════════════════════════
// LUNAR SPELLBOOK — support, healing, utility. Best for group/skilling.
// Unlocked by Lunar Diplomacy quest.
// ══════════════════════════════════════════════════════════════════════════════

defineSpell({ id: 'cure_other', name: 'Cure Other', book: 'lunar', type: 'utility', level: 68, baseXp: 65, runes: [{ id: 11352, count: 10 }, { id: 11362, count: 1 }], description: 'Cure poison on another player.' });
defineSpell({ id: 'heal_other', name: 'Heal Other', book: 'lunar', type: 'utility', level: 92, baseXp: 101, runes: [{ id: 11358, count: 3 }, { id: 11362, count: 3 }, { id: 11360, count: 1 }], description: 'Transfer 75% of your HP to another player.' });
defineSpell({ id: 'vengeance', name: 'Vengeance', book: 'lunar', type: 'utility', level: 94, baseXp: 112, runes: [{ id: 11357, count: 2 }, { id: 11362, count: 4 }, { id: 11352, count: 10 }], description: 'Next melee hit reflects 75% damage back. 30 second cooldown.' });
defineSpell({ id: 'vengeance_other', name: 'Vengeance Other', book: 'lunar', type: 'utility', level: 93, baseXp: 108, runes: [{ id: 11357, count: 3 }, { id: 11362, count: 3 }, { id: 11352, count: 10 }], description: 'Cast Vengeance on another player.' });
defineSpell({ id: 'npc_contact', name: 'NPC Contact', book: 'lunar', type: 'utility', level: 67, baseXp: 63, runes: [{ id: 11361, count: 1 }, { id: 11362, count: 1 }, { id: 11350, count: 2 }], description: 'Talk to select NPCs from anywhere (slayer master, etc).' });
defineSpell({ id: 'humidify', name: 'Humidify', book: 'lunar', type: 'utility', level: 68, baseXp: 65, runes: [{ id: 11351, count: 3 }, { id: 11362, count: 1 }, { id: 11353, count: 1 }], description: 'Fill all empty water containers in inventory.' });
defineSpell({ id: 'superglass_make', name: 'Superglass Make', book: 'lunar', type: 'utility', level: 77, baseXp: 78, runes: [{ id: 11362, count: 2 }, { id: 11353, count: 6 }, { id: 11350, count: 10 }], description: 'Convert sand + soda ash into molten glass without a furnace.' });
defineSpell({ id: 'plank_make', name: 'Plank Make', book: 'lunar', type: 'utility', level: 86, baseXp: 90, runes: [{ id: 11362, count: 2 }, { id: 11352, count: 15 }, { id: 11359, count: 1 }], description: 'Convert a log into a plank without the sawmill. Costs coins.' });
defineSpell({ id: 'fertile_soil', name: 'Fertile Soil', book: 'lunar', type: 'utility', level: 83, baseXp: 87, runes: [{ id: 11362, count: 3 }, { id: 11352, count: 15 }, { id: 11359, count: 2 }], description: 'Treat a farming patch with supercompost remotely.' });
defineSpell({ id: 'cure_plant', name: 'Cure Plant', book: 'lunar', type: 'utility', level: 66, baseXp: 60, runes: [{ id: 11362, count: 1 }, { id: 11352, count: 8 }], description: 'Cure a diseased farming patch.' });
defineSpell({ id: 'dream', name: 'Dream', book: 'lunar', type: 'utility', level: 79, baseXp: 82, runes: [{ id: 11362, count: 2 }, { id: 11355, count: 5 }, { id: 11363, count: 1 }], description: 'Enter a dream state that rapidly regenerates HP while stationary.' });
defineSpell({ id: 'string_jewellery', name: 'String Jewellery', book: 'lunar', type: 'utility', level: 80, baseXp: 83, runes: [{ id: 11362, count: 2 }, { id: 11352, count: 10 }, { id: 11351, count: 5 }], description: 'String all unstrung amulets in inventory at once.' });

// Lunar teleports
defineSpell({ id: 'moonclan_teleport', name: 'Moonclan Teleport', book: 'lunar', type: 'teleport', level: 69, baseXp: 66, runes: [{ id: 11362, count: 2 }, { id: 11352, count: 2 }, { id: 11360, count: 1 }] });
defineSpell({ id: 'ice_plateau_teleport', name: 'Ice Plateau Teleport', book: 'lunar', type: 'teleport', level: 89, baseXp: 96, runes: [{ id: 11362, count: 3 }, { id: 11351, count: 8 }, { id: 11360, count: 3 }], description: 'Teleport to the Wilds. Dangerous.' });

// ══════════════════════════════════════════════════════════════════════════════

console.log(`[aelgard] ${spells.size} spells defined across 3 spellbooks`);

module.exports = { defineSpell, getSpell, listSpells, spells };
