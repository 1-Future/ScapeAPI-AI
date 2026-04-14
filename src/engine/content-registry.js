// ══════════════════════════════════════════════════════════════════════════════
// Content Registry — the game's content schema and RL abstraction layer
//
// Two registries:
//   TAB_REGISTRY — mirrors the builder's 75 tabs. Auto-generates /api/content.
//   PLAYABLE     — bosses/instances that can be started and played via /api/rl.
//
// This file replaces all per-boss training bridges with one generic system.
// ══════════════════════════════════════════════════════════════════════════════

const player = require('../player/player');
const items = require('../data/items');
const npcs = require('../world/npcs');
const tick = require('./tick');
const commands = require('./commands');
const instances = require('./instances');
const projectiles = require('../combat/projectiles');
const gameLoop = require('../game-loop');

// ══════════════════════════════════════════════════════════════════════════════
// TAB REGISTRY — all 75 builder tabs
// Source of truth for /api/content. Mirrors public/builder.html REGISTRY.
// ══════════════════════════════════════════════════════════════════════════════

const TAB_REGISTRY = {
  build: {
    'Combat & Encounters': [
      { id: 'bosses', label: 'Bosses', dropzone: 'phases' },
      { id: 'monsters', label: 'Monsters', dropzone: 'form' },
      { id: 'pvp-zones', label: 'PvP Zones', dropzone: 'form' },
    ],
    'Items & Economy': [
      { id: 'items', label: 'Items', dropzone: 'form' },
      { id: 'equipment', label: 'Equipment', dropzone: 'form' },
      { id: 'shops', label: 'Shops', dropzone: 'list' },
      { id: 'crafting', label: 'Crafting', dropzone: 'form' },
    ],
    'Skills & Progression': [
      { id: 'skills', label: 'Skills', dropzone: 'methods' },
      { id: 'achievements', label: 'Achievements', dropzone: 'form' },
      { id: 'collection-log', label: 'Collection Log', dropzone: 'list' },
    ],
    'Quests & Content': [
      { id: 'quests', label: 'Quests', dropzone: 'steps' },
      { id: 'treasure-trails', label: 'Treasure Trails', dropzone: 'steps' },
      { id: 'minigames', label: 'Minigames', dropzone: 'form' },
      { id: 'puzzles', label: 'Puzzles', dropzone: 'form' },
      { id: 'dailies', label: 'Dailies', dropzone: 'form' },
      { id: 'random-events', label: 'Random Events', dropzone: 'form' },
      { id: 'world-events', label: 'World Events', dropzone: 'phases' },
      { id: 'games-of-chance', label: 'Games of Chance', dropzone: 'form' },
    ],
    'World & Environment': [
      { id: 'terrain', label: 'Terrain', dropzone: 'grid' },
      { id: 'locations', label: 'Locations', dropzone: 'form' },
      { id: 'buildings', label: 'Buildings', dropzone: 'form' },
      { id: 'settlements', label: 'Settlements', dropzone: 'form' },
      { id: 'transportation', label: 'Transportation', dropzone: 'form' },
    ],
    'NPCs & Social': [
      { id: 'npcs', label: 'NPCs', dropzone: 'form' },
      { id: 'pets', label: 'Pets', dropzone: 'form' },
      { id: 'housing', label: 'Housing', dropzone: 'form' },
      { id: 'emotes', label: 'Emotes', dropzone: 'form' },
      { id: 'modes', label: 'Modes', dropzone: 'form' },
    ],
    'Systems & Logic': [
      { id: 'relationships', label: 'Relationships', dropzone: 'graph' },
      { id: 'event-triggers', label: 'Event Triggers', dropzone: 'list' },
      { id: 'world-states', label: 'World States', dropzone: 'list' },
    ],
  },
  write: {
    'Lore & World': [
      { id: 'lore-bible', label: 'Lore Bible', dropzone: 'text' },
      { id: 'faction-profiles', label: 'Faction Profiles', dropzone: 'text' },
      { id: 'location-flavor', label: 'Location Flavor', dropzone: 'text' },
      { id: 'books-texts', label: 'Books & Texts', dropzone: 'text' },
    ],
    'Characters & Dialogue': [
      { id: 'npc-personas', label: 'NPC Personas', dropzone: 'text' },
      { id: 'dialogue-trees', label: 'Dialogue Trees', dropzone: 'tree' },
      { id: 'examine-text', label: 'Examine Text', dropzone: 'list' },
      { id: 'quest-writing', label: 'Quest Writing', dropzone: 'text' },
    ],
    'Player Experience': [
      { id: 'char-creator', label: 'Character Creator', dropzone: 'text' },
      { id: 'tutorial', label: 'Tutorial', dropzone: 'steps' },
      { id: 'content-rating', label: 'Content Rating', dropzone: 'form' },
      { id: 'music-audio', label: 'Music & Audio', dropzone: 'list' },
    ],
  },
  configure: {
    'Engine & Core': [
      { id: 'cfg-engine', label: 'Engine' }, { id: 'cfg-tick', label: 'Tick System' },
      { id: 'cfg-camera', label: 'Camera' }, { id: 'cfg-animation', label: 'Animation' },
      { id: 'cfg-persistence', label: 'Persistence' }, { id: 'cfg-assets', label: 'Assets' },
      { id: 'cfg-ai', label: 'AI' },
    ],
    'Gameplay': [
      { id: 'cfg-combat', label: 'Combat' }, { id: 'cfg-death', label: 'Death' },
      { id: 'cfg-economy', label: 'Economy' }, { id: 'cfg-progression', label: 'Progression' },
      { id: 'cfg-inventory', label: 'Inventory' }, { id: 'cfg-multiplayer', label: 'Multiplayer' },
      { id: 'cfg-minimap', label: 'Minimap' },
    ],
    'Social & Community': [
      { id: 'cfg-account', label: 'Account' }, { id: 'cfg-chat', label: 'Chat' },
      { id: 'cfg-social', label: 'Social' }, { id: 'cfg-clans', label: 'Clans' },
      { id: 'cfg-moderation', label: 'Moderation' }, { id: 'cfg-monetization', label: 'Monetization' },
      { id: 'cfg-bot-policy', label: 'Bot Policy' },
    ],
    'Accessibility & Infra': [
      { id: 'cfg-accessibility', label: 'Accessibility' }, { id: 'cfg-localization', label: 'Localization' },
      { id: 'cfg-security', label: 'Security' }, { id: 'cfg-integrations', label: 'Integrations' },
      { id: 'cfg-pipeline', label: 'Content Pipeline' },
    ],
  },
  reference: {
    'Catalogs': [
      { id: 'ref-nature', label: 'Nature Catalog' }, { id: 'ref-structures', label: 'Structures Catalog' },
      { id: 'ref-architecture', label: 'Architecture Styles' },
    ],
    'Design': [
      { id: 'ref-plugins', label: 'Plugin Registry' }, { id: 'ref-audit', label: 'Plugin Audit' },
      { id: 'ref-philosophy', label: 'Philosophy' },
    ],
  },
};

// Flat lookup: tabId → { mode, category, label, dropzone }
const TAB_LOOKUP = {};
for (const [mode, categories] of Object.entries(TAB_REGISTRY)) {
  for (const [category, tabs] of Object.entries(categories)) {
    for (const tab of tabs) {
      TAB_LOOKUP[tab.id] = { mode, category, label: tab.label, dropzone: tab.dropzone || 'config' };
    }
  }
}

function listTabs() { return TAB_REGISTRY; }
function getTab(tabId) { return TAB_LOOKUP[tabId] || null; }
function getAllTabIds() { return Object.keys(TAB_LOOKUP); }

// ══════════════════════════════════════════════════════════════════════════════
// PLAYABLE CONTENT REGISTRY — bosses/instances that can be started via /api/rl
// ══════════════════════════════════════════════════════════════════════════════

const PLAYABLE = {};

function registerPlayable(typeId, config) {
  PLAYABLE[typeId] = {
    name: config.name,
    description: config.description || '',
    source: config.source || 'hardcoded',
    startFn: config.startFn,
    challenges: config.challenges || {},
    mobDefs: config.mobDefs || [],
    phases: config.phases || null,
    loadout: config.loadout || {},
    actionSpace: config.actionSpace || [],
    computeReward: config.computeReward || defaultReward,
  };
}

function listPlayable() {
  const result = {};
  for (const [id, cfg] of Object.entries(PLAYABLE)) {
    result[id] = {
      name: cfg.name, description: cfg.description, source: cfg.source,
      challenges: cfg.challenges, phases: cfg.phases,
      mob_types: cfg.mobDefs,
      action_count: cfg.actionSpace.length,
    };
  }
  return result;
}

function getPlayable(typeId) { return PLAYABLE[typeId] || null; }

// ══════════════════════════════════════════════════════════════════════════════
// RL PLAYER CREATION — generic, loadout-driven
// ══════════════════════════════════════════════════════════════════════════════

const ALL_SKILLS = ['attack','strength','defence','hitpoints','ranged','magic','prayer',
  'runecrafting','construction','agility','herblore','thieving','crafting',
  'fletching','slayer','hunter','mining','smithing','fishing','cooking',
  'firemaking','woodcutting','farming'];

// Track whether RL tick phases are registered
let _rlTicksRegistered = false;
let _rlPlayer = null;

function _ensureRlTicks() {
  if (_rlTicksRegistered) return;
  _rlTicksRegistered = true;
  const npcsModule = require('../world/npcs');
  // Register NPC tick phases
  tick.registerPhase('preTick', 'rl_npc_timers', (ct) => { npcsModule.npcTimerTick(ct); });
  tick.registerPhase('npcMovement', 'rl_npc_movement', (ct) => { npcsModule.npcMovementTick(ct); });
  // Register player tick phases — uses the current _rlPlayer
  tick.onTick('rl_movement', (ct) => { if (_rlPlayer) gameLoop.playerMovementTick(_rlPlayer, ct, () => {}); });
  tick.onTick('rl_combat', (ct) => { if (_rlPlayer) gameLoop.playerCombatTick(_rlPlayer, ct, () => {}); });
  tick.onTick('rl_world', (ct) => { if (_rlPlayer) gameLoop.playerWorldTick(_rlPlayer, ct, () => {}); });
}

function setActiveRlPlayer(p) { _rlPlayer = p; }

function createRlPlayer(typeId, playerName) {
  const config = PLAYABLE[typeId];
  if (!config) throw new Error(`Unknown playable type: ${typeId}`);
  const loadout = config.loadout;

  const p = player.createPlayer(Date.now() % 100000, playerName || 'rl_bot');

  // Stats
  const level = loadout.level || 99;
  const hpLevel = loadout.hpLevel || level;
  for (const skill of ALL_SKILLS) {
    p.skills[skill] = { level, xp: 13034431 };
  }
  p.skills.hitpoints = { level: hpLevel, xp: 13034431 };
  p.hp = hpLevel; p.maxHp = hpLevel;
  p.prayerPoints = level;
  p.admin = true;
  p.activePrayers = new Set();
  p.running = false;
  p.runEnergy = 10000;
  p.inventory = new Array(28).fill(null);
  p.equipment = {};
  p.boosts = {};
  p.path = [];
  p.combatTarget = null;
  p.busy = false;
  p.autoRetaliate = true;

  // Equip gear
  const equip = (name) => {
    const def = items.find(name);
    if (def && def.equipSlot) {
      p.equipment[def.equipSlot] = { id: def.id, name: def.name, stats: def.stats, count: 1 };
    }
  };
  for (const name of (loadout.equipment || [])) equip(name);

  // Ammo
  if (loadout.ammo) {
    const def = items.find(loadout.ammo.name);
    if (def) p.equipment.ammo = { id: def.id, name: def.name, stats: def.stats, count: loadout.ammo.count || 500 };
  }

  // Inventory items
  const addItem = (name, count) => {
    const def = items.find(name);
    if (!def) return;
    for (let i = 0; i < count; i++) {
      const slot = p.inventory.findIndex(s => s === null);
      if (slot >= 0) p.inventory[slot] = { id: def.id, name: def.name, count: 1 };
    }
  };
  for (const inv of (loadout.inventory || [])) addItem(inv.name, inv.count || 1);

  // Stackable items
  const addStack = (name, count) => {
    const def = items.find(name);
    if (!def) return;
    const slot = p.inventory.findIndex(s => s === null);
    if (slot >= 0) p.inventory[slot] = { id: def.id, name: def.name, count, stackable: true };
  };
  for (const stack of (loadout.stacks || [])) addStack(stack.name, stack.count);

  // Starting prayers
  for (const prayer of (loadout.prayers || [])) p.activePrayers.add(prayer);

  return p;
}

// ══════════════════════════════════════════════════════════════════════════════
// ACTION EXECUTION — generic, action-space-driven
// ══════════════════════════════════════════════════════════════════════════════

// Shared action implementations
function drinkPotion(p, potionName) {
  const currentTick = tick.getTick();
  if (p.nextDrinkTick && currentTick < p.nextDrinkTick) return;
  const slot = p.inventory.findIndex(s => s && s.name.toLowerCase().includes(potionName));
  if (slot < 0) return;
  const item = p.inventory[slot];
  const doseMatch = item.name.match(/\((\d)\)$/);
  if (!doseMatch) return;
  const dose = parseInt(doseMatch[1]);
  if (dose > 1) {
    p.inventory[slot] = { ...item, name: item.name.replace(/\(\d\)$/, `(${dose - 1})`) };
  } else {
    p.inventory[slot] = { id: 325, name: 'Vial', count: 1 };
  }
  if (potionName.includes('saradomin brew')) {
    p.hp = Math.min(p.maxHp, p.hp + 16);
  } else if (potionName.includes('super restore')) {
    const restore = Math.floor(8 + (p.skills?.prayer?.level || 99) * 0.25);
    p.prayerPoints = Math.min(p.skills?.prayer?.level || 99, p.prayerPoints + restore);
  }
  p.nextDrinkTick = currentTick + 3;
}

// Standard action builders — returns { id, name, desc, execute(p, inst) }
const STANDARD_ACTIONS = {
  noop:        { name: 'noop', desc: 'Do nothing', execute: () => {} },
  brew:        { name: 'brew', desc: 'Drink Saradomin brew', execute: (p) => drinkPotion(p, 'saradomin brew') },
  restore:     { name: 'restore', desc: 'Drink Super restore', execute: (p) => drinkPotion(p, 'super restore') },
  move_n:      { name: 'move_n', desc: 'Move north', execute: (p) => commands.execute(p, 'n') },
  move_s:      { name: 'move_s', desc: 'Move south', execute: (p) => commands.execute(p, 's') },
  move_e:      { name: 'move_e', desc: 'Move east', execute: (p) => commands.execute(p, 'e') },
  move_w:      { name: 'move_w', desc: 'Move west', execute: (p) => commands.execute(p, 'w') },
  pray_mage:   { name: 'pray_mage', desc: 'Protect from Magic', execute: (p) => {
    if (p.prayerPoints <= 0) return;
    p.activePrayers.delete('protect_from_missiles');
    p.activePrayers.delete('protect_from_melee');
    p.activePrayers.add('protect_from_magic');
  }},
  pray_range:  { name: 'pray_range', desc: 'Protect from Missiles', execute: (p) => {
    if (p.prayerPoints <= 0) return;
    p.activePrayers.delete('protect_from_magic');
    p.activePrayers.delete('protect_from_melee');
    p.activePrayers.add('protect_from_missiles');
  }},
  pray_melee:  { name: 'pray_melee', desc: 'Protect from Melee', execute: (p) => {
    if (p.prayerPoints <= 0) return;
    p.activePrayers.delete('protect_from_magic');
    p.activePrayers.delete('protect_from_missiles');
    p.activePrayers.add('protect_from_melee');
  }},
  target_nearest: { name: 'target_nearest', desc: 'Target nearest mob', execute: (p, inst) => {
    const alive = npcs.getNpcsInInstance(inst.id).sort((a, b) =>
      Math.max(Math.abs(a.x - p.x), Math.abs(a.y - p.y)) -
      Math.max(Math.abs(b.x - p.x), Math.abs(b.y - p.y)));
    if (alive[0]) { p.combatTarget = alive[0].id; p.busy = true; }
  }},
  target_boss: { name: 'target_boss', desc: 'Target the boss', execute: (p, inst) => {
    const alive = npcs.getNpcsInInstance(inst.id);
    const boss = alive.reduce((a, b) => (b.maxHp || 0) > (a?.maxHp || 0) ? b : a, null);
    if (boss) { p.combatTarget = boss.id; p.busy = true; }
  }},
  target_adds: { name: 'target_adds', desc: 'Target nearest add', execute: (p, inst) => {
    const alive = npcs.getNpcsInInstance(inst.id)
      .filter(n => n.maxHp < 200) // adds are smaller than bosses
      .sort((a, b) => Math.max(Math.abs(a.x - p.x), Math.abs(a.y - p.y)) -
                       Math.max(Math.abs(b.x - p.x), Math.abs(b.y - p.y)));
    if (alive[0]) { p.combatTarget = alive[0].id; p.busy = true; }
  }},
};

function buildActionSpace(actionNames) {
  return actionNames.map((name, id) => {
    const action = STANDARD_ACTIONS[name];
    if (!action) return { id, name, desc: name, execute: () => {} };
    return { id, name: action.name, desc: action.desc, execute: action.execute };
  });
}

function executeAction(p, typeId, actionId, inst) {
  const config = PLAYABLE[typeId];
  if (!config) return;
  const action = config.actionSpace[actionId];
  if (action && action.execute) action.execute(p, inst);
  // Re-assert combat state
  if (p.combatTarget && npcs.getNpc(p.combatTarget) && !npcs.getNpc(p.combatTarget).dead) {
    p.busy = true;
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// OBSERVATION BUILDER — generic, works for any instance
// ══════════════════════════════════════════════════════════════════════════════

function buildObservation(p, inst) {
  const currentTick = tick.getTick();
  const alive = inst ? npcs.getNpcsInInstance(inst.id) : [];
  const entities = inst ? require('../world/entities').getInInstance(inst.id) : [];

  // NPC list
  const npcList = alive.filter(n => !n.dead).map(n => ({
    name: n.name, def_id: n.defId,
    hp: n.hp, max_hp: n.maxHp,
    x: n.x, y: n.y, size: n.size || 1,
    attack_style: n.attackStyle || 'melee',
    attack_range: n.attackRange || 1,
    max_hit: n.maxHit || 0,
    ticks_to_attack: Math.max(0, (n.nextAttackTick === Infinity ? currentTick + 99 : n.nextAttackTick) - currentTick),
    custom_state: n.customState || {},
  }));

  // Entity list
  const entityList = entities.filter(e => !e.dead).map(e => ({
    name: e.name, type: e.type,
    hp: e.hp, max_hp: e.maxHp,
    x: e.x, y: e.y, size: e.size || 1,
  }));

  // Projectiles targeting player
  const incoming = projectiles.getTargeting ? projectiles.getTargeting(p.id).map(proj => ({
    source: proj.sourceName || 'unknown',
    style: proj.prayerStyle || proj.type || 'unknown',
    damage: proj.damage || 0,
    ticks_to_land: Math.max(0, (proj.landTick || 0) - currentTick),
  })) : [];

  // Instance status
  const status = inst ? instances.getStatus(inst) : {};

  return {
    instance_id: inst?.id,
    type: inst?.type,
    state: inst?.state || 'unknown',
    tick: currentTick,
    wave: status.wave || 0,
    total_waves: status.totalWaves || 0,
    ticks_elapsed: status.ticksElapsed || 0,
    kills: inst?.kills || 0,
    npcs: npcList,
    entities: entityList,
    projectiles: incoming,
    player: {
      x: p.x, y: p.y,
      hp: p.hp, max_hp: p.maxHp,
      pp: p.prayerPoints, max_pp: p.skills?.prayer?.level || 99,
      prayers: [...(p.activePrayers || [])],
      weapon: p.equipment?.weapon?.name || 'None',
      target: p.combatTarget ? (npcs.getNpc(p.combatTarget)?.name || '') : '',
      target_hp: p.combatTarget ? (npcs.getNpc(p.combatTarget)?.hp || 0) : 0,
      target_max_hp: p.combatTarget ? (npcs.getNpc(p.combatTarget)?.maxHp || 0) : 0,
      inventory: p.inventory.map(s => s ? { name: s.name, count: s.count || 1 } : null),
      equipment: Object.fromEntries(
        Object.entries(p.equipment || {}).map(([slot, item]) => [slot, item?.name || null])
      ),
    },
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// REWARD — default, can be overridden per content type
// ══════════════════════════════════════════════════════════════════════════════

function defaultReward(prev, next) {
  let reward = 0;
  if (next.complete) return 1000.0;
  if (next.dead) return -50.0;

  // Boss damage dealt
  const prevBossHp = prev.npcs?.reduce((s, n) => s + (n.max_hp > 100 ? n.hp : 0), 0) || 0;
  const nextBossHp = next.npcs?.reduce((s, n) => s + (n.max_hp > 100 ? n.hp : 0), 0) || 0;
  const bossDmg = Math.max(0, prevBossHp - nextBossHp);
  reward += 2.0 * bossDmg;

  // Player damage taken
  const hpLost = Math.max(0, (prev.player?.hp || 0) - (next.player?.hp || 0));
  reward -= 1.5 * hpLost;

  // Survival tick
  reward += 0.03;

  // No damage penalty
  if (bossDmg === 0) reward -= 0.5;

  // Correct prayer
  for (const proj of (next.projectiles || [])) {
    if (proj.ticks_to_land <= 1) {
      const prayers = next.player?.prayers || [];
      const prayerMap = { magic: 'protect_from_magic', ranged: 'protect_from_missiles', melee: 'protect_from_melee' };
      if (prayers.includes(prayerMap[proj.style])) reward += 1.0;
    }
  }

  return reward;
}

// ══════════════════════════════════════════════════════════════════════════════
// REGISTER HARDCODED CONTENT
// ══════════════════════════════════════════════════════════════════════════════

// ── Inferno ──
registerPlayable('inferno', {
  name: 'The Inferno',
  description: '69-wave gauntlet ending with TzKal-Zuk',
  source: 'hardcoded',
  challenges: {
    full:     { startWave: 1,  endWave: 69, description: 'Full Inferno run (waves 1-69)' },
    wave35:   { startWave: 35, endWave: 35, description: 'Wave 35 - First Mager' },
    wave63:   { startWave: 63, endWave: 63, description: 'Wave 63 - All Mobs' },
    jads:     { startWave: 68, endWave: 68, description: 'Triple Jads' },
    zuk:      { startWave: 69, endWave: 69, description: 'TzKal-Zuk' },
    gauntlet: { startWave: 63, endWave: 69, description: 'Waves 63-69' },
  },
  mobDefs: ['jal_nib', 'jal_mejrah', 'jal_ak', 'jal_imkot', 'jal_xil', 'jal_zek', 'jal_tok_jad', 'tzkal_zuk', 'yt_hur_kot', 'jal_mej_jak'],
  phases: { min: 1, max: 69, label: 'wave' },
  loadout: {
    level: 99, hpLevel: 99,
    equipment: ['Armadyl helmet', "Ava's assembler", 'Necklace of anguish', 'Armadyl crossbow', 'Crystal body', 'Crystal shield', 'Crystal legs', 'Barrows gloves', 'Pegasian boots', 'Archers ring (i)'],
    ammo: { name: 'Dragon bolts (e)', count: 500 },
    inventory: [
      { name: 'Saradomin brew(4)', count: 6 }, { name: 'Super restore(4)', count: 12 },
      { name: 'Bastion potion(4)', count: 2 }, { name: 'Stamina potion(4)', count: 1 },
      { name: 'Toxic blowpipe', count: 1 }, { name: 'Kodai wand', count: 1 },
      { name: 'Occult necklace', count: 1 }, { name: "Ahrim's robe top", count: 1 }, { name: "Ahrim's robe bottom", count: 1 },
    ],
    stacks: [{ name: 'Blood rune', count: 8000 }, { name: 'Death rune', count: 8000 }],
    prayers: ['protect_from_magic', 'rigour'],
  },
  actionSpace: buildActionSpace([
    'noop', 'brew', 'restore', 'move_n', 'move_s', 'move_e', 'move_w',
    'target_nearest', 'noop', 'noop', 'pray_mage', 'pray_range', 'pray_melee',
  ]),
  startFn: (player, sendFn, opts) => {
    const inferno = require('../content/inferno/inferno');
    return inferno.startInferno(player, sendFn, opts);
  },
});

// ── Crystal Wyrm ──
registerPlayable('crystal_wyrm', {
  name: 'Crystal Wyrm',
  description: '3-phase boss fight in a crystal arena',
  source: 'hardcoded',
  challenges: {
    full: { description: 'Full Crystal Wyrm fight' },
  },
  mobDefs: ['crystal_wyrm', 'crystallite'],
  phases: { count: 3, names: ['Crystal Shell', 'Shattered Core', 'Enraged'] },
  loadout: {
    level: 99, hpLevel: 99,
    equipment: ['Armadyl helmet', "Ava's assembler", 'Necklace of anguish', 'Armadyl crossbow', 'Crystal body', 'Crystal legs', 'Barrows gloves', 'Pegasian boots'],
    ammo: { name: 'Dragon bolts (e)', count: 500 },
    inventory: [
      { name: 'Saradomin brew(4)', count: 8 }, { name: 'Super restore(4)', count: 8 },
      { name: 'Toxic blowpipe', count: 1 }, { name: 'Rune scimitar', count: 1 },
    ],
    prayers: ['protect_from_missiles', 'rigour'],
  },
  actionSpace: buildActionSpace([
    'noop', 'brew', 'restore', 'move_n', 'move_s', 'move_e', 'move_w',
    'target_boss', 'target_adds', 'pray_mage', 'pray_range', 'pray_melee', 'noop',
  ]),
  startFn: (player, sendFn, opts) => {
    const cw = require('../content/crystal_wyrm/crystal_wyrm');
    return cw.startCrystalWyrm(player, sendFn, opts);
  },
});

// ══════════════════════════════════════════════════════════════════════════════
// EVENT SYSTEM — instance event bus
// ══════════════════════════════════════════════════════════════════════════════

const eventSubscribers = new Map(); // instanceId → Set<callback>
const eventBuffers = new Map();     // instanceId → [events]

function emitInstanceEvent(instanceId, eventType, data) {
  const event = { event: eventType, instance_id: instanceId, tick: tick.getTick(), ...data };

  // Buffer for polling
  if (!eventBuffers.has(instanceId)) eventBuffers.set(instanceId, []);
  const buf = eventBuffers.get(instanceId);
  buf.push(event);
  if (buf.length > 500) buf.shift();

  // Notify SSE subscribers
  const subs = eventSubscribers.get(instanceId);
  if (subs) {
    const sseData = `event: ${eventType}\ndata: ${JSON.stringify(event)}\n\n`;
    for (const res of subs) {
      try { res.write(sseData); } catch { subs.delete(res); }
    }
  }
}

function subscribeSSE(instanceId, res) {
  if (!eventSubscribers.has(instanceId)) eventSubscribers.set(instanceId, new Set());
  eventSubscribers.get(instanceId).add(res);
  res.on('close', () => {
    const subs = eventSubscribers.get(instanceId);
    if (subs) { subs.delete(res); if (subs.size === 0) eventSubscribers.delete(instanceId); }
  });
}

function drainEvents(instanceId) {
  const events = eventBuffers.get(instanceId) || [];
  eventBuffers.set(instanceId, []);
  return events;
}

function cleanupInstance(instanceId) {
  eventBuffers.delete(instanceId);
  eventSubscribers.delete(instanceId);
}

// ══════════════════════════════════════════════════════════════════════════════

module.exports = {
  // Tab registry
  TAB_REGISTRY, TAB_LOOKUP, listTabs, getTab, getAllTabIds,
  // Playable content
  PLAYABLE, registerPlayable, listPlayable, getPlayable,
  // RL
  createRlPlayer, executeAction, buildObservation, buildActionSpace, defaultReward,
  _ensureRlTicks, setActiveRlPlayer,
  // Events
  emitInstanceEvent, subscribeSSE, drainEvents, cleanupInstance,
};
