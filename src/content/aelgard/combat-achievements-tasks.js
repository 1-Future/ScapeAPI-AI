// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Combat Achievements Task Data
//
// 210+ per-boss tasks across 30 bosses, 6 tiers.
// Every task is auditable against the 18 Scape-Builder-Injects principles
// (see manifesto / builder-injects). Each task lists the injects it exercises
// so the codex can surface the design intent.
//
// Categories per spec:
//   kc          — kill count milestones
//   restriction — "without X" (no prayer, no food, no damage)
//   speed       — under-time kills
//   mechanic    — master a specific phase/mechanic (no chip damage, etc.)
//   gear        — restricted equipment (tier-60 melee, etc.)
//   solo        — solo a normally-partied boss
//   perfection  — combined perfection (flawless)
//
// Points per task are derived from tier difficulty in the engine module
// (easy=1 / medium=2 / hard=4 / elite=6 / master=8 / grandmaster=12) — we do
// not override points here; we trust the engine default.
//
// Points targets vs tier thresholds:
//   easy        33 / 40 easy pts available  (40 * 1)
//   medium      75 / 80 medium pts          (40 * 2)
//   hard       200 / 220 hard pts           (55 * 4)
//   elite      400 / 420 elite pts          (70 * 6)
//   master     700 / 720 master pts         (90 * 8)
//   grandmaster 1200 / 1200 grandmaster pts (100 * 12)
//   (some tasks push well above the threshold so players can pick which
//    tasks they enjoy and skip the ones they hate — design P03 self-direction.)
//
// Injects reference:
//   1. Downtime-is-earned         — task requires prior effort (kc ladders)
//   2. Breakpoint-visible         — perk-granting tiers are staircases
//   3. Self-direction             — tasks are a menu, not a checklist
//   4. Unique-mechanic            — restriction tasks push mechanic mastery
//   5. Risk-before-reward         — restriction/speed tasks raise risk
//   6. Permanence                 — "once complete, always complete"
//   7. Encounter-itemization      — gear restrictions surface tier-specific gear
//   8. Dependency-web             — unlocks chained perks
//   9. Skill-combination          — no single-skill completion
//   10. Permadeath-respect        — elite/master require near-flawless play
//   11. Grinding-legitimate       — kc tasks acknowledge grind
//   12. Attention-tax             — speed tasks demand focus
//   13. MAX-focus-content         — perfection tasks ≈ Inferno-style
//   14. PvM-variety               — tasks cover kill/speed/solo/gear/mechanic
//   15. Economy-respect           — perk rewards (not more GP)
//   16. Build-variety             — gear tasks encourage alt builds
//   17. Community-legitimacy      — server-first / tier completions showcase
//   18. Humanism                  — permanent perks respect player time
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const ca = require('../../engine/combat-achievements');

function r(bossId, t) { return ca.registerTask(bossId, t); }

// Short-hand for a task; expands the "injects" array to an array of numbers,
// and defaults "category" to 'mechanic' when unspecified.
function T(opts) {
  return {
    id: opts.id,
    name: opts.name,
    description: opts.description,
    tier: opts.tier,
    difficulty: opts.difficulty || opts.tier,
    category: opts.category || 'mechanic',
    injects: opts.injects || [],
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// 1) Forgefather Duran — Heartlands (starter boss)
// ══════════════════════════════════════════════════════════════════════════════
r('forgefather_duran', T({ id: 'ca_duran_kill_1',        name: 'Smith, Meet Hammer',      description: 'Defeat Forgefather Duran.',                                      tier: 'easy',     category: 'kc',          injects: [1, 11, 18] }));
r('forgefather_duran', T({ id: 'ca_duran_kill_10',       name: 'Duran Regular',           description: 'Defeat Forgefather Duran 10 times.',                             tier: 'easy',     category: 'kc',          injects: [1, 11] }));
r('forgefather_duran', T({ id: 'ca_duran_melee_only',    name: 'Old-School Brawl',        description: 'Defeat Forgefather Duran using only melee.',                     tier: 'easy',     category: 'gear',        injects: [7, 14, 16] }));
r('forgefather_duran', T({ id: 'ca_duran_no_prayer',     name: 'Unfaithful Apprentice',   description: 'Defeat Forgefather Duran without using prayer.',                 tier: 'medium',   category: 'restriction', injects: [4, 5, 10] }));
r('forgefather_duran', T({ id: 'ca_duran_speed_60',      name: 'Speed Smithing',          description: 'Defeat Forgefather Duran in under 60 seconds.',                  tier: 'medium',   category: 'speed',       injects: [12, 13] }));
r('forgefather_duran', T({ id: 'ca_duran_no_damage',     name: 'Flawless Forge',          description: 'Defeat Forgefather Duran without taking damage.',                tier: 'hard',     category: 'perfection',  injects: [4, 10, 13] }));
r('forgefather_duran', T({ id: 'ca_duran_kill_100',      name: 'Duran Veteran',           description: 'Defeat Forgefather Duran 100 times.',                            tier: 'hard',     category: 'kc',          injects: [1, 11] }));

// ══════════════════════════════════════════════════════════════════════════════
// 2) Giant Mole — Heartlands
// ══════════════════════════════════════════════════════════════════════════════
r('giant_mole', T({ id: 'ca_mole_kill_1',    name: 'Mole Hunter',         description: 'Defeat the Giant Mole.',                                     tier: 'easy',   category: 'kc',          injects: [1, 11] }));
r('giant_mole', T({ id: 'ca_mole_kill_10',   name: 'Whack-a-Mole',        description: 'Defeat the Giant Mole 10 times.',                            tier: 'easy',   category: 'kc',          injects: [1, 11] }));
r('giant_mole', T({ id: 'ca_mole_kill_100',  name: 'Mole Master',         description: 'Defeat the Giant Mole 100 times.',                           tier: 'hard',   category: 'kc',          injects: [1, 11] }));
r('giant_mole', T({ id: 'ca_mole_no_food',   name: 'Hollow Belly',        description: 'Defeat the Giant Mole without eating food.',                 tier: 'medium', category: 'restriction', injects: [5, 10] }));
r('giant_mole', T({ id: 'ca_mole_no_dig',    name: 'Above Ground',        description: 'Defeat the Giant Mole without letting it burrow.',           tier: 'hard',   category: 'mechanic',    injects: [4, 12, 13] }));
r('giant_mole', T({ id: 'ca_mole_speed_90',  name: 'Mole on the Move',    description: 'Defeat the Giant Mole in under 90 seconds.',                 tier: 'medium', category: 'speed',       injects: [12] }));
r('giant_mole', T({ id: 'ca_mole_t60_melee', name: 'Mithril Mole',        description: 'Defeat the Giant Mole using only tier-60 melee gear.',       tier: 'medium', category: 'gear',        injects: [7, 16] }));

// ══════════════════════════════════════════════════════════════════════════════
// 3) Obor — Heartlands Giant
// ══════════════════════════════════════════════════════════════════════════════
r('obor_heartlands', T({ id: 'ca_obor_kill_1',     name: 'Giant Slayer',      description: 'Defeat Obor.',                                             tier: 'easy',   category: 'kc',          injects: [1] }));
r('obor_heartlands', T({ id: 'ca_obor_kill_10',    name: 'Giant Bane',        description: 'Defeat Obor 10 times.',                                    tier: 'easy',   category: 'kc',          injects: [1, 11] }));
r('obor_heartlands', T({ id: 'ca_obor_no_prayer',  name: 'Faithless Slayer',  description: 'Defeat Obor without using prayer.',                        tier: 'medium', category: 'restriction', injects: [4, 5] }));
r('obor_heartlands', T({ id: 'ca_obor_no_damage',  name: 'Giant Evader',      description: 'Defeat Obor without taking damage.',                       tier: 'hard',   category: 'perfection',  injects: [10, 13] }));
r('obor_heartlands', T({ id: 'ca_obor_kill_50',    name: 'Giant Stalker',     description: 'Defeat Obor 50 times.',                                    tier: 'medium', category: 'kc',          injects: [1, 11] }));
r('obor_heartlands', T({ id: 'ca_obor_speed_60',   name: 'Speed Slayer',      description: 'Defeat Obor in under 60 seconds.',                         tier: 'medium', category: 'speed',       injects: [12] }));
r('obor_heartlands', T({ id: 'ca_obor_mage_only',  name: 'Spellsword',        description: 'Defeat Obor using only magic.',                            tier: 'medium', category: 'gear',        injects: [7, 14, 16] }));

// ══════════════════════════════════════════════════════════════════════════════
// 4) Bryophyta — Heartlands (moss boss)
// ══════════════════════════════════════════════════════════════════════════════
r('bryophyta_heartlands', T({ id: 'ca_bryo_kill_1',     name: 'Moss Boss',           description: 'Defeat Bryophyta.',                                       tier: 'easy',   category: 'kc',          injects: [1] }));
r('bryophyta_heartlands', T({ id: 'ca_bryo_kill_10',    name: 'Moss Harvester',      description: 'Defeat Bryophyta 10 times.',                              tier: 'easy',   category: 'kc',          injects: [1, 11] }));
r('bryophyta_heartlands', T({ id: 'ca_bryo_no_damage',  name: 'Moss-free',           description: 'Defeat Bryophyta without taking damage.',                 tier: 'hard',   category: 'perfection',  injects: [10, 13] }));
r('bryophyta_heartlands', T({ id: 'ca_bryo_speed_60',   name: 'Moss Mower',          description: 'Defeat Bryophyta in under 60 seconds.',                   tier: 'medium', category: 'speed',       injects: [12] }));
r('bryophyta_heartlands', T({ id: 'ca_bryo_fire_only',  name: 'Scorched Earth',      description: 'Defeat Bryophyta using only fire spells.',                tier: 'medium', category: 'gear',        injects: [7, 14] }));
r('bryophyta_heartlands', T({ id: 'ca_bryo_no_pray',    name: 'Undevout Gardener',   description: 'Defeat Bryophyta without using prayer.',                  tier: 'medium', category: 'restriction', injects: [4, 5] }));
r('bryophyta_heartlands', T({ id: 'ca_bryo_kill_50',    name: 'Mossbane',            description: 'Defeat Bryophyta 50 times.',                              tier: 'medium', category: 'kc',          injects: [1, 11] }));

// ══════════════════════════════════════════════════════════════════════════════
// 5) Dagannoth Rex — Melee King (Saltbrine)
// ══════════════════════════════════════════════════════════════════════════════
r('dagannoth_rex', T({ id: 'ca_rex_kill_1',     name: 'Rex Down',             description: 'Defeat Dagannoth Rex.',                                    tier: 'easy',   category: 'kc',          injects: [1] }));
r('dagannoth_rex', T({ id: 'ca_rex_kill_10',    name: 'Rex Regular',          description: 'Defeat Dagannoth Rex 10 times.',                           tier: 'easy',   category: 'kc',          injects: [1, 11] }));
r('dagannoth_rex', T({ id: 'ca_rex_magic_only', name: 'Proper Protection',    description: 'Defeat Dagannoth Rex using only magic (his weakness).',    tier: 'medium', category: 'gear',        injects: [7, 14, 16] }));
r('dagannoth_rex', T({ id: 'ca_rex_no_damage',  name: 'Flawless Rex',         description: 'Defeat Dagannoth Rex without taking damage.',              tier: 'elite',  category: 'perfection',  injects: [10, 13] }));
r('dagannoth_rex', T({ id: 'ca_rex_no_protect', name: 'Unbroken Prayer',      description: 'Defeat Dagannoth Rex without using Protect from Melee.',   tier: 'hard',   category: 'restriction', injects: [4, 5] }));
r('dagannoth_rex', T({ id: 'ca_rex_kill_100',   name: 'Rex Veteran',          description: 'Defeat Dagannoth Rex 100 times.',                          tier: 'medium', category: 'kc',          injects: [1, 11] }));
r('dagannoth_rex', T({ id: 'ca_rex_speed_45',   name: 'Rapid Reptile',        description: 'Defeat Dagannoth Rex in under 45 seconds.',                tier: 'hard',   category: 'speed',       injects: [12] }));

// ══════════════════════════════════════════════════════════════════════════════
// 6) Dagannoth Prime — Magic King
// ══════════════════════════════════════════════════════════════════════════════
r('dagannoth_prime', T({ id: 'ca_prime_kill_1',    name: 'Prime Time',        description: 'Defeat Dagannoth Prime.',                                    tier: 'easy',   category: 'kc',          injects: [1] }));
r('dagannoth_prime', T({ id: 'ca_prime_kill_10',   name: 'Prime Regular',     description: 'Defeat Dagannoth Prime 10 times.',                           tier: 'medium', category: 'kc',          injects: [1, 11] }));
r('dagannoth_prime', T({ id: 'ca_prime_range_only',name: 'Pincushion Prime',  description: 'Defeat Dagannoth Prime using only ranged.',                  tier: 'medium', category: 'gear',        injects: [7, 14] }));
r('dagannoth_prime', T({ id: 'ca_prime_no_damage', name: 'Untouched Prime',   description: 'Defeat Dagannoth Prime without taking damage.',              tier: 'elite',  category: 'perfection',  injects: [10, 13] }));
r('dagannoth_prime', T({ id: 'ca_prime_no_pray',   name: 'Unbeliever Prime',  description: 'Defeat Dagannoth Prime without using Protect from Magic.',   tier: 'hard',   category: 'restriction', injects: [4, 5] }));
r('dagannoth_prime', T({ id: 'ca_prime_kill_100',  name: 'Prime Veteran',     description: 'Defeat Dagannoth Prime 100 times.',                          tier: 'medium', category: 'kc',          injects: [1, 11] }));
r('dagannoth_prime', T({ id: 'ca_prime_speed_45',  name: 'Swift Prime',       description: 'Defeat Dagannoth Prime in under 45 seconds.',                tier: 'hard',   category: 'speed',       injects: [12] }));

// ══════════════════════════════════════════════════════════════════════════════
// 7) Dagannoth Supreme — Ranged King
// ══════════════════════════════════════════════════════════════════════════════
r('dagannoth_supreme', T({ id: 'ca_supreme_kill_1',    name: 'Supreme Victory',   description: 'Defeat Dagannoth Supreme.',                                 tier: 'easy',   category: 'kc',          injects: [1] }));
r('dagannoth_supreme', T({ id: 'ca_supreme_kill_10',   name: 'Supreme Regular',   description: 'Defeat Dagannoth Supreme 10 times.',                        tier: 'medium', category: 'kc',          injects: [1, 11] }));
r('dagannoth_supreme', T({ id: 'ca_supreme_melee',     name: 'Close Supreme',     description: 'Defeat Dagannoth Supreme using only melee.',                tier: 'medium', category: 'gear',        injects: [7, 14] }));
r('dagannoth_supreme', T({ id: 'ca_supreme_no_damage', name: 'Untouched Supreme', description: 'Defeat Dagannoth Supreme without taking damage.',           tier: 'elite',  category: 'perfection',  injects: [10, 13] }));
r('dagannoth_supreme', T({ id: 'ca_supreme_no_pray',   name: 'Uncovered Supreme', description: 'Defeat Dagannoth Supreme without using Protect from Missiles.', tier: 'hard', category: 'restriction', injects: [4, 5] }));
r('dagannoth_supreme', T({ id: 'ca_supreme_kill_100',  name: 'Supreme Veteran',   description: 'Defeat Dagannoth Supreme 100 times.',                       tier: 'medium', category: 'kc',          injects: [1, 11] }));
r('dagannoth_supreme', T({ id: 'ca_dks_trip',          name: 'Kings in a Row',    description: 'Defeat all three Dagannoth Kings in a single trip.',        tier: 'hard',   category: 'mechanic',    injects: [8, 9, 14] }));

// ══════════════════════════════════════════════════════════════════════════════
// 8) Kalphite Queen — Boneyard Wastes
// ══════════════════════════════════════════════════════════════════════════════
r('kalphite_queen', T({ id: 'ca_kq_kill_1',    name: 'Bug Squasher',     description: 'Defeat the Kalphite Queen.',                                  tier: 'medium', category: 'kc',          injects: [1] }));
r('kalphite_queen', T({ id: 'ca_kq_kill_10',   name: 'Bug Exterminator', description: 'Defeat the Kalphite Queen 10 times.',                         tier: 'medium', category: 'kc',          injects: [1, 11] }));
r('kalphite_queen', T({ id: 'ca_kq_kill_100',  name: 'Apiary Archlord',  description: 'Defeat the Kalphite Queen 100 times.',                        tier: 'hard',   category: 'kc',          injects: [1, 11] }));
r('kalphite_queen', T({ id: 'ca_kq_phase1_crush', name: 'Crush Phase',   description: 'Defeat phase 1 using only crush weapons.',                    tier: 'medium', category: 'gear',        injects: [4, 7, 16] }));
r('kalphite_queen', T({ id: 'ca_kq_no_damage', name: 'Untouched Queen',  description: 'Defeat the Kalphite Queen without taking damage.',            tier: 'elite',  category: 'perfection',  injects: [10, 13] }));
r('kalphite_queen', T({ id: 'ca_kq_solo',      name: 'Solo Sovereign',   description: 'Defeat the Kalphite Queen solo.',                             tier: 'medium', category: 'solo',        injects: [9, 14] }));
r('kalphite_queen', T({ id: 'ca_kq_speed_150', name: 'Hive Hurry',       description: 'Defeat the Kalphite Queen in under 2:30.',                    tier: 'hard',   category: 'speed',       injects: [12] }));

// ══════════════════════════════════════════════════════════════════════════════
// 9) Kraken — Saltbrine
// ══════════════════════════════════════════════════════════════════════════════
r('kraken_saltbrine', T({ id: 'ca_kraken_kill_1',    name: 'Kraken Slayer',    description: 'Defeat the Kraken.',                                        tier: 'easy',   category: 'kc',          injects: [1] }));
r('kraken_saltbrine', T({ id: 'ca_kraken_kill_100',  name: 'Kraken Crusher',   description: 'Defeat the Kraken 100 times.',                              tier: 'medium', category: 'kc',          injects: [1, 11] }));
r('kraken_saltbrine', T({ id: 'ca_kraken_kill_500',  name: 'Kraken Captain',   description: 'Defeat the Kraken 500 times.',                              tier: 'hard',   category: 'kc',          injects: [1, 11] }));
r('kraken_saltbrine', T({ id: 'ca_kraken_no_damage', name: 'Dry Docks',        description: 'Defeat the Kraken without taking damage.',                  tier: 'hard',   category: 'perfection',  injects: [10, 13] }));
r('kraken_saltbrine', T({ id: 'ca_kraken_t70_mage',  name: 'Trident Training', description: 'Defeat the Kraken using only a tier-70 magic staff.',       tier: 'medium', category: 'gear',        injects: [7, 16] }));
r('kraken_saltbrine', T({ id: 'ca_kraken_speed_30',  name: 'Quick Tentacles',  description: 'Defeat the Kraken in under 30 seconds.',                    tier: 'medium', category: 'speed',       injects: [12] }));
r('kraken_saltbrine', T({ id: 'ca_kraken_no_pray',   name: 'Faithless Fisher', description: 'Defeat the Kraken without using prayer.',                   tier: 'medium', category: 'restriction', injects: [4, 5] }));

// ══════════════════════════════════════════════════════════════════════════════
// 10) Zulrah — Saltbrine (prayer-switch snake)
// ══════════════════════════════════════════════════════════════════════════════
r('zulrah', T({ id: 'ca_zulrah_kill_1',     name: 'Snake Charmer',       description: 'Defeat Zulrah.',                                             tier: 'medium', category: 'kc',          injects: [1] }));
r('zulrah', T({ id: 'ca_zulrah_kill_50',    name: 'Serpent Farmer',      description: 'Defeat Zulrah 50 times.',                                    tier: 'medium', category: 'kc',          injects: [1, 11] }));
r('zulrah', T({ id: 'ca_zulrah_kill_200',   name: 'Serpent Expert',      description: 'Defeat Zulrah 200 times.',                                   tier: 'hard',   category: 'kc',          injects: [1, 11] }));
r('zulrah', T({ id: 'ca_zulrah_kill_1000',  name: 'Serpent Sovereign',   description: 'Defeat Zulrah 1000 times.',                                  tier: 'master', category: 'kc',          injects: [1, 11] }));
r('zulrah', T({ id: 'ca_zulrah_no_damage',  name: 'Perfect Serpent',     description: 'Defeat Zulrah without taking damage.',                       tier: 'elite',  category: 'perfection',  injects: [4, 10, 13] }));
r('zulrah', T({ id: 'ca_zulrah_speed_90',   name: 'Speed Snake',         description: 'Defeat Zulrah in under 90 seconds.',                         tier: 'hard',   category: 'speed',       injects: [12] }));
r('zulrah', T({ id: 'ca_zulrah_no_teleport',name: 'No Escape',           description: 'Defeat Zulrah without using the tanning escape teleport.',   tier: 'hard',   category: 'restriction', injects: [5, 10] }));

// ══════════════════════════════════════════════════════════════════════════════
// 11) Vorkath — Saltbrine (undead dragon)
// ══════════════════════════════════════════════════════════════════════════════
r('vorkath', T({ id: 'ca_vorkath_kill_1',    name: 'Dragon Slayer III', description: 'Defeat Vorkath.',                                           tier: 'medium', category: 'kc',          injects: [1] }));
r('vorkath', T({ id: 'ca_vorkath_kill_50',   name: 'Vorkath Regular',   description: 'Defeat Vorkath 50 times.',                                  tier: 'medium', category: 'kc',          injects: [1, 11] }));
r('vorkath', T({ id: 'ca_vorkath_kill_200',  name: 'Vorkath Expert',    description: 'Defeat Vorkath 200 times.',                                 tier: 'hard',   category: 'kc',          injects: [1, 11] }));
r('vorkath', T({ id: 'ca_vorkath_kill_1000', name: 'Vorkath Master',    description: 'Defeat Vorkath 1000 times.',                                tier: 'master', category: 'kc',          injects: [1, 11] }));
r('vorkath', T({ id: 'ca_vorkath_no_damage', name: 'Perfect Dragon',    description: 'Defeat Vorkath without taking damage.',                     tier: 'elite',  category: 'perfection',  injects: [4, 10, 13] }));
r('vorkath', T({ id: 'ca_vorkath_speed_120',name: 'Speed Dragon',       description: 'Defeat Vorkath in under 2 minutes.',                        tier: 'hard',   category: 'speed',       injects: [12] }));
r('vorkath', T({ id: 'ca_vorkath_no_food',  name: 'Starving Slayer',    description: 'Defeat Vorkath without eating any food.',                   tier: 'elite',  category: 'restriction', injects: [5, 10] }));

// ══════════════════════════════════════════════════════════════════════════════
// 12) Commander Zilyana — God Wars (Saradomin)
// ══════════════════════════════════════════════════════════════════════════════
r('commander_zilyana', T({ id: 'ca_zilyana_kill_1',     name: 'Holy Crusade',    description: 'Defeat Commander Zilyana.',                                 tier: 'hard',   category: 'kc',          injects: [1] }));
r('commander_zilyana', T({ id: 'ca_zilyana_kill_100',   name: 'Zilyana Veteran', description: 'Defeat Commander Zilyana 100 times.',                       tier: 'hard',   category: 'kc',          injects: [1, 11] }));
r('commander_zilyana', T({ id: 'ca_zilyana_speed_60',   name: 'Speed of Light',  description: 'Defeat Commander Zilyana in under 60 seconds.',             tier: 'elite',  category: 'speed',       injects: [12] }));
r('commander_zilyana', T({ id: 'ca_zilyana_solo',       name: 'Solo Saradominist', description: 'Defeat Commander Zilyana solo.',                         tier: 'elite',  category: 'solo',        injects: [9] }));
r('commander_zilyana', T({ id: 'ca_zilyana_no_damage',  name: 'Light Without Burn', description: 'Defeat Commander Zilyana without taking damage.',       tier: 'master', category: 'perfection',  injects: [10, 13] }));
r('commander_zilyana', T({ id: 'ca_zilyana_range_only', name: 'Arrows of Faith', description: 'Defeat Commander Zilyana using only ranged (her weakness).', tier: 'elite', category: 'gear',        injects: [7, 16] }));
r('commander_zilyana', T({ id: 'ca_zilyana_no_prayer',  name: 'Pagan Commander', description: 'Defeat Commander Zilyana without using prayer.',           tier: 'master', category: 'restriction', injects: [4, 5] }));

// ══════════════════════════════════════════════════════════════════════════════
// 13) General Graardor — God Wars (Bandos)
// ══════════════════════════════════════════════════════════════════════════════
r('general_graardor', T({ id: 'ca_graardor_kill_1',     name: 'War is Over',    description: 'Defeat General Graardor.',                                   tier: 'hard',   category: 'kc',          injects: [1] }));
r('general_graardor', T({ id: 'ca_graardor_kill_100',   name: 'Bandos Veteran', description: 'Defeat General Graardor 100 times.',                         tier: 'hard',   category: 'kc',          injects: [1, 11] }));
r('general_graardor', T({ id: 'ca_graardor_speed_60',   name: 'Blitz Bandos',   description: 'Defeat General Graardor in under 60 seconds.',               tier: 'elite',  category: 'speed',       injects: [12] }));
r('general_graardor', T({ id: 'ca_graardor_solo',       name: 'Solo Bandosian', description: 'Defeat General Graardor solo.',                              tier: 'elite',  category: 'solo',        injects: [9] }));
r('general_graardor', T({ id: 'ca_graardor_no_damage',  name: 'Un-Stomped',     description: 'Defeat General Graardor without taking damage.',             tier: 'master', category: 'perfection',  injects: [10, 13] }));
r('general_graardor', T({ id: 'ca_graardor_mage_only',  name: 'Mage Makes War', description: 'Defeat General Graardor using only magic (his weakness).',   tier: 'elite',  category: 'gear',        injects: [7, 16] }));
r('general_graardor', T({ id: 'ca_graardor_no_food',    name: 'Iron Stomach',   description: 'Defeat General Graardor without eating.',                    tier: 'elite',  category: 'restriction', injects: [5, 10] }));

// ══════════════════════════════════════════════════════════════════════════════
// 14) Kree'arra — God Wars (Armadyl)
// ══════════════════════════════════════════════════════════════════════════════
r('kreearra', T({ id: 'ca_kree_kill_1',     name: 'Bird Down',       description: "Defeat Kree'arra.",                                           tier: 'hard',   category: 'kc',          injects: [1] }));
r('kreearra', T({ id: 'ca_kree_kill_100',   name: 'Skyborn Veteran', description: "Defeat Kree'arra 100 times.",                                 tier: 'hard',   category: 'kc',          injects: [1, 11] }));
r('kreearra', T({ id: 'ca_kree_speed_60',   name: 'Aviation Ban',    description: "Defeat Kree'arra in under 60 seconds.",                       tier: 'elite',  category: 'speed',       injects: [12] }));
r('kreearra', T({ id: 'ca_kree_solo',       name: 'Solo Skybreaker', description: "Defeat Kree'arra solo.",                                      tier: 'elite',  category: 'solo',        injects: [9] }));
r('kreearra', T({ id: 'ca_kree_no_damage',  name: 'Unruffled',       description: "Defeat Kree'arra without taking damage.",                     tier: 'master', category: 'perfection',  injects: [10, 13] }));
r('kreearra', T({ id: 'ca_kree_mage_only',  name: 'Spellbreaker',    description: "Defeat Kree'arra using only magic (her weakness).",           tier: 'elite',  category: 'gear',        injects: [7, 16] }));
r('kreearra', T({ id: 'ca_kree_no_pray',    name: 'Faithless Flier', description: "Defeat Kree'arra without using prayer.",                      tier: 'elite',  category: 'restriction', injects: [4, 5] }));

// ══════════════════════════════════════════════════════════════════════════════
// 15) K'ril Tsutsaroth — God Wars (Zamorak)
// ══════════════════════════════════════════════════════════════════════════════
r('kril_tsutsaroth', T({ id: 'ca_kril_kill_1',     name: 'Demon Fall',     description: "Defeat K'ril Tsutsaroth.",                                    tier: 'hard',   category: 'kc',          injects: [1] }));
r('kril_tsutsaroth', T({ id: 'ca_kril_kill_100',   name: 'Kril Veteran',   description: "Defeat K'ril Tsutsaroth 100 times.",                          tier: 'hard',   category: 'kc',          injects: [1, 11] }));
r('kril_tsutsaroth', T({ id: 'ca_kril_speed_60',   name: 'Quick Exorcism', description: "Defeat K'ril Tsutsaroth in under 60 seconds.",                tier: 'elite',  category: 'speed',       injects: [12] }));
r('kril_tsutsaroth', T({ id: 'ca_kril_solo',       name: 'Solo Exorcist',  description: "Defeat K'ril Tsutsaroth solo.",                               tier: 'elite',  category: 'solo',        injects: [9] }));
r('kril_tsutsaroth', T({ id: 'ca_kril_no_damage',  name: 'Unscathed Soul', description: "Defeat K'ril Tsutsaroth without taking damage.",              tier: 'master', category: 'perfection',  injects: [10, 13] }));
r('kril_tsutsaroth', T({ id: 'ca_kril_arclight',   name: 'Demonbane',      description: "Defeat K'ril Tsutsaroth using a demonbane weapon (Arclight-equivalent).", tier: 'elite', category: 'gear', injects: [7, 16] }));
r('kril_tsutsaroth', T({ id: 'ca_kril_no_pray',    name: 'Prayerless Pit', description: "Defeat K'ril Tsutsaroth without using prayer.",              tier: 'elite',  category: 'restriction', injects: [4, 5] }));

// ══════════════════════════════════════════════════════════════════════════════
// 16) Corporeal Beast — shared
// ══════════════════════════════════════════════════════════════════════════════
r('corporeal_beast', T({ id: 'ca_corp_kill_1',      name: 'Beast Slain',   description: 'Defeat the Corporeal Beast.',                                tier: 'elite',  category: 'kc',          injects: [1] }));
r('corporeal_beast', T({ id: 'ca_corp_kill_10',     name: 'Corp Regular',  description: 'Defeat the Corporeal Beast 10 times.',                       tier: 'elite',  category: 'kc',          injects: [1, 11] }));
r('corporeal_beast', T({ id: 'ca_corp_kill_100',    name: 'Corp Veteran',  description: 'Defeat the Corporeal Beast 100 times.',                      tier: 'master', category: 'kc',          injects: [1, 11] }));
r('corporeal_beast', T({ id: 'ca_corp_solo',        name: 'Solo Corp',     description: 'Defeat the Corporeal Beast solo.',                           tier: 'elite',  category: 'solo',        injects: [9, 14] }));
r('corporeal_beast', T({ id: 'ca_corp_no_food',     name: 'Fasting Beast', description: 'Defeat the Corporeal Beast without eating.',                 tier: 'master', category: 'restriction', injects: [5, 10] }));
r('corporeal_beast', T({ id: 'ca_corp_spec_spear',  name: 'Spear of Zamorak', description: 'Defeat the Corporeal Beast using only a spear-type weapon.', tier: 'elite', category: 'gear',      injects: [7, 16] }));
r('corporeal_beast', T({ id: 'ca_corp_no_dark_core',name: 'Focused Beast', description: 'Defeat the Corporeal Beast without the dark core splitting more than once.', tier: 'master', category: 'mechanic', injects: [4, 12, 13] }));

// ══════════════════════════════════════════════════════════════════════════════
// 17) The Nightmare — Moryskah
// ══════════════════════════════════════════════════════════════════════════════
r('the_nightmare', T({ id: 'ca_nm_kill_1',         name: 'Wake Up Call',   description: 'Defeat The Nightmare.',                                    tier: 'hard',   category: 'kc',          injects: [1] }));
r('the_nightmare', T({ id: 'ca_nm_kill_50',        name: 'Nightmare Regular', description: 'Defeat The Nightmare 50 times.',                        tier: 'elite',  category: 'kc',          injects: [1, 11] }));
r('the_nightmare', T({ id: 'ca_nm_no_damage',      name: 'Sweet Dreams',    description: 'Defeat The Nightmare without any player taking damage.', tier: 'master', category: 'perfection',  injects: [4, 10, 13] }));
r('the_nightmare', T({ id: 'ca_nm_5man',           name: 'Dream Team',      description: 'Defeat The Nightmare with exactly 5 players.',           tier: 'elite',  category: 'mechanic',    injects: [4, 9, 14] }));
r('the_nightmare', T({ id: 'ca_nm_phase3_perfect', name: 'Perfect Phase 3', description: 'Defeat phase 3 without taking chip damage.',              tier: 'master', category: 'perfection',  injects: [4, 10, 13] }));
r('the_nightmare', T({ id: 'ca_nm_solo',           name: 'Solo Nightmare',  description: 'Defeat The Nightmare solo.',                             tier: 'master', category: 'solo',        injects: [9] }));
r('the_nightmare', T({ id: 'ca_nm_speed_5m',       name: 'Rapid REM',       description: 'Defeat The Nightmare in under 5 minutes.',               tier: 'elite',  category: 'speed',       injects: [12] }));

// ══════════════════════════════════════════════════════════════════════════════
// 18) Cerberus — Moryskah
// ══════════════════════════════════════════════════════════════════════════════
r('cerberus', T({ id: 'ca_cerb_kill_1',    name: 'Puppy Problems',  description: 'Defeat Cerberus.',                                         tier: 'hard',   category: 'kc',          injects: [1] }));
r('cerberus', T({ id: 'ca_cerb_kill_100',  name: 'Cerberus Veteran', description: 'Defeat Cerberus 100 times.',                              tier: 'hard',   category: 'kc',          injects: [1, 11] }));
r('cerberus', T({ id: 'ca_cerb_kill_500',  name: 'Cerberus Master', description: 'Defeat Cerberus 500 times.',                               tier: 'master', category: 'kc',          injects: [1, 11] }));
r('cerberus', T({ id: 'ca_cerb_speed_90',  name: 'Quick Walkies',   description: 'Defeat Cerberus in under 90 seconds.',                     tier: 'hard',   category: 'speed',       injects: [12] }));
r('cerberus', T({ id: 'ca_cerb_no_prayer', name: 'Faithless Kennel', description: 'Defeat Cerberus without using prayer.',                   tier: 'master', category: 'restriction', injects: [4, 5] }));
r('cerberus', T({ id: 'ca_cerb_ghost_prayer', name: 'Ghost Switcher', description: 'Defeat Cerberus while flicking prayers correctly for every ghost (no chip damage from souls).', tier: 'elite', category: 'mechanic', injects: [4, 12, 13] }));
r('cerberus', T({ id: 'ca_cerb_no_food',   name: 'Starved Paw',     description: 'Defeat Cerberus without eating.',                          tier: 'elite',  category: 'restriction', injects: [5, 10] }));

// ══════════════════════════════════════════════════════════════════════════════
// 19) Skotizo — Moryskah (totem boss)
// ══════════════════════════════════════════════════════════════════════════════
r('skotizo_moryskah', T({ id: 'ca_skot_kill_1',     name: 'Totem Breaker',   description: 'Defeat Skotizo.',                                         tier: 'medium', category: 'kc',          injects: [1] }));
r('skotizo_moryskah', T({ id: 'ca_skot_kill_25',    name: 'Totem Thresher',  description: 'Defeat Skotizo 25 times.',                                tier: 'hard',   category: 'kc',          injects: [1, 11] }));
r('skotizo_moryskah', T({ id: 'ca_skot_no_altar',   name: 'No Altar Aid',    description: 'Defeat Skotizo without destroying any of his totems.',    tier: 'elite',  category: 'mechanic',    injects: [4, 10, 13] }));
r('skotizo_moryskah', T({ id: 'ca_skot_solo_speed', name: 'Swift Crusher',   description: 'Defeat Skotizo solo in under 2 minutes.',                 tier: 'elite',  category: 'speed',       injects: [9, 12] }));
r('skotizo_moryskah', T({ id: 'ca_skot_no_damage',  name: 'Totem Untouched', description: 'Defeat Skotizo without taking damage.',                   tier: 'hard',   category: 'perfection',  injects: [10, 13] }));
r('skotizo_moryskah', T({ id: 'ca_skot_range_only', name: 'Ranged Ritual',   description: 'Defeat Skotizo using only ranged.',                       tier: 'medium', category: 'gear',        injects: [7, 16] }));
r('skotizo_moryskah', T({ id: 'ca_skot_no_pray',    name: 'Unshielded Soul', description: 'Defeat Skotizo without using prayer.',                    tier: 'hard',   category: 'restriction', injects: [4, 5] }));

// ══════════════════════════════════════════════════════════════════════════════
// 20) Sarachnis — Moryskah (spider matron)
// ══════════════════════════════════════════════════════════════════════════════
r('sarachnis_moryskah', T({ id: 'ca_sara_kill_1',    name: 'Web Weaver',      description: 'Defeat Sarachnis.',                                       tier: 'medium', category: 'kc',          injects: [1] }));
r('sarachnis_moryskah', T({ id: 'ca_sara_kill_100',  name: 'Sarachnis Veteran', description: 'Defeat Sarachnis 100 times.',                           tier: 'hard',   category: 'kc',          injects: [1, 11] }));
r('sarachnis_moryskah', T({ id: 'ca_sara_speed_60',  name: 'Quick Crawler',   description: 'Defeat Sarachnis in under 60 seconds.',                   tier: 'hard',   category: 'speed',       injects: [12] }));
r('sarachnis_moryskah', T({ id: 'ca_sara_no_switch', name: 'Single-Style',    description: 'Defeat Sarachnis without switching attack styles.',       tier: 'hard',   category: 'restriction', injects: [4, 5, 16] }));
r('sarachnis_moryskah', T({ id: 'ca_sara_no_food',   name: 'Fasted Web',      description: 'Defeat Sarachnis without eating.',                        tier: 'medium', category: 'restriction', injects: [5, 10] }));
r('sarachnis_moryskah', T({ id: 'ca_sara_no_damage', name: 'Webless',         description: 'Defeat Sarachnis without taking damage.',                 tier: 'elite',  category: 'perfection',  injects: [10, 13] }));
r('sarachnis_moryskah', T({ id: 'ca_sara_t60_gear', name: 'Modest Silks',     description: 'Defeat Sarachnis using only tier-60 gear or lower.',      tier: 'medium', category: 'gear',        injects: [7, 16] }));

// ══════════════════════════════════════════════════════════════════════════════
// 21) The Veilmother — Veilwood
// ══════════════════════════════════════════════════════════════════════════════
r('the_veilmother', T({ id: 'ca_veil_kill_1',    name: 'Timber!',           description: 'Defeat The Veilmother.',                                 tier: 'medium', category: 'kc',          injects: [1] }));
r('the_veilmother', T({ id: 'ca_veil_kill_50',   name: 'Forest Fell',       description: 'Defeat The Veilmother 50 times.',                        tier: 'hard',   category: 'kc',          injects: [1, 11] }));
r('the_veilmother', T({ id: 'ca_veil_no_damage', name: 'Untangled',         description: 'Defeat The Veilmother without taking damage.',           tier: 'hard',   category: 'perfection',  injects: [10, 13] }));
r('the_veilmother', T({ id: 'ca_veil_no_root',   name: 'No Roots',          description: 'Defeat The Veilmother without being rooted.',            tier: 'hard',   category: 'mechanic',    injects: [4, 12] }));
r('the_veilmother', T({ id: 'ca_veil_speed_120',name: 'Quick Clearing',     description: 'Defeat The Veilmother in under 2 minutes.',              tier: 'medium', category: 'speed',       injects: [12] }));
r('the_veilmother', T({ id: 'ca_veil_solo',      name: 'Lone Lumberjack',   description: 'Defeat The Veilmother solo.',                            tier: 'medium', category: 'solo',        injects: [9] }));
r('the_veilmother', T({ id: 'ca_veil_fire',      name: 'Scorched Canopy',   description: 'Defeat The Veilmother using only fire spells.',          tier: 'hard',   category: 'gear',        injects: [7, 14, 16] }));

// ══════════════════════════════════════════════════════════════════════════════
// 22) Crystal Wyrm — Veilwood (crystal caverns)
// ══════════════════════════════════════════════════════════════════════════════
r('crystal_wyrm', T({ id: 'ca_wyrm_kill_1',     name: 'Crystal Clear',    description: 'Defeat the Crystal Wyrm.',                                tier: 'hard',   category: 'kc',          injects: [1] }));
r('crystal_wyrm', T({ id: 'ca_wyrm_kill_10',    name: 'Crystal Cutter',   description: 'Defeat the Crystal Wyrm 10 times.',                       tier: 'hard',   category: 'kc',          injects: [1, 11] }));
r('crystal_wyrm', T({ id: 'ca_wyrm_kill_100',   name: 'Crystal Connoisseur', description: 'Defeat the Crystal Wyrm 100 times.',                   tier: 'elite',  category: 'kc',          injects: [1, 11] }));
r('crystal_wyrm', T({ id: 'ca_wyrm_no_pillar',  name: 'No Cover',         description: 'Defeat the Crystal Wyrm without hiding behind a pillar.', tier: 'elite',  category: 'mechanic',    injects: [4, 10, 13] }));
r('crystal_wyrm', T({ id: 'ca_wyrm_no_damage',  name: 'Crystal Perfection', description: 'Defeat the Crystal Wyrm without taking damage.',       tier: 'elite',  category: 'perfection',  injects: [10, 13] }));
r('crystal_wyrm', T({ id: 'ca_wyrm_speed_180', name: 'Crystal Speed',     description: 'Defeat the Crystal Wyrm in under 3 minutes.',             tier: 'hard',   category: 'speed',       injects: [12] }));
r('crystal_wyrm', T({ id: 'ca_wyrm_no_storm',   name: 'No Chill',         description: 'Defeat the Crystal Wyrm without taking damage from the ice storm.', tier: 'elite', category: 'mechanic', injects: [4, 12, 13] }));

// ══════════════════════════════════════════════════════════════════════════════
// 23) Vorath — Sootworks
// ══════════════════════════════════════════════════════════════════════════════
r('vorath', T({ id: 'ca_vorath_kill_1',    name: 'Forge Breaker',     description: 'Defeat Vorath.',                                            tier: 'medium', category: 'kc',          injects: [1] }));
r('vorath', T({ id: 'ca_vorath_kill_100',  name: 'Forge Veteran',     description: 'Defeat Vorath 100 times.',                                  tier: 'hard',   category: 'kc',          injects: [1, 11] }));
r('vorath', T({ id: 'ca_vorath_no_damage', name: 'Anvil Untouched',   description: 'Defeat Vorath without taking damage.',                      tier: 'elite',  category: 'perfection',  injects: [10, 13] }));
r('vorath', T({ id: 'ca_vorath_speed_90', name: 'Hammer Down',        description: 'Defeat Vorath in under 90 seconds.',                        tier: 'hard',   category: 'speed',       injects: [12] }));
r('vorath', T({ id: 'ca_vorath_solo',      name: 'Solo Smith',        description: 'Defeat Vorath solo.',                                       tier: 'medium', category: 'solo',        injects: [9] }));
r('vorath', T({ id: 'ca_vorath_no_dodge', name: 'No Fancy Footwork',  description: 'Defeat Vorath without dodging the forge blast (use gear).', tier: 'hard',   category: 'mechanic',    injects: [4, 7, 13] }));
r('vorath', T({ id: 'ca_vorath_t70',       name: 'Adamant Tier',      description: 'Defeat Vorath using only tier-70 or lower gear.',           tier: 'medium', category: 'gear',        injects: [7, 16] }));

// ══════════════════════════════════════════════════════════════════════════════
// 24) Duke Sucellus — Sootworks
// ══════════════════════════════════════════════════════════════════════════════
r('duke_sucellus_sootworks', T({ id: 'ca_duke_kill_1',     name: 'Dethrone the Duke', description: 'Defeat Duke Sucellus.',                                 tier: 'hard',   category: 'kc',          injects: [1] }));
r('duke_sucellus_sootworks', T({ id: 'ca_duke_kill_100',   name: 'Duke Veteran',      description: 'Defeat Duke Sucellus 100 times.',                       tier: 'elite',  category: 'kc',          injects: [1, 11] }));
r('duke_sucellus_sootworks', T({ id: 'ca_duke_speed_90',   name: 'Ducal Speed',       description: 'Defeat Duke Sucellus in under 90 seconds.',             tier: 'elite',  category: 'speed',       injects: [12] }));
r('duke_sucellus_sootworks', T({ id: 'ca_duke_no_damage', name: 'Untouched Duke',     description: 'Defeat Duke Sucellus without taking damage.',           tier: 'master', category: 'perfection',  injects: [10, 13] }));
r('duke_sucellus_sootworks', T({ id: 'ca_duke_t80',        name: 'Rune Ducal',        description: 'Defeat Duke Sucellus using only tier-80 or lower gear.', tier: 'elite', category: 'gear',        injects: [7, 16] }));
r('duke_sucellus_sootworks', T({ id: 'ca_duke_solo',       name: 'Solo Duke',         description: 'Defeat Duke Sucellus solo.',                            tier: 'hard',   category: 'solo',        injects: [9] }));
r('duke_sucellus_sootworks', T({ id: 'ca_duke_no_pray',    name: 'Unshielded Duke',   description: 'Defeat Duke Sucellus without using prayer.',            tier: 'elite',  category: 'restriction', injects: [4, 5] }));

// ══════════════════════════════════════════════════════════════════════════════
// 25) Pirate Captain — Saltbrine (early boss)
// ══════════════════════════════════════════════════════════════════════════════
r('pirate_captain', T({ id: 'ca_pirate_kill_1',     name: 'Walk the Plank',    description: 'Defeat the Pirate Captain.',                                    tier: 'easy',   category: 'kc',          injects: [1] }));
r('pirate_captain', T({ id: 'ca_pirate_kill_25',    name: 'Scourge of the Seas', description: 'Defeat the Pirate Captain 25 times.',                         tier: 'easy',   category: 'kc',          injects: [1, 11] }));
r('pirate_captain', T({ id: 'ca_pirate_kill_100',   name: 'Admiral',           description: 'Defeat the Pirate Captain 100 times.',                          tier: 'medium', category: 'kc',          injects: [1, 11] }));
r('pirate_captain', T({ id: 'ca_pirate_no_food',    name: 'Scurvy Slayer',     description: 'Defeat the Pirate Captain without eating.',                     tier: 'medium', category: 'restriction', injects: [5, 10] }));
r('pirate_captain', T({ id: 'ca_pirate_no_damage', name: 'Dry Docks',          description: 'Defeat the Pirate Captain without taking damage.',              tier: 'medium', category: 'perfection',  injects: [10, 13] }));
r('pirate_captain', T({ id: 'ca_pirate_speed_60',  name: 'Keelhauled',         description: 'Defeat the Pirate Captain in under 60 seconds.',                tier: 'medium', category: 'speed',       injects: [12] }));
r('pirate_captain', T({ id: 'ca_pirate_mage_only',name: 'Saltwater Spellcaster', description: 'Defeat the Pirate Captain using only magic.',                tier: 'easy',   category: 'gear',        injects: [7, 16] }));

// ══════════════════════════════════════════════════════════════════════════════
// 26) The Glass Tyrant — Glass Desert
// ══════════════════════════════════════════════════════════════════════════════
r('the_glass_tyrant', T({ id: 'ca_glass_kill_1',    name: 'Shattered',        description: 'Defeat The Glass Tyrant.',                                   tier: 'hard',   category: 'kc',          injects: [1] }));
r('the_glass_tyrant', T({ id: 'ca_glass_kill_50',   name: 'Glass Breaker',    description: 'Defeat The Glass Tyrant 50 times.',                          tier: 'elite',  category: 'kc',          injects: [1, 11] }));
r('the_glass_tyrant', T({ id: 'ca_glass_solo_nod',  name: 'Solo Refraction',  description: 'Defeat The Glass Tyrant solo without taking damage.',        tier: 'master', category: 'solo',        injects: [9, 10, 13] }));
r('the_glass_tyrant', T({ id: 'ca_glass_speed_180',name: 'Prism Speedkill',   description: 'Defeat The Glass Tyrant in under 3 minutes.',                tier: 'elite',  category: 'speed',       injects: [12] }));
r('the_glass_tyrant', T({ id: 'ca_glass_no_prism',  name: 'No Refraction',    description: 'Defeat The Glass Tyrant without being hit by a prism reflection.', tier: 'master', category: 'mechanic', injects: [4, 12, 13] }));
r('the_glass_tyrant', T({ id: 'ca_glass_range_only',name: 'Pierced Crystal',  description: 'Defeat The Glass Tyrant using only ranged.',                 tier: 'elite',  category: 'gear',        injects: [7, 16] }));
r('the_glass_tyrant', T({ id: 'ca_glass_no_food',   name: 'Glass Belly',      description: 'Defeat The Glass Tyrant without eating.',                    tier: 'elite',  category: 'restriction', injects: [5, 10] }));

// ══════════════════════════════════════════════════════════════════════════════
// 27) Veldrak, the Last Dragon — Glass Desert (endgame)
// ══════════════════════════════════════════════════════════════════════════════
r('veldrak', T({ id: 'ca_veldrak_kill_1',    name: 'Dragon Ender',    description: 'Defeat Veldrak, the Last Dragon.',                                 tier: 'elite',  category: 'kc',          injects: [1] }));
r('veldrak', T({ id: 'ca_veldrak_kill_50',   name: 'Dragon Veteran',  description: 'Defeat Veldrak 50 times.',                                         tier: 'master', category: 'kc',          injects: [1, 11] }));
r('veldrak', T({ id: 'ca_veldrak_kill_250',  name: 'Dragon Sovereign', description: 'Defeat Veldrak 250 times.',                                       tier: 'grandmaster', category: 'kc',      injects: [1, 11] }));
r('veldrak', T({ id: 'ca_veldrak_speed_300',name: 'Dragon Speed Kill', description: 'Defeat Veldrak in under 5 minutes.',                              tier: 'master', category: 'speed',       injects: [12] }));
r('veldrak', T({ id: 'ca_veldrak_no_food',   name: 'Unfed Dragon Slayer', description: 'Defeat Veldrak without eating any food.',                      tier: 'master', category: 'restriction', injects: [5, 10] }));
r('veldrak', T({ id: 'ca_veldrak_duo',       name: 'Dragon Duo',      description: 'Defeat Veldrak with only 2 players.',                              tier: 'grandmaster', category: 'solo',    injects: [9, 14] }));
r('veldrak', T({ id: 'ca_veldrak_no_damage',name: 'Dragon Untouched', description: 'Defeat Veldrak without taking damage.',                           tier: 'grandmaster', category: 'perfection', injects: [4, 10, 13] }));

// ══════════════════════════════════════════════════════════════════════════════
// 28) Inkweald Muse — Inkweald
// ══════════════════════════════════════════════════════════════════════════════
r('inkweald_muse', T({ id: 'ca_muse_kill_1',     name: 'Muse Silenced',    description: 'Defeat the Inkweald Muse.',                                    tier: 'elite',  category: 'kc',          injects: [1] }));
r('inkweald_muse', T({ id: 'ca_muse_kill_50',    name: 'Tongue Tied',      description: 'Defeat the Inkweald Muse 50 times.',                           tier: 'master', category: 'kc',          injects: [1, 11] }));
r('inkweald_muse', T({ id: 'ca_muse_speed_120', name: 'Quick Silence',     description: 'Defeat the Inkweald Muse in under 2 minutes.',                 tier: 'master', category: 'speed',       injects: [12] }));
r('inkweald_muse', T({ id: 'ca_muse_no_repeat', name: 'No Echo',           description: 'Defeat the Inkweald Muse without any phrase repeating twice.', tier: 'master', category: 'mechanic',    injects: [4, 12, 13] }));
r('inkweald_muse', T({ id: 'ca_muse_solo',       name: 'Solo Silencer',    description: 'Defeat the Inkweald Muse solo.',                               tier: 'elite',  category: 'solo',        injects: [9] }));
r('inkweald_muse', T({ id: 'ca_muse_no_prayer', name: 'Unwhispered',       description: 'Defeat the Inkweald Muse without using prayer.',               tier: 'master', category: 'restriction', injects: [4, 5] }));
r('inkweald_muse', T({ id: 'ca_muse_no_damage', name: 'Untouched Poet',    description: 'Defeat the Inkweald Muse without taking damage.',              tier: 'grandmaster', category: 'perfection', injects: [10, 13] }));

// ══════════════════════════════════════════════════════════════════════════════
// 29) Hollow Choir Conductor — Inkweald
// ══════════════════════════════════════════════════════════════════════════════
r('hollow_choir_conductor', T({ id: 'ca_choir_kill_1',     name: 'Choir Silenced',    description: 'Defeat the Hollow Choir Conductor.',                                tier: 'elite',  category: 'kc',          injects: [1] }));
r('hollow_choir_conductor', T({ id: 'ca_choir_kill_25',    name: 'Choir Dismissed',   description: 'Defeat the Hollow Choir Conductor 25 times.',                      tier: 'master', category: 'kc',          injects: [1, 11] }));
r('hollow_choir_conductor', T({ id: 'ca_choir_trio',       name: 'Minimal Choir',     description: 'Defeat the Hollow Choir Conductor with only 3 players.',           tier: 'master', category: 'mechanic',    injects: [4, 9, 14] }));
r('hollow_choir_conductor', T({ id: 'ca_choir_speed_240', name: 'Rapid Requiem',     description: 'Defeat the Hollow Choir Conductor in under 4 minutes.',            tier: 'master', category: 'speed',       injects: [12] }));
r('hollow_choir_conductor', T({ id: 'ca_choir_no_singer', name: 'No Encore',          description: 'Defeat the Hollow Choir Conductor without any singer being summoned twice.', tier: 'grandmaster', category: 'mechanic', injects: [4, 12, 13] }));
r('hollow_choir_conductor', T({ id: 'ca_choir_solo',       name: 'Solo Conductor',    description: 'Defeat the Hollow Choir Conductor solo.',                          tier: 'grandmaster', category: 'solo',    injects: [9, 13] }));
r('hollow_choir_conductor', T({ id: 'ca_choir_no_damage', name: 'Silent Soul',       description: 'Defeat the Hollow Choir Conductor without taking damage.',         tier: 'grandmaster', category: 'perfection', injects: [10, 13] }));

// ══════════════════════════════════════════════════════════════════════════════
// 30) The Soot King — Sootworks
// ══════════════════════════════════════════════════════════════════════════════
r('the_soot_king', T({ id: 'ca_soot_kill_1',     name: 'King Dethroned',     description: 'Defeat the Soot King.',                                     tier: 'hard',   category: 'kc',          injects: [1] }));
r('the_soot_king', T({ id: 'ca_soot_kill_50',    name: 'Sootless Kingdom',   description: 'Defeat the Soot King 50 times.',                            tier: 'elite',  category: 'kc',          injects: [1, 11] }));
r('the_soot_king', T({ id: 'ca_soot_speed_150', name: 'Regicide',            description: 'Defeat the Soot King in under 2:30.',                       tier: 'elite',  category: 'speed',       injects: [12] }));
r('the_soot_king', T({ id: 'ca_soot_no_damage',name: 'Pristine Coronation',  description: 'Defeat the Soot King without taking damage.',               tier: 'master', category: 'perfection',  injects: [10, 13] }));
r('the_soot_king', T({ id: 'ca_soot_solo',     name: 'Solo Sovereign',       description: 'Defeat the Soot King solo.',                                tier: 'hard',   category: 'solo',        injects: [9] }));
r('the_soot_king', T({ id: 'ca_soot_no_food',  name: 'Throneless Feast',     description: 'Defeat the Soot King without eating.',                      tier: 'elite',  category: 'restriction', injects: [5, 10] }));
r('the_soot_king', T({ id: 'ca_soot_mage',     name: 'Sorcerer Sovereign',   description: 'Defeat the Soot King using only magic.',                    tier: 'elite',  category: 'gear',        injects: [7, 16] }));

// ══════════════════════════════════════════════════════════════════════════════
// BONUS: The Whisperer, Vardorvis, Sol Heredit, Phantom Muspah — content padding
// to push the grandmaster tier threshold achievable from a wider content set.
// ══════════════════════════════════════════════════════════════════════════════

r('the_whisperer_inkweald', T({ id: 'ca_whisper_kill_1',    name: 'First Whisper',       description: 'Defeat The Whisperer.',                                   tier: 'elite',  category: 'kc',          injects: [1] }));
r('the_whisperer_inkweald', T({ id: 'ca_whisper_kill_50',   name: 'Whisper Silencer',    description: 'Defeat The Whisperer 50 times.',                          tier: 'master', category: 'kc',          injects: [1, 11] }));
r('the_whisperer_inkweald', T({ id: 'ca_whisper_no_damage', name: 'Silent Shadow',       description: 'Defeat The Whisperer without taking damage.',             tier: 'grandmaster', category: 'perfection', injects: [10, 13] }));

r('vardorvis_sootworks', T({ id: 'ca_vard_kill_1',          name: 'Axeman Felled',       description: 'Defeat Vardorvis.',                                       tier: 'elite',  category: 'kc',          injects: [1] }));
r('vardorvis_sootworks', T({ id: 'ca_vard_kill_50',         name: 'Vardorvis Veteran',   description: 'Defeat Vardorvis 50 times.',                              tier: 'master', category: 'kc',          injects: [1, 11] }));
r('vardorvis_sootworks', T({ id: 'ca_vard_no_damage',       name: 'Unfelled',            description: 'Defeat Vardorvis without taking damage.',                 tier: 'grandmaster', category: 'perfection', injects: [10, 13] }));

r('sol_heredit_colosseum', T({ id: 'ca_sol_kill_1',         name: 'Colosseum Champion',  description: 'Defeat Sol Heredit.',                                     tier: 'master', category: 'kc',          injects: [1, 13] }));
r('sol_heredit_colosseum', T({ id: 'ca_sol_kill_10',        name: 'Colosseum Veteran',   description: 'Defeat Sol Heredit 10 times.',                            tier: 'grandmaster', category: 'kc',      injects: [1, 11, 13] }));
r('sol_heredit_colosseum', T({ id: 'ca_sol_no_damage',      name: 'Undefeated',          description: 'Defeat Sol Heredit without taking damage.',               tier: 'grandmaster', category: 'perfection', injects: [4, 10, 13] }));

r('phantom_muspah_inkweald', T({ id: 'ca_muspah_kill_1',    name: 'Muspah Down',         description: 'Defeat the Phantom Muspah.',                              tier: 'hard',   category: 'kc',          injects: [1] }));
r('phantom_muspah_inkweald', T({ id: 'ca_muspah_kill_100',  name: 'Muspah Veteran',      description: 'Defeat the Phantom Muspah 100 times.',                    tier: 'elite',  category: 'kc',          injects: [1, 11] }));
r('phantom_muspah_inkweald', T({ id: 'ca_muspah_no_damage',name: 'Unphantomed',          description: 'Defeat the Phantom Muspah without taking damage.',        tier: 'master', category: 'perfection',  injects: [10, 13] }));

// ══════════════════════════════════════════════════════════════════════════════
// TIER BALANCING: additional easy tasks (5 more starter kills)
// so a casual player can clear "Easy" (33 pts) from easy tasks alone.
// ══════════════════════════════════════════════════════════════════════════════
r('forgefather_duran',     T({ id: 'ca_duran_any_style',     name: 'Versatile Smith',    description: 'Defeat Forgefather Duran once per combat style (melee, ranged, magic).', tier: 'easy', category: 'gear', injects: [7, 14, 16] }));
r('giant_mole',            T({ id: 'ca_mole_any_style',      name: 'Versatile Mole',     description: 'Defeat the Giant Mole once per combat style.',                          tier: 'easy', category: 'gear', injects: [7, 14, 16] }));
r('obor_heartlands',       T({ id: 'ca_obor_any_style',      name: 'Versatile Giant',    description: 'Defeat Obor once per combat style.',                                    tier: 'easy', category: 'gear', injects: [7, 14, 16] }));
r('bryophyta_heartlands',  T({ id: 'ca_bryo_any_style',      name: 'Versatile Moss',     description: 'Defeat Bryophyta once per combat style.',                               tier: 'easy', category: 'gear', injects: [7, 14, 16] }));
r('pirate_captain',        T({ id: 'ca_pirate_any_style',    name: 'Versatile Pirate',   description: 'Defeat the Pirate Captain once per combat style.',                      tier: 'easy', category: 'gear', injects: [7, 14, 16] }));
r('dagannoth_rex',         T({ id: 'ca_rex_first_kill_10',   name: 'Rex Rival',          description: 'Defeat Dagannoth Rex before completing Dragon Slayer I equivalent.',    tier: 'easy', category: 'mechanic', injects: [4, 14] }));
r('dagannoth_prime',       T({ id: 'ca_prime_first_kill_10', name: 'Prime Rival',        description: 'Defeat Dagannoth Prime before completing Dragon Slayer I equivalent.',  tier: 'easy', category: 'mechanic', injects: [4, 14] }));
r('dagannoth_supreme',     T({ id: 'ca_supreme_first_kill_10', name: 'Supreme Rival',    description: 'Defeat Dagannoth Supreme before completing Dragon Slayer I equivalent.', tier: 'easy', category: 'mechanic', injects: [4, 14] }));

// ══════════════════════════════════════════════════════════════════════════════
// TIER BALANCING: additional grandmaster feats so GM threshold (1200 pts)
// is achievable without completing every task in the game.
// ══════════════════════════════════════════════════════════════════════════════
r('veldrak',                T({ id: 'ca_veldrak_solo_no_damage',  name: 'Solo Unscathed Dragon', description: 'Defeat Veldrak solo without taking damage.',                                tier: 'grandmaster', category: 'perfection', injects: [9, 10, 13] }));
r('veldrak',                T({ id: 'ca_veldrak_no_gear',         name: 'Bare-Handed Dragon',    description: 'Defeat Veldrak without wearing tier-85+ gear.',                             tier: 'grandmaster', category: 'gear',       injects: [7, 16] }));
r('the_nightmare',          T({ id: 'ca_nm_solo_no_damage',       name: 'Untouched Dreamer',     description: 'Defeat The Nightmare solo without taking damage.',                           tier: 'grandmaster', category: 'perfection', injects: [9, 10, 13] }));
r('the_nightmare',          T({ id: 'ca_nm_under_3m',             name: 'Speed REM',             description: 'Defeat The Nightmare in under 3 minutes.',                                   tier: 'grandmaster', category: 'speed',      injects: [12] }));
r('corporeal_beast',        T({ id: 'ca_corp_solo_no_damage',     name: 'Untouched Corp',        description: 'Defeat the Corporeal Beast solo without taking damage.',                     tier: 'grandmaster', category: 'perfection', injects: [9, 10, 13] }));
r('corporeal_beast',        T({ id: 'ca_corp_solo_no_food',       name: 'Lonely Fasting Beast',  description: 'Defeat the Corporeal Beast solo without eating any food.',                   tier: 'grandmaster', category: 'restriction', injects: [5, 10, 13] }));
r('zulrah',                 T({ id: 'ca_zulrah_perfect_50',       name: 'Perfect Serpent x50',   description: 'Defeat Zulrah 50 times without taking damage in any of those kills.',         tier: 'grandmaster', category: 'perfection', injects: [4, 10, 11, 13] }));
r('vorkath',                T({ id: 'ca_vorkath_perfect_50',      name: 'Perfect Dragon x50',    description: 'Defeat Vorkath 50 times without taking damage in any of those kills.',        tier: 'grandmaster', category: 'perfection', injects: [4, 10, 11, 13] }));
r('commander_zilyana',      T({ id: 'ca_zil_solo_no_damage',      name: 'Solo Saradomin Pure',   description: 'Defeat Commander Zilyana solo without taking damage.',                        tier: 'grandmaster', category: 'perfection', injects: [9, 10, 13] }));
r('general_graardor',       T({ id: 'ca_graar_solo_no_damage',    name: 'Solo Bandos Pure',      description: 'Defeat General Graardor solo without taking damage.',                         tier: 'grandmaster', category: 'perfection', injects: [9, 10, 13] }));
r('kreearra',               T({ id: 'ca_kree_solo_no_damage',     name: 'Solo Armadyl Pure',     description: "Defeat Kree'arra solo without taking damage.",                                tier: 'grandmaster', category: 'perfection', injects: [9, 10, 13] }));
r('kril_tsutsaroth',        T({ id: 'ca_kril_solo_no_damage',     name: 'Solo Zamorak Pure',     description: "Defeat K'ril Tsutsaroth solo without taking damage.",                         tier: 'grandmaster', category: 'perfection', injects: [9, 10, 13] }));
r('the_glass_tyrant',       T({ id: 'ca_glass_speed_60',          name: 'Shatter Sprint',        description: 'Defeat The Glass Tyrant in under 60 seconds.',                                tier: 'grandmaster', category: 'speed',       injects: [12, 13] }));
r('sol_heredit_colosseum',  T({ id: 'ca_sol_no_switches',         name: 'Single-Style Champion', description: 'Defeat Sol Heredit without switching attack style during the fight.',        tier: 'grandmaster', category: 'restriction', injects: [4, 13, 16] }));
r('sol_heredit_colosseum',  T({ id: 'ca_sol_no_food',             name: 'Fasting Champion',      description: 'Defeat Sol Heredit without eating any food.',                                 tier: 'grandmaster', category: 'restriction', injects: [5, 10, 13] }));
r('crystal_wyrm',           T({ id: 'ca_wyrm_no_damage_storm',    name: 'Unchilled Crystal',     description: 'Defeat the Crystal Wyrm without taking damage from the ice storm OR its basic attack.', tier: 'grandmaster', category: 'perfection', injects: [4, 10, 13] }));

// ══════════════════════════════════════════════════════════════════════════════
// Boot summary
// ══════════════════════════════════════════════════════════════════════════════

const summary = ca.registry();
console.log(`[aelgard] Combat Achievement tasks loaded: ${summary.totalTasks} tasks across ${summary.totalBosses} bosses`);
for (const tier of ca.TIERS) {
  console.log(`[aelgard]   ${tier}: ${summary.byTier[tier]} tasks`);
}

module.exports = { summary };
