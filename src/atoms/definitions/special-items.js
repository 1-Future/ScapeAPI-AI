// ══════════════════════════════════════════════════════════════════════════════
// SPECIAL ITEMS: Enchanted jewelry effects, barrows sets, special weapons
// ══════════════════════════════════════════════════════════════════════════════

const { define } = require('../mechanic');

// ── ENCHANTED JEWELRY ───────────────────────────────────────────────────────
const JEWELRY_EFFECTS = [
  { id: 'item-ring-recoil',     name: 'Ring of Recoil',          effect: 'Reflects 10% melee damage back', slot: 'ring' },
  { id: 'item-ring-suffering',  name: 'Ring of Suffering',       effect: 'Absorbs ring of recoil charges, +20 all defence', slot: 'ring' },
  { id: 'item-ring-endurance',  name: 'Ring of Endurance',       effect: 'Reduces run energy drain by 15%', slot: 'ring' },
  { id: 'item-bracelet-exp',    name: 'Bracelet of Expeditious',effect: '25% chance slayer task counts double', slot: 'gloves' },
  { id: 'item-bracelet-slaugh', name: 'Bracelet of Slaughter',  effect: '25% chance slayer task does not count', slot: 'gloves' },
  { id: 'item-ring-wealth',     name: 'Ring of Wealth Effect',  effect: 'Improves rare drop table chance', slot: 'ring' },
  { id: 'item-amulet-glory-eff',name: 'Amulet of Glory Effect', effect: 'Doubles gem mining chance', slot: 'neck' },
  { id: 'item-binding-necklace',name: 'Binding Necklace',       effect: '100% combination rune success', slot: 'neck' },
  { id: 'item-dodgy-necklace',  name: 'Dodgy Necklace',         effect: '25% chance to prevent pickpocket stun', slot: 'neck' },
  { id: 'item-phoenix-necklace',name: 'Phoenix Necklace',       effect: 'Restores HP when dropping below 20%', slot: 'neck' },
  { id: 'item-regen-bracelet',  name: 'Regen Bracelet',         effect: 'Doubles natural HP regen rate', slot: 'gloves' },
  { id: 'item-celestial-ring',  name: 'Celestial Ring',         effect: '+4 invisible mining levels', slot: 'ring' },
  { id: 'item-lightbearer',     name: 'Lightbearer',            effect: 'Special attack regenerates 2x faster', slot: 'ring' },
  { id: 'item-ultor-ring',      name: 'Ultor Ring',             effect: '+12 melee strength', slot: 'ring' },
  { id: 'item-magus-ring',      name: 'Magus Ring',             effect: '+15 magic accuracy, +2% magic damage', slot: 'ring' },
  { id: 'item-venator-ring',    name: 'Venator Ring',            effect: '+10 ranged accuracy, +2 ranged strength', slot: 'ring' },
  { id: 'item-bellator-ring',   name: 'Bellator Ring',           effect: '+6 melee strength, double hit chance on spec', slot: 'ring' },
];

// ── BARROWS SET EFFECTS ─────────────────────────────────────────────────────
const BARROWS_SETS = [
  { id: 'set-dharok',  name: "Dharok's Set Effect",  effect: 'Damage increases as HP decreases. Max hit = base * (1 + (maxHP-currentHP)/100 * maxHP/100)' },
  { id: 'set-guthan',  name: "Guthan's Set Effect",  effect: '25% chance to heal damage dealt' },
  { id: 'set-verac',   name: "Verac's Set Effect",   effect: '25% chance to ignore defence and protection prayers' },
  { id: 'set-karil',   name: "Karil's Set Effect",   effect: '25% chance to lower target agility by 20%' },
  { id: 'set-ahrim',   name: "Ahrim's Set Effect",   effect: '25% chance to lower target strength by 5' },
  { id: 'set-torag',   name: "Torag's Set Effect",   effect: '25% chance to lower target run energy by 20%' },
];

// ── SPECIAL ATTACK WEAPONS ──────────────────────────────────────────────────
const SPEC_WEAPONS = [
  { id: 'spec-dds',            name: 'DDS Special',            cost: 25, effect: 'Two rapid hits with increased accuracy' },
  { id: 'spec-ags',            name: 'AGS Special',            cost: 50, effect: '37.5% accuracy boost, 10% damage boost' },
  { id: 'spec-bgs',            name: 'BGS Special',            cost: 50, effect: 'Drains defence by damage dealt' },
  { id: 'spec-sgs',            name: 'SGS Special',            cost: 50, effect: 'Heals 50% of damage dealt, restores 25% as prayer' },
  { id: 'spec-zgs',            name: 'ZGS Special',            cost: 50, effect: 'Freezes target for 20 seconds' },
  { id: 'spec-dwh',            name: 'DWH Special',            cost: 50, effect: 'Reduces defence by 30% on hit' },
  { id: 'spec-dragon-claws',   name: 'Dragon Claws Special',   cost: 50, effect: 'Four rapid hits: if first misses, second gets first roll' },
  { id: 'spec-voidwaker',      name: 'Voidwaker Special',      cost: 50, effect: 'Guaranteed magic hit 50-150% of max hit' },
  { id: 'spec-abyssal-dagger', name: 'Abyssal Dagger Special', cost: 50, effect: 'Two rapid hits with 25% reduced accuracy but +15% damage' },
  { id: 'spec-saradomin-sword',name: 'Saradomin Sword Special',cost: 100,effect: 'Extra magic hit (16 max) added to melee attack' },
  { id: 'spec-armadyl-cbow',   name: 'ACB Special',            cost: 40, effect: 'Doubles accuracy for one bolt' },
  { id: 'spec-dark-bow',       name: 'Dark Bow Special',       cost: 55, effect: 'Two arrows at once, minimum 8 damage each' },
  { id: 'spec-magic-shortbow', name: 'MSB(i) Special',         cost: 55, effect: 'Two rapid arrows in one tick' },
  { id: 'spec-blowpipe',       name: 'Blowpipe Special',       cost: 50, effect: 'Increases accuracy by 100%, heals 50% of damage dealt' },
  { id: 'spec-ballista',       name: 'Heavy Ballista Special',  cost: 65, effect: '+25% accuracy and damage' },
  { id: 'spec-granite-maul',   name: 'Granite Maul Special',   cost: 50, effect: 'Instant attack (can stack with another weapon spec)' },
  { id: 'spec-gmaul-combo',    name: 'G-Maul Combo',           cost: 50, effect: 'Used after another spec for instant KO potential' },
  { id: 'spec-bone-dagger',    name: 'Bone Dagger Special',    cost: 75, effect: 'Reduces defence by damage dealt, ignores prayer' },
  { id: 'spec-crystal-halberd',name: 'Crystal Halberd Special',cost: 30, effect: 'Deals damage to all targets in a 3x1 area' },
  { id: 'spec-eldritch-staff', name: 'Eldritch Staff Special', cost: 75, effect: 'Restores prayer equal to 50% of damage dealt' },
  { id: 'spec-volatile-staff', name: 'Volatile Staff Special', cost: 75, effect: 'Random magic hit 0-58' },
  { id: 'spec-scythe',         name: 'Scythe Effect',           cost: 0,  effect: 'Hits 3 times on large NPCs (100%, 50%, 25% damage)' },
  { id: 'spec-fang',           name: "Osmumten's Fang Effect", cost: 0,  effect: 'Double accuracy roll, reroll damage in top half' },
  { id: 'spec-tumekens-shadow',name: "Tumeken's Shadow Effect",cost: 0,  effect: 'Triples magic accuracy and damage bonuses' },
  { id: 'spec-twisted-bow',    name: 'Twisted Bow Effect',      cost: 0,  effect: 'Accuracy and damage scale with target magic level' },
  { id: 'spec-bowfa-effect',   name: 'Bow of Faerdhinen Effect',cost: 0, effect: 'More accurate and damaging with crystal armour set' },
];

for (const j of JEWELRY_EFFECTS) {
  define({ id: j.id, name: j.name, type: 'equipment', atoms: {}, config: { effect: j.effect, slot: j.slot } });
}
for (const b of BARROWS_SETS) {
  define({ id: b.id, name: b.name, type: 'equipment', atoms: {}, config: { effect: b.effect, type: 'set_effect' } });
}
for (const s of SPEC_WEAPONS) {
  define({
    id: s.id, name: s.name, type: 'combat',
    atoms: { cooldown: { duration: 1 } },
    config: { specCost: s.cost, effect: s.effect }
  });
}

const total = JEWELRY_EFFECTS.length + BARROWS_SETS.length + SPEC_WEAPONS.length;
console.log(`[defs] Special Items: ${JEWELRY_EFFECTS.length} jewelry, ${BARROWS_SETS.length} barrows, ${SPEC_WEAPONS.length} specs = ${total} mechanics`);
