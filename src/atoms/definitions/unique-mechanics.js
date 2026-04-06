// ══════════════════════════════════════════════════════════════════════════════
// UNIQUE MECHANICS — Things that introduce NEW atoms or behaviors
// Not data entries. Not stat blocks. Actual unique game mechanics.
// ══════════════════════════════════════════════════════════════════════════════

const { define } = require('../mechanic');

// ── BOSS UNIQUE MECHANICS (things no other boss does) ───────────────────────

define({ id: 'mech-zulrah-rotation', name: 'Boss Phase Rotation', type: 'mechanic',
  atoms: { phaseTransition: { phases: ['green_mage','blue_range','red_melee','jad'] } },
  config: { desc: 'Boss cycles through predetermined phase rotations. Player must memorize sequence. Each phase has different attack style and safe tiles.' }
});

define({ id: 'mech-vorkath-acid', name: 'Acid Pool Walk', type: 'mechanic',
  atoms: { timer: { duration: 30 }, periodicAction: { interval: 1 } },
  config: { desc: 'Boss covers arena in acid pools. Player must walk in straight lines to avoid damage. Stopping = death.' }
});

define({ id: 'mech-vorkath-zombified', name: 'Zombified Spawn', type: 'mechanic',
  atoms: { waveSpawn: { waves: [[{ type: 'zombie', x: 0, y: 0 }]] }, timer: { duration: 15 } },
  config: { desc: 'Boss spawns an add that walks toward player. Must kill before it reaches you or instant KO. Crumble Undead one-shots it.' }
});

define({ id: 'mech-demonic-gorilla-switch', name: 'Style Switching NPC', type: 'mechanic',
  atoms: { hitCheck: { maxHit: 30, style: 'melee' }, phaseTransition: { phases: ['melee','range','magic'] } },
  config: { desc: 'NPC switches attack style after 3 missed attacks (blocked by prayer). Player must watch and switch prayers reactively.' }
});

define({ id: 'mech-olm-hands', name: 'Multi-Target Boss', type: 'mechanic',
  atoms: { phaseTransition: { phases: ['left_hand','right_hand','head'] } },
  config: { desc: 'Boss has multiple attackable parts. Must kill hands before head. Each part has different attack and mechanic.' }
});

define({ id: 'mech-verzik-nylocas', name: 'Color-Matching Adds', type: 'mechanic',
  atoms: { waveSpawn: { waves: [] }, timer: { duration: 60 } },
  config: { desc: 'Waves of adds spawn in 3 colors (melee/range/mage). Must attack with matching style or they explode for damage.' }
});

define({ id: 'mech-maiden-blood', name: 'Blood Spawn Trail', type: 'mechanic',
  atoms: { periodicAction: { interval: 4 } },
  config: { desc: 'Boss throws blood projectiles that leave trails. Standing in blood heals boss. Must freeze blood spawns.' }
});

define({ id: 'mech-toa-invocation', name: 'Difficulty Scaling', type: 'mechanic',
  atoms: {},
  config: { desc: 'Players choose difficulty modifiers (invocations) before entering. Each one makes the raid harder but increases loot chance. Granular difficulty control.' }
});

define({ id: 'mech-corp-dark-core', name: 'Healing Add Chase', type: 'mechanic',
  atoms: { tickCycle: { interval: 3 } },
  config: { desc: 'Add spawns and chases random player. Standing near it drains prayer and heals boss. Must move away or stomp it.' }
});

define({ id: 'mech-cerberus-ghosts', name: 'Triple Prayer Switch', type: 'mechanic',
  atoms: { timer: { duration: 6 } },
  config: { desc: 'Three ghosts spawn simultaneously attacking with mage/range/melee. Must switch prayers in correct order as each attack lands.' }
});

define({ id: 'mech-hydra-poison', name: 'Poison Pool Phases', type: 'mechanic',
  atoms: { phaseTransition: { phases: ['green','blue','red','grey'] }, timer: { duration: 3 } },
  config: { desc: 'Boss changes attack style at HP thresholds. Poison pools appear that force movement. Must lure boss over correct colored vent to weaken.' }
});

define({ id: 'mech-nightmare-totems', name: 'Totem Charging', type: 'mechanic',
  atoms: { timer: { duration: 20 } },
  config: { desc: 'Boss becomes immune. Must charge totems around arena to break shield. Players split up to charge different totems.' }
});

define({ id: 'mech-gauntlet-gathering', name: 'Timed Resource Gathering', type: 'mechanic',
  atoms: { round: { activeTicks: 600 }, periodicAction: { interval: 3 } },
  config: { desc: 'Time-limited prep phase. Gather resources, craft equipment, cook food before boss fight. Better prep = easier boss.' }
});

define({ id: 'mech-inferno-prayer-flick', name: 'Multi-NPC Prayer Switching', type: 'mechanic',
  atoms: { protectionCheck: {} },
  config: { desc: 'Multiple NPCs attack with different styles simultaneously. Must switch prayers between attacks based on projectile timing.' }
});

define({ id: 'mech-jad-healer', name: 'Healer Aggro Management', type: 'mechanic',
  atoms: { waveSpawn: { waves: [] } },
  config: { desc: 'Healers spawn and heal boss. Must tag each healer to aggro them onto you while maintaining prayer switches on boss.' }
});

// ── SKILLING UNIQUE MECHANICS ───────────────────────────────────────────────

define({ id: 'mech-tick-manipulation', name: 'Tick Manipulation', type: 'mechanic',
  atoms: { cooldown: { duration: 3 } },
  config: { desc: 'Use a 3-tick action (herb+tar, knife+log, pestle+herb) to reset skilling timer. Reduces gather time from 4-5 ticks to 3 ticks. Advanced technique.' }
});

define({ id: 'mech-3t-fishing', name: '3-Tick Fishing', type: 'mechanic',
  atoms: { periodicAction: { interval: 3 }, cooldown: { duration: 3 } },
  config: { desc: 'Tick manipulate while fishing to catch fish every 3 ticks instead of 5. Requires constant input.' }
});

define({ id: 'mech-2t-woodcutting', name: '2-Tick Woodcutting', type: 'mechanic',
  atoms: { periodicAction: { interval: 2 } },
  config: { desc: 'Use rapid actions near a tree to force 2-tick chop cycles. Highest APM skilling method.' }
});

define({ id: 'mech-1t-karambwan', name: '1-Tick Karambwan Cooking', type: 'mechanic',
  atoms: { periodicAction: { interval: 1 } },
  config: { desc: 'Cook karambwan by clicking raw then cooked rapidly. Processes one per tick. Fastest cooking method.' }
});

define({ id: 'mech-combo-eat', name: 'Combo Eating', type: 'mechanic',
  atoms: { consume: { healHp: 50 } },
  config: { desc: 'Eat food + potion + karambwan in same tick by clicking in correct order. Heals 50+ HP in one tick. Critical for PvP survival.' }
});

define({ id: 'mech-prayer-flicking', name: 'Prayer Flicking', type: 'mechanic',
  atoms: { instant: true, tickCycle: { interval: 1 } },
  config: { desc: 'Toggle prayer on for 1 tick when attack lands, off otherwise. Get prayer bonus with zero drain. Requires tick-perfect timing.' }
});

define({ id: 'mech-lazy-flick', name: 'Lazy Prayer Flicking', type: 'mechanic',
  atoms: { instant: true },
  config: { desc: 'Turn prayer off and on every tick. Maintains all active prayers with minimal drain. Easier than 1-tick flicking.' }
});

// ── PVP UNIQUE MECHANICS ────────────────────────────────────────────────────

define({ id: 'mech-pid-cycle', name: 'PID System', type: 'mechanic',
  atoms: {},
  config: { desc: 'Player ID determines attack priority. PID rotates periodically. Having PID means your attack resolves first — critical in 1-tick KO scenarios.' }
});

define({ id: 'mech-skull-trick', name: 'Skull Mechanics', type: 'mechanic',
  atoms: { timer: { duration: 2000 } },
  config: { desc: 'Attacking another player first gives you a skull. Dying with skull = lose all items. Skull disappears after 20 minutes.' }
});

define({ id: 'mech-spec-tab', name: 'Spec-Tab', type: 'mechanic',
  atoms: { cooldown: { duration: 1 } },
  config: { desc: 'Use special attack then immediately teleport. Opponent takes spec damage but cant retaliate. Hit and run PvP tactic.' }
});

define({ id: 'mech-gmaul-stack', name: 'G-Maul Stack', type: 'mechanic',
  atoms: { cooldown: { duration: 1 } },
  config: { desc: 'Weapon spec into granite maul spec on same tick. Two spec hits land simultaneously for massive burst. Core PvP KO method.' }
});

define({ id: 'mech-freeze-barrage', name: 'Freeze-Barrage PvP', type: 'mechanic',
  atoms: { hitCheck: { maxHit: 30, style: 'magic' }, timer: { duration: 33 } },
  config: { desc: 'Freeze opponent with ice barrage (20s freeze). Switch to ranged/melee for free damage while they cant move. Mage-to-range switching.' }
});

define({ id: 'mech-overhead-pid', name: 'Overhead Camping', type: 'mechanic',
  atoms: { protectionCheck: {} },
  config: { desc: 'Keep protection prayer matching opponent weapon. They must switch weapons to deal damage. Mind game of switches and fake-outs.' }
});

// ── MINIGAME UNIQUE MECHANICS ───────────────────────────────────────────────

define({ id: 'mech-ba-roles', name: 'Role-Based Teamwork', type: 'mechanic',
  atoms: { round: { activeTicks: 500 } },
  config: { desc: '5 players each take a role (attacker, defender, collector, healer, eggs). Each role has different actions. Must coordinate. BA/raids pattern.' }
});

define({ id: 'mech-pest-control-portals', name: 'Portal Defense', type: 'mechanic',
  atoms: { round: { activeTicks: 333 }, waveSpawn: { waves: [] } },
  config: { desc: 'Protect Void Knight while destroying portals. Portals spawn enemies. Knight HP is shared failure condition. Balancing offense and defense.' }
});

define({ id: 'mech-cw-flag', name: 'Capture the Flag', type: 'mechanic',
  atoms: { round: { activeTicks: 1200 } },
  config: { desc: 'Two teams, each with a flag. Capture opponent flag and bring to your base while defending your own. Castle Wars model.' }
});

define({ id: 'mech-lms-shrink', name: 'Shrinking Arena', type: 'mechanic',
  atoms: { timer: { duration: 100, repeat: true } },
  config: { desc: 'Safe zone shrinks over time forcing encounters. Players outside zone take damage. Battle royale pattern.' }
});

define({ id: 'mech-gotr-guardian', name: 'Guardian Energy', type: 'mechanic',
  atoms: { round: { countdownTicks: 17, activeTicks: 400 } },
  config: { desc: 'Team feeds guardian energy by crafting runes. Guardian HP is shared progress bar. Abyssal creatures drain guardian. Balance gathering vs defending.' }
});

define({ id: 'mech-wintertodt-brazier', name: 'Brazier Maintenance', type: 'mechanic',
  atoms: { periodicAction: { interval: 3 }, timer: { duration: 500 } },
  config: { desc: 'Keep braziers lit by adding logs. Braziers go out from boss attacks. Boss HP is shared progress. Higher firemaking = less damage taken.' }
});

define({ id: 'mech-tempoross-fishing', name: 'Storm Fishing', type: 'mechanic',
  atoms: { periodicAction: { interval: 5 }, round: { activeTicks: 400 } },
  config: { desc: 'Fish during a storm. Cook fish, fire cannons at boss. Dodge waves and fire. Boss energy depletes from cannon hits.' }
});

// ── WORLD UNIQUE MECHANICS ──────────────────────────────────────────────────

define({ id: 'mech-farming-disease', name: 'Crop Disease', type: 'mechanic',
  atoms: { tickCycle: { interval: 500 } },
  config: { desc: 'Crops can get diseased during growth. Diseased crops die next cycle if not treated. Compost reduces disease chance. Flowers protect adjacent patches.' }
});

define({ id: 'mech-construction-hotspot', name: 'Building Hotspot', type: 'mechanic',
  atoms: { dialogue: { npcName: 'Build', tree: {} } },
  config: { desc: 'Furniture hotspots in POH rooms. Click to see buildable items. Each requires materials + level. Built furniture provides functionality.' }
});

define({ id: 'mech-ge-offer-matching', name: 'GE Offer Matching', type: 'mechanic',
  atoms: { tickCycle: { interval: 1 } },
  config: { desc: 'Buy/sell offers sit in queue. System matches highest buy with lowest sell each tick. Partial fills allowed. Price negotiation through the spread.' }
});

define({ id: 'mech-death-pile', name: 'Death Item Mechanics', type: 'mechanic',
  atoms: { timer: { duration: 1500 } },
  config: { desc: 'On death, keep 3 most valuable items (4 with Protect Item). Rest goes to gravestone with 15-min timer. Can reclaim from Deaths Office for fee.' }
});

define({ id: 'mech-diary-perk', name: 'Diary Area Perks', type: 'mechanic',
  atoms: { achievementTrigger: true },
  config: { desc: 'Completing diary tier unlocks permanent perks in that region. E.g. Ardougne cloak gives free tele, Karamja gloves give extra gem chance. Tier-gated rewards.' }
});

define({ id: 'mech-favor-system', name: 'Kourend Favor', type: 'mechanic',
  atoms: { tickCycle: { interval: 1 } },
  config: { desc: 'Earn percentage-based favor with 5 Kourend houses by doing their tasks. 100% unlocks special content. Favor locked after architectural alliance.' }
});

console.log('[defs] Unique Mechanics: loaded');
