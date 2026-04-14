// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Breakpoint Registry
//
// "RuneScape is nothing but that feeling. Passing breakpoints, seeing how the
//  game world opens up to you with each threshold crossed." — Marstead
//
// Every significant threshold that permanently changes how you play the game.
// Not every level — just the ones where you feel the floor shift under you.
//
// Importance guide:
//   'minor':          A new training method or small upgrade
//   'major':          A new area, boss, or significant capability
//   'transformative': The game permanently changes. You remember this forever.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const rel = require('../../data/relationships');

let count = 0;
function bp(opts) { rel.defineBreakpoint(opts); count++; }


// ══════════════════════════════════════════════════════════════════════════════
// ATTACK
// ══════════════════════════════════════════════════════════════════════════════

bp({
  type: 'skill_level', trigger: { skill: 'attack', level: 5 },
  description: 'Steel weapons. First real upgrade from bronze. Scimitars become your best friend.',
  unlocks: [{ type: 'item_equip', id: 'steel_scimitar', description: 'Steel scimitar equippable' }],
  importance: 'minor',
});

bp({
  type: 'skill_level', trigger: { skill: 'attack', level: 20 },
  description: 'Mithril weapons. Combat starts feeling efficient. Hill giants become farmable.',
  unlocks: [{ type: 'item_equip', id: 'mithril_scimitar', description: 'Mithril scimitar equippable' }],
  importance: 'minor',
});

bp({
  type: 'skill_level', trigger: { skill: 'attack', level: 40 },
  description: 'Rune weapons. The mid-game standard. Rune scimitar defines the early-mid game melee experience.',
  unlocks: [{ type: 'item_equip', id: 'rune_scimitar', description: 'Rune scimitar equippable' }],
  importance: 'major',
});

bp({
  type: 'skill_level', trigger: { skill: 'attack', level: 60 },
  description: 'Dragon weapons. After Monkey Business quest, dragon scimitar is the gateway to serious PvM.',
  unlocks: [{ type: 'item_equip', id: 'dragon_scimitar', description: 'Dragon scimitar equippable (requires quest)' }],
  importance: 'major',
});

bp({
  type: 'skill_level', trigger: { skill: 'attack', level: 70 },
  description: 'Barrows weapons. Abyssal whip territory. You can now use the best non-degradable melee weapons.',
  unlocks: [
    { type: 'item_equip', id: 'abyssal_whip', description: 'Abyssal whip equippable' },
    { type: 'item_equip', id: 'barrows_weapons', description: "Dharok's greataxe, Verac's flail equippable" },
  ],
  importance: 'transformative',
});

bp({
  type: 'skill_level', trigger: { skill: 'attack', level: 75 },
  description: 'Godswords and Dragon Hunter Lance. Endgame melee. Every boss in the game is now fightable with BiS.',
  unlocks: [
    { type: 'item_equip', id: 'godsword', description: 'All godswords equippable' },
    { type: 'item_equip', id: 'dragon_hunter_lance', description: 'Dragon Hunter Lance equippable' },
  ],
  importance: 'major',
});


// ══════════════════════════════════════════════════════════════════════════════
// STRENGTH
// ══════════════════════════════════════════════════════════════════════════════

bp({
  type: 'skill_level', trigger: { skill: 'strength', level: 10 },
  description: 'Max hits visibly increase. First taste of "I am getting stronger."',
  unlocks: [{ type: 'training_method', id: 'controlled_training', description: 'Controlled style becomes viable' }],
  importance: 'minor',
});

bp({
  type: 'skill_level', trigger: { skill: 'strength', level: 50 },
  description: 'Granite maul special attack threshold. PvP becomes accessible.',
  unlocks: [{ type: 'item_equip', id: 'granite_maul', description: 'Granite maul equippable (50 str + 50 att)' }],
  importance: 'minor',
});

bp({
  type: 'skill_level', trigger: { skill: 'strength', level: 70 },
  description: "Dharok's full set. At low HP, you can hit 60+ with the greataxe. Changes how you think about HP.",
  unlocks: [{ type: 'item_equip', id: 'dharoks_set', description: "Full Dharok's: damage scales inversely with HP" }],
  importance: 'major',
});

bp({
  type: 'skill_level', trigger: { skill: 'strength', level: 99 },
  description: 'Max melee strength. The grind that defines RS. Strength cape gives +4 invisible boost.',
  unlocks: [{ type: 'item_equip', id: 'strength_cape', description: 'Strength skillcape' }],
  importance: 'major',
});


// ══════════════════════════════════════════════════════════════════════════════
// DEFENCE
// ══════════════════════════════════════════════════════════════════════════════

bp({
  type: 'skill_level', trigger: { skill: 'defence', level: 1 },
  description: 'Pure builds stay at 1. A conscious choice that defines PvP. Defence is optional — that is the design.',
  unlocks: [],
  importance: 'minor',
});

bp({
  type: 'skill_level', trigger: { skill: 'defence', level: 40 },
  description: 'Rune armour. Green dragonhide. You stop dying to random mobs. The world opens up.',
  unlocks: [
    { type: 'item_equip', id: 'rune_platebody', description: 'Full rune armour equippable' },
    { type: 'item_equip', id: 'green_dhide', description: 'Green dragonhide armour equippable' },
  ],
  importance: 'major',
});

bp({
  type: 'skill_level', trigger: { skill: 'defence', level: 70 },
  description: 'Barrows armour. The endgame defensive standard. Torag, Guthan, Verac, Dharok plate.',
  unlocks: [{ type: 'item_equip', id: 'barrows_armour', description: 'All Barrows armour sets equippable' }],
  importance: 'major',
});


// ══════════════════════════════════════════════════════════════════════════════
// HITPOINTS
// ══════════════════════════════════════════════════════════════════════════════

bp({
  type: 'skill_level', trigger: { skill: 'hitpoints', level: 40 },
  description: 'Enough HP to eat a full shark and sustain through mid-game bosses.',
  unlocks: [{ type: 'training_method', id: 'slayer_viable', description: 'Most slayer tasks become survivable' }],
  importance: 'minor',
});

bp({
  type: 'skill_level', trigger: { skill: 'hitpoints', level: 70 },
  description: 'Bossing threshold. 70 HP means you can take a big hit and brew back. GWD becomes viable.',
  unlocks: [{ type: 'training_method', id: 'bossing_viable', description: 'God Wars Dungeon and mid-tier bosses' }],
  importance: 'major',
});

bp({
  type: 'skill_level', trigger: { skill: 'hitpoints', level: 99 },
  description: 'Max HP. Anglerfish can overheal to 121. You are as tanky as you will ever be.',
  unlocks: [{ type: 'item_equip', id: 'hitpoints_cape', description: 'Hitpoints cape: double HP regeneration' }],
  importance: 'minor',
});


// ══════════════════════════════════════════════════════════════════════════════
// RANGED
// ══════════════════════════════════════════════════════════════════════════════

bp({
  type: 'skill_level', trigger: { skill: 'ranged', level: 20 },
  description: 'Willow shortbow. Ranged becomes a real combat style, not just a novelty.',
  unlocks: [{ type: 'item_equip', id: 'willow_shortbow', description: 'Willow shortbow equippable' }],
  importance: 'minor',
});

bp({
  type: 'skill_level', trigger: { skill: 'ranged', level: 40 },
  description: 'Green dragonhide armour. Yew shortbow. Ranged is now competitive with melee for many encounters.',
  unlocks: [
    { type: 'item_equip', id: 'green_dhide_body', description: 'Green dragonhide body equippable' },
    { type: 'item_equip', id: 'yew_shortbow', description: 'Yew shortbow equippable' },
  ],
  importance: 'major',
});

bp({
  type: 'skill_level', trigger: { skill: 'ranged', level: 61 },
  description: 'Rune crossbow. One-handed ranged weapon with shield slot free. Changes the meta for prayer-using fights.',
  unlocks: [{ type: 'item_equip', id: 'rune_crossbow', description: 'Rune crossbow equippable — prayer + shield + ranged' }],
  importance: 'major',
});

bp({
  type: 'skill_level', trigger: { skill: 'ranged', level: 70 },
  description: 'Armadyl crossbow. Crystal bow. The ranged endgame begins.',
  unlocks: [
    { type: 'item_equip', id: 'armadyl_crossbow', description: 'Armadyl crossbow equippable' },
    { type: 'item_equip', id: 'crystal_bow', description: 'Crystal bow equippable' },
  ],
  importance: 'major',
});

bp({
  type: 'skill_level', trigger: { skill: 'ranged', level: 75 },
  description: 'Toxic blowpipe. The most iconic ranged weapon. Fast, venomous, game-changing DPS.',
  unlocks: [{ type: 'item_equip', id: 'toxic_blowpipe', description: 'Toxic blowpipe equippable — fastest ranged weapon' }],
  importance: 'transformative',
});


// ══════════════════════════════════════════════════════════════════════════════
// PRAYER
// ══════════════════════════════════════════════════════════════════════════════

bp({
  type: 'skill_level', trigger: { skill: 'prayer', level: 13 },
  description: 'Protect Item. You keep one more item on death. PvP and PvM risk calculation changes.',
  unlocks: [{ type: 'prayer', id: 'protect_item', description: 'Protect Item prayer' }],
  importance: 'minor',
});

bp({
  type: 'skill_level', trigger: { skill: 'prayer', level: 37 },
  description: 'Protect from Magic. The first protection prayer. Mages in PvP can no longer freeze-kill you.',
  unlocks: [{ type: 'prayer', id: 'protect_from_magic', description: 'Protect from Magic prayer' }],
  importance: 'major',
});

bp({
  type: 'skill_level', trigger: { skill: 'prayer', level: 43 },
  description: 'All three protection prayers. This is THE breakpoint. Bosses that were impossible become farmable. The game permanently changes.',
  unlocks: [
    { type: 'prayer', id: 'protect_from_melee', description: 'Protect from Melee prayer' },
    { type: 'prayer', id: 'protect_from_missiles', description: 'Protect from Missiles prayer' },
  ],
  importance: 'transformative',
});

bp({
  type: 'skill_level', trigger: { skill: 'prayer', level: 60 },
  description: 'Chivalry. 15% attack, 18% strength, 15% defence boost. Massive DPS increase if you can sustain the drain.',
  unlocks: [{ type: 'prayer', id: 'chivalry', description: 'Chivalry prayer (requires quest)' }],
  importance: 'minor',
});

bp({
  type: 'skill_level', trigger: { skill: 'prayer', level: 70 },
  description: 'Piety. 20% attack, 23% strength, 25% defence boost. THE endgame melee prayer. All serious PvMers need this.',
  unlocks: [{ type: 'prayer', id: 'piety', description: 'Piety prayer (requires quest)' }],
  importance: 'transformative',
});

bp({
  type: 'skill_level', trigger: { skill: 'prayer', level: 74 },
  description: 'Rigour. 20% ranged accuracy, 23% ranged strength, 25% defence. The ranged equivalent of Piety.',
  unlocks: [{ type: 'prayer', id: 'rigour', description: 'Rigour prayer (requires drop + quest)' }],
  importance: 'major',
});

bp({
  type: 'skill_level', trigger: { skill: 'prayer', level: 77 },
  description: 'Augury. 25% magic accuracy, 25% defence. The magic equivalent of Piety.',
  unlocks: [{ type: 'prayer', id: 'augury', description: 'Augury prayer (requires drop + quest)' }],
  importance: 'major',
});


// ══════════════════════════════════════════════════════════════════════════════
// MAGIC
// ══════════════════════════════════════════════════════════════════════════════

bp({
  type: 'skill_level', trigger: { skill: 'magic', level: 7 },
  description: 'Lvl-1 Enchant. Sapphire jewelry becomes Ring of Recoil. First taste of enchanting.',
  unlocks: [{ type: 'recipe', id: 'enchant_sapphire', description: 'Enchant sapphire jewelry' }],
  importance: 'minor',
});

bp({
  type: 'skill_level', trigger: { skill: 'magic', level: 25 },
  description: 'Varrock teleport. Free instant travel. The world shrinks. Everything is closer.',
  unlocks: [{ type: 'teleport', id: 'varrock_teleport', description: 'Varrock Teleport spell' }],
  importance: 'major',
});

bp({
  type: 'skill_level', trigger: { skill: 'magic', level: 33 },
  description: 'Telekinetic Grab. Items behind fences. Wine of zamorak without angering monks. Clever interactions.',
  unlocks: [{ type: 'training_method', id: 'telegrab', description: 'Telekinetic Grab spell' }],
  importance: 'minor',
});

bp({
  type: 'skill_level', trigger: { skill: 'magic', level: 43 },
  description: 'Superheat Item. Smelt bars without a furnace. Mining + Smithing in one inventory. Huge efficiency.',
  unlocks: [{ type: 'recipe', id: 'superheat', description: 'Superheat Item spell — smelt anywhere' }],
  importance: 'major',
});

bp({
  type: 'skill_level', trigger: { skill: 'magic', level: 55 },
  description: 'High Level Alchemy. Convert any item to coins. The backbone of the entire economy. EVERYTHING has a floor price.',
  unlocks: [{ type: 'recipe', id: 'high_alch', description: 'High Level Alchemy — items to coins + 65 magic XP' }],
  importance: 'transformative',
});

bp({
  type: 'skill_level', trigger: { skill: 'magic', level: 70 },
  description: 'Ice Burst (Ancient Magicks). AoE freeze spell. Slayer tasks go from single-target to mass-killing. XP rates double.',
  unlocks: [{ type: 'training_method', id: 'burst_slayer', description: 'Burst/barrage slayer tasks' }],
  importance: 'major',
});

bp({
  type: 'skill_level', trigger: { skill: 'magic', level: 94 },
  description: 'Ice Barrage (Ancient Magicks). The most iconic spell. AoE freeze + massive damage. PvP and PvM endgame.',
  unlocks: [{ type: 'training_method', id: 'ice_barrage', description: 'Ice Barrage — 30 damage AoE freeze' }],
  importance: 'transformative',
});


// ══════════════════════════════════════════════════════════════════════════════
// MINING
// ══════════════════════════════════════════════════════════════════════════════

bp({
  type: 'skill_level', trigger: { skill: 'mining', level: 15 },
  description: 'Iron ore. First ore worth smelting solo. Power-mining iron becomes the go-to training method for years.',
  unlocks: [{ type: 'training_method', id: 'iron_mining', description: 'Iron ore mining — core training method' }],
  importance: 'minor',
});

bp({
  type: 'skill_level', trigger: { skill: 'mining', level: 30 },
  description: 'Coal. The key ingredient for steel, mithril, adamant, and rune bars. Opens the Smithing web.',
  unlocks: [{ type: 'training_method', id: 'coal_mining', description: 'Coal mining — critical for all mid/high bars' }],
  importance: 'major',
});

bp({
  type: 'skill_level', trigger: { skill: 'mining', level: 55 },
  description: 'Mithril ore. First "valuable" ore. Mining starts generating real money.',
  unlocks: [{ type: 'training_method', id: 'mithril_mining', description: 'Mithril ore mining' }],
  importance: 'minor',
});

bp({
  type: 'skill_level', trigger: { skill: 'mining', level: 70 },
  description: 'Adamantite ore. Serious mining money. You feel rich for the first time.',
  unlocks: [{ type: 'training_method', id: 'adamantite_mining', description: 'Adamantite ore mining' }],
  importance: 'minor',
});

bp({
  type: 'skill_level', trigger: { skill: 'mining', level: 85 },
  description: 'Runite ore. The rarest ore. Two rocks in the Wilds, contested 24/7. Mining becomes PvP.',
  unlocks: [{ type: 'training_method', id: 'runite_mining', description: 'Runite ore mining — rare, valuable, dangerous' }],
  importance: 'major',
});


// ══════════════════════════════════════════════════════════════════════════════
// SMITHING
// ══════════════════════════════════════════════════════════════════════════════

bp({
  type: 'skill_level', trigger: { skill: 'smithing', level: 15 },
  description: 'Iron bars. The 50% fail chance creates early frustration that Ring of Forging solves — your first "I need another skill."',
  unlocks: [{ type: 'recipe', id: 'smelt_iron', description: 'Smelt iron bars (50% fail without ring)' }],
  importance: 'minor',
});

bp({
  type: 'skill_level', trigger: { skill: 'smithing', level: 30 },
  description: 'Steel bars. Steel platebodies for alching. Smithing starts feeding the economy.',
  unlocks: [{ type: 'recipe', id: 'smelt_steel', description: 'Smelt steel bars' }],
  importance: 'minor',
});

bp({
  type: 'skill_level', trigger: { skill: 'smithing', level: 50 },
  description: 'Mithril bars. Mithril platebodies are a real product. You can make gear other players want.',
  unlocks: [{ type: 'recipe', id: 'smelt_mithril', description: 'Smelt mithril bars' }],
  importance: 'minor',
});

bp({
  type: 'skill_level', trigger: { skill: 'smithing', level: 85 },
  description: 'Runite bars. You can smelt the highest-tier bar. Rune platebody smithing is the endgame flex.',
  unlocks: [{ type: 'recipe', id: 'smelt_rune', description: 'Smelt runite bars' }],
  importance: 'major',
});

bp({
  type: 'skill_level', trigger: { skill: 'smithing', level: 99 },
  description: 'Rune platebody. The iconic smithing goal. 5 runite bars. The original flex.',
  unlocks: [{ type: 'recipe', id: 'smith_rune_platebody', description: 'Smith rune platebody (5 runite bars)' }],
  importance: 'major',
});


// ══════════════════════════════════════════════════════════════════════════════
// WOODCUTTING
// ══════════════════════════════════════════════════════════════════════════════

bp({
  type: 'skill_level', trigger: { skill: 'woodcutting', level: 15 },
  description: 'Oak trees. First tree worth cutting. Oak logs feed construction and fletching.',
  unlocks: [{ type: 'training_method', id: 'oak_cutting', description: 'Oak tree cutting' }],
  importance: 'minor',
});

bp({
  type: 'skill_level', trigger: { skill: 'woodcutting', level: 30 },
  description: 'Willow trees. The AFK woodcutting standard. You will cut willows for hours.',
  unlocks: [{ type: 'training_method', id: 'willow_cutting', description: 'Willow tree cutting — AFK standard' }],
  importance: 'minor',
});

bp({
  type: 'skill_level', trigger: { skill: 'woodcutting', level: 60 },
  description: 'Yew trees. Real money from woodcutting. Yew logs for fletching -> longbows -> high alch = profit pipeline.',
  unlocks: [{ type: 'training_method', id: 'yew_cutting', description: 'Yew tree cutting — feeds the alch economy' }],
  importance: 'major',
});

bp({
  type: 'skill_level', trigger: { skill: 'woodcutting', level: 75 },
  description: 'Magic trees. The slowest, most valuable logs. Magic longbows are the best alch item in the game.',
  unlocks: [{ type: 'training_method', id: 'magic_tree_cutting', description: 'Magic tree cutting — top-tier logs' }],
  importance: 'minor',
});


// ══════════════════════════════════════════════════════════════════════════════
// FISHING
// ══════════════════════════════════════════════════════════════════════════════

bp({
  type: 'skill_level', trigger: { skill: 'fishing', level: 20 },
  description: 'Fly fishing (trout/salmon). Active but fast. The best early training method for any gathering skill.',
  unlocks: [{ type: 'training_method', id: 'fly_fishing', description: 'Fly fishing — trout and salmon' }],
  importance: 'minor',
});

bp({
  type: 'skill_level', trigger: { skill: 'fishing', level: 40 },
  description: 'Lobsters. First fish that heals well in combat. You can now sustain through real fights.',
  unlocks: [{ type: 'training_method', id: 'lobster_fishing', description: 'Lobster cage fishing' }],
  importance: 'minor',
});

bp({
  type: 'skill_level', trigger: { skill: 'fishing', level: 62 },
  description: 'Monkfish. Heals 16. The efficient PvM food. Balance of cost and healing.',
  unlocks: [{ type: 'training_method', id: 'monkfish_fishing', description: 'Monkfish net fishing (requires quest)' }],
  importance: 'major',
});

bp({
  type: 'skill_level', trigger: { skill: 'fishing', level: 76 },
  description: 'Sharks. Heals 20. The iconic endgame food. "Bank full of sharks" means you are ready for anything.',
  unlocks: [{ type: 'training_method', id: 'shark_fishing', description: 'Shark harpoon fishing' }],
  importance: 'major',
});

bp({
  type: 'skill_level', trigger: { skill: 'fishing', level: 82 },
  description: 'Anglerfish. Heals above max HP. The only food that overheals. Endgame PvM and PvP staple.',
  unlocks: [{ type: 'training_method', id: 'anglerfish_fishing', description: 'Anglerfish fishing (requires quest)' }],
  importance: 'major',
});


// ══════════════════════════════════════════════════════════════════════════════
// COOKING
// ══════════════════════════════════════════════════════════════════════════════

bp({
  type: 'skill_level', trigger: { skill: 'cooking', level: 40 },
  description: 'Lobsters without burning (at the Cooking Guild). Reliable mid-game food production.',
  unlocks: [{ type: 'recipe', id: 'cook_lobster', description: 'Cook lobsters reliably' }],
  importance: 'minor',
});

bp({
  type: 'skill_level', trigger: { skill: 'cooking', level: 80 },
  description: 'Sharks. Cook without burning at 99, but even at 80 the burn rate is low enough to profit.',
  unlocks: [{ type: 'recipe', id: 'cook_shark', description: 'Cook sharks' }],
  importance: 'major',
});

bp({
  type: 'skill_level', trigger: { skill: 'cooking', level: 84 },
  description: 'Anglerfish. The overheal fish. Cooking these for yourself is a point of pride.',
  unlocks: [{ type: 'recipe', id: 'cook_anglerfish', description: 'Cook anglerfish — heals above max HP' }],
  importance: 'minor',
});


// ══════════════════════════════════════════════════════════════════════════════
// FIREMAKING
// ══════════════════════════════════════════════════════════════════════════════

bp({
  type: 'skill_level', trigger: { skill: 'firemaking', level: 30 },
  description: 'Willow logs. The efficient firemaking training tier.',
  unlocks: [{ type: 'recipe', id: 'burn_willow', description: 'Burn willow logs' }],
  importance: 'minor',
});

bp({
  type: 'skill_level', trigger: { skill: 'firemaking', level: 50 },
  description: 'Access to the Wintertodt minigame. Firemaking goes from "why bother" to "this is actually fun."',
  unlocks: [{ type: 'training_method', id: 'wintertodt', description: 'Wintertodt minigame — group firemaking boss' }],
  importance: 'major',
});


// ══════════════════════════════════════════════════════════════════════════════
// RUNECRAFTING
// ══════════════════════════════════════════════════════════════════════════════

bp({
  type: 'skill_level', trigger: { skill: 'runecrafting', level: 27 },
  description: 'Cosmic runes. Required for all enchant spells. Your crafted jewelry becomes enchanted jewelry.',
  unlocks: [{ type: 'recipe', id: 'craft_cosmic', description: 'Craft cosmic runes at cosmic altar' }],
  importance: 'minor',
});

bp({
  type: 'skill_level', trigger: { skill: 'runecrafting', level: 44 },
  description: 'Nature runes. Self-sufficient high alchemy. You craft your own nature runes, alch your own items. Full circle.',
  unlocks: [{ type: 'recipe', id: 'craft_nature', description: 'Craft nature runes — backbone of alchemy' }],
  importance: 'major',
});

bp({
  type: 'skill_level', trigger: { skill: 'runecrafting', level: 54 },
  description: 'Law runes. Self-crafted teleports. Total mobility independence.',
  unlocks: [{ type: 'recipe', id: 'craft_law', description: 'Craft law runes — independence from rune shops' }],
  importance: 'minor',
});

bp({
  type: 'skill_level', trigger: { skill: 'runecrafting', level: 65 },
  description: 'Death runes. The currency of burst and barrage magic. Slayer efficiency multiplier.',
  unlocks: [{ type: 'recipe', id: 'craft_death', description: 'Craft death runes' }],
  importance: 'minor',
});

bp({
  type: 'skill_level', trigger: { skill: 'runecrafting', level: 77 },
  description: 'Blood runes. AFK runecrafting. Profitable. Fuels blood barrage for endgame PvM. The skill is finally worth training.',
  unlocks: [{ type: 'recipe', id: 'craft_blood', description: 'Craft blood runes — AFK, profitable, fuels endgame magic' }],
  importance: 'transformative',
});

bp({
  type: 'skill_level', trigger: { skill: 'runecrafting', level: 90 },
  description: 'Soul runes. The highest altar. Used in the most powerful spells.',
  unlocks: [{ type: 'recipe', id: 'craft_soul', description: 'Craft soul runes' }],
  importance: 'minor',
});


// ══════════════════════════════════════════════════════════════════════════════
// CRAFTING
// ══════════════════════════════════════════════════════════════════════════════

bp({
  type: 'skill_level', trigger: { skill: 'crafting', level: 10 },
  description: 'Spinning flax into bowstrings. Your first cross-skill connection. Crafting feeds Fletching.',
  unlocks: [{ type: 'recipe', id: 'spin_flax', description: 'Spin flax into bowstrings' }],
  importance: 'minor',
});

bp({
  type: 'skill_level', trigger: { skill: 'crafting', level: 20 },
  description: 'Cut sapphires. Gem cutting begins. Uncut gems from mining become cut gems for jewelry.',
  unlocks: [{ type: 'recipe', id: 'cut_sapphire', description: 'Cut sapphires' }],
  importance: 'minor',
});

bp({
  type: 'skill_level', trigger: { skill: 'crafting', level: 43 },
  description: 'Diamond jewelry. The first serious crafting money. Diamond rings, necklaces, amulets.',
  unlocks: [{ type: 'recipe', id: 'craft_diamond_jewelry', description: 'Diamond ring and other diamond jewelry' }],
  importance: 'minor',
});

bp({
  type: 'skill_level', trigger: { skill: 'crafting', level: 63 },
  description: 'Green dragonhide bodies. The profitable crafting method. Buy hides, craft bodies, alch or sell.',
  unlocks: [{ type: 'recipe', id: 'craft_green_dhide_body', description: 'Craft green dragonhide bodies' }],
  importance: 'major',
});

bp({
  type: 'skill_level', trigger: { skill: 'crafting', level: 84 },
  description: 'Dragonstone amulets and fury amulets. The best combat amulet you can make.',
  unlocks: [{ type: 'recipe', id: 'craft_fury', description: 'Craft amulet of fury (onyx + gold bar)' }],
  importance: 'major',
});


// ══════════════════════════════════════════════════════════════════════════════
// FLETCHING
// ══════════════════════════════════════════════════════════════════════════════

bp({
  type: 'skill_level', trigger: { skill: 'fletching', level: 1 },
  description: 'Arrow shafts. 15 per log. Your first batch processing — logs become ammunition.',
  unlocks: [{ type: 'recipe', id: 'fletch_arrow_shaft', description: 'Fletch arrow shafts' }],
  importance: 'minor',
});

bp({
  type: 'skill_level', trigger: { skill: 'fletching', level: 50 },
  description: 'Maple shortbow. The efficient fletching training tier. Cut, string, repeat.',
  unlocks: [{ type: 'recipe', id: 'fletch_maple', description: 'Fletch maple shortbows (u)' }],
  importance: 'minor',
});

bp({
  type: 'skill_level', trigger: { skill: 'fletching', level: 70 },
  description: 'Yew longbow. THE classic high-alch item. Yew logs -> yew longbow (u) -> string -> alch = profit.',
  unlocks: [{ type: 'recipe', id: 'fletch_yew_longbow', description: 'Yew longbow — the alch economy workhorse' }],
  importance: 'major',
});

bp({
  type: 'skill_level', trigger: { skill: 'fletching', level: 85 },
  description: 'Magic longbow. Highest fletching product. Magic logs -> magic longbow -> alch for max gold.',
  unlocks: [{ type: 'recipe', id: 'fletch_magic_longbow', description: 'Magic longbow — highest alch value bow' }],
  importance: 'minor',
});


// ══════════════════════════════════════════════════════════════════════════════
// HERBLORE
// ══════════════════════════════════════════════════════════════════════════════

bp({
  type: 'skill_level', trigger: { skill: 'herblore', level: 3 },
  description: 'Attack potions. Your first potion. Herblore stops being a mystery.',
  unlocks: [{ type: 'recipe', id: 'mix_attack', description: 'Mix attack potions' }],
  importance: 'minor',
});

bp({
  type: 'skill_level', trigger: { skill: 'herblore', level: 38 },
  description: 'Prayer potions. The most important potion in the game. Sustains protection prayers. Changes ALL bossing.',
  unlocks: [{ type: 'recipe', id: 'mix_prayer', description: 'Mix prayer potions — sustain protection prayers' }],
  importance: 'transformative',
});

bp({
  type: 'skill_level', trigger: { skill: 'herblore', level: 45 },
  description: 'Super attack potions. 5 + 15% attack boost. The super potion series begins.',
  unlocks: [{ type: 'recipe', id: 'mix_super_attack', description: 'Mix super attack potions' }],
  importance: 'minor',
});

bp({
  type: 'skill_level', trigger: { skill: 'herblore', level: 63 },
  description: 'Super restores. Restores prayer AND all stats. The premier sustain potion for bossing.',
  unlocks: [{ type: 'recipe', id: 'mix_super_restore', description: 'Mix super restores' }],
  importance: 'major',
});

bp({
  type: 'skill_level', trigger: { skill: 'herblore', level: 69 },
  description: 'Antifire potions. Required to fight dragons. Without this, dragonfire kills you. Whole boss category unlocked.',
  unlocks: [{ type: 'recipe', id: 'mix_antifire', description: 'Mix antifire — required for all dragon encounters' }],
  importance: 'major',
});

bp({
  type: 'skill_level', trigger: { skill: 'herblore', level: 81 },
  description: 'Saradomin brews. Heals 16 per dose. The endgame healing potion paired with super restores.',
  unlocks: [{ type: 'recipe', id: 'mix_sara_brew', description: 'Mix Saradomin brews' }],
  importance: 'major',
});

bp({
  type: 'skill_level', trigger: { skill: 'herblore', level: 90 },
  description: 'Overloads (if raids herblore). The ultimate combat potion. Boosts all combat stats massively.',
  unlocks: [{ type: 'recipe', id: 'mix_overload', description: 'Mix overload potions (raids only)' }],
  importance: 'major',
});


// ══════════════════════════════════════════════════════════════════════════════
// AGILITY
// ══════════════════════════════════════════════════════════════════════════════

bp({
  type: 'skill_level', trigger: { skill: 'agility', level: 10 },
  description: 'Run energy restores faster. The world stops feeling sluggish.',
  unlocks: [{ type: 'training_method', id: 'rooftop_courses', description: 'Draynor rooftop agility course' }],
  importance: 'minor',
});

bp({
  type: 'skill_level', trigger: { skill: 'agility', level: 40 },
  description: 'Several key shortcuts unlock. The Falador dungeon shortcut saves minutes per trip.',
  unlocks: [{ type: 'shortcut', id: 'falador_dungeon_pipe', description: 'Falador dungeon pipe shortcut' }],
  importance: 'minor',
});

bp({
  type: 'skill_level', trigger: { skill: 'agility', level: 70 },
  description: 'Most endgame shortcuts accessible. God Wars Dungeon shortcut. Bossing efficiency jumps.',
  unlocks: [{ type: 'shortcut', id: 'gwd_shortcut', description: 'God Wars Dungeon agility shortcut' }],
  importance: 'major',
});

bp({
  type: 'skill_level', trigger: { skill: 'agility', level: 92 },
  description: 'Hallowed Sepulchre floor 5. The best agility training in the game and one of the best money-makers.',
  unlocks: [{ type: 'training_method', id: 'sepulchre_f5', description: 'Hallowed Sepulchre floor 5 — best agility XP + profit' }],
  importance: 'major',
});


// ══════════════════════════════════════════════════════════════════════════════
// FARMING
// ══════════════════════════════════════════════════════════════════════════════

bp({
  type: 'skill_level', trigger: { skill: 'farming', level: 9 },
  description: 'Guam seeds plantable. The herblore pipeline begins. Farm -> herb -> potion -> combat.',
  unlocks: [{ type: 'training_method', id: 'herb_farming', description: 'Guam seed herb runs' }],
  importance: 'minor',
});

bp({
  type: 'skill_level', trigger: { skill: 'farming', level: 32 },
  description: 'Ranarr seeds. The money herb. Each ranarr herb run is 50k-100k profit. Farming funds everything.',
  unlocks: [{ type: 'training_method', id: 'ranarr_farming', description: 'Ranarr herb runs — the money printer' }],
  importance: 'major',
});

bp({
  type: 'skill_level', trigger: { skill: 'farming', level: 62 },
  description: 'Snapdragon seeds. Higher profit, higher herblore value. Super restores become self-sufficient.',
  unlocks: [{ type: 'training_method', id: 'snapdragon_farming', description: 'Snapdragon herb runs' }],
  importance: 'minor',
});

bp({
  type: 'skill_level', trigger: { skill: 'farming', level: 85 },
  description: 'Torstol seeds. The highest herb. Saradomin brew ingredients from your own farm.',
  unlocks: [{ type: 'training_method', id: 'torstol_farming', description: 'Torstol herb runs — endgame herblore' }],
  importance: 'minor',
});


// ══════════════════════════════════════════════════════════════════════════════
// SLAYER
// ══════════════════════════════════════════════════════════════════════════════

bp({
  type: 'skill_level', trigger: { skill: 'slayer', level: 1 },
  description: 'Slayer begins. The skill that makes combat structured. Kill assignments, earn points, unlock new monsters.',
  unlocks: [{ type: 'training_method', id: 'slayer_start', description: 'Basic slayer assignments' }],
  importance: 'minor',
});

bp({
  type: 'skill_level', trigger: { skill: 'slayer', level: 55 },
  description: 'Slayer helm craftable. 16.67% accuracy and damage boost on task. Slayer becomes THE combat training method.',
  unlocks: [{ type: 'item_equip', id: 'slayer_helm', description: 'Slayer helm — 16.67% boost on task' }],
  importance: 'transformative',
});

bp({
  type: 'skill_level', trigger: { skill: 'slayer', level: 72 },
  description: 'Skeletal wyverns. First serious slayer money-maker. Drops are worth millions per task.',
  unlocks: [{ type: 'training_method', id: 'skeletal_wyverns', description: 'Skeletal wyvern tasks' }],
  importance: 'minor',
});

bp({
  type: 'skill_level', trigger: { skill: 'slayer', level: 85 },
  description: 'Abyssal demons. Drops the Abyssal Whip — the iconic weapon. This is the goal people grind slayer for.',
  unlocks: [{ type: 'training_method', id: 'abyssal_demons', description: 'Abyssal demon tasks — whip drops' }],
  importance: 'major',
});

bp({
  type: 'skill_level', trigger: { skill: 'slayer', level: 91 },
  description: 'Cerberus. Drops primordial, pegasian, eternal crystals. BiS boots for all 3 combat styles.',
  unlocks: [{ type: 'boss', id: 'cerberus', description: 'Cerberus slayer boss — BiS boot upgrades' }],
  importance: 'major',
});

bp({
  type: 'skill_level', trigger: { skill: 'slayer', level: 95 },
  description: 'Hydra. Alchemical Hydra drops Hydra claw (Dragon Hunter Lance component). Best slayer gp/hr.',
  unlocks: [{ type: 'boss', id: 'alchemical_hydra', description: 'Alchemical Hydra — best slayer gp/hr' }],
  importance: 'transformative',
});


// ══════════════════════════════════════════════════════════════════════════════
// CONSTRUCTION
// ══════════════════════════════════════════════════════════════════════════════

bp({
  type: 'skill_level', trigger: { skill: 'construction', level: 20 },
  description: 'First house rooms. You have a HOUSE. It is empty and sad but it is yours.',
  unlocks: [{ type: 'training_method', id: 'basic_rooms', description: 'Build basic house rooms' }],
  importance: 'minor',
});

bp({
  type: 'skill_level', trigger: { skill: 'construction', level: 50 },
  description: 'Portals in your house. Teleport to major cities from your own home.',
  unlocks: [{ type: 'training_method', id: 'portal_rooms', description: 'Portal rooms — free teleports' }],
  importance: 'major',
});

bp({
  type: 'skill_level', trigger: { skill: 'construction', level: 67 },
  description: 'Gilded altar with two incense burners. 3.5x prayer XP. The reason most people train construction.',
  unlocks: [{ type: 'training_method', id: 'gilded_altar', description: 'Gilded altar — 3.5x prayer XP on bones' }],
  importance: 'transformative',
});

bp({
  type: 'skill_level', trigger: { skill: 'construction', level: 82 },
  description: 'Jewellery box (ornate). All teleport jewelry in one interface. Never carry jewelry again.',
  unlocks: [{ type: 'training_method', id: 'jewellery_box', description: 'Ornate jewellery box — every teleport, one click' }],
  importance: 'major',
});

bp({
  type: 'skill_level', trigger: { skill: 'construction', level: 83 },
  description: 'Rejuvenation pool (ornate). Restore HP, prayer, stats, special attack, run energy. Between every trip.',
  unlocks: [{ type: 'training_method', id: 'rejuvenation_pool', description: 'Ornate rejuvenation pool — full restore between trips' }],
  importance: 'transformative',
});


// ══════════════════════════════════════════════════════════════════════════════
// THIEVING
// ══════════════════════════════════════════════════════════════════════════════

bp({
  type: 'skill_level', trigger: { skill: 'thieving', level: 28 },
  description: 'Fruit stalls. Good XP, zero attention. Your first real AFK skilling method.',
  unlocks: [{ type: 'training_method', id: 'fruit_stalls', description: 'Fruit stall thieving — AFK' }],
  importance: 'minor',
});

bp({
  type: 'skill_level', trigger: { skill: 'thieving', level: 55 },
  description: 'Blackjacking. The highest thieving XP/hr in the game. Requires insane clicking.',
  unlocks: [{ type: 'training_method', id: 'blackjacking', description: 'Blackjacking — best XP but maximum attention' }],
  importance: 'minor',
});

bp({
  type: 'skill_level', trigger: { skill: 'thieving', level: 91 },
  description: 'Master farmers become very profitable. Rare herb seeds every few pickpockets.',
  unlocks: [{ type: 'training_method', id: 'master_farmers', description: 'Master farmer pickpocketing — herb seed source' }],
  importance: 'major',
});


// ══════════════════════════════════════════════════════════════════════════════
// HUNTER
// ══════════════════════════════════════════════════════════════════════════════

bp({
  type: 'skill_level', trigger: { skill: 'hunter', level: 53 },
  description: 'Chinchompas. Stackable ranged weapon. AoE ranged training in dungeons. Ranged training gets 3x faster.',
  unlocks: [{ type: 'training_method', id: 'chinchompa_catching', description: 'Chinchompa catching — explosive ranged ammo' }],
  importance: 'major',
});

bp({
  type: 'skill_level', trigger: { skill: 'hunter', level: 73 },
  description: 'Black chinchompas. Best ranged XP in the game (via chinning). Caught in the Wilds — PvP risk for PvM reward.',
  unlocks: [{ type: 'training_method', id: 'black_chinchompas', description: 'Black chinchompa catching — Wilds only, best ranged XP' }],
  importance: 'major',
});


// ══════════════════════════════════════════════════════════════════════════════
// QUEST BREAKPOINTS — Quests that transform the game
// ══════════════════════════════════════════════════════════════════════════════

bp({
  type: 'quest_complete', trigger: { quest: 'desert_treasure' },
  description: 'Desert Treasure. Unlocks Ancient Magicks spellbook. Ice Barrage, Blood Barrage, Smoke Barrage. The game splits into "before Ancient Magicks" and "after."',
  unlocks: [
    { type: 'spellbook', id: 'ancient_magicks', description: 'Ancient Magicks — ice/blood/smoke barrage spells' },
    { type: 'area', id: 'boneyard_pyramid', description: 'Full Boneyard Pyramid access' },
  ],
  importance: 'transformative',
});

bp({
  type: 'quest_complete', trigger: { quest: 'lunar_diplomacy' },
  description: 'Lunar Diplomacy. Unlocks Lunar Spellbook. Vengeance, Heal Group, NPC Contact, Humidify. Utility magic that changes every activity.',
  unlocks: [
    { type: 'spellbook', id: 'lunar_spellbook', description: 'Lunar spellbook — utility magic' },
    { type: 'area', id: 'inkweald_lunar_plane', description: 'Lunar Plane access' },
  ],
  importance: 'transformative',
});

bp({
  type: 'quest_complete', trigger: { quest: 'monkey_business' },
  description: 'Monkey Business. Dragon scimitar equippable. The mid-game melee standard. Also unlocks monkey greegrees.',
  unlocks: [
    { type: 'item_equip', id: 'dragon_scimitar', description: 'Dragon scimitar equippable' },
    { type: 'shop', id: 'dragon_scimitar_shop', description: 'Dragon scimitar shop on monkey island' },
  ],
  importance: 'major',
});

bp({
  type: 'quest_complete', trigger: { quest: 'the_inkweald_door' },
  description: 'The Inkweald Door. Full access to The Inkweald region. Dream Magic spellbook. A new region to explore.',
  unlocks: [
    { type: 'area', id: 'inkweald', description: 'The Inkweald — surreal dream forest' },
    { type: 'spellbook', id: 'dream_magic', description: 'Dream Magic spellbook' },
  ],
  importance: 'major',
});

bp({
  type: 'quest_complete', trigger: { quest: 'dragon_slayer_aelgard' },
  description: 'Dragon Slayer. Anti-dragon shield. Rune platebody equippable. The original "you beat the game" moment.',
  unlocks: [
    { type: 'item_equip', id: 'rune_platebody', description: 'Rune platebody equippable' },
    { type: 'item_equip', id: 'anti_dragon_shield', description: 'Anti-dragon shield' },
    { type: 'area', id: 'sootworks_deep_mines', description: 'Deep mines access' },
  ],
  importance: 'transformative',
});

bp({
  type: 'quest_complete', trigger: { quest: 'rfd_finale' },
  description: 'Recipe for Disaster. Barrows Gloves. BiS hand slot for melee. The mid-game achievement everyone works toward.',
  unlocks: [
    { type: 'item_equip', id: 'barrows_gloves', description: 'Barrows Gloves — BiS melee hands' },
    { type: 'shop', id: 'culinaromancers_chest', description: "Culinaromancer's Chest" },
  ],
  importance: 'transformative',
});

bp({
  type: 'quest_complete', trigger: { quest: 'song_of_the_elves_aelgard' },
  description: 'Song of the Elves. Veilwood Inner Sanctum. Crystal crafting. Crystal mining. The endgame crafting hub.',
  unlocks: [
    { type: 'area', id: 'veilwood_inner_sanctum', description: 'Veilwood Inner Sanctum — best anvil, crystal crafting' },
    { type: 'training_method', id: 'crystal_crafting', description: 'Crystal crafting — high-level crafting' },
  ],
  importance: 'major',
});

bp({
  type: 'quest_complete', trigger: { quest: 'blood_rites' },
  description: 'Blood Rites. The Barrows. Repeatable boss encounter with degradable set equipment drops. Endgame armour source.',
  unlocks: [
    { type: 'area', id: 'moryskah_barrows', description: 'The Barrows — repeatable boss, set drops' },
    { type: 'prayer', id: 'protect_from_undead', description: 'Protect from Undead prayer' },
  ],
  importance: 'major',
});

bp({
  type: 'quest_complete', trigger: { quest: 'echoes_of_the_deep' },
  description: 'Echoes of the Deep. Full Glass Desert access. Underground tunnel network. Crystal mining. Endgame region.',
  unlocks: [
    { type: 'area', id: 'glass_desert', description: 'The Glass Desert — endgame region' },
    { type: 'teleport', id: 'tunnel_network', description: 'Underground tunnel network' },
  ],
  importance: 'major',
});

bp({
  type: 'quest_complete', trigger: { quest: 'sins_of_malachar' },
  description: 'Sins of Malachar. Castle Malachar raid. Lord Malachar boss. Scythe of Malachar — the most powerful melee weapon.',
  unlocks: [
    { type: 'area', id: 'castle_malachar', description: 'Castle Malachar — Theatre of Blood equivalent' },
    { type: 'boss', id: 'lord_malachar', description: 'Lord Malachar — drops Scythe of Malachar' },
  ],
  importance: 'transformative',
});

bp({
  type: 'quest_complete', trigger: { quest: 'the_last_light' },
  description: 'The Last Light. Post-game content. Eclipse Guardian boss. Solar Blessing prayer. The game after the game.',
  unlocks: [
    { type: 'area', id: 'new_sun_zone', description: 'New Sun Zone' },
    { type: 'boss', id: 'eclipse_guardian', description: 'Eclipse Guardian — post-game boss' },
    { type: 'prayer', id: 'solar_blessing', description: 'Solar Blessing — passive HP regeneration' },
  ],
  importance: 'transformative',
});


// ══════════════════════════════════════════════════════════════════════════════
// ITEM BREAKPOINTS — Items that shift the meta
// ══════════════════════════════════════════════════════════════════════════════

bp({
  type: 'item_acquired', trigger: { item: 'Abyssal whip' },
  description: 'Abyssal whip. The iconic melee weapon. Fast, strong, elegant. Everything before this was practice.',
  unlocks: [{ type: 'item_equip', id: 'abyssal_whip', description: 'Best non-degradable melee weapon' }],
  importance: 'major',
});

bp({
  type: 'item_acquired', trigger: { item: 'Toxic blowpipe' },
  description: 'Toxic blowpipe. The fastest ranged weapon. Applies venom. Changes how you approach every ranged encounter.',
  unlocks: [{ type: 'item_equip', id: 'toxic_blowpipe', description: 'Best DPS ranged weapon for most encounters' }],
  importance: 'major',
});

bp({
  type: 'item_acquired', trigger: { item: 'Trident of the swamp' },
  description: 'Trident of the swamp. Built-in spell, no rune cost visible. Magic combat becomes viable for sustained PvM.',
  unlocks: [{ type: 'item_equip', id: 'trident', description: 'Magic combat weapon with built-in spell' }],
  importance: 'major',
});

bp({
  type: 'item_acquired', trigger: { item: 'Dragon hunter lance' },
  description: 'Dragon hunter lance. 20% accuracy and damage against all dragons. Every dragon boss is now significantly easier.',
  unlocks: [{ type: 'item_equip', id: 'dragon_hunter_lance', description: 'BiS against all draconic monsters' }],
  importance: 'major',
});

bp({
  type: 'item_acquired', trigger: { item: 'Barrows Gloves' },
  description: 'Barrows Gloves. The culmination of Recipe for Disaster. BiS hands. A rite of passage every account completes.',
  unlocks: [{ type: 'item_equip', id: 'barrows_gloves', description: 'BiS melee hand slot — a milestone' }],
  importance: 'transformative',
});

bp({
  type: 'item_acquired', trigger: { item: 'Scythe of Malachar' },
  description: 'Scythe of Malachar. Hits 3 times per swing on large monsters. The most powerful melee weapon. The endgame flex. Degrades.',
  unlocks: [{ type: 'item_equip', id: 'scythe', description: 'Triple-hit melee weapon — BiS for large monsters' }],
  importance: 'transformative',
});

bp({
  type: 'item_acquired', trigger: { item: 'Fire cape' },
  description: 'Fire cape. Proof you completed the Fight Caves. BiS melee cape. Every serious player has one.',
  unlocks: [{ type: 'item_equip', id: 'fire_cape', description: 'BiS melee cape — Fight Caves completion proof' }],
  importance: 'transformative',
});

bp({
  type: 'item_acquired', trigger: { item: 'Infernal cape' },
  description: 'Infernal cape. The hardest PvM challenge in the game. Replaces Fire cape. The ultimate achievement.',
  unlocks: [{ type: 'item_equip', id: 'infernal_cape', description: 'BiS melee cape — proof of mastery' }],
  importance: 'transformative',
});


console.log(`[aelgard] Breakpoints loaded: ${count} breakpoints registered`);
