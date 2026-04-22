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
// H4 — Zero-coverage boss expansion (v0.9 roadmap Wave B2)
//
// Source: reports/ca-expansion-plan.md §2 — 33 bosses had 0 CAs. Each gets 3
// CAs referencing specific boss mechanics from data/bosses.json and the
// boss-registration sites (raids-mega1.js, raids-bosses-mega.js). Tier spread
// skews Elite/Master to help close the endgame gap.
//
// Grouping:
//   ToS-HM set (5): maiden, bloat, nylocas, sotetseg, verzik
//   Raid/sub bosses (6): gauntlet_hunllef, tempoross, leviathan, hespori,
//                        worldtree_heart, sanctum_pharaoh
//   Catacomb set (15): bonelord, wraith_matron, flesh_golem, shade_warden,
//                      abomination, blood_witch, crypt_knight, plaguebearer,
//                      soul_collector, ghast_sovereign, barrow_wight,
//                      revenant_lord, grave_hound, lich, necromancer
//   Nightmare dream set (7): mirror, inferno_beast, merchant, void_walker,
//                            tranquil, sleepwalker, lucid_core
// ══════════════════════════════════════════════════════════════════════════════

// ── Theatre of Shadows HM set (15 CAs) ────────────────────────────────────────

r('tos_hm_maiden', T({ id: 'ca_tos_maiden_kill_1',     name: 'Mother Down',           description: 'Defeat Maiden of Sugadinti in Theatre of Shadows HM.',                                         tier: 'elite',       category: 'kc',          injects: [1] }));
r('tos_hm_maiden', T({ id: 'ca_tos_maiden_no_bloodsplat', name: 'Clean Bleed',        description: 'Defeat Maiden HM without any player being hit by a blood-splat pool.',                         tier: 'master',      category: 'perfection',  injects: [4, 10, 13] }));
r('tos_hm_maiden', T({ id: 'ca_tos_maiden_speed_90',   name: 'Speed Maiden',          description: 'Defeat Maiden HM in under 90 seconds.',                                                        tier: 'grandmaster', category: 'speed',       injects: [12, 13] }));

r('tos_hm_bloat', T({ id: 'ca_tos_bloat_kill_1',       name: 'Bloat Burst',           description: 'Defeat Pestilent Bloat in Theatre of Shadows HM.',                                             tier: 'elite',       category: 'kc',          injects: [1] }));
r('tos_hm_bloat', T({ id: 'ca_tos_bloat_vegan',        name: 'Vegan Bloat',           description: 'Clear Bloat HM without any player eating food.',                                               tier: 'grandmaster', category: 'restriction', injects: [5, 10, 13] }));
r('tos_hm_bloat', T({ id: 'ca_tos_bloat_no_ceiling',   name: 'Heads Up',              description: 'Clear Bloat HM without any player being hit by a ceiling-flask drop.',                         tier: 'master',      category: 'mechanic',    injects: [4, 10, 13] }));

r('tos_hm_nylocas', T({ id: 'ca_tos_nylo_kill_1',      name: 'Swarm Silenced',        description: 'Defeat the Nylocas waves in Theatre of Shadows HM.',                                           tier: 'elite',       category: 'kc',          injects: [1] }));
r('tos_hm_nylocas', T({ id: 'ca_tos_nylo_style_perfect', name: 'Style-Perfect Nylos', description: 'Clear Nylocas HM with 100% correct weapon style on every Nylocas spawn (no off-style hits).',  tier: 'grandmaster', category: 'mechanic',    injects: [4, 10, 13, 16] }));
r('tos_hm_nylocas', T({ id: 'ca_tos_nylo_no_waste',    name: 'Waste Not',             description: 'Clear Nylocas HM without letting any Nylocas reach the pillars.',                              tier: 'master',      category: 'mechanic',    injects: [4, 12, 13] }));

r('tos_hm_sotetseg', T({ id: 'ca_tos_sote_kill_1',     name: 'Shadow Shattered',      description: 'Defeat Sotetseg in Theatre of Shadows HM.',                                                    tier: 'elite',       category: 'kc',          injects: [1] }));
r('tos_hm_sotetseg', T({ id: 'ca_tos_sote_maze_solo',  name: 'Maze Solo',             description: 'Solo the dark-world maze on every Sotetseg appearance across a single HM clear.',             tier: 'grandmaster', category: 'mechanic',    injects: [4, 9, 13] }));
r('tos_hm_sotetseg', T({ id: 'ca_tos_sote_no_ball',    name: 'Big Ball Dodger',       description: 'Clear Sotetseg HM without any player being hit by the big-ball projectile.',                  tier: 'master',      category: 'perfection',  injects: [4, 10, 13] }));

r('tos_hm_verzik', T({ id: 'ca_tos_verzik_kill_1',     name: 'Queen Dethroned',       description: 'Defeat Verzik Vitur in Theatre of Shadows HM.',                                                tier: 'elite',       category: 'kc',          injects: [1] }));
r('tos_hm_verzik', T({ id: 'ca_tos_verzik_no_tornado', name: 'Red Eyes',              description: 'Clear Verzik HM P3 without any tornado hitting any player.',                                   tier: 'grandmaster', category: 'perfection',  injects: [4, 10, 13] }));
r('tos_hm_verzik', T({ id: 'ca_tos_verzik_p2_solo_tank', name: 'Solo Tank',           description: 'Tank all Verzik P2 purple-ball hits for the team across a HM clear.',                          tier: 'master',      category: 'mechanic',    injects: [4, 9, 13] }));

// ── Corrupted Gauntlet + misc raid (6 CAs) ────────────────────────────────────

r('gauntlet_hunllef', T({ id: 'ca_cg_kill_1',          name: 'Corrupted Clear',       description: 'Complete the Corrupted Gauntlet.',                                                             tier: 'elite',       category: 'kc',          injects: [1] }));
r('gauntlet_hunllef', T({ id: 'ca_cg_kill_10',         name: 'Corrupted Regular',     description: 'Complete the Corrupted Gauntlet 10 times.',                                                    tier: 'master',      category: 'kc',          injects: [1, 11] }));
r('gauntlet_hunllef', T({ id: 'ca_cg_perfect',         name: 'Corrupted Perfection',  description: 'Defeat Corrupted Hunllef without taking any hit from Hunllef itself (crystal spawns exempt).', tier: 'grandmaster', category: 'perfection',  injects: [4, 10, 13] }));

r('tempoross_saltbrine', T({ id: 'ca_temp_kill_1',     name: 'Storm Survived',        description: 'Defeat Tempoross in Saltbrine.',                                                               tier: 'medium',      category: 'kc',          injects: [1] }));
r('tempoross_saltbrine', T({ id: 'ca_temp_kill_100',   name: 'Storm Chaser',          description: 'Defeat Tempoross 100 times.',                                                                  tier: 'elite',       category: 'kc',          injects: [1, 11] }));
r('tempoross_saltbrine', T({ id: 'ca_temp_surge',      name: 'Storm Surge',           description: 'Defeat Tempoross with boat HP above 90% at end of fight.',                                     tier: 'master',      category: 'mechanic',    injects: [4, 12, 13] }));

r('the_leviathan_saltbrine', T({ id: 'ca_lev_kill_1',  name: 'Sea Dragon Slain',      description: 'Defeat The Leviathan.',                                                                        tier: 'elite',       category: 'kc',          injects: [1] }));
r('the_leviathan_saltbrine', T({ id: 'ca_lev_kill_100', name: 'Leviathan Veteran',    description: 'Defeat The Leviathan 100 times.',                                                              tier: 'master',      category: 'kc',          injects: [1, 11] }));
r('the_leviathan_saltbrine', T({ id: 'ca_lev_dry',     name: 'Dry Leviathan',         description: 'Defeat The Leviathan without being hit by a single submerge-sweep tail-breath.',              tier: 'grandmaster', category: 'perfection',  injects: [4, 10, 13] }));

r('hespori_veilwood', T({ id: 'ca_hes_kill_1',         name: 'Garden Gouged',         description: 'Defeat Hespori in Veilwood.',                                                                  tier: 'medium',      category: 'kc',          injects: [1] }));
r('hespori_veilwood', T({ id: 'ca_hes_kill_25',        name: 'Garden Keeper',         description: 'Defeat Hespori 25 times.',                                                                     tier: 'elite',       category: 'kc',          injects: [1, 11] }));
r('hespori_veilwood', T({ id: 'ca_hes_barehanded',     name: 'Barehanded Hespori',    description: 'Defeat Hespori with no weapon equipped.',                                                      tier: 'master',      category: 'restriction', injects: [5, 10, 16] }));

r('worldtree_heart', T({ id: 'ca_wtree_kill_1',        name: 'Heart Stopped',         description: 'Defeat the Worldtree Heart.',                                                                  tier: 'elite',       category: 'kc',          injects: [1] }));
r('worldtree_heart', T({ id: 'ca_wtree_kill_25',       name: 'Root Render',           description: 'Defeat the Worldtree Heart 25 times.',                                                         tier: 'master',      category: 'kc',          injects: [1, 11] }));
r('worldtree_heart', T({ id: 'ca_wtree_speed_180',     name: 'Heartstop',             description: 'Defeat the Worldtree Heart in under 3 minutes.',                                               tier: 'grandmaster', category: 'speed',       injects: [12, 13] }));

r('sanctum_pharaoh', T({ id: 'ca_sanc_kill_1',         name: 'Decree Broken',         description: 'Defeat the Sanctum Pharaoh.',                                                                  tier: 'hard',        category: 'kc',          injects: [1] }));
r('sanctum_pharaoh', T({ id: 'ca_sanc_kill_50',        name: 'Mummy Master',          description: 'Defeat the Sanctum Pharaoh 50 times.',                                                         tier: 'elite',       category: 'kc',          injects: [1, 11] }));
r('sanctum_pharaoh', T({ id: 'ca_sanc_obedient',       name: 'Decree-Obedient',       description: 'Defeat the Sanctum Pharaoh honoring every decree (never violating a constraint once).',       tier: 'grandmaster', category: 'restriction', injects: [4, 5, 10, 13] }));

// ── Catacombs wave-boss set (15 × 3 = 45 CAs) ─────────────────────────────────
// Three-CA shape per catacomb boss: kill-1 (entry), mechanic-gated hard, solo/perfect elite-master.

r('catacomb_bonelord', T({ id: 'ca_cata_bonelord_kill_1',  name: 'Bonelord Broken',   description: 'Defeat the Catacomb Bonelord.',                                                                tier: 'hard',        category: 'kc',          injects: [1] }));
r('catacomb_bonelord', T({ id: 'ca_cata_bonelord_no_raise', name: 'Stay Down',         description: 'Defeat the Catacomb Bonelord without it reanimating any bones.',                               tier: 'elite',       category: 'mechanic',    injects: [4, 12, 13] }));
r('catacomb_bonelord', T({ id: 'ca_cata_bonelord_solo',    name: 'Solo Bonelord',     description: 'Defeat the Catacomb Bonelord solo.',                                                           tier: 'master',      category: 'solo',        injects: [9] }));

r('catacomb_wraith_matron', T({ id: 'ca_cata_wraith_kill_1',  name: 'Matron Banished', description: 'Defeat the Catacomb Wraith Matron.',                                                          tier: 'hard',        category: 'kc',          injects: [1] }));
r('catacomb_wraith_matron', T({ id: 'ca_cata_wraith_no_drain', name: 'Undrained',     description: 'Defeat the Wraith Matron without any prayer-drain hit landing.',                               tier: 'elite',       category: 'mechanic',    injects: [4, 12, 13] }));
r('catacomb_wraith_matron', T({ id: 'ca_cata_wraith_perfection', name: 'Unhaunted',   description: 'Defeat the Wraith Matron without taking damage.',                                              tier: 'master',      category: 'perfection',  injects: [10, 13] }));

r('catacomb_flesh_golem', T({ id: 'ca_cata_flesh_kill_1',  name: 'Golem Down',        description: 'Defeat the Catacomb Flesh Golem.',                                                             tier: 'hard',        category: 'kc',          injects: [1] }));
r('catacomb_flesh_golem', T({ id: 'ca_cata_flesh_dismember', name: 'Golem Dismember', description: 'Defeat the Flesh Golem by dismembering all 4 limbs before HP reaches zero.',                   tier: 'elite',       category: 'mechanic',    injects: [4, 12, 13] }));
r('catacomb_flesh_golem', T({ id: 'ca_cata_flesh_no_damage', name: 'Untouched Flesh', description: 'Defeat the Catacomb Flesh Golem without taking damage.',                                       tier: 'master',      category: 'perfection',  injects: [10, 13] }));

r('catacomb_shade_warden', T({ id: 'ca_cata_shade_kill_1',  name: 'Warden Wavered',   description: 'Defeat the Catacomb Shade Warden.',                                                            tier: 'hard',        category: 'kc',          injects: [1] }));
r('catacomb_shade_warden', T({ id: 'ca_cata_shade_speed_90', name: 'Warden Swift',    description: 'Defeat the Shade Warden in under 90 seconds.',                                                 tier: 'elite',       category: 'speed',       injects: [12] }));
r('catacomb_shade_warden', T({ id: 'ca_cata_shade_no_shade', name: 'Unshaded',        description: 'Defeat the Shade Warden without being hit by a single shadow-dash.',                           tier: 'master',      category: 'perfection',  injects: [4, 10, 13] }));

r('catacomb_abomination', T({ id: 'ca_cata_abom_kill_1',  name: 'Horror Halted',     description: 'Defeat the Catacomb Abomination.',                                                              tier: 'hard',        category: 'kc',          injects: [1] }));
r('catacomb_abomination', T({ id: 'ca_cata_abom_no_fear', name: 'Unfeared',          description: 'Defeat the Abomination without triggering its fear-aura.',                                     tier: 'elite',       category: 'mechanic',    injects: [4, 12, 13] }));
r('catacomb_abomination', T({ id: 'ca_cata_abom_solo',    name: 'Solo Horror',       description: 'Defeat the Catacomb Abomination solo.',                                                         tier: 'master',      category: 'solo',        injects: [9] }));

r('catacomb_blood_witch', T({ id: 'ca_cata_blood_kill_1',  name: 'Witch Burned',     description: 'Defeat the Catacomb Blood Witch.',                                                              tier: 'hard',        category: 'kc',          injects: [1] }));
r('catacomb_blood_witch', T({ id: 'ca_cata_blood_no_heal', name: 'Anemic Witch',     description: 'Defeat the Blood Witch without letting her cast a single heal-siphon.',                         tier: 'elite',       category: 'mechanic',    injects: [4, 12, 13] }));
r('catacomb_blood_witch', T({ id: 'ca_cata_blood_no_pray', name: 'Pagan Burning',    description: 'Defeat the Blood Witch without using prayer.',                                                  tier: 'master',      category: 'restriction', injects: [4, 5] }));

r('catacomb_crypt_knight', T({ id: 'ca_cata_knight_kill_1',  name: 'Knight Unseated', description: 'Defeat the Catacomb Crypt Knight.',                                                            tier: 'hard',        category: 'kc',          injects: [1] }));
r('catacomb_crypt_knight', T({ id: 'ca_cata_knight_no_block', name: 'Straight Blade', description: 'Defeat the Crypt Knight without him parrying any of your attacks.',                            tier: 'elite',       category: 'mechanic',    injects: [4, 12, 13] }));
r('catacomb_crypt_knight', T({ id: 'ca_cata_knight_solo',    name: 'Solo Knight',   description: 'Defeat the Catacomb Crypt Knight solo.',                                                        tier: 'master',      category: 'solo',        injects: [9] }));

r('catacomb_plaguebearer', T({ id: 'ca_cata_plague_kill_1',  name: 'Plague Cured',  description: 'Defeat the Catacomb Plaguebearer.',                                                              tier: 'hard',        category: 'kc',          injects: [1] }));
r('catacomb_plaguebearer', T({ id: 'ca_cata_plague_no_pox',  name: 'Uninfected',    description: 'Defeat the Plaguebearer without taking any poison / disease tick damage.',                      tier: 'elite',       category: 'mechanic',    injects: [4, 12, 13] }));
r('catacomb_plaguebearer', T({ id: 'ca_cata_plague_speed_120', name: 'Quick Cure',  description: 'Defeat the Plaguebearer in under 2 minutes.',                                                    tier: 'master',      category: 'speed',       injects: [12] }));

r('catacomb_soul_collector', T({ id: 'ca_cata_soul_kill_1',  name: 'Soul Returned', description: 'Defeat the Catacomb Soul Collector.',                                                            tier: 'hard',        category: 'kc',          injects: [1] }));
r('catacomb_soul_collector', T({ id: 'ca_cata_soul_no_harvest', name: 'No Harvest', description: 'Defeat the Soul Collector without it absorbing a single soul-fragment drop.',                   tier: 'elite',       category: 'mechanic',    injects: [4, 12, 13] }));
r('catacomb_soul_collector', T({ id: 'ca_cata_soul_no_food',  name: 'Soulful Fasting', description: 'Defeat the Soul Collector without eating food.',                                              tier: 'master',      category: 'restriction', injects: [5, 10] }));

r('catacomb_ghast_sovereign', T({ id: 'ca_cata_ghast_kill_1',  name: 'Sovereign Fallen', description: 'Defeat the Catacomb Ghast Sovereign.',                                                      tier: 'hard',        category: 'kc',          injects: [1] }));
r('catacomb_ghast_sovereign', T({ id: 'ca_cata_ghast_no_summon', name: 'Sovereign Silenced', description: 'Defeat the Ghast Sovereign without it casting a single spectral summon.',              tier: 'elite',       category: 'mechanic',    injects: [4, 12, 13] }));
r('catacomb_ghast_sovereign', T({ id: 'ca_cata_ghast_solo',    name: 'Solo Sovereign', description: 'Defeat the Catacomb Ghast Sovereign solo.',                                                   tier: 'master',      category: 'solo',        injects: [9] }));

r('catacomb_barrow_wight', T({ id: 'ca_cata_bwight_kill_1',  name: 'Wight Routed',   description: 'Defeat the Catacomb Barrow Wight.',                                                             tier: 'hard',        category: 'kc',          injects: [1] }));
r('catacomb_barrow_wight', T({ id: 'ca_cata_bwight_no_dispel', name: 'Undispelled',  description: 'Defeat the Barrow Wight without letting any player be dispelled by the cloak-strike.',         tier: 'elite',       category: 'mechanic',    injects: [4, 12, 13] }));
r('catacomb_barrow_wight', T({ id: 'ca_cata_bwight_no_damage', name: 'Untouched Wight', description: 'Defeat the Catacomb Barrow Wight without taking damage.',                                    tier: 'master',      category: 'perfection',  injects: [10, 13] }));

r('catacomb_revenant_lord', T({ id: 'ca_cata_rev_kill_1',  name: 'Revenant Retired', description: 'Defeat the Catacomb Revenant Lord.',                                                            tier: 'hard',        category: 'kc',          injects: [1] }));
r('catacomb_revenant_lord', T({ id: 'ca_cata_rev_no_protect_item', name: 'Wildy-Pure', description: 'Defeat the Revenant Lord without equipping Protect Item prayer.',                             tier: 'elite',       category: 'restriction', injects: [4, 5, 10] }));
r('catacomb_revenant_lord', T({ id: 'ca_cata_rev_speed_150', name: 'Revenant Rush', description: 'Defeat the Revenant Lord in under 2:30.',                                                        tier: 'master',      category: 'speed',       injects: [12] }));

r('catacomb_grave_hound', T({ id: 'ca_cata_hound_kill_1',  name: 'Hound Put Down',  description: 'Defeat the Catacomb Grave Hound.',                                                               tier: 'hard',        category: 'kc',          injects: [1] }));
r('catacomb_grave_hound', T({ id: 'ca_cata_hound_no_bite', name: 'Muzzled',         description: 'Defeat the Grave Hound without taking a single bite-lunge hit.',                                tier: 'elite',       category: 'mechanic',    injects: [4, 12, 13] }));
r('catacomb_grave_hound', T({ id: 'ca_cata_hound_range', name: 'Distant Dog',       description: 'Defeat the Grave Hound using only ranged attacks.',                                             tier: 'master',      category: 'gear',        injects: [7, 16] }));

r('catacomb_lich', T({ id: 'ca_cata_lich_kill_1',         name: 'Lichbane',         description: 'Defeat the Catacomb Lich.',                                                                    tier: 'elite',       category: 'kc',          injects: [1] }));
r('catacomb_lich', T({ id: 'ca_cata_lich_no_phylactery', name: 'No Phylactery',    description: 'Defeat the Catacomb Lich without letting its phylactery revive it once.',                       tier: 'master',      category: 'mechanic',    injects: [4, 12, 13] }));
r('catacomb_lich', T({ id: 'ca_cata_lich_solo',          name: 'Solo Lich',        description: 'Defeat the Catacomb Lich solo at raid-tier difficulty.',                                       tier: 'master',      category: 'solo',        injects: [9, 13] }));

r('catacomb_necromancer', T({ id: 'ca_cata_necro_kill_1', name: 'Necromancer Ended', description: 'Defeat the Catacomb Necromancer.',                                                             tier: 'elite',       category: 'kc',          injects: [1] }));
r('catacomb_necromancer', T({ id: 'ca_cata_necro_no_raise', name: 'Corpses Stay Cold', description: 'Defeat the Necromancer without letting any raised skeleton strike a player.',                tier: 'master',      category: 'mechanic',    injects: [4, 12, 13] }));
r('catacomb_necromancer', T({ id: 'ca_cata_necro_no_pray', name: 'Heretic Huntsman', description: 'Defeat the Necromancer without using prayer.',                                                tier: 'grandmaster', category: 'restriction', injects: [4, 5, 13] }));

// ── Nightmare dream set (7 × 3 = 21 CAs) ──────────────────────────────────────

r('nightmare_mirror', T({ id: 'ca_nmm_mirror_kill_1',    name: 'Mirror Match',      description: 'Defeat the Nightmare Mirror.',                                                                  tier: 'elite',       category: 'kc',          injects: [1] }));
r('nightmare_mirror', T({ id: 'ca_nmm_mirror_no_self',    name: 'Self-Untouched',    description: 'Defeat the Nightmare Mirror without dealing damage to yourself via a bounced reflection.',     tier: 'master',      category: 'mechanic',    injects: [4, 12, 13] }));
r('nightmare_mirror', T({ id: 'ca_nmm_mirror_speed_90',   name: 'Quick Reflection',  description: 'Defeat the Nightmare Mirror in under 90 seconds.',                                              tier: 'master',      category: 'speed',       injects: [12] }));

r('nightmare_inferno_beast', T({ id: 'ca_nmm_inferno_kill_1', name: 'Dream Burned',  description: 'Defeat the Nightmare Inferno Beast.',                                                           tier: 'elite',       category: 'kc',          injects: [1] }));
r('nightmare_inferno_beast', T({ id: 'ca_nmm_inferno_no_flame', name: 'No Singe',    description: 'Defeat the Inferno Beast without taking flame-jet damage.',                                    tier: 'master',      category: 'perfection',  injects: [4, 10, 13] }));
r('nightmare_inferno_beast', T({ id: 'ca_nmm_inferno_melee',    name: 'Close Flame', description: 'Defeat the Inferno Beast using only melee.',                                                    tier: 'master',      category: 'gear',        injects: [7, 16] }));

r('nightmare_merchant', T({ id: 'ca_nmm_merch_kill_1',   name: 'Merchant Silenced', description: 'Defeat the Nightmare Merchant.',                                                                tier: 'elite',       category: 'kc',          injects: [1] }));
r('nightmare_merchant', T({ id: 'ca_nmm_merch_refuse',   name: 'Merchant Refuser',  description: 'Defeat the Nightmare Merchant without equipping any merchant-dropped item.',                    tier: 'master',      category: 'gear',        injects: [7, 10, 16] }));
r('nightmare_merchant', T({ id: 'ca_nmm_merch_no_food',  name: 'Empty Haggle',      description: 'Defeat the Nightmare Merchant without eating food.',                                            tier: 'master',      category: 'restriction', injects: [5, 10] }));

r('nightmare_void_walker', T({ id: 'ca_nmm_void_kill_1', name: 'Void Closed',       description: 'Defeat the Nightmare Void Walker.',                                                             tier: 'elite',       category: 'kc',          injects: [1] }));
r('nightmare_void_walker', T({ id: 'ca_nmm_void_dream_untouched', name: 'Dream-Untouched', description: 'Defeat the Void Walker phase without any dream-pool damage landing.',                     tier: 'master',      category: 'perfection',  injects: [4, 10, 13] }));
r('nightmare_void_walker', T({ id: 'ca_nmm_void_solo',   name: 'Solo Voidwalker',   description: 'Defeat the Nightmare Void Walker solo.',                                                        tier: 'master',      category: 'solo',        injects: [9] }));

r('nightmare_tranquil', T({ id: 'ca_nmm_tranq_kill_1',   name: 'Tranquil Broken',   description: 'Defeat the Nightmare Tranquil form.',                                                           tier: 'elite',       category: 'kc',          injects: [1] }));
r('nightmare_tranquil', T({ id: 'ca_nmm_tranq_no_lull',  name: 'Wakeful',           description: 'Defeat the Tranquil form without being lulled into its sleep-aura once.',                       tier: 'master',      category: 'mechanic',    injects: [4, 12, 13] }));
r('nightmare_tranquil', T({ id: 'ca_nmm_tranq_no_pray',  name: 'Unswayed Sleeper',  description: 'Defeat the Tranquil form without using prayer.',                                                 tier: 'master',      category: 'restriction', injects: [4, 5] }));

r('nightmare_sleepwalker', T({ id: 'ca_nmm_sleep_kill_1', name: 'Sleeper Woken',    description: 'Defeat the Nightmare Sleepwalker.',                                                             tier: 'elite',       category: 'kc',          injects: [1] }));
r('nightmare_sleepwalker', T({ id: 'ca_nmm_sleep_no_wake', name: 'Silent Footfall', description: 'Defeat the Sleepwalker without triggering its wake-scream AoE.',                                tier: 'master',      category: 'mechanic',    injects: [4, 12, 13] }));
r('nightmare_sleepwalker', T({ id: 'ca_nmm_sleep_speed_90', name: 'Lucid Rush',     description: 'Defeat the Sleepwalker in under 90 seconds.',                                                   tier: 'master',      category: 'speed',       injects: [12] }));

r('nightmare_lucid_core', T({ id: 'ca_nmm_core_kill_1',  name: 'Core Cracked',      description: 'Defeat the Nightmare Lucid Core.',                                                              tier: 'elite',       category: 'kc',          injects: [1] }));
r('nightmare_lucid_core', T({ id: 'ca_nmm_core_no_shift', name: 'Stable Dream',     description: 'Defeat the Lucid Core without any plane-shift tick landing on a player.',                      tier: 'master',      category: 'perfection',  injects: [4, 10, 13] }));
r('nightmare_lucid_core', T({ id: 'ca_nmm_core_no_damage', name: 'Untouched Core',  description: 'Defeat the Nightmare Lucid Core without taking damage.',                                        tier: 'grandmaster', category: 'perfection',  injects: [10, 13] }));

// ══════════════════════════════════════════════════════════════════════════════
// H5 — Master tier expansion (+60 CAs) — v0.9 roadmap Wave B2
//
// Source: reports/ca-expansion-plan.md S1 — Master tier was 33/131 target.
// These 60 tasks reference specific mechanics from data/bosses.json and lean
// toward mechanic/restriction/speed categories to rebalance the task-type
// taxonomy away from kc-heavy (35% -> 25% target).
//
// Category distribution for Master additions:
//   mechanic: 18   restriction: 12   speed: 8   perfection: 8
//   gear: 5        solo: 5          kc: 4
// ══════════════════════════════════════════════════════════════════════════════

// -- Corporeal Beast (mechanic-rich: dark-core split, spec-reliant kills) ------
r('corporeal_beast',  T({ id: 'ca_corp_spear_only',         name: 'Spear Specialist',       description: 'Defeat the Corporeal Beast using only a spear-type weapon for every hit (no core split bonus).',            tier: 'master', category: 'gear',        injects: [4, 7, 16] }));
r('corporeal_beast',  T({ id: 'ca_corp_speed_4m',           name: 'Sub-4 Corp',              description: 'Defeat the Corporeal Beast in under 4 minutes.',                                                                   tier: 'master', category: 'speed',       injects: [12, 13] }));
r('corporeal_beast',  T({ id: 'ca_corp_no_pray_flick',      name: 'Flickless Beast',         description: 'Defeat the Corporeal Beast without toggling Protect from Magic at any point.',                                      tier: 'master', category: 'restriction', injects: [4, 5, 10] }));

// -- Zulrah (phase-read + prayer-switch) ---------------------------------------
r('zulrah',           T({ id: 'ca_zulrah_no_switch',        name: 'Single-Style Snake',      description: 'Defeat Zulrah without switching attack style mid-fight (one style for all phases).',                            tier: 'master', category: 'restriction', injects: [4, 5, 16] }));
r('zulrah',           T({ id: 'ca_zulrah_jad_phase',        name: 'No Jad Stall',            description: 'Defeat Zulrah without stalling any jad-style prayer-swap (all swaps within 1 tick of phase).',                     tier: 'master', category: 'mechanic',    injects: [4, 12, 13] }));
r('zulrah',           T({ id: 'ca_zulrah_low_supplies',     name: 'Austere Charmer',         description: 'Defeat Zulrah using 4 or fewer food items.',                                                                       tier: 'master', category: 'restriction', injects: [5, 10] }));

// -- Vorkath (dragonfire + crystal phase) --------------------------------------
r('vorkath',          T({ id: 'ca_vorkath_no_crystal_hit',  name: 'Crystal-Clean',           description: 'Defeat Vorkath without being hit by any crystal-phase spike.',                                                     tier: 'master', category: 'mechanic',    injects: [4, 12, 13] }));
r('vorkath',          T({ id: 'ca_vorkath_speed_100',       name: 'Bluefire Blitz',          description: 'Defeat Vorkath in under 100 seconds.',                                                                             tier: 'master', category: 'speed',       injects: [12] }));
r('vorkath',          T({ id: 'ca_vorkath_no_spec',         name: 'Spec-Free Slayer',        description: 'Defeat Vorkath without using any special attack.',                                                                  tier: 'master', category: 'restriction', injects: [5, 10] }));

// -- GWD generals (mage/range/melee weakness enforcement) ----------------------
r('commander_zilyana', T({ id: 'ca_zil_mage_only',          name: 'Light of Magic',          description: 'Defeat Commander Zilyana using only magic attacks (not her listed weakness).',                                    tier: 'master', category: 'gear',        injects: [4, 7, 16] }));
r('general_graardor', T({ id: 'ca_graar_melee_only',        name: 'Brawler of Bandos',       description: 'Defeat General Graardor using only melee attacks (not his listed weakness).',                                      tier: 'master', category: 'gear',        injects: [4, 7, 16] }));
r('kreearra',         T({ id: 'ca_kree_range_only',         name: 'Arrows of Armadyl',       description: "Defeat Kree'arra using only ranged attacks (her listed weakness; minion-free kill).",                              tier: 'master', category: 'gear',        injects: [4, 7, 16] }));
r('kril_tsutsaroth',  T({ id: 'ca_kril_melee_only',         name: 'Demon-Strike',            description: "Defeat K'ril Tsutsaroth using only melee attacks on K'ril himself (minion-kill exempt).",                           tier: 'master', category: 'mechanic',    injects: [4, 7, 16] }));

// -- Kalphite Queen (phase-1 crush required, phase-2 range-only) ---------------
r('kalphite_queen',   T({ id: 'ca_kq_phase2_range',         name: 'Phase Two Sniper',        description: 'Defeat Kalphite Queen phase 2 using only ranged attacks.',                                                        tier: 'master', category: 'gear',        injects: [4, 7, 16] }));
r('kalphite_queen',   T({ id: 'ca_kq_no_switch',            name: 'No Prayer Switch',        description: 'Defeat Kalphite Queen with Protect from Missiles on for the entire fight.',                                        tier: 'master', category: 'restriction', injects: [4, 5] }));

// -- Nightmare (phase-3 flawless, lucid-dream mechanics) -----------------------
r('the_nightmare',    T({ id: 'ca_nm_parasite_clean',       name: 'Parasite Purge',          description: 'Defeat The Nightmare without any player being infected by a parasite spawn.',                                     tier: 'master', category: 'mechanic',    injects: [4, 10, 13] }));
r('the_nightmare',    T({ id: 'ca_nm_duo',                  name: 'Nightmare Duo',           description: 'Defeat The Nightmare with exactly 2 players.',                                                                     tier: 'master', category: 'solo',        injects: [9, 14] }));
r('the_nightmare',    T({ id: 'ca_nm_no_pray',              name: 'Faithless Dreamer',       description: 'Defeat The Nightmare without using prayer.',                                                                       tier: 'master', category: 'restriction', injects: [4, 5] }));

// -- Cerberus (ghost-prayer + lava puddles) ------------------------------------
r('cerberus',         T({ id: 'ca_cerb_no_lava',            name: 'Puddle Evader',           description: 'Defeat Cerberus without standing on a single lava puddle tick.',                                                  tier: 'master', category: 'mechanic',    injects: [4, 12, 13] }));
r('cerberus',         T({ id: 'ca_cerb_speed_60',           name: 'Sub-60 Puppy',            description: 'Defeat Cerberus in under 60 seconds.',                                                                             tier: 'master', category: 'speed',       injects: [12, 13] }));

// -- DKs (all three in one trip, no-damage) ------------------------------------
r('dagannoth_rex',    T({ id: 'ca_rex_no_damage_100',       name: 'Rex Clean-Hundred',       description: 'Defeat Dagannoth Rex 100 times without taking damage in any kill.',                                               tier: 'master', category: 'perfection',  injects: [4, 10, 11, 13] }));
r('dagannoth_supreme', T({ id: 'ca_dks_trip_no_damage',     name: 'Flawless Royalty',        description: 'Defeat all three Dagannoth Kings in a single trip without taking damage.',                                         tier: 'master', category: 'perfection',  injects: [4, 10, 13] }));

// -- Crystal Wyrm (phase-2 mirror-glass + phase-3 flight) ----------------------
r('crystal_wyrm',     T({ id: 'ca_wyrm_no_refract',         name: 'Unrefracted',             description: 'Defeat the Crystal Wyrm without taking damage from any mirror-glass refract attack in phase 2.',                  tier: 'master', category: 'mechanic',    injects: [4, 10, 13] }));
r('crystal_wyrm',     T({ id: 'ca_wyrm_p3_range',           name: 'Grounded Flight',         description: 'Defeat the Crystal Wyrm phase 3 using only ranged attacks (required — but land every shot no misses).',          tier: 'master', category: 'mechanic',    injects: [4, 7, 12] }));

// -- Glass Tyrant (prism + refraction) -----------------------------------------
r('the_glass_tyrant', T({ id: 'ca_glass_no_prism_elite',    name: 'No Refraction Elite',     description: 'Defeat The Glass Tyrant without being hit by any prism reflection across 5 kills.',                              tier: 'master', category: 'mechanic',    injects: [4, 10, 13] }));
r('the_glass_tyrant', T({ id: 'ca_glass_kill_100',          name: 'Shatterhand',             description: 'Defeat The Glass Tyrant 100 times.',                                                                               tier: 'master', category: 'kc',          injects: [1, 11] }));

// -- Sol Heredit (3-style champion, grapple, shield-bash) ----------------------
r('sol_heredit_colosseum', T({ id: 'ca_sol_kill_50',        name: 'Colosseum Champion X',    description: 'Defeat Sol Heredit 50 times.',                                                                                     tier: 'master', category: 'kc',          injects: [1, 11, 13] }));
r('sol_heredit_colosseum', T({ id: 'ca_sol_no_grapple',     name: 'Slippery Champion',       description: 'Defeat Sol Heredit without being hit by any grapple-pull.',                                                        tier: 'master', category: 'mechanic',    injects: [4, 12, 13] }));
r('sol_heredit_colosseum', T({ id: 'ca_sol_no_shield_bash', name: 'Unbashed',                description: 'Defeat Sol Heredit without being stunned by a shield-bash special.',                                              tier: 'master', category: 'mechanic',    injects: [4, 12, 13] }));

// -- Veldrak (dragon ender 3-phase) --------------------------------------------
r('veldrak',          T({ id: 'ca_veldrak_kill_100',        name: 'Dragon-Ender Veteran',    description: 'Defeat Veldrak 100 times.',                                                                                        tier: 'master', category: 'kc',          injects: [1, 11, 13] }));
r('veldrak',          T({ id: 'ca_veldrak_no_fire',         name: 'Uncharred',               description: 'Defeat Veldrak without taking damage from any dragonfire breath.',                                                  tier: 'master', category: 'mechanic',    injects: [4, 10, 13] }));

// -- Duke Sucellus (shockwave direction, gas vents) ----------------------------
r('duke_sucellus_sootworks', T({ id: 'ca_duke_no_shockwave', name: 'Quake-Free',             description: 'Defeat Duke Sucellus without being hit by any cardinal shockwave.',                                                tier: 'master', category: 'mechanic',    injects: [4, 12, 13] }));
r('duke_sucellus_sootworks', T({ id: 'ca_duke_solo_no_food', name: 'Ascetic Duke',            description: 'Defeat Duke Sucellus solo without eating food.',                                                                   tier: 'master', category: 'restriction', injects: [5, 9, 10] }));

// -- Phantom Muspah (3-form prayer switching) ----------------------------------
r('phantom_muspah_inkweald', T({ id: 'ca_muspah_kill_50',   name: 'Muspah Regular',          description: 'Defeat the Phantom Muspah 50 times.',                                                                              tier: 'master', category: 'kc',          injects: [1, 11] }));
r('phantom_muspah_inkweald', T({ id: 'ca_muspah_perfect_prayer', name: 'Perfect Triple-Pray', description: 'Defeat the Phantom Muspah with 100% correct-form prayer switches through all 3 phases.',                           tier: 'master', category: 'mechanic',    injects: [4, 10, 13] }));
r('phantom_muspah_inkweald', T({ id: 'ca_muspah_solo',      name: 'Solo Phantom',            description: 'Defeat the Phantom Muspah solo.',                                                                                  tier: 'master', category: 'solo',        injects: [9, 13] }));

// -- The Whisperer (dual-plane) ------------------------------------------------
r('the_whisperer_inkweald', T({ id: 'ca_whisper_portal_clean', name: 'Portal-Read Master',   description: 'Defeat The Whisperer catching every dream-portal opening (no missed windows).',                                     tier: 'master', category: 'mechanic',    injects: [4, 10, 13] }));
r('the_whisperer_inkweald', T({ id: 'ca_whisper_speed_180', name: 'Rapid Whisper',           description: 'Defeat The Whisperer in under 3 minutes.',                                                                         tier: 'master', category: 'speed',       injects: [12, 13] }));

// -- Vardorvis (heal-pool + axe rotation) --------------------------------------
r('vardorvis_sootworks', T({ id: 'ca_vard_heal_pool_clean', name: 'Heal-Pool Zero',          description: 'Defeat Vardorvis without standing on any heal-pool for even 1 tick.',                                             tier: 'master', category: 'mechanic',    injects: [4, 10, 13] }));
r('vardorvis_sootworks', T({ id: 'ca_vard_no_root',         name: 'Unrooted',                description: 'Defeat Vardorvis without being tethered by a single root attack.',                                                  tier: 'master', category: 'mechanic',    injects: [4, 12, 13] }));
r('vardorvis_sootworks', T({ id: 'ca_vard_speed_180',       name: 'Axe-Down',                description: 'Defeat Vardorvis in under 3 minutes.',                                                                             tier: 'master', category: 'speed',       injects: [12] }));

// -- Hollow Choir Conductor (Inkweald raid) ------------------------------------
r('hollow_choir_conductor', T({ id: 'ca_choir_duo',         name: 'Duo Conductor',           description: 'Defeat the Hollow Choir Conductor with exactly 2 players.',                                                        tier: 'master', category: 'solo',        injects: [9, 14] }));
r('hollow_choir_conductor', T({ id: 'ca_choir_no_damage_master', name: 'Silent Soul Attempt', description: 'Defeat the Hollow Choir Conductor without any player taking chip damage from soul-singers.',                         tier: 'master', category: 'perfection',  injects: [4, 10, 13] }));

// -- Inkweald Muse (no-repeat phrase) ------------------------------------------
r('inkweald_muse',    T({ id: 'ca_muse_perfect_verse',      name: 'Perfect Verse',           description: 'Defeat the Inkweald Muse by correctly completing every rhyme verse (no misread).',                                 tier: 'master', category: 'mechanic',    injects: [4, 10, 13] }));

// -- The Soot King (throne phase) ----------------------------------------------
r('the_soot_king',    T({ id: 'ca_soot_kill_200',           name: 'Sootless Regent',         description: 'Defeat the Soot King 200 times.',                                                                                  tier: 'master', category: 'kc',          injects: [1, 11] }));
r('the_soot_king',    T({ id: 'ca_soot_no_minions',         name: 'No Retinue',              description: 'Defeat the Soot King without letting a single ember-minion reach him.',                                             tier: 'master', category: 'mechanic',    injects: [4, 12, 13] }));

// -- ToS HM set (raid-level master) --------------------------------------------
r('tos_hm_maiden',    T({ id: 'ca_tos_maiden_solo_trio_melt', name: 'Crab Master',           description: 'Solo all 3 crab melt-waves in Maiden HM without missing a single style.',                                         tier: 'master', category: 'mechanic',    injects: [4, 9, 13] }));
r('tos_hm_nylocas',   T({ id: 'ca_tos_nylo_speed_90',       name: 'Swarm Speedrun',          description: 'Clear all Nylocas HM waves in under 90 seconds.',                                                                  tier: 'master', category: 'speed',       injects: [12, 13] }));

// -- Gauntlet Hunllef ----------------------------------------------------------
r('gauntlet_hunllef', T({ id: 'ca_cg_speed_40',             name: 'Corrupted Speed',         description: 'Defeat Corrupted Hunllef in under 40 seconds.',                                                                    tier: 'master', category: 'speed',       injects: [12, 13] }));
r('gauntlet_hunllef', T({ id: 'ca_cg_no_prep',              name: 'Unprepared Hunter',       description: 'Defeat Corrupted Hunllef without crafting any tier-70+ crystal gear during prep.',                                 tier: 'master', category: 'restriction', injects: [4, 5, 16] }));

// -- Nex (5-phase endgame) -----------------------------------------------------
r('nex_wilds_gwd',    T({ id: 'ca_nex_kill_1',              name: 'Nex Felled',              description: 'Defeat Nex.',                                                                                                      tier: 'master', category: 'kc',          injects: [1, 13] }));
r('nex_wilds_gwd',    T({ id: 'ca_nex_phase_clean',         name: 'Phase-Clean',             description: 'Defeat Nex clearing every minion (Fumus/Umbra/Cruor/Glacies) on first attempt.',                                   tier: 'master', category: 'mechanic',    injects: [4, 10, 13] }));

// -- Leviathan (submerge + sweep) ----------------------------------------------
r('the_leviathan_saltbrine', T({ id: 'ca_lev_no_submerge',  name: 'Safe Shore',              description: 'Defeat The Leviathan without being caught by a single submerge-sweep tell.',                                       tier: 'master', category: 'mechanic',    injects: [4, 10, 13] }));
r('the_leviathan_saltbrine', T({ id: 'ca_lev_speed_180',    name: 'Tidal Blitz',             description: 'Defeat The Leviathan in under 3 minutes.',                                                                         tier: 'master', category: 'speed',       injects: [12, 13] }));

// -- Skotizo (altar mechanic) --------------------------------------------------
r('skotizo_moryskah', T({ id: 'ca_skot_chaos_break',        name: 'Altars First',            description: 'Defeat Skotizo by breaking all 4 altars before dealing any damage to the boss itself.',                          tier: 'master', category: 'mechanic',    injects: [4, 12, 13] }));
r('skotizo_moryskah', T({ id: 'ca_skot_no_altar_spawn',     name: 'Solo Defender',            description: 'Defeat Skotizo preventing all altar-link lightning chains from striking you.',                                     tier: 'master', category: 'mechanic',    injects: [4, 10, 13] }));

// -- Sarachnis (spiderling-heal prevention) ------------------------------------
r('sarachnis_moryskah', T({ id: 'ca_sara_no_heal',          name: 'No Spider-Heal',          description: 'Defeat Sarachnis without letting a single spiderling reach her for a heal tick.',                                 tier: 'master', category: 'mechanic',    injects: [4, 10, 13] }));

// -- The Veilmother ------------------------------------------------------------
r('the_veilmother',   T({ id: 'ca_veil_solo_speed',         name: 'Solo Lumberspeed',        description: 'Defeat The Veilmother solo in under 2 minutes.',                                                                   tier: 'master', category: 'speed',       injects: [9, 12, 13] }));

// -- Vorath (forge blast read) -------------------------------------------------
r('vorath',           T({ id: 'ca_vorath_no_hit',           name: 'Forge-Clean',             description: 'Defeat Vorath without being hit by any forge-blast tell.',                                                         tier: 'master', category: 'mechanic',    injects: [4, 10, 13] }));

// -- Kraken (tentacle phase) ---------------------------------------------------
r('kraken_saltbrine', T({ id: 'ca_kraken_all_tentacles',    name: 'Eight-Arm Slayer',        description: 'Defeat the Kraken by killing all tentacles before striking the head.',                                            tier: 'master', category: 'mechanic',    injects: [4, 12, 13] }));

// -- Crypt Last King (raid sub) ------------------------------------------------
r('crypt_last_king',  T({ id: 'ca_clk_kill_1',              name: 'Kingkiller',              description: 'Defeat the Crypt Last King.',                                                                                      tier: 'master', category: 'kc',          injects: [1, 13] }));
r('crypt_last_king',  T({ id: 'ca_clk_speed_180',           name: 'Royal Regicide',          description: 'Defeat the Crypt Last King in under 3 minutes.',                                                                   tier: 'master', category: 'speed',       injects: [12] }));

// -- Siege Commander -----------------------------------------------------------
r('siege_commander',  T({ id: 'ca_siege_kill_1',            name: 'Siege Broken',            description: 'Defeat the Siege Commander.',                                                                                      tier: 'master', category: 'kc',          injects: [1] }));
r('siege_commander',  T({ id: 'ca_siege_melee_only',        name: 'Siege Melee-Only',        description: 'Defeat the Siege Commander using only melee attacks.',                                                             tier: 'master', category: 'gear',        injects: [7, 16] }));

// -- Spine Parasite ------------------------------------------------------------
r('spine_parasite',   T({ id: 'ca_spine_kill_1',            name: 'Tether Cut',              description: 'Defeat the Spine Parasite.',                                                                                       tier: 'master', category: 'kc',          injects: [1] }));
r('spine_parasite',   T({ id: 'ca_spine_no_tether',         name: 'Parasite Purge',          description: 'Defeat the Spine Parasite before it completes a single tether link.',                                              tier: 'master', category: 'mechanic',    injects: [4, 12, 13] }));

// -- Blood Archon --------------------------------------------------------------
r('blood_archon',     T({ id: 'ca_blood_kill_1',            name: 'Archon Fallen',           description: 'Defeat the Blood Archon.',                                                                                         tier: 'master', category: 'kc',          injects: [1] }));
r('blood_archon',     T({ id: 'ca_blood_bloodless',         name: 'Bloodless',               description: 'Defeat the Blood Archon while at max HP for the entire fight (no HP drop).',                                       tier: 'master', category: 'perfection',  injects: [4, 10, 13] }));

// -- Crucible Forgemaster ------------------------------------------------------
r('crucible_forgemaster', T({ id: 'ca_crucible_kill_1',     name: 'Forge Fallen',            description: 'Defeat the Crucible Forgemaster.',                                                                                 tier: 'master', category: 'kc',          injects: [1] }));
r('crucible_forgemaster', T({ id: 'ca_crucible_no_fire',    name: 'Cold Forge',              description: 'Defeat the Crucible Forgemaster without taking any fire damage.',                                                   tier: 'master', category: 'restriction', injects: [4, 5, 10] }));

// -- Engine Architect ----------------------------------------------------------
r('engine_architect', T({ id: 'ca_engine_kill_1',           name: 'Architect Dismantled',    description: 'Defeat the Engine Architect.',                                                                                     tier: 'master', category: 'kc',          injects: [1] }));
r('engine_architect', T({ id: 'ca_engine_no_trigger',       name: 'Architectless',           description: 'Defeat the Engine Architect without any gear-gear interaction trigger firing.',                                    tier: 'master', category: 'perfection',  injects: [4, 10, 13] }));

// -- Sunken Sea Priest ---------------------------------------------------------
r('sunken_sea_priest', T({ id: 'ca_sunken_kill_1',          name: 'Priest Drowned',          description: 'Defeat the Sunken Sea Priest.',                                                                                    tier: 'master', category: 'kc',          injects: [1] }));
r('sunken_sea_priest', T({ id: 'ca_sunken_speed_120',       name: 'Drowned Priest',          description: 'Defeat the Sunken Sea Priest in under 2 minutes.',                                                                 tier: 'master', category: 'speed',       injects: [12] }));

// -- Tempest Storm Elemental ---------------------------------------------------
r('tempest_storm_elemental', T({ id: 'ca_tempest_kill_1',   name: 'Storm Grounded',          description: 'Defeat the Tempest Storm Elemental.',                                                                              tier: 'master', category: 'kc',          injects: [1] }));
r('tempest_storm_elemental', T({ id: 'ca_tempest_calm_eye', name: 'Calm Eye',                description: 'Defeat the Tempest Storm Elemental without any storm-phase damage tick landing.',                                   tier: 'master', category: 'restriction', injects: [4, 5, 10] }));

// -- Rift Sovereign ------------------------------------------------------------
r('rift_sovereign',   T({ id: 'ca_rift_kill_1',             name: 'Sovereign Down',          description: 'Defeat the Rift Sovereign.',                                                                                       tier: 'master', category: 'kc',          injects: [1] }));
r('rift_sovereign',   T({ id: 'ca_rift_solo',               name: 'Rift Walker',             description: 'Defeat the Rift Sovereign solo.',                                                                                  tier: 'master', category: 'solo',        injects: [9] }));

// -- Commander Zelot (Heartlands mini-raid) ------------------------------------
r('commander_zelot_heartlands', T({ id: 'ca_zelot_kill_1',  name: 'Zelot Dethroned',         description: 'Defeat Commander Zelot.',                                                                                          tier: 'master', category: 'kc',          injects: [1] }));
r('commander_zelot_heartlands', T({ id: 'ca_zelot_no_zeal', name: 'Zealot Refused',          description: 'Defeat Commander Zelot without letting him complete a single zealot-rally buff.',                                   tier: 'master', category: 'mechanic',    injects: [4, 12, 13] }));

// -- Mimic Clue ----------------------------------------------------------------
r('mimic_clue',       T({ id: 'ca_mimic_kill_1',            name: 'Trap Sprung',             description: 'Defeat the Mimic at master-clue difficulty.',                                                                      tier: 'master', category: 'kc',          injects: [1] }));
r('mimic_clue',       T({ id: 'ca_mimic_solo',              name: 'Solo Mimic',              description: 'Defeat the Mimic solo at master-clue difficulty.',                                                                tier: 'master', category: 'solo',        injects: [9] }));

// ══════════════════════════════════════════════════════════════════════════════
// H5 — Grandmaster tier expansion (+60 CAs) — v0.9 roadmap Wave B2
//
// Source: reports/ca-expansion-plan.md S1 — Grandmaster tier was 27/127 target.
// These 60 tasks are the endgame prestige tier: phase-perfect runs, solo
// clears, deathless raid completions, and speed walls calibrated just short
// of RWC-tier play. Heavily skewed toward perfection and mechanic.
//
// Category distribution for GM additions:
//   perfection: 22   mechanic: 14   speed: 10   restriction: 8
//   solo: 4          kc: 2         gear: 0
// ══════════════════════════════════════════════════════════════════════════════

// -- Nex (5-phase GM perfection + solo) ----------------------------------------
r('nex_wilds_gwd',    T({ id: 'ca_nex_phase_perfect',       name: 'Phase-Perfect Zaros',     description: 'Clear all 5 Nex phases without dying or switching out of the canonical prayer for each phase.',                    tier: 'grandmaster', category: 'perfection',  injects: [4, 10, 13] }));
r('nex_wilds_gwd',    T({ id: 'ca_nex_speed_5m',            name: 'Nex Sub-5',               description: 'Defeat Nex in under 5 minutes solo.',                                                                             tier: 'grandmaster', category: 'speed',       injects: [9, 12, 13] }));
r('nex_wilds_gwd',    T({ id: 'ca_nex_solo',                name: 'Alone Against Zaros',     description: 'Solo Nex from phase 1 to phase 5.',                                                                                tier: 'grandmaster', category: 'solo',        injects: [9, 13] }));

// -- ToS HM set GM tasks -------------------------------------------------------
r('tos_hm_verzik',    T({ id: 'ca_tos_verzik_speed_3m',     name: 'Verzik Speedrun',         description: 'Clear Verzik HM in under 3 minutes from P1 start.',                                                                tier: 'grandmaster', category: 'speed',       injects: [12, 13] }));
r('tos_hm_maiden',    T({ id: 'ca_tos_maiden_nilo_perfect', name: 'Nilocas-Clean Maiden',    description: 'Clear Maiden HM without a single nilocas reaching her.',                                                            tier: 'grandmaster', category: 'mechanic',    injects: [4, 10, 13] }));
r('tos_hm_sotetseg',  T({ id: 'ca_tos_sote_perfect',        name: 'Perfect Shadow',          description: 'Clear Sotetseg HM without any player entering the maze unmarked.',                                                 tier: 'grandmaster', category: 'perfection',  injects: [4, 10, 13] }));
r('tos_hm_bloat',     T({ id: 'ca_tos_bloat_speed_90',      name: 'Speed Bloat',             description: 'Clear Bloat HM in under 90 seconds.',                                                                              tier: 'grandmaster', category: 'speed',       injects: [12, 13] }));

// -- Corrupted Gauntlet GM -----------------------------------------------------
r('gauntlet_hunllef', T({ id: 'ca_cg_no_resources',         name: 'Unprepared Victory',      description: 'Defeat Corrupted Hunllef with no crystal-tier gear crafted (tier-60 only).',                                     tier: 'grandmaster', category: 'restriction', injects: [4, 5, 10, 13] }));
r('gauntlet_hunllef', T({ id: 'ca_cg_deathless_10',         name: 'Corrupted Streak',        description: 'Complete 10 consecutive Corrupted Gauntlet clears without a single death.',                                        tier: 'grandmaster', category: 'perfection',  injects: [4, 10, 11, 13] }));

// -- CoA (Chambers raid) -------------------------------------------------------
r('corporeal_beast', T({ id: 'ca_coa_deathless_solo',       name: 'Chambers Deathless Solo', description: 'Solo Chambers of Aelgard with zero deaths across every room (pseudo-boss: CoA gating via Corp-spec room).', tier: 'grandmaster', category: 'perfection',  injects: [4, 9, 10, 13] }));

// -- Corporeal Beast GM --------------------------------------------------------
r('corporeal_beast',  T({ id: 'ca_corp_solo_speed_4m',      name: 'Sub-4 Solo Corp',         description: 'Solo the Corporeal Beast in under 4 minutes.',                                                                    tier: 'grandmaster', category: 'speed',       injects: [9, 12, 13] }));
r('corporeal_beast',  T({ id: 'ca_corp_darkcore_perfect',   name: 'Unsplit Core',            description: 'Defeat the Corporeal Beast without letting the dark core split even once.',                                         tier: 'grandmaster', category: 'mechanic',    injects: [4, 10, 13] }));

// -- Forgotten-Name (Inkweald endgame) -----------------------------------------
r('the_whisperer_inkweald', T({ id: 'ca_whisper_wide_awake', name: 'Wide-Awake',             description: 'Defeat The Whisperer without entering the dream portal (waking-only damage race).',                               tier: 'grandmaster', category: 'restriction', injects: [4, 5, 10, 13] }));
r('the_whisperer_inkweald', T({ id: 'ca_whisper_perfect',   name: 'Portal-Perfect',          description: 'Defeat The Whisperer catching every dream-portal with 100% uptime inside it.',                                    tier: 'grandmaster', category: 'perfection',  injects: [4, 10, 13] }));

// -- Phantom Muspah GM ---------------------------------------------------------
r('phantom_muspah_inkweald', T({ id: 'ca_muspah_p3_perfect', name: 'Triple-Pray Perfect',    description: 'Defeat the Phantom Muspah phase-3 enrage with 100% correct-form prayer switches.',                                 tier: 'grandmaster', category: 'perfection',  injects: [4, 10, 13] }));

// -- Vardorvis GM --------------------------------------------------------------
r('vardorvis_sootworks', T({ id: 'ca_vard_perfect',         name: 'Vard Untouched',          description: 'Defeat Vardorvis without any heal-pool tick and without any root attack landing.',                                 tier: 'grandmaster', category: 'perfection',  injects: [4, 10, 13] }));

// -- Sol Heredit GM ------------------------------------------------------------
r('sol_heredit_colosseum', T({ id: 'ca_sol_colosseum_gold', name: 'Colosseum Gold',          description: 'Clear the 12-wave Colosseum gauntlet in under 20 minutes, no deaths.',                                            tier: 'grandmaster', category: 'speed',       injects: [9, 12, 13] }));
r('sol_heredit_colosseum', T({ id: 'ca_sol_no_heal',        name: 'No Heal Champion',        description: 'Defeat Sol Heredit without healing (no food / potions / prayer-heal).',                                            tier: 'grandmaster', category: 'restriction', injects: [4, 5, 10, 13] }));

// -- ToA (Tombs) GM ------------------------------------------------------------
r('sanctum_pharaoh',  T({ id: 'ca_toa_expert_flawless',     name: 'Expert Flawless',         description: 'Complete ToA at raid level 500+ with zero deaths (ToA entry encounter = Sanctum Pharaoh).',                          tier: 'grandmaster', category: 'perfection',  injects: [4, 10, 13] }));
r('sanctum_pharaoh',  T({ id: 'ca_toa_solo_500',            name: 'Solo Expert',             description: 'Complete ToA solo at raid level 500+ (entry via Sanctum).',                                                       tier: 'grandmaster', category: 'solo',        injects: [9, 13] }));

// -- Duke Sucellus GM ----------------------------------------------------------
r('duke_sucellus_sootworks', T({ id: 'ca_duke_gasless',     name: 'Gasless Duke',            description: 'Defeat Duke Sucellus without taking a single gas-vent detonation hit.',                                           tier: 'grandmaster', category: 'perfection',  injects: [4, 10, 13] }));
r('duke_sucellus_sootworks', T({ id: 'ca_duke_speed_60',    name: 'Ducal Blitz',             description: 'Defeat Duke Sucellus in under 60 seconds.',                                                                        tier: 'grandmaster', category: 'speed',       injects: [12, 13] }));

// -- Leviathan GM --------------------------------------------------------------
r('the_leviathan_saltbrine', T({ id: 'ca_lev_dry_flawless', name: 'Dry Leviathan Flawless',  description: 'Defeat The Leviathan 10 times without any submerge-sweep damage landing across all kills.',                      tier: 'grandmaster', category: 'perfection',  injects: [4, 10, 11, 13] }));

// -- Worldtree Heart GM --------------------------------------------------------
r('worldtree_heart',  T({ id: 'ca_wtree_speed_120',         name: 'Heartstop Elite',         description: 'Defeat the Worldtree Heart in under 2 minutes.',                                                                   tier: 'grandmaster', category: 'speed',       injects: [12, 13] }));
r('worldtree_heart',  T({ id: 'ca_wtree_no_root',           name: 'Unearthed',               description: 'Defeat the Worldtree Heart without being hit by a single root-eruption tell.',                                      tier: 'grandmaster', category: 'mechanic',    injects: [4, 10, 13] }));

// -- Nightmare (endgame dream) -------------------------------------------------
r('the_nightmare',    T({ id: 'ca_nm_solo_flawless',        name: 'Solo Dream Flawless',     description: 'Solo The Nightmare with no parasite infections and zero damage taken.',                                            tier: 'grandmaster', category: 'perfection',  injects: [4, 9, 10, 13] }));

// -- Vorkath GM ----------------------------------------------------------------
r('vorkath',          T({ id: 'ca_vorkath_speed_75',        name: 'Vorkath Sub-75',          description: 'Defeat Vorkath in under 75 seconds.',                                                                              tier: 'grandmaster', category: 'speed',       injects: [12, 13] }));
r('vorkath',          T({ id: 'ca_vorkath_no_crystal_50',   name: 'Crystal-Clean Fifty',     description: 'Defeat Vorkath 50 times without being hit by any crystal spike in any kill.',                                       tier: 'grandmaster', category: 'perfection',  injects: [4, 10, 11, 13] }));

// -- Zulrah GM -----------------------------------------------------------------
r('zulrah',           T({ id: 'ca_zulrah_solo_2spec',       name: 'Two-Spec Snake',          description: 'Defeat Zulrah using no more than 2 special attacks.',                                                              tier: 'grandmaster', category: 'restriction', injects: [4, 5, 13] }));
r('zulrah',           T({ id: 'ca_zulrah_speed_60',         name: 'Snake Blitz',             description: 'Defeat Zulrah in under 60 seconds.',                                                                               tier: 'grandmaster', category: 'speed',       injects: [12, 13] }));

// -- GWD GM (solo all four in one trip) ----------------------------------------
r('commander_zilyana', T({ id: 'ca_gwd_quad_solo',          name: 'God Wars Solo',           description: 'Solo all four GWD generals in a single trip without dying (Zilyana entry encounter).',                            tier: 'grandmaster', category: 'solo',        injects: [9, 13, 14] }));

// -- Veldrak GM ----------------------------------------------------------------
r('veldrak',          T({ id: 'ca_veldrak_solo_no_food',    name: 'Solo Fasting Dragon',     description: 'Solo Veldrak without eating any food.',                                                                            tier: 'grandmaster', category: 'restriction', injects: [5, 9, 10, 13] }));

// -- Catacomb lich (endgame undead) --------------------------------------------
r('catacomb_lich',    T({ id: 'ca_cata_lich_no_phylactery_solo', name: 'Solo Phylactery-Free', description: 'Solo the Catacomb Lich without letting its phylactery revive it once.',                                           tier: 'grandmaster', category: 'mechanic',    injects: [4, 9, 10, 13] }));

// -- Catacombs full clear ------------------------------------------------------
r('catacomb_necromancer', T({ id: 'ca_cata_full_clear',     name: 'Catacomb Cleaner',        description: 'Clear all 15 Catacomb bosses in a single in-game day (24h wall-clock).',                                          tier: 'grandmaster', category: 'mechanic',    injects: [1, 8, 13, 14] }));
r('catacomb_necromancer', T({ id: 'ca_cata_full_deathless', name: 'Crypt Flawless',          description: 'Clear any 10 of the 15 Catacomb bosses in one trip with zero deaths.',                                             tier: 'grandmaster', category: 'perfection',  injects: [4, 10, 13] }));

// -- Nightmare dream-set full clear --------------------------------------------
r('nightmare_lucid_core', T({ id: 'ca_nmm_dream_full',      name: 'Dream Set Clear',         description: 'Defeat all 7 Nightmare dream-forms in a single dream-shift session.',                                             tier: 'grandmaster', category: 'mechanic',    injects: [1, 8, 13, 14] }));

// -- Multi-boss prestige (cross-boss GM) ---------------------------------------
r('veldrak',          T({ id: 'ca_gm_trifecta',             name: 'Grandmaster Trifecta',    description: 'Hold a top-3 speed kill on CoA + ToS + ToA simultaneously (cross-raid prestige).',                                 tier: 'grandmaster', category: 'mechanic',    injects: [13, 14, 17] }));
r('veldrak',          T({ id: 'ca_gm_deathless_all_raids',  name: 'All Raids Deathless',     description: 'Complete CoA, ToS, and ToA each with zero deaths in a single 7-day streak.',                                       tier: 'grandmaster', category: 'perfection',  injects: [4, 10, 13, 17] }));

// -- Cerberus GM ---------------------------------------------------------------
r('cerberus',         T({ id: 'ca_cerb_all_ghosts_perfect', name: 'Ghost-Flick Perfect',     description: 'Defeat Cerberus with correct prayer flick for every soul-ghost across 25 consecutive kills.',                       tier: 'grandmaster', category: 'mechanic',    injects: [4, 10, 11, 13] }));

// -- Kalphite Queen GM ---------------------------------------------------------
r('kalphite_queen',   T({ id: 'ca_kq_solo_no_damage',       name: 'Solo Queen Unscathed',    description: 'Solo Kalphite Queen without taking damage.',                                                                       tier: 'grandmaster', category: 'perfection',  injects: [4, 9, 10, 13] }));

// -- Inkweald Muse GM ----------------------------------------------------------
r('inkweald_muse',    T({ id: 'ca_muse_no_echo',            name: 'No Echo Ever',            description: 'Defeat the Inkweald Muse 10 times without any phrase repeating across the 10 kills.',                            tier: 'grandmaster', category: 'mechanic',    injects: [4, 10, 11, 13] }));

// -- Hollow Choir GM -----------------------------------------------------------
r('hollow_choir_conductor', T({ id: 'ca_choir_solo_flawless', name: 'Silent Conductor Solo', description: 'Solo the Hollow Choir Conductor without taking damage.',                                                            tier: 'grandmaster', category: 'perfection',  injects: [4, 9, 10, 13] }));

// -- Crystal Wyrm GM -----------------------------------------------------------
r('crystal_wyrm',     T({ id: 'ca_wyrm_no_pillar_gm',       name: 'Pillarless Perfection',   description: 'Defeat the Crystal Wyrm using no pillar cover at any phase.',                                                      tier: 'grandmaster', category: 'restriction', injects: [4, 5, 10, 13] }));

// -- Sarachnis GM --------------------------------------------------------------
r('sarachnis_moryskah', T({ id: 'ca_sara_solo_flawless',    name: 'Matriarch Untouched',     description: 'Defeat Sarachnis solo without taking damage and without any spiderling reaching her.',                             tier: 'grandmaster', category: 'perfection',  injects: [4, 9, 10, 13] }));

// -- The Soot King GM ----------------------------------------------------------
r('the_soot_king',    T({ id: 'ca_soot_solo_no_damage',     name: 'Solo Sovereign Pure',     description: 'Solo the Soot King without taking damage.',                                                                        tier: 'grandmaster', category: 'perfection',  injects: [4, 9, 10, 13] }));

// -- Tempoross GM --------------------------------------------------------------
r('tempoross_saltbrine', T({ id: 'ca_temp_perfect_boat',    name: 'Storm Eye Perfect',       description: 'Defeat Tempoross with boat HP at 100% (no repair needed).',                                                        tier: 'grandmaster', category: 'perfection',  injects: [4, 10, 13] }));

// -- Hespori GM ----------------------------------------------------------------
r('hespori_veilwood',  T({ id: 'ca_hes_no_herb_damage',     name: 'Unbloomed',               description: 'Defeat Hespori without being hit by a single bloom-puff AoE.',                                                     tier: 'grandmaster', category: 'perfection',  injects: [4, 10, 13] }));

// -- Kraken GM -----------------------------------------------------------------
r('kraken_saltbrine', T({ id: 'ca_kraken_no_whirl',         name: 'Whirlpool-Free',          description: 'Defeat the Kraken without being pulled into a whirlpool on any tick.',                                             tier: 'grandmaster', category: 'mechanic',    injects: [4, 10, 13] }));

// -- General Graardor + Kree + Kril GM deathless --------------------------------
r('general_graardor', T({ id: 'ca_graardor_kill_500',       name: 'Bandos Sovereign',        description: 'Defeat General Graardor 500 times.',                                                                               tier: 'grandmaster', category: 'kc',          injects: [1, 11, 13] }));
r('kreearra',         T({ id: 'ca_kree_kill_500',           name: 'Skyborn Sovereign',       description: "Defeat Kree'arra 500 times.",                                                                                     tier: 'grandmaster', category: 'kc',          injects: [1, 11, 13] }));
r('kril_tsutsaroth',  T({ id: 'ca_kril_no_missile',         name: 'Missileless Demon',       description: "Defeat K'ril Tsutsaroth without being hit by any missile-ranged minion attack.",                                    tier: 'grandmaster', category: 'mechanic',    injects: [4, 10, 13] }));

// -- Blood Archon GM -----------------------------------------------------------
r('blood_archon',     T({ id: 'ca_blood_no_drain',          name: 'Unsapped',                description: 'Defeat the Blood Archon without any blood-drain tick landing.',                                                   tier: 'grandmaster', category: 'perfection',  injects: [4, 10, 13] }));

// -- Crypt Last King GM --------------------------------------------------------
r('crypt_last_king',  T({ id: 'ca_clk_no_damage',           name: 'Regicide Untouched',      description: 'Defeat the Crypt Last King without taking damage.',                                                                tier: 'grandmaster', category: 'perfection',  injects: [4, 10, 13] }));

// -- Sunken Sea Priest GM ------------------------------------------------------
r('sunken_sea_priest', T({ id: 'ca_sunken_no_drown',        name: 'Drownless',               description: 'Defeat the Sunken Sea Priest without being submerged by any tide-tick.',                                           tier: 'grandmaster', category: 'mechanic',    injects: [4, 10, 13] }));

// -- Tempest Storm Elemental GM ------------------------------------------------
r('tempest_storm_elemental', T({ id: 'ca_tempest_no_lightning', name: 'Ungrounded',          description: 'Defeat the Tempest Storm Elemental without any lightning-chain tick landing.',                                    tier: 'grandmaster', category: 'perfection',  injects: [4, 10, 13] }));

// ══════════════════════════════════════════════════════════════════════════════
// Boot summary
// ══════════════════════════════════════════════════════════════════════════════

const summary = ca.registry();
console.log(`[aelgard] Combat Achievement tasks loaded: ${summary.totalTasks} tasks across ${summary.totalBosses} bosses`);
for (const tier of ca.TIERS) {
  console.log(`[aelgard]   ${tier}: ${summary.byTier[tier]} tasks`);
}

module.exports = { summary };
