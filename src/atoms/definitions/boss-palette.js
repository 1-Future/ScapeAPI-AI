// ══════════════════════════════════════════════════════════════════════════════
// BOSS PALETTE — Flat list of every mechanic a boss can have.
// No nesting. No categories. Just blocks you pick from.
// ══════════════════════════════════════════════════════════════════════════════

const { define } = require('../mechanic');

const PALETTE = [
  // ── Projectiles ─────────────────────────────────────────────────────────────
  { id: 'bp-proj-melee',         name: 'Melee Hit',              desc: 'Standard melee attack at adjacent range' },
  { id: 'bp-proj-ranged',       name: 'Ranged Projectile',      desc: 'Ranged attack with travel time' },
  { id: 'bp-proj-magic',        name: 'Magic Projectile',       desc: 'Magic attack with travel time' },
  { id: 'bp-proj-typeless',     name: 'Typeless Damage',        desc: 'Damage that ignores prayer and defence' },
  { id: 'bp-proj-dragonfire',   name: 'Dragonfire Breath',      desc: 'Fire breath reduced by antifire/shield' },
  { id: 'bp-proj-bounce',       name: 'Bounce Projectile',      desc: 'Projectile bounces between players' },
  { id: 'bp-proj-homing',       name: 'Homing Projectile',      desc: 'Slow projectile that follows the player' },
  { id: 'bp-proj-spread',       name: 'Spreading Damage',       desc: 'Damage/debuff spreads between adjacent players' },
  { id: 'bp-proj-multi',        name: 'Multi-Hit Attack',       desc: 'Multiple rapid hits in one attack cycle' },
  { id: 'bp-proj-unavoidable',  name: 'Unavoidable Attack',     desc: 'Attack that cannot be dodged, only tanked' },
  { id: 'bp-proj-telegraphed',  name: 'Telegraphed Attack',     desc: 'Warning animation/sound before attack lands' },
  { id: 'bp-proj-chain',        name: 'Chain Lightning',        desc: 'Projectile chains between nearby players' },

  // ── Ground ──────────────────────────────────────────────────────────────────
  { id: 'bp-gnd-aoe-circle',    name: 'AoE Circle',             desc: 'Damage in a circular area around a point' },
  { id: 'bp-gnd-aoe-line',      name: 'AoE Line',               desc: 'Damage in a straight line across the arena' },
  { id: 'bp-gnd-aoe-cone',      name: 'AoE Cone',               desc: 'Damage in a cone shape from the boss' },
  { id: 'bp-gnd-aoe-cross',     name: 'AoE Cross',              desc: 'Damage in a plus/cross pattern' },
  { id: 'bp-gnd-aoe-square',    name: 'AoE Square',             desc: 'Damage covering a square area' },
  { id: 'bp-gnd-aoe-ring',      name: 'AoE Ring',               desc: 'Expanding ring of damage outward from a point' },
  { id: 'bp-gnd-aoe-wave',      name: 'AoE Wave',               desc: 'Damage wave traveling across arena in one direction' },
  { id: 'bp-gnd-aoe-grid',      name: 'AoE Grid',               desc: 'Arena splits into quadrants, only some are safe' },
  { id: 'bp-gnd-aoe-spiral',    name: 'AoE Spiral',             desc: 'Rotating damage pattern spiraling outward' },
  { id: 'bp-gnd-pool',          name: 'Persistent Pool',        desc: 'Damaging pool left on ground that persists' },
  { id: 'bp-gnd-trail',         name: 'Ground Trail',           desc: 'Player movement leaves damaging trail behind them' },
  { id: 'bp-gnd-spike',         name: 'Ground Spike',           desc: 'Spikes erupt from ground at marked positions' },
  { id: 'bp-gnd-shadow',        name: 'Shadow Marker',          desc: 'Shadow appears under player, must move before detonation' },
  { id: 'bp-gnd-crack',         name: 'Ground Crack',           desc: 'Cracks appear on ground before eruption' },
  { id: 'bp-gnd-portal',        name: 'Damage Portal',          desc: 'Portals spawn on ground dealing damage to anyone on them' },
  { id: 'bp-gnd-charge',        name: 'Boss Charge',            desc: 'Boss dashes in a line across arena dealing damage in path' },
  { id: 'bp-gnd-pull',          name: 'Pull/Drag',              desc: 'Boss pulls player toward it' },
  { id: 'bp-gnd-push',          name: 'Knockback/Push',         desc: 'Attack pushes player away from impact' },
  { id: 'bp-gnd-stomp',         name: 'Ground Stomp',           desc: 'Boss stomps causing arena-wide or nearby AoE damage' },
  { id: 'bp-gnd-cleave',        name: 'Cleave',                 desc: 'Melee swipe covering area in front of boss' },

  // ── Arena ───────────────────────────────────────────────────────────────────
  { id: 'bp-arena-pillars-collapse', name: 'Pillars Collapse',  desc: 'Pillars in arena are destroyed, removing cover' },
  { id: 'bp-arena-shrink',      name: 'Arena Shrinks',          desc: 'Safe fighting area gets smaller over time' },
  { id: 'bp-arena-lava-zones',  name: 'Lava/Acid Zones',        desc: 'Damaging floor tiles appear' },
  { id: 'bp-arena-safe-shift',  name: 'Safe Spots Shift',       desc: 'Safe tiles change position' },
  { id: 'bp-arena-darkness',    name: 'Darkness',               desc: 'Visibility reduced, must use light source' },
  { id: 'bp-arena-falling-rocks',name:'Falling Rocks',          desc: 'Rocks fall from ceiling on marked tiles' },
  { id: 'bp-arena-rising-water',name: 'Rising Water',           desc: 'Water level rises, must move to higher ground' },
  { id: 'bp-arena-wind-push',   name: 'Wind Push',              desc: 'Players pushed in a direction each tick' },
  { id: 'bp-arena-rotating-beam',name:'Rotating Beam',          desc: 'Beam rotates around boss, must dodge' },
  { id: 'bp-arena-wall-of-fire',name: 'Wall of Fire',           desc: 'Moving wall that players must avoid' },
  { id: 'bp-arena-portal-teleport',name:'Portal Teleport',      desc: 'Portals appear that teleport players around arena' },
  { id: 'bp-arena-creeping',    name: 'Creeping Walls',         desc: 'Hazard walls close in from sides temporarily' },
  { id: 'bp-arena-ceiling',     name: 'Ceiling Collapse',       desc: 'Debris falls from above on marked tiles with shadow telegraph' },
  { id: 'bp-arena-beam',        name: 'Stationary Beam',        desc: 'Persistent beam connecting two points, damages on contact' },
  { id: 'bp-arena-tornado',     name: 'Chasing Tornado',        desc: 'Entity that follows a specific player dealing damage on contact' },

  // ── Spawns ──────────────────────────────────────────────────────────────────
  { id: 'bp-spawn-healers',     name: 'Spawn Healers',          desc: 'Adds that heal the boss over time' },
  { id: 'bp-spawn-exploders',   name: 'Spawn Exploders',        desc: 'Adds that explode for damage if not killed' },
  { id: 'bp-spawn-shields',     name: 'Spawn Shields',          desc: 'Adds that make boss immune until killed' },
  { id: 'bp-spawn-attackers',   name: 'Spawn Attackers',        desc: 'Adds that attack players directly' },
  { id: 'bp-spawn-on-timer',    name: 'Spawn on Timer',         desc: 'Adds appear at fixed intervals' },
  { id: 'bp-spawn-on-hp',       name: 'Spawn on HP Threshold',  desc: 'Adds appear when boss reaches HP percentage' },
  { id: 'bp-spawn-on-death',    name: 'Spawn on Death',         desc: 'Adds appear when boss or other add dies' },
  { id: 'bp-spawn-color-matched',name:'Spawn Color-Matched',    desc: 'Adds require matching attack style to kill' },
  { id: 'bp-spawn-miniboss',    name: 'Spawn Mini-Boss',        desc: 'A powerful add with its own mechanics' },

  // ── Boss Powers ─────────────────────────────────────────────────────────────
  { id: 'bp-boss-heal-attack',  name: 'Heal from Attack',       desc: 'Boss heals HP when attack lands on player' },
  { id: 'bp-boss-heal-adds',    name: 'Heal from Adds',         desc: 'Boss heals HP from nearby healer adds' },
  { id: 'bp-boss-heal-ground',  name: 'Heal from Ground Hit',   desc: 'Boss heals when ground attack hits a player' },
  { id: 'bp-boss-enrage',       name: 'Enrage',                 desc: 'Boss stats increase over time or at threshold' },
  { id: 'bp-boss-shield',       name: 'Shield/Immune',          desc: 'Boss becomes immune until shield is broken' },
  { id: 'bp-boss-reflect',      name: 'Reflect Damage',         desc: 'Portion of damage dealt to boss is reflected back' },
  { id: 'bp-boss-damage-cap',   name: 'Damage Cap',             desc: 'Maximum damage per hit is limited' },
  { id: 'bp-boss-heal-wrong',   name: 'Heal on Wrong Style',    desc: 'Boss heals if attacked with wrong combat style' },
  { id: 'bp-boss-power-up',     name: 'Power Up',               desc: 'Boss charges a powerful attack over several ticks' },
  { id: 'bp-boss-resurrect',    name: 'Resurrect Add',          desc: 'Boss brings dead add back to life' },
  { id: 'bp-boss-absorb',       name: 'Absorb Add',             desc: 'Boss absorbs nearby add to heal or power up' },
  { id: 'bp-boss-speed',        name: 'Attack Speed Increase',  desc: 'Boss attacks faster at low HP or in enrage' },
  { id: 'bp-boss-heal-reverse', name: 'Heal Reversal',          desc: 'Damage dealt to boss heals it instead during window' },
  { id: 'bp-boss-prayer-shuffle',name:'Prayer Shuffle',         desc: 'Protection prayers swap their effects' },

  // ── Debuffs ─────────────────────────────────────────────────────────────────
  { id: 'bp-debuff-poison',     name: 'Apply Poison',           desc: 'Poison target for damage over time' },
  { id: 'bp-debuff-venom',      name: 'Apply Venom',            desc: 'Venom target for increasing damage over time' },
  { id: 'bp-debuff-prayer-drain',name:'Prayer Drain',           desc: 'Drain target prayer points' },
  { id: 'bp-debuff-stat-drain', name: 'Stat Drain',             desc: 'Reduce target combat stats' },
  { id: 'bp-debuff-bind',       name: 'Bind/Freeze',            desc: 'Immobilize target for N ticks' },
  { id: 'bp-debuff-stun',       name: 'Stun',                   desc: 'Prevent target from acting for N ticks' },
  { id: 'bp-debuff-disable-prayer',name:'Disable Prayers',      desc: 'Turn off all active prayers' },
  { id: 'bp-debuff-disable-equip',name:'Disable Equipment',     desc: 'Unequip items or prevent equipping' },
  { id: 'bp-debuff-run-drain',  name: 'Run Energy Drain',       desc: 'Drain target run energy' },
  { id: 'bp-debuff-bleed',      name: 'Bleed',                  desc: 'Damage over time that increases with movement' },
  { id: 'bp-debuff-skull',      name: 'Apply Skull',            desc: 'Skull target (lose items on death)' },
  { id: 'bp-debuff-teleblock',  name: 'Teleblock',              desc: 'Prevent target from teleporting' },
  { id: 'bp-debuff-darkness',   name: 'Vision Reduction',       desc: 'Screen darkens based on proximity to boss' },

  // ── Checks ──────────────────────────────────────────────────────────────────
  { id: 'bp-check-move-off',    name: 'Move Off Tile',          desc: 'Move away from marked tile to avoid damage' },
  { id: 'bp-check-keep-moving', name: 'Keep Moving',            desc: 'Must not stop moving or take damage' },
  { id: 'bp-check-run-edge',    name: 'Run to Edge',            desc: 'Must run to arena edge to avoid mechanic' },
  { id: 'bp-check-stand-tile',  name: 'Stand on Tile',          desc: 'Must stand on specific tile during attack' },
  { id: 'bp-check-distance',    name: 'Distance Check',         desc: 'Must be X tiles away from source to reduce damage' },
  { id: 'bp-check-hide-pillar', name: 'Hide Behind Pillar',     desc: 'Use arena obstacle as cover' },
  { id: 'bp-check-hide-spawn',  name: 'Hide Behind Spawn',      desc: 'Use boss-spawned object as cover' },
  { id: 'bp-check-moving-shield',name:'Use Moving Shield',      desc: 'Stay behind moving protective object' },
  { id: 'bp-check-break-los',   name: 'Break Line of Sight',    desc: 'Must break LoS with boss to avoid attack' },
  { id: 'bp-check-safespot',    name: 'Safe Spot',              desc: 'Specific tiles where attack cannot reach' },
  { id: 'bp-check-prayer',      name: 'Prayer Switch',          desc: 'Correct prayer negates or reduces damage' },
  { id: 'bp-check-combat-style',name: 'Use Combat Style',       desc: 'Must attack with correct style' },
  { id: 'bp-check-destroy-prison',name:'Destroy Prison',        desc: 'Break out of trap before damage hits' },
  { id: 'bp-check-dps',         name: 'DPS Check',              desc: 'Must deal X damage in Y ticks or wipe' },
  { id: 'bp-check-kill-before', name: 'Kill Before Reaching',   desc: 'Must kill add before it reaches a location' },
  { id: 'bp-check-use-item',    name: 'Use Specific Item',      desc: 'Must use an item during the fight' },
  { id: 'bp-check-use-skill',   name: 'Use Specific Skill',     desc: 'Must use a non-combat skill during fight' },
  { id: 'bp-check-charge-totem',name: 'Charge Totem/Pillar',    desc: 'Must charge objects around the arena' },
  { id: 'bp-check-collect',     name: 'Collect and Deliver',    desc: 'Gather items and deliver to a location' },
  { id: 'bp-check-solve-puzzle',name: 'Solve Puzzle',           desc: 'Must solve a puzzle during the fight' },
  { id: 'bp-check-protect-npc', name: 'Protect NPC/Object',     desc: 'Keep an NPC or object alive' },
  { id: 'bp-check-emote',       name: 'Use Emote',              desc: 'Must perform specific emote during mechanic' },

  // ── Team ────────────────────────────────────────────────────────────────────
  { id: 'bp-team-stack',        name: 'Stack',                  desc: 'All players must stand on same tile' },
  { id: 'bp-team-spread',       name: 'Spread',                 desc: 'All players must be apart from each other' },
  { id: 'bp-team-pass-object',  name: 'Pass Object',            desc: 'Players pass an item between each other' },
  { id: 'bp-team-role-assign',  name: 'Role Assignment',        desc: 'Players assigned different roles with different tasks' },
  { id: 'bp-team-everyone-hit', name: 'Everyone Must Be Hit',   desc: 'Attack must hit all players or it fails' },
  { id: 'bp-team-one-person',   name: 'One Person Mechanic',    desc: 'One player must handle mechanic alone' },
  { id: 'bp-team-split',        name: 'Team Split',             desc: 'Team splits into groups for different tasks' },
  { id: 'bp-team-calling',      name: 'Calling',                desc: 'One player calls out information for others' },
  { id: 'bp-team-soak',         name: 'Soak Damage',            desc: 'Players share/split incoming damage by stacking' },

  // ── Loot ────────────────────────────────────────────────────────────────────
  { id: 'bp-loot-on-kill',      name: 'Loot on Kill',           desc: 'Standard drop table rolled on boss death' },
  { id: 'bp-loot-mvp-bonus',    name: 'MVP Bonus',              desc: 'Top damage dealer gets extra loot chance' },
  { id: 'bp-loot-contribution', name: 'Contribution-Based Loot',desc: 'Loot quality scales with damage contribution' },
  { id: 'bp-loot-threshold',    name: 'Threshold Loot',         desc: 'Guaranteed drop after X kill count' },
  { id: 'bp-loot-shared-chest', name: 'Shared Chest',           desc: 'All players loot from one chest at the end' },
  { id: 'bp-loot-points-shop',  name: 'Points Shop',            desc: 'Earn points to spend at reward shop' },
  { id: 'bp-loot-roll-modifier',name: 'Loot Roll Modifier',     desc: 'Difficulty or performance affects loot chance' },
];

for (const p of PALETTE) {
  define({
    id: p.id,
    name: p.name,
    type: 'boss_block',
    atoms: {},
    config: { desc: p.desc, palette: 'boss' }
  });
}

console.log(`[defs] Boss Palette: ${PALETTE.length} blocks`);
