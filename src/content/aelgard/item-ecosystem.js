// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Item Ecosystem (Reagents, Degradation, Encounter BiS)
//
// "Jagex's design philosophy pressures them to avoid adding gear that just
//  invalidates old gear. The boss drops a REAGENT. The reagent has to be
//  combined with the old version of the item." — Marstead
//
// "Since players have to calculate whether the upkeep cost of using an item
//  for a specific encounter is going to cut into their profits, it keeps
//  non-degradable items relevant." — Marstead
//
// "It's not characters that have best in slot lists. It's ENCOUNTERS." — Marstead
// ══════════════════════════════════════════════════════════════════════════════

const rel = require('../../data/relationships');

// ══════════════════════════════════════════════════════════════════════════════
// ITEM COMBINATIONS (Reagent System)
//
// New boss drops reagent + old item = upgrade.
// Old item stays relevant. Old content that drops old item stays relevant.
// This is the golden rule in item form.
// ══════════════════════════════════════════════════════════════════════════════

// ── Godsword Assembly ─────────────────────────────────────────────────────────
// GWD drops hilts (rare) + blade shards (common). Blade = 3 shards.
// Hilt + Blade = Godsword. Each hilt from a different boss = different godsword.
rel.defineCombination(91005, {
  resultName: 'Godsword blade',
  inputs: [
    { id: 91050, name: 'Godsword shard 1', consumed: true },
    { id: 91051, name: 'Godsword shard 2', consumed: true },
    { id: 91052, name: 'Godsword shard 3', consumed: true },
  ],
  skill: 'smithing', level: 80, xp: 100,
  station: 'anvil',
  description: 'Combine three godsword shards into a blade. Any hilt completes it.',
});

rel.defineCombination(91006, {
  resultName: 'Saradomin godsword',
  inputs: [
    { id: 91001, name: 'Saradomin hilt', consumed: true },
    { id: 91005, name: 'Godsword blade', consumed: true },
  ],
  skill: 'smithing', level: 80, xp: 200,
  description: 'Special attack: heals HP and prayer on hit. PvM sustain weapon.',
});

rel.defineCombination(91007, {
  resultName: 'Zamorak godsword',
  inputs: [
    { id: 91002, name: 'Zamorak hilt', consumed: true },
    { id: 91005, name: 'Godsword blade', consumed: true },
  ],
  skill: 'smithing', level: 80, xp: 200,
  description: 'Special attack: freezes target. PvP weapon.',
});

// ── Reagent Upgrades: Boss Drop + Base Item = Upgrade ─────────────────────────
// The core anti-deprecation pattern. Old bosses stay relevant because
// their drops are ingredients for the next tier.

// Abyssal Tentacle: Kraken tentacle (new boss) + Abyssal Whip (old boss) = upgrade
// AND it degrades, consuming Whips over time. Double relevance.
rel.defineCombination(92001, {
  resultName: 'Tentacle whip',
  inputs: [
    { id: 92000, name: 'Kraken tentacle', consumed: true },  // Kraken boss drop
    { id: 11500, name: 'Abyssal whip', consumed: true },     // Abyssal demon drop
  ],
  skill: 'crafting', level: 60, xp: 80,
  description: 'Melee upgrade. Degrades — must be recharged with more Abyssal Whips, keeping abyssal demons relevant forever.',
});

// Dragon Hunter Lance: Hydra claw (endgame slayer) + Zamorakian hasta (GWD)
rel.defineCombination(92010, {
  resultName: 'Dragon hunter lance',
  inputs: [
    { id: 31128, name: 'Hydra claw', consumed: true },       // Alchemical Hydra drop
    { id: 91009, name: 'Zamorak spear', consumed: true },    // K'ril Tsutsaroth drop
  ],
  skill: 'smithing', level: 75, xp: 150,
  description: 'BIS melee against all dragons. Keeps BOTH K\'ril (GWD) and Hydra (slayer) relevant.',
});

// Dragonfire Shield: Draconic visage (dragon drop) + Anti-dragon shield (quest reward)
rel.defineCombination(92020, {
  resultName: 'Dragonfire shield',
  inputs: [
    { id: 92021, name: 'Draconic visage', consumed: true },  // Rare dragon drop
    { id: 92022, name: 'Anti-dragon shield', consumed: false }, // Dragon Slayer quest reward
  ],
  skill: 'smithing', level: 90, xp: 2000,
  station: 'anvil',
  description: 'BIS shield for dragon encounters. Requires both a boss grind AND a quest completion.',
});

// Ferocious Gloves: Hydra leather (Hydra boss) + crafting
rel.defineCombination(92030, {
  resultName: 'Ferocious gloves',
  inputs: [
    { id: 31127, name: 'Hydra leather', consumed: true },    // Alchemical Hydra drop
  ],
  skill: 'crafting', level: 84, xp: 250,
  description: 'BIS melee gloves. Slight upgrade over Barrows Gloves in specific encounters.',
});

// Brimstone Ring: 3 pieces from 3 different slayer bosses = assembled ring
rel.defineCombination(92040, {
  resultName: 'Brimstone ring',
  inputs: [
    { id: 31129, name: 'Brimstone ring piece (i)', consumed: true },
    { id: 92041, name: 'Brimstone ring piece (ii)', consumed: true },
    { id: 92042, name: 'Brimstone ring piece (iii)', consumed: true },
  ],
  skill: 'crafting', level: 75, xp: 100,
  description: 'All-combat ring. Each piece from a different slayer boss. Keeps 3 bosses relevant.',
});

// Crystal equipment: Crystal shards (Veilwood gathering) + Crystal seeds (Veilwood bosses)
rel.defineCombination(92050, {
  resultName: 'Crystal bow',
  inputs: [
    { id: 92051, name: 'Crystal weapon seed', consumed: true },
    { id: 92052, name: 'Crystal shard', consumed: true },
    { id: 92052, name: 'Crystal shard', consumed: true },
    { id: 92052, name: 'Crystal shard', consumed: true },
  ],
  skill: 'crafting', level: 78, xp: 150,
  description: 'Degrades. Recharged with Crystal shards — keeps Veilwood gathering relevant.',
});

// ══════════════════════════════════════════════════════════════════════════════
// ITEM DEGRADATION
//
// "If killing a boss provides 100,000 gold per hour, but using the uber-
// powerful Staff costs you 200,000 per hour just to upkeep it, it had
// better more than double your kill speed." — Marstead
//
// Degradation creates cost-benefit analysis PER ENCOUNTER. You don't always
// use your best gear. Non-degradable items stay relevant for efficient farming.
// ══════════════════════════════════════════════════════════════════════════════

// Tentacle Whip — degrades, reverts to nothing (Whip is consumed on creation)
rel.defineDegradation(92001, {
  itemName: 'Tentacle whip',
  maxCharges: 10000,
  chargesPerAttack: 1,
  rechargeItem: null,          // Cannot recharge — must create a new one
  onDeplete: 'destroy',        // Destroyed when charges run out
  costPerAttack: 15,           // ~150k gp per hour at 4-tick attacks
  description: 'Consumes an Abyssal Whip on creation. Destroyed when depleted. Keeps abyssal demons relevant.',
});

// Barrows Equipment — degrades, repairable with coins
rel.defineDegradation(93001, {
  itemName: "Dharok's greataxe",
  maxCharges: 15000,
  chargesPerAttack: 1,
  rechargeCost: 100000,        // 100k gp to fully repair
  rechargeNpc: 'Bob (Heartlands)',
  onDeplete: 'unequip',        // Cannot use when degraded, must repair
  costPerAttack: 7,            // ~70k gp per hour
  description: 'Barrows equipment degrades over time. Repair at Bob or a POH armor stand.',
});

rel.defineDegradation(93002, {
  itemName: "Guthan's warspear",
  maxCharges: 15000,
  chargesPerAttack: 1,
  rechargeCost: 80000,
  rechargeNpc: 'Bob (Heartlands)',
  onDeplete: 'unequip',
  costPerAttack: 5,
  description: 'Guthan set heals on hit — incredible sustain for slayer, but degrades.',
});

// Scythe of Malachar — ultra-rare raid drop, charges with blood runes
rel.defineDegradation(94001, {
  itemName: 'Scythe of Malachar',
  maxCharges: 20000,
  chargesPerAttack: 3,         // Consumes 3 blood runes per attack!
  rechargeItem: { id: 11358, name: 'Blood rune', perCharge: 1 },
  onDeplete: 'unequip',
  costPerAttack: 750,          // 3 blood runes × 250gp each = 750gp per swing
  description: 'BIS melee for large monsters (3-tile hit). Costs ~7.5M gp/hr to use. Only worth it at profitable bosses.',
});

// Sanguinesti Staff — raid drop, charges with blood runes
rel.defineDegradation(94002, {
  itemName: 'Sanguinesti staff',
  maxCharges: 20000,
  chargesPerAttack: 1,
  rechargeItem: { id: 11358, name: 'Blood rune', perCharge: 3 },
  onDeplete: 'unequip',
  costPerAttack: 750,
  description: 'BIS magic weapon. Heals on hit. Costs ~5M gp/hr. Makes non-degradable trident relevant for budget bossing.',
});

// Crystal Bow — degrades, recharged with crystal shards (gathering)
rel.defineDegradation(92050, {
  itemName: 'Crystal bow',
  maxCharges: 2500,
  chargesPerAttack: 1,
  rechargeItem: { id: 92052, name: 'Crystal shard', perCharge: 10 },
  onDeplete: 'revert',
  revertsTo: 92051,            // Reverts to crystal weapon seed
  costPerAttack: 20,
  description: 'Reverts to seed when depleted. Recharge with Crystal shards from Veilwood.',
});

// Arclight — charged with ancient shards. BIS against demons but LIMITED.
rel.defineDegradation(92060, {
  itemName: 'Arclight',
  maxCharges: 10000,
  chargesPerAttack: 1,
  rechargeItem: { id: 92061, name: 'Ancient shard', perCharge: 1000 },
  onDeplete: 'revert',
  revertsTo: 92062,            // Reverts to Darklight (base form, quest reward)
  costPerAttack: 2,            // Ancient shards are ~2k each, 1 shard = 1000 charges
  description: 'BIS against ALL demons. Cheap to run but charges are limited. Forces you to choose when to use it.',
});

// ══════════════════════════════════════════════════════════════════════════════
// ENCOUNTER BIS TABLES
//
// "It's not characters that have best in slot lists. It's encounters."
//
// Each encounter has its OWN gear table. Arclight beats Scythe against demons.
// Void beats Armadyl at certain ranged levels. Serp helm is BIS at Zulrah but
// useless everywhere else. THIS is what makes you want to own everything.
// ══════════════════════════════════════════════════════════════════════════════

rel.defineEncounterBis('commander_zilyana', {
  name: 'Commander Zilyana',
  description: 'GWD boss. Extremely fast attacks. Weak to ranged. Kiting strategy.',
  combatStyle: 'ranged',
  slots: {
    weapon: [
      { id: 11025, name: 'Rune crossbow', why: 'Affordable, solid DPS. Diamond bolts (e) for spec.' },
      { id: 26008, name: 'Armadyl crossbow', why: 'Upgrade: longer range, better accuracy.' },
    ],
    body: [
      { id: 26006, name: 'Armadyl chestplate', why: 'BIS ranged body.' },
      { id: 11210, name: 'Green dragonhide body', why: 'Budget option. Fraction of the cost.' },
    ],
    legs: [
      { id: 26007, name: 'Armadyl chainskirt', why: 'BIS ranged legs.' },
    ],
    shield: [
      { id: 92020, name: 'Dragonfire shield', why: 'NOT BIS here — use crystal shield or book of law instead.' },
    ],
  },
  switches: [
    { style: 'melee', items: [{ slot: 'weapon', id: 91006, name: 'Saradomin godsword' }], why: 'SGS special attack for healing between kills. Extends trips.' },
  ],
  inventory: [
    { id: 2008, name: 'Shark', count: 10, why: 'Main healing food.' },
    { id: 12300, name: 'Ranging potion(4)', count: 2, why: 'Ranged boost. Each dose = ~20% more DPS.' },
    { id: 12200, name: 'Super restore(4)', count: 4, why: 'Prayer restore. Eagle Eye drains fast.' },
    { id: 91006, name: 'Saradomin godsword', count: 1, why: 'Special attack switch for healing.' },
  ],
  costPerHour: 50000,      // Potions, food, bolts
  profitPerHour: 800000,    // Hilt = 3M, blade shards = 500k
  notes: 'Zilyana is a KITING boss — you run in circles while attacking. Armadyl is ideal but green d\'hide works. The SGS switch is what extends trips from 5 kills to 15+.',
});

rel.defineEncounterBis('general_graardor', {
  name: 'General Graardor',
  description: 'GWD boss. Hits like a truck. Weak to magic. Tank-and-spank with prayer.',
  combatStyle: 'melee',
  slots: {
    weapon: [
      { id: 94001, name: 'Scythe of Malachar', why: 'BIS if you can afford the blood rune upkeep (~7.5M/hr). 3-tile hits Graardor hard.' },
      { id: 11500, name: 'Abyssal whip', why: 'Budget option. Zero upkeep. 70% of Scythe DPS but 100% profit.' },
    ],
    body: [
      { id: 26003, name: 'Bandos chestplate', why: 'BIS melee body. Drops here — bootstraps itself.' },
      { id: 1511, name: 'Rune platebody', why: 'Budget. Works fine with protect from melee.' },
    ],
  },
  switches: [],
  inventory: [
    { id: 2008, name: 'Shark', count: 14, why: 'Graardor hits hard even through prayer. Need lots of food.' },
    { id: 12100, name: 'Super combat potion(4)', count: 2, why: 'Attack + Strength + Defence boost.' },
    { id: 12200, name: 'Super restore(4)', count: 6, why: 'Protect from melee is mandatory. Heavy prayer drain.' },
  ],
  costPerHour: 200000,     // Budget: food + pots. Scythe: add 7.5M
  profitPerHour: 1500000,   // Bandos pieces = 5-20M
  notes: 'The Scythe vs Whip decision is THE example of degradation creating cost-benefit. Scythe is strictly better DPS but costs 7.5M/hr. At Graardor (1.5M/hr profit), using Scythe means you LOSE money. Whip is the correct choice here unless going for speed records.',
});

// Demon boss — Arclight is BIS, beating weapons 100x its price
rel.defineEncounterBis('demon_lord', {
  name: 'Demon Lord (Sootworks)',
  description: 'Demon boss. Arclight is devastatingly effective. Scythe is worse here despite costing 100x more.',
  combatStyle: 'melee',
  slots: {
    weapon: [
      { id: 92060, name: 'Arclight', why: 'BIS against ALL demons. +70% accuracy and damage. Trivially cheap to obtain. BEATS the Scythe of Malachar here.' },
      { id: 94001, name: 'Scythe of Malachar', why: 'WORSE than Arclight here despite being the rarest melee weapon. Costs 7.5M/hr and deals less damage.' },
      { id: 11500, name: 'Abyssal whip', why: 'If you have no Arclight charges. Workable but slower.' },
    ],
  },
  switches: [],
  inventory: [
    { id: 2008, name: 'Shark', count: 16, why: 'Demon Lord hits through prayer sometimes.' },
  ],
  costPerHour: 5000,        // Arclight charges are nearly free
  profitPerHour: 2000000,
  notes: 'THIS is the encounter-specific BiS principle in action. Arclight (easy quest reward + cheap charges) outperforms the Scythe (ultra-rare raid drop + 7.5M/hr upkeep) against demons. You want to own BOTH because Scythe is BIS elsewhere.',
});

// Barrows — mid-game repeatable, unique gear requirements
rel.defineEncounterBis('barrows', {
  name: 'The Barrows',
  description: 'Six brothers. Each uses different combat style. Need prayer switches AND magic for tunnel.',
  combatStyle: 'hybrid',
  slots: {
    weapon: [
      { id: 11305, name: 'Mystic staff', why: 'Magic for most brothers. Cheap, effective.' },
    ],
  },
  switches: [
    { style: 'melee', items: [{ slot: 'weapon', id: 1502, name: 'Rune scimitar' }], why: 'For Ahrim (weak to melee). Swap mid-fight.' },
  ],
  inventory: [
    { id: 2006, name: 'Lobster', count: 8, why: 'Mid-tier food is fine — brothers aren\'t that dangerous individually.' },
    { id: 12200, name: 'Super restore(4)', count: 3, why: 'Prayer switching between brothers drains points.' },
    { id: 11356, name: 'Chaos rune', count: 500, why: 'For Iban Blast / mid-level combat spells.' },
    { id: 11353, name: 'Fire rune', count: 500, why: 'For fire spells against melee brothers.' },
    { id: 15009, name: 'Spade', count: 1, why: 'Required to dig into each mound. Forget this and you walk back.' },
  ],
  costPerHour: 30000,
  profitPerHour: 600000,
  notes: 'Barrows is THE mid-game money maker. You don\'t need expensive gear — rune + mystic is enough. The drops (Barrows sets) are themselves degradable items that feed the economy. This encounter bootstraps the degradation system.',
});

// ══════════════════════════════════════════════════════════════════════════════
// ITEM SOURCE REGISTRY — Where does stuff come from?
// ══════════════════════════════════════════════════════════════════════════════

// Abyssal Whip — abyssal demons (slayer 85). Key item that feeds the Tentacle Whip.
rel.registerItemSource(11500, { type: 'drop', sourceId: 'abyssal_demon', sourceName: 'Abyssal Demon', details: '1/512 drop rate. Slayer 85 required.' });
rel.registerItemUse(11500, { type: 'combination', targetId: 92001, targetName: 'Tentacle whip', details: 'Consumed on creation. Also consumed when Tentacle Whip degrades.' });

// Zamorak spear — K'ril Tsutsaroth (GWD boss)
rel.registerItemSource(91009, { type: 'drop', sourceId: 'kril_tsutsaroth', sourceName: "K'ril Tsutsaroth", details: '1/128 drop rate.' });
rel.registerItemUse(91009, { type: 'combination', targetId: 92010, targetName: 'Dragon hunter lance', details: 'Combined with Hydra Claw. Keeps GWD relevant at endgame.' });

// Hydra Claw — Alchemical Hydra (slayer 95)
rel.registerItemSource(31128, { type: 'drop', sourceId: 'alchemical_hydra', sourceName: 'Alchemical Hydra', details: '1/1001 drop rate. Slayer 95.' });
rel.registerItemUse(31128, { type: 'combination', targetId: 92010, targetName: 'Dragon hunter lance', details: 'Combined with Zamorak spear.' });

// Blood runes — runecrafting (level 77) OR shops. Consumed by endgame weapons.
rel.registerItemSource(11358, { type: 'gathering', sourceId: 'blood_runecrafting', sourceName: 'Blood Runecrafting', details: 'Level 77 RC. The breakpoint that transforms RC from misery to beloved.' });
rel.registerItemUse(11358, { type: 'charge', targetId: 94001, targetName: 'Scythe of Malachar', details: '3 per attack. Creates massive ongoing demand.' });
rel.registerItemUse(11358, { type: 'charge', targetId: 94002, targetName: 'Sanguinesti staff', details: '3 per charge. Keeps blood RC relevant forever.' });

// Dragon bones — dragon drops. Used for prayer training.
rel.registerItemSource(107, { type: 'drop', sourceId: 'dragons', sourceName: 'All dragons', details: 'Always dropped by any dragon.' });
rel.registerItemUse(107, { type: 'offering', targetId: 'prayer_training', targetName: 'Prayer Training', details: 'Bury or use on altar. 72xp base, 252xp on gilded altar.' });

// Barrows Gloves — Recipe for Disaster quest reward
rel.registerItemSource(93010, { type: 'quest', sourceId: 'rfd_finale', sourceName: 'Recipe for Disaster — Finale', details: 'THE iconic quest reward. Requires 38+ prerequisite quests.' });

// Fire Cape — Fight Caves reward
rel.registerItemSource(99001, { type: 'quest', sourceId: 'fight_caves', sourceName: 'The Fight Caves', details: '63 waves. Prestige item. Also consumed to enter the Inferno.' });
rel.registerItemUse(99001, { type: 'quest_req', targetId: 'glass_desert_inferno', targetName: 'The Inferno', details: 'Sacrificed to enter. Must earn another one if you fail.' });

console.log('[aelgard] Item ecosystem loaded (combinations, degradation, encounter BiS, sources)');
