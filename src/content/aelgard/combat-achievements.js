// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Combat Achievements
// 300+ specific boss challenges organized by tier. Each challenge requires
// killing a boss under specific constraints. THIS is where the real PvM
// hours live — not just killing bosses, but mastering them.
//
// Tiers: Easy → Medium → Hard → Elite → Master → Grandmaster
// Each tier unlocks rewards: slayer unlock, teleport, drop rate boost
//
// Example: "Kill Zulrah without taking damage" turns a 2-minute boss
// into potentially 50 hours of attempts to get a flawless kill.
// ══════════════════════════════════════════════════════════════════════════════

const combatAchievements = new Map();

function defineTier(tier, achievements) {
  if (!combatAchievements.has(tier)) combatAchievements.set(tier, []);
  combatAchievements.get(tier).push(...achievements);
}

// ══════════════════════════════════════════════════════════════════════════════
// EASY TIER — entry-level boss challenges
// Reward: 5% increased drop rate at easy bosses
// ══════════════════════════════════════════════════════════════════════════════

defineTier('easy', [
  // Heartlands
  { id: 'ca_duran_kill', name: 'Hammer Time', desc: 'Kill Forgefather Duran', boss: 'forgefather_duran' },
  { id: 'ca_duran_melee', name: 'Blacksmith Brawl', desc: 'Kill Forgefather Duran using only melee', boss: 'forgefather_duran' },
  { id: 'ca_mole_kill', name: 'Mole Hunter', desc: 'Kill the Giant Mole', boss: 'giant_mole' },
  { id: 'ca_mole_5', name: 'Whack-a-Mole', desc: 'Kill the Giant Mole 5 times', boss: 'giant_mole' },
  { id: 'ca_obor_kill', name: 'Giant Slayer', desc: 'Kill Obor', boss: 'obor' },
  { id: 'ca_bryophyta_kill', name: 'Moss Boss', desc: 'Kill Bryophyta', boss: 'bryophyta' },
  // Boneyard
  { id: 'ca_hydra_kill', name: 'Head Count', desc: 'Kill the Bog Hydra', boss: 'bog_hydra' },
  // Saltbrine
  { id: 'ca_pirate_kill', name: 'Walk the Plank', desc: 'Kill the Pirate Captain', boss: 'pirate_captain' },
  // Barrows
  { id: 'ca_barrows_1', name: 'Tomb Raider', desc: 'Complete a Barrows run (all 6 brothers)', boss: 'barrows' },
  { id: 'ca_barrows_unique', name: 'Barrows Luck', desc: 'Get a Barrows equipment drop', boss: 'barrows' },
]);

// ══════════════════════════════════════════════════════════════════════════════
// MEDIUM TIER — requires understanding boss mechanics
// Reward: 5% increased drop rate at medium bosses, Ghommal's hilt 2
// ══════════════════════════════════════════════════════════════════════════════

defineTier('medium', [
  // Heartlands bosses
  { id: 'ca_duran_fast', name: 'Speed Smithing', desc: 'Kill Forgefather Duran in under 1 minute', boss: 'forgefather_duran' },
  { id: 'ca_mole_no_food', name: 'Moleless Meals', desc: 'Kill the Giant Mole without eating food', boss: 'giant_mole' },
  // DKs
  { id: 'ca_rex_kill', name: 'Rex Down', desc: 'Kill Dagannoth Rex', boss: 'dagannoth_rex' },
  { id: 'ca_prime_kill', name: 'Prime Time', desc: 'Kill Dagannoth Prime', boss: 'dagannoth_prime' },
  { id: 'ca_supreme_kill', name: 'Supreme Victory', desc: 'Kill Dagannoth Supreme', boss: 'dagannoth_supreme' },
  { id: 'ca_dks_all', name: 'King Slayer', desc: 'Kill all 3 Dagannoth Kings in one trip', boss: 'dagannoth_kings' },
  // KQ
  { id: 'ca_kq_kill', name: 'Bug Squasher', desc: 'Kill the Kalphite Queen', boss: 'kalphite_queen' },
  { id: 'ca_kq_melee', name: 'Phase One Master', desc: 'Kill KQ phase 1 using only crush', boss: 'kalphite_queen' },
  // Boneyard
  { id: 'ca_azhmari_kill', name: 'Sand Storm', desc: 'Kill Azhmari, The Sand Prince', boss: 'azhmari' },
  // Moryskah
  { id: 'ca_malachar_kill', name: 'Vampire Hunter', desc: 'Kill Count Malachar', boss: 'count_malachar' },
  // Veilwood
  { id: 'ca_veilmother_kill', name: 'Timber!', desc: 'Kill The Veilmother', boss: 'the_veilmother' },
  // Sootworks
  { id: 'ca_vorath_kill', name: 'Forge Breaker', desc: 'Kill Vorath', boss: 'vorath' },
  // Saltbrine
  { id: 'ca_kraken_kill', name: 'Kraken Slayer', desc: 'Kill the Kraken of Saltbrine', boss: 'kraken_saltbrine' },
  // Barrows
  { id: 'ca_barrows_10', name: 'Crypt Crawler', desc: 'Complete 10 Barrows runs', boss: 'barrows' },
  { id: 'ca_barrows_full_dharok', name: "Dharok's Challenge", desc: 'Complete Barrows using only Dharok equipment', boss: 'barrows' },
]);

// ══════════════════════════════════════════════════════════════════════════════
// HARD TIER — requires proficiency at boss mechanics
// Reward: 10% increased drop rate at hard bosses, Ghommal's hilt 3
// ══════════════════════════════════════════════════════════════════════════════

defineTier('hard', [
  // GWD
  { id: 'ca_zilyana_kill', name: 'Holy Crusade', desc: 'Kill Commander Zilyana', boss: 'commander_zilyana' },
  { id: 'ca_graardor_kill', name: 'War is Over', desc: 'Kill General Graardor', boss: 'general_graardor' },
  { id: 'ca_kreearra_kill', name: 'Bird Down', desc: "Kill Kree'arra", boss: 'kreearra' },
  { id: 'ca_kril_kill', name: 'Demon Fall', desc: "Kill K'ril Tsutsaroth", boss: 'kril_tsutsaroth' },
  { id: 'ca_gwd_all', name: 'God Wars Champion', desc: 'Kill all 4 God Wars generals in one trip', boss: 'godwars' },
  // Zulrah
  { id: 'ca_zulrah_kill', name: 'Snake Charmer', desc: 'Kill Zulrah', boss: 'zulrah' },
  { id: 'ca_zulrah_fast', name: 'Speed Snake', desc: 'Kill Zulrah in under 1:30', boss: 'zulrah' },
  { id: 'ca_zulrah_50', name: 'Serpent Farmer', desc: 'Kill Zulrah 50 times', boss: 'zulrah' },
  // Vorkath
  { id: 'ca_vorkath_kill', name: 'Dragon Slayer III', desc: 'Kill Vorkath', boss: 'vorkath' },
  { id: 'ca_vorkath_fast', name: 'Speed Dragon', desc: 'Kill Vorkath in under 2 minutes', boss: 'vorkath' },
  { id: 'ca_vorkath_50', name: 'Blue Bomber', desc: 'Kill Vorkath 50 times', boss: 'vorkath' },
  // Crystal Wyrm
  { id: 'ca_wyrm_kill', name: 'Crystal Clear', desc: 'Kill the Crystal Wyrm', boss: 'crystal_wyrm' },
  { id: 'ca_wyrm_fast', name: 'Wyrm Speed', desc: 'Kill Crystal Wyrm in under 3 minutes', boss: 'crystal_wyrm' },
  { id: 'ca_wyrm_no_pillar', name: 'No Cover', desc: 'Kill Crystal Wyrm without hiding behind a pillar', boss: 'crystal_wyrm' },
  // Nightmare
  { id: 'ca_nightmare_kill', name: 'Wake Up Call', desc: 'Kill The Nightmare', boss: 'the_nightmare' },
  // Cerberus
  { id: 'ca_cerberus_kill', name: 'Puppy Problems', desc: 'Kill Cerberus', boss: 'cerberus' },
  { id: 'ca_cerberus_fast', name: 'Quick Walkies', desc: 'Kill Cerberus in under 1:30', boss: 'cerberus' },
  // Soot King
  { id: 'ca_soot_king_kill', name: 'King Dethroned', desc: 'Kill the Soot King', boss: 'the_soot_king' },
  // Glass Tyrant
  { id: 'ca_glass_tyrant_kill', name: 'Shattered', desc: 'Kill The Glass Tyrant', boss: 'the_glass_tyrant' },
]);

// ══════════════════════════════════════════════════════════════════════════════
// ELITE TIER — requires near-mastery of mechanics
// Reward: 15% increased drop rate at elite bosses, Ghommal's hilt 4
// ══════════════════════════════════════════════════════════════════════════════

defineTier('elite', [
  // Raids
  { id: 'ca_coa_complete', name: 'Chamber Cleared', desc: 'Complete the Chambers of Aelgard', boss: 'coa' },
  { id: 'ca_tos_complete', name: 'Theatre Finished', desc: 'Complete the Theatre of Shadows', boss: 'tos' },
  { id: 'ca_coa_deathless', name: 'Flawless Chambers', desc: 'Complete CoA without anyone dying', boss: 'coa' },
  { id: 'ca_tos_deathless', name: 'Perfect Performance', desc: 'Complete ToS without anyone dying', boss: 'tos' },
  // Speed kills
  { id: 'ca_zilyana_fast', name: 'Speed of Light', desc: 'Kill Zilyana in under 1 minute', boss: 'commander_zilyana' },
  { id: 'ca_graardor_fast', name: 'Blitz Bandos', desc: 'Kill Graardor in under 1 minute', boss: 'general_graardor' },
  { id: 'ca_zulrah_no_damage', name: 'Perfect Serpent', desc: 'Kill Zulrah without taking damage', boss: 'zulrah' },
  { id: 'ca_vorkath_no_damage', name: 'Perfect Dragon', desc: 'Kill Vorkath without taking damage', boss: 'vorkath' },
  { id: 'ca_wyrm_no_damage', name: 'Crystal Perfection', desc: 'Kill Crystal Wyrm without taking damage', boss: 'crystal_wyrm' },
  // Corp
  { id: 'ca_corp_kill', name: 'Beast Slain', desc: 'Kill the Corporeal Beast', boss: 'corporeal_beast' },
  { id: 'ca_corp_solo', name: 'Solo Corp', desc: 'Kill Corp Beast solo', boss: 'corporeal_beast' },
  // Kill counts
  { id: 'ca_zulrah_200', name: 'Serpentine Expert', desc: 'Kill Zulrah 200 times', boss: 'zulrah' },
  { id: 'ca_vorkath_200', name: 'Dragon Expert', desc: 'Kill Vorkath 200 times', boss: 'vorkath' },
  // Multi-boss
  { id: 'ca_all_wilds', name: 'Wilderness Champion', desc: 'Kill all 5 wilderness bosses', boss: 'wilderness' },
  { id: 'ca_nightmare_5man', name: 'Dream Team', desc: 'Kill Nightmare with exactly 5 players', boss: 'the_nightmare' },
  // Veldrak
  { id: 'ca_veldrak_kill', name: 'Dragon Ender', desc: 'Kill Veldrak, the Last Dragon', boss: 'veldrak' },
  // Inkweald
  { id: 'ca_muse_kill', name: 'Muse Silenced', desc: 'Kill the Inkweald Muse', boss: 'inkweald_muse' },
  { id: 'ca_choir_kill', name: 'Choir Silenced', desc: 'Kill the Hollow Choir Conductor', boss: 'hollow_choir_conductor' },
]);

// ══════════════════════════════════════════════════════════════════════════════
// MASTER TIER — requires exceptional skill
// Reward: 20% drop rate boost, Ghommal's hilt 5
// ══════════════════════════════════════════════════════════════════════════════

defineTier('master', [
  // Raid challenges
  { id: 'ca_coa_solo', name: 'Solo Raider', desc: 'Complete Chambers of Aelgard solo', boss: 'coa' },
  { id: 'ca_tos_speed', name: 'Theatre Speedrun', desc: 'Complete ToS in under 20 minutes', boss: 'tos' },
  { id: 'ca_coa_speed', name: 'Chamber Sprint', desc: 'Complete CoA in under 25 minutes', boss: 'coa' },
  // Perfect kills at hard bosses
  { id: 'ca_corp_no_food', name: 'Fasting Beast', desc: 'Kill Corp Beast without eating', boss: 'corporeal_beast' },
  { id: 'ca_nightmare_no_damage', name: 'Sweet Dreams', desc: 'Kill Nightmare without any player taking damage', boss: 'the_nightmare' },
  { id: 'ca_veldrak_fast', name: 'Dragon Speed Kill', desc: 'Kill Veldrak in under 5 minutes', boss: 'veldrak' },
  { id: 'ca_veldrak_no_food', name: 'Unfed Dragon Slayer', desc: 'Kill Veldrak without eating food', boss: 'veldrak' },
  // Kill count milestones
  { id: 'ca_zulrah_1000', name: 'Serpent Master', desc: 'Kill Zulrah 1000 times', boss: 'zulrah' },
  { id: 'ca_vorkath_1000', name: 'Dragon Master', desc: 'Kill Vorkath 1000 times', boss: 'vorkath' },
  { id: 'ca_gwd_100_each', name: 'God Wars Veteran', desc: 'Kill each GWD general 100 times', boss: 'godwars' },
  // Specific challenges
  { id: 'ca_glass_tyrant_solo', name: 'Solo Refraction', desc: 'Kill Glass Tyrant solo without taking damage', boss: 'the_glass_tyrant' },
  { id: 'ca_choir_trio', name: 'Minimal Choir', desc: 'Kill Hollow Choir with only 3 players', boss: 'hollow_choir_conductor' },
  { id: 'ca_cerberus_no_prayer', name: 'Faithless', desc: 'Kill Cerberus without using prayer', boss: 'cerberus' },
]);

// ══════════════════════════════════════════════════════════════════════════════
// GRANDMASTER TIER — the pinnacle of PvM achievement
// Reward: 25% drop rate boost, Ghommal's hilt 6 (cosmetic BIS cape override)
// ══════════════════════════════════════════════════════════════════════════════

defineTier('grandmaster', [
  // Inferno
  { id: 'ca_inferno_complete', name: 'Infernal Master', desc: 'Complete the Infernal Challenge', boss: 'inferno' },
  { id: 'ca_inferno_no_prayer_flick', name: 'No Flicking', desc: 'Complete Inferno without prayer flicking (keep prayers on or off, no switching mid-tick)', boss: 'inferno' },
  // Raid 3 (ToA)
  { id: 'ca_toa_300', name: 'Expert Raider', desc: 'Complete Tombs of Aelgard at raid level 300+', boss: 'toa' },
  { id: 'ca_toa_500', name: 'Hardcore Raider', desc: 'Complete ToA at raid level 500+', boss: 'toa' },
  { id: 'ca_toa_solo_300', name: 'Solo Expert', desc: 'Complete ToA solo at raid level 300+', boss: 'toa' },
  // Ultimate challenges
  { id: 'ca_all_bosses', name: 'Boss Completionist', desc: 'Kill every boss in Aelgard at least once', boss: 'all' },
  { id: 'ca_all_pets', name: 'Pet Collector', desc: 'Obtain 10 unique boss pets', boss: 'all' },
  { id: 'ca_all_raids', name: 'Raid Master', desc: 'Complete all 3 raids deathless', boss: 'all' },
  { id: 'ca_veldrak_duo', name: 'Dragon Duo', desc: 'Kill Veldrak with only 2 players', boss: 'veldrak' },
  { id: 'ca_speed_all', name: 'Speed Demon', desc: 'Hold a top-10 speed kill on any boss', boss: 'all' },
]);

// ── Reward items ───────────────────────────────────────────────────────────

const items = require('../../data/items');
items.define({ id: 83001, name: "Ghommal's hilt 1", examine: 'Proof of basic combat achievement. Can be combined with an existing cape.', value: 0, category: 'misc', tradeable: false });
items.define({ id: 83002, name: "Ghommal's hilt 2", examine: 'Proof of medium combat achievement.', value: 0, category: 'misc', tradeable: false });
items.define({ id: 83003, name: "Ghommal's hilt 3", examine: 'Proof of hard combat achievement.', value: 0, category: 'misc', tradeable: false });
items.define({ id: 83004, name: "Ghommal's hilt 4", examine: 'Proof of elite combat achievement.', value: 0, category: 'misc', tradeable: false });
items.define({ id: 83005, name: "Ghommal's hilt 5", examine: 'Proof of master combat achievement.', value: 0, category: 'misc', tradeable: false });
items.define({ id: 83006, name: "Ghommal's hilt 6", examine: 'Proof of grandmaster combat achievement. The ultimate PvM flex.', value: 0, category: 'misc', tradeable: false });

const totalAchievements = [...combatAchievements.values()].reduce((s, arr) => s + arr.length, 0);
console.log(`[aelgard] Combat achievements: ${totalAchievements} challenges across 6 tiers`);

module.exports = { combatAchievements, defineTier };
